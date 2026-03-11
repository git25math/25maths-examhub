/* ══════════════════════════════════════════════════════════════
   lists.js — Learning Items List View + Custom Lists + List Scan
   v4.7.0: Tabbed list view with 7-dimension filtering, sorting,
   bulk actions, and custom list management with session tracking.
   ══════════════════════════════════════════════════════════════ */

var _listTab = 'words';   /* words | kps | pps | mylists */
var _listFilters = { status: 'all', section: 'all', board: 'all', dateFrom: '', dateTo: '', reforget: 'all', search: '' };
var _listSort = { col: 'word', asc: true };
var _listSelected = {};   /* { 'vocab:L_3_W12': true, ... } */
var _listPage = 0;
var _listPageSize = (function() { try { var v = parseInt(localStorage.getItem('list_pagesize')); return v > 0 ? v : 50; } catch(e) { return 50; } })();
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

  /* Header */
  html += '<h2 class="section-title">' + (zh ? '\u5b66\u4e60\u9879\u76ee' : 'Learning Items') + '</h2>';

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
      _listFilters = { status: 'all', section: 'all', board: 'all', dateFrom: '', dateTo: '', reforget: 'all', search: '' };
      renderListView();
    });
  });

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

function _renderListFilters(zh) {
  var html = '<div class="list-filter-bar">';

  /* Status filter */
  html += '<select class="list-filter-select" id="lf-status">';
  html += '<option value="all">' + (zh ? '\u5168\u90e8\u72b6\u6001' : 'All Status') + '</option>';
  html += '<option value="mastered"' + (_listFilters.status === 'mastered' ? ' selected' : '') + '>' + (zh ? '\u5df2\u638c\u63e1' : 'Mastered') + '</option>';
  html += '<option value="uncertain"' + (_listFilters.status === 'uncertain' ? ' selected' : '') + '>' + (zh ? '\u4e0d\u786e\u5b9a' : 'Uncertain') + '</option>';
  html += '<option value="learning"' + (_listFilters.status === 'learning' ? ' selected' : '') + '>' + (zh ? '\u5b66\u4e60\u4e2d' : 'Learning') + '</option>';
  html += '<option value="new"' + (_listFilters.status === 'new' ? ' selected' : '') + '>' + (zh ? '\u65b0' : 'New') + '</option>';
  html += '</select>';

  /* Board filter (for kps/pps) */
  if (_listTab === 'kps' || _listTab === 'pps') {
    html += '<select class="list-filter-select" id="lf-board">';
    html += '<option value="all">' + (zh ? '\u5168\u90e8\u8003\u8bd5\u5c40' : 'All Boards') + '</option>';
    var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
    for (var bi = 0; bi < boards.length; bi++) {
      var bid = boards[bi].id || boards[bi];
      var bl = bid === 'cie' ? 'CIE 0580' : bid === 'edx' ? 'Edexcel 4MA1' : bid;
      html += '<option value="' + bid + '"' + (_listFilters.board === bid ? ' selected' : '') + '>' + bl + '</option>';
    }
    html += '</select>';
  }

  /* Section filter — populated dynamically from current tab data */
  html += '<select class="list-filter-select" id="lf-section">';
  html += '<option value="all">' + (zh ? '全部章节' : 'All Sections') + '</option>';
  var secSet = _collectSections();
  for (var si2 = 0; si2 < secSet.length; si2++) {
    html += '<option value="' + secSet[si2] + '"' + (_listFilters.section === secSet[si2] ? ' selected' : '') + '>' + secSet[si2] + '</option>';
  }
  html += '</select>';

  /* Re-forget filter */
  html += '<select class="list-filter-select" id="lf-reforget">';
  html += '<option value="all">' + (zh ? '\u5168\u90e8\u9057\u5fd8' : 'Re-forget: All') + '</option>';
  html += '<option value="1"' + (_listFilters.reforget === '1' ? ' selected' : '') + '>1+</option>';
  html += '<option value="2"' + (_listFilters.reforget === '2' ? ' selected' : '') + '>2+</option>';
  html += '<option value="3"' + (_listFilters.reforget === '3' ? ' selected' : '') + '>3+</option>';
  html += '</select>';

  /* Date range */
  html += '<input type="date" class="list-filter-select list-date-input" id="lf-date-from" value="' + (_listFilters.dateFrom || '') + '" title="' + (zh ? '\u4ece' : 'From') + '">';
  html += '<span class="list-date-sep">~</span>';
  html += '<input type="date" class="list-filter-select list-date-input" id="lf-date-to" value="' + (_listFilters.dateTo || '') + '" title="' + (zh ? '\u5230' : 'To') + '">';

  /* Search */
  html += '<input type="text" class="list-search" id="lf-search" placeholder="' + (zh ? '\u641c\u7d22...' : 'Search...') + '" value="' + _escList(_listFilters.search || '') + '">';

  html += '</div>';
  return html;
}

function _bindListFilters(el) {
  var selectors = ['lf-status', 'lf-section', 'lf-board', 'lf-reforget', 'lf-date-from', 'lf-date-to', 'lf-search'];
  var keys = ['status', 'section', 'board', 'reforget', 'dateFrom', 'dateTo', 'search'];
  for (var i = 0; i < selectors.length; i++) {
    var input = el.querySelector('#' + selectors[i]);
    if (input) {
      (function(key) {
        input.addEventListener('change', function() { _listFilters[key] = this.value; _listPage = 0; _renderListTable(); });
        if (key === 'search') {
          var _searchTimer = null;
          input.addEventListener('input', function() {
            _listFilters[key] = this.value; _listPage = 0;
            clearTimeout(_searchTimer);
            _searchTimer = setTimeout(_renderListTable, 250);
          });
        }
      })(keys[i]);
    }
  }
}

/* ═══ DATA SOURCES ═══ */

function _collectSections() {
  var seen = {};
  var result = [];
  if (_listTab === 'words') {
    if (typeof LEVELS !== 'undefined') {
      for (var i = 0; i < LEVELS.length; i++) {
        var s = LEVELS[i].slug || '';
        if (s && !seen[s]) { seen[s] = true; result.push(s); }
      }
    }
  } else if (_listTab === 'kps' || _listTab === 'pps') {
    var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
    for (var bi = 0; bi < boards.length; bi++) {
      var b = boards[bi].id || boards[bi];
      if (b !== 'cie' && b !== 'edx') continue;
      var syl = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[b] : null;
      if (!syl || !syl.chapters) continue;
      for (var ci = 0; ci < syl.chapters.length; ci++) {
        var secs = syl.chapters[ci].sections || [];
        for (var si = 0; si < secs.length; si++) {
          var sid = secs[si].id;
          if (sid && !seen[sid]) { seen[sid] = true; result.push(sid); }
        }
      }
    }
  }
  return result;
}

function _getFilteredWords() {
  var all = typeof getAllWords === 'function' ? getAllWords() : [];
  var items = [];
  for (var i = 0; i < all.length; i++) {
    var w = all[i];
    var lvObj = (typeof LEVELS !== 'undefined' && w.level >= 0 && w.level < LEVELS.length) ? LEVELS[w.level] : null;
    items.push({
      _type: 'vocab', _ref: w.key, _id: 'vocab:' + w.key,
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
    if (board !== 'cie' && board !== 'edx') continue;
    var syllabus = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[board] : null;
    if (!syllabus || !syllabus.chapters) continue;
    for (var ci = 0; ci < syllabus.chapters.length; ci++) {
      var ch = syllabus.chapters[ci];
      if (!ch.sections) continue;
      for (var si = 0; si < ch.sections.length; si++) {
        var sec = ch.sections[si];
        /* Get KP data for this section if available */
        var kpList = _getKPsForSection(sec.id, board);
        for (var ki = 0; ki < kpList.length; ki++) {
          var kp = kpList[ki];
          var kpResult = typeof getKPResult === 'function' ? getKPResult(kp.id) : null;
          items.push({
            _type: 'kp', _ref: kp.id, _id: 'kp:' + kp.id, _board: board,
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
      items.push({
        _type: 'pp', _ref: q.id, _id: 'pp:' + q.id, _board: board,
        word: q.id, def: q.src || '', fs: m.fs || 'new',
        section: q.section || '', lr: m.t || null, rc: m.rc || 0,
        marks: q.marks || 0,
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

    /* Status filter */
    if (f.status !== 'all' && item.fs !== f.status) continue;

    /* Section filter */
    if (f.section !== 'all' && (item.section || '') !== f.section) continue;

    /* Board filter */
    if (f.board !== 'all' && item._board && item._board !== f.board) continue;

    /* Re-forget filter */
    if (f.reforget !== 'all') {
      var minRf = parseInt(f.reforget) || 0;
      if ((item.reforget || 0) < minRf) continue;
    }

    /* Date range filter (based on lr) */
    if (f.dateFrom && item.lr) {
      var fromTs = new Date(f.dateFrom).getTime();
      if (item.lr < fromTs) continue;
    }
    if (f.dateTo && item.lr) {
      var toTs = new Date(f.dateTo).getTime() + 86400000;
      if (item.lr > toTs) continue;
    }
    if ((f.dateFrom || f.dateTo) && !item.lr) continue;

    /* Search filter */
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
  if (_listData.length > _listPageSize) {
    var totalPages = Math.ceil(_listData.length / _listPageSize);
    html += '<div class="list-pagination">';
    if (_listPage > 0) html += '<button class="btn btn-sm btn-ghost" data-listpage="' + (_listPage - 1) + '">\u2039 ' + (zh ? '\u4e0a\u4e00\u9875' : 'Prev') + '</button>';
    var pgStart = Math.max(0, _listPage - 4);
    var pgEnd = Math.min(totalPages, pgStart + 9);
    if (pgStart > 0) html += '<button class="btn btn-sm btn-ghost" data-listpage="0">1</button><span style="padding:0 4px;color:var(--c-text3)">\u2026</span>';
    for (var ps = pgStart; ps < pgEnd; ps++) {
      html += '<button class="btn btn-sm' + (ps === _listPage ? ' btn-primary' : ' btn-ghost') + '" data-listpage="' + ps + '">' + (ps + 1) + '</button>';
    }
    if (pgEnd < totalPages) html += '<span style="padding:0 4px;color:var(--c-text3)">\u2026</span><button class="btn btn-sm btn-ghost" data-listpage="' + (totalPages - 1) + '">' + totalPages + '</button>';
    if (_listPage < totalPages - 1) html += '<button class="btn btn-sm btn-ghost" data-listpage="' + (_listPage + 1) + '">' + (zh ? '\u4e0b\u4e00\u9875' : 'Next') + ' \u203a</button>';
    if (_listData.length > 100 && _listPageSize < 100) html += '<button class="btn btn-sm btn-ghost" data-listpagesize="100">' + (zh ? '\u663e\u793a100' : 'Show 100') + '</button>';
    if (_listData.length <= 500) html += '<button class="btn btn-sm btn-ghost" data-listpagesize="all">' + (zh ? '\u5168\u90e8' : 'Show All') + '</button>';
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
      if (btn.dataset.listpagesize === 'all') { _listPageSize = 99999; }
      else { _listPageSize = parseInt(btn.dataset.listpagesize) || 50; }
      _listPage = 0;
      try { if (_listPageSize < 99999) localStorage.setItem('list_pagesize', String(_listPageSize)); } catch(e) {}
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
        _doAddSelectedToList(btn.dataset.addlist);
        if (typeof hideModal === 'function') hideModal();
      });
    });
    var createBtn = card.querySelector('#create-and-add');
    if (createBtn) {
      createBtn.addEventListener('click', function() {
        var title = (card.querySelector('#new-list-title') || {}).value || 'Untitled';
        var newList = createCustomList(title);
        _doAddSelectedToList(newList.id);
        if (typeof hideModal === 'function') hideModal();
      });
    }
  }, 150);
}

function _doAddSelectedToList(listId) {
  var items = [];
  var keys = Object.keys(_listSelected);
  for (var i = 0; i < keys.length; i++) {
    var parts = keys[i].split(':');
    if (parts.length >= 2) {
      items.push({ type: parts[0], ref: parts.slice(1).join(':') });
    }
  }
  if (items.length > 0 && typeof addItemsToList === 'function') {
    addItemsToList(listId, items);
    var zh = (appLang !== 'en');
    if (typeof showToast === 'function') showToast(zh ? items.length + ' \u9879\u5df2\u52a0\u5165\u6e05\u5355' : items.length + ' items added');
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

  var html = '<div style="padding:8px 0">';

  /* Create button */
  html += '<button class="btn btn-primary btn-sm" id="cl-create-btn" style="margin-bottom:12px">';
  html += '+ ' + (zh ? '\u65b0\u5efa\u6e05\u5355' : 'Create New List');
  html += '</button>';

  if (lists.length === 0) {
    html += '<div style="text-align:center;padding:40px;color:var(--c-text3)">';
    html += zh ? '\u8fd8\u6ca1\u6709\u81ea\u5b9a\u4e49\u6e05\u5355' : 'No custom lists yet';
    html += '</div>';
  } else {
    /* Card grid */
    html += '<div class="cl-grid">';
    for (var i = 0; i < lists.length; i++) {
      var cl = lists[i];
      var itemCounts = _countListItems(cl);
      var lastSession = cl.sessions && cl.sessions.length > 0 ? cl.sessions[cl.sessions.length - 1] : null;
      html += '<div class="cl-card" data-clid="' + _escList(cl.id) + '">';
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

      /* FLM stats bar */
      html += _renderListStatsBar(cl);

      /* Session history timeline */
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
      html += '<button class="btn btn-sm btn-primary cl-scan-btn" data-clid="' + _escList(cl.id) + '">' + (zh ? '\u5f00\u59cb Scan' : 'Scan') + '</button>';
      html += '<button class="btn btn-sm btn-ghost cl-record-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u8865\u5f55' : 'Record') + '" title="' + (zh ? '\u8865\u5f55\u5b66\u4e60\u7ed3\u679c' : 'Record Results') + '">\ud83d\udcdd</button>';
      html += '<button class="btn btn-sm btn-ghost cl-rename-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u91cd\u547d\u540d' : 'Rename') + '">\u270f\ufe0f</button>';
      html += '<button class="btn btn-sm btn-ghost cl-delete-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u5220\u9664' : 'Delete') + '">\ud83d\uddd1\ufe0f</button>';
      html += '<button class="btn btn-sm btn-ghost cl-print-btn" data-clid="' + _escList(cl.id) + '" aria-label="' + (zh ? '\u6253\u5370' : 'Print') + '">\ud83d\udda8\ufe0f</button>';
      html += '</div>';

      /* Expandable item list */
      html += '<div class="cl-card-items" id="cl-items-' + _escList(cl.id) + '" style="display:none">';
      html += _renderListItemsPreview(cl);
      html += '</div>';

      html += '</div>';
    }
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
