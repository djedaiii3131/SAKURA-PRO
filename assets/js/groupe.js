/* Sakura Group : bouton « en une fois / au mois » sur les offres de sites */
(() => {
  'use strict';
  const sw = document.querySelector('.pay-switch');
  if (!sw) return;
  const set = (mode) => {
    sw.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.pay === mode)));
    sw.dataset.mode = mode;
    document.querySelectorAll('#sites [data-once]').forEach((el) => { el.innerHTML = mode === 'month' ? el.dataset.month : el.dataset.once; });
  };
  sw.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.pay); });
  set('once');
})();

/* Sakura Group : guide « Quelle offre est faite pour vous ? » */
(() => {
  'use strict';
  const form = document.getElementById('guide');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const val = (n) => (form.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const OFFERS = {
    pack: {
      name: 'Pack Commerçant connecté', for: 'Resto, snack, commerce qui livre',
      once: ['590 €', ' / an'], month: ['59 €', ' / mois'],
      why: 'Votre site avec votre carte, et un bouton « Commander » relié à Allô La Flem, qui livre vos clients.',
      list: ['Site + boutique avec vos produits', 'Bouton « Commander » relié à Allô La Flem', 'Domaine, hébergement et modifications inclus'],
      noteOnce: 'Payé à l\'année : 2 mois offerts.', noteMonth: 'Tout compris, engagement 12 mois.',
      option: 'Allô La Flem : Pack Commerçant connecté'
    },
    boutique: {
      name: 'Site boutique', for: 'Vous vendez vos produits en ligne',
      once: ['1 490 €', ''], month: ['99 €', ' / mois'],
      why: 'Une boutique à votre nom : vos clients paient par carte, l\'argent arrive sur votre compte. Sans plateforme ni commission.',
      list: ['Tout le site professionnel', 'Boutique avec vos produits', 'Paiement par carte (Stripe) sur votre compte'],
      noteOnce: 'Paiement unique, le site est à vous. Accompagnement possible en plus.', noteMonth: 'Tout compris : hébergement, nom de domaine, modifications. Engagement 24 mois.',
      option: 'Site boutique (1 490 € ou 99 €/mois)'
    },
    pro: {
      name: 'Site professionnel', for: 'Vous présentez votre activité',
      once: ['990 €', ''], month: ['69 €', ' / mois'],
      why: 'Un site sur mesure qui bouge au défilement, comme celui-ci, pour donner envie de vous appeler.',
      list: ['Design sur mesure, animations au défilement', 'Jusqu\'à 8 pages, adapté au mobile', 'Formulaire et bases du référencement Google'],
      noteOnce: 'Paiement unique, le site est à vous. Accompagnement possible en plus.', noteMonth: 'Tout compris : hébergement, nom de domaine, modifications. Engagement 24 mois.',
      option: 'Site professionnel (990 € ou 69 €/mois)'
    }
  };
  let current = null, mode = 'once';
  const update = () => {
    const key = val('livre') === 'oui' ? 'pack' : val('vend') === 'oui' ? 'boutique' : 'pro';
    mode = val('paie') || 'once';
    const o = OFFERS[key]; current = o;
    $('g-for').textContent = o.for;
    $('g-name').textContent = o.name;
    $('g-price').textContent = o[mode][0];
    $('g-per').textContent = o[mode][1];
    $('g-why').textContent = o.why;
    $('g-list').innerHTML = o.list.map((l) => `<li>${l}</li>`).join('');
    $('g-note').textContent = mode === 'month' ? o.noteMonth : o.noteOnce;
    const box = document.querySelector('.guide-result');
    if (box && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(box.querySelectorAll('.g-name, .g-price'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
  };
  form.addEventListener('change', update);
  update();
  $('g-send').addEventListener('click', () => {
    if (!current) return;
    const sel = document.getElementById('prestation'), msg = document.getElementById('message');
    if (sel) { const opt = [...sel.options].find((x) => x.text === current.option); if (opt) sel.value = opt.value; }
    const line = `Je suis intéressé par : ${current.name} (${current[mode][0]}${current[mode][1]}).\n\nMon projet : `;
    if (msg && !msg.value.startsWith('Je suis intéressé')) msg.value = line + msg.value;
    setTimeout(() => msg && msg.focus({ preventScroll: true }), 1500);
  });
})();

/* Sakura Group : effets d'écriture (mots qui sortent du flou, trait lumineux sous le titre de l'agence) */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const leads = document.querySelectorAll('#univers .lead, #allo-la-flem .lead, #agence .lead, #estimateur .lead, #sakurya .lead');
  leads.forEach((p) => {
    // découpe en mots sans changer le texte (les liens et le gras sont gardés)
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.className = 'fw'; s.style.setProperty('--i', i++); s.textContent = w; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(p);
    p.classList.add('fx-words');
  });
  const targets = [...leads, ...document.querySelectorAll('.agence-in')];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); }
  }), { threshold: 0.25 });
  targets.forEach((t) => io.observe(t));
})();
