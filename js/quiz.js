/* ══════════════════════════════════════════════════════════════
   quiz.js — Multiple choice quiz mode (4 options)
   ══════════════════════════════════════════════════════════════ */

var Q = { pairs: [], idx: 0, correct: 0, lvl: 0, locked: false };

function startQuiz(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  Q.pairs = shuffle(getPairs(lv.vocabulary));
  Q.idx = 0;
  Q.correct = 0;
  Q.lvl = li;
  Q.locked = false;

  showPanel('quiz');
  renderQuizCard();
}

function renderQuizCard() {
  if (Q.idx >= Q.pairs.length) { finishQuiz(); return; }

  var p = Q.pairs[Q.idx];
  var progress = Q.pairs.length > 0 ? Math.round(Q.idx / Q.pairs.length * 100) : 0;

  /* Generate 4 options: 1 correct + 3 random distractors */
  var allDefs = [];
  LEVELS.forEach(function(lv) {
    getPairs(lv.vocabulary).forEach(function(pp) {
      if (pp.def !== p.def) allDefs.push(pp.def);
    });
  });
  allDefs = shuffle(allDefs).slice(0, 3);
  var options = shuffle([p.def].concat(allDefs));

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + Q.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (Q.idx + 1) + ' / ' + Q.pairs.length + '</div>';
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="quiz-word">' + p.word + '</div>';
  html += '<div class="quiz-hint">' + t('Choose the correct definition', '\u9009\u62e9\u6b63\u786e\u7684\u4e2d\u6587\u91ca\u4e49') + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="quiz-options">';
  options.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-idx="' + i + '" data-correct="' + (opt === p.def ? '1' : '0') + '" data-def="' + opt.replace(/"/g, '&quot;') + '" onclick="pickQuizOpt(this)">' + opt + '</button>';
  });
  html += '</div>';

  E('panel-quiz').innerHTML = html;
  Q.locked = false;
}

function pickQuizOpt(btn) {
  if (Q.locked) return;
  Q.locked = true;

  var isCorrect = btn.dataset.correct === '1';
  var p = Q.pairs[Q.idx];
  var key = wordKey(Q.lvl, p.lid);

  if (isCorrect) {
    btn.classList.add('correct');
    Q.correct++;
    setWordStatus(key, Q.correct >= 2 ? 'mastered' : 'learning', isCorrect ? 7 : 0.5, true);
  } else {
    btn.classList.add('wrong');
    setWordStatus(key, 'learning', 0.15, false);
    /* Highlight correct answer */
    document.querySelectorAll('#quiz-options .quiz-opt').forEach(function(o) {
      if (o.dataset.correct === '1') o.classList.add('correct');
    });
  }

  setTimeout(function() {
    Q.idx++;
    renderQuizCard();
  }, 900);
}

function finishQuiz() {
  var total = Q.pairs.length;
  var html = '<div class="text-center">';
  html += resultScreenHTML(Q.correct, total,
    'startQuiz(' + currentLvl + ')',
    'openDeck(' + currentLvl + ')');
  html += '</div>';
  E('panel-quiz').innerHTML = html;
  updateSidebar();
}
