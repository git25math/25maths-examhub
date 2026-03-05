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
        { left: '$', right: '$', display: false }
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
    /* Filter hidden questions */
    base = base.filter(function(q) {
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
