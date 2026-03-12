#!/usr/bin/env python3
"""Inject \\newline after sentence-ending periods in CIE questions.

Rules:
- Sentence-ending period → append \\newline after it
- \\\\[...cm] spacing commands → replace with \\newline
- Decimal points (digit.digit) → skip
- Ellipsis / consecutive dots → skip
- Periods inside math mode ($...$) → skip
- Already followed by \\newline → skip
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS = ROOT / "data" / "papers-cie.json"


def is_sentence_period(text, pos):
    """Check if the period at `pos` is a sentence-ending period."""
    rest = text[pos + 1:]
    # Already followed by \newline? skip
    if rest.lstrip(' \n').startswith('\\newline'):
        return False

    # Decimal point: digit.digit
    if pos > 0 and text[pos - 1].isdigit() and pos + 1 < len(text) and text[pos + 1].isdigit():
        return False

    # Ellipsis: consecutive dots
    if (pos + 1 < len(text) and text[pos + 1] == '.') or (pos > 0 and text[pos - 1] == '.'):
        return False

    # Inside math mode ($...$)?
    in_math = False
    i = 0
    while i < pos:
        if text[i] == '\\' and i + 1 < len(text) and text[i + 1] == '$':
            i += 2
            continue
        if text[i] == '$':
            in_math = not in_math
        i += 1
    if in_math:
        return False

    return True


def process_text(text):
    """Add \\newline after sentence periods, replace \\\\[...cm] with \\newline."""
    # Step 1: Replace \\[...cm] spacing commands with \newline
    text = re.sub(r'\\{1,2}\[\d+(?:\.\d+)?cm\]', r'\\newline', text)

    # Step 2: Add \newline after sentence-ending periods (work backwards)
    positions = [
        i for i in range(len(text))
        if text[i] == '.' and is_sentence_period(text, i)
    ]

    for pos in reversed(positions):
        after = text[pos + 1:]
        if after.startswith('\n'):
            text = text[:pos + 1] + '\n\\newline' + text[pos + 1:]
        else:
            text = text[:pos + 1] + '\n\\newline\n' + text[pos + 1:]

    return text


def process_question(q):
    """Process all text content in a question. Returns True if modified."""
    modified = False

    # Process stem blocks
    if q.get('stem'):
        for b in q['stem']:
            if b.get('type') == 'text' and b.get('content'):
                new = process_text(b['content'])
                if new != b['content']:
                    b['content'] = new
                    modified = True

    # Process tex field (legacy rendering path)
    if q.get('tex'):
        new = process_text(q['tex'])
        if new != q['tex']:
            q['tex'] = new
            modified = True

    # Process parts content blocks
    if q.get('parts'):
        for p in q['parts']:
            if p.get('content'):
                for b in p['content']:
                    if b.get('type') == 'text' and b.get('content'):
                        new = process_text(b['content'])
                        if new != b['content']:
                            b['content'] = new
                            modified = True
            if p.get('subparts'):
                for sp in p['subparts']:
                    if sp.get('content'):
                        for b in sp['content']:
                            if b.get('type') == 'text' and b.get('content'):
                                new = process_text(b['content'])
                                if new != b['content']:
                                    b['content'] = new
                                    modified = True

    return modified


def main():
    with open(PAPERS, encoding="utf-8") as f:
        data = json.load(f)

    modified_count = 0
    for q in data["questions"]:
        if process_question(q):
            modified_count += 1

    with open(PAPERS, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    total = len(data["questions"])
    print(f"Done. Modified {modified_count}/{total} questions.")


if __name__ == "__main__":
    main()
