/* ══════════════════════════════════════════════════════════════
   learning-goals.js — Learning Goals (v3.9.0) + Explainability (v3.9.1)
   System-generated goals, progress tracking, scheduler bias,
   completion UX, and goal explainability.
   Loaded after student-profile.js, before recovery-session.js
   ══════════════════════════════════════════════════════════════ */

var _goalsCache = null;

/* ═══ GOAL GENERATION ═══ */

function generateDefaultLearningGoals(profile, backlogCount) {
  var cfg = typeof LEARNING_GOALS_CONFIG !== 'undefined' ? LEARNING_GOALS_CONFIG : {};
  var goals = [];

  /* Rule 1: High backlog → backlog reduction goal */
  if ((backlogCount || 0) >= (cfg.backlogTargetDefault || 3)) {
    goals.push({
      id: 'goal-backlog',
      type: 'recovery',
      key: 'backlog',
      title: 'Complete ' + (cfg.backlogTargetDefault || 3) + ' review items',
      titleZh: '\u5B8C\u6210 ' + (cfg.backlogTargetDefault || 3) + ' \u9879\u590D\u4E60\u5185\u5BB9',
      target: cfg.backlogTargetDefault || 3,
      current: backlogCount,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      reasons: [
        { key: 'backlog', en: 'Plenty to review', zh: '\u6709\u5F88\u591A\u5185\u5BB9\u53EF\u4EE5\u590D\u4E60' }
      ]
    });
  }

  /* Rule 2: Weak section → section mastery goal */
  if (profile && profile.weakSections && profile.weakSections.length > 0) {
    var ws = profile.weakSections[0];
    var tgt = Math.round((cfg.masteryTargetDefault || 0.7) * 100);
    goals.push({
      id: 'goal-section-' + (ws.id || ws),
      type: 'mastery',
      key: 'section-mastery',
      sectionId: ws.id || ws,
      title: 'Raise ' + (ws.title || ws.id || ws) + ' mastery above ' + tgt + '%',
      titleZh: '\u5C06 ' + (ws.title || ws.id || ws) + ' \u638C\u63E1\u5EA6\u63D0\u9AD8\u5230 ' + tgt + '%',
      target: tgt,
      current: ws.score || 0,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      reasons: [
        { key: 'weak-section', en: (ws.title || ws.id || ws) + ' is still weak', zh: (ws.title || ws.id || ws) + ' \u4ECD\u7136\u504F\u5F31' }
      ]
    });
  }

  /* Rule 3: Low streak → streak goal (only if no section goal) */
  if (goals.length < (cfg.maxActiveGoals || 2) && profile && (profile.streak || 0) < (cfg.streakTargetDefault || 5)) {
    goals.push({
      id: 'goal-streak',
      type: 'recovery',
      key: 'streak',
      title: 'Complete recovery ' + (cfg.streakTargetDefault || 5) + ' days in a row',
      titleZh: '\u8FDE\u7EED ' + (cfg.streakTargetDefault || 5) + ' \u5929\u5B8C\u6210\u590D\u67E5',
      target: cfg.streakTargetDefault || 5,
      current: profile.streak || 0,
      progress: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      reasons: [
        { key: 'consistency', en: 'Consistency needs improvement', zh: '\u5B66\u4E60\u8FDE\u7EED\u6027\u4ECD\u9700\u63D0\u5347' }
      ]
    });
  }

  return goals.slice(0, cfg.maxActiveGoals || 2);
}

/* ═══ GOAL PROGRESS ═══ */

function computeGoalProgress(goal, profile, backlogCount) {
  if (!goal) return goal;
  if (goal.key === 'backlog') {
    goal.current = backlogCount || 0;
    goal.progress = goal.current <= goal.target ? 1 : Math.max(0, 1 - (goal.current - goal.target) / Math.max(goal.target, 1));
    goal.isCompleted = goal.current <= goal.target;
  } else if (goal.key === 'section-mastery') {
    var health = null;
    if (typeof getSectionHealth === 'function' && goal.sectionId) {
      var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
      for (var bi = 0; bi < boards.length; bi++) {
        var bid = boards[bi].id || boards[bi];
        health = getSectionHealth(goal.sectionId, bid);
        if (health) break;
      }
    }
    goal.current = health ? Math.round(health.overall) : 0;
    goal.progress = Math.min(1, goal.current / goal.target);
    goal.isCompleted = goal.current >= goal.target;
  } else if (goal.key === 'streak') {
    goal.current = profile ? (profile.streak || 0) : 0;
    goal.progress = Math.min(1, goal.current / goal.target);
    goal.isCompleted = goal.current >= goal.target;
  }
  return goal;
}

/* ═══ REFRESH GOALS ═══ */

function refreshLearningGoals() {
  var cfg = typeof LEARNING_GOALS_CONFIG !== 'undefined' ? LEARNING_GOALS_CONFIG : {};
  var state = typeof getLearningGoalsState === 'function' ? getLearningGoalsState() : { activeGoals: [], completedGoals: [] };

  /* Get current profile and backlog */
  var profile = typeof rebuildStudentProfile === 'function' ? rebuildStudentProfile() : null;
  var backlog = typeof getRecoveryBacklogCount === 'function' ? getRecoveryBacklogCount() : 0;

  /* Snapshot active goals before refresh (for completion detection) */
  var prevActive = [];
  for (var pi = 0; pi < state.activeGoals.length; pi++) {
    prevActive.push({ id: state.activeGoals[pi].id, isCompleted: state.activeGoals[pi].isCompleted });
  }

  /* If no active goals, generate defaults */
  if (!state.activeGoals || state.activeGoals.length === 0) {
    state.activeGoals = generateDefaultLearningGoals(profile, backlog);
  }

  /* Update progress for each active goal */
  var newlyCompleted = [];
  var stillActive = [];
  for (var i = 0; i < state.activeGoals.length; i++) {
    computeGoalProgress(state.activeGoals[i], profile, backlog);
    /* Update reasons with current data */
    _refreshGoalReasons(state.activeGoals[i], profile, backlog);

    if (state.activeGoals[i].isCompleted) {
      /* Check if it was NOT completed before (newly completed) */
      var wasPrev = false;
      for (var pp = 0; pp < prevActive.length; pp++) {
        if (prevActive[pp].id === state.activeGoals[i].id && prevActive[pp].isCompleted) { wasPrev = true; break; }
      }
      if (!wasPrev) newlyCompleted.push(state.activeGoals[i]);
      state.activeGoals[i].completedAt = new Date().toISOString();
      if (!state.completedGoals) state.completedGoals = [];
      state.completedGoals.push(state.activeGoals[i]);
    } else {
      stillActive.push(state.activeGoals[i]);
    }
  }

  state.activeGoals = stillActive;

  /* Auto-generate replacement goals if needed */
  if (cfg.autoGenerateNextGoal && state.activeGoals.length < (cfg.maxActiveGoals || 2)) {
    var candidates = generateDefaultLearningGoals(profile, backlog);
    var existingIds = {};
    for (var ei = 0; ei < state.activeGoals.length; ei++) existingIds[state.activeGoals[ei].id] = true;
    for (var ci = 0; ci < state.completedGoals.length; ci++) existingIds[state.completedGoals[ci].id] = true;
    for (var gi = 0; gi < candidates.length && state.activeGoals.length < (cfg.maxActiveGoals || 2); gi++) {
      if (!existingIds[candidates[gi].id]) {
        state.activeGoals.push(candidates[gi]);
        existingIds[candidates[gi].id] = true;
      }
    }
  }

  /* Record transition if goals just completed */
  if (newlyCompleted.length > 0 && state.activeGoals.length > 0) {
    state.lastGoalTransition = {
      at: Date.now(),
      from: newlyCompleted[0].id,
      to: state.activeGoals[0].id
    };
  }

  state.updatedAt = new Date().toISOString();
  /* Keep completed goals limited */
  if (state.completedGoals && state.completedGoals.length > 10) {
    state.completedGoals = state.completedGoals.slice(-10);
  }

  if (typeof setLearningGoalsState === 'function') setLearningGoalsState(state);
  _goalsCache = state;

  /* Handle completion UX */
  if (newlyCompleted.length > 0) {
    handleGoalCompletion(newlyCompleted, state);
  }

  return state;
}

/* ═══ GOAL REASONS REFRESH (v3.9.1) ═══ */

function _refreshGoalReasons(goal, profile, backlog) {
  if (!goal) return;
  if (goal.key === 'backlog') {
    goal.reasons = [{ key: 'backlog', en: 'Plenty to review (' + (backlog || 0) + ' items)', zh: '\u6709\u5F88\u591A\u5185\u5BB9\u53EF\u4EE5\u590D\u4E60\uFF08' + (backlog || 0) + ' \u9879\uFF09' }];
  } else if (goal.key === 'section-mastery') {
    var pct = goal.current || 0;
    goal.reasons = [{ key: 'weak-section', en: (goal.sectionId || '') + ' mastery is ' + pct + '%', zh: (goal.sectionId || '') + ' \u638C\u63E1\u5EA6\u4E3A ' + pct + '%' }];
  } else if (goal.key === 'streak') {
    goal.reasons = [{ key: 'consistency', en: 'Current streak: ' + (goal.current || 0) + ' days', zh: '\u5F53\u524D\u8FDE\u7EED: ' + (goal.current || 0) + ' \u5929' }];
  }
}

/* ═══ GOAL COMPLETION UX (v3.9.1) ═══ */

function handleGoalCompletion(completedGoals, state) {
  var cfg = typeof LEARNING_GOALS_CONFIG !== 'undefined' ? LEARNING_GOALS_CONFIG : {};
  if (!cfg.showCompletionToast) return;
  for (var i = 0; i < completedGoals.length; i++) {
    var g = completedGoals[i];
    var msg = t('Goal completed', '\u76EE\u6807\u5DF2\u5B8C\u6210') + ': ' + t(g.title, g.titleZh);
    if (typeof showToast === 'function') showToast(msg, 'success');
  }
}

/* ═══ GOAL NARRATIVE (v3.9.1) ═══ */

function getGoalNarrative(goal) {
  if (!goal) return null;
  var reasons = [];
  if (goal.reasons) {
    for (var i = 0; i < goal.reasons.length; i++) {
      reasons.push(t(goal.reasons[i].en, goal.reasons[i].zh));
    }
  }
  return {
    title: t(goal.title, goal.titleZh),
    progressText: Math.round(goal.progress * 100) + '%',
    progressValue: goal.progress,
    reasons: reasons,
    isCompleted: goal.isCompleted
  };
}

/* ═══ SCHEDULER BIAS (v3.9.0) ═══ */

function applyGoalBias(units, goals) {
  if (!goals || !goals.activeGoals || goals.activeGoals.length === 0) return units;

  for (var i = 0; i < units.length; i++) {
    for (var g = 0; g < goals.activeGoals.length; g++) {
      var goal = goals.activeGoals[g];
      /* Section mastery goal: boost that section */
      if (goal.key === 'section-mastery' && goal.sectionId && units[i].sectionId === goal.sectionId) {
        units[i].priorityScore += 6;
        units[i]._goalBias = goal.id;
      }
      /* Backlog goal: boost carry-over items */
      if (goal.key === 'backlog' && units[i].carryOver) {
        units[i].priorityScore += 4;
        units[i]._goalBias = goal.id;
      }
    }
  }
  return units;
}

/* ═══ RENDER ═══ */

function renderLearningGoalsCard() {
  var state = _goalsCache || (typeof getLearningGoalsState === 'function' ? getLearningGoalsState() : null);
  if (!state || !state.activeGoals || state.activeGoals.length === 0) return '';

  var cfg = typeof LEARNING_GOALS_CONFIG !== 'undefined' ? LEARNING_GOALS_CONFIG : {};
  var html = '<div class="plan-card learning-goals-card">';
  html += '<div class="plan-card-header">';
  html += '<span class="plan-card-icon">\uD83C\uDFAF</span>';
  html += '<span class="plan-card-title">' + t('Learning Goals', '\u5B66\u4E60\u76EE\u6807') + '</span>';
  html += '</div>';

  for (var i = 0; i < state.activeGoals.length; i++) {
    var narr = getGoalNarrative(state.activeGoals[i]);
    if (!narr) continue;

    html += '<div class="goal-item">';
    html += '<div class="goal-title">' + escapeHtml(narr.title) + '</div>';
    html += '<div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + narr.progressText + '"></div></div>';
    html += '<div class="goal-progress-text">' + narr.progressText + '</div>';

    /* Goal explainability (v3.9.1) */
    if (narr.reasons.length > 0) {
      var maxR = cfg.maxGoalReasons || 2;
      html += '<div class="goal-explain">';
      for (var ri = 0; ri < Math.min(narr.reasons.length, maxR); ri++) {
        html += '<div class="goal-explain-item">' + escapeHtml(narr.reasons[ri]) + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  }

  /* AI Tutor — Goal guidance (v4.0.0) */
  if (typeof getGoalTutorMessage === 'function') {
    try {
      var _goalTutor = getGoalTutorMessage();
      if (_goalTutor && typeof renderTutorBlock === 'function') {
        html += renderTutorBlock(_goalTutor, 'goal');
      }
    } catch (e) {}
  }

  /* Next goal hint (v3.9.1) */
  if (state.lastGoalTransition && state.lastGoalTransition.at && (Date.now() - state.lastGoalTransition.at < 86400000)) {
    var nextGoal = null;
    for (var ni = 0; ni < state.activeGoals.length; ni++) {
      if (state.activeGoals[ni].id === state.lastGoalTransition.to) { nextGoal = state.activeGoals[ni]; break; }
    }
    if (nextGoal) {
      html += '<div class="goal-next-hint">' + t('New goal', '\u65B0\u76EE\u6807') + ': ' + t(nextGoal.title, nextGoal.titleZh) + '</div>';
    }
  }

  html += '</div>';
  return html;
}
