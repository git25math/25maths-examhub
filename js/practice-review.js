/* ══════════════════════════════════════════════════════════════
   practice-review.js — Super-admin question review (lazy-loaded)
   Depends on: practice.js (global vars + core functions)
   ══════════════════════════════════════════════════════════════ */

/* ═══ SUPERADMIN REVIEW ALL ═══ */

function startPracticeReview(li) {
  var lv = LEVELS[li];
  if (!lv) return Promise.resolve();
  var board = lv.board;
  if (board !== 'cie' && board !== 'edx') return Promise.resolve();

  currentLvl = li;
  showToast(t('Loading questions...', '加载题目中...'));

  return Promise.all([loadPracticeData(board), loadKaTeX()]).then(function() {
    var questions = (_pqData[board] || []).filter(function(q) { return q.cat === lv.category; });
    if (questions.length === 0) {
      showToast(t('No practice questions available for this topic', '该主题暂无练习题'));
      return;
    }
    _pqReviewState = { li: li, questions: questions, board: board };
    _pqReviewFilter = 'all';
    _pqReviewTopicFilter = 'all';
    showPanel('practice');
    renderPracticeReview();

    /* Event delegation moved to renderPracticeReview() */
  }).catch(function() {
    showToast(t('Failed to load questions', '加载题目失败'));
  });
}

function renderPracticeReview() {
  if (!_pqReviewState) return;
  var st = _pqReviewState;
  var li = st.li;
  var questions = st.questions;
  var lv = LEVELS[li];
  var catInfo = getCategoryInfo(lv.category);
  var labels = ['A', 'B', 'C', 'D'];

  /* Difficulty counts (from all questions, unaffected by topic) */
  var coreCount = questions.filter(function(q) { return q.d === 1; }).length;
  var extCount = questions.filter(function(q) { return q.d === 2; }).length;

  /* Cascading filter: difficulty first */
  var afterDiff = _pqReviewFilter === 'all' ? questions : questions.filter(function(q) {
    return q.d === _pqReviewFilter;
  });

  /* Extract unique topics + counts from afterDiff */
  var topicMap = {};
  afterDiff.forEach(function(q) {
    var tp = q.topic || '';
    if (!topicMap[tp]) topicMap[tp] = 0;
    topicMap[tp]++;
  });
  var topicList = Object.keys(topicMap).sort();

  /* Then apply topic filter */
  var filtered = _pqReviewTopicFilter === 'all' ? afterDiff : afterDiff.filter(function(q) {
    return (q.topic || '') === _pqReviewTopicFilter;
  });

  var html = '';

  /* Top bar */
  html += '<div class="study-topbar">';
  html += '<button class="back-btn" onclick="openDeck(' + li + ')">←</button>';
  html += '<div class="deck-title" style="flex:1;font-size:16px;margin:0 12px">' + catInfo.emoji + ' ' + lvTitle(lv) + '</div>';
  html += '<div class="pq-qid" style="font-size:13px;color:var(--c-muted);white-space:nowrap">' + t('Total', '共') + ' ' + filtered.length + ' ' + t('questions', '题') + '</div>';
  html += '</div>';

  /* Difficulty filter bar */
  html += '<div class="pq-review-filter">';
  html += '<button class="sort-btn' + (_pqReviewFilter === 'all' ? ' active' : '') + '" data-pq-filter="all">All (' + questions.length + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 1 ? ' active' : '') + '" data-pq-filter="1">Core (' + coreCount + ')</button>';
  html += '<button class="sort-btn' + (_pqReviewFilter === 2 ? ' active' : '') + '" data-pq-filter="2">Extended (' + extCount + ')</button>';
  html += '</div>';

  /* Topic filter bar */
  if (topicList.length > 1) {
    html += '<div class="pq-review-filter">';
    html += '<button class="sort-btn' + (_pqReviewTopicFilter === 'all' ? ' active' : '') + '" data-pq-topic="all">' + t('All Topics', '全部专题') + ' (' + afterDiff.length + ')</button>';
    topicList.forEach(function(tp) {
      var active = _pqReviewTopicFilter === tp ? ' active' : '';
      html += '<button class="sort-btn' + active + '" data-pq-topic="' + escapeHtml(tp) + '">' + escapeHtml(tp) + ' (' + topicMap[tp] + ')</button>';
    });
    html += '</div>';
  }

  /* Review list */
  html += '<div class="pq-review-list">';
  filtered.forEach(function(q, i) {
    html += '<div class="pq-review-card">';

    /* Header: num + qid + topic + difficulty + edit btn */
    html += '<div class="pq-meta mb-8">';
    html += '<span style="font-weight:700;color:var(--c-text);min-width:28px">' + (i + 1) + '.</span>';
    html += '<span class="pq-qid" style="font-size:11px;color:var(--c-muted)">#' + escapeHtml(q.id) + '</span>';
    if (q.topic) html += '<span class="pq-topic">' + escapeHtml(q.topic) + '</span>';
    html += '<span class="pq-difficulty pq-d' + q.d + '">' + (q.d === 1 ? t('Core', '基础') : t('Extended', '拓展')) + '</span>';
    html += '<button class="pq-review-edit pq-edit-btn" style="margin-left:auto" data-qid="' + escapeHtml(q.id) + '">✏️</button>';
    html += '</div>';

    /* Question */
    html += '<div class="pq-question mb-8">' + pqRender(q.q) + '</div>';

    /* Options */
    html += '<div class="pq-review-opts">';
    q.o.forEach(function(opt, oi) {
      var cls = oi === q.a ? ' is-correct' : '';
      html += '<div class="pq-review-opt' + cls + '">' + labels[oi] + ') ' + pqRender(opt) + (oi === q.a ? ' ✓' : '') + '</div>';
    });
    html += '</div>';

    /* Explanation */
    if (q.e) {
      html += '<div class="pq-review-exp">' + pqRender(q.e) + '</div>';
    }

    html += '</div>'; /* end card */
  });
  html += '</div>'; /* end list */

  E('panel-practice').innerHTML = html;

  /* Delegated clicks for edit/filter/topic buttons (bind once) */
  if (!_pqReviewDelegated) {
    _pqReviewDelegated = true;
    E('panel-practice').addEventListener('click', function(e) {
      /* Edit button */
      var btn = e.target.closest('.pq-review-edit');
      if (btn && _pqReviewState) {
        var qid = btn.dataset.qid;
        var st = _pqReviewState;
        var q = _pqFindQ(qid, st.board);
        if (!q) return;
        var scrollY = window.scrollY;
        _lazyCall('practice-editor', '_openEditor', [q, st.board, function() {
          startPracticeReview(st.li).then(function() { window.scrollTo(0, scrollY); });
        }]);
        return;
      }
      /* Filter buttons */
      var fb = e.target.closest('[data-pq-filter]');
      if (fb) {
        setPqReviewFilter(fb.dataset.pqFilter === 'all' ? 'all' : Number(fb.dataset.pqFilter));
        return;
      }
      /* Topic buttons */
      var tb = e.target.closest('[data-pq-topic]');
      if (tb) { setPqReviewTopic(tb.dataset.pqTopic); }
    });
  }

  renderMath(E('panel-practice'));
}

function setPqReviewFilter(f) {
  _pqReviewFilter = f;
  _pqReviewTopicFilter = 'all';
  renderPracticeReview();
}

function setPqReviewTopic(t) {
  _pqReviewTopicFilter = t;
  renderPracticeReview();
}

/* Helper: find question by qid from cache */
function _pqFindQ(qid, board) {
  var data = _pqData[board];
  if (!data) return null;
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === qid) return data[i];
  }
  return null;
}
