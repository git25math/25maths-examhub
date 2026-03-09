/* ══════════════════════════════════════════════════════════════
   study.js — FLM Scan mode (three-button filter cycle)
   ══════════════════════════════════════════════════════════════ */

var S = { pairs: [], idx: 0, round: 1, lvl: 0,
          results: { known: [], fuzzy: [], unknown: [] } };

/* Start scan mode for a level */
function startStudy(li, subset) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  S.lvl = li;
  S.round = 1;
  S.pairs = subset || shuffle(getPairs(lv.vocabulary));
  S.idx = 0;
  S.results = { known: [], fuzzy: [], unknown: [] };

  showPanel('study');
  renderStudyCard();
}

/* Start round 2+: only pool words (learning + uncertain) */
function _startNextRound(li) {
  S.round++;
  var pool = getPoolWords(li);
  if (pool.length === 0) {
    /* All mastered! */
    _finishAllMastered();
    return;
  }
  S.pairs = shuffle(pool);
  S.idx = 0;
  S.results = { known: [], fuzzy: [], unknown: [] };
  renderStudyCard();
}

/* ═══ REFRESH SCAN (mastered decay review) ═══ */

function startRefreshScan(staleWords) {
  if (!staleWords || staleWords.length === 0) return;
  var cap = typeof REFRESH_CAP !== 'undefined' ? REFRESH_CAP : 20;
  var words = staleWords.slice(0, cap);

  S._refreshMode = true;
  S.lvl = -1;
  S.round = 1;
  S.idx = 0;
  S.results = { known: [], fuzzy: [], unknown: [] };
  S.pairs = [];
  for (var i = 0; i < words.length; i++) {
    S.pairs.push({ word: words[i].word, def: words[i].def, lid: words[i].lid, _key: words[i].key });
  }

  showPanel('study');
  renderStudyCard();
}

function _renderRefreshCard() {
  if (S.idx >= S.pairs.length) { finishStudy(); return; }

  var p = S.pairs[S.idx];
  var progress = S.pairs.length > 0 ? Math.round(S.idx / S.pairs.length * 100) : 0;

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="S._refreshMode=false;navTo(\'plan\')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (S.idx + 1) + ' / ' + S.pairs.length + '</div>';
  html += '</div>';

  /* Recovery step bar */
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    html += _renderRecoveryStepBar();
  }

  /* Refresh label */
  html += '<div class="study-refresh-label">\ud83d\udd04 ' + t('Refresh Review', '\u8f7b\u91cf\u590d\u67e5') + '</div>';

  /* Word card */
  html += '<div class="scan-card" id="scan-card">';
  html += '<div class="scan-word">' + escapeHtml(p.word) + '</div>';
  html += '<div class="scan-def hidden" id="scan-def">' + escapeHtml(p.def) + '</div>';
  html += '</div>';

  /* Three scan buttons */
  html += '<div class="scan-actions" id="scan-actions">';
  html += '<button class="scan-btn scan-known" data-scan="known">';
  html += '<span class="scan-key">1</span> ' + t('Know it', '\u8ba4\u8bc6') + '</button>';
  html += '<button class="scan-btn scan-fuzzy" data-scan="fuzzy">';
  html += '<span class="scan-key">2</span> ' + t('Fuzzy', '\u6a21\u7cca') + '</button>';
  html += '<button class="scan-btn scan-unknown" data-scan="unknown">';
  html += '<span class="scan-key">3</span> ' + t("Don't know", '\u4e0d\u8ba4\u8bc6') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;

  var actions = E('scan-actions');
  if (actions && !actions._bound) {
    actions._bound = true;
    actions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-scan]');
      if (btn) rateScan(btn.dataset.scan);
    });
  }
}

function _finishRefreshScan() {
  var k = S.results.known.length;
  var f = S.results.fuzzy.length;
  var u = S.results.unknown.length;

  S._refreshMode = false;

  var _isRecovery = typeof isRecoverySessionActive === 'function' && isRecoverySessionActive();

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83d\udd04</div>';
  html += '<div class="result-title">' + t('Refresh Complete!', '\u590d\u67e5\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + t('Checked ' + (k + f + u) + ' stale words', '\u68c0\u67e5\u4e86 ' + (k + f + u) + ' \u4e2a\u8870\u9000\u8bcd\u6c47') + '</div>';
  html += '</div>';

  /* Result breakdown */
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Still know', '\u4ecd\u8ba4\u8bc6') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '\u6a21\u7cca') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Forgot', '\u5fd8\u8bb0') + '</div></div>';
  html += '</div>';

  if (f + u > 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);text-align:center;margin:8px 0">';
    html += t((f + u) + ' words returned to learning pool', (f + u) + ' \u4e2a\u8bcd\u5df2\u56de\u6d41\u5230\u5b66\u4e60\u6c60');
    html += '</div>';
  }

  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'plan\')">' + t('Back to Plan', '\u8fd4\u56de\u8ba1\u5212') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">' + t('Home', '\u9996\u9875') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;
  updateSidebar();
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;

  /* Recovery session: replace buttons with session-aware controls */
  if (_isRecovery) {
    _recordRecoveryResult('vocab');
    var panel = E('panel-study');
    var actionsDiv = panel ? panel.querySelector('.result-actions') : null;
    if (actionsDiv) {
      actionsDiv.outerHTML = _renderRecoveryStepBar() + _renderRecoveryResultButtons();
    }
  }
}

/* ═══ KP REFRESH SCAN (knowledge point decay review) ═══ */

function startKPRefreshScan() {
  var boards = typeof getVisibleBoards === 'function' ? getVisibleBoards() : ['cie'];
  var cap = typeof REFRESH_CAP !== 'undefined' ? REFRESH_CAP : 20;
  var promises = [];
  for (var i = 0; i < boards.length; i++) {
    if (boards[i] !== '25m') promises.push(loadKnowledgeData(boards[i]));
  }
  Promise.all(promises).then(function() {
    var staleList = typeof getStaleKPs === 'function' ? getStaleKPs() : [];
    if (staleList.length === 0) { showToast(t('No stale KPs', '没有衰退的知识点')); return; }
    var items = staleList.slice(0, cap);
    /* Resolve KP details from _kpData */
    var resolved = [];
    for (var j = 0; j < items.length; j++) {
      var kpId = items[j].id;
      var found = null;
      for (var b in _kpData) {
        if (!_kpData[b]) continue;
        for (var k = 0; k < _kpData[b].length; k++) {
          if (_kpData[b][k].id === kpId) { found = _kpData[b][k]; break; }
        }
        if (found) break;
      }
      if (found) resolved.push({ id: kpId, title: found.title, title_zh: found.title_zh || '' });
    }
    if (resolved.length === 0) return;
    S._kpRefreshMode = true;
    S._kpRefreshItems = resolved;
    S.idx = 0;
    S.results = { known: [], fuzzy: [], unknown: [] };
    S.pairs = [];
    for (var r = 0; r < resolved.length; r++) {
      S.pairs.push({ word: resolved[r].title, def: resolved[r].title_zh, _kpId: resolved[r].id });
    }
    showPanel('study');
    renderStudyCard();
  });
}

function _renderKPRefreshCard() {
  if (S.idx >= S.pairs.length) { finishStudy(); return; }
  var p = S.pairs[S.idx];
  var progress = S.pairs.length > 0 ? Math.round(S.idx / S.pairs.length * 100) : 0;
  var html = '';
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="S._kpRefreshMode=false;navTo(\'plan\')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (S.idx + 1) + ' / ' + S.pairs.length + '</div>';
  html += '</div>';
  /* Recovery step bar */
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    html += _renderRecoveryStepBar();
  }
  html += '<div class="study-refresh-label">\ud83d\udd04 ' + t('Knowledge Point Refresh', '知识点复查') + '</div>';
  html += '<div class="scan-card" id="scan-card">';
  html += '<div class="scan-word">' + (typeof pqRender === 'function' ? pqRender(p.word) : escapeHtml(p.word)) + '</div>';
  if (p.def) html += '<div class="scan-def hidden" id="scan-def">' + escapeHtml(p.def) + '</div>';
  html += '</div>';
  html += '<div class="scan-actions" id="scan-actions">';
  html += '<button class="scan-btn scan-known" data-scan="known"><span class="scan-key">1</span> ' + t('Know it', '认识') + '</button>';
  html += '<button class="scan-btn scan-fuzzy" data-scan="fuzzy"><span class="scan-key">2</span> ' + t('Fuzzy', '模糊') + '</button>';
  html += '<button class="scan-btn scan-unknown" data-scan="unknown"><span class="scan-key">3</span> ' + t("Don't know", '不认识') + '</button>';
  html += '</div>';
  E('panel-study').innerHTML = html;
  if (typeof renderMathInElement === 'function') renderMathInElement(E('panel-study'));
  var actions = E('scan-actions');
  if (actions && !actions._bound) {
    actions._bound = true;
    actions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-scan]');
      if (btn) rateScan(btn.dataset.scan);
    });
  }
}

function _finishKPRefreshScan() {
  var k = S.results.known.length;
  var f = S.results.fuzzy.length;
  var u = S.results.unknown.length;
  S._kpRefreshMode = false;

  var _isRecovery = typeof isRecoverySessionActive === 'function' && isRecoverySessionActive();

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83d\udd04</div>';
  html += '<div class="result-title">' + t('KP Refresh Complete!', '知识点复查完成！') + '</div>';
  html += '<div class="result-sub">' + t('Checked ' + (k + f + u) + ' stale KPs', '检查了 ' + (k + f + u) + ' 个衰退知识点') + '</div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Still know', '仍认识') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '模糊') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Forgot', '忘记') + '</div></div>';
  html += '</div>';
  if (f + u > 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);text-align:center;margin:8px 0">';
    html += t((f + u) + ' KPs returned to learning', (f + u) + ' 个知识点已回流到学习池');
    html += '</div>';
  }
  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'plan\')">' + t('Back to Plan', '返回计划') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">' + t('Home', '首页') + '</button>';
  html += '</div>';
  E('panel-study').innerHTML = html;
  updateSidebar();
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;

  /* Recovery session: replace buttons with session-aware controls */
  if (_isRecovery) {
    _recordRecoveryResult('kp');
    var panel = E('panel-study');
    var actionsDiv = panel ? panel.querySelector('.result-actions') : null;
    if (actionsDiv) {
      actionsDiv.outerHTML = _renderRecoveryStepBar() + _renderRecoveryResultButtons();
    }
  }
}

/* Render the scan card */
function renderStudyCard() {
  if (S._kpRefreshMode) return _renderKPRefreshCard();
  if (S._refreshMode) return _renderRefreshCard();
  if (S.idx >= S.pairs.length) { finishStudy(); return; }

  var p = S.pairs[S.idx];
  var progress = S.pairs.length > 0 ? Math.round(S.idx / S.pairs.length * 100) : 0;

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + S.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (S.idx + 1) + ' / ' + S.pairs.length;
  if (S.round > 1) html += ' \u00b7 R' + S.round;
  html += '</div>';
  html += '</div>';

  /* Word card (no flip — show word, buttons reveal meaning) */
  html += '<div class="scan-card" id="scan-card">';
  html += '<div class="scan-word">' + escapeHtml(p.word) + '</div>';
  html += '<div class="scan-def hidden" id="scan-def">' + escapeHtml(p.def) + '</div>';
  html += '</div>';

  /* Three scan buttons */
  html += '<div class="scan-actions" id="scan-actions">';
  html += '<button class="scan-btn scan-known" data-scan="known">';
  html += '<span class="scan-key">1</span> ' + t('Know it', '\u8ba4\u8bc6') + '</button>';
  html += '<button class="scan-btn scan-fuzzy" data-scan="fuzzy">';
  html += '<span class="scan-key">2</span> ' + t('Fuzzy', '\u6a21\u7cca') + '</button>';
  html += '<button class="scan-btn scan-unknown" data-scan="unknown">';
  html += '<span class="scan-key">3</span> ' + t("Don't know", '\u4e0d\u8ba4\u8bc6') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;

  /* Bind scan button clicks via delegation */
  var actions = E('scan-actions');
  if (actions && !actions._bound) {
    actions._bound = true;
    actions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-scan]');
      if (btn) rateScan(btn.dataset.scan);
    });
  }
}

/* Handle scan rating */
function rateScan(verdict) {
  var p = S.pairs[S.idx];

  S.results[verdict].push(p);

  /* KP refresh mode uses dedicated recorder */
  if (S._kpRefreshMode) {
    recordKPRefreshScan(p._kpId, verdict);
  } else if (S._refreshMode) {
    recordRefreshScan(p._key, verdict);
  } else {
    var key = wordKey(S.lvl, p.lid);
    recordScan(key, verdict, S.round);
  }

  /* Show definition briefly with visual feedback */
  var def = E('scan-def');
  var card = E('scan-card');
  if (def) def.classList.remove('hidden');
  if (card) {
    card.classList.add('scan-' + verdict);
  }

  /* Play sound */
  if (verdict === 'known') playCorrect();
  else if (verdict === 'unknown') playWrong();

  /* Auto-advance after brief pause */
  setTimeout(function() {
    S.idx++;
    renderStudyCard();
  }, 600);
}

/* Finish round */
function finishStudy() {
  if (S._kpRefreshMode) return _finishKPRefreshScan();
  if (S._refreshMode) return _finishRefreshScan();
  var k = S.results.known.length;
  var f = S.results.fuzzy.length;
  var u = S.results.unknown.length;
  var total = k + f + u;

  /* Check if all words in level are mastered */
  var pool = getPoolWords(S.lvl);
  var allMastered = pool.length === 0;

  if (allMastered) {
    markModeDone(currentLvl, 'study');
  }
  if (typeof checkSectionMilestone === 'function') checkSectionMilestone();

  var html = '';
  html += '<div class="text-center">';
  html += '<div class="result-emoji">' + (allMastered ? '\ud83c\udfc6' : '\ud83d\udcca') + '</div>';
  html += '<div class="result-title">' + t('Round ' + S.round + ' Complete!', '\u7b2c ' + S.round + ' \u8f6e\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + (allMastered
    ? t('All words mastered!', '\u5168\u90e8\u638c\u63e1\uff01')
    : t(pool.length + ' words remain in pool', '\u8fd8\u6709 ' + pool.length + ' \u4e2a\u8bcd\u5728\u5b66\u4e60\u6c60\u4e2d')) + '</div>';
  html += '</div>';

  /* Result breakdown */
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Know it', '\u8ba4\u8bc6') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '\u6a21\u7cca') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t("Don't know", '\u4e0d\u8ba4\u8bc6') + '</div></div>';
  html += '</div>';

  /* Pool progress bar */
  var deckPairs = getPairs(LEVELS[S.lvl].vocabulary);
  var totalWords = deckPairs.length;
  var masteredN = totalWords - pool.length;
  var masteredPct = totalWords > 0 ? Math.round(masteredN / totalWords * 100) : 100;
  html += '<div class="pool-bar-wrap" style="margin:16px 0">';
  html += '<div class="pool-bar">';
  html += '<div class="pool-bar-mastered" style="width:' + masteredPct + '%"></div>';
  html += '</div>';
  html += '<div style="font-size:12px;color:var(--c-text2);margin-top:6px;text-align:center">';
  html += t('Mastered', '\u5df2\u638c\u63e1') + ' ' + masteredN + ' / ' + totalWords + ' \u00b7 ' + masteredPct + '%';
  html += '</div></div>';

  var studyEmoji = allMastered ? '\ud83c\udfc6' : (u === 0 ? '\ud83c\udf89' : '\ud83d\udcaa');
  _lastShareOpts = { mode: 'study', score: k, total: total, emoji: studyEmoji };

  /* Actions */
  html += '<div class="result-actions">';
  if (!allMastered) {
    html += '<button class="btn btn-primary" onclick="_startNextRound(' + S.lvl + ')">';
    html += '\ud83d\udd04 ' + t('Continue Round ' + (S.round + 1), '\u7ee7\u7eed\u7b2c ' + (S.round + 1) + ' \u8f6e') + ' (' + pool.length + ' ' + t('words', '\u8bcd') + ')</button>';
  }

  /* Context-aware next step */
  var _sectionStep = typeof sectionNextStepHTML === 'function' ? sectionNextStepHTML('study') : '';
  if (_sectionStep) {
    html += _sectionStep;
  } else if (allMastered) {
    html += nextStepHTML('\u2753', t('Quiz to reinforce', '\u6d4b\u9a8c\u5de9\u56fa'), 'startQuiz(' + currentLvl + ')');
  }

  html += '<button class="btn btn-secondary" onclick="startStudy(' + currentLvl + ')">\ud83d\udd01 ' + t('Rescan all', '\u91cd\u65b0\u626b\u63cf') + '</button>';
  html += '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>';
  html += '<button class="btn btn-ghost" onclick="openDeck(' + currentLvl + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;
  updateSidebar();
}

/* All mastered celebration */
function _finishAllMastered() {
  markModeDone(currentLvl, 'study');
  if (typeof checkSectionMilestone === 'function') checkSectionMilestone();

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83c\udfc6</div>';
  html += '<div class="result-title">' + t('All Mastered!', '\u5168\u90e8\u638c\u63e1\uff01') + '</div>';
  html += '<div class="result-sub">' + t('Great job! Try Quiz mode to reinforce your memory.', '\u592a\u68d2\u4e86\uff01\u8bd5\u8bd5\u6d4b\u9a8c\u6a21\u5f0f\u5de9\u56fa\u8bb0\u5fc6\u3002') + '</div>';
  html += '</div>';

  html += '<div class="result-actions">';
  html += nextStepHTML('\u2753', t('Quiz to reinforce', '\u6d4b\u9a8c\u5de9\u56fa'), 'startQuiz(' + currentLvl + ')');
  html += '<button class="btn btn-secondary" onclick="startStudy(' + currentLvl + ')">\ud83d\udd01 ' + t('Rescan all', '\u91cd\u65b0\u626b\u63cf') + '</button>';
  html += '<button class="btn btn-ghost" onclick="openDeck(' + currentLvl + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;
  updateSidebar();
}

/* Legacy function kept for backward compat */
function restudyHard() {
  startStudy(currentLvl);
}
