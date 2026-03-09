#!/usr/bin/env node
// Merge generated variant questions into questions-{board}.json
// Usage: node scripts/merge-variants.js <cie|edx|25m>

var fs = require('fs');
var path = require('path');

var board = process.argv[2];
if (!board) { console.error('Usage: node merge-variants.js <cie|edx|25m>'); process.exit(1); }

var qFile = path.join(__dirname, '..', 'data', 'questions-' + board + '.json');
var varDir = path.join(__dirname, '..', 'data', 'kp-gen', 'variants-' + board);

var questions = JSON.parse(fs.readFileSync(qFile, 'utf8'));

// Build existing ID set
var existingIds = {};
questions.forEach(function(q) { existingIds[q.id] = true; });

// Find max numeric ID for dedup
var maxNum = 0;
questions.forEach(function(q) {
  var m = q.id.match(/\d+/);
  if (m) { var n = parseInt(m[0]); if (n > maxNum) maxNum = n; }
});

var files;
try {
  files = fs.readdirSync(varDir).filter(function(f) { return f.match(/^var-.+\.json$/); }).sort();
} catch(e) {
  console.error('No variants directory: ' + varDir);
  process.exit(1);
}

var added = 0, skipped = 0, invalid = 0;
var prefixMap = { cie: 'cv', edx: 'ev', '25m': 'hv' };
var prefix = prefixMap[board] || 'v';

files.forEach(function(f) {
  var arr = JSON.parse(fs.readFileSync(path.join(varDir, f), 'utf8'));
  var fileAdded = 0;

  arr.forEach(function(v) {
    // Validate required fields
    if (!v.q || !v.o || !Array.isArray(v.o) || v.o.length !== 4 || v.a === undefined || !v.s) {
      invalid++;
      return;
    }

    // Ensure unique ID
    if (!v.id || existingIds[v.id]) {
      maxNum++;
      v.id = prefix + String(maxNum).padStart(4, '0');
    }

    // Mark as variant
    v.src = 'variant';

    existingIds[v.id] = true;
    questions.push(v);
    added++;
    fileAdded++;
  });

  console.log(f + ': +' + fileAdded + ' variants');
});

// Sort by section
questions.sort(function(a, b) {
  if (a.s < b.s) return -1;
  if (a.s > b.s) return 1;
  return 0;
});

fs.writeFileSync(qFile, JSON.stringify(questions, null, 2) + '\n');
console.log('\nMerged: +' + added + ' variants, ' + skipped + ' skipped, ' + invalid + ' invalid');
console.log('Total questions: ' + questions.length);

// Section coverage stats
var secs = {};
questions.forEach(function(q) { secs[q.s] = (secs[q.s] || 0) + 1; });
var secKeys = Object.keys(secs).sort();
var minSec = secKeys.reduce(function(min, s) { return secs[s] < secs[min] ? s : min; }, secKeys[0]);
console.log('Sections: ' + secKeys.length + ', min=' + minSec + ' (' + secs[minSec] + 'Q), avg=' + Math.round(questions.length / secKeys.length) + 'Q');
