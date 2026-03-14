/* ══════════════════════════════════════════════════════════════
   spell.js — Spelling mode (type the English word)
   ══════════════════════════════════════════════════════════════ */

/* ═══ SPEECH SYNTHESIS ═══ */
function canSpeak() { return !!window.speechSynthesis; }

function speakWord(text) {
  if (!appSound || !canSpeak()) return;
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

var SP = { pairs: [], idx: 0, correct: 0, lvl: 0, answered: false };
var _spellDelegated = false;

function startSpell(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  SP.pairs = shuffle(getPairs(lv.vocabulary));
  SP.idx = 0;
  SP.correct = 0;
  SP.lvl = li;
  SP.answered = false;
  SP.wrongPairs = [];

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
  html += '<div class="spell-def">' + escapeHtml(p.def) + (canSpeak() ? ' <button class="btn-speak" data-speak="' + escapeHtml(p.word) + '" title="' + t('Listen', '\u53d1\u97f3') + '">\ud83d\udd0a</button>' : '') + '</div>';
  html += '<div class="spell-hint">' + hint + '</div>';
  html += '</div>';

  /* Input */
  html += '<div class="spell-input-wrap">';
  html += '<input type="text" class="spell-input" id="spell-input" placeholder="' + t('Type the English word...', '\u8f93\u5165\u82f1\u6587\u5355\u8bcd...') + '" autocomplete="off" autocapitalize="off">';
  html += '</div>';

  html += '<div class="spell-answer" id="spell-answer"></div>';

  html += '<div class="text-center">';
  html += '<button class="btn btn-primary" id="spell-check-btn" onclick="checkSpell()">' + t('Check', '\u68c0\u67e5') + '</button>';
  html += '</div>';

  E('panel-spell').innerHTML = html;
  SP.answered = false;

  /* Delegated click for speak button (bind once) */
  if (!_spellDelegated) {
    E('panel-spell').addEventListener('click', function(e) {
      var btn = e.target.closest('[data-speak]');
      if (btn) speakWord(btn.dataset.speak);
    });
    _spellDelegated = true;
  }

  /* Focus input and bind Enter key */
  var input = E('spell-input');
  setTimeout(function() { if (input) input.focus(); }, 100);

  /* Auto-speak word */
  if (appSound && canSpeak()) {
    setTimeout(function() { speakWord(p.word); }, 300);
  }
  if (input && !input._bound) {
    input._bound = true;
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
  var key = wordKey(SP.lvl, p.lid);

  SP.answered = true;

  if (correct) {
    SP.correct++;
    input.classList.add('correct');
    input.disabled = true;
    recordAnswer(key, 'spell', true);
    E('spell-answer').textContent = '';
    playCorrect();
  } else {
    input.classList.add('wrong');
    input.disabled = true;
    SP.wrongPairs.push(SP.pairs[SP.idx]);
    recordAnswer(key, 'spell', false);
    E('spell-answer').textContent = t('Answer: ', '\u6b63\u786e\u7b54\u6848: ') + p.word;
    playWrong();
  }

  E('spell-check-btn').textContent = t('Next \u2192', '\u4e0b\u4e00\u9898 \u2192');
  E('spell-check-btn').onclick = function() {
    SP.idx++;
    renderSpellCard();
  };
}

function finishSpell() {
  markModeDone(currentLvl, 'spell');
  var total = SP.pairs.length;
  var scoreRate = total > 0 ? SP.correct / total : 0;
  var raw = resultScreenHTML(SP.correct, total,
    'startSpell(' + currentLvl + ')',
    'openDeck(' + currentLvl + ')', 'spell');
  var _sectionStep = typeof sectionNextStepHTML === 'function' ? sectionNextStepHTML('spell', scoreRate) : '';
  var step = _sectionStep || nextStepHTML('\ud83d\udcd6', t('Study to consolidate', '\u5b66\u4e60\u5de9\u56fa\u8bb0\u5fc6'), '_lazyCall(\"study-quiz-battle\",\"startStudy\",[' + currentLvl + '])');
  var wrongBtn = '';
  if (SP.wrongPairs.length > 0) {
    wrongBtn = '<button class="btn btn-secondary" onclick="studyWrongSpell()">\ud83d\udcd6 ' + t('Review missed words', '\u590d\u4e60\u5f85\u52a0\u5f3a\u7684\u8bcd') + '</button>';
  }
  var html = '<div class="text-center">';
  html += raw.replace('<div class="result-actions">', step + '<div class="result-actions">' + wrongBtn);
  html += '</div>';
  E('panel-spell').innerHTML = html;
  updateSidebar();
}

function studyWrongSpell() {
  _lazyCall('study-quiz-battle', 'startStudy', [currentLvl, SP.wrongPairs]);
}
