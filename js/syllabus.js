/* ══════════════════════════════════════════════════════════════
   syllabus.js — Multi-board syllabus-driven navigation + section detail
   Supports CIE 0580, Edexcel 4MA1, and Harrow Haikou (HHK).
   Loaded after mastery.js, before practice.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ GLOBALS ═══ */
var BOARD_SYLLABUS = {};      /* { cie: {...}, edx: {...}, hhk: {...} } */
var BOARD_VOCAB = {};         /* { cie: {...}, edx: {...}, hhk: {...} } */
var _boardSectionLevelMap = {};  /* { cie: {id→idx}, edx: {id→idx}, hhk: {id→idx} } */
var _sectionEditsCache = {};  /* { cie: { secId: { module: data } }, edx: ..., hhk: ... } */
var _sectionInfoCache = {};   /* { 'board:sectionId' → {chapter,section,sectionIndex,board} } */

/* Legacy aliases — keep existing code working */
var CIE_SYLLABUS = null;
var CIE_VOCAB = null;
var _cieSectionLevelMap = {};

var _boardReady = { cie: false, edx: false, hhk: false };
var _boardLoading = { cie: null, edx: null, hhk: null };
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

function loadEdxSyllabus() {
  return _loadBoardSyllabus('edx');
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
  else if (board === 'edx') _edxDataReady = true;
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

/* Get words array from vocab data for a section (handles old and new formats).
   Old format: { "sectionId": [{word,def,id}, ...] }
   New format: { words: {uid: {word,def}}, sections: {sectionId: [uid,...]} }
   Returns: [{word, def}, ...] */
function _getVocabWords(vocab, sectionId) {
  if (vocab && vocab.words && vocab.sections) {
    var uids = vocab.sections[sectionId];
    if (!uids) return [];
    var result = [];
    for (var i = 0; i < uids.length; i++) {
      var w = vocab.words[uids[i]];
      if (w) result.push(w);
    }
    return result;
  }
  return vocab && vocab[sectionId] ? vocab[sectionId] : [];
}

/* Mark old levels as hidden and create new virtual levels for a board (idempotent) */
function _initBoardLevels(board) {
  var syllabus = BOARD_SYLLABUS[board];
  var vocab = BOARD_VOCAB[board];
  var boardKey = board === 'hhk' ? '25m' : board;  /* LEVELS uses 'edx'/'25m' */

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
        _board: board  /* 'cie' or 'edx' — for syllabus lookups */
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
  var boards = board ? [board] : ['cie', 'edx', 'hhk'];
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
  var _ppBoardKey = board === 'hhk' ? '25m' : board;
  if ((board === 'cie' || board === 'edx') && typeof ppShowPaperBrowse === 'function' && typeof _ppAccessAllowed === 'function' && _ppAccessAllowed(_ppBoardKey)) {
    var _ppSub = board === 'cie'
      ? t('228 papers \u00b7 4,110 questions \u00b7 2018\u20132025', '228\u5957\u5377 \u00b7 4,110\u9053\u9898 \u00b7 2018\u20132025')
      : t('76 papers \u00b7 1,855 questions \u00b7 2017\u20132025', '76\u5957\u5377 \u00b7 1,855\u9053\u9898 \u00b7 2017\u20132025');
    html += '<div class="pp-browse-entry" role="button" tabindex="0" onclick="ppShowPaperBrowse(\'' + escapeHtml(_ppBoardKey) + '\')">';
    html += '<span class="pp-browse-icon">\ud83d\udcdd</span>';
    html += '<div class="pp-browse-info">';
    html += '<div class="pp-browse-title">' + t('Past Papers', '\u5957\u5377/\u4e13\u9898\u7ec3\u4e60') + '</div>';
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
      var words = _getVocabWords(vocab, sec.id);
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
    html += '<div class="category-header" role="button" tabindex="0" onclick="toggleCIEChapter(\'' + escapeHtml(catKey) + '\')">';
    var _chEmoji = Array.isArray(emojis) ? (emojis[ch.num] || '\ud83d\udcda') : (emojis[ch.num] || '\ud83d\udcda');
    html += '<span class="category-emoji">' + _chEmoji + '</span>';
    if (board === 'hhk') {
      html += '<span class="category-name">' + biText(ch.title, ch.title_zh) + '</span>';
      html += '<span class="category-count">' + ch.sections.length + ' ' + t('units', '\u5355\u5143') + '</span>';
    } else {
      html += '<span class="category-name">' + ch.num + '. ' + biText(ch.title, ch.title_zh) + '</span>';
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
        html += '<button class="sort-btn" onclick="startPracticeByChapter(' + ch.num + ',\'' + escapeHtml(board) + '\')">\ud83d\udcdd ' + t('Practice', '\u7ec3\u4e60') + '</button>';
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

function renderEdxHome() {
  if (!_edxDataReady || !BOARD_SYLLABUS.edx) return '';
  return _renderBoardHome('edx');
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

/* Get combined stats across all vocabSlug levels for an HHK section.
   Deduplicates by wordKey so global-uid words crossing multiple levels count once. */
function _getHHKSectionStats(sec, _wd) {
  if (!sec.vocabSlugs || sec.vocabSlugs.length === 0) return { pct: 0, started: 0, total: 0, learningPct: 0, masteryPct: 0, mastered: 0 };
  var wd = _wd || getWordData();
  var slugIdx = _ensureHHKSlugIdx();
  var seenKeys = {};
  var totalWords = 0, totalStars = 0, mastered = 0, started = 0;
  for (var i = 0; i < sec.vocabSlugs.length; i++) {
    var si = slugIdx[sec.vocabSlugs[i]];
    if (si === undefined) continue;
    var pairs = getPairs(LEVELS[si].vocabulary);
    for (var pi = 0; pi < pairs.length; pi++) {
      var key = wordKey(si, pairs[pi].lid);
      if (seenKeys[key]) continue;
      seenKeys[key] = true;
      totalWords++;
      var d = wd[key];
      var fs = d ? (d.fs || 'new') : 'new';
      if (fs === 'mastered') mastered++;
      if (d && ((d.ok || 0) >= 1 || fs !== 'new')) started++;
      /* Star contribution: mastered=4, uncertain=3, learning=1, new=0 */
      var starVal = fs === 'mastered' ? 4 : fs === 'uncertain' ? 3 : fs === 'learning' ? 1 : 0;
      totalStars += starVal;
    }
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
  var words = _getVocabWords(vocab, sec.id);
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
  h += '<div class="deck-row" role="button" tabindex="0" onclick="openSection(\'' + escapeHtml(sec.id) + '\',\'' + escapeHtml(board) + '\')">';
  h += '<span class="deck-row-tag sec-tag">' + sec.id + '</span>';
  h += '<span class="deck-row-name">' + biText(escapeHtml(sec.title), escapeHtml(sec.title_zh)) + tierBadge + '</span>';
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

  /* Set breadcrumb (v5.31.0) */
  if (typeof breadcrumbSet === 'function') {
    var _modId = board === 'hhk' ? 'hhk' : board;
    var _mod = null;
    if (typeof HOME_MODULES !== 'undefined') {
      for (var _mi = 0; _mi < HOME_MODULES.length; _mi++) {
        if (HOME_MODULES[_mi].id === _modId) { _mod = HOME_MODULES[_mi]; break; }
      }
    }
    var crumbs = [
      { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" }
    ];
    if (_mod) {
      crumbs.push({ id: _modId, label: _mod.title, labelZh: _mod.titleZh, action: "openBoardHome('" + _modId + "')" });
    }
    if (board === 'hhk') {
      var _yrNum = info.chapter ? info.chapter.num : null;
      if (_yrNum) {
        crumbs.push({ id: 'y' + _yrNum, label: 'Year ' + _yrNum, labelZh: 'Y' + _yrNum, action: "openBoardYear('hhk'," + _yrNum + ")" });
      }
    } else {
      crumbs.push({ id: 'topics', label: 'Topics', labelZh: '\u4e13\u9898', action: "openBoardTopics('" + _modId + "')" });
      if (info.chapter) {
        var _chTitle = info.chapter.title || '';
        crumbs.push({ id: 'ch' + info.chapter.num, label: info.chapter.num + '. ' + _chTitle, labelZh: info.chapter.num + '. ' + (info.chapter.title_zh || _chTitle), action: "openBoardChapter('" + _modId + "'," + info.chapter.num + ")" });
      }
    }
    var _secTitle = info.section ? (info.section.title || sectionId) : sectionId;
    var _secTitleZh = info.section ? (info.section.title_zh || _secTitle) : _secTitle;
    crumbs.push({ id: sectionId, label: sectionId + ' ' + _secTitle, labelZh: sectionId + ' ' + _secTitleZh });
    breadcrumbSet(crumbs);
  }

  var _doOpen = function() {
    renderSectionDetail(info.chapter, info.section, info.sectionIndex, info.board);
    navPush('section');
    showPanel('section');
  };
  if (typeof renderSectionDetail === 'function') { _doOpen(); }
  else { _lazyLoad('syllabus-views', _doOpen); }
}

/* ═══ SMART PATH — Section Health + Recommendations (Phase 10D-A) ═══ */

var _sectionHealthCache = {};

function _invalidateSectionHealthCache() { _sectionHealthCache = {}; }


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

  /* HHK: aggregate across all vocabSlug levels (deduplicated by wordKey) */
  if (board === 'hhk') {
    var secInfo = getSectionInfo(sectionId, 'hhk');
    if (secInfo && secInfo.section.vocabSlugs && secInfo.section.vocabSlugs.length > 0) {
      var hhkStats = _getHHKSectionStats(secInfo.section);
      vocabScore = hhkStats.learningPct || 0;
      hasVocab = hhkStats.total > 0;
      /* Aggregate FLM data across all sub-levels (dedup by wordKey) */
      var wd = getWordData();
      var totalOk = 0, totalFail = 0, lastActive = 0, masteredN = 0, totalN = 0;
      var _healthSeen = {};
      secInfo.section.vocabSlugs.forEach(function(slug) {
        var _si = getLevelIdxBySlug(slug);
        if (_si < 0) return;
        getPairs(LEVELS[_si].vocabulary).forEach(function(p) {
          var _wk = wordKey(_si, p.lid);
          if (_healthSeen[_wk]) return;
          _healthSeen[_wk] = true;
          var d = wd[_wk];
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
  var ppBoard = board === 'hhk' ? null : board;
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
  _lazyCall('practice', 'startPractice', [li]);
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
  _lazyCall('practice', 'startPractice', [li]);
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

  /* Set breadcrumb (v5.31.0) */
  if (typeof breadcrumbSet === 'function' && kp.section) {
    var _modId = board === 'hhk' ? 'hhk' : board;
    var _mod = null;
    if (typeof HOME_MODULES !== 'undefined') {
      for (var _mi = 0; _mi < HOME_MODULES.length; _mi++) {
        if (HOME_MODULES[_mi].id === _modId) { _mod = HOME_MODULES[_mi]; break; }
      }
    }
    var _secInfo = typeof getSectionInfo === 'function' ? getSectionInfo(kp.section, board) : null;
    var crumbs = [
      { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" }
    ];
    if (_mod) {
      crumbs.push({ id: _modId, label: _mod.title, labelZh: _mod.titleZh, action: "openBoardHome('" + _modId + "')" });
    }
    crumbs.push({ id: kp.section, label: kp.section, labelZh: kp.section, action: "openSection('" + kp.section + "','" + board + "')" });
    var _kpTitle = kp.title || kpId;
    var _kpTitleZh = kp.title_zh || _kpTitle;
    crumbs.push({ id: kpId, label: _kpTitle, labelZh: _kpTitleZh });
    breadcrumbSet(crumbs);
  }

  var _doOpen = function() {
    renderKPDetail(kp, board);
    showPanel('kp');
    var panel = document.getElementById('panel-kp');
    if (panel) panel.scrollTop = 0;
    window.scrollTo(0, 0);
  };
  if (typeof renderKPDetail === 'function') { _doOpen(); }
  else { _lazyLoad('syllabus-views', _doOpen); }
}

function _truncTitle(str, maxWidth) {
  var w = 0;
  for (var i = 0; i < str.length; i++) {
    w += (str.charCodeAt(i) > 0x2E7F) ? 2 : 1;
    if (w > maxWidth) return str.substring(0, i) + '\u2026';
  }
  return str;
}

/* ═══ INIT ═══ */
/* Load only the boards the user needs (called after auth sets userBoard) */
function loadVisibleBoardData() {
  var boards = getVisibleBoards();
  var promises = [];
  for (var i = 0; i < boards.length; i++) {
    var bid = boards[i].id;
    if (bid === 'cie') { promises.push(loadCIESyllabus()); loadKnowledgeData('cie'); }
    else if (bid === 'edx') { promises.push(loadEdxSyllabus()); }
    else if (bid === '25m') { promises.push(loadHHKSyllabus()); loadKnowledgeData('hhk'); }
  }
  return Promise.all(promises).catch(function() {});
}
loadKnowledgeData('edx');
