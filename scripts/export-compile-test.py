#!/usr/bin/env python3
r"""
export-compile-test.py — Export questions from JSON and compile paper

Exports all questions for a given paper from papers-cie.json to a temp
directory, then compiles the paper using xelatex to verify PDF output.

Usage:
    python3 scripts/export-compile-test.py 2025OctNov-Paper43
    python3 scripts/export-compile-test.py 2025OctNov-Paper43 --diff-pdf
"""

import json, os, re, sys, shutil, subprocess, tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
PAPERS_JSON = PROJECT_ROOT / "data" / "papers-cie.json"
CIE_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2")
NZH_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/NZH-MathPrep-Template")

# Import export functions from export-latex-dryrun.py
sys.path.insert(0, str(SCRIPT_DIR))
from importlib import import_module
# We'll import the module dynamically since it has hyphens in name
import importlib.util
spec = importlib.util.spec_from_file_location("export_dryrun", SCRIPT_DIR / "export-latex-dryrun.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def export_and_compile(paper_id, mode='auto'):
    """Export questions from JSON and compile the paper.

    Strategy: copy the entire paper directory to temp, then overwrite
    QuestionStatement.tex files with JSON-exported versions. This preserves
    all relative paths (CommonAssets, Figures, etc.) naturally.
    """

    # Parse paper_id: e.g., "2025OctNov-Paper43"
    parts = paper_id.split('-')
    if len(parts) != 2:
        print(f"ERROR: paper_id must be like '2025OctNov-Paper43', got '{paper_id}'")
        return False
    session, paper = parts

    # Load questions
    with open(PAPERS_JSON) as f:
        data = json.load(f)
    qs = [q for q in data['questions'] if q.get('paper') == paper_id]
    qs.sort(key=lambda q: q['qnum'])
    print(f"Found {len(qs)} questions for {paper_id}")

    if not qs:
        print("No questions found!")
        return False

    # Source paper directory
    src_paper_dir = CIE_ROOT / "PastPapers" / session / paper
    if not src_paper_dir.exists():
        print(f"Source directory not found: {src_paper_dir}")
        return False

    # Create temp directory mirroring the CIE project structure
    # so that relative paths (../../..) still resolve
    tmp_root = Path(tempfile.mkdtemp(prefix=f"cie-export-"))
    tmp_past = tmp_root / "PastPapers" / session / paper

    # Copy entire paper directory
    shutil.copytree(src_paper_dir, tmp_past)

    # Symlink CommonAssets and PastPapers so relative paths work
    common_link = tmp_root / "CommonAssets"
    common_link.symlink_to(CIE_ROOT / "CommonAssets")
    # PastPapers symlink for figure paths like ../../../PastPapers/...
    # Only link sessions other than the one we're testing
    past_link = tmp_root / "PastPapers"
    # past_link already exists as a real dir; symlink individual sessions
    for sess_dir in (CIE_ROOT / "PastPapers").iterdir():
        if sess_dir.is_dir() and sess_dir.name != session:
            (past_link / sess_dir.name).symlink_to(sess_dir)

    print(f"Temp directory: {tmp_past}")

    # Export each question — overwrite QuestionStatement.tex
    match_count = 0
    diff_count = 0

    for q in qs:
        qnum = q['id'].split('-')[-1]  # e.g., "Q01"
        q_dir = tmp_past / "Questions" / qnum

        # Export question
        if mode == 'blocks':
            exported = exporter.export_question_from_blocks(q)
        elif mode == 'raw' and q.get('_rawBody'):
            exported = exporter.export_question(q)
        else:
            exported = exporter.export_question(q)

        # Overwrite with exported tex
        out_file = q_dir / "QuestionStatement.tex"
        orig_content = out_file.read_text()
        out_file.write_text(exported)

        # Compare with original
        if exporter.normalize_latex(exported) == exporter.normalize_latex(orig_content):
            match_count += 1
        else:
            diff_count += 1
            print(f"  DIFF: {qnum}")

    print(f"\nExport results: {match_count}/{len(qs)} match, {diff_count} diffs")

    # Find the main tex file
    main_tex = None
    for f in tmp_past.iterdir():
        if f.name.endswith('-QuestionPaper.tex'):
            main_tex = f
            break

    if not main_tex:
        print("ERROR: Main tex file not found!")
        return False

    print(f"\nCompiling: {main_tex.name}")

    # Compile with xelatex — relative paths resolve naturally via directory structure
    texinputs = f".:{CIE_ROOT}//:{NZH_ROOT}//:"
    env = os.environ.copy()
    env['TEXINPUTS'] = texinputs

    result = subprocess.run(
        ['xelatex', '-interaction=nonstopmode', '-halt-on-error', main_tex.name],
        cwd=str(tmp_past),
        env=env,
        capture_output=True,
        text=True,
        timeout=300
    )

    pdf_file = tmp_past / main_tex.name.replace('.tex', '.pdf')

    if result.returncode != 0:
        print(f"\n❌ Compilation FAILED (exit code {result.returncode})")
        # Show last 30 lines of log
        log_lines = result.stdout.split('\n')
        error_lines = [l for l in log_lines if l.startswith('!') or 'Error' in l or 'Undefined' in l]
        if error_lines:
            print("\nErrors found:")
            for l in error_lines[:10]:
                print(f"  {l}")
        else:
            print("\nLast 20 lines of output:")
            for l in log_lines[-20:]:
                print(f"  {l}")
        return False
    elif pdf_file.exists():
        pdf_size = pdf_file.stat().st_size
        print(f"\n✅ Compilation SUCCESS")
        print(f"   PDF: {pdf_file}")
        print(f"   Size: {pdf_size:,} bytes ({pdf_size/1024:.1f} KB)")

        # Compare with original PDF
        orig_pdf = src_paper_dir / main_tex.name.replace('.tex', '.pdf')
        if orig_pdf.exists():
            orig_size = orig_pdf.stat().st_size
            print(f"   Original PDF: {orig_size:,} bytes ({orig_size/1024:.1f} KB)")
            diff_pct = abs(pdf_size - orig_size) / orig_size * 100
            print(f"   Size difference: {diff_pct:.1f}%")

        return True
    else:
        print(f"\n⚠️ Compilation completed but PDF not found")
        return False


if __name__ == '__main__':
    paper = sys.argv[1] if len(sys.argv) > 1 else '2025OctNov-Paper43'
    mode = sys.argv[2] if len(sys.argv) > 2 else 'blocks'
    export_and_compile(paper, mode)
