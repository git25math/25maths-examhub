/* ══════════════════════════════════════════════════════════════
   error-patterns.js — Error Pattern Memory v2 (v4.3.0)
   Confidence-based, time-aware mistake pattern tracking.
   5 pattern types with persistent/recent scoring, decay, and
   structured selectors for Tutor/Coach/Profile/Worksheet.
   Loaded after ai-tutor.js, before mistake-coach.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ CONSTANTS ═══ */

var ERROR_PATTERN_TYPES = [
  'vocab-misunderstanding', 'concept-gap', 'method-confusion',
  'careless-reading', 'careless-calculation'
];

var ERROR_PATTERN_LABELS = {
  'vocab-misunderstanding': { en: 'Vocabulary building',       zh: '\u8bcd\u6c47\u5f85\u5de9\u56fa' },
  'concept-gap':            { en: 'Concept strengthening',     zh: '\u6982\u5ff5\u5f85\u52a0\u5f3a' },
  'method-confusion':       { en: 'Method practice needed',    zh: '\u65b9\u6cd5\u9700\u7ec3\u4e60' },
  'careless-reading':       { en: 'Reading focus',             zh: '\u5ba1\u9898\u53ef\u63d0\u5347' },
  'careless-calculation':   { en: 'Calculation check',         zh: '\u8ba1\u7b97\u53ef\u68c0\u67e5' }
};

var ERROR_PATTERN_META = {
  'vocab-misunderstanding': {
    shortHint: { en: 'Reviewing key terms will make questions much clearer.', zh: '\u590d\u4e60\u5173\u952e\u672f\u8bed\u4f1a\u8ba9\u9898\u76ee\u66f4\u6e05\u6670\u3002' },
    solveHabit: { en: 'Check the meaning of key terms before solving.', zh: '\u505a\u9898\u524d\u5148\u786e\u8ba4\u5173\u952e\u672f\u8bed\u7684\u542b\u4e49\u3002' }
  },
  'concept-gap': {
    shortHint: { en: 'Strengthening the core concept will help everything click.', zh: '\u52a0\u5f3a\u6838\u5fc3\u6982\u5ff5\u4f1a\u8ba9\u4e00\u5207\u8c41\u7136\u5f00\u6717\u3002' },
    solveHabit: { en: 'Review the key idea with one simple example first.', zh: '\u5148\u7528\u4e00\u4e2a\u7b80\u5355\u4f8b\u5b50\u590d\u4e60\u6838\u5fc3\u6982\u5ff5\u3002' }
  },
  'method-confusion': {
    shortHint: { en: 'Practising a clear step-by-step method builds confidence.', zh: '\u7ec3\u4e60\u6e05\u6670\u7684\u89e3\u9898\u6b65\u9aa4\u4f1a\u5efa\u7acb\u4fe1\u5fc3\u3002' },
    solveHabit: { en: 'Follow a fixed step-by-step method before speeding up.', zh: '\u5148\u6309\u56fa\u5b9a\u6b65\u9aa4\u89e3\u9898\uff0c\u518d\u9010\u6b65\u63d0\u901f\u3002' }
  },
  'careless-reading': {
    shortHint: { en: 'Slowing down to read carefully can unlock marks you already know.', zh: '\u653e\u6162\u901f\u5ea6\u4ed4\u7ec6\u8bfb\u9898\u80fd\u62ff\u5230\u4f60\u672c\u5c31\u4f1a\u7684\u5206\u3002' },
    solveHabit: { en: 'Underline the given information and circle what is asked.', zh: '\u5728\u5df2\u77e5\u4fe1\u606f\u4e0b\u5212\u7ebf\uff0c\u5728\u6c42\u89e3\u76ee\u6807\u4e0a\u753b\u5708\u3002' }
  },
  'careless-calculation': {
    shortHint: { en: 'A quick double-check habit will catch easy marks.', zh: '\u517b\u6210\u5feb\u901f\u68c0\u67e5\u7684\u4e60\u60ef\u80fd\u62ff\u5230\u5f88\u591a\u5206\u3002' },
    solveHabit: { en: 'Estimate first, then check the final calculation.', zh: '\u5148\u4f30\u7b97\uff0c\u518d\u68c0\u67e5\u6700\u7ec8\u8ba1\u7b97\u3002' }
  }
};

/* ═══ DEFAULT STATE ═══ */

function createDefaultErrorPatternState() {
  var stats = {};
  for (var i = 0; i < ERROR_PATTERN_TYPES.length; i++) {
    stats[ERROR_PATTERN_TYPES[i]] = {
      persistentScore: 0, recentScore: 0,
      evidenceCount: 0, recentEvidenceCount: 0,
      confidence: 0, lastSeenAt: null
    };
  }
  return { version: '2', updatedAt: Date.now(), recentEvents: [], patternStats: stats };
}

/* ═══ SIGNAL INFERENCE ═══ */

function inferPatternSignals(q, recovery, meta) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  var weights = cfg.weights || {};
  var signals = [];

  var hasVocab = recovery && recovery.weakVocab && recovery.weakVocab.length > 0;
  var hasKP = recovery && recovery.weakKPs && recovery.weakKPs.length > 0;
  var hasSiblings = recovery && recovery.siblingQuestions && recovery.siblingQuestions.length > 0;
  var diag = (q && q.diag) || '';

  /* ── Careless signals (check first — override fallback if matched) ── */
  var hasCareless = false;

  /* Careless-reading: strong section + siblings + no knowledge gap */
  if (!hasVocab && !hasKP) {
    var secHealth = null;
    if (typeof getSectionHealth === 'function' && q && q.s) {
      secHealth = getSectionHealth(q.s, (meta && meta.board) || '');
    }
    if (hasSiblings && secHealth && secHealth.score >= 50) {
      signals.push({ type: 'careless-reading', weight: weights.readingSignal || 0.7, reason: 'strong section but miss' });
      hasCareless = true;
    }
  }

  /* Careless-calculation: explicit errorType tag or calc-type question */
  if (meta && meta.errorType === 'calculation') {
    signals.push({ type: 'careless-calculation', weight: weights.calculationSignal || 0.6, reason: 'explicit calc error' });
    hasCareless = true;
  } else if (diag === 'calc' && !hasVocab && !hasKP) {
    signals.push({ type: 'careless-calculation', weight: 0.35, reason: 'question tests calc' });
    hasCareless = true;
  }

  /* ── Primary knowledge signals from learning graph data ── */
  if (hasVocab) {
    signals.push({ type: 'vocab-misunderstanding', weight: weights.vocabSignal || 0.9, reason: 'weak vocab linked' });
  }
  if (hasKP) {
    signals.push({ type: 'concept-gap', weight: weights.conceptSignal || 1.0, reason: 'weak KP linked' });
  }

  /* ── Secondary: question diagnostic hint (25m only, weak signal) ── */
  if (diag === 'vocab' && !hasVocab) {
    signals.push({ type: 'vocab-misunderstanding', weight: 0.4, reason: 'question tests vocab' });
  }
  if (diag === 'concept' && !hasKP) {
    signals.push({ type: 'concept-gap', weight: 0.4, reason: 'question tests concept' });
  }

  /* ── Fallback: method-confusion ONLY when no other signal matched ── */
  if (signals.length === 0) {
    signals.push({ type: 'method-confusion', weight: weights.methodSignal || 0.6, reason: 'no clear mapping' });
  }

  /* Merge duplicates */
  var merged = {};
  for (var si = 0; si < signals.length; si++) {
    var s = signals[si];
    if (merged[s.type]) {
      merged[s.type].weight += s.weight;
      merged[s.type].reason += '; ' + s.reason;
    } else {
      merged[s.type] = { type: s.type, weight: s.weight, reason: s.reason };
    }
  }
  var result = [];
  for (var k in merged) {
    if (merged.hasOwnProperty(k)) {
      merged[k].weight = Math.round(merged[k].weight * 100) / 100;
      result.push(merged[k]);
    }
  }
  return result;
}

/* ═══ EVENT CREATION ═══ */

function createPatternEvent(q, sectionId, signals) {
  if (!signals || signals.length === 0) return null;
  return {
    ts: Date.now(),
    qid: (q && q.id) || '',
    sectionId: sectionId || '',
    signals: signals
  };
}

/* ═══ STATE UPDATE PIPELINE ═══ */

function _epAppendEvent(state, event, cfg) {
  if (!event) return state;
  var events = state.recentEvents.slice();
  events.push(event);
  var max = (cfg && cfg.maxRecentEvents) || 80;
  while (events.length > max) events.shift();
  state.recentEvents = events;
  state.updatedAt = Date.now();
  return state;
}

function _epApplyDecay(state, now, cfg) {
  var decayRate = (cfg && cfg.persistentDecayPer7Days) || 0.08;
  var stats = state.patternStats;
  for (var k in stats) {
    if (!stats.hasOwnProperty(k)) continue;
    var s = stats[k];
    if (!s.lastSeenAt || s.persistentScore <= 0) continue;
    var daysElapsed = (now - s.lastSeenAt) / 86400000;
    var periods = daysElapsed / 7;
    var mult = Math.pow(1 - decayRate, periods);
    s.persistentScore = Math.round(s.persistentScore * mult * 1000) / 1000;
    if (s.persistentScore < 0.01) s.persistentScore = 0;
  }
  return state;
}

function _epApplyEventToStats(state, event) {
  if (!event || !event.signals) return state;
  var stats = state.patternStats;
  for (var i = 0; i < event.signals.length; i++) {
    var sig = event.signals[i];
    var s = stats[sig.type];
    if (!s) continue;
    s.persistentScore = Math.round((s.persistentScore + sig.weight) * 1000) / 1000;
    s.evidenceCount += 1;
    s.lastSeenAt = event.ts;
  }
  return state;
}

function _epRecomputeRecent(state, now, cfg) {
  var windowMs = ((cfg && cfg.recentWindowDays) || 7) * 86400000;
  var cutoff = now - windowMs;
  var stats = state.patternStats;
  /* Reset recent counts */
  for (var k in stats) {
    if (!stats.hasOwnProperty(k)) continue;
    stats[k].recentScore = 0;
    stats[k].recentEvidenceCount = 0;
  }
  for (var ei = 0; ei < state.recentEvents.length; ei++) {
    var ev = state.recentEvents[ei];
    if (ev.ts < cutoff) continue;
    for (var si = 0; si < ev.signals.length; si++) {
      var sig = ev.signals[si];
      var s = stats[sig.type];
      if (!s) continue;
      s.recentScore = Math.round((s.recentScore + sig.weight) * 1000) / 1000;
      s.recentEvidenceCount += 1;
    }
  }
  return state;
}

function _epCalculateConfidence(stat, now) {
  if (!stat.lastSeenAt || stat.evidenceCount <= 0) return 0;
  /* evidence needs 8+ observations to fully saturate (was 5) */
  var evidenceFactor = Math.min(stat.evidenceCount / 8, 1);
  /* score needs ~6 cumulative weight to fully saturate (was 4) */
  var scoreFactor = Math.min(stat.persistentScore / 6, 1);
  var daysSince = (now - stat.lastSeenAt) / 86400000;
  var recencyFactor = Math.max(0.6, 1 - daysSince / 30);
  return Math.round((0.45 * evidenceFactor + 0.40 * scoreFactor + 0.15 * recencyFactor) * 100) / 100;
}

function _epRecomputeConfidence(state, now) {
  var stats = state.patternStats;
  for (var k in stats) {
    if (!stats.hasOwnProperty(k)) continue;
    stats[k].confidence = _epCalculateConfidence(stats[k], now);
  }
  return state;
}

/* ═══ MAIN UPDATE FUNCTION ═══ */

function updateErrorPatternState(state, event) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  var now = Date.now();
  if (!state) state = createDefaultErrorPatternState();
  state = _epApplyDecay(state, now, cfg);
  state = _epAppendEvent(state, event, cfg);
  state = _epApplyEventToStats(state, event);
  state = _epRecomputeRecent(state, now, cfg);
  state = _epRecomputeConfidence(state, now);
  return state;
}

/* ═══ BACKWARD-COMPATIBLE WRAPPERS ═══ */

/* Legacy: inferErrorPattern → returns single string (used by v4.2 callers) */
function inferErrorPattern(q, recovery, meta) {
  var signals = inferPatternSignals(q, recovery, meta);
  if (signals.length === 0) return 'method-confusion';
  signals.sort(function(a, b) { return b.weight - a.weight; });
  return signals[0].type;
}

/* Legacy: recordErrorPattern → now uses signal-based pipeline */
function recordErrorPattern(q, sectionId, pattern) {
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  if (!state) return;
  var event = createPatternEvent(q, sectionId, [{ type: pattern, weight: 1.0, reason: 'direct' }]);
  state = updateErrorPatternState(state, event);
  if (typeof setErrorPatternState === 'function') setErrorPatternState(state);
}

/* ═══ SELECTORS ═══ */

function getPersistentPatterns(state) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  var minEvidence = cfg.minEvidenceForDisplay || 3;
  if (!state || !state.patternStats) return [];
  var result = [];
  for (var k in state.patternStats) {
    if (!state.patternStats.hasOwnProperty(k)) continue;
    var s = state.patternStats[k];
    if (s.evidenceCount >= minEvidence) {
      result.push({ key: k, score: s.persistentScore, evidenceCount: s.evidenceCount, confidence: s.confidence, lastSeenAt: s.lastSeenAt });
    }
  }
  result.sort(function(a, b) { return b.confidence !== a.confidence ? b.confidence - a.confidence : b.score - a.score; });
  return result;
}

function getRecentPatterns(state) {
  if (!state || !state.patternStats) return [];
  var result = [];
  for (var k in state.patternStats) {
    if (!state.patternStats.hasOwnProperty(k)) continue;
    var s = state.patternStats[k];
    if (s.recentEvidenceCount >= 1) {
      result.push({ key: k, score: s.recentScore, evidenceCount: s.recentEvidenceCount, confidence: s.confidence, lastSeenAt: s.lastSeenAt });
    }
  }
  result.sort(function(a, b) { return b.score - a.score; });
  return result;
}

function getDisplayPatterns(state) {
  var persistent = getPersistentPatterns(state);
  var recent = getRecentPatterns(state);
  return {
    primaryPersistent: persistent[0] || null,
    secondaryPersistent: persistent[1] || null,
    recentTrend: recent[0] || null,
    persistent: persistent,
    recent: recent
  };
}

function getConfidenceBand(confidence) {
  var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
  if (confidence >= (cfg.minConfidenceForStrongAdvice || 0.65)) return 'high';
  if (confidence >= (cfg.minConfidenceForWeakAdvice || 0.45)) return 'medium';
  return 'low';
}

/* Legacy: getDominantErrorPatterns → now uses structured selectors */
function getDominantErrorPatterns(sectionId) {
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  if (!state || !state.patternStats) return [];
  /* If version 2, use new selectors */
  if (state.version === '2') {
    var persistent = getPersistentPatterns(state);
    var cfg = typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG : {};
    return persistent.slice(0, cfg.maxPatternTagsOnUI || 2);
  }
  /* Legacy fallback for old state format */
  var counts = sectionId && state.bySection && state.bySection[sectionId] ? state.bySection[sectionId] : (state.global || {});
  var total = 0, entries = [];
  for (var k in counts) { if (counts.hasOwnProperty(k)) { total += counts[k]; entries.push({ key: k, count: counts[k] }); } }
  if (total === 0) return [];
  var threshold = (cfg && cfg.dominantThreshold) || 0.3;
  var result = [];
  for (var i = 0; i < entries.length; i++) {
    var ratio = entries[i].count / total;
    if (ratio >= threshold) result.push({ key: entries[i].key, count: entries[i].count, ratio: Math.round(ratio * 100) / 100 });
  }
  result.sort(function(a, b) { return b.count - a.count; });
  return result.slice(0, 2);
}

/* ═══ METADATA ═══ */

function getPatternMeta(patternKey) {
  var labels = ERROR_PATTERN_LABELS[patternKey] || { en: patternKey, zh: patternKey };
  var meta = ERROR_PATTERN_META[patternKey] || { shortHint: { en: '', zh: '' }, solveHabit: { en: '', zh: '' } };
  return {
    label: labels,
    shortHint: meta.shortHint,
    solveHabit: meta.solveHabit
  };
}

function getErrorPatternLabel(patternKey) {
  return ERROR_PATTERN_LABELS[patternKey] || { en: patternKey, zh: patternKey };
}

function getErrorPatternLabels(patterns) {
  var labels = [];
  for (var i = 0; i < patterns.length; i++) {
    var info = ERROR_PATTERN_LABELS[patterns[i].key || patterns[i]];
    if (info) labels.push(t(info.en, info.zh));
  }
  return labels;
}

/* ═══ RENDER ═══ */

function renderErrorPatternPills(patterns) {
  if (!patterns || patterns.length === 0) return '';
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var html = '<div class="error-pattern-pills">';
  for (var i = 0; i < patterns.length; i++) {
    var info = ERROR_PATTERN_LABELS[patterns[i].key || patterns[i]];
    var label = info ? t(info.en, info.zh) : (patterns[i].key || patterns[i]);
    var band = patterns[i].confidence ? getConfidenceBand(patterns[i].confidence) : '';
    var cls = 'error-pattern-pill' + (band ? ' ep-' + band : '');
    html += '<span class="' + cls + '">' + esc(label) + '</span>';
  }
  html += '</div>';
  return html;
}

/* ═══ DEBUG AUDIT ═══ */

var DEBUG_ERROR_PATTERNS = false;

function epDebugTrace(q, recovery, meta) {
  if (!DEBUG_ERROR_PATTERNS) return;
  var signals = inferPatternSignals(q, recovery, meta);
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  var display = state ? getDisplayPatterns(state) : null;
  var row = {
    qid: (q && q.id) || '-',
    section: (q && q.s) || '-',
    diag: (q && q.diag) || '-',
    weakVocab: recovery && recovery.weakVocab ? recovery.weakVocab.length : 0,
    weakKP: recovery && recovery.weakKPs ? recovery.weakKPs.length : 0,
    siblings: recovery && recovery.siblingQuestions ? recovery.siblingQuestions.length : 0,
    signals: signals.map(function(s) { return s.type + ':' + s.weight; }).join(', '),
    primary: display && display.primaryPersistent ? display.primaryPersistent.key + '(' + display.primaryPersistent.confidence + ')' : '-',
    recent: display && display.recentTrend ? display.recentTrend.key + '(' + display.recentTrend.score + ')' : '-',
    events: state ? state.recentEvents.length : 0
  };
  console.table([row]);
}

function epDebugDumpState() {
  var state = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
  if (!state) { console.log('[EP] No state'); return; }
  var rows = [];
  for (var k in state.patternStats) {
    if (!state.patternStats.hasOwnProperty(k)) continue;
    var s = state.patternStats[k];
    rows.push({
      pattern: k,
      persistent: s.persistentScore,
      recent: s.recentScore,
      evidence: s.evidenceCount,
      recentEvidence: s.recentEvidenceCount,
      confidence: s.confidence,
      band: getConfidenceBand(s.confidence),
      lastSeen: s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleDateString() : '-'
    });
  }
  console.table(rows);
  console.log('[EP] recentEvents: ' + state.recentEvents.length + '/' + (typeof ERROR_PATTERN_CONFIG !== 'undefined' ? ERROR_PATTERN_CONFIG.maxRecentEvents : 80));
  var display = getDisplayPatterns(state);
  console.log('[EP] Primary:', display.primaryPersistent ? display.primaryPersistent.key : 'none');
  console.log('[EP] Recent trend:', display.recentTrend ? display.recentTrend.key : 'none');
}
