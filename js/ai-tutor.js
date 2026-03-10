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
    lines.push(t("Your accuracy has dipped recently. Today's plan focuses on reinforcement.", '你的准确率最近有所下降。今天的计划侧重巩固。'));
  } else {
    lines.push(t("Staying consistent is key. Let's keep building on your progress.", '保持一致性是关键。让我们继续巩固你的进度。'));
  }

  /* Backlog warning */
  if (ctx.backlog > 5) {
    lines.push(t('You have ' + ctx.backlog + ' items pending — try to clear a few today.', '你有 ' + ctx.backlog + ' 个待复查项——今天试着清除一些。'));
  }

  /* Weak section hint */
  if (ctx.weakSections.length > 0) {
    var ws = ctx.weakSections[0];
    var wsName = ws.title || ws.id || '';
    lines.push(t(wsName + ' needs more attention — the plan includes it.', wsName + ' 需要更多关注——计划已包含。'));
  }

  /* Streak encouragement */
  if (ctx.streak >= 3 && ctx.streak < 7) {
    lines.push(t('Nice ' + ctx.streak + '-day streak! A few more days to build a strong habit.', '\u4e0d\u9519\u7684 ' + ctx.streak + ' \u5929\u8fde\u7eed\uff01\u518d\u575a\u6301\u51e0\u5929\u5c31\u80fd\u517b\u6210\u597d\u4e60\u60ef\u3002'));
  } else if (ctx.streak >= 7) {
    lines.push(t('Amazing ' + ctx.streak + "-day streak! You're building a great habit.", '\u4e86\u4e0d\u8d77\u7684 ' + ctx.streak + ' \u5929\u8fde\u7eed\uff01\u4f60\u6b63\u5728\u517b\u6210\u597d\u4e60\u60ef\u3002'));
  }

  /* Error pattern awareness (v4.2.0) */
  if (ctx.errorPatterns && ctx.errorPatterns.length > 0) {
    var _epKey = ctx.errorPatterns[0].key;
    if (_epKey === 'concept-gap') {
      lines.push(t('Your recent mistakes are more conceptual. Slow down and rebuild the idea before retrying.', '\u4f60\u6700\u8fd1\u7684\u9519\u8bef\u66f4\u504f\u6982\u5ff5\u95ee\u9898\u3002\u5148\u8865\u6982\u5ff5\uff0c\u518d\u56de\u9898\u76ee\u3002'));
    } else if (_epKey === 'careless-reading') {
      lines.push(t('Your recent mistakes often come from reading too fast. Re-read the question before solving.', '\u4f60\u6700\u8fd1\u7684\u9519\u8bef\u5e38\u51fa\u5728\u8bfb\u9898\u8fc7\u5feb\u3002\u505a\u9898\u524d\u5148\u5b8c\u6574\u91cd\u8bfb\u9898\u5e72\u3002'));
    } else if (_epKey === 'vocab-misunderstanding') {
      lines.push(t('Vocabulary seems to be a recurring issue. Review key terms before each session.', '\u8bcd\u6c47\u7406\u89e3\u4f3c\u4e4e\u662f\u53cd\u590d\u51fa\u73b0\u7684\u95ee\u9898\u3002\u6bcf\u6b21\u590d\u67e5\u524d\u5148\u590d\u4e60\u5173\u952e\u8bcd\u3002'));
    } else if (_epKey === 'careless-calculation') {
      lines.push(t('Calculation errors are frequent. Check your work line by line.', '\u8ba1\u7b97\u9519\u8bef\u8f83\u591a\u3002\u9010\u6b65\u68c0\u67e5\u4f60\u7684\u8ba1\u7b97\u8fc7\u7a0b\u3002'));
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
    lines.push(t("You skipped " + skipped + " — they'll carry over to tomorrow.", '你跳过了 ' + skipped + ' 项——它们会结转到明天。'));
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
      lines.push(t('Focus on clearing your backlog — ' + g.current + ' items remain.', '专注清除积压——还有 ' + g.current + ' 项待处理。'));
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
