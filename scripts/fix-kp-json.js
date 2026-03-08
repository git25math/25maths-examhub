#!/usr/bin/env node
// Fix and parse Gemini KP output into valid JSON
// Usage: node scripts/fix-kp-json.js input.raw output.json

var fs = require('fs');
var inFile = process.argv[2];
var outFile = process.argv[3];

if (!inFile || !outFile) {
  console.error('Usage: node fix-kp-json.js input.raw output.json');
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

// Pre-fix: remove stray lone quotes on their own line (Gemini artifact)
json = json.replace(/"\s*\n\s*"\s*\n/g, '",\n');
json = json.replace(/(["\d\]\}])\s*\n\s*"\s*\n\s*([\[\{"\d])/g, '$1,\n$2');
// Remove lone " on its own line between ] and , or similar
json = json.replace(/"?\n"\n/g, '\n');
// Fix: string ending with " then lone " on next line then ]
json = json.replace(/(["}\]])\s*\n"\n\s*/g, '$1\n');

// Fix trailing commas before ] or }
json = json.replace(/,\s*([}\]])/g, '$1');

// Fix invalid JSON escape sequences inside strings
// Process character by character to handle string context properly
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

  // Inside a string
  if (ch === '\\') {
    var next = json[i + 1];
    if (next === undefined) {
      fixed += ch;
      i++;
      continue;
    }
    // Valid JSON escape sequences: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    if ('"\\\/bfnrtu'.indexOf(next) >= 0) {
      fixed += ch + next;
      i += 2;
    } else {
      // Invalid escape — double the backslash
      fixed += '\\\\' + next;
      i += 2;
    }
    continue;
  }

  // Literal newline inside string — replace with \n
  if (ch === '\n') {
    fixed += '\\n';
    i++;
    continue;
  }
  if (ch === '\r') {
    fixed += '\\r';
    i++;
    continue;
  }

  if (ch === '"') {
    inString = false;
  }
  fixed += ch;
  i++;
}

try {
  var arr = JSON.parse(fixed);
} catch (e) {
  // Try a more aggressive fix: replace common corruption patterns
  fixed = fixed.replace(/\\ch1qrt/g, '\\\\sqrt');
  fixed = fixed.replace(/\\ch\d+/g, '\\\\');
  try {
    var arr = JSON.parse(fixed);
  } catch (e2) {
    console.error('Parse failed after fixes: ' + e2.message);
    // Output the problematic area
    var pos = parseInt(e2.message.match(/position (\d+)/)?.[1] || '0');
    if (pos > 0) {
      console.error('Context: ...' + fixed.substring(Math.max(0, pos - 50), pos + 50) + '...');
    }
    process.exit(1);
  }
}

// Validate required fields
var valid = [];
arr.forEach(function(kp, idx) {
  if (!kp.id || !kp.section || !kp.title || !kp.explanation) {
    console.error('WARN: Skipping invalid KP at index ' + idx + ' (missing required field)');
    return;
  }
  // Ensure all required sub-fields
  if (!kp.title_zh) kp.title_zh = '';
  if (!kp.examPatterns) kp.examPatterns = [];
  if (!kp.examples) kp.examples = [];
  if (!kp.testYourself) kp.testYourself = [];
  if (!kp.vocabLinks) kp.vocabLinks = [];
  if (!kp.tier) kp.tier = 'both';
  if (!kp.order) kp.order = 1;
  valid.push(kp);
});

fs.writeFileSync(outFile, JSON.stringify(valid, null, 2));
console.log(valid.length);
