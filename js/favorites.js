/* ══════════════════════════════════════════════════════════════
   favorites.js — Favorites Panel + Weakness Analysis (v5.30.0)
   Lazy-loaded via favorites.min.js
   ══════════════════════════════════════════════════════════════ */

var _favCurrentTab = 'vocab';
var _favSortBy = 'date';

function renderFavorites() {
  var el = E('panel-favorites');
  if (!el) return;

  var counts = {
    vocab: getFavCount('vocab'),
    kp: getFavCount('kp'),
    pattern: getFavCount('pattern'),
    pp: getFavCount('pp')
  };
  var totalCount = counts.vocab + counts.kp + counts.pattern + counts.pp;

  var html = '';

  /* Header */
  html += '<div class="fav-header">';
  html += '<div class="fav-title">⭐ ' + t('My Favorites', '我的收藏') + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-top:4px">';
  html += totalCount + ' ' + t('items collected', '个收藏项目');
  html += '</div>';
  html += '</div>';

  /* Tabs */
  var tabs = [
    { key: 'vocab', label: t('Words', '单词'), count: counts.vocab, icon: '📝' },
    { key: 'kp', label: t('Knowledge', '知识点'), count: counts.kp, icon: '📖' },
    { key: 'pattern', label: t('Patterns', '题型'), count: counts.pattern, icon: '🔍' },
    { key: 'pp', label: t('Papers', '真题'), count: counts.pp, icon: '📄' }
  ];
  html += '<div class="fav-tabs" id="fav-tabs">';
  for (var ti = 0; ti < tabs.length; ti++) {
    var tab = tabs[ti];
    html += '<button class="fav-tab' + (_favCurrentTab === tab.key ? ' active' : '') + '" data-fav-tab="' + tab.key + '">';
    html += tab.icon + ' ' + tab.label;
    html += '<span class="fav-tab-badge">' + tab.count + '</span>';
    html += '</button>';
  }
  html += '</div>';

  /* Sort bar */
  html += '<div class="fav-sort-bar">';
  var sorts = [
    { key: 'date', label: t('Latest', '最新') },
    { key: 'section', label: t('By Section', '按章节') },
    { key: 'mastery', label: t('By Mastery', '按掌握度') }
  ];
  for (var si = 0; si < sorts.length; si++) {
    html += '<button class="fav-sort-btn' + (_favSortBy === sorts[si].key ? ' active' : '') + '" data-fav-sort="' + sorts[si].key + '">';
    html += sorts[si].label + '</button>';
  }
  html += '</div>';

  /* Empty state for brand new users */
  if (totalCount === 0) {
    html += '<div class="fav-empty" style="padding:60px 20px">';
    html += '<div class="fav-empty-icon">⭐</div>';
    html += '<div class="fav-empty-text" style="font-size:16px;font-weight:600;margin-bottom:8px">' + t('Your collection starts here', '你的收藏从这里开始') + '</div>';
    html += '<div style="font-size:13px;color:var(--c-text2);line-height:1.6;max-width:320px;margin:0 auto">';
    html += t('As you study, tap the ☆ on any word, knowledge point, or exam question to save it here. We\u2019ll help you track your progress and find your weak spots.', '学习过程中，点击任何单词、知识点或真题旁的 ☆ 即可收藏。我们会帮你追踪进度，发现薄弱环节。');
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:20px" onclick="navTo(\'home\')">' + t('Start Exploring', '开始探索') + ' \u2192</button>';
    html += '</div>';
    el.innerHTML = html;
    return;
  }

  /* Content */
  html += '<div id="fav-content">';
  html += _favRenderTab(_favCurrentTab);
  html += '</div>';

  /* Weakness Analysis */
  html += _favRenderWeakness();

  el.innerHTML = html;

  /* Bind events */
  _favBindEvents(el);

  /* Render math if available */
  if (typeof loadKaTeX === 'function') {
    loadKaTeX().then(function() { renderMath(el); });
  }
}

function _favRenderTab(type) {
  var items = getFavorites(type);
  if (items.length === 0) {
    return '<div class="fav-empty">' +
      '<div class="fav-empty-icon">☆</div>' +
      '<div class="fav-empty-text">' + t('No favorites yet', '还没有收藏') + '</div>' +
      '<div style="font-size:12px;color:var(--c-muted);margin-top:8px">' +
        t('Tap ☆ on any item to add it here', '点击任意项目的 ☆ 即可收藏') +
      '</div></div>';
  }

  /* Sort */
  items = _favSortItems(items, _favSortBy);

  var html = '<div class="fav-list">';
  for (var i = 0; i < items.length; i++) {
    switch (type) {
      case 'vocab':   html += _favRenderVocabItem(items[i]); break;
      case 'kp':      html += _favRenderKPItem(items[i]); break;
      case 'pattern': html += _favRenderPatternItem(items[i]); break;
      case 'pp':      html += _favRenderPPItem(items[i]); break;
    }
  }
  html += '</div>';
  return html;
}

function _favSortItems(items, sortBy) {
  if (sortBy === 'section') {
    items.sort(function(a, b) { return (a.section || '').localeCompare(b.section || ''); });
  } else if (sortBy === 'mastery') {
    items.sort(function(a, b) {
      var fsA = _favGetFLM(a);
      var fsB = _favGetFLM(b);
      var order = { 'new': 0, learning: 1, uncertain: 2, mastered: 3 };
      return (order[fsA] || 0) - (order[fsB] || 0);
    });
  }
  /* date sort is default (already sorted by addedAt desc in getFavorites) */
  return items;
}

function _favGetFLM(fav) {
  if (fav.type === 'vocab') {
    var wd = typeof getWordData === 'function' ? getWordData() : {};
    var d = wd[fav.ref];
    return d ? (d.fs || 'new') : 'new';
  } else if (fav.type === 'kp') {
    var kpR = typeof getKPResult === 'function' ? getKPResult(fav.ref) : null;
    var kpFLM = typeof getKPFLM === 'function' ? getKPFLM(fav.ref) : 'new';
    return kpFLM;
  } else if (fav.type === 'pp') {
    var m = typeof _ppGetMastery === 'function' ? _ppGetMastery() : {};
    return m[fav.ref] ? (m[fav.ref].fs || 'new') : 'new';
  }
  return 'new';
}

function _favFLMBadge(fs) {
  var colors = { mastered: '#22c55e', uncertain: '#f59e0b', learning: '#6C63FF', 'new': '#9CA3AF' };
  var labels = { mastered: t('Mastered', '已掌握'), uncertain: t('Uncertain', '不确定'), learning: t('Learning', '学习中'), 'new': t('New', '未学') };
  var c = colors[fs] || colors['new'];
  return '<span class="fav-item-status" style="background:' + c + '18;color:' + c + '">' + (labels[fs] || labels['new']) + '</span>';
}

function _favRenderVocabItem(fav) {
  var fs = _favGetFLM(fav);
  var word = fav.meta.word || fav.ref;
  var def = fav.meta.def || '';
  return '<div class="fav-item" data-fav-action="vocab" data-fav-ref="' + escapeHtml(fav.ref) + '">' +
    '<div class="fav-item-icon">📝</div>' +
    '<div class="fav-item-info">' +
      '<div class="fav-item-title">' + escapeHtml(word) + '</div>' +
      '<div class="fav-item-sub">' + escapeHtml(def) + '</div>' +
    '</div>' +
    _favFLMBadge(fs) +
    favStarHtml('vocab', fav.ref, fav.board, fav.section, fav.meta) +
  '</div>';
}

function _favRenderKPItem(fav) {
  var fs = _favGetFLM(fav);
  var title = fav.meta.title || fav.ref;
  var titleZh = fav.meta.title_zh || '';
  return '<div class="fav-item" data-fav-action="kp" data-fav-ref="' + escapeHtml(fav.ref) + '" data-fav-board="' + escapeHtml(fav.board) + '">' +
    '<div class="fav-item-icon">📖</div>' +
    '<div class="fav-item-info">' +
      '<div class="fav-item-title">' + escapeHtml(title) + '</div>' +
      '<div class="fav-item-sub">' + escapeHtml(titleZh) + (fav.section ? ' · ' + fav.section : '') + '</div>' +
    '</div>' +
    _favFLMBadge(fs) +
    '<button class="btn btn-sm btn-primary" data-fav-action="learn-kp" data-fav-ref="' + escapeHtml(fav.ref) + '" data-fav-board="' + escapeHtml(fav.board) + '">' +
      t('Learn', '学习') +
    '</button>' +
    favStarHtml('kp', fav.ref, fav.board, fav.section, fav.meta) +
  '</div>';
}

function _favRenderPatternItem(fav) {
  var label = fav.meta.label || fav.ref;
  return '<div class="fav-item">' +
    '<div class="fav-item-icon">🔍</div>' +
    '<div class="fav-item-info">' +
      '<div class="fav-item-title">' + escapeHtml(label) + '</div>' +
      '<div class="fav-item-sub">' + (fav.section || '') + '</div>' +
    '</div>' +
    favStarHtml('pattern', fav.ref, fav.board, fav.section, fav.meta) +
  '</div>';
}

function _favRenderPPItem(fav) {
  var fs = _favGetFLM(fav);
  var src = fav.meta.src || fav.ref;
  var marks = fav.meta.marks || '';
  return '<div class="fav-item" data-fav-action="pp" data-fav-ref="' + escapeHtml(fav.ref) + '" data-fav-board="' + escapeHtml(fav.board) + '">' +
    '<div class="fav-item-icon">📄</div>' +
    '<div class="fav-item-info">' +
      '<div class="fav-item-title">' + escapeHtml(src) + '</div>' +
      '<div class="fav-item-sub">' + (marks ? marks + ' marks' : '') + (fav.section ? ' · ' + fav.section : '') + '</div>' +
    '</div>' +
    _favFLMBadge(fs) +
    favStarHtml('pp', fav.ref, fav.board, fav.section, fav.meta) +
  '</div>';
}

/* ═══ WEAKNESS ANALYSIS ═══ */

function _favRenderWeakness() {
  var allFavs = getFavorites();
  if (allFavs.length < 3) return ''; /* Need at least 3 favorites for meaningful analysis */

  var analysis = _favAnalyzeWeakness();
  if (analysis.length === 0) return '';

  var html = '<div class="fav-weak-section">';
  html += '<div class="fav-weak-title">🔬 ' + t('Weakness Analysis', '薄弱分析') + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-bottom:12px">' +
    t('Based on your favorites and learning progress', '基于你的收藏和学习进度') + '</div>';
  html += '<div class="fav-weak-cards">';

  var shown = Math.min(analysis.length, 5);
  for (var i = 0; i < shown; i++) {
    var w = analysis[i];
    html += '<div class="fav-weak-card">';
    html += '<div class="fav-weak-card-header">';
    html += '<div class="fav-weak-card-section">' + w.section + ' ' + escapeHtml(w.sectionTitle || '') + '</div>';
    html += '<div class="fav-weak-card-score">' + t('Score', '分数') + ': ' + w.score + '</div>';
    html += '</div>';
    html += '<div class="fav-weak-card-stats">';
    if (w.vocabCount > 0) html += '<span>📝 ' + w.vocabCount + ' ' + t('words', '单词') + '</span>';
    if (w.kpCount > 0) html += '<span>📖 ' + w.kpCount + ' ' + t('KPs', '知识点') + '</span>';
    if (w.ppCount > 0) html += '<span>📄 ' + w.ppCount + ' ' + t('questions', '题') + '</span>';
    html += '<span>' + w.unmasteredPct + '% ' + t('unmastered', '未掌握') + '</span>';
    html += '</div>';
    if (w.recommendation) {
      html += '<div class="fav-weak-card-rec">' + escapeHtml(w.recommendation) + '</div>';
    }
    html += '<button class="btn btn-sm btn-primary fav-weak-fix-btn" data-fav-action="fix" data-fav-section="' + escapeHtml(w.section) + '" data-fav-board="' + escapeHtml(w.board) + '">';
    html += '🔧 ' + t('Start Fixing', '开始修复');
    html += '</button>';
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

function _favAnalyzeWeakness() {
  var allFavs = getFavorites();
  /* Group by section */
  var sectionMap = {};
  for (var i = 0; i < allFavs.length; i++) {
    var fav = allFavs[i];
    if (!fav.section) continue;
    var sKey = fav.board + ':' + fav.section;
    if (!sectionMap[sKey]) {
      sectionMap[sKey] = { section: fav.section, board: fav.board, sectionTitle: '', items: [] };
    }
    sectionMap[sKey].items.push(fav);
  }

  /* Resolve section titles */
  var boardData = typeof BOARD_SYLLABUS !== 'undefined' ? BOARD_SYLLABUS : {};
  var keys = Object.keys(sectionMap);
  for (var k = 0; k < keys.length; k++) {
    var entry = sectionMap[keys[k]];
    var bData = boardData[entry.board];
    if (bData) {
      for (var ch = 0; ch < bData.length; ch++) {
        var secs = bData[ch].sections || [];
        for (var si = 0; si < secs.length; si++) {
          if (secs[si].id === entry.section) {
            entry.sectionTitle = secs[si].title || '';
            break;
          }
        }
      }
    }
  }

  /* Score each section */
  var results = [];
  for (var k2 = 0; k2 < keys.length; k2++) {
    var e = sectionMap[keys[k2]];
    var vocabCount = 0, kpCount = 0, ppCount = 0, patternCount = 0;
    var unmasteredCount = 0, totalCount = e.items.length;

    for (var j = 0; j < e.items.length; j++) {
      var item = e.items[j];
      var fs = _favGetFLM(item);
      if (fs !== 'mastered') unmasteredCount++;
      switch (item.type) {
        case 'vocab': vocabCount++; break;
        case 'kp': kpCount++; break;
        case 'pp': ppCount++; break;
        case 'pattern': patternCount++; break;
      }
    }

    var unmasteredVocab = 0, unmasteredKP = 0;
    for (var j2 = 0; j2 < e.items.length; j2++) {
      var fs2 = _favGetFLM(e.items[j2]);
      if (fs2 !== 'mastered') {
        if (e.items[j2].type === 'vocab') unmasteredVocab++;
        if (e.items[j2].type === 'kp') unmasteredKP++;
      }
    }

    var score = unmasteredVocab * 2 + unmasteredKP * 3 + ppCount * 1 + patternCount * 1;
    if (score === 0) continue;

    var unmasteredPct = totalCount > 0 ? Math.round(unmasteredCount / totalCount * 100) : 0;

    /* Generate recommendation */
    var rec = '';
    if (unmasteredKP > 0) {
      rec = t('Focus on knowledge points first — understanding concepts will help everything else', '先攻克知识点——理解概念后其他方面会更容易');
    } else if (unmasteredVocab > 0) {
      rec = t('Review the key vocabulary — knowing the terms makes questions clearer', '复习关键词汇——熟悉术语让题目更清晰');
    } else if (ppCount > 0) {
      rec = t('Practice more past paper questions in this section', '多做这个章节的真题练习');
    }

    results.push({
      section: e.section,
      board: e.board,
      sectionTitle: e.sectionTitle,
      score: score,
      vocabCount: vocabCount,
      kpCount: kpCount,
      ppCount: ppCount,
      unmasteredPct: unmasteredPct,
      recommendation: rec
    });
  }

  results.sort(function(a, b) { return b.score - a.score; });
  return results;
}

/* ═══ EVENT BINDING ═══ */

function _favBindEvents(el) {
  /* Tab clicks */
  var tabBar = el.querySelector('#fav-tabs');
  if (tabBar) {
    tabBar.addEventListener('click', function(e) {
      var tab = e.target.closest('[data-fav-tab]');
      if (!tab) return;
      _favCurrentTab = tab.dataset.favTab;
      renderFavorites();
    });
  }

  /* Sort clicks */
  el.addEventListener('click', function(e) {
    var sortBtn = e.target.closest('[data-fav-sort]');
    if (sortBtn) {
      _favSortBy = sortBtn.dataset.favSort;
      renderFavorites();
      return;
    }

    /* Item actions */
    var item = e.target.closest('[data-fav-action]');
    if (!item) return;
    var action = item.dataset.favAction;
    var ref = item.dataset.favRef;
    var board = item.dataset.favBoard || '';

    if (action === 'kp' && ref) {
      /* Navigate to KP detail */
      if (typeof openKnowledgePoint === 'function') {
        openKnowledgePoint(ref, board);
      }
    } else if (action === 'learn-kp' && ref) {
      /* Open Knowledge Node for this KP (lazy-load practice bundle which contains knowledge-node.js) */
      _lazyCall('practice', 'openKnowledgeNode', [ref, board]);
    } else if (action === 'pp' && ref) {
      /* Navigate to PP card (lazy-load practice bundle) */
      _lazyLoad('practice', function() {
        if (typeof loadPastPaperData === 'function' && typeof startPPScanByIds === 'function') {
          loadPastPaperData(board).then(function() {
            startPPScanByIds([ref], board, true);
          });
        }
      });
    } else if (action === 'fix') {
      /* Navigate to section (openSection is in syllabus.js, part of core bundle) */
      var sec = item.dataset.favSection;
      if (sec && typeof openSection === 'function') {
        openSection(sec, board);
      }
    }
  });
}
