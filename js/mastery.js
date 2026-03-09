/* ══════════════════════════════════════════════════════════════
   mastery.js — Home dashboard, deck detail, mode selection, sort
   ══════════════════════════════════════════════════════════════ */

/* ═══ WORD FILTER STATE ═══ */
var _deckSelectMode = false;
var _deckHideMastered = false;
var _deckSelectedWords = {};
var _deckSelectCount = 0;

/* Restore hideMastered preference */
(function() {
  try {
    var prefs = JSON.parse(localStorage.getItem('word_filter_prefs')) || {};
    _deckHideMastered = prefs.hideMastered || false;
  } catch(e) {}
})();

/* ═══ MASTERY CALCULATIONS ═══ */

/* Dual-metric global stats (Spec v1.0 §7) */
function getGlobalStats() {
  var all = getAllWords();
  if (all.length === 0) return { total: 0, mastered: 0, learningPct: 0, masteryPct: 0 };
  var totalStars = 0, mastered = 0;
  all.forEach(function(w) {
    totalStars += w.stars || 0;
    if ((w.stars || 0) === 4) mastered++;
  });
  return {
    total: all.length,
    mastered: mastered,
    learningPct: Math.round(totalStars / (all.length * 4) * 100),
    masteryPct: Math.round(mastered / all.length * 100)
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

/* ═══ DECK STATS (dual metrics, Spec v1.0 §6) ═══ */
function getDeckStats(li, _wd) {
  var lv = LEVELS[li];
  var pairs = getPairs(lv.vocabulary);
  var wd = _wd || getWordData();
  var totalStars = 0, mastered = 0, started = 0;
  pairs.forEach(function(p) {
    var key = wordKey(li, p.lid);
    var d = wd[key];
    var s = d ? (d.stars != null ? d.stars : computeStars(d.ok || 0, d.fail || 0)) : 0;
    totalStars += s;
    if (s === 4) mastered++;
    if (d && (d.ok || 0) >= 1) started++;
  });
  var learningPct = pairs.length > 0 ? Math.round(totalStars / (pairs.length * 4) * 100) : 0;
  var masteryPct = pairs.length > 0 ? Math.round(mastered / pairs.length * 100) : 0;
  return {
    total: pairs.length,
    started: started,
    mastered: mastered,
    learningPct: learningPct,
    masteryPct: masteryPct,
    pct: learningPct  /* backward-compatible alias */
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

  /* Priority: 1. In-progress section → 2. Due review (>=5) → 3. Daily challenge → 4. Next new section */
  if (inProgress) {
    return { type: 'continue', section: inProgress.section, board: inProgress.board, label: inProgress.section.id + ' ' + inProgress.section.title, labelZh: inProgress.section.title_zh };
  }
  if (due >= 5) {
    return { type: 'review', count: due };
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
    if (!usedModes[c.mode] && (typeof isFeatureUnlocked !== 'function' || isFeatureUnlocked(c.mode))) {
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
  var dueCount = getDueWords().length;  /* cached — used 3 places */
  var action = _getNextAction(dueCount);
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
  } else if (action.type === 'review') {
    html += '<div class="hero-label">' + t('Time to review', '\u8be5\u590d\u4e60\u4e86') + '</div>';
    html += '<div class="hero-section">' + t(action.count + ' words need a quick refresh', '\u6709 ' + action.count + ' \u4e2a\u8bcd\u9700\u8981\u590d\u4e60') + '</div>';
    html += '<button class="btn btn-primary hero-btn" data-hero-action="review">';
    html += t('Start Review', '\u5f00\u59cb\u590d\u4e60') + ' \u2192</button>';
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

  /* Review reminder — gentle nudge when overdue */
  if (action.type !== 'review' && dueCount >= 5) {
    var lastReviewAt = 0;
    try { lastReviewAt = parseInt(localStorage.getItem('wmatch_last_review') || '0'); } catch(e) {}
    var daysSinceReview = lastReviewAt > 0 ? (Date.now() - lastReviewAt) / 86400000 : 999;
    if (daysSinceReview >= 2) {
      html += '<div class="hero-reminder" data-hero-action="review">\ud83d\udca1 ' + t(dueCount + ' words waiting for a quick refresh \u2014 just 2 min!', '\u6709 ' + dueCount + ' \u4e2a\u8bcd\u7b49\u4f60\u590d\u4e60\u2014\u2014\u53ea\u9700 2 \u5206\u949f\uff01') + '</div>';
    }
  }

  /* Secondary actions */
  html += '<div class="hero-alt">';
  if (action.type !== 'daily') {
    html += '<button class="hero-alt-btn" data-hero-action="daily">\u26a1 ' + t('Daily Challenge', '\u6bcf\u65e5\u6311\u6218');
    if (dcData) html += ' (' + dcData.score + '/10)';
    html += '</button>';
  }
  if (action.type !== 'review' && dueCount > 0) {
    html += '<button class="hero-alt-btn" data-hero-action="review">\ud83e\udde0 ' + t('Review', '\u590d\u4e60') + ' (' + dueCount + ')</button>';
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
    } else if (act === 'review') {
      navTo('review-dash');
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
    html += '<button class="back-btn" onclick="window._kpReturnContext=null;openKnowledgePoint(\'' + _kpRet.kpId + '\',\'' + _kpRet.board + '\')">\u2190</button>';
    window._kpReturnContext = null;
  } else if (lv._isSection && lv._section) {
    var _backBoard = lv._board || 'cie';
    html += '<button class="back-btn" onclick="openSection(\'' + lv._section + '\',\'' + _backBoard + '\')">\u2190</button>';
    html += '<div class="deck-title">\ud83d\udcdd ' + lvTitle(lv) + '</div>';
  } else if (lv.board === '25m' && lv.unitNum) {
    html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
    var yn = lv.category.replace('25m-y', '');
    html += '<div class="deck-title">Y' + yn + '.' + lv.unitNum + ' \u00b7 ' + lvTitle(lv) + '</div>';
  } else {
    html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
    var catInfo = getCategoryInfo(lv.category);
    html += '<div class="deck-title">' + catInfo.emoji + ' ' + lvTitle(lv) + '</div>';
  }
  html += '</div>';

  /* Learning path + extra practice */
  html += '<div class="mode-path">';
  html += '<div class="mode-path-label">' + t('Learning Path', '\u5b66\u4e60\u8def\u5f84') + '</div>';
  html += '<div class="mode-path-row">';
  var pathModes = [
    { emoji: '\ud83d\udcd6', name: t('Study', '\u5b66\u4e60'), fn: 'startStudy(' + idx + ')' },
    { emoji: '\u2753', name: t('Quiz', '\u6d4b\u9a8c'), fn: 'startQuiz(' + idx + ')' },
    { emoji: '\ud83e\udde0', name: t('Review', '\u590d\u4e60'), fn: 'startReview(' + idx + ')' }
  ];
  var pathKeys = ['study', 'quiz', 'review'];
  pathModes.forEach(function(m, i) {
    if (i > 0) html += '<span class="mode-arrow">\u2192</span>';
    var done = isModeDone(idx, pathKeys[i]);
    var _modeOk = isModeUnlocked(idx, pathKeys[i]);
    var _featOk = typeof isFeatureUnlocked !== 'function' || isFeatureUnlocked(pathKeys[i]);
    if (_modeOk && _featOk) {
      html += '<button class="mode-btn mode-btn-path" onclick="' + m.fn + '">';
      if (done) html += '<span class="mode-done">\u2713</span>';
    } else {
      var _lockReason = !_featOk ? 'feature' : 'mode';
      var _lockTitle = _lockReason === 'feature'
        ? t('Master more words to unlock', '掌握更多词汇解锁')
        : t('Complete the previous mode first', '请先完成前一个模式');
      html += '<button class="mode-btn mode-btn-path mode-btn-locked" data-locked-msg="' + _lockReason + '" data-unlock-mode="' + pathKeys[i] + '" aria-disabled="true" tabindex="-1" title="' + _lockTitle + '">';
      html += '<span class="mode-lock">\ud83d\udd12</span>';
      if (!_featOk && typeof FEATURE_THRESHOLD !== 'undefined') {
        var _pNeed = FEATURE_THRESHOLD[pathKeys[i]] || 0;
        if (_pNeed > 0) {
          var _pGs = typeof getGlobalStats === 'function' ? getGlobalStats() : { mastered: 0 };
          var _pPct = Math.min(100, Math.round((_pGs.mastered || 0) / _pNeed * 100));
          html += '<div class="unlock-progress"><div class="unlock-progress-fill" style="width:' + _pPct + '%"></div></div>';
        }
      }
    }
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  html += '<div class="mode-extra">';
  html += '<div class="mode-extra-label">' + t('More Practice', '\u66f4\u591a\u7ec3\u4e60') + '</div>';
  html += '<div class="mode-extra-row">';
  var extraModes = [
    { emoji: '\u2328\ufe0f', name: t('Spell', '\u62fc\u5199'), fn: 'startSpell(' + idx + ')' },
    { emoji: '\ud83d\udd17', name: t('Match', '\u914d\u5bf9'), fn: 'startMatch(' + idx + ')' },
    { emoji: '\u2694\ufe0f', name: t('Battle', '\u5b9e\u6218'), fn: 'startBattle(' + idx + ')' }
  ];
  var extraKeys = ['spell', 'match', 'battle'];
  extraModes.forEach(function(m, i) {
    var done = isModeDone(idx, extraKeys[i]);
    var _exModeOk = isModeUnlocked(idx, extraKeys[i]);
    var _exFeatOk = typeof isFeatureUnlocked !== 'function' || isFeatureUnlocked(extraKeys[i]);
    if (_exModeOk && _exFeatOk) {
      html += '<button class="mode-btn mode-btn-extra" onclick="' + m.fn + '">';
      if (done) html += '<span class="mode-done">\u2713</span>';
    } else {
      var _exReason = !_exFeatOk ? 'feature' : 'study';
      var _exTitle = _exReason === 'feature'
        ? t('Master more words to unlock', '掌握更多词汇解锁')
        : t('Complete Study mode first', '请先完成学习模式');
      html += '<button class="mode-btn mode-btn-extra mode-btn-locked" data-locked-msg="' + _exReason + '" data-unlock-mode="' + extraKeys[i] + '" aria-disabled="true" tabindex="-1" title="' + _exTitle + '">';
      html += '<span class="mode-lock">\ud83d\udd12</span>';
      if (!_exFeatOk && typeof FEATURE_THRESHOLD !== 'undefined') {
        var _eNeed = FEATURE_THRESHOLD[extraKeys[i]] || 0;
        if (_eNeed > 0) {
          var _eGs = typeof getGlobalStats === 'function' ? getGlobalStats() : { mastered: 0 };
          var _ePct = Math.min(100, Math.round((_eGs.mastered || 0) / _eNeed * 100));
          html += '<div class="unlock-progress"><div class="unlock-progress-fill" style="width:' + _ePct + '%"></div></div>';
        }
      }
    }
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  html += '<div class="preview-link"><a href="javascript:void(0)" onclick="openPreview(' + idx + ')">\ud83d\udc41 ' + t('Preview all words', '\u9884\u89c8\u5168\u90e8\u8bcd\u6c47') + ' \u2192</a></div>';

  /* Test Out button — only when Study not yet done (#6) */
  if (!isModeDone(idx, 'study')) {
    html += '<div class="testout-link"><button class="btn btn-ghost btn-sm" data-action="testout" data-li="' + idx + '">\u26a1 ' + t('Test Out', '跳级测试') + '</button></div>';
  }

  /* Sort bar */
  html += '<div class="sort-bar">';
  [['default', t('Default', '\u9ed8\u8ba4')], ['az', 'A-Z'], ['random', t('Random', '\u968f\u673a')], ['hard', t('Hard first', '\u96be\u8bcd\u4f18\u5148')]].forEach(function(s) {
    html += '<button class="sort-btn' + (appSort === s[0] ? ' active' : '') + '" onclick="setSort(\'' + s[0] + '\',' + idx + ')">' + s[1] + '</button>';
  });
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
    var lvNum = d ? (d.lv || 0) : 0;
    var ok = d ? (d.ok || 0) : 0;
    var fail = d ? (d.fail || 0) : 0;
    var wStars = d ? (d.stars != null ? d.stars : computeStars(ok, fail)) : 0;
    var lvColor = SRS_COLORS[lvNum] || SRS_COLORS[0];

    /* Hide mastered filter */
    if (_deckHideMastered && wStars === 4) return;
    visibleCount++;

    var isSelected = _deckSelectMode && _deckSelectedWords[p.lid];
    html += '<div class="word-row' + (isSelected ? ' word-row-selected' : '') + '"';
    if (_deckSelectMode) {
      html += ' onclick="toggleWordSelect(' + idx + ',' + p.lid + ')" style="cursor:pointer"';
    }
    html += '>';

    /* Checkbox column */
    if (_deckSelectMode) {
      html += '<span class="word-check">' + (isSelected ? '\u2611' : '\u2610') + '</span>';
    }

    html += '<div class="word-en">' + escapeHtml(p.word) + '</div>';
    if (appLang === 'bilingual') {
      html += '<div class="word-zh">' + escapeHtml(p.def) + '</div>';
    }
    html += '<span class="word-stars">';
    for (var si = 0; si < 4; si++) {
      html += '<span class="star-dot' + (si < wStars ? ' filled' : '') + '"></span>';
    }
    html += '</span>';
    html += '<span class="word-lv" style="background:' + lvColor + '20;color:' + lvColor + '">' + SRS_LABELS[lvNum] + '</span>';
    if (ok > 0 || fail > 0) {
      html += '<span class="word-stats">\u2713' + ok + ' \u2717' + fail + '</span>';
    }
    html += '</div>';
  });

  if (_deckHideMastered && visibleCount === 0) {
    html += '<div style="text-align:center;color:var(--c-muted);padding:20px 0">';
    html += t('All words mastered! Well done!', '\u5168\u90e8\u638c\u63e1\uff01\u592a\u68d2\u4e86\uff01');
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
    var wStars = d ? (d.stars != null ? d.stars : computeStars(d.ok || 0, d.fail || 0)) : 0;
    if (wStars < 4) {
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

/* ═══ TEST OUT (#6) ═══ */
var _testOutDelegated = false;
function startTestOut(li) {
  var lv = LEVELS[li];
  if (!lv) return;
  var allP = getPairs(lv.vocabulary);
  if (allP.length === 0) return;
  var pool = shuffle(allP).slice(0, 8);
  var cache = typeof getQuizCache === 'function' ? getQuizCache() : { defs: [], words: [] };
  var _toIdx = 0, _toCorrect = 0, _toTotal = pool.length;

  function _renderTOCard() {
    if (_toIdx >= _toTotal) {
      /* Results */
      var passed = _toCorrect >= Math.ceil(_toTotal * 0.875); /* ≥7/8 */
      var html = '<div class="section-title">' + t('Test Out', '跳级测试') + '</div>';
      html += '<div class="testout-result">';
      html += '<div class="testout-score">' + _toCorrect + ' / ' + _toTotal + '</div>';
      if (passed) {
        markModeDone(li, 'study');
        markModeDone(li, 'quiz');
        html += '<div class="testout-msg">' + t('Passed! Study & Quiz completed.', '通过！学习和测验已完成。') + ' \ud83c\udf89</div>';
      } else {
        html += '<div class="testout-msg">' + t('Keep studying! You need 7/' + _toTotal + ' to pass.', '继续加油！需要答对 7/' + _toTotal + ' 题。') + '</div>';
      }
      html += '<button class="btn btn-primary" data-action="to-back" data-li="' + li + '">' + t('Back', '返回') + '</button>';
      html += '</div>';
      showModal(html);
      return;
    }
    var p = pool[_toIdx];
    var correctAnswer = p.def;
    var distractors = shuffle(cache.defs.filter(function(x) { return x !== correctAnswer; })).slice(0, 3);
    var options = shuffle([correctAnswer].concat(distractors));
    var html = '<div class="section-title">' + t('Test Out', '跳级测试') + ' — ' + escapeHtml(lvTitle(lv)) + '</div>';
    html += '<div class="testout-progress">' + (_toIdx + 1) + ' / ' + _toTotal + '</div>';
    html += '<div class="quiz-word" style="margin:12px 0;font-size:20px">' + escapeHtml(p.word) + '</div>';
    html += '<div class="quiz-options" id="to-options">';
    options.forEach(function(opt, i) {
      html += '<button class="quiz-opt" data-idx="' + i + '" data-correct="' + (opt === correctAnswer ? '1' : '0') + '">' + escapeHtml(opt) + '</button>';
    });
    html += '</div>';
    showModal(html);
  }
  _renderTOCard();

  /* Modal-level delegation for quiz option clicks + back button */
  var modalCard = E('modal-card');
  if (modalCard) {
    if (modalCard._toHandler) modalCard.removeEventListener('click', modalCard._toHandler);
    modalCard._toHandler = function(ev) {
      /* Back button */
      var backBtn = ev.target.closest('[data-action="to-back"]');
      if (backBtn) {
        var bLi = parseInt(backBtn.getAttribute('data-li'), 10);
        hideModal();
        if (!isNaN(bLi)) openDeck(bLi);
        return;
      }
      /* Quiz option */
      var btn = ev.target.closest('.quiz-opt');
      if (!btn || btn.classList.contains('chosen')) return;
      var wrap = btn.parentNode;
      wrap.querySelectorAll('.quiz-opt').forEach(function(b) { b.classList.add('chosen'); });
      if (btn.getAttribute('data-correct') === '1') {
        btn.classList.add('correct');
        _toCorrect++;
      } else {
        btn.classList.add('wrong');
        wrap.querySelector('[data-correct="1"]').classList.add('correct');
      }
      setTimeout(function() { _toIdx++; _renderTOCard(); }, 800);
    };
    modalCard.addEventListener('click', modalCard._toHandler);
  }
}

/* Delegate testout clicks in deck panel */
function _initTestOutDelegation() {
  if (_testOutDelegated) return;
  _testOutDelegated = true;
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action="testout"]');
    if (!btn) return;
    var li = parseInt(btn.getAttribute('data-li'), 10);
    if (!isNaN(li)) startTestOut(li);
  });
}
_initTestOutDelegation();

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
      if (!isModeDone(i, modes[m]) && (typeof isFeatureUnlocked !== 'function' || isFeatureUnlocked(modes[m]))) {
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
