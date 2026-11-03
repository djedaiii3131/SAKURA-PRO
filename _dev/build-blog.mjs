// Génère le blog, le plan du site et robots.txt : node _dev/build-blog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, pageHero, ctaBand, breadcrumbLd, SITE } from './layout.mjs';
import { articles } from './articles.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = (rel, txt) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); console.log(rel); };
const DATE = '2026-11-03';
const dateFr = '3 novembre 2026';
const org = { '@type': 'Organization', name: 'Sakura Group', url: SITE };

write('blog/index.html', page({
  path: '/blog/',
  title: 'Blog Sakura Group — conseils sites web, vidéos IA et réseaux sociaux',
  description: 'Conseils concrets pour entrepreneurs : prix d\'un site vitrine, nom de domaine, maintenance, vente en ligne avec Stripe, vidéos UGC IA et flyers animés.',
  jsonld: [breadcrumbLd([['Accueil', '/'], ['Blog', '/blog/']]), { '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog Sakura Group', url: SITE + '/blog/', publisher: org }],
  body: `
${pageHero('Le blog', 'Des conseils clairs,<br><em>sans jargon.</em>', 'Sites web, vidéos, réseaux sociaux : ce qu\'il faut savoir avant de se lancer, expliqué simplement.', [['Accueil', '/'], ['Blog']])}
<section class="section blog-grid">
${articles.map((a) => `  <a class="post-card reveal-up" href="/blog/${a.slug}">
    <p class="card-tag">${a.cat} · ${a.read} min</p>
    <h2>${a.title}</h2>
    <p>${a.description}</p>
    <span class="link-arrow">Lire l'article →</span>
  </a>`).join('\n')}
</section>
${ctaBand('Un projet<br><em>en tête&nbsp;?</em>', 'Site, vidéo ou accompagnement : décrivez votre besoin, on vous répond avec un devis clair.')}
`
}));

articles.forEach((a, i) => {
  const others = articles.filter((b) => b !== a).slice(i % 3, (i % 3) + 3);
  write(`blog/${a.slug}.html`, page({
    path: `/blog/${a.slug}`,
    title: `${a.title} | Sakura Group`,
    description: a.description,
    type: 'article',
    jsonld: [
      breadcrumbLd([['Accueil', '/'], ['Blog', '/blog/'], [a.title, `/blog/${a.slug}`]]),
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.description, datePublished: DATE, dateModified: DATE, author: org, publisher: org, mainEntityOfPage: `${SITE}/blog/${a.slug}`, inLanguage: 'fr-FR' }
    ],
    body: `
${pageHero(a.cat, a.title, a.description, [['Accueil', '/'], ['Blog', '/blog/'], [a.cat]])}
<article class="prose">
  <p class="post-meta">Publié le ${dateFr} · ${a.read} min de lecture · Sakura Group</p>
${a.html}
</article>
<section class="section blog-grid">
${others.map((b) => `  <a class="post-card reveal-up" href="/blog/${b.slug}">
    <p class="card-tag">${b.cat} · ${b.read} min</p>
    <h2>${b.title}</h2>
    <span class="link-arrow">Lire l'article →</span>
  </a>`).join('\n')}
</section>
${ctaBand('On s\'occupe<br><em>de votre projet&nbsp;?</em>', 'Décrivez votre activité et ce que vous voulez. On vous répond rapidement.')}
`
  }));
});

const urls = ['/', '/sites-web', '/videos', '/accompagnement', '/mentions-legales', '/cgv', '/blog/', ...articles.map((a) => `/blog/${a.slug}`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${DATE}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /_dev/\nDisallow: /_ancien/\n\nSitemap: ${SITE}/sitemap.xml\n`);
