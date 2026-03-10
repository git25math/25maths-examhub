/* ══════════════════════════════════════════════════════════════
   error-patterns.js — Error Pattern Memory (v4.2.0)
   Tracks recurring mistake patterns across questions.
   5 pattern types: vocab-misunderstanding, concept-gap,
   method-confusion, careless-reading, careless-calculation.
   Feeds into Tutor / Coach / Profile for personalized guidance.
   Loaded after ai-tutor.js, before mistake-coach.js
   ══════════════════════════════════════════════════════════════ */

var ERROR_PATTERN_LABELS = {
  'vocab-misunderstanding': { en: 'Vocabulary misunderstanding', zh: '\u8bcd\u6c47\u7406\u89e3\u504f\u5dee' },
  'concept-gap':            { en: 'Concept gap',                 zh: '\u6982\u5ff5\u8584\u5f31' },
  'method-confusion':       { en: 'Method confusion',            zh: '\u65b9\u6cd5\u6df7\u4e71' },
  'careless-reading':       { en: 'Careless reading',            zh: '\u8bfb\u9898\u7c97\u5fc3' },
  'careless-calculation':   { en: 'Careless calculation',        zh: '\u8ba1\u7b97\u7c97\u5fc3' }
};

/* ═══ INFERENCE ═══ */

function inferErrorPattern(q, recovery, meta) {
  if (!recovery) return 'method-confusion';

  var hasVocab = recovery.weakVocab && recovery.weakVocab.length > 0;
  var hasKP = recovery.weakKPs && recovery.weakKPs.length > 0;
  var hasSiblings = recovery.siblingQuestions && recovery.siblingQuestions.length > 0;

  /* Rule 1: weak vocab prominent, KP less so */
  if (hasVocab && !hasKP) return 'vocab-misunderstanding';

  /* Rule 2: weak KP exists */
  if (hasKP) return 'concept-gap';

  /* Rule 3: no vocab/KP gap but siblings exist + section not especially weak → likely reading issue */
  if (!hasVocab && !hasKP && hasSiblings) {
    var secHealth = null;
    if (typeof getSectionHealth === 'function' && q && q.s) {
      var board = (meta && meta.board) || '';
      secHealth = getSectionHealth(q.s, board);
    }
    if (secHealth && secHealth.overall >= 50) return 'careless-reading';
  }

  /* Rule 4: calculation signal from meta */
  if (meta && meta.errorType === 'calculation') return 'careless-calculation';

  /* Rule 5: fallback */
  return 'method-confusion';
}

/* ═══ RECORD ═══ */

function recordErrorPattern(q, sectionId, pattern) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  if (!state) return;

  /* Global count */
  if (!state.global) state.global = {};
  state.global[pattern] = (state.global[pattern] || 0) + 1;

  /* Section count */
  if (sectionId) {
    if (!state.bySection) state.bySection = {};
    if (!state.bySection[sectionId]) state.bySection[sectionId] = {};
    state.bySection[sectionId][pattern] = (state.bySection[sectionId][pattern] || 0) + 1;
  }

  /* Recent log */
  if (!state.recent) state.recent = [];
  state.recent.push({
    at: new Date().toISOString(),
    qid: (q && q.id) || '',
    sectionId: sectionId || '',
    pattern: pattern
  });

  /* Trim recent to window */
  var window = cfg.recentWindow || 20;
  if (state.recent.length > window) {
    state.recent = state.recent.slice(-window);
  }

  state.updatedAt = new Date().toISOString();
  if (typeof setErrorPatternState === 'function') setErrorPatternState(state);
}

/* ═══ QUERY ═══ */

function getDominantErrorPatterns(sectionId) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  var threshold = cfg.dominantThreshold || 0.3;
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  if (!state) return [];

  var counts = sectionId && state.bySection && state.bySection[sectionId]
    ? state.bySection[sectionId]
    : (state.global || {});

  var total = 0;
  var entries = [];
  for (var k in counts) {
    if (counts.hasOwnProperty(k)) {
      total += counts[k];
      entries.push({ key: k, count: counts[k] });
    }
  }
  if (total === 0) return [];

  /* Calculate ratios and filter by threshold */
  var result = [];
  for (var i = 0; i < entries.length; i++) {
    var ratio = entries[i].count / total;
    if (ratio >= threshold) {
      result.push({ key: entries[i].key, count: entries[i].count, ratio: Math.round(ratio * 100) / 100 });
    }
  }

  /* Sort by count descending */
  result.sort(function(a, b) { return b.count - a.count; });
  return result.slice(0, cfg.maxPatternTagsOnUI || 2);
}

/* ═══ LABELS ═══ */

function getErrorPatternLabel(patternKey) {
  var info = ERROR_PATTERN_LABELS[patternKey];
  if (!info) return { en: patternKey, zh: patternKey };
  return info;
}

function getErrorPatternLabels(patterns) {
  var labels = [];
  for (var i = 0; i < patterns.length; i++) {
    var info = ERROR_PATTERN_LABELS[patterns[i].key || patterns[i]];
    if (info) labels.push(t(info.en, info.zh));
  }
  return labels;
}

/* ═══ RENDER PILLS ═══ */

function renderErrorPatternPills(patterns) {
  if (!patterns || patterns.length === 0) return '';
  var html = '<div class="error-pattern-pills">';
  for (var i = 0; i < patterns.length; i++) {
    var info = ERROR_PATTERN_LABELS[patterns[i].key || patterns[i]];
    var label = info ? t(info.en, info.zh) : (patterns[i].key || patterns[i]);
    html += '<span class="error-pattern-pill">' + (typeof escapeHtml === 'function' ? escapeHtml(label) : label) + '</span>';
  }
  html += '</div>';
  return html;
}
