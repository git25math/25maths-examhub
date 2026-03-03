/* ══════════════════════════════════════════════════════════════
   battle.js — Battle mode engine (timed matching game)
   ══════════════════════════════════════════════════════════════ */

var gridEl = E('grid');
var G = { first: null, second: null, lock: false, matched: 0, total: 0, moves: 0, combo: 0, maxCombo: 0, timeLeft: 0, timer: null, lvlIdx: 0, cb: 0 };

function resetG() {
  return { first: null, second: null, lock: false, matched: 0, total: 0, moves: 0, combo: 0, maxCombo: 0, timeLeft: 0, timer: null, lvlIdx: 0, cb: 0 };
}

/* Start battle mode */
function startBattle(idx) {
  var lv = LEVELS[idx];
  if (validate(lv, idx)) return;

  currentLvl = idx;
  G = resetG();
  G.lvlIdx = idx;
  G.total = lv.vocabulary.length / 2;
  G.timeLeft = lv.timer;
  G.cb = lv.comboBonus || 0;

  hideAll();
  E('game-area').classList.add('active');
  E('user-bar').classList.add('vis');
  E('g-badge').textContent = 'STAGE ' + (idx + 1);
  E('g-title').textContent = lv.title;
  updateHUD();

  /* Build grid */
  gridEl.style.gridTemplateColumns = 'repeat(' + calcCols(lv.vocabulary.length) + ',1fr)';
  gridEl.innerHTML = '';

  shuffle(lv.vocabulary).forEach(function(item, i) {
    var s = document.createElement('div');
    s.className = 'cs';
    s.dataset.pid = item.id;
    s.dataset.tp = item.type;
    s.style.animationDelay = i * .04 + 's';
    s.innerHTML = '<div class="ci"><div class="cf cf-b"></div><div class="cf cf-f"><div class="ct-l">' +
      (item.type === 'word' ? 'EN' : '\u4E2D') + '</div><div class="ct-t">' + item.content + '</div></div></div>';
    s.addEventListener('click', function() { onFlip(s); });
    gridEl.appendChild(s);
  });

  /* Start countdown timer */
  clearInterval(G.timer);
  G.timer = setInterval(function() {
    G.timeLeft--;
    updateHUD();
    if (G.timeLeft <= 0) {
      G.lock = true;
      G.first = G.second = null;
      endBattle(false);
    }
  }, 1000);
}

/* Card flip handler */
function onFlip(s) {
  if (G.lock || s === G.first || s.classList.contains('done')) return;
  s.classList.add('flipped');

  if (!G.first) { G.first = s; return; }

  G.second = s;
  G.moves++;
  G.lock = true;
  updateHUD();

  var i1 = G.first.dataset.pid, i2 = G.second.dataset.pid;
  var t1 = G.first.dataset.tp, t2 = G.second.dataset.tp;

  (i1 === i2 && t1 !== t2) ? onMatch() : onMiss();
}

/* Match success */
function onMatch() {
  G.combo++;
  if (G.combo > G.maxCombo) G.maxCombo = G.combo;
  G.matched++;

  /* Spawn particles on both matched cards */
  [G.first, G.second].forEach(function(s) {
    var r = s.getBoundingClientRect();
    spawnP(r.left + r.width / 2, r.top + r.height / 2, 14);
  });

  /* Combo bonus time */
  if (G.combo >= 2 && G.cb > 0) {
    G.timeLeft += G.cb;
    var r = G.second.getBoundingClientRect();
    floatTxt('+' + G.cb + 's', '#3BA776', r.left + r.width / 2, r.top);
  }

  if (G.combo >= 2) showCombo(G.combo);
  updateHUD();

  setTimeout(function() {
    G.first.classList.add('match-go', 'done');
    G.second.classList.add('match-go', 'done');
    resetB();
    if (G.matched === G.total) setTimeout(function() { endBattle(true); }, 400);
  }, 350);
}

/* Match failure */
function onMiss() {
  G.combo = 0;
  updateHUD();
  G.first.classList.add('shake-go');
  G.second.classList.add('shake-go');

  setTimeout(function() {
    G.first.classList.remove('flipped', 'shake-go');
    G.second.classList.remove('flipped', 'shake-go');
    resetB();
  }, 650);
}

/* Reset selection state */
function resetB() {
  G.first = G.second = null;
  G.lock = false;
}

/* Update HUD display */
function updateHUD() {
  E('d-time').textContent = G.timeLeft + 's';
  E('d-moves').textContent = G.moves;
  E('d-combo').textContent = G.combo;
  E('pbar').style.width = (G.total === 0 ? 0 : Math.round(G.matched / G.total * 100)) + '%';

  if (G.timeLeft <= 15) E('si-time').classList.add('warn');
  else E('si-time').classList.remove('warn');
}

/* End battle (win or timeout) */
function endBattle(won) {
  clearInterval(G.timer);
  G.lock = true;
  G.first = G.second = null;

  var lv = LEVELS[G.lvlIdx];
  var elapsed = lv.timer - G.timeLeft;
  var isNew = false;

  if (won) {
    var prev = getBest(G.lvlIdx);
    if (!prev || elapsed < prev.t) isNew = true;
    saveBest(G.lvlIdx, elapsed, G.moves, G.maxCombo);

    /* Victory particle burst */
    for (var i = 0; i < 5; i++) {
      setTimeout(function() {
        spawnP(Math.random() * innerWidth, Math.random() * innerHeight * .5, 20);
      }, i * 180);
    }
  }

  E('e-emoji').textContent = won ? '\ud83c\udfc6' : '\u23f0';
  E('e-title').textContent = won
    ? ['\u592a\u795e\u4e86\uff01', '\u5b8c\u7f8e\uff01', '\u4f60\u592a\u5f3a\u4e86\uff01', '\u65e0\u654c\uff01'][~~(Math.random() * 4)]
    : '\u65f6\u95f4\u5230\uff01';
  E('e-sub').textContent = won ? '\u5168\u90e8\u914d\u5bf9\u6210\u529f\uff01' : '\u518d\u6765\u4e00\u6b21\uff01';

  E('e-time').textContent = won ? elapsed : '-';
  E('e-moves').textContent = G.moves;
  E('e-combo').textContent = G.maxCombo;

  E('e-best').textContent = won && isNew
    ? '\ud83c\udf1f \u65b0\u7eaa\u5f55\uff01'
    : won ? '\u6700\u4f73: ' + getBest(G.lvlIdx).t + 's' : '';

  var a = E('e-action');
  if (won && G.lvlIdx < LEVELS.length - 1) {
    a.textContent = '\u4e0b\u4e00\u5173 \u2192';
    a.onclick = function() { openMode(G.lvlIdx + 1); };
    a.style.display = 'inline-block';
  } else if (won) {
    a.textContent = '\ud83c\udf89 \u5168\u90e8\u901a\u5173';
    a.onclick = function() { showMenu(); };
    a.style.display = 'inline-block';
  } else {
    a.style.display = 'none';
  }

  E('e-retry').onclick = function() { startBattle(G.lvlIdx); };
  E('game-area').classList.remove('active');
  updateUserBar();
  showOv('ov-end');
}
