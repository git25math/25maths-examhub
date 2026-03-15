#!/usr/bin/env python3
"""Fix topic tags in papers-cie.json using syllabus section→chapter mapping."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS = ROOT / 'data' / 'papers-cie.json'
SYLLABUS = ROOT / 'data' / 'syllabus-cie.json'

# Section prefix → (chapter title for topics[], cat value)
SEC_MAP = {
    '1': ('Number', 'number'),
    '2': ('Algebra and graphs', 'algebra'),
    '3': ('Coordinate geometry', 'coord'),
    '4': ('Geometry', 'geometry'),
    '5': ('Mensuration', 'mensuration'),
    '6': ('Trigonometry', 'trigonometry'),
    '7': ('Transformations and vectors', 'vectors'),
    '8': ('Probability', 'probability'),
    '9': ('Statistics', 'statistics'),
}

# All valid chapter titles (for filtering secondary topics)
VALID_CHAPTERS = {v[0] for v in SEC_MAP.values()}


def fix_topics(questions):
    stats = {'topic0_fixed': 0, 'trimmed': 0, 'cat_fixed': 0, 'total': len(questions)}

    for q in questions:
        s = str(q.get('s', ''))
        if not s:
            continue
        sec = s.split('.')[0]
        if sec not in SEC_MAP:
            continue

        chapter, expected_cat = SEC_MAP[sec]
        topics = q.get('topics', [])

        # 1. Fix topics[0] to match section's chapter
        if not topics or topics[0] != chapter:
            old_topics = list(topics)
            # Remove chapter from later positions if present
            other = [t for t in topics if t != chapter]
            # Keep at most 1 secondary topic that is a valid chapter
            secondary = [t for t in other if t in VALID_CHAPTERS][:1]
            q['topics'] = [chapter] + secondary
            if old_topics != q['topics']:
                stats['topic0_fixed'] += 1

        # 2. Trim to max 2 topics
        if len(q['topics']) > 2:
            q['topics'] = q['topics'][:2]
            stats['trimmed'] += 1

        # 3. Sync cat
        if q.get('cat') != expected_cat:
            q['cat'] = expected_cat
            stats['cat_fixed'] += 1

    return stats


def main():
    with open(PAPERS) as f:
        data = json.load(f)

    questions = data['questions']
    stats = fix_topics(questions)

    with open(PAPERS, 'w') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    print(f"Total questions: {stats['total']}")
    print(f"topics[0] fixed: {stats['topic0_fixed']}")
    print(f"Trimmed to ≤2: {stats['trimmed']}")
    print(f"cat fixed: {stats['cat_fixed']}")

    # Verify
    three_plus = sum(1 for q in questions if len(q.get('topics', [])) >= 3)
    topic0_wrong = 0
    for q in questions:
        s = str(q.get('s', ''))
        if not s:
            continue
        sec = s.split('.')[0]
        if sec in SEC_MAP:
            chapter = SEC_MAP[sec][0]
            if q.get('topics', [None])[0] != chapter:
                topic0_wrong += 1
    print(f"\nPost-fix verification:")
    print(f"  3+ topics remaining: {three_plus}")
    print(f"  topics[0] wrong: {topic0_wrong}")


if __name__ == '__main__':
    main()
