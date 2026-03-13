#!/usr/bin/env node
/**
 * split-papers-cie.js
 *
 * Reads data/papers-cie.json, deduplicates by paper+qnum,
 * splits into per-paper JSON files under data/papers-cie/,
 * and generates data/papers-index-cie.json.
 */

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var SRC = path.join(ROOT, 'data', 'papers-cie.json');
var OUT_DIR = path.join(ROOT, 'data', 'papers-cie');
var INDEX_FILE = path.join(ROOT, 'data', 'papers-index-cie.json');

/* ---------- 1. Read source ---------- */
var raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
var questions = raw.questions || [];
var paperMeta = raw.paperMeta || {};
var totalRaw = questions.length;

/* ---------- 2. Deduplicate by paper+qnum ---------- */
var seen = {};
var deduped = [];
var dupCount = 0;

for (var i = 0; i < questions.length; i++) {
  var q = questions[i];
  var key = q.paper + '-Q' + q.qnum;
  if (seen[key]) {
    dupCount++;
    continue;
  }
  seen[key] = true;
  deduped.push(q);
}

console.log('Raw total:      ' + totalRaw);
console.log('Duplicates:     ' + dupCount);
console.log('After dedup:    ' + deduped.length);

/* ---------- 3. Group by paper ---------- */
var groups = {};
for (var j = 0; j < deduped.length; j++) {
  var q2 = deduped[j];
  var p = q2.paper;
  if (!groups[p]) groups[p] = [];
  groups[p].push(q2);
}

/* Sort each group by qnum */
var paperKeys = Object.keys(groups).sort();
for (var k = 0; k < paperKeys.length; k++) {
  groups[paperKeys[k]].sort(function (a, b) { return a.qnum - b.qnum; });
}

/* ---------- 4. Parse paper field → year, session, variant ---------- */
function parsePaper(paperKey) {
  // Format: "2025March-Paper12" → year=2025, session="March", variant="12"
  var m = paperKey.match(/^(\d{4})([\w]+)-Paper(\w+)$/);
  if (m) {
    return { year: parseInt(m[1], 10), session: m[2], variant: m[3] };
  }
  // Fallback: try paperMeta
  var meta = paperMeta[paperKey];
  if (meta) {
    return {
      year: meta.year || 0,
      session: meta.session || '',
      variant: meta.paper || ''
    };
  }
  return { year: 0, session: '', variant: '' };
}

/* ---------- 5. Write per-paper files + build index ---------- */
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

var index = [];

for (var ki = 0; ki < paperKeys.length; ki++) {
  var pk = paperKeys[ki];
  var qs = groups[pk];
  var parsed = parsePaper(pk);
  var filename = pk + '.json';
  var filepath = path.join(OUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(qs, null, 0), 'utf8');

  index.push({
    paper: pk,
    year: parsed.year,
    session: parsed.session,
    variant: parsed.variant,
    count: qs.length,
    file: 'papers-cie/' + filename
  });
}

/* ---------- 6. Write index ---------- */
fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');

console.log('Papers split:   ' + paperKeys.length);
console.log('Index written:  ' + INDEX_FILE);
console.log('Output dir:     ' + OUT_DIR);
