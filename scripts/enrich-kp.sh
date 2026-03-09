#!/bin/bash
# Enrich thin KPs with additional quiz questions and worked examples
# Usage: ./scripts/enrich-kp.sh [chapter_number]

set -euo pipefail
cd "$(dirname "$0")/.."

GEMINI="/opt/homebrew/bin/gemini"
OUTDIR="data/kp-gen/enrich"
mkdir -p "$OUTDIR"

FILTER_CH="${1:-}"

# Get thin KPs grouped by chapter
THIN_KPS=$(node -e "
var data = require('./data/knowledge-cie.json');
var result = {};
data.points.forEach(function(kp) {
  var qLen = kp.testYourself ? kp.testYourself.length : 0;
  var eLen = kp.examples ? kp.examples.length : 0;
  if (qLen >= 2 && eLen >= 2) return; // already rich enough

  var ch = kp.section.split('.')[0];
  if (!result[ch]) result[ch] = [];
  result[ch].push({
    id: kp.id,
    section: kp.section,
    title: kp.title,
    title_zh: kp.title_zh || '',
    needQuiz: Math.max(0, 2 - qLen),
    needExamples: Math.max(0, 2 - eLen),
    existingPatterns: (kp.examPatterns || []).map(function(p) { return p.id; }),
    tier: kp.tier || 'both'
  });
});
console.log(JSON.stringify(result));
")

enrich_chapter() {
  local ch="$1"
  local ch_data
  ch_data=$(echo "$THIN_KPS" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    if (!d['$ch'] || d['$ch'].length === 0) process.exit(1);
    console.log(JSON.stringify(d['$ch']));
  " 2>/dev/null) || return 0

  local count
  count=$(echo "$ch_data" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length)")

  local outfile="$OUTDIR/enrich-ch${ch}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    echo "  [SKIP] $outfile already exists"
    return 0
  fi

  echo "  [ENRICH] Chapter $ch: $count thin KPs"

  local rawfile="$OUTDIR/enrich-ch${ch}.raw"

  cat <<PROMPT_EOF | $GEMINI --sandbox false -y 2>"$OUTDIR/enrich-ch${ch}.log" > "$rawfile"
You are a CIE IGCSE 0580 Mathematics expert. I need you to generate ADDITIONAL quiz questions and worked examples for existing Knowledge Points.

For each KP below, generate the requested number of additional items. The KP already has some content — you are ADDING more, not replacing.

KPs NEEDING ENRICHMENT:
${ch_data}

FOR EACH KP, GENERATE:
- Additional testYourself MCQ items (if needQuiz > 0): Each with q, q_zh, o (4 options), a (0-based answer), e, e_zh
- Additional worked examples (if needExamples > 0): Each with patternId (use one from existingPatterns), question, question_zh, solution, solution_zh, source

RULES:
1. Use DOUBLE BACKSLASHES for LaTeX in JSON: \\\\frac, \\\\sqrt, \\\\times, \\\\pi, etc.
2. MCQ questions should test DIFFERENT aspects from what might already exist — vary the difficulty and angle.
3. Worked examples should show different problem types or approaches than what already exists.
4. Sources for examples: use realistic CIE 0580 paper codes (e.g. "0580/42/O/N/20") or "Adapted from 0580".
5. Chinese translations should be natural.

OUTPUT FORMAT:
Return a JSON array where each element has:
{
  "id": "kp-X.Y-0Z",
  "addQuiz": [ ... additional testYourself items ... ],
  "addExamples": [ ... additional example items ... ]
}

ONLY output valid JSON. No markdown fences. Start with [ end with ].
PROMPT_EOF

  node scripts/fix-enrich-json.js "$rawfile" "$outfile" 2>"$OUTDIR/enrich-ch${ch}.parse.log"

  if [ $? -eq 0 ]; then
    local ok
    ok=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$outfile','utf8')).length)")
    echo "  [OK] $ok enrichment entries → $outfile"
  else
    echo "  [ERR] Parse failed for chapter $ch"
    cat "$OUTDIR/enrich-ch${ch}.parse.log"
    rm -f "$outfile"
  fi
}

echo "=== KP Enrichment ==="

if [ -n "$FILTER_CH" ]; then
  enrich_chapter "$FILTER_CH"
else
  CHAPTERS=$(echo "$THIN_KPS" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(Object.keys(d).sort(function(a,b){return a-b}).join(' '));
  ")
  for ch in $CHAPTERS; do
    enrich_chapter "$ch"
  done
fi

echo ""
echo "=== Done. Apply with: node scripts/apply-enrich.js ==="
