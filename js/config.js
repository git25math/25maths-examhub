/* ══════════════════════════════════════════════════════════════
   config.js — Application configuration + theme + global state
   ══════════════════════════════════════════════════════════════ */

/* Supabase credentials (shared with 25maths-website) */
var SUPABASE_URL = 'https://jjjigohjvmyewasmmmyf.supabase.co';
var SUPABASE_KEY = 'sb_publishable_EDe6c9jFS4_PL451oYMYzg_86KRbHRZ';

/* Supabase client (initialized only if credentials are set) */
var sb = null;
var currentUser = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/* localStorage key */
var SK = 'wmatch_v3';

/* Rank thresholds (mastery percentage -> rank) */
var RANKS = [
  { min: 0,  emoji: '\ud83e\udd49', name: '\u9752\u94dc\u5b66\u5458', nameEn: 'Bronze Learner', color: '#CD7F32' },
  { min: 15, emoji: '\ud83e\udd48', name: '\u767d\u94f6\u8fbe\u4eba', nameEn: 'Silver Expert', color: '#C0C0C0' },
  { min: 40, emoji: '\ud83e\udd47', name: '\u9ec4\u91d1\u5b66\u8005', nameEn: 'Gold Scholar', color: '#FFD700' },
  { min: 65, emoji: '\ud83d\udc8e', name: '\u94bb\u77f3\u5927\u5e08', nameEn: 'Diamond Master', color: '#B9F2FF' },
  { min: 90, emoji: '\ud83d\udc51', name: '\u5355\u8bcd\u738b\u8005', nameEn: 'Word King', color: '#FF6B6B' }
];

/* Theme tokens */
var THEME = {
  primary: '#5248C9',
  primaryLight: '#6C63FF',
  primaryDark: '#3D35A0',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  bg: '#F8F7FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F0FB',
  text: '#1E1B4B',
  textSecondary: '#6B7280',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6'
};

/* Global app state */
var appLang = (function() {
  try {
    var stored = localStorage.getItem('wmatch_lang');
    if (stored === 'bilingual') return 'bilingual';
  } catch (e) {}
  return 'en';
})();          /* 'en' | 'bilingual' */
var appView = 'home';        /* current panel id */
var appSort = 'default';     /* 'default' | 'az' | 'random' | 'hard' */
var appBP = 'desktop';       /* 'phone' | 'tablet' | 'desktop' */
var currentLvl = 0;
var userBoard = null;        /* selected board/year filter */
var userClassId = null;      /* student's class_id from metadata */
var userSchoolId = null;     /* student/teacher's school_id from metadata */
var appSearch = '';           /* current search keyword (lowercase) */

var appDark = (function() {
  try {
    var stored = localStorage.getItem('wmatch_dark');
    if (stored !== null) return stored === '1';
  } catch (e) {}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
})();

var appSound = (function() {
  try {
    var stored = localStorage.getItem('wmatch_sound');
    if (stored !== null) return stored === '1';
  } catch (e) {}
  return true;
})();

/* Guest full access toggle — set to false to restore original limits */
var GUEST_FULL_ACCESS = true;
/* Guest free trial limit */
var GUEST_FREE_LIMIT = GUEST_FULL_ACCESS ? Infinity : 3;

/* Search matching: level title/vocab against query */
function matchLevel(lv, q) {
  if (!q) return true;
  if (lv.title.toLowerCase().indexOf(q) >= 0) return true;
  if (lv.titleZh && lv.titleZh.indexOf(q) >= 0) return true;
  for (var i = 0; i < lv.vocabulary.length; i++) {
    if (lv.vocabulary[i].content.toLowerCase().indexOf(q) >= 0) return true;
  }
  return false;
}

/* Search matching: word/def against query */
function matchWord(w, q) {
  if (!q) return true;
  return w.word.toLowerCase().indexOf(q) >= 0 ||
         w.def.toLowerCase().indexOf(q) >= 0;
}

/* Board selection options (8 choices) */
var BOARD_OPTIONS = [
  { value: 'all',     emoji: '\ud83c\udf10', name: 'All Courses',        nameZh: '\u5168\u90e8\u8bfe\u7a0b' },
  { value: 'cie',     emoji: '\ud83d\udcda', name: 'CIE IGCSE 0580',    nameZh: '\u5251\u6865 IGCSE 0580' },
  { value: 'edx',     emoji: '\ud83d\udcd8', name: 'Edexcel IGCSE 4MA1', nameZh: '\u7231\u5fb7\u601d IGCSE 4MA1' },
  { value: '25m-y7',  emoji: '\u24fb',  name: 'Harrow Haikou Year 7',  nameZh: '\u54c8\u7f57\u6d77\u53e3 \u516d\u5e74\u7ea7' },
  { value: '25m-y8',  emoji: '\u24fc',  name: 'Harrow Haikou Year 8',  nameZh: '\u54c8\u7f57\u6d77\u53e3 \u4e03\u5e74\u7ea7' },
  { value: '25m-y9',  emoji: '\u24fd',  name: 'Harrow Haikou Year 9',  nameZh: '\u54c8\u7f57\u6d77\u53e3 \u516b\u5e74\u7ea7' },
  { value: '25m-y10', emoji: '\u24fe', name: 'Harrow Haikou Year 10',   nameZh: '\u54c8\u7f57\u6d77\u53e3 \u4e5d\u5e74\u7ea7' },
  { value: '25m-y11', emoji: '\u24eb', name: 'Harrow Haikou Year 11', nameZh: '\u54c8\u7f57\u6d77\u53e3 \u5341\u5e74\u7ea7' }
];

/* Check if a level should be visible under current board filter */
function isLevelVisible(lv) {
  /* 25m content requires school_id (Harrow users only), unless guest full access is on */
  if (!userSchoolId && !(GUEST_FULL_ACCESS && isGuest()) && lv.board === '25m') return false;
  if (!userBoard) return true;
  if (userBoard === 'all') return true;
  /* Custom levels are always visible */
  if (lv.custom) return true;
  /* CIE / Edexcel: filter by board field */
  if (userBoard === 'cie' || userBoard === 'edx') {
    return lv.board === userBoard;
  }
  /* 25m-yN: filter by category field */
  return lv.category === userBoard;
}

/* Get filtered BOARDS array based on userBoard */
function getVisibleBoards() {
  var base = BOARDS.filter(function(b) { return userSchoolId || (GUEST_FULL_ACCESS && isGuest()) || b.id !== '25m'; });
  if (!userBoard) return base;
  if (userBoard === 'all') return base;
  return base.filter(function(b) {
    /* CIE/Edexcel: show entire board */
    if (userBoard === 'cie' && b.id === 'cie') return true;
    if (userBoard === 'edx' && b.id === 'edx') return true;
    /* 25m-yN: show 25m board only */
    if (userBoard.indexOf('25m-') === 0 && b.id === '25m') return true;
    return false;
  }).map(function(b) {
    /* For 25m-yN, filter to only the selected year category */
    if (userBoard.indexOf('25m-') === 0 && b.id === '25m') {
      return {
        id: b.id, name: b.name, nameZh: b.nameZh, code: b.code, emoji: b.emoji,
        categories: b.categories.filter(function(c) { return c.id === userBoard; })
      };
    }
    return b;
  });
}

/* Get display info for current userBoard */
function getUserBoardOption() {
  if (!userBoard) return null;
  for (var i = 0; i < BOARD_OPTIONS.length; i++) {
    if (BOARD_OPTIONS[i].value === userBoard) return BOARD_OPTIONS[i];
  }
  return null;
}

/* Breakpoint detection */
function detectBP() {
  var w = window.innerWidth;
  if (w < 640) return 'phone';
  if (w < 1080) return 'tablet';
  return 'desktop';
}

/* SRS labels for Ebbinghaus levels 0-7 */
var SRS_LABELS = ['New', '20m', '1h', '9h', '1d', '2d', '1w', '30d'];
var SRS_COLORS = ['#9CA3AF', '#FBBF24', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6', '#EF4444', '#1F2937'];

/* Exam boards configuration */
var BOARDS = [
  {
    id: '25m', name: 'Harrow Haikou Upper School Mathematics Curriculum', nameZh: '\u54c8\u7f57\u6d77\u53e3\u9ad8\u5e74\u7ea7\u6570\u5b66\u8bfe\u7a0b', code: 'Y7-11', emoji: '\ud83c\udfeb',
    categories: [
      { id: '25m-y7',  name: 'Year 7',  emoji: '\u24fb',  nameZh: '\u516d\u5e74\u7ea7' },
      { id: '25m-y8',  name: 'Year 8',  emoji: '\u24fc',  nameZh: '\u4e03\u5e74\u7ea7' },
      { id: '25m-y9',  name: 'Year 9',  emoji: '\u24fd',  nameZh: '\u516b\u5e74\u7ea7' },
      { id: '25m-y10', name: 'Year 10', emoji: '\u24fe', nameZh: '\u4e5d\u5e74\u7ea7' },
      { id: '25m-y11', name: 'Year 11', emoji: '\u24eb', nameZh: '\u5341\u5e74\u7ea7' }
    ]
  },
  {
    id: 'cie', name: 'CIE IGCSE Maths', nameZh: '\u5251\u6865IGCSE\u6570\u5b66', code: '0580', emoji: '\ud83d\udcda',
    categories: [
      { id: 'number', name: 'Number', emoji: '\ud83d\udd22', nameZh: '\u6570\u8bba' },
      { id: 'algebra', name: 'Algebra', emoji: '\ud83d\udcdd', nameZh: '\u4ee3\u6570' },
      { id: 'coord', name: 'Coordinate Geometry', emoji: '\ud83d\udccd', nameZh: '\u5750\u6807\u51e0\u4f55' },
      { id: 'geometry', name: 'Geometry', emoji: '\ud83d\udcd0', nameZh: '\u51e0\u4f55' },
      { id: 'mensuration', name: 'Mensuration', emoji: '\ud83d\udccf', nameZh: '\u5ea6\u91cf' },
      { id: 'trigonometry', name: 'Trigonometry', emoji: '\ud83d\udcd0', nameZh: '\u4e09\u89d2' },
      { id: 'vectors', name: 'Vectors & Transformations', emoji: '\u27a1\ufe0f', nameZh: '\u5411\u91cf\u4e0e\u53d8\u6362' },
      { id: 'statistics', name: 'Statistics & Probability', emoji: '\ud83d\udcc8', nameZh: '\u7edf\u8ba1\u4e0e\u6982\u7387' }
    ]
  },
  {
    id: 'edx', name: 'Edexcel IGCSE Maths', nameZh: '\u7231\u5fb7\u601dIGCSE\u6570\u5b66', code: '4MA1', emoji: '\ud83d\udcd8',
    categories: [
      { id: 'edx-number', name: 'Numbers & Number System', emoji: '\ud83d\udd22', nameZh: '\u6570\u4e0e\u6570\u7cfb' },
      { id: 'edx-algebra', name: 'Equations, Formulae & Identities', emoji: '\ud83d\udcdd', nameZh: '\u65b9\u7a0b\u4e0e\u4ee3\u6570' },
      { id: 'edx-functions', name: 'Sequences, Functions & Graphs', emoji: '\ud83d\udcca', nameZh: '\u6570\u5217\u51fd\u6570\u4e0e\u56fe\u50cf' },
      { id: 'edx-geometry', name: 'Geometry & Trigonometry', emoji: '\ud83d\udcd0', nameZh: '\u51e0\u4f55\u4e0e\u4e09\u89d2' },
      { id: 'edx-mensuration', name: 'Mensuration', emoji: '\ud83d\udccf', nameZh: '\u5ea6\u91cf' },
      { id: 'edx-vectors', name: 'Vectors & Transformations', emoji: '\u27a1\ufe0f', nameZh: '\u5411\u91cf\u4e0e\u53d8\u6362' },
      { id: 'edx-statistics', name: 'Statistics & Probability', emoji: '\ud83d\udcc8', nameZh: '\u7edf\u8ba1\u4e0e\u6982\u7387' }
    ]
  }
];

/* Backward-compatible alias */
var CATEGORIES = BOARDS[0].categories;

/* Get all categories across all boards */
function getAllCategories() {
  var all = [];
  BOARDS.forEach(function(b) { all = all.concat(b.categories); });
  return all;
}

/* Look up board info by id */
function getBoardInfo(boardId) {
  for (var i = 0; i < BOARDS.length; i++) {
    if (BOARDS[i].id === boardId) return BOARDS[i];
  }
  return BOARDS[0];
}

/* Get board display name */
function boardName(b) {
  if (appLang === 'en') return b.name;
  return b.name + ' ' + b.nameZh;
}

/* Get which board a level belongs to */
function getLevelBoard(lv) {
  return getBoardInfo(lv.board || 'cie');
}

function getCategoryInfo(catId) {
  var allCats = getAllCategories();
  for (var i = 0; i < allCats.length; i++) {
    if (allCats[i].id === catId) return allCats[i];
  }
  return { id: catId, name: catId, emoji: '\ud83d\udcdd', nameZh: catId };
}

/* ═══ i18n HELPERS ═══ */
/* Returns en or zh text based on current appLang */
function t(en, zh) {
  return appLang === 'en' ? en : zh;
}

/* Returns rank display name */
function rankName(r) {
  return appLang === 'en' ? r.nameEn : r.name;
}

/* Returns category display name */
function catName(cat) {
  if (appLang === 'en') return cat.name;
  return cat.name + ' ' + cat.nameZh;
}

/* Returns level display title */
function lvTitle(lv) {
  if (appLang === 'en' || !lv.titleZh) return lv.title;
  return lv.title + ' ' + lv.titleZh;
}

/* Edge function URL */
var EDGE_FN_URL = SUPABASE_URL + '/functions/v1';

/* Grade options (25m-y* subset of BOARD_OPTIONS for admin panel) */
var GRADE_OPTIONS = BOARD_OPTIONS.filter(function(o) { return o.value.indexOf('25m-y') === 0; });

/* Check if a level index is locked for guest users — O(1) with cache */
var _guestVisCache = null;

function _buildGuestVisCache() {
  var set = {};
  var count = 0;
  for (var i = 0; i < LEVELS.length; i++) {
    if (isLevelVisible(LEVELS[i])) {
      set[i] = count >= GUEST_FREE_LIMIT;
      count++;
    }
  }
  _guestVisCache = set;
}

function invalidateGuestCache() {
  _guestVisCache = null;
}

function isGuestLocked(li) {
  if (!isGuest()) return false;
  if (!_guestVisCache) _buildGuestVisCache();
  return !!_guestVisCache[li];
}

/* ═══ COMMON HELPERS ═══ */
function isGuest() { return currentUser && currentUser.id === 'local'; }
function isLoggedIn() { return currentUser && currentUser.id !== 'local'; }
function getDisplayName() {
  if (!currentUser || currentUser.email === 'guest') return t('Guest', '\u8bbf\u5ba2');
  return currentUser.nickname || currentUser.email.split('@')[0];
}
function getPublicBoardOptions() {
  if (GUEST_FULL_ACCESS) return BOARD_OPTIONS.slice();
  return BOARD_OPTIONS.filter(function(o) { return o.value.indexOf('25m-') !== 0; });
}

/* Super admin */
var SUPER_ADMIN_EMAIL = 'zhuxingda86@hotmail.com';
function isSuperAdmin() {
  return currentUser && currentUser.email === SUPER_ADMIN_EMAIL;
}

/* App version */
var APP_VERSION = 'v1.5.3';

/* ═══ TEACHER ROLE (shared across modules) ═══ */
var isTeacherUser = false;
function isTeacher() { return isTeacherUser; }

/* ═══ EDGE FUNCTION CALLER ═══ */
async function callEdgeFunction(name, body) {
  try {
    var session = await sb.auth.getSession();
    var token = session.data.session ? session.data.session.access_token : '';
    var res = await fetch(EDGE_FN_URL + '/' + name, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    return { error: e.message || 'Network error' };
  }
}

/* DOM helper */
var E = function(id) { return document.getElementById(id); };

/* ═══ CONDITIONAL CJK FONT LOADING ═══ */
var _cjkLoaded = false;
function loadCJKFont() {
  if (_cjkLoaded) return;
  _cjkLoaded = true;
  var lk = document.createElement('link');
  lk.rel = 'stylesheet';
  lk.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap';
  document.head.appendChild(lk);
}
/* Load CJK font on startup if user prefers bilingual */
if (appLang !== 'en') loadCJKFont();

/* ═══ LAZY HOMEWORK MODULE ═══ */
var _hwModuleLoaded = false;
function loadHomeworkModule() {
  /* Already loaded (or inlined by build-single.py offline build) */
  if (_hwModuleLoaded || typeof showStudentHwPage === 'function') return Promise.resolve();
  _hwModuleLoaded = true;
  return new Promise(function(resolve) {
    var s = document.createElement('script');
    s.src = 'js/homework.min.js';
    s.onload = resolve;
    s.onerror = function() { _hwModuleLoaded = false; resolve(); };
    document.head.appendChild(s);
  });
}
