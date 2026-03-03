/* ══════════════════════════════════════════════════════════════
   review.js — Review mode (spaced repetition flashcards)
   ══════════════════════════════════════════════════════════════ */

var R = { words: [], idx: 0, ratings: {} };

/* Start review for a level */
function startReview(li) {
  var due = getDueWords().filter(function(w) { return w.level === li; });

  /* If no due words, review all words in the level */
  if (due.length === 0) {
    var lv = LEVELS[li];
    var allP = getPairs(lv.vocabulary);
    due = allP.map(function(p) {
      return { key: 'L' + li + '_W' + p.lid, word: p.word, def: p.def, level: li, status: 'new' };
    });
  }

  R.words = shuffle(due);
  R.idx = 0;
  R.ratings = { hard: [], ok: [], easy: [] };

  hideAll();
  E('review-area').classList.add('active');
  E('user-bar').classList.add('vis');
  E('rv-title').textContent = 'Stage ' + (li + 1) + ' 复习';
  showRFC();
}

/* Show current review flashcard */
function showRFC() {
  if (R.idx >= R.words.length) { finishReview(); return; }

  var w = R.words[R.idx];
  E('rv-fc-word').textContent = w.word;
  E('rv-fc-def').textContent = w.def;
  E('rv-fc-word2').textContent = w.word;
  E('rv-prog').textContent = (R.idx + 1) + ' / ' + R.words.length;
  E('rv-pbar').style.width = (R.idx / R.words.length * 100) + '%';
  E('rv-fc-box').classList.remove('flipped');
  E('rv-fc-actions').classList.add('hidden');
}

/* Flip card */
E('rv-fc-box').addEventListener('click', function() {
  if (!E('rv-fc-box').classList.contains('flipped')) {
    E('rv-fc-box').classList.add('flipped');
    E('rv-fc-actions').classList.remove('hidden');
  }
});

/* Rating buttons */
document.querySelectorAll('#rv-fc-actions .fc-rb').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var r = btn.dataset.rate;
    var w = R.words[R.idx];
    R.ratings[r].push(w);

    var wd = getWordData()[w.key];
    var iv = wd ? wd.iv : 1;

    if (r === 'easy') {
      setWordStatus(w.key, 'mastered', Math.max(iv * 2.5, 7));
      var rc = btn.getBoundingClientRect();
      spawnP(rc.left + rc.width / 2, rc.top, 8);
    } else if (r === 'ok') {
      setWordStatus(w.key, 'learning', Math.max(iv * 1.2, 1));
    } else {
      setWordStatus(w.key, 'learning', 0.15);
    }

    R.idx++;
    showRFC();
  });
});

/* Finish review session */
function finishReview() {
  E('review-area').classList.remove('active');
  E('re-hard').textContent = R.ratings.hard.length;
  E('re-ok').textContent = R.ratings.ok.length;
  E('re-easy').textContent = R.ratings.easy.length;
  E('re-sub').textContent = R.ratings.hard.length === 0 ? '太棒了！进步明显' : '继续加油，明天再来复习';
  updateUserBar();
  showOv('ov-review-end');
}
