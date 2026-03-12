/* ══════════════════════════════════════════════════════════════
   admin.js — Teacher admin panel: classes, students, dashboard
   ══════════════════════════════════════════════════════════════ */

/* isTeacherUser moved to config.js */
var _teacherData = null;   /* { id, school_id, display_name } */
var _schoolData = null;    /* { id, name, code } */
var _adminTab = null; /* set on first render */
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
async function initTeacher(prefetchedData) {
  if (!sb || !isLoggedIn()) return;
  try {
    var data = prefetchedData !== undefined ? prefetchedData : null;
    /* Fallback: query DB if no prefetched data (e.g. called from other paths) */
    if (prefetchedData === undefined) {
      var res = await sb.from('teachers')
        .select('id, school_id, display_name')
        .eq('user_id', currentUser.id).single();
      data = (res.error || !res.data) ? null : res.data;
    }
    if (!data) {
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
    _teacherData = data;
    isTeacherUser = true;
    updateSidebar();
    if (typeof scheduleRenderHome === 'function') scheduleRenderHome();

    /* Load school info */
    var sRes = await sb.from('schools')
      .select('id, name, code')
      .eq('id', _teacherData.school_id)
      .single();
    if (sRes.data) _schoolData = sRes.data;

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

  /* Default tab: super admin → allusers, teacher → classes */
  if (!_adminTab) {
    _adminTab = (typeof isSuperAdmin === 'function' && isSuperAdmin() && !_teacherData) ? 'allusers' : 'classes';
  }

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
    html += '<button class="admin-tab' + (_adminTab === 'users' ? ' active' : '') + '" onclick="switchAdminTab(\'users\')">' + t('Users', '用户管理') + '</button>';
    html += '<button class="admin-tab' + (_adminTab === 'allusers' ? ' active' : '') + '" onclick="switchAdminTab(\'allusers\')">' + t('All Users', '全部用户') + '</button>';
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
  else if (_adminTab === 'users') renderUserManagement();
  else if (_adminTab === 'allusers') renderAllUsers();
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

  var _isSA = !_teacherData && typeof isSuperAdmin === 'function' && isSuperAdmin();
  try {
  var res = await _adminSchoolFilter(sb.from('kw_classes')
    .select('id, name, grade, school_id, created_at'))
    .order('created_at', { ascending: true });
  var classes = res.data || [];

  var activity = await loadActivityData();

  /* Super admin: load school names for labeling */
  var _schoolNames = {};
  if (_isSA && classes.length > 0) {
    var schoolIds = {};
    classes.forEach(function(c) { if (c.school_id) schoolIds[c.school_id] = true; });
    var sids = Object.keys(schoolIds);
    if (sids.length > 0) {
      var sRes = await sb.from('schools').select('id, name').in('id', sids);
      (sRes.data || []).forEach(function(s) { _schoolNames[s.id] = s.name; });
    }
  }

  var html = '';
  if (_teacherData || _isSA) {
    html += '<div class="admin-toolbar">' +
      '<button class="btn btn-primary btn-sm" onclick="showCreateClassModal()">' + t('+ Create Class', '+ 创建班级') + '</button>' +
      '</div>';
  }

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

      cardsHtml += '<div class="admin-class-card" onclick="renderClassDetail(\'' + escapeHtml(c.id) + '\')">';
      cardsHtml += '<div class="admin-class-name">' + escapeHtml(c.name) + '</div>';
      if (_isSA && _schoolNames[c.school_id]) {
        cardsHtml += '<div class="admin-class-school">' + escapeHtml(_schoolNames[c.school_id]) + '</div>';
      }
      cardsHtml += '<div class="admin-class-stats">';
      cardsHtml += '<span>' + count + ' ' + t('students', '学生') + '</span>';
      cardsHtml += '<span>' + t('Avg', '平均') + ' ' + avgPct + '%</span>';
      cardsHtml += '</div>';
      cardsHtml += '<div class="admin-class-bar"><div class="admin-class-bar-fill" style="width:' + avgPct + '%"></div></div>';
      cardsHtml += '</div>';
    });

    var collapsed = _gradeListCollapsed[g.value] !== false;
    html += '<div class="grade-list-section' + (collapsed ? ' collapsed' : '') + '" id="grade-list-' + g.value + '">';
    html += '<div class="grade-list-header" onclick="toggleGradeList(\'' + escapeHtml(g.value) + '\')">';
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

  var saFields = '';
  if (!_teacherData && typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    saFields = '<label class="settings-label">' + t('School', '学校') + '</label>' +
      '<select class="auth-input" id="cc-school" onchange="loadTeachersForSchool(this.value)"><option value="">' + t('Loading schools...', '加载学校...') + '</option></select>' +
      '<label class="settings-label mt-12">' + t('Teacher', '教师') + '</label>' +
      '<select class="auth-input" id="cc-teacher"><option value="">' + t('Select school first', '请先选择学校') + '</option></select>';
  }

  var html = '<div class="section-title">' + t('Create Class', '创建班级') + '</div>' +
    saFields +
    '<label class="settings-label' + (saFields ? ' mt-12' : '') + '">' + t('Class Name', '班级名称') + '</label>' +
    '<input class="auth-input" id="cc-name" type="text" placeholder="' + t('e.g. 7A', '如 7A') + '">' +
    '<label class="settings-label mt-12">' + t('Grade / Year', '年级') + '</label>' +
    '<select class="auth-input" id="cc-grade">' + gradeOpts + '</select>' +
    '<div id="cc-msg" class="settings-msg"></div>' +
    '<div class="btn-row btn-row--mt16">' +
    '<button class="btn btn-primary" onclick="doCreateClass()">' + t('Create', '创建') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);

  /* Super Admin: load schools list */
  if (!_teacherData && typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    sb.from('schools').select('id, name').order('name').then(function(res) {
      var sel = E('cc-school');
      if (!sel) return;
      sel.innerHTML = '<option value="">' + t('-- Select --', '-- 选择 --') + '</option>';
      (res.data || []).forEach(function(s) {
        sel.innerHTML += '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>';
      });
    });
  }
}

/* Helper: load teachers for a given school (used by SA create class modal) */
async function loadTeachersForSchool(schoolId) {
  var sel = E('cc-teacher');
  if (!sel) return;
  if (!schoolId) { sel.innerHTML = '<option value="">' + t('Select school first', '请先选择学校') + '</option>'; return; }
  sel.innerHTML = '<option value="">' + t('Loading...', '加载中...') + '</option>';
  var res = await sb.from('teachers').select('id, display_name').eq('school_id', schoolId);
  sel.innerHTML = '<option value="">' + t('-- Select --', '-- 选择 --') + '</option>';
  (res.data || []).forEach(function(tc) {
    sel.innerHTML += '<option value="' + tc.id + '">' + escapeHtml(tc.display_name) + '</option>';
  });
}

async function doCreateClass() {
  var name = E('cc-name').value.trim();
  var grade = E('cc-grade').value;
  var msg = E('cc-msg');
  if (!name) { msg.textContent = t('Please enter class name', '请输入班级名称'); msg.className = 'settings-msg error'; return; }

  var schoolId, teacherId;
  if (_teacherData) {
    schoolId = _teacherData.school_id;
    teacherId = _teacherData.id;
  } else if (typeof isSuperAdmin === 'function' && isSuperAdmin()) {
    var selSchool = E('cc-school');
    var selTeacher = E('cc-teacher');
    schoolId = selSchool ? selSchool.value : '';
    teacherId = selTeacher ? selTeacher.value : '';
    if (!schoolId) { msg.textContent = t('Please select a school', '请选择学校'); msg.className = 'settings-msg error'; return; }
    if (!teacherId) { msg.textContent = t('Please select a teacher', '请选择教师'); msg.className = 'settings-msg error'; return; }
  } else {
    msg.textContent = t('No permission', '无权限'); msg.className = 'settings-msg error'; return;
  }

  try {
    var res = await sb.from('kw_classes').insert({
      school_id: schoolId,
      teacher_id: teacherId,
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
    '<label class="settings-label mt-12">' + t('Grade / Year', '年级') + '</label>' +
    '<select class="auth-input" id="ec-grade">' + gradeOpts + '</select>' +
    '<div id="ec-msg" class="settings-msg"></div>' +
    '<div class="btn-row btn-row--mt16">' +
    '<button class="btn btn-primary" onclick="doEditClass(\'' + escapeHtml(classId) + '\', \'' + escapeHtml(currentGrade) + '\')">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
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
    '<div class="btn-row btn-row--mt8 btn-row--wrap">' +
    '<button class="btn btn-ghost btn-sm" onclick="addOneBatchRow()">' + t('+ 1 row', '+ 1行') + '</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="addBatchRows()">' + t('+ 5 rows', '+ 5行') + '</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="toggleImportArea()">' + t('\ud83d\udccb Import', '\ud83d\udccb 导入') + '</button>' +
    '</div>' +
    '<div id="import-area" class="d-none mt-8">' +
    '<textarea id="import-csv" class="auth-input font-mono" rows="4" style="font-size:12px" placeholder="' + t('Paste CSV: email, password, name (one per line)', '粘贴 CSV：邮箱, 密码, 姓名（每行一个）') + '"></textarea>' +
    '<button class="btn btn-ghost btn-sm mt-4" onclick="parseImportData()">' + t('Parse & Fill', '解析填入') + '</button>' +
    '</div>' +
    '<div id="batch-msg" class="settings-msg mt-8"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" id="batch-submit" onclick="doBatchCreate(\'' + escapeHtml(classId) + '\')">' + t('Create All', '创建全部') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
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
    ' <button class="btn btn-ghost btn-sm text-sub" style="padding:2px 6px" data-action="editclass" data-cid="' + classId + '" data-cname="' + escapeHtml(cls.name) + '" data-grade="' + cls.grade + '">&#9998;</button></div>' +
    '<button class="btn btn-primary btn-sm" onclick="showBatchCreateModal(\'' + escapeHtml(classId) + '\')">' + t('+ Add Students', '+ 添加学生') + '</button>' +
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
  html += '<div class="flex items-center gap-8 mb-12">';
  html += '<div class="hw-section-title">' + t('Homework', '作业') + '</div>';
  html += '<button class="btn btn-primary btn-sm" onclick="showCreateHwModal(\'' + escapeHtml(classId) + '\')">' + t('+ Assign', '+ 布置作业') + '</button>';
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
    '<p class="text-sm text-sub mb-12">' +
    t('Reset password for: ', '重置学生密码：') + '<strong>' + escapeHtml(name) + '</strong></p>' +
    '<input class="auth-input" id="rp-pass" type="text" placeholder="' + t('New password (min 6 chars)', '新密码（至少6位）') + '">' +
    '<div id="rp-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-action="do-resetpw" data-uid="' + userId + '">' + t('Reset', '重置') + '</button>' +
    '<button class="btn btn-ghost" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
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

    html += '<div class="admin-class-card" onclick="expandGrade(\'' + escapeHtml(g) + '\')">';
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
    html += '<div class="admin-grade-class-header" onclick="renderClassDetail(\'' + escapeHtml(cid) + '\')">';
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
  var _saView = !_teacherData && typeof isSuperAdmin === 'function' && isSuperAdmin();

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

  /* Super admin: per-school breakdown */
  if (_saView) {
    var schoolMap = {};
    activity.forEach(function(s) {
      var sid = s.school_id || 'unknown';
      if (!schoolMap[sid]) schoolMap[sid] = { students: 0, sumPct: 0, classes: {}, active7d: 0 };
      schoolMap[sid].students++;
      schoolMap[sid].sumPct += (s.mastery_pct || 0);
      schoolMap[sid].classes[s.class_id] = true;
      if (s.last_active && (now - new Date(s.last_active).getTime()) < 7 * 86400000) schoolMap[sid].active7d++;
    });
    var schoolIds = Object.keys(schoolMap);
    /* Load school names */
    var _sNames = {};
    if (schoolIds.length > 0) {
      try {
        var sRes = await sb.from('schools').select('id, name').in('id', schoolIds);
        (sRes.data || []).forEach(function(s) { _sNames[s.id] = s.name; });
      } catch(e) {}
    }
    html += '<div class="section-title mt-20">' + t('Schools', '学校') + '</div>';
    html += '<div class="admin-class-grid">';
    schoolIds.forEach(function(sid) {
      var d = schoolMap[sid];
      var avg = d.students > 0 ? Math.round(d.sumPct / d.students) : 0;
      var name = _sNames[sid] || sid;
      html += '<div class="admin-class-card" style="cursor:default">';
      html += '<div class="admin-class-name">' + escapeHtml(name) + '</div>';
      html += '<div class="admin-class-stats"><span>' + Object.keys(d.classes).length + ' ' + t('classes', '班级') + '</span><span>' + d.students + ' ' + t('students', '学生') + '</span></div>';
      html += '<div class="admin-class-stats"><span>' + d.active7d + ' ' + t('active (7d)', '活跃(7天)') + '</span><span>' + t('Avg', '平均') + ' ' + avg + '%</span></div>';
      html += '<div class="admin-class-bar"><div class="admin-class-bar-fill" style="width:' + avg + '%"></div></div>';
      html += '</div>';
    });
    html += '</div>';
  }

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
    html += '<div class="section-title mt-20">' + t('Grade Summary', '年级汇总') + '</div>';
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
    html += '<div class="section-title mt-20">' + t('Top 10 Students', 'Top 10 学生') + '</div>';
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

/* ═══ USER MANAGEMENT (super admin) ═══ */
var _umData = null, _umPage = 1, _umPerPage = 50, _umTotal = 0;
var _umSearch = '', _umRoleFilter = '', _umSort = 'created_at', _umSortAsc = false;
var _umSelected = {}; /* { userId: true } */

async function renderUserManagement() {
  var ct = E('admin-content');
  if (!ct) return;

  if (!_umData) {
    ct.innerHTML = '<div class="admin-loading">' + t('Loading users...', '加载用户...') + '</div>';
    try {
      var res = await callEdgeFunction('list-users', {
        page: _umPage, per_page: 1000, search: _umSearch, role_filter: _umRoleFilter
      });
      if (res.error) throw new Error(res.error);
      _umData = res.users || [];
      _umTotal = res.total || 0;
    } catch (e) {
      ct.innerHTML = '<div class="admin-empty">' + escapeHtml(e.message) + '</div>';
      return;
    }
  }

  _umRenderTable();
}

function _umRenderTable() {
  var ct = E('admin-content');
  if (!ct || !_umData) return;

  var users = _umData;

  /* Summary cards */
  var totalStudents = users.filter(function(u) { return u.role === 'student'; }).length;
  var totalTeachers = users.filter(function(u) { return u.role === 'teacher'; }).length;
  var totalGuests = users.filter(function(u) { return u.role === 'guest' || !u.role; }).length;
  var totalBanned = users.filter(function(u) { return !!u.banned_at; }).length;

  var html = '<div class="admin-summary-grid">';
  html += summaryCard(t('Total Users', '总用户'), users.length, 'var(--c-primary)');
  html += summaryCard(t('Students', '学生'), totalStudents, 'var(--c-info)');
  html += summaryCard(t('Teachers', '教师'), totalTeachers, 'var(--c-success)');
  html += summaryCard(t('Guests', '访客'), totalGuests, 'var(--c-text2)');
  if (totalBanned > 0) html += summaryCard(t('Banned', '封禁'), totalBanned, 'var(--c-danger)');
  html += '</div>';

  /* Role filter pills */
  html += '<div class="dq-board-pills">';
  html += '<button class="dq-pill' + (!_umRoleFilter ? ' active' : '') + '" data-um-filter="">' + t('All', '全部') + ' (' + users.length + ')</button>';
  html += '<button class="dq-pill' + (_umRoleFilter === 'student' ? ' active' : '') + '" data-um-filter="student">' + t('Student', '学生') + ' (' + totalStudents + ')</button>';
  html += '<button class="dq-pill' + (_umRoleFilter === 'teacher' ? ' active' : '') + '" data-um-filter="teacher">' + t('Teacher', '教师') + ' (' + totalTeachers + ')</button>';
  html += '<button class="dq-pill' + (_umRoleFilter === 'guest' ? ' active' : '') + '" data-um-filter="guest">' + t('Guest', '访客') + ' (' + totalGuests + ')</button>';
  html += '</div>';

  /* Search + refresh */
  html += '<div class="admin-filter-bar">';
  html += '<input type="text" class="auth-input" id="um-search" placeholder="' + t('Search email / name...', '搜索邮箱/姓名...') + '" value="' + escapeHtml(_umSearch) + '">';
  html += '<button class="btn btn-ghost btn-sm" data-um-action="refresh">' + t('Refresh', '刷新') + '</button>';
  html += '</div>';

  /* Batch action bar (visible when selection exists) */
  var selCount = Object.keys(_umSelected).length;
  html += '<div class="um-batch-bar' + (selCount > 0 ? ' visible' : '') + '" id="um-batch-bar">';
  html += '<span>' + t('Selected', '已选') + ': <strong>' + selCount + '</strong></span>';
  html += '<button class="btn btn-primary btn-sm" data-um-action="batch-assign">' + t('Batch Assign Class', '批量分配班级') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" data-um-action="batch-role">' + t('Batch Change Role', '批量修改角色') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" data-um-action="batch-clear">' + t('Clear Selection', '清除选择') + '</button>';
  html += '</div>';

  /* Filter locally by role (if pills used after initial load) */
  var filtered = users;
  if (_umRoleFilter) filtered = filtered.filter(function(u) { return u.role === _umRoleFilter; });
  if (_umSearch) {
    var q = _umSearch.toLowerCase();
    filtered = filtered.filter(function(u) {
      return (u.email || '').toLowerCase().indexOf(q) >= 0 || (u.nickname || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  /* Sort */
  var sortKey = _umSort;
  var asc = _umSortAsc;
  filtered.sort(function(a, b) {
    var va = a[sortKey], vb = b[sortKey];
    if (va == null) va = '';
    if (vb == null) vb = '';
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });

  /* Pagination */
  var start = (_umPage - 1) * _umPerPage;
  var pageUsers = filtered.slice(start, start + _umPerPage);
  var totalPages = Math.ceil(filtered.length / _umPerPage) || 1;

  /* Table */
  if (filtered.length === 0) {
    html += '<div class="admin-empty">' + t('No matching users', '无匹配用户') + '</div>';
  } else {
    var cols = [
      { key: 'email', en: 'Email', zh: '邮箱' },
      { key: 'nickname', en: 'Name', zh: '姓名' },
      { key: 'role', en: 'Role', zh: '角色' },
      { key: 'board', en: 'Board', zh: '课程' },
      { key: 'class_name', en: 'Class', zh: '班级' },
      { key: 'school_name', en: 'School', zh: '学校' },
      { key: 'created_at', en: 'Registered', zh: '注册时间' },
      { key: 'last_sign_in_at', en: 'Last Login', zh: '最后登录' }
    ];
    var allPageSelected = pageUsers.length > 0 && pageUsers.every(function(u) { return _umSelected[u.id]; });
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr>';
    html += '<th><input type="checkbox" data-um-action="select-all"' + (allPageSelected ? ' checked' : '') + '></th>';
    html += '<th>#</th>';
    cols.forEach(function(c) {
      var arrow = _umSort === c.key ? (_umSortAsc ? ' ▲' : ' ▼') : '';
      html += '<th style="cursor:pointer" data-um-sort="' + c.key + '">' + t(c.en, c.zh) + arrow + '</th>';
    });
    html += '<th>' + t('Status', '状态') + '</th>';
    html += '<th>' + t('Actions', '操作') + '</th>';
    html += '</tr></thead><tbody>';

    pageUsers.forEach(function(u, i) {
      var regTime = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
      var lastLogin = u.last_sign_in_at ? timeAgo(u.last_sign_in_at) : t('Never', '从未');
      var roleBadge = '<span class="um-badge-role um-role-' + (u.role || 'guest') + '">' + (u.role || 'guest') + '</span>';
      var statusHtml = u.banned_at ? '<span class="um-badge-banned">' + t('Banned', '封禁') + '</span>' : '<span class="um-badge-role um-role-active">' + t('Active', '正常') + '</span>';

      html += '<tr' + (_umSelected[u.id] ? ' class="um-row-selected"' : '') + '>';
      html += '<td><input type="checkbox" data-um-action="select-one" data-uid="' + u.id + '"' + (_umSelected[u.id] ? ' checked' : '') + '></td>';
      html += '<td>' + (start + i + 1) + '</td>';
      html += '<td class="admin-td-name" style="font-size:12px">' + escapeHtml(u.email || '-') + '</td>';
      html += '<td>' + escapeHtml(u.nickname || '-') + '</td>';
      html += '<td>' + roleBadge + '</td>';
      html += '<td>' + escapeHtml(u.board || '-') + '</td>';
      html += '<td>' + escapeHtml(u.class_name || '-') + '</td>';
      html += '<td>' + escapeHtml(u.school_name || '-') + '</td>';
      html += '<td class="admin-td-time">' + regTime + '</td>';
      html += '<td class="admin-td-time">' + lastLogin + '</td>';
      html += '<td>' + statusHtml + '</td>';
      html += '<td><div class="action-dropdown">';
      html += '<button class="btn btn-ghost btn-sm action-trigger" onclick="toggleActionMenu(this)">' + t('Actions', '操作') + ' ▾</button>';
      html += '<div class="action-menu">';
      html += '<button class="action-item" data-um-action="edit" data-uid="' + u.id + '" data-nickname="' + escapeHtml(u.nickname || '') + '" data-board="' + escapeHtml(u.board || '') + '">✏️ ' + t('Edit', '编辑') + '</button>';
      html += '<button class="action-item" data-um-action="resetpw" data-uid="' + u.id + '" data-email="' + escapeHtml(u.email || '') + '">🔑 ' + t('Reset PW', '重置密码') + '</button>';
      html += '<button class="action-item" data-um-action="assign" data-uid="' + u.id + '" data-nickname="' + escapeHtml(u.nickname || u.email || '') + '">📋 ' + t('Assign Class', '分配班级') + '</button>';
      html += '<button class="action-item" data-um-action="role" data-uid="' + u.id + '" data-role="' + (u.role || 'guest') + '">👤 ' + t('Change Role', '修改角色') + '</button>';
      if (u.banned_at) {
        html += '<button class="action-item" data-um-action="unban" data-uid="' + u.id + '" data-email="' + escapeHtml(u.email || '') + '">✅ ' + t('Unban', '解封') + '</button>';
      } else {
        html += '<button class="action-item" data-um-action="ban" data-uid="' + u.id + '" data-email="' + escapeHtml(u.email || '') + '">🚫 ' + t('Ban', '封禁') + '</button>';
      }
      html += '<button class="action-item" style="color:var(--c-danger)" data-um-action="delete" data-uid="' + u.id + '" data-email="' + escapeHtml(u.email || '') + '">🗑️ ' + t('Delete', '删除') + '</button>';
      html += '</div></div></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    /* Pagination */
    html += '<div class="um-pagination">';
    html += '<span>' + t('Showing', '显示') + ' ' + (start + 1) + '-' + Math.min(start + _umPerPage, filtered.length) + ' / ' + filtered.length + '</span>';
    html += '<div>';
    if (_umPage > 1) html += '<button class="btn btn-ghost btn-sm" data-um-action="prev">' + t('Prev', '上一页') + '</button>';
    html += '<span style="margin:0 8px">' + _umPage + ' / ' + totalPages + '</span>';
    if (_umPage < totalPages) html += '<button class="btn btn-ghost btn-sm" data-um-action="next">' + t('Next', '下一页') + '</button>';
    html += '</div></div>';
  }

  ct.innerHTML = html;

  /* Bind search */
  var inp = E('um-search');
  if (inp) {
    inp.addEventListener('input', function() {
      clearTimeout(inp._t);
      inp._t = setTimeout(function() { _umSearch = inp.value.trim(); _umPage = 1; _umRenderTable(); }, 300);
    });
  }
}

/* ── User Management Modals ── */

function showUserEditModal(userId, nickname, board) {
  var boardOpts = '';
  BOARD_OPTIONS.forEach(function(b) {
    boardOpts += '<option value="' + b.value + '"' + (b.value === board ? ' selected' : '') + '>' + t(b.name, b.nameZh) + '</option>';
  });
  var html = '<div class="section-title">' + t('Edit User', '编辑用户') + '</div>' +
    '<label class="settings-label">' + t('Nickname', '昵称') + '</label>' +
    '<input class="auth-input" id="ue-nickname" type="text" value="' + escapeHtml(nickname) + '">' +
    '<label class="settings-label mt-12">' + t('Board', '课程') + '</label>' +
    '<select class="auth-input" id="ue-board">' + boardOpts + '</select>' +
    '<div id="ue-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-edit" data-uid="' + userId + '">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  setTimeout(function() { var inp = E('ue-nickname'); if (inp) { inp.focus(); inp.select(); } }, 100);
}

async function doUserEdit(userId) {
  var nickname = E('ue-nickname').value.trim();
  var board = E('ue-board').value;
  var msg = E('ue-msg');
  if (!nickname) { msg.textContent = t('Please enter a name', '请输入姓名'); msg.className = 'settings-msg error'; return; }
  msg.textContent = t('Updating...', '更新中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: 'update_metadata', user_id: userId, nickname: nickname, board: board });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(t('User updated!', '用户已更新！'));
    _umData = null; renderUserManagement();
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

function showUserResetPwModal(userId, email) {
  var html = '<div class="section-title">' + t('Reset Password', '重置密码') + '</div>' +
    '<p class="text-sm text-sub mb-12">' + escapeHtml(email) + '</p>' +
    '<label class="settings-label">' + t('New Password', '新密码') + '</label>' +
    '<input class="auth-input" id="up-pass" type="text" placeholder="' + t('Min 6 chars', '至少6位') + '">' +
    '<div id="up-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-resetpw" data-uid="' + userId + '">' + t('Reset', '重置') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  setTimeout(function() { var inp = E('up-pass'); if (inp) inp.focus(); }, 100);
}

async function doUserResetPw(userId) {
  var pass = E('up-pass').value;
  var msg = E('up-msg');
  if (!pass || pass.length < 6) { msg.textContent = t('Password must be at least 6 characters', '密码至少6位'); msg.className = 'settings-msg error'; return; }
  msg.textContent = t('Resetting...', '重置中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: 'reset_password', user_id: userId, new_password: pass });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(t('Password reset!', '密码已重置！'));
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

async function showUserAssignClassModal(userId, nickname) {
  /* Load all classes grouped by school */
  var res = await sb.from('kw_classes').select('id, name, grade, school_id, schools(name)').order('created_at', { ascending: true });
  var classes = res.data || [];
  if (classes.length === 0) { showToast(t('No classes available', '没有可用班级')); return; }

  var opts = '';
  classes.forEach(function(c) {
    var schoolName = c.schools ? c.schools.name : '';
    var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === c.grade; });
    var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : c.grade;
    opts += '<option value="' + c.id + '">' + escapeHtml(c.name) + ' — ' + gradeLabel + (schoolName ? ' (' + escapeHtml(schoolName) + ')' : '') + '</option>';
  });

  var html = '<div class="section-title">' + t('Assign to Class', '分配班级') + '</div>' +
    '<p class="text-sm text-sub mb-12">' + escapeHtml(nickname) + '</p>' +
    '<select class="auth-input" id="ua-class">' + opts + '</select>' +
    '<div id="ua-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-assign" data-uid="' + userId + '">' + t('Assign', '分配') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doUserAssignClass(userId) {
  var classId = E('ua-class').value;
  var msg = E('ua-msg');
  msg.textContent = t('Assigning...', '分配中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: 'assign_class', user_id: userId, class_id: classId });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(t('Class assigned!', '班级已分配！'));
    _umData = null; renderUserManagement();
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

function showUserChangeRoleModal(userId, currentRole) {
  var roles = ['student', 'teacher', 'guest'];
  var opts = '';
  roles.forEach(function(r) {
    opts += '<label class="settings-label" style="display:flex;align-items:center;gap:8px;cursor:pointer">' +
      '<input type="radio" name="um-role" value="' + r + '"' + (r === currentRole ? ' checked' : '') + '> ' + r + '</label>';
  });
  var html = '<div class="section-title">' + t('Change Role', '修改角色') + '</div>' +
    opts +
    '<div id="ur-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-role" data-uid="' + userId + '">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doUserChangeRole(userId) {
  var checked = document.querySelector('input[name="um-role"]:checked');
  var msg = E('ur-msg');
  if (!checked) { msg.textContent = t('Select a role', '请选择角色'); msg.className = 'settings-msg error'; return; }
  msg.textContent = t('Updating...', '更新中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: 'change_role', user_id: userId, role: checked.value });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(t('Role updated!', '角色已更新！'));
    _umData = null; renderUserManagement();
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

function showUserBanConfirm(userId, email, isBanned) {
  var action = isBanned ? 'unban' : 'ban';
  var title = isBanned ? t('Unban User', '解封用户') : t('Ban User', '封禁用户');
  var desc = isBanned
    ? t('Are you sure you want to unban ', '确定要解封 ') + email + '?'
    : t('Are you sure you want to ban ', '确定要封禁 ') + email + '?';
  var html = '<div class="section-title">' + title + '</div>' +
    '<p class="text-sm text-sub mb-12">' + desc + '</p>' +
    '<div id="ub-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn ' + (isBanned ? 'btn-primary' : 'btn-danger') + '" data-um-action="do-ban" data-uid="' + userId + '" data-ban-action="' + action + '">' + t('Confirm', '确认') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doUserBan(userId, action) {
  var msg = E('ub-msg');
  msg.textContent = t('Processing...', '处理中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: action, user_id: userId });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(action === 'ban' ? t('User banned', '用户已封禁') : t('User unbanned', '用户已解封'));
    _umData = null; renderUserManagement();
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

function showUserDeleteConfirm(userId, email) {
  var html = '<div class="section-title" style="color:var(--c-danger)">' + t('Delete User', '删除用户') + '</div>' +
    '<p class="text-sm text-sub mb-12">' + t('This will permanently delete the user and all their data. Type the email to confirm:', '此操作将永久删除该用户及其所有数据。请输入邮箱确认：') + '</p>' +
    '<p class="text-sm" style="font-weight:600;margin-bottom:8px">' + escapeHtml(email) + '</p>' +
    '<input class="auth-input" id="ud-confirm" type="text" placeholder="' + t('Type email to confirm', '输入邮箱确认') + '">' +
    '<div id="ud-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-danger" data-um-action="do-delete" data-uid="' + userId + '" data-email="' + escapeHtml(email) + '">' + t('Delete Forever', '永久删除') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
  setTimeout(function() { var inp = E('ud-confirm'); if (inp) inp.focus(); }, 100);
}

async function doUserDelete(userId, email) {
  var confirm = E('ud-confirm').value.trim();
  var msg = E('ud-msg');
  if (confirm !== email) { msg.textContent = t('Email does not match', '邮箱不匹配'); msg.className = 'settings-msg error'; return; }
  msg.textContent = t('Deleting...', '删除中...'); msg.className = 'settings-msg';
  try {
    var res = await callEdgeFunction('admin-update-user', { action: 'delete', user_id: userId });
    if (res.error) throw new Error(res.error);
    hideModal(); showToast(t('User deleted', '用户已删除'));
    _umData = null; renderUserManagement();
  } catch (e) { msg.textContent = e.message; msg.className = 'settings-msg error'; }
}

/* ── Batch Operations ── */

function _umGetSelectedIds() {
  return Object.keys(_umSelected).filter(function(k) { return _umSelected[k]; });
}

function _umToggleSelect(uid, checked) {
  if (checked) _umSelected[uid] = true;
  else delete _umSelected[uid];
  _umRenderTable();
}

function _umSelectAllPage(checked) {
  /* Get current page users after filter/sort */
  var filtered = _umGetFiltered();
  var start = (_umPage - 1) * _umPerPage;
  var pageUsers = filtered.slice(start, start + _umPerPage);
  pageUsers.forEach(function(u) {
    if (checked) _umSelected[u.id] = true;
    else delete _umSelected[u.id];
  });
  _umRenderTable();
}

function _umGetFiltered() {
  var users = _umData || [];
  if (_umRoleFilter) users = users.filter(function(u) { return u.role === _umRoleFilter; });
  if (_umSearch) {
    var q = _umSearch.toLowerCase();
    users = users.filter(function(u) {
      return (u.email || '').toLowerCase().indexOf(q) >= 0 || (u.nickname || '').toLowerCase().indexOf(q) >= 0;
    });
  }
  return users;
}

async function showBatchAssignClassModal() {
  var ids = _umGetSelectedIds();
  if (ids.length === 0) { showToast(t('No users selected', '未选择用户')); return; }

  var res = await sb.from('kw_classes').select('id, name, grade, school_id, schools(name)').order('created_at', { ascending: true });
  var classes = res.data || [];
  if (classes.length === 0) { showToast(t('No classes available', '没有可用班级')); return; }

  var opts = '';
  classes.forEach(function(c) {
    var schoolName = c.schools ? c.schools.name : '';
    var gradeOpt = BOARD_OPTIONS.find(function(o) { return o.value === c.grade; });
    var gradeLabel = gradeOpt ? t(gradeOpt.name, gradeOpt.nameZh) : c.grade;
    opts += '<option value="' + c.id + '">' + escapeHtml(c.name) + ' — ' + gradeLabel + (schoolName ? ' (' + escapeHtml(schoolName) + ')' : '') + '</option>';
  });

  var html = '<div class="section-title">' + t('Batch Assign Class', '批量分配班级') + '</div>' +
    '<p class="text-sm text-sub mb-12">' + t('Assign ', '将 ') + '<strong>' + ids.length + '</strong>' + t(' users to:', ' 个用户分配到：') + '</p>' +
    '<select class="auth-input" id="ba-class">' + opts + '</select>' +
    '<div id="ba-msg" class="settings-msg"></div>' +
    '<div id="ba-progress" style="display:none"><div class="admin-progress" style="margin:8px 0"><div class="admin-progress-fill" id="ba-bar" style="width:0%"></div></div><span id="ba-pct" class="text-sm text-sub"></span></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-batch-assign">' + t('Assign All', '全部分配') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doBatchAssignClass() {
  var classId = E('ba-class').value;
  var msg = E('ba-msg');
  var ids = _umGetSelectedIds();
  var progress = E('ba-progress');
  var bar = E('ba-bar');
  var pct = E('ba-pct');
  progress.style.display = '';

  var ok = 0, fail = 0;
  for (var i = 0; i < ids.length; i++) {
    pct.textContent = (i + 1) + ' / ' + ids.length;
    bar.style.width = Math.round((i + 1) / ids.length * 100) + '%';
    try {
      var res = await callEdgeFunction('admin-update-user', { action: 'assign_class', user_id: ids[i], class_id: classId });
      if (res.error) { fail++; } else { ok++; }
    } catch (e) { fail++; }
  }

  hideModal();
  _umSelected = {};
  showToast(t('Done: ', '完成：') + ok + t(' assigned', ' 已分配') + (fail > 0 ? ', ' + fail + t(' failed', ' 失败') : ''));
  _umData = null; renderUserManagement();
}

async function showBatchChangeRoleModal() {
  var ids = _umGetSelectedIds();
  if (ids.length === 0) { showToast(t('No users selected', '未选择用户')); return; }

  var roles = ['student', 'teacher', 'guest'];
  var opts = '';
  roles.forEach(function(r) {
    opts += '<label class="settings-label" style="display:flex;align-items:center;gap:8px;cursor:pointer">' +
      '<input type="radio" name="ba-role" value="' + r + '"' + (r === 'student' ? ' checked' : '') + '> ' + r + '</label>';
  });

  var html = '<div class="section-title">' + t('Batch Change Role', '批量修改角色') + '</div>' +
    '<p class="text-sm text-sub mb-12">' + t('Change role for ', '修改 ') + '<strong>' + ids.length + '</strong>' + t(' users:', ' 个用户的角色：') + '</p>' +
    opts +
    '<div id="br-msg" class="settings-msg"></div>' +
    '<div id="br-progress" style="display:none"><div class="admin-progress" style="margin:8px 0"><div class="admin-progress-fill" id="br-bar" style="width:0%"></div></div><span id="br-pct" class="text-sm text-sub"></span></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-um-action="do-batch-role">' + t('Apply', '应用') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
    '</div>';
  showModal(html);
}

async function doBatchChangeRole() {
  var checked = document.querySelector('input[name="ba-role"]:checked');
  if (!checked) return;
  var role = checked.value;
  var ids = _umGetSelectedIds();
  var progress = E('br-progress');
  var bar = E('br-bar');
  var pct = E('br-pct');
  progress.style.display = '';

  var ok = 0, fail = 0;
  for (var i = 0; i < ids.length; i++) {
    pct.textContent = (i + 1) + ' / ' + ids.length;
    bar.style.width = Math.round((i + 1) / ids.length * 100) + '%';
    try {
      var res = await callEdgeFunction('admin-update-user', { action: 'change_role', user_id: ids[i], role: role });
      if (res.error) { fail++; } else { ok++; }
    } catch (e) { fail++; }
  }

  hideModal();
  _umSelected = {};
  showToast(t('Done: ', '完成：') + ok + t(' updated', ' 已更新') + (fail > 0 ? ', ' + fail + t(' failed', ' 失败') : ''));
  _umData = null; renderUserManagement();
}

/* ═══ ALL USERS (super admin) ═══ */
var _auData = null;       /* cached leaderboard rows */
var _auSort = 'updated_at'; /* sort column */
var _auSortAsc = false;
var _auFilter = '';       /* board filter: '' = all */
var _auSearch = '';       /* search term */

async function renderAllUsers() {
  var ct = E('admin-content');
  if (!ct) return;

  if (!_auData) {
    ct.innerHTML = '<div class="admin-loading">' + t('Loading all users...', '加载全部用户...') + '</div>';
    try {
      var res = await sb.from('leaderboard')
        .select('user_id, nickname, score, mastery_pct, mastered_words, total_words, rank_emoji, board, school_id, class_id, updated_at')
        .order('updated_at', { ascending: false });
      _auData = res.data || [];
    } catch (e) {
      ct.innerHTML = '<div class="admin-empty">' + escapeHtml(e.message) + '</div>';
      return;
    }
  }

  var users = _auData;

  /* Summary (always on full data) */
  var now = Date.now();
  var active7d = users.filter(function(u) { return u.updated_at && (now - new Date(u.updated_at).getTime()) < 7 * 86400000; }).length;
  var active30d = users.filter(function(u) { return u.updated_at && (now - new Date(u.updated_at).getTime()) < 30 * 86400000; }).length;
  var avgPct = users.length > 0 ? Math.round(users.reduce(function(s, u) { return s + (u.mastery_pct || 0); }, 0) / users.length) : 0;

  var html = '<div class="admin-summary-grid">';
  html += summaryCard(t('Total Users', '总用户'), users.length, 'var(--c-primary)');
  html += summaryCard(t('Active (7d)', '活跃(7天)'), active7d, 'var(--c-success)');
  html += summaryCard(t('Active (30d)', '活跃(30天)'), active30d, 'var(--c-warning)');
  html += summaryCard(t('Avg Mastery', '平均掌握率'), avgPct + '%', 'var(--c-primary-dark)');
  html += '</div>';

  /* Board filter pills */
  var boardMap = {};
  users.forEach(function(u) { var b = u.board || 'unknown'; boardMap[b] = (boardMap[b] || 0) + 1; });
  var boardKeys = Object.keys(boardMap).sort();
  html += '<div class="dq-board-pills">';
  html += '<button class="dq-pill' + (!_auFilter ? ' active' : '') + '" data-au-filter="">' + t('All', '全部') + ' (' + users.length + ')</button>';
  boardKeys.forEach(function(b) {
    html += '<button class="dq-pill' + (_auFilter === b ? ' active' : '') + '" data-au-filter="' + escapeHtml(b) + '">' + escapeHtml(b) + ': ' + boardMap[b] + '</button>';
  });
  html += '</div>';

  /* Search + actions bar */
  html += '<div class="admin-filter-bar">';
  html += '<input type="text" class="auth-input" id="au-search" placeholder="' + t('Search name...', '搜索姓名...') + '" value="' + escapeHtml(_auSearch) + '">';
  html += '<button class="btn btn-ghost btn-sm" data-au-action="refresh">' + t('Refresh', '刷新') + '</button>';
  html += '<button class="btn btn-primary btn-sm" data-au-action="csv">' + t('Export CSV', '导出 CSV') + '</button>';
  html += '</div>';

  /* Apply filter + search */
  var filtered = users;
  if (_auFilter) filtered = filtered.filter(function(u) { return (u.board || 'unknown') === _auFilter; });
  if (_auSearch) {
    var q = _auSearch.toLowerCase();
    filtered = filtered.filter(function(u) { return (u.nickname || '').toLowerCase().indexOf(q) >= 0; });
  }

  /* Sort */
  var sortKey = _auSort;
  var asc = _auSortAsc;
  filtered.sort(function(a, b) {
    var va = a[sortKey], vb = b[sortKey];
    if (va == null) va = sortKey === 'updated_at' ? '' : 0;
    if (vb == null) vb = sortKey === 'updated_at' ? '' : 0;
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });

  /* Table */
  if (filtered.length === 0) {
    html += '<div class="admin-empty">' + t('No matching users', '无匹配用户') + '</div>';
  } else {
    var cols = [
      { key: 'nickname', en: 'Name', zh: '姓名' },
      { key: 'board', en: 'Board', zh: '课程' },
      { key: 'mastery_pct', en: 'Mastery', zh: '掌握率' },
      { key: 'mastered_words', en: 'Words', zh: '词汇' },
      { key: 'score', en: 'Score', zh: '得分' },
      { key: 'updated_at', en: 'Last Active', zh: '最后活跃' }
    ];
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr><th>#</th>';
    cols.forEach(function(c) {
      var arrow = _auSort === c.key ? (_auSortAsc ? ' ▲' : ' ▼') : '';
      html += '<th style="cursor:pointer" data-au-sort="' + c.key + '">' + t(c.en, c.zh) + arrow + '</th>';
    });
    html += '<th>' + t('Rank', '段位') + '</th>';
    html += '</tr></thead><tbody>';

    filtered.forEach(function(u, i) {
      var lastActive = u.updated_at ? timeAgo(u.updated_at) : t('Never', '从未');
      var pct = u.mastery_pct || 0;
      html += '<tr>';
      html += '<td>' + (i + 1) + '</td>';
      html += '<td class="admin-td-name">' + escapeHtml(u.nickname || t('Anonymous', '匿名')) + '</td>';
      html += '<td>' + escapeHtml(u.board || '-') + '</td>';
      html += '<td class="admin-td-mastery">';
      html += '<div class="admin-progress"><div class="admin-progress-fill" style="width:' + pct + '%"></div></div>';
      html += '<span class="admin-pct">' + pct + '%</span></td>';
      html += '<td class="admin-td-words">' + (u.mastered_words || 0) + '/' + (u.total_words || 0) + '</td>';
      html += '<td>' + (u.score || 0) + '</td>';
      html += '<td class="admin-td-time">' + lastActive + '</td>';
      html += '<td>' + (u.rank_emoji || '') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<div class="admin-filter-count">' + t('Showing', '显示') + ' ' + filtered.length + ' / ' + users.length + '</div>';
  }

  ct.innerHTML = html;

  /* Bind search input (debounced) */
  var inp = E('au-search');
  if (inp) {
    inp.addEventListener('input', function() {
      clearTimeout(inp._t);
      inp._t = setTimeout(function() { _auSearch = inp.value.trim(); _auRender(); }, 300);
    });
  }
}

/* Re-render without re-fetching */
function _auRender() { var ct = E('admin-content'); if (ct) renderAllUsers(); }

/* CSV export */
function _auExportCSV() {
  if (!_auData || _auData.length === 0) return;
  var rows = [['Name', 'Board', 'Mastery%', 'Mastered', 'Total', 'Score', 'Rank', 'Last Active'].join(',')];
  _auData.forEach(function(u) {
    rows.push([
      '"' + (u.nickname || '').replace(/"/g, '""') + '"',
      u.board || '',
      u.mastery_pct || 0,
      u.mastered_words || 0,
      u.total_words || 0,
      u.score || 0,
      '"' + (u.rank_emoji || '') + '"',
      u.updated_at || ''
    ].join(','));
  });
  var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'all-users-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast(t('CSV exported', 'CSV 已导出'));
}

/* Event delegation for All Users */
document.addEventListener('click', function(e) {
  var pill = e.target.closest('[data-au-filter]');
  if (pill) { _auFilter = pill.dataset.auFilter; _auRender(); return; }

  var sort = e.target.closest('[data-au-sort]');
  if (sort) {
    var key = sort.dataset.auSort;
    if (_auSort === key) _auSortAsc = !_auSortAsc;
    else { _auSort = key; _auSortAsc = key === 'nickname'; }
    _auRender(); return;
  }

  var act = e.target.closest('[data-au-action]');
  if (!act) return;
  if (act.dataset.auAction === 'refresh') { _auData = null; renderAllUsers(); }
  else if (act.dataset.auAction === 'csv') { _auExportCSV(); }
});

/* Event delegation for User Management */
document.addEventListener('click', function(e) {
  /* Filter pills */
  var pill = e.target.closest('[data-um-filter]');
  if (pill) { _umRoleFilter = pill.dataset.umFilter; _umPage = 1; _umRenderTable(); return; }

  /* Sort headers */
  var sort = e.target.closest('[data-um-sort]');
  if (sort) {
    var key = sort.dataset.umSort;
    if (_umSort === key) _umSortAsc = !_umSortAsc;
    else { _umSort = key; _umSortAsc = key === 'nickname' || key === 'email'; }
    _umRenderTable(); return;
  }

  /* Actions */
  var act = e.target.closest('[data-um-action]');
  if (!act) return;
  var a = act.dataset.umAction;
  if (a === 'refresh') { _umData = null; renderUserManagement(); }
  else if (a === 'prev') { _umPage = Math.max(1, _umPage - 1); _umRenderTable(); }
  else if (a === 'next') { _umPage++; _umRenderTable(); }
  else if (a === 'edit') { showUserEditModal(act.dataset.uid, act.dataset.nickname || '', act.dataset.board || ''); }
  else if (a === 'resetpw') { showUserResetPwModal(act.dataset.uid, act.dataset.email || ''); }
  else if (a === 'assign') { showUserAssignClassModal(act.dataset.uid, act.dataset.nickname || ''); }
  else if (a === 'role') { showUserChangeRoleModal(act.dataset.uid, act.dataset.role || 'guest'); }
  else if (a === 'ban') { showUserBanConfirm(act.dataset.uid, act.dataset.email || '', false); }
  else if (a === 'unban') { showUserBanConfirm(act.dataset.uid, act.dataset.email || '', true); }
  else if (a === 'delete') { showUserDeleteConfirm(act.dataset.uid, act.dataset.email || ''); }
  else if (a === 'do-edit') { doUserEdit(act.dataset.uid); }
  else if (a === 'do-resetpw') { doUserResetPw(act.dataset.uid); }
  else if (a === 'do-assign') { doUserAssignClass(act.dataset.uid); }
  else if (a === 'do-role') { doUserChangeRole(act.dataset.uid); }
  else if (a === 'do-ban') { doUserBan(act.dataset.uid, act.dataset.banAction); }
  else if (a === 'do-delete') { doUserDelete(act.dataset.uid, act.dataset.email || ''); }
  /* Batch actions */
  else if (a === 'batch-assign') { showBatchAssignClassModal(); }
  else if (a === 'batch-role') { showBatchChangeRoleModal(); }
  else if (a === 'batch-clear') { _umSelected = {}; _umRenderTable(); }
  else if (a === 'do-batch-assign') { doBatchAssignClass(); }
  else if (a === 'do-batch-role') { doBatchChangeRole(); }
  /* Checkbox selection */
  else if (a === 'select-all') { _umSelectAllPage(act.checked); }
  else if (a === 'select-one') { _umToggleSelect(act.dataset.uid, act.checked); }
});

function summaryCard(label, value, color) {
  return '<div class="admin-summary-card">' +
    '<div class="admin-summary-val" style="color:' + color + '">' + value + '</div>' +
    '<div class="admin-summary-label">' + label + '</div>' +
    '</div>';
}

/* ═══ ACTION DROPDOWN ═══ */
function _closeAllActionMenus() {
  document.querySelectorAll('.action-menu.open').forEach(function(m) {
    m.classList.remove('open');
  });
}

function toggleActionMenu(btn) {
  var menu = btn.nextElementSibling;
  var wasOpen = menu.classList.contains('open');
  _closeAllActionMenus();
  if (!wasOpen) menu.classList.add('open');
}

/* Global click to close menus + action delegation */
document.addEventListener('click', function(e) {
  if (!e.target.closest('.action-dropdown')) {
    _closeAllActionMenus();
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
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-action="do-rename" data-uid="' + userId + '" data-cid="' + classId + '">' + t('Confirm', '确认') + '</button>' +
    '<button class="btn btn-ghost" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
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
    '<p class="text-sm text-sub mb-12">' +
    t('Move ', '移动 ') + '<strong>' + studentName + '</strong>' + t(' to:', ' 到：') + '</p>' +
    '<select class="auth-input" id="mc-target">' + opts + '</select>' +
    '<div id="mc-msg" class="settings-msg"></div>' +
    '<div class="btn-row">' +
    '<button class="btn btn-primary" data-action="do-move" data-uid="' + userId + '" data-cid="' + currentClassId + '">' + t('Confirm', '确认') + '</button>' +
    '<button class="btn btn-ghost" data-action="modal-cancel">' + t('Cancel', '取消') + '</button>' +
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
