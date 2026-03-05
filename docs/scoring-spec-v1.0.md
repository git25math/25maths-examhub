# 25Maths Keywords — Scoring & Mastery Spec v1.0

## 0. Goals & Principles

**Dual goals:**
1. Effort is visible: any practice moves progress forward
2. Mastery has integrity: gaming/guessing cannot reach full stars

**Design principles:**
- Learning Progress and Mastery Rate are separate metrics
- All modes use unified scoring (ok/fail reflect real performance)
- Minimize new fields; prefer derivable values

---

## 1. Data Model (Word Record)

Per user per word:

| Field | Type        | Purpose                                    |
|-------|-------------|--------------------------------------------|
| ok    | int         | Cumulative correct count (cross-mode)      |
| fail  | int         | Cumulative incorrect count (cross-mode)    |
| stars | int(0..4)   | Current star level (cached or computed)    |
| st    | enum        | new / learning / mastered (derived from stars) |
| lv    | int(0..7)   | SRS level (review scheduling only)         |
| nr    | timestamp   | Next review time (scheduling only)         |
| iv    | float(days) | Review interval (scheduling only)          |

Status mapping: stars=0 → new, 1-3 → learning, 4 → mastered

---

## 2. Mode Event Scoring

### 2.1 ok/fail increments

| Mode          | Correct → ok+ | Wrong → fail+ |
|---------------|---------------:|---------------:|
| Study Easy    | Special (2.2)  | +1 (Hard only) |
| Study Okay    | 0              | 0              |
| Study Hard    | 0              | +1             |
| Match         | +1             | +1             |
| Battle        | +1             | +1             |
| Quiz          | +1             | +1             |
| Review        | +1             | +1             |
| Spell         | +2             | +1             |

### 2.2 Study Easy special rule

```
if (ok == 0) { ok = 1; }  // first-star only
// else: no change
```

---

## 3. Accuracy

```
attempts = ok + fail
accuracy = (attempts == 0) ? 1.0 : ok / attempts
```

---

## 4. Star Calculation (Core Rule)

### 4.1 Raw stars
```
stars_raw = min(ok, 4)
```

### 4.2 Accuracy cap
```
if accuracy < 0.50 → stars_cap = 2
if 0.50 <= accuracy < 0.60 → stars_cap = 3
if accuracy >= 0.60 → stars_cap = 4
```

### 4.3 Final
```
stars = min(stars_raw, stars_cap)
```

### 4.4 Status derivation
```
stars == 0 → "new"
1 <= stars <= 3 → "learning"
stars == 4 → "mastered"
```

---

## 5. Mode Gate: Not Required (Option A)

No hard requirement for Quiz/Spell to reach 4 stars.
Rationale: Study first-star cap + accuracy gate + Match fail penalty
already ensure integrity. Spell's +2 weight naturally rewards harder modes.

---

## 6. Deck Metrics

For a deck with N words:

### 6.1 Learning Progress (for Score)
```
learning_pct = sum(stars_i) / (4 * N) * 100
```

### 6.2 Mastery Rate (for Rank)
```
mastery_pct = count(stars_i == 4) / N * 100
```

### 6.3 Started Coverage (for display)
```
started = count(ok_i >= 1)
display: "started/N"
```

---

## 7. Global Metrics

Same formulas as Section 6, applied across all visible words S:

```
learning_pct_all = sum(stars_w for w in S) / (4 * |S|) * 100
mastery_pct_all  = count(stars_w == 4 for w in S) / |S| * 100
```

---

## 8. Score & Rank

### 8.1 Score (leaderboard)
```
score = round(learning_pct_all * 20)   // max 2000
```

### 8.2 Rank (based on mastery_pct_all)

| Min %  | Rank            |
|--------|-----------------|
| 0%     | Bronze Learner  |
| 15%    | Silver Expert   |
| 40%    | Gold Scholar    |
| 65%    | Diamond Master  |
| 90%    | Word King       |

---

## 9. UI Display

| Location      | Primary metric    | Secondary       | Text       |
|---------------|-------------------|-----------------|------------|
| Home ring     | learning_pct_all  | mastery_pct_all | —          |
| Deck-row bar  | learning_pct      | —               | started/N  |
| Deck detail   | learning_pct      | mastery_pct     | —          |
| Leaderboard   | score             | rank            | —          |

Tooltips:
- Learning Progress: how far you've studied (effort)
- Mastery Rate: how much you truly know (quality)
