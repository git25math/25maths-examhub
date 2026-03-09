# 25Maths Learning Engine Architecture

> System blueprint as of v3.4.1 (2026-03-10)
> An adaptive learning system for IGCSE Mathematics exam preparation.

---

## 1. System Overview

25Maths-Keywords is a **Learning Operating System** — not a practice website, but an integrated engine that detects knowledge gaps, plans recovery, executes targeted review, and tracks mastery across three knowledge dimensions.

```
┌─────────────────────────────────────────────────────┐
│                   Learning Engine                    │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │ Vocabulary│   │Knowledge │   │  Past Paper      │ │
│  │ 2,200    │   │Points    │   │  Questions       │ │
│  │ words    │   │111 KPs   │   │  7,817 questions │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────────────┘ │
│       │              │              │                │
│       └──────┬───────┴──────┬───────┘                │
│              │              │                        │
│       ┌──────▼──────┐ ┌─────▼──────┐                 │
│       │  FLM State  │ │  Learning  │                 │
│       │  Machine    │ │  Graph     │                 │
│       └──────┬──────┘ └─────┬──────┘                 │
│              │              │                        │
│       ┌──────▼──────────────▼──────┐                 │
│       │   Detection & Planning     │                 │
│       │   (stale / weak / health)  │                 │
│       └──────┬─────────────────────┘                 │
│              │                                       │
│       ┌──────▼──────┐                                │
│       │  Recovery   │                                │
│       │  Session    │                                │
│       └─────────────┘                                │
└─────────────────────────────────────────────────────┘
```

---

## 2. The Learning Loop

The system implements a complete learning cycle with five stages:

```
  ┌─────────────────────────────────────────────────┐
  │                                                  │
  │   1. DETECT ──► 2. PLAN ──► 3. EXECUTE           │
  │       ▲                         │                │
  │       │                         ▼                │
  │   5. REFLECT ◄── 4. REPAIR                      │
  │                                                  │
  └─────────────────────────────────────────────────┘
```

| Stage | System Component | What It Does |
|-------|-----------------|--------------|
| **1. Detect** | Stale Detection + Weak Groups | Identifies decayed mastery (FLM state regression) and weak areas (low section health) |
| **2. Plan** | Today's Plan | Aggregates all pending recovery items into a prioritized dashboard |
| **3. Execute** | Recovery Session | Chains vocab → KP → PP refresh scans with step progress bar |
| **4. Repair** | Recovery Pack | Shows linked vocab/KP/similar questions for any failed item |
| **5. Reflect** | Print Repair Sheet | Generates single-question A4 worksheets for deep practice |

---

## 3. FLM State Machine (Filter-Learn-Master)

All three knowledge dimensions share the same 4-state model:

```
  new ──► learning ──► uncertain ──► mastered
           ▲              │              │
           │              ▼              ▼
           └── learning ◄──        (decay check)
                                        │
                                        ▼
                                   uncertain
```

### State Transitions

| Dimension | Transition Trigger | Consecutive Success (cs) |
|-----------|-------------------|--------------------------|
| **Vocabulary** | Per-word scan rating (Know/Fuzzy/Don't know) | Per-word correct streak |
| **Knowledge Points** | Session-based (saveKPResult batch) | Consecutive sessions with ≥85% accuracy |
| **Past Papers** | Practice mode: manual cs++; Exam mode: high-confidence → mastered | Per-question correct streak |

### Mastered Decay

Mastered items are not permanent. The system checks for decay at intervals:

```
REFRESH_INTERVALS = [7, 14, 30] days
rc (refresh count) increments on each successful refresh
MAX_RC = 2 (caps at final interval)
```

When `daysSinceLastReview > REFRESH_INTERVALS[rc]`, the item becomes "stale" and enters the recovery queue.

---

## 4. Learning Graph

`learning-graph.js` provides runtime cross-referencing between the three dimensions:

```
  Vocabulary ◄──────► Section Code ◄──────► Knowledge Points
       │                    │                      │
       │                    ▼                      │
       └──────────► Past Paper Questions ◄─────────┘
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `lgGetVocabForSection(sectionId)` | All vocabulary words in a syllabus section |
| `lgGetKPsForSection(sectionId)` | All knowledge points in a section |
| `lgGetQuestionsForSection(sectionId)` | All past paper questions tagged to a section |
| `lgGetRelatedVocab(questionId)` | Vocabulary linked to a specific question |
| `lgGetRelatedKPs(questionId)` | Knowledge points linked to a question |
| `lgGetSimilarQuestions(questionId)` | Questions in the same section/subtopic |

---

## 5. Section Health Score

`getSectionHealth(sectionId)` computes a 0–100 composite score across four dimensions:

```
health = vocabScore × 0.25
       + practiceScore × 0.25
       + knowledgeScore × 0.25
       + ppScore × 0.25
```

Each sub-score uses FLM-weighted calculation:
- mastered = 1.0
- uncertain = 0.5
- learning = 0.2
- new = 0.0

This score drives:
- Home page recommended learning areas
- Smart Path weak-section highlighting
- Recovery session item prioritization (v3.5)

---

## 6. Recovery Session Engine

### Current Architecture (v3.4.1)

```
buildRecoverySession()
  │
  ├── getStaleWords()      → queue[0]: { type: 'vocab', data, count }
  ├── getStaleKPs(board)   → queue[1]: { type: 'kp', count }
  └── getStalePPQuestions() → queue[2]: { type: 'pp', count }

startRecoverySession()
  │
  ├── _runCurrentRecoveryItem()
  │     ├── startRefreshScan(words)     [vocab]
  │     ├── startKPRefreshScan()        [kp]
  │     └── startPPRefreshScan()        [pp]
  │
  ├── [Scan runs with step indicator bar]
  │
  ├── [Finish hook renders result panel]
  │     ├── _recordRecoveryResult(type)
  │     └── Replace .result-actions with session buttons:
  │           ├── "Next: KP →"  / "Finish Recovery"
  │           └── "Exit Recovery"
  │
  ├── _advanceRecoverySession()         [button triggers]
  │
  └── _endRecoverySession()             [summary toast + navTo plan]
```

### Session UX (v3.4.1)

- **Step bar**: `Vocabulary › Knowledge Points › Past Papers` — active highlighted, completed struck-through
- **Result panels**: Each step shows full result breakdown (Known/Fuzzy/Forgot) before advancing
- **Exit**: Available at any point during scan or result screen

---

## 7. Recovery Pack

When a student rates a past paper question as "needs work", the Recovery Pack expands to show:

```
┌─ Recovery Pack ──────────────────────┐
│                                       │
│  📕 Weak Vocabulary (clickable)       │
│     → Opens vocab deck for review     │
│                                       │
│  📘 Related Knowledge Points          │
│     → Opens KP detail page            │
│                                       │
│  📝 Similar Questions                 │
│     → Links to same-subtopic items    │
│                                       │
│  🖨️ Print Repair Sheet               │
│     → A4 worksheet for deep practice  │
│                                       │
└───────────────────────────────────────┘
```

---

## 8. Data Architecture

### Storage

| Data | Location | Sync |
|------|----------|------|
| Vocabulary progress (FLM states, streaks) | `localStorage:wmatch_v3` | Supabase `vocab_progress` |
| KP mastery | `localStorage:wmatch_v3._kpMastery` | Supabase via bridge field |
| PP mastery | `localStorage:pp_mastery` | Supabase via `_ppMastery` bridge |
| Mode completion | `localStorage:wmatch_v3.modeDone` | Cloud sync |
| Wrong book | `localStorage:pp_wrong_book` | Local only |

### Data Sources

| File | Content | Size |
|------|---------|------|
| `data/levels.js` | 275 vocabulary decks, 2,200 words | Auto-generated |
| `data/papers-cie.json` | 4,110 CIE questions, 152 papers | Static |
| `data/papers-edx.json` | 1,855 Edexcel questions, 76 papers | Static |
| `data/practice-*.json` | 3,578 MCQ practice questions | Static |
| `data/knowledge-cie.json` | 72 CIE knowledge points | Static |
| `data/knowledge-edx.json` | 39 Edexcel knowledge points | Static |

---

## 9. Future: Smart Recovery Ordering (v3.5)

### Current Limitation

Recovery Session uses fixed ordering: `vocab → kp → pp`. This doesn't account for urgency.

### Proposed Architecture

Replace fixed ordering with priority-scored items:

```
buildRecoverySession()
  │
  ├── Collect ALL stale items (vocab + kp + pp)
  │
  ├── Score each item:
  │     priority = error_weight      (recent error frequency)
  │               + decay_weight     (days overdue for refresh)
  │               + exam_weight      (syllabus frequency / marks)
  │
  ├── Sort by priority DESC
  │
  └── Group into batches (optional: by type for UX coherence)
```

This transforms Recovery Session from a **task runner** into a **learning engine**.

### Scoring Formula (draft)

```javascript
function recoveryPriority(item) {
  var errorW = 0;
  var decayW = 0;
  var examW  = 0;

  // Error weight: higher if recently failed
  if (item.recentErrors > 0) errorW = Math.min(item.recentErrors * 15, 45);

  // Decay weight: days overdue beyond refresh interval
  var overdue = item.daysSinceReview - item.expectedInterval;
  if (overdue > 0) decayW = Math.min(overdue * 3, 35);

  // Exam weight: based on section exam frequency
  examW = (item.examFrequency || 0.5) * 20;

  return errorW + decayW + examW;
}
```

---

## 10. Module Map

```
config.js          Constants, theme, board detection
levels.js          Vocabulary data (auto-generated)
storage.js         FLM state machine, cloud sync, mode tracking
study.js           Vocab + KP refresh scan (FLM Scan mode)
practice.js        PP refresh scan + exam engine + wrong book
learning-graph.js  Cross-dimension query layer
recovery-session.js Recovery Session orchestration
worksheet.js       Print Repair Sheet generator
syllabus.js        Today's Plan + section health dashboard
mastery.js         Home dashboard + deck detail
ui.js              Panel navigation + toast + modal
app.js             Init, deep linking, iOS recovery
```

---

## 11. Exam Board Coverage

| Board | Sections | Vocabulary | Practice MCQs | Past Paper Qs |
|-------|----------|-----------|---------------|---------------|
| CIE IGCSE 0580 | 72 | ~1,300 | 884 | 4,110 |
| Edexcel IGCSE 4MA1 | 39 | ~500 | 576 | 1,855 |
| Harrow Haikou Y7-11 | 164 levels | ~400 | 55 | — |

---

*This document serves as the canonical reference for the 25Maths Learning Engine architecture. Update it as the system evolves.*
