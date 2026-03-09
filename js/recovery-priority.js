/* ══════════════════════════════════════════════════════════════
   recovery-priority.js — Smart Recovery Priority Engine
   Computes priority scores for stale items and builds smart
   recovery queues ordered by urgency instead of fixed type order.
   ══════════════════════════════════════════════════════════════ */

/* ═══ INDEX BUILDERS ═══ */

/* Build qid → question lookup for PP section resolution */
function _buildPPIndex(board) {
  var idx = {};
  if (typeof getPPQuestions !== 'function') return idx;
  var qs = getPPQuestions(board);
  if (!qs) return idx;
  for (var i = 0; i < qs.length; i++) idx[qs[i].id] = qs[i];
  return idx;
}

/* Build kpId → kp lookup for KP section resolution */
function _buildKPIndex(board) {
  var idx = {};
  if (typeof _kpData === 'undefined' || !_kpData) return idx;
  for (var b in _kpData) {
    if (!_kpData[b]) continue;
    for (var i = 0; i < _kpData[b].length; i++) {
      idx[_kpData[b][i].id] = _kpData[b][i];
    }
  }
  return idx;
}

/* ═══ FOUR-DIMENSION SCORING ═══ */

/* Error Weight (0-45): higher error rate → higher priority */
function _computeErrorWeight(type, raw, ppMastery) {
  var ok = 0, fail = 0;

  if (type === 'vocab') {
    var wd = typeof getWordData === 'function' ? getWordData() : {};
    var d = wd[raw.key] || {};
    ok = d.ok || 0;
    fail = d.fail || 0;
  } else if (type === 'kp') {
    var s = typeof loadS === 'function' ? loadS() : {};
    var kpDone = s.kpDone || {};
    var dk = kpDone[raw.id] || {};
    ok = dk.ok || 0;
    fail = dk.fail || 0;
  } else if (type === 'pp') {
    var pm = ppMastery[raw.qid] || {};
    /* PP has no explicit ok/fail — use cs as proxy */
    return (pm.cs === 0) ? 23 : 0; /* ~half of 45 */
  }

  var attempts = ok + fail;
  if (attempts === 0) return 0;
  return Math.round((fail / attempts) * 45);
}

/* Decay Weight (0-35): days overdue beyond expected interval */
function _computeDecayWeight(raw) {
  var rc = raw.rc || 0;
  var threshold = REFRESH_INTERVALS[Math.min(rc, REFRESH_INTERVALS.length - 1)];
  var daysSince = raw.daysSince || 0;
  var overdue = Math.max(0, daysSince - threshold);

  /* Use config buckets if available */
  if (typeof RECOVERY_PRIORITY_CONFIG !== 'undefined' && RECOVERY_PRIORITY_CONFIG.decayBuckets) {
    var buckets = RECOVERY_PRIORITY_CONFIG.decayBuckets;
    for (var i = 0; i < buckets.length; i++) {
      if (overdue <= buckets[i].days) return buckets[i].score;
    }
    return buckets[buckets.length - 1].score;
  }

  /* Fallback: linear 1.5x capped at 35 */
  return Math.min(35, Math.round(overdue * 1.5));
}

/* Exam Weight (0-20): section question count as proxy for exam importance */
function _computeExamWeight(sectionId, board) {
  if (!sectionId) return typeof RECOVERY_PRIORITY_CONFIG !== 'undefined' ? RECOVERY_PRIORITY_CONFIG.defaultExamWeight : 8;

  if (typeof ppGetSectionStats === 'function') {
    try {
      var brd = board || 'cie';
      var ps = ppGetSectionStats(brd, sectionId);
      if (ps) return Math.min(20, Math.round((ps.total || 0) / 5));
    } catch (e) {}
  }

  return typeof RECOVERY_PRIORITY_CONFIG !== 'undefined' ? RECOVERY_PRIORITY_CONFIG.defaultExamWeight : 8;
}

/* Health Penalty (0-15): lower section health → higher priority */
function _computeHealthPenalty(sectionId, board) {
  if (!sectionId) return 0;

  if (typeof getSectionHealth === 'function') {
    try {
      var h = getSectionHealth(sectionId, board);
      if (h && typeof h.score === 'number') {
        /* Use config thresholds if available */
        if (typeof RECOVERY_PRIORITY_CONFIG !== 'undefined' && RECOVERY_PRIORITY_CONFIG.healthPenalty) {
          var hp = RECOVERY_PRIORITY_CONFIG.healthPenalty;
          for (var i = 0; i < hp.length; i++) {
            if (h.score < hp[i].max) return hp[i].score;
          }
          return 0;
        }
        /* Fallback: linear */
        return Math.round((1 - h.score / 100) * 15);
      }
    } catch (e) {}
  }

  return 0;
}

/* ═══ UNIT COLLECTION ═══ */

/* Collect all stale items as RecoveryUnits */
function collectRecoveryUnits(board) {
  var units = [];
  var ppM = typeof _ppGetMastery === 'function' ? _ppGetMastery() : {};
  var kpIdx = _buildKPIndex(board);
  var ppIdx = _buildPPIndex(board);

  /* Vocab */
  if (typeof getStaleWords === 'function') {
    var sw = getStaleWords();
    if (sw) {
      for (var i = 0; i < sw.length; i++) {
        var secV = (typeof LEVELS !== 'undefined' && LEVELS[sw[i].level]) ?
          LEVELS[sw[i].level]._section : null;
        units.push({
          type: 'vocab',
          id: sw[i].key,
          board: board || '',
          sectionId: secV,
          errorWeight: 0, decayWeight: 0, examWeight: 0, healthPenalty: 0,
          priorityScore: 0,
          reason: [],
          raw: sw[i],
          _ppM: ppM
        });
      }
    }
  }

  /* KP */
  if (typeof getStaleKPs === 'function') {
    var sk = getStaleKPs(board);
    if (sk) {
      for (var j = 0; j < sk.length; j++) {
        var kpObj = kpIdx[sk[j].id];
        var secK = kpObj ? kpObj.section : null;
        units.push({
          type: 'kp',
          id: sk[j].id,
          board: board || '',
          sectionId: secK,
          errorWeight: 0, decayWeight: 0, examWeight: 0, healthPenalty: 0,
          priorityScore: 0,
          reason: [],
          raw: sk[j],
          _ppM: ppM
        });
      }
    }
  }

  /* PP */
  if (typeof getStalePPQuestions === 'function') {
    var sp = getStalePPQuestions(board);
    if (sp) {
      for (var k = 0; k < sp.length; k++) {
        var ppQ = ppIdx[sp[k].qid];
        var secP = ppQ ? ppQ.s : null;
        units.push({
          type: 'pp',
          id: sp[k].qid,
          board: board || '',
          sectionId: secP,
          errorWeight: 0, decayWeight: 0, examWeight: 0, healthPenalty: 0,
          priorityScore: 0,
          reason: [],
          raw: sp[k],
          _ppM: ppM
        });
      }
    }
  }

  return units;
}

/* ═══ PRIORITY COMPUTATION ═══ */

/* Compute all four weights and total priority for a single unit */
function computeRecoveryPriority(unit) {
  unit.errorWeight = _computeErrorWeight(unit.type, unit.raw, unit._ppM || {});
  unit.decayWeight = _computeDecayWeight(unit.raw);
  unit.examWeight = _computeExamWeight(unit.sectionId, unit.board);
  unit.healthPenalty = _computeHealthPenalty(unit.sectionId, unit.board);

  unit.priorityScore =
    unit.errorWeight +
    unit.decayWeight +
    unit.examWeight +
    unit.healthPenalty;

  /* Explainability — for debug, not shown to users */
  unit.reason = [];
  if (unit.errorWeight > 20) unit.reason.push('high error rate');
  else if (unit.errorWeight > 0) unit.reason.push('error');
  if (unit.decayWeight > 20) unit.reason.push('stale ' + (unit.raw.daysSince || 0) + ' days');
  else if (unit.decayWeight > 0) unit.reason.push('decay');
  if (unit.examWeight > 12) unit.reason.push('high exam weight');
  else if (unit.examWeight > 0) unit.reason.push('exam');
  if (unit.healthPenalty > 8) unit.reason.push('weak section');
  else if (unit.healthPenalty > 0) unit.reason.push('health');

  /* Clean up temp field */
  delete unit._ppM;

  return unit;
}

/* ═══ SORTING ═══ */

/* Sort units by priority score descending, with tie-breakers */
function sortRecoveryUnits(units) {
  units.sort(function (a, b) {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.decayWeight !== a.decayWeight) return b.decayWeight - a.decayWeight;
    if (b.examWeight !== a.examWeight) return b.examWeight - a.examWeight;
    return 0;
  });
  return units;
}

/* ═══ TYPE GROUPING ═══ */

/*
 * Group sorted units into type-coherent batches.
 * Batch order is determined by the highest-priority item of each type.
 * Output matches Recovery Session queue format: [{type, count, data, board}]
 */
function groupRecoveryUnitsByType(units, board) {
  /* Apply maxUnits cap */
  var max = (typeof RECOVERY_PRIORITY_CONFIG !== 'undefined' && RECOVERY_PRIORITY_CONFIG.maxUnits) || 30;
  var capped = units.slice(0, max);

  /* Find highest score per type and collect items */
  var typeBest = {};
  var typeItems = {};

  for (var i = 0; i < capped.length; i++) {
    var tp = capped[i].type;
    if (!typeItems[tp]) { typeItems[tp] = []; typeBest[tp] = -1; }
    typeItems[tp].push(capped[i]);
    if (capped[i].priorityScore > typeBest[tp]) typeBest[tp] = capped[i].priorityScore;
  }

  /* Sort types by their highest-scoring item */
  var types = [];
  for (var t in typeBest) {
    if (typeItems[t].length > 0) types.push(t);
  }
  types.sort(function (a, b) { return typeBest[b] - typeBest[a]; });

  /* Build queue entries matching Recovery Session format */
  var queue = [];
  for (var j = 0; j < types.length; j++) {
    var entry = {
      type: types[j],
      count: typeItems[types[j]].length,
      board: board || null,
      _smart: true,
      _score: typeBest[types[j]]
    };
    /* vocab needs data array passed to startRefreshScan */
    if (types[j] === 'vocab') {
      entry.data = typeItems.vocab.map(function (u) { return u.raw; });
    }
    queue.push(entry);
  }

  return queue;
}

/* ═══ MAIN ENTRY ═══ */

/*
 * Build a smart recovery queue ordered by priority.
 * Returns queue array compatible with Recovery Session engine.
 * Returns empty array if no stale items or on error.
 */
function buildSmartRecoveryQueue(board) {
  var units = collectRecoveryUnits(board);
  if (!units || !units.length) return [];

  for (var i = 0; i < units.length; i++) {
    computeRecoveryPriority(units[i]);
  }

  sortRecoveryUnits(units);
  return groupRecoveryUnitsByType(units, board);
}
