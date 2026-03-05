# Implementation Checklist — Scoring & Mastery v1.0

Reference: `docs/scoring-spec-v1.0.md`

---

## Phase 1: Core Engine (storage.js)

### 1.1 New function: `computeStars(ok, fail)`
```js
function computeStars(ok, fail) {
  var raw = Math.min(ok, 4);
  var attempts = ok + fail;
  var acc = attempts === 0 ? 1.0 : ok / attempts;
  var cap = acc < 0.5 ? 2 : acc < 0.6 ? 3 : 4;
  return Math.min(raw, cap);
}
```
- [ ] Add to storage.js
- [ ] Unit logic: pure function, no side effects

### 1.2 Refactor: `setWordStatus()` → `recordAnswer(key, mode, isCorrect)`
Replace the current mode-specific status-setting with a unified entry point:
```js
function recordAnswer(key, mode, isCorrect) {
  var d = getOrCreateWord(key);

  // 1. Update ok/fail per Spec 2.1 / 2.2
  if (mode === 'study-easy') {
    if (d.ok === 0) d.ok = 1;  // first-star only
  } else if (mode === 'study-hard') {
    d.fail += 1;
  } else if (mode === 'study-okay') {
    // no-op
  } else if (isCorrect) {
    d.ok += (mode === 'spell' ? 2 : 1);
  } else {
    d.fail += 1;
  }

  // 2. Recompute stars & status
  d.stars = computeStars(d.ok, d.fail);
  d.st = d.stars === 0 ? 'new' : d.stars === 4 ? 'mastered' : 'learning';

  // 3. Update SRS (lv/nr/iv) — keep existing logic
  if (isCorrect) { d.lv = Math.min(d.lv + 1, 7); }
  else if (isCorrect === false) { d.lv = Math.max(d.lv - 2, 0); }
  // ... set nr/iv based on lv ...

  // 4. Update daily history
  // 5. Save + debounced sync
}
```
- [ ] Implement `recordAnswer()`
- [ ] Keep `setWordStatus()` as thin wrapper during migration (optional)
- [ ] Ensure `stars` field is persisted in word data

### 1.3 Refactor: `getDeckStats(li)` → dual metrics
```js
function getDeckStats(li) {
  var pairs = getPairs(LEVELS[li].vocabulary);
  var wd = getWordData();
  var totalStars = 0, mastered = 0, started = 0;
  pairs.forEach(function(p) {
    var key = wordKey(li, p.id);
    var d = wd[key];
    var s = d ? (d.stars || computeStars(d.ok || 0, d.fail || 0)) : 0;
    totalStars += s;
    if (s === 4) mastered++;
    if (d && (d.ok || 0) >= 1) started++;
  });
  return {
    total: pairs.length,
    started: started,
    learningPct: Math.round(totalStars / (pairs.length * 4) * 100),
    masteryPct: Math.round(mastered / pairs.length * 100),
    mastered: mastered
  };
}
```
- [ ] Implement
- [ ] Update all callers

### 1.4 Refactor: `getMasteryPct()` → `getGlobalStats()`
```js
function getGlobalStats() {
  var allWords = getAllWords();
  var totalStars = 0, mastered = 0;
  allWords.forEach(function(w) {
    totalStars += w.stars || 0;
    if ((w.stars || 0) === 4) mastered++;
  });
  return {
    total: allWords.length,
    learningPct: Math.round(totalStars / (allWords.length * 4) * 100),
    masteryPct: Math.round(mastered / allWords.length * 100)
  };
}
```
- [ ] Implement
- [ ] Score = `learningPct * 20`
- [ ] Rank uses `masteryPct`

---

## Phase 2: Mode Callers (study.js, quiz.js, spell.js, match.js, battle.js, review.js)

Replace all `setWordStatus(key, status, interval, correct)` calls with `recordAnswer(key, mode, isCorrect)`.

| File       | Current call pattern                           | New call                              |
|------------|------------------------------------------------|---------------------------------------|
| study.js   | rateStudy: setWordStatus(..., 'mastered', 30, true) | recordAnswer(key, 'study-easy', true) |
| study.js   | rateStudy: setWordStatus(..., 'learning', 1)   | recordAnswer(key, 'study-okay', null) |
| study.js   | rateStudy: setWordStatus(..., 'learning', 0.15, false) | recordAnswer(key, 'study-hard', false) |
| quiz.js    | pickQuizOpt correct                            | recordAnswer(key, 'quiz', true)       |
| quiz.js    | pickQuizOpt wrong                              | recordAnswer(key, 'quiz', false)      |
| spell.js   | checkSpell correct                             | recordAnswer(key, 'spell', true)      |
| spell.js   | checkSpell wrong                               | recordAnswer(key, 'spell', false)     |
| match.js   | pickMatch correct                              | recordAnswer(key, 'match', true)      |
| battle.js  | onMatch correct                                | recordAnswer(key, 'battle', true)     |
| review.js  | rateReview got-it                              | recordAnswer(key, 'review', true)     |
| review.js  | rateReview almost                              | recordAnswer(key, 'review', true)     |
| review.js  | rateReview hard                                | recordAnswer(key, 'review', false)    |

- [ ] study.js
- [ ] quiz.js
- [ ] spell.js
- [ ] match.js
- [ ] battle.js
- [ ] review.js

---

## Phase 3: UI Updates (mastery.js, css/style.css)

### 3.1 Deck-row: show started/N + learningPct
```
Y7.1 · Multiplication of Fractions (1)  6/10  ████░░ 55%
```
- [ ] `renderDeckRow()`: use `stats.learningPct` for bar, `stats.started + '/' + stats.total` for count

### 3.2 Home dashboard: dual ring or dual stat
- [ ] Primary: learningPct (ring/big number)
- [ ] Secondary: masteryPct (subtitle or badge)
- [ ] Rank display uses masteryPct

### 3.3 Deck detail page
- [ ] Show both learningPct and masteryPct

---

## Phase 4: Cloud Sync (storage.js)

### 4.1 Leaderboard upsert
- [ ] `score = learningPct * 20`
- [ ] `mastery_pct = masteryPct` (for teacher dashboard)

### 4.2 Data migration
- [ ] Existing word records: compute `stars` from existing `ok`/`fail` on load
- [ ] No breaking change: old data without `stars` field → compute on read

---

## Phase 5: Config (config.js)

- [ ] Version bump: `v1.1.10` → `v1.2.0`
- [ ] Rank thresholds: verify 0/15/40/65/90 still feel right with new masteryPct

---

## Regression Tests (Manual)

### T1: Study Easy first-star only
1. New word (ok=0) → Study Easy → ok=1, stars=1 ✓
2. Same word → Study Easy again → ok still 1, stars still 1 ✓
3. Same word → Study Easy 10x → no change beyond star 1 ✓

### T2: Match/Battle fail counts
1. Match wrong → fail+1 ✓
2. 4 Match correct + 3 Match wrong → ok=4, fail=3, accuracy=57% → stars=3 (capped) ✓
3. 1 more correct → ok=5, fail=3, accuracy=62.5% → stars=4 ✓

### T3: Spell double credit
1. Spell correct → ok+2 ✓
2. 2 Spell correct, 0 fail → ok=4, accuracy=100% → stars=4 ✓

### T4: Accuracy gate
1. ok=4, fail=5 → accuracy=44% → stars=2 (capped at 2) ✓
2. ok=4, fail=4 → accuracy=50% → stars=3 (capped at 3) ✓
3. ok=4, fail=2 → accuracy=67% → stars=4 ✓

### T5: Progress calculation
1. Deck 10 words, all 0 stars → learningPct=0%, masteryPct=0% ✓
2. All Study Easy (first time) → learningPct=25%, masteryPct=0% ✓
3. All 4 stars → learningPct=100%, masteryPct=100% ✓
4. Mixed: 3×4star + 5×2star + 2×0star → learning=(12+10)/40=55%, mastery=3/10=30% ✓

### T6: Score & Rank
1. learningPct=55% → score=1100 ✓
2. masteryPct=30% → Silver rank ✓
3. masteryPct=90% → Word King ✓

### T7: Cross-mode key consistency
1. 25m student does Quiz on 25m-y11 level → key = L_25m-y11-xxx_W0 ✓
2. Same student switches to Match on same level → same key ✓
3. Progress shows correctly on home page ✓

### T8: CIE/Edexcel unaffected
1. CIE student Quiz → old key format L_alg-expr_W1 → stars computed correctly ✓
2. Progress bar uses new learningPct formula ✓
