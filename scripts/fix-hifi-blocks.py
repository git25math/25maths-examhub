#!/usr/bin/env python3
r"""
fix-hifi-blocks.py — High-fidelity re-parser for CIE questions

Re-parses source QuestionStatement.tex files to produce high-fidelity
Block[] arrays and answer objects that preserve ALL formatting:

  - \vgap as {type: "space"} blocks
  - Raw LaTeX in answer prefix/suffix ($x = $, not x =)
  - \textbf{} preserved in text content
  - Figure positions correct (stem vs part)
  - \vspace{} as space blocks
  - \text{}, \begin{center} preserved in text blocks
  - Dotfill answer patterns
  - _rawBody for perfect export round-trip

Usage:
    python3 scripts/fix-hifi-blocks.py --paper 2025OctNov-Paper43 --dry-run
    python3 scripts/fix-hifi-blocks.py --dry-run          # all papers
    python3 scripts/fix-hifi-blocks.py                     # apply to all
"""

import json, os, re, sys, argparse
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PAPERS_JSON = PROJECT_ROOT / "data" / "papers-cie.json"
CIE_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2")


def id_to_tex_path(qid):
    """Convert question ID to source .tex path."""
    parts = qid.split('-')
    if len(parts) != 4:
        return None
    _, session, paper, qnum = parts
    path = CIE_ROOT / "PastPapers" / session / paper / "Questions" / qnum / "QuestionStatement.tex"
    return path if path.exists() else None


# ── Block Tokenizer ────────────────────────────────────────────────────

# Structural patterns that become their own blocks.
# Order matters: more specific patterns first.
BLOCK_PATTERNS = [
    # InsertScreenShot (entire block including wrapper, not commented)
    (re.compile(
        r'(?<!%)\\begin\{InsertScreenShot\}.*?\\end\{InsertScreenShot\}',
        re.DOTALL), 'screenshot'),
    # \begin{center} containing \begin{tabular}
    (re.compile(
        r'\\begin\{center\}\s*\\begin\{tabular\}.*?\\end\{tabular\}\s*\\end\{center\}',
        re.DOTALL), 'center_table'),
    # Figure reference
    (re.compile(r'\\relinput\{([^}]+)\}'), 'figure'),
    # Standalone tabular (not wrapped)
    (re.compile(r'\\begin\{tabular\}.*?\\end\{tabular\}', re.DOTALL), 'table'),
    # \vgap with optional argument
    (re.compile(r'\\vgap\s*(?:\[([^\]]*)\])?'), 'vgap'),
    # \vspace{h} — distinct from \vgap for fidelity
    (re.compile(r'\\vspace\{([^}]+)\}'), 'vspace'),
    # \\[Ncm] line break with spacing
    (re.compile(r'\\\\[\s]*\[([\d.]+(?:cm|em|mm))\]'), 'linebreak'),
    # Itemize environment
    (re.compile(r'\\begin\{itemize\}(.*?)\\end\{itemize\}', re.DOTALL), 'itemize'),
]


def tokenize_content(tex):
    """Convert LaTeX content string to Block[], preserving all formatting.

    Text blocks keep raw LaTeX ($...$, \\textbf{}, \\text{}, \\begin{center}, etc.).
    Structural elements become their own block types.
    """
    if not tex or not tex.strip():
        return []

    blocks = []
    remaining = tex

    while remaining.strip():
        best = None
        best_pos = len(remaining)
        best_type = None

        for pat, ptype in BLOCK_PATTERNS:
            m = pat.search(remaining)
            if m and m.start() < best_pos:
                best = m
                best_pos = m.start()
                best_type = ptype

        if best is None:
            t = remaining.strip()
            if t:
                blocks.append({"type": "text", "content": t})
            break

        before = remaining[:best_pos].strip()
        if before:
            blocks.append({"type": "text", "content": before})

        # Inline linebreak: \\[height] attached to text — keep in text
        if best_type == 'linebreak':
            raw_before = remaining[:best_pos]
            if raw_before.rstrip() and not raw_before.rstrip().endswith('\n'):
                # Include linebreak as part of text
                combined = remaining[:best.end()].strip()
                if combined:
                    blocks.append({"type": "text", "content": combined})
                remaining = remaining[best.end():]
                continue

        if best_type == 'figure':
            blocks.append({"type": "figure", "src": best.group(1)})
        elif best_type == 'vgap':
            h = (best.group(1) if best.lastindex and best.group(1)
                 else '0.8em')
            blocks.append({"type": "space", "height": h, "cmd": "vgap"})
        elif best_type == 'vspace':
            blocks.append({"type": "space", "height": best.group(1), "cmd": "vspace"})
        elif best_type == 'linebreak':
            blocks.append({"type": "space", "height": best.group(1), "cmd": "linebreak"})
        elif best_type in ('screenshot', 'center_table', 'table'):
            blocks.append({"type": "table", "content": best.group(0).strip()})
        elif best_type == 'itemize':
            inner = best.group(1)
            items = re.split(r'\\item\b\s*', inner)
            items = [it.strip() for it in items if it.strip()]
            blocks.append({"type": "list", "style": "bullet", "items": items})

        remaining = remaining[best.end():]

    return blocks


# ── Bracket Matcher ────────────────────────────────────────────────────

def _match_brackets(text, pos):
    """Match [...] starting at pos. Returns (content, end_pos) or (None, pos)."""
    if pos >= len(text) or text[pos] != '[':
        return None, pos
    depth = 0
    i = pos
    while i < len(text):
        ch = text[i]
        # Skip escaped characters (\{, \}, \[, \])
        if ch == '\\' and i + 1 < len(text) and text[i + 1] in '{}[]':
            i += 2
            continue
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                return text[pos + 1:i], i + 1
        elif ch == '{':
            bd = 1
            i += 1
            while i < len(text) and bd > 0:
                if text[i] == '\\' and i + 1 < len(text) and text[i + 1] in '{}':
                    i += 2
                    continue
                if text[i] == '{':
                    bd += 1
                elif text[i] == '}':
                    bd -= 1
                i += 1
            continue
        i += 1
    return None, pos


# ── Answer Parser ──────────────────────────────────────────────────────

def _is_answer_line(line, has_answer_below):
    """Check if a line is part of the answer section (scanning backwards)."""
    s = line.strip()
    if not s:
        return False

    # Direct answer commands
    if re.match(r'\\AnswerLine\b', s):
        return True
    if re.match(r'\\answerlines\b', s):
        return True
    if re.match(r'\\dotfill\s*$', s):
        return True
    if re.match(r'\\WorkingSpace\{', s):
        return True
    if re.match(r'\\Answerspace\b', s):
        return True

    # \vgap or \vspace between answer elements
    if has_answer_below:
        if re.match(r'\\vgap\s*(?:\[[^\]]*\])?\s*$', s):
            return True
        if re.match(r'\\vspace\{[^}]+\}\s*$', s):
            return True

    # \hfill with answer-like content (AnswerLine, pmatrix, makebox, hrulefill, DotLine)
    if re.match(r'\\hfill\b', s):
        if re.search(r'\\(AnswerLine|makebox|hrulefill|DotLine)', s):
            return True

    # Hint line after answer (like \hfill \textit{smallest})
    if has_answer_below and re.match(r'\\hfill\s+\\textit', s):
        return True

    # Standalone \vspace between answer elements
    if has_answer_below:
        if re.match(r'\\vspace\{[^}]+\}\s*$', s):
            return True

    return False


def parse_answer_from_segment(text):
    """Extract answer + marks from end of a LaTeX segment.

    Returns (content_text, answer_dict_or_None, marks, compact_marks).
    compact_marks: True if no blank line before \\Marks (only when no answer).
    """
    # Extract \Marks{n}
    marks = 0
    compact_marks = False
    remaining = text
    m = re.search(r'\\Marks\{(\d+)\}\s*$', remaining)
    if m:
        marks = int(m.group(1))
        # Detect compact marks: no blank line before \Marks
        before_marks = remaining[:m.start()]
        if not re.search(r'\n\s*\n\s*$', before_marks):
            compact_marks = True
        remaining = before_marks.rstrip()

    # Scan backwards to find where answer section starts
    lines = remaining.split('\n')
    answer_start = len(lines)

    for i in range(len(lines) - 1, -1, -1):
        has_answer_below = (answer_start < len(lines))
        if _is_answer_line(lines[i], has_answer_below):
            answer_start = i
        elif not lines[i].strip():
            continue  # Skip blank lines
        else:
            break

    if answer_start >= len(lines):
        return remaining, None, marks, compact_marks

    # Move topmost \vgap back to content — it's a content spacing, not an
    # answer element.  Only \vgap *between* answer lines stays in answer.
    first_non_blank = answer_start
    while first_non_blank < len(lines) and not lines[first_non_blank].strip():
        first_non_blank += 1
    if first_non_blank < len(lines):
        top = lines[first_non_blank].strip()
        if re.match(r'\\vgap\s*(?:\[[^\]]*\])?\s*$', top) or \
           re.match(r'\\vspace\{[^}]+\}\s*$', top):
            answer_start = first_non_blank + 1
            # Skip blank lines after the spacing
            while answer_start < len(lines) and not lines[answer_start].strip():
                answer_start += 1

    if answer_start >= len(lines):
        return remaining, None, marks, compact_marks

    answer_text = '\n'.join(lines[answer_start:])
    content_text = '\n'.join(lines[:answer_start]).rstrip()

    answer = _build_answer(answer_text)

    # Detect compact answer: no blank line between content and answer
    if answer and answer_start > 0 and lines[answer_start - 1].strip():
        answer['_compactAnswer'] = True

    return content_text, answer, marks, compact_marks


def _build_answer(answer_text):
    """Build answer dict from answer section text."""

    # ── Answer space ──
    space = None
    wm = re.search(r'\\WorkingSpace\{([^}]+)\}', answer_text)
    if wm:
        space = {"type": "working", "height": wm.group(1), "cmd": "WorkingSpace"}

    am = re.search(r'\\Answerspace\s*(?:\[([^\]]*)\])?', answer_text)
    if am:
        space = {"type": "drawing", "height": am.group(1) or '3cm', "cmd": "Answerspace"}

    vm = re.search(r'\\vspace\{([^}]+)\}', answer_text)
    if vm and not space:
        space = {"type": "working", "height": vm.group(1), "cmd": "vspace"}

    # ── answerlines[n] ──
    al_n = re.search(r'\\answerlines\s*(?:\[(\d+)\])?', answer_text)
    if al_n:
        n = int(al_n.group(1)) if al_n.group(1) else 3
        ans = {"type": "multiline", "lines": n}
        if space:
            ans["space"] = space
        return ans

    # ── AnswerLine commands ──
    al_pat = re.compile(r'\\(AnswerLine(?:Short)?)\b')
    al_matches = list(al_pat.finditer(answer_text))

    # ── dotfill ──
    dotfills = list(re.finditer(r'\\dotfill', answer_text))

    if dotfills and not al_matches:
        ans = {"type": "multiline", "lines": len(dotfills), "style": "dotfill"}
        if space:
            ans["space"] = space
        return ans

    if not al_matches:
        # Check for \hfill expression answers (e.g. pmatrix with makebox/hrulefill)
        if re.search(r'\\hfill\b.*\\(makebox|hrulefill|DotLine)', answer_text):
            ans = {"type": "expression", "_rawAnswer": answer_text.strip()}
            if space:
                ans["space"] = space
            return ans
        if space:
            return {"type": "none", "space": space}
        return None

    # Parse each AnswerLine
    parsed = []
    for m in al_matches:
        cmd = m.group(1)
        pos = m.end()
        while pos < len(answer_text) and answer_text[pos] in ' \t':
            pos += 1
        prefix, pos = _match_brackets(answer_text, pos)
        suffix, pos = _match_brackets(answer_text, pos)
        parsed.append({'cmd': cmd, 'prefix': prefix, 'suffix': suffix})

    short_als = [a for a in parsed if a['cmd'] == 'AnswerLineShort']
    full_als = [a for a in parsed if a['cmd'] == 'AnswerLine']

    # ── Coordinate: (\AnswerLineShort , \AnswerLineShort) ──
    if re.search(r'\(\s*\\AnswerLineShort.*?,\s*\\AnswerLineShort', answer_text):
        pairs = re.findall(
            r'\(\s*\\AnswerLineShort[^)]*,\s*\\AnswerLineShort[^)]*\)',
            answer_text)
        n = max(len(pairs), 1)
        ans = {"type": "coordinate", "fields": n * 2}
        if parsed[0]['prefix']:
            ans["prefix"] = parsed[0]['prefix']
        # Store raw for perfect reproduction
        ans["_rawAnswer"] = answer_text.strip()
        if space:
            ans["space"] = space
        return ans

    # ── Vector: pmatrix ──
    for a in parsed:
        raw = (a['prefix'] or '') + (a['suffix'] or '')
        if 'pmatrix' in raw:
            ans = {"type": "vector", "fields": 2}
            if a['prefix']:
                ans["prefix"] = a['prefix']
            if space:
                ans["space"] = space
            return ans

    # ── Expression: ≥2 AnswerLineShort, no full AnswerLine ──
    if len(short_als) >= 2 and len(full_als) == 0:
        ans = {"type": "expression", "fields": len(short_als)}
        # Store raw for perfect reproduction
        ans["_rawAnswer"] = answer_text.strip()
        if space:
            ans["space"] = space
        return ans

    # ── Multiline: ≥2 full AnswerLine ──
    if len(full_als) >= 2:
        lines = []
        for a in full_als:
            p = a['prefix'] or ''
            s = a['suffix'] or ''
            line = f"{p} ____" if p else "____"
            if s:
                line += f" {s}"
            lines.append(line.strip())
        ans = {
            "type": "multiline",
            "lines": len(full_als),
            "template": "\\n".join(lines),
        }
        # Detect line separator: \vgap between AnswerLines or just blank line
        if '\\vgap' not in answer_text:
            ans["lineSep"] = "blank"
        if space:
            ans["space"] = space
        return ans

    # ── Single AnswerLine ──
    a = parsed[0]
    ans = {"type": "number"}
    if a['prefix']:
        ans["prefix"] = a['prefix']
    if a['suffix']:
        ans["suffix"] = a['suffix']
    if space:
        ans["space"] = space
    return ans


# ── Question Parser ────────────────────────────────────────────────────

def parse_question_tex(tex_content):
    """Parse a QuestionStatement.tex file into structured data.

    Returns dict with: marks, _rawBody, stem (Block[]), parts, answer.
    """
    m = re.match(
        r'\s*\\begin\{question\}\{(\d+)\}\s*(.*?)\s*\\end\{question\}\s*$',
        tex_content, re.DOTALL)
    if not m:
        return None

    total_marks = int(m.group(1))
    body = m.group(2)

    result = {
        'marks': total_marks,
        '_rawBody': body,
    }

    # Find \begin{parts}...\end{parts}
    parts_m = re.search(
        r'\\begin\{parts\}(.*?)\\end\{parts\}', body, re.DOTALL)

    if parts_m:
        # Extract stem (everything before \begin{parts})
        stem_raw = body[:parts_m.start()].strip()
        result['stem'] = tokenize_content(stem_raw)

        # Detect compact formatting
        after_begin_parts = parts_m.group(1)
        if after_begin_parts.startswith('\n\\') or after_begin_parts.startswith('\n '):
            result['_compactParts'] = True

        # No blank line before \end{parts}
        before_end_parts = body[parts_m.start():parts_m.end()]
        if not re.search(r'\n\s*\n\s*\\end\{parts\}', before_end_parts):
            result['_compactEndParts'] = True

        # No blank line between stem and \begin{parts}
        before_begin_parts = body[:parts_m.start()]
        if before_begin_parts.rstrip() and not re.search(r'\n\s*\n\s*$', before_begin_parts):
            result['_compactStemParts'] = True

        parsed_parts = _parse_parts(parts_m.group(1))
        if isinstance(parsed_parts, dict):
            if '_preItems' in parsed_parts:
                result['_preItems'] = parsed_parts['_preItems']
            if parsed_parts.get('_partCmd'):
                result['_partCmd'] = True
            result['parts'] = parsed_parts['parts']
        else:
            result['parts'] = parsed_parts

        # Compact items: all parts have marks=0 (inline list, no blank between items)
        parsed_part_list = parsed_parts if isinstance(parsed_parts, list) else parsed_parts.get('parts', [])
        if parsed_part_list and all(p.get('marks', 0) == 0 for p in parsed_part_list):
            result['_compactItems'] = True

        # Compact begin: no blank line after \begin{question}{N}
        # Check original tex_content (body has whitespace stripped by regex)
        if not stem_raw:
            begin_m = re.search(r'\\begin\{question\}\{\d+\}(.{0,4})', tex_content, re.DOTALL)
            if begin_m and '\n\n' not in begin_m.group(1):
                result['_compactBegin'] = True

        # Compact end: no blank line before \end{question}
        end_m = re.search(r'(.{0,4})\\end\{question\}', tex_content, re.DOTALL)
        after_end_parts_raw = body[parts_m.end():]
        if not after_end_parts_raw.strip() and end_m and '\n\n' not in end_m.group(1):
            result['_compactEnd'] = True

        # Check for content after \end{parts} (e.g. answer outside parts)
        after_parts = body[parts_m.end():].strip()
        if after_parts:
            content, answer, marks, compact = parse_answer_from_segment(after_parts)
            if content.strip():
                result['_postParts'] = tokenize_content(content.strip())
            if answer:
                result['answer'] = answer
            if compact:
                result['_compactMarks'] = True
            if marks > 0:
                result['marks'] = marks
    else:
        # No parts — single question with answer at the end
        content, answer, marks, compact = parse_answer_from_segment(body)
        result['stem'] = tokenize_content(content)
        result['answer'] = answer
        if compact:
            result['_compactMarks'] = True
        # Use marks from \Marks{} if found, else from \begin{question}{N}
        if marks > 0:
            result['marks'] = marks

    return result


def _parse_parts(parts_content):
    """Parse \\begin{parts} content into part list."""
    # Protect subparts/subsubparts environments
    sp_store = []

    def _store_sp(m):
        idx = len(sp_store)
        sp_store.append(m.group(0))
        return f'__SP{idx}__'

    protected = re.sub(
        r'\\begin\{subparts\}.*?\\end\{subparts\}',
        _store_sp, parts_content, flags=re.DOTALL)

    ssp_store = []

    def _store_ssp(m):
        idx = len(ssp_store)
        ssp_store.append(m.group(0))
        return f'__SSP{idx}__'

    protected = re.sub(
        r'\\begin\{subsubparts\}.*?\\end\{subsubparts\}',
        _store_ssp, protected, flags=re.DOTALL)

    # Detect if parts use \part command (Paper 1 style)
    uses_part_cmd = bool(re.search(r'\\part\b', protected))

    # Split by \item or \part
    items = re.split(r'\\(?:item|part)\b', protected)
    alpha_labels = [f'({chr(ord("a") + i)})' for i in range(26)]

    # Pre-items content (between \begin{parts} and first \item)
    pre_items_raw = items[0].strip() if items else ''

    parts = []
    for idx, raw in enumerate(items[1:]):  # Skip before first \item
        # Detect \item on own line: raw starts with \n (content on next line)
        item_newline = raw.startswith('\n') and not raw.strip().startswith(' ')
        # Detect blank line between \item and content (e.g. \item\n\n\relinput)
        item_blank_line = raw.startswith('\n\n')

        # Restore subparts
        restored = raw
        for i, sp in enumerate(sp_store):
            restored = restored.replace(f'__SP{i}__', sp)
        for i, ssp in enumerate(ssp_store):
            restored = restored.replace(f'__SSP{i}__', ssp)

        label = alpha_labels[idx] if idx < 26 else f'({idx + 1})'

        # Check for subparts
        sp_m = re.search(
            r'\\begin\{subparts\}(.*?)\\end\{subparts\}',
            restored, re.DOTALL)

        if sp_m:
            before = restored[:sp_m.start()].strip()
            # Detect compact content before \begin{subparts}: no blank line between
            before_raw = restored[:sp_m.start()]
            compact_content_sp = before.strip() and not re.search(r'\n\s*\n\s*$', before_raw)

            sp_result = _parse_subparts(sp_m.group(1))
            part = {
                'label': label,
                'content': tokenize_content(before),
                'subparts': sp_result['subparts'],
            }
            if compact_content_sp:
                part['_compactContentSubparts'] = True
            if sp_result.get('_subpartCmd') == 'item':
                part['_subpartCmd'] = 'item'
            if sp_result.get('_compactEndSubparts'):
                part['_compactEndSubparts'] = True
            if sp_result.get('_spacedBeginSubparts'):
                part['_spacedBeginSubparts'] = True
            # Detect \item \begin{subparts} on same line (raw starts with space, not newline)
            if not before and not raw.startswith('\n') and restored.lstrip().startswith('\\begin{subparts}'):
                part['_itemInlineSubparts'] = True
        else:
            content, answer, marks, compact = parse_answer_from_segment(restored)
            part = {
                'label': label,
                'content': tokenize_content(content.strip()),
                'answer': answer,
                'marks': marks,
            }
            if compact:
                part['_compactMarks'] = True
        if item_newline:
            part['_itemNewline'] = True
        if item_blank_line:
            part['_itemBlankLine'] = True

        parts.append(part)

    result = parts
    # Attach pre-items content or metadata
    if pre_items_raw or uses_part_cmd:
        result_dict = {'parts': parts}
        if pre_items_raw:
            result_dict['_preItems'] = tokenize_content(pre_items_raw)
        if uses_part_cmd:
            result_dict['_partCmd'] = True
        result = result_dict
    return result


def _parse_subparts(content):
    """Parse subpart items."""
    # Protect subsubparts
    ssp_store = []

    def _store(m):
        idx = len(ssp_store)
        ssp_store.append(m.group(0))
        return f'__SSP{idx}__'

    protected = re.sub(
        r'\\begin\{subsubparts\}.*?\\end\{subsubparts\}',
        _store, content, flags=re.DOTALL)

    # Detect whether subparts use \item or \subpart
    uses_item = bool(re.search(r'\\item\b', content))
    items = re.split(r'\\(?:item|subpart)\b', protected)
    roman = ['(i)', '(ii)', '(iii)', '(iv)', '(v)', '(vi)', '(vii)', '(viii)',
             '(ix)', '(x)', '(xi)', '(xii)']

    subparts = []
    for idx, raw in enumerate(items[1:]):
        restored = raw
        for i, ssp in enumerate(ssp_store):
            restored = restored.replace(f'__SSP{i}__', ssp)

        label = roman[idx] if idx < len(roman) else f'({idx + 1})'

        # Check for subsubparts
        ssp_m = re.search(
            r'\\begin\{subsubparts\}(.*?)\\end\{subsubparts\}',
            restored, re.DOTALL)

        if ssp_m:
            before = restored[:ssp_m.start()].strip()
            subsubparts = _parse_subsubparts(ssp_m.group(1))
            sp = {
                'label': label,
                'content': tokenize_content(before),
                'subsubparts': subsubparts,
            }
        else:
            content_text, answer, marks, compact = parse_answer_from_segment(restored)
            sp = {
                'label': label,
                'content': tokenize_content(content_text.strip()),
                'answer': answer,
                'marks': marks,
            }
            if compact:
                sp['_compactMarks'] = True

        subparts.append(sp)

    # Detect compact end: no blank line before \end{subparts}
    # Check raw content (NOT rstripped) for trailing blank line
    compact_end = not re.search(r'\n\s*\n\s*$', content)

    # Detect blank line after \begin{subparts} (before first \item/\subpart)
    spaced_begin = bool(re.match(r'\s*\n\s*\n', content))

    result = {
        'subparts': subparts,
        '_subpartCmd': 'item' if uses_item else 'subpart',
        '_compactEndSubparts': compact_end,
    }
    if spaced_begin:
        result['_spacedBeginSubparts'] = True
    return result


def _parse_subsubparts(content):
    """Parse subsubpart items."""
    items = re.split(r'\\(?:item|subsubpart)\b', content)
    letters = [f'({chr(ord("p") + i)})' for i in range(10)]

    subsubparts = []
    for idx, raw in enumerate(items[1:]):
        content_text, answer, marks, compact = parse_answer_from_segment(raw)
        label = letters[idx] if idx < len(letters) else f'({idx + 1})'
        ssp = {
            'label': label,
            'content': tokenize_content(content_text.strip()),
            'answer': answer,
            'marks': marks,
        }
        if compact:
            ssp['_compactMarks'] = True
        subsubparts.append(ssp)

    return subsubparts


# ── Update Question ────────────────────────────────────────────────────

def update_question(q, parsed):
    """Update an existing JSON question with high-fidelity parsed data.

    Preserves all non-structural fields (topic, subtopic, tags, etc.).
    Updates: stem, parts, answer, marks, _rawBody.
    """
    q['_rawBody'] = parsed['_rawBody']
    q['marks'] = parsed['marks']
    q['stem'] = parsed['stem']
    if '_preItems' in parsed:
        q['_preItems'] = parsed['_preItems']
    else:
        q.pop('_preItems', None)

    # Formatting flags
    for flag in ('_compactParts', '_compactMarks', '_compactEndParts', '_compactStemParts',
                 '_compactBegin', '_compactEnd', '_partCmd', '_compactItems'):
        if parsed.get(flag):
            q[flag] = True
        else:
            q.pop(flag, None)

    # Post-parts content (content after \end{parts})
    if '_postParts' in parsed:
        q['_postParts'] = parsed['_postParts']
    else:
        q.pop('_postParts', None)

    if 'answer' in parsed and parsed['answer'] is not None:
        q['answer'] = parsed['answer']
    else:
        q.pop('answer', None)

    if 'parts' in parsed:
        # Map parsed parts onto existing JSON parts
        existing_parts = q.get('parts', [])
        new_parts = parsed['parts']

        merged = []
        for i, np in enumerate(new_parts):
            # Start with existing part data (to preserve extra fields)
            if i < len(existing_parts):
                ep = dict(existing_parts[i])
            else:
                ep = {}

            ep['label'] = np['label']
            ep['content'] = np['content']

            if 'subparts' in np:
                # Container part with subparts
                if np.get('_subpartCmd'):
                    ep['_subpartCmd'] = np['_subpartCmd']
                else:
                    ep.pop('_subpartCmd', None)
                existing_sps = ep.get('subparts', [])
                new_sps = []
                for j, nsp in enumerate(np['subparts']):
                    esp = dict(existing_sps[j]) if j < len(existing_sps) else {}
                    esp['label'] = nsp['label']
                    esp['content'] = nsp['content']
                    if nsp.get('answer') is not None:
                        esp['answer'] = nsp['answer']
                    else:
                        esp.pop('answer', None)
                    if 'marks' in nsp:
                        esp['marks'] = nsp['marks']
                    if nsp.get('_compactMarks'):
                        esp['_compactMarks'] = True
                    else:
                        esp.pop('_compactMarks', None)

                    if 'subsubparts' in nsp:
                        existing_ssps = esp.get('subsubparts', [])
                        new_ssps = []
                        for k, nssp in enumerate(nsp['subsubparts']):
                            essp = dict(existing_ssps[k]) if k < len(existing_ssps) else {}
                            essp['label'] = nssp['label']
                            essp['content'] = nssp['content']
                            if nssp.get('answer') is not None:
                                essp['answer'] = nssp['answer']
                            else:
                                essp.pop('answer', None)
                            if 'marks' in nssp:
                                essp['marks'] = nssp['marks']
                            new_ssps.append(essp)
                        esp['subsubparts'] = new_ssps

                    new_sps.append(esp)
                ep['subparts'] = new_sps
                # Remove leaf-part fields from container
                ep.pop('answer', None)
                ep.pop('marks', None)
            else:
                if np.get('answer') is not None:
                    ep['answer'] = np['answer']
                else:
                    ep.pop('answer', None)
                if 'marks' in np:
                    ep['marks'] = np['marks']
                if np.get('_compactMarks'):
                    ep['_compactMarks'] = True
                else:
                    ep.pop('_compactMarks', None)

            # Formatting flags
            for pflag in ('_itemNewline', '_itemBlankLine', '_itemInlineSubparts',
                          '_compactEndSubparts', '_spacedBeginSubparts',
                          '_compactContentSubparts'):
                if np.get(pflag):
                    ep[pflag] = True
                else:
                    ep.pop(pflag, None)

            merged.append(ep)

        q['parts'] = merged
    else:
        # No parts
        if parsed.get('answer') is not None:
            q['answer'] = parsed['answer']

    return True


# ── Main ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='High-fidelity block re-parser for CIE questions')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without writing')
    parser.add_argument('--paper', type=str, default=None,
                        help='Filter by paper (e.g. 2025OctNov-Paper43)')
    parser.add_argument('--verbose', '-v', action='store_true')
    args = parser.parse_args()

    print(f"Loading {PAPERS_JSON}...")
    with open(PAPERS_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data['questions']

    # Filter
    if args.paper:
        targets = [q for q in questions if q.get('paper') == args.paper]
    else:
        targets = questions

    targets.sort(key=lambda q: q.get('qnum', 0))

    report = {
        'total': len(targets),
        'source_found': 0,
        'source_missing': 0,
        'parse_ok': 0,
        'parse_fail': 0,
        'updated': 0,
        'part_count_mismatch': 0,
        'errors': [],
    }

    for q in targets:
        qid = q['id']
        tex_path = id_to_tex_path(qid)
        if not tex_path:
            report['source_missing'] += 1
            continue
        report['source_found'] += 1

        try:
            tex_content = tex_path.read_text(encoding='utf-8')
        except Exception as e:
            report['parse_fail'] += 1
            report['errors'].append(f'{qid}: read error: {e}')
            continue

        parsed = parse_question_tex(tex_content)
        if not parsed:
            report['parse_fail'] += 1
            report['errors'].append(f'{qid}: parse failed')
            continue

        report['parse_ok'] += 1

        # Check part count consistency
        existing_part_count = len(q.get('parts', []))
        parsed_part_count = len(parsed.get('parts', []))
        if existing_part_count > 0 and parsed_part_count > 0:
            # For hierarchical questions, existing might have flat parts
            # while parsed has fewer container parts
            # This is expected — we use parsed structure
            pass

        if update_question(q, parsed):
            report['updated'] += 1

        if args.verbose:
            stem_blocks = len(parsed.get('stem', []))
            parts_count = parsed_part_count
            ans_type = (parsed.get('answer', {}) or {}).get('type', '-')
            print(f"  {qid}: stem={stem_blocks} blocks, "
                  f"parts={parts_count}, ans={ans_type}")

    # Report
    print(f"\n{'=' * 60}")
    print(f"  HIGH-FIDELITY FIX REPORT {'(DRY RUN)' if args.dry_run else ''}")
    print(f"{'=' * 60}")
    print(f"  Target questions:  {report['total']}")
    print(f"  Source found:      {report['source_found']}")
    print(f"  Source missing:    {report['source_missing']}")
    print(f"  Parse OK:          {report['parse_ok']}")
    print(f"  Parse failed:      {report['parse_fail']}")
    print(f"  Updated:           {report['updated']}")

    if report['errors']:
        print(f"\n  Errors ({len(report['errors'])}):")
        for e in report['errors'][:20]:
            print(f"    {e}")

    # Write
    if not args.dry_run and report['updated'] > 0:
        print(f"\n  Writing {PAPERS_JSON}...")
        with open(PAPERS_JSON, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        print("  Done!")
    else:
        print(f"\n  DRY RUN — no files modified.")


if __name__ == '__main__':
    main()
