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

/* ═══ STAR CALCULATION (Spec v1.0 §4) ═══ */
function computeStars(ok, fail) {
  var raw = Math.min(ok, 4);
  var attempts = ok + fail;
  var acc = attempts === 0 ? 1.0 : ok / attempts;
  var cap = acc < 0.5 ? 2 : acc < 0.6 ? 3 : 4;
  return Math.min(raw, cap);
}

/* SRS interval table (days) for levels 0-7 */
var SRS_INTERVALS = [0.014, 0.042, 0.375, 1, 2, 7, 30, 30];

/* ═══ UNIFIED ANSWER RECORDER (Spec v1.0 §2) ═══ */
function recordAnswer(key, mode, isCorrect) {
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var prev = s.words[key] || {};
  var ok = prev.ok || 0;
  var fail = prev.fail || 0;
  var lv = prev.lv || 0;

  /* 1. Update ok/fail per mode rules */
  if (mode === 'study-easy') {
    if (ok === 0) ok = 1;
  } else if (mode === 'study-hard') {
    fail += 1;
  } else if (mode === 'study-okay') {
    /* no-op: acknowledge only */
  } else if (isCorrect) {
    ok += (mode === 'spell' ? 2 : 1);
  } else {
    fail += 1;
  }

  /* 2. Recompute stars & status */
  var stars = computeStars(ok, fail);
  var st = stars === 0 ? 'new' : stars === 4 ? 'mastered' : 'learning';

  /* 3. SRS scheduling */
  if (isCorrect === true) {
    lv = Math.min(lv + 1, 7);
  } else if (isCorrect === false) {
    lv = Math.max(lv - 2, 0);
  }

  var iv;
  if (mode === 'review' && prev.iv) {
    /* Review mode: scale existing interval */
    if (isCorrect === false) {
      iv = 0.15;
    } else {
      iv = (isCorrect && mode === 'review')
        ? Math.max(prev.iv * (isCorrect && fail === 0 ? 2.5 : 1.2), 1)
        : SRS_INTERVALS[lv] || 1;
    }
  } else {
    iv = SRS_INTERVALS[lv] || 1;
  }
  var nr = now + iv * 86400000;

  /* Bump weekly goal when word first reaches 'learning' or 'mastered' */
  var _prevSt = prev.st || 'new';
  if (_prevSt === 'new' && st !== 'new') {
    if (typeof bumpWeeklyGoal === 'function') bumpWeeklyGoal(1);
  }

  s.words[key] = { st: st, iv: iv, nr: nr, lr: now, ok: ok, fail: fail, lv: lv, stars: stars };

  /* 4. Inline daily history */
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
  if (isCorrect === true) entry.ok++;
  else if (isCorrect === false) entry.fail++;
  var wd = s.words || {};
  var mc = 0;
  for (var wk in wd) { if (wd[wk].st === 'mastered') mc++; }
  entry.m = mc;
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  /* 5. Inline streak */
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
  /* Debounced badge check (avoid checking every single answer) */
  clearTimeout(_badgeCheckTimer);
  _badgeCheckTimer = setTimeout(function() { if (typeof checkBadges === 'function') checkBadges(); }, 3000);
  debouncedSync();
}

var _badgeCheckTimer = null;

/* Word mastery storage
   Each word key: "L_{slug}_W{wordId}"
   Value: { st, iv, nr, lr, ok, fail, lv, stars }
   - st: "mastered"|"learning"|"new"
   - iv: interval in days
   - nr: next review timestamp
   - lr: last review timestamp
   - ok: correct count
   - fail: incorrect count
   - lv: SRS level 0-7 (Ebbinghaus)
   - stars: 0-4 (cached, or computed from ok/fail)
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
      var wOk = d ? (d.ok || 0) : 0;
      var wFail = d ? (d.fail || 0) : 0;
      var wStars = d && d.stars != null ? d.stars : computeStars(wOk, wFail);
      all.push({
        key: key,
        word: m[k].word,
        def: m[k].def,
        level: li,
        status: wStars === 0 ? 'new' : wStars === 4 ? 'mastered' : 'learning',
        stars: wStars,
        ok: wOk,
        fail: wFail,
        lv: d ? (d.lv || 0) : 0
      });
    }
  });
  _allWordsCache = all;
  _cacheDirty = false;
  return all;
}

/* Get words due for review — uses star-derived status, not stored st */
function getDueWords() {
  var now = Date.now(), due = [];
  var wd = getWordData();
  getAllWords().forEach(function(w) {
    var d = wd[w.key];
    if (d && w.status !== 'mastered' && d.nr <= now) due.push(w);
    else if (!d || w.status === 'new') due.push(w);
  });
  return due;
}

function getReviewCount() {
  return getDueWords().length;
}

/* Count only studied words that are due (exclude new/unseen words) */
function getStudiedDueCount() {
  var now = Date.now(), count = 0;
  var wd = getWordData();
  getAllWords().forEach(function(w) {
    var d = wd[w.key];
    if (d && w.status !== 'new' && w.status !== 'mastered' && d.nr <= now) count++;
  });
  return count;
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
var _syncInProgress = false;

async function _doSyncToCloud() {
  if (!sb || !isLoggedIn()) return;
  var now = new Date().toISOString();
  var vpRes = await sb.from('vocab_progress').upsert(
    { user_id: currentUser.id, data: JSON.stringify(loadS()), updated_at: now },
    { onConflict: 'user_id' }
  );
  if (vpRes.error) return;
  try { localStorage.setItem('wmatch_last_sync', Date.now()); } catch (e) {}
  /* Sync leaderboard score (skip for teachers) */
  if (!isTeacher()) {
    var allW = getAllWords();
    var totalStars = 0, masteredW = 0;
    allW.forEach(function(w) {
      totalStars += w.stars || 0;
      if ((w.stars || 0) === 4) masteredW++;
    });
    var learningPct = allW.length > 0 ? Math.round(totalStars / (allW.length * 4) * 100) : 0;
    var masteryPct = allW.length > 0 ? Math.round(masteredW / allW.length * 100) : 0;
    var r = getRank();
    var nick = getDisplayName();
    /* Include school_id/class_id from user metadata if available */
    var lbRow = {
      user_id: currentUser.id,
      nickname: nick,
      score: learningPct * 20,
      mastery_pct: masteryPct,
      rank_emoji: r.emoji,
      total_words: allW.length,
      mastered_words: masteredW,
      board: userBoard || '',
      updated_at: now
    };
    try {
      var sess = await sb.auth.getSession();
      var meta = sess.data.session ? sess.data.session.user.user_metadata : {};
      if (meta.school_id) lbRow.school_id = meta.school_id;
      if (meta.class_id) lbRow.class_id = meta.class_id;
    } catch (e) {}
    var lbRes = await sb.from('leaderboard').upsert(lbRow, { onConflict: 'user_id' });
    if (lbRes.error) return;
  }
}

async function syncToCloud() {
  if (!sb || !isLoggedIn()) return;
  if (_syncInProgress) return;
  _syncInProgress = true;
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
  } finally {
    _syncInProgress = false;
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

/* ═══ MODE COMPLETION TRACKING ═══ */
function markModeDone(li, mode) {
  var s = loadS();
  if (!s.modeDone) s.modeDone = {};
  var slug = LEVELS[li] ? LEVELS[li].slug : ('L' + li);
  s.modeDone[slug + ':' + mode] = true;
  writeS(s);
}

function isModeDone(li, mode) {
  var s = loadS();
  if (!s.modeDone) return false;
  var slug = LEVELS[li] ? LEVELS[li].slug : ('L' + li);
  return !!s.modeDone[slug + ':' + mode];
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

/* ═══ ACHIEVEMENT BADGES ═══ */
var BADGES = [
  { id: 'first_word',    icon: '\ud83c\udf1f', en: 'First Word',      zh: '\u7b2c\u4e00\u4e2a\u8bcd', check: function(ctx) { return ctx.mastered >= 1; } },
  { id: 'ten_words',     icon: '\ud83d\udcda', en: 'Ten Down',         zh: '\u5341\u4e2a\u8bcd\u4e86', check: function(ctx) { return ctx.mastered >= 10; } },
  { id: 'hundred_club',  icon: '\ud83c\udfc5', en: 'Hundred Club',     zh: '\u767e\u8bcd\u4ff1\u4e50\u90e8', check: function(ctx) { return ctx.mastered >= 100; } },
  { id: 'streak_3',      icon: '\ud83d\udd25', en: '3-Day Streak',     zh: '\u8fde\u7eed3\u5929',  check: function(ctx) { return ctx.streak >= 3; } },
  { id: 'streak_7',      icon: '\ud83d\udcaa', en: 'Week Warrior',     zh: '\u4e00\u5468\u6218\u58eb', check: function(ctx) { return ctx.streak >= 7; } },
  { id: 'streak_30',     icon: '\ud83d\udc8e', en: 'Monthly Master',   zh: '\u6708\u5ea6\u5927\u5e08', check: function(ctx) { return ctx.streak >= 30; } },
  { id: 'daily_5',       icon: '\u26a1',       en: 'Daily 5',          zh: '\u6bcf\u65e5\u63505\u6b21', check: function(ctx) { return ctx.dailyCount >= 5; } },
  { id: 'quiz_perfect',  icon: '\ud83c\udfc6', en: 'Perfectionist',    zh: '\u5b8c\u7f8e\u4e3b\u4e49', check: function(ctx) { return ctx.perfectQuiz; } },
  { id: 'first_section', icon: '\u2705',       en: 'First Section',    zh: '\u7b2c\u4e00\u4e2a\u77e5\u8bc6\u70b9', check: function(ctx) { return ctx.sectionsCleared >= 1; } },
  { id: 'srs_master',    icon: '\ud83e\udde0', en: 'Memory Master',    zh: '\u8bb0\u5fc6\u5927\u5e08', check: function(ctx) { return ctx.srsMaxCount >= 50; } },
  { id: 'five_hundred',  icon: '\ud83d\ude80', en: '500 Words',        zh: '500\u8bcd\u8fbe\u6210', check: function(ctx) { return ctx.mastered >= 500; } },
  { id: 'all_modes',     icon: '\ud83c\udf08', en: 'Explorer',         zh: '\u63a2\u7d22\u8005',  check: function(ctx) { return ctx.modesUsed >= 5; } }
];

function getUnlockedBadges() {
  try { return JSON.parse(localStorage.getItem('wmatch_badges') || '[]'); } catch(e) { return []; }
}

function _saveBadges(arr) {
  try { localStorage.setItem('wmatch_badges', JSON.stringify(arr)); } catch(e) {}
}

var _lastBadgeCheckAt = 0;
function checkBadges() {
  var now = Date.now();
  if (now - _lastBadgeCheckAt < 10000) return getUnlockedBadges();
  _lastBadgeCheckAt = now;
  var unlocked = getUnlockedBadges();
  var gs = typeof getGlobalStats === 'function' ? getGlobalStats() : { mastered: 0 };
  var streak = getStreakCount();
  var s = loadS();

  /* Count daily challenges completed */
  var dailyCount = 0;
  if (s.history) {
    s.history.forEach(function(h) { if (h.m && h.m.daily) dailyCount++; });
  }
  /* Check for perfect quiz (any session with 100%) */
  var perfectQuiz = false;
  if (s.history) {
    s.history.forEach(function(h) {
      if (h.m && h.m.quiz && h.score === h.total && h.total > 0) perfectQuiz = true;
    });
  }
  /* Count sections cleared (mastered milestone) */
  var sectionsCleared = 0;
  try {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('wmatch_milestone_') === 0) {
        var v = localStorage.getItem(keys[i]);
        if (v === 'mastered') sectionsCleared++;
      }
    }
  } catch(e) {}
  /* Count SRS level 7 words */
  var srsMaxCount = 0;
  if (s.words) {
    for (var k in s.words) {
      if (s.words[k].lv >= 7) srsMaxCount++;
    }
  }
  /* Count distinct modes used */
  var modesUsed = 0;
  if (s.modeDone) {
    var modeSet = {};
    for (var mk in s.modeDone) {
      var parts = mk.split(':');
      if (parts.length === 2) modeSet[parts[1]] = true;
    }
    modesUsed = Object.keys(modeSet).length;
  }

  var ctx = {
    mastered: gs.mastered, streak: streak, dailyCount: dailyCount,
    perfectQuiz: perfectQuiz, sectionsCleared: sectionsCleared,
    srsMaxCount: srsMaxCount, modesUsed: modesUsed
  };

  var newlyUnlocked = [];
  BADGES.forEach(function(b) {
    if (unlocked.indexOf(b.id) >= 0) return;
    if (b.check(ctx)) {
      unlocked.push(b.id);
      newlyUnlocked.push(b);
    }
  });

  if (newlyUnlocked.length > 0) {
    _saveBadges(unlocked);
    newlyUnlocked.forEach(function(b) {
      if (typeof showToast === 'function') {
        showToast(b.icon + ' ' + t(b.en, b.zh) + ' ' + t('unlocked!', '\u89e3\u9501\uff01'));
      }
    });
  }
  return unlocked;
}

/* ═══ WEEKLY GOAL ═══ */
function getWeeklyGoal() {
  var now = new Date();
  /* Week starts Monday */
  var day = now.getDay();
  var diff = day === 0 ? 6 : day - 1;
  var monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  var weekKey = monday.toLocaleDateString('en-CA');

  var stored = {};
  try { stored = JSON.parse(localStorage.getItem('wmatch_weekly') || '{}'); } catch(e) {}

  if (stored.week !== weekKey) {
    stored = { week: weekKey, learned: 0, target: stored.target || 35 };
    try { localStorage.setItem('wmatch_weekly', JSON.stringify(stored)); } catch(e) {}
  }
  return stored;
}

function bumpWeeklyGoal(count) {
  var wg = getWeeklyGoal();
  wg.learned = (wg.learned || 0) + (count || 1);
  try { localStorage.setItem('wmatch_weekly', JSON.stringify(wg)); } catch(e) {}
  return wg;
}
