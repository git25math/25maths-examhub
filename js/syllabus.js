/* ══════════════════════════════════════════════════════════════
   syllabus.js — Multi-board syllabus-driven navigation + section detail
   Supports CIE 0580 and Edexcel 4MA1.
   Loaded after mastery.js, before practice.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ GLOBALS ═══ */
var BOARD_SYLLABUS = {};      /* { cie: {...}, edexcel: {...} } */
var BOARD_VOCAB = {};         /* { cie: {...}, edexcel: {...} } */
var _boardSectionLevelMap = {};  /* { cie: {id→idx}, edexcel: {id→idx} } */
var _sectionEditsCache = {};  /* { cie: { secId: { module: data } }, edexcel: ... } */

/* Legacy aliases — keep existing code working */
var CIE_SYLLABUS = null;
var CIE_VOCAB = null;
var _cieSectionLevelMap = {};

var _cieDataReady = false;
var _cieDataLoading = false;
var _edxDataReady = false;
var _edxDataLoading = false;

/* Chapter collapse state (default all collapsed) */
var cieChapterCollapsed = {};

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

function _loadBoardSyllabus(board) {
  var readyKey = board === 'cie' ? '_cieDataReady' : '_edxDataReady';
  var loadingKey = board === 'cie' ? '_cieDataLoading' : '_edxDataLoading';

  if (board === 'cie' && _cieDataReady) return Promise.resolve();
  if (board === 'edexcel' && _edxDataReady) return Promise.resolve();
  if (board === 'cie' && _cieDataLoading) return _cieDataLoading;
  if (board === 'edexcel' && _edxDataLoading) return _edxDataLoading;

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
  else _edxDataLoading = loadingPromise;

  return loadingPromise;
}

function _setBoardReady(board) {
  if (board === 'cie') _cieDataReady = true;
  else if (board === 'edexcel') _edxDataReady = true;
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
  var boardKey = board === 'edexcel' ? 'edx' : board;  /* LEVELS uses 'edx' not 'edexcel' */

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
  var boards = board ? [board] : ['cie', 'edexcel'];
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
  var prefix = board === 'cie' ? 'cie-ch' : 'edx-ch';
  var emojis = board === 'cie'
    ? ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udccd', '\ud83d\udcd0', '\ud83d\udccf', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83c\udfb2', '\ud83d\udcc8']
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

      /* Stats from virtual level */
      var li = getSectionLevelIdx(sec.id, board);
      if (li >= 0) {
        var stats = getDeckStats(li);
        chTotalWords += stats.total;
        chMastered += stats.mastered;
        chTotalStars += Math.round(stats.learningPct * stats.total * 4 / 100);
        chMaxStars += stats.total * 4;
      }
    });

    if (visibleSections.length === 0) return;

    html += '<div class="category-section' + (collapsed ? ' collapsed' : '') + '" id="cat-' + catKey + '">';
    html += '<div class="category-header" onclick="toggleCIEChapter(\'' + catKey + '\')">';
    html += '<span class="category-emoji">' + (emojis[ch.num] || '\ud83d\udcda') + '</span>';
    html += '<span class="category-name">' + ch.num + '. ' + ch.title;
    if (appLang !== 'en') html += ' ' + ch.title_zh;
    html += '</span>';
    html += '<span class="category-count">' + ch.sections.length + ' ' + t('sections', '\u8282') + '</span>';
    html += '<span class="category-chevron">\u25bc</span>';
    html += '</div>';

    html += '<div class="deck-list category-body">';

    /* Practice actions for the chapter */
    var firstSec = visibleSections[0];
    var firstLi = getSectionLevelIdx(firstSec.id, board);
    if (firstLi >= 0) {
      html += '<div class="pq-cat-actions">';
      html += '<button class="sort-btn" onclick="startPracticeByChapter(' + ch.num + ',\'' + board + '\')">\ud83d\udcdd ' + t('Practice', '\u7ec3\u4e60') + '</button>';
      html += '</div>';
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

/* Helper: chapter emoji */
function _chapterEmoji(num) {
  var emojis = ['', '\ud83d\udd22', '\ud83d\udcdd', '\ud83d\udccd', '\ud83d\udcd0', '\ud83d\udccf', '\ud83d\udcd0', '\u27a1\ufe0f', '\ud83c\udfb2', '\ud83d\udcc8'];
  return emojis[num] || '\ud83d\udcda';
}

/* Render a single section row in the home view */
function _renderSectionRow(sec, ch, board) {
  board = board || 'cie';
  var vocab = BOARD_VOCAB[board] || {};
  var li = getSectionLevelIdx(sec.id, board);
  var words = vocab[sec.id] || [];
  var stats = li >= 0 ? getDeckStats(li) : { pct: 0, started: 0, total: words.length, learningPct: 0, masteryPct: 0 };

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
  h += '<span class="deck-row-count">' + (words.length > 0 ? stats.started + '/' + stats.total : '-') + '</span>';
  if (words.length > 0) {
    h += '<span class="deck-row-progress"><span class="deck-row-progress-fill" style="width:' + stats.pct + '%"></span></span>';
    h += '<span class="deck-row-pct">' + stats.pct + '%</span>';
  }
  h += '</div>';
  return h;
}

/* Toggle chapter collapse */
function toggleCIEChapter(catKey) {
  cieChapterCollapsed[catKey] = !cieChapterCollapsed[catKey];
  var el = document.getElementById('cat-' + catKey);
  if (el) el.classList.toggle('collapsed', cieChapterCollapsed[catKey]);
}

/* ═══ SECTION DETAIL PAGE ═══ */
function openSection(sectionId, board) {
  var info = getSectionInfo(sectionId, board);
  if (!info) return;
  renderSectionDetail(info.chapter, info.section, info.sectionIndex, info.board);
  showPanel('section');
}

function renderSectionDetail(ch, sec, secIdx, board) {
  board = board || 'cie';
  var vocab = BOARD_VOCAB[board] || {};
  var li = getSectionLevelIdx(sec.id, board);
  var words = vocab[sec.id] || [];
  var stats = li >= 0 ? getDeckStats(li) : { pct: 0, started: 0, total: words.length, learningPct: 0, masteryPct: 0, mastered: 0 };

  /* Count practice questions for this section */
  var qCount = 0;
  var pqBoard = board === 'edexcel' ? 'edx' : board;
  if (typeof _pqData !== 'undefined' && _pqData && _pqData[pqBoard]) {
    _pqData[pqBoard].forEach(function(q) { if (q.s === sec.id) qCount++; });
  }

  var html = '';

  /* Header */
  html += '<div class="deck-header">';
  html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
  html += '<div class="deck-title">' + ch.num + '. ' + ch.title;
  if (appLang !== 'en') html += ' ' + ch.title_zh;
  html += '</div>';
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
    html += '<span class="tier-badge tier-ext" style="margin-top:8px">Extended Only</span>';
  } else if (sec.tier === 'core') {
    html += '<span class="tier-badge tier-core" style="margin-top:8px">Core Only</span>';
  } else if (sec.tier === 'higher') {
    html += '<span class="tier-badge tier-higher" style="margin-top:8px">Higher Only</span>';
  } else if (sec.tier === 'foundation') {
    html += '<span class="tier-badge tier-foundation" style="margin-top:8px">Foundation Only</span>';
  }

  /* Progress bar */
  html += '<div class="sec-progress-bar">';
  html += '<div class="sec-progress-fill" style="width:' + stats.pct + '%"></div>';
  html += '</div>';
  html += '<div class="sec-progress-label">' + stats.pct + '% \u00b7 ' + stats.mastered + '/' + stats.total + ' ' + t('mastered', '\u5df2\u638c\u63e1') + '</div>';
  html += '</div>';

  /* Syllabus requirements — board-aware labels (1st) */
  var syllabusEdit = _getSectionEdit(board, sec.id, 'syllabus');
  html += '<div class="sec-syllabus">';
  html += '<div class="sec-syllabus-header">';
  html += '<div class="sec-syllabus-title">' + t('Syllabus Requirements', '\u8003\u7eb2\u8981\u6c42') + '</div>';
  html += '<div style="display:flex;gap:4px;align-items:center">';
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

  /* Module cards: Vocabulary → Practice → Knowledge → Examples */
  html += '<div class="sec-modules">';

  /* Vocabulary module (2nd) */
  if (words.length > 0 && li >= 0) {
    html += '<div class="sec-module" onclick="openDeck(' + li + ')">';
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

  /* Past Papers module — between Practice and Knowledge Card */
  if (board === 'cie' && typeof ppGetSectionStats === 'function') {
    var ppStats = ppGetSectionStats(board, sec.id);
    if (ppStats.total > 0) {
      html += '<div class="sec-module" style="flex-direction:column;align-items:stretch;gap:8px">';
      html += '<div style="display:flex;align-items:center;gap:12px">';
      html += '<div class="sec-module-icon">\ud83d\udcc4</div>';
      html += '<div class="sec-module-info">';
      html += '<div class="sec-module-title">' + t('Past Papers', '\u771f\u9898\u7ec3\u4e60') + '</div>';
      html += '<div class="sec-module-sub">' + ppStats.total + ' ' + t('questions', '\u9898') + ' \u00b7 CIE 0580</div>';
      html += '</div></div>';

      /* Mastery stats row */
      html += '<div class="pp-module-stats">';
      if (ppStats.newQ > 0) html += '<span class="pp-module-stat new">\u2b1c ' + ppStats.newQ + ' ' + t('New', '\u65b0\u9898') + '</span>';
      if (ppStats.needsWork > 0) html += '<span class="pp-module-stat needs-work">\ud83d\udd34 ' + ppStats.needsWork + ' ' + t('Needs Work', '\u5f85\u6539\u8fdb') + '</span>';
      if (ppStats.partial > 0) html += '<span class="pp-module-stat partial-stat">\ud83d\udfe1 ' + ppStats.partial + ' ' + t('Partial', '\u90e8\u5206') + '</span>';
      if (ppStats.mastered > 0) html += '<span class="pp-module-stat mastered-stat">\u2705 ' + ppStats.mastered + ' ' + t('Mastered', '\u5df2\u638c\u63e1') + '</span>';
      html += '</div>';

      /* Action buttons */
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
      html += '<button class="btn btn-sm" onclick="event.stopPropagation();startPastPaper(\'' + sec.id + '\',\'' + board + '\',\'practice\')" style="flex:1;min-width:100px">';
      html += '\ud83d\udcd6 ' + t('Practice', '\u7ec3\u4e60') + ' (' + ppStats.total + ')</button>';
      html += '<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();startPastPaper(\'' + sec.id + '\',\'' + board + '\',\'exam\')" style="flex:1;min-width:100px">';
      html += '\u23f1 ' + t('Exam Mode', '\u5b9e\u6218') + '</button>';
      if (ppStats.wrongActive > 0) {
        html += '<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();startPastPaper(\'' + sec.id + '\',\'' + board + '\',\'wrongbook\')" style="flex:1;min-width:100px;color:#ef5350">';
        html += '\ud83d\udcd5 ' + t('Review', '\u590d\u4e60') + ' (' + ppStats.wrongActive + ')</button>';
      }
      html += '</div>';
      html += '</div>';
    }
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
    html += '<div class="sec-module-content" style="display:none">';
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
    html += '<div class="sec-module-content" style="display:none">';
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
  html += '<div class="pq-formula-popup" id="pq-formula-popup" style="display:none">';
  html += '<label class="pq-field-label">LaTeX</label>';
  html += '<textarea id="pq-formula-input" class="bug-textarea" rows="2" placeholder="\\frac{1}{2}" style="font-family:var(--font-mono)"></textarea>';
  html += '<div class="pq-formula-preview" id="pq-formula-preview"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px">';
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
      h += '<div class="pq-preview-content" style="color:var(--c-text2)">' + pqRender(f2) + '</div></div>';
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
  html += '<br><span style="color:var(--c-text2)">' + t('Module', '\u6a21\u5757') + ': ' + modLabel + '</span>';
  html += '</div>';
  html += '<label class="settings-label">' + t('Error type', '\u9519\u8bef\u7c7b\u578b') + '</label>';
  html += '<select class="bug-select" id="sec-report-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '\u63cf\u8ff0') + ' *</label>';
  html += '<textarea class="bug-textarea" id="sec-report-desc" rows="3" placeholder="' + t('Describe the error...', '\u8bf7\u63cf\u8ff0\u9519\u8bef...') + '"></textarea>';
  html += '<div id="sec-report-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '\u63d0\u4ea4') : t('Submit via Email', '\u901a\u8fc7\u90ae\u4ef6\u63d0\u4ea4');
  html += '<button class="btn btn-primary" style="flex:1" onclick="submitSectionReport(\'' + sectionId + '\',\'' + moduleType + '\',\'' + board + '\')">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
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

/* ═══ INIT ═══ */
/* Auto-load both board data on script load */
loadCIESyllabus();
loadEdexcelSyllabus();
