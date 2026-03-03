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

/* Word mastery storage
   Each word key: "L{levelIndex}_W{wordId}"
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
    var m = {};
    lv.vocabulary.forEach(function(v) {
      if (!m[v.id]) m[v.id] = {};
      m[v.id][v.type] = v.content;
    });
    for (var k in m) {
      var key = 'L' + li + '_W' + k;
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
  var wd = getWordData();
  var count = 0;
  var now = Date.now();
  for (var k in wd) {
    if (wd[k].st !== 'mastered' && wd[k].nr <= now) count++;
  }
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

/* Cloud sync */
async function syncToCloud() {
  if (!sb || !currentUser || currentUser.id === 'local') return;
  try {
    await sb.from('vocab_progress').upsert(
      { user_id: currentUser.id, data: JSON.stringify(loadS()), updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  } catch (e) { /* silently fail */ }
}

async function syncFromCloud() {
  if (!sb || !currentUser || currentUser.id === 'local') return;
  try {
    var res = await sb.from('vocab_progress').select('data').eq('user_id', currentUser.id).single();
    if (res.data && res.data.data) {
      var cloud = JSON.parse(res.data.data);
      var local = loadS();
      if (Object.keys(cloud).length > Object.keys(local).length) {
        writeS(cloud);
      }
    }
  } catch (e) { /* silently fail */ }
}
