#!/usr/bin/env python3
"""
build-single.py — Merge all files into a single HTML for offline distribution.

Inlines CSS and JS files referenced in index.html.
Preserves CDN references (Google Fonts, Supabase SDK).

Special handling:
  - levels-loader.js → replaced with inline synchronous version + levels.js data
  - admin.js / vocab-admin.js → re-injected as inline scripts (teachers may use offline)

Usage:
    python3 scripts/build-single.py
"""

import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
INPUT_FILE = os.path.join(PROJECT_ROOT, "index.html")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "dist")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "word-match-pro.html")


def read_file(path):
    """Read a file and return its contents."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def inline_css(html, base_dir):
    """Replace local <link rel="stylesheet"> with inline <style> blocks."""

    def replace_link(match):
        href = match.group(1)
        # Skip CDN links
        if href.startswith("http://") or href.startswith("https://"):
            return match.group(0)
        filepath = os.path.join(base_dir, href)
        if os.path.exists(filepath):
            css = read_file(filepath)
            return f"<style>\n{css}\n</style>"
        else:
            print(f"  WARNING: CSS file not found: {filepath}")
            return match.group(0)

    return re.sub(
        r'<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>',
        replace_link,
        html,
    )


def inline_js(html, base_dir):
    """Replace local <script src="..."> with inline <script> blocks.

    Special case: levels-loader.js is replaced with a synchronous inline version
    that embeds the full LEVELS data from levels.js.
    """

    def replace_script(match):
        src = match.group(1)
        # Skip CDN scripts
        if src.startswith("http://") or src.startswith("https://"):
            return match.group(0)

        # Special: levels-loader.js → inline synchronous version with levels.js data
        if src == "js/levels-loader.js":
            levels_path = os.path.join(base_dir, "js", "levels.js")
            if os.path.exists(levels_path):
                levels_js = read_file(levels_path)
                # Inline levels.js data + synchronous onLevelsReady shim
                inline = (
                    f"<script>\n{levels_js}\n"
                    "var _levelsReady = true;\n"
                    "var _levelsCallbacks = [];\n"
                    "function onLevelsReady(fn) { fn(); }\n"
                    "</script>"
                )
                print("  -> levels-loader.js replaced with inline levels.js + sync shim")
                return inline
            else:
                print(f"  WARNING: levels.js not found for inline build: {levels_path}")
                return match.group(0)

        filepath = os.path.join(base_dir, src)
        if os.path.exists(filepath):
            js = read_file(filepath)
            return f"<script>\n{js}\n</script>"
        else:
            print(f"  WARNING: JS file not found: {filepath}")
            return match.group(0)

    return re.sub(r'<script\s+src="([^"]+)"[^>]*></script>', replace_script, html)


def inject_admin_scripts(html, base_dir):
    """Re-inject admin.js + vocab-admin.js as inline scripts for offline use.

    In index.html these are loaded dynamically for teachers only,
    but for the offline single-file build we include them so
    teachers can use admin features without network.
    """
    admin_path = os.path.join(base_dir, "js", "admin.js")
    vocab_admin_path = os.path.join(base_dir, "js", "vocab-admin.js")

    inject = ""
    for path, name in [(admin_path, "admin.js"), (vocab_admin_path, "vocab-admin.js")]:
        if os.path.exists(path):
            js = read_file(path)
            inject += f"<script>\n{js}\n</script>\n"
            print(f"  -> Re-injected {name} for offline use")
        else:
            print(f"  WARNING: {name} not found: {path}")

    if inject:
        # Insert before </body> or before the closing app.js script
        # Find the comment that replaced the admin script tags
        html = html.replace(
            "<!-- admin.js + vocab-admin.js loaded dynamically for teachers (see auth.js) -->",
            inject.strip(),
        )

    return html


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found", file=sys.stderr)
        sys.exit(1)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Reading {INPUT_FILE}...")
    html = read_file(INPUT_FILE)

    print("Inlining CSS...")
    html = inline_css(html, PROJECT_ROOT)

    print("Inlining JS...")
    html = inline_js(html, PROJECT_ROOT)

    print("Injecting admin scripts for offline...")
    html = inject_admin_scripts(html, PROJECT_ROOT)

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\nGenerated {OUTPUT_FILE} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
