#!/usr/bin/env python3
r"""
CIE 真题数据库 Answer 元数据富化 (Phase 1)

从源 LaTeX 文件提取 \AnswerLine[prefix][suffix] 等命令的元数据，
富化 papers-cie.json 中的 answer 对象。

Usage:
    python3 scripts/enrich-answers-cie.py --dry-run   # 预览变更，不写文件
    python3 scripts/enrich-answers-cie.py              # 正式运行
"""

import json
import re
import os
import sys
import glob
import argparse
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PAPERS_JSON = PROJECT_ROOT / "data" / "papers-cie.json"
SOURCE_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2/PastPapers")
REPORT_PATH = SCRIPT_DIR / "output" / "enrich-cie-report.json"

# ── LaTeX → Unicode cleanup maps ─────────────────────────────────────────────
LATEX_CLEANUP = [
    # Superscripts with units (must come before generic superscript rules)
    (r'cm\$?\^\{?2\}?\$?', 'cm²'),
    (r'km\$?\^\{?2\}?\$?', 'km²'),
    (r'cm\$?\^\{?3\}?\$?', 'cm³'),
    (r'm/s\$?\^\{?2\}?\$?', 'm/s²'),
    (r'm\$?\^\{?2\}?\$?', 'm²'),
    (r'm\$?\^\{?3\}?\$?', 'm³'),
    # Degree symbol variants
    (r'\$?\^\{?\\circ\}?\$?', '°'),
    (r'\\circ', '°'),
    (r'\\degree', '°'),
    # Generic superscripts
    (r'\$?\^2\$?', '²'),
    (r'\$?\^3\$?', '³'),
    (r'\^\{-1\}', '⁻¹'),
    (r'\^\{-2\}', '⁻²'),
    # LaTeX text commands
    (r'\\text\{([^}]*)\}', r'\1'),
    (r'\\textbf\{([^}]*)\}', r'\1'),
    (r'\\mathrm\{([^}]*)\}', r'\1'),
    # Special chars
    (r'\\%', '%'),
    (r'\\\$', '$'),
    # Overrightarrow → plain
    (r'\\overrightarrow\{([^}]*)\}', r'\1'),
    (r'\\vec\{([^}]*)\}', r'\1'),
    # Strip math-mode delimiters (outermost $ pair)
    (r'^\$\s*(.*?)\s*\$$', r'\1'),
]


def clean_latex(s):
    """Convert LaTeX prefix/suffix to clean Unicode text."""
    if not s or not s.strip():
        return None
    s = s.strip()
    for pattern, replacement in LATEX_CLEANUP:
        s = re.sub(pattern, replacement, s)
    # Strip remaining $ delimiters
    if s.startswith('$') and s.endswith('$'):
        s = s[1:-1].strip()
    # Normalize whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    # Normalize "var =" spacing: "x=" → "x ="
    s = re.sub(r'^([a-zA-Z]\w*(?:⁻¹)?\(?\w*\)?)=\s*$', r'\1 =', s)
    s = re.sub(r'^([a-zA-Z]\w*(?:⁻¹)?\(?\w*\)?)\s+=\s*$', r'\1 =', s)
    return s if s else None


# ── Parse \AnswerLine[prefix][suffix] ─────────────────────────────────────────

# Match \AnswerLine[...][...] or \AnswerLineShort[...][...]
# The optional args use [...] syntax; we need to handle nested braces inside
def _match_bracket_arg(text, pos):
    """Extract content of [...] starting at pos. Returns (content, end_pos) or (None, pos)."""
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
            # Skip brace groups
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
    """Parse all \\AnswerLine and \\AnswerLineShort commands from text.
    Returns list of dicts with keys: cmd, prefix, suffix, raw, start_pos."""
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


# ── Split LaTeX into parts/subparts ───────────────────────────────────────────

def split_into_parts(text):
    r"""Split a question's LaTeX into per-part segments.
    Returns a flat list of segment strings (subparts expanded inline).
    If no \begin{parts} or \begin{subparts}, returns [text] (single segment).
    Handles multiple \begin{parts} environments (concatenates their items).
    """
    segments = []

    # Find ALL \begin{parts}...\end{parts} environments
    parts_envs = list(re.finditer(
        r'\\begin\{parts\}(.*?)\\end\{parts\}', text, re.DOTALL
    ))

    # Also find top-level \begin{subparts} (without \begin{parts} wrapper)
    if not parts_envs:
        subparts_envs = list(re.finditer(
            r'\\begin\{subparts\}(.*?)\\end\{subparts\}', text, re.DOTALL
        ))
        if subparts_envs:
            for env in subparts_envs:
                _split_items(env.group(1), segments, is_subpart=True)
            return segments if segments else [text]
        return [text]

    # Process each \begin{parts} environment
    for env in parts_envs:
        content = env.group(1)
        # Skip environments with only enumlist options (e.g., [leftmargin=...])
        stripped = content.strip()
        if stripped.startswith('[') and r'\item' not in content and r'\part' not in content:
            continue
        _split_items(content, segments, is_subpart=False)

    return segments if segments else [text]


def _split_items(content, segments, is_subpart):
    """Split content by \\item commands, expanding subparts inline."""
    # Split on \item (which may also be \part in some files)
    # Use \item as the primary splitter
    items = re.split(r'\\(?:item|part)\b', content)

    for item_text in items[1:]:  # Skip text before first \item
        # Check for subparts
        subparts_match = re.search(
            r'\\begin\{subparts\}(.*?)\\end\{subparts\}',
            item_text, re.DOTALL
        )
        if subparts_match:
            # Text before subparts belongs to the parent part (container)
            before = item_text[:subparts_match.start()]
            # If the parent part itself has answer lines before subparts, add it
            parent_anslines = parse_answerlines(before)
            if parent_anslines:
                segments.append(before)
            else:
                # Parent is a container with 0 marks — add placeholder
                segments.append(before)

            # Expand subparts inline
            sub_content = subparts_match.group(1)
            _split_items(sub_content, segments, is_subpart=True)

            # Text after subparts (rare)
            after = item_text[subparts_match.end():]
            after_anslines = parse_answerlines(after)
            if after_anslines:
                segments.append(after)
        else:
            segments.append(item_text)


# ── Pattern detection (priority order) ────────────────────────────────────────

def detect_answer_pattern(segment, answerlines):
    r"""Analyze a segment and its answer lines to determine the answer type.

    Priority order:
    1. coordinate — (\AnswerLineShort, \AnswerLineShort)
    2. vector — pmatrix in prefix or suffix
    3. ratio — \AnswerLineShort : \AnswerLineShort
    4. table_input — \begin{tabular} with \AnswerLine inside
    5. multi-field (multiline) — multiple \AnswerLine with different prefixes
    6. single number — plain \AnswerLine[prefix][suffix]

    Returns: (answer_obj, source_pattern, confidence)
    """
    if not answerlines:
        return None, 'no_answerline', 'none'

    # ── 1. Coordinate: (\AnswerLineShort, \AnswerLineShort) ──
    coord_pattern = re.search(
        r'\(\s*\\AnswerLineShort.*?,\s*\\AnswerLineShort',
        segment
    )
    if coord_pattern:
        # Count how many coordinate pairs
        coord_pairs = re.findall(
            r'\(\s*\\AnswerLineShort[^)]*,\s*\\AnswerLineShort[^)]*\)',
            segment
        )
        n_pairs = len(coord_pairs)
        if n_pairs == 1:
            return {
                'type': 'coordinate',
                'fields': 2,
                'layout': 'row',
                'template': '( ____ , ____ )',
            }, 'coordinate_pair', 'high'
        elif n_pairs == 2:
            # Two coordinate pairs, e.g. "( __ , __ ) and ( __ , __ )"
            return {
                'type': 'coordinate',
                'fields': 4,
                'layout': 'row',
                'template': '( ____ , ____ ) and ( ____ , ____ )',
            }, 'coordinate_pair_double', 'high'
        else:
            return {
                'type': 'coordinate',
                'fields': n_pairs * 2,
                'layout': 'row',
                'template': ' and '.join(['( ____ , ____ )'] * n_pairs),
            }, 'coordinate_pair_multi', 'medium'

    # ── 2. Vector: pmatrix in prefix or suffix ──
    for al in answerlines:
        prefix_str = al['prefix'] or ''
        suffix_str = al['suffix'] or ''
        raw = al['raw']
        if 'pmatrix' in prefix_str or 'pmatrix' in suffix_str or 'pmatrix' in raw:
            # Determine number of fields by counting \\ or \AnswerLineShort in pmatrix
            fields = 2  # default
            pmatrix_text = prefix_str + suffix_str
            backslash_count = pmatrix_text.count('\\\\')
            if backslash_count > 0:
                fields = backslash_count + 1
            return {
                'type': 'vector',
                'fields': fields,
                'layout': 'column',
            }, 'vector_pmatrix', 'high'

    # ── 3. Ratio: \AnswerLineShort : \AnswerLineShort ──
    ratio_pattern = re.search(
        r'\\AnswerLineShort\b.*?(?:\\text\{:\}|(?<!\w):\s*(?!\\)|(?:\]\s*:\s*))'
        r'.*?\\AnswerLineShort\b',
        segment
    )
    if not ratio_pattern:
        # Simpler pattern: look for : between two AnswerLineShort
        ratio_pattern = re.search(
            r'\\AnswerLineShort.*?\]\s*(?:\\text\{:\}|:)\s*\\AnswerLineShort',
            segment
        )
    if ratio_pattern:
        # Count how many ratio fields
        short_count = len([al for al in answerlines if al['cmd'] == 'AnswerLineShort'])
        fields = max(short_count, 2)
        return {
            'type': 'expression',
            'fields': fields,
            'layout': 'row',
            'template': ' : '.join(['____'] * fields),
        }, 'ratio_pair', 'high'

    # ── 4. Table input: \begin{tabular} with \AnswerLine ──
    if r'\begin{tabular' in segment or r'\begin{array' in segment:
        table_anslines = [al for al in answerlines
                          if al['start_pos'] > segment.find(r'\begin{tabul')]
        if table_anslines or answerlines:
            return {
                'type': 'table_input',
            }, 'table_with_answerlines', 'medium'

    # ── 5. "or" pattern: x = ___ or x = ___ ──
    or_pattern = re.search(
        r'\\AnswerLine(?:Short)?\b.*?\bor\b.*?\\AnswerLine(?:Short)?\b',
        segment, re.IGNORECASE
    )
    if or_pattern:
        # Extract prefixes from answerlines
        prefixes = [clean_latex(al['prefix']) for al in answerlines if al['prefix']]
        if prefixes:
            parts = [f"{p} ____" for p in prefixes]
            template = ' or '.join(parts) if len(parts) > 1 else ' or '.join(parts + ['____'])
        else:
            template = ' or '.join(['____'] * len(answerlines))
        return {
            'type': 'expression',
            'fields': len(answerlines),
            'layout': 'row',
            'template': template,
        }, 'or_pattern', 'high'

    # ── 6. Dotfill coordinate in prefix: (\dotfill, \dotfill) ──
    for al in answerlines:
        prefix_str = al['prefix'] or ''
        if 'dotfill' in prefix_str and ',' in prefix_str:
            return {
                'type': 'coordinate',
                'fields': 2,
                'layout': 'row',
                'template': '( ____ , ____ )',
            }, 'coordinate_dotfill_prefix', 'high'
        # Multi-answer in single prefix: $x=$ \dotfill or $x=$ \dotfill
        if 'dotfill' in prefix_str and 'or' in prefix_str:
            return {
                'type': 'expression',
                'fields': 2,
                'layout': 'row',
                'template': prefix_str.replace('\\dotfill', '____').replace('\\ ', ' '),
            }, 'multi_answer_prefix', 'medium'

    # ── 7. "because" / reason pattern ──
    if r'\AnswerReason' in segment or ('because' in segment.lower() and 'dotfill' in segment):
        return None, 'reason_pattern', 'skip'  # These are explanation-type, no enrichment

    # ── 8. Multiple AnswerLine in same segment ──
    full_lines = [al for al in answerlines if al['cmd'] == 'AnswerLine']
    short_lines = [al for al in answerlines if al['cmd'] == 'AnswerLineShort']

    if len(full_lines) >= 2:
        # Multiple full AnswerLine — likely multiline answers
        prefixes = [clean_latex(al['prefix']) for al in full_lines]
        suffixes = [clean_latex(al['suffix']) for al in full_lines]
        has_distinct_prefixes = len(set(p for p in prefixes if p)) > 1

        if has_distinct_prefixes:
            # Genuine multiline: different variable prefixes
            lines = []
            for al in full_lines:
                p = clean_latex(al['prefix']) or ''
                s = clean_latex(al['suffix']) or ''
                line = f"{p} ____" if p else "____"
                if s:
                    line += f" {s}"
                lines.append(line.strip())
            return {
                'type': 'multiline',
                'lines': len(full_lines),
                'layout': 'column',
                'template': '\\n'.join(lines),
            }, 'multiline_distinct_prefix', 'high'
        else:
            # Same or no prefix — could be multi-answer or scaffold
            lines = []
            for al in full_lines:
                p = clean_latex(al['prefix']) or ''
                s = clean_latex(al['suffix']) or ''
                line = f"{p} ____" if p else "____"
                if s:
                    line += f" {s}"
                lines.append(line.strip())
            return {
                'type': 'multiline',
                'lines': len(full_lines),
                'layout': 'column',
                'template': '\\n'.join(lines),
            }, 'multiline_same_prefix', 'medium'

    if len(short_lines) >= 2 and len(full_lines) == 0:
        # Multiple AnswerLineShort without coordinate/ratio context
        # Likely inline multi-field
        return {
            'type': 'expression',
            'fields': len(short_lines),
            'layout': 'row',
        }, 'multi_short_inline', 'medium'

    # ── 9. Single AnswerLine or AnswerLineShort ──
    al = answerlines[0]
    prefix = clean_latex(al['prefix'])
    suffix = clean_latex(al['suffix'])

    answer = {'type': 'number'}
    if prefix:
        answer['prefix'] = prefix
    if suffix:
        answer['suffix'] = suffix

    pattern_name = 'single_answerline'
    if prefix and suffix:
        pattern_name = 'single_prefix_suffix'
    elif prefix:
        pattern_name = 'single_prefix'
    elif suffix:
        pattern_name = 'single_suffix'
    else:
        pattern_name = 'single_plain'

    return answer, pattern_name, 'high'


# ── ID → source file mapping ─────────────────────────────────────────────────

def id_to_source_path(qid):
    """Map a question ID to its QuestionStatement.tex path.
    ID format: 0580-{session}-Paper{##}-Q{##}
    Returns Path or None.
    """
    parts = qid.split('-')
    if len(parts) != 4:
        return None
    _, session, paper, qnum = parts
    # paper is like "Paper11", "Paper1"
    # qnum is like "Q07"
    path = SOURCE_ROOT / session / paper / "Questions" / qnum / "QuestionStatement.tex"
    if path.exists():
        return path

    # Fallback: try glob search
    glob_pattern = str(SOURCE_ROOT / session / paper / "Questions" / f"{qnum}*" / "QuestionStatement.tex")
    matches = glob.glob(glob_pattern)
    if matches:
        return Path(matches[0])

    # Fallback 2: case-insensitive paper match
    if (SOURCE_ROOT / session).exists():
        for d in (SOURCE_ROOT / session).iterdir():
            if d.is_dir() and d.name.lower() == paper.lower():
                path2 = d / "Questions" / qnum / "QuestionStatement.tex"
                if path2.exists():
                    return path2

    return None


# ── Core enrichment logic ─────────────────────────────────────────────────────

def is_default_answer(ans):
    """Check if an answer object is the default {"type":"number"} with no metadata."""
    if not ans or not isinstance(ans, dict):
        return True
    if ans.get('type', 'number') != 'number':
        return False
    # Has prefix, suffix, or other non-default fields
    if ans.get('prefix') or ans.get('suffix') or ans.get('template') or ans.get('fields'):
        return False
    return True


def enrich_question(question, report):
    """Enrich a single question's answer(s) from its source LaTeX.
    Returns True if any modification was made.
    """
    qid = question['id']
    source_path = id_to_source_path(qid)

    if not source_path:
        report['source_missing'] += 1
        report['missing_ids'].append(qid)
        return False

    report['source_found'] += 1

    try:
        tex_content = source_path.read_text(encoding='utf-8')
    except Exception as e:
        report['parse_failed'] += 1
        report['parse_errors'].append({'id': qid, 'error': str(e)})
        return False

    has_parts = bool(question.get('parts'))
    modified = False

    if not has_parts:
        # No parts — single answer at top level
        answer = question.get('answer', {})
        if not is_default_answer(answer):
            report['overrides_skipped'] += 1
            return False

        answerlines = parse_answerlines(tex_content)
        if not answerlines:
            report['enriched']['no_answerline_in_source'] += 1
            return False

        new_answer, pattern, confidence = detect_answer_pattern(tex_content, answerlines)
        report['matched_by_pattern'][pattern] = report['matched_by_pattern'].get(pattern, 0) + 1

        if new_answer and confidence != 'skip':
            if not is_default_answer(new_answer):
                question['answer'] = new_answer
                _count_enrichment(new_answer, report)
                modified = True

    else:
        # Has parts — enrich each part
        segments = split_into_parts(tex_content)

        # Match segments to JSON parts
        json_parts = question['parts']
        n_json = len(json_parts)
        n_tex = len(segments)

        if n_json != n_tex:
            report['part_count_mismatch'] += 1
            report['mismatch_details'].append({
                'id': qid,
                'json_parts': n_json,
                'tex_segments': n_tex,
            })
            # Safety: skip enrichment for mismatched questions to avoid
            # assigning wrong metadata to wrong parts
            return False

        for i in range(n_json):
            part = json_parts[i]
            answer = part.get('answer', {})

            if not is_default_answer(answer):
                report['overrides_skipped'] += 1
                continue

            segment = segments[i]
            answerlines = parse_answerlines(segment)

            if not answerlines:
                report['enriched']['no_answerline_in_source'] += 1
                continue

            new_answer, pattern, confidence = detect_answer_pattern(segment, answerlines)
            report['matched_by_pattern'][pattern] = report['matched_by_pattern'].get(pattern, 0) + 1

            if new_answer and confidence != 'skip':
                if not is_default_answer(new_answer):
                    part['answer'] = new_answer
                    _count_enrichment(new_answer, report)
                    modified = True

    return modified


def _count_enrichment(answer, report):
    """Update enrichment counters for a new answer object."""
    t = answer.get('type', 'number')
    if answer.get('prefix'):
        report['enriched']['prefix_added'] += 1
    if answer.get('suffix'):
        report['enriched']['suffix_added'] += 1
    type_key = f'type_{t}'
    report['enriched'][type_key] = report['enriched'].get(type_key, 0) + 1


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Enrich CIE papers answer metadata')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without writing files')
    args = parser.parse_args()

    # Load papers-cie.json
    print(f"Loading {PAPERS_JSON}...")
    with open(PAPERS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']
    total_questions = len(questions)
    total_parts = sum(len(q.get('parts', [])) for q in questions)

    print(f"Total questions: {total_questions}, total parts: {total_parts}")

    # Initialize report
    report = {
        'total_questions': total_questions,
        'total_parts': total_parts,
        'source_found': 0,
        'source_missing': 0,
        'part_count_mismatch': 0,
        'parse_failed': 0,
        'overrides_skipped': 0,
        'questions_modified': 0,
        'enriched': {
            'prefix_added': 0,
            'suffix_added': 0,
            'no_answerline_in_source': 0,
        },
        'matched_by_pattern': {},
        'missing_ids': [],
        'mismatch_details': [],
        'parse_errors': [],
    }

    # Process each question
    for i, q in enumerate(questions):
        if (i + 1) % 500 == 0:
            print(f"  Processing {i+1}/{total_questions}...")

        if enrich_question(q, report):
            report['questions_modified'] += 1

    # Summary
    print(f"\n{'='*60}")
    print(f"  ENRICHMENT REPORT {'(DRY RUN)' if args.dry_run else ''}")
    print(f"{'='*60}")
    print(f"  Questions:        {total_questions}")
    print(f"  Parts:            {total_parts}")
    print(f"  Source found:     {report['source_found']}")
    print(f"  Source missing:   {report['source_missing']}")
    print(f"  Part mismatch:    {report['part_count_mismatch']}")
    print(f"  Parse failed:     {report['parse_failed']}")
    print(f"  Overrides skip:   {report['overrides_skipped']}")
    print(f"  Questions changed:{report['questions_modified']}")
    print(f"  Prefix added:     {report['enriched']['prefix_added']}")
    print(f"  Suffix added:     {report['enriched']['suffix_added']}")
    print(f"  No answerline:    {report['enriched']['no_answerline_in_source']}")
    print(f"\n  Pattern breakdown:")
    for pattern, count in sorted(report['matched_by_pattern'].items(), key=lambda x: -x[1]):
        print(f"    {pattern:40s} {count:>5d}")

    # Type breakdown
    print(f"\n  Type breakdown:")
    for key, val in sorted(report['enriched'].items()):
        if key.startswith('type_'):
            print(f"    {key:40s} {val:>5d}")

    # Write report
    os.makedirs(REPORT_PATH.parent, exist_ok=True)
    # Clean report for JSON (remove large lists in dry-run, keep in full)
    report_out = dict(report)
    if len(report_out['missing_ids']) > 50:
        report_out['missing_ids_sample'] = report_out['missing_ids'][:50]
        report_out['missing_ids_total'] = len(report_out['missing_ids'])
        del report_out['missing_ids']
    if len(report_out['mismatch_details']) > 50:
        report_out['mismatch_details_sample'] = report_out['mismatch_details'][:50]
        report_out['mismatch_details_total'] = len(report_out['mismatch_details'])
        del report_out['mismatch_details']

    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        json.dump(report_out, f, indent=2, ensure_ascii=False)
    print(f"\n  Report saved to: {REPORT_PATH}")

    # Write enriched JSON (unless dry-run)
    if not args.dry_run:
        print(f"\n  Writing enriched data to {PAPERS_JSON}...")
        with open(PAPERS_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print("  Done!")
    else:
        print(f"\n  DRY RUN — no files modified.")

    # Show sample of missing IDs
    if report.get('missing_ids'):
        sample = report['missing_ids'][:10]
        print(f"\n  Missing source files (first 10):")
        for mid in sample:
            print(f"    {mid}")

    # Show sample of mismatches
    if report.get('mismatch_details'):
        sample = report['mismatch_details'][:10]
        print(f"\n  Part count mismatches (first 10):")
        for mm in sample:
            print(f"    {mm['id']}: JSON={mm['json_parts']} TEX={mm['tex_segments']}")


if __name__ == '__main__':
    main()
