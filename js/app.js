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

/* ═══ LEADERBOARD ═══ */
var _boardScope = 'course';    /* 'course' | 'class' | 'grade' | 'school' */
var _boardSubKey = null;       /* currently selected sub pill value */
var _boardClassList = null;    /* cached classes list [{id, name, grade}] */
var _boardClassListTs = 0;     /* cache timestamp */

/* Load classes for current school (30s cache) */
async function _loadBoardClasses() {
  if (!sb || !userSchoolId) return [];
  var now = Date.now();
  if (_boardClassList && (now - _boardClassListTs) < 30000) return _boardClassList;
  try {
    var res = await sb.from('kw_classes')
      .select('id, name, grade')
      .eq('school_id', userSchoolId)
      .order('created_at', { ascending: true });
    _boardClassList = res.data || [];
    _boardClassListTs = now;
  } catch (e) {
    _boardClassList = [];
  }
  return _boardClassList;
}

async function renderBoard() {
  var panel = E('panel-board');
  var gs = getGlobalStats();
  var streakN = typeof getStreakCount === 'function' ? getStreakCount() : 0;

  /* Teacher view: keep existing teacher account notice */
  if (isTeacher()) {
    panel.innerHTML = '<div class="section-title">\ud83c\udfeb ' + t('Teacher Account', '\u6559\u5e08\u8d26\u53f7') + '</div>' +
      '<div class="text-center text-muted" style="padding:40px 0">' +
      t('Use the Admin panel to view student progress.', '\u8bf7\u4f7f\u7528\u7ba1\u7406\u9762\u677f\u67e5\u770b\u5b66\u751f\u8fdb\u5ea6\u3002') + '</div>';
    return;
  }

  /* Guest view: simplified growth + signup CTA */
  if (isGuest()) {
    var gHtml = '<div class="section-title">\ud83c\udf31 ' + t('My Growth', '\u6211\u7684\u6210\u957f') + '</div>';
    gHtml += _renderGrowthOverview(gs, streakN);
    gHtml += '<div class="text-center mt-20" style="padding:20px;background:var(--c-surface);border-radius:var(--r-lg);box-shadow:var(--shadow)">';
    gHtml += '<div class="mb-8" style="font-size:24px">\u2728</div>';
    gHtml += '<div class="text-sub mb-12" style="font-size:14px">' + t('Register to save your progress!', '\u6ce8\u518c\u8d26\u53f7\u4fdd\u5b58\u4f60\u7684\u5b66\u4e60\u8fdb\u5ea6\uff01') + '</div>';
    gHtml += '<button class="btn btn-primary" onclick="doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
    gHtml += '</div>';
    panel.innerHTML = gHtml;
    return;
  }

  /* Student growth dashboard */
  var html = '<div class="section-title">\ud83c\udf31 ' + t('My Growth', '\u6211\u7684\u6210\u957f') + '</div>';
  html += _renderGrowthOverview(gs, streakN);

  /* Achievements badge grid */
  if (typeof _renderBadgeSection === 'function') {
    html += _renderBadgeSection();
  } else if (typeof BADGES !== 'undefined' && typeof getUnlockedBadges === 'function') {
    var unlocked = getUnlockedBadges();
    html += '<div class="section-title mt-24">' + t('Achievements', '\u6210\u5c31\u5fbd\u7ae0') + '</div>';
    html += '<div class="badge-grid">';
    BADGES.forEach(function(b) {
      var isUnlocked = unlocked.indexOf(b.id) >= 0;
      if (b.hidden && !isUnlocked) {
        html += '<div class="badge-item badge-hidden"><span class="badge-icon">\u2753</span><span class="badge-name">???</span></div>';
      } else {
        html += '<div class="badge-item' + (isUnlocked ? ' unlocked' : '') + '"><span class="badge-icon">' + b.icon + '</span><span class="badge-name">' + t(b.en, b.zh) + '</span></div>';
      }
    });
    html += '</div>';
  }

  /* Learning milestones — recent badge timeline */
  var badges = [];
  try {
    var raw = JSON.parse(localStorage.getItem('wmatch_badges'));
    if (raw && typeof raw === 'object') {
      for (var bid in raw) {
        if (raw[bid]) badges.push({ id: bid, ts: raw[bid] });
      }
      badges.sort(function(a, b) { return b.ts - a.ts; });
      badges = badges.slice(0, 5);
    }
  } catch(e) {}
  if (badges.length > 0 && typeof BADGES !== 'undefined') {
    html += '<div class="section-title mt-24">' + t('Recent Milestones', '\u8fd1\u671f\u91cc\u7a0b\u7891') + '</div>';
    html += '<div class="growth-milestones">';
    badges.forEach(function(entry) {
      var bDef = null;
      BADGES.forEach(function(b) { if (b.id === entry.id) bDef = b; });
      if (!bDef) return;
      var d = new Date(entry.ts);
      var dateStr = d.toLocaleDateString(appLang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
      html += '<div class="milestone-row">';
      html += '<span class="milestone-icon">' + bDef.icon + '</span>';
      html += '<span class="milestone-name">' + t(bDef.en, bDef.zh) + '</span>';
      html += '<span class="milestone-date">' + dateStr + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  panel.innerHTML = html;
}

/* Growth overview cards with progress bars */
function _renderGrowthOverview(gs, streakN) {
  var html = '<div class="growth-overview">';
  /* Vocab progress */
  var vocabPct = gs.total > 0 ? Math.round(gs.mastered / gs.total * 100) : 0;
  html += '<div class="growth-card">';
  html += '<div class="growth-card-header"><span>\ud83d\udcd6 ' + t('Vocabulary', '\u8bcd\u6c47') + '</span><span class="growth-card-num">' + gs.mastered + ' / ' + gs.total + '</span></div>';
  html += '<div class="growth-bar"><div class="growth-bar-fill" style="width:' + vocabPct + '%"></div></div>';
  html += '</div>';
  /* KP progress */
  var kpPct = gs.kpTotal > 0 ? Math.round(gs.kpMastered / gs.kpTotal * 100) : 0;
  html += '<div class="growth-card">';
  html += '<div class="growth-card-header"><span>\ud83e\udde0 ' + t('Knowledge Points', '\u77e5\u8bc6\u70b9') + '</span><span class="growth-card-num">' + gs.kpMastered + ' / ' + gs.kpTotal + '</span></div>';
  html += '<div class="growth-bar"><div class="growth-bar-fill" style="width:' + kpPct + '%"></div></div>';
  html += '</div>';
  /* Streak */
  html += '<div class="growth-card">';
  html += '<div class="growth-card-header"><span>\ud83d\udd25 ' + t('Learning Streak', '\u8fde\u7eed\u5b66\u4e60') + '</span><span class="growth-card-num">' + streakN + t(' days', ' \u5929') + '</span></div>';
  html += '</div>';
  html += '</div>';
  return html;
}

function switchBoardScope(scope) {
  _boardScope = scope;
  _boardSubKey = null; /* reset sub selection — renderBoard will pick default */
  renderBoard();
}

function switchBoardSub(key) {
  _boardSubKey = key;
  renderBoard();
}

/* Board delegation */
document.addEventListener('click', function(e) {
  var bs = e.target.closest('[data-board-scope]');
  if (bs) { switchBoardScope(bs.dataset.boardScope); return; }
  var bsub = e.target.closest('[data-board-sub]');
  if (bsub) { switchBoardSub(bsub.dataset.boardSub); return; }
});

/* ═══ SCORE GUIDE MODAL ═══ */
function showScoreGuide() {
  var cur = getRank();
  var html = '<div class="section-title">\ud83c\udfc6 ' + t('Scoring & Rank Guide', '\u79ef\u5206\u4e0e\u6bb5\u4f4d\u8bf4\u660e') + '</div>';

  /* Section 1 — Star Rating */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\u2b50 ' + t('Star Rating', '\u661f\u7ea7\u8bc4\u5b9a') + '</div>';
  html += '<p class="text-sm text-sub mb-8" style="line-height:1.6;text-align:left">';
  html += t('Each word earns 0\u20134 stars based on correct answers and accuracy:', '\u6bcf\u4e2a\u8bcd\u6c47\u53ef\u83b7\u5f97 0\u20134 \u661f\uff0c\u53d6\u51b3\u4e8e\u7b54\u5bf9\u6b21\u6570\u548c\u6b63\u786e\u7387\uff1a');
  html += '</p>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--primary"></span><span class="srs-row-label">' + t('Base stars', '\u539f\u59cb\u661f\u7ea7') + '</span><span class="srs-row-desc">' + t('= correct count (max 4)', '= \u7b54\u5bf9\u6b21\u6570\uff08\u4e0a\u9650 4\uff09') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--danger"></span><span class="srs-row-label">' + t('Accuracy < 50%', '\u6b63\u786e\u7387 < 50%') + '</span><span class="srs-row-desc">' + t('capped at 2 stars', '\u6700\u9ad8 2 \u661f') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--warning"></span><span class="srs-row-label">' + t('Accuracy 50\u201360%', '\u6b63\u786e\u7387 50\u201360%') + '</span><span class="srs-row-desc">' + t('capped at 3 stars', '\u6700\u9ad8 3 \u661f') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--success"></span><span class="srs-row-label">' + t('Accuracy \u2265 60%', '\u6b63\u786e\u7387 \u2265 60%') + '</span><span class="srs-row-desc">' + t('unlock 4 stars', '\u53ef\u89e3\u9501 4 \u661f') + '</span></div>';
  html += '</div>';

  /* Section 2 — Score Calculation */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\ud83d\udcca ' + t('Score Calculation', '\u79ef\u5206\u8ba1\u7b97') + '</div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--primary"></span><span class="srs-row-label">' + t('Learning %', '\u5b66\u4e60\u8fdb\u5ea6') + '</span><span class="srs-row-desc">' + t('total stars \u00f7 (words \u00d7 4) \u00d7 100%', '\u603b\u661f\u6570 \u00f7 (\u8bcd\u6c47\u6570 \u00d7 4) \u00d7 100%') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--light"></span><span class="srs-row-label">' + t('Score', '\u7efc\u5408\u79ef\u5206') + '</span><span class="srs-row-desc">' + t('learning % \u00d7 20 (max 2000)', '\u5b66\u4e60\u8fdb\u5ea6 \u00d7 20\uff08\u6ee1\u5206 2000\uff09') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot srs-row-dot--success"></span><span class="srs-row-label">' + t('Mastery %', '\u7cbe\u901a\u7387') + '</span><span class="srs-row-desc">' + t('4\u2605 words \u00f7 total words \u00d7 100%', '4\u2605\u8bcd\u6c47\u6570 \u00f7 \u603b\u8bcd\u6c47\u6570 \u00d7 100%') + '</span></div>';
  html += '</div>';

  /* Section 3 — Rank Thresholds */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\ud83c\udfc5 ' + t('Rank Thresholds', '\u6bb5\u4f4d\u95e8\u69db') + '</div>';
  RANKS.forEach(function(r) {
    var isCurrent = r.name === cur.name;
    html += '<div class="rank-row' + (isCurrent ? ' current' : '') + '" style="' + (isCurrent ? 'border-color:' + r.color + ';background:' + r.color + '15' : '') + '">';
    html += '<div class="rank-row-emoji">' + r.emoji + '</div>';
    html += '<div class="rank-row-info">';
    html += '<div class="rank-row-name" style="color:' + r.color + '">' + rankName(r) + '</div>';
    html += '<div class="rank-row-req">' + t('Mastery \u2265 ' + r.min + '%', '\u7cbe\u901a\u7387 \u2265 ' + r.min + '%') + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span class="rank-row-badge">' + t('Current', '\u5f53\u524d') + '</span>';
    html += '</div>';
  });
  html += '</div>';

  /* Section 4 — Tips */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-title">\ud83d\udca1 ' + t('Tips', '\u5c0f\u8d34\u58eb') + '</div>';
  html += '<div class="guide-tip-item">' + t('Master vocabulary, past papers & knowledge points', '\u638c\u63e1\u8bcd\u6c47\u3001\u771f\u9898\u548c\u77e5\u8bc6\u70b9') + '</div>';
  html += '<div class="guide-tip-item">' + t('Follow your daily recovery plan', '\u6bcf\u65e5\u8ddf\u8fdb\u590d\u4e60\u8ba1\u5212') + '</div>';
  html += '<div class="guide-tip-item">' + t('Higher mastery % = auto rank up', '\u7cbe\u901a\u7387\u63d0\u5347 \u2192 \u81ea\u52a8\u664b\u5347\u6bb5\u4f4d') + '</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block mt-16" onclick="hideModal()">' + t('Close', '\u5173\u95ed') + '</button>';
  showModal(html);
}

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
