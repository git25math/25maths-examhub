#!/usr/bin/env node
// Audit variant question quality across all boards
// Usage: node scripts/audit-variants.js [--json]

var fs = require('fs');
var jsonOut = process.argv.includes('--json');

var FILES = [
  { board: 'CIE', file: 'data/questions-cie.json', prefix: 'cv' },
  { board: 'EDX', file: 'data/questions-edx.json', prefix: 'ev' },
  { board: 'HHK', file: 'data/questions-25m.json', prefix: 'hv' }
];

// Count unescaped $ signs in text
function countDollar(text) {
  var count = 0;
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) count++;
  }
  return count;
}

// Check if text has LaTeX commands outside $...$
function hasNakedLatex(text) {
  var cmds = ['\\\\frac', '\\\\sqrt', '\\\\times', '\\\\div', '\\\\pi', '\\\\theta',
              '\\\\alpha', '\\\\beta', '\\\\sum', '\\\\int', '\\\\lim',
              '\\frac', '\\sqrt', '\\times', '\\div', '\\pi', '\\theta'];
  // Parse into outside-$ segments properly (respecting \$ escapes)
  var outside = [];
  var seg = '';
  var inDollar = false;
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
      if (inDollar) { seg = ''; inDollar = false; }
      else { outside.push(seg); seg = ''; inDollar = true; }
    } else if (!inDollar) {
      seg += text[i];
    }
  }
  if (!inDollar) outside.push(seg);
  for (var p = 0; p < outside.length; p++) {
    for (var c = 0; c < cmds.length; c++) {
      if (outside[p].indexOf(cmds[c]) >= 0) return true;
    }
  }
  return false;
}

// Check if options have mixed formatting (variable assignment without $)
function hasMixedOptions(opts) {
  var withDollar = 0;
  var algebraic = 0;
  for (var i = 0; i < opts.length; i++) {
    if (opts[i].indexOf('$') >= 0) withDollar++;
    else if (/^[A-Za-z]{1,2}\s*=/.test(opts[i])) algebraic++;
  }
  return withDollar > 0 && algebraic > 0;
}

var allIssues = [];

FILES.forEach(function(f) {
  var path = f.file;
  if (!fs.existsSync(path)) return;
  var qs = JSON.parse(fs.readFileSync(path, 'utf8'));
  var variants = qs.filter(function(q) { return q.src === 'variant'; });

  variants.forEach(function(q) {
    var fields = ['q', 'e'].concat(q.o || []);

    // Rule 1: UNBALANCED_LATEX — odd $ count (skip currency \$)
    fields.forEach(function(text, fi) {
      if (!text) return;
      var n = countDollar(text);
      if (n % 2 !== 0) {
        allIssues.push({
          board: f.board, id: q.id, rule: 'UNBALANCED_LATEX', severity: 'ERROR',
          field: fi < 2 ? ['q', 'e'][fi] : 'o[' + (fi - 2) + ']',
          detail: 'Odd $ count: ' + n
        });
      }
    });

    // Rule 2: NAKED_LATEX — LaTeX commands outside $...$
    ['q', 'e'].forEach(function(key) {
      if (q[key] && hasNakedLatex(q[key])) {
        allIssues.push({
          board: f.board, id: q.id, rule: 'NAKED_LATEX', severity: 'ERROR',
          field: key, detail: 'LaTeX command outside $...$'
        });
      }
    });

    // Rule 3: MIXED_OPTION_FORMAT
    if (q.o && hasMixedOptions(q.o)) {
      allIssues.push({
        board: f.board, id: q.id, rule: 'MIXED_OPTION_FORMAT', severity: 'ERROR',
        field: 'o', detail: 'Some options have $, others with algebra do not'
      });
    }

    // Rule 4: DUPLICATE_OPTIONS
    if (q.o) {
      var seen = {};
      for (var i = 0; i < q.o.length; i++) {
        if (seen[q.o[i]]) {
          allIssues.push({
            board: f.board, id: q.id, rule: 'DUPLICATE_OPTIONS', severity: 'ERROR',
            field: 'o', detail: 'Duplicate: "' + q.o[i] + '"'
          });
          break;
        }
        seen[q.o[i]] = true;
      }
    }

    // Rule 5: ALL_SHORT_OPTIONS
    if (q.o && q.o.every(function(o) { return o.length < 3; })) {
      allIssues.push({
        board: f.board, id: q.id, rule: 'ALL_SHORT_OPTIONS', severity: 'WARN',
        field: 'o', detail: 'All options < 3 chars'
      });
    }

    // Rule 6: EMPTY_EXPLANATION
    if (!q.e || q.e.trim() === '') {
      allIssues.push({
        board: f.board, id: q.id, rule: 'EMPTY_EXPLANATION', severity: 'WARN',
        field: 'e', detail: 'Empty explanation'
      });
    }
  });
});

if (jsonOut) {
  console.log(JSON.stringify(allIssues, null, 2));
} else {
  // Group by board then severity
  var boards = {};
  allIssues.forEach(function(issue) {
    if (!boards[issue.board]) boards[issue.board] = [];
    boards[issue.board].push(issue);
  });

  var errorCount = 0;
  var warnCount = 0;

  Object.keys(boards).sort().forEach(function(board) {
    console.log('\n=== ' + board + ' ===');
    boards[board].forEach(function(issue) {
      var prefix = issue.severity === 'ERROR' ? '  [ERROR]' : '  [WARN] ';
      console.log(prefix + ' ' + issue.id + ' ' + issue.rule + ' (' + issue.field + '): ' + issue.detail);
      if (issue.severity === 'ERROR') errorCount++;
      else warnCount++;
    });
  });

  console.log('\n--- Summary ---');
  console.log('ERROR: ' + errorCount);
  console.log('WARN:  ' + warnCount);
  console.log('TOTAL: ' + allIssues.length);
  process.exit(errorCount > 0 ? 1 : 0);
}
