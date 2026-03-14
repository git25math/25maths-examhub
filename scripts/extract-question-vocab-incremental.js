#!/usr/bin/env node
/**
 * extract-question-vocab-incremental.js
 * Incremental per-question vocabulary extraction — only processes questions
 * missing from the existing question-vocab mapping.
 *
 * Usage:
 *   node scripts/extract-question-vocab-incremental.js --board cie
 *   node scripts/extract-question-vocab-incremental.js --board cie --dry-run
 */

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var ROOT = path.resolve(__dirname, '..');
var GEMINI = '/opt/homebrew/bin/gemini';
var BATCH_SIZE = 50;

/* ═══ PARSE ARGS ═══ */
var args = process.argv.slice(2);
var board = 'cie';
var dryRun = false;

for (var i = 0; i < args.length; i++) {
  if (args[i] === '--board' && args[i + 1]) { board = args[++i]; }
  else if (args[i] === '--dry-run') { dryRun = true; }
}

/* ═══ LOAD DATA ═══ */
var papersFile = path.join(ROOT, 'data', 'papers-' + board + '.json');
var vocabFile = path.join(ROOT, 'data', 'vocabulary-' + board + '.json');
var mappingFile = path.join(ROOT, 'data', 'question-vocab-' + board + '.json');
var rawDir = path.join(ROOT, 'data', 'qvocab-raw', board);

var papers = JSON.parse(fs.readFileSync(papersFile, 'utf8'));
var vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
var existingMapping = fs.existsSync(mappingFile) ? JSON.parse(fs.readFileSync(mappingFile, 'utf8')) : {};

var questions = papers.questions || [];

/* ═══ FIND MISSING QUESTIONS ═══ */
var missing = questions.filter(function(q) {
  return q.s && !existingMapping[q.id];
});

console.log('Board: ' + board);
console.log('Total questions: ' + questions.length);
console.log('Already mapped: ' + Object.keys(existingMapping).length);
console.log('Missing (to process): ' + missing.length);

if (missing.length === 0) {
  console.log('Nothing to do!');
  process.exit(0);
}

/* ═══ GROUP BY SECTION ═══ */
var sectionGroups = {};
missing.forEach(function(q) {
  if (!sectionGroups[q.s]) sectionGroups[q.s] = [];
  sectionGroups[q.s].push(q);
});

var sections = Object.keys(sectionGroups).sort(function(a, b) {
  var pa = a.split('.').map(Number);
  var pb = b.split('.').map(Number);
  return (pa[0] - pb[0]) || ((pa[1] || 0) - (pb[1] || 0));
});

console.log('\nSections with missing questions: ' + sections.length);
sections.forEach(function(s) {
  console.log('  ' + s + ': ' + sectionGroups[s].length + ' missing');
});

if (dryRun) {
  console.log('\n(dry-run — no Gemini calls)');
  process.exit(0);
}

/* ═══ MAKE UID ═══ */
function makeUid(word) {
  var uid = word.toLowerCase().trim();
  uid = uid.replace(/[^a-z0-9\s-]/g, '');
  uid = uid.replace(/\s+/g, '-');
  uid = uid.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return uid;
}

/* ═══ GET SECTION VOCAB ═══ */
function getSectionVocab(sectionId) {
  var arr = vocab[sectionId];
  if (!arr) return [];
  return arr.map(function(v) {
    return { uid: makeUid(v.word), word: v.word, def: v.def };
  });
}

/* ═══ BUILD PROMPT ═══ */
function buildPrompt(sectionId, existingVocab, batch) {
  var qList = batch.map(function(q) {
    var tex = q.tex || '';
    if (tex.length > 800) tex = tex.substring(0, 800) + '...';
    return { id: q.id, tex: tex };
  });

  return '你是数学教育专家。分析以下数学考试题目，为每道题提取核心数学术语。\n\n' +
    '## 已有词汇库（section ' + sectionId + '）\n' +
    JSON.stringify(existingVocab, null, 0) + '\n\n' +
    '## 题目列表\n' +
    JSON.stringify(qList, null, 0) + '\n\n' +
    '## 规则\n' +
    '1. 为每道题列出直接相关的数学术语 UID（来自已有词汇库）\n' +
    '2. 如果题目涉及的数学术语不在已有库中，创建新词条 {word(英文), def(中文), uid(kebab-case)}\n' +
    '3. 每题通常 2-6 个词汇，简单题 1-2 个，复杂多步题 5-8 个\n' +
    '4. 只包含理解/解答该题必需的术语，不要列出整个 section 的词汇\n' +
    '5. uid 格式：英文小写+连字符，如 "natural-number", "quadratic-equation"\n\n' +
    '## 输出格式（纯 JSON）\n' +
    '{\n  "mapping": { "questionId": ["uid1", "uid2", ...] },\n  "newWords": [{ "word": "...", "def": "...", "uid": "..." }]\n}';
}

/* ═══ CALL GEMINI ═══ */
function callGemini(prompt) {
  var tmpFile = path.join(ROOT, 'data', 'qvocab-raw', '.prompt-tmp.txt');
  fs.writeFileSync(tmpFile, prompt, 'utf8');

  try {
    var result = child_process.execSync(
      GEMINI + ' --sandbox false -y -o json < ' + JSON.stringify(tmpFile),
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 180000, shell: true }
    );

    var wrapper = JSON.parse(result);
    var inner = wrapper.response || wrapper;
    if (typeof inner === 'string') {
      inner = inner.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
      inner = JSON.parse(inner);
    }
    if (inner.mapping) return inner;
    if (inner.text) {
      var t = inner.text.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
      return JSON.parse(t);
    }
    return inner;
  } catch (e) {
    try {
      var raw = (e.stdout || '') + (e.stderr || '');
      var jsonMatch = raw.match(/\{[\s\S]*"mapping"[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e2) { /* ignore */ }
    console.error('  Gemini call failed:', e.message);
    return null;
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

/* ═══ PROCESS ═══ */
var totalProcessed = 0;
var totalFailed = 0;

sections.forEach(function(sectionId, si) {
  var qs = sectionGroups[sectionId];
  var existingVocab = getSectionVocab(sectionId);
  var rawFile = path.join(rawDir, sectionId + '.json');

  /* Load existing raw data for this section */
  var sectionResult = fs.existsSync(rawFile)
    ? JSON.parse(fs.readFileSync(rawFile, 'utf8'))
    : { mapping: {}, newWords: [] };

  if (!sectionResult.mapping) sectionResult.mapping = {};
  if (!sectionResult.newWords) sectionResult.newWords = [];

  var seenNewUids = {};
  sectionResult.newWords.forEach(function(nw) { seenNewUids[nw.uid] = true; });

  console.log('\n[' + (si + 1) + '/' + sections.length + '] Section ' + sectionId + ' (' + qs.length + ' missing, ' + existingVocab.length + ' vocab)');

  /* Process in batches */
  for (var bi = 0; bi < qs.length; bi += BATCH_SIZE) {
    var batch = qs.slice(bi, bi + BATCH_SIZE);
    var batchNum = Math.floor(bi / BATCH_SIZE) + 1;
    var totalBatches = Math.ceil(qs.length / BATCH_SIZE);

    if (totalBatches > 1) {
      console.log('  Batch ' + batchNum + '/' + totalBatches + ' (' + batch.length + ' questions)');
    }

    var prompt = buildPrompt(sectionId, existingVocab, batch);
    var result = callGemini(prompt);

    if (!result || !result.mapping) {
      console.error('  Failed to get valid result for batch ' + batchNum);
      totalFailed += batch.length;
      continue;
    }

    /* Merge mapping */
    for (var qid in result.mapping) {
      sectionResult.mapping[qid] = result.mapping[qid];
    }

    /* Merge new words */
    if (result.newWords && result.newWords.length) {
      result.newWords.forEach(function(nw) {
        if (!nw.uid || !nw.word) return;
        if (seenNewUids[nw.uid]) return;
        seenNewUids[nw.uid] = true;
        sectionResult.newWords.push(nw);
      });
      result.newWords.forEach(function(nw) {
        existingVocab.push({ uid: nw.uid, word: nw.word, def: nw.def || '' });
      });
    }

    totalProcessed += batch.length;
  }

  /* Write updated section file */
  fs.writeFileSync(rawFile, JSON.stringify(sectionResult, null, 2), 'utf8');
  console.log('  → ' + Object.keys(sectionResult.mapping).length + ' total mappings');
});

console.log('\n═══ INCREMENTAL EXTRACTION COMPLETE ═══');
console.log('Processed: ' + totalProcessed + ', Failed: ' + totalFailed);
console.log('\nNow run: node scripts/merge-question-vocab.js --board ' + board);
