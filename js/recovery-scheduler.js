/* ══════════════════════════════════════════════════════════════
   recovery-scheduler.js — Adaptive Recovery Scheduler
   Adds daily budget, carry-over, and skip penalty on top of
   the Priority Engine. Generates a bounded daily recovery plan.
   ══════════════════════════════════════════════════════════════ */

/* ═══ SCHEDULE STATE PERSISTENCE ═══ */

var _SCHED_KEY = 'recovery_schedule';

function _loadScheduleState() {
  try {
    var raw = localStorage.getItem(_SCHED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { date: '', backlog: [], history: [] };
}

function _saveScheduleState(state) {
  try { localStorage.setItem(_SCHED_KEY, JSON.stringify(state)); }
  catch (e) {}
}

/* ═══ DATE HELPER ═══ */

function _todayStr() {
  return new Date().toLocaleDateString('en-CA'); /* YYYY-MM-DD */
}

/* ═══ BACKLOG MANAGEMENT ═══ */

/* Merge fresh priority units with existing backlog, preserving skip counts */
function _mergeWithBacklog(freshUnits, backlog) {
  /* Build lookup from backlog by type+id */
  var blMap = {};
  for (var i = 0; i < backlog.length; i++) {
    var bk = backlog[i].type + ':' + backlog[i].id;
    blMap[bk] = backlog[i];
  }

  /* Merge: fresh units get backlog's skippedCount if they exist there */
  var merged = [];
  var seen = {};

  for (var j = 0; j < freshUnits.length; j++) {
    var u = freshUnits[j];
    var key = u.type + ':' + u.id;
    if (seen[key]) continue;
    seen[key] = true;

    var bl = blMap[key];
    if (bl) {
      u.skippedCount = bl.skippedCount || 0;
      u.carryOver = bl.carryOver || false;
    } else {
      u.skippedCount = u.skippedCount || 0;
      u.carryOver = false;
    }
    merged.push(u);
  }

  /* Add backlog items not in fresh (they may still be stale but missed by stale detection edge timing) */
  for (var k = 0; k < backlog.length; k++) {
    var bkey = backlog[k].type + ':' + backlog[k].id;
    if (!seen[bkey]) {
      /* Check if item is still valid — skip if too old */
      var maxDays = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ?
        RECOVERY_SCHEDULER_CONFIG.maxCarryOverDays : 7;
      if ((backlog[k].skippedCount || 0) <= maxDays) {
        seen[bkey] = true;
        merged.push(backlog[k]);
      }
    }
  }

  return merged;
}

/* ═══ SKIP PENALTY ═══ */

function _applySkipPenalty(unit) {
  var step = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ?
    RECOVERY_SCHEDULER_CONFIG.skipPenaltyStep : 5;
  unit.priorityScore += (unit.skippedCount || 0) * step;
  return unit;
}

/* ═══ DAILY BUDGET ENFORCEMENT ═══ */

function _enforceDailyBudget(units) {
  var cfg = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ? RECOVERY_SCHEDULER_CONFIG : {};
  var maxTotal = cfg.maxUnitsPerDay || 10;
  var maxV = cfg.maxVocabPerDay || 5;
  var maxK = cfg.maxKPPerDay || 3;
  var maxP = cfg.maxPPPerDay || 4;

  var picked = [];
  var counts = { vocab: 0, kp: 0, pp: 0 };
  var overflow = [];

  for (var i = 0; i < units.length; i++) {
    var u = units[i];
    if (picked.length >= maxTotal) { overflow.push(u); continue; }
    if (u.type === 'vocab' && counts.vocab >= maxV) { overflow.push(u); continue; }
    if (u.type === 'kp' && counts.kp >= maxK) { overflow.push(u); continue; }
    if (u.type === 'pp' && counts.pp >= maxP) { overflow.push(u); continue; }

    picked.push(u);
    counts[u.type]++;
  }

  return { picked: picked, counts: counts, overflow: overflow };
}

/* ═══ DAILY PLAN BUILDER ═══ */

/* Cache to avoid rebuilding within same render cycle */
var _dailyPlanCache = null;
var _dailyPlanCacheDate = '';

/*
 * Build today's recovery plan with budget enforcement.
 * Returns: { date, total, vocab, kp, pp, items[], carryOverCount, backlogCount, reasons[] }
 */
function buildDailyRecoveryPlan(board) {
  var today = _todayStr();

  /* Return cache if same day and already built */
  if (_dailyPlanCache && _dailyPlanCacheDate === today) {
    return _dailyPlanCache;
  }

  var state = _loadScheduleState();

  /* Collect fresh scored units from priority engine */
  var freshUnits = [];
  if (typeof collectRecoveryUnits === 'function' && typeof computeRecoveryPriority === 'function') {
    var raw = collectRecoveryUnits(board);
    for (var i = 0; i < raw.length; i++) {
      computeRecoveryPriority(raw[i]);
    }
    freshUnits = raw;
  }

  if (freshUnits.length === 0 && (!state.backlog || state.backlog.length === 0)) {
    _dailyPlanCache = null;
    _dailyPlanCacheDate = today;
    return null;
  }

  /* Merge with backlog (preserves skippedCount) */
  var merged = _mergeWithBacklog(freshUnits, state.backlog || []);

  /* Apply skip penalty to boost repeatedly-skipped items */
  for (var j = 0; j < merged.length; j++) {
    _applySkipPenalty(merged[j]);
  }

  /* Sort by adjusted priority */
  if (typeof sortRecoveryUnits === 'function') {
    sortRecoveryUnits(merged);
  } else {
    merged.sort(function (a, b) { return b.priorityScore - a.priorityScore; });
  }

  /* Enforce daily budget */
  var result = _enforceDailyBudget(merged);

  /* Count carry-overs in picked items */
  var carryOverCount = 0;
  for (var c = 0; c < result.picked.length; c++) {
    if (result.picked[c].carryOver) carryOverCount++;
  }

  /* Build reason summary from picked items */
  var reasons = [];
  if (typeof summarizeRecoveryReasons === 'function') {
    var summary = summarizeRecoveryReasons(result.picked);
    if (summary && summary.topReasons) {
      for (var r = 0; r < Math.min(summary.topReasons.length, 2); r++) {
        reasons.push(summary.topReasons[r].label);
      }
    }
  }

  var plan = {
    date: today,
    total: result.picked.length,
    vocab: result.counts.vocab,
    kp: result.counts.kp,
    pp: result.counts.pp,
    items: result.picked,
    carryOverCount: carryOverCount,
    backlogCount: result.overflow.length,
    reasons: reasons
  };

  /* Update state: save overflow as new backlog */
  var newBacklog = [];
  for (var o = 0; o < result.overflow.length; o++) {
    var ov = result.overflow[o];
    newBacklog.push({
      type: ov.type,
      id: ov.id,
      board: ov.board,
      sectionId: ov.sectionId,
      priorityScore: ov.priorityScore,
      skippedCount: ov.skippedCount || 0,
      carryOver: true,
      reason: ov.reason,
      raw: ov.raw
    });
  }
  state.date = today;
  state.backlog = newBacklog;
  _saveScheduleState(state);

  /* Cache */
  _dailyPlanCache = plan;
  _dailyPlanCacheDate = today;

  /* Update explainability cache for Today's Plan reason display */
  if (typeof _lastSmartUnits !== 'undefined') {
    _lastSmartUnits = result.picked;
  }

  /* Debug logging */
  if (typeof RECOVERY_EXPLAIN_DEBUG !== 'undefined' && RECOVERY_EXPLAIN_DEBUG) {
    console.group('[Recovery Scheduler] Daily Plan ' + today);
    console.log('Budget: ' + plan.total + ' items (V:' + plan.vocab + ' K:' + plan.kp + ' P:' + plan.pp + ')');
    console.log('Carry-over: ' + plan.carryOverCount + ', Backlog: ' + plan.backlogCount);
    if (plan.reasons.length) console.log('Focus: ' + plan.reasons.join(', '));
    console.groupEnd();
  }

  return plan;
}

/* ═══ PLAN → SESSION QUEUE CONVERTER ═══ */

/*
 * Convert a daily plan's items into session queue format.
 * Groups by type (highest-score type first), matching Recovery Session format.
 */
function dailyPlanToSessionQueue(plan) {
  if (!plan || !plan.items || !plan.items.length) return [];

  /* Group by type, track best score per type */
  var typeBest = {};
  var typeItems = {};

  for (var i = 0; i < plan.items.length; i++) {
    var tp = plan.items[i].type;
    if (!typeItems[tp]) { typeItems[tp] = []; typeBest[tp] = -1; }
    typeItems[tp].push(plan.items[i]);
    if (plan.items[i].priorityScore > typeBest[tp]) typeBest[tp] = plan.items[i].priorityScore;
  }

  /* Sort types by best score */
  var types = [];
  for (var t in typeBest) {
    if (typeItems[t].length > 0) types.push(t);
  }
  types.sort(function (a, b) { return typeBest[b] - typeBest[a]; });

  /* Build queue entries */
  var queue = [];
  for (var j = 0; j < types.length; j++) {
    var entry = {
      type: types[j],
      count: typeItems[types[j]].length,
      board: plan.items[0].board || null,
      _smart: true,
      _scheduled: true,
      _score: typeBest[types[j]]
    };
    if (types[j] === 'vocab') {
      entry.data = typeItems.vocab.map(function (u) { return u.raw; });
    }
    queue.push(entry);
  }

  return queue;
}

/* ═══ SESSION FINALIZATION ═══ */

/*
 * Called when a recovery session ends.
 * Moves incomplete items to backlog with skippedCount++.
 */
function finalizeRecoverySchedule(completedTypes) {
  if (!_dailyPlanCache) return;

  var state = _loadScheduleState();
  var today = _todayStr();
  var done = completedTypes || {};

  /* Items from today's plan that weren't completed go to backlog */
  for (var i = 0; i < _dailyPlanCache.items.length; i++) {
    var item = _dailyPlanCache.items[i];
    if (!done[item.type]) {
      /* This type was not completed — carry over all items of this type */
      var exists = false;
      for (var b = 0; b < state.backlog.length; b++) {
        if (state.backlog[b].type === item.type && state.backlog[b].id === item.id) {
          state.backlog[b].skippedCount = (state.backlog[b].skippedCount || 0) + 1;
          state.backlog[b].carryOver = true;
          exists = true;
          break;
        }
      }
      if (!exists) {
        state.backlog.push({
          type: item.type,
          id: item.id,
          board: item.board,
          sectionId: item.sectionId,
          priorityScore: item.priorityScore,
          skippedCount: (item.skippedCount || 0) + 1,
          carryOver: true,
          reason: item.reason,
          raw: item.raw
        });
      }
    }
  }

  /* Record in history (lightweight) */
  if (!state.history) state.history = [];
  state.history.push({
    date: today,
    planned: _dailyPlanCache.total,
    done: Object.keys(done).length,
    types: Object.keys(done)
  });
  /* Keep only last 30 days */
  if (state.history.length > 30) state.history = state.history.slice(-30);

  _saveScheduleState(state);

  /* Invalidate cache so next plan rebuild is fresh */
  _dailyPlanCache = null;
  _dailyPlanCacheDate = '';
}

/* ═══ QUERY HELPERS ═══ */

/* Get today's plan (build if needed) */
function getTodayRecoveryPlan(board) {
  return buildDailyRecoveryPlan(board);
}

/* Get current backlog count */
function getRecoveryBacklogCount() {
  var state = _loadScheduleState();
  return state.backlog ? state.backlog.length : 0;
}

/* Invalidate daily plan cache (e.g. after learning activity) */
function invalidateRecoveryPlanCache() {
  _dailyPlanCache = null;
  _dailyPlanCacheDate = '';
}
