/* ══════════════════════════════════════════════════════════════
   study.js — Study mode (flashcard flip + self-rating)
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

  hideAll();
  E('study-area').classList.add('active');
  E('user-bar').classList.add('vis');
  E('st-badge').textContent = subset ? '复习不熟的' : '学习模式';
  E('st-title').textContent = 'Stage ' + (li + 1) + ': ' + lv.title;
  showSFC();
}

/* Show current study flashcard */
function showSFC() {
  if (S.idx >= S.pairs.length) { finishStudy(); return; }

  var p = S.pairs[S.idx];
  E('fc-word').textContent = p.word;
  E('fc-def').textContent = p.def;
  E('fc-word2').textContent = p.word;
  E('st-prog').textContent = (S.idx + 1) + ' / ' + S.pairs.length;
  E('st-pbar').style.width = (S.idx / S.pairs.length * 100) + '%';
  E('fc-box').classList.remove('flipped');
  E('fc-actions').classList.add('hidden');
}

/* Flip card to reveal answer */
E('fc-box').addEventListener('click', function() {
  if (!E('fc-box').classList.contains('flipped')) {
    E('fc-box').classList.add('flipped');
    E('fc-actions').classList.remove('hidden');
  }
});

/* Rating buttons (hard / ok / easy) */
document.querySelectorAll('#fc-actions .fc-rb').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var r = btn.dataset.rate;
    var p = S.pairs[S.idx];
    var key = 'L' + S.lvl + '_W' + p.lid;

    S.ratings[r].push(p);

    if (r === 'easy') {
      setWordStatus(key, 'mastered', 30);
      var rc = btn.getBoundingClientRect();
      spawnP(rc.left + rc.width / 2, rc.top, 8);
    } else if (r === 'ok') {
      setWordStatus(key, 'learning', 1);
    } else {
      setWordStatus(key, 'learning', 0.15);
    }

    S.idx++;
    showSFC();
  });
});

/* Finish study session */
function finishStudy() {
  E('study-area').classList.remove('active');

  var h = S.ratings.hard.length;
  var o = S.ratings.ok.length;
  var e = S.ratings.easy.length;

  E('se-hard').textContent = h;
  E('se-ok').textContent = o;
  E('se-easy').textContent = e;
  E('se-sub').textContent = h === 0 && o === 0 ? '全部掌握！' : '有' + (h + o) + '个需要巩固';

  E('se-battle').onclick = function() { startBattle(currentLvl); };

  var hw = S.ratings.hard.concat(S.ratings.ok);
  if (hw.length > 0) {
    E('se-restudy').style.display = 'inline-block';
    E('se-restudy').onclick = function() { startStudy(currentLvl, hw); };
  } else {
    E('se-restudy').style.display = 'none';
  }

  updateUserBar();
  showOv('ov-study-end');
}
