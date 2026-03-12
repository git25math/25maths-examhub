#!/bin/bash
# Backup ExamHub database via Edge Function
# Usage: ./scripts/backup-db.sh
# Requires: SA_EMAIL and SA_PASS environment variables, or interactive login

set -e

API="https://jjjigohjvmyewasmmmyf.supabase.co"
APIKEY="sb_publishable_EDe6c9jFS4_PL451oYMYzg_86KRbHRZ"
BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"

# Login
echo "Logging in as super admin..."
if [ -z "$SA_EMAIL" ]; then
  read -p "Email: " SA_EMAIL
fi
if [ -z "$SA_PASS" ]; then
  read -s -p "Password: " SA_PASS
  echo
fi

TOKEN=$(curl -s -X POST "$API/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: $APIKEY" \
  -d "{\"email\":\"$SA_EMAIL\",\"password\":\"$SA_PASS\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

# Call backup function
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTFILE="$BACKUP_DIR/backup-$TIMESTAMP.json"

echo "Downloading backup..."
curl -s -X POST "$API/functions/v1/backup-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $APIKEY" \
  -d '{}' > "$OUTFILE"

# Validate
TABLES=$(python3 -c "import json; d=json.load(open('$OUTFILE')); print(sum(1 for k,v in d.items() if isinstance(v,dict) and 'count' in v))" 2>/dev/null || echo 0)

if [ "$TABLES" -gt 0 ]; then
  SIZE=$(du -h "$OUTFILE" | cut -f1)
  echo "Backup saved: $OUTFILE ($SIZE, $TABLES tables)"
  # Show summary
  python3 -c "
import json
d = json.load(open('$OUTFILE'))
print('Timestamp:', d.get('timestamp','?'))
for k,v in sorted(d.items()):
    if isinstance(v,dict) and 'count' in v:
        err = ' ERROR: '+v['error'] if v.get('error') else ''
        print(f'  {k}: {v[\"count\"]} rows{err}')
"
else
  echo "Backup failed! Check $OUTFILE for errors."
  cat "$OUTFILE" | head -200
  exit 1
fi
