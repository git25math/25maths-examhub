/* ══════════════════════════════════════════════════════════════
   mistake-coach.js — Mistake Correction Coach (v4.0.0)
   Step-by-step correction guidance based on weak vocab/KP/siblings.
   5 correction rules applied at Recovery Pack + Print Repair Sheet.
   Loaded after ai-tutor.js, before recovery-session.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ CORE COACH BUILDER ═══ */

function buildMistakeCorrectionCoach(q, sectionId, board) {
  var cfg = typeof MISTAKE_COACH_CONFIG !== 'undefined' ? MISTAKE_COACH_CONFIG : {};
  if (!cfg.enabled) return null;

  var recovery = typeof getRecoveryCandidates === 'function'
    ? getRecoveryCandidates(q.id || '', sectionId, board) : null;
  if (!recovery) return null;

  var steps = [];

  /* Rule 1: Vocabulary gap — weak vocab exists */
  if (recovery.weakVocab && recovery.weakVocab.length > 0) {
    var vocabNames = [];
    for (var vi = 0; vi < Math.min(recovery.weakVocab.length, 3); vi++) {
      vocabNames.push(recovery.weakVocab[vi].word);
    }
    steps.push({
      rule: 'vocab-gap',
      icon: '\ud83d\udcd6',
      en: 'Review key terms: ' + vocabNames.join(', ') + '. Understanding vocabulary is the first step.',
      zh: '\u590d\u4e60\u5173\u952e\u672f\u8bed\uff1a' + vocabNames.join('\u3001') + '\u3002\u7406\u89e3\u8bcd\u6c47\u662f\u7b2c\u4e00\u6b65\u3002'
    });
  }

  /* Rule 2: Concept gap — weak KP exists */
  if (recovery.weakKPs && recovery.weakKPs.length > 0) {
    var kp = recovery.weakKPs[0];
    steps.push({
      rule: 'concept-gap',
      icon: '\ud83e\udde0',
      en: 'Study the concept "' + kp.title + '" \u2014 it\'s essential for this question type.',
      zh: '\u5b66\u4e60\u6982\u5ff5\u201c' + (kp.title_zh || kp.title) + '\u201d\u2014\u2014\u5b83\u5bf9\u8fd9\u7c7b\u9898\u76ee\u81f3\u5173\u91cd\u8981\u3002'
    });
  }

  /* Rule 3: Method practice — siblings available */
  if (recovery.siblingQuestions && recovery.siblingQuestions.length > 0) {
    steps.push({
      rule: 'method-practice',
      icon: '\u270f\ufe0f',
      en: 'Practice ' + recovery.siblingQuestions.length + ' similar question' + (recovery.siblingQuestions.length > 1 ? 's' : '') + ' to master the method.',
      zh: '\u7ec3\u4e60 ' + recovery.siblingQuestions.length + ' \u9053\u7c7b\u4f3c\u9898\u76ee\u6765\u638c\u63e1\u89e3\u9898\u65b9\u6cd5\u3002'
    });
  }

  /* Rule 4: Difficulty awareness — high marks question */
  if (q.marks && q.marks >= 4) {
    steps.push({
      rule: 'difficulty-note',
      icon: '\u26a0\ufe0f',
      en: 'This is a ' + q.marks + '-mark question \u2014 break it into parts and check each step.',
      zh: '\u8fd9\u662f\u4e00\u9053 ' + q.marks + ' \u5206\u9898\u2014\u2014\u5206\u6b65\u89e3\u7b54\u5e76\u9010\u6b65\u68c0\u67e5\u3002'
    });
  }

  /* Rule 5: Re-attempt encouragement */
  steps.push({
    rule: 'reattempt',
    icon: '\ud83d\udd04',
    en: 'After reviewing, try this question again without looking at the mark scheme.',
    zh: '\u590d\u4e60\u5b8c\u6bd5\u540e\uff0c\u4e0d\u770b\u8bc4\u5206\u65b9\u6848\u91cd\u65b0\u5c1d\u8bd5\u8fd9\u9053\u9898\u3002'
  });

  /* Error pattern awareness (v4.2.0): prepend a step based on dominant pattern */
  if (typeof getDominantErrorPatterns === 'function') {
    try {
      var _epDom = getDominantErrorPatterns(sectionId);
      if (_epDom && _epDom.length > 0) {
        var _epKey = _epDom[0].key;
        var _epStep = null;
        if (_epKey === 'careless-reading') {
          _epStep = { rule: 'pattern-reading', icon: '\ud83d\udc41\ufe0f', en: 'Re-read the question slowly and underline key quantities.', zh: '\u6162\u901f\u91cd\u8bfb\u9898\u76ee\uff0c\u5e76\u5708\u51fa\u5173\u952e\u4fe1\u606f\u3002' };
        } else if (_epKey === 'careless-calculation') {
          _epStep = { rule: 'pattern-calc', icon: '\ud83e\uddee', en: 'Check your calculation line by line before finalizing.', zh: '\u7b54\u6848\u5b8c\u6210\u524d\uff0c\u9010\u6b65\u68c0\u67e5\u8ba1\u7b97\u8fc7\u7a0b\u3002' };
        } else if (_epKey === 'vocab-misunderstanding' && !steps.some(function(s) { return s.rule === 'vocab-gap'; })) {
          _epStep = { rule: 'pattern-vocab', icon: '\ud83d\udcd6', en: 'Your error pattern suggests vocabulary issues. Double-check key terms.', zh: '\u4f60\u7684\u9519\u8bef\u6a21\u5f0f\u663e\u793a\u8bcd\u6c47\u95ee\u9898\u3002\u518d\u6b21\u786e\u8ba4\u5173\u952e\u672f\u8bed\u3002' };
        }
        if (_epStep) {
          steps.unshift(_epStep);
        }
      }
    } catch (e) {}
  }

  if (steps.length === 0) return null;
  return {
    questionId: q.id || '',
    sectionId: sectionId,
    board: board,
    steps: steps.slice(0, cfg.maxSteps || 4)
  };
}

/* ═══ RENDER FOR RECOVERY PACK ═══ */

function renderMistakeCoachBlock(coach) {
  if (!coach || !coach.steps || coach.steps.length === 0) return '';
  var cfg = typeof MISTAKE_COACH_CONFIG !== 'undefined' ? MISTAKE_COACH_CONFIG : {};
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };

  var html = '<div class="mistake-coach-block">';
  html += '<div class="mistake-coach-title">' + (cfg.coachIcon || '\ud83c\udfaf') + ' ' + t('Correction Steps', '\u7ea0\u9519\u6b65\u9aa4') + '</div>';
  for (var i = 0; i < coach.steps.length; i++) {
    var s = coach.steps[i];
    html += '<div class="mistake-coach-step">';
    html += '<span class="mistake-coach-num">' + (i + 1) + '</span>';
    html += '<span class="mistake-coach-icon">' + s.icon + '</span>';
    html += '<span class="mistake-coach-text">' + esc(t(s.en, s.zh)) + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ═══ RENDER FOR PRINT REPAIR SHEET ═══ */

function renderMistakeCoachForPrint(coach) {
  if (!coach || !coach.steps || coach.steps.length === 0) return '';
  var esc = typeof escapeHtml === 'function' ? escapeHtml : function(s) { return s; };

  var html = '<div class="ws-section">';
  html += '<div class="ws-section-title">\ud83c\udfaf Correction Steps</div>';
  for (var i = 0; i < coach.steps.length; i++) {
    var s = coach.steps[i];
    html += '<div class="ws-item">';
    html += '<span class="ws-item-word">' + s.icon + ' Step ' + (i + 1) + '</span>';
    html += '<span class="ws-item-def">' + esc(s.en) + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}
