/* ══════════════════════════════════════════════════════════════
   ai-tutor.js — Rule-based AI Tutor Layer (v4.0.0)
   Provides contextual natural language guidance at 4 touchpoints:
   1. Today's Recovery plan
   2. Session start / end
   3. Recovery Pack
   4. Learning Goals
   No external API — purely rule-based message generation.
   Loaded after learning-goals.js, before recovery-session.js
   ══════════════════════════════════════════════════════════════ */

/* ═══ TUTOR CONTEXT ═══ */

function buildTutorContext() {
  var profile = typeof rebuildStudentProfile === 'function' ? rebuildStudentProfile() : null;
  var goals = typeof getLearningGoalsState === 'function' ? getLearningGoalsState() : null;
  var backlog = typeof getRecoveryBacklogCount === 'function' ? getRecoveryBacklogCount() : 0;
  var streak = profile ? (profile.streak || 0) : 0;
  var trend = profile ? (profile.trend || 'stable') : 'stable';
  var accuracy = profile ? (profile.accuracy || 0) : 0;
  var mastery = profile ? (profile.mastery || 0) : 0;
  var weakSections = profile ? (profile.weakSections || []) : [];
  var weakType = typeof inferWeakType === 'function' && profile ? inferWeakType(profile) : null;

  var errorPatterns = typeof getDominantErrorPatterns === 'function' ? getDominantErrorPatterns() : [];
  /* v4.3.0: structured error display with confidence */
  var epDisplay = null;
  try {
    if (typeof getErrorPatternState === 'function' && typeof getDisplayPatterns === 'function') {
      epDisplay = getDisplayPatterns(getErrorPatternState());
    }
  } catch (e) {}

  return {
    profile: profile,
    goals: goals,
    backlog: backlog,
    streak: streak,
    trend: trend,
    accuracy: accuracy,
    mastery: mastery,
    weakSections: weakSections,
    weakType: weakType,
    errorPatterns: errorPatterns,
    epDisplay: epDisplay,
    hasData: !!(profile && (profile.activeDays > 0 || profile.totalWords > 0))
  };
}

/* ═══ PLAN TUTOR MESSAGE ═══ */

function getPlanTutorMessage() {
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  if (!cfg.enablePlanTutor) return null;
  var ctx = buildTutorContext();
  if (!ctx.hasData) return null;

  var lines = [];

  /* Trend-based opening */
  if (ctx.trend === 'up') {
    lines.push(t('Your accuracy is improving — keep this momentum!', '你的准确率在提升——保持这个势头！'));
  } else if (ctx.trend === 'down') {
    lines.push(t("Let's strengthen your foundation today — the plan is designed to help!", '今天来巩固一下基础——计划已为你安排好！'));
  } else {
    lines.push(t("Staying consistent is key. Let's keep building on your progress.", '保持一致性是关键。让我们继续巩固你的进度。'));
  }

  /* Backlog warning */
  if (ctx.backlog > 5) {
    lines.push(t('Some topics are ready for a refresh — even a few minutes will help!', '\u6709\u4e9b\u5185\u5bb9\u53ef\u4ee5\u56de\u987e\u2014\u2014\u54ea\u6015\u51e0\u5206\u949f\u4e5f\u4f1a\u6709\u5e2e\u52a9\uff01'));
  }

  /* Weak section hint */
  if (ctx.weakSections.length > 0) {
    var ws = ctx.weakSections[0];
    var wsName = ws.title || ws.id || '';
    lines.push(t('The plan includes ' + wsName + ' to help you build confidence there.', '计划包含了 ' + wsName + '，帮你在这块更有信心。'));
  }

  /* Streak encouragement */
  if (ctx.streak >= 3 && ctx.streak < 7) {
    lines.push(t('Nice ' + ctx.streak + '-day streak! A few more days to build a strong habit.', '\u4e0d\u9519\u7684 ' + ctx.streak + ' \u5929\u8fde\u7eed\uff01\u518d\u575a\u6301\u51e0\u5929\u5c31\u80fd\u517b\u6210\u597d\u4e60\u60ef\u3002'));
  } else if (ctx.streak >= 7) {
    lines.push(t('Amazing ' + ctx.streak + "-day streak! You're building a great habit.", '\u4e86\u4e0d\u8d77\u7684 ' + ctx.streak + ' \u5929\u8fde\u7eed\uff01\u4f60\u6b63\u5728\u517b\u6210\u597d\u4e60\u60ef\u3002'));
  }

  /* Error pattern awareness (v4.3.0: confidence-gated language) */
  var _epPrimary = ctx.epDisplay ? ctx.epDisplay.primaryPersistent : (ctx.errorPatterns && ctx.errorPatterns[0] ? ctx.errorPatterns[0] : null);
  if (_epPrimary) {
    var _epBand = typeof getConfidenceBand === 'function' ? getConfidenceBand(_epPrimary.confidence || 0) : 'low';
    var _epKey = _epPrimary.key;
    /* Only show strong language for high confidence; softer for medium; skip low */
    if (_epBand === 'high') {
      if (_epKey === 'concept-gap') lines.push(t('Building a stronger concept foundation will help — let\'s review the key ideas first.', '打牢概念基础会很有帮助——先回顾核心要点。'));
      else if (_epKey === 'careless-reading') lines.push(t('Careful reading makes a big difference — try reading the question twice before solving.', '仔细审题效果显著——解题前试着把题目读两遍。'));
      else if (_epKey === 'vocab-misunderstanding') lines.push(t('Strengthening key terms will boost your confidence — review them before each session.', '巩固关键词汇会提升你的信心——每次复习前先过一遍。'));
      else if (_epKey === 'careless-calculation') lines.push(t('Double-checking calculations is a great habit — try going through each step.', '检查计算是个好习惯——试着逐步验算每一步。'));
      else if (_epKey === 'method-confusion') lines.push(t('A consistent step-by-step approach works wonders — let\'s build that habit.', '固定的解题步骤非常有效——让我们养成这个习惯。'));
    } else if (_epBand === 'medium') {
      if (_epKey === 'concept-gap') lines.push(t('Reviewing core concepts could help — let\'s strengthen that foundation.', '回顾核心概念会有帮助——一起巩固基础。'));
      else if (_epKey === 'careless-reading') lines.push(t('Taking a moment to read carefully can help — try it next time.', '多花一点时间审题会有帮助——下次试试看。'));
      else if (_epKey === 'vocab-misunderstanding') lines.push(t('Reviewing key terms can make a difference — they\'re worth another look.', '复习关键词汇会有帮助——值得再过一遍。'));
      else if (_epKey === 'careless-calculation') lines.push(t('A quick double-check of each step can catch small errors — great habit to build.', '逐步验算能发现小错误——养成这个好习惯。'));
      else if (_epKey === 'method-confusion') lines.push(t('Practicing a consistent method will build your confidence.', '练习固定的解题方法会让你更有信心。'));
    }
  }

  if (lines.length === 0) return null;
  return { lines: lines.slice(0, cfg.maxTutorLines || 3) };
}

/* ═══ SESSION START TUTOR MESSAGE ═══ */

function getSessionStartTutorMessage(queue) {
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  if (!cfg.enableSessionTutor) return null;

  var ctx = buildTutorContext();
  var lines = [];
  var typeCount = queue ? queue.length : 0;

  if (typeCount > 0) {
    var types = [];
    for (var i = 0; i < queue.length; i++) {
      var label = queue[i].type === 'vocab' ? t('vocabulary', '词汇') :
                  queue[i].type === 'kp' ? t('knowledge points', '知识点') :
                  t('past papers', '真题');
      types.push(label);
    }
    lines.push(t('This session covers: ', '本次复查包括：') + types.join(t(', ', '、')));
  }

  /* Motivational based on trend */
  if (ctx.trend === 'up') {
    lines.push(t("You've been improving — let's keep it up!", '你一直在进步——继续加油！'));
  } else if (ctx.streak === 0) {
    lines.push(t("Let's start a new streak today!", '让我们今天开始新的连续记录！'));
  }

  if (lines.length === 0) return null;
  return { lines: lines.slice(0, cfg.maxTutorLines || 3) };
}

/* ═══ SESSION END TUTOR MESSAGE ═══ */

function getSessionEndTutorMessage(results, durationSec) {
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  if (!cfg.enableSessionTutor) return null;

  var lines = [];
  var done = 0, skipped = 0;
  if (results) {
    for (var i = 0; i < results.length; i++) {
      if (results[i].status === 'done') done++;
      else skipped++;
    }
  }

  if (done > 0) {
    lines.push(t('Great work completing ' + done + ' scan' + (done > 1 ? 's' : '') + '!', '完成了 ' + done + ' 轮扫描，做得好！'));
  }

  if (skipped > 0) {
    lines.push(t(skipped + ' item' + (skipped > 1 ? 's' : '') + ' saved for tomorrow — no rush, you\'re making progress!', skipped + ' 项留到明天——不着急，你已经在进步！'));
  }

  /* Time feedback */
  if (durationSec && durationSec > 0) {
    var mins = Math.floor(durationSec / 60);
    if (mins >= 5) {
      lines.push(t('You spent ' + mins + ' minutes — solid focus session!', '你用了 ' + mins + ' 分钟——专注力很好！'));
    }
  }

  /* Goal progress hint */
  var ctx = buildTutorContext();
  if (ctx.goals && ctx.goals.activeGoals && ctx.goals.activeGoals.length > 0) {
    var g = ctx.goals.activeGoals[0];
    if (g.progress > 0 && g.progress < 1) {
      var pct = Math.round(g.progress * 100);
      lines.push(t('Goal "' + g.title + '" is at ' + pct + '% — getting closer!', '目标"' + (g.titleZh || g.title) + '"已完成 ' + pct + '%——越来越近了！'));
    }
  }

  if (lines.length === 0) return null;
  return { lines: lines.slice(0, cfg.maxTutorLines || 3) };
}

/* ═══ RECOVERY PACK TUTOR MESSAGE ═══ */

function getRecoveryPackTutorMessage(q, sectionId, board, recovery) {
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  if (!cfg.enablePackTutor) return null;

  var lines = [];

  /* Vocab-focused hint */
  if (recovery && recovery.weakVocab && recovery.weakVocab.length > 0) {
    var count = recovery.weakVocab.length;
    lines.push(t('You have ' + count + ' vocab term' + (count > 1 ? 's' : '') + ' to review for this topic.', '你有 ' + count + ' 个相关词汇需要复习。'));
  }

  /* KP-focused hint */
  if (recovery && recovery.weakKPs && recovery.weakKPs.length > 0) {
    var kp = recovery.weakKPs[0];
    lines.push(t('Review "' + kp.title + '" — it connects to this question.', '复习"' + (kp.title_zh || kp.title) + '"——它与这道题有关。'));
  }

  /* Sibling hint */
  if (recovery && recovery.siblingQuestions && recovery.siblingQuestions.length > 0) {
    lines.push(t('Try a similar question to reinforce this topic.', '尝试一道类似题目来巩固这个知识点。'));
  }

  if (lines.length === 0) return null;
  return { lines: lines.slice(0, cfg.maxTutorLines || 3) };
}

/* ═══ GOAL TUTOR MESSAGE ═══ */

function getGoalTutorMessage() {
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  if (!cfg.enableGoalTutor) return null;

  var ctx = buildTutorContext();
  if (!ctx.goals || !ctx.goals.activeGoals || ctx.goals.activeGoals.length === 0) return null;

  var lines = [];
  for (var i = 0; i < ctx.goals.activeGoals.length; i++) {
    var g = ctx.goals.activeGoals[i];
    if (g.key === 'backlog' && g.current > g.target) {
      lines.push(t('You have ' + g.current + ' items ready to review — keep up the great work!', '有 ' + g.current + ' 项内容可以复习——继续保持！'));
    } else if (g.key === 'section-mastery' && g.current < g.target) {
      var gap = g.target - g.current;
      lines.push(t('Raise ' + (g.sectionId || '') + ' by ' + gap + '% to reach your goal.', '将 ' + (g.sectionId || '') + ' 提升 ' + gap + '% 即可达成目标。'));
    } else if (g.key === 'streak') {
      var remain = g.target - g.current;
      if (remain > 0) {
        lines.push(t(remain + ' more day' + (remain > 1 ? 's' : '') + ' to complete your streak goal!', '再坚持 ' + remain + ' 天即可完成连续目标！'));
      }
    }
  }

  if (lines.length === 0) return null;
  return { lines: lines.slice(0, cfg.maxTutorLines || 3) };
}

/* ═══ RENDER HELPER ═══ */

function renderTutorBlock(message, scene) {
  if (!message || !message.lines || message.lines.length === 0) return '';
  var cfg = typeof AI_TUTOR_CONFIG !== 'undefined' ? AI_TUTOR_CONFIG : {};
  var icon = cfg.tutorIcon || '\ud83d\udca1';
  var title = cfg.tutorName ? t(cfg.tutorName.en, cfg.tutorName.zh) : t('Study Tip', '\u5b66\u4e60\u63d0\u793a');

  var html = '<div class="tutor-block tutor-scene-' + (scene || 'default') + '">';
  html += '<div class="tutor-title">' + icon + ' ' + (typeof escapeHtml === 'function' ? escapeHtml(title) : title) + '</div>';
  for (var i = 0; i < message.lines.length; i++) {
    html += '<div class="tutor-line">' + (typeof escapeHtml === 'function' ? escapeHtml(message.lines[i]) : message.lines[i]) + '</div>';
  }
  html += '</div>';
  return html;
}
