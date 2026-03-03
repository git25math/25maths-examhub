#!/usr/bin/env python3
"""
build-single.py — Merge all files into a single HTML for offline distribution.

Inlines CSS and JS files referenced in index.html.
Preserves CDN references (Google Fonts, Supabase SDK).

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
    """Replace local <script src="..."> with inline <script> blocks."""

    def replace_script(match):
        src = match.group(1)
        # Skip CDN scripts
        if src.startswith("http://") or src.startswith("https://"):
            return match.group(0)
        filepath = os.path.join(base_dir, src)
        if os.path.exists(filepath):
            js = read_file(filepath)
            return f"<script>\n{js}\n</script>"
        else:
            print(f"  WARNING: JS file not found: {filepath}")
            return match.group(0)

    return re.sub(r'<script\s+src="([^"]+)"[^>]*></script>', replace_script, html)


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

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\nGenerated {OUTPUT_FILE} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
