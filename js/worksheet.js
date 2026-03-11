/* ══════════════════════════════════════════════════════════════
   Worksheet — Print Repair Sheet MVP (v3.3.0)
   Generates a single-question A4 printable repair sheet
   from Recovery Pack data. Uses window.open() + window.print().
   ══════════════════════════════════════════════════════════════ */

/* ═══ WORKSHEET ID ═══ */

function createWorksheetId() {
  var d = new Date();
  var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
  var date = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  var time = pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  var rnd = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  return 'WS-' + date + '-' + time + '-' + rnd;
}

/* ═══ BUILD WORKSHEET MODEL ═══ */

function buildRepairWorksheet(q, sectionId, board) {
  var recovery = typeof getRecoveryCandidates === 'function'
    ? getRecoveryCandidates(q.id, sectionId, board)
    : { weakVocab: [], weakKPs: [], siblingQuestions: [] };

  var secInfo = typeof getSectionInfo === 'function'
    ? getSectionInfo(sectionId, board) : null;

  /* Render question HTML — safe fallback if functions unavailable */
  var qHtml = '';
  try {
    if (typeof _ppRenderWithMarks === 'function') qHtml += _ppRenderWithMarks(q);
    if (typeof _ppRenderFigures === 'function') qHtml += _ppRenderFigures(q);
  } catch (e) {}
  if (!qHtml) qHtml = '<div style="color:#999;font-style:italic">Question content unavailable.</div>';

  return {
    worksheetId: createWorksheetId(),
    generatedAt: new Date().toISOString(),
    questionId: q.id || '',
    board: board || '',
    sectionId: sectionId || '',
    sectionTitle: secInfo ? (secInfo.section.title || sectionId) : sectionId,
    chapterTitle: secInfo ? (secInfo.chapter.title || '') : '',
    difficulty: q.d || '',
    marks: q.marks || 0,
    src: q.src || '',
    questionHtml: qHtml,
    relatedVocab: recovery.weakVocab || [],
    relatedKPs: recovery.weakKPs || [],
    siblingQuestions: recovery.siblingQuestions || []
  };
}

/* ═══ RENDER PRINTABLE HTML ═══ */

function renderRepairWorksheet(ws) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var dateStr = ws.generatedAt ? ws.generatedAt.slice(0, 10) : '';

  var boardLabel = ws.board === 'cie' ? 'CIE 0580' : ws.board === 'edx' ? 'Edexcel 4MA1' : ws.board || '';

  /* FLM status label */
  var fsLabel = function(fs) {
    return fs === 'mastered' ? 'mastered' : fs === 'uncertain' ? 'uncertain'
      : fs === 'learning' ? 'learning' : 'new';
  };

  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">';
  html += '<title>Repair Sheet - ' + esc(ws.questionId) + '</title>';
  html += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">';
  html += '<style>';

  /* Print page setup */
  html += '@page { size: A4; margin: 14mm; }';
  html += '*, *::before, *::after { box-sizing: border-box; }';
  html += 'body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
  html += '  font-size: 11pt; line-height: 1.45; color: #000; background: #fff; margin: 0; padding: 20px; }';

  /* Header */
  html += '.ws-header { display: flex; justify-content: space-between; align-items: flex-start;';
  html += '  border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px; }';
  html += '.ws-brand { font-size: 16pt; font-weight: 700; }';
  html += '.ws-subtitle { font-size: 13pt; font-weight: 600; color: #444; }';
  html += '.ws-ids { text-align: right; font-size: 9pt; color: #666; }';

  /* Meta */
  html += '.ws-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 10pt;';
  html += '  color: #444; margin-bottom: 12px; padding: 8px; background: #f7f7f7;';
  html += '  border-radius: 4px; }';
  html += '.ws-meta-item { white-space: nowrap; }';
  html += '.ws-meta-label { font-weight: 600; }';

  /* Sections */
  html += '.ws-section { margin-bottom: 14px; break-inside: avoid; }';
  html += '.ws-section-title { font-size: 11pt; font-weight: 700; margin-bottom: 6px;';
  html += '  border-bottom: 1px solid #ddd; padding-bottom: 3px; }';

  /* Vocab & KP rows */
  html += '.ws-item { display: flex; gap: 8px; padding: 3px 0; font-size: 10pt;';
  html += '  border-bottom: 1px dotted #eee; }';
  html += '.ws-item-word { font-weight: 600; min-width: 120px; }';
  html += '.ws-item-def { flex: 1; color: #555; }';
  html += '.ws-item-status { font-size: 9pt; color: #888; white-space: nowrap; }';

  /* Question */
  html += '.ws-question { padding: 10px; border: 1px solid #ccc; border-radius: 4px;';
  html += '  background: #fafafa; margin-bottom: 14px; break-inside: avoid; }';

  /* PP rendering classes (copied from main CSS for print isolation) */
  html += '.pp-part-block { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }';
  html += '.pp-part-label { font-weight: 700; min-width: 24px; color: #333; }';
  html += '.pp-part-content { flex: 1; white-space: pre-line; word-break: break-word; }';
  html += '.pp-part-intro { margin-bottom: 8px; white-space: pre-line; }';
  html += '.pp-marks-right { font-size: 10pt; font-weight: 600; color: #666; white-space: nowrap; margin-left: 8px; }';
  html += '.pp-figures { text-align: center; margin: 10px 0; }';
  html += '.pp-fig { max-width: 90%; max-height: 200px; }';
  html += '.pp-figure-placeholder { text-align: center; color: #999; padding: 12px; }';

  /* Working area */
  html += '.ws-working { min-height: 200px; border: 1px solid #ccc; border-radius: 4px;';
  html += '  background: #fff; margin-bottom: 14px; }';

  /* Error analysis checkboxes */
  html += '.ws-checkbox-grid { display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 10pt; }';
  html += '.ws-checkbox-item { display: flex; align-items: center; gap: 4px; }';
  html += '.ws-checkbox { width: 12px; height: 12px; border: 1.5px solid #333;';
  html += '  border-radius: 2px; display: inline-block; flex-shrink: 0; }';

  /* Correction lines */
  html += '.ws-line { border-bottom: 1px solid #ccc; min-height: 28px; margin-bottom: 4px;';
  html += '  font-size: 10pt; color: #666; padding-top: 4px; }';

  /* Footer */
  html += '.ws-footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #ddd;';
  html += '  font-size: 9pt; color: #888; display: flex; justify-content: space-between; }';
  html += '.ws-footer-hint { font-style: italic; }';

  /* Print-specific */
  html += '@media print { body { padding: 0; } .no-print { display: none !important; } }';

  html += '</style></head><body>';

  /* ── Header ── */
  html += '<div class="ws-header">';
  html += '<div><div class="ws-brand">25Maths</div>';
  html += '<div class="ws-subtitle">Mistake Repair Sheet</div></div>';
  html += '<div class="ws-ids">';
  html += '<div>' + esc(ws.worksheetId) + '</div>';
  html += '<div>' + dateStr + '</div>';
  html += '</div></div>';

  /* ── Meta ── */
  html += '<div class="ws-meta">';
  html += '<div class="ws-meta-item"><span class="ws-meta-label">Question:</span> ' + esc(ws.questionId) + '</div>';
  html += '<div class="ws-meta-item"><span class="ws-meta-label">Board:</span> ' + esc(boardLabel) + '</div>';
  if (ws.chapterTitle) html += '<div class="ws-meta-item"><span class="ws-meta-label">Chapter:</span> ' + esc(ws.chapterTitle) + '</div>';
  html += '<div class="ws-meta-item"><span class="ws-meta-label">Section:</span> ' + esc(ws.sectionTitle) + '</div>';
  if (ws.marks) html += '<div class="ws-meta-item"><span class="ws-meta-label">Marks:</span> ' + ws.marks + '</div>';
  if (ws.src) html += '<div class="ws-meta-item"><span class="ws-meta-label">Source:</span> ' + esc(ws.src) + '</div>';
  html += '</div>';

  /* ── Related Vocabulary ── */
  if (ws.relatedVocab.length > 0) {
    html += '<div class="ws-section">';
    html += '<div class="ws-section-title">\ud83d\udcd6 Related Vocabulary</div>';
    for (var vi = 0; vi < ws.relatedVocab.length; vi++) {
      var v = ws.relatedVocab[vi];
      html += '<div class="ws-item">';
      html += '<span class="ws-item-word">' + esc(v.word) + '</span>';
      html += '<span class="ws-item-def">' + esc(v.def) + '</span>';
      html += '<span class="ws-item-status">' + fsLabel(v.fs) + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  /* ── Related Knowledge Points ── */
  if (ws.relatedKPs.length > 0) {
    html += '<div class="ws-section">';
    html += '<div class="ws-section-title">\ud83e\udde0 Related Knowledge Points</div>';
    for (var ki = 0; ki < ws.relatedKPs.length; ki++) {
      var kp = ws.relatedKPs[ki];
      html += '<div class="ws-item">';
      html += '<span class="ws-item-word">' + esc(kp.title) + '</span>';
      if (kp.title_zh) html += '<span class="ws-item-def">' + esc(kp.title_zh) + '</span>';
      html += '<span class="ws-item-status">' + fsLabel(kp.fs) + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  /* ── Question ── */
  html += '<div class="ws-section">';
  html += '<div class="ws-section-title">Question</div>';
  html += '<div class="ws-question">' + ws.questionHtml + '</div>';
  html += '</div>';

  /* ── Correction Steps (v4.0.0) ── */
  if (typeof buildMistakeCorrectionCoach === 'function') {
    try {
      var _wsCoach = buildMistakeCorrectionCoach({ id: ws.questionId, marks: ws.marks }, ws.sectionId, ws.board);
      if (_wsCoach && typeof renderMistakeCoachForPrint === 'function') {
        html += renderMistakeCoachForPrint(_wsCoach);
      }
    } catch (e) {}
  }

  /* ── Working Area ── */
  html += '<div class="ws-section">';
  html += '<div class="ws-section-title">Working Area</div>';
  html += '<div class="ws-working"></div>';
  html += '</div>';

  /* ── Likely Error Pattern (v4.3.0: confidence-gated + solveHabit) ── */
  try {
    var _wsEpState = typeof getErrorPatternState === 'function' ? getErrorPatternState() : null;
    var _wsEpDisplay = _wsEpState && typeof getDisplayPatterns === 'function' ? getDisplayPatterns(_wsEpState) : null;
    var _wsEpPrimary = _wsEpDisplay ? _wsEpDisplay.primaryPersistent : null;
    if (!_wsEpPrimary && typeof getDominantErrorPatterns === 'function') {
      var _wsLegacy = getDominantErrorPatterns(ws.sectionId);
      if (_wsLegacy && _wsLegacy.length > 0) _wsEpPrimary = _wsLegacy[0];
    }
    if (_wsEpPrimary) {
      var _wsBand = typeof getConfidenceBand === 'function' ? getConfidenceBand(_wsEpPrimary.confidence || 0) : 'low';
      if (_wsBand !== 'low') {
        html += '<div class="ws-section">';
        html += '<div class="ws-section-title">\ud83d\udccd Likely Error Pattern</div>';
        var _wsMeta = typeof getPatternMeta === 'function' ? getPatternMeta(_wsEpPrimary.key) : null;
        var _wsLabel = _wsMeta ? _wsMeta.label.en : _wsEpPrimary.key;
        var _wsHint = _wsMeta ? _wsMeta.shortHint.en : '';
        var _wsHabit = _wsMeta ? _wsMeta.solveHabit.en : '';
        html += '<div class="ws-item"><span class="ws-item-word">\u2022 ' + esc(_wsLabel) + '</span></div>';
        if (_wsHint) html += '<div class="ws-item"><span class="ws-item-def" style="font-style:italic">' + esc(_wsHint) + '</span></div>';
        if (_wsHabit) html += '<div class="ws-item"><span class="ws-item-def">\ud83d\udca1 ' + esc(_wsHabit) + '</span></div>';
        html += '</div>';
      }
    }
  } catch (e) {}

  /* ── Error Analysis ── */
  html += '<div class="ws-section">';
  html += '<div class="ws-section-title">Error Analysis</div>';
  html += '<div class="ws-checkbox-grid">';
  var errors = ['Vocabulary problem', 'Concept misunderstanding', 'Method unknown',
    'Misread question', 'Calculation error', 'Careless mistake', 'Other'];
  for (var ei = 0; ei < errors.length; ei++) {
    html += '<div class="ws-checkbox-item"><span class="ws-checkbox"></span> ' + errors[ei] + '</div>';
  }
  html += '</div></div>';

  /* ── Correction Summary ── */
  html += '<div class="ws-section">';
  html += '<div class="ws-section-title">Correction</div>';
  html += '<div class="ws-line">Correct method: </div>';
  html += '<div class="ws-line">My mistake: </div>';
  html += '<div class="ws-line">Next time I should: </div>';
  html += '</div>';

  /* ── Footer ── */
  html += '<div class="ws-footer">';
  html += '<div>ID: ' + esc(ws.worksheetId) + ' \u00b7 Q: ' + esc(ws.questionId) + '</div>';
  html += '<div class="ws-footer-hint">Use Question ID to find this item in 25Maths.</div>';
  html += '</div>';

  /* ── KaTeX scripts ── */
  html += '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>';
  html += '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"><\/script>';
  html += '<script>';
  html += 'window.addEventListener("load", function() {';
  html += '  try { renderMathInElement(document.body, {';
  html += '    delimiters: [';
  html += '      { left: "$$", right: "$$", display: true },';
  html += '      { left: "\\\\[", right: "\\\\]", display: true },';
  html += '      { left: "$", right: "$", display: false },';
  html += '      { left: "\\\\(", right: "\\\\)", display: false }';
  html += '    ], throwOnError: false';
  html += '  }); } catch(e) {}';
  html += '  setTimeout(function() { try { window.focus(); window.print(); } catch(e) {} }, 300);';
  html += '});';
  html += '<\/script>';

  html += '</body></html>';
  return html;
}

/* ═══ PRINT ═══ */

function printRepairWorksheet(q, sectionId, board) {
  var ws = buildRepairWorksheet(q, sectionId, board);
  var html = renderRepairWorksheet(ws);

  var win = window.open('', '_blank');
  if (!win) {
    if (typeof showToast === 'function') {
      showToast(typeof t === 'function'
        ? t('Please allow pop-ups to print', '\u8bf7\u5141\u8bb8\u5f39\u7a97\u4ee5\u6253\u5370')
        : 'Please allow pop-ups to print');
    }
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  /* KaTeX rendering + print triggered by onload in the HTML itself */
}

/* ══════════════════════════════════════════════════════════════
   LIST PRINT VIEWS (v4.7.0)
   Generates printable A4 tables for filtered learning items.
   ══════════════════════════════════════════════════════════════ */

function _buildListPrintDoc(title, subtitle, bodyHtml) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var dateStr = new Date().toLocaleDateString('en-CA');

  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">';
  html += '<title>' + esc(title) + '</title>';
  html += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">';
  html += '<style>';
  html += '@page { size: A4; margin: 12mm; }';
  html += '*, *::before, *::after { box-sizing: border-box; }';
  html += 'body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
  html += '  font-size: 10pt; line-height: 1.4; color: #000; background: #fff; margin: 0; padding: 16px; }';
  html += '.ws-list-header { display: flex; justify-content: space-between; align-items: flex-start;';
  html += '  border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 10px; }';
  html += '.ws-list-brand { font-size: 14pt; font-weight: 700; }';
  html += '.ws-list-title { font-size: 12pt; font-weight: 600; color: #444; }';
  html += '.ws-list-meta { font-size: 9pt; color: #666; text-align: right; }';
  html += '.ws-list-table { width: 100%; border-collapse: collapse; font-size: 10pt; }';
  html += '.ws-list-table th { background: #f5f3ff; padding: 6px 8px; border: 1px solid #e5e7eb;';
  html += '  text-align: left; font-weight: 600; font-size: 9pt; white-space: nowrap; }';
  html += '.ws-list-table td { padding: 5px 8px; border: 1px solid #e5e7eb; word-break: break-word; }';
  html += '.ws-list-table tr:nth-child(even) { background: #faf9ff; }';
  html += '.ws-list-table tr { break-inside: avoid; }';
  html += '.ws-list-footer { margin-top: 12px; padding-top: 6px; border-top: 1px solid #ddd;';
  html += '  font-size: 8pt; color: #888; display: flex; justify-content: space-between; }';
  html += '@media print { body { padding: 0; } }';
  html += '</style></head><body>';

  html += '<div class="ws-list-header">';
  html += '<div><div class="ws-list-brand">25Maths</div>';
  html += '<div class="ws-list-title">' + esc(title) + '</div>';
  if (subtitle) html += '<div style="font-size:9pt;color:#666">' + esc(subtitle) + '</div>';
  html += '</div>';
  html += '<div class="ws-list-meta"><div>' + dateStr + '</div></div>';
  html += '</div>';

  html += bodyHtml;

  html += '<div class="ws-list-footer">';
  html += '<div>25Maths Exam Support Hub</div>';
  html += '<div>Generated ' + dateStr + '</div>';
  html += '</div>';

  /* KaTeX + print trigger */
  html += '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"><\/script>';
  html += '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"><\/script>';
  html += '<script>';
  html += 'window.addEventListener("load", function() {';
  html += '  try { renderMathInElement(document.body, {';
  html += '    delimiters: [';
  html += '      { left: "$$", right: "$$", display: true },';
  html += '      { left: "\\\\[", right: "\\\\]", display: true },';
  html += '      { left: "$", right: "$", display: false },';
  html += '      { left: "\\\\(", right: "\\\\)", display: false }';
  html += '    ], throwOnError: false';
  html += '  }); } catch(e) {}';
  html += '  setTimeout(function() { try { window.focus(); window.print(); } catch(e) {} }, 300);';
  html += '});';
  html += '<\/script>';

  html += '</body></html>';
  return html;
}

function _openPrintWindow(html) {
  var win = window.open('', '_blank');
  if (!win) {
    if (typeof showToast === 'function') {
      showToast(typeof t === 'function'
        ? t('Please allow pop-ups to print', '\u8bf7\u5141\u8bb8\u5f39\u7a97\u4ee5\u6253\u5370')
        : 'Please allow pop-ups to print');
    }
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ═══ WORD LIST PRINT ═══ */

function printWordList(words) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '<table class="ws-list-table"><thead><tr>';
  body += '<th>#</th><th>' + (zh ? '\u8bcd\u6c47' : 'Word') + '</th><th>' + (zh ? '\u5b9a\u4e49' : 'Definition') + '</th><th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th><th>' + (zh ? '\u4e0a\u6b21\u590d\u4e60' : 'Last Reviewed') + '</th><th>' + (zh ? '\u9057\u5fd8' : 'Re-forget') + '</th>';
  body += '</tr></thead><tbody>';
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    body += '<tr>';
    body += '<td>' + (i + 1) + '</td>';
    body += '<td><strong>' + esc(w.word || '') + '</strong></td>';
    body += '<td>' + esc(w.def || '') + '</td>';
    body += '<td>' + (w.fs || 'new') + '</td>';
    body += '<td>' + (w.lr ? new Date(w.lr).toLocaleDateString() : '-') + '</td>';
    body += '<td>' + (w.reforget || 0) + '</td>';
    body += '</tr>';
  }
  body += '</tbody></table>';
  var html = _buildListPrintDoc(zh ? '\u8bcd\u6c47\u5217\u8868' : 'Word List', words.length + (zh ? ' \u9879' : ' items'), body);
  _openPrintWindow(html);
}

/* ═══ KP LIST PRINT ═══ */

function printKPList(kps) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '<table class="ws-list-table"><thead><tr>';
  body += '<th>#</th><th>' + (zh ? '\u77e5\u8bc6\u70b9' : 'KP ID') + '</th><th>' + (zh ? '\u82f1\u6587\u6807\u9898' : 'Title (EN)') + '</th><th>' + (zh ? '\u4e2d\u6587\u6807\u9898' : 'Title (ZH)') + '</th><th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th><th>' + (zh ? '\u5c0f\u4e13\u9898' : 'Section') + '</th><th>' + (zh ? '\u9057\u5fd8' : 'Re-forget') + '</th>';
  body += '</tr></thead><tbody>';
  for (var i = 0; i < kps.length; i++) {
    var k = kps[i];
    body += '<tr>';
    body += '<td>' + (i + 1) + '</td>';
    body += '<td>' + esc(k.word || '') + '</td>';
    body += '<td>' + esc(k.def || '') + '</td>';
    body += '<td>' + esc(k.defZh || '') + '</td>';
    body += '<td>' + (k.fs || 'new') + '</td>';
    body += '<td>' + esc(k.section || '') + '</td>';
    body += '<td>' + (k.reforget || 0) + '</td>';
    body += '</tr>';
  }
  body += '</tbody></table>';
  var html = _buildListPrintDoc(zh ? '\u77e5\u8bc6\u70b9\u5217\u8868' : 'Knowledge Points', kps.length + (zh ? ' \u9879' : ' items'), body);
  _openPrintWindow(html);
}

/* ═══ PP LIST PRINT ═══ */

function printPPList(pps) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '<table class="ws-list-table"><thead><tr>';
  body += '<th>#</th><th>' + (zh ? '\u9898\u53f7' : 'Q ID') + '</th><th>' + (zh ? '\u6765\u6e90' : 'Source') + '</th><th>' + (zh ? '\u5206\u503c' : 'Marks') + '</th><th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th><th>' + (zh ? '\u5c0f\u4e13\u9898' : 'Section') + '</th><th>' + (zh ? '\u9057\u5fd8' : 'Re-forget') + '</th>';
  body += '</tr></thead><tbody>';
  for (var i = 0; i < pps.length; i++) {
    var p = pps[i];
    body += '<tr>';
    body += '<td>' + (i + 1) + '</td>';
    body += '<td>' + esc(p.word || '') + '</td>';
    body += '<td>' + esc(p.def || '') + '</td>';
    body += '<td>' + (p.marks || '-') + '</td>';
    body += '<td>' + (p.fs || 'new') + '</td>';
    body += '<td>' + esc(p.section || '') + '</td>';
    body += '<td>' + (p.reforget || 0) + '</td>';
    body += '</tr>';
  }
  body += '</tbody></table>';
  var html = _buildListPrintDoc(zh ? '\u771f\u9898\u5217\u8868' : 'Past Paper Questions', pps.length + (zh ? ' \u9879' : ' items'), body);
  _openPrintWindow(html);
}

/* ═══ CUSTOM LIST PRINT ═══ */

function printCustomList(list) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '<table class="ws-list-table"><thead><tr>';
  body += '<th>#</th><th>' + (zh ? '\u7c7b\u578b' : 'Type') + '</th><th>ID</th><th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th><th>' + (zh ? '\u9057\u5fd8' : 'Re-forget') + '</th>';
  body += '</tr></thead><tbody>';
  for (var i = 0; i < list.items.length; i++) {
    var item = list.items[i];
    var fs = 'new';
    if (typeof _resolveItemFLM === 'function') fs = _resolveItemFLM(item.type, item.ref);
    var rfCount = typeof getReforgetCount === 'function' ? getReforgetCount(item.ref) : 0;
    body += '<tr>';
    body += '<td>' + (i + 1) + '</td>';
    body += '<td>' + esc(item.type) + '</td>';
    body += '<td>' + esc(item.ref) + '</td>';
    body += '<td>' + fs + '</td>';
    body += '<td>' + rfCount + '</td>';
    body += '</tr>';
  }
  body += '</tbody></table>';

  /* Session history */
  if (list.sessions && list.sessions.length > 0) {
    body += '<div style="margin-top:16px"><strong>' + (zh ? '\u7ec3\u4e60\u8bb0\u5f55' : 'Session History') + '</strong></div>';
    body += '<table class="ws-list-table"><thead><tr>';
    body += '<th>#</th><th>' + (zh ? '\u65e5\u671f' : 'Date') + '</th><th>' + (zh ? '\u5df2\u638c\u63e1' : 'Mastered') + '</th><th>' + (zh ? '\u4e0d\u786e\u5b9a' : 'Uncertain') + '</th><th>' + (zh ? '\u5b66\u4e60\u4e2d' : 'Learning') + '</th><th>' + (zh ? '\u65b0' : 'New') + '</th>';
    body += '</tr></thead><tbody>';
    for (var si = 0; si < list.sessions.length; si++) {
      var sess = list.sessions[si];
      var r = sess.results || {};
      body += '<tr>';
      body += '<td>' + (si + 1) + '</td>';
      body += '<td>' + (sess.ts || '').slice(0, 10) + '</td>';
      body += '<td>' + (r.mastered || 0) + '</td>';
      body += '<td>' + (r.uncertain || 0) + '</td>';
      body += '<td>' + (r.learning || 0) + '</td>';
      body += '<td>' + (r['new'] || 0) + '</td>';
      body += '</tr>';
    }
    body += '</tbody></table>';
  }

  var html = _buildListPrintDoc(list.title || (zh ? '\u81ea\u5b9a\u4e49\u6e05\u5355' : 'Custom List'), list.items.length + (zh ? ' \u9879' : ' items'), body);
  _openPrintWindow(html);
}
