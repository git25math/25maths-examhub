#!/usr/bin/env python3
"""Fix bare \\, (thin space) outside math mode in CIE questions.

Rules:
- \\, inside $...$ or \\[...\\] → leave alone
- NUMBER\\,UNIT → $NUMBER\\,\\text{UNIT}$
- Thousands: 52\\,149 → $52\\,149$
- $expr$\\,UNIT → $expr\\,\\text{UNIT}$ (merge)
- \\,:\\, → $\\,{:}\\,$ (ratio)
- \\,|\\, → $\\,|\\,$ (stem-leaf)
- (a) \\, → (a)  (remove)
- Trailing \\, → remove
- Remaining \\, → $\\,$
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS = ROOT / "data" / "papers-cie.json"

UNITS = r'(?:km/h|mph|cm|mm|km|kg|ml|mg|min|am|pm|m|g|h|s|l)'


def split_math(text):
    segs = []
    i = 0; buf = ''
    while i < len(text):
        if text[i] == '$' and not (i > 0 and text[i-1] == '\\'):
            if buf: segs.append(('t', buf)); buf = ''
            j = i + 1
            while j < len(text) and text[j] != '$':
                if text[j] == '\\': j += 1
                j += 1
            if j < len(text):
                segs.append(('m', text[i:j+1])); i = j + 1
            else: buf += text[i]; i += 1
        elif text[i:i+2] == '\\[':
            if buf: segs.append(('t', buf)); buf = ''
            j = text.find('\\]', i+2)
            if j >= 0: segs.append(('m', text[i:j+2])); i = j + 2
            else: buf += text[i]; i += 1
        else: buf += text[i]; i += 1
    if buf: segs.append(('t', buf))
    return segs


def rejoin(segs):
    return ''.join(c for _, c in segs)


def apply_sub(segs, fn):
    out = []
    for typ, c in segs:
        if typ == 't':
            out.extend(split_math(fn(c)))
        else:
            out.append((typ, c))
    return out


def merge_adjacent_math(segs):
    out = []
    for typ, c in segs:
        if (typ == 'm' and out and out[-1][0] == 'm'
                and out[-1][1].endswith('$') and c.startswith('$')
                and len(c) > 1 and c[1] == '^'):
            out[-1] = ('m', out[-1][1][:-1] + c[1:])
        else:
            out.append((typ, c))
    return out


def process_text(text):
    segs = split_math(text)

    # S1: $expr$\,UNIT boundary merge
    new = []
    i = 0
    while i < len(segs):
        if (i+1 < len(segs) and segs[i][0] == 'm' and segs[i+1][0] == 't'
                and segs[i][1].startswith('$') and segs[i][1].endswith('$')):
            ms, ts = segs[i][1], segs[i+1][1]
            m = re.match(r'^\\,(' + UNITS + r')(.*)', ts, re.DOTALL)
            if m:
                unit, rest = m.group(1), m.group(2)
                merged = ms[:-1] + '\\,\\text{' + unit + '}$'
                new.append(('m', merged))
                if rest: new.append(('t', rest))
                i += 2; continue
        new.append(segs[i]); i += 1
    segs = new

    # S2a: thousands+unit
    segs = apply_sub(segs, lambda s: re.sub(
        r'(\d+(?:\\,\d{3})+)\\,(' + UNITS + r')(?![a-zA-Z])',
        lambda m: '$' + m.group(1) + '\\,\\text{' + m.group(2) + '}$', s))

    # S2b: pure thousands
    segs = apply_sub(segs, lambda s: re.sub(
        r'(\d+(?:\\,\d{3})+)',
        lambda m: '$' + m.group(1) + '$', s))

    # S3: number\,unit
    segs = apply_sub(segs, lambda s: re.sub(
        r'(\d+(?:\.\d+)?)\\,(' + UNITS + r')(?![a-zA-Z])',
        lambda m: '$' + m.group(1) + '\\,\\text{' + m.group(2) + '}$', s))

    # S4: ratio
    segs = apply_sub(segs, lambda s: s.replace('\\,:\\,', '$\\,{:}\\,$'))

    # S5: stem-leaf
    segs = apply_sub(segs, lambda s: s.replace('\\,|\\,', '$\\,|\\,$'))

    # S6: label
    segs = apply_sub(segs, lambda s: re.sub(r'(\([a-z]\))\s*\\,', r'\1 ', s))

    # S7: trailing
    segs = apply_sub(segs, lambda s: re.sub(r'\\,(\s*[.\n])', r'\1', s))

    # S8: template
    segs = apply_sub(segs, lambda s: re.sub(r'(\{[^}]*\})\\,', r'\1 ', s))

    # S9: remaining
    segs = apply_sub(segs, lambda s: re.sub(r'\\,', '$\\,$', s))

    # Final: merge $A$$^B$ → $A^B$
    segs = merge_adjacent_math(segs)

    return rejoin(segs)


def process_question(q):
    modified = False
    if q.get('stem'):
        for b in q['stem']:
            if b.get('type') == 'text' and b.get('content') and '\\,' in b['content']:
                new = process_text(b['content'])
                if new != b['content']:
                    b['content'] = new
                    modified = True
    if q.get('tex') and '\\,' in q['tex']:
        new = process_text(q['tex'])
        if new != q['tex']:
            q['tex'] = new
            modified = True
    if q.get('parts'):
        for p in q['parts']:
            for bl in (p.get('content') or []):
                if bl.get('type') == 'text' and bl.get('content') and '\\,' in bl['content']:
                    new = process_text(bl['content'])
                    if new != bl['content']:
                        bl['content'] = new
                        modified = True
            for sp in (p.get('subparts') or []):
                for bl in (sp.get('content') or []):
                    if bl.get('type') == 'text' and bl.get('content') and '\\,' in bl['content']:
                        new = process_text(bl['content'])
                        if new != bl['content']:
                            bl['content'] = new
                            modified = True
    return modified


def main():
    with open(PAPERS, encoding="utf-8") as f:
        data = json.load(f)

    count = 0
    for q in data["questions"]:
        if process_question(q):
            count += 1

    with open(PAPERS, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    print(f"Done. Fixed bare \\, in {count}/{len(data['questions'])} questions.")


if __name__ == "__main__":
    main()
