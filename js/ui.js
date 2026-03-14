/* ══════════════════════════════════════════════════════════════
   ui.js — Panel navigation, Toast, Modal, breakpoint, language
   ══════════════════════════════════════════════════════════════ */

var _lastShareOpts = null;

/* ═══ XSS ESCAPE HELPER ═══ */
function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ═══ NAVIGATION HISTORY STACK ═══ */
var _navStack = [];
var _navMaxDepth = 20;

function navPush(id) {
  if (_navStack.length > 0 && _navStack[_navStack.length - 1] === id) return;
  _navStack.push(id);
  if (_navStack.length > _navMaxDepth) _navStack.shift();
}

function navBack() {
  if (_navStack.length > 1) {
    _navStack.pop(); /* remove current */
    var prev = _navStack[_navStack.length - 1];
    navTo(prev);
  } else {
    navTo('home');
  }
}

/* ═══ PANEL NAVIGATION ═══ */
function _cleanupActiveMode() {
  /* Battle timer */
  if (typeof G !== 'undefined' && G && G.timer) { clearInterval(G.timer); G.timer = null; }
  /* Daily Challenge timer */
  if (typeof DC !== 'undefined' && DC && DC.timer) { clearInterval(DC.timer); DC.timer = null; }
  /* Review search timeout */
  if (typeof _rvSearchTimer !== 'undefined' && _rvSearchTimer) { clearTimeout(_rvSearchTimer); _rvSearchTimer = null; }
  /* KP Scan state cleanup */
  if (typeof _kpScan !== 'undefined' && _kpScan) {
    if (typeof _kpScanKeyHandler === 'function') document.removeEventListener('keydown', _kpScanKeyHandler);
    _kpScan = null;
    if (typeof S !== 'undefined' && S) S._kpScanMode = false;
  }
  /* PP Scan state cleanup */
  if (typeof _ppScanState !== 'undefined' && _ppScanState) {
    if (typeof _ppScanKeyHandler === 'function') document.removeEventListener('keydown', _ppScanKeyHandler);
    _ppScanState = null;
  }
  /* Reset study mode flags (v5.13.2) */
  if (typeof S !== 'undefined' && S) {
    S._refreshMode = S._mistakeMode = S._kpScanMode = S._kpRefreshMode = false;
  }
}

function showPanel(id) {
  _cleanupActiveMode();
  document.querySelectorAll('.panel').forEach(function(p) {
    p.classList.remove('active');
  });
  var el = E('panel-' + id);
  if (el) el.classList.add('active');
  appView = id;
  updateNav();
  /* Track panels visited (hidden badge) */
  try {
    var pv = JSON.parse(localStorage.getItem('wmatch_panels_visited') || '[]');
    if (pv.indexOf(id) < 0) { pv.push(id); localStorage.setItem('wmatch_panels_visited', JSON.stringify(pv)); }
  } catch(e) {}
}

function navTo(id) {
  /* If recovery session is active and user navigates away from scan panels, terminate session */
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    if (id !== 'study' && id !== 'practice') {
      if (typeof skipRecoverySession === 'function') skipRecoverySession();
    }
  }
  navPush(id);
  showPanel(id);
  /* Render content for target panel */
  if (id === 'home') { if (typeof _currentSectionContext !== 'undefined') _currentSectionContext = null; renderHome(); }
  else if (id === 'plan') { _lazyNav('syllabus-views', 'renderTodaysPlan', 'plan'); }
  else if (id === 'mistakes') { _lazyNav('syllabus-views', 'renderMistakeBook', 'mistakes'); }
  else if (id === 'import') { _lazyNav('tools', 'renderImport', 'import'); }
  else if (id === 'board') { _lazyNav('board-guides', 'renderBoard', 'board'); }
  else if (id === 'stats') { _lazyNav('tools', 'renderStats', 'stats'); }
  else if (id === 'admin' && typeof renderAdmin === 'function') renderAdmin();
  else if (id === 'homework') { if (typeof showStudentHwPage === 'function') showStudentHwPage(); }
  else if (id === 'lists') { _lazyNav('lists', 'renderListView', 'lists'); }
  /* section panel is rendered by openSection() directly */
}

/* ═══ LAZY LOADING ═══ */
var _lazyState = {}; /* bundle → 'loading' | 'done' */
var _lazyQueue = {}; /* bundle → [callback, ...] */

function _lazyLoad(bundle, callback) {
  if (_lazyState[bundle] === 'done') { if (callback) callback(); return; }
  if (!_lazyQueue[bundle]) _lazyQueue[bundle] = [];
  if (callback) _lazyQueue[bundle].push(callback);
  if (_lazyState[bundle] === 'loading') return;
  _lazyState[bundle] = 'loading';
  var s = document.createElement('script');
  s.src = 'js/' + bundle + '.min.js?v=' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION.replace('v','') : '0');
  s.onload = function() {
    _lazyState[bundle] = 'done';
    var q = _lazyQueue[bundle] || [];
    _lazyQueue[bundle] = [];
    for (var i = 0; i < q.length; i++) q[i]();
  };
  s.onerror = function() {
    _lazyState[bundle] = null;
    var q = _lazyQueue[bundle] || [];
    _lazyQueue[bundle] = [];
    console.error('[LazyLoad] Failed to load ' + bundle);
    showToast('Failed to load module. Please retry.');
    for (var i = 0; i < q.length; i++) q[i]();
  };
  document.head.appendChild(s);
}

/* Call a global function, lazy-loading its bundle first if needed */
function _lazyCall(bundle, fnName, args) {
  if (typeof window[fnName] === 'function') { window[fnName].apply(null, args || []); return; }
  _lazyLoad(bundle, function() { if (typeof window[fnName] === 'function') window[fnName].apply(null, args || []); });
}

function _showPanelLoading(panelId) {
  var el = E('panel-' + panelId);
  if (el) el.innerHTML = '<div class="empty-state" style="padding:80px 0"><div class="spinner"></div></div>';
}

function _lazyNav(bundle, fnName, panelId) {
  if (typeof window[fnName] === 'function') { window[fnName](); return; }
  _showPanelLoading(panelId);
  _lazyLoad(bundle, function() { if (typeof window[fnName] === 'function') window[fnName](); });
}

function updateNav() {
  /* Sidebar nav */
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.toggle('active', n.dataset.panel === appView);
  });
  /* Bottom nav */
  document.querySelectorAll('.bnav-item').forEach(function(n) {
    n.classList.toggle('active', n.dataset.panel === appView);
  });
  /* i18n nav labels */
  document.querySelectorAll('[data-en][data-zh]').forEach(function(el) {
    if (appLang === 'zh') el.textContent = el.dataset.zh;
    else if (appLang === 'en') el.textContent = el.dataset.en;
    else el.textContent = el.dataset.en + ' ' + el.dataset.zh;
  });
  /* Mistake badge */
  var mc = 0;
  if (typeof _getVocabMistakes === 'function') mc += _getVocabMistakes().length;
  if (typeof _ppGetWB === 'function') {
    var wb = _ppGetWB();
    for (var k in wb) { if (wb[k].status === 'active') mc++; }
  }
  var mkBadges = [E('nav-mk-badge'), E('bnav-mk-badge')];
  mkBadges.forEach(function(b) {
    if (b) {
      b.textContent = mc;
      b.style.display = mc > 0 ? 'inline-block' : 'none';
    }
  });
  /* Plan badge — stale word + KP + PP count */
  var staleN = typeof getStaleCount === 'function' ? getStaleCount() : 0;
  var staleKPN = typeof getStaleKPCount === 'function' ? getStaleKPCount() : 0;
  var stalePPN = typeof getStalePPCount === 'function' ? getStalePPCount() : 0;
  var totalStale = staleN + staleKPN + stalePPN;
  var planBadges = [E('nav-plan-badge'), E('bnav-plan-badge')];
  planBadges.forEach(function(b) {
    if (b) {
      b.textContent = totalStale;
      b.style.display = totalStale > 0 ? 'inline-block' : 'none';
    }
  });
}

/* ═══ TOAST ═══ */
var toastTimer = null;
function showToast(msg) {
  var t = E('toast-el');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    t.classList.remove('show');
  }, 2400);
}

/* ═══ MODAL ═══ */
var _modalPrevFocus = null;
var _modalEscHandler = null;
var _modalTabHandler = null;

function showModal(html) {
  var card = E('modal-card');
  card.innerHTML = html;
  E('modal-overlay').style.display = 'flex';
  /* ARIA: set aria-labelledby to first .section-title if present */
  var title = card.querySelector('.section-title');
  if (title && !title.id) title.id = 'modal-title-auto';
  if (title) E('modal-overlay').setAttribute('aria-labelledby', title.id);
  else E('modal-overlay').removeAttribute('aria-labelledby');

  /* Save previous focus + focus modal */
  _modalPrevFocus = document.activeElement;
  card.setAttribute('tabindex', '-1');
  card.focus();

  /* Remove any existing handlers before adding new ones */
  if (_modalEscHandler) document.removeEventListener('keydown', _modalEscHandler);
  if (_modalTabHandler) document.removeEventListener('keydown', _modalTabHandler);

  /* ESC to close */
  _modalEscHandler = function(e) { if (e.key === 'Escape') hideModal(); };
  document.addEventListener('keydown', _modalEscHandler);

  /* Tab trap within modal-card */
  _modalTabHandler = function(e) {
    if (e.key !== 'Tab') return;
    var focusable = card.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) { e.preventDefault(); return; }
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === card) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', _modalTabHandler);
}

function hideModal() {
  E('modal-overlay').style.display = 'none';
  /* Remove listeners */
  if (_modalEscHandler) { document.removeEventListener('keydown', _modalEscHandler); _modalEscHandler = null; }
  if (_modalTabHandler) { document.removeEventListener('keydown', _modalTabHandler); _modalTabHandler = null; }
  /* Restore focus */
  if (_modalPrevFocus && _modalPrevFocus.isConnected && typeof _modalPrevFocus.focus === 'function') {
    try { _modalPrevFocus.focus(); } catch(e) {}
    _modalPrevFocus = null;
  }
}

E('modal-overlay').addEventListener('click', function(e) {
  if (e.target === E('modal-overlay')) hideModal();
});

/* ═══ LANGUAGE TOGGLE ═══ */
function toggleLang() {
  var LANG_CYCLE = { en: 'zh', zh: 'bilingual', bilingual: 'en' };
  appLang = LANG_CYCLE[appLang] || 'en';
  try { localStorage.setItem('wmatch_lang', appLang); } catch(e) {}
  if (appLang !== 'en') loadCJKFont();
  var LANG_LABELS = { en: '中文', zh: 'EN/中', bilingual: 'EN' };
  var label = LANG_LABELS[appLang];
  /* Sidebar menu item label handled by updateNav() via data-en/data-zh */
  if (E('lang-toggle-hb')) E('lang-toggle-hb').textContent = label;
  /* Sync auth overlay toggle button */
  if (E('auth-lang-toggle')) E('auth-lang-toggle').textContent = label;
  /* Update nav labels immediately */
  updateNav();
  /* Re-render current panel */
  if (appView === 'home') renderHome();
  else if (appView === 'deck') renderDeck(currentLvl);
  else if (appView === 'preview') renderPreview(currentLvl);
  else if (appView === 'plan') { _lazyCall('syllabus-views', 'renderTodaysPlan', []); }
  else if (appView === 'mistakes') { _lazyCall('syllabus-views', 'renderMistakeBook', []); }
  else if (appView === 'import') { _lazyNav('tools', 'renderImport', 'import'); }
  else if (appView === 'board') { _lazyCall('board-guides', 'renderBoard', []); }
  else if (appView === 'stats') { _lazyNav('tools', 'renderStats', 'stats'); }
  else if (appView === 'admin' && typeof renderAdmin === 'function') renderAdmin();
  else if (appView === 'section' && typeof _currentSectionContext === 'object' && _currentSectionContext) {
    openSection(_currentSectionContext.sectionId, _currentSectionContext.board);
  }
  updateSidebar();
}

/* ═══ DARK MODE ═══ */
function applyDark() {
  if (appDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  var icon = appDark ? '\u2600\ufe0f' : '\ud83c\udf19';
  /* Sidebar menu item: update only the .sf-icon span */
  var sbEl = E('dark-toggle-sb');
  if (sbEl) {
    var ic = sbEl.querySelector('.sf-icon');
    if (ic) ic.textContent = icon; else sbEl.textContent = icon;
  }
  /* Sync theme-color meta for PWA / mobile browser chrome */
  var tcMeta = document.querySelector('meta[name="theme-color"]');
  if (tcMeta) tcMeta.setAttribute('content', appDark ? '#0F0E1A' : '#5248C9');
  /* Header bar button: plain text */
  var hbEl = E('dark-toggle-hb');
  if (hbEl) hbEl.textContent = icon;
}

function toggleDark() {
  appDark = !appDark;
  try { localStorage.setItem('wmatch_dark', appDark ? '1' : '0'); } catch (e) {}
  applyDark();
}

applyDark();

/* ═══ SOUND TOGGLE ═══ */
function updateSoundBtn() {
  var icon = appSound ? '\ud83d\udd0a' : '\ud83d\udd07';
  /* Sidebar menu item: update only the .sf-icon span */
  var sbEl = E('sound-toggle-sb');
  if (sbEl) {
    var ic = sbEl.querySelector('.sf-icon');
    if (ic) ic.textContent = icon; else sbEl.textContent = icon;
  }
  /* Header bar button: plain text */
  var hbEl = E('sound-toggle-hb');
  if (hbEl) hbEl.textContent = icon;
}

function toggleSound() {
  appSound = !appSound;
  try { localStorage.setItem('wmatch_sound', appSound ? '1' : '0'); } catch (e) {}
  updateSoundBtn();
}

updateSoundBtn();

/* ═══ WEB AUDIO ENGINE ═══ */
var _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) _audioCtx = new AC();
  }
  if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playTone(startFreq, endFreq, duration, type) {
  if (!appSound) return;
  var ctx = getAudioCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playCorrect() { playTone(440, 880, 0.15, 'sine'); }
function playWrong() { playTone(300, 200, 0.2, 'square'); }
function playTick() { playTone(800, 800, 0.05, 'sine'); }

function playCombo() {
  if (!appSound) return;
  var ctx = getAudioCtx();
  if (!ctx) return;
  var notes = [523, 659, 784]; /* C5 E5 G5 */
  notes.forEach(function(freq, i) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    var t = ctx.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  });
}

/* ═══ BREAKPOINT DETECTION ═══ */
function onResize() {
  appBP = detectBP();
}
window.addEventListener('resize', onResize);
onResize();

/* ═══ SIDEBAR COLLAPSE / EXPAND ═══ */
function expandSidebar() {
  var sidebarEl = E('sidebar');
  if (sidebarEl) sidebarEl.classList.add('expanded');
}

function collapseSidebar() {
  var sidebarEl = E('sidebar');
  if (sidebarEl) sidebarEl.classList.remove('expanded');
  var menu = E('sf-menu');
  if (menu) menu.classList.remove('open');
}

/* Click inside sidebar (non-footer area) → expand */
document.addEventListener('click', function(e) {
  var sidebarEl = E('sidebar');
  if (!sidebarEl) return;
  var trigger = E('sf-trigger');
  var menu = E('sf-menu');
  /* If clicking footer trigger or menu, let toggleUserMenu handle it */
  if (trigger && trigger.contains(e.target)) return;
  if (menu && menu.contains(e.target)) return;
  /* If collapsed and click is inside sidebar → expand */
  if (!sidebarEl.classList.contains('expanded') && sidebarEl.contains(e.target)) {
    expandSidebar();
  }
});

/* Click outside sidebar → collapse (tablet/phone only; desktop stays expanded) */
document.addEventListener('click', function(e) {
  if (appBP === 'desktop') return;
  var sidebarEl = E('sidebar');
  if (!sidebarEl || !sidebarEl.classList.contains('expanded')) return;
  if (!sidebarEl.contains(e.target)) {
    collapseSidebar();
  }
});

/* ═══ USER MENU (Claude-style popup) ═══ */
function toggleUserMenu() {
  var menu = E('sf-menu');
  if (menu) menu.classList.toggle('open');
  var trigger = E('sf-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', menu && menu.classList.contains('open') ? 'true' : 'false');
}
document.addEventListener('click', function(e) {
  var menu = E('sf-menu');
  var trigger = E('sf-trigger');
  if (menu && trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ═══ APP SHELL ═══ */
function showApp() {
  E('ov-auth').classList.remove('vis');
  E('ov-auth').style.display = 'none';
  E('app-shell').style.display = 'flex';
  updateSidebar();
  if (appBP === 'desktop') expandSidebar();
  navTo('home');

  /* Show notification bell for ALL users (including guests) */
  var sn = E('sidebar-notif'); if (sn) sn.style.display = '';
  var nb = E('notif-bell-hb'); if (nb) nb.style.display = '';
  if (typeof loadNotifications === 'function') loadNotifications();
  /* Lazy-load recovery bundle (smart-notif, student-profile, learning-goals, etc.) */
  setTimeout(function() {
    _lazyLoad('recovery', function() {
      if (typeof initSmartNotifications === 'function') initSmartNotifications();
    });
  }, 2000);

  /* Show homework nav for logged-in students with a class */
  if (isLoggedIn() && !isGuest() && userClassId && !isTeacher()) {
    var nh = E('nav-homework'); if (nh) nh.style.display = '';
    var bh = E('bnav-homework'); if (bh) bh.style.display = '';
  }

  /* Onboarding tour for first-time users */
  if (!localStorage.getItem('wmatch_tour_done')) {
    setTimeout(function() {
      _lazyLoad('tour', function() { if (typeof maybeStartTour === 'function') maybeStartTour(); });
    }, 600);
  }

  /* Select-to-Translate */
  if (typeof initTranslate === 'function') initTranslate();

  /* Guest: header logout → login/register */
  var hbLogout = E('btn-logout-hb');
  if (hbLogout) {
    if (isGuest()) {
      hbLogout.textContent = '\ud83d\udd11';
      hbLogout.title = t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c');
      hbLogout.setAttribute('aria-label', t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c'));
    } else {
      hbLogout.textContent = '\u21a9';
      hbLogout.title = t('Log out', '\u9000\u51fa');
      hbLogout.setAttribute('aria-label', t('Log out', '\u9000\u51fa'));
    }
  }
}

function updateSidebar() {
  if (!currentUser) return;
  var r = getRank();
  var pct = getMasteryPct();

  /* Display name: nickname > email prefix > Guest */
  var displayName = isGuest() ? t('Guest Mode', '\u8bbf\u5ba2\u6a21\u5f0f') : getDisplayName();
  var displayShort = isGuest() ? t('Guest', '\u8bbf\u5ba2') : getDisplayName();

  /* Sidebar trigger: avatar + name */
  if (E('sb-rank')) E('sb-rank').textContent = isTeacher() ? '\ud83c\udfeb' : r.emoji;
  if (E('sb-name')) E('sb-name').textContent = displayName;

  /* Header user */
  if (E('hb-rank')) {
    E('hb-rank').textContent = isTeacher() ? '\ud83c\udfeb' : r.emoji;
    if (isTeacher()) {
      E('hb-rank').style.cursor = 'default';
      E('hb-rank').onclick = null;
    } else {
      E('hb-rank').style.cursor = 'pointer';
      E('hb-rank').onclick = function() { navTo('stats'); };
    }
  }
  if (E('hb-name')) E('hb-name').textContent = displayShort;

  /* Popup menu header: email + rank · % + board tag */
  var menuHeader = E('sf-menu-header');
  if (menuHeader) {
    var lines = [];
    if (currentUser.email && currentUser.email !== 'guest') {
      lines.push(currentUser.email);
    }
    if (isTeacher()) {
      lines.push(t('Teacher Account', '\u6559\u5e08\u8d26\u53f7'));
    } else {
      var gs = getGlobalStats();
      lines.push(t(gs.mastered + ' words \u00b7 ' + gs.kpMastered + ' KPs \u00b7 ' + gs.badgeCount + ' badges',
        '\u5df2\u638c\u63e1 ' + gs.mastered + ' \u8bcd \u00b7 ' + gs.kpMastered + ' \u77e5\u8bc6\u70b9 \u00b7 ' + gs.badgeCount + ' \u679a\u5fbd\u7ae0'));
    }
    var boardOpt = getUserBoardOption();
    if (boardOpt) {
      lines.push(boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh));
    }
    menuHeader.innerHTML = lines.map(function(l) { return escapeHtml(l); }).join('<br>');
  }


  /* Guest: sidebar logout → login/register */
  var sbLogout = E('btn-logout-sb');
  if (sbLogout) {
    var sbIcon = sbLogout.querySelector('.sf-icon');
    var sbLabel = sbLogout.querySelector('[data-en]');
    if (isGuest()) {
      if (sbIcon) sbIcon.textContent = '\ud83d\udd11';
      if (sbLabel) { sbLabel.dataset.en = 'Login / Register'; sbLabel.dataset.zh = '\u767b\u5f55 / \u6ce8\u518c'; sbLabel.textContent = t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c'); }
      sbLogout.classList.remove('sf-danger');
      sbLogout.classList.add('sf-login-cta');
    } else {
      if (sbIcon) sbIcon.textContent = '\u21a9';
      if (sbLabel) { sbLabel.dataset.en = 'Log out'; sbLabel.dataset.zh = '\u9000\u51fa\u767b\u5f55'; sbLabel.textContent = t('Log out', '\u9000\u51fa\u767b\u5f55'); }
      sbLogout.classList.add('sf-danger');
      sbLogout.classList.remove('sf-login-cta');
    }
  }

  /* Sync status inside popup menu */
  var syncEl = E('sb-sync-status');
  if (syncEl) {
    if (isLoggedIn()) {
      syncEl.className = 'sf-menu-sync';
      if (_syncStatus === 'ok') {
        syncEl.className += ' sync-ok';
        syncEl.textContent = '\u2713 ' + t('Synced', '\u5df2\u540c\u6b65');
      } else if (_syncStatus === 'syncing') {
        syncEl.className += ' sync-ing';
        syncEl.textContent = '\u21bb ' + t('Syncing...', '\u540c\u6b65\u4e2d...');
      } else if (_syncStatus === 'error') {
        syncEl.className += ' sync-err';
        syncEl.textContent = '\u26a0 ' + t('Offline', '\u79bb\u7ebf');
      } else {
        syncEl.textContent = '';
      }
    } else {
      syncEl.textContent = '';
      syncEl.className = 'sf-menu-sync';
    }
  }
}

/* scrollToCategory kept for backwards compat */
function scrollToCategory(catId) { selectCategory(catId); }

/* ═══ UTILITY FUNCTIONS ═══ */
function validate(lv, i) {
  var v = lv.vocabulary;
  if (!v || !Array.isArray(v)) return 'Bad data';
  if (v.length % 2 !== 0 || v.length < 4) return 'Bad pairs';
  var c = {};
  v.forEach(function(x) { c[x.id] = (c[x.id] || 0) + 1; });
  for (var id in c) if (c[id] !== 2) return 'id=' + id + ' bad';
  return null;
}

function shuffle(a) {
  var b = a.slice();
  for (var i = b.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}

function calcCols(n) {
  var bp = detectBP();
  if (bp === 'phone') return n <= 8 ? 2 : 3;
  if (bp === 'tablet') return n <= 12 ? 3 : 4;
  return n <= 16 ? 4 : 5;
}

function getPairs(vocab) {
  var m = {};
  vocab.forEach(function(v) {
    if (!m[v.id]) m[v.id] = {};
    m[v.id][v.type] = v.content;
    m[v.id].lid = v.id;
  });
  return Object.keys(m).map(function(k) { return m[k]; });
}

/* Sort cards based on appSort */
function sortCards(pairs) {
  if (appSort === 'az') {
    return pairs.slice().sort(function(a, b) {
      return (a.word || '').localeCompare(b.word || '');
    });
  }
  if (appSort === 'random') {
    return shuffle(pairs);
  }
  if (appSort === 'hard') {
    var wd = getWordData();
    return pairs.slice().sort(function(a, b) {
      var ka = wordKey(currentLvl, a.lid);
      var kb = wordKey(currentLvl, b.lid);
      var da = wd[ka], db = wd[kb];
      var la = da ? (da.lv || 0) : 0;
      var lb = db ? (db.lv || 0) : 0;
      return la - lb; /* lower level = harder = first */
    });
  }
  return pairs; /* default order */
}

/* ═══ SCROLL AUTO-HIDE BOTTOM NAV ═══ */
var _lastScrollY = 0;
window.addEventListener('scroll', function() {
  var bnav = E('bottom-nav');
  if (!bnav) return;
  var cur = window.scrollY;
  if (cur > _lastScrollY && cur > 10) {
    bnav.classList.add('nav-hidden');
  } else {
    bnav.classList.remove('nav-hidden');
  }
  _lastScrollY = cur;
}, { passive: true });

/* ═══ SWIPE GESTURE FOR PANEL SWITCHING ═══ */
var _touchStartX = 0;
var _touchStartY = 0;
var _navSeq = ['home', 'plan', 'mistakes', 'stats'];

document.addEventListener('touchstart', function(e) {
  _touchStartX = e.touches[0].clientX;
  _touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  var dx = e.changedTouches[0].clientX - _touchStartX;
  var dy = e.changedTouches[0].clientY - _touchStartY;
  if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
  var idx = _navSeq.indexOf(appView);
  if (idx < 0) return;
  if (dx < 0 && idx < _navSeq.length - 1) navTo(_navSeq[idx + 1]);
  else if (dx > 0 && idx > 0) navTo(_navSeq[idx - 1]);
});

/* Generic result screen HTML */
function resultScreenHTML(ok, total, retryId, backId, mode) {
  var pct = total > 0 ? Math.round(ok / total * 100) : 0;
  var emoji, title;
  if (pct >= 90) { emoji = '\ud83c\udfc6'; title = t('Excellent!', '\u592a\u68d2\u4e86\uff01'); }
  else if (pct >= 70) { emoji = '\ud83c\udf89'; title = t('Well done!', '\u505a\u5f97\u597d\uff01'); }
  else if (pct >= 50) { emoji = '\ud83d\udcaa'; title = t('Keep going!', '\u7ee7\u7eed\u52a0\u6cb9\uff01'); }
  else { emoji = '\ud83d\udcda'; title = t('Try again!', '\u518d\u7ec3\u7ec3\uff01'); }

  _lastShareOpts = { mode: mode || 'quiz', score: ok, total: total, emoji: emoji };

  return '<div class="result-emoji">' + emoji + '</div>' +
    '<div class="result-title">' + title + '</div>' +
    '<div class="result-score">' + pct + '%</div>' +
    '<div class="result-detail">' + ok + ' / ' + total + ' ' + t('correct', '\u6b63\u786e') + '</div>' +
    '<div class="result-actions">' +
    '<button class="btn btn-primary" onclick="' + retryId + '">\ud83d\udd01 ' + t('Try again', '\u518d\u6765\u4e00\u6b21') + '</button>' +
    '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>' +
    '<button class="btn btn-ghost" onclick="' + backId + '">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>' +
    '</div>';
}

function nextStepHTML(emoji, label, onclick) {
  return '<div class="next-step" role="button" tabindex="0" onclick="' + onclick + '">' +
    '<div class="next-step-label">' + t('Next step', '\u4e0b\u4e00\u6b65') + '</div>' +
    '<div class="next-step-action">' + emoji + ' ' + label + ' \u2192</div>' +
    '</div>';
}

/* Context-aware "Continue Journey" next step for section-based learning */
function sectionNextStepHTML(currentMode, scoreRate) {
  if (!_currentSectionContext) return '';
  var ctx = _currentSectionContext;
  var ms = typeof getSectionMilestone === 'function' ? getSectionMilestone(ctx.sectionId, ctx.board) : null;
  var li = typeof getSectionLevelIdx === 'function' ? getSectionLevelIdx(ctx.sectionId, ctx.board) : -1;
  var emoji, label, action;

  /* Score-based dynamic recommendations */
  if (typeof scoreRate === 'number' && currentMode !== 'study') {
    var modesUsed = getDistinctModesUsed();
    if (scoreRate < 0.5) {
      /* Low score → review wrong words */
      emoji = '\ud83d\udcd6'; label = t('Review words to strengthen', '复习待加强的词');
      action = li >= 0 ? '_lazyCall(\"study-quiz-battle\",\"startStudy\",[' + li + '])' : 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
    } else if (scoreRate <= 0.8) {
      /* Medium → try again or spell */
      if (currentMode === 'quiz') {
        emoji = '\u270d\ufe0f'; label = t('Try Spelling mode', '试试拼写模式');
        action = li >= 0 ? '(typeof startSpell===\"function\"?startSpell(' + li + '):_lazyLoad(\"modes\",function(){startSpell(' + li + ')}))' : 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
      } else {
        emoji = '\ud83d\udd01'; label = t('Try again for a better score', '再试一次提高成绩');
        var _retryFn = 'start' + currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        action = li >= 0 ? '_lazyCall(\"study-quiz-battle\",\"' + _retryFn + '\",[' + li + '])' : 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
      }
    } else {
      /* High score */
      if (modesUsed < 7 && currentMode !== 'battle') {
        emoji = '\u2694\ufe0f'; label = t('Challenge Battle mode', '挑战 Battle 模式');
        action = li >= 0 ? '_lazyCall(\"study-quiz-battle\",\"startBattle\",[' + li + '])' : 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
      } else {
        emoji = '\ud83d\udcd8'; label = t('Continue to next section', '进入下一知识点');
        action = 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
      }
    }
  } else if (currentMode === 'study') {
    if (li >= 0) {
      emoji = '\u2753'; label = t('Quiz to test yourself', '测验检验学习效果');
      action = '_lazyCall(\"study-quiz-battle\",\"startQuiz\",[' + li + '])';
    } else {
      emoji = '\ud83d\udcd8'; label = t('Back to Section', '返回知识点');
      action = 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
    }
  } else if (currentMode === 'quiz') {
    if (ms === 'quiz_done' || ms === 'mastered') {
      emoji = '\ud83d\udcd8'; label = t('Back to Section', '返回知识点');
      action = 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
    } else {
      emoji = '\ud83d\udcd6'; label = t('Study to consolidate', '学习巩固记忆');
      action = li >= 0 ? '_lazyCall(\"study-quiz-battle\",\"startStudy\",[' + li + '])' : 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
    }
  } else {
    emoji = '\ud83d\udcd8'; label = t('Back to Section', '返回知识点');
    action = 'openSection(\'' + ctx.sectionId + '\',\'' + ctx.board + '\')';
  }
  return nextStepHTML(emoji, label, action);
}

/* ═══ NUDGE ENGINE ═══ */

function getUserStage() {
  var gs = typeof getGlobalStats === 'function' ? getGlobalStats() : { mastered: 0 };
  var mastered = gs.mastered || 0;
  var stage = mastered <= 10 ? 'new' : mastered <= 100 ? 'active' : mastered <= 500 ? 'intermediate' : 'advanced';
  var modesUsed = getDistinctModesUsed();
  var streak = typeof getStreakCount === 'function' ? getStreakCount() : 0;
  return { stage: stage, mastered: mastered, modesUsed: modesUsed, streak: streak };
}

function getDistinctModesUsed() {
  var s = typeof loadS === 'function' ? loadS() : {};
  if (!s.modeDone) return 0;
  var modeSet = {};
  for (var mk in s.modeDone) {
    var parts = mk.split(':');
    if (parts.length === 2) modeSet[parts[1]] = true;
  }
  return Object.keys(modeSet).length;
}

/* ═══ FEATURE GATING — all features open ═══ */
function isFeatureUnlocked() { return true; }

var _activeNudge = null;
var _lastNudgeShownAt = 0;
function showNudge(key, msg, actionLabel, actionFn) {
  /* 30-min cooldown (memory-level, resets on page refresh) */
  if (Date.now() - _lastNudgeShownAt < 1800000) return;

  /* Check dismiss / max-show limits */
  var storeKey = 'wmatch_nudge_' + key;
  try {
    var rec = JSON.parse(localStorage.getItem(storeKey) || '{}');
    if (rec.d) return;
    if ((rec.n || 0) >= 3) return;
    rec.n = (rec.n || 0) + 1;
    localStorage.setItem(storeKey, JSON.stringify(rec));
  } catch (e) { return; }

  /* Remove any existing nudge */
  if (_activeNudge && _activeNudge.parentNode) _activeNudge.remove();

  var el = document.createElement('div');
  el.className = 'guide-nudge';
  el.setAttribute('role', 'status');
  el.innerHTML =
    '<span class="guide-nudge-msg">' + msg + '</span>' +
    (actionLabel ? '<button class="guide-nudge-btn" aria-label="' + actionLabel + '">' + actionLabel + '</button>' : '') +
    '<button class="guide-nudge-close" aria-label="' + t('Close', '关闭') + '">&times;</button>';

  /* Action button */
  var btn = el.querySelector('.guide-nudge-btn');
  if (btn && actionFn) btn.addEventListener('click', function() { el.remove(); _activeNudge = null; actionFn(); });

  /* Close (permanent dismiss) */
  var closeBtn = el.querySelector('.guide-nudge-close');
  if (closeBtn) closeBtn.addEventListener('click', function() {
    try {
      var r = JSON.parse(localStorage.getItem(storeKey) || '{}');
      r.d = 1;
      localStorage.setItem(storeKey, JSON.stringify(r));
    } catch (e) {}
    el.remove();
    _activeNudge = null;
  });

  /* ESC to dismiss */
  var _nudgeEsc = function(e) {
    if (e.key === 'Escape' && el.parentNode) {
      el.remove(); _activeNudge = null;
      document.removeEventListener('keydown', _nudgeEsc);
    }
  };
  document.addEventListener('keydown', _nudgeEsc);

  /* Insert at top of active panel */
  var panel = document.querySelector('.panel.active');
  if (panel) panel.insertBefore(el, panel.firstChild);
  _activeNudge = el;
  _lastNudgeShownAt = Date.now();

  /* Auto fade out after 8s */
  setTimeout(function() {
    if (el.parentNode) { el.classList.add('fade-out'); setTimeout(function() { if (el.parentNode) el.remove(); }, 400); }
    if (_activeNudge === el) _activeNudge = null;
  }, 8000);
}

/* ═══ GLOBAL KEYBOARD A11Y ═══ */
/* Activate role="button" elements with Enter/Space (standard ARIA pattern) */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var el = e.target;
  if (el.getAttribute('role') === 'button' && el.hasAttribute('tabindex')) {
    e.preventDefault();
    el.click();
  }
});

/* ═══ EMPTY STATE & LOADING HELPERS ═══ */
function _renderEmptyState(icon, text) {
  return '<div class="empty-state">' +
    (icon ? '<div class="empty-state-icon">' + icon + '</div>' : '') +
    '<div class="empty-state-text">' + text + '</div></div>';
}

function _renderLoading(text) {
  return '<div class="empty-state"><div class="spinner"></div>' +
    (text ? '<div class="empty-state-text" style="margin-top:12px">' + text + '</div>' : '') +
    '</div>';
}

/* ═══ RICH TEXT SANITIZER (shared across bundles) ═══ */
var PQ_ALLOWED_TAGS = { b:1, i:1, em:1, strong:1, br:1, sub:1, sup:1, img:1, u:1 };
var PQ_IMG_ATTRS = { src:1, alt:1, class:1 };

function pqSanitize(html) {
  if (!html) return '';
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  _pqSanitizeNode(tmp);
  return tmp.innerHTML;
}

function _pqSanitizeNode(parent) {
  var children = Array.prototype.slice.call(parent.childNodes);
  for (var i = 0; i < children.length; i++) {
    var node = children[i];
    if (node.nodeType === 3) continue;
    if (node.nodeType !== 1) { parent.removeChild(node); continue; }
    var tag = node.tagName.toLowerCase();
    if (!PQ_ALLOWED_TAGS[tag]) {
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    } else {
      var attrs = Array.prototype.slice.call(node.attributes);
      for (var j = 0; j < attrs.length; j++) {
        if (tag === 'img' && PQ_IMG_ATTRS[attrs[j].name]) continue;
        node.removeAttribute(attrs[j].name);
      }
      if (tag === 'img') {
        var src = node.getAttribute('src') || '';
        if (src.indexOf('https://') !== 0 && src.indexOf('data:image/') !== 0) {
          parent.removeChild(node); continue;
        }
      }
      _pqSanitizeNode(node);
    }
  }
}

function pqRender(text) {
  if (!text) return '';
  if (text.indexOf('<') === -1) return escapeHtml(text);
  return pqSanitize(text);
}

/* ═══ KATEX LAZY LOADING (shared across bundles) ═══ */
var _katexReady = false;

function loadKaTeX() {
  if (_katexReady) return Promise.resolve();
  if (window._katexLoading) return window._katexLoading;

  window._katexLoading = new Promise(function(resolve) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/katex.min.css'; /* self-hosted with font-display:swap */
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
    script.onload = function() {
      var ar = document.createElement('script');
      ar.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
      ar.onload = function() {
        _katexReady = true;
        resolve();
      };
      document.head.appendChild(ar);
    };
    document.head.appendChild(script);
  });
  return window._katexLoading;
}

function renderMath(el) {
  if (!_katexReady || !window.renderMathInElement) return;
  try {
    window.renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false,
      strict: false
    });
  } catch(e) {}
}

/* Badge celebration (replaces showToast for badges) */
function showBadgeCelebration(badge) {
  var el = document.createElement('div');
  el.className = 'badge-celebration';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML =
    '<span class="badge-celeb-icon">' + badge.icon + '</span>' +
    '<span class="badge-celeb-text">' + t(badge.en, badge.zh) + ' ' + t('unlocked!', '解锁！') + '</span>';
  document.body.appendChild(el);
  /* Trigger particle burst */
  if (typeof spawnP === 'function') {
    for (var i = 0; i < 3; i++) {
      setTimeout(function() { spawnP(Math.random() * innerWidth, 60, 12); }, i * 120);
    }
  }
  setTimeout(function() {
    el.classList.add('fade-out');
    setTimeout(function() { if (el.parentNode) el.remove(); }, 400);
  }, 4000);
}

/* ═══ PARTICLE PROXIES (lazy-loaded) ═══ */
function spawnP(x, y, n) { _lazyCall('particles', '_spawnP', [x, y, n]); }
function floatTxt(t, c, x, y) { _lazyCall('particles', '_floatTxt', [t, c, x, y]); }
function showCombo(n) { _lazyCall('particles', '_showCombo', [n]); }
