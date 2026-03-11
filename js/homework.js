/* ══════════════════════════════════════════════════════════════
   homework.js — Teacher assignments + student test + notifications
   ══════════════════════════════════════════════════════════════ */

/* ═══ NOTIFICATION SYSTEM ═══ */
var _notifCache = null;
var _notifCount = 0;
var _hwQuestionDelegated = false;

function _notifClickHandler(e) {
  var item = e.target.closest('.notif-item');
  if (item) handleNotifClick(item.dataset.nid, item.dataset.ntype, item.dataset.nlid);
}
function _notifKeyHandler(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    var item = e.target.closest('.notif-item');
    if (item) { e.preventDefault(); handleNotifClick(item.dataset.nid, item.dataset.ntype, item.dataset.nlid); }
  }
}

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
  var html = '<div class="section-title flex items-center gap-8">';
  html += t('Notifications', '通知');
  if (_notifCount > 0) {
    html += ' <button class="btn btn-ghost btn-sm" onclick="markAllNotifsRead();hideModal()">' + t('Mark all read', '全部已读') + '</button>';
  }
  html += '</div>';

  if (notifs.length === 0) {
    html += '<div style="padding:20px;text-align:center;color:var(--c-text2);font-size:14px">' + t('No notifications', '暂无通知') + '</div>';
  } else {
    html += '<div class="hw-scroll-list-xl">';
    notifs.forEach(function(n) {
      var unread = !n.is_read;
      var time = n.created_at ? timeAgo(n.created_at) : '';
      html += '<div class="notif-item' + (unread ? ' unread' : '') +
        '" role="button" tabindex="0" data-nid="' + escapeHtml(String(n.id)) +
        '" data-ntype="' + escapeHtml(n.link_type || '') +
        '" data-nlid="' + escapeHtml(n.link_id || '') + '">';
      html += '<div class="notif-dot' + (unread ? ' active' : '') + '"></div>';
      html += '<div class="notif-content">';
      html += '<div class="notif-title">' + escapeHtml(n.title || '') + '</div>';
      if (n.body) html += '<div class="notif-body">' + escapeHtml(n.body) + '</div>';
      html += '<div class="notif-time">' + time + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  html += '<button class="btn btn-ghost btn-block mt-12" onclick="hideModal()">' + t('Close', '关闭') + '</button>';
  showModal(html);

  /* Event delegation for notification clicks (remove+add to prevent leaks) */
  var mc = E('modal-card');
  if (mc) {
    mc.removeEventListener('click', _notifClickHandler);
    mc.addEventListener('click', _notifClickHandler);
    mc.removeEventListener('keydown', _notifKeyHandler);
    mc.addEventListener('keydown', _notifKeyHandler);
  }
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
var _hwMode = 'deck';
var _hwPracticeLoaded = false;

function hwSwitchTab(mode) {
  _hwMode = mode;
  var deckArea = E('hw-deck-area');
  var customArea = E('hw-custom-area');
  var practiceArea = E('hw-practice-area');
  var tabDeck = E('hw-tab-deck');
  var tabCustom = E('hw-tab-custom');
  var tabPractice = E('hw-tab-practice');
  if (!deckArea || !customArea) return;
  deckArea.style.display = mode === 'deck' ? 'block' : 'none';
  customArea.style.display = mode === 'custom' ? 'block' : 'none';
  if (practiceArea) practiceArea.style.display = mode === 'practice' ? 'block' : 'none';
  tabDeck.className = 'btn btn-sm ' + (mode === 'deck' ? 'btn-primary' : 'btn-ghost');
  tabCustom.className = 'btn btn-sm ' + (mode === 'custom' ? 'btn-primary' : 'btn-ghost');
  if (tabPractice) tabPractice.className = 'btn btn-sm ' + (mode === 'practice' ? 'btn-primary' : 'btn-ghost');
  if (mode === 'practice' && !_hwPracticeLoaded) {
    _hwPracticeLoaded = true;
    _loadHwPracticeData();
  }
}

function hwAddRow() {
  var ct = E('hw-custom-rows');
  if (!ct) return;
  var rows = ct.querySelectorAll('.hw-custom-row');
  if (rows.length >= 20) { showToast(t('Max 20 words', '最多20个词')); return; }
  var div = document.createElement('div');
  div.className = 'hw-custom-row';
  /* styled via .hw-custom-row in CSS */
  div.innerHTML = '<input class="auth-input hw-cw flex-1 mt-0" placeholder="' + t('Word', '词汇') + '">'
    + '<input class="auth-input hw-cd flex-1 mt-0" placeholder="' + t('Definition', '释义') + '">'
    + '<button class="btn btn-ghost btn-sm btn-icon-danger" onclick="this.parentElement.remove()">\u2715</button>';
  ct.appendChild(div);
}

function hwParseBatch() {
  var ta = E('hw-batch-text');
  if (!ta) return;
  var lines = ta.value.split('\n').filter(function(l) { return l.trim(); });
  if (lines.length === 0) return;
  var ct = E('hw-custom-rows');
  if (!ct) return;
  ct.innerHTML = '';
  var count = 0;
  lines.forEach(function(line) {
    if (count >= 20) return;
    var parts = line.split(/\s[-\u2013\u2014]\s|\t/);
    var w = (parts[0] || '').trim();
    var d = (parts[1] || '').trim();
    if (!w && !d) return;
    count++;
    var div = document.createElement('div');
    div.className = 'hw-custom-row';
    /* styled via .hw-custom-row in CSS */
    div.innerHTML = '<input class="auth-input hw-cw flex-1 mt-0" placeholder="' + t('Word', '词汇') + '" value="' + escapeHtml(w).replace(/"/g, '&quot;') + '">'
      + '<input class="auth-input hw-cd flex-1 mt-0" placeholder="' + t('Definition', '释义') + '" value="' + escapeHtml(d).replace(/"/g, '&quot;') + '">'
      + '<button class="btn btn-ghost btn-sm btn-icon-danger" onclick="this.parentElement.remove()">\u2715</button>';
    ct.appendChild(div);
  });
  if (count < lines.length) showToast(t('Truncated to 20 words', '已截断为20个词'));
  ta.value = '';
}

/* ═══ HOMEWORK TEMPLATES (localStorage) ═══ */
function _getHwTemplates() {
  try { return JSON.parse(localStorage.getItem('hw_templates') || '[]'); } catch(e) { return []; }
}
function _saveHwTemplates(tpls) {
  try { localStorage.setItem('hw_templates', JSON.stringify(tpls)); } catch(e) {}
}
function hwSaveTemplate() {
  var title = (E('hw-title') ? E('hw-title').value.trim() : '') || t('Untitled', '\u672a\u547d\u540d');
  var slugs = [];
  document.querySelectorAll('.hw-deck-cb:checked').forEach(function(cb) { slugs.push(cb.value); });
  if (slugs.length === 0) { showToast(t('Select at least 1 group first', '\u8bf7\u5148\u9009\u62e9\u81f3\u5c111\u4e2a\u8bcd\u7ec4')); return; }
  var tpls = _getHwTemplates();
  tpls.push({ name: title, slugs: slugs, created: Date.now() });
  if (tpls.length > 20) tpls = tpls.slice(-20);
  _saveHwTemplates(tpls);
  showToast(t('Template saved: ', '\u6a21\u677f\u5df2\u4fdd\u5b58\uff1a') + title);
}
function hwLoadTemplate(classId) {
  var sel = E('hw-tpl-select');
  if (!sel || sel.value === '') return;
  var tpls = _getHwTemplates();
  var tpl = tpls[parseInt(sel.value)];
  if (!tpl) return;
  /* Set title */
  var titleEl = E('hw-title');
  if (titleEl) titleEl.value = tpl.name;
  /* Check matching decks */
  document.querySelectorAll('.hw-deck-cb').forEach(function(cb) {
    cb.checked = tpl.slugs.indexOf(cb.value) >= 0;
  });
  /* Switch to deck tab */
  hwSwitchTab('deck');
  showToast(t('Template loaded', '\u6a21\u677f\u5df2\u52a0\u8f7d'));
}
function hwDeleteTemplate() {
  var sel = E('hw-tpl-select');
  if (!sel || sel.value === '') { showToast(t('Select a template first', '\u8bf7\u5148\u9009\u62e9\u6a21\u677f')); return; }
  var idx = parseInt(sel.value);
  var tpls = _getHwTemplates();
  if (idx < 0 || idx >= tpls.length) return;
  var name = tpls[idx].name;
  tpls.splice(idx, 1);
  _saveHwTemplates(tpls);
  sel.remove(sel.selectedIndex);
  sel.value = '';
  showToast(t('Template deleted: ', '\u6a21\u677f\u5df2\u5220\u9664\uff1a') + name);
}

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
      deckHtml += '<div class="mb-8">';
      deckHtml += '<div class="fw-600 text-muted mb-4" style="font-size:12px">' + cat.emoji + ' ' + catName(cat) + '</div>';
      catDecks.forEach(function(cl) {
        deckHtml += '<label class="flex items-center gap-6 text-sm hw-checkbox-label">';
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

  _hwMode = 'deck';
  _hwPracticeLoaded = false;

  var html = '<div class="section-title">' + t('Create Homework', '布置作业') + '</div>';

  /* Template selector */
  var tpls = _getHwTemplates();
  if (tpls.length > 0) {
    html += '<div class="flex items-center gap-6" style="margin-bottom:10px">';
    html += '<select id="hw-tpl-select" class="auth-input flex-1 mt-0" style="font-size:12px" data-hw-tpl-cid="' + classId + '">';
    html += '<option value="">' + t('-- Load template --', '-- \u52a0\u8f7d\u6a21\u677f --') + '</option>';
    for (var ti = 0; ti < tpls.length; ti++) {
      html += '<option value="' + ti + '">' + escapeHtml(tpls[ti].name) + ' (' + tpls[ti].slugs.length + ' ' + t('groups', '\u7ec4') + ')</option>';
    }
    html += '</select>';
    html += '<button class="btn btn-ghost btn-sm text-danger" style="padding:4px 8px" title="' + t('Delete', '\u5220\u9664') + '" onclick="hwDeleteTemplate()">\u2716</button>';
    html += '</div>';
  }

  html += '<label class="settings-label">' + t('Title', '标题') + '</label>';
  html += '<input class="auth-input" id="hw-title" placeholder="' + t('e.g. Week 3 Vocab Test', '如 第3周词汇测试') + '">';

  /* Tab buttons */
  html += '<div class="flex flex-wrap gap-6" style="margin:12px 0 8px">';
  html += '<button id="hw-tab-deck" class="btn btn-sm btn-primary" onclick="hwSwitchTab(\'deck\')">' + t('Select Groups', '选择词组') + '</button>';
  html += '<button id="hw-tab-custom" class="btn btn-sm btn-ghost" onclick="hwSwitchTab(\'custom\')">' + t('Custom Vocab', '自定义词汇') + '</button>';
  html += '<button id="hw-tab-practice" class="btn btn-sm btn-ghost" onclick="hwSwitchTab(\'practice\')">' + t('Practice MCQ', '练习题') + '</button>';
  html += '</div>';

  /* Deck selection area (default visible) */
  html += '<div id="hw-deck-area">';
  html += '<div class="hw-scroll-list">';
  html += deckHtml;
  html += '</div>';
  html += '</div>';

  /* Custom vocab area (hidden) */
  html += '<div id="hw-custom-area" class="d-none">';
  html += '<div class="mb-8">';
  html += '<textarea id="hw-batch-text" class="auth-input" rows="3" style="font-size:12px;resize:vertical" placeholder="' + t('Paste words, one per line: word - definition', '批量粘贴，每行一条：词汇 - 释义') + '"></textarea>';
  html += '<button class="btn btn-ghost btn-sm mt-4" onclick="hwParseBatch()">' + t('Parse', '解析') + '</button>';
  html += '</div>';
  html += '<div id="hw-custom-rows" style="max-height:240px;overflow-y:auto"></div>';
  html += '<button class="btn btn-ghost btn-sm" onclick="hwAddRow()">+ ' + t('Add row', '添加行') + '</button>';
  html += '</div>';

  /* Practice MCQ area (hidden) */
  html += '<div id="hw-practice-area" class="d-none">';
  html += '<div class="flex gap-8 items-center mb-8">';
  html += '<label class="settings-label mt-0" style="white-space:nowrap">' + t('Board', '考试局') + '</label>';
  html += '<select id="hw-pq-board" class="auth-input mt-0 flex-1" onchange="_renderHwSections(this.value)">';
  html += '<option value="cie">CIE 0580</option>';
  html += '<option value="edx">Edexcel 4MA1</option>';
  html += '</select>';
  html += '</div>';
  html += '<div class="flex gap-8 mb-8">';
  html += '<div class="flex-1"><label class="settings-label mt-0">' + t('Questions', '题数') + '</label>';
  html += '<select id="hw-pq-count" class="auth-input mt-4">';
  html += '<option value="5">5</option><option value="10" selected>10</option><option value="15">15</option><option value="20">20</option>';
  html += '</select></div>';
  html += '<div class="flex-1"><label class="settings-label mt-0">' + t('Difficulty', '难度') + '</label>';
  html += '<select id="hw-pq-diff" class="auth-input mt-4">';
  html += '<option value="">' + t('All', '全部') + '</option><option value="1">Core</option><option value="2">Extended</option>';
  html += '</select></div>';
  html += '</div>';
  html += '<div id="hw-pq-sections" class="hw-scroll-list">';
  html += '<div class="text-muted text-sm">' + t('Loading...', '加载中...') + '</div>';
  html += '</div>';
  html += '</div>';
  html += '<label class="settings-label mt-12">' + t('Deadline', '截止日期') + '</label>';
  html += '<input class="auth-input" id="hw-deadline" type="datetime-local" value="' + deadlineDefault + '">';
  html += '<div id="hw-msg" class="settings-msg mt-8"></div>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" style="flex:2" onclick="doCreateHw(\'' + escapeHtml(classId) + '\')">' + t('Create', '创建') + '</button>';
  html += '<button class="btn btn-secondary btn-sm" onclick="hwSaveTemplate()">' + t('Save Template', '\u4fdd\u5b58\u6a21\u677f') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';

  showModal(html);
  /* Seed 3 empty rows for custom mode */
  for (var r = 0; r < 3; r++) hwAddRow();
}

/* ═══ PRACTICE HOMEWORK DETECTION ═══ */
function _isPracticeHw(hw) {
  return hw.custom_vocabulary && hw.custom_vocabulary._type === 'practice';
}

/* ═══ PRACTICE HOMEWORK HELPERS ═══ */

async function _loadHwPracticeData() {
  var board = E('hw-pq-board') ? E('hw-pq-board').value : 'cie';
  try {
    await loadPracticeData(board);
    if (board === 'cie' && !BOARD_SYLLABUS.cie) await loadCIESyllabus();
    if (board === 'edx' && !BOARD_SYLLABUS.edx) await loadEdxSyllabus();
  } catch (e) { /* ignore */ }
  _renderHwSections(board);
}

function _renderHwSections(board) {
  var ct = E('hw-pq-sections');
  if (!ct) return;
  var syllabus = BOARD_SYLLABUS[board];
  var questions = _pqData[board] || [];

  if (!syllabus || !syllabus.chapters) {
    /* Try loading */
    ct.innerHTML = '<div class="text-muted text-sm">' + t('Loading...', '加载中...') + '</div>';
    var loadFn = board === 'cie' ? loadCIESyllabus : loadEdxSyllabus;
    loadFn().then(function() {
      loadPracticeData(board).then(function() { _renderHwSections(board); });
    });
    return;
  }

  /* Count questions per section */
  var secCounts = {};
  questions.forEach(function(q) { if (q.s) secCounts[q.s] = (secCounts[q.s] || 0) + 1; });

  var html = '';
  syllabus.chapters.forEach(function(ch) {
    var chSecs = ch.sections.filter(function(sec) { return (secCounts[sec.id] || 0) > 0; });
    if (chSecs.length === 0) return;
    var chId = 'hw-ch-' + board + '-' + ch.num;
    html += '<div style="margin-bottom:6px">';
    html += '<label class="flex items-center gap-6 fw-600 text-muted hw-checkbox-heading">';
    html += '<input type="checkbox" class="hw-ch-cb" data-ch="' + ch.num + '" data-board="' + board + '" onchange="_hwToggleChapter(this)">';
    html += ch.num + '. ' + ch.title;
    if (ch.title_zh) html += ' ' + ch.title_zh;
    html += '</label>';
    chSecs.forEach(function(sec) {
      html += '<label class="flex items-center gap-6 text-sm hw-checkbox-label-indent">';
      html += '<input type="checkbox" class="hw-sec-cb" value="' + sec.id + '" data-ch="' + ch.num + '" data-board="' + board + '">';
      html += sec.id + ' ' + sec.title;
      html += ' <span class="text-muted text-xs">(' + (secCounts[sec.id] || 0) + ')</span>';
      html += '</label>';
    });
    html += '</div>';
  });

  if (!html) html = '<div class="text-muted text-sm">' + t('No questions available', '暂无题目') + '</div>';
  ct.innerHTML = html;
}

function _hwToggleChapter(el) {
  var chNum = el.getAttribute('data-ch');
  var board = el.getAttribute('data-board');
  var checked = el.checked;
  document.querySelectorAll('.hw-sec-cb[data-ch="' + chNum + '"][data-board="' + board + '"]').forEach(function(cb) {
    cb.checked = checked;
  });
}

async function doCreateHw(classId) {
  var title = E('hw-title').value.trim();
  var msg = E('hw-msg');
  var deadline = E('hw-deadline').value;

  if (!title) { msg.textContent = t('Title required', '请填写标题'); msg.className = 'settings-msg error'; return; }
  if (!deadline) { msg.textContent = t('Deadline required', '请设置截止日期'); msg.className = 'settings-msg error'; return; }

  var slugs = [];
  var customVocab = null;

  if (_hwMode === 'practice') {
    var pBoard = E('hw-pq-board') ? E('hw-pq-board').value : 'cie';
    var pCount = parseInt(E('hw-pq-count') ? E('hw-pq-count').value : '10') || 10;
    var pDiff = E('hw-pq-diff') ? E('hw-pq-diff').value : '';
    var sectionIds = [];
    document.querySelectorAll('.hw-sec-cb:checked').forEach(function(cb) { sectionIds.push(cb.value); });
    if (sectionIds.length === 0) { msg.textContent = t('Select at least 1 section', '至少选择1个知识点'); msg.className = 'settings-msg error'; return; }
    slugs = sectionIds;
    customVocab = { _type: 'practice', board: pBoard, count: pCount, difficulty: pDiff ? parseInt(pDiff) : null };
  } else if (_hwMode === 'custom') {
    /* Collect custom rows */
    var vocab = [];
    var vid = 1;
    document.querySelectorAll('.hw-custom-row').forEach(function(row) {
      var w = row.querySelector('.hw-cw').value.trim();
      var d = row.querySelector('.hw-cd').value.trim();
      if (!w && !d) return;
      vocab.push({ id: vid, type: 'word', content: w });
      vocab.push({ id: vid, type: 'def', content: d });
      vid++;
    });
    if (vocab.length < 4) { msg.textContent = t('At least 2 words required', '至少输入2个词'); msg.className = 'settings-msg error'; return; }
    if (vid > 21) { msg.textContent = t('Max 20 words allowed', '最多20个词'); msg.className = 'settings-msg error'; return; }
    customVocab = vocab;
  } else {
    document.querySelectorAll('.hw-deck-cb:checked').forEach(function(cb) {
      slugs.push(cb.value);
    });
    if (slugs.length === 0) { msg.textContent = t('Select at least 1 group', '至少选择1个词组'); msg.className = 'settings-msg error'; return; }
  }

  msg.textContent = t('Creating...', '创建中...');
  msg.className = 'settings-msg';

  try {
    var rpcParams = {
      p_class_id: classId,
      p_title: title,
      p_deck_slugs: slugs,
      p_deadline: new Date(deadline).toISOString()
    };
    if (customVocab) rpcParams.p_custom_vocabulary = customVocab;
    var res = await sb.rpc('create_assignment', rpcParams);
    if (res.error) throw new Error(res.error.message);

    /* Send notifications to all students in this class (batch INSERT) */
    var csRes = await sb.from('kw_class_students').select('user_id').eq('class_id', classId);
    if (csRes.error) return;
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

  var html = '<div class="section-title">' + t('Custom Vocab Assignment', '自定义词汇复习作业') + '</div>';
  html += '<div class="text-sm text-muted mb-12">' + t('For: ', '学生：') + '<strong>' + studentName + '</strong></div>';
  html += '<label class="settings-label">' + t('Title', '标题') + '</label>';
  html += '<input class="auth-input" id="chw-title" value="' + t('Words to Strengthen', '待加强词汇复习') + '">';

  html += '<label class="settings-label">' + t('Words', '词汇') + ' (' + wordsToUse.length + '/' + t('max 10', '最多10') + ')</label>';
  html += '<div class="hw-scroll-list">';
  wordsToUse.forEach(function(w, i) {
    html += '<label class="flex items-center gap-6 text-sm hw-checkbox-label">';
    html += '<input type="checkbox" class="chw-word-cb" data-word="' + escapeHtml(w.word || '').replace(/"/g, '&quot;') + '" data-def="' + escapeHtml(w.def || '').replace(/"/g, '&quot;') + '" checked>';
    html += '<strong>' + escapeHtml(w.word || '') + '</strong> — ' + escapeHtml(w.def || '');
    html += '</label>';
  });
  html += '</div>';

  var nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 3);
  html += '<label class="settings-label mt-12">' + t('Deadline', '截止日期') + '</label>';
  html += '<input class="auth-input" id="chw-deadline" type="datetime-local" value="' + nextWeek.toISOString().slice(0, 16) + '">';
  html += '<div id="chw-msg" class="settings-msg mt-8"></div>';
  html += '<div class="btn-row">';
  html += '<button class="btn btn-primary" onclick="doCreateCustomHw(\'' + escapeHtml(classId) + '\', \'' + escapeHtml(studentUserId) + '\')">' + t('Assign', '布置') + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
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
    var res = await sb.rpc('create_assignment', {
      p_class_id: classId,
      p_title: title,
      p_deck_slugs: [],
      p_deadline: new Date(deadline).toISOString(),
      p_custom_vocabulary: vocab
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
    var res = await sb.rpc('list_class_assignments', { p_class_id: classId });
    if (res.error) { ct.innerHTML = '<div class="text-sm text-muted">' + t('Failed to load', '加载失败') + '</div>'; return; }
    var hws = res.data || [];

    if (hws.length === 0) {
      ct.innerHTML = '<div class="text-sm text-muted" style="padding:8px 0">' + t('No homework yet', '暂无作业') + '</div>';
      return;
    }

    /* Batch fetch all assignment results (avoid N+1) */
    var hwIds = hws.map(function(h) { return h.id; });
    var rRes = await sb.from('assignment_results')
      .select('assignment_id, user_id, completed_at')
      .in('assignment_id', hwIds);
    if (rRes.error) { ct.innerHTML = '<div class="text-sm text-muted">' + t('Failed to load results', '加载结果失败') + '</div>'; return; }
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
      var isPractice = _isPracticeHw(hw);
      var isCustom = !isPractice && hw.custom_vocabulary && hw.custom_vocabulary.length > 0;

      var results = resultsByHw[hw.id] || [];
      var completed = results.filter(function(r) { return r.completed_at; }).length;

      var prefix = isPractice ? '\u270f\ufe0f ' : (isCustom ? '\ud83c\udfaf ' : '');
      var countLabel = '';

      if (isPractice) {
        var cfg = hw.custom_vocabulary;
        countLabel = cfg.count + ' ' + t('questions', '题');
      } else {
        /* Collect words for this assignment */
        var hwWords = [];
        if (isCustom) {
          var cvP = getPairs(hw.custom_vocabulary);
          cvP.forEach(function(p) { hwWords.push({ word: p.word, def: p.def }); });
        } else if (hw.deck_slugs && hw.deck_slugs.length > 0) {
          hw.deck_slugs.forEach(function(slug) {
            var lv = getLevelBySlug(slug);
            if (lv) {
              var dp = getPairs(lv.vocabulary);
              dp.forEach(function(p) { hwWords.push({ word: p.word, def: p.def }); });
            }
          });
        }
        countLabel = hwWords.length + ' ' + t('words', '\u8bcd');
      }

      html += '<div class="hw-list-item flex-wrap">';
      html += '<div class="flex items-center gap-8" style="width:100%">';
      html += '<span class="hw-list-title flex-1">' + prefix + escapeHtml(hw.title) + ' <span class="text-xs text-muted">(' + countLabel + ')</span></span>';
      html += '<span class="hw-list-deadline" style="' + (isOverdue ? 'color:var(--c-danger)' : '') + '">' + deadline + '</span>';
      html += '<span class="hw-list-rate">' + completed + ' ' + t('done', '完成') + '</span>';
      html += '<button class="btn btn-ghost btn-sm" data-action="hw-detail" data-hwid="' + hw.id + '" data-cid="' + classId + '">' + t('Detail', '详情') + '</button>';
      html += '<button class="btn btn-ghost btn-sm text-danger" data-action="hw-delete" data-hwid="' + hw.id + '" data-cid="' + classId + '">' + t('Del', '删') + '</button>';
      html += '</div>';

      if (isPractice) {
        /* Show config summary for practice HW */
        var cfg2 = hw.custom_vocabulary;
        if (cfg2.board === 'edexcel') cfg2.board = 'edx'; /* normalize legacy */
        var boardLabel = cfg2.board === 'edx' ? 'Edexcel 4MA1' : 'CIE 0580';
        var diffLabel = cfg2.difficulty === 1 ? 'Core' : cfg2.difficulty === 2 ? 'Extended' : t('All', '全部');
        html += '<div class="text-xs text-muted mt-4" style="width:100%">';
        html += boardLabel + ' | ' + t('Sections', '知识点') + ': ' + (hw.deck_slugs || []).join(', ') + ' | ' + t('Difficulty', '难度') + ': ' + diffLabel;
        html += '</div>';
      } else if (typeof hwWords !== 'undefined' && hwWords.length > 0) {
        /* Expandable word list */
        var pid = 'thw-' + hw.id.slice(0, 8);
        html += '<div style="width:100%;margin-top:6px">';
        html += '<button class="btn btn-ghost btn-sm text-xs" style="padding:2px 8px" data-toggle-preview="' + pid + '">' + t('View words', '查看词汇') + ' \u25BC</button>';
        html += '<div id="' + pid + '" class="d-none" style="margin-top:6px;max-height:200px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:6px 10px;background:var(--c-surface)">';
        hwWords.forEach(function(w, wi) {
          html += '<div style="padding:3px 0;font-size:12px;' + (wi < hwWords.length - 1 ? 'border-bottom:1px solid var(--c-border-light)' : '') + '">';
          html += '<strong>' + escapeHtml(w.word) + '</strong> — ' + escapeHtml(w.def);
          html += '</div>';
        });
        html += '</div></div>';
      }

      html += '</div>';
    }

    ct.innerHTML = html;
  } catch (e) {
    ct.innerHTML = '<div class="text-danger text-sm">' + escapeHtml(e.message) + '</div>';
  }
}

/* ═══ TEACHER: HOMEWORK PROGRESS VIEW (with student drill-down) ═══ */
async function renderHwProgress(hwId, classId) {
  var ct = E('admin-content');
  if (!ct) return;
  ct.innerHTML = '<div class="admin-loading">' + t('Loading...', '加载中...') + '</div>';

  try {
    var aRes = await sb.rpc('get_assignment', { p_id: hwId });
    if (aRes.error) { ct.innerHTML = '<div class="admin-empty">Load failed</div>'; return; }
    var hw = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
    if (!hw) { ct.innerHTML = '<div class="admin-empty">Not found</div>'; return; }

    var activity = await loadActivityData(true);
    var students = activity.filter(function(s) { return s.class_id === classId; });

    var rRes = await sb.from('assignment_results').select('*').eq('assignment_id', hwId);
    if (rRes.error) { ct.innerHTML = '<div class="admin-empty">Load failed</div>'; return; }
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
    html += '<button class="btn btn-ghost btn-sm" onclick="renderClassDetail(\'' + escapeHtml(classId) + '\')">' + t('\u2190 Back', '\u2190 返回') + '</button>';
    html += '<div class="admin-detail-title">' + escapeHtml(hw.title) + '</div>';
    html += '<button class="btn btn-ghost btn-sm" onclick="exportHwCSV(\'' + escapeHtml(hwId) + '\', \'' + escapeHtml(classId) + '\')" style="margin-left:auto">\u2b07 ' + t('Export CSV', '\u5bfc\u51fa CSV') + '</button>';
    html += '</div>';

    /* Summary cards */
    html += '<div class="admin-summary-grid mb-16">';
    html += summaryCard(t('Completed', '已完成'), doneCount + '/' + totalStudents, 'var(--c-success)');
    html += summaryCard(t('Avg Score', '平均分'), avgScore + '%', 'var(--c-primary)');
    html += summaryCard(t('Deadline', '截止'), new Date(hw.deadline).toLocaleDateString(), new Date(hw.deadline) < new Date() ? 'var(--c-danger)' : 'var(--c-text2)');
    html += '</div>';

    /* Content preview */
    if (_isPracticeHw(hw)) {
      var cfg = hw.custom_vocabulary;
      if (cfg.board === 'edexcel') cfg.board = 'edx'; /* normalize legacy */
      var boardLabel = cfg.board === 'edx' ? 'Edexcel 4MA1' : 'CIE 0580';
      var diffLabel = cfg.difficulty === 1 ? 'Core' : cfg.difficulty === 2 ? 'Extended' : t('All', '\u5168\u90e8');
      html += '<div style="margin-bottom:16px;padding:10px 14px;border:1px solid var(--c-border);border-radius:8px;background:var(--c-surface);font-size:13px">';
      html += '<div class="hw-section-title" style="margin-bottom:6px">\u270f\ufe0f ' + t('Practice MCQ', '\u7ec3\u4e60\u9898') + '</div>';
      html += '<div>' + t('Board', '\u8003\u8bd5\u5c40') + ': <strong>' + boardLabel + '</strong></div>';
      html += '<div>' + t('Questions', '\u9898\u6570') + ': <strong>' + cfg.count + '</strong></div>';
      html += '<div>' + t('Difficulty', '\u96be\u5ea6') + ': <strong>' + diffLabel + '</strong></div>';
      html += '<div>' + t('Sections', '\u77e5\u8bc6\u70b9') + ': <strong>' + (hw.deck_slugs || []).join(', ') + '</strong></div>';
      html += '</div>';
    }

    var hwWords = [];
    if (!_isPracticeHw(hw)) {
      if (hw.custom_vocabulary && hw.custom_vocabulary.length > 0) {
        var cvPairs = getPairs(hw.custom_vocabulary);
        cvPairs.forEach(function(p) { hwWords.push({ word: p.word, def: p.def }); });
      } else if (hw.deck_slugs && hw.deck_slugs.length > 0) {
        hw.deck_slugs.forEach(function(slug) {
          var lv = getLevelBySlug(slug);
          if (lv) {
            var dp = getPairs(lv.vocabulary);
            dp.forEach(function(p) { hwWords.push({ word: p.word, def: p.def }); });
          }
        });
      }
    }
    if (hwWords.length > 0) {
      html += '<div class="mb-16">';
      html += '<div class="flex items-center gap-8 mb-8">';
      html += '<div class="hw-section-title">' + t('Vocabulary', '词汇') + ' (' + hwWords.length + ')</div>';
      html += '</div>';
      html += '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:8px 12px;background:var(--c-surface)">';
      hwWords.forEach(function(w, i) {
        html += '<div style="padding:4px 0;font-size:13px;' + (i < hwWords.length - 1 ? 'border-bottom:1px solid var(--c-border-light)' : '') + '">';
        html += '<strong>' + escapeHtml(w.word) + '</strong> — ' + escapeHtml(w.def);
        html += '</div>';
      });
      html += '</div></div>';
    }

    /* Student results table — clickable rows */
    html += '<div class="admin-table-wrap"><table class="admin-student-table"><thead><tr>';
    html += '<th>' + t('Name', '姓名') + '</th>';
    html += '<th>' + t('Status', '状态') + '</th>';
    html += '<th>' + t('Score', '成绩') + '</th>';
    html += '<th>' + t('Accuracy', '正确率') + '</th>';
    html += '<th>' + t('Attempts', '尝试') + '</th>';
    html += '<th>' + t('Words to Review', '待复习词') + '</th>';
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

      html += '<tr>';
      html += '<td class="admin-td-name">' + escapeHtml(s.student_name || '-') + '</td>';
      html += '<td class="fw-600" style="' + statusStyle + '">' + status + '</td>';
      html += '<td>' + score + '</td>';
      html += '<td>' + pct + '</td>';
      html += '<td>' + attempts + '</td>';
      html += '<td>' + (wrongCount > 0 ? '<span class="text-danger">' + wrongCount + '</span>' : '-') + '</td>';
      html += '<td>';
      if (r && wrongCount > 0) {
        html += '<button class="btn btn-ghost btn-sm" data-action="hw-student-detail" data-hwid="' + hwId + '" data-uid="' + s.user_id + '" data-name="' + escapeHtml(s.student_name || '') + '" data-cid="' + classId + '">' + t('View', '查看') + '</button>';
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

/* ═══ TEACHER: EXPORT HOMEWORK RESULTS TO CSV ═══ */
async function exportHwCSV(hwId, classId) {
  try {
    showToast(t('Exporting...', '\u5bfc\u51fa\u4e2d...'));
    var aRes = await sb.rpc('get_assignment', { p_id: hwId });
    var hw = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
    if (!hw) { showToast(t('Assignment not found', '\u4f5c\u4e1a\u672a\u627e\u5230'), 'error'); return; }

    var activity = await loadActivityData(true);
    var students = activity.filter(function(s) { return s.class_id === classId; });

    var rRes = await sb.from('assignment_results').select('*').eq('assignment_id', hwId);
    var results = rRes.data || [];
    var resultMap = {};
    results.forEach(function(r) { resultMap[r.user_id] = r; });

    var rows = [];
    rows.push([t('Name','姓名'), t('Status','状态'), t('Score','成绩'), t('Total','总题'), t('Accuracy','正确率'), t('Attempts','尝试次数'), t('Words to Review','待复习词'), t('Completed At','完成时间')].join(','));

    students.forEach(function(s) {
      var r = resultMap[s.user_id];
      var done = r && r.completed_at;
      var name = '"' + (s.student_name || '').replace(/"/g, '""') + '"';
      var status = done ? t('Done','完成') : t('Pending','未完成');
      var correct = r ? r.correct_count : 0;
      var total = r ? r.total_count : 0;
      var pct = total > 0 ? Math.round(correct / total * 100) + '%' : '-';
      var attempts = r ? r.attempts : 0;
      var wrongWords = '';
      if (r && r.wrong_words && r.wrong_words.length > 0) {
        wrongWords = '"' + r.wrong_words.join('; ').replace(/"/g, '""') + '"';
      }
      var completedAt = done ? new Date(r.completed_at).toLocaleString() : '-';
      rows.push([name, status, correct, total, pct, attempts, wrongWords, completedAt].join(','));
    });

    var safeTitle = hw.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 30);
    var filename = 'homework_' + safeTitle + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    downloadBlob(new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' }), filename);
    showToast(t('CSV exported', 'CSV \u5df2\u5bfc\u51fa'));
  } catch(e) {
    showToast(t('Export failed', '\u5bfc\u51fa\u5931\u8d25') + ': ' + e.message, 'error');
  }
}

/* ═══ TEACHER: PER-STUDENT HOMEWORK DETAIL ═══ */
async function showStudentHwDetail(hwId, studentUserId, studentName, classId) {
  var rRes = await sb.from('assignment_results').select('*')
    .eq('assignment_id', hwId).eq('user_id', studentUserId).single();
  if (rRes.error) { showToast(t('Load failed', '\u52a0\u8f7d\u5931\u8d25')); return; }
  var r = rRes.data;
  if (!r) { showToast(t('No data', '\u65e0\u6570\u636e')); return; }

  var pct = r.total_count > 0 ? Math.round(r.correct_count / r.total_count * 100) : 0;
  var wrongWords = r.wrong_words || [];

  var html = '<div class="section-title">' + escapeHtml(studentName) + ' — ' + t('Homework Detail', '作业详情') + '</div>';
  html += '<div class="text-sm text-muted mb-16">';
  html += t('Score: ', '成绩：') + '<strong>' + r.correct_count + '/' + r.total_count + ' (' + pct + '%)</strong><br>';
  html += t('Attempts: ', '尝试次数：') + r.attempts + '<br>';
  html += t('Last attempt: ', '最后尝试：') + (r.last_attempt_at ? new Date(r.last_attempt_at).toLocaleString() : '-');
  html += '</div>';

  if (wrongWords.length > 0) {
    html += '<label class="settings-label text-danger">' + t('Words to Review', '待复习词') + ' (' + wrongWords.length + ')</label>';
    html += '<div class="hw-scroll-list mb-12">';
    wrongWords.forEach(function(w) {
      html += '<div style="padding:4px 0;font-size:13px;border-bottom:1px solid var(--c-border-light)">';
      html += '<strong>' + escapeHtml(w.word || '') + '</strong> — ' + escapeHtml(w.def || '');
      html += '</div>';
    });
    html += '</div>';

    _pendingCustomHwData = { classId: classId, userId: studentUserId, name: studentName, words: wrongWords };
    html += '<button class="btn btn-primary btn-sm" style="margin-bottom:12px" onclick="hideModal();showCreateCustomHwFromCache()">';
    html += t('Create review assignment', '布置复习作业');
    html += '</button>';
  } else {
    html += '<div style="font-size:13px;color:var(--c-success);margin-bottom:12px">' + t('All words looking good!', '所有词汇都掌握得不错！') + '</div>';
  }

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()">' + t('Close', '关闭') + '</button>';
  showModal(html);
}

async function deleteHw(hwId, classId) {
  if (!confirm(t('Delete this homework?', '确定删除此作业？'))) return;
  try {
    await sb.rpc('delete_assignment', { p_id: hwId });
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
    var res = await sb.rpc('list_class_assignments', { p_class_id: userClassId });
    var hws = res.data || [];

    var rRes = await sb.from('assignment_results')
      .select('*')
      .eq('user_id', currentUser.id);
    var results = rRes.data || [];
    var resultMap = {};
    results.forEach(function(r) { resultMap[r.assignment_id] = r; });

    var mapped = hws.map(function(hw) {
      hw._result = resultMap[hw.id] || null;
      return hw;
    });
    return mapped;
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

    var bannerAction = _isPracticeHw(hw) ? 'startHwPractice(\'' + hw.id + '\')' : 'startHwTest(\'' + hw.id + '\')';
    html += '<div class="hw-banner-item" onclick="event.stopPropagation();' + bannerAction + '">';
    html += '<span>' + (_isPracticeHw(hw) ? '\u270f\ufe0f ' : '') + escapeHtml(hw.title) + '</span>';
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

  /* Cross-board homework may reference slugs from any board */
  try { await ensureAllBoardsLoaded(); } catch(e) {}

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
  html += '<div class="hw-section-title mt-8">' + t('Pending', '待完成') + ' (' + pending.length + ')</div>';
  if (pending.length === 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);padding:12px 0">' + t('All done!', '全部完成！') + ' \ud83c\udf89</div>';
  }
  pending.forEach(function(hw) {
    var deadline = new Date(hw.deadline);
    var isOverdue = deadline < new Date();
    var hasResult = hw._result && hw._result.attempts > 0;
    var pct = (hasResult && hw._result.total_count > 0) ? Math.round(hw._result.correct_count / hw._result.total_count * 100) : 0;
    var isPractice = _isPracticeHw(hw);
    var isCustom = !isPractice && hw.custom_vocabulary && hw.custom_vocabulary.length > 0;

    var prefix = isPractice ? '\u270f\ufe0f ' : (isCustom ? '\ud83c\udfaf ' : '');
    var countLabel = '';
    var pWords = [];

    if (isPractice) {
      countLabel = hw.custom_vocabulary.count + ' ' + t('questions', '\u9898');
    } else {
      /* Collect words for preview */
      if (isCustom) {
        var cp = getPairs(hw.custom_vocabulary);
        cp.forEach(function(p) { pWords.push({ word: p.word, def: p.def }); });
      } else if (hw.deck_slugs && hw.deck_slugs.length > 0) {
        hw.deck_slugs.forEach(function(slug) {
          var lv = getLevelBySlug(slug);
          if (lv) {
            var dp = getPairs(lv.vocabulary);
            dp.forEach(function(p) { pWords.push({ word: p.word, def: p.def }); });
          }
        });
      }
      countLabel = pWords.length + ' ' + t('words', '\u8bcd');
    }

    html += '<div class="hw-list-item hw-list-item-wrap">';
    html += '<div style="display:flex;align-items:center;gap:8px;width:100%">';
    html += '<span class="hw-list-title flex-1">' + prefix + escapeHtml(hw.title) + ' <span style="font-size:11px;color:var(--c-text2)">(' + countLabel + ')</span></span>';
    if (hasResult) {
      html += '<span style="font-size:12px;color:var(--c-primary);font-weight:600">' + pct + '%</span>';
    }
    html += '<span class="hw-list-deadline" style="' + (isOverdue ? 'color:var(--c-danger)' : '') + '">';
    html += (isOverdue ? t('Pending', '待完成') + ' ' : '') + deadline.toLocaleDateString();
    html += '</span>';
    html += '<button class="btn btn-primary btn-sm" data-action="hw-go" data-hwid="' + hw.id + '" data-practice="' + (isPractice ? '1' : '0') + '">GO \u2192</button>';
    html += '</div>';

    /* Expandable word list (vocab HW only) */
    if (!isPractice && pWords.length > 0) {
      var previewId = 'hw-preview-' + hw.id.slice(0, 8);
      html += '<div style="width:100%;margin-top:6px">';
      html += '<button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px" data-toggle-preview="' + previewId + '">' + t('View words', '\u67e5\u770b\u8bcd\u6c47') + ' \u25BC</button>';
      html += '<div id="' + previewId + '" style="display:none;margin-top:6px;max-height:180px;overflow-y:auto;border:1px solid var(--c-border);border-radius:8px;padding:6px 10px;background:var(--c-surface)">';
      pWords.forEach(function(w, i) {
        html += '<div style="padding:3px 0;font-size:12px;' + (i < pWords.length - 1 ? 'border-bottom:1px solid var(--c-border-light)' : '') + '">';
        html += '<strong>' + escapeHtml(w.word) + '</strong> \u2014 ' + escapeHtml(w.def);
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '</div>';
  });

  /* Completed section */
  html += '<div class="hw-section-title mt-20">' + t('Completed', '\u5df2\u5b8c\u6210') + ' (' + completed.length + ')</div>';
  completed.forEach(function(hw) {
    var r = hw._result;
    var pct = r.total_count > 0 ? Math.round(r.correct_count / r.total_count * 100) : 0;
    var completedDate = r.completed_at ? new Date(r.completed_at).toLocaleDateString() : '';
    var isPractice2 = _isPracticeHw(hw);
    var isCustom = !isPractice2 && hw.custom_vocabulary && hw.custom_vocabulary.length > 0;
    var prefix2 = isPractice2 ? '\u270f\ufe0f ' : (isCustom ? '\ud83c\udfaf ' : '');

    /* Study suggestion based on score */
    var tip = '';
    if (pct >= 90) tip = t('Excellent! Move to next topic', '\u5f88\u68d2\uff01\u53ef\u4ee5\u7ee7\u7eed\u4e0b\u4e00\u4e13\u9898');
    else if (pct >= 70) tip = isPractice2 ? t('Good! Try harder questions', '\u4e0d\u9519\uff01\u8bd5\u8bd5\u66f4\u96be\u7684\u9898') : t('Good! Let\'s strengthen these words', '不错！来巩固一下这些词');
    else tip = isPractice2 ? t('Review the sections and try again', '\u590d\u4e60\u77e5\u8bc6\u70b9\u540e\u518d\u8bd5') : t('Keep practicing this group', '\u7ee7\u7eed\u7ec3\u4e60\u8fd9\u4e2a\u8bcd\u7ec4');

    html += '<div class="hw-list-item hw-list-item-wrap">';
    html += '<span class="hw-list-title">' + prefix2 + escapeHtml(hw.title) + '</span>';
    html += '<span style="font-size:12px;font-weight:600;color:' + (pct >= 70 ? 'var(--c-success)' : 'var(--c-warning)') + '">' + r.correct_count + '/' + r.total_count + ' (' + pct + '%)</span>';
    html += '<span class="hw-list-deadline">' + completedDate + '</span>';
    html += '<button class="btn btn-ghost btn-sm" data-action="hw-retry" data-hwid="' + hw.id + '" data-practice="' + (isPractice2 ? '1' : '0') + '">' + t('Retry', '\u91cd\u505a') + '</button>';
    html += '<div class="hw-tip-row">\ud83d\udca1 ' + tip + '</div>';
    html += '</div>';
  });

  if (hws.length === 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);padding:24px 0;text-align:center">' + t('No homework assigned yet', '还没有作业') + '</div>';
  }

  el.innerHTML = html;
}

/* ═══ STUDENT: HOMEWORK TEST ═══ */
var _hwTest = null;
var _pendingWrongWords = null;

async function startHwTest(hwId) {
  showPanel('homework');
  var el = E('panel-homework');
  if (!el) return;
  el.innerHTML = '<div class="admin-loading">' + t('Loading homework...', '加载作业中...') + '</div>';

  /* Ensure all boards loaded for cross-board homework */
  try { await ensureAllBoardsLoaded(); } catch(e) {}

  try {
    var aRes = await sb.rpc('get_assignment', { p_id: hwId });
    if (aRes.error) { el.innerHTML = '<div class="admin-empty">Load failed</div>'; return; }
    var hw = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
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
        var i = getLevelIdxBySlug(slug);
        if (i < 0) return;
        var pairs = getPairs(LEVELS[i].vocabulary);
        pairs.forEach(function(p) {
          words.push({ word: p.word, def: p.def, levelIdx: i, lid: p.lid });
        });
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
    html += '<button class="hw-option" data-correct="' + (opt === answer ? '1' : '0') + '" data-answer="' + escapeHtml(answer) + '">' + escapeHtml(opt) + '</button>';
  });
  html += '</div>';

  el.innerHTML = html;

  /* Delegated click for answer buttons (bind once) */
  if (!_hwQuestionDelegated) {
    el.addEventListener('click', function(e) {
      var btn = e.target.closest('.hw-option[data-correct]');
      if (btn) pickHwAnswer(btn, btn.dataset.correct === '1', btn.dataset.answer);
    });
    _hwQuestionDelegated = true;
  }
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

    var upsRes = await sb.from('assignment_results').upsert(resultData, { onConflict: 'assignment_id,user_id' });
    if (upsRes.error) return;

    /* Notify teacher about completion */
    var aRes = await sb.rpc('get_assignment', { p_id: t_.hwId });
    var hwData = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
    if (hwData) {
      var tRes = await sb.from('teachers').select('user_id').eq('id', hwData.teacher_id).single();
      if (tRes.data && !tRes.error) {
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

  /* Add words-to-review section */
  if (t_.wrongWords.length > 0) {
    resultHtml += '<div style="margin-top:16px;text-align:left">';
    resultHtml += '<div class="hw-section-title text-danger">' + t('Words to Review', '待复习词') + ' (' + t_.wrongWords.length + ')</div>';
    t_.wrongWords.forEach(function(w) {
      resultHtml += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--c-border-light)">';
      resultHtml += '<strong>' + escapeHtml(w.word) + '</strong> — ' + escapeHtml(w.def);
      resultHtml += '</div>';
    });
    resultHtml += '<div style="font-size:12px;color:var(--c-text2);margin-top:8px">\ud83d\udca1 ' + t('Try reviewing these words in Study mode', '建议在学习模式中复习这些词') + '</div>';
    if (t_.wrongWords.length >= 2) {
      resultHtml += '<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="saveWrongWordsAsDeck()">'
        + t('Save as Study Deck', '保存为学习卡组') + '</button>';
    }
    resultHtml += '</div>';
  }

  if (t_.wrongWords.length >= 2) {
    _pendingWrongWords = { title: t_.title, words: t_.wrongWords };
  } else {
    _pendingWrongWords = null;
  }

  el.innerHTML = resultHtml;
  _hwTest = null;
}

function saveWrongWordsAsDeck() {
  if (!_pendingWrongWords || _pendingWrongWords.words.length < 2) return;
  var ww = _pendingWrongWords;

  var vocab = [];
  ww.words.forEach(function(w, i) {
    vocab.push({ id: i + 1, type: 'word', content: w.word });
    vocab.push({ id: i + 1, type: 'def',  content: w.def });
  });

  var level = {
    title: ww.title + ' - ' + t('Words to Review', '待复习词'),
    timer: Math.max(60, ww.words.length * 10),
    comboBonus: 3,
    vocabulary: vocab,
    custom: true
  };

  LEVELS.push(level);
  saveCustomLevel(level);

  _pendingWrongWords = null;

  showToast(t('Saved! ' + ww.words.length + ' words added as study deck',
    '已保存！' + ww.words.length + ' 个待复习词已添加为学习卡组'));

  var btns = document.querySelectorAll('[onclick="saveWrongWordsAsDeck()"]');
  btns.forEach(function(b) {
    b.disabled = true;
    b.textContent = t('Saved \u2713', '\u5df2\u4fdd\u5b58 \u2713');
  });
}

/* ═══ STUDENT: PRACTICE HOMEWORK ═══ */
var _hwPractice = null;

async function startHwPractice(hwId) {
  showPanel('homework');
  var el = E('panel-homework');
  if (!el) return;
  el.innerHTML = '<div class="admin-loading">' + t('Loading practice...', '\u52a0\u8f7d\u7ec3\u4e60\u9898\u4e2d...') + '</div>';

  try {
    var aRes = await sb.rpc('get_assignment', { p_id: hwId });
    var hw = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
    if (!hw) { el.innerHTML = '<div class="admin-empty">Not found</div>'; return; }

    var config = hw.custom_vocabulary;
    if (!config || config._type !== 'practice') {
      startHwTest(hwId);
      return;
    }
    /* Normalize legacy 'edexcel' → 'edx' from old DB records */
    if (config.board === 'edexcel') config.board = 'edx';

    var sectionIds = hw.deck_slugs || [];
    var dataBoard = config.board;

    await Promise.all([loadPracticeData(dataBoard), loadKaTeX()]);

    var allQ = [];
    sectionIds.forEach(function(secId) {
      var secQ = (_pqData[dataBoard] || []).filter(function(q) { return q.s === secId; });
      allQ = allQ.concat(secQ);
    });
    if (config.difficulty) {
      var diff = config.difficulty;
      allQ = allQ.filter(function(q) { return q.d === diff; });
    }
    allQ = shuffle(allQ).slice(0, config.count);

    if (allQ.length === 0) {
      el.innerHTML = '<div class="admin-empty">' + t('No questions found for selected sections', '\u6240\u9009\u77e5\u8bc6\u70b9\u6682\u65e0\u9898\u76ee') + '</div>';
      return;
    }

    _hwPractice = {
      hwId: hwId,
      title: hw.title,
      questions: allQ,
      current: 0,
      correct: 0,
      total: allQ.length,
      answers: [],
      wrongQuestions: []
    };

    renderHwPracticeCard();
  } catch (e) {
    el.innerHTML = '<div class="admin-empty">' + escapeHtml(e.message) + '</div>';
  }
}

function renderHwPracticeCard() {
  var el = E('panel-homework');
  if (!el || !_hwPractice) return;

  var s = _hwPractice;
  if (s.current >= s.total) {
    finishHwPractice();
    return;
  }

  var q = s.questions[s.current];
  var progressPct = Math.round(s.current / s.total * 100);

  var html = '<div class="hw-header">';
  html += '<button class="back-btn" data-action="hw-quit-practice">\u2190</button>';
  html += '<div class="deck-title">' + escapeHtml(s.title) + '</div>';
  html += '<div style="font-size:13px;color:var(--c-text2);margin-left:auto">' + (s.current + 1) + '/' + s.total + '</div>';
  html += '</div>';

  html += '<div class="hw-progress-bar"><div class="hw-progress-fill" style="width:' + progressPct + '%"></div></div>';

  html += '<div class="pq-card" style="margin:16px 0">';
  html += '<div class="pq-question" style="font-size:15px;padding:16px">' + pqRender(q.q) + '</div>';
  html += '<div class="pq-options" style="padding:0 16px 16px">';
  for (var i = 0; i < q.o.length; i++) {
    html += '<button class="pq-opt hw-pq-opt" data-idx="' + i + '" onclick="pickHwPracticeOpt(this,' + i + ')">';
    html += '<span class="pq-opt-letter">' + String.fromCharCode(65 + i) + '</span>';
    html += '<span class="pq-opt-text">' + pqRender(q.o[i]) + '</span>';
    html += '</button>';
  }
  html += '</div></div>';

  el.innerHTML = html;
  renderMath(el);
}

function pickHwPracticeOpt(btn, idx) {
  if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;

  var s = _hwPractice;
  var q = s.questions[s.current];
  var opts = document.querySelectorAll('.hw-pq-opt');
  opts.forEach(function(o) { o.classList.add('disabled'); });

  var isCorrect = idx === q.a;

  if (isCorrect) {
    btn.classList.add('correct');
    s.correct++;
    playCorrect();
  } else {
    btn.classList.add('wrong');
    opts.forEach(function(o) {
      if (parseInt(o.getAttribute('data-idx')) === q.a) o.classList.add('correct');
    });
    playWrong();
    s.wrongQuestions.push({ qid: q.id, q: (q.q || '').slice(0, 80), correctAnswer: q.o[q.a] });
  }

  /* Show explanation */
  if (q.e) {
    var expDiv = document.createElement('div');
    expDiv.className = 'pq-explanation';
    expDiv.style.cssText = 'margin:8px 16px 16px;padding:10px 14px;border-radius:8px;background:var(--c-surface-alt);font-size:13px';
    expDiv.innerHTML = '<strong>' + t('Explanation', '\u89e3\u6790') + ':</strong> ' + pqRender(q.e);
    var card = btn.closest('.pq-card');
    if (card) card.appendChild(expDiv);
    renderMath(expDiv);
  }

  s.answers.push({ qid: q.id, correct: isCorrect });
  s.current++;

  setTimeout(function() {
    renderHwPracticeCard();
  }, 1200);
}

async function finishHwPractice() {
  var el = E('panel-homework');
  if (!el || !_hwPractice) return;

  var s = _hwPractice;
  var pct = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;

  /* Upsert result to DB */
  try {
    var now = new Date().toISOString();
    var existing = await sb.from('assignment_results')
      .select('attempts')
      .eq('assignment_id', s.hwId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    var resultData = {
      assignment_id: s.hwId,
      user_id: currentUser.id,
      attempts: (existing.data ? (existing.data.attempts || 0) : 0) + 1,
      correct_count: s.correct,
      total_count: s.total,
      wrong_words: s.wrongQuestions,
      completed_at: now,
      last_attempt_at: now
    };

    var upsRes2 = await sb.from('assignment_results').upsert(resultData, { onConflict: 'assignment_id,user_id' });
    if (upsRes2.error) return;

    /* Notify teacher */
    var aRes = await sb.rpc('get_assignment', { p_id: s.hwId });
    var hwData = (aRes.data && aRes.data.length > 0) ? aRes.data[0] : null;
    if (hwData) {
      var tRes = await sb.from('teachers').select('user_id').eq('id', hwData.teacher_id).single();
      if (tRes.data && !tRes.error) {
        await sendNotification(tRes.data.user_id, 'hw_result',
          getDisplayName() + ' ' + t('completed practice', '\u5b8c\u6210\u4e86\u7ec3\u4e60\u9898'),
          s.title + ' \u2014 ' + s.correct + '/' + s.total + ' (' + pct + '%)',
          'hw_result', s.hwId);
      }
    }
  } catch (e) { /* ignore */ }

  /* Show result screen */
  var resultHtml = resultScreenHTML(
    s.correct, s.total,
    'startHwPractice(\'' + s.hwId + '\')',
    'showStudentHwPage()',
    'practice-hw'
  );

  /* Wrong questions review */
  if (s.wrongQuestions.length > 0) {
    resultHtml += '<div style="margin-top:16px;text-align:left">';
    resultHtml += '<div class="hw-section-title text-danger">' + t('Questions to Review', '待复习题') + ' (' + s.wrongQuestions.length + ')</div>';
    s.wrongQuestions.forEach(function(w) {
      resultHtml += '<div style="padding:6px 0;font-size:13px;border-bottom:1px solid var(--c-border-light)">';
      resultHtml += '<div>' + pqRender(w.q) + '</div>';
      resultHtml += '<div style="color:var(--c-success);font-size:12px;margin-top:2px">' + t('Answer', '\u7b54\u6848') + ': ' + pqRender(w.correctAnswer) + '</div>';
      resultHtml += '</div>';
    });
    resultHtml += '</div>';
  }

  el.innerHTML = resultHtml;
  renderMath(el);
  _hwPractice = null;
}

/* ═══ HOMEWORK EVENT DELEGATION ═══ */
(function() {
  document.addEventListener('click', function(e) {
    /* B7: quit practice */
    var qp = e.target.closest('[data-action="hw-quit-practice"]');
    if (qp) { if (confirm(t('Quit practice?', '\u9000\u51fa\u7ec3\u4e60\uff1f'))) showStudentHwPage(); return; }

    /* B6: toggle preview */
    var tp = e.target.closest('[data-toggle-preview]');
    if (tp) { e.stopPropagation(); var el = document.getElementById(tp.dataset.togglePreview); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; return; }

    /* B3: student hw detail */
    var sd = e.target.closest('[data-action="hw-student-detail"]');
    if (sd) { showStudentHwDetail(sd.dataset.hwid, sd.dataset.uid, sd.dataset.name, sd.dataset.cid); return; }

    /* B4: hw detail / delete */
    var hd = e.target.closest('[data-action="hw-detail"]');
    if (hd) { renderHwProgress(hd.dataset.hwid, hd.dataset.cid); return; }
    var hdel = e.target.closest('[data-action="hw-delete"]');
    if (hdel) { deleteHw(hdel.dataset.hwid, hdel.dataset.cid); return; }

    /* B8: student GO button */
    var hgo = e.target.closest('[data-action="hw-go"]');
    if (hgo) { e.stopPropagation(); if (hgo.dataset.practice === '1') startHwPractice(hgo.dataset.hwid); else startHwTest(hgo.dataset.hwid); return; }

    /* B9: completed Retry button */
    var hretry = e.target.closest('[data-action="hw-retry"]');
    if (hretry) { if (hretry.dataset.practice === '1') startHwPractice(hretry.dataset.hwid); else startHwTest(hretry.dataset.hwid); return; }
  });

  /* B5: template selector change */
  document.addEventListener('change', function(e) {
    var tpl = e.target.closest('[data-hw-tpl-cid]');
    if (tpl) hwLoadTemplate(tpl.dataset.hwTplCid);
  });
})();
