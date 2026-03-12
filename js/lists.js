/* ══════════════════════════════════════════════════════════════
   lists.js — Learning Items List View + Custom Lists + List Scan
   v4.7.0: Tabbed list view with 7-dimension filtering, sorting,
   bulk actions, and custom list management with session tracking.
   ══════════════════════════════════════════════════════════════ */

var _listTab = 'words';   /* words | kps | pps | mylists */
var _listFilters = { board: [], grade: [], unit: [], year: [], season: [], paper: [], section: [], status: [], reforget: [], search: '' };
var _listSort = { col: 'word', asc: true };
var _listSelected = {};   /* { 'vocab:L_3_W12': true, ... } */
var _listPage = 0;
var _listPageSize = (function() { try { var v = parseInt(localStorage.getItem('list_pagesize')); return (v === 20 || v === 50) ? v : 20; } catch(e) { return 20; } })();
var _listData = [];       /* current filtered+sorted data */
var _listRawCache = null; /* { tab, data } — raw items cache, invalidated on tab switch */

/* ═══ ENTRY POINT ═══ */

function renderListView() {
  var el = document.getElementById('panel-lists');
  if (!el) return;
  _listSelected = {};
  _listRawCache = null;
  var zh = (appLang !== 'en');
  var html = '<div class="list-view">';

  /* Sticky header: title + tabs + filters */
  html += '<div class="list-header-sticky">';
  html += '<div style="display:flex;align-items:center;gap:8px">';
  html += '<h2 class="section-title" style="margin:0">' + (zh ? '\u5b66\u4e60\u9879\u76ee' : 'Learning Items') + '</h2>';
  html += '<button class="btn btn-sm btn-ghost list-help-btn" id="list-help-btn" aria-label="Help" title="' + (zh ? '\u4f7f\u7528\u8bf4\u660e' : 'How to use') + '">?</button>';
  html += '</div>';

  /* Tab bar */
  html += '<div class="list-tabs">';
  var tabs = [
    { id: 'words', en: 'Words', zh: '\u8bcd\u6c47' },
    { id: 'kps', en: 'Knowledge Points', zh: '\u77e5\u8bc6\u70b9' },
    { id: 'pps', en: 'Past Papers', zh: '\u771f\u9898' },
    { id: 'mylists', en: 'My Lists', zh: '\u6211\u7684\u6e05\u5355' }
  ];
  for (var ti = 0; ti < tabs.length; ti++) {
    html += '<button class="list-tab' + (_listTab === tabs[ti].id ? ' active' : '') + '" data-listtab="' + tabs[ti].id + '">';
    html += (zh ? tabs[ti].zh : tabs[ti].en);
    html += '</button>';
  }
  html += '</div>';

  /* Filter bar (not for mylists) */
  if (_listTab !== 'mylists') {
    html += _renderListFilters(zh);
  }
  html += '</div>'; /* end .list-header-sticky */

  /* Content area */
  html += '<div id="list-content"></div>';

  html += '</div>';
  el.innerHTML = html;

  /* Bind tab clicks */
  el.querySelectorAll('.list-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _listTab = btn.dataset.listtab;
      _listPage = 0;
      _listSelected = {};
      _listRawCache = null;
      _listSort = { col: 'word', asc: true };
      _listFilters = { board: [], grade: [], unit: [], year: [], season: [], paper: [], section: [], status: [], reforget: [], search: '' };
      renderListView();
    });
  });

  /* Help button */
  var helpBtn = el.querySelector('#list-help-btn');
  if (helpBtn) helpBtn.addEventListener('click', _showListHelp);

  /* Bind filter changes */
  _bindListFilters(el);

  /* Render tab content */
  if (_listTab === 'mylists') {
    _renderMyLists();
  } else {
    _renderListTable();
  }
}

/* ═══ FILTER BAR ═══ */

function _renderMultiDrop(id, label, options, selected) {
  var count = selected.length;
  var btnText = count > 0 ? label + ' (' + count + ')' : label;
  var html = '<div class="lf-drop" id="lf-drop-' + id + '">';
  html += '<button class="lf-drop-btn' + (count > 0 ? ' has-selection' : '') + '" type="button">' + _escList(btnText) + ' \u25be</button>';
  html += '<div class="lf-drop-menu">';
  var lastGroup = null;
  for (var i = 0; i < options.length; i++) {
    var o = options[i];
    var val = typeof o === 'object' ? o.value : o;
    var lbl = typeof o === 'object' ? o.label : o;
    var grp = (typeof o === 'object' && o.group) ? o.group : null;
    /* Group separator */
    if (grp && grp !== lastGroup) {
      lastGroup = grp;
      html += '<div class="lf-drop-group">' + _escList(grp) + '</div>';
    }
    var chk = selected.indexOf(val) !== -1 ? ' checked' : '';
    html += '<label class="lf-drop-item' + (grp ? ' lf-drop-grouped' : '') + '"><input type="checkbox" value="' + _escList(String(val)) + '"' + chk + '> ' + _escList(String(lbl)) + '</label>';
  }
  html += '</div></div>';
  return html;
}

function _getBoardCounts() {
  /* Count raw items per board for current tab — lightweight, no caching needed */
  var counts = {};
  if (_listTab === 'words') {
    var all = typeof getAllWords === 'function' ? getAllWords() : [];
    for (var i = 0; i < all.length; i++) {
      var lvObj = (typeof LEVELS !== 'undefined' && all[i].level >= 0 && all[i].level < LEVELS.length) ? LEVELS[all[i].level] : null;
      var b = lvObj ? (lvObj.board || '') : '';
      if (b) counts[b] = (counts[b] || 0) + 1;
    }
  } else if (_listTab === 'kps') {
    var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
    for (var bi = 0; bi < boards.length; bi++) {
      var board = boards[bi].id || boards[bi];
      var sylKey = board === '25m' ? 'hhk' : board;
      var pts = (typeof _kpData !== 'undefined') ? (_kpData[sylKey] || []) : [];
      if (pts.length > 0) counts[board] = pts.length;
    }
  } else if (_listTab === 'pps') {
    var ppBoards = ['cie', 'edx'];
    for (var pi = 0; pi < ppBoards.length; pi++) {
      var ppB = (typeof _ppData !== 'undefined') ? _ppData[ppBoards[pi]] : null;
      if (ppB && ppB.questions) counts[ppBoards[pi]] = ppB.questions.length;
    }
  }
  return counts;
}

function _renderListFilters(zh) {
  var f = _listFilters;
  var html = '';

  /* ── Level 1: Board chip bar ── */
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  var boardLabels = { '25m': (zh ? '\u54c8\u7f57\u6d77\u53e3' : 'Harrow HK'), cie: 'CIE 0580', edx: 'Edexcel 4MA1' };
  /* PPs only have CIE/EDX data — hide 25m chip for PPs tab */
  var tabBoards = boards;
  if (_listTab === 'pps') {
    tabBoards = boards.filter(function(b) { var id = b.id || b; return id !== '25m'; });
  }
  /* Pre-count items per board for chip labels */
  var boardCounts = _getBoardCounts();
  html += '<div class="lf-board-bar">';
  for (var bi = 0; bi < tabBoards.length; bi++) {
    var bid = tabBoards[bi].id || tabBoards[bi];
    var active = f.board.indexOf(bid) !== -1;
    var chipLabel = (boardLabels[bid] || bid);
    if (boardCounts[bid] !== undefined) chipLabel += ' (' + boardCounts[bid] + ')';
    html += '<button class="lf-board-chip' + (active ? ' active' : '') + '" data-board="' + bid + '" type="button">' + chipLabel + '</button>';
  }
  html += '</div>';

  /* ── Level 2: Conditional filters ── */
  var has25m = f.board.indexOf('25m') !== -1 || f.board.length === 0;
  var hasCieEdx = f.board.indexOf('cie') !== -1 || f.board.indexOf('edx') !== -1 || f.board.length === 0;

  html += '<div class="list-filter-bar">';

  /* 25m: Grade + Unit (for Words/KPs tabs) */
  if (has25m && (_listTab === 'words' || _listTab === 'kps')) {
    var gradeOpts = typeof GRADE_OPTIONS !== 'undefined' ? GRADE_OPTIONS.map(function(g) { return { value: g.value, label: g.emoji + ' ' + (zh ? g.nameZh : g.name) }; }) : [];
    html += _renderMultiDrop('grade', (zh ? '\u5e74\u7ea7' : 'Grade'), gradeOpts, f.grade);
    if (_listTab === 'words') {
      var unitOpts = _collectUnits(f.grade);
      html += _renderMultiDrop('unit', (zh ? '\u5355\u5143' : 'Unit'), unitOpts, f.unit);
    }
  }

  /* Section filter (CIE/EDX always; 25m on KPs tab for hhk sections) */
  if (hasCieEdx || (has25m && _listTab === 'kps')) {
    var secOpts = _collectSections();
    html += _renderMultiDrop('section', (zh ? '\u7ae0\u8282' : 'Section'), secOpts, f.section);
  }

  /* CIE/EDX: Year/Season/Paper (for PPs tab only) */
  if (hasCieEdx && _listTab === 'pps') {
    var yearOpts = _collectYears(f.board);
    html += _renderMultiDrop('year', (zh ? '\u5e74\u4efd' : 'Year'), yearOpts, f.year);
    var seasonOpts = _collectSeasons(f.board);
    html += _renderMultiDrop('season', (zh ? '\u8003\u5b63' : 'Season'), seasonOpts, f.season);
    var paperOpts = _collectPapers(f.board);
    html += _renderMultiDrop('paper', (zh ? '\u8bd5\u5377' : 'Paper'), paperOpts, f.paper);
  }

  /* ── Level 3: Universal filters ── */
  var statusOpts = [
    { value: 'mastered', label: zh ? '\u5df2\u638c\u63e1' : 'Mastered' },
    { value: 'uncertain', label: zh ? '\u4e0d\u786e\u5b9a' : 'Uncertain' },
    { value: 'learning', label: zh ? '\u5b66\u4e60\u4e2d' : 'Learning' },
    { value: 'new', label: zh ? '\u65b0' : 'New' }
  ];
  html += _renderMultiDrop('status', (zh ? 'FLM' : 'Status'), statusOpts, f.status);

  var reforgetOpts = [{ value: 1, label: '1+' }, { value: 2, label: '2+' }, { value: 3, label: '3+' }];
  html += _renderMultiDrop('reforget', (zh ? '\u9057\u5fd8' : 'Re-forget'), reforgetOpts, f.reforget);

  /* Search */
  html += '<input type="text" class="list-search" id="lf-search" placeholder="' + (zh ? '\u641c\u7d22...' : 'Search...') + '" value="' + _escList(f.search || '') + '">';

  /* Reset button */
  html += '<button class="btn btn-sm lf-reset-btn" id="lf-reset" type="button" title="' + (zh ? '\u91cd\u7f6e\u7b5b\u9009' : 'Reset filters') + '">\u2715 ' + (zh ? '\u91cd\u7f6e' : 'Reset') + '</button>';

  html += '</div>';
  return html;
}

function _bindListFilters(el) {
  /* Board chips */
  el.querySelectorAll('.lf-board-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var bid = chip.dataset.board;
      var idx = _listFilters.board.indexOf(bid);
      if (idx === -1) _listFilters.board.push(bid);
      else _listFilters.board.splice(idx, 1);
      /* Cascade: clear irrelevant sub-filters */
      _cascadeBoardChange();
      _listPage = 0;
      _listRawCache = null;
      renderListView();
    });
  });

  /* Multi-drop toggle + checkbox change */
  el.querySelectorAll('.lf-drop').forEach(function(drop) {
    var btn = drop.querySelector('.lf-drop-btn');
    var menu = drop.querySelector('.lf-drop-menu');
    if (btn && menu) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        /* Close all other menus first */
        el.querySelectorAll('.lf-drop-menu.open').forEach(function(m) { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
      });
    }
    var dropId = drop.id.replace('lf-drop-', '');
    drop.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function(e) {
        e.stopPropagation();
        _updateDropFilter(dropId, cb.value, cb.checked);
      });
    });
  });

  /* Click outside → close all dropdowns (remove old listener first to avoid leaks) */
  document.removeEventListener('click', _closeAllDropdowns);
  document.addEventListener('click', _closeAllDropdowns);

  /* Search */
  var searchInput = el.querySelector('#lf-search');
  if (searchInput) {
    var _searchTimer = null;
    searchInput.addEventListener('input', function() {
      _listFilters.search = this.value;
      _listPage = 0;
      clearTimeout(_searchTimer);
      _searchTimer = setTimeout(_renderListTable, 250);
    });
  }

  /* Reset button */
  var resetBtn = el.querySelector('#lf-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      _listFilters = { board: [], grade: [], unit: [], year: [], season: [], paper: [], section: [], status: [], reforget: [], search: '' };
      _listPage = 0;
      _listRawCache = null;
      renderListView();
    });
  }
}

function _closeAllDropdowns() {
  document.querySelectorAll('.lf-drop-menu.open').forEach(function(m) { m.classList.remove('open'); });
}

function _updateDropFilter(key, value, checked) {
  var arr = _listFilters[key];
  if (!arr) return;
  /* Coerce number types */
  if (key === 'year' || key === 'reforget' || key === 'paper') value = parseInt(value) || value;
  if (checked) {
    if (arr.indexOf(value) === -1) arr.push(value);
  } else {
    var idx = arr.indexOf(value);
    if (idx !== -1) arr.splice(idx, 1);
  }
  /* Cascade for grade → unit */
  if (key === 'grade') {
    var validUnits = _collectUnits(_listFilters.grade);
    var validVals = validUnits.map(function(u) { return u.value; });
    _listFilters.unit = _listFilters.unit.filter(function(u) { return validVals.indexOf(u) !== -1; });
    /* Grade change requires full re-render to update unit dropdown options */
    _listPage = 0;
    _listRawCache = null;
    renderListView();
    return;
  }
  /* Update button text to reflect new count */
  _refreshDropBtn(key);
  _listPage = 0;
  _renderListTable();
}

function _refreshDropBtn(key) {
  var drop = document.getElementById('lf-drop-' + key);
  if (!drop) return;
  var btn = drop.querySelector('.lf-drop-btn');
  if (!btn) return;
  var arr = _listFilters[key] || [];
  var zh = (appLang !== 'en');
  var labels = {
    grade: zh ? '\u5e74\u7ea7' : 'Grade', unit: zh ? '\u5355\u5143' : 'Unit',
    section: zh ? '\u7ae0\u8282' : 'Section', year: zh ? '\u5e74\u4efd' : 'Year',
    season: zh ? '\u8003\u5b63' : 'Season', paper: zh ? '\u8bd5\u5377' : 'Paper',
    status: zh ? 'FLM' : 'Status', reforget: zh ? '\u9057\u5fd8' : 'Re-forget'
  };
  var base = labels[key] || key;
  btn.textContent = arr.length > 0 ? base + ' (' + arr.length + ') \u25be' : base + ' \u25be';
  if (arr.length > 0) btn.classList.add('has-selection');
  else btn.classList.remove('has-selection');
}

function _cascadeBoardChange() {
  var f = _listFilters;
  var has25m = f.board.indexOf('25m') !== -1 || f.board.length === 0;
  var hasCieEdx = f.board.indexOf('cie') !== -1 || f.board.indexOf('edx') !== -1 || f.board.length === 0;
  if (!has25m) { f.grade = []; f.unit = []; }
  if (!hasCieEdx) { f.section = []; f.year = []; f.season = []; f.paper = []; }
}

/* ═══ DATA SOURCES ═══ */

function _collectSections() {
  /* Collect sections from BOARD_SYLLABUS, filtered by selected boards, grouped by chapter */
  var seen = {};
  var result = [];
  var fb = _listFilters.board;
  var targetBoards = [];
  if (fb.length === 0) { targetBoards = ['cie', 'edx', 'hhk']; }
  else {
    if (fb.indexOf('cie') !== -1) targetBoards.push('cie');
    if (fb.indexOf('edx') !== -1) targetBoards.push('edx');
    if (fb.indexOf('25m') !== -1) targetBoards.push('hhk');
  }
  for (var bi = 0; bi < targetBoards.length; bi++) {
    var b = targetBoards[bi];
    var syl = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[b] : null;
    if (!syl || !syl.chapters) continue;
    for (var ci = 0; ci < syl.chapters.length; ci++) {
      var chTitle = syl.chapters[ci].title || syl.chapters[ci].name || '';
      var secs = syl.chapters[ci].sections || [];
      for (var si = 0; si < secs.length; si++) {
        var sid = secs[si].id;
        if (sid && !seen[sid]) {
          seen[sid] = true;
          result.push({ value: sid, label: sid + (secs[si].title ? ' ' + secs[si].title : ''), group: chTitle });
        }
      }
    }
  }
  return result;
}

function _collectUnits(grades) {
  /* Collect 25m unit slugs from LEVELS, filtered by selected grades */
  if (typeof LEVELS === 'undefined') return [];
  var result = [];
  var seen = {};
  for (var i = 0; i < LEVELS.length; i++) {
    var lv = LEVELS[i];
    if (lv.board !== '25m') continue;
    if (grades.length > 0 && grades.indexOf(lv.category) === -1) continue;
    var slug = lv.slug || '';
    if (slug && !seen[slug]) {
      seen[slug] = true;
      var label = lv.unitTitle || lv.title || slug;
      result.push({ value: slug, label: label });
    }
  }
  return result;
}

function _collectYears(boardArr) {
  var seen = {};
  var result = [];
  var targets = _ppTargetBoards(boardArr);
  for (var bi = 0; bi < targets.length; bi++) {
    var ppB = (typeof _ppData !== 'undefined') ? _ppData[targets[bi]] : null;
    if (!ppB || !ppB.questions) continue;
    for (var qi = 0; qi < ppB.questions.length; qi++) {
      var y = ppB.questions[qi].year;
      if (y && !seen[y]) { seen[y] = true; result.push(y); }
    }
  }
  result.sort(function(a, b) { return b - a; });
  return result;
}

function _collectSeasons(boardArr) {
  var seen = {};
  var result = [];
  var targets = _ppTargetBoards(boardArr);
  for (var bi = 0; bi < targets.length; bi++) {
    var ppB = (typeof _ppData !== 'undefined') ? _ppData[targets[bi]] : null;
    if (!ppB || !ppB.questions) continue;
    for (var qi = 0; qi < ppB.questions.length; qi++) {
      var s = ppB.questions[qi].session;
      if (s && !seen[s]) { seen[s] = true; result.push(s); }
    }
  }
  return result;
}

function _collectPapers(boardArr) {
  var seen = {};
  var result = [];
  var targets = _ppTargetBoards(boardArr);
  for (var bi = 0; bi < targets.length; bi++) {
    var ppB = (typeof _ppData !== 'undefined') ? _ppData[targets[bi]] : null;
    if (!ppB || !ppB.questions) continue;
    for (var qi = 0; qi < ppB.questions.length; qi++) {
      var p = ppB.questions[qi].paper;
      /* Extract paper number from e.g. "2025March-Paper12" → "12" */
      if (p) {
        var m = p.match(/Paper(\d+)/);
        var pNum = m ? parseInt(m[1]) : p;
        if (!seen[pNum]) { seen[pNum] = true; result.push(pNum); }
      }
    }
  }
  result.sort(function(a, b) { return a - b; });
  return result;
}

function _ppTargetBoards(boardArr) {
  if (!boardArr || boardArr.length === 0) return ['cie', 'edx'];
  var r = [];
  if (boardArr.indexOf('cie') !== -1) r.push('cie');
  if (boardArr.indexOf('edx') !== -1) r.push('edx');
  return r.length > 0 ? r : ['cie', 'edx'];
}

function _getFilteredWords() {
  var all = typeof getAllWords === 'function' ? getAllWords() : [];
  var items = [];
  for (var i = 0; i < all.length; i++) {
    var w = all[i];
    var lvObj = (typeof LEVELS !== 'undefined' && w.level >= 0 && w.level < LEVELS.length) ? LEVELS[w.level] : null;
    items.push({
      _type: 'vocab', _ref: w.key, _id: 'vocab:' + w.key,
      _board: lvObj ? (lvObj.board || '') : '',
      _category: lvObj ? (lvObj.category || '') : '',
      word: w.word || '', def: w.def || '', fs: w.fs || 'new',
      section: lvObj ? (lvObj.slug || '') : '', lr: w.lr || null, rc: w.rc || 0,
      reforget: typeof getReforgetCount === 'function' ? getReforgetCount(w.key) : 0
    });
  }
  return items;
}

function _getFilteredKPs() {
  var items = [];
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  for (var bi = 0; bi < boards.length; bi++) {
    var board = boards[bi].id || boards[bi];
    /* Map 25m → hhk for syllabus/kpData lookup */
    var sylKey = board === '25m' ? 'hhk' : board;
    var syllabus = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[sylKey] : null;
    if (!syllabus || !syllabus.chapters) continue;
    for (var ci = 0; ci < syllabus.chapters.length; ci++) {
      var ch = syllabus.chapters[ci];
      if (!ch.sections) continue;
      for (var si = 0; si < ch.sections.length; si++) {
        var sec = ch.sections[si];
        /* Get KP data for this section if available */
        var kpList = _getKPsForSection(sec.id, sylKey);
        for (var ki = 0; ki < kpList.length; ki++) {
          var kp = kpList[ki];
          var kpResult = typeof getKPResult === 'function' ? getKPResult(kp.id) : null;
          items.push({
            _type: 'kp', _ref: kp.id, _id: 'kp:' + kp.id, _board: board,
            _category: board === '25m' ? (sec.id.match(/^(Y\d+)/) ? sec.id.match(/^(Y\d+)/)[1].toLowerCase().replace('y', '25m-y') : '') : '',
            word: kp.id, def: kp.title || '', defZh: kp.title_zh || '',
            fs: kpResult ? (kpResult.fs || 'new') : 'new',
            section: sec.id, lr: kpResult ? (kpResult.lr || kpResult.t || null) : null,
            rc: kpResult ? (kpResult.rc || 0) : 0,
            reforget: typeof getReforgetCount === 'function' ? getReforgetCount(kp.id) : 0,
            score: kpResult ? (kpResult.score || 0) : 0,
            total: kpResult ? (kpResult.total || 0) : 0,
            cs: kpResult ? (kpResult.cs || 0) : 0
          });
        }
      }
    }
  }
  return items;
}

function _getKPsForSection(sectionId, board) {
  /* _kpData[board] is a flat array of {id, section, title, title_zh, ...} */
  var pts = (typeof _kpData !== 'undefined') ? (_kpData[board] || []) : [];
  var result = [];
  for (var i = 0; i < pts.length; i++) {
    if (pts[i].section === sectionId) result.push(pts[i]);
  }
  return result;
}

function _getFilteredPPs() {
  var items = [];
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  for (var bi = 0; bi < boards.length; bi++) {
    var board = boards[bi].id || boards[bi];
    if (board !== 'cie' && board !== 'edx') continue;
    var ppBoard = (typeof _ppData !== 'undefined') ? _ppData[board] : null;
    if (!ppBoard || !ppBoard.questions) continue;
    var mastery = typeof _ppGetMastery === 'function' ? _ppGetMastery() : {};
    for (var qi = 0; qi < ppBoard.questions.length; qi++) {
      var q = ppBoard.questions[qi];
      var m = mastery[q.id] || {};
      var paperMatch = (q.paper || '').match(/Paper(\d+)/);
      items.push({
        _type: 'pp', _ref: q.id, _id: 'pp:' + q.id, _board: board,
        word: q.id, def: q.src || '', fs: m.fs || 'new',
        section: q.section || '', lr: m.t || null, rc: m.rc || 0,
        marks: q.marks || 0, _year: q.year || 0, _session: q.session || '',
        _paper: paperMatch ? parseInt(paperMatch[1]) : 0,
        reforget: typeof getReforgetCount === 'function' ? getReforgetCount(q.id) : 0
      });
    }
  }
  return items;
}

/* ═══ FILTER ENGINE ═══ */

function _applyListFilters(items) {
  var f = _listFilters;
  var searchLower = (f.search || '').toLowerCase();
  var result = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var board = item._board || '';

    /* 1. Board filter (empty = all pass) */
    if (f.board.length > 0 && board && f.board.indexOf(board) === -1) continue;

    /* 2. Board-specific filters */
    if (board === '25m') {
      /* Grade filter */
      if (f.grade.length > 0 && f.grade.indexOf(item._category || '') === -1) continue;
      /* Unit filter (vocab) */
      if (f.unit.length > 0 && f.unit.indexOf(item.section || '') === -1) continue;
      /* Section filter (KPs — hhk sections like Y7.1) */
      if (item._type === 'kp' && f.section.length > 0 && f.section.indexOf(item.section || '') === -1) continue;
    } else if (board === 'cie' || board === 'edx') {
      /* Section filter */
      if (f.section.length > 0 && f.section.indexOf(item.section || '') === -1) continue;
      /* Year/Season/Paper (PP items only) */
      if (item._type === 'pp') {
        if (f.year.length > 0 && f.year.indexOf(item._year) === -1) continue;
        if (f.season.length > 0 && f.season.indexOf(item._session) === -1) continue;
        if (f.paper.length > 0 && f.paper.indexOf(item._paper) === -1) continue;
      }
    }

    /* 3. Status filter */
    if (f.status.length > 0 && f.status.indexOf(item.fs || 'new') === -1) continue;

    /* 4. Re-forget filter (min of selected values) */
    if (f.reforget.length > 0) {
      var minRf = Math.min.apply(null, f.reforget);
      if ((item.reforget || 0) < minRf) continue;
    }

    /* 5. Search filter */
    if (searchLower) {
      var haystack = ((item.word || '') + ' ' + (item.def || '') + ' ' + (item.defZh || '') + ' ' + (item.section || '')).toLowerCase();
      if (haystack.indexOf(searchLower) === -1) continue;
    }

    result.push(item);
  }

  return result;
}

/* ═══ SORT ═══ */

function _applyListSort(items) {
  var col = _listSort.col;
  var asc = _listSort.asc;
  var statusOrder = { mastered: 0, uncertain: 1, learning: 2, 'new': 3 };

  items.sort(function(a, b) {
    var va, vb;
    if (col === 'word') { va = (a.word || '').toLowerCase(); vb = (b.word || '').toLowerCase(); }
    else if (col === 'status') { va = statusOrder[a.fs] || 3; vb = statusOrder[b.fs] || 3; }
    else if (col === 'section') { va = a.section || ''; vb = b.section || ''; }
    else if (col === 'lr') { va = a.lr || 0; vb = b.lr || 0; }
    else if (col === 'reforget') { va = a.reforget || 0; vb = b.reforget || 0; }
    else { va = 0; vb = 0; }

    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });
  return items;
}

/* ═══ TABLE RENDERING ═══ */

function _renderListTable() {
  var el = document.getElementById('list-content');
  if (!el) return;
  var zh = (appLang !== 'en');

  /* Get data (cached per tab to avoid rebuilding on sort/page/check) */
  var raw;
  if (_listRawCache && _listRawCache.tab === _listTab) {
    raw = _listRawCache.data;
  } else {
    if (_listTab === 'words') raw = _getFilteredWords();
    else if (_listTab === 'kps') raw = _getFilteredKPs();
    else if (_listTab === 'pps') raw = _getFilteredPPs();
    else raw = [];
    _listRawCache = { tab: _listTab, data: raw };
  }

  /* Empty state for KP/PP when no boards configured */
  if ((_listTab === 'kps' || _listTab === 'pps') && raw.length === 0) {
    var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
    if (boards.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:48px;color:var(--c-text3)">' +
        (zh ? '\u8bf7\u5148\u9009\u62e9\u8003\u8bd5\u5c40/\u8bfe\u7a0b\u4ee5\u67e5\u770b' + (_listTab === 'kps' ? '\u77e5\u8bc6\u70b9' : '\u771f\u9898') : 'Please select a board/course to view ' + (_listTab === 'kps' ? 'knowledge points' : 'past papers')) +
        '</div>';
      return;
    }
  }

  var filtered = _applyListFilters(raw);
  _listData = _applyListSort(filtered);

  /* Stats bar */
  var selCount = Object.keys(_listSelected).length;
  var html = '<div class="list-stats">';
  html += (zh ? '\u663e\u793a ' : 'Showing ') + _listData.length + (zh ? ' / ' : ' of ') + raw.length + (zh ? ' \u9879' : ' items');
  if (selCount > 0) html += ' &middot; ' + selCount + (zh ? ' \u5df2\u9009' : ' selected');
  html += '</div>';

  /* Bulk action bar */
  if (selCount > 0) {
    html += '<div class="list-bulk-bar">';
    html += '<button class="btn btn-sm btn-primary" id="list-add-to-list">' + (zh ? '+ \u52a0\u5165\u6e05\u5355' : '+ Add to List') + '</button>';
    html += '<button class="btn btn-sm btn-ghost" id="list-export-csv">' + (zh ? '\u5bfc\u51fa CSV' : 'Export CSV') + '</button>';
    html += '<button class="btn btn-sm btn-ghost" id="list-print-sel">' + (zh ? '\u6253\u5370' : 'Print') + '</button>';
    html += '</div>';
  }

  /* Table */
  html += '<div class="list-table-wrap"><table class="list-table"><thead><tr>';
  html += '<th style="width:32px"><input type="checkbox" id="list-check-all" aria-label="' + (zh ? '\u5168\u9009' : 'Select all') + '"></th>';

  var cols;
  if (_listTab === 'words') {
    cols = [
      { id: 'word', en: 'Word', zh: '\u8bcd\u6c47' },
      { id: 'def', en: 'Definition', zh: '\u5b9a\u4e49', nosort: true },
      { id: 'status', en: 'Status', zh: '\u72b6\u6001' },
      { id: 'lr', en: 'Last Reviewed', zh: '\u4e0a\u6b21\u590d\u4e60' },
      { id: 'reforget', en: 'Re-forget', zh: '\u9057\u5fd8' }
    ];
  } else if (_listTab === 'kps') {
    cols = [
      { id: 'word', en: 'KP ID', zh: '\u77e5\u8bc6\u70b9' },
      { id: 'def', en: 'Title', zh: '\u6807\u9898', nosort: true },
      { id: 'status', en: 'Status', zh: '\u72b6\u6001' },
      { id: 'section', en: 'Section', zh: '\u5c0f\u4e13\u9898' },
      { id: 'reforget', en: 'Re-forget', zh: '\u9057\u5fd8' }
    ];
  } else {
    cols = [
      { id: 'word', en: 'Q ID', zh: '\u9898\u53f7' },
      { id: 'def', en: 'Source', zh: '\u6765\u6e90', nosort: true },
      { id: 'status', en: 'Status', zh: '\u72b6\u6001' },
      { id: 'section', en: 'Section', zh: '\u5c0f\u4e13\u9898' },
      { id: 'reforget', en: 'Re-forget', zh: '\u9057\u5fd8' }
    ];
  }

  for (var ci = 0; ci < cols.length; ci++) {
    var sortIcon = '';
    var ariaSort = '';
    if (!cols[ci].nosort && _listSort.col === cols[ci].id) {
      sortIcon = _listSort.asc ? ' \u25b2' : ' \u25bc';
      ariaSort = ' aria-sort="' + (_listSort.asc ? 'ascending' : 'descending') + '"';
    }
    html += '<th data-sortcol="' + cols[ci].id + '"' + (cols[ci].nosort ? '' : ' class="list-th-sort"') + ariaSort + '>';
    html += (zh ? cols[ci].zh : cols[ci].en) + sortIcon + '</th>';
  }
  html += '</tr></thead><tbody>';

  /* Paginated rows */
  var start = _listPage * _listPageSize;
  var end = Math.min(start + _listPageSize, _listData.length);
  for (var ri = start; ri < end; ri++) {
    var item = _listData[ri];
    var sel = _listSelected[item._id] ? true : false;
    html += '<tr class="list-row' + (sel ? ' list-row-selected' : '') + '" data-listid="' + item._id + '">';
    html += '<td><input type="checkbox" class="list-row-check" aria-label="' + _escList(item.word) + '"' + (sel ? ' checked' : '') + '></td>';
    html += '<td>' + _escList(item.word) + '</td>';
    html += '<td>' + _escList(item.def) + (item.defZh ? ' <span style="color:var(--c-text3)">' + _escList(item.defZh) + '</span>' : '') + '</td>';
    html += '<td>' + _fsChip(item.fs) + '</td>';
    if (_listTab === 'words') {
      html += '<td>' + (item.lr ? new Date(item.lr).toLocaleDateString() : '-') + '</td>';
    } else {
      html += '<td>' + _escList(item.section || '') + '</td>';
    }
    html += '<td>' + (item.reforget > 0 ? '<span class="reforget-badge">' + item.reforget + '\u00d7</span>' : '-') + '</td>';
    html += '</tr>';
  }

  if (_listData.length === 0) {
    html += '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--c-text3)">';
    html += (zh ? '\u6ca1\u6709\u5339\u914d\u7684\u9879\u76ee' : 'No matching items');
    html += '</td></tr>';
  }

  html += '</tbody></table></div>';

  /* Pagination */
  if (_listData.length > 0) {
    var totalPages = Math.ceil(_listData.length / _listPageSize);
    html += '<div class="list-pagination" style="align-items:center;justify-content:center">';
    if (totalPages > 1) {
      html += '<button class="btn btn-sm btn-ghost" data-listpage="' + (_listPage - 1) + '"' + (_listPage === 0 ? ' disabled' : '') + '>\u2039 ' + (zh ? '\u4e0a\u4e00\u9875' : 'Prev') + '</button>';
      html += '<span style="padding:0 10px;font-size:13px;color:var(--c-text2)">' + (zh ? '\u7b2c ' : '') + (_listPage + 1) + ' / ' + totalPages + (zh ? ' \u9875' : '') + '</span>';
      html += '<button class="btn btn-sm btn-ghost" data-listpage="' + (_listPage + 1) + '"' + (_listPage >= totalPages - 1 ? ' disabled' : '') + '>' + (zh ? '\u4e0b\u4e00\u9875' : 'Next') + ' \u203a</button>';
      html += '<span style="padding:0 8px;color:var(--c-border)">|</span>';
    }
    html += '<span style="font-size:12px;color:var(--c-text3)">' + (zh ? '\u6bcf\u9875' : 'Per page') + ':</span>';
    html += '<button class="btn btn-sm' + (_listPageSize === 20 ? ' btn-primary' : ' btn-ghost') + '" data-listpagesize="20">20</button>';
    html += '<button class="btn btn-sm' + (_listPageSize === 50 ? ' btn-primary' : ' btn-ghost') + '" data-listpagesize="50">50</button>';
    html += '</div>';
  }

  el.innerHTML = html;

  /* Bind events */
  _bindListTableEvents(el);
}

function _bindListTableEvents(el) {
  /* Check all */
  var checkAll = el.querySelector('#list-check-all');
  if (checkAll) {
    checkAll.addEventListener('change', function() {
      var checked = this.checked;
      var start = _listPage * _listPageSize;
      var end = Math.min(start + _listPageSize, _listData.length);
      for (var i = start; i < end; i++) {
        if (checked) _listSelected[_listData[i]._id] = true;
        else delete _listSelected[_listData[i]._id];
      }
      _renderListTable();
    });
  }

  /* Row checkboxes */
  el.querySelectorAll('.list-row-check').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var row = cb.closest('.list-row');
      if (!row) return;
      var id = row.dataset.listid;
      if (cb.checked) _listSelected[id] = true;
      else delete _listSelected[id];
      _renderListTable();
    });
  });

  /* Sort headers */
  el.querySelectorAll('.list-th-sort').forEach(function(th) {
    th.addEventListener('click', function() {
      var col = th.dataset.sortcol;
      if (_listSort.col === col) _listSort.asc = !_listSort.asc;
      else { _listSort.col = col; _listSort.asc = true; }
      _renderListTable();
    });
  });

  /* Pagination */
  el.querySelectorAll('[data-listpage]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _listPage = parseInt(btn.dataset.listpage) || 0;
      _renderListTable();
    });
  });
  el.querySelectorAll('[data-listpagesize]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _listPageSize = parseInt(btn.dataset.listpagesize) || 20;
      _listPage = 0;
      try { localStorage.setItem('list_pagesize', String(_listPageSize)); } catch(e) {}
      _renderListTable();
    });
  });

  /* Bulk actions */
  var addBtn = el.querySelector('#list-add-to-list');
  if (addBtn) addBtn.addEventListener('click', _showAddToListModal);

  var csvBtn = el.querySelector('#list-export-csv');
  if (csvBtn) csvBtn.addEventListener('click', _exportSelectedCSV);

  var printBtn = el.querySelector('#list-print-sel');
  if (printBtn) printBtn.addEventListener('click', _printSelectedItems);
}

/* ═══ HELPERS ═══ */

function _detectItemBoard(type, ref) {
  var bds = ['cie', 'edx'];
  if (type === 'kp' && typeof _kpData !== 'undefined') {
    for (var i = 0; i < bds.length; i++) {
      var pts = _kpData[bds[i]] || [];
      for (var j = 0; j < pts.length; j++) { if (pts[j].id === ref) return bds[i]; }
    }
  }
  if (type === 'pp' && typeof _ppData !== 'undefined') {
    for (var i2 = 0; i2 < bds.length; i2++) {
      var ppB = _ppData[bds[i2]];
      if (ppB && ppB.questions) {
        for (var j2 = 0; j2 < ppB.questions.length; j2++) { if (ppB.questions[j2].id === ref) return bds[i2]; }
      }
    }
  }
  return 'cie';
}

function _showListHelp() {
  var zh = (appLang !== 'en');
  var html = '<div style="padding:20px;max-width:520px;font-size:14px;line-height:1.7">';

  html += '<h3 style="margin:0 0 12px;font-size:17px">' + (zh ? '\ud83d\udcd6 \u5b66\u4e60\u9879\u76ee\u4f7f\u7528\u8bf4\u660e' : '\ud83d\udcd6 Learning Items Guide') + '</h3>';

  /* Tabs */
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-weight:700;margin-bottom:4px">' + (zh ? '\u56db\u4e2a Tab \u5206\u9875' : 'Four Tabs') + '</div>';
  if (zh) {
    html += '<div>\u2022 <b>\u8bcd\u6c47</b> \u2014 \u5168\u90e8\u82f1\u6587\u6570\u5b66\u672f\u8bed\uff0c\u53ef\u6309\u72b6\u6001/\u7ae0\u8282/\u9057\u5fd8\u7b5b\u9009</div>';
    html += '<div>\u2022 <b>\u77e5\u8bc6\u70b9</b> \u2014 CIE/Edexcel \u8003\u7eb2\u77e5\u8bc6\u70b9\uff0c\u53ef\u6309\u8003\u8bd5\u5c40/\u4e13\u9898\u7b5b\u9009</div>';
    html += '<div>\u2022 <b>\u771f\u9898</b> \u2014 \u5386\u5e74\u771f\u9898\uff0c\u53ef\u6309\u5206\u503c/\u72b6\u6001/\u4e13\u9898\u7b5b\u9009</div>';
    html += '<div>\u2022 <b>\u6211\u7684\u6e05\u5355</b> \u2014 \u81ea\u5b9a\u4e49\u5b66\u4e60\u6e05\u5355\uff0c\u652f\u6301\u5206\u7c7b\u5b66\u4e60\u548c\u6253\u5370</div>';
  } else {
    html += '<div>\u2022 <b>Words</b> \u2014 All math vocabulary, filter by status/section/re-forget</div>';
    html += '<div>\u2022 <b>Knowledge Points</b> \u2014 CIE/Edexcel syllabus KPs, filter by board/section</div>';
    html += '<div>\u2022 <b>Past Papers</b> \u2014 Real exam questions, filter by marks/status/topic</div>';
    html += '<div>\u2022 <b>My Lists</b> \u2014 Custom study lists with focused learning & print</div>';
  }
  html += '</div>';

  /* FLM Status */
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-weight:700;margin-bottom:4px">' + (zh ? 'FLM \u56db\u6001\u7b5b\u9009\u5faa\u73af' : 'FLM Status Cycle') + '</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:13px">';
  html += '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:4px 8px"><span style="color:#5248C9;font-weight:700">L</span></td>';
  html += '<td style="padding:4px"><b>' + (zh ? '\u5b66\u4e60\u4e2d Learning' : 'Learning') + '</b></td>';
  html += '<td style="padding:4px;color:#666">' + (zh ? '\u521a\u5f00\u59cb\u63a5\u89e6\uff0c\u9700\u8981\u53cd\u590d\u7ec3\u4e60' : 'Just started, needs repeated practice') + '</td></tr>';
  html += '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:4px 8px"><span style="color:#D97706;font-weight:700">U</span></td>';
  html += '<td style="padding:4px"><b>' + (zh ? '\u4e0d\u786e\u5b9a Uncertain' : 'Uncertain') + '</b></td>';
  html += '<td style="padding:4px;color:#666">' + (zh ? '\u6709\u65f6\u5bf9\u6709\u65f6\u9519\uff0c\u8fd8\u4e0d\u7a33\u5b9a' : 'Sometimes right, sometimes wrong') + '</td></tr>';
  html += '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:4px 8px"><span style="color:#059669;font-weight:700">M</span></td>';
  html += '<td style="padding:4px"><b>' + (zh ? '\u5df2\u638c\u63e1 Mastered' : 'Mastered') + '</b></td>';
  html += '<td style="padding:4px;color:#666">' + (zh ? '\u8fde\u7eed\u6b63\u786e\uff0c\u771f\u6b63\u5b66\u4f1a\u4e86' : 'Consistently correct, truly learned') + '</td></tr>';
  html += '<tr><td style="padding:4px 8px"><span style="color:#9CA3AF;font-weight:700">N</span></td>';
  html += '<td style="padding:4px"><b>' + (zh ? '\u65b0 New' : 'New') + '</b></td>';
  html += '<td style="padding:4px;color:#666">' + (zh ? '\u8fd8\u672a\u5b66\u4e60\u8fc7' : 'Not yet studied') + '</td></tr>';
  html += '</table>';
  if (zh) {
    html += '<div style="margin-top:6px;font-size:12px;color:#888">\u5faa\u73af\u8def\u5f84\uff1aN \u2192 L \u2192 U \u2192 M\uff0c\u5df2\u638c\u63e1\u7684\u9879\u76ee\u4f1a\u5b9a\u671f\u590d\u67e5\uff0c\u9057\u5fd8\u65f6\u81ea\u52a8\u56de\u6d41\u5230 U</div>';
  } else {
    html += '<div style="margin-top:6px;font-size:12px;color:#888">Cycle: N \u2192 L \u2192 U \u2192 M. Mastered items are periodically reviewed; if forgotten, they flow back to U.</div>';
  }
  html += '</div>';

  /* Re-forget */
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-weight:700;margin-bottom:4px">' + (zh ? '\u9057\u5fd8\u6b21\u6570 (Re-forget)' : 'Re-forget Count') + '</div>';
  if (zh) {
    html += '<div style="font-size:13px;color:#666">\u8bb0\u5f55\u5df2\u638c\u63e1\u540e\u53c8\u9057\u5fd8\u7684\u6b21\u6570\u3002\u6b21\u6570\u8d8a\u591a\uff0c\u8bf4\u660e\u8fd9\u4e2a\u77e5\u8bc6\u70b9\u662f\u4f60\u7684\u201c\u987a\u56fa\u96be\u70b9\u201d\uff0c\u9700\u8981\u91cd\u70b9\u653b\u514b\u3002\u6253\u5370\u65f6\u4f1a\u81ea\u52a8\u628a\u9057\u5fd8\u6b21\u6570\u591a\u7684\u6392\u5728\u524d\u9762\u3002</div>';
  } else {
    html += '<div style="font-size:13px;color:#666">Tracks how many times a mastered item was forgotten. Higher count = stubborn weak spot. Printed lists auto-sort these to the top.</div>';
  }
  html += '</div>';

  /* Actions */
  html += '<div style="margin-bottom:14px">';
  html += '<div style="font-weight:700;margin-bottom:4px">' + (zh ? '\u64cd\u4f5c\u6309\u94ae' : 'Actions') + '</div>';
  if (zh) {
    html += '<div>\u2022 <b>\u2610 \u52fe\u9009</b> \u2014 \u52fe\u9009\u591a\u4e2a\u9879\u76ee\u540e\u51fa\u73b0\u64cd\u4f5c\u680f</div>';
    html += '<div>\u2022 <b>+ \u52a0\u5165\u6e05\u5355</b> \u2014 \u52fe\u9009\u9879\u52a0\u5165\u81ea\u5b9a\u4e49\u6e05\u5355\uff0c\u6df7\u5408\u7c7b\u578b\u81ea\u52a8\u62c6\u5206\u4e3a\u8bcd\u6c47/\u77e5\u8bc6\u70b9/\u771f\u9898\u72ec\u7acb\u6e05\u5355</div>';
    html += '<div>\u2022 <b>\u5bfc\u51fa CSV</b> \u2014 \u5c06\u52fe\u9009\u9879\u5bfc\u51fa\u4e3a\u8868\u683c\u6587\u4ef6</div>';
    html += '<div>\u2022 <b>\u6253\u5370</b> \u2014 \u751f\u6210 A4 \u6253\u5370\u9875\uff0c\u81ea\u52a8\u6309\u91cd\u5237\u6b21\u6570\u6392\u5e8f\uff0c\u590d\u6742\u9879\u6392\u6700\u524d</div>';
  } else {
    html += '<div>\u2022 <b>\u2610 Select</b> \u2014 Check items to reveal the action bar</div>';
    html += '<div>\u2022 <b>+ Add to List</b> \u2014 Add to a custom list; mixed types auto-split into separate lists</div>';
    html += '<div>\u2022 <b>Export CSV</b> \u2014 Download selected items as a spreadsheet</div>';
    html += '<div>\u2022 <b>Print</b> \u2014 Generate A4 printable, auto-sorted by re-forget count</div>';
  }
  html += '</div>';

  /* My Lists */
  html += '<div>';
  html += '<div style="font-weight:700;margin-bottom:4px">' + (zh ? '\u6211\u7684\u6e05\u5355' : 'My Lists') + '</div>';
  if (zh) {
    html += '<div style="font-size:13px;color:#666">\u6e05\u5355\u662f\u4f60\u7684\u4e13\u5c5e\u5b66\u4e60\u8ba1\u5212\u3002\u521b\u5efa\u6e05\u5355 \u2192 \u52fe\u9009\u52a0\u5165 \u2192 \u5f00\u59cb\u5b66\u4e60/\u5feb\u901f Scan\u3002\u6bcf\u6b21\u5b66\u4e60\u8bb0\u5f55\u4f1a\u4fdd\u7559\uff0c\u5e2e\u4f60\u8ffd\u8e2a\u8fdb\u5ea6\u3002</div>';
  } else {
    html += '<div style="font-size:13px;color:#666">Lists are your personal study plans. Create \u2192 Add items \u2192 Study/Quick Scan. Session history is saved to track your progress.</div>';
  }
  html += '</div>';

  html += '</div>';
  if (typeof showModal === 'function') showModal(html);
}

function _escList(s) {
  if (!s) return '';
  return typeof escapeHtml === 'function' ? escapeHtml(s) : s;
}

function _fsChip(fs) {
  var colors = {
    mastered: 'background:var(--c-success-bg,#D1FAE5);color:var(--c-success,#059669)',
    uncertain: 'background:var(--c-warning-bg,#FEF3C7);color:var(--c-warning,#D97706)',
    learning: 'background:var(--c-primary-bg,#EDEDFF);color:var(--c-primary,#5248C9)',
    'new': 'background:var(--c-surface-alt,#F3F4F6);color:var(--c-text3,#9CA3AF)'
  };
  var labels = { mastered: '\u2705', uncertain: '\ud83d\udfe1', learning: '\ud83d\udfe3', 'new': '\u26aa' };
  var style = colors[fs] || colors['new'];
  return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;' + style + '">' + (labels[fs] || '\u26aa') + ' ' + fs + '</span>';
}

/* ═══ ADD TO LIST MODAL ═══ */

function _showAddToListModal() {
  var zh = (appLang !== 'en');
  var lists = typeof getCustomLists === 'function' ? getCustomLists() : [];
  var html = '<div style="padding:16px">';
  html += '<h3>' + (zh ? '\u52a0\u5165\u6e05\u5355' : 'Add to List') + '</h3>';

  if (lists.length > 0) {
    html += '<div style="margin:12px 0">';
    for (var i = 0; i < lists.length; i++) {
      html += '<button class="btn btn-sm btn-ghost" style="margin:4px" data-addlist="' + _escList(lists[i].id) + '">' + _escList(lists[i].title) + ' (' + lists[i].items.length + ')</button>';
    }
    html += '</div>';
    html += '<div class="sf-divider" style="margin:8px 0"></div>';
  }

  html += '<div style="display:flex;gap:8px;align-items:center">';
  html += '<input type="text" id="new-list-title" class="auth-input" style="flex:1" placeholder="' + (zh ? '\u65b0\u6e05\u5355\u540d\u79f0...' : 'New list name...') + '">';
  html += '<button class="btn btn-sm btn-primary" id="create-and-add">' + (zh ? '\u521b\u5efa' : 'Create') + '</button>';
  html += '</div>';
  html += '</div>';

  if (typeof showModal === 'function') showModal(html);

  /* Bind existing list buttons */
  var _modalRetry = 0;
  setTimeout(function _bindModal() {
    var card = document.getElementById('modal-card');
    if (!card) { if (++_modalRetry < 5) setTimeout(_bindModal, 100); return; }
    card.querySelectorAll('[data-addlist]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        _doAddSelectedToList(btn.dataset.addlist, btn.textContent.replace(/\s*\(\d+\)\s*$/, '').trim());
        if (typeof hideModal === 'function') hideModal();
      });
    });
    var createBtn = card.querySelector('#create-and-add');
    if (createBtn) {
      createBtn.addEventListener('click', function() {
        var title = (card.querySelector('#new-list-title') || {}).value || 'Untitled';
        var newList = createCustomList(title);
        _doAddSelectedToList(newList.id, title);
        if (typeof hideModal === 'function') hideModal();
      });
    }
  }, 150);
}

function _doAddSelectedToList(listId, listTitle) {
  var items = [];
  var keys = Object.keys(_listSelected);
  for (var i = 0; i < keys.length; i++) {
    var parts = keys[i].split(':');
    if (parts.length >= 2) {
      items.push({ type: parts[0], ref: parts.slice(1).join(':') });
    }
  }
  if (items.length === 0) return;
  if (typeof addItemsToList !== 'function' || typeof createCustomList !== 'function') return;

  var zh = (appLang !== 'en');

  /* Group by type */
  var groups = {};
  for (var gi = 0; gi < items.length; gi++) {
    var t = items[gi].type;
    if (!groups[t]) groups[t] = [];
    groups[t].push(items[gi]);
  }
  var typeKeys = Object.keys(groups);

  if (typeKeys.length <= 1) {
    /* Single type — add directly, no split */
    addItemsToList(listId, items);
    if (typeof showToast === 'function') showToast(zh ? items.length + ' \u9879\u5df2\u52a0\u5165\u6e05\u5355' : items.length + ' items added');
  } else {
    /* Mixed types — auto-split into sub-lists */
    var suffixes = {
      vocab: zh ? ' \u2014 \u8bcd\u6c47' : ' \u2014 Vocab',
      kp:    zh ? ' \u2014 \u77e5\u8bc6\u70b9' : ' \u2014 KP',
      pp:    zh ? ' \u2014 \u771f\u9898' : ' \u2014 PP'
    };
    var baseName = listTitle || '';
    var allLists = typeof getCustomLists === 'function' ? getCustomLists() : [];
    var toastParts = [];

    for (var si = 0; si < typeKeys.length; si++) {
      var typ = typeKeys[si];
      var suffix = suffixes[typ] || (' \u2014 ' + typ);
      var subName = baseName + suffix;
      /* Find existing sub-list with matching name */
      var subListId = null;
      for (var li = 0; li < allLists.length; li++) {
        if (allLists[li].title === subName) { subListId = allLists[li].id; break; }
      }
      if (!subListId) {
        var newSub = createCustomList(subName);
        subListId = newSub.id;
        allLists.push(newSub);
      }
      addItemsToList(subListId, groups[typ]);
      var typLabel = typ === 'vocab' ? (zh ? '\u8bcd\u6c47' : 'Vocab') : typ === 'kp' ? (zh ? '\u77e5\u8bc6\u70b9' : 'KP') : (zh ? '\u771f\u9898' : 'PP');
      toastParts.push(typLabel + '(' + groups[typ].length + ')');
    }

    if (typeof showToast === 'function') {
      showToast((zh ? '\u5df2\u62c6\u5206\u4e3a ' + typeKeys.length + ' \u4e2a\u6e05\u5355\uff1a' : 'Split into ' + typeKeys.length + ' lists: ') + toastParts.join(' + '));
    }
  }

  _listSelected = {};
  _renderListTable();
}

/* ═══ EXPORT CSV ═══ */

function _exportSelectedCSV() {
  var keys = Object.keys(_listSelected);
  if (keys.length === 0) return;
  var rows = [['Type', 'ID', 'Word/Title', 'Definition', 'Status', 'Section', 'Board', 'Re-forget']];
  for (var i = 0; i < _listData.length; i++) {
    var d = _listData[i];
    if (!_listSelected[d._id]) continue;
    rows.push([d._type, d._ref, d.word || '', d.def || '', d.fs || '', d.section || '', d._board || '', String(d.reforget || 0)]);
  }
  var csv = rows.map(function(r) {
    return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'learning-items-' + new Date().toLocaleDateString('en-CA') + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══ PRINT SELECTED ═══ */

function _printSelectedItems() {
  var items = [];
  for (var i = 0; i < _listData.length; i++) {
    if (_listSelected[_listData[i]._id]) items.push(_listData[i]);
  }
  if (items.length === 0) return;

  if (_listTab === 'words' && typeof printWordList === 'function') {
    printWordList(items);
  } else if (_listTab === 'kps' && typeof printKPList === 'function') {
    printKPList(items);
  } else if (_listTab === 'pps' && typeof printPPList === 'function') {
    printPPList(items);
  }
}

/* ═══ MY LISTS TAB ═══ */

function _renderMyLists() {
  var el = document.getElementById('list-content');
  if (!el) return;
  var zh = (appLang !== 'en');
  var lists = typeof getCustomLists === 'function' ? getCustomLists() : [];

  /* Split into 3 groups */
  var activePlans = [], regularLists = [], hiddenPlans = [];
  for (var g = 0; g < lists.length; g++) {
    if (lists[g].isPlan && lists[g].isHidden) hiddenPlans.push(lists[g]);
    else if (lists[g].isPlan) activePlans.push(lists[g]);
    else regularLists.push(lists[g]);
  }

  var html = '<div style="padding:8px 0">';

  /* Action buttons row */
  html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">';
  html += '<button class="btn btn-primary btn-sm" id="cl-create-plan-btn">';
  html += '+ ' + (zh ? '\u65b0\u5efa\u5b66\u4e60\u8ba1\u5212' : 'Create Learning Plan');
  html += '</button>';
  html += '<button class="btn btn-ghost btn-sm" id="cl-create-btn">';
  html += '+ ' + (zh ? '\u65b0\u5efa\u6e05\u5355' : 'Create New List');
  html += '</button>';
  html += '</div>';

  /* === Section 1: Active Plans === */
  if (activePlans.length > 0) {
    html += '<div class="cl-section-label">' + (zh ? '\u8fdb\u884c\u4e2d\u7684\u8ba1\u5212' : 'Active Plans') + '</div>';
    html += '<div class="cl-grid">';
    for (var pi = 0; pi < activePlans.length; pi++) {
      html += _renderPlanCard(activePlans[pi], zh, false);
    }
    html += '</div>';
  }

  /* === Section 2: Custom Lists === */
  html += '<div class="cl-section-label" style="margin-top:16px">' + (zh ? '\u81ea\u5b9a\u4e49\u6e05\u5355' : 'Custom Lists') + '</div>';
  if (regularLists.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:var(--c-text3)">';
    html += zh ? '\u8fd8\u6ca1\u6709\u81ea\u5b9a\u4e49\u6e05\u5355' : 'No custom lists yet';
    html += '</div>';
  } else {
    html += '<div class="cl-grid">';
    for (var i = 0; i < regularLists.length; i++) {
      html += _renderRegularListCard(regularLists[i], zh);
    }
    html += '</div>';
  }

  /* === Section 3: Hidden Plans === */
  if (hiddenPlans.length > 0) {
    html += '<div class="cl-hidden-section">';
    html += '<div class="cl-section-label cl-hidden-toggle" id="cl-hidden-toggle" style="cursor:pointer;margin-top:16px">';
    html += '<span class="cl-expand-arrow">\u25b6</span> ' + (zh ? '\u5df2\u5b8c\u6210\u8ba1\u5212' : 'Completed Plans') + ' (' + hiddenPlans.length + ')';
    html += '</div>';
    html += '<div class="cl-grid cl-hidden-grid" id="cl-hidden-grid" style="display:none">';
    for (var hi = 0; hi < hiddenPlans.length; hi++) {
      html += _renderPlanCard(hiddenPlans[hi], zh, true);
    }
    html += '</div>';
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;

  /* Bind events */
  var createBtn = el.querySelector('#cl-create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', function() {
      var zh2 = (appLang !== 'en');
      var title = prompt(zh2 ? '\u6e05\u5355\u540d\u79f0:' : 'List name:', '');
      if (title && title.trim()) {
        createCustomList(title.trim());
        _renderMyLists();
      }
    });
  }

  /* Create plan button */
  var createPlanBtn = el.querySelector('#cl-create-plan-btn');
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', function() { _showCreatePlanModal(); });
  }

  /* Hidden plans toggle */
  var hiddenToggle = el.querySelector('#cl-hidden-toggle');
  if (hiddenToggle) {
    hiddenToggle.addEventListener('click', function() {
      var grid = document.getElementById('cl-hidden-grid');
      var arrow = hiddenToggle.querySelector('.cl-expand-arrow');
      if (grid) {
        var show = grid.style.display === 'none';
        grid.style.display = show ? 'grid' : 'none';
        if (arrow) arrow.textContent = show ? '\u25bc' : '\u25b6';
      }
    });
  }

  /* Plan focus study */
  el.querySelectorAll('.cl-plan-focus-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { startPlanFocusStudy(btn.dataset.clid); });
  });

  /* Plan hide/unhide */
  el.querySelectorAll('.cl-plan-hide-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (typeof hideLearningPlan === 'function') hideLearningPlan(btn.dataset.clid);
      _renderMyLists();
    });
  });
  el.querySelectorAll('.cl-plan-unhide-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (typeof unhideLearningPlan === 'function') unhideLearningPlan(btn.dataset.clid);
      _renderMyLists();
    });
  });

  /* Card title click → expand */
  el.querySelectorAll('.cl-card-title').forEach(function(titleEl) {
    titleEl.style.cursor = 'pointer';
    titleEl.addEventListener('click', function() {
      var card = titleEl.closest('.cl-card');
      if (!card) return;
      var itemsEl = card.querySelector('.cl-card-items');
      var arrow = titleEl.querySelector('.cl-expand-arrow');
      if (itemsEl) {
        var show = itemsEl.style.display === 'none';
        itemsEl.style.display = show ? 'block' : 'none';
        if (arrow) arrow.textContent = show ? '\u25bc' : '\u25b6';
      }
    });
  });

  el.querySelectorAll('.cl-study-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { startListStudy(btn.dataset.clid); });
  });

  el.querySelectorAll('.cl-scan-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { startListScan(btn.dataset.clid); });
  });

  el.querySelectorAll('.cl-rename-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var zh2 = (appLang !== 'en');
      var curList = typeof getCustomList === 'function' ? getCustomList(btn.dataset.clid) : null;
      var curName = curList ? curList.title : '';
      var newTitle = prompt(zh2 ? '\u65b0\u540d\u79f0:' : 'New name:', curName);
      if (newTitle && newTitle.trim()) { renameCustomList(btn.dataset.clid, newTitle.trim()); _renderMyLists(); }
    });
  });

  el.querySelectorAll('.cl-delete-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var zh2 = (appLang !== 'en');
      if (confirm(zh2 ? '\u786e\u5b9a\u5220\u9664\u8fd9\u4e2a\u6e05\u5355\uff1f' : 'Delete this list?')) {
        deleteCustomList(btn.dataset.clid);
        _renderMyLists();
      }
    });
  });

  el.querySelectorAll('.cl-print-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var list = typeof getCustomList === 'function' ? getCustomList(btn.dataset.clid) : null;
      if (list) _showPrintModeModal(list);
    });
  });

  el.querySelectorAll('.cl-record-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { startListReEntry(btn.dataset.clid); });
  });

  /* Remove item from list */
  el.querySelectorAll('[data-rm-list]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var listId = btn.dataset.rmList;
      var type = btn.dataset.rmType;
      var ref = btn.dataset.rmRef;
      if (typeof removeItemFromList === 'function') {
        removeItemFromList(listId, type, ref);
        var zh2 = (appLang !== 'en');
        if (typeof showToast === 'function') showToast(zh2 ? '\u5df2\u79fb\u9664' : 'Item removed');
        _renderMyLists();
      }
    });
  });

  /* Detail expand */
  el.querySelectorAll('.cl-item-detail-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _showListItemDetail(btn.dataset.detType, btn.dataset.detRef, btn.closest('tr'));
    });
  });

  /* Quick rate */
  el.querySelectorAll('.cl-item-rate-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _showQuickRate(btn.dataset.rateList, btn.dataset.rateType, btn.dataset.rateRef, btn);
    });
  });
}

/* ═══ PLAN CARD RENDERER ═══ */

function _renderPlanCard(cl, zh, isHidden) {
  var itemCounts = _countListItems(cl);
  var prog = typeof getPlanProgress === 'function' ? getPlanProgress(cl.id) : { total: cl.items.length, mastered: 0, pct: 0 };
  var html = '<div class="cl-card cl-plan-card" data-clid="' + _escList(cl.id) + '">';
  html += '<div class="cl-card-title"><span class="cl-expand-arrow">\u25b6</span> ';
  html += '<span class="cl-plan-badge">' + (zh ? '\u8ba1\u5212' : 'Plan') + '</span> ';
  html += _escList(cl.title) + '</div>';
  html += '<div class="cl-card-meta">' + cl.items.length + ' ' + (zh ? '\u9879' : 'items');
  if (itemCounts.v) html += ' (' + itemCounts.v + 'V';
  if (itemCounts.k) html += '+' + itemCounts.k + 'K';
  if (itemCounts.p) html += '+' + itemCounts.p + 'P';
  if (itemCounts.v || itemCounts.k || itemCounts.p) html += ')';
  html += '</div>';

  /* Target date */
  if (cl.targetDate) {
    var today = new Date().toLocaleDateString('en-CA');
    var daysLeft = Math.ceil((new Date(cl.targetDate) - new Date(today)) / 86400000);
    var dateClass = daysLeft < 0 ? 'cl-plan-target overdue' : daysLeft <= 3 ? 'cl-plan-target warning' : 'cl-plan-target';
    var dateLabel = daysLeft < 0 ? (zh ? '\u5df2\u8fc7\u671f ' + (-daysLeft) + ' \u5929' : 'Overdue ' + (-daysLeft) + 'd')
      : daysLeft === 0 ? (zh ? '\u4eca\u5929\u622a\u6b62' : 'Due today')
      : (zh ? '\u5269\u4f59 ' + daysLeft + ' \u5929' : daysLeft + ' days left');
    html += '<div class="' + dateClass + '">' + cl.targetDate + ' \u00b7 ' + dateLabel + '</div>';
  }

  /* Progress bar */
  html += '<div class="cl-stats-bar">';
  html += '<div class="cl-stats-track"><div class="cl-stats-seg cl-stats-m" style="width:' + prog.pct + '%"></div></div>';
  html += '<div class="cl-stats-labels">' + prog.mastered + '/' + prog.total + ' ' + (zh ? '\u5df2\u638c\u63e1' : 'mastered') + ' (' + prog.pct + '%)</div>';
  html += '</div>';

  /* FLM detail bar */
  html += _renderListStatsBar(cl);

  html += '<div class="cl-card-actions">';
  if (!isHidden) {
    html += '<button class="btn btn-sm btn-primary cl-plan-focus-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u805a\u7126\u5b66\u4e60' : 'Focus Study') + '</button>';
    html += '<button class="btn btn-sm btn-ghost cl-scan-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u5feb\u901f Scan' : 'Quick Scan') + '</button>';
    html += '<button class="btn btn-sm btn-ghost cl-plan-hide-btn" data-clid="' + _escList(cl.id) + '" title="' + (zh ? '\u6807\u8bb0\u5b8c\u6210' : 'Mark Complete') + '">\u2705</button>';
  } else {
    html += '<button class="btn btn-sm btn-ghost cl-plan-unhide-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u6062\u590d\u8ba1\u5212' : 'Restore') + '</button>';
  }
  html += '<button class="btn btn-sm btn-ghost cl-delete-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u5220\u9664' : 'Delete') + '">\ud83d\uddd1\ufe0f</button>';
  html += '</div>';

  /* Expandable item list */
  html += '<div class="cl-card-items" id="cl-items-' + _escList(cl.id) + '" style="display:none">';
  html += _renderListItemsPreview(cl);
  html += '</div>';

  html += '</div>';
  return html;
}

function _renderRegularListCard(cl, zh) {
  var itemCounts = _countListItems(cl);
  var lastSession = cl.sessions && cl.sessions.length > 0 ? cl.sessions[cl.sessions.length - 1] : null;
  var html = '<div class="cl-card" data-clid="' + _escList(cl.id) + '">';
  html += '<div class="cl-card-title"><span class="cl-expand-arrow">\u25b6</span> ' + _escList(cl.title) + '</div>';
  html += '<div class="cl-card-meta">' + cl.items.length + ' ' + (zh ? '\u9879' : 'items');
  if (itemCounts.v) html += ' (' + itemCounts.v + 'V';
  if (itemCounts.k) html += '+' + itemCounts.k + 'K';
  if (itemCounts.p) html += '+' + itemCounts.p + 'P';
  if (itemCounts.v || itemCounts.k || itemCounts.p) html += ')';
  html += '</div>';
  if (lastSession) {
    html += '<div class="cl-card-meta">' + (zh ? '\u4e0a\u6b21: ' : 'Last: ') + lastSession.ts.slice(0, 10) + '</div>';
  }
  html += _renderListStatsBar(cl);
  if (cl.sessions && cl.sessions.length > 0) {
    html += '<div class="cl-session-timeline">';
    var tlStart = Math.max(0, cl.sessions.length - 5);
    for (var si = tlStart; si < cl.sessions.length; si++) {
      var sess = cl.sessions[si];
      var r = sess.results || {};
      html += '<span class="cl-session-dot" title="' + sess.ts.slice(0, 10) + ': ' + (r.mastered || 0) + 'M/' + (r.uncertain || 0) + 'U/' + (r.learning || 0) + 'L">';
      html += '#' + (si + 1);
      html += '</span>';
    }
    html += '</div>';
  }
  html += '<div class="cl-card-actions">';
  html += '<button class="btn btn-sm btn-primary cl-study-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u5f00\u59cb\u5b66\u4e60' : 'Study') + '</button>';
  html += '<button class="btn btn-sm btn-ghost cl-scan-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u5feb\u901f Scan' : 'Quick Scan') + '</button>';
  html += '<button class="btn btn-sm btn-ghost cl-record-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u8865\u5f55' : 'Record') + '" title="' + (zh ? '\u8865\u5f55\u5b66\u4e60\u7ed3\u679c' : 'Record Results') + '">\ud83d\udcdd</button>';
  html += '<button class="btn btn-sm btn-ghost cl-rename-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u91cd\u547d\u540d' : 'Rename') + '">\u270f\ufe0f</button>';
  html += '<button class="btn btn-sm btn-ghost cl-delete-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u5220\u9664' : 'Delete') + '">\ud83d\uddd1\ufe0f</button>';
  html += '<button class="btn btn-sm btn-ghost cl-print-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u6253\u5370' : 'Print') + '">\ud83d\udda8\ufe0f</button>';
  html += '</div>';
  html += '<div class="cl-card-items" id="cl-items-' + _escList(cl.id) + '" style="display:none">';
  html += _renderListItemsPreview(cl);
  html += '</div>';
  html += '</div>';
  return html;
}

/* ═══ CREATE PLAN MODAL ═══ */

function _showCreatePlanModal(prefillSectionId, prefillBoard) {
  var zh = (appLang !== 'en');
  var html = '<div style="max-height:70vh;overflow-y:auto;padding:4px">';

  /* Title + date */
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font-size:13px;font-weight:600">' + (zh ? '\u8ba1\u5212\u540d\u79f0' : 'Plan Title') + '</label>';
  html += '<input type="text" id="plan-title-input" class="input" style="width:100%;margin-top:4px" placeholder="' + (zh ? '\u4f8b\u5982\uff1a\u4ee3\u6570\u590d\u4e60' : 'e.g. Algebra Review') + '">';
  html += '</div>';
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font-size:13px;font-weight:600">' + (zh ? '\u622a\u6b62\u65e5\u671f (\u53ef\u9009)' : 'Target Date (optional)') + '</label>';
  html += '<input type="date" id="plan-date-input" class="input" style="width:100%;margin-top:4px">';
  html += '</div>';

  /* Status filter */
  html += '<div style="margin-bottom:12px">';
  html += '<label style="font-size:13px;font-weight:600">' + (zh ? '\u72b6\u6001\u8fc7\u6ee4' : 'Status Filter') + '</label>';
  html += '<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">';
  html += '<label class="cl-re-label"><input type="radio" name="plan-status-filter" value="new" checked> ' + (zh ? '\u4ec5\u65b0\u8bcd' : 'New only') + '</label>';
  html += '<label class="cl-re-label"><input type="radio" name="plan-status-filter" value="new+learning"> ' + (zh ? '\u65b0+\u5b66\u4e60\u4e2d' : 'New+Learning') + '</label>';
  html += '<label class="cl-re-label"><input type="radio" name="plan-status-filter" value="all-unmastered"> ' + (zh ? '\u6240\u6709\u672a\u638c\u63e1' : 'All unmastered') + '</label>';
  html += '</div></div>';

  /* Section picker */
  html += '<div style="margin-bottom:8px">';
  html += '<label style="font-size:13px;font-weight:600">' + (zh ? '\u9009\u62e9\u5185\u5bb9' : 'Select Content') + '</label>';
  html += '</div>';

  /* Build sections with item counts */
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : ['cie'];
  html += '<div id="plan-picker-sections">';
  for (var bi = 0; bi < boards.length; bi++) {
    var board = boards[bi];
    var sylBoard = (board === '25m' || board === 'hhk') ? 'hhk' : board;
    var syl = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[sylBoard] : null;
    if (!syl || !syl.chapters) continue;

    html += '<div class="plan-picker-board"><strong>' + board.toUpperCase() + '</strong></div>';
    for (var ci = 0; ci < syl.chapters.length; ci++) {
      var ch = syl.chapters[ci];
      var secs = ch.sections || [];
      for (var si = 0; si < secs.length; si++) {
        var sec = secs[si];
        var secId = sec.id;
        var checked = (prefillSectionId && secId === prefillSectionId && sylBoard === (prefillBoard === '25m' ? 'hhk' : prefillBoard)) ? ' checked' : '';
        html += '<div class="plan-picker-section">';
        html += '<label><input type="checkbox" class="plan-sec-check" data-sec="' + _escList(secId) + '" data-board="' + _escList(sylBoard) + '"' + checked + '> ';
        html += '<strong>' + _escList(secId) + '</strong> ' + _escList(sec.title || sec.name || '') + '</label>';
        html += '</div>';
      }
    }
  }
  html += '</div>';

  html += '</div>';

  if (typeof showModal === 'function') {
    showModal(zh ? '\u521b\u5efa\u5b66\u4e60\u8ba1\u5212' : 'Create Learning Plan', html, function() {
      _commitCreatePlan();
    }, zh ? '\u521b\u5efa' : 'Create');
  }
}

function _commitCreatePlan() {
  var titleEl = document.getElementById('plan-title-input');
  var dateEl = document.getElementById('plan-date-input');
  var title = titleEl ? titleEl.value.trim() : '';
  if (!title) {
    if (typeof showToast === 'function') showToast(appLang !== 'en' ? '\u8bf7\u8f93\u5165\u8ba1\u5212\u540d\u79f0' : 'Please enter a plan title');
    return;
  }
  var targetDate = dateEl && dateEl.value ? dateEl.value : null;

  /* Get status filter */
  var filterRadio = document.querySelector('input[name="plan-status-filter"]:checked');
  var statusFilter = filterRadio ? filterRadio.value : 'new';

  /* Collect checked sections */
  var checks = document.querySelectorAll('.plan-sec-check:checked');
  if (checks.length === 0) {
    if (typeof showToast === 'function') showToast(appLang !== 'en' ? '\u8bf7\u9009\u62e9\u81f3\u5c11\u4e00\u4e2a\u7ae0\u8282' : 'Select at least one section');
    return;
  }

  /* Create plan */
  var plan = typeof createLearningPlan === 'function' ? createLearningPlan(title, targetDate) : null;
  if (!plan) return;

  /* Collect items from selected sections */
  var items = [];
  for (var ci = 0; ci < checks.length; ci++) {
    var secId = checks[ci].dataset.sec;
    var board = checks[ci].dataset.board;
    _collectSectionItems(secId, board, statusFilter, items);
  }

  if (items.length > 0 && typeof addItemsToList === 'function') {
    addItemsToList(plan.id, items);
  }

  if (typeof showToast === 'function') {
    showToast((appLang !== 'en' ? '\u8ba1\u5212\u5df2\u521b\u5efa: ' : 'Plan created: ') + items.length + (appLang !== 'en' ? ' \u9879' : ' items'));
  }
  _renderMyLists();
}

function _collectSectionItems(sectionId, board, statusFilter, items) {
  var seen = {};
  for (var x = 0; x < items.length; x++) seen[items[x].type + ':' + items[x].ref] = true;

  function _matchStatus(fs) {
    if (statusFilter === 'new') return fs === 'new';
    if (statusFilter === 'new+learning') return fs === 'new' || fs === 'learning';
    return fs !== 'mastered';
  }

  /* Vocab: match by section mapping through levels */
  var allWords = typeof getAllWords === 'function' ? getAllWords() : [];
  var wordData = typeof getWordData === 'function' ? getWordData() : {};
  for (var wi = 0; wi < allWords.length; wi++) {
    var w = allWords[wi];
    if (!w.key) continue;
    /* Check if word belongs to this section via level */
    var lvl = null;
    if (typeof LEVELS !== 'undefined') {
      for (var li = 0; li < LEVELS.length; li++) {
        if (LEVELS[li].words) {
          for (var wj = 0; wj < LEVELS[li].words.length; wj++) {
            if (LEVELS[li].words[wj].key === w.key) { lvl = LEVELS[li]; break; }
          }
        }
        if (lvl) break;
      }
    }
    if (!lvl) continue;
    var secMatch = false;
    if (lvl.section === sectionId) secMatch = true;
    if (lvl.sections && lvl.sections.indexOf(sectionId) !== -1) secMatch = true;
    if (!secMatch) continue;
    var fs = wordData[w.key] ? (wordData[w.key].fs || 'new') : 'new';
    if (!_matchStatus(fs)) continue;
    var key = 'vocab:' + w.key;
    if (!seen[key]) { items.push({ type: 'vocab', ref: w.key }); seen[key] = true; }
  }

  /* KP */
  if (typeof _kpData !== 'undefined' && _kpData[board]) {
    var kpChapters = _kpData[board].chapters || [];
    for (var kci = 0; kci < kpChapters.length; kci++) {
      var kpSecs = kpChapters[kci].sections || [];
      for (var ksi = 0; ksi < kpSecs.length; ksi++) {
        if (kpSecs[ksi].id !== sectionId) continue;
        var kps = kpSecs[ksi].knowledgePoints || [];
        for (var kpi = 0; kpi < kps.length; kpi++) {
          var kpId = kps[kpi].id;
          var kpFs = typeof getKPFLM === 'function' ? getKPFLM(kpId) : 'new';
          if (!_matchStatus(kpFs)) continue;
          var kpKey = 'kp:' + kpId;
          if (!seen[kpKey]) { items.push({ type: 'kp', ref: kpId }); seen[kpKey] = true; }
        }
      }
    }
  }

  /* PP */
  var ppBoard = board === 'hhk' ? 'cie' : board;
  if (typeof _ppData !== 'undefined' && _ppData[ppBoard]) {
    var qs = _ppData[ppBoard].questions || [];
    var ppM = typeof _ppGetMastery === 'function' ? _ppGetMastery() : {};
    for (var qi = 0; qi < qs.length; qi++) {
      var q = qs[qi];
      if (!q.subtopic || q.subtopic.indexOf(sectionId) === -1) continue;
      var qid = q.id || q.qid;
      if (!qid) continue;
      var ppFs = ppM[qid] ? (ppM[qid].fs || 'new') : 'new';
      if (!_matchStatus(ppFs)) continue;
      var ppKey = 'pp:' + qid;
      if (!seen[ppKey]) { items.push({ type: 'pp', ref: qid }); seen[ppKey] = true; }
    }
  }
}

/* ═══ PLAN FOCUS STUDY ═══ */

var _planFocusMode = false;

function startPlanFocusStudy(planId) {
  var list = typeof getCustomList === 'function' ? getCustomList(planId) : null;
  if (!list || !list.items || list.items.length === 0) {
    if (typeof showToast === 'function') showToast(t('Plan is empty', '\u8ba1\u5212\u4e3a\u7a7a'));
    return;
  }

  /* Filter to only unmastered items */
  var unmasteredItems = [];
  for (var i = 0; i < list.items.length; i++) {
    var fs = _resolveItemFLM(list.items[i].type, list.items[i].ref);
    if (fs !== 'mastered') unmasteredItems.push(list.items[i]);
  }

  if (unmasteredItems.length === 0) {
    if (typeof showToast === 'function') showToast(t('All items mastered!', '\u5168\u90e8\u5df2\u638c\u63e1\uff01'));
    return;
  }

  /* Create a temp filtered list for scanning */
  _planFocusMode = true;

  /* Build phases from unmastered items */
  var vocabKeys = [], kpByBoard = {}, ppByBoard = {};
  for (var j = 0; j < unmasteredItems.length; j++) {
    var it = unmasteredItems[j];
    if (it.type === 'vocab') { vocabKeys.push(it.ref); continue; }
    var detBoard = _detectItemBoard(it.type, it.ref);
    if (it.type === 'kp') {
      if (!kpByBoard[detBoard]) kpByBoard[detBoard] = [];
      kpByBoard[detBoard].push(it.ref);
    } else if (it.type === 'pp') {
      if (!ppByBoard[detBoard]) ppByBoard[detBoard] = [];
      ppByBoard[detBoard].push(it.ref);
    }
  }

  var phases = [];
  if (vocabKeys.length > 0) phases.push({ type: 'vocab', items: vocabKeys });
  var bKeys = Object.keys(kpByBoard);
  for (var bi = 0; bi < bKeys.length; bi++) phases.push({ type: 'kp', items: kpByBoard[bKeys[bi]], board: bKeys[bi] });
  bKeys = Object.keys(ppByBoard);
  for (var bi2 = 0; bi2 < bKeys.length; bi2++) phases.push({ type: 'pp', items: ppByBoard[bKeys[bi2]], board: bKeys[bi2] });

  if (phases.length === 0) return;

  _listScanSession = {
    listId: planId,
    phases: phases,
    phaseIdx: 0
  };

  _runListScanPhase();
}

/* ═══ CREATE PLAN FROM SECTION (called from syllabus.js) ═══ */

function _createPlanFromSection(sectionId, board) {
  _showCreatePlanModal(sectionId, board);
}

function _countListItems(cl) {
  var v = 0, k = 0, p = 0;
  for (var i = 0; i < cl.items.length; i++) {
    if (cl.items[i].type === 'vocab') v++;
    else if (cl.items[i].type === 'kp') k++;
    else if (cl.items[i].type === 'pp') p++;
  }
  return { v: v, k: k, p: p };
}

function _renderListItemsPreview(cl) {
  var zh = (appLang !== 'en');
  var html = '<table class="list-table" style="font-size:12px;margin-top:8px"><thead><tr>';
  html += '<th>' + (zh ? '\u7c7b\u578b' : 'Type') + '</th>';
  html += '<th>' + (zh ? '\u6807\u9898' : 'Title') + '</th>';
  html += '<th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th>';
  html += '<th>' + (zh ? '\u52a0\u5165' : 'Added') + '</th>';
  html += '<th>' + (zh ? '\u5b66\u4e60' : 'Learned') + '</th>';
  html += '<th></th>';
  html += '</tr></thead><tbody>';
  for (var i = 0; i < cl.items.length; i++) {
    var item = cl.items[i];
    var fs = _resolveItemFLM(item.type, item.ref);
    var title = typeof _resolveItemTitle === 'function' ? _resolveItemTitle(item.type, item.ref) : _escList(item.ref);
    var addedStr = item.addedAt ? item.addedAt.slice(5, 10) : '-';
    var learnedStr = item.learnedAt ? item.learnedAt.slice(5, 10) : '\u2014';
    html += '<tr class="cl-preview-row" data-clid="' + _escList(cl.id) + '" data-item-type="' + item.type + '" data-item-ref="' + _escList(item.ref) + '">';
    html += '<td>' + item.type + '</td>';
    html += '<td class="cl-item-title-cell">' + title + '</td>';
    html += '<td>' + _fsChip(fs) + '</td>';
    html += '<td style="font-size:11px;color:var(--c-text3)">' + addedStr + '</td>';
    html += '<td style="font-size:11px;color:var(--c-text3)">' + learnedStr + '</td>';
    html += '<td style="white-space:nowrap">';
    html += '<button class="btn btn-ghost cl-item-detail-btn" style="padding:2px 5px;font-size:10px" data-det-type="' + item.type + '" data-det-ref="' + _escList(item.ref) + '" title="' + (zh ? '\u8be6\u60c5' : 'Detail') + '">\ud83d\udd0d</button>';
    html += '<button class="btn btn-ghost cl-item-rate-btn" style="padding:2px 5px;font-size:10px" data-rate-list="' + _escList(cl.id) + '" data-rate-type="' + item.type + '" data-rate-ref="' + _escList(item.ref) + '" title="' + (zh ? '\u8bc4\u5206' : 'Rate') + '">\u2b50</button>';
    html += '<button class="btn btn-ghost" style="padding:2px 6px;font-size:11px;color:var(--c-danger)" data-rm-list="' + _escList(cl.id) + '" data-rm-type="' + item.type + '" data-rm-ref="' + _escList(item.ref) + '">\u2715</button>';
    html += '</td>';
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

function _resolveItemFLM(type, ref) {
  if (type === 'vocab') {
    var wd = typeof getWordData === 'function' ? getWordData() : {};
    var d = wd[ref];
    return d ? (d.fs || 'new') : 'new';
  }
  if (type === 'kp') {
    var kpResult = typeof getKPResult === 'function' ? getKPResult(ref) : null;
    return kpResult ? (kpResult.fs || 'new') : 'new';
  }
  if (type === 'pp') {
    var m = typeof _ppGetMastery === 'function' ? _ppGetMastery() : {};
    return m[ref] ? (m[ref].fs || 'new') : 'new';
  }
  return 'new';
}

/* ═══ LIST SCAN (chained vocab→KP→PP) ═══ */

var _listScanSession = null;

function isListScanActive() { return _listScanSession !== null; }

function startListScan(listId) {
  var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
  if (!list || list.items.length === 0) {
    if (typeof showToast === 'function') showToast(t('List is empty', '\u6e05\u5355\u4e3a\u7a7a'));
    return;
  }

  /* Group items by type and detect board per item from _kpData/_ppData */
  var vocabKeys = [], kpByBoard = {}, ppByBoard = {};
  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    if (it.type === 'vocab') { vocabKeys.push(it.ref); continue; }
    var detBoard = _detectItemBoard(it.type, it.ref);
    if (it.type === 'kp') {
      if (!kpByBoard[detBoard]) kpByBoard[detBoard] = [];
      kpByBoard[detBoard].push(it.ref);
    } else if (it.type === 'pp') {
      if (!ppByBoard[detBoard]) ppByBoard[detBoard] = [];
      ppByBoard[detBoard].push(it.ref);
    }
  }

  var phases = [];
  if (vocabKeys.length > 0) phases.push({ type: 'vocab', items: vocabKeys });
  var bKeys = Object.keys(kpByBoard);
  for (var bi = 0; bi < bKeys.length; bi++) phases.push({ type: 'kp', items: kpByBoard[bKeys[bi]], board: bKeys[bi] });
  bKeys = Object.keys(ppByBoard);
  for (var bi2 = 0; bi2 < bKeys.length; bi2++) phases.push({ type: 'pp', items: ppByBoard[bKeys[bi2]], board: bKeys[bi2] });

  if (phases.length === 0) return;

  _listScanSession = {
    listId: listId,
    phases: phases,
    phaseIdx: 0
  };

  _runListScanPhase();
}

function _runListScanPhase() {
  if (!_listScanSession) return;
  if (_listScanSession.phaseIdx >= _listScanSession.phases.length) {
    _finishListScan();
    return;
  }

  var phase = _listScanSession.phases[_listScanSession.phaseIdx];

  if (phase.type === 'vocab') {
    /* Build word objects from keys for startRefreshScan */
    var allW = typeof getAllWords === 'function' ? getAllWords() : [];
    var keySet = {};
    for (var ki = 0; ki < phase.items.length; ki++) keySet[phase.items[ki]] = true;
    var wordObjs = [];
    for (var wi = 0; wi < allW.length; wi++) {
      if (keySet[allW[wi].key]) {
        wordObjs.push({ word: allW[wi].word, def: allW[wi].def, key: allW[wi].key, lid: allW[wi].level });
      }
    }
    if (wordObjs.length > 0 && typeof startRefreshScan === 'function') {
      startRefreshScan(wordObjs);
    } else {
      _listScanSession.phaseIdx++;
      _runListScanPhase();
    }
  } else if (phase.type === 'kp') {
    if (typeof startKPScanByIds === 'function') {
      startKPScanByIds(phase.items, phase.board);
    } else {
      _listScanSession.phaseIdx++;
      _runListScanPhase();
    }
  } else if (phase.type === 'pp') {
    if (typeof startPPScanByIds === 'function') {
      startPPScanByIds(phase.items, phase.board);
    } else {
      _listScanSession.phaseIdx++;
      _runListScanPhase();
    }
  }
}

/* Called from finish hooks in study.js / practice.js to advance to next phase */
var _listScanAdvancing = false;
function advanceListScan() {
  if (!_listScanSession || _listScanAdvancing) return;
  _listScanAdvancing = true;
  _listScanSession.phaseIdx++;
  setTimeout(function() { _listScanAdvancing = false; _runListScanPhase(); }, 600);
}

/* Render list-scan-aware buttons for result screens */
function _renderListScanButtons() {
  if (!_listScanSession) return '';
  var zh = (appLang !== 'en');
  var cur = _listScanSession.phaseIdx;
  var total = _listScanSession.phases.length;
  var isLast = (cur >= total - 1);

  var html = '<div class="result-actions">';
  if (isLast) {
    html += '<button class="btn btn-primary" data-action="advanceListScan">';
    html += (zh ? '\u5b8c\u6210\u6e05\u5355 Scan' : 'Finish List Scan') + '</button>';
  } else {
    var nextType = _listScanSession.phases[cur + 1].type;
    var nextLabel = nextType === 'vocab' ? (zh ? '\u8bcd\u6c47' : 'Vocab') : nextType === 'kp' ? (zh ? '\u77e5\u8bc6\u70b9' : 'KP') : (zh ? '\u771f\u9898' : 'PP');
    html += '<button class="btn btn-primary" data-action="advanceListScan">';
    html += (zh ? '\u4e0b\u4e00\u6b65' : 'Next') + ': ' + nextLabel + ' \u2192</button>';
  }
  html += '<button class="btn btn-ghost" data-action="exitListScan">';
  html += (zh ? '\u9000\u51fa' : 'Exit') + '</button>';
  html += '</div>';
  return html;
}

/* Bind list-scan button events after HTML injection */
function _bindListScanButtons(panel) {
  if (!panel) return;
  var btns = panel.querySelectorAll('[data-action]');
  for (var i = 0; i < btns.length; i++) {
    (function(btn) {
      var action = btn.dataset.action;
      if (action === 'advanceListScan') {
        btn.addEventListener('click', function() { advanceListScan(); });
      } else if (action === 'exitListScan') {
        btn.addEventListener('click', function() { exitListScan(); });
      }
    })(btns[i]);
  }
}

function exitListScan() {
  _listScanSession = null;
  if (typeof navTo === 'function') navTo('lists');
}

function _finishListScan() {
  if (!_listScanSession) return;

  /* Tally current FLM state for all items in the list + batch update learnedAt */
  var list = typeof getCustomList === 'function' ? getCustomList(_listScanSession.listId) : null;
  var results = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
  if (list) {
    for (var i = 0; i < list.items.length; i++) {
      var fs = _resolveItemFLM(list.items[i].type, list.items[i].ref) || 'new';
      results[fs] = (results[fs] || 0) + 1;
      /* Stamp learnedAt for all scanned items */
      if (typeof updateItemLearnedAt === 'function') {
        updateItemLearnedAt(_listScanSession.listId, list.items[i].type, list.items[i].ref);
      }
    }
  }

  if (typeof recordListSession === 'function') {
    recordListSession(_listScanSession.listId, results);
  }

  var zh = (appLang !== 'en');
  if (typeof showToast === 'function') {
    showToast(zh ? '\u6e05\u5355 Scan \u5b8c\u6210\uff01' : 'List Scan complete!');
  }

  _listScanSession = null;
  if (typeof navTo === 'function') navTo('lists');
}

/* ═══ PRINT MODE MODAL (Phase B1) ═══ */

function _showPrintModeModal(list) {
  var zh = (appLang !== 'en');
  var html = '<div style="padding:16px">';
  html += '<h3>' + (zh ? '\u9009\u62e9\u6253\u5370\u6a21\u5f0f' : 'Print Mode') + '</h3>';
  html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">';
  html += '<button class="btn btn-primary" data-print-mode="detailed">' + (zh ? '\u9879\u76ee\u8be6\u60c5' : 'Detailed Content') + '</button>';
  html += '<button class="btn btn-ghost" data-print-mode="checklist">' + (zh ? '\u79bb\u7ebf\u52fe\u9009\u6e05\u5355' : 'Offline Checklist') + '</button>';
  html += '<button class="btn btn-ghost" data-print-mode="summary">' + (zh ? '\u6458\u8981\u603b\u89c8' : 'Summary Overview') + '</button>';
  html += '</div></div>';

  if (typeof showModal === 'function') showModal(html);
  setTimeout(function() {
    var card = document.getElementById('modal-card');
    if (!card) return;
    card.querySelectorAll('[data-print-mode]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (typeof hideModal === 'function') hideModal();
        var mode = btn.dataset.printMode;
        if (mode === 'detailed' && typeof printCustomListDetailed === 'function') printCustomListDetailed(list);
        else if (mode === 'checklist' && typeof printCustomListChecklist === 'function') printCustomListChecklist(list);
        else if (typeof printCustomList === 'function') printCustomList(list);
      });
    });
  }, 150);
}

/* ═══ RE-ENTRY SYSTEM (Phase C) ═══ */

function startListReEntry(listId) {
  var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
  if (!list || list.items.length === 0) {
    if (typeof showToast === 'function') showToast(typeof t === 'function' ? t('List is empty', '\u6e05\u5355\u4e3a\u7a7a') : 'List is empty');
    return;
  }
  var el = document.getElementById('list-content');
  if (!el) return;
  var zh = (appLang !== 'en');

  var html = '<div class="cl-reentry">';
  html += '<h3 style="margin-bottom:12px">' + (zh ? '\ud83d\udcdd \u8865\u5f55\u5b66\u4e60\u7ed3\u679c: ' : '\ud83d\udcdd Record Results: ') + _escList(list.title) + '</h3>';

  /* Group by type */
  var groups = { vocab: [], kp: [], pp: [] };
  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    if (!groups[it.type]) groups[it.type] = [];
    groups[it.type].push(it);
  }

  var types = [
    { key: 'vocab', label: zh ? '\u8bcd\u6c47' : 'Vocabulary' },
    { key: 'kp', label: zh ? '\u77e5\u8bc6\u70b9' : 'Knowledge Points' },
    { key: 'pp', label: zh ? '\u771f\u9898' : 'Past Papers' }
  ];

  for (var ti = 0; ti < types.length; ti++) {
    var items = groups[types[ti].key];
    if (!items || items.length === 0) continue;
    html += '<div style="margin-bottom:16px">';
    html += '<div style="font-weight:700;margin-bottom:6px;font-size:14px">[' + types[ti].label + ']</div>';
    html += '<div class="cl-reentry-group">';
    for (var j = 0; j < items.length; j++) {
      var ref = items[j].ref;
      var type = items[j].type;
      var fs = _resolveItemFLM(type, ref);
      var title = typeof _resolveItemTitle === 'function' ? _resolveItemTitle(type, ref) : _escList(ref);
      var nameBase = 're_' + type + '_' + ref.replace(/[^a-zA-Z0-9]/g, '_');
      html += '<div class="cl-reentry-row" data-re-type="' + type + '" data-re-ref="' + _escList(ref) + '">';
      html += '<span class="cl-reentry-title">' + title + '</span>';
      html += '<span class="cl-reentry-radios">';
      var opts = [
        { val: 'mastered', label: 'M', full: zh ? '\u638c\u63e1' : 'Mastered' },
        { val: 'uncertain', label: 'U', full: zh ? '\u4e0d\u786e\u5b9a' : 'Uncertain' },
        { val: 'learning', label: 'L', full: zh ? '\u5b66\u4e60\u4e2d' : 'Learning' },
        { val: 'new', label: 'N', full: zh ? '\u672a\u5b66' : 'New' }
      ];
      for (var oi = 0; oi < opts.length; oi++) {
        var checked = (fs === opts[oi].val) ? ' checked' : '';
        html += '<label class="cl-re-label" title="' + opts[oi].full + '">';
        html += '<input type="radio" name="' + _escList(nameBase) + '" value="' + opts[oi].val + '"' + checked + '>';
        html += ' ' + opts[oi].label + '</label>';
      }
      html += '</span>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">';
  html += '<button class="btn btn-primary" id="cl-reentry-save">' + (zh ? '\u4fdd\u5b58\u5e76\u8fd4\u56de' : 'Save & Return') + '</button>';
  html += '<button class="btn btn-ghost" id="cl-reentry-cancel">' + (zh ? '\u53d6\u6d88' : 'Cancel') + '</button>';
  html += '</div></div>';

  el.innerHTML = html;

  var saveBtn = el.querySelector('#cl-reentry-save');
  if (saveBtn) saveBtn.addEventListener('click', function() { _commitReEntry(listId, el); });
  var cancelBtn = el.querySelector('#cl-reentry-cancel');
  if (cancelBtn) cancelBtn.addEventListener('click', function() { _renderMyLists(); });
}

function _commitReEntry(listId, container) {
  var rows = container.querySelectorAll('.cl-reentry-row');
  var changed = 0;
  for (var i = 0; i < rows.length; i++) {
    var type = rows[i].dataset.reType;
    var ref = rows[i].dataset.reRef;
    var checkedRadio = rows[i].querySelector('input[type="radio"]:checked');
    if (!checkedRadio) continue;
    var newFs = checkedRadio.value;
    var oldFs = _resolveItemFLM(type, ref);
    if (newFs === oldFs || newFs === 'new') continue;

    /* Write-through to global FLM */
    if (type === 'vocab') {
      if (newFs === 'mastered' && typeof recordScan === 'function') recordScan(ref, 'known', 1);
      else if (newFs === 'uncertain' && typeof recordScan === 'function') recordScan(ref, 'fuzzy', 1);
      else if (newFs === 'learning' && typeof recordScan === 'function') recordScan(ref, 'unknown', 1);
    } else if (type === 'kp') {
      if (newFs === 'mastered' && typeof saveKPResult === 'function') saveKPResult(ref, 10, 10);
      else if (newFs === 'uncertain' && typeof saveKPResult === 'function') saveKPResult(ref, 7, 10);
      else if (newFs === 'learning' && typeof saveKPResult === 'function') saveKPResult(ref, 3, 10);
    } else if (type === 'pp' && typeof _ppSetMastery === 'function') {
      if (newFs === 'mastered') _ppSetMastery(ref, 'mastered', { source: 'practice' });
      else if (newFs === 'uncertain') _ppSetMastery(ref, 'partial', { source: 'practice' });
      else if (newFs === 'learning') _ppSetMastery(ref, 'needs_work', { source: 'practice' });
    }

    if (typeof updateItemLearnedAt === 'function') updateItemLearnedAt(listId, type, ref);
    changed++;
  }

  /* Record session with final tally */
  var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
  if (list) {
    var results = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
    for (var j = 0; j < list.items.length; j++) {
      var fs = _resolveItemFLM(list.items[j].type, list.items[j].ref) || 'new';
      results[fs] = (results[fs] || 0) + 1;
    }
    if (typeof recordListSession === 'function') recordListSession(listId, results);
  }

  var zh = (appLang !== 'en');
  if (typeof showToast === 'function') showToast(zh ? '\u5df2\u66f4\u65b0 ' + changed + ' \u9879\u5b66\u4e60\u72b6\u6001' : changed + ' items updated');
  _renderMyLists();
}

/* ═══ FLM STATS BAR (Phase D3) ═══ */

function _renderListStatsBar(cl) {
  if (!cl.items || cl.items.length === 0) return '';
  var counts = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
  var stale = 0;
  var now = Date.now();
  var STALE_MS = 7 * 24 * 60 * 60 * 1000;
  for (var i = 0; i < cl.items.length; i++) {
    var fs = _resolveItemFLM(cl.items[i].type, cl.items[i].ref) || 'new';
    counts[fs] = (counts[fs] || 0) + 1;
    if (fs === 'mastered' && cl.items[i].learnedAt) {
      if (now - new Date(cl.items[i].learnedAt).getTime() > STALE_MS) stale++;
    }
  }
  var total = cl.items.length;
  var pM = Math.round(counts.mastered / total * 100);
  var pU = Math.round(counts.uncertain / total * 100);
  var pL = Math.round(counts.learning / total * 100);
  var pN = Math.max(0, 100 - pM - pU - pL);

  var html = '<div class="cl-stats-bar">';
  html += '<div class="cl-stats-track">';
  if (counts.mastered > 0) html += '<div class="cl-stats-seg cl-stats-m" style="width:' + pM + '%"></div>';
  if (counts.uncertain > 0) html += '<div class="cl-stats-seg cl-stats-u" style="width:' + pU + '%"></div>';
  if (counts.learning > 0) html += '<div class="cl-stats-seg cl-stats-l" style="width:' + pL + '%"></div>';
  if (counts['new'] > 0) html += '<div class="cl-stats-seg cl-stats-n" style="width:' + pN + '%"></div>';
  html += '</div>';
  html += '<div class="cl-stats-labels">' + counts.mastered + 'M / ' + counts.uncertain + 'U / ' + counts.learning + 'L / ' + counts['new'] + 'N';
  if (stale > 0) html += ' <span style="color:var(--c-warning)">(' + stale + ' stale)</span>';
  html += '</div></div>';
  return html;
}

/* ═══ INLINE DETAIL EXPAND (Phase D2) ═══ */

function _showListItemDetail(type, ref, rowEl) {
  if (!rowEl) return;
  var existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('cl-detail-row')) {
    existing.remove();
    return;
  }
  var detailHtml = typeof _resolveItemDetailHtml === 'function' ? _resolveItemDetailHtml(type, ref) : ref;
  var tr = document.createElement('tr');
  tr.className = 'cl-detail-row';
  var td = document.createElement('td');
  td.colSpan = 6;
  td.innerHTML = '<div class="cl-detail-content">' + detailHtml + '</div>';
  tr.appendChild(td);
  rowEl.parentNode.insertBefore(tr, rowEl.nextSibling);
  try {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(td, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ], throwOnError: false
      });
    }
  } catch(e) {}
}

/* ═══ QUICK RATE (Phase D4) ═══ */

function _showQuickRate(listId, type, ref, anchorEl) {
  var old = document.querySelector('.cl-rate-popup');
  if (old) old.remove();

  var zh = (appLang !== 'en');
  var popup = document.createElement('div');
  popup.className = 'cl-rate-popup';
  popup.innerHTML =
    '<button data-qr="mastered" class="cl-qr-btn" style="background:var(--c-success-bg,#D1FAE5);color:var(--c-success,#059669)">M</button>' +
    '<button data-qr="uncertain" class="cl-qr-btn" style="background:var(--c-warning-bg,#FEF3C7);color:var(--c-warning,#D97706)">U</button>' +
    '<button data-qr="learning" class="cl-qr-btn" style="background:var(--c-primary-bg,#EDEDFF);color:var(--c-primary,#5248C9)">L</button>';

  document.body.appendChild(popup);
  var rect = anchorEl.getBoundingClientRect();
  popup.style.position = 'fixed';
  popup.style.top = (rect.bottom + 4) + 'px';
  popup.style.left = rect.left + 'px';
  popup.style.zIndex = '9999';

  popup.querySelectorAll('[data-qr]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var newFs = btn.dataset.qr;
      if (type === 'vocab') {
        if (newFs === 'mastered' && typeof recordScan === 'function') recordScan(ref, 'known', 1);
        else if (newFs === 'uncertain' && typeof recordScan === 'function') recordScan(ref, 'fuzzy', 1);
        else if (newFs === 'learning' && typeof recordScan === 'function') recordScan(ref, 'unknown', 1);
      } else if (type === 'kp') {
        if (newFs === 'mastered' && typeof saveKPResult === 'function') saveKPResult(ref, 10, 10);
        else if (newFs === 'uncertain' && typeof saveKPResult === 'function') saveKPResult(ref, 7, 10);
        else if (newFs === 'learning' && typeof saveKPResult === 'function') saveKPResult(ref, 3, 10);
      } else if (type === 'pp' && typeof _ppSetMastery === 'function') {
        if (newFs === 'mastered') _ppSetMastery(ref, 'mastered', { source: 'practice' });
        else if (newFs === 'uncertain') _ppSetMastery(ref, 'partial', { source: 'practice' });
        else if (newFs === 'learning') _ppSetMastery(ref, 'needs_work', { source: 'practice' });
      }
      if (typeof updateItemLearnedAt === 'function') updateItemLearnedAt(listId, type, ref);
      popup.remove();
      if (typeof showToast === 'function') showToast(zh ? '\u5df2\u66f4\u65b0' : 'Updated');
      _renderMyLists();
    });
  });

  setTimeout(function() {
    document.addEventListener('click', function _dismiss(e) {
      if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', _dismiss); }
    });
  }, 50);
}

/* ══════════════════════════════════════════════════════════════
   LIST STUDY MODE — Tab Workbench (v5.0.1)
   Each type (vocab/KP/PP) gets its own tab with native rendering.
   ══════════════════════════════════════════════════════════════ */

var _listStudy = null;
/* {
  listId, listTitle,
  tabs: { vocab:{items[],idx,rated{}}, kp:{...}, pp:{...} },
  activeTab: 'vocab'|'kp'|'pp',
  allItems: []   // flat reference for session recording
} */

var _LS_TAB_ORDER = ['vocab', 'kp', 'pp'];
var _LS_TAB_LABELS = {
  vocab: { en: 'Vocab', zh: '\u8bcd\u6c47' },
  kp:    { en: 'Knowledge', zh: '\u77e5\u8bc6\u70b9' },
  pp:    { en: 'Past Paper', zh: '\u771f\u9898' }
};

function startListStudy(listId) {
  var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
  if (!list || list.items.length === 0) {
    if (typeof showToast === 'function') showToast(typeof t === 'function' ? t('List is empty', '\u6e05\u5355\u4e3a\u7a7a') : 'List is empty');
    return;
  }

  /* Build enriched items array with resolved content */
  var allItems = [];
  /* Build complete word map from ALL levels (not just visible ones),
     because custom lists may contain words from any board */
  var wMap = {};
  if (typeof LEVELS !== 'undefined' && typeof wordKey === 'function') {
    for (var lvi = 0; lvi < LEVELS.length; lvi++) {
      var lv = LEVELS[lvi];
      if (!lv || !lv.vocabulary) continue;
      var vm = {};
      for (var vi = 0; vi < lv.vocabulary.length; vi++) {
        var v = lv.vocabulary[vi];
        if (!vm[v.id]) vm[v.id] = {};
        vm[v.id][v.type] = v.content;
      }
      for (var wid in vm) {
        var wk = wordKey(lvi, wid);
        if (!wMap[wk]) wMap[wk] = { word: vm[wid].word || '', def: vm[wid].def || '' };
      }
    }
  }

  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    var entry = { type: it.type, ref: it.ref, board: null };

    if (it.type === 'vocab') {
      var w = wMap[it.ref];
      entry.word = w ? w.word : it.ref;
      entry.def = w ? (w.def || '') : '';
    } else if (it.type === 'kp') {
      entry.board = _detectItemBoard('kp', it.ref);
      var kpObj = _findKP(it.ref, entry.board);
      entry.kp = kpObj;
      entry.title = kpObj ? (kpObj.title || it.ref) : it.ref;
      entry.titleZh = kpObj ? (kpObj.title_zh || '') : '';
    } else if (it.type === 'pp') {
      entry.board = _detectItemBoard('pp', it.ref);
      entry.question = _findPPQuestion(it.ref, entry.board);
    }
    allItems.push(entry);
  }

  /* Split into tabs by type */
  var tabs = { vocab: { items: [], idx: 0, rated: {} }, kp: { items: [], idx: 0, rated: {} }, pp: { items: [], idx: 0, rated: {} } };
  for (var ai = 0; ai < allItems.length; ai++) {
    var tp = allItems[ai].type;
    if (tabs[tp]) tabs[tp].items.push(allItems[ai]);
  }

  /* Find first non-empty tab */
  var activeTab = 'vocab';
  for (var ti = 0; ti < _LS_TAB_ORDER.length; ti++) {
    if (tabs[_LS_TAB_ORDER[ti]].items.length > 0) { activeTab = _LS_TAB_ORDER[ti]; break; }
  }

  _listStudy = {
    listId: listId,
    listTitle: list.title,
    tabs: tabs,
    activeTab: activeTab,
    allItems: allItems
  };

  if (typeof showPanel === 'function') showPanel('study');
  _renderListStudyWorkbench();
}

function _findKP(kpId, board) {
  var bds = board ? [board] : ['cie', 'edx'];
  for (var bi = 0; bi < bds.length; bi++) {
    var pts = (typeof _kpData !== 'undefined') ? (_kpData[bds[bi]] || []) : [];
    for (var ki = 0; ki < pts.length; ki++) {
      if (pts[ki].id === kpId) return pts[ki];
    }
  }
  return null;
}

function _findPPQuestion(qid, board) {
  var bds = board ? [board] : ['cie', 'edx'];
  for (var bi = 0; bi < bds.length; bi++) {
    var ppB = (typeof _ppData !== 'undefined') ? _ppData[bds[bi]] : null;
    if (ppB && ppB.questions) {
      for (var qi = 0; qi < ppB.questions.length; qi++) {
        if (ppB.questions[qi].id === qid) return ppB.questions[qi];
      }
    }
  }
  return null;
}

/* ─── Main Workbench Renderer ─── */

function _renderListStudyWorkbench() {
  if (!_listStudy) return;
  var panel = E('panel-study');
  if (!panel) return;
  var ls = _listStudy;
  var zh = (appLang !== 'en');
  var tab = ls.tabs[ls.activeTab];
  var item = tab.items[tab.idx];
  var fs = item ? _resolveItemFLM(item.type, item.ref) : null;

  /* Count non-empty tabs */
  var nonEmptyTabs = [];
  for (var ti = 0; ti < _LS_TAB_ORDER.length; ti++) {
    if (ls.tabs[_LS_TAB_ORDER[ti]].items.length > 0) nonEmptyTabs.push(_LS_TAB_ORDER[ti]);
  }
  var multiTab = nonEmptyTabs.length > 1;

  var html = '';

  /* Top bar: back + list title */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" id="ls-back">\u2190</button>';
  html += '<div class="ls-wb-title">' + _escList(ls.listTitle) + '</div>';
  if (fs) html += _fsChip(fs);
  html += '</div>';

  /* Tab row (hidden for single type) */
  if (multiTab) {
    html += '<div class="ls-tab-row">';
    for (var tbi = 0; tbi < _LS_TAB_ORDER.length; tbi++) {
      var tabId = _LS_TAB_ORDER[tbi];
      var tabData = ls.tabs[tabId];
      if (tabData.items.length === 0) continue;
      var ratedCount = Object.keys(tabData.rated).length;
      var isActive = tabId === ls.activeTab;
      var lbl = zh ? _LS_TAB_LABELS[tabId].zh : _LS_TAB_LABELS[tabId].en;
      html += '<button class="ls-study-tab' + (isActive ? ' active' : '') + '" data-ls-tab="' + tabId + '">';
      html += lbl + ' <span class="ls-tab-progress">' + ratedCount + '/' + tabData.items.length;
      if (ratedCount > 0) html += '\u2713';
      html += '</span></button>';
    }
    html += '</div>';
  } else {
    /* Single type: show type badge */
    var singleType = nonEmptyTabs[0] || ls.activeTab;
    var badge = zh ? _LS_TAB_LABELS[singleType].zh : _LS_TAB_LABELS[singleType].en;
    html += '<div class="ls-header">';
    html += '<span class="ls-type-badge ls-type-' + singleType + '">' + badge + '</span>';
    html += '<span class="ls-list-title">' + (tab.idx + 1) + ' / ' + tab.items.length + '</span>';
    html += '</div>';
  }

  /* Content area */
  html += '<div class="ls-card" id="ls-tab-content">';
  html += _renderLsTabContent();
  html += '</div>';

  /* Rating buttons */
  html += '<div class="ls-actions">';
  html += '<div class="ls-rate-row">';
  html += '<button class="scan-btn scan-known ls-rate-btn" data-ls-rate="mastered">';
  html += '<span class="scan-key">1</span> ' + (zh ? '\u638c\u63e1' : 'Mastered') + '</button>';
  html += '<button class="scan-btn scan-fuzzy ls-rate-btn" data-ls-rate="uncertain">';
  html += '<span class="scan-key">2</span> ' + (zh ? '\u6a21\u7cca' : 'Uncertain') + '</button>';
  html += '<button class="scan-btn scan-unknown ls-rate-btn" data-ls-rate="learning">';
  html += '<span class="scan-key">3</span> ' + (zh ? '\u5b66\u4e60\u4e2d' : 'Learning') + '</button>';
  html += '</div>';

  /* Navigation */
  html += '<div class="ls-nav-row">';
  html += '<button class="btn btn-ghost ls-nav-btn" id="ls-prev"' + (tab.idx <= 0 ? ' disabled' : '') + '>';
  html += '\u2190 ' + (zh ? '\u4e0a\u4e00\u9879' : 'Prev') + '</button>';
  html += '<button class="btn btn-ghost ls-nav-btn" id="ls-skip">';
  html += (zh ? '\u8df3\u8fc7' : 'Skip') + '</button>';
  html += '<button class="btn btn-primary ls-nav-btn" id="ls-next"' + (tab.idx >= tab.items.length - 1 ? ' disabled' : '') + '>';
  html += (zh ? '\u4e0b\u4e00\u9879' : 'Next') + ' \u2192</button>';
  html += '</div>';

  /* Complete button */
  html += '<button class="btn btn-ghost ls-complete-btn" id="ls-complete">';
  html += (zh ? '\u5b8c\u6210\u5b66\u4e60' : 'Finish Study') + '</button>';

  html += '</div>';

  panel.innerHTML = html;
  _bindListStudyEvents(panel);
  _lsRenderMath(panel);
}

/* ─── Tab content dispatcher ─── */

function _renderLsTabContent() {
  if (!_listStudy) return '';
  var tab = _listStudy.tabs[_listStudy.activeTab];
  if (!tab || tab.items.length === 0) return '<div style="color:var(--c-text3);padding:20px;text-align:center">' + (appLang !== 'en' ? '\u6b64\u7c7b\u578b\u6ca1\u6709\u5185\u5bb9' : 'No items of this type') + '</div>';
  var item = tab.items[tab.idx];
  if (_listStudy.activeTab === 'vocab') return _renderLsVocabCard(item);
  if (_listStudy.activeTab === 'kp') return _renderLsKPCard(item);
  if (_listStudy.activeTab === 'pp') return _renderLsPPCard(item);
  return '';
}

/* ─── Vocab card (flashcard style) ─── */

function _renderLsVocabCard(item) {
  var html = '<div class="ls-vocab-card">';
  html += '<div class="ls-vocab-word">' + _escList(item.word) + '</div>';
  html += '<div class="ls-vocab-def" id="ls-reveal" style="visibility:hidden">' + _escList(item.def) + '</div>';
  html += '<button class="btn btn-ghost ls-reveal-btn" id="ls-reveal-btn">';
  html += (appLang !== 'en' ? '\u70b9\u51fb\u663e\u793a\u91ca\u4e49' : 'Tap to reveal') + '</button>';
  html += '</div>';
  return html;
}

/* ─── KP card (full detail: explanation + exam patterns + examples + MCQ) ─── */

function _renderLsKPCard(item) {
  var html = '<div class="ls-kp-card">';
  if (!item.kp) {
    html += '<div class="ls-kp-title">' + _escList(item.ref) + '</div>';
    html += '<div style="color:var(--c-text3);padding:16px">' + (appLang !== 'en' ? '\u77e5\u8bc6\u70b9\u6570\u636e\u672a\u52a0\u8f7d' : 'KP data not loaded') + '</div>';
    html += '</div>';
    return html;
  }
  var kp = item.kp;
  var isZh = (appLang !== 'en');

  /* Title */
  html += '<div class="kp-hero-title" style="font-size:18px">' + (typeof pqRender === 'function' ? pqRender(kp.title || item.ref) : _escList(kp.title || item.ref)) + '</div>';
  if (kp.title_zh) html += '<div class="kp-hero-sub">' + _escList(kp.title_zh) + '</div>';

  /* ① Explanation — concept cards */
  if (kp.explanation) {
    var expText = typeof kp.explanation === 'string' ? kp.explanation : (isZh && kp.explanation.zh ? kp.explanation.zh : (kp.explanation.en || ''));
    if (expText) {
      html += '<div class="kp-section">';
      html += '<div class="kp-section-header"><div class="kp-section-num">1</div>';
      html += '<div class="kp-section-labels"><div class="kp-section-label">' + (isZh ? '\u77e5\u8bc6\u70b9\u7cbe\u6790' : 'Explanation') + '</div></div></div>';
      var parsed = (typeof _splitExplanation === 'function') ? _splitExplanation(expText) : { intro: expText, concepts: [] };
      if (parsed.intro) {
        html += '<div class="kp-section-body">' + (typeof kpMarkdown === 'function' ? kpMarkdown(parsed.intro) : _escList(parsed.intro)) + '</div>';
      }
      if (parsed.concepts && parsed.concepts.length > 0) {
        html += '<div class="kp-concepts">';
        for (var ci = 0; ci < parsed.concepts.length; ci++) {
          var con = parsed.concepts[ci];
          html += '<div class="kp-concept">';
          html += '<div class="kp-concept-title">' + (typeof pqRender === 'function' ? pqRender(con.title) : _escList(con.title)) + '</div>';
          if (con.body) html += '<div class="kp-concept-body">' + (typeof kpMarkdown === 'function' ? kpMarkdown(con.body) : _escList(con.body)) + '</div>';
          html += '</div>';
        }
        html += '</div>';
      } else if (!parsed.intro) {
        html += '<div class="kp-section-body">' + (typeof kpMarkdown === 'function' ? kpMarkdown(expText) : _escList(expText)) + '</div>';
      }
      html += '</div>';
    }
  }

  /* ② Exam Patterns */
  if (kp.examPatterns && kp.examPatterns.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header"><div class="kp-section-num">2</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + (isZh ? '\u5178\u578b\u8003\u6cd5' : 'Exam Patterns') + '</div></div></div>';
    html += '<div class="kp-section-body">';
    for (var pi = 0; pi < kp.examPatterns.length; pi++) {
      var ep = kp.examPatterns[pi];
      html += '<div class="kp-pattern">';
      html += '<div class="kp-pattern-label">' + (typeof kpMarkdown === 'function' ? kpMarkdown(isZh && ep.label_zh ? ep.label_zh : ep.label) : _escList(ep.label)) + '</div>';
      var epDesc = isZh && ep.description_zh ? ep.description_zh : ep.description;
      if (epDesc) html += '<div class="kp-pattern-desc">' + (typeof kpMarkdown === 'function' ? kpMarkdown(epDesc) : _escList(epDesc)) + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  /* ③ Worked Examples */
  if (kp.examples && kp.examples.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header"><div class="kp-section-num">3</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + (isZh ? '\u5178\u578b\u4f8b\u9898' : 'Worked Examples') + '</div></div></div>';
    html += '<div class="kp-section-body">';
    for (var ei = 0; ei < kp.examples.length; ei++) {
      var ex = kp.examples[ei];
      html += '<div class="kp-example">';
      html += '<div class="kp-example-header">';
      html += '<span class="kp-example-num">' + (isZh ? '\u4f8b\u9898' : 'Example') + ' ' + (ei + 1) + '</span>';
      if (ex.source) html += '<span class="kp-example-source">' + _escList(ex.source) + '</span>';
      html += '</div>';
      html += '<div class="kp-example-q">' + (typeof kpMarkdown === 'function' ? kpMarkdown(isZh && ex.question_zh ? ex.question_zh : ex.question) : _escList(ex.question)) + '</div>';
      html += '<button class="kp-example-toggle" aria-expanded="false" data-ls-kp-sol="' + ei + '">' + (isZh ? '\u663e\u793a\u89e3\u6790' : 'Show Solution') + ' \u25bc</button>';
      html += '<div class="kp-example-solution" id="ls-kp-sol-' + ei + '">';
      html += (typeof kpMarkdown === 'function' ? kpMarkdown(isZh && ex.solution_zh ? ex.solution_zh : ex.solution) : _escList(ex.solution || ''));
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  /* ④ Test Yourself MCQ */
  if (kp.testYourself && kp.testYourself.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header"><div class="kp-section-num">4</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + (isZh ? '\u81ea\u6d4b' : 'Test Yourself') + '</div></div></div>';
    html += '<div class="kp-quiz-stack" data-ls-kp-quiz-id="' + kp.id + '" data-ls-kp-quiz-total="' + kp.testYourself.length + '">';
    for (var qi = 0; qi < kp.testYourself.length; qi++) {
      var tq = kp.testYourself[qi];
      if (!tq) continue;
      html += '<div class="kp-quiz-card" data-ls-kp-q-idx="' + qi + '">';
      html += '<div class="kp-quiz-q-num">' + (isZh ? '\u7b2c' : 'Q') + (qi + 1) + '</div>';
      html += '<div class="kp-quiz-question">' + (typeof kpMarkdown === 'function' ? kpMarkdown(isZh && tq.q_zh ? tq.q_zh : tq.q) : _escList(tq.q || '')) + '</div>';
      html += '<div class="kp-quiz-options">';
      for (var oi = 0; oi < tq.o.length; oi++) {
        html += '<button class="kp-quiz-opt" data-ls-kp-q="' + qi + '" data-ls-kp-opt="' + oi + '">' + (typeof pqRender === 'function' ? pqRender(tq.o[oi]) : _escList(tq.o[oi])) + '</button>';
      }
      html += '</div>';
      html += '<div class="kp-quiz-explain d-none" id="ls-kp-exp-' + qi + '"></div>';
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/* ─── PP card (past paper style) ─── */

function _renderLsPPCard(item) {
  var html = '<div class="ls-pp-card">';
  if (!item.question) {
    html += '<div style="color:var(--c-text3);padding:16px">' + (appLang !== 'en' ? '\u771f\u9898\u6570\u636e\u672a\u52a0\u8f7d' : 'PP data not loaded') + '</div>';
    html += '</div>';
    return html;
  }
  var q = item.question;

  /* Question header */
  html += '<div class="ls-pp-header">';
  html += '<strong>Q' + (q.num || q.id) + '</strong>';
  if (q.marks) html += ' <span style="color:var(--c-text3)">(' + q.marks + ' marks)</span>';
  if (q.src) html += ' <span style="color:var(--c-text3);font-size:12px">' + _escList(q.src) + '</span>';
  html += '</div>';

  /* Render question content */
  var qHtml = '';
  try {
    if (typeof _ppRenderWithMarks === 'function') qHtml += _ppRenderWithMarks(q, false);
    if (typeof _ppRenderFigures === 'function') qHtml += _ppRenderFigures(q);
  } catch(e) {}
  if (!qHtml) qHtml = '<div style="color:var(--c-text3)">' + _escList(q.id) + '</div>';

  html += '<div class="ls-pp-body">' + qHtml + '</div>';
  html += '</div>';
  return html;
}

/* ─── KaTeX rendering helper ─── */

function _lsRenderMath(el) {
  try {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ], throwOnError: false
      });
    }
  } catch(e) {}
  try {
    if (typeof pqRender === 'function') pqRender(el);
  } catch(e) {}
}

/* ─── Event binding ─── */

var _lsKeyHandler = null;

function _bindListStudyEvents(panel) {
  /* Back button */
  var backBtn = panel.querySelector('#ls-back');
  if (backBtn) backBtn.addEventListener('click', _exitListStudy);

  /* Reveal for vocab */
  var revealBtn = panel.querySelector('#ls-reveal-btn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function() {
      var defEl = panel.querySelector('#ls-reveal');
      if (defEl) defEl.style.visibility = 'visible';
      revealBtn.style.display = 'none';
    });
  }

  /* Rating buttons */
  panel.querySelectorAll('[data-ls-rate]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _rateListStudyItem(btn.dataset.lsRate);
    });
  });

  /* Nav buttons */
  var prevBtn = panel.querySelector('#ls-prev');
  if (prevBtn) prevBtn.addEventListener('click', function() { _lsGo(-1); });
  var nextBtn = panel.querySelector('#ls-next');
  if (nextBtn) nextBtn.addEventListener('click', function() { _lsGo(1); });
  var skipBtn = panel.querySelector('#ls-skip');
  if (skipBtn) skipBtn.addEventListener('click', function() { _lsGo(1); });

  /* Complete button */
  var completeBtn = panel.querySelector('#ls-complete');
  if (completeBtn) completeBtn.addEventListener('click', function() { _finishListStudy(); });

  /* Tab switching */
  panel.querySelectorAll('[data-ls-tab]').forEach(function(tabBtn) {
    tabBtn.addEventListener('click', function() {
      _switchLsTab(tabBtn.dataset.lsTab);
    });
  });

  /* KP solution toggle (delegated) */
  panel.querySelectorAll('[data-ls-kp-sol]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var solIdx = btn.getAttribute('data-ls-kp-sol');
      var solEl = document.getElementById('ls-kp-sol-' + solIdx);
      if (solEl) {
        var isOpen = solEl.classList.toggle('open');
        var isZh = (appLang !== 'en');
        btn.textContent = isOpen ? ((isZh ? '\u9690\u85cf\u89e3\u6790' : 'Hide Solution') + ' \u25b2') : ((isZh ? '\u663e\u793a\u89e3\u6790' : 'Show Solution') + ' \u25bc');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) _lsRenderMath(solEl);
      }
    });
  });

  /* KP MCQ option buttons */
  panel.querySelectorAll('[data-ls-kp-opt]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _handleLsKPMCQ(btn, panel);
    });
  });

  /* Keyboard: 1/2/3 for rating, ←/→ for nav, Escape to exit */
  if (_lsKeyHandler) document.removeEventListener('keydown', _lsKeyHandler);
  _lsKeyHandler = function(e) {
    if (!_listStudy) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '1') _rateListStudyItem('mastered');
    else if (e.key === '2') _rateListStudyItem('uncertain');
    else if (e.key === '3') _rateListStudyItem('learning');
    else if (e.key === 'ArrowLeft') _lsGo(-1);
    else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); _lsGo(1); }
    else if (e.key === 'Escape') _exitListStudy();
  };
  document.addEventListener('keydown', _lsKeyHandler);
}

/* ─── KP MCQ handler (scoped to list study) ─── */

function _handleLsKPMCQ(btn, panel) {
  var qi = parseInt(btn.getAttribute('data-ls-kp-q'));
  var oi = parseInt(btn.getAttribute('data-ls-kp-opt'));
  if (!_listStudy) return;
  var tab = _listStudy.tabs.kp;
  var item = tab.items[tab.idx];
  if (!item || !item.kp || !item.kp.testYourself) return;
  var tq = item.kp.testYourself[qi];
  if (!tq) return;

  /* Prevent re-answering */
  var qCard = btn.closest('.kp-quiz-card');
  if (qCard && qCard.classList.contains('answered')) return;
  if (qCard) qCard.classList.add('answered');

  var ansIdx = tq.a;
  var isCorrect = oi === ansIdx;

  /* Highlight correct/wrong */
  var allOpts = panel.querySelectorAll('[data-ls-kp-q="' + qi + '"]');
  for (var oii = 0; oii < allOpts.length; oii++) {
    allOpts[oii].disabled = true;
    if (parseInt(allOpts[oii].getAttribute('data-ls-kp-opt')) === ansIdx) allOpts[oii].classList.add('correct');
  }
  if (!isCorrect) btn.classList.add('wrong');

  /* Sound */
  if (isCorrect && typeof playCorrect === 'function') playCorrect();
  if (!isCorrect && typeof playWrong === 'function') playWrong();

  /* Show explanation */
  var isZh = (appLang !== 'en');
  var expText = isZh && tq.e_zh ? tq.e_zh : tq.e;
  var expEl = document.getElementById('ls-kp-exp-' + qi);
  if (expEl && expText) {
    var mark = isCorrect ? '\u2705 ' : '\u274c ';
    expEl.innerHTML = mark + '<strong>' + (isZh ? '\u89e3\u6790' : 'Explanation') + ':</strong> ' + (typeof kpMarkdown === 'function' ? kpMarkdown(expText) : _escList(expText));
    expEl.classList.remove('d-none');
    _lsRenderMath(expEl);
  }
}

/* ─── Tab switching ─── */

function _switchLsTab(tabId) {
  if (!_listStudy || !_listStudy.tabs[tabId] || _listStudy.tabs[tabId].items.length === 0) return;
  if (_listStudy.activeTab === tabId) return;
  _listStudy.activeTab = tabId;
  _renderListStudyWorkbench();
}

function _getNextUnratedTab() {
  if (!_listStudy) return null;
  for (var ti = 0; ti < _LS_TAB_ORDER.length; ti++) {
    var tabId = _LS_TAB_ORDER[ti];
    var tabData = _listStudy.tabs[tabId];
    if (tabData.items.length === 0) continue;
    if (Object.keys(tabData.rated).length < tabData.items.length) return tabId;
  }
  return null;
}

/* ─── Rating (tab-scoped) ─── */

function _rateListStudyItem(newFs) {
  if (!_listStudy) return;
  var tabId = _listStudy.activeTab;
  var tab = _listStudy.tabs[tabId];
  var item = tab.items[tab.idx];
  if (!item) return;
  var ref = item.ref;
  var type = item.type;

  /* Write-through to global FLM */
  if (type === 'vocab') {
    if (newFs === 'mastered' && typeof recordScan === 'function') recordScan(ref, 'known', 1);
    else if (newFs === 'uncertain' && typeof recordScan === 'function') recordScan(ref, 'fuzzy', 1);
    else if (newFs === 'learning' && typeof recordScan === 'function') recordScan(ref, 'unknown', 1);
  } else if (type === 'kp') {
    if (newFs === 'mastered' && typeof saveKPResult === 'function') saveKPResult(ref, 10, 10);
    else if (newFs === 'uncertain' && typeof saveKPResult === 'function') saveKPResult(ref, 7, 10);
    else if (newFs === 'learning' && typeof saveKPResult === 'function') saveKPResult(ref, 3, 10);
  } else if (type === 'pp' && typeof _ppSetMastery === 'function') {
    if (newFs === 'mastered') _ppSetMastery(ref, 'mastered', { source: 'practice' });
    else if (newFs === 'uncertain') _ppSetMastery(ref, 'partial', { source: 'practice' });
    else if (newFs === 'learning') _ppSetMastery(ref, 'needs_work', { source: 'practice' });
  }

  /* Update learnedAt */
  if (typeof updateItemLearnedAt === 'function') updateItemLearnedAt(_listStudy.listId, type, ref);

  /* Record rated state in current tab */
  tab.rated[type + ':' + ref] = newFs;

  /* Visual feedback */
  var card = document.querySelector('.ls-card');
  if (card) {
    var feedbackClass = newFs === 'mastered' ? 'ls-flash-green' : newFs === 'uncertain' ? 'ls-flash-amber' : 'ls-flash-purple';
    card.classList.add(feedbackClass);
  }

  if (typeof playCorrect === 'function' && newFs === 'mastered') playCorrect();

  /* Auto advance after delay */
  setTimeout(function() {
    if (!_listStudy) return;
    var curTab = _listStudy.tabs[_listStudy.activeTab];
    if (curTab.idx < curTab.items.length - 1) {
      /* Next item in current tab */
      curTab.idx++;
      _renderListStudyWorkbench();
    } else {
      /* Current tab exhausted — find next unrated tab */
      var nextTab = _getNextUnratedTab();
      if (nextTab && nextTab !== _listStudy.activeTab) {
        _listStudy.activeTab = nextTab;
        _renderListStudyWorkbench();
      } else if (!nextTab || Object.keys(curTab.rated).length >= curTab.items.length) {
        /* All tabs complete */
        _finishListStudy();
      } else {
        _renderListStudyWorkbench();
      }
    }
  }, 500);
}

/* ─── Navigation (tab-scoped) ─── */

function _lsGo(delta) {
  if (!_listStudy) return;
  var tab = _listStudy.tabs[_listStudy.activeTab];
  var newIdx = tab.idx + delta;
  if (newIdx < 0 || newIdx >= tab.items.length) return;
  tab.idx = newIdx;
  _renderListStudyWorkbench();
}

/* ─── Exit / Finish ─── */

function _exitListStudy() {
  if (!_listStudy) return;
  var listId = _listStudy.listId;

  /* Record session if any items were rated */
  var anyRated = false;
  for (var ti = 0; ti < _LS_TAB_ORDER.length; ti++) {
    if (Object.keys(_listStudy.tabs[_LS_TAB_ORDER[ti]].rated).length > 0) { anyRated = true; break; }
  }
  if (anyRated) {
    var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
    if (list) {
      var results = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
      for (var j = 0; j < list.items.length; j++) {
        var fst = _resolveItemFLM(list.items[j].type, list.items[j].ref) || 'new';
        results[fst] = (results[fst] || 0) + 1;
      }
      if (typeof recordListSession === 'function') recordListSession(listId, results);
    }
  }

  /* Cleanup keyboard handler */
  if (_lsKeyHandler) { document.removeEventListener('keydown', _lsKeyHandler); _lsKeyHandler = null; }
  _listStudy = null;
  if (typeof navTo === 'function') navTo('lists');
}

function _finishListStudy() {
  if (!_listStudy) return;
  var ls = _listStudy;
  var zh = (appLang !== 'en');
  var panel = E('panel-study');
  if (!panel) return;

  /* Tally results per type */
  var typeCounts = {};
  var totalCounts = { mastered: 0, uncertain: 0, learning: 0, skipped: 0 };
  for (var ti = 0; ti < _LS_TAB_ORDER.length; ti++) {
    var tabId = _LS_TAB_ORDER[ti];
    var tabData = ls.tabs[tabId];
    if (tabData.items.length === 0) continue;
    var tc = { mastered: 0, uncertain: 0, learning: 0, skipped: 0 };
    for (var ii = 0; ii < tabData.items.length; ii++) {
      var key = tabData.items[ii].type + ':' + tabData.items[ii].ref;
      var r = tabData.rated[key];
      if (r) { tc[r] = (tc[r] || 0) + 1; totalCounts[r]++; }
      else { tc.skipped++; totalCounts.skipped++; }
    }
    typeCounts[tabId] = tc;
  }

  var totalItems = ls.allItems.length;

  var html = '<div class="ls-finish">';
  html += '<h2>' + (zh ? '\u6e05\u5355\u5b66\u4e60\u5b8c\u6210!' : 'List Study Complete!') + '</h2>';
  html += '<div class="ls-finish-title">' + _escList(ls.listTitle) + ' (' + totalItems + (zh ? ' \u9879)' : ' items)') + '</div>';

  /* Per-type breakdown */
  html += '<div class="ls-finish-breakdown">';
  for (var fi = 0; fi < _LS_TAB_ORDER.length; fi++) {
    var ftId = _LS_TAB_ORDER[fi];
    if (!typeCounts[ftId]) continue;
    var ftc = typeCounts[ftId];
    var ftLabel = zh ? _LS_TAB_LABELS[ftId].zh : _LS_TAB_LABELS[ftId].en;
    html += '<div class="ls-finish-type-row">';
    html += '<span class="ls-type-badge ls-type-' + ftId + '" style="font-size:10px">' + ftLabel + '</span>';
    if (ftc.mastered) html += ' <span style="color:var(--c-success)">' + ftc.mastered + ' ' + (zh ? '\u638c\u63e1' : 'M') + '</span>';
    if (ftc.uncertain) html += ' <span style="color:var(--c-warning)">' + ftc.uncertain + ' ' + (zh ? '\u6a21\u7cca' : 'U') + '</span>';
    if (ftc.learning) html += ' <span style="color:var(--c-primary)">' + ftc.learning + ' ' + (zh ? '\u5b66\u4e60\u4e2d' : 'L') + '</span>';
    if (ftc.skipped) html += ' <span style="color:var(--c-text3)">' + ftc.skipped + ' ' + (zh ? '\u8df3\u8fc7' : 'Skip') + '</span>';
    html += '</div>';
  }
  html += '</div>';

  /* Total summary */
  html += '<div class="ls-finish-stats">';
  if (totalCounts.mastered) html += '<div class="ls-finish-stat" style="color:var(--c-success)">' + totalCounts.mastered + ' ' + (zh ? '\u638c\u63e1' : 'Mastered') + '</div>';
  if (totalCounts.uncertain) html += '<div class="ls-finish-stat" style="color:var(--c-warning)">' + totalCounts.uncertain + ' ' + (zh ? '\u6a21\u7cca' : 'Uncertain') + '</div>';
  if (totalCounts.learning) html += '<div class="ls-finish-stat" style="color:var(--c-primary)">' + totalCounts.learning + ' ' + (zh ? '\u5b66\u4e60\u4e2d' : 'Learning') + '</div>';
  if (totalCounts.skipped) html += '<div class="ls-finish-stat" style="color:var(--c-text3)">' + totalCounts.skipped + ' ' + (zh ? '\u8df3\u8fc7' : 'Skipped') + '</div>';
  html += '</div>';

  html += '<div class="ls-finish-actions">';
  html += '<button class="btn btn-primary" id="ls-finish-back">' + (zh ? '\u8fd4\u56de\u6e05\u5355' : 'Back to Lists') + '</button>';
  html += '<button class="btn btn-ghost" id="ls-finish-restart">' + (zh ? '\u518d\u5b66\u4e00\u6b21' : 'Study Again') + '</button>';
  html += '</div></div>';

  panel.innerHTML = html;

  /* Record session */
  var list = typeof getCustomList === 'function' ? getCustomList(ls.listId) : null;
  if (list) {
    var results = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
    for (var j = 0; j < list.items.length; j++) {
      var fst = _resolveItemFLM(list.items[j].type, list.items[j].ref) || 'new';
      results[fst] = (results[fst] || 0) + 1;
    }
    if (typeof recordListSession === 'function') recordListSession(ls.listId, results);
  }

  panel.querySelector('#ls-finish-back').addEventListener('click', function() {
    if (_lsKeyHandler) { document.removeEventListener('keydown', _lsKeyHandler); _lsKeyHandler = null; }
    _listStudy = null;
    if (typeof navTo === 'function') navTo('lists');
  });
  panel.querySelector('#ls-finish-restart').addEventListener('click', function() {
    var lid = ls.listId;
    if (_lsKeyHandler) { document.removeEventListener('keydown', _lsKeyHandler); _lsKeyHandler = null; }
    _listStudy = null;
    startListStudy(lid);
  });
}
