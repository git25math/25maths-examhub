#!/usr/bin/env node
// Merge generated KP files into knowledge-cie.json
// Usage: node scripts/merge-kp.js

var fs = require('fs');
var path = require('path');

var dataFile = path.join(__dirname, '..', 'data', 'knowledge-cie.json');
var genDir = path.join(__dirname, '..', 'data', 'kp-gen');

var data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
var existingIds = {};
data.points.forEach(function(p) { existingIds[p.id] = true; });

var files = fs.readdirSync(genDir).filter(function(f) { return f.match(/^kp-(ch\d+|patch)\.json$/); }).sort();
var added = 0;
var skipped = 0;

files.forEach(function(f) {
  var arr = JSON.parse(fs.readFileSync(path.join(genDir, f), 'utf8'));
  console.log(f + ': ' + arr.length + ' KPs');
  arr.forEach(function(kp) {
    if (existingIds[kp.id]) {
      skipped++;
      return;
    }
    // Validate required fields
    if (!kp.id || !kp.section || !kp.title || !kp.explanation) {
      console.error('  SKIP invalid KP: ' + (kp.id || 'no id'));
      skipped++;
      return;
    }
    data.points.push(kp);
    existingIds[kp.id] = true;
    added++;
  });
});

// Sort by section then order
data.points.sort(function(a, b) {
  var sa = a.section.split('.').map(Number);
  var sb = b.section.split('.').map(Number);
  if (sa[0] !== sb[0]) return sa[0] - sb[0];
  if (sa[1] !== sb[1]) return sa[1] - sb[1];
  return (a.order || 0) - (b.order || 0);
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n');
console.log('\nMerged: ' + added + ' added, ' + skipped + ' skipped');
console.log('Total KPs: ' + data.points.length);
