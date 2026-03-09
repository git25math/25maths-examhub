#!/usr/bin/env node
// Fix and parse Gemini variant question output into valid JSON
// Usage: node scripts/fix-variant-json.js input.raw output.json
// Reuses the same JSON repair logic as fix-kp-json.js but validates
// question schema (q, o, a, s) instead of KP schema.

var fs = require('fs');
var inFile = process.argv[2];
var outFile = process.argv[3];

if (!inFile || !outFile) {
  console.error('Usage: node fix-variant-json.js input.raw output.json');
  process.exit(1);
}

var input = fs.readFileSync(inFile, 'utf8');

// Strip markdown code fences
input = input.replace(/^```json?\s*/m, '').replace(/```\s*$/m, '');

// Find JSON array
var start = input.indexOf('[');
var end = input.lastIndexOf(']');
if (start < 0 || end < 0) {
  console.error('No JSON array found');
  process.exit(1);
}
var json = input.substring(start, end + 1);

// Pre-fix: Gemini artifacts
json = json.replace(/"\s*\n\s*"\s*\n/g, '",\n');
json = json.replace(/(["\d\]\}])\s*\n\s*"\s*\n\s*([\[\{"\d])/g, '$1,\n$2');
json = json.replace(/"?\n"\n/g, '\n');
json = json.replace(/(["}\]])\s*\n"\n\s*/g, '$1\n');
json = json.replace(/,\s*([}\]])/g, '$1');

// Fix invalid JSON escape sequences inside strings
var fixed = '';
var inString = false;
var i = 0;
while (i < json.length) {
  var ch = json[i];
  if (!inString) {
    if (ch === '"') inString = true;
    fixed += ch;
    i++;
    continue;
  }
  if (ch === '\\') {
    var next = json[i + 1];
    if (next === undefined) { fixed += ch; i++; continue; }
    if ('"\\\/bfnrtu'.indexOf(next) >= 0) {
      fixed += ch + next;
      i += 2;
    } else {
      fixed += '\\\\' + next;
      i += 2;
    }
    continue;
  }
  if (ch === '\n') { fixed += '\\n'; i++; continue; }
  if (ch === '\r') { fixed += '\\r'; i++; continue; }
  if (ch === '"') { inString = false; }
  fixed += ch;
  i++;
}

try {
  var arr = JSON.parse(fixed);
} catch (e) {
  fixed = fixed.replace(/\\ch1qrt/g, '\\\\sqrt');
  fixed = fixed.replace(/\\ch\d+/g, '\\\\');
  try {
    var arr = JSON.parse(fixed);
  } catch (e2) {
    console.error('Parse failed: ' + e2.message);
    var pos = parseInt(e2.message.match(/position (\d+)/)?.[1] || '0');
    if (pos > 0) {
      console.error('Context: ...' + fixed.substring(Math.max(0, pos - 50), pos + 50) + '...');
    }
    process.exit(1);
  }
}

// Validate question schema
var valid = [];
arr.forEach(function(q, idx) {
  if (!q.q || !q.o || !Array.isArray(q.o) || q.o.length !== 4 || q.a === undefined) {
    console.error('WARN: Skipping invalid question at index ' + idx + ' (missing q/o/a)');
    return;
  }
  if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) {
    console.error('WARN: Skipping question at index ' + idx + ' (invalid answer index: ' + q.a + ')');
    return;
  }
  if (!q.s) q.s = '';
  if (!q.d) q.d = 1;
  if (!q.e) q.e = '';
  if (!q.cat) q.cat = '';
  if (!q.topic) q.topic = '';
  valid.push(q);
});

fs.writeFileSync(outFile, JSON.stringify(valid, null, 2));
console.log(valid.length);
