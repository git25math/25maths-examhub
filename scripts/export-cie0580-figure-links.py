#!/usr/bin/env python3
"""Export GitHub Pages figure URLs from the 25maths-cie0580-figures repo.

Outputs:
- A JSON manifest grouped by question ID
- A flat CSV with one row per image

This is intended as a staging export before importing figure links into a DB.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_REPO_ROOT = Path("/Users/zhuxingzhe/Project/ExamBoard/25maths-cie0580-figures")
DEFAULT_BASE_URL = "https://git25math.github.io/25maths-cie0580-figures"
DEFAULT_OUTPUT_DIR = Path("/Users/zhuxingzhe/Project/ExamBoard/25Maths-Keywords/reports/cie0580-figure-links")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
QNUM_RE = re.compile(r"^(Q\d+)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export CIE 0580 figure links")
    parser.add_argument("--repo-root", default=str(DEFAULT_REPO_ROOT), help="Path to 25maths-cie0580-figures repo")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Public base URL for GitHub Pages")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR), help="Directory for generated exports")
    return parser.parse_args()


def find_question_num(parts: tuple[str, ...]) -> str:
    for part in parts:
        match = QNUM_RE.match(part)
        if match:
            return match.group(1)
    raise ValueError(f"Cannot infer question number from path: {'/'.join(parts)}")


def rel_sort_key(rel_path: Path) -> tuple[str, ...]:
    return tuple(rel_path.parts)


def main() -> int:
    args = parse_args()

    repo_root = Path(args.repo_root).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    base_url = args.base_url.rstrip("/")

    if not repo_root.is_dir():
        raise SystemExit(f"Repo root not found: {repo_root}")

    rows: list[dict[str, object]] = []
    grouped = defaultdict(list)

    image_files = sorted(
        (
            path for path in repo_root.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTS
        ),
        key=lambda path: rel_sort_key(path.relative_to(repo_root)),
    )

    for file_path in image_files:
        rel_path = file_path.relative_to(repo_root)
        if len(rel_path.parts) < 4:
            raise SystemExit(f"Unexpected image path shape: {rel_path}")

        session = rel_path.parts[0]
        paper = rel_path.parts[1]
        qnum = find_question_num(rel_path.parts[2:])
        qid = f"0580-{session}-{paper}-{qnum}"
        rel_posix = rel_path.as_posix()
        public_url = f"{base_url}/{rel_posix}"

        grouped[qid].append(
            {
                "file_name": file_path.name,
                "relative_path": rel_posix,
                "public_url": public_url,
            }
        )

    for qid in sorted(grouped):
        items = sorted(grouped[qid], key=lambda item: (item["relative_path"], item["file_name"]))
        grouped[qid] = items
        for index, item in enumerate(items):
            session = qid.split("-")[1]
            paper = qid.split("-")[2]
            qnum = qid.split("-")[3]
            rows.append(
                {
                    "qid": qid,
                    "figure_index": index,
                    "figure_count": len(items),
                    "session": session,
                    "paper": paper,
                    "question": qnum,
                    "file_name": item["file_name"],
                    "relative_path": item["relative_path"],
                    "public_url": item["public_url"],
                }
            )

    by_question = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_repo": str(repo_root),
        "base_url": base_url + "/",
        "question_count": len(grouped),
        "image_count": len(rows),
        "questions": {
            qid: [item["public_url"] for item in items]
            for qid, items in grouped.items()
        },
    }

    summary_rows = []
    for qid in sorted(grouped):
        urls = [item["public_url"] for item in grouped[qid]]
        summary_rows.append(
            {
                "qid": qid,
                "figure_count": len(urls),
                "primary_url": urls[0],
                "all_urls_json": json.dumps(urls, ensure_ascii=False),
            }
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "figure-links-by-question.json"
    rows_csv_path = output_dir / "figure-links-rows.csv"
    summary_csv_path = output_dir / "figure-links-by-question.csv"

    json_path.write_text(json.dumps(by_question, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with rows_csv_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "qid",
                "figure_index",
                "figure_count",
                "session",
                "paper",
                "question",
                "file_name",
                "relative_path",
                "public_url",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    with summary_csv_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["qid", "figure_count", "primary_url", "all_urls_json"],
        )
        writer.writeheader()
        writer.writerows(summary_rows)

    print(f"Repo root: {repo_root}")
    print(f"Output dir: {output_dir}")
    print(f"Questions: {len(grouped)}")
    print(f"Images: {len(rows)}")
    print(f"Grouped JSON: {json_path}")
    print(f"Flat CSV: {rows_csv_path}")
    print(f"Question CSV: {summary_csv_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
