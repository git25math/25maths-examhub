/* ══════════════════════════════════════════════════════════════
   quiz.js — Multiple choice quiz mode (4 options, bidirectional)
   ══════════════════════════════════════════════════════════════ */

var Q = { pairs: [], idx: 0, correct: 0, lvl: 0, locked: false, dir: 'en2zh' };

/* ═══ QUIZ DISTRACTOR CACHE ═══ */
var _quizCache = null;
function getQuizCache() {
  if (_quizCache) return _quizCache;
  var defsSet = {}, wordsSet = {};
  var defs = [], words = [];
  LEVELS.forEach(function(lv) {
    getPairs(lv.vocabulary).forEach(function(pp) {
      if (!defsSet[pp.def]) { defsSet[pp.def] = true; defs.push(pp.def); }
      if (!wordsSet[pp.word]) { wordsSet[pp.word] = true; words.push(pp.word); }
    });
  });
  _quizCache = { defs: defs, words: words };
  return _quizCache;
}

function startQuiz(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  Q.pairs = shuffle(getPairs(lv.vocabulary));
  Q.idx = 0;
  Q.correct = 0;
  Q.lvl = li;
  Q.locked = false;
  Q.dir = 'en2zh';

  showPanel('quiz');
  renderQuizCard();
}

function setQuizDir(dir) {
  Q.dir = dir;
  Q.locked = false;
  renderQuizCard();
}

function renderQuizCard() {
  if (Q.idx >= Q.pairs.length) { finishQuiz(); return; }

  var p = Q.pairs[Q.idx];
  var progress = Q.pairs.length > 0 ? Math.round(Q.idx / Q.pairs.length * 100) : 0;

  /* Direction-dependent question/answer/options */
  var questionText, correctAnswer, hintText;
  var distractors = [];

  var cache = getQuizCache();
  if (Q.dir === 'en2zh') {
    questionText = p.word;
    correctAnswer = p.def;
    hintText = t('Choose the correct definition', '\u9009\u62e9\u6b63\u786e\u7684\u4e2d\u6587\u91ca\u4e49');
    distractors = shuffle(cache.defs.filter(function(x) { return x !== correctAnswer; })).slice(0, 3);
  } else {
    questionText = p.def;
    correctAnswer = p.word;
    hintText = t('Choose the correct English word', '\u9009\u62e9\u6b63\u786e\u7684\u82f1\u6587\u5355\u8bcd');
    distractors = shuffle(cache.words.filter(function(x) { return x !== correctAnswer; })).slice(0, 3);
  }
  var options = shuffle([correctAnswer].concat(distractors));

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + Q.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + progress + '%"></div></div>';
  html += '<div class="study-count">' + (Q.idx + 1) + ' / ' + Q.pairs.length + '</div>';
  html += '</div>';

  /* Direction bar */
  html += '<div class="quiz-dir-bar">';
  html += '<button class="quiz-dir-btn' + (Q.dir === 'en2zh' ? ' active' : '') + '" onclick="setQuizDir(\'en2zh\')">EN \u2192 ' + t('CN', '\u4e2d') + '</button>';
  html += '<button class="quiz-dir-btn' + (Q.dir === 'zh2en' ? ' active' : '') + '" onclick="setQuizDir(\'zh2en\')">' + t('CN', '\u4e2d') + ' \u2192 EN</button>';
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="quiz-word">' + escapeHtml(questionText) + '</div>';
  html += '<div class="quiz-hint">' + hintText + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="quiz-options">';
  options.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-idx="' + i + '" data-correct="' + (opt === correctAnswer ? '1' : '0') + '" onclick="pickQuizOpt(this)">' + escapeHtml(opt) + '</button>';
  });
  html += '</div>';

  E('panel-quiz').innerHTML = html;
  Q.locked = false;
}

function pickQuizOpt(btn) {
  if (Q.locked) return;
  Q.locked = true;

  var isCorrect = btn.dataset.correct === '1';
  var p = Q.pairs[Q.idx];
  var key = wordKey(Q.lvl, p.lid);

  if (isCorrect) {
    btn.classList.add('correct');
    Q.correct++;
    recordAnswer(key, 'quiz', true);
    playCorrect();
  } else {
    btn.classList.add('wrong');
    recordAnswer(key, 'quiz', false);
    playWrong();
    /* Highlight correct answer */
    document.querySelectorAll('#quiz-options .quiz-opt').forEach(function(o) {
      if (o.dataset.correct === '1') o.classList.add('correct');
    });
  }

  setTimeout(function() {
    Q.idx++;
    renderQuizCard();
  }, 900);
}

function finishQuiz() {
  var total = Q.pairs.length;
  var raw = resultScreenHTML(Q.correct, total,
    'startQuiz(' + currentLvl + ')',
    'openDeck(' + currentLvl + ')', 'quiz');
  var step = nextStepHTML('\ud83e\udde0', t('Review to consolidate', '\u590d\u4e60\u5de9\u56fa\u8bb0\u5fc6'), 'startReview(' + currentLvl + ')');
  var html = '<div class="text-center">';
  html += raw.replace('<div class="result-actions">', step + '<div class="result-actions">');
  html += '</div>';
  E('panel-quiz').innerHTML = html;
  updateSidebar();
}

/* ══════════════════════════════════════════════════════════════
   DAILY CHALLENGE — 10-word timed quiz (60s)
   ══════════════════════════════════════════════════════════════ */

var DC = { words: [], idx: 0, score: 0, locked: false, timer: null, remaining: 60, startTime: 0 };

function getDailySeed() {
  var d = new Date().toLocaleDateString('en-CA');
  var h = 0;
  for (var i = 0; i < d.length; i++) { h = ((h << 5) - h + d.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededShuffle(arr, seed) {
  var a = arr.slice();
  var s = seed;
  for (var i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff; /* LCG */
    var j = s % (i + 1);
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function getDailyData() {
  var s = loadS();
  if (!s.daily) return null;
  var today = new Date().toLocaleDateString('en-CA');
  return s.daily.date === today ? s.daily : null;
}

function saveDailyResult(score, time) {
  var s = loadS();
  var today = new Date().toLocaleDateString('en-CA');
  var prev = (s.daily && s.daily.date === today) ? s.daily : null;
  s.daily = {
    date: today,
    score: prev ? Math.max(prev.score, score) : score,
    time: prev ? (score > prev.score ? time : (score === prev.score ? Math.min(prev.time, time) : prev.time)) : time,
    plays: prev ? prev.plays + 1 : 1
  };
  writeS(s);
  syncToCloud();
}

function startDaily() {
  var all = getAllWords();
  if (all.length < 10) {
    showToast(t('Need at least 10 words', '至少需要 10 个词汇'));
    return;
  }

  var seed = getDailySeed();
  var picked = seededShuffle(all, seed).slice(0, 10);

  DC.words = picked;
  DC.idx = 0;
  DC.score = 0;
  DC.locked = false;
  DC.remaining = 60;
  DC.startTime = Date.now();

  showPanel('daily');
  renderDailyCard();
  startDailyTimer();
}

function startDailyTimer() {
  clearInterval(DC.timer);
  DC.timer = setInterval(function() {
    DC.remaining = Math.max(0, 60 - Math.floor((Date.now() - DC.startTime) / 1000));
    var bar = document.getElementById('dc-timebar');
    var timeEl = document.getElementById('dc-time');
    if (bar) bar.style.width = (DC.remaining / 60 * 100) + '%';
    if (timeEl) timeEl.textContent = DC.remaining + 's';
    if (DC.remaining <= 0) { clearInterval(DC.timer); finishDaily(); }
  }, 250);
}

function renderDailyCard() {
  if (DC.idx >= DC.words.length) { finishDaily(); return; }

  var w = DC.words[DC.idx];
  var seed = getDailySeed();
  /* Deterministic direction per question: seed XOR question index */
  var dirSeed = (seed * 31 + DC.idx * 7) & 0x7fffffff;
  var dir = (dirSeed % 2 === 0) ? 'en2zh' : 'zh2en';

  var questionText, correctAnswer, hintText;
  var cache = getQuizCache();
  var distractors;

  if (dir === 'en2zh') {
    questionText = w.word;
    correctAnswer = w.def;
    hintText = t('Choose the correct definition', '选择正确的中文释义');
    distractors = shuffle(cache.defs.filter(function(x) { return x !== correctAnswer; })).slice(0, 3);
  } else {
    questionText = w.def;
    correctAnswer = w.word;
    hintText = t('Choose the correct English word', '选择正确的英文单词');
    distractors = shuffle(cache.words.filter(function(x) { return x !== correctAnswer; })).slice(0, 3);
  }
  var options = shuffle([correctAnswer].concat(distractors));

  var html = '';

  /* HUD: timer + score + progress */
  html += '<div class="dc-hud">';
  html += '<button class="back-btn" onclick="endDailyEarly()">\u2190</button>';
  html += '<div class="dc-timebar-wrap"><div class="dc-timebar" id="dc-timebar" style="width:' + (DC.remaining / 60 * 100) + '%"></div></div>';
  html += '<span class="dc-time" id="dc-time">' + DC.remaining + 's</span>';
  html += '<span class="dc-score">' + DC.score + '/' + DC.words.length + '</span>';
  html += '</div>';

  /* Progress dots */
  html += '<div class="dc-progress">';
  for (var i = 0; i < DC.words.length; i++) {
    var cls = i < DC.idx ? 'done' : (i === DC.idx ? 'cur' : '');
    html += '<span class="dc-dot ' + cls + '"></span>';
  }
  html += '</div>';

  /* Question */
  html += '<div class="quiz-question">';
  html += '<div class="quiz-word">' + escapeHtml(questionText) + '</div>';
  html += '<div class="quiz-hint">' + hintText + '</div>';
  html += '</div>';

  /* Options */
  html += '<div class="quiz-options" id="dc-options">';
  options.forEach(function(opt, i) {
    html += '<button class="quiz-opt" data-correct="' + (opt === correctAnswer ? '1' : '0') + '" onclick="pickDailyOpt(this)">' + escapeHtml(opt) + '</button>';
  });
  html += '</div>';

  E('panel-daily').innerHTML = html;
  DC.locked = false;
}

function pickDailyOpt(btn) {
  if (DC.locked) return;
  DC.locked = true;

  var isCorrect = btn.dataset.correct === '1';
  var w = DC.words[DC.idx];

  if (isCorrect) {
    btn.classList.add('correct');
    DC.score++;
    recordAnswer(w.key, 'daily', true);
    playCorrect();
  } else {
    btn.classList.add('wrong');
    recordAnswer(w.key, 'daily', false);
    playWrong();
    document.querySelectorAll('#dc-options .quiz-opt').forEach(function(o) {
      if (o.dataset.correct === '1') o.classList.add('correct');
    });
  }

  setTimeout(function() {
    DC.idx++;
    renderDailyCard();
  }, 700);
}

function endDailyEarly() {
  clearInterval(DC.timer);
  finishDaily();
}

function finishDaily() {
  clearInterval(DC.timer);
  var elapsed = Math.min(60, Math.floor((Date.now() - DC.startTime) / 1000));
  saveDailyResult(DC.score, elapsed);

  var data = getDailyData();
  var pct = Math.round(DC.score / DC.words.length * 100);
  var emoji, title;
  if (pct >= 90) { emoji = '\ud83c\udfc6'; title = t('Excellent!', '太棒了！'); }
  else if (pct >= 70) { emoji = '\ud83c\udf89'; title = t('Well done!', '做得好！'); }
  else if (pct >= 50) { emoji = '\ud83d\udcaa'; title = t('Keep going!', '继续加油！'); }
  else { emoji = '\ud83d\udcda'; title = t('Try again!', '再练练！'); }

  _lastShareOpts = {
    mode: 'daily', score: DC.score, total: DC.words.length, emoji: emoji,
    time: elapsed, date: new Date().toLocaleDateString('en-CA'),
    streak: getStreakCount()
  };

  var html = '<div class="text-center" style="padding-top:48px">';
  html += '<div class="result-emoji">' + emoji + '</div>';
  html += '<div class="result-title">' + title + '</div>';
  html += '<div class="result-score">' + DC.score + ' / ' + DC.words.length + '</div>';
  html += '<div class="result-detail">' + t('Time: ' + elapsed + 's', '用时：' + elapsed + ' 秒') + '</div>';
  if (data && data.plays > 1) {
    html += '<div class="result-detail" style="margin-top:8px;color:var(--c-streak)">';
    html += t('Best: ' + data.score + '/' + DC.words.length + ' in ' + data.time + 's', '最佳：' + data.score + '/' + DC.words.length + '，' + data.time + ' 秒');
    html += '</div>';
  }
  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="startDaily()">' + t('Try Again', '再来一次') + '</button>';
  html += '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>';
  html += '<button class="btn btn-ghost" onclick="navTo(\'home\')">' + t('Home', '返回首页') + '</button>';
  html += '</div>';
  html += '</div>';

  E('panel-daily').innerHTML = html;
}

/* ══════════════════════════════════════════════════════════════
   SHARE RESULT CARD — Canvas 2D branded card + Web Share API
   ══════════════════════════════════════════════════════════════ */

function drawShareCard(opts) {
  var W = 400, H = 560, S = 2; /* 2x retina */
  var c = document.createElement('canvas');
  c.width = W * S; c.height = H * S;
  var ctx = c.getContext('2d');
  ctx.scale(S, S);

  /* Background gradient */
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#5248C9');
  grad.addColorStop(1, '#3D35A0');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(20, 0); ctx.lineTo(W - 20, 0);
  ctx.quadraticCurveTo(W, 0, W, 20);
  ctx.lineTo(W, H - 20); ctx.quadraticCurveTo(W, H, W - 20, H);
  ctx.lineTo(20, H); ctx.quadraticCurveTo(0, H, 0, H - 20);
  ctx.lineTo(0, 20); ctx.quadraticCurveTo(0, 0, 20, 0);
  ctx.closePath(); ctx.fill();

  /* Subtle pattern overlay */
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (var i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(W * 0.8, H * 0.2, 60 + i * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Brand name */
  ctx.fillStyle = '#fff';
  ctx.font = '600 20px "Bricolage Grotesque", "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('25Maths Keywords', W / 2, 48);

  /* Mode pill */
  var modeLabels = {
    daily: t('\u26a1 Daily Challenge', '\u26a1 \u6bcf\u65e5\u6311\u6218'),
    quiz: t('\ud83d\udcdd Quiz', '\ud83d\udcdd \u6d4b\u9a8c'),
    spell: t('\u2328\ufe0f Spelling', '\u2328\ufe0f \u62fc\u5199'),
    match: t('\ud83d\udd17 Match', '\ud83d\udd17 \u914d\u5bf9')
  };
  var modeText = modeLabels[opts.mode] || opts.mode;
  ctx.font = '600 13px "DM Sans", sans-serif';
  var pillW = ctx.measureText(modeText).width + 24;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, (W - pillW) / 2, 60, pillW, 26, 13);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(modeText, W / 2, 78);

  /* Result emoji */
  ctx.font = '64px serif';
  ctx.fillText(opts.emoji || '\ud83c\udfc6', W / 2, 160);

  /* Score */
  ctx.fillStyle = '#fff';
  ctx.font = '700 52px "Bricolage Grotesque", "DM Sans", sans-serif';
  ctx.fillText(opts.score + ' / ' + opts.total, W / 2, 228);

  /* Time (if present) */
  var yAfterScore = 260;
  if (opts.time !== undefined) {
    ctx.font = '400 18px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(opts.time + 's', W / 2, yAfterScore);
    yAfterScore += 16;
  }

  /* Divider */
  var divY = yAfterScore + 16;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY); ctx.stroke();

  /* Streak + Rank row */
  var rowY = divY + 36;
  var streak = opts.streak || getStreakCount();
  var r = getRank();
  var rn = rankName(r);

  ctx.font = '600 15px "DM Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#fff';
  var leftText = '\ud83d\udd25 ' + streak + t('-day', '\u5929');
  var rightText = r.emoji + ' ' + rn;
  ctx.textAlign = 'center';
  ctx.fillText(leftText + '   \u2502   ' + rightText, W / 2, rowY);

  /* Second divider */
  var div2Y = rowY + 22;
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.moveTo(40, div2Y); ctx.lineTo(W - 40, div2Y); ctx.stroke();

  /* Date */
  var dateStr = opts.date || new Date().toLocaleDateString('en-CA');
  ctx.font = '400 14px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, W / 2, div2Y + 32);

  /* URL */
  ctx.font = '600 13px "DM Sans", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('keywords.25maths.com', W / 2, div2Y + 56);

  /* Username */
  var displayName = getDisplayName();
  ctx.font = '700 22px "Bricolage Grotesque", "DM Sans", "Noto Sans SC", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(displayName, W / 2, div2Y + 96);

  return c;
}

/* Helper: rounded rect path */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shareResult(opts) {
  if (!opts) opts = _lastShareOpts;
  if (!opts) return;

  document.fonts.ready.then(function() {
    var canvas = drawShareCard(opts);
    canvas.toBlob(function(blob) {
      if (!blob) return;
      var file = new File([blob], '25maths-result.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: '25Maths Keywords',
          text: t('My result on 25Maths Keywords!', '\u6211\u5728 25Maths Keywords \u7684\u6210\u7ee9\uff01')
        }).catch(function() {});
      } else {
        /* Desktop fallback: download PNG */
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '25maths-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
        showToast(t('Image saved!', '\u56fe\u7247\u5df2\u4fdd\u5b58\uff01'));
      }
    }, 'image/png');
  });
}
