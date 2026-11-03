// Gabarit commun des pages (en-tête, pied de page, balises SEO)
export const SITE = 'https://sakuragroup.fr';

export const nav = `
<header class="nav" id="nav">
  <a class="logo" href="/" aria-label="Sakura Group, accueil">SAKURA <span>GROUP</span><sup>™</sup></a>
  <nav class="nav-links" id="nav-links" aria-label="Navigation principale">
    <a href="/sites-web">Sites web</a>
    <a href="/videos">Vidéos</a>
    <a href="/accompagnement">Accompagnement</a>
    <a href="/#methode">Méthode</a>
    <a href="/blog/">Blog</a>
  </nav>
  <a class="btn btn-small magnet" href="/#contact">Demander un devis</a>
  <button class="burger" id="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="nav-links"><span></span><span></span></button>
</header>`;

export const footer = `
<footer class="footer">
  <p class="logo">SAKURA <span>GROUP</span><sup>™</sup></p>
  <p>Agence digitale à Toulouse · Entreprise immatriculée</p>
  <nav class="footer-links" aria-label="Pages du site">
    <a href="/sites-web">Sites web</a><a href="/videos">Vidéos</a><a href="/accompagnement">Accompagnement</a><a href="/blog/">Blog</a><a href="/#contact">Contact</a>
  </nav>
  <p><a href="mailto:contact@sakuragroup.fr">contact@sakuragroup.fr</a></p>
  <p class="small"><a href="/mentions-legales">Mentions légales</a> · <a href="/cgv">CGV</a></p>
  <p class="small">© 2026 Sakura Group</p>
</footer>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function page({ path, title, description, body, jsonld = [], image = '/assets/img/poster.jpg', type = 'website' }) {
  const url = SITE + path;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:locale" content="fr_FR">
<meta name="theme-color" content="#fbf4ef">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Josefin+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/pages.css">
${ld}
</head>
<body class="subpage">
<div class="progress" id="progress"></div>
<div class="cursor" id="cursor" aria-hidden="true"></div>
${nav}
<main>
${body}
</main>
${footer}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="/assets/js/config.js"></script>
<script src="/assets/js/site.js"></script>
</body>
</html>
`;
}

export const pageHero = (kicker, titleHtml, lead, crumbs) => `
<section class="page-hero">
  <div class="page-hero-glow" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <nav class="crumbs reveal-up" aria-label="Fil d'Ariane">${crumbs.map(([t, h]) => (h ? `<a href="${h}">${t}</a>` : `<span>${t}</span>`)).join('<i>/</i>')}</nav>
  <p class="kicker reveal-up">${kicker}</p>
  <h1 class="h2 page-title" data-split>${titleHtml}</h1>
  <p class="lead reveal-up">${lead}</p>
</section>`;

export const ctaBand = (title, text, offre) => `
<section class="cta-band">
  <h2 class="h2" data-split>${title}</h2>
  <p class="lead">${text}</p>
  <a class="btn magnet" href="/${offre ? '?offre=' + encodeURIComponent(offre) : ''}#contact">Parler de mon projet</a>
</section>`;

export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path }))
});

export const faqLd = (qa) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
});

export const faqHtml = (qa) => `<div class="faq">${qa.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
