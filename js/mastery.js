/* ══════════════════════════════════════════════════════════════
   mastery.js — Home dashboard, deck detail, mode selection, sort
   ══════════════════════════════════════════════════════════════ */

/* ═══ MASTERY CALCULATIONS ═══ */
function getMasteryPct() {
  var all = getAllWords();
  if (all.length === 0) return 0;
  var m = all.filter(function(w) { return w.status === 'mastered'; }).length;
  return Math.round(m / all.length * 100);
}

function getRank() {
  var pct = getMasteryPct();
  var r = RANKS[0];
  for (var i = RANKS.length - 1; i >= 0; i--) {
    if (pct >= RANKS[i].min) { r = RANKS[i]; break; }
  }
  return r;
}

function getNextRank() {
  var pct = getMasteryPct();
  for (var i = 0; i < RANKS.length; i++) {
    if (pct < RANKS[i].min) return RANKS[i];
  }
  return null;
}

/* ═══ DECK STATS ═══ */
function getDeckStats(li) {
  var lv = LEVELS[li];
  var pairs = getPairs(lv.vocabulary);
  var wd = getWordData();
  var mastered = 0;
  pairs.forEach(function(p) {
    var key = wordKey(li, p.lid);
    var d = wd[key];
    if (d && d.st === 'mastered') mastered++;
  });
  return { total: pairs.length, mastered: mastered, pct: pairs.length > 0 ? Math.round(mastered / pairs.length * 100) : 0 };
}

/* ═══ CATEGORY COLLAPSE STATE ═══ */
/* All categories default collapsed */
var catCollapsed = {};
(function initCatCollapsed() {
  BOARDS.forEach(function(b) {
    b.categories.forEach(function(c) { catCollapsed[c.id] = true; });
  });
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

/* Backward compat */
var sidebarCIEOpen = false;
function toggleCIESidebar() { toggleBoardSidebar('cie'); }

/* ═══ HOME DASHBOARD ═══ */
function renderHome() {
  var all = getAllWords();
  var total = all.length;
  var mastered = all.filter(function(w) { return w.status === 'mastered'; }).length;
  var due = getReviewCount();

  var html = '';

  /* Stats row */
  html += '<div class="home-stats">';
  html += '<div class="stat-card"><div class="stat-val">' + total + '</div><div class="stat-label">' + t('Total', '\u603b\u8bcd\u6c47') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-success)">' + mastered + '</div><div class="stat-label">' + t('Mastered', '\u5df2\u638c\u63e1') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:' + (due > 0 ? 'var(--c-warning)' : 'var(--c-muted)') + '">' + due + '</div><div class="stat-label">' + t('Due', '\u5f85\u590d\u4e60') + '</div></div>';
  var streakN = getStreakCount();
  html += '<div class="stat-card stat-card-streak"><div class="stat-val" style="color:var(--c-streak)">🔥 ' + streakN + '</div><div class="stat-label">' + t('Streak', '连续天数') + '</div></div>';
  html += '</div>';

  /* Rank hint row */
  var homeRank = getRank();
  var homeNext = getNextRank();
  html += '<div class="home-rank-hint" onclick="showRankGuide()">';
  html += '<span class="home-rank-emoji">' + homeRank.emoji + '</span>';
  html += '<span class="home-rank-name">' + rankName(homeRank) + '</span>';
  if (homeNext) {
    var nextNeeded = Math.ceil(homeNext.min / 100 * total);
    var remaining = Math.max(nextNeeded - mastered, 0);
    html += '<span class="home-rank-sep">\u00b7</span>';
    html += '<span class="home-rank-next">' + t(remaining + ' to ' + rankName(homeNext), '\u8ddd ' + rankName(homeNext) + ' \u8fd8\u9700 ' + remaining + ' \u8bcd') + '</span>';
  }
  html += '<span class="home-rank-link">' + t('View path \u2192', '\u67e5\u770b\u8def\u7ebf \u2192') + '</span>';
  html += '</div>';

  /* Guest trial banner */
  if (currentUser && currentUser.id === 'local') {
    var totalVisible = 0;
    for (var gi = 0; gi < LEVELS.length; gi++) { if (isLevelVisible(LEVELS[gi])) totalVisible++; }
    html += '<div class="guest-trial-banner" onclick="showGuestLockPrompt()">';
    html += '<span class="guest-trial-icon">\ud83d\udd13</span>';
    html += '<span class="guest-trial-text">' + t('Free Trial: ' + GUEST_FREE_LIMIT + ' groups', '\u514d\u8d39\u8bd5\u7528\uff1a' + GUEST_FREE_LIMIT + ' \u4e2a\u8bcd\u7ec4') + ' · ' + t('Login to unlock all ' + totalVisible + ' groups', '\u767b\u5f55\u89e3\u9501\u5168\u90e8 ' + totalVisible + ' \u4e2a\u8bcd\u7ec4') + '</span>';
    html += '<span class="guest-trial-arrow">\u2192</span>';
    html += '</div>';
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
    /* Compute board-level stats */
    var boardTotal = 0, boardMastered = 0;
    board.categories.forEach(function(cat) {
      LEVELS.forEach(function(lv, i) {
        if (lv.category === cat.id && isLevelVisible(lv) && !isGuestLocked(i)) {
          var s = getDeckStats(i);
          boardTotal += s.total;
          boardMastered += s.mastered;
        }
      });
    });
    var boardPct = boardTotal > 0 ? Math.round(boardMastered / boardTotal * 100) : 0;

    /* Build board HTML in temp var, only append if has matching content */
    var boardHtml = '';
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
      boardHtml += '<span class="category-count">' + catLevels.length + ' ' + t('groups', '\u7ec4') + '</span>';
      boardHtml += '<span class="category-chevron">\u25bc</span>';
      boardHtml += '</div>';

      boardHtml += '<div class="deck-grid category-body">';
      catLevels.forEach(function(cl) {
        var locked = isGuestLocked(cl.idx);
        var stats = locked ? { pct: 0 } : getDeckStats(cl.idx);
        boardHtml += '<div class="deck-card' + (locked ? ' locked' : '') + '" onclick="' + (locked ? 'showGuestLockPrompt()' : 'openDeck(' + cl.idx + ')') + '">';
        boardHtml += '<div class="deck-card-head">';
        boardHtml += '<div class="deck-card-emoji">' + cat.emoji + '</div>';
        boardHtml += '<div><div class="deck-card-name">' + lvTitle(cl.lv) + '</div>';
        boardHtml += '<div class="deck-card-count">' + (cl.lv.vocabulary.length / 2) + ' ' + t('words', '\u8bcd') + '</div></div>';
        if (locked) boardHtml += '<div class="deck-lock-badge">\ud83d\udd12</div>';
        boardHtml += '</div>';
        boardHtml += '<div class="deck-progress"><div class="deck-progress-fill" style="width:' + stats.pct + '%"></div></div>';
        boardHtml += '<div class="deck-card-pct">' + (locked ? '' : stats.pct + '%') + '</div>';
        boardHtml += '</div>';
      });
      boardHtml += '</div>';
      boardHtml += '</div>';
    });

    if (boardHtml) {
      hasAnyResult = true;
      html += '<div class="board-section" id="board-' + board.id + '">';
      html += '<div class="board-header">';
      html += '<span class="board-emoji">' + board.emoji + '</span>';
      html += '<span class="board-name">' + boardName(board) + '</span>';
      html += '<span class="board-stats">' + boardMastered + '/' + boardTotal + ' · ' + boardPct + '%</span>';
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
  html += '<div class="deck-title">' + catInfo.emoji + ' ' + lvTitle(lv) + '</div>';
  html += '</div>';

  /* Mode grid */
  html += '<div class="mode-grid">';
  var modes = [
    { emoji: '\ud83d\udc41', name: t('Preview', '\u9884\u89c8'), fn: 'openPreview(' + idx + ')' },
    { emoji: '\ud83d\udcd6', name: t('Study', '\u5b66\u4e60'), fn: 'startStudy(' + idx + ')' },
    { emoji: '\u2753', name: t('Quiz', '\u6d4b\u9a8c'), fn: 'startQuiz(' + idx + ')' },
    { emoji: '\u2328\ufe0f', name: t('Spell', '\u62fc\u5199'), fn: 'startSpell(' + idx + ')' },
    { emoji: '\ud83d\udd17', name: t('Match', '\u914d\u5bf9'), fn: 'startMatch(' + idx + ')' },
    { emoji: '\u2694\ufe0f', name: t('Battle', '\u5b9e\u6218'), fn: 'startBattle(' + idx + ')' },
    { emoji: '\ud83e\udde0', name: t('Review', '\u590d\u4e60'), fn: 'startReview(' + idx + ')' }
  ];
  modes.forEach(function(m) {
    html += '<button class="mode-btn" onclick="' + m.fn + '">';
    html += '<div class="mode-emoji">' + m.emoji + '</div>';
    html += '<div class="mode-name">' + m.name + '</div>';
    html += '</button>';
  });
  html += '</div>';

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
    var lvColor = SRS_COLORS[lvNum] || SRS_COLORS[0];

    html += '<div class="word-row">';
    html += '<div class="word-en">' + p.word + '</div>';
    if (appLang === 'bilingual') {
      html += '<div class="word-zh">' + p.def + '</div>';
    }
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
var browseIdx = 0;
var browsePairs = [];

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
    html += '<div class="preview-en">' + p.word + '</div>';
    if (appLang === 'bilingual') {
      html += '<div class="preview-zh">' + p.def + '</div>';
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
