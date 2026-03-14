#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Core JS: concatenate in index.html load order → esbuild minify → single bundle
# Lazy-loaded: homework, spell, match, translate, export, stats, worksheet, practice, lists,
#   study, quiz, battle, knowledge-node, learning-graph, recovery cluster (9 files)
cat js/config.js js/levels-loader.js js/storage.js js/particles.js \
    js/auth.js js/ui.js js/mastery.js js/syllabus.js \
    js/review.js js/app.js | \
    npx esbuild --loader=js --minify > js/app.bundle.min.js

# Lazy-loaded bundles
cat js/study.js js/quiz.js js/battle.js | npx esbuild --loader=js --minify > js/study-quiz-battle.min.js
cat js/practice.js js/knowledge-node.js js/learning-graph.js | npx esbuild --loader=js --minify > js/practice.min.js
cat js/recovery-priority.js js/recovery-scheduler.js js/student-profile.js js/learning-goals.js js/ai-tutor.js js/error-patterns.js js/mistake-coach.js js/recovery-session.js js/smart-notif.js | \
    npx esbuild --loader=js --minify > js/recovery.min.js
npx esbuild js/lists.js --minify --outfile=js/lists.min.js
npx esbuild js/syllabus-views.js --minify --outfile=js/syllabus-views.min.js
cat js/stats.js js/export.js | npx esbuild --loader=js --minify > js/tools.min.js
cat js/spell.js js/match.js | npx esbuild --loader=js --minify > js/modes.min.js
npx esbuild js/translate.js --minify --outfile=js/translate.min.js
npx esbuild js/worksheet.js --minify --outfile=js/worksheet.min.js
npx esbuild js/tour.js --minify --outfile=js/tour.min.js
npx esbuild js/bug-report.js --minify --outfile=js/bug-report.min.js
npx esbuild js/settings.js --minify --outfile=js/settings.min.js

# Homework module (lazy-loaded separately)
npx esbuild js/homework.js --minify --outfile=js/homework.min.js

# Admin module bundle (lazy-loaded for teachers/super admin)
cat js/admin.js js/vocab-admin.js js/data-admin.js | \
    npx esbuild --loader=js --minify > js/admin.bundle.min.js

# Board guides (lazy-loaded on board panel visit)
npx esbuild js/board-guides.js --minify --outfile=js/board-guides.min.js

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
ls -lh js/app.bundle.min.js js/syllabus-views.min.js js/study-quiz-battle.min.js js/practice.min.js js/recovery.min.js js/lists.min.js js/tools.min.js js/modes.min.js js/translate.min.js js/worksheet.min.js js/tour.min.js js/bug-report.min.js js/settings.min.js js/homework.min.js js/admin.bundle.min.js css/style.min.css
printf "JS app bundle gzip:  "; gzip -c js/app.bundle.min.js | wc -c
printf "JS study-quiz gzip:  "; gzip -c js/study-quiz-battle.min.js | wc -c
printf "JS practice gzip:    "; gzip -c js/practice.min.js | wc -c
printf "JS recovery gzip:    "; gzip -c js/recovery.min.js | wc -c
printf "JS syllabus-views gz:"; gzip -c js/syllabus-views.min.js | wc -c
printf "JS lists gzip:       "; gzip -c js/lists.min.js | wc -c
printf "JS tools gzip:       "; gzip -c js/tools.min.js | wc -c
printf "JS modes gzip:       "; gzip -c js/modes.min.js | wc -c
printf "JS translate gzip:   "; gzip -c js/translate.min.js | wc -c
printf "JS worksheet gzip:   "; gzip -c js/worksheet.min.js | wc -c
printf "JS tour gzip:        "; gzip -c js/tour.min.js | wc -c
printf "JS bug-report gzip:  "; gzip -c js/bug-report.min.js | wc -c
printf "JS settings gzip:    "; gzip -c js/settings.min.js | wc -c
printf "JS homework gzip:    "; gzip -c js/homework.min.js | wc -c
printf "JS admin gzip:       "; gzip -c js/admin.bundle.min.js | wc -c
printf "CSS gzip:            "; gzip -c css/style.min.css | wc -c
