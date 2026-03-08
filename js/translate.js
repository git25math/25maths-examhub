/* ══════════════════════════════════════════════════════════════
   translate.js — Select-to-Translate (划词翻译)
   Matches selected text against vocabulary index, shows popup.
   Falls back to Baidu Translate (EN↔ZH) via Edge Function,
   then Free Dictionary API for English pronunciation/definitions.
   ══════════════════════════════════════════════════════════════ */

/* Global state */
var _sttEnabled = (function() { try { return localStorage.getItem('wmatch_translate') === '1'; } catch(e) { return false; } })();
var _sttIndex = null;
var _sttPopupEl = null;
var _sttDebounce = null;
var _sttDictCache = {};   /* Dict API cache: word → response | null */
var _sttDictPending = null; /* current pending fetch abort controller */
var _sttBaiduCache = {};  /* Baidu cache: word → { src, dst, from, to } | null */
var _STT_CACHE_MAX = 200;

/* ─── Restore Baidu cache from sessionStorage ─── */
(function() {
  try {
    var raw = sessionStorage.getItem('stt_baidu');
    if (raw) _sttBaiduCache = JSON.parse(raw);
  } catch(e) {}
})();
function _sttPersistBaidu() {
  try { sessionStorage.setItem('stt_baidu', JSON.stringify(_sttBaiduCache)); } catch(e) {}
}

/* ─── Cache with LRU eviction ─── */
function _sttCacheSet(cache, key, val) {
  var keys = Object.keys(cache);
  if (keys.length >= _STT_CACHE_MAX) {
    for (var i = 0; i < 50; i++) delete cache[keys[i]];
  }
  cache[key] = val;
}

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
      var wKey = w.toLowerCase().trim();
      if (wKey) {
        if (!_sttIndex[wKey]) _sttIndex[wKey] = [];
        _sttIndex[wKey].push(entry);
      }
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
  var trimmed = text.trim();
  if (idx[trimmed]) return idx[trimmed];
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

/* ─── Text type detection ─── */
function _isEnglish(text) {
  return /^[a-zA-Z][a-zA-Z\s\-']{0,58}$/.test(text.trim());
}
function _isTranslatable(text) {
  var t = text.trim();
  /* Skip pure numbers, symbols, single chars */
  if (/^[\d\s\+\-\*\/\=\.\,\;\:\!\?\(\)\[\]\{\}]+$/.test(t)) return false;
  if (t.length < 2) return false;
  return true;
}

/* ─── Baidu Translate via Edge Function ─── */
function _fetchBaiduTranslate(text, rect) {
  var key = text.toLowerCase().trim();
  if (key in _sttBaiduCache) {
    if (_sttBaiduCache[key]) {
      _showBaiduPopup(_sttBaiduCache[key], rect);
    } else if (_isEnglish(text)) {
      _fetchDictAPI(text, rect);
    }
    return;
  }
  if (_sttDictPending) {
    try { _sttDictPending.abort(); } catch(e) {}
    _sttDictPending = null;
  }
  _showSTTLoading(rect);
  var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  _sttDictPending = controller;
  var isEn = _isEnglish(text);
  var body = { q: text, from: isEn ? 'en' : 'zh', to: isEn ? 'zh' : 'en' };
  var opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body: JSON.stringify(body)
  };
  if (controller) opts.signal = controller.signal;
  fetch(EDGE_FN_URL + '/translate', opts)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      _sttDictPending = null;
      if (data.error || !data.results || data.results.length === 0) {
        _sttCacheSet(_sttBaiduCache, key, null);
        _sttPersistBaidu();
        if (isEn) { _fetchDictAPI(text, rect); return; }
        _showSTTError(rect);
        return;
      }
      var result = {
        src: data.results[0].src,
        dst: data.results[0].dst,
        from: data.from,
        to: data.to
      };
      /* If dst === src (no real translation), treat as failure */
      if (result.dst.toLowerCase().trim() === result.src.toLowerCase().trim()) {
        _sttCacheSet(_sttBaiduCache, key, null);
        _sttPersistBaidu();
        if (isEn) { _fetchDictAPI(text, rect); return; }
        _hideSTTPopup();
        return;
      }
      _sttCacheSet(_sttBaiduCache, key, result);
      _sttPersistBaidu();
      _showBaiduPopup(result, rect);
    })
    .catch(function(err) {
      _sttDictPending = null;
      if (err && err.name === 'AbortError') return;
      _sttCacheSet(_sttBaiduCache, key, null);
      if (isEn) { _fetchDictAPI(text, rect); return; }
      _showSTTError(rect);
    });
}

/* ─── Show Baidu translation popup ─── */
function _showBaiduPopup(result, rect) {
  if (!_sttPopupEl) return;
  var dir = (result.from === 'en') ? 'EN \u2192 ZH' : 'ZH \u2192 EN';
  var html = '<div class="stt-popup-word">' + _escHtml(result.src) + '</div>' +
    '<div class="stt-popup-def" style="font-size:1.05rem">' + _escHtml(result.dst) + '</div>' +
    '<div class="stt-popup-meta">' +
      '<span class="stt-popup-badge stt-popup-badge--translate">' + t('Translation', '\u7ffb\u8bd1') + '</span>' +
      '<span class="stt-popup-dir">' + dir + '</span>' +
    '</div>' +
    '<div class="stt-popup-actions">' +
      '<button class="btn btn-ghost btn-sm" data-stt-copy="' + _escHtml(result.dst) + '">' + t('Copy', '\u590d\u5236') + '</button>' +
    '</div>';
  _sttPopupEl.innerHTML = html;
  _positionPopup(rect, 120);
  _sttPopupEl.classList.add('show');
  _sttReposition(rect);
}

/* ─── Free Dictionary API fallback ─── */
function _fetchDictAPI(word, rect) {
  var key = word.toLowerCase().trim();
  if (key in _sttDictCache) {
    if (_sttDictCache[key]) _showDictPopup(_sttDictCache[key], rect);
    else _hideSTTPopup();
    return;
  }
  if (_sttDictPending) {
    try { _sttDictPending.abort(); } catch(e) {}
    _sttDictPending = null;
  }
  _showSTTLoading(rect);
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
      if (!data || !data[0]) { _sttCacheSet(_sttDictCache, key, null); _hideSTTPopup(); return; }
      var entry = data[0];
      var result = { word: entry.word || key };
      result.phonetic = entry.phonetic || '';
      result.audio = '';
      if (entry.phonetics) {
        for (var i = 0; i < entry.phonetics.length; i++) {
          if (entry.phonetics[i].audio) { result.audio = entry.phonetics[i].audio; break; }
          if (!result.phonetic && entry.phonetics[i].text) result.phonetic = entry.phonetics[i].text;
        }
      }
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
      _sttCacheSet(_sttDictCache, key, result);
      _showDictPopup(result, rect);
    })
    .catch(function(err) {
      _sttDictPending = null;
      if (err && err.name === 'AbortError') return;
      _sttCacheSet(_sttDictCache, key, null);
      _hideSTTPopup();
    });
}

/* ─── Show loading state ─── */
function _showSTTLoading(rect) {
  if (!_sttPopupEl) return;
  _sttPopupEl.innerHTML = '<div class="stt-popup-loading">' + t('Looking up\u2026', '\u67e5\u8be2\u4e2d\u2026') + '</div>';
  _positionPopup(rect, 60);
  _sttPopupEl.classList.add('show');
}

/* ─── Show error state ─── */
function _showSTTError(rect) {
  if (!_sttPopupEl) return;
  _sttPopupEl.innerHTML = '<div class="stt-popup-loading" style="color:var(--c-danger)">' + t('Translation failed', '\u7ffb\u8bd1\u5931\u8d25') + '</div>';
  _positionPopup(rect, 50);
  _sttPopupEl.classList.add('show');
  setTimeout(_hideSTTPopup, 1500);
}

/* ─── Show dictionary result popup ─── */
function _showDictPopup(result, rect) {
  if (!_sttPopupEl) return;
  var html = '<div class="stt-popup-word">' + _escHtml(result.word);
  if (result.phonetic) {
    html += ' <span class="stt-popup-phonetic">' + _escHtml(result.phonetic) + '</span>';
  }
  if (result.audio) {
    html += ' <button class="stt-popup-audio" data-stt-audio="' + _escHtml(result.audio) + '" title="' + t('Play pronunciation', '\u64ad\u653e\u53d1\u97f3') + '">\ud83d\udd0a</button>';
  }
  html += '</div>';
  html += '<div class="stt-popup-badge stt-popup-badge--dict">' + t('Dictionary', '\u8bcd\u5178') + '</div>';
  for (var i = 0; i < result.defs.length; i++) {
    var d = result.defs[i];
    html += '<div class="stt-popup-dict-def">';
    html += '<span class="stt-popup-pos">' + _escHtml(d.pos) + '</span> ';
    html += _escHtml(d.text);
    if (d.example) {
      html += '<div class="stt-popup-example">\u201c' + _escHtml(d.example) + '\u201d</div>';
    }
    html += '</div>';
  }
  if (result.defs.length === 0) {
    html += '<div class="stt-popup-def">' + t('No definition found', '\u672a\u627e\u5230\u91ca\u4e49') + '</div>';
  }
  /* Copy first definition */
  if (result.defs.length > 0) {
    html += '<div class="stt-popup-actions"><button class="btn btn-ghost btn-sm" data-stt-copy="' + _escHtml(result.defs[0].text) + '">' + t('Copy', '\u590d\u5236') + '</button></div>';
  }
  _sttPopupEl.innerHTML = html;
  _positionPopup(rect, 160);
  _sttPopupEl.classList.add('show');
  _sttReposition(rect);
}

/* ─── Play pronunciation audio ─── */
function _sttPlayAudio(url) {
  try { new Audio(url).play(); } catch(e) {}
}

/* ─── Copy to clipboard ─── */
function _sttCopyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast(t('Copied', '\u5df2\u590d\u5236'));
    }).catch(function() {});
  } else {
    /* Fallback for older browsers */
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(t('Copied', '\u5df2\u590d\u5236')); } catch(e) {}
    document.body.removeChild(ta);
  }
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

/* ─── Reposition after render ─── */
function _sttReposition(rect) {
  requestAnimationFrame(function() {
    if (!_sttPopupEl) return;
    var actualH = _sttPopupEl.offsetHeight;
    var newTop = rect.top - actualH - 8;
    if (newTop < 8) newTop = rect.bottom + 8;
    _sttPopupEl.style.top = newTop + 'px';
  });
}

/* ─── Show vocab popup (local match) ─── */
function _showSTTPopup(matches, rect) {
  if (!_sttPopupEl) return;
  var m = matches[0];
  var ws = _sttWordStatus(m.levelIdx, m.wordId);

  var badgeClass = 'stt-popup-badge stt-popup-badge--' + ws.status;
  var badgeText = ws.status === 'mastered' ? t('Mastered', '\u5df2\u638c\u63e1') :
                  ws.status === 'learning' ? t('Learning', '\u5b66\u4e60\u4e2d') :
                  t('New', '\u65b0\u8bcd');

  var starsHtml = '';
  for (var i = 0; i < 4; i++) {
    starsHtml += i < ws.stars ? '\u2605' : '\u2606';
  }

  var html = '<div class="stt-popup-word">' + _escHtml(m.word) + '</div>' +
    '<div class="stt-popup-def">' + _escHtml(m.def) + '</div>' +
    '<div class="stt-popup-meta">' +
      '<span class="' + badgeClass + '">' + badgeText + '</span>' +
      '<span class="stt-popup-stars">' + starsHtml + '</span>' +
    '</div>' +
    '<div class="stt-popup-actions">';

  if (ws.status === 'new') {
    html += '<button class="btn btn-primary btn-sm" data-stt-learn="' + m.levelIdx + '" data-stt-wid="' + _escHtml(m.wordId) + '">' +
      t('Start Learning', '\u5f00\u59cb\u5b66\u4e60') + '</button>';
  }
  html += '<button class="btn btn-ghost btn-sm" data-stt-deck="' + m.levelIdx + '">' +
    t('Open Deck', '\u6253\u5f00\u8bcd\u7ec4') + '</button>';
  html += '<button class="btn btn-ghost btn-sm" data-stt-copy="' + _escHtml(m.def) + '">' +
    t('Copy', '\u590d\u5236') + '</button>';
  html += '</div>';

  if (matches.length > 1) {
    var moreLabel = '+' + (matches.length - 1) + ' ' + t('more', '\u66f4\u591a');
    html += '<div class="stt-popup-more" data-stt-toggle="more" data-stt-more-label="' + _escHtml(moreLabel) + '">' + moreLabel + '</div>';
    html += '<div class="stt-popup-extra" style="display:none">';
    for (var j = 1; j < matches.length; j++) {
      var mj = matches[j];
      html += '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--c-border)">' +
        '<div class="stt-popup-word" style="font-size:0.95rem">' + _escHtml(mj.word) + '</div>' +
        '<div class="stt-popup-def">' + _escHtml(mj.def) + '</div>' +
        '<button class="btn btn-ghost btn-sm" style="margin-top:4px" data-stt-deck="' + mj.levelIdx + '">' +
        t('Open Deck', '\u6253\u5f00\u8bcd\u7ec4') + '</button></div>';
    }
    html += '</div>';
  }

  _sttPopupEl.innerHTML = html;
  _positionPopup(rect, 160);
  _sttPopupEl.classList.add('show');
  _sttReposition(rect);
}

function _hideSTTPopup() {
  if (_sttPopupEl) _sttPopupEl.classList.remove('show');
}

/* ─── Actions ─── */
function _sttStartLearn(levelIdx, wordId) {
  var key = wordKey(levelIdx, wordId);
  recordAnswer(key, 'study', true);
  showToast(t('Added to learning', '\u5df2\u52a0\u5165\u5b66\u4e60'));
  _hideSTTPopup();
}

function _sttOpenDeck(levelIdx) {
  _hideSTTPopup();
  openDeck(levelIdx);
}

/* ─── Escape helpers ─── */
function _escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ─── Event delegation for popup clicks ─── */
function _onSTTPopupClick(e) {
  var el = e.target;
  var audioBtn = el.closest('[data-stt-audio]');
  if (audioBtn) { _sttPlayAudio(audioBtn.getAttribute('data-stt-audio')); return; }
  var copyBtn = el.closest('[data-stt-copy]');
  if (copyBtn) { _sttCopyText(copyBtn.getAttribute('data-stt-copy')); return; }
  var learnBtn = el.closest('[data-stt-learn]');
  if (learnBtn) {
    _sttStartLearn(parseInt(learnBtn.getAttribute('data-stt-learn'), 10), learnBtn.getAttribute('data-stt-wid'));
    return;
  }
  var deckBtn = el.closest('[data-stt-deck]');
  if (deckBtn) { _sttOpenDeck(parseInt(deckBtn.getAttribute('data-stt-deck'), 10)); return; }
  var moreBtn = el.closest('[data-stt-toggle]');
  if (moreBtn) {
    var extra = moreBtn.nextElementSibling;
    if (!extra) return;
    var expanded = extra.style.display !== 'none';
    extra.style.display = expanded ? 'none' : 'block';
    moreBtn.textContent = expanded ? (moreBtn.getAttribute('data-stt-more-label') || '') : t('Collapse', '\u6536\u8d77');
  }
}

/* ─── Event handlers ─── */
function _onSTTSelection() {
  if (!_sttEnabled) return;
  clearTimeout(_sttDebounce);
  _sttDebounce = setTimeout(function() {
    if (appView === 'battle' || appView === 'match' || appView === 'daily') return;
    var overlay = E('modal-overlay');
    if (overlay && overlay.style.display !== 'none') return;

    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { _hideSTTPopup(); return; }
    var text = sel.toString().trim();
    if (!text || text.length > 60) { _hideSTTPopup(); return; }

    var anchor = sel.anchorNode;
    if (anchor) {
      var parent = anchor.nodeType === 3 ? anchor.parentElement : anchor;
      if (parent && (parent.closest('input, textarea, [contenteditable]') ||
          parent.closest('#stt-popup'))) return;
    }

    /* Skip pure numbers/symbols */
    if (!_isTranslatable(text)) { _hideSTTPopup(); return; }

    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();

    /* Try local vocabulary first */
    var matches = _lookupSTT(text);
    if (matches && matches.length > 0) {
      _showSTTPopup(matches, rect);
      return;
    }

    /* Fallback: Baidu Translate → Dict API */
    _fetchBaiduTranslate(text, rect);
  }, 300);
}

function _onSTTClickOutside(e) {
  if (!_sttPopupEl) return;
  if (!_sttPopupEl.classList.contains('show')) return;
  if (_sttPopupEl.contains(e.target)) return;
  _hideSTTPopup();
}

function _onSTTKeydown(e) {
  if (e.key === 'Escape' && _sttPopupEl && _sttPopupEl.classList.contains('show')) {
    _hideSTTPopup();
  }
}

function _onSTTScroll() {
  if (_sttPopupEl && _sttPopupEl.classList.contains('show')) {
    _hideSTTPopup();
  }
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
  if (!_sttPopupEl) return;
  document.addEventListener('selectionchange', _onSTTSelection);
  document.addEventListener('mousedown', _onSTTClickOutside);
  document.addEventListener('keydown', _onSTTKeydown);
  window.addEventListener('scroll', _onSTTScroll, true);
  _sttPopupEl.addEventListener('click', _onSTTPopupClick);
}
