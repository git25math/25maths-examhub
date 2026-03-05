/* ══════════════════════════════════════════════════════════════
   study.js — Flashcard study mode (renders into panel-study)
   ══════════════════════════════════════════════════════════════ */

var S = { pairs: [], idx: 0, ratings: {}, lvl: 0 };

/* Start study mode for a level */
function startStudy(li, subset) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  S.pairs = subset || shuffle(getPairs(lv.vocabulary));
  S.idx = 0;
  S.ratings = { hard: [], ok: [], easy: [] };
  S.lvl = li;

  showPanel('study');
  renderStudyCard();
}

/* Render the study panel content */
function renderStudyCard() {
  if (S.idx >= S.pairs.length) { finishStudy(); return; }

  var p = S.pairs[S.idx];
  var progress = S.pairs.length > 0 ? Math.round(S.idx / S.pairs.length * 100) : 0;

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + S.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (S.idx + 1) + ' / ' + S.pairs.length + '</div>';
  html += '</div>';

  /* Flashcard */
  html += '<div class="fc-box" id="fc-box" onclick="flipStudyCard()">';
  html += '<div class="fc-inner">';
  html += '<div class="fc-face fc-front">';
  html += '<div class="fc-front-label">ENGLISH</div>';
  html += '<div class="fc-front-word">' + escapeHtml(p.word) + '</div>';
  html += '<div class="fc-front-hint">' + t('Tap to flip', '\u70b9\u51fb\u7ffb\u724c\u67e5\u770b\u91ca\u4e49') + '</div>';
  html += '</div>';
  html += '<div class="fc-face fc-back">';
  html += '<div class="fc-back-label">' + t('CHINESE', '\u4e2d\u6587') + '</div>';
  html += '<div class="fc-back-def">' + escapeHtml(p.def) + '</div>';
  html += '<div class="fc-back-word">' + escapeHtml(p.word) + '</div>';
  html += '</div>';
  html += '</div></div>';

  /* Rating buttons */
  html += '<div class="fc-actions hidden" id="fc-study-actions">';
  html += '<button class="rate-btn rate-hard" onclick="rateStudy(\'hard\')">\ud83d\ude35 ' + t('Hard', '\u4e0d\u719f') + '</button>';
  html += '<button class="rate-btn rate-ok" onclick="rateStudy(\'ok\')">\ud83e\udd14 ' + t('Okay', '\u6a21\u7cca') + '</button>';
  html += '<button class="rate-btn rate-easy" onclick="rateStudy(\'easy\')">\u2705 ' + t('Easy', '\u638c\u63e1') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;
}

/* Flip card */
function flipStudyCard() {
  var box = E('fc-box');
  if (box && !box.classList.contains('flipped')) {
    box.classList.add('flipped');
    var actions = E('fc-study-actions');
    if (actions) actions.classList.remove('hidden');
  }
}

/* Rate word */
function rateStudy(r) {
  var p = S.pairs[S.idx];
  var key = wordKey(S.lvl, p.lid);

  S.ratings[r].push(p);

  if (r === 'easy') {
    recordAnswer(key, 'study-easy', true);
    /* Spawn particles */
    var box = E('fc-box');
    if (box) {
      var rc = box.getBoundingClientRect();
      spawnP(rc.left + rc.width / 2, rc.top + rc.height / 2, 8);
    }
    playCorrect();
  } else if (r === 'ok') {
    recordAnswer(key, 'study-okay', null);
  } else {
    recordAnswer(key, 'study-hard', false);
    playWrong();
  }

  S.idx++;
  renderStudyCard();
}

/* Finish study session */
function finishStudy() {
  var h = S.ratings.hard.length;
  var o = S.ratings.ok.length;
  var e = S.ratings.easy.length;
  var total = h + o + e;

  var html = '';
  html += '<div class="text-center">';
  html += '<div class="result-emoji">\ud83c\udf93</div>';
  html += '<div class="result-title">' + t('Study Complete!', '\u5b66\u4e60\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + (h === 0 && o === 0 ? t('All mastered!', '\u5168\u90e8\u638c\u63e1\uff01') : t((h + o) + ' need review', '\u6709' + (h + o) + '\u4e2a\u9700\u8981\u5de9\u56fa')) + '</div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:20px 0">';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-danger-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + h + '</div><div style="font-size:10px;font-weight:600">\ud83d\ude35 ' + t('Hard', '\u4e0d\u719f') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-warning-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + o + '</div><div style="font-size:10px;font-weight:600">\ud83e\udd14 ' + t('Okay', '\u6a21\u7cca') + '</div></div>';
  html += '<div style="padding:12px;border-radius:var(--r);background:var(--c-success-bg);text-align:center"><div style="font-size:22px;font-weight:800">' + e + '</div><div style="font-size:10px;font-weight:600">\u2705 ' + t('Easy', '\u638c\u63e1') + '</div></div>';
  html += '</div>';

  var studyEmoji = (h === 0 && o === 0) ? '\ud83c\udfc6' : (h === 0 ? '\ud83c\udf89' : '\ud83d\udcaa');
  _lastShareOpts = { mode: 'study', score: e, total: total, emoji: studyEmoji };

  html += nextStepHTML('\u2753', t('Quiz to test yourself', '\u6d4b\u9a8c\u68c0\u9a8c\u5b66\u4e60\u6548\u679c'), 'startQuiz(' + currentLvl + ')');

  html += '<div class="result-actions">';
  var hw = S.ratings.hard.concat(S.ratings.ok);
  if (hw.length > 0) {
    html += '<button class="btn btn-secondary" onclick="restudyHard()">\ud83d\udcd6 ' + t('Restudy hard', '\u518d\u5b66\u4e0d\u719f\u7684') + '</button>';
  }
  html += '<button class="btn btn-secondary" onclick="startStudy(' + currentLvl + ')">\ud83d\udd01 ' + t('Study again', '\u518d\u5b66\u4e00\u904d') + '</button>';
  html += '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>';
  html += '<button class="btn btn-ghost" onclick="openDeck(' + currentLvl + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  html += '</div>';

  E('panel-study').innerHTML = html;
  updateSidebar();
}

function restudyHard() {
  var hw = S.ratings.hard.concat(S.ratings.ok);
  startStudy(currentLvl, hw);
}
