/* ══════════════════════════════════════════════════════════════
   auth.js — Login / Register / Guest mode
   Cross-site compatible: accounts shared with 25maths.com
   ══════════════════════════════════════════════════════════════ */

/* ═══ CLIENT-SIDE RATE LIMITING ═══ */
var AUTH_COOLDOWN_MS = 3000;    // Min interval between attempts
var AUTH_MAX_ATTEMPTS = 5;      // Lock after N failures
var AUTH_LOCKOUT_MS = 60000;    // Lockout duration (60s)
var authAttempts = 0;
var authLastAttempt = 0;
var authLockUntil = 0;

function checkAuthThrottle() {
  var now = Date.now();
  /* Locked out? */
  if (now < authLockUntil) {
    var secs = Math.ceil((authLockUntil - now) / 1000);
    E('auth-err').textContent = '请 ' + secs + 's 后重试';
    return false;
  }
  /* Cooldown between attempts */
  if (now - authLastAttempt < AUTH_COOLDOWN_MS) {
    E('auth-err').textContent = '操作太快，请稍后';
    return false;
  }
  authLastAttempt = now;
  return true;
}

function authFail() {
  authAttempts++;
  if (authAttempts >= AUTH_MAX_ATTEMPTS) {
    authLockUntil = Date.now() + AUTH_LOCKOUT_MS;
    authAttempts = 0;
    var secs = Math.ceil(AUTH_LOCKOUT_MS / 1000);
    E('auth-err').textContent = '尝试次数过多，请 ' + secs + 's 后重试';
  }
}

function authSuccess() {
  authAttempts = 0;
  authLockUntil = 0;
}

/* Login / register button */
E('auth-login').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  var btn = E('auth-login');
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = '请输入邮箱'; return; }
  if (pass.length < 6) { E('auth-err').textContent = '密码至少6位'; return; }
  if (!sb) { E('auth-err').textContent = 'Supabase 未配置，请先体验'; return; }

  /* Throttle check */
  if (!checkAuthThrottle()) return;

  /* Loading state */
  btn.disabled = true;
  btn.textContent = '登录中...';

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error && res.error.message.indexOf('Invalid') >= 0) {
      /* Sign-in failed — try sign-up (no email verification) */
      var res2 = await sb.auth.signUp({ email: email, password: pass });
      if (res2.error) {
        authFail();
        E('auth-err').textContent = translateAuthError(res2.error.message);
        btn.disabled = false;
        btn.textContent = '登录 / 注册';
        return;
      }

      /* Sign-up succeeded — check if session exists (Confirm email OFF) */
      if (res2.data.session) {
        currentUser = { email: email, id: res2.data.user.id, nickname: '' };
        /* New user — no board yet, will be prompted */
      } else {
        /* Dashboard still has Confirm email ON — tell user to login */
        E('auth-err').textContent = '';
        showToast('注册成功，请直接登录');
        btn.disabled = false;
        btn.textContent = '登录 / 注册';
        return;
      }
    } else if (res.error) {
      authFail();
      /* Rate limit → immediate lockout */
      if (res.error.message.indexOf('rate') >= 0 || res.error.message.indexOf('limit') >= 0) {
        authLockUntil = Date.now() + AUTH_LOCKOUT_MS;
        authAttempts = 0;
      }
      E('auth-err').textContent = translateAuthError(res.error.message);
      btn.disabled = false;
      btn.textContent = '登录 / 注册';
      return;
    } else {
      var meta = res.data.user.user_metadata || {};
      currentUser = { email: email, id: res.data.user.id, nickname: meta.nickname || '' };
      if (meta.board) userBoard = meta.board;
    }

    authSuccess();
    btn.disabled = false;
    btn.textContent = '登录 / 注册';
    afterLogin();
  } catch (e) {
    authFail();
    E('auth-err').textContent = '网络错误，请稍后重试';
    btn.disabled = false;
    btn.textContent = '登录 / 注册';
  }
});

/* Guest mode */
E('auth-skip').addEventListener('click', function() {
  currentUser = { email: 'guest', id: 'local' };
  /* Restore board from localStorage for guest */
  var guestBoard = null;
  try { guestBoard = localStorage.getItem('userBoard'); } catch (e) {}
  if (guestBoard) userBoard = guestBoard;
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
async function afterLogin() {
  /* Role detection from user_metadata */
  if (sb && currentUser && currentUser.id !== 'local') {
    var sess = await sb.auth.getSession();
    var meta = sess.data.session ? sess.data.session.user.user_metadata : {};
    if (meta.role === 'student') {
      /* Student: auto-set board from metadata, skip board selection */
      if (meta.board) userBoard = meta.board;
      try { localStorage.setItem('userBoard', userBoard || ''); } catch (e) {}
    }
    if (meta.role === 'teacher') {
      /* Teacher: init admin panel after app shows */
      if (!userBoard) userBoard = 'all';
      try { localStorage.setItem('userBoard', userBoard); } catch (e) {}
    }
  }

  if (!userBoard) {
    showBoardSelection();
  } else {
    showApp();
    /* Init teacher panel after app shell is visible */
    if (sb && currentUser && currentUser.id !== 'local') {
      initTeacher();
    }
  }
}

/* ═══ BOARD SELECTION ═══ */
function showBoardSelection() {
  E('ov-auth').classList.remove('vis');
  E('ov-auth').style.display = 'none';
  E('board-sel-title').textContent = t('Choose Your Course', '\u9009\u62e9\u4f60\u7684\u8bfe\u7a0b');
  E('board-sel-sub').textContent = t('You will only see vocabulary for your course. Change anytime in settings.', '\u9009\u8bfe\u540e\u53ea\u663e\u793a\u5bf9\u5e94\u6a21\u5757\u7684\u8bcd\u6c47\uff0c\u53ef\u5728\u8bbe\u7f6e\u4e2d\u66f4\u6362');
  var html = '<div class="board-sel-grid">';
  BOARD_OPTIONS.forEach(function(opt) {
    html += '<button class="board-sel-btn" onclick="selectBoard(\'' + opt.value + '\')">';
    html += '<span class="board-sel-emoji">' + opt.emoji + '</span>';
    html += '<span class="board-sel-name">' + t(opt.name, opt.nameZh) + '</span>';
    html += '</button>';
  });
  html += '</div>';
  E('board-sel-list').innerHTML = html;
  E('ov-board').style.display = 'flex';
  E('ov-board').classList.add('vis');
}

function hideBoardSelection() {
  E('ov-board').classList.remove('vis');
  E('ov-board').style.display = 'none';
}

async function selectBoard(value) {
  userBoard = value;
  /* Persist to localStorage (guest support) */
  try { localStorage.setItem('userBoard', value); } catch (e) {}
  /* Save to user_metadata if logged in */
  if (sb && currentUser && currentUser.id !== 'local') {
    try {
      await sb.auth.updateUser({ data: { board: value } });
    } catch (e) {}
  }
  hideBoardSelection();
  showApp();
  syncToCloud();
}

function changeBoardFromSettings() {
  hideModal();
  E('app-shell').style.display = 'none';
  showBoardSelection();
}

/* Translate common Supabase auth error messages to Chinese */
function translateAuthError(msg) {
  if (!msg) return '未知错误';
  if (msg.indexOf('Invalid login') >= 0) return '邮箱或密码错误';
  if (msg.indexOf('User already registered') >= 0) return '该邮箱已注册，请直接登录';
  if (msg.indexOf('rate') >= 0 || msg.indexOf('limit') >= 0) return '操作太频繁，请稍后重试';
  if (msg.indexOf('network') >= 0 || msg.indexOf('fetch') >= 0) return '网络错误，请检查连接';
  return msg;
}

/* ═══ PASSWORD RESET ═══ */
function showPasswordReset() {
  var prefill = E('auth-email').value.trim();
  var html = '<div class="section-title">' + t('Reset Password', '重置密码') + '</div>' +
    '<p style="font-size:13px;color:var(--c-text2);margin-bottom:12px">' +
    t('Enter your email and we will send a reset link.', '输入注册邮箱，我们将发送重置链接。') + '</p>' +
    '<input class="auth-input" id="reset-email" type="email" placeholder="' + t('Email', '邮箱地址') + '" value="' + (prefill || '').replace(/"/g, '&quot;') + '">' +
    '<div id="reset-msg" style="font-size:13px;margin:8px 0;min-height:20px"></div>' +
    '<div style="display:flex;gap:8px;margin-top:8px">' +
    '<button class="btn btn-primary" style="flex:1" id="reset-send" onclick="sendPasswordReset()">' + t('Send Reset Link', '发送重置链接') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function sendPasswordReset() {
  var email = E('reset-email').value.trim();
  var msg = E('reset-msg');
  var btn = E('reset-send');
  msg.textContent = '';
  if (!email) { msg.style.color = 'var(--c-danger)'; msg.textContent = t('Please enter email', '请输入邮箱'); return; }
  if (!sb) { msg.style.color = 'var(--c-danger)'; msg.textContent = 'Supabase not configured'; return; }
  btn.disabled = true;
  btn.textContent = t('Sending...', '发送中...');
  try {
    var res = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (res.error) {
      msg.style.color = 'var(--c-danger)';
      msg.textContent = translateAuthError(res.error.message);
    } else {
      msg.style.color = 'var(--c-success)';
      msg.textContent = t('Reset link sent, check your email', '重置链接已发送，请查看邮箱');
    }
  } catch (e) {
    msg.style.color = 'var(--c-danger)';
    msg.textContent = t('Network error, try later', '网络错误，请稍后重试');
  }
  btn.disabled = false;
  btn.textContent = t('Send Reset Link', '发送重置链接');
}

/* ═══ SETTINGS MODAL ═══ */
function showSettings() {
  if (!currentUser || currentUser.id === 'local') {
    showToast(t('Please login first', '请先登录'));
    return;
  }
  var nick = currentUser.nickname || '';
  var emailPrefix = currentUser.email.split('@')[0];
  var boardOpt = getUserBoardOption();
  var boardDisplay = boardOpt ? (boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh)) : t('Not selected', '\u672a\u9009\u62e9');

  var html = '<div class="settings-section">' +
    '<div class="section-title">' + t('\u2699 Account Settings', '\u2699 账号设置') + '</div>' +
    '<label class="settings-label">' + t('Nickname', '昵称') + '</label>' +
    '<input class="auth-input" id="settings-nick" type="text" value="' + nick.replace(/"/g, '&quot;') + '" placeholder="' + emailPrefix + '" maxlength="20">' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">' + t('Course / Year', '\u8003\u8bd5\u5c40 / \u5e74\u7ea7') + '</label>' +
    '<div class="settings-board-current">' + boardDisplay + '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="changeBoardFromSettings()">' + t('Change', '\u66f4\u6362') + '</button>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">' + t('Change Password', '修改密码') + '</label>' +
    '<input class="auth-input" id="settings-pw1" type="password" placeholder="' + t('New password (min 6 chars, leave blank to skip)', '新密码 (至少6位，留空不改)') + '">' +
    '<input class="auth-input" id="settings-pw2" type="password" placeholder="' + t('Confirm new password', '确认新密码') + '">' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">' + t('Cloud Sync', '\u4e91\u540c\u6b65') + '</label>' +
    '<div style="font-size:13px;color:var(--c-text2);margin-bottom:8px">' + (function() {
      if (!_lastSyncOkAt) return t('Not synced yet', '\u5c1a\u672a\u540c\u6b65');
      var ago = Math.floor((Date.now() - _lastSyncOkAt) / 60000);
      if (ago < 1) return t('Last sync: just now', '\u4e0a\u6b21\u540c\u6b65\uff1a\u521a\u521a');
      if (ago < 60) return t('Last sync: ' + ago + ' min ago', '\u4e0a\u6b21\u540c\u6b65\uff1a' + ago + ' \u5206\u949f\u524d');
      var hrs = Math.floor(ago / 60);
      return t('Last sync: ' + hrs + 'h ago', '\u4e0a\u6b21\u540c\u6b65\uff1a' + hrs + ' \u5c0f\u65f6\u524d');
    })() + '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="manualSync()">' + t('Sync Now', '\u7acb\u5373\u540c\u6b65') + '</button>' +
    '</div>' +
    '<div class="settings-msg" id="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
    '<button class="btn btn-primary" style="flex:1" onclick="saveSettings()">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
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
      msgEl.textContent = t('Nickname save failed: ', '昵称保存失败: ') + res.error.message;
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
      msgEl.textContent = t('Password must be at least 6 characters', '密码至少6位');
      msgEl.className = 'settings-msg error';
      return;
    }
    if (pw1 !== pw2) {
      msgEl.textContent = t('Passwords do not match', '两次密码不一致');
      msgEl.className = 'settings-msg error';
      return;
    }
    var res2 = await sb.auth.updateUser({ password: pw1 });
    if (res2.error) {
      msgEl.textContent = t('Password change failed: ', '密码修改失败: ') + translateAuthError(res2.error.message);
      msgEl.className = 'settings-msg error';
      return;
    }
    updated = true;
  }

  if (updated) {
    showToast(t('Saved', '保存成功'));
    hideModal();
  } else {
    hideModal();
  }
}

/* ═══ MANUAL SYNC ═══ */
async function manualSync() {
  showToast(t('Syncing...', '\u540c\u6b65\u4e2d...'));
  _syncRetryCount = 0;
  await syncToCloud();
  updateSidebar();
  if (_syncStatus === 'ok') {
    showToast(t('Synced successfully', '\u540c\u6b65\u6210\u529f'));
  } else {
    showToast(t('Sync failed, check network', '\u540c\u6b65\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc'));
  }
  hideModal();
}

/* ═══ TEACHER REGISTRATION ═══ */
function toggleTeacherReg() {
  var el = E('teacher-reg');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

async function doTeacherRegister() {
  var name = E('tr-name').value.trim();
  var email = E('tr-email').value.trim();
  var pass = E('tr-pass').value;
  var code = E('tr-code').value.trim();
  var err = E('tr-err');
  var btn = E('tr-submit');
  err.textContent = '';

  if (!name) { err.textContent = t('Please enter name', '请输入姓名'); return; }
  if (!email) { err.textContent = t('Please enter email', '请输入邮箱'); return; }
  if (pass.length < 6) { err.textContent = t('Password min 6 chars', '密码至少6位'); return; }
  if (!code) { err.textContent = t('Please enter school code', '请输入学校注册码'); return; }

  btn.disabled = true;
  btn.textContent = t('Registering...', '注册中...');

  try {
    var result = await callEdgeFunction('register-teacher', {
      email: email, password: pass, name: name, school_code: code
    });

    if (result.error) {
      err.textContent = result.error;
      btn.disabled = false;
      btn.textContent = '注册教师账号';
      return;
    }

    /* Auto sign in after registration */
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error) {
      err.textContent = t('Registered but login failed, please login manually', '注册成功但自动登录失败，请手动登录');
      btn.disabled = false;
      btn.textContent = '注册教师账号';
      return;
    }

    currentUser = { email: email, id: res.data.user.id, nickname: name };
    userBoard = 'all';
    try { localStorage.setItem('userBoard', 'all'); } catch (e) {}
    btn.disabled = false;
    btn.textContent = '注册教师账号';
    afterLogin();
  } catch (e) {
    err.textContent = t('Network error', '网络错误');
    btn.disabled = false;
    btn.textContent = '注册教师账号';
  }
}

/* ═══ RANK GUIDE MODAL ═══ */
function showRankGuide() {
  var pct = getMasteryPct();
  var total = getAllWords().length;
  var mastered = getAllWords().filter(function(w) { return w.status === 'mastered'; }).length;
  var cur = getRank();
  var next = getNextRank();

  var html = '<div class="section-title">\ud83c\udfc5 ' + t('Rank Progress', '段位进化路线') + '</div>';

  /* Rank rows */
  RANKS.forEach(function(r) {
    var needed = Math.ceil(r.min / 100 * total);
    var isCurrent = r.name === cur.name;
    html += '<div class="rank-row' + (isCurrent ? ' current' : '') + '" style="' + (isCurrent ? 'border-color:' + r.color + ';background:' + r.color + '15' : '') + '">';
    html += '<div class="rank-row-emoji">' + r.emoji + '</div>';
    html += '<div class="rank-row-info">';
    html += '<div class="rank-row-name" style="color:' + r.color + '">' + rankName(r) + '</div>';
    html += '<div class="rank-row-req">' + t('Master \u2265' + r.min + '% vocab' + (total > 0 ? ' (approx. ' + needed + ' words)' : ''), '掌握 \u2265' + r.min + '% 词汇' + (total > 0 ? '（约 ' + needed + ' 词）' : '')) + '</div>';
    html += '</div>';
    if (isCurrent) html += '<span class="rank-row-badge">' + t('Current', '当前') + '</span>';
    html += '</div>';
  });

  /* Progress to next rank */
  if (next) {
    var nextNeeded = Math.ceil(next.min / 100 * total);
    var remaining = Math.max(nextNeeded - mastered, 0);
    var progressPct = total > 0 ? Math.min(Math.round(mastered / nextNeeded * 100), 100) : 0;
    html += '<div class="rank-progress-section">';
    html += '<div class="rank-progress-label">' + t('<strong>' + remaining + '</strong> more words to reach ' + next.emoji + ' ' + rankName(next), '距 ' + next.emoji + ' ' + rankName(next) + ' 还需掌握 <strong>' + remaining + '</strong> 词') + '</div>';
    html += '<div class="rank-progress-bar"><div class="rank-progress-fill" style="width:' + progressPct + '%;background:' + next.color + '"></div></div>';
    html += '<div class="rank-progress-pct">' + pct + '% \u2192 ' + next.min + '%</div>';
    html += '</div>';
  } else {
    html += '<div class="rank-progress-section text-center" style="color:var(--c-success)">' + t('Highest rank achieved!', '已达最高段位') + ' \ud83c\udf89</div>';
  }

  /* Tips */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-title">' + t('How to rank up?', '如何升级？') + '</div>';
  html += '<div class="guide-tip-item">' + t('1. Practice vocabulary with 7 study modes', '1. 通过 7 种学习模式练习词汇') + '</div>';
  html += '<div class="guide-tip-item">' + t('2. Rate "Got it" in review to mark as mastered', '2. 复习时评为"搞定了"将词汇标记为已掌握') + '</div>';
  html += '<div class="guide-tip-item">' + t('3. Higher mastery % = auto rank up', '3. 掌握率提升 → 自动晋升段位') + '</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()" style="margin-top:16px">' + t('Close', '关闭') + '</button>';
  showModal(html);
}
