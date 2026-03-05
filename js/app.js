/* ══════════════════════════════════════════════════════════════
   app.js — Application entry point: init + URL parameter handling
   ══════════════════════════════════════════════════════════════ */

onLevelsReady(function() {
(async function initApp() {
  updateAuthLang();
  /* Load custom levels from storage */
  var custom = getCustomLevels();
  if (custom.length > 0) {
    LEVELS = LEVELS.concat(custom);
  }

  /* Listen for password recovery callback */
  if (sb) {
    sb.auth.onAuthStateChange(function(event, session) {
      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(function() { showSettings(); showToast(t('Set your new password', '请设置新密码')); }, 500);
      }
    });
  }

  /* Check for existing Supabase session */
  if (sb) {
    try {
      var sess = await sb.auth.getSession();
      if (sess.data.session) {
        var sessMeta = sess.data.session.user.user_metadata || {};
        currentUser = {
          email: sess.data.session.user.email,
          id: sess.data.session.user.id,
          nickname: sessMeta.nickname || ''
        };
        if (sessMeta.board) userBoard = sessMeta.board;
        if (sessMeta.class_id) userClassId = sessMeta.class_id;
        if (sessMeta.school_id) userSchoolId = sessMeta.school_id;
        try { localStorage.setItem('wmatch_login_ts', '' + Date.now()); } catch(e) {}
        await syncFromCloud();

        /* Reload custom levels after cloud sync */
        var customAfterSync = getCustomLevels();
        if (customAfterSync.length > custom.length) {
          LEVELS = LEVELS.slice(0, LEVELS.length - custom.length).concat(customAfterSync);
        }

        await afterLogin();

        /* Handle ?level=N URL parameter for deep linking */
        var params = new URLSearchParams(window.location.search);
        var lvlParam = params.get('level');
        if (lvlParam !== null) {
          var lvlIdx = parseInt(lvlParam, 10);
          if (!isNaN(lvlIdx) && lvlIdx >= 0 && lvlIdx < LEVELS.length) {
            openDeck(lvlIdx);
          }
        }

        /* Recover from iOS page eviction after share */
        try {
          var shareLvl = sessionStorage.getItem('wmatch_share_lvl');
          if (shareLvl !== null) {
            sessionStorage.removeItem('wmatch_share_lvl');
            var sIdx = parseInt(shareLvl, 10);
            if (!isNaN(sIdx) && sIdx >= 0 && sIdx < LEVELS.length) {
              openDeck(sIdx);
            }
          }
        } catch(e) {}

        return;
      }
    } catch (e) {
      /* Supabase error — fall through to auth screen */
    }
  }

  /* No session — show auth screen */
  try { localStorage.removeItem('wmatch_login_ts'); } catch(e) {}
  var hideStyle = document.getElementById('auth-hide-style');
  if (hideStyle) hideStyle.remove();
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
})();
});

/* ═══ LEADERBOARD ═══ */
var _boardScope = 'course';    /* 'course' | 'class' | 'grade' | 'school' */
var _boardSubKey = null;       /* currently selected sub pill value */
var _boardClassList = null;    /* cached classes list [{id, name, grade}] */
var _boardClassListTs = 0;     /* cache timestamp */

/* Load classes for current school (30s cache) */
async function _loadBoardClasses() {
  if (!sb || !userSchoolId) return [];
  var now = Date.now();
  if (_boardClassList && (now - _boardClassListTs) < 30000) return _boardClassList;
  try {
    var res = await sb.from('classes')
      .select('id, name, grade')
      .eq('school_id', userSchoolId)
      .order('created_at', { ascending: true });
    _boardClassList = res.data || [];
    _boardClassListTs = now;
  } catch (e) {
    _boardClassList = [];
  }
  return _boardClassList;
}

async function renderBoard() {
  var panel = E('panel-board');

  /* Guest users — read-only Top 10 */
  if (isGuest()) {
    var gHtml = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + '</div>';
    gHtml += '<div style="font-size:12px;color:var(--c-muted);margin-bottom:16px">' + t('Live ranking \xb7 Based on mastery score', '\u5b9e\u65f6\u6392\u540d \xb7 \u57fa\u4e8e\u5355\u8bcd\u638c\u63e1\u7387\u8ba1\u5206') + '</div>';
    /* Try fetching Top 10 */
    var gRows = [];
    if (sb) {
      try {
        var gRes = await sb.from('leaderboard')
          .select('nickname,score,mastery_pct,rank_emoji')
          .order('score', { ascending: false })
          .limit(10);
        if (gRes.data) gRows = gRes.data;
      } catch (e) { /* fallback empty */ }
    }
    if (gRows.length > 0) {
      var gMedals = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];
      gHtml += '<div class="board-list">';
      gRows.forEach(function(row, i) {
        gHtml += '<div class="board-row">';
        gHtml += '<div class="board-rank">' + (i < 3 ? gMedals[i] : (i + 1)) + '</div>';
        gHtml += '<div class="board-name">' + (row.rank_emoji || '') + ' ' + escapeHtml(row.nickname || t('Anonymous', '\u533f\u540d')) + '</div>';
        gHtml += '<div class="board-score">' + row.score + '</div>';
        gHtml += '<div class="board-streak">' + (row.mastery_pct != null ? row.mastery_pct + '%' : '') + '</div>';
        gHtml += '</div>';
      });
      gHtml += '</div>';
    } else {
      gHtml += '<div style="text-align:center;color:var(--c-muted);padding:32px 0">' + t('No ranking data yet', '\u6682\u65e0\u6392\u540d\u6570\u636e') + '</div>';
    }
    /* Signup CTA */
    gHtml += '<div style="text-align:center;margin-top:20px;padding:20px;background:var(--c-surface);border-radius:var(--r-lg);box-shadow:var(--shadow)">';
    gHtml += '<div style="font-size:24px;margin-bottom:8px">\u2728</div>';
    gHtml += '<div style="font-size:14px;color:var(--c-text2);margin-bottom:12px">' + t('Register to join the leaderboard!', '\u6ce8\u518c\u8d26\u53f7\u5373\u53ef\u52a0\u5165\u6392\u884c\u699c\uff01') + '</div>';
    gHtml += '<button class="btn btn-primary" onclick="doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
    gHtml += '</div>';
    panel.innerHTML = gHtml;
    return;
  }

  panel.innerHTML = '<div class="section-title" style="display:flex;align-items:center;gap:8px">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + ' <button class="btn-help" onclick="showScoreGuide()" title="' + t('About scoring', '\u4e86\u89e3\u79ef\u5206\u89c4\u5219') + '">\u2753</button></div>' +
    '<div style="text-align:center;color:var(--c-muted);padding:40px 0">' + t('Loading...', '\u52a0\u8f7d\u4e2d...') + '</div>';

  /* Pre-load classes if scope is 'class' */
  var classList = [];
  if (_boardScope === 'class' && userSchoolId) {
    classList = await _loadBoardClasses();
  }

  /* Resolve default _boardSubKey per scope */
  if (_boardSubKey === null) {
    if (_boardScope === 'course') {
      _boardSubKey = userBoard || BOARD_OPTIONS[0].value;
    } else if (_boardScope === 'class') {
      _boardSubKey = userClassId || (classList.length > 0 ? classList[0].id : null);
    } else if (_boardScope === 'grade') {
      /* Default to user's grade if it's a 25m-y* board */
      _boardSubKey = (userBoard && userBoard.indexOf('25m-y') === 0) ? userBoard : GRADE_OPTIONS[0].value;
    }
    /* school scope has no sub key */
  }

  var rows = [];
  var userId = currentUser ? currentUser.id : null;

  /* Fetch cloud leaderboard */
  if (sb && isLoggedIn()) {
    try {
      var qry = sb.from('leaderboard')
        .select('user_id,nickname,score,mastery_pct,rank_emoji,mastered_words,total_words');

      /* Apply filter based on scope + sub key */
      if (_boardScope === 'class' && _boardSubKey) {
        qry = qry.eq('class_id', _boardSubKey);
      } else if (_boardScope === 'grade' && _boardSubKey && userSchoolId) {
        qry = qry.eq('board', _boardSubKey).eq('school_id', userSchoolId);
      } else if (_boardScope === 'school' && userSchoolId) {
        qry = qry.eq('school_id', userSchoolId);
      } else {
        /* course scope */
        if (_boardSubKey) qry = qry.eq('board', _boardSubKey);
      }

      var res = await qry.order('score', { ascending: false }).limit(50);
      if (res.data && res.data.length > 0) {
        rows = res.data.map(function(r) {
          return {
            name: r.nickname || t('Anonymous', '\u533f\u540d'),
            emoji: r.rank_emoji,
            score: r.score,
            pct: r.mastery_pct,
            mastered: r.mastered_words,
            total: r.total_words,
            isMe: r.user_id === userId
          };
        });
      }
    } catch (e) { /* fallback below */ }
  }

  /* If no cloud data or guest, show local user only (skip teachers) */
  if (rows.length === 0 && !isTeacher()) {
    var userName = currentUser ? getDisplayName() : t('You', '\u4f60');
    var userRank = getRank();
    var pct = getMasteryPct();
    rows.push({ name: userName, emoji: userRank.emoji, score: pct * 20, pct: pct, isMe: true });
  }

  /* Ensure current user is in the list (skip teachers) */
  var hasMe = rows.some(function(r) { return r.isMe; });
  if (!hasMe && isLoggedIn() && !isTeacher()) {
    var myRank = getRank();
    var myPct = getMasteryPct();
    rows.push({
      name: getDisplayName(),
      emoji: myRank.emoji, score: myPct * 20, pct: myPct, isMe: true
    });
    rows.sort(function(a, b) { return b.score - a.score; });
  }

  /* Build HTML */
  var html = '<div class="section-title" style="display:flex;align-items:center;gap:8px">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + ' <button class="btn-help" onclick="showScoreGuide()" title="' + t('About scoring', '\u4e86\u89e3\u79ef\u5206\u89c4\u5219') + '">\u2753</button></div>';

  /* Scope tabs — only when userSchoolId exists */
  if (userSchoolId) {
    var scopes = [
      { key: 'course', label: t('Course', '\u8bfe\u7a0b') },
      { key: 'class',  label: t('Class', '\u73ed\u7ea7') },
      { key: 'grade',  label: t('Grade', '\u5e74\u7ea7') },
      { key: 'school', label: t('School', '\u5168\u6821') }
    ];
    html += '<div class="admin-tabs board-scope-tabs">';
    scopes.forEach(function(s) {
      html += '<button class="admin-tab' + (s.key === _boardScope ? ' active' : '') + '" onclick="switchBoardScope(\'' + s.key + '\')">' + s.label + '</button>';
    });
    html += '</div>';
  }

  /* Sub pills per scope */
  if (_boardScope === 'course') {
    var boardOpts = userSchoolId ? BOARD_OPTIONS : getPublicBoardOptions();
    html += '<div class="board-sub-pills">';
    boardOpts.forEach(function(opt) {
      html += '<button class="board-sub-pill' + (opt.value === _boardSubKey ? ' active' : '') + '" onclick="switchBoardSub(\'' + opt.value + '\')">' + opt.emoji + ' ' + t(opt.name, opt.nameZh) + '</button>';
    });
    html += '</div>';
  } else if (_boardScope === 'class' && classList.length > 0) {
    html += '<div class="board-sub-pills">';
    classList.forEach(function(c) {
      html += '<button class="board-sub-pill' + (c.id === _boardSubKey ? ' active' : '') + '" onclick="switchBoardSub(\'' + c.id + '\')">' + escapeHtml(c.name) + '</button>';
    });
    html += '</div>';
  } else if (_boardScope === 'grade') {
    html += '<div class="board-sub-pills">';
    GRADE_OPTIONS.forEach(function(opt) {
      html += '<button class="board-sub-pill' + (opt.value === _boardSubKey ? ' active' : '') + '" onclick="switchBoardSub(\'' + opt.value + '\')">' + opt.emoji + ' ' + t(opt.name, opt.nameZh) + '</button>';
    });
    html += '</div>';
  }
  /* school scope: no sub pills */

  html += '<div style="font-size:12px;color:var(--c-muted);margin-bottom:16px">' + t('Live ranking \xb7 Based on mastery score', '\u5b9e\u65f6\u6392\u540d \xb7 \u57fa\u4e8e\u5355\u8bcd\u638c\u63e1\u7387\u8ba1\u5206') + '</div>';
  html += '<div class="board-list">';

  var medals = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];
  rows.forEach(function(row, i) {
    html += '<div class="board-row' + (row.isMe ? ' me' : '') + '">';
    html += '<div class="board-rank">' + (i < 3 ? medals[i] : (i + 1)) + '</div>';
    html += '<div class="board-name">' + row.emoji + ' ' + escapeHtml(row.name) + (row.isMe ? ' (' + t('you', '\u4f60') + ')' : '') + '</div>';
    html += '<div class="board-score">' + row.score + '</div>';
    html += '<div class="board-streak">' + (row.pct != null ? row.pct + '%' : '') + '</div>';
    html += '</div>';
  });

  html += '</div>';
  panel.innerHTML = html;
}

function switchBoardScope(scope) {
  _boardScope = scope;
  _boardSubKey = null; /* reset sub selection — renderBoard will pick default */
  renderBoard();
}

function switchBoardSub(key) {
  _boardSubKey = key;
  renderBoard();
}

/* ═══ SCORE GUIDE MODAL ═══ */
function showScoreGuide() {
  var cur = getRank();
  var html = '<div class="section-title">\ud83c\udfc6 ' + t('Scoring & Rank Guide', '\u79ef\u5206\u4e0e\u6bb5\u4f4d\u8bf4\u660e') + '</div>';

  /* Section 1 — Star Rating */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\u2b50 ' + t('Star Rating', '\u661f\u7ea7\u8bc4\u5b9a') + '</div>';
  html += '<p style="font-size:13px;color:var(--c-text2);line-height:1.6;text-align:left;margin-bottom:8px">';
  html += t('Each word earns 0\u20134 stars based on correct answers and accuracy:', '\u6bcf\u4e2a\u8bcd\u6c47\u53ef\u83b7\u5f97 0\u20134 \u661f\uff0c\u53d6\u51b3\u4e8e\u7b54\u5bf9\u6b21\u6570\u548c\u6b63\u786e\u7387\uff1a');
  html += '</p>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-primary)"></span><span class="srs-row-label">' + t('Base stars', '\u539f\u59cb\u661f\u7ea7') + '</span><span class="srs-row-desc">' + t('= correct count (max 4)', '= \u7b54\u5bf9\u6b21\u6570\uff08\u4e0a\u9650 4\uff09') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-danger)"></span><span class="srs-row-label">' + t('Accuracy < 50%', '\u6b63\u786e\u7387 < 50%') + '</span><span class="srs-row-desc">' + t('capped at 2 stars', '\u6700\u9ad8 2 \u661f') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-warning)"></span><span class="srs-row-label">' + t('Accuracy 50\u201360%', '\u6b63\u786e\u7387 50\u201360%') + '</span><span class="srs-row-desc">' + t('capped at 3 stars', '\u6700\u9ad8 3 \u661f') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-success)"></span><span class="srs-row-label">' + t('Accuracy \u2265 60%', '\u6b63\u786e\u7387 \u2265 60%') + '</span><span class="srs-row-desc">' + t('unlock 4 stars', '\u53ef\u89e3\u9501 4 \u661f') + '</span></div>';
  html += '</div>';

  /* Section 2 — Score Calculation */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\ud83d\udcca ' + t('Score Calculation', '\u79ef\u5206\u8ba1\u7b97') + '</div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-primary)"></span><span class="srs-row-label">' + t('Learning %', '\u5b66\u4e60\u8fdb\u5ea6') + '</span><span class="srs-row-desc">' + t('total stars \u00f7 (words \u00d7 4) \u00d7 100%', '\u603b\u661f\u6570 \u00f7 (\u8bcd\u6c47\u6570 \u00d7 4) \u00d7 100%') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-primaryLight)"></span><span class="srs-row-label">' + t('Score', '\u6392\u884c\u699c\u79ef\u5206') + '</span><span class="srs-row-desc">' + t('learning % \u00d7 20 (max 2000)', '\u5b66\u4e60\u8fdb\u5ea6 \u00d7 20\uff08\u6ee1\u5206 2000\uff09') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-success)"></span><span class="srs-row-label">' + t('Mastery %', '\u7cbe\u901a\u7387') + '</span><span class="srs-row-desc">' + t('4\u2605 words \u00f7 total words \u00d7 100%', '4\u2605\u8bcd\u6c47\u6570 \u00f7 \u603b\u8bcd\u6c47\u6570 \u00d7 100%') + '</span></div>';
  html += '</div>';

  /* Section 3 — Rank Thresholds */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">\ud83c\udfc5 ' + t('Rank Thresholds', '\u6bb5\u4f4d\u95e8\u69db') + '</div>';
  RANKS.forEach(function(r) {
    var isCurrent = r.name === cur.name;
    html += '<div class="rank-row' + (isCurrent ? ' current' : '') + '" style="' + (isCurrent ? 'border-color:' + r.color + ';background:' + r.color + '15' : '') + '">';
    html += '<div class="rank-row-emoji">' + r.emoji + '</div>';
    html += '<div class="rank-row-info">';
    html += '<div class="rank-row-name" style="color:' + r.color + '">' + rankName(r) + '</div>';
    html += '<div class="rank-row-req">' + t('Mastery \u2265 ' + r.min + '%', '\u7cbe\u901a\u7387 \u2265 ' + r.min + '%') + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span class="rank-row-badge">' + t('Current', '\u5f53\u524d') + '</span>';
    html += '</div>';
  });
  html += '</div>';

  /* Section 4 — Tips */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-title">\ud83d\udca1 ' + t('Tips', '\u5c0f\u8d34\u58eb') + '</div>';
  html += '<div class="guide-tip-item">' + t('Practice across multiple modes to boost correct count', '\u591a\u6a21\u5f0f\u7ec3\u4e60\u63d0\u5347\u7b54\u5bf9\u6b21\u6570') + '</div>';
  html += '<div class="guide-tip-item">' + t('Keep accuracy \u2265 60% to unlock 4 stars', '\u4fdd\u6301\u6b63\u786e\u7387 \u2265 60% \u89e3\u9501 4 \u661f') + '</div>';
  html += '<div class="guide-tip-item">' + t('Mastery % determines your rank progression', '\u7cbe\u901a\u7387\u51b3\u5b9a\u6bb5\u4f4d\u664b\u5347') + '</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()" style="margin-top:16px">' + t('Close', '\u5173\u95ed') + '</button>';
  showModal(html);
}
