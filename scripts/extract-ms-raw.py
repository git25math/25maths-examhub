#!/usr/bin/env python3
"""
Extract per-question raw mark scheme PDFs from complete CIE 0580 MS PDFs.

Input:  25maths-cie0580-pdf-officialfiles/{Session}/Paper{XX}/0580_{code}_ms_{paper}.pdf
Output: 25maths-cie0580-pdf-singlems-raw/{Session}/Paper{XX}/0580_{code}_ms_{paper}_Q{NN}-raw.pdf

Each output PDF contains all pages where the question number appears.
Shared pages (multiple questions on same page) are duplicated across output files.
"""

import argparse
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

import fitz  # PyMuPDF


# ── Configuration ──────────────────────────────────────────────────────────

SRC_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/25maths-cie0580-pdf-officialfiles")
DST_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/25maths-cie0580-pdf-singlems-raw")

# Session code → directory name mapping
SESSION_MAP = {
    "m": "March",
    "s": "MayJune",
    "w": "OctNov",
    "sp": "Specimen",
}

# Filename pattern: 0580_{session_code}{YY}_ms_{paper}.pdf
MS_FILENAME_RE = re.compile(r"^0580_(m|s|w|sp)(\d{2})_ms_(\d{1,2})\.pdf$")

# Question reference pattern in left column text
# Matches: "1", "12", "1(a)", "1(a)(ii)", "11(b)", "11A", "3B" etc.
QREF_RE = re.compile(r"^(\d{1,2})(?:\([a-z]\)|\([ivx]+\)|[A-Z])*$")


# ── Core extraction ───────────────────────────────────────────────────────

def detect_question_column_x(doc):
    """Detect the x-range for question column based on header format.

    Returns max_x threshold for valid question refs.
    - Standard format ("Question" header at x≈49-58): question refs x < 80
    - Wide format ("Question" header at x≈80+): question refs x < header_x + 30
    - Compact format ("Q" header): question refs x < 60
    """
    for i in range(min(len(doc), 15)):
        page = doc[i]
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" not in b:
                continue
            for line in b["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    y = span["bbox"][1]
                    x = span["bbox"][0]
                    # Headers can be at top (y<120) or bottom (y>700, landscape)
                    if text == "Question" and (y < 120 or y > 700):
                        # Use header_x + 30 as threshold, min 80
                        return max(80, x + 30)
                    elif text == "Q" and y < 120:
                        # Compact format — very narrow question column
                        return 60
    # Fallback: standard format
    return 80


def has_question_table(page, max_x):
    """Check if page has question number entries in the question column."""
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" not in b:
            continue
        for line in b["lines"]:
            for span in line["spans"]:
                x = span["bbox"][0]
                y = span["bbox"][1]
                text = span["text"].strip()
                if x < max_x and 80 < y < 760 and QREF_RE.match(text):
                    return True
    return False


def is_preamble_page(page, max_x):
    """Detect preamble pages (cover, generic marking principles, notes).

    A page is preamble ONLY if it has no actual question data.
    Some papers combine notes + questions on the same page.
    """
    text = page.get_text()

    # Must have column headers to be a content page
    # Some papers use "Question" header, others use just "Q"
    # Note: compact format only has headers on page 0 — later pages may
    # lack headers entirely. Use doc_format flag for those.
    has_q_header = "Question" in text or re.search(r"\bQ\s*\n", text) is not None
    if not has_q_header or "Answer" not in text:
        return True

    # If the page has both column headers AND question entries, it's content
    # (even if it also has notes/principles text)
    if has_question_table(page, max_x):
        return False

    # Has headers but no question refs — likely a pure preamble page
    if "Generic Marking Principles" in text:
        return True
    if "Marking Principle" in text:
        return True
    if "MARK SCHEME NOTES" in text:
        return True
    return False


def extract_question_numbers(page, max_x, min_y=80):
    """Extract main question numbers from the question column of a content page."""
    questions = set()
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" not in b:
            continue
        for line in b["lines"]:
            for span in line["spans"]:
                x = span["bbox"][0]
                y = span["bbox"][1]
                text = span["text"].strip()
                if x < max_x and min_y < y < 780 and text:
                    m = QREF_RE.match(text)
                    if m:
                        questions.add(int(m.group(1)))
    return questions


def detect_compact_format(doc):
    """Check if document uses compact format (Q/Answer/M headers, no preamble).

    In compact format, the table starts on page 0 with just "Q" header,
    and later pages may not repeat any headers at all.
    """
    if len(doc) == 0:
        return False
    page0 = doc[0]
    text = page0.get_text()
    return bool(re.search(r"\bQ\s*\n", text)) and "Answer" in text


def build_question_page_map(doc, skip_gap_filter=False, max_x_override=None):
    """Build mapping: question_number → list of page indices."""
    max_x = max_x_override if max_x_override else detect_question_column_x(doc)
    compact = detect_compact_format(doc)
    q_pages = defaultdict(list)
    content_pages = []

    min_y = 50 if compact else 80

    # Pass 1: identify content pages using header detection
    for i in range(len(doc)):
        page = doc[i]
        if compact:
            content_pages.append(i)
        elif is_preamble_page(page, max_x):
            continue
        else:
            content_pages.append(i)
        questions = extract_question_numbers(page, max_x, min_y)
        for q in questions:
            q_pages[q].append(i)

    # Pass 2: check pages that were skipped as preamble but come after the
    # first content page. Some continuation pages lack Question/Answer headers
    # but still contain question data (either between or after content pages).
    if content_pages and not compact:
        first_content = content_pages[0]
        content_set = set(content_pages)
        for i in range(first_content + 1, len(doc)):
            if i in content_set:
                continue
            page = doc[i]
            questions = extract_question_numbers(page, max_x, min_y)
            if questions:
                content_pages.append(i)
                for q in questions:
                    q_pages[q].append(i)
        content_pages.sort()

    # For content pages with no detected questions, assign them to the
    # last question seen on a previous page (continuation pages).
    if content_pages:
        last_q = None
        for i in content_pages:
            page_qs = [q for q, pages in q_pages.items() if i in pages]
            if page_qs:
                last_q = max(page_qs)
            elif last_q is not None:
                q_pages[last_q].append(i)

    # Remove Q0 (never valid) and filter implausible question numbers.
    q_pages.pop(0, None)

    if q_pages and not skip_gap_filter:
        # Strategy: find the largest contiguous-ish block starting from Q1.
        # Allow gaps of up to 2 (some papers skip a number), but treat
        # larger gaps as bogus mark-column values leaking through.
        sorted_qs = sorted(q_pages.keys())
        cutoff = None
        for j in range(1, len(sorted_qs)):
            if sorted_qs[j] - sorted_qs[j - 1] > 2:
                cutoff = sorted_qs[j]
                break
        if cutoff is not None:
            for q in [q for q in q_pages if q >= cutoff]:
                del q_pages[q]
    elif q_pages:
        # For skip_gap_filter papers (Specimen): still cap at max 30
        # (no CIE 0580 paper exceeds 30 questions)
        for q in [q for q in q_pages if q > 30]:
            del q_pages[q]

    return dict(q_pages)


def extract_questions(pdf_path, out_dir, prefix, skip_gap_filter=False,
                      max_x_override=None):
    """Extract per-question PDFs from a single MS PDF. Returns count."""
    doc = fitz.open(str(pdf_path))
    q_map = build_question_page_map(doc, skip_gap_filter=skip_gap_filter,
                                     max_x_override=max_x_override)

    if not q_map:
        doc.close()
        return 0

    os.makedirs(out_dir, exist_ok=True)
    count = 0

    for q_num in sorted(q_map.keys()):
        pages = sorted(set(q_map[q_num]))
        out_name = f"{prefix}_Q{q_num:02d}-raw.pdf"
        out_path = os.path.join(out_dir, out_name)

        new_doc = fitz.open()
        for p in pages:
            new_doc.insert_pdf(doc, from_page=p, to_page=p)
        new_doc.save(out_path)
        new_doc.close()
        count += 1

    doc.close()
    return count


# ── Directory traversal ───────────────────────────────────────────────────

def parse_ms_filename(filename):
    """Parse MS filename → (session_code, year_short, paper_num) or None."""
    m = MS_FILENAME_RE.match(filename)
    if not m:
        return None
    return m.group(1), m.group(2), m.group(3)


def resolve_session_dir(session_code, year_short):
    """Convert session code + YY → directory name like '2024MayJune'."""
    year = 2000 + int(year_short)
    session_name = SESSION_MAP.get(session_code)
    if not session_name:
        return None
    return f"{year}{session_name}"


def resolve_paper_dir(paper_num, session_code):
    """Convert paper number to directory name like 'Paper11'.

    Specimen papers use single-digit dirs (Paper1, Paper2) to match
    the officialfiles and singlems conventions.
    """
    if session_code == "sp" and len(paper_num) == 2 and paper_num.startswith("0"):
        return f"Paper{paper_num[1]}"
    return f"Paper{paper_num}"


def find_all_ms_pdfs(src_root):
    """Find all mark scheme PDFs under source root."""
    results = []
    for session_dir in sorted(src_root.iterdir()):
        if not session_dir.is_dir():
            continue
        for paper_dir in sorted(session_dir.iterdir()):
            if not paper_dir.is_dir():
                continue
            for f in sorted(paper_dir.iterdir()):
                if f.name.endswith(".pdf") and "_ms_" in f.name:
                    parsed = parse_ms_filename(f.name)
                    if parsed:
                        results.append((f, parsed))
    return results


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Extract per-question raw MS PDFs")
    parser.add_argument("--src", default=str(SRC_ROOT), help="Source directory")
    parser.add_argument("--dst", default=str(DST_ROOT), help="Output directory")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no output")
    parser.add_argument("--filter", help="Process only files matching this substring")
    args = parser.parse_args()

    src = Path(args.src)
    dst = Path(args.dst)

    all_pdfs = find_all_ms_pdfs(src)
    print(f"Found {len(all_pdfs)} MS PDFs")

    total_questions = 0
    total_files = 0
    errors = []
    stats = []

    for pdf_path, (session_code, year_short, paper_num) in all_pdfs:
        if args.filter and args.filter not in str(pdf_path):
            continue

        session_dir = resolve_session_dir(session_code, year_short)
        paper_dir = resolve_paper_dir(paper_num, session_code)
        # Prefix: 0580_s24_ms_11
        prefix = f"0580_{session_code}{year_short}_ms_{paper_num}"

        out_dir = dst / session_dir / paper_dir
        label = f"{session_dir}/{paper_dir}"
        is_specimen = session_code == "sp"
        # Specimen papers use wide multi-column landscape tables
        specimen_max_x = 500 if is_specimen else None

        try:
            if args.dry_run:
                doc = fitz.open(str(pdf_path))
                q_map = build_question_page_map(doc, skip_gap_filter=is_specimen,
                                                 max_x_override=specimen_max_x)
                n = len(q_map)
                qs = sorted(q_map.keys())
                doc.close()
                print(f"  {label}: {n} questions ({qs})")
            else:
                n = extract_questions(pdf_path, str(out_dir), prefix,
                                      skip_gap_filter=is_specimen,
                                      max_x_override=specimen_max_x)
                print(f"  {label}: {n} questions extracted")

            total_questions += n
            total_files += 1
            stats.append((label, n))

        except Exception as e:
            errors.append((label, str(e)))
            print(f"  {label}: ERROR - {e}", file=sys.stderr)

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f"Processed: {total_files}/{len(all_pdfs)} PDFs")
    print(f"Total questions extracted: {total_questions}")

    if errors:
        print(f"\nErrors ({len(errors)}):")
        for label, err in errors:
            print(f"  {label}: {err}")

    # Papers with 0 questions (potential issues)
    zero_q = [s for s in stats if s[1] == 0]
    if zero_q:
        print(f"\nPapers with 0 questions ({len(zero_q)}):")
        for label, _ in zero_q:
            print(f"  {label}")


if __name__ == "__main__":
    main()
