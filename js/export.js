/* ══════════════════════════════════════════════════════════════
   export.js — Data export (unfamiliar words CSV, progress JSON)
   ══════════════════════════════════════════════════════════════ */

/* Export unfamiliar words as CSV */
function exportUnfamiliar() {
  var all = getAllWords();
  var unfamiliar = all.filter(function(w) { return w.status !== 'mastered'; });

  if (unfamiliar.length === 0) {
    alert('没有不熟的单词！全部已掌握 🎉');
    return;
  }

  var wd = getWordData();
  var lines = ['English,Chinese,Status,Last Review'];
  unfamiliar.forEach(function(w) {
    var d = wd[w.key];
    var lastReview = d && d.lr ? new Date(d.lr).toLocaleDateString() : '-';
    var status = w.status === 'learning' ? '学习中' : '未学';
    lines.push('"' + w.word + '","' + w.def + '","' + status + '","' + lastReview + '"');
  });

  var csv = lines.join('\n');
  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, 'unfamiliar-words.csv');
}

/* Export full progress as JSON */
function exportProgress() {
  var data = {
    exportDate: new Date().toISOString(),
    levels: LEVELS.map(function(lv, i) {
      return { index: i, title: lv.title, best: getBest(i) };
    }),
    words: getAllWords().map(function(w) {
      var d = getWordData()[w.key];
      return {
        word: w.word,
        def: w.def,
        level: w.level,
        status: w.status,
        interval: d ? d.iv : null,
        nextReview: d ? new Date(d.nr).toISOString() : null,
        lastReview: d ? new Date(d.lr).toISOString() : null
      };
    })
  };

  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, 'learning-progress.json');
}

/* Trigger browser download */
function downloadBlob(blob, filename) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* Bind export buttons */
E('btn-export-unfamiliar').addEventListener('click', exportUnfamiliar);
E('btn-export-progress').addEventListener('click', exportProgress);
