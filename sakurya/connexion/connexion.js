/* Sakurya : page de connexion (maquette, pas encore reliée aux comptes) */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* salutation selon l'heure */
  const h = new Date().getHours();
  $('#hello').textContent = h >= 5 && h < 12 ? 'Bonjour.' : h < 18 ? 'Bon après-midi.' : 'Bonsoir.';

  /* afficher / masquer le mot de passe */
  const eye = $('#eye'), pw = $('#pw');
  eye.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
  });

  /* envoi : les comptes arrivent avec l'ouverture */
  const msg = $('#msg');
  $('#login').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.email.value || !f.password.value) { msg.textContent = 'Remplis ton e-mail et ton mot de passe.'; return; }
    msg.textContent = 'Les comptes membres ouvrent bientôt : la ville arrive.';
  });
  document.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); msg.textContent = 'Bientôt disponible.';
  }));

  /* quelques pétales qui tombent */
  if (reduce) return;
  const cv = $('#petals'), ctx = cv.getContext('2d');
  let W = 0, H = 0, petals = [];
  const spawn = (any) => ({ x: Math.random() * W * 1.2 - W * .1, y: any ? Math.random() * H : -20, s: 4 + Math.random() * 6, vy: .3 + Math.random() * .5, vx: .15 + Math.random() * .4, a: Math.random() * 6.28, va: (Math.random() - .5) * .03, sw: Math.random() * 6.28, o: .45 + Math.random() * .4 });
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    petals = Array.from({ length: Math.round(Math.min(30, W / 40)) }, () => spawn(true));
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(3, (now - last) / 16.67); last = now;
    ctx.clearRect(0, 0, W, H);
    petals.forEach((p, i) => {
      p.sw += .03 * dt; p.a += p.va * dt; p.y += p.vy * dt; p.x += (p.vx + Math.sin(p.sw) * .5) * dt;
      if (p.y > H + 20 || p.x > W + 30) petals[i] = p = spawn(false);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, .55 + .45 * Math.abs(Math.sin(p.sw))); ctx.globalAlpha = p.o;
      const g = ctx.createLinearGradient(-p.s, 0, p.s, 0); g.addColorStop(0, '#ffd6e5'); g.addColorStop(1, '#f08fb3'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
      ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
      ctx.fill(); ctx.restore();
    });
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(frame);
})();
