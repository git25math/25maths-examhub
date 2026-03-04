/* ══════════════════════════════════════════════════════════════
   homework.js — Teacher assignments + student test + notifications
   ══════════════════════════════════════════════════════════════ */

/* ═══ NOTIFICATION SYSTEM ═══ */
var _notifCache = null;
var _notifCount = 0;

async function loadNotifications() {
  if (!sb || !isLoggedIn() || isGuest()) return [];
  try {
    var res = await sb.from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50);
    _notifCache = res.data || [];
    _notifCount = _notifCache.filter(function(n) { return !n.is_read; }).length;
    updateNotifBadge();
    return _notifCache;
  } catch (e) {
    return [];
  }
}

function updateNotifBadge() {
  var badges = document.querySelectorAll('.notif-badge');
  badges.forEach(function(b) {
    b.textContent = _notifCount;
    b.style.display = _notifCount > 0 ? 'inline-flex' : 'none';
  });
}

async function sendNotification(userId, type, title, body, linkType, linkId) {
  if (!sb) return;
  try {
    await sb.from('notifications').insert({
      user_id: userId,
      type: type,
      title: title,
      body: body || '',
      link_type: linkType || '',
      link_id: linkId || ''
    });
  } catch (e) { /* ignore */ }
}

async function markNotifRead(id) {
  if (!sb) return;
  try {
    await sb.from('notifications').update({ is_read: true }).eq('id', id);
    if (_notifCache) {
      _notifCache.forEach(function(n) { if (n.id === id) n.is_read = true; });
      _notifCount = _notifCache.filter(function(n) { return !n.is_read; }).length;
      updateNotifBadge();
    }
  } catch (e) { /* ignore */ }
}

async function markAllNotifsRead() {
  if (!sb || !isLoggedIn()) return;
  try {
    await sb.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id).eq('is_read', false);
    if (_notifCache) {
      _notifCache.forEach(function(n) { n.is_read = true; });
      _notifCount = 0;
      updateNotifBadge();
    }
  } catch (e) { /* ignore */ }
}

function showNotifPanel() {
  var notifs = _notifCache || [];
  var html = '<div class="section-title" style="display:flex;align-items:center;gap:8px">';
  html += t('Notifications', '通知');
  if (_notifCount > 0) {
    html += ' <button class="btn btn-ghost btn-sm" onclick="markAllNotifsRead();hideModal()">' + t('Mark all read', '全部已读') + '</button>';
  }
  html += '</div>';

  if (notifs.length === 0) {
    html += '<div style="padding:20px;text-align:center;color:var(--c-text2);font-size:14px">' + t('No notifications', '暂无通知') + '</div>';
  } else {
    html += '<div style="max-height:400px;overflow-y:auto">';
    notifs.forEach(function(n) {
      var unread = !n.is_read;
      var time = n.created_at ? timeAgo(n.created_at) : '';
      html += '<div class="notif-item' + (unread ? ' unread' : '') + '" onclick="handleNotifClick(\'' + n.id + '\', \'' + (n.link_type || '') + '\', \'' + (n.link_id || '') + '\')">';
      html += '<div class="notif-dot' + (unread ? ' active' : '') + '"></div>';
      html += '<div class="notif-content">';
      html += '<div class="notif-title">' + escapeHtml(n.title || '') + '</div>';
      if (n.body) html += '<div class="notif-body">' + escapeHtml(n.body) + '</div>';
      html += '<div class="notif-time">' + time + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  html += '<button class="btn btn-ghost btn-block" style="margin-top:12px" onclick="hideModal()">' + t('Close', '关闭') + '</button>';
  showModal(html);
}

function handleNotifClick(notifId, linkType, linkId) {
  markNotifRead(notifId);
  hideModal();
  if (linkType === 'homework' && linkId) {
    showStudentHwPage();
  } else if (linkType === 'hw_result' && linkId) {
    if (isTeacher()) navTo('admin');
  }
}

/* ═══ TEACHER: CREATE HOMEWORK ═══ */
function showCreateHwModal(classId) {
  var deckHtml = '';
  getVisibleBoards().forEach(function(board) {
    board.categories.forEach(function(cat) {
      var catDecks = [];
      LEVELS.forEach(function(lv, i) {
        if (lv.category === cat.id && isLevelVisible(lv)) {
          catDecks.push({ lv: lv, idx: i });
        }
      });
      if (catDecks.length === 0) return;
      deckHtml += '<div style="margin-bottom:8px">';
      deckHtml += '<div style="font-size:12px;font-weight:600;color:var(--c-text2);margin-bottom:4px">' + cat.emoji + ' ' + catName(cat) + '</div>';
      catDecks.forEach(function(cl) {
        deckHtml += '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:13px;cursor:pointer">';
        deckHtml += '<input type="checkbox" class="hw-deck-cb" value="' + cl.lv.slug + '">';
        deckHtml += lvTitle(cl.lv) + ' (' + Math.floor(cl.lv.vocabulary.length / 2) + ' ' + t('words', '词') + ')';
        deckHtml += '</label>';
      });
      deckHtml += '</div>';
    });
  });

  var nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  var deadlineDefault = nextWeek.toISOString().slice(0, 16);

  var html = '<div class="section-title">' + t('Create Homework', '布置作业') + '</div>';
  html += '<label class="settings-label">' + t('Title', '标题') + '</label>';
  html += '<input class="auth-input" id="hw-title" placeholder="' + t('e.g. Week 3 Vocab Test', '如 第3周词汇测试') + '">';
  html += '<label class="settings-label">' + t('Select Groups', '选择词组') + '</label>';
  html += '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:8px 12px">';
  html += deckHtml;
  html += '</div>';
  html += '<label class="settings-label" style="margin-top:12px">' + t('Deadline', '截止日期') + '</label>';
  html += '<input class="auth-input" id="hw-deadline" type="datetime-local" value="' + deadlineDefault + '">';
  html += '<div id="hw-msg" class="settings-msg" style="margin-top:8px"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  html += '<button class="btn btn-primary" style="flex:1" onclick="doCreateHw(\'' + classId + '\')">' + t('Create', '创建') + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);
}

async function doCreateHw(classId) {
  var title = E('hw-title').value.trim();
  var msg = E('hw-msg');
  var deadline = E('hw-deadline').value;

  var slugs = [];
  document.querySelectorAll('.hw-deck-cb:checked').forEach(function(cb) {
    slugs.push(cb.value);
  });

  if (!title) { msg.textContent = t('Title required', '请填写标题'); msg.className = 'settings-msg error'; return; }
  if (slugs.length === 0) { msg.textContent = t('Select at least 1 group', '至少选择1个词组'); msg.className = 'settings-msg error'; return; }
  if (!deadline) { msg.textContent = t('Deadline required', '请设置截止日期'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Creating...', '创建中...');
  msg.className = 'settings-msg';

  try {
    var res = await sb.from('assignments').insert({
      class_id: classId,
      teacher_id: _teacherData.id,
      title: title,
      deck_slugs: slugs,
      deadline: new Date(deadline).toISOString()
    });
    if (res.error) throw new Error(res.error.message);

    /* Send notifications to all students in this class (batch INSERT) */
    var csRes = await sb.from('class_students').select('user_id').eq('class_id', classId);
    var students = csRes.data || [];
    if (students.length > 0) {
      var notifRows = students.map(function(s) {
        return {
          user_id: s.user_id,
          type: 'homework',
          title: t('New homework: ', '新作业：') + title,
          body: t('Deadline: ', '截止日期：') + new Date(deadline).toLocaleDateString(),
          link_type: 'homework',
          link_id: ''
        };
      });
      try { await sb.from('notifications').insert(notifRows); } catch (e) { /* ignore */ }
    }

    hideModal();
    showToast(t('Homework created!', '作业已创建！'));
    renderClassDetail(classId);
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ TEACHER: CREATE CUSTOM ERROR-WORD ASSIGNMENT ═══ */
var _pendingCustomHwData = null;
function showCreateCustomHwFromCache() {
  if (!_pendingCustomHwData) return;
  var d = _pendingCustomHwData;
  showCreateCustomHwModal(d.classId, d.userId, d.name, d.words);
}

function showCreateCustomHwModal(classId, studentUserId, studentName, wrongWords) {
  /* wrongWords: [{word, def}] - max 10 */
  var wordsToUse = wrongWords.slice(0, 10);

  var html = '<div class="section-title">' + t('Custom Vocab Assignment', '自定义错词作业') + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-bottom:12px">' + t('For: ', '学生：') + '<strong>' + studentName + '</strong></div>';
  html += '<label class="settings-label">' + t('Title', '标题') + '</label>';
  html += '<input class="auth-input" id="chw-title" value="' + t('Error Words Review', '错词复习') + '">';

  html += '<label class="settings-label">' + t('Words', '词汇') + ' (' + wordsToUse.length + '/' + t('max 10', '最多10') + ')</label>';
  html += '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:8px 12px">';
  wordsToUse.forEach(function(w, i) {
    html += '<label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:13px;cursor:pointer">';
    html += '<input type="checkbox" class="chw-word-cb" data-word="' + escapeHtml(w.word || '').replace(/"/g, '&quot;') + '" data-def="' + escapeHtml(w.def || '').replace(/"/g, '&quot;') + '" checked>';
    html += '<strong>' + escapeHtml(w.word || '') + '</strong> — ' + escapeHtml(w.def || '');
    html += '</label>';
  });
  html += '</div>';

  var nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 3);
  html += '<label class="settings-label" style="margin-top:12px">' + t('Deadline', '截止日期') + '</label>';
  html += '<input class="auth-input" id="chw-deadline" type="datetime-local" value="' + nextWeek.toISOString().slice(0, 16) + '">';
  html += '<div id="chw-msg" class="settings-msg" style="margin-top:8px"></div>';
  html += '<div style="display:flex;gap:8px;margin-top:12px">';
  html += '<button class="btn btn-primary" style="flex:1" onclick="doCreateCustomHw(\'' + classId + '\', \'' + studentUserId + '\')">' + t('Assign', '布置') + '</button>';
  html += '<button class="btn btn-ghost" style="flex:1" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);
}

async function doCreateCustomHw(classId, studentUserId) {
  var title = E('chw-title').value.trim();
  var deadline = E('chw-deadline').value;
  var msg = E('chw-msg');

  if (!title) { msg.textContent = t('Title required', '请填写标题'); msg.className = 'settings-msg error'; return; }
  if (!deadline) { msg.textContent = t('Deadline required', '请设置截止日期'); msg.className = 'settings-msg error'; return; }

  /* Collect selected words */
  var vocab = [];
  var id = 1;
  document.querySelectorAll('.chw-word-cb:checked').forEach(function(cb) {
    vocab.push({ id: id, type: 'word', content: cb.getAttribute('data-word') });
    vocab.push({ id: id, type: 'def', content: cb.getAttribute('data-def') });
    id++;
  });

  if (vocab.length < 4) { msg.textContent = t('Select at least 2 words', '至少选择2个词'); msg.className = 'settings-msg error'; return; }
  if (id > 11) { msg.textContent = t('Max 10 words allowed', '最多选择10个词'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Creating...', '创建中...');
  msg.className = 'settings-msg';

  try {
    var res = await sb.from('assignments').insert({
      class_id: classId,
      teacher_id: _teacherData.id,
      title: title,
      deck_slugs: [],
      custom_vocabulary: vocab,
      deadline: new Date(deadline).toISOString()
    });
    if (res.error) throw new Error(res.error.message);

    /* Notify student */
    await sendNotification(studentUserId, 'homework',
      t('Custom assignment: ', '个性化作业：') + title,
      t('Your teacher created a targeted review for you', '老师为你创建了针对性复习作业'),
      'homework', '');

    hideModal();
    showToast(t('Custom assignment created!', '自定义作业已创建！'));
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ TEACHER: HOMEWORK LIST IN CLASS DETAIL ═══ */
async function renderClassHwList(classId) {
  var ct = E('hw-list-area');
  if (!ct) return;

  try {
    var res = await sb.from('assignments')
      .select('*')
      .eq('class_id', classId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    var hws = res.data || [];

    if (hws.length === 0) {
      ct.innerHTML = '<div style="font-size:13px;color:var(--c-text2);padding:8px 0">' + t('No homework yet', '暂无作业') + '</div>';
      return;
    }

    /* Batch fetch all assignment results (avoid N+1) */
    var hwIds = hws.map(function(h) { return h.id; });
    var rRes = await sb.from('assignment_results')
      .select('assignment_id, user_id, completed_at')
      .in('assignment_id', hwIds);
    var allResults = rRes.data || [];
    var resultsByHw = {};
    allResults.forEach(function(r) {
      if (!resultsByHw[r.assignment_id]) resultsByHw[r.assignment_id] = [];
      resultsByHw[r.assignment_id].push(r);
    });

    var html = '';
    for (var i = 0; i < hws.length; i++) {
      var hw = hws[i];
      var deadline = new Date(hw.deadline).toLocaleDateString();
      var isOverdue = new Date(hw.deadline) < new Date();
      var isCustom = hw.custom_vocabulary && hw.custom_vocabulary.length > 0;

      var results = resultsByHw[hw.id] || [];
      var completed = results.filter(function(r) { return r.completed_at; }).length;

      html += '<div class="hw-list-item">';
      html += '<span class="hw-list-title">' + (isCustom ? '\ud83c\udfaf ' : '') + escapeHtml(hw.title) + '</span>';
      html += '<span class="hw-list-deadline" style="' + (isOverdue ? 'color:var(--c-danger)' : '') + '">' + deadline + '</span>';
      html += '<span class="hw-list-rate">' + completed + ' ' + t('done', '完成') + '</span>';
      html += '<button class="btn btn-ghost btn-sm" onclick="renderHwProgress(\'' + hw.id + '\', \'' + classId + '\')">' + t('Detail', '详情') + '</button>';
      html += '<button class="btn btn-ghost btn-sm" style="color:var(--c-danger)" onclick="deleteHw(\'' + hw.id + '\', \'' + classId + '\')">' + t('Del', '删') + '</button>';
      html += '</div>';
    }

    ct.innerHTML = html;
  } catch (e) {
    ct.innerHTML = '<div style="color:var(--c-danger);font-size:13px">' + escapeHtml(e.message) + '</div>';
  }
}

/* ═══ TEACHER: HOMEWORK PROGRESS VIEW (with student drill-down) ═══ */
async function renderHwProgress(hwId, classId) {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  try {
    var aRes = await sb.from('assignments').select('*').eq('id', hwId).single();
    var hw = aRes.data;
    if (!hw) { ct.innerHTML = '<div class="admin-empty">Not found</div>'; return; }

    var activity = await loadActivityData(true);
    var students = activity.filter(function(s) { return s.class_id === classId; });

    var rRes = await sb.from('assignment_results').select('*').eq('assignment_id', hwId);
    var results = rRes.data || [];
    var resultMap = {};
    results.forEach(function(r) { resultMap[r.user_id] = r; });

    /* Overall stats */
    var doneCount = results.filter(function(r) { return r.completed_at; }).length;
    var totalStudents = students.length;
    var avgScore = 0;
    if (doneCount > 0) {
      var sumPct = 0;
      results.forEach(function(r) {
        if (r.completed_at && r.total_count > 0) sumPct += Math.round(r.correct_count / r.total_count * 100);
      });
      avgScore = Math.round(sumPct / doneCount);
    }

    var html = '<div class="admin-detail-header">';
    html += '<button class="btn btn-ghost btn-sm" onclick="renderClassDetail(\'' + classId + '\')">' + t('\u2190 Back', '\u2190 返回') + '</button>';
    html += '<div class="admin-detail-title">' + escapeHtml(hw.title) + '</div>';
    html += '</div>';

    /* Summary cards */
    html += '<div class="admin-summary-grid" style="margin-bottom:16px">';
    html += summaryCard(t('Completed', '已完成'), doneCount + '/' + totalStudents, 'var(--c-success)');
    html += summaryCard(t('Avg Score', '平均分'), avgScore + '%', 'var(--c-primary)');
    html += summaryCard(t('Deadline', '截止'), new Date(hw.deadline).toLocaleDateString(), new Date(hw.deadline) < new Date() ? 'var(--c-danger)' : 'var(--c-text2)');
    html += '</div>';

    /* Student results table — clickable rows */
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr>';
    html += '<th>' + t('Name', '姓名') + '</th>';
    html += '<th>' + t('Status', '状态') + '</th>';
    html += '<th>' + t('Score', '成绩') + '</th>';
    html += '<th>' + t('Accuracy', '正确率') + '</th>';
    html += '<th>' + t('Attempts', '尝试') + '</th>';
    html += '<th>' + t('Wrong Words', '错词') + '</th>';
    html += '<th>' + t('Action', '操作') + '</th>';
    html += '</tr></thead><tbody>';

    students.forEach(function(s) {
      var r = resultMap[s.user_id];
      var done = r && r.completed_at;
      var status = done ? t('Done', '完成') : t('Pending', '未完成');
      var statusStyle = done ? 'color:var(--c-success)' : 'color:var(--c-warning)';
      var score = r ? r.correct_count + '/' + r.total_count : '-';
      var pct = (r && r.total_count > 0) ? Math.round(r.correct_count / r.total_count * 100) + '%' : '-';
      var attempts = r ? r.attempts : 0;
      var wrongCount = (r && r.wrong_words) ? r.wrong_words.length : 0;
      var safeName = (s.student_name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');

      html += '<tr>';
      html += '<td class="admin-td-name">' + escapeHtml(s.student_name || '-') + '</td>';
      html += '<td style="' + statusStyle + ';font-weight:600">' + status + '</td>';
      html += '<td>' + score + '</td>';
      html += '<td>' + pct + '</td>';
      html += '<td>' + attempts + '</td>';
      html += '<td>' + (wrongCount > 0 ? '<span style="color:var(--c-danger)">' + wrongCount + '</span>' : '-') + '</td>';
      html += '<td>';
      if (r && wrongCount > 0) {
        html += '<button class="btn btn-ghost btn-sm" onclick="showStudentHwDetail(\'' + hwId + '\', \'' + s.user_id + '\', \'' + safeName + '\', \'' + classId + '\')">' + t('View', '查看') + '</button>';
      }
      html += '</td>';
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    ct.innerHTML = html;
  } catch (e) {
    ct.innerHTML = '<div class="admin-empty">' + e.message + '</div>';
  }
}

/* ═══ TEACHER: PER-STUDENT HOMEWORK DETAIL ═══ */
async function showStudentHwDetail(hwId, studentUserId, studentName, classId) {
  var rRes = await sb.from('assignment_results').select('*')
    .eq('assignment_id', hwId).eq('user_id', studentUserId).single();
  var r = rRes.data;
  if (!r) { showToast(t('No data', '无数据')); return; }

  var pct = r.total_count > 0 ? Math.round(r.correct_count / r.total_count * 100) : 0;
  var wrongWords = r.wrong_words || [];

  var html = '<div class="section-title">' + escapeHtml(studentName) + ' — ' + t('Homework Detail', '作业详情') + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-bottom:16px">';
  html += t('Score: ', '成绩：') + '<strong>' + r.correct_count + '/' + r.total_count + ' (' + pct + '%)</strong><br>';
  html += t('Attempts: ', '尝试次数：') + r.attempts + '<br>';
  html += t('Last attempt: ', '最后尝试：') + (r.last_attempt_at ? new Date(r.last_attempt_at).toLocaleString() : '-');
  html += '</div>';

  if (wrongWords.length > 0) {
    html += '<label class="settings-label" style="color:var(--c-danger)">' + t('Wrong Words', '错词') + ' (' + wrongWords.length + ')</label>';
    html += '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:8px 12px;margin-bottom:12px">';
    wrongWords.forEach(function(w) {
      html += '<div style="padding:4px 0;font-size:13px;border-bottom:1px solid var(--c-border-light)">';
      html += '<strong>' + escapeHtml(w.word || '') + '</strong> — ' + escapeHtml(w.def || '');
      html += '</div>';
    });
    html += '</div>';

    _pendingCustomHwData = { classId: classId, userId: studentUserId, name: studentName, words: wrongWords };
    html += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px" onclick="hideModal();showCreateCustomHwFromCache()">';
    html += t('Create error-word assignment', '布置错词作业');
    html += '</button>';
  } else {
    html += '<div style="font-size:13px;color:var(--c-success);margin-bottom:12px">' + t('No wrong words!', '没有错词！') + '</div>';
  }

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()">' + t('Close', '关闭') + '</button>';
  showModal(html);
}

async function deleteHw(hwId, classId) {
  if (!confirm(t('Delete this homework?', '确定删除此作业？'))) return;
  try {
    await sb.from('assignments').update({ is_deleted: true }).eq('id', hwId);
    showToast(t('Deleted!', '已删除！'));
    renderClassDetail(classId);
  } catch (e) {
    showToast(t('Delete failed', '删除失败'));
  }
}

/* ═══ STUDENT: LOAD MY HOMEWORK ═══ */
async function loadMyHomework() {
  if (!sb || !isLoggedIn() || isGuest() || !userClassId) return [];
  try {
    var res = await sb.from('assignments')
      .select('*')
      .eq('class_id', userClassId)
      .eq('is_deleted', false)
      .order('deadline', { ascending: true });
    var hws = res.data || [];

    var rRes = await sb.from('assignment_results')
      .select('*')
      .eq('user_id', currentUser.id);
    var results = rRes.data || [];
    var resultMap = {};
    results.forEach(function(r) { resultMap[r.assignment_id] = r; });

    return hws.map(function(hw) {
      hw._result = resultMap[hw.id] || null;
      return hw;
    });
  } catch (e) {
    return [];
  }
}

/* ═══ STUDENT: HOMEWORK BANNER ON HOME (compact) ═══ */
async function renderHomeworkBanner() {
  var el = E('hw-banner');
  if (!el) return;

  var hws = await loadMyHomework();
  var pending = hws.filter(function(hw) {
    return !(hw._result && hw._result.completed_at);
  });

  if (pending.length === 0) { el.innerHTML = ''; return; }

  var html = '<div class="hw-banner" onclick="showStudentHwPage()">';
  html += '<div class="hw-banner-title">\ud83d\udcdd ' + t('Homework', '待完成作业') + ' (' + pending.length + ') <span style="font-weight:400;font-size:12px;color:var(--c-text2)">' + t('Tap to view all', '点击查看全部') + ' \u2192</span></div>';
  pending.slice(0, 3).forEach(function(hw) {
    var deadline = new Date(hw.deadline);
    var isOverdue = deadline < new Date();
    var dateStr = deadline.toLocaleDateString();
    var hasResult = hw._result && hw._result.attempts > 0;

    html += '<div class="hw-banner-item" onclick="event.stopPropagation();startHwTest(\'' + hw.id + '\')">';
    html += '<span>' + escapeHtml(hw.title) + '</span>';
    if (hasResult) {
      html += '<span class="hw-banner-status pending">' + hw._result.correct_count + '/' + hw._result.total_count + '</span>';
    }
    html += '<span class="hw-banner-deadline" style="' + (isOverdue ? 'color:var(--c-danger)' : '') + '">' + dateStr + '</span>';
    html += '</div>';
  });
  if (pending.length > 3) {
    html += '<div style="font-size:12px;color:var(--c-text2);padding:4px 12px">+' + (pending.length - 3) + ' ' + t('more', '更多') + '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

/* ═══ STUDENT: FULL HOMEWORK PAGE ═══ */
async function showStudentHwPage() {
  showPanel('homework');
  var el = E('panel-homework');
  if (!el) return;
  el.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  var hws = await loadMyHomework();

  var pending = hws.filter(function(hw) {
    return !(hw._result && hw._result.completed_at);
  });
  var completed = hws.filter(function(hw) {
    return hw._result && hw._result.completed_at;
  });

  var html = '<div class="hw-header">';
  html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
  html += '<div class="deck-title">' + t('My Homework', '我的作业') + '</div>';
  html += '</div>';

  /* Pending section */
  html += '<div class="hw-section-title" style="margin-top:8px">' + t('Pending', '待完成') + ' (' + pending.length + ')</div>';
  if (pending.length === 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);padding:12px 0">' + t('All done!', '全部完成！') + ' \ud83c\udf89</div>';
  }
  pending.forEach(function(hw) {
    var deadline = new Date(hw.deadline);
    var isOverdue = deadline < new Date();
    var hasResult = hw._result && hw._result.attempts > 0;
    var pct = (hasResult && hw._result.total_count > 0) ? Math.round(hw._result.correct_count / hw._result.total_count * 100) : 0;
    var isCustom = hw.custom_vocabulary && hw.custom_vocabulary.length > 0;

    html += '<div class="hw-list-item" style="cursor:pointer" onclick="startHwTest(\'' + hw.id + '\')">';
    html += '<span class="hw-list-title">' + (isCustom ? '\ud83c\udfaf ' : '') + escapeHtml(hw.title) + '</span>';
    if (hasResult) {
      html += '<span style="font-size:12px;color:var(--c-primary);font-weight:600">' + pct + '%</span>';
    }
    html += '<span class="hw-list-deadline" style="' + (isOverdue ? 'color:var(--c-danger)' : '') + '">';
    html += (isOverdue ? t('Overdue', '已逾期') + ' ' : '') + deadline.toLocaleDateString();
    html += '</span>';
    html += '<span style="color:var(--c-primary);font-size:13px">GO \u2192</span>';
    html += '</div>';
  });

  /* Completed section */
  html += '<div class="hw-section-title" style="margin-top:20px">' + t('Completed', '已完成') + ' (' + completed.length + ')</div>';
  completed.forEach(function(hw) {
    var r = hw._result;
    var pct = r.total_count > 0 ? Math.round(r.correct_count / r.total_count * 100) : 0;
    var completedDate = r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '';
    var isCustom = hw.custom_vocabulary && hw.custom_vocabulary.length > 0;

    /* Study suggestion based on score */
    var tip = '';
    if (pct >= 90) tip = t('Excellent! Move to next topic', '很棒！可以继续下一专题');
    else if (pct >= 70) tip = t('Good! Review wrong words', '不错！复习一下错词');
    else tip = t('Keep practicing this group', '继续练习这个词组');

    html += '<div class="hw-list-item" style="flex-wrap:wrap">';
    html += '<span class="hw-list-title">' + (isCustom ? '\ud83c\udfaf ' : '') + escapeHtml(hw.title) + '</span>';
    html += '<span style="font-size:12px;font-weight:600;color:' + (pct >= 70 ? 'var(--c-success)' : 'var(--c-warning)') + '">' + r.correct_count + '/' + r.total_count + ' (' + pct + '%)</span>';
    html += '<span class="hw-list-deadline">' + completedDate + '</span>';
    html += '<button class="btn btn-ghost btn-sm" onclick="startHwTest(\'' + hw.id + '\')">' + t('Retry', '重做') + '</button>';
    html += '<div style="width:100%;font-size:11px;color:var(--c-text2);margin-top:4px">\ud83d\udca1 ' + tip + '</div>';
    html += '</div>';
  });

  if (hws.length === 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);padding:24px 0;text-align:center">' + t('No homework assigned yet', '还没有作业') + '</div>';
  }

  el.innerHTML = html;
}

/* ═══ STUDENT: HOMEWORK TEST ═══ */
var _hwTest = null;

async function startHwTest(hwId) {
  showPanel('homework');
  var el = E('panel-homework');
  if (!el) return;
  el.innerHTML = '<div class="admin-loading">' + t('Loading homework...', '加载作业中...') + '</div>';

  try {
    var aRes = await sb.from('assignments').select('*').eq('id', hwId).single();
    var hw = aRes.data;
    if (!hw) { el.innerHTML = '<div class="admin-empty">Not found</div>'; return; }

    var words = [];

    /* Custom vocabulary assignment */
    if (hw.custom_vocabulary && hw.custom_vocabulary.length > 0) {
      var pairs = getPairs(hw.custom_vocabulary);
      pairs.forEach(function(p) {
        words.push({ word: p.word, def: p.def, levelIdx: -1, lid: p.lid });
      });
    } else {
      /* Standard deck_slugs assignment */
      hw.deck_slugs.forEach(function(slug) {
        for (var i = 0; i < LEVELS.length; i++) {
          if (LEVELS[i].slug === slug) {
            var pairs = getPairs(LEVELS[i].vocabulary);
            pairs.forEach(function(p) {
              words.push({ word: p.word, def: p.def, levelIdx: i, lid: p.lid });
            });
            break;
          }
        }
      });
    }

    if (words.length === 0) {
      el.innerHTML = '<div class="admin-empty">' + t('No words found', '未找到词汇') + '</div>';
      return;
    }

    words = shuffle(words);

    _hwTest = {
      hwId: hwId,
      title: hw.title,
      words: words,
      idx: 0,
      correct: 0,
      total: words.length,
      answers: [],
      wrongWords: []
    };

    renderHwQuestion();
  } catch (e) {
    el.innerHTML = '<div class="admin-empty">' + e.message + '</div>';
  }
}

function renderHwQuestion() {
  var el = E('panel-homework');
  if (!el || !_hwTest) return;

  var t_ = _hwTest;
  if (t_.idx >= t_.total) {
    finishHwTest();
    return;
  }

  var w = t_.words[t_.idx];
  var progressPct = Math.round(t_.idx / t_.total * 100);

  var isEn2Zh = Math.random() < 0.5;
  var prompt = isEn2Zh ? w.word : w.def;
  var answer = isEn2Zh ? w.def : w.word;

  var pool = [];
  t_.words.forEach(function(other) {
    var val = isEn2Zh ? other.def : other.word;
    if (val !== answer) pool.push(val);
  });
  pool = shuffle(pool).slice(0, 3);
  var options = shuffle(pool.concat([answer]));

  var html = '<div class="hw-header">';
  html += '<button class="back-btn" onclick="navTo(\'home\')">\u2190</button>';
  html += '<div class="deck-title">' + escapeHtml(t_.title) + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-left:auto">' + (t_.idx + 1) + '/' + t_.total + '</div>';
  html += '</div>';

  html += '<div class="hw-progress-bar"><div class="hw-progress-fill" style="width:' + progressPct + '%"></div></div>';
  html += '<div class="hw-question-word">' + escapeHtml(prompt) + '</div>';

  html += '<div class="hw-options">';
  options.forEach(function(opt) {
    html += '<button class="hw-option" onclick="pickHwAnswer(this, ' + JSON.stringify(opt === answer) + ', ' + JSON.stringify(answer).replace(/"/g, '&quot;') + ')">' + escapeHtml(opt) + '</button>';
  });
  html += '</div>';

  el.innerHTML = html;
}

function pickHwAnswer(btn, isCorrect, correctAnswer) {
  if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;

  var opts = document.querySelectorAll('.hw-option');
  opts.forEach(function(o) { o.classList.add('disabled'); });

  var w = _hwTest.words[_hwTest.idx];

  if (isCorrect) {
    btn.classList.add('correct');
    _hwTest.correct++;
    playCorrect();
  } else {
    btn.classList.add('wrong');
    opts.forEach(function(o) {
      if (o.textContent === correctAnswer) o.classList.add('correct');
    });
    playWrong();
    /* Track wrong word */
    _hwTest.wrongWords.push({ word: w.word, def: w.def });
  }

  _hwTest.answers.push({ word: w.word, def: w.def, correct: isCorrect });
  _hwTest.idx++;

  setTimeout(function() {
    renderHwQuestion();
  }, 800);
}

async function finishHwTest() {
  var el = E('panel-homework');
  if (!el || !_hwTest) return;

  var t_ = _hwTest;
  var pct = t_.total > 0 ? Math.round(t_.correct / t_.total * 100) : 0;

  /* Upsert result to DB */
  try {
    var now = new Date().toISOString();
    var existing = await sb.from('assignment_results')
      .select('attempts')
      .eq('assignment_id', t_.hwId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    var resultData = {
      assignment_id: t_.hwId,
      user_id: currentUser.id,
      attempts: (existing.data ? (existing.data.attempts || 0) : 0) + 1,
      correct_count: t_.correct,
      total_count: t_.total,
      wrong_words: t_.wrongWords,
      completed_at: now,
      last_attempt_at: now
    };

    await sb.from('assignment_results').upsert(resultData, { onConflict: 'assignment_id,user_id' });

    /* Notify teacher about completion */
    var aRes = await sb.from('assignments').select('teacher_id').eq('id', t_.hwId).single();
    if (aRes.data) {
      var tRes = await sb.from('teachers').select('user_id').eq('id', aRes.data.teacher_id).single();
      if (tRes.data) {
        await sendNotification(tRes.data.user_id, 'hw_result',
          getDisplayName() + ' ' + t('completed homework', '完成了作业'),
          t_.title + ' — ' + t_.correct + '/' + t_.total + ' (' + pct + '%)',
          'hw_result', t_.hwId);
      }
    }
  } catch (e) { /* ignore */ }

  /* Show result screen */
  var resultHtml = resultScreenHTML(
    t_.correct, t_.total,
    'startHwTest(\'' + t_.hwId + '\')',
    'showStudentHwPage()',
    'homework'
  );

  /* Add wrong words review section */
  if (t_.wrongWords.length > 0) {
    resultHtml += '<div style="margin-top:16px;text-align:left">';
    resultHtml += '<div class="hw-section-title" style="color:var(--c-danger)">' + t('Wrong Words', '错词') + ' (' + t_.wrongWords.length + ')</div>';
    t_.wrongWords.forEach(function(w) {
      resultHtml += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--c-border-light)">';
      resultHtml += '<strong>' + escapeHtml(w.word) + '</strong> — ' + escapeHtml(w.def);
      resultHtml += '</div>';
    });
    resultHtml += '<div style="font-size:12px;color:var(--c-text2);margin-top:8px">\ud83d\udca1 ' + t('Try reviewing these words in Study mode', '建议在学习模式中复习这些词') + '</div>';
    resultHtml += '</div>';
  }

  el.innerHTML = resultHtml;
  _hwTest = null;
}
