/* ══════════════════════════════════════════════════════════════
   vocab-admin.js — Super admin vocabulary CRUD + feedback panel
   ══════════════════════════════════════════════════════════════ */

/* ═══ INLINE BUTTONS (called from mastery.js renderHome) ═══ */
function vocabAdminBtns(idx) {
  return '<span class="deck-row-admin" onclick="event.stopPropagation()">' +
    '<button onclick="showEditDeckModal(' + idx + ')" title="Edit">&#9998;</button>' +
    '<button onclick="confirmDeleteDeck(' + idx + ')" title="Delete">&#128465;</button>' +
    '</span>';
}

function vocabAdminAddBtn(boardId, catId) {
  return '<div class="va-add-row" onclick="showAddDeckModal(\'' + boardId + '\', \'' + catId + '\')">' +
    '+ ' + t('Add group', '添加词组') +
    '</div>';
}

/* ═══ EDIT DECK MODAL ═══ */
function showEditDeckModal(idx) {
  var lv = LEVELS[idx];
  var pairs = getPairs(lv.vocabulary);

  var html = '<div class="section-title">' + t('Edit Group', '编辑词组') + '</div>';
  html += '<label class="settings-label">' + t('Title (EN)', '标题 (英)') + '</label>';
  html += '<input class="auth-input" id="va-title" value="' + (lv.title || '').replace(/"/g, '&quot;') + '">';
  html += '<label class="settings-label">' + t('Title (ZH)', '标题 (中)') + '</label>';
  html += '<input class="auth-input" id="va-title-zh" value="' + (lv.titleZh || '').replace(/"/g, '&quot;') + '">';

  /* Card table */
  html += '<div style="margin-top:12px;max-height:300px;overflow-y:auto">';
  html += '<table class="va-card-table">';
  html += '<thead><tr><th>#</th><th>' + t('Word', '词') + '</th><th>' + t('Definition', '释义') + '</th><th></th></tr></thead>';
  html += '<tbody id="va-cards">';
  pairs.forEach(function(p, i) {
    html += vaCardRow(i, p.word || '', p.def || '');
  });
  html += '</tbody></table></div>';
  html += '<button class="btn btn-ghost btn-sm mt-8" onclick="vaAddCard()">+ ' + t('Add word', '添加词') + '</button>';

  html += '<div id="va-msg" class="settings-msg mt-8"></div>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" onclick="vaSaveDeck(' + idx + ')">' + t('Save', '保存') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);
}

function vaCardRow(i, word, def) {
  return '<tr class="va-row">' +
    '<td class="text-sub" style="width:24px">' + (i + 1) + '</td>' +
    '<td><input class="va-word" value="' + word.replace(/"/g, '&quot;') + '"></td>' +
    '<td><input class="va-def" value="' + def.replace(/"/g, '&quot;') + '"></td>' +
    '<td style="width:28px"><button class="btn btn-ghost btn-sm btn-icon-danger" onclick="this.closest(\'tr\').remove();vaRenum()">x</button></td>' +
    '</tr>';
}

function vaAddCard() {
  var tbody = E('va-cards');
  if (!tbody) return;
  var rows = tbody.querySelectorAll('.va-row');
  var tr = document.createElement('tr');
  tr.className = 'va-row';
  tr.innerHTML = '<td class="text-sub" style="width:24px">' + (rows.length + 1) + '</td>' +
    '<td><input class="va-word" value=""></td>' +
    '<td><input class="va-def" value=""></td>' +
    '<td style="width:28px"><button class="btn btn-ghost btn-sm btn-icon-danger" onclick="this.closest(\'tr\').remove();vaRenum()">x</button></td>';
  tbody.appendChild(tr);
}

function vaRenum() {
  var rows = document.querySelectorAll('#va-cards .va-row');
  rows.forEach(function(tr, i) {
    tr.children[0].textContent = i + 1;
  });
}

function vaCollectCards() {
  var vocab = [];
  var rows = document.querySelectorAll('#va-cards .va-row');
  var id = 1;
  rows.forEach(function(tr) {
    var w = tr.querySelector('.va-word').value.trim();
    var d = tr.querySelector('.va-def').value.trim();
    if (w && d) {
      vocab.push({ id: id, type: 'word', content: w });
      vocab.push({ id: id, type: 'def', content: d });
      id++;
    }
  });
  return vocab;
}

async function vaSaveDeck(idx) {
  var lv = LEVELS[idx];
  var title = E('va-title').value.trim();
  var titleZh = E('va-title-zh').value.trim();
  var msg = E('va-msg');

  if (!title) { msg.textContent = t('Title required', '请填写标题'); msg.className = 'settings-msg error'; return; }

  var vocab = vaCollectCards();
  if (vocab.length < 4) { msg.textContent = t('Need at least 2 words', '至少需要2个词'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Saving...', '保存中...');
  msg.className = 'settings-msg';

  try {
    var row = {
      slug: lv.slug,
      board: lv.board,
      category: lv.category,
      title: title,
      title_zh: titleZh,
      vocabulary: vocab,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString()
    };

    var res = await sb.from('vocab_levels').upsert(row, { onConflict: 'slug' });
    if (res.error) throw new Error(res.error.message);

    /* Update local LEVELS */
    lv.title = title;
    lv.titleZh = titleZh;
    lv.vocabulary = vocab;
    invalidateCache();

    hideModal();
    showToast(t('Saved!', '已保存！'));
    renderHome();
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ DELETE DECK ═══ */
function confirmDeleteDeck(idx) {
  var lv = LEVELS[idx];
  var html = '<div class="section-title">' + t('Delete Group?', '删除词组？') + '</div>';
  html += '<p class="text-sub" style="margin:12px 0">' + lvTitle(lv) + '</p>';
  html += '<div class="btn-row btn-row--mt0">';
  html += '<button class="btn btn-primary" style="background:var(--c-danger)" onclick="doDeleteDeck(' + idx + ')">' + t('Delete', '删除') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';
  showModal(html);
}

async function doDeleteDeck(idx) {
  var lv = LEVELS[idx];
  try {
    /* Mark as deleted in DB */
    var res = await sb.from('vocab_levels').upsert({
      slug: lv.slug,
      board: lv.board,
      category: lv.category,
      title: lv.title,
      title_zh: lv.titleZh || '',
      vocabulary: lv.vocabulary,
      is_deleted: true,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });
    if (res.error) throw new Error(res.error.message);

    /* Remove from local LEVELS */
    LEVELS.splice(idx, 1);
    invalidateCache();
    invalidateGuestCache();

    hideModal();
    showToast(t('Deleted!', '已删除！'));
    renderHome();
  } catch (e) {
    hideModal();
    showToast(t('Delete failed: ', '删除失败：') + e.message);
  }
}

/* ═══ ADD NEW DECK MODAL ═══ */
function showAddDeckModal(boardId, catId) {
  var html = '<div class="section-title">' + t('New Group', '新建词组') + '</div>';
  html += '<label class="settings-label">Slug (' + t('unique ID', '唯一标识') + ')</label>';
  html += '<input class="auth-input" id="va-slug" placeholder="e.g. algebra-new-topic">';
  html += '<label class="settings-label">' + t('Title (EN)', '标题 (英)') + '</label>';
  html += '<input class="auth-input" id="va-title" placeholder="e.g. New Topic">';
  html += '<label class="settings-label">' + t('Title (ZH)', '标题 (中)') + '</label>';
  html += '<input class="auth-input" id="va-title-zh" placeholder="e.g. 新专题">';

  html += '<div style="margin-top:12px;max-height:250px;overflow-y:auto">';
  html += '<table class="va-card-table">';
  html += '<thead><tr><th>#</th><th>' + t('Word', '词') + '</th><th>' + t('Definition', '释义') + '</th><th></th></tr></thead>';
  html += '<tbody id="va-cards">';
  for (var i = 0; i < 3; i++) {
    html += vaCardRow(i, '', '');
  }
  html += '</tbody></table></div>';
  html += '<button class="btn btn-ghost btn-sm mt-8" onclick="vaAddCard()">+ ' + t('Add word', '添加词') + '</button>';

  html += '<div id="va-msg" class="settings-msg mt-8"></div>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" onclick="vaCreateDeck(\'' + boardId + '\', \'' + catId + '\')">' + t('Create', '创建') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);
}

async function vaCreateDeck(boardId, catId) {
  var slug = E('va-slug').value.trim();
  var title = E('va-title').value.trim();
  var titleZh = E('va-title-zh').value.trim();
  var msg = E('va-msg');

  if (!slug) { msg.textContent = t('Slug required', '请填写 Slug'); msg.className = 'settings-msg error'; return; }
  if (!title) { msg.textContent = t('Title required', '请填写标题'); msg.className = 'settings-msg error'; return; }

  var vocab = vaCollectCards();
  if (vocab.length < 4) { msg.textContent = t('Need at least 2 words', '至少需要2个词'); msg.className = 'settings-msg error'; return; }

  msg.textContent = t('Creating...', '创建中...');
  msg.className = 'settings-msg';

  try {
    var row = {
      slug: slug,
      board: boardId,
      category: catId,
      title: title,
      title_zh: titleZh,
      vocabulary: vocab,
      sort_order: LEVELS.length,
      updated_by: currentUser.id,
      updated_at: new Date().toISOString()
    };

    var res = await sb.from('vocab_levels').insert(row);
    if (res.error) throw new Error(res.error.message);

    /* Add to local LEVELS */
    LEVELS.push({
      slug: slug,
      board: boardId,
      category: catId,
      title: title,
      titleZh: titleZh,
      timer: 70,
      comboBonus: 2,
      vocabulary: vocab
    });
    invalidateCache();
    invalidateGuestCache();

    hideModal();
    showToast(t('Created!', '已创建！'));
    renderHome();
  } catch (e) {
    msg.textContent = e.message;
    msg.className = 'settings-msg error';
  }
}

/* ═══ FEEDBACK MANAGEMENT (Super Admin) ═══ */
async function renderFeedbackList() {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  try {
    var res = await sb.from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    var items = res.data || [];

    if (items.length === 0) {
      ct.innerHTML = '<div class="admin-empty">' + t('No feedback yet', '暂无反馈') + '</div>';
      return;
    }

    var html = '';
    items.forEach(function(fb) {
      var date = fb.created_at ? new Date(fb.created_at).toLocaleDateString() : '';
      html += '<div class="fb-list-item">';
      html += '<span class="fb-type">' + (fb.type || 'other') + '</span>';
      html += '<span class="fb-desc">' + escapeHtml((fb.description || '').substring(0, 80)) + '</span>';
      html += '<span class="fb-meta">' + escapeHtml(fb.user_email || t('Anonymous', '匿名')) + ' · ' + date + '</span>';
      html += '<span class="fb-status ' + (fb.status || 'new') + '">' + (fb.status || 'new') + '</span>';
      html += '<button class="btn btn-ghost btn-sm" style="margin-left:4px" onclick="showFeedbackDetail(\'' + fb.id + '\')">' + t('View', '查看') + '</button>';
      html += '</div>';
    });

    ct.innerHTML = html;
  } catch (e) {
    ct.innerHTML = '<div class="admin-empty">' + escapeHtml(e.message) + '</div>';
  }
}

async function showFeedbackDetail(id) {
  try {
    var res = await sb.from('feedback').select('*').eq('id', id).single();
    var fb = res.data;
    if (!fb) { showToast(t('Feedback not found', '未找到反馈')); return; }

    var html = '<div class="section-title">' + t('Feedback Detail', '反馈详情') + '</div>';
    html += '<div class="text-sm text-sub mb-12">';
    html += '<strong>' + t('Type:', '类型：') + '</strong> ' + escapeHtml(fb.type || '') + '<br>';
    html += '<strong>' + t('User:', '用户：') + '</strong> ' + escapeHtml(fb.user_email || '-') + '<br>';
    html += '<strong>' + t('Date:', '日期：') + '</strong> ' + new Date(fb.created_at).toLocaleString() + '<br>';
    html += '<strong>' + t('Status:', '状态：') + '</strong> <span class="fb-status ' + fb.status + '">' + fb.status + '</span>';
    html += '</div>';

    html += '<label class="settings-label">' + t('Description', '描述') + '</label>';
    html += '<div style="padding:10px;background:var(--c-surface-alt);border-radius:8px;font-size:13px;margin-bottom:8px;white-space:pre-wrap">' + escapeHtml(fb.description || '') + '</div>';

    if (fb.steps) {
      html += '<label class="settings-label">' + t('Steps', '步骤') + '</label>';
      html += '<div style="padding:10px;background:var(--c-surface-alt);border-radius:8px;font-size:13px;margin-bottom:8px;white-space:pre-wrap">' + escapeHtml(fb.steps) + '</div>';
    }

    if (fb.auto_info && Object.keys(fb.auto_info).length > 0) {
      html += '<label class="settings-label">' + t('Auto Info', '自动信息') + '</label>';
      html += '<div style="padding:10px;background:var(--c-surface-alt);border-radius:8px;font-size:11px;font-family:monospace;margin-bottom:8px">' + escapeHtml(JSON.stringify(fb.auto_info, null, 2)) + '</div>';
    }

    html += '<label class="settings-label">' + t('Admin Notes', '管理备注') + '</label>';
    html += '<textarea class="bug-textarea" id="fb-notes" rows="3">' + escapeHtml(fb.admin_notes || '') + '</textarea>';

    html += '<label class="settings-label mt-8">' + t('Change Status', '更改状态') + '</label>';
    html += '<div class="flex gap-6 mb-12">';
    ['new', 'in_progress', 'done', 'dismissed'].forEach(function(st) {
      var active = fb.status === st ? ' style="border-color:var(--c-primary);background:var(--c-primary-bg)"' : '';
      html += '<button class="btn btn-ghost btn-sm"' + active + ' onclick="updateFeedbackStatus(\'' + fb.id + '\', \'' + st + '\')">' + st + '</button>';
    });
    html += '</div>';

    html += '<div class="btn-row btn-row--mt0">';
    html += '<button class="btn btn-primary" onclick="saveFeedbackNotes(\'' + fb.id + '\')">' + t('Save Notes', '保存备注') + '</button>';
    html += '<button class="btn btn-ghost" onclick="hideModal();renderFeedbackList()">' + t('Close', '关闭') + '</button>';
    html += '</div>';

    showModal(html);
  } catch (e) {
    showToast(t('Failed to load feedback', '加载反馈失败'));
  }
}

async function updateFeedbackStatus(id, status) {
  try {
    await sb.from('feedback').update({ status: status }).eq('id', id);
    hideModal();
    showToast(t('Status updated', '状态已更新'));
    renderFeedbackList();
  } catch (e) {
    showToast(t('Update failed', '更新失败'));
  }
}

async function saveFeedbackNotes(id) {
  try {
    var notes = E('fb-notes') ? E('fb-notes').value.trim() : '';
    await sb.from('feedback').update({ admin_notes: notes }).eq('id', id);
    hideModal();
    showToast(t('Notes saved', '备注已保存'));
    renderFeedbackList();
  } catch (e) {
    showToast(t('Save failed', '保存失败'));
  }
}
