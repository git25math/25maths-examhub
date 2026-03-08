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

/* Legacy aliases — keep existing code working */
var CIE_SYLLABUS = null;
var CIE_VOCAB = null;
var _cieSectionLevelMap = {};

var _cieDataReady = false;
var _cieDataLoading = false;
var _edxDataReady = false;
var _edxDataLoading = false;
var _hhkDataReady = false;
var _hhkDataLoading = false;

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
  if (board === 'cie' && _cieDataReady) return Promise.resolve();
  if (board === 'edexcel' && _edxDataReady) return Promise.resolve();
  if (board === 'hhk' && _hhkDataReady) return Promise.resolve();
  if (board === 'cie' && _cieDataLoading) return _cieDataLoading;
  if (board === 'edexcel' && _edxDataLoading) return _edxDataLoading;
  if (board === 'hhk' && _hhkDataLoading) return _hhkDataLoading;

  var syllabusFile = 'data/syllabus-' + board + '.json';
  var vocabFile = 'data/vocabulary-' + board + '.json';

  var loadingPromise = Promise.all([
    fetch(syllabusFile).then(function(r) { return r.json(); }),
    fetch(vocabFile).then(function(r) { return r.json(); }),
    loadSectionEdits(board)
  ]).then(function(results) {
    BOARD_SYLLABUS[board] = results[0];
    BOARD_VOCAB[board] = results[1];

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
        if (appView === 'home' && typeof renderHome === 'function') renderHome();
      });
    } else {
      _setBoardReady(board);
      _initBoardLevels(board);
    }
  }).catch(function(e) {
    console.error('Failed to load ' + board + ' syllabus data:', e);
  });

  if (board === 'cie') _cieDataLoading = loadingPromise;
  else if (board === 'edexcel') _edxDataLoading = loadingPromise;
  else if (board === 'hhk') _hhkDataLoading = loadingPromise;

  return loadingPromise;
}

function _setBoardReady(board) {
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
  var boards = board ? [board] : ['cie', 'edexcel', 'hhk'];
  for (var bi = 0; bi < boards.length; bi++) {
    var syl = BOARD_SYLLABUS[boards[bi]];
    if (!syl) continue;
    for (var i = 0; i < syl.chapters.length; i++) {
      var ch = syl.chapters[i];
      for (var j = 0; j < ch.sections.length; j++) {
        if (ch.sections[j].id === sectionId) {
          return { chapter: ch, section: ch.sections[j], sectionIndex: j, board: boards[bi] };
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
    html += '<div class="pp-browse-entry" onclick="ppShowPaperBrowse(\'' + _ppBoardKey + '\')">';
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
        var hhkSt = _getHHKSectionStats(sec);
        chTotalWords += hhkSt.total;
        chMastered += hhkSt.mastered;
        chTotalStars += Math.round(hhkSt.learningPct * hhkSt.total * 4 / 100);
        chMaxStars += hhkSt.total * 4;
      } else {
        var li = getSectionLevelIdx(sec.id, board);
        if (li >= 0) {
          var stats = getDeckStats(li);
          chTotalWords += stats.total;
          chMastered += stats.mastered;
          chTotalStars += Math.round(stats.learningPct * stats.total * 4 / 100);
          chMaxStars += stats.total * 4;
        }
      }
    });

    if (visibleSections.length === 0) return;

    html += '<div class="category-section' + (collapsed ? ' collapsed' : '') + '" id="cat-' + catKey + '">';
    html += '<div class="category-header" onclick="toggleCIEChapter(\'' + catKey + '\')">';
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

    visibleSections.forEach(function(sec) {
      html += _renderSectionRow(sec, ch, board);
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

/* Get combined stats across all vocabSlug levels for an HHK section */
function _getHHKSectionStats(sec) {
  if (!sec.vocabSlugs || sec.vocabSlugs.length === 0) return { pct: 0, started: 0, total: 0, learningPct: 0, masteryPct: 0, mastered: 0 };
  var totalWords = 0, totalStars = 0, mastered = 0, started = 0;
  var wd = getWordData();
  for (var si = 0; si < LEVELS.length; si++) {
    var lv = LEVELS[si];
    if (lv.board !== '25m') continue;
    if (sec.vocabSlugs.indexOf(lv.slug) < 0) continue;
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
function _renderSectionRow(sec, ch, board) {
  board = board || 'cie';
  var vocab = BOARD_VOCAB[board] || {};
  var li = getSectionLevelIdx(sec.id, board);
  var words = vocab[sec.id] || [];
  var stats;
  if (board === 'hhk') {
    stats = _getHHKSectionStats(sec);
  } else {
    stats = li >= 0 ? getDeckStats(li) : { pct: 0, started: 0, total: words.length, learningPct: 0, masteryPct: 0 };
  }

  var tierBadge = '';
  if (sec.tier === 'extended') tierBadge = ' <span class="tier-badge tier-ext">E</span>';
  else if (sec.tier === 'core') tierBadge = ' <span class="tier-badge tier-core">C</span>';
  else if (sec.tier === 'higher') tierBadge = ' <span class="tier-badge tier-higher">H</span>';
  else if (sec.tier === 'foundation') tierBadge = ' <span class="tier-badge tier-foundation">F</span>';

  var h = '';
  h += '<div class="deck-row" onclick="openSection(\'' + sec.id + '\',\'' + board + '\')">';
  h += '<span class="deck-row-tag sec-tag">' + sec.id + '</span>';
  h += '<span class="deck-row-name">' + escapeHtml(sec.title);
  if (appLang !== 'en') h += ' ' + escapeHtml(sec.title_zh);
  h += tierBadge + '</span>';
  /* 3-state indicator: empty=not started, half=in progress, full=mastered */
  if (words.length > 0) {
    var _dotClass = stats.started === 0 ? 'sec-dot-empty' : (stats.pct >= 80 ? 'sec-dot-full' : 'sec-dot-half');
    h += '<span class="sec-dot ' + _dotClass + '"></span>';
    if (stats.pct >= 80) h += '<span class="sec-done-check">\u2713</span>';
  }
  h += '</div>';
  return h;
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
    html += '<div class="sec-health-bar" style="background:' + statusColor + ';width:4px;min-height:100%;border-radius:2px"></div>';
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
  html += '<div class="flex items-center" style="gap:4px">';
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
    html += '<div class="sec-module" style="flex-direction:column;align-items:stretch;gap:8px">';
    if (_jVocabDone) html += '<div class="sec-module-done">\u2713</div>';
    html += '<div style="display:flex;align-items:center;gap:12px">';
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
      html += '<div class="deck-row" style="margin:0" onclick="openDeck(' + _li + ')">';
      html += '<span class="deck-row-tag">' + (si + 1) + '</span>';
      html += '<span class="deck-row-name">' + escapeHtml(subTitle) + '</span>';
      html += '<span class="deck-row-count">' + subStats.started + '/' + subStats.total + '</span>';
      html += '<span class="deck-row-progress"><span class="deck-row-progress-fill" style="width:' + subStats.pct + '%"></span></span>';
      html += '<span class="deck-row-pct">' + subStats.pct + '%</span>';
      html += '</div>';
    });
    html += '</div>';
  } else if (words.length > 0 && li >= 0) {
    html += '<div class="sec-module" onclick="openDeck(' + li + ')">';
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
    html += '<div class="sec-module" onclick="startPracticeBySection(\'' + sec.id + '\',\'' + board + '\')">';
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

  /* Knowledge card (3rd) — show content if edited, else "Coming soon" */
  var knowledgeEdit = _getSectionEdit(board, sec.id, 'knowledge');
  if (knowledgeEdit && knowledgeEdit.content) {
    html += '<div class="sec-module sec-module-expandable" onclick="toggleSectionContent(this)">';
    html += '<div class="sec-module-icon">\ud83d\udcd8</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Knowledge Card', '\u77e5\u8bc6\u5361\u7247') + '</div>';
    html += '<div class="sec-module-sub">' + t('Click to expand', '\u70b9\u51fb\u5c55\u5f00') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();editSectionModule(\'' + sec.id + '\',\'knowledge\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'knowledge\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '<div class="sec-module-arrow">\u25bc</div>';
    html += '</div>';
    html += '<div class="sec-module-content d-none">';
    html += '<div class="sec-module-content-body">' + pqRender(knowledgeEdit.content) + '</div>';
    if (knowledgeEdit.content_zh) {
      html += '<div class="sec-module-content-body" style="margin-top:8px;color:var(--c-text2)">' + pqRender(knowledgeEdit.content_zh) + '</div>';
    }
    html += '</div>';
  } else {
    html += '<div class="sec-module sec-module-coming">';
    html += '<div class="sec-module-icon">\ud83d\udcd8</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Knowledge Card', '\u77e5\u8bc6\u5361\u7247') + '</div>';
    html += '<div class="sec-module-sub">' + t('Coming soon', '\u5373\u5c06\u63a8\u51fa') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();editSectionModule(\'' + sec.id + '\',\'knowledge\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'knowledge\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '</div>';
  }

  /* Worked Examples (4th) — show content if edited, else "Coming soon" */
  var examplesEdit = _getSectionEdit(board, sec.id, 'examples');
  if (examplesEdit && examplesEdit.content) {
    html += '<div class="sec-module sec-module-expandable" onclick="toggleSectionContent(this)">';
    html += '<div class="sec-module-icon">\ud83d\udcd6</div>';
    html += '<div class="sec-module-info">';
    html += '<div class="sec-module-title">' + t('Worked Examples', '\u7ecf\u5178\u4f8b\u9898') + '</div>';
    html += '<div class="sec-module-sub">' + t('Click to expand', '\u70b9\u51fb\u5c55\u5f00') + '</div>';
    html += '</div>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="sec-module-edit" onclick="event.stopPropagation();editSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Edit', '\u7f16\u8f91') + '">\u270f\ufe0f</button>';
    }
    html += '<button class="sec-module-report" onclick="event.stopPropagation();reportSectionModule(\'' + sec.id + '\',\'examples\',\'' + board + '\')" title="' + t('Report error', '\u62a5\u544a\u9519\u8bef') + '">\ud83d\udea9</button>';
    html += '<div class="sec-module-arrow">\u25bc</div>';
    html += '</div>';
    html += '<div class="sec-module-content d-none">';
    html += '<div class="sec-module-content-body">' + pqRender(examplesEdit.content) + '</div>';
    if (examplesEdit.content_zh) {
      html += '<div class="sec-module-content-body" style="margin-top:8px;color:var(--c-text2)">' + pqRender(examplesEdit.content_zh) + '</div>';
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

  /* Vocab score + fail rate + recency + retention in single pass */
  var retentionScore = 0;
  var practiceScore = 0;

  /* HHK: aggregate across all vocabSlug levels */
  if (board === 'hhk') {
    var secInfo = getSectionInfo(sectionId, 'hhk');
    if (secInfo && secInfo.section.vocabSlugs && secInfo.section.vocabSlugs.length > 0) {
      var hhkStats = _getHHKSectionStats(secInfo.section);
      vocabScore = hhkStats.learningPct || 0;
      hasVocab = hhkStats.total > 0;
      /* Aggregate SRS data across all sub-levels */
      var wd = getWordData();
      var totalOk = 0, totalFail = 0, lastActive = 0, srsSum = 0, srsCount = 0;
      for (var _si = 0; _si < LEVELS.length; _si++) {
        if (LEVELS[_si].board !== '25m') continue;
        if (secInfo.section.vocabSlugs.indexOf(LEVELS[_si].slug) < 0) continue;
        getPairs(LEVELS[_si].vocabulary).forEach(function(p) {
          var d = wd[wordKey(_si, p.lid)];
          if (d) {
            totalOk += d.ok || 0;
            totalFail += d.fail || 0;
            if (d.lr && d.lr > lastActive) lastActive = d.lr;
            if (d.lv != null) { srsSum += d.lv; srsCount++; }
          }
        });
      }
      failRate = (totalOk + totalFail) > 0 ? Math.round(totalFail / (totalOk + totalFail) * 100) : 0;
      if (lastActive > 0) {
        var daysAgo = (Date.now() - lastActive) / 86400000;
        recency = daysAgo < 1 ? 1.0 : daysAgo < 7 ? 0.95 : daysAgo < 30 ? 0.85 : 0.7;
      }
      if (srsCount > 0) retentionScore = Math.round((srsSum / srsCount / 7) * 100 * recency);
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
    var srsSum = 0, srsCount = 0;
    pairs.forEach(function(p) {
      var d = wd[wordKey(li, p.lid)];
      if (d) {
        totalOk += d.ok || 0;
        totalFail += d.fail || 0;
        if (d.lr && d.lr > lastActive) lastActive = d.lr;
        if (d.lv != null) { srsSum += d.lv; srsCount++; }
      }
    });
    failRate = (totalOk + totalFail) > 0 ? Math.round(totalFail / (totalOk + totalFail) * 100) : 0;
    if (lastActive > 0) {
      var daysAgo = (Date.now() - lastActive) / 86400000;
      recency = daysAgo < 1 ? 1.0 : daysAgo < 7 ? 0.95 : daysAgo < 30 ? 0.85 : 0.7;
    }
    /* Retention: avg SRS level (0-7) → 0-100%, with recency decay */
    if (srsCount > 0) {
      retentionScore = Math.round((srsSum / srsCount / 7) * 100 * recency);
    }
    /* Practice MCQ score */
    if (typeof isModeDone === 'function' && isModeDone(li, 'practice')) {
      practiceScore = 100;
    }
  }

  /* PP score from ppGetSectionStats (only if data loaded, skip HHK) */
  var ppBoard = board === 'edexcel' ? 'edx' : board === 'hhk' ? null : board;
  if (ppBoard && typeof ppGetSectionStats === 'function' && typeof _ppData !== 'undefined' && _ppData[ppBoard]) {
    var ps = ppGetSectionStats(ppBoard, sectionId);
    if (ps.total > 0) {
      hasPP = true;
      ppScore = Math.round((ps.mastered * 100 + ps.partial * 50 + ps.needsWork * 10) / (ps.total * 100) * 100);
    }
  }

  /* Composite score */
  var score;
  if (hasVocab && hasPP) {
    score = Math.round((vocabScore * 0.4 + ppScore * 0.6) * recency);
  } else if (hasVocab) {
    score = Math.round(vocabScore * recency);
  } else if (hasPP) {
    score = Math.round(ppScore * recency);
  } else {
    score = 0;
  }

  /* Recommendation */
  var rec;
  if (vocabScore === 0 && ppScore === 0 && practiceScore === 0) rec = 'start';
  else if (score >= 80) rec = 'great';
  else if (failRate > 40) rec = 'review_words';
  else if (vocabScore < 30) rec = 'vocab';
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
    practiceScore: practiceScore, retentionScore: retentionScore,
    recency: recency, rec: rec, hasVocab: hasVocab, hasPP: hasPP,
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
  html += '<div class="smart-path-header" onclick="toggleSmartPath()">';
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
    html += '<div class="review-plan-item" onclick="openSection(\'' + c.sectionId + '\',\'' + c.board + '\')">';
    html += '<span class="review-plan-sec">' + c.sectionId + '</span>';
    html += '<span class="review-plan-name">' + title + '</span>';
    var retLabel = c.retentionScore >= 50 ? t('Fading', '\u6de1\u5fd8\u4e2d') : t('Needs refresh', '\u9700\u8981\u590d\u4e60');
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
  h += '<div class="sec-module" style="flex-direction:column;align-items:stretch;gap:8px;position:relative">';
  if (_ppModuleDone) h += '<div class="sec-module-done">\u2713</div>';
  h += '<div style="display:flex;align-items:center;gap:12px">';
  h += '<div class="sec-module-icon">\ud83d\udcc4</div>';
  h += '<div class="sec-module-info">';
  h += '<div class="sec-module-title">' + t('Past Papers', '\u771f\u9898\u7ec3\u4e60') + '</div>';
  h += '<div class="sec-module-sub">' + ppStats.total + ' ' + t('questions', '\u9898') + ' \u00b7 CIE 0580</div>';
  h += '</div></div>';

  /* Mastery stats */
  h += '<div class="pp-module-stats">';
  if (ppStats.newQ > 0) h += '<span class="pp-module-stat new">\u2b1c ' + ppStats.newQ + ' ' + t('New', '\u65b0\u9898') + '</span>';
  if (ppStats.needsWork > 0) h += '<span class="pp-module-stat needs-work">\ud83d\udd34 ' + ppStats.needsWork + ' ' + t('Needs Work', '\u5f85\u6539\u8fdb') + '</span>';
  if (ppStats.partial > 0) h += '<span class="pp-module-stat partial-stat">\ud83d\udfe1 ' + ppStats.partial + ' ' + t('Partial', '\u90e8\u5206') + '</span>';
  if (ppStats.mastered > 0) h += '<span class="pp-module-stat mastered-stat">\u2705 ' + ppStats.mastered + ' ' + t('Mastered', '\u5df2\u638c\u63e1') + '</span>';
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
      h += '<div style="font-size:12px;color:var(--c-muted);margin-top:4px">';
      h += '\ud83d\udcdd ' + t('Vocabulary', '\u8bcd\u6c47') + ': ';
      h += '<b>' + learnedW + '</b>/' + totalW + ' ' + t('learned', '\u5df2\u5b66');
      if (learnedW < totalW) {
        h += ' \u00b7 <span style="cursor:pointer;color:var(--c-primary);text-decoration:underline" ';
        h += 'onclick="event.stopPropagation();openDeck(' + secLevelIdx + ')">';
        h += t('Study now', '\u53bb\u5b66\u4e60') + '</span>';
      }
      h += '</div>';
    }
  }

  /* Question type breakdown */
  h += '<div class="mt-4">';
  h += '<div style="font-size:11px;color:var(--c-muted);margin-bottom:4px">' + t('By Question Type', '\u8003\u6cd5\u9898\u578b\u5206\u7c7b') + '</div>';
  h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
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
    h += '<div style="font-size:11px;color:var(--c-muted);margin-bottom:4px">' + t('By Command Word', '\u6309\u6307\u4ee4\u52a8\u8bcd') + '</div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
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
    h += '<div class="pp-focus-areas" style="margin-top:6px">';
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
  h += '<button class="btn btn-sm" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="practice" style="flex:1;min-width:120px">';
  h += '\ud83d\udcd6 ' + t('Practice Mode', '\u7ec3\u4e60\u6a21\u5f0f') + '</button>';
  h += '<button class="btn btn-sm" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="exam" style="flex:1;min-width:120px;background:var(--c-warning);border-color:var(--c-warning);color:#fff">';
  h += '\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</button>';
  if (ppStats.wrongActive > 0) {
    h += '<button class="btn btn-sm" data-pp-start data-sec="' + secId + '" data-board="' + board + '" data-mode="wrongbook" style="flex:1;min-width:120px;background:#ef5350;border-color:#ef5350;color:#fff">';
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
  h += '<span style="font-size:18px">&#x1F4CB;</span> ';
  h += '<span class="mq-summary-title">' + t('Master Question Types', '\u6BCD\u9898\u603B\u7ED3') + '</span>';
  h += '<span style="margin-left:auto;font-size:11px;color:var(--c-muted)">';
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
    h += '<div style="text-align:right;flex-shrink:0">';
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
    s += '<span class="star-dot' + (i < filled ? ' filled' : '') + '" style="width:6px;height:6px"></span>';
  }
  return s;
}

/* ═══ EXPANDABLE MODULE TOGGLE ═══ */
function toggleSectionContent(moduleEl) {
  var content = moduleEl.nextElementSibling;
  if (!content || !content.classList.contains('sec-module-content')) return;
  var arrow = moduleEl.querySelector('.sec-module-arrow');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    if (arrow) arrow.textContent = '\u25b2';
    loadKaTeX().then(function() { renderMath(content); });
  } else {
    content.style.display = 'none';
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
  html += '<div class="section-title" style="margin:0">\u270f\ufe0f ' + t(modLabel[0], modLabel[1]) + ' <span style="color:var(--c-muted);font-size:13px">' + escapeHtml(sectionId) + ' ' + escapeHtml(sec.title) + '</span></div>';
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
  html += '<textarea id="pq-formula-input" class="bug-textarea" rows="2" placeholder="\\frac{1}{2}" style="font-family:var(--font-mono)"></textarea>';
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
        el.addEventListener('input', function() { _seUpdatePreview(module, board); });
        el.addEventListener('focus', function() { _pqFocusedTextarea = this; });
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
  var subject = '[Section Error] ' + sectionId + ' ' + moduleType + ' - 25Maths Keywords (' + board + ')';
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
}

/* ═══ MISTAKE BOOK PANEL ═══ */

function _getVocabMistakes() {
  var all = getAllWords();
  var mistakes = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].fail > 0 && all[i].stars < 3) {
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
        html += '<div class="mistake-word">' + escapeHtml(w.word || '') + '</div>';
        html += '<div class="mistake-def">' + escapeHtml(w.def || '') + '</div>';
        html += '<div class="mistake-fail">\u2717 ' + w.fail + '</div>';
        html += '<div class="mistake-stars">';
        for (var s = 0; s < w.stars; s++) html += '\u2605';
        html += '</div>';
        html += '</div>';
      }
      html += '<div class="text-center mt-12">';
      html += '<button class="btn btn-primary btn-sm" onclick="startMistakeReview(\'vocab\')">' + t('Review Wrong Words (SRS Priority)', '\u590d\u4e60\u9519\u8bcd\uff08SRS \u4f18\u5148\uff09') + '</button>';
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

/* ═══ INIT ═══ */
/* Auto-load all board data on script load */
loadCIESyllabus();
loadEdexcelSyllabus();
loadHHKSyllabus();
