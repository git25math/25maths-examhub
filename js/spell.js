/* ══════════════════════════════════════════════════════════════
   spell.js — Spelling mode (type the English word)
   ══════════════════════════════════════════════════════════════ */

var SP = { pairs: [], idx: 0, correct: 0, lvl: 0, answered: false };

function startSpell(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  SP.pairs = shuffle(getPairs(lv.vocabulary));
  SP.idx = 0;
  SP.correct = 0;
  SP.lvl = li;
  SP.answered = false;

  showPanel('spell');
  renderSpellCard();
}

function renderSpellCard() {
  if (SP.idx >= SP.pairs.length) { finishSpell(); return; }

  var p = SP.pairs[SP.idx];
  var progress = SP.pairs.length > 0 ? Math.round(SP.idx / SP.pairs.length * 100) : 0;

  /* Generate hint: first letter + underscores */
  var word = p.word;
  var hint = word.charAt(0);
  for (var i = 1; i < word.length; i++) {
    hint += word.charAt(i) === ' ' ? ' ' : ' _';
  }

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + SP.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (SP.idx + 1) + ' / ' + SP.pairs.length + '</div>';
  html += '</div>';

  /* Prompt */
  html += '<div class="spell-prompt">';
  html += '<div class="spell-def">' + p.def + '</div>';
  html += '<div class="spell-hint">' + hint + '</div>';
  html += '</div>';

  /* Input */
  html += '<div class="spell-input-wrap">';
  html += '<input type="text" class="spell-input" id="spell-input" placeholder="\u8f93\u5165\u82f1\u6587\u5355\u8bcd..." autocomplete="off" autocapitalize="off">';
  html += '</div>';

  html += '<div class="spell-answer" id="spell-answer"></div>';

  html += '<div class="text-center">';
  html += '<button class="btn btn-primary" id="spell-check-btn" onclick="checkSpell()">\u68c0\u67e5</button>';
  html += '</div>';

  E('panel-spell').innerHTML = html;
  SP.answered = false;

  /* Focus input and bind Enter key */
  var input = E('spell-input');
  setTimeout(function() { input.focus(); }, 100);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      if (SP.answered) {
        SP.idx++;
        renderSpellCard();
      } else {
        checkSpell();
      }
    }
  });
}

function checkSpell() {
  if (SP.answered) {
    SP.idx++;
    renderSpellCard();
    return;
  }

  var p = SP.pairs[SP.idx];
  var input = E('spell-input');
  var answer = input.value.trim();
  var correct = answer.toLowerCase() === p.word.toLowerCase();
  var key = 'L' + SP.lvl + '_W' + p.lid;

  SP.answered = true;

  if (correct) {
    SP.correct++;
    input.classList.add('correct');
    input.disabled = true;
    setWordStatus(key, 'learning', 3, true);
    E('spell-answer').textContent = '';
  } else {
    input.classList.add('wrong');
    input.disabled = true;
    setWordStatus(key, 'learning', 0.15, false);
    E('spell-answer').textContent = '\u6b63\u786e\u7b54\u6848: ' + p.word;
  }

  E('spell-check-btn').textContent = '\u4e0b\u4e00\u9898 \u2192';
  E('spell-check-btn').onclick = function() {
    SP.idx++;
    renderSpellCard();
  };
}

function finishSpell() {
  var total = SP.pairs.length;
  var html = '<div class="text-center">';
  html += resultScreenHTML(SP.correct, total,
    'startSpell(' + currentLvl + ')',
    'openDeck(' + currentLvl + ')');
  html += '</div>';
  E('panel-spell').innerHTML = html;
  updateSidebar();
}
