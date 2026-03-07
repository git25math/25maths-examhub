#!/usr/bin/env python3
"""
Generate HHK practice questions from syllabus data using Gemini CLI.

Usage:
  python3 scripts/generate-hhk-questions.py [--year Y7] [--dry-run]

Reads data/syllabus-hhk.json, generates MCQ questions per section,
outputs to data/questions-25m.json.
"""

import json
import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SYLLABUS_PATH = os.path.join(ROOT, 'data', 'syllabus-hhk.json')
OUTPUT_PATH = os.path.join(ROOT, 'data', 'questions-25m.json')
GEMINI = '/opt/homebrew/bin/gemini'

DIAG_CATEGORIES = ['vocab', 'concept', 'calc', 'logic']

PROMPT_TEMPLATE = """You are a maths teacher. Generate {count} multiple-choice questions for this topic:

Section: {section_id} - {title}
Core Content:
{core_content}

Each question must be a JSON object with these fields:
- "id": unique string starting with "h" + 3-digit number (start from {start_id})
- "cat": category string (e.g. "fractions", "algebra", "geometry", "number", "ratio", "percentage", "probability")
- "topic": "{title}"
- "q": question text (use LaTeX for math: $...$)
- "o": array of 4 options (use LaTeX for math)
- "a": index of correct answer (0-3)
- "e": explanation text
- "d": difficulty 1 or 2
- "s": "{section_id}"
- "diag": one of "vocab", "concept", "calc", "logic"

Return ONLY a JSON array. No markdown fences."""


def load_syllabus():
    with open(SYLLABUS_PATH) as f:
        return json.load(f)


def generate_for_section(section, start_id, count=5):
    prompt = PROMPT_TEMPLATE.format(
        count=count,
        section_id=section['id'],
        title=section['title'],
        core_content=section.get('core_content', ''),
        start_id=start_id
    )
    try:
        result = subprocess.run(
            [GEMINI, '--sandbox', 'false', '-y', '-o', 'json'],
            input=prompt, capture_output=True, text=True, timeout=120
        )
        return json.loads(result.stdout)
    except Exception as e:
        print(f"  Error generating for {section['id']}: {e}", file=sys.stderr)
        return []


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--year', default=None, help='Filter by year (e.g. Y7)')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--count', type=int, default=5, help='Questions per section')
    args = parser.parse_args()

    syllabus = load_syllabus()

    # Load existing questions
    existing = []
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH) as f:
            existing = json.load(f)

    max_id = 0
    for q in existing:
        try:
            num = int(q['id'][1:])
            if num > max_id:
                max_id = num
        except Exception:
            pass

    all_questions = list(existing)
    existing_sections = set(q['s'] for q in existing)

    for chapter in syllabus['chapters']:
        if args.year and not chapter['id'].replace('ch', 'Y').startswith(args.year[0]):
            # Simple year filter
            year_num = args.year.replace('Y', '')
            ch_num = str(chapter['num'])
            # ch7 = Y7, ch8 = Y8, etc. Year = chapter num - 0 for HHK
            if ch_num != year_num.replace('Y', '').replace('y', ''):
                if 'Y' + ch_num not in args.year and 'y' + ch_num not in args.year:
                    continue

        for section in chapter['sections']:
            if section['id'] in existing_sections:
                print(f"  Skipping {section['id']} (already has questions)")
                continue

            print(f"  Generating {args.count} questions for {section['id']} {section['title']}...")

            if args.dry_run:
                continue

            max_id += 1
            start_id = max_id
            questions = generate_for_section(section, start_id, args.count)
            if questions:
                all_questions.extend(questions)
                max_id = start_id + len(questions) - 1
                print(f"    Generated {len(questions)} questions")

    if not args.dry_run:
        with open(OUTPUT_PATH, 'w') as f:
            json.dump(all_questions, f, indent=2, ensure_ascii=False)
        print(f"\nTotal: {len(all_questions)} questions saved to {OUTPUT_PATH}")


if __name__ == '__main__':
    main()
