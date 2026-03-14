#!/usr/bin/env python3
"""
audit-duplicates.py — Full duplicate analysis for CIE 0580 questions.

Detects:
  1. Exact tex duplicates
  2. Near-duplicates (normalized whitespace/formatting)
  3. Fuzzy duplicates (high text similarity)
  4. Pattern analysis: same-session variants vs cross-year reuse

Usage:
  python3 scripts/audit-duplicates.py
  python3 scripts/audit-duplicates.py --verbose    # show all groups
"""

import json
import re
import sys
from collections import defaultdict, Counter
from pathlib import Path
from difflib import SequenceMatcher

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "papers-cie.json"


def normalize(tex):
    """Normalize tex for near-duplicate detection."""
    t = tex.strip()
    # Remove formatting commands
    t = re.sub(r'\\\\?\[[\d.]*(?:cm|em|mm)?\]', '', t)
    t = re.sub(r'\\(?:vgap|par|noindent)', '', t)
    t = re.sub(r'\\vspace\{[^}]*\}', '', t)
    t = re.sub(r'\\hspace\{[^}]*\}', '', t)
    t = re.sub(r'\\AnswerLine(?:\[[^\]]*\])*', '', t)
    t = re.sub(r'\\Marks\{\d+\}', '', t)
    t = re.sub(r'\\relinput\{[^}]*\}', '', t)
    t = re.sub(r'\\begin\{(?:question|parts|subparts)\}\{?\d*\}?', '', t)
    t = re.sub(r'\\end\{(?:question|parts|subparts)\}', '', t)
    t = re.sub(r'\\item\b', '', t)
    t = re.sub(r'\\textbf\{[^}]*\}', '', t)
    # Normalize whitespace
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def extract_content_words(tex):
    """Extract meaningful content words for fuzzy matching."""
    t = normalize(tex)
    # Remove all LaTeX commands
    t = re.sub(r'\\[a-zA-Z]+(?:\{[^}]*\})*(?:\[[^\]]*\])*', ' ', t)
    t = re.sub(r'[{}$\\]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return t


def parse_paper_info(qid):
    """Extract year, session, paper from question ID."""
    m = re.match(r'0580-(\d{4})(\w+)-Paper(\d+)-Q(\d+)', qid)
    if m:
        return {
            'year': int(m.group(1)),
            'session': m.group(2),
            'paper': m.group(3),
            'qnum': int(m.group(4)),
            'year_session': f"{m.group(1)}{m.group(2)}",
        }
    return {}


def similarity(a, b):
    """Quick similarity ratio between two strings."""
    return SequenceMatcher(None, a, b).ratio()


def main():
    verbose = "--verbose" in sys.argv

    with open(DATA) as f:
        d = json.load(f)
    qs = d['questions']
    print(f"Total questions: {len(qs)}")

    # ═══════════════════════════════════════
    # 1. Exact duplicates
    # ═══════════════════════════════════════
    tex_groups = defaultdict(list)
    for q in qs:
        tex = q.get('tex', '').strip()
        if tex:
            tex_groups[tex].append(q)

    exact_dups = {k: v for k, v in tex_groups.items() if len(v) > 1}
    exact_dup_qs = sum(len(v) for v in exact_dups.values())
    print(f"\n{'='*70}")
    print(f"  1. EXACT DUPLICATES: {len(exact_dups)} groups, {exact_dup_qs} questions")
    print(f"{'='*70}")

    # ═══════════════════════════════════════
    # 2. Near-duplicates (normalized)
    # ═══════════════════════════════════════
    norm_groups = defaultdict(list)
    for q in qs:
        tex = q.get('tex', '').strip()
        if tex and len(tex) > 20:
            n = normalize(tex)
            norm_groups[n].append(q)

    near_dups = {k: v for k, v in norm_groups.items() if len(v) > 1}
    near_dup_qs = sum(len(v) for v in near_dups.values())
    # Subtract exact dups to get "near but not exact"
    near_only = len(near_dups) - len(exact_dups)
    print(f"\n{'='*70}")
    print(f"  2. NEAR-DUPLICATES (normalized): {len(near_dups)} groups, {near_dup_qs} questions")
    print(f"     (of which {len(exact_dups)} are exact, {near_only} are format-only differences)")
    print(f"{'='*70}")

    # ═══════════════════════════════════════
    # 3. Pattern analysis
    # ═══════════════════════════════════════
    same_session_variant = []  # Same session, different paper variant (11/12/13)
    same_year_diff_session = []
    cross_year = []

    for tex, group in near_dups.items():
        infos = [parse_paper_info(q['id']) for q in group]
        year_sessions = set(i.get('year_session', '') for i in infos)
        years = set(i.get('year', 0) for i in infos)

        if len(year_sessions) == 1:
            same_session_variant.append((tex, group))
        elif len(years) == 1:
            same_year_diff_session.append((tex, group))
        else:
            cross_year.append((tex, group))

    print(f"\n{'='*70}")
    print(f"  3. DUPLICATE PATTERN ANALYSIS")
    print(f"{'='*70}")
    print(f"  Same session, different variants (11/12/13): {len(same_session_variant)} groups")
    print(f"  Same year, different sessions:               {len(same_year_diff_session)} groups")
    print(f"  Cross-year duplicates:                       {len(cross_year)} groups")

    # ═══════════════════════════════════════
    # 3a. Same-session variants detail
    # ═══════════════════════════════════════
    print(f"\n{'='*70}")
    print(f"  3a. SAME-SESSION VARIANT PAIRS ({len(same_session_variant)} groups)")
    print(f"      These are the same question on different paper variants")
    print(f"{'='*70}")

    # Summarize by session
    session_counts = Counter()
    for tex, group in same_session_variant:
        infos = [parse_paper_info(q['id']) for q in group]
        ys = infos[0].get('year_session', '?')
        session_counts[ys] += 1

    print(f"\n  Duplicates per session:")
    for ys, cnt in sorted(session_counts.items()):
        print(f"    {ys}: {cnt} duplicate groups")

    if verbose:
        for tex, group in same_session_variant[:20]:
            snippet = tex[:100]
            ids = [q['id'] for q in group]
            print(f"\n  [{len(group)}x] {snippet}...")
            for qid in ids:
                print(f"       {qid}")

    # ═══════════════════════════════════════
    # 3b. Cross-year detail
    # ═══════════════════════════════════════
    print(f"\n{'='*70}")
    print(f"  3b. CROSS-YEAR DUPLICATES ({len(cross_year)} groups)")
    print(f"      Same question reused across different years")
    print(f"{'='*70}")

    for tex, group in sorted(cross_year, key=lambda x: -len(x[1])):
        snippet = normalize(tex)[:120]
        print(f"\n  [{len(group)}x] {snippet}...")
        for q in sorted(group, key=lambda q: q['id']):
            info = parse_paper_info(q['id'])
            print(f"       {q['id']}  (s={q.get('s','?')}, marks={q.get('marks','?')})")

    # ═══════════════════════════════════════
    # 4. Fuzzy duplicate detection (high similarity)
    # ═══════════════════════════════════════
    print(f"\n{'='*70}")
    print(f"  4. FUZZY DUPLICATES (>90% similar, not already caught)")
    print(f"{'='*70}")

    # Group by section to reduce O(n^2) comparison
    section_qs = defaultdict(list)
    for q in qs:
        s = q.get('s', '?')
        section_qs[s].append(q)

    fuzzy_count = 0
    already_exact = set()
    for tex in near_dups:
        ids = frozenset(q['id'] for q in near_dups[tex])
        already_exact.add(ids)

    fuzzy_groups = []
    for section, sec_qs in sorted(section_qs.items()):
        if len(sec_qs) < 2:
            continue
        # Extract content words for each question
        contents = [(q, extract_content_words(q.get('tex', ''))) for q in sec_qs]
        # Compare within section
        for i in range(len(contents)):
            for j in range(i + 1, len(contents)):
                q1, c1 = contents[i]
                q2, c2 = contents[j]
                if len(c1) < 15 or len(c2) < 15:
                    continue
                # Quick length filter
                ratio = len(c1) / len(c2) if len(c2) > 0 else 0
                if ratio < 0.7 or ratio > 1.43:
                    continue
                sim = similarity(c1, c2)
                if sim > 0.90:
                    # Check not already caught as exact/near
                    pair = frozenset([q1['id'], q2['id']])
                    is_known = False
                    for known in already_exact:
                        if pair.issubset(known):
                            is_known = True
                            break
                    if not is_known:
                        fuzzy_groups.append((sim, q1, q2, c1, c2))

    # Deduplicate fuzzy groups
    seen_pairs = set()
    unique_fuzzy = []
    for sim, q1, q2, c1, c2 in sorted(fuzzy_groups, key=lambda x: -x[0]):
        pair = frozenset([q1['id'], q2['id']])
        if pair not in seen_pairs:
            seen_pairs.add(pair)
            unique_fuzzy.append((sim, q1, q2, c1, c2))

    print(f"  Found {len(unique_fuzzy)} fuzzy duplicate pairs")
    for sim, q1, q2, c1, c2 in unique_fuzzy[:30]:
        info1 = parse_paper_info(q1['id'])
        info2 = parse_paper_info(q2['id'])
        cross = "CROSS-YEAR" if info1.get('year') != info2.get('year') else "same-year"
        print(f"\n  [{sim:.1%}] {cross}")
        print(f"    A: {q1['id']} (s={q1.get('s','?')}, {q1.get('marks','?')}m)")
        print(f"       {c1[:120]}...")
        print(f"    B: {q2['id']} (s={q2.get('s','?')}, {q2.get('marks','?')}m)")
        print(f"       {c2[:120]}...")

    # ═══════════════════════════════════════
    # 5. Summary
    # ═══════════════════════════════════════
    total_dup_qs = near_dup_qs
    unique_qs = len(qs) - (near_dup_qs - len(near_dups))  # subtract extras
    print(f"\n{'='*70}")
    print(f"  SUMMARY")
    print(f"{'='*70}")
    print(f"  Total questions:                    {len(qs)}")
    print(f"  Exact duplicate groups:             {len(exact_dups)} ({exact_dup_qs} questions)")
    print(f"  Near-duplicate groups:              {len(near_dups)} ({near_dup_qs} questions)")
    print(f"  Fuzzy duplicate pairs (new):        {len(unique_fuzzy)}")
    print(f"  Pattern breakdown:")
    print(f"    Same-session variants:            {len(same_session_variant)}")
    print(f"    Same-year cross-session:          {len(same_year_diff_session)}")
    print(f"    Cross-year reuse:                 {len(cross_year)}")
    print(f"  Unique questions (after dedup):     ~{unique_qs}")
    print(f"  Redundancy rate:                    {(1-unique_qs/len(qs))*100:.1f}%")


if __name__ == "__main__":
    main()
