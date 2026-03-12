#!/usr/bin/env python3
"""Inject external figure URLs from 25maths-cie0580-figures into papers-cie.json.

Adds a `figureUrls` array to each matching question object.
One-time script — safe to re-run (overwrites previous figureUrls).
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERS = ROOT / "data" / "papers-cie.json"
LINKS = ROOT / "reports" / "cie0580-figure-links" / "figure-links-by-question.json"


def main():
    with open(PAPERS, encoding="utf-8") as f:
        data = json.load(f)

    with open(LINKS, encoding="utf-8") as f:
        link_data = json.load(f)

    link_map = link_data["questions"]  # { qid: [url, ...] }

    injected = 0
    skipped = 0
    for q in data["questions"]:
        qid = q["id"]
        if qid in link_map:
            q["figureUrls"] = link_map[qid]
            injected += 1
        else:
            # Remove stale figureUrls if re-running after link map changed
            if "figureUrls" in q:
                del q["figureUrls"]
                skipped += 1

    with open(PAPERS, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    total = len(data["questions"])
    print(f"Done. Injected figureUrls into {injected}/{total} questions.")
    print(f"Link map had {len(link_map)} entries, {link_data.get('image_count', '?')} images total.")
    if skipped:
        print(f"Removed stale figureUrls from {skipped} questions.")


if __name__ == "__main__":
    main()
