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
  html += '<span class="scan-key">3</span> ' + t('Still learning', '\u8fd8\u5728\u5b66') + '</button>';
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
  html += '<div class="result-sub">' + t('Reviewed ' + (k + f + u) + ' words', '\u590d\u67e5\u4e86 ' + (k + f + u) + ' \u4e2a\u8bcd\u6c47') + '</div>';
  html += '</div>';

  /* Result breakdown */
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Still know', '\u4ecd\u8ba4\u8bc6') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '\u6a21\u7cca') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Needs another round', '\u518d\u7ec3\u4e00\u8f6e') + '</div></div>';
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
  /* List Scan: replace buttons with list-scan controls */
  if (!_isRecovery && typeof isListScanActive === 'function' && isListScanActive()) {
    var lsPanel = E('panel-study');
    var lsActions = lsPanel ? lsPanel.querySelector('.result-actions') : null;
    if (lsActions && typeof _renderListScanButtons === 'function') {
      lsActions.outerHTML = _renderListScanButtons();
      if (typeof _bindListScanButtons === 'function') _bindListScanButtons(lsPanel);
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
    if (staleList.length === 0) { showToast(t('All KPs up to date', '\u6240\u6709\u77e5\u8bc6\u70b9\u5747\u5df2\u590d\u67e5')); return; }
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
  html += '<div class="result-sub">' + t('Reviewed ' + (k + f + u) + ' knowledge points', '复查了 ' + (k + f + u) + ' 个知识点') + '</div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + k + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Still know', '仍认识') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + f + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '模糊') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Needs another round', '\u518d\u7ec3\u4e00\u8f6e') + '</div></div>';
  html += '</div>';
  if (f + u > 0) {
    html += '<div style="font-size:13px;color:var(--c-text2);text-align:center;margin:8px 0">';
    html += t((f + u) + ' KPs returned to learning pool', (f + u) + ' \u4e2a\u77e5\u8bc6\u70b9\u5df2\u56de\u5230\u5b66\u4e60\u6c60');
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
  if (S._kpScanMode) return _renderKPScanCard();
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

  /* Prior FLM status hint — show if word was already studied via global uid */
  var _scanKey = wordKey(S.lvl, p.lid);
  var _scanWd = getWordData()[_scanKey];
  var _scanFs = _scanWd ? (_scanWd.fs || 'new') : 'new';
  if (_scanFs !== 'new' && S.round === 1) {
    var _hintClass = _scanFs === 'mastered' ? 'scan-hint-mastered' : _scanFs === 'uncertain' ? 'scan-hint-fuzzy' : 'scan-hint-learning';
    var _hintLabel = _scanFs === 'mastered' ? t('Mastered', '\u5df2\u638c\u63e1')
                   : _scanFs === 'uncertain' ? t('Fuzzy', '\u6a21\u7cca')
                   : t('Learning', '\u5b66\u4e60\u4e2d');
    html += '<div class="scan-prior-hint ' + _hintClass + '">' + _hintLabel + '</div>';
  }

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
  html += '<span class="scan-key">3</span> ' + t('Still learning', '\u8fd8\u5728\u5b66') + '</button>';
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
    _logScanEvent('kp', p._kpId, verdict, S.round, '', '');
  } else if (S._refreshMode) {
    recordRefreshScan(p._key, verdict);
    _logScanEvent('vocab', p._key, verdict, S.round, '', '');
  } else {
    var key = wordKey(S.lvl, p.lid);
    recordScan(key, verdict, S.round);
    _logScanEvent('vocab', key, verdict, S.round, '', '');
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
  if (S._kpScanMode) return _finishKPScanRound();
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
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + u + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Still learning', '\u8fd8\u5728\u5b66') + '</div></div>';
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

/* ══════════════════════════════════════════════════════════════
   KP SCAN PREVIEW + FOCUSED QUIZ
   Round 1: Preview KP cards → Know / Fuzzy / Learning
   Round 2+: Focused quiz using testYourself MCQs
   ══════════════════════════════════════════════════════════════ */

var _kpScan = null;

function startKPScan(sectionId, board) {
  if (typeof loadKnowledgeData !== 'function') return;
  loadKnowledgeData(board).then(function() {
    var kps = typeof getKPsForSection === 'function' ? getKPsForSection(sectionId, board) : [];
    if (!kps || kps.length === 0) {
      if (typeof showToast === 'function') showToast(t('No knowledge points available', '没有可用的知识点'));
      return;
    }
    var items = [];
    for (var i = 0; i < kps.length; i++) {
      var kp = kps[i];
      items.push({
        kpId: kp.id, title: kp.title, title_zh: kp.title_zh || '',
        explanation: kp.explanation || {}, testYourself: kp.testYourself || [],
        status: 'new', cs: 0
      });
    }
    _kpScan = {
      items: items, pool: items.slice(), round: 1, idx: 0,
      qIdx: 0, qScore: 0, _currentKpId: null,
      sectionId: sectionId, board: board,
      results: { known: [], fuzzy: [], unknown: [] }
    };
    S._kpScanMode = true;
    showPanel('study');
    renderStudyCard();
  });
}

/* Start KP scan from a pre-filtered list of KP IDs (cross-topic) */
function startKPScanByIds(kpIds, board) {
  if (typeof loadKnowledgeData !== 'function') return;
  loadKnowledgeData(board).then(function() {
    var kps = _kpData[board] || [];
    var items = [];
    for (var i = 0; i < kps.length; i++) {
      if (kpIds.indexOf(kps[i].id) >= 0) {
        items.push({
          kpId: kps[i].id, title: kps[i].title, title_zh: kps[i].title_zh || '',
          explanation: kps[i].explanation || {}, testYourself: kps[i].testYourself || [],
          status: 'new', cs: 0
        });
      }
    }
    if (items.length === 0) { showToast(t('No items found', '未找到项目')); return; }
    _kpScan = {
      items: items, pool: items.slice(), round: 2, idx: 0,
      qIdx: 0, qScore: 0, _currentKpId: null,
      sectionId: '', board: board,
      results: { known: [], fuzzy: [], unknown: [] }
    };
    S._kpScanMode = true;
    showPanel('study');
    renderStudyCard();
  });
}

function _renderKPScanCard() {
  if (!_kpScan) return;
  if (_kpScan.idx >= _kpScan.pool.length) { _finishKPScanRound(); return; }
  if (_kpScan.round === 1) _renderKPScanPreview();
  else _renderKPScanQuiz();
}

/* Keyboard handler for KP/PP scan (1=known, 2=fuzzy, 3=unknown) */
function _kpScanKeyHandler(e) {
  if (!_kpScan || !S._kpScanMode) return;
  if (e.key === '1' || e.key === '2' || e.key === '3') {
    e.preventDefault();
    if (_kpScan.round === 1) {
      var map = { '1': 'known', '2': 'fuzzy', '3': 'unknown' };
      _rateKPScan(map[e.key]);
    }
    /* Quiz mode uses option buttons, not 1/2/3 shortcuts */
  }
}

function _renderKPScanPreview() {
  var item = _kpScan.pool[_kpScan.idx];
  var progress = _kpScan.pool.length > 0 ? Math.round(_kpScan.idx / _kpScan.pool.length * 100) : 0;
  var isZh = typeof appLang !== 'undefined' && appLang !== 'en';

  var html = '';
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="_exitKPScan()">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (_kpScan.idx + 1) + ' / ' + _kpScan.pool.length + '</div>';
  html += '</div>';
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    html += _renderRecoveryStepBar();
  }
  html += '<div class="scan-round-badge">' + t('Round 1 \u2014 Preview', '\u7b2c 1 \u8f6e \u2014 \u9884\u89c8') + '</div>';
  html += '<div class="scan-card scan-kp-card" id="scan-card">';
  html += '<div class="scan-kp-num">KP ' + (_kpScan.idx + 1) + '</div>';
  html += '<div class="scan-kp-title">' + (typeof pqRender === 'function' ? pqRender(item.title) : escapeHtml(item.title)) + '</div>';
  if (item.title_zh) html += '<div class="scan-kp-title-zh">' + escapeHtml(item.title_zh) + '</div>';
  var expText = isZh && item.explanation.zh ? item.explanation.zh : (item.explanation.en || '');
  if (expText) {
    var summary = expText.split('\n').slice(0, 3).join('\n');
    html += '<div class="scan-kp-summary">' + (typeof kpMarkdown === 'function' ? kpMarkdown(summary) : escapeHtml(summary)) + '</div>';
  }
  html += '</div>';
  html += '<div class="scan-actions" id="scan-actions">';
  html += '<button class="scan-btn scan-known" data-kpscan="known"><span class="scan-key">1</span> ' + t('Know', '\u5df2\u638c\u63e1') + '</button>';
  html += '<button class="scan-btn scan-fuzzy" data-kpscan="fuzzy"><span class="scan-key">2</span> ' + t('Fuzzy', '\u6a21\u7cca') + '</button>';
  html += '<button class="scan-btn scan-unknown" data-kpscan="unknown"><span class="scan-key">3</span> ' + t('Learning', '\u5b66\u4e60\u4e2d') + '</button>';
  html += '</div>';
  E('panel-study').innerHTML = html;
  if (typeof renderMathInElement === 'function') renderMathInElement(E('panel-study'));
  var actions = E('scan-actions');
  if (actions && !actions._bound) {
    actions._bound = true;
    actions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-kpscan]');
      if (btn) _rateKPScan(btn.dataset.kpscan);
    });
  }
  /* Bind keyboard shortcuts */
  document.removeEventListener('keydown', _kpScanKeyHandler);
  document.addEventListener('keydown', _kpScanKeyHandler);
}

function _rateKPScan(rating) {
  var item = _kpScan.pool[_kpScan.idx];
  var statusMap = { known: 'mastered', fuzzy: 'uncertain', unknown: 'learning' };
  item.status = statusMap[rating] || 'new';
  _kpScan.results[rating].push(item);
  _logScanEvent('kp', item.kpId, rating, _kpScan.round, _kpScan.sectionId, _kpScan.board);
  var card = E('scan-card');
  if (card) card.classList.add('scan-' + rating);
  if (rating === 'known' && typeof playCorrect === 'function') playCorrect();
  else if (rating === 'unknown' && typeof playWrong === 'function') playWrong();
  setTimeout(function() { _kpScan.idx++; _renderKPScanCard(); }, 600);
}

function _renderKPScanQuiz() {
  var item = _kpScan.pool[_kpScan.idx];
  var isZh = typeof appLang !== 'undefined' && appLang !== 'en';
  if (!item.testYourself || item.testYourself.length === 0) {
    _kpScan.idx++;
    _renderKPScanCard();
    return;
  }
  if (_kpScan._currentKpId !== item.kpId) {
    _kpScan.qIdx = 0;
    _kpScan.qScore = 0;
    _kpScan._currentKpId = item.kpId;
  }
  if (_kpScan.qIdx >= item.testYourself.length) {
    _evaluateKPScanQuiz();
    return;
  }
  var tq = item.testYourself[_kpScan.qIdx];
  /* Guard against malformed quiz data */
  if (!tq || !tq.o || tq.o.length === 0) {
    _kpScan.qIdx++;
    _renderKPScanCard();
    return;
  }
  var progress = _kpScan.pool.length > 0 ? Math.round(_kpScan.idx / _kpScan.pool.length * 100) : 0;
  var html = '';
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="_exitKPScan()">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (_kpScan.idx + 1) + ' / ' + _kpScan.pool.length + '</div>';
  html += '</div>';
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    html += _renderRecoveryStepBar();
  }
  html += '<div class="scan-round-badge">' + t('Round', '\u7b2c') + ' ' + _kpScan.round + ' \u2014 ' + t('Quiz', '\u6d4b\u9a8c') + '</div>';
  html += '<div class="scan-card scan-kp-card" id="scan-card">';
  html += '<div class="scan-kp-num">' + (typeof pqRender === 'function' ? pqRender(item.title) : escapeHtml(item.title)) + '</div>';
  html += '<div class="scan-kp-quiz-progress">Q' + (_kpScan.qIdx + 1) + '/' + item.testYourself.length + '</div>';
  html += '<div class="scan-kp-question">' + (typeof kpMarkdown === 'function' ? kpMarkdown(isZh && tq.q_zh ? tq.q_zh : tq.q) : escapeHtml(tq.q)) + '</div>';
  html += '<div class="scan-kp-options" id="kp-scan-options">';
  for (var oi = 0; oi < tq.o.length; oi++) {
    html += '<button class="kp-quiz-opt" data-kpscan-opt="' + oi + '">' + (typeof pqRender === 'function' ? pqRender(tq.o[oi]) : escapeHtml(tq.o[oi])) + '</button>';
  }
  html += '</div>';
  html += '<div class="scan-kp-explain d-none" id="kp-scan-explain"></div>';
  html += '</div>';
  E('panel-study').innerHTML = html;
  if (typeof renderMathInElement === 'function') renderMathInElement(E('panel-study'));
  var opts = E('kp-scan-options');
  if (opts && !opts._bound) {
    opts._bound = true;
    opts.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-kpscan-opt]');
      if (btn && !btn.disabled) _answerKPScanQuiz(parseInt(btn.dataset.kpscanOpt));
    });
  }
}

function _answerKPScanQuiz(optIdx) {
  var item = _kpScan.pool[_kpScan.idx];
  var tq = item.testYourself[_kpScan.qIdx];
  var ansIdx = tq.a !== undefined ? tq.a : -1;
  var isCorrect = ansIdx >= 0 && optIdx === ansIdx;
  if (isCorrect) _kpScan.qScore++;
  var allOpts = document.querySelectorAll('#kp-scan-options .kp-quiz-opt');
  for (var i = 0; i < allOpts.length; i++) {
    allOpts[i].disabled = true;
    if (parseInt(allOpts[i].dataset.kpscanOpt) === ansIdx) allOpts[i].classList.add('correct');
  }
  if (!isCorrect) {
    var clicked = document.querySelector('[data-kpscan-opt="' + optIdx + '"]');
    if (clicked) clicked.classList.add('wrong');
  }
  if (isCorrect && typeof playCorrect === 'function') playCorrect();
  if (!isCorrect && typeof playWrong === 'function') playWrong();
  _logScanEvent('kp', item.kpId, isCorrect ? 'known' : 'unknown', _kpScan.round, _kpScan.sectionId, _kpScan.board);
  var isZh = typeof appLang !== 'undefined' && appLang !== 'en';
  var expText = (isZh && tq.e_zh) ? tq.e_zh : (tq.e || '');
  var expEl = E('kp-scan-explain');
  if (expEl && expText) {
    expEl.innerHTML = (typeof kpMarkdown === 'function' ? kpMarkdown(expText) : escapeHtml(expText));
    expEl.classList.remove('d-none');
    if (typeof renderMathInElement === 'function') renderMathInElement(expEl);
  }
  setTimeout(function() { _kpScan.qIdx++; _renderKPScanCard(); }, 1200);
}

function _evaluateKPScanQuiz() {
  var item = _kpScan.pool[_kpScan.idx];
  var total = item.testYourself.length;
  var pct = total > 0 ? _kpScan.qScore / total : 0;
  if (pct >= 0.85) {
    item.cs = (item.cs || 0) + 1;
    item.status = item.cs >= 1 ? 'mastered' : 'uncertain';
  } else {
    item.cs = 0;
    if (item.status === 'mastered') item.status = 'uncertain';
  }
  _kpScan.qIdx = 0;
  _kpScan.qScore = 0;
  _kpScan._currentKpId = null;
  _kpScan.idx++;
  _renderKPScanCard();
}

function _finishKPScanRound() {
  if (!_kpScan) return;
  if (_kpScan.round === 1) {
    var pool = [];
    for (var i = 0; i < _kpScan.items.length; i++) {
      if (_kpScan.items[i].status !== 'mastered') pool.push(_kpScan.items[i]);
    }
    if (pool.length === 0) { _finishKPScan(); return; }
    _kpScan.pool = pool;
    _kpScan.round = 2;
    _kpScan.idx = 0;
    _kpScan.qIdx = 0;
    _kpScan.qScore = 0;
    _kpScan._currentKpId = null;
    _kpScan.results = { known: [], fuzzy: [], unknown: [] };
    _renderKPScanCard();
  } else {
    var remaining = [];
    for (var j = 0; j < _kpScan.pool.length; j++) {
      if (_kpScan.pool[j].status !== 'mastered') remaining.push(_kpScan.pool[j]);
    }
    if (remaining.length === 0 || _kpScan.round >= 5) { _finishKPScan(); return; }
    _kpScan.pool = remaining;
    _kpScan.round++;
    _kpScan.idx = 0;
    _kpScan.qIdx = 0;
    _kpScan.qScore = 0;
    _kpScan._currentKpId = null;
    _renderKPScanCard();
  }
}

function _finishKPScan() {
  S._kpScanMode = false;
  document.removeEventListener('keydown', _kpScanKeyHandler);
  var mastered = 0, total = _kpScan.items.length;
  for (var i = 0; i < _kpScan.items.length; i++) {
    var item = _kpScan.items[i];
    if (!item.testYourself || item.testYourself.length === 0) continue;
    var totalQ = item.testYourself.length;
    var correctQ = item.status === 'mastered' ? totalQ : (item.status === 'uncertain' ? Math.floor(totalQ * 0.6) : 0);
    if (typeof saveKPResult === 'function') saveKPResult(item.kpId, totalQ, correctQ);
    if (item.status === 'mastered') mastered++;
  }
  var _isRecovery = typeof isRecoverySessionActive === 'function' && isRecoverySessionActive();
  var statusCounts = { mastered: 0, uncertain: 0, learning: 0 };
  for (var j = 0; j < _kpScan.items.length; j++) {
    var st = _kpScan.items[j].status;
    if (statusCounts[st] !== undefined) statusCounts[st]++;
  }
  var html = '<div class="text-center">';
  html += '<div class="result-emoji">' + (mastered === total ? '\ud83c\udfc6' : '\ud83d\udcca') + '</div>';
  html += '<div class="result-title">' + t('KP Scan Complete!', '\u77e5\u8bc6\u70b9\u626b\u63cf\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + t('Scanned ' + total + ' knowledge points', '\u626b\u63cf\u4e86 ' + total + ' \u4e2a\u77e5\u8bc6\u70b9') + '</div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + statusCounts.mastered + '</div><div style="font-size:10px;font-weight:600;color:var(--c-success)">' + t('Mastered', '\u5df2\u638c\u63e1') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + statusCounts.uncertain + '</div><div style="font-size:10px;font-weight:600;color:var(--c-warning)">' + t('Fuzzy', '\u6a21\u7cca') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + statusCounts.learning + '</div><div style="font-size:10px;font-weight:600;color:var(--c-danger)">' + t('Still learning', '\u8fd8\u5728\u5b66') + '</div></div>';
  html += '</div>';
  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'section\')">' + t('Back to Section', '\u8fd4\u56de\u77e5\u8bc6\u70b9') + '</button>';
  html += '<button class="btn btn-secondary" onclick="renderScanOverview(\'' + escapeHtml(_kpScan.board) + '\')">' + t('Scan Overview', '\u626b\u63cf\u603b\u89c8') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">' + t('Home', '\u9996\u9875') + '</button>';
  html += '</div>';
  E('panel-study').innerHTML = html;
  if (typeof updateSidebar === 'function') updateSidebar();
  if (typeof _profileCacheTs !== 'undefined') _profileCacheTs = 0;
  if (_isRecovery) {
    _recordRecoveryResult('kp');
    var panel = E('panel-study');
    var actionsDiv = panel ? panel.querySelector('.result-actions') : null;
    if (actionsDiv) actionsDiv.outerHTML = _renderRecoveryStepBar() + _renderRecoveryResultButtons();
  }
  /* List Scan: replace buttons with list-scan controls */
  if (!_isRecovery && typeof isListScanActive === 'function' && isListScanActive()) {
    var lsPanel2 = E('panel-study');
    var lsActions2 = lsPanel2 ? lsPanel2.querySelector('.result-actions') : null;
    if (lsActions2 && typeof _renderListScanButtons === 'function') {
      lsActions2.outerHTML = _renderListScanButtons();
      if (typeof _bindListScanButtons === 'function') _bindListScanButtons(lsPanel2);
    }
  }
  _kpScan = null;
}

function _exitKPScan() {
  S._kpScanMode = false;
  _kpScan = null;
  document.removeEventListener('keydown', _kpScanKeyHandler);
  if (typeof isRecoverySessionActive === 'function' && isRecoverySessionActive()) {
    _recordRecoveryResult('kp');
    _advanceRecoverySession();
  } else if (typeof isListScanActive === 'function' && isListScanActive()) {
    advanceListScan();
  } else {
    navTo('section');
  }
}

/* ══════════════════════════════════════════════════════════════
   SCAN HISTORY LOG — timestamped record of every scan rating
   ══════════════════════════════════════════════════════════════ */

var _SCAN_LOG_KEY = 'scan_log';
var _SCAN_LOG_MAX = 5000;

function _logScanEvent(type, itemId, rating, round, section, board) {
  try {
    var log = JSON.parse(localStorage.getItem(_SCAN_LOG_KEY)) || [];
    log.push({
      id: type + ':' + itemId, type: type, rating: rating,
      round: round, ts: Date.now(), sec: section || '', board: board || ''
    });
    if (log.length > _SCAN_LOG_MAX) log = log.slice(log.length - _SCAN_LOG_MAX);
    localStorage.setItem(_SCAN_LOG_KEY, JSON.stringify(log));
  } catch (e) {}
}

function getScanLog() {
  try { return JSON.parse(localStorage.getItem(_SCAN_LOG_KEY)) || []; }
  catch (e) { return []; }
}

/* Aggregate scan log into per-item summaries */
function getScanOverviewData(board) {
  var log = getScanLog();
  var items = {};
  for (var i = 0; i < log.length; i++) {
    var e = log[i];
    if (board && e.board && e.board !== board) continue;
    if (!items[e.id]) {
      items[e.id] = {
        id: e.id, type: e.type, section: e.sec, board: e.board,
        history: [], fuzzyCount: 0, knownCount: 0, unknownCount: 0,
        latestRating: null, lastTs: 0
      };
    }
    var it = items[e.id];
    it.history.push({ rating: e.rating, ts: e.ts, round: e.round });
    if (e.rating === 'fuzzy') it.fuzzyCount++;
    else if (e.rating === 'known') it.knownCount++;
    else it.unknownCount++;
    if (e.ts > it.lastTs) { it.lastTs = e.ts; it.latestRating = e.rating; }
  }
  var arr = [];
  for (var k in items) arr.push(items[k]);
  return arr;
}

/* Group scan log by date */
function getScanLogByDate(board) {
  var log = getScanLog();
  var byDate = {};
  for (var i = 0; i < log.length; i++) {
    var e = log[i];
    if (board && e.board && e.board !== board) continue;
    var date = new Date(e.ts).toLocaleDateString('en-CA');
    if (!byDate[date]) byDate[date] = { date: date, items: [], known: 0, fuzzy: 0, unknown: 0 };
    byDate[date].items.push(e);
    if (e.rating === 'known') byDate[date].known++;
    else if (e.rating === 'fuzzy') byDate[date].fuzzy++;
    else byDate[date].unknown++;
  }
  var dates = Object.keys(byDate).sort().reverse();
  return dates.map(function(d) { return byDate[d]; });
}

/* ══════════════════════════════════════════════════════════════
   SCAN OVERVIEW — cross-topic FLM status viewer + history
   ══════════════════════════════════════════════════════════════ */

function renderScanOverview(board) {
  board = board || (typeof userBoard !== 'undefined' ? userBoard : 'cie');
  var data = getScanOverviewData(board);
  var byDate = getScanLogByDate(board);

  /* Stats */
  var knownN = 0, fuzzyN = 0, unknownN = 0;
  for (var si = 0; si < data.length; si++) {
    if (data[si].latestRating === 'known') knownN++;
    else if (data[si].latestRating === 'fuzzy') fuzzyN++;
    else unknownN++;
  }

  var html = '';
  html += '<div class="page-header"><button class="btn btn-ghost btn-sm" onclick="navTo(\'home\')">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '<h2 class="page-title">' + t('Scan Overview', '\u626b\u63cf\u603b\u89c8') + '</h2></div>';

  /* Filter bar */
  html += '<div class="scan-ov-filters">';
  html += '<select class="scan-ov-select" id="scan-ov-type" onchange="_applyScanOvFilter()">';
  html += '<option value="all">' + t('All Types', '\u5168\u90e8\u7c7b\u578b') + '</option>';
  html += '<option value="kp">' + t('Knowledge Points', '\u77e5\u8bc6\u70b9') + '</option>';
  html += '<option value="pp">' + t('Past Papers', '\u771f\u9898') + '</option>';
  html += '<option value="vocab">' + t('Vocabulary', '\u8bcd\u6c47') + '</option>';
  html += '</select>';
  html += '<select class="scan-ov-select" id="scan-ov-status" onchange="_applyScanOvFilter()">';
  html += '<option value="all">' + t('All Status', '\u5168\u90e8\u72b6\u6001') + '</option>';
  html += '<option value="known">' + t('Known', '\u5df2\u4f1a') + '</option>';
  html += '<option value="fuzzy">' + t('Fuzzy', '\u6a21\u7cca') + '</option>';
  html += '<option value="unknown">' + t('Unknown', '\u4e0d\u4f1a') + '</option>';
  html += '</select>';
  html += '<select class="scan-ov-select" id="scan-ov-fuzzy" onchange="_applyScanOvFilter()">';
  html += '<option value="all">' + t('Fuzzy Count', '\u6a21\u7cca\u6b21\u6570') + '</option>';
  html += '<option value="1">1\u00d7</option><option value="2">2\u00d7</option><option value="3">3+\u00d7</option>';
  html += '</select></div>';

  /* Stats summary */
  html += '<div class="scan-ov-stats">';
  html += '<div class="scan-ov-stat">' + data.length + '<br><small>' + t('Total', '\u603b\u8ba1') + '</small></div>';
  html += '<div class="scan-ov-stat known">' + knownN + '<br><small>' + t('Known', '\u5df2\u4f1a') + '</small></div>';
  html += '<div class="scan-ov-stat fuzzy">' + fuzzyN + '<br><small>' + t('Fuzzy', '\u6a21\u7cca') + '</small></div>';
  html += '<div class="scan-ov-stat unknown">' + unknownN + '<br><small>' + t('Unknown', '\u4e0d\u4f1a') + '</small></div>';
  html += '</div>';

  /* Action buttons */
  html += '<div class="scan-ov-actions">';
  if (fuzzyN > 0) {
    html += '<button class="btn btn-sm btn-warning" onclick="_startFocusedFromOverview(\'fuzzy\',\'' + escapeHtml(board) + '\')">';
    html += t('Study Fuzzy', '\u5b66\u4e60\u6a21\u7cca\u9879') + ' (' + fuzzyN + ')</button>';
  }
  if (unknownN > 0) {
    html += '<button class="btn btn-sm btn-danger" onclick="_startFocusedFromOverview(\'unknown\',\'' + escapeHtml(board) + '\')">';
    html += t('Study Unknown', '\u5b66\u4e60\u4e0d\u4f1a\u9879') + ' (' + unknownN + ')</button>';
  }
  html += '</div>';

  /* Tabs */
  html += '<div class="scan-ov-tabs" id="scan-ov-tabs">';
  html += '<button class="scan-ov-tab active" data-ovtab="items">' + t('Items', '\u9879\u76ee') + '</button>';
  html += '<button class="scan-ov-tab" data-ovtab="history">' + t('History', '\u5386\u53f2\u8bb0\u5f55') + '</button>';
  html += '</div>';

  html += '<div id="scan-ov-items">' + _renderScanOvItems(data) + '</div>';
  html += '<div id="scan-ov-history" class="d-none">' + _renderScanOvHistory(byDate) + '</div>';

  showPanel('study');
  E('panel-study').innerHTML = html;

  /* Tab switching */
  var tabs = E('scan-ov-tabs');
  if (tabs && !tabs._bound) {
    tabs._bound = true;
    tabs.addEventListener('click', function(e) {
      var tab = e.target.closest('[data-ovtab]');
      if (!tab) return;
      var all = tabs.querySelectorAll('.scan-ov-tab');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
      tab.classList.add('active');
      var isItems = tab.dataset.ovtab === 'items';
      var itemsDiv = E('scan-ov-items');
      var histDiv = E('scan-ov-history');
      if (itemsDiv) itemsDiv.classList.toggle('d-none', !isItems);
      if (histDiv) histDiv.classList.toggle('d-none', isItems);
    });
  }
}

function _renderScanOvItems(data) {
  if (data.length === 0) return '<div class="text-center text-muted" style="padding:40px">' + t('No scan data yet. Start scanning!', '\u6682\u65e0\u626b\u63cf\u8bb0\u5f55\uff0c\u5f00\u59cb\u626b\u63cf\u5427\uff01') + '</div>';
  data.sort(function(a, b) { return b.lastTs - a.lastTs; });
  var html = '<div class="scan-ov-list">';
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var typeIcon = d.type === 'kp' ? '\ud83d\udcd6' : d.type === 'pp' ? '\ud83d\udcc4' : '\ud83d\udcdd';
    var rc = d.latestRating || 'new';
    var displayId = d.id.replace(/^(kp|pp|vocab):/, '');
    html += '<div class="scan-ov-item scan-ov-r-' + rc + '">';
    html += '<span class="scan-ov-item-icon">' + typeIcon + '</span>';
    html += '<div class="scan-ov-item-info">';
    html += '<div class="scan-ov-item-name">' + escapeHtml(displayId) + '</div>';
    html += '<div class="scan-ov-item-meta">' + d.section;
    html += ' \u00b7 ' + new Date(d.lastTs).toLocaleDateString();
    if (d.fuzzyCount > 0) html += ' \u00b7 <span class="scan-ov-fuzzy-tag">' + d.fuzzyCount + '\u00d7 ' + t('fuzzy', '\u6a21\u7cca') + '</span>';
    html += '</div></div>';
    html += '<div class="scan-ov-item-badge scan-ov-badge-' + rc + '">';
    html += rc === 'known' ? t('Known', '\u5df2\u4f1a') : rc === 'fuzzy' ? t('Fuzzy', '\u6a21\u7cca') : t('Unknown', '\u4e0d\u4f1a');
    html += '</div>';
    if (d.history.length > 1) {
      html += '<div class="scan-ov-dots">';
      var recent = d.history.slice(-8);
      for (var hi = 0; hi < recent.length; hi++) {
        html += '<span class="scan-ov-dot scan-ov-dot-' + recent[hi].rating + '" title="' + new Date(recent[hi].ts).toLocaleString() + '"></span>';
      }
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function _renderScanOvHistory(byDate) {
  if (byDate.length === 0) return '<div class="text-center text-muted" style="padding:40px">' + t('No scan history', '\u6682\u65e0\u626b\u63cf\u5386\u53f2') + '</div>';
  var html = '<div class="scan-ov-history-list">';
  for (var i = 0; i < Math.min(byDate.length, 30); i++) {
    var day = byDate[i];
    html += '<div class="scan-ov-day">';
    html += '<div class="scan-ov-day-header">';
    html += '<span class="scan-ov-day-date">' + day.date + '</span>';
    html += '<span class="scan-ov-day-count">' + day.items.length + ' ' + t('items scanned', '\u9879\u5df2\u626b\u63cf') + '</span>';
    html += '</div>';
    html += '<div class="scan-ov-day-stats">';
    html += '<span class="scan-ov-mini known">' + day.known + ' ' + t('known', '\u5df2\u4f1a') + '</span>';
    html += '<span class="scan-ov-mini fuzzy">' + day.fuzzy + ' ' + t('fuzzy', '\u6a21\u7cca') + '</span>';
    html += '<span class="scan-ov-mini unknown">' + day.unknown + ' ' + t('unknown', '\u4e0d\u4f1a') + '</span>';
    html += '</div>';
    /* Expandable item list */
    html += '<details class="scan-ov-day-details"><summary>' + t('View details', '\u67e5\u770b\u8be6\u60c5') + '</summary>';
    html += '<div class="scan-ov-day-items">';
    for (var j = 0; j < day.items.length; j++) {
      var e = day.items[j];
      var timeStr = new Date(e.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      html += '<div class="scan-ov-day-item scan-ov-r-' + e.rating + '">';
      html += '<span>' + timeStr + '</span> ';
      html += '<span class="scan-ov-badge-' + e.rating + '">' + e.rating + '</span> ';
      html += '<span>' + e.id.replace(/^(kp|pp|vocab):/, '') + '</span>';
      html += '</div>';
    }
    html += '</div></details>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function _applyScanOvFilter() {
  var board = typeof userBoard !== 'undefined' ? userBoard : 'cie';
  var data = getScanOverviewData(board);
  var typeF = E('scan-ov-type') ? E('scan-ov-type').value : 'all';
  var statusF = E('scan-ov-status') ? E('scan-ov-status').value : 'all';
  var fuzzyF = E('scan-ov-fuzzy') ? E('scan-ov-fuzzy').value : 'all';
  var filtered = data.filter(function(d) {
    if (typeF !== 'all' && d.type !== typeF) return false;
    if (statusF !== 'all' && d.latestRating !== statusF) return false;
    if (fuzzyF !== 'all') {
      var fc = parseInt(fuzzyF);
      if (fc >= 3 && d.fuzzyCount < 3) return false;
      if (fc < 3 && d.fuzzyCount !== fc) return false;
    }
    return true;
  });
  var itemsDiv = E('scan-ov-items');
  if (itemsDiv) itemsDiv.innerHTML = _renderScanOvItems(filtered);
}

function _startFocusedFromOverview(targetRating, board) {
  var data = getScanOverviewData(board);
  var kpIds = [], ppIds = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].latestRating !== targetRating) continue;
    var itemId = data[i].id.replace(/^(kp|pp|vocab):/, '');
    if (data[i].type === 'kp') kpIds.push(itemId);
    else if (data[i].type === 'pp') ppIds.push(itemId);
  }
  if (kpIds.length > 0) {
    startKPScanByIds(kpIds, board);
  } else if (ppIds.length > 0 && typeof startPPScanByIds === 'function') {
    startPPScanByIds(ppIds, board);
  } else {
    showToast(t('No items to study', '\u6ca1\u6709\u53ef\u5b66\u4e60\u7684\u9879\u76ee'));
  }
}
