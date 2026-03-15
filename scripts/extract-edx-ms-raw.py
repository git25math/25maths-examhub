#!/usr/bin/env python3
"""
Extract per-question raw mark scheme PDFs from complete Edexcel 4MA1 MS PDFs.

Input:  25maths-edx4ma1-pdf-officialfiles/{Session}/Paper{XX}/4MA1-{XX}-{Session}-RMS.pdf
Output: 25maths-edx4ma1-pdf-singlems-raw/{Session}/Paper{XX}/4MA1-{XX}-{Session}-Q{NN}-MS.pdf

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

SRC_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/25maths-edx4ma1-pdf-officialfiles")
DST_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/25maths-edx4ma1-pdf-singlems-raw")

# Filename pattern: 4MA1-{paper}-{session}-RMS.pdf
RMS_FILENAME_RE = re.compile(r"^4MA1-(\w+)-(\w+)-RMS\.pdf$")

# Question reference: bare number "1"-"30" in question column
# May have trailing asterisk (e.g., "4*" for quality-of-communication questions)
QREF_RE = re.compile(r"^(\d{1,2})\*?$")

# Sub-part patterns that should NOT be treated as question numbers
SUBPART_RE = re.compile(r"^\([a-z]\)$|^\([ivx]+\)$")


# ── Core extraction ───────────────────────────────────────────────────────

def detect_question_column_x(doc):
    """Return max_x threshold for the question number column.

    Edexcel RMS question numbers consistently appear at x ≈ 74-94 across
    all format variants. The next column (Working) starts at x ≈ 140+.
    A fixed threshold of 100 reliably separates them.
    """
    return 100


def is_preamble_page(page, max_x):
    """Detect preamble pages (cover, marking guidance, abbreviations).

    A page is preamble if it has no question data in the question column.
    """
    text = page.get_text()

    # Cover page
    if "Mark Scheme (Results)" in text and "Pearson" in text:
        return True

    # Info/copyright page
    if "Edexcel and BTEC Qualifications" in text:
        return True

    # Must have some table structure indicator
    has_table_header = ("Question" in text or "Working" in text or
                        "Answer" in text or "Mark" in text or
                        re.search(r"\bQ\b", text) is not None)

    if not has_table_header:
        # Pure text page (marking guidance continuation, etc.)
        if "General Marking Guidance" in text:
            return True
        if "Abbreviations" in text or "No working" in text:
            return True
        # Check for question numbers anyway
        if has_question_data(page, max_x):
            return False
        return True

    # Has table headers — check for actual question data
    if has_question_data(page, max_x):
        return False

    # Has headers but no questions — preamble/notes page
    return True


def has_question_data(page, max_x):
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
                m = QREF_RE.match(text)
                if x < max_x and y > 25 and m:
                    q = int(m.group(1))
                    if 1 <= q <= 30:
                        return True
    return False


def extract_question_numbers(page, max_x, min_y=25):
    """Extract main question numbers from the question column."""
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
                        q = int(m.group(1))
                        if 1 <= q <= 30:
                            questions.add(q)
    return questions


def build_question_page_map(doc):
    """Build mapping: question_number → list of page indices."""
    max_x = detect_question_column_x(doc)
    q_pages = defaultdict(list)
    content_pages = []

    # Pass 1: identify content pages
    for i in range(len(doc)):
        page = doc[i]
        if is_preamble_page(page, max_x):
            continue
        content_pages.append(i)
        questions = extract_question_numbers(page, max_x)
        for q in questions:
            q_pages[q].append(i)

    # Pass 2: check pages after first content that were marked preamble
    # (continuation pages without headers)
    if content_pages:
        first_content = content_pages[0]
        content_set = set(content_pages)
        for i in range(first_content + 1, len(doc)):
            if i in content_set:
                continue
            page = doc[i]
            questions = extract_question_numbers(page, max_x)
            if questions:
                content_pages.append(i)
                for q in questions:
                    q_pages[q].append(i)
        content_pages.sort()

    # Assign orphan content pages to last question seen
    if content_pages:
        last_q = None
        for i in content_pages:
            page_qs = [q for q, pages in q_pages.items() if i in pages]
            if page_qs:
                last_q = max(page_qs)
            elif last_q is not None:
                q_pages[last_q].append(i)

    # Gap filter: remove implausible question numbers
    q_pages.pop(0, None)
    if q_pages:
        sorted_qs = sorted(q_pages.keys())
        cutoff = None
        for j in range(1, len(sorted_qs)):
            if sorted_qs[j] - sorted_qs[j - 1] > 2:
                cutoff = sorted_qs[j]
                break
        if cutoff is not None:
            for q in [q for q in q_pages if q >= cutoff]:
                del q_pages[q]

    return dict(q_pages)


def extract_questions(pdf_path, out_dir, prefix):
    """Extract per-question PDFs from a single RMS PDF. Returns count."""
    doc = fitz.open(str(pdf_path))
    q_map = build_question_page_map(doc)

    if not q_map:
        doc.close()
        return 0

    os.makedirs(out_dir, exist_ok=True)
    count = 0

    for q_num in sorted(q_map.keys()):
        pages = sorted(set(q_map[q_num]))
        out_name = f"{prefix}-Q{q_num:02d}-MS.pdf"
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

def find_all_rms_pdfs(src_root):
    """Find all RMS PDFs under source root."""
    results = []
    for session_dir in sorted(src_root.iterdir()):
        if not session_dir.is_dir():
            continue
        for paper_dir in sorted(session_dir.iterdir()):
            if not paper_dir.is_dir():
                continue
            for f in sorted(paper_dir.iterdir()):
                if f.name.endswith(".pdf") and "-RMS" in f.name:
                    m = RMS_FILENAME_RE.match(f.name)
                    if m:
                        results.append((f, m.group(1), m.group(2)))
    return results


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Extract per-question raw MS PDFs (Edexcel 4MA1)")
    parser.add_argument("--src", default=str(SRC_ROOT), help="Source directory")
    parser.add_argument("--dst", default=str(DST_ROOT), help="Output directory")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no output")
    parser.add_argument("--filter", help="Process only files matching this substring")
    args = parser.parse_args()

    src = Path(args.src)
    dst = Path(args.dst)

    all_pdfs = find_all_rms_pdfs(src)
    print(f"Found {len(all_pdfs)} RMS PDFs")

    total_questions = 0
    total_files = 0
    errors = []
    stats = []

    for pdf_path, paper_code, session in all_pdfs:
        if args.filter and args.filter not in str(pdf_path):
            continue

        # Output: 4MA1-{paper}-{session}-Q{NN}-MS.pdf
        prefix = f"4MA1-{paper_code}-{session}"
        out_dir = dst / session / f"Paper{paper_code}"
        label = f"{session}/Paper{paper_code}"

        try:
            if args.dry_run:
                doc = fitz.open(str(pdf_path))
                q_map = build_question_page_map(doc)
                n = len(q_map)
                qs = sorted(q_map.keys())
                doc.close()
                print(f"  {label}: {n} questions ({qs})")
            else:
                n = extract_questions(pdf_path, str(out_dir), prefix)
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

    zero_q = [s for s in stats if s[1] == 0]
    if zero_q:
        print(f"\nPapers with 0 questions ({len(zero_q)}):")
        for label, _ in zero_q:
            print(f"  {label}")


if __name__ == "__main__":
    main()
