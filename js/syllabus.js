/* ══════════════════════════════════════════════════════════════
   syllabus.js — Multi-board syllabus-driven navigation + section detail
   Supports CIE 0580, Edexcel 4MA1, and Harrow Haikou (HHK).
   Loaded after mastery.js, before practice.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ GLOBALS ═══ */
var BOARD_SYLLABUS = {};      /* { cie: {...}, edexcel: {...}, hhk: {...} } */
var BOARD_VOCAB = {};         /* { cie: {...}, edexcel: {...}, hhk: {...} } */
var _boardSectionLevelMap = {};  /* { cie: {id→idx}, edexcel: {id→idx}, hhk: {id→idx} } */
var _sectionEditsCache = {};  /* { cie: { secId: { module: data } }, edexcel: ..., hhk: ... } */
var _sectionInfoCache = {};   /* { 'board:sectionId' → {chapter,section,sectionIndex,board} } */

/* Legacy aliases — keep existing code working */
var CIE_SYLLABUS = null;
var CIE_VOCAB = null;
var _cieSectionLevelMap = {};

var _boardReady = { cie: false, edexcel: false, hhk: false };
var _boardLoading = { cie: null, edexcel: null, hhk: null };
var _cieDataReady = false;
var _edxDataReady = false;
var _hhkDataReady = false;

/* Section context — tracks which section the student entered from */
var _currentSectionContext = null; /* { sectionId, board } or null */

/* Chapter collapse state (default all collapsed; restore from localStorage) */
var cieChapterCollapsed = (function() {
  try { return JSON.parse(localStorage.getItem('wmatch_chapterCollapsed')) || {}; } catch(e) { return {}; }
})();

/* Helper: mastery dimension bar */
function _masteryBar(icon, label, pct) {
  pct = pct || 0;
  var color = pct >= 70 ? 'var(--c-success)' : pct >= 30 ? 'var(--c-warning)' : 'var(--c-danger)';
  if (pct === 0) color = 'var(--c-muted)';
  return '<div class="sec-mastery-item">' +
    '<span class="sec-mastery-icon">' + icon + '</span>' +
    '<span class="sec-mastery-label">' + label + '</span>' +
    '<div class="sec-mastery-track"><div class="sec-mastery-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '<span class="sec-mastery-pct">' + pct + '%</span></div>';
}

/* ═══ SECTION EDITS LOADING ═══ */

function loadSectionEdits(board) {
  if (_sectionEditsCache[board]) return Promise.resolve(_sectionEditsCache[board]);
  if (!sb) return Promise.resolve({});
  return sb.from('section_edits').select('section_id,module,data').eq('board', board)
    .then(function(res) {
      var map = {};
      if (res.data) res.data.forEach(function(row) {
        if (!map[row.section_id]) map[row.section_id] = {};
        map[row.section_id][row.module] = row.data;
      });
      _sectionEditsCache[board] = map;
      return map;
    }).catch(function() { return {}; });
}

/* Get section edit data for a specific module */
function _getSectionEdit(board, sectionId, module) {
  var c = _sectionEditsCache[board];
  if (!c || !c[sectionId]) return null;
  return c[sectionId][module] || null;
}

/* ═══ DATA LOADING ═══ */

function loadCIESyllabus() {
  return _loadBoardSyllabus('cie');
}

function loadEdexcelSyllabus() {
  return _loadBoardSyllabus('edexcel');
}

function loadHHKSyllabus() {
  return _loadBoardSyllabus('hhk');
}

function _loadBoardSyllabus(board) {
  if (_boardReady[board]) return Promise.resolve();
  if (_boardLoading[board]) return _boardLoading[board];

  var syllabusFile = 'data/syllabus-' + board + '.json';
  var vocabFile = 'data/vocabulary-' + board + '.json';

  var loadingPromise = Promise.all([
    fetch(syllabusFile).then(function(r) { return r.json(); }),
    fetch(vocabFile).then(function(r) { return r.json(); }),
    loadSectionEdits(board)
  ]).then(function(results) {
    BOARD_SYLLABUS[board] = results[0];
    BOARD_VOCAB[board] = results[1];
    _sectionInfoCache = {};  /* invalidate on new board data */

    /* Legacy aliases for CIE */
    if (board === 'cie') {
      CIE_SYLLABUS = results[0];
      CIE_VOCAB = results[1];
    }

    /* Wait for levels to be ready before creating virtual levels */
    if (typeof _levelsReady !== 'undefined' && _levelsReady) {
      _setBoardReady(board);
      _initBoardLevels(board);
    } else if (typeof onLevelsReady === 'function') {
      onLevelsReady(function() {
        _setBoardReady(board);
        _initBoardLevels(board);
          if (typeof scheduleRenderHome === 'function') scheduleRenderHome();
      });
    } else {
      _setBoardReady(board);
      _initBoardLevels(board);
    }
  }).catch(function(e) {
    console.error('Failed to load ' + board + ' syllabus data:', e);
  });

  _boardLoading[board] = loadingPromise;

  return loadingPromise;
}

function _setBoardReady(board) {
  _boardReady[board] = true;
  if (board === 'cie') _cieDataReady = true;
  else if (board === 'edexcel') _edxDataReady = true;
  else if (board === 'hhk') _hhkDataReady = true;
}

/* ═══ VIRTUAL LEVELS CREATION ═══ */
/* Convert vocabulary JSON format to LEVELS vocabulary format */
function _vocabToLevelsFormat(words) {
  var result = [];
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    result.push({ id: w.id, type: 'word', content: w.word });
    result.push({ id: w.id, type: 'def', content: w.def });
  }
  return result;
}

/* Mark old levels as hidden and create new virtual levels for a board (idempotent) */
function _initBoardLevels(board) {
  var syllabus = BOARD_SYLLABUS[board];
  var vocab = BOARD_VOCAB[board];
  var boardKey = board === 'edexcel' ? 'edx' : board === 'hhk' ? '25m' : board;  /* LEVELS uses 'edx'/'25m' */

  /* HHK special path: don't create virtual levels, map to existing 25m levels */
  if (board === 'hhk') {
    _boardSectionLevelMap.hhk = {};
    if (!syllabus) return;
    /* Build slug→LEVELS index map */
    var slugIdx = {};
    for (var si = 0; si < LEVELS.length; si++) {
      if (LEVELS[si].board === '25m') slugIdx[LEVELS[si].slug] = si;
    }
    /* Map each section to its first vocabSlug's level index */
    syllabus.chapters.forEach(function(ch) {
      ch.sections.forEach(function(sec) {
        if (!sec.vocabSlugs || sec.vocabSlugs.length === 0) return;
        var firstSlug = sec.vocabSlugs[0];
        var idx = slugIdx[firstSlug];
        if (idx !== undefined) {
          _boardSectionLevelMap.hhk[sec.id] = idx;
          /* Tag the level so section detail can find it */
          LEVELS[idx]._section = sec.id;
          LEVELS[idx]._board = 'hhk';
          LEVELS[idx]._isSection = true;
        }
      });
    });
    if (typeof invalidateGuestCache === 'function') invalidateGuestCache();
    return;
  }

  /* Clear previous virtual levels for this board from LEVELS */
  var cleaned = [];
  for (var i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i]._isSection && LEVELS[i].board === boardKey) continue;
    cleaned.push(LEVELS[i]);
  }
  LEVELS.length = 0;
  for (var ci = 0; ci < cleaned.length; ci++) LEVELS.push(cleaned[ci]);

  /* Reset section level map for this board */
  _boardSectionLevelMap[board] = {};

  /* Hide old levels from rendering */
  var hideFlag = board === 'cie' ? '_cieOld' : '_edxOld';
  for (var j = 0; j < LEVELS.length; j++) {
    if (LEVELS[j].board === boardKey && !LEVELS[j]._isSection) {
      LEVELS[j][hideFlag] = true;
    }
  }

  /* Create virtual levels for each syllabus section with vocabulary */
  if (!syllabus || !vocab) return;
  syllabus.chapters.forEach(function(ch) {
    ch.sections.forEach(function(sec) {
      var words = vocab[sec.id];
      if (!words || words.length === 0) return;
      var timer = Math.max(40, words.length * 7);
      var newLevel = {
        board: boardKey,
        slug: sec.slug,
        category: 'ch' + ch.num,
        title: sec.id + ' ' + sec.title,
        titleZh: sec.title_zh,
        timer: timer,
        comboBonus: 2,
        vocabulary: _vocabToLevelsFormat(words),
        _section: sec.id,
        _isSection: true,
        _board: board  /* 'cie' or 'edexcel' — for syllabus lookups */
      };
      var idx = LEVELS.length;
      LEVELS.push(newLevel);
      _boardSectionLevelMap[board][sec.id] = idx;
    });
  });

  /* Keep legacy CIE alias in sync */
  if (board === 'cie') {
    _cieSectionLevelMap = _boardSectionLevelMap.cie;
  }

  /* Invalidate guest cache since LEVELS changed */
  if (typeof invalidateGuestCache === 'function') invalidateGuestCache();
}

/* Legacy wrapper — also used by CIE code path */
function _initCIELevels() {
  _initBoardLevels('cie');
}

/* Get LEVELS index for a given section */
function getSectionLevelIdx(sectionId, board) {
  /* Try specified board first */
  if (board && _boardSectionLevelMap[board]) {
    var idx = _boardSectionLevelMap[board][sectionId];
    if (idx !== undefined) return idx;
  }
  /* Fallback: search all boards */
  for (var b in _boardSectionLevelMap) {
    var idx2 = _boardSectionLevelMap[b][sectionId];
    if (idx2 !== undefined) return idx2;
  }
  return -1;
}

/* Get section info from syllabus by ID — searches all boards or specified board */
function getSectionInfo(sectionId, board) {
  var cacheKey = (board || '') + ':' + sectionId;
  if (_sectionInfoCache[cacheKey]) return _sectionInfoCache[cacheKey];
  var boards = board ? [board] : ['cie', 'edexcel', 'hhk'];
  for (var bi = 0; bi < boards.length; bi++) {
    var syl = BOARD_SYLLABUS[boards[bi]];
    if (!syl) continue;
    for (var i = 0; i < syl.chapters.length; i++) {
      var ch = syl.chapters[i];
      for (var j = 0; j < ch.sections.length; j++) {
        if (ch.sections[j].id === sectionId) {
          var result = { chapter: ch, section: ch.sections[j], sectionIndex: j, board: boards[bi] };
          _sectionInfoCache[cacheKey] = result;
          return result;
        }
      }
    }
  }
  return null;
}

/* ═══ BOARD HOME RENDERING (shared logic) ═══ */
/* Returns HTML for a board in the home dashboard */
function _renderBoardHome(board) {
  var syllabus = BOARD_SYLLABUS[board];
  var vocab = BOARD_VOCAB[board];
  if (!syllabus || !vocab) return '';

  var html = '';

  /* Past Papers (Full) entry — CIE/Edexcel only, gated by access check */
  var _ppBoardKey = board === 'edexcel' ? 'edx' : board === 'hhk' ? '25m' : board;
  if ((board === 'cie' || board === 'edexcel') && typeof ppShowPaperBrowse === 'function' && typeof _ppAccessAllowed === 'function' && _ppAccessAllowed(_ppBoardKey)) {
    var _ppSub = board === 'cie'
      ? t('228 papers \u00b7 4,110 questions \u00b7 2018\u20132025', '228\u5957\u5377 \u00b7 4,110\u9053\u9898 \u00b7 2018\u20132025')
      : t('76 papers \u00b7 1,855 questions \u00b7 2017\u20132025', '76\u5957\u5377 \u00b7 1,855\u9053\u9898 \u00b7 2017\u20132025');
    html += '<div class="pp-browse-entry" role="button" tabindex="0" onclick="ppShowPaperBrowse(\'' + _ppBoardKey + '\')">';
    html += '<span class="pp-browse-icon">\ud83d\udcdd</span>';
    html += '<div class="pp-browse-info">';
    html += '<div class="pp-browse-title">' + t('Past Papers', '\u5957\u5377\u7ec3\u4e60') + '</div>';
    html += '<div class="pp-browse-sub">' + _ppSub + '</div>';
    html += '</div>';
    html += '<span class="pp-browse-arrow">\u2192</span>';
    html += '</div>';
  }

  var prefix = board === 'cie' ? 'cie-ch' : board === 'hhk' ? 'hhk-ch' : 'edx-ch';
  var emojis = board === 'cie'
    ? ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udccd', '\ud83d\udcd0', '\ud83d\udccf', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83c\udfb2', '\ud83d\udcc8']
    : board === 'hhk'
    ? { 7: '\u24fb', 8: '\u24fc', 9: '\u24fd', 10: '\u24fe', 11: '\u24eb' }
    : ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udcca', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83d\udcc8'];

  var wd = getWordData();

  syllabus.chapters.forEach(function(ch) {
    var catKey = prefix + ch.num;
    if (!(catKey in cieChapterCollapsed)) cieChapterCollapsed[catKey] = true;
    var collapsed = appSearch ? false : cieChapterCollapsed[catKey];

    /* Compute chapter-level stats */
    var chTotalWords = 0, chMastered = 0, chTotalStars = 0, chMaxStars = 0;
    var visibleSections = [];

    ch.sections.forEach(function(sec) {
      var words = vocab[sec.id];
      var wordCount = words ? words.length : 0;

      /* Apply search filter */
      if (appSearch) {
        var match = false;
        if (sec.title.toLowerCase().indexOf(appSearch) >= 0) match = true;
        if (sec.title_zh && sec.title_zh.indexOf(appSearch) >= 0) match = true;
        if (sec.id.indexOf(appSearch) >= 0) match = true;
        if (!match && words) {
          for (var wi = 0; wi < words.length; wi++) {
            if (words[wi].word.toLowerCase().indexOf(appSearch) >= 0 ||
                words[wi].def.indexOf(appSearch) >= 0) { match = true; break; }
          }
        }
        if (!match) return;
      }

      visibleSections.push(sec);

      /* Stats from level(s) */
      if (board === 'hhk') {
        var hhkSt = _getHHKSectionStats(sec, wd);
        chTotalWords += hhkSt.total;
        chMastered += hhkSt.mastered;
        chTotalStars += Math.round(hhkSt.learningPct * hhkSt.total * 4 / 100);
        chMaxStars += hhkSt.total * 4;
      } else {
        var li = getSectionLevelIdx(sec.id, board);
        if (li >= 0) {
          var stats = getDeckStats(li, wd);
          chTotalWords += stats.total;
          chMastered += stats.mastered;
          chTotalStars += Math.round(stats.learningPct * stats.total * 4 / 100);
          chMaxStars += stats.total * 4;
        }
      }
    });

    if (visibleSections.length === 0) return;

    html += '<div class="category-section' + (collapsed ? ' collapsed' : '') + '" id="cat-' + catKey + '">';
    html += '<div class="category-header" role="button" tabindex="0" onclick="toggleCIEChapter(\'' + catKey + '\')">';
    var _chEmoji = Array.isArray(emojis) ? (emojis[ch.num] || '\ud83d\udcda') : (emojis[ch.num] || '\ud83d\udcda');
    html += '<span class="category-emoji">' + _chEmoji + '</span>';
    if (board === 'hhk') {
      html += '<span class="category-name">' + ch.title;
      if (appLang !== 'en') html += ' ' + ch.title_zh;
      html += '</span>';
      html += '<span class="category-count">' + ch.sections.length + ' ' + t('units', '\u5355\u5143') + '</span>';
    } else {
      html += '<span class="category-name">' + ch.num + '. ' + ch.title;
      if (appLang !== 'en') html += ' ' + ch.title_zh;
      html += '</span>';
      html += '<span class="category-count">' + ch.sections.length + ' ' + t('sections', '\u8282') + '</span>';
    }
    html += '<span class="category-chevron">\u25bc</span>';
    html += '</div>';

    html += '<div class="deck-list category-body">';

    /* Practice actions for the chapter (not for HHK — no practice questions) */
    if (board !== 'hhk') {
      var firstSec = visibleSections[0];
      var firstLi = getSectionLevelIdx(firstSec.id, board);
      if (firstLi >= 0) {
        html += '<div class="pq-cat-actions">';
        html += '<button class="sort-btn" onclick="startPracticeByChapter(' + ch.num + ',\'' + board + '\')">\ud83d\udcdd ' + t('Practice', '\u7ec3\u4e60') + '</button>';
        html += '</div>';
      }
    }

    var prevSecStats = null;
    visibleSections.forEach(function(sec, vi) {
      var prevSecId = vi > 0 ? visibleSections[vi - 1].id : null;
      var result = _renderSectionRow(sec, ch, board, wd, vi, prevSecId, prevSecStats);
      html += result.html;
      prevSecStats = result.stats;
    });

    html += '</div></div>';
  });

  return html;
}

function renderCIEHome() {
  if (!_cieDataReady || !BOARD_SYLLABUS.cie) return '';
  return _renderBoardHome('cie');
}

function renderEdexcelHome() {
  if (!_edxDataReady || !BOARD_SYLLABUS.edexcel) return '';
  return _renderBoardHome('edexcel');
}

function renderHHKHome() {
  if (!_hhkDataReady || !BOARD_SYLLABUS.hhk) return '';
  return _renderBoardHome('hhk');
}

/* Helper: chapter emoji */
function _chapterEmoji(num) {
  var emojis = ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udccd', '\ud83d\udcd0', '\ud83d\udccf', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83c\udfb2', '\ud83d\udcc8'];
  return emojis[num] || '\ud83d\udcda';
}

/* HHK slug→idx index cache for O(1) lookup */
var _hhkSlugIdx = null;
function _ensureHHKSlugIdx() {
  if (_hhkSlugIdx) return _hhkSlugIdx;
  _hhkSlugIdx = {};
  for (var i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].board === '25m') _hhkSlugIdx[LEVELS[i].slug] = i;
  }
  return _hhkSlugIdx;
}

/* Get combined stats across all vocabSlug levels for an HHK section */
function _getHHKSectionStats(sec, _wd) {
  if (!sec.vocabSlugs || sec.vocabSlugs.length === 0) return { pct: 0, started: 0, total: 0, learningPct: 0, masteryPct: 0, mastered: 0 };
  var totalWords = 0, totalStars = 0, mastered = 0, started = 0;
  var wd = _wd || getWordData();
  var slugIdx = _ensureHHKSlugIdx();
  for (var i = 0; i < sec.vocabSlugs.length; i++) {
    var si = slugIdx[sec.vocabSlugs[i]];
    if (si === undefined) continue;
    var ds = getDeckStats(si, wd);
    totalWords += ds.total;
    mastered += ds.mastered;
    started += ds.started;
    totalStars += Math.round(ds.learningPct * ds.total * 4 / 100);
  }
  var maxStars = totalWords * 4;
  var learningPct = maxStars > 0 ? Math.round(totalStars / maxStars * 100) : 0;
  var masteryPct = totalWords > 0 ? Math.round(mastered / totalWords * 100) : 0;
  return { pct: learningPct, started: started, total: totalWords, learningPct: learningPct, masteryPct: masteryPct, mastered: mastered };
}

/* Render a single section row in the home view */
function _renderSectionRow(sec, ch, board, _wd, secIdx, prevSecId, prevStats) {
  board = board || 'cie';
  var vocab = BOARD_VOCAB[board] || {};
  var li = getSectionLevelIdx(sec.id, board);
  var words = vocab[sec.id] || [];
  var stats;
  if (board === 'hhk') {
    stats = _getHHKSectionStats(sec, _wd);
  } else {
    stats = li >= 0 ? getDeckStats(li, _wd) : { pct: 0, started: 0, total: words.length, learningPct: 0, masteryPct: 0 };
  }

  var tierBadge = '';
  if (sec.tier === 'extended') tierBadge = ' <span class="tier-badge tier-ext">E</span>';
  else if (sec.tier === 'core') tierBadge = ' <span class="tier-badge tier-core">C</span>';
  else if (sec.tier === 'higher') tierBadge = ' <span class="tier-badge tier-higher">H</span>';
  else if (sec.tier === 'foundation') tierBadge = ' <span class="tier-badge tier-foundation">F</span>';

  var h = '';
  h += '<div class="deck-row" role="button" tabindex="0" onclick="openSection(\'' + sec.id + '\',\'' + board + '\')">';
  h += '<span class="deck-row-tag sec-tag">' + sec.id + '</span>';
  h += '<span class="deck-row-name">' + escapeHtml(sec.title);
  if (appLang !== 'en') h += ' ' + escapeHtml(sec.title_zh);
  h += tierBadge + '</span>';
  if (words.length > 0) {
    /* 3-state indicator: empty=not started, half=in progress, full=mastered */
    var _dotClass = stats.started === 0 ? 'sec-dot-empty' : (stats.pct >= 80 ? 'sec-dot-full' : 'sec-dot-half');
    h += '<span class="sec-dot ' + _dotClass + '"></span>';
    if (stats.pct >= 80) h += '<span class="sec-done-check">\u2713</span>';
  }
  h += '</div>';
  return { html: h, stats: stats };
}

/* Toggle chapter collapse */
function toggleCIEChapter(catKey) {
  cieChapterCollapsed[catKey] = !cieChapterCollapsed[catKey];
  var el = document.getElementById('cat-' + catKey);
  if (el) el.classList.toggle('collapsed', cieChapterCollapsed[catKey]);
  try { localStorage.setItem('wmatch_chapterCollapsed', JSON.stringify(cieChapterCollapsed)); } catch(e) {}
}

/* ═══ SECTION DETAIL PAGE ═══ */
function openSection(sectionId, board) {
  var info = getSectionInfo(sectionId, board);
  if (!info) return;
  _currentSectionContext = { sectionId: sectionId, board: info.board };
  renderSectionDetail(info.chapter, info.section, info.sectionIndex, info.board);
  showPanel('section');
}

function renderSectionDetail(ch, sec, secIdx, board) {
  board = board || 'cie';
  var vocab = BOARD_VOCAB[board] || {};
  var li = getSectionLevelIdx(sec.id, board);
  var words = vocab[sec.id] || [];
  var stats;
  if (board === 'hhk') {
    stats = _getHHKSectionStats(sec);
  } else {
    stats = li >= 0 ? getDeckStats(li) : { pct: 0, started: 0, total: words.length, learningPct: 0, masteryPct: 0, mastered: 0 };
  }

  /* Count practice questions for this section */
  var qCount = 0;
  var pqBoard = board === 'edexcel' ? 'edx' : board === 'hhk' ? '25m' : board;
  if (typeof _pqData !== 'undefined' && _pqData && _pqData[pqBoard]) {
    _pqData[pqBoard].forEach(function(q) { if (q.s === sec.id) qCount++; });
  }

  var html = '';

  /* Header */
  html += '<div class="deck-header">';
  html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
  if (board === 'hhk') {
    html += '<div class="deck-title">' + ch.title;
    if (appLang !== 'en') html += ' ' + ch.title_zh;
    html += '</div>';
  } else {
    html += '<div class="deck-title">' + ch.num + '. ' + ch.title;
    if (appLang !== 'en') html += ' ' + ch.title_zh;
    html += '</div>';
  }
  html += '<div class="sec-position">' + sec.id + ' / ' + ch.sections.length + '</div>';
  html += '</div>';

  /* Section title + overall progress */
  html += '<div class="sec-hero">';
  html += '<div class="sec-id">' + sec.id + '</div>';
  html += '<div class="sec-title">' + escapeHtml(sec.title) + '</div>';
  if (appLang !== 'en') {
    html += '<div class="sec-title-zh">' + escapeHtml(sec.title_zh) + '</div>';
  }

  /* Tier badge — board-aware */
  if (sec.tier === 'extended') {
    html += '<span class="tier-badge tier-ext mt-8">Extended Only</span>';
  } else if (sec.tier === 'core') {
    html += '<span class="tier-badge tier-core mt-8">Core Only</span>';
  } else if (sec.tier === 'higher') {
    html += '<span class="tier-badge tier-higher mt-8">Higher Only</span>';
  } else if (sec.tier === 'foundation') {
    html += '<span class="tier-badge tier-foundation mt-8">Foundation Only</span>';
  }

  /* Progress bar */
  html += '<div class="sec-progress-bar">';
  html += '<div class="sec-progress-fill" style="width:' + stats.pct + '%"></div>';
  html += '</div>';
  /* Human-friendly progress label */
  var _progLabel;
  if (stats.started === 0) _progLabel = t('Not started yet', '\u8fd8\u672a\u5f00\u59cb');
  else if (stats.pct >= 80) _progLabel = t('Well done! ' + stats.mastered + '/' + stats.total + ' mastered', '\u505a\u5f97\u5f88\u68d2\uff01\u5df2\u638c\u63e1 ' + stats.mastered + '/' + stats.total);
  else _progLabel = t("You've learned " + stats.started + ' of ' + stats.total + ' words', '\u4f60\u5df2\u5b66\u4e60 ' + stats.started + '/' + stats.total + ' \u4e2a\u8bcd');
  html += '<div class="sec-progress-label">' + _progLabel + '</div>';

  /* Section status — human-friendly progress description */
  if (typeof getSectionHealth === 'function') {
    var sh = getSectionHealth(sec.id, board);
    var statusColor = sh.score >= 60 ? 'var(--c-success)' : sh.score >= 30 ? 'var(--c-warning)' : 'var(--c-border)';
    html += '<div class="sec-health">';
    html += '<div class="sec-health-bar" style="background:' + statusColor + '"></div>';
    html += '<div class="sec-health-info">';
    html += '<div class="sec-health-rec">' + _spRecLabel(sh.rec) + '</div>';
    /* Concise summary instead of 4 dimension bars */
    var _summaryParts = [];
    if (stats.started > 0) _summaryParts.push(t(stats.started + '/' + stats.total + ' words learned', '\u5df2\u5b66 ' + stats.started + '/' + stats.total + ' \u8bcd'));
    if (sh.practiceScore > 0) _summaryParts.push(t('Practice done', '\u7ec3\u4e60\u5b8c\u6210'));
    if (sh.hasPP && sh.ppScore > 0) _summaryParts.push(t('Papers started', '\u771f\u9898\u5df2\u5f00\u59cb'));
    if (_summaryParts.length > 0) {
      html += '<div class="sec-health-summary">' + _summaryParts.join(' \u00b7 ') + '</div>';
    }
    html += '</div></div>';
  }

  html += '</div>';

  /* Syllabus requirements — board-aware labels (1st) */
  var syllabusEdit = _getSectionEdit(board, sec.id, 'syllabus');
  html += '<div class="sec-syllabus">';
  html += '<div class="sec-syllabus-header">';
  var _syllTitle = board === 'hhk' ? t('Learning Objectives', '\u5b66\u4e60\u76ee\u6807') : t('Syllabus Requirements', '\u8003\u7eb2\u8981\u6c42');
  html += '<div class="sec-syllabus-title">' + _syllTitle + '</div>';
  html += '<div class="sec-flex-gap4">';
  if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    html += '<button class="sec-module-edit" onclick="editSectionModule(\'' + sec.id + '\',\'syllabus\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
  }
  html += '<button class="sec-module-report" onclick="reportSectionModule(\'' + sec.id + '\',\'syllabus\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
  html += '</div></div>';

  if (board === 'edexcel') {
    /* Edexcel uses foundation_content / higher_content */
    var fc = (syllabusEdit && syllabusEdit.foundation_content) || sec.foundation_content;
    var hc = (syllabusEdit && syllabusEdit.higher_content) || sec.higher_content;
    if (fc) {
      html += '<div class="sec-syllabus-block">';
      html += '<span class="sec-syllabus-label">Foundation:</span> ' + pqRender(fc);
      html += '</div>';
    }
    if (hc) {
      html += '<div class="sec-syllabus-block">';
      html += '<span class="sec-syllabus-label">Higher:</span> ' + pqRender(hc);
      html += '</div>';
    }
  } else if (board === 'hhk') {
    /* HHK: learning objectives list + sub-units */
    var hcc = (syllabusEdit && syllabusEdit.core_content) || sec.core_content;
    if (hcc) {
      var loLines = hcc.split('\n').filter(function(l) { return l.trim(); });
      html += '<ol class="sec-lo-list">';
      for (var li = 0; li < loLines.length; li++) {
        var loText = loLines[li].replace(/^\d+\.\s*/, '');
        html += '<li class="sec-lo-item">' + pqRender(loText) + '</li>';
      }
      html += '</ol>';
    }
    if (sec.sub_units && sec.sub_units.length) {
      html += '<div class="sec-subunit-header">' + t('Sub-units', '子单元') + '</div>';
      html += '<div class="sec-subunit-grid">';
      for (var si = 0; si < sec.sub_units.length; si++) {
        var su = sec.sub_units[si];
        var suTitle = appLang !== 'en' ? (su.title_zh || su.title) : su.title;
        html += '<div class="sec-subunit-card">';
        html += '<div class="sec-subunit-title">' + suTitle + '</div>';
        html += '<span class="sec-subunit-periods">' + su.periods + ' ' + t('periods', '课时') + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }
  } else {
    /* CIE uses core_content / extended_content */
    var cc = (syllabusEdit && syllabusEdit.core_content) || sec.core_content;
    var ec = (syllabusEdit && syllabusEdit.extended_content) || sec.extended_content;
    if (cc) {
      html += '<div class="sec-syllabus-block">';
      html += '<span class="sec-syllabus-label">Core:</span> ' + pqRender(cc);
      html += '</div>';
    }
    if (ec) {
      html += '<div class="sec-syllabus-block">';
      html += '<span class="sec-syllabus-label">Extended:</span> ' + pqRender(ec);
      html += '</div>';
    }
  }
  html += '</div>';

  /* Learning journey bar — interactive, auto-advancing */
  var _jVocabDone = stats.learningPct >= 80;
  var _jQuizDone = false;
  if (board === 'hhk' && sec.vocabSlugs) {
    sec.vocabSlugs.forEach(function(slug) {
      var idx = getLevelIdxBySlug(slug);
      if (idx >= 0 && isModeDone(idx, 'quiz')) _jQuizDone = true;
    });
  } else if (li >= 0) {
    _jQuizDone = isModeDone(li, 'quiz');
  }
  var _jPracticeDone = li >= 0 && isModeDone(li, 'practice');
  var _jHasPP = (board === 'cie' || board === 'edexcel') && typeof loadPastPaperData === 'function';
  var _jHasPractice = qCount > 0;

  /* Determine current step: first incomplete step gets pulse */
  var _jVocabClass = _jVocabDone ? 'done' : (stats.started > 0 ? 'current pulse' : 'current pulse');
  var _jQuizClass = _jQuizDone ? 'done' : (_jVocabDone ? 'current pulse' : 'locked');
  var _jPracticeClass = _jPracticeDone ? 'done' : (_jQuizDone ? 'current pulse' : 'locked');

  /* Resolve level index for vocab/quiz step clicks */
  var _jLevelIdx = li;
  if (board === 'hhk' && sec.vocabSlugs && sec.vocabSlugs.length > 0) {
    var _viIdx = getLevelIdxBySlug(sec.vocabSlugs[0]);
    if (_viIdx >= 0) _jLevelIdx = _viIdx;
  }

  html += '<div class="sec-journey" id="sec-journey-bar">';
  html += '<div class="sec-journey-step ' + _jVocabClass + '"' + (_jLevelIdx >= 0 ? ' data-journey="vocab" data-level="' + _jLevelIdx + '"' : '') + '><span class="sec-journey-icon">' + (_jVocabDone ? '\u2713' : '\ud83d\udcdd') + '</span> ' + t('Vocab', '\u8bcd\u6c47') + '</div>';
  html += '<div class="sec-journey-arrow">\u2192</div>';
  html += '<div class="sec-journey-step ' + _jQuizClass + '"' + (_jVocabDone && _jLevelIdx >= 0 ? ' data-journey="quiz" data-level="' + _jLevelIdx + '"' : '') + '><span class="sec-journey-icon">' + (_jQuizDone ? '\u2713' : '\u2753') + '</span> ' + t('Quiz', '\u6d4b\u9a8c') + '</div>';
  if (_jHasPractice) {
    html += '<div class="sec-journey-arrow">\u2192</div>';
    html += '<div class="sec-journey-step ' + _jPracticeClass + '"' + (_jQuizDone ? ' data-journey="practice" data-sec="' + sec.id + '" data-board="' + board + '"' : '') + '><span class="sec-journey-icon">' + (_jPracticeDone ? '\u2713' : '\u270f\ufe0f') + '</span> ' + t('Practice', '\u7ec3\u4e60') + '</div>';
  }
  if (_jHasPP) {
    var _jPPClass = (_jHasPractice ? _jPracticeDone : _jQuizDone) ? '' : 'locked';
    html += '<div class="sec-journey-arrow">\u2192</div>';
    html += '<div class="sec-journey-step ' + _jPPClass + '" id="sec-journey-papers"><span class="sec-journey-icon">\ud83d\udcc4</span> ' + t('Papers', '\u771f\u9898') + '</div>';
  }
  html += '</div>';

  /* Module cards: Vocabulary → Practice → Knowledge → Examples */
  html += '<div class="sec-modules">';

  /* Vocabulary module — HHK shows sub-deck list */
  if (board === 'hhk' && sec.vocabSlugs && sec.vocabSlugs.length > 0) {
    html += '<div class="sec-module sec-module-col">';
    if (_jVocabDone) html += '<div class="sec-module-done">\u2713</div>';
    html += '<div class="sec-module-row">';
    html += '<div class="sec-module-icon">\ud83d\udcdd</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Vocabulary', '\u6838\u5fc3\u8bcd\u6c47') + '</div>';
    html += '<div class="sec-module-sub">' + stats.total + ' ' + t('words', '\u8bcd') + ' \u00b7 ' + sec.vocabSlugs.length + ' ' + t('groups', '\u7ec4') + '</div>';
    html += '</div></div>';
    /* Sub-deck rows */
    var wd = getWordData();
    sec.vocabSlugs.forEach(function(slug, si) {
      var _li = getLevelIdxBySlug(slug);
      if (_li < 0) return;
      var subStats = getDeckStats(_li, wd);
      var subTitle = LEVELS[_li].title || ('Group ' + (si + 1));
      html += '<div class="deck-row sec-deck-row-flush" role="button" tabindex="0" onclick="openDeck(' + _li + ')">';
      html += '<span class="deck-row-tag">' + (si + 1) + '</span>';
      html += '<span class="deck-row-name">' + escapeHtml(subTitle) + '</span>';
      html += '<span class="deck-row-count">' + subStats.started + '/' + subStats.total + '</span>';
      html += '<span class="deck-row-progress"><span class="deck-row-progress-fill" style="width:' + subStats.pct + '%"></span></span>';
      html += '<span class="deck-row-pct">' + subStats.pct + '%</span>';
      html += '</div>';
    });
    html += '</div>';
  } else if (words.length > 0 && li >= 0) {
    html += '<div class="sec-module" role="button" tabindex="0" onclick="openDeck(' + li + ')">';
    if (_jVocabDone) html += '<div class="sec-module-done">\u2713</div>';
    html += '<div class="sec-module-icon">\ud83d\udcdd</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Vocabulary', '\u6838\u5fc3\u8bcd\u6c47') + '</div>';
    html += '<div class="sec-module-sub">' + words.length + ' ' + t('words', '\u8bcd') + ' \u00b7 ';
    html += _renderMiniStars(stats.pct);
    html += '</div></div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();openDeck(' + li + ')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'vocabulary\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '<div class="sec-module-arrow">\u2192</div>';
    html += '</div>';
  } else if (words.length === 0) {
    html += '<div class="sec-module sec-module-empty">';
    html += '<div class="sec-module-icon">\ud83d\udcdd</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Vocabulary', '\u6838\u5fc3\u8bcd\u6c47') + '</div>';
    html += '<div class="sec-module-sub">' + t('Coming soon', '\u5373\u5c06\u63a8\u51fa') + '</div>';
    html += '</div></div>';
  }

  /* Practice module */
  if (qCount > 0) {
    html += '<div class="sec-module" role="button" tabindex="0" onclick="startPracticeBySection(\'' + sec.id + '\',\'' + board + '\')">';
    if (_jPracticeDone) html += '<div class="sec-module-done">\u2713</div>';
    html += '<div class="sec-module-icon">\u270f\ufe0f</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Practice', '\u7ec3\u4e60') + '</div>';
    html += '<div class="sec-module-sub">' + qCount + ' ' + t('questions', '\u9898') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();startPracticeBySection(\'' + sec.id + '\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'practice\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '<div class="sec-module-arrow">\u2192</div>';
    html += '</div>';
  }

  /* Past Papers module — between Practice and Knowledge Card (gated) */
  var _secPPKey = board === 'edexcel' ? 'edx' : board;
  if ((board === 'cie' || board === 'edexcel') && typeof loadPastPaperData === 'function' && typeof _ppAccessAllowed === 'function' && _ppAccessAllowed(_secPPKey)) {
    html += '<div id="pp-section-module" data-section="' + sec.id + '" data-board="' + board + '"></div>';
    html += '<div id="mq-summary-slot" data-section="' + sec.id + '" data-board="' + board + '"></div>';
  }

  /* Knowledge Points (3rd) — show list from knowledge-{board}.json */
  var kpList = getKPsForSection(sec.id, board);
  if (kpList.length > 0) {
    html += '<div class="sec-module sec-module-expandable" role="button" tabindex="0" onclick="toggleSectionContent(this)">';
    html += '<div class="sec-module-icon">\ud83d\udcd6</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Knowledge Points', '\u77e5\u8bc6\u70b9\u7cbe\u6790') + '</div>';
    html += '<div class="sec-module-sub">' + kpList.length + ' ' + t('points', '\u4e2a\u77e5\u8bc6\u70b9') + '</div>';
    html += '</div>';
    html += '<div class="sec-module-arrow">\u25bc</div>';
    html += '</div>';
    html += '<div class="sec-module-content d-none">';
    html += '<div class="kp-list">';
    for (var ki = 0; ki < kpList.length; ki++) {
      var kp = kpList[ki];
      var kpFs = typeof getKPFLM === 'function' ? getKPFLM(kp.id) : 'new';
      var kpRes = typeof getKPResult === 'function' ? getKPResult(kp.id) : null;
      var kpFsLabels = { mastered: ['Mastered', '\u5df2\u638c\u63e1'], uncertain: ['Uncertain', '\u4e0d\u786e\u5b9a'], learning: ['Learning', '\u5b66\u4e60\u4e2d'] };
      var kpAriaStatus = kpFsLabels[kpFs] ? kpFsLabels[kpFs][0] : 'New';
      var kpAriaLabel = pqRender(kp.title).replace(/<[^>]*>/g, '') + ' — ' + kpAriaStatus;
      html += '<div class="kp-row" role="button" tabindex="0" aria-label="' + kpAriaLabel + '" data-kp-id="' + kp.id + '" data-kp-board="' + board + '">';
      html += '<div class="kp-row-num">' + (ki + 1) + '</div>';
      html += '<div class="kp-row-name">' + pqRender(kp.title);
      if (kp.title_zh) html += '<span class="kp-row-name-zh">' + kp.title_zh + '</span>';
      html += '</div>';
      var kpChipClass = 'kp-row-' + kpFs;
      if (kpFs === 'mastered') {
        html += '<div class="kp-row-status ' + kpChipClass + '">\u2713 ' + t('Mastered', '\u5df2\u638c\u63e1') + '</div>';
      } else if (kpFs === 'uncertain') {
        html += '<div class="kp-row-status ' + kpChipClass + '">' + t('Uncertain', '\u4e0d\u786e\u5b9a') + '</div>';
      } else if (kpFs === 'learning') {
        html += '<div class="kp-row-status ' + kpChipClass + '">' + t('Learning', '\u5b66\u4e60\u4e2d') + '</div>';
      } else {
        html += '<div class="kp-row-status kp-row-new">NEW</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  } else {
    /* Fallback to old knowledge card if no KP data */
    var knowledgeEdit = _getSectionEdit(board, sec.id, 'knowledge');
    if (knowledgeEdit && knowledgeEdit.content) {
      var kcContent = (appLang !== 'en' && knowledgeEdit.content_zh) ? knowledgeEdit.content_zh : knowledgeEdit.content;
      html += '<div class="sec-module sec-module-expandable" role="button" tabindex="0" onclick="toggleSectionContent(this)">';
      html += '<div class="sec-module-icon">\ud83d\udcd8</div>';
      html += '<div class="sec-module-info">';
      html += '<div class="sec-module-title">' + t('Knowledge Card', '\u77e5\u8bc6\u5361\u7247') + '</div>';
      html += '<div class="sec-module-sub">' + t('Click to expand', '\u70b9\u51fb\u5c55\u5f00') + '</div>';
      html += '</div>';
      html += '<div class="sec-module-arrow">\u25bc</div>';
      html += '</div>';
      html += '<div class="sec-module-content d-none">';
      html += '<div class="sec-module-content-body" data-kc-raw="' + escapeHtml(kcContent) + '"></div>';
      html += '</div>';
    } else {
      html += '<div class="sec-module sec-module-coming">';
      html += '<div class="sec-module-icon">\ud83d\udcd8</div>';
      html += '<div class="sec-module-info">';
      html += '<div class="sec-module-title">' + t('Knowledge Points', '\u77e5\u8bc6\u70b9\u7cbe\u6790') + '</div>';
      html += '<div class="sec-module-sub">' + t('Coming soon', '\u5373\u5c06\u63a8\u51fa') + '</div>';
      html += '</div>';
      html += '</div>';
    }
  }

  /* Worked Examples (4th) — show content if edited, else "Coming soon" */
  var examplesEdit = _getSectionEdit(board, sec.id, 'examples');
  if (examplesEdit && examplesEdit.content) {
    var enExamples = _parseWorkedExamples(examplesEdit.content);
    var zhExamples = examplesEdit.content_zh ? _parseWorkedExamples(examplesEdit.content_zh) : [];
    var langExamples = appLang !== 'en' && zhExamples.length ? zhExamples : enExamples;
    html += '<div class="sec-module sec-module-expandable" role="button" tabindex="0" onclick="toggleSectionContent(this)">';
    html += '<div class="sec-module-icon">\ud83d\udcd6</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Worked Examples', '\u7ecf\u5178\u4f8b\u9898') + '</div>';
    html += '<div class="sec-module-sub">' + langExamples.length + ' ' + t('examples', '\u9053\u4f8b\u9898') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();editSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '<div class="sec-module-arrow">\u25bc</div>';
    html += '</div>';
    html += '<div class="sec-module-content d-none">';
    for (var ei = 0; ei < langExamples.length; ei++) {
      var ex = langExamples[ei];
      html += '<div class="we-card">';
      html += '<div class="we-card-header" role="button" tabindex="0" onclick="event.stopPropagation();toggleWeCard(this)">';
      html += '<span class="we-card-num">' + ex.heading + '</span>';
      if (ex.marks) html += '<span class="we-card-marks">' + ex.marks + '</span>';
      html += '<span class="we-card-arrow">\u25bc</span>';
      html += '</div>';
      html += '<div class="we-card-body d-none" data-we-raw="' + escapeHtml(ex.body) + '"></div>';
      html += '</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="sec-module sec-module-coming">';
    html += '<div class="sec-module-icon">\ud83d\udcd6</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Worked Examples', '\u7ecf\u5178\u4f8b\u9898') + '</div>';
    html += '<div class="sec-module-sub">' + t('Coming soon', '\u5373\u5c06\u63a8\u51fa') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();editSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '</div>';
  }

  html += '</div>'; /* close sec-modules */

  /* Navigation: prev/next section */
  html += '<div class="sec-nav">';
  if (secIdx > 0) {
    var prevSec = ch.sections[secIdx - 1];
    html += '<button class="btn btn-ghost" onclick="openSection(\'' + prevSec.id + '\',\'' + board + '\')">\u2190 ' + prevSec.id + ' ' + escapeHtml(prevSec.title) + '</button>';
  } else {
    html += '<span></span>';
  }
  if (secIdx < ch.sections.length - 1) {
    var nextSec = ch.sections[secIdx + 1];
    html += '<button class="btn btn-ghost" onclick="openSection(\'' + nextSec.id + '\',\'' + board + '\')">' + nextSec.id + ' ' + escapeHtml(nextSec.title) + ' \u2192</button>';
  }
  html += '</div>';

  E('panel-section').innerHTML = html;
  loadKaTeX().then(function() { renderMath(E('panel-section')); });

  /* Async-load Past Papers data and populate module */
  var ppSlot = document.getElementById('pp-section-module');
  if (ppSlot && typeof loadPastPaperData === 'function') {
    var ppSecId = ppSlot.getAttribute('data-section');
    var ppBoard = ppSlot.getAttribute('data-board');
    loadPastPaperData(ppBoard).then(function() {
      _renderPPSectionModule(ppSlot, ppSecId, ppBoard);
      var mqSlot = document.getElementById('mq-summary-slot');
      if (mqSlot) _renderMasterQSummary(mqSlot, ppSecId, ppBoard);
    }).catch(function() { /* silently ignore if no data */ });
  }
}

var PP_GROUP_LABELS = {
  'simplify':          { en: 'Simplify / Factorise',     zh: '\u5316\u7b80/\u56e0\u5f0f\u5206\u89e3' },
  'quadratic':         { en: 'Quadratic Equations',      zh: '\u4e8c\u6b21\u65b9\u7a0b' },
  'function':          { en: 'Functions',                zh: '\u51fd\u6570' },
  'sequence':          { en: 'Sequences',                zh: '\u6570\u5217' },
  'graph':             { en: 'Graphs',                   zh: '\u56fe\u50cf' },
  'simul-linear':      { en: 'Simultaneous (Linear)',    zh: '\u8054\u7acb\u4e00\u6b21' },
  'rearrange':         { en: 'Change of Subject',        zh: '\u516c\u5f0f\u53d8\u5f62' },
  'algebraic-fraction':{ en: 'Algebraic Fractions',      zh: '\u4ee3\u6570\u5206\u5f0f' },
  'linear':            { en: 'Linear Equations',         zh: '\u4e00\u6b21\u65b9\u7a0b' },
  'simul-nonlinear':   { en: 'Simultaneous (Nonlinear)', zh: '\u8054\u7acb\u975e\u7ebf\u6027' },
  'inequality':        { en: 'Inequalities',             zh: '\u4e0d\u7b49\u5f0f' },
  'proportion':        { en: 'Proportion',               zh: '\u6bd4\u4f8b' },
  'indices':           { en: 'Indices',                  zh: '\u6307\u6570' },
  'substitution':      { en: 'Substitution',             zh: '\u4ee3\u5165\u6c42\u503c' },
  'mixed':             { en: 'Mixed / Other',            zh: '\u7efc\u5408\u8fd0\u7528' }
};
var PP_GROUP_ORDER = ['simplify','quadratic','function','sequence','graph','simul-linear','rearrange','algebraic-fraction','linear','simul-nonlinear','inequality','proportion','indices','substitution','mixed'];

var PP_CMD_LABELS = {
  'calculate': { en: 'Calculate',      zh: '\u8ba1\u7b97' },
  'find':      { en: 'Find',           zh: '\u6c42\u89e3' },
  'draw':      { en: 'Draw / Plot',    zh: '\u753b\u56fe' },
  'complete':  { en: 'Complete',        zh: '\u586b\u5199' },
  'write':     { en: 'Write / State',  zh: '\u5199\u51fa' },
  'simplify':  { en: 'Simplify',       zh: '\u5316\u7b80' },
  'show':      { en: 'Show / Prove',   zh: '\u8bc1\u660e' },
  'solve':     { en: 'Solve',          zh: '\u89e3\u65b9\u7a0b' },
  'explain':   { en: 'Explain',        zh: '\u89e3\u91ca' },
  'describe':  { en: 'Describe',       zh: '\u63cf\u8ff0' },
  'rearrange': { en: 'Rearrange',      zh: '\u53d8\u5f62' },
  'sketch':    { en: 'Sketch',         zh: '\u8349\u56fe' },
  'other':     { en: 'Other',          zh: '\u5176\u4ed6' }
};
var PP_CMD_ORDER = ['calculate','find','draw','complete','write','simplify',
                    'show','solve','explain','describe','rearrange','sketch','other'];

/* ═══ SMART PATH — Section Health + Recommendations (Phase 10D-A) ═══ */

var _sectionHealthCache = {};

function _invalidateSectionHealthCache() { _sectionHealthCache = {}; }

var _SP_REC = {
  start:        { icon: '\ud83d\udc4b', en: 'Ready to start!',           zh: '\u51c6\u5907\u5f00\u59cb\u5427\uff01' },
  vocab:        { icon: '\ud83d\udcdd', en: 'Learn the key words first', zh: '\u5148\u5b66\u5173\u952e\u8bcd\u6c47' },
  past_papers:  { icon: '\ud83d\udcc4', en: 'Try real exam questions',   zh: '\u8bd5\u8bd5\u771f\u9898\u5427' },
  review_words: { icon: '\ud83d\udd04', en: 'Quick refresh needed',      zh: '\u5feb\u901f\u590d\u4e60\u4e00\u4e0b' },
  practice:     { icon: '\ud83d\udcaa', en: 'Keep going!',               zh: '\u7ee7\u7eed\u52a0\u6cb9\uff01' },
  great:        { icon: '\ud83c\udf89', en: 'Doing great!',             zh: '\u505a\u5f97\u5f88\u68d2\uff01' }
};

function _spRecLabel(rec) {
  var r = _SP_REC[rec] || _SP_REC.practice;
  return r.icon + ' ' + t(r.en, r.zh);
}

/**
 * getSectionHealth(sectionId, board) → unified health score for a syllabus section
 * Returns: { score, vocabScore, ppScore, failRate, recency, rec, hasVocab, hasPP, sectionId, board, levelIdx }
 */
function getSectionHealth(sectionId, board) {
  var cacheKey = board + ':' + sectionId;
  if (_sectionHealthCache[cacheKey]) return _sectionHealthCache[cacheKey];

  var li = getSectionLevelIdx(sectionId, board);
  var hasVocab = li >= 0;
  var hasPP = false;
  var vocabScore = 0;
  var ppScore = 0;
  var failRate = 0;
  var recency = 0.7;

  /* Vocab score + fail rate + recency in single pass */
  var retentionScore = 0;
  var practiceScore = 0;

  /* HHK: aggregate across all vocabSlug levels */
  if (board === 'hhk') {
    var secInfo = getSectionInfo(sectionId, 'hhk');
    if (secInfo && secInfo.section.vocabSlugs && secInfo.section.vocabSlugs.length > 0) {
      var hhkStats = _getHHKSectionStats(secInfo.section);
      vocabScore = hhkStats.learningPct || 0;
      hasVocab = hhkStats.total > 0;
      /* Aggregate FLM data across all sub-levels */
      var wd = getWordData();
      var totalOk = 0, totalFail = 0, lastActive = 0, masteredN = 0, totalN = 0;
      secInfo.section.vocabSlugs.forEach(function(slug) {
        var _si = getLevelIdxBySlug(slug);
        if (_si < 0) return;
        getPairs(LEVELS[_si].vocabulary).forEach(function(p) {
          var d = wd[wordKey(_si, p.lid)];
          totalN++;
          if (d) {
            totalOk += d.ok || 0;
            totalFail += d.fail || 0;
            if (d.lr && d.lr > lastActive) lastActive = d.lr;
            if (d.fs === 'mastered') masteredN++;
          }
        });
      });
      failRate = (totalOk + totalFail) > 0 ? Math.round(totalFail / (totalOk + totalFail) * 100) : 0;
      if (lastActive > 0) {
        var daysAgo = (Date.now() - lastActive) / 86400000;
        recency = daysAgo < 1 ? 1.0 : daysAgo < 7 ? 0.95 : daysAgo < 30 ? 0.85 : 0.7;
      }
      retentionScore = totalN > 0 ? Math.round((masteredN / totalN) * 100 * recency) : 0;
    }
    /* HHK practice score */
    var hhkPqBoard = '25m';
    if (typeof _pqData !== 'undefined' && _pqData[hhkPqBoard]) {
      var hhkQs = _pqData[hhkPqBoard].filter(function(q) { return q.s === sectionId; });
      if (hhkQs.length > 0) {
        hasPP = true;
        if (typeof isModeDone === 'function') {
          /* Check if any vocab level for this section has practice done */
          if (secInfo.section.vocabSlugs) {
            secInfo.section.vocabSlugs.forEach(function(slug) {
              var idx = getLevelIdxBySlug(slug);
              if (idx >= 0 && isModeDone(idx, 'practice')) practiceScore = 100;
            });
          }
        }
      }
    }
  } else if (hasVocab) {
    var ds = getDeckStats(li);
    vocabScore = ds.learningPct || 0;

    var lv = LEVELS[li];
    var pairs = getPairs(lv.vocabulary);
    var wd = getWordData();
    var totalOk = 0, totalFail = 0, lastActive = 0;
    var masteredN = 0;
    pairs.forEach(function(p) {
      var d = wd[wordKey(li, p.lid)];
      if (d) {
        totalOk += d.ok || 0;
        totalFail += d.fail || 0;
        if (d.lr && d.lr > lastActive) lastActive = d.lr;
        if (d.fs === 'mastered') masteredN++;
      }
    });
    failRate = (totalOk + totalFail) > 0 ? Math.round(totalFail / (totalOk + totalFail) * 100) : 0;
    if (lastActive > 0) {
      var daysAgo = (Date.now() - lastActive) / 86400000;
      recency = daysAgo < 1 ? 1.0 : daysAgo < 7 ? 0.95 : daysAgo < 30 ? 0.85 : 0.7;
    }
    retentionScore = pairs.length > 0 ? Math.round((masteredN / pairs.length) * 100 * recency) : 0;
    /* Practice MCQ score */
    if (typeof isModeDone === 'function' && isModeDone(li, 'practice')) {
      practiceScore = 100;
    }
  }

  /* PP score from FLM states: mastered=1.0, uncertain=0.5, learning=0.2 */
  var ppBoard = board === 'edexcel' ? 'edx' : board === 'hhk' ? null : board;
  if (ppBoard && typeof ppGetSectionStats === 'function' && typeof _ppData !== 'undefined' && _ppData[ppBoard]) {
    var ps = ppGetSectionStats(ppBoard, sectionId);
    if (ps.total > 0) {
      hasPP = true;
      var ppW = ps.mastered * 1.0 + ps.uncertain * 0.5 + ps.learning * 0.2;
      ppScore = Math.round(ppW / ps.total * 100);
    }
  }

  /* Knowledge Point score — weighted FLM: mastered=1, uncertain=0.5, learning=0.2, new=0 */
  var knowledgeScore = 0;
  var hasKP = false;
  if (_kpData[board]) {
    var secKPs = getKPsForSection(sectionId, board);
    if (secKPs.length > 0) {
      var kpWeighted = 0;
      var KP_WEIGHTS = { mastered: 1.0, uncertain: 0.5, learning: 0.2 };
      for (var ksi = 0; ksi < secKPs.length; ksi++) {
        var kpFs = typeof getKPFLM === 'function' ? getKPFLM(secKPs[ksi].id) : 'new';
        kpWeighted += KP_WEIGHTS[kpFs] || 0;
      }
      hasKP = true;
      knowledgeScore = Math.round(kpWeighted / secKPs.length * 100);
    }
  }

  /* Composite score */
  var score;
  if (hasVocab && hasPP && hasKP) {
    score = Math.round((vocabScore * 0.3 + ppScore * 0.4 + knowledgeScore * 0.3) * recency);
  } else if (hasVocab && hasPP) {
    score = Math.round((vocabScore * 0.4 + ppScore * 0.6) * recency);
  } else if (hasVocab && hasKP) {
    score = Math.round((vocabScore * 0.5 + knowledgeScore * 0.5) * recency);
  } else if (hasPP && hasKP) {
    score = Math.round((ppScore * 0.6 + knowledgeScore * 0.4) * recency);
  } else if (hasVocab) {
    score = Math.round(vocabScore * recency);
  } else if (hasPP) {
    score = Math.round(ppScore * recency);
  } else if (hasKP) {
    score = Math.round(knowledgeScore * recency);
  } else {
    score = 0;
  }

  /* Recommendation */
  var rec;
  if (vocabScore === 0 && ppScore === 0 && practiceScore === 0 && knowledgeScore === 0) rec = 'start';
  else if (score >= 80) rec = 'great';
  else if (failRate > 40) rec = 'review_words';
  else if (vocabScore < 30) rec = 'vocab';
  else if (hasKP && knowledgeScore === 0) rec = 'knowledge';
  else if (hasPP && ppScore < 20) rec = 'past_papers';
  else if (practiceScore === 0 && vocabScore >= 30) rec = 'practice';
  else rec = 'practice';

  /* Weakest question group (for targeted practice recommendation) */
  var weakGroup = null;
  if (hasPP && typeof ppGetWeakGroups === 'function') {
    var wgs = ppGetWeakGroups(ppBoard, sectionId);
    if (wgs.length > 0) weakGroup = wgs[0].group;
  }

  var result = {
    score: score, vocabScore: vocabScore, ppScore: ppScore, failRate: failRate,
    practiceScore: practiceScore, retentionScore: retentionScore, knowledgeScore: knowledgeScore,
    recency: recency, rec: rec, hasVocab: hasVocab, hasPP: hasPP, hasKP: hasKP,
    sectionId: sectionId, board: board, levelIdx: li, weakGroup: weakGroup
  };
  _sectionHealthCache[cacheKey] = result;
  return result;
}

/**
 * getSectionMilestone(sectionId, board) → milestone string
 * Returns: 'not_started' | 'in_progress' | 'vocab_done' | 'quiz_done' | 'mastered'
 */
function getSectionMilestone(sectionId, board) {
  var li = getSectionLevelIdx(sectionId, board);
  if (li < 0 && board !== 'hhk') return 'not_started';
  var stats;
  if (board === 'hhk') {
    var info = getSectionInfo(sectionId, 'hhk');
    if (!info) return 'not_started';
    stats = _getHHKSectionStats(info.section);
  } else {
    stats = getDeckStats(li);
  }
  if (stats.started === 0) return 'not_started';
  var vocabDone = stats.learningPct >= 80;
  if (!vocabDone) return 'in_progress';
  /* Check quiz done on any mapped level */
  var quizDone = false;
  if (board === 'hhk') {
    var secInfo = getSectionInfo(sectionId, 'hhk');
    if (secInfo && secInfo.section.vocabSlugs) {
      secInfo.section.vocabSlugs.forEach(function(slug) {
        var idx = getLevelIdxBySlug(slug);
        if (idx >= 0 && isModeDone(idx, 'quiz')) quizDone = true;
      });
    }
  } else if (li >= 0) {
    quizDone = isModeDone(li, 'quiz');
  }
  if (!quizDone) return 'vocab_done';
  /* Check practice or high mastery */
  var practiceDone = false;
  if (board !== 'hhk' && li >= 0) practiceDone = isModeDone(li, 'practice');
  if (stats.masteryPct >= 80 || (practiceDone && vocabDone && quizDone)) return 'mastered';
  return 'quiz_done';
}

/**
 * getWeakestSections(board, limit) → sorted array of section health objects (weakest first)
 */
function getWeakestSections(board, limit) {
  var syllabus = BOARD_SYLLABUS[board];
  if (!syllabus) return [];
  var results = [];
  for (var i = 0; i < syllabus.chapters.length; i++) {
    var ch = syllabus.chapters[i];
    for (var j = 0; j < ch.sections.length; j++) {
      var sec = ch.sections[j];
      var h = getSectionHealth(sec.id, board);
      /* Only include sections that have vocab or PP data */
      if (h.hasVocab || h.hasPP) results.push(h);
    }
  }
  results.sort(function(a, b) { return a.score - b.score; });
  return limit ? results.slice(0, limit) : results;
}

/**
 * checkSectionMilestone() — call after mode completion to fire celebration toast
 * Compares current milestone with previous; fires toast on advancement.
 */
function checkSectionMilestone() {
  if (!_currentSectionContext) return;
  if (typeof _invalidateSectionHealthCache === 'function') _invalidateSectionHealthCache();
  if (typeof invalidateCache === 'function') invalidateCache();
  var ctx = _currentSectionContext;
  var ms = getSectionMilestone(ctx.sectionId, ctx.board);
  var prevKey = 'wmatch_milestone_' + ctx.board + ':' + ctx.sectionId;
  var prev = '';
  try { prev = localStorage.getItem(prevKey) || ''; } catch(e) {}
  if (ms === prev) return;
  try { localStorage.setItem(prevKey, ms); } catch(e) {}
  /* Fire toast for advancement */
  var msgs = {
    in_progress: '\ud83d\udcaa ' + t('Started learning!', '\u5f00\u59cb\u5b66\u4e60\u4e86\uff01'),
    vocab_done:  '\ud83d\udcdd ' + t('Vocabulary complete!', '\u8bcd\u6c47\u5b66\u5b8c\u4e86\uff01'),
    quiz_done:   '\u2753 '  + t('Quiz passed!', '\u6d4b\u9a8c\u901a\u8fc7\u4e86\uff01'),
    mastered:    '\ud83c\udf89 ' + t('Section mastered!', '\u77e5\u8bc6\u70b9\u638c\u63e1\u4e86\uff01')
  };
  if (msgs[ms]) {
    if (typeof showToast === 'function') showToast(msgs[ms]);
    if (ms === 'mastered' && typeof spawnP === 'function') spawnP(window.innerWidth / 2, window.innerHeight / 3, 30);
  }
}

/**
 * renderSmartPath() → HTML string for home page Smart Path recommendations
 */
function renderSmartPath() {
  /* Always recompute — vocab/PP data may have changed since last render */
  _invalidateSectionHealthCache();
  var boards = getVisibleBoards();
  var all = [];
  for (var i = 0; i < boards.length; i++) {
    var bid = boards[i].id;
    /* Map board id to syllabus key */
    var syllabusBoard = bid === 'edx' ? 'edexcel' : bid === '25m' ? 'hhk' : bid;
    if (!BOARD_SYLLABUS[syllabusBoard]) continue;
    var weak = getWeakestSections(syllabusBoard, 10);
    for (var j = 0; j < weak.length; j++) {
      weak[j]._boardId = bid;
      all.push(weak[j]);
    }
  }
  /* Sort combined by score ascending, take top 5 */
  all.sort(function(a, b) { return a.score - b.score; });
  /* Filter out score >= 80 (already mastered) */
  all = all.filter(function(h) { return h.score < 80; });
  all = all.slice(0, 5);

  if (all.length === 0) return '';

  /* Zero-data state: all scores are 0 → limit to 3 starters with welcome hint */
  var isZeroData = all.every(function(h) { return h.score === 0; });
  if (isZeroData) all = all.slice(0, 3);

  var collapsed = false;
  try { collapsed = localStorage.getItem('sp_collapsed') === '1'; } catch(e) {}

  var html = '';
  html += '<div class="smart-path' + (collapsed ? ' collapsed' : '') + '" id="smart-path-box">';
  html += '<div class="smart-path-header" role="button" tabindex="0" onclick="toggleSmartPath()">';
  html += '<span class="smart-path-icon">\ud83c\udfaf</span>';
  html += '<span class="smart-path-title">' + t('Recommended Study', '\u63a8\u8350\u5b66\u4e60') + '</span>';
  html += '<span class="smart-path-toggle">\u25bc</span>';
  html += '</div>';

  if (isZeroData) {
    html += '<div class="smart-path-welcome">' + t('Pick a topic to begin your learning journey!', '\u9009\u62e9\u4e00\u4e2a\u77e5\u8bc6\u70b9\uff0c\u5f00\u59cb\u5b66\u4e60\u4e4b\u65c5\uff01') + '</div>';
  }

  html += '<div class="smart-path-list">';
  for (var k = 0; k < all.length; k++) {
    var h = all[k];
    var info = getSectionInfo(h.sectionId, h.board);
    var secTitle = info ? escapeHtml(info.section.title) : h.sectionId;
    var boardLabel = h._boardId === 'edx' ? '4MA1' : h._boardId === '25m' ? 'HHK' : '0580';
    var ringColor = h.score >= 60 ? 'var(--c-success)' : h.score >= 30 ? 'var(--c-warning)' : 'var(--c-danger)';
    /* Smart click: route to best action per recommendation */
    var spRec, spLi = '';
    if (h.rec === 'vocab' && h.levelIdx >= 0) {
      spRec = 'vocab'; spLi = h.levelIdx;
    } else if (h.rec === 'review_words' && h.levelIdx >= 0) {
      spRec = 'review_words'; spLi = h.levelIdx;
    } else if (h.rec === 'past_papers' && typeof startPastPaper === 'function' && typeof _ppAccessAllowed === 'function' && _ppAccessAllowed(h.board === 'edexcel' ? 'edx' : h.board)) {
      spRec = 'past_papers';
    } else {
      spRec = 'section';
    }
    html += '<div class="smart-path-card" data-sp-rec="' + spRec + '" data-sp-sec="' + h.sectionId + '" data-sp-board="' + h.board + '" data-sp-li="' + spLi + '">';
    html += '<div class="smart-path-dot" style="background:' + ringColor + '"></div>';
    html += '<div class="smart-path-info">';
    html += '<div class="smart-path-section">' + h.sectionId + ' ' + secTitle + '</div>';
    html += '<div class="smart-path-rec">' + _spRecLabel(h.rec);
    if (h.weakGroup && typeof PP_GROUP_LABELS !== 'undefined' && PP_GROUP_LABELS[h.weakGroup]) {
      var _wgl = PP_GROUP_LABELS[h.weakGroup];
      html += ' \u00b7 <span class="smart-path-weak">' + t('Focus', '\u91cd\u70b9') + ': ' + t(_wgl.en, _wgl.zh) + '</span>';
    }
    html += '</div>';
    html += '</div>';
    html += '<span class="smart-path-board">' + boardLabel + '</span>';
    html += '</div>';
  }
  html += '</div>';
  html += '</div>';
  return html;
}

/**
 * renderReviewPlan() → HTML for home page review plan (sections due for review)
 */
function renderReviewPlan() {
  var boards = getVisibleBoards();
  var candidates = [];
  for (var i = 0; i < boards.length; i++) {
    var bid = boards[i].id;
    var syllabusBoard = bid === 'edx' ? 'edexcel' : bid === '25m' ? 'hhk' : bid;
    if (!BOARD_SYLLABUS[syllabusBoard]) continue;
    var syllabus = BOARD_SYLLABUS[syllabusBoard];
    for (var ci = 0; ci < syllabus.chapters.length; ci++) {
      var ch = syllabus.chapters[ci];
      for (var si = 0; si < ch.sections.length; si++) {
        var sec = ch.sections[si];
        var h = getSectionHealth(sec.id, syllabusBoard);
        /* Only include sections that have been started but need review */
        if (h.vocabScore > 0 && h.recency < 0.95 && h.retentionScore < 70) {
          h._boardId = bid;
          candidates.push(h);
        }
      }
    }
  }
  if (candidates.length === 0) return '';
  /* Sort by retention ascending (most forgotten first) */
  candidates.sort(function(a, b) { return a.retentionScore - b.retentionScore; });
  candidates = candidates.slice(0, 3);

  var html = '<div class="review-plan">';
  html += '<div class="review-plan-header">';
  html += '<span class="review-plan-icon">\ud83d\udd04</span>';
  html += '<span class="review-plan-title">' + t('Review Plan', '\u590d\u4e60\u8ba1\u5212') + '</span>';
  html += '</div>';
  html += '<div class="review-plan-sub">' + t('These topics need review to strengthen your memory', '\u8fd9\u4e9b\u77e5\u8bc6\u70b9\u9700\u8981\u590d\u4e60\u4ee5\u5de9\u56fa\u8bb0\u5fc6') + '</div>';
  for (var k = 0; k < candidates.length; k++) {
    var c = candidates[k];
    var info = getSectionInfo(c.sectionId, c.board);
    var title = info ? escapeHtml(info.section.title) : c.sectionId;
    var retColor = c.retentionScore >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
    html += '<div class="review-plan-item" role="button" tabindex="0" onclick="openSection(\'' + c.sectionId + '\',\'' + c.board + '\')">';
    html += '<span class="review-plan-sec">' + c.sectionId + '</span>';
    html += '<span class="review-plan-name">' + title + '</span>';
    var retLabel = c.retentionScore >= 50 ? t('Review soon', '\u5f85\u590d\u4e60') : t('Needs practice', '\u9700\u8981\u7ec3\u4e60');
    html += '<span class="review-plan-ret" style="color:' + retColor + '">\ud83d\udd04 ' + retLabel + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function _renderPPSectionModule(slot, secId, board) {
  var ppStats = ppGetSectionStats(board, secId);
  if (ppStats.total === 0) { slot.style.display = 'none'; return; }

  /* Count by group */
  var allQ = getPPBySection(board, secId);
  var groupCounts = {};
  for (var gi = 0; gi < allQ.length; gi++) {
    var g = allQ[gi].g || 'mixed';
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }

  var _ppDoneRatio = ppStats.total > 0 ? ppStats.mastered / ppStats.total : 0;
  var _ppModuleDone = _ppDoneRatio >= 0.5;

  var h = '';
  h += '<div class="sec-module sec-module-col">';
  if (_ppModuleDone) h += '<div class="sec-module-done">\u2713</div>';
  h += '<div class="sec-module-row">';
  h += '<div class="sec-module-icon">\ud83d\udcc4</div>';
  h += '<div class="sec-module-info">';
  h += '<div class="sec-module-title">' + t('Past Papers', '\u771f\u9898\u7ec3\u4e60') + '</div>';
  h += '<div class="sec-module-sub">' + ppStats.total + ' ' + t('questions', '\u9898') + ' \u00b7 CIE 0580</div>';
  h += '</div></div>';

  /* Mastery stats */
  h += '<div class="pp-module-stats">';
  if (ppStats.newQ > 0) h += '<span class="pp-module-stat new">\u2b1c ' + ppStats.newQ + ' ' + t('New', '\u65b0\u9898') + '</span>';
  if (ppStats.learning > 0) h += '<span class="pp-module-stat learning">' + ppStats.learning + ' ' + t('Learning', '\u5b66\u4e60\u4e2d') + '</span>';
  if (ppStats.uncertain > 0) h += '<span class="pp-module-stat uncertain">' + ppStats.uncertain + ' ' + t('Uncertain', '\u4e0d\u786e\u5b9a') + '</span>';
  if (ppStats.mastered > 0) h += '<span class="pp-module-stat mastered-stat">\u2705 ' + ppStats.mastered + ' ' + t('Mastered', '\u5df2\u638c\u63e1') + '</span>';
  if (ppStats.stale > 0) h += '<span class="pp-module-stat stale">\u26a0 ' + ppStats.stale + ' ' + t('Stale', '\u8870\u9000') + '</span>';
  h += '</div>';

  /* Vocab progress for this section */
  var secLevelIdx = (_boardSectionLevelMap[board] || {})[secId];
  if (secLevelIdx !== undefined) {
    var secLv = LEVELS[secLevelIdx];
    if (secLv && secLv.vocabulary) {
      var totalW = secLv.vocabulary.length / 2;
      var learnedW = 0;
      var wd = getWordData();
      for (var wi = 0; wi < secLv.vocabulary.length; wi += 2) {
        var wk = wordKey(secLevelIdx, secLv.vocabulary[wi].id);
        if (wd[wk] && (wd[wk].ok || 0) > 0) learnedW++;
      }
      h += '<div class="sec-mod-note">';
      h += '\ud83d\udcdd ' + t('Vocabulary', '\u8bcd\u6c47') + ': ';
      h += '<b>' + learnedW + '</b>/' + totalW + ' ' + t('learned', '\u5df2\u5b66');
      if (learnedW < totalW) {
        h += ' \u00b7 <span class="sec-mod-link" ';
        h += 'onclick="event.stopPropagation();openDeck(' + secLevelIdx + ')">';
        h += t('Study now', '\u53bb\u5b66\u4e60') + '</span>';
      }
      h += '</div>';
    }
  }

  /* Question type breakdown */
  h += '<div class="mt-4">';
  h += '<div class="sec-mod-label">' + t('By Question Type', '\u8003\u6cd5\u9898\u578b\u5206\u7c7b') + '</div>';
  h += '<div class="sec-mod-chips">';
  for (var oi = 0; oi < PP_GROUP_ORDER.length; oi++) {
    var gk = PP_GROUP_ORDER[oi];
    var gc = groupCounts[gk];
    if (!gc) continue;
    var gl = PP_GROUP_LABELS[gk];
    h += '<span class="pp-error-chip" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="practice" data-group="' + gk + '">';
    h += t(gl.en, gl.zh) + ' <b>' + gc + '</b></span>';
  }
  h += '</div></div>';

  /* Command word breakdown */
  var cmdCounts = {};
  var cmdTypes = 0;
  for (var ci = 0; ci < allQ.length; ci++) {
    var ck = allQ[ci].cmd || 'other';
    cmdCounts[ck] = (cmdCounts[ck] || 0) + 1;
  }
  for (var _ck in cmdCounts) cmdTypes++;
  if (cmdTypes >= 2) {
    h += '<div class="mt-4">';
    h += '<div class="sec-mod-label">' + t('By Command Word', '\u6309\u6307\u4ee4\u52a8\u8bcd') + '</div>';
    h += '<div class="sec-mod-chips">';
    for (var coi = 0; coi < PP_CMD_ORDER.length; coi++) {
      var cmk = PP_CMD_ORDER[coi];
      var cmc = cmdCounts[cmk];
      if (!cmc) continue;
      var cml = PP_CMD_LABELS[cmk];
      h += '<span class="pp-error-chip" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="practice" data-cmd="' + cmk + '">';
      h += t(cml.en, cml.zh) + ' <b>' + cmc + '</b></span>';
    }
    h += '</div></div>';
  }

  /* Focus areas: targeted practice for weak groups */
  var _secWeak = ppGetWeakGroups(board, secId);
  if (_secWeak.length > 0) {
    h += '<div class="pp-focus-areas">';
    h += '<div class="pp-focus-title">' + t('Focus Areas', '\u91cd\u70b9\u7ec3\u4e60') + '</div>';
    h += '<div class="pp-focus-chips">';
    for (var wi = 0; wi < Math.min(_secWeak.length, 3); wi++) {
      var wg = _secWeak[wi];
      var wgl = PP_GROUP_LABELS[wg.group];
      var wglabel = wgl ? t(wgl.en, wgl.zh) : wg.group;
      h += '<span class="pp-focus-chip" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="practice" data-group="' + wg.group + '">';
      h += wglabel + ' <span class="pp-focus-pct">' + wg.pct + '%</span></span>';
    }
    h += '</div></div>';
  }

  /* Action buttons */
  h += '<div class="btn-row btn-row--wrap mt-4">';
  h += '<button class="btn btn-sm sec-mod-btn-flex" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="practice">';
  h += '\ud83d\udcd6 ' + t('Practice Mode', '\u7ec3\u4e60\u6a21\u5f0f') + '</button>';
  h += '<button class="btn btn-sm btn-warning sec-mod-btn-flex" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="exam">';
  h += '\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</button>';
  if (ppStats.wrongActive > 0) {
    h += '<button class="btn btn-sm btn-danger sec-mod-btn-flex" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="wrongbook">';
    h += '\ud83d\udcd5 ' + t('Wrong Book', '\u9519\u9898\u672c') + ' (' + ppStats.wrongActive + ')</button>';
  }
  h += '</div>';
  h += '</div>';

  slot.innerHTML = h;

  /* Update journey bar Papers step (async) */
  var jPapersEl = document.getElementById('sec-journey-papers');
  if (jPapersEl) {
    if (_ppModuleDone) {
      jPapersEl.classList.add('done');
    } else if (ppStats.mastered > 0 || ppStats.needsWork > 0 || ppStats.partial > 0) {
      jPapersEl.classList.add('current');
    }
  }

  /* Section complete milestone */
  var secLi = (_boardSectionLevelMap[board] || {})[secId];
  if (_ppModuleDone && secLi !== undefined) {
    var _vocDone = getDeckStats(secLi).learningPct >= 80;
    var _praDone = isModeDone(secLi, 'practice');
    if (_vocDone && _praDone) {
      var msKey = 'milestone:' + secId;
      if (!localStorage.getItem(msKey)) {
        localStorage.setItem(msKey, '1');
        showToast(t('Section Complete!', '\u77e5\u8bc6\u70b9\u5b8c\u6210\uff01') + ' \ud83c\udf89');
      }
    }
  }
}

/* ═══ MASTER QUESTION SUMMARY ═══ */

function _renderMasterQSummary(slot, secId, board) {
  var allQ = getPPBySection(board, secId);
  if (!allQ || allQ.length === 0) { slot.style.display = 'none'; return; }

  /* Group questions and find representative examples */
  var groups = {};
  for (var i = 0; i < allQ.length; i++) {
    var gk = allQ[i].g || 'mixed';
    if (!groups[gk]) groups[gk] = { count: 0, example: null };
    groups[gk].count++;
    if (!groups[gk].example) groups[gk].example = allQ[i];
  }

  /* Count mastered */
  var totalTypes = 0;
  var masteredTypes = 0;
  var orderedGroups = [];
  for (var oi = 0; oi < PP_GROUP_ORDER.length; oi++) {
    var gk2 = PP_GROUP_ORDER[oi];
    if (!groups[gk2]) continue;
    totalTypes++;
    if (_isMQtypeMastered(secId, gk2)) masteredTypes++;
    orderedGroups.push(gk2);
  }

  var pct = totalTypes > 0 ? Math.round((masteredTypes / totalTypes) * 100) : 0;
  var h = '';
  h += '<div class="mq-summary">';

  /* Header + progress */
  h += '<div class="mq-summary-header">';
  h += '<span class="sec-kp-icon">&#x1F4CB;</span> ';
  h += '<span class="mq-summary-title">' + t('Master Question Types', '\u6BCD\u9898\u603B\u7ED3') + '</span>';
  h += '<span class="mq-summary-count">';
  h += t('Mastered', '\u5DF2\u638C\u63E1') + ' ' + masteredTypes + '/' + totalTypes;
  h += '</span>';
  h += '</div>';

  /* Progress bar */
  h += '<div class="mq-progress-bar"><div class="mq-progress-fill" style="width:' + pct + '%"></div></div>';

  /* Type rows */
  for (var ri = 0; ri < orderedGroups.length; ri++) {
    var gKey = orderedGroups[ri];
    var gData = groups[gKey];
    var gLabel = PP_GROUP_LABELS[gKey];
    var isMastered = _isMQtypeMastered(secId, gKey);

    h += '<div class="mq-type-row">';

    /* Checkbox */
    h += '<input type="checkbox" class="mq-type-checkbox"' + (isMastered ? ' checked' : '') + ' ';
    h += 'data-mq-toggle data-sec="' + secId + '" data-gkey="' + gKey + '">';

    /* Info */
    h += '<div class="mq-type-info">';
    h += '<div class="mq-type-name">' + t(gLabel.en, gLabel.zh) + '</div>';

    /* Example question (first 80 chars of tex, strip $ and \) */
    if (gData.example && gData.example.tex) {
      var exTex = gData.example.tex.replace(/\$+/g, '').replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, '').trim();
      if (exTex.length > 80) exTex = exTex.substring(0, 80) + '...';
      h += '<div class="mq-type-example">' + t('e.g.', '\u4F8B') + ' ' + escapeHtml(exTex) + '</div>';
    }
    h += '</div>';

    /* Count + mastery badge */
    h += '<div class="mq-type-right">';
    h += '<div class="mq-type-count">' + gData.count + ' ' + t('Q', '\u9898') + '</div>';
    h += '<div class="mq-type-badge ' + (isMastered ? 'mastered' : 'unmastered') + '">';
    h += isMastered ? '\u2705' : '\u2B1C';
    h += '</div>';
    h += '</div>';

    h += '</div>'; /* end mq-type-row */
  }

  /* Action buttons */
  var unmasteredCount = totalTypes - masteredTypes;
  h += '<div class="btn-row btn-row--wrap">';
  if (unmasteredCount > 0) {
    h += '<button class="btn btn-primary btn-sm" onclick="startPracticeUnmastered(\'' + secId + '\',\'' + board + '\')" class="flex-1">';
    h += t('Practice Unmastered', '\u53EA\u7EC3\u672A\u638C\u63E1') + ' (' + unmasteredCount + ')</button>';
  }
  h += '<button class="btn btn-ghost btn-sm" onclick="startPastPaper(\'' + secId + '\',\'' + board + '\',\'practice\')" class="flex-1">';
  h += t('Practice All', '\u5168\u90E8\u7EC3\u4E60') + '</button>';
  h += '</div>';

  h += '</div>'; /* end mq-summary */
  slot.innerHTML = h;
}

function toggleMQtypeMastery(secId, gk, cb) {
  _setMQtypeMastered(secId, gk, cb.checked);
  /* Refresh the entire MQ summary */
  var slot = document.getElementById('mq-summary-slot');
  if (slot) {
    var board = slot.getAttribute('data-board');
    _renderMasterQSummary(slot, secId, board);
  }
}

function startPracticeUnmastered(secId, board) {
  var allQ = getPPBySection(board, secId);
  var unmastered = allQ.filter(function(q) {
    return !_isMQtypeMastered(secId, q.g || 'mixed');
  });
  if (unmastered.length === 0) {
    showToast(t('All question types mastered!', '\u6240\u6709\u9898\u578B\u5DF2\u638C\u63E1\uFF01'));
    return;
  }
  loadKaTeX().then(function() {
    _ppSession = {
      questions: unmastered,
      current: 0,
      mode: 'practice',
      board: board,
      sectionId: secId,
      groupFilter: null,
      results: []
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

/* Mini star display helper */
function _renderMiniStars(pct) {
  var filled = Math.round(pct / 25);
  var s = '';
  for (var i = 0; i < 4; i++) {
    s += '<span class="star-dot sec-mini-star' + (i < filled ? ' filled' : '') + '"></span>';
  }
  return s;
}

/* ═══ PARSE WORKED EXAMPLES ═══ */
function _parseWorkedExamples(html) {
  // Split by <b>Worked Example [N]</b> or <b>经典例题 [N]</b> headings
  // Supports both numbered (Example 1) and unnumbered (Example) formats
  var parts = html.split(/<b>(Worked Example(?:\s+\d+)?|经典例题(?:\s+\d+)?)<\/b>/i);
  var results = [];
  // parts[0] = text before first heading (usually empty), then alternating: heading, body
  for (var i = 1; i < parts.length; i += 2) {
    var heading = parts[i];
    var body = (parts[i + 1] || '').trim();
    // Extract marks/qualifier from start of body, e.g. " [2 marks]<br>" or " (Higher) [3 marks]<br>"
    var marks = '';
    var marksMatch = body.match(/^\s*(?:\([^)]+\)\s*)?\[([^\]]+)\]/);
    if (marksMatch) {
      marks = marksMatch[0].trim();
      body = body.substring(marksMatch[0].length).replace(/^(<br\s*\/?\s*>)+/i, '').trim();
    }
    // Extract number from heading, or auto-number
    var numMatch = heading.match(/\d+/);
    var num = numMatch ? numMatch[0] : (results.length + 1);
    // For unnumbered headings, add the number
    if (!numMatch) heading = heading + ' ' + num;
    results.push({ num: num, heading: heading, marks: marks, body: body });
  }
  return results;
}

/* ═══ TOGGLE WORKED EXAMPLE CARD ═══ */
function toggleWeCard(headerEl) {
  var card = headerEl.closest('.we-card');
  if (!card) return;
  var body = card.querySelector('.we-card-body');
  var arrow = card.querySelector('.we-card-arrow');
  if (body.classList.contains('d-none')) {
    /* Lazy render: first expand populates content */
    if (body.dataset.weRaw) {
      body.innerHTML = pqRender(body.dataset.weRaw);
      delete body.dataset.weRaw;
    }
    body.classList.remove('d-none');
    arrow.textContent = '\u25b2';
    loadKaTeX().then(function() { renderMath(body); });
  } else {
    body.classList.add('d-none');
    arrow.textContent = '\u25bc';
  }
}

/* ═══ EXPANDABLE MODULE TOGGLE ═══ */
function toggleSectionContent(moduleEl) {
  var content = moduleEl.nextElementSibling;
  if (!content || !content.classList.contains('sec-module-content')) return;
  var arrow = moduleEl.querySelector('.sec-module-arrow');
  if (content.classList.contains('d-none')) {
    var kcBody = content.querySelector('[data-kc-raw]');
    if (kcBody) {
      kcBody.innerHTML = pqRender(kcBody.dataset.kcRaw);
      delete kcBody.dataset.kcRaw;
    }
    content.classList.remove('d-none');
    if (arrow) arrow.textContent = '\u25b2';
    loadKaTeX().then(function() { renderMath(content); });
  } else {
    content.classList.add('d-none');
    if (arrow) arrow.textContent = '\u25bc';
  }
}

/* ═══ SECTION MODULE EDITOR (super-admin) ═══ */

var _sePreviewTimer = null;

function editSectionModule(sectionId, module, board) {
  if (!isSuperAdmin()) return;
  board = board || 'cie';
  var info = getSectionInfo(sectionId, board);
  if (!info) return;
  var sec = info.section;
  var existing = _getSectionEdit(board, sectionId, module);

  var html = '<div class="modal-card pq-editor-modal" onclick="event.stopPropagation()">';

  /* Header */
  var modLabels = { syllabus: ['Syllabus', '\u8003\u7eb2\u8981\u6c42'], knowledge: ['Knowledge Card', '\u77e5\u8bc6\u5361\u7247'], examples: ['Worked Examples', '\u7ecf\u5178\u4f8b\u9898'] };
  var modLabel = modLabels[module] || modLabels.syllabus;
  html += '<div class="pq-editor-header">';
  html += '<div class="section-title sec-title-flush">\u270f\ufe0f ' + t(modLabel[0], modLabel[1]) + ' <span class="sec-editor-subtitle">' + escapeHtml(sectionId) + ' ' + escapeHtml(sec.title) + '</span></div>';
  html += '</div>';

  /* Toolbar */
  html += '<div class="pq-editor-toolbar">';
  html += '<button type="button" onclick="pqToolBold()" title="Bold"><b>B</b></button>';
  html += '<button type="button" onclick="pqToolItalic()" title="Italic"><i>I</i></button>';
  html += '<button type="button" onclick="pqToolSub()" title="Subscript">X<sub>2</sub></button>';
  html += '<button type="button" onclick="pqToolSup()" title="Superscript">X<sup>2</sup></button>';
  html += '<button type="button" onclick="pqToolFormula()" title="Formula">\u2211</button>';
  html += '</div>';

  /* Split: fields + preview */
  html += '<div class="pq-editor-split">';
  html += '<div class="pq-editor-fields">';

  if (module === 'syllabus') {
    if (board === 'edexcel') {
      var fVal = (existing && existing.foundation_content) || sec.foundation_content || '';
      var hVal = (existing && existing.higher_content) || sec.higher_content || '';
      html += _pqFieldGroup('Foundation', 'se-ed-f1', fVal, 4);
      html += _pqFieldGroup('Higher', 'se-ed-f2', hVal, 4);
    } else {
      var cVal = (existing && existing.core_content) || sec.core_content || '';
      var eVal = (existing && existing.extended_content) || sec.extended_content || '';
      html += _pqFieldGroup('Core', 'se-ed-f1', cVal, 4);
      html += _pqFieldGroup('Extended', 'se-ed-f2', eVal, 4);
    }
  } else {
    /* knowledge / examples: content + content_zh */
    var c1 = (existing && existing.content) || '';
    var c2 = (existing && existing.content_zh) || '';
    html += _pqFieldGroup('Content', 'se-ed-f1', c1, 6);
    html += _pqFieldGroup('Content (\u4e2d\u6587)', 'se-ed-f2', c2, 6);
  }

  html += '</div>'; /* end fields */

  /* Preview */
  html += '<div class="pq-editor-preview" id="se-ed-preview"></div>';
  html += '</div>'; /* end split */

  /* Formula popup (shared with practice editor) */
  html += '<div class="pq-formula-popup" id="pq-formula-popup" class="d-none">';
  html += '<label class="pq-field-label">LaTeX</label>';
  html += '<textarea id="pq-formula-input" class="bug-textarea font-mono" rows="2" placeholder="\\frac{1}{2}"></textarea>';
  html += '<div class="pq-formula-preview" id="pq-formula-preview"></div>';
  html += '<div class="btn-row btn-row--mt8">';
  html += '<button class="btn btn-primary btn-sm" onclick="pqInsertFormula()">' + t('Insert', '\u63d2\u5165') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" onclick="pqCloseFormula()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
  html += '</div></div>';

  /* Footer */
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" onclick="saveSectionEdit(\'' + escapeHtml(sectionId) + '\',\'' + escapeHtml(module) + '\',\'' + escapeHtml(board) + '\')">\ud83d\udcbe ' + t('Save to DB', '\u4fdd\u5b58\u5230\u6570\u636e\u5e93') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
  html += '</div>';

  html += '</div>'; /* end modal-card */

  E('modal-card').className = 'modal-card pq-editor-modal';
  showModal(html);

  /* Bind live preview */
  setTimeout(function() {
    var fields = ['se-ed-f1', 'se-ed-f2'];
    fields.forEach(function(fid) {
      var el = E(fid);
      if (el) {
        el.oninput = function() { _seUpdatePreview(module, board); };
        el.onfocus = function() { _pqFocusedTextarea = this; };
      }
    });
    _seUpdatePreview(module, board);
  }, 50);
}

function _seUpdatePreview(module, board) {
  var prev = E('se-ed-preview');
  if (!prev) return;
  var f1 = E('se-ed-f1') ? E('se-ed-f1').value : '';
  var f2 = E('se-ed-f2') ? E('se-ed-f2').value : '';

  var h = '';
  if (module === 'syllabus') {
    var l1 = board === 'edexcel' ? 'Foundation' : 'Core';
    var l2 = board === 'edexcel' ? 'Higher' : 'Extended';
    if (f1) {
      h += '<div class="pq-preview-section"><div class="pq-preview-label">' + l1 + '</div>';
      h += '<div class="pq-preview-content">' + pqRender(f1) + '</div></div>';
    }
    if (f2) {
      h += '<div class="pq-preview-section"><div class="pq-preview-label">' + l2 + '</div>';
      h += '<div class="pq-preview-content">' + pqRender(f2) + '</div></div>';
    }
  } else {
    if (f1) {
      h += '<div class="pq-preview-section"><div class="pq-preview-label">Content</div>';
      h += '<div class="pq-preview-content">' + pqRender(f1) + '</div></div>';
    }
    if (f2) {
      h += '<div class="pq-preview-section"><div class="pq-preview-label">Content (\u4e2d\u6587)</div>';
      h += '<div class="pq-preview-content text-sub">' + pqRender(f2) + '</div></div>';
    }
  }

  prev.innerHTML = h;
  /* Debounce KaTeX rendering */
  clearTimeout(_sePreviewTimer);
  _sePreviewTimer = setTimeout(function() { renderMath(prev); }, 300);
}

function saveSectionEdit(sectionId, module, board) {
  if (!sb || !isSuperAdmin()) { showToast('Not authorized'); return; }
  var f1 = E('se-ed-f1') ? E('se-ed-f1').value : '';
  var f2 = E('se-ed-f2') ? E('se-ed-f2').value : '';

  var data = {};
  if (module === 'syllabus') {
    if (board === 'edexcel') {
      data.foundation_content = f1;
      data.higher_content = f2;
    } else {
      data.core_content = f1;
      data.extended_content = f2;
    }
  } else {
    data.content = f1;
    data.content_zh = f2;
  }

  showToast(t('Saving...', '\u4fdd\u5b58\u4e2d...'));
  sb.from('section_edits').upsert({
    board: board,
    section_id: sectionId,
    module: module,
    data: data,
    updated_by: currentUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'board,section_id,module' }).then(function(res) {
    if (res.error) {
      showToast(t('Save failed: ', '\u4fdd\u5b58\u5931\u8d25\uff1a') + res.error.message);
      return;
    }
    /* Clear cache and re-render */
    _sectionEditsCache[board] = null;
    hideModal();
    E('modal-card').className = 'modal-card';
    showToast(t('Saved!', '\u5df2\u4fdd\u5b58\uff01'));
    /* Reload edits and re-render section detail */
    loadSectionEdits(board).then(function() {
      openSection(sectionId, board);
    });
  });
}

/* ═══ KP EDITOR (super-admin) ═══ */

var _kpeTimer = null;
var _kpeCurrentKP = null;
var _kpeCurrentBoard = null;
var _kpeCurrentField = null;

function editKPField(kpId, field, board) {
  if (!isSuperAdmin()) return;
  var pts = _kpData[board] || [];
  var kp = null;
  for (var i = 0; i < pts.length; i++) { if (pts[i].id === kpId) { kp = pts[i]; break; } }
  if (!kp) { showToast('KP not found'); return; }
  _kpeCurrentKP = kp;
  _kpeCurrentBoard = board;
  _kpeCurrentField = field;
  switch (field) {
    case 'title': _editKPTitle(kp, board); break;
    case 'explanation': _editKPExplanation(kp, board); break;
    case 'examPatterns': _editKPPatterns(kp, board); break;
    case 'examples': _editKPExamples(kp, board); break;
    case 'testYourself': _editKPQuiz(kp, board); break;
    case 'vocabLinks': _editKPVocabLinks(kp, board); break;
  }
}

/* --- Title Editor --- */
function _editKPTitle(kp, board) {
  var html = '<div class="modal-card pq-editor-modal" style="max-width:500px" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Title', '编辑标题') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  html += '<div class="pq-editor-fields" style="padding:16px">';
  html += _pqFieldGroup('Title (EN)', 'kpe-title', kp.title || '', 1);
  html += _pqFieldGroup('Title (中文)', 'kpe-title-zh', kp.title_zh || '', 1);
  html += '</div>';
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    var saveBtn = E('kpe-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', function() {
      var data = { title: E('kpe-title').value, title_zh: E('kpe-title-zh').value };
      _saveKPEdit(kp.id, board, data);
    });
  }, 30);
}

/* --- Explanation Editor (split pane with preview) --- */
function _editKPExplanation(kp, board) {
  var html = '<div class="modal-card pq-editor-modal" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Explanation', '编辑知识讲解') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  /* Toolbar */
  html += '<div class="pq-editor-toolbar">';
  html += '<button type="button" onclick="pqToolBold()" title="Bold"><b>B</b></button>';
  html += '<button type="button" onclick="pqToolItalic()" title="Italic"><i>I</i></button>';
  html += '<button type="button" onclick="pqToolSub()" title="Subscript">X<sub>2</sub></button>';
  html += '<button type="button" onclick="pqToolSup()" title="Superscript">X<sup>2</sup></button>';
  html += '<button type="button" onclick="pqToolFormula()" title="Formula">\u2211</button>';
  html += '</div>';
  /* Split */
  html += '<div class="pq-editor-split">';
  html += '<div class="pq-editor-fields">';
  html += _pqFieldGroup('Content (EN)', 'kpe-exp-en', kp.explanation ? kp.explanation.en || '' : '', 8);
  html += _pqFieldGroup('Content (中文)', 'kpe-exp-zh', kp.explanation ? kp.explanation.zh || '' : '', 8);
  html += '</div>';
  html += '<div class="pq-editor-preview" id="kpe-preview"></div>';
  html += '</div>';
  /* Formula popup */
  html += '<div class="pq-formula-popup" id="pq-formula-popup" class="d-none">';
  html += '<label class="pq-field-label">LaTeX</label>';
  html += '<textarea id="pq-formula-input" class="bug-textarea font-mono" rows="2" placeholder="\\frac{1}{2}"></textarea>';
  html += '<div class="pq-formula-preview" id="pq-formula-preview"></div>';
  html += '<div class="btn-row btn-row--mt8">';
  html += '<button class="btn btn-primary btn-sm" onclick="pqInsertFormula()">' + t('Insert', '插入') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" onclick="pqCloseFormula()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  /* Footer */
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    ['kpe-exp-en', 'kpe-exp-zh'].forEach(function(fid) {
      var el = E(fid);
      if (el) {
        el.oninput = function() { _kpeUpdateExpPreview(); };
        el.onfocus = function() { _pqFocusedTextarea = this; };
      }
    });
    _kpeUpdateExpPreview();
    var saveBtn = E('kpe-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', function() {
      var data = { explanation: { en: E('kpe-exp-en').value, zh: E('kpe-exp-zh').value } };
      _saveKPEdit(kp.id, board, data);
    });
  }, 50);
}

function _kpeUpdateExpPreview() {
  var prev = E('kpe-preview');
  if (!prev) return;
  var en = E('kpe-exp-en') ? E('kpe-exp-en').value : '';
  var zh = E('kpe-exp-zh') ? E('kpe-exp-zh').value : '';
  var h = '<div class="pq-preview-section"><div class="pq-preview-label">EN</div><div class="pq-preview-content">' + kpMarkdown(en) + '</div></div>';
  if (zh) h += '<div class="pq-preview-section"><div class="pq-preview-label">ZH</div><div class="pq-preview-content text-sub">' + kpMarkdown(zh) + '</div></div>';
  prev.innerHTML = h;
  clearTimeout(_kpeTimer);
  _kpeTimer = setTimeout(function() { if (typeof renderMath === 'function') renderMath(prev); }, 300);
}

/* --- Exam Patterns Editor --- */
function _editKPPatterns(kp, board) {
  var patterns = kp.examPatterns ? JSON.parse(JSON.stringify(kp.examPatterns)) : [];
  var html = '<div class="modal-card pq-editor-modal" style="max-width:640px" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Exam Patterns', '编辑典型考法') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  html += '<div class="pq-editor-fields" style="padding:16px;max-height:60vh;overflow-y:auto" id="kpe-patterns-list">';
  html += _kpeRenderPatternRows(patterns);
  html += '</div>';
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-ghost btn-sm" id="kpe-add-pattern">+ ' + t('Add Pattern', '添加考法') + '</button>';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    E('kpe-add-pattern').addEventListener('click', function() {
      var list = E('kpe-patterns-list');
      var idx = list.querySelectorAll('.kpe-row').length;
      var row = document.createElement('div');
      row.innerHTML = _kpePatternRow(idx, {});
      list.appendChild(row.firstChild);
    });
    E('kpe-save-btn').addEventListener('click', function() {
      _saveKPEdit(kp.id, board, { examPatterns: _kpeCollectPatterns() });
    });
  }, 30);
}

function _kpeRenderPatternRows(patterns) {
  var h = '';
  for (var i = 0; i < patterns.length; i++) h += _kpePatternRow(i, patterns[i]);
  return h;
}

function _kpePatternRow(idx, p) {
  var h = '<div class="kpe-row" data-kpe-idx="' + idx + '">';
  h += '<div class="kpe-row-header"><span class="kpe-row-num">#' + (idx + 1) + '</span><button class="btn btn-ghost btn-sm kpe-remove-row" onclick="this.closest(\'.kpe-row\').remove()" title="Remove">\u2715</button></div>';
  h += '<div class="kpe-row-fields">';
  h += '<input class="auth-input kpe-f" data-kpe-key="label" placeholder="Label (EN)" value="' + escapeHtml(p.label || '') + '">';
  h += '<input class="auth-input kpe-f" data-kpe-key="label_zh" placeholder="Label (中文)" value="' + escapeHtml(p.label_zh || '') + '">';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="description" rows="2" placeholder="Description (EN)">' + escapeHtml(p.description || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="description_zh" rows="2" placeholder="Description (中文)">' + escapeHtml(p.description_zh || '') + '</textarea>';
  h += '</div></div>';
  return h;
}

function _kpeCollectPatterns() {
  var rows = document.querySelectorAll('#kpe-patterns-list .kpe-row');
  var result = [];
  rows.forEach(function(row, idx) {
    var p = { id: 'p' + (idx + 1) };
    row.querySelectorAll('.kpe-f').forEach(function(f) {
      p[f.getAttribute('data-kpe-key')] = f.value;
    });
    if (p.label || p.label_zh) result.push(p);
  });
  return result;
}

/* --- Examples Editor --- */
function _editKPExamples(kp, board) {
  var examples = kp.examples ? JSON.parse(JSON.stringify(kp.examples)) : [];
  var html = '<div class="modal-card pq-editor-modal" style="max-width:640px" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Examples', '编辑例题') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  html += '<div class="pq-editor-fields" style="padding:16px;max-height:60vh;overflow-y:auto" id="kpe-examples-list">';
  html += _kpeRenderExampleRows(examples);
  html += '</div>';
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-ghost btn-sm" id="kpe-add-example">+ ' + t('Add Example', '添加例题') + '</button>';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    E('kpe-add-example').addEventListener('click', function() {
      var list = E('kpe-examples-list');
      var idx = list.querySelectorAll('.kpe-row').length;
      var row = document.createElement('div');
      row.innerHTML = _kpeExampleRow(idx, {});
      list.appendChild(row.firstChild);
    });
    E('kpe-save-btn').addEventListener('click', function() {
      _saveKPEdit(kp.id, board, { examples: _kpeCollectExamples() });
    });
  }, 30);
}

function _kpeRenderExampleRows(examples) {
  var h = '';
  for (var i = 0; i < examples.length; i++) h += _kpeExampleRow(i, examples[i]);
  return h;
}

function _kpeExampleRow(idx, ex) {
  var h = '<div class="kpe-row" data-kpe-idx="' + idx + '">';
  h += '<div class="kpe-row-header"><span class="kpe-row-num">' + t('Example', '例题') + ' ' + (idx + 1) + '</span><button class="btn btn-ghost btn-sm kpe-remove-row" onclick="this.closest(\'.kpe-row\').remove()" title="Remove">\u2715</button></div>';
  h += '<div class="kpe-row-fields">';
  h += '<input class="auth-input kpe-f" data-kpe-key="source" placeholder="Source (e.g. 0580/42/M/J/20 Q3)" value="' + escapeHtml(ex.source || '') + '">';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="question" rows="3" placeholder="Question (EN)">' + escapeHtml(ex.question || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="question_zh" rows="2" placeholder="Question (中文)">' + escapeHtml(ex.question_zh || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="solution" rows="4" placeholder="Solution (EN)">' + escapeHtml(ex.solution || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="solution_zh" rows="3" placeholder="Solution (中文)">' + escapeHtml(ex.solution_zh || '') + '</textarea>';
  h += '</div></div>';
  return h;
}

function _kpeCollectExamples() {
  var rows = document.querySelectorAll('#kpe-examples-list .kpe-row');
  var result = [];
  rows.forEach(function(row) {
    var ex = {};
    row.querySelectorAll('.kpe-f').forEach(function(f) {
      ex[f.getAttribute('data-kpe-key')] = f.value;
    });
    if (ex.question || ex.question_zh) result.push(ex);
  });
  return result;
}

/* --- Test Yourself MCQ Editor --- */
function _editKPQuiz(kp, board) {
  var questions = kp.testYourself ? JSON.parse(JSON.stringify(kp.testYourself)) : [];
  var html = '<div class="modal-card pq-editor-modal" style="max-width:700px" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Quiz', '编辑自测题') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  html += '<div class="pq-editor-fields" style="padding:16px;max-height:60vh;overflow-y:auto" id="kpe-quiz-list">';
  html += _kpeRenderQuizRows(questions);
  html += '</div>';
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-ghost btn-sm" id="kpe-add-quiz">+ ' + t('Add Question', '添加题目') + '</button>';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    E('kpe-add-quiz').addEventListener('click', function() {
      var list = E('kpe-quiz-list');
      var idx = list.querySelectorAll('.kpe-row').length;
      var row = document.createElement('div');
      row.innerHTML = _kpeQuizRow(idx, { o: ['', '', '', ''], a: 0 });
      list.appendChild(row.firstChild);
    });
    E('kpe-save-btn').addEventListener('click', function() {
      _saveKPEdit(kp.id, board, { testYourself: _kpeCollectQuiz() });
    });
  }, 30);
}

function _kpeRenderQuizRows(questions) {
  var h = '';
  for (var i = 0; i < questions.length; i++) h += _kpeQuizRow(i, questions[i]);
  return h;
}

function _kpeQuizRow(idx, q) {
  var opts = q.o || ['', '', '', ''];
  var labels = ['A', 'B', 'C', 'D'];
  var h = '<div class="kpe-row" data-kpe-idx="' + idx + '">';
  h += '<div class="kpe-row-header"><span class="kpe-row-num">Q' + (idx + 1) + '</span><button class="btn btn-ghost btn-sm kpe-remove-row" onclick="this.closest(\'.kpe-row\').remove()" title="Remove">\u2715</button></div>';
  h += '<div class="kpe-row-fields">';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="q" rows="2" placeholder="Question (EN)">' + escapeHtml(q.q || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="q_zh" rows="2" placeholder="Question (中文)">' + escapeHtml(q.q_zh || '') + '</textarea>';
  h += '<div class="kpe-quiz-opts">';
  for (var i = 0; i < 4; i++) {
    h += '<div class="kpe-quiz-opt-row">';
    h += '<label><input type="radio" name="kpe-correct-' + idx + '" value="' + i + '"' + (q.a === i ? ' checked' : '') + '> ' + labels[i] + '</label>';
    h += '<input class="auth-input kpe-opt" data-kpe-opt-idx="' + i + '" placeholder="Option ' + labels[i] + '" value="' + escapeHtml(opts[i] || '') + '">';
    h += '</div>';
  }
  h += '</div>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="e" rows="2" placeholder="Explanation (EN)">' + escapeHtml(q.e || '') + '</textarea>';
  h += '<textarea class="pq-ed-textarea kpe-f" data-kpe-key="e_zh" rows="2" placeholder="Explanation (中文)">' + escapeHtml(q.e_zh || '') + '</textarea>';
  h += '</div></div>';
  return h;
}

function _kpeCollectQuiz() {
  var rows = document.querySelectorAll('#kpe-quiz-list .kpe-row');
  var result = [];
  rows.forEach(function(row, idx) {
    var q = {};
    row.querySelectorAll('.kpe-f').forEach(function(f) {
      q[f.getAttribute('data-kpe-key')] = f.value;
    });
    /* Options */
    q.o = [];
    row.querySelectorAll('.kpe-opt').forEach(function(f) {
      q.o.push(f.value);
    });
    /* Correct answer */
    var checked = row.querySelector('input[name="kpe-correct-' + idx + '"]:checked');
    q.a = checked ? parseInt(checked.value) : 0;
    if (q.q || q.q_zh) result.push(q);
  });
  return result;
}

/* --- Vocab Links Editor --- */
function _editKPVocabLinks(kp, board) {
  var links = (kp.vocabLinks || []).join('\n');
  var html = '<div class="modal-card pq-editor-modal" style="max-width:500px" onclick="event.stopPropagation()">';
  html += '<div class="pq-editor-header"><div class="section-title sec-title-flush">' + t('Edit Vocab Links', '编辑词汇关联') + ' <span class="sec-editor-subtitle">' + escapeHtml(kp.id) + '</span></div></div>';
  html += '<div class="pq-editor-fields" style="padding:16px">';
  html += '<label class="pq-field-label">' + t('One slug per line', '每行一个 slug') + '</label>';
  html += '<textarea id="kpe-vlinks" class="pq-ed-textarea" rows="6" placeholder="cie-algebra-basics\ncie-equations">' + escapeHtml(links) + '</textarea>';
  html += '</div>';
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" id="kpe-save-btn">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';
  showModal(html);
  E('modal-card').className = 'modal-card pq-editor-modal';
  setTimeout(function() {
    E('kpe-save-btn').addEventListener('click', function() {
      var val = E('kpe-vlinks').value.trim();
      var slugs = val ? val.split('\n').map(function(s) { return s.trim(); }).filter(Boolean) : [];
      _saveKPEdit(kp.id, board, { vocabLinks: slugs });
    });
  }, 30);
}

/* --- Save KP Edit to Supabase --- */
function _saveKPEdit(kpId, board, fieldData) {
  if (!sb || !isSuperAdmin()) { showToast('Not authorized'); return; }
  /* Build full KP override: merge current KP with edited fields */
  var pts = _kpData[board] || [];
  var kp = null;
  for (var i = 0; i < pts.length; i++) { if (pts[i].id === kpId) { kp = pts[i]; break; } }
  if (!kp) { showToast('KP not found'); return; }
  var override = {};
  var editableKeys = ['title', 'title_zh', 'explanation', 'examPatterns', 'examples', 'testYourself', 'vocabLinks', 'tier'];
  editableKeys.forEach(function(k) { if (kp[k] !== undefined) override[k] = kp[k]; });
  /* Apply new field data */
  Object.keys(fieldData).forEach(function(k) { override[k] = fieldData[k]; });
  showToast(t('Saving...', '保存中...'));
  sb.from('section_edits').upsert({
    board: board,
    section_id: kpId,
    module: 'kp',
    data: override,
    updated_by: currentUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'board,section_id,module' }).then(function(res) {
    if (res.error) {
      showToast(t('Save failed: ', '保存失败：') + res.error.message);
      return;
    }
    /* Invalidate caches and re-render */
    _sectionEditsCache[board] = null;
    _kpData[board] = null;
    _kpLoading[board] = null;
    hideModal();
    E('modal-card').className = 'modal-card';
    showToast(t('Saved!', '已保存！'));
    loadSectionEdits(board).then(function() {
      return loadKnowledgeData(board);
    }).then(function() {
      openKnowledgePoint(kpId, board);
    });
  });
}

/* ═══ SECTION MODULE REPORT ═══ */

var _sectionReportTypes = {
  vocabulary: [
    ['wrong-def', 'Wrong definition / \u5b9a\u4e49\u9519\u8bef'],
    ['missing',   'Missing word / \u7f3a\u5c11\u8bcd\u6c47'],
    ['extra',     'Unnecessary word / \u591a\u4f59\u8bcd\u6c47'],
    ['other',     'Other / \u5176\u4ed6']
  ],
  practice: [
    ['answer',   'Wrong answer / \u7b54\u6848\u9519\u8bef'],
    ['question', 'Question error / \u9898\u76ee\u6709\u8bef'],
    ['formula',  'Formula issue / \u516c\u5f0f\u6e32\u67d3\u95ee\u9898'],
    ['other',    'Other / \u5176\u4ed6']
  ],
  knowledge: [
    ['wrong-info', 'Wrong information / \u4fe1\u606f\u9519\u8bef'],
    ['incomplete', 'Incomplete content / \u5185\u5bb9\u4e0d\u5b8c\u6574'],
    ['formula',    'Formula issue / \u516c\u5f0f\u6e32\u67d3\u95ee\u9898'],
    ['other',      'Other / \u5176\u4ed6']
  ],
  examples: [
    ['wrong-step', 'Wrong step / \u6b65\u9aa4\u9519\u8bef'],
    ['wrong-ans',  'Wrong answer / \u7b54\u6848\u9519\u8bef'],
    ['unclear',    'Unclear explanation / \u89e3\u91ca\u4e0d\u6e05'],
    ['other',      'Other / \u5176\u4ed6']
  ],
  syllabus: [
    ['wrong-req',  'Wrong requirement / \u8003\u7eb2\u8981\u6c42\u6709\u8bef'],
    ['incomplete', 'Incomplete / \u4e0d\u5b8c\u6574'],
    ['mismatch',   'Tier mismatch / \u5c42\u7ea7\u4e0d\u5339\u914d'],
    ['other',      'Other / \u5176\u4ed6']
  ]
};

var _sectionModuleLabels = {
  vocabulary: ['Vocabulary', '\u6838\u5fc3\u8bcd\u6c47'],
  practice:   ['Practice', '\u7ec3\u4e60'],
  knowledge:  ['Knowledge Card', '\u77e5\u8bc6\u5361\u7247'],
  examples:   ['Worked Examples', '\u7ecf\u5178\u4f8b\u9898'],
  syllabus:   ['Syllabus Requirements', '\u8003\u7eb2\u8981\u6c42']
};

function reportSectionModule(sectionId, moduleType, board) {
  board = board || 'cie';
  var info = getSectionInfo(sectionId, board);
  if (!info) return;
  var sec = info.section;
  var types = _sectionReportTypes[moduleType] || _sectionReportTypes.vocabulary;
  var typeOpts = types.map(function(tp) {
    return '<option value="' + tp[0] + '">' + tp[1] + '</option>';
  }).join('');
  var lbl = _sectionModuleLabels[moduleType] || _sectionModuleLabels.vocabulary;
  var modLabel = t(lbl[0], lbl[1]);

  var html = '<div class="section-title">\ud83d\udea9 ' + t('Report Error', '\u62a5\u544a\u9519\u8bef') + ' \u2014 ' + sec.id + ' ' + modLabel + '</div>';
  html += '<div style="text-align:left;margin-bottom:12px;padding:10px;background:var(--c-surface-alt);border-radius:var(--r);font-size:12px">';
  html += '<strong>' + escapeHtml(sec.id) + '</strong> \u00b7 ' + escapeHtml(sec.title);
  if (appLang !== 'en' && sec.title_zh) html += ' \u00b7 ' + escapeHtml(sec.title_zh);
  html += '<br><span class="text-sub">' + t('Module', '\u6a21\u5757') + ': ' + modLabel + '</span>';
  html += '</div>';
  html += '<label class="settings-label">' + t('Error type', '\u9519\u8bef\u7c7b\u578b') + '</label>';
  html += '<select class="bug-select" id="sec-report-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '\u63cf\u8ff0') + ' *</label>';
  html += '<textarea class="bug-textarea" id="sec-report-desc" rows="3" placeholder="' + t('Describe the error...', '\u8bf7\u63cf\u8ff0\u9519\u8bef...') + '"></textarea>';
  html += '<div id="sec-report-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div class="btn-row">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '\u63d0\u4ea4') : t('Submit via Email', '\u901a\u8fc7\u90ae\u4ef6\u63d0\u4ea4');
  html += '<button class="btn btn-primary flex-1" onclick="submitSectionReport(\'' + sectionId + '\',\'' + moduleType + '\',\'' + board + '\')">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost flex-1" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
  html += '</div>';
  showModal(html);
}

function submitSectionReport(sectionId, moduleType, board) {
  board = board || 'cie';
  var desc = E('sec-report-desc').value.trim();
  if (!desc) {
    E('sec-report-msg').textContent = t('Please describe the error', '\u8bf7\u63cf\u8ff0\u9519\u8bef');
    return;
  }
  var type = E('sec-report-type').value;
  var info = getSectionInfo(sectionId, board);
  var sectionTitle = info ? info.section.title : sectionId;

  /* Logged-in users: save to DB */
  if (sb && isLoggedIn() && !isGuest()) {
    sb.from('feedback').insert({
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'section',
      description: desc,
      steps: moduleType,
      auto_info: { sectionId: sectionId, module: moduleType, sectionTitle: sectionTitle, board: board }
    }).then(function(res) {
      if (res.error) {
        E('sec-report-msg').textContent = t('Submit failed: ', '\u63d0\u4ea4\u5931\u8d25\uff1a') + res.error.message;
        return;
      }
      hideModal();
      showToast(t('Report submitted! Thank you.', '\u62a5\u544a\u5df2\u63d0\u4ea4\uff0c\u8c22\u8c22\uff01'));
    });
    return;
  }

  /* Guest: mailto fallback */
  var subject = '[Section Error] ' + sectionId + ' ' + moduleType + ' - 25Maths ExamHub (' + board + ')';
  var body = 'Board: ' + board +
    '\nSection: ' + sectionId + ' - ' + sectionTitle +
    '\nModule: ' + moduleType +
    '\nError type: ' + type +
    '\n\nDescription:\n' + desc;
  var mailto = 'mailto:support@25maths.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailto, '_blank');
  hideModal();
  showToast(t('Opening email client...', '\u6b63\u5728\u6253\u5f00\u90ae\u4ef6\u5ba2\u6237\u7aef...'));
}

/* ═══ PRACTICE BY SECTION/CHAPTER ═══ */
function startPracticeBySection(sectionId, board) {
  board = board || 'cie';
  /* Get first level in this section for reference */
  var li = getSectionLevelIdx(sectionId, board);
  if (li < 0) li = 0;
  currentLvl = li;
  /* Store section filter for practice.js */
  window._practiceSection = sectionId;
  window._practiceChapter = null;
  window._practiceBoard = board;
  if (typeof startPractice === 'function') startPractice(li);
}

function startPracticeByChapter(chNum, board) {
  board = board || 'cie';
  var syllabus = BOARD_SYLLABUS[board];
  if (!syllabus) return;
  var ch = syllabus.chapters[chNum - 1];
  if (!ch) return;
  var li = -1;
  for (var i = 0; i < ch.sections.length; i++) {
    li = getSectionLevelIdx(ch.sections[i].id, board);
    if (li >= 0) break;
  }
  if (li < 0) li = 0;
  currentLvl = li;
  window._practiceSection = null;
  window._practiceChapter = chNum;
  window._practiceBoard = board;
  if (typeof startPractice === 'function') startPractice(li);
}

/* ═══ SYLLABUS EVENT DELEGATION ═══ */
(function() {
  /* B8 + B10: startPastPaper via data attributes */
  document.addEventListener('click', function(e) {
    var pp = e.target.closest('[data-pp-start]');
    if (pp) {
      e.stopPropagation();
      startPastPaper(pp.dataset.sec, pp.dataset.board, pp.dataset.mode, pp.dataset.group || undefined, pp.dataset.cmd || undefined);
    }
  });

  /* B9: toggleMQtypeMastery via data attributes */
  document.addEventListener('change', function(e) {
    var mq = e.target.closest('[data-mq-toggle]');
    if (mq) toggleMQtypeMastery(mq.dataset.sec, mq.dataset.gkey, mq);
  });

  /* B11: Smart Path recommendation cards */
  document.addEventListener('click', function(e) {
    var sp = e.target.closest('[data-sp-rec]');
    if (!sp) return;
    var rec = sp.dataset.spRec;
    var li = sp.dataset.spLi;
    if (rec === 'vocab' && li !== '') {
      openDeck(parseInt(li, 10));
    } else if (rec === 'review_words' && li !== '') {
      appSort = 'hard'; openDeck(parseInt(li, 10));
    } else if (rec === 'past_papers' && typeof startPastPaper === 'function' && typeof _ppAccessAllowed === 'function' && _ppAccessAllowed(sp.dataset.spBoard === 'edexcel' ? 'edx' : sp.dataset.spBoard)) {
      startPastPaper(sp.dataset.spSec, sp.dataset.spBoard, 'practice');
    } else {
      openSection(sp.dataset.spSec, sp.dataset.spBoard);
    }
  });

  /* B12: Journey bar step clicks */
  document.addEventListener('click', function(e) {
    var step = e.target.closest('[data-journey]');
    if (!step) return;
    var action = step.dataset.journey;
    var lvl = parseInt(step.dataset.level, 10);
    if (action === 'vocab' && lvl >= 0) {
      openDeck(lvl);
    } else if (action === 'quiz' && lvl >= 0) {
      startQuiz(lvl);
    } else if (action === 'practice' && step.dataset.sec) {
      startPracticeBySection(step.dataset.sec, step.dataset.board);
    }
  });
})();

/* ═══ TODAY'S PLAN PANEL ═══ */

function _renderPlanInsights() {
  if (typeof getUserStage !== 'function') return '';
  var info = getUserStage();
  var msg = '';
  if (info.stage === 'new') {
    msg = '\ud83d\udca1 ' + t('You\'ve learned ' + info.mastered + ' words this week. Keep going!', '本周学了 ' + info.mastered + ' 词，继续加油！');
  } else if (info.stage === 'active') {
    msg = '\ud83d\udca1 ' + t('You\'ve used ' + info.modesUsed + '/7 modes. More variety strengthens learning!', '\u5df2\u7528 ' + info.modesUsed + '/7 \u79cd\u6a21\u5f0f\uff0c\u591a\u6837\u5316\u7ec3\u4e60\u8ba9\u638c\u63e1\u66f4\u725b\u56fa\uff01');
  } else if (info.stage === 'intermediate') {
    msg = '\ud83d\udca1 ' + t('Focus 10 min on your weakest topic for the best improvement.', '花 10 分钟攻克最弱知识点效果最佳。');
  } else {
    if (info.dueCount > 0) {
      msg = '\ud83d\udca1 ' + t(info.dueCount + ' words need another round of review.', info.dueCount + ' \u4e2a\u8bcd\u9700\u8981\u518d\u590d\u4e60\u4e00\u8f6e\u3002');
    } else {
      msg = '\ud83d\udca1 ' + t('Great mastery! Challenge yourself with mock exams.', '掌握出色！试试模拟卷挑战自己。');
    }
  }
  return '<div class="plan-insight">' + msg + '</div>';
}

function renderTodaysPlan() {
  var panel = E('panel-plan');
  if (!panel) return;
  var html = '';

  /* Title + date */
  var dateStr = new Date().toLocaleDateString(appLang === 'en' ? 'en-US' : 'zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
  html += '<div class="section-title">' + t("Today's Plan", '\u4eca\u65e5\u8ba1\u5212') + '</div>';
  html += '<div class="plan-date">' + dateStr + '</div>';

  /* Streak */
  var streak = getStreakCount();
  if (streak > 0) {
    html += '<div class="plan-streak">\ud83d\udd25 ' + streak + t('-day streak', ' \u5929\u8fde\u7eed\u5b66\u4e60') + '</div>';
  }

  /* Stage-based insight */
  html += _renderPlanInsights();

  /* Due review words */
  var dueCount = getReviewCount();
  html += '<div class="plan-card plan-review-due">';
  html += '<div class="plan-card-header">';
  html += '<span class="plan-card-icon">\ud83e\udde0</span>';
  html += '<span class="plan-card-title">' + t('Words Due for Review', '\u5f85\u590d\u4e60\u8bcd\u6c47') + '</span>';
  html += '</div>';
  if (dueCount > 0) {
    html += '<div class="plan-card-count">' + dueCount + ' ' + t('words', '\u4e2a\u8bcd') + '</div>';
    html += '<button class="btn btn-primary btn-sm" onclick="navTo(\'review-dash\')">' + t('Start Review', '\u5f00\u59cb\u590d\u4e60') + '</button>';
  } else {
    html += '<div class="plan-card-count plan-done">\u2713 ' + t('All caught up!', '\u5168\u90e8\u5b8c\u6210\uff01') + '</div>';
  }
  html += '</div>';

  /* Refresh review (stale mastered words) */
  var staleN = typeof getStaleCount === 'function' ? getStaleCount() : 0;
  if (staleN > 0) {
    html += '<div class="plan-card plan-refresh">';
    html += '<div class="plan-card-header">';
    html += '<span class="plan-card-icon">\ud83d\udd04</span>';
    html += '<span class="plan-card-title">' + t('Refresh Review', '\u8f7b\u91cf\u590d\u67e5') + '</span>';
    html += '</div>';
    html += '<div class="plan-card-count">' + staleN + ' ' + t('mastered words getting stale', '\u4e2a\u5df2\u638c\u63e1\u8bcd\u6c47\u6b63\u5728\u8870\u9000') + '</div>';
    html += '<button class="btn btn-primary btn-sm" data-action="start-refresh">' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + '</button>';
    html += '</div>';
  }

  /* KP stale refresh */
  var staleKPN = typeof getStaleKPCount === 'function' ? getStaleKPCount() : 0;
  if (staleKPN > 0) {
    html += '<div class="plan-card plan-refresh">';
    html += '<div class="plan-card-header">';
    html += '<span class="plan-card-icon">\ud83d\udcd6</span>';
    html += '<span class="plan-card-title">' + t('Knowledge Point Review', '\u77e5\u8bc6\u70b9\u590d\u67e5') + '</span>';
    html += '</div>';
    html += '<div class="plan-card-count">' + staleKPN + ' ' + t('mastered KPs getting stale', '\u4e2a\u5df2\u638c\u63e1\u77e5\u8bc6\u70b9\u6b63\u5728\u8870\u9000') + '</div>';
    html += '<button class="btn btn-primary btn-sm" data-action="start-kp-refresh">' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + '</button>';
    html += '</div>';
  }

  /* PP stale refresh */
  var stalePPN = typeof getStalePPCount === 'function' ? getStalePPCount() : 0;
  if (stalePPN > 0) {
    html += '<div class="plan-card plan-refresh">';
    html += '<div class="plan-card-header">';
    html += '<span class="plan-card-icon">\ud83d\udcc4</span>';
    html += '<span class="plan-card-title">' + t('Past Paper Review', '\u771f\u9898\u590d\u67e5') + '</span>';
    html += '</div>';
    html += '<div class="plan-card-count">' + stalePPN + ' ' + t('mastered questions getting stale', '\u4e2a\u5df2\u638c\u63e1\u771f\u9898\u6b63\u5728\u8870\u9000') + '</div>';
    html += '<button class="btn btn-primary btn-sm" data-action="start-pp-refresh">' + t('Quick Scan', '\u5feb\u901f\u590d\u67e5') + '</button>';
    html += '</div>';
  }

  /* Recovery Session — scheduler-driven or fallback to stale summary */
  var _rsPlanRendered = false;
  try {
    if (typeof getTodayRecoveryPlan === 'function') {
      var _rBoard = typeof userBoard !== 'undefined' ? userBoard : null;
      var _rsPlan = getTodayRecoveryPlan(_rBoard);
      if (_rsPlan && _rsPlan.total > 0) {
        _rsPlanRendered = true;
        html += '<div class="plan-card recovery-session-card">';
        html += '<div class="plan-card-header">';
        html += '<span class="plan-card-icon">\ud83d\udd04</span>';
        html += '<span class="plan-card-title">' + t("Today's Recovery", '\u4eca\u65e5\u590d\u67e5') + '</span>';
        html += '</div>';
        html += '<div class="plan-card-count">';
        var _rsParts2 = [];
        if (_rsPlan.vocab > 0) _rsParts2.push(_rsPlan.vocab + ' ' + t('words', '\u8bcd'));
        if (_rsPlan.kp > 0) _rsParts2.push(_rsPlan.kp + ' ' + t('KPs', '\u77e5\u8bc6\u70b9'));
        if (_rsPlan.pp > 0) _rsParts2.push(_rsPlan.pp + ' ' + t('questions', '\u9898'));
        html += _rsParts2.join(' + ');
        html += '</div>';
        /* Fresh vs carry-over split (v3.6.1) */
        if (typeof splitTodayPlanItems === 'function') {
          var _rsSplit = splitTodayPlanItems(_rsPlan);
          if (_rsSplit.fresh.length > 0 || _rsSplit.carryOver.length > 0) {
            html += '<div class="plan-card-split">';
            if (_rsSplit.fresh.length > 0) html += '<span class="split-fresh">' + _rsSplit.fresh.length + ' ' + t('new', '\u65b0') + '</span>';
            if (_rsSplit.fresh.length > 0 && _rsSplit.carryOver.length > 0) html += '<span class="split-dot"> \u00b7 </span>';
            if (_rsSplit.carryOver.length > 0) html += '<span class="split-carry">' + _rsSplit.carryOver.length + ' ' + t('carried over', '\u7ed3\u8f6c') + '</span>';
            html += '</div>';
          }
        } else if (_rsPlan.carryOverCount > 0) {
          html += '<div class="plan-card-carryover">' + _rsPlan.carryOverCount + ' ' + t('carried over', '\u9879\u7ed3\u8f6c\u81ea\u6628\u65e5') + '</div>';
        }
        if (_rsPlan.backlogCount > 0) {
          html += '<div class="plan-card-backlog">' + _rsPlan.backlogCount + ' ' + t('more in backlog', '\u9879\u5728\u5f85\u529e\u5217\u8868\u4e2d') + '</div>';
        }
        if (_rsPlan.reasons && _rsPlan.reasons.length > 0) {
          html += '<div class="plan-card-reason">' + t('Focus', '\u91cd\u70b9') + ': ' + _rsPlan.reasons.join(' \u00b7 ') + '</div>';
        }
        /* Personalized explainability (v3.8.1) */
        if (_rsPlan.personalization && _rsPlan.personalization.reasons && _rsPlan.personalization.reasons.length > 0) {
          var _exCfg = (typeof RECOVERY_EXPLAINABILITY_CONFIG !== 'undefined') ? RECOVERY_EXPLAINABILITY_CONFIG : {};
          var _exMax = _exCfg.maxReasonsOnCard || 2;
          var _exReasons = _rsPlan.personalization.reasons;
          html += '<div class="plan-card-explain">';
          html += '<div class="plan-card-explain-title">' + t('Why this plan', '\u4E3A\u4EC0\u4E48\u8FD9\u6837\u5B89\u6392') + '</div>';
          for (var _exi = 0; _exi < Math.min(_exReasons.length, _exMax); _exi++) {
            html += '<div class="plan-card-explain-item">' + t(_exReasons[_exi].en, _exReasons[_exi].zh) + '</div>';
          }
          html += '</div>';
        } else if (_rsPlan.personalizationNote) {
          var _pnMap = {
            'lighter-load': t('Adjusted for you: lighter load today due to backlog', '\u4E2A\u6027\u5316\u8C03\u6574\uFF1A\u56E0\u79EF\u538B\u8F83\u591A\uFF0C\u4ECA\u65E5\u4EFB\u52A1\u91CF\u5DF2\u964D\u4F4E'),
            'weak-type-bias': t('Focus boost: more practice in your weakest type', '\u4E2A\u6027\u5316\u8C03\u6574\uFF1A\u5DF2\u589E\u52A0\u4F60\u6700\u8584\u5F31\u7C7B\u578B\u7684\u7EC3\u4E60'),
            'weak-section-bias': t('Focus boost: more items from your weakest sections', '\u4E2A\u6027\u5316\u8C03\u6574\uFF1A\u5DF2\u4F18\u5148\u5B89\u6392\u4F60\u8F83\u5F31\u7AE0\u8282\u7684\u4EFB\u52A1')
          };
          var _pnText = _pnMap[_rsPlan.personalizationNote] || '';
          if (_pnText) html += '<div class="plan-card-personalized">' + _pnText + '</div>';
        }
        html += '<button class="btn btn-primary btn-sm" data-action="start-recovery">' + t('Start', '\u5f00\u59cb') + '</button>';
        /* Recovery Calendar Lite (v3.6.1) */
        if (typeof getRecentRecoveryHistory === 'function') {
          var _calCfg = (typeof RECOVERY_CALENDAR_CONFIG !== 'undefined') ? RECOVERY_CALENDAR_CONFIG : {};
          var _calDays = _calCfg.recentDays || 7;
          var _calHist = getRecentRecoveryHistory(_calDays);
          if (_calHist && _calHist.length > 0) {
            html += '<div class="recovery-calendar-lite">';
            html += '<div class="recovery-calendar-row">';
            for (var _ci = 0; _ci < _calHist.length; _ci++) {
              var _cd = _calHist[_ci];
              var _dayClass = 'recovery-day';
              if (!_cd.hasData) _dayClass += ' empty';
              else if (_cd.done >= _cd.planned && _cd.planned > 0) _dayClass += ' done';
              else if (_cd.done > 0) _dayClass += ' partial';
              else _dayClass += ' missed';
              var _dayTip = _cd.date + ': ' + _cd.done + '/' + _cd.planned;
              html += '<div class="' + _dayClass + '" title="' + _dayTip + '">';
              html += '<div class="recovery-day-label">' + _cd.day + '</div>';
              html += '<div class="recovery-day-dot"></div>';
              html += '</div>';
            }
            html += '</div>';
            html += '</div>';
          }
        }
        html += '</div>';
      }
    }
  } catch (e) {}

  /* Fallback: show original stale-based recovery card if scheduler didn't render */
  if (!_rsPlanRendered && typeof getStaleUnits === 'function') {
    var staleU = getStaleUnits();
    var _rsTypeCount = (staleU.vocab.length > 0 ? 1 : 0)
                     + (staleU.kp.length > 0 ? 1 : 0)
                     + (staleU.pp.length > 0 ? 1 : 0);
    if (staleU.total > 0 && _rsTypeCount > 1) {
      /* Pre-build smart queue for reason cache */
      if (typeof buildSmartRecoveryQueue === 'function') {
        try { buildSmartRecoveryQueue(typeof userBoard !== 'undefined' ? userBoard : null); } catch (e) {}
      }
      html += '<div class="plan-card recovery-session-card">';
      html += '<div class="plan-card-header">';
      html += '<span class="plan-card-icon">\ud83d\udd04</span>';
      html += '<span class="plan-card-title">' + t('Start Recovery', '\u4e00\u952e\u590d\u67e5') + '</span>';
      html += '</div>';
      html += '<div class="plan-card-count">';
      var _rsParts = [];
      if (staleU.vocab.length > 0) _rsParts.push(staleU.vocab.length + ' ' + t('words', '\u8bcd'));
      if (staleU.kp.length > 0) _rsParts.push(staleU.kp.length + ' ' + t('KPs', '\u77e5\u8bc6\u70b9'));
      if (staleU.pp.length > 0) _rsParts.push(staleU.pp.length + ' ' + t('questions', '\u9898'));
      html += _rsParts.join(' + ');
      html += '</div>';
      try {
        if (typeof getLastSmartQueueSummary === 'function') {
          var _rsSummary = getLastSmartQueueSummary();
          if (_rsSummary && _rsSummary.topReasons && _rsSummary.topReasons.length > 0) {
            var _rsReasonParts = [];
            for (var _rri = 0; _rri < Math.min(_rsSummary.topReasons.length, 2); _rri++) {
              _rsReasonParts.push(_rsSummary.topReasons[_rri].label);
            }
            html += '<div class="plan-card-reason">' + t('Because', '\u539f\u56e0') + ': ' + _rsReasonParts.join(' \u00b7 ') + '</div>';
          }
        }
      } catch (e) {}
      html += '<button class="btn btn-primary btn-sm" data-action="start-recovery">' + t('Start', '\u5f00\u59cb') + '</button>';
      html += '</div>';
    }
  }

  /* Student Profile Card (v3.7.0) */
  if (typeof renderStudentProfileCard === 'function') {
    try { var _ph = renderStudentProfileCard(); if (_ph) html += _ph; } catch (e) {}
  }

  /* Learning Goals Card (v3.9.0) */
  if (typeof refreshLearningGoals === 'function') {
    try { refreshLearningGoals(); } catch (e) {}
  }
  if (typeof renderLearningGoalsCard === 'function') {
    try { var _gh = renderLearningGoalsCard(); if (_gh) html += _gh; } catch (e) {}
  }

  /* AI Tutor — Plan guidance (v4.0.0) */
  if (typeof getPlanTutorMessage === 'function') {
    try {
      var _tutorMsg = getPlanTutorMessage();
      if (_tutorMsg && typeof renderTutorBlock === 'function') {
        html += renderTutorBlock(_tutorMsg, 'plan');
      }
    } catch (e) {}
  }

  /* Today's progress */
  var todayStr = new Date().toLocaleDateString('en-CA');
  var _planS = loadS();
  var todayEntry = null;
  if (_planS.history) {
    for (var hi = _planS.history.length - 1; hi >= 0; hi--) {
      if (_planS.history[hi].d === todayStr) { todayEntry = _planS.history[hi]; break; }
    }
  }
  var todayCount = todayEntry ? (todayEntry.a || 0) : 0;
  html += '<div class="plan-card">';
  html += '<div class="plan-card-header">';
  html += '<span class="plan-card-icon">\ud83d\udcc8</span>';
  html += '<span class="plan-card-title">' + t("Today's Progress", '\u4eca\u65e5\u8fdb\u5ea6') + '</span>';
  html += '</div>';
  html += '<div class="plan-card-count">' + todayCount + ' ' + t('activities completed', '\u6b21\u5b66\u4e60\u6d3b\u52a8') + '</div>';
  html += '</div>';

  /* Mistake summary */
  var vocabMistakes = _getVocabMistakes();
  var wb = typeof _ppGetWB === 'function' ? _ppGetWB() : {};
  var ppMistakeCount = 0;
  for (var k in wb) { if (wb[k].status === 'active') ppMistakeCount++; }
  var totalMistakes = vocabMistakes.length + ppMistakeCount;
  if (totalMistakes > 0) {
    html += '<div class="plan-card plan-mistakes-summary">';
    html += '<div class="plan-card-header">';
    html += '<span class="plan-card-icon">\ud83d\udcd5</span>';
    html += '<span class="plan-card-title">' + t('Pending Mistakes', '\u5f85\u89e3\u51b3\u9519\u9898') + '</span>';
    html += '</div>';
    html += '<div class="plan-card-count">' + totalMistakes + ' ' + t('items', '\u9898') + '</div>';
    html += '<button class="btn btn-ghost btn-sm" onclick="navTo(\'mistakes\')">' + t('Review Mistakes', '\u590d\u4e60\u9519\u9898') + '</button>';
    html += '</div>';
  }

  /* Smart Path recommendations */
  if (typeof renderSmartPath === 'function') {
    var sp = renderSmartPath();
    if (sp) html += sp;
  }

  /* Review Plan */
  if (typeof renderReviewPlan === 'function') {
    var rp = renderReviewPlan();
    if (rp) html += rp;
  }

  panel.innerHTML = html;

  /* Delegation for plan actions */
  panel.addEventListener('click', function(e) {
    var refreshBtn = e.target.closest('[data-action="start-refresh"]');
    if (refreshBtn && typeof startRefreshScan === 'function' && typeof getStaleWords === 'function') {
      startRefreshScan(getStaleWords());
    }
    var kpRefreshBtn = e.target.closest('[data-action="start-kp-refresh"]');
    if (kpRefreshBtn && typeof startKPRefreshScan === 'function') startKPRefreshScan();
    var ppRefreshBtn = e.target.closest('[data-action="start-pp-refresh"]');
    if (ppRefreshBtn && typeof startPPRefreshScan === 'function') startPPRefreshScan();
    var recoveryBtn = e.target.closest('[data-action="start-recovery"]');
    if (recoveryBtn && typeof startRecoverySession === 'function') startRecoverySession();
  });
}

/* ═══ MISTAKE BOOK PANEL ═══ */

function _getVocabMistakes() {
  var all = getAllWords();
  var mistakes = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].fail > 0 && all[i].fs !== 'mastered') {
      mistakes.push(all[i]);
    }
  }
  mistakes.sort(function(a, b) { return b.fail - a.fail; });
  return mistakes;
}

var _mistakeTab = 'all';
var _mistakeTabBound = false;

/* Find which board and section a practice question belongs to */
function _findPQInfo(qid) {
  var boards = ['cie', 'edx', '25m'];
  for (var i = 0; i < boards.length; i++) {
    var bd = boards[i];
    if (_pqData[bd]) {
      for (var j = 0; j < _pqData[bd].length; j++) {
        if (_pqData[bd][j].id === qid) return { board: bd, section: _pqData[bd][j].s };
      }
    }
  }
  /* Also check past paper data */
  if (typeof _ppData !== 'undefined') {
    for (var bi = 0; bi < boards.length; bi++) {
      var b2 = boards[bi];
      if (_ppData[b2] && _ppData[b2].questions) {
        for (var qi = 0; qi < _ppData[b2].questions.length; qi++) {
          if (_ppData[b2].questions[qi].id === qid) return { board: b2, section: _ppData[b2].questions[qi].s };
        }
      }
    }
  }
  return null;
}

function reviewMistakeQ(qid) {
  _startMistakeReviewSession([qid]);
}

function _startMistakeReviewSession(qids) {
  /* Load all board data first, then find and start session */
  var loads = [];
  if (typeof loadPastPaperData === 'function') {
    loads.push(loadPastPaperData('cie').catch(function() {}));
    loads.push(loadPastPaperData('edx').catch(function() {}));
  }
  if (typeof loadPracticeData === 'function') {
    loads.push(loadPracticeData('cie').catch(function() {}));
    loads.push(loadPracticeData('edx').catch(function() {}));
  }
  if (typeof loadKaTeX === 'function') loads.push(loadKaTeX());
  showToast(t('Loading...', '\u52a0\u8f7d\u4e2d...'));
  Promise.all(loads).then(function() {
    var questions = [];
    var sessionBoard = null;
    var sessionSection = null;
    for (var i = 0; i < qids.length; i++) {
      var info = _findPQInfo(qids[i]);
      if (!info) continue;
      if (!sessionBoard) { sessionBoard = info.board; sessionSection = info.section; }
      /* Get the question object */
      var q = null;
      if (typeof getPPBySection === 'function') {
        var allQ = getPPBySection(info.board, info.section);
        for (var j = 0; j < allQ.length; j++) {
          if (allQ[j].id === qids[i]) { q = allQ[j]; break; }
        }
      }
      if (q) questions.push(q);
    }
    if (questions.length === 0) {
      showToast(t('Question not found', '\u672a\u627e\u5230\u8be5\u9898\u76ee'));
      return;
    }
    /* Update review counts */
    var wb = typeof _ppGetWB === 'function' ? _ppGetWB() : {};
    for (var k = 0; k < questions.length; k++) {
      var id = questions[k].id;
      if (wb[id]) { wb[id].reviewCount = (wb[id].reviewCount || 0) + 1; wb[id].lastReview = Date.now(); }
    }
    if (typeof _ppSaveWB === 'function') _ppSaveWB(wb);

    _ppSession = {
      questions: questions,
      current: 0,
      mode: 'practice',
      board: sessionBoard,
      sectionId: sessionSection,
      results: [],
      fromMistakeBook: true
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

function renderMistakeBook() {
  var panel = E('panel-mistakes');
  if (!panel) return;
  var html = '';

  html += '<div class="section-title">' + t('Mistake Book', '\u9519\u9898\u672c') + '</div>';

  /* Tabs */
  html += '<div class="mistake-tabs">';
  html += '<button class="mistake-tab' + (_mistakeTab === 'all' ? ' active' : '') + '" data-mtab="all">' + t('All', '\u5168\u90e8') + '</button>';
  html += '<button class="mistake-tab' + (_mistakeTab === 'vocab' ? ' active' : '') + '" data-mtab="vocab">' + t('Vocabulary', '\u8bcd\u6c47') + '</button>';
  html += '<button class="mistake-tab' + (_mistakeTab === 'practice' ? ' active' : '') + '" data-mtab="practice">' + t('Practice', '\u7ec3\u4e60') + '</button>';
  html += '</div>';

  /* Vocab mistakes */
  var vocabMistakes = _getVocabMistakes();
  if (_mistakeTab === 'all' || _mistakeTab === 'vocab') {
    if (vocabMistakes.length > 0) {
      html += '<div class="mistake-section">';
      html += '<div class="mistake-section-title">\ud83d\udcdd ' + t('Vocabulary', '\u8bcd\u6c47') + ' (' + vocabMistakes.length + ')</div>';
      for (var i = 0; i < vocabMistakes.length; i++) {
        var w = vocabMistakes[i];
        html += '<div class="mistake-row">';
        html += '<div class="mistake-word">' + escapeHtml(w.word || '');
        if (w.src === 'reflow') html += '<span class="reflow-tag">' + t('Reflowed', '\u56de\u6d41') + '</span>';
        html += '</div>';
        html += '<div class="mistake-def">' + escapeHtml(w.def || '') + '</div>';
        html += '<div class="mistake-fail">\u2717 ' + w.fail + '</div>';
        html += '<div class="mistake-stars">';
        for (var s = 0; s < w.stars; s++) html += '\u2605';
        html += '</div>';
        html += '</div>';
      }
      html += '<div class="text-center mt-12">';
      html += '<button class="btn btn-primary btn-sm" onclick="startMistakeReview(\'vocab\')">' + t('Re-scan Wrong Words', '\u91cd\u65b0\u626b\u63cf\u9519\u8bcd') + '</button>';
      html += '</div>';
      html += '</div>';
    } else if (_mistakeTab === 'vocab') {
      html += '<div class="mistake-empty">\ud83c\udf89 ' + t('No vocabulary mistakes!', '\u6ca1\u6709\u8bcd\u6c47\u9519\u9898\uff01') + '</div>';
    }
  }

  /* Practice mistakes (wrong book) */
  var wb = typeof _ppGetWB === 'function' ? _ppGetWB() : {};
  var ppItems = [];
  for (var qid in wb) {
    if (wb[qid].status === 'active') ppItems.push({ qid: qid, data: wb[qid] });
  }
  ppItems.sort(function(a, b) { return b.data.addedAt - a.data.addedAt; });

  if (_mistakeTab === 'all' || _mistakeTab === 'practice') {
    if (ppItems.length > 0) {
      html += '<div class="mistake-section">';
      html += '<div class="mistake-section-title">\ud83d\udcdd ' + t('Practice / Past Papers', '\u7ec3\u4e60 / \u771f\u9898') + ' (' + ppItems.length + ')</div>';
      for (var j = 0; j < ppItems.length; j++) {
        var item = ppItems[j];
        var errLabel = item.data.errorType || '';
        if (typeof PP_ERROR_TYPES !== 'undefined' && errLabel) {
          for (var ei = 0; ei < PP_ERROR_TYPES.length; ei++) {
            if (PP_ERROR_TYPES[ei].id === errLabel) {
              errLabel = t(PP_ERROR_TYPES[ei].en, PP_ERROR_TYPES[ei].zh);
              break;
            }
          }
        }
        html += '<div class="mistake-row">';
        html += '<div class="mistake-word">' + escapeHtml(item.qid) + '</div>';
        if (errLabel) html += '<div class="mistake-def">' + escapeHtml(errLabel) + '</div>';
        html += '<div class="mistake-fail">\u00d7' + (item.data.reviewCount || 0) + '</div>';
        html += '<button class="btn btn-ghost btn-xs mistake-review-btn" onclick="reviewMistakeQ(\'' + escapeHtml(item.qid) + '\')">' + t('Review', '\u590d\u4e60') + '</button>';
        html += '</div>';
      }
      html += '<div class="text-center mt-12">';
      html += '<button class="btn btn-primary btn-sm" onclick="reviewAllMistakeQs()">' + t('Review All', '\u5168\u90e8\u590d\u4e60') + ' (' + ppItems.length + ')</button>';
      html += '</div>';
      html += '</div>';
    } else if (_mistakeTab === 'practice') {
      html += '<div class="mistake-empty">\ud83c\udf89 ' + t('No practice mistakes!', '\u6ca1\u6709\u7ec3\u4e60\u9519\u9898\uff01') + '</div>';
    }
  }

  if (vocabMistakes.length === 0 && ppItems.length === 0) {
    html += '<div class="mistake-empty">';
    html += '<div style="font-size:48px;margin-bottom:16px">\ud83c\udf89</div>';
    html += '<div style="font-size:18px;font-weight:600;margin-bottom:8px">' + t('All clear!', '\u5168\u90e8\u89e3\u51b3\uff01') + '</div>';
    html += '<div>' + t('No mistakes to review \u2014 keep up the great work!', '\u6ca1\u6709\u9519\u9898\u9700\u8981\u590d\u4e60\uff0c\u7ee7\u7eed\u52a0\u6cb9\uff01') + '</div>';
    html += '</div>';
  }

  panel.innerHTML = html;

  /* Tab click delegation — bind once */
  if (!_mistakeTabBound) {
    _mistakeTabBound = true;
    E('panel-mistakes').addEventListener('click', function(e) {
      var tab = e.target.closest('[data-mtab]');
      if (tab && tab.dataset.mtab !== _mistakeTab) {
        _mistakeTab = tab.dataset.mtab;
        renderMistakeBook();
      }
    });
  }
}

function reviewAllMistakeQs() {
  var wb = typeof _ppGetWB === 'function' ? _ppGetWB() : {};
  var qids = [];
  for (var qid in wb) {
    if (wb[qid].status === 'active') qids.push(qid);
  }
  if (qids.length === 0) return;
  _startMistakeReviewSession(qids);
}

function startMistakeReview(type) {
  if (type === 'vocab') {
    /* SRS naturally prioritizes failed words (low stars → low SRS level → due first) */
    navTo('review-dash');
  }
}

/* ═══ KNOWLEDGE POINTS DATA & RENDERING ═══ */
var _kpData = {};
var _kpLoading = {};

/* Minimal Markdown→HTML for KP content (handles bold, paragraphs, tables) */
function kpMarkdown(text) {
  if (!text) return '';
  /* Protect LaTeX: temporarily replace $...$ and $$...$$ */
  var latexBlocks = [];
  text = text.replace(/\$\$[\s\S]*?\$\$/g, function(m) { latexBlocks.push(m); return '\x00L' + (latexBlocks.length - 1) + '\x00'; });
  text = text.replace(/\$[^$\n]+?\$/g, function(m) { latexBlocks.push(m); return '\x00L' + (latexBlocks.length - 1) + '\x00'; });
  /* Escape HTML entities */
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /* Bold **text** */
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  /* Markdown tables: detect lines starting with | */
  text = text.replace(/((?:^|\n)\|.+\|(?:\n\|.+\|)*)/g, function(block) {
    var rows = block.trim().split('\n');
    var html = '<table class="kp-table">';
    var isHeader = true;
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri].trim();
      if (!row || row.match(/^\|[\s\-:|]+\|$/)) continue; /* skip separator row */
      var cells = row.split('|').filter(function(c, i, a) { return i > 0 && i < a.length - 1; });
      var tag = isHeader ? 'th' : 'td';
      html += '<tr>';
      for (var ci = 0; ci < cells.length; ci++) html += '<' + tag + '>' + cells[ci].trim() + '</' + tag + '>';
      html += '</tr>';
      if (isHeader) isHeader = false;
    }
    return html + '</table>';
  });
  /* Paragraphs: split by double newline */
  var paragraphs = text.split(/\n\n+/);
  if (paragraphs.length > 1) {
    text = paragraphs.map(function(p) {
      p = p.trim();
      if (!p) return '';
      /* Don't wrap tables or already-wrapped content */
      if (p.indexOf('<table') === 0) return p;
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');
  } else {
    text = text.replace(/\n/g, '<br>');
  }
  /* Restore LaTeX */
  text = text.replace(/\x00L(\d+)\x00/g, function(_, idx) { return latexBlocks[parseInt(idx)]; });
  return text;
}

/* Split explanation text into intro + concept cards */
function _splitExplanation(text) {
  if (!text) return { intro: '', concepts: [] };
  var blocks = text.split(/\n\n+/);
  var concepts = [];
  var intro = [];
  var current = null;
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i].trim();
    if (!b) continue;
    /* Paragraph starts with **Term** — new concept */
    var m = b.match(/^\*\*(.+?)\*\*\s*([\s\S]*)/);
    if (m) {
      if (current) concepts.push(current);
      current = { title: m[1], body: m[2] || '' };
    } else if (current) {
      current.body += '\n\n' + b;
    } else {
      intro.push(b);
    }
  }
  if (current) concepts.push(current);
  return { intro: intro.join('\n\n'), concepts: concepts };
}

/* KP bilingual helper — true when user selected bilingual mode */
function _kpIsZh() { return appLang !== 'en'; }

function loadKnowledgeData(board) {
  if (_kpData[board]) return Promise.resolve(_kpData[board]);
  if (_kpLoading[board]) return _kpLoading[board];
  _kpLoading[board] = fetch('data/knowledge-' + board + '.json?v=' + APP_VERSION)
    .then(function(r) { return r.json(); })
    .then(function(d) { _kpData[board] = d.points || []; _mergeKPEdits(board); return _kpData[board]; })
    .catch(function() { _kpData[board] = []; return []; });
  return _kpLoading[board];
}

/* Merge Supabase KP overrides into cached data */
function _mergeKPEdits(board) {
  var edits = _sectionEditsCache[board] || {};
  var points = _kpData[board] || [];
  Object.keys(edits).forEach(function(secId) {
    var kpOverride = edits[secId] && edits[secId].kp;
    if (!kpOverride) return;
    for (var i = 0; i < points.length; i++) {
      if (points[i].id === secId) {
        Object.keys(kpOverride).forEach(function(k) {
          if (k !== 'id' && k !== 'section' && k !== 'order') points[i][k] = kpOverride[k];
        });
        break;
      }
    }
  });
}

function getKPsForSection(sectionId, board) {
  var pts = _kpData[board] || [];
  return pts.filter(function(kp) { return kp.section === sectionId; })
            .sort(function(a, b) { return a.order - b.order; });
}

function openKnowledgePoint(kpId, board) {
  var pts = _kpData[board] || [];
  var kp = null;
  for (var i = 0; i < pts.length; i++) {
    if (pts[i].id === kpId) { kp = pts[i]; break; }
  }
  if (!kp) return;
  renderKPDetail(kp, board);
  showPanel('kp');
  /* Scroll to top */
  var panel = document.getElementById('panel-kp');
  if (panel) panel.scrollTop = 0;
  window.scrollTo(0, 0);
}

function _truncTitle(str, maxWidth) {
  var w = 0;
  for (var i = 0; i < str.length; i++) {
    w += (str.charCodeAt(i) > 0x2E7F) ? 2 : 1;
    if (w > maxWidth) return str.substring(0, i) + '\u2026';
  }
  return str;
}

function renderKPDetail(kp, board) {
  var el = document.getElementById('panel-kp');
  if (!el) return;
  var isZh = _kpIsZh();
  var sectionKPs = getKPsForSection(kp.section, board);
  var curIdx = -1;
  for (var ci = 0; ci < sectionKPs.length; ci++) {
    if (sectionKPs[ci].id === kp.id) { curIdx = ci; break; }
  }

  /* Find section title */
  var secTitle = kp.section;
  var boardData = BOARD_SYLLABUS[board];
  if (boardData) {
    for (var ch = 0; ch < boardData.length; ch++) {
      var secs = boardData[ch].sections || [];
      for (var si = 0; si < secs.length; si++) {
        if (secs[si].id === kp.section) {
          secTitle = secs[si].id + ' ' + (isZh && secs[si].title_zh ? secs[si].title_zh : secs[si].title);
          break;
        }
      }
    }
  }

  var _kpeAdmin = typeof isSuperAdmin === 'function' && isSuperAdmin();
  function _kpeBtn(field) {
    if (!_kpeAdmin) return '';
    return '<button class="kp-edit-btn" data-kpe-field="' + field + '" data-kpe-id="' + kp.id + '" data-kpe-board="' + board + '" title="Edit">\u270f\ufe0f</button>';
  }
  var html = '<div class="kp-detail">';

  /* Back button */
  html += '<button class="kp-back" data-kp-back-section="' + kp.section + '" data-kp-back-board="' + board + '">';
  html += '\u2190 ' + t('Back to', '\u8fd4\u56de') + ' ' + secTitle;
  html += '</button>';

  /* Hero */
  html += '<div class="kp-hero">';
  html += '<div class="kp-hero-title">' + pqRender(kp.title) + _kpeBtn('title') + '</div>';
  if (kp.title_zh) html += '<div class="kp-hero-sub">' + kp.title_zh + '</div>';
  var heroResult = typeof getKPResult === 'function' ? getKPResult(kp.id) : null;
  if (heroResult) {
    var heroClass = heroResult.score === heroResult.total ? 'kp-hero-score-perfect' : 'kp-hero-score-partial';
    html += '<div class="kp-hero-score ' + heroClass + '">' + t('Score', '\u5f97\u5206') + ': ' + heroResult.score + '/' + heroResult.total + '</div>';
  }
  html += '</div>';

  /* ① Explanation — split into concept cards */
  html += '<div class="kp-section">';
  html += '<div class="kp-section-header">';
  html += '<div class="kp-section-num">1</div>';
  html += '<div class="kp-section-labels"><div class="kp-section-label">' + t('Explanation', '\u77e5\u8bc6\u70b9\u7cbe\u6790') + '</div></div>' + _kpeBtn('explanation');
  html += '</div>';
  var expText = isZh && kp.explanation.zh ? kp.explanation.zh : kp.explanation.en;
  var parsed = _splitExplanation(expText);
  if (parsed.intro) {
    html += '<div class="kp-section-body">' + kpMarkdown(parsed.intro) + '</div>';
  }
  if (parsed.concepts.length > 0) {
    html += '<div class="kp-concepts">';
    for (var ci2 = 0; ci2 < parsed.concepts.length; ci2++) {
      var con = parsed.concepts[ci2];
      html += '<div class="kp-concept">';
      html += '<div class="kp-concept-title">' + pqRender(con.title) + '</div>';
      if (con.body) html += '<div class="kp-concept-body">' + kpMarkdown(con.body) + '</div>';
      html += '</div>';
    }
    html += '</div>';
  } else {
    /* Fallback: no bold headings found, render as single block */
    if (!parsed.intro) {
      html += '<div class="kp-section-body">' + kpMarkdown(expText) + '</div>';
    }
  }
  html += '</div>';

  /* ② Exam Patterns */
  if (kp.examPatterns && kp.examPatterns.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header">';
    html += '<div class="kp-section-num">2</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + t('Exam Patterns', '\u5178\u578b\u8003\u6cd5') + '</div></div>' + _kpeBtn('examPatterns');
    html += '</div>';
    html += '<div class="kp-section-body">';
    for (var pi = 0; pi < kp.examPatterns.length; pi++) {
      var ep = kp.examPatterns[pi];
      html += '<div class="kp-pattern">';
      html += '<div class="kp-pattern-label">' + kpMarkdown(isZh && ep.label_zh ? ep.label_zh : ep.label) + '</div>';
      var epDesc = isZh && ep.description_zh ? ep.description_zh : ep.description;
      if (epDesc) html += '<div class="kp-pattern-desc">' + kpMarkdown(epDesc) + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  /* ③ Worked Examples */
  if (kp.examples && kp.examples.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header">';
    html += '<div class="kp-section-num">3</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + t('Worked Examples', '\u5178\u578b\u4f8b\u9898') + '</div></div>' + _kpeBtn('examples');
    html += '</div>';
    html += '<div class="kp-section-body">';
    for (var ei = 0; ei < kp.examples.length; ei++) {
      var ex = kp.examples[ei];
      html += '<div class="kp-example">';
      html += '<div class="kp-example-header">';
      html += '<span class="kp-example-num">' + t('Example', '\u4f8b\u9898') + ' ' + (ei + 1) + '</span>';
      if (ex.source) html += '<span class="kp-example-source">' + ex.source + '</span>';
      html += '</div>';
      html += '<div class="kp-example-q">' + kpMarkdown(isZh && ex.question_zh ? ex.question_zh : ex.question) + '</div>';
      html += '<button class="kp-example-toggle" aria-expanded="false" data-kp-sol="' + ei + '">' + t('Show Solution', '\u663e\u793a\u89e3\u6790') + ' \u25bc</button>';
      html += '<div class="kp-example-solution" id="kp-sol-' + ei + '">';
      html += kpMarkdown(isZh && ex.solution_zh ? ex.solution_zh : ex.solution);
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  /* ④ Test Yourself — inline MCQ quiz */
  if (kp.testYourself && kp.testYourself.length > 0) {
    html += '<div class="kp-section">';
    html += '<div class="kp-section-header">';
    html += '<div class="kp-section-num">4</div>';
    html += '<div class="kp-section-labels"><div class="kp-section-label">' + t('Test Yourself', '\u81ea\u6d4b') + '</div></div>' + _kpeBtn('testYourself');
    html += '</div>';
    var prevKPResult = typeof getKPResult === 'function' ? getKPResult(kp.id) : null;
    if (prevKPResult) {
      html += '<div class="kp-quiz-summary">';
      html += t('Previous score', '\u4e0a\u6b21\u5f97\u5206') + ': ' + prevKPResult.score + '/' + prevKPResult.total;
      html += ' <button class="kp-quiz-retry" data-kp-retry="' + kp.id + '" data-kp-retry-board="' + board + '">' + t('Retry', '\u91cd\u8bd5') + '</button>';
      html += '</div>';
    }
    html += '<div class="kp-quiz-stack" data-kp-quiz-id="' + kp.id + '" data-kp-quiz-total="' + kp.testYourself.length + '" data-kp-quiz-board="' + board + '">';
    for (var qi = 0; qi < kp.testYourself.length; qi++) {
      var tq = kp.testYourself[qi];
      html += '<div class="kp-quiz-card" data-kp-q-idx="' + qi + '">';
      html += '<div class="kp-quiz-q-num">' + t('Q', '\u7b2c') + (qi + 1) + '</div>';
      html += '<div class="kp-quiz-question">' + kpMarkdown(isZh && tq.q_zh ? tq.q_zh : tq.q) + '</div>';
      html += '<div class="kp-quiz-options">';
      for (var oi = 0; oi < tq.o.length; oi++) {
        html += '<button class="kp-quiz-opt" data-kp-q="' + qi + '" data-kp-opt="' + oi + '">' + pqRender(tq.o[oi]) + '</button>';
      }
      html += '</div>';
      html += '<div class="kp-quiz-explain d-none" id="kp-exp-' + qi + '"></div>';
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="kp-quiz-result d-none" id="kp-quiz-result"></div>';
    html += '</div>';
  }

  /* ⑤ Related Resources */
  html += '<div class="kp-section">';
  html += '<div class="kp-section-header">';
  html += '<div class="kp-section-num">5</div>';
  html += '<div class="kp-section-labels"><div class="kp-section-label">' + t('Related Resources', '\u76f8\u5173\u8d44\u6e90') + '</div></div>' + _kpeBtn('vocabLinks');
  html += '</div>';
  html += '<div class="kp-resource">';
  if (kp.vocabLinks && kp.vocabLinks.length > 0) {
    for (var vi = 0; vi < kp.vocabLinks.length; vi++) {
      var vSlug = kp.vocabLinks[vi];
      var vLv = typeof getLevelBySlug === 'function' ? getLevelBySlug(vSlug) : null;
      var vLabel = vLv ? lvTitle(vLv) : vSlug;
      html += '<button class="kp-resource-link" data-kp-vocab="' + vSlug + '" data-kp-return-id="' + kp.id + '" data-kp-return-board="' + board + '">';
      html += '\ud83d\udcdd ' + escapeHtml(vLabel);
      html += '</button>';
    }
  }
  html += '<button class="kp-resource-link" data-kp-practice-section="' + kp.section + '" data-kp-practice-board="' + board + '" data-kp-return-id="' + kp.id + '">';
  html += '\u270f\ufe0f ' + t('Practice Questions', '\u7ec3\u4e60\u9898');
  html += '</button>';
  /* Related Questions count from Learning Graph */
  if (typeof getKPQuestions === 'function') {
    var relQs = getKPQuestions(kp.id, board);
    if (relQs.length > 0) {
      var _lgPP = 0, _lgMCQ = 0;
      for (var ri = 0; ri < relQs.length; ri++) {
        if (relQs[ri].type === 'pp') _lgPP++;
        else _lgMCQ++;
      }
      html += '<div class="kp-related-qs-info">';
      html += '<span class="text-muted-sm">\ud83d\udcca ';
      if (_lgPP > 0) html += _lgPP + ' ' + t('past paper questions', '\u9053\u771f\u9898');
      if (_lgPP > 0 && _lgMCQ > 0) html += ' \u00b7 ';
      if (_lgMCQ > 0) html += _lgMCQ + ' ' + t('practice questions', '\u9053\u7ec3\u4e60\u9898');
      html += '</span></div>';
    }
  }
  html += '</div>';
  html += '</div>';

  /* Prev/Next Navigation */
  html += '<div class="kp-nav">';
  if (curIdx > 0) {
    var prevTitle = _truncTitle(sectionKPs[curIdx - 1].title, 25);
    html += '<button class="kp-nav-btn" data-kp-nav="' + sectionKPs[curIdx - 1].id + '" data-kp-nav-board="' + board + '">';
    html += '\u2190 ' + escapeHtml(prevTitle);
    html += '</button>';
  } else {
    html += '<button class="kp-nav-btn" disabled>\u2190 ' + t('Previous', '\u4e0a\u4e00\u4e2a') + '</button>';
  }
  if (curIdx >= 0 && curIdx < sectionKPs.length - 1) {
    var nextTitle = _truncTitle(sectionKPs[curIdx + 1].title, 25);
    html += '<button class="kp-nav-btn" data-kp-nav="' + sectionKPs[curIdx + 1].id + '" data-kp-nav-board="' + board + '">';
    html += escapeHtml(nextTitle) + ' \u2192';
    html += '</button>';
  } else {
    html += '<button class="kp-nav-btn" disabled>' + t('Next', '\u4e0b\u4e00\u4e2a') + ' \u2192</button>';
  }
  html += '</div>';

  html += '</div>'; /* /kp-detail */
  el.innerHTML = html;

  /* Trigger KaTeX rendering */
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(el, { delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ]});
  } else if (typeof loadKaTeX === 'function') {
    loadKaTeX(function() {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(el, { delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]});
      }
    });
  }
}

/* KP event delegation */
document.addEventListener('click', function(e) {
  /* KP edit button (super-admin) */
  var kpeBtn = e.target.closest('.kp-edit-btn[data-kpe-field]');
  if (kpeBtn) {
    e.stopPropagation();
    editKPField(kpeBtn.getAttribute('data-kpe-id'), kpeBtn.getAttribute('data-kpe-field'), kpeBtn.getAttribute('data-kpe-board'));
    return;
  }
  /* KP row click → open detail */
  var kpRow = e.target.closest('.kp-row[data-kp-id]');
  if (kpRow) {
    openKnowledgePoint(kpRow.getAttribute('data-kp-id'), kpRow.getAttribute('data-kp-board'));
    return;
  }
  /* Solution toggle */
  var solBtn = e.target.closest('.kp-example-toggle[data-kp-sol]');
  if (solBtn) {
    var solIdx = solBtn.getAttribute('data-kp-sol');
    var solEl = document.getElementById('kp-sol-' + solIdx);
    if (solEl) {
      var isOpen = solEl.classList.toggle('open');
      solBtn.textContent = isOpen
        ? (t('Hide Solution', '\u9690\u85cf\u89e3\u6790') + ' \u25b2')
        : (t('Show Solution', '\u663e\u793a\u89e3\u6790') + ' \u25bc');
      solBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    return;
  }
  /* Back button */
  var backBtn = e.target.closest('.kp-back[data-kp-back-section]');
  if (backBtn) {
    var backSec = backBtn.getAttribute('data-kp-back-section');
    var backBoard = backBtn.getAttribute('data-kp-back-board');
    if (typeof openSection === 'function') {
      openSection(backSec, backBoard);
    }
    return;
  }
  /* Prev/Next nav */
  var navBtn = e.target.closest('.kp-nav-btn[data-kp-nav]');
  if (navBtn) {
    openKnowledgePoint(navBtn.getAttribute('data-kp-nav'), navBtn.getAttribute('data-kp-nav-board'));
    return;
  }
  /* Vocab link */
  var vocabLink = e.target.closest('.kp-resource-link[data-kp-vocab]');
  if (vocabLink) {
    var slug = vocabLink.getAttribute('data-kp-vocab');
    var vKpId = vocabLink.getAttribute('data-kp-return-id');
    var vKpBoard = vocabLink.getAttribute('data-kp-return-board');
    if (vKpId) window._kpReturnContext = { kpId: vKpId, board: vKpBoard };
    if (typeof openDeck === 'function') openDeck(slug);
    return;
  }
  /* Practice link */
  var practiceLink = e.target.closest('.kp-resource-link[data-kp-practice-section]');
  if (practiceLink) {
    var pSec = practiceLink.getAttribute('data-kp-practice-section');
    var pBoard = practiceLink.getAttribute('data-kp-practice-board');
    var pKpId = practiceLink.getAttribute('data-kp-return-id');
    if (pKpId) window._kpReturnContext = { kpId: pKpId, board: pBoard };
    if (typeof startPracticeBySection === 'function') startPracticeBySection(pSec, pBoard);
    return;
  }
  /* KP Quiz — option click */
  var kpOpt = e.target.closest('.kp-quiz-opt[data-kp-q]');
  if (kpOpt) {
    var qCard = kpOpt.closest('.kp-quiz-card');
    if (qCard.classList.contains('answered')) return;
    qCard.classList.add('answered');
    var qIdx = parseInt(kpOpt.getAttribute('data-kp-q'));
    var optIdx = parseInt(kpOpt.getAttribute('data-kp-opt'));
    var stack = kpOpt.closest('.kp-quiz-stack');
    var kpQuizId = stack.getAttribute('data-kp-quiz-id');
    var kpQuizBoard = stack.getAttribute('data-kp-quiz-board');
    var kpQuizTotal = parseInt(stack.getAttribute('data-kp-quiz-total'));
    /* Find correct answer from data */
    var kpPts = _kpData[kpQuizBoard] || [];
    var kpObj = null;
    for (var ki = 0; ki < kpPts.length; ki++) {
      if (kpPts[ki].id === kpQuizId) { kpObj = kpPts[ki]; break; }
    }
    if (!kpObj) return;
    var tqItem = kpObj.testYourself ? kpObj.testYourself[qIdx] : null;
    if (!tqItem) return;
    var ansIdx = tqItem.a;
    var isCorrect = optIdx === ansIdx;
    /* Mark options */
    var allOpts = qCard.querySelectorAll('.kp-quiz-opt');
    for (var oi = 0; oi < allOpts.length; oi++) {
      allOpts[oi].disabled = true;
      if (parseInt(allOpts[oi].getAttribute('data-kp-opt')) === ansIdx) allOpts[oi].classList.add('correct');
    }
    if (!isCorrect) kpOpt.classList.add('wrong');
    /* Sound */
    if (isCorrect && typeof playCorrect === 'function') playCorrect();
    if (!isCorrect && typeof playWrong === 'function') playWrong();
    /* Show explanation */
    var kpIsZh = _kpIsZh();
    var expText = kpIsZh && tqItem.e_zh ? tqItem.e_zh : tqItem.e;
    var expEl = document.getElementById('kp-exp-' + qIdx);
    if (expEl && expText) {
      expEl.innerHTML = (isCorrect ? '\u2705 ' : '\u274c ') + '<strong>' + t('Explanation', '\u89e3\u6790') + ':</strong> ' + kpMarkdown(expText);
      expEl.classList.remove('d-none');
      if (typeof renderMath === 'function') renderMath(expEl);
    }
    /* Check if all answered */
    var answeredCount = stack.querySelectorAll('.kp-quiz-card.answered').length;
    if (answeredCount === kpQuizTotal) {
      var correctCount = 0;
      var allCards = stack.querySelectorAll('.kp-quiz-card');
      for (var ci = 0; ci < allCards.length; ci++) {
        if (!allCards[ci].querySelector('.kp-quiz-opt.wrong')) correctCount++;
      }
      if (typeof saveKPResult === 'function') saveKPResult(kpQuizId, correctCount, kpQuizTotal);
      if (typeof _sectionHealthCache !== 'undefined') _sectionHealthCache = {};
      var resultEl = document.getElementById('kp-quiz-result');
      if (resultEl) {
        var msg = correctCount === kpQuizTotal
          ? t('Perfect score!', '\u6ee1\u5206\uff01')
          : t('You scored', '\u4f60\u5f97\u4e86') + ' ' + correctCount + '/' + kpQuizTotal;
        /* Show FLM status after session */
        var _kpNewFs = typeof getKPFLM === 'function' ? getKPFLM(kpQuizId) : 'new';
        var _fsLabels = { mastered: ['Mastered', '\u5df2\u638c\u63e1'], uncertain: ['Uncertain', '\u4e0d\u786e\u5b9a'], learning: ['Learning', '\u5b66\u4e60\u4e2d'], 'new': ['New', '\u65b0'] };
        var _fsL = _fsLabels[_kpNewFs] || _fsLabels['new'];
        msg += '<div class="kp-flm-chip kp-flm-' + _kpNewFs + '">' + t(_fsL[0], _fsL[1]) + '</div>';
        resultEl.innerHTML = '<div class="kp-quiz-score">' + msg + '</div>';
        resultEl.classList.remove('d-none');
        setTimeout(function() { resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
      }
    }
    return;
  }
  /* KP Quiz — retry */
  var retryBtn = e.target.closest('.kp-quiz-retry[data-kp-retry]');
  if (retryBtn) {
    openKnowledgePoint(retryBtn.getAttribute('data-kp-retry'), retryBtn.getAttribute('data-kp-retry-board'));
    return;
  }
});

/* KP keyboard navigation */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var kpRow = e.target.closest('.kp-row[data-kp-id]');
  if (kpRow) { e.preventDefault(); kpRow.click(); return; }
  var navBtn = e.target.closest('.kp-nav-btn:not(:disabled)');
  if (navBtn) { e.preventDefault(); navBtn.click(); return; }
  var togBtn = e.target.closest('.kp-example-toggle[data-kp-sol]');
  if (togBtn) { e.preventDefault(); togBtn.click(); return; }
  /* Syllabus interactive elements */
  var t2 = e.target;
  if (t2.hasAttribute('onclick') && (
    t2.classList.contains('deck-row') || t2.classList.contains('sec-module') ||
    t2.classList.contains('sec-module-expandable') || t2.classList.contains('we-card-header') ||
    t2.classList.contains('smart-path-header') || t2.classList.contains('review-plan-item') ||
    t2.classList.contains('pp-browse-entry') || t2.classList.contains('category-header')
  )) { e.preventDefault(); t2.click(); }
});

/* ═══ INIT ═══ */
/* Auto-load all board data on script load */
loadCIESyllabus();
loadEdexcelSyllabus();
loadHHKSyllabus();
/* Pre-load knowledge point data for active boards */
loadKnowledgeData('cie');
loadKnowledgeData('hhk');
loadKnowledgeData('edexcel');
