/* ══════════════════════════════════════════════════════════════
   ui.js — Panel navigation, Toast, Modal, breakpoint, language
   ══════════════════════════════════════════════════════════════ */

var _lastShareOpts = null;

/* ═══ XSS ESCAPE HELPER ═══ */
function escapeHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ═══ PANEL NAVIGATION ═══ */
function showPanel(id) {
  document.querySelectorAll('.panel').forEach(function(p) {
    p.classList.remove('active');
  });
  var el = E('panel-' + id);
  if (el) el.classList.add('active');
  appView = id;
  updateNav();
}

function navTo(id) {
  showPanel(id);
  /* Render content for target panel */
  if (id === 'home') renderHome();
  else if (id === 'review-dash') renderReviewDash();
  else if (id === 'import') renderImport();
  else if (id === 'board') renderBoard();
  else if (id === 'stats') renderStats();
  else if (id === 'admin') renderAdmin();
  else if (id === 'homework') { if (typeof showStudentHwPage === 'function') showStudentHwPage(); }
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
  var langKey = appLang === 'en' ? 'en' : 'zh';
  document.querySelectorAll('[data-en][data-zh]').forEach(function(el) {
    el.textContent = el.dataset[langKey];
  });
  /* Review badge */
  var rc = getReviewCount();
  var badges = [E('nav-rv-badge')];
  badges.forEach(function(b) {
    if (b) {
      b.textContent = rc;
      b.style.display = rc > 0 ? 'inline-block' : 'none';
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
function showModal(html) {
  var card = E('modal-card');
  card.innerHTML = html;
  E('modal-overlay').style.display = 'flex';
  /* ARIA: set aria-labelledby to first .section-title if present */
  var title = card.querySelector('.section-title');
  if (title && !title.id) title.id = 'modal-title-auto';
  if (title) E('modal-overlay').setAttribute('aria-labelledby', title.id);
  else E('modal-overlay').removeAttribute('aria-labelledby');
}

function hideModal() {
  E('modal-overlay').style.display = 'none';
}

E('modal-overlay').addEventListener('click', function(e) {
  if (e.target === E('modal-overlay')) hideModal();
});

/* ═══ LANGUAGE TOGGLE ═══ */
function toggleLang() {
  appLang = appLang === 'bilingual' ? 'en' : 'bilingual';
  try { localStorage.setItem('wmatch_lang', appLang); } catch(e) {}
  var label = appLang === 'en' ? '中文' : 'EN';
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
  else if (appView === 'review-dash') renderReviewDash();
  else if (appView === 'import') renderImport();
  else if (appView === 'board') renderBoard();
  else if (appView === 'stats') renderStats();
  else if (appView === 'admin') renderAdmin();
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

/* ═══ SPEECH SYNTHESIS ═══ */
function canSpeak() { return !!window.speechSynthesis; }

function speakWord(text) {
  if (!appSound || !canSpeak()) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
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

  /* Show notification bell + load notifications for logged-in users */
  if (isLoggedIn() && !isGuest()) {
    var sn = E('sidebar-notif'); if (sn) sn.style.display = '';
    var nb = E('notif-bell-hb'); if (nb) nb.style.display = '';
    if (typeof loadNotifications === 'function') loadNotifications();
  }

  /* Show homework nav for logged-in students with a class */
  if (isLoggedIn() && !isGuest() && userClassId && !isTeacher()) {
    var nh = E('nav-homework'); if (nh) nh.style.display = '';
    var bh = E('bnav-homework'); if (bh) bh.style.display = '';
  }

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
      E('hb-rank').onclick = showRankGuide;
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
    lines.push(isTeacher() ? t('Teacher Account', '\u6559\u5e08\u8d26\u53f7') : rankName(r) + ' \xb7 ' + pct + '%');
    var boardOpt = getUserBoardOption();
    if (boardOpt) {
      lines.push(boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh));
    }
    menuHeader.innerHTML = lines.map(function(l) { return escapeHtml(l); }).join('<br>');
  }

  /* Sidebar: multi-board accordions with category sub-items */
  var deckEl = E('sidebar-decks');
  if (deckEl) {
    var html = '';
    getVisibleBoards().forEach(function(board) {
      var isOpen = sidebarBoardOpen[board.id] ? true : false;
      html += '<div class="sidebar-cat-group' + (isOpen ? ' open' : '') + '">';
      html += '<button class="sidebar-deck-item sidebar-cat-toggle" onclick="toggleBoardSidebar(\'' + board.id + '\')">' +
        '<span class="deck-emoji">' + board.emoji + '</span>' +
        '<span>' + t(board.name, board.nameZh) + '</span>' +
        '<span class="sidebar-chevron">\u25b6</span>' +
        '</button>';
      html += '<div class="sidebar-cat-decks">';
      board.categories.forEach(function(cat) {
        html += '<button class="sidebar-sub-item" onclick="selectCategory(\'' + cat.id + '\')">' +
          '<span style="margin-right:6px">' + cat.emoji + '</span>' +
          '<span class="sidebar-sub-name">' + catName(cat) + '</span>' +
          '</button>';
      });
      html += '</div></div>';
    });
    deckEl.innerHTML = html;
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
var _navSeq = ['home', 'review-dash', 'import', 'board', 'stats', 'admin'];

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

/* ═══ BUG REPORT ═══ */
function showBugReport() {
  var types = [
    ['ui', t('UI Issue', '界面问题')],
    ['data', t('Data Error', '数据错误')],
    ['crash', t('Crash', '崩溃')],
    ['feature', t('Feature Request', '功能建议')],
    ['other', t('Other', '其他')]
  ];
  var typeOpts = types.map(function(tp) {
    return '<option value="' + tp[0] + '">' + tp[1] + '</option>';
  }).join('');

  var userType = isGuest() ? 'Guest' : (isLoggedIn() ? 'Registered' : 'Unknown');
  var autoInfo = 'App: ' + APP_VERSION + '\nBoard: ' + (userBoard || 'none') +
    '\nUser: ' + userType +
    '\nLang: ' + appLang +
    '\nBrowser: ' + navigator.userAgent;

  var html = '<div class="section-title">' + t('Report a Bug', '报告问题') + '</div>';
  html += '<label class="settings-label">' + t('Bug Type', '问题类型') + '</label>';
  html += '<select class="bug-select" id="bug-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '描述') + ' *</label>';
  html += '<textarea class="bug-textarea" id="bug-desc" rows="4" placeholder="' + t('Describe the issue...', '请描述问题...') + '"></textarea>';
  html += '<label class="settings-label">' + t('Steps to Reproduce', '复现步骤') + ' (' + t('optional', '选填') + ')</label>';
  html += '<textarea class="bug-textarea" id="bug-steps" rows="3" placeholder="' + t('1. Go to...\n2. Click on...\n3. See error', '1. 打开...\n2. 点击...\n3. 出现错误') + '"></textarea>';
  html += '<label class="settings-label">' + t('Auto-collected Info', '自动收集信息') + '</label>';
  html += '<textarea class="bug-textarea bug-auto" rows="4" readonly>' + autoInfo + '</textarea>';
  html += '<div id="bug-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '提交') : t('Submit via Email', '通过邮件提交');
  html += '<button class="btn btn-primary" style="flex:1" onclick="submitBugReport()">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';
  showModal(html);
}

async function submitBugReport() {
  var desc = E('bug-desc').value.trim();
  if (!desc) {
    E('bug-msg').textContent = t('Please describe the issue', '请描述问题');
    return;
  }
  var type = E('bug-type').value;
  var steps = E('bug-steps').value.trim();

  /* Logged-in users: save to DB */
  if (sb && isLoggedIn() && !isGuest()) {
    try {
      var res = await sb.from('feedback').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        type: type,
        description: desc,
        steps: steps,
        auto_info: { board: userBoard, lang: appLang, ua: navigator.userAgent }
      });
      if (res.error) throw new Error(res.error.message);
      hideModal();
      showToast(t('Feedback submitted!', '反馈已提交！'));
    } catch (e) {
      E('bug-msg').textContent = t('Submit failed: ', '提交失败：') + e.message;
    }
    return;
  }

  /* Guest: mailto fallback */
  var userType = isGuest() ? 'Guest' : 'Unknown';
  var subject = '[Bug] ' + type + ' - 25Maths Keywords';
  var body = 'Bug Type: ' + type + '\n\n' +
    'Description:\n' + desc + '\n\n' +
    (steps ? 'Steps to Reproduce:\n' + steps + '\n\n' : '') +
    '--- Auto Info ---\n' +
    'App: ' + APP_VERSION + '\n' +
    'Board: ' + (userBoard || 'none') + '\n' +
    'User: ' + userType + '\n' +
    'Lang: ' + appLang + '\n' +
    'Browser: ' + navigator.userAgent;
  var mailto = 'mailto:support@25maths.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailto, '_blank');
  hideModal();
  showToast(t('Opening email client...', '正在打开邮件客户端...'));
}

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
