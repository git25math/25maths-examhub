#!/usr/bin/env python3
"""
build-single.py — Merge all files into a single HTML for offline distribution.

Inlines CSS, JS, and data JSON files referenced in index.html.
Preserves CDN references (Google Fonts, KaTeX, Supabase SDK).

Special handling:
  - app.bundle.min.js → expand to 18 source files (unminified, debuggable)
  - levels-loader.js → replaced with inline sync version + all levels data
  - homework.min.js → inlined (not lazy-loaded)
  - admin.js / vocab-admin.js → inlined for offline teacher use
  - data/*.json → inlined as JS variables (pre-seeded, no fetch needed)
  - SW registration + manifest → removed (not needed offline)

Usage:
    python3 scripts/build-single.py
"""

import os
import re
import sys
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INPUT_FILE = os.path.join(PROJECT_ROOT, "index.html")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "dist")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "word-match-pro.html")

# The 18 core source files in load order (matching minify.sh)
CORE_JS_FILES = [
    "js/config.js", "js/levels-loader.js", "js/storage.js", "js/particles.js",
    "js/auth.js", "js/ui.js", "js/mastery.js", "js/syllabus.js", "js/study.js",
    "js/battle.js", "js/review.js", "js/quiz.js", "js/spell.js", "js/match.js",
    "js/export.js", "js/stats.js", "js/practice.js", "js/app.js",
]

# Data files to pre-seed (variable name → file path)
DATA_FILES = {
    "_offlineLevelsCie": "data/levels-cie.json",
    "_offlineLevelsEdx": "data/levels-edx.json",
    "_offlineLevels25m": "data/levels-25m.json",
    "_offlineQuestionsCie": "data/questions-cie.json",
    "_offlineQuestionsEdx": "data/questions-edx.json",
    "_offlineSyllabusCie": "data/syllabus-cie.json",
    "_offlineSyllabusEdx": "data/syllabus-edexcel.json",
    "_offlineVocabCie": "data/vocabulary-cie.json",
    "_offlineVocabEdx": "data/vocabulary-edexcel.json",
    "_offlinePapersCie": "data/papers-cie.json",
    "_offlinePapersEdx": "data/papers-edx.json",
    "_offlineVocabHhk": "data/vocabulary-hhk.json",
}

# Optional data files (skip if missing)
OPTIONAL_DATA = {
    "_offlineFigures": "data/figures/manifest.json",
    "_offlinePastpapersCie": "data/pastpapers-cie.json",
    "_offlineVocabUidMap": "data/vocab-uid-map.json",
}


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def inline_css(html, base_dir):
    """Replace local <link rel="stylesheet"> with inline <style> blocks."""
    def replace_link(match):
        href = match.group(1)
        if href.startswith("http://") or href.startswith("https://"):
            return match.group(0)
        # Strip query string for file lookup
        filepath = os.path.join(base_dir, href.split("?")[0])
        if os.path.exists(filepath):
            css = read_file(filepath)
            return f"<style>\n{css}\n</style>"
        print(f"  WARNING: CSS file not found: {filepath}")
        return match.group(0)

    return re.sub(
        r'<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>',
        replace_link,
        html,
    )


def _build_levels_sync_shim(base_dir):
    """Return inline <script> with levels.js data + sync shim."""
    levels_path = os.path.join(base_dir, "js", "levels.js")
    if os.path.exists(levels_path):
        levels_js = read_file(levels_path)
        print("  -> levels-loader.js replaced with inline levels.js + sync shim")
        return (
            f"<script>\n{levels_js}\n"
            "var _levelsReady = true;\n"
            "var _levelsCallbacks = [];\n"
            "function onLevelsReady(fn) { fn(); }\n"
            "function ensureBoardLoaded() { return Promise.resolve(); }\n"
            "function ensureAllBoardsLoaded() { return Promise.resolve(); }\n"
            "</script>"
        )
    print(f"  WARNING: levels.js not found: {levels_path}")
    return ""


def _build_data_preseed(base_dir):
    """Return <script> that pre-seeds data variables for offline fetch override."""
    parts = ["<script>/* Pre-seeded data for offline use */"]

    for varname, relpath in {**DATA_FILES, **OPTIONAL_DATA}.items():
        filepath = os.path.join(base_dir, relpath)
        if os.path.exists(filepath):
            data = read_file(filepath).strip()
            parts.append(f"var {varname} = {data};")
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  -> Inlined {relpath} ({size_kb:.0f} KB)")
        elif relpath in OPTIONAL_DATA.values():
            print(f"  -> Skipped optional {relpath} (not found)")
        else:
            print(f"  WARNING: Data file not found: {filepath}")

    # Override fetch for data files to return pre-seeded data
    parts.append("""
/* Override fetch for pre-seeded data files */
var _origFetch = window.fetch;
var _dataMap = {
  'data/levels-cie.json': typeof _offlineLevelsCie !== 'undefined' ? _offlineLevelsCie : null,
  'data/levels-edx.json': typeof _offlineLevelsEdx !== 'undefined' ? _offlineLevelsEdx : null,
  'data/levels-25m.json': typeof _offlineLevels25m !== 'undefined' ? _offlineLevels25m : null,
  'data/questions-cie.json': typeof _offlineQuestionsCie !== 'undefined' ? _offlineQuestionsCie : null,
  'data/questions-edx.json': typeof _offlineQuestionsEdx !== 'undefined' ? _offlineQuestionsEdx : null,
  'data/syllabus-cie.json': typeof _offlineSyllabusCie !== 'undefined' ? _offlineSyllabusCie : null,
  'data/syllabus-edexcel.json': typeof _offlineSyllabusEdx !== 'undefined' ? _offlineSyllabusEdx : null,
  'data/vocabulary-cie.json': typeof _offlineVocabCie !== 'undefined' ? _offlineVocabCie : null,
  'data/vocabulary-edexcel.json': typeof _offlineVocabEdx !== 'undefined' ? _offlineVocabEdx : null,
  'data/papers-cie.json': typeof _offlinePapersCie !== 'undefined' ? _offlinePapersCie : null,
  'data/papers-edx.json': typeof _offlinePapersEdx !== 'undefined' ? _offlinePapersEdx : null,
  'data/figures/manifest.json': typeof _offlineFigures !== 'undefined' ? _offlineFigures : null,
  'data/pastpapers-cie.json': typeof _offlinePastpapersCie !== 'undefined' ? _offlinePastpapersCie : null,
  'data/vocabulary-hhk.json': typeof _offlineVocabHhk !== 'undefined' ? _offlineVocabHhk : null,
  'data/vocab-uid-map.json': typeof _offlineVocabUidMap !== 'undefined' ? _offlineVocabUidMap : null
};
window.fetch = function(url, opts) {
  var key = typeof url === 'string' ? url.split('?')[0] : '';
  if (_dataMap[key] !== undefined && _dataMap[key] !== null) {
    return Promise.resolve(new Response(JSON.stringify(_dataMap[key]), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    }));
  }
  return _origFetch.apply(this, arguments);
};
""")
    parts.append("</script>")
    return "\n".join(parts)


def inline_js(html, base_dir):
    """Replace local <script src> with inline <script> blocks."""

    def replace_script(match):
        src = match.group(1)
        if src.startswith("http://") or src.startswith("https://"):
            return match.group(0)

        # Strip query string
        src_clean = src.split("?")[0]

        # app.bundle.min.js → expand to 18 source files
        if src_clean == "js/app.bundle.min.js":
            print("  -> Expanding app.bundle.min.js to 18 source files")
            parts = []
            for js_file in CORE_JS_FILES:
                if js_file == "js/levels-loader.js":
                    parts.append(_build_levels_sync_shim(base_dir))
                    continue
                filepath = os.path.join(base_dir, js_file)
                if os.path.exists(filepath):
                    js = read_file(filepath)
                    parts.append(f"<script>\n{js}\n</script>")
                else:
                    print(f"  WARNING: JS file not found: {filepath}")
            return "\n".join(parts)

        # levels-loader.js standalone → sync shim
        if src_clean == "js/levels-loader.js":
            return _build_levels_sync_shim(base_dir)

        filepath = os.path.join(base_dir, src_clean)
        if os.path.exists(filepath):
            js = read_file(filepath)
            return f"<script>\n{js}\n</script>"
        print(f"  WARNING: JS file not found: {filepath}")
        return match.group(0)

    return re.sub(r'<script\s+src="([^"]+)"[^>]*></script>', replace_script, html)


def inject_extra_scripts(html, base_dir):
    """Inject homework.js + admin.js + vocab-admin.js inline for offline use."""
    extra_files = [
        ("js/homework.js", "homework.min.js loaded dynamically"),
        ("js/admin.js", "admin.js"),
        ("js/vocab-admin.js", "vocab-admin.js"),
    ]
    inject = ""
    for js_file, desc in extra_files:
        path = os.path.join(base_dir, js_file)
        if os.path.exists(path):
            js = read_file(path)
            inject += f"<script>\n{js}\n</script>\n"
            print(f"  -> Inlined {js_file} for offline use")

    # Insert dynamically loaded scripts' comments with actual code
    html = html.replace(
        "<!-- homework.min.js loaded dynamically for students with classes + teachers (see auth.js) -->",
        "",
    )
    html = html.replace(
        "<!-- admin.js + vocab-admin.js loaded dynamically for teachers (see auth.js) -->",
        inject.strip() if inject else "",
    )
    return html


def remove_pwa_artifacts(html):
    """Remove PWA manifest, SW registration, and related meta tags for offline build."""
    # Remove manifest link
    html = re.sub(r'<link\s+rel="manifest"\s+[^>]*>\n?', '', html)
    # Remove SW registration script block
    html = re.sub(
        r'<script>\s*if\s*\(\s*[\'"]serviceWorker[\'"]\s*in\s*navigator\s*\).*?</script>',
        '<!-- SW disabled in offline build -->',
        html,
        flags=re.DOTALL,
    )
    return html


def inject_data_preseed(html, base_dir):
    """Insert data pre-seed script right before the first app script."""
    preseed = _build_data_preseed(base_dir)
    # Insert before the first <script src="js/ or <script src="https://cdn
    # Best spot: right after </head><body> area, before any app JS
    marker = "<!-- Particle Canvas -->"
    if marker in html:
        html = html.replace(marker, preseed + "\n" + marker)
    else:
        # Fallback: insert before </body>
        html = html.replace("</body>", preseed + "\n</body>")
    return html


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Reading {INPUT_FILE}...")
    html = read_file(INPUT_FILE)

    print("Removing PWA artifacts...")
    html = remove_pwa_artifacts(html)

    print("Inlining CSS...")
    html = inline_css(html, PROJECT_ROOT)

    print("Pre-seeding data JSON files...")
    html = inject_data_preseed(html, PROJECT_ROOT)

    print("Inlining JS...")
    html = inline_js(html, PROJECT_ROOT)

    print("Injecting extra scripts for offline...")
    html = inject_extra_scripts(html, PROJECT_ROOT)

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    size_mb = size_kb / 1024
    print(f"\nGenerated {OUTPUT_FILE} ({size_mb:.1f} MB / {size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
