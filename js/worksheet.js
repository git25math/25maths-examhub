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

function _printStatus(fs, zh) {
  var colors = { mastered: '#059669', uncertain: '#D97706', learning: '#5248C9', 'new': '#9CA3AF' };
  var labels = zh ? { mastered: '\u5df2\u638c\u63e1', uncertain: '\u4e0d\u786e\u5b9a', learning: '\u5b66\u4e60\u4e2d', 'new': '\u65b0' }
    : { mastered: 'Mastered', uncertain: 'Uncertain', learning: 'Learning', 'new': 'New' };
  var s = fs || 'new';
  return '<span style="color:' + (colors[s] || '#9CA3AF') + ';font-weight:600">' + (labels[s] || s) + '</span>';
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
    body += '<td>' + _printStatus(w.fs, zh) + '</td>';
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
    body += '<td>' + _printStatus(k.fs, zh) + '</td>';
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

  /* Error reason options */
  var errOpts = zh
    ? ['\u5ba1\u9898\u4e0d\u6e05', '\u6982\u5ff5\u6a21\u7cca', '\u65b9\u6cd5\u9519\u8bef', '\u8ba1\u7b97\u5931\u8bef', '\u7c97\u5fc3\u5927\u610f']
    : ['Misread', 'Concept', 'Method', 'Calculation', 'Careless'];

  /* Mastery options */
  var masteryOpts = zh
    ? ['\u5df2\u638c\u63e1', '\u4e0d\u786e\u5b9a', '\u5b66\u4e60\u4e2d', '\u672a\u5b66']
    : ['Mastered', 'Uncertain', 'Learning', 'New'];

  var body = '<table class="ws-list-table ws-pp-table"><thead><tr>';
  body += '<th>#</th>';
  body += '<th>' + (zh ? '\u9898\u53f7' : 'Q ID') + '</th>';
  body += '<th>' + (zh ? '\u6240\u5c5e\u4e13\u9898' : 'Topic') + '</th>';
  body += '<th>' + (zh ? '\u5206\u503c' : 'Marks') + '</th>';
  body += '<th>' + (zh ? '\u9519\u56e0' : 'Error Reason') + '</th>';
  body += '<th>' + (zh ? '\u6807\u6ce8\u65f6\u95f4' : 'Marked') + '</th>';
  body += '<th>' + (zh ? '\u91cd\u5237\u8bb0\u5f55' : 'Re-practice') + '</th>';
  body += '<th>' + (zh ? '\u638c\u63e1\u7a0b\u5ea6' : 'Mastery') + '</th>';
  body += '</tr></thead><tbody>';

  for (var i = 0; i < pps.length; i++) {
    var p = pps[i];
    body += '<tr>';
    body += '<td style="text-align:center">' + (i + 1) + '</td>';
    body += '<td>' + esc(p.word || '') + '</td>';
    body += '<td>' + esc(p.section || '') + '</td>';
    body += '<td style="text-align:center">' + (p.marks || '-') + '</td>';

    /* Error reason checkboxes */
    body += '<td class="pp-check-cell">';
    for (var ei = 0; ei < errOpts.length; ei++) {
      body += '<label class="pp-check-label"><span class="pp-checkbox"></span>' + esc(errOpts[ei]) + '</label>';
    }
    body += '</td>';

    /* Marked time (auto) */
    body += '<td style="font-size:8pt;white-space:nowrap">' + (p.lr ? new Date(p.lr).toLocaleDateString() : '-') + '</td>';

    /* Re-practice record (blank lines for user) */
    body += '<td class="pp-repractice-cell">';
    body += '<div class="pp-blank-line"></div>';
    body += '<div class="pp-blank-line"></div>';
    body += '<div class="pp-blank-line"></div>';
    body += '</td>';

    /* Mastery checkboxes */
    body += '<td class="pp-check-cell">';
    for (var mi = 0; mi < masteryOpts.length; mi++) {
      body += '<label class="pp-check-label"><span class="pp-checkbox"></span>' + esc(masteryOpts[mi]) + '</label>';
    }
    body += '</td>';

    body += '</tr>';
  }
  body += '</tbody></table>';

  /* Use custom builder with extra PP-specific CSS */
  var title = zh ? '\u771f\u9898\u9519\u9898\u8bb0\u5f55' : 'Past Paper Error Log';
  var subtitle = pps.length + (zh ? ' \u9898' : ' questions');
  var userName = '';
  if (typeof currentUser !== 'undefined' && currentUser) {
    userName = currentUser.nickname || currentUser.email || '';
    if (userName === 'guest') userName = '';
  }
  var html = _buildPPListPrintDoc(title, subtitle, body, userName);
  _openPrintWindow(html);
}

function _buildPPListPrintDoc(title, subtitle, bodyHtml, userName) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var dateStr = new Date().toLocaleDateString('en-CA');
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');

  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">';
  html += '<title>' + esc(title) + '</title>';
  html += '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">';
  html += '<style>';
  html += '@page { size: A4 landscape; margin: 10mm; }';
  html += '*, *::before, *::after { box-sizing: border-box; }';
  html += 'body { font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
  html += '  font-size: 9pt; line-height: 1.3; color: #000; background: #fff; margin: 0; padding: 12px; }';
  html += '.ws-list-header { display: flex; justify-content: space-between; align-items: flex-start;';
  html += '  border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 8px; }';
  html += '.ws-list-brand { font-size: 13pt; font-weight: 700; }';
  html += '.ws-list-title { font-size: 11pt; font-weight: 600; color: #444; }';
  html += '.ws-list-meta { font-size: 8pt; color: #666; text-align: right; }';
  html += '.ws-user-name { font-size: 11pt; font-weight: 700; color: #5248C9; }';
  html += '.ws-motto { font-size: 8pt; color: #888; margin-top: 3px; font-style: italic; line-height: 1.4; max-width: 220px; }';
  html += '.ws-pp-table { width: 100%; border-collapse: collapse; font-size: 9pt; }';
  html += '.ws-pp-table th { background: #f5f3ff; padding: 5px 6px; border: 1px solid #d1d5db;';
  html += '  text-align: left; font-weight: 600; font-size: 8pt; white-space: nowrap; }';
  html += '.ws-pp-table td { padding: 4px 6px; border: 1px solid #d1d5db; vertical-align: top; }';
  html += '.ws-pp-table tr:nth-child(even) { background: #faf9ff; }';
  html += '.ws-pp-table tr { break-inside: avoid; }';
  html += '.pp-check-cell { padding: 3px 4px !important; }';
  html += '.pp-check-label { display: block; font-size: 8pt; line-height: 1.6; white-space: nowrap; }';
  html += '.pp-checkbox { display: inline-block; width: 10px; height: 10px; border: 1.5px solid #666;';
  html += '  border-radius: 2px; margin-right: 3px; vertical-align: middle; position: relative; top: -1px; }';
  html += '.pp-repractice-cell { min-width: 80px; }';
  html += '.pp-blank-line { border-bottom: 1px solid #ccc; height: 18px; }';
  html += '.ws-list-footer { margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd;';
  html += '  font-size: 7pt; color: #888; display: flex; justify-content: space-between; }';
  html += '@media print { body { padding: 0; } }';
  html += '</style></head><body>';

  html += '<div class="ws-list-header">';
  html += '<div><div class="ws-list-brand">25Maths</div>';
  html += '<div class="ws-list-title">' + esc(title) + '</div>';
  if (subtitle) html += '<div style="font-size:8pt;color:#666">' + esc(subtitle) + '</div>';
  html += '</div>';
  html += '<div class="ws-list-meta">';
  if (userName) html += '<div class="ws-user-name">' + esc(userName) + '</div>';
  html += '<div>' + dateStr + '</div>';
  html += '<div class="ws-motto">' + (zh
    ? '\u6bcf\u9053\u9519\u9898\u90fd\u662f\u8fdb\u6b65\u7684\u8d77\u70b9\u2014\u2014\u6807\u8bb0\u3001\u53cd\u601d\u3001\u91cd\u7ec3\uff0c\u76f4\u5230\u771f\u6b63\u638c\u63e1\u3002'
    : 'Every mistake is a stepping stone\u2014mark it, reflect, re-practice, until truly mastered.') + '</div>';
  html += '</div>';
  html += '</div>';

  html += bodyHtml;

  html += '<div class="ws-list-footer">';
  html += '<div>25Maths Exam Support Hub</div>';
  html += '<div>Generated ' + dateStr + '</div>';
  html += '</div>';

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

/* ═══ CUSTOM LIST PRINT ═══ */

/* ═══ CUSTOM LIST — DETAILED PRINT ═══ */

function _resolveItemTitle(type, ref) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  if (type === 'vocab') {
    var all = typeof getAllWords === 'function' ? getAllWords() : [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].key === ref) return esc(all[i].word) + ' — ' + esc(all[i].def || '');
    }
    return esc(ref);
  }
  if (type === 'kp') {
    var bds = ['cie', 'edx'];
    for (var bi = 0; bi < bds.length; bi++) {
      var pts = (typeof _kpData !== 'undefined') ? (_kpData[bds[bi]] || []) : [];
      for (var ki = 0; ki < pts.length; ki++) {
        if (pts[ki].id === ref) {
          var t = pts[ki].title || ref;
          if (pts[ki].title_zh) t += ' (' + pts[ki].title_zh + ')';
          return esc(t);
        }
      }
    }
    return esc(ref);
  }
  if (type === 'pp') {
    var bds2 = ['cie', 'edx'];
    for (var bi2 = 0; bi2 < bds2.length; bi2++) {
      var ppB = (typeof _ppData !== 'undefined') ? _ppData[bds2[bi2]] : null;
      if (ppB && ppB.questions) {
        for (var qi = 0; qi < ppB.questions.length; qi++) {
          var q = ppB.questions[qi];
          if (q.id === ref) {
            return 'Q' + (q.num || ref) + ' (' + (q.marks || 0) + 'm) - ' + esc(q.src || '');
          }
        }
      }
    }
    return esc(ref);
  }
  return esc(ref);
}

function _resolveItemDetailHtml(type, ref) {
  if (type === 'vocab') {
    var all = typeof getAllWords === 'function' ? getAllWords() : [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].key === ref) {
        var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
        var wd = typeof getWordData === 'function' ? getWordData() : {};
        var d = wd[ref] || {};
        return '<div><strong>' + esc(all[i].word) + '</strong> — ' + esc(all[i].def || '') +
          '<br><small>FLM: ' + (d.fs || 'new') + ' | ok: ' + (d.ok || 0) + ' | fail: ' + (d.fail || 0) + ' | cs: ' + (d.cs || 0) + '</small></div>';
      }
    }
    return '<div>' + ref + '</div>';
  }
  if (type === 'kp') {
    var bds = ['cie', 'edx'];
    for (var bi = 0; bi < bds.length; bi++) {
      var pts = (typeof _kpData !== 'undefined') ? (_kpData[bds[bi]] || []) : [];
      for (var ki = 0; ki < pts.length; ki++) {
        if (pts[ki].id === ref) {
          var kp = pts[ki];
          var h = '<div><strong>' + (kp.title || ref) + '</strong>';
          if (kp.title_zh) h += ' <span style="color:#666">' + kp.title_zh + '</span>';
          if (kp.explanation) h += '<br>' + kp.explanation;
          if (kp.explanation_zh) h += '<br><span style="color:#666">' + kp.explanation_zh + '</span>';
          if (kp.exam_mode) h += '<br><em>Exam: ' + kp.exam_mode + '</em>';
          h += '</div>';
          return h;
        }
      }
    }
    return '<div>' + ref + '</div>';
  }
  if (type === 'pp') {
    var bds2 = ['cie', 'edx'];
    for (var bi2 = 0; bi2 < bds2.length; bi2++) {
      var ppB = (typeof _ppData !== 'undefined') ? _ppData[bds2[bi2]] : null;
      if (ppB && ppB.questions) {
        for (var qi = 0; qi < ppB.questions.length; qi++) {
          var q = ppB.questions[qi];
          if (q.id === ref) {
            var qh = '';
            try {
              if (typeof _ppRenderWithMarks === 'function') qh += _ppRenderWithMarks(q, false);
              if (typeof _ppRenderFigures === 'function') qh += _ppRenderFigures(q);
            } catch(e) {}
            return qh || '<div>' + ref + '</div>';
          }
        }
      }
    }
    return '<div>' + ref + '</div>';
  }
  return '<div>' + ref + '</div>';
}

function printCustomListDetailed(list) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '';

  /* Group by type */
  var vocabs = [], kps = [], pps = [];
  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    if (it.type === 'vocab') vocabs.push(it);
    else if (it.type === 'kp') kps.push(it);
    else if (it.type === 'pp') pps.push(it);
  }

  /* Vocab section */
  if (vocabs.length > 0) {
    body += '<div style="margin-bottom:16px"><strong style="font-size:12pt">' + (zh ? '\u8bcd\u6c47 (' + vocabs.length + ')' : 'Vocabulary (' + vocabs.length + ')') + '</strong></div>';
    body += '<table class="ws-list-table"><thead><tr>';
    body += '<th>#</th><th>' + (zh ? '\u8bcd\u6c47' : 'Word') + '</th><th>' + (zh ? '\u5b9a\u4e49' : 'Definition') + '</th><th>' + (zh ? '\u72b6\u6001' : 'Status') + '</th><th>' + (zh ? '\u9057\u5fd8' : 'Re-forget') + '</th>';
    body += '</tr></thead><tbody>';
    var allW = typeof getAllWords === 'function' ? getAllWords() : [];
    var wMap = {};
    for (var wi = 0; wi < allW.length; wi++) wMap[allW[wi].key] = allW[wi];
    for (var vi = 0; vi < vocabs.length; vi++) {
      var w = wMap[vocabs[vi].ref] || {};
      var fs = typeof _resolveItemFLM === 'function' ? _resolveItemFLM('vocab', vocabs[vi].ref) : 'new';
      var rf = typeof getReforgetCount === 'function' ? getReforgetCount(vocabs[vi].ref) : 0;
      body += '<tr><td>' + (vi + 1) + '</td>';
      body += '<td><strong>' + esc(w.word || vocabs[vi].ref) + '</strong></td>';
      body += '<td>' + esc(w.def || '') + '</td>';
      body += '<td>' + _printStatus(fs, zh) + '</td>';
      body += '<td>' + rf + '</td></tr>';
    }
    body += '</tbody></table>';
  }

  /* KP section */
  if (kps.length > 0) {
    body += '<div style="margin-top:20px;margin-bottom:12px"><strong style="font-size:12pt">' + (zh ? '\u77e5\u8bc6\u70b9 (' + kps.length + ')' : 'Knowledge Points (' + kps.length + ')') + '</strong></div>';
    for (var ki = 0; ki < kps.length; ki++) {
      var kpHtml = _resolveItemDetailHtml('kp', kps[ki].ref);
      var kpFs = typeof _resolveItemFLM === 'function' ? _resolveItemFLM('kp', kps[ki].ref) : 'new';
      body += '<div style="padding:8px 10px;margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;break-inside:avoid">';
      body += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      body += '<div style="flex:1">' + kpHtml + '</div>';
      body += '<div style="white-space:nowrap;margin-left:8px">' + _printStatus(kpFs, zh) + '</div>';
      body += '</div></div>';
    }
  }

  /* PP section */
  if (pps.length > 0) {
    body += '<div style="margin-top:20px;margin-bottom:12px"><strong style="font-size:12pt">' + (zh ? '\u771f\u9898 (' + pps.length + ')' : 'Past Papers (' + pps.length + ')') + '</strong></div>';
    for (var pi = 0; pi < pps.length; pi++) {
      var ppHtml = _resolveItemDetailHtml('pp', pps[pi].ref);
      var ppFs = typeof _resolveItemFLM === 'function' ? _resolveItemFLM('pp', pps[pi].ref) : 'new';
      body += '<div style="padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;background:#fafafa;break-inside:avoid">';
      body += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
      body += '<strong>' + esc(pps[pi].ref) + '</strong>';
      body += '<span>' + _printStatus(ppFs, zh) + '</span>';
      body += '</div>';

      /* PP rendering classes needed */
      body += '<div class="ws-question">' + ppHtml + '</div>';
      body += '</div>';
    }
  }

  var title = list.title || (zh ? '\u81ea\u5b9a\u4e49\u6e05\u5355' : 'Custom List');
  var subtitle = list.items.length + (zh ? ' \u9879 \u00b7 \u8be6\u7ec6\u5185\u5bb9' : ' items \u00b7 Detailed View');
  var html = _buildListPrintDoc(title, subtitle, body);

  /* Inject PP rendering styles into the doc */
  html = html.replace('</style>', '.ws-question { padding:10px;border:1px solid #ccc;border-radius:4px;background:#fafafa; }' +
    '.pp-part-block { display:flex;align-items:flex-start;gap:8px;margin-bottom:8px; }' +
    '.pp-part-label { font-weight:700;min-width:24px;color:#333; }' +
    '.pp-part-content { flex:1;white-space:pre-line;word-break:break-word; }' +
    '.pp-part-intro { margin-bottom:8px;white-space:pre-line; }' +
    '.pp-marks-right { font-size:10pt;font-weight:600;color:#666;white-space:nowrap;margin-left:8px; }' +
    '.pp-figures { text-align:center;margin:10px 0; }' +
    '.pp-fig { max-width:90%;max-height:200px; }' +
    '.pp-subparts { margin-left:20px; }' +
    '.pp-subpart-label { font-size:10pt; }' +
    '</style>');

  _openPrintWindow(html);
}

function printCustomListChecklist(list) {
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };
  var zh = (typeof appLang !== 'undefined' && appLang !== 'en');
  var body = '<table class="ws-list-table"><thead><tr>';
  body += '<th>#</th><th>' + (zh ? '\u7c7b\u578b' : 'Type') + '</th><th>' + (zh ? '\u9879\u76ee' : 'Item') + '</th>';
  body += '<th style="width:40px;text-align:center">' + (zh ? '\u638c\u63e1' : 'M') + '</th>';
  body += '<th style="width:40px;text-align:center">' + (zh ? '\u6a21\u7cca' : 'U') + '</th>';
  body += '<th style="width:40px;text-align:center">' + (zh ? '\u5b66\u4e60' : 'L') + '</th>';
  body += '<th style="width:40px;text-align:center">' + (zh ? '\u672a\u5b66' : 'N') + '</th>';
  body += '<th>' + (zh ? '\u5907\u6ce8' : 'Notes') + '</th>';
  body += '</tr></thead><tbody>';

  for (var i = 0; i < list.items.length; i++) {
    var it = list.items[i];
    var title = _resolveItemTitle(it.type, it.ref);
    var typeLabel = it.type === 'vocab' ? 'V' : it.type === 'kp' ? 'K' : 'P';
    body += '<tr>';
    body += '<td>' + (i + 1) + '</td>';
    body += '<td><strong>' + typeLabel + '</strong></td>';
    body += '<td>' + title + '<br><span style="font-size:8pt;color:#999">' + esc(it.ref) + '</span></td>';
    body += '<td style="text-align:center"><span class="ws-checkbox"></span></td>';
    body += '<td style="text-align:center"><span class="ws-checkbox"></span></td>';
    body += '<td style="text-align:center"><span class="ws-checkbox"></span></td>';
    body += '<td style="text-align:center"><span class="ws-checkbox"></span></td>';
    body += '<td style="min-width:80px"></td>';
    body += '</tr>';
  }
  body += '</tbody></table>';

  /* Notes area */
  body += '<div style="margin-top:20px;border:1px solid #ccc;border-radius:4px;padding:12px;min-height:100px">';
  body += '<div style="font-size:9pt;color:#888;margin-bottom:4px">' + (zh ? '\u8865\u5f55\u8bf4\u660e' : 'Re-entry Notes') + '</div>';
  body += '</div>';

  var title2 = list.title || (zh ? '\u81ea\u5b9a\u4e49\u6e05\u5355' : 'Custom List');
  var subtitle = list.items.length + (zh ? ' \u9879 \u00b7 \u79bb\u7ebf\u52fe\u9009' : ' items \u00b7 Offline Checklist');

  var html = _buildListPrintDoc(title2, subtitle, body);
  /* Inject checkbox styles */
  html = html.replace('</style>',
    '.ws-checkbox { display:inline-block;width:14px;height:14px;border:1.5px solid #333;border-radius:2px; }' +
    '</style>');
  _openPrintWindow(html);
}

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
    body += '<td>' + _printStatus(fs, zh) + '</td>';
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
