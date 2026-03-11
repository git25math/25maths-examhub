#!/usr/bin/env node
/**
 * merge-25m-units.js — Merge 25m sub-decks into one deck per unit.
 *
 * Before: 173 25m levels (2-7 sub-decks per unit, ~8-10 words each)
 * After:  55 25m levels (1 deck per unit, ~15-65 words each)
 *
 * Also outputs:
 *   data/slug-merge-map.json — old slug → new slug mapping
 *   data/vocab-uid-map.json  — updated with new slugs
 *   data/syllabus-hhk.json   — vocabSlugs arrays merged
 *
 * Usage:
 *   node scripts/merge-25m-units.js
 */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.resolve(__dirname, '..');
var levelsPath = path.join(ROOT, 'js', 'levels.js');
var uidMapPath = path.join(ROOT, 'data', 'vocab-uid-map.json');
var syllabusPath = path.join(ROOT, 'data', 'syllabus-hhk.json');
var slugMapOutPath = path.join(ROOT, 'data', 'slug-merge-map.json');

// ─── 1. Read LEVELS ───
var code = fs.readFileSync(levelsPath, 'utf8');
var sandbox = {};
vm.runInNewContext(code, sandbox);
var LEVELS = sandbox.LEVELS;
if (!Array.isArray(LEVELS)) { console.error('LEVELS not found'); process.exit(1); }

console.log('Input: ' + LEVELS.length + ' levels');

// ─── 2. Separate boards ───
var cieLevels = [];
var edxLevels = [];
var m25Levels = [];
LEVELS.forEach(function(lv) {
  if (lv.board === 'cie') cieLevels.push(lv);
  else if (lv.board === 'edx') edxLevels.push(lv);
  else if (lv.board === '25m') m25Levels.push(lv);
});

console.log('  CIE: ' + cieLevels.length + ', EDX: ' + edxLevels.length + ', 25m: ' + m25Levels.length);

// ─── 3. Group 25m by category + unitNum ───
var unitGroups = [];
var unitMap = {};
m25Levels.forEach(function(lv) {
  var key = lv.category + ':' + (lv.unitNum || 0);
  if (!unitMap[key]) {
    unitMap[key] = { key: key, levels: [] };
    unitGroups.push(unitMap[key]);
  }
  unitMap[key].levels.push(lv);
});

console.log('  25m units: ' + unitGroups.length);

// ─── 4. Merge each unit group ───
var slugMergeMap = {};
var merged25m = [];

unitGroups.forEach(function(ug) {
  var first = ug.levels[0];

  // New slug: remove trailing -N suffix
  var newSlug = first.slug.replace(/-\d+$/, '');
  // New title: remove " (N)" suffix
  var newTitle = first.unitTitle || first.title.replace(/\s*\(\d+\)$/, '');
  var newTitleZh = first.unitTitleZh || first.titleZh.replace(/\s*\(\d+\)$/, '');

  // Build slug merge map
  ug.levels.forEach(function(lv) {
    if (lv.slug !== newSlug) {
      slugMergeMap[lv.slug] = newSlug;
    }
  });

  // Merge vocabulary, deduplicate by id (keep first occurrence)
  var seenIds = {};
  var mergedVocab = [];
  ug.levels.forEach(function(lv) {
    for (var i = 0; i < lv.vocabulary.length; i += 2) {
      var wordEntry = lv.vocabulary[i];
      var defEntry = lv.vocabulary[i + 1];
      if (!wordEntry) continue;
      var vid = wordEntry.id;
      if (seenIds[vid]) continue;
      seenIds[vid] = true;
      mergedVocab.push(wordEntry);
      if (defEntry) mergedVocab.push(defEntry);
    }
  });

  var wordCount = mergedVocab.length / 2;
  var timer = wordCount <= 12 ? 90 : wordCount <= 20 ? 80 : 70;

  merged25m.push({
    board: '25m',
    slug: newSlug,
    category: first.category,
    title: newTitle,
    titleZh: newTitleZh,
    unitNum: first.unitNum,
    unitTitle: first.unitTitle,
    unitTitleZh: first.unitTitleZh,
    timer: timer,
    comboBonus: 2,
    vocabulary: mergedVocab
  });
});

console.log('  Merged 25m: ' + merged25m.length + ' levels');

// ─── 5. Rebuild LEVELS array ───
var newLevels = cieLevels.concat(edxLevels, merged25m);
console.log('Output: ' + newLevels.length + ' levels (was ' + LEVELS.length + ')');

// ─── 6. Write levels.js ───
var header = '/* ==============================================================\n';
header += '   levels.js -- Mathematics Vocabulary\n';
header += '   CIE 0580 (' + cieLevels.length + ' levels) + Edexcel 4MA1 (' + edxLevels.length + ' levels) + 25Maths Y7-11 (' + merged25m.length + ' levels)\n';
header += '   ============================================================== */\n';

var jsLines = [header, 'var LEVELS = ['];

// Helper: serialize a level object as JS (not JSON — use unquoted keys)
function serializeLevel(lv, isLast) {
  var parts = [];
  parts.push("  board: '" + lv.board + "'");
  parts.push("slug: '" + lv.slug + "'");
  parts.push("category: '" + lv.category + "'");
  parts.push("title: " + quote(lv.title));
  parts.push("titleZh: " + quote(lv.titleZh));
  if (lv.unitNum !== undefined) parts.push("unitNum: " + lv.unitNum);
  if (lv.unitTitle) parts.push("unitTitle: " + quote(lv.unitTitle));
  if (lv.unitTitleZh) parts.push("unitTitleZh: " + quote(lv.unitTitleZh));
  parts.push("timer: " + lv.timer);
  parts.push("comboBonus: " + lv.comboBonus);

  // Vocabulary — compact format on one line
  var vocabParts = [];
  for (var i = 0; i < lv.vocabulary.length; i++) {
    var v = lv.vocabulary[i];
    vocabParts.push('{id:' + quote(v.id) + ',type:' + quote(v.type) + ',content:' + quote(v.content) + '}');
  }

  var line = '{\n  ' + parts.join(', ') + ',\n  vocabulary: [\n    ' + vocabParts.join(',    ') + '\n  ]\n}';
  return line + (isLast ? '' : ',');
}

function quote(s) {
  if (s === undefined || s === null) return "''";
  // Use single quotes, escape internal single quotes and backslashes
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

// Write CIE levels
var currentBoard = '';
newLevels.forEach(function(lv, i) {
  // Board section comments
  if (lv.board !== currentBoard) {
    currentBoard = lv.board;
    var count = currentBoard === 'cie' ? cieLevels.length : currentBoard === 'edx' ? edxLevels.length : merged25m.length;
    var boardName = currentBoard === 'cie' ? 'CIE 0580' : currentBoard === 'edx' ? 'Edexcel 4MA1' : '25Maths Y7-Y11';

    // Count words
    var wc = 0;
    newLevels.forEach(function(l) { if (l.board === currentBoard) wc += l.vocabulary.length / 2; });
    jsLines.push('\n/* ═══ ' + boardName + ' (' + count + ' levels, ' + wc + ' words) ═══ */');
  }

  // Year section comments for 25m
  if (lv.board === '25m') {
    var prevLv = i > 0 ? newLevels[i - 1] : null;
    if (!prevLv || prevLv.category !== lv.category) {
      var yearLevels = merged25m.filter(function(l) { return l.category === lv.category; });
      var yearWords = 0;
      yearLevels.forEach(function(l) { yearWords += l.vocabulary.length / 2; });
      jsLines.push('\n/* ═══ ' + lv.category.replace('25m-', '').toUpperCase() + ' (' + yearLevels.length + ' levels, ' + yearWords + ' words) ═══ */');
    }
  }

  var isLast = (i === newLevels.length - 1);
  jsLines.push(serializeLevel(lv, isLast));
});

jsLines.push('];');

fs.writeFileSync(levelsPath, jsLines.join('\n') + '\n', 'utf8');
console.log('\n✓ js/levels.js written (' + newLevels.length + ' levels)');

// ─── 7. Write slug-merge-map.json ───
var mapKeys = Object.keys(slugMergeMap);
fs.writeFileSync(slugMapOutPath, JSON.stringify(slugMergeMap, null, 2) + '\n', 'utf8');
console.log('✓ data/slug-merge-map.json written (' + mapKeys.length + ' mappings)');

// ─── 8. Update vocab-uid-map.json ───
var uidMap = JSON.parse(fs.readFileSync(uidMapPath, 'utf8'));
var newUidMap = {};

// First pass: collect all entries grouped by new slug
var slugVocabIndex = {};  // newSlug → current count
merged25m.forEach(function(lv) {
  var pairs = [];
  for (var i = 0; i < lv.vocabulary.length; i += 2) {
    pairs.push(lv.vocabulary[i].id);
  }
  for (var pi = 0; pi < pairs.length; pi++) {
    newUidMap[lv.slug + ':' + pi] = pairs[pi];
  }
});

// Keep CIE + EDX entries unchanged
Object.keys(uidMap).forEach(function(key) {
  var slug = key.split(':')[0];
  if (slug.indexOf('25m-') !== 0) {
    newUidMap[key] = uidMap[key];
  }
});

fs.writeFileSync(uidMapPath, JSON.stringify(newUidMap, null, 2) + '\n', 'utf8');
console.log('✓ data/vocab-uid-map.json updated (' + Object.keys(newUidMap).length + ' entries)');

// ─── 9. Update syllabus-hhk.json ───
var syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));

syllabus.chapters.forEach(function(ch) {
  ch.sections.forEach(function(sec) {
    if (!sec.vocabSlugs || sec.vocabSlugs.length === 0) return;
    // Map all old slugs to new, deduplicate
    var seen = {};
    var newSlugs = [];
    sec.vocabSlugs.forEach(function(slug) {
      var mapped = slugMergeMap[slug] || slug;
      if (!seen[mapped]) {
        seen[mapped] = true;
        newSlugs.push(mapped);
      }
    });
    sec.vocabSlugs = newSlugs;
  });
});

fs.writeFileSync(syllabusPath, JSON.stringify(syllabus, null, 2) + '\n', 'utf8');
console.log('✓ data/syllabus-hhk.json updated');

console.log('\nDone! Now run: node scripts/split-levels.js');
