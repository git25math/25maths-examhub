/* ══════════════════════════════════════════════════════════════
   bug-report.js — Bug report form (lazy-loaded)
   ══════════════════════════════════════════════════════════════ */

function showBugReport() {
  var types = [
    ['ui', t('UI Issue', '界面问题')],
    ['data', t('Data Error', '数据错误')],
    ['crash', t('Crash', '崩溃')],
    ['feature', t('Feature Request', '功能建议')],
    ['other', t('Other', '其他')]
  ];
  var typeOpts = types.map(function(tp) {
    return '<option value="' + tp[0] + '">' + tp[1] + '</option>';
  }).join('');

  var userType = isGuest() ? 'Guest' : (isLoggedIn() ? 'Registered' : 'Unknown');
  var autoInfo = 'App: ' + APP_VERSION + '\nBoard: ' + (userBoard || 'none') +
    '\nUser: ' + userType +
    '\nLang: ' + appLang +
    '\nBrowser: ' + navigator.userAgent;

  var html = '<div class="section-title">' + t('Report a Bug', '报告问题') + '</div>';
  html += '<label class="settings-label">' + t('Bug Type', '问题类型') + '</label>';
  html += '<select class="bug-select" id="bug-type">' + typeOpts + '</select>';
  html += '<label class="settings-label">' + t('Description', '描述') + ' *</label>';
  html += '<textarea class="bug-textarea" id="bug-desc" rows="4" placeholder="' + t('Describe the issue...', '请描述问题...') + '"></textarea>';
  html += '<label class="settings-label">' + t('Steps to Reproduce', '复现步骤') + ' (' + t('optional', '选填') + ')</label>';
  html += '<textarea class="bug-textarea" id="bug-steps" rows="3" placeholder="' + t('1. Go to...\n2. Click on...\n3. See error', '1. 打开...\n2. 点击...\n3. 出现错误') + '"></textarea>';
  html += '<label class="settings-label">' + t('Auto-collected Info', '自动收集信息') + '</label>';
  html += '<textarea class="bug-textarea bug-auto" rows="4" readonly>' + autoInfo + '</textarea>';
  html += '<div id="bug-msg" class="text-sm text-danger" style="margin:8px 0;min-height:20px"></div>';
  html += '<div class="btn-row">';
  var submitLabel = (isLoggedIn() && !isGuest()) ? t('Submit', '提交') : t('Submit via Email', '通过邮件提交');
  html += '<button class="btn btn-primary" onclick="submitBugReport()">' + submitLabel + '</button>';
  html += '<button class="btn btn-ghost" onclick="hideModal()">' + t('Cancel', '取消') + '</button>';
  html += '</div>';
  showModal(html);
}

async function submitBugReport() {
  var desc = E('bug-desc').value.trim();
  if (!desc) {
    E('bug-msg').textContent = t('Please describe the issue', '请描述问题');
    return;
  }
  var type = E('bug-type').value;
  var steps = E('bug-steps').value.trim();

  /* Logged-in users: save to DB */
  if (sb && isLoggedIn() && !isGuest()) {
    try {
      var res = await sb.from('feedback').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        type: type,
        description: desc,
        steps: steps,
        auto_info: { board: userBoard, lang: appLang, ua: navigator.userAgent }
      });
      if (res.error) throw new Error(res.error.message);
      hideModal();
      showToast(t('Feedback submitted!', '反馈已提交！'));
    } catch (e) {
      E('bug-msg').textContent = t('Submit failed: ', '提交失败：') + e.message;
    }
    return;
  }

  /* Guest: mailto fallback */
  var userType = isGuest() ? 'Guest' : 'Unknown';
  var subject = '[Bug] ' + type + ' - 25Maths Exam Support Hub';
  var body = 'Bug Type: ' + type + '\n\n' +
    'Description:\n' + desc + '\n\n' +
    (steps ? 'Steps to Reproduce:\n' + steps + '\n\n' : '') +
    '--- Auto Info ---\n' +
    'App: ' + APP_VERSION + '\n' +
    'Board: ' + (userBoard || 'none') + '\n' +
    'User: ' + userType + '\n' +
    'Lang: ' + appLang + '\n' +
    'Browser: ' + navigator.userAgent;
  var mailto = 'mailto:support@25maths.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  window.open(mailto, '_blank');
  hideModal();
  showToast(t('Opening email client...', '正在打开邮件客户端...'));
}
