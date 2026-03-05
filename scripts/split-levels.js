#!/usr/bin/env node
/**
 * split-levels.js — Split levels.js into 3 JSON files by board.
 *
 * Output:
 *   data/levels-cie.json  (CIE 0580, indices 0-49)
 *   data/levels-edx.json  (Edexcel 4MA1, indices 50-90)
 *   data/levels-25m.json  (25Maths Y7-11, indices 91-263)
 *
 * Usage:
 *   node scripts/split-levels.js
 */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.resolve(__dirname, '..');
var levelsPath = path.join(ROOT, 'js', 'levels.js');
var dataDir = path.join(ROOT, 'data');

// Read and eval levels.js in a sandbox
var code = fs.readFileSync(levelsPath, 'utf8');
var sandbox = {};
vm.runInNewContext(code, sandbox);

var LEVELS = sandbox.LEVELS;
if (!Array.isArray(LEVELS)) {
  console.error('Error: LEVELS not found or not an array');
  process.exit(1);
}

console.log('Total levels: ' + LEVELS.length);

// Split by board — order must be CIE, EDX, 25m to preserve indices
var cie = [], edx = [], m25 = [];
LEVELS.forEach(function(lv) {
  if (lv.board === 'cie') cie.push(lv);
  else if (lv.board === 'edx') edx.push(lv);
  else if (lv.board === '25m') m25.push(lv);
  else console.warn('Unknown board:', lv.board, lv.slug);
});

console.log('CIE: ' + cie.length + ' levels (indices 0-' + (cie.length - 1) + ')');
console.log('EDX: ' + edx.length + ' levels (indices ' + cie.length + '-' + (cie.length + edx.length - 1) + ')');
console.log('25m: ' + m25.length + ' levels (indices ' + (cie.length + edx.length) + '-' + (LEVELS.length - 1) + ')');

// Verify index continuity
if (cie.length + edx.length + m25.length !== LEVELS.length) {
  console.error('Error: Split count mismatch! ' + (cie.length + edx.length + m25.length) + ' vs ' + LEVELS.length);
  process.exit(1);
}

// Write JSON files
fs.mkdirSync(dataDir, { recursive: true });

var files = [
  { name: 'levels-cie.json', data: cie },
  { name: 'levels-edx.json', data: edx },
  { name: 'levels-25m.json', data: m25 }
];

files.forEach(function(f) {
  var outPath = path.join(dataDir, f.name);
  var json = JSON.stringify(f.data);
  fs.writeFileSync(outPath, json, 'utf8');
  var sizeKB = (Buffer.byteLength(json, 'utf8') / 1024).toFixed(1);
  console.log('  -> ' + f.name + ' (' + sizeKB + ' KB)');
});

console.log('\nDone! JSON files written to data/');
