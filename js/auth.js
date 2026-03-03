/* ══════════════════════════════════════════════════════════════
   auth.js — Login / Register / Guest mode / User bar
   ══════════════════════════════════════════════════════════════ */

/* Login / register button */
E('auth-login').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = '请输入邮箱'; return; }
  if (pass.length < 6) { E('auth-err').textContent = '密码至少6位'; return; }
  if (!sb) { E('auth-err').textContent = 'Supabase 未配置，请先体验'; return; }

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error && res.error.message.indexOf('Invalid') >= 0) {
      /* Sign-in failed — try sign-up */
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
    E('auth-err').textContent = '网络错误';
  }
});

/* Guest mode */
E('auth-skip').addEventListener('click', function() {
  currentUser = { email: 'guest', id: 'local' };
  afterLogin();
});

/* Logout */
E('ub-logout').addEventListener('click', function() {
  if (sb) sb.auth.signOut();
  currentUser = null;
  E('user-bar').classList.remove('vis');
  showOv('ov-auth');
});

/* Post-login setup */
function afterLogin() {
  updateUserBar();
  showMenu();
}

/* Update user bar display */
function updateUserBar() {
  if (!currentUser) return;
  var r = getRank();
  E('ub-rank').textContent = r.emoji;
  E('ub-name').textContent = currentUser.email === 'guest' ? '访客模式' : currentUser.email.split('@')[0];
  E('ub-rlabel').textContent = r.name + ' \xb7 ' + getMasteryPct() + '%';
  E('user-bar').classList.add('vis');
}
