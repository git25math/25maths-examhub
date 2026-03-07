/* ══════════════════════════════════════════════════════════════
   admin.js — Teacher admin panel: classes, students, dashboard
   ══════════════════════════════════════════════════════════════ */

/* isTeacherUser moved to config.js */
var _teacherData = null;   /* { id, school_id, display_name } */
var _schoolData = null;    /* { id, name, code } */
var _adminTab = 'classes'; /* 'classes' | 'grade' | 'school' */
var _adminCache = null;    /* cached student_activity_view rows */
var _adminCacheAt = 0;

/* Grade-list collapse state (default: all collapsed) */
var _gradeListCollapsed = {};
GRADE_OPTIONS.forEach(function(g) { _gradeListCollapsed[g.value] = true; });

function toggleGradeList(grade) {
  _gradeListCollapsed[grade] = !_gradeListCollapsed[grade];
  var el = document.getElementById('grade-list-' + grade);
  if (el) el.classList.toggle('collapsed', _gradeListCollapsed[grade]);
}

/* isTeacher() and callEdgeFunction() moved to config.js */

/* ═══ INIT TEACHER ═══ */
async function initTeacher() {
  if (!sb || !isLoggedIn()) return;
  try {
    var res = await sb.from('teachers')
      .select('id, school_id, display_name')
      .eq('user_id', currentUser.id)
      .single();
    if (res.error || !res.data) {
      /* Super admin can access admin panel without teacher record */
      if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
        var navAdmin = E('nav-admin');
        var bnavAdmin = E('bnav-admin');
        if (navAdmin) navAdmin.style.display = '';
        if (bnavAdmin) bnavAdmin.style.display = '';
      } else {
        isTeacherUser = false;
      }
      return;
    }
    _teacherData = res.data;
    isTeacherUser = true;
    updateSidebar();
    if (typeof appView !== 'undefined' && appView === 'home') renderHome();

    /* Load school info */
    var sRes = await sb.from('schools')
      .select('id, name, code')
      .eq('id', _teacherData.school_id)
      .single();
    if (sRes.data) _schoolData = sRes.data;

    /* Show admin nav items */
    var navAdmin = E('nav-admin');
    var bnavAdmin = E('bnav-admin');
    if (navAdmin) navAdmin.style.display = '';
    if (bnavAdmin) bnavAdmin.style.display = '';
  } catch (e) {
    isTeacherUser = false;
  }
}

/* Helper: super admin sees all schools; teachers see own school only */
function _adminSchoolFilter(query) {
  if (_teacherData && _teacherData.school_id) return query.eq('school_id', _teacherData.school_id);
  return query; /* super admin without teacher record → no filter */
}

/* ═══ LOAD ACTIVITY DATA ═══ */
async function loadActivityData(force) {
  if (!force && _adminCache && Date.now() - _adminCacheAt < 30000) return _adminCache;
  try {
    var res = await _adminSchoolFilter(sb.from('student_activity_view')
      .select('*'));
    _adminCache = res.data || [];
    _adminCacheAt = Date.now();
    return _adminCache;
  } catch (e) {
    return _adminCache || [];
  }
}

/* ═══ RENDER ADMIN ═══ */
function renderAdmin() {
  var el = E('panel-admin');
  if (!el || (!isTeacherUser && !(typeof isSuperAdmin === 'function' && isSuperAdmin()))) return;

  var html = '<div class="admin-header">' +
    '<div class="section-title">' + t('Admin Panel', '管理面板') + '</div>' +
    '<div class="admin-school-name">' + (_schoolData ? escapeHtml(_schoolData.name) : (typeof isSuperAdmin === 'function' && isSuperAdmin() ? t('Super Admin — All Schools', '超级管理员 — 全部学校') : '')) + '</div>' +
    '</div>';

  /* Tabs */
  html += '<div class="admin-tabs">';
  html += '<button class="admin-tab' + (_adminTab === 'classes' ? ' active' : '') + '" onclick="switchAdminTab(\'classes\')">' + t('Classes', '班级管理') + '</button>';
  html += '<button class="admin-tab' + (_adminTab === 'grade' ? ' active' : '') + '" onclick="switchAdminTab(\'grade\')">' + t('By Grade', '年级概览') + '</button>';
  html += '<button class="admin-tab' + (_adminTab === 'school' ? ' active' : '') + '" onclick="switchAdminTab(\'school\')">' + t('School', '全校概览') + '</button>';
  if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    html += '<button class="admin-tab' + (_adminTab === 'feedback' ? ' active' : '') + '" onclick="switchAdminTab(\'feedback\')">' + t('Feedback', '反馈') + '</button>';
    html += '<button class="admin-tab' + (_adminTab === 'dataquality' ? ' active' : '') + '" onclick="switchAdminTab(\'dataquality\')">' + t('Data Quality', '数据质量') + '</button>';
  }
  html += '</div>';

  html += '<div id="admin-content"></div>';
  el.innerHTML = html;

  /* Render active tab */
  if (_adminTab === 'classes') renderClassList();
  else if (_adminTab === 'grade') renderGradeOverview();
  else if (_adminTab === 'school') renderSchoolOverview();
  else if (_adminTab === 'feedback' && typeof renderFeedbackList === 'function') renderFeedbackList();
  else if (_adminTab === 'dataquality' && typeof renderDataQuality === 'function') renderDataQuality();
}

function switchAdminTab(tab) {
  _adminTab = tab;
  renderAdmin();
}

/* ═══ PHASE 5: CLASS LIST (grouped by grade, collapsible) ═══ */
async function renderClassList() {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  try {
  var res = await _adminSchoolFilter(sb.from('kw_classes')
    .select('id, name, grade, created_at'))
    .order('created_at', { ascending: true });
  var classes = res.data || [];

  var activity = await loadActivityData();

  var html = '<div class="admin-toolbar">' +
    '<button class="btn btn-primary btn-sm" onclick="showCreateClassModal()">' + t('+ Create Class', '+ 创建班级') + '</button>' +
    '</div>';

  if (classes.length === 0) {
    html += '<div class="admin-empty">' + t('No classes yet. Create your first class!', '还没有班级，创建第一个班级吧！') + '</div>';
    ct.innerHTML = html;
    return;
  }

  /* Group classes by grade (GRADE_OPTIONS order: Y7→Y11) */
  GRADE_OPTIONS.forEach(function(g) {
    var gradeClasses = classes.filter(function(c) { return c.grade === g.value; });
    if (gradeClasses.length === 0) return; /* skip empty grades */

    var gradeLabel = t(g.name, g.nameZh);
    var totalStudents = 0;
    var cardsHtml = '';

    gradeClasses.forEach(function(c) {
      var students = activity.filter(function(s) { return s.class_id === c.id; });
      var count = students.length;
      totalStudents += count;
      var avgPct = count > 0 ? Math.round(students.reduce(function(sum, s) { return sum + (s.mastery_pct || 0); }, 0) / count) : 0;

      cardsHtml += '<div class="admin-class-card" onclick="renderClassDetail(\'' + c.id + '\')">';
      cardsHtml += '<div class="admin-class-name">' + escapeHtml(c.name) + '</div>';
      cardsHtml += '<div class="admin-class-stats">';
      cardsHtml += '<span>' + count + ' ' + t('students', '学生') + '</span>';
      cardsHtml += '<span>' + t('Avg', '平均') + ' ' + avgPct + '%</span>';
      cardsHtml += '</div>';
      cardsHtml += '<div class="admin-class-bar"><div class="admin-class-bar-fill" style="width:' + avgPct + '%"></div></div>';
      cardsHtml += '</div>';
    });

    var collapsed = _gradeListCollapsed[g.value] !== false;
    html += '<div class="grade-list-section' + (collapsed ? ' collapsed' : '') + '" id="grade-list-' + g.value + '">';
    html += '<div class="grade-list-header" onclick="toggleGradeList(\'' + g.value + '\')">';
    html += '<span class="grade-list-chevron">&#9660;</span>';
    html += '<span>' + g.emoji + ' ' + gradeLabel + '</span>';
    html += '<span class="grade-list-meta">' + gradeClasses.length + ' ' + t('classes', '班级') + ' · ' + totalStudents + ' ' + t('students', '学生') + '</span>';
    html += '</div>';
    html += '<div class="grade-list-body"><div class="admin-class-grid">' + cardsHtml + '</div></div>';
    html += '</div>';
  });

  ct.innerHTML = html;
  } catch (e) {
    ct.innerHTML = '<div class="admin-empty">' + escapeHtml(e.message) + '</div>';
  }
}

/* ═══ CREATE CLASS MODAL ═══ */
function showCreateClassModal() {
  var gradeOpts = '';
  GRADE_OPTIONS.forEach(function(g) {
    gradeOpts += '<option value="' + g.value + '">' + g.emoji + ' ' + t(g.name, g.nameZh) + '</option>';
  });

  var html = '<div class="section-title">' + t('Create Class', '创建班级') + '</div>' +
    '<label class="settings-label">' + t('Class Name', '班级名称') + '</label>' +
    '<input class="auth-input" id="cc-name" type="text" placeholder="' + t('e.g. 7A', '如 7A') + '">' +
    '<label class="settings-label" style="margin-top:12px">' + t('Grade / Year', '年级') + '</label>' +
    '<select class="auth-input" id="cc-grade">' + gradeOpts + '</select>' +
    '<div id="cc-msg" class="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
    '<button class="btn btn-primary" style="flex:1" onclick="doCreateClass()">' + t('Create', '创建') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doCreateClass() {
  var name = E('cc-name').value.trim();
  var grade = E('cc-grade').value;
  var msg = E('cc-msg');
  if (!name) { msg.textContent = t('Please enter class name', '请输入班级名称'); msg.className = 'settings-msg error'; return; }
  if (!_teacherData) { msg.textContent = t('No school context (super admin view-only)', '无学校上下文（超管仅查看）'); msg.className = 'settings-msg error'; return; }

  try {
    var res = await sb.from('kw_classes').insert({
      school_id: _teacherData.school_id,
      teacher_id: _teacherData.id,
      name: name,
      grade: grade
    });

    if (res.error) {
      msg.textContent = res.error.message;
      msg.className = 'settings-msg error';
      return;
    }

    hideModal();
    showToast(t('Class created!', '班级已创建！'));
    _adminCache = null;
    renderClassList();
  } catch (e) {
    msg.textContent = escapeHtml(e.message);
    msg.className = 'settings-msg error';
  }
}

/* ═══ EDIT CLASS ═══ */
function showEditClassModal(classId, currentName, currentGrade) {
  var gradeOpts = '';
  GRADE_OPTIONS.forEach(function(g) {
    var sel = g.value === currentGrade ? ' selected' : '';
    gradeOpts += '<option value="' + g.value + '"' + sel + '>' + g.emoji + ' ' + t(g.name, g.nameZh) + '</option>';
  });

  var html = '<div class="section-title">' + t('Edit Class', '编辑班级') + '</div>' +
    '<label class="settings-label">' + t('Class Name', '班级名称') + '</label>' +
    '<input class="auth-input" id="ec-name" type="text" value="' + currentName.replace(/"/g, '&quot;') + '">' +
    '<label class="settings-label" style="margin-top:12px">' + t('Grade / Year', '年级') + '</label>' +
    '<select class="auth-input" id="ec-grade">' + gradeOpts + '</select>' +
    '<div id="ec-msg" class="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
    '<button class="btn btn-primary" style="flex:1" onclick="doEditClass(\'' + classId + '\', \'' + currentGrade + '\')">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  setTimeout(function() { var inp = E('ec-name'); if (inp) { inp.focus(); inp.select(); } }, 100);
}

async function doEditClass(classId, oldGrade) {
  var name = E('ec-name').value.trim();
  var grade = E('ec-grade').value;
  var msg = E('ec-msg');
  if (!name) { msg.textContent = t('Please enter class name', '请输入班级名称'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Saving...', '保存中...');
  msg.className = 'settings-msg';

  try {
    var res = await sb.rpc('update_class', { p_class_id: classId, p_name: name, p_grade: grade });
    if (res.error) throw new Error(res.error.message);

    /* Cascade grade update if changed */
    if (grade !== oldGrade) {
      await cascadeGradeUpdate(classId, grade);
    }

    hideModal();
    showToast(t('Class updated!', '班级已更新！'));
    _adminCache = null;
    renderClassDetail(classId);
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

async function cascadeGradeUpdate(classId, newGrade) {
  /* 1. Batch update leaderboard.board for all students in this class */
  var r1 = await sb.from('leaderboard').update({ board: newGrade }).eq('class_id', classId);
  if (r1.error) throw new Error(r1.error.message);

  /* 2. Update each student's auth metadata.board via edge function (parallel) */
  var csRes = await sb.from('kw_class_students').select('user_id').eq('class_id', classId);
  var students = csRes.data || [];
  var promises = students.map(function(s) {
    return callEdgeFunction('update-student', { student_user_id: s.user_id, board: newGrade });
  });
  var results = await Promise.all(promises);
  var failed = results.filter(function(r) { return r.error; });
  if (failed.length > 0) throw new Error(failed.length + ' students failed to update');
}

/* ═══ PHASE 6: BATCH CREATE STUDENTS ═══ */
function showBatchCreateModal(classId) {
  var html = '<div class="section-title">' + t('Add Students', '添加学生') + '</div>' +
    '<div class="batch-table-wrap">' +
    '<table class="batch-table">' +
    '<thead><tr>' +
    '<th>' + t('Email', '邮箱') + '</th>' +
    '<th>' + t('Password', '密码') + '</th>' +
    '<th>' + t('Name', '姓名') + '</th>' +
    '</tr></thead>' +
    '<tbody id="batch-rows"></tbody>' +
    '</table>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="addOneBatchRow()">' + t('+ 1 row', '+ 1行') + '</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="addBatchRows()">' + t('+ 5 rows', '+ 5行') + '</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="toggleImportArea()">' + t('\ud83d\udccb Import', '\ud83d\udccb 导入') + '</button>' +
    '</div>' +
    '<div id="import-area" style="display:none;margin-top:8px">' +
    '<textarea id="import-csv" class="auth-input" rows="4" style="font-family:monospace;font-size:12px" placeholder="' + t('Paste CSV: email, password, name (one per line)', '粘贴 CSV：邮箱, 密码, 姓名（每行一个）') + '"></textarea>' +
    '<button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="parseImportData()">' + t('Parse & Fill', '解析填入') + '</button>' +
    '</div>' +
    '<div id="batch-msg" class="settings-msg" style="margin-top:8px"></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button class="btn btn-primary" style="flex:1" id="batch-submit" onclick="doBatchCreate(\'' + classId + '\')">' + t('Create All', '创建全部') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  /* Add initial 1 row */
  addOneBatchRow();
}

function addOneBatchRow() {
  var tbody = E('batch-rows');
  if (!tbody) return;
  var tr = document.createElement('tr');
  tr.className = 'batch-row';
  tr.innerHTML = '<td><input class="batch-input" type="email" placeholder="student@school.com"></td>' +
    '<td><input class="batch-input" type="text" placeholder="' + t('password', '密码') + '"></td>' +
    '<td><input class="batch-input" type="text" placeholder="' + t('name', '姓名') + '"></td>';
  tbody.appendChild(tr);
}

function addBatchRows() {
  for (var i = 0; i < 5; i++) addOneBatchRow();
}

function toggleImportArea() {
  var area = E('import-area');
  if (!area) return;
  area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function parseImportData() {
  var csv = E('import-csv');
  if (!csv) return;
  var text = csv.value.trim();
  if (!text) return;

  var lines = text.split(/\r?\n/);
  var parsed = 0;
  lines.forEach(function(line) {
    line = line.trim();
    if (!line) return;
    /* Support comma, tab, or semicolon as delimiter */
    var parts = line.split(/[,\t;]/);
    if (parts.length < 3) return;
    var email = parts[0].trim();
    var pass = parts[1].trim();
    var name = parts.slice(2).join(' ').trim(); /* Allow commas in name by joining remainder */
    if (!email || !pass || !name) return;

    addOneBatchRow();
    var rows = document.querySelectorAll('#batch-rows .batch-row');
    var lastRow = rows[rows.length - 1];
    var inputs = lastRow.querySelectorAll('input');
    inputs[0].value = email;
    inputs[1].value = pass;
    inputs[2].value = name;
    parsed++;
  });

  if (parsed > 0) {
    csv.value = '';
    E('import-area').style.display = 'none';
    showToast(t(parsed + ' students imported', parsed + ' 个学生已导入'));
  } else {
    E('batch-msg').textContent = t('No valid rows found. Format: email, password, name', '未找到有效行。格式：邮箱, 密码, 姓名');
    E('batch-msg').className = 'settings-msg error';
  }
}

async function doBatchCreate(classId) {
  var rows = document.querySelectorAll('#batch-rows .batch-row');
  var students = [];
  rows.forEach(function(tr) {
    var inputs = tr.querySelectorAll('input');
    var email = inputs[0].value.trim();
    var pass = inputs[1].value.trim();
    var name = inputs[2].value.trim();
    if (email && pass && name) students.push({ email: email, password: pass, name: name });
  });

  if (students.length === 0) {
    E('batch-msg').textContent = t('Please fill at least one row', '请至少填写一行');
    E('batch-msg').className = 'settings-msg error';
    return;
  }

  var btn = E('batch-submit');
  btn.disabled = true;
  btn.textContent = t('Creating...', '创建中...');
  E('batch-msg').textContent = '';

  try {
  var result = await callEdgeFunction('create-students', { class_id: classId, students: students });

  btn.disabled = false;
  btn.textContent = t('Create All', '创建全部');

  if (result.error) {
    E('batch-msg').textContent = result.error;
    E('batch-msg').className = 'settings-msg error';
    return;
  }

  /* Show per-row results */
  var rows2 = document.querySelectorAll('#batch-rows .batch-row');
  var createdEmails = (result.created || []).map(function(c) { return c.email; });
  var errorMap = {};
  (result.errors || []).forEach(function(e) { errorMap[e.email] = e.error; });

  rows2.forEach(function(tr) {
    var email = tr.querySelectorAll('input')[0].value.trim();
    if (!email) return;
    if (createdEmails.indexOf(email) >= 0) {
      tr.style.background = 'var(--c-success-bg)';
      tr.insertAdjacentHTML('beforeend', '<td class="batch-status batch-ok">\u2713</td>');
    } else if (errorMap[email]) {
      tr.style.background = 'var(--c-danger-bg)';
      tr.insertAdjacentHTML('beforeend', '<td class="batch-status batch-err" title="' + errorMap[email].replace(/"/g, '&quot;') + '">\u2717</td>');
    }
  });

  var ok = (result.created || []).length;
  var fail = (result.errors || []).length;
  E('batch-msg').textContent = t(ok + ' created, ' + fail + ' failed', ok + ' 个创建成功，' + fail + ' 个失败');
  E('batch-msg').className = 'settings-msg' + (fail > 0 ? ' error' : '');

  _adminCache = null;
  } catch (e) {
    btn.disabled = false;
    btn.textContent = t('Create All', '创建全部');
    E('batch-msg').textContent = escapeHtml(e.message);
    E('batch-msg').className = 'settings-msg error';
  }
}

/* ═══ PHASE 7: CLASS DETAIL ═══ */
async function renderClassDetail(classId) {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  /* Load class info */
  var cRes = await sb.from('kw_classes').select('id, name, grade').eq('id', classId).single();
  var cls = cRes.data;
  if (!cls) { ct.innerHTML = '<div class="admin-empty">Not found</div>'; return; }

  var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === cls.grade; });
  var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : cls.grade;

  /* Load students */
  var activity = await loadActivityData(true);
  var students = activity.filter(function(s) { return s.class_id === classId; });

  var html = '<div class="admin-detail-header">' +
    '<button class="btn btn-ghost btn-sm" onclick="renderClassList()">' + t('\u2190 Back', '\u2190 返回') + '</button>' +
    '<div class="admin-detail-title">' + escapeHtml(cls.name) + ' <span class="admin-detail-grade">' + gradeLabel + '</span>' +
    ' <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:14px" data-action="editclass" data-cid="' + classId + '" data-cname="' + escapeHtml(cls.name) + '" data-grade="' + cls.grade + '">&#9998;</button></div>' +
    '<button class="btn btn-primary btn-sm" onclick="showBatchCreateModal(\'' + classId + '\')">' + t('+ Add Students', '+ 添加学生') + '</button>' +
    '</div>';

  if (students.length === 0) {
    html += '<div class="admin-empty">' + t('No students yet. Add students to this class!', '还没有学生，给班级添加学生吧！') + '</div>';
    ct.innerHTML = html;
    return;
  }

  /* Student table */
  html += '<div class="admin-table-wrap">' +
    '<table class="admin-student-table">' +
    '<thead><tr>' +
    '<th>' + t('Name', '姓名') + '</th>' +
    '<th>' + t('Last Active', '最后活跃') + '</th>' +
    '<th>' + t('Mastery', '掌握率') + '</th>' +
    '<th>' + t('Words', '词汇') + '</th>' +
    '<th>' + t('Rank', '段位') + '</th>' +
    '<th>' + t('Action', '操作') + '</th>' +
    '</tr></thead><tbody>';

  students.sort(function(a, b) { return (b.mastery_pct || 0) - (a.mastery_pct || 0); });

  students.forEach(function(s) {
    var lastActive = s.last_active ? timeAgo(s.last_active) : t('Never', '从未');
    var pct = s.mastery_pct || 0;
    var mastered = s.mastered_words || 0;
    var total = s.total_words || 0;

    html += '<tr>';
    html += '<td class="admin-td-name">' + escapeHtml(s.student_name || '-') + '</td>';
    html += '<td class="admin-td-time">' + lastActive + '</td>';
    html += '<td class="admin-td-mastery">';
    html += '<div class="admin-progress"><div class="admin-progress-fill" style="width:' + pct + '%"></div></div>';
    html += '<span class="admin-pct">' + pct + '%</span>';
    html += '</td>';
    html += '<td class="admin-td-words">' + mastered + '/' + total + '</td>';
    html += '<td>' + (s.rank_emoji || '\ud83e\udd49') + '</td>';
    html += '<td class="admin-td-action">';
    html += '<div class="action-dropdown">';
    html += '<button class="btn btn-ghost btn-sm action-trigger" onclick="toggleActionMenu(this)">' + t('Actions', '操作') + ' ▾</button>';
    html += '<div class="action-menu">';
    html += '<button class="action-item" data-action="rename" data-uid="' + s.user_id + '" data-name="' + escapeHtml(s.student_name || '') + '" data-cid="' + classId + '">✏️ ' + t('Rename', '改名') + '</button>';
    html += '<button class="action-item" data-action="resetpw" data-uid="' + s.user_id + '" data-name="' + escapeHtml(s.student_name || '') + '">🔑 ' + t('Reset PW', '重置密码') + '</button>';
    html += '<button class="action-item" data-action="moveclass" data-uid="' + s.user_id + '" data-name="' + escapeHtml(s.student_name || '') + '" data-cid="' + classId + '">↗️ ' + t('Move Class', '移动班级') + '</button>';
    html += '</div></div></td>';
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  /* Homework section */
  html += '<div class="hw-section">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
  html += '<div class="hw-section-title">' + t('Homework', '作业') + '</div>';
  html += '<button class="btn btn-primary btn-sm" onclick="showCreateHwModal(\'' + classId + '\')">' + t('+ Assign', '+ 布置作业') + '</button>';
  html += '</div>';
  html += '<div id="hw-list-area"><div class="admin-loading">' + t('Loading...', '加载中...') + '</div></div>';
  html += '</div>';

  ct.innerHTML = html;

  /* Async load homework list */
  if (typeof renderClassHwList === 'function') {
    renderClassHwList(classId);
  }
}

/* ═══ RESET PASSWORD MODAL ═══ */
function showResetPasswordModal(userId, name) {
  var html = '<div class="section-title">' + t('Reset Password', '重置密码') + '</div>' +
    '<p style="font-size:13px;color:var(--c-text2);margin-bottom:12px">' +
    t('Reset password for: ', '重置学生密码：') + '<strong>' + escapeHtml(name) + '</strong></p>' +
    '<input class="auth-input" id="rp-pass" type="text" placeholder="' + t('New password (min 6 chars)', '新密码（至少6位）') + '">' +
    '<div id="rp-msg" class="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button class="btn btn-primary" style="flex:1" data-action="do-resetpw" data-uid="' + userId + '">' + t('Reset', '重置') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doResetPassword(userId) {
  var pass = E('rp-pass').value.trim();
  var msg = E('rp-msg');
  if (pass.length < 6) { msg.textContent = t('Min 6 chars', '至少6位'); msg.className = 'settings-msg error'; return; }

  try {
    var result = await callEdgeFunction('reset-student-password', {
      student_user_id: userId,
      new_password: pass
    });

    if (result.error) {
      msg.textContent = result.error;
      msg.className = 'settings-msg error';
      return;
    }

    hideModal();
    showToast(t('Password reset!', '密码已重置！'));
  } catch (e) {
    msg.textContent = escapeHtml(e.message);
    msg.className = 'settings-msg error';
  }
}

/* ═══ PHASE 8: GRADE OVERVIEW ═══ */
async function renderGradeOverview() {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  var activity = await loadActivityData(true);

  /* Group by grade */
  var gradeMap = {};
  activity.forEach(function(s) {
    var g = s.grade || 'unknown';
    if (!gradeMap[g]) gradeMap[g] = { grade: g, students: [], classIds: {} };
    gradeMap[g].students.push(s);
    gradeMap[g].classIds[s.class_id] = true;
  });

  var grades = Object.keys(gradeMap).sort();

  if (grades.length === 0) {
    ct.innerHTML = '<div class="admin-empty">' + t('No data yet', '暂无数据') + '</div>';
    return;
  }

  var html = '<div class="admin-class-grid">';
  grades.forEach(function(g) {
    var d = gradeMap[g];
    var count = d.students.length;
    var classCount = Object.keys(d.classIds).length;
    var avgPct = count > 0 ? Math.round(d.students.reduce(function(sum, s) { return sum + (s.mastery_pct || 0); }, 0) / count) : 0;
    var now = Date.now();
    var active7d = d.students.filter(function(s) { return s.last_active && (now - new Date(s.last_active).getTime()) < 7 * 86400000; }).length;

    var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === g; });
    var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : g;

    html += '<div class="admin-class-card" onclick="expandGrade(\'' + g + '\')">';
    html += '<div class="admin-class-name">' + gradeLabel + '</div>';
    html += '<div class="admin-class-stats">';
    html += '<span>' + classCount + ' ' + t('classes', '班级') + '</span>';
    html += '<span>' + count + ' ' + t('students', '学生') + '</span>';
    html += '</div>';
    html += '<div class="admin-class-stats">';
    html += '<span>' + active7d + ' ' + t('active (7d)', '活跃(7天)') + '</span>';
    html += '<span>' + t('Avg', '平均') + ' ' + avgPct + '%</span>';
    html += '</div>';
    html += '<div class="admin-class-bar"><div class="admin-class-bar-fill" style="width:' + avgPct + '%"></div></div>';
    html += '</div>';
  });
  html += '</div>';

  ct.innerHTML = html;
}

async function expandGrade(grade) {
  var ct = E('admin-content');
  if (!ct) return;

  var activity = await loadActivityData();
  var students = activity.filter(function(s) { return s.grade === grade; });

  /* Group by class */
  var classMap = {};
  students.forEach(function(s) {
    if (!classMap[s.class_id]) classMap[s.class_id] = { name: s.class_name, students: [] };
    classMap[s.class_id].students.push(s);
  });

  var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === grade; });
  var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : grade;

  var html = '<div class="admin-detail-header">' +
    '<button class="btn btn-ghost btn-sm" onclick="renderGradeOverview()">' + t('\u2190 Back', '\u2190 返回') + '</button>' +
    '<div class="admin-detail-title">' + gradeLabel + '</div>' +
    '</div>';

  Object.keys(classMap).forEach(function(cid) {
    var c = classMap[cid];
    var count = c.students.length;
    var avgPct = count > 0 ? Math.round(c.students.reduce(function(sum, s) { return sum + (s.mastery_pct || 0); }, 0) / count) : 0;
    html += '<div class="admin-grade-class">';
    html += '<div class="admin-grade-class-header" onclick="renderClassDetail(\'' + cid + '\')">';
    html += '<span class="admin-grade-class-name">' + escapeHtml(c.name) + '</span>';
    html += '<span>' + count + ' ' + t('students', '学生') + ' · ' + t('Avg', '平均') + ' ' + avgPct + '%</span>';
    html += '</div></div>';
  });

  ct.innerHTML = html;
}

/* ═══ PHASE 8: SCHOOL OVERVIEW ═══ */
async function renderSchoolOverview() {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  var activity = await loadActivityData(true);

  var totalStudents = activity.length;
  var now = Date.now();
  var active7d = activity.filter(function(s) { return s.last_active && (now - new Date(s.last_active).getTime()) < 7 * 86400000; }).length;
  var avgPct = totalStudents > 0 ? Math.round(activity.reduce(function(sum, s) { return sum + (s.mastery_pct || 0); }, 0) / totalStudents) : 0;

  /* Count unique grades and classes */
  var gradeSet = {};
  var classSet = {};
  activity.forEach(function(s) {
    gradeSet[s.grade] = true;
    classSet[s.class_id] = true;
  });
  var totalGrades = Object.keys(gradeSet).length;
  var totalClasses = Object.keys(classSet).length;

  var html = '<div class="admin-summary-grid">';
  html += summaryCard(t('Grades', '年级'), totalGrades, 'var(--c-primary)');
  html += summaryCard(t('Classes', '班级'), totalClasses, 'var(--c-primary-light)');
  html += summaryCard(t('Students', '学生'), totalStudents, 'var(--c-success)');
  html += summaryCard(t('Active (7d)', '活跃(7天)'), active7d, 'var(--c-warning)');
  html += summaryCard(t('Avg Mastery', '平均掌握率'), avgPct + '%', 'var(--c-primary-dark)');
  html += '</div>';

  /* Grade summary table */
  var gradeMap = {};
  activity.forEach(function(s) {
    var g = s.grade || 'unknown';
    if (!gradeMap[g]) gradeMap[g] = { students: 0, sumPct: 0 };
    gradeMap[g].students++;
    gradeMap[g].sumPct += (s.mastery_pct || 0);
  });

  var gradeKeys = Object.keys(gradeMap).sort();
  if (gradeKeys.length > 0) {
    html += '<div class="section-title" style="margin-top:20px">' + t('Grade Summary', '年级汇总') + '</div>';
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr>';
    html += '<th>' + t('Grade', '年级') + '</th>';
    html += '<th>' + t('Students', '学生') + '</th>';
    html += '<th>' + t('Avg Mastery', '平均掌握率') + '</th>';
    html += '</tr></thead><tbody>';
    gradeKeys.forEach(function(g) {
      var d = gradeMap[g];
      var avg = Math.round(d.sumPct / d.students);
      var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === g; });
      var label = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : g;
      html += '<tr><td>' + label + '</td><td>' + d.students + '</td><td>' + avg + '%</td></tr>';
    });
    html += '</tbody></table></div>';
  }

  /* Top 10 students */
  if (activity.length > 0) {
    var sorted = activity.slice().sort(function(a, b) { return (b.mastery_pct || 0) - (a.mastery_pct || 0); });
    var top10 = sorted.slice(0, 10);
    html += '<div class="section-title" style="margin-top:20px">' + t('Top 10 Students', 'Top 10 学生') + '</div>';
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr>';
    html += '<th>#</th><th>' + t('Name', '姓名') + '</th><th>' + t('Class', '班级') + '</th>';
    html += '<th>' + t('Mastery', '掌握率') + '</th><th>' + t('Rank', '段位') + '</th>';
    html += '</tr></thead><tbody>';
    top10.forEach(function(s, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(s.student_name || '-') + '</td>';
      html += '<td>' + escapeHtml(s.class_name || '-') + '</td>';
      html += '<td>' + (s.mastery_pct || 0) + '%</td>';
      html += '<td>' + (s.rank_emoji || '\ud83e\udd49') + '</td></tr>';
    });
    html += '</tbody></table></div>';
  }

  ct.innerHTML = html;
}

function summaryCard(label, value, color) {
  return '<div class="admin-summary-card">' +
    '<div class="admin-summary-val" style="color:' + color + '">' + value + '</div>' +
    '<div class="admin-summary-label">' + label + '</div>' +
    '</div>';
}

/* ═══ ACTION DROPDOWN ═══ */
function toggleActionMenu(btn) {
  var menu = btn.nextElementSibling;
  var wasOpen = menu.classList.contains('open');

  /* Close all open menus first */
  document.querySelectorAll('.action-menu.open').forEach(function(m) {
    m.classList.remove('open');
  });

  if (!wasOpen) menu.classList.add('open');
}

/* Global click to close menus + action delegation */
document.addEventListener('click', function(e) {
  if (!e.target.closest('.action-dropdown')) {
    document.querySelectorAll('.action-menu.open').forEach(function(m) {
      m.classList.remove('open');
    });
  }

  /* B1: student action buttons */
  var act = e.target.closest('[data-action="rename"]');
  if (act) { showRenameModal(act.dataset.uid, act.dataset.name, act.dataset.cid); return; }
  act = e.target.closest('[data-action="resetpw"]');
  if (act) { showResetPasswordModal(act.dataset.uid, act.dataset.name); return; }
  act = e.target.closest('[data-action="moveclass"]');
  if (act) { showMoveClassModal(act.dataset.uid, act.dataset.name, act.dataset.cid); return; }

  /* B2: edit class */
  act = e.target.closest('[data-action="editclass"]');
  if (act) { showEditClassModal(act.dataset.cid, act.dataset.cname, act.dataset.grade); return; }

  /* B3: modal confirm actions */
  act = e.target.closest('[data-action="do-rename"]');
  if (act) { doRenameStudent(act.dataset.uid, act.dataset.cid); return; }
  act = e.target.closest('[data-action="do-resetpw"]');
  if (act) { doResetPassword(act.dataset.uid); return; }
  act = e.target.closest('[data-action="do-move"]');
  if (act) { doMoveStudent(act.dataset.uid, act.dataset.cid); return; }
  act = e.target.closest('[data-action="modal-cancel"]');
  if (act) { hideModal(); return; }
});

/* ═══ RENAME STUDENT ═══ */
function showRenameModal(userId, currentName, classId) {
  var html = '<div class="section-title">' + t('Rename Student', '修改姓名') + '</div>' +
    '<label class="settings-label">' + t('New Name', '新姓名') + '</label>' +
    '<input class="auth-input" id="rn-name" type="text" value="' + currentName.replace(/"/g, '&quot;') + '">' +
    '<div id="rn-msg" class="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button class="btn btn-primary" style="flex:1" data-action="do-rename" data-uid="' + userId + '" data-cid="' + classId + '">' + t('Confirm', '确认') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  /* Auto-focus and select */
  setTimeout(function() { var inp = E('rn-name'); if (inp) { inp.focus(); inp.select(); } }, 100);
}

async function doRenameStudent(userId, classId) {
  var newName = E('rn-name').value.trim();
  var msg = E('rn-msg');
  if (!newName) { msg.textContent = t('Please enter a name', '请输入姓名'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Updating...', '更新中...');
  msg.className = 'settings-msg';

  try {
    /* 1. Update class_students */
    var r1 = await sb.from('kw_class_students').update({ student_name: newName }).eq('user_id', userId);
    if (r1.error) throw new Error(r1.error.message);

    /* 2. Update leaderboard nickname */
    var r2 = await sb.from('leaderboard').update({ nickname: newName }).eq('user_id', userId);
    if (r2.error) throw new Error(r2.error.message);

    /* 3. Update auth user_metadata via edge function */
    var r3 = await callEdgeFunction('update-student', { student_user_id: userId, nickname: newName });
    if (r3.error) throw new Error(r3.error);

    hideModal();
    showToast(t('Name updated!', '姓名已更新！'));
    _adminCache = null;
    renderClassDetail(classId);
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ MOVE STUDENT TO ANOTHER CLASS ═══ */
async function showMoveClassModal(userId, studentName, currentClassId) {
  /* Load all classes for this school */
  var res = await _adminSchoolFilter(sb.from('kw_classes')
    .select('id, name, grade'))
    .order('created_at', { ascending: true });
  var classes = (res.data || []).filter(function(c) { return c.id !== currentClassId; });

  if (classes.length === 0) {
    showToast(t('No other classes available', '没有其他班级可供选择'));
    return;
  }

  var opts = '';
  classes.forEach(function(c) {
    var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === c.grade; });
    var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : c.grade;
    opts += '<option value="' + c.id + '" data-grade="' + c.grade + '">' + escapeHtml(c.name) + ' (' + gradeLabel + ')</option>';
  });

  var html = '<div class="section-title">' + t('Move Student', '移动学生') + '</div>' +
    '<p style="font-size:13px;color:var(--c-text2);margin-bottom:12px">' +
    t('Move ', '移动 ') + '<strong>' + studentName + '</strong>' + t(' to:', ' 到：') + '</p>' +
    '<select class="auth-input" id="mc-target">' + opts + '</select>' +
    '<div id="mc-msg" class="settings-msg"></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button class="btn btn-primary" style="flex:1" data-action="do-move" data-uid="' + userId + '" data-cid="' + currentClassId + '">' + t('Confirm', '确认') + '</button>' +
    '<button class="btn btn-ghost" style="flex:1" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doMoveStudent(userId, currentClassId) {
  var sel = E('mc-target');
  var newClassId = sel.value;
  var newGrade = sel.options[sel.selectedIndex].getAttribute('data-grade');
  var msg = E('mc-msg');

  msg.textContent = t('Moving...', '移动中...');
  msg.className = 'settings-msg';

  try {
    /* 1. Update class_students */
    var r1 = await sb.from('kw_class_students').update({ class_id: newClassId }).eq('user_id', userId);
    if (r1.error) throw new Error(r1.error.message);

    /* 2. Update leaderboard (class_id + board) */
    var r2 = await sb.from('leaderboard').update({ class_id: newClassId, board: newGrade }).eq('user_id', userId);
    if (r2.error) throw new Error(r2.error.message);

    /* 3. Update auth user_metadata via edge function */
    var r3 = await callEdgeFunction('update-student', { student_user_id: userId, class_id: newClassId, board: newGrade });
    if (r3.error) throw new Error(r3.error);

    hideModal();
    showToast(t('Student moved!', '学生已移动！'));
    _adminCache = null;
    renderClassDetail(currentClassId);
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ UTILITIES ═══ */
function timeAgo(iso) {
  var diff = Date.now() - new Date(iso).getTime();
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return t('Just now', '刚刚');
  if (mins < 60) return mins + t('m ago', '分钟前');
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + t('h ago', '小时前');
  var days = Math.floor(hrs / 24);
  if (days < 7) return days + t('d ago', '天前');
  return Math.floor(days / 7) + t('w ago', '周前');
}
