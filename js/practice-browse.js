/* ══════════════════════════════════════════════════════════════
   practice-browse.js — Past paper browsing, mock exam, diagnostic,
   wrong book (lazy-loaded)
   Depends on: practice.js (global vars + core functions)
   ══════════════════════════════════════════════════════════════ */

/* ═══ DIAGNOSTIC TEST ═══ */

function startDiagnostic(board) {
  if (typeof isGuest === 'function' && isGuest()) { showToast(t('Register free to unlock Diagnostic', '免费注册解锁诊断测试')); return; }
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  /* Decay warning (#9) */
  var _overdueDiag = typeof getDueWords === 'function' ? getDueWords().length : 0;
  if (_overdueDiag > 20) {
    showToast(t('You have ' + _overdueDiag + ' words ready for another round', '你有 ' + _overdueDiag + ' 个词可以再练一轮了'));
  }

  showToast(t('Preparing diagnostic...', '\u51c6\u5907\u8bca\u65ad\u6d4b\u8bd5\u4e2d...'));

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var allQ = getPPQuestions(board);
    if (!allQ || allQ.length === 0) {
      showToast(t('No questions available', '\u6682\u65e0\u9898\u76ee'));
      return;
    }

    /* Group questions by section */
    var secQs = {};
    for (var i = 0; i < allQ.length; i++) {
      var s = allQ[i].s;
      if (!s) continue;
      if (!secQs[s]) secQs[s] = [];
      secQs[s].push(allQ[i]);
    }

    /* Weight sections by health: weaker sections get more weight */
    var secIds = Object.keys(secQs);
    var weighted = [];
    for (var si = 0; si < secIds.length; si++) {
      var sid = secIds[si];
      var health = (typeof getSectionHealth === 'function') ? getSectionHealth(sid, board) : null;
      var weight = 1;
      if (health) {
        if (health.score < 20) weight = 3;
        else if (health.score < 50) weight = 2;
        else if (health.score >= 80) weight = 0.5;
      }
      weighted.push({ id: sid, qs: secQs[sid], weight: weight });
    }

    /* Select ~20 questions ensuring breadth */
    var selected = [];
    var maxPerSec = 3;
    var target = 20;

    /* First pass: 1 question per section (shuffled) */
    weighted.sort(function() { return Math.random() - 0.5; });
    for (var wi = 0; wi < weighted.length && selected.length < target; wi++) {
      var pool = weighted[wi].qs.slice().sort(function() { return Math.random() - 0.5; });
      selected.push(pool[0]);
      weighted[wi]._picked = 1;
    }

    /* Second pass: fill remaining slots weighted by weakness */
    if (selected.length < target) {
      var remaining = [];
      for (var ri = 0; ri < weighted.length; ri++) {
        var w = weighted[ri];
        var picked = w._picked || 0;
        if (picked >= maxPerSec) continue;
        for (var qi = 1; qi < w.qs.length && picked < maxPerSec; qi++) {
          var already = false;
          for (var si2 = 0; si2 < selected.length; si2++) {
            if (selected[si2].id === w.qs[qi].id) { already = true; break; }
          }
          if (!already) {
            remaining.push({ q: w.qs[qi], weight: w.weight });
            picked++;
          }
        }
      }
      /* Weighted shuffle */
      remaining.sort(function(a, b) { return (Math.random() * b.weight) - (Math.random() * a.weight); });
      for (var fi = 0; fi < remaining.length && selected.length < target; fi++) {
        selected.push(remaining[fi].q);
      }
    }

    /* Shuffle final order */
    selected.sort(function() { return Math.random() - 0.5; });

    _ppSession = {
      questions: selected,
      current: 0,
      mode: 'exam',
      board: board,
      sectionId: null,
      isDiagnostic: true,
      startTime: Date.now(),
      results: [],
      totalMarks: 0
    };

    for (var mi = 0; mi < selected.length; mi++) {
      _ppSession.totalMarks += selected[mi].marks;
      _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
    }

    showPanel('pastpaper');
    renderPPCard();
  }).catch(function() {
    showToast(t('Failed to load questions', '\u52a0\u8f7d\u5931\u8d25'));
  });
}

function _diagShowResults(exam, conceptErrors) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var pct = exam.totalMarks > 0 ? Math.round((exam.scored / exam.totalMarks) * 100) : 0;
  var pctClass = pct >= 70 ? 'good' : pct >= 40 ? 'ok' : 'low';
  var min = Math.floor(exam.duration / 60);
  var sec = exam.duration % 60;

  var html = '<div class="pp-results">';

  /* Header */
  var _isMockExam = _ppSession && _ppSession.isMock;
  html += '<div class="pp-results-score">';
  html += '<h2>' + (_isMockExam ? '\ud83c\udfb2 ' + t('Mock Exam Results', '\u6a21\u62df\u8003\u8bd5\u7ed3\u679c') : '\ud83c\udfaf ' + t('Diagnostic Results', '\u8bca\u65ad\u7ed3\u679c')) + '</h2>';
  html += '<div class="pp-results-pct ' + pctClass + '">' + exam.scored + ' / ' + exam.totalMarks + ' (' + pct + '%)</div>';
  html += '<div class="pp-results-time">\u23f1 ' + min + ':' + (sec < 10 ? '0' : '') + sec + '</div>';
  html += '</div>';

  /* Section-by-section breakdown */
  var secResults = {};
  for (var i = 0; i < exam.questions.length; i++) {
    var qr = exam.questions[i];
    var q = _ppSession ? _ppSession.questions[i] : null;
    var sid = q ? q.s : 'unknown';
    if (!secResults[sid]) secResults[sid] = { scored: 0, total: 0, count: 0 };
    secResults[sid].scored += qr.scored || 0;
    secResults[sid].total += qr.marks || 0;
    secResults[sid].count++;
  }

  var secKeys = Object.keys(secResults).sort(function(a, b) {
    var pa = secResults[a].total > 0 ? secResults[a].scored / secResults[a].total : 0;
    var pb = secResults[b].total > 0 ? secResults[b].scored / secResults[b].total : 0;
    return pa - pb;
  });

  html += '<h4 class="sub-heading">' + t('By Topic', '\u6309\u77e5\u8bc6\u70b9') + '</h4>';
  var board = _ppSession ? _ppSession.board : 'cie';
  for (var si = 0; si < secKeys.length; si++) {
    var sk = secKeys[si];
    var sr = secResults[sk];
    var spct = sr.total > 0 ? Math.round(sr.scored / sr.total * 100) : 0;
    var icon = spct >= 80 ? '\u2705' : spct >= 40 ? '\ud83d\udfe1' : '\ud83d\udd34';
    var info = (typeof getSectionInfo === 'function') ? getSectionInfo(sk, board) : null;
    var secLabel = info ? info.section.title : sk;

    var spctColor = spct >= 80 ? 'var(--c-success)' : spct >= 40 ? 'var(--c-warning)' : 'var(--c-danger)';
    html += '<div class="diag-section-row" role="button" tabindex="0" onclick="openSection(\'' + escapeHtml(sk) + '\',\'' + escapeHtml(board) + '\')">';
    html += '<span class="diag-icon">' + icon + '</span>';
    html += '<div class="diag-label-col">';
    html += '<span class="diag-label">' + sk + ' ' + escapeHtml(secLabel) + '</span>';
    html += '<div class="diag-bar"><div class="diag-bar-fill" style="width:' + spct + '%;background:' + spctColor + '"></div></div>';
    html += '</div>';
    html += '<span class="diag-score">' + sr.scored + '/' + sr.total + '</span>';
    html += '<span class="diag-pct" style="color:' + spctColor + '">' + spct + '%</span>';
    html += '</div>';
  }

  /* Weak sections recommendation */
  var weakSecs = secKeys.filter(function(k) {
    return secResults[k].total > 0 && (secResults[k].scored / secResults[k].total) < 0.5;
  });
  if (weakSecs.length > 0) {
    html += '<div class="diag-recs">';
    html += '<div class="diag-recs-title">\u26a0\ufe0f ' + t('Recommended Focus', '\u5efa\u8bae\u91cd\u70b9\u590d\u4e60') + '</div>';
    for (var wi = 0; wi < Math.min(weakSecs.length, 5); wi++) {
      var wk = weakSecs[wi];
      var wInfo = (typeof getSectionInfo === 'function') ? getSectionInfo(wk, board) : null;
      var wLabel = wInfo ? wInfo.section.title : wk;
      html += '<div class="diag-rec-item" role="button" tabindex="0" onclick="openSection(\'' + escapeHtml(wk) + '\',\'' + escapeHtml(board) + '\')">';
      html += '<span>' + wk + ' ' + escapeHtml(wLabel) + '</span>';
      html += '<span class="diag-rec-go">' + t('Review', '\u53bb\u590d\u4e60') + ' \u2192</span>';
      html += '</div>';
    }
    html += '</div>';
  }

  /* Save diagnostic result */
  var diagResult = { date: new Date().toISOString(), board: board, score: exam.scored, total: exam.totalMarks, pct: pct, sections: secResults, isMock: !!_isMockExam };
  try {
    var diagHistory = JSON.parse(localStorage.getItem('diag_history') || '[]');
    diagHistory.push(diagResult);
    if (diagHistory.length > 10) diagHistory = diagHistory.slice(-10);
    localStorage.setItem('diag_history', JSON.stringify(diagHistory));
  } catch(e) {}

  /* History trend chart (show if >=2 results) */
  if (diagHistory && diagHistory.length >= 2) {
    html += '<div class="diag-trend">';
    html += '<h4 class="sub-heading">' + t('Score History', '\u6210\u7ee9\u8d8b\u52bf') + '</h4>';
    html += '<div class="diag-trend-chart">';
    for (var hi = 0; hi < diagHistory.length; hi++) {
      var dh = diagHistory[hi];
      var dhPct = dh.pct || 0;
      var dhColor = dhPct >= 70 ? 'var(--c-success)' : dhPct >= 40 ? 'var(--c-warning)' : 'var(--c-danger)';
      var dhDate = dh.date ? dh.date.slice(5, 10) : '';
      var dhType = dh.isMock ? 'Mock' : 'Diag';
      var dhTip = dhDate + ' ' + dhType + ': ' + dhPct + '%';
      html += '<div class="diag-trend-col" title="' + escapeHtml(dhTip) + '">';
      html += '<div class="diag-trend-bar" style="height:' + dhPct + '%;background:' + dhColor + '">';
      html += '<span class="diag-trend-val">' + dhPct + '</span>';
      html += '</div>';
      html += '<div class="diag-trend-label">' + dhDate + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  /* Action buttons */
  html += '<div class="btn-row btn-row--gap12 btn-row--center btn-row--mt24 btn-row--wrap pb-40">';
  if (_isMockExam) {
    html += '<button class="btn btn-primary" onclick="ppShowMockSetup(\'' + escapeHtml(board) + '\')">\ud83d\udd04 ' + t('New Mock', '\u65b0\u6a21\u62df\u5377') + '</button>';
  } else {
    html += '<button class="btn btn-primary" onclick="startDiagnostic(\'' + escapeHtml(board) + '\')">\ud83d\udd04 ' + t('Retry', '\u91cd\u65b0\u6d4b\u8bd5') + '</button>';
    html += '<button class="btn btn-ghost" onclick="ppShowMockSetup(\'' + escapeHtml(board) + '\')" style="border-color:var(--c-warning);color:var(--c-warning)">\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u5377') + '</button>';
  }
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">\u2190 ' + t('Home', '\u9996\u9875') + '</button>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
  renderMath(el);
}

/* ═══ WRONG BOOK ═══ */

function ppShowWrongBook(sectionId, board) {
  board = board || 'cie';

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-pastpaper');
    if (!el) return;

    var wb = _ppGetWB();
    var allQ = getPPBySection(board, sectionId);
    var wrongItems = [];

    for (var i = 0; i < allQ.length; i++) {
      var q = allQ[i];
      if (wb[q.id] && wb[q.id].status === 'active') {
        wrongItems.push({ q: q, wb: wb[q.id] });
      }
    }

    var html = '';
    html += '<div class="page-header">';
    html += '<button class="btn btn-ghost btn-sm" onclick="ppBack()">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
    html += '<h3 class="mt-0 mb-0 flex-1">\ud83d\udcd5 ' + t('Review Book', '\u590d\u4e60\u672c') + '</h3>';
    html += '</div>';

    if (wrongItems.length === 0) {
      html += '<div class="pp-empty">';
      html += '<div class="pp-empty-icon">\ud83c\udf89</div>';
      html += '<div class="pp-all-clear-title">' + t('All clear!', '\u5168\u90e8\u89e3\u51b3\uff01') + '</div>';
      html += '<div>' + t('No questions to review \u2014 keep up the great work!', '\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u9898\u76ee\uff0c\u7ee7\u7eed\u4fdd\u6301\uff01') + '</div>';
      html += '</div>';
    } else {
      html += '<p style="color:var(--c-text2);font-size:13px;margin-bottom:16px">';
      html += wrongItems.length + ' ' + t('questions to review', '\u9898\u5f85\u590d\u4e60');
      html += '</p>';

      for (var wi = 0; wi < wrongItems.length; wi++) {
        var item = wrongItems[wi];
        var errLabel = '';
        for (var ei = 0; ei < PP_ERROR_TYPES.length; ei++) {
          if (PP_ERROR_TYPES[ei].id === item.wb.errorType) {
            errLabel = t(PP_ERROR_TYPES[ei].en, PP_ERROR_TYPES[ei].zh);
            break;
          }
        }

        html += '<div class="pp-wrong-item" role="button" tabindex="0" onclick="ppReviewWrongItem(\'' + escapeHtml(item.q.id) + '\',\'' + escapeHtml(sectionId) + '\',\'' + escapeHtml(board) + '\')">';
        html += '<div class="pp-wrong-icon">\ud83d\udd34</div>';
        html += '<div class="pp-wrong-meta">';
        html += '<div style="font-size:13px;font-weight:600">' + item.q.src + ' <span class="pp-marks-badge">' + item.q.marks + ' mks</span></div>';
        var noteText = errLabel || item.wb.note || '';
        if (noteText) html += '<div class="pp-wrong-note">' + noteText + '</div>';
        /* Recovery suggestion from Learning Graph */
        if (typeof getRecoveryCandidates === 'function') {
          var recovery = getRecoveryCandidates(item.q.id, sectionId, board);
          if (recovery && (recovery.weakVocab.length > 0 || recovery.weakKPs.length > 0)) {
            html += '<div class="recovery-hint">';
            if (recovery.weakVocab.length > 0) {
              html += '\ud83d\udcd6 ' + recovery.weakVocab.slice(0, 3).map(function(v) { return escapeHtml(v.word); }).join(', ');
            }
            if (recovery.weakKPs.length > 0) {
              if (recovery.weakVocab.length > 0) html += ' \u00b7 ';
              html += '\ud83e\udde0 ' + recovery.weakKPs.map(function(k) { return escapeHtml(k.title); }).join(', ');
            }
            html += ' <span class="recovery-hint-cta">\u2192 ' + t('view recovery', '\u67e5\u770b\u4fee\u590d\u5efa\u8bae') + '</span>';
            html += '</div>';
          }
        }
        html += '</div>';
        html += '<div class="pp-wrong-review-count">\u00d7' + (item.wb.reviewCount || 0) + '</div>';
        html += '</div>';
      }

      /* Review all button */
      html += '<div class="text-center mt-20 pb-40">';
      html += '<button class="btn btn-primary" onclick="ppStartWrongBookReview(\'' + escapeHtml(sectionId) + '\',\'' + escapeHtml(board) + '\')" style="padding:10px 28px">';
      html += '\ud83d\udd04 ' + t('Review All', '\u5168\u90e8\u590d\u4e60') + ' (' + wrongItems.length + ')</button>';
      html += '</div>';
    }

    el.innerHTML = html;
    showPanel('pastpaper');
  });
}

function ppReviewWrongItem(qid, sectionId, board) {
  /* Start practice mode with just this one question */
  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var allQ = getPPBySection(board, sectionId);
    var q = null;
    for (var i = 0; i < allQ.length; i++) {
      if (allQ[i].id === qid) { q = allQ[i]; break; }
    }
    if (!q) return;

    /* Update review count */
    var wb = _ppGetWB();
    if (wb[qid]) { wb[qid].reviewCount = (wb[qid].reviewCount || 0) + 1; wb[qid].lastReview = Date.now(); }
    _ppSaveWB(wb);

    _ppSession = {
      questions: [q],
      current: 0,
      mode: 'practice',
      board: board,
      sectionId: sectionId,
      results: []
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

function ppStartWrongBookReview(sectionId, board) {
  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var wb = _ppGetWB();
    var allQ = getPPBySection(board, sectionId);
    var wrongQs = [];

    for (var i = 0; i < allQ.length; i++) {
      if (wb[allQ[i].id] && wb[allQ[i].id].status === 'active') {
        wrongQs.push(allQ[i]);
        /* Update review count */
        wb[allQ[i].id].reviewCount = (wb[allQ[i].id].reviewCount || 0) + 1;
        wb[allQ[i].id].lastReview = Date.now();
      }
    }
    _ppSaveWB(wb);

    if (!wrongQs.length) {
      showToast(t('No questions to review!', '\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u9898\u76ee\uff01'));
      return;
    }

    _ppSession = {
      questions: wrongQs,
      current: 0,
      mode: 'practice',
      board: board,
      sectionId: sectionId,
      results: []
    };
    showPanel('pastpaper');
    renderPPCard();
  });
}

/* ══════════════════════════════════════════════════════════════
   FULL PAPER BROWSING + EXAM MODULE
   ══════════════════════════════════════════════════════════════ */

/* Active filters for paper detail question list */
var _ppDetailFilter = { topic: null, cmd: null };

/* ─── Paper browse panel ─── */

function ppShowPaperBrowse(board) {
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-papers');
    if (!el) return;

    /* Set breadcrumb (v5.31.0) */
    var _ppModId = board === '25m' ? 'hhk' : board;
    if (typeof breadcrumbSet === 'function' && typeof HOME_MODULES !== 'undefined') {
      var _ppMod = null;
      for (var _mi = 0; _mi < HOME_MODULES.length; _mi++) {
        if (HOME_MODULES[_mi].id === _ppModId) { _ppMod = HOME_MODULES[_mi]; break; }
      }
      var _ppCrumbs = [
        { id: 'home', label: 'Home', labelZh: '\u9996\u9875', action: "navTo('home')" }
      ];
      if (_ppMod) {
        _ppCrumbs.push({ id: _ppModId, label: _ppMod.title, labelZh: _ppMod.titleZh, action: "openBoardHome('" + _ppModId + "')" });
      }
      _ppCrumbs.push({ id: 'papers', label: 'Past Papers', labelZh: '\u5957\u5377\u7ec3\u4e60' });
      breadcrumbSet(_ppCrumbs);
    }

    var papers = getPaperList(board);
    var results = _ppGetPaperResults();

    /* Group by year → session */
    var years = {};
    for (var i = 0; i < papers.length; i++) {
      var p = papers[i];
      if (!years[p.year]) years[p.year] = {};
      if (!years[p.year][p.session]) years[p.year][p.session] = [];
      years[p.year][p.session].push(p);
    }

    var yearKeys = Object.keys(years).sort(function(a, b) { return b - a; });

    var html = '';
    html += '<div class="page-header">';
    var _ppBrowseModId = board === '25m' ? 'hhk' : board;
    html += '<button class="btn-icon" onclick="openBoardHome(\'' + escapeHtml(_ppBrowseModId) + '\')" title="Back">&larr;</button>';
    html += '<h2 class="mt-0 mb-0 flex-1">' + t('Past Papers', '\u5957\u5377\u7ec3\u4e60') + '</h2>';
    html += '<button class="btn btn-sm btn-warning" onclick="ppShowMockSetup(\'' + escapeHtml(board) + '\')">\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u5377') + '</button>';
    html += '</div>';

    /* Browse tabs: Paper / Topic */
    var _tabPaper = _ppBrowseTab === 'paper' ? ' active' : '';
    var _tabTopic = _ppBrowseTab === 'topic' ? ' active' : '';
    html += '<div class="pp-browse-tabs">';
    html += '<button class="pp-browse-tab' + _tabPaper + '" onclick="ppSelectBrowseTab(\'paper\',\'' + escapeHtml(board) + '\')">\ud83d\udcc4 ' + t('By Paper', '\u5957\u5377') + '</button>';
    html += '<button class="pp-browse-tab' + _tabTopic + '" onclick="ppSelectBrowseTab(\'topic\',\'' + escapeHtml(board) + '\')">\ud83d\udcc2 ' + t('By Topic', '\u4e13\u9898') + '</button>';
    html += '</div>';

    html += '<div id="pp-browse-content">';
    if (_ppBrowseTab === 'topic') {
      html += _ppRenderTopicBrowse(board);
    } else {
      /* Year tabs */
      html += '<div class="pp-year-tabs" id="pp-year-tabs">';
      for (var yi = 0; yi < yearKeys.length; yi++) {
        var yr = yearKeys[yi];
        var cls = yi === 0 ? 'pp-year-tab active' : 'pp-year-tab';
        html += '<button class="' + cls + '" onclick="ppSelectYear(' + yr + ',\'' + escapeHtml(board) + '\')" data-year="' + yr + '">' + yr + '</button>';
      }
      html += '</div>';

      /* Paper cards for first year */
      html += '<div id="pp-papers-body">';
      html += _ppRenderYearPapers(years[yearKeys[0]], yearKeys[0], board, results);
      html += '</div>';
    }
    html += '</div>';

    /* Store data for tab switching */
    window._ppYearsData = years;
    window._ppBrowseBoard = board;

    el.innerHTML = html;
    showPanel('papers');
  });
}

function ppSelectYear(year, board) {
  /* Update tab highlight */
  var tabs = document.querySelectorAll('#pp-year-tabs .pp-year-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-year') == year);
  }
  /* Render papers for selected year */
  var body = E('pp-papers-body');
  if (!body || !window._ppYearsData) return;
  var results = _ppGetPaperResults();
  body.innerHTML = _ppRenderYearPapers(window._ppYearsData[year], year, board, results);
}

function ppSelectBrowseTab(tab, board) {
  _ppBrowseTab = tab;
  ppShowPaperBrowse(board);
}

function _ppRenderTopicBrowse(board) {
  var syllabus = (typeof BOARD_SYLLABUS !== 'undefined') ? BOARD_SYLLABUS[board] : null;
  if (!syllabus || !syllabus.chapters) return '<p style="padding:16px;color:var(--c-text2)">' + t('Loading syllabus...', '\u52a0\u8f7d\u4e2d...') + '</p>';

  var chapters = syllabus.chapters;
  var mastery = _ppGetMastery();
  var allQ = getPPQuestions(board);

  /* Build section question count map */
  var secCount = {};
  for (var qi = 0; qi < allQ.length; qi++) {
    var sec = allQ[qi].s;
    if (sec) secCount[sec] = (secCount[sec] || 0) + 1;
  }

  var html = '';
  for (var ci = 0; ci < chapters.length; ci++) {
    var ch = chapters[ci];
    var sections = ch.sections || [];
    var chTotal = 0;
    for (var si = 0; si < sections.length; si++) {
      chTotal += secCount[sections[si].id] || 0;
    }
    if (chTotal === 0) continue;

    html += '<div class="pp-topic-chapter">';
    html += '<div class="pp-topic-chapter-title">' + escapeHtml(ch.title || ch.id) + ' <span class="pp-topic-count">' + chTotal + ' ' + t('questions', '\u9898') + '</span></div>';

    for (var sj = 0; sj < sections.length; sj++) {
      var s = sections[sj];
      var qc = secCount[s.id] || 0;
      if (qc === 0) continue;

      /* Calculate mastery progress */
      var sQuestions = allQ.filter(function(q) { return q.s === s.id; });
      var masteredCount = 0;
      for (var mqi = 0; mqi < sQuestions.length; mqi++) {
        var qm = mastery[sQuestions[mqi].id];
        if (qm && qm.fs === 'mastered') masteredCount++;
      }
      var pct = qc > 0 ? Math.round(masteredCount / qc * 100) : 0;

      html += '<div class="pp-topic-row" data-section-id="' + escapeHtml(s.id) + '" role="button" tabindex="0" onclick="startPastPaper(\'' + escapeHtml(s.id) + '\',\'' + escapeHtml(board) + '\',\'practice\')">';
      html += '<div class="pp-topic-info">';
      html += '<span class="pp-topic-id">' + escapeHtml(s.id) + '</span> ';
      html += '<span class="pp-topic-name">' + escapeHtml(t(s.title, s.titleZh || s.title)) + '</span>';
      html += '</div>';
      html += '<div class="pp-topic-meta">';
      html += '<span class="pp-topic-badge">' + qc + '</span>';
      html += '<div class="pp-topic-progress"><div class="pp-topic-progress-fill" style="width:' + pct + '%"></div></div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
  }

  return html;
}

function _ppRenderYearPapers(sessions, year, board, results) {
  if (!sessions) return '';
  var sessionOrder = ['SP', 'Jan', 'March', 'FebMarch', 'June', 'MayJune', 'Nov', 'OctNov', 'Specimen'];
  var html = '';

  for (var si = 0; si < sessionOrder.length; si++) {
    var sess = sessionOrder[si];
    if (!sessions[sess]) continue;
    var papers = sessions[sess];
    var sl = PP_SESSION_LABELS[sess] || { en: sess, zh: sess };

    html += '<h4 class="pp-session-heading">' + t(sl.en, sl.zh) + ' ' + year + '</h4>';
    html += '<div class="pp-paper-grid">';

    for (var pi = 0; pi < papers.length; pi++) {
      var p = papers[pi];
      var tl = PP_TYPE_LABELS[p.type] || { en: p.type, zh: p.type, cls: '' };
      var result = results[p.key];

      html += '<div class="pp-paper-card" role="button" tabindex="0" onclick="ppShowPaperDetail(\'' + escapeHtml(p.key) + '\',\'' + escapeHtml(board) + '\')">';
      html += '<div class="pp-paper-card-top">';
      html += '<span class="pp-paper-type ' + tl.cls + '">' + t(tl.en, tl.zh) + '</span>';
      html += '<span class="pp-paper-num">Paper ' + p.paper + '</span>';
      html += '</div>';
      html += '<div class="pp-paper-card-info">';
      html += '<span>' + p.totalMarks + ' ' + t('marks', '分') + '</span>';
      html += '<span>' + p.time + ' min</span>';
      html += '<span>' + p.qcount + ' Q</span>';
      html += '</div>';
      if (result) {
        var pct = Math.round((result.score / result.total) * 100);
        html += '<div class="pp-paper-card-result">';
        html += '<span class="pp-paper-score">' + result.score + '/' + result.total + ' (' + pct + '%)</span>';
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
  }
  return html;
}

/* ─── Paper detail / mode selection ─── */

function ppShowPaperDetail(paperKey, board) {
  board = board || 'cie';
  var meta = getPaperMeta(board)[paperKey];
  if (!meta) return;

  _ppDetailFilter = { topic: null, cmd: null };
  var questions = getPPByPaper(board, paperKey);
  var tl = PP_TYPE_LABELS[meta.type] || { en: meta.type, zh: meta.type, cls: '' };
  var result = _ppGetPaperResults()[paperKey];

  var html = '';
  html += '<div class="page-header">';
  html += '<button class="btn-icon" onclick="ppShowPaperBrowse(\'' + escapeHtml(board) + '\')" title="Back">&larr;</button>';
  html += '<h2 class="mt-0 mb-0 flex-1">Paper ' + meta.paper + '</h2>';
  html += '<span class="pp-paper-type ' + tl.cls + '">' + t(tl.en, tl.zh) + '</span>';
  html += '</div>';

  html += '<div class="pp-paper-detail-info">';
  html += '<div class="pp-detail-row"><span>' + t('Year', '年份') + '</span><span>' + meta.year + ' ' + (PP_SESSION_LABELS[meta.session] ? t(PP_SESSION_LABELS[meta.session].en, PP_SESSION_LABELS[meta.session].zh) : meta.session) + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Total Marks', '总分') + '</span><span>' + meta.totalMarks + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Time', '时间') + '</span><span>' + meta.time + ' min</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Questions', '题目') + '</span><span>' + meta.qcount + '</span></div>';
  if (result) {
    var pct = Math.round((result.score / result.total) * 100);
    html += '<div class="pp-detail-row"><span>' + t('Best Score', '最高分') + '</span><span class="pp-paper-score">' + result.score + '/' + result.total + ' (' + pct + '%)</span></div>';
  }
  html += '</div>';

  /* Topic breakdown — clickable chips */
  var topicCounts = {};
  for (var i = 0; i < questions.length; i++) {
    var ts = questions[i].topics || [];
    for (var j = 0; j < ts.length; j++) {
      topicCounts[ts[j]] = (topicCounts[ts[j]] || 0) + 1;
    }
  }
  if (Object.keys(topicCounts).length > 0) {
    html += '<h4 class="pp-section-h4">' + t('Topics', '知识点分布') + '</h4>';
    html += '<div class="pp-topic-chips" id="pp-detail-topic-chips">';
    for (var tp in topicCounts) {
      html += '<span class="pp-error-chip pp-detail-topic-chip" data-topic="' + escapeHtml(tp) + '">' + escapeHtml(tp) + ' (' + topicCounts[tp] + ')</span>';
    }
    html += '</div>';
  }

  /* Command word distribution — clickable badges */
  var cmdCounts = {};
  for (var ci = 0; ci < questions.length; ci++) {
    var ck = questions[ci].cmd || 'other';
    cmdCounts[ck] = (cmdCounts[ck] || 0) + 1;
  }
  if (Object.keys(cmdCounts).length > 1) {
    html += '<h4 class="pp-section-h4">' + t('Command Words', '\u6307\u4ee4\u52a8\u8bcd\u5206\u5e03') + '</h4>';
    html += '<div class="pp-topic-chips" id="pp-detail-cmd-chips">';
    var cmdOrd = (typeof PP_CMD_ORDER !== 'undefined') ? PP_CMD_ORDER : Object.keys(cmdCounts);
    for (var coi = 0; coi < cmdOrd.length; coi++) {
      var cmk = cmdOrd[coi];
      if (!cmdCounts[cmk]) continue;
      var cml = (typeof PP_CMD_LABELS !== 'undefined' && PP_CMD_LABELS[cmk]) ? PP_CMD_LABELS[cmk] : null;
      var cmLabel = cml ? t(cml.en, cml.zh) : cmk;
      html += '<span class="pp-cmd-badge pp-detail-cmd-chip" data-cmd="' + escapeHtml(cmk) + '" style="padding:3px 10px;cursor:pointer">' + escapeHtml(cmLabel) + ' <b>' + cmdCounts[cmk] + '</b></span>';
    }
    html += '</div>';
  }

  /* Action buttons */
  html += '<div class="btn-row btn-row--gap12 btn-row--center btn-row--mt24 btn-row--wrap">';
  html += '<button class="btn btn-primary" onclick="ppStartFullPaper(\'' + escapeHtml(paperKey) + '\',\'' + escapeHtml(board) + '\',\'practice\')">';
  html += t('Practice', '练习模式') + '</button>';
  html += '<button class="btn btn-ghost" onclick="ppStartFullPaper(\'' + escapeHtml(paperKey) + '\',\'' + escapeHtml(board) + '\',\'exam\')">';
  html += '\u23f1 ' + t('Exam Mode', '考试模式') + ' (' + meta.time + ' min)</button>';
  html += '</div>';

  /* Question list preview (rendered into a container for live filtering) */
  html += '<div id="pp-detail-qlist"></div>';

  var el = E('panel-papers');
  if (el) el.innerHTML = html;
  showPanel('papers');

  /* Render question list */
  _ppRenderDetailQList(paperKey, board, questions);

  /* Bind chip click events */
  _ppBindDetailChips(paperKey, board, questions);
}

/* Render filtered question list in paper detail */
function _ppRenderDetailQList(paperKey, board, questions) {
  var wrap = E('pp-detail-qlist');
  if (!wrap) return;
  var ft = _ppDetailFilter.topic;
  var fc = _ppDetailFilter.cmd;

  /* Filter questions */
  var filtered = [];
  var idxMap = []; /* original index for onclick */
  for (var qi = 0; qi < questions.length; qi++) {
    var q = questions[qi];
    if (ft && (q.topics || []).indexOf(ft) === -1) continue;
    if (fc && (q.cmd || 'other') !== fc) continue;
    filtered.push(q);
    idxMap.push(qi);
  }

  var html = '<h4 class="pp-section-h4">' + t('Questions', '题目列表');
  if (ft || fc) {
    html += ' <span style="font-weight:400;font-size:12px;color:var(--c-text3)">(' + filtered.length + '/' + questions.length + ')</span>';
  }
  html += '</h4>';

  for (var fi = 0; fi < filtered.length; fi++) {
    var q = filtered[fi];
    var mastery = _ppGetQMastery(q.id);
    var mIcon = mastery === 'mastered' ? '\u2713' : mastery === 'partial' ? '\u25d0' : mastery === 'needs_work' ? '\u2717' : '';
    html += '<div class="pp-q-preview" role="button" tabindex="0" data-paperkey="' + escapeHtml(paperKey) + '" data-board="' + escapeHtml(board) + '" data-qidx="' + idxMap[fi] + '">';
    html += '<span class="pp-q-num">Q' + q.qnum + '</span>';
    html += '<span class="pp-q-topic-cell">' + (q.topics || []).join(', ') + '</span>';
    if (q.cmd && q.cmd !== 'other') {
      var cmdL = (typeof PP_CMD_LABELS !== 'undefined' && PP_CMD_LABELS[q.cmd]) ? PP_CMD_LABELS[q.cmd] : null;
      html += '<span class="pp-cmd-badge" style="margin-left:0">' + (cmdL ? t(cmdL.en, cmdL.zh) : q.cmd) + '</span>';
    }
    html += '<span class="pp-marks-badge">' + q.marks + '</span>';
    if (mIcon) html += '<span class="pp-q-mastery">' + mIcon + '</span>';
    html += '</div>';
  }

  if (filtered.length === 0) {
    html += '<div style="text-align:center;padding:24px;color:var(--c-text3)">' + t('No matching questions', '没有匹配的题目') + '</div>';
  }

  wrap.innerHTML = html;

  /* Bind question row clicks */
  wrap.querySelectorAll('.pp-q-preview').forEach(function(row) {
    row.addEventListener('click', function() {
      ppStartFullPaper(row.dataset.paperkey, row.dataset.board, 'practice', parseInt(row.dataset.qidx));
    });
  });
}

/* Bind topic/cmd chip click events for live filtering */
function _ppBindDetailChips(paperKey, board, questions) {
  var el = E('panel-papers');
  if (!el) return;

  /* Topic chips */
  el.querySelectorAll('.pp-detail-topic-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var val = chip.dataset.topic;
      _ppDetailFilter.topic = (_ppDetailFilter.topic === val) ? null : val;
      /* Update chip visual state */
      el.querySelectorAll('.pp-detail-topic-chip').forEach(function(c) {
        c.classList.toggle('selected', c.dataset.topic === _ppDetailFilter.topic);
      });
      _ppRenderDetailQList(paperKey, board, questions);
    });
  });

  /* Command word chips */
  el.querySelectorAll('.pp-detail-cmd-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var val = chip.dataset.cmd;
      _ppDetailFilter.cmd = (_ppDetailFilter.cmd === val) ? null : val;
      /* Update chip visual state */
      el.querySelectorAll('.pp-detail-cmd-chip').forEach(function(c) {
        c.classList.toggle('selected', c.dataset.cmd === _ppDetailFilter.cmd);
      });
      _ppRenderDetailQList(paperKey, board, questions);
    });
  });
}

/* ─── Start full paper practice/exam ─── */

function ppStartFullPaper(paperKey, board, mode, startIdx) {
  board = board || 'cie';
  mode = mode || 'practice';

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var questions = getPPByPaper(board, paperKey);
    if (!questions.length) {
      showToast(t('No questions found for this paper', '该套卷暂无题目'));
      return;
    }

    var meta = getPaperMeta(board)[paperKey] || {};

    if (mode === 'exam') {
      ppShowPaperExamSetup(paperKey, board, questions, meta);
    } else {
      _ppSession = {
        questions: questions,
        current: startIdx || 0,
        mode: 'practice',
        board: board,
        sectionId: null,
        paperKey: paperKey,
        results: []
      };
      showPanel('pastpaper');
      renderPPCard();
    }
  });
}

/* ─── Paper exam setup (confirmation screen) ─── */

function ppShowPaperExamSetup(paperKey, board, questions, meta) {
  var el = E('panel-pastpaper');
  if (!el) return;

  var tl = PP_TYPE_LABELS[meta.type] || { en: meta.type, zh: meta.type };
  var sl = PP_SESSION_LABELS[meta.session] || { en: meta.session, zh: meta.session };

  var html = '';
  html += '<div class="page-header page-header--mb20">';
  html += '<button class="btn btn-ghost btn-sm" onclick="ppShowPaperBrowse(\'' + escapeHtml(board) + '\')">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
  html += '</div>';

  html += '<div class="pp-setup">';
  html += '<h3>\u23f1 ' + t('Exam Mode', '\u5b9e\u6218\u6a21\u5f0f') + '</h3>';
  html += '<p class="desc">Paper ' + meta.paper + ' \u00b7 ' + meta.year + ' ' + t(sl.en, sl.zh) + '</p>';

  html += '<div class="pp-paper-detail-info mb-20">';
  html += '<div class="pp-detail-row"><span>' + t('Type', '\u7c7b\u578b') + '</span><span>' + t(tl.en, tl.zh) + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Total Marks', '\u603b\u5206') + '</span><span>' + meta.totalMarks + '</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Time Limit', '\u65f6\u9650') + '</span><span>' + meta.time + ' min</span></div>';
  html += '<div class="pp-detail-row"><span>' + t('Questions', '\u9898\u6570') + '</span><span>' + questions.length + '</span></div>';
  html += '</div>';

  html += '<div class="mt-24 text-center">';
  html += '<button class="btn btn-primary btn-lg" onclick="ppStartPaperExam(\'' + escapeHtml(paperKey) + '\',\'' + escapeHtml(board) + '\')">';
  html += '\u25b6 ' + t('Start Exam', '\u5f00\u59cb\u8003\u8bd5') + '</button>';
  html += '</div>';

  html += '</div>';

  el.innerHTML = html;
  showPanel('pastpaper');
}

function ppStartPaperExam(paperKey, board) {
  board = board || 'cie';
  var questions = getPPByPaper(board, paperKey);
  var meta = getPaperMeta(board)[paperKey] || {};

  _ppSession = {
    questions: questions,
    current: 0,
    mode: 'exam',
    board: board,
    sectionId: null,
    paperKey: paperKey,
    startTime: Date.now(),
    results: [],
    totalMarks: 0,
    timeLimit: meta.time ? meta.time * 60 : null
  };
  for (var i = 0; i < questions.length; i++) {
    _ppSession.totalMarks += questions[i].marks;
    _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
  }
  showPanel('pastpaper');
  renderPPCard();
}

/* ═══ MOCK EXAM GENERATOR ═══ */

function ppShowMockSetup(board) {
  if (typeof isGuest === 'function' && isGuest()) { showToast(t('Register free to unlock Mock Exam', '免费注册解锁模拟卷')); return; }
  board = board || 'cie';

  if (!_ppAccessAllowed(board)) {
    showToast(t('Past papers are under review. Coming soon!', '真题模块正在验收中，敬请期待！'));
    return;
  }

  /* Decay warning (#9) */
  var _overdueMock = typeof getDueWords === 'function' ? getDueWords().length : 0;
  if (_overdueMock > 20) {
    showToast(t('You have ' + _overdueMock + ' words ready for another round', '你有 ' + _overdueMock + ' 个词可以再练一轮了'));
  }

  Promise.all([loadPastPaperData(board), loadKaTeX()]).then(function() {
    var el = E('panel-pastpaper');
    if (!el) return;

    var allQ = getPPQuestions(board);
    if (!allQ || allQ.length === 0) {
      showToast(t('No questions available', '\u6682\u65e0\u9898\u76ee'));
      return;
    }

    /* Count sections with questions */
    var secs = {};
    for (var i = 0; i < allQ.length; i++) {
      if (allQ[i].s) secs[allQ[i].s] = (secs[allQ[i].s] || 0) + 1;
    }
    var secCount = Object.keys(secs).length;

    var html = '';
    html += '<div class="page-header page-header--mb20">';
    html += '<button class="btn btn-ghost btn-sm" onclick="ppShowPaperBrowse(\'' + escapeHtml(board) + '\')">\u2190 ' + t('Back', '\u8fd4\u56de') + '</button>';
    html += '</div>';

    html += '<div class="pp-setup">';
    html += '<h3>\ud83c\udfb2 ' + t('Mock Exam', '\u6a21\u62df\u8003\u8bd5') + '</h3>';
    html += '<p class="desc">';
    html += t('Generate a custom exam from ', '\u4ece ') + allQ.length + t(' questions across ', ' \u9053\u771f\u9898\u3001') + secCount + t(' topics', ' \u4e2a\u77e5\u8bc6\u70b9\u4e2d\u7ec4\u5377');
    html += '</p>';

    /* Mark target */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Target Marks', '\u76ee\u6807\u5206\u6570') + '</span>';
    html += '<div class="pp-setup-options" id="mock-marks">';
    var markOpts = [40, 70, 100];
    for (var mi = 0; mi < markOpts.length; mi++) {
      var active = mi === 1 ? ' active' : '';
      html += '<div class="pp-setup-opt' + active + '" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'marks\',' + markOpts[mi] + ')">' + markOpts[mi] + '</div>';
    }
    html += '</div></div>';

    /* Focus mode */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Focus', '\u91cd\u70b9') + '</span>';
    html += '<div class="pp-setup-options" id="mock-focus">';
    html += '<div class="pp-setup-opt active" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'balanced\')">' + t('Balanced', '\u5747\u8861') + '</div>';
    html += '<div class="pp-setup-opt" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'weak\')">' + t('Focus Areas', '\u91cd\u70b9\u5173\u6ce8') + '</div>';
    html += '<div class="pp-setup-opt" role="button" tabindex="0" onclick="ppMockSetOpt(this,\'focus\',\'random\')">' + t('Random', '\u968f\u673a') + '</div>';
    html += '</div></div>';

    /* Time limit */
    html += '<div class="pp-setup-row">';
    html += '<span>' + t('Time Limit', '\u65f6\u9650') + '</span>';
    html += '<span id="mock-time" class="fw-600">\u2248 70 min</span>';
    html += '</div>';

    html += '<div class="mt-24 text-center">';
    html += '<button class="btn btn-primary btn-lg" onclick="ppStartMockExam(\'' + escapeHtml(board) + '\')">';
    html += '\u25b6 ' + t('Generate & Start', '\u751f\u6210\u5e76\u5f00\u59cb') + '</button>';
    html += '</div>';

    html += '</div>';

    /* Store setup state */
    window._mockSetup = { board: board, marks: 70, focus: 'balanced' };

    el.innerHTML = html;
    showPanel('pastpaper');
  });
}

function ppMockSetOpt(el, key, val) {
  var opts = el.parentElement.querySelectorAll('.pp-setup-opt');
  for (var i = 0; i < opts.length; i++) opts[i].classList.remove('active');
  el.classList.add('active');
  if (window._mockSetup) window._mockSetup[key] = val;
  /* Update time estimate */
  if (key === 'marks') {
    var timeEl = document.getElementById('mock-time');
    if (timeEl) timeEl.textContent = '\u2248 ' + val + ' min';
  }
}

function ppStartMockExam(board) {
  board = board || 'cie';
  var setup = window._mockSetup || { marks: 70, focus: 'balanced' };
  var targetMarks = setup.marks || 70;
  var focus = setup.focus || 'balanced';

  var allQ = getPPQuestions(board);
  if (!allQ || allQ.length === 0) return;

  /* Group by section */
  var secQs = {};
  for (var i = 0; i < allQ.length; i++) {
    var s = allQ[i].s;
    if (!s || !allQ[i].marks) continue;
    if (!secQs[s]) secQs[s] = [];
    secQs[s].push(allQ[i]);
  }

  /* Calculate section weights */
  var secIds = Object.keys(secQs);
  var weights = {};
  for (var si = 0; si < secIds.length; si++) {
    var sid = secIds[si];
    if (focus === 'weak' && typeof getSectionHealth === 'function') {
      var h = getSectionHealth(sid, board);
      weights[sid] = h.score < 30 ? 4 : h.score < 60 ? 2 : 1;
    } else {
      weights[sid] = 1;
    }
  }

  /* Select questions to meet target marks */
  var selected = [];
  var totalMarks = 0;
  var maxPerSec = Math.max(3, Math.ceil(targetMarks / secIds.length));

  /* Shuffle sections weighted */
  var secPool = [];
  for (var wi = 0; wi < secIds.length; wi++) {
    for (var wj = 0; wj < weights[secIds[wi]]; wj++) {
      secPool.push(secIds[wi]);
    }
  }
  secPool.sort(function() { return Math.random() - 0.5; });

  /* Remove duplicates while preserving weighted order */
  var orderedSecs = [];
  var seen = {};
  for (var oi = 0; oi < secPool.length; oi++) {
    if (!seen[secPool[oi]]) {
      seen[secPool[oi]] = true;
      orderedSecs.push(secPool[oi]);
    }
  }

  /* Round-robin pick from sections */
  var perSec = {};
  var round = 0;
  while (totalMarks < targetMarks && round < 10) {
    var added = false;
    for (var ri = 0; ri < orderedSecs.length; ri++) {
      if (totalMarks >= targetMarks) break;
      var rsid = orderedSecs[ri];
      var rqs = secQs[rsid];
      var rPicked = perSec[rsid] || 0;
      if (rPicked >= maxPerSec || rPicked >= rqs.length) continue;

      /* Pick a random unpicked question from this section */
      var candidates = [];
      for (var ci = 0; ci < rqs.length; ci++) {
        var dup = false;
        for (var di = 0; di < selected.length; di++) {
          if (selected[di].id === rqs[ci].id) { dup = true; break; }
        }
        if (!dup) candidates.push(rqs[ci]);
      }
      if (candidates.length === 0) continue;
      candidates.sort(function() { return Math.random() - 0.5; });

      /* Try to pick one that doesn't overshoot too much */
      var picked = candidates[0];
      for (var pi = 0; pi < candidates.length; pi++) {
        if (totalMarks + candidates[pi].marks <= targetMarks + 5) {
          picked = candidates[pi];
          break;
        }
      }

      selected.push(picked);
      totalMarks += picked.marks;
      perSec[rsid] = rPicked + 1;
      added = true;
    }
    if (!added) break;
    round++;
  }

  /* Sort by difficulty (easy first, like a real paper) */
  var diffOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
  selected.sort(function(a, b) {
    return (diffOrder[a.d] || 1) - (diffOrder[b.d] || 1);
  });

  if (selected.length === 0) {
    showToast(t('Could not generate exam', '\u65e0\u6cd5\u751f\u6210\u8bd5\u5377'));
    return;
  }

  var timeLimit = totalMarks * 60; /* 1 min per mark */

  _ppSession = {
    questions: selected,
    current: 0,
    mode: 'exam',
    board: board,
    sectionId: null,
    isMock: true,
    startTime: Date.now(),
    results: [],
    totalMarks: 0,
    timeLimit: timeLimit
  };

  for (var mi = 0; mi < selected.length; mi++) {
    _ppSession.totalMarks += selected[mi].marks;
    _ppSession.results.push({ flagged: false, scored: null, status: null, errorType: '' });
  }

  showPanel('pastpaper');
  renderPPCard();
}
