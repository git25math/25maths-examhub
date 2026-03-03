/* ══════════════════════════════════════════════════════════════
   config.js — Application configuration
   ══════════════════════════════════════════════════════════════ */

/* Supabase credentials (leave empty to run in offline/guest mode) */
var SUPABASE_URL = '';  // e.g. 'https://abc123.supabase.co'
var SUPABASE_KEY = '';  // your anon public key

/* Supabase client (initialized only if credentials are set) */
var sb = null;
var currentUser = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/* localStorage key */
var SK = 'wmatch_v3';

/* Rank thresholds (mastery percentage → rank) */
var RANKS = [
  { min: 0,  emoji: '🥉', name: '青铜学员', color: '#CD7F32' },
  { min: 15, emoji: '🥈', name: '白银达人', color: '#C0C0C0' },
  { min: 40, emoji: '🥇', name: '黄金学者', color: '#FFD700' },
  { min: 65, emoji: '💎', name: '钻石大师', color: '#B9F2FF' },
  { min: 90, emoji: '👑', name: '单词王者', color: '#FF6B6B' }
];

/* DOM helper */
var E = function(id) { return document.getElementById(id); };
