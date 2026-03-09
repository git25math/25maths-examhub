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

/* Render the scan card */
function renderStudyCard() {
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
  var key = wordKey(S.lvl, p.lid);

  S.results[verdict].push(p);
  recordScan(key, verdict, S.round);

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
