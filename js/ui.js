/* ══════════════════════════════════════════════════════════════
   ui.js — Panel navigation, Toast, Modal, breakpoint, language
   ══════════════════════════════════════════════════════════════ */

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
  E('modal-card').innerHTML = html;
  E('modal-overlay').style.display = 'flex';
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
  var label = appLang === 'bilingual' ? 'EN' : '\u4e2d\u82f1';
  if (E('lang-toggle-sb')) E('lang-toggle-sb').textContent = label;
  if (E('lang-toggle-hb')) E('lang-toggle-hb').textContent = label;
  /* Update nav labels immediately */
  updateNav();
  /* Re-render current panel */
  if (appView === 'home') renderHome();
  else if (appView === 'deck') renderDeck(currentLvl);
  else if (appView === 'preview') renderPreview(currentLvl);
  else if (appView === 'review-dash') renderReviewDash();
  else if (appView === 'import') renderImport();
  else if (appView === 'board') renderBoard();
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
  ['dark-toggle-sb', 'dark-toggle-hb'].forEach(function(id) {
    var el = E(id);
    if (el) el.textContent = icon;
  });
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
  ['sound-toggle-sb', 'sound-toggle-hb'].forEach(function(id) {
    var el = E(id);
    if (el) el.textContent = icon;
  });
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

function setLang(mode) {
  appLang = mode;
  toggleLang();
  toggleLang(); /* toggle twice to just update labels without changing */
}

/* ═══ BREAKPOINT DETECTION ═══ */
function onResize() {
  appBP = detectBP();
}
window.addEventListener('resize', onResize);
onResize();

/* ═══ APP SHELL ═══ */
function showApp() {
  E('ov-auth').classList.remove('vis');
  E('ov-auth').style.display = 'none';
  E('app-shell').style.display = 'flex';
  updateSidebar();
  navTo('home');
}

function updateSidebar() {
  if (!currentUser) return;
  var r = getRank();
  var pct = getMasteryPct();

  /* Display name: nickname > email prefix > Guest */
  var displayName = currentUser.email === 'guest' ? t('Guest Mode', '\u8bbf\u5ba2\u6a21\u5f0f') : (currentUser.nickname || currentUser.email.split('@')[0]);
  var displayShort = currentUser.email === 'guest' ? t('Guest', '\u8bbf\u5ba2') : (currentUser.nickname || currentUser.email.split('@')[0]);

  /* Sidebar user */
  if (E('sb-rank')) {
    E('sb-rank').textContent = r.emoji;
    E('sb-rank').style.cursor = 'pointer';
    E('sb-rank').onclick = showRankGuide;
  }
  if (E('sb-name')) E('sb-name').textContent = displayName;
  if (E('sb-meta')) E('sb-meta').textContent = rankName(r) + ' \xb7 ' + pct + '%';

  /* Header user */
  if (E('hb-rank')) {
    E('hb-rank').textContent = r.emoji;
    E('hb-rank').style.cursor = 'pointer';
    E('hb-rank').onclick = showRankGuide;
  }
  if (E('hb-name')) E('hb-name').textContent = displayShort;

  /* Sidebar board tag */
  var sbBoard = E('sb-board');
  if (sbBoard) {
    var boardOpt = getUserBoardOption();
    if (boardOpt) {
      sbBoard.textContent = boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh);
      sbBoard.style.display = 'inline-block';
    } else {
      sbBoard.style.display = 'none';
    }
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

/* Generic result screen HTML */
function resultScreenHTML(ok, total, retryId, backId) {
  var pct = total > 0 ? Math.round(ok / total * 100) : 0;
  var emoji, title;
  if (pct >= 90) { emoji = '\ud83c\udfc6'; title = t('Excellent!', '\u592a\u68d2\u4e86\uff01'); }
  else if (pct >= 70) { emoji = '\ud83c\udf89'; title = t('Well done!', '\u505a\u5f97\u597d\uff01'); }
  else if (pct >= 50) { emoji = '\ud83d\udcaa'; title = t('Keep going!', '\u7ee7\u7eed\u52a0\u6cb9\uff01'); }
  else { emoji = '\ud83d\udcda'; title = t('Try again!', '\u518d\u7ec3\u7ec3\uff01'); }

  return '<div class="result-emoji">' + emoji + '</div>' +
    '<div class="result-title">' + title + '</div>' +
    '<div class="result-score">' + pct + '%</div>' +
    '<div class="result-detail">' + ok + ' / ' + total + ' ' + t('correct', '\u6b63\u786e') + '</div>' +
    '<div class="result-actions">' +
    '<button class="btn btn-primary" onclick="' + retryId + '">\ud83d\udd01 ' + t('Try again', '\u518d\u6765\u4e00\u6b21') + '</button>' +
    '<button class="btn btn-ghost" onclick="' + backId + '">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>' +
    '</div>';
}
