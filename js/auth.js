/* ══════════════════════════════════════════════════════════════
   auth.js — Login / Register / Guest mode
   ══════════════════════════════════════════════════════════════ */

/* Login / register button */
E('auth-login').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = '\u8bf7\u8f93\u5165\u90ae\u7bb1'; return; }
  if (pass.length < 6) { E('auth-err').textContent = '\u5bc6\u7801\u81f3\u5c116\u4f4d'; return; }
  if (!sb) { E('auth-err').textContent = 'Supabase \u672a\u914d\u7f6e\uff0c\u8bf7\u5148\u4f53\u9a8c'; return; }

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error && res.error.message.indexOf('Invalid') >= 0) {
      var res2 = await sb.auth.signUp({ email: email, password: pass });
      if (res2.error) { E('auth-err').textContent = res2.error.message; return; }
      currentUser = { email: email, id: res2.data.user.id };
    } else if (res.error) {
      E('auth-err').textContent = res.error.message;
      return;
    } else {
      currentUser = { email: email, id: res.data.user.id };
    }
    afterLogin();
  } catch (e) {
    E('auth-err').textContent = '\u7f51\u7edc\u9519\u8bef';
  }
});

/* Guest mode */
E('auth-skip').addEventListener('click', function() {
  currentUser = { email: 'guest', id: 'local' };
  afterLogin();
});

/* Logout handlers */
function doLogout() {
  if (sb) sb.auth.signOut();
  currentUser = null;
  E('app-shell').style.display = 'none';
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
}

E('btn-logout-sb').addEventListener('click', doLogout);
E('btn-logout-hb').addEventListener('click', doLogout);

/* Post-login setup */
function afterLogin() {
  showApp();
}
