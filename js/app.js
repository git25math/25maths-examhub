/* ══════════════════════════════════════════════════════════════
   app.js — Application entry point: init + URL parameter handling
   ══════════════════════════════════════════════════════════════ */

/* ═══ GLOBAL ERROR BOUNDARY (v5.13.2) ═══ */
try {
  window.onerror = function(msg, src, line, col, err) {
    try { console.error('[ExamHub]', msg, src + ':' + line + ':' + col, err); } catch (e) {}
    return false;
  };
  window.addEventListener('unhandledrejection', function(ev) {
    try {
      var reason = ev.reason || {};
      var msg = reason.message || String(reason);
      console.error('[ExamHub] Unhandled rejection:', msg);
      if (/Failed to fetch|NetworkError|fetch/i.test(msg)) {
        if (typeof showToast === 'function') showToast(typeof t === 'function' ? t('Network error, please retry', '网络错误，请重试') : 'Network error');
      }
    } catch (e) {}
  });
} catch (e) {}

onLevelsReady(function() {
(async function initApp() {
  /* Session start timestamp for hidden badges */
  if (!sessionStorage.getItem('wmatch_session_start')) {
    sessionStorage.setItem('wmatch_session_start', String(Date.now()));
  }
  updateAuthLang();
  /* migrateForceUnlock is called after each syllabus board loads (syllabus.js) */
  /* Load custom levels from storage */
  var custom = getCustomLevels();
  if (custom.length > 0) {
    LEVELS = LEVELS.concat(custom);
  }

  /* Listen for password recovery callback */
  if (sb) {
    sb.auth.onAuthStateChange(function(event, session) {
      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(function() { _lazyCall('settings', 'showSettings', []); showToast(t('Set your new password', '请设置新密码')); }, 500);
      }
    });
  }

  /* Check for existing Supabase session (5s timeout to prevent blank page) */
  if (sb) {
    try {
      var sess = await Promise.race([
        sb.auth.getSession(),
        new Promise(function(resolve) {
          setTimeout(function() { resolve({ data: { session: null } }); }, 5000);
        })
      ]);
      if (sess.data.session) {
        var sessMeta = sess.data.session.user.user_metadata || {};
        currentUser = {
          email: sess.data.session.user.email,
          id: sess.data.session.user.id,
          nickname: sessMeta.nickname || ''
        };
        if (sessMeta.board) userBoard = sessMeta.board;
        if (sessMeta.class_id) userClassId = sessMeta.class_id;
        if (sessMeta.school_id) userSchoolId = sessMeta.school_id;
        try { localStorage.setItem('wmatch_login_ts', '' + Date.now()); } catch(e) {}
        await syncFromCloud();

        /* Reload custom levels after cloud sync */
        var customAfterSync = getCustomLevels();
        if (customAfterSync.length > custom.length) {
          LEVELS = LEVELS.slice(0, LEVELS.length - custom.length).concat(customAfterSync);
        }

        await afterLogin();

        /* Past paper wrong book reminder */
        if (typeof ppCheckWrongBookReminder === 'function') ppCheckWrongBookReminder();

        /* Handle ?level= URL parameter for deep linking (slug first, index fallback) */
        var params = new URLSearchParams(window.location.search);
        var lvlParam = params.get('level');
        if (lvlParam !== null) {
          var found = getLevelIdxBySlug(lvlParam);
          if (found === -1) {
            var lvlIdx = parseInt(lvlParam, 10);
            if (!isNaN(lvlIdx) && lvlIdx >= 0 && lvlIdx < LEVELS.length) found = lvlIdx;
          }
          if (found >= 0) openDeck(found);
        }

        /* Recover from iOS page eviction after share (slug-based) */
        try {
          var shareLvl = sessionStorage.getItem('wmatch_share_lvl');
          if (shareLvl !== null) {
            sessionStorage.removeItem('wmatch_share_lvl');
            var sFound = getLevelIdxBySlug(shareLvl);
            if (sFound === -1) {
              var sIdx = parseInt(shareLvl, 10);
              if (!isNaN(sIdx) && sIdx >= 0 && sIdx < LEVELS.length) sFound = sIdx;
            }
            if (sFound >= 0) openDeck(sFound);
          }
        } catch(e) {}

        return;
      }
    } catch (e) {
      /* Supabase error — fall through to auth screen */
    }
  }

  /* No session — show auth screen */
  try { localStorage.removeItem('wmatch_login_ts'); } catch(e) {}
  var hideStyle = document.getElementById('auth-hide-style');
  if (hideStyle) hideStyle.remove();
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
})();
});

/* ═══ BOARD STATE (shared with board-guides.js via global scope) ═══ */
var _boardScope = 'course';    /* 'course' | 'class' | 'grade' | 'school' */
var _boardSubKey = null;       /* currently selected sub pill value */
var _boardClassList = null;    /* cached classes list [{id, name, grade}] */
var _boardClassListTs = 0;     /* cache timestamp */

/* ═══ PWA: OFFLINE DETECTION + INSTALL PROMPT ═══ */

var _pwaInstallPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaInstallPrompt = e;
  _showInstallHint();
});

function _showInstallHint() {
  /* Show a subtle install hint on home page if not already installed */
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  var el = document.getElementById('pwa-install-hint');
  if (el) el.style.display = '';
}

function pwaInstall() {
  if (!_pwaInstallPrompt) return;
  _pwaInstallPrompt.prompt();
  _pwaInstallPrompt.userChoice.then(function(result) {
    if (result.outcome === 'accepted') {
      showToast(t('App installed!', '\u5e94\u7528\u5df2\u5b89\u88c5\uff01'));
    }
    _pwaInstallPrompt = null;
    var el = document.getElementById('pwa-install-hint');
    if (el) el.style.display = 'none';
  });
}

/* Offline/online status */
window.addEventListener('online', function() {
  showToast(t('Back online', '\u5df2\u6062\u590d\u7f51\u7edc'));
  document.body.classList.remove('is-offline');
});

window.addEventListener('offline', function() {
  showToast(t('You are offline', '\u5f53\u524d\u65e0\u7f51\u7edc'));
  document.body.classList.add('is-offline');
});

if (!navigator.onLine) {
  document.body.classList.add('is-offline');
}

/* ═══ KEYBOARD SHORTCUTS ═══ */
document.addEventListener('keydown', function(e) {
  /* Skip if user is typing in an input/textarea */
  var tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
  /* Skip if a modal is open */
  var modal = document.getElementById('modal-overlay');
  if (modal && modal.classList.contains('vis')) return;

  var key = e.key;

  /* ── Scan mode (panel-study) ── */
  if (appView === 'study') {
    if (key === '1') {
      if (typeof rateScan === 'function') rateScan('known');
    } else if (key === '2') {
      if (typeof rateScan === 'function') rateScan('fuzzy');
    } else if (key === '3') {
      if (typeof rateScan === 'function') rateScan('unknown');
    }
    return;
  }

  /* ── Quiz mode (panel-quiz) ── */
  if (appView === 'quiz') {
    var idx = -1;
    if (key === '1') idx = 0;
    else if (key === '2') idx = 1;
    else if (key === '3') idx = 2;
    else if (key === '4') idx = 3;
    if (idx >= 0) {
      var opts = document.querySelectorAll('#quiz-options .quiz-opt');
      if (opts[idx]) opts[idx].click();
    }
    return;
  }

  /* ── Daily Challenge (panel-daily) ── */
  if (appView === 'daily') {
    var dIdx = -1;
    if (key === '1') dIdx = 0;
    else if (key === '2') dIdx = 1;
    else if (key === '3') dIdx = 2;
    else if (key === '4') dIdx = 3;
    if (dIdx >= 0) {
      var dOpts = document.querySelectorAll('#dc-options .quiz-opt');
      if (dOpts[dIdx]) dOpts[dIdx].click();
    }
    return;
  }
});
