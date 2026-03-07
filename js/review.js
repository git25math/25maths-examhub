/* ══════════════════════════════════════════════════════════════
   review.js — Ebbinghaus review dashboard + SRS bar chart
   ══════════════════════════════════════════════════════════════ */

var RV = { words: [], idx: 0, ratings: {}, lvl: -1 };

/* ═══ REVIEW DASHBOARD ═══ */
function renderReviewDash() {
  var all = getAllWords();
  var wd = getWordData();

  /* Count words at each SRS level */
  var counts = [0, 0, 0, 0, 0, 0, 0, 0];
  all.forEach(function(w) { counts[w.lv]++; });
  var maxCount = Math.max.apply(null, counts) || 1;

  /* Due words (lv < 3 or past due) — use star-derived w.status */
  var now = Date.now();
  var dueWords = all.filter(function(w) {
    var d = wd[w.key];
    if (!d) return true; /* new words are due */
    if (w.lv < 3) return true;
    if (d.nr && d.nr <= now && w.status !== 'mastered') return true;
    return false;
  });

  /* Sort: lowest SRS level first, then most overdue first */
  dueWords.sort(function(a, b) {
    if (a.lv !== b.lv) return a.lv - b.lv;
    var aNr = (wd[a.key] && wd[a.key].nr) || 0;
    var bNr = (wd[b.key] && wd[b.key].nr) || 0;
    return aNr - bNr;
  });

  var html = '';

  html += '<div class="section-title" style="display:flex;align-items:center;gap:8px">\ud83e\udde0 ' + t('Ebbinghaus Review', '\u827e\u5bbe\u6d69\u65af\u590d\u4e60') + ' <button class="btn-help" onclick="showEbbinghausGuide()" title="' + t('About Ebbinghaus method', '\u4e86\u89e3\u827e\u5bbe\u6d69\u65af\u8bb0\u5fc6\u6cd5') + '">\u2753</button></div>';

  /* SRS Bar Chart */
  html += '<div class="srs-chart">';
  SRS_LABELS.forEach(function(label, i) {
    var height = counts[i] > 0 ? Math.round((counts[i] / maxCount) * 120) : 4;
    html += '<div class="srs-bar-wrap">';
    html += '<div class="srs-bar-count">' + counts[i] + '</div>';
    html += '<div class="srs-bar" style="height:' + height + 'px;background:' + SRS_COLORS[i] + '"></div>';
    html += '<div class="srs-bar-label">' + label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  /* SRS legend */
  html += '<div class="srs-legend">';
  html += '<span class="srs-legend-item" style="color:' + SRS_COLORS[0] + '">\u25cf ' + t('New', '\u65b0\u8bcd') + '</span>';
  html += '<span class="srs-legend-item" style="color:' + SRS_COLORS[3] + '">\u25cf ' + t('Learning', '\u5b66\u4e60\u4e2d') + '</span>';
  html += '<span class="srs-legend-item" style="color:' + SRS_COLORS[7] + '">\u25cf ' + t('Mastered', '\u5df2\u638c\u63e1') + '</span>';
  html += '</div>';

  /* Stats summary */
  html += '<div class="home-stats mb-24">';
  html += '<div class="stat-card"><div class="stat-val">' + all.length + '</div><div class="stat-label">' + t('Total', '\u603b\u8bcd\u6c47') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-warning)">' + dueWords.length + '</div><div class="stat-label">' + t('Due', '\u5f85\u590d\u4e60') + '</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-success)">' + counts[7] + '</div><div class="stat-label">' + t('30d Mastered', '30d \u638c\u63e1') + '</div></div>';
  html += '</div>';

  /* Start review button */
  if (dueWords.length > 0) {
    html += '<div class="text-center mb-24">';
    html += '<button class="btn btn-primary" onclick="startReviewSession()">\ud83e\udde0 ' + t('Start Review', '\u5f00\u59cb\u590d\u4e60') + ' (' + dueWords.length + ' ' + t('words', '\u8bcd') + ')</button>';
    html += '</div>';
  } else {
    html += '<div class="text-center mb-24" style="color:var(--c-muted)">' + t('No words due for review', '\u6682\u65e0\u5f85\u590d\u4e60\u8bcd\u6c47') + ' \ud83c\udf89</div>';
  }

  /* Due word list */
  if (dueWords.length > 0) {
    html += '<div class="section-title">' + t('Words Due for Review', '\u5f85\u590d\u4e60\u8bcd\u6c47') + '</div>';

    /* Search bar */
    html += '<div class="search-bar">';
    html += '<input class="search-input" id="review-search" type="text" placeholder="' + t('Filter due words...', '\u8fc7\u6ee4\u5f85\u590d\u4e60\u8bcd\u6c47...') + '" value="' + appSearch.replace(/"/g, '&quot;') + '" oninput="onReviewSearch(this.value)">';
    if (appSearch) {
      html += '<button class="search-clear" onclick="clearReviewSearch()">&times;</button>';
    }
    html += '</div>';

    var filtered = dueWords.filter(function(w) { return matchWord(w, appSearch); });
    if (appSearch) {
      html += '<div class="search-count">' + t(filtered.length + ' of ' + dueWords.length + ' due words', filtered.length + ' / ' + dueWords.length + ' \u4e2a\u5f85\u590d\u4e60\u8bcd') + '</div>';
    }

    html += '<div class="word-list">';
    filtered.slice(0, 30).forEach(function(w) {
      var lvColor = SRS_COLORS[w.lv] || SRS_COLORS[0];
      html += '<div class="word-row">';
      html += '<div class="word-en">' + escapeHtml(w.word) + '</div>';
      if (appLang === 'bilingual') {
        html += '<div class="word-zh">' + escapeHtml(w.def) + '</div>';
      }
      html += '<span class="word-lv" style="background:' + lvColor + '20;color:' + lvColor + '">' + SRS_LABELS[w.lv] + '</span>';
      html += '</div>';
    });
    html += '</div>';

    if (appSearch && filtered.length === 0) {
      html += '<div class="text-center" style="color:var(--c-muted);padding:16px 0">' + t('No matching words', '\u65e0\u5339\u914d\u8bcd\u6c47') + '</div>';
    }
  }

  E('panel-review-dash').innerHTML = html;
}

/* ═══ REVIEW SEARCH ═══ */
var _rvSearchTimer = null;
function onReviewSearch(val) {
  clearTimeout(_rvSearchTimer);
  _rvSearchTimer = setTimeout(function() {
    appSearch = val.toLowerCase().trim();
    renderReviewDash();
    var el = E('review-search');
    if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; }
  }, 200);
}

function clearReviewSearch() {
  appSearch = '';
  renderReviewDash();
}

/* ═══ EBBINGHAUS GUIDE MODAL ═══ */
function showEbbinghausGuide() {
  var html = '<div class="section-title">\ud83e\udde0 ' + t('Ebbinghaus Memory Method', '\u827e\u5bbe\u6d69\u65af\u8bb0\u5fc6\u6cd5') + '</div>';

  /* Principle */
  html += '<div class="guide-section">';
  html += '<p style="font-size:13px;color:var(--c-text2);line-height:1.6;text-align:left;margin-bottom:12px">';
  html += t('In 1885, Ebbinghaus discovered the forgetting curve: without review, only 33% is retained after 24h. By reviewing at the critical forgetting point, short-term memory converts to long-term memory.', '1885 \u5e74\u827e\u5bbe\u6d69\u65af\u53d1\u73b0\u8bb0\u5fc6\u8870\u51cf\u89c4\u5f8b\uff1a\u4e0d\u590d\u4e60 \u2192 24h \u540e\u4ec5\u5269 33%\u3002\u901a\u8fc7\u5728\u9057\u5fd8\u4e34\u754c\u70b9\u8fdb\u884c\u590d\u4e60\uff0c\u53ef\u5c06\u77ed\u671f\u8bb0\u5fc6\u8f6c\u4e3a\u957f\u671f\u8bb0\u5fc6\u3002');
  html += '</p></div>';

  /* SRS levels table */
  var srsDescs = t(
    ['New word', 'Review after 20 min', 'Review after 1 hour', 'Review after 9 hours', 'Review next day', 'Review after 2 days', 'Review after 1 week', '30 days \u2014 Mastered'],
    ['\u65b0\u8bcd\uff0c\u672a\u5f00\u59cb\u5b66\u4e60', '20 \u5206\u949f\u540e\u590d\u4e60', '1 \u5c0f\u65f6\u540e\u590d\u4e60', '9 \u5c0f\u65f6\u540e\u590d\u4e60', '\u6b21\u65e5\u590d\u4e60', '2 \u5929\u540e\u590d\u4e60', '1 \u5468\u540e\u590d\u4e60', '30 \u5929\u540e \u2014 \u5df2\u638c\u63e1']
  );
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">' + t('8-Level Review Intervals', '8 \u7ea7\u590d\u4e60\u95f4\u9694') + '</div>';
  SRS_LABELS.forEach(function(label, i) {
    html += '<div class="srs-row">';
    html += '<span class="srs-row-dot" style="background:' + SRS_COLORS[i] + '"></span>';
    html += '<span class="srs-row-label">' + label + '</span>';
    html += '<span class="srs-row-desc">' + srsDescs[i] + '</span>';
    html += '</div>';
  });
  html += '</div>';

  /* Rating mechanics */
  html += '<div class="guide-section">';
  html += '<div class="guide-tip-title">' + t('Rating System', '\u8bc4\u5206\u673a\u5236') + '</div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-success)"></span><span class="srs-row-label" style="color:var(--c-success)">' + t('Got it', '\u641e\u5b9a\u4e86') + '</span><span class="srs-row-desc">' + t('+1 level, interval \u00d72.5', '\u5347 1 \u7ea7\uff0c\u590d\u4e60\u95f4\u9694 \u00d72.5') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-warning)"></span><span class="srs-row-label" style="color:var(--c-warning)">' + t('Almost', '\u5feb\u4e86') + '</span><span class="srs-row-desc">' + t('+1 level, interval \u00d71.2', '\u5347 1 \u7ea7\uff0c\u590d\u4e60\u95f4\u9694 \u00d71.2') + '</span></div>';
  html += '<div class="srs-row"><span class="srs-row-dot" style="background:var(--c-danger)"></span><span class="srs-row-label" style="color:var(--c-danger)">' + t('Hard', '\u8fd8\u4e0d\u719f') + '</span><span class="srs-row-desc">' + t('-2 levels, review in 3.6h', '\u964d 2 \u7ea7\uff0c3.6h \u540e\u518d\u590d\u4e60') + '</span></div>';
  html += '</div>';

  /* Usage tip */
  html += '<div class="guide-tip">';
  html += '<div class="guide-tip-item">\ud83d\udca1 ' + t('Spend 5 minutes daily on due words \u2014 30 days of consistency shows remarkable results', '\u6bcf\u5929\u82b1 5 \u5206\u949f\u5b8c\u6210\u5f85\u590d\u4e60\u8bcd\u6c47\uff0c\u575a\u6301 30 \u5929\u6548\u679c\u663e\u8457') + '</div>';
  html += '</div>';

  html += '<button class="btn btn-ghost btn-block" onclick="hideModal()" style="margin-top:16px">' + t('Close', '\u5173\u95ed') + '</button>';
  showModal(html);
}

/* ═══ REVIEW SESSION (flashcard-based) ═══ */
function startReviewSession() {
  var all = getAllWords();
  var wd = getWordData();
  var now = Date.now();

  var due = all.filter(function(w) {
    var d = wd[w.key];
    if (!d) return true;
    if (w.lv < 3) return true;
    if (d.nr && d.nr <= now && w.status !== 'mastered') return true;
    return false;
  });

  if (due.length === 0) {
    showToast(t('No words due for review', '\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u8bcd\u6c47'));
    return;
  }

  RV.words = shuffle(due);
  RV.idx = 0;
  RV.ratings = { hard: [], ok: [], easy: [] };
  RV.lvl = -1;
  try { localStorage.setItem('wmatch_last_review', String(Date.now())); } catch(e) {}

  showPanel('review');
  renderReviewCard();
}

/* Start review for a specific level */
function startReview(li) {
  var lv = LEVELS[li];
  var allP = getPairs(lv.vocabulary);
  var wd = getWordData();
  var now = Date.now();

  var due = allP.map(function(p) {
    var key = wordKey(li, p.lid);
    var d = wd[key];
    var wOk = d ? (d.ok || 0) : 0;
    var wFail = d ? (d.fail || 0) : 0;
    var wStars = d && d.stars != null ? d.stars : computeStars(wOk, wFail);
    return {
      key: key, word: p.word, def: p.def, level: li,
      status: wStars === 0 ? 'new' : wStars === 4 ? 'mastered' : 'learning',
      lv: d ? (d.lv || 0) : 0
    };
  }).filter(function(w) {
    var d = wd[w.key];
    if (!d) return true;
    if (w.lv < 3) return true;
    if (d.nr && d.nr <= now && w.status !== 'mastered') return true;
    return false;
  });

  if (due.length === 0) {
    /* Review all if none due */
    due = allP.map(function(p) {
      var key = wordKey(li, p.lid);
      var d = wd[key];
      var rwOk = d ? (d.ok || 0) : 0;
      var rwFail = d ? (d.fail || 0) : 0;
      var rwStars = d && d.stars != null ? d.stars : computeStars(rwOk, rwFail);
      return {
        key: key, word: p.word, def: p.def, level: li,
        status: rwStars === 0 ? 'new' : rwStars === 4 ? 'mastered' : 'learning',
        lv: d ? (d.lv || 0) : 0
      };
    });
  }

  currentLvl = li;
  RV.words = shuffle(due);
  RV.idx = 0;
  RV.ratings = { hard: [], ok: [], easy: [] };
  RV.lvl = li;

  showPanel('review');
  renderReviewCard();
}

function renderReviewCard() {
  if (RV.idx >= RV.words.length) { finishReview(); return; }

  var w = RV.words[RV.idx];
  var progress = RV.words.length > 0 ? Math.round(RV.idx / RV.words.length * 100) : 0;

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="navTo(\'review-dash\')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (RV.idx + 1) + ' / ' + RV.words.length + '</div>';
  html += '</div>';

  /* Flashcard */
  html += '<div class="fc-box" id="rv-fc-box" onclick="flipReviewCard()">';
  html += '<div class="fc-inner">';
  html += '<div class="fc-face fc-front">';
  html += '<div class="fc-front-label">ENGLISH</div>';
  html += '<div class="fc-front-word">' + escapeHtml(w.word) + '</div>';
  html += '<div class="fc-front-hint">' + t('Tap to flip', '\u70b9\u51fb\u7ffb\u724c\u67e5\u770b\u91ca\u4e49') + '</div>';
  html += '</div>';
  html += '<div class="fc-face fc-back">';
  html += '<div class="fc-back-label">' + t('CHINESE', '\u4e2d\u6587') + '</div>';
  html += '<div class="fc-back-def">' + escapeHtml(w.def) + '</div>';
  html += '<div class="fc-back-word">' + escapeHtml(w.word) + '</div>';
  html += '</div>';
  html += '</div></div>';

  /* Rating */
  html += '<div class="fc-actions hidden" id="rv-fc-actions">';
  html += '<button class="rate-btn rate-hard" onclick="rateReview(\'hard\')">\ud83d\ude35 ' + t('Hard', '\u8fd8\u4e0d\u719f') + '</button>';
  html += '<button class="rate-btn rate-ok" onclick="rateReview(\'ok\')">\ud83e\udd14 ' + t('Almost', '\u5feb\u4e86') + '</button>';
  html += '<button class="rate-btn rate-easy" onclick="rateReview(\'easy\')">\u2705 ' + t('Got it', '\u641e\u5b9a\u4e86') + '</button>';
  html += '</div>';

  E('panel-review').innerHTML = html;
}

function flipReviewCard() {
  var box = E('rv-fc-box');
  if (box && !box.classList.contains('flipped')) {
    box.classList.add('flipped');
    var actions = E('rv-fc-actions');
    if (actions) actions.classList.remove('hidden');
  }
}

function rateReview(r) {
  var w = RV.words[RV.idx];
  RV.ratings[r].push(w);

  if (r === 'easy') {
    recordAnswer(w.key, 'review', true);
    var box = E('rv-fc-box');
    if (box) {
      var rc = box.getBoundingClientRect();
      spawnP(rc.left + rc.width / 2, rc.top + rc.height / 2, 8);
    }
    playCorrect();
  } else if (r === 'ok') {
    recordAnswer(w.key, 'review', true);
  } else {
    recordAnswer(w.key, 'review', false);
    playWrong();
  }

  RV.idx++;
  renderReviewCard();
}

function finishReview() {
  if (RV.lvl >= 0) markModeDone(RV.lvl, 'review');
  var h = RV.ratings.hard.length;
  var o = RV.ratings.ok.length;
  var e = RV.ratings.easy.length;

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83e\udde0</div>';
  html += '<div class="result-title">' + t('Review Complete!', '\u590d\u4e60\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + (h === 0 ? t('Great progress!', '\u592a\u68d2\u4e86\uff01\u8fdb\u6b65\u660e\u663e') : t('Keep going, review again tomorrow', '\u7ee7\u7eed\u52a0\u6cb9\uff0c\u660e\u5929\u518d\u6765\u590d\u4e60')) + '</div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + h + '</div><div style="font-size:10px;font-weight:600">\ud83d\ude35 ' + t('Hard', '\u8fd8\u4e0d\u719f') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + o + '</div><div style="font-size:10px;font-weight:600">\ud83e\udd14 ' + t('Almost', '\u5feb\u4e86') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + e + '</div><div style="font-size:10px;font-weight:600">\u2705 ' + t('Got it', '\u641e\u5b9a') + '</div></div>';
  html += '</div>';

  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'review-dash\')">\u2190 ' + t('Review Dashboard', '\u590d\u4e60\u4eea\u8868\u76d8') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">\u2190 ' + t('Home', '\u8fd4\u56de\u9996\u9875') + '</button>';
  html += '</div>';

  E('panel-review').innerHTML = html;
  updateSidebar();
}
