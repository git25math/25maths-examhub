/* ══════════════════════════════════════════════════════════════
   student-profile.js — Student Recovery Profile (v3.7.0)
   Lightweight learning profile: accuracy, mastery, recovery rate,
   weak sections, trend. Renders as a card in Today's Plan.
   Loaded after recovery-scheduler.js, before recovery-session.js
   ══════════════════════════════════════════════════════════════ */

var _profileCache = null;
var _profileCacheTs = 0;

/* ═══ CORE AGGREGATOR ═══ */

function rebuildStudentProfile() {
  var cfg = typeof STUDENT_PROFILE_CONFIG !== 'undefined' ? STUDENT_PROFILE_CONFIG : {};
  var ttl = cfg.cacheTTL || 300000;
  if (_profileCache && (Date.now() - _profileCacheTs < ttl)) return _profileCache;

  var stats = _computeProfileAccuracy();
  var mastery = _computeProfileMastery();
  var recovery = _computeProfileRecovery();
  var weak = _computeProfileWeakSections();
  var trend = _computeProfileTrend();

  _profileCache = {
    accuracy: stats.accuracy,
    activeDays: stats.activeDays,
    streak: stats.streak,
    mastery: mastery,
    recovery: recovery,
    weakSections: weak,
    trend: trend,
    ts: Date.now()
  };
  _profileCacheTs = Date.now();

  try { localStorage.setItem(cfg.cacheKey || 'student_profile', JSON.stringify(_profileCache)); } catch (e) {}
  return _profileCache;
}

/* ═══ ACCURACY (from stats.js) ═══ */

function _computeProfileAccuracy() {
  if (typeof calcSummaryStats === 'function') return calcSummaryStats();
  return { accuracy: 0, activeDays: 0, streak: 0, total: 0 };
}

/* ═══ MASTERY (vocab + kp + pp FLM counts) ═══ */

function _computeProfileMastery() {
  var total = 0, mastered = 0;

  /* Vocab */
  if (typeof getAllWords === 'function') {
    var words = getAllWords();
    for (var i = 0; i < words.length; i++) {
      total++;
      if (words[i].fs === 'mastered') mastered++;
    }
  }

  /* KP */
  if (typeof loadS === 'function') {
    var s = loadS();
    if (s.kpDone) {
      for (var k in s.kpDone) {
        total++;
        if (s.kpDone[k].fs === 'mastered') mastered++;
      }
    }
  }

  /* PP */
  if (typeof _ppGetMastery === 'function') {
    var pp = _ppGetMastery();
    for (var p in pp) {
      total++;
      if (pp[p].fs === 'mastered') mastered++;
    }
  }

  return {
    total: total,
    mastered: mastered,
    pct: total > 0 ? Math.round(mastered / total * 100) : 0
  };
}

/* ═══ RECOVERY (from scheduler history) ═══ */

function _computeProfileRecovery() {
  if (typeof getRecoveryScheduleHistory !== 'function') return { completionRate: 0, avgDailyLoad: 0, hasData: false };
  var hist = getRecoveryScheduleHistory();
  if (!hist || hist.length === 0) return { completionRate: 0, avgDailyLoad: 0, hasData: false };

  var totalPlanned = 0, totalDone = 0;
  for (var i = 0; i < hist.length; i++) {
    totalPlanned += hist[i].total || hist[i].planned || 0;
    totalDone += hist[i].completed || hist[i].done || 0;
  }

  return {
    completionRate: totalPlanned > 0 ? Math.round(totalDone / totalPlanned * 100) : 0,
    avgDailyLoad: hist.length > 0 ? Math.round(totalPlanned / hist.length * 10) / 10 : 0,
    hasData: true
  };
}

/* ═══ WEAK SECTIONS ═══ */

function _computeProfileWeakSections() {
  var cfg = typeof STUDENT_PROFILE_CONFIG !== 'undefined' ? STUDENT_PROFILE_CONFIG : {};
  var threshold = cfg.weakThreshold || 40;
  var maxWeak = cfg.maxWeakSections || 3;
  var weak = [];

  if (typeof BOARD_SYLLABUS === 'undefined' || typeof getSectionHealth !== 'function') return weak;

  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : [];
  for (var bi = 0; bi < boards.length; bi++) {
    var boardId = boards[bi].id || boards[bi];
    var syllabus = BOARD_SYLLABUS[boardId];
    if (!syllabus || !syllabus.chapters) continue;
    for (var ci = 0; ci < syllabus.chapters.length; ci++) {
      var ch = syllabus.chapters[ci];
      if (!ch.sections) continue;
      for (var si = 0; si < ch.sections.length; si++) {
        var sec = ch.sections[si];
        var health = getSectionHealth(sec.id, boardId);
        var score = health ? health.overall : 100;
        if (score < threshold) {
          weak.push({ id: sec.id, title: sec.title || sec.id, score: score, board: boardId });
        }
      }
    }
  }

  /* Sort by score ascending (weakest first), limit */
  weak.sort(function(a, b) { return a.score - b.score; });
  return weak.slice(0, maxWeak);
}

/* ═══ TREND (recent 7d vs previous 7d accuracy) ═══ */

function _computeProfileTrend() {
  var cfg = typeof STUDENT_PROFILE_CONFIG !== 'undefined' ? STUDENT_PROFILE_CONFIG : {};
  var days = cfg.trendDays || 7;
  var minDays = cfg.minDataDays || 3;

  if (typeof getHistory !== 'function') return { direction: 'stable', delta: 0, sufficient: false };
  var history = getHistory();
  if (!history || history.length === 0) return { direction: 'stable', delta: 0, sufficient: false };

  var today = new Date();
  var recentOk = 0, recentFail = 0, recentDays = 0;
  var prevOk = 0, prevFail = 0, prevDays = 0;

  for (var i = 0; i < history.length; i++) {
    var d = new Date(history[i].d);
    var diffDays = Math.floor((today - d) / 86400000);
    if (diffDays < days) {
      recentOk += history[i].ok || 0;
      recentFail += history[i].fail || 0;
      if ((history[i].a || 0) > 0) recentDays++;
    } else if (diffDays < days * 2) {
      prevOk += history[i].ok || 0;
      prevFail += history[i].fail || 0;
      if ((history[i].a || 0) > 0) prevDays++;
    }
  }

  var sufficient = recentDays >= minDays && prevDays >= minDays;
  var recentAcc = (recentOk + recentFail) > 0 ? recentOk / (recentOk + recentFail) * 100 : 0;
  var prevAcc = (prevOk + prevFail) > 0 ? prevOk / (prevOk + prevFail) * 100 : 0;
  var delta = Math.round(recentAcc - prevAcc);
  var direction = delta > 3 ? 'up' : (delta < -3 ? 'down' : 'stable');

  return { direction: direction, delta: delta, sufficient: sufficient };
}

/* ═══ RENDER ═══ */

function renderStudentProfileCard() {
  var profile = rebuildStudentProfile();
  if (!profile) return '';

  /* Gate: no data at all → don't render */
  if (profile.activeDays === 0 && profile.mastery.total === 0) return '';

  var html = '<div class="plan-card student-profile-card">';
  html += '<div class="plan-card-header">';
  html += '<span class="plan-card-icon">\uD83D\uDCCA</span>';
  html += '<span class="plan-card-title">' + t('My Profile', '\u5B66\u4E60\u753B\u50CF') + '</span>';

  /* Trend pill */
  if (profile.trend.sufficient) {
    var tCls = 'profile-trend-' + profile.trend.direction;
    var tIcon = profile.trend.direction === 'up' ? '\u2191' : (profile.trend.direction === 'down' ? '\u2193' : '\u2192');
    var tLabel = profile.trend.direction === 'up' ? t('Improving', '\u8FDB\u6B65\u4E2D')
      : (profile.trend.direction === 'down' ? t('Declining', '\u4E0B\u964D\u4E2D') : t('Stable', '\u7A33\u5B9A'));
    html += '<span class="profile-trend-pill ' + tCls + '">' + tIcon + ' ' + tLabel + '</span>';
  }
  html += '</div>';

  /* 2x2 metrics grid */
  html += '<div class="student-profile-metrics">';
  html += _profileMetric(t('Accuracy', '\u51C6\u786E\u7387'), profile.accuracy + '%');
  html += _profileMetric(t('Mastery', '\u638C\u63E1\u5EA6'), profile.mastery.pct + '%');
  html += _profileMetric(t('Streak', '\u8FDE\u7EED'), profile.streak + 'd');

  /* 4th cell: Recovery% if available, else Active Days */
  if (profile.recovery.hasData) {
    html += _profileMetric(t('Recovery', '\u590D\u67E5\u7387'), profile.recovery.completionRate + '%');
  } else {
    html += _profileMetric(t('Active Days', '\u6D3B\u8DC3\u5929\u6570'), '' + profile.activeDays);
  }
  html += '</div>';

  /* Weak sections pills */
  if (profile.weakSections.length > 0) {
    html += '<div class="student-profile-weak">';
    html += '<div class="profile-weak-label">' + t('Needs work', '\u5F85\u52A0\u5F3A') + '</div>';
    html += '<div class="profile-weak-pills">';
    for (var i = 0; i < profile.weakSections.length; i++) {
      html += '<span class="profile-weak-pill">' + escapeHtml(profile.weakSections[i].title) + '</span>';
    }
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

function _profileMetric(label, value) {
  return '<div class="student-profile-metric">'
    + '<div class="profile-metric-value">' + value + '</div>'
    + '<div class="profile-metric-label">' + label + '</div>'
    + '</div>';
}

/* ═══ CACHE LOAD (startup) ═══ */

function loadCachedProfile() {
  var cfg = typeof STUDENT_PROFILE_CONFIG !== 'undefined' ? STUDENT_PROFILE_CONFIG : {};
  try {
    var raw = localStorage.getItem(cfg.cacheKey || 'student_profile');
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.ts && (Date.now() - p.ts < (cfg.cacheTTL || 300000))) {
        _profileCache = p;
        _profileCacheTs = p.ts;
      }
    }
  } catch (e) {}
}

loadCachedProfile();
