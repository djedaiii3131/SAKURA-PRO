// Génère les pages de services : node _dev/build-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, pageHero, ctaBand, breadcrumbLd, faqLd, faqHtml } from './layout.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = (rel, html) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); console.log(rel); };

const offer = ({ tag, name, price, priceNote, intro, inc, pour, offre, feature }) => `
<article class="offer${feature ? ' offer-feature' : ''}">
  <div class="offer-side">
    <p class="card-tag${feature ? ' gold' : ''}">${tag}</p>
    <h2 class="offer-name">${name}</h2>
    <p class="price"><span class="from">${priceNote}</span> ${price}</p>
    <a class="btn" href="/?offre=${encodeURIComponent(offre)}#contact">Demander un devis</a>
  </div>
  <div class="offer-body">
    <p class="offer-intro">${intro}</p>
    <div class="offer-cols">
      <div><h3>Ce qui est inclus</h3><ul class="ticks">${inc.map((i) => `<li>${i}</li>`).join('')}</ul></div>
      <div><h3>Pour qui&nbsp;?</h3><p>${pour}</p></div>
    </div>
  </div>
</article>`;

const steps = (list) => `<ol class="steps-list">${list.map(([t, d], i) => `<li class="reveal-up"><span class="step-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>`;

/* ======================= SITES WEB ======================= */
const sitesFaq = [
  ['Qu\'est-ce que je dois fournir ?', 'Vos textes (ou les grandes idées, on vous aide à les rédiger), votre logo si vous en avez un, vos photos et vos coordonnées. Si vous n\'avez pas de photos, on en parle ensemble au moment du devis.'],
  ['Combien de temps faut-il pour créer mon site ?', 'En général 3 jours ouvrés au maximum, une fois le paiement reçu et tous vos contenus envoyés (textes, logo, photos). Le délai exact est confirmé dans votre devis.'],
  ['Qui héberge mon site ?', 'Le site vous est livré avec ses fichiers. Vous pouvez l\'héberger où vous voulez, nous confier l\'hébergement et le nom de domaine pour 20 € par an, ou prendre l\'accompagnement Essentiel ou Pro, qui les inclut.'],
  ['Le nom de domaine m\'appartient-il ?', 'Oui. Votre nom de domaine est enregistré à votre nom. Si vous changez de prestataire, il part avec vous.'],
  ['Comment fonctionne la boutique intégrée ?', 'Vos clients paient par carte via Stripe, et l\'argent arrive sur votre propre compte Stripe. La boutique comprend jusqu\'à 20 produits ; au-delà, on adapte le devis. Si vous avez besoin d\'une autre solution de paiement, on en parle.'],
  ['Puis-je modifier mon site après la livraison ?', 'Oui. Les modifications sont illimitées avec l\'accompagnement Essentiel ou Pro. Sans accompagnement, chaque demande fait l\'objet d\'un petit devis.']
];
write('sites-web.html', page({
  path: '/sites-web',
  title: 'Création de site web à Toulouse — vitrine, motion design, boutique | Sakura Group',
  description: 'Création de site vitrine dès 200 €, site motion design à 499 €, site avec boutique et paiement Stripe à 699 €. Agence digitale à Toulouse, entreprise immatriculée.',
  jsonld: [
    breadcrumbLd([['Accueil', '/'], ['Sites web', '/sites-web']]),
    faqLd(sitesFaq),
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Création de site web', provider: { '@type': 'Organization', name: 'Sakura Group', url: 'https://sakuragroup.fr' }, areaServed: 'France',
      offers: [['Site vitrine simple', 200], ['Site motion design', 499], ['Site + boutique intégrée', 699]].map(([n, p]) => ({ '@type': 'Offer', name: n, price: p, priceCurrency: 'EUR' })) }
  ],
  body: `
${pageHero('Création de sites web', 'Un site qui vous ressemble,<br><em>de l\'idée à la mise en ligne.</em>', 'Trois formules claires, un prix payé une seule fois, et un site adapté au mobile, mis en ligne par nos soins.', [['Accueil', '/'], ['Sites web']])}
<section class="section offers">
${offer({ tag: 'L\'essentiel', name: 'Site vitrine simple', price: '200 <small>€</small>', priceNote: 'Création, paiement unique', offre: 'Site vitrine simple',
  intro: 'Le site qu\'il vous faut pour être trouvé, présenter votre activité et recevoir des demandes. Propre, rapide, efficace.',
  inc: ['Jusqu\'à 5 pages (accueil, services, à propos, contact…)', 'Design sur mesure à vos couleurs', 'Adapté au mobile et à la tablette', 'Formulaire de contact relié à votre e-mail', 'Mise en ligne incluse', 'Fichiers du site remis à la livraison'],
  pour: 'Artisans, coiffeurs, coachs, restaurants, indépendants : toute activité qui a besoin d\'une présence en ligne sérieuse sans complication.' })}
${offer({ tag: 'Notre signature', name: 'Site motion design', price: '499 <small>€</small>', priceNote: 'Création, paiement unique', offre: 'Site motion design', feature: true,
  intro: 'Un site haut de gamme qui bouge : intro animée, transitions, éléments qui apparaissent au défilement. Le genre de site dont on se souvient.',
  inc: ['Intro et transitions animées', 'Animations au défilement (apparitions, parallaxe, effets 3D)', 'Design haut de gamme sur mesure', 'Adapté au mobile, animations allégées sur téléphone', 'Formulaire de contact et mise en ligne', 'Fichiers du site remis à la livraison'],
  pour: 'Les marques, créateurs, agences, artistes et entreprises qui veulent se démarquer et donner une image premium dès la première seconde.' })}
${offer({ tag: 'Pour vendre', name: 'Site + boutique intégrée', price: '699 <small>€</small>', priceNote: 'Création, paiement unique', offre: 'Site + boutique intégrée',
  intro: 'Votre site vitrine et votre boutique en ligne réunis. Vos clients commandent et paient par carte, l\'argent arrive sur votre compte.',
  inc: ['Tout le site vitrine', 'Boutique jusqu\'à 20 produits (plus sur demande)', 'Paiement par carte via Stripe, sur votre propre compte', 'Fiches produits avec photos, prix et description', 'Adapté au mobile', 'Mise en ligne et prise en main expliquée'],
  pour: 'Créateurs, marques de vêtements, cosmétiques, artisans et commerces qui veulent vendre en ligne sans abonnement à une plateforme de boutique.' })}
<p class="note">Option : hébergement + nom de domaine pour 20&nbsp;€/an. Ou <a href="/accompagnement">l'accompagnement</a>, qui inclut hébergement, maintenance et modifications illimitées.</p>
</section>

<section class="section">
  <div class="section-head">
    <p class="kicker">Étape par étape</p>
    <h2 class="h2" data-split>De votre demande<br><em>à la livraison.</em></h2>
    <p class="lead">Voici exactement comment se passe la création de votre site. Pas de surprise, pas de jargon.</p>
  </div>
  ${steps([
    ['Vous nous écrivez', 'Via le formulaire : votre activité, ce que vous voulez, des sites que vous aimez. Quelques lignes suffisent.'],
    ['On échange', 'On vous répond pour préciser votre besoin : nombre de pages, style, fonctionnalités, nom de domaine.'],
    ['Vous recevez un devis clair', 'Le prix, ce qui est inclus et le délai. Rien n\'est payé tant que vous n\'avez pas validé.'],
    ['Paiement sécurisé', 'Vous payez par lien Stripe. Vous recevez votre facture.'],
    ['Vous envoyez vos contenus', 'Textes, logo, photos, coordonnées. On vous aide à rédiger si besoin.'],
    ['Création de la maquette', 'On construit votre site et on vous montre une première version en ligne, sur une adresse de test.'],
    ['Vos retours', 'Vous nous dites ce que vous voulez changer. On ajuste.'],
    ['Mise en ligne', 'On branche votre nom de domaine et votre site est visible par tous. Le formulaire est testé avec vous.'],
    ['Livraison', 'On vous remet les fichiers du site. Si vous le souhaitez, l\'accompagnement prend le relais pour l\'hébergement et les modifications.']
  ])}
</section>

<section class="section">
  <div class="section-head"><p class="kicker">Questions</p><h2 class="h2" data-split>Avant de<br><em>vous lancer.</em></h2></div>
  ${faqHtml(sitesFaq)}
</section>
${ctaBand('Votre site,<br><em>on en parle&nbsp;?</em>', 'Décrivez votre projet en quelques lignes. On vous répond avec la formule adaptée et un devis clair.', 'Je ne sais pas encore')}
`
}));

/* ======================= VIDÉOS ======================= */
const videosFaq = [
  ['Les vidéos UGC sont-elles faites avec de vraies personnes ?', 'Non. Nos vidéos UGC sont réalisées avec des avatars IA, et nous l\'annonçons clairement. Quand vous les publiez, signalez-les comme contenu généré par IA, comme le demandent TikTok, Instagram et les autres réseaux.'],
  ['Une vidéo IA dure combien de temps ?', 'Une minute maximum pour la vidéo IA à la demande. Pour un format plus long, demandez un devis.'],
  ['Que dois-je fournir ?', 'Votre idée, votre texte ou votre offre, votre logo et vos couleurs, et des exemples de vidéos que vous aimez. Pour une vidéo produit, des photos du produit.'],
  ['Pourquoi « sur devis » pour l\'UGC IA et le flyer animé ?', 'Parce que chaque demande est différente : durée, nombre de scènes, texte, format. Le prix de départ est affiché, et vous recevez le prix exact avant de payer.'],
  ['Dans quels formats je reçois mes vidéos ?', 'En vertical 9:16 pour TikTok, Reels et Shorts par défaut. Un autre format (carré, horizontal) est possible, à préciser dans votre demande.'],
  ['Puis-je utiliser les vidéos pour des publicités ?', 'Oui, les vidéos que nous créons pour vous peuvent être utilisées sur vos réseaux et dans vos publicités.']
];
write('videos.html', page({
  path: '/videos',
  title: 'Vidéo IA, UGC IA et flyer animé pour vos réseaux | Sakura Group Toulouse',
  description: 'Vidéo IA dès 25 € (pack de 10 à 150 €), vidéo UGC IA avec avatar dès 70 €, flyer animé dès 49 €. Contenus verticaux pour TikTok, Reels et vos publicités.',
  jsonld: [
    breadcrumbLd([['Accueil', '/'], ['Vidéos', '/videos']]),
    faqLd(videosFaq),
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Création de vidéos IA et visuels animés', provider: { '@type': 'Organization', name: 'Sakura Group', url: 'https://sakuragroup.fr' }, areaServed: 'France',
      offers: [['Vidéo IA à la demande', 25], ['Pack 10 vidéos IA', 150], ['Vidéo UGC IA (à partir de)', 70], ['Pack 3 vidéos UGC IA', 140], ['Flyer animé (à partir de)', 49], ['Pack 3 flyers animés', 129]].map(([n, p]) => ({ '@type': 'Offer', name: n, price: p, priceCurrency: 'EUR' })) }
  ],
  body: `
${pageHero('Vidéos & visuels', 'Du contenu qui arrête<br><em>le pouce.</em>', 'Nous sommes une agence IA. Nos vidéos sont créées avec l\'intelligence artificielle, et on vous le dit clairement.', [['Accueil', '/'], ['Vidéos']])}
<section class="section offers">
${offer({ tag: 'Le plus demandé', name: 'Vidéo IA à la demande', price: '25 <small>€</small>', priceNote: 'La vidéo · pack de 10 à 150 €', offre: 'Vidéo IA à la demande',
  intro: 'Vous avez une idée, on la transforme en vidéo IA d\'une minute maximum, prête à publier.',
  inc: ['Vidéo d\'une minute maximum', 'Format vertical pour TikTok, Reels, Shorts', 'Créée à partir de votre idée ou de votre texte', 'Pack de 10 vidéos à 150 €, soit 15 € la vidéo'],
  pour: 'Créateurs de contenu, commerces, marques qui veulent publier régulièrement sans y passer leurs soirées.' })}
${offer({ tag: 'Pour vos pubs', name: 'Vidéo UGC IA', price: '70 <small>€</small>', priceNote: 'À partir de, sur devis · pack de 3 à 140 €', offre: 'Vidéo UGC IA', feature: true,
  intro: 'Une vidéo façon « avis client » ou présentation produit, jouée par un avatar IA. Le format qui marche sur les réseaux, sans tournage.',
  inc: ['Script écrit avec vous', 'Avatar IA qui présente votre produit ou service', 'Sous-titres et format vertical', 'Annoncée comme contenu IA, en toute transparence', 'Pack de 3 vidéos à 140 €'],
  pour: 'Boutiques en ligne, marques et entreprises qui veulent tester des publicités vidéo sans engager d\'acteurs.' })}
${offer({ tag: 'Pour vos annonces', name: 'Flyer animé', price: '49 <small>€</small>', priceNote: 'À partir de, sur devis · pack de 3 à 129 €', offre: 'Flyer animé',
  intro: 'Votre promo, votre événement ou votre nouvelle offre en visuel animé, qui se remarque dans un fil d\'actualité.',
  inc: ['Visuel animé à vos couleurs', 'Votre texte, vos prix, vos infos pratiques', 'Format vertical ou carré', 'Pack de 3 flyers à 129 €'],
  pour: 'Restaurants, salons, boutiques, organisateurs d\'événements, associations.' })}
</section>

<section class="section">
  <div class="section-head">
    <p class="kicker">Étape par étape</p>
    <h2 class="h2" data-split>De votre idée<br><em>à la vidéo livrée.</em></h2>
  </div>
  ${steps([
    ['Vous décrivez votre besoin', 'Via le formulaire : ce que vous voulez montrer, le ton, le réseau visé, des exemples.'],
    ['Devis et validation', 'Vidéo IA : prix fixe. UGC IA et flyer animé : vous recevez le prix exact avant de payer.'],
    ['Paiement sécurisé', 'Par lien Stripe. Vous recevez votre facture.'],
    ['Création', 'On écrit le script ou le texte avec vous, puis on crée la vidéo.'],
    ['Vos retours', 'Vous regardez la vidéo et nous dites ce qu\'il faut ajuster.'],
    ['Livraison', 'Vous recevez le fichier final, prêt à publier.']
  ])}
</section>

<section class="section">
  <div class="section-head"><p class="kicker">Questions</p><h2 class="h2" data-split>Ce qu'on<br><em>nous demande.</em></h2></div>
  ${faqHtml(videosFaq)}
</section>
${ctaBand('Une idée de vidéo&nbsp;?<br><em>On la crée.</em>', 'Décrivez votre idée, votre produit ou votre promo. On vous répond rapidement.', 'Vidéo IA à la demande')}
`
}));

/* ======================= ACCOMPAGNEMENT ======================= */
const accFaq = [
  ['Qu\'est-ce qu\'une « modification » ?', 'Changer un texte, une photo, un prix, un horaire, ajouter ou retirer une section, mettre à jour un produit. Une refonte complète ou une nouvelle page entière fait l\'objet d\'un devis à part.'],
  ['Comment j\'arrête l\'accompagnement ?', 'Au mois, vous arrêtez quand vous voulez, en un clic depuis <a href="https://billing.stripe.com/p/login/14AeVdaV6cybfre0WbefC00" rel="noopener">votre espace abonné</a> : l\'arrêt prend effet à la fin du mois déjà payé. À l\'année, les 12 mois sont payés d\'avance. Dans les deux cas, on vous transfère votre nom de domaine et les fichiers de votre site.'],
  ['Mon site n\'a pas été créé par vous, je peux quand même m\'abonner ?', 'Oui, l\'accompagnement se prend aussi seul. On regarde d\'abord votre site ensemble pour vérifier qu\'on peut le reprendre.'],
  ['Comment je demande une modification ?', 'Par e-mail ou via le formulaire. On vous répond sous 72 h avec l\'Essentiel et sous 24 h avec le Pro.'],
  ['Comment se passe le paiement ?', 'Par abonnement Stripe sécurisé, au mois ou à l\'année. Une facture vous est envoyée à chaque paiement.'],
  ['Que contient le bilan des visites (Pro) ?', 'Chaque mois, un court résumé : combien de personnes ont visité votre site, les pages les plus vues et d\'où viennent vos visiteurs.']
];
const plan = (name, m, a, inc, key, pro) => `
<article class="plan${pro ? ' plan-pro' : ''} tilt">
  ${pro ? '<p class="plan-badge">Le plus complet</p>' : ''}
  <h3>${name}</h3>
  <p class="plan-price"><b class="amount" data-mois="${m}" data-an="${a}">${m}</b> <small>€ / <span class="per">mois</span></small></p>
  <p class="plan-eq" data-mois="Sans engagement, arrêt à tout moment" data-an="Soit 12 mois pour le prix de 10">Sans engagement, arrêt à tout moment</p>
  <ul class="ticks">${inc.map((i) => `<li>${i}</li>`).join('')}</ul>
  <a class="btn btn-card" data-plan="${key}" href="/?offre=${encodeURIComponent('Accompagnement ' + name)}#contact">Choisir ${name}</a>
</article>`;
write('accompagnement.html', page({
  path: '/accompagnement',
  title: 'Accompagnement et maintenance de site web dès 39 €/mois | Sakura Group',
  description: 'Hébergement, nom de domaine, maintenance, sauvegardes et modifications illimitées : Essentiel 39 €/mois ou 390 €/an, Pro 59 €/mois ou 590 €/an. Sans engagement au mois.',
  jsonld: [
    breadcrumbLd([['Accueil', '/'], ['Accompagnement', '/accompagnement']]),
    faqLd(accFaq),
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Maintenance et accompagnement de site web', provider: { '@type': 'Organization', name: 'Sakura Group', url: 'https://sakuragroup.fr' }, areaServed: 'France',
      offers: [['Essentiel au mois', 39], ['Essentiel à l\'année', 390], ['Pro au mois', 59], ['Pro à l\'année', 590]].map(([n, p]) => ({ '@type': 'Offer', name: n, price: p, priceCurrency: 'EUR' })) }
  ],
  body: `
${pageHero('Accompagnement', 'On s\'occupe de votre site,<br><em>vous de votre activité.</em>', 'Hébergement, maintenance, sauvegardes et modifications illimitées. Au mois sans engagement, ou à l\'année avec 2 mois offerts.', [['Accueil', '/'], ['Accompagnement']])}
<section class="section">
  <div class="switch" role="radiogroup" aria-label="Période de paiement">
    <button type="button" role="radio" aria-checked="true" data-period="mois">Au mois</button>
    <button type="button" role="radio" aria-checked="false" data-period="an">À l'année <span class="pill">2 mois offerts</span></button>
    <span class="switch-thumb" aria-hidden="true"></span>
  </div>
  <div class="plans">
    ${plan('Essentiel', 39, 390, ['Hébergement + nom de domaine', 'Maintenance et sauvegardes', 'Modifications du site illimitées', 'Réponse sous 72 h'], 'essentiel')}
    ${plan('Pro', 59, 590, ['Tout l\'Essentiel', '<b>Réponse sous 24 h</b>', '<b>1 flyer animé offert par mois</b>', '<b>Petit bilan des visites du site chaque mois</b>'], 'pro', true)}
  </div>
  <div class="promises">
    <div><b>Votre domaine vous appartient.</b> Il est enregistré à votre nom.</div>
    <div><b>Vous partez quand vous voulez.</b> On vous transfère le domaine et les fichiers du site.</div>
    <div><b>Déjà un site&nbsp;?</b> L'accompagnement se prend aussi seul.</div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <p class="kicker">Concrètement</p>
    <h2 class="h2" data-split>Ce que l'on fait<br><em>pour vous chaque mois.</em></h2>
  </div>
  <div class="why-grid">
    <div class="why-item reveal-up"><span>✿</span><h3>Hébergement</h3><p>Votre site reste en ligne, sur un hébergement que l'on gère pour vous, avec votre nom de domaine.</p></div>
    <div class="why-item reveal-up"><span>✿</span><h3>Maintenance</h3><p>On vérifie que le site fonctionne, que le formulaire envoie bien les demandes et que tout s'affiche correctement.</p></div>
    <div class="why-item reveal-up"><span>✿</span><h3>Sauvegardes</h3><p>Une copie de votre site est conservée. En cas de problème, on le remet en place.</p></div>
    <div class="why-item reveal-up"><span>✿</span><h3>Modifications</h3><p>Nouveau prix, nouvelle photo, nouvel horaire : vous demandez, on modifie. Sans limite de nombre.</p></div>
  </div>
</section>

<section class="section">
  <div class="section-head"><p class="kicker">Questions</p><h2 class="h2" data-split>Tout savoir sur<br><em>l'accompagnement.</em></h2></div>
  ${faqHtml(accFaq)}
</section>
${ctaBand('Un site à faire<br><em>vivre&nbsp;?</em>', 'Dites-nous où vous en êtes : site à créer, site existant, ou simples modifications. On vous oriente vers la bonne formule.', 'Accompagnement Essentiel')}
`
}));
