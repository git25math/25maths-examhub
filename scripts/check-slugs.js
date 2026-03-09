var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');
var src = fs.readFileSync(path.join(root, 'js/levels.js'), 'utf8');
var slugs = {};
var re = /slug:\s*['"]([^'"]+)['"]/g;
var m;
while (m = re.exec(src)) { slugs[m[1]] = true; }
console.log('Total LEVELS slugs:', Object.keys(slugs).length);

var boards = ['cie', 'hhk', 'edexcel'];
boards.forEach(function(b) {
  var kp = JSON.parse(fs.readFileSync(path.join(root, 'data/knowledge-' + b + '.json'), 'utf8'));
  var good = 0, bad = {};
  kp.points.forEach(function(p) {
    (p.vocabLinks || []).forEach(function(s) {
      if (slugs[s]) { good++; }
      else {
        if (bad[s] === undefined) bad[s] = [];
        bad[s].push(p.id);
      }
    });
  });
  var badKeys = Object.keys(bad);
  console.log('\n=== ' + b.toUpperCase() + ' ===');
  console.log('Valid slugs:', good, '| Invalid:', badKeys.length);
  badKeys.forEach(function(s) { console.log('  MISSING: "' + s + '" <- ' + bad[s].join(', ')); });
});
