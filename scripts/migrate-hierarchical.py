#!/usr/bin/env python3
"""
migrate-hierarchical.py — Block-based + Answer Layout System migration

Converts papers-cie.json and papers-edx.json from flat tex strings
to structured stem/parts[].content/answer blocks.

Usage:
  python3 scripts/migrate-hierarchical.py [--dry-run]
"""
import json, re, sys, os
from collections import Counter

DRY_RUN = '--dry-run' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(ROOT, 'data', 'figures', 'manifest.json')

# Load figure manifest
try:
    with open(MANIFEST_PATH) as f:
        FIGURE_MANIFEST = json.load(f)
except FileNotFoundError:
    FIGURE_MANIFEST = {}

# ─── Block parsing ───────────────────────────────────────────────────

TABULAR_RE = re.compile(r'(\\begin\{tabular\}.*?\\end\{tabular\})', re.DOTALL)
ALIGN_RE = re.compile(r'(\\begin\{align\*?\}.*?\\end\{align\*?\})', re.DOTALL)

def tex_to_blocks(tex_str):
    """Split a tex string into Block[] (text + table + align blocks)."""
    if not tex_str or not tex_str.strip():
        return []

    # Combine tabular and align* environments
    combined = re.compile(
        r'(\\begin\{(?:tabular|align\*?)\}.*?\\end\{(?:tabular|align\*?)\})',
        re.DOTALL
    )
    parts = combined.split(tex_str)
    blocks = []
    for part in parts:
        if not part.strip():
            continue
        if part.strip().startswith('\\begin{tabular}'):
            blocks.append({"type": "table", "content": part.strip()})
        elif part.strip().startswith('\\begin{align'):
            blocks.append({"type": "text", "content": part.strip()})
        else:
            # Clean leftmargin and enumerate remnants
            cleaned = re.sub(r'\[leftmargin[^\]]*\]', '', part)
            cleaned = re.sub(r'\\begin\{enumerate\}', '', cleaned)
            cleaned = re.sub(r'\\end\{enumerate\}', '', cleaned)
            cleaned = re.sub(r'\\item\s*', '', cleaned)
            cleaned = cleaned.strip()
            if cleaned:
                blocks.append({"type": "text", "content": cleaned})
    return blocks


# ─── Part splitting ──────────────────────────────────────────────────

def split_by_parts_cie(tex_str, parts):
    """Split CIE tex by (a), (b), etc. labels at line start."""
    if not parts:
        return tex_str, []
    labels = [p['label'] for p in parts]
    # Build regex: labels at line start (or after newline)
    escaped = [re.escape(l) for l in labels]
    pattern = r'(?:^|\n)\s*(' + '|'.join(escaped) + r')\s*'
    splits = re.split(pattern, tex_str)

    if len(splits) < 3:
        # Labels not found in text — return entire tex as stem
        return tex_str, []

    stem_text = splits[0].strip()
    part_texts = []
    i = 1
    while i < len(splits) - 1:
        label = splits[i]
        content = splits[i + 1].strip() if i + 1 < len(splits) else ''
        part_texts.append((label, content))
        i += 2

    return stem_text, part_texts


def split_by_parts_edx(tex_str, parts):
    """Split Edexcel tex by **(a)** bold labels."""
    if not parts:
        return tex_str, []
    labels_bold = ['**(' + p['label'].strip('()') + ')**' for p in parts]
    labels_plain = [p['label'] for p in parts]

    # Try bold format first: **(a)**
    escaped_bold = [re.escape(l) for l in labels_bold]
    pattern_bold = r'(?:^|\n)\s*(' + '|'.join(escaped_bold) + r')\s*'
    splits = re.split(pattern_bold, tex_str)

    if len(splits) >= 3:
        stem_text = splits[0].strip()
        part_texts = []
        i = 1
        while i < len(splits) - 1:
            bold_label = splits[i]
            # Convert **(a)** back to (a)
            m = re.match(r'\*\*\(([a-z])\)\*\*', bold_label)
            label = '(' + m.group(1) + ')' if m else bold_label
            content = splits[i + 1].strip() if i + 1 < len(splits) else ''
            part_texts.append((label, content))
            i += 2
        return stem_text, part_texts

    # Fallback: try plain (a) format
    return split_by_parts_cie(tex_str, parts)


# ─── Answer object builder ──────────────────────────────────────────

def build_answer(prefix=None, suffix=None, tpl=None):
    """Convert ansPrefix/ansSuffix/ansTpl to structured AnswerSpace object."""
    if tpl:
        vec_match = re.match(r'^vector(?:\((\d+)\))?$', tpl)
        if vec_match:
            fields = int(vec_match.group(1) or '2')
            ans = {"type": "vector", "fields": fields, "layout": "column"}
            if prefix:
                ans["prefix"] = prefix
            if suffix:
                ans["suffix"] = suffix
            return ans

        if tpl.startswith('table:'):
            return {"type": "table_input", "template": tpl[6:]}

        # Check for coordinate pattern like (____,____)
        if re.match(r'^\(_{3,}\s*,\s*_{3,}\)$', tpl):
            return {"type": "coordinate", "fields": 2}

        # Multi-line template
        lines = tpl.split('\\n')
        if len(lines) > 1:
            return {"type": "multiline", "lines": len(lines), "template": tpl}

        # Generic template with blanks
        if '____' in tpl:
            return {"type": "expression", "template": tpl}

        # Fallback
        return {"type": "expression", "template": tpl}

    ans = {"type": "number"}
    if prefix:
        ans["prefix"] = prefix
    if suffix:
        ans["suffix"] = suffix
    return ans


# ─── Figure handling ─────────────────────────────────────────────────

def add_figure_blocks(q, stem_blocks):
    """Add figure block to stem if question has figures."""
    figs = FIGURE_MANIFEST.get(q['id'])
    if figs:
        for fig_path in figs:
            stem_blocks.append({"type": "figure", "ref": fig_path})
    elif q.get('hasFigure'):
        stem_blocks.append({"type": "figure", "hasFigure": True})


# ─── Main migration ─────────────────────────────────────────────────

def migrate_question(q, board):
    """Migrate a single question to block-based structure."""
    tex = q.get('tex', '')

    # Normalize Edexcel parts {p, m} → {label, marks}
    if q.get('parts'):
        for p in q['parts']:
            if 'p' in p and 'label' not in p:
                p['label'] = '(' + p['p'] + ')'
                p['marks'] = p.get('m', 0)
                del p['p']
                if 'm' in p:
                    del p['m']

    parts = q.get('parts', [])

    if parts:
        # Split tex by part labels
        if board == 'edx':
            stem_text, part_texts = split_by_parts_edx(tex, parts)
        else:
            stem_text, part_texts = split_by_parts_cie(tex, parts)

        # Build stem blocks
        stem_blocks = tex_to_blocks(stem_text)

        # Add figures to stem
        add_figure_blocks(q, stem_blocks)

        q['stem'] = stem_blocks

        # Build per-part content + answer
        if part_texts:
            # Map label → part_text
            text_map = {label.lower(): content for label, content in part_texts}
            for p in parts:
                label = p['label'].lower()
                pt_text = text_map.get(label, '')
                p['content'] = tex_to_blocks(pt_text)

                # Build answer from part-level or default
                p['answer'] = build_answer(
                    p.get('ansPrefix'), p.get('ansSuffix'), p.get('ansTpl')
                )
                # Clean up old part-level answer fields
                for old_f in ['ansPrefix', 'ansSuffix', 'ansTpl']:
                    p.pop(old_f, None)
        else:
            # Labels not found in text — put everything in stem, empty content for parts
            for p in parts:
                p['content'] = []
                p['answer'] = build_answer(
                    p.get('ansPrefix'), p.get('ansSuffix'), p.get('ansTpl')
                )
                for old_f in ['ansPrefix', 'ansSuffix', 'ansTpl']:
                    p.pop(old_f, None)
    else:
        # No parts — everything is stem
        stem_blocks = tex_to_blocks(tex)
        add_figure_blocks(q, stem_blocks)
        q['stem'] = stem_blocks

        # Question-level answer
        q['answer'] = build_answer(
            q.get('ansPrefix'), q.get('ansSuffix'), q.get('ansTpl')
        )

    # Remove old fields (but keep tex for editor backward compat)
    q.pop('texHtml', None)
    q.pop('ansPrefix', None)
    q.pop('ansSuffix', None)
    q.pop('ansTpl', None)

    return q


def migrate_file(path, board):
    """Migrate an entire papers JSON file."""
    with open(path) as f:
        data = json.load(f)

    questions = data.get('questions', [])
    stats = Counter()

    for q in questions:
        migrate_question(q, board)
        stats['total'] += 1
        if q.get('parts'):
            stats['with_parts'] += 1
            if any(p.get('content') for p in q['parts']):
                stats['parts_split_ok'] += 1
            else:
                stats['parts_split_fail'] += 1
        else:
            stats['no_parts'] += 1
        if q.get('stem'):
            has_table = any(b['type'] == 'table' for b in q['stem'])
            has_figure = any(b['type'] == 'figure' for b in q['stem'])
            if has_table:
                stats['stem_has_table'] += 1
            if has_figure:
                stats['stem_has_figure'] += 1
        if q.get('answer'):
            stats['has_q_answer'] += 1
            stats['answer_' + q['answer']['type']] += 1

    # Update version
    data['v'] = '3.0'

    if not DRY_RUN:
        with open(path, 'w') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    return stats


def main():
    print('=' * 60)
    print('Block-based Migration (v3.0)')
    print('=' * 60)

    cie_path = os.path.join(ROOT, 'data', 'papers-cie.json')
    edx_path = os.path.join(ROOT, 'data', 'papers-edx.json')

    if DRY_RUN:
        print('[DRY RUN — no files will be modified]\n')

    for label, path, board in [('CIE', cie_path, 'cie'), ('Edexcel', edx_path, 'edx')]:
        if not os.path.exists(path):
            print(f'{label}: file not found, skipping')
            continue
        print(f'\n--- {label} ---')
        stats = migrate_file(path, board)
        for k in sorted(stats.keys()):
            print(f'  {k}: {stats[k]}')

    print('\n' + '=' * 60)
    if DRY_RUN:
        print('Dry run complete. No files modified.')
    else:
        print('Migration complete. Files updated.')
    print('=' * 60)


if __name__ == '__main__':
    main()
