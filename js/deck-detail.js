/* ══════════════════════════════════════════════════════════════
   deck-detail.js — Deck Detail view (word list, filters, preview)
   Lazy-loaded via deck-detail.min.js
   ══════════════════════════════════════════════════════════════ */

function _setFLMFilter(key, idx) {
  _deckFLMFilter = key === 'all' ? null : key;
  /* When FLM filter is set, disable old hideMastered */
  if (_deckFLMFilter) _deckHideMastered = false;
  _renderDeck(idx);
}

function _renderDeck(idx) {
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

  /* Deck-level refresh banner */
  var _deckStale = typeof getStaleWords === 'function' ?
    getStaleWords().filter(function(w) { return w.level === idx; }) : [];
  if (_deckStale.length > 0) {
    html += '<div class="deck-refresh-banner">';
    html += '<span class="deck-refresh-icon">\ud83d\udd04</span>';
    html += '<span class="deck-refresh-text">' + _deckStale.length + ' ' + t('words ready for a quick refresh', '\u4e2a\u8bcd\u53ef\u4ee5\u5feb\u901f\u56de\u987e') + '</span>';
    html += '<button class="btn btn-primary btn-sm" data-action="deck-refresh" data-li="' + idx + '">' + t('Quick Refresh', '\u5feb\u901f\u590d\u67e5') + '</button>';
    html += '</div>';
  }

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
  [['default', t('Default', '\u9ed8\u8ba4')], ['az', 'A-Z'], ['random', t('Random', '\u968f\u673a')], ['hard', t('Challenge first', '\u6311\u6218\u4f18\u5148')]].forEach(function(s) {
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
    if (appLang !== 'en') {
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
    /* Favorite star */
    if (typeof favStarHtml === 'function') {
      var _favBoard = lv.board || lv._board || '';
      var _favSec = lv._section || '';
      html += favStarHtml('vocab', key, _favBoard, _favSec, { word: p.word, def: p.def });
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
  /* Render KaTeX math in word list (e.g. $f(x)$) */
  if (typeof loadKaTeX === 'function') {
    loadKaTeX().then(function() { renderMath(E('panel-deck')); });
  }
}

function setSort(s, idx) {
  appSort = s;
  _renderDeck(idx);
}

/* ═══ WORD FILTER HANDLERS ═══ */

function toggleDeckSelect(idx) {
  _deckSelectMode = !_deckSelectMode;
  if (!_deckSelectMode) {
    _deckSelectedWords = {};
    _deckSelectCount = 0;
  }
  _renderDeck(idx);
}

function toggleHideMastered(idx) {
  _deckHideMastered = !_deckHideMastered;
  try {
    var prefs = JSON.parse(localStorage.getItem('word_filter_prefs')) || {};
    prefs.hideMastered = _deckHideMastered;
    localStorage.setItem('word_filter_prefs', JSON.stringify(prefs));
  } catch(e) {}
  _renderDeck(idx);
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
  _renderDeck(idx);
}

function clearSelection(idx) {
  _deckSelectedWords = {};
  _deckSelectCount = 0;
  _renderDeck(idx);
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
  _renderDeck(idx);
}

function studySelected(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var subset = pairs.filter(function(p) { return _deckSelectedWords[p.lid]; });
  if (subset.length === 0) {
    showToast(t('No words selected', '\u672a\u9009\u62e9\u5355\u8bcd'));
    return;
  }
  _lazyCall('study-quiz-battle', 'startStudy', [idx, shuffle(subset)]);
}

function quizSelected(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);
  var subset = pairs.filter(function(p) { return _deckSelectedWords[p.lid]; });
  if (subset.length < 4) {
    showToast(t('Select at least 4 words for quiz', '\u81f3\u5c11\u9009\u62e9 4 \u4e2a\u5355\u8bcd\u624d\u80fd\u6d4b\u9a8c'));
    return;
  }
  _lazyCall('study-quiz-battle', 'startQuiz', [idx, subset]);
}

/* ═══ QUICK BROWSE MODAL ═══ */
function openPreview(idx) {
  currentLvl = idx;
  _renderPreview(idx);
  showPanel('preview');
}

function _renderPreview(idx) {
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
    if (appLang !== 'en') {
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
  if (typeof loadKaTeX === 'function') {
    loadKaTeX().then(function() { renderMath(E('panel-preview')); });
  }
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
_initDeckActionDelegation();
