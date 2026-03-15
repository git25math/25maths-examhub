/* ══════════════════════════════════════════════════════════════
   smart-notif.js — Smart Notification System (v5.4.0)
   Notification infrastructure (migrated from homework.js) +
   Guest local notifications + throttle/dedup + 5 trigger categories.
   Loaded in core bundle for ALL users (including Guest).
   ══════════════════════════════════════════════════════════════ */

/* ═══ NOTIFICATION INFRASTRUCTURE (migrated from homework.js) ═══ */
var _notifCache = null;
var _notifCount = 0;

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
  if (isGuest()) {
    _notifCache = _loadLocalNotifications();
    _notifCount = _notifCache.filter(function(n) { return !n.is_read; }).length;
    updateNotifBadge();
    return _notifCache;
  }
  if (!sb || !isLoggedIn()) return [];
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
  if (isGuest()) {
    sendLocalNotification(type, title, body, linkType, linkId);
    return;
  }
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
  if (isGuest()) {
    _markLocalNotifRead(id);
    return;
  }
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
  if (isGuest()) {
    _markAllLocalNotifsRead();
    return;
  }
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

/* ═══ NOTIFICATION PANEL ═══ */

function _notifTimeAgo(iso) {
  if (!iso) return '';
  var diff = Date.now() - new Date(iso).getTime();
  var m = Math.floor(diff / 60000);
  if (m < 1) return t('just now', '刚刚');
  if (m < 60) return m + t('m ago', '分钟前');
  var h = Math.floor(m / 60);
  if (h < 24) return h + t('h ago', '小时前');
  var d = Math.floor(h / 24);
  if (d < 30) return d + t('d ago', '天前');
  return new Date(iso).toLocaleDateString();
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
      var time = n.created_at ? _notifTimeAgo(n.created_at) : '';
      var ntype = n.type || '';
      html += '<div class="notif-item' + (unread ? ' unread' : '') +
        '" role="button" tabindex="0" data-nid="' + escapeHtml(String(n.id)) +
        '" data-ntype="' + escapeHtml(n.link_type || '') +
        '" data-nlid="' + escapeHtml(n.link_id || '') +
        '" data-ntypec="' + escapeHtml(ntype) + '">';
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
    if (typeof showStudentHwPage === 'function') showStudentHwPage();
  } else if (linkType === 'hw_result' && linkId) {
    if (typeof isTeacher === 'function' && isTeacher()) navTo('admin');
  } else if (linkType === 'plan') {
    navTo('plan');
  } else if (linkType === 'stats') {
    navTo('stats');
  } else if (linkType === 'section' && linkId) {
    var parts = linkId.split(':');
    if (parts.length === 2 && typeof openSection === 'function') {
      openSection(parts[1], parts[0]);
    }
  } else if (linkType === 'mistakes') {
    navTo('mistakes');
  } else if (linkType === 'daily') {
    navTo('daily');
  }
}

/* ═══ GUEST LOCAL NOTIFICATIONS ═══ */

var _LOCAL_NOTIF_KEY = 'local_notifications';
var _LOCAL_NOTIF_MAX = 50;

function sendLocalNotification(type, title, body, linkType, linkId) {
  var notifs = _loadLocalNotifications();
  var entry = {
    id: 'ln_' + Date.now(),
    type: type,
    title: title,
    body: body || '',
    link_type: linkType || '',
    link_id: linkId || '',
    is_read: false,
    created_at: new Date().toISOString()
  };
  notifs.unshift(entry);
  if (notifs.length > _LOCAL_NOTIF_MAX) notifs = notifs.slice(0, _LOCAL_NOTIF_MAX);
  try { localStorage.setItem(_LOCAL_NOTIF_KEY, JSON.stringify(notifs)); } catch (e) {}
  _notifCache = notifs;
  _notifCount = notifs.filter(function(n) { return !n.is_read; }).length;
  updateNotifBadge();
}

function _loadLocalNotifications() {
  try {
    return JSON.parse(localStorage.getItem(_LOCAL_NOTIF_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function _markLocalNotifRead(id) {
  var notifs = _loadLocalNotifications();
  for (var i = 0; i < notifs.length; i++) {
    if (notifs[i].id === id) { notifs[i].is_read = true; break; }
  }
  try { localStorage.setItem(_LOCAL_NOTIF_KEY, JSON.stringify(notifs)); } catch (e) {}
  _notifCache = notifs;
  _notifCount = notifs.filter(function(n) { return !n.is_read; }).length;
  updateNotifBadge();
}

function _markAllLocalNotifsRead() {
  var notifs = _loadLocalNotifications();
  notifs.forEach(function(n) { n.is_read = true; });
  try { localStorage.setItem(_LOCAL_NOTIF_KEY, JSON.stringify(notifs)); } catch (e) {}
  _notifCache = notifs;
  _notifCount = 0;
  updateNotifBadge();
}

/* ═══ THROTTLE / DEDUP SYSTEM ═══ */

var _THROTTLE_KEY = 'notif_sent_today';

function _getThrottleMap() {
  try {
    var raw = JSON.parse(localStorage.getItem(_THROTTLE_KEY)) || {};
    var today = new Date().toLocaleDateString('en-CA');
    if (raw._date !== today) return { _date: today };
    return raw;
  } catch (e) {
    return { _date: new Date().toLocaleDateString('en-CA') };
  }
}

function _isNotifThrottled(subtype) {
  var map = _getThrottleMap();
  return !!map[subtype];
}

function _markNotifSent(subtype) {
  var map = _getThrottleMap();
  map[subtype] = new Date().toLocaleDateString('en-CA');
  try { localStorage.setItem(_THROTTLE_KEY, JSON.stringify(map)); } catch (e) {}
}

/* ═══ CATEGORY 1: LEARNING MILESTONES ═══ */

function _notifBadgeUnlock(badge) {
  if (!badge || !badge.id) return;
  var key = 'badge_' + badge.id;
  if (_isNotifThrottled(key)) return;
  _markNotifSent(key);
  var title = t('Badge Unlocked!', '徽章解锁！');
  var body = (badge.icon || '') + ' ' + t(badge.en || badge.id, badge.zh || badge.id);
  if (isGuest()) {
    sendLocalNotification('milestone', title, body, 'stats', '');
  } else if (isLoggedIn() && currentUser) {
    sendNotification(currentUser.id, 'milestone', title, body, 'stats', '');
  }
}

var _STREAK_THRESHOLDS = [3, 7, 14, 30, 60, 100];

function _notifStreakAchievement(streakCount) {
  if (!streakCount || _STREAK_THRESHOLDS.indexOf(streakCount) === -1) return;
  var key = 'streak_' + streakCount;
  if (_isNotifThrottled(key)) return;
  _markNotifSent(key);
  var title = t(streakCount + '-Day Streak!', '连续学习 ' + streakCount + ' 天！');
  var body = t('Keep it up! Consistency is the key to mastery.', '继续保持！坚持是掌握的关键。');
  if (isGuest()) {
    sendLocalNotification('milestone', title, body, 'daily', '');
  } else if (isLoggedIn() && currentUser) {
    sendNotification(currentUser.id, 'milestone', title, body, 'daily', '');
  }
}

function _notifSectionMastered(sectionId, board) {
  if (!sectionId || !board) return;
  var key = 'section_mastered_' + board + ':' + sectionId;
  if (_isNotifThrottled(key)) return;
  _markNotifSent(key);
  var title = t('Section Mastered!', '知识点已掌握！');
  var body = sectionId;
  if (isGuest()) {
    sendLocalNotification('milestone', title, body, 'section', board + ':' + sectionId);
  } else if (isLoggedIn() && currentUser) {
    sendNotification(currentUser.id, 'milestone', title, body, 'section', board + ':' + sectionId);
  }
}

/* ═══ CATEGORY 2: DAILY PLAN ═══ */

function _checkDailyPlanNotif() {
  if (_isNotifThrottled('daily_plan')) return;
  try {
    var board = userBoard || 'cie';
    if (typeof getTodayRecoveryPlan !== 'function') return;
    var plan = getTodayRecoveryPlan(board);
    if (!plan || !plan.items || plan.items.length === 0) return;
    var vCount = 0, kCount = 0, pCount = 0;
    plan.items.forEach(function(item) {
      if (item.type === 'vocab') vCount++;
      else if (item.type === 'kp') kCount++;
      else if (item.type === 'pp') pCount++;
    });
    _markNotifSent('daily_plan');
    var parts = [];
    if (vCount > 0) parts.push(vCount + t(' vocab', ' 词汇'));
    if (kCount > 0) parts.push(kCount + t(' KPs', ' 知识点'));
    if (pCount > 0) parts.push(pCount + t(' questions', ' 真题'));
    var title = t("Today's Recovery Plan", '今日复习计划');
    var body = t('Today: ', '今日：') + parts.join(' + ') + t(' to review', '待复习');
    if (isGuest()) {
      sendLocalNotification('plan', title, body, 'plan', '');
    } else if (isLoggedIn() && currentUser) {
      sendNotification(currentUser.id, 'plan', title, body, 'plan', '');
    }
  } catch (e) { /* ignore */ }
}

/* ═══ CATEGORY 3: WEAKNESS ALERT ═══ */

function _checkWeaknessNotif() {
  try {
    if (typeof rebuildStudentProfile !== 'function') return;
    var profile = rebuildStudentProfile();
    if (!profile) return;

    /* Trend declining */
    if (profile.trend && profile.trend.direction === 'declining' && !_isNotifThrottled('weakness_trend')) {
      _markNotifSent('weakness_trend');
      var title = t('Time for a Review', '\u8be5\u590d\u4e60\u4e86');
      var body = t('Your recent scores suggest some topics could use a refresh. A quick review will help!', '\u6700\u8fd1\u7684\u6210\u7ee9\u663e\u793a\u6709\u4e9b\u77e5\u8bc6\u70b9\u53ef\u4ee5\u590d\u4e60\u4e00\u4e0b\u3002\u5feb\u901f\u590d\u67e5\u4f1a\u6709\u5e2e\u52a9\uff01');
      if (isGuest()) {
        sendLocalNotification('weakness', title, body, 'stats', '');
      } else if (isLoggedIn() && currentUser) {
        sendNotification(currentUser.id, 'weakness', title, body, 'stats', '');
      }
    }

    /* Dominant error patterns */
    if (profile.dominantPatterns && profile.dominantPatterns.length > 0 && !_isNotifThrottled('weakness_pattern')) {
      _markNotifSent('weakness_pattern');
      var pat = profile.dominantPatterns[0];
      var patLabel = typeof getErrorPatternLabel === 'function' ? getErrorPatternLabel(pat) : pat;
      var ptitle = t('Learning Insight', '\u5b66\u4e60\u6d1e\u5bdf');
      var pbody = t('We noticed a pattern — reviewing this will help: ', '\u6211\u4eec\u53d1\u73b0\u4e86\u4e00\u4e2a\u89c4\u5f8b\u2014\u2014\u590d\u4e60\u8fd9\u4e2a\u4f1a\u6709\u5e2e\u52a9\uff1a') + patLabel;
      if (isGuest()) {
        sendLocalNotification('weakness', ptitle, pbody, 'stats', '');
      } else if (isLoggedIn() && currentUser) {
        sendNotification(currentUser.id, 'weakness', ptitle, pbody, 'stats', '');
      }
    }

    /* Weak sections */
    if (profile.weakSections && profile.weakSections.length > 0 && !_isNotifThrottled('weakness_sections')) {
      _markNotifSent('weakness_sections');
      var ws = profile.weakSections[0];
      var wsId = ws.id || ws;
      var wsBoard = ws.board || userBoard || 'cie';
      var wtitle = t('Focus Suggestion', '\u5efa\u8bae\u5173\u6ce8');
      var wbody = t('Section ', '\u77e5\u8bc6\u70b9 ') + wsId + t(' could use some extra practice', ' \u53ef\u4ee5\u591a\u7ec3\u4e60\u4e00\u4e0b');
      if (isGuest()) {
        sendLocalNotification('weakness', wtitle, wbody, 'section', wsBoard + ':' + wsId);
      } else if (isLoggedIn() && currentUser) {
        sendNotification(currentUser.id, 'weakness', wtitle, wbody, 'section', wsBoard + ':' + wsId);
      }
    }
  } catch (e) { /* ignore */ }
}

/* ═══ CATEGORY 4: HOMEWORK DEADLINE ═══ */

async function _notifHomeworkDeadline() {
  if (_isNotifThrottled('hw_deadline')) return;
  if (!isLoggedIn() || isGuest() || !userClassId || typeof isTeacher === 'function' && isTeacher()) return;
  if (!sb) return;
  try {
    var res = await sb.rpc('list_class_assignments', { p_class_id: userClassId });
    var hws = res.data || [];
    var rRes = await sb.from('assignment_results')
      .select('assignment_id, completed_at')
      .eq('user_id', currentUser.id);
    var results = rRes.data || [];
    var completedSet = {};
    results.forEach(function(r) { if (r.completed_at) completedSet[r.assignment_id] = true; });

    var now = Date.now();
    var dayMs = 24 * 60 * 60 * 1000;
    var upcoming = hws.filter(function(hw) {
      if (completedSet[hw.id]) return false;
      var dl = new Date(hw.deadline).getTime();
      return dl > now && dl - now < dayMs;
    });
    if (upcoming.length === 0) return;
    _markNotifSent('hw_deadline');
    var title = t('Homework Due Soon!', '作业即将截止！');
    var body = upcoming.length + t(' assignment(s) due within 24 hours', ' 份作业将在 24 小时内截止');
    sendNotification(currentUser.id, 'hw_deadline', title, body, 'homework', '');
  } catch (e) { /* ignore */ }
}

/* ═══ CATEGORY 5: REFORGET WARNING ═══ */

function _notifReforgetWarning() {
  if (_isNotifThrottled('reforget_warning')) return;
  try {
    if (typeof _buildReforgetCountMap !== 'function') return;
    var map = _buildReforgetCountMap();
    var count = 0;
    for (var id in map) {
      if (map[id] >= 3) count++;
    }
    if (count === 0) return;
    _markNotifSent('reforget_warning');
    var title = t('Items Keep Slipping!', '多项反复遗忘！');
    var body = count + t(' item(s) forgotten 3+ times. Time to review!', ' 项内容已遗忘 3 次以上，该复习了！');
    if (isGuest()) {
      sendLocalNotification('reforget', title, body, 'mistakes', '');
    } else if (isLoggedIn() && currentUser) {
      sendNotification(currentUser.id, 'reforget', title, body, 'mistakes', '');
    }
  } catch (e) { /* ignore */ }
}

/* ═══ INITIALIZATION ═══ */

function initSmartNotifications() {
  _checkDailyPlanNotif();
  _notifReforgetWarning();
  _checkWeaknessNotif();
  _notifHomeworkDeadline();
}
