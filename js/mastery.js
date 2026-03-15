/* ══════════════════════════════════════════════════════════════
   mastery.js — Home dashboard, deck detail, mode selection, sort
   ══════════════════════════════════════════════════════════════ */

/* ═══ WORD FILTER STATE ═══ */
var _deckSelectMode = false;
var _deckHideMastered = false;
var _deckSelectedWords = {};
var _deckSelectCount = 0;
var _deckFLMFilter = null; /* null='all', 'new', 'learning', 'uncertain', 'mastered' */

/* _setFLMFilter, renderDeck, renderPreview, setSort, toggleDeckSelect,
   toggleHideMastered, toggleWordSelect, clearSelection, selectAllUnmastered,
   studySelected, quizSelected, openPreview, _initDeckActionDelegation
   → moved to deck-detail.js (lazy-loaded) */

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
  if (all.length === 0) return { total: 0, mastered: 0, learningPct: 0, masteryPct: 0, kpTotal: 0, kpMastered: 0, badgeCount: 0 };
  var mastered = 0;
  all.forEach(function(w) { if (w.fs === 'mastered') mastered++; });
  var masteryPct = Math.round(mastered / all.length * 100);
  /* KP mastery stats */
  var kpMastered = 0, kpTotal = 0;
  var s = loadS();
  if (s.kpDone) {
    for (var k in s.kpDone) { kpTotal++; if (s.kpDone[k].fs === 'mastered') kpMastered++; }
  }
  /* Badge count */
  var badgeCount = typeof getUnlockedBadges === 'function' ? getUnlockedBadges().length : 0;
  return {
    total: all.length,
    mastered: mastered,
    learningPct: masteryPct,
    masteryPct: masteryPct,
    kpTotal: kpTotal,
    kpMastered: kpMastered,
    badgeCount: badgeCount
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
      /* 25m: user's own year default expanded, others collapsed */
      var defaultCollapsed = (typeof userBoard !== 'undefined' && userBoard && c.id === userBoard) ? false : true;
      catCollapsed[c.id] = saved && c.id in saved ? saved[c.id] : defaultCollapsed;
    });
  });
})();

/* Unit collapse state (25m only, default all collapsed) */
var unitCollapsed = (function() {
  try { return JSON.parse(localStorage.getItem('wmatch_unitCollapsed')) || {}; } catch(e) { return {}; }
})();

/* Board section collapse state (default expanded) */
var boardCollapsed = (function() {
  try { return JSON.parse(localStorage.getItem('wmatch_boardCollapsed')) || {}; } catch(e) { return {}; }
})();

function toggleBoard(boardId) {
  boardCollapsed[boardId] = !boardCollapsed[boardId];
  var el = document.getElementById('board-' + boardId);
  if (el) el.classList.toggle('collapsed', boardCollapsed[boardId]);
  try { localStorage.setItem('wmatch_boardCollapsed', JSON.stringify(boardCollapsed)); } catch(e) {}
}

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
  var dcData = typeof getDailyData === 'function' ? getDailyData() : null;

  /* Check all syllabus boards for in-progress or next sections */
  var inProgress = null;
  var nextNew = null;
  for (var i = 0; i < boards.length; i++) {
    var bid = boards[i].id;
    var syllabusBoard = bid === '25m' ? 'hhk' : bid;
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

  /* Priority: 0. Stale words → 1. Stale KPs → 2. Stale PPs → 3. In-progress → 4. Daily → 5. Next new */
  var staleN = typeof getStaleCount === 'function' ? getStaleCount() : 0;
  if (staleN >= 5) {
    return { type: 'refresh', count: staleN };
  }
  var staleKPN = typeof getStaleKPCount === 'function' ? getStaleKPCount() : 0;
  if (staleKPN >= 2) {
    return { type: 'kp-refresh', count: staleKPN };
  }
  var stalePPN = typeof getStalePPCount === 'function' ? getStalePPCount() : 0;
  if (stalePPN >= 3) {
    return { type: 'pp-refresh', count: stalePPN };
  }
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
  if (dueCount > 0) details.push(dueCount + ' ' + t('words to revisit', '\u8bcd\u5f85\u56de\u987e'));
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
  /* Keyboard a11y (Enter/Space) now handled by global role="button" delegation in ui.js */
}

/* Zone 1: Hero Action Card */
function _renderHeroAction() {
  var gs = getGlobalStats();
  var streakN = getStreakCount();
  var homeRank = getRank();
  var action = _getNextAction(0);
  var dcData = typeof getDailyData === 'function' ? getDailyData() : null;
  var wg = typeof getWeeklyGoal === 'function' ? getWeeklyGoal() : null;

  var html = '<div class="hero-card">';

  /* Daily welcome (first visit of the day) */
  var todayKey = new Date().toLocaleDateString('en-CA');
  var lastWelcome = '';
  try { lastWelcome = localStorage.getItem('wmatch_last_welcome') || ''; } catch(e) {}
  if (todayKey !== lastWelcome) {
    try { localStorage.setItem('wmatch_last_welcome', todayKey); } catch(e) {}
    var welcomeMsg;
    if (gs.mastered === 0 && gs.kpMastered === 0) welcomeMsg = t('Welcome! Learn at your own pace — no pressure.', '\u6b22\u8fce\uff01\u6309\u81ea\u5df1\u7684\u8282\u594f\u5b66\u4e60\u2014\u2014\u6ca1\u6709\u538b\u529b\u3002');
    else if (streakN >= 7) welcomeMsg = t('Amazing dedication!', '\u575a\u6301\u5f97\u592a\u68d2\u4e86\uff01');
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
  html += '<span class="hero-rank" data-hero-action="stats">' + homeRank.emoji + ' '
    + t(gs.mastered + ' words \u00b7 ' + gs.kpMastered + ' KPs mastered',
        '\u5df2\u638c\u63e1 ' + gs.mastered + ' \u8bcd \u00b7 ' + gs.kpMastered + ' \u77e5\u8bc6\u70b9') + '</span>';
  html += '</div>';

  /* Main action area */
  html += '<div class="hero-main">';
  if (action.type === 'continue') {
    html += '<div class="hero-label">' + t('Continue', '\u7ee7\u7eed\u5b66\u4e60') + '</div>';
    html += '<div class="hero-section">' + escapeHtml(appLang === 'zh' && action.labelZh ? action.labelZh : action.label) + '</div>';
    if (appLang === 'bilingual' && action.labelZh) html += '<div class="hero-section-zh">' + escapeHtml(action.labelZh) + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="continue" data-hero-sec="' + action.section.id + '" data-hero-board="' + action.board + '">';
    html += t('Continue Learning', '\u7ee7\u7eed\u5b66\u4e60') + ' \u2192</button>';
  } else if (action.type === 'daily') {
    html += '<div class="hero-label">' + t('Daily Challenge', '\u6bcf\u65e5\u6311\u6218') + '</div>';
    html += '<div class="hero-section">' + t('10 words \u00b7 60 seconds \u00b7 test your speed!', '10 \u4e2a\u8bcd \u00b7 60 \u79d2 \u00b7 \u6d4b\u8bd5\u4f60\u7684\u901f\u5ea6\uff01') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="daily">';
    html += t('GO', '\u5f00\u59cb') + ' \u2192</button>';
  } else if (action.type === 'refresh') {
    html += '<div class="hero-label">' + t('Refresh Review', '\u8f7b\u91cf\u590d\u67e5') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('mastered words ready for another round', '\u4e2a\u5df2\u638c\u63e1\u8bcd\u6c47\u9700\u8981\u518d\u8fc7\u4e00\u8f6e') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="refresh">';
    html += '\ud83d\udd04 ' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + ' \u2192</button>';
  } else if (action.type === 'kp-refresh') {
    html += '<div class="hero-label">' + t('Knowledge Point Review', '\u77e5\u8bc6\u70b9\u590d\u67e5') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('mastered KPs ready for another round', '\u4e2a\u5df2\u638c\u63e1\u77e5\u8bc6\u70b9\u9700\u8981\u518d\u8fc7\u4e00\u8f6e') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="kp-refresh">';
    html += '\ud83d\udd04 ' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + ' \u2192</button>';
  } else if (action.type === 'pp-refresh') {
    html += '<div class="hero-label">' + t('Past Paper Review', '\u771f\u9898\u590d\u67e5') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('mastered questions ready for another round', '\u4e2a\u5df2\u638c\u63e1\u771f\u9898\u9700\u8981\u518d\u8fc7\u4e00\u8f6e') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="pp-refresh">';
    html += '\ud83d\udd04 ' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + ' \u2192</button>';
  } else if (action.type === 'start') {
    html += '<div class="hero-label">' + t('Up next', '\u4e0b\u4e00\u7ad9') + '</div>';
    html += '<div class="hero-section">' + escapeHtml(appLang === 'zh' && action.labelZh ? action.labelZh : action.label) + '</div>';
    if (appLang === 'bilingual' && action.labelZh) html += '<div class="hero-section-zh">' + escapeHtml(action.labelZh) + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="start" data-hero-sec="' + action.section.id + '" data-hero-board="' + action.board + '">';
    html += t('Start Learning', '\u5f00\u59cb\u5b66\u4e60') + ' \u2192</button>';
  } else {
    html += '<div class="hero-label">' + t('Explore', '\u63a2\u7d22') + '</div>';
    html += '<div class="hero-section">' + t('Pick any topic below — Study shows definitions, Quiz tests you!', '\u9009\u62e9\u4efb\u4f55\u4e3b\u9898\u2014\u2014\u626b\u63cf\u6a21\u5f0f\u770b\u5b9a\u4e49\uff0c\u6d4b\u9a8c\u6a21\u5f0f\u8003\u8003\u4f60\uff01') + '</div>';
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
    } else if (act === 'refresh') {
      var _stale = typeof getStaleWords === 'function' ? getStaleWords() : [];
      if (_stale.length > 0) _lazyCall('study-quiz-battle', 'startRefreshScan', [_stale]);
    } else if (act === 'daily') {
      startDaily();
    } else if (act === 'rank') {
      _lazyCall('board-guides', 'showRankGuide', []);
    } else if (act === 'kp-refresh') {
      _lazyCall('study-quiz-battle', 'startKPRefreshScan', []);
    } else if (act === 'pp-refresh') {
      _lazyCall('practice', 'startPPRefreshScan', []);
    } else if (act === 'stats') {
      navTo('stats');
    }
  });
}

/* Zone 2: Quick Stats Strip */
function _renderQuickStats() {
  var gs = getGlobalStats();
  var streakN = getStreakCount();
  var html = '<div class="quick-stats" data-hero-action="stats">';
  html += '<span class="qs-pill">\ud83d\udd25 ' + streakN + t('d', '\u5929') + '</span>';
  html += '<span class="qs-pill">\ud83d\udcd6 ' + gs.mastered + t(' words mastered', '\u8bcd\u5df2\u638c\u63e1') + '</span>';
  html += '<span class="qs-pill">\ud83e\udde0 ' + gs.kpMastered + t(' KPs', '\u77e5\u8bc6\u70b9') + '</span>';
  html += '<span class="qs-pill">\ud83c\udfc5 ' + gs.badgeCount + t(' badges', '\u679a\u5fbd\u7ae0') + '</span>';
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
        html += '<div class="board-section' + (boardCollapsed['cie'] ? ' collapsed' : '') + '" id="board-cie">';
        html += '<div class="board-header" role="button" tabindex="0" onclick="toggleBoard(\'cie\')">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '<span class="board-chevron">\u25bc</span>';
        html += '</div>';
        html += '<div class="board-body">' + cieHtml + '</div>';
        html += '</div>';
      }
      return;
    }

    /* ── Edexcel board: syllabus-driven rendering ── */
    if (board.id === 'edx' && typeof renderEdxHome === 'function' && _edxDataReady) {
      var edxHtml = renderEdxHome();
      if (edxHtml) {
        hasAnyResult = true;
        html += '<div class="board-section' + (boardCollapsed['edx'] ? ' collapsed' : '') + '" id="board-edx">';
        html += '<div class="board-header" role="button" tabindex="0" onclick="toggleBoard(\'edx\')">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '<span class="board-chevron">\u25bc</span>';
        html += '</div>';
        html += '<div class="board-body">' + edxHtml + '</div>';
        html += '</div>';
      }
      return;
    }

    /* ── HHK (25m) board: syllabus-driven rendering ── */
    if (board.id === '25m' && typeof renderHHKHome === 'function' && _hhkDataReady) {
      var hhkHtml = renderHHKHome();
      if (hhkHtml) {
        hasAnyResult = true;
        html += '<div class="board-section' + (boardCollapsed['25m'] ? ' collapsed' : '') + '" id="board-25m">';
        html += '<div class="board-header" role="button" tabindex="0" onclick="toggleBoard(\'25m\')">';
        html += '<span class="board-emoji">' + board.emoji + '</span>';
        html += '<span class="board-name">' + boardName(board) + '</span>';
        html += '<span class="board-code">' + board.code + '</span>';
        html += '<span class="board-chevron">\u25bc</span>';
        html += '</div>';
        html += '<div class="board-body">' + hhkHtml + '</div>';
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
      boardHtml += '<div class="category-header" role="button" tabindex="0" onclick="toggleCategory(\'' + escapeHtml(cat.id) + '\')">';
      boardHtml += '<span class="category-emoji">' + cat.emoji + '</span>';
      boardHtml += '<span class="category-name">' + catName(cat) + '</span>';

      boardHtml += '<span class="category-count">' + catLevels.length + ' ' + t('groups', '\u7ec4') + '</span>';
      boardHtml += '<span class="category-chevron">\u25bc</span>';
      boardHtml += '</div>';

      boardHtml += '<div class="deck-list category-body">';

      /* Practice actions for non-25m categories */
      if (!is25m && catLevels.length > 0) {
        var firstIdx = catLevels[0].idx;
        boardHtml += '<div class="pq-cat-actions">';
        boardHtml += '<button class="sort-btn" onclick="(typeof startPractice===\'function\'?startPractice(' + firstIdx + '):_lazyLoad(\'practice\',function(){startPractice(' + firstIdx + ')}))">\ud83d\udcdd ' + t('Practice', '\u7ec3\u4e60') + '</button>';
        if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
          boardHtml += '<button class="sort-btn" onclick="_lazyCall(\'practice\',\'startPracticeReview\',[' + firstIdx + '])">\ud83d\udccb ' + t('Review All', '\u603b\u89c8\u5168\u90e8') + '</button>';
        }
        boardHtml += '</div>';
      }

      /* Flat rendering for all boards (25m units merged, no sub-grouping needed) */
      catLevels.forEach(function(cl) {
        boardHtml += renderDeckRow(cl, cat, _levelLocked, _levelStats);
      });

      if (typeof isSuperAdmin === 'function' && isSuperAdmin() && typeof vocabAdminAddBtn === 'function') {
        boardHtml += vocabAdminAddBtn(board.id, cat.id);
      }
      boardHtml += '</div>';
      boardHtml += '</div>';
    });

    if (boardHtml) {
      hasAnyResult = true;
      html += '<div class="board-section' + (boardCollapsed[board.id] ? ' collapsed' : '') + '" id="board-' + board.id + '">';
      html += '<div class="board-header" role="button" tabindex="0" onclick="toggleBoard(\'' + escapeHtml(board.id) + '\')">';
      html += '<span class="board-emoji">' + board.emoji + '</span>';
      html += '<span class="board-name">' + boardName(board) + '</span>';
      html += '<span class="board-stats">' + boardMastered + '/' + boardTotal + ' \u2605 · ' + boardPct + '%</span>';
      html += '<span class="board-code">' + board.code + '</span>';
      html += '<span class="board-chevron">\u25bc</span>';
      html += '</div>';
      html += '<div class="board-body">' + boardHtml + '</div>';
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
            showNudge('streak_risk', t('Keep your ' + st.cur + '-day streak alive! A quick Daily Challenge will do it', '\u4f60\u5df2\u8fde\u7eed\u5b66\u4e60 ' + st.cur + ' \u5929\uff0c\u5feb\u6765\u5ef6\u7eed\u5427\uff01\u505a\u4e2a\u6bcf\u65e5\u6311\u6218\u5373\u53ef\u4fdd\u6301'), t('Go', '\u53bb\u6311\u6218'), function() { _lazyCall('study-quiz-battle', 'startDaily', []); });
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
          active: t('10+ words down! Explore more learning modes', '\u5df2\u638c\u63e1 10+ \u8bcd\u6c47\uff01\u63a2\u7d22\u66f4\u591a\u5b66\u4e60\u6a21\u5f0f'),
          intermediate: t('100+ words mastered! You\'re becoming a math expert', '\u638c\u63e1 100+ \u8bcd\u6c47\uff01\u4f60\u6b63\u5728\u6210\u4e3a\u6570\u5b66\u8fbe\u4eba'),
          advanced: t('500+ words! You\'re a true math master', '500+ \u8bcd\u6c47\uff01\u4f60\u662f\u771f\u6b63\u7684\u6570\u5b66\u5927\u5e08')
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
  navPush('deck');
  showPanel('deck');
}

/* Guest lock prompt modal */
function showGuestLockPrompt() {
  var html = '<div class="ms-modal-center">';
  html += '<div class="ms-modal-emoji">\ud83d\udd12</div>';
  html += '<div class="section-title">' + t('Login to Unlock', '\u767b\u5f55\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4') + '</div>';
  html += '<p style="color:var(--c-text2);font-size:14px;margin:12px 0 20px">' + t('Create a free account to access all vocabulary groups and track progress across devices.', '\u514d\u8d39\u6ce8\u518c\u8d26\u53f7\u5373\u53ef\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4\u3001\u8bb0\u5f55\u5b66\u4e60\u8fdb\u5ea6\u5e76\u8de8\u8bbe\u5907\u540c\u6b65\u3002') + '</p>';
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
  html += '<div>\ud83c\udfc6 ' + t('Earn ranks & achievements', '\u83b7\u5f97\u6bb5\u4f4d\u4e0e\u6210\u5c31') + '</div>';
  html += '<div>\ud83d\udcca ' + t('Track your learning history', '\u8bb0\u5f55\u5b66\u4e60\u5386\u53f2\u6570\u636e') + '</div>';
  html += '</div>';
  html += '<div class="btn-row btn-row--mt0">';
  html += '<button class="btn btn-primary flex-1" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
  html += '<button class="btn btn-ghost flex-1" onclick="hideModal()">' + t('Later', '\u7a0d\u540e') + '</button>';
  html += '</div></div>';
  showModal(html);
}

function renderDeck(idx) {
  if (typeof _renderDeck === 'function') { _renderDeck(idx); return; }
  _showPanelLoading('deck');
  _lazyLoad('deck-detail', function() { if (typeof _renderDeck === 'function') _renderDeck(idx); });
}

function renderPreview(idx) {
  if (typeof _renderPreview === 'function') { _renderPreview(idx); return; }
  _showPanelLoading('preview');
  _lazyLoad('deck-detail', function() { if (typeof _renderPreview === 'function') _renderPreview(idx); });
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
    study: function(li) { _lazyCall('study-quiz-battle', 'startStudy', [li]); },
    quiz: function(li) { _lazyCall('study-quiz-battle', 'startQuiz', [li]); },
    spell: function(li) { _lazyLoad('modes', function() { startSpell(li); }); },
    match: function(li) { _lazyLoad('modes', function() { startMatch(li); }); },
    battle: function(li) { _lazyCall('study-quiz-battle', 'startBattle', [li]); }
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
    } else if (action === 'deck-refresh') {
      var dli = parseInt(btn.getAttribute('data-li'), 10);
      var dStale = typeof getStaleWords === 'function' ? getStaleWords().filter(function(w) { return w.level === dli; }) : [];
      if (dStale.length > 0) _lazyCall('study-quiz-battle', 'startRefreshScan', [dStale]);
    } else if (action === 'back') {
      var backType = btn.getAttribute('data-back');
      if (backType === 'home') {
        navBack();
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
  var fns = {
    battle: function(li) { _lazyCall('study-quiz-battle', 'startBattle', [li]); },
    spell: function(li) { _lazyLoad('modes', function() { startSpell(li); }); },
    match: function(li) { _lazyLoad('modes', function() { startMatch(li); }); }
  };
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action="reflux"]');
    if (!btn) return;
    var mode = btn.getAttribute('data-mode');
    var li = parseInt(btn.getAttribute('data-li'), 10);
    if (fns[mode] && !isNaN(li)) fns[mode](li);
  });
}
_initRefluxDelegation();
