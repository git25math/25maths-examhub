/* ══════════════════════════════════════════════════════════════
   mastery.js — Mastery percentage, rank calculation, word overview
   ══════════════════════════════════════════════════════════════ */

/* Calculate overall mastery percentage */
function getMasteryPct() {
  var all = getAllWords();
  if (all.length === 0) return 0;
  var m = all.filter(function(w) { return w.status === 'mastered'; }).length;
  return Math.round(m / all.length * 100);
}

/* Get current rank based on mastery percentage */
function getRank() {
  var pct = getMasteryPct();
  var r = RANKS[0];
  for (var i = RANKS.length - 1; i >= 0; i--) {
    if (pct >= RANKS[i].min) { r = RANKS[i]; break; }
  }
  return r;
}

/* Get next rank (or null if at max) */
function getNextRank() {
  var pct = getMasteryPct();
  for (var i = 0; i < RANKS.length; i++) {
    if (pct < RANKS[i].min) return RANKS[i];
  }
  return null;
}

/* ═══ MAIN MENU — inline mastery tab ═══ */
function renderMasteryInline() {
  var all = getAllWords();
  var m = all.filter(function(w) { return w.status === 'mastered'; }).length;
  var l = all.filter(function(w) { return w.status === 'learning'; }).length;

  E('mst-stats').innerHTML =
    '<div class="mstat"><div class="mstat-num" style="color:#3BA776">' + m + '</div><div class="mstat-lab">已掌握</div></div>' +
    '<div class="mstat"><div class="mstat-num" style="color:#C4960C">' + l + '</div><div class="mstat-lab">学习中</div></div>' +
    '<div class="mstat"><div class="mstat-num" style="color:var(--t2)">' + (all.length - m - l) + '</div><div class="mstat-lab">未学</div></div>';

  var g = E('mst-grid');
  g.innerHTML = '';
  all.forEach(function(w) {
    g.innerHTML += '<div class="word-chip ' + w.status + '"><div class="wc-en">' + w.word + '</div><div class="wc-zh">' + w.def + '</div></div>';
  });
}

/* ═══ MASTERY POPUP (from user bar) ═══ */
var masteryFilter = 'all';

function showMastery() {
  masteryFilter = 'all';
  renderMasteryPopup();
  E('ov-mastery').style.display = 'flex';
  E('ov-mastery').classList.add('vis');
}

function filterMastery(f, btn) {
  masteryFilter = f;
  if (btn) {
    btn.parentElement.querySelectorAll('.tab').forEach(function(t) {
      t.classList.remove('active');
    });
    btn.classList.add('active');
  }
  renderMasteryPopup();
}

function renderMasteryPopup() {
  var all = getAllWords();
  var m = all.filter(function(w) { return w.status === 'mastered'; }).length;
  var l = all.filter(function(w) { return w.status === 'learning'; }).length;

  E('mp-stats').innerHTML =
    '<div class="mstat"><div class="mstat-num" style="color:#3BA776">' + m + '</div><div class="mstat-lab">已掌握</div></div>' +
    '<div class="mstat"><div class="mstat-num" style="color:#C4960C">' + l + '</div><div class="mstat-lab">学习中</div></div>' +
    '<div class="mstat"><div class="mstat-num">' + all.length + '</div><div class="mstat-lab">总词汇</div></div>';

  var filtered = masteryFilter === 'all' ? all : all.filter(function(w) {
    return w.status === (masteryFilter === 'new-word' ? 'new' : masteryFilter);
  });

  var g = E('mp-grid');
  g.innerHTML = '';
  filtered.forEach(function(w) {
    g.innerHTML += '<div class="word-chip ' + (w.status === 'new' ? 'new-word' : w.status) + '"><div class="wc-en">' + w.word + '</div><div class="wc-zh">' + w.def + '</div></div>';
  });
}

/* ═══ MENU ═══ */
var currentLvl = 0;

function showMenu() {
  hideAll();
  updateUserBar();

  var r = getRank(), nr = getNextRank(), pct = getMasteryPct();
  E('rc-emoji').textContent = r.emoji;
  E('rc-name').textContent = r.name;
  E('rc-prog').textContent = nr
    ? '掌握' + pct + '% \xb7 还需' + (nr.min - pct) + '%升级'
    : '已达最高段位！' + pct + '%掌握';
  E('rc-bar').style.width = pct + '%';

  var mc = maxCleared(), list = E('lvl-list');
  list.innerHTML = '';

  LEVELS.forEach(function(lv, i) {
    var btn = document.createElement('button');
    btn.className = 'lvl-btn';
    var pairs = lv.vocabulary.length / 2;
    var best = getBest(i);
    var unlocked = i === 0 || i <= mc + 1;
    if (!unlocked) btn.classList.add('locked');

    var bH = '';
    if (best) bH = '<div class="lvl-best">\u2694\ufe0f ' + best.t + 's \xb7 ' + best.m + '\u6b21</div>';

    btn.innerHTML = '<div class="lvl-num">' + (i + 1) + '</div><div style="flex:1"><div class="lvl-name">' + lv.title + '</div><div class="lvl-meta">' + pairs + '\u7ec4 \xb7 ' + lv.timer + 's</div>' + bH + '</div>';

    if (unlocked) btn.addEventListener('click', function() { openMode(i); });
    list.appendChild(btn);
  });

  showOv('ov-menu');
}

/* ═══ MODE SELECT ═══ */
function openMode(idx) {
  currentLvl = idx;
  var lv = LEVELS[idx];
  E('mode-title').textContent = 'Stage ' + (idx + 1) + ': ' + lv.title;
  E('mode-sub').textContent = (lv.vocabulary.length / 2) + '\u7ec4 \xb7 ' + lv.timer + '\u79d2';

  var rc = getReviewCount();
  E('rv-badge').textContent = rc;
  E('rv-badge').style.display = rc > 0 ? 'inline-block' : 'none';

  E('mc-study').onclick = function() { startStudy(idx); };
  E('mc-battle').onclick = function() { startBattle(idx); };
  E('mc-review').onclick = function() { startReview(idx); };

  showOv('ov-mode');
}
