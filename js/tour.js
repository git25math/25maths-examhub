/* ══════════════════════════════════════════════════════════════
   tour.js — Onboarding tour system (lazy-loaded)
   ══════════════════════════════════════════════════════════════ */

var TOUR_STEPS = [
  { sel: '.hero-card',
    title: function() { return t('Welcome!', '\u6b22\u8fce\uff01'); },
    desc: function() { return t('This is your learning hub \u2014 continue where you left off or start a daily challenge.', '\u8fd9\u662f\u4f60\u7684\u5b66\u4e60\u4e2d\u5fc3\u2014\u2014\u7ee7\u7eed\u4e0a\u6b21\u7684\u8fdb\u5ea6\u6216\u5f00\u542f\u6bcf\u65e5\u6311\u6218\u3002'); } },
  { sel: '.quick-stats',
    title: function() { return t('Your Progress', '\u4f60\u7684\u5b66\u4e60\u8fdb\u5ea6'); },
    desc: function() { return t('Track your streak, word count, mastery rate and rank at a glance.', '\u4e00\u76ee\u4e86\u7136\u5730\u67e5\u770b\u8fde\u7eed\u5929\u6570\u3001\u8bcd\u6c47\u91cf\u3001\u638c\u63e1\u7387\u548c\u6bb5\u4f4d\u3002'); } },
  { sel: '.deck-row',
    title: function() { return t('Pick a Topic', '\u9009\u62e9\u4e00\u4e2a\u4e3b\u9898'); },
    desc: function() { return t('Tap any topic to start learning vocabulary.', '\u70b9\u51fb\u4efb\u610f\u4e3b\u9898\u5f00\u59cb\u5b66\u4e60\u8bcd\u6c47\u3002'); } },
  { sel: function() { return appBP === 'desktop' ? '#sidebar-nav' : '#bottom-nav'; },
    title: function() { return t('Navigation', '\u5bfc\u822a\u680f'); },
    desc: function() { return t('Switch between Home, Today\'s Plan, Mistake Book, Learning Items and Stats.', '\u5728\u9996\u9875\u3001\u4eca\u65e5\u8ba1\u5212\u3001\u9519\u9898\u672c\u3001\u5b66\u4e60\u9879\u76ee\u548c\u7edf\u8ba1\u4e4b\u95f4\u5207\u6362\u3002'); } },
  { sel: '.hero-rank',
    title: function() { return t('Rank Up!', '\u6bb5\u4f4d\u664b\u5347'); },
    desc: function() { return t('Master vocab, past papers & knowledge points to climb from Bronze to Math Champion!', '\u638c\u63e1\u8bcd\u6c47\u3001\u771f\u9898\u548c\u77e5\u8bc6\u70b9\uff0c\u4ece\u9752\u94dc\u5347\u7ea7\u5230\u6570\u5b66\u738b\u8005\uff01'); } }
];

var _tourStep = 0;
var _tourOverlay = null;

function maybeStartTour() {
  try { if (localStorage.getItem('wmatch_tour_done')) return; } catch (e) { return; }
  _tourStep = 0;
  showTourStep();
}

function showTourStep() {
  /* Clean up previous overlay */
  if (_tourOverlay) { _tourOverlay.remove(); _tourOverlay = null; }

  /* Skip missing elements */
  while (_tourStep < TOUR_STEPS.length) {
    var step = TOUR_STEPS[_tourStep];
    var sel = typeof step.sel === 'function' ? step.sel() : step.sel;
    if (document.querySelector(sel)) break;
    _tourStep++;
  }
  if (_tourStep >= TOUR_STEPS.length) { endTour(); return; }

  var step = TOUR_STEPS[_tourStep];
  var sel = typeof step.sel === 'function' ? step.sel() : step.sel;
  var target = document.querySelector(sel);
  var rect = target.getBoundingClientRect();

  /* Create overlay */
  var ov = document.createElement('div');
  ov.className = 'tour-overlay';
  ov.onclick = function(e) { if (e.target === ov) endTour(); };

  /* Spotlight */
  var sp = document.createElement('div');
  sp.className = 'tour-spotlight';
  sp.style.left = (rect.left - 6) + 'px';
  sp.style.top = (rect.top - 6) + 'px';
  sp.style.width = (rect.width + 12) + 'px';
  sp.style.height = (rect.height + 12) + 'px';
  ov.appendChild(sp);

  /* Tooltip */
  var tip = document.createElement('div');
  tip.className = 'tour-tooltip';
  var isLast = _tourStep === TOUR_STEPS.length - 1;
  var dots = '';
  for (var i = 0; i < TOUR_STEPS.length; i++) {
    dots += '<span class="tour-dot' + (i === _tourStep ? ' active' : '') + '"></span>';
  }
  tip.innerHTML =
    '<div class="tour-title">' + step.title() + '</div>' +
    '<div class="tour-desc">' + step.desc() + '</div>' +
    '<div class="tour-footer">' +
      '<div class="tour-dots">' + dots + '</div>' +
      '<div>' +
        '<button class="tour-skip" onclick="endTour()">' + t('Skip', '\u8df3\u8fc7') + '</button>' +
        '<button class="tour-next" onclick="nextTourStep()">' + (isLast ? t('Done', '\u5b8c\u6210') : t('Next', '\u4e0b\u4e00\u6b65')) + '</button>' +
      '</div>' +
    '</div>';

  ov.appendChild(tip);
  document.body.appendChild(ov);
  _tourOverlay = ov;

  /* Position tooltip: above or below target */
  var above = rect.top > window.innerHeight / 2;
  var cx = rect.left + rect.width / 2 - 140;
  cx = Math.max(16, Math.min(cx, window.innerWidth - 296));
  tip.style.left = cx + 'px';
  if (above) {
    tip.style.top = (rect.top - tip.offsetHeight - 16) + 'px';
  } else {
    tip.style.top = (rect.bottom + 16) + 'px';
  }
}

function nextTourStep() {
  _tourStep++;
  if (_tourStep >= TOUR_STEPS.length) { endTour(); return; }
  showTourStep();
}

function endTour() {
  if (_tourOverlay) { _tourOverlay.remove(); _tourOverlay = null; }
  try { localStorage.setItem('wmatch_tour_done', '1'); } catch (e) {}
}
