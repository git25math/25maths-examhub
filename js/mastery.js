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
  /* Personalised welcome based on absence length */
  var absentDays = Math.floor((now - lastVisit) / 86400000);
  var msg;
  if (absentDays >= 7) {
    msg = t('Welcome back! We missed you.', '\u6b22\u8fce\u56de\u6765\uff01\u6211\u4eec\u60f3\u4f60\u4e86\u3002');
  } else if (absentDays >= 3) {
    msg = t('Good to see you again!', '\u5f88\u9ad8\u5174\u518d\u6b21\u770b\u5230\u4f60\uff01');
  } else {
    msg = t('Welcome back!', '\u6b22\u8fce\u56de\u6765\uff01');
  }

  var details = [];
  if (gs.mastered > 0) details.push('\u2705 ' + gs.mastered + ' ' + t('words mastered', '\u8bcd\u5df2\u638c\u63e1'));
  if (dueCount > 0) details.push('\ud83d\udd04 ' + dueCount + ' ' + t('ready for review', '\u53ef\u4ee5\u590d\u4e60'));
  if (streak > 0) details.push('\ud83d\udd25 ' + streak + ' ' + t('-day streak', '\u5929\u8fde\u7eed'));

  /* Encouraging closing */
  var closing = '';
  if (absentDays >= 7 && gs.mastered > 0) {
    closing = ' \u00b7 ' + t('Your progress is saved \u2014 pick up right where you left off!', '\u4f60\u7684\u8fdb\u5ea6\u90fd\u5728\u2014\u2014\u63a5\u7740\u4e0a\u6b21\u7ee7\u7eed\u5427\uff01');
  }

  return '<div class="return-recap" role="status" aria-live="polite"><span>' + msg + ' ' + details.join(' \u00b7 ') + closing + '</span>' +
    '<button class="return-recap-close" aria-label="' + t('Close', '\u5173\u95ed') + '">&times;</button></div>';
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

  /* Top row: growth summary (v5.30.0: no streak pressure, focus on growth) */
  html += '<div class="hero-top">';
  /* Show streak only as a gentle note when >= 3, not a pressure counter */
  if (streakN >= 3) {
    html += '<span class="hero-streak">\u2728 ' + t(streakN + ' days of learning', '\u5b66\u4e60\u4e86 ' + streakN + ' \u5929') + '</span>';
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
    html += '<div class="hero-label">' + t('Quick Refresh', '\u5feb\u901f\u56de\u987e') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('words ready for a quick revisit — whenever you like', '\u4e2a\u8bcd\u53ef\u4ee5\u5feb\u901f\u56de\u987e\u2014\u2014\u4f60\u60f3\u770b\u7684\u65f6\u5019\u5c31\u770b') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="refresh">';
    html += '\ud83d\udd04 ' + t('Quick Refresh', '\u5feb\u901f\u56de\u987e') + ' \u2192</button>';
  } else if (action.type === 'kp-refresh') {
    html += '<div class="hero-label">' + t('Knowledge Refresh', '\u77e5\u8bc6\u70b9\u56de\u987e') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('KPs you can revisit to stay sharp', '\u4e2a\u77e5\u8bc6\u70b9\u53ef\u4ee5\u56de\u987e\u4ee5\u4fdd\u6301\u8bb0\u5fc6') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="kp-refresh">';
    html += '\ud83d\udd04 ' + t('Quick Refresh', '\u5feb\u901f\u56de\u987e') + ' \u2192</button>';
  } else if (action.type === 'pp-refresh') {
    html += '<div class="hero-label">' + t('Paper Refresh', '\u771f\u9898\u56de\u987e') + '</div>';
    html += '<div class="hero-section">' + action.count + ' ' + t('questions you can revisit to build confidence', '\u4e2a\u771f\u9898\u53ef\u4ee5\u56de\u987e\u4ee5\u5efa\u7acb\u4fe1\u5fc3') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="pp-refresh">';
    html += '\ud83d\udd04 ' + t('Quick Refresh', '\u5feb\u901f\u56de\u987e') + ' \u2192</button>';
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

  /* ═══ HOME MODULE CARDS (v5.30.0) ═══ */
  html += '<div class="home-boards">';
  var _visBoards = getVisibleBoards();
  var _visBoardIds = {};
  _visBoards.forEach(function(b) { _visBoardIds[b.id] = true; });

  for (var _hmi = 0; _hmi < HOME_MODULES.length; _hmi++) {
    var mod = HOME_MODULES[_hmi];
    /* Filter: only show modules relevant to userBoard, or all if no filter */
    if (userBoard && userBoard !== 'all') {
      if (mod.status === 'active' && mod.boardId && !_visBoardIds[mod.boardId]) continue;
    }
    var isActive = mod.status === 'active';
    var mTitle = appLang !== 'en' ? mod.titleZh : mod.title;
    var mSub = appLang !== 'en' ? mod.subtitleZh : mod.subtitle;
    var mDesc = appLang !== 'en' ? mod.descZh : mod.desc;

    html += '<div class="home-board-card' + (isActive ? '' : ' coming') + '" ' +
      (isActive ? 'onclick="openBoardHome(\'' + escapeHtml(mod.id) + '\')"' : '') +
      ' role="button" tabindex="0">';
    html += '<div class="home-board-icon" style="background:' + mod.color + '18;color:' + mod.color + '">' + mod.icon + '</div>';
    html += '<div class="home-board-info">';
    html += '<div class="home-board-title">' + escapeHtml(mTitle);
    if (isActive) {
      html += '<span class="home-board-badge badge-active">' + t('Active', '\u5df2\u5f00\u653e') + '</span>';
    } else {
      html += '<span class="home-board-badge badge-coming">' + t('Coming', '\u5373\u5c06\u63a8\u51fa') + '</span>';
    }
    html += '</div>';
    html += '<div class="home-board-subtitle">' + escapeHtml(mSub) + '</div>';
    html += '<div class="home-board-desc">' + escapeHtml(mDesc) + '</div>';
    html += '</div>';
    html += '<span class="home-board-arrow">' + (isActive ? '\u2192' : '') + '</span>';
    html += '</div>';
  }
  html += '</div>';

  /* Legacy deck grid hidden on home — shown via openBoardHome() (v5.30.0) */
  /* Suppress rendering on home page; board detail renders its own content */
  var hasAnyResult = true;
  var _skipLegacy = true;
  if (_skipLegacy) {
    /* no-op: legacy board content not rendered on home */
  }
  var _legacyBoardRenderPlaceholder = function() {};
  _legacyBoardRenderPlaceholder.boards = getVisibleBoards();
  getVisibleBoards().forEach(function(board) {
    if (_skipLegacy) return;

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
          active: t('\ud83c\udf1f 10+ words mastered! Your math vocabulary is growing — try Quiz mode next!', '\ud83c\udf1f \u5df2\u638c\u63e1 10+ \u8bcd\u6c47\uff01\u4f60\u7684\u6570\u5b66\u8bcd\u6c47\u5728\u589e\u957f\u2014\u2014\u8bd5\u8bd5\u6d4b\u9a8c\u6a21\u5f0f\u5427\uff01'),
          intermediate: t('\ud83c\udfc6 100+ words mastered! You\u2019re building serious math confidence. Keep it up!', '\ud83c\udfc6 \u638c\u63e1 100+ \u8bcd\u6c47\uff01\u4f60\u7684\u6570\u5b66\u4fe1\u5fc3\u5728\u7a33\u6b65\u63d0\u5347\u3002\u7ee7\u7eed\u52a0\u6cb9\uff01'),
          advanced: t('\ud83d\ude80 500+ words mastered! You\u2019re truly exceptional. The exam has nothing on you!', '\ud83d\ude80 500+ \u8bcd\u6c47\uff01\u4f60\u771f\u7684\u592a\u5389\u5bb3\u4e86\u3002\u8003\u8bd5\u5bf9\u4f60\u6765\u8bf4\u4e0d\u5728\u8bdd\u4e0b\uff01')
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

  /* Word mastery milestones — celebrate at 25, 50, 200, 1000 (v5.30.0) */
  setTimeout(function() {
    try {
      var gs = getGlobalStats();
      var m = gs.mastered;
      var prevMilestone = parseInt(localStorage.getItem('wmatch_word_milestone') || '0', 10) || 0;
      var milestones = [
        { n: 25,   msg: t('\ud83c\udf1f 25 words mastered! Great start — your math vocabulary is growing!', '\ud83c\udf1f 25\u4e2a\u8bcd\u5df2\u638c\u63e1\uff01\u597d\u7684\u5f00\u59cb\u2014\u2014\u4f60\u7684\u6570\u5b66\u8bcd\u6c47\u5728\u589e\u957f\uff01') },
        { n: 50,   msg: t('\ud83c\udf89 50 words! You\u2019re halfway to a hundred — keep this momentum!', '\ud83c\udf89 50\u4e2a\u8bcd\uff01\u79bb100\u5df2\u7ecf\u8fc7\u534a\u2014\u2014\u4fdd\u6301\u8fd9\u4e2a\u52bf\u5934\uff01') },
        { n: 200,  msg: t('\ud83d\udcab 200 words! Your math English is getting really strong!', '\ud83d\udcab 200\u4e2a\u8bcd\uff01\u4f60\u7684\u6570\u5b66\u82f1\u8bed\u8d8a\u6765\u8d8a\u5f3a\u4e86\uff01') },
        { n: 1000, msg: t('\ud83d\ude80 1000 words! Incredible dedication — you\u2019re in the top tier!', '\ud83d\ude80 1000\u4e2a\u8bcd\uff01\u96be\u4ee5\u7f6e\u4fe1\u7684\u575a\u6301\u2014\u2014\u4f60\u662f\u9876\u5c16\u5b66\u8005\uff01') }
      ];
      for (var mi = milestones.length - 1; mi >= 0; mi--) {
        if (m >= milestones[mi].n && prevMilestone < milestones[mi].n) {
          localStorage.setItem('wmatch_word_milestone', String(milestones[mi].n));
          if (typeof showToast === 'function') showToast(milestones[mi].msg);
          if (milestones[mi].n >= 200 && typeof spawnP === 'function') spawnP(window.innerWidth / 2, window.innerHeight / 3, 20);
          break;
        }
      }
    } catch(e) {}
  }, 1500);
}

/* ═══ BOARD HOME — drill-down from home page (v5.30.0) ═══ */

function openBoardHome(modId) {
  var mod = null;
  for (var i = 0; i < HOME_MODULES.length; i++) {
    if (HOME_MODULES[i].id === modId) { mod = HOME_MODULES[i]; break; }
  }
  if (!mod || mod.status !== 'active') return;

  var mTitle = appLang !== 'en' ? mod.titleZh : mod.title;
  var mSub = appLang !== 'en' ? mod.subtitleZh : mod.subtitle;

  /* Set breadcrumb */
  breadcrumbSet([
    { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" },
    { id: modId, label: mod.title, labelZh: mod.titleZh }
  ]);

  var boardKey = mod.boardId || mod.id;

  /* Render board detail into panel-home (reuse home panel, push to nav stack) */
  navPush('home'); /* keep on home panel but update content */
  var html = '';

  html += '<div class="board-detail-header">';
  html += '<div style="font-size:36px;margin-bottom:8px">' + mod.icon + '</div>';
  html += '<div class="board-detail-title">' + escapeHtml(mTitle) + '</div>';
  html += '<div class="board-detail-sub">' + escapeHtml(mSub) + '</div>';
  html += '</div>';

  html += '<div class="board-detail-options">';

  if (modId === 'cie' || modId === 'edx') {
    /* CIE / Edexcel: Topic-based + Paper-based + Review + Favorites */
    html += _boardOptionCard('\ud83d\udcda', t('Study by Topic', '\u6309\u4e13\u9898\u5b66\u4e60'),
      t('Vocabulary, knowledge points, and practice by chapter', '\u6309\u7ae0\u8282\u5b66\u4e60\u8bcd\u6c47\u3001\u77e5\u8bc6\u70b9\u548c\u7ec3\u4e60\u9898'),
      "openBoardTopics('" + escapeHtml(modId) + "')");

    html += _boardOptionCard('\ud83d\udcc4', t('Past Papers', '\u5957\u5377\u7ec3\u4e60'),
      modId === 'cie'
        ? t('228 papers \u00b7 4,110 questions \u00b7 2018\u20132025', '228\u5957\u5377 \u00b7 4,110\u9053\u9898')
        : t('76 papers \u00b7 1,855 questions', '76\u5957\u5377 \u00b7 1,855\u9053\u9898'),
      "_lazyLoad('practice',function(){ppShowPaperBrowse('" + escapeHtml(boardKey) + "');})");

    html += _boardOptionCard('\ud83d\udd04', t('Review Completed', '\u56de\u987e\u5df2\u505a\u8fc7\u7684'),
      t('Revisit questions you have practised', '\u56de\u987e\u4f60\u7ec3\u4e60\u8fc7\u7684\u9898\u76ee'),
      "navTo('mistakes')");

    html += _boardOptionCard('\u2b50', t('My Favorites', '\u6211\u7684\u6536\u85cf'),
      t('Words, KPs, and questions you bookmarked', '\u4f60\u6536\u85cf\u7684\u5355\u8bcd\u3001\u77e5\u8bc6\u70b9\u548c\u9898\u76ee'),
      "navTo('favorites')");

  } else if (modId === 'hhk') {
    /* HHK: Year groups */
    var years = [
      { id: 'y7', label: 'Year 7', labelZh: 'Y7 \u516d\u5e74\u7ea7', icon: '\u24fb' },
      { id: 'y8', label: 'Year 8', labelZh: 'Y8 \u4e03\u5e74\u7ea7', icon: '\u24fc' },
      { id: 'y9', label: 'Year 9', labelZh: 'Y9 \u516b\u5e74\u7ea7', icon: '\u24fd' },
      { id: 'y10', label: 'Year 10', labelZh: 'Y10 \u4e5d\u5e74\u7ea7', icon: '\u24fe' },
      { id: 'y11', label: 'Year 11', labelZh: 'Y11 \u5341\u5e74\u7ea7', icon: '\u24eb' }
    ];
    for (var yi = 0; yi < years.length; yi++) {
      var yr = years[yi];
      var yrTitle = appLang !== 'en' ? yr.labelZh : yr.label;
      /* Count units in this year from syllabus data */
      var unitCount = 0;
      if (typeof BOARD_SYLLABUS !== 'undefined' && BOARD_SYLLABUS.hhk) {
        for (var ci = 0; ci < BOARD_SYLLABUS.hhk.length; ci++) {
          var ch = BOARD_SYLLABUS.hhk[ci];
          if (ch.num === (yi + 7)) unitCount = ch.sections ? ch.sections.length : 0;
        }
      }
      html += _boardOptionCard(yr.icon, yrTitle,
        unitCount + ' ' + t('units', '\u4e2a\u5355\u5143'),
        "openBoardYear('hhk'," + (yi + 7) + ")");
    }
    html += _boardOptionCard('\ud83d\udd04', t('Review Completed', '\u56de\u987e\u5df2\u505a\u8fc7\u7684'),
      t('Revisit questions you have practised', '\u56de\u987e\u4f60\u7ec3\u4e60\u8fc7\u7684\u9898\u76ee'),
      "navTo('mistakes')");
    html += _boardOptionCard('\u2b50', t('My Favorites', '\u6211\u7684\u6536\u85cf'),
      t('Words, KPs, and questions you bookmarked', '\u4f60\u6536\u85cf\u7684\u5355\u8bcd\u3001\u77e5\u8bc6\u70b9\u548c\u9898\u76ee'),
      "navTo('favorites')");
  }

  html += '</div>';

  E('panel-home').innerHTML = html;
}

function _boardOptionCard(icon, title, sub, onclick) {
  return '<div class="board-option-card" onclick="' + onclick + '" role="button" tabindex="0">' +
    '<div class="board-option-icon">' + icon + '</div>' +
    '<div class="board-option-info">' +
      '<div class="board-option-title">' + title + '</div>' +
      '<div class="board-option-sub">' + sub + '</div>' +
    '</div>' +
    '<span class="board-option-arrow">\u2192</span>' +
  '</div>';
}

/* Open topic list for CIE/EDX board */
function openBoardTopics(modId) {
  var boardKey = modId === 'hhk' ? 'hhk' : modId;
  var mod = null;
  for (var i = 0; i < HOME_MODULES.length; i++) {
    if (HOME_MODULES[i].id === modId) { mod = HOME_MODULES[i]; break; }
  }
  if (!mod) return;

  breadcrumbSet([
    { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" },
    { id: modId, label: mod.title, labelZh: mod.titleZh, action: "openBoardHome('" + modId + "')" },
    { id: 'topics', label: t('Topics', '\u4e13\u9898'), labelZh: '\u4e13\u9898' }
  ]);

  var syllabus = typeof BOARD_SYLLABUS !== 'undefined' ? BOARD_SYLLABUS[boardKey] : null;
  if (!syllabus) {
    E('panel-home').innerHTML = '<div class="empty-state" style="padding:80px 0">' + t('Loading...', '\u52a0\u8f7d\u4e2d...') + '</div>';
    return;
  }

  var html = '';
  html += '<div class="board-detail-header">';
  html += '<div class="board-detail-title">' + t('Study by Topic', '\u6309\u4e13\u9898\u5b66\u4e60') + '</div>';
  html += '</div>';

  html += '<div class="board-detail-options">';
  for (var ci = 0; ci < syllabus.length; ci++) {
    var ch = syllabus[ci];
    var chTitle = appLang !== 'en' && ch.title_zh ? ch.title_zh : ch.title;
    var chNum = ch.num;
    var secCount = ch.sections ? ch.sections.length : 0;
    var emojis = boardKey === 'cie'
      ? ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udccd', '\ud83d\udcd0', '\ud83d\udccf', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83c\udfb2', '\ud83d\udcc8']
      : ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udcca', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83d\udcc8'];
    var emoji = emojis[chNum] || '\ud83d\udcda';
    html += _boardOptionCard(emoji, chNum + '. ' + chTitle,
      secCount + ' ' + t('sections', '\u4e2a\u77e5\u8bc6\u70b9'),
      "openBoardChapter('" + modId + "'," + chNum + ")");
  }
  html += '</div>';

  E('panel-home').innerHTML = html;
}

/* Open a specific chapter showing its sections */
function openBoardChapter(modId, chNum) {
  var boardKey = modId === 'hhk' ? 'hhk' : modId;
  var mod = null;
  for (var i = 0; i < HOME_MODULES.length; i++) {
    if (HOME_MODULES[i].id === modId) { mod = HOME_MODULES[i]; break; }
  }
  var syllabus = typeof BOARD_SYLLABUS !== 'undefined' ? BOARD_SYLLABUS[boardKey] : null;
  if (!mod || !syllabus) return;

  var ch = null;
  for (var ci = 0; ci < syllabus.length; ci++) {
    if (syllabus[ci].num === chNum) { ch = syllabus[ci]; break; }
  }
  if (!ch) return;

  var chTitle = appLang !== 'en' && ch.title_zh ? ch.title_zh : ch.title;
  breadcrumbSet([
    { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" },
    { id: modId, label: mod.title, labelZh: mod.titleZh, action: "openBoardHome('" + modId + "')" },
    { id: 'topics', label: t('Topics', '\u4e13\u9898'), labelZh: '\u4e13\u9898', action: "openBoardTopics('" + modId + "')" },
    { id: 'ch' + chNum, label: chNum + '. ' + (ch.title || ''), labelZh: chNum + '. ' + (ch.title_zh || ch.title) }
  ]);

  var html = '';
  html += '<div class="board-detail-header">';
  html += '<div class="board-detail-title">' + chNum + '. ' + escapeHtml(chTitle) + '</div>';
  html += '<div class="board-detail-sub">' + (ch.sections ? ch.sections.length : 0) + ' ' + t('sections', '\u4e2a\u77e5\u8bc6\u70b9') + '</div>';
  html += '</div>';

  html += '<div class="board-detail-options">';
  if (ch.sections) {
    for (var si = 0; si < ch.sections.length; si++) {
      var sec = ch.sections[si];
      var secTitle = appLang !== 'en' && sec.title_zh ? sec.title_zh : sec.title;
      html += _boardOptionCard('\ud83d\udcd6', sec.id + ' ' + secTitle,
        '',
        "openSection('" + escapeHtml(sec.id) + "','" + escapeHtml(boardKey) + "')");
    }
  }
  html += '</div>';

  E('panel-home').innerHTML = html;
}

/* Open a HHK year group showing its units */
function openBoardYear(modId, yearNum) {
  var mod = null;
  for (var i = 0; i < HOME_MODULES.length; i++) {
    if (HOME_MODULES[i].id === modId) { mod = HOME_MODULES[i]; break; }
  }
  var syllabus = typeof BOARD_SYLLABUS !== 'undefined' ? BOARD_SYLLABUS.hhk : null;
  if (!mod || !syllabus) return;

  var ch = null;
  for (var ci = 0; ci < syllabus.length; ci++) {
    if (syllabus[ci].num === yearNum) { ch = syllabus[ci]; break; }
  }
  if (!ch) return;

  var yearLabel = 'Year ' + yearNum;
  var yearLabelZh = 'Y' + yearNum;
  breadcrumbSet([
    { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" },
    { id: 'hhk', label: mod.title, labelZh: mod.titleZh, action: "openBoardHome('hhk')" },
    { id: 'y' + yearNum, label: yearLabel, labelZh: yearLabelZh }
  ]);

  var html = '';
  html += '<div class="board-detail-header">';
  html += '<div style="font-size:36px;margin-bottom:8px">' + mod.icon + '</div>';
  html += '<div class="board-detail-title">' + yearLabel + '</div>';
  html += '<div class="board-detail-sub">' + (ch.sections ? ch.sections.length : 0) + ' ' + t('units', '\u4e2a\u5355\u5143') + '</div>';
  html += '</div>';

  html += '<div class="board-detail-options">';
  if (ch.sections) {
    for (var si = 0; si < ch.sections.length; si++) {
      var sec = ch.sections[si];
      var secTitle = appLang !== 'en' && sec.title_zh ? sec.title_zh : sec.title;
      html += _boardOptionCard('\ud83d\udcd6', sec.id + ' ' + secTitle,
        '',
        "openSection('" + escapeHtml(sec.id) + "','hhk')");
    }
  }
  html += '</div>';

  E('panel-home').innerHTML = html;
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
  /* Set breadcrumb (v5.31.1) */
  if (typeof breadcrumbSet === 'function') {
    var _lv = LEVELS[idx];
    var _hc = { id:'home', label:'Home', labelZh:'\u9996\u9875', action:"navTo('home')" };
    var _crumbs = [_hc];
    if (_lv && _lv._isSection && _lv._section && _lv._board) {
      /* Deck linked to a section — show full path */
      var _secMod = _lv._board === 'hhk' ? 'hhk' : _lv._board;
      var _mod = null;
      if (typeof HOME_MODULES !== 'undefined') {
        for (var _mi = 0; _mi < HOME_MODULES.length; _mi++) {
          if (HOME_MODULES[_mi].id === _secMod) { _mod = HOME_MODULES[_mi]; break; }
        }
      }
      if (_mod) _crumbs.push({ id:_secMod, label:_mod.title, labelZh:_mod.titleZh, action:"openBoardHome('" + _secMod + "')" });
      _crumbs.push({ id:_lv._section, label:_lv._section, labelZh:_lv._section, action:"openSection('" + _lv._section + "','" + _lv._board + "')" });
    }
    var _deckLabel = typeof lvTitle === 'function' ? lvTitle(_lv) : (idx + '');
    _crumbs.push({ id:'deck-' + idx, label:'\ud83d\udcdd ' + _deckLabel, labelZh:'\ud83d\udcdd ' + _deckLabel });
    breadcrumbSet(_crumbs);
  }
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
