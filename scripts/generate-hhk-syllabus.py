#!/usr/bin/env python3
"""
Generate syllabus-hhk.json and vocabulary-hhk.json for Harrow Haikou (25m board).

Reads:
  - data/levels-25m.json  (existing level structure with slugs)
  - 25Maths-Dashboard/scripts/output/y7-y11-unit-vocabulary.json (source vocab)

Outputs:
  - data/syllabus-hhk.json   (structure matching syllabus-cie.json)
  - data/vocabulary-hhk.json  (structure matching vocabulary-cie.json)

Key: vocabSlugs in syllabus map to existing level slugs, preserving
all localStorage progress keys (L_{slug}_W{id}).
"""

import json
import re
from collections import defaultdict, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEVELS_FILE = ROOT / 'data' / 'levels-25m.json'
SOURCE_FILE = Path('/Users/zhuxingzhe/Project/ExamBoard/25Maths-Dashboard/scripts/output/y7-y11-unit-vocabulary.json')
OUT_SYLLABUS = ROOT / 'data' / 'syllabus-hhk.json'
OUT_VOCAB = ROOT / 'data' / 'vocabulary-hhk.json'


def split_bilingual_title(title):
    """Split 'English Title 中文标题' into (en, zh)."""
    # Find where CJK characters start
    m = re.search(r'[\u4e00-\u9fff\u3400-\u4dbf]', title)
    if m:
        en = title[:m.start()].strip()
        zh = title[m.start():].strip()
        return en, zh
    return title.strip(), ''


def main():
    # Load levels-25m.json
    with open(LEVELS_FILE) as f:
        levels = json.load(f)

    # Group levels by (category, unitNum)
    unit_levels = defaultdict(list)
    unit_meta = {}  # (cat, unum) -> {unitTitle, unitTitleZh}
    for lv in levels:
        cat = lv['category']
        unum = lv.get('unitNum', 0)
        key = (cat, unum)
        unit_levels[key].append(lv)
        if key not in unit_meta:
            unit_meta[key] = {
                'unitTitle': lv.get('unitTitle', ''),
                'unitTitleZh': lv.get('unitTitleZh', ''),
            }

    # Load source vocabulary for richer unit info
    with open(SOURCE_FILE) as f:
        source = json.load(f)
    src_units = {u['unit_id']: u for u in source.get('units', [])}

    # Year groups in order
    year_configs = [
        ('25m-y7',  7,  'Year 7',  '七年级'),
        ('25m-y8',  8,  'Year 8',  '七年级'),  # Note: nameZh matches config.js
        ('25m-y9',  9,  'Year 9',  '八年级'),
        ('25m-y10', 10, 'Year 10', '九年级'),
        ('25m-y11', 11, 'Year 11', '十年级'),
    ]

    # Actually use the correct Chinese names from config.js
    year_zh = {
        7:  '六年级',  # Y7 = 六年级
        8:  '七年级',
        9:  '八年级',
        10: '九年级',
        11: '十年级',
    }

    chapters = []
    vocabulary = {}  # section_id -> [{word, def, id}, ...]

    for cat_id, year_num, year_name, _ in year_configs:
        # Find all units for this year
        unit_nums = sorted(set(
            unum for (c, unum) in unit_levels if c == cat_id
        ))

        if not unit_nums:
            continue

        sections = []
        for unum in unit_nums:
            key = (cat_id, unum)
            lvls = unit_levels[key]
            meta = unit_meta[key]

            # Section ID: "Y7.1", "Y10.12"
            sec_id = f'Y{year_num}.{unum}'

            # Collect all vocabulary slugs (existing level slugs)
            vocab_slugs = [lv['slug'] for lv in lvls]

            # Build section title
            title_en = meta['unitTitle']
            title_zh = meta['unitTitleZh']

            # If no Chinese title from levels, try source
            if not title_zh:
                src_key = f'u-y{year_num}-{unum}'
                if src_key in src_units:
                    _, zh = split_bilingual_title(src_units[src_key]['title'])
                    title_zh = zh

            # Build core_content from unit objectives (if available from source)
            core_content = ''
            src_key = f'u-y{year_num}-{unum}'
            if src_key in src_units:
                src_unit = src_units[src_key]
                core_content = f'{src_unit["unique_pair_count"]} vocabulary words across {src_unit["sub_unit_count"]} sub-units.'

            # Existing slug for the section (use first level's slug prefix)
            slug = f'hhk-y{year_num}-u{unum}'

            sections.append({
                'id': sec_id,
                'title': title_en,
                'title_zh': title_zh,
                'slug': slug,
                'tier': 'both',
                'core_content': core_content,
                'vocabSlugs': vocab_slugs,
            })

            # Build vocabulary mapping for this section
            # Collect unique words from all sub-levels
            seen_words = set()
            words = []
            word_id = 0
            for lv in lvls:
                pairs = []
                vocab = lv.get('vocabulary', [])
                i = 0
                while i < len(vocab) - 1:
                    if vocab[i]['type'] == 'word' and vocab[i + 1]['type'] == 'def':
                        word_en = vocab[i]['content']
                        word_zh = vocab[i + 1]['content']
                        if word_en not in seen_words:
                            seen_words.add(word_en)
                            words.append({
                                'word': word_en,
                                'def': word_zh,
                                'id': str(word_id),
                            })
                            word_id += 1
                    i += 2

            vocabulary[sec_id] = words

        chapters.append({
            'id': f'ch{year_num}',
            'num': year_num,
            'title': year_name,
            'title_zh': year_zh.get(year_num, ''),
            'sections': sections,
        })

    syllabus = {
        'version': '1.0.0',
        'syllabus': 'Harrow Haikou Upper School Mathematics Curriculum (Y7-Y11)',
        'chapters': chapters,
    }

    # Write outputs
    with open(OUT_SYLLABUS, 'w', encoding='utf-8') as f:
        json.dump(syllabus, f, ensure_ascii=False, indent=2)
    print(f'Written {OUT_SYLLABUS} ({len(chapters)} chapters)')

    with open(OUT_VOCAB, 'w', encoding='utf-8') as f:
        json.dump(vocabulary, f, ensure_ascii=False, indent=2)
    total_words = sum(len(v) for v in vocabulary.values())
    print(f'Written {OUT_VOCAB} ({len(vocabulary)} sections, {total_words} words)')

    # Summary
    for ch in chapters:
        print(f'  Chapter {ch["num"]} ({ch["title"]}): {len(ch["sections"])} sections')
        for sec in ch['sections']:
            wc = len(vocabulary.get(sec['id'], []))
            print(f'    {sec["id"]} {sec["title"]} — {wc} words, {len(sec["vocabSlugs"])} level slugs')


if __name__ == '__main__':
    main()
