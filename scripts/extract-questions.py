#!/usr/bin/env python3
"""Extract multiple-choice questions from 25maths-website exercise JSONs.

Outputs:
  data/questions-cie.json  — CIE 0580 questions (~1,488)
  data/questions-edx.json  — Edexcel 4MA1 questions (~936)

All questions are included. LaTeX $...$ delimiters are preserved for KaTeX rendering.
"""

import json
import glob
import os
import re
import sys

EXERCISES_DIR = os.path.join(
    os.path.dirname(__file__), '..', '..', '25maths-website', '_data', 'exercises'
)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# Domain → Keywords category mapping
CIE_CAT_MAP = {
    'algebra': 'algebra',
    'number': 'number',
    'coordinate': 'coord',
    'geometry': 'geometry',
    'mensuration': 'mensuration',
    'trigonometry': 'trigonometry',
    'statistics': 'statistics',
    'probability': 'statistics',
    'transformations': 'vectors',
}

EDX_CAT_MAP = {
    'number': 'edx-number',
    'geometry': 'edx-geometry',
    'equations': 'edx-algebra',
    'sequences': 'edx-functions',
    'statistics': 'edx-statistics',
    'vectors': 'edx-vectors',
}


def clean_text(text):
    """Normalize whitespace, preserve $...$ LaTeX delimiters."""
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract(board_prefix, cat_map, id_prefix):
    """Extract usable questions for a board."""
    pattern = os.path.join(EXERCISES_DIR, f'{board_prefix}*.json')
    files = sorted(glob.glob(pattern))
    if not files:
        print(f'WARNING: No files found matching {pattern}', file=sys.stderr)
        return []

    questions = []
    counter = 1

    for filepath in files:
        with open(filepath) as f:
            data = json.load(f)

        domain = data.get('domain', '')
        cat = cat_map.get(domain)
        if cat is None:
            print(f'  Skipping unknown domain: {domain} in {os.path.basename(filepath)}',
                  file=sys.stderr)
            continue

        tier = data.get('tier', 'Core')
        difficulty = 1 if tier in ('Core', 'Foundation') else 2

        topic = data.get('topic', '')
        # Title-case the topic
        topic = topic.strip().title() if topic else ''

        for q in data['questions']:
            qid = f'{id_prefix}{counter:03d}' if counter < 1000 else f'{id_prefix}{counter}'
            questions.append({
                'id': qid,
                'cat': cat,
                'topic': topic,
                'q': clean_text(q['questionText']),
                'o': [clean_text(opt) for opt in q['options']],
                'a': q['correctAnswer'],
                'e': clean_text(q.get('explanation', '')),
                'd': difficulty,
            })
            counter += 1

    return questions


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print('Extracting CIE 0580 questions...')
    cie = extract('cie0580', CIE_CAT_MAP, 'c')
    print(f'  {len(cie)} usable questions')

    print('Extracting Edexcel 4MA1 questions...')
    edx = extract('edexcel-4ma1', EDX_CAT_MAP, 'e')
    print(f'  {len(edx)} usable questions')

    # Write compact JSON
    for name, data in [('questions-cie.json', cie), ('questions-edx.json', edx)]:
        path = os.path.join(OUTPUT_DIR, name)
        with open(path, 'w') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        size = os.path.getsize(path)
        print(f'  Wrote {path} ({size:,} bytes, {len(data)} questions)')

    print(f'\nTotal: {len(cie) + len(edx)} questions')


if __name__ == '__main__':
    main()
