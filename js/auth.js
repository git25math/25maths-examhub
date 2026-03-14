/* ══════════════════════════════════════════════════════════════
   auth.js — Login / Register / Guest mode
   Cross-site compatible: accounts shared with 25maths.com
   ══════════════════════════════════════════════════════════════ */

/* ═══ AUTH LANGUAGE TOGGLE ═══ */
function toggleAuthLang() {
  var LANG_CYCLE = { en: 'zh', zh: 'bilingual', bilingual: 'en' };
  appLang = LANG_CYCLE[appLang] || 'en';
  try { localStorage.setItem('wmatch_lang', appLang); } catch(e) {}
  if (appLang !== 'en') loadCJKFont();
  updateAuthLang();
}

function updateAuthLang() {
  var LANG_LABELS = { en: '中文', zh: 'EN/中', bilingual: 'EN' };
  var label = LANG_LABELS[appLang] || '中文';
  /* Toggle button text */
  var btn = E('auth-lang-toggle');
  if (btn) btn.textContent = label;
  /* Header bar lang button */
  if (E('lang-toggle-hb')) E('lang-toggle-hb').textContent = label;
  /* Update all data-en/data-zh elements */
  updateNav();
  /* Placeholders */
  var ph = {
    'auth-email': ['Email', '邮箱地址'],
    'auth-pass': ['Password (min 6 chars)', '密码 (至少6位)'],
    'auth-invite': ['Invite code, e.g. MATH2026-A', '邀请码，如 MATH2026-A'],
    'tr-name': ['Name', '姓名'],
    'tr-email': ['Email', '邮箱'],
    'tr-pass': ['Password (min 6)', '密码 (至少6位)'],
    'tr-code': ['School Code', '学校注册码']
  };
  for (var id in ph) {
    var el = E(id);
    if (el) el.placeholder = t(ph[id][0], ph[id][1]);
  }
}

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
    E('auth-err').textContent = t('Please retry in ' + secs + 's', '请 ' + secs + 's 后重试');
    return false;
  }
  /* Cooldown between attempts */
  if (now - authLastAttempt < AUTH_COOLDOWN_MS) {
    E('auth-err').textContent = t('Too fast, please wait', '操作太快，请稍后');
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
    E('auth-err').textContent = t('Too many attempts, retry in ' + secs + 's', '尝试次数过多，请 ' + secs + 's 后重试');
  }
}

function authSuccess() {
  authAttempts = 0;
  authLockUntil = 0;
}

/* ── Login button (signIn only) ── */
E('auth-login').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  var btn = E('auth-login');
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = t('Please enter email', '请输入邮箱'); return; }
  if (pass.length < 6) { E('auth-err').textContent = t('Password min 6 chars', '密码至少6位'); return; }
  if (!sb) { E('auth-err').textContent = t('Supabase not configured', 'Supabase 未配置，请先体验'); return; }
  if (!checkAuthThrottle()) return;

  btn.disabled = true;
  btn.textContent = t('Logging in...', '登录中...');

  try {
    var res = await sb.auth.signInWithPassword({ email: email, password: pass });
    if (res.error) {
      authFail();
      if (res.error.message.indexOf('rate') >= 0 || res.error.message.indexOf('limit') >= 0) {
        authLockUntil = Date.now() + AUTH_LOCKOUT_MS;
        authAttempts = 0;
      }
      E('auth-err').textContent = t('Incorrect email or password', '邮箱或密码错误');
      btn.disabled = false;
      btn.textContent = t('Login', '登录');
      return;
    }

    var meta = res.data.user.user_metadata || {};
    currentUser = { email: email, id: res.data.user.id, nickname: meta.nickname || '' };
    if (meta.board) userBoard = meta.board;
    authSuccess();
    btn.disabled = false;
    btn.textContent = t('Login', '登录');
    afterLogin();
  } catch (e) {
    authFail();
    E('auth-err').textContent = t('Network error, try later', '网络错误，请稍后重试');
    btn.disabled = false;
    btn.textContent = t('Login', '登录');
  }
});

/* ── Register button (signUp only) ── */
E('auth-register').addEventListener('click', async function() {
  var email = E('auth-email').value.trim();
  var pass = E('auth-pass').value;
  var inviteCode = E('auth-invite').value.trim();
  var btn = E('auth-register');
  E('auth-err').textContent = '';

  if (!email) { E('auth-err').textContent = t('Please enter email', '请输入邮箱'); return; }
  if (pass.length < 6) { E('auth-err').textContent = t('Password min 6 chars', '密码至少6位'); return; }
  if (!sb) { E('auth-err').textContent = t('Supabase not configured', 'Supabase 未配置，请先体验'); return; }
  if (!checkAuthThrottle()) return;

  btn.disabled = true;
  btn.textContent = t('Registering...', '注册中...');

  try {
    var res = await sb.auth.signUp({ email: email, password: pass });
    if (res.error) {
      authFail();
      E('auth-err').textContent = translateAuthError(res.error.message);
      btn.disabled = false;
      btn.textContent = t('Register', '注册');
      return;
    }

    /* If invite code provided, activate it after signup */
    if (inviteCode && res.data.user) {
      try {
        await callEdgeFunction('activate-invite', { user_id: res.data.user.id, code: inviteCode });
      } catch (e) { /* invite activation failure is non-blocking */ }
    }

    /* Email confirmation required — tell user to check inbox */
    if (!res.data.session) {
      E('auth-err').style.color = 'var(--c-success)';
      E('auth-err').textContent = t(
        'Check your email and click the confirmation link, then login.',
        '请查看邮箱，点击确认链接后再登录。'
      );
      btn.disabled = false;
      btn.textContent = t('Register', '注册');
      return;
    }

    /* Session exists (email confirm OFF in Supabase dashboard) — direct login */
    currentUser = { email: email, id: res.data.user.id, nickname: '' };
    authSuccess();
    btn.disabled = false;
    btn.textContent = t('Register', '注册');
    afterLogin();
  } catch (e) {
    authFail();
    E('auth-err').textContent = t('Network error, try later', '网络错误，请稍后重试');
    btn.disabled = false;
    btn.textContent = t('Register', '注册');
  }
});

/* Show invite code input when Register is tapped/hovered */
E('auth-register').addEventListener('focus', function() {
  E('auth-invite').style.display = '';
});

/* Guest mode */
E('auth-skip').addEventListener('click', function() {
  currentUser = { email: 'guest', id: 'local' };
  /* Restore board from localStorage for guest (skip 25m-* boards) */
  var guestBoard = null;
  try { guestBoard = localStorage.getItem('userBoard'); } catch (e) {}
  if (guestBoard && (GUEST_FULL_ACCESS || guestBoard.indexOf('25m-') !== 0)) userBoard = guestBoard;
  afterLogin();
});

/* Logout — await signOut + final sync + clear user data */
var _userDataKeys = [
  'wmatch_v3', 'wmatch_last_sync', 'wmatch_login_ts',
  'pp_mastery', 'pp_wrong_book', 'pp_exam_history', 'pp_paper_results',
  'diag_history', 'wmatch_badges', 'wmatch_weekly',
  'recovery_schedule', 'student_profile',
  'wmatch_catCollapsed', 'wmatch_boardCollapsed',
  'wmatch_unitCollapsed', 'wmatch_chapterCollapsed'
];

async function doLogout() {
  invalidateGuestCache();
  if (sb && isLoggedIn()) {
    await syncToCloud();
    await sb.auth.signOut();
  }
  /* Clear all user-specific localStorage (keep UI prefs: lang/dark/sound/translate/userBoard) */
  _userDataKeys.forEach(function(k) {
    try { localStorage.removeItem(k); } catch(e) {}
  });
  invalidateCache();
  currentUser = null;
  E('app-shell').style.display = 'none';
  E('ov-auth').style.display = 'flex';
  E('ov-auth').classList.add('vis');
}

E('btn-logout-sb').addEventListener('click', function() { doLogout(); });
E('btn-logout-hb').addEventListener('click', function() { doLogout(); });

/* Post-login setup */
async function afterLogin() {
  invalidateGuestCache();
  /* Role detection from user_metadata */
  if (sb && isLoggedIn()) {
    var sess = await sb.auth.getSession();
    var meta = sess.data.session ? sess.data.session.user.user_metadata : {};
    if (meta.role === 'student') {
      /* Student: auto-set board from metadata, skip board selection */
      if (meta.board) userBoard = meta.board;
      if (meta.class_id) userClassId = meta.class_id;
      if (meta.school_id) userSchoolId = meta.school_id;
      try { localStorage.setItem('userBoard', userBoard || ''); } catch (e) {}
    }
    /* Super admin always gets full access */
    if (isSuperAdmin()) {
      userBoard = 'all';
    }
    if (meta.role === 'teacher') {
      /* Teacher: init admin panel after app shows */
      if (!userBoard) userBoard = 'cie';
      if (meta.class_id) userClassId = meta.class_id;
      if (meta.school_id) userSchoolId = meta.school_id;
      try { localStorage.setItem('userBoard', userBoard); } catch (e) {}
    }
  }

  /* Ensure board JSON is loaded (may differ from localStorage if user changed board on another device) */
  if (userBoard) {
    try { await ensureBoardLoaded(userBoard); } catch(e) {}
  }
  /* Load syllabus data only for visible boards — await so renderHome sees section data */
  if (typeof loadVisibleBoardData === 'function') {
    try { await loadVisibleBoardData(); } catch(e) {}
  }

  /* Load DB vocab overrides */
  if (sb && isLoggedIn()) {
    try {
      var dbLvls = await loadDbVocabLevels();
      if (dbLvls.length > 0) {
        var custom = getCustomLevels();
        var baseLen = LEVELS.length - custom.length;
        var base = LEVELS.slice(0, baseLen);
        LEVELS = mergeVocabLevels(base, dbLvls).concat(custom);
        invalidateCache();
      }
    } catch (e) { /* ignore */ }
  }

  try { localStorage.setItem('wmatch_login_ts', '' + Date.now()); } catch(e) {}
  if (_hostBoard) {
    /* Subdomain: force-lock board */
    if (_hostBoard === '25m' && userBoard && userBoard.indexOf('25m-') === 0) {
      /* keep specific year from metadata */
    } else {
      userBoard = _hostBoard;
    }
    try { localStorage.setItem('userBoard', userBoard); } catch(e) {}
    try { await ensureBoardLoaded(userBoard); } catch(e) {}
    showApp();
    if (sb && isLoggedIn() && userClassId) loadHomeworkModule();
    if (sb && isLoggedIn()) await loadAndInitTeacher();
  } else if (!userBoard) {
    showBoardSelection();
  } else {
    showApp();
    /* Lazy-load homework module for students with a class */
    if (sb && isLoggedIn() && userClassId) {
      loadHomeworkModule();
    }
    /* Init teacher panel after app shell is visible */
    if (sb && isLoggedIn()) {
      await loadAndInitTeacher();
    }
  }
}

/* ═══ DYNAMIC TEACHER MODULE LOADING ═══ */
async function loadAndInitTeacher() {
  if (!sb || !isLoggedIn()) return;
  var _isSA = typeof isSuperAdmin === 'function' && isSuperAdmin();
  /* Single query with full fields (eliminates duplicate query in initTeacher) */
  var teacherRow = null;
  try {
    var res = await sb.from('teachers')
      .select('id, school_id, display_name')
      .eq('user_id', currentUser.id).maybeSingle();
    if (!res.data && !_isSA) return;
    teacherRow = res.data || null;
  } catch(e) { if (!_isSA) return; }
  /* Parallel: board data + homework module + admin bundle */
  var _v = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '';
  await Promise.all([
    ensureAllBoardsLoaded().catch(function(){}),
    loadHomeworkModule(),
    new Promise(function(resolve) {
      var s = document.createElement('script');
      s.src = 'js/admin.bundle.min.js?v=' + _v;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    })
  ]);
  if (typeof initTeacher === 'function') await initTeacher(teacherRow);
}

/* ═══ BOARD SELECTION ═══ */
function showBoardSelection() {
  if (_hostBoard) {
    userBoard = _hostBoard;
    try { localStorage.setItem('userBoard', userBoard); } catch(e) {}
    hideBoardSelection();
    showApp();
    return;
  }
  E('ov-auth').classList.remove('vis');
  E('ov-auth').style.display = 'none';
  E('board-sel-title').textContent = t('Choose Your Course', '\u9009\u62e9\u4f60\u7684\u8bfe\u7a0b');
  E('board-sel-sub').textContent = t('You will only see vocabulary for your course. Change anytime in settings.', '\u9009\u8bfe\u540e\u53ea\u663e\u793a\u5bf9\u5e94\u6a21\u5757\u7684\u8bcd\u6c47\uff0c\u53ef\u5728\u8bbe\u7f6e\u4e2d\u66f4\u6362');
  var html = '<div class="board-sel-grid">';
  var opts = userSchoolId ? BOARD_OPTIONS : getPublicBoardOptions();
  opts.forEach(function(opt) {
    html += '<button class="board-sel-btn" onclick="selectBoard(\'' + escapeHtml(opt.value) + '\')">';
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
  invalidateGuestCache();
  /* Persist to localStorage (guest support) */
  try { localStorage.setItem('userBoard', value); } catch (e) {}
  /* Save to user_metadata if logged in */
  if (sb && isLoggedIn()) {
    try {
      await sb.auth.updateUser({ data: { board: value } });
    } catch (e) {}
  }
  /* Load JSON for newly selected board */
  try { await ensureBoardLoaded(value); } catch(e) {
    showToast(t('Failed to load vocabulary data', '词汇数据加载失败'));
  }
  /* Load syllabus data for newly visible boards */
  if (typeof loadVisibleBoardData === 'function') loadVisibleBoardData();
  hideBoardSelection();
  showApp();
  /* Init teacher panel if applicable */
  if (sb && isLoggedIn()) {
    await loadAndInitTeacher();
  }
  syncToCloud();
}

/* Translate common Supabase auth error messages */
function translateAuthError(msg) {
  if (!msg) return t('Unknown error', '未知错误');
  if (appLang === 'en') return msg;
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
    '<p class="text-sm text-sub mb-12">' +
    t('Enter your email and we will send a reset link.', '输入注册邮箱，我们将发送重置链接。') + '</p>' +
    '<input class="auth-input" id="reset-email" type="email" placeholder="' + t('Email', '邮箱地址') + '" value="' + (prefill || '').replace(/"/g, '&quot;') + '">' +
    '<div id="reset-msg" class="text-sm" style="margin:8px 0;min-height:20px"></div>' +
    '<div class="btn-row btn-row--mt8">' +
    '<button class="btn btn-primary" id="reset-send" onclick="sendPasswordReset()">' + t('Send Reset Link', '发送重置链接') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
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
      btn.textContent = t('Register Teacher Account', '注册教师账号');
      return;
    }

    /* Email verification required — show confirmation message */
    err.style.color = 'var(--c-success)';
    err.textContent = t(
      'Registered! Check your email and click the confirmation link, then login.',
      '注册成功！请查看邮箱，点击确认链接后再登录。'
    );
    btn.disabled = false;
    btn.textContent = t('Register Teacher Account', '注册教师账号');
  } catch (e) {
    err.textContent = t('Network error', '网络错误');
    btn.disabled = false;
    btn.textContent = t('Register Teacher Account', '注册教师账号');
  }
}

/* showRankGuide → moved to board-guides.js (lazy-loaded) */
