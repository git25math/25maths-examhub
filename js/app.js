/* ══════════════════════════════════════════════════════════════
   app.js — Application entry point: init + URL parameter handling
   ══════════════════════════════════════════════════════════════ */

(async function initApp() {
  /* Load custom levels from storage */
  var custom = getCustomLevels();
  if (custom.length > 0) {
    LEVELS = LEVELS.concat(custom);
  }

  /* Check for existing Supabase session */
  if (sb) {
    try {
      var sess = await sb.auth.getSession();
      if (sess.data.session) {
        currentUser = {
          email: sess.data.session.user.email,
          id: sess.data.session.user.id
        };
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
function renderBoard() {
  var mockData = [
    { name: 'Alice', emoji: '\ud83d\udc51', score: 2450, streak: 15 },
    { name: 'Bob', emoji: '\ud83d\udc8e', score: 1820, streak: 8 },
    { name: 'Charlie', emoji: '\ud83e\udd47', score: 1560, streak: 12 },
    { name: 'Diana', emoji: '\ud83e\udd48', score: 980, streak: 5 },
    { name: 'Eve', emoji: '\ud83e\udd49', score: 540, streak: 3 }
  ];

  /* Insert current user */
  var userName = currentUser ? (currentUser.email === 'guest' ? '\u8bbf\u5ba2' : currentUser.email.split('@')[0]) : '\u4f60';
  var userRank = getRank();
  var userScore = getMasteryPct() * 20;

  var html = '';
  html += '<div class="section-title">\ud83c\udfc6 \u6392\u884c\u699c</div>';
  html += '<div style="font-size:12px;color:var(--c-muted);margin-bottom:16px">\u793a\u4f8b\u6570\u636e \xb7 \u4e91\u7aef\u6392\u884c\u699c\u5373\u5c06\u4e0a\u7ebf</div>';

  html += '<div class="board-list">';

  var medals = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49', '4', '5', '6', '7'];

  /* Combine mock + user, sort by score */
  var all = mockData.slice();
  all.push({ name: userName, emoji: userRank.emoji, score: userScore, streak: 1, isMe: true });
  all.sort(function(a, b) { return b.score - a.score; });

  all.forEach(function(row, i) {
    html += '<div class="board-row' + (row.isMe ? ' me' : '') + '">';
    html += '<div class="board-rank">' + (i < 3 ? medals[i] : (i + 1)) + '</div>';
    html += '<div class="board-name">' + row.emoji + ' ' + row.name + (row.isMe ? ' (\u4f60)' : '') + '</div>';
    html += '<div class="board-score">' + row.score + '</div>';
    html += '<div class="board-streak">\ud83d\udd25' + row.streak + '\u5929</div>';
    html += '</div>';
  });

  html += '</div>';

  E('panel-board').innerHTML = html;
}
