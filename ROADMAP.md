# Development Roadmap

## Phase 1 — Core Launch [DONE]
- [x] Multi-file architecture refactor
- [x] Supabase auth + cloud sync (`vocab_progress` table)
- [x] 3 algebra levels (21 words) for MVP
- [x] GitHub Pages deployment
- [x] build-single.py offline builder

## Phase 2 — Full Vocabulary (Next)
- [ ] Fix `extract-vocab.py` regex (Python 3.13 backslash escaping)
- [ ] Auto-generate levels.js from 8 .tex files (~317 words, ~40 levels)
  - Algebra / Number / Geometry / Coordinate / Mensuration / Statistics / Trigonometry / Vectors
- [ ] Verify level splitting logic (max 10 words per level)
- [ ] Review timer/combo balance across all levels

## Phase 3 — UX Polish
- [ ] Level category grouping (show topic headers in level list)
- [ ] Search/filter in mastery dashboard
- [ ] Sound effects (match success, combo, timer warning)
- [ ] Onboarding tutorial for first-time users
- [ ] Loading state for Supabase auth check

## Phase 4 — Advanced Features
- [ ] Leaderboard (top mastery % across users)
- [ ] Daily challenge mode (random 10-word set)
- [ ] Share result card (screenshot-friendly summary)
- [ ] PWA support (offline play with service worker)
- [ ] Integration with 25maths-website member system

## Phase 5 — Content Expansion
- [ ] Edexcel 4MA1 vocabulary sets
- [ ] User-created custom word lists
- [ ] Import/export word lists (JSON format)
- [ ] Multi-language support (add pinyin display option)
