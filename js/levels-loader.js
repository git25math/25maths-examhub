/* ══════════════════════════════════════════════════════════════
   levels-loader.js — Async parallel loader for split level data
   Loads 3 JSON files (CIE + EDX + 25m) and concatenates into LEVELS.
   Falls back to monolithic levels.js on failure.
   ══════════════════════════════════════════════════════════════ */

var LEVELS = [];
var _levelsReady = false;
var _levelsCallbacks = [];

function onLevelsReady(fn) {
  if (_levelsReady) { fn(); return; }
  _levelsCallbacks.push(fn);
}

(function() {
  var urls = ['data/levels-cie.json', 'data/levels-edx.json', 'data/levels-25m.json'];
  Promise.all(urls.map(function(u) {
    return fetch(u).then(function(r) { return r.json(); });
  })).then(function(res) {
    LEVELS = res[0].concat(res[1]).concat(res[2]);
    _levelsReady = true;
    _levelsCallbacks.forEach(function(fn) { try { fn(); } catch(e) { console.error(e); } });
    _levelsCallbacks = [];
  }).catch(function(err) {
    console.error('levels-loader: JSON fetch failed, falling back to levels.js', err);
    var s = document.createElement('script');
    s.src = 'js/levels.js';
    s.onload = function() {
      _levelsReady = true;
      _levelsCallbacks.forEach(function(fn) { try { fn(); } catch(e) { console.error(e); } });
      _levelsCallbacks = [];
    };
    s.onerror = function() {
      console.error('levels-loader: fallback levels.js also failed');
    };
    document.head.appendChild(s);
  });
})();
