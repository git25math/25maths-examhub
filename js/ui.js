/* ══════════════════════════════════════════════════════════════
   ui.js — Screen switching, overlay management, tabs
   ══════════════════════════════════════════════════════════════ */

/* Hide all overlays and game areas */
function hideAll() {
  ['ov-auth', 'ov-menu', 'ov-mode', 'ov-study-end', 'ov-end', 'ov-review-end', 'ov-mastery'].forEach(function(id) {
    var e = E(id);
    if (e) {
      e.classList.remove('vis');
      e.style.display = 'none';
    }
  });
  ['study-area', 'game-area', 'review-area'].forEach(function(id) {
    E(id).classList.remove('active');
  });
}

/* Show an overlay by id */
function showOv(id) {
  hideAll();
  var e = E(id);
  e.style.display = 'flex';
  e.classList.add('vis');
}

/* Hide a single overlay */
function hideOv(id) {
  E(id).classList.remove('vis');
  E(id).style.display = 'none';
}

/* Tab switching (levels / mastery tabs in main menu) */
function switchTab(btn) {
  btn.parentElement.querySelectorAll('.tab').forEach(function(t) {
    t.classList.remove('active');
  });
  btn.classList.add('active');
  var tab = btn.dataset.tab;
  E('tab-levels').style.display = tab === 'levels' ? 'block' : 'none';
  E('tab-mastery').style.display = tab === 'mastery' ? 'block' : 'none';
  if (tab === 'mastery') renderMasteryInline();
}

/* Utility functions */
function validate(lv, i) {
  var v = lv.vocabulary;
  if (!v || !Array.isArray(v)) return 'Bad data';
  if (v.length % 2 !== 0 || v.length < 4) return 'Bad pairs';
  var c = {};
  v.forEach(function(x) { c[x.id] = (c[x.id] || 0) + 1; });
  for (var id in c) if (c[id] !== 2) return 'id=' + id + ' bad';
  return null;
}

function shuffle(a) {
  var b = a.slice();
  for (var i = b.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}

function calcCols(n) {
  return n <= 16 ? 4 : 5;
}

function getPairs(vocab) {
  var m = {};
  vocab.forEach(function(v) {
    if (!m[v.id]) m[v.id] = {};
    m[v.id][v.type] = v.content;
    m[v.id].lid = v.id;
  });
  return Object.keys(m).map(function(k) { return m[k]; });
}
