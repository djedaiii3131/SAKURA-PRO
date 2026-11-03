/* Sakura Group — animations et interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.SAKURA || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!window.gsap;
  document.documentElement.classList.add('js');
  if ('scrollRestoration' in history && !location.hash) history.scrollRestoration = 'manual';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* stockage indisponible */ } }
  };

  /* ---------- Découpage du texte (lettres / mots) ---------- */
  $$('.hero-title [data-split]').forEach((line) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((c) => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c === ' ' ? ' ' : c;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(line);
  });
  $$('.h2[data-split]').forEach((h) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const o = document.createElement('span'); o.className = 'wd';
            const i = document.createElement('span'); i.textContent = w;
            o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeName !== 'BR') walk(n);
      });
    };
    walk(h);
  });
  const manifeste = $('#manifeste-text');
  if (manifeste) {
    manifeste.innerHTML = manifeste.textContent.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  }

  /* ---------- Intro (une fois par visite) ---------- */
  const intro = $('#intro');
  const introVideo = $('#intro-video');
  let introDone = false;
  const startPage = () => {
    document.dispatchEvent(new Event('sakura:start')); // la page d'accueil V2 lance ses effets ici
    if (!hasGsap || reduce) { $$('.reveal-up').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    if ($('.hero-title .ch')) tl.from('.hero-title .ch', { yPercent: 115, rotate: 8, duration: 1.4, stagger: 0.028 });
    tl.to('.hero .reveal-up, .page-hero .reveal-up', { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, $('.hero-title .ch') ? '-=1.0' : 0.2)
      .from('.nav', { y: -30, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, '-=1.1');
  };
  const endIntro = () => {
    if (introDone) return;
    introDone = true;
    store.set('sakura-intro', '1');
    document.body.classList.remove('locked');
    if (hasGsap && !reduce) {
      gsap.to(intro, {
        clipPath: 'circle(0% at 50% 50%)', duration: 1.3, ease: 'expo.inOut',
        onComplete: () => { intro.classList.add('gone'); introVideo.pause(); }
      });
      gsap.delayedCall(0.55, startPage);
    } else {
      intro.classList.add('gone'); introVideo.pause(); startPage();
    }
  };
  if (intro) {
    if (reduce || store.get('sakura-intro') || location.hash) { // pas d'intro si on arrive sur une section précise
      intro.classList.add('gone');
      startPage();
    } else {
      document.body.classList.add('locked');
      intro.style.clipPath = 'circle(150% at 50% 50%)';
      introVideo.addEventListener('ended', endIntro);
      introVideo.addEventListener('error', endIntro);
      $('#intro-skip').addEventListener('click', endIntro);
      const p = introVideo.play();
      if (p && p.catch) p.catch(endIntro);
      setTimeout(endIntro, 9000); // filet de sécurité
    }
  } else startPage();

  /* ---------- Transition entre les pages (voile de pétales) ---------- */
  if (!reduce) {
    const veil = document.createElement('div');
    veil.className = 'page-veil';
    veil.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(veil);
    const lift = () => veil.classList.add('out');
    requestAnimationFrame(lift); setTimeout(lift, 120);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || a.target || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      if (/.(pdf|mp4|jpg|png|webp)$/i.test(url.pathname)) return;
      e.preventDefault();
      veil.classList.remove('out');
      veil.classList.add('in');
      setTimeout(() => { location.href = a.href; }, 520);
    });
    addEventListener('pageshow', (e) => { if (e.persisted) { veil.classList.remove('in'); veil.classList.add('out'); } });
  }

  /* ---------- Pétales de cerisier ---------- */
  const cv = $('#petals');
  if (cv && !reduce) {
    const x = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, mx = 0, visible = true;
    const N = innerWidth < 700 ? 26 : 54;
    const petals = [];
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (p, top) => {
      p.x = Math.random() * W; p.y = top ? -20 - Math.random() * H * 0.3 : Math.random() * H;
      p.s = 6 + Math.random() * 12; p.vy = 0.35 + Math.random() * 0.9; p.vx = -0.2 + Math.random() * 0.6;
      p.r = Math.random() * Math.PI * 2; p.vr = (Math.random() - 0.5) * 0.04;
      p.f = Math.random() * Math.PI * 2; p.gold = Math.random() < 0.18;
      return p;
    };
    resize();
    for (let i = 0; i < N; i++) petals.push(spawn({}, false));
    addEventListener('resize', resize);
    addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; });
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(cv);
    const draw = (p) => {
      x.save();
      x.translate(p.x, p.y); x.rotate(p.r);
      x.scale(1, Math.abs(Math.cos(p.f)) * 0.7 + 0.3);
      const g = x.createLinearGradient(0, -p.s, 0, p.s);
      if (p.gold) { g.addColorStop(0, 'rgba(255,241,200,.95)'); g.addColorStop(1, 'rgba(240,200,102,.55)'); }
      else { g.addColorStop(0, 'rgba(255,214,226,.95)'); g.addColorStop(1, 'rgba(255,133,170,.6)'); }
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(0, -p.s);
      x.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.7, p.s * 0.7, 0, p.s);
      x.bezierCurveTo(-p.s * 0.7, p.s * 0.7, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
      x.fill();
      x.restore();
    };
    const tick = () => {
      if (visible) {
        x.clearRect(0, 0, W, H);
        for (const p of petals) {
          p.f += 0.03; p.r += p.vr;
          p.x += p.vx + Math.sin(p.f) * 0.5 + mx * 0.6;
          p.y += p.vy;
          if (p.y > H + 30 || p.x < -40 || p.x > W + 40) spawn(p, true);
          draw(p);
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------- Barre de progression + navigation ---------- */
  const bar = $('#progress');
  const nav = $('#nav');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('solid', scrollY > 40);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const links = $('#nav-links');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('locked', open);
  });
  $$('a', links).forEach((a) => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
    nav.classList.remove('menu-open');
    document.body.classList.remove('locked');
  }));

  /* ---------- Curseur, boutons aimantés, cartes 3D ---------- */
  if (fine && !reduce) {
    const cur = $('#cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    const loop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
    $$('a, button, summary, .tilt').forEach((el) => {
      el.addEventListener('pointerenter', () => cur.classList.add('big'));
      el.addEventListener('pointerleave', () => cur.classList.remove('big'));
    });
    $$('.magnet').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = `rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(0)`;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Animations au défilement ---------- */
  if (hasGsap && window.ScrollTrigger && !reduce) {
    if ($('.hero')) gsap.to('.hero-video', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if ($('.hero')) gsap.to('.hero-inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    $$('.h2[data-split]').forEach((h) => {
      gsap.from($$('.wd > span', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: h, start: 'top 85%' } });
    });
    $$('.section .kicker, .section .lead, .note, .switch, .promises > div, .contact-mail').forEach((el) => {
      gsap.from(el, { y: 26, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('.cards, .vgrid, .plans').forEach((g) => {
      gsap.from(g.children, { y: 80, opacity: 0, rotateX: -12, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: g, start: 'top 82%' } });
    });
    $$('.reveal-up').filter((e) => !e.closest('.hero, .page-hero')).forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, delay: (i % 4) * 0.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    if ($('.faq')) gsap.from('.faq details', { y: 20, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.faq', start: 'top 85%' } });
    if ($('.form')) gsap.from('.form', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 85%' } });

    // Manifeste : les mots s'allument au fil du défilement
    if (manifeste) {
      const words = $$('.w', manifeste);
      ScrollTrigger.create({
        trigger: manifeste, start: 'top 75%', end: 'bottom 40%', scrub: true,
        onUpdate: (st) => { const n = Math.round(st.progress * words.length); words.forEach((w, i) => { w.style.opacity = i < n ? 1 : 0.14; }); }
      });
    }

    // Méthode : défilement horizontal épinglé sur grand écran
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1021px)', () => {
      const track = $('#method-track');
      if (!track) return;
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#methode', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true }
      });
    });
    mm.add('(max-width: 1020px)', () => {
      $$('.step').forEach((s) => gsap.from(s, { x: -40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 88%' } }));
    });
  } else {
    $$('.reveal-up').forEach((e) => { e.style.opacity = 1; e.style.transform = 'none'; });
    if (manifeste) $$('.w', manifeste).forEach((w) => { w.style.opacity = 1; });
  }

  /* ---------- Accompagnement : au mois / à l'année ---------- */
  const sw = $('.switch');
  let period = 'mois';
  if (sw) {
  const placeThumb = () => {
    const on = $('[aria-checked="true"]', sw);
    const th = $('.switch-thumb', sw);
    th.style.left = on.offsetLeft + 'px';
    th.style.width = on.offsetWidth + 'px';
  };
  const planLinks = () => {
    const s = CFG.stripe || {};
    $$('[data-plan]').forEach((a) => {
      const url = s[a.dataset.plan + (period === 'mois' ? 'Mois' : 'An')];
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.removeAttribute('data-prestation'); }
      else {
        const name = 'Accompagnement ' + (a.dataset.plan === 'pro' ? 'Pro' : 'Essentiel');
        a.href = ($('#contact') ? '' : '/?offre=' + encodeURIComponent(name)) + '#contact';
        a.removeAttribute('target');
        a.dataset.prestation = name;
      }
    });
  };
  const setPeriod = (p) => {
    period = p;
    $$('button', sw).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.period === p)));
    placeThumb();
    $$('.amount').forEach((el) => {
      const to = +el.dataset[p];
      if (hasGsap && !reduce) {
        const o = { v: +el.textContent };
        gsap.to(o, { v: to, duration: 0.7, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); }, onComplete: () => { el.textContent = to; } });
      } else el.textContent = to;
    });
    $$('.per').forEach((el) => { el.textContent = p === 'mois' ? 'mois' : 'an'; });
    $$('.plan-eq').forEach((el) => { el.textContent = el.dataset[p]; });
    planLinks();
  };
  $$('button', sw).forEach((b) => b.addEventListener('click', () => setPeriod(b.dataset.period)));
  addEventListener('resize', placeThumb);
  document.fonts?.ready.then(placeThumb);
  placeThumb();
  planLinks();
  }

  /* ---------- Boutons d'offre : présélection dans le formulaire ---------- */
  const select = $('#prestation');
  // Lien depuis une autre page : /?offre=…#contact présélectionne la prestation
  const offre = new URLSearchParams(location.search).get('offre');
  if (select && offre) { const o = [...select.options].find((x) => x.text.startsWith(offre)); if (o) select.value = o.value; }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-prestation]');
    if (!a || !select) return;
    const want = a.dataset.prestation === 'Accompagnement Essentiel' || a.dataset.prestation === 'Accompagnement Pro'
      ? a.dataset.prestation + (period === 'an' ? ' (à l\'année)' : ' (au mois)')
      : a.dataset.prestation;
    const opt = [...select.options].find((o) => o.text === a.dataset.prestation);
    if (opt) select.value = opt.value;
    select.dataset.detail = want;
  });

  /* ---------- Formulaire (Web3Forms → contact@sakuragroup.fr) ---------- */
  const form = $('#form');
  const status = $('#form-status');
  const btn = $('#form-btn');
  const setStatus = (msg, ok) => { status.textContent = msg; status.className = 'form-status ' + (ok ? 'ok' : 'err'); };
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.sent) return;
    let bad = false;
    $$('[required]', form).forEach((f) => {
      const empty = !f.value.trim();
      f.setAttribute('aria-invalid', String(empty));
      if (empty) bad = true;
    });
    if (bad) { setStatus('Merci de remplir votre nom, un moyen de vous contacter et votre projet.', false); return; }
    if (form.botcheck.checked) return;
    if (!CFG.formKey) { setStatus(`Le formulaire n'est pas encore actif : écrivez-nous à ${CFG.email || 'contact@sakuragroup.fr'}.`, false); return; }
    const d = Object.fromEntries(new FormData(form));
    const prestation = select.dataset.detail && select.dataset.detail.startsWith(d.prestation.split(' (')[0]) ? select.dataset.detail : d.prestation;
    const payload = {
      access_key: CFG.formKey,
      subject: `Nouvelle demande Sakura Group — ${prestation}`,
      from_name: 'Site Sakura Group',
      Nom: d.nom,
      Contact: d.contact,
      Prestation: prestation,
      Message: d.message,
      Page: location.pathname
    };
    if (/@/.test(d.contact)) payload.replyto = d.contact.trim();
    btn.disabled = true;
    setStatus('Envoi en cours…', true);
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.success) throw new Error();
      form.dataset.sent = '1';
      btn.hidden = true;
      setStatus('Merci, votre demande est bien envoyée ! On vous répond très vite.', true);
    } catch {
      setStatus(`L'envoi n'a pas fonctionné : réessayez, ou écrivez-nous à ${CFG.email || 'contact@sakuragroup.fr'}.`, false);
    } finally { btn.disabled = false; }
  });
})();
