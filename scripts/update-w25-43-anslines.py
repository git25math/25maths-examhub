#!/usr/bin/env python3
"""
Update 0580/43/O/N/25 questions with answer line templates (ansTpl/ansPrefix/ansSuffix).
Based on exact PDF transcription of answer lines.
"""
import json
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')

with open('data/papers-cie.json', 'r') as f:
    data = json.load(f)

# Build lookup by id
qmap = {}
for i, q in enumerate(data['questions']):
    if q['paper'] == '2025OctNov-Paper43':
        qmap[q['qnum']] = i

def update_q(qnum, updates):
    """Update question fields and parts answer lines."""
    idx = qmap.get(qnum)
    if idx is None:
        print(f'WARNING: Q{qnum} not found!')
        return
    q = data['questions'][idx]
    # Update top-level fields
    for k, v in updates.items():
        if k == 'parts_ans':
            # Update individual parts' answer line fields
            for pi, pdata in enumerate(v):
                if pi < len(q.get('parts', [])):
                    for pk, pv in pdata.items():
                        q['parts'][pi][pk] = pv
        else:
            q[k] = v
    print(f'  Q{qnum:02d} updated')

print('Updating answer lines for 0580/43/O/N/25...')

# ── Q1: nth term sequence ──
# (a) .................. [1]   — plain dots
# (b) .................. [1]   — plain dots
# No special answer line needed (default dots work)

# ── Q2: stem-and-leaf ──
# (a) .................. years [1]
# (b) .................. years [1]
# (c) .................. % [2]
update_q(2, {
    'parts_ans': [
        {'ansSuffix': 'years'},
        {'ansSuffix': 'years'},
        {'ansSuffix': '%'}
    ]
})

# ── Q3: G = 4/5 m²n ──
# G = .................. [1]
update_q(3, {'ansPrefix': 'G ='})

# ── Q4: bearings ──
# (a) [2] — diagram, mark position (no answer line)
# (b) .................. [2] — plain dots
update_q(4, {
    'parts_ans': [
        {},  # (a) diagram task, no answer line
        {}   # (b) plain dots
    ]
})

# ── Q5: decagon + polygon ──
# (a) d = .................. [3]
# (b) n = .................. [1]
update_q(5, {
    'parts_ans': [
        {'ansPrefix': 'd ='},
        {'ansPrefix': 'n ='}
    ]
})

# ── Q6: simplify indices ──
# (a) .................. [1]
# (b) .................. [2]
# Plain dots — no special format

# ── Q7: transformations ──
# (a) .............. [2] (two long dotted lines for description)
# (b) .............. [3] (two long dotted lines)
update_q(7, {
    'parts_ans': [
        {'ansTpl': '____\\n____'},
        {'ansTpl': '____\\n____'}
    ]
})

# ── Q8: ordering values ──
# ............, ............, ............, ............  [2]
#   smallest
update_q(8, {'ansTpl': '____ , ____ , ____ , ____'})

# ── Q9: draw a ring (multiple choice style) ──
# No answer line — student circles an option

# ── Q10: simultaneous equations ──
# x = ..............
# y = ..............  [2]
update_q(10, {'ansTpl': 'x = ____\\ny = ____'})

# ── Q11: standard form ──
# The number that is not written in standard form is .............. .
# The largest number is .............. .
# The smallest number is .............. .  [2]
update_q(11, {
    'ansTpl': 'The number that is not written in standard form is ____ .\\nThe largest number is ____ .\\nThe smallest number is ____ .'
})

# ── Q12: probability ──
# .................. [2]
# Plain dots

# ── Q13: y = c^x ──
# .................. [3]
# Plain dots

# ── Q14: expressions equal in value ──
# y = .................. [5]
update_q(14, {'ansPrefix': 'y ='})

# ── Q15: exponential decrease ──
# (a) .................. [3]
# (b) .................. years [2]
update_q(15, {
    'parts_ans': [
        {},
        {'ansSuffix': 'years'}
    ]
})

# ── Q16: expand and simplify ──
# (a) .................. [2]
# (b) .................. [2]
# Plain dots

# ── Q17: make t the subject ──
# t = .................. [3]
update_q(17, {'ansPrefix': 't ='})

# ── Q18: cosine/sine rule quadrilateral ──
# (a) x = .................. [3]
# (b) y = .................. [3]
update_q(18, {
    'parts_ans': [
        {'ansPrefix': 'x ='},
        {'ansPrefix': 'y ='}
    ]
})

# ── Q19: functions ──
# (a) .................. [1]
# (b) .................. [1]
# (c) g⁻¹(x) = .................. [2]
# (d) x = .................. [3]
# (e) .................. [1]
update_q(19, {
    'parts_ans': [
        {},
        {},
        {'ansPrefix': 'g⁻¹(x) ='},
        {'ansPrefix': 'x ='},
        {}
    ]
})

# ── Q20: differentiation ──
# (a) .................. [2]
# (b) .................. [2]
# Plain dots

# ── Q21: percentage increase ──
# .................. % [4]
update_q(21, {'ansSuffix': '%'})

# ── Q22: similar shapes ──
# (a) x = .................. [2]
# (b) .................. ml [3]
update_q(22, {
    'parts_ans': [
        {'ansPrefix': 'x ='},
        {'ansSuffix': 'ml'}
    ]
})

# ── Q23: grouped frequency ──
# (a) .................. g [4]
# (b) table: fill in heights (table answer line)
update_q(23, {
    'parts_ans': [
        {'ansSuffix': 'g'},
        {'ansTpl': 'table:Mass ($m$ grams)|$180 < m \\leqslant 200$|$200 < m \\leqslant 210$|$210 < m \\leqslant 215$|$215 < m \\leqslant 230$\\nHeight of bar (cm)|____|____|7.4|____'}
    ]
})

# ── Q24: cuboid 3D ──
# (a) EF = .................. cm [3]
# (b) .................. [3]  (angle, shown as degrees with dots)
update_q(24, {
    'parts_ans': [
        {'ansPrefix': 'EF =', 'ansSuffix': 'cm'},
        {}  # angle answer, plain dots
    ]
})

# ── Q25: bounds ──
# Lower bound = .................. cm
# Upper bound = .................. cm   [3]
update_q(25, {'ansTpl': 'Lower bound = ____ cm\\nUpper bound = ____ cm'})

# ── Q26: vectors ──
# (a) .................. [3]
# (b) .................. [2]
# Plain dots (vector expressions, not numeric answers)

# Write back
with open('data/papers-cie.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)

print('\nDone! Answer lines added for 0580/43/O/N/25.')
