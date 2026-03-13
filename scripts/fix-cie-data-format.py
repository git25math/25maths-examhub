#!/usr/bin/env python3
"""CIE papers-cie.json format unification: 3 fixes in one pass.

Fix 1: Remove all space blocks from stem/parts/subparts content arrays
Fix 2: Remove q.answer when parts also have answers (dual-level)
Fix 3: Add {type:"none"} answer to 417 fully-answerless questions
"""

import json
import sys
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "papers-cie.json"


def has_answer(obj):
    return "answer" in obj and obj["answer"] is not None


def remove_spaces(blocks):
    """Remove space blocks, return (cleaned_list, removed_count)."""
    if not blocks:
        return blocks, 0
    cleaned = [b for b in blocks if not (isinstance(b, dict) and b.get("type") == "space")]
    return cleaned, len(blocks) - len(cleaned)


def main():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    qs = data["questions"]
    assert len(qs) == 4107, f"Expected 4107 questions, got {len(qs)}"

    # Counters
    space_removed = 0
    space_q = 0
    dual_fixed = 0
    answer_filled_q = 0
    answer_filled_parts = 0
    answer_filled_subparts = 0

    for q in qs:
        q_space = 0

        # === Fix 1: Remove space blocks ===
        if "stem" in q:
            q["stem"], n = remove_spaces(q["stem"])
            q_space += n

        for p in q.get("parts", []):
            if "content" in p:
                p["content"], n = remove_spaces(p["content"])
                q_space += n
            for sp in p.get("subparts", []):
                if "content" in sp:
                    sp["content"], n = remove_spaces(sp["content"])
                    q_space += n

        if q_space > 0:
            space_removed += q_space
            space_q += 1

        # === Fix 2: Remove dual-level answer ===
        if has_answer(q) and q.get("parts"):
            any_part_answer = any(
                has_answer(p) or any(has_answer(sp) for sp in p.get("subparts", []))
                for p in q["parts"]
            )
            if any_part_answer:
                del q["answer"]
                dual_fixed += 1

        # === Fix 3: Fill missing answers for fully-answerless questions ===
        if not q.get("parts"):
            # No parts — check q-level
            if not has_answer(q):
                q["answer"] = {"type": "none"}
                answer_filled_q += 1
        else:
            # Has parts — check if ANY answer exists anywhere
            q_has = has_answer(q)
            any_part_has = any(has_answer(p) for p in q["parts"])
            any_sp_has = any(
                has_answer(sp)
                for p in q["parts"]
                for sp in p.get("subparts", [])
            )

            if not q_has and not any_part_has and not any_sp_has:
                # Fully answerless — fill at leaf level
                for p in q["parts"]:
                    if p.get("subparts"):
                        for sp in p["subparts"]:
                            if not has_answer(sp):
                                sp["answer"] = {"type": "none"}
                                answer_filled_subparts += 1
                    else:
                        if not has_answer(p):
                            p["answer"] = {"type": "none"}
                            answer_filled_parts += 1

    # Write back
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    # Report
    print("=== CIE Data Format Unification ===")
    print(f"Fix 1 — Space blocks removed: {space_removed} (from {space_q} questions)")
    print(f"Fix 2 — Dual-level answers fixed: {dual_fixed}")
    print(f"Fix 3 — Answers filled: {answer_filled_q} q-level + {answer_filled_parts} part-level + {answer_filled_subparts} subpart-level")
    print(f"Total questions: {len(qs)}")


if __name__ == "__main__":
    main()
