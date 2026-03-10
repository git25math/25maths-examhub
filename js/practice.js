/* ══════════════════════════════════════════════════════════════
   practice.js — Exam practice mode (real exam-style MCQs + KaTeX)
   + question error reporting + admin rich-text editor
   ══════════════════════════════════════════════════════════════ */

var _pqData = {};       /* { cie: [...], edx: [...] } lazy-loaded cache */
var _pqSession = null;  /* { questions, current, correct, answers, lvl } */
var _katexReady = false; /* KaTeX loaded flag */
var _pqEditsCache = {};  /* { cie: {qid: data}, edx: {qid: data} } */
var _pqFocusedTextarea = null; /* last focused textarea in editor */
var _pqPreviewTimer = null;
var _pqEditorSaveCb = null;   /* optional callback after editor save */
var _pqEditorQid = null;      /* qid of question currently in editor */
var _pqReviewState = null;    /* { li, questions, board } — current review context */
var _pqReviewFilter = 'all';  /* 'all' | 1 (Core) | 2 (Extended) */
var _pqReviewTopicFilter = 'all'; /* 'all' | topic name string */
var _pqReviewDelegated = false; /* event delegation bound flag */

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
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  } catch(e) { /* ignore render errors */ }
}

/* ═══ RICH TEXT SANITIZER ═══ */

var PQ_ALLOWED_TAGS = { b:1, i:1, em:1, strong:1, br:1, sub:1, sup:1, img:1, u:1 };
var PQ_IMG_ATTRS = { src:1, alt:1, class:1 };

function pqSanitize(html) {
  if (!html) return '';
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  _pqSanitizeNode(tmp);
  return tmp.innerHTML;
}

function _pqSanitizeNode(parent) {
  var children = Array.prototype.slice.call(parent.childNodes);
  for (var i = 0; i < children.length; i++) {
    var node = children[i];
    if (node.nodeType === 3) continue; /* text node */
    if (node.nodeType !== 1) { parent.removeChild(node); continue; }
    var tag = node.tagName.toLowerCase();
    if (!PQ_ALLOWED_TAGS[tag]) {
      /* Replace disallowed tag with its text content */
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    } else {
      /* Strip disallowed attributes */
      var attrs = Array.prototype.slice.call(node.attributes);
      for (var j = 0; j < attrs.length; j++) {
        if (tag === 'img' && PQ_IMG_ATTRS[attrs[j].name]) continue;
        node.removeAttribute(attrs[j].name);
      }
      /* Sanitize img src (only allow https) */
      if (tag === 'img') {
        var src = node.getAttribute('src') || '';
        if (src.indexOf('https://') !== 0 && src.indexOf('data:image/') !== 0) {
          parent.removeChild(node);
          continue;
        }
      }
      _pqSanitizeNode(node);
    }
  }
}

function pqRender(text) {
  if (!text) return '';
  /* If text has no HTML tags, fast-path escape */
  if (text.indexOf('<') === -1) return escapeHtml(text);
  return pqSanitize(text);
}

/* ═══ DATA LOADING + QUESTION EDITS MERGE ═══ */

function loadQuestionEdits(board) {
  if (_pqEditsCache[board]) return Promise.resolve(_pqEditsCache[board]);
  if (!sb) return Promise.resolve({});
  return sb.from('question_edits').select('qid,data,status').eq('board', board)
    .then(function(res) {
      var map = {};
      if (res.data) res.data.forEach(function(row) {
        map[row.qid] = Object.assign({}, row.data, { status: row.status });
      });
      _pqEditsCache[board] = map;
      return map;
    }).catch(function() { return {}; });
}

function loadPracticeData(board) {
  if (_pqData[board]) return Promise.resolve(_pqData[board]);
  var file = 'data/questions-' + board + '.json';
  return Promise.all([
    fetch(file).then(function(r) {
      if (!r.ok) throw new Error('Failed to load ' + file);
      return r.json();
    }),
    loadQuestionEdits(board)
  ]).then(function(results) {
    var base = results[0];
    var edits = results[1];
    /* Merge: edits override base fields */
    base.forEach(function(q, i) {
      if (edits[q.id]) {
        var ed = edits[q.id];
        base[i] = Object.assign({}, q, ed);
        /* Preserve original id */
        base[i].id = q.id;
      }
    });
    /* Filter hidden questions (from JSON status or question_edits) */
    base = base.filter(function(q) {
      if (q.status === 'hidden') return false;
      return !edits[q.id] || edits[q.id].status !== 'hidden';
    });
    _pqData[board] = base;
    return base;
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

/* Get questions filtered by syllabus section */
function getPracticeBySection(board, sectionId, count) {
  count = count || 10;
  var data = _pqData[board];
  if (!data) return [];
  var filtered = data.filter(function(q) { return q.s === sectionId; });
  return shuffle(filtered).slice(0, count);
}

/* Get questions filtered by syllabus chapter */
function getPracticeByChapter(board, chNum, count) {
  count = count || 10;
  var data = _pqData[board];
  if (!data) return [];
  var prefix = chNum + '.';
  var filtered = data.filter(function(q) { return q.s && q.s.indexOf(prefix) === 0; });
  return shuffle(filtered).slice(0, count);
}

/* ═══ DIAGNOSTIC FEEDBACK (HHK) ═══ */

var _DIAG_LABELS = {
  vocab:   { icon: '\ud83d\udcd6', en: 'Review the key vocabulary for this topic', zh: '\u590d\u4e60\u8fd9\u4e2a\u77e5\u8bc6\u70b9\u7684\u5173\u952e\u8bcd\u6c47' },
  concept: { icon: '\ud83d\udca1', en: 'The concept needs strengthening', zh: '\u6982\u5ff5\u9700\u8981\u5de9\u56fa' },
  calc:    { icon: '\ud83d\udd22', en: 'Correct method \u2014 watch the calculation', zh: '\u65b9\u6cd5\u6b63\u786e\uff0c\u6ce8\u610f\u8ba1\u7b97' },
  logic:   { icon: '\ud83e\udde9', en: 'Check your reasoning steps', zh: '\u68c0\u67e5\u63a8\u7406\u6b65\u9aa4' }
};

function _diagFeedback(q) {
  var d = _DIAG_LABELS[q.diag];
  if (!d) return '';
  return '<div class="pq-diag-hint" style="margin-top:8px;padding:8px 12px;border-radius:8px;background:var(--c-surface-alt);font-size:13px">' +
    d.icon + ' <em>' + t(d.en, d.zh) + '</em></div>';
}

function _diagSummary(answers, questions) {
  var counts = {};
  var wrong = answers.filter(function(a) { return !a.correct; });
  if (wrong.length === 0) return '';
  for (var i = 0; i < wrong.length; i++) {
    var q = null;
    for (var j = 0; j < questions.length; j++) {
      if (questions[j].id === wrong[i].qid) { q = questions[j]; break; }
    }
    if (q && q.diag) {
      counts[q.diag] = (counts[q.diag] || 0) + 1;
    }
  }
  var keys = Object.keys(counts);
  if (keys.length === 0) return '';
  var html = '<div class="pq-diag-summary">';
  html += '<div class="fw-700 mb-8">' + t('Diagnostic Analysis', '\u8bca\u65ad\u5206\u6790') + '</div>';
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var dl = _DIAG_LABELS[key];
    if (!dl) continue;
    html += '<div class="pp-diag-row">';
    html += '<span>' + dl.icon + '</span>';
    html += '<span>' + t(dl.en, dl.zh) + '</span>';
    html += '<span style="color:var(--c-danger);font-weight:600">(' + counts[key] + ')</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ═══ START PRACTICE ═══ */

function startPractice(li) {
  var lv = LEVELS[li];
  if (!lv) return;
  var board = lv.board;
  if (board !== 'cie' && board !== 'edx' && board !== '25m') return;

  currentLvl = li;
  showToast(t('Loading questions...', '加载题目中...'));

  Promise.all([loadPracticeData(board), loadKaTeX()]).then(function() {
    var questions;
    /* Resolve practice board (edexcel syllabus uses 'edx' for questions) */
    var pqBoard = board;
    if (window._practiceBoard === 'edexcel') pqBoard = 'edx';
    /* Capture section context before clearing (for smart next-step) */
    var _capturedSection = window._practiceSection || null;
    var _capturedBoard = window._practiceBoard || null;
    /* Section/chapter filtering for syllabus mode (CIE + Edexcel) */
    if (window._practiceSection) {
      questions = getPracticeBySection(pqBoard, window._practiceSection, 10);
      window._practiceSection = null;
      window._practiceBoard = null;
    } else if (window._practiceChapter) {
      questions = getPracticeByChapter(pqBoard, window._practiceChapter, 10);
      window._practiceChapter = null;
      window._practiceBoard = null;
    } else if (lv._isSection && lv._section) {
      questions = getPracticeBySection(board, lv._section, 10);
    } else {
      questions = getPracticeQuestions(board, lv.category, 10);
    }
    if (questions.length === 0) {
      showToast(t('No practice questions available for this topic', '该主题暂无练习题'));
      return;
    }
    _pqSession = {
      questions: questions,
      current: 0,
      correct: 0,
      answers: [],
      lvl: li,
      sectionId: _capturedSection || (lv._isSection ? lv._section : null),
      sectionBoard: _capturedBoard || board,
      kpReturn: window._kpReturnContext || null
    };
    window._kpReturnContext = null;
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
  if (s.kpReturn) {
    html += '<button class="back-btn" onclick="openKnowledgePoint(\'' + s.kpReturn.kpId + '\',\'' + s.kpReturn.board + '\')">←</button>';
  } else {
    html += '<button class="back-btn" onclick="openDeck(' + s.lvl + ')">←</button>';
  }
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (s.current + 1) + ' / ' + total + '</div>';
  html += '</div>';

  /* Topic + difficulty tag */
  html += '<div class="pq-meta">';
  if (q.topic) html += '<span class="pq-topic">' + escapeHtml(q.topic) + '</span>';
  html += '<span class="pq-difficulty pq-d' + q.d + '">' + (q.d === 1 ? t('Core', '基础') : t('Extended', '拓展')) + '</span>';
  html += '<span class="pq-qid" style="font-size:10px;color:var(--c-muted)">#' + escapeHtml(q.id) + '</span>';
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="pq-question">' + pqRender(q.q) + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="pq-options">';
  q.o.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-idx="' + i + '" onclick="pickPracticeOpt(this,' + i + ')">' + pqRender(opt) + '</button>';
  });
  html += '</div>';

  /* Explanation area (hidden until answer) */
  html += '<div class="pq-explanation d-none" id="pq-explanation"></div>';

  /* Next button (hidden until answer) */
  html += '<div class="text-center mt-16">';
  html += '<button class="btn btn-primary pq-next-btn d-none" id="pq-next" onclick="nextPracticeCard()">';
  html += (s.current + 1 < total) ? t('Next →', '下一题 →') : t('See Results', '查看结果');
  html += '</button></div>';

  /* Report + Edit buttons */
  html += '<div class="pq-report-row">';
  html += '<button class="pq-report-btn" onclick="reportPracticeQ()">\ud83d\udea9 ' + t('Report error', '报告错误') + '</button>';
  if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    html += '<button class="pq-edit-btn" onclick="editPracticeQ()">\u270f\ufe0f ' + t('Edit', '编辑') + '</button>';
  }
  html += '</div>';

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
    /* Auto-add to wrong book for HHK/MCQ practice */
    if (typeof ppAddToWrongBook === 'function') {
      ppAddToWrongBook(q.id, q.diag || '', '', q.s || '', _pqSession ? (_pqSession.board || '') : '');
    }
  }

  /* Show explanation */
  if (q.e) {
    var expEl = document.getElementById('pq-explanation');
    if (expEl) {
      var expHtml = '<strong>' + t('Explanation', '\u89e3\u6790') + ':</strong> ' + pqRender(q.e);
      /* Diagnostic feedback for HHK questions */
      if (q.diag && !isCorrect) {
        expHtml += _diagFeedback(q);
      }
      expEl.innerHTML = expHtml;
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
  if (typeof checkSectionMilestone === 'function') checkSectionMilestone();

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
  var _kpBackAction = s.kpReturn ? 'openKnowledgePoint(\'' + s.kpReturn.kpId + '\',\'' + s.kpReturn.board + '\')' : 'openDeck(' + s.lvl + ')';
  var raw = resultScreenHTML(s.correct, total,
    'startPractice(' + s.lvl + ')',
    _kpBackAction, 'practice');

  /* Smart next step: context-aware recommendation */
  var step;
  if (s.kpReturn) {
    step = nextStepHTML('\ud83d\udcd6', t('Back to Knowledge Point', '\u8fd4\u56de\u77e5\u8bc6\u70b9'), 'openKnowledgePoint(\'' + s.kpReturn.kpId + '\',\'' + s.kpReturn.board + '\')');
  } else {
    var _ppBoardKey = s.sectionBoard === 'edexcel' ? 'edx' : s.sectionBoard;
    if (s.sectionId && typeof startPastPaper === 'function' && typeof _ppData !== 'undefined' && _ppData[_ppBoardKey] && _ppAccessAllowed(_ppBoardKey)) {
      var _ppCheck = getPPBySection(_ppBoardKey, s.sectionId);
      if (_ppCheck && _ppCheck.length > 0) {
        step = nextStepHTML('\ud83d\udcc4', t('Try Past Papers', '\u5c1d\u8bd5\u771f\u9898'), 'startPastPaper(\'' + s.sectionId + '\',\'' + s.sectionBoard + '\',\'practice\')');
      } else {
        step = nextStepHTML('\ud83d\udcd8', t('Back to Section', '\u8fd4\u56de\u77e5\u8bc6\u70b9'), 'openSection(\'' + s.sectionId + '\',\'' + s.sectionBoard + '\')');
      }
    } else if (s.sectionId) {
      step = nextStepHTML('\ud83d\udcd8', t('Back to Section', '\u8fd4\u56de\u77e5\u8bc6\u70b9'), 'openSection(\'' + s.sectionId + '\',\'' + s.sectionBoard + '\')');
    } else {
      step = nextStepHTML('\ud83d\udcd6', t('Back to Study', '\u8fd4\u56de\u5b66\u4e60'), 'openDeck(' + s.lvl + ')');
    }
  }

  /* Wrong questions review list */
  var wrongHtml = '';
  var wrongOnes = s.answers.filter(function(a) { return !a.correct; });
  if (wrongOnes.length > 0) {
    wrongHtml += '<div class="pq-wrong-review">';
    wrongHtml += '<div class="fw-700 mb-8">' + t('Questions to review:', '需要复习的题目：') + '</div>';
    wrongOnes.forEach(function(a) {
      var q = s.questions.filter(function(qq) { return qq.id === a.qid; })[0];
      if (!q) return;
      wrongHtml += '<div class="pq-wrong-item">';
      wrongHtml += '<div class="pq-wrong-q">' + pqRender(q.q) + '</div>';
      wrongHtml += '<div class="pq-wrong-a">\u2713 ' + pqRender(q.o[q.a]) + '</div>';
      wrongHtml += '</div>';
    });
    wrongHtml += '</div>';
  }

  /* Diagnostic summary (HHK questions with diag field) */
  var diagHtml = _diagSummary(s.answers, s.questions);

  var html = '<div class="text-center pt-40">';
  html += raw.replace('<div class="result-actions">', diagHtml + step + wrongHtml + '<div class="result-actions">');
  html += '</div>';

  E('panel-practice').innerHTML = html;
  renderMath(E('panel-practice'));
  updateSidebar();
  _pqSession = null;
}

/* ═══ REPORT ERROR (all users) ═══ */

function reportPracticeQ() {
  if (!_pqSession) return;
  var q = _pqSession.questions[_pqSession.current];
  if (!q) return;

  var types = [
    ['answer', t('Wrong answer', '答案错误')],
    ['question', t('Question error', '题目有误')],
    ['formula', t('Formula rendering issue', '公式渲染问题')],
    ['other', t('Other', '其他')]
  ];
  var typeOpts = types.map(function(tp) {
    return '<option value="' + tp[0] + '">' + tp[1] + '</option>';
  }).join('');

  var board = LEVELS[_pqSession.lvl] ? LEVELS[_pqSession.lvl].board : '';

  var html = '<div class="section-title">\ud83d\udea9 ' + t('Report Question Error', '报告题目错误') + '</div>';
  html += '<div style="text-align:left;margin-bottom:12px;padding:10px;background:var(--c-surface-alt);border-radius:var(--r);font-size:12px">';
  html += '<strong>#' + escapeHtml(q.id) + '</strong> · ' + escapeHtml(q.topic || '') + '<br>';
  html += '<span class="text-sub">' + escapeHtml(q.q.substring(0, 80)) + (q.q.length > 80 ? '...' : '') + '</span>';
  html += '</div>';
  html += '<label class="settings-label">' + t('Error type', '错误类型') + '</label>';
  html += '<select class="bug-select" id="pq-report-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '描述') + ' *</label>';
  html += '<textarea class="bug-textarea" id="pq-report-desc" rows="3" placeholder="' + t('Describe the error...', '请描述错误...') + '"></textarea>';
  html += '<div id="pq-report-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div class="btn-row">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '提交') : t('Submit via Email', '通过邮件提交');
  html += '<button class="btn btn-primary" onclick="submitPracticeReport()">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';
  showModal(html);
}

function submitPracticeReport() {
  var desc = E('pq-report-desc').value.trim();
  if (!desc) {
    E('pq-report-msg').textContent = t('Please describe the error', '请描述错误');
    return;
  }
  var type = E('pq-report-type').value;
  var q = _pqSession ? _pqSession.questions[_pqSession.current] : null;
  if (!q) { hideModal(); return; }
  var board = LEVELS[_pqSession.lvl] ? LEVELS[_pqSession.lvl].board : '';

  /* Logged-in users: save to DB */
  if (sb && isLoggedIn() && !isGuest()) {
    sb.from('feedback').insert({
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'question',
      description: desc,
      steps: type,
      auto_info: { qid: q.id, board: board, q: q.q, o: q.o, a: q.a, e: q.e }
    }).then(function(res) {
      if (res.error) {
        E('pq-report-msg').textContent = t('Submit failed: ', '提交失败：') + res.error.message;
        return;
      }
      hideModal();
      showToast(t('Report submitted! Thank you.', '报告已提交，谢谢！'));
    }).catch(function(e) {
      var el = E('pq-report-msg');
      if (el) el.textContent = t('Network error', '网络错误');
    });
    return;
  }

  /* Guest: mailto fallback */
  var subject = '[Question Error] #' + q.id + ' - 25Maths Keywords';
  var body = 'Question ID: ' + q.id + '\nBoard: ' + board +
    '\nError type: ' + type + '\n\nDescription:\n' + desc +
    '\n\n--- Question Data ---\n' + q.q +
    '\nOptions: ' + q.o.join(' | ') +
    '\nCorrect: ' + q.o[q.a];
  var mailto = 'mailto:support@25maths.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailto, '_blank');
  hideModal();
  showToast(t('Opening email client...', '正在打开邮件客户端...'));
}

/* ═══ ADMIN EDITOR ═══ */

function editPracticeQ() {
  if (!_pqSession || !isSuperAdmin()) return;
  var q = _pqSession.questions[_pqSession.current];
  if (!q) return;
  var board = LEVELS[_pqSession.lvl] ? LEVELS[_pqSession.lvl].board : '';
  _openEditor(q, board);
}

function _openEditor(q, board, onSaveCb) {
  if (!q || !isSuperAdmin()) return;
  _pqEditorSaveCb = onSaveCb || null;
  _pqEditorQid = q.id;

  var html = '<div class="modal-card pq-editor-modal" onclick="event.stopPropagation()">';
  /* Header */
  html += '<div class="pq-editor-header">';
  html += '<div class="section-title" style="margin:0">\u270f\ufe0f ' + t('Edit Question', '编辑题目') + ' <span style="color:var(--c-muted);font-size:13px">#' + escapeHtml(q.id) + '</span></div>';
  html += '</div>';

  /* Toolbar */
  html += '<div class="pq-editor-toolbar">';
  html += '<button type="button" onclick="pqToolBold()" title="Bold"><b>B</b></button>';
  html += '<button type="button" onclick="pqToolItalic()" title="Italic"><i>I</i></button>';
  html += '<button type="button" onclick="pqToolSub()" title="Subscript">X<sub>2</sub></button>';
  html += '<button type="button" onclick="pqToolSup()" title="Superscript">X<sup>2</sup></button>';
  html += '<button type="button" onclick="pqToolFormula()" title="Formula">\u2211</button>';
  html += '<button type="button" onclick="pqToolImage()" title="Image">\ud83d\uddbc\ufe0f</button>';
  html += '</div>';

  /* Split: edit + preview */
  html += '<div class="pq-editor-split">';

  /* Left: edit fields */
  html += '<div class="pq-editor-fields">';
  html += _pqFieldGroup(t('Question', '题干'), 'pq-ed-q', q.q, 3);
  var optLabels = ['A', 'B', 'C', 'D'];
  for (var i = 0; i < q.o.length; i++) {
    html += _pqFieldGroup(t('Option ', '选项 ') + optLabels[i], 'pq-ed-o' + i, q.o[i], 1);
  }
  /* Correct answer radio */
  html += '<div class="pq-field-group"><label class="pq-field-label">' + t('Correct Answer', '正确答案') + '</label>';
  html += '<div class="btn-row btn-row--mt0 btn-row--gap12">';
  for (var j = 0; j < q.o.length; j++) {
    html += '<label style="font-size:13px;cursor:pointer"><input type="radio" name="pq-ed-correct" value="' + j + '"' + (j === q.a ? ' checked' : '') + '> ' + optLabels[j] + '</label>';
  }
  html += '</div></div>';
  html += _pqFieldGroup(t('Explanation', '解析'), 'pq-ed-e', q.e || '', 3);
  /* Difficulty */
  html += '<div class="pq-field-group"><label class="pq-field-label">' + t('Difficulty', '难度') + '</label>';
  html += '<select id="pq-ed-d" class="bug-select" style="margin-bottom:0">';
  html += '<option value="1"' + (q.d === 1 ? ' selected' : '') + '>Core / ' + t('Core', '基础') + '</option>';
  html += '<option value="2"' + (q.d === 2 ? ' selected' : '') + '>Extended / ' + t('Extended', '拓展') + '</option>';
  html += '</select></div>';
  /* Status */
  html += '<div class="pq-field-group"><label class="pq-field-label">' + t('Status', '状态') + '</label>';
  html += '<select id="pq-ed-status" class="bug-select" style="margin-bottom:0">';
  html += '<option value="active">' + t('Active', '正常') + '</option>';
  html += '<option value="hidden">' + t('Hidden', '隐藏') + '</option>';
  html += '</select></div>';
  html += '</div>'; /* end fields */

  /* Right: preview */
  html += '<div class="pq-editor-preview" id="pq-ed-preview"></div>';
  html += '</div>'; /* end split */

  /* Formula popup (hidden) */
  html += '<div class="pq-formula-popup d-none" id="pq-formula-popup">';
  html += '<label class="pq-field-label">LaTeX</label>';
  html += '<textarea id="pq-formula-input" class="bug-textarea font-mono" rows="2" placeholder="\\frac{1}{2}"></textarea>';
  html += '<div class="pq-formula-preview" id="pq-formula-preview"></div>';
  html += '<div class="btn-row btn-row--mt8">';
  html += '<button class="btn btn-primary btn-sm" onclick="pqInsertFormula()">' + t('Insert', '插入') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" onclick="pqCloseFormula()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';

  /* Hidden file input for image upload */
  html += '<input type="file" id="pq-img-input" accept="image/*" class="d-none" onchange="pqUploadImage(this)">';

  /* Footer buttons */
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" onclick="savePracticeEdit(\'' + escapeHtml(q.id) + '\',\'' + escapeHtml(board) + '\')">\ud83d\udcbe ' + t('Save to DB', '保存到数据库') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  html += '</div>'; /* end modal-card */

  /* Show in a custom wider modal */
  E('modal-card').className = 'modal-card pq-editor-modal';
  showModal(html);

  /* Bind input events for live preview (use { once: false } style, elements are recreated each time) */
  setTimeout(function() {
    var fields = ['pq-ed-q', 'pq-ed-o0', 'pq-ed-o1', 'pq-ed-o2', 'pq-ed-o3', 'pq-ed-e'];
    fields.forEach(function(fid) {
      var el = E(fid);
      if (el) {
        el.oninput = _pqUpdatePreviewDebounced;
        el.onfocus = function() { _pqFocusedTextarea = this; };
      }
    });
    var radios = document.querySelectorAll('[name="pq-ed-correct"]');
    radios.forEach(function(r) { r.onchange = _pqUpdatePreview; });
    var dSel = E('pq-ed-d');
    if (dSel) dSel.onchange = _pqUpdatePreview;
    _pqUpdatePreview();
  }, 50);
}

function _pqFieldGroup(label, id, value, rows) {
  var h = '<div class="pq-field-group">';
  h += '<label class="pq-field-label" for="' + id + '">' + label + '</label>';
  h += '<textarea id="' + id + '" class="pq-ed-textarea" rows="' + rows + '">' + escapeHtml(value) + '</textarea>';
  h += '</div>';
  return h;
}

function _pqUpdatePreviewDebounced() {
  clearTimeout(_pqPreviewTimer);
  _pqPreviewTimer = setTimeout(_pqUpdatePreview, 300);
}

function _pqUpdatePreview() {
  var prev = E('pq-ed-preview');
  if (!prev) return;
  var qText = E('pq-ed-q') ? E('pq-ed-q').value : '';
  var opts = [];
  for (var i = 0; i < 4; i++) {
    var el = E('pq-ed-o' + i);
    opts.push(el ? el.value : '');
  }
  var correctIdx = 0;
  var radios = document.querySelectorAll('[name="pq-ed-correct"]');
  radios.forEach(function(r) { if (r.checked) correctIdx = parseInt(r.value); });
  var expText = E('pq-ed-e') ? E('pq-ed-e').value : '';
  var dVal = E('pq-ed-d') ? E('pq-ed-d').value : '1';
  var labels = ['A', 'B', 'C', 'D'];

  var h = '';
  h += '<div class="pq-preview-section">';
  h += '<div class="pq-preview-label">' + t('Question', '题干') + '</div>';
  h += '<div class="pq-preview-content pq-question" style="margin-bottom:12px">' + pqRender(qText) + '</div>';
  h += '</div>';

  h += '<div class="pq-preview-section">';
  h += '<div class="pq-preview-label">' + t('Options', '选项') + '</div>';
  for (var j = 0; j < opts.length; j++) {
    var cls = j === correctIdx ? ' style="color:var(--c-success);font-weight:600"' : '';
    h += '<div' + cls + '>' + labels[j] + ') ' + pqRender(opts[j]) + (j === correctIdx ? ' \u2713' : '') + '</div>';
  }
  h += '</div>';

  if (expText) {
    h += '<div class="pq-preview-section">';
    h += '<div class="pq-preview-label">' + t('Explanation', '解析') + '</div>';
    h += '<div class="pq-preview-content">' + pqRender(expText) + '</div>';
    h += '</div>';
  }

  h += '<div class="pq-preview-section">';
  h += '<div class="pq-preview-label">' + t('Difficulty', '难度') + ': ' + (dVal === '1' ? 'Core' : 'Extended') + '</div>';
  h += '</div>';

  prev.innerHTML = h;
  renderMath(prev);
}

/* ═══ EDITOR TOOLBAR ACTIONS ═══ */

function _pqWrapSelection(before, after) {
  var ta = _pqFocusedTextarea;
  if (!ta) return;
  var start = ta.selectionStart;
  var end = ta.selectionEnd;
  var text = ta.value;
  var selected = text.substring(start, end);
  ta.value = text.substring(0, start) + before + selected + after + text.substring(end);
  ta.selectionStart = start + before.length;
  ta.selectionEnd = start + before.length + selected.length;
  ta.focus();
  _pqUpdatePreview();
}

function _pqInsertAtCursor(text) {
  var ta = _pqFocusedTextarea;
  if (!ta) return;
  var start = ta.selectionStart;
  var val = ta.value;
  ta.value = val.substring(0, start) + text + val.substring(start);
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.focus();
  _pqUpdatePreview();
}

function pqToolBold() { _pqWrapSelection('<b>', '</b>'); }
function pqToolItalic() { _pqWrapSelection('<i>', '</i>'); }
function pqToolSub() { _pqWrapSelection('<sub>', '</sub>'); }
function pqToolSup() { _pqWrapSelection('<sup>', '</sup>'); }

function pqToolFormula() {
  var popup = E('pq-formula-popup');
  if (popup) {
    popup.style.display = 'block';
    var inp = E('pq-formula-input');
    if (inp) {
      inp.value = '';
      inp.focus();
      inp.removeEventListener('input', _pqPreviewFormula);
      inp.addEventListener('input', _pqPreviewFormula);
    }
    var prev = E('pq-formula-preview');
    if (prev) prev.innerHTML = '';
  }
}

function _pqPreviewFormula() {
  var inp = E('pq-formula-input');
  var prev = E('pq-formula-preview');
  if (!inp || !prev) return;
  var latex = inp.value.trim();
  if (!latex) { prev.innerHTML = ''; return; }
  try {
    if (window.katex) {
      prev.innerHTML = '';
      window.katex.render(latex, prev, { throwOnError: false, displayMode: true });
    }
  } catch(e) {
    prev.textContent = 'Error: ' + e.message;
  }
}

function pqInsertFormula() {
  var inp = E('pq-formula-input');
  var latex = inp ? inp.value.trim() : '';
  if (latex) {
    _pqInsertAtCursor('$' + latex + '$');
  }
  pqCloseFormula();
}

function pqCloseFormula() {
  var popup = E('pq-formula-popup');
  if (popup) popup.style.display = 'none';
}

function pqToolImage() {
  var inp = E('pq-img-input');
  if (inp) inp.click();
}

function pqUploadImage(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (!sb || !isSuperAdmin()) { showToast('Not authorized'); return; }

  var qid = _pqEditorQid || 'unknown';
  var ext = file.name.split('.').pop() || 'png';
  var path = qid + '/' + Date.now() + '.' + ext;

  showToast(t('Uploading...', '上传中...'));
  sb.storage.from('question-images').upload(path, file, { upsert: true })
    .then(function(res) {
      if (res.error) { showToast('Upload failed: ' + res.error.message); return; }
      var url = SUPABASE_URL + '/storage/v1/object/public/question-images/' + path;
      _pqInsertAtCursor('<img src="' + url + '" alt="">');
      showToast(t('Image inserted!', '图片已插入！'));
    }).catch(function() { showToast('Upload error'); });
  /* Reset file input */
  input.value = '';
}

/* ═══ SAVE EDIT ═══ */

function savePracticeEdit(qid, board) {
  if (!sb || !isSuperAdmin()) { showToast('Not authorized'); return; }

  var data = {};
  data.q = E('pq-ed-q') ? E('pq-ed-q').value : '';
  data.o = [];
  for (var i = 0; i < 4; i++) {
    var el = E('pq-ed-o' + i);
    data.o.push(el ? el.value : '');
  }
  var radios = document.querySelectorAll('[name="pq-ed-correct"]');
  data.a = 0;
  radios.forEach(function(r) { if (r.checked) data.a = parseInt(r.value); });
  data.e = E('pq-ed-e') ? E('pq-ed-e').value : '';
  data.d = E('pq-ed-d') ? parseInt(E('pq-ed-d').value) : 1;

  var status = E('pq-ed-status') ? E('pq-ed-status').value : 'active';

  showToast(t('Saving...', '保存中...'));
  sb.from('question_edits').upsert({
    qid: qid,
    board: board,
    data: data,
    status: status,
    updated_by: currentUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'qid' }).then(function(res) {
    if (res.error) {
      showToast(t('Save failed: ', '保存失败：') + res.error.message);
      return;
    }
    /* Clear caches to reload fresh data */
    _pqData[board] = null;
    _pqEditsCache[board] = null;
    hideModal();
    E('modal-card').className = 'modal-card';
    showToast(t('Saved!', '已保存！'));
    if (_pqEditorSaveCb) _pqEditorSaveCb();
  });
}

/* ═══ SUPERADMIN REVIEW ALL ═══ */

function startPracticeReview(li) {
  var lv = LEVELS[li];
  if (!lv) return Promise.resolve();
  var board = lv.board;
  if (board !== 'cie' && board !== 'edx') return Promise.resolve();

  currentLvl = li;
  showToast(t('Loading questions...', '加载题目中...'));

  return Promise.all([loadPracticeData(board), loadKaTeX()]).then(function() {
    var questions = (_pqData[board] || []).filter(function(q) { return q.cat === lv.category; });
    if (questions.length === 0) {
      showToast(t('No practice questions available for this topic', '该主题暂无练习题'));
      return;
    }
    _pqReviewState = { li: li, questions: questions, board: board };
    _pqReviewFilter = 'all';
    _pqReviewTopicFilter = 'all';
    showPanel('practice');
    renderPracticeReview();

    /* Event delegation moved to renderPracticeReview() */
  }).catch(function() {
    showToast(t('Failed to load questions', '加载题目失败'));
  });
}

function renderPracticeReview() {
  if (!_pqReviewState) return;
  var st = _pqReviewState;
  var li = st.li;
  var questions = st.questions;
  var lv = LEVELS[li];
  var catInfo = getCategoryInfo(lv.category);
  var labels = ['A', 'B', 'C', 'D'];

  /* Difficulty counts (from all questions, unaffected by topic) */
  var coreCount = questions.filter(function(q) { return q.d === 1; }).length;
  var extCount = questions.filter(function(q) { return q.d === 2; }).length;

  /* Cascading filter: difficulty first */
  var afterDiff = _pqReviewFilter === 'all' ? questions : questions.filter(function(q) {
    return q.d === _pqReviewFilter;
  });

  /* Extract unique topics + counts from afterDiff */
  var topicMap = {};
  afterDiff.forEach(function(q) {
    var tp = q.topic || '';
    if (!topicMap[tp]) topicMap[tp] = 0;
    topicMap[tp]++;
  });
  var topicList = Object.keys(topicMap).sort();

  /* Then apply topic filter */
  var filtered = _pqReviewTopicFilter === 'all' ? afterDiff : afterDiff.filter(function(q) {
    return (q.topic || '') === _pqReviewTopicFilter;
  });

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + li + ')">←</button>';
  html += '<div class="deck-title" style="flex:1;font-size:16px;margin:0 12px">' + catInfo.emoji + ' ' + lvTitle(lv) + '</div>';
  html += '<div class="pq-qid" style="font-size:13px;color:var(--c-muted);white-space:nowrap">' + t('Total', '共') + ' ' + filtered.length + ' ' + t('questions', '题') + '</div>';
  html += '</div>';

  /* Difficulty filter bar */
  html += '<div class="pq-review-filter">';
  html += '<button class="sort-btn' + (_pqReviewFilter === 'all' ? ' active' : '') + '" data-pq-filter="all">All (' + questions.length + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 1 ? ' active' : '') + '" data-pq-filter="1">Core (' + coreCount + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 2 ? ' active' : '') + '" data-pq-filter="2">Extended (' + extCount + ')</button>';
  html += '</div>';

  /* Topic filter bar */
  if (topicList.length > 1) {
    html += '<div class="pq-review-filter">';
    html += '<button class="sort-btn' + (_pqReviewTopicFilter === 'all' ? ' active' : '') + '" data-pq-topic="all">' + t('All Topics', '全部专题') + ' (' + afterDiff.length + ')</button>';
    topicList.forEach(function(tp) {
      var active = _pqReviewTopicFilter === tp ? ' active' : '';
      html += '<button class="sort-btn' + active + '" data-pq-topic="' + escapeHtml(tp) + '">' + escapeHtml(tp) + ' (' + topicMap[tp] + ')</button>';
    });
    html += '</div>';
  }

  /* Review list */
  html += '<div class="pq-review-list">';
  filtered.forEach(function(q, i) {
    html += '<div class="pq-review-card">';

    /* Header: num + qid + topic + difficulty + edit btn */
    html += '<div class="pq-meta mb-8">';
    html += '<span style="font-weight:700;color:var(--c-text);min-width:28px">' + (i + 1) + '.</span>';
    html += '<span class="pq-qid" style="font-size:11px;color:var(--c-muted)">#' + escapeHtml(q.id) + '</span>';
    if (q.topic) html += '<span class="pq-topic">' + escapeHtml(q.topic) + '</span>';
    html += '<span class="pq-difficulty pq-d' + q.d + '">' + (q.d === 1 ? t('Core', '基础') : t('Extended', '拓展')) + '</span>';
    html += '<button class="pq-review-edit pq-edit-btn" style="margin-left:auto" data-qid="' + escapeHtml(q.id) + '">✏️</button>';
    html += '</div>';

    /* Question */
    html += '<div class="pq-question mb-8">' + pqRender(q.q) + '</div>';

    /* Options */
    html += '<div class="pq-review-opts">';
    q.o.forEach(function(opt, oi) {
      var cls = oi === q.a ? ' is-correct' : '';
      html += '<div class="pq-review-opt' + cls + '">' + labels[oi] + ') ' + pqRender(opt) + (oi === q.a ? ' ✓' : '') + '</div>';
    });
    html += '</div>';

    /* Explanation */
    if (q.e) {
      html += '<div class="pq-review-exp">' + pqRender(q.e) + '</div>';
    }

    html += '</div>'; /* end card */
  });
  html += '</div>'; /* end list */

  E('panel-practice').innerHTML = html;

  /* Delegated clicks for edit/filter/topic buttons (bind once) */
  if (!_pqReviewDelegated) {
    _pqReviewDelegated = true;
    E('panel-practice').addEventListener('click', function(e) {
      /* Edit button */
      var btn = e.target.closest('.pq-review-edit');
      if (btn && _pqReviewState) {
        var qid = btn.dataset.qid;
        var st = _pqReviewState;
        var q = _pqFindQ(qid, st.board);
        if (!q) return;
        var scrollY = window.scrollY;
        _openEditor(q, st.board, function() {
          startPracticeReview(st.li).then(function() { window.scrollTo(0, scrollY); });
        });
        return;
      }
      /* Filter buttons */
      var fb = e.target.closest('[data-pq-filter]');
      if (fb) {
        setPqReviewFilter(fb.dataset.pqFilter === 'all' ? 'all' : Number(fb.dataset.pqFilter));
        return;
      }
      /* Topic buttons */
      var tb = e.target.closest('[data-pq-topic]');
      if (tb) { setPqReviewTopic(tb.dataset.pqTopic); }
    });
  }

  renderMath(E('panel-practice'));
}

function setPqReviewFilter(f) {
  _pqReviewFilter = f;
  _pqReviewTopicFilter = 'all';
  renderPracticeReview();
}

function setPqReviewTopic(t) {
  _pqReviewTopicFilter = t;
  renderPracticeReview();
}

/* Helper: find question by qid from cache */
function _pqFindQ(qid, board) {
  var data = _pqData[board];
  if (!data) return null;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === qid) return data[i];
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════
   PAST PAPER MODULE — Practice + Exam + Wrong Book
   ══════════════════════════════════════════════════════════════ */

/* Past paper access guard: CIE/Edexcel locked to super admin until QA complete */
function _ppAccessAllowed(board) {
  if (board === '25m') return true;
  return typeof isSuperAdmin === 'function' && isSuperAdmin();
}

var _ppData = {};          /* { cie: { paperMeta: {}, questions: [] } } lazy-loaded */
var _ppFigures = {};       /* { qid: ["figures/xxx.svg", ...] } from manifest.json */
var _ppSession = null;     /* { questions, current, mode, startTime, results[], board, sectionId, paperKey, ... } */
var _ppPaperResults = null; /* lazy-loaded paper results from localStorage */
var _ppTimer = null;       /* exam timer interval */
var _ppDelegated = false;  /* event delegation bound on panel-pastpaper */

var PP_ERROR_TYPES = [
  { id: 'concept',     en: 'Concept gap',       zh: '\u6982\u5ff5\u4e0d\u6e05' },
  { id: 'method',      en: 'Wrong method',      zh: '\u65b9\u6cd5\u9519\u8bef' },
  { id: 'calculation', en: 'Calculation error',  zh: '\u8ba1\u7b97\u9519\u8bef' },
  { id: 'careless',    en: 'Careless mistake',   zh: '\u7c97\u5fc3\u5927\u610f' },
  { id: 'incomplete',  en: 'Incomplete answer',  zh: '\u7b54\u6848\u4e0d\u5b8c\u6574' },
  { id: 'time',        en: 'Ran out of time',    zh: '\u65f6\u95f4\u4e0d\u591f' }
];

/* ═══ DATA LOADING ═══ */

function loadPastPaperData(board) {
  board = board || 'cie';
  if (_ppData[board]) return Promise.resolve(_ppData[board]);
  var file = 'data/papers-' + board + '.json?v=' + APP_VERSION;
  /* Load figure manifest in parallel (fire-and-forget) */
  if (!_ppFigures._loaded) {
    _ppFigures._loaded = true;
    fetch('data/figures/manifest.json?v=' + APP_VERSION)
      .then(function(r) { return r.ok ? r.json() : {}; })
      .then(function(m) { for (var k in m) _ppFigures[k] = m[k]; })
      .catch(function() {});
  }
  return Promise.all([
    fetch(file).then(function(r) {
      if (!r.ok) throw new Error('Failed to load ' + file);
      return r.json();
    }),
    loadQuestionEdits(board)
  ]).then(function(results) {
    var data = results[0];
    var edits = results[1];
    /* v2.0 format: { v, paperMeta, questions } */
    if (data.v === '2.0') {
      _ppData[board] = data;
    } else {
      /* Legacy flat array fallback */
      _ppData[board] = { paperMeta: {}, questions: data };
    }
    /* Merge question_edits overrides (marks, tex, d, g) */
    var qs = _ppData[board].questions || [];
    for (var qi = 0; qi < qs.length; qi++) {
      var ed = edits[qs[qi].id];
      if (ed) {
        if (ed.marks !== undefined) qs[qi].marks = ed.marks;
        if (ed.tex !== undefined) qs[qi].tex = ed.tex;
        if (ed.d !== undefined) qs[qi].d = ed.d;
        if (ed.g !== undefined) qs[qi].g = ed.g;
        if (ed.parts !== undefined) qs[qi].parts = ed.parts;
        if (ed.ansPrefix !== undefined) qs[qi].ansPrefix = ed.ansPrefix;
        if (ed.ansSuffix !== undefined) qs[qi].ansSuffix = ed.ansSuffix;
        if (ed.ansTpl !== undefined) qs[qi].ansTpl = ed.ansTpl;
        if (ed.moduleOrder !== undefined) qs[qi].moduleOrder = ed.moduleOrder;
      }
      /* Normalize Edexcel parts {p, m} → {label, marks} (v4.3.2) */
      if (qs[qi].parts) {
        for (var pi = 0; pi < qs[qi].parts.length; pi++) {
          var pt = qs[qi].parts[pi];
          if (pt.p !== undefined && pt.label === undefined) {
            pt.label = '(' + pt.p + ')';
            pt.marks = pt.m || 0;
          }
        }
      }
    }
    return _ppData[board];
  });
}

function getPPQuestions(board) {
  var d = _ppData[board];
  return d ? d.questions || [] : [];
}

function getPPBySection(board, sectionId) {
  var qs = getPPQuestions(board);
  return qs.filter(function(q) { return q.s === sectionId; });
}

function getPPByPaper(board, paperKey) {
  var qs = getPPQuestions(board);
  var filtered = qs.filter(function(q) { return q.paper === paperKey; });
  filtered.sort(function(a, b) { return a.qnum - b.qnum; });
  return filtered;
}

function getPaperMeta(board) {
  var d = _ppData[board];
  return d ? d.paperMeta || {} : {};
}

function getPaperList(board) {
  var meta = getPaperMeta(board);
  var keys = Object.keys(meta);
  var sessionOrder = { March: 0, FebMarch: 0, MayJune: 1, June: 1, OctNov: 2, November: 2, Specimen: 3 };
  keys.sort(function(a, b) {
    var ma = meta[a], mb = meta[b];
    if (ma.year !== mb.year) return mb.year - ma.year;
    var sa = sessionOrder[ma.session] || 9, sb = sessionOrder[mb.session] || 9;
    if (sa !== sb) return sa - sb;
    return (ma.paper || '').localeCompare(mb.paper || '');
  });
  return keys.map(function(k) { return Object.assign({ key: k }, meta[k]); });
}

/* ═══ PAPER RESULTS PERSISTENCE ═══ */

function _ppResultsKey() { return 'pp_paper_results'; }
function _ppGetPaperResults() {
  if (_ppPaperResults) return _ppPaperResults;
  try { _ppPaperResults = JSON.parse(localStorage.getItem(_ppResultsKey())) || {}; }
  catch(e) { _ppPaperResults = {}; }
  return _ppPaperResults;
}
function _ppSavePaperResult(paperKey, result) {
  var all = _ppGetPaperResults();
  var existing = all[paperKey];
  /* Keep best score */
  if (!existing || result.score > existing.score) {
    all[paperKey] = result;
  }
  /* Always update latest attempt date */
  all[paperKey].lastDate = result.date || new Date().toISOString();
  _ppPaperResults = all;
  localStorage.setItem(_ppResultsKey(), JSON.stringify(all));
}

/* ═══ MASTERY STORAGE (FLM) ═══ */
/*
 * PP mastery uses FLM 4-state model (new/learning/uncertain/mastered).
 * - Practice mode: manual 3-button rating, cs = consecutive "mastered" ratings
 * - Exam mode: high-confidence, correct → mastered immediately (cs=2)
 * - Mastered questions decay via REFRESH_INTERVALS [7,14,30]
 */

function _ppMasteryKey() { return 'pp_mastery'; }

/* One-time migration: old {m,t,n} → FLM format */
var _ppFLMMigrated = false;
function _migratePPtoFLM(m) {
  if (_ppFLMMigrated) return;
  var needsMigration = false;
  for (var k in m) {
    if (m[k].m != null && m[k].fs == null) { needsMigration = true; break; }
  }
  if (!needsMigration) { _ppFLMMigrated = true; return; }
  for (var qid in m) {
    var d = m[qid];
    if (d.fs != null) continue;
    if (d.m === 'mastered') { d.fs = 'mastered'; d.fmt = d.t || Date.now(); d.cs = 2; }
    else if (d.m === 'partial') { d.fs = 'uncertain'; d.cs = 0; }
    else if (d.m === 'needs_work') { d.fs = 'learning'; d.cs = 0; }
    else { d.fs = 'new'; d.cs = 0; }
    d.rc = 0;
  }
  _ppFLMMigrated = true;
  try { localStorage.setItem(_ppMasteryKey(), JSON.stringify(m)); } catch (e) {}
}

function _ppGetMastery() {
  try {
    var m = JSON.parse(localStorage.getItem(_ppMasteryKey())) || {};
    _migratePPtoFLM(m);
    return m;
  } catch(e) { return {}; }
}

/*
 * _ppSetMastery — FLM-aware mastery setter.
 * opts.source: 'practice' (manual rating, cs-based) or 'exam' (high-confidence)
 */
function _ppSetMastery(qid, level, opts) {
  var m = _ppGetMastery();
  var prev = m[qid] || {};
  var now = Date.now();
  var fs = prev.fs || 'new';
  var cs = prev.cs || 0;
  opts = opts || {};
  var source = opts.source || 'practice';

  if (level === 'mastered') {
    if (source === 'exam') {
      /* Exam correct = high-confidence mastered */
      fs = 'mastered';
      if (!prev.fmt || fs !== 'mastered') prev.fmt = now;
      cs = 2;
    } else {
      /* Practice rating: cs-based progression */
      cs++;
      if (cs >= 2) {
        fs = 'mastered';
        if (!prev.fmt || prev.fs !== 'mastered') prev.fmt = now;
      } else if (fs === 'new' || fs === 'learning') {
        fs = 'uncertain';
      }
    }
  } else if (level === 'partial') {
    fs = 'uncertain';
    cs = 0;
  } else if (level === 'needs_work') {
    if (fs === 'mastered') fs = 'uncertain';
    else fs = 'learning';
    cs = 0;
  }

  m[qid] = {
    m: level, fs: fs, t: now, n: (prev.n || 0) + 1,
    fmt: prev.fmt || (fs === 'mastered' ? now : null),
    rc: prev.rc || 0, cs: cs,
    src: source || prev.src || ''
  };
  try { localStorage.setItem(_ppMasteryKey(), JSON.stringify(m)); } catch (e) {}

  /* Auto-resolve wrong book when mastered */
  if (fs === 'mastered') ppResolveWrongBook(qid);
  /* Invalidate stale cache + sync */
  _stalePPCacheData = null;
  invalidateCache();
  recordDailyHistory(null);
  debouncedSync();
}

function _ppGetQMastery(qid) {
  var m = _ppGetMastery();
  return m[qid] ? m[qid].m : null;
}
function _ppGetQFLM(qid) {
  var m = _ppGetMastery();
  return m[qid] ? (m[qid].fs || 'new') : 'new';
}

/* ═══ STALE PP QUESTIONS ═══ */
var _stalePPCacheData = null;
var _stalePPCacheTime = 0;
function getStalePPQuestions(board) {
  var now = Date.now();
  if (_stalePPCacheData && (now - _stalePPCacheTime) < 30000 && !board) return _stalePPCacheData;
  var mastery = _ppGetMastery();
  var stale = [];
  for (var qid in mastery) {
    var d = mastery[qid];
    if (!d.fs || d.fs !== 'mastered' || !d.fmt) continue;
    var rc = d.rc || 0;
    var threshold = REFRESH_INTERVALS[Math.min(rc, REFRESH_INTERVALS.length - 1)];
    var daysSince = (now - d.fmt) / 86400000;
    if (daysSince >= threshold) {
      stale.push({ qid: qid, rc: rc, daysSince: Math.floor(daysSince) });
    }
  }
  stale.sort(function(a, b) { return b.daysSince - a.daysSince; });
  if (!board) { _stalePPCacheData = stale; _stalePPCacheTime = now; }
  return stale;
}
function getStalePPCount(board) { return getStalePPQuestions(board).length; }

/* Record PP refresh scan verdict (for v3.0.1 refresh UI) */
function recordPPRefreshScan(qid, verdict) {
  var m = _ppGetMastery();
  var prev = m[qid] || {};
  var now = Date.now();
  var fs = prev.fs || 'mastered';
  var rc = prev.rc || 0;
  if (verdict === 'known') {
    rc = Math.min(rc + 1, MAX_RC);
    prev.fmt = now;
  } else if (verdict === 'fuzzy') {
    fs = 'uncertain'; prev.cs = 0;
  } else if (verdict === 'unknown') {
    fs = 'learning'; prev.cs = 0;
  }
  m[qid] = {
    m: fs === 'mastered' ? 'mastered' : fs === 'uncertain' ? 'partial' : 'needs_work',
    fs: fs, t: now, n: (prev.n || 0) + 1,
    fmt: prev.fmt || null, rc: rc, cs: prev.cs || 0,
    src: (verdict !== 'known') ? 'reflow' : (prev.src || '')
  };
  try { localStorage.setItem(_ppMasteryKey(), JSON.stringify(m)); } catch (e) {}
  _stalePPCacheData = null;
  invalidateCache();
  recordDailyHistory(null);
  debouncedSync();
}

/* ═══ PP REFRESH SCAN UI ═══ */

var _ppRefreshItems = [];
var _ppRefreshIdx = 0;
var _ppRefreshResults = { known: [], fuzzy: [], unknown: [] };
var _ppRefreshMode = false;

function startPPRefreshScan() {
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : ['cie'];
  var ppBoards = [];
  for (var i = 0; i < boards.length; i++) {
    if (boards[i] === 'cie' || boards[i] === 'edx') ppBoards.push(boards[i]);
  }
  if (ppBoards.length === 0) return;
  var promises = ppBoards.map(function(b) { return loadPastPaperData(b); });
  Promise.all(promises).then(function() {
    var cap = typeof REFRESH_CAP !== 'undefined' ? REFRESH_CAP : 20;
    var staleList = typeof getStalePPQuestions === 'function' ? getStalePPQuestions() : [];
    if (staleList.length === 0) { showToast(t('No stale questions', '没有衰退的真题')); return; }
    var items = staleList.slice(0, cap);
    /* Resolve qid → full question object */
    var resolved = [];
    for (var j = 0; j < items.length; j++) {
      var qid = items[j].qid;
      var found = null, foundBoard = null;
      for (var b in _ppData) {
        var qs = _ppData[b] ? (_ppData[b].questions || []) : [];
        for (var k = 0; k < qs.length; k++) {
          if (qs[k].id === qid) { found = qs[k]; foundBoard = b; break; }
        }
        if (found) break;
      }
      if (found) resolved.push({ qid: qid, q: found, board: foundBoard });
    }
    if (resolved.length === 0) return;
    _ppRefreshItems = resolved;
    _ppRefreshIdx = 0;
    _ppRefreshResults = { known: [], fuzzy: [], unknown: [] };
    _ppRefreshMode = true;
    _ppSession = null;
    showPanel('practice');
    loadKaTeX().then(function() { _renderPPRefreshCard(); });
  });
}

function _renderPPRefreshCard() {
  if (_ppRefreshIdx >= _ppRefreshItems.length) { _finishPPRefreshScan(); return; }
  var item = _ppRefreshItems[_ppRefreshIdx];
  var q = item.q;
  var progress = _ppRefreshItems.length > 0 ? Math.round(_ppRefreshIdx / _ppRefreshItems.length * 100) : 0;
  var html = '';
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="_ppRefreshMode=false;navTo(\'plan\')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (_ppRefreshIdx + 1) + ' / ' + _ppRefreshItems.length + '</div>';
  html += '</div>';
  /* Recovery step bar */
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    html += _renderRecoveryStepBar();
  }
  html += '<div class="study-refresh-label">\ud83d\udd04 ' + t('Past Paper Refresh', '真题复查') + '</div>';
  html += '<div class="scan-card pp-scan-card" id="scan-card">';
  html += '<div class="pp-card-header">';
  html += _ppDiffLabel(q.d || 1, item.board);
  if (q.marks > 0) html += '<span class="pp-marks-badge">[' + q.marks + ' ' + t('marks', '分') + ']</span>';
  if (q.src) html += '<span style="font-size:11px;color:var(--c-text3)">' + escapeHtml(q.src) + '</span>';
  html += '</div>';
  html += '<div class="pp-scan-body">' + _ppRenderWithMarks(q, true) + '</div>';
  html += _ppRenderFigures(q);
  html += '</div>';
  html += '<div class="scan-actions" id="pp-scan-actions">';
  html += '<button class="scan-btn scan-known" data-pp-scan="known"><span class="scan-key">1</span> ' + t('Know it', '认识') + '</button>';
  html += '<button class="scan-btn scan-fuzzy" data-pp-scan="fuzzy"><span class="scan-key">2</span> ' + t('Fuzzy', '模糊') + '</button>';
  html += '<button class="scan-btn scan-unknown" data-pp-scan="unknown"><span class="scan-key">3</span> ' + t("Don't know", '不认识') + '</button>';
  html += '</div>';
  E('panel-practice').innerHTML = html;
  if (typeof renderMathInElement === 'function') renderMathInElement(E('panel-practice'));
  var actions = E('pp-scan-actions');
  if (actions && !actions._bound) {
    actions._bound = true;
    actions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-pp-scan]');
      if (btn) _ratePPScan(btn.dataset.ppScan);
    });
  }
}

function _ratePPScan(verdict) {
  var item = _ppRefreshItems[_ppRefreshIdx];
  _ppRefreshResults[verdict].push(item);
  recordPPRefreshScan(item.qid, verdict);
  var card = E('scan-card');
  if (card) card.classList.add('scan-' + verdict);
  if (verdict === 'known' && typeof playCorrect === 'function') playCorrect();
  else if (verdict === 'unknown' && typeof playWrong === 'function') playWrong();
  setTimeout(function() {
    _ppRefreshIdx++;
    _renderPPRefreshCard();
  }, 600);
}

function _finishPPRefreshScan() {
  var k = _ppRefreshResults.known.length;
  var f = _ppRefreshResults.fuzzy.length;
  var u = _ppRefreshResults.unknown.length;
  _ppRefreshMode = false;

  var _isRecovery = typeof isRecoverySessionActive === 'function' && isRecoverySessionActive();

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83d\udd04</div>';
  html += '<div class="result-title">' + t('PP Refresh Complete!', '真题复查完成！') + '</div>';
  html += '<div class="result-sub">' + t('Checked ' + (k + f + u) + ' stale questions', '检查了 ' + (k + f + u) + ' 个衰退真题') + '</div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Still know', '仍认识') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '模糊') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Forgot', '忘记') + '</div></div>';
  html += '</div>';
  if (f + u > 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);text-align:center;margin:8px 0">';
    html += t((f + u) + ' questions returned to learning', (f + u) + ' 个真题已回流到学习池');
    html += '</div>';
  }
  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'plan\')">' + t('Back to Plan', '返回计划') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">' + t('Home', '首页') + '</button>';
  html += '</div>';
  E('panel-practice').innerHTML = html;
  if (typeof updateSidebar === 'function') updateSidebar();
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;

  /* Recovery session: replace buttons with session-aware controls */
  if (_isRecovery) {
    _recordRecoveryResult('pp');
    var panel = E('panel-practice');
    var actionsDiv = panel ? panel.querySelector('.result-actions') : null;
    if (actionsDiv) {
      actionsDiv.outerHTML = _renderRecoveryStepBar() + _renderRecoveryResultButtons();
    }
  }
}

/* ═══ WRONG BOOK STORAGE ═══ */

function _ppWBKey() { return 'pp_wrong_book'; }
function _ppGetWB() {
  try { return JSON.parse(localStorage.getItem(_ppWBKey())) || {}; } catch(e) { return {}; }
}
function _ppSaveWB(wb) { localStorage.setItem(_ppWBKey(), JSON.stringify(wb)); }

function ppAddToWrongBook(qid, errorType, note, sectionId, board) {
  var wb = _ppGetWB();
  var isNew = !wb[qid];
  if (isNew) {
    wb[qid] = { addedAt: Date.now(), lastReview: null, reviewCount: 0,
      errorType: errorType || '', note: note || '', status: 'active' };
  } else {
    wb[qid].errorType = errorType || wb[qid].errorType;
    if (note) wb[qid].note = note;
    wb[qid].status = 'active';
  }
  _ppSaveWB(wb);
  /* Trigger vocab reflow for new wrong-book entries */
  if (isNew && sectionId && typeof reflowVocabForSection === 'function') {
    var reflowed = reflowVocabForSection(sectionId, board);
    if (reflowed > 0) {
      showToast('\ud83d\udcd5 ' + reflowed + t(' related words reflowed to review', ' \u4e2a\u76f8\u5173\u8bcd\u6c47\u5df2\u56de\u6d41'));
    }
  }
}
function ppResolveWrongBook(qid) {
  var wb = _ppGetWB();
  if (wb[qid]) { wb[qid].status = 'resolved'; wb[qid].lastReview = Date.now(); }
  _ppSaveWB(wb);
}
function ppRemoveFromWrongBook(qid) {
  var wb = _ppGetWB();
  delete wb[qid];
  _ppSaveWB(wb);
}

/* ═══ EXAM HISTORY STORAGE ═══ */

function _ppExamKey() { return 'pp_exam_history'; }
function _ppGetExams() {
  try { return JSON.parse(localStorage.getItem(_ppExamKey())) || []; } catch(e) { return []; }
}
function _ppSaveExam(exam) {
  var list = _ppGetExams();
  list.unshift(exam);
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(_ppExamKey(), JSON.stringify(list));
}

/* ═══ HELPER: render tex safely ═══ */

function _ppRenderTex(texOrQ) {
  /* Accept a question object (prefer texHtml) or raw string */
  var tex = (typeof texOrQ === 'object' && texOrQ !== null) ? (texOrQ.texHtml || texOrQ.tex) : texOrQ;
  /* Clean LaTeX remnants before rendering */
  var html = tex.replace(/\[leftmargin[^\]]*\]/g, '');
  /* Convert markdown bold; keep \n intact (CSS white-space: pre-line handles display) */
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return html;
}

/* ═══ Render question with right-aligned marks (PDF-style) ═══ */

/* Build answer line HTML (v4.3.2)
   Data fields on part or question object:
   - ansPrefix ("x="), ansSuffix ("cm")  → prefix + dots + suffix
   - ansTpl ("(____, ____)")             → template with ____ replaced by dotted blanks
   - ansTpl "vector" / "vector(3)"       → column vector with large braces
   Priority: ansTpl > ansPrefix/ansSuffix > plain dots */
function _ppAnswerLine(prefix, suffix, tpl) {
  if (tpl) {
    /* Vector mode: "vector" (2 rows) or "vector(N)" */
    var vecMatch = tpl.match(/^vector(?:\((\d+)\))?$/);
    if (vecMatch) {
      var rows = parseInt(vecMatch[1] || '2', 10);
      var h = '<div class="pp-answer-line pp-answer-vector">';
      if (prefix) h += '<span class="pp-answer-prefix">' + prefix + '</span>';
      h += '<span class="pp-vector-brace">(</span><div class="pp-vector-stack">';
      for (var ri = 0; ri < rows; ri++) {
        h += '<span class="pp-answer-blank"></span>';
      }
      h += '</div><span class="pp-vector-brace">)</span>';
      if (suffix) h += '<span class="pp-answer-suffix">' + suffix + '</span>';
      return h + '</div>';
    }
    /* Table mode: "table:x|-2|-1|0|1|2\ny|____|____|____|____|____"
       | separates cells, \n separates rows, ____ becomes dotted blank
       Cell content supports LaTeX (rendered by KaTeX via renderMath) */
    if (tpl.indexOf('table:') === 0) {
      var tblRows = tpl.slice(6).split('\\n');
      var h = '<table class="pp-answer-table"><tbody>';
      for (var tr = 0; tr < tblRows.length; tr++) {
        var cells = tblRows[tr].split('|');
        h += '<tr>';
        for (var tc = 0; tc < cells.length; tc++) {
          var cell = cells[tc];
          var isBlank = /^_{3,}$/.test(cell.trim());
          var tag = tr === 0 ? 'th' : 'td';
          if (isBlank) {
            h += '<' + tag + '><span class="pp-answer-blank"></span></' + tag + '>';
          } else {
            h += '<' + tag + '>' + cell + '</' + tag + '>';
          }
        }
        h += '</tr>';
      }
      return h + '</tbody></table>';
    }
    /* Generic template mode: replace each ____ with a dotted blank span
       Support \n for multi-line answer areas (e.g. "a = ____\nb = ____\nc = ____")
       Trailing blank on each line uses flex stretch (right-aligned dots);
       non-trailing blanks use inline fixed-width */
    var lines = tpl.split('\\n');
    var multiLine = lines.length > 1;
    var out = multiLine ? '<div class="pp-answer-rows">' : '';
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var endsWithBlank = /_{3,}\s*$/.test(line);
      if (endsWithBlank) {
        /* Strip trailing blank, render remaining inline blanks, then flex dots at end */
        var stripped = line.replace(/_{3,}\s*$/, '');
        var before = stripped.replace(/_{3,}/g, '<span class="pp-answer-blank"></span>');
        out += '<div class="pp-answer-line">';
        if (before) out += '<span class="pp-answer-prefix">' + before + '</span>';
        out += '<span class="pp-answer-dots"></span>';
        out += '</div>';
      } else {
        /* No trailing blank: all blanks are inline fixed-width */
        var rendered = line.replace(/_{3,}/g, '<span class="pp-answer-blank"></span>');
        out += '<div class="pp-answer-line pp-answer-tpl">' + rendered + '</div>';
      }
    }
    if (multiLine) out += '</div>';
    return out;
  }
  var h = '<div class="pp-answer-line">';
  if (prefix) h += '<span class="pp-answer-prefix">' + prefix + '</span>';
  h += '<span class="pp-answer-dots"></span>';
  if (suffix) h += '<span class="pp-answer-suffix">' + suffix + '</span>';
  return h + '</div>';
}

function _ppRenderWithMarks(q, showAnswerLine) {
  var html = _ppRenderTex(q);
  if (!q.parts || !q.parts.length) {
    /* No parts — show total marks right-aligned at end (skip if marks=0) */
    var totalMarksHtml = (q.marks > 0)
      ? '<span class="pp-marks-right">[' + q.marks + ']</span>' : '';
    var ansLine = showAnswerLine ? _ppAnswerLine(q.ansPrefix, q.ansSuffix, q.ansTpl) : '';
    return '<div class="pp-part-block"><div class="pp-part-content">' + html +
      ansLine + '</div>' + totalMarksHtml + '</div>';
  }
  /* Build parts lookup: "(a)" → part object */
  var partsMap = {};
  for (var i = 0; i < q.parts.length; i++) {
    partsMap[q.parts[i].label.toLowerCase()] = q.parts[i];
  }
  return _ppInsertPartMarks(html, partsMap, showAnswerLine);
}

function _ppInsertPartMarks(html, partsMap, showAnswerLine) {
  var labels = Object.keys(partsMap);
  if (!labels.length) return html;
  /* Build dynamic regex matching only labels present in partsMap */
  /* Require label at line start (or after newline) to avoid matching f(x), g(x) etc. */
  var escaped = labels.map(function(l) {
    return l.replace(/[()]/g, '\\$&');
  });
  var re = new RegExp('((?:^|\\n)\\s*(' + escaped.join('|') + '))', 'gi');
  var parts = html.split(re);
  /* split with capture groups: [intro, fullMatch, labelOnly, content, fullMatch, labelOnly, content, ...] */
  /* Each match produces 2 capture groups, so stride is 3 */
  if (parts.length < 4) {
    /* No part labels found in text — just show as-is */
    return html;
  }
  var result = '';
  /* First segment is the intro (before any part label) */
  var intro = parts[0].replace(/\s+$/, '');
  if (intro) result += '<div class="pp-part-intro">' + intro + '</div>';
  /* Process groups: fullMatch(i) + labelOnly(i+1) + content(i+2) */
  for (var i = 1; i < parts.length; i += 3) {
    var label = parts[i + 1]; /* the clean label like "(a)" */
    var content = (i + 2 < parts.length) ? parts[i + 2] : '';
    var pt = partsMap[label.toLowerCase()];
    var marks = pt ? pt.marks : 0;
    /* marks=0 means "not extracted" — don't display [0] */
    var marksHtml = (marks != null && marks > 0)
      ? '<span class="pp-marks-right">[' + marks + ']</span>' : '';
    /* Trim trailing whitespace from content */
    content = content.replace(/\s+$/, '');
    /* Answer line with per-part prefix/suffix (e.g. "x=" prefix, "cm" suffix) */
    var ansLine = showAnswerLine ? _ppAnswerLine(pt && pt.ansPrefix, pt && pt.ansSuffix, pt && pt.ansTpl) : '';
    result += '<div class="pp-part-block"><span class="pp-part-label">' + label + '</span>' +
      '<div class="pp-part-content">' + content + ansLine + '</div>' + marksHtml + '</div>';
  }
  return result;
}

function _ppRenderFigures(q) {
  var figs = _ppFigures[q.id];
  if (figs && figs.length > 0) {
    var h = '<div class="pp-figures">';
    for (var i = 0; i < figs.length; i++) {
      h += '<img class="pp-fig" src="data/' + figs[i] + '?v=' + APP_VERSION + '" alt="Question diagram" loading="lazy">';
    }
    return h + '</div>';
  }
  if (q.hasFigure) {
    var figH = '<div class="pp-figure-placeholder">';
    figH += '<div style="font-size:24px;margin-bottom:6px">\ud83d\uddbc\ufe0f</div>';
    figH += t('This question includes a diagram', '\u672c\u9898\u5305\u542b\u56fe\u8868');
    if (q.paper && q.year) {
      figH += '<br><a href="https://papers.gceguide.cc/Cambridge%20IGCSE/Mathematics%20(0580)/' + q.year +
        '/" target="_blank" rel="noopener">' + t('View original paper \u2197', '\u67e5\u770b\u539f\u5377 \u2197') + '</a>';
    }
    figH += '</div>';
    return figH;
  }
  return '';
}

function _ppDiffLabel(d, board) {
  if (board === 'edx') {
    return d >= 4 ? '<span class="pp-diff-badge pp-diff-ext">' + t('Higher', '\u9ad8\u7ea7') + '</span>'
      : '<span class="pp-diff-badge pp-diff-core">' + t('Foundation', '\u57fa\u7840') + '</span>';
  }
  return d === 2 ? '<span class="pp-diff-badge pp-diff-ext">' + t('Extended', '\u62d3\u5c55') + '</span>'
    : '<span class="pp-diff-badge pp-diff-core">' + t('Core', '\u57fa\u7840') + '</span>';
}

function _ppPartsInfo(q) {
  if (!q.parts || !q.parts.length) return '';
  return q.parts.map(function(p) { return p.label + ' ' + p.marks + (p.marks === 1 ? ' mark' : ' marks'); }).join('  \u00b7  ');
}

/* ═══ GROUP LABELS ═══ */
var _ppGroupLabels = {
  'simplify':          { en: 'Simplify / Factorise',     zh: '\u5316\u7b80/\u56e0\u5f0f\u5206\u89e3' },
  'quadratic':         { en: 'Quadratic Equations',      zh: '\u4e8c\u6b21\u65b9\u7a0b' },
  'function':          { en: 'Functions',                zh: '\u51fd\u6570' },
  'sequence':          { en: 'Sequences',                zh: '\u6570\u5217' },
  'graph':             { en: 'Graphs',                   zh: '\u56fe\u50cf' },
  'simul-linear':      { en: 'Simultaneous (Linear)',    zh: '\u8054\u7acb\u4e00\u6b21' },
  'rearrange':         { en: 'Change of Subject',        zh: '\u516c\u5f0f\u53d8\u5f62' },
  'algebraic-fraction':{ en: 'Algebraic Fractions',      zh: '\u4ee3\u6570\u5206\u5f0f' },
  'linear':            { en: 'Linear Equations',         zh: '\u4e00\u6b21\u65b9\u7a0b' },
  'simul-nonlinear':   { en: 'Simultaneous (Nonlinear)', zh: '\u8054\u7acb\u975e\u7ebf\u6027' },
  'inequality':        { en: 'Inequalities',             zh: '\u4e0d\u7b49\u5f0f' },
  'proportion':        { en: 'Proportion',               zh: '\u6bd4\u4f8b' },
  'indices':           { en: 'Indices',                  zh: '\u6307\u6570' },
  'substitution':      { en: 'Substitution',             zh: '\u4ee3\u5165\u6c42\u503c' },
  'mixed':             { en: 'Mixed / Other',            zh: '\u7efc\u5408\u8fd0\u7528' }
};

function _ppGroupLabel(gk) {
  var gl = _ppGroupLabels[gk];
  return gl ? t(gl.en, gl.zh) : gk;
}

/* ═══ MASTERY STATS FOR A SECTION ═══ */

function ppGetSectionStats(board, sectionId) {
  var all = getPPBySection(board, sectionId);
  var mastery = _ppGetMastery();
  var wb = _ppGetWB();
  var now = Date.now();
  var stats = { total: all.length, newQ: 0, learning: 0, uncertain: 0, mastered: 0,
                needsWork: 0, partial: 0, stale: 0, wrongActive: 0 };
  for (var i = 0; i < all.length; i++) {
    var qm = mastery[all[i].id];
    if (!qm || !qm.fs || qm.fs === 'new') { stats.newQ++; }
    else if (qm.fs === 'learning') { stats.learning++; stats.needsWork++; }
    else if (qm.fs === 'uncertain') { stats.uncertain++; stats.partial++; }
    else if (qm.fs === 'mastered') {
      stats.mastered++;
      if (qm.fmt) {
        var rc = qm.rc || 0;
        var threshold = REFRESH_INTERVALS[Math.min(rc, REFRESH_INTERVALS.length - 1)];
        if ((now - qm.fmt) / 86400000 >= threshold) stats.stale++;
      }
    }
  }
  /* Count active wrong book items for this section */
  for (var qid in wb) {
    if (wb[qid].status === 'active') {
      var found = false;
      for (var j = 0; j < all.length; j++) { if (all[j].id === qid) { found = true; break; } }
      if (found) stats.wrongActive++;
    }
  }
  return stats;
}

/* ═══ ENTRY POINT: START PAST PAPER ═══ */

function startPastPaper(sectionId, board, mode, groupFilter, cmdFilter) {
  board = board || 'cie';
  mode = mode || 'practice';

  var _ppBK = board === 'edexcel' ? 'edx' : board === 'hhk' ? '25m' : board;
  if (!_ppAccessAllowed(_ppBK)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  showToast(t('Loading past papers...', '\u52a0\u8f7d\u771f\u9898\u4e2d...'));

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var questions = getPPBySection(board, sectionId);
    /* Apply group filter if specified */
    if (groupFilter) {
      questions = questions.filter(function(q) { return q.g === groupFilter; });
    }
    /* Apply command word filter */
    if (cmdFilter) {
      questions = questions.filter(function(q) { return q.cmd === cmdFilter; });
    }
    if (!questions.length) {
      showToast(t('No past papers available for this section', '\u672c\u77e5\u8bc6\u70b9\u6682\u65e0\u771f\u9898'));
      return;
    }

    if (mode === 'exam') {
      ppShowExamSetup(sectionId, board, questions);
    } else if (mode === 'wrongbook') {
      ppShowWrongBook(sectionId, board);
    } else {
      _ppSession = {
        questions: questions,
        current: 0,
        mode: 'practice',
        board: board,
        sectionId: sectionId,
        groupFilter: groupFilter || null,
        cmdFilter: cmdFilter || null,
        results: []
      };
      showPanel('pastpaper');
      renderPPCard();
    }
  }).catch(function(err) {
    console.error('Past paper load error:', err);
    showToast(t('Failed to load past papers', '\u52a0\u8f7d\u771f\u9898\u5931\u8d25'));
  });
}

/* ═══ CARD MODULE RENDERERS (v4.3.3) ═══ */

function _ppRenderBodyModule(q, showAnsLine) {
  var h = '<div class="pp-card-body" id="pp-question-body">';
  h += _ppRenderWithMarks(q, showAnsLine);
  h += _ppRenderFigures(q);
  h += '</div>';
  return h;
}

function _ppRenderAnswersModule(q) {
  if (_ppSession.mode !== 'practice') return '';
  var h = '<div class="pp-ms-toggle" role="button" tabindex="0" data-action="toggleMS">';
  h += '<span id="pp-ms-arrow">\u25b6</span> ' + t('Answers', '\u7b54\u6848');
  h += '</div>';
  h += '<div class="pp-ms-content" id="pp-ms-body">';
  h += '<div class="pp-ms-placeholder">';
  h += t('Coming soon \u2014 use self-assessment for now', '\u5373\u5c06\u63a8\u51fa\uff0c\u8bf7\u5148\u81ea\u8bc4');
  h += '</div></div>';
  return h;
}

function _ppRenderVocabModule(q) {
  if (_ppSession.mode !== 'practice' || !q.s) return '';
  var vocabInfo = _ppGetSectionVocab(q.s, _ppSession.board);
  if (!vocabInfo || !vocabInfo.words.length) return '';
  var h = '<div class="pp-ms-toggle" role="button" tabindex="0" data-action="toggleVocab">';
  h += '<span id="pp-vocab-arrow">\u25b6</span> ';
  h += t('Related Vocabulary', '\u76f8\u5173\u8bcd\u6c47');
  h += ' <span class="text-muted-sm">(' + vocabInfo.words.length + ')</span>';
  h += '</div>';
  h += '<div class="pp-ms-content" id="pp-vocab-body">';
  for (var vi = 0; vi < vocabInfo.words.length; vi++) {
    var vw = vocabInfo.words[vi];
    h += '<div class="pp-vocab-row">';
    h += '<span class="pp-vocab-word">' + vw.word + '</span>';
    h += '<span class="pp-vocab-def">' + vw.def + '</span>';
    if (vw.stars < 0) {
      h += '<span class="pp-vocab-new">new</span>';
    } else {
      h += '<span class="pp-vocab-stars">';
      for (var si = 0; si < vw.stars; si++) h += '\u2605';
      if (vw.stars === 0) h += '\u2606';
      h += '</span>';
    }
    h += '</div>';
  }
  h += '<div class="text-center" style="padding:8px">';
  h += '<button class="btn btn-sm" onclick="openDeck(' + vocabInfo.levelIdx + ')">';
  h += '\ud83d\udcd6 ' + t('Study Vocabulary', '\u5b66\u4e60\u8bcd\u6c47') + '</button></div>';
  h += '</div>';
  return h;
}

function _ppRenderKPModule(q) {
  if (_ppSession.mode !== 'practice' || !q.s || typeof getQuestionKPs !== 'function') return '';
  var relKPs = getQuestionKPs(q.s, _ppSession.board);
  if (!relKPs.length) return '';
  var h = '<div class="pp-ms-toggle" role="button" tabindex="0" data-action="toggleKP">';
  h += '<span id="pp-kp-arrow">\u25b6</span> ';
  h += t('Related Knowledge Points', '\u76f8\u5173\u77e5\u8bc6\u70b9');
  h += ' <span class="text-muted-sm">(' + relKPs.length + ')</span>';
  h += '</div>';
  h += '<div class="pp-ms-content" id="pp-kp-body">';
  for (var ki = 0; ki < relKPs.length; ki++) {
    var rkp = relKPs[ki];
    var kpBadge = rkp.fs === 'mastered' ? '\u2705' : rkp.fs === 'uncertain' ? '\ud83d\udfe1' : rkp.fs === 'learning' ? '\ud83d\udfe2' : '\u26aa';
    h += '<div class="pp-vocab-row">';
    h += '<span class="pp-vocab-word">' + escapeHtml(rkp.title) + '</span>';
    if (rkp.title_zh) h += '<span class="pp-vocab-def">' + escapeHtml(rkp.title_zh) + '</span>';
    h += '<span class="pp-kp-badge">' + kpBadge + '</span>';
    h += '</div>';
  }
  h += '</div>';
  return h;
}

/* ═══ PRACTICE MODE ═══ */

function renderPPCard() {
  if (!_ppSession) return;
  var el = E('panel-pastpaper');
  if (!el) return;
  var q = _ppSession.questions[_ppSession.current];
  var total = _ppSession.questions.length;
  var idx = _ppSession.current;
  var mastery = _ppGetQMastery(q.id);

  var html = '';

  /* Header */
  html += '<div class="page-header page-header--mb12">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  if (_ppSession.isDiagnostic) {
    html += '<div class="flex-1 text-center text-sm fw-600" style="color:var(--c-primary)">';
    html += '\ud83c\udfaf ' + t('Diagnostic Test', '\u8bca\u65ad\u6d4b\u8bd5');
    html += '</div>';
  } else if (_ppSession.isMock) {
    html += '<div class="flex-1 text-center text-sm fw-600" style="color:var(--c-warning)">';
    html += '\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u8003\u8bd5') + ' \u00b7 ' + _ppSession.totalMarks + ' marks';
    html += '</div>';
  } else if (_ppSession.paperKey) {
    var _hMeta = getPaperMeta(_ppSession.board)[_ppSession.paperKey];
    if (_hMeta) {
      var _hSl = PP_SESSION_LABELS[_hMeta.session] || { en: _hMeta.session, zh: _hMeta.session };
      html += '<div class="flex-1 text-center text-sm fw-600 text-muted">';
      html += 'Paper ' + _hMeta.paper + ' \u00b7 ' + _hMeta.year + ' ' + t(_hSl.en, _hSl.zh);
      html += '</div>';
    } else {
      html += '<div class="flex-1"></div>';
    }
  } else {
    html += '<div class="flex-1"></div>';
  }
  if (_ppSession.mode === 'exam') {
    html += '<div class="pp-timer" id="pp-timer">00:00</div>';
  }
  html += '</div>';

  /* Progress */
  var pct = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;
  html += '<div class="pp-progress">';
  html += '<div class="pp-progress-bar"><div class="pp-progress-fill" style="width:' + pct + '%"></div></div>';
  html += '<div class="pp-progress-text">' + (idx + 1) + '/' + total + '</div>';
  html += '</div>';

  /* Group filter label + qtype tag */
  if (_ppSession.groupFilter) {
    html += '<div class="text-center mb-8">';
    html += '<span class="pp-error-chip selected" style="font-size:12px">' + _ppGroupLabel(_ppSession.groupFilter) + '</span>';
    html += ' <span class="pp-filter-link" role="button" tabindex="0" onclick="ppClearFilter()">' + t('Show all', '\u663e\u793a\u5168\u90e8') + '</span>';
    html += '</div>';
  }
  /* Command word filter chip */
  if (_ppSession.cmdFilter) {
    html += '<div class="text-center mb-8">';
    html += '<span class="pp-cmd-badge" style="font-size:12px;padding:3px 10px">' + _ppCmdLabel(_ppSession.cmdFilter) + '</span>';
    html += ' <span class="pp-filter-link" role="button" tabindex="0" onclick="ppClearCmdFilter()">' + t('Show all', '\u663e\u793a\u5168\u90e8') + '</span>';
    html += '</div>';
  }

  /* Card */
  html += '<div class="pp-card">';

  /* Card header */
  html += '<div class="pp-card-header">';
  html += '<div>' + _ppDiffLabel(q.d, _ppSession.board) + ' <span class="pp-src">' + q.src + '</span>';
  if (q.cmd && q.cmd !== 'other') {
    html += ' <span class="pp-cmd-badge">' + _ppCmdLabel(q.cmd) + '</span>';
  }
  html += '</div>';
  html += '<div class="pp-marks-badge">' + q.marks + (q.marks === 1 ? ' mark' : ' marks') + '</div>';
  html += '</div>';

  /* Question type tag */
  if (q.g && _ppGroupLabels[q.g]) {
    html += '<div style="padding:4px 16px 0;font-size:11px;color:var(--c-muted)">' + _ppGroupLabel(q.g) + '</div>';
  }

  /* Render card modules in configurable order (v4.3.3) */
  var _ppDefaultModOrder = ['body', 'answers', 'vocab', 'kp'];
  var _modOrder = q.moduleOrder || _ppDefaultModOrder;
  var _showAnsLine = _ppSession.mode !== 'exam';
  for (var _moi = 0; _moi < _modOrder.length; _moi++) {
    switch (_modOrder[_moi]) {
      case 'body':    html += _ppRenderBodyModule(q, _showAnsLine); break;
      case 'answers': html += _ppRenderAnswersModule(q); break;
      case 'vocab':   html += _ppRenderVocabModule(q); break;
      case 'kp':      html += _ppRenderKPModule(q); break;
    }
  }

  html += '</div>'; /* end pp-card */

  /* Self-assessment (practice mode) */
  if (_ppSession.mode === 'practice') {
    html += '<div class="mt-16 pp-self-assess-wrap">';
    html += '<div class="pp-self-assess-hint">';
    html += t('How did you do?', '\u4f60\u505a\u5f97\u5982\u4f55\uff1f');
    html += '</div>';
    html += '<div class="pp-rate-row">';
    html += '<button class="pp-rate-btn needs-work' + (mastery === 'needs_work' ? ' selected' : '') + '" onclick="ppRate(\'needs_work\')">';
    html += '\ud83d\udd34 ' + t('Needs Work', '\u8fd8\u6709\u95ee\u9898') + '</button>';
    html += '<button class="pp-rate-btn partial' + (mastery === 'partial' ? ' selected' : '') + '" onclick="ppRate(\'partial\')">';
    html += '\ud83d\udfe1 ' + t('Partial', '\u90e8\u5206\u638c\u63e1') + '</button>';
    html += '<button class="pp-rate-btn mastered' + (mastery === 'mastered' ? ' selected' : '') + '" onclick="ppRate(\'mastered\')">';
    html += '\u2705 ' + t('Mastered', '\u5df2\u638c\u63e1') + '</button>';
    html += '</div></div>';
  }

  /* Exam mode: flag + submit */
  if (_ppSession.mode === 'exam') {
    var flagged = _ppSession.results[idx] && _ppSession.results[idx].flagged;
    html += '<div class="mt-16 text-center pp-self-assess-wrap">';
    html += '<label class="pp-flag-label">';
    html += '<input type="checkbox" id="pp-flag-cb"' + (flagged ? ' checked' : '') + ' onchange="ppToggleFlag()"> ';
    html += '\u2753 ' + t('Mark as unsure', '\u6807\u8bb0\u4e0d\u786e\u5b9a');
    html += '</label></div>';

    /* Nav dots */
    html += '<div class="pp-nav-dots">';
    for (var di = 0; di < total; di++) {
      var dotCls = 'pp-dot';
      if (di === idx) dotCls += ' current';
      if (_ppSession.results[di] && _ppSession.results[di].flagged) dotCls += ' flagged';
      html += '<div class="' + dotCls + '" onclick="ppGoTo(' + di + ')">' + (di + 1) + '</div>';
    }
    html += '</div>';
  }

  /* Navigation */
  html += '<div class="pp-nav-row">';
  html += '<button class="pp-nav-btn" onclick="ppPrev()"' + (idx === 0 ? ' disabled style="opacity:0.4;pointer-events:none"' : '') + '>';
  html += '\u2190 ' + t('Previous', '\u4e0a\u4e00\u9898') + '</button>';
  if (_ppSession.mode === 'exam' && idx === total - 1) {
    html += '<button class="pp-nav-btn primary" onclick="ppSubmitExam()">';
    html += '\u270b ' + t('Submit', '\u4ea4\u5377') + '</button>';
  } else if (_ppSession.fromMistakeBook && idx === total - 1) {
    html += '<button class="pp-nav-btn primary" onclick="ppNext()">';
    html += '\u2713 ' + t('Done', '\u5b8c\u6210') + '</button>';
  } else {
    html += '<button class="pp-nav-btn primary" onclick="ppNext()">';
    html += t('Next', '\u4e0b\u4e00\u9898') + ' \u2192</button>';
  }
  html += '</div>';

  /* Report + Edit buttons (past paper) */
  html += '<div class="pq-report-row">';
  html += '<button class="pq-report-btn" onclick="reportPastPaperQ()">\ud83d\udea9 ' + t('Report error', '报告错误') + '</button>';
  if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    html += '<button class="pq-edit-btn" onclick="editPastPaperQ()">\u270f\ufe0f ' + t('Edit', '编辑') + '</button>';
  }
  html += '</div>';

  el.innerHTML = html;

  /* Delegated click handler for data-action elements (bind once) */
  if (!_ppDelegated) {
    _ppDelegated = true;
    el.addEventListener('click', function(e) {
      var target = e.target.closest('[data-action]');
      if (!target) return;
      var action = target.dataset.action;
      if (action === 'toggleMS') ppToggleMS();
      else if (action === 'toggleVocab') ppToggleVocab();
      else if (action === 'toggleKP') ppToggleKP();
      else if (action === 'toggleMarkBody') ppToggleMarkBody(Number(target.dataset.idx));
      else if (action === 'recoverVocab') openDeck(Number(target.dataset.levelIdx));
      else if (action === 'recoverKP') openKnowledgePoint(target.dataset.kpId, target.dataset.board);
      else if (action === 'recoverQuestion') ppReviewWrongItem(target.dataset.qid, target.dataset.section, target.dataset.board);
      else if (action === 'recoverPrint') {
        var rpq = _ppSession && _ppSession.questions ? _ppSession.questions[_ppSession.current] : null;
        if (rpq && typeof printRepairWorksheet === 'function') {
          printRepairWorksheet(rpq, _ppSession.sectionId || rpq.s || '', _ppSession.board || '');
        }
      }
      else if (action === 'recoverSkip') _ppRecoverySkip();
    });
  }

  /* KaTeX render */
  var qBody = document.getElementById('pp-question-body');
  if (qBody) renderMath(qBody);

  /* Start exam timer */
  if (_ppSession.mode === 'exam' && !_ppTimer) {
    _ppStartTimer();
  }
}

function ppToggleMS() {
  var body = document.getElementById('pp-ms-body');
  var arrow = document.getElementById('pp-ms-arrow');
  if (!body) return;
  body.classList.toggle('show');
  if (arrow) arrow.textContent = body.classList.contains('show') ? '\u25bc' : '\u25b6';
}

function ppRate(level) {
  if (!_ppSession || _ppSession.mode !== 'practice') return;
  var q = _ppSession.questions[_ppSession.current];
  _ppSetMastery(q.id, level, { source: 'practice' });
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;

  /* Auto-add to wrong book if needs_work (resolve handled by _ppSetMastery) */
  if (level === 'needs_work') {
    ppAddToWrongBook(q.id, '', '', _ppSession.sectionId || q.s || '', _ppSession.board || '');

    /* Record error pattern (v4.3.0: signal-based pipeline) */
    try {
      if (typeof inferPatternSignals === 'function' && typeof updateErrorPatternState === 'function') {
        var _epSec = _ppSession.sectionId || q.s || '';
        var _epBoard = _ppSession.board || '';
        var _epRecovery = typeof getRecoveryCandidates === 'function' ? getRecoveryCandidates(q.id, _epSec, _epBoard) : null;
        var _epSignals = inferPatternSignals(q, _epRecovery, { board: _epBoard });
        /* Debug audit trace (v4.3.0) */
        if (typeof epDebugTrace === 'function') epDebugTrace(q, _epRecovery, { board: _epBoard });
        var _epEvent = typeof createPatternEvent === 'function' ? createPatternEvent(q, _epSec, _epSignals) : null;
        if (_epEvent) {
          var _epState = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
          if (_epState) {
            _epState = updateErrorPatternState(_epState, _epEvent);
            if (typeof setErrorPatternState === 'function') setErrorPatternState(_epState);
          }
        }
      }
    } catch (e) {}

    /* Show Recovery Pack instead of auto-advance */
    _ppShowRecoveryPack(q);
    return;
  }

  /* Auto-advance after short delay (partial / mastered) */
  setTimeout(function() {
    if (_ppSession && _ppSession.current < _ppSession.questions.length - 1) {
      ppNext();
    } else {
      renderPPCard(); /* re-render to show updated state */
    }
  }, 300);
}

/* ═══ RECOVERY PACK ═══ */

var _ppRecoveryAdvancing = false;

function _ppShowRecoveryPack(q) {
  /* Always start fresh — remove any residual pack from previous question */
  var old = document.getElementById('pp-recovery-pack');
  if (old) old.remove();

  var assessWrap = document.querySelector('.pp-self-assess-wrap');
  if (!assessWrap) { _ppRecoverySkip(); return; }

  var sectionId = _ppSession.sectionId || q.s || '';
  var board = _ppSession.board || '';
  var recovery = typeof getRecoveryCandidates === 'function'
    ? getRecoveryCandidates(q.id, sectionId, board) : null;

  if (!recovery || (recovery.weakVocab.length === 0 && recovery.weakKPs.length === 0 && recovery.siblingQuestions.length === 0)) {
    _ppRecoverySkip();
    return;
  }

  var wrap = document.createElement('div');
  wrap.id = 'pp-recovery-pack';

  var html = '<div class="recovery-pack">';
  html += '<div class="recovery-pack-header">';
  html += '<span class="recovery-pack-icon">\ud83e\ude7a</span> ';
  html += t('Recovery Pack', '\u4fee\u590d\u5efa\u8bae');
  html += '</div>';
  html += '<div class="recovery-pack-why">';
  html += t('This question was marked needs work. Here are steps to help you improve.',
            '\u8fd9\u9053\u9898\u88ab\u6807\u8bb0\u4e3a\u201c\u9700\u8981\u52a0\u5f3a\u201d\uff0c\u4ee5\u4e0b\u662f\u7cfb\u7edf\u4e3a\u4f60\u751f\u6210\u7684\u4fee\u590d\u5efa\u8bae\u3002');
  html += '</div>';

  /* Weak vocabulary */
  if (recovery.weakVocab.length > 0) {
    html += '<div class="recovery-pack-section">';
    html += '<div class="recovery-pack-label">\ud83d\udcd6 ' + t('Review Vocabulary', '\u590d\u4e60\u8bcd\u6c47') + '</div>';
    for (var vi = 0; vi < recovery.weakVocab.length; vi++) {
      var v = recovery.weakVocab[vi];
      var vBadge = v.fs === 'learning' ? '\ud83d\udfe2' : v.fs === 'uncertain' ? '\ud83d\udfe1' : '\u26aa';
      html += '<button class="recovery-pack-item" data-action="recoverVocab" data-level-idx="' + v.levelIdx + '" data-word="' + escapeHtml(v.word) + '">';
      html += vBadge + ' <strong>' + escapeHtml(v.word) + '</strong>';
      html += ' <span class="text-muted-sm">' + escapeHtml(v.def) + '</span>';
      html += ' <span class="recovery-fs-label">' + t(v.fs, v.fs === 'learning' ? '\u5b66\u4e60\u4e2d' : v.fs === 'uncertain' ? '\u6a21\u7cca' : '\u65b0\u8bcd') + '</span>';
      html += '</button>';
    }
    html += '</div>';
  }

  /* Weak knowledge points */
  if (recovery.weakKPs.length > 0) {
    html += '<div class="recovery-pack-section">';
    html += '<div class="recovery-pack-label">\ud83e\udde0 ' + t('Review Knowledge', '\u590d\u4e60\u77e5\u8bc6\u70b9') + '</div>';
    for (var ki = 0; ki < recovery.weakKPs.length; ki++) {
      var kp = recovery.weakKPs[ki];
      var kpBadge = kp.fs === 'learning' ? '\ud83d\udfe2' : kp.fs === 'uncertain' ? '\ud83d\udfe1' : '\u26aa';
      html += '<button class="recovery-pack-item" data-action="recoverKP" data-kp-id="' + kp.id + '" data-board="' + board + '">';
      html += kpBadge + ' <strong>' + escapeHtml(kp.title) + '</strong>';
      if (kp.title_zh) html += ' <span class="text-muted-sm">' + escapeHtml(kp.title_zh) + '</span>';
      html += ' <span class="recovery-fs-label">' + t(kp.fs, kp.fs === 'learning' ? '\u5b66\u4e60\u4e2d' : kp.fs === 'uncertain' ? '\u6a21\u7cca' : '\u65b0') + '</span>';
      html += '</button>';
    }
    html += '</div>';
  }

  /* Sibling questions */
  if (recovery.siblingQuestions.length > 0) {
    html += '<div class="recovery-pack-section">';
    html += '<div class="recovery-pack-label">\u270f\ufe0f ' + t('Practice Similar', '\u7c7b\u4f3c\u9898\u76ee') + '</div>';
    for (var si = 0; si < recovery.siblingQuestions.length; si++) {
      var sq = recovery.siblingQuestions[si];
      html += '<button class="recovery-pack-item" data-action="recoverQuestion" data-qid="' + sq.id + '" data-section="' + sectionId + '" data-board="' + board + '">';
      html += '\ud83d\udcdd ' + escapeHtml(sq.src || sq.id) + ' <span class="pp-marks-badge">' + sq.marks + ' mks</span>';
      html += '</button>';
    }
    html += '</div>';
  }

  /* AI Tutor — Recovery Pack hint (v4.0.0) */
  if (typeof getRecoveryPackTutorMessage === 'function') {
    try {
      var _tutorPack = getRecoveryPackTutorMessage(q, sectionId, board, recovery);
      if (_tutorPack && typeof renderTutorBlock === 'function') {
        html += renderTutorBlock(_tutorPack, 'pack');
      }
    } catch (e) {}
  }

  /* Mistake Correction Coach (v4.0.0) */
  if (typeof buildMistakeCorrectionCoach === 'function') {
    try {
      var _coach = buildMistakeCorrectionCoach(q, sectionId, board);
      if (_coach && typeof renderMistakeCoachBlock === 'function') {
        html += renderMistakeCoachBlock(_coach);
      }
    } catch (e) {}
  }

  /* Action buttons */
  html += '<div class="recovery-pack-actions">';
  html += '<button class="btn btn-sm" data-action="recoverPrint">';
  html += '\ud83d\udda8 ' + t('Print Repair Sheet', '\u6253\u5370\u4fee\u590d\u5355') + '</button>';
  html += '<button class="btn btn-sm btn-ghost" data-action="recoverSkip">';
  html += t('Skip \u2192 Next', '\u8df3\u8fc7 \u2192 \u4e0b\u4e00\u9898') + '</button>';
  html += '</div>';
  html += '</div>';

  wrap.innerHTML = html;
  assessWrap.parentNode.insertBefore(wrap, assessWrap.nextSibling);
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function _ppRecoverySkip() {
  /* Guard against double-click */
  if (_ppRecoveryAdvancing) return;
  _ppRecoveryAdvancing = true;

  var pack = document.getElementById('pp-recovery-pack');
  if (pack) pack.remove();

  setTimeout(function() {
    _ppRecoveryAdvancing = false;
    if (_ppSession && _ppSession.current < _ppSession.questions.length - 1) {
      ppNext();
    } else {
      renderPPCard();
    }
  }, 200);
}

function ppPrev() {
  if (!_ppSession || _ppSession.current <= 0) return;
  _ppSession.current--;
  renderPPCard();
}

function ppNext() {
  if (!_ppSession) return;
  if (_ppSession.current < _ppSession.questions.length - 1) {
    _ppSession.current++;
    renderPPCard();
  } else if (_ppSession.fromMistakeBook) {
    /* End of mistake book review — show done and go back */
    _ppSession = null;
    showToast(t('Review complete!', '\u590d\u4e60\u5b8c\u6210\uff01'));
    navTo('mistakes');
  }
}

function ppGoTo(idx) {
  if (!_ppSession || idx < 0 || idx >= _ppSession.questions.length) return;
  _ppSession.current = idx;
  renderPPCard();
}

function ppBack() {
  /* Confirm before leaving an active exam */
  if (_ppSession && _ppSession.mode === 'exam' && _ppSession.startTime) {
    var html = '<h3 class="section-title">' + t('Quit Exam?', '\u9000\u51fa\u8003\u8bd5\uff1f') + '</h3>';
    html += '<p style="color:var(--c-text2);margin:12px 0">' + t('Your progress will be lost.', '\u8fdb\u5ea6\u5c06\u4e22\u5931\uff0c\u786e\u5b9a\u9000\u51fa\u5417\uff1f') + '</p>';
    html += '<div class="btn-row btn-row--gap12 btn-row--end btn-row--mt16">';
    html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
    html += '<button class="btn btn-primary" onclick="hideModal();ppForceBack()">' + t('Quit', '\u786e\u5b9a\u9000\u51fa') + '</button>';
    html += '</div>';
    showModal(html);
    return;
  }
  ppForceBack();
}

function ppForceBack() {
  if (_ppTimer) { clearInterval(_ppTimer); _ppTimer = null; }
  var wasPaper = _ppSession && _ppSession.paperKey;
  var wasDiag = _ppSession && _ppSession.isDiagnostic;
  var wasMock = _ppSession && _ppSession.isMock;
  var fromMistakeBook = _ppSession && _ppSession.fromMistakeBook;
  var board = _ppSession ? _ppSession.board : 'cie';
  _ppSession = null;
  if (fromMistakeBook) {
    navTo('mistakes');
  } else if (wasPaper) {
    ppShowPaperBrowse(board);
  } else if (wasDiag || wasMock) {
    navTo('home');
  } else {
    showPanel('section');
  }
}

function ppClearFilter() {
  if (!_ppSession) return;
  startPastPaper(_ppSession.sectionId, _ppSession.board, _ppSession.mode, null, _ppSession.cmdFilter || null);
}

function _ppCmdLabel(ck) {
  var cl = (typeof PP_CMD_LABELS !== 'undefined') ? PP_CMD_LABELS[ck] : null;
  return cl ? t(cl.en, cl.zh) : ck;
}

function ppClearCmdFilter() {
  if (!_ppSession) return;
  startPastPaper(_ppSession.sectionId, _ppSession.board, _ppSession.mode, _ppSession.groupFilter || null, null);
}

/* ═══ WEAK GROUP ANALYSIS ═══ */

function ppGetWeakGroups(board, sectionId) {
  var allQ = getPPBySection(board, sectionId);
  var mastery = _ppGetMastery();
  var groups = {};
  for (var i = 0; i < allQ.length; i++) {
    var g = allQ[i].g || 'mixed';
    if (!groups[g]) groups[g] = { total: 0, mastered: 0, attempted: 0 };
    groups[g].total++;
    var qm = mastery[allQ[i].id];
    if (qm) {
      groups[g].attempted++;
      if ((qm.fs || qm.m) === 'mastered') groups[g].mastered++;
    }
  }
  var weak = [];
  for (var gk in groups) {
    var gr = groups[gk];
    if (gr.attempted === 0) continue; /* skip untouched groups */
    var pct = Math.round(gr.mastered / gr.total * 100);
    if (pct < 60) weak.push({ group: gk, pct: pct, total: gr.total, mastered: gr.mastered });
  }
  weak.sort(function(a, b) { return a.pct - b.pct; });
  return weak;
}

/* ═══ DIAGNOSTIC TEST ═══ */

function startDiagnostic(board) {
  if (typeof isGuest === 'function' && isGuest()) { showToast(t('Register free to unlock Diagnostic', '免费注册解锁诊断测试')); return; }
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  /* Decay warning (#9) */
  var _overdueDiag = typeof getDueWords === 'function' ? getDueWords().length : 0;
  if (_overdueDiag > 20) {
    showToast(t('You have ' + _overdueDiag + ' words overdue for review', '你有 ' + _overdueDiag + ' 个词已过期待复习'));
  }

  showToast(t('Preparing diagnostic...', '\u51c6\u5907\u8bca\u65ad\u6d4b\u8bd5\u4e2d...'));

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var allQ = getPPQuestions(board);
    if (!allQ || allQ.length === 0) {
      showToast(t('No questions available', '\u6682\u65e0\u9898\u76ee'));
      return;
    }

    /* Group questions by section */
    var secQs = {};
    for (var i = 0; i < allQ.length; i++) {
      var s = allQ[i].s;
      if (!s) continue;
      if (!secQs[s]) secQs[s] = [];
      secQs[s].push(allQ[i]);
    }

    /* Weight sections by health: weaker sections get more weight */
    var secIds = Object.keys(secQs);
    var weighted = [];
    for (var si = 0; si < secIds.length; si++) {
      var sid = secIds[si];
      var health = (typeof getSectionHealth === 'function') ? getSectionHealth(sid, board) : null;
      var weight = 1;
      if (health) {
        if (health.score < 20) weight = 3;
        else if (health.score < 50) weight = 2;
        else if (health.score >= 80) weight = 0.5;
      }
      weighted.push({ id: sid, qs: secQs[sid], weight: weight });
    }

    /* Select ~20 questions ensuring breadth */
    var selected = [];
    var maxPerSec = 3;
    var target = 20;

    /* First pass: 1 question per section (shuffled) */
    weighted.sort(function() { return Math.random() - 0.5; });
    for (var wi = 0; wi < weighted.length && selected.length < target; wi++) {
      var pool = weighted[wi].qs.slice().sort(function() { return Math.random() - 0.5; });
      selected.push(pool[0]);
      weighted[wi]._picked = 1;
    }

    /* Second pass: fill remaining slots weighted by weakness */
    if (selected.length < target) {
      var remaining = [];
      for (var ri = 0; ri < weighted.length; ri++) {
        var w = weighted[ri];
        var picked = w._picked || 0;
        if (picked >= maxPerSec) continue;
        for (var qi = 1; qi < w.qs.length && picked < maxPerSec; qi++) {
          var already = false;
          for (var si2 = 0; si2 < selected.length; si2++) {
            if (selected[si2].id === w.qs[qi].id) { already = true; break; }
          }
          if (!already) {
            remaining.push({ q: w.qs[qi], weight: w.weight });
            picked++;
          }
        }
      }
      /* Weighted shuffle */
      remaining.sort(function(a, b) { return (Math.random() * b.weight) - (Math.random() * a.weight); });
      for (var fi = 0; fi < remaining.length && selected.length < target; fi++) {
        selected.push(remaining[fi].q);
      }
    }

    /* Shuffle final order */
    selected.sort(function() { return Math.random() - 0.5; });

    _ppSession = {
      questions: selected,
      current: 0,
      mode: 'exam',
      board: board,
      sectionId: null,
      isDiagnostic: true,
      startTime: Date.now(),
      results: [],
      totalMarks: 0
    };

    for (var mi = 0; mi < selected.length; mi++) {
      _ppSession.totalMarks += selected[mi].marks;
      _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
    }

    showPanel('pastpaper');
    renderPPCard();
  }).catch(function() {
    showToast(t('Failed to load questions', '\u52a0\u8f7d\u5931\u8d25'));
  });
}

function _diagShowResults(exam, conceptErrors) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var pct = exam.totalMarks > 0 ? Math.round((exam.scored / exam.totalMarks) * 100) : 0;
  var pctClass = pct >= 70 ? 'good' : pct >= 40 ? 'ok' : 'low';
  var min = Math.floor(exam.duration / 60);
  var sec = exam.duration % 60;

  var html = '<div class="pp-results">';

  /* Header */
  var _isMockExam = _ppSession && _ppSession.isMock;
  html += '<div class="pp-results-score">';
  html += '<h2>' + (_isMockExam ? '\ud83c\udfb2 ' + t('Mock Exam Results', '\u6a21\u62df\u8003\u8bd5\u7ed3\u679c') : '\ud83c\udfaf ' + t('Diagnostic Results', '\u8bca\u65ad\u7ed3\u679c')) + '</h2>';
  html += '<div class="pp-results-pct ' + pctClass + '">' + exam.scored + ' / ' + exam.totalMarks + ' (' + pct + '%)</div>';
  html += '<div class="pp-results-time">\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
  html += '</div>';

  /* Section-by-section breakdown */
  var secResults = {};
  for (var i = 0; i < exam.questions.length; i++) {
    var qr = exam.questions[i];
    var q = _ppSession ? _ppSession.questions[i] : null;
    var sid = q ? q.s : 'unknown';
    if (!secResults[sid]) secResults[sid] = { scored: 0, total: 0, count: 0 };
    secResults[sid].scored += qr.scored || 0;
    secResults[sid].total += qr.marks || 0;
    secResults[sid].count++;
  }

  var secKeys = Object.keys(secResults).sort(function(a, b) {
    var pa = secResults[a].total > 0 ? secResults[a].scored / secResults[a].total : 0;
    var pb = secResults[b].total > 0 ? secResults[b].scored / secResults[b].total : 0;
    return pa - pb;
  });

  html += '<h4 class="sub-heading">' + t('By Topic', '\u6309\u77e5\u8bc6\u70b9') + '</h4>';
  var board = _ppSession ? _ppSession.board : 'cie';
  for (var si = 0; si < secKeys.length; si++) {
    var sk = secKeys[si];
    var sr = secResults[sk];
    var spct = sr.total > 0 ? Math.round(sr.scored / sr.total * 100) : 0;
    var icon = spct >= 80 ? '\u2705' : spct >= 40 ? '\ud83d\udfe1' : '\ud83d\udd34';
    var info = (typeof getSectionInfo === 'function') ? getSectionInfo(sk, board) : null;
    var secLabel = info ? info.section.title : sk;

    var spctColor = spct >= 80 ? 'var(--c-success)' : spct >= 40 ? 'var(--c-warning)' : 'var(--c-danger)';
    html += '<div class="diag-section-row" role="button" tabindex="0" onclick="openSection(\'' + sk + '\',\'' + board + '\')">';
    html += '<span class="diag-icon">' + icon + '</span>';
    html += '<div class="diag-label-col">';
    html += '<span class="diag-label">' + sk + ' ' + escapeHtml(secLabel) + '</span>';
    html += '<div class="diag-bar"><div class="diag-bar-fill" style="width:' + spct + '%;background:' + spctColor + '"></div></div>';
    html += '</div>';
    html += '<span class="diag-score">' + sr.scored + '/' + sr.total + '</span>';
    html += '<span class="diag-pct" style="color:' + spctColor + '">' + spct + '%</span>';
    html += '</div>';
  }

  /* Weak sections recommendation */
  var weakSecs = secKeys.filter(function(k) {
    return secResults[k].total > 0 && (secResults[k].scored / secResults[k].total) < 0.5;
  });
  if (weakSecs.length > 0) {
    html += '<div class="diag-recs">';
    html += '<div class="diag-recs-title">\u26a0\ufe0f ' + t('Recommended Focus', '\u5efa\u8bae\u91cd\u70b9\u590d\u4e60') + '</div>';
    for (var wi = 0; wi < Math.min(weakSecs.length, 5); wi++) {
      var wk = weakSecs[wi];
      var wInfo = (typeof getSectionInfo === 'function') ? getSectionInfo(wk, board) : null;
      var wLabel = wInfo ? wInfo.section.title : wk;
      html += '<div class="diag-rec-item" role="button" tabindex="0" onclick="openSection(\'' + wk + '\',\'' + board + '\')">';
      html += '<span>' + wk + ' ' + escapeHtml(wLabel) + '</span>';
      html += '<span class="diag-rec-go">' + t('Review', '\u53bb\u590d\u4e60') + ' \u2192</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  /* Save diagnostic result */
  var diagResult = { date: new Date().toISOString(), board: board, score: exam.scored, total: exam.totalMarks, pct: pct, sections: secResults, isMock: !!_isMockExam };
  try {
    var diagHistory = JSON.parse(localStorage.getItem('diag_history') || '[]');
    diagHistory.push(diagResult);
    if (diagHistory.length > 10) diagHistory = diagHistory.slice(-10);
    localStorage.setItem('diag_history', JSON.stringify(diagHistory));
  } catch(e) {}

  /* History trend chart (show if >=2 results) */
  if (diagHistory && diagHistory.length >= 2) {
    html += '<div class="diag-trend">';
    html += '<h4 class="sub-heading">' + t('Score History', '\u6210\u7ee9\u8d8b\u52bf') + '</h4>';
    html += '<div class="diag-trend-chart">';
    for (var hi = 0; hi < diagHistory.length; hi++) {
      var dh = diagHistory[hi];
      var dhPct = dh.pct || 0;
      var dhColor = dhPct >= 70 ? 'var(--c-success)' : dhPct >= 40 ? 'var(--c-warning)' : 'var(--c-danger)';
      var dhDate = dh.date ? dh.date.slice(5, 10) : '';
      var dhType = dh.isMock ? 'Mock' : 'Diag';
      var dhTip = dhDate + ' ' + dhType + ': ' + dhPct + '%';
      html += '<div class="diag-trend-col" title="' + escapeHtml(dhTip) + '">';
      html += '<div class="diag-trend-bar" style="height:' + dhPct + '%;background:' + dhColor + '">';
      html += '<span class="diag-trend-val">' + dhPct + '</span>';
      html += '</div>';
      html += '<div class="diag-trend-label">' + dhDate + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  /* Action buttons */
  html += '<div class="btn-row btn-row--gap12 btn-row--center btn-row--mt24 btn-row--wrap pb-40">';
  if (_isMockExam) {
    html += '<button class="btn btn-primary" onclick="ppShowMockSetup(\'' + board + '\')">\ud83d\udd04 ' + t('New Mock', '\u65b0\u6a21\u62df\u5377') + '</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="startDiagnostic(\'' + board + '\')">\ud83d\udd04 ' + t('Retry', '\u91cd\u65b0\u6d4b\u8bd5') + '</button>';
    html += '<button class="btn btn-ghost" onclick="ppShowMockSetup(\'' + board + '\')" style="border-color:var(--c-warning);color:var(--c-warning)">\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u5377') + '</button>';
  }
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">\u2190 ' + t('Home', '\u9996\u9875') + '</button>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
  renderMath(el);
}

/* ═══ LEARNING LOOP HELPERS ═══ */

function _getSectionLevelIdx(sectionId, board) {
  var map = (typeof _boardSectionLevelMap !== 'undefined') ? _boardSectionLevelMap[board] : null;
  if (!map || map[sectionId] === undefined) return -1;
  return map[sectionId];
}

function _getNextSection(sectionId, board) {
  var syllabus = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[board] : null;
  if (!syllabus || !syllabus.chapters) return null;
  for (var ci = 0; ci < syllabus.chapters.length; ci++) {
    var secs = syllabus.chapters[ci].sections;
    for (var si = 0; si < secs.length; si++) {
      if (secs[si].id === sectionId) {
        if (si + 1 < secs.length) return secs[si + 1].id;
        if (ci + 1 < syllabus.chapters.length && syllabus.chapters[ci + 1].sections.length > 0) {
          return syllabus.chapters[ci + 1].sections[0].id;
        }
        return null;
      }
    }
  }
  return null;
}

/* ═══ RELATED VOCABULARY ═══ */

function _ppGetSectionVocab(sectionId, board) {
  var map = (typeof _boardSectionLevelMap !== 'undefined') ? _boardSectionLevelMap[board] : null;
  if (!map || map[sectionId] === undefined) return null;
  var li = map[sectionId];
  var lv = LEVELS[li];
  if (!lv || !lv.vocabulary) return null;
  var wd = getWordData();
  var words = [];
  for (var i = 0; i < lv.vocabulary.length; i += 2) {
    var item = lv.vocabulary[i];
    var def  = lv.vocabulary[i + 1];
    var key = wordKey(li, item.id);
    var d = wd[key] || {};
    var stars = (d.ok !== undefined) ? computeStars(d.ok || 0, d.fail || 0) : -1;
    words.push({ word: item.content, def: def.content, stars: stars, key: key });
  }
  return { levelIdx: li, slug: lv.slug, title: lv.title, words: words };
}

function ppToggleVocab() {
  var body = document.getElementById('pp-vocab-body');
  var arrow = document.getElementById('pp-vocab-arrow');
  if (!body) return;
  body.classList.toggle('show');
  if (arrow) arrow.textContent = body.classList.contains('show') ? '\u25bc' : '\u25b6';
}

function ppToggleKP() {
  var body = document.getElementById('pp-kp-body');
  var arrow = document.getElementById('pp-kp-arrow');
  if (!body) return;
  body.classList.toggle('show');
  if (arrow) arrow.textContent = body.classList.contains('show') ? '\u25bc' : '\u25b6';
}

/* ═══ EXAM MODE ═══ */

function ppShowExamSetup(sectionId, board, questions) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var totalMarks = 0;
  for (var i = 0; i < questions.length; i++) totalMarks += questions[i].marks;
  var refTime = totalMarks; /* 1 min per mark */

  var html = '';
  html += '<div class="page-header page-header--mb20">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '</div>';

  html += '<div class="pp-setup">';
  html += '<h3>\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</h3>';
  html += '<p class="desc">' + t('Section', '\u77e5\u8bc6\u70b9') + ' ' + sectionId + ' \u00b7 ' + questions.length + ' ' + t('questions', '\u9898') + '</p>';

  /* Question count selector */
  html += '<div class="pp-setup-row">';
  html += '<span>' + t('Questions', '\u9898\u91cf') + '</span>';
  html += '<div class="pp-setup-options" id="pp-exam-count">';
  var counts = [10, 20, questions.length];
  for (var ci = 0; ci < counts.length; ci++) {
    var c = counts[ci];
    if (c > questions.length) continue;
    var label = c === questions.length ? t('All', '\u5168\u90e8') + ' (' + c + ')' : '' + c;
    var active = ci === 0 ? ' active' : '';
    html += '<div class="pp-setup-opt' + active + '" role="button" tabindex="0" onclick="ppSetupCount(this,' + c + ')">' + label + '</div>';
  }
  html += '</div></div>';

  /* Reference time */
  var defaultCount = Math.min(10, questions.length);
  var defaultMarks = 0;
  var shuffled = questions.slice().sort(function() { return Math.random() - 0.5; });
  for (var mi = 0; mi < defaultCount && mi < shuffled.length; mi++) defaultMarks += shuffled[mi].marks;
  html += '<div class="pp-setup-row">';
  html += '<span>' + t('Reference time', '\u53c2\u8003\u65f6\u95f4') + '</span>';
  html += '<span id="pp-exam-time" class="fw-600">\u2248 ' + defaultMarks + ' min</span>';
  html += '</div>';

  html += '<div class="mt-24">';
  html += '<button class="btn btn-primary btn-lg" onclick="ppStartExam(\'' + sectionId + '\',\'' + board + '\')">';
  html += '\u25b6 ' + t('Start Exam', '\u5f00\u59cb\u5b9e\u6218') + '</button>';
  html += '</div>';

  html += '</div>';

  el.innerHTML = html;
  showPanel('pastpaper');

  /* Store setup state */
  window._ppSetupBoard = board;
  window._ppSetupSection = sectionId;
  window._ppSetupCount = defaultCount;
  window._ppSetupQuestions = questions;
}

function ppSetupCount(el, count) {
  var opts = el.parentElement.querySelectorAll('.pp-setup-opt');
  for (var i = 0; i < opts.length; i++) opts[i].classList.remove('active');
  el.classList.add('active');
  window._ppSetupCount = count;

  /* Update reference time */
  var questions = window._ppSetupQuestions || [];
  var shuffled = questions.slice().sort(function() { return Math.random() - 0.5; });
  var marks = 0;
  for (var j = 0; j < count && j < shuffled.length; j++) marks += shuffled[j].marks;
  var timeEl = document.getElementById('pp-exam-time');
  if (timeEl) timeEl.textContent = '\u2248 ' + marks + ' min';
}

function ppStartExam(sectionId, board) {
  var questions = window._ppSetupQuestions || [];
  var count = window._ppSetupCount || 10;

  /* Shuffle and select */
  var selected = questions.slice().sort(function() { return Math.random() - 0.5; }).slice(0, count);

  _ppSession = {
    questions: selected,
    current: 0,
    mode: 'exam',
    board: board,
    sectionId: sectionId,
    startTime: Date.now(),
    results: [],
    totalMarks: 0
  };

  /* Calculate total marks */
  for (var i = 0; i < selected.length; i++) {
    _ppSession.totalMarks += selected[i].marks;
    _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
  }

  renderPPCard();
}

function _ppStartTimer() {
  if (_ppTimer) clearInterval(_ppTimer);
  _ppTimer = setInterval(function() {
    if (!_ppSession || _ppSession.mode !== 'exam') { clearInterval(_ppTimer); _ppTimer = null; return; }
    var timerEl = document.getElementById('pp-timer');
    if (!timerEl) return;
    var elapsed = Math.floor((Date.now() - _ppSession.startTime) / 1000);

    if (_ppSession.timeLimit) {
      /* Countdown mode */
      var remaining = _ppSession.timeLimit - elapsed;
      if (remaining <= 0) {
        timerEl.textContent = '00:00';
        timerEl.className = 'pp-timer danger';
        clearInterval(_ppTimer); _ppTimer = null;
        ppSubmitExam();
        return;
      }
      var min = Math.floor(remaining / 60);
      var sec = remaining % 60;
      timerEl.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
      if (remaining <= 300) timerEl.className = 'pp-timer danger';
      else if (remaining <= 600) timerEl.className = 'pp-timer warning';
      else timerEl.className = 'pp-timer';
    } else {
      /* Count-up mode */
      var min = Math.floor(elapsed / 60);
      var sec = elapsed % 60;
      timerEl.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
      var refSec = _ppSession.totalMarks * 60;
      if (elapsed > refSec * 1.2) timerEl.className = 'pp-timer danger';
      else if (elapsed > refSec) timerEl.className = 'pp-timer warning';
      else timerEl.className = 'pp-timer';
    }
  }, 1000);
}

function ppToggleFlag() {
  if (!_ppSession) return;
  var idx = _ppSession.current;
  if (!_ppSession.results[idx]) _ppSession.results[idx] = { flagged: false };
  _ppSession.results[idx].flagged = !_ppSession.results[idx].flagged;
}

function ppSubmitExam() {
  if (!_ppSession || _ppSession.mode !== 'exam') return;
  if (_ppTimer) { clearInterval(_ppTimer); _ppTimer = null; }
  var duration = Math.floor((Date.now() - _ppSession.startTime) / 1000);
  _ppSession.duration = duration;
  ppShowMarking();
}

/* ═══ MARKING ═══ */

function ppShowMarking() {
  if (!_ppSession) return;
  var el = E('panel-pastpaper');
  if (!el) return;

  var qs = _ppSession.questions;
  var duration = _ppSession.duration || 0;
  var min = Math.floor(duration / 60);
  var sec = duration % 60;

  var html = '';
  html += '<div class="page-header page-header--mb12">';
  html += '<h3 class="mt-0 mb-0 flex-1">' + t('Mark Your Answers', '\u6279\u6539\u7b54\u5377') + '</h3>';
  html += '<div class="pp-src">\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
  html += '</div>';

  for (var i = 0; i < qs.length; i++) {
    var q = qs[i];
    var r = _ppSession.results[i] || {};

    html += '<div class="pp-mark-item" id="pp-mark-' + i + '">';

    /* Header */
    html += '<div class="pp-mark-header" role="button" tabindex="0" data-action="toggleMarkBody" data-idx="' + i + '">';
    html += '<div><strong>Q' + (i + 1) + '</strong> <span class="pp-src">' + q.src + '</span> ';
    html += '<span class="pp-marks-badge">' + q.marks + (q.marks === 1 ? ' mk' : ' mks') + '</span>';
    if (r.flagged) html += ' \u2753';
    html += '</div>';
    html += '<div id="pp-mark-status-' + i + '" class="text-sm"></div>';
    html += '</div>';

    /* Body (collapsed by default) */
    html += '<div class="pp-mark-body d-none" id="pp-mark-body-' + i + '">';

    /* Question preview */
    html += '<div class="pp-mark-tex">';
    html += _ppRenderTex(q);
    html += _ppRenderFigures(q);
    html += '</div>';

    /* Self-assessment */
    html += '<div class="pp-rate-row mb-8">';
    html += '<button class="pp-rate-btn mastered" onclick="ppMarkRate(' + i + ',\'correct\',this)">\u2705 ' + t('All correct', '\u5168\u5bf9') + '</button>';
    html += '<button class="pp-rate-btn partial" onclick="ppMarkRate(' + i + ',\'partial\',this)">\ud83d\udfe1 ' + t('Partial', '\u90e8\u5206') + '</button>';
    html += '<button class="pp-rate-btn needs-work" onclick="ppMarkRate(' + i + ',\'wrong\',this)">\ud83d\udd34 ' + t('Wrong', '\u9519\u8bef') + '</button>';
    html += '</div>';

    /* Score input */
    html += '<div class="pp-mark-score">';
    html += '<span class="text-sm">' + t('Score', '\u5f97\u5206') + ':</span>';
    html += '<input type="number" min="0" max="' + q.marks + '" id="pp-score-' + i + '" onchange="ppScoreChange(' + i + ',' + q.marks + ')" placeholder="0">';
    html += '<span class="text-sm">/ ' + q.marks + '</span>';
    html += '</div>';

    /* Error type chips */
    html += '<div class="pp-error-label">' + t('Error type', '\u9519\u56e0') + ':</div>';
    html += '<div class="pp-error-chips">';
    for (var ei = 0; ei < PP_ERROR_TYPES.length; ei++) {
      var et = PP_ERROR_TYPES[ei];
      html += '<span class="pp-error-chip" role="button" tabindex="0" data-err="' + et.id + '" data-qi="' + i + '" onclick="ppToggleError(this)">';
      html += t(et.en, et.zh) + '</span>';
    }
    html += '</div>';

    /* Report + Edit in marking view */
    html += '<div class="pq-report-row mt-8">';
    html += '<button class="pq-report-btn" onclick="reportPastPaperQ(' + i + ')">\ud83d\udea9 ' + t('Report', '报告') + '</button>';
    if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
      html += '<button class="pq-edit-btn" onclick="editPastPaperQ(' + i + ')">\u270f\ufe0f ' + t('Edit', '编辑') + '</button>';
    }
    html += '</div>';

    html += '</div>'; /* end mark-body */
    html += '</div>'; /* end mark-item */
  }

  /* Submit marking */
  html += '<div class="text-center mt-20 pb-40">';
  html += '<button class="btn btn-primary btn-lg" onclick="ppFinishMarking()">';
  html += '\ud83d\udcca ' + t('See Results', '\u67e5\u770b\u7ed3\u679c') + '</button>';
  html += '</div>';

  el.innerHTML = html;

  /* Render KaTeX in all question previews */
  var texEls = el.querySelectorAll('.pp-mark-tex');
  for (var ti = 0; ti < texEls.length; ti++) renderMath(texEls[ti]);
}

function ppToggleMarkBody(idx) {
  var body = document.getElementById('pp-mark-body-' + idx);
  if (body) body.classList.toggle('d-none');
}

function ppMarkRate(idx, status, btn) {
  if (!_ppSession) return;
  _ppSession.results[idx] = _ppSession.results[idx] || {};
  _ppSession.results[idx].status = status;

  /* Update score based on status */
  var q = _ppSession.questions[idx];
  var scoreInput = document.getElementById('pp-score-' + idx);
  if (status === 'correct') {
    _ppSession.results[idx].scored = q.marks;
    if (scoreInput) scoreInput.value = q.marks;
  } else if (status === 'wrong') {
    _ppSession.results[idx].scored = 0;
    if (scoreInput) scoreInput.value = 0;
  }

  /* Update status display */
  var statusEl = document.getElementById('pp-mark-status-' + idx);
  if (statusEl) {
    var labels = { correct: '\u2705', partial: '\ud83d\udfe1', wrong: '\ud83d\udd34' };
    statusEl.textContent = labels[status] || '';
  }

  /* Highlight active button */
  var row = btn.parentElement;
  var btns = row.querySelectorAll('.pp-rate-btn');
  for (var i = 0; i < btns.length; i++) btns[i].style.opacity = '0.5';
  btn.style.opacity = '1';
}

function ppScoreChange(idx, maxMarks) {
  if (!_ppSession) return;
  var input = document.getElementById('pp-score-' + idx);
  if (!input) return;
  var val = parseInt(input.value) || 0;
  if (val < 0) val = 0;
  if (val > maxMarks) val = maxMarks;
  input.value = val;
  _ppSession.results[idx] = _ppSession.results[idx] || {};
  _ppSession.results[idx].scored = val;

  /* Auto-set status */
  if (val === maxMarks) _ppSession.results[idx].status = 'correct';
  else if (val === 0) _ppSession.results[idx].status = 'wrong';
  else _ppSession.results[idx].status = 'partial';
}

function ppToggleError(el) {
  el.classList.toggle('selected');
  var idx = parseInt(el.getAttribute('data-qi'));
  var errId = el.getAttribute('data-err');
  if (!_ppSession) return;
  _ppSession.results[idx] = _ppSession.results[idx] || {};
  _ppSession.results[idx].errorType = errId;
}

/* ═══ PAST PAPER REPORT / EDIT ═══ */

function reportPastPaperQ(qIdx) {
  if (!_ppSession) return;
  var q = (qIdx != null) ? _ppSession.questions[qIdx] : _ppSession.questions[_ppSession.current];
  if (!q) return;

  var types = [
    ['tex', t('Question text error', '题目文本错误')],
    ['latex', t('LaTeX rendering issue', 'LaTeX 渲染问题')],
    ['marks', t('Wrong marks', '分值错误')],
    ['qtype', t('Wrong question type', '题型分类错误')],
    ['source', t('Wrong source info', '来源信息错误')],
    ['figure', t('Figure rendering issue', '图片渲染问题')],
    ['other', t('Other', '其他')]
  ];
  var typeOpts = types.map(function(tp) {
    return '<option value="' + tp[0] + '">' + tp[1] + '</option>';
  }).join('');

  var html = '<div class="section-title">\ud83d\udea9 ' + t('Report Past Paper Error', '报告真题错误') + '</div>';
  html += '<div style="text-align:left;margin-bottom:12px;padding:10px;background:var(--c-surface-alt);border-radius:var(--r);font-size:12px">';
  html += '<strong>#' + escapeHtml(q.id) + '</strong> · ' + escapeHtml(q.src) + '<br>';
  html += '<span class="text-sub">' + escapeHtml(q.tex.substring(0, 100)) + (q.tex.length > 100 ? '...' : '') + '</span>';
  html += '</div>';
  html += '<label class="settings-label">' + t('Error type', '错误类型') + '</label>';
  html += '<select class="bug-select" id="pp-report-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '描述') + ' *</label>';
  html += '<textarea class="bug-textarea" id="pp-report-desc" rows="3" placeholder="' + t('Describe the error...', '请描述错误...') + '"></textarea>';
  html += '<div id="pp-report-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div class="btn-row">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '提交') : t('Submit via Email', '通过邮件提交');
  html += '<button class="btn btn-primary" onclick="submitPPReport(\'' + escapeHtml(q.id) + '\')">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';
  showModal(html);
}

function submitPPReport(qid) {
  var desc = E('pp-report-desc').value.trim();
  if (!desc) {
    E('pp-report-msg').textContent = t('Please describe the error', '请描述错误');
    return;
  }
  var type = E('pp-report-type').value;
  var q = null;
  if (_ppSession) {
    for (var i = 0; i < _ppSession.questions.length; i++) {
      if (_ppSession.questions[i].id === qid) { q = _ppSession.questions[i]; break; }
    }
  }
  if (!q) { hideModal(); return; }

  if (sb && isLoggedIn() && !isGuest()) {
    sb.from('feedback').insert({
      user_id: currentUser.id,
      user_email: currentUser.email,
      type: 'pastpaper',
      description: desc,
      steps: type,
      auto_info: { qid: q.id, board: _ppSession.board, src: q.src, marks: q.marks, g: q.g, tex: q.tex.substring(0, 500) }
    }).then(function(res) {
      if (res.error) {
        E('pp-report-msg').textContent = t('Submit failed: ', '提交失败：') + res.error.message;
        return;
      }
      hideModal();
      showToast(t('Report submitted! Thank you.', '报告已提交，谢谢！'));
    }).catch(function(e) {
      var el = E('pp-report-msg');
      if (el) el.textContent = t('Network error', '网络错误');
    });
    return;
  }

  /* Guest: mailto fallback */
  var subject = '[Past Paper Error] #' + qid + ' - 25Maths Keywords';
  var body = 'Question ID: ' + qid + '\nSource: ' + q.src +
    '\nError type: ' + type + '\n\nDescription:\n' + desc +
    '\n\n--- Question ---\n' + q.tex.substring(0, 500);
  var mailto = 'mailto:support@25maths.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailto, '_blank');
  hideModal();
  showToast(t('Opening email client...', '正在打开邮件客户端...'));
}

function editPastPaperQ(qIdx) {
  if (!_ppSession || !isSuperAdmin()) return;
  var q = (qIdx != null) ? _ppSession.questions[qIdx] : _ppSession.questions[_ppSession.current];
  if (!q) return;

  var html = '<div class="section-title">\u270f\ufe0f ' + t('Edit Past Paper Question', '编辑真题') + ' <span style="color:var(--c-muted);font-size:13px">#' + escapeHtml(q.id) + '</span></div>';

  /* Question info */
  html += '<div style="text-align:left;margin-bottom:12px;padding:10px;background:var(--c-surface-alt);border-radius:var(--r);font-size:12px">';
  html += '<strong>' + escapeHtml(q.src) + '</strong> · ' + q.marks + (q.marks === 1 ? ' mark' : ' marks');
  if (q.g) html += ' · ' + _ppGroupLabel(q.g);
  html += '</div>';

  /* Editable fields */
  html += '<label class="settings-label">' + t('Question Text (LaTeX)', '\u9898\u76ee\u6587\u672c (LaTeX)') + '</label>';
  /* Toolbar */
  html += '<div class="pp-ed-toolbar">';
  html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdInsertTable()" title="' + t('Insert Table', '\u63d2\u5165\u8868\u683c') + '">\ud83d\udcca ' + t('Table', '\u8868\u683c') + '</button>';
  html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdInsertAtCursor(\'$\',\'$\')" title="Math">$x$</button>';
  html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdInsertAtCursor(\'\\\\textbf{\',\'}\')" title="Bold"><strong>B</strong></button>';
  html += '</div>';
  html += '<textarea class="bug-textarea font-mono-sm" id="pp-ed-tex" rows="8">' + escapeHtml(q.tex) + '</textarea>';

  html += '<div class="btn-row btn-row--gap12">';

  /* Marks */
  html += '<div class="flex-1">';
  html += '<label class="settings-label">' + t('Marks', '分值') + '</label>';
  html += '<input type="number" class="bug-select" id="pp-ed-marks" min="1" max="20" value="' + q.marks + '" style="width:100%">';
  html += '</div>';

  /* Difficulty */
  html += '<div class="flex-1">';
  html += '<label class="settings-label">' + t('Difficulty', '难度') + '</label>';
  html += '<select class="bug-select" id="pp-ed-diff" style="width:100%">';
  if (_ppSession && _ppSession.board === 'edx') {
    for (var _di = 1; _di <= 6; _di++) {
      var _dlbl = _di <= 3 ? 'Foundation D' + _di : 'Higher D' + _di;
      html += '<option value="' + _di + '"' + (q.d === _di ? ' selected' : '') + '>' + _dlbl + '</option>';
    }
  } else {
    html += '<option value="1"' + (q.d === 1 ? ' selected' : '') + '>Core</option>';
    html += '<option value="2"' + (q.d === 2 ? ' selected' : '') + '>Extended</option>';
    html += '<option value="3"' + (q.d === 3 ? ' selected' : '') + '>Advanced</option>';
  }
  html += '</select></div>';

  /* Group */
  html += '<div class="flex-1">';
  html += '<label class="settings-label">' + t('Question Type', '题型') + '</label>';
  html += '<select class="bug-select" id="pp-ed-group" style="width:100%">';
  var gKeys = Object.keys(_ppGroupLabels);
  for (var gi = 0; gi < gKeys.length; gi++) {
    var gk = gKeys[gi];
    html += '<option value="' + gk + '"' + (q.g === gk ? ' selected' : '') + '>' + _ppGroupLabel(gk) + '</option>';
  }
  html += '</select></div>';
  html += '</div>';

  /* Parts editor */
  html += '<label class="settings-label">' + t('Parts (sub-questions)', '\u5c0f\u9898') + '</label>';
  html += '<div id="pp-ed-parts">';
  var _edParts = q.parts || [];
  for (var _pi = 0; _pi < _edParts.length; _pi++) {
    html += _ppEdPartRow(_edParts[_pi].label, _edParts[_pi].marks, _pi, _edParts[_pi].ansPrefix, _edParts[_pi].ansSuffix, _edParts[_pi].ansTpl);
  }
  html += '</div>';
  html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdAddPart()">+ ' + t('Add Part', '\u6dfb\u52a0\u5c0f\u9898') + '</button>';

  /* Question-level answer line (for questions without parts) */
  html += '<div id="pp-ed-ansline-wrap" style="margin-top:10px' + (_edParts.length > 0 ? ';display:none' : '') + '">';
  html += '<label class="settings-label">' + t('Answer Line (no-parts questions)', '答题线（无小题）') + '</label>';
  html += '<div class="pp-ed-part-ans">';
  html += '<input type="text" class="bug-select" id="pp-ed-ans-prefix" value="' + escapeHtml(q.ansPrefix || '') + '" placeholder="prefix (e.g. x=)">';
  html += '<input type="text" class="bug-select" id="pp-ed-ans-suffix" value="' + escapeHtml(q.ansSuffix || '') + '" placeholder="suffix (e.g. cm)">';
  html += '<input type="text" class="bug-select" id="pp-ed-ans-tpl" value="' + escapeHtml(q.ansTpl || '') + '" placeholder="template (e.g. (____,____))">';
  html += '</div></div>';

  /* Module order editor (v4.3.3) */
  var DEFAULT_MODULE_ORDER = ['body', 'answers', 'vocab', 'kp'];
  var _edModuleOrder = q.moduleOrder || DEFAULT_MODULE_ORDER;
  var _modLabels = { body: '\ud83d\udcdd Question Body', answers: '\ud83d\udccb Answers', vocab: '\ud83d\udcd6 Related Vocabulary', kp: '\ud83e\udde0 Knowledge Points' };
  html += '<label class="settings-label" style="margin-top:10px">' + t('Module Order', '模块排序') + '</label>';
  html += '<div class="pp-ed-module-list" id="pp-ed-modules">';
  for (var _mi = 0; _mi < _edModuleOrder.length; _mi++) {
    var _mk = _edModuleOrder[_mi];
    html += '<div class="pp-ed-module-row" data-mod="' + _mk + '">';
    html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdMoveModule(this,-1)" title="Move up">\u25b2</button>';
    html += '<button class="btn btn-sm btn-ghost" type="button" onclick="_ppEdMoveModule(this,1)" title="Move down">\u25bc</button>';
    html += '<span>' + (_modLabels[_mk] || _mk) + '</span>';
    html += '</div>';
  }
  html += '</div>';

  /* Preview */
  html += '<div class="mt-12">';
  html += '<label class="settings-label">' + t('Preview', '预览') + '</label>';
  html += '<div id="pp-ed-preview" style="padding:12px;background:var(--c-surface-alt);border-radius:var(--r);font-size:13px;line-height:1.6;max-height:200px;overflow:auto;white-space:pre-line"></div>';
  html += '</div>';

  /* Submit as correction */
  html += '<div id="pp-ed-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" onclick="submitPPEdit(\'' + escapeHtml(q.id) + '\')">\ud83d\udcbe ' + t('Submit Correction', '提交修正') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);

  /* Live preview (use onX to avoid listener accumulation) */
  setTimeout(function() {
    var texEl = E('pp-ed-tex');
    if (texEl) {
      texEl.oninput = _ppUpdateEditPreview;
      _ppUpdateEditPreview();
    }
  }, 50);
}

function _ppUpdateEditPreview() {
  var prev = E('pp-ed-preview');
  var texEl = E('pp-ed-tex');
  if (!prev || !texEl) return;
  var tex = texEl.value;
  /* Runtime tabular → HTML conversion for preview */
  tex = _ppConvertTabularRuntime(tex);
  prev.innerHTML = _ppRenderTex(tex);
  renderMath(prev);
}

/* ═══ Editor helper functions ═══ */

function _ppConvertTabularRuntime(tex) {
  /* Simplified JS version of convert-tables.py for live preview */
  return tex.replace(/\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g, function(m, spec, body) {
    var aligns = [];
    var hasBorders = spec.indexOf('|') >= 0;
    for (var i = 0; i < spec.length; i++) {
      if (spec[i] === 'l') aligns.push('left');
      else if (spec[i] === 'c') aligns.push('center');
      else if (spec[i] === 'r') aligns.push('right');
    }
    var rows = body.split(/\\\\(?:\s*\[[^\]]*\])?/);
    var cls = hasBorders ? 'pp-table' : 'pp-table pp-table-nb';
    var h = '<div class="pp-table-wrap"><table class="' + cls + '">';
    var isFirst = true;
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri].replace(/\\hline/g, '').replace(/\\cline\{[^}]*\}/g, '').trim();
      if (!row) continue;
      var cells = row.split('&');
      var tag = isFirst ? 'th' : 'td';
      h += '<tr>';
      for (var ci = 0; ci < cells.length; ci++) {
        var cell = cells[ci].trim().replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');
        var al = ci < aligns.length ? aligns[ci] : 'center';
        h += '<' + tag + (al !== 'left' ? ' style="text-align:' + al + '"' : '') + '>' + cell + '</' + tag + '>';
      }
      h += '</tr>';
      isFirst = false;
    }
    h += '</table></div>';
    return h;
  });
}

function _ppEdInsertAtCursor(before, after) {
  var texEl = E('pp-ed-tex');
  if (!texEl) return;
  var s = texEl.selectionStart, e = texEl.selectionEnd;
  var sel = texEl.value.substring(s, e);
  texEl.value = texEl.value.slice(0, s) + before + sel + after + texEl.value.slice(e);
  texEl.selectionStart = texEl.selectionEnd = s + before.length + sel.length;
  texEl.focus();
  if (texEl.oninput) texEl.oninput();
}

function _ppEdInsertTable() {
  var texEl = E('pp-ed-tex');
  if (!texEl) return;
  var rows = parseInt(prompt(t('Number of rows (including header):', '\u884c\u6570\uff08\u542b\u8868\u5934\uff09\uff1a'), '3')) || 3;
  var cols = parseInt(prompt(t('Number of columns:', '\u5217\u6570\uff1a'), '3')) || 3;
  var spec = '|' + Array(cols).fill('c').join('|') + '|';
  var tpl = '\\begin{tabular}{' + spec + '}\n\\hline\n';
  for (var r = 0; r < rows; r++) {
    tpl += Array(cols).fill('  ').join(' & ') + ' \\\\\n\\hline\n';
  }
  tpl += '\\end{tabular}';
  var pos = texEl.selectionStart;
  texEl.value = texEl.value.slice(0, pos) + '\n' + tpl + '\n' + texEl.value.slice(pos);
  texEl.focus();
  if (texEl.oninput) texEl.oninput();
}

function _ppEdPartRow(label, marks, idx, ansPrefix, ansSuffix, ansTpl) {
  return '<div class="pp-ed-part-row" data-idx="' + idx + '">' +
    '<input type="text" class="bug-select pp-ed-part-label" value="' + escapeHtml(label) + '" style="width:60px" placeholder="(a)">' +
    '<input type="number" class="bug-select pp-ed-part-marks" value="' + marks + '" min="0" max="20" style="width:60px" placeholder="marks">' +
    '<button class="btn btn-sm btn-ghost" type="button" onclick="this.parentElement.remove()" title="Remove">\u2716</button>' +
    '<div class="pp-ed-part-ans">' +
    '<input type="text" class="bug-select pp-ed-part-prefix" value="' + escapeHtml(ansPrefix || '') + '" placeholder="prefix (e.g. x=)">' +
    '<input type="text" class="bug-select pp-ed-part-suffix" value="' + escapeHtml(ansSuffix || '') + '" placeholder="suffix (e.g. cm)">' +
    '<input type="text" class="bug-select pp-ed-part-tpl" value="' + escapeHtml(ansTpl || '') + '" placeholder="template (e.g. (____,____))">' +
    '</div></div>';
}

function _ppEdAddPart() {
  var container = E('pp-ed-parts');
  if (!container) return;
  var idx = container.children.length;
  /* Auto-suggest next label */
  var nextLabel = '(' + String.fromCharCode(97 + idx) + ')';
  var div = document.createElement('div');
  div.innerHTML = _ppEdPartRow(nextLabel, 1, idx);
  container.appendChild(div.firstChild);
}

function _ppEdCollectParts() {
  var container = E('pp-ed-parts');
  if (!container) return null;
  var rows = container.querySelectorAll('.pp-ed-part-row');
  if (!rows.length) return [];
  var parts = [];
  for (var i = 0; i < rows.length; i++) {
    var label = rows[i].querySelector('.pp-ed-part-label').value.trim();
    var marks = parseInt(rows[i].querySelector('.pp-ed-part-marks').value) || 0;
    if (!label) continue;
    var part = { label: label, marks: marks };
    var pfx = rows[i].querySelector('.pp-ed-part-prefix');
    var sfx = rows[i].querySelector('.pp-ed-part-suffix');
    var tpl = rows[i].querySelector('.pp-ed-part-tpl');
    if (pfx && pfx.value.trim()) part.ansPrefix = pfx.value.trim();
    if (sfx && sfx.value.trim()) part.ansSuffix = sfx.value.trim();
    if (tpl && tpl.value.trim()) part.ansTpl = tpl.value.trim();
    parts.push(part);
  }
  return parts;
}

function _ppEdMoveModule(btn, dir) {
  var row = btn.closest('.pp-ed-module-row');
  var list = row.parentElement;
  var rows = Array.from(list.children);
  var idx = rows.indexOf(row);
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= rows.length) return;
  if (dir === -1) list.insertBefore(row, rows[newIdx]);
  else list.insertBefore(rows[newIdx], row);
}

function _ppEdCollectModuleOrder() {
  var container = E('pp-ed-modules');
  if (!container) return null;
  var rows = container.querySelectorAll('.pp-ed-module-row');
  var order = [];
  for (var i = 0; i < rows.length; i++) {
    order.push(rows[i].dataset.mod);
  }
  return order;
}

function submitPPEdit(qid) {
  if (!_ppSession || !isSuperAdmin()) return;
  var q = null;
  for (var i = 0; i < _ppSession.questions.length; i++) {
    if (_ppSession.questions[i].id === qid) { q = _ppSession.questions[i]; break; }
  }
  if (!q) { hideModal(); return; }

  var newTex = E('pp-ed-tex') ? E('pp-ed-tex').value : q.tex;
  var newMarks = E('pp-ed-marks') ? parseInt(E('pp-ed-marks').value) || q.marks : q.marks;
  var newDiff = E('pp-ed-diff') ? parseInt(E('pp-ed-diff').value) || q.d : q.d;
  var newGroup = E('pp-ed-group') ? E('pp-ed-group').value : q.g;
  var newParts = _ppEdCollectParts();

  /* Question-level answer line (no-parts questions) */
  var newAnsPrefix = E('pp-ed-ans-prefix') ? E('pp-ed-ans-prefix').value.trim() : '';
  var newAnsSuffix = E('pp-ed-ans-suffix') ? E('pp-ed-ans-suffix').value.trim() : '';
  var newAnsTpl = E('pp-ed-ans-tpl') ? E('pp-ed-ans-tpl').value.trim() : '';
  /* Module order */
  var DEFAULT_MODULE_ORDER = ['body', 'answers', 'vocab', 'kp'];
  var newModuleOrder = _ppEdCollectModuleOrder();

  /* Build diff description */
  var changes = [];
  if (newTex !== q.tex) changes.push('tex');
  if (newMarks !== q.marks) changes.push('marks: ' + q.marks + '\u2192' + newMarks);
  if (newDiff !== q.d) changes.push('diff: ' + q.d + '\u2192' + newDiff);
  if (newGroup !== q.g) changes.push('group: ' + q.g + '\u2192' + newGroup);
  if (newParts !== null && JSON.stringify(newParts) !== JSON.stringify(q.parts || [])) changes.push('parts');
  if (newAnsPrefix !== (q.ansPrefix || '')) changes.push('ansPrefix');
  if (newAnsSuffix !== (q.ansSuffix || '')) changes.push('ansSuffix');
  if (newAnsTpl !== (q.ansTpl || '')) changes.push('ansTpl');
  if (newModuleOrder && JSON.stringify(newModuleOrder) !== JSON.stringify(q.moduleOrder || DEFAULT_MODULE_ORDER)) changes.push('moduleOrder');

  if (changes.length === 0) {
    E('pp-ed-msg').textContent = t('No changes detected', '\u672a\u68c0\u6d4b\u5230\u4fee\u6539');
    return;
  }

  var editData = {};
  if (newTex !== q.tex) editData.tex = newTex;
  if (newMarks !== q.marks) editData.marks = newMarks;
  if (newDiff !== q.d) editData.d = newDiff;
  if (newGroup !== q.g) editData.g = newGroup;
  if (newParts !== null && JSON.stringify(newParts) !== JSON.stringify(q.parts || [])) editData.parts = newParts;
  if (newAnsPrefix !== (q.ansPrefix || '')) editData.ansPrefix = newAnsPrefix || null;
  if (newAnsSuffix !== (q.ansSuffix || '')) editData.ansSuffix = newAnsSuffix || null;
  if (newAnsTpl !== (q.ansTpl || '')) editData.ansTpl = newAnsTpl || null;
  if (newModuleOrder && JSON.stringify(newModuleOrder) !== JSON.stringify(q.moduleOrder || DEFAULT_MODULE_ORDER)) editData.moduleOrder = newModuleOrder;

  sb.from('question_edits').upsert({
    qid: q.id,
    board: _ppSession.board,
    data: editData,
    status: 'active',
    updated_by: currentUser.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'qid' }).then(function(res) {
    if (res.error) {
      E('pp-ed-msg').textContent = t('Save failed: ', '保存失败：') + res.error.message;
      return;
    }

    /* Apply change locally for current session */
    q.tex = newTex;
    q.marks = newMarks;
    q.d = newDiff;
    q.g = newGroup;
    if (editData.parts !== undefined) q.parts = newParts;
    if (editData.ansPrefix !== undefined) q.ansPrefix = editData.ansPrefix;
    if (editData.ansSuffix !== undefined) q.ansSuffix = editData.ansSuffix;
    if (editData.ansTpl !== undefined) q.ansTpl = editData.ansTpl;
    if (editData.moduleOrder !== undefined) q.moduleOrder = editData.moduleOrder;
    /* Invalidate edits cache so next load picks up the change */
    _pqEditsCache[_ppSession.board] = null;

    hideModal();
    showToast(t('Correction submitted!', '修正已提交！'));
    renderPPCard();
  }).catch(function(e) {
    var el = E('pp-ed-msg');
    if (el) el.textContent = t('Network error', '网络错误');
  });
}

function ppFinishMarking() {
  if (!_ppSession) return;

  var qs = _ppSession.questions;
  var totalMarks = _ppSession.totalMarks;
  var scored = 0;
  var conceptErrors = {};

  for (var i = 0; i < qs.length; i++) {
    var r = _ppSession.results[i] || {};
    var s = r.scored != null ? r.scored : 0;
    scored += s;

    /* Auto-add wrong/partial to wrong book + FLM mastery (exam source) */
    if (r.status === 'wrong' || r.status === 'partial') {
      ppAddToWrongBook(qs[i].id, r.errorType || '', '', _ppSession.sectionId || '', _ppSession.board || '');
      _ppSetMastery(qs[i].id, r.status === 'wrong' ? 'needs_work' : 'partial', { source: 'exam' });
    } else if (r.status === 'correct') {
      _ppSetMastery(qs[i].id, 'mastered', { source: 'exam' });
    }

    /* Concept analysis */
    var qtype = qs[i].qtype || 'other';
    if (!conceptErrors[qtype]) conceptErrors[qtype] = { total: 0, scored: 0 };
    conceptErrors[qtype].total += qs[i].marks;
    conceptErrors[qtype].scored += s;
  }

  /* Save exam record */
  var examRecord = {
    id: 'exam-' + Date.now(),
    section: _ppSession.sectionId,
    date: Date.now(),
    duration: _ppSession.duration || 0,
    totalMarks: totalMarks,
    scored: scored,
    questions: qs.map(function(q, i) {
      var r = _ppSession.results[i] || {};
      return { qid: q.id, marks: q.marks, scored: r.scored || 0, status: r.status || '', errorType: r.errorType || '' };
    })
  };
  _ppSaveExam(examRecord);

  /* Save paper-level result if this was a full paper exam */
  if (_ppSession.paperKey) {
    _ppSavePaperResult(_ppSession.paperKey, {
      score: scored, total: totalMarks,
      date: new Date().toISOString(),
      time: _ppSession.duration || 0
    });
  }

  /* Show results */
  if (_ppSession && (_ppSession.isDiagnostic || _ppSession.isMock)) {
    _diagShowResults(examRecord, conceptErrors);
  } else {
    ppShowResults(examRecord, conceptErrors);
  }
}

/* ═══ RESULTS ═══ */

function ppShowResults(exam, conceptErrors) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var pct = exam.totalMarks > 0 ? Math.round((exam.scored / exam.totalMarks) * 100) : 0;
  var pctClass = pct >= 70 ? 'good' : pct >= 40 ? 'ok' : 'low';
  var min = Math.floor(exam.duration / 60);
  var sec = exam.duration % 60;

  var html = '';
  html += '<div class="pp-results">';

  /* Score header */
  html += '<div class="pp-results-score">';
  html += '<h2>' + t('Results', '\u7ed3\u679c') + '</h2>';
  html += '<div class="pp-results-pct ' + pctClass + '">' + exam.scored + ' / ' + exam.totalMarks + ' (' + pct + '%)</div>';
  var timeStr = '\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec;
  if (_ppSession && _ppSession.timeLimit) {
    var limMin = Math.floor(_ppSession.timeLimit / 60);
    var limSec = _ppSession.timeLimit % 60;
    timeStr += ' / ' + t('limit', '\u65f6\u9650') + ' ' + limMin + ':' + (limSec < 10 ? '0' : '') + limSec;
  }
  html += '<div class="pp-results-time">' + timeStr + '</div>';
  html += '</div>';

  /* Concept breakdown */
  var concepts = Object.keys(conceptErrors).sort(function(a, b) {
    var ra = conceptErrors[a].scored / conceptErrors[a].total;
    var rb = conceptErrors[b].scored / conceptErrors[b].total;
    return ra - rb;
  });

  if (concepts.length > 0) {
    html += '<h4 class="sub-heading">' + t('By Question Type', '\u6309\u9898\u578b\u5206\u6790') + '</h4>';
    for (var ci = 0; ci < concepts.length; ci++) {
      var c = concepts[ci];
      var ce = conceptErrors[c];
      var cpct = Math.round((ce.scored / ce.total) * 100);
      var icon = cpct >= 80 ? '\u2705' : cpct >= 40 ? '\ud83d\udfe1' : '\ud83d\udd34';
      html += '<div class="pp-cmd-stat-row">';
      html += '<span>' + icon + '</span>';
      html += '<span class="pp-q-topic-cell">' + c + '</span>';
      html += '<span class="pp-cmd-stat-score">' + ce.scored + '/' + ce.total + '</span>';
      html += '</div>';
    }
  }

  /* Focus areas: targeted practice for weak question groups */
  if (_ppSession && _ppSession.sectionId && !_ppSession.paperKey && pct < 80) {
    var _wkGroups = ppGetWeakGroups(_ppSession.board, _ppSession.sectionId);
    if (_wkGroups.length > 0) {
      html += '<div class="pp-focus-areas">';
      html += '<div class="pp-focus-title">' + t('Focus Areas', '\u91cd\u70b9\u7ec3\u4e60') + '</div>';
      html += '<div class="pp-focus-chips">';
      for (var fi = 0; fi < Math.min(_wkGroups.length, 3); fi++) {
        var wg = _wkGroups[fi];
        var gl = PP_GROUP_LABELS[wg.group];
        var glabel = gl ? t(gl.en, gl.zh) : wg.group;
        html += '<span class="pp-focus-chip" data-pp-start data-sec="' + _ppSession.sectionId + '" data-board="' + _ppSession.board + '" data-mode="practice" data-group="' + wg.group + '">';
        html += glabel + ' <span class="pp-focus-pct">' + wg.pct + '%</span></span>';
      }
      html += '</div></div>';
    }
  }

  /* Smart next step based on score */
  if (_ppSession && _ppSession.sectionId && !_ppSession.paperKey) {
    var _nsSecId = _ppSession.sectionId;
    var _nsBoard = _ppSession.board;
    if (pct < 50) {
      var _nsLi = _getSectionLevelIdx(_nsSecId, _nsBoard);
      if (_nsLi >= 0) {
        html += nextStepHTML('\ud83d\udcdd', t('Review Vocabulary', '\u590d\u4e60\u8bcd\u6c47'), 'openDeck(' + _nsLi + ')');
      }
    } else if (pct < 80) {
      html += nextStepHTML('\ud83d\udcd5', t('Review Wrong Questions', '\u590d\u4e60\u9519\u9898'), 'ppShowWrongBook(\'' + _nsSecId + '\',\'' + _nsBoard + '\')');
    } else {
      var _nextSec = _getNextSection(_nsSecId, _nsBoard);
      if (_nextSec) {
        html += nextStepHTML('\ud83d\udcd8', t('Next Topic', '\u4e0b\u4e00\u77e5\u8bc6\u70b9'), 'openSection(\'' + _nextSec + '\',\'' + _nsBoard + '\')');
      }
    }
  }

  /* Action buttons */
  html += '<div class="btn-row btn-row--gap12 btn-row--center btn-row--mt24 btn-row--wrap pb-40">';
  if (_ppSession && _ppSession.paperKey) {
    html += '<button class="btn btn-ghost" onclick="ppShowPaperBrowse(\'' + _ppSession.board + '\')">';
    html += t('Back to Papers', '\u8fd4\u56de\u5957\u5377') + '</button>';
    html += '<button class="btn btn-primary" onclick="ppStartFullPaper(\'' + _ppSession.paperKey + '\',\'' + _ppSession.board + '\',\'exam\')">';
    html += '\ud83d\udd04 ' + t('Try Again', '\u518d\u6765\u4e00\u8f6e') + '</button>';
  } else if (_ppSession) {
    html += '<button class="btn btn-ghost" onclick="ppShowWrongBook(\'' + _ppSession.sectionId + '\',\'' + _ppSession.board + '\')">';
    html += '\ud83d\udcd5 ' + t('Wrong Book', '\u9519\u9898\u672c') + '</button>';
    html += '<button class="btn btn-primary" onclick="ppStartExam(\'' + _ppSession.sectionId + '\',\'' + _ppSession.board + '\')">';
    html += '\ud83d\udd04 ' + t('Try Again', '\u518d\u6765\u4e00\u8f6e') + '</button>';
  }
  html += '<button class="btn btn-ghost" onclick="ppBack()">' + t('Back to Section', '\u8fd4\u56de\u77e5\u8bc6\u70b9') + '</button>';
  html += '</div>';

  html += '</div>';

  el.innerHTML = html;
}

/* ═══ WRONG BOOK ═══ */

function ppShowWrongBook(sectionId, board) {
  board = board || 'cie';

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-pastpaper');
    if (!el) return;

    var wb = _ppGetWB();
    var allQ = getPPBySection(board, sectionId);
    var wrongItems = [];

    for (var i = 0; i < allQ.length; i++) {
      var q = allQ[i];
      if (wb[q.id] && wb[q.id].status === 'active') {
        wrongItems.push({ q: q, wb: wb[q.id] });
      }
    }

    var html = '';
    html += '<div class="page-header">';
    html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
    html += '<h3 class="mt-0 mb-0 flex-1">\ud83d\udcd5 ' + t('Wrong Book', '\u9519\u9898\u672c') + '</h3>';
    html += '</div>';

    if (wrongItems.length === 0) {
      html += '<div class="pp-empty">';
      html += '<div class="pp-empty-icon">\ud83c\udf89</div>';
      html += '<div class="pp-all-clear-title">' + t('All clear!', '\u5168\u90e8\u89e3\u51b3\uff01') + '</div>';
      html += '<div>' + t('No questions to review \u2014 keep up the great work!', '\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u9898\u76ee\uff0c\u7ee7\u7eed\u4fdd\u6301\uff01') + '</div>';
      html += '</div>';
    } else {
      html += '<p style="color:var(--c-text2);font-size:13px;margin-bottom:16px">';
      html += wrongItems.length + ' ' + t('questions to review', '\u9898\u5f85\u590d\u4e60');
      html += '</p>';

      for (var wi = 0; wi < wrongItems.length; wi++) {
        var item = wrongItems[wi];
        var errLabel = '';
        for (var ei = 0; ei < PP_ERROR_TYPES.length; ei++) {
          if (PP_ERROR_TYPES[ei].id === item.wb.errorType) {
            errLabel = t(PP_ERROR_TYPES[ei].en, PP_ERROR_TYPES[ei].zh);
            break;
          }
        }

        html += '<div class="pp-wrong-item" role="button" tabindex="0" onclick="ppReviewWrongItem(\'' + item.q.id + '\',\'' + sectionId + '\',\'' + board + '\')">';
        html += '<div class="pp-wrong-icon">\ud83d\udd34</div>';
        html += '<div class="pp-wrong-meta">';
        html += '<div style="font-size:13px;font-weight:600">' + item.q.src + ' <span class="pp-marks-badge">' + item.q.marks + ' mks</span></div>';
        var noteText = errLabel || item.wb.note || '';
        if (noteText) html += '<div class="pp-wrong-note">' + noteText + '</div>';
        /* Recovery suggestion from Learning Graph */
        if (typeof getRecoveryCandidates === 'function') {
          var recovery = getRecoveryCandidates(item.q.id, sectionId, board);
          if (recovery && (recovery.weakVocab.length > 0 || recovery.weakKPs.length > 0)) {
            html += '<div class="recovery-hint">';
            if (recovery.weakVocab.length > 0) {
              html += '\ud83d\udcd6 ' + recovery.weakVocab.slice(0, 3).map(function(v) { return escapeHtml(v.word); }).join(', ');
            }
            if (recovery.weakKPs.length > 0) {
              if (recovery.weakVocab.length > 0) html += ' \u00b7 ';
              html += '\ud83e\udde0 ' + recovery.weakKPs.map(function(k) { return escapeHtml(k.title); }).join(', ');
            }
            html += ' <span class="recovery-hint-cta">\u2192 ' + t('view recovery', '\u67e5\u770b\u4fee\u590d\u5efa\u8bae') + '</span>';
            html += '</div>';
          }
        }
        html += '</div>';
        html += '<div class="pp-wrong-review-count">\u00d7' + (item.wb.reviewCount || 0) + '</div>';
        html += '</div>';
      }

      /* Review all button */
      html += '<div class="text-center mt-20 pb-40">';
      html += '<button class="btn btn-primary" onclick="ppStartWrongBookReview(\'' + sectionId + '\',\'' + board + '\')" style="padding:10px 28px">';
      html += '\ud83d\udd04 ' + t('Review All', '\u5168\u90e8\u590d\u4e60') + ' (' + wrongItems.length + ')</button>';
      html += '</div>';
    }

    el.innerHTML = html;
    showPanel('pastpaper');
  });
}

function ppReviewWrongItem(qid, sectionId, board) {
  /* Start practice mode with just this one question */
  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var allQ = getPPBySection(board, sectionId);
    var q = null;
    for (var i = 0; i < allQ.length; i++) {
      if (allQ[i].id === qid) { q = allQ[i]; break; }
    }
    if (!q) return;

    /* Update review count */
    var wb = _ppGetWB();
    if (wb[qid]) { wb[qid].reviewCount = (wb[qid].reviewCount || 0) + 1; wb[qid].lastReview = Date.now(); }
    _ppSaveWB(wb);

    _ppSession = {
      questions: [q],
      current: 0,
      mode: 'practice',
      board: board,
      sectionId: sectionId,
      results: []
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

function ppStartWrongBookReview(sectionId, board) {
  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var wb = _ppGetWB();
    var allQ = getPPBySection(board, sectionId);
    var wrongQs = [];

    for (var i = 0; i < allQ.length; i++) {
      if (wb[allQ[i].id] && wb[allQ[i].id].status === 'active') {
        wrongQs.push(allQ[i]);
        /* Update review count */
        wb[allQ[i].id].reviewCount = (wb[allQ[i].id].reviewCount || 0) + 1;
        wb[allQ[i].id].lastReview = Date.now();
      }
    }
    _ppSaveWB(wb);

    if (!wrongQs.length) {
      showToast(t('No questions to review!', '\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u9898\u76ee\uff01'));
      return;
    }

    _ppSession = {
      questions: wrongQs,
      current: 0,
      mode: 'practice',
      board: board,
      sectionId: sectionId,
      results: []
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

/* ══════════════════════════════════════════════════════════════
   FULL PAPER BROWSING + EXAM MODULE
   ══════════════════════════════════════════════════════════════ */

var PP_TYPE_LABELS = {
  'core-nocalc': { en: 'Core Non-Calc', zh: 'Core 非计算器', cls: 'pp-type-core' },
  'ext-nocalc':  { en: 'Extended Non-Calc', zh: 'Extended 非计算器', cls: 'pp-type-ext' },
  'core-calc':   { en: 'Core Calculator', zh: 'Core 计算器', cls: 'pp-type-core' },
  'ext-calc':    { en: 'Extended Calculator', zh: 'Extended 计算器', cls: 'pp-type-ext' },
  'foundation-nocalc': { en: 'Foundation Non-Calc', zh: 'Foundation 非计算器', cls: 'pp-type-core' },
  'foundation-calc':   { en: 'Foundation Calculator', zh: 'Foundation 计算器', cls: 'pp-type-core' },
  'higher-nocalc':     { en: 'Higher Non-Calc', zh: 'Higher 非计算器', cls: 'pp-type-ext' },
  'higher-calc':       { en: 'Higher Calculator', zh: 'Higher 计算器', cls: 'pp-type-ext' }
};

var PP_SESSION_LABELS = {
  'March': { en: 'March', zh: '三月' },
  'FebMarch': { en: 'Feb/March', zh: '二/三月' },
  'MayJune': { en: 'May/June', zh: '五/六月' },
  'OctNov': { en: 'Oct/Nov', zh: '十/十一月' },
  'Specimen': { en: 'Specimen', zh: '样卷' },
  'June': { en: 'June', zh: '六月' },
  'Jan': { en: 'January', zh: '一月' },
  'Nov': { en: 'November', zh: '十一月' },
  'SP': { en: 'Specimen', zh: '样卷' }
};

/* ─── Paper browse panel ─── */

function ppShowPaperBrowse(board) {
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-papers');
    if (!el) return;

    var papers = getPaperList(board);
    var results = _ppGetPaperResults();

    /* Group by year → session */
    var years = {};
    for (var i = 0; i < papers.length; i++) {
      var p = papers[i];
      if (!years[p.year]) years[p.year] = {};
      if (!years[p.year][p.session]) years[p.year][p.session] = [];
      years[p.year][p.session].push(p);
    }

    var yearKeys = Object.keys(years).sort(function(a, b) { return b - a; });

    var html = '';
    html += '<div class="page-header">';
    html += '<button class="btn-icon" onclick="ppBack()" title="Back">&larr;</button>';
    html += '<h2 class="mt-0 mb-0 flex-1">' + t('Past Papers', '\u5957\u5377\u7ec3\u4e60') + '</h2>';
    html += '<button class="btn btn-sm btn-warning" onclick="ppShowMockSetup(\'' + board + '\')">\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u5377') + '</button>';
    html += '</div>';

    /* Year tabs */
    html += '<div class="pp-year-tabs" id="pp-year-tabs">';
    for (var yi = 0; yi < yearKeys.length; yi++) {
      var yr = yearKeys[yi];
      var cls = yi === 0 ? 'pp-year-tab active' : 'pp-year-tab';
      html += '<button class="' + cls + '" onclick="ppSelectYear(' + yr + ',\'' + board + '\')" data-year="' + yr + '">' + yr + '</button>';
    }
    html += '</div>';

    /* Paper cards for first year */
    html += '<div id="pp-papers-body">';
    html += _ppRenderYearPapers(years[yearKeys[0]], yearKeys[0], board, results);
    html += '</div>';

    /* Store data for tab switching */
    window._ppYearsData = years;
    window._ppBrowseBoard = board;

    el.innerHTML = html;
    showPanel('papers');
  });
}

function ppSelectYear(year, board) {
  /* Update tab highlight */
  var tabs = document.querySelectorAll('#pp-year-tabs .pp-year-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-year') == year);
  }
  /* Render papers for selected year */
  var body = E('pp-papers-body');
  if (!body || !window._ppYearsData) return;
  var results = _ppGetPaperResults();
  body.innerHTML = _ppRenderYearPapers(window._ppYearsData[year], year, board, results);
}

function _ppRenderYearPapers(sessions, year, board, results) {
  if (!sessions) return '';
  var sessionOrder = ['SP', 'Jan', 'March', 'FebMarch', 'June', 'MayJune', 'Nov', 'OctNov', 'Specimen'];
  var html = '';

  for (var si = 0; si < sessionOrder.length; si++) {
    var sess = sessionOrder[si];
    if (!sessions[sess]) continue;
    var papers = sessions[sess];
    var sl = PP_SESSION_LABELS[sess] || { en: sess, zh: sess };

    html += '<h4 class="pp-session-heading">' + t(sl.en, sl.zh) + ' ' + year + '</h4>';
    html += '<div class="pp-paper-grid">';

    for (var pi = 0; pi < papers.length; pi++) {
      var p = papers[pi];
      var tl = PP_TYPE_LABELS[p.type] || { en: p.type, zh: p.type, cls: '' };
      var result = results[p.key];

      html += '<div class="pp-paper-card" role="button" tabindex="0" onclick="ppShowPaperDetail(\'' + p.key + '\',\'' + board + '\')">';
      html += '<div class="pp-paper-card-top">';
      html += '<span class="pp-paper-type ' + tl.cls + '">' + t(tl.en, tl.zh) + '</span>';
      html += '<span class="pp-paper-num">Paper ' + p.paper + '</span>';
      html += '</div>';
      html += '<div class="pp-paper-card-info">';
      html += '<span>' + p.totalMarks + ' ' + t('marks', '分') + '</span>';
      html += '<span>' + p.time + ' min</span>';
      html += '<span>' + p.qcount + ' Q</span>';
      html += '</div>';
      if (result) {
        var pct = Math.round((result.score / result.total) * 100);
        html += '<div class="pp-paper-card-result">';
        html += '<span class="pp-paper-score">' + result.score + '/' + result.total + ' (' + pct + '%)</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  }
  return html;
}

/* ─── Paper detail / mode selection ─── */

function ppShowPaperDetail(paperKey, board) {
  board = board || 'cie';
  var meta = getPaperMeta(board)[paperKey];
  if (!meta) return;

  var questions = getPPByPaper(board, paperKey);
  var tl = PP_TYPE_LABELS[meta.type] || { en: meta.type, zh: meta.type, cls: '' };
  var result = _ppGetPaperResults()[paperKey];

  var html = '';
  html += '<div class="page-header">';
  html += '<button class="btn-icon" onclick="ppShowPaperBrowse(\'' + board + '\')" title="Back">&larr;</button>';
  html += '<h2 class="mt-0 mb-0 flex-1">Paper ' + meta.paper + '</h2>';
  html += '<span class="pp-paper-type ' + tl.cls + '">' + t(tl.en, tl.zh) + '</span>';
  html += '</div>';

  html += '<div class="pp-paper-detail-info">';
  html += '<div class="pp-detail-row"><span>' + t('Year', '年份') + '</span><span>' + meta.year + ' ' + (PP_SESSION_LABELS[meta.session] ? t(PP_SESSION_LABELS[meta.session].en, PP_SESSION_LABELS[meta.session].zh) : meta.session) + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Total Marks', '总分') + '</span><span>' + meta.totalMarks + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Time', '时间') + '</span><span>' + meta.time + ' min</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Questions', '题目') + '</span><span>' + meta.qcount + '</span></div>';
  if (result) {
    var pct = Math.round((result.score / result.total) * 100);
    html += '<div class="pp-detail-row"><span>' + t('Best Score', '最高分') + '</span><span class="pp-paper-score">' + result.score + '/' + result.total + ' (' + pct + '%)</span></div>';
  }
  html += '</div>';

  /* Topic breakdown */
  var topicCounts = {};
  for (var i = 0; i < questions.length; i++) {
    var ts = questions[i].topics || [];
    for (var j = 0; j < ts.length; j++) {
      topicCounts[ts[j]] = (topicCounts[ts[j]] || 0) + 1;
    }
  }
  if (Object.keys(topicCounts).length > 0) {
    html += '<h4 class="pp-section-h4">' + t('Topics', '知识点分布') + '</h4>';
    html += '<div class="pp-topic-chips">';
    for (var tp in topicCounts) {
      html += '<span class="pp-error-chip">' + tp + ' (' + topicCounts[tp] + ')</span>';
    }
    html += '</div>';
  }

  /* Command word distribution */
  var cmdCounts = {};
  for (var ci = 0; ci < questions.length; ci++) {
    var ck = questions[ci].cmd || 'other';
    cmdCounts[ck] = (cmdCounts[ck] || 0) + 1;
  }
  if (Object.keys(cmdCounts).length > 1) {
    html += '<h4 class="pp-section-h4">' + t('Command Words', '\u6307\u4ee4\u52a8\u8bcd\u5206\u5e03') + '</h4>';
    html += '<div class="pp-topic-chips">';
    var cmdOrd = (typeof PP_CMD_ORDER !== 'undefined') ? PP_CMD_ORDER : Object.keys(cmdCounts);
    for (var coi = 0; coi < cmdOrd.length; coi++) {
      var cmk = cmdOrd[coi];
      if (!cmdCounts[cmk]) continue;
      var cml = (typeof PP_CMD_LABELS !== 'undefined' && PP_CMD_LABELS[cmk]) ? PP_CMD_LABELS[cmk] : null;
      var cmLabel = cml ? t(cml.en, cml.zh) : cmk;
      html += '<span class="pp-cmd-badge" style="padding:3px 10px;cursor:default">' + cmLabel + ' <b>' + cmdCounts[cmk] + '</b></span>';
    }
    html += '</div>';
  }

  /* Action buttons */
  html += '<div class="btn-row btn-row--gap12 btn-row--center btn-row--mt24 btn-row--wrap">';
  html += '<button class="btn btn-primary" onclick="ppStartFullPaper(\'' + paperKey + '\',\'' + board + '\',\'practice\')">';
  html += t('Practice', '练习模式') + '</button>';
  html += '<button class="btn btn-ghost" onclick="ppStartFullPaper(\'' + paperKey + '\',\'' + board + '\',\'exam\')">';
  html += '\u23f1 ' + t('Exam Mode', '考试模式') + ' (' + meta.time + ' min)</button>';
  html += '</div>';

  /* Question list preview */
  html += '<h4 class="pp-section-h4">' + t('Questions', '题目列表') + '</h4>';
  for (var qi = 0; qi < questions.length; qi++) {
    var q = questions[qi];
    var mastery = _ppGetQMastery(q.id);
    var mIcon = mastery === 'mastered' ? '✓' : mastery === 'partial' ? '◐' : mastery === 'needs_work' ? '✗' : '';
    html += '<div class="pp-q-preview" role="button" tabindex="0" onclick="ppStartFullPaper(\'' + paperKey + '\',\'' + board + '\',\'practice\',' + qi + ')">';
    html += '<span class="pp-q-num">Q' + q.qnum + '</span>';
    html += '<span class="pp-q-topic-cell">' + (q.topics || []).join(', ') + '</span>';
    html += '<span class="pp-marks-badge">' + q.marks + '</span>';
    if (mIcon) html += '<span class="pp-q-mastery">' + mIcon + '</span>';
    html += '</div>';
  }

  var el = E('panel-papers');
  if (el) el.innerHTML = html;
  showPanel('papers');
  /* KaTeX not needed for this view */
}

/* ─── Start full paper practice/exam ─── */

function ppStartFullPaper(paperKey, board, mode, startIdx) {
  board = board || 'cie';
  mode = mode || 'practice';

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var questions = getPPByPaper(board, paperKey);
    if (!questions.length) {
      showToast(t('No questions found for this paper', '该套卷暂无题目'));
      return;
    }

    var meta = getPaperMeta(board)[paperKey] || {};

    if (mode === 'exam') {
      ppShowPaperExamSetup(paperKey, board, questions, meta);
    } else {
      _ppSession = {
        questions: questions,
        current: startIdx || 0,
        mode: 'practice',
        board: board,
        sectionId: null,
        paperKey: paperKey,
        results: []
      };
      showPanel('pastpaper');
      renderPPCard();
    }
  });
}

/* ─── Paper exam setup (confirmation screen) ─── */

function ppShowPaperExamSetup(paperKey, board, questions, meta) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var tl = PP_TYPE_LABELS[meta.type] || { en: meta.type, zh: meta.type };
  var sl = PP_SESSION_LABELS[meta.session] || { en: meta.session, zh: meta.session };

  var html = '';
  html += '<div class="page-header page-header--mb20">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppShowPaperBrowse(\'' + board + '\')">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '</div>';

  html += '<div class="pp-setup">';
  html += '<h3>\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</h3>';
  html += '<p class="desc">Paper ' + meta.paper + ' \u00b7 ' + meta.year + ' ' + t(sl.en, sl.zh) + '</p>';

  html += '<div class="pp-paper-detail-info mb-20">';
  html += '<div class="pp-detail-row"><span>' + t('Type', '\u7c7b\u578b') + '</span><span>' + t(tl.en, tl.zh) + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Total Marks', '\u603b\u5206') + '</span><span>' + meta.totalMarks + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Time Limit', '\u65f6\u9650') + '</span><span>' + meta.time + ' min</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Questions', '\u9898\u6570') + '</span><span>' + questions.length + '</span></div>';
  html += '</div>';

  html += '<div class="mt-24 text-center">';
  html += '<button class="btn btn-primary btn-lg" onclick="ppStartPaperExam(\'' + paperKey + '\',\'' + board + '\')">';
  html += '\u25b6 ' + t('Start Exam', '\u5f00\u59cb\u8003\u8bd5') + '</button>';
  html += '</div>';

  html += '</div>';

  el.innerHTML = html;
  showPanel('pastpaper');
}

function ppStartPaperExam(paperKey, board) {
  board = board || 'cie';
  var questions = getPPByPaper(board, paperKey);
  var meta = getPaperMeta(board)[paperKey] || {};

  _ppSession = {
    questions: questions,
    current: 0,
    mode: 'exam',
    board: board,
    sectionId: null,
    paperKey: paperKey,
    startTime: Date.now(),
    results: [],
    totalMarks: 0,
    timeLimit: meta.time ? meta.time * 60 : null
  };
  for (var i = 0; i < questions.length; i++) {
    _ppSession.totalMarks += questions[i].marks;
    _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
  }
  showPanel('pastpaper');
  renderPPCard();
}

/* ═══ MOCK EXAM GENERATOR ═══ */

function ppShowMockSetup(board) {
  if (typeof isGuest === 'function' && isGuest()) { showToast(t('Register free to unlock Mock Exam', '免费注册解锁模拟卷')); return; }
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  /* Decay warning (#9) */
  var _overdueMock = typeof getDueWords === 'function' ? getDueWords().length : 0;
  if (_overdueMock > 20) {
    showToast(t('You have ' + _overdueMock + ' words overdue for review', '你有 ' + _overdueMock + ' 个词已过期待复习'));
  }

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-pastpaper');
    if (!el) return;

    var allQ = getPPQuestions(board);
    if (!allQ || allQ.length === 0) {
      showToast(t('No questions available', '\u6682\u65e0\u9898\u76ee'));
      return;
    }

    /* Count sections with questions */
    var secs = {};
    for (var i = 0; i < allQ.length; i++) {
      if (allQ[i].s) secs[allQ[i].s] = (secs[allQ[i].s] || 0) + 1;
    }
    var secCount = Object.keys(secs).length;

    var html = '';
    html += '<div class="page-header page-header--mb20">';
    html += '<button class="btn btn-ghost btn-sm" onclick="ppShowPaperBrowse(\'' + board + '\')">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
    html += '</div>';

    html += '<div class="pp-setup">';
    html += '<h3>\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u8003\u8bd5') + '</h3>';
    html += '<p class="desc">';
    html += t('Generate a custom exam from ', '\u4ece ') + allQ.length + t(' questions across ', ' \u9053\u771f\u9898\u3001') + secCount + t(' topics', ' \u4e2a\u77e5\u8bc6\u70b9\u4e2d\u7ec4\u5377');
    html += '</p>';

    /* Mark target */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Target Marks', '\u76ee\u6807\u5206\u6570') + '</span>';
    html += '<div class="pp-setup-options" id="mock-marks">';
    var markOpts = [40, 70, 100];
    for (var mi = 0; mi < markOpts.length; mi++) {
      var active = mi === 1 ? ' active' : '';
      html += '<div class="pp-setup-opt' + active + '" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'marks\',' + markOpts[mi] + ')">' + markOpts[mi] + '</div>';
    }
    html += '</div></div>';

    /* Focus mode */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Focus', '\u91cd\u70b9') + '</span>';
    html += '<div class="pp-setup-options" id="mock-focus">';
    html += '<div class="pp-setup-opt active" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'balanced\')">' + t('Balanced', '\u5747\u8861') + '</div>';
    html += '<div class="pp-setup-opt" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'weak\')">' + t('Weak Areas', '\u8584\u5f31\u9879') + '</div>';
    html += '<div class="pp-setup-opt" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'random\')">' + t('Random', '\u968f\u673a') + '</div>';
    html += '</div></div>';

    /* Time limit */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Time Limit', '\u65f6\u9650') + '</span>';
    html += '<span id="mock-time" class="fw-600">\u2248 70 min</span>';
    html += '</div>';

    html += '<div class="mt-24 text-center">';
    html += '<button class="btn btn-primary btn-lg" onclick="ppStartMockExam(\'' + board + '\')">';
    html += '\u25b6 ' + t('Generate & Start', '\u751f\u6210\u5e76\u5f00\u59cb') + '</button>';
    html += '</div>';

    html += '</div>';

    /* Store setup state */
    window._mockSetup = { board: board, marks: 70, focus: 'balanced' };

    el.innerHTML = html;
    showPanel('pastpaper');
  });
}

function ppMockSetOpt(el, key, val) {
  var opts = el.parentElement.querySelectorAll('.pp-setup-opt');
  for (var i = 0; i < opts.length; i++) opts[i].classList.remove('active');
  el.classList.add('active');
  if (window._mockSetup) window._mockSetup[key] = val;
  /* Update time estimate */
  if (key === 'marks') {
    var timeEl = document.getElementById('mock-time');
    if (timeEl) timeEl.textContent = '\u2248 ' + val + ' min';
  }
}

function ppStartMockExam(board) {
  board = board || 'cie';
  var setup = window._mockSetup || { marks: 70, focus: 'balanced' };
  var targetMarks = setup.marks || 70;
  var focus = setup.focus || 'balanced';

  var allQ = getPPQuestions(board);
  if (!allQ || allQ.length === 0) return;

  /* Group by section */
  var secQs = {};
  for (var i = 0; i < allQ.length; i++) {
    var s = allQ[i].s;
    if (!s || !allQ[i].marks) continue;
    if (!secQs[s]) secQs[s] = [];
    secQs[s].push(allQ[i]);
  }

  /* Calculate section weights */
  var secIds = Object.keys(secQs);
  var weights = {};
  for (var si = 0; si < secIds.length; si++) {
    var sid = secIds[si];
    if (focus === 'weak' && typeof getSectionHealth === 'function') {
      var h = getSectionHealth(sid, board);
      weights[sid] = h.score < 30 ? 4 : h.score < 60 ? 2 : 1;
    } else {
      weights[sid] = 1;
    }
  }

  /* Select questions to meet target marks */
  var selected = [];
  var totalMarks = 0;
  var maxPerSec = Math.max(3, Math.ceil(targetMarks / secIds.length));

  /* Shuffle sections weighted */
  var secPool = [];
  for (var wi = 0; wi < secIds.length; wi++) {
    for (var wj = 0; wj < weights[secIds[wi]]; wj++) {
      secPool.push(secIds[wi]);
    }
  }
  secPool.sort(function() { return Math.random() - 0.5; });

  /* Remove duplicates while preserving weighted order */
  var orderedSecs = [];
  var seen = {};
  for (var oi = 0; oi < secPool.length; oi++) {
    if (!seen[secPool[oi]]) {
      seen[secPool[oi]] = true;
      orderedSecs.push(secPool[oi]);
    }
  }

  /* Round-robin pick from sections */
  var perSec = {};
  var round = 0;
  while (totalMarks < targetMarks && round < 10) {
    var added = false;
    for (var ri = 0; ri < orderedSecs.length; ri++) {
      if (totalMarks >= targetMarks) break;
      var rsid = orderedSecs[ri];
      var rqs = secQs[rsid];
      var rPicked = perSec[rsid] || 0;
      if (rPicked >= maxPerSec || rPicked >= rqs.length) continue;

      /* Pick a random unpicked question from this section */
      var candidates = [];
      for (var ci = 0; ci < rqs.length; ci++) {
        var dup = false;
        for (var di = 0; di < selected.length; di++) {
          if (selected[di].id === rqs[ci].id) { dup = true; break; }
        }
        if (!dup) candidates.push(rqs[ci]);
      }
      if (candidates.length === 0) continue;
      candidates.sort(function() { return Math.random() - 0.5; });

      /* Try to pick one that doesn't overshoot too much */
      var picked = candidates[0];
      for (var pi = 0; pi < candidates.length; pi++) {
        if (totalMarks + candidates[pi].marks <= targetMarks + 5) {
          picked = candidates[pi];
          break;
        }
      }

      selected.push(picked);
      totalMarks += picked.marks;
      perSec[rsid] = rPicked + 1;
      added = true;
    }
    if (!added) break;
    round++;
  }

  /* Sort by difficulty (easy first, like a real paper) */
  var diffOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
  selected.sort(function(a, b) {
    return (diffOrder[a.d] || 1) - (diffOrder[b.d] || 1);
  });

  if (selected.length === 0) {
    showToast(t('Could not generate exam', '\u65e0\u6cd5\u751f\u6210\u8bd5\u5377'));
    return;
  }

  var timeLimit = totalMarks * 60; /* 1 min per mark */

  _ppSession = {
    questions: selected,
    current: 0,
    mode: 'exam',
    board: board,
    sectionId: null,
    isMock: true,
    startTime: Date.now(),
    results: [],
    totalMarks: 0,
    timeLimit: timeLimit
  };

  for (var mi = 0; mi < selected.length; mi++) {
    _ppSession.totalMarks += selected[mi].marks;
    _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
  }

  showPanel('pastpaper');
  renderPPCard();
}

/* ═══ MASTER QUESTION TYPE MASTERY ═══ */

var _mqtypeKey = 'mqtype_mastery';

function _getMQtypeMastery() {
  try { return JSON.parse(localStorage.getItem(_mqtypeKey)) || {}; } catch(e) { return {}; }
}

function _setMQtypeMastered(secId, gk, val) {
  var m = _getMQtypeMastery();
  if (!m[secId]) m[secId] = {};
  m[secId][gk] = { mastered: !!val, t: Date.now() };
  localStorage.setItem(_mqtypeKey, JSON.stringify(m));
}

function _isMQtypeMastered(secId, gk) {
  var m = _getMQtypeMastery();
  return !!(m[secId] && m[secId][gk] && m[secId][gk].mastered);
}

/* ═══ WRONG BOOK REMINDER (Toast on home) ═══ */

function ppCheckWrongBookReminder() {
  var wb = _ppGetWB();
  var now = Date.now();
  var threeDays = 3 * 24 * 60 * 60 * 1000;
  var activeCount = 0;
  var needsReminder = false;

  for (var qid in wb) {
    if (wb[qid].status !== 'active') continue;
    activeCount++;
    var lastReview = wb[qid].lastReview || wb[qid].addedAt;
    if (now - lastReview > threeDays) needsReminder = true;
  }

  if (needsReminder && activeCount > 0) {
    setTimeout(function() {
      showToast(t(
        activeCount + ' past paper questions need review \ud83d\udcd5',
        activeCount + ' \u9053\u771f\u9898\u5f85\u590d\u4e60 \ud83d\udcd5'
      ), 4000);
    }, 2000);
  }
}

/* ═══ KEYBOARD ACCESSIBILITY ═══ */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var t2 = e.target;
  if (!t2.hasAttribute('onclick') && !t2.hasAttribute('tabindex')) return;
  if (t2.classList.contains('pp-ms-toggle') || t2.classList.contains('pp-setup-opt') ||
      t2.classList.contains('pp-mark-header') || t2.classList.contains('pp-error-chip') ||
      t2.classList.contains('pp-wrong-item') || t2.classList.contains('pp-paper-card') ||
      t2.classList.contains('pp-q-preview') || t2.classList.contains('diag-section-row') ||
      t2.classList.contains('diag-rec-item') || t2.classList.contains('pp-filter-link')) {
    e.preventDefault(); t2.click();
  }
});
