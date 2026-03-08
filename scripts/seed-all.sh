#!/bin/bash
# Generate combined SQL from all seed scripts
# Usage: bash scripts/seed-all.sh > scripts/seed-combined.sql
set -e
cd "$(dirname "$0")/.."

echo "-- Combined seed: CIE worked examples & knowledge points"
echo "-- Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "BEGIN;"
node scripts/seed-section-content.js | grep "^INSERT"
node scripts/seed-ch2.js | grep "^INSERT"
node scripts/seed-ch3.js | grep "^INSERT"
node scripts/seed-ch4.js | grep "^INSERT"
node scripts/seed-ch5-6.js | grep "^INSERT"
node scripts/seed-ch7-9.js | grep "^INSERT"
echo "COMMIT;"
echo "-- Done"
