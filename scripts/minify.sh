#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Core JS: concatenate in index.html load order → esbuild minify → single bundle
# (homework.js excluded — lazy-loaded for students with classes + teachers)
cat js/config.js js/levels-loader.js js/storage.js js/particles.js \
    js/auth.js js/ui.js js/mastery.js js/syllabus.js js/study.js js/battle.js \
    js/review.js js/quiz.js js/spell.js js/match.js js/translate.js js/export.js \
    js/stats.js js/practice.js js/learning-graph.js js/worksheet.js js/lists.js js/recovery-priority.js js/recovery-scheduler.js js/student-profile.js js/learning-goals.js js/ai-tutor.js js/error-patterns.js js/mistake-coach.js js/recovery-session.js js/smart-notif.js js/app.js | \
    npx esbuild --loader=js --minify > js/app.bundle.min.js

# Homework module (lazy-loaded separately)
npx esbuild js/homework.js --minify --outfile=js/homework.min.js

# Admin module bundle (lazy-loaded for teachers/super admin)
cat js/admin.js js/vocab-admin.js js/data-admin.js | \
    npx esbuild --loader=js --minify > js/admin.bundle.min.js

# CSS minify
npx esbuild css/style.css --minify --outfile=css/style.min.css

# Sync SW cache version with APP_VERSION from config.js
APP_VER=$(sed -n "s/.*APP_VERSION *= *'\([^']*\)'.*/\1/p" js/config.js)
if [ -n "$APP_VER" ]; then
  sed -i '' "s/^var CACHE_VERSION = '.*';/var CACHE_VERSION = '$APP_VER';/" sw.js
  echo "SW CACHE_VERSION synced to $APP_VER"
  # Sync cache-bust query strings in index.html
  sed -i '' "s/app\.bundle\.min\.js?v=[^\"']*/app.bundle.min.js?v=${APP_VER#v}/" index.html
  sed -i '' "s/style\.min\.css?v=[^\"']*/style.min.css?v=${APP_VER#v}/" index.html
  echo "index.html cache-bust synced to ${APP_VER#v}"
fi

echo "=== Build complete ==="
ls -lh js/app.bundle.min.js js/homework.min.js js/admin.bundle.min.js css/style.min.css
printf "JS bundle gzip: "; gzip -c js/app.bundle.min.js | wc -c
printf "JS homework gzip: "; gzip -c js/homework.min.js | wc -c
printf "JS admin gzip: "; gzip -c js/admin.bundle.min.js | wc -c
printf "CSS gzip: "; gzip -c css/style.min.css | wc -c
