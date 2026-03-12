#!/usr/bin/env python3
"""KP Content Enrichment Pipeline — Gemini 2.5 Flash
Populates solutionMethod + commonMistakes for knowledge-*.json KPs.

Usage:
  GEMINI_API_KEY=AIza... python3 scripts/kp-enrich.py --test      # 3 KPs only
  GEMINI_API_KEY=AIza... python3 scripts/kp-enrich.py             # all KPs
"""

import json, time, os, sys, argparse

from google import genai

SYSTEM_PROMPT = """You are an expert IGCSE / GCSE Mathematics tutor and curriculum designer.

Your task is to generate structured teaching content for a math knowledge point (KP).

You will receive a KP object in JSON format. You must return ONLY a valid JSON object
with exactly two fields: "solutionMethod" and "commonMistakes".

Rules:
1. solutionMethod must have "en" and "zh" keys.
   - "en": 3-5 steps written as "Step 1: ...\\nStep 2: ...\\nStep 3: ..."
   - "zh": Chinese translation of the same steps
   - Steps should be concrete actions, not abstract concepts
   - Assume the student is a complete beginner

2. commonMistakes must be an array of 2-3 objects, each with:
   - "id": "cm-01", "cm-02", etc.
   - "mistake": the common error in English (1 sentence)
   - "mistake_zh": Chinese translation
   - "correction": how to avoid it in English (1 sentence)
   - "correction_zh": Chinese translation

3. Return ONLY the JSON object. No markdown, no explanation, no preamble.
4. Use LaTeX notation for math where appropriate (e.g. $m_2 = -\\frac{1}{m_1}$).
5. Make commonMistakes specific to THIS knowledge point, not generic advice.

Output format:
{
  "solutionMethod": {
    "en": "Step 1: ...\\nStep 2: ...\\nStep 3: ...",
    "zh": "第一步：...\\n第二步：...\\n第三步：..."
  },
  "commonMistakes": [
    {
      "id": "cm-01",
      "mistake": "...",
      "mistake_zh": "...",
      "correction": "...",
      "correction_zh": "..."
    }
  ]
}"""


def process_kp(client, kp):
    """Send a single KP to Gemini and parse the JSON response."""
    kp_slim = {
        "id": kp["id"],
        "title": kp["title"],
        "title_zh": kp.get("title_zh", ""),
        "explanation": kp.get("explanation", {}),
        "examPatterns": kp.get("examPatterns", []),
        "examples": kp.get("examples", [])[:1],
    }
    prompt = SYSTEM_PROMPT + "\n\nHere is the knowledge point:\n" + json.dumps(kp_slim, ensure_ascii=False, indent=2)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    text = response.text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)


def enrich_board(client, input_path, board_name, limit=None):
    """Enrich KPs for a single board. Returns (enriched_data, stats)."""
    with open(input_path, encoding="utf-8") as f:
        data = json.load(f)

    kps = data["points"]
    total = len(kps)
    process_list = kps[:limit] if limit else kps
    ok, fail = 0, 0

    for i, kp in enumerate(process_list):
        # Skip if already enriched
        if kp.get("solutionMethod") and kp.get("commonMistakes"):
            print(f"  [{board_name}] {i+1}/{len(process_list)}: {kp['id']} — already enriched, skip", flush=True)
            ok += 1
            continue

        print(f"  [{board_name}] {i+1}/{len(process_list)}: {kp['id']} ({kp['title']})", flush=True)
        try:
            result = process_kp(client, kp)
            kp["solutionMethod"] = result.get("solutionMethod", {})
            kp["commonMistakes"] = result.get("commonMistakes", [])
            ok += 1
            # Quick validation
            sm = kp["solutionMethod"]
            cm = kp["commonMistakes"]
            if not sm.get("en"):
                print(f"    ⚠ solutionMethod.en is empty", flush=True)
            if len(cm) < 2:
                print(f"    ⚠ only {len(cm)} commonMistakes", flush=True)
        except Exception as e:
            print(f"    ✗ ERROR: {e}", flush=True)
            fail += 1
        time.sleep(0.5)

    data["points"] = kps
    return data, {"board": board_name, "total": total, "processed": len(process_list), "ok": ok, "fail": fail}


def main():
    parser = argparse.ArgumentParser(description="Enrich KP data with Gemini")
    parser.add_argument("--test", action="store_true", help="Test mode: process only 3 KPs from CIE")
    parser.add_argument("--board", choices=["cie", "edx", "hhk"], help="Process only one board")
    parser.add_argument("--dry-run", action="store_true", help="Show output without saving")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: Set GEMINI_API_KEY environment variable")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    boards = {
        "cie": os.path.join(root, "data/knowledge-cie.json"),
        "edx": os.path.join(root, "data/knowledge-edx.json"),
        "hhk": os.path.join(root, "data/knowledge-hhk.json"),
    }

    limit = 3 if args.test else None
    target_boards = [args.board] if args.board else (["cie"] if args.test else ["cie", "edx", "hhk"])

    all_stats = []
    for board in target_boards:
        path = boards[board]
        print(f"\n{'='*60}", flush=True)
        print(f"Processing {board.upper()} ({path})", flush=True)
        print(f"{'='*60}", flush=True)

        data, stats = enrich_board(client, path, board.upper(), limit=limit)
        all_stats.append(stats)

        if args.dry_run or args.test:
            enriched = [kp for kp in data["points"] if kp.get("solutionMethod")]
            for kp in enriched[:3]:
                print(f"\n--- {kp['id']}: {kp['title']} ---")
                print(json.dumps({
                    "solutionMethod": kp["solutionMethod"],
                    "commonMistakes": kp["commonMistakes"]
                }, ensure_ascii=False, indent=2))
        else:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  ✓ Saved to {path}", flush=True)

    print(f"\n{'='*60}", flush=True)
    print("Summary:", flush=True)
    for s in all_stats:
        print(f"  {s['board']}: {s['ok']}/{s['processed']} OK, {s['fail']} failed (total: {s['total']})", flush=True)


if __name__ == "__main__":
    main()
