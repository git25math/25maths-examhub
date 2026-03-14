/* ══════════════════════════════════════════════════════════════
   settings.js — Settings panel (lazy-loaded)
   ══════════════════════════════════════════════════════════════ */

/* Check if current user is a locked student (board managed by school) */
function _isStudentLocked() {
  if (!isLoggedIn() || isGuest()) return false;
  if (isTeacher() || isSuperAdmin()) return false;
  return !!userClassId;
}

function changeBoardFromSettings() {
  hideModal();
  E('app-shell').style.display = 'none';
  showBoardSelection();
}

function showSettings() {
  if (!isLoggedIn()) {
    showToast(t('Please login first', '\u8bf7\u5148\u767b\u5f55'));
    return;
  }

  /* Guest limited settings */
  if (isGuest()) {
    var boardOpt = getUserBoardOption();
    var boardDisplay = boardOpt ? (boardOpt.emoji + ' ' + t(boardOpt.name, boardOpt.nameZh)) : t('Not selected', '\u672a\u9009\u62e9');
    var gHtml = '<div class="section-title">' + t('\u2699 Settings', '\u2699 \u8bbe\u7f6e') + '</div>';
    /* Course section — can change */
    gHtml += '<div class="settings-section">';
    gHtml += '<label class="settings-label">' + t('Course / Year', '\u8003\u8bd5\u5c40 / \u5e74\u7ea7') + '</label>';
    gHtml += '<div class="settings-board-current">' + boardDisplay + '</div>';
    if (!isSubdomainLocked()) {
      gHtml += '<button class="btn btn-ghost btn-sm" onclick="changeBoardFromSettings()">' + t('Change', '\u66f4\u6362') + '</button>';
    }
    gHtml += '</div>';
    gHtml += '<div class="settings-divider"></div>';
    /* Select-to-Translate toggle */
    gHtml += '<div class="settings-section">';
    gHtml += '<label class="settings-label">' + t('Select-to-Translate', '划词翻译') + '</label>';
    gHtml += '<div class="text-sm text-sub mb-8">' + t('Select text to see translation from vocabulary', '选中文字即可查看词库翻译') + '</div>';
    gHtml += '<label style="cursor:pointer"><input type="checkbox" id="settings-translate"' + ((localStorage.getItem('wmatch_translate') === '1') ? ' checked' : '') + ' onchange="_lazyLoad(\'translate\', function(){ toggleTranslate(this.checked); }.bind(this))"> ' + t('Enable', '启用') + '</label>';
    gHtml += '</div>';
    gHtml += '<div class="settings-divider"></div>';
    /* Locked features list */
    gHtml += '<div class="settings-section">';
    gHtml += '<label class="settings-label">' + t('Login to unlock', '\u767b\u5f55\u540e\u53ef\u89e3\u9501') + '</label>';
    gHtml += '<div class="text-sm text-sub" style="line-height:2">';
    gHtml += '<div>\ud83d\udd12 ' + t('Set nickname', '\u8bbe\u7f6e\u6635\u79f0') + '</div>';
    gHtml += '<div>\ud83d\udd12 ' + t('Change password', '\u4fee\u6539\u5bc6\u7801') + '</div>';
    gHtml += '<div>\ud83d\udd12 ' + t('Cloud sync', '\u4e91\u7aef\u540c\u6b65') + '</div>';
    gHtml += '</div></div>';
    /* Buttons */
    gHtml += '<div class="btn-row btn-row--mt16">';
    gHtml += '<button class="btn btn-primary" onclick="hideModal();doLogout()">' + t('Login / Register', '\u767b\u5f55 / \u6ce8\u518c') + '</button>';
    gHtml += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Close', '\u5173\u95ed') + '</button>';
    gHtml += '</div>';
    showModal(gHtml);
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
    (isSubdomainLocked() || _isStudentLocked() ? '' : '<button class="btn btn-ghost btn-sm" onclick="changeBoardFromSettings()">' + t('Change', '\u66f4\u6362') + '</button>') +
    (_isStudentLocked() ? '<div class="text-sm text-sub" style="margin-top:4px">' + t('Managed by your school. Contact your teacher to change.', '由学校管理员设定，如需更改请联系老师') + '</div>' : '') +
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
    '<div class="text-sm text-sub mb-8">' + (function() {
      if (!_lastSyncOkAt) return t('Not synced yet', '\u5c1a\u672a\u540c\u6b65');
      var ago = Math.floor((Date.now() - _lastSyncOkAt) / 60000);
      if (ago < 1) return t('Last sync: just now', '\u4e0a\u6b21\u540c\u6b65\uff1a\u521a\u521a');
      if (ago < 60) return t('Last sync: ' + ago + ' min ago', '\u4e0a\u6b21\u540c\u6b65\uff1a' + ago + ' \u5206\u949f\u524d');
      var hrs = Math.floor(ago / 60);
      return t('Last sync: ' + hrs + 'h ago', '\u4e0a\u6b21\u540c\u6b65\uff1a' + hrs + ' \u5c0f\u65f6\u524d');
    })() + '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="manualSync()">' + t('Sync Now', '\u7acb\u5373\u540c\u6b65') + '</button>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-section">' +
    '<label class="settings-label">' + t('Select-to-Translate', '划词翻译') + '</label>' +
    '<div class="text-sm text-sub mb-8">' + t('Select text to see translation from vocabulary', '选中文字即可查看词库翻译') + '</div>' +
    '<label style="cursor:pointer"><input type="checkbox" id="settings-translate"' + ((localStorage.getItem('wmatch_translate') === '1') ? ' checked' : '') + '> ' + t('Enable', '启用') + '</label>' +
    '</div>' +
    '<div class="settings-msg" id="settings-msg"></div>' +
    '<div class="btn-row btn-row--mt16">' +
    '<button class="btn btn-primary" onclick="saveSettings()">' + t('Save', '保存') + '</button>' +
    '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>' +
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

  try {
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

    /* Select-to-Translate toggle */
    var trEl = E('settings-translate');
    if (trEl) {
      if (typeof toggleTranslate === 'function') toggleTranslate(trEl.checked);
      else _lazyLoad('translate', function() { toggleTranslate(trEl.checked); });
    }

    if (updated) {
      showToast(t('Saved', '保存成功'));
      hideModal();
    } else {
      hideModal();
    }
  } catch (e) {
    msgEl.textContent = t('Save failed: ', '保存失败: ') + e.message;
    msgEl.className = 'settings-msg error';
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
