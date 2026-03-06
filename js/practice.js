/* ══════════════════════════════════════════════════════════════
   practice.js — Exam practice mode (real exam-style MCQs + KaTeX)
   + question error reporting + admin rich-text editor
   ══════════════════════════════════════════════════════════════ */

var _pqData = {};       /* { cie: [...], edx: [...] } lazy-loaded cache */
var _pqSession = null;  /* { questions, current, correct, answers, lvl } */
var _katexReady = false; /* KaTeX loaded flag */
var _pqEditsCache = {};  /* { cie: {qid: data}, edx: {qid: data} } */
var _pqFocusedTextarea = null; /* last focused textarea in editor */
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

/* ═══ START PRACTICE ═══ */

function startPractice(li) {
  var lv = LEVELS[li];
  if (!lv) return;
  var board = lv.board;
  if (board !== 'cie' && board !== 'edx') return;

  currentLvl = li;
  showToast(t('Loading questions...', '加载题目中...'));

  Promise.all([loadPracticeData(board), loadKaTeX()]).then(function() {
    var questions;
    /* Resolve practice board (edexcel syllabus uses 'edx' for questions) */
    var pqBoard = board;
    if (window._practiceBoard === 'edexcel') pqBoard = 'edx';
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
  html += '<div class="pq-explanation" id="pq-explanation" style="display:none"></div>';

  /* Next button (hidden until answer) */
  html += '<div style="text-align:center;margin-top:16px">';
  html += '<button class="btn btn-primary pq-next-btn" id="pq-next" style="display:none" onclick="nextPracticeCard()">';
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
  }

  /* Show explanation */
  if (q.e) {
    var expEl = document.getElementById('pq-explanation');
    if (expEl) {
      expEl.innerHTML = '<strong>' + t('Explanation', '解析') + ':</strong> ' + pqRender(q.e);
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

  var step = nextStepHTML('\ud83d\udcd6', t('Back to Study', '返回学习'), 'openDeck(' + s.lvl + ')');

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
      wrongHtml += '<div class="pq-wrong-q">' + pqRender(q.q) + '</div>';
      wrongHtml += '<div class="pq-wrong-a">\u2713 ' + pqRender(q.o[q.a]) + '</div>';
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
  html += '<span style="color:var(--c-text2)">' + escapeHtml(q.q.substring(0, 80)) + (q.q.length > 80 ? '...' : '') + '</span>';
  html += '</div>';
  html += '<label class="settings-label">' + t('Error type', '错误类型') + '</label>';
  html += '<select class="bug-select" id="pq-report-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '描述') + ' *</label>';
  html += '<textarea class="bug-textarea" id="pq-report-desc" rows="3" placeholder="' + t('Describe the error...', '请描述错误...') + '"></textarea>';
  html += '<div id="pq-report-msg" style="font-size:13px;margin:8px 0;min-height:20px;color:var(--c-danger)"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '提交') : t('Submit via Email', '通过邮件提交');
  html += '<button class="btn btn-primary" style="flex:1" onclick="submitPracticeReport()">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
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
  html += '<div style="display:flex;gap:12px">';
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
  html += '<div class="pq-formula-popup" id="pq-formula-popup" style="display:none">';
  html += '<label class="pq-field-label">LaTeX</label>';
  html += '<textarea id="pq-formula-input" class="bug-textarea" rows="2" placeholder="\\frac{1}{2}" style="font-family:var(--font-mono)"></textarea>';
  html += '<div class="pq-formula-preview" id="pq-formula-preview"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:8px">';
  html += '<button class="btn btn-primary btn-sm" onclick="pqInsertFormula()">' + t('Insert', '插入') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" onclick="pqCloseFormula()">' + t('Cancel', '取消') + '</button>';
  html += '</div></div>';

  /* Hidden file input for image upload */
  html += '<input type="file" id="pq-img-input" accept="image/*" style="display:none" onchange="pqUploadImage(this)">';

  /* Footer buttons */
  html += '<div class="pq-editor-footer">';
  html += '<button class="btn btn-primary" onclick="savePracticeEdit(\'' + escapeHtml(q.id) + '\',\'' + escapeHtml(board) + '\')">\ud83d\udcbe ' + t('Save to DB', '保存到数据库') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  html += '</div>'; /* end modal-card */

  /* Show in a custom wider modal */
  E('modal-card').className = 'modal-card pq-editor-modal';
  showModal(html);

  /* Bind input events for live preview */
  setTimeout(function() {
    var fields = ['pq-ed-q', 'pq-ed-o0', 'pq-ed-o1', 'pq-ed-o2', 'pq-ed-o3', 'pq-ed-e'];
    fields.forEach(function(fid) {
      var el = E(fid);
      if (el) {
        el.addEventListener('input', _pqUpdatePreview);
        el.addEventListener('focus', function() { _pqFocusedTextarea = this; });
      }
    });
    var radios = document.querySelectorAll('[name="pq-ed-correct"]');
    radios.forEach(function(r) { r.addEventListener('change', _pqUpdatePreview); });
    var dSel = E('pq-ed-d');
    if (dSel) dSel.addEventListener('change', _pqUpdatePreview);
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
    });
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

    /* Event delegation: bind once on panel-practice */
    if (!_pqReviewDelegated) {
      _pqReviewDelegated = true;
      E('panel-practice').addEventListener('click', function(e) {
        var btn = e.target.closest('.pq-review-edit');
        if (!btn || !_pqReviewState) return;
        var qid = btn.dataset.qid;
        var st = _pqReviewState;
        var q = _pqFindQ(qid, st.board);
        if (!q) return;
        var scrollY = window.scrollY;
        _openEditor(q, st.board, function() {
          startPracticeReview(st.li).then(function() {
            window.scrollTo(0, scrollY);
          });
        });
      });
    }
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
  html += '<button class="sort-btn' + (_pqReviewFilter === 'all' ? ' active' : '') + '" onclick="setPqReviewFilter(\'all\')">All (' + questions.length + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 1 ? ' active' : '') + '" onclick="setPqReviewFilter(1)">Core (' + coreCount + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 2 ? ' active' : '') + '" onclick="setPqReviewFilter(2)">Extended (' + extCount + ')</button>';
  html += '</div>';

  /* Topic filter bar */
  if (topicList.length > 1) {
    html += '<div class="pq-review-filter">';
    html += '<button class="sort-btn' + (_pqReviewTopicFilter === 'all' ? ' active' : '') + '" onclick="setPqReviewTopic(\'all\')">' + t('All Topics', '全部专题') + ' (' + afterDiff.length + ')</button>';
    topicList.forEach(function(tp) {
      var active = _pqReviewTopicFilter === tp ? ' active' : '';
      html += '<button class="sort-btn' + active + '" onclick="setPqReviewTopic(\'' + escapeHtml(tp).replace(/'/g, "\\'") + '\')">' + escapeHtml(tp) + ' (' + topicMap[tp] + ')</button>';
    });
    html += '</div>';
  }

  /* Review list */
  html += '<div class="pq-review-list">';
  filtered.forEach(function(q, i) {
    html += '<div class="pq-review-card">';

    /* Header: num + qid + topic + difficulty + edit btn */
    html += '<div class="pq-meta" style="margin-bottom:8px">';
    html += '<span style="font-weight:700;color:var(--c-text);min-width:28px">' + (i + 1) + '.</span>';
    html += '<span class="pq-qid" style="font-size:11px;color:var(--c-muted)">#' + escapeHtml(q.id) + '</span>';
    if (q.topic) html += '<span class="pq-topic">' + escapeHtml(q.topic) + '</span>';
    html += '<span class="pq-difficulty pq-d' + q.d + '">' + (q.d === 1 ? t('Core', '基础') : t('Extended', '拓展')) + '</span>';
    html += '<button class="pq-review-edit pq-edit-btn" style="margin-left:auto" data-qid="' + escapeHtml(q.id) + '">✏️</button>';
    html += '</div>';

    /* Question */
    html += '<div class="pq-question" style="margin-bottom:8px">' + pqRender(q.q) + '</div>';

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

var _ppData = {};          /* { cie: [...] } lazy-loaded */
var _ppSession = null;     /* { questions, current, mode, startTime, results[], board, sectionId, ... } */
var _ppTimer = null;       /* exam timer interval */

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
  var file = 'data/pastpapers-' + board + '.json?v=' + APP_VERSION;
  return fetch(file).then(function(r) {
    if (!r.ok) throw new Error('Failed to load ' + file);
    return r.json();
  }).then(function(data) {
    _ppData[board] = data;
    return data;
  });
}

function getPPBySection(board, sectionId) {
  var data = _ppData[board];
  if (!data) return [];
  return data.filter(function(q) { return q.s === sectionId; });
}

/* ═══ MASTERY STORAGE ═══ */

function _ppMasteryKey() { return 'pp_mastery'; }
function _ppGetMastery() {
  try { return JSON.parse(localStorage.getItem(_ppMasteryKey())) || {}; } catch(e) { return {}; }
}
function _ppSetMastery(qid, level) {
  var m = _ppGetMastery();
  if (!m[qid]) m[qid] = { m: level, t: Date.now(), n: 1 };
  else { m[qid].m = level; m[qid].t = Date.now(); m[qid].n = (m[qid].n || 0) + 1; }
  localStorage.setItem(_ppMasteryKey(), JSON.stringify(m));
}
function _ppGetQMastery(qid) {
  var m = _ppGetMastery();
  return m[qid] ? m[qid].m : null;
}

/* ═══ WRONG BOOK STORAGE ═══ */

function _ppWBKey() { return 'pp_wrong_book'; }
function _ppGetWB() {
  try { return JSON.parse(localStorage.getItem(_ppWBKey())) || {}; } catch(e) { return {}; }
}
function _ppSaveWB(wb) { localStorage.setItem(_ppWBKey(), JSON.stringify(wb)); }

function ppAddToWrongBook(qid, errorType, note) {
  var wb = _ppGetWB();
  if (!wb[qid]) {
    wb[qid] = { addedAt: Date.now(), lastReview: null, reviewCount: 0,
      errorType: errorType || '', note: note || '', status: 'active' };
  } else {
    wb[qid].errorType = errorType || wb[qid].errorType;
    if (note) wb[qid].note = note;
    wb[qid].status = 'active';
  }
  _ppSaveWB(wb);
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

function _ppRenderTex(tex) {
  /* Convert markdown bold; keep \n intact (CSS white-space: pre-line handles display) */
  var html = tex.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return html;
}

function _ppDiffLabel(d) {
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
  var stats = { total: all.length, newQ: 0, needsWork: 0, partial: 0, mastered: 0, wrongActive: 0 };
  for (var i = 0; i < all.length; i++) {
    var qm = mastery[all[i].id];
    if (!qm) stats.newQ++;
    else if (qm.m === 'needs_work') stats.needsWork++;
    else if (qm.m === 'partial') stats.partial++;
    else if (qm.m === 'mastered') stats.mastered++;
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

function startPastPaper(sectionId, board, mode, groupFilter) {
  board = board || 'cie';
  mode = mode || 'practice';

  showToast(t('Loading past papers...', '\u52a0\u8f7d\u771f\u9898\u4e2d...'));

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var questions = getPPBySection(board, sectionId);
    /* Apply group filter if specified */
    if (groupFilter) {
      questions = questions.filter(function(q) { return q.g === groupFilter; });
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
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '<div style="flex:1"></div>';
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
    html += '<div style="text-align:center;margin-bottom:8px">';
    html += '<span class="pp-error-chip selected" style="font-size:12px">' + _ppGroupLabel(_ppSession.groupFilter) + '</span>';
    html += ' <span style="font-size:11px;color:var(--c-muted);cursor:pointer;text-decoration:underline" onclick="ppClearFilter()">' + t('Show all', '\u663e\u793a\u5168\u90e8') + '</span>';
    html += '</div>';
  }

  /* Card */
  html += '<div class="pp-card">';

  /* Card header */
  html += '<div class="pp-card-header">';
  html += '<div>' + _ppDiffLabel(q.d) + ' <span class="pp-src">' + q.src + '</span></div>';
  html += '<div class="pp-marks-badge">' + q.marks + (q.marks === 1 ? ' mark' : ' marks') + '</div>';
  html += '</div>';

  /* Question type tag */
  if (q.g && _ppGroupLabels[q.g]) {
    html += '<div style="padding:4px 16px 0;font-size:11px;color:var(--c-muted)">' + _ppGroupLabel(q.g) + '</div>';
  }

  /* Card body: question */
  html += '<div class="pp-card-body" id="pp-question-body">';
  html += _ppRenderTex(q.tex);
  if (q.hasFigure) {
    html += '<div class="pp-figure-notice">' + t('This question includes a diagram — refer to original paper', '\u672c\u9898\u5305\u542b\u56fe\u8868\uff0c\u8bf7\u53c2\u8003\u539f\u5377') + '</div>';
  }
  html += '</div>';

  /* Parts info */
  var partsStr = _ppPartsInfo(q);
  if (partsStr) {
    html += '<div style="padding:8px 16px;font-size:12px;color:var(--c-muted);border-top:1px solid var(--c-border-light)">';
    html += partsStr;
    html += '</div>';
  }

  /* Mark Scheme toggle (practice mode only) */
  if (_ppSession.mode === 'practice') {
    html += '<div class="pp-ms-toggle" onclick="ppToggleMS()">';
    html += '<span id="pp-ms-arrow">\u25b6</span> ' + t('Mark Scheme', '\u8bc4\u5206\u6807\u51c6');
    html += '</div>';
    html += '<div class="pp-ms-content" id="pp-ms-body">';
    html += '<div style="text-align:center;color:var(--c-muted);padding:12px">';
    html += t('Mark Scheme coming soon \u2014 use self-assessment for now', '\u8bc4\u5206\u6807\u51c6\u5373\u5c06\u63a8\u51fa\uff0c\u8bf7\u5148\u81ea\u8bc4');
    html += '</div></div>';
  }

  html += '</div>'; /* end pp-card */

  /* Self-assessment (practice mode) */
  if (_ppSession.mode === 'practice') {
    html += '<div style="margin-top:16px;max-width:640px;margin-inline:auto">';
    html += '<div style="text-align:center;font-size:12px;color:var(--c-muted);margin-bottom:8px">';
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
    html += '<div style="margin-top:16px;max-width:640px;margin-inline:auto;text-align:center">';
    html += '<label style="cursor:pointer;font-size:13px;color:var(--c-muted)">';
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
  } else {
    html += '<button class="pp-nav-btn primary" onclick="ppNext()">';
    html += t('Next', '\u4e0b\u4e00\u9898') + ' \u2192</button>';
  }
  html += '</div>';

  el.innerHTML = html;

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
  _ppSetMastery(q.id, level);

  /* Auto-add to wrong book if needs_work */
  if (level === 'needs_work') {
    ppAddToWrongBook(q.id, '', '');
  } else if (level === 'mastered') {
    ppResolveWrongBook(q.id);
  }

  /* Auto-advance after short delay */
  setTimeout(function() {
    if (_ppSession && _ppSession.current < _ppSession.questions.length - 1) {
      ppNext();
    } else {
      renderPPCard(); /* re-render to show updated state */
    }
  }, 300);
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
  }
}

function ppGoTo(idx) {
  if (!_ppSession || idx < 0 || idx >= _ppSession.questions.length) return;
  _ppSession.current = idx;
  renderPPCard();
}

function ppBack() {
  if (_ppTimer) { clearInterval(_ppTimer); _ppTimer = null; }
  _ppSession = null;
  showPanel('section');
}

function ppClearFilter() {
  if (!_ppSession) return;
  startPastPaper(_ppSession.sectionId, _ppSession.board, _ppSession.mode, null);
}

/* ═══ EXAM MODE ═══ */

function ppShowExamSetup(sectionId, board, questions) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var totalMarks = 0;
  for (var i = 0; i < questions.length; i++) totalMarks += questions[i].marks;
  var refTime = totalMarks; /* 1 min per mark */

  var html = '';
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '</div>';

  html += '<div class="pp-setup">';
  html += '<h3>\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</h3>';
  html += '<p style="color:var(--c-text2);margin-bottom:20px">' + t('Section', '\u77e5\u8bc6\u70b9') + ' ' + sectionId + ' \u00b7 ' + questions.length + ' ' + t('questions', '\u9898') + '</p>';

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
    html += '<div class="pp-setup-opt' + active + '" onclick="ppSetupCount(this,' + c + ')">' + label + '</div>';
  }
  html += '</div></div>';

  /* Reference time */
  var defaultCount = Math.min(10, questions.length);
  var defaultMarks = 0;
  var shuffled = questions.slice().sort(function() { return Math.random() - 0.5; });
  for (var mi = 0; mi < defaultCount && mi < shuffled.length; mi++) defaultMarks += shuffled[mi].marks;
  html += '<div class="pp-setup-row">';
  html += '<span>' + t('Reference time', '\u53c2\u8003\u65f6\u95f4') + '</span>';
  html += '<span id="pp-exam-time" style="font-weight:600">\u2248 ' + defaultMarks + ' min</span>';
  html += '</div>';

  html += '<div style="margin-top:24px">';
  html += '<button class="btn btn-primary" onclick="ppStartExam(\'' + sectionId + '\',\'' + board + '\')" style="padding:12px 32px;font-size:15px">';
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
    var elapsed = Math.floor((Date.now() - _ppSession.startTime) / 1000);
    var min = Math.floor(elapsed / 60);
    var sec = elapsed % 60;
    var timerEl = document.getElementById('pp-timer');
    if (timerEl) {
      timerEl.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
      /* Warning at reference time */
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
  html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<h3 style="margin:0;flex:1">' + t('Mark Your Answers', '\u6279\u6539\u7b54\u5377') + '</h3>';
  html += '<div class="pp-src">\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
  html += '</div>';

  for (var i = 0; i < qs.length; i++) {
    var q = qs[i];
    var r = _ppSession.results[i] || {};

    html += '<div class="pp-mark-item" id="pp-mark-' + i + '">';

    /* Header */
    html += '<div class="pp-mark-header" onclick="ppToggleMarkBody(' + i + ')">';
    html += '<div><strong>Q' + (i + 1) + '</strong> <span class="pp-src">' + q.src + '</span> ';
    html += '<span class="pp-marks-badge">' + q.marks + (q.marks === 1 ? ' mk' : ' mks') + '</span>';
    if (r.flagged) html += ' \u2753';
    html += '</div>';
    html += '<div id="pp-mark-status-' + i + '" style="font-size:13px"></div>';
    html += '</div>';

    /* Body (collapsed by default) */
    html += '<div class="pp-mark-body" id="pp-mark-body-' + i + '" style="display:none">';

    /* Question preview */
    html += '<div style="font-size:13px;line-height:1.6;margin-bottom:12px;max-height:120px;overflow:auto" class="pp-mark-tex">';
    html += _ppRenderTex(q.tex);
    html += '</div>';

    /* Self-assessment */
    html += '<div class="pp-rate-row" style="margin-bottom:8px">';
    html += '<button class="pp-rate-btn mastered" onclick="ppMarkRate(' + i + ',\'correct\',this)">\u2705 ' + t('All correct', '\u5168\u5bf9') + '</button>';
    html += '<button class="pp-rate-btn partial" onclick="ppMarkRate(' + i + ',\'partial\',this)">\ud83d\udfe1 ' + t('Partial', '\u90e8\u5206') + '</button>';
    html += '<button class="pp-rate-btn needs-work" onclick="ppMarkRate(' + i + ',\'wrong\',this)">\ud83d\udd34 ' + t('Wrong', '\u9519\u8bef') + '</button>';
    html += '</div>';

    /* Score input */
    html += '<div class="pp-mark-score">';
    html += '<span style="font-size:13px">' + t('Score', '\u5f97\u5206') + ':</span>';
    html += '<input type="number" min="0" max="' + q.marks + '" id="pp-score-' + i + '" onchange="ppScoreChange(' + i + ',' + q.marks + ')" placeholder="0">';
    html += '<span style="font-size:13px">/ ' + q.marks + '</span>';
    html += '</div>';

    /* Error type chips */
    html += '<div style="margin-top:8px;font-size:12px;color:var(--c-muted)">' + t('Error type', '\u9519\u56e0') + ':</div>';
    html += '<div class="pp-error-chips">';
    for (var ei = 0; ei < PP_ERROR_TYPES.length; ei++) {
      var et = PP_ERROR_TYPES[ei];
      html += '<span class="pp-error-chip" data-err="' + et.id + '" data-qi="' + i + '" onclick="ppToggleError(this)">';
      html += t(et.en, et.zh) + '</span>';
    }
    html += '</div>';

    html += '</div>'; /* end mark-body */
    html += '</div>'; /* end mark-item */
  }

  /* Submit marking */
  html += '<div style="text-align:center;margin-top:20px;padding-bottom:40px">';
  html += '<button class="btn btn-primary" onclick="ppFinishMarking()" style="padding:12px 32px;font-size:15px">';
  html += '\ud83d\udcca ' + t('See Results', '\u67e5\u770b\u7ed3\u679c') + '</button>';
  html += '</div>';

  el.innerHTML = html;

  /* Render KaTeX in all question previews */
  var texEls = el.querySelectorAll('.pp-mark-tex');
  for (var ti = 0; ti < texEls.length; ti++) renderMath(texEls[ti]);
}

function ppToggleMarkBody(idx) {
  var body = document.getElementById('pp-mark-body-' + idx);
  if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
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

    /* Auto-add wrong/partial to wrong book */
    if (r.status === 'wrong' || r.status === 'partial') {
      ppAddToWrongBook(qs[i].id, r.errorType || '', '');
      _ppSetMastery(qs[i].id, r.status === 'wrong' ? 'needs_work' : 'partial');
    } else if (r.status === 'correct') {
      _ppSetMastery(qs[i].id, 'mastered');
      ppResolveWrongBook(qs[i].id);
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

  /* Show results */
  ppShowResults(examRecord, conceptErrors);
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
  html += '<div class="pp-results-time">\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
  html += '</div>';

  /* Concept breakdown */
  var concepts = Object.keys(conceptErrors).sort(function(a, b) {
    var ra = conceptErrors[a].scored / conceptErrors[a].total;
    var rb = conceptErrors[b].scored / conceptErrors[b].total;
    return ra - rb;
  });

  if (concepts.length > 0) {
    html += '<h4 style="margin:20px 0 12px">' + t('By Question Type', '\u6309\u9898\u578b\u5206\u6790') + '</h4>';
    for (var ci = 0; ci < concepts.length; ci++) {
      var c = concepts[ci];
      var ce = conceptErrors[c];
      var cpct = Math.round((ce.scored / ce.total) * 100);
      var icon = cpct >= 80 ? '\u2705' : cpct >= 40 ? '\ud83d\udfe1' : '\ud83d\udd34';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px">';
      html += '<span>' + icon + '</span>';
      html += '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + c + '</span>';
      html += '<span style="font-weight:600;font-family:var(--font-mono)">' + ce.scored + '/' + ce.total + '</span>';
      html += '</div>';
    }
  }

  /* Action buttons */
  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:24px;flex-wrap:wrap;padding-bottom:40px">';
  if (_ppSession) {
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
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">';
    html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
    html += '<h3 style="margin:0;flex:1">\ud83d\udcd5 ' + t('Wrong Book', '\u9519\u9898\u672c') + '</h3>';
    html += '</div>';

    if (wrongItems.length === 0) {
      html += '<div class="pp-empty">';
      html += '<div class="pp-empty-icon">\ud83c\udf89</div>';
      html += '<div style="font-size:16px;font-weight:600;margin-bottom:8px">' + t('All clear!', '\u5168\u90e8\u89e3\u51b3\uff01') + '</div>';
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

        html += '<div class="pp-wrong-item" onclick="ppReviewWrongItem(\'' + item.q.id + '\',\'' + sectionId + '\',\'' + board + '\')">';
        html += '<div style="font-size:20px">\ud83d\udd34</div>';
        html += '<div class="pp-wrong-meta">';
        html += '<div style="font-size:13px;font-weight:600">' + item.q.src + ' <span class="pp-marks-badge">' + item.q.marks + ' mks</span></div>';
        var noteText = errLabel || item.wb.note || '';
        if (noteText) html += '<div class="pp-wrong-note">' + noteText + '</div>';
        html += '</div>';
        html += '<div style="font-size:12px;color:var(--c-muted)">\u00d7' + (item.wb.reviewCount || 0) + '</div>';
        html += '</div>';
      }

      /* Review all button */
      html += '<div style="text-align:center;margin-top:20px;padding-bottom:40px">';
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
