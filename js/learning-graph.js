/* ══════════════════════════════════════════════════════════════
   Learning Graph — Runtime query layer (v3.2.0)
   Connects questions ↔ vocabulary ↔ knowledge points via section codes.
   Pure read-only layer — no storage writes, no new data files.
   All data already loaded: LEVELS, BOARD_SYLLABUS, _kpData, _ppData, _pqData.
   ══════════════════════════════════════════════════════════════ */

/* ═══ INTERNAL HELPERS ═══ */

/**
 * Get all vocab slugs for a section (from syllabus vocabSlugs + KP vocabLinks, de-duped).
 * @param {string} sectionId  e.g. "1.1" or "N1"
 * @param {string} board      e.g. "cie" or "edexcel"
 * @returns {string[]}        e.g. ["cie-1-1", "cie-1-2"]
 */
function _lgGetSectionVocabSlugs(sectionId, board) {
  var slugs = {};

  /* Source 1: syllabus vocabSlugs */
  var secInfo = typeof getSectionInfo === 'function' ? getSectionInfo(sectionId, board) : null;
  if (secInfo && secInfo.section && secInfo.section.vocabSlugs) {
    for (var i = 0; i < secInfo.section.vocabSlugs.length; i++) {
      slugs[secInfo.section.vocabSlugs[i]] = true;
    }
  }

  /* Source 2: KP vocabLinks for KPs in this section */
  var kps = _lgGetSectionKPs(sectionId, board);
  for (var k = 0; k < kps.length; k++) {
    if (kps[k].vocabLinks) {
      for (var v = 0; v < kps[k].vocabLinks.length; v++) {
        slugs[kps[k].vocabLinks[v]] = true;
      }
    }
  }

  /* Also include the section's own level slug (from _boardSectionLevelMap) */
  if (typeof _boardSectionLevelMap !== 'undefined' && _boardSectionLevelMap[board]) {
    var li = _boardSectionLevelMap[board][sectionId];
    if (li !== undefined && LEVELS[li] && LEVELS[li].slug) {
      slugs[LEVELS[li].slug] = true;
    }
  }

  return Object.keys(slugs);
}

/**
 * Get all KPs belonging to a section.
 * @param {string} sectionId
 * @param {string} board
 * @returns {Object[]}  raw KP objects from _kpData
 */
function _lgGetSectionKPs(sectionId, board) {
  if (typeof _kpData === 'undefined' || !_kpData[board]) return [];
  var all = _kpData[board];
  var result = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].section === sectionId) result.push(all[i]);
  }
  return result;
}

/* ═══ PUBLIC QUERY FUNCTIONS ═══ */

/**
 * 1. Question → related vocabulary levels.
 * @param {string} questionId  (unused, kept for future per-question mapping)
 * @param {string} sectionId   from q.s
 * @param {string} board
 * @returns {{ levelIdx: number, slug: string, title: string, words: Object[] }[]}
 */
function getQuestionVocabLevels(questionId, sectionId, board) {
  if (!sectionId || !board) return [];
  var slugs = _lgGetSectionVocabSlugs(sectionId, board);
  if (slugs.length === 0) return [];

  var wd = typeof getWordData === 'function' ? getWordData() : {};
  var result = [];

  for (var i = 0; i < slugs.length; i++) {
    var idx = typeof getLevelIdxBySlug === 'function' ? getLevelIdxBySlug(slugs[i]) : -1;
    if (idx < 0) continue;
    var lv = LEVELS[idx];
    if (!lv || !lv.vocabulary) continue;

    var words = [];
    for (var j = 0; j < lv.vocabulary.length; j += 2) {
      var item = lv.vocabulary[j];
      var def  = lv.vocabulary[j + 1];
      var key = typeof wordKey === 'function' ? wordKey(idx, item.id) : '';
      var d = wd[key] || {};
      var fs = d.fs || 'new';
      words.push({ word: item.content, def: def.content, key: key, fs: fs });
    }
    result.push({ levelIdx: idx, slug: slugs[i], title: lv.title, words: words });
  }
  return result;
}

/**
 * 2. Question → related knowledge points (with FLM status).
 * @param {string} sectionId  from q.s
 * @param {string} board
 * @returns {{ id: string, title: string, title_zh: string, fs: string }[]}
 */
function getQuestionKPs(sectionId, board) {
  if (!sectionId || !board) return [];
  var kps = _lgGetSectionKPs(sectionId, board);
  if (kps.length === 0) return [];

  var kpDone = {};
  try { kpDone = (typeof loadS === 'function' ? loadS() : {}).kpDone || {}; } catch(e) {}

  var result = [];
  for (var i = 0; i < kps.length; i++) {
    var kp = kps[i];
    var kd = kpDone[kp.id] || {};
    result.push({
      id: kp.id,
      title: kp.title || '',
      title_zh: kp.title_zh || '',
      fs: kd.fs || 'new',
      section: kp.section
    });
  }
  return result;
}

/**
 * 3. Knowledge point → related questions (PP + MCQ).
 * @param {string} kpId   e.g. "kp-1.1-01"
 * @param {string} board
 * @returns {{ id: string, type: string, marks: number, src: string, sectionId: string }[]}
 */
function getKPQuestions(kpId, board) {
  /* Resolve kp → section */
  if (typeof _kpData === 'undefined' || !_kpData[board]) return [];
  var kp = null;
  for (var i = 0; i < _kpData[board].length; i++) {
    if (_kpData[board][i].id === kpId) { kp = _kpData[board][i]; break; }
  }
  if (!kp || !kp.section) return [];

  var sectionId = kp.section;
  var result = [];

  /* PP questions */
  if (typeof _ppData !== 'undefined' && _ppData[board]) {
    var ppQs = typeof getPPBySection === 'function' ? getPPBySection(board, sectionId) : [];
    for (var pi = 0; pi < ppQs.length; pi++) {
      result.push({
        id: ppQs[pi].id,
        type: 'pp',
        marks: ppQs[pi].marks || 0,
        src: ppQs[pi].src || '',
        sectionId: sectionId
      });
    }
  }

  /* MCQ questions */
  if (typeof _pqData !== 'undefined' && _pqData[board]) {
    var mcqs = _pqData[board];
    for (var mi = 0; mi < mcqs.length; mi++) {
      if (mcqs[mi].s === sectionId) {
        result.push({
          id: mcqs[mi].id,
          type: 'mcq',
          marks: 1,
          src: '',
          sectionId: sectionId
        });
      }
    }
  }

  return result;
}

/**
 * 4. Vocab slug → related questions (find sections using this slug, aggregate their questions).
 * @param {string} vocabSlug  e.g. "cie-1-1"
 * @param {string} board
 * @returns {{ id: string, type: string, sectionId: string }[]}
 */
function getVocabQuestions(vocabSlug, board) {
  if (!vocabSlug || !board) return [];

  /* Find all sections that reference this slug */
  var syl = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[board] : null;
  if (!syl || !syl.chapters) return [];

  var sections = [];
  for (var ci = 0; ci < syl.chapters.length; ci++) {
    var ch = syl.chapters[ci];
    for (var si = 0; si < ch.sections.length; si++) {
      var sec = ch.sections[si];
      if (sec.vocabSlugs && sec.vocabSlugs.indexOf(vocabSlug) !== -1) {
        sections.push(sec.id);
      }
    }
  }

  /* Also check _boardSectionLevelMap — the section whose level slug matches */
  if (typeof _boardSectionLevelMap !== 'undefined' && _boardSectionLevelMap[board]) {
    var map = _boardSectionLevelMap[board];
    for (var secId in map) {
      var li = map[secId];
      if (LEVELS[li] && LEVELS[li].slug === vocabSlug && sections.indexOf(secId) === -1) {
        sections.push(secId);
      }
    }
  }

  var result = [];
  for (var i = 0; i < sections.length; i++) {
    var sid = sections[i];

    /* PP */
    if (typeof getPPBySection === 'function' && typeof _ppData !== 'undefined' && _ppData[board]) {
      var ppQs = getPPBySection(board, sid);
      for (var pi = 0; pi < ppQs.length; pi++) {
        result.push({ id: ppQs[pi].id, type: 'pp', sectionId: sid });
      }
    }

    /* MCQ */
    if (typeof _pqData !== 'undefined' && _pqData[board]) {
      var mcqs = _pqData[board];
      for (var mi = 0; mi < mcqs.length; mi++) {
        if (mcqs[mi].s === sid) {
          result.push({ id: mcqs[mi].id, type: 'mcq', sectionId: sid });
        }
      }
    }
  }
  return result;
}

/**
 * 5. Recovery Pack candidates for a wrong/weak question.
 * Returns weak vocab, weak KPs, and sibling questions from the same section.
 * @param {string} questionId
 * @param {string} sectionId
 * @param {string} board
 * @returns {{ weakVocab: Object[], weakKPs: Object[], siblingQuestions: Object[] }}
 */
function getRecoveryCandidates(questionId, sectionId, board) {
  var empty = { weakVocab: [], weakKPs: [], siblingQuestions: [] };
  if (!sectionId || !board) return empty;

  /* Weak vocab: not mastered */
  var vocabLevels = getQuestionVocabLevels(questionId, sectionId, board);
  var weakVocab = [];
  for (var vi = 0; vi < vocabLevels.length; vi++) {
    var words = vocabLevels[vi].words;
    for (var wi = 0; wi < words.length; wi++) {
      if (words[wi].fs !== 'mastered') {
        weakVocab.push({
          word: words[wi].word,
          def: words[wi].def,
          fs: words[wi].fs,
          levelIdx: vocabLevels[vi].levelIdx,
          slug: vocabLevels[vi].slug
        });
      }
    }
  }
  /* Cap at 5 */
  weakVocab = weakVocab.slice(0, 5);

  /* Weak KPs: not mastered */
  var kps = getQuestionKPs(sectionId, board);
  var weakKPs = [];
  for (var ki = 0; ki < kps.length; ki++) {
    if (kps[ki].fs !== 'mastered') {
      weakKPs.push(kps[ki]);
    }
  }
  /* Cap at 2 */
  weakKPs = weakKPs.slice(0, 2);

  /* Sibling questions from same section (excluding current) */
  var siblings = [];
  if (typeof getPPBySection === 'function' && typeof _ppData !== 'undefined' && _ppData[board]) {
    var ppQs = getPPBySection(board, sectionId);
    for (var si = 0; si < ppQs.length; si++) {
      if (ppQs[si].id !== questionId) {
        siblings.push({ id: ppQs[si].id, type: 'pp', marks: ppQs[si].marks, src: ppQs[si].src });
      }
    }
  }
  /* Cap at 3 */
  siblings = siblings.slice(0, 3);

  return { weakVocab: weakVocab, weakKPs: weakKPs, siblingQuestions: siblings };
}

/**
 * 6. Section complete relationship overview.
 * @param {string} sectionId
 * @param {string} board
 * @returns {{ vocabSlugs: string[], vocabLevelCount: number, kpCount: number, ppCount: number, mcqCount: number }}
 */
function getSectionGraph(sectionId, board) {
  if (!sectionId || !board) return { vocabSlugs: [], vocabLevelCount: 0, kpCount: 0, ppCount: 0, mcqCount: 0 };

  var slugs = _lgGetSectionVocabSlugs(sectionId, board);
  var kps = _lgGetSectionKPs(sectionId, board);

  var ppCount = 0;
  if (typeof getPPBySection === 'function' && typeof _ppData !== 'undefined' && _ppData[board]) {
    ppCount = getPPBySection(board, sectionId).length;
  }

  var mcqCount = 0;
  if (typeof _pqData !== 'undefined' && _pqData[board]) {
    var mcqs = _pqData[board];
    for (var i = 0; i < mcqs.length; i++) {
      if (mcqs[i].s === sectionId) mcqCount++;
    }
  }

  return {
    vocabSlugs: slugs,
    vocabLevelCount: slugs.length,
    kpCount: kps.length,
    ppCount: ppCount,
    mcqCount: mcqCount
  };
}
