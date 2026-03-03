/* ══════════════════════════════════════════════════════════════
   auth.js — Login / Register / Guest mode
   Cross-site compatible: accounts shared with 25maths.com
   ══════════════════════════════════════════════════════════════ */

/* Current site origin for redirect */
var AUTH_REDIRECT = window.location.origin + '/';

/* Login / register button */
E('auth-login').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  var btn = E('auth-login');
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = '\u8bf7\u8f93\u5165\u90ae\u7bb1'; return; }
  if (pass.length < 6) { E('auth-err').textContent = '\u5bc6\u7801\u81f3\u5c116\u4f4d'; return; }
  if (!sb) { E('auth-err').textContent = 'Supabase \u672a\u914d\u7f6e\uff0c\u8bf7\u5148\u4f53\u9a8c'; return; }

  /* Loading state */
  btn.disabled = true;
  btn.textContent = '\u767b\u5f55\u4e2d...';

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error && res.error.message.indexOf('Invalid') >= 0) {
      /* Sign-in failed — try sign-up with redirect back to THIS site */
      var res2 = await sb.auth.signUp({
        email: email,
        password: pass,
        options: { emailRedirectTo: AUTH_REDIRECT }
      });
      if (res2.error) {
        E('auth-err').textContent = translateAuthError(res2.error.message);
        btn.disabled = false;
        btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
        return;
      }

      /* Check if email confirmation is required */
      if (res2.data.user && !res2.data.session) {
        E('auth-err').textContent = '';
        showToast('\u786e\u8ba4\u90ae\u4ef6\u5df2\u53d1\u9001\uff0c\u8bf7\u67e5\u6536\u90ae\u7bb1\u540e\u70b9\u51fb\u94fe\u63a5\u5b8c\u6210\u6ce8\u518c');
        btn.disabled = false;
        btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
        return;
      }

      currentUser = { email: email, id: res2.data.user.id };
    } else if (res.error && res.error.message.indexOf('Email not confirmed') >= 0) {
      /* Already registered but not verified — resend confirmation with correct redirect */
      btn.textContent = '\u53d1\u9001\u4e2d...';
      try {
        var resend = await sb.auth.resend({
          type: 'signup',
          email: email,
          options: { emailRedirectTo: AUTH_REDIRECT }
        });
        if (resend.error) {
          E('auth-err').textContent = translateAuthError(resend.error.message);
        } else {
          E('auth-err').textContent = '';
          showToast('\u9a8c\u8bc1\u90ae\u4ef6\u5df2\u91cd\u65b0\u53d1\u9001\uff0c\u8bf7\u67e5\u6536\u90ae\u7bb1');
        }
      } catch (e2) {
        E('auth-err').textContent = '\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5';
      }
      btn.disabled = false;
      btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
      return;
    } else if (res.error) {
      E('auth-err').textContent = translateAuthError(res.error.message);
      btn.disabled = false;
      btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
      return;
    } else {
      currentUser = { email: email, id: res.data.user.id };
    }

    btn.disabled = false;
    btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
    afterLogin();
  } catch (e) {
    E('auth-err').textContent = '\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5';
    btn.disabled = false;
    btn.textContent = '\u767b\u5f55 / \u6ce8\u518c';
  }
});

/* Guest mode */
E('auth-skip').addEventListener('click', function() {
  currentUser = { email: 'guest', id: 'local' };
  afterLogin();
});

/* Logout — await signOut + final sync */
async function doLogout() {
  if (sb && currentUser && currentUser.id !== 'local') {
    await syncToCloud();
    await sb.auth.signOut();
  }
  currentUser = null;
  E('app-shell').style.display = 'none';
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
}

E('btn-logout-sb').addEventListener('click', function() { doLogout(); });
E('btn-logout-hb').addEventListener('click', function() { doLogout(); });

/* Post-login setup */
function afterLogin() {
  showApp();
}

/* Translate common Supabase auth error messages to Chinese */
function translateAuthError(msg) {
  if (!msg) return '\u672a\u77e5\u9519\u8bef';
  if (msg.indexOf('Invalid login') >= 0) return '\u90ae\u7bb1\u6216\u5bc6\u7801\u9519\u8bef';
  if (msg.indexOf('Email not confirmed') >= 0) return '\u90ae\u7bb1\u672a\u9a8c\u8bc1\uff0c\u8bf7\u67e5\u6536\u786e\u8ba4\u90ae\u4ef6';
  if (msg.indexOf('User already registered') >= 0) return '\u8be5\u90ae\u7bb1\u5df2\u6ce8\u518c\uff0c\u8bf7\u76f4\u63a5\u767b\u5f55';
  if (msg.indexOf('rate') >= 0 || msg.indexOf('limit') >= 0) return '\u64cd\u4f5c\u592a\u9891\u7e41\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5';
  if (msg.indexOf('network') >= 0 || msg.indexOf('fetch') >= 0) return '\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u68c0\u67e5\u8fde\u63a5';
  return msg;
}

/* ═══ CALLBACK TOKEN RECOVERY ═══
   When Supabase redirects back after email confirmation,
   URL may contain auth tokens. Recover session from them.
*/
async function recoverSessionFromUrl() {
  if (!sb) return false;

  var query = new URLSearchParams(window.location.search || '');
  var hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));

  /* Check for error in callback */
  var cbError = (query.get('error') || hash.get('error') || '').trim();
  if (cbError) {
    var desc = decodeURIComponent((query.get('error_description') || hash.get('error_description') || '').replace(/\+/g, ' ')).trim();
    showToast('\u767b\u5f55\u56de\u8c03\u5931\u8d25: ' + (desc || cbError));
    stripAuthParams();
    return false;
  }

  /* Try access_token + refresh_token (implicit flow) */
  var accessToken = (hash.get('access_token') || query.get('access_token') || '').trim();
  var refreshToken = (hash.get('refresh_token') || query.get('refresh_token') || '').trim();
  if (accessToken && refreshToken) {
    var res = await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (!res.error && res.data && res.data.session) {
      stripAuthParams();
      return true;
    }
  }

  /* Try PKCE code exchange */
  var code = (query.get('code') || '').trim();
  if (code && typeof sb.auth.exchangeCodeForSession === 'function') {
    var res2 = await sb.auth.exchangeCodeForSession(code);
    if (!res2.error && res2.data && res2.data.session) {
      stripAuthParams();
      return true;
    }
  }

  /* Try OTP token_hash (magic link / email confirmation) */
  var tokenHash = (query.get('token_hash') || '').trim();
  if (tokenHash && typeof sb.auth.verifyOtp === 'function') {
    var otpType = (query.get('type') || 'signup').trim();
    var email = (query.get('email') || '').trim();
    var payload = { token_hash: tokenHash, type: otpType };
    if (email) payload.email = email;
    var res3 = await sb.auth.verifyOtp(payload);
    if (!res3.error && res3.data && res3.data.session) {
      stripAuthParams();
      return true;
    }
  }

  /* If we saw callback params but couldn't create session */
  if (code || tokenHash || accessToken) {
    showToast('\u767b\u5f55\u94fe\u63a5\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
    stripAuthParams();
  }

  return false;
}

/* Clean auth callback parameters from URL */
function stripAuthParams() {
  var url = new URL(window.location.href);
  var keys = ['code', 'token_hash', 'type', 'email', 'error', 'error_code', 'error_description', 'access_token', 'refresh_token'];
  var changed = false;
  keys.forEach(function(k) {
    if (url.searchParams.has(k)) { url.searchParams.delete(k); changed = true; }
  });
  if (changed || window.location.hash) {
    var q = url.searchParams.toString();
    var next = url.pathname + (q ? '?' + q : '');
    window.history.replaceState({}, '', next);
  }
}
