#!/usr/bin/env node
// Fix and parse Gemini enrichment output into valid JSON
// Usage: node scripts/fix-enrich-json.js input.raw output.json

var fs = require('fs');
var inFile = process.argv[2];
var outFile = process.argv[3];

if (!inFile || !outFile) {
  console.error('Usage: node fix-enrich-json.js input.raw output.json');
  process.exit(1);
}

var input = fs.readFileSync(inFile, 'utf8');
if (!input.trim()) {
  console.error('Empty input file');
  process.exit(1);
}

// Strip markdown code fences
input = input.replace(/^```json?\s*/m, '').replace(/```\s*$/m, '');

var start = input.indexOf('[');
var end = input.lastIndexOf(']');
if (start < 0 || end < 0) {
  console.error('No JSON array found');
  process.exit(1);
}
var json = input.substring(start, end + 1);

// Pre-fixes
json = json.replace(/"?\n"\n/g, '\n');
json = json.replace(/(["}\]])\s*\n"\n\s*/g, '$1\n');
json = json.replace(/,\s*([}\]])/g, '$1');

// Fix escapes inside strings
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
  if (ch === '"') inString = false;
  fixed += ch;
  i++;
}

var arr = JSON.parse(fixed);

// Validate enrichment schema: need id + (addQuiz or addExamples)
var valid = [];
arr.forEach(function(entry, idx) {
  if (!entry.id) {
    console.error('WARN: Skipping index ' + idx + ' (no id)');
    return;
  }
  if ((!entry.addQuiz || entry.addQuiz.length === 0) &&
      (!entry.addExamples || entry.addExamples.length === 0)) {
    console.error('WARN: Skipping ' + entry.id + ' (no addQuiz or addExamples)');
    return;
  }
  valid.push(entry);
});

fs.writeFileSync(outFile, JSON.stringify(valid, null, 2));
console.log(valid.length);
