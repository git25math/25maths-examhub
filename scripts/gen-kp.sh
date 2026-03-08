#!/bin/bash
# Generate KP data for missing CIE 0580 sections using Gemini CLI
# Usage: ./scripts/gen-kp.sh [chapter_id]
# If chapter_id is omitted, generates for all missing chapters

set -euo pipefail
cd "$(dirname "$0")/.."

GEMINI="/opt/homebrew/bin/gemini"
OUTDIR="data/kp-gen"
mkdir -p "$OUTDIR"

# Read one complete KP as example template
TEMPLATE=$(node -e "
var d = require('./data/knowledge-cie.json');
console.log(JSON.stringify(d.points[0], null, 2));
")

# Get missing sections grouped by chapter
MISSING=$(node -e "
var data = require('./data/knowledge-cie.json');
var raw = require('./data/syllabus-cie.json');
var existing = {};
data.points.forEach(function(p) { existing[p.section] = true; });
var result = {};
raw.chapters.forEach(function(ch) {
  var missing = ch.sections.filter(function(s) { return !existing[s.id]; });
  if (missing.length > 0) {
    result[ch.id] = {
      title: ch.title,
      title_zh: ch.title_zh,
      sections: missing.map(function(s) {
        return { id: s.id, title: s.title, title_zh: s.title_zh || '' };
      })
    };
  }
});
console.log(JSON.stringify(result));
")

FILTER_CH="${1:-}"

generate_chapter() {
  local ch_id="$1"
  local ch_data
  ch_data=$(echo "$MISSING" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    var ch = d['$ch_id'];
    if (!ch) { process.exit(1); }
    console.log(JSON.stringify(ch));
  ") || return 0

  local ch_title
  ch_title=$(echo "$ch_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.title);")
  local sections_json
  sections_json=$(echo "$ch_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(d.sections));")

  local outfile="$OUTDIR/kp-${ch_id}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    echo "  [SKIP] $outfile already exists"
    return 0
  fi

  echo "  [GEN] Chapter $ch_id: $ch_title"

  local rawfile="$OUTDIR/kp-${ch_id}.raw"

  cat <<PROMPT_EOF | $GEMINI --sandbox false -y 2>"$OUTDIR/kp-${ch_id}.log" > "$rawfile"
You are a CIE IGCSE 0580 Mathematics curriculum expert. Generate Knowledge Point (KP) data for the following sections of Chapter "${ch_title}".

SECTIONS TO GENERATE:
${sections_json}

RULES:
1. For each section, generate 1-3 KP entries depending on how many distinct sub-topics it contains. Simpler sections need 1 KP, complex sections may need 2-3.
2. Each KP must follow this EXACT JSON schema (example below).
3. The id format is kp-{section}-{order} with zero-padded order, e.g. kp-2.1-01, kp-2.1-02.
4. The explanation must use **bold terms** at the start of paragraphs for key concepts (these get rendered as concept cards in the UI). Separate concepts with double newlines.
5. Use LaTeX math notation with DOUBLE BACKSLASHES in JSON strings: \\\\frac, \\\\sqrt, \\\\times, \\\\pi, \\\\ldots etc. Single backslash sequences like \\d or \\t are INVALID in JSON. Every backslash in LaTeX must be doubled: \\\\, not \\.
6. Each KP must have 1-3 examPatterns, 1-2 worked examples with step-by-step solutions, and 2-3 testYourself MCQs.
7. The MCQ answer index a is 0-based. Always provide exactly 4 options.
8. The tier field should be "both" for core+extended content, "extended" for extended-only content.
9. All text must be bilingual (en + zh). Chinese translations should be natural, not machine-translated.
10. Worked example sources should reference real CIE 0580 paper codes where possible (e.g. "0580/22/M/J/19") or "Adapted from 0580" if generic.
11. The vocabLinks array should contain relevant vocabulary deck slugs from the levels data. Use empty array [] if unsure.
12. CRITICAL: Output MUST be valid JSON. Test every string for proper escaping. No trailing commas. No single-quoted strings.

EXAMPLE KP ENTRY:
${TEMPLATE}

OUTPUT FORMAT:
Return ONLY a valid JSON array of KP objects. No markdown, no code fences, no explanation text before or after.
Start with [ and end with ].
PROMPT_EOF

  # Parse and validate the raw output
  node scripts/fix-kp-json.js "$rawfile" "$outfile" 2>"$OUTDIR/kp-${ch_id}.parse.log"

  if [ $? -eq 0 ]; then
    local count
    count=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$outfile','utf8')).length)")
    echo "  [OK] $count KPs → $outfile"
  else
    echo "  [ERR] Failed to parse output for chapter $ch_id"
    cat "$OUTDIR/kp-${ch_id}.parse.log"
    rm -f "$outfile"
  fi
}

echo "=== KP Generation ==="

if [ -n "$FILTER_CH" ]; then
  generate_chapter "$FILTER_CH"
else
  CHAPTER_IDS=$(echo "$MISSING" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    console.log(Object.keys(d).join(' '));
  ")
  for ch in $CHAPTER_IDS; do
    generate_chapter "$ch"
  done
fi

echo ""
echo "=== Done. Merge with: node scripts/merge-kp.js ==="
