#!/bin/bash
# Generate KP data for HHK (Harrow Haikou) Y7-Y11 sections using Gemini CLI
# Usage: ./scripts/gen-kp-hhk.sh [year]  e.g. ./scripts/gen-kp-hhk.sh 7

set -euo pipefail
cd "$(dirname "$0")/.."

GEMINI="/opt/homebrew/bin/gemini"
OUTDIR="data/kp-gen/hhk"
mkdir -p "$OUTDIR"

# Read one CIE KP as example template
TEMPLATE=$(node -e "
var d = require('./data/knowledge-cie.json');
console.log(JSON.stringify(d.points[0], null, 2));
")

# Get all HHK sections grouped by year
SECTIONS=$(node -e "
var raw = require('./data/syllabus-hhk.json');
var result = {};
raw.chapters.forEach(function(ch) {
  var year = ch.id.replace('ch', '');
  result[year] = {
    title: ch.title,
    title_zh: ch.title_zh || '',
    sections: ch.sections.map(function(s) {
      return { id: s.id, title: s.title, title_zh: s.title_zh || '' };
    })
  };
});
console.log(JSON.stringify(result));
")

FILTER_Y="${1:-}"

generate_year() {
  local year="$1"
  local year_data
  year_data=$(echo "$SECTIONS" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    if (!d['$year']) { process.exit(1); }
    console.log(JSON.stringify(d['$year']));
  ") || return 0

  local year_title
  year_title=$(echo "$year_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.title);")
  local sections_json
  sections_json=$(echo "$year_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(d.sections));")

  local outfile="$OUTDIR/kp-y${year}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    echo "  [SKIP] $outfile already exists"
    return 0
  fi

  echo "  [GEN] Year $year: $year_title"

  local rawfile="$OUTDIR/kp-y${year}.raw"

  cat <<PROMPT_EOF | $GEMINI --sandbox false -y 2>"$OUTDIR/kp-y${year}.log" > "$rawfile"
You are a mathematics curriculum expert for Harrow Haikou International School's Upper School Mathematics programme (Years 7-11). Generate Knowledge Point (KP) data for Year ${year} sections.

SECTIONS TO GENERATE:
${sections_json}

RULES:
1. For each section, generate 1-2 KP entries. Most sections need 1 KP, complex sections may need 2.
2. Each KP must follow the JSON schema shown in the example below.
3. The id format is kp-{section}-{order} with zero-padded order, e.g. kp-Y7.1-01, kp-Y8.3-02.
4. The explanation must use **bold terms** at the start of paragraphs for key concepts (rendered as concept cards). Separate concepts with double newlines.
5. Use LaTeX math with DOUBLE BACKSLASHES in JSON: \\\\frac, \\\\sqrt, \\\\times, \\\\pi, \\\\ldots etc.
6. Each KP must have 1-2 examPatterns, 2 worked examples with step-by-step solutions, and 2 testYourself MCQs.
7. MCQ answer index a is 0-based. Always provide exactly 4 options.
8. The tier field should be "both".
9. All text must be bilingual (en + zh). Chinese translations should be natural.
10. Content level should match Year ${year} students (age $((year + 5))-$((year + 6))).
11. Worked example sources: use "Year ${year} Assessment" or "Adapted from Y${year} curriculum".
12. vocabLinks: use empty array [].
13. CRITICAL: Output MUST be valid JSON. No trailing commas. Every LaTeX backslash must be doubled.

EXAMPLE KP ENTRY (from CIE — adapt format for HHK):
${TEMPLATE}

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown, no code fences. Start with [ end with ].
PROMPT_EOF

  node scripts/fix-kp-json.js "$rawfile" "$outfile" 2>"$OUTDIR/kp-y${year}.parse.log"

  if [ $? -eq 0 ]; then
    local count
    count=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$outfile','utf8')).length)")
    echo "  [OK] $count KPs → $outfile"
  else
    echo "  [ERR] Failed to parse output for Year $year"
    cat "$OUTDIR/kp-y${year}.parse.log"
    rm -f "$outfile"
  fi
}

echo "=== HHK KP Generation ==="

if [ -n "$FILTER_Y" ]; then
  generate_year "$FILTER_Y"
else
  for y in 7 8 9 10 11; do
    generate_year "$y"
  done
fi

echo ""
echo "=== Done. Merge with: node scripts/merge-kp-hhk.js ==="
