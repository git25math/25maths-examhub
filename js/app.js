/* ══════════════════════════════════════════════════════════════
   app.js — Application entry point: init + URL parameter handling
   ══════════════════════════════════════════════════════════════ */

(async function initApp() {
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
        return;
      }
    } catch (e) {
      /* Supabase error — fall through to auth screen */
    }
  }

  /* No session — show auth screen */
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
})();

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

  /* Guest users cannot access leaderboard */
  if (currentUser && currentUser.id === 'local') {
    panel.innerHTML = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + '</div>' +
      '<div class="board-locked-msg">' +
      '<div style="font-size:48px;margin-bottom:12px">\ud83d\udd12</div>' +
      '<div style="font-size:16px;font-weight:600;margin-bottom:8px">' + t('Members Only', '\u4ec5\u5bf9\u6ce8\u518c\u4f1a\u5458\u5f00\u653e') + '</div>' +
      '<p style="color:var(--c-text2);font-size:14px;margin-bottom:16px">' + t('Login or register to view the leaderboard and compete with others.', '\u767b\u5f55\u6216\u6ce8\u518c\u5373\u53ef\u67e5\u770b\u6392\u884c\u699c\u5e76\u4e0e\u4ed6\u4eba\u7ade\u4e89\u3002') + '</p>' +
      '<button class="btn btn-primary" onclick="doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>' +
      '</div>';
    return;
  }

  panel.innerHTML = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + '</div>' +
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
  if (sb && currentUser && currentUser.id !== 'local') {
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

  /* If no cloud data or guest, show local user only */
  if (rows.length === 0) {
    var userName = currentUser ? (currentUser.email === 'guest' ? t('Guest', '\u8bbf\u5ba2') : (currentUser.nickname || currentUser.email.split('@')[0])) : t('You', '\u4f60');
    var userRank = getRank();
    var pct = getMasteryPct();
    rows.push({ name: userName, emoji: userRank.emoji, score: pct * 20, pct: pct, isMe: true });
  }

  /* Ensure current user is in the list */
  var hasMe = rows.some(function(r) { return r.isMe; });
  if (!hasMe && currentUser && currentUser.id !== 'local') {
    var myRank = getRank();
    var myPct = getMasteryPct();
    rows.push({
      name: currentUser.nickname || currentUser.email.split('@')[0],
      emoji: myRank.emoji, score: myPct * 20, pct: myPct, isMe: true
    });
    rows.sort(function(a, b) { return b.score - a.score; });
  }

  /* Build HTML */
  var html = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + '</div>';

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
    var boardOpts = userSchoolId ? BOARD_OPTIONS : BOARD_OPTIONS.filter(function(o) { return o.value.indexOf('25m-') !== 0; });
    html += '<div class="board-sub-pills">';
    boardOpts.forEach(function(opt) {
      html += '<button class="board-sub-pill' + (opt.value === _boardSubKey ? ' active' : '') + '" onclick="switchBoardSub(\'' + opt.value + '\')">' + opt.emoji + ' ' + t(opt.name, opt.nameZh) + '</button>';
    });
    html += '</div>';
  } else if (_boardScope === 'class' && classList.length > 0) {
    html += '<div class="board-sub-pills">';
    classList.forEach(function(c) {
      html += '<button class="board-sub-pill' + (c.id === _boardSubKey ? ' active' : '') + '" onclick="switchBoardSub(\'' + c.id + '\')">' + c.name + '</button>';
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
    html += '<div class="board-name">' + row.emoji + ' ' + row.name + (row.isMe ? ' (' + t('you', '\u4f60') + ')' : '') + '</div>';
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
