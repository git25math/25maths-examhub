#!/usr/bin/env node
// Merge generated HHK KP files into knowledge-hhk.json
// Usage: node scripts/merge-kp-hhk.js

var fs = require('fs');
var path = require('path');

var dataFile = path.join(__dirname, '..', 'data', 'knowledge-hhk.json');
var genDir = path.join(__dirname, '..', 'data', 'kp-gen', 'hhk');

// Initialize or load existing
var data;
if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} else {
  data = { version: '1.0', points: [] };
}

var existingIds = {};
data.points.forEach(function(p) { existingIds[p.id] = true; });

var files = fs.readdirSync(genDir).filter(function(f) { return f.match(/^kp-y\d+\.json$/); }).sort();
var added = 0;

files.forEach(function(f) {
  var arr = JSON.parse(fs.readFileSync(path.join(genDir, f), 'utf8'));
  console.log(f + ': ' + arr.length + ' KPs');
  arr.forEach(function(kp) {
    if (existingIds[kp.id]) return;
    if (!kp.id || !kp.section || !kp.title || !kp.explanation) return;
    data.points.push(kp);
    existingIds[kp.id] = true;
    added++;
  });
});

// Sort by section
data.points.sort(function(a, b) {
  var pa = a.section.match(/Y(\d+)\.(\d+)/);
  var pb = b.section.match(/Y(\d+)\.(\d+)/);
  if (!pa || !pb) return 0;
  var ya = parseInt(pa[1]), sa = parseInt(pa[2]);
  var yb = parseInt(pb[1]), sb = parseInt(pb[2]);
  if (ya !== yb) return ya - yb;
  if (sa !== sb) return sa - sb;
  return (a.order || 0) - (b.order || 0);
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n');
console.log('\nMerged: ' + added + ' added');
console.log('Total HHK KPs: ' + data.points.length);
