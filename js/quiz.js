/* ══════════════════════════════════════════════════════════════
   quiz.js — Multiple choice quiz mode (4 options, bidirectional)
   ══════════════════════════════════════════════════════════════ */

var Q = { pairs: [], idx: 0, correct: 0, lvl: 0, locked: false, dir: 'en2zh' };

function startQuiz(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  Q.pairs = shuffle(getPairs(lv.vocabulary));
  Q.idx = 0;
  Q.correct = 0;
  Q.lvl = li;
  Q.locked = false;
  Q.dir = 'en2zh';

  showPanel('quiz');
  renderQuizCard();
}

function setQuizDir(dir) {
  Q.dir = dir;
  Q.locked = false;
  renderQuizCard();
}

function renderQuizCard() {
  if (Q.idx >= Q.pairs.length) { finishQuiz(); return; }

  var p = Q.pairs[Q.idx];
  var progress = Q.pairs.length > 0 ? Math.round(Q.idx / Q.pairs.length * 100) : 0;

  /* Direction-dependent question/answer/options */
  var questionText, correctAnswer, hintText;
  var distractors = [];

  if (Q.dir === 'en2zh') {
    questionText = p.word;
    correctAnswer = p.def;
    hintText = t('Choose the correct definition', '\u9009\u62e9\u6b63\u786e\u7684\u4e2d\u6587\u91ca\u4e49');
    LEVELS.forEach(function(lv) {
      getPairs(lv.vocabulary).forEach(function(pp) {
        if (pp.def !== p.def) distractors.push(pp.def);
      });
    });
  } else {
    questionText = p.def;
    correctAnswer = p.word;
    hintText = t('Choose the correct English word', '\u9009\u62e9\u6b63\u786e\u7684\u82f1\u6587\u5355\u8bcd');
    LEVELS.forEach(function(lv) {
      getPairs(lv.vocabulary).forEach(function(pp) {
        if (pp.word !== p.word) distractors.push(pp.word);
      });
    });
  }

  /* Deduplicate distractors */
  var seen = {};
  seen[correctAnswer] = true;
  var uniqueDistractors = [];
  for (var d = 0; d < distractors.length; d++) {
    if (!seen[distractors[d]]) {
      seen[distractors[d]] = true;
      uniqueDistractors.push(distractors[d]);
    }
  }
  uniqueDistractors = shuffle(uniqueDistractors).slice(0, 3);
  var options = shuffle([correctAnswer].concat(uniqueDistractors));

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + Q.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (Q.idx + 1) + ' / ' + Q.pairs.length + '</div>';
  html += '</div>';

  /* Direction bar */
  html += '<div class="quiz-dir-bar">';
  html += '<button class="quiz-dir-btn' + (Q.dir === 'en2zh' ? ' active' : '') + '" onclick="setQuizDir(\'en2zh\')">EN \u2192 ' + t('CN', '\u4e2d') + '</button>';
  html += '<button class="quiz-dir-btn' + (Q.dir === 'zh2en' ? ' active' : '') + '" onclick="setQuizDir(\'zh2en\')">' + t('CN', '\u4e2d') + ' \u2192 EN</button>';
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="quiz-word">' + questionText + '</div>';
  html += '<div class="quiz-hint">' + hintText + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="quiz-options">';
  options.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-idx="' + i + '" data-correct="' + (opt === correctAnswer ? '1' : '0') + '" onclick="pickQuizOpt(this)">' + opt + '</button>';
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
    playCorrect();
  } else {
    btn.classList.add('wrong');
    setWordStatus(key, 'learning', 0.15, false);
    playWrong();
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
