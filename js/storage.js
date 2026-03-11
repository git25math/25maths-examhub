/* ══════════════════════════════════════════════════════════════
   storage.js — localStorage CRUD + cloud sync (FLM system)
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
  /* One-time SRS→FLM migration */
  _migrateSRStoFLM(_sCache);
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
  _staleCacheData = null;
  _staleKPCache = null;
  if (typeof _stalePPCacheData !== 'undefined') _stalePPCacheData = null;
  if (typeof _quizCache !== 'undefined') _quizCache = null;
  if (typeof _catLevelIndex !== 'undefined') _catLevelIndex = null;
  if (typeof _hhkSlugIdx !== 'undefined') _hhkSlugIdx = null;
  if (typeof _sttIndex !== 'undefined') _sttIndex = null;
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
  if (_si) showToast('\ud83d\udd25 ' + t(getStreakCount() + '-day streak!', '\u8fde\u7eed\u5b66\u4e60 ' + getStreakCount() + ' \u5929\uff01'));
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

/* ═══ STAR CALCULATION (legacy, kept for backward compat) ═══ */
function computeStars(ok, fail) {
  var raw = Math.min(ok, 4);
  var attempts = ok + fail;
  var acc = attempts === 0 ? 1.0 : ok / attempts;
  var cap = acc < 0.5 ? 2 : acc < 0.6 ? 3 : 4;
  return Math.min(raw, cap);
}

/* ═══ FLM MIGRATION (one-time, SRS→FLM) ═══ */
var _flmMigrated = false;
function _migrateSRStoFLM(s) {
  if (_flmMigrated) return;
  if (!s.words) return;
  /* Check if any word has lv but no fs — needs migration */
  var needsMigration = false;
  for (var k in s.words) {
    var w = s.words[k];
    if (w.lv != null && w.fs == null) { needsMigration = true; break; }
  }
  if (!needsMigration) { _flmMigrated = true; return; }

  for (var wk in s.words) {
    var wd = s.words[wk];
    if (wd.fs != null) continue; /* already migrated */
    var ok = wd.ok || 0;
    var fail = wd.fail || 0;
    var lv = wd.lv || 0;
    var stars = wd.stars != null ? wd.stars : computeStars(ok, fail);

    if (stars >= 4 || lv >= 6) {
      wd.fs = 'mastered';
      wd.fmt = wd.lr || Date.now();
    } else if (lv >= 3 && ok > 0) {
      wd.fs = 'uncertain';
    } else if (ok > 0) {
      wd.fs = 'learning';
    } else {
      wd.fs = 'new';
    }
    wd.cs = 0;
    wd.fr = 0;
    wd.src = '';
  }
  _flmMigrated = true;
  /* Write back migrated data */
  try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {}
}

/* ═══ FLM UNIFIED ANSWER RECORDER ═══ */
function recordAnswer(key, mode, isCorrect) {
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var prev = s.words[key] || {};
  var ok = prev.ok || 0;
  var fail = prev.fail || 0;
  var fs = prev.fs || 'new';
  var cs = prev.cs || 0;

  /* 1. Update ok/fail — scan modes handled by recordScan() */
  if (mode === 'study-easy' || mode === 'study-okay' || mode === 'study-hard') {
    /* Study mode no longer updates ok/fail (handled by scan) */
  } else if (isCorrect) {
    ok += (mode === 'spell' ? 2 : 1);
  } else {
    fail += 1;
  }

  /* 2. FLM state transitions (game modes: quiz/spell/match/battle) */
  if (mode !== 'study-easy' && mode !== 'study-okay' && mode !== 'study-hard') {
    if (isCorrect) {
      cs += 1;
      if (cs >= 2) {
        fs = 'mastered';
        prev.fmt = now;
        cs = 0;
      } else if (fs === 'learning') {
        fs = 'uncertain';
      }
    } else if (isCorrect === false) {
      cs = 0;
      if (fs === 'mastered') {
        fs = 'uncertain';
      } else if (fs === 'uncertain') {
        fs = 'learning';
      }
    }
  }

  /* Bump weekly goal when word first leaves 'new' */
  var _prevFs = prev.fs || 'new';
  if (_prevFs === 'new' && fs !== 'new') {
    if (typeof bumpWeeklyGoal === 'function') bumpWeeklyGoal(1);
  }

  /* Derive legacy st from fs for backward compat */
  var st = fs === 'mastered' ? 'mastered' : fs === 'new' ? 'new' : 'learning';

  s.words[key] = {
    st: st, lr: now, ok: ok, fail: fail,
    fs: fs, cs: cs, fr: prev.fr || 0, fmt: prev.fmt || null, src: prev.src || '',
    rc: prev.rc || 0,
    /* Keep legacy fields for compat but stop updating SRS */
    lv: prev.lv || 0, iv: prev.iv || 0, nr: prev.nr || 0,
    stars: prev.stars != null ? prev.stars : computeStars(ok, fail)
  };

  /* 3. Inline daily history */
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
  var wds = s.words || {};
  var mc = 0;
  for (var wk in wds) { if (wds[wk].fs === 'mastered') mc++; }
  entry.m = mc;
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  /* 4. Inline streak */
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
  if (newStreak) showToast('\ud83d\udd25 ' + t(getStreakCount() + '-day streak!', '\u8fde\u7eed\u5b66\u4e60 ' + getStreakCount() + ' \u5929\uff01'));
  clearTimeout(_badgeCheckTimer);
  _badgeCheckTimer = setTimeout(function() { if (typeof checkBadges === 'function') checkBadges(); }, 3000);
  debouncedSync();
}

var _badgeCheckTimer = null;

/* ═══ FLM SCAN RECORDER (used by Scan/Study mode) ═══ */
function recordScan(key, verdict, round) {
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var prev = s.words[key] || {};
  var ok = prev.ok || 0;
  var fail = prev.fail || 0;
  var fs = prev.fs || 'new';
  var _prevFsForReforget = fs;

  if (verdict === 'known') {
    fs = 'mastered';
    prev.fmt = now;
  } else if (verdict === 'fuzzy') {
    fs = 'uncertain';
    prev.fr = round || 1;
  } else if (verdict === 'unknown') {
    fs = 'learning';
    prev.fr = round || 1;
    fail += 1;
  }

  /* Re-forget tracking: mastered demoted */
  if (_prevFsForReforget === 'mastered' && fs !== 'mastered') {
    var _rfSlug = key.replace(/^L_/, '').replace(/_W\d+$/, '');
    var _rfBoard = '';
    for (var _rfi = 0; _rfi < LEVELS.length; _rfi++) { if (LEVELS[_rfi].slug === _rfSlug) { _rfBoard = LEVELS[_rfi].board || ''; break; } }
    _logReforget(key, 'vocab', 'mastered', fs, _rfSlug, _rfBoard);
  }

  /* Bump weekly goal when word first leaves 'new' */
  var _prevFs = prev.fs || 'new';
  if (_prevFs === 'new' && fs !== 'new') {
    if (typeof bumpWeeklyGoal === 'function') bumpWeeklyGoal(1);
  }

  var st = fs === 'mastered' ? 'mastered' : fs === 'new' ? 'new' : 'learning';
  s.words[key] = {
    st: st, lr: now, ok: ok, fail: fail,
    fs: fs, cs: 0, fr: prev.fr || 0, fmt: prev.fmt || null, src: prev.src || 'scan',
    rc: prev.rc || 0,
    lv: prev.lv || 0, iv: prev.iv || 0, nr: prev.nr || 0,
    stars: prev.stars != null ? prev.stars : computeStars(ok, fail)
  };

  /* Inline daily history */
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
  if (verdict === 'unknown') entry.fail++;
  var wds = s.words || {};
  var mc = 0;
  for (var wk in wds) { if (wds[wk].fs === 'mastered') mc++; }
  entry.m = mc;
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  /* Inline streak */
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
  if (newStreak) showToast('\ud83d\udd25 ' + t(getStreakCount() + '-day streak!', '\u8fde\u7eed\u5b66\u4e60 ' + getStreakCount() + ' \u5929\uff01'));
  clearTimeout(_badgeCheckTimer);
  _badgeCheckTimer = setTimeout(function() { if (typeof checkBadges === 'function') checkBadges(); }, 3000);
  debouncedSync();
}

/* Word mastery storage (FLM)
   Each word key: "L_{slug}_W{wordId}"
   Value: { st, lr, ok, fail, fs, cs, fr, fmt, src, lv, iv, nr, stars }
   - fs: FLM status 'new'|'learning'|'uncertain'|'mastered'
   - cs: consecutive correct count
   - fr: last round marked non-mastered (0=unseen)
   - fmt: mastered timestamp
   - src: source 'scan'|'reflow'|''
   Legacy: st, lv, iv, nr, stars (kept for compat)
*/
function getWordData() {
  if (_wordDataCache && !_cacheDirty) return _wordDataCache;
  _wordDataCache = loadS().words || {};
  return _wordDataCache;
}

/* Get FLM status for a word */
function getWordFLM(key) {
  var wd = getWordData();
  var d = wd[key];
  return d ? (d.fs || 'new') : 'new';
}

/* Get pool words for a level (learning + uncertain = active pool) */
function getPoolWords(li) {
  var lv = LEVELS[li];
  if (!lv) return [];
  var pairs = getPairs(lv.vocabulary);
  var wd = getWordData();
  return pairs.filter(function(p) {
    var d = wd[wordKey(li, p.lid)];
    if (!d || !d.fs || d.fs === 'new') return false;
    return d.fs === 'learning' || d.fs === 'uncertain';
  });
}

/* Chapter round tracking */
function getChapterRound(secId, board) {
  var s = loadS();
  if (!s.chapters) return { round: 0, lastRoundAt: 0 };
  var key = (board || '') + ':' + secId;
  return s.chapters[key] || { round: 0, lastRoundAt: 0 };
}

function setChapterRound(secId, board, round) {
  var s = loadS();
  if (!s.chapters) s.chapters = {};
  var key = (board || '') + ':' + secId;
  s.chapters[key] = { round: round, lastRoundAt: Date.now() };
  writeS(s);
}

/* Legacy setWordStatus — redirect to FLM */
function setWordStatus(key, status, interval, correct) {
  if (correct === true) {
    recordAnswer(key, 'legacy', true);
  } else if (correct === false) {
    recordAnswer(key, 'legacy', false);
  } else {
    recordAnswer(key, 'legacy', null);
  }
}

/* Get all words across all levels with FLM status */
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
      var fs = d ? (d.fs || 'new') : 'new';
      /* Map FLM status to legacy 3-state for backward compat */
      var status = fs === 'mastered' ? 'mastered' : fs === 'new' ? 'new' : 'learning';
      all.push({
        key: key,
        word: m[k].word,
        def: m[k].def,
        level: li,
        status: status,
        fs: fs,
        stars: d && d.stars != null ? d.stars : computeStars(wOk, wFail),
        ok: wOk,
        fail: wFail,
        lv: d ? (d.lv || 0) : 0,
        cs: d ? (d.cs || 0) : 0,
        fr: d ? (d.fr || 0) : 0,
        src: d ? (d.src || '') : '',
        rc: d ? (d.rc || 0) : 0,
        fmt: d ? (d.fmt || null) : null,
        lr: d ? (d.lr || null) : null
      });
    }
  });
  _allWordsCache = all;
  _cacheDirty = false;
  return all;
}

/* ═══ MASTERED DECAY — REFRESH SCAN ═══ */

/* Get stale mastered words (exceeded refresh interval) — 30s TTL cache */
var _staleCacheData = null;
var _staleCacheTime = 0;
var STALE_CACHE_TTL = 30000;

function getStaleWords() {
  var now = Date.now();
  if (_staleCacheData && !_cacheDirty && (now - _staleCacheTime) < STALE_CACHE_TTL) {
    return _staleCacheData;
  }
  var all = getAllWords();
  var stale = [];
  for (var i = 0; i < all.length; i++) {
    var w = all[i];
    if (w.fs !== 'mastered') continue;
    if (!w.fmt) continue;
    var rc = w.rc || 0;
    var threshold = REFRESH_INTERVALS[Math.min(rc, REFRESH_INTERVALS.length - 1)];
    var daysSince = (now - w.fmt) / 86400000;
    if (daysSince >= threshold) {
      stale.push({ key: w.key, word: w.word, def: w.def, level: w.level,
                   lid: w.key.split('_W')[1], rc: rc, daysSince: Math.floor(daysSince) });
    }
  }
  stale.sort(function(a, b) { return b.daysSince - a.daysSince; });
  _staleCacheData = stale;
  _staleCacheTime = now;
  return stale;
}

function getStaleCount() { return getStaleWords().length; }

/* Refresh Scan recorder — handles mastered decay review */
function recordRefreshScan(key, verdict) {
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var prev = s.words[key] || {};
  var rc = prev.rc || 0;
  var fs = prev.fs || 'mastered';
  var _prevFsRefresh = fs;
  var ok = prev.ok || 0;
  var fail = prev.fail || 0;

  if (verdict === 'known') {
    rc = Math.min((rc || 0) + 1, MAX_RC);
    prev.fmt = now;
    /* stays mastered */
  } else if (verdict === 'fuzzy') {
    fs = 'uncertain';
    prev.src = 'reflow';
    prev.cs = 0;
  } else if (verdict === 'unknown') {
    fs = 'learning';
    fail += 1;
    prev.src = 'reflow';
    prev.cs = 0;
  }

  /* Re-forget tracking */
  if (_prevFsRefresh === 'mastered' && fs !== 'mastered') {
    var _rfSlug2 = key.replace(/^L_/, '').replace(/_W\d+$/, '');
    var _rfBoard2 = '';
    for (var _rfi2 = 0; _rfi2 < LEVELS.length; _rfi2++) { if (LEVELS[_rfi2].slug === _rfSlug2) { _rfBoard2 = LEVELS[_rfi2].board || ''; break; } }
    _logReforget(key, 'vocab', 'mastered', fs, _rfSlug2, _rfBoard2);
  }

  var st = fs === 'mastered' ? 'mastered' : fs === 'new' ? 'new' : 'learning';
  s.words[key] = {
    st: st, lr: now, ok: ok, fail: fail,
    fs: fs, cs: prev.cs || 0, fr: prev.fr || 0, fmt: prev.fmt || null,
    src: prev.src || '', rc: rc,
    lv: prev.lv || 0, iv: prev.iv || 0, nr: prev.nr || 0,
    stars: prev.stars != null ? prev.stars : computeStars(ok, fail)
  };

  /* Daily history */
  if (!s.history) s.history = [];
  var today = new Date().toLocaleDateString('en-CA');
  var entry = null;
  for (var hi = s.history.length - 1; hi >= 0; hi--) {
    if (s.history[hi].d === today) { entry = s.history[hi]; break; }
  }
  if (!entry) {
    entry = { d: today, a: 0, ok: 0, fail: 0, m: 0 };
    s.history.push(entry);
  }
  entry.a++;
  if (verdict === 'unknown') entry.fail++;
  var _wds = s.words || {};
  var _mc = 0;
  for (var _wk in _wds) { if (_wds[_wk].fs === 'mastered') _mc++; }
  entry.m = _mc;
  if (s.history.length > 365) {
    s.history = s.history.slice(s.history.length - 365);
  }

  /* Streak */
  if (!s.streak) s.streak = { cur: 0, max: 0, last: '' };
  var _last = s.streak.last;
  var _newStreak = false;
  if (today !== _last) {
    var _td = new Date(today + 'T00:00:00');
    var _ld = _last ? new Date(_last + 'T00:00:00') : null;
    var _diff = _ld ? Math.round((_td - _ld) / 86400000) : 999;
    s.streak.cur = (_diff === 1) ? (s.streak.cur || 0) + 1 : 1;
    if (s.streak.cur > (s.streak.max || 0)) s.streak.max = s.streak.cur;
    s.streak.last = today;
    _newStreak = true;
  }

  _staleCacheData = null;
  _cacheDirty = true;
  writeS(s);
  if (_newStreak) showToast('\ud83d\udd25 ' + t(getStreakCount() + '-day streak!', '\u8fde\u7eed\u5b66\u4e60 ' + getStreakCount() + ' \u5929\uff01'));
  clearTimeout(_badgeCheckTimer);
  _badgeCheckTimer = setTimeout(function() { if (typeof checkBadges === 'function') checkBadges(); }, 3000);
  debouncedSync();
}

/* Mistake reflow — demote mastered words in a section when practice error occurs */
function reflowVocabForSection(sectionId, board) {
  if (typeof getSectionLevelIdx !== 'function') return 0;
  var li = getSectionLevelIdx(sectionId, board);
  if (li < 0 || !LEVELS[li]) return 0;
  var lv = LEVELS[li];
  var s = loadS();
  if (!s.words) s.words = {};
  var now = Date.now();
  var count = 0;
  var THREE_DAYS = 3 * 86400000;

  var m = {};
  lv.vocabulary.forEach(function(v) { if (!m[v.id]) m[v.id] = true; });
  for (var kid in m) {
    var key = wordKey(li, kid);
    var d = s.words[key];
    if (!d || d.fs !== 'mastered') continue;
    if (d.fmt && (now - d.fmt) < THREE_DAYS) continue;
    d.fs = 'uncertain';
    d.st = 'learning';
    d.src = 'reflow';
    d.cs = 0;
    d.lr = now;
    count++;
  }
  if (count > 0) {
    _cacheDirty = true;
    writeS(s);
    debouncedSync();
  }
  return count;
}

/* Legacy getDueWords — returns pool words (learning + uncertain) */
function getDueWords() {
  return getAllWords().filter(function(w) {
    return w.fs === 'learning' || w.fs === 'uncertain';
  });
}

function getReviewCount() {
  return getDueWords().length;
}

/* Legacy getStudiedDueCount — returns pool count */
function getStudiedDueCount() {
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
var _syncInProgress = false;

async function _doSyncToCloud() {
  if (!sb || !isLoggedIn()) return;
  var now = new Date().toISOString();
  var payload = loadS();
  /* Transitional sync bridge for PP mastery.
     PP uses separate localStorage key ('pp_mastery').
     Embed here for cross-device sync. Must be extracted before writeS() on restore.
     TODO v3.2+: consider migrating PP into unified unit storage. */
  try {
    var ppRaw = localStorage.getItem('pp_mastery');
    if (ppRaw) payload._ppMastery = JSON.parse(ppRaw);
  } catch(e) {}
  /* Bridge pp_wrong_book for cross-device sync */
  try {
    var wbRaw = localStorage.getItem('pp_wrong_book');
    if (wbRaw) payload._ppWrongBook = JSON.parse(wbRaw);
  } catch(e) {}
  /* Bridge reforget log for cross-device sync */
  try {
    var rfRaw = localStorage.getItem(_REFORGET_KEY);
    if (rfRaw) payload._reforgetLog = JSON.parse(rfRaw);
  } catch(e) {}
  /* Bridge custom lists for cross-device sync */
  try {
    var clRaw = localStorage.getItem(_CUSTOM_LISTS_KEY);
    if (clRaw) payload._customLists = JSON.parse(clRaw);
  } catch(e) {}
  var vpRes = await sb.from('vocab_progress').upsert(
    { user_id: currentUser.id, data: JSON.stringify(payload), updated_at: now },
    { onConflict: 'user_id' }
  );
  if (vpRes.error) return;
  try { localStorage.setItem('wmatch_last_sync', Date.now()); } catch (e) {}
  /* Sync leaderboard score (skip for teachers) */
  if (!isTeacher()) {
    var allW = getAllWords();
    var masteredW = 0;
    allW.forEach(function(w) { if (w.fs === 'mastered') masteredW++; });
    var masteryPct = allW.length > 0 ? Math.round(masteredW / allW.length * 100) : 0;
    var r = getRank();
    var nick = getDisplayName();
    var lbRow = {
      user_id: currentUser.id,
      nickname: nick,
      score: masteryPct * 20,
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
  /* Clear unsynced residual data from previous user (crash-safe) */
  var _unsyncedKeys = ['pp_wrong_book', 'pp_exam_history', 'pp_paper_results',
    'diag_history', 'wmatch_badges', 'wmatch_weekly',
    'recovery_schedule', 'student_profile', 'reforget_log', 'custom_lists'];
  _unsyncedKeys.forEach(function(k) {
    try { localStorage.removeItem(k); } catch(e) {}
  });
  try {
    var res = await sb.from('vocab_progress').select('data, updated_at').eq('user_id', currentUser.id).single();
    if (res.data && res.data.data) {
      var cloud = JSON.parse(res.data.data);
      var cloudTime = new Date(res.data.updated_at).getTime();
      var localTime = 0;
      try { localTime = parseInt(localStorage.getItem('wmatch_last_sync')) || 0; } catch (e) {}
      if (cloudTime > localTime) {
        /* Restore PP mastery from transitional bridge field */
        if (cloud && typeof cloud === 'object' && cloud._ppMastery && typeof cloud._ppMastery === 'object') {
          try { localStorage.setItem('pp_mastery', JSON.stringify(cloud._ppMastery)); } catch(e) {}
        }
        delete cloud._ppMastery;
        /* Restore wrong book from cloud bridge */
        if (cloud && typeof cloud === 'object' && cloud._ppWrongBook && typeof cloud._ppWrongBook === 'object') {
          try { localStorage.setItem('pp_wrong_book', JSON.stringify(cloud._ppWrongBook)); } catch(e) {}
        }
        delete cloud._ppWrongBook;
        /* Restore reforget log from cloud bridge */
        if (cloud && typeof cloud === 'object' && cloud._reforgetLog && Array.isArray(cloud._reforgetLog)) {
          try { localStorage.setItem(_REFORGET_KEY, JSON.stringify(cloud._reforgetLog)); } catch(e) {}
        }
        delete cloud._reforgetLog;
        /* Restore custom lists from cloud bridge */
        if (cloud && typeof cloud === 'object' && cloud._customLists && typeof cloud._customLists === 'object') {
          try { localStorage.setItem(_CUSTOM_LISTS_KEY, JSON.stringify(cloud._customLists)); } catch(e) {}
        }
        delete cloud._customLists;
        writeS(cloud);
        invalidateCache();
        try { localStorage.setItem('wmatch_last_sync', cloudTime); } catch (e) {}
      }
    }
  } catch (e) {
    var errNow = Date.now();
    if (!_lastSyncErrAt || errNow - _lastSyncErrAt > 5000) {
      _lastSyncErrAt = errNow;
      showToast(t('Sync failed, check network', '\u540c\u6b65\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc'));
    }
  }
}

/* ═══ LEARNING GOALS PERSISTENCE (v3.9.0) ═══ */
function getLearningGoalsState() {
  var s = loadS();
  if (!s.learningGoals) {
    s.learningGoals = { updatedAt: '', activeGoals: [], completedGoals: [] };
    writeS(s);
  }
  return s.learningGoals;
}
function setLearningGoalsState(next) {
  var s = loadS();
  s.learningGoals = next;
  writeS(s);
}

/* ═══ ERROR PATTERN MEMORY PERSISTENCE (v4.3.0: v2 structured state + migration) ═══ */
function getErrorPatternState() {
  var s = loadS();
  if (!s.errorPatternMemory) {
    s.errorPatternMemory = typeof createDefaultErrorPatternState === 'function'
      ? createDefaultErrorPatternState()
      : { version: '2', updatedAt: Date.now(), recentEvents: [], patternStats: {} };
    writeS(s);
  }
  /* Migrate v1 → v2 */
  if (s.errorPatternMemory && s.errorPatternMemory.version !== '2') {
    s.errorPatternMemory = _migrateErrorPatternV1toV2(s.errorPatternMemory);
    writeS(s);
  }
  return s.errorPatternMemory;
}
function setErrorPatternState(next) {
  var s = loadS();
  s.errorPatternMemory = next;
  writeS(s);
}
function _migrateErrorPatternV1toV2(old) {
  var state = typeof createDefaultErrorPatternState === 'function'
    ? createDefaultErrorPatternState()
    : { version: '2', updatedAt: Date.now(), recentEvents: [], patternStats: {} };
  /* Carry over global counts as initial persistent scores */
  var g = (old && old.global) || {};
  for (var k in g) {
    if (g.hasOwnProperty(k) && state.patternStats[k]) {
      state.patternStats[k].persistentScore = g[k] || 0;
      state.patternStats[k].evidenceCount = g[k] || 0;
      state.patternStats[k].lastSeenAt = Date.now();
    }
  }
  /* Convert old recent array to events */
  var recent = (old && old.recent) || [];
  for (var ri = 0; ri < recent.length; ri++) {
    var r = recent[ri];
    if (r && r.pattern) {
      state.recentEvents.push({
        ts: r.ts || Date.now(),
        qid: r.qid || '',
        sectionId: r.sectionId || '',
        signals: [{ type: r.pattern, weight: 1.0, reason: 'migrated' }]
      });
    }
  }
  state.updatedAt = Date.now();
  return state;
}

/* ═══ LEARNING HISTORY ═══ */
function getHistory() {
  return loadS().history || [];
}

function recordDailyHistory(correct) {
  var s = loadS();
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
  for (var k in wd) { if (wd[k].fs === 'mastered') mc++; }
  entry.m = mc;

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
      merged[slugMap[row.slug]] = lvObj;
    } else {
      merged.push(lvObj);
    }
  });

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

/* ═══ KNOWLEDGE POINT PROGRESS (FLM) ═══ */
/*
 * KP FLM uses SESSION-BASED transitions (not per-question like vocab).
 * - Questions accumulate ok/fail during a test session
 * - ONE FLM state transition happens when session is finalized via saveKPResult()
 * - cs = consecutive successful sessions (accuracy >= 85%), NOT per-question
 * - Thresholds: >=85% accuracy → success (cs+1, cs>=2 → mastered)
 *               50-84% → uncertain (cs=0)
 *               <50% → learning (cs=0)
 *               mastered + <50% → uncertain (cs=0)
 */

/* One-time migration: old {score,total,ts} → FLM format */
var _kpFLMMigrated = false;
function _migrateKPtoFLM(s) {
  if (_kpFLMMigrated || !s.kpDone) return;
  var needsMigration = false;
  for (var k in s.kpDone) {
    if (s.kpDone[k].score != null && s.kpDone[k].fs == null) { needsMigration = true; break; }
  }
  if (!needsMigration) { _kpFLMMigrated = true; return; }
  for (var kpId in s.kpDone) {
    var d = s.kpDone[kpId];
    if (d.fs != null) continue;
    /* Conservative migration: require total >= 5 for mastered */
    var pct = d.total > 0 ? d.score / d.total : 0;
    var migratedFs;
    if (pct >= 0.85 && d.total >= 5) migratedFs = 'mastered';
    else if (pct >= 0.5) migratedFs = 'uncertain';
    else if (d.total > 0) migratedFs = 'learning';
    else migratedFs = 'new';
    d.fs = migratedFs;
    d.ok = d.score || 0;
    d.fail = (d.total || 0) - (d.score || 0);
    d.lr = d.ts || Date.now();
    d.fmt = d.fs === 'mastered' ? (d.ts || Date.now()) : null;
    d.rc = 0;
    d.cs = d.fs === 'mastered' ? 2 : 0;
    d.src = 'migrate';
  }
  _kpFLMMigrated = true;
  try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {}
}

/*
 * saveKPResult — Session finalizer with FLM state transition.
 * Called once when all KP MCQs are answered. This is the ONLY place
 * where KP FLM state changes happen.
 */
function saveKPResult(kpId, score, total) {
  var s = loadS();
  if (!s.kpDone) s.kpDone = {};
  _migrateKPtoFLM(s);
  var now = Date.now();
  var prev = s.kpDone[kpId] || {};
  var fs = prev.fs || 'new';
  var cs = prev.cs || 0;
  var pct = total > 0 ? score / total : 0;

  /* Session-based FLM transition */
  if (pct >= 0.85) {
    /* Successful session */
    cs++;
    if (cs >= 2) {
      if (fs !== 'mastered') prev.fmt = now;
      fs = 'mastered';
    } else {
      /* cs=1: at least uncertain */
      if (fs === 'new' || fs === 'learning') fs = 'uncertain';
    }
  } else if (pct >= 0.5) {
    /* Partial session — uncertain, reset cs */
    cs = 0;
    if (fs === 'new' || fs === 'learning') fs = 'uncertain';
    /* mastered stays mastered on partial (only drops on <50%) */
  } else {
    /* Failed session — demote, reset cs */
    cs = 0;
    if (fs === 'mastered') {
      /* Re-forget tracking */
      var _kpParts = kpId.split('.'); var _kpSec = _kpParts.length >= 2 ? ('S' + _kpParts[0] + '.' + _kpParts[1]) : '';
      _logReforget(kpId, 'kp', 'mastered', 'uncertain', _kpSec, '');
      fs = 'uncertain';
    }
    else if (fs === 'new') fs = 'learning';
    /* uncertain/learning stay as-is */
  }

  s.kpDone[kpId] = {
    fs: fs, cs: cs,
    ok: (prev.ok || 0) + score,
    fail: (prev.fail || 0) + (total - score),
    lr: now,
    fmt: prev.fmt || null, rc: prev.rc || 0, src: prev.src || '',
    /* backward compat */
    score: score, total: total, ts: now
  };

  /* daily history + streak */
  if (!s.history) s.history = [];
  var today = new Date().toLocaleDateString('en-CA');
  var entry = null;
  for (var i = s.history.length - 1; i >= 0; i--) {
    if (s.history[i].d === today) { entry = s.history[i]; break; }
  }
  if (!entry) { entry = { d: today, a: 0, ok: 0, fail: 0, m: 0 }; s.history.push(entry); }
  entry.a += total;
  entry.ok += score;
  entry.fail += (total - score);
  if (s.history.length > 365) s.history = s.history.slice(s.history.length - 365);

  if (!s.streak) s.streak = { cur: 0, max: 0, last: '' };
  var _last = s.streak.last;
  var _newStreak = false;
  if (today !== _last) {
    var _td = new Date(today + 'T00:00:00');
    var _ld = _last ? new Date(_last + 'T00:00:00') : null;
    var _diff = _ld ? Math.round((_td - _ld) / 86400000) : 999;
    s.streak.cur = (_diff === 1) ? (s.streak.cur || 0) + 1 : 1;
    if (s.streak.cur > (s.streak.max || 0)) s.streak.max = s.streak.cur;
    s.streak.last = today;
    _newStreak = true;
  }

  invalidateCache();
  writeS(s);
  if (_newStreak) showToast('\ud83d\udd25 ' + t(getStreakCount() + '-day streak!', '\u8fde\u7eed\u5b66\u4e60 ' + getStreakCount() + ' \u5929\uff01'));
  clearTimeout(_badgeCheckTimer);
  _badgeCheckTimer = setTimeout(function() { if (typeof checkBadges === 'function') checkBadges(); }, 3000);
  debouncedSync();
}

function getKPResult(kpId) {
  var s = loadS();
  if (s.kpDone) _migrateKPtoFLM(s);
  return s.kpDone ? s.kpDone[kpId] || null : null;
}
function isKPDone(kpId) { return !!getKPResult(kpId); }
function getKPFLM(kpId) {
  var d = getKPResult(kpId);
  return d ? (d.fs || 'new') : 'new';
}

/* Get stale mastered KPs, filtered by board */
var _staleKPCache = null;
var _staleKPCacheTime = 0;
function getStaleKPs(board) {
  var now = Date.now();
  if (_staleKPCache && (now - _staleKPCacheTime) < 30000 && !board) return _staleKPCache;
  var s = loadS();
  if (!s.kpDone) return [];
  _migrateKPtoFLM(s);
  /* Build set of valid KP ids for board filter */
  var validIds = null;
  if (board && typeof _kpData !== 'undefined' && _kpData[board]) {
    validIds = {};
    for (var ki = 0; ki < _kpData[board].length; ki++) {
      validIds[_kpData[board][ki].id] = true;
    }
  }
  var stale = [];
  for (var kpId in s.kpDone) {
    if (validIds && !validIds[kpId]) continue;
    var d = s.kpDone[kpId];
    if (!d.fs || d.fs !== 'mastered' || !d.fmt) continue;
    var rc = d.rc || 0;
    var threshold = REFRESH_INTERVALS[Math.min(rc, REFRESH_INTERVALS.length - 1)];
    if ((now - d.fmt) / 86400000 >= threshold) {
      stale.push({ id: kpId, rc: rc, daysSince: Math.floor((now - d.fmt) / 86400000) });
    }
  }
  if (!board) { _staleKPCache = stale; _staleKPCacheTime = now; }
  return stale;
}
function getStaleKPCount(board) { return getStaleKPs(board).length; }

function recordKPRefreshScan(kpId, verdict) {
  var s = loadS();
  if (!s.kpDone) s.kpDone = {};
  _migrateKPtoFLM(s);
  var now = Date.now();
  var prev = s.kpDone[kpId] || {};
  var rc = prev.rc || 0;
  var fs = prev.fs || 'mastered';
  var _prevFsKPR = fs;
  if (verdict === 'known') { rc = Math.min(rc + 1, MAX_RC); prev.fmt = now; }
  else if (verdict === 'fuzzy') { fs = 'uncertain'; prev.cs = 0; prev.src = 'reflow'; }
  else if (verdict === 'unknown') { fs = 'learning'; prev.cs = 0; prev.src = 'reflow'; }
  /* Re-forget tracking */
  if (_prevFsKPR === 'mastered' && fs !== 'mastered') {
    var _kpParts2 = kpId.split('.'); var _kpSec2 = _kpParts2.length >= 2 ? ('S' + _kpParts2[0] + '.' + _kpParts2[1]) : '';
    _logReforget(kpId, 'kp', 'mastered', fs, _kpSec2, '');
  }
  s.kpDone[kpId] = {
    score: prev.score || 0, total: prev.total || 0, pct: prev.pct || 0,
    t: now, fs: fs, cs: prev.cs || 0, fmt: prev.fmt || null, rc: rc,
    src: prev.src || ''
  };
  writeS(s);
  _staleKPCache = null;
  invalidateCache();
  recordDailyHistory(null);
  debouncedSync();
}

/* ═══ UNIFIED LEARNING UNIT DISPATCHER ═══ */

/*
 * Transitional dispatcher for heterogeneous learning units.
 * Routes to existing per-type recorders. Not yet a normalized unit-state API —
 * each type still has different verdict shapes and FLM transition semantics.
 * TODO v3.2+: normalize verdict schema across types.
 */
function recordUnitAnswer(type, id, verdict) {
  if (type === 'vocab') {
    if (verdict.refresh) return recordRefreshScan(id, verdict.refresh);
    if (verdict.scan) return recordScan(id, verdict.scan, verdict.round);
    return recordAnswer(id, verdict.mode, verdict.isCorrect);
  }
  if (type === 'kp') {
    if (verdict.refresh) return recordKPRefreshScan(id, verdict.refresh);
    return saveKPResult(id, verdict.score, verdict.total);
  }
  if (type === 'pp') {
    if (verdict.refresh) return recordPPRefreshScan(id, verdict.refresh);
    if (typeof _ppSetMastery === 'function') return _ppSetMastery(id, verdict.level, { source: verdict.source });
  }
}

/* Aggregated stale items across all unit types */
function getStaleUnits(board) {
  var v = typeof getStaleWords === 'function' ? getStaleWords() : [];
  var k = typeof getStaleKPs === 'function' ? getStaleKPs(board) : [];
  var p = typeof getStalePPQuestions === 'function' ? getStalePPQuestions(board) : [];
  return { vocab: v, kp: k, pp: p, total: v.length + k.length + p.length };
}

/* ═══ MODE UNLOCK — all modes open ═══ */
function isModeUnlocked() { return true; }

/* ═══ SECTION UNLOCK — all sections open ═══ */
function isSectionUnlocked() { return true; }

function bootstrapHistory() {
  var s = loadS();
  if (s.history && s.history.length > 0) return;
  var wd = s.words || {};
  var dayMap = {};

  for (var k in wd) {
    var w = wd[k];
    if (!w.lr) continue;
    var d = new Date(w.lr).toLocaleDateString('en-CA');
    if (!dayMap[d]) dayMap[d] = { d: d, a: 0, ok: 0, fail: 0, m: 0 };
    dayMap[d].a += (w.ok || 0) + (w.fail || 0);
    dayMap[d].ok += (w.ok || 0);
    dayMap[d].fail += (w.fail || 0);
  }

  var dates = Object.keys(dayMap).sort();
  var history = [];
  for (var i = 0; i < dates.length; i++) {
    var entry = dayMap[dates[i]];
    var mc = 0;
    for (var wk in wd) {
      if (wd[wk].fs === 'mastered' && wd[wk].lr && new Date(wd[wk].lr).toLocaleDateString('en-CA') <= dates[i]) mc++;
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
  { id: 'first_word',    icon: '\ud83c\udf1f', en: 'First Word',      zh: '\u7b2c\u4e00\u4e2a\u8bcd', prereq: null, check: function(ctx) { return ctx.mastered >= 1; } },
  { id: 'ten_words',     icon: '\ud83d\udcda', en: 'Ten Down',         zh: '\u5341\u4e2a\u8bcd\u4e86', prereq: 'first_word', check: function(ctx) { return ctx.mastered >= 10; } },
  { id: 'hundred_club',  icon: '\ud83c\udfc5', en: 'Hundred Club',     zh: '\u767e\u8bcd\u4ff1\u4e50\u90e8', prereq: 'ten_words', check: function(ctx) { return ctx.mastered >= 100; }, reward: { id: 'data_export', en: 'Data Export unlocked!', zh: '\u6570\u636e\u5bfc\u51fa\u5df2\u89e3\u9501\uff01' } },
  { id: 'streak_3',      icon: '\ud83d\udd25', en: '3-Day Streak',     zh: '\u8fde\u7eed3\u5929', prereq: null, check: function(ctx) { return ctx.streak >= 3; } },
  { id: 'streak_7',      icon: '\ud83d\udcaa', en: 'Week Warrior',     zh: '\u4e00\u5468\u6218\u58eb', prereq: 'streak_3', check: function(ctx) { return ctx.streak >= 7; }, reward: { id: 'hard_daily', en: 'Hard Mode Daily unlocked!', zh: '\u56f0\u96be\u6bcf\u65e5\u6311\u6218\u5df2\u89e3\u9501\uff01' } },
  { id: 'streak_30',     icon: '\ud83d\udc8e', en: 'Monthly Master',   zh: '\u6708\u5ea6\u5927\u5e08', prereq: 'streak_7', check: function(ctx) { return ctx.streak >= 30; } },
  { id: 'daily_5',       icon: '\u26a1',       en: 'Daily 5',          zh: '\u6bcf\u65e5\u63505\u6b21', prereq: null, check: function(ctx) { return ctx.dailyCount >= 5; } },
  { id: 'quiz_perfect',  icon: '\ud83c\udfc6', en: 'Perfectionist',    zh: '\u5b8c\u7f8e\u4e3b\u4e49', prereq: 'first_word', check: function(ctx) { return ctx.perfectQuiz; } },
  { id: 'first_section', icon: '\u2705',       en: 'First Section',    zh: '\u7b2c\u4e00\u4e2a\u77e5\u8bc6\u70b9', prereq: 'first_word', check: function(ctx) { return ctx.sectionsCleared >= 1; } },
  { id: 'srs_master',    icon: '\ud83e\udde0', en: 'Mastery Pro',       zh: '\u7cbe\u901a\u8fbe\u4eba', prereq: 'first_word', check: function(ctx) { return ctx.masteredCount >= 50; } },
  { id: 'five_hundred',  icon: '\ud83d\ude80', en: '500 Words',        zh: '500\u8bcd\u8fbe\u6210', prereq: 'hundred_club', check: function(ctx) { return ctx.mastered >= 500; } },
  { id: 'all_modes',     icon: '\ud83c\udf08', en: 'Explorer',         zh: '\u63a2\u7d22\u8005', prereq: 'first_word', check: function(ctx) { return ctx.modesUsed >= 5; }, reward: { id: 'custom_theme', en: 'Custom Theme unlocked!', zh: '\u81ea\u5b9a\u4e49\u4e3b\u9898\u5df2\u89e3\u9501\uff01' } },
  /* Hidden badges */
  { id: 'speed_demon',   icon: '\u26a1', en: 'Speed Demon',    zh: '\u95ea\u7535\u4fa0', prereq: null, hidden: true, check: function(ctx) { return ctx.speedDemon; } },
  { id: 'focus_30',      icon: '\ud83e\uddd8', en: 'Deep Focus',     zh: '\u6df1\u5ea6\u4e13\u6ce8', prereq: null, hidden: true, check: function(ctx) { return ctx.focusSession; } },
  { id: 'explorer_all',  icon: '\ud83d\uddfa\ufe0f', en: 'Full Explorer',  zh: '\u5168\u9762\u63a2\u7d22', prereq: null, hidden: true, check: function(ctx) { return ctx.panelsVisited >= 15; } }
];

function getUnlockedBadges() {
  try { return JSON.parse(localStorage.getItem('wmatch_badges') || '[]'); } catch(e) { return []; }
}

function _saveBadges(arr) {
  try { localStorage.setItem('wmatch_badges', JSON.stringify(arr)); } catch(e) {}
}

function isBadgeRewardUnlocked(rewardId) {
  try { return !!localStorage.getItem('wmatch_reward_' + rewardId); } catch(e) { return false; }
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

  var dailyCount = 0;
  try { dailyCount = parseInt(localStorage.getItem('wmatch_daily_count') || '0', 10) || 0; } catch(e) {}
  var perfectQuiz = false;
  try { perfectQuiz = !!localStorage.getItem('wmatch_perfect_quiz'); } catch(e) {}
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
  /* Count mastered words (FLM) for srs_master badge */
  var masteredCount = 0;
  if (s.words) {
    for (var k in s.words) {
      if (s.words[k].fs === 'mastered') masteredCount++;
    }
  }
  var modesUsed = 0;
  if (s.modeDone) {
    var modeSet = {};
    for (var mk in s.modeDone) {
      var parts = mk.split(':');
      if (parts.length === 2) modeSet[parts[1]] = true;
    }
    modesUsed = Object.keys(modeSet).length;
  }

  var speedDemon = false;
  try { speedDemon = !!localStorage.getItem('wmatch_speed_demon'); } catch(e) {}
  var focusSession = false;
  try {
    var sessStart = parseInt(sessionStorage.getItem('wmatch_session_start') || '0', 10);
    if (sessStart > 0 && Date.now() - sessStart > 30 * 60 * 1000) focusSession = true;
  } catch(e) {}
  var panelsVisited = 0;
  try { panelsVisited = JSON.parse(localStorage.getItem('wmatch_panels_visited') || '[]').length; } catch(e) {}

  var ctx = {
    mastered: gs.mastered, streak: streak, dailyCount: dailyCount,
    perfectQuiz: perfectQuiz, sectionsCleared: sectionsCleared,
    masteredCount: masteredCount, srsMaxCount: masteredCount, modesUsed: modesUsed,
    speedDemon: speedDemon, focusSession: focusSession, panelsVisited: panelsVisited
  };

  var newlyUnlocked = [];
  BADGES.forEach(function(b) {
    if (unlocked.indexOf(b.id) >= 0) return;
    if (b.prereq && unlocked.indexOf(b.prereq) < 0) return;
    if (b.check(ctx)) {
      unlocked.push(b.id);
      newlyUnlocked.push(b);
    }
  });

  if (newlyUnlocked.length > 0) {
    _saveBadges(unlocked);
    newlyUnlocked.forEach(function(b, idx) {
      if (b.reward) {
        try { localStorage.setItem('wmatch_reward_' + b.reward.id, '1'); } catch(e) {}
      }
      setTimeout(function() {
        if (typeof showBadgeCelebration === 'function') {
          showBadgeCelebration(b);
        } else if (typeof showToast === 'function') {
          showToast(b.icon + ' ' + t(b.en, b.zh) + ' ' + t('unlocked!', '\u89e3\u9501\uff01'));
        }
        if (b.reward && typeof showToast === 'function') {
          setTimeout(function() {
            showToast('\ud83c\udf81 ' + t(b.reward.en, b.reward.zh));
          }, 2000);
        }
      }, idx * 4500);
    });
    if (newlyUnlocked.some(function(b) { return b.id === 'first_word'; })) {
      setTimeout(function() {
        if (typeof showNudge === 'function') {
          showNudge('first_word_next', t('Great start! Try Quiz mode to reinforce your memory', '\u597d\u7684\u5f00\u59cb\uff01\u8bd5\u8bd5\u6d4b\u9a8c\u6a21\u5f0f\u5de9\u56fa\u8bb0\u5fc6'), t('Go', '\u53bb\u8bd5\u8bd5'), function() { if (typeof navTo === 'function') navTo('home'); });
        }
      }, 5000);
    }
    if (typeof showNudge === 'function') {
      showNudge('try_diag', t('Try a Diagnostic Test to find weak areas!', '\u8bd5\u8bd5\u8bca\u65ad\u6d4b\u8bd5\u627e\u8584\u5f31\u77e5\u8bc6\u70b9'), t('Go', '\u53bb\u8bd5\u8bd5'), function() { if (typeof navTo === 'function') navTo('diag'); });
    }
  }
  return unlocked;
}

/* ═══ WEEKLY GOAL ═══ */
function getWeeklyGoal() {
  var now = new Date();
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

/* ══════════════════════════════════════════════════════════════
   RE-FORGET TRACKING (v4.7.0)
   Logs every mastered→non-mastered demotion across all 3 unit types.
   ══════════════════════════════════════════════════════════════ */

var _REFORGET_KEY = 'reforget_log';
var _REFORGET_MAX = 2000;

function _logReforget(itemId, type, fromStatus, toStatus, section, board) {
  var log = [];
  try { log = JSON.parse(localStorage.getItem(_REFORGET_KEY)) || []; } catch(e) { log = []; }
  log.push({
    id: itemId, type: type, from: fromStatus, to: toStatus,
    ts: Date.now(), sec: section || '', board: board || ''
  });
  /* Trim oldest when over limit */
  if (log.length > _REFORGET_MAX) log = log.slice(log.length - _REFORGET_MAX);
  try { localStorage.setItem(_REFORGET_KEY, JSON.stringify(log)); } catch(e) {}
  _invalidateReforgetCache();
}

var _reforgetCache = null;
var _reforgetCountMap = null;

function _invalidateReforgetCache() { _reforgetCache = null; _reforgetCountMap = null; }

function getReforgetLog() {
  if (_reforgetCache) return _reforgetCache;
  try { _reforgetCache = JSON.parse(localStorage.getItem(_REFORGET_KEY)) || []; } catch(e) { _reforgetCache = []; }
  return _reforgetCache;
}

function _buildReforgetCountMap() {
  if (_reforgetCountMap) return _reforgetCountMap;
  var log = getReforgetLog();
  _reforgetCountMap = {};
  for (var i = 0; i < log.length; i++) {
    var id = log[i].id;
    _reforgetCountMap[id] = (_reforgetCountMap[id] || 0) + 1;
  }
  return _reforgetCountMap;
}

function getReforgetCount(itemId) {
  var map = _buildReforgetCountMap();
  return map[itemId] || 0;
}

function getReforgetTimeline(itemId) {
  var log = getReforgetLog();
  var timeline = [];
  for (var i = 0; i < log.length; i++) { if (log[i].id === itemId) timeline.push(log[i]); }
  return timeline;
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM PRACTICE LISTS (v4.7.0)
   User-created collections of vocab/KP/PP items with session history.
   FLM state stays global — lists are reference-only views.
   ══════════════════════════════════════════════════════════════ */

var _CUSTOM_LISTS_KEY = 'custom_lists';

function _loadCustomLists() {
  try {
    var d = JSON.parse(localStorage.getItem(_CUSTOM_LISTS_KEY));
    if (d && d.lists) return d;
  } catch(e) {}
  return { lists: [] };
}

function _saveCustomLists(data) {
  try { localStorage.setItem(_CUSTOM_LISTS_KEY, JSON.stringify(data)); } catch(e) {}
}

function createCustomList(title) {
  var data = _loadCustomLists();
  var id = 'cl_' + Date.now() + '_' + Math.floor(Math.random() * 65536).toString(16);
  var now = new Date().toISOString();
  var list = { id: id, title: title || 'Untitled', createdAt: now, updatedAt: now, items: [], sessions: [] };
  data.lists.push(list);
  _saveCustomLists(data);
  debouncedSync();
  return list;
}

function renameCustomList(listId, newTitle) {
  var data = _loadCustomLists();
  for (var i = 0; i < data.lists.length; i++) {
    if (data.lists[i].id === listId) {
      data.lists[i].title = newTitle;
      data.lists[i].updatedAt = new Date().toISOString();
      _saveCustomLists(data);
      debouncedSync();
      return true;
    }
  }
  return false;
}

function deleteCustomList(listId) {
  var data = _loadCustomLists();
  data.lists = data.lists.filter(function(l) { return l.id !== listId; });
  _saveCustomLists(data);
  debouncedSync();
}

function addItemsToList(listId, items) {
  var data = _loadCustomLists();
  for (var i = 0; i < data.lists.length; i++) {
    if (data.lists[i].id === listId) {
      var existing = data.lists[i].items;
      for (var j = 0; j < items.length; j++) {
        var dup = false;
        for (var k = 0; k < existing.length; k++) {
          if (existing[k].type === items[j].type && existing[k].ref === items[j].ref) { dup = true; break; }
        }
        if (!dup) existing.push(items[j]);
      }
      data.lists[i].updatedAt = new Date().toISOString();
      _saveCustomLists(data);
      debouncedSync();
      return true;
    }
  }
  return false;
}

function removeItemFromList(listId, type, ref) {
  var data = _loadCustomLists();
  for (var i = 0; i < data.lists.length; i++) {
    if (data.lists[i].id === listId) {
      data.lists[i].items = data.lists[i].items.filter(function(it) {
        return !(it.type === type && it.ref === ref);
      });
      data.lists[i].updatedAt = new Date().toISOString();
      _saveCustomLists(data);
      debouncedSync();
      return true;
    }
  }
  return false;
}

function getCustomList(listId) {
  var data = _loadCustomLists();
  for (var i = 0; i < data.lists.length; i++) {
    if (data.lists[i].id === listId) return data.lists[i];
  }
  return null;
}

function getCustomLists() { return _loadCustomLists().lists; }

function recordListSession(listId, results) {
  var data = _loadCustomLists();
  for (var i = 0; i < data.lists.length; i++) {
    if (data.lists[i].id === listId) {
      data.lists[i].sessions.push({ ts: new Date().toISOString(), results: results });
      if (data.lists[i].sessions.length > 50) data.lists[i].sessions = data.lists[i].sessions.slice(-50);
      data.lists[i].updatedAt = new Date().toISOString();
      _saveCustomLists(data);
      debouncedSync();
      return true;
    }
  }
  return false;
}
