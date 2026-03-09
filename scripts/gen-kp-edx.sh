#!/bin/bash
# Generate KP data for Edexcel 4MA1 sections using Gemini CLI
# Usage: ./scripts/gen-kp-edx.sh [chapter_number]

set -euo pipefail
cd "$(dirname "$0")/.."

GEMINI="/opt/homebrew/bin/gemini"
OUTDIR="data/kp-gen/edx"
mkdir -p "$OUTDIR"

TEMPLATE=$(node -e "
var d = require('./data/knowledge-cie.json');
console.log(JSON.stringify(d.points[0], null, 2));
")

SECTIONS=$(node -e "
var raw = require('./data/syllabus-edexcel.json');
var result = {};
raw.chapters.forEach(function(ch) {
  var num = ch.id.replace('ch', '');
  result[num] = {
    title: ch.title,
    title_zh: ch.title_zh || '',
    sections: ch.sections.map(function(s) {
      return { id: s.id, title: s.title, title_zh: s.title_zh || '' };
    })
  };
});
console.log(JSON.stringify(result));
")

FILTER_CH="${1:-}"

generate_chapter() {
  local ch="$1"
  local ch_data
  ch_data=$(echo "$SECTIONS" | node -e "
    var d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    if (!d['$ch']) { process.exit(1); }
    console.log(JSON.stringify(d['$ch']));
  ") || return 0

  local ch_title
  ch_title=$(echo "$ch_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.title);")
  local sections_json
  sections_json=$(echo "$ch_data" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(d.sections));")

  local outfile="$OUTDIR/kp-ch${ch}.json"
  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    echo "  [SKIP] $outfile already exists"
    return 0
  fi

  echo "  [GEN] Chapter $ch: $ch_title"
  local rawfile="$OUTDIR/kp-ch${ch}.raw"

  cat <<PROMPT_EOF | $GEMINI --sandbox false -y 2>"$OUTDIR/kp-ch${ch}.log" > "$rawfile"
You are an Edexcel IGCSE Mathematics (4MA1) curriculum expert. Generate Knowledge Point (KP) data for the following sections of Chapter "${ch_title}".

SECTIONS TO GENERATE:
${sections_json}

RULES:
1. For each section, generate 1-3 KP entries depending on complexity.
2. Each KP must follow the EXACT JSON schema shown in the example below.
3. The id format is kp-{section}-{order} with zero-padded order, e.g. kp-E1.1-01, kp-E2.3-02.
4. The explanation must use **bold terms** at the start of paragraphs for key concepts. Separate concepts with double newlines.
5. Use LaTeX math with DOUBLE BACKSLASHES in JSON: \\\\frac, \\\\sqrt, \\\\times, \\\\pi, \\\\ldots etc.
6. Each KP must have 1-2 examPatterns, 2 worked examples with step-by-step solutions, and 2 testYourself MCQs.
7. MCQ answer index a is 0-based. Always provide exactly 4 options.
8. tier: "both" for all content, "higher" for Higher-only content.
9. All text must be bilingual (en + zh). Chinese translations should be natural.
10. Example sources: use Edexcel 4MA1 paper codes (e.g. "4MA1/1H/Jan/2020") or "Adapted from 4MA1".
11. vocabLinks: use empty array [].
12. CRITICAL: Output MUST be valid JSON. No trailing commas. Every LaTeX backslash doubled.

EXAMPLE KP ENTRY (from CIE — adapt for Edexcel):
${TEMPLATE}

OUTPUT FORMAT:
Return ONLY a valid JSON array. No markdown, no code fences. Start with [ end with ].
PROMPT_EOF

  node scripts/fix-kp-json.js "$rawfile" "$outfile" 2>"$OUTDIR/kp-ch${ch}.parse.log"

  if [ $? -eq 0 ]; then
    local count
    count=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$outfile','utf8')).length)")
    echo "  [OK] $count KPs -> $outfile"
  else
    echo "  [ERR] Parse failed for chapter $ch"
    cat "$OUTDIR/kp-ch${ch}.parse.log"
    rm -f "$outfile"
  fi
}

echo "=== Edexcel KP Generation ==="

if [ -n "$FILTER_CH" ]; then
  generate_chapter "$FILTER_CH"
else
  for ch in 1 2 3 4 5 6; do
    generate_chapter "$ch"
  done
fi

echo ""
echo "=== Done. Merge with: node scripts/merge-kp-edx.js ==="
