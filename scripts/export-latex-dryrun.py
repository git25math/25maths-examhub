#!/usr/bin/env python3
r"""
Dry-run: JSON → QuestionStatement.tex 转换器
逐题生成 LaTeX 并与原文 diff，验证转换逻辑。

Two export modes:
  1. _rawBody mode — if question has _rawBody, use it directly (perfect fidelity)
  2. Block mode — reconstruct from structured blocks (for edited questions)
"""
import json, os, re, sys, difflib

CIE_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2'
DATA_FILE = '/Users/zhuxingzhe/Project/ExamBoard/25Maths-Keywords/data/papers-cie.json'

# ────── Block → LaTeX ──────

def render_blocks(blocks):
    """Convert Block[] to LaTeX string."""
    if not blocks:
        return ''
    parts = []
    for b in blocks:
        t = b.get('type', '')
        if t == 'text':
            parts.append(b.get('content', ''))
        elif t == 'table':
            parts.append(b.get('content', ''))
        elif t == 'figure':
            src = b.get('src', '')
            if src:
                parts.append(f'\\relinput{{{src}}}')
            else:
                parts.append('%% [FIGURE PLACEHOLDER]')
        elif t == 'space':
            h = b.get('height', '0.8em')
            cmd = b.get('cmd', 'vgap')
            if cmd == 'vspace':
                parts.append(f'\\vspace{{{h}}}')
            elif cmd == 'linebreak':
                parts.append(f'\\\\[{h}]')
            elif h == '0.8em':
                parts.append('\\vgap')
            else:
                parts.append(f'\\vgap[{h}]')
        elif t == 'list':
            style = b.get('style', 'bullet')
            tag = 'enumerate' if style == 'number' else 'itemize'
            items = '\n'.join(f'\\item {it}' for it in b.get('items', []))
            parts.append(f'\\begin{{{tag}}}\n{items}\n\\end{{{tag}}}')
    return '\n\n'.join(parts)


def blocks_end_with_space(blocks):
    """Check if blocks list ends with a space block."""
    return blocks and blocks[-1].get('type') == 'space'


# ────── Answer → LaTeX ──────

def render_answer(answer):
    """Convert answer object to LaTeX string."""
    if not answer:
        return ''
    t = answer.get('type', 'none')

    # Answer space
    space_latex = ''
    space = answer.get('space')
    if space:
        stype = space.get('type', 'working')
        height = space.get('height', '3cm')
        cmd = space.get('cmd', '')
        if cmd == 'vspace':
            space_latex = f'\\vspace{{{height}}}\n'
        elif stype == 'working':
            space_latex = f'\\WorkingSpace{{{height}}}\n'
        else:
            space_latex = f'\\Answerspace[{height}]\n'

    if t == 'none':
        return space_latex.rstrip('\n')

    # Raw answer (for expression/special formats)
    # _rawAnswer is self-contained (includes any space commands already)
    raw = answer.get('_rawAnswer')
    if raw:
        return raw

    pfx = answer.get('prefix', '')
    sfx = answer.get('suffix', '')

    if t == 'number':
        return space_latex + f'\\AnswerLine[{pfx}][{sfx}]'

    elif t == 'vector':
        vec_label = pfx if pfx else ''
        return space_latex + f'\\AnswerVector[{vec_label}]'

    elif t == 'coordinate':
        coord_label = pfx if pfx else ''
        fields = answer.get('fields', 2)
        if fields > 2:
            tpl = answer.get('template', '')
            latex_tpl = tpl.replace('____', '\\DotLine{13}')
            return space_latex + f'\\par\\noindent\\hfill {latex_tpl}\\par'
        return space_latex + f'\\AnswerCoordinate[{coord_label}]'

    elif t == 'multiline':
        style = answer.get('style', '')
        if style == 'dotfill':
            # Dotfill description answer
            # First \vgap is in content blocks; only add \vgap between dotfills
            n_lines = answer.get('lines', 2)
            dotfill_parts = []
            for i in range(n_lines):
                if i > 0:
                    dotfill_parts.append('')
                    dotfill_parts.append('\\vgap')
                dotfill_parts.append('')
                dotfill_parts.append('\\dotfill')
            return space_latex + '\n'.join(dotfill_parts)

        tpl = answer.get('template', '')
        lines_count = answer.get('lines', 3)

        if tpl:
            # Template-based: each line becomes an \AnswerLine
            tpl_lines = tpl.split('\\n')
            line_sep = answer.get('lineSep', 'vgap')  # 'vgap' or 'blank'
            result = []
            for i, tl in enumerate(tpl_lines):
                # Parse template line: "prefix ____ suffix"
                # Extract prefix and suffix around ____
                m = re.match(r'^(.*?)\s*____\s*(.*)$', tl)
                if m:
                    p = m.group(1).strip()
                    s = m.group(2).strip()
                    result.append(f'\\AnswerLine[{p}][{s}]')
                else:
                    result.append(f'\\AnswerLine[][]')
                if i < len(tpl_lines) - 1:
                    result.append('')
                    if line_sep == 'vgap':
                        result.append('\\vgap')
                        result.append('')
            return space_latex + '\n'.join(result)

        return space_latex + f'\\answerlines[{lines_count}]'

    elif t == 'expression':
        tpl = answer.get('template', '')
        if tpl:
            latex_tpl = tpl.replace('____', '\\DotLine{13}')
            return space_latex + f'\\par\\noindent\\hfill {pfx}{latex_tpl} {sfx}\\par'
        return space_latex + f'\\AnswerLine[{pfx}][{sfx}]'

    elif t == 'table_input':
        return space_latex

    return space_latex


# ────── Question → LaTeX (Block mode) ──────

def export_question_from_blocks(q):
    """Reconstruct LaTeX from structured blocks (fallback for edited questions)."""
    marks = q.get('marks', 0)
    stem = q.get('stem', [])
    parts = q.get('parts', [])
    answer = q.get('answer')

    # Compact begin: no blank line after \begin{question}{N}
    if q.get('_compactBegin'):
        lines = [f'\\begin{{question}}{{{marks}}}']
    else:
        lines = [f'\\begin{{question}}{{{marks}}}', '']

    # Part command: \part vs \item
    part_cmd = 'part' if q.get('_partCmd') else 'item'

    # Stem
    stem_latex = render_blocks(stem)
    stem_ends_vspace = stem and stem[-1].get('type') == 'space' and stem[-1].get('cmd') == 'vspace'
    if stem_latex:
        lines.append(stem_latex)

    if not parts and not q.get('_postParts'):
        # No parts — stem + answer + marks
        ans_latex = render_answer(answer)
        if ans_latex:
            if not stem_ends_vspace:
                lines.append('')
            lines.append(ans_latex)
            if not q.get('_compactMarks'):
                lines.append('')
        elif not q.get('_compactMarks'):
            lines.append('')
        lines.append(f'\\Marks{{{marks}}}')
    else:
        if stem_latex and not q.get('_compactStemParts'):
            lines.append('')
        compact_parts = q.get('_compactParts', False)
        lines.append('\\begin{parts}')
        # Pre-items content (between \begin{parts} and first \item)
        pre_items = q.get('_preItems', [])
        if pre_items:
            lines.append('')
            lines.append(render_blocks(pre_items))
        compact_items = q.get('_compactItems', False)
        for idx_p, p in enumerate(parts):
            # First \item: blank line only if not compact parts style
            if idx_p == 0 and not compact_parts:
                lines.append('')
            elif idx_p > 0 and not compact_items:
                lines.append('')
            p_content = render_blocks(p.get('content', []))
            p_blocks = p.get('content', [])

            # Render \item line
            if p.get('_itemInlineSubparts'):
                # \item \begin{subparts} on same line — handled below
                pass
            elif p_content and p.get('_itemBlankLine'):
                lines.append(f'\\{part_cmd}')
                lines.append('')
                lines.append(p_content)
            elif p_content and p.get('_itemNewline'):
                lines.append(f'\\{part_cmd}')
                lines.append(p_content)
            elif p_content:
                lines.append(f'\\{part_cmd} {p_content}')
            else:
                lines.append(f'\\{part_cmd}')

            subparts = p.get('subparts', [])
            if subparts:
                compact_end_sp = p.get('_compactEndSubparts', False)
                spaced_begin_sp = p.get('_spacedBeginSubparts', False)

                if p.get('_itemInlineSubparts'):
                    # \item \begin{subparts} on same line
                    lines.append(f'\\{part_cmd} \\begin{{subparts}}')
                else:
                    # Don't add blank line before \begin{subparts} if content is empty
                    # or if compact content before subparts
                    p_content_blocks = p.get('content', [])
                    if p_content_blocks and not p.get('_compactContentSubparts'):
                        lines.append('')
                    lines.append('\\begin{subparts}')

                sp_cmd = 'item' if p.get('_subpartCmd') == 'item' else 'subpart'
                for sp_idx, sp in enumerate(subparts):
                    # Blank line after \begin{subparts} or between subparts
                    if sp_idx == 0 and spaced_begin_sp:
                        lines.append('')
                    elif sp_idx == 0 and not spaced_begin_sp:
                        pass  # no blank line before first subpart
                    # (blank line between subparts handled by end-of-loop)

                    sp_content = render_blocks(sp.get('content', []))
                    lines.append(f'\\{sp_cmd} {sp_content}')

                    subsubparts = sp.get('subsubparts', [])
                    if subsubparts:
                        lines.append('\\begin{subsubparts}')
                        for ssp in subsubparts:
                            ssp_content = render_blocks(ssp.get('content', []))
                            lines.append(f'\\subsubpart {ssp_content}')
                            ssp_ans = render_answer(ssp.get('answer'))
                            if ssp_ans:
                                lines.append('')
                                lines.append(ssp_ans)
                            lines.append(f'\\Marks{{{ssp.get("marks", 0)}}}')
                            lines.append('')
                        lines.append('\\end{subsubparts}')
                    else:
                        sp_ans = render_answer(sp.get('answer'))
                        if sp_ans:
                            sp_answer = sp.get('answer', {})
                            if not sp_answer.get('_compactAnswer'):
                                lines.append('')
                            lines.append(sp_ans)
                        elif not sp.get('_compactMarks'):
                            lines.append('')
                        lines.append(f'\\Marks{{{sp.get("marks", 0)}}}')
                    # Add blank line after subpart (skip for last one if compact)
                    if sp_idx < len(subparts) - 1 or not compact_end_sp:
                        lines.append('')
                lines.append('\\end{subparts}')
            else:
                p_marks = p.get('marks', 0)
                p_ans = render_answer(p.get('answer'))
                if p_marks > 0:
                    if p_ans:
                        p_answer = p.get('answer', {})
                        if not p_answer.get('_compactAnswer'):
                            lines.append('')
                        lines.append(p_ans)
                        # Dotfill answers need blank line before \Marks (unless compact)
                        p_answer = p.get('answer', {})
                        if p_answer.get('style') == 'dotfill' and not p.get('_compactMarks'):
                            lines.append('')
                    elif not p.get('_compactMarks'):
                        # No answer — add blank line before \Marks (unless compact)
                        lines.append('')
                    lines.append(f'\\Marks{{{p_marks}}}')

        if not q.get('_compactEndParts'):
            lines.append('')
        lines.append('\\end{parts}')

        # Post-parts content (e.g. answer after \end{parts})
        post_parts = q.get('_postParts', [])
        if post_parts or (answer and parts):
            lines.append('')
            if post_parts:
                lines.append(render_blocks(post_parts))
            if answer:
                pp_ans = render_answer(answer)
                if pp_ans:
                    if post_parts:
                        lines.append('')
                    lines.append(pp_ans)
            if not q.get('_compactMarks'):
                lines.append('')
            lines.append(f'\\Marks{{{marks}}}')

    if not q.get('_compactEnd'):
        lines.append('')
    lines.append('\\end{question}')

    return '\n'.join(lines)


# ────── Question → LaTeX (High-fidelity) ──────

def export_question(q):
    """Export a question to LaTeX.

    Uses _rawBody for perfect fidelity if available.
    Falls back to block-based reconstruction.
    """
    marks = q.get('marks', 0)
    raw_body = q.get('_rawBody')

    if raw_body:
        begin_sep = '\n' if q.get('_compactBegin') else '\n\n'
        end_sep = '\n' if q.get('_compactEnd') else '\n\n'
        return f'\\begin{{question}}{{{marks}}}{begin_sep}{raw_body}{end_sep}\\end{{question}}'

    return export_question_from_blocks(q)


# ────── ID → Path mapping ──────

def id_to_dir(q_id):
    parts = q_id.split('-')
    session = parts[1]
    paper = parts[2]
    qnum = parts[3]
    return os.path.join(CIE_ROOT, 'PastPapers', session, paper, 'Questions', qnum)


# ────── Diff comparison ──────

def normalize_latex(tex):
    """Normalize LaTeX for comparison (strip whitespace variance)."""
    lines = [l.rstrip() for l in tex.strip().split('\n')]
    result = []
    prev_blank = False
    for l in lines:
        if l == '':
            if not prev_blank:
                result.append('')
            prev_blank = True
        else:
            result.append(l)
            prev_blank = False
    return '\n'.join(result)


# ────── Main ──────

def main():
    paper_filter = sys.argv[1] if len(sys.argv) > 1 else '2025OctNov-Paper43'
    mode = sys.argv[2] if len(sys.argv) > 2 else 'auto'  # auto | raw | blocks

    with open(DATA_FILE) as f:
        data = json.load(f)

    if paper_filter == 'all':
        qs = data['questions']
    elif '-Paper' in paper_filter:
        qs = [q for q in data['questions'] if q.get('paper') == paper_filter]
    else:
        # Session-level filter (e.g., "2025OctNov" matches all papers in that session)
        qs = [q for q in data['questions'] if q.get('paper', '').startswith(paper_filter)]
    qs.sort(key=lambda q: q['qnum'])

    print(f'Paper: {paper_filter} ({len(qs)} questions)')
    print(f'Export mode: {mode}')
    print('=' * 70)

    issues = []
    raw_count = 0
    block_count = 0

    for q in qs:
        q_dir = id_to_dir(q['id'])
        orig_file = os.path.join(q_dir, 'QuestionStatement.tex')

        # Read original
        if os.path.exists(orig_file):
            with open(orig_file) as f:
                orig = f.read()
        else:
            orig = '[FILE NOT FOUND]'

        # Generate based on mode
        if mode == 'raw' or (mode == 'auto' and q.get('_rawBody')):
            generated = export_question(q)
            used_mode = 'raw' if q.get('_rawBody') else 'blocks'
        elif mode == 'blocks':
            generated = export_question_from_blocks(q)
            used_mode = 'blocks'
        else:
            generated = export_question(q)
            used_mode = 'raw' if q.get('_rawBody') else 'blocks'

        if used_mode == 'raw':
            raw_count += 1
        else:
            block_count += 1

        # Compare
        orig_norm = normalize_latex(orig)
        gen_norm = normalize_latex(generated)

        if orig_norm == gen_norm:
            status = '✓ MATCH'
        else:
            status = '✗ DIFF'
            diff = list(difflib.unified_diff(
                orig_norm.split('\n'),
                gen_norm.split('\n'),
                fromfile='original',
                tofile='generated',
                lineterm=''
            ))
            issues.append((q['id'], diff, used_mode))

        print(f'\n{q["id"]:45s} [{used_mode:6s}] {status}')

        if status == '✗ DIFF':
            for d in issues[-1][1][:30]:
                print(f'  {d}')
            if len(issues[-1][1]) > 30:
                print(f'  ... ({len(issues[-1][1])-30} more lines)')

    print('\n' + '=' * 70)
    print(f'Results: {len(qs) - len(issues)}/{len(qs)} match, {len(issues)} diffs')
    print(f'Mode usage: {raw_count} raw, {block_count} blocks')

    if issues:
        print('\nQuestions with diffs:')
        for qid, _, m in issues:
            print(f'  - {qid} [{m}]')


if __name__ == '__main__':
    main()
