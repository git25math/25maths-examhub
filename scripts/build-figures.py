#!/usr/bin/env python3
"""TikZ → SVG batch compiler for past paper figures.

Reads pastpapers-cie.json, finds TikZ source files from the CIE repo,
compiles them to SVG via pdflatex + pdf2svg, and generates manifest.json.

Usage:
    python3 scripts/build-figures.py --section 2.5   # pilot: Section 2.5 only
    python3 scripts/build-figures.py                  # all sections
"""

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
FIGURES_DIR = os.path.join(DATA_DIR, 'figures')

STANDALONE_TEMPLATE = r"""\documentclass[border=2pt]{standalone}
\usepackage{tikz}
\usepackage{amsmath,amssymb}
\usetikzlibrary{calc,arrows.meta,patterns,decorations.markings}
\begin{document}
%s
\end{document}
"""

# Map question ID components to CIE source path
# ID format: 0580-{session}-Paper{N}-Q{nn}
# Source: PastPapers/{session}/Paper{N}/Questions/Q{nn}/Figures/*.tikz
SESSION_MAP = {
    'Specimen': 'Specimen',
    'March': 'March',
    'MayJune': 'MayJune',
    'OctNov': 'OctNov',
}


def parse_qid(qid):
    """Parse question ID into (session_dir, paper, qnum).

    Example: '0580-2024OctNov-Paper42-Q03' → ('2024OctNov', 'Paper42', 'Q03')
    """
    m = re.match(r'0580-(\d{4}\w+)-(Paper\d+)-(Q\d+)', qid)
    if not m:
        return None
    return m.group(1), m.group(2), m.group(3)


def find_tikz_files(cie_base, session, paper, qnum):
    """Find all .tikz files for a question, excluding placeholders."""
    fig_dir = os.path.join(cie_base, 'PastPapers', session, paper,
                           'Questions', qnum, 'Figures')
    if not os.path.isdir(fig_dir):
        return []
    tikz_files = sorted(glob.glob(os.path.join(fig_dir, '*.tikz')))
    # Filter out placeholder files (< 100 bytes or containing "placeholder")
    real = []
    for f in tikz_files:
        with open(f) as fh:
            content = fh.read()
        if 'placeholder' in content.lower() or len(content.strip()) < 50:
            continue
        real.append(f)
    return real


def find_png_files(cie_base, session, paper, qnum):
    """Find PNG fallback files for a question."""
    fig_dir = os.path.join(cie_base, 'PastPapers', session, paper,
                           'Questions', qnum, 'Figures')
    if not os.path.isdir(fig_dir):
        return []
    return sorted(glob.glob(os.path.join(fig_dir, '*.png')))


def clean_tikz(raw):
    """Strip wrapping \\begin{center}/\\end{center} and comment headers."""
    lines = []
    in_header = True
    for line in raw.split('\n'):
        stripped = line.strip()
        # Skip comment-only header block at top
        if in_header and (stripped.startswith('%%') or stripped == ''):
            continue
        in_header = False
        # Remove center environment wrapping
        if stripped in (r'\begin{center}', r'\end{center}'):
            continue
        lines.append(line)
    return '\n'.join(lines).strip()


def compile_tikz_to_svg(tikz_code, output_path):
    """Compile TikZ code to SVG via pdflatex + pdf2svg. Returns True on success."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tex_path = os.path.join(tmpdir, 'figure.tex')
        pdf_path = os.path.join(tmpdir, 'figure.pdf')

        with open(tex_path, 'w') as f:
            f.write(STANDALONE_TEMPLATE % tikz_code)

        # pdflatex compile
        result = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', '-halt-on-error', 'figure.tex'],
            cwd=tmpdir, capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0 or not os.path.exists(pdf_path):
            print(f'  [ERROR] pdflatex failed: {result.stdout[-200:]}', file=sys.stderr)
            return False

        # pdf2svg convert
        result = subprocess.run(
            ['pdf2svg', pdf_path, output_path],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            print(f'  [ERROR] pdf2svg failed: {result.stderr}', file=sys.stderr)
            return False

    return True


def main():
    parser = argparse.ArgumentParser(description='Build SVG figures from TikZ sources')
    parser.add_argument('--section', help='Only process specific section (e.g. 2.5)')
    parser.add_argument('--cie-base',
                        default='/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2',
                        help='CIE IGCSE_v2 root directory')
    args = parser.parse_args()

    # Load past paper data
    pp_path = os.path.join(DATA_DIR, 'pastpapers-cie.json')
    with open(pp_path) as f:
        questions = json.load(f)

    # Filter to hasFigure questions
    fig_qs = [q for q in questions if q.get('hasFigure')]
    if args.section:
        fig_qs = [q for q in fig_qs if q.get('s') == args.section]

    print(f'Found {len(fig_qs)} questions with figures' +
          (f' in section {args.section}' if args.section else ''))

    # Ensure output directory
    os.makedirs(FIGURES_DIR, exist_ok=True)

    manifest = {}
    stats = {'svg': 0, 'png': 0, 'skip': 0}

    for q in fig_qs:
        qid = q['id']
        parsed = parse_qid(qid)
        if not parsed:
            print(f'  [SKIP] Cannot parse ID: {qid}')
            stats['skip'] += 1
            continue

        session, paper, qnum = parsed
        tikz_files = find_tikz_files(args.cie_base, session, paper, qnum)

        if tikz_files:
            fig_list = []
            for i, tikz_path in enumerate(tikz_files):
                with open(tikz_path) as f:
                    raw = f.read()
                tikz_code = clean_tikz(raw)

                # Name: single file → {qid}.svg, multi → {qid}-0.svg
                suffix = f'-{i}' if len(tikz_files) > 1 else ''
                svg_name = f'{qid}{suffix}.svg'
                svg_path = os.path.join(FIGURES_DIR, svg_name)

                print(f'  Compiling {os.path.basename(tikz_path)} → {svg_name}')
                if compile_tikz_to_svg(tikz_code, svg_path):
                    fig_list.append(f'figures/{svg_name}')
                    stats['svg'] += 1
                else:
                    stats['skip'] += 1

            if fig_list:
                manifest[qid] = fig_list
        else:
            # PNG fallback
            png_files = find_png_files(args.cie_base, session, paper, qnum)
            if png_files:
                fig_list = []
                for i, png_path in enumerate(png_files):
                    suffix = f'-{i}' if len(png_files) > 1 else ''
                    png_name = f'{qid}{suffix}.png'
                    dst = os.path.join(FIGURES_DIR, png_name)
                    shutil.copy2(png_path, dst)
                    fig_list.append(f'figures/{png_name}')
                    stats['png'] += 1
                    print(f'  Copied PNG → {png_name}')
                manifest[qid] = fig_list
            else:
                print(f'  [SKIP] No TikZ or PNG for {qid}')
                stats['skip'] += 1

    # Write manifest
    manifest_path = os.path.join(FIGURES_DIR, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f'\nDone: {stats["svg"]} SVGs, {stats["png"]} PNGs, {stats["skip"]} skipped')
    print(f'Manifest: {manifest_path} ({len(manifest)} entries)')


if __name__ == '__main__':
    main()
