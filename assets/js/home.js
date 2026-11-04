/* Sakura Group — effets de la page d'accueil V2 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const small = innerWidth < 700;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / innerWidth - 0.5;
    pointer.ty = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  /* ---------- Défilement fluide (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && hasGsap && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (document.body.classList.contains('locked')) lenis.stop();
    new MutationObserver(() => {
      if (document.body.classList.contains('locked')) lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -60, duration: 1.4 });
    });
  }

  /* ---------- Monde 1 : aurore en WebGL ---------- */
  const aur = $('#aurora');
  if (aur && !reduce) {
    const gl = aur.getContext('webgl', { antialias: false, alpha: false });
    if (gl) {
      const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
        void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;p+=m*.35;
          float q=fbm(p+vec2(t*.05,t*.03));float w=fbm(p*1.3+q*2.2-vec2(t*.04,0.));
          vec3 night=vec3(.027,0.,.06);vec3 pink=vec3(1.,.24,.5);vec3 vio=vec3(.63,.42,1.);vec3 cy=vec3(.37,.95,1.);vec3 gold=vec3(.94,.78,.4);
          vec3 c=mix(night,vio,smoothstep(.35,.85,w)*.75);
          c=mix(c,pink,smoothstep(.55,.95,q*w*1.6)*.8);
          c=mix(c,cy,smoothstep(.7,1.,fbm(p*.8-t*.02))*.45);
          c+=gold*pow(smoothstep(.75,1.,w),3.)*.35;
          float band=smoothstep(.2,.0,abs(uv.y-.62-sin(uv.x*3.+t*.2)*.12))*.35;c+=mix(cy,pink,uv.x)*band;
          c*=smoothstep(1.15,.2,length((uv-vec2(.5,.45))*vec2(1.,1.3)));
          gl_FragColor=vec4(c,1.);}`;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uM = gl.getUniformLocation(prog, 'm');
        const scale = small ? 0.35 : 0.5; // rendu en basse résolution : l'aurore est floue par nature
        const size = () => { aur.width = aur.clientWidth * scale; aur.height = aur.clientHeight * scale; gl.viewport(0, 0, aur.width, aur.height); };
        size(); addEventListener('resize', size);
        let vis = true, t0 = performance.now();
        new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(aur);
        const frame = (now) => {
          if (vis) {
            gl.uniform2f(uR, aur.width, aur.height);
            gl.uniform1f(uT, (now - t0) / 1000);
            gl.uniform2f(uM, pointer.x, -pointer.y);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    }
  }

  /* ---------- Monde 1 : pétales en 3D (projection en perspective) ---------- */
  const pc = $('#petals3d');
  let scrollVel = 0;
  if (pc && !reduce) {
    const x = pc.getContext('2d');
    let W, H, dpr, vis = true;
    const N = small ? 34 : 80, F = 520;
    const P = [];
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = pc.clientWidth; H = pc.clientHeight; pc.width = W * dpr; pc.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const spawn = (p, top) => {
      p.x = (Math.random() - 0.5) * 1600; p.y = top ? -700 - Math.random() * 300 : (Math.random() - 0.5) * 1400;
      p.z = Math.random() * 1200 + 50; p.s = 10 + Math.random() * 14;
      p.rx = Math.random() * 6.28; p.ry = Math.random() * 6.28; p.rz = Math.random() * 6.28;
      p.vx = (Math.random() - 0.3) * 0.8; p.vy = 0.6 + Math.random() * 1.2; p.vr = 0.01 + Math.random() * 0.03;
      p.hue = Math.random(); return p;
    };
    size(); addEventListener('resize', size);
    for (let i = 0; i < N; i++) P.push(spawn({}, false));
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(pc);
    const draw = () => {
      if (vis) {
        x.clearRect(0, 0, W, H);
        P.sort((a, b) => b.z - a.z);
        for (const p of P) {
          p.rx += p.vr; p.ry += p.vr * 0.7; p.rz += p.vr * 0.4;
          p.x += p.vx + Math.sin(p.ry) * 0.6; p.y += p.vy + scrollVel * 0.15;
          if (p.y > 760 || p.y < -1100) spawn(p, p.y > 0);
          const z = p.z - pointer.y * 60;
          const k = F / (F + z);
          const sx = W / 2 + (p.x - pointer.x * 120 * (1 - z / 1300)) * k;
          const sy = H / 2 + p.y * k;
          const r = p.s * k * 1.6;
          if (r < 0.6) continue;
          const flip = Math.cos(p.rx), turn = Math.cos(p.ry);
          x.save();
          x.translate(sx, sy); x.rotate(p.rz);
          x.scale(Math.max(0.15, Math.abs(turn)), Math.max(0.15, Math.abs(flip)));
          x.globalAlpha = Math.min(1, 0.25 + k * 0.9);
          const g = x.createLinearGradient(0, -r, 0, r);
          if (p.hue < 0.15) { g.addColorStop(0, '#fff6d6'); g.addColorStop(1, '#f0c866'); }
          else if (p.hue < 0.25) { g.addColorStop(0, '#e9fdff'); g.addColorStop(1, '#5ef2ff'); }
          else { g.addColorStop(0, '#ffe4ec'); g.addColorStop(1, flip > 0 ? '#ff85aa' : '#ff3d7f'); }
          x.fillStyle = g;
          x.beginPath();
          x.moveTo(0, -r);
          x.bezierCurveTo(r * 0.95, -r * 0.6, r * 0.75, r * 0.7, 0, r);
          x.bezierCurveTo(-r * 0.75, r * 0.7, -r * 0.95, -r * 0.6, 0, -r);
          x.fill();
          x.restore();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* Lissage du pointeur et de la vitesse de défilement */
  let lastY = scrollY;
  const smooth = () => {
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const v = scrollY - lastY; lastY = scrollY;
    scrollVel += (v - scrollVel) * 0.2;
    $$('.chip').forEach((c) => {
      const d = +c.dataset.depth;
      c.style.transform = `translate(${pointer.x * -40 * d}px, ${pointer.y * -30 * d}px)`;
    });
    requestAnimationFrame(smooth);
  };
  if (!reduce) smooth();

  /* ---------- Monde 1 : titre qui se décode ---------- */
  const GLYPHS = '01<>/{}[]#$%&*+=?ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const scramble = (el, delay) => {
    const final = el.dataset.text;
    const dur = 900, t0 = performance.now() + delay;
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      const keep = Math.floor(p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        if (i < keep || final[i] === ' ') out += final[i];
        else out += `<span class="sc">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
      }
      el.innerHTML = p >= 1 ? final : out;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const lines = $$('[data-scramble]');
  lines.forEach((l) => { l.dataset.text = l.textContent; });
  if (!reduce) lines.forEach((l) => { l.style.visibility = 'hidden'; });
  let started = false;
  const start = () => {
    if (started) return; started = true;
    if (reduce) return;
    lines.forEach((l, i) => { l.style.visibility = ''; scramble(l, i * 260); });
    if (hasGsap) gsap.from('.chip', { opacity: 0, scale: 0.6, duration: 1.2, stagger: 0.12, delay: 0.6, ease: 'back.out(1.7)' });
  };
  document.addEventListener('sakura:start', start);
  setTimeout(() => { if (!document.body.classList.contains('locked')) start(); }, 400);

  if (!hasGsap || reduce) return;

  /* ---------- Monde 2 : le dragon avance avec le défilement ---------- */
  const vid = $('#scrub');
  // sur smartphone la section est masquée : on ne charge pas la vidéo
  if (vid && !matchMedia('(max-width: 640px)').matches) {
    vid.src = small ? vid.dataset.srcMobile : vid.dataset.src;
    vid.load();
    let target = 0, cur = 0;
    const words = $$('.vol-word');
    const tl = gsap.timeline({ paused: true });
    words.forEach((w, i) => {
      const at = i * 1;
      tl.fromTo(w, { opacity: 0, scale: 0.85, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, at)
        .to(w, { opacity: 0, scale: 1.12, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' }, at + 0.65);
    });
    const count = $('#vol-count'), bar = $('#vol-bar');
    ScrollTrigger.create({
      trigger: '#vol', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (st) => {
        target = st.progress;
        tl.progress(Math.min(1, st.progress / 0.6));
        count.textContent = String(Math.round(st.progress * 100)).padStart(3, '0');
        bar.style.transform = `scaleX(${st.progress})`;
      }
    });
    // la vidéo suit en douceur (seek limité pour rester fluide)
    gsap.ticker.add(() => {
      if (!vid.duration) return;
      cur += (target - cur) * 0.12;
      const tt = cur * (vid.duration - 0.05);
      if (Math.abs(vid.currentTime - tt) > 0.03 && !vid.seeking) vid.currentTime = tt;
    });
  }

  /* ---------- Monde 3 : les mots s'allument ---------- */
  const glow = $('#glow-text');
  if (glow) {
    const hot = ['prix', 'affiché,', 'devis', 'clair,', 'livré,', 'répond'];
    glow.innerHTML = glow.textContent.split(/\s+/).map((w) => `<span class="gw${hot.includes(w) ? ' hotw' : ''}">${w}</span>`).join(' ');
    const ws = $$('.gw', glow);
    ScrollTrigger.create({
      trigger: glow, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: (st) => {
        const n = st.progress * ws.length;
        ws.forEach((w, i) => { w.classList.toggle('on', i < n); w.classList.toggle('hot', i < n && w.classList.contains('hotw')); });
      }
    });
    $$('.widget').forEach((w) => {
      gsap.fromTo(w, { y: 80 * +w.dataset.depth, opacity: 0 }, { y: -40 * +w.dataset.depth, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#manifeste', start: 'top 70%', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Ruban : vitesse liée au défilement ---------- */
  const rib = $('#ribbon');
  if (rib) {
    let rx = 0;
    gsap.ticker.add(() => {
      rx -= 0.6 + Math.abs(scrollVel) * 0.4;
      const half = rib.scrollWidth / 2;
      if (-rx > half) rx += half;
      rib.style.transform = `translateX(${rx}px)`;
    });
  }

  /* ---------- Monde 4 : cartes empilées qui reculent ---------- */
  const cards = $$('.stack-card');
  // Les cartes sont « sticky » : on mesure la position réelle de la suivante à chaque image
  gsap.ticker.add(() => {
    const vh = innerHeight;
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const top = next.getBoundingClientRect().top;
      const stickTop = parseFloat(getComputedStyle(next).top) || 140;
      const p = Math.max(0, Math.min(1, (vh - top) / (vh - stickTop)));
      c.style.transform = `scale(${1 - p * 0.08})`;
      c.style.filter = p > 0 ? `brightness(${1 - p * 0.08})` : '';
    });
  });
  cards.forEach((c) => gsap.from($$('.sc-visual', c), { y: 60, rotate: -3, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%' } }));

  /* ---------- Reflet holographique ---------- */
  if (fine) {
    $$('.holo').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--hx', `${px * 100}%`);
        el.style.setProperty('--hy', `${py * 100}%`);
        el.style.setProperty('--hp', `${px * 100}%`);
      });
    });
  }

  /* ---------- Monde 5 : galerie horizontale sur grand écran ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1021px)', () => {
    const track = $('#reel-track');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#reel', start: 'center center', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true } });
  });
  mm.add('(max-width: 1020px)', () => {
    $$('.screen-card').forEach((s) => gsap.from(s, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 85%' } }));
  });
  $$('.phone').forEach((p) => gsap.fromTo(p, { rotateY: -18, rotateX: 8 }, { rotateY: 12, rotateX: -4, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- Monde 6 : fond du laboratoire qui tourne ---------- */
  const lab = $('.lab-bg');
  if (lab) gsap.fromTo(lab, { '--lab-a': '0deg' }, { '--lab-a': '360deg', ease: 'none', scrollTrigger: { trigger: '#estimateur', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Monde 8 : le chemin se trace ---------- */
  const fg = $('#path-fg');
  if (fg) {
    const steps = $$('.path-steps li');
    ScrollTrigger.create({
      trigger: '#path', start: 'top 65%', end: 'bottom 60%', scrub: true,
      onUpdate: (st) => {
        fg.style.strokeDashoffset = 1000 - st.progress * 1000;
        steps.forEach((s, i) => s.classList.toggle('on', st.progress >= i / steps.length));
      }
    });
  }

  /* ---------- Pied de page : le mot géant se remplit ---------- */
  const giant = $('.giant');
  if (giant) gsap.to(giant, { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom 70%', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();

/* ---------- Monde 6 : estimateur de prix (fonctionne aussi sans animations) ---------- */
(() => {
  const form = document.getElementById('lab');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const yearBox = $('lab-year'), yearWrap = $('lab-year-wrap');
  const val = (n) => form.querySelector(`input[name="${n}"]:checked`);
  const shown = { once: 0, rec: 0 };
  const animate = (el, key, to) => {
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const o = { v: shown[key] };
      gsap.to(o, { v: to, duration: 0.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); }, onComplete: () => { el.textContent = to; } });
    } else el.textContent = to;
    shown[key] = to;
  };
  let summary = '';
  const update = () => {
    const site = val('site'), acc = val('acc').value, vid = val('vid');
    const year = yearBox.checked;
    const lines = [];
    let once = +site.value + +vid.value, rec = 0, per = '';
    if (+site.value) lines.push(`${site.dataset.label} : ${site.value} €`);
    if (+vid.value) lines.push(`${vid.dataset.label} : ${vid.value} €${vid.dataset.devis ? ' (sur devis)' : ''}`);
    yearWrap.classList.toggle('off', acc === 'none' || acc === 'host');
    if (acc === 'host') { rec = 20; per = ' / an'; lines.push('Hébergement + nom de domaine : 20 €/an'); }
    if (acc === 'ess') { rec = year ? 390 : 39; per = year ? ' / an' : ' / mois'; lines.push(`Accompagnement Essentiel : ${rec} €${per}`); }
    if (acc === 'pro') { rec = year ? 590 : 59; per = year ? ' / an' : ' / mois'; lines.push(`Accompagnement Pro : ${rec} €${per}`); }
    animate($('r-once'), 'once', once);
    animate($('r-rec'), 'rec', rec);
    $('r-rec-per').textContent = per;
    $('r-list').innerHTML = lines.length ? lines.map((l) => `<li>${l}</li>`).join('') : '<li>Choisissez vos options à gauche.</li>';
    summary = lines.length ? `Mon estimation sur le site :\n- ${lines.join('\n- ')}\nTotal à payer une fois : ${once} €${rec ? `\nEnsuite : ${rec} €${per}` : ''}\n\nMon projet : ` : '';
  };
  form.addEventListener('change', update);
  update();
  $('lab-send').addEventListener('click', () => {
    const msg = $('message'), sel = $('prestation');
    if (msg && summary && !msg.value.startsWith('Mon estimation')) msg.value = summary + msg.value;
    const site = val('site'), acc = val('acc').value;
    if (sel) {
      const want = +site.value ? site.dataset.label : acc === 'ess' ? 'Accompagnement Essentiel' : acc === 'pro' ? 'Accompagnement Pro' : '';
      const o = [...sel.options].find((x) => want && x.text.startsWith(want));
      if (o) sel.value = o.value;
    }
    setTimeout(() => msg && msg.focus({ preventScroll: true }), 1500);
  });
})();
