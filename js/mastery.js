/* ══════════════════════════════════════════════════════════════
   mastery.js — Home dashboard, deck detail, mode selection, sort
   ══════════════════════════════════════════════════════════════ */

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
function getDeckStats(li) {
  var lv = LEVELS[li];
  var pairs = getPairs(lv.vocabulary);
  var wd = getWordData();
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
/* All categories default collapsed */
var catCollapsed = {};
(function initCatCollapsed() {
  BOARDS.forEach(function(b) {
    b.categories.forEach(function(c) { catCollapsed[c.id] = true; });
  });
})();

/* Unit collapse state (25m only, default all collapsed) */
var unitCollapsed = {};

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
}

function toggleUnit(unitKey) {
  unitCollapsed[unitKey] = !unitCollapsed[unitKey];
  var el = document.getElementById('unit-' + unitKey);
  if (el) el.classList.toggle('collapsed', unitCollapsed[unitKey]);
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
  h += '<div class="deck-row' + (locked ? ' locked' : '') + '" onclick="' + (locked ? 'showGuestLockPrompt()' : 'openDeck(' + cl.idx + ')') + '">';
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

/* ═══ HOME DASHBOARD ═══ */
function renderHome() {
  var all = getAllWords();
  var wd = getWordData();
  var gs = getGlobalStats();
  var total = gs.total;
  var due = getDueWords().length;

  var html = '';

  /* Stats row — Total / Learning% / Mastery% / Streak */
  html += '<div class="home-stats">';
  html += '<div class="stat-card"><div class="stat-val">' + total + '</div><div class="stat-label">' + t('Total', '\u603b\u8bcd\u6c47') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-primary)">' + gs.learningPct + '%</div><div class="stat-label">' + t('Progress', '\u5b66\u4e60\u8fdb\u5ea6') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-success)">' + gs.masteryPct + '%</div><div class="stat-label">' + t('Mastery', '\u7cbe\u901a\u7387') + '</div></div>';
  var streakN = getStreakCount();
  html += '<div class="stat-card stat-card-streak"><div class="stat-val" style="color:var(--c-streak)">🔥 ' + streakN + '</div><div class="stat-label">' + t('Streak', '连续天数') + '</div></div>';
  html += '</div>';

  /* Rank hint row */
  var homeRank = getRank();
  var homeNext = getNextRank();
  if (isTeacher()) {
    html += '<div class="home-rank-hint" style="cursor:default">';
    html += '<span class="home-rank-emoji">\ud83c\udfeb</span>';
    html += '<span class="home-rank-name">' + t('Teacher Account', '\u6559\u5e08\u8d26\u53f7') + '</span>';
    html += '</div>';
  } else {
    html += '<div class="home-rank-hint" onclick="showRankGuide()">';
    html += '<span class="home-rank-emoji">' + homeRank.emoji + '</span>';
    html += '<span class="home-rank-name">' + rankName(homeRank) + '</span>';
    if (homeNext) {
      var nextNeeded = Math.ceil(homeNext.min / 100 * total);
      var remaining = Math.max(nextNeeded - gs.mastered, 0);
      html += '<span class="home-rank-sep">\u00b7</span>';
      html += '<span class="home-rank-next">' + t(remaining + ' to ' + rankName(homeNext), '\u8ddd ' + rankName(homeNext) + ' \u8fd8\u9700 ' + remaining + ' \u8bcd') + '</span>';
    }
    html += '<span class="home-rank-link">' + t('View path \u2192', '\u67e5\u770b\u8def\u7ebf \u2192') + '</span>';
    html += '</div>';
  }

  /* Guest banner */
  if (isGuest()) {
    if (GUEST_FULL_ACCESS) {
      /* Green welcome banner — nudge registration */
      html += '<div class="guest-welcome" onclick="showGuestSignupPrompt()">';
      html += '<span class="guest-trial-icon">\u2728</span>';
      html += '<span class="guest-trial-text">' + t('Welcome! Register for free to sync progress & join leaderboard', '\u6b22\u8fce\u4f53\u9a8c\uff01\u514d\u8d39\u6ce8\u518c\u53ef\u540c\u6b65\u8fdb\u5ea6\u3001\u52a0\u5165\u6392\u884c\u699c') + '</span>';
      html += '<span class="guest-trial-arrow">\u2192</span>';
      html += '</div>';
    } else {
      /* Original trial banner */
      var totalVisible = 0;
      for (var gi = 0; gi < LEVELS.length; gi++) { if (isLevelVisible(LEVELS[gi])) totalVisible++; }
      html += '<div class="guest-trial-banner" onclick="showGuestLockPrompt()">';
      html += '<span class="guest-trial-icon">\ud83d\udd13</span>';
      html += '<span class="guest-trial-text">' + t('Free Trial: ' + GUEST_FREE_LIMIT + ' groups', '\u514d\u8d39\u8bd5\u7528\uff1a' + GUEST_FREE_LIMIT + ' \u4e2a\u8bcd\u7ec4') + ' \xb7 ' + t('Login to unlock all ' + totalVisible + ' groups', '\u767b\u5f55\u89e3\u9501\u5168\u90e8 ' + totalVisible + ' \u4e2a\u8bcd\u7ec4') + '</span>';
      html += '<span class="guest-trial-arrow">\u2192</span>';
      html += '</div>';
    }
  }

  /* Daily Challenge banner */
  var dcData = getDailyData();
  html += '<div class="dc-home-banner" onclick="startDaily()">';
  html += '<span class="dc-badge">\u26a1 ' + t('Daily Challenge', '每日挑战') + '</span>';
  if (dcData) {
    html += '<span class="dc-banner-info">' + dcData.score + '/10 \u2713</span>';
  } else {
    html += '<span class="dc-banner-info">' + t('10 words \u00b7 60s', '10 词 \u00b7 60 秒') + '</span>';
    html += '<span class="dc-banner-go">GO \u2192</span>';
  }
  html += '</div>';

  /* Homework banner (students only) */
  if (isLoggedIn() && !isGuest() && userClassId) {
    html += '<div id="hw-banner"></div>';
  }

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
    /* Pre-compute per-level stats + lock state for this board */
    var _levelStats = {};
    var _levelLocked = {};
    board.categories.forEach(function(cat) {
      LEVELS.forEach(function(lv, i) {
        if (lv.category !== cat.id || !isLevelVisible(lv)) return;
        var locked = isGuestLocked(i);
        _levelLocked[i] = locked;
        if (!locked) {
          _levelStats[i] = getDeckStats(i);
        }
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
      var catLevels = [];
      LEVELS.forEach(function(lv, i) {
        if (lv.category === cat.id && matchLevel(lv, appSearch)) catLevels.push({ lv: lv, idx: i });
      });
      if (catLevels.length === 0) return;

      var collapsed = appSearch ? false : (catCollapsed[cat.id] ? true : false);
      boardHtml += '<div class="category-section' + (collapsed ? ' collapsed' : '') + '" id="cat-' + cat.id + '">';
      boardHtml += '<div class="category-header" onclick="toggleCategory(\'' + cat.id + '\')">';
      boardHtml += '<span class="category-emoji">' + cat.emoji + '</span>';
      boardHtml += '<span class="category-name">' + catName(cat) + '</span>';

      /* 25m: show unit count; others: show group count */
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

      /* Practice actions for CIE / Edexcel categories */
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
          boardHtml += '<div class="unit-header" onclick="toggleUnit(\'' + unitKey + '\')">';
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
}

/* ═══ DECK DETAIL ═══ */
function openDeck(idx) {
  if (isGuestLocked(idx)) { showGuestLockPrompt(); return; }
  currentLvl = idx;
  renderDeck(idx);
  showPanel('deck');
}

/* Guest lock prompt modal */
function showGuestLockPrompt() {
  var html = '<div style="text-align:center;padding:12px 0">';
  html += '<div style="font-size:48px;margin-bottom:12px">\ud83d\udd12</div>';
  html += '<div class="section-title">' + t('Login to Unlock', '\u767b\u5f55\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4') + '</div>';
  html += '<p style="color:var(--c-text2);font-size:14px;margin:12px 0 20px">' + t('Create a free account to access all vocabulary groups, track progress, and join the leaderboard.', '\u514d\u8d39\u6ce8\u518c\u8d26\u53f7\u5373\u53ef\u89e3\u9501\u5168\u90e8\u8bcd\u7ec4\u3001\u8bb0\u5f55\u5b66\u4e60\u8fdb\u5ea6\u5e76\u52a0\u5165\u6392\u884c\u699c\u3002') + '</p>';
  html += '<div style="display:flex;gap:8px">';
  html += '<button class="btn btn-primary" style="flex:1" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Later', '\u7a0d\u540e') + '</button>';
  html += '</div></div>';
  showModal(html);
}

/* Guest signup prompt modal (benefits-focused, replaces lock prompt when GUEST_FULL_ACCESS) */
function showGuestSignupPrompt() {
  var html = '<div style="text-align:center;padding:12px 0">';
  html += '<div style="font-size:48px;margin-bottom:12px">\u2728</div>';
  html += '<div class="section-title">' + t('Register for Free', '\u514d\u8d39\u6ce8\u518c') + '</div>';
  html += '<div style="text-align:left;margin:16px 0 20px;font-size:14px;line-height:2">';
  html += '<div>\u2705 ' + t('Sync progress across devices', '\u8de8\u8bbe\u5907\u540c\u6b65\u5b66\u4e60\u8fdb\u5ea6') + '</div>';
  html += '<div>\ud83c\udfc6 ' + t('Join the leaderboard', '\u52a0\u5165\u6392\u884c\u699c\u7ade\u4e89') + '</div>';
  html += '<div>\ud83d\udcca ' + t('Track your learning history', '\u8bb0\u5f55\u5b66\u4e60\u5386\u53f2\u6570\u636e') + '</div>';
  html += '</div>';
  html += '<div style="display:flex;gap:8px">';
  html += '<button class="btn btn-primary" style="flex:1" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Later', '\u7a0d\u540e') + '</button>';
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
  html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
  var catInfo = getCategoryInfo(lv.category);
  if (lv.board === '25m' && lv.unitNum) {
    var yn = lv.category.replace('25m-y', '');
    html += '<div class="deck-title">Y' + yn + '.' + lv.unitNum + ' \u00b7 ' + lvTitle(lv) + '</div>';
  } else {
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
    html += '<button class="mode-btn mode-btn-path" onclick="' + m.fn + '">';
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
    { emoji: '\u2328\ufe0f', name: t('Spell', '\u62fc\u5199'), fn: 'startSpell(' + idx + ')' },
    { emoji: '\ud83d\udd17', name: t('Match', '\u914d\u5bf9'), fn: 'startMatch(' + idx + ')' },
    { emoji: '\u2694\ufe0f', name: t('Battle', '\u5b9e\u6218'), fn: 'startBattle(' + idx + ')' }
  ];
  var extraKeys = ['spell', 'match', 'battle'];
  extraModes.forEach(function(m, i) {
    var done = isModeDone(idx, extraKeys[i]);
    html += '<button class="mode-btn mode-btn-extra" onclick="' + m.fn + '">';
    if (done) html += '<span class="mode-done">\u2713</span>';
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div></div>';

  html += '<div class="preview-link"><a href="javascript:void(0)" onclick="openPreview(' + idx + ')">\ud83d\udc41 ' + t('Preview all words', '\u9884\u89c8\u5168\u90e8\u8bcd\u6c47') + ' \u2192</a></div>';

  /* Sort bar */
  html += '<div class="sort-bar">';
  [['default', t('Default', '\u9ed8\u8ba4')], ['az', 'A-Z'], ['random', t('Random', '\u968f\u673a')], ['hard', t('Hard first', '\u96be\u8bcd\u4f18\u5148')]].forEach(function(s) {
    html += '<button class="sort-btn' + (appSort === s[0] ? ' active' : '') + '" onclick="setSort(\'' + s[0] + '\',' + idx + ')">' + s[1] + '</button>';
  });
  html += '</div>';

  /* Word list */
  html += '<div class="word-list">';
  sorted.forEach(function(p) {
    var key = wordKey(idx, p.lid);
    var d = wd[key];
    var lvNum = d ? (d.lv || 0) : 0;
    var ok = d ? (d.ok || 0) : 0;
    var fail = d ? (d.fail || 0) : 0;
    var wStars = d ? (d.stars != null ? d.stars : computeStars(ok, fail)) : 0;
    var lvColor = SRS_COLORS[lvNum] || SRS_COLORS[0];

    html += '<div class="word-row">';
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
  html += '</div>';

  E('panel-deck').innerHTML = html;
}

function setSort(s, idx) {
  appSort = s;
  renderDeck(idx);
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

  html += '<div style="margin-top:16px;text-align:center">';
  html += '<button class="btn btn-secondary" onclick="openDeck(' + idx + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
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
