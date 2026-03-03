/* ══════════════════════════════════════════════════════════════
   particles.js — Canvas particle system (stars, hearts, circles)
   ══════════════════════════════════════════════════════════════ */

var particles = [];
var PC = ['#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#A8E6CF', '#DCEDC1', '#FFD93D', '#FF6B6B'];
var fxC = E('fx');
var fxX = fxC.getContext('2d');

/* Resize canvas to match window */
function resizeFx() {
  fxC.width = innerWidth;
  fxC.height = innerHeight;
}
addEventListener('resize', resizeFx);
resizeFx();

/* Spawn particles at a position */
function spawnP(x, y, n) {
  n = n || 12;
  for (var i = 0; i < n; i++) {
    var a = Math.PI * 2 * i / n + Math.random() * .5;
    particles.push({
      x: x, y: y,
      vx: Math.cos(a) * (2 + Math.random() * 4),
      vy: Math.sin(a) * (2 + Math.random() * 4) - 2,
      sz: 3 + Math.random() * 5,
      col: PC[~~(Math.random() * PC.length)],
      life: 1,
      dec: .015 + Math.random() * .02,
      sh: ['c', 's', 'h'][~~(Math.random() * 3)],
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - .5) * .2
    });
  }
}

/* Draw loop */
function drawP() {
  fxX.clearRect(0, 0, fxC.width, fxC.height);
  particles = particles.filter(function(p) { return p.life > 0; });

  particles.forEach(function(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += .1;
    p.life -= p.dec;
    p.rot += p.rs;

    fxX.save();
    fxX.translate(p.x, p.y);
    fxX.rotate(p.rot);
    fxX.globalAlpha = p.life;
    fxX.fillStyle = p.col;

    if (p.sh === 's') {
      /* Star shape */
      fxX.beginPath();
      for (var i = 0; i < 5; i++) {
        var a1 = i * 4 * Math.PI / 5 - Math.PI / 2;
        fxX.lineTo(Math.cos(a1) * p.sz, Math.sin(a1) * p.sz);
        var a2 = a1 + 2 * Math.PI / 5;
        fxX.lineTo(Math.cos((a1 + a2) / 2) * p.sz * .4, Math.sin((a1 + a2) / 2) * p.sz * .4);
      }
      fxX.closePath();
      fxX.fill();
    } else if (p.sh === 'h') {
      /* Heart shape */
      var s = p.sz * .6;
      fxX.beginPath();
      fxX.moveTo(0, s * .4);
      fxX.bezierCurveTo(-s, -s * .3, -s * .5, -s, 0, -s * .4);
      fxX.bezierCurveTo(s * .5, -s, s, -s * .3, 0, s * .4);
      fxX.fill();
    } else {
      /* Circle */
      fxX.beginPath();
      fxX.arc(0, 0, p.sz, 0, Math.PI * 2);
      fxX.fill();
    }

    fxX.restore();
  });

  fxX.globalAlpha = 1;
  requestAnimationFrame(drawP);
}
drawP();

/* Floating text effect (e.g. "+3s") */
function floatTxt(t, c, x, y) {
  var el = document.createElement('div');
  el.className = 'bf';
  el.textContent = t;
  el.style.cssText = 'left:' + x + 'px;top:' + y + 'px;color:' + c;
  document.body.appendChild(el);
  requestAnimationFrame(function() { el.classList.add('show'); });
  setTimeout(function() { el.remove(); }, 1000);
}

/* Combo popup (e.g. "Amazing x4") */
var comboEl = E('combo-el');
function showCombo(n) {
  var m = ['', '', 'Nice \xd72', 'Great \xd73', 'Amazing \xd74', 'Incredible \xd75'];
  var e = ['', '', '\u26a1', '\ud83d\udd25', '\ud83d\udca5', '\ud83c\udf1f'];
  var i = Math.min(n, 5);
  comboEl.textContent = e[i] + ' ' + m[i];
  comboEl.style.color = PC[~~(Math.random() * PC.length)];
  comboEl.className = 'combo-pop';
  void comboEl.offsetWidth;
  comboEl.classList.add('show');
}
