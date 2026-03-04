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

      currentUser = { email: email, id: res2.data.user.id, nickname: '' };
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
      var meta = res.data.user.user_metadata || {};
      currentUser = { email: email, id: res.data.user.id, nickname: meta.nickname || '' };
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

/* ═══ SETTINGS MODAL ═══ */
function showSettings() {
  if (!currentUser || currentUser.id === 'local') {
    showToast(t('Please login first', '\u8bf7\u5148\u767b\u5f55'));
    return;
  }
  var nick = currentUser.nickname || '';
  var emailPrefix = currentUser.email.split('@')[0];
  var html = '<div class="settings-section">' +
    '<div class="section-title">' + t('\u2699 Account Settings', '\u2699 \u8d26\u53f7\u8bbe\u7f6e') + '</div>' +
    '<label class="settings-label">' + t('Nickname', '\u6635\u79f0') + '</label>' +
    '<input class="auth-input" id="settings-nick" type="text" value="' + nick.replace(/"/g, '&quot;') + '" placeholder="' + emailPrefix + '" maxlength="20">' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">' + t('Change Password', '\u4fee\u6539\u5bc6\u7801') + '</label>' +
    '<input class="auth-input" id="settings-pw1" type="password" placeholder="' + t('New password (min 6 chars, leave blank to skip)', '\u65b0\u5bc6\u7801 (\u81f3\u5c116\u4f4d\uff0c\u7559\u7a7a\u4e0d\u6539)') + '">' +
    '<input class="auth-input" id="settings-pw2" type="password" placeholder="' + t('Confirm new password', '\u786e\u8ba4\u65b0\u5bc6\u7801') + '">' +
    '</div>' +
    '<div class="settings-msg" id="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
    '<button class="btn btn-primary" style="flex:1" onclick="saveSettings()">' + t('Save', '\u4fdd\u5b58') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '\u53d6\u6d88') + '</button>' +
    '</div>' +
    '';
  showModal(html);
}

async function saveSettings() {
  var msgEl = E('settings-msg');
  var nick = E('settings-nick').value.trim();
  var pw1 = E('settings-pw1').value;
  var pw2 = E('settings-pw2').value;
  msgEl.textContent = '';
  msgEl.className = 'settings-msg';

  var updated = false;

  /* Nickname update */
  if (nick !== (currentUser.nickname || '')) {
    var res = await sb.auth.updateUser({ data: { nickname: nick } });
    if (res.error) {
      msgEl.textContent = t('Nickname save failed: ', '\u6635\u79f0\u4fdd\u5b58\u5931\u8d25: ') + res.error.message;
      msgEl.className = 'settings-msg error';
      return;
    }
    currentUser.nickname = nick;
    updateSidebar();
    updated = true;
  }

  /* Password update */
  if (pw1 || pw2) {
    if (pw1.length < 6) {
      msgEl.textContent = t('Password must be at least 6 characters', '\u5bc6\u7801\u81f3\u5c116\u4f4d');
      msgEl.className = 'settings-msg error';
      return;
    }
    if (pw1 !== pw2) {
      msgEl.textContent = t('Passwords do not match', '\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4');
      msgEl.className = 'settings-msg error';
      return;
    }
    var res2 = await sb.auth.updateUser({ password: pw1 });
    if (res2.error) {
      msgEl.textContent = t('Password change failed: ', '\u5bc6\u7801\u4fee\u6539\u5931\u8d25: ') + translateAuthError(res2.error.message);
      msgEl.className = 'settings-msg error';
      return;
    }
    updated = true;
  }

  if (updated) {
    showToast(t('Saved', '\u4fdd\u5b58\u6210\u529f'));
    hideModal();
  } else {
    hideModal();
  }
}

/* ═══ RANK GUIDE MODAL ═══ */
function showRankGuide() {
  var pct = getMasteryPct();
  var total = getAllWords().length;
  var mastered = getAllWords().filter(function(w) { return w.status === 'mastered'; }).length;
  var cur = getRank();
  var next = getNextRank();

  var html = '<div class="section-title">\ud83c\udfc5 ' + t('Rank Progress', '\u6bb5\u4f4d\u8fdb\u5316\u8def\u7ebf') + '</div>';

  /* Rank rows */
  RANKS.forEach(function(r) {
    var needed = Math.ceil(r.min / 100 * total);
    var isCurrent = r.name === cur.name;
    html += '<div class="rank-row' + (isCurrent ? ' current' : '') + '" style="' + (isCurrent ? 'border-color:' + r.color + ';background:' + r.color + '15' : '') + '">';
    html += '<div class="rank-row-emoji">' + r.emoji + '</div>';
    html += '<div class="rank-row-info">';
    html += '<div class="rank-row-name" style="color:' + r.color + '">' + rankName(r) + '</div>';
    html += '<div class="rank-row-req">' + t('Master \u2265' + r.min + '% vocab' + (total > 0 ? ' (approx. ' + needed + ' words)' : ''), '\u638c\u63e1 \u2265' + r.min + '% \u8bcd\u6c47' + (total > 0 ? '\uff08\u7ea6 ' + needed + ' \u8bcd\uff09' : '')) + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span class="rank-row-badge">' + t('Current', '\u5f53\u524d') + '</span>';
    html += '</div>';
  });

  /* Progress to next rank */
  if (next) {
    var nextNeeded = Math.ceil(next.min / 100 * total);
    var remaining = Math.max(nextNeeded - mastered, 0);
    var progressPct = total > 0 ? Math.min(Math.round(mastered / nextNeeded * 100), 100) : 0;
    html += '<div class="rank-progress-section">';
    html += '<div class="rank-progress-label">' + t('<strong>' + remaining + '</strong> more words to reach ' + next.emoji + ' ' + rankName(next), '\u8ddd ' + next.emoji + ' ' + rankName(next) + ' \u8fd8\u9700\u638c\u63e1 <strong>' + remaining + '</strong> \u8bcd') + '</div>';
    html += '<div class="rank-progress-bar"><div class="rank-progress-fill" style="width:' + progressPct + '%;background:' + next.color + '"></div></div>';
    html += '<div class="rank-progress-pct">' + pct + '% \u2192 ' + next.min + '%</div>';
    html += '</div>';
  } else {
    html += '<div class="rank-progress-section text-center" style="color:var(--c-success)">' + t('Highest rank achieved!', '\u5df2\u8fbe\u6700\u9ad8\u6bb5\u4f4d') + ' \ud83c\udf89</div>';
  }

  /* Tips */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-title">' + t('How to rank up?', '\u5982\u4f55\u5347\u7ea7\uff1f') + '</div>';
  html += '<div class="guide-tip-item">' + t('1. Practice vocabulary with 7 study modes', '1. \u901a\u8fc7 7 \u79cd\u5b66\u4e60\u6a21\u5f0f\u7ec3\u4e60\u8bcd\u6c47') + '</div>';
  html += '<div class="guide-tip-item">' + t('2. Rate "Got it" in review to mark as mastered', '2. \u590d\u4e60\u65f6\u8bc4\u4e3a\u201c\u641e\u5b9a\u4e86\u201d\u5c06\u8bcd\u6c47\u6807\u8bb0\u4e3a\u5df2\u638c\u63e1') + '</div>';
  html += '<div class="guide-tip-item">' + t('3. Higher mastery % = auto rank up', '3. \u638c\u63e1\u7387\u63d0\u5347 \u2192 \u81ea\u52a8\u664b\u5347\u6bb5\u4f4d') + '</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()" style="margin-top:16px">' + t('Close', '\u5173\u95ed') + '</button>';
  showModal(html);
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
