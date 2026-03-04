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
    showToast('请先登录');
    return;
  }
  var nick = currentUser.nickname || '';
  var emailPrefix = currentUser.email.split('@')[0];
  var html = '<div class="settings-section">' +
    '<div class="section-title">⚙ 账号设置</div>' +
    '<label class="settings-label">昵称</label>' +
    '<input class="auth-input" id="settings-nick" type="text" value="' + nick.replace(/"/g, '&quot;') + '" placeholder="' + emailPrefix + '" maxlength="20">' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">修改密码</label>' +
    '<input class="auth-input" id="settings-pw1" type="password" placeholder="新密码 (至少6位，留空不改)">' +
    '<input class="auth-input" id="settings-pw2" type="password" placeholder="确认新密码">' +
    '</div>' +
    '<div class="settings-msg" id="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
    '<button class="btn btn-primary" style="flex:1" onclick="saveSettings()">保存</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">取消</button>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<button class="btn btn-ghost btn-block" onclick="showMembershipInfo()" style="margin-top:4px">⭐ 会员升级</button>';
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
      msgEl.textContent = '昵称保存失败: ' + res.error.message;
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
      msgEl.textContent = '密码至少6位';
      msgEl.className = 'settings-msg error';
      return;
    }
    if (pw1 !== pw2) {
      msgEl.textContent = '两次密码不一致';
      msgEl.className = 'settings-msg error';
      return;
    }
    var res2 = await sb.auth.updateUser({ password: pw1 });
    if (res2.error) {
      msgEl.textContent = '密码修改失败: ' + translateAuthError(res2.error.message);
      msgEl.className = 'settings-msg error';
      return;
    }
    updated = true;
  }

  if (updated) {
    showToast('保存成功');
    hideModal();
  } else {
    hideModal();
  }
}

/* ═══ MEMBERSHIP INFO ═══ */
function showMembershipInfo() {
  var html = '<div class="section-title">⭐ 会员路线</div>' +
    '<table class="membership-table">' +
    '<thead><tr><th>等级</th><th>功能</th><th>状态</th></tr></thead>' +
    '<tbody>' +
    '<tr class="current"><td>免费版</td><td>3 个代数词组 · 7 种学习模式<br>云端同步 · 艾宾浩斯复习</td><td><span class="membership-badge current">当前</span></td></tr>' +
    '<tr><td>Pro</td><td>全部 CIE 0580 词组 (~40 组 317 词)<br>每日挑战 · 学习数据统计</td><td><span class="membership-badge soon">即将推出</span></td></tr>' +
    '<tr><td>Premium</td><td>Edexcel 4MA1 + IB 词组<br>自定义词库分享 · 离线模式</td><td><span class="membership-badge plan">规划中</span></td></tr>' +
    '</tbody></table>' +
    '<div style="font-size:12px;color:var(--c-muted);margin-top:16px">敬请期待 · 更多功能持续开发中</div>' +
    '<button class="btn btn-ghost btn-block" onclick="showSettings()" style="margin-top:12px">← 返回设置</button>';
  showModal(html);
}

/* ═══ RANK GUIDE MODAL ═══ */
function showRankGuide() {
  var pct = getMasteryPct();
  var total = getAllWords().length;
  var mastered = getAllWords().filter(function(w) { return w.status === 'mastered'; }).length;
  var cur = getRank();
  var next = getNextRank();

  var html = '<div class="section-title">\ud83c\udfc5 \u6bb5\u4f4d\u8fdb\u5316\u8def\u7ebf</div>';

  /* Rank rows */
  RANKS.forEach(function(r) {
    var needed = Math.ceil(r.min / 100 * total);
    var isCurrent = r.name === cur.name;
    html += '<div class="rank-row' + (isCurrent ? ' current' : '') + '" style="' + (isCurrent ? 'border-color:' + r.color + ';background:' + r.color + '15' : '') + '">';
    html += '<div class="rank-row-emoji">' + r.emoji + '</div>';
    html += '<div class="rank-row-info">';
    html += '<div class="rank-row-name" style="color:' + r.color + '">' + r.name + '</div>';
    html += '<div class="rank-row-req">\u638c\u63e1 \u2265' + r.min + '% \u8bcd\u6c47' + (total > 0 ? '\uff08\u7ea6 ' + needed + ' \u8bcd\uff09' : '') + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span class="rank-row-badge">\u5f53\u524d</span>';
    html += '</div>';
  });

  /* Progress to next rank */
  if (next) {
    var nextNeeded = Math.ceil(next.min / 100 * total);
    var remaining = Math.max(nextNeeded - mastered, 0);
    var progressPct = total > 0 ? Math.min(Math.round(mastered / nextNeeded * 100), 100) : 0;
    html += '<div class="rank-progress-section">';
    html += '<div class="rank-progress-label">\u8ddd ' + next.emoji + ' ' + next.name + ' \u8fd8\u9700\u638c\u63e1 <strong>' + remaining + '</strong> \u8bcd</div>';
    html += '<div class="rank-progress-bar"><div class="rank-progress-fill" style="width:' + progressPct + '%;background:' + next.color + '"></div></div>';
    html += '<div class="rank-progress-pct">' + pct + '% \u2192 ' + next.min + '%</div>';
    html += '</div>';
  } else {
    html += '<div class="rank-progress-section text-center" style="color:var(--c-success)">\u5df2\u8fbe\u6700\u9ad8\u6bb5\u4f4d \ud83c\udf89</div>';
  }

  /* Tips */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-title">\u5982\u4f55\u5347\u7ea7\uff1f</div>';
  html += '<div class="guide-tip-item">1. \u901a\u8fc7 7 \u79cd\u5b66\u4e60\u6a21\u5f0f\u7ec3\u4e60\u8bcd\u6c47</div>';
  html += '<div class="guide-tip-item">2. \u590d\u4e60\u65f6\u8bc4\u4e3a\u201c\u641e\u5b9a\u4e86\u201d\u5c06\u8bcd\u6c47\u6807\u8bb0\u4e3a\u5df2\u638c\u63e1</div>';
  html += '<div class="guide-tip-item">3. \u638c\u63e1\u7387\u63d0\u5347 \u2192 \u81ea\u52a8\u664b\u5347\u6bb5\u4f4d</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()" style="margin-top:16px">\u5173\u95ed</button>';
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
