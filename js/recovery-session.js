/* ══════════════════════════════════════════════════════════════
   recovery-session.js — Recovery Session orchestration
   Chains refresh scans into a single session, ordered by
   smart priority engine (v3.5) with legacy fallback.
   Triggered from Today's Plan "Start Recovery" button.
   ══════════════════════════════════════════════════════════════ */

var _recoverySession = null;
var RECOVERY_ADVANCE_DELAY = 800;

/* Legacy fixed-order queue builder (fallback) */
function _buildLegacyRecoverySession() {
  var board = typeof userBoard !== 'undefined' ? userBoard : null;
  var queue = [];
  if (typeof getStaleWords === 'function') {
    var sw = getStaleWords();
    if (sw && sw.length > 0) queue.push({ type: 'vocab', count: sw.length, data: sw, board: board });
  }
  if (typeof getStaleKPs === 'function') {
    var sk = getStaleKPs(board);
    if (sk && sk.length > 0) queue.push({ type: 'kp', count: sk.length, board: board });
  }
  if (typeof getStalePPQuestions === 'function') {
    var sp = getStalePPQuestions(board);
    if (sp && sp.length > 0) queue.push({ type: 'pp', count: sp.length, board: board });
  }
  return queue;
}

/* Build a queue of stale item types to review — scheduler → smart → legacy fallback */
function buildRecoverySession() {
  var board = typeof userBoard !== 'undefined' ? userBoard : null;

  /* Try adaptive scheduler first (v3.6) */
  try {
    if (typeof getTodayRecoveryPlan === 'function') {
      var plan = getTodayRecoveryPlan(board);
      if (plan && plan.items && plan.items.length > 0 && typeof dailyPlanToSessionQueue === 'function') {
        return dailyPlanToSessionQueue(plan);
      }
    }
  } catch (e) { /* fall through */ }

  /* Try smart priority engine (v3.5) */
  try {
    if (typeof buildSmartRecoveryQueue === 'function') {
      var smart = buildSmartRecoveryQueue(board);
      if (smart && smart.length > 0) return smart;
    }
  } catch (e) { /* fall through to legacy */ }

  return _buildLegacyRecoverySession();
}

/* Start a recovery session — called from Today's Plan delegation */
function startRecoverySession() {
  if (_recoverySession) {
    if (typeof showToast === 'function') showToast(t('Recovery already running', '复查正在进行中'));
    return;
  }
  var queue = buildRecoverySession();
  if (queue.length === 0) {
    if (typeof showToast === 'function') showToast(t('Nothing to refresh!', '没有需要复查的内容！'));
    return;
  }
  /* Capture reason summary from smart engine if available */
  var summaryReasons = [];
  try {
    if (typeof getLastSmartQueueSummary === 'function') {
      var summary = getLastSmartQueueSummary();
      if (summary && summary.topReasons) {
        for (var ri = 0; ri < Math.min(summary.topReasons.length, 2); ri++) {
          summaryReasons.push(summary.topReasons[ri].label);
        }
      }
    }
  } catch (e) {}

  _recoverySession = {
    queue: queue,
    currentIndex: 0,
    results: [],
    startedAt: Date.now(),
    summaryReasons: summaryReasons
  };
  _runCurrentRecoveryItem();
}

/* Dispatch to the correct start function for current queue item */
function _runCurrentRecoveryItem() {
  if (!_recoverySession) return;
  var item = _recoverySession.queue[_recoverySession.currentIndex];
  if (!item) { _endRecoverySession(); return; }

  try {
    if (item.type === 'vocab' && typeof startRefreshScan === 'function') {
      startRefreshScan(item.data);
    } else if (item.type === 'kp' && typeof startKPRefreshScan === 'function') {
      startKPRefreshScan();
    } else if (item.type === 'pp' && typeof startPPRefreshScan === 'function') {
      startPPRefreshScan();
    } else {
      _recoverySession.results.push({ type: item.type, status: 'skipped' });
      _advanceRecoverySession();
    }
  } catch (e) {
    _recoverySession.results.push({ type: item.type, status: 'skipped' });
    _advanceRecoverySession();
  }
}

/* Record result without advancing (called by finish hooks) */
function _recordRecoveryResult(resultType) {
  if (!_recoverySession) return;
  _recoverySession.results.push({ type: resultType, status: 'done' });
}

/* Advance to next item (called by session buttons) */
function _advanceRecoverySession() {
  if (!_recoverySession) return;
  _recoverySession.currentIndex++;
  if (_recoverySession.currentIndex >= _recoverySession.queue.length) {
    _endRecoverySession();
  } else {
    _runCurrentRecoveryItem();
  }
}

/* ═══ RECOVERY SESSION UI HELPERS ═══ */

function _getRecoveryStepLabel(type) {
  if (type === 'vocab') return t('Vocabulary', '词汇');
  if (type === 'kp') return t('Knowledge Points', '知识点');
  if (type === 'pp') return t('Past Papers', '真题');
  return type;
}

function _renderRecoveryStepBar() {
  if (!_recoverySession) return '';
  var q = _recoverySession.queue;
  var cur = _recoverySession.currentIndex;
  var html = '<div class="recovery-step-bar">';
  for (var i = 0; i < q.length; i++) {
    var cls = 'recovery-step';
    if (i < cur) cls += ' done';
    else if (i === cur) cls += ' active';
    html += '<span class="' + cls + '">' + _getRecoveryStepLabel(q[i].type) + '</span>';
    if (i < q.length - 1) html += '<span class="recovery-step-arrow">\u203a</span>';
  }
  html += '</div>';
  return html;
}

function _renderRecoveryResultButtons() {
  if (!_recoverySession) return '';
  var cur = _recoverySession.currentIndex;
  var total = _recoverySession.queue.length;
  var isLast = (cur >= total - 1);
  var html = '<div class="result-actions">';
  if (isLast) {
    html += '<button class="btn btn-primary" onclick="_finishRecoveryFromResult()">';
    html += t('Finish Recovery', '完成复查') + '</button>';
  } else {
    var nextType = _recoverySession.queue[cur + 1].type;
    html += '<button class="btn btn-primary" onclick="_advanceRecoveryFromResult()">';
    html += t('Next', '下一步') + ': ' + _getRecoveryStepLabel(nextType) + ' \u2192</button>';
  }
  html += '<button class="btn btn-ghost" onclick="_exitRecoveryFromResult()">';
  html += t('Exit Recovery', '退出复查') + '</button>';
  html += '</div>';
  return html;
}

function _advanceRecoveryFromResult() {
  _advanceRecoverySession();
}
function _finishRecoveryFromResult() {
  _endRecoverySession();
}
function _exitRecoveryFromResult() {
  skipRecoverySession();
  if (typeof navTo === 'function') navTo('plan');
  if (typeof showToast === 'function') showToast(t('Recovery session ended', '复查已中止'));
}

/* Finish session: navigate to plan + show summary toast */
function _endRecoverySession() {
  if (!_recoverySession) return;
  var results = _recoverySession.results;
  var duration = Math.round((Date.now() - _recoverySession.startedAt) / 1000);
  var reasons = _recoverySession.summaryReasons || [];

  /* Finalize scheduler: track completed types, carry over incomplete */
  try {
    if (typeof finalizeRecoverySchedule === 'function') {
      var completedTypes = {};
      var doneCount = 0;
      for (var ci = 0; ci < results.length; ci++) {
        if (results[ci].status === 'done') { completedTypes[results[ci].type] = true; doneCount++; }
      }
      finalizeRecoverySchedule(completedTypes, {
        total: results.length,
        completed: doneCount,
        durationSec: duration
      });
    }
  } catch (e) {}

  _recoverySession = null;
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;

  /* Refresh goals to detect completions (v3.9.1) */
  if (typeof refreshLearningGoals === 'function') {
    try { refreshLearningGoals(); } catch (e) {}
  }

  if (typeof navTo === 'function') navTo('plan');

  var done = 0, skipped = 0;
  for (var i = 0; i < results.length; i++) {
    if (results[i].status === 'done') done++;
    else skipped++;
  }
  var mins = Math.floor(duration / 60);
  var secs = duration % 60;
  var timeStr = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';
  var msg = done + ' ' + t('scans completed', '轮扫描完成');
  if (skipped > 0) msg += ', ' + skipped + ' ' + t('skipped', '跳过');
  msg += ' (' + timeStr + ')';
  /* Personalized explainability in toast (v3.8.1) */
  var _toastNote = '';
  if (_dailyPlanCache && _dailyPlanCache.personalization && _dailyPlanCache.personalization.reasons) {
    var _tReasons = _dailyPlanCache.personalization.reasons;
    var _tMax = (typeof RECOVERY_EXPLAINABILITY_CONFIG !== 'undefined') ? (RECOVERY_EXPLAINABILITY_CONFIG.maxReasonsOnSummary || 2) : 2;
    var _tParts = [];
    for (var _ti = 0; _ti < Math.min(_tReasons.length, _tMax); _ti++) {
      _tParts.push(t(_tReasons[_ti].en, _tReasons[_ti].zh));
    }
    if (_tParts.length > 0) _toastNote = _tParts.join(t('; ', '\uFF1B'));
  }
  if (_toastNote) {
    msg += ' \u00b7 ' + _toastNote;
  } else if (reasons.length > 0) {
    msg += ' \u00b7 ' + t('Focus', '重点') + ': ' + reasons.join(t(', ', '、'));
  }
  if (typeof showToast === 'function') showToast(msg, 'success');
}

/* Check if a recovery session is currently active */
function isRecoverySessionActive() {
  return _recoverySession !== null;
}

/* Silently terminate recovery session (e.g. user navigated away) */
function skipRecoverySession() {
  /* Carry over all remaining items */
  if (_recoverySession) {
    try {
      if (typeof finalizeRecoverySchedule === 'function') {
        var completedTypes = {};
        var results = _recoverySession.results || [];
        for (var i = 0; i < results.length; i++) {
          if (results[i].status === 'done') completedTypes[results[i].type] = true;
        }
        finalizeRecoverySchedule(completedTypes);
      }
    } catch (e) {}
  }
  _recoverySession = null;
}
