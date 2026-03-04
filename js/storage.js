/* ══════════════════════════════════════════════════════════════
   storage.js — localStorage CRUD + cloud sync (extended with SRS)
   ══════════════════════════════════════════════════════════════ */

/* Basic localStorage read/write */
function loadS() {
  try { return JSON.parse(localStorage.getItem(SK)) || {}; }
  catch (e) { return {}; }
}

function writeS(d) {
  try { localStorage.setItem(SK, JSON.stringify(d)); }
  catch (e) { /* quota exceeded */ }
}

/* Level best scores */
function getBest(i) {
  return (loadS()['l' + i]) || null;
}

function saveBest(i, t, m, c) {
  var s = loadS();
  var p = s['l' + i];
  if (!p || t < p.t) s['l' + i] = { t: t, m: m, c: c };
  if (!s.mc || i > s.mc) s.mc = i;
  writeS(s);
  syncToCloud();
}

function maxCleared() {
  var s = loadS();
  return s.mc != null ? s.mc : -1;
}

/* Slug-based word key: "L_{slug}_W{wordId}" */
function wordKey(li, wid) {
  var slug = LEVELS[li] && LEVELS[li].slug ? LEVELS[li].slug : ('L' + li);
  return 'L_' + slug + '_W' + wid;
}

/* Word mastery storage
   Each word key: "L_{slug}_W{wordId}"
   Value: { st, iv, nr, lr, ok, fail, lv }
   - st: "mastered"|"learning"|"new"
   - iv: interval in days
   - nr: next review timestamp
   - lr: last review timestamp
   - ok: correct count
   - fail: incorrect count
   - lv: SRS level 0-7 (Ebbinghaus)
*/
function getWordData() {
  return loadS().words || {};
}

function setWordStatus(key, status, interval, correct) {
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var next = now + (interval || 1) * 86400000;
  var prev = s.words[key] || {};
  var ok = prev.ok || 0;
  var fail = prev.fail || 0;
  var lv = prev.lv || 0;

  if (correct === true) {
    ok++;
    lv = Math.min(lv + 1, 7);
  } else if (correct === false) {
    fail++;
    lv = Math.max(lv - 2, 0);
  }
  /* correct === undefined -> no change (backward compatible) */

  s.words[key] = { st: status, iv: interval || 1, nr: next, lr: now, ok: ok, fail: fail, lv: lv };
  writeS(s);
  syncToCloud();
}

/* Get all words across all levels with their mastery status */
function getAllWords() {
  var all = [];
  var wd = getWordData();
  LEVELS.forEach(function(lv, li) {
    if (!isLevelVisible(lv)) return;
    var m = {};
    lv.vocabulary.forEach(function(v) {
      if (!m[v.id]) m[v.id] = {};
      m[v.id][v.type] = v.content;
    });
    for (var k in m) {
      var key = wordKey(li, k);
      var d = wd[key];
      all.push({
        key: key,
        word: m[k].word,
        def: m[k].def,
        level: li,
        status: d ? d.st : 'new',
        ok: d ? (d.ok || 0) : 0,
        fail: d ? (d.fail || 0) : 0,
        lv: d ? (d.lv || 0) : 0
      });
    }
  });
  return all;
}

/* Get words due for review */
function getDueWords() {
  var now = Date.now(), due = [];
  var wd = getWordData();
  getAllWords().forEach(function(w) {
    var d = wd[w.key];
    if (d && d.st !== 'mastered' && d.nr <= now) due.push(w);
    else if (!d || d.st === 'new') due.push(w);
  });
  return due;
}

function getReviewCount() {
  return getDueWords().length;
}

/* Custom levels persistence */
function getCustomLevels() {
  return loadS().customLevels || [];
}

function saveCustomLevel(level) {
  var s = loadS();
  if (!s.customLevels) s.customLevels = [];
  s.customLevels.push(level);
  writeS(s);
  syncToCloud();
}

/* Cloud sync */
var _lastSyncErrAt = 0;

async function syncToCloud() {
  if (!sb || !currentUser || currentUser.id === 'local') return;
  var now = new Date().toISOString();
  try {
    await sb.from('vocab_progress').upsert(
      { user_id: currentUser.id, data: JSON.stringify(loadS()), updated_at: now },
      { onConflict: 'user_id' }
    );
    try { localStorage.setItem('wmatch_last_sync', Date.now()); } catch (e) {}
  } catch (e) {
    var errNow = Date.now();
    if (!_lastSyncErrAt || errNow - _lastSyncErrAt > 5000) {
      _lastSyncErrAt = errNow;
      showToast(t('Sync failed, check network', '同步失败，请检查网络'));
    }
  }
  /* Sync leaderboard score */
  try {
    var allW = getAllWords();
    var mastered = allW.filter(function(w) { return w.status === 'mastered'; }).length;
    var pct = allW.length > 0 ? Math.round(mastered / allW.length * 100) : 0;
    var r = getRank();
    var nick = currentUser.nickname || currentUser.email.split('@')[0];
    await sb.from('leaderboard').upsert({
      user_id: currentUser.id,
      nickname: nick,
      score: pct * 20,
      mastery_pct: pct,
      rank_emoji: r.emoji,
      total_words: allW.length,
      mastered_words: mastered,
      board: userBoard || '',
      updated_at: now
    }, { onConflict: 'user_id' });
  } catch (e) {
    var errNow2 = Date.now();
    if (!_lastSyncErrAt || errNow2 - _lastSyncErrAt > 5000) {
      _lastSyncErrAt = errNow2;
      showToast(t('Sync failed, check network', '同步失败，请检查网络'));
    }
  }
}

async function syncFromCloud() {
  if (!sb || !currentUser || currentUser.id === 'local') return;
  try {
    var res = await sb.from('vocab_progress').select('data, updated_at').eq('user_id', currentUser.id).single();
    if (res.data && res.data.data) {
      var cloud = JSON.parse(res.data.data);
      var cloudTime = new Date(res.data.updated_at).getTime();
      var localTime = 0;
      try { localTime = parseInt(localStorage.getItem('wmatch_last_sync')) || 0; } catch (e) {}
      if (cloudTime > localTime) {
        writeS(cloud);
        try { localStorage.setItem('wmatch_last_sync', cloudTime); } catch (e) {}
      }
    }
  } catch (e) {
    var errNow = Date.now();
    if (!_lastSyncErrAt || errNow - _lastSyncErrAt > 5000) {
      _lastSyncErrAt = errNow;
      showToast(t('Sync failed, check network', '同步失败，请检查网络'));
    }
  }
}
