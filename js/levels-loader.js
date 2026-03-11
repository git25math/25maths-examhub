/* ══════════════════════════════════════════════════════════════
   levels-loader.js — Board-aware lazy loader for split level data
   Loads JSON per board on demand; falls back to monolithic levels.js.
   ══════════════════════════════════════════════════════════════ */

var LEVELS = [];
var _levelsReady = false;
var _levelsCallbacks = [];

function onLevelsReady(fn) {
  if (_levelsReady) { fn(); return; }
  _levelsCallbacks.push(fn);
}

/* ─── internal state ─── */
var _boardJsonMap = {
  cie: 'data/levels-cie.json',
  edx: 'data/levels-edx.json',
  '25m': 'data/levels-25m.json'
};
var _canonOrder = ['cie', 'edx', '25m'];  /* rebuild always in this order */
var _loadedData = {};      /* boardKey → array of levels */
var _fetchPromises = {};   /* url → Promise (dedup in-flight) */

function _urlForBoard(bk) { return _boardJsonMap[bk] || null; }

/* Fetch one JSON, dedup concurrent calls to same URL */
function _fetchJson(url) {
  if (_fetchPromises[url]) return _fetchPromises[url];
  _fetchPromises[url] = fetch(url).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(data) {
    delete _fetchPromises[url];
    return data;
  }).catch(function(err) {
    delete _fetchPromises[url];
    throw err;
  });
  return _fetchPromises[url];
}

/* Rebuild LEVELS from _loadedData in canonical order (CIE → EDX → 25m).
   Preserves custom levels appended by other modules. */
function _rebuildLevels() {
  var custom = (typeof getCustomLevels === 'function') ? getCustomLevels() : [];
  var base = [];
  _canonOrder.forEach(function(bk) {
    if (_loadedData[bk]) base = base.concat(_loadedData[bk]);
  });
  LEVELS = base.concat(custom);
  /* Re-init virtual levels if syllabus data was already loaded */
  if (typeof _cieDataReady !== 'undefined' && _cieDataReady && typeof _initBoardLevels === 'function') {
    _initBoardLevels('cie');
  }
  if (typeof _edxDataReady !== 'undefined' && _edxDataReady && typeof _initBoardLevels === 'function') {
    _initBoardLevels('edx');
  }
  if (typeof _hhkDataReady !== 'undefined' && _hhkDataReady && typeof _initBoardLevels === 'function') {
    _initBoardLevels('hhk');
  }
  if (typeof invalidateCache === 'function') invalidateCache();
  if (typeof invalidateGuestCache === 'function') invalidateGuestCache();
  _quizCache = null;  /* quiz distractor cache */
}

/* Map userBoard value → list of board keys needed */
function _boardKeysFor(board) {
  if (!board || board === 'all') return _canonOrder.slice();
  if (board === 'cie') return ['cie'];
  if (board === 'edx') return ['edx'];
  if (board.indexOf('25m') === 0) return ['25m'];
  return _canonOrder.slice();
}

/* ─── public API ─── */

/* Ensure the JSON for a specific userBoard value is loaded.
   Returns a Promise that resolves when data is ready. */
function ensureBoardLoaded(board) {
  var keys = _boardKeysFor(board);
  var needed = keys.filter(function(k) { return !_loadedData[k]; });
  if (needed.length === 0) return Promise.resolve();

  var tasks = needed.map(function(bk) {
    var url = _urlForBoard(bk);
    if (!url) return Promise.resolve();
    return _fetchJson(url).then(function(data) {
      _loadedData[bk] = data;
    });
  });

  return Promise.all(tasks).then(function() {
    _rebuildLevels();
  });
}

/* Ensure all 3 board JSONs are loaded.
   Used by teacher panel, homework, export. */
function ensureAllBoardsLoaded() {
  return ensureBoardLoaded('all');
}

/* ─── initial boot ─── */
(function() {
  /* Determine which board(s) to load at startup */
  var startBoard = _hostBoard || null;
  if (!startBoard) { try { startBoard = localStorage.getItem('userBoard'); } catch(e) {} }
  var keys = _boardKeysFor(startBoard);

  var urls = keys.map(function(bk) { return { bk: bk, url: _urlForBoard(bk) }; });

  /* Also load vocab-uid-map.json for FLM migration (non-blocking) */
  var uidMapPromise = _fetchJson('data/vocab-uid-map.json').then(function(data) {
    if (typeof _vocabUidMap !== 'undefined') _vocabUidMap = data;
    else window._vocabUidMap = data;
  }).catch(function() { /* optional — migration skipped if missing */ });

  /* Load slug-merge-map.json for old→new slug fallback (non-blocking) */
  var slugMapPromise = _fetchJson('data/slug-merge-map.json').then(function(data) {
    window._slugMergeMap = data;
  }).catch(function() { /* optional — fallback skipped if missing */ });

  Promise.all(urls.map(function(item) {
    return _fetchJson(item.url).then(function(data) {
      _loadedData[item.bk] = data;
    });
  }).concat([uidMapPromise, slugMapPromise])).then(function() {
    _rebuildLevels();
    _levelsReady = true;
    _levelsCallbacks.forEach(function(fn) { try { fn(); } catch(e) { console.error(e); } });
    _levelsCallbacks = [];
  }).catch(function(err) {
    console.error('levels-loader: JSON fetch failed, falling back to levels.js', err);
    var s = document.createElement('script');
    s.src = 'js/levels.js';
    s.onload = function() {
      _levelsReady = true;
      _levelsCallbacks.forEach(function(fn) { try { fn(); } catch(e) { console.error(e); } });
      _levelsCallbacks = [];
    };
    s.onerror = function() {
      console.error('levels-loader: fallback levels.js also failed');
    };
    document.head.appendChild(s);
  });
})();
