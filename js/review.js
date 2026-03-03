/* ══════════════════════════════════════════════════════════════
   review.js — Ebbinghaus review dashboard + SRS bar chart
   ══════════════════════════════════════════════════════════════ */

var RV = { words: [], idx: 0, ratings: {} };

/* ═══ REVIEW DASHBOARD ═══ */
function renderReviewDash() {
  var all = getAllWords();
  var wd = getWordData();

  /* Count words at each SRS level */
  var counts = [0, 0, 0, 0, 0, 0, 0, 0];
  all.forEach(function(w) { counts[w.lv]++; });
  var maxCount = Math.max.apply(null, counts) || 1;

  /* Due words (lv < 3 or past due) */
  var now = Date.now();
  var dueWords = all.filter(function(w) {
    var d = wd[w.key];
    if (!d) return true; /* new words are due */
    if (w.lv < 3) return true;
    if (d.nr && d.nr <= now && d.st !== 'mastered') return true;
    return false;
  });

  var html = '';

  html += '<div class="section-title">\ud83e\udde0 \u8270\u5bbe\u6d69\u65af\u590d\u4e60</div>';

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

  /* Stats summary */
  html += '<div class="home-stats mb-24">';
  html += '<div class="stat-card"><div class="stat-val">' + all.length + '</div><div class="stat-label">\u603b\u8bcd\u6c47</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-warning)">' + dueWords.length + '</div><div class="stat-label">\u5f85\u590d\u4e60</div></div>';
  html += '<div class="stat-card"><div class="stat-val" style="color:var(--c-success)">' + counts[7] + '</div><div class="stat-label">30d \u638c\u63e1</div></div>';
  html += '</div>';

  /* Start review button */
  if (dueWords.length > 0) {
    html += '<div class="text-center mb-24">';
    html += '<button class="btn btn-primary" onclick="startReviewSession()">\ud83e\udde0 \u5f00\u59cb\u590d\u4e60 (' + dueWords.length + ' \u8bcd)</button>';
    html += '</div>';
  } else {
    html += '<div class="text-center mb-24" style="color:var(--c-muted)">\u6682\u65e0\u5f85\u590d\u4e60\u8bcd\u6c47 \ud83c\udf89</div>';
  }

  /* Due word list */
  if (dueWords.length > 0) {
    html += '<div class="section-title">\u5f85\u590d\u4e60\u8bcd\u6c47</div>';
    html += '<div class="word-list">';
    dueWords.slice(0, 30).forEach(function(w) {
      var lvColor = SRS_COLORS[w.lv] || SRS_COLORS[0];
      html += '<div class="word-row">';
      html += '<div class="word-en">' + w.word + '</div>';
      if (appLang === 'bilingual') {
        html += '<div class="word-zh">' + w.def + '</div>';
      }
      html += '<span class="word-lv" style="background:' + lvColor + '20;color:' + lvColor + '">' + SRS_LABELS[w.lv] + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  E('panel-review-dash').innerHTML = html;
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
    if (d.nr && d.nr <= now && d.st !== 'mastered') return true;
    return false;
  });

  if (due.length === 0) {
    showToast('\u6ca1\u6709\u5f85\u590d\u4e60\u7684\u8bcd\u6c47');
    return;
  }

  RV.words = shuffle(due);
  RV.idx = 0;
  RV.ratings = { hard: [], ok: [], easy: [] };

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
    var key = 'L' + li + '_W' + p.lid;
    var d = wd[key];
    return {
      key: key, word: p.word, def: p.def, level: li,
      status: d ? d.st : 'new',
      lv: d ? (d.lv || 0) : 0
    };
  }).filter(function(w) {
    var d = wd[w.key];
    if (!d) return true;
    if (w.lv < 3) return true;
    if (d.nr && d.nr <= now && d.st !== 'mastered') return true;
    return false;
  });

  if (due.length === 0) {
    /* Review all if none due */
    due = allP.map(function(p) {
      var key = 'L' + li + '_W' + p.lid;
      var d = wd[key];
      return { key: key, word: p.word, def: p.def, level: li, status: d ? d.st : 'new', lv: d ? (d.lv || 0) : 0 };
    });
  }

  currentLvl = li;
  RV.words = shuffle(due);
  RV.idx = 0;
  RV.ratings = { hard: [], ok: [], easy: [] };

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
  html += '<div class="fc-front-word">' + w.word + '</div>';
  html += '<div class="fc-front-hint">\u70b9\u51fb\u7ffb\u724c\u67e5\u770b\u91ca\u4e49</div>';
  html += '</div>';
  html += '<div class="fc-face fc-back">';
  html += '<div class="fc-back-label">\u4e2d\u6587</div>';
  html += '<div class="fc-back-def">' + w.def + '</div>';
  html += '<div class="fc-back-word">' + w.word + '</div>';
  html += '</div>';
  html += '</div></div>';

  /* Rating */
  html += '<div class="fc-actions hidden" id="rv-fc-actions">';
  html += '<button class="rate-btn rate-hard" onclick="rateReview(\'hard\')">\ud83d\ude35 \u8fd8\u4e0d\u719f</button>';
  html += '<button class="rate-btn rate-ok" onclick="rateReview(\'ok\')">\ud83e\udd14 \u5feb\u4e86</button>';
  html += '<button class="rate-btn rate-easy" onclick="rateReview(\'easy\')">\u2705 \u641e\u5b9a\u4e86</button>';
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

  var wd = getWordData()[w.key];
  var iv = wd ? wd.iv : 1;

  if (r === 'easy') {
    setWordStatus(w.key, 'mastered', Math.max(iv * 2.5, 7), true);
    var box = E('rv-fc-box');
    if (box) {
      var rc = box.getBoundingClientRect();
      spawnP(rc.left + rc.width / 2, rc.top + rc.height / 2, 8);
    }
  } else if (r === 'ok') {
    setWordStatus(w.key, 'learning', Math.max(iv * 1.2, 1), true);
  } else {
    setWordStatus(w.key, 'learning', 0.15, false);
  }

  RV.idx++;
  renderReviewCard();
}

function finishReview() {
  var h = RV.ratings.hard.length;
  var o = RV.ratings.ok.length;
  var e = RV.ratings.easy.length;

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">\ud83e\udde0</div>';
  html += '<div class="result-title">\u590d\u4e60\u5b8c\u6210\uff01</div>';
  html += '<div class="result-sub">' + (h === 0 ? '\u592a\u68d2\u4e86\uff01\u8fdb\u6b65\u660e\u663e' : '\u7ee7\u7eed\u52a0\u6cb9\uff0c\u660e\u5929\u518d\u6765\u590d\u4e60') + '</div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + h + '</div><div style="font-size:10px;font-weight:600">\ud83d\ude35 \u8fd8\u4e0d\u719f</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + o + '</div><div style="font-size:10px;font-weight:600">\ud83e\udd14 \u5feb\u4e86</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + e + '</div><div style="font-size:10px;font-weight:600">\u2705 \u641e\u5b9a</div></div>';
  html += '</div>';

  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="navTo(\'review-dash\')">\u2190 \u590d\u4e60\u4eea\u8868\u76d8</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">\u2190 \u8fd4\u56de\u9996\u9875</button>';
  html += '</div>';

  E('panel-review').innerHTML = html;
  updateSidebar();
}
