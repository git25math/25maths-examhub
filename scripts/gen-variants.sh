#!/bin/bash
# Generate variant questions from existing mother questions
# Usage: ./scripts/gen-variants.sh <board> [section] [count_per_mother]
#   board: cie | edx | 25m
#   section: e.g. 2.1, Y7.1 (optional, default = all thin sections)
#   count_per_mother: variants per mother question (default: 3)

set -euo pipefail
cd "$(dirname "$0")/.."

BOARD="${1:-}"
SECTION="${2:-}"
COUNT="${3:-3}"

if [ -z "$BOARD" ]; then
  echo "Usage: $0 <cie|edx|25m> [section] [count_per_mother]"
  exit 1
fi

GEMINI="/opt/homebrew/bin/gemini"
OUTDIR="data/kp-gen/variants-${BOARD}"
mkdir -p "$OUTDIR"

# Map board to question file and ID prefix
case "$BOARD" in
  cie) QFILE="data/questions-cie.json"; PREFIX="cv"; MIN_Q=15 ;;
  edx) QFILE="data/questions-edx.json"; PREFIX="ev"; MIN_Q=15 ;;
  25m) QFILE="data/questions-25m.json"; PREFIX="hv"; MIN_Q=8 ;;
  *) echo "Unknown board: $BOARD"; exit 1 ;;
esac

# Find thin sections (below MIN_Q) or use specified section
SECTIONS=$(node -e "
var qs = require('./$QFILE');
var secs = {};
qs.forEach(function(q) { secs[q.s] = (secs[q.s]||0)+1; });
var filter = '$SECTION';
if (filter) {
  console.log(filter);
} else {
  Object.keys(secs).sort().forEach(function(s) {
    if (secs[s] < $MIN_Q) console.log(s);
  });
}
")

if [ -z "$SECTIONS" ]; then
  echo "No thin sections found for $BOARD (all >= $MIN_Q questions)"
  exit 0
fi

echo "=== Variant Generation: $BOARD ==="
echo "Sections to process: $(echo $SECTIONS | wc -w | tr -d ' ')"
echo "Variants per mother: $COUNT"
echo ""

for SEC in $SECTIONS; do
  OUTFILE="$OUTDIR/var-${SEC}.json"

  if [ -f "$OUTFILE" ] && [ -s "$OUTFILE" ]; then
    echo "  [SKIP] $OUTFILE already exists"
    continue
  fi

  # Extract mother questions for this section
  MOTHERS=$(node -e "
var qs = require('./$QFILE');
var filtered = qs.filter(function(q) { return q.s === '$SEC'; });
// Pick up to 5 diverse mothers (mix of d=1 and d=2)
var d1 = filtered.filter(function(q) { return q.d === 1; }).slice(0, 3);
var d2 = filtered.filter(function(q) { return q.d === 2; }).slice(0, 2);
var mothers = d1.concat(d2);
if (mothers.length === 0) mothers = filtered.slice(0, 5);
console.log(JSON.stringify(mothers));
  ")

  MOTHER_COUNT=$(echo "$MOTHERS" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length)")

  if [ "$MOTHER_COUNT" -eq 0 ]; then
    echo "  [SKIP] $SEC: no mother questions"
    continue
  fi

  echo "  [GEN] $SEC: $MOTHER_COUNT mothers × $COUNT variants"

  RAWFILE="$OUTDIR/var-${SEC}.raw"

  # Get section topic info
  TOPIC=$(echo "$MOTHERS" | node -e "var d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d[0].topic || '$SEC');")

  cat <<PROMPT_EOF | $GEMINI --sandbox false -y 2>"$OUTDIR/var-${SEC}.log" > "$RAWFILE"
You are a mathematics exam question writer. Generate VARIANT questions based on the mother questions below. Each variant should test the SAME concept and method but with DIFFERENT numbers, contexts, or parameters.

TOPIC: ${TOPIC}
SECTION: ${SEC}

MOTHER QUESTIONS (generate ${COUNT} variants for EACH):
${MOTHERS}

RULES:
1. Each variant MUST follow the EXACT same JSON schema as the mother question.
2. Change the numbers, variable names, or context — but keep the same difficulty level (d field) and solution method.
3. All 4 options must be plausible. The correct answer index (a) must be 0-3.
4. Use DOUBLE BACKSLASHES for LaTeX in JSON: \\\\frac, \\\\sqrt, \\\\times, \\\\pi, etc.
5. The explanation (e) should show the full working for the NEW numbers.
6. Keep the same cat, topic, s, and d fields as the mother question.
7. Omit the "id" field — IDs will be assigned automatically during merge.
8. CRITICAL: Output MUST be valid JSON array. No markdown, no code fences. Start with [ end with ].
9. Ensure ALL LaTeX expressions are properly enclosed in $ delimiters. Every \\\\frac, \\\\sqrt, \\\\times must be inside $...$.
10. All 4 options MUST use CONSISTENT formatting: if any option uses $...$ for math, ALL options must also use $...$.
11. For currency amounts, use \\\\\$ inside LaTeX: e.g., $\\\\\$50$ not \$50.

OUTPUT: A JSON array of variant questions. Each variant is a complete question object.
PROMPT_EOF

  # Fix JSON
  node scripts/fix-variant-json.js "$RAWFILE" "$OUTFILE" 2>"$OUTDIR/var-${SEC}.parse.log"

  if [ $? -eq 0 ]; then
    VCOUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$OUTFILE','utf8')).length)")
    echo "  [OK] $VCOUNT variants → $OUTFILE"
  else
    echo "  [ERR] Parse failed for $SEC"
    cat "$OUTDIR/var-${SEC}.parse.log"
    rm -f "$OUTFILE"
  fi
done

echo ""
echo "=== Done. Merge with: node scripts/merge-variants.js $BOARD ==="
