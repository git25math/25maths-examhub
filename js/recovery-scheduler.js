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

function _enforceDailyBudget(units, budget, caps) {
  var cfg = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ? RECOVERY_SCHEDULER_CONFIG : {};
  var maxTotal = (budget && budget.maxUnitsPerDay) || cfg.maxUnitsPerDay || 10;
  var maxV = (caps && caps.maxVocabPerDay) || cfg.maxVocabPerDay || 5;
  var maxK = (caps && caps.maxKPPerDay) || cfg.maxKPPerDay || 3;
  var maxP = (caps && caps.maxPPPerDay) || cfg.maxPPPerDay || 4;

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

/* ═══ PERSONALIZED SCHEDULING (v3.8.0) ═══ */

function getProfileAdjustedBudget(baseBudget, profile) {
  var pcfg = (typeof RECOVERY_PERSONALIZATION_CONFIG !== 'undefined') ? RECOVERY_PERSONALIZATION_CONFIG : {};
  var next = {};
  var cfg = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ? RECOVERY_SCHEDULER_CONFIG : {};
  next.maxUnitsPerDay = (baseBudget && baseBudget.maxUnitsPerDay) || cfg.maxUnitsPerDay || 10;
  if (!profile) return next;

  var total = next.maxUnitsPerDay;

  if (profile.learningTrend === 'up') total += (pcfg.improveBonus || 1);
  if ((profile.recoveryRate || 0) >= 0.75) total += (pcfg.strongRecoveryBonus || 1);
  if (profile.learningTrend === 'down') total += (pcfg.decliningPenalty || -1);
  if ((profile.skipRate || 0) >= 0.3) total += (pcfg.highSkipPenalty || -2);
  if ((profile.backlogPressure || 0) >= (pcfg.carryOverWarningThreshold || 6)) total += (pcfg.highBacklogPenalty || -2);

  total = Math.max(pcfg.minUnitsPerDay || 4, total);
  total = Math.min(pcfg.maxUnitsPerDayCap || 12, total);

  next.maxUnitsPerDay = total;
  next._adjustedFrom = (baseBudget && baseBudget.maxUnitsPerDay) || cfg.maxUnitsPerDay || 10;
  return next;
}

function getProfileAdjustedTypeCaps(baseCaps, profile) {
  var cfg = (typeof RECOVERY_SCHEDULER_CONFIG !== 'undefined') ? RECOVERY_SCHEDULER_CONFIG : {};
  var caps = {
    maxVocabPerDay: (baseCaps && baseCaps.maxVocabPerDay) || cfg.maxVocabPerDay || 5,
    maxKPPerDay: (baseCaps && baseCaps.maxKPPerDay) || cfg.maxKPPerDay || 3,
    maxPPPerDay: (baseCaps && baseCaps.maxPPPerDay) || cfg.maxPPPerDay || 4
  };
  if (!profile || !profile.weakType) return caps;

  if (profile.weakType === 'vocab') caps.maxVocabPerDay += 1;
  if (profile.weakType === 'kp') caps.maxKPPerDay += 1;
  if (profile.weakType === 'pp') caps.maxPPPerDay += 1;

  return caps;
}

function applyProfileBias(units, profile) {
  if (!profile) return units;
  var pcfg = (typeof RECOVERY_PERSONALIZATION_CONFIG !== 'undefined') ? RECOVERY_PERSONALIZATION_CONFIG : {};

  for (var i = 0; i < units.length; i++) {
    if (profile.weakSections && profile.weakSections.indexOf(units[i].sectionId) !== -1) {
      units[i].priorityScore += (pcfg.weakSectionBias || 8);
      units[i]._personalizedReason = 'weak-section';
    }
    if (profile.weakType && profile.weakType === units[i].type) {
      units[i].priorityScore += (pcfg.weakTypeBias || 5);
      if (!units[i]._personalizedReason) units[i]._personalizedReason = 'weak-type';
    }
  }

  return units;
}

function _inferPersonalizationNote(budget, caps, profile) {
  if (!profile) return '';
  /* Priority: load reduction > weak type > weak section */
  if (budget && budget._adjustedFrom && budget.maxUnitsPerDay < budget._adjustedFrom) return 'lighter-load';
  if (profile.weakType) return 'weak-type-bias';
  if (profile.weakSections && profile.weakSections.length > 0) return 'weak-section-bias';
  return '';
}

/* Build structured personalization reasons (v3.8.1) */
function buildPersonalizationReasons(profile, budget, caps) {
  var reasons = [];
  if (!profile) return reasons;

  var _typeLabels = { vocab: ['Vocabulary', '\u8BCD\u6C47'], kp: ['Knowledge Points', '\u77E5\u8BC6\u70B9'], pp: ['Practice Questions', '\u7EC3\u4E60\u9898'] };

  /* Budget was lowered */
  if (budget && budget._adjustedFrom && budget.maxUnitsPerDay < budget._adjustedFrom) {
    if ((profile.backlogPressure || 0) >= ((typeof RECOVERY_PERSONALIZATION_CONFIG !== 'undefined' ? RECOVERY_PERSONALIZATION_CONFIG.carryOverWarningThreshold : 6) || 6)) {
      reasons.push({ key: 'backlog', en: 'Lighter session today \u2014 consistency matters most!', zh: '\u4ECA\u65E5\u8F7B\u91CF\u7EC3\u4E60\u2014\u2014\u4FDD\u6301\u8282\u594F\u6700\u91CD\u8981\uFF01' });
    }
    if ((profile.skipRate || 0) >= 0.3) {
      reasons.push({ key: 'skip-rate', en: 'High skip rate \u2014 reducing load to stay on track', zh: '\u8DF3\u8FC7\u7387\u8F83\u9AD8\uFF0C\u5DF2\u964D\u4F4E\u4EFB\u52A1\u91CF\u4EE5\u4FDD\u6301\u8282\u594F' });
    }
  }

  /* Budget was raised */
  if (budget && budget._adjustedFrom && budget.maxUnitsPerDay > budget._adjustedFrom) {
    if (profile.learningTrend === 'up') {
      reasons.push({ key: 'improving', en: 'You\'re improving \u2014 slightly more tasks today', zh: '\u4F60\u5728\u8FDB\u6B65\u4E2D\uFF0C\u4ECA\u65E5\u4EFB\u52A1\u91CF\u5DF2\u8F7B\u5FAE\u63D0\u9AD8' });
    }
    if ((profile.recoveryRate || 0) >= 0.75) {
      reasons.push({ key: 'strong-recovery', en: 'Strong recovery rate \u2014 a bit more to keep momentum', zh: '\u590D\u67E5\u5B8C\u6210\u7387\u9AD8\uFF0C\u5DF2\u9002\u5EA6\u589E\u52A0\u4EFB\u52A1\u4FDD\u6301\u52BF\u5934' });
    }
  }

  /* Weak type cap boost */
  if (profile.weakType) {
    var tl = _typeLabels[profile.weakType] || [profile.weakType, profile.weakType];
    reasons.push({ key: 'weak-type', en: tl[0] + ' is your weakest area \u2014 more added today', zh: tl[1] + '\u662F\u4F60\u5F53\u524D\u6700\u8584\u5F31\u7C7B\u578B\uFF0C\u5DF2\u589E\u52A0\u5BF9\u5E94\u4EFB\u52A1' });
  }

  /* Weak section bias */
  if (profile.weakSections && profile.weakSections.length > 0 && !profile.weakType) {
    reasons.push({ key: 'weak-section', en: 'Weak sections prioritized in today\'s plan', zh: '\u4ECA\u65E5\u8BA1\u5212\u5DF2\u4F18\u5148\u5B89\u6392\u8F83\u5F31\u7AE0\u8282' });
  }

  /* Declining trend */
  if (profile.learningTrend === 'down') {
    reasons.push({ key: 'declining', en: 'Recent accuracy dipped \u2014 load adjusted', zh: '\u8FD1\u671F\u51C6\u786E\u7387\u4E0B\u6ED1\uFF0C\u5DF2\u8C03\u6574\u4EFB\u52A1\u91CF' });
  }

  return reasons;
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

  /* Personalized scheduling (v3.8.0) */
  var _pProfile = (typeof getStudentProfileSummary === 'function') ? getStudentProfileSummary() : null;
  if (_pProfile) {
    applyProfileBias(merged, _pProfile);
  }

  /* Goal bias (v3.9.0) */
  if (typeof applyGoalBias === 'function') {
    var _gState = (typeof getLearningGoalsState === 'function') ? getLearningGoalsState() : null;
    applyGoalBias(merged, _gState);
  }

  /* Sort by adjusted priority */
  if (typeof sortRecoveryUnits === 'function') {
    sortRecoveryUnits(merged);
  } else {
    merged.sort(function (a, b) { return b.priorityScore - a.priorityScore; });
  }

  /* Enforce daily budget (personalized) */
  var _pBudget = getProfileAdjustedBudget(null, _pProfile);
  var _pCaps = getProfileAdjustedTypeCaps(null, _pProfile);
  var result = _enforceDailyBudget(merged, _pBudget, _pCaps);

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

  var _pNote = _inferPersonalizationNote(_pBudget, _pCaps, _pProfile);
  var _pReasons = buildPersonalizationReasons(_pProfile, _pBudget, _pCaps);

  var plan = {
    date: today,
    total: result.picked.length,
    vocab: result.counts.vocab,
    kp: result.counts.kp,
    pp: result.counts.pp,
    items: result.picked,
    carryOverCount: carryOverCount,
    backlogCount: result.overflow.length,
    reasons: reasons,
    personalizationNote: _pNote,
    personalization: {
      note: _pNote,
      reasons: _pReasons
    }
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
    if (_pProfile) console.log('Profile:', _pProfile);
    if (_pBudget) console.log('Adjusted budget:', _pBudget._adjustedFrom, '->', _pBudget.maxUnitsPerDay);
    if (_pReasons.length) console.log('Personalization reasons:', _pReasons.map(function(r) { return r.key; }));
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
function finalizeRecoverySchedule(completedTypes, meta) {
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

  /* Record in history (enriched v3.6.1) */
  if (!state.history) state.history = [];
  var _meta = meta || {};
  var carryOutCount = 0;
  for (var co = 0; co < state.backlog.length; co++) {
    if (state.backlog[co].carryOver) carryOutCount++;
  }
  state.history.push({
    date: today,
    planned: _dailyPlanCache.total,
    done: Object.keys(done).length,
    types: Object.keys(done),
    total: _meta.total || _dailyPlanCache.total,
    completed: _meta.completed || Object.keys(done).length,
    carryOverOut: carryOutCount,
    durationSec: _meta.durationSec || 0
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

/* Get full recovery schedule history for profile analysis */
function getRecoveryScheduleHistory() {
  var state = _loadScheduleState();
  return state.history || [];
}

/* Invalidate daily plan cache (e.g. after learning activity) */
function invalidateRecoveryPlanCache() {
  _dailyPlanCache = null;
  _dailyPlanCacheDate = '';
}

/* ═══ CARRY-OVER & CALENDAR HELPERS (v3.6.1) ═══ */

/* Split today's plan items into fresh vs carry-over */
function splitTodayPlanItems(plan) {
  if (!plan || !plan.items) return { fresh: [], carryOver: [] };
  var fresh = [], co = [];
  for (var i = 0; i < plan.items.length; i++) {
    if (plan.items[i].carryOver) co.push(plan.items[i]);
    else fresh.push(plan.items[i]);
  }
  return { fresh: fresh, carryOver: co };
}

/* Get recent N days recovery history for calendar lite */
function getRecentRecoveryHistory(days) {
  var n = days || 7;
  var state = _loadScheduleState();
  var hist = state.history || [];

  /* Build date→entry map */
  var map = {};
  for (var i = 0; i < hist.length; i++) {
    map[hist[i].date] = hist[i];
  }

  /* Generate last N days */
  var result = [];
  var now = new Date();
  for (var d = n - 1; d >= 0; d--) {
    var dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    var ds = dt.toLocaleDateString('en-CA');
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var entry = map[ds];
    result.push({
      date: ds,
      day: dayNames[dt.getDay()],
      planned: entry ? (entry.planned || 0) : 0,
      done: entry ? (entry.done || 0) : 0,
      hasData: !!entry
    });
  }

  return result;
}
