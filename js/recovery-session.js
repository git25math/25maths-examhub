/* ══════════════════════════════════════════════════════════════
   recovery-session.js — Recovery Session orchestration
   Chains vocab → KP → PP refresh scans into a single session.
   Triggered from Today's Plan "Start Recovery" button.
   ══════════════════════════════════════════════════════════════ */

var _recoverySession = null;
var RECOVERY_ADVANCE_DELAY = 800;

/* Build a queue of stale item types to review */
function buildRecoverySession() {
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
  _recoverySession = {
    queue: queue,
    currentIndex: 0,
    results: [],
    startedAt: Date.now()
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

/* Called by finish hooks to advance to next scan type */
function _advanceRecoverySession(resultType) {
  if (!_recoverySession) return;
  if (resultType) {
    _recoverySession.results.push({ type: resultType, status: 'done' });
  }
  _recoverySession.currentIndex++;
  if (_recoverySession.currentIndex >= _recoverySession.queue.length) {
    _endRecoverySession();
  } else {
    setTimeout(function() { _runCurrentRecoveryItem(); }, RECOVERY_ADVANCE_DELAY);
  }
}

/* Finish session: navigate to plan + show summary toast */
function _endRecoverySession() {
  if (!_recoverySession) return;
  var results = _recoverySession.results;
  var duration = Math.round((Date.now() - _recoverySession.startedAt) / 1000);
  _recoverySession = null;

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
  if (typeof showToast === 'function') showToast(msg, 'success');
}

/* Check if a recovery session is currently active */
function isRecoverySessionActive() {
  return _recoverySession !== null;
}

/* Silently terminate recovery session (e.g. user navigated away) */
function skipRecoverySession() {
  _recoverySession = null;
}
