/* ══════════════════════════════════════════════════════════════
   practice.js — Exam practice mode (real exam-style MCQs + KaTeX)
   ══════════════════════════════════════════════════════════════ */

var _pqData = {};       /* { cie: [...], edx: [...] } lazy-loaded cache */
var _pqSession = null;  /* { questions, current, correct, answers, lvl } */
var _katexReady = false; /* KaTeX loaded flag */

/* ═══ KATEX LAZY LOADING ═══ */

function loadKaTeX() {
  if (_katexReady) return Promise.resolve();
  if (window._katexLoading) return window._katexLoading;

  window._katexLoading = new Promise(function(resolve) {
    /* CSS */
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(link);

    /* KaTeX core */
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
    script.onload = function() {
      /* Auto-render extension */
      var ar = document.createElement('script');
      ar.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
      ar.onload = function() {
        _katexReady = true;
        resolve();
      };
      document.head.appendChild(ar);
    };
    document.head.appendChild(script);
  });
  return window._katexLoading;
}

function renderMath(el) {
  if (!_katexReady || !window.renderMathInElement) return;
  try {
    window.renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  } catch(e) { /* ignore render errors */ }
}

/* ═══ DATA LOADING ═══ */

function loadPracticeData(board) {
  if (_pqData[board]) return Promise.resolve(_pqData[board]);
  var file = 'data/questions-' + board + '.json';
  return fetch(file).then(function(r) {
    if (!r.ok) throw new Error('Failed to load ' + file);
    return r.json();
  }).then(function(data) {
    _pqData[board] = data;
    return data;
  });
}

/* ═══ QUESTION SELECTION ═══ */

function getPracticeQuestions(board, category, count) {
  count = count || 10;
  var data = _pqData[board];
  if (!data) return [];
  var filtered = data.filter(function(q) { return q.cat === category; });
  return shuffle(filtered).slice(0, count);
}

/* ═══ START PRACTICE ═══ */

function startPractice(li) {
  var lv = LEVELS[li];
  if (!lv) return;
  var board = lv.board;
  if (board !== 'cie' && board !== 'edx') return;

  currentLvl = li;
  showToast(t('Loading questions...', '加载题目中...'));

  Promise.all([loadPracticeData(board), loadKaTeX()]).then(function() {
    var questions = getPracticeQuestions(board, lv.category, 10);
    if (questions.length === 0) {
      showToast(t('No practice questions available for this topic', '该主题暂无练习题'));
      return;
    }
    _pqSession = {
      questions: questions,
      current: 0,
      correct: 0,
      answers: [],
      lvl: li
    };
    showPanel('practice');
    renderPracticeCard();
  }).catch(function() {
    showToast(t('Failed to load questions', '加载题目失败'));
  });
}

/* ═══ RENDER CARD ═══ */

function renderPracticeCard() {
  if (!_pqSession) return;
  if (_pqSession.current >= _pqSession.questions.length) {
    finishPractice();
    return;
  }

  var s = _pqSession;
  var q = s.questions[s.current];
  var total = s.questions.length;
  var progress = Math.round(s.current / total * 100);

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + s.lvl + ')">←</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (s.current + 1) + ' / ' + total + '</div>';
  html += '</div>';

  /* Topic + difficulty tag */
  html += '<div class="pq-meta">';
  if (q.topic) html += '<span class="pq-topic">' + escapeHtml(q.topic) + '</span>';
  html += '<span class="pq-difficulty pq-d' + q.d + '">' + (q.d === 1 ? t('Core', '基础') : t('Extended', '拓展')) + '</span>';
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="pq-question">' + escapeHtml(q.q) + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="pq-options">';
  q.o.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-idx="' + i + '" onclick="pickPracticeOpt(this,' + i + ')">' + escapeHtml(opt) + '</button>';
  });
  html += '</div>';

  /* Explanation area (hidden until answer) */
  html += '<div class="pq-explanation" id="pq-explanation" style="display:none"></div>';

  /* Next button (hidden until answer) */
  html += '<div style="text-align:center;margin-top:16px">';
  html += '<button class="btn btn-primary pq-next-btn" id="pq-next" style="display:none" onclick="nextPracticeCard()">';
  html += (s.current + 1 < total) ? t('Next →', '下一题 →') : t('See Results', '查看结果');
  html += '</button></div>';

  E('panel-practice').innerHTML = html;
  renderMath(E('panel-practice'));
}

/* ═══ ANSWER HANDLING ═══ */

function pickPracticeOpt(btn, idx) {
  if (!_pqSession) return;
  var s = _pqSession;
  var q = s.questions[s.current];

  /* Prevent double-click */
  var opts = document.querySelectorAll('#pq-options .quiz-opt');
  var alreadyAnswered = false;
  opts.forEach(function(o) {
    if (o.classList.contains('correct') || o.classList.contains('wrong')) alreadyAnswered = true;
  });
  if (alreadyAnswered) return;

  var isCorrect = idx === q.a;
  s.answers.push({ qid: q.id, picked: idx, correct: isCorrect });

  if (isCorrect) {
    btn.classList.add('correct');
    s.correct++;
    playCorrect();
  } else {
    btn.classList.add('wrong');
    playWrong();
    /* Highlight correct answer */
    opts.forEach(function(o) {
      if (parseInt(o.dataset.idx) === q.a) o.classList.add('correct');
    });
  }

  /* Show explanation */
  if (q.e) {
    var expEl = document.getElementById('pq-explanation');
    if (expEl) {
      expEl.innerHTML = '<strong>' + t('Explanation', '解析') + ':</strong> ' + escapeHtml(q.e);
      expEl.style.display = 'block';
      renderMath(expEl);
    }
  }

  /* Show next button */
  var nextBtn = document.getElementById('pq-next');
  if (nextBtn) nextBtn.style.display = 'inline-block';
}

function nextPracticeCard() {
  if (!_pqSession) return;
  _pqSession.current++;
  renderPracticeCard();
}

/* ═══ FINISH ═══ */

function finishPractice() {
  if (!_pqSession) return;
  var s = _pqSession;
  markModeDone(s.lvl, 'practice');

  /* Save progress to localStorage */
  var lv = LEVELS[s.lvl];
  var pKey = lv.board + ':' + lv.category;
  var stored = {};
  try { stored = JSON.parse(localStorage.getItem('wmatch_practice') || '{}'); } catch(e) {}
  var prev = stored[pKey] || { total: 0, correct: 0 };
  stored[pKey] = {
    total: prev.total + s.questions.length,
    correct: prev.correct + s.correct,
    last: Date.now()
  };
  try { localStorage.setItem('wmatch_practice', JSON.stringify(stored)); } catch(e) {}

  /* Result screen */
  var total = s.questions.length;
  var raw = resultScreenHTML(s.correct, total,
    'startPractice(' + s.lvl + ')',
    'openDeck(' + s.lvl + ')', 'practice');

  var step = nextStepHTML('📖', t('Back to Study', '返回学习'), 'openDeck(' + s.lvl + ')');

  /* Wrong questions review list */
  var wrongHtml = '';
  var wrongOnes = s.answers.filter(function(a) { return !a.correct; });
  if (wrongOnes.length > 0) {
    wrongHtml += '<div class="pq-wrong-review">';
    wrongHtml += '<div style="font-weight:700;margin-bottom:8px">' + t('Questions to review:', '需要复习的题目：') + '</div>';
    wrongOnes.forEach(function(a) {
      var q = s.questions.filter(function(qq) { return qq.id === a.qid; })[0];
      if (!q) return;
      wrongHtml += '<div class="pq-wrong-item">';
      wrongHtml += '<div class="pq-wrong-q">' + escapeHtml(q.q) + '</div>';
      wrongHtml += '<div class="pq-wrong-a">✓ ' + escapeHtml(q.o[q.a]) + '</div>';
      wrongHtml += '</div>';
    });
    wrongHtml += '</div>';
  }

  var html = '<div class="text-center" style="padding-top:40px">';
  html += raw.replace('<div class="result-actions">', step + wrongHtml + '<div class="result-actions">');
  html += '</div>';

  E('panel-practice').innerHTML = html;
  renderMath(E('panel-practice'));
  updateSidebar();
  _pqSession = null;
}
