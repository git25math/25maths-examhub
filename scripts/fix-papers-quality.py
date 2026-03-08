#!/usr/bin/env python3
"""
fix-papers-quality.py — Batch fix LaTeX quality issues in papers-cie.json & papers-edx.json

Mirrors the 15 DQ_RULES from js/data-admin.js but runs offline on JSON files.
Handles both auto-fixable rules and "manual" rules (subparts/parts/text_cmd).

Usage:
  python3 scripts/fix-papers-quality.py --dry-run   # preview stats only
  python3 scripts/fix-papers-quality.py              # apply fixes in-place
"""

import json
import re
import sys
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = {
    'cie': os.path.join(ROOT, 'data', 'papers-cie.json'),
    'edx': os.path.join(ROOT, 'data', 'papers-edx.json'),
}

# ═══ RULES ═══

def is_in_math(tex, offset):
    """Check if offset is inside $...$ math mode."""
    before = tex[:offset]
    return before.count('$') % 2 == 1

def fix_spacing(tex):
    """Remove \\[Xcm], \\[Xmm], \\[Xpt], \\[Xem] spacing commands."""
    return re.sub(r'\\\\\[\d+(\.\d+)?(cm|mm|pt|em)\]', '\n', tex)

def fix_textbf(tex):
    r"""Convert \textbf{text} → **text**."""
    return re.sub(r'\\textbf\{([^}]*)\}', r'**\1**', tex)

def fix_center(tex):
    r"""Remove \begin{center} and \end{center}."""
    result = re.sub(r'\\begin\{center\}|\\end\{center\}', '', tex)
    return re.sub(r'\n{3,}', '\n\n', result)

def fix_quad(tex):
    r"""Replace \quad outside math mode with em-space."""
    parts = []
    last = 0
    for m in re.finditer(r'\\quad', tex):
        parts.append(tex[last:m.start()])
        if is_in_math(tex, m.start()):
            parts.append(m.group())
        else:
            parts.append('\u2003')
        last = m.end()
    parts.append(tex[last:])
    return ''.join(parts)

def fix_tmarker(tex):
    """Remove line-start 't ' marker."""
    return re.sub(r'^t ', '', tex, flags=re.MULTILINE)

def fix_degree(tex):
    r"""Replace \degree and \textdegree with °."""
    return re.sub(r'\\textdegree', '°', tex).replace('\\degree', '°')

def fix_pounds(tex):
    r"""Replace \pounds with £."""
    return tex.replace('\\pounds', '£')

def fix_minipage(tex):
    r"""Remove \begin{minipage}...\end{minipage} environment wrappers."""
    result = re.sub(r'\\begin\{minipage\}(\{[^}]*\}|\[[^\]]*\])*\s*', '', tex)
    return re.sub(r'\\end\{minipage\}', '', result)

def fix_renewcmd(tex):
    r"""Remove \renewcommand{...}{...}."""
    return re.sub(r'\\renewcommand\{[^}]*\}\{[^}]*\}\s*', '', tex)

def fix_hspace(tex):
    r"""Remove \hspace{...} and \vspace{...}."""
    return re.sub(r'\\[hv]space\*?\{[^}]*\}', '', tex)

def fix_subparts(tex):
    r"""Convert \begin{subparts}...\end{subparts} to (a)/(b)/(c) plain text."""
    # Remove environment markers
    tex = re.sub(r'\\begin\{subparts\}\s*', '', tex)
    tex = re.sub(r'\\end\{subparts\}\s*', '', tex)
    # Convert \subpart → (a), (b), (c), ...
    counter = [0]
    def repl_subpart(m):
        letter = chr(ord('a') + counter[0])
        counter[0] += 1
        return '(' + letter + ') '
    tex = re.sub(r'\\subpart\s*', repl_subpart, tex)
    return tex

def fix_parts(tex):
    r"""Convert \begin{parts}...\end{parts} to (a)/(b)/(c) plain text."""
    tex = re.sub(r'\\begin\{parts\}\s*', '', tex)
    tex = re.sub(r'\\end\{parts\}\s*', '', tex)
    counter = [0]
    def repl_part(m):
        letter = chr(ord('a') + counter[0])
        counter[0] += 1
        return '(' + letter + ') '
    tex = re.sub(r'\\part\s*(?!\{)', repl_part, tex)
    return tex

def fix_text_cmd(tex):
    r"""Remove \text{} wrapper outside math mode, keeping inner content."""
    parts = []
    last = 0
    for m in re.finditer(r'\\text\{([^}]*)\}', tex):
        if not is_in_math(tex, m.start()):
            parts.append(tex[last:m.start()])
            parts.append(m.group(1))  # keep inner content
            last = m.end()
    if last == 0:
        return tex
    parts.append(tex[last:])
    return ''.join(parts)


# Detection patterns (for stats)
DETECT_PATTERNS = {
    'spacing':   re.compile(r'\\\\\[\d+(\.\d+)?(cm|mm|pt|em)\]'),
    'textbf':    re.compile(r'\\textbf\{[^}]*\}'),
    'center':    re.compile(r'\\begin\{center\}|\\end\{center\}'),
    'quad':      re.compile(r'\\quad'),
    'tmarker':   re.compile(r'^t ', re.MULTILINE),
    'degree':    re.compile(r'\\(text)?degree'),
    'pounds':    re.compile(r'\\pounds'),
    'minipage':  re.compile(r'\\begin\{minipage\}'),
    'renewcmd':  re.compile(r'\\renewcommand\{[^}]*\}\{[^}]*\}'),
    'hspace':    re.compile(r'\\[hv]space\*?\{[^}]*\}'),
    'subparts':  re.compile(r'\\begin\{subparts\}'),
    'parts':     re.compile(r'\\begin\{parts\}'),
    'text_cmd':  re.compile(r'\\text\{'),
}

# Fix functions in application order
FIXES = [
    ('spacing',   fix_spacing),
    ('textbf',    fix_textbf),
    ('center',    fix_center),
    ('quad',      fix_quad),
    ('tmarker',   fix_tmarker),
    ('degree',    fix_degree),
    ('pounds',    fix_pounds),
    ('minipage',  fix_minipage),
    ('renewcmd',  fix_renewcmd),
    ('hspace',    fix_hspace),
    ('subparts',  fix_subparts),
    ('parts',     fix_parts),
    ('text_cmd',  fix_text_cmd),
]


def scan(questions):
    """Scan questions and return {rule_id: count}."""
    counts = defaultdict(int)
    for q in questions:
        tex = q.get('tex', '')
        if not tex:
            continue
        for rule_id, pat in DETECT_PATTERNS.items():
            if pat.search(tex):
                counts[rule_id] += 1
    return dict(counts)


def apply_fixes(questions):
    """Apply all fixes to questions. Returns number of modified questions."""
    modified = 0
    for q in questions:
        tex = q.get('tex', '')
        if not tex:
            continue
        original = tex
        for rule_id, fix_fn in FIXES:
            tex = fix_fn(tex)
        # Clean up excessive whitespace
        tex = re.sub(r'\n{3,}', '\n\n', tex)
        tex = tex.strip()
        if tex != original:
            q['tex'] = tex
            modified += 1
    return modified


def main():
    dry_run = '--dry-run' in sys.argv

    for board, path in DATA.items():
        print(f'\n{"="*60}')
        print(f'  {board.upper()} — {path}')
        print(f'{"="*60}')

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Extract questions
        if isinstance(data, dict) and data.get('v') == '2.0':
            questions = data.get('questions', [])
        elif isinstance(data, list):
            questions = data
        else:
            questions = data.get('questions', [])

        print(f'  Total questions: {len(questions)}')

        # Pre-scan
        print(f'\n  --- BEFORE ---')
        before = scan(questions)
        total_issues = 0
        for rule_id in DETECT_PATTERNS:
            c = before.get(rule_id, 0)
            if c > 0:
                print(f'    {rule_id:12s}  {c:>5d} questions')
                total_issues += c
        print(f'    {"TOTAL":12s}  {total_issues:>5d} violations')

        if dry_run:
            continue

        # Apply fixes
        modified = apply_fixes(questions)
        print(f'\n  Modified: {modified} questions')

        # Post-scan
        print(f'\n  --- AFTER ---')
        after = scan(questions)
        total_after = 0
        for rule_id in DETECT_PATTERNS:
            c = after.get(rule_id, 0)
            if c > 0:
                print(f'    {rule_id:12s}  {c:>5d} questions')
                total_after += c
        if total_after == 0:
            print(f'    (clean — 0 violations)')
        else:
            print(f'    {"TOTAL":12s}  {total_after:>5d} remaining')

        # Write back
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

        file_size = os.path.getsize(path)
        print(f'  Written: {path} ({file_size:,} bytes)')

    print(f'\n{"="*60}')
    if dry_run:
        print('  DRY RUN — no files modified')
    else:
        print('  DONE — all fixes applied')
    print(f'{"="*60}\n')


if __name__ == '__main__':
    main()
