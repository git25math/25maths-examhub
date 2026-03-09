#!/usr/bin/env node
// Remove invalid vocabLinks slugs that don't exist in LEVELS
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

// Extract valid slugs from levels.js
var src = fs.readFileSync(path.join(root, 'js/levels.js'), 'utf8');
var validSlugs = {};
var re = /slug:\s*['"]([^'"]+)['"]/g;
var m;
while (m = re.exec(src)) { validSlugs[m[1]] = true; }

// Also build section → vocabSlugs from each syllabus
function getSyllabusSlugs(sylFile) {
  var syl = JSON.parse(fs.readFileSync(path.join(root, sylFile), 'utf8'));
  var map = {};
  syl.chapters.forEach(function(ch) {
    ch.sections.forEach(function(s) {
      map[s.id] = (s.vocabSlugs || []).filter(function(slug) { return validSlugs[slug]; });
    });
  });
  return map;
}

var boards = [
  { name: 'CIE', kpFile: 'data/knowledge-cie.json', sylFile: 'data/syllabus-cie.json' },
  { name: 'HHK', kpFile: 'data/knowledge-hhk.json', sylFile: 'data/syllabus-hhk.json' },
  { name: 'EDX', kpFile: 'data/knowledge-edexcel.json', sylFile: 'data/syllabus-edexcel.json' }
];

boards.forEach(function(b) {
  var kpPath = path.join(root, b.kpFile);
  var kp = JSON.parse(fs.readFileSync(kpPath, 'utf8'));
  var sylSlugs = getSyllabusSlugs(b.sylFile);
  var removed = 0, kept = 0;

  kp.points.forEach(function(p) {
    if (!p.vocabLinks || p.vocabLinks.length === 0) return;
    var valid = sylSlugs[p.section] || [];
    // Keep only slugs that exist in LEVELS
    var filtered = p.vocabLinks.filter(function(s) { return validSlugs[s]; });
    // If filtered is empty but syllabus has slugs, use syllabus
    if (filtered.length === 0 && valid.length > 0) filtered = valid;
    removed += p.vocabLinks.length - filtered.length;
    kept += filtered.length;
    p.vocabLinks = filtered;
  });

  fs.writeFileSync(kpPath, JSON.stringify(kp, null, 2) + '\n');
  console.log(b.name + ': kept ' + kept + ', removed ' + removed + ' invalid slugs');
});
