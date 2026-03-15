/**
 * knowledge-node.js — Knowledge Node Learning Panel
 * Version: 1.0.0 (MVP)
 *
 * Depends on:
 *   - learning-graph.js  → getKPQuestions(kpId, board), getQuestionKPs(sectionId, board)
 *   - practice.js        → startPPScanByIds(ids), renderMath(), pqSanitize()
 *   - storage.js         → saveKPResult() / FLM state reads
 *
 * Entry points:
 *   openKnowledgeNode(kpId, board, context)   ← called from practice.js wrong-answer flow
 *   closeKnowledgeNode()                       ← internal + ESC key
 *
 * Flow:
 *   Wrong Answer → "📖 Learn This" button → openKnowledgeNode()
 *   → 6-stage panel (Motivation → Concept → Pattern → Method → Example → Practice)
 *   → "🎯 Practice Now" → startKNTargetPractice(kpId, board)
 *   → 3–5 targeted questions → FLM update → return
 */

// ─── State ────────────────────────────────────────────────────────────────────

var _knState = {
  kpId:    null,
  board:   null,
  kpData:  null,
  stage:   0,          // 0–5
  context: null        // { questionId, sectionId, mistakeType } from practice.js
};

var KN_STAGES = [
  { id: 'motivation', icon: '🎯', label: '为什么要学',  labelEn: 'Why Learn This' },
  { id: 'concept',    icon: '🧠', label: '核心概念',    labelEn: 'Core Concept'   },
  { id: 'pattern',    icon: '🔍', label: '识别题型',    labelEn: 'Pattern'        },
  { id: 'method',     icon: '📐', label: '解题步骤',    labelEn: 'Method'         },
  { id: 'example',    icon: '✏️', label: '典型例题',    labelEn: 'Worked Example' },
  { id: 'practice',   icon: '🏋️', label: '练习',        labelEn: 'Practice'       }
];

// ─── Entry Point ──────────────────────────────────────────────────────────────

/**
 * openKnowledgeNode
 * @param {string} kpId     e.g. "kp-3.5-03"
 * @param {string} board    "cie" | "edx" | "hhk"
 * @param {object} context  { questionId, sectionId, mistakeType }  (optional)
 */
function openKnowledgeNode(kpId, board, context) {
  var kpData = _knFindKP(kpId, board);
  if (!kpData) {
    console.warn('[KN] KP not found:', kpId, board);
    return;
  }

  _knState.kpId    = kpId;
  _knState.board   = board;
  _knState.kpData  = kpData;
  _knState.stage   = 0;
  _knState.context = context || null;

  _knRenderPanel();
  _knBindEvents();
}

function closeKnowledgeNode() {
  var panel = document.getElementById('panel-knowledge-node');
  if (panel) {
    panel.classList.add('kn-exit');
    setTimeout(function() { panel.remove(); }, 280);
  }
  _knState = { kpId: null, board: null, kpData: null, stage: 0, context: null };
}

// ─── Data Lookup ──────────────────────────────────────────────────────────────

function _knFindKP(kpId, board) {
  if (typeof _kpData === 'undefined' || !_kpData[board]) return null;
  return _kpData[board].find(function(kp) { return kp.id === kpId; }) || null;
}

// ─── Panel Render ─────────────────────────────────────────────────────────────

function _knRenderPanel() {
  var existing = document.getElementById('panel-knowledge-node');
  if (existing) existing.remove();

  var kp      = _knState.kpData;
  var lang    = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  var title   = lang === 'zh' ? (kp.title_zh || kp.title) : kp.title;

  var panel = document.createElement('div');
  panel.id = 'panel-knowledge-node';
  panel.className = 'kn-panel';
  panel.innerHTML = _knPanelHTML(title, kp);
  document.body.appendChild(panel);

  // Trigger entrance animation
  requestAnimationFrame(function() { panel.classList.add('kn-visible'); });

  _knRenderStage(_knState.stage);
}

function _knPanelHTML(title, kp) {
  var progressDots = KN_STAGES.map(function(s, i) {
    return '<span class="kn-dot" data-stage="' + i + '" title="' + s.label + '"></span>';
  }).join('');

  return (
    '<div class="kn-overlay" onclick="closeKnowledgeNode()"></div>' +
    '<div class="kn-sheet">' +

      // ── Header
      '<div class="kn-header">' +
        '<div class="kn-header-left">' +
          '<span class="kn-badge">📖 ' + ((typeof currentLang !== 'undefined' && currentLang === 'zh') ? '知识点' : 'Knowledge Point') + '</span>' +
          '<h2 class="kn-title">' + pqSanitize(title) +
            (typeof favStarHtml === 'function' ? favStarHtml('kp', kp.id, _knState.board, kp.section || '', { title: kp.title, title_zh: kp.title_zh || '' }) : '') +
          '</h2>' +
          '<span class="kn-kp-id">' + pqSanitize(kp.id) + '</span>' +
        '</div>' +
        '<button class="kn-close-btn" onclick="closeKnowledgeNode()" aria-label="Close">✕</button>' +
      '</div>' +

      // ── Progress Bar
      '<div class="kn-progress">' +
        '<div class="kn-dots">' + progressDots + '</div>' +
        '<div class="kn-stage-label" id="kn-stage-label"></div>' +
      '</div>' +

      // ── Stage Nav (tab pills)
      '<div class="kn-tabs" id="kn-tabs">' +
        KN_STAGES.map(function(s, i) {
          return '<button class="kn-tab" data-stage="' + i + '" onclick="_knGoStage(' + i + ')">' +
            s.icon + ' ' + s.label +
          '</button>';
        }).join('') +
      '</div>' +

      // ── Content Area
      '<div class="kn-content" id="kn-content"></div>' +

      // ── Footer Nav
      '<div class="kn-footer">' +
        '<button class="kn-btn-sec" id="kn-btn-prev" onclick="_knPrev()">← ' + (lang === 'zh' ? '上一步' : 'Previous') + '</button>' +
        '<div class="kn-footer-center" id="kn-footer-center"></div>' +
        '<button class="kn-btn-pri" id="kn-btn-next" onclick="_knNext()">' + (lang === 'zh' ? '下一步' : 'Next') + ' →</button>' +
      '</div>' +

    '</div>'
  );
}

// ─── Stage Navigation ─────────────────────────────────────────────────────────

function _knGoStage(n) {
  if (n < 0 || n >= KN_STAGES.length) return;
  _knState.stage = n;
  _knRenderStage(n);
}

function _knNext() {
  if (_knState.stage < KN_STAGES.length - 1) {
    _knGoStage(_knState.stage + 1);
  } else {
    _knStartPractice();
  }
}

function _knPrev() {
  if (_knState.stage > 0) _knGoStage(_knState.stage - 1);
}

function _knRenderStage(n) {
  var kp   = _knState.kpData;
  var lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

  // Update dots & tabs
  document.querySelectorAll('.kn-dot').forEach(function(d, i) {
    d.classList.toggle('kn-dot-active',    i === n);
    d.classList.toggle('kn-dot-complete',  i < n);
  });
  document.querySelectorAll('.kn-tab').forEach(function(t, i) {
    t.classList.toggle('kn-tab-active', i === n);
  });

  // Stage label
  var stageLabel = document.getElementById('kn-stage-label');
  if (stageLabel) {
    stageLabel.textContent = (n + 1) + ' / ' + KN_STAGES.length + '  ' + KN_STAGES[n].icon + ' ' + KN_STAGES[n].label;
  }

  // Footer buttons
  var prevBtn = document.getElementById('kn-btn-prev');
  var nextBtn = document.getElementById('kn-btn-next');
  var footerCenter = document.getElementById('kn-footer-center');
  if (prevBtn) prevBtn.style.visibility = (n === 0) ? 'hidden' : 'visible';
  if (nextBtn) {
    var _isLast = (n === KN_STAGES.length - 1);
    nextBtn.textContent = _isLast ? (lang === 'zh' ? '🎯 开始练习' : '🎯 Start Practice') : (lang === 'zh' ? '下一步 →' : 'Next →');
    nextBtn.className   = _isLast ? 'kn-btn-practice' : 'kn-btn-pri';
  }
  if (footerCenter) {
    footerCenter.textContent = (n + 1) + ' of ' + KN_STAGES.length;
  }

  // Render content
  var content = document.getElementById('kn-content');
  if (!content) return;

  var html = '';
  try {
    switch (n) {
      case 0: html = _knStageMotivation(kp, lang); break;
      case 1: html = _knStageConcept(kp, lang);    break;
      case 2: html = _knStagePattern(kp, lang);    break;
      case 3: html = _knStageMethod(kp, lang);     break;
      case 4: html = _knStageExample(kp, lang);    break;
      case 5: html = _knStagePractice(kp, lang);   break;
    }
  } catch (e) {
    console.error('[KN] Stage ' + n + ' render error:', e);
    html = '<div class="kn-stage"><p style="color:#c00">Stage render error: ' + (e.message || e) + '</p></div>';
  }
  content.innerHTML = html;

  // Re-render math
  if (typeof renderMath === 'function') renderMath(content);

  // Scroll to top
  content.scrollTop = 0;
}

// ─── Stage 0: Motivation ──────────────────────────────────────────────────────

function _knStageMotivation(kp, lang) {
  var ctx     = _knState.context;
  var title   = lang === 'zh' ? (kp.title_zh || kp.title) : kp.title;
  var expText = kp.explanation ? (lang === 'zh' ? (kp.explanation.zh || kp.explanation.en) : kp.explanation.en) : '';

  var ctxBanner = '';
  if (ctx && ctx.mistakeType) {
    ctxBanner = (
      '<div class="kn-ctx-banner">' +
        '<span class="kn-ctx-icon">⚠️</span>' +
        '<div>' +
          '<p class="kn-ctx-label">' + (lang === 'zh' ? '你刚才的题目涉及这个知识点' : 'Your last question relates to this topic') + '</p>' +
          '<p class="kn-ctx-mistake">' + (lang === 'zh' ? '错误类型：' : 'Error type: ') + pqSanitize(ctx.mistakeType) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  /* Prerequisites warning (v5.30.0) */
  var prereqWarn = '';
  if (kp.prerequisites && kp.prerequisites.length > 0) {
    var _unmastered = [];
    for (var _pi = 0; _pi < kp.prerequisites.length; _pi++) {
      var _prId = kp.prerequisites[_pi];
      var _prFs = typeof getKPFLM === 'function' ? getKPFLM(_prId) : 'new';
      if (_prFs !== 'mastered') {
        var _prKP = _knFindKP(_prId, _knState.board);
        _unmastered.push({ id: _prId, title: _prKP ? (_prKP.title_zh || _prKP.title) : _prId });
      }
    }
    if (_unmastered.length > 0) {
      var _prLinks = _unmastered.map(function(pr) {
        return '<span class="kn-prereq-warn-link" onclick="closeKnowledgeNode();setTimeout(function(){openKnowledgeNode(\'' + pr.id + '\',\'' + _knState.board + '\')},300)">' + pqSanitize(pr.title) + '</span>';
      }).join(lang === 'zh' ? '、' : ', ');
      prereqWarn = '<div class="kn-prereq-warn">' +
        '<span class="kn-prereq-warn-icon">💡</span>' +
        '<div class="kn-prereq-warn-text">' + (lang === 'zh' ? '建议先看看前置知识，会更容易理解：' : 'It helps to review these first: ') + _prLinks + '</div>' +
      '</div>';
    }
  }

  var patternCount = (kp.examPatterns || []).length;
  var exampleCount = (kp.examples || []).length;

  /* Extract a short intro: use quickSummary if available, else first sentence */
  var introText = '';
  if (kp.quickSummary) {
    introText = lang === 'zh' ? (kp.quickSummary.zh || kp.quickSummary.en) : kp.quickSummary.en;
  } else {
    /* Split by sentence-ending punctuation (. or 。) to get first sentence */
    var sentenceEnd = lang === 'zh' ? /[。！？]/ : /[.!?]/;
    var firstSentence = expText.split(sentenceEnd)[0];
    introText = firstSentence + (lang === 'zh' ? '。' : '.');
  }

  /* Difficulty label */
  var diffLabel = '';
  if (kp.difficulty) {
    var _dMap = { 1: [lang === 'zh' ? '基础' : 'Foundation', 'kn-diff-easy'], 2: [lang === 'zh' ? '标准' : 'Standard', 'kn-diff-mid'], 3: [lang === 'zh' ? '拓展' : 'Extended', 'kn-diff-hard'] };
    var _dd = _dMap[kp.difficulty] || _dMap[2];
    diffLabel = _dd[0];
  }

  return (
    '<div class="kn-stage kn-stage-motivation">' +
      prereqWarn +
      ctxBanner +
      '<div class="kn-intro-block">' +
        '<h3 class="kn-intro-title">' + (lang === 'zh' ? '这个知识点是什么？' : 'What is this about?') + '</h3>' +
        '<p class="kn-intro-text">' + pqSanitize(introText) + '</p>' +
      '</div>' +
      '<div class="kn-stat-row">' +
        '<div class="kn-stat-card">' +
          '<span class="kn-stat-num">' + patternCount + '</span>' +
          '<span class="kn-stat-lbl">' + (lang === 'zh' ? '题型' : 'Patterns') + '</span>' +
        '</div>' +
        '<div class="kn-stat-card">' +
          '<span class="kn-stat-num">' + exampleCount + '</span>' +
          '<span class="kn-stat-lbl">' + (lang === 'zh' ? '例题' : 'Examples') + '</span>' +
        '</div>' +
        '<div class="kn-stat-card">' +
          '<span class="kn-stat-num kn-tier">' + (diffLabel || kp.tier || '—') + '</span>' +
          '<span class="kn-stat-lbl">' + (lang === 'zh' ? '难度层级' : 'Level') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="kn-roadmap">' +
        '<p class="kn-roadmap-label">📍 ' + (lang === 'zh' ? '本节学习路径' : 'Your Learning Path') + '</p>' +
        '<div class="kn-roadmap-steps">' +
          KN_STAGES.map(function(s, i) {
            return '<div class="kn-roadmap-step">' +
              '<span class="kn-roadmap-icon">' + s.icon + '</span>' +
              '<span class="kn-roadmap-name">' + (lang === 'zh' ? s.label : s.labelEn) + '</span>' +
            '</div>';
          }).join('<span class="kn-roadmap-arrow">→</span>') +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

// ─── Stage 1: Concept ─────────────────────────────────────────────────────────

function _knStageConcept(kp, lang) {
  var exp = kp.explanation || {};
  var en  = exp.en || '';
  var zh  = exp.zh || '';
  var show = (lang === 'zh' && zh) ? zh : en;

  // solutionMethod is new optional field we're adding to JSON
  var method = kp.solutionMethod || null;
  var methodHtml = '';
  if (method) {
    var mText = (lang === 'zh' && method.zh) ? method.zh : (method.en || '');
    methodHtml = (
      '<div class="kn-method-block">' +
        '<p class="kn-block-label">' + (lang === 'zh' ? '💡 直觉理解' : '💡 INTUITION') + '</p>' +
        '<p class="kn-method-text">' + pqSanitize(mText) + '</p>' +
      '</div>'
    );
  }

  /* TL;DR card from quickSummary (v5.30.0) */
  var tldr = '';
  if (kp.quickSummary) {
    var _qsTxt = (lang === 'zh' && kp.quickSummary.zh) ? kp.quickSummary.zh : (kp.quickSummary.en || '');
    if (_qsTxt) {
      tldr = '<div class="kn-tldr"><div class="kn-tldr-label">💡 TL;DR</div><div class="kn-tldr-text">' + pqSanitize(_qsTxt) + '</div></div>';
    }
  }

  return (
    '<div class="kn-stage kn-stage-concept">' +
      tldr +
      '<div class="kn-exp-block">' +
        '<p class="kn-block-label">' + (lang === 'zh' ? '📖 概念说明' : '📖 EXPLANATION') + '</p>' +
        '<div class="kn-exp-text">' + pqSanitize(show) + '</div>' +
      '</div>' +
      (en && zh && lang === 'en'
        ? '<div class="kn-lang-toggle"><span>中文说明：</span><span class="kn-exp-zh">' + pqSanitize(zh) + '</span></div>'
        : '') +
      methodHtml +
    '</div>'
  );
}

// ─── Stage 2: Pattern Recognition ────────────────────────────────────────────

function _knStagePattern(kp, lang) {
  var patterns = kp.examPatterns || [];
  if (!patterns.length) {
    return '<div class="kn-stage"><p class="kn-empty">' + (lang === 'zh' ? '暂无题型数据。' : 'No pattern data yet.') + '</p></div>';
  }

  var cards = patterns.map(function(ep, i) {
    var label = (lang === 'zh' && ep.label_zh) ? ep.label_zh : ep.label;
    var desc  = (lang === 'zh' && ep.description_zh) ? ep.description_zh : (ep.description || '');
    return (
      '<div class="kn-pattern-card">' +
        '<div class="kn-pattern-header">' +
          '<span class="kn-pattern-num">' + (i + 1) + '</span>' +
          '<span class="kn-pattern-label">' + pqSanitize(label) + '</span>' +
          '<span class="kn-pattern-id">' + pqSanitize(ep.id) + '</span>' +
        '</div>' +
        (desc ? '<p class="kn-pattern-desc">' + pqSanitize(desc) + '</p>' : '') +
      '</div>'
    );
  }).join('');

  return (
    '<div class="kn-stage kn-stage-pattern">' +
      '<p class="kn-stage-intro">' + (lang === 'zh' ? '看到这些题型信号 → 就用这个知识点 👇' : 'When you spot these patterns → use this knowledge point 👇') + '</p>' +
      '<div class="kn-pattern-list">' + cards + '</div>' +
    '</div>'
  );
}

// ─── Stage 3: Method ─────────────────────────────────────────────────────────

function _knStageMethod(kp, lang) {
  // solutionMethod: { en: "Step 1:...\nStep 2:...", zh: "..." }  — new optional field
  var method = kp.solutionMethod || null;

  if (!method) {
    // Graceful fallback: derive steps from examPatterns
    var patterns = kp.examPatterns || [];
    var fallback = patterns.map(function(ep, i) {
      var label = (lang === 'zh' && ep.label_zh) ? ep.label_zh : ep.label;
      return '<div class="kn-step"><span class="kn-step-num">0' + (i+1) + '</span><span class="kn-step-text">' + pqSanitize(label) + '</span></div>';
    }).join('');
    return (
      '<div class="kn-stage kn-stage-method">' +
        '<p class="kn-stage-intro">' + (lang === 'zh' ? '按照以下题型逐步思考：' : 'Think through these patterns step by step:') + '</p>' +
        '<div class="kn-steps">' + fallback + '</div>' +
        '<p class="kn-method-note">💡 ' + (lang === 'zh' ? '详细解题方法将在例题阶段展示。' : 'Detailed methods will be shown in the worked examples.') + '</p>' +
      '</div>'
    );
  }

  var text = (lang === 'zh' && method.zh) ? method.zh : method.en;
  // Parse "Step N: ..." lines
  var lines  = text.split('\n').filter(function(l) { return l.trim(); });
  var stepsHtml = lines.map(function(line, i) {
    var match = line.match(/^Step\s*(\d+)[:\s]+(.*)/i) || line.match(/^第(\S+)步[：:](.*)/);
    if (match) {
      return '<div class="kn-step"><span class="kn-step-num">0' + match[1] + '</span><span class="kn-step-text">' + pqSanitize(match[2]) + '</span></div>';
    }
    return '<div class="kn-step"><span class="kn-step-num">' + (i+1) + '</span><span class="kn-step-text">' + pqSanitize(line) + '</span></div>';
  }).join('');

  /* Key formulas reference (v5.30.0) */
  var formulasHtml = '';
  if (kp.keyFormulas && kp.keyFormulas.length > 0) {
    var fCards = kp.keyFormulas.map(function(kf) {
      var fLabel = (lang === 'zh' && kf.label_zh) ? kf.label_zh : kf.label;
      return '<div class="kp-formula-card"><div class="kp-formula-label">' + pqSanitize(fLabel) + '</div><div class="kp-formula-expr math-content">' + pqSanitize(kf.formula) + '</div></div>';
    }).join('');
    formulasHtml = '<div style="margin-top:16px"><p class="kn-block-label">' + (lang === 'zh' ? '📝 核心公式速查' : '📝 KEY FORMULAS') + '</p><div class="kp-formulas-grid">' + fCards + '</div></div>';
  }

  return (
    '<div class="kn-stage kn-stage-method">' +
      '<p class="kn-stage-intro">' + (lang === 'zh' ? '📋 标准解题流程 — 每次做题按这个顺序走：' : '📋 Standard approach — follow these steps every time:') + '</p>' +
      '<div class="kn-steps">' + stepsHtml + '</div>' +
      formulasHtml +
    '</div>'
  );
}

// ─── Stage 4: Worked Example ──────────────────────────────────────────────────

function _knStageExample(kp, lang) {
  var examples = kp.examples || [];
  if (!examples.length) {
    return '<div class="kn-stage"><p class="kn-empty">' + (lang === 'zh' ? '暂无例题。' : 'No examples yet.') + '</p></div>';
  }

  // Show first 2 examples
  var shown = examples.slice(0, 2);
  var cards = shown.map(function(ex, i) {
    var q  = (lang === 'zh' && ex.question_zh) ? ex.question_zh : ex.question;
    var s  = (lang === 'zh' && ex.solution_zh) ? ex.solution_zh : ex.solution;
    var src = ex.source ? '<span class="kn-ex-src">' + pqSanitize(ex.source) + '</span>' : '';

    return (
      '<div class="kn-example-card">' +
        '<div class="kn-example-header">' +
          '<span class="kn-example-num">' + (lang === 'zh' ? '例题' : 'Example') + ' ' + (i+1) + '</span>' +
          src +
        '</div>' +
        '<div class="kn-example-q">' +
          '<p class="kn-block-label">' + (lang === 'zh' ? '题目' : 'QUESTION') + '</p>' +
          '<div class="kn-q-text math-content">' + pqSanitize(q) + '</div>' +
        '</div>' +
        '<details class="kn-solution-details">' +
          '<summary class="kn-solution-toggle">👁 ' + (lang === 'zh' ? '查看解答' : 'Show Solution') + '</summary>' +
          '<div class="kn-solution-body math-content">' + pqSanitize(s) + '</div>' +
        '</details>' +
      '</div>'
    );
  }).join('');

  // Common mistakes — new optional field
  var mistakes = kp.commonMistakes || [];
  var mistakesHtml = '';
  if (mistakes.length) {
    var mItems = mistakes.map(function(m) {
      var mistake    = (lang === 'zh' && m.mistake_zh)    ? m.mistake_zh    : m.mistake;
      var correction = (lang === 'zh' && m.correction_zh) ? m.correction_zh : m.correction;
      return (
        '<div class="kn-mistake-item">' +
          '<div class="kn-mistake-wrong">❌ ' + pqSanitize(mistake) + '</div>' +
          '<div class="kn-mistake-fix">✅ ' + pqSanitize(correction) + '</div>' +
        '</div>'
      );
    }).join('');
    mistakesHtml = (
      '<div class="kn-mistakes-block">' +
        '<p class="kn-block-label">' + (lang === 'zh' ? '⚠️ 常见错误' : '⚠️ COMMON MISTAKES') + '</p>' +
        mItems +
      '</div>'
    );
  }

  return (
    '<div class="kn-stage kn-stage-example">' +
      cards +
      mistakesHtml +
    '</div>'
  );
}

// ─── Stage 5: Practice Entry ──────────────────────────────────────────────────

function _knStagePractice(kp, lang) {
  var qList = (typeof getKPQuestions === 'function')
    ? getKPQuestions(kp.id, _knState.board)
    : [];
  var count = Math.min(qList.length, 5);


  // testYourself MCQs as a quick warm-up
  var selfCheck = kp.testYourself || [];
  var mcqHtml = '';
  if (selfCheck.length) {
    var firstMCQ = selfCheck[0];
    var q  = (lang === 'zh' && firstMCQ.q_zh) ? firstMCQ.q_zh : firstMCQ.q;
    var opts = (firstMCQ.o || []).map(function(opt, i) {
      return '<button class="kn-mcq-opt" onclick="_knCheckMCQ(this,' + firstMCQ.a + ',' + i + ')">' + pqSanitize(opt) + '</button>';
    }).join('');
    mcqHtml = (
      '<div class="kn-mcq-block">' +
        '<p class="kn-block-label">' + (lang === 'zh' ? '🧪 先测测自己' : '🧪 QUICK CHECK') + '</p>' +
        '<p class="kn-mcq-q math-content">' + pqSanitize(q) + '</p>' +
        '<div class="kn-mcq-opts">' + opts + '</div>' +
        '<div class="kn-mcq-feedback" id="kn-mcq-feedback"></div>' +
      '</div>'
    );
  }

  return (
    '<div class="kn-stage kn-stage-practice">' +
      mcqHtml +
      '<div class="kn-practice-cta">' +
        '<div class="kn-practice-info">' +
          '<span class="kn-practice-count">' + count + (lang === 'zh' ? ' 道定向练习题' : ' targeted questions') + '</span>' +
          '<span class="kn-practice-sub">' + (lang === 'zh' ? '针对「' + pqSanitize(kp.title) + '」精选' : 'Selected for "' + pqSanitize(kp.title) + '"') + '</span>' +
        '</div>' +
        '<button class="kn-btn-practice-lg" onclick="_knStartPractice()">' +
          (lang === 'zh' ? '🎯 开始练习' : '🎯 Start Practice') +
        '</button>' +
      '</div>' +
    '</div>'
  );
}

// ─── MCQ Quick Check ─────────────────────────────────────────────────────────

function _knCheckMCQ(btn, correctIdx, chosenIdx) {
  var opts = btn.closest('.kn-mcq-opts').querySelectorAll('.kn-mcq-opt');
  opts.forEach(function(b, i) {
    b.disabled = true;
    if (i === correctIdx) b.classList.add('kn-mcq-correct');
    if (i === chosenIdx && i !== correctIdx) b.classList.add('kn-mcq-wrong');
  });
  var fb = document.getElementById('kn-mcq-feedback');
  if (fb) {
    var _isZh = (typeof currentLang !== 'undefined') ? currentLang === 'zh' : true;
    fb.textContent = (chosenIdx === correctIdx)
      ? (_isZh ? '✅ 正确！继续练习吧。' : '✅ Correct! Keep going.')
      : (_isZh ? '❌ 没关系，看看解析再试试。' : '❌ Not quite — review and try again.');
    fb.className = 'kn-mcq-feedback ' + (chosenIdx === correctIdx ? 'kn-fb-ok' : 'kn-fb-err');
  }
}

// ─── Target Practice Launch ───────────────────────────────────────────────────

function _knStartPractice() {
  var kpId  = _knState.kpId;
  var board = _knState.board;
  var kp    = _knState.kpData;

  closeKnowledgeNode();

  if (typeof loadPastPaperData !== 'function' || typeof getKPQuestions !== 'function') {
    if (typeof showToast === 'function') showToast(typeof t === 'function' ? t('No practice questions yet', '暂无该知识点的练习题') : 'No practice questions yet');
    return;
  }

  // Ensure PP data is loaded BEFORE filtering question IDs
  loadPastPaperData(board).then(function() {
    var allQs = getKPQuestions(kpId, board);
    var ppIds = [];
    for (var i = 0; i < allQs.length; i++) {
      if (allQs[i].type === 'pp') ppIds.push(allQs[i].id);
    }

    if (ppIds.length > 0 && typeof startPPScanByIds === 'function') {
      startPPScanByIds(ppIds.slice(0, 5), board, true);
    } else if (kp && kp.section && typeof startPPScan === 'function') {
      startPPScan(kp.section, board);
    } else {
      if (typeof showToast === 'function') showToast(typeof t === 'function' ? t('No practice questions yet', '暂无该知识点的练习题') : 'No practice questions yet');
    }
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

function _knBindEvents() {
  // ESC to close
  document.addEventListener('keydown', _knHandleKey);
}

function _knHandleKey(e) {
  if (e.key === 'Escape') {
    closeKnowledgeNode();
    document.removeEventListener('keydown', _knHandleKey);
  }
  if (e.key === 'ArrowRight') _knNext();
  if (e.key === 'ArrowLeft')  _knPrev();
}

// ─── CSS (inject once) ────────────────────────────────────────────────────────

(function _knInjectStyles() {
  if (document.getElementById('kn-styles')) return;
  var s = document.createElement('style');
  s.id = 'kn-styles';
  s.textContent = `
/* ── Knowledge Node Panel ── */
#panel-knowledge-node { position:fixed; inset:0; z-index:9900; display:flex; align-items:flex-end; }
.kn-overlay { position:absolute; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(3px); }
.kn-sheet {
  position:relative; z-index:1; width:100%; max-width:780px; margin:0 auto;
  max-height:92vh; display:flex; flex-direction:column;
  background:#fff; border-radius:20px 20px 0 0;
  box-shadow:0 -8px 40px rgba(0,0,0,.18);
  transform:translateY(100%); transition:transform .28s cubic-bezier(.4,0,.2,1);
}
.kn-panel.kn-visible .kn-sheet { transform:translateY(0); }
.kn-panel.kn-exit    .kn-sheet { transform:translateY(100%); }

/* Header */
.kn-header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 20px 12px; border-bottom:1px solid #f0f0f0; }
.kn-badge { font-size:11px; font-weight:700; letter-spacing:.04em; color:#6C63FF; background:#EEF0FF; padding:3px 8px; border-radius:20px; display:inline-block; margin-bottom:6px; }
.kn-title { font-size:18px; font-weight:700; color:#111; margin:0 0 2px; }
.kn-kp-id { font-size:11px; color:#aaa; }
.kn-close-btn { background:none; border:none; font-size:18px; color:#aaa; cursor:pointer; padding:4px 8px; border-radius:8px; transition:background .15s; }
.kn-close-btn:hover { background:#f5f5f5; color:#333; }

/* Progress */
.kn-progress { display:flex; align-items:center; gap:12px; padding:10px 20px; }
.kn-dots { display:flex; gap:6px; }
.kn-dot { width:8px; height:8px; border-radius:50%; background:#e0e0e0; cursor:pointer; transition:all .2s; }
.kn-dot-complete { background:#6C63FF; opacity:.4; }
.kn-dot-active   { background:#6C63FF; transform:scale(1.4); }
.kn-stage-label { font-size:12px; color:#888; font-weight:500; }

/* Tabs */
.kn-tabs { display:flex; gap:6px; padding:0 16px 8px; overflow-x:auto; scrollbar-width:none; }
.kn-tabs::-webkit-scrollbar { display:none; }
.kn-tab { flex-shrink:0; font-size:12px; padding:5px 12px; border-radius:20px; border:1.5px solid #e8e8e8; background:#fff; color:#666; cursor:pointer; transition:all .15s; white-space:nowrap; }
.kn-tab-active { border-color:#6C63FF; color:#6C63FF; background:#F0F0FF; font-weight:600; }

/* Content */
.kn-content { flex:1; overflow-y:auto; padding:16px 20px; }

/* Footer */
.kn-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid #f0f0f0; gap:8px; }
.kn-footer-center { font-size:12px; color:#bbb; }
.kn-btn-sec { padding:10px 18px; border:1.5px solid #ddd; border-radius:10px; background:#fff; color:#555; font-size:14px; cursor:pointer; transition:all .15s; }
.kn-btn-sec:hover { border-color:#aaa; color:#222; }
.kn-btn-pri { padding:10px 22px; border:none; border-radius:10px; background:#6C63FF; color:#fff; font-size:14px; font-weight:600; cursor:pointer; transition:all .15s; }
.kn-btn-pri:hover { background:#574FDF; }
.kn-btn-practice { padding:10px 22px; border:none; border-radius:10px; background:#E8405A; color:#fff; font-size:14px; font-weight:700; cursor:pointer; animation:kn-pulse 1.8s ease-in-out infinite; }
@keyframes kn-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,64,90,.4)} 50%{box-shadow:0 0 0 8px rgba(232,64,90,0)} }

/* Stage shared */
.kn-stage { display:flex; flex-direction:column; gap:16px; }
.kn-stage-intro { font-size:14px; color:#555; margin:0; }
.kn-block-label { font-size:11px; font-weight:700; letter-spacing:.06em; color:#888; text-transform:uppercase; margin:0 0 6px; }
.kn-empty { color:#bbb; font-style:italic; text-align:center; padding:40px 0; }

/* Motivation */
.kn-ctx-banner { background:#FFF3CD; border:1px solid #FFD96A; border-radius:12px; padding:12px 16px; display:flex; gap:12px; align-items:flex-start; }
.kn-ctx-icon { font-size:20px; }
.kn-ctx-label { font-size:12px; color:#856404; font-weight:600; margin:0 0 2px; }
.kn-ctx-mistake { font-size:13px; color:#333; margin:0; }
.kn-intro-block { background:#F8F8FF; border-left:4px solid #6C63FF; border-radius:8px; padding:14px 16px; }
.kn-intro-title { font-size:15px; font-weight:700; color:#111; margin:0 0 6px; }
.kn-intro-text { font-size:14px; color:#444; margin:0; }
.kn-stat-row { display:flex; gap:12px; }
.kn-stat-card { flex:1; background:#f9f9f9; border-radius:12px; padding:14px; text-align:center; }
.kn-stat-num { display:block; font-size:26px; font-weight:800; color:#6C63FF; }
.kn-stat-lbl { font-size:12px; color:#888; }
.kn-tier { font-size:16px !important; text-transform:capitalize; }
.kn-roadmap { background:#f5f5f5; border-radius:12px; padding:14px 16px; }
.kn-roadmap-label { font-size:12px; color:#888; margin:0 0 10px; font-weight:600; }
.kn-roadmap-steps { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.kn-roadmap-step { display:flex; flex-direction:column; align-items:center; gap:2px; }
.kn-roadmap-icon { font-size:18px; }
.kn-roadmap-name { font-size:10px; color:#666; }
.kn-roadmap-arrow { color:#ccc; font-size:14px; }

/* Concept */
.kn-exp-block { background:#f9f9f9; border-radius:12px; padding:14px 16px; }
.kn-exp-text  { font-size:14px; color:#333; line-height:1.7; }
.kn-method-block { background:#EEF9F7; border-left:4px solid #00B4A2; border-radius:8px; padding:14px 16px; }
.kn-method-text { font-size:14px; color:#333; line-height:1.7; margin:0; }
.kn-lang-toggle { font-size:13px; color:#aaa; }
.kn-exp-zh { color:#777; }

/* Pattern */
.kn-pattern-list { display:flex; flex-direction:column; gap:10px; }
.kn-pattern-card { border:1.5px solid #eee; border-radius:12px; padding:14px 16px; transition:border-color .15s; }
.kn-pattern-card:hover { border-color:#6C63FF; }
.kn-pattern-header { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
.kn-pattern-num { width:24px; height:24px; border-radius:50%; background:#6C63FF; color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.kn-pattern-label { font-size:14px; font-weight:600; color:#222; flex:1; }
.kn-pattern-id { font-size:10px; color:#ccc; }
.kn-pattern-desc { font-size:13px; color:#555; margin:0; }

/* Method */
.kn-steps { display:flex; flex-direction:column; gap:10px; }
.kn-step { display:flex; gap:14px; align-items:flex-start; background:#f9f9f9; border-radius:10px; padding:12px 14px; }
.kn-step-num { font-size:13px; font-weight:800; color:#6C63FF; flex-shrink:0; font-family:monospace; }
.kn-step-text { font-size:14px; color:#333; line-height:1.6; }
.kn-method-note { font-size:13px; color:#888; font-style:italic; margin:0; }

/* Example */
.kn-example-card { border:1.5px solid #eee; border-radius:14px; overflow:hidden; }
.kn-example-header { display:flex; justify-content:space-between; align-items:center; background:#f5f5f5; padding:10px 14px; }
.kn-example-num { font-size:13px; font-weight:700; color:#555; }
.kn-ex-src { font-size:11px; color:#aaa; }
.kn-example-q { padding:14px; }
.kn-q-text { font-size:14px; color:#222; line-height:1.7; }
.kn-solution-details { border-top:1px solid #f0f0f0; }
.kn-solution-toggle { list-style:none; padding:10px 14px; font-size:13px; color:#6C63FF; cursor:pointer; font-weight:600; }
.kn-solution-toggle::-webkit-details-marker { display:none; }
.kn-solution-body { padding:12px 14px; font-size:13px; color:#333; line-height:1.7; background:#FAFAFA; }
.kn-mistakes-block { background:#FFF5F5; border:1.5px solid #FFD5D5; border-radius:12px; padding:14px 16px; }
.kn-mistake-item { margin-bottom:12px; }
.kn-mistake-item:last-child { margin-bottom:0; }
.kn-mistake-wrong { font-size:13px; color:#C0392B; margin-bottom:4px; }
.kn-mistake-fix   { font-size:13px; color:#27AE60; }

/* Practice */
.kn-mcq-block { background:#F8F8FF; border-radius:14px; padding:16px; }
.kn-mcq-q { font-size:14px; color:#222; margin:0 0 12px; line-height:1.6; }
.kn-mcq-opts { display:flex; flex-direction:column; gap:8px; }
.kn-mcq-opt { text-align:left; padding:10px 14px; border:1.5px solid #ddd; border-radius:9px; background:#fff; font-size:13px; color:#333; cursor:pointer; transition:all .15s; }
.kn-mcq-opt:hover:not(:disabled) { border-color:#6C63FF; color:#6C63FF; }
.kn-mcq-opt:disabled { cursor:default; }
.kn-mcq-correct { border-color:#27AE60 !important; background:#EAFAF1 !important; color:#1E8449 !important; }
.kn-mcq-wrong   { border-color:#E74C3C !important; background:#FDEDEC !important; color:#C0392B !important; }
.kn-mcq-feedback { margin-top:10px; font-size:13px; font-weight:600; padding:8px 12px; border-radius:8px; }
.kn-fb-ok  { background:#EAFAF1; color:#1E8449; }
.kn-fb-err { background:#FDEDEC; color:#C0392B; }
.kn-practice-cta { border:2px dashed #E8405A; border-radius:16px; padding:24px; display:flex; justify-content:space-between; align-items:center; gap:16px; }
.kn-practice-count { display:block; font-size:22px; font-weight:800; color:#E8405A; }
.kn-practice-sub { display:block; font-size:12px; color:#888; margin-top:2px; }
.kn-btn-practice-lg { padding:14px 28px; border:none; border-radius:14px; background:#E8405A; color:#fff; font-size:16px; font-weight:700; cursor:pointer; white-space:nowrap; transition:all .15s; }
.kn-btn-practice-lg:hover { background:#C0392B; transform:scale(1.02); }
`;
  document.head.appendChild(s);
})();
