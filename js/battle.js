/* ══════════════════════════════════════════════════════════════
   battle.js — Battle mode engine (timed matching game)
   Renders into panel-battle
   ══════════════════════════════════════════════════════════════ */

var G = { first: null, second: null, lock: false, matched: 0, total: 0, moves: 0, combo: 0, maxCombo: 0, timeLeft: 0, timer: null, lvlIdx: 0, cb: 0 };

function resetG() {
  return { first: null, second: null, lock: false, matched: 0, total: 0, moves: 0, combo: 0, maxCombo: 0, timeLeft: 0, timer: null, lvlIdx: 0, cb: 0 };
}

/* Start battle mode */
function startBattle(idx) {
  var lv = LEVELS[idx];
  if (validate(lv, idx)) return;

  currentLvl = idx;
  if (G && G.timer) clearInterval(G.timer);
  G = resetG();
  G.lvlIdx = idx;
  G.total = lv.vocabulary.length / 2;
  G.timeLeft = lv.timer;
  G.cb = lv.comboBonus || 0;

  showPanel('battle');
  renderBattle(lv);
}

function renderBattle(lv) {
  var cols = calcCols(lv.vocabulary.length);

  var html = '';

  /* Header */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="exitBattle()">\u2190</button>';
  html += '<div class="flex-1 text-center"><div class="font-display fw-700" style="font-size:16px">STAGE ' + (G.lvlIdx + 1) + ': ' + lvTitle(lv) + '</div></div>';
  html += '</div>';

  /* HUD */
  html += '<div class="battle-hud" id="battle-hud" aria-live="polite" aria-atomic="true">';
  html += '<div class="hud-item" id="hud-time"><span class="hud-icon">\u23f1</span><span id="d-time" aria-label="Time remaining">' + G.timeLeft + 's</span></div>';
  html += '<div class="hud-item"><span class="hud-icon">\ud83c\udccf</span><span id="d-moves">0</span></div>';
  html += '<div class="hud-item"><span class="hud-icon">\ud83d\udd25</span><span id="d-combo">0</span></div>';
  html += '</div>';

  /* Progress bar */
  html += '<div class="study-progress mb-16"><div class="study-progress-fill" id="battle-pbar" style="width:0%"></div></div>';

  /* Grid */
  html += '<div class="battle-grid" id="grid" style="grid-template-columns:repeat(' + cols + ',1fr)"></div>';

  E('panel-battle').innerHTML = html;

  /* Build grid cards */
  var gridEl = E('grid');
  shuffle(lv.vocabulary).forEach(function(item, i) {
    var s = document.createElement('div');
    s.className = 'cs';
    s.dataset.pid = item.id;
    s.dataset.tp = item.type;
    s.style.animationDelay = i * 0.04 + 's';
    s.innerHTML = '<div class="ci"><div class="cf cf-b"></div><div class="cf cf-f"><div class="ct-l">' +
      (item.type === 'word' ? 'EN' : t('CN', '\u4e2d')) + '</div><div class="ct-t">' + escapeHtml(item.content) + '</div></div></div>';
    s.setAttribute('role', 'button');
    s.setAttribute('tabindex', '0');
    s.addEventListener('click', function() { onFlip(s); });
    s.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip(s); } });
    gridEl.appendChild(s);
  });

  /* Start timer */
  clearInterval(G.timer);
  G.timer = setInterval(function() {
    G.timeLeft--;
    updateHUD();
    if (G.timeLeft > 0 && G.timeLeft <= 5) playTick();
    if (G.timeLeft <= 0) {
      G.lock = true;
      G.first = G.second = null;
      endBattle(false);
    }
  }, 1000);
}

function exitBattle() {
  clearInterval(G.timer);
  openDeck(G.lvlIdx);
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
  playCorrect();
  if (G.combo >= 3) playCombo();

  [G.first, G.second].forEach(function(s) {
    var r = s.getBoundingClientRect();
    spawnP(r.left + r.width / 2, r.top + r.height / 2, 14);
  });

  if (G.combo >= 2 && G.cb > 0) {
    G.timeLeft += G.cb;
    var r = G.second.getBoundingClientRect();
    floatTxt('+' + G.cb + 's', '#22C55E', r.left + r.width / 2, r.top);
  }

  if (G.combo >= 2) showCombo(G.combo);
  updateHUD();

  setTimeout(function() {
    G.first.classList.add('match-go', 'done');
    G.second.classList.add('match-go', 'done');
    resetBP();
    if (G.matched === G.total) setTimeout(function() { endBattle(true); }, 400);
  }, 350);
}

/* Match failure */
function onMiss() {
  G.combo = 0;
  updateHUD();
  playWrong();
  G.first.classList.add('shake-go');
  G.second.classList.add('shake-go');

  setTimeout(function() {
    G.first.classList.remove('flipped', 'shake-go');
    G.second.classList.remove('flipped', 'shake-go');
    resetBP();
  }, 650);
}

function resetBP() {
  G.first = G.second = null;
  G.lock = false;
}

/* Update HUD display */
function updateHUD() {
  var timeEl = E('d-time');
  var movesEl = E('d-moves');
  var comboEl = E('d-combo');
  var pbar = E('battle-pbar');
  var hudTime = E('hud-time');

  if (timeEl) timeEl.textContent = G.timeLeft + 's';
  if (movesEl) movesEl.textContent = G.moves;
  if (comboEl) comboEl.textContent = G.combo;
  if (pbar) pbar.style.width = (G.total === 0 ? 0 : Math.round(G.matched / G.total * 100)) + '%';

  if (hudTime) {
    if (G.timeLeft <= 15) hudTime.classList.add('warn');
    else hudTime.classList.remove('warn');
  }
}

/* End battle */
function endBattle(won) {
  clearInterval(G.timer);
  G.lock = true;
  G.first = G.second = null;

  var lv = LEVELS[G.lvlIdx];
  var elapsed = lv.timer - G.timeLeft;
  var isNew = false;

  if (won) {
    markModeDone(G.lvlIdx, 'battle');
    var prev = getBest(G.lvlIdx);
    if (!prev || elapsed < prev.t) isNew = true;
    saveBest(G.lvlIdx, elapsed, G.moves, G.maxCombo);

    for (var i = 0; i < 5; i++) {
      setTimeout(function() {
        spawnP(Math.random() * innerWidth, Math.random() * innerHeight * 0.5, 20);
      }, i * 180);
    }
  }

  var emoji = won ? '\ud83c\udfc6' : '\u23f0';
  var title = won
    ? (appLang === 'en'
      ? ['Amazing!', 'Perfect!', 'Incredible!', 'Unstoppable!'][~~(Math.random() * 4)]
      : ['\u592a\u795e\u4e86\uff01', '\u5b8c\u7f8e\uff01', '\u4f60\u592a\u5f3a\u4e86\uff01', '\u65e0\u654c\uff01'][~~(Math.random() * 4)])
    : t("Time's up! Great effort!", '\u65f6\u95f4\u5230\uff01\u8868\u73b0\u4e0d\u9519\uff01');

  var modalHtml = '';
  modalHtml += '<div class="result-emoji">' + emoji + '</div>';
  modalHtml += '<div class="result-title">' + title + '</div>';
  modalHtml += '<div class="result-sub">' + (won ? t('All matched!', '\u5168\u90e8\u914d\u5bf9\u6210\u529f\uff01') : t('Try again!', '\u518d\u6765\u4e00\u6b21\uff01')) + '</div>';

  modalHtml += '<div class="result-stats">';
  modalHtml += '<div class="text-center"><div class="result-stat-val">' + (won ? elapsed : '-') + '</div><div class="result-stat-label">' + t('TIME', '\u7528\u65f6') + '</div></div>';
  modalHtml += '<div class="text-center"><div class="result-stat-val">' + G.moves + '</div><div class="result-stat-label">' + t('FLIPS', '\u7ffb\u724c') + '</div></div>';
  modalHtml += '<div class="text-center"><div class="result-stat-val">' + G.maxCombo + '</div><div class="result-stat-label">' + t('COMBO', '\u8fde\u51fb') + '</div></div>';
  modalHtml += '</div>';

  if (won && isNew) {
    modalHtml += '<div class="fw-700 mb-12 text-primary" style="font-size:12px">\ud83c\udf1f ' + t('New Record!', '\u65b0\u7eaa\u5f55\uff01') + '</div>';
  } else if (won) {
    modalHtml += '<div class="text-xs text-sub mb-12">' + t('Best: ', '\u6700\u4f73: ') + getBest(G.lvlIdx).t + 's</div>';
  }

  _lastShareOpts = { mode: 'battle', score: won ? G.matched : 0, total: G.total, emoji: emoji, time: won ? elapsed : null, combo: G.maxCombo };

  modalHtml += '<div class="result-actions">';
  if (won && G.lvlIdx < LEVELS.length - 1) {
    modalHtml += '<button class="btn btn-primary" onclick="hideModal();openDeck(' + (G.lvlIdx + 1) + ')">' + t('Next \u2192', '\u4e0b\u4e00\u5173 \u2192') + '</button>';
  }
  modalHtml += '<button class="btn btn-secondary" onclick="hideModal();startBattle(' + G.lvlIdx + ')">\ud83d\udd01 ' + t('Try again', '\u518d\u8bd5\u4e00\u6b21') + '</button>';
  modalHtml += '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>';
  modalHtml += '<button class="btn btn-ghost" onclick="hideModal();openDeck(' + G.lvlIdx + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  modalHtml += '</div>';

  showModal(modalHtml);
  updateSidebar();

  /* Nudge: suggest spell after first battle */
  if (won && typeof showNudge === 'function') {
    showNudge('try_spell', t('Try Spelling mode to remember even better!', '拼写模式帮你记得更牢'), t('Go', '去试试'), function() { hideModal(); if (typeof startSpell === 'function') startSpell(G.lvlIdx); else _lazyLoad('modes', function() { startSpell(G.lvlIdx); }); });
  }
}
