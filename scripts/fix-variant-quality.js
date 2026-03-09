#!/usr/bin/env node
// Fix variant question quality issues across all boards
// Usage: node scripts/fix-variant-quality.js [--dry-run]

var fs = require('fs');
var dryRun = process.argv.includes('--dry-run');

var FILES = [
  'data/questions-cie.json',
  'data/questions-edx.json',
  'data/questions-25m.json'
];

var totalFixes = 0;

FILES.forEach(function(file) {
  if (!fs.existsSync(file)) return;
  var qs = JSON.parse(fs.readFileSync(file, 'utf8'));
  var fixes = [];

  qs.forEach(function(q) {
    if (q.src !== 'variant') return;

    // Fix A: Naked LaTeX in explanation — \\frac etc outside $...$
    if (q.e) {
      var fixed = fixNakedLatex(q.e);
      if (fixed !== q.e) {
        fixes.push({ id: q.id, type: 'NAKED_LATEX', field: 'e', before: q.e, after: fixed });
        if (!dryRun) q.e = fixed;
      }
    }

    // Fix B: Mixed option format — some options have $, others with algebra don't
    if (q.o && hasMixedOptions(q.o)) {
      var fixedOpts = fixMixedOptions(q.o);
      if (fixedOpts) {
        fixes.push({ id: q.id, type: 'MIXED_OPTIONS', field: 'o', before: q.o.slice(), after: fixedOpts });
        if (!dryRun) q.o = fixedOpts;
      }
    }
  });

  if (fixes.length === 0) return;
  totalFixes += fixes.length;

  if (dryRun) {
    console.log('=== ' + file + ': ' + fixes.length + ' fixes ===\n');
    fixes.forEach(function(f) {
      console.log('[' + f.type + '] ' + f.id + ' (' + f.field + ')');
      if (f.field === 'o') {
        console.log('  Before: ' + JSON.stringify(f.before));
        console.log('  After:  ' + JSON.stringify(f.after));
      } else {
        console.log('  Before: ' + f.before);
        console.log('  After:  ' + f.after);
      }
      console.log('');
    });
  } else {
    fs.writeFileSync(file, JSON.stringify(qs, null, 2) + '\n');
    console.log('Applied ' + fixes.length + ' fixes to ' + file);
    fixes.forEach(function(f) {
      console.log('  [' + f.type + '] ' + f.id + ' (' + f.field + ')');
    });
  }
});

console.log('\nTotal: ' + totalFixes + ' fixes' + (dryRun ? ' (dry run)' : ' applied'));

// --- Helpers ---

function fixNakedLatex(text) {
  // Parse text into inside-$ and outside-$ regions
  var result = '';
  var inDollar = false;
  var i = 0;
  var segment = '';

  while (i < text.length) {
    if (text[i] === '$' && (i === 0 || text[i - 1] !== '\\')) {
      if (inDollar) {
        result += segment + '$';
        segment = '';
        inDollar = false;
      } else {
        result += wrapNakedInSegment(segment);
        segment = '';
        result += '$';
        inDollar = true;
      }
      i++;
    } else {
      segment += text[i];
      i++;
    }
  }
  if (inDollar) {
    result += segment;
  } else {
    result += wrapNakedInSegment(segment);
  }
  // Collapse $$ into $ (happens when wrap adds $ before an existing stray $)
  result = result.replace(/\$\$/g, '$');
  return result;
}

function wrapNakedInSegment(seg) {
  // Match both \\cmd (double backslash) and \cmd (single backslash)
  var cmds = /\\\\?(?:frac|sqrt|times|div|pi|theta|alpha|beta|sum|int|lim)\b/;
  if (!cmds.test(seg)) return seg;

  // Match LaTeX expressions with optional braced args, possibly chained with =
  return seg.replace(/(\\\\?(?:frac|sqrt|times|div|pi|theta|alpha|beta)(?:\{[^}]*\})*(?:\s*=\s*\\\\?(?:frac|sqrt|times)(?:\{[^}]*\})*)*)/g, function(match) {
    return '$' + match + '$';
  });
}

// Only detect truly algebraic options (starting with 1-2 char variable = ...)
function hasMixedOptions(opts) {
  var withDollar = 0;
  var algebraic = 0;
  for (var i = 0; i < opts.length; i++) {
    if (opts[i].indexOf('$') >= 0) withDollar++;
    else if (/^[A-Za-z]{1,2}\s*=/.test(opts[i])) algebraic++;
  }
  return withDollar > 0 && algebraic > 0;
}

function fixMixedOptions(opts) {
  var result = [];
  for (var i = 0; i < opts.length; i++) {
    var o = opts[i];
    if (o.indexOf('$') >= 0) {
      result.push(o);
    } else if (/^[A-Za-z]{1,2}\s*=/.test(o)) {
      result.push('$' + o + '$');
    } else {
      result.push(o);
    }
  }
  return result;
}
