#!/usr/bin/env node
/**
 * merge-question-vocab.js
 * Merges per-section Gemini outputs into final question-vocab mapping files.
 * Also integrates new words into vocabulary files.
 *
 * Usage:
 *   node scripts/merge-question-vocab.js --board cie
 *   node scripts/merge-question-vocab.js --board edx
 *   node scripts/merge-question-vocab.js --board cie --dry-run
 */

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');

/* ═══ PARSE ARGS ═══ */
var args = process.argv.slice(2);
var board = 'cie';
var dryRun = false;

for (var i = 0; i < args.length; i++) {
  if (args[i] === '--board' && args[i + 1]) { board = args[++i]; }
  else if (args[i] === '--dry-run') { dryRun = true; }
}

/* ═══ MAKE UID (mirrors config.js:525) ═══ */
function makeUid(word) {
  var uid = word.toLowerCase().trim();
  uid = uid.replace(/[^a-z0-9\s-]/g, '');
  uid = uid.replace(/\s+/g, '-');
  uid = uid.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return uid;
}

/* ═══ LOAD DATA ═══ */
var vocabFile = path.join(ROOT, 'data', 'vocabulary-' + board + '.json');
var rawDir = path.join(ROOT, 'data', 'qvocab-raw', board);
var outFile = path.join(ROOT, 'data', 'question-vocab-' + board + '.json');

if (!fs.existsSync(vocabFile)) { console.error('Vocab file not found: ' + vocabFile); process.exit(1); }
if (!fs.existsSync(rawDir)) { console.error('Raw dir not found: ' + rawDir); process.exit(1); }

var vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));

/* Build existing UID set */
var existingUids = {};

if (board === 'cie') {
  Object.keys(vocab).forEach(function(section) {
    vocab[section].forEach(function(v) {
      existingUids[makeUid(v.word)] = section;
    });
  });
} else if (board === 'edx') {
  var words = vocab.words || {};
  Object.keys(words).forEach(function(uid) {
    existingUids[uid] = true;
  });
}

console.log('Board: ' + board);
console.log('Existing vocab UIDs: ' + Object.keys(existingUids).length);

/* ═══ READ RAW FILES ═══ */
var files = fs.readdirSync(rawDir).filter(function(f) { return f.endsWith('.json'); });
console.log('Raw section files: ' + files.length);

var finalMapping = {};
var allNewWords = {};
var stats = { totalMappings: 0, totalNewWords: 0, sectionsProcessed: 0 };
var vocabPerQuestion = [];

files.forEach(function(f) {
  var sectionId = f.replace('.json', '');
  var data = JSON.parse(fs.readFileSync(path.join(rawDir, f), 'utf8'));

  /* Merge mappings */
  var mapping = data.mapping || {};
  for (var qid in mapping) {
    var uids = mapping[qid];
    if (Array.isArray(uids) && uids.length > 0) {
      finalMapping[qid] = uids;
      stats.totalMappings++;
      vocabPerQuestion.push(uids.length);
    }
  }

  /* Collect new words */
  var newWords = data.newWords || [];
  newWords.forEach(function(nw) {
    if (!nw.uid || !nw.word) return;
    var uid = nw.uid;
    /* Skip if already exists in vocab or already collected */
    if (existingUids[uid] || allNewWords[uid]) return;
    allNewWords[uid] = { word: nw.word, def: nw.def || '', section: sectionId };
    stats.totalNewWords++;
  });

  stats.sectionsProcessed++;
});

/* ═══ STATS ═══ */
vocabPerQuestion.sort(function(a, b) { return a - b; });
var avgVocab = vocabPerQuestion.length > 0
  ? (vocabPerQuestion.reduce(function(s, v) { return s + v; }, 0) / vocabPerQuestion.length).toFixed(1)
  : 0;
var medianVocab = vocabPerQuestion.length > 0
  ? vocabPerQuestion[Math.floor(vocabPerQuestion.length / 2)]
  : 0;

console.log('\n═══ MERGE STATS ═══');
console.log('Sections processed: ' + stats.sectionsProcessed);
console.log('Total mappings: ' + stats.totalMappings);
console.log('New words discovered: ' + stats.totalNewWords);
console.log('Vocab per question — avg: ' + avgVocab + ', median: ' + medianVocab);

if (dryRun) {
  console.log('\n(dry-run — no files written)');
  if (stats.totalNewWords > 0) {
    console.log('\nNew words preview:');
    Object.keys(allNewWords).slice(0, 20).forEach(function(uid) {
      var nw = allNewWords[uid];
      console.log('  ' + uid + ': ' + nw.word + ' (' + nw.def + ') [section ' + nw.section + ']');
    });
  }
  process.exit(0);
}

/* ═══ ADD NEW WORDS TO VOCAB FILE ═══ */
if (stats.totalNewWords > 0) {
  console.log('\nAdding ' + stats.totalNewWords + ' new words to vocabulary...');

  if (board === 'cie') {
    Object.keys(allNewWords).forEach(function(uid) {
      var nw = allNewWords[uid];
      var section = nw.section;
      if (!vocab[section]) vocab[section] = [];
      /* Find max id in section */
      var maxId = -1;
      vocab[section].forEach(function(v) {
        var vid = parseInt(v.id, 10);
        if (vid > maxId) maxId = vid;
      });
      vocab[section].push({
        word: nw.word,
        def: nw.def,
        id: String(maxId + 1)
      });
    });
  } else if (board === 'edx') {
    if (!vocab.words) vocab.words = {};
    Object.keys(allNewWords).forEach(function(uid) {
      var nw = allNewWords[uid];
      vocab.words[uid] = { word: nw.word, def: nw.def };
    });
  }

  fs.writeFileSync(vocabFile, JSON.stringify(vocab, null, 2), 'utf8');
  console.log('  Updated: ' + vocabFile);
}

/* ═══ WRITE FINAL MAPPING ═══ */
fs.writeFileSync(outFile, JSON.stringify(finalMapping, null, 2), 'utf8');
console.log('Written: ' + outFile + ' (' + (fs.statSync(outFile).size / 1024).toFixed(0) + ' KB)');

console.log('\nDone!');
