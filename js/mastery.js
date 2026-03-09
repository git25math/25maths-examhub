/* ══════════════════════════════════════════════════════════════
   mastery.js — Home dashboard, deck detail, mode selection, sort
   ══════════════════════════════════════════════════════════════ */

/* ═══ WORD FILTER STATE ═══ */
var _deckSelectMode = false;
var _deckHideMastered = false;
var _deckSelectedWords = {};
var _deckSelectCount = 0;
var _deckFLMFilter = null; /* null='all', 'new', 'learning', 'uncertain', 'mastered' */

function _setFLMFilter(key, idx) {
  _deckFLMFilter = key === 'all' ? null : key;
  /* When FLM filter is set, disable old hideMastered */
  if (_deckFLMFilter) _deckHideMastered = false;
  renderDeck(idx);
}

/* Restore hideMastered preference */
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('word_filter_prefs')) || {};
    _deckHideMastered = prefs.hideMastered || false;
  } catch(e) {}
})();

/* ═══ MASTERY CALCULATIONS ═══ */

/* FLM global stats */
function getGlobalStats() {
  var all = getAllWords();
  if (all.length === 0) return { total: 0, mastered: 0, learningPct: 0, masteryPct: 0 };
  var mastered = 0;
  all.forEach(function(w) { if (w.fs === 'mastered') mastered++; });
  var masteryPct = Math.round(mastered / all.length * 100);
  return {
    total: all.length,
    mastered: mastered,
    learningPct: masteryPct,
    masteryPct: masteryPct
  };
}

/* Backward-compatible wrapper */
function getMasteryPct() {
  return getGlobalStats().masteryPct;
}

function getRank() {
  var pct = getGlobalStats().masteryPct;
  var r = RANKS[0];
  for (var i = RANKS.length - 1; i >= 0; i--) {
    if (pct >= RANKS[i].min) { r = RANKS[i]; break; }
  }
  return r;
}

function getNextRank() {
  var pct = getGlobalStats().masteryPct;
  for (var i = 0; i < RANKS.length; i++) {
    if (pct < RANKS[i].min) return RANKS[i];
  }
  return null;
}

/* ═══ DECK STATS (FLM) ═══ */
function getDeckStats(li, _wd) {
  var lv = LEVELS[li];
  var pairs = getPairs(lv.vocabulary);
  var wd = _wd || getWordData();
  var mastered = 0, started = 0, newCount = 0, uncertainCount = 0, learningCount = 0;
  pairs.forEach(function(p) {
    var key = wordKey(li, p.lid);
    var d = wd[key];
    var fs = d ? (d.fs || 'new') : 'new';
    if (fs === 'mastered') mastered++;
    else if (fs === 'uncertain') uncertainCount++;
    else if (fs === 'learning') learningCount++;
    else newCount++;
    if (d && ((d.ok || 0) >= 1 || fs !== 'new')) started++;
  });
  var masteryPct = pairs.length > 0 ? Math.round(mastered / pairs.length * 100) : 0;
  return {
    total: pairs.length,
    started: started,
    mastered: mastered,
    newCount: newCount,
    uncertainCount: uncertainCount,
    learningCount: learningCount,
    learningPct: masteryPct,
    masteryPct: masteryPct,
    pct: masteryPct  /* backward-compatible alias */
  };
}

/* ═══ CATEGORY COLLAPSE STATE ═══ */
/* All categories default collapsed; restore from localStorage */
var catCollapsed = {};
(function initCatCollapsed() {
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('wmatch_catCollapsed')); } catch(e) {}
  BOARDS.forEach(function(b) {
    b.categories.forEach(function(c) {
      catCollapsed[c.id] = saved && c.id in saved ? saved[c.id] : true;
    });
  });
})();

/* Unit collapse state (25m only, default all collapsed) */
var unitCollapsed = (function() {
  try { return JSON.parse(localStorage.getItem('wmatch_unitCollapsed')) || {}; } catch(e) { return {}; }
})();

/* Sidebar board accordion state (per board) */
var sidebarBoardOpen = {};

function toggleBoardSidebar(boardId) {
  sidebarBoardOpen[boardId] = !sidebarBoardOpen[boardId];
  updateSidebar();
}

function toggleCategory(catId) {
  catCollapsed[catId] = !catCollapsed[catId];
  var el = document.getElementById('cat-' + catId);
  if (el) el.classList.toggle('collapsed', catCollapsed[catId]);
  try { localStorage.setItem('wmatch_catCollapsed', JSON.stringify(catCollapsed)); } catch(e) {}
}

function toggleUnit(unitKey) {
  unitCollapsed[unitKey] = !unitCollapsed[unitKey];
  var el = document.getElementById('unit-' + unitKey);
  if (el) el.classList.toggle('collapsed', unitCollapsed[unitKey]);
  try { localStorage.setItem('wmatch_unitCollapsed', JSON.stringify(unitCollapsed)); } catch(e) {}
}

/* Called from sidebar: expand right-side category + scroll to it */
function selectCategory(catId) {
  /* Expand right side category */
  catCollapsed[catId] = false;
  var el = document.getElementById('cat-' + catId);
  if (el) el.classList.remove('collapsed');

  /* Navigate to home if needed, then scroll */
  if (appView !== 'home') navTo('home');
  setTimeout(function() {
    var el2 = document.getElementById('cat-' + catId);
    if (el2) el2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, appView !== 'home' ? 100 : 0);
}

/* ═══ DECK ROW HELPER ═══ */
function renderDeckRow(cl, cat, _levelLocked, _levelStats) {
  var locked = _levelLocked[cl.idx];
  var stats = locked ? { pct: 0, started: 0, total: 0 } : (_levelStats[cl.idx] || { pct: 0, started: 0, total: 0 });
  var wordCount = Math.floor(cl.lv.vocabulary.length / 2);
  var h = '';
  h += '<div class="deck-row' + (locked ? ' locked' : '') + '" role="button" tabindex="' + (locked ? '-1' : '0') + '" onclick="' + (locked ? 'showGuestLockPrompt()' : 'openDeck(' + cl.idx + ')') + '">';
  if (cl.lv.board === '25m' && cl.lv.unitNum) {
    var yn = cl.lv.category.replace('25m-y', '');
    h += '<span class="deck-row-tag">Y' + yn + '.' + cl.lv.unitNum + '</span>';
  } else {
    h += '<span class="deck-row-emoji">' + cat.emoji + '</span>';
  }
  h += '<span class="deck-row-name">' + lvTitle(cl.lv) + '</span>';
  h += '<span class="deck-row-count">' + (locked ? wordCount + ' ' + t('words', '\u8bcd') : stats.started + '/' + stats.total) + '</span>';
  if (!locked) {
    h += '<span class="deck-row-progress"><span class="deck-row-progress-fill" style="width:' + stats.pct + '%"></span></span>';
    h += '<span class="deck-row-pct">' + stats.pct + '%</span>';
  } else {
    h += '<span class="deck-row-lock">\ud83d\udd12</span>';
  }
  if (typeof isSuperAdmin === 'function' && isSuperAdmin() && typeof vocabAdminBtns === 'function') {
    h += vocabAdminBtns(cl.idx);
  }
  h += '</div>';
  return h;
}

/* ═══ HOME DASHBOARD — 3-Zone Architecture ═══ */

/* Next action recommendation logic (priority-based) */
function _getNextAction(dueCount) {
  var boards = getVisibleBoards();
  var due = dueCount != null ? dueCount : getDueWords().length;
  var dcData = getDailyData();

  /* Check all syllabus boards for in-progress or next sections */
  var inProgress = null;
  var nextNew = null;
  for (var i = 0; i < boards.length; i++) {
    var bid = boards[i].id;
    var syllabusBoard = bid === 'edx' ? 'edexcel' : bid === '25m' ? 'hhk' : bid;
    var syllabus = typeof BOARD_SYLLABUS !== 'undefined' ? BOARD_SYLLABUS[syllabusBoard] : null;
    if (!syllabus) continue;
    for (var ci = 0; ci < syllabus.chapters.length; ci++) {
      var ch = syllabus.chapters[ci];
      for (var si = 0; si < ch.sections.length; si++) {
        var sec = ch.sections[si];
        var h = typeof getSectionHealth === 'function' ? getSectionHealth(sec.id, syllabusBoard) : null;
        if (!h || !h.hasVocab) continue;
        /* In-progress: started but vocab < 80% */
        if (h.vocabScore > 0 && h.vocabScore < 80 && !inProgress) {
          inProgress = { section: sec, board: syllabusBoard, health: h, chapter: ch };
        }
        /* Next new: not started */
        if (h.vocabScore === 0 && !nextNew) {
          nextNew = { section: sec, board: syllabusBoard, health: h, chapter: ch };
        }
        if (inProgress && nextNew) break;
      }
      if (inProgress && nextNew) break;
    }
    if (inProgress && nextNew) break;
  }

  /* Priority: 1. In-progress section → 2. Daily challenge → 3. Next new section */
  if (inProgress) {
    return { type: 'continue', section: inProgress.section, board: inProgress.board, label: inProgress.section.id + ' ' + inProgress.section.title, labelZh: inProgress.section.title_zh };
  }
  if (!dcData) {
    return { type: 'daily' };
  }
  if (nextNew) {
    return { type: 'start', section: nextNew.section, board: nextNew.board, label: nextNew.section.id + ' ' + nextNew.section.title, labelZh: nextNew.section.title_zh };
  }
  return { type: 'explore' };
}

/* Return recap card (shown if >24h since last visit) */
function _renderReturnRecap() {
  var now = Date.now();
  var lastVisit = 0;
  try { lastVisit = parseInt(localStorage.getItem('wmatch_last_visit') || '0'); } catch(e) {}
  try { localStorage.setItem('wmatch_last_visit', '' + now); } catch(e) {}
  if (!lastVisit || (now - lastVisit) < 86400000) return '';
  /* Check if already shown today */
  var todayKey = new Date().toLocaleDateString('en-CA');
  try { if (localStorage.getItem('wmatch_recap_day') === todayKey) return ''; localStorage.setItem('wmatch_recap_day', todayKey); } catch(e) {}
  var gs = typeof getGlobalStats === 'function' ? getGlobalStats() : { mastered: 0 };
  var streak = typeof getStreakCount === 'function' ? getStreakCount() : 0;
  var dueCount = typeof getDueWords === 'function' ? getDueWords().length : 0;
  var msg = t('Welcome back!', '欢迎回来！');
  var details = [];
  if (dueCount > 0) details.push(dueCount + ' ' + t('words to review', '词待复习'));
  if (streak > 0) details.push(streak + ' ' + t('-day streak', '天连续'));
  details.push(gs.mastered + ' ' + t('words mastered', '词已掌握'));
  return '<div class="return-recap" role="status" aria-live="polite"><span>' + msg + ' ' + details.join(' · ') + '</span>' +
    '<button class="return-recap-close" aria-label="' + t('Close', '关闭') + '">&times;</button></div>';
}

/* Mode discovery chips (recommend untried modes) */
function _renderModeDiscovery() {
  if (typeof getUserStage !== 'function') return '';
  var info = getUserStage();
  var s = typeof loadS === 'function' ? loadS() : {};
  /* Determine which modes have been used */
  var usedModes = {};
  if (s.modeDone) {
    for (var mk in s.modeDone) {
      var parts = mk.split(':');
      if (parts.length === 2) usedModes[parts[1]] = true;
    }
  }
  /* Suggest unlocked but unused modes (threshold-aware) */
  var suggestions = [];
  var _discCandidates = [
    { mode: 'quiz',     emoji: '\u2753',       en: 'Quiz',     zh: '测验' },
    { mode: 'spell',    emoji: '\u270d\ufe0f',  en: 'Spell',    zh: '拼写' },
    { mode: 'battle',   emoji: '\u2694\ufe0f',  en: 'Battle',   zh: '对战' },
    { mode: 'practice', emoji: '\ud83d\udcdd',  en: 'Practice', zh: '练习题' }
  ];
  _discCandidates.forEach(function(c) {
    if (!usedModes[c.mode]) {
      suggestions.push(c);
    }
  });
  suggestions = suggestions.slice(0, 2); /* Show at most 2 chips */
  /* Filter out dismissed */
  suggestions = suggestions.filter(function(sg) {
    try { return !localStorage.getItem('wmatch_disc_' + sg.mode); } catch(e) { return true; }
  });
  if (suggestions.length === 0) return '';
  var html = '<div class="hero-discover">';
  html += '<span class="hero-discover-label">' + t('Try:', '试试:') + '</span>';
  suggestions.forEach(function(sg) {
    html += '<span class="hero-discover-chip" data-disc-mode="' + sg.mode + '">' +
      sg.emoji + ' ' + t(sg.en, sg.zh) +
      '<span class="hero-discover-close" data-disc-dismiss="' + sg.mode + '" role="button" tabindex="0" aria-label="' + t('Dismiss', '关闭') + '">&times;</span></span>';
  });
  html += '</div>';
  return html;
}

/* Mode discovery dismiss delegation */
var _discDelegated = false;
function _initDiscDelegation() {
  if (_discDelegated) return;
  _discDelegated = true;
  function _handleDiscDismiss(e) {
    var dismiss = e.target.closest('[data-disc-dismiss]');
    if (dismiss) {
      var mode = dismiss.dataset.discDismiss;
      try { localStorage.setItem('wmatch_disc_' + mode, '1'); } catch(e2) {}
      var chip = dismiss.closest('.hero-discover-chip');
      if (chip) chip.remove();
      e.stopPropagation();
      return;
    }
    /* Return recap close */
    var recapClose = e.target.closest('.return-recap-close');
    if (recapClose) {
      var recap = recapClose.closest('.return-recap');
      if (recap) recap.remove();
      return;
    }
  }
  document.addEventListener('click', _handleDiscDismiss);
  /* Keyboard support: Enter/Space on discover-close and recap-close */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var dismiss = e.target.closest('[data-disc-dismiss]');
    var recapClose = e.target.closest('.return-recap-close');
    if (dismiss || recapClose) { e.preventDefault(); e.target.click(); return; }
    if (e.target.classList.contains('category-header') || e.target.classList.contains('unit-header')) { e.preventDefault(); e.target.click(); }
  });
}

/* Zone 1: Hero Action Card */
function _renderHeroAction() {
  var gs = getGlobalStats();
  var streakN = getStreakCount();
  var homeRank = getRank();
  var action = _getNextAction(0);
  var dcData = getDailyData();
  var wg = typeof getWeeklyGoal === 'function' ? getWeeklyGoal() : null;

  var html = '<div class="hero-card">';

  /* Daily welcome (first visit of the day) */
  var todayKey = new Date().toLocaleDateString('en-CA');
  var lastWelcome = '';
  try { lastWelcome = localStorage.getItem('wmatch_last_welcome') || ''; } catch(e) {}
  if (todayKey !== lastWelcome) {
    try { localStorage.setItem('wmatch_last_welcome', todayKey); } catch(e) {}
    var welcomeMsg;
    if (streakN >= 7) welcomeMsg = t('Amazing dedication!', '\u575a\u6301\u5f97\u592a\u68d2\u4e86\uff01');
    else if (streakN >= 3) welcomeMsg = t(streakN + ' days strong!', '\u8fde\u7eed ' + streakN + ' \u5929\u4e86\uff0c\u7ee7\u7eed\uff01');
    else welcomeMsg = t('Welcome back!', '\u6b22\u8fce\u56de\u6765\uff01');
    html += '<div class="hero-welcome">' + welcomeMsg + '</div>';
  }

  /* Top row: streak + weekly goal + rank */
  html += '<div class="hero-top">';
  html += '<span class="hero-streak">\ud83d\udd25 ' + t(streakN + '-day streak', '\u8fde\u7eed ' + streakN + ' \u5929') + '</span>';
  if (wg) {
    html += '<span class="hero-weekly">' + t('Week', '\u672c\u5468') + ': ' + wg.learned + '/' + wg.target + '</span>';
  }
  html += '<span class="hero-rank" data-hero-action="rank">' + homeRank.emoji + ' ' + rankName(homeRank) + '</span>';
  html += '</div>';

  /* Main action area */
  html += '<div class="hero-main">';
  if (action.type === 'continue') {
    html += '<div class="hero-label">' + t('Continue', '\u7ee7\u7eed\u5b66\u4e60') + '</div>';
    html += '<div class="hero-section">' + escapeHtml(action.label) + '</div>';
    if (appLang !== 'en' && action.labelZh) html += '<div class="hero-section-zh">' + escapeHtml(action.labelZh) + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="continue" data-hero-sec="' + action.section.id + '" data-hero-board="' + action.board + '">';
    html += t('Continue Learning', '\u7ee7\u7eed\u5b66\u4e60') + ' \u2192</button>';
  } else if (action.type === 'daily') {
    html += '<div class="hero-label">' + t('Daily Challenge', '\u6bcf\u65e5\u6311\u6218') + '</div>';
    html += '<div class="hero-section">' + t('10 words \u00b7 60 seconds \u00b7 test your speed!', '10 \u4e2a\u8bcd \u00b7 60 \u79d2 \u00b7 \u6d4b\u8bd5\u4f60\u7684\u901f\u5ea6\uff01') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="daily">';
    html += t('GO', '\u5f00\u59cb') + ' \u2192</button>';
  } else if (action.type === 'start') {
    html += '<div class="hero-label">' + t('Up next', '\u4e0b\u4e00\u7ad9') + '</div>';
    html += '<div class="hero-section">' + escapeHtml(action.label) + '</div>';
    if (appLang !== 'en' && action.labelZh) html += '<div class="hero-section-zh">' + escapeHtml(action.labelZh) + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="start" data-hero-sec="' + action.section.id + '" data-hero-board="' + action.board + '">';
    html += t('Start Learning', '\u5f00\u59cb\u5b66\u4e60') + ' \u2192</button>';
  } else {
    html += '<div class="hero-label">' + t('Explore', '\u63a2\u7d22') + '</div>';
    html += '<div class="hero-section">' + t('Pick a topic below to start learning', '\u9009\u62e9\u4e00\u4e2a\u77e5\u8bc6\u70b9\u5f00\u59cb\u5b66\u4e60') + '</div>';
  }
  html += '</div>';

  /* Secondary actions */
  html += '<div class="hero-alt">';
  if (action.type !== 'daily') {
    html += '<button class="hero-alt-btn" data-hero-action="daily">\u26a1 ' + t('Daily Challenge', '\u6bcf\u65e5\u6311\u6218');
    if (dcData) html += ' (' + dcData.score + '/10)';
    html += '</button>';
  }
  html += '</div>';

  html += '</div>';
  return html;
}

/* Hero card event delegation */
var _heroDelegated = false;
function _initHeroDelegation() {
  if (_heroDelegated) return;
  _heroDelegated = true;
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-hero-action]');
    if (!el) return;
    var act = el.dataset.heroAction;
    if (act === 'continue' || act === 'start') {
      openSection(el.dataset.heroSec, el.dataset.heroBoard);
    } else if (act === 'daily') {
      startDaily();
    } else if (act === 'rank') {
      showRankGuide();
    } else if (act === 'stats') {
      navTo('stats');
    }
  });
}

/* Zone 2: Quick Stats Strip */
function _renderQuickStats() {
  var gs = getGlobalStats();
  var streakN = getStreakCount();
  var homeRank = getRank();
  var html = '<div class="quick-stats" data-hero-action="stats">';
  html += '<span class="qs-pill">\ud83d\udd25 ' + streakN + t('d', '\u5929') + '</span>';
  html += '<span class="qs-pill">\ud83d\udcca ' + gs.total + t(' words', '\u8bcd') + '</span>';
  html += '<span class="qs-pill">\u2b50 ' + gs.masteryPct + '%</span>';
  html += '<span class="qs-pill">' + homeRank.emoji + ' ' + rankName(homeRank) + '</span>';
  html += '</div>';
  return html;
}

/* Homework slot (compact) */
function _renderHomeworkSlot() {
  if (!isLoggedIn() || isGuest() || !userClassId) return '';
  return '<div id="hw-banner"></div>';
}

/* ═══ LEVELS CATEGORY INDEX (避免 renderHome 中 2× 全量扫描) ═══ */
var _catLevelIndex = null; /* { 'cie:algebra': [{lv, idx}, ...], ... } */

function _ensureCatIndex() {
  if (_catLevelIndex) return _catLevelIndex;
  _catLevelIndex = {};
  LEVELS.forEach(function(lv, i) {
    if (!isLevelVisible(lv)) return;
    var key = (lv.board || '') + ':' + (lv.category || '');
    if (!_catLevelIndex[key]) _catLevelIndex[key] = [];
    _catLevelIndex[key].push({ lv: lv, idx: i });
  });
  return _catLevelIndex;
}

/* ═══ renderHome 微任务合并（避免初始化期间重复渲染） ═══ */
var _homeRenderPending = false;
function scheduleRenderHome() {
  if (_homeRenderPending) return;
  _homeRenderPending = true;
  Promise.resolve().then(function() {
    _homeRenderPending = false;
    if (typeof appView !== 'undefined' && appView === 'home') renderHome();
  });
}

function renderHome() {
  _initHeroDelegation();
  _initDiscDelegation();
  var gs = getGlobalStats();
  var html = '';

  /* Guest banner (compact toast-style) */
  if (isGuest()) {
    html += '<div class="guest-welcome" onclick="showGuestSignupPrompt()">';
    html += '<span class="guest-trial-icon">\u2728</span>';
    html += '<span class="guest-trial-text">' + t('Register free to sync progress', '\u514d\u8d39\u6ce8\u518c\u540c\u6b65\u8fdb\u5ea6') + '</span>';
    html += '<span class="guest-trial-arrow">\u2192</span>';
    html += '</div>';
  }

  /* Return recap (24h+ absence) */
  html += _renderReturnRecap();

  /* Zone 1: Hero Action Card */
  html += _renderHeroAction();

  /* Mode discovery chips */
  html += _renderModeDiscovery();

  /* Reflux recommendation (#15) */
  html += _renderRefluxRec();

  /* Zone 2: Quick Stats Strip */
  html += _renderQuickStats();

  /* Homework banner (students only) */
  html += _renderHomeworkSlot();

  /* Search bar */
  html += '<div class="search-bar">';
  html += '<input class="search-input" id="home-search" type="text" placeholder="' + t('Search groups or words...', '\u641c\u7d22\u8bcd\u7ec4\u6216\u5355\u8bcd...') + '" value="' + appSearch.replace(/"/g, '&quot;') + '" oninput="onHomeSearch(this.value)">';
  if (appSearch) {
    html += '<button class="search-clear" onclick="clearHomeSearch()">&times;</button>';
  }
  html += '</div>';

  /* Deck grid grouped by BOARDS → categories → levels */
  var hasAnyResult = false;
  getVisibleBoards().forEach(function(board) {

    /* ── CIE board: syllabus-driven rendering ── */
    if (board.id === 'cie' && typeof renderCIEHome === 'function' && _cieDataReady) {
      var cieHtml = renderCIEHome();
      if (cieHtml) {
        hasAnyResult = true;
        html += '<div class="board-section" id="board-cie">';
        html += '<div class="board-header">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '</div>';
        html += cieHtml;
        html += '</div>';
      }
      return;
    }

    /* ── Edexcel board: syllabus-driven rendering ── */
    if (board.id === 'edx' && typeof renderEdexcelHome === 'function' && _edxDataReady) {
      var edxHtml = renderEdexcelHome();
      if (edxHtml) {
        hasAnyResult = true;
        html += '<div class="board-section" id="board-edx">';
        html += '<div class="board-header">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '</div>';
        html += edxHtml;
        html += '</div>';
      }
      return;
    }

    /* ── HHK (25m) board: syllabus-driven rendering ── */
    if (board.id === '25m' && typeof renderHHKHome === 'function' && _hhkDataReady) {
      var hhkHtml = renderHHKHome();
      if (hhkHtml) {
        hasAnyResult = true;
        html += '<div class="board-section" id="board-25m">';
        html += '<div class="board-header">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '</div>';
        html += hhkHtml;
        html += '</div>';
      }
      return;
    }

    /* ── Non-CIE boards: original rendering ── */
    /* Pre-compute per-level stats + lock state for this board (indexed) */
    var wd = getWordData();
    var _ci = _ensureCatIndex();
    var _levelStats = {};
    var _levelLocked = {};
    board.categories.forEach(function(cat) {
      var entries = _ci[(board.id || '') + ':' + cat.id] || [];
      entries.forEach(function(e) {
        var locked = isGuestLocked(e.idx);
        _levelLocked[e.idx] = locked;
        if (!locked) _levelStats[e.idx] = getDeckStats(e.idx, wd);
      });
    });

    /* Compute board-level stats from pre-computed (star-weighted) */
    var boardTotalStars = 0, boardMaxStars = 0, boardMastered = 0, boardTotal = 0;
    for (var si in _levelStats) {
      var ls = _levelStats[si];
      boardTotal += ls.total;
      boardMastered += ls.mastered;
      boardTotalStars += Math.round(ls.learningPct * ls.total * 4 / 100);
      boardMaxStars += ls.total * 4;
    }
    var boardPct = boardMaxStars > 0 ? Math.round(boardTotalStars / boardMaxStars * 100) : 0;

    /* Build board HTML in temp var, only append if has matching content */
    var boardHtml = '';
    var is25m = board.id === '25m';
    board.categories.forEach(function(cat) {
      var entries = _ci[(board.id || '') + ':' + cat.id] || [];
      var catLevels = appSearch
        ? entries.filter(function(e) { return matchLevel(e.lv, appSearch); })
        : entries;
      if (catLevels.length === 0) return;

      var collapsed = appSearch ? false : (catCollapsed[cat.id] ? true : false);
      boardHtml += '<div class="category-section' + (collapsed ? ' collapsed' : '') + '" id="cat-' + cat.id + '">';
      boardHtml += '<div class="category-header" role="button" tabindex="0" onclick="toggleCategory(\'' + cat.id + '\')">';
      boardHtml += '<span class="category-emoji">' + cat.emoji + '</span>';
      boardHtml += '<span class="category-name">' + catName(cat) + '</span>';

      /* 25m: show unit count; Edexcel: show group count */
      if (is25m) {
        var unitSet = {};
        catLevels.forEach(function(cl) { if (cl.lv.unitNum) unitSet[cl.lv.unitNum] = true; });
        var unitCount = Object.keys(unitSet).length;
        boardHtml += '<span class="category-count">' + unitCount + ' ' + t('units', '\u5355\u5143') + '</span>';
      } else {
        boardHtml += '<span class="category-count">' + catLevels.length + ' ' + t('groups', '\u7ec4') + '</span>';
      }
      boardHtml += '<span class="category-chevron">\u25bc</span>';
      boardHtml += '</div>';

      boardHtml += '<div class="deck-list category-body">';

      /* Practice actions for Edexcel categories */
      if (!is25m && catLevels.length > 0) {
        var firstIdx = catLevels[0].idx;
        boardHtml += '<div class="pq-cat-actions">';
        boardHtml += '<button class="sort-btn" onclick="startPractice(' + firstIdx + ')">\ud83d\udcdd ' + t('Practice', '\u7ec3\u4e60') + '</button>';
        if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
          boardHtml += '<button class="sort-btn" onclick="startPracticeReview(' + firstIdx + ')">\ud83d\udccb ' + t('Review All', '\u603b\u89c8\u5168\u90e8') + '</button>';
        }
        boardHtml += '</div>';
      }

      if (is25m) {
        /* Group levels by unitNum, preserving order */
        var unitGroups = [];
        var unitMap = {};
        catLevels.forEach(function(cl) {
          var uNum = cl.lv.unitNum || 0;
          if (!unitMap[uNum]) {
            unitMap[uNum] = { unitNum: uNum, unitTitle: cl.lv.unitTitle || '', unitTitleZh: cl.lv.unitTitleZh || '', levels: [] };
            unitGroups.push(unitMap[uNum]);
          }
          unitMap[uNum].levels.push(cl);
        });

        unitGroups.forEach(function(ug) {
          var unitKey = cat.id + '-u' + ug.unitNum;
          /* Default collapsed unless searching */
          if (!(unitKey in unitCollapsed)) unitCollapsed[unitKey] = true;
          var uCollapsed = appSearch ? false : unitCollapsed[unitKey];

          var unitLabel = 'Unit ' + ug.unitNum + ' \u00b7 ' + ug.unitTitle;
          if (appLang !== 'en' && ug.unitTitleZh) unitLabel += ' ' + ug.unitTitleZh;

          boardHtml += '<div class="unit-section' + (uCollapsed ? ' collapsed' : '') + '" id="unit-' + unitKey + '">';
          boardHtml += '<div class="unit-header" role="button" tabindex="0" onclick="toggleUnit(\'' + unitKey + '\')">';
          boardHtml += '<span class="unit-name">' + unitLabel + '</span>';
          boardHtml += '<span class="unit-count">' + ug.levels.length + ' ' + t('groups', '\u7ec4') + '</span>';
          boardHtml += '<span class="unit-chevron">\u25bc</span>';
          boardHtml += '</div>';

          boardHtml += '<div class="unit-body">';
          ug.levels.forEach(function(cl) {
            boardHtml += renderDeckRow(cl, cat, _levelLocked, _levelStats);
          });
          boardHtml += '</div>';
          boardHtml += '</div>';
        });
      } else {
        /* Non-25m: flat rendering */
        catLevels.forEach(function(cl) {
          boardHtml += renderDeckRow(cl, cat, _levelLocked, _levelStats);
        });
      }

      if (typeof isSuperAdmin === 'function' && isSuperAdmin() && typeof vocabAdminAddBtn === 'function') {
        boardHtml += vocabAdminAddBtn(board.id, cat.id);
      }
      boardHtml += '</div>';
      boardHtml += '</div>';
    });

    if (boardHtml) {
      hasAnyResult = true;
      html += '<div class="board-section" id="board-' + board.id + '">';
      html += '<div class="board-header">';
      html += '<span class="board-emoji">' + board.emoji + '</span>';
      html += '<span class="board-name">' + boardName(board) + '</span>';
      html += '<span class="board-stats">' + boardMastered + '/' + boardTotal + ' \u2605 · ' + boardPct + '%</span>';
      html += '<span class="board-code">' + board.code + '</span>';
      html += '</div>';
      html += boardHtml;
      html += '</div>'; /* close board-section */
    }
  });

  if (appSearch && !hasAnyResult) {
    html += '<div class="text-center" style="color:var(--c-muted);padding:32px 0">' + t('No matching results', '\u65e0\u5339\u914d\u7ed3\u679c') + '</div>';
  }

  E('panel-home').innerHTML = html;
  updateSidebar();

  /* Async fill homework banner */
  if (isLoggedIn() && !isGuest() && userClassId && typeof renderHomeworkBanner === 'function') {
    renderHomeworkBanner();
  }

  /* Preload PP data for Smart Path scoring (fire-and-forget) */
  if (typeof loadPastPaperData === 'function') {
    var _ppInvalidate = function() {
      if (typeof _invalidateSectionHealthCache === 'function') _invalidateSectionHealthCache();
    };
    if (_cieDataReady) loadPastPaperData('cie').then(_ppInvalidate).catch(function() {});
    if (_edxDataReady) loadPastPaperData('edx').then(_ppInvalidate).catch(function() {});
  }

  /* Streak-at-risk reminder (20-48h since last activity) */
  setTimeout(function() {
    try {
      var st = loadS().streak;
      if (st && st.cur >= 1 && st.last) {
        var hrsAgo = (Date.now() - new Date(st.last + 'T00:00:00').getTime()) / 3600000;
        if (hrsAgo >= 20 && hrsAgo <= 48) {
          var today = new Date().toISOString().slice(0, 10);
          if (st.last !== today && typeof showNudge === 'function') {
            showNudge('streak_risk', t('Your ' + st.cur + '-day streak is at risk! Do a Daily Challenge to keep it going', '\u4f60\u7684 ' + st.cur + ' \u5929\u8fde\u7eed\u5b66\u4e60\u5373\u5c06\u4e2d\u65ad\uff01\u505a\u4e2a\u6bcf\u65e5\u6311\u6218\u7ee7\u7eed\u4fdd\u6301'), t('Go', '\u53bb\u6311\u6218'), function() { if (typeof startDailyChallenge === 'function') startDailyChallenge(); });
          }
        }
      }
    } catch (e) {}
  }, 500);

  /* Stage upgrade celebration + mode discovery reset */
  setTimeout(function() {
    try {
      var us = typeof getUserStage === 'function' ? getUserStage() : null;
      if (!us) return;
      var prevStage = localStorage.getItem('wmatch_user_stage') || 'new';
      var stages = ['new', 'active', 'intermediate', 'advanced'];
      var prevIdx = stages.indexOf(prevStage);
      var curIdx = stages.indexOf(us.stage);
      if (curIdx > prevIdx && prevIdx >= 0) {
        localStorage.setItem('wmatch_user_stage', us.stage);
        var msgs = {
          active: t('You\'ve mastered 10+ words! Keep exploring different modes', '\u5df2\u638c\u63e1 10+ \u8bcd\u6c47\uff01\u7ee7\u7eed\u63a2\u7d22\u4e0d\u540c\u6a21\u5f0f'),
          intermediate: t('100+ words mastered! You\'re becoming a math vocab expert', '\u638c\u63e1 100+ \u8bcd\u6c47\uff01\u4f60\u6b63\u5728\u6210\u4e3a\u6570\u5b66\u8bcd\u6c47\u8fbe\u4eba'),
          advanced: t('500+ words! You\'re a true math vocabulary master', '500+ \u8bcd\u6c47\uff01\u4f60\u662f\u771f\u6b63\u7684\u6570\u5b66\u8bcd\u6c47\u5927\u5e08')
        };
        if (typeof showNudge === 'function' && msgs[us.stage]) {
          showNudge('stage_' + us.stage, msgs[us.stage]);
        }
        /* Reset mode discovery dismissals so chips reappear */
        for (var dk in localStorage) {
          if (dk.indexOf('wmatch_disc_') === 0) {
            try { localStorage.removeItem(dk); } catch (e) {}
          }
        }
      } else if (curIdx >= 0 && prevStage !== us.stage) {
        localStorage.setItem('wmatch_user_stage', us.stage);
      }
    } catch (e) {}
  }, 1000);
}

/* ═══ DECK DETAIL ═══ */
function openDeck(idx) {
  /* Support slug string: resolve to numeric index */
  if (typeof idx === 'string' && isNaN(idx)) {
    var resolved = getLevelIdxBySlug(idx);
    if (resolved < 0) return;
    idx = resolved;
  }
  if (isGuestLocked(idx)) { showGuestLockPrompt(); return; }
  currentLvl = idx;
  renderDeck(idx);
  showPanel('deck');
}

/* Guest lock prompt modal */
function showGuestLockPrompt() {
  var html = '<div class="ms-modal-center">';
  html += '<div class="ms-modal-emoji">\ud83d\udd12</div>';
  html += '<div class="section-title">' + t('Login to Unlock', '\u767b\u5f55\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4') + '</div>';
  html += '<p style="color:var(--c-text2);font-size:14px;margin:12px 0 20px">' + t('Create a free account to access all vocabulary groups, track progress, and join the leaderboard.', '\u514d\u8d39\u6ce8\u518c\u8d26\u53f7\u5373\u53ef\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4\u3001\u8bb0\u5f55\u5b66\u4e60\u8fdb\u5ea6\u5e76\u52a0\u5165\u6392\u884c\u699c\u3002') + '</p>';
  html += '<div class="btn-row btn-row--mt0">';
  html += '<button class="btn btn-primary flex-1" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
  html += '<button class="btn btn-ghost flex-1" onclick="hideModal()">' + t('Later', '\u7a0d\u540e') + '</button>';
  html += '</div></div>';
  showModal(html);
}

/* Guest signup prompt modal (benefits-focused, replaces lock prompt when GUEST_FULL_ACCESS) */
function showGuestSignupPrompt() {
  var html = '<div class="ms-modal-center">';
  html += '<div class="ms-modal-emoji">\u2728</div>';
  html += '<div class="section-title">' + t('Register for Free', '\u514d\u8d39\u6ce8\u518c') + '</div>';
  html += '<div class="ms-benefits-list">';
  html += '<div>\u2705 ' + t('Sync progress across devices', '\u8de8\u8bbe\u5907\u540c\u6b65\u5b66\u4e60\u8fdb\u5ea6') + '</div>';
  html += '<div>\ud83c\udfc6 ' + t('Join the leaderboard', '\u52a0\u5165\u6392\u884c\u699c\u7ade\u4e89') + '</div>';
  html += '<div>\ud83d\udcca ' + t('Track your learning history', '\u8bb0\u5f55\u5b66\u4e60\u5386\u53f2\u6570\u636e') + '</div>';
  html += '</div>';
  html += '<div class="btn-row btn-row--mt0">';
  html += '<button class="btn btn-primary flex-1" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
  html += '<button class="btn btn-ghost flex-1" onclick="hideModal()">' + t('Later', '\u7a0d\u540e') + '</button>';
  html += '</div></div>';
  showModal(html);
}

function renderDeck(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var sorted = sortCards(pairs);
  var wd = getWordData();

  var html = '';

  /* Header */
  html += '<div class="deck-header">';
  if (window._kpReturnContext) {
    var _kpRet = window._kpReturnContext;
    html += '<button class="back-btn" data-action="back" data-back="kp" data-kp-id="' + escapeHtml(_kpRet.kpId) + '" data-kp-board="' + escapeHtml(_kpRet.board) + '">\u2190</button>';
    window._kpReturnContext = null;
  } else if (lv._isSection && lv._section) {
    var _backBoard = lv._board || 'cie';
    html += '<button class="back-btn" data-action="back" data-back="section" data-sec-id="' + escapeHtml(lv._section) + '" data-sec-board="' + escapeHtml(_backBoard) + '">\u2190</button>';
    html += '<div class="deck-title">\ud83d\udcdd ' + lvTitle(lv) + '</div>';
  } else if (lv.board === '25m' && lv.unitNum) {
    html += '<button class="back-btn" data-action="back" data-back="home">\u2190</button>';
    var yn = lv.category.replace('25m-y', '');
    html += '<div class="deck-title">Y' + yn + '.' + lv.unitNum + ' \u00b7 ' + lvTitle(lv) + '</div>';
  } else {
    html += '<button class="back-btn" data-action="back" data-back="home">\u2190</button>';
    var catInfo = getCategoryInfo(lv.category);
    html += '<div class="deck-title">' + catInfo.emoji + ' ' + lvTitle(lv) + '</div>';
  }
  html += '</div>';

  /* Learning path + extra practice */
  html += '<div class="mode-path">';
  html += '<div class="mode-path-label">' + t('Learning Path', '\u5b66\u4e60\u8def\u5f84') + '</div>';
  html += '<div class="mode-path-row">';
  var pathModes = [
    { emoji: '\ud83d\udcd6', name: t('Scan', '\u626b\u63cf'), mode: 'study' },
    { emoji: '\u2753', name: t('Quiz', '\u6d4b\u9a8c'), mode: 'quiz' }
  ];
  var pathKeys = ['study', 'quiz'];
  pathModes.forEach(function(m, i) {
    if (i > 0) html += '<span class="mode-arrow">\u2192</span>';
    var done = isModeDone(idx, pathKeys[i]);
    html += '<button class="mode-btn mode-btn-path" data-action="mode" data-mode="' + m.mode + '" data-li="' + idx + '">';
    if (done) html += '<span class="mode-done">\u2713</span>';
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  html += '<div class="mode-extra">';
  html += '<div class="mode-extra-label">' + t('More Practice', '\u66f4\u591a\u7ec3\u4e60') + '</div>';
  html += '<div class="mode-extra-row">';
  var extraModes = [
    { emoji: '\u2328\ufe0f', name: t('Spell', '\u62fc\u5199'), mode: 'spell' },
    { emoji: '\ud83d\udd17', name: t('Match', '\u914d\u5bf9'), mode: 'match' },
    { emoji: '\u2694\ufe0f', name: t('Battle', '\u5b9e\u6218'), mode: 'battle' }
  ];
  var extraKeys = ['spell', 'match', 'battle'];
  extraModes.forEach(function(m, i) {
    var done = isModeDone(idx, extraKeys[i]);
    html += '<button class="mode-btn mode-btn-extra" data-action="mode" data-mode="' + m.mode + '" data-li="' + idx + '">';
    if (done) html += '<span class="mode-done">\u2713</span>';
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  html += '<div class="preview-link"><button class="btn-link" data-action="preview" data-li="' + idx + '">\ud83d\udc41 ' + t('Preview all words', '\u9884\u89c8\u5168\u90e8\u8bcd\u6c47') + ' \u2192</button></div>';

  /* Sort bar */
  html += '<div class="sort-bar">';
  [['default', t('Default', '\u9ed8\u8ba4')], ['az', 'A-Z'], ['random', t('Random', '\u968f\u673a')], ['hard', t('Hard first', '\u96be\u8bcd\u4f18\u5148')]].forEach(function(s) {
    html += '<button class="sort-btn' + (appSort === s[0] ? ' active' : '') + '" onclick="setSort(\'' + s[0] + '\',' + idx + ')">' + s[1] + '</button>';
  });
  html += '</div>';

  /* FLM deck stats bar */
  var _ds = getDeckStats(idx);
  var _poolCount = _ds.learningCount + _ds.uncertainCount;
  var _chRound = typeof getChapterRound === 'function' ? getChapterRound(lv.slug || idx, lv.board || '') : { round: 0 };
  html += '<div class="pool-bar-wrap" style="margin:0 0 12px">';
  html += '<div class="pool-bar">';
  var _newPct = _ds.total > 0 ? Math.round(_ds.newCount / _ds.total * 100) : 0;
  var _poolPct = _ds.total > 0 ? Math.round(_poolCount / _ds.total * 100) : 0;
  var _mastPct = _ds.total > 0 ? Math.round(_ds.mastered / _ds.total * 100) : 0;
  html += '<div class="pool-bar-mastered" style="width:' + _mastPct + '%"></div>';
  html += '<div class="pool-bar-pool" style="width:' + _poolPct + '%"></div>';
  html += '</div>';
  html += '<div style="font-size:12px;color:var(--c-text2);margin-top:6px;display:flex;justify-content:space-between">';
  html += '<span>' + t('Mastered', '\u5df2\u638c\u63e1') + ' ' + _ds.mastered + ' / ' + _ds.total + '</span>';
  html += '<span>' + t('Pool', '\u5b66\u4e60\u6c60') + ': ' + _poolCount + ' ' + t('words', '\u8bcd') + '</span>';
  html += '</div></div>';

  /* Filter bar — status chips */
  html += '<div class="deck-filter-bar">';
  html += '<div class="flm-filter-chips" id="flm-filter-chips">';
  var _flmFilters = [
    { key: 'all', label: t('All', '\u5168\u90e8'), count: _ds.total },
    { key: 'new', label: t('New', '\u672a\u5b66'), count: _ds.newCount },
    { key: 'learning', label: t('Learning', '\u5b66\u4e60\u4e2d'), count: _ds.learningCount },
    { key: 'uncertain', label: t('Uncertain', '\u6a21\u7cca'), count: _ds.uncertainCount },
    { key: 'mastered', label: t('Mastered', '\u5df2\u638c\u63e1'), count: _ds.mastered }
  ];
  _flmFilters.forEach(function(f) {
    var isActive = (!_deckFLMFilter && f.key === 'all') || _deckFLMFilter === f.key;
    html += '<button class="flm-chip' + (isActive ? ' active' : '') + '" onclick="_setFLMFilter(\'' + f.key + '\',' + idx + ')">';
    html += f.label + ' <span class="flm-chip-count">' + f.count + '</span></button>';
  });
  html += '</div>';
  html += '</div>';

  /* Filter bar */
  html += '<div class="deck-filter-bar">';
  html += '<button class="sort-btn' + (_deckSelectMode ? ' active' : '') + '" onclick="toggleDeckSelect(' + idx + ')">';
  html += (_deckSelectMode ? '\u2611' : '\u2610') + ' ' + t('Select', '\u9009\u62e9') + '</button>';
  html += '<button class="sort-btn' + (_deckHideMastered ? ' active' : '') + '" onclick="toggleHideMastered(' + idx + ')">';
  html += '\u26a1 ' + t('Hide Mastered', '\u9690\u85cf\u5df2\u638c\u63e1') + '</button>';
  if (_deckSelectMode) {
    html += '<button class="sort-btn" onclick="selectAllUnmastered(' + idx + ')">' + t('Select Unmastered', '\u5168\u9009\u672a\u638c\u63e1') + '</button>';
    html += '<span class="deck-filter-count">' + _deckSelectCount + '/' + pairs.length + '</span>';
  }
  html += '</div>';

  /* Word list */
  var visibleCount = 0;
  html += '<div class="word-list">';
  sorted.forEach(function(p) {
    var key = wordKey(idx, p.lid);
    var d = wd[key];
    var ok = d ? (d.ok || 0) : 0;
    var fail = d ? (d.fail || 0) : 0;
    var fs = d ? (d.fs || 'new') : 'new';
    var flmColor = FLM_COLORS[fs] || FLM_COLORS['new'];
    var flmLabel = appLang === 'en' ? FLM_LABELS[fs] : FLM_LABELS_ZH[fs];
    var wSrc = d ? (d.src || '') : '';
    var wFr = d ? (d.fr || 0) : 0;

    /* FLM filter */
    if (_deckFLMFilter && fs !== _deckFLMFilter) return;
    /* Legacy hide mastered */
    if (_deckHideMastered && fs === 'mastered') return;
    visibleCount++;

    var isSelected = _deckSelectMode && _deckSelectedWords[p.lid];
    html += '<div class="word-row' + (isSelected ? ' word-row-selected' : '') + '"';
    if (_deckSelectMode) {
      html += ' onclick="toggleWordSelect(' + idx + ',' + p.lid + ')" style="cursor:pointer"';
    }
    html += '>';

    if (_deckSelectMode) {
      html += '<span class="word-check">' + (isSelected ? '\u2611' : '\u2610') + '</span>';
    }

    html += '<div class="word-en">' + escapeHtml(p.word) + '</div>';
    if (appLang === 'bilingual') {
      html += '<div class="word-zh">' + escapeHtml(p.def) + '</div>';
    }

    /* FLM status tag */
    var tagExtra = '';
    if ((fs === 'uncertain' || fs === 'learning') && wFr > 0) tagExtra = ' \u00b7 R' + wFr;
    if (fs === 'mastered') tagExtra = ' \u2713';
    html += '<span class="word-status status-' + fs + '" style="background:' + flmColor + '18;color:' + flmColor + '">' + flmLabel + tagExtra + '</span>';

    /* Source tag */
    if (wSrc === 'reflow') {
      html += '<span class="source-tag">' + t('From Mistakes', '\u6765\u81ea\u9519\u9898') + '</span>';
    }

    if (ok > 0 || fail > 0) {
      html += '<span class="word-stats">\u2713' + ok + ' \u2717' + fail + '</span>';
    }
    html += '</div>';
  });

  if ((_deckHideMastered || _deckFLMFilter) && visibleCount === 0) {
    html += '<div style="text-align:center;color:var(--c-muted);padding:20px 0">';
    html += _deckFLMFilter
      ? t('No words with this status', '\u6ca1\u6709\u8be5\u72b6\u6001\u7684\u8bcd\u6c47')
      : t('All words mastered! Well done!', '\u5168\u90e8\u638c\u63e1\uff01\u592a\u68d2\u4e86\uff01');
    html += '</div>';
  }
  html += '</div>';

  /* Select mode actions */
  if (_deckSelectMode && _deckSelectCount > 0) {
    html += '<div class="deck-select-actions">';
    html += '<button class="btn btn-primary btn-sm" onclick="studySelected(' + idx + ')">';
    html += '\ud83d\udcd6 ' + t('Study Selected', '\u5b66\u4e60\u9009\u4e2d') + ' (' + _deckSelectCount + ')</button>';
    html += '<button class="btn btn-sm" onclick="quizSelected(' + idx + ')">';
    html += '\u2753 ' + t('Quiz Selected', '\u6d4b\u9a8c\u9009\u4e2d') + '</button>';
    html += '<button class="btn btn-ghost btn-sm" onclick="clearSelection(' + idx + ')">';
    html += t('Clear', '\u6e05\u9664') + '</button>';
    html += '</div>';
  }

  E('panel-deck').innerHTML = html;
}

function setSort(s, idx) {
  appSort = s;
  renderDeck(idx);
}

/* ═══ WORD FILTER HANDLERS ═══ */

function toggleDeckSelect(idx) {
  _deckSelectMode = !_deckSelectMode;
  if (!_deckSelectMode) {
    _deckSelectedWords = {};
    _deckSelectCount = 0;
  }
  renderDeck(idx);
}

function toggleHideMastered(idx) {
  _deckHideMastered = !_deckHideMastered;
  try {
    var prefs = JSON.parse(localStorage.getItem('word_filter_prefs')) || {};
    prefs.hideMastered = _deckHideMastered;
    localStorage.setItem('word_filter_prefs', JSON.stringify(prefs));
  } catch(e) {}
  renderDeck(idx);
}

function toggleWordSelect(idx, lid) {
  if (!_deckSelectMode) return;
  if (_deckSelectedWords[lid]) {
    delete _deckSelectedWords[lid];
    _deckSelectCount--;
  } else {
    _deckSelectedWords[lid] = true;
    _deckSelectCount++;
  }
  renderDeck(idx);
}

function clearSelection(idx) {
  _deckSelectedWords = {};
  _deckSelectCount = 0;
  renderDeck(idx);
}

function selectAllUnmastered(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var wd = getWordData();
  _deckSelectedWords = {};
  _deckSelectCount = 0;
  pairs.forEach(function(p) {
    var key = wordKey(idx, p.lid);
    var d = wd[key];
    var fs = d ? (d.fs || 'new') : 'new';
    if (fs !== 'mastered') {
      _deckSelectedWords[p.lid] = true;
      _deckSelectCount++;
    }
  });
  renderDeck(idx);
}

function studySelected(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var subset = pairs.filter(function(p) { return _deckSelectedWords[p.lid]; });
  if (subset.length === 0) {
    showToast(t('No words selected', '\u672a\u9009\u62e9\u5355\u8bcd'));
    return;
  }
  startStudy(idx, shuffle(subset));
}

function quizSelected(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var subset = pairs.filter(function(p) { return _deckSelectedWords[p.lid]; });
  if (subset.length < 4) {
    showToast(t('Select at least 4 words for quiz', '\u81f3\u5c11\u9009\u62e9 4 \u4e2a\u5355\u8bcd\u624d\u80fd\u6d4b\u9a8c'));
    return;
  }
  startQuiz(idx, subset);
}

/* ═══ QUICK BROWSE MODAL ═══ */
function openPreview(idx) {
  currentLvl = idx;
  renderPreview(idx);
  showPanel('preview');
}

function renderPreview(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);

  var html = '';
  html += '<div class="deck-header">';
  html += '<button class="back-btn" onclick="openDeck(' + idx + ')">\u2190</button>';
  html += '<div class="deck-title">' + t('Preview', '\u9884\u89c8') + ': ' + lvTitle(lv) + '</div>';
  html += '</div>';

  html += '<div class="preview-grid">';
  pairs.forEach(function(p, i) {
    html += '<div class="preview-card">';
    html += '<div class="preview-num">#' + (i + 1) + '</div>';
    html += '<div class="preview-en">' + escapeHtml(p.word) + '</div>';
    if (appLang === 'bilingual') {
      html += '<div class="preview-zh">' + escapeHtml(p.def) + '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="ms-preview-actions">';
  html += '<button class="btn btn-secondary" onclick="openDeck(' + idx + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  html += '<button class="btn btn-ghost no-print" onclick="window.print()">\ud83d\udda8 ' + t('Print', '\u6253\u5370') + '</button>';
  html += '</div>';

  E('panel-preview').innerHTML = html;
}

/* ═══ HOME SEARCH ═══ */
var searchTimer = null;
function onHomeSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    appSearch = val.toLowerCase().trim();
    renderHome();
    var el = E('home-search');
    if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; }
  }, 200);
}

function clearHomeSearch() {
  appSearch = '';
  renderHome();
}

/* ═══ SMART PATH TOGGLE ═══ */
function toggleSmartPath() {
  var box = document.getElementById('smart-path-box');
  if (!box) return;
  var isCollapsed = !box.classList.contains('collapsed');
  try { localStorage.setItem('sp_collapsed', isCollapsed ? '1' : '0'); } catch(e) {}
  box.classList.toggle('collapsed', isCollapsed);
}

/* Delegate mode button clicks in deck panel */
var _deckActionDelegated = false;
function _initDeckActionDelegation() {
  if (_deckActionDelegated) return;
  _deckActionDelegated = true;
  var modeFns = {
    study: startStudy, quiz: startQuiz,
    spell: startSpell, match: startMatch, battle: startBattle
  };
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var li;

    if (action === 'mode') {
      var mode = btn.getAttribute('data-mode');
      li = parseInt(btn.getAttribute('data-li'), 10);
      if (modeFns[mode] && !isNaN(li)) modeFns[mode](li);
    } else if (action === 'preview') {
      li = parseInt(btn.getAttribute('data-li'), 10);
      if (!isNaN(li)) openPreview(li);
    } else if (action === 'back') {
      var backType = btn.getAttribute('data-back');
      if (backType === 'home') {
        navTo('home');
      } else if (backType === 'section') {
        var secId = btn.getAttribute('data-sec-id');
        var secBoard = btn.getAttribute('data-sec-board');
        if (typeof openSection === 'function') openSection(secId, secBoard);
      } else if (backType === 'kp') {
        window._kpReturnContext = null;
        var kpId = btn.getAttribute('data-kp-id');
        var kpBoard = btn.getAttribute('data-kp-board');
        if (typeof openKnowledgePoint === 'function') openKnowledgePoint(kpId, kpBoard);
      }
    }
  });
}
_initDeckActionDelegation();

/* ═══ REFLUX RECOMMENDATION (#15) ═══ */
function _renderRefluxRec() {
  var modes = ['battle', 'spell', 'match'];
  var modeInfo = {
    battle: { emoji: '\u2694\ufe0f', en: 'Battle', zh: '实战' },
    spell: { emoji: '\u2328\ufe0f', en: 'Spell', zh: '拼写' },
    match: { emoji: '\ud83d\udd17', en: 'Match', zh: '配对' }
  };
  var recs = [];
  for (var i = 0; i < LEVELS.length && recs.length < 20; i++) {
    if (!isModeDone(i, 'study')) continue;
    for (var m = 0; m < modes.length; m++) {
      if (!isModeDone(i, modes[m])) {
        recs.push({ li: i, mode: modes[m], title: lvTitle(LEVELS[i]) });
      }
    }
  }
  if (recs.length === 0) return '';
  var dayIdx = Math.floor(Date.now() / 86400000);
  var rec = recs[dayIdx % recs.length];
  var info = modeInfo[rec.mode];
  return '<div class="reflux-rec">' +
    '<span class="reflux-icon">\ud83d\udca1</span>' +
    '<span class="reflux-text">' + t('Try something new:', '试试新模式：') + '</span>' +
    '<button class="btn btn-ghost btn-sm" data-action="reflux" data-mode="' + rec.mode + '" data-li="' + rec.li + '">' +
    info.emoji + ' ' + t(info.en, info.zh) + ' — ' + escapeHtml(rec.title) + '</button>' +
    '</div>';
}

/* Reflux click delegation */
var _refluxDelegated = false;
function _initRefluxDelegation() {
  if (_refluxDelegated) return;
  _refluxDelegated = true;
  var fns = { battle: startBattle, spell: startSpell, match: startMatch };
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action="reflux"]');
    if (!btn) return;
    var mode = btn.getAttribute('data-mode');
    var li = parseInt(btn.getAttribute('data-li'), 10);
    if (fns[mode] && !isNaN(li)) fns[mode](li);
  });
}
_initRefluxDelegation();
