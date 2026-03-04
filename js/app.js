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
        await syncFromCloud();

        /* Reload custom levels after cloud sync */
        var customAfterSync = getCustomLevels();
        if (customAfterSync.length > custom.length) {
          LEVELS = LEVELS.slice(0, LEVELS.length - custom.length).concat(customAfterSync);
        }

        afterLogin();

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
async function renderBoard() {
  var panel = E('panel-board');
  var boardOpt = getUserBoardOption();
  var boardTag = boardOpt ? ' <span style="font-size:12px;color:var(--c-primary);background:var(--c-primary-bg);padding:2px 8px;border-radius:10px;font-weight:700;vertical-align:middle">' + boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh) + '</span>' : '';
  panel.innerHTML = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + boardTag + '</div>' +
    '<div style="text-align:center;color:var(--c-muted);padding:40px 0">' + t('Loading...', '\u52a0\u8f7d\u4e2d...') + '</div>';

  var rows = [];
  var userId = currentUser ? currentUser.id : null;

  /* Fetch cloud leaderboard */
  if (sb && currentUser && currentUser.id !== 'local') {
    try {
      var qry = sb.from('leaderboard')
        .select('user_id,nickname,score,mastery_pct,rank_emoji,mastered_words,total_words');
      if (userBoard) qry = qry.eq('board', userBoard);
      var res = await qry.order('score', { ascending: false })
        .limit(20);
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

  /* Ensure current user is in the list (they may not have synced yet) */
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

  var html = '<div class="section-title">\ud83c\udfc6 ' + t('Leaderboard', '\u6392\u884c\u699c') + boardTag + '</div>';
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
