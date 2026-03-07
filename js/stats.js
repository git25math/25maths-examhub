/* ══════════════════════════════════════════════════════════════
   stats.js — Learning Analytics: summary, heatmap, trend chart
   ══════════════════════════════════════════════════════════════ */

/* ═══ SUMMARY STATS ═══ */
function calcSummaryStats() {
  var history = getHistory();
  var totalA = 0, totalOk = 0, totalFail = 0;
  history.forEach(function(e) {
    totalA += e.a || 0;
    totalOk += e.ok || 0;
    totalFail += e.fail || 0;
  });
  var accuracy = (totalOk + totalFail) > 0 ? Math.round(totalOk / (totalOk + totalFail) * 100) : 0;
  var activeDays = history.filter(function(e) { return (e.a || 0) > 0; }).length;
  var streak = getStreakCount();

  return {
    total: totalA,
    accuracy: accuracy,
    activeDays: activeDays,
    streak: streak
  };
}

/* ═══ HEATMAP DATA ═══ */
function getHeatmapData(days) {
  if (!days) days = 91;
  var history = getHistory();
  var map = {};
  history.forEach(function(e) { map[e.d] = e.a || 0; });

  /* Build array for last N days */
  var data = [];
  var today = new Date();
  for (var i = days - 1; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var ds = d.toLocaleDateString('en-CA');
    data.push({ d: ds, a: map[ds] || 0, dow: d.getDay() });
  }

  /* Quartile-based intensity 0-4 */
  var vals = data.map(function(x) { return x.a; }).filter(function(v) { return v > 0; }).sort(function(a, b) { return a - b; });
  var q1 = vals.length > 0 ? vals[Math.floor(vals.length * 0.25)] : 1;
  var q2 = vals.length > 0 ? vals[Math.floor(vals.length * 0.5)] : 2;
  var q3 = vals.length > 0 ? vals[Math.floor(vals.length * 0.75)] : 3;

  data.forEach(function(x) {
    if (x.a === 0) x.level = 0;
    else if (x.a <= q1) x.level = 1;
    else if (x.a <= q2) x.level = 2;
    else if (x.a <= q3) x.level = 3;
    else x.level = 4;
  });

  return data;
}

/* ═══ TREND DATA ═══ */
function getTrendData(days) {
  if (!days) days = 30;
  var history = getHistory();
  var map = {};
  history.forEach(function(e) { map[e.d] = e; });

  var data = [];
  var today = new Date();
  for (var i = days - 1; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var ds = d.toLocaleDateString('en-CA');
    var e = map[ds] || { a: 0, ok: 0, fail: 0 };
    data.push({ d: ds, a: e.a || 0, ok: e.ok || 0, fail: e.fail || 0 });
  }
  return data;
}

/* ═══ MAIN RENDER ═══ */
function renderStats() {
  /* Bootstrap history on first visit */
  bootstrapHistory();

  var panel = E('panel-stats');
  var stats = calcSummaryStats();
  var heatData = getHeatmapData(91);
  var trendData = getTrendData(30);

  var html = '<div class="section-title" style="display:flex;align-items:center;gap:8px">' + t('Learning Analytics', '\u5b66\u4e60\u6570\u636e') + ' <button class="btn btn-ghost btn-sm no-print" onclick="exportStats()" style="margin-left:auto;font-size:11px">\u2b07 ' + t('Export', '\u5bfc\u51fa') + '</button></div>';

  /* Summary cards */
  html += '<div class="stats-summary">';
  html += '<div class="stat-card"><div class="stat-num">' + stats.total + '</div><div class="stat-label">' + t('Activities', '总练习') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-num">' + stats.accuracy + '%</div><div class="stat-label">' + t('Accuracy', '正确率') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-num">' + stats.activeDays + '</div><div class="stat-label">' + t('Active Days', '活跃天数') + '</div></div>';
  html += '<div class="stat-card stat-card-streak"><div class="stat-num">' + stats.streak + '</div><div class="stat-label">' + t('Streak', '连续') + '</div></div>';
  html += '</div>';

  /* Mode breakdown */
  html += renderModeBreakdown();

  /* Heatmap */
  html += renderCalendarHeatmap(heatData);

  /* Trend chart */
  html += renderTrendChart(trendData);

  /* Achievement badges */
  html += _renderBadgeSection();

  panel.innerHTML = html;
}

function _renderBadgeSection() {
  if (typeof BADGES === 'undefined' || typeof getUnlockedBadges !== 'function') return '';
  var unlocked = getUnlockedBadges();
  var html = '<div class="section-title" style="margin-top:24px">' + t('Achievements', '\u6210\u5c31\u5fbd\u7ae0') + '</div>';
  html += '<div class="badge-grid">';
  BADGES.forEach(function(b) {
    var isUnlocked = unlocked.indexOf(b.id) >= 0;
    html += '<div class="badge-item' + (isUnlocked ? ' unlocked' : '') + '">';
    html += '<span class="badge-icon">' + b.icon + '</span>';
    html += '<span class="badge-name">' + t(b.en, b.zh) + '</span>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/* ═══ MODE BREAKDOWN ═══ */
function renderModeBreakdown() {
  var s = loadS();
  var md = s.modeDone || {};
  var modes = [
    { key: 'study',   icon: '\ud83d\udcda', en: 'Study',   zh: '\u5b66\u4e60' },
    { key: 'quiz',    icon: '\u2753',       en: 'Quiz',    zh: '\u6d4b\u9a8c' },
    { key: 'spell',   icon: '\u270d\ufe0f', en: 'Spell',   zh: '\u62fc\u5199' },
    { key: 'match',   icon: '\ud83c\udfaf', en: 'Match',   zh: '\u914d\u5bf9' },
    { key: 'battle',  icon: '\u26a1',       en: 'Battle',  zh: '\u6311\u6218' },
    { key: 'review',  icon: '\ud83d\udd04', en: 'Review',  zh: '\u590d\u4e60' },
    { key: 'practice',icon: '\u270f\ufe0f', en: 'Practice',zh: '\u7ec3\u4e60' }
  ];

  var counts = {};
  var total = 0;
  modes.forEach(function(m) { counts[m.key] = 0; });
  for (var k in md) {
    if (!md[k]) continue;
    var parts = k.split(':');
    if (parts.length === 2 && counts[parts[1]] !== undefined) {
      counts[parts[1]]++;
      total++;
    }
  }

  if (total === 0) return '';

  var maxCount = 1;
  modes.forEach(function(m) { if (counts[m.key] > maxCount) maxCount = counts[m.key]; });

  var html = '<div class="stats-section">';
  html += '<div class="stats-section-title">' + t('Mode Completion', '\u6a21\u5f0f\u5b8c\u6210\u5ea6') + '</div>';
  html += '<div class="mode-breakdown">';
  modes.forEach(function(m) {
    var c = counts[m.key];
    var pct = Math.round(c / maxCount * 100);
    html += '<div class="mode-break-row">';
    html += '<div class="mode-break-label">' + m.icon + ' ' + t(m.en, m.zh) + '</div>';
    html += '<div class="mode-break-bar"><div class="mode-break-fill" style="width:' + pct + '%"></div></div>';
    html += '<div class="mode-break-count">' + c + '</div>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

/* ═══ CALENDAR HEATMAP ═══ */
function renderCalendarHeatmap(data) {
  var html = '<div class="stats-section">';
  html += '<div class="stats-section-title">' + t('Activity \u00b7 Last 90 days', '活动记录 \u00b7 近 90 天') + '</div>';
  html += '<div class="heatmap-wrap">';

  /* Day labels */
  var dayLabels = appLang === 'en' ? ['', 'Mon', '', 'Wed', '', 'Fri', ''] : ['', '一', '', '三', '', '五', ''];

  html += '<div class="heatmap-labels">';
  for (var r = 0; r < 7; r++) {
    html += '<div class="heatmap-day-label">' + dayLabels[r] + '</div>';
  }
  html += '</div>';

  /* Grid: 7 rows x N cols */
  /* Pad start so first column starts on Sunday */
  var startDow = data[0].dow;
  var cells = [];
  for (var p = 0; p < startDow; p++) {
    cells.push({ level: -1 }); /* empty padding */
  }
  cells = cells.concat(data);

  var cols = Math.ceil(cells.length / 7);
  html += '<div class="heatmap-grid" style="grid-template-columns:repeat(' + cols + ',1fr)">';

  /* Render column by column (each col = 7 rows) */
  for (var c = 0; c < cols; c++) {
    for (var row = 0; row < 7; row++) {
      var idx = c * 7 + row;
      if (idx >= cells.length || cells[idx].level === -1) {
        html += '<div class="heatmap-cell heatmap-empty"></div>';
      } else {
        var cell = cells[idx];
        var tip = cell.d + ': ' + cell.a + ' ' + t('activities', '次练习');
        html += '<div class="heatmap-cell heatmap-l' + cell.level + '" title="' + tip + '"></div>';
      }
    }
  }
  html += '</div>';
  html += '</div>';

  /* Legend */
  html += '<div class="heatmap-legend">';
  html += '<span class="heatmap-legend-label">' + t('Less', '少') + '</span>';
  for (var l = 0; l <= 4; l++) {
    html += '<div class="heatmap-cell heatmap-l' + l + '"></div>';
  }
  html += '<span class="heatmap-legend-label">' + t('More', '多') + '</span>';
  html += '</div>';

  html += '</div>';
  return html;
}

/* ═══ TREND CHART ═══ */
function renderTrendChart(data) {
  var html = '<div class="stats-section">';
  html += '<div class="stats-section-title">' + t('Daily Activity \u00b7 Last 30 days', '每日活动 \u00b7 近 30 天') + '</div>';

  var maxA = 1;
  data.forEach(function(d) { if (d.a > maxA) maxA = d.a; });

  html += '<div class="trend-chart">';
  data.forEach(function(d, i) {
    var h = Math.round((d.a / maxA) * 100);
    var barClass = d.a > 0 ? 'trend-bar-fill' : 'trend-bar-empty';
    var tip = d.d + ': ' + d.a + ' ' + t('activities', '次练习');
    /* Show date label every 7 days and on last bar */
    var label = '';
    if (i % 7 === 0 || i === data.length - 1) {
      label = d.d.slice(5); /* MM-DD */
    }
    html += '<div class="trend-bar-wrap" title="' + tip + '">';
    html += '<div class="trend-bar ' + barClass + '" style="height:' + h + '%"></div>';
    html += '<div class="trend-bar-label">' + label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '</div>';
  return html;
}

/* ═══ EXPORT STATS ═══ */
function exportStats() {
  var stats = calcSummaryStats();
  var gs = getGlobalStats();
  var trend = getTrendData(30);
  var s = loadS();
  var md = s.modeDone || {};

  var modes = ['study', 'quiz', 'spell', 'match', 'battle', 'review', 'practice'];
  var modeCounts = {};
  modes.forEach(function(m) { modeCounts[m] = 0; });
  for (var k in md) {
    if (!md[k]) continue;
    var parts = k.split(':');
    if (parts.length === 2 && modeCounts[parts[1]] !== undefined) modeCounts[parts[1]]++;
  }

  var lines = ['\ufeff' + 'Date,Activities,Correct,Wrong'];
  trend.forEach(function(d) { lines.push(d.d + ',' + d.a + ',' + d.ok + ',' + d.fail); });
  lines.push('');
  lines.push('Summary');
  lines.push('Total Activities,' + stats.total);
  lines.push('Accuracy,' + stats.accuracy + '%');
  lines.push('Active Days,' + stats.activeDays);
  lines.push('Streak,' + stats.streak);
  lines.push('Total Words,' + gs.total);
  lines.push('Progress,' + gs.learningPct + '%');
  lines.push('Mastery,' + gs.masteryPct + '%');
  lines.push('');
  lines.push('Mode Completion');
  modes.forEach(function(m) { lines.push(m + ',' + modeCounts[m]); });

  var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, '25maths-stats-' + new Date().toLocaleDateString('en-CA') + '.csv');
  showToast(t('Stats exported!', '\u6570\u636e\u5df2\u5bfc\u51fa\uff01'));
}
