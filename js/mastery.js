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

/* ═══ HOME DASHBOARD ═══ */
function renderHome() {
  var all = getAllWords();
  var total = all.length;
  var mastered = all.filter(function(w) { return w.status === 'mastered'; }).length;
  var due = getReviewCount();

  var html = '';

  /* Stats row */
  html += '<div class="home-stats">';
  html += '<div class="stat-card"><div class="stat-val">' + total + '</div><div class="stat-label">\u603b\u8bcd\u6c47</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-success)">' + mastered + '</div><div class="stat-label">\u5df2\u638c\u63e1</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:' + (due > 0 ? 'var(--c-warning)' : 'var(--c-muted)') + '">' + due + '</div><div class="stat-label">\u5f85\u590d\u4e60</div></div>';
  html += '</div>';

  /* Rank hint row */
  var homeRank = getRank();
  var homeNext = getNextRank();
  html += '<div class="home-rank-hint" onclick="showRankGuide()">';
  html += '<span class="home-rank-emoji">' + homeRank.emoji + '</span>';
  html += '<span class="home-rank-name">' + homeRank.name + '</span>';
  if (homeNext) {
    var nextNeeded = Math.ceil(homeNext.min / 100 * total);
    var remaining = Math.max(nextNeeded - mastered, 0);
    html += '<span class="home-rank-sep">\u00b7</span>';
    html += '<span class="home-rank-next">\u8ddd ' + homeNext.name + ' \u8fd8\u9700 ' + remaining + ' \u8bcd</span>';
  }
  html += '<span class="home-rank-link">\u67e5\u770b\u8def\u7ebf \u2192</span>';
  html += '</div>';

  /* Deck grid grouped by category */
  CATEGORIES.forEach(function(cat) {
    var catLevels = [];
    LEVELS.forEach(function(lv, i) {
      if (lv.category === cat.id) catLevels.push({ lv: lv, idx: i });
    });
    if (catLevels.length === 0) return;

    html += '<div class="category-section">';
    html += '<div class="category-header">';
    html += '<span class="category-emoji">' + cat.emoji + '</span>';
    html += '<span class="category-name">' + cat.name + '</span>';
    html += '<span class="category-count">' + catLevels.length + ' \u7ec4</span>';
    html += '</div>';

    html += '<div class="deck-grid">';
    catLevels.forEach(function(cl) {
      var stats = getDeckStats(cl.idx);
      html += '<div class="deck-card" onclick="openDeck(' + cl.idx + ')">';
      html += '<div class="deck-card-head">';
      html += '<div class="deck-card-emoji">' + cat.emoji + '</div>';
      html += '<div><div class="deck-card-name">' + cl.lv.title + '</div>';
      html += '<div class="deck-card-count">' + (cl.lv.vocabulary.length / 2) + ' \u8bcd</div></div>';
      html += '</div>';
      html += '<div class="deck-progress"><div class="deck-progress-fill" style="width:' + stats.pct + '%"></div></div>';
      html += '<div class="deck-card-pct">' + stats.pct + '%</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';
  });

  E('panel-home').innerHTML = html;
  updateSidebar();
}

/* ═══ DECK DETAIL ═══ */
function openDeck(idx) {
  currentLvl = idx;
  renderDeck(idx);
  showPanel('deck');
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
  html += '<div class="deck-title">' + catInfo.emoji + ' ' + lv.title + '</div>';
  html += '</div>';

  /* Mode grid */
  html += '<div class="mode-grid">';
  var modes = [
    { emoji: '\ud83d\udc41', name: '\u9884\u89c8', fn: 'openPreview(' + idx + ')' },
    { emoji: '\ud83d\udcd6', name: '\u5b66\u4e60', fn: 'startStudy(' + idx + ')' },
    { emoji: '\u2753', name: '\u6d4b\u9a8c', fn: 'startQuiz(' + idx + ')' },
    { emoji: '\u2328\ufe0f', name: '\u62fc\u5199', fn: 'startSpell(' + idx + ')' },
    { emoji: '\ud83d\udd17', name: '\u914d\u5bf9', fn: 'startMatch(' + idx + ')' },
    { emoji: '\u2694\ufe0f', name: '\u5b9e\u6218', fn: 'startBattle(' + idx + ')' },
    { emoji: '\ud83e\udde0', name: '\u590d\u4e60', fn: 'startReview(' + idx + ')' }
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
  [['default', '\u9ed8\u8ba4'], ['az', 'A-Z'], ['random', '\u968f\u673a'], ['hard', '\u96be\u8bcd\u4f18\u5148']].forEach(function(s) {
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
  html += '<div class="deck-title">\u9884\u89c8: ' + lv.title + '</div>';
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
  html += '<button class="btn btn-secondary" onclick="openDeck(' + idx + ')">\u2190 \u8fd4\u56de\u5361\u7ec4</button>';
  html += '</div>';

  E('panel-preview').innerHTML = html;
}
