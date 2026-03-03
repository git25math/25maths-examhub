/* ══════════════════════════════════════════════════════════════
   app.js — Application entry point: init + URL parameter handling
   ══════════════════════════════════════════════════════════════ */

(async function initApp() {
  /* Check for existing Supabase session */
  if (sb) {
    var sess = await sb.auth.getSession();
    if (sess.data.session) {
      currentUser = {
        email: sess.data.session.user.email,
        id: sess.data.session.user.id
      };
      await syncFromCloud();
      afterLogin();

      /* Handle ?level=N URL parameter for deep linking */
      var params = new URLSearchParams(window.location.search);
      var lvlParam = params.get('level');
      if (lvlParam !== null) {
        var lvlIdx = parseInt(lvlParam, 10);
        if (!isNaN(lvlIdx) && lvlIdx >= 0 && lvlIdx < LEVELS.length) {
          openMode(lvlIdx);
        }
      }
      return;
    }
  }

  /* No session — show auth screen */
  showOv('ov-auth');
})();
