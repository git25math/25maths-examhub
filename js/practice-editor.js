/* ══════════════════════════════════════════════════════════════
   practice-editor.js — Super-admin question editor (lazy-loaded)
   Depends on: practice.js (global vars + core functions)
   ══════════════════════════════════════════════════════════════ */

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
  }).catch(function() {
    showToast(t('Save failed', '保存失败'));
  });
}
