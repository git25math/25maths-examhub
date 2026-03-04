/* ══════════════════════════════════════════════════════════════
   storage.js — localStorage CRUD + cloud sync (extended with SRS)
   ══════════════════════════════════════════════════════════════ */

/* Basic localStorage read/write — with memory cache */
var _sCache = null;
var _cacheDirty = true;
var _allWordsCache = null;
var _wordDataCache = null;

function loadS() {
  if (_sCache) return _sCache;
  try { _sCache = JSON.parse(localStorage.getItem(SK)) || {}; }
  catch (e) { _sCache = {}; }
  return _sCache;
}

function writeS(d) {
  _sCache = d;
  _cacheDirty = true;
  _allWordsCache = null;
  _wordDataCache = null;
  try { localStorage.setItem(SK, JSON.stringify(d)); }
  catch (e) { /* quota exceeded */ }
}

function invalidateCache() {
  _sCache = null;
  _cacheDirty = true;
  _allWordsCache = null;
  _wordDataCache = null;
  if (typeof _quizCache !== 'undefined') _quizCache = null;
}

/* Level best scores */
function getBest(i) {
  return (loadS()['l' + i]) || null;
}

function saveBest(i, tm, m, c) {
  var s = loadS();
  var p = s['l' + i];
  if (!p || tm < p.t) s['l' + i] = { t: tm, m: m, c: c };
  if (!s.mc || i > s.mc) s.mc = i;
  writeS(s);
  recordDailyHistory(undefined);
  var _si = recordActivity();
  if (_si) showToast('🔥 ' + t(getStreakCount() + '-day streak!', '连续学习 ' + getStreakCount() + ' 天！'));
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
  if (_wordDataCache && !_cacheDirty) return _wordDataCache;
  _wordDataCache = loadS().words || {};
  return _wordDataCache;
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

  /* Inline recordDailyHistory */
  if (!s.history) s.history = [];
  var today = new Date().toLocaleDateString('en-CA');
  var entry = null;
  for (var i = s.history.length - 1; i >= 0; i--) {
    if (s.history[i].d === today) { entry = s.history[i]; break; }
  }
  if (!entry) {
    entry = { d: today, a: 0, ok: 0, fail: 0, m: 0 };
    s.history.push(entry);
  }
  entry.a++;
  if (correct === true) entry.ok++;
  else if (correct === false) entry.fail++;
  var wd = s.words || {};
  var mc = 0;
  for (var wk in wd) { if (wd[wk].st === 'mastered') mc++; }
  entry.m = mc;
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  /* Inline recordActivity */
  if (!s.streak) s.streak = { cur: 0, max: 0, last: '' };
  var last = s.streak.last;
  var newStreak = false;
  if (today !== last) {
    var td = new Date(today + 'T00:00:00');
    var ld = last ? new Date(last + 'T00:00:00') : null;
    var diff = ld ? Math.round((td - ld) / 86400000) : 999;
    s.streak.cur = (diff === 1) ? (s.streak.cur || 0) + 1 : 1;
    if (s.streak.cur > (s.streak.max || 0)) s.streak.max = s.streak.cur;
    s.streak.last = today;
    newStreak = true;
  }

  writeS(s);
  if (newStreak) showToast('🔥 ' + t(getStreakCount() + '-day streak!', '连续学习 ' + getStreakCount() + ' 天！'));
  debouncedSync();
}

/* Get all words across all levels with their mastery status */
function getAllWords() {
  if (_allWordsCache && !_cacheDirty) return _allWordsCache;
  var all = [];
  var wd = getWordData();
  LEVELS.forEach(function(lv, li) {
    if (!isLevelVisible(lv)) return;
    if (isGuestLocked(li)) return;
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
  _allWordsCache = all;
  _cacheDirty = false;
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

/* ═══ LEARNING STREAK ═══ */
function getStreak() {
  var s = loadS();
  if (!s.streak) return { cur: 0, max: 0, last: '' };
  return s.streak;
}

function getStreakCount() {
  return getStreak().cur || 0;
}

function recordActivity() {
  var s = loadS();
  if (!s.streak) s.streak = { cur: 0, max: 0, last: '' };
  var today = new Date().toLocaleDateString('en-CA');
  var last = s.streak.last;
  if (today === last) return false;
  var td = new Date(today + 'T00:00:00');
  var ld = last ? new Date(last + 'T00:00:00') : null;
  var diff = ld ? Math.round((td - ld) / 86400000) : 999;
  s.streak.cur = (diff === 1) ? (s.streak.cur || 0) + 1 : 1;
  if (s.streak.cur > (s.streak.max || 0)) s.streak.max = s.streak.cur;
  s.streak.last = today;
  writeS(s);
  return true;
}

/* Debounced sync — avoids hammering cloud during study sessions */
var _debounceSyncTimer = null;
function debouncedSync() {
  clearTimeout(_debounceSyncTimer);
  _debounceSyncTimer = setTimeout(function() { syncToCloud(); }, 2000);
}

/* Cloud sync */
var _lastSyncErrAt = 0;
var _syncStatus = 'idle';   /* 'idle' | 'syncing' | 'ok' | 'error' */
var _lastSyncOkAt = 0;
var _syncRetryCount = 0;

async function _doSyncToCloud() {
  if (!sb || !isLoggedIn()) return;
  var now = new Date().toISOString();
  await sb.from('vocab_progress').upsert(
    { user_id: currentUser.id, data: JSON.stringify(loadS()), updated_at: now },
    { onConflict: 'user_id' }
  );
  try { localStorage.setItem('wmatch_last_sync', Date.now()); } catch (e) {}
  /* Sync leaderboard score (skip for teachers) */
  if (!isTeacher()) {
    var allW = getAllWords();
    var mastered = allW.filter(function(w) { return w.status === 'mastered'; }).length;
    var pct = allW.length > 0 ? Math.round(mastered / allW.length * 100) : 0;
    var r = getRank();
    var nick = getDisplayName();
    /* Include school_id/class_id from user metadata if available */
    var lbRow = {
      user_id: currentUser.id,
      nickname: nick,
      score: pct * 20,
      mastery_pct: pct,
      rank_emoji: r.emoji,
      total_words: allW.length,
      mastered_words: mastered,
      board: userBoard || '',
      updated_at: now
    };
    try {
      var sess = await sb.auth.getSession();
      var meta = sess.data.session ? sess.data.session.user.user_metadata : {};
      if (meta.school_id) lbRow.school_id = meta.school_id;
      if (meta.class_id) lbRow.class_id = meta.class_id;
    } catch (e) {}
    await sb.from('leaderboard').upsert(lbRow, { onConflict: 'user_id' });
  }
}

async function syncToCloud() {
  if (!sb || !isLoggedIn()) return;
  _syncStatus = 'syncing';
  try {
    await _doSyncToCloud();
    _syncStatus = 'ok';
    _lastSyncOkAt = Date.now();
    _syncRetryCount = 0;
  } catch (e) {
    _syncStatus = 'error';
    var errNow = Date.now();
    if (!_lastSyncErrAt || errNow - _lastSyncErrAt > 5000) {
      _lastSyncErrAt = errNow;
    }
    /* Exponential backoff retry: 2s, 5s, 10s */
    var delays = [2000, 5000, 10000];
    if (_syncRetryCount < delays.length) {
      var delay = delays[_syncRetryCount];
      _syncRetryCount++;
      setTimeout(function() { syncToCloud(); }, delay);
    }
  }
}

async function syncFromCloud() {
  if (!sb || !isLoggedIn()) return;
  try {
    var res = await sb.from('vocab_progress').select('data, updated_at').eq('user_id', currentUser.id).single();
    if (res.data && res.data.data) {
      var cloud = JSON.parse(res.data.data);
      var cloudTime = new Date(res.data.updated_at).getTime();
      var localTime = 0;
      try { localTime = parseInt(localStorage.getItem('wmatch_last_sync')) || 0; } catch (e) {}
      if (cloudTime > localTime) {
        writeS(cloud);
        invalidateCache();
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

/* ═══ LEARNING HISTORY ═══ */
/* Each entry: { d: "2026-03-04", a: 12, ok: 9, fail: 3, m: 47 }
   d = date, a = activities, ok = correct, fail = incorrect, m = mastered total */

function getHistory() {
  return loadS().history || [];
}

function recordDailyHistory(correct) {
  var s = loadS();
  if (!s.history) s.history = [];
  var today = new Date().toLocaleDateString('en-CA');

  /* Find or create today's entry */
  var entry = null;
  for (var i = s.history.length - 1; i >= 0; i--) {
    if (s.history[i].d === today) { entry = s.history[i]; break; }
  }
  if (!entry) {
    entry = { d: today, a: 0, ok: 0, fail: 0, m: 0 };
    s.history.push(entry);
  }

  entry.a++;
  if (correct === true) entry.ok++;
  else if (correct === false) entry.fail++;

  /* Count current mastered words */
  var wd = s.words || {};
  var mc = 0;
  for (var k in wd) { if (wd[k].st === 'mastered') mc++; }
  entry.m = mc;

  /* Trim to 365 entries */
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  writeS(s);
}

/* ═══ DB VOCAB LEVELS ═══ */
async function loadDbVocabLevels() {
  if (!sb) return [];
  try {
    var res = await sb.from('vocab_levels')
      .select('*')
      .eq('is_deleted', false)
      .order('sort_order', { ascending: true });
    return res.data || [];
  } catch (e) {
    return [];
  }
}

function mergeVocabLevels(base, dbRows) {
  var slugMap = {};
  base.forEach(function(lv, i) { slugMap[lv.slug] = i; });

  var merged = base.slice();

  dbRows.forEach(function(row) {
    var lvObj = {
      slug: row.slug,
      board: row.board,
      category: row.category,
      title: row.title,
      titleZh: row.title_zh || '',
      timer: row.timer || 70,
      comboBonus: row.combo_bonus || 2,
      vocabulary: row.vocabulary || []
    };
    if (slugMap[row.slug] !== undefined) {
      /* Override existing */
      merged[slugMap[row.slug]] = lvObj;
    } else {
      /* Append new */
      merged.push(lvObj);
    }
  });

  /* Remove levels flagged as deleted in DB */
  return merged;
}

function bootstrapHistory() {
  var s = loadS();
  if (s.history && s.history.length > 0) return; /* already bootstrapped */
  var wd = s.words || {};
  var dayMap = {};

  /* Reconstruct from lr timestamps */
  for (var k in wd) {
    var w = wd[k];
    if (!w.lr) continue;
    var d = new Date(w.lr).toLocaleDateString('en-CA');
    if (!dayMap[d]) dayMap[d] = { d: d, a: 0, ok: 0, fail: 0, m: 0 };
    dayMap[d].a += (w.ok || 0) + (w.fail || 0);
    dayMap[d].ok += (w.ok || 0);
    dayMap[d].fail += (w.fail || 0);
  }

  /* Sort by date and calculate running mastered count */
  var dates = Object.keys(dayMap).sort();
  var history = [];
  for (var i = 0; i < dates.length; i++) {
    var entry = dayMap[dates[i]];
    /* Count mastered up to this date */
    var mc = 0;
    for (var wk in wd) {
      if (wd[wk].st === 'mastered' && wd[wk].lr && new Date(wd[wk].lr).toLocaleDateString('en-CA') <= dates[i]) mc++;
    }
    entry.m = mc;
    history.push(entry);
  }

  if (history.length > 0) {
    s.history = history;
    writeS(s);
  }
}
