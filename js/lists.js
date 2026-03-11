/* ══════════════════════════════════════════════════════════════
   lists.js — Learning Items List View + Custom Lists + List Scan
   v4.7.0: Tabbed list view with 7-dimension filtering, sorting,
   bulk actions, and custom list management with session tracking.
   ══════════════════════════════════════════════════════════════ */

var _listTab = 'words';   /* words | kps | pps | mylists */
var _listFilters = { status: 'all', section: 'all', board: 'all', dateFrom: '', dateTo: '', reforget: 'all', search: '', listId: '' };
var _listSort = { col: 'word', asc: true };
var _listSelected = {};   /* { 'vocab:L_3_W12': true, ... } */
var _listPage = 0;
var _listPageSize = 50;
var _listData = [];       /* current filtered+sorted data */

/* ═══ ENTRY POINT ═══ */

function renderListView() {
  var el = document.getElementById('panel-lists');
  if (!el) return;
  var lang = typeof getLang === 'function' ? getLang() : 'en';
  var zh = lang === 'zh';
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
      _listSort = { col: 'word', asc: true };
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
    var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : ['cie'];
    for (var bi = 0; bi < boards.length; bi++) {
      var bl = boards[bi] === 'cie' ? 'CIE 0580' : boards[bi] === 'edx' ? 'Edexcel 4MA1' : boards[bi].toUpperCase();
      html += '<option value="' + boards[bi] + '"' + (_listFilters.board === boards[bi] ? ' selected' : '') + '>' + bl + '</option>';
    }
    html += '</select>';
  }

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
  html += '<input type="text" class="list-search" id="lf-search" placeholder="' + (zh ? '\u641c\u7d22...' : 'Search...') + '" value="' + (_listFilters.search || '') + '">';

  html += '</div>';
  return html;
}

function _bindListFilters(el) {
  var selectors = ['lf-status', 'lf-board', 'lf-reforget', 'lf-date-from', 'lf-date-to', 'lf-search'];
  var keys = ['status', 'board', 'reforget', 'dateFrom', 'dateTo', 'search'];
  for (var i = 0; i < selectors.length; i++) {
    var input = el.querySelector('#' + selectors[i]);
    if (input) {
      (function(key) {
        input.addEventListener('change', function() { _listFilters[key] = this.value; _listPage = 0; _renderListTable(); });
        if (key === 'search') {
          input.addEventListener('input', function() { _listFilters[key] = this.value; _listPage = 0; _renderListTable(); });
        }
      })(keys[i]);
    }
  }
}

/* ═══ DATA SOURCES ═══ */

function _getFilteredWords() {
  var all = typeof getAllWords === 'function' ? getAllWords() : [];
  var items = [];
  for (var i = 0; i < all.length; i++) {
    var w = all[i];
    items.push({
      _type: 'vocab', _ref: w.key, _id: 'vocab:' + w.key,
      word: w.word || '', def: w.def || '', fs: w.fs || 'new',
      section: '', lr: w.fmt || null, rc: w.rc || 0,
      reforget: typeof getReforgetCount === 'function' ? getReforgetCount(w.key) : 0
    });
  }
  return items;
}

function _getFilteredKPs() {
  var items = [];
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  for (var bi = 0; bi < boards.length; bi++) {
    var board = boards[bi];
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
  /* Try knowledge data first */
  var kpData = (typeof _kpData !== 'undefined') ? _kpData[board] : null;
  if (kpData && kpData.kps) {
    var result = [];
    for (var i = 0; i < kpData.kps.length; i++) {
      if (kpData.kps[i].section === sectionId) result.push(kpData.kps[i]);
    }
    if (result.length > 0) return result;
  }
  return [];
}

function _getFilteredPPs() {
  var items = [];
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  for (var bi = 0; bi < boards.length; bi++) {
    var board = boards[bi];
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
  var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';

  /* Get data */
  var raw;
  if (_listTab === 'words') raw = _getFilteredWords();
  else if (_listTab === 'kps') raw = _getFilteredKPs();
  else if (_listTab === 'pps') raw = _getFilteredPPs();
  else raw = [];

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
  html += '<th style="width:32px"><input type="checkbox" id="list-check-all"></th>';

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
    if (!cols[ci].nosort && _listSort.col === cols[ci].id) {
      sortIcon = _listSort.asc ? ' \u25b2' : ' \u25bc';
    }
    html += '<th data-sortcol="' + cols[ci].id + '"' + (cols[ci].nosort ? '' : ' class="list-th-sort"') + '>';
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
    html += '<td><input type="checkbox" class="list-row-check"' + (sel ? ' checked' : '') + '></td>';
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
    for (var ps = 0; ps < Math.min(totalPages, 20); ps++) {
      html += '<button class="btn btn-sm' + (ps === _listPage ? ' btn-primary' : ' btn-ghost') + '" data-listpage="' + ps + '">' + (ps + 1) + '</button>';
    }
    html += '<button class="btn btn-sm btn-ghost" data-listpagesize="100">' + (zh ? '\u663e\u793a100' : 'Show 100') + '</button>';
    html += '<button class="btn btn-sm btn-ghost" data-listpagesize="all">' + (zh ? '\u5168\u90e8' : 'Show All') + '</button>';
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
  var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
  var lists = typeof getCustomLists === 'function' ? getCustomLists() : [];
  var html = '<div style="padding:16px">';
  html += '<h3>' + (zh ? '\u52a0\u5165\u6e05\u5355' : 'Add to List') + '</h3>';

  if (lists.length > 0) {
    html += '<div style="margin:12px 0">';
    for (var i = 0; i < lists.length; i++) {
      html += '<button class="btn btn-sm btn-ghost" style="margin:4px" data-addlist="' + lists[i].id + '">' + _escList(lists[i].title) + ' (' + lists[i].items.length + ')</button>';
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
  setTimeout(function() {
    var card = document.getElementById('modal-card');
    if (!card) return;
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
  }, 50);
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
    var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
    if (typeof showToast === 'function') showToast(zh ? items.length + ' \u9879\u5df2\u52a0\u5165\u6e05\u5355' : items.length + ' items added');
  }
  _listSelected = {};
  _renderListTable();
}

/* ═══ EXPORT CSV ═══ */

function _exportSelectedCSV() {
  var keys = Object.keys(_listSelected);
  if (keys.length === 0) return;
  var rows = [['Type', 'ID', 'Word/Title', 'Definition', 'Status', 'Re-forget']];
  for (var i = 0; i < _listData.length; i++) {
    var d = _listData[i];
    if (!_listSelected[d._id]) continue;
    rows.push([d._type, d._ref, d.word || '', d.def || '', d.fs || '', String(d.reforget || 0)]);
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
  var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
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
      html += '<div class="cl-card" data-clid="' + cl.id + '">';
      html += '<div class="cl-card-title">' + _escList(cl.title) + '</div>';
      html += '<div class="cl-card-meta">' + cl.items.length + ' ' + (zh ? '\u9879' : 'items');
      if (itemCounts.v) html += ' (' + itemCounts.v + 'V';
      if (itemCounts.k) html += '+' + itemCounts.k + 'K';
      if (itemCounts.p) html += '+' + itemCounts.p + 'P';
      if (itemCounts.v || itemCounts.k || itemCounts.p) html += ')';
      html += '</div>';
      if (lastSession) {
        html += '<div class="cl-card-meta">' + (zh ? '\u4e0a\u6b21: ' : 'Last: ') + lastSession.ts.slice(0, 10) + '</div>';
      }

      /* Session history timeline */
      if (cl.sessions && cl.sessions.length > 0) {
        html += '<div class="cl-session-timeline">';
        for (var si = 0; si < Math.min(cl.sessions.length, 5); si++) {
          var sess = cl.sessions[si];
          var r = sess.results || {};
          html += '<span class="cl-session-dot" title="' + sess.ts.slice(0, 10) + ': ' + (r.mastered || 0) + 'M/' + (r.uncertain || 0) + 'U/' + (r.learning || 0) + 'L">';
          html += '#' + (si + 1);
          html += '</span>';
        }
        html += '</div>';
      }

      html += '<div class="cl-card-actions">';
      html += '<button class="btn btn-sm btn-primary cl-scan-btn" data-clid="' + cl.id + '">' + (zh ? '\u5f00\u59cb Scan' : 'Scan') + '</button>';
      html += '<button class="btn btn-sm btn-ghost cl-rename-btn" data-clid="' + cl.id + '">\u270f\ufe0f</button>';
      html += '<button class="btn btn-sm btn-ghost cl-delete-btn" data-clid="' + cl.id + '">\ud83d\uddd1\ufe0f</button>';
      html += '<button class="btn btn-sm btn-ghost cl-print-btn" data-clid="' + cl.id + '">\ud83d\udda8\ufe0f</button>';
      html += '</div>';

      /* Expandable item list */
      html += '<div class="cl-card-items" id="cl-items-' + cl.id + '" style="display:none">';
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
      var zh2 = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
      var title = prompt(zh2 ? '\u6e05\u5355\u540d\u79f0:' : 'List name:', '');
      if (title) {
        createCustomList(title);
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
      if (itemsEl) itemsEl.style.display = itemsEl.style.display === 'none' ? 'block' : 'none';
    });
  });

  el.querySelectorAll('.cl-scan-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { startListScan(btn.dataset.clid); });
  });

  el.querySelectorAll('.cl-rename-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var zh2 = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
      var newTitle = prompt(zh2 ? '\u65b0\u540d\u79f0:' : 'New name:', '');
      if (newTitle) { renameCustomList(btn.dataset.clid, newTitle); _renderMyLists(); }
    });
  });

  el.querySelectorAll('.cl-delete-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var zh2 = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
      if (confirm(zh2 ? '\u786e\u5b9a\u5220\u9664\u8fd9\u4e2a\u6e05\u5355\uff1f' : 'Delete this list?')) {
        deleteCustomList(btn.dataset.clid);
        _renderMyLists();
      }
    });
  });

  el.querySelectorAll('.cl-print-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var list = typeof getCustomList === 'function' ? getCustomList(btn.dataset.clid) : null;
      if (list && typeof printCustomList === 'function') printCustomList(list);
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
  var html = '<table class="list-table" style="font-size:12px;margin-top:8px"><thead><tr>';
  html += '<th>Type</th><th>ID</th><th>Status</th>';
  html += '</tr></thead><tbody>';
  for (var i = 0; i < cl.items.length; i++) {
    var item = cl.items[i];
    var fs = _resolveItemFLM(item.type, item.ref);
    html += '<tr><td>' + item.type + '</td><td>' + _escList(item.ref) + '</td><td>' + _fsChip(fs) + '</td></tr>';
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

function startListScan(listId) {
  var list = typeof getCustomList === 'function' ? getCustomList(listId) : null;
  if (!list || list.items.length === 0) {
    if (typeof showToast === 'function') showToast(t('List is empty', '\u6e05\u5355\u4e3a\u7a7a'));
    return;
  }

  /* Group items by type */
  var vocabItems = [], kpItems = [], ppItems = [];
  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    if (it.type === 'vocab') vocabItems.push(it.ref);
    else if (it.type === 'kp') kpItems.push(it.ref);
    else if (it.type === 'pp') ppItems.push(it.ref);
  }

  var phases = [];
  if (vocabItems.length > 0) phases.push({ type: 'vocab', items: vocabItems });
  if (kpItems.length > 0) phases.push({ type: 'kp', items: kpItems });
  if (ppItems.length > 0) phases.push({ type: 'pp', items: ppItems });

  if (phases.length === 0) return;

  _listScanSession = {
    listId: listId,
    phases: phases,
    phaseIdx: 0,
    results: { mastered: 0, uncertain: 0, learning: 0 }
  };

  /* Start first phase — for vocab, launch into study panel with custom word list */
  _advanceListScanPhase();
}

function _advanceListScanPhase() {
  if (!_listScanSession) return;
  if (_listScanSession.phaseIdx >= _listScanSession.phases.length) {
    _finishListScan();
    return;
  }

  var phase = _listScanSession.phases[_listScanSession.phaseIdx];
  var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';

  if (phase.type === 'vocab') {
    if (typeof showToast === 'function') showToast(zh ? '\u8bcd\u6c47 Scan \u5f00\u59cb' : 'Vocab Scan starting...');
    /* Set up a custom scan context for these words and navigate to study */
    if (typeof _startCustomVocabScan === 'function') {
      _startCustomVocabScan(phase.items, function() { _onListScanPhaseComplete(); });
    } else {
      /* Fallback: skip this phase */
      _listScanSession.phaseIdx++;
      _advanceListScanPhase();
    }
  } else if (phase.type === 'kp') {
    if (typeof showToast === 'function') showToast(zh ? '\u77e5\u8bc6\u70b9\u590d\u4e60\u5f00\u59cb' : 'KP review starting...');
    _listScanSession.phaseIdx++;
    _advanceListScanPhase();
  } else if (phase.type === 'pp') {
    if (typeof showToast === 'function') showToast(zh ? '\u771f\u9898\u590d\u4e60\u5f00\u59cb' : 'PP review starting...');
    _listScanSession.phaseIdx++;
    _advanceListScanPhase();
  }
}

function _onListScanPhaseComplete() {
  if (!_listScanSession) return;
  _listScanSession.phaseIdx++;
  setTimeout(function() { _advanceListScanPhase(); }, 500);
}

function _finishListScan() {
  if (!_listScanSession) return;

  /* Tally current FLM state for all items in the list */
  var list = typeof getCustomList === 'function' ? getCustomList(_listScanSession.listId) : null;
  var results = { mastered: 0, uncertain: 0, learning: 0, 'new': 0 };
  if (list) {
    for (var i = 0; i < list.items.length; i++) {
      var fs = _resolveItemFLM(list.items[i].type, list.items[i].ref);
      results[fs] = (results[fs] || 0) + 1;
    }
  }

  if (typeof recordListSession === 'function') {
    recordListSession(_listScanSession.listId, results);
  }

  var zh = (typeof getLang === 'function' ? getLang() : 'en') === 'zh';
  if (typeof showToast === 'function') {
    showToast(zh ? '\u6e05\u5355 Scan \u5b8c\u6210\uff01' : 'List Scan complete!');
  }

  _listScanSession = null;

  /* Return to lists view */
  if (typeof navTo === 'function') navTo('lists');
}
