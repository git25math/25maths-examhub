/* ══════════════════════════════════════════════════════════════
   data-admin.js — Super-admin data quality dashboard
   Detect LaTeX issues → batch edit → diff preview → export
   ══════════════════════════════════════════════════════════════ */

/* ═══ DQ RULES ═══ */
var DQ_RULES = [
  { id: 'subparts', label: ['\\begin{subparts}', '\\begin{subparts}'], pattern: /\\begin\{subparts\}/g, severity: 'error', autoFix: null },
  { id: 'parts', label: ['\\begin{parts}', '\\begin{parts}'], pattern: /\\begin\{parts\}/g, severity: 'warn', autoFix: null },
  { id: 'textbf', label: ['\\textbf{}', '\\textbf{}'], pattern: /\\textbf\{([^}]*)\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\textbf\{([^}]*)\}/g, '**$1**'); } },
  { id: 'spacing', label: ['\\\\[…cm]', '\\\\[…cm]'], pattern: /\\\\\[\d+(\.\d+)?(cm|mm|pt|em)\]/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\\\\[\d+(\.\d+)?(cm|mm|pt|em)\]/g, '\n'); } },
  { id: 'screenshot', label: ['InsertScreenShot', 'InsertScreenShot'], pattern: /InsertScreenShot/g, severity: 'info', autoFix: null },
  { id: 'quad', label: ['\\quad (outside $)', '\\quad（$ 外）'], pattern: /(?<!\$[^$]*)\\quad(?![^$]*\$)/g, severity: 'warn',
    autoFix: function(tex) {
      return tex.replace(/\\quad/g, function(m, offset) {
        var before = tex.substring(0, offset);
        var inMath = (before.split('$').length - 1) % 2 === 1;
        return inMath ? m : '\u2003';
      });
    } },
  { id: 'tmarker', label: ['Line-start "t " marker', '行首 t 标记'], pattern: /^t /gm, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/^t /gm, ''); } },
  { id: 'text_cmd', label: ['\\text{} outside $', '\\text{} 在 $ 外'], pattern: /(?<!\$[^$]*)\\text\{/g, severity: 'warn', autoFix: null },
  { id: 'center', label: ['\\begin{center}', '\\begin{center}'], pattern: /\\begin\{center\}|\\end\{center\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\begin\{center\}|\\end\{center\}/g, '').replace(/\n{3,}/g, '\n\n'); } },
  { id: 'placeholder', label: ['{---}', '{---}'], pattern: /\{---\}/g, severity: 'info', autoFix: null },
  { id: 'degree', label: ['\\degree / \\textdegree', '\\degree / \\textdegree'], pattern: /\\(text)?degree/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\textdegree/g, '\u00b0').replace(/\\degree/g, '\u00b0'); } },
  { id: 'pounds', label: ['\\pounds', '\\pounds'], pattern: /\\pounds/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\pounds/g, '\u00a3'); } },
  { id: 'minipage', label: ['\\begin{minipage}', '\\begin{minipage}'], pattern: /\\begin\{minipage\}[\s\S]*?\\end\{minipage\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\begin\{minipage\}(\{[^}]*\}|\[[^\]]*\])*\s*/g, '').replace(/\\end\{minipage\}/g, ''); } },
  { id: 'renewcmd', label: ['\\renewcommand', '\\renewcommand'], pattern: /\\renewcommand\{[^}]*\}\{[^}]*\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\renewcommand\{[^}]*\}\{[^}]*\}\s*/g, ''); } },
  { id: 'hspace', label: ['\\hspace / \\vspace', '\\hspace / \\vspace'], pattern: /\\[hv]space\*?\{[^}]*\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\[hv]space\*?\{[^}]*\}/g, ''); } },
  { id: 'dotfill', label: ['\\dotfill', '\\dotfill'], pattern: /\\dotfill/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\s*\\dotfill\s*/g, '\n'); } },
  { id: 'centering', label: ['\\centering', '\\centering'], pattern: /\\centering/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\centering\s*/g, ''); } },
  { id: 'textit', label: ['\\textit{}', '\\textit{}'], pattern: /\\textit\{([^}]*)\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\textit\{([^}]*)\}/g, '*$1*'); } },
  { id: 'item', label: ['\\item', '\\item'], pattern: /\\item/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\item\s*/g, ''); } },
  { id: 'enumerate', label: ['enumerate/itemize', 'enumerate/itemize'], pattern: /\\begin\{(enumerate|itemize)\}|\\end\{(enumerate|itemize)\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\begin\{(enumerate|itemize)\}(\[[^\]]*\])?\s*/g, '').replace(/\\end\{(enumerate|itemize)\}\s*/g, ''); } },
  { id: 'figure', label: ['\\begin{figure}', '\\begin{figure}'], pattern: /\\begin\{figure\}|\\end\{figure\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\begin\{figure\}(\[[^\]]*\])?\s*/g, '').replace(/\\end\{figure\}\s*/g, ''); } },
  { id: 'fbox', label: ['\\fbox{}', '\\fbox{}'], pattern: /\\fbox\{([^}]*)\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\fbox\{([^}]*)\}/g, '$1'); } },
  { id: 'phantom', label: ['\\phantom{}', '\\phantom{}'], pattern: /\\phantom\{[^}]*\}/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\phantom\{[^}]*\}/g, ''); } },
  { id: 'large', label: ['\\large/\\small', '\\large/\\small'], pattern: /\\(large|Large|LARGE|small|footnotesize|tiny)\b/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\(large|Large|LARGE|small|footnotesize|tiny)\b\s*/g, ''); } },
  { id: 'hfill', label: ['\\hfill', '\\hfill'], pattern: /\\hfill/g, severity: 'warn',
    autoFix: function(tex) { return tex.replace(/\\hfill\s*/g, ' '); } },
  { id: 'bigskip', label: ['bigskip/medskip/smallskip', 'bigskip/medskip/smallskip'], pattern: /\\(bigskip|medskip|smallskip)/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\(bigskip|medskip|smallskip)\s*/g, '\n'); } },
  { id: 'currfiledir', label: ['\\currfiledir refs', '\\currfiledir 引用'], pattern: /\\(input|includegraphics)\{\\currfiledir[^}]*\}|\\IfFileExists\{\\currfiledir/g, severity: 'error',
    autoFix: function(tex) {
      tex = tex.replace(/\\includegraphics\{\\currfiledir\s*[^}]*\}\s*/g, '[Diagram]\n');
      tex = tex.replace(/\\input\{\\currfiledir\s*[^}]*\}\s*/g, '[Diagram]\n');
      tex = tex.replace(/\\begin\{InsertScreenShot\}[\s\S]*?\\end\{InsertScreenShot\}\s*/g, '[Diagram]\n');
      return tex;
    } },
  { id: 'noindent', label: ['\\noindent', '\\noindent'], pattern: /\\noindent/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\noindent\s*/g, ''); } },
  { id: 'mbox', label: ['\\mbox{}', '\\mbox{}'], pattern: /\\mbox\{([^}]*)\}/g, severity: 'info',
    autoFix: function(tex) { return tex.replace(/\\mbox\{([^}]*)\}/g, '$1'); } }
];

var _dqBoard = 'cie';
var _dqScanResult = null;
var _dqPending = {};  /* board → { qid: newTex } */
var _dqPageSize = 50;

/* ═══ DATA SOURCES ═══ */

var _dqSources = {
  cie: { file: 'data/papers-cie.json', label: 'CIE 0580' },
  edx: { file: 'data/papers-edx.json', label: 'Edexcel 4MA1' },
  pastpapers: { file: 'data/pastpapers-cie.json', label: 'CIE Pastpapers (legacy)' }
};

/* Cache loaded data keyed by source id */
var _dqDataCache = {};

function dqLoadData(srcId) {
  if (_dqDataCache[srcId]) return Promise.resolve(_dqDataCache[srcId]);
  /* Reuse _ppData if already loaded by practice module */
  if ((srcId === 'cie' || srcId === 'edx') && typeof _ppData !== 'undefined' && _ppData[srcId]) {
    _dqDataCache[srcId] = _ppData[srcId].questions || [];
    return Promise.resolve(_dqDataCache[srcId]);
  }
  var src = _dqSources[srcId];
  if (!src) return Promise.reject(new Error('Unknown source: ' + srcId));
  return fetch(src.file + '?v=' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : Date.now()))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.v === '2.0') {
        _dqDataCache[srcId] = data.questions || [];
      } else if (Array.isArray(data)) {
        _dqDataCache[srcId] = data;
      } else {
        _dqDataCache[srcId] = data.questions || [];
      }
      return _dqDataCache[srcId];
    });
}

/* ═══ SCAN ENGINE ═══ */

function dqScan(questions) {
  var result = { total: questions.length, issueCount: 0, autoFixable: 0, rules: {} };
  for (var ri = 0; ri < DQ_RULES.length; ri++) {
    result.rules[DQ_RULES[ri].id] = [];
  }

  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var tex = q.tex || '';
    if (!tex) continue;
    var qHasIssue = false;

    for (var ri2 = 0; ri2 < DQ_RULES.length; ri2++) {
      var rule = DQ_RULES[ri2];
      rule.pattern.lastIndex = 0;
      var m = tex.match(rule.pattern);
      if (m && m.length > 0) {
        /* Extract a snippet around first match */
        rule.pattern.lastIndex = 0;
        var firstMatch = rule.pattern.exec(tex);
        var start = Math.max(0, firstMatch.index - 30);
        var end = Math.min(tex.length, firstMatch.index + firstMatch[0].length + 30);
        var snippet = (start > 0 ? '...' : '') + tex.substring(start, end) + (end < tex.length ? '...' : '');

        result.rules[rule.id].push({
          id: q.id,
          src: q.src || '',
          tex: tex,
          snippet: snippet,
          matchCount: m.length
        });
        qHasIssue = true;
        if (rule.autoFix) result.autoFixable++;
      }
    }
    if (qHasIssue) result.issueCount++;
  }
  return result;
}

/* ═══ RENDER MAIN DASHBOARD ═══ */

function renderDataQuality() {
  var ct = E('admin-content');
  if (!ct) return;

  ct.innerHTML = '<div class="admin-loading">' + t('Scanning...', '\u626b\u63cf\u4e2d...') + '</div>';

  dqLoadData(_dqBoard).then(function(questions) {
    _dqScanResult = dqScan(questions);
    dqRenderDashboard(ct);
  }).catch(function(err) {
    ct.innerHTML = '<div class="admin-empty">' + escapeHtml(err.message) + '</div>';
  });
}

function dqRenderDashboard(ct) {
  var r = _dqScanResult;
  if (!r) return;

  var html = '';

  /* Board pills */
  html += '<div class="dq-board-pills">';
  var srcKeys = Object.keys(_dqSources);
  for (var si = 0; si < srcKeys.length; si++) {
    var sk = srcKeys[si];
    html += '<button class="dq-pill' + (sk === _dqBoard ? ' active' : '') + '" data-dq-action="board" data-board="' + sk + '">' + _dqSources[sk].label + '</button>';
  }
  html += '</div>';

  /* Summary cards */
  html += '<div class="dq-summary">';
  html += dqSummaryCard(t('Total', '\u603b\u9898\u6570'), r.total, '');
  html += dqSummaryCard(t('With Issues', '\u6709\u95ee\u9898'), r.issueCount, 'error');
  html += dqSummaryCard(t('Auto-fixable', '\u53ef\u81ea\u52a8\u4fee'), r.autoFixable, 'warn');
  html += '<div class="dq-summary-actions">';
  html += '<button class="btn btn-ghost btn-sm" data-dq-action="rescan">' + t('Re-scan', '\u91cd\u65b0\u626b\u63cf') + '</button>';
  html += '<button class="btn btn-primary btn-sm" data-dq-action="export">' + t('Export JSON', '\u5bfc\u51fa JSON') + '</button>';
  html += '</div></div>';

  /* Pending changes indicator */
  var pending = _dqPending[_dqBoard];
  if (pending && Object.keys(pending).length > 0) {
    html += '<div class="dq-pending">' + t('Pending changes: ', '\u5f85\u5e94\u7528\u53d8\u66f4\uff1a') + Object.keys(pending).length + ' ' + t('questions', '\u9898') + '</div>';
  }

  /* Rule rows */
  html += '<div class="dq-rules">';
  for (var ri = 0; ri < DQ_RULES.length; ri++) {
    var rule = DQ_RULES[ri];
    var items = r.rules[rule.id] || [];
    if (items.length === 0) continue;

    var sevClass = rule.severity === 'error' ? 'dq-sev-error' : rule.severity === 'warn' ? 'dq-sev-warn' : 'dq-sev-info';
    html += '<div class="dq-rule">';
    html += '<span class="dq-sev-dot ' + sevClass + '"></span>';
    html += '<span class="dq-rule-label">' + escapeHtml(rule.label[appLang === 'zh' ? 1 : 0]) + '</span>';
    html += '<span class="dq-badge">' + items.length + '</span>';
    html += '<div class="dq-rule-actions">';
    html += '<button class="btn btn-ghost btn-sm" data-dq-action="view" data-rule="' + rule.id + '">' + t('View', '\u67e5\u770b') + '</button>';
    html += '<button class="btn btn-ghost btn-sm" data-dq-action="copy-ai" data-rule="' + rule.id + '">' + t('Copy AI', '\u590d\u5236 AI') + '</button>';
    if (rule.autoFix) {
      html += '<button class="btn btn-primary btn-sm" data-dq-action="autofix" data-rule="' + rule.id + '">' + t('Auto-Fix', '\u4e00\u952e\u4fee\u590d') + '</button>';
    }
    html += '</div></div>';
  }
  html += '</div>';

  ct.innerHTML = html;
}

function dqSummaryCard(label, value, type) {
  var cls = type ? ' dq-card--' + type : '';
  return '<div class="dq-card' + cls + '"><div class="dq-card-val">' + value + '</div><div class="dq-card-label">' + label + '</div></div>';
}

/* ═══ VIEW ISSUE LIST ═══ */

function dqShowIssueList(ruleId, page) {
  if (!_dqScanResult) return;
  var items = _dqScanResult.rules[ruleId] || [];
  if (items.length === 0) return;
  page = page || 0;

  var totalPages = Math.ceil(items.length / _dqPageSize);
  var start = page * _dqPageSize;
  var pageItems = items.slice(start, start + _dqPageSize);

  var rule = DQ_RULES.find(function(r) { return r.id === ruleId; });
  var ruleLabel = rule ? rule.label[appLang === 'zh' ? 1 : 0] : ruleId;

  var html = '<div class="section-title">' + escapeHtml(ruleLabel) + ' <span style="color:var(--c-muted);font-size:13px">(' + items.length + ' ' + t('issues', '\u95ee\u9898') + ')</span></div>';

  html += '<div class="dq-issue-list" style="max-height:400px;overflow:auto">';
  for (var i = 0; i < pageItems.length; i++) {
    var item = pageItems[i];
    html += '<div class="dq-issue-row">';
    html += '<div class="dq-issue-id">' + escapeHtml(item.id) + '</div>';
    html += '<div class="dq-issue-src">' + escapeHtml(item.src) + '</div>';
    html += '<div class="dq-issue-snippet">' + dqHighlightSnippet(item.snippet, rule.pattern) + '</div>';
    html += '</div>';
  }
  html += '</div>';

  /* Pagination */
  if (totalPages > 1) {
    html += '<div class="dq-page-nav">';
    if (page > 0) html += '<button class="btn btn-ghost btn-sm" data-dq-action="view-page" data-rule="' + ruleId + '" data-page="' + (page - 1) + '">&laquo; ' + t('Prev', '\u4e0a\u4e00\u9875') + '</button>';
    html += '<span class="dq-page-info">' + (page + 1) + ' / ' + totalPages + '</span>';
    if (page < totalPages - 1) html += '<button class="btn btn-ghost btn-sm" data-dq-action="view-page" data-rule="' + ruleId + '" data-page="' + (page + 1) + '">' + t('Next', '\u4e0b\u4e00\u9875') + ' &raquo;</button>';
    html += '</div>';
  }

  /* Bottom actions */
  html += '<div class="btn-row btn-row--mt16 btn-row--wrap">';
  html += '<button class="btn btn-primary btn-sm" data-dq-action="copy-ai" data-rule="' + ruleId + '">' + t('Copy JSON for AI', '\u590d\u5236 JSON \u7ed9 AI') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" data-dq-action="paste-back" data-rule="' + ruleId + '">' + t('Paste Back', '\u7c98\u8d34\u56de\u6765') + '</button>';
  if (rule && rule.autoFix) {
    html += '<button class="btn btn-primary btn-sm" data-dq-action="autofix" data-rule="' + ruleId + '">' + t('Auto-Fix All', '\u4e00\u952e\u4fee\u590d\u5168\u90e8') + '</button>';
  }
  html += '<button class="btn btn-ghost btn-sm" onclick="hideModal()">' + t('Close', '\u5173\u95ed') + '</button>';
  html += '</div>';

  showModal(html);
}

function dqHighlightSnippet(snippet, pattern) {
  var safe = escapeHtml(snippet);
  /* Re-apply pattern on the escaped text to highlight */
  try {
    var p2 = new RegExp(pattern.source.replace(/\\/g, '\\'), pattern.flags);
    /* Just highlight with a simple approach: mark pattern matches in original, then escape */
    var parts = [];
    var last = 0;
    pattern.lastIndex = 0;
    var m;
    while ((m = pattern.exec(snippet)) !== null) {
      if (m.index > last) parts.push(escapeHtml(snippet.substring(last, m.index)));
      parts.push('<mark class="dq-hl">' + escapeHtml(m[0]) + '</mark>');
      last = m.index + m[0].length;
      if (!pattern.global) break;
    }
    if (last < snippet.length) parts.push(escapeHtml(snippet.substring(last)));
    return parts.join('');
  } catch(e) {
    return safe;
  }
}

/* ═══ COPY FOR AI ═══ */

function dqCopyForAI(ruleId) {
  if (!_dqScanResult) return;
  var items = _dqScanResult.rules[ruleId] || [];
  var payload = items.map(function(item) {
    return { id: item.id, tex: item.tex };
  });

  var json = JSON.stringify(payload, null, 2);
  navigator.clipboard.writeText(json).then(function() {
    showToast(t('Copied ' + items.length + ' questions to clipboard', '\u5df2\u590d\u5236 ' + items.length + ' \u9898\u5230\u526a\u8d34\u677f'));
  }).catch(function() {
    /* Fallback: show in textarea */
    dqShowCopyFallback(json);
  });
}

function dqShowCopyFallback(json) {
  var html = '<div class="section-title">' + t('Copy this JSON', '\u590d\u5236\u6b64 JSON') + '</div>';
  html += '<textarea class="dq-textarea" rows="16" readonly onclick="this.select()">' + escapeHtml(json) + '</textarea>';
  html += '<button class="btn btn-ghost" style="margin-top:12px" onclick="hideModal()">' + t('Close', '\u5173\u95ed') + '</button>';
  showModal(html);
}

/* ═══ PASTE BACK + DIFF PREVIEW ═══ */

function dqShowPasteBack(ruleId) {
  var html = '<div class="section-title">' + t('Paste AI-fixed JSON', '\u7c98\u8d34 AI \u4fee\u590d\u540e\u7684 JSON') + '</div>';
  html += '<textarea class="dq-textarea" id="dq-paste-area" rows="12" placeholder=\'[{"id":"...","tex":"..."},...]\'></textarea>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" data-dq-action="preview-diff" data-rule="' + ruleId + '">' + t('Preview Diff', '\u9884\u89c8\u5dee\u5f02') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
  html += '</div>';
  showModal(html);
}

function dqPreviewDiff(ruleId) {
  var textarea = E('dq-paste-area');
  if (!textarea) return;
  var text = textarea.value.trim();
  if (!text) { showToast(t('Please paste JSON', '\u8bf7\u7c98\u8d34 JSON')); return; }

  var parsed;
  try {
    parsed = JSON.parse(text);
  } catch(e) {
    showToast(t('Invalid JSON: ', 'JSON \u683c\u5f0f\u9519\u8bef\uff1a') + e.message);
    return;
  }

  if (!Array.isArray(parsed)) {
    showToast(t('Expected array', '\u5e94\u4e3a\u6570\u7ec4'));
    return;
  }

  /* Match with current data */
  var questions = _dqDataCache[_dqBoard] || [];
  var qMap = {};
  for (var i = 0; i < questions.length; i++) {
    qMap[questions[i].id] = questions[i];
  }

  var diffs = [];
  for (var j = 0; j < parsed.length; j++) {
    var item = parsed[j];
    if (!item.id || !item.tex) continue;
    var orig = qMap[item.id];
    if (!orig) continue;
    if (orig.tex === item.tex) continue;
    diffs.push({
      id: item.id,
      oldTex: orig.tex,
      newTex: item.tex,
      checked: true
    });
  }

  if (diffs.length === 0) {
    showToast(t('No differences found', '\u672a\u53d1\u73b0\u5dee\u5f02'));
    return;
  }

  _dqCurrentDiffs = diffs;
  _dqDiffPage = 0;
  dqRenderDiffPreview();
}

var _dqCurrentDiffs = [];
var _dqDiffPage = 0;
var _dqDiffPageSize = 10;

function dqRenderDiffPreview() {
  var diffs = _dqCurrentDiffs;
  var totalPages = Math.ceil(diffs.length / _dqDiffPageSize);
  var start = _dqDiffPage * _dqDiffPageSize;
  var pageDiffs = diffs.slice(start, start + _dqDiffPageSize);

  var html = '<div class="section-title">' + t('Diff Preview', '\u5dee\u5f02\u9884\u89c8') + ' <span style="color:var(--c-muted);font-size:13px">(' + diffs.length + ' ' + t('changes', '\u53d8\u66f4') + ')</span></div>';

  html += '<div style="max-height:400px;overflow:auto">';
  for (var i = 0; i < pageDiffs.length; i++) {
    var d = pageDiffs[i];
    var idx = start + i;
    html += '<div class="dq-diff-item">';
    html += '<label class="dq-diff-header"><input type="checkbox" data-dq-diff-idx="' + idx + '"' + (d.checked ? ' checked' : '') + '> <strong>' + escapeHtml(d.id) + '</strong></label>';
    html += '<div class="dq-diff">' + dqWordDiff(d.oldTex, d.newTex) + '</div>';
    html += '</div>';
  }
  html += '</div>';

  /* Pagination */
  if (totalPages > 1) {
    html += '<div class="dq-page-nav">';
    if (_dqDiffPage > 0) html += '<button class="btn btn-ghost btn-sm" data-dq-action="diff-page" data-page="' + (_dqDiffPage - 1) + '">&laquo;</button>';
    html += '<span class="dq-page-info">' + (_dqDiffPage + 1) + ' / ' + totalPages + '</span>';
    if (_dqDiffPage < totalPages - 1) html += '<button class="btn btn-ghost btn-sm" data-dq-action="diff-page" data-page="' + (_dqDiffPage + 1) + '">&raquo;</button>';
    html += '</div>';
  }

  html += '<div class="btn-row btn-row--mt16">';
  html += '<button class="btn btn-primary" data-dq-action="apply-diffs">' + t('Apply Selected', '\u5e94\u7528\u5df2\u9009') + ' (' + diffs.filter(function(d) { return d.checked; }).length + ')</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>';
  html += '</div>';

  showModal(html);
}

/* ═══ WORD DIFF ═══ */

function dqWordDiff(a, b) {
  var wordsA = a.split(/(\s+)/);
  var wordsB = b.split(/(\s+)/);

  /* Simple LCS-based diff */
  var m = wordsA.length, n = wordsB.length;
  /* Optimize: if identical just return */
  if (a === b) return escapeHtml(a);

  /* Build LCS table */
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [];
    for (var j = 0; j <= n; j++) {
      if (i === 0 || j === 0) dp[i][j] = 0;
      else if (wordsA[i-1] === wordsB[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }

  /* Backtrack */
  var result = [];
  var ii = m, jj = n;
  while (ii > 0 || jj > 0) {
    if (ii > 0 && jj > 0 && wordsA[ii-1] === wordsB[jj-1]) {
      result.unshift({ type: 'same', text: wordsA[ii-1] });
      ii--; jj--;
    } else if (jj > 0 && (ii === 0 || dp[ii][jj-1] >= dp[ii-1][jj])) {
      result.unshift({ type: 'ins', text: wordsB[jj-1] });
      jj--;
    } else {
      result.unshift({ type: 'del', text: wordsA[ii-1] });
      ii--;
    }
  }

  var html = '';
  for (var k = 0; k < result.length; k++) {
    var r = result[k];
    if (r.type === 'same') html += escapeHtml(r.text);
    else if (r.type === 'del') html += '<del class="dq-del">' + escapeHtml(r.text) + '</del>';
    else html += '<ins class="dq-ins">' + escapeHtml(r.text) + '</ins>';
  }
  return html;
}

/* ═══ APPLY CHANGES ═══ */

function dqApplyDiffs() {
  /* Read checkbox states from DOM */
  var checks = document.querySelectorAll('[data-dq-diff-idx]');
  checks.forEach(function(cb) {
    var idx = parseInt(cb.dataset.dqDiffIdx, 10);
    if (_dqCurrentDiffs[idx]) _dqCurrentDiffs[idx].checked = cb.checked;
  });

  var questions = _dqDataCache[_dqBoard] || [];
  var qMap = {};
  for (var i = 0; i < questions.length; i++) {
    qMap[questions[i].id] = questions[i];
  }

  if (!_dqPending[_dqBoard]) _dqPending[_dqBoard] = {};

  var applied = 0;
  for (var j = 0; j < _dqCurrentDiffs.length; j++) {
    var d = _dqCurrentDiffs[j];
    if (!d.checked) continue;
    var q = qMap[d.id];
    if (!q) continue;
    q.tex = d.newTex;
    _dqPending[_dqBoard][d.id] = d.newTex;
    applied++;
  }

  hideModal();
  showToast(t('Applied ' + applied + ' changes', '\u5df2\u5e94\u7528 ' + applied + ' \u9879\u53d8\u66f4'));

  /* Re-scan and re-render */
  _dqScanResult = dqScan(questions);
  var ct = E('admin-content');
  if (ct) dqRenderDashboard(ct);
}

/* ═══ AUTO-FIX ═══ */

function dqAutoFix(ruleId) {
  var rule = DQ_RULES.find(function(r) { return r.id === ruleId; });
  if (!rule || !rule.autoFix) return;

  var items = _dqScanResult ? _dqScanResult.rules[ruleId] || [] : [];
  if (items.length === 0) return;

  if (!confirm(t('Auto-fix ' + items.length + ' questions for rule "' + ruleId + '"?',
    '\u786e\u8ba4\u81ea\u52a8\u4fee\u590d ' + items.length + ' \u9898\uff08\u89c4\u5219\uff1a' + ruleId + '\uff09\uff1f'))) return;

  var questions = _dqDataCache[_dqBoard] || [];
  var qMap = {};
  for (var i = 0; i < questions.length; i++) {
    qMap[questions[i].id] = questions[i];
  }

  if (!_dqPending[_dqBoard]) _dqPending[_dqBoard] = {};

  var fixed = 0;
  for (var j = 0; j < items.length; j++) {
    var q = qMap[items[j].id];
    if (!q) continue;
    var newTex = rule.autoFix(q.tex);
    if (newTex !== q.tex) {
      q.tex = newTex;
      _dqPending[_dqBoard][q.id] = newTex;
      fixed++;
    }
  }

  hideModal();
  showToast(t('Fixed ' + fixed + ' questions', '\u5df2\u4fee\u590d ' + fixed + ' \u9898'));

  /* Re-scan */
  _dqScanResult = dqScan(questions);
  var ct = E('admin-content');
  if (ct) dqRenderDashboard(ct);
}

/* ═══ EXPORT JSON ═══ */

function dqExportJSON() {
  var questions = _dqDataCache[_dqBoard] || [];
  if (questions.length === 0) { showToast(t('No data', '\u65e0\u6570\u636e')); return; }

  var output;
  var filename;
  var src = _dqSources[_dqBoard];

  if (_dqBoard === 'pastpapers') {
    /* Flat array */
    output = JSON.stringify(questions, null, 2);
    filename = 'pastpapers-cie-fixed-' + new Date().toISOString().slice(0, 10) + '.json';
  } else {
    /* v2.0 format — reuse ppData if available */
    var wrapper = { v: '2.0', paperMeta: {}, questions: questions };
    if (typeof _ppData !== 'undefined' && _ppData[_dqBoard] && _ppData[_dqBoard].paperMeta) {
      wrapper.paperMeta = _ppData[_dqBoard].paperMeta;
    }
    output = JSON.stringify(wrapper, null, 2);
    filename = 'papers-' + _dqBoard + '-fixed-' + new Date().toISOString().slice(0, 10) + '.json';
  }

  var blob = new Blob([output], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('Exported: ', '\u5df2\u5bfc\u51fa\uff1a') + filename);
}

/* ═══ EVENT DELEGATION ═══ */

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-dq-action]');
  if (!btn) return;
  var action = btn.dataset.dqAction;

  if (action === 'board') {
    _dqBoard = btn.dataset.board;
    _dqScanResult = null;
    _dqDataCache[_dqBoard] = null; /* force reload */
    renderDataQuality();
  } else if (action === 'rescan') {
    _dqDataCache[_dqBoard] = null;
    renderDataQuality();
  } else if (action === 'export') {
    dqExportJSON();
  } else if (action === 'view') {
    dqShowIssueList(btn.dataset.rule);
  } else if (action === 'view-page') {
    dqShowIssueList(btn.dataset.rule, parseInt(btn.dataset.page, 10));
  } else if (action === 'copy-ai') {
    dqCopyForAI(btn.dataset.rule);
  } else if (action === 'paste-back') {
    dqShowPasteBack(btn.dataset.rule);
  } else if (action === 'preview-diff') {
    dqPreviewDiff(btn.dataset.rule);
  } else if (action === 'autofix') {
    dqAutoFix(btn.dataset.rule);
  } else if (action === 'apply-diffs') {
    dqApplyDiffs();
  } else if (action === 'diff-page') {
    /* Save checkbox states before page change */
    var checks = document.querySelectorAll('[data-dq-diff-idx]');
    checks.forEach(function(cb) {
      var idx = parseInt(cb.dataset.dqDiffIdx, 10);
      if (_dqCurrentDiffs[idx]) _dqCurrentDiffs[idx].checked = cb.checked;
    });
    _dqDiffPage = parseInt(btn.dataset.page, 10);
    dqRenderDiffPreview();
  }
});
