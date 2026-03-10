#!/usr/bin/env python3
r"""
migrate-v4.py — Hierarchical Parts + Subparts + List Blocks

Rebuilds papers-cie.json with proper part/subpart nesting from source LaTeX.
- Parts with \begin{subparts} get `subparts[]` array
- \Marks{n} recovered for all leaf parts
- \begin{itemize} converted to list blocks
- Source not found or part mismatch → keeps v3.0 structure

Usage:
    python3 scripts/migrate-v4.py --dry-run   # preview
    python3 scripts/migrate-v4.py              # apply
"""

import json
import re
import os
import sys
import glob
import argparse
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PAPERS_JSON = PROJECT_ROOT / "data" / "papers-cie.json"
SOURCE_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2/PastPapers")
REPORT_PATH = SCRIPT_DIR / "output" / "migrate-v4-report.json"

# ── Reuse from enrich-answers-cie.py ───────────────────────────────────

LATEX_CLEANUP = [
    (r'cm\$?\^\{?2\}?\$?', 'cm²'),
    (r'km\$?\^\{?2\}?\$?', 'km²'),
    (r'cm\$?\^\{?3\}?\$?', 'cm³'),
    (r'm/s\$?\^\{?2\}?\$?', 'm/s²'),
    (r'm\$?\^\{?2\}?\$?', 'm²'),
    (r'm\$?\^\{?3\}?\$?', 'm³'),
    (r'\$?\^\{?\\circ\}?\$?', '°'),
    (r'\\circ', '°'),
    (r'\\degree', '°'),
    (r'\$?\^2\$?', '²'),
    (r'\$?\^3\$?', '³'),
    (r'\^\{-1\}', '⁻¹'),
    (r'\^\{-2\}', '⁻²'),
    (r'\\text\{([^}]*)\}', r'\1'),
    (r'\\textbf\{([^}]*)\}', r'\1'),
    (r'\\mathrm\{([^}]*)\}', r'\1'),
    (r'\\%', '%'),
    (r'\\\$', '$'),
    (r'\\overrightarrow\{([^}]*)\}', r'\1'),
    (r'\\vec\{([^}]*)\}', r'\1'),
    (r'^\$\s*(.*?)\s*\$$', r'\1'),
]


def clean_latex(s):
    if not s or not s.strip():
        return None
    s = s.strip()
    for pattern, replacement in LATEX_CLEANUP:
        s = re.sub(pattern, replacement, s)
    if s.startswith('$') and s.endswith('$'):
        s = s[1:-1].strip()
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'^([a-zA-Z]\w*(?:⁻¹)?\(?\w*\)?)=\s*$', r'\1 =', s)
    s = re.sub(r'^([a-zA-Z]\w*(?:⁻¹)?\(?\w*\)?)\s+=\s*$', r'\1 =', s)
    return s if s else None


def id_to_source_path(qid):
    parts = qid.split('-')
    if len(parts) != 4:
        return None
    _, session, paper, qnum = parts
    path = SOURCE_ROOT / session / paper / "Questions" / qnum / "QuestionStatement.tex"
    if path.exists():
        return path
    glob_pattern = str(SOURCE_ROOT / session / paper / "Questions" / f"{qnum}*" / "QuestionStatement.tex")
    matches = glob.glob(glob_pattern)
    if matches:
        return Path(matches[0])
    if (SOURCE_ROOT / session).exists():
        for d in (SOURCE_ROOT / session).iterdir():
            if d.is_dir() and d.name.lower() == paper.lower():
                path2 = d / "Questions" / qnum / "QuestionStatement.tex"
                if path2.exists():
                    return path2
    return None


def _match_bracket_arg(text, pos):
    if pos >= len(text) or text[pos] != '[':
        return None, pos
    depth = 0
    start = pos + 1
    i = pos
    while i < len(text):
        ch = text[i]
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                return text[start:i], i + 1
        elif ch == '{':
            bd = 1
            i += 1
            while i < len(text) and bd > 0:
                if text[i] == '{':
                    bd += 1
                elif text[i] == '}':
                    bd -= 1
                i += 1
            continue
        i += 1
    return None, pos


def parse_answerlines(text):
    results = []
    pattern = re.compile(r'\\(AnswerLine(?:Short)?)\s*')
    for m in pattern.finditer(text):
        cmd = m.group(1)
        pos = m.end()
        prefix, pos = _match_bracket_arg(text, pos)
        suffix, pos = _match_bracket_arg(text, pos)
        results.append({
            'cmd': cmd,
            'prefix': prefix,
            'suffix': suffix,
            'raw': text[m.start():pos],
            'start_pos': m.start(),
        })
    return results


# ── Reuse from migrate-hierarchical.py ─────────────────────────────────

COMBINED_ENV_RE = re.compile(
    r'(\\begin\{(?:tabular|align\*?)\}.*?\\end\{(?:tabular|align\*?)\})',
    re.DOTALL
)

# New: itemize environment
ITEMIZE_RE = re.compile(
    r'\\begin\{itemize\}(.*?)\\end\{itemize\}',
    re.DOTALL
)


def tex_to_blocks(tex_str):
    """Split tex string into Block[] — text, table, list blocks."""
    if not tex_str or not tex_str.strip():
        return []

    # First, extract itemize environments
    segments = []
    last = 0
    for m in ITEMIZE_RE.finditer(tex_str):
        before = tex_str[last:m.start()]
        if before.strip():
            segments.append(('tex', before))
        # Parse itemize items
        items_text = m.group(1)
        items = re.split(r'\\item\b\s*', items_text)
        items = [it.strip() for it in items if it.strip()]
        if items:
            segments.append(('list', items))
        last = m.end()
    remaining = tex_str[last:]
    if remaining.strip():
        segments.append(('tex', remaining))

    blocks = []
    for seg_type, seg_content in segments:
        if seg_type == 'list':
            blocks.append({"type": "list", "style": "bullet", "items": seg_content})
        else:
            # Split by tabular/align environments
            parts = COMBINED_ENV_RE.split(seg_content)
            for part in parts:
                if not part.strip():
                    continue
                if part.strip().startswith('\\begin{tabular}'):
                    blocks.append({"type": "table", "content": part.strip()})
                elif part.strip().startswith('\\begin{align'):
                    blocks.append({"type": "text", "content": part.strip()})
                else:
                    cleaned = re.sub(r'\[leftmargin[^\]]*\]', '', part)
                    cleaned = re.sub(r'\\begin\{enumerate\}', '', cleaned)
                    cleaned = re.sub(r'\\end\{enumerate\}', '', cleaned)
                    cleaned = cleaned.strip()
                    if cleaned:
                        blocks.append({"type": "text", "content": cleaned})
    return blocks


def build_answer_from_answerlines(segment):
    """Build answer object from segment's AnswerLine commands.
    Returns answer dict or None."""
    answerlines = parse_answerlines(segment)
    if not answerlines:
        return None

    # Import detect logic from enrich script (simplified inline)
    # Coordinate
    coord_pattern = re.search(r'\(\s*\\AnswerLineShort.*?,\s*\\AnswerLineShort', segment)
    if coord_pattern:
        pairs = re.findall(r'\(\s*\\AnswerLineShort[^)]*,\s*\\AnswerLineShort[^)]*\)', segment)
        n = len(pairs) if pairs else 1
        if n == 1:
            return {'type': 'coordinate', 'fields': 2, 'layout': 'row', 'template': '( ____ , ____ )'}
        return {'type': 'coordinate', 'fields': n * 2, 'layout': 'row',
                'template': ' and '.join(['( ____ , ____ )'] * n)}

    # Vector
    for al in answerlines:
        raw = (al['prefix'] or '') + (al['suffix'] or '') + al['raw']
        if 'pmatrix' in raw:
            fields = 2
            bc = ((al['prefix'] or '') + (al['suffix'] or '')).count('\\\\')
            if bc > 0:
                fields = bc + 1
            return {'type': 'vector', 'fields': fields, 'layout': 'column'}

    # Ratio
    if re.search(r'\\AnswerLineShort.*?\]\s*(?:\\text\{:\}|:)\s*\\AnswerLineShort', segment):
        n = max(len([a for a in answerlines if a['cmd'] == 'AnswerLineShort']), 2)
        return {'type': 'expression', 'fields': n, 'layout': 'row', 'template': ' : '.join(['____'] * n)}

    # Table input
    if r'\begin{tabular' in segment or r'\begin{array' in segment:
        return {'type': 'table_input'}

    # Or pattern
    if re.search(r'\\AnswerLine(?:Short)?\b.*?\bor\b.*?\\AnswerLine(?:Short)?\b', segment, re.IGNORECASE):
        prefixes = [clean_latex(al['prefix']) for al in answerlines if al['prefix']]
        if prefixes:
            parts = [f"{p} ____" for p in prefixes]
            tpl = ' or '.join(parts) if len(parts) > 1 else ' or '.join(parts + ['____'])
        else:
            tpl = ' or '.join(['____'] * len(answerlines))
        return {'type': 'expression', 'fields': len(answerlines), 'layout': 'row', 'template': tpl}

    # Dotfill coordinate
    for al in answerlines:
        prefix_str = al['prefix'] or ''
        if 'dotfill' in prefix_str and ',' in prefix_str:
            return {'type': 'coordinate', 'fields': 2, 'layout': 'row', 'template': '( ____ , ____ )'}

    # Multiple AnswerLine
    full_lines = [al for al in answerlines if al['cmd'] == 'AnswerLine']
    short_lines = [al for al in answerlines if al['cmd'] == 'AnswerLineShort']

    if len(full_lines) >= 2:
        lines = []
        for al in full_lines:
            p = clean_latex(al['prefix']) or ''
            s = clean_latex(al['suffix']) or ''
            line = f"{p} ____" if p else "____"
            if s:
                line += f" {s}"
            lines.append(line.strip())
        return {'type': 'multiline', 'lines': len(full_lines), 'layout': 'column', 'template': '\\n'.join(lines)}

    if len(short_lines) >= 2 and len(full_lines) == 0:
        return {'type': 'expression', 'fields': len(short_lines), 'layout': 'row'}

    # Single
    al = answerlines[0]
    prefix = clean_latex(al['prefix'])
    suffix = clean_latex(al['suffix'])
    answer = {'type': 'number'}
    if prefix:
        answer['prefix'] = prefix
    if suffix:
        answer['suffix'] = suffix
    return answer


# ── Hierarchical parser ────────────────────────────────────────────────

def extract_marks(text):
    """Extract \\Marks{n} from text. Returns (marks, text_without_marks)."""
    m = re.search(r'\\Marks\{(\d+)\}', text)
    if m:
        marks = int(m.group(1))
        cleaned = text[:m.start()] + text[m.end():]
        return marks, cleaned
    # Fallback: inline [n] at end of line (like \hfill [5])
    m = re.search(r'\[(\d+)\]\s*$', text.strip())
    if m:
        marks = int(m.group(1))
        # Only use this if it looks like a marks indicator (not array notation)
        if marks <= 20:
            cleaned = text[:text.rfind('[' + m.group(1) + ']')]
            return marks, cleaned
    return 0, text


def parse_parts_hierarchical(tex_content):
    """Parse source LaTeX into hierarchical Part tree.

    Returns: list of dicts:
      {"text": str, "marks": int, "subparts": None|list, "has_subparts": bool}
    where subparts are:
      {"text": str, "marks": int}
    """
    # Find \begin{parts}...\end{parts} — may have multiple (like Q10 with info + question parts)
    parts_envs = list(re.finditer(
        r'\\begin\{parts\}(.*?)\\end\{parts\}', tex_content, re.DOTALL
    ))

    if not parts_envs:
        return None  # No parts environment

    # Use the LAST parts environment that has actual \item/\part commands
    # (first one might be informational like "the range is 27")
    target_env = None
    for env in reversed(parts_envs):
        content = env.group(1)
        if re.search(r'\\(?:item|part)\b', content):
            # Check if it has answer-related content (AnswerLine, Marks, answerlines, dotfill, etc.)
            if re.search(r'\\(?:AnswerLine|Marks|answerlines|hfill|Answerspace)', content) or \
               re.search(r'\[(?:\d+)\]', content):
                target_env = content
                break
    if target_env is None:
        # Fallback: use last env with items
        for env in reversed(parts_envs):
            if re.search(r'\\(?:item|part)\b', env.group(1)):
                target_env = env.group(1)
                break
    if target_env is None:
        return None

    return _parse_items(target_env)


def _parse_items(content):
    """Split content by \\item/\\part commands and parse each.
    Protects \\begin{subparts}...\\end{subparts} from being split."""
    # Step 1: Replace subparts environments with placeholders
    subparts_store = []
    def _replace_subparts(m):
        idx = len(subparts_store)
        subparts_store.append(m.group(1))
        return f'__SUBPARTS_{idx}__'

    protected = re.sub(
        r'\\begin\{subparts\}(.*?)\\end\{subparts\}',
        _replace_subparts, content, flags=re.DOTALL
    )

    # Step 2: Split on \item or \part (now safe from subpart items)
    items = re.split(r'\\(?:item|part)\b', protected)
    result = []

    for item_text in items[1:]:  # Skip text before first \item
        # Check for subparts placeholder
        sp_match = re.search(r'__SUBPARTS_(\d+)__', item_text)
        if sp_match:
            idx = int(sp_match.group(1))
            sub_content = subparts_store[idx]

            # Text before subparts is the parent part's content
            before = item_text[:sp_match.start()].strip()
            after = item_text[sp_match.end():].strip()

            # Parse subparts
            subparts = _parse_subpart_items(sub_content)

            result.append({
                'text': before,
                'marks': 0,
                'subparts': subparts,
                'has_subparts': True,
                'after_text': after,
            })
        else:
            marks, cleaned = extract_marks(item_text)
            result.append({
                'text': cleaned.strip(),
                'marks': marks,
                'subparts': None,
                'has_subparts': False,
            })

    return result


def _parse_subpart_items(content):
    """Parse subpart items from \\begin{subparts} content."""
    items = re.split(r'\\(?:item|subpart)\b', content)
    result = []
    for item_text in items[1:]:
        marks, cleaned = extract_marks(item_text)
        result.append({
            'text': cleaned.strip(),
            'marks': marks,
        })
    return result


def flatten_part_tree(tree):
    """Flatten hierarchical tree to count leaf parts (for matching with JSON)."""
    count = 0
    for part in tree:
        if part['has_subparts'] and part['subparts']:
            # Container part (marks=0) + subparts = 1 + len(subparts)
            count += 1 + len(part['subparts'])
        else:
            count += 1
    return count


def leaf_count(tree):
    """Count total leaf (answerable) parts."""
    count = 0
    for part in tree:
        if part['has_subparts'] and part['subparts']:
            count += len(part['subparts'])
        else:
            count += 1
    return count


# ── Clean content text ─────────────────────────────────────────────────

def clean_content_text(text):
    """Clean LaTeX content for block conversion:
    Remove answer line commands, spacing commands, etc."""
    # Remove \AnswerLine[...][...] and \AnswerLineShort[...][...]
    text = re.sub(r'\\AnswerLine(?:Short)?\s*(?:\[[^\]]*\])?\s*(?:\[[^\]]*\])?', '', text)
    # Remove \answerlines[n]
    text = re.sub(r'\\answerlines\s*(?:\[\d+\])?', '', text)
    # Remove \Answerspace[...]
    text = re.sub(r'\\Answerspace\s*(?:\[[^\]]*\])?', '', text)
    # Remove \hfill
    text = re.sub(r'\\hfill\s*', '', text)
    # Remove \vgap[...] / \vgap
    text = re.sub(r'\\vgap\s*(?:\[[^\]]*\])?', '', text)
    # Remove vertical spacing
    text = re.sub(r'\\\\\[[\d.]+(?:cm|em|mm)\]', '', text)
    # Remove \hspace{...}
    text = re.sub(r'\\hspace\{[^}]*\}', '', text)
    # Remove \vspace{...}
    text = re.sub(r'\\vspace\{[^}]*\}', '', text)
    # Remove \renewcommand{...}{...}
    text = re.sub(r'\\renewcommand\{[^}]*\}\{[^}]*\}', '', text)
    # Remove \relinput{...}
    text = re.sub(r'\\relinput\{[^}]*\}', '', text)
    # Remove leftover inline marks like [5] at end
    text = re.sub(r'\s*\[\d+\]\s*$', '', text.strip())
    # Clean leftmargin options
    text = re.sub(r'\[leftmargin[^\]]*\]', '', text)
    # Clean label options
    text = re.sub(r'\[label=[^\]]*\]', '', text)
    # Collapse whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# ── Migration logic ────────────────────────────────────────────────────

def migrate_question(question, report):
    """Migrate a single question from v3.0 flat to v4.0 hierarchical.
    Returns True if modified."""
    qid = question['id']
    json_parts = question.get('parts', [])
    if not json_parts:
        return False  # No parts to restructure

    # Check if any part has marks=0 (potential container)
    has_zero = any(p.get('marks', 0) == 0 for p in json_parts)
    if not has_zero:
        return False  # All parts have marks, no need to restructure

    source_path = id_to_source_path(qid)
    if not source_path:
        report['source_not_found'] += 1
        return False

    try:
        tex_content = source_path.read_text(encoding='utf-8')
    except Exception:
        report['parse_failed'] += 1
        return False

    report['source_found'] += 1

    # Parse hierarchical structure from source
    tree = parse_parts_hierarchical(tex_content)
    if tree is None:
        report['no_parts_env'] += 1
        return False

    # Validate: flatten tree and match with JSON part count
    flat_count = flatten_part_tree(tree)
    json_count = len(json_parts)

    if flat_count != json_count:
        report['part_mismatch'] += 1
        report['mismatch_details'].append({
            'id': qid,
            'json': json_count,
            'tree_flat': flat_count,
            'tree_parts': len(tree),
        })
        question['_v4_skip'] = True
        return False

    # Check that tree actually has subparts
    has_subparts = any(p['has_subparts'] for p in tree)
    if not has_subparts:
        return False  # No subparts to restructure

    # Build new parts array
    new_parts = []
    json_idx = 0  # Index into flat json_parts

    for tree_part in tree:
        if tree_part['has_subparts'] and tree_part['subparts']:
            # Container part — take the JSON container part
            container_json = json_parts[json_idx]
            json_idx += 1

            # Build content blocks from tree part text
            content_text = clean_content_text(tree_part['text'])
            content_blocks = tex_to_blocks(content_text) if content_text else []

            # Build subparts from next N JSON parts
            subparts = []
            for sp_tree in tree_part['subparts']:
                if json_idx >= json_count:
                    break
                sp_json = json_parts[json_idx]
                json_idx += 1

                # Build subpart content from tree text
                sp_content_text = clean_content_text(sp_tree['text'])
                sp_blocks = tex_to_blocks(sp_content_text) if sp_content_text else []

                # Use marks from tree (source), fallback to JSON
                sp_marks = sp_tree['marks'] if sp_tree['marks'] > 0 else sp_json.get('marks', 0)

                # Build answer from source text
                sp_answer = build_answer_from_answerlines(sp_tree['text'])
                if sp_answer is None:
                    sp_answer = sp_json.get('answer', {'type': 'number'})

                # Determine subpart label
                roman_idx = len(subparts)
                roman_labels = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)']
                sp_label = roman_labels[roman_idx] if roman_idx < len(roman_labels) else f'({roman_idx + 1})'

                sp_obj = {
                    'label': sp_label,
                    'marks': sp_marks,
                    'content': sp_blocks if sp_blocks else sp_json.get('content', []),
                    'answer': sp_answer,
                }
                subparts.append(sp_obj)

                if sp_marks > 0 and sp_json.get('marks', 0) == 0:
                    report['marks_recovered'] += 1
                report['subparts_total'] += 1

            # Container part object
            new_part = {
                'label': container_json['label'],
                'content': content_blocks if content_blocks else container_json.get('content', []),
                'subparts': subparts,
            }
            new_parts.append(new_part)
            report['hierarchical_converted'] += 1

        else:
            # Regular part — keep as-is from JSON
            regular = json_parts[json_idx]
            json_idx += 1

            # Recover marks from tree if JSON has 0
            if regular.get('marks', 0) == 0 and tree_part['marks'] > 0:
                regular['marks'] = tree_part['marks']
                report['marks_recovered'] += 1

            new_parts.append(regular)

    question['parts'] = new_parts
    return True


def add_list_blocks_from_source(question, report):
    """Re-parse source LaTeX for questions with itemize, rebuild blocks with list type.
    Only processes questions whose source contains \\begin{itemize}.
    Returns True if any list blocks were added."""
    source_path = id_to_source_path(question['id'])
    if not source_path:
        return False

    try:
        tex_content = source_path.read_text(encoding='utf-8')
    except Exception:
        return False

    if r'\begin{itemize}' not in tex_content:
        return False

    modified = False

    # Extract stem text (everything before \begin{parts})
    parts_match = re.search(r'\\begin\{parts\}', tex_content)
    if parts_match:
        stem_text = tex_content[:parts_match.start()]
    else:
        stem_text = tex_content

    # Remove question wrapper
    stem_text = re.sub(r'\\begin\{question\}\{[^}]*\}', '', stem_text)
    stem_text = re.sub(r'\\end\{question\}', '', stem_text)

    if r'\begin{itemize}' in stem_text:
        cleaned = clean_content_text(stem_text)
        new_blocks = tex_to_blocks(cleaned)
        list_blocks = [b for b in new_blocks if b.get('type') == 'list']
        if list_blocks:
            # Rebuild stem: keep existing non-text blocks (figures), add new blocks
            existing_non_text = [b for b in question.get('stem', []) if b.get('type') != 'text']
            question['stem'] = new_blocks + existing_non_text
            report['list_blocks_added'] += len(list_blocks)
            modified = True

    # Check part-level itemize content
    for part in question.get('parts', []):
        part_content = part.get('content', [])
        # Check if any existing text block content, when combined with source, has itemize
        # For simplicity, check if source part segments have itemize
        # This is harder to do without re-parsing parts from source; skip for now
        pass

    return modified


# ── Main ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='v4.0 Hierarchical Parts Migration')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    print(f"Loading {PAPERS_JSON}...")
    with open(PAPERS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    total = len(questions)

    report = {
        'total_questions': total,
        'source_found': 0,
        'source_not_found': 0,
        'parse_failed': 0,
        'no_parts_env': 0,
        'part_mismatch': 0,
        'hierarchical_converted': 0,
        'subparts_total': 0,
        'marks_recovered': 0,
        'list_blocks_added': 0,
        'questions_modified': 0,
        'list_questions_modified': 0,
        'mismatch_details': [],
    }

    # Step 1: Hierarchical migration
    for i, q in enumerate(questions):
        if (i + 1) % 500 == 0:
            print(f"  Processing {i+1}/{total}...")
        if migrate_question(q, report):
            report['questions_modified'] += 1

    # Step 2: List block conversion from source LaTeX (all questions)
    for q in questions:
        if add_list_blocks_from_source(q, report):
            report['list_questions_modified'] += 1

    # Update version
    data['v'] = '4.0'

    # Report
    print(f"\n{'='*60}")
    print(f"  V4.0 MIGRATION REPORT {'(DRY RUN)' if args.dry_run else ''}")
    print(f"{'='*60}")
    print(f"  Total questions:       {total}")
    print(f"  Source found:          {report['source_found']}")
    print(f"  Source not found:      {report['source_not_found']}")
    print(f"  Parse failed:          {report['parse_failed']}")
    print(f"  No parts env:          {report['no_parts_env']}")
    print(f"  Part mismatch:         {report['part_mismatch']}")
    print(f"  Questions modified:    {report['questions_modified']}")
    print(f"  Hierarchical parts:    {report['hierarchical_converted']}")
    print(f"  Subparts total:        {report['subparts_total']}")
    print(f"  Marks recovered:       {report['marks_recovered']}")
    print(f"  List blocks added:     {report['list_blocks_added']}")
    print(f"  List questions:        {report['list_questions_modified']}")

    if report['mismatch_details']:
        print(f"\n  Part mismatches (first 20):")
        for mm in report['mismatch_details'][:20]:
            print(f"    {mm['id']}: JSON={mm['json']} tree={mm['tree_flat']} parts={mm['tree_parts']}")

    # Verify: count remaining marks=0
    remaining_zero = 0
    for q in questions:
        for p in q.get('parts', []):
            if not p.get('subparts') and p.get('marks', 0) == 0:
                remaining_zero += 1
    print(f"\n  Remaining marks=0 leaf parts: {remaining_zero}")

    # Count questions with subparts
    with_subparts = sum(1 for q in questions
                        if any(p.get('subparts') for p in q.get('parts', [])))
    print(f"  Questions with subparts:      {with_subparts}")

    # Save report
    os.makedirs(REPORT_PATH.parent, exist_ok=True)
    report_out = dict(report)
    if len(report_out['mismatch_details']) > 50:
        report_out['mismatch_sample'] = report_out['mismatch_details'][:50]
        report_out['mismatch_total'] = len(report_out['mismatch_details'])
        del report_out['mismatch_details']
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(report_out, f, indent=2, ensure_ascii=False)
    print(f"\n  Report: {REPORT_PATH}")

    # Write
    if not args.dry_run:
        print(f"\n  Writing {PAPERS_JSON}...")
        with open(PAPERS_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print("  Done!")
    else:
        print(f"\n  DRY RUN — no files modified.")


if __name__ == '__main__':
    main()
