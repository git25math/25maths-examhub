#!/usr/bin/env python3
"""
build-pastpaper-data.py — Extract CIE 0580 past paper questions from IGCSE_v2 tagged JSON.

Input:  IGCSE_v2/analysis/data/algebra_questions_tagged.json
Output: data/pastpapers-cie.json

Usage:
  python3 scripts/build-pastpaper-data.py
  python3 scripts/build-pastpaper-data.py --section 2.5
  python3 scripts/build-pastpaper-data.py --all
"""

import json
import os
import re
import sys

IGCSE_ROOT = "/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2"
TAGGED_FILE = os.path.join(IGCSE_ROOT, "analysis/data/algebra_questions_tagged.json")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "pastpapers-cie.json")


def clean_latex(raw):
    """Clean question_text from IGCSE_v2 format to KaTeX-renderable LaTeX."""
    tex = raw

    # === Phase 1: Remove structural wrappers ===

    # \begin{question}{n} ... \end{question}
    tex = re.sub(r'\\begin\{question\}\{\d+\}\s*', '', tex)
    tex = re.sub(r'\\end\{question\}\s*$', '', tex)

    # \begin{parts}...\end{parts} with \item → (a), (b), etc.
    def replace_parts(m):
        body = m.group(1)
        items = re.split(r'\\item\s*', body)
        items = [it.strip() for it in items if it.strip()]
        result = []
        for i, item in enumerate(items):
            label = chr(ord('a') + i)
            result.append('(' + label + ') ' + item)
        return '\n\n'.join(result)

    tex = re.sub(r'\\begin\{parts\}(.*?)\\end\{parts\}', replace_parts, tex, flags=re.DOTALL)

    # \begin{center}...\end{center} → keep content
    tex = re.sub(r'\\begin\{center\}\s*', '', tex)
    tex = re.sub(r'\\end\{center\}\s*', '', tex)

    # === Phase 2: Remove exam-specific commands ===

    tex = re.sub(r'\\Marks\{\d+\}', '', tex)
    tex = re.sub(r'\\AnswerLine(?:Short)?(?:\[.*?\])*', '', tex)
    tex = re.sub(r'\\answerlines(?:\[\d+\])?', '', tex)
    tex = re.sub(r'\\Answerspace(?:\[.*?\])?', '', tex)
    tex = re.sub(r'\\WorkingSpace\{[^}]*\}', '', tex)
    tex = re.sub(r'\\ImplicitPart', '', tex)

    # \PartLabel{b} → (b)
    tex = re.sub(r'\\PartLabel\{([^}]*)\}', r'(\1)', tex)

    # \StemText{...} → extract content (remove wrapper, keep content)
    tex = re.sub(r'\\StemText\{', '', tex)

    # \subpart → sub-part marker, treat as bullet
    tex = re.sub(r'\\subpart\b', '', tex)

    # === Phase 3: Remove spacing/layout commands ===

    tex = re.sub(r'\\vgap(?:\[.*?\])?', '', tex)
    tex = re.sub(r'\\vspace\{[^}]*\}', '', tex)
    tex = re.sub(r'\\hspace\{[^}]*\}', '', tex)
    tex = re.sub(r'\\hfill\b', '', tex)
    tex = re.sub(r'\\noindent\b', '', tex)
    tex = re.sub(r'\\newline\b', '\n', tex)
    tex = re.sub(r'\\footnotesize\b', '', tex)
    tex = re.sub(r'\\dotfill\b', '...', tex)
    tex = re.sub(r'\\hrulefill\b', '---', tex)
    tex = re.sub(r'\\makebox\[[^\]]*\]\{[^}]*\}', '......', tex)

    # Remaining \item outside parts
    tex = re.sub(r'\\item\b\s*', '', tex)

    # === Phase 4: Remove figure/TikZ commands ===

    tex = re.sub(r'\\relinput\{[^}]*\}', '', tex)
    tex = re.sub(r'\\relincludegraphics\{[^}]*\}', '', tex)
    # TikZ: \draw, \node, \coordinate (usually inside tikzpicture)
    tex = re.sub(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', '', tex, flags=re.DOTALL)
    tex = re.sub(r'\\draw\b[^;]*;', '', tex)
    tex = re.sub(r'\\node\b[^;]*;', '', tex)
    tex = re.sub(r'\\coordinate\b[^;]*;', '', tex)

    # === Phase 5: Text formatting ===

    tex = tex.replace('\\textdollar', '\\$')
    tex = tex.replace('\\par\\par', '\n\n')
    tex = tex.replace('\\par', '\n')

    # \textbf{...} outside math → **bold**
    tex = re.sub(r'\\textbf\{(.*?)\}', r'**\1**', tex)

    # === Phase 6: Clean answer blanks and residue ===

    # Dotted answer blanks: "t = ....................."
    tex = re.sub(r'\.{5,}', '', tex)
    # Lines that are only "x = " or "y = " (answer indicators after removing blanks)
    # Keep them if they have more content, remove if standalone
    tex = re.sub(r'\n[a-zA-Z]\s*=\s*\\\\?\s*$', '', tex, flags=re.MULTILINE)
    # Orphaned closing brace from \StemText
    tex = re.sub(r'\n\}\s*$', '', tex)
    tex = re.sub(r'^\}\s*\n', '', tex)

    # === Phase 7: Normalize whitespace ===

    tex = re.sub(r'\n{3,}', '\n\n', tex)
    tex = re.sub(r'\n[ \t]+\n', '\n\n', tex)
    # Remove trailing \\ only on lines that look like answer lines (e.g., "x = \\")
    # Don't touch \\ inside math environments
    tex = re.sub(r'^([a-zA-Z]\s*=\s*)\\\\\s*$', r'\1', tex, flags=re.MULTILINE)
    tex = tex.strip()

    return tex


def parse_parts(raw):
    """Extract parts structure: [{label, marks}] from question_text."""
    parts = []
    # Find all \item ... \Marks{n} patterns
    items = re.split(r'\\item\s*', raw)
    if len(items) <= 1:
        return parts  # No parts structure

    for i, item in enumerate(items[1:], start=0):  # skip first empty split
        label = '(' + chr(ord('a') + i) + ')'
        marks_match = re.search(r'\\Marks\{(\d+)\}', item)
        marks = int(marks_match.group(1)) if marks_match else 0
        parts.append({"label": label, "marks": marks})

    return parts


def classify_qtype(qt):
    """Classify granular qtype into broad groups."""
    q = qt.lower()
    if 'simultaneous' in q:
        if 'quadratic' in q or 'non-linear' in q:
            return 'simul-nonlinear'
        return 'simul-linear'
    if 'rearrang' in q or ('change' in q and 'subject' in q) or ('changing' in q and 'subject' in q):
        return 'rearrange'
    if 'quadratic' in q:
        return 'quadratic'
    if 'linear equation' in q or 'linear inequality' in q:
        return 'linear'
    return 'mixed'


def build_source_ref(q):
    """Build human-readable source reference: 0580/22/M/23 Q7."""
    paper = q.get("paper", "")
    session = q.get("session", "")
    year = q.get("year", 0)

    # Session code: March→M, MayJune/June→M/J, OctNov/November→O/N, FebMarch→F/M
    session_map = {
        "March": "M",
        "MayJune": "M/J",
        "June": "M/J",
        "OctNov": "O/N",
        "November": "O/N",
        "FebMarch": "F/M",
    }
    sess_code = session_map.get(session, session[0] if session else "?")
    year_short = str(year)[-2:] if year else "??"
    qnum = q.get("question_number", "?")

    return f"0580/{paper}/{sess_code}/{year_short} Q{qnum}"


def determine_difficulty(q):
    """Map paper_type to difficulty: 1=Core, 2=Extended."""
    pt = q.get("paper_type", "")
    if "Extended" in pt:
        return 2
    return 1


def process_questions(questions, section_filter=None):
    """Process tagged questions into pastpaper format."""
    results = []

    for q in questions:
        subtopic = q.get("primary_subtopic") or ""
        if not subtopic:
            continue

        # Filter by section if specified
        if section_filter:
            # Match C{section} or E{section}
            section_num = subtopic.lstrip("CE")
            if section_num != section_filter:
                continue
        else:
            # Default: only 2.5 for pilot
            section_num = subtopic.lstrip("CE")
            if section_num != "2.5":
                continue

        raw_tex = q.get("question_text", "")
        if not raw_tex:
            continue

        parts = parse_parts(raw_tex)

        # Fix zero marks: extract from \begin{question}{N}
        total_marks = q.get("total_marks", 0)
        if total_marks == 0:
            wrapper_match = re.search(r'\\begin\{question\}\{(\d+)\}', raw_tex)
            if wrapper_match:
                total_marks = int(wrapper_match.group(1))

        cleaned = clean_latex(raw_tex)

        # Check for figure references
        has_figure = q.get("has_figure", False) or "\\relinput" in raw_tex

        entry = {
            "id": q["id"],
            "s": section_num,
            "d": determine_difficulty(q),
            "cat": "algebra",
            "topic": "Equations",
            "qtype": q.get("question_type", ""),
            "g": classify_qtype(q.get("question_type", "")),
            "src": build_source_ref(q),
            "year": q.get("year", 0),
            "session": q.get("session", ""),
            "paper": q.get("paper", ""),
            "marks": total_marks,
            "cognitive": q.get("cognitive_level", "apply"),
            "tex": cleaned,
            "parts": parts,
            "hasFigure": has_figure
        }

        results.append(entry)

    # Sort by year desc, then paper, then question number
    results.sort(key=lambda x: (-x["year"], x["paper"], x["id"]))

    return results


def main():
    section = "2.5"  # default pilot section
    if "--section" in sys.argv:
        idx = sys.argv.index("--section")
        if idx + 1 < len(sys.argv):
            section = sys.argv[idx + 1]
    elif "--all" in sys.argv:
        section = None

    # Load tagged data
    print(f"Loading: {TAGGED_FILE}")
    with open(TAGGED_FILE) as f:
        data = json.load(f)

    questions = data.get("questions", [])
    print(f"Total questions in source: {len(questions)}")

    # Process
    results = process_questions(questions, section)
    print(f"Processed {len(results)} questions" + (f" for section {section}" if section else " (all sections)"))

    # Stats
    with_fig = sum(1 for r in results if r["hasFigure"])
    core = sum(1 for r in results if r["d"] == 1)
    ext = sum(1 for r in results if r["d"] == 2)
    total_marks = sum(r["marks"] for r in results)
    years = sorted(set(r["year"] for r in results))
    qtypes = {}
    for r in results:
        qt = r["qtype"]
        qtypes[qt] = qtypes.get(qt, 0) + 1

    print(f"  Core: {core}, Extended: {ext}")
    print(f"  With figures: {with_fig}")
    print(f"  Total marks: {total_marks}")
    print(f"  Years: {years[0]}-{years[-1]}" if years else "  Years: none")
    print(f"  Question types: {len(qtypes)}")
    for qt, cnt in sorted(qtypes.items(), key=lambda x: -x[1]):
        print(f"    {qt}: {cnt}")

    # Write output
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"\nOutput: {OUTPUT_FILE} ({size_kb:.1f} KB, {len(results)} questions)")


if __name__ == "__main__":
    main()
