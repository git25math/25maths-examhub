/* ══════════════════════════════════════════════════════════════
   translate.js — Select-to-Translate (划词翻译)
   Matches selected text against vocabulary index, shows popup.
   Falls back to Free Dictionary API for English words not in vocab.
   ══════════════════════════════════════════════════════════════ */

/* Global state */
var _sttEnabled = (function() { try { return localStorage.getItem('wmatch_translate') === '1'; } catch(e) { return false; } })();
var _sttIndex = null;
var _sttPopupEl = null;
var _sttDebounce = null;
var _sttDictCache = {};   /* API result cache: word → response | null */
var _sttDictPending = null; /* current pending fetch abort controller */

/* ─── Build reverse index ─── */
function _buildSTTIndex() {
  if (_sttIndex) return _sttIndex;
  _sttIndex = {};
  for (var i = 0; i < LEVELS.length; i++) {
    var lv = LEVELS[i];
    if (!lv.vocabulary) continue;
    var pairs = getPairs(lv.vocabulary);
    for (var j = 0; j < pairs.length; j++) {
      var p = pairs[j];
      var w = p.word || '';
      var d = p.def || '';
      var entry = { word: w, def: d, levelIdx: i, wordId: p.lid };
      /* English → Chinese */
      var wKey = w.toLowerCase().trim();
      if (wKey) {
        if (!_sttIndex[wKey]) _sttIndex[wKey] = [];
        _sttIndex[wKey].push(entry);
      }
      /* Chinese → English */
      var dKey = d.trim();
      if (dKey) {
        var rev = { word: d, def: w, levelIdx: i, wordId: p.lid };
        if (!_sttIndex[dKey]) _sttIndex[dKey] = [];
        _sttIndex[dKey].push(rev);
      }
    }
  }
  return _sttIndex;
}

/* ─── Lookup ─── */
function _lookupSTT(text) {
  var idx = _buildSTTIndex();
  var key = text.toLowerCase().trim();
  if (idx[key]) return idx[key];
  /* Also try original (Chinese is case-insensitive-irrelevant but trim matters) */
  var trimmed = text.trim();
  if (idx[trimmed]) return idx[trimmed];
  /* Basic English stemming: remove common suffixes */
  var stems = [];
  if (key.endsWith('ies')) stems.push(key.slice(0, -3) + 'y');
  if (key.endsWith('es')) stems.push(key.slice(0, -2));
  if (key.endsWith('s') && !key.endsWith('ss')) stems.push(key.slice(0, -1));
  if (key.endsWith('ed')) { stems.push(key.slice(0, -2)); stems.push(key.slice(0, -1)); }
  if (key.endsWith('ing')) { stems.push(key.slice(0, -3)); stems.push(key.slice(0, -3) + 'e'); }
  for (var i = 0; i < stems.length; i++) {
    if (idx[stems[i]]) return idx[stems[i]];
  }
  return null;
}

/* ─── Detect if text is English (Latin alphabet) ─── */
function _isEnglish(text) {
  return /^[a-zA-Z][a-zA-Z\s\-']{0,58}$/.test(text.trim());
}

/* ─── Free Dictionary API fallback ─── */
function _fetchDictAPI(word, rect) {
  var key = word.toLowerCase().trim();
  /* Check cache */
  if (key in _sttDictCache) {
    if (_sttDictCache[key]) _showDictPopup(_sttDictCache[key], rect);
    return;
  }
  /* Abort previous pending request */
  if (_sttDictPending) {
    try { _sttDictPending.abort(); } catch(e) {}
    _sttDictPending = null;
  }
  /* Show loading state */
  _showSTTLoading(rect);
  /* Fetch */
  var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  _sttDictPending = controller;
  var opts = controller ? { signal: controller.signal } : {};
  fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(key), opts)
    .then(function(res) {
      if (!res.ok) throw new Error('not found');
      return res.json();
    })
    .then(function(data) {
      _sttDictPending = null;
      if (!data || !data[0]) { _sttDictCache[key] = null; _hideSTTPopup(); return; }
      var entry = data[0];
      var result = { word: entry.word || key };
      /* Phonetic */
      result.phonetic = entry.phonetic || '';
      /* Audio — find first non-empty audio URL */
      result.audio = '';
      if (entry.phonetics) {
        for (var i = 0; i < entry.phonetics.length; i++) {
          if (entry.phonetics[i].audio) { result.audio = entry.phonetics[i].audio; break; }
          if (!result.phonetic && entry.phonetics[i].text) result.phonetic = entry.phonetics[i].text;
        }
      }
      /* Definitions — take first 3 across all meanings */
      result.defs = [];
      if (entry.meanings) {
        for (var m = 0; m < entry.meanings.length && result.defs.length < 3; m++) {
          var meaning = entry.meanings[m];
          for (var d = 0; d < meaning.definitions.length && result.defs.length < 3; d++) {
            result.defs.push({
              pos: meaning.partOfSpeech,
              text: meaning.definitions[d].definition,
              example: meaning.definitions[d].example || ''
            });
          }
        }
      }
      _sttDictCache[key] = result;
      _showDictPopup(result, rect);
    })
    .catch(function(err) {
      _sttDictPending = null;
      if (err && err.name === 'AbortError') return;
      _sttDictCache[key] = null;
      _hideSTTPopup();
    });
}

/* ─── Show loading spinner in popup ─── */
function _showSTTLoading(rect) {
  if (!_sttPopupEl) return;
  _sttPopupEl.innerHTML = '<div class="stt-popup-loading">' + t('Looking up…', '查询中…') + '</div>';
  _positionPopup(rect, 60);
  _sttPopupEl.classList.add('show');
}

/* ─── Show dictionary API result popup ─── */
function _showDictPopup(result, rect) {
  if (!_sttPopupEl) return;
  var html = '<div class="stt-popup-word">' + _escHtml(result.word);
  if (result.phonetic) {
    html += ' <span class="stt-popup-phonetic">' + _escHtml(result.phonetic) + '</span>';
  }
  if (result.audio) {
    html += ' <button class="stt-popup-audio" onclick="_sttPlayAudio(\'' + _escAttr(result.audio) + '\')" title="' + t('Play pronunciation', '播放发音') + '">🔊</button>';
  }
  html += '</div>';
  html += '<div class="stt-popup-badge stt-popup-badge--dict">' + t('Dictionary', '词典') + '</div>';
  for (var i = 0; i < result.defs.length; i++) {
    var d = result.defs[i];
    html += '<div class="stt-popup-dict-def">';
    html += '<span class="stt-popup-pos">' + _escHtml(d.pos) + '</span> ';
    html += _escHtml(d.text);
    if (d.example) {
      html += '<div class="stt-popup-example">"' + _escHtml(d.example) + '"</div>';
    }
    html += '</div>';
  }
  if (result.defs.length === 0) {
    html += '<div class="stt-popup-def">' + t('No definition found', '未找到释义') + '</div>';
  }
  _sttPopupEl.innerHTML = html;
  _positionPopup(rect, 160);
  _sttPopupEl.classList.add('show');
  /* Reposition after render */
  requestAnimationFrame(function() {
    var actualH = _sttPopupEl.offsetHeight;
    var newTop = rect.top - actualH - 8;
    if (newTop < 8) newTop = rect.bottom + 8;
    _sttPopupEl.style.top = newTop + 'px';
  });
}

/* ─── Play pronunciation audio ─── */
function _sttPlayAudio(url) {
  try { new Audio(url).play(); } catch(e) {}
}

/* ─── Word status helper ─── */
function _sttWordStatus(levelIdx, wordId) {
  var s = loadS();
  var key = wordKey(levelIdx, wordId);
  var w = s.words && s.words[key];
  if (!w) return { status: 'new', stars: 0 };
  return { status: w.st || 'new', stars: w.stars || 0 };
}

/* ─── Position popup near selection ─── */
function _positionPopup(rect, estH) {
  var popW = 300;
  var left = Math.max(8, Math.min(rect.left + rect.width / 2 - popW / 2, window.innerWidth - popW - 8));
  var top = rect.top - estH - 8;
  if (top < 8) top = rect.bottom + 8;
  _sttPopupEl.style.left = left + 'px';
  _sttPopupEl.style.top = top + 'px';
}

/* ─── Show vocab popup (local match) ─── */
function _showSTTPopup(matches, rect) {
  if (!_sttPopupEl) return;
  var m = matches[0];
  var ws = _sttWordStatus(m.levelIdx, m.wordId);

  /* Badge */
  var badgeClass = 'stt-popup-badge stt-popup-badge--' + ws.status;
  var badgeText = ws.status === 'mastered' ? t('Mastered', '已掌握') :
                  ws.status === 'learning' ? t('Learning', '学习中') :
                  t('New', '新词');

  /* Stars */
  var starsHtml = '';
  for (var i = 0; i < 4; i++) {
    starsHtml += i < ws.stars ? '★' : '☆';
  }

  var html = '<div class="stt-popup-word">' + _escHtml(m.word) + '</div>' +
    '<div class="stt-popup-def">' + _escHtml(m.def) + '</div>' +
    '<div class="stt-popup-meta">' +
      '<span class="' + badgeClass + '">' + badgeText + '</span>' +
      '<span class="stt-popup-stars">' + starsHtml + '</span>' +
    '</div>' +
    '<div class="stt-popup-actions">';

  if (ws.status === 'new') {
    html += '<button class="btn btn-primary btn-sm" onclick="_sttStartLearn(' + m.levelIdx + ',\'' + _escAttr(m.wordId) + '\')">' +
      t('Start Learning', '开始学习') + '</button>';
  }
  html += '<button class="btn btn-ghost btn-sm" onclick="_sttOpenDeck(' + m.levelIdx + ')">' +
    t('Open Deck', '打开词组') + '</button>';
  html += '</div>';

  if (matches.length > 1) {
    html += '<div class="stt-popup-more" onclick="_sttExpandMore(this)" data-expanded="0">' +
      '+' + (matches.length - 1) + ' ' + t('more', '更多') + '</div>';
    html += '<div class="stt-popup-extra" style="display:none">';
    for (var j = 1; j < matches.length; j++) {
      var mj = matches[j];
      html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--c-border)">' +
        '<div class="stt-popup-word" style="font-size:0.95rem">' + _escHtml(mj.word) + '</div>' +
        '<div class="stt-popup-def">' + _escHtml(mj.def) + '</div>' +
        '<button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="_sttOpenDeck(' + mj.levelIdx + ')">' +
        t('Open Deck', '打开词组') + '</button></div>';
    }
    html += '</div>';
  }

  _sttPopupEl.innerHTML = html;
  _positionPopup(rect, 160);
  _sttPopupEl.classList.add('show');

  /* Reposition after render (actual height may differ) */
  requestAnimationFrame(function() {
    var actualH = _sttPopupEl.offsetHeight;
    var newTop = rect.top - actualH - 8;
    if (newTop < 8) newTop = rect.bottom + 8;
    _sttPopupEl.style.top = newTop + 'px';
  });
}

function _hideSTTPopup() {
  if (_sttPopupEl) _sttPopupEl.classList.remove('show');
}

/* ─── Actions ─── */
function _sttStartLearn(levelIdx, wordId) {
  var key = wordKey(levelIdx, wordId);
  recordAnswer(key, 'study', true);
  showToast(t('Added to learning', '已加入学习'));
  _hideSTTPopup();
}

function _sttOpenDeck(levelIdx) {
  _hideSTTPopup();
  openDeck(levelIdx);
}

function _sttExpandMore(el) {
  var extra = el.nextElementSibling;
  if (!extra) return;
  var expanded = el.getAttribute('data-expanded') === '1';
  extra.style.display = expanded ? 'none' : 'block';
  el.setAttribute('data-expanded', expanded ? '0' : '1');
  el.textContent = expanded ? el.textContent : t('Collapse', '收起');
}

/* ─── Escape helpers ─── */
function _escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _escAttr(s) {
  return s.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

/* ─── Event handlers ─── */
function _onSTTSelection() {
  if (!_sttEnabled) return;
  clearTimeout(_sttDebounce);
  _sttDebounce = setTimeout(function() {
    /* Skip in game modes / modal visible */
    if (appView === 'battle' || appView === 'match' || appView === 'daily') return;
    var overlay = E('modal-overlay');
    if (overlay && overlay.style.display !== 'none') return;

    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { _hideSTTPopup(); return; }
    var text = sel.toString().trim();
    if (!text || text.length < 1 || text.length > 60) { _hideSTTPopup(); return; }

    /* Skip if selection is inside input/textarea or the popup itself */
    var anchor = sel.anchorNode;
    if (anchor) {
      var parent = anchor.nodeType === 3 ? anchor.parentElement : anchor;
      if (parent && (parent.closest('input, textarea, [contenteditable]') ||
          parent.closest('#stt-popup'))) return;
    }

    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();

    /* Try local vocabulary first */
    var matches = _lookupSTT(text);
    if (matches && matches.length > 0) {
      _showSTTPopup(matches, rect);
      return;
    }

    /* Fallback: Free Dictionary API for English words */
    if (_isEnglish(text) && text.length >= 2) {
      _fetchDictAPI(text, rect);
      return;
    }

    _hideSTTPopup();
  }, 300);
}

function _onSTTClickOutside(e) {
  if (!_sttPopupEl) return;
  if (!_sttPopupEl.classList.contains('show')) return;
  if (_sttPopupEl.contains(e.target)) return;
  _hideSTTPopup();
}

/* ─── Toggle ─── */
function toggleTranslate(enabled) {
  _sttEnabled = enabled;
  try { localStorage.setItem('wmatch_translate', enabled ? '1' : '0'); } catch(e) {}
  if (!enabled) _hideSTTPopup();
}

/* ─── Init ─── */
function initTranslate() {
  _sttPopupEl = E('stt-popup');
  document.addEventListener('selectionchange', _onSTTSelection);
  document.addEventListener('mousedown', _onSTTClickOutside);
}
