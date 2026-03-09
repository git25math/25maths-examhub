#!/usr/bin/env node
// Merge generated Edexcel KP files into knowledge-edexcel.json
var fs = require('fs');
var path = require('path');

var dataFile = path.join(__dirname, '..', 'data', 'knowledge-edexcel.json');
var genDir = path.join(__dirname, '..', 'data', 'kp-gen', 'edx');

var data;
if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} else {
  data = { version: '1.0', points: [] };
}

var existingIds = {};
data.points.forEach(function(p) { existingIds[p.id] = true; });

var files = fs.readdirSync(genDir).filter(function(f) { return f.match(/^kp-ch\d+\.json$/); }).sort();
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
  var pa = a.section.match(/E(\d+)\.(\d+)/);
  var pb = b.section.match(/E(\d+)\.(\d+)/);
  if (!pa || !pb) return 0;
  var ca = parseInt(pa[1]), sa = parseInt(pa[2]);
  var cb = parseInt(pb[1]), sb = parseInt(pb[2]);
  if (ca !== cb) return ca - cb;
  if (sa !== sb) return sa - sb;
  return (a.order || 0) - (b.order || 0);
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n');
console.log('\nMerged: ' + added + ' added');
console.log('Total Edexcel KPs: ' + data.points.length);
