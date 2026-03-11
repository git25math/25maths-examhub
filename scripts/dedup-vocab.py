#!/usr/bin/env python3
"""Deduplicate HHK vocabulary: generate global UIDs, migration map, and updated levels.

Usage:
  python3 scripts/dedup-vocab.py               # Full run: rewrite data files
  python3 scripts/dedup-vocab.py --verify       # Verify output integrity
  python3 scripts/dedup-vocab.py --dry-run      # Preview without writing
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'

# ═══ Disambiguation rules for true homonyms ═══
# word_lower → { chinese_def_substring → uid_suffix }
# Words not listed here with multiple defs are treated as synonyms (pick first).
DISAMBIG = {
    'base': {
        '底数': 'base-exponent',
        '底面': 'base-face',
    },
    'degree': {
        '度': 'degree-angle',
        '次数': 'degree-polynomial',
    },
    'intersection': {
        '交点': 'intersection-point',
        '交集': 'intersection-set',
    },
    'median': {
        '中线': 'median-line',
        '中位数': 'median-value',
    },
    'position': {
        '位置': 'position-location',
        '项数': 'position-term',
    },
    'range': {
        '值域': 'range-function',
        '极差': 'range-statistics',
        '范围': 'range-general',
    },
    'scale': {
        '刻度': 'scale-reading',
        '比例尺': 'scale-ratio',
    },
    'square': {
        '正方形': 'square-shape',
        '平方': 'square-power',
    },
    'tangent': {
        '正切': 'tangent-ratio',
        '切线': 'tangent-line',
    },
}


def make_uid(word):
    """Generate UID from English word: lowercase, alphanum + hyphens."""
    uid = word.lower().strip()
    uid = re.sub(r'[^a-z0-9\s-]', '', uid)
    uid = re.sub(r'\s+', '-', uid.strip())
    uid = re.sub(r'-+', '-', uid).strip('-')
    return uid


def resolve_uid(word, definition):
    """Resolve UID for a word, applying disambiguation if needed."""
    base_uid = make_uid(word)
    if base_uid not in DISAMBIG:
        return base_uid
    rules = DISAMBIG[base_uid]
    defn = definition.strip()
    # Try exact match first, then substring
    for substr, resolved in rules.items():
        if substr == defn:
            return resolved
    for substr, resolved in rules.items():
        if substr in defn:
            return resolved
    # Fallback: use base uid
    return base_uid


def main():
    dry_run = '--dry-run' in sys.argv
    verify_mode = '--verify' in sys.argv

    # ═══ Load current data ═══
    with open(DATA / 'vocabulary-hhk.json') as f:
        old_vocab = json.load(f)

    # Detect if already in new format
    if 'words' in old_vocab and 'sections' in old_vocab:
        if verify_mode:
            _verify({}, {}, [], {})
            return
        print('vocabulary-hhk.json is already in new format.', file=sys.stderr)
        if not dry_run:
            print('Use --verify to validate, or restore from git to re-run.', file=sys.stderr)
        return

    with open(DATA / 'levels-25m.json') as f:
        levels = json.load(f)

    # ═══ Step 1: Build global word registry ═══
    # Collect all unique words with resolved UIDs
    words_dict = {}       # uid → {word, def}
    sections_dict = {}    # section_id → [uid, ...]
    uid_map = {}          # "slug:old_id" → uid (for FLM migration)
    disambig_report = {}  # for vocab-disambig.json

    # Track word → all defs for ambiguity detection
    word_all_defs = defaultdict(list)
    for section_id, words in old_vocab.items():
        for w in words:
            word_all_defs[w['word'].lower().strip()].append({
                'word': w['word'], 'def': w['def'], 'section': section_id
            })

    # Detect and report ambiguous words
    for wkey, entries in word_all_defs.items():
        defs = set(e['def'].strip() for e in entries)
        if len(defs) > 1:
            is_disambig = wkey in DISAMBIG
            disambig_report[wkey] = {
                'word': entries[0]['word'],
                'defs': sorted(defs),
                'sections': sorted(set(e['section'] for e in entries)),
                'action': 'disambiguate' if is_disambig else 'merge',
                'resolved_uids': {}
            }
            if is_disambig:
                for d in defs:
                    uid = resolve_uid(entries[0]['word'], d)
                    disambig_report[wkey]['resolved_uids'][d] = uid

    # ═══ Step 2: Build words and sections dicts ═══
    for section_id, words in old_vocab.items():
        section_uids = []
        for w in words:
            uid = resolve_uid(w['word'], w['def'])
            if uid not in words_dict:
                words_dict[uid] = {'word': w['word'], 'def': w['def']}
            if uid not in section_uids:
                section_uids.append(uid)
        sections_dict[section_id] = section_uids

    # ═══ Step 3: Build migration map from levels-25m.json ═══
    # We need slug + old numeric id → uid
    for level in levels:
        if level.get('board') != '25m':
            continue
        slug = level['slug']
        # Build id→word map from vocabulary entries
        id_word = {}   # old_id → word content
        id_def = {}    # old_id → def content
        for v in level['vocabulary']:
            if v['type'] == 'word':
                id_word[v['id']] = v['content']
            elif v['type'] == 'def':
                id_def[v['id']] = v['content']
        for old_id, word_content in id_word.items():
            defn = id_def.get(old_id, '')
            uid = resolve_uid(word_content, defn)
            uid_map[slug + ':' + old_id] = uid

    # ═══ Step 4: Update levels-25m.json vocabulary IDs ═══
    for level in levels:
        if level.get('board') != '25m':
            continue
        slug = level['slug']
        new_vocab = []
        seen = set()
        i = 0
        vocab = level['vocabulary']
        while i < len(vocab):
            v = vocab[i]
            if v['type'] == 'word':
                old_id = v['id']
                uid_key = slug + ':' + old_id
                uid = uid_map.get(uid_key, v['id'])
                if uid not in seen:
                    seen.add(uid)
                    new_vocab.append({'id': uid, 'type': 'word', 'content': v['content']})
                    # Find matching def (should be next entry with same id)
                    if i + 1 < len(vocab) and vocab[i + 1]['id'] == old_id and vocab[i + 1]['type'] == 'def':
                        new_vocab.append({'id': uid, 'type': 'def', 'content': vocab[i + 1]['content']})
                        i += 2
                        continue
                    # Search for def with same id
                    for j in range(i + 1, len(vocab)):
                        if vocab[j]['id'] == old_id and vocab[j]['type'] == 'def':
                            new_vocab.append({'id': uid, 'type': 'def', 'content': vocab[j]['content']})
                            break
                else:
                    # Duplicate uid in same level — skip word+def pair
                    if i + 1 < len(vocab) and vocab[i + 1]['id'] == old_id and vocab[i + 1]['type'] == 'def':
                        i += 2
                        continue
            i += 1
        level['vocabulary'] = new_vocab

    # ═══ Stats ═══
    old_total = sum(len(ws) for ws in old_vocab.values())
    new_unique = len(words_dict)
    new_section_total = sum(len(uids) for uids in sections_dict.values())
    print(f'Old total: {old_total} word entries across {len(old_vocab)} sections', file=sys.stderr)
    print(f'New unique words: {new_unique}', file=sys.stderr)
    print(f'New section refs: {new_section_total} (was {old_total})', file=sys.stderr)
    print(f'Dedup savings: {old_total - new_unique} ({(1 - new_unique/old_total)*100:.1f}%)', file=sys.stderr)
    print(f'Ambiguous words: {len(disambig_report)} ({sum(1 for d in disambig_report.values() if d["action"]=="disambiguate")} disambiguated)', file=sys.stderr)
    print(f'Migration map entries: {len(uid_map)}', file=sys.stderr)

    if verify_mode:
        _verify(words_dict, sections_dict, levels, uid_map)
        return

    if dry_run:
        print('Dry run — no files written.', file=sys.stderr)
        return

    # ═══ Write output files ═══
    new_vocab_data = {'words': words_dict, 'sections': sections_dict}
    with open(DATA / 'vocabulary-hhk.json', 'w') as f:
        json.dump(new_vocab_data, f, ensure_ascii=False, indent=2)
    print(f'Wrote {DATA / "vocabulary-hhk.json"}', file=sys.stderr)

    with open(DATA / 'levels-25m.json', 'w') as f:
        json.dump(levels, f, ensure_ascii=False, separators=(',', ':'))
    print(f'Wrote {DATA / "levels-25m.json"}', file=sys.stderr)

    with open(DATA / 'vocab-uid-map.json', 'w') as f:
        json.dump(uid_map, f, indent=2)
    print(f'Wrote {DATA / "vocab-uid-map.json"}', file=sys.stderr)

    with open(DATA / 'vocab-disambig.json', 'w') as f:
        json.dump(disambig_report, f, ensure_ascii=False, indent=2)
    print(f'Wrote {DATA / "vocab-disambig.json"}', file=sys.stderr)


def _verify(words_dict, sections_dict, levels, uid_map):
    """Verify output integrity. Works with already-converted data."""
    errors = []

    # Also load from disk to verify written files
    with open(DATA / 'vocabulary-hhk.json') as f:
        disk_vocab = json.load(f)
    disk_words = disk_vocab.get('words', {})
    disk_sections = disk_vocab.get('sections', {})

    # 1. UIDs globally unique
    print(f'UIDs unique: {len(disk_words)}', file=sys.stderr)

    # 2. Every section uid exists in words dict
    for sec_id, uids in disk_sections.items():
        for uid in uids:
            if uid not in disk_words:
                errors.append(f'Section {sec_id} references missing uid: {uid}')

    # 3. levels-25m.json: every vocab entry has a valid uid
    with open(DATA / 'levels-25m.json') as f:
        disk_levels = json.load(f)
    for level in disk_levels:
        if level.get('board') != '25m':
            continue
        for v in level['vocabulary']:
            if v['type'] == 'word' and v['id'] not in disk_words:
                errors.append(f'Level {level["slug"]} vocab id {v["id"]} not in words dict')

    # 4. Word/def pairs in levels match words dict
    for level in disk_levels:
        if level.get('board') != '25m':
            continue
        word_ids = set()
        def_ids = set()
        for v in level['vocabulary']:
            if v['type'] == 'word':
                word_ids.add(v['id'])
            elif v['type'] == 'def':
                def_ids.add(v['id'])
        orphans = word_ids - def_ids
        if orphans:
            errors.append(f'Level {level["slug"]}: word without def: {orphans}')
        orphans2 = def_ids - word_ids
        if orphans2:
            errors.append(f'Level {level["slug"]}: def without word: {orphans2}')

    # 5. Migration map exists and has entries
    if (DATA / 'vocab-uid-map.json').exists():
        with open(DATA / 'vocab-uid-map.json') as f:
            disk_map = json.load(f)
        print(f'Migration map entries: {len(disk_map)}', file=sys.stderr)
    else:
        errors.append('vocab-uid-map.json missing')

    if errors:
        print(f'VERIFY FAILED: {len(errors)} errors', file=sys.stderr)
        for e in errors[:20]:
            print(f'  ERROR: {e}', file=sys.stderr)
        sys.exit(1)
    else:
        print('VERIFY OK', file=sys.stderr)


if __name__ == '__main__':
    main()
