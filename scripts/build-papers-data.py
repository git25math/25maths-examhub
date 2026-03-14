#!/usr/bin/env python3
"""
build-papers-data.py — Unified CIE 0580 past paper data pipeline.

Extracts ALL 4,110 questions from TikzVault catalog, reads LaTeX sources,
merges subtopic annotations from algebra/number tagged data, and generates
a unified papers-cie.json with paperMeta + questions array.

Input:
  - TikzVault/catalog.json (4,110 question metadata)
  - PastPapers/*/Questions/*/QuestionStatement.tex (LaTeX sources)
  - analysis/data/algebra_questions_tagged.json (algebra subtopic annotations)
  - analysis/topics/number/data/questions_tagged.json (number subtopic annotations)

Output:
  - data/papers-cie.json  (unified file: { v, paperMeta, questions })

Usage:
  python3 scripts/build-papers-data.py
  python3 scripts/build-papers-data.py --section 2.5     # filter output to one section
"""

import importlib
import json
import os
import re
import sys

# Import convert_tex from convert-tables.py (hyphenated filename)
_ct = importlib.import_module("convert-tables")
tabular_to_html = _ct.convert_tex

IGCSE_ROOT = "/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2"
CATALOG_FILE = os.path.join(IGCSE_ROOT, "TikzVault/catalog.json")
PASTPAPERS_ROOT = os.path.join(IGCSE_ROOT, "PastPapers")
ALGEBRA_TAGGED = os.path.join(IGCSE_ROOT, "analysis/topics/algebra/data/questions_tagged.json")
NUMBER_TAGGED = os.path.join(IGCSE_ROOT, "analysis/topics/number/data/questions_tagged.json")

# All tagged data sources: (label, path)
# Order matters: earlier entries take priority for questions appearing in multiple topics
TAGGED_SOURCES = [
    ("algebra", ALGEBRA_TAGGED),
    ("number", NUMBER_TAGGED),
    ("coord", os.path.join(IGCSE_ROOT, "analysis/topics/coordinate geometry/data/questions_tagged.json")),
    ("geometry", os.path.join(IGCSE_ROOT, "analysis/topics/geometry/data/questions_tagged.json")),
    ("mensuration", os.path.join(IGCSE_ROOT, "analysis/topics/mensuration/data/questions_tagged.json")),
    ("trigonometry", os.path.join(IGCSE_ROOT, "analysis/topics/trigonometry/data/questions_tagged.json")),
    ("vectors", os.path.join(IGCSE_ROOT, "analysis/topics/transformations and vectors/data/questions_tagged.json")),
    ("probability", os.path.join(IGCSE_ROOT, "analysis/topics/probability/data/questions_tagged.json")),
    ("statistics", os.path.join(IGCSE_ROOT, "analysis/topics/statistics/data/questions_tagged.json")),
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "papers-cie.json")

# ══════════════════════════════════════════════════════════
# Topic / section mapping
# ══════════════════════════════════════════════════════════

# Broad topic → cat key (for UI grouping)
TOPIC_CAT_MAP = {
    "Number": "number",
    "Algebra and graphs": "algebra",
    "Coordinate geometry": "coord",
    "Geometry": "geometry",
    "Mensuration": "mensuration",
    "Trigonometry": "trigonometry",
    "Transformations and vectors": "vectors",
    "Probability": "probability",
    "Statistics": "statistics",
}

# Section → human-readable topic name (must match syllabus-cie.json / config subtopics)
SECTION_TOPICS = {
    # Chapter 1: Number
    "1.1": "Types of number", "1.2": "Sets",
    "1.3": "Powers and roots", "1.4": "Fractions, decimals, percentages",
    "1.5": "Ordering", "1.6": "The four operations", "1.7": "Indices I",
    "1.8": "Standard form", "1.9": "Estimation",
    "1.10": "Limits of accuracy", "1.11": "Ratio and proportion", "1.12": "Rates",
    "1.13": "Percentages", "1.14": "Using a calculator", "1.15": "Time",
    "1.16": "Money", "1.17": "Exponential growth and decay",
    "1.18": "Surds",
    # Chapter 2: Algebra
    "2.1": "Introduction to algebra", "2.2": "Algebraic manipulation",
    "2.3": "Algebraic fractions", "2.4": "Indices II",
    "2.5": "Equations", "2.6": "Inequalities",
    "2.7": "Sequences", "2.8": "Proportion",
    "2.9": "Graphs in practical situations", "2.10": "Graphs of functions",
    "2.11": "Sketching curves", "2.12": "Differentiation", "2.13": "Functions",
    # Chapter 3: Coordinate geometry
    "3.1": "Coordinates", "3.2": "Drawing linear graphs",
    "3.3": "Gradient of linear graphs", "3.4": "Length and midpoint",
    "3.5": "Equations of linear graphs", "3.6": "Parallel lines",
    "3.7": "Perpendicular lines",
    # Chapter 4: Geometry
    "4.1": "Geometrical terms", "4.2": "Geometrical constructions",
    "4.3": "Scale drawings and bearings", "4.4": "Similarity and congruence",
    "4.5": "Symmetry", "4.6": "Angles",
    "4.7": "Circle theorems", "4.8": "Constructions and loci",
    # Chapter 5: Mensuration
    "5.1": "Units of measure", "5.2": "Area and perimeter",
    "5.3": "Circles, arcs and sectors", "5.4": "Surface area and volume",
    "5.5": "Compound shapes",
    # Chapter 6: Trigonometry
    "6.1": "Pythagoras' theorem", "6.2": "Right-angled triangles",
    "6.3": "Exact trigonometric values", "6.4": "Trigonometric functions",
    "6.5": "Non-right-angled triangles", "6.6": "3D trigonometry",
    # Chapter 7: Transformations and vectors
    "7.1": "Transformations", "7.2": "Vectors in 2D",
    "7.3": "Magnitude of a vector", "7.4": "Vector geometry",
    # Chapter 8: Probability
    "8.1": "Introduction to probability", "8.2": "Relative and expected frequencies",
    "8.3": "Combined events", "8.4": "Conditional probability",
    # Chapter 9: Statistics
    "9.1": "Classifying and tabulating data", "9.2": "Interpreting statistical data",
    "9.3": "Averages and measures of spread", "9.4": "Statistical charts and diagrams",
    "9.5": "Scatter diagrams and correlation", "9.6": "Cumulative frequency",
    "9.7": "Histograms",
}

# Chapter number → broad cat
CHAPTER_CAT = {
    "1": "number", "2": "algebra", "3": "coord", "4": "geometry",
    "5": "mensuration", "6": "trigonometry", "7": "vectors",
    "8": "probability", "9": "statistics",
}

# Paper number → type + time mapping
def infer_paper_type(paper_num, year):
    """Infer paper type and exam time from paper number and year."""
    p = int(paper_num) if paper_num.isdigit() else 0
    first = p // 10 if p >= 10 else p

    if first == 1:
        # Core non-calculator
        time = 90 if year >= 2025 else 60
        return "core-nocalc", time
    elif first == 2:
        # Extended non-calculator
        return "ext-nocalc", 90
    elif first == 3:
        # Core calculator
        time = 90 if year >= 2025 else 120
        return "core-calc", time
    elif first == 4:
        # Extended calculator
        return "ext-calc", 150
    return "unknown", 90


# ══════════════════════════════════════════════════════════
# LaTeX cleaning (reused from build-pastpaper-data.py)
# ══════════════════════════════════════════════════════════

def clean_latex(raw):
    """Clean question_text from IGCSE_v2 format to KaTeX-renderable LaTeX."""
    tex = raw

    # Phase 1: Remove structural wrappers
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

    # \begin{subparts}...\end{subparts} with \item → (i), (ii), etc.
    def replace_subparts(m):
        body = m.group(1)
        items = re.split(r'\\item\s*', body)
        items = [it.strip() for it in items if it.strip()]
        roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']
        result = []
        for i, item in enumerate(items):
            label = roman[i] if i < len(roman) else str(i + 1)
            result.append('(' + label + ') ' + item)
        return '\n\n'.join(result)

    tex = re.sub(r'\\begin\{subparts\}(.*?)\\end\{subparts\}', replace_subparts, tex, flags=re.DOTALL)

    # \begin{center}...\end{center} → keep content
    tex = re.sub(r'\\begin\{center\}\s*', '', tex)
    tex = re.sub(r'\\end\{center\}\s*', '', tex)

    # Phase 2: Remove exam-specific commands
    tex = re.sub(r'\\Marks\{\d+\}', '', tex)
    tex = re.sub(r'\\AnswerLine(?:Short)?(?:\[.*?\])*', '', tex)
    tex = re.sub(r'\\answerlines(?:\[\d+\])?', '', tex)
    tex = re.sub(r'\\Answerspace(?:\[.*?\])?', '', tex)
    tex = re.sub(r'\\WorkingSpace\{[^}]*\}', '', tex)
    tex = re.sub(r'\\ImplicitPart', '', tex)
    tex = re.sub(r'\\PartLabel\{([^}]*)\}', r'(\1)', tex)
    tex = re.sub(r'\\StemText\{', '', tex)
    tex = re.sub(r'\\subpart\b', '', tex)

    # Phase 3: Remove spacing/layout commands
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
    tex = re.sub(r'\\item\b\s*', '', tex)

    # Phase 4: Remove figure/TikZ commands
    tex = re.sub(r'\\relinput\{[^}]*\}', '', tex)
    tex = re.sub(r'\\relincludegraphics\{[^}]*\}', '', tex)
    tex = re.sub(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', '', tex, flags=re.DOTALL)
    tex = re.sub(r'\\draw\b[^;]*;', '', tex)
    tex = re.sub(r'\\node\b[^;]*;', '', tex)
    tex = re.sub(r'\\coordinate\b[^;]*;', '', tex)

    # Phase 5: Text formatting
    tex = tex.replace('\\textdollar', '\\$')
    tex = tex.replace('\\par\\par', '\n\n')
    tex = tex.replace('\\par', '\n')
    tex = re.sub(r'\\textbf\{(.*?)\}', r'**\1**', tex)

    # Phase 6: Clean answer blanks and residue
    tex = re.sub(r'\.{5,}', '', tex)
    tex = re.sub(r'\n[a-zA-Z]\s*=\s*\\\\?\s*$', '', tex, flags=re.MULTILINE)
    tex = re.sub(r'\n\}\s*$', '', tex)
    tex = re.sub(r'^\}\s*\n', '', tex)

    # Phase 7: Normalize whitespace
    tex = tex.replace('\t', ' ')
    tex = re.sub(r'\n{3,}', '\n\n', tex)
    tex = re.sub(r'\n[ ]+\n', '\n\n', tex)
    tex = re.sub(r'^([a-zA-Z]\s*=\s*)\\\\\s*$', r'\1', tex, flags=re.MULTILINE)
    tex = tex.strip()

    return tex


def parse_parts(raw):
    """Extract parts structure: [{label, marks}] from question_text."""
    parts = []
    items = re.split(r'\\item\s*', raw)
    if len(items) <= 1:
        return parts

    for i, item in enumerate(items[1:], start=0):
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
    if 'rearrang' in q or ('change' in q and 'subject' in q):
        return 'rearrange'
    if 'quadratic' in q:
        return 'quadratic'
    if 'linear equation' in q or 'linear inequality' in q:
        return 'linear'
    if 'sequence' in q or 'nth term' in q or 'pattern' in q:
        return 'sequence'
    if 'function' in q or 'composite' in q or 'inverse' in q:
        return 'function'
    if 'graph' in q or 'sketch' in q or 'plot' in q or 'gradient' in q or 'tangent' in q:
        return 'graph'
    if 'inequalit' in q:
        return 'inequality'
    if 'fraction' in q and 'algebra' in q:
        return 'algebraic-fraction'
    if 'factoris' in q or 'expand' in q or 'simplif' in q:
        return 'simplify'
    if 'substit' in q:
        return 'substitution'
    if 'indic' in q or 'index' in q or 'power' in q:
        return 'indices'
    if 'proportion' in q or 'variation' in q:
        return 'proportion'
    return 'mixed'


# ══════════════════════════════════════════════════════════
# Command word classification (CIE 0580 command words)
# ══════════════════════════════════════════════════════════

CMD_RULES = [
    ('show',      r'show\s+that\b|prove\b'),
    ('explain',   r'\bexplain\b|\bgive\s+(?:a\s+)?reason'),
    ('describe',  r'\bdescribe\b'),
    ('draw',      r'\bdraw\b|\bconstruct\b|\bplot\b|\bshade\b'),
    ('sketch',    r'\bsketch\b'),
    ('complete',  r'\bcomplete\b'),
    ('simplify',  r'\bsimplify\b|\bfactoris[ez]\b|\bexpand\b'),
    ('solve',     r'\bsolve\b'),
    ('rearrange', r'make\b.*\bsubject\b|\brearrang'),
    ('calculate', r'\bcalculate\b|\bwork\s+out\b|\bestimate\b|\bconvert\b'),
    ('find',      r'\bfind\b'),
    ('write',     r'\bwrite\b|\bstate\b'),
]

_CMD_COMPILED = [(name, re.compile(pat, re.IGNORECASE)) for name, pat in CMD_RULES]


def classify_cmd(tex):
    """Classify question by command word (instruction verb)."""
    for name, pat in _CMD_COMPILED:
        if pat.search(tex):
            return name
    return 'other'


def build_source_ref(year, session, paper, qnum):
    """Build human-readable source reference: 0580/22/M/23 Q7."""
    session_map = {
        "March": "M", "MayJune": "M/J", "June": "M/J",
        "OctNov": "O/N", "November": "O/N", "FebMarch": "F/M",
        "Specimen": "S",
    }
    sess_code = session_map.get(session, session[0] if session else "?")
    year_short = str(year)[-2:] if year else "??"
    return f"0580/{paper}/{sess_code}/{year_short} Q{qnum}"


def determine_difficulty(paper_num):
    """Map paper number to difficulty: 1=Core, 2=Extended."""
    p = int(paper_num) if paper_num.isdigit() else 0
    first = p // 10 if p >= 10 else p
    return 2 if first in (2, 4) else 1


# ══════════════════════════════════════════════════════════
# Main pipeline
# ══════════════════════════════════════════════════════════

def load_tagged_data():
    """Load and index all available subtopic-tagged data."""
    tagged = {}  # id → tagged question entry

    for label, path in TAGGED_SOURCES:
        if not os.path.exists(path):
            print(f"  Skipped {label} (not found)")
            continue
        with open(path) as f:
            data = json.load(f)
        new_count = 0
        for q in data.get("questions", []):
            if q["id"] not in tagged:  # earlier sources take priority
                tagged[q["id"]] = q
                new_count += 1
        total = len(data.get("questions", []))
        print(f"  Loaded {label}: {total} total, {new_count} new")

    return tagged


def extract_primary_section(tagged_q):
    """Extract section number from tagged question's primary subtopic.
    Algebra uses 'primary_subtopic', Number uses 'primary'."""
    raw = tagged_q.get("primary_subtopic") or tagged_q.get("primary") or ""
    if not raw:
        return None
    # Strip C/E prefix: C2.5 → 2.5, E1.10 → 1.10
    section = raw.lstrip("CE")
    # Validate it looks like a section number
    if re.match(r'^\d+\.\d+$', section):
        return section
    return None


def main():
    section_filter = None
    if "--section" in sys.argv:
        idx = sys.argv.index("--section")
        if idx + 1 < len(sys.argv):
            section_filter = sys.argv[idx + 1]

    # 1. Load catalog
    print(f"Loading catalog: {CATALOG_FILE}")
    with open(CATALOG_FILE) as f:
        catalog = json.load(f)

    catalog_questions = catalog.get("questions", [])
    print(f"  Total catalog questions: {len(catalog_questions)}")

    # 2. Load tagged data
    print("Loading tagged data...")
    tagged = load_tagged_data()
    print(f"  Total tagged questions: {len(tagged)}")

    # 3. Process each question
    questions = []
    paper_stats = {}  # paperKey → { totalMarks, qcount, year, session, paper }
    skipped_no_tex = 0

    for cq in catalog_questions:
        qid = cq["id"]
        src = cq["source"]
        year = src["year"]
        session = src["session"]
        paper = src["paper"]
        qnum = src["question"]
        paper_key = f"{year}{session}-Paper{paper}"

        # Read QuestionStatement.tex
        tex_path = os.path.join(PASTPAPERS_ROOT, f"{year}{session}",
                                f"Paper{paper}", "Questions", f"Q{qnum}",
                                "QuestionStatement.tex")
        if not os.path.exists(tex_path):
            skipped_no_tex += 1
            continue

        with open(tex_path) as f:
            raw_tex = f.read()

        # Extract marks (catalog → fallback to \begin{question}{N})
        marks = cq.get("total_marks", 0)
        if marks == 0:
            m = re.search(r'\\begin\{question\}\{(\d+)\}', raw_tex)
            if m:
                marks = int(m.group(1))

        # Skip marks=0 questions (removed by exam board or data error)
        if marks == 0:
            continue

        # Parse parts
        parts = parse_parts(raw_tex)

        # Clean LaTeX
        cleaned = clean_latex(raw_tex)
        if not cleaned:
            continue

        # Check for figures
        has_figure = bool(cq.get("figures")) or "\\relinput" in raw_tex

        # Determine broad category from catalog topics
        topics = cq.get("topics", [])
        cat = "mixed"
        for t in topics:
            if t in TOPIC_CAT_MAP:
                cat = TOPIC_CAT_MAP[t]
                break

        # Check for subtopic annotation
        s = None
        topic_name = None
        qtype = None
        g = None
        cognitive = None

        if qid in tagged:
            tq = tagged[qid]
            s = extract_primary_section(tq)
            qtype = tq.get("question_type", "")
            cognitive = tq.get("cognitive_level", "")
            if s:
                topic_name = SECTION_TOPICS.get(s)
                # Override cat from section chapter
                ch = s.split(".")[0]
                if ch in CHAPTER_CAT:
                    cat = CHAPTER_CAT[ch]
            if qtype:
                g = classify_qtype(qtype)

        # Apply section filter
        if section_filter:
            if s != section_filter:
                continue

        # Build question entry
        entry = {
            "id": qid,
            "paper": paper_key,
            "qnum": int(qnum),
            "marks": marks,
            "topics": topics,
            "s": s,
            "d": determine_difficulty(paper),
            "cat": cat,
            "topic": topic_name,
            "qtype": qtype,
            "g": g,
            "src": build_source_ref(year, session, paper, qnum),
            "year": year,
            "session": session,
            "tex": cleaned,
            "parts": parts,
            "hasFigure": has_figure,
            "cognitive": cognitive,
            "cmd": classify_cmd(cleaned),
        }
        # Add texHtml for questions with tabular
        tex_html = tabular_to_html(cleaned)
        if tex_html is not None:
            entry["texHtml"] = tex_html
        questions.append(entry)

        # Accumulate paper stats
        if paper_key not in paper_stats:
            paper_stats[paper_key] = {
                "year": year, "session": session, "paper": paper,
                "totalMarks": 0, "qcount": 0
            }
        paper_stats[paper_key]["totalMarks"] += marks
        paper_stats[paper_key]["qcount"] += 1

    # 4. Build paperMeta
    paper_meta = {}
    for pk, ps in paper_stats.items():
        ptype, time = infer_paper_type(ps["paper"], ps["year"])
        paper_meta[pk] = {
            "year": ps["year"],
            "session": ps["session"],
            "paper": ps["paper"],
            "type": ptype,
            "totalMarks": ps["totalMarks"],
            "time": time,
            "qcount": ps["qcount"],
        }

    # 5. Sort questions: year DESC, session, paper, qnum ASC
    session_order = {"March": 0, "FebMarch": 0, "MayJune": 1, "June": 1, "OctNov": 2, "November": 2, "Specimen": 3}
    questions.sort(key=lambda q: (-q["year"], session_order.get(q["session"], 9), q["paper"], q["qnum"]))

    # Remove session field from questions (available via paperMeta)
    # Actually keep it for convenience in frontend filtering

    # 6. Output
    output = {
        "v": "2.0",
        "paperMeta": paper_meta,
        "questions": questions,
    }

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024

    # Stats
    tagged_count = sum(1 for q in questions if q["s"])
    untagged_count = len(questions) - tagged_count
    with_fig = sum(1 for q in questions if q["hasFigure"])
    core = sum(1 for q in questions if q["d"] == 1)
    ext = sum(1 for q in questions if q["d"] == 2)
    years = sorted(set(q["year"] for q in questions))
    cat_counts = {}
    for q in questions:
        cat_counts[q["cat"]] = cat_counts.get(q["cat"], 0) + 1

    print(f"\n{'='*60}")
    print(f"Output: {OUTPUT_FILE}")
    print(f"  Size: {size_kb:.1f} KB ({len(questions)} questions, {len(paper_meta)} papers)")
    print(f"  Tagged (with subtopic): {tagged_count}")
    print(f"  Untagged (topics[] only): {untagged_count}")
    print(f"  Core: {core}, Extended: {ext}")
    print(f"  With figures: {with_fig}")
    print(f"  Years: {years[0]}-{years[-1]}" if years else "  Years: none")
    print(f"  Skipped (no .tex): {skipped_no_tex}")
    print(f"  Categories:")
    for c, n in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"    {c}: {n}")
    print(f"  Papers by type:")
    type_counts = {}
    for pm in paper_meta.values():
        type_counts[pm["type"]] = type_counts.get(pm["type"], 0) + 1
    for t, n in sorted(type_counts.items()):
        print(f"    {t}: {n}")

    # Command word stats
    cmd_counts = {}
    for q in questions:
        cmd_counts[q["cmd"]] = cmd_counts.get(q["cmd"], 0) + 1
    print(f"  Command words:")
    for c, n in sorted(cmd_counts.items(), key=lambda x: -x[1]):
        pct = n / len(questions) * 100
        print(f"    {c}: {n} ({pct:.1f}%)")
    other_pct = cmd_counts.get("other", 0) / len(questions) * 100
    print(f"  'other' rate: {other_pct:.1f}%")


if __name__ == "__main__":
    main()
