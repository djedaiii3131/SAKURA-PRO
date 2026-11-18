/* Sakurya : page publique */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- barre de navigation qui se fonce au défilement --- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* --- jour / nuit selon l'heure réelle (France) --- */
  const SUN = [[8.67,17.25],[8.08,18],[7.25,18.75],[7.25,20.5],[6.5,21.25],[5.83,21.9],[6.17,21.83],[6.83,21.17],[7.5,20.17],[7.75,18.5],[7.92,17.25],[8.58,16.92]];
  function nightLevel(d) {
    const [rise, set] = SUN[d.getMonth()], h = d.getHours() + d.getMinutes() / 60, T = .75;
    if (h >= rise + T && h <= set - T) return 0;
    if (h > rise - T && h < rise + T) return 1 - (h - (rise - T)) / (2 * T);
    if (h > set - T && h < set + T) return (h - (set - T)) / (2 * T);
    return 1;
  }
  function tick() {
    const d = new Date(), n = nightLevel(d);
    $('#hero-night').style.opacity = n.toFixed(2);
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const mood = n > .85 ? 'la ville s\'illumine' : n < .15 ? 'la ville est réveillée' : 'le soleil change de côté';
    $('#hero-time').textContent = `Il est ${time} : ${mood}`;
  }
  tick(); setInterval(tick, 30000);

  /* --- pétales de cerisier qui tombent --- */
  const cv = $('#petals'), ctx = cv.getContext('2d');
  let W = 0, H = 0, petals = [];
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(46, W / 28));
    petals = Array.from({ length: count }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * W * 1.2 - W * .1, y: anywhere ? Math.random() * H : -20,
      s: 5 + Math.random() * 7, vy: .35 + Math.random() * .7, vx: .2 + Math.random() * .6,
      a: Math.random() * 6.28, va: (Math.random() - .5) * .04, sw: Math.random() * 6.28,
      o: .55 + Math.random() * .4
    };
  }
  function drawPetal(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    ctx.scale(1, .55 + .45 * Math.abs(Math.sin(p.sw)));
    ctx.globalAlpha = p.o;
    const g = ctx.createLinearGradient(-p.s, 0, p.s, 0);
    g.addColorStop(0, '#ffd6e5'); g.addColorStop(1, '#f08fb3');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
    ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
    ctx.fill(); ctx.restore();
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(3, (now - last) / 16.67); last = now;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.sw += .03 * dt; p.a += p.va * dt;
      p.y += p.vy * dt; p.x += (p.vx + Math.sin(p.sw) * .6) * dt;
      if (p.y > H + 20 || p.x > W + 30) petals[i] = spawn(false);
      drawPetal(p);
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) { size(); addEventListener('resize', size); requestAnimationFrame(frame); }

  /* --- tarifs : au mois / à l'année --- */
  function setBilling(mode) {
    $$('.billing button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.billing === mode)));
    $$('[data-monthly]').forEach((el) => { el.textContent = el.dataset[mode]; });
  }
  $$('.billing button').forEach((b) => b.addEventListener('click', () => setBilling(b.dataset.billing)));

  /* --- liens pas encore actifs --- */
  const toast = $('#toast'); let tt;
  $$('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    toast.textContent = 'Bientôt disponible : l\'ouverture de Sakurya arrive.';
    toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2600);
  }));

  /* --- liste d'attente (pas encore reliée à l'envoi d'e-mails) --- */
  const wl = $('#waitlist');
  if (wl) wl.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#wlMsg');
    if (!/^\S+@\S+\.\S+$/.test(wl.email.value.trim())) { msg.textContent = 'Indique un e-mail valide.'; wl.email.focus(); return; }
    if (!wl.rgpd.checked) { msg.textContent = 'Coche la case pour accepter l\'e-mail d\'ouverture.'; return; }
    msg.textContent = 'Formulaire en test : ton inscription n\'est pas encore enregistrée. La liste ouvre très bientôt.';
  });

  /* --- lumière qui suit la souris sur les cartes --- */
  $$('.glow-card, .card, .plan').forEach((el) => {
    el.classList.add('glow-card');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* --- boutons « magnétiques » --- */
  if (!reduce) $$('.magnetic, .btn-primary').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  /* --- parallaxe de l'en-tête + ligne de progression du parcours --- */
  const heroBg = $('.hero-bg'), timeline = $('.timeline');
  function onScrollFx() {
    if (!reduce && scrollY < innerHeight * 1.2) heroBg.style.transform = `translateY(${scrollY * .25}px)`;
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height));
      timeline.style.setProperty('--progress', `${(p * 100).toFixed(1)}%`);
    }
  }
  addEventListener('scroll', onScrollFx, { passive: true }); onScrollFx();

  /* --- apparition douce des blocs --- */
  $$('.step-text').forEach((el, i) => el.classList.add(i % 2 ? 'from-right' : 'from-left'));
  $$('.feed, .partner-visual').forEach((el) => el.classList.add('zoom'));
  const els = $$('.step-text, .step .mock, .card, .door, .plan, .vs, .who, .faq details, .section h2, .feed, .partner-card, .extra, .ticks, .journey-steps li, .waitlist');
  els.forEach((el) => el.classList.add('reveal'));
  els.forEach((el) => {
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => els.includes(c)) : [];
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
  });
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  els.forEach((el) => io.observe(el));
})();
