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
  { min: 0,  emoji: '\ud83e\udd49', name: '\u9752\u94dc\u5b66\u5458', color: '#CD7F32' },
  { min: 15, emoji: '\ud83e\udd48', name: '\u767d\u94f6\u8fbe\u4eba', color: '#C0C0C0' },
  { min: 40, emoji: '\ud83e\udd47', name: '\u9ec4\u91d1\u5b66\u8005', color: '#FFD700' },
  { min: 65, emoji: '\ud83d\udc8e', name: '\u94bb\u77f3\u5927\u5e08', color: '#B9F2FF' },
  { min: 90, emoji: '\ud83d\udc51', name: '\u5355\u8bcd\u738b\u8005', color: '#FF6B6B' }
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
var appLang = 'bilingual';   /* 'bilingual' | 'en' */
var appView = 'home';        /* current panel id */
var appSort = 'default';     /* 'default' | 'az' | 'random' | 'hard' */
var appBP = 'desktop';       /* 'phone' | 'tablet' | 'desktop' */
var currentLvl = 0;

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

/* DOM helper */
var E = function(id) { return document.getElementById(id); };
