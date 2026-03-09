#!/usr/bin/env node
// Apply enrichment data to knowledge-edexcel.json
var fs = require('fs');
var path = require('path');

var dataFile = path.join(__dirname, '..', 'data', 'knowledge-edexcel.json');
var enrichDir = path.join(__dirname, '..', 'data', 'kp-gen', 'enrich-edx');

var data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

var kpMap = {};
data.points.forEach(function(kp) { kpMap[kp.id] = kp; });

var files = fs.readdirSync(enrichDir).filter(function(f) { return f.match(/^enrich-ch\d+\.json$/); }).sort();
var totalQuiz = 0, totalEx = 0;

files.forEach(function(f) {
  var arr = JSON.parse(fs.readFileSync(path.join(enrichDir, f), 'utf8'));
  console.log(f + ': ' + arr.length + ' entries');

  arr.forEach(function(entry) {
    var kp = kpMap[entry.id];
    if (!kp) {
      console.error('  WARN: KP not found: ' + entry.id);
      return;
    }
    if (entry.addQuiz && entry.addQuiz.length > 0) {
      if (!kp.testYourself) kp.testYourself = [];
      entry.addQuiz.forEach(function(q) {
        if (q.q && q.o && q.o.length === 4 && q.a !== undefined) {
          kp.testYourself.push(q);
          totalQuiz++;
        }
      });
    }
    if (entry.addExamples && entry.addExamples.length > 0) {
      if (!kp.examples) kp.examples = [];
      entry.addExamples.forEach(function(ex) {
        if (ex.question && ex.solution) {
          kp.examples.push(ex);
          totalEx++;
        }
      });
    }
  });
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + '\n');
console.log('\nApplied: +' + totalQuiz + ' quiz, +' + totalEx + ' examples');

var q1 = 0, q2 = 0, e1 = 0, e2 = 0;
data.points.forEach(function(kp) {
  var ql = kp.testYourself ? kp.testYourself.length : 0;
  var el = kp.examples ? kp.examples.length : 0;
  if (ql <= 1) q1++; else q2++;
  if (el <= 1) e1++; else e2++;
});
console.log('Quiz: thin=' + q1 + ', rich=' + q2);
console.log('Examples: thin=' + e1 + ', rich=' + e2);
