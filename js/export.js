/* ══════════════════════════════════════════════════════════════
   export.js — Import system (4 formats) + Export (CSV/JSON/Markdown)
   ══════════════════════════════════════════════════════════════ */

/* ═══ IMPORT PANEL ═══ */
var importParsed = null;

var _importDelegated = false;

function renderImport() {
  var html = '';

  html += '<div class="section-title">\ud83d\udce5 ' + t('Import / Export', '\u5bfc\u5165 / \u5bfc\u51fa') + '</div>';

  /* Import section */
  html += '<div class="import-section">';
  html += '<div class="fw-700 import-desc">' + t('Import Vocabulary', '\u5bfc\u5165\u8bcd\u6c47') + '</div>';

  /* File upload */
  html += '<div class="import-drop" id="import-drop" role="button" tabindex="0" onclick="E(\'import-file\').click()">';
  html += '<div class="import-drop-icon">\ud83d\udcc1</div>';
  html += '<div class="import-drop-text">' + t('Click or drop file (CSV, JSON, TXT, Anki TSV)', '\u70b9\u51fb\u6216\u62d6\u653e\u6587\u4ef6 (CSV, JSON, TXT, Anki TSV)') + '</div>';
  html += '</div>';
  html += '<input type="file" id="import-file" accept=".csv,.json,.txt,.md,.tsv" class="d-none">';

  /* Text paste */
  html += '<div class="fw-600 text-sub import-sub">' + t('Or paste text:', '\u6216\u8005\u7c98\u8d34\u6587\u672c:') + '</div>';
  html += '<textarea class="import-textarea" id="import-text" placeholder="English, \u4e2d\u6587\nVariable, \u53d8\u91cf\nConstant, \u5e38\u91cf"></textarea>';

  html += '<div class="mt-8">';
  html += '<button class="btn btn-primary btn-sm" onclick="parseImport()">' + t('Parse', '\u89e3\u6790') + '</button>';
  html += '</div>';

  /* Preview area */
  html += '<div id="import-preview-area"></div>';
  html += '</div>';

  /* Export section */
  html += '<hr class="import-sep">';
  html += '<div class="fw-700 mb-12 import-desc">' + t('Export', '\u5bfc\u51fa') + '</div>';
  html += '<div class="export-btns">';
  html += '<button class="btn btn-secondary btn-sm" onclick="exportUnfamiliar()">\ud83d\udcc4 ' + t('Unfamiliar CSV', '\u4e0d\u719f\u5355\u8bcd CSV') + '</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="exportProgress()">\ud83d\udcca ' + t('Progress JSON', '\u5b66\u4e60\u8bb0\u5f55 JSON') + '</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="exportMarkdown()">\ud83d\udcdd Markdown ' + t('Table', '\u8868\u683c') + '</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="exportAnki()">\ud83d\udce6 ' + t('Anki TSV', 'Anki \u5361\u7247') + '</button>';
  html += '</div>';

  E('panel-import').innerHTML = html;

  /* Bind file upload (once only) */
  if (_importDelegated) return;
  _importDelegated = true;
  setTimeout(function() {
    var fileInput = E('import-file');
    if (fileInput) {
      fileInput.addEventListener('change', function(e) {
        var f = e.target.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          E('import-text').value = ev.target.result;
          parseImport();
        };
        reader.readAsText(f);
      });
    }

    /* Drag and drop */
    var drop = E('import-drop');
    if (drop) {
      drop.addEventListener('dragover', function(e) { e.preventDefault(); drop.classList.add('dragover'); });
      drop.addEventListener('dragleave', function() { drop.classList.remove('dragover'); });
      drop.addEventListener('drop', function(e) {
        e.preventDefault();
        drop.classList.remove('dragover');
        var f = e.dataTransfer.files[0];
        if (f) {
          var reader = new FileReader();
          reader.onload = function(ev) {
            E('import-text').value = ev.target.result;
            parseImport();
          };
          reader.readAsText(f);
        }
      });
    }
  }, 50);
}

/* ═══ PARSE IMPORT ═══ */
function parseImport() {
  var text = E('import-text').value.trim();
  if (!text) { showToast(t('Please enter or paste content', '\u8bf7\u8f93\u5165\u6216\u7c98\u8d34\u5185\u5bb9')); return; }

  var pairs = [];
  var format = detectFormat(text);

  if (format === 'json') {
    pairs = parseJSON(text);
  } else if (format === 'markdown') {
    pairs = parseMarkdown(text);
  } else if (format === 'csv') {
    pairs = parseCSV(text);
  } else {
    pairs = parseFreeText(text);
  }

  if (pairs.length === 0) {
    showToast(t('No vocabulary found, check format', '\u672a\u89e3\u6790\u5230\u8bcd\u6c47\uff0c\u8bf7\u68c0\u67e5\u683c\u5f0f'));
    return;
  }

  importParsed = pairs;
  showToast(t('Parsed ' + pairs.length + ' words (' + format + ')', '\u89e3\u6790\u5230 ' + pairs.length + ' \u4e2a\u8bcd\u6c47 (' + format + ')'));

  /* Show preview */
  var html = '<div class="import-preview">';
  html += '<table><thead><tr><th>#</th><th>English</th><th>\u4e2d\u6587</th></tr></thead><tbody>';
  pairs.forEach(function(p, i) {
    html += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(p.word) + '</td><td>' + escapeHtml(p.def) + '</td></tr>';
  });
  html += '</tbody></table></div>';

  html += '<div class="mt-12 flex items-center gap-8">';
  html += '<input type="text" id="import-name" class="auth-input flex-1" placeholder="' + t('Deck name (e.g. Custom Vocab)', '\u5361\u7ec4\u540d\u79f0 (\u4f8b: \u81ea\u5b9a\u4e49\u8bcd\u6c47)') + '">';
  html += '<button class="btn btn-success btn-sm" onclick="confirmImport()">' + t('Confirm Import', '\u786e\u8ba4\u5bfc\u5165') + '</button>';
  html += '</div>';

  E('import-preview-area').innerHTML = html;
}

/* Format detection */
function detectFormat(text) {
  text = text.trim();
  if (text.charAt(0) === '{' || text.charAt(0) === '[') return 'json';
  if (text.indexOf('|') >= 0 && text.indexOf('---') >= 0) return 'markdown';
  if (text.indexOf(',') >= 0 || text.indexOf('\t') >= 0) return 'csv';
  return 'free';
}

/* JSON parser */
function parseJSON(text) {
  try {
    var data = JSON.parse(text);
    if (!Array.isArray(data)) data = data.words || data.vocabulary || data.items || [data];
    return data.map(function(d) {
      return {
        word: d.word || d.english || d.en || d.term || d.term_en || '',
        def: d.def || d.chinese || d.zh || d.definition || d.term_zh || ''
      };
    }).filter(function(p) { return p.word && p.def; });
  } catch (e) { return []; }
}

/* Markdown table parser */
function parseMarkdown(text) {
  var lines = text.split('\n').filter(function(l) { return l.trim() && l.indexOf('---') < 0; });
  var pairs = [];
  lines.forEach(function(line) {
    var cols = line.split('|').map(function(c) { return c.trim(); }).filter(function(c) { return c; });
    if (cols.length >= 2) {
      var w = cols[0], d = cols[1];
      /* Skip header rows */
      if (w.toLowerCase() === 'english' || w.toLowerCase() === 'word' || w === '#') return;
      if (w && d) pairs.push({ word: w, def: d });
    }
  });
  return pairs;
}

/* CSV/TSV parser */
function parseCSV(text) {
  var sep = text.indexOf('\t') >= 0 ? '\t' : ',';
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  var pairs = [];
  var headerSkipped = false;

  lines.forEach(function(line) {
    var cols = line.split(sep).map(function(c) { return c.trim().replace(/^["']|["']$/g, ''); });
    if (cols.length < 2) return;

    /* Skip header */
    if (!headerSkipped) {
      var first = cols[0].toLowerCase();
      if (first === 'english' || first === 'word' || first === 'term' || first === '#') {
        headerSkipped = true;
        return;
      }
      headerSkipped = true;
    }

    if (cols[0] && cols[1]) pairs.push({ word: cols[0], def: cols[1] });
  });
  return pairs;
}

/* Free text parser (line by line: "word - definition" or "word: definition") */
function parseFreeText(text) {
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  var pairs = [];
  lines.forEach(function(line) {
    var parts;
    if (line.indexOf(' - ') >= 0) parts = line.split(' - ');
    else if (line.indexOf(': ') >= 0) parts = line.split(': ');
    else if (line.indexOf('\t') >= 0) parts = line.split('\t');
    else if (line.indexOf(',') >= 0) parts = line.split(',');
    else return;

    if (parts.length >= 2) {
      var w = parts[0].trim(), d = parts.slice(1).join(' ').trim();
      if (w && d) pairs.push({ word: w, def: d });
    }
  });
  return pairs;
}

/* Confirm import */
function confirmImport() {
  if (!importParsed || importParsed.length === 0) return;

  var name = (E('import-name') ? E('import-name').value.trim() : '') || t('Custom Vocab', '\u81ea\u5b9a\u4e49\u8bcd\u6c47');

  /* Build vocabulary in LEVELS format */
  var vocab = [];
  importParsed.forEach(function(p, i) {
    vocab.push({ id: i + 1, type: 'word', content: p.word });
    vocab.push({ id: i + 1, type: 'def', content: p.def });
  });

  var level = {
    title: name,
    timer: Math.max(60, importParsed.length * 10),
    comboBonus: 3,
    vocabulary: vocab
  };

  /* Add to LEVELS and persist */
  LEVELS.push(level);
  saveCustomLevel(level);

  importParsed = null;
  E('import-preview-area').innerHTML = '';
  E('import-text').value = '';

  showToast(t('Imported! Added "' + name + '"', '\u5bfc\u5165\u6210\u529f\uff01\u5df2\u6dfb\u52a0 "' + name + '"'));
  updateSidebar();
  renderImport();
}

/* ═══ EXPORTS ═══ */
function exportUnfamiliar() {
  var all = getAllWords();
  var unfamiliar = all.filter(function(w) { return w.status !== 'mastered'; });

  if (unfamiliar.length === 0) {
    showToast(t('No unfamiliar words! All mastered', '\u6ca1\u6709\u4e0d\u719f\u7684\u5355\u8bcd\uff01\u5168\u90e8\u5df2\u638c\u63e1'));
    return;
  }

  var wd = getWordData();
  var lines = ['English,Chinese,Status,Last Review'];
  unfamiliar.forEach(function(w) {
    var d = wd[w.key];
    var lastReview = d && d.lr ? new Date(d.lr).toLocaleDateString() : '-';
    var status = w.status === 'learning' ? '\u5b66\u4e60\u4e2d' : '\u672a\u5b66';
    lines.push('"' + w.word + '","' + w.def + '","' + status + '","' + lastReview + '"');
  });

  downloadBlob(new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), 'unfamiliar-words.csv');
  showToast('\u5df2\u5bfc\u51fa CSV');
}

async function exportProgress() {
  /* Ensure all board data is included in export */
  try { await ensureAllBoardsLoaded(); } catch(e) {}
  var data = {
    exportDate: new Date().toISOString(),
    levels: LEVELS.map(function(lv, i) {
      return { index: i, title: lv.title, best: getBest(i) };
    }),
    words: (function() { var wd = getWordData(); return getAllWords().map(function(w) {
      var d = wd[w.key];
      return {
        word: w.word, def: w.def, level: w.level,
        status: w.status, flmStatus: w.fs,
        ok: w.ok, fail: w.fail,
        round: d ? (d.fr || 0) : 0,
        lastReview: d ? new Date(d.lr).toISOString() : null
      };
    }); })()
  };

  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' }), 'learning-progress.json');
  showToast('\u5df2\u5bfc\u51fa JSON');
}

function exportMarkdown() {
  var all = getAllWords();
  var lines = ['| English | \u4e2d\u6587 | Status |', '|---------|------|--------|'];
  all.forEach(function(w) {
    var st = w.fs === 'mastered' ? '\u2705 Mastered' : w.fs === 'uncertain' ? '\ud83d\udfe1 Uncertain' : w.fs === 'learning' ? '\ud83d\udd34 Learning' : '\u26aa New';
    lines.push('| ' + w.word + ' | ' + w.def + ' | ' + st + ' |');
  });

  downloadBlob(new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' }), 'vocabulary.md');
  showToast('\u5df2\u5bfc\u51fa Markdown');
}

function exportAnki() {
  var all = getAllWords();
  if (all.length === 0) {
    showToast(t('No vocabulary to export', '\u6ca1\u6709\u53ef\u5bfc\u51fa\u7684\u8bcd\u6c47'));
    return;
  }
  /* Anki import format: front<TAB>back<TAB>tags (one card per line) */
  var lines = [];
  all.forEach(function(w) {
    var front = w.word;
    var back = w.def;
    var tag = w.level.replace(/\s+/g, '_');
    lines.push(front + '\t' + back + '\t' + tag);
  });
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8;' }), '25maths-keywords-anki.txt');
  showToast(t('Anki file exported — import as TSV in Anki', 'Anki \u6587\u4ef6\u5df2\u5bfc\u51fa \u2014 \u5728 Anki \u4e2d\u4ee5 TSV \u5bfc\u5165'));
}

function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
