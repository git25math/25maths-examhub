/* ══════════════════════════════════════════════════════════════
   match.js — Simple pair matching mode (no timer pressure)
   ══════════════════════════════════════════════════════════════ */

var MT = { pairs: [], leftItems: [], rightItems: [], selected: null, matched: 0, errors: 0, lvl: 0, startTime: 0 };

function startMatch(li) {
  var lv = LEVELS[li];
  if (validate(lv, li)) return;

  currentLvl = li;
  var allPairs = getPairs(lv.vocabulary);
  /* Limit to 8 pairs max */
  MT.pairs = shuffle(allPairs).slice(0, 8);
  MT.leftItems = shuffle(MT.pairs.map(function(p) { return { lid: p.lid, text: p.word, matched: false }; }));
  MT.rightItems = shuffle(MT.pairs.map(function(p) { return { lid: p.lid, text: p.def, matched: false }; }));
  MT.selected = null;
  MT.matched = 0;
  MT.errors = 0;
  MT.lvl = li;
  MT.startTime = Date.now();

  showPanel('match');
  renderMatchBoard();
}

function renderMatchBoard() {
  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + MT.lvl + ')">\u2190</button>';
  html += '<div class="study-progress"><div class="study-progress-fill" style="width:' + Math.round(MT.matched / MT.pairs.length * 100) + '%"></div></div>';
  html += '<div class="study-count">' + MT.matched + ' / ' + MT.pairs.length + '</div>';
  html += '</div>';

  html += '<div style="text-align:center;margin-bottom:16px;font-size:13px;color:var(--c-text2)">' + t('Click English on left, then Chinese on right to match', '\u70b9\u51fb\u5de6\u5217\u82f1\u6587\uff0c\u518d\u70b9\u51fb\u53f3\u5217\u4e2d\u6587\u8fdb\u884c\u914d\u5bf9') + '</div>';

  /* Match area */
  html += '<div class="match-area">';

  /* Left column (English) */
  html += '<div class="match-col" id="match-left">';
  MT.leftItems.forEach(function(item, i) {
    var cls = 'match-item';
    if (item.matched) cls += ' matched';
    if (MT.selected && MT.selected.side === 'left' && MT.selected.idx === i) cls += ' selected';
    html += '<button class="' + cls + '" data-side="left" data-idx="' + i + '" data-lid="' + item.lid + '" onclick="pickMatch(this)">' + escapeHtml(item.text) + '</button>';
  });
  html += '</div>';

  /* Right column (Chinese) */
  html += '<div class="match-col" id="match-right">';
  MT.rightItems.forEach(function(item, i) {
    var cls = 'match-item';
    if (item.matched) cls += ' matched';
    if (MT.selected && MT.selected.side === 'right' && MT.selected.idx === i) cls += ' selected';
    html += '<button class="' + cls + '" data-side="right" data-idx="' + i + '" data-lid="' + item.lid + '" onclick="pickMatch(this)">' + escapeHtml(item.text) + '</button>';
  });
  html += '</div>';

  html += '</div>';

  /* Timer */
  var elapsed = Math.round((Date.now() - MT.startTime) / 1000);
  html += '<div class="match-timer">\u2139\ufe0f ' + t('Time: ', '\u5df2\u7528\u65f6: ') + elapsed + 's | ' + t('Errors: ', '\u9519\u8bef: ') + MT.errors + '</div>';

  E('panel-match').innerHTML = html;
}

function pickMatch(btn) {
  var side = btn.dataset.side;
  var idx = parseInt(btn.dataset.idx);
  var lid = btn.dataset.lid;

  /* If clicking a matched item, ignore */
  if (side === 'left' && MT.leftItems[idx].matched) return;
  if (side === 'right' && MT.rightItems[idx].matched) return;

  if (!MT.selected) {
    /* First selection */
    MT.selected = { side: side, idx: idx, lid: lid };
    renderMatchBoard();
    return;
  }

  /* Same side: change selection */
  if (MT.selected.side === side) {
    MT.selected = { side: side, idx: idx, lid: lid };
    renderMatchBoard();
    return;
  }

  /* Different side: check match */
  var leftLid, rightLid, leftIdx, rightIdx;
  if (MT.selected.side === 'left') {
    leftLid = MT.selected.lid; leftIdx = MT.selected.idx;
    rightLid = lid; rightIdx = idx;
  } else {
    leftLid = lid; leftIdx = idx;
    rightLid = MT.selected.lid; rightIdx = MT.selected.idx;
  }

  if (leftLid === rightLid) {
    /* Match! */
    MT.leftItems[leftIdx].matched = true;
    MT.rightItems[rightIdx].matched = true;
    MT.matched++;
    MT.selected = null;
    playCorrect();

    /* Update word status */
    var key = wordKey(MT.lvl, leftLid);
    setWordStatus(key, 'learning', 2, true);

    if (MT.matched === MT.pairs.length) {
      renderMatchBoard();
      setTimeout(finishMatch, 500);
      return;
    }
  } else {
    /* Mismatch */
    MT.errors++;
    MT.selected = null;
    playWrong();

    /* Flash wrong effect */
    renderMatchBoard();
    var items = document.querySelectorAll('.match-item:not(.matched)');
    items.forEach(function(el) {
      if ((el.dataset.side === 'left' && parseInt(el.dataset.idx) === leftIdx) ||
          (el.dataset.side === 'right' && parseInt(el.dataset.idx) === rightIdx)) {
        el.classList.add('wrong-flash');
      }
    });
    setTimeout(function() { renderMatchBoard(); }, 500);
    return;
  }

  renderMatchBoard();
}

function finishMatch() {
  var elapsed = Math.round((Date.now() - MT.startTime) / 1000);
  var total = MT.pairs.length;
  var ok = total - MT.errors;
  if (ok < 0) ok = 0;

  var matchEmoji = MT.errors === 0 ? '\ud83c\udfc6' : MT.errors <= 2 ? '\ud83c\udf89' : '\ud83d\udcaa';
  _lastShareOpts = {
    mode: 'match', score: ok, total: total, emoji: matchEmoji, time: elapsed
  };

  var html = '<div class="text-center">';
  html += '<div class="result-emoji">' + matchEmoji + '</div>';
  html += '<div class="result-title">' + t('Match Complete!', '\u914d\u5bf9\u5b8c\u6210\uff01') + '</div>';
  html += '<div class="result-sub">' + t('Time ' + elapsed + 's \xb7 Errors ' + MT.errors, '\u7528\u65f6 ' + elapsed + ' \u79d2 \xb7 \u9519\u8bef ' + MT.errors + ' \u6b21') + '</div>';
  html += '<div class="result-actions">';
  html += '<button class="btn btn-primary" onclick="startMatch(' + currentLvl + ')">\ud83d\udd01 ' + t('Try again', '\u518d\u6765\u4e00\u6b21') + '</button>';
  html += '<button class="btn btn-share" onclick="shareResult(_lastShareOpts)">\ud83d\udce4 ' + t('Share', '\u5206\u4eab') + '</button>';
  html += '<button class="btn btn-ghost" onclick="openDeck(' + currentLvl + ')">\u2190 ' + t('Back', '\u8fd4\u56de\u5361\u7ec4') + '</button>';
  html += '</div>';
  html += '</div>';

  E('panel-match').innerHTML = html;
  updateSidebar();
}
