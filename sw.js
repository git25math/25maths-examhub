/* ══════════════════════════════════════════════════════════════
   Service Worker — 25Maths Keywords PWA
   Strategy: Cache-first for app shell, network-first for data
   ══════════════════════════════════════════════════════════════ */

var CACHE_VERSION = 'v2.2.20';
var SHELL_CACHE = 'shell-' + CACHE_VERSION;
var DATA_CACHE = 'data-v1';

/* App shell — cached on install */
var SHELL_FILES = [
  './',
  'index.html',
  'css/style.min.css',
  'js/app.bundle.min.js',
  'manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg'
];

/* Data files — cached on first fetch, network-first */
var DATA_PATTERNS = [
  /\/data\//,
  /\/js\/homework\.min\.js/
];

/* External CDN — cache on first fetch */
var CDN_CACHE = 'cdn-v1';
var CDN_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /cdn\.jsdelivr\.net/
];

/* ═══ INSTALL ═══ */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ═══ ACTIVATE ═══ */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) {
          return k.startsWith('shell-') && k !== SHELL_CACHE;
        }).map(function(k) {
          return caches.delete(k);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ═══ FETCH ═══ */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* Skip non-GET and Supabase API */
  if (e.request.method !== 'GET') return;
  if (url.indexOf('supabase.co') !== -1) return;

  /* CDN resources — cache-first */
  for (var ci = 0; ci < CDN_PATTERNS.length; ci++) {
    if (CDN_PATTERNS[ci].test(url)) {
      e.respondWith(cacheFirst(e.request, CDN_CACHE));
      return;
    }
  }

  /* Data files — network-first with cache fallback */
  for (var di = 0; di < DATA_PATTERNS.length; di++) {
    if (DATA_PATTERNS[di].test(url)) {
      e.respondWith(networkFirst(e.request, DATA_CACHE));
      return;
    }
  }

  /* App shell — cache-first */
  e.respondWith(cacheFirst(e.request, SHELL_CACHE));
});

/* ═══ STRATEGIES ═══ */

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function(cache) { cache.put(request, clone); });
      }
      return response;
    });
  }).catch(function() {
    /* Offline fallback for navigation */
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  });
}

function networkFirst(request, cacheName) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      var clone = response.clone();
      caches.open(cacheName).then(function(cache) { cache.put(request, clone); });
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      return cached || new Response('Offline', { status: 503 });
    });
  });
}
