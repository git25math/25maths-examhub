#!/usr/bin/env python3
r"""
convert-tables.py -- Convert LaTeX tabular blocks in pastpapers JSON to HTML tables.

Adds a `texHtml` field to questions whose `tex` contains \begin{tabular}...\end{tabular},
replacing tabular blocks with HTML <table> elements while preserving math for KaTeX.

Usage:
  python3 scripts/convert-tables.py --dry-run   # preview without writing
  python3 scripts/convert-tables.py              # convert and write
"""

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

# Files to process
TARGET_FILES = [
    os.path.join(DATA_DIR, "pastpapers-cie.json"),
    os.path.join(DATA_DIR, "papers-cie.json"),
]


def parse_col_spec(spec):
    """Parse tabular column spec like |l|c|r| into alignment list and border info."""
    aligns = []
    borders = []  # left border for each column
    has_right_border = spec.endswith('|')

    i = 0
    left_border = False
    while i < len(spec):
        ch = spec[i]
        if ch == '|':
            left_border = True
            i += 1
        elif ch in ('l', 'c', 'r'):
            align = {'l': 'left', 'c': 'center', 'r': 'right'}[ch]
            aligns.append(align)
            borders.append(left_border)
            left_border = False
            i += 1
        else:
            i += 1  # skip unknown chars

    return aligns, borders, has_right_border


def split_cells(row_text):
    """Split row by & respecting braces and math mode."""
    cells = []
    depth = 0
    current = []
    for ch in row_text:
        if ch == '{':
            depth += 1
            current.append(ch)
        elif ch == '}':
            depth -= 1
            current.append(ch)
        elif ch == '&' and depth == 0:
            cells.append(''.join(current))
            current = []
        else:
            current.append(ch)
    cells.append(''.join(current))
    return [c.strip() for c in cells]


def process_cell_content(content):
    """Process cell content: keep math as-is, clean LaTeX commands."""
    content = content.strip()
    if not content:
        return ''
    # Remove \rule commands (spacers)
    content = re.sub(r'\\rule\{[^}]*\}\{[^}]*\}', '', content)
    return content


def parse_multicolumn(cell):
    r"""Parse \multicolumn{N}{spec}{content} -> (colspan, align, content) or None."""
    m = re.match(r'\\multicolumn\{(\d+)\}\{([^}]*)\}\{(.*)\}$', cell, re.DOTALL)
    if m:
        colspan = int(m.group(1))
        spec = m.group(2)
        content = m.group(3)
        # Extract alignment from spec
        align = 'center'
        for ch in spec:
            if ch in ('l', 'c', 'r'):
                align = {'l': 'left', 'c': 'center', 'r': 'right'}[ch]
                break
        return colspan, align, content
    return None


def convert_tabular(tabular_str):
    r"""Convert a single \begin{tabular}{spec}...\end{tabular} to HTML."""
    # Extract column spec
    m = re.match(r'\\begin\{tabular\}\{([^}]*)\}(.*?)\\end\{tabular\}', tabular_str, re.DOTALL)
    if not m:
        return tabular_str

    col_spec_str = m.group(1)
    body = m.group(2).strip()

    aligns, borders, has_right_border = parse_col_spec(col_spec_str)
    has_borders = any(borders) or has_right_border

    # Split into rows by \\ (ignore \\[length])
    rows_raw = re.split(r'\\\\(?:\s*\[[^\]]*\])?', body)

    # Process rows
    rows = []
    for row_raw in rows_raw:
        row_text = row_raw.strip()
        if not row_text:
            continue

        # Check for \hline
        hline_count = row_text.count('\\hline')
        row_text = row_text.replace('\\hline', '').strip()

        if not row_text:
            # Row was only \hline(s) — mark next row
            if rows:
                rows[-1]['hline_after'] = hline_count
            else:
                # hline before first data row
                rows.append({'cells': None, 'hline_before': hline_count, 'hline_after': 0})
            continue

        cells = split_cells(row_text)
        processed_cells = []
        for cell in cells:
            mc = parse_multicolumn(cell)
            if mc:
                colspan, align, content = mc
                processed_cells.append({
                    'content': process_cell_content(content),
                    'colspan': colspan,
                    'align': align,
                })
            else:
                processed_cells.append({
                    'content': process_cell_content(cell),
                    'colspan': 1,
                    'align': None,
                })

        rows.append({
            'cells': processed_cells,
            'hline_before': hline_count,
            'hline_after': 0,
        })

    # Merge hline-only rows into next row's hline_before
    merged_rows = []
    pending_hlines = 0
    for row in rows:
        if row['cells'] is None:
            pending_hlines += row.get('hline_before', 0) + row.get('hline_after', 0)
            continue
        row['hline_before'] = row.get('hline_before', 0) + pending_hlines
        pending_hlines = row.get('hline_after', 0)
        merged_rows.append(row)

    # If last row had hline_after, apply to last merged row
    if pending_hlines and merged_rows:
        merged_rows[-1]['hline_after'] = pending_hlines

    # Detect if first row is a header (has hline before and after)
    first_is_header = (len(merged_rows) > 1 and
                       merged_rows[0].get('hline_before', 0) > 0 and
                       (merged_rows[0].get('hline_after', 0) > 0 or
                        merged_rows[1].get('hline_before', 0) > 0))

    # Build HTML
    table_class = 'pp-table' if has_borders else 'pp-table pp-table-nb'
    html = '<div class="pp-table-wrap"><table class="' + table_class + '">'

    for i, row in enumerate(merged_rows):
        if row['cells'] is None:
            continue
        tag = 'th' if (i == 0 and first_is_header) else 'td'
        html += '<tr>'
        for j, cell in enumerate(row['cells']):
            attrs = []
            if cell['colspan'] > 1:
                attrs.append('colspan="' + str(cell['colspan']) + '"')
            # Determine alignment
            cell_align = cell['align']
            if cell_align is None and j < len(aligns):
                cell_align = aligns[j]
            if cell_align and cell_align != 'left':
                attrs.append('style="text-align:' + cell_align + '"')

            attr_str = (' ' + ' '.join(attrs)) if attrs else ''
            html += '<' + tag + attr_str + '>' + cell['content'] + '</' + tag + '>'
        html += '</tr>'

    html += '</table></div>'
    return html


def convert_tex(tex):
    """Convert all tabular blocks in tex to HTML, return new string or None if no change."""
    if '\\begin{tabular}' not in tex:
        return None

    # Skip if wrapped in InsertScreenShot
    if 'InsertScreenShot' in tex:
        return None

    result = tex

    # Remove \renewcommand{\arraystretch}{...} before tabular
    result = re.sub(r'\\renewcommand\{\\arraystretch\}\{[^}]*\}\s*', '', result)

    # Remove \begin{center} / \end{center} around tabular
    # Only remove if they immediately wrap a tabular
    result = re.sub(r'\\begin\{center\}\s*(\\begin\{tabular\})', r'\1', result)
    result = re.sub(r'(\\end\{tabular\})\s*\\end\{center\}', r'\1', result)

    # Convert each tabular block
    pattern = re.compile(r'\\begin\{tabular\}\{[^}]*\}.*?\\end\{tabular\}', re.DOTALL)
    result = pattern.sub(lambda m: convert_tabular(m.group(0)), result)

    if result == tex:
        return None
    return result


def process_file(filepath, dry_run=False):
    """Process a single JSON file, adding texHtml where appropriate."""
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Handle v2 format (papers-cie.json) vs flat array (pastpapers-cie.json)
    if isinstance(data, dict) and 'questions' in data:
        questions = data['questions']
    elif isinstance(data, list):
        questions = data
    else:
        print(f"  Skipping {filepath}: unknown format")
        return 0

    count = 0
    for q in questions:
        tex = q.get('tex', '')
        converted = convert_tex(tex)
        if converted is not None:
            q['texHtml'] = converted
            count += 1
            if dry_run and count <= 5:
                print(f"\n  [{q['id']}]")
                print(f"  Original: {tex[:120]}...")
                print(f"  Converted: {converted[:200]}...")

    if not dry_run and count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print(f"  Written {filepath}: {count} questions updated")
    else:
        print(f"  {os.path.basename(filepath)}: {count} questions would be updated")

    return count


def main():
    dry_run = '--dry-run' in sys.argv

    if dry_run:
        print("=== DRY RUN (no files written) ===\n")

    total = 0
    for filepath in TARGET_FILES:
        if not os.path.exists(filepath):
            print(f"  Skipping {filepath}: not found")
            continue
        print(f"Processing {os.path.basename(filepath)}...")
        total += process_file(filepath, dry_run)

    print(f"\nTotal: {total} questions with texHtml")


if __name__ == '__main__':
    main()
