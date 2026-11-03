// Génère les mentions légales et les CGV : node _dev/build-legal.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, pageHero, breadcrumbLd } from './layout.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = (rel, html) => { fs.writeFileSync(path.join(root, rel), html); console.log(rel); };

// Données de l'entreprise : à tenir à jour ici
const E = {
  nom: 'Jeremy Nguyen',
  commercial: 'Sakura Group',
  forme: 'Entrepreneur individuel',
  adresse: '12 rue Saint-Rome, 31000 Toulouse, France',
  siret: '902 972 504 00028',
  siren: '902 972 504',
  ape: '74.10Z — Activités spécialisées de design',
  tva: 'TVA non applicable, article 293 B du Code général des impôts',
  email: 'contact@sakuragroup.fr',
  // Médiateur de la consommation : à compléter dès qu'il est choisi (obligatoire pour vendre aux particuliers)
  mediateur: ''
};
const MAJ = '3 novembre 2026';
const mail = `<a href="mailto:${E.email}">${E.email}</a>`;
const mediateurTxt = E.mediateur
  ? `le client consommateur peut recourir gratuitement au médiateur de la consommation suivant : ${E.mediateur}.`
  : `le client consommateur peut recourir gratuitement à un médiateur de la consommation, dont les coordonnées seront précisées sur cette page.`;

/* ======================= MENTIONS LÉGALES ======================= */
write('mentions-legales.html', page({
  path: '/mentions-legales',
  title: 'Mentions légales et confidentialité | Sakura Group',
  description: 'Mentions légales du site sakuragroup.fr : éditeur, hébergeur, propriété intellectuelle, données personnelles et cookies.',
  jsonld: [breadcrumbLd([['Accueil', '/'], ['Mentions légales', '/mentions-legales']])],
  body: `
${pageHero('Informations légales', 'Mentions légales<br><em>et confidentialité.</em>', `Dernière mise à jour : ${MAJ}.`, [['Accueil', '/'], ['Mentions légales']])}
<article class="prose">
<h2>Éditeur du site</h2>
<p>Le site <strong>sakuragroup.fr</strong> est édité par :</p>
<ul>
  <li><strong>${E.nom}</strong>, ${E.forme.toLowerCase()}, exerçant sous le nom commercial <strong>${E.commercial}</strong></li>
  <li>Adresse : ${E.adresse}</li>
  <li>SIRET : ${E.siret} — SIREN : ${E.siren}</li>
  <li>Code APE : ${E.ape}</li>
  <li>${E.tva}</li>
  <li>E-mail : ${mail}</li>
</ul>
<p>Directeur de la publication : ${E.nom}.</p>

<h2>Hébergeur</h2>
<p>GitHub, Inc. (service GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis — <a href="https://github.com" rel="noopener">github.com</a>.</p>

<h2>Propriété intellectuelle</h2>
<p>Les textes, visuels, vidéos, logos et la mise en page de ce site appartiennent à ${E.commercial}, sauf mention contraire. Toute reproduction, totale ou partielle, sans autorisation écrite est interdite.</p>
<p>Les créations réalisées pour nos clients leur sont remises dans les conditions prévues par nos <a href="/cgv">conditions générales de vente</a>.</p>

<h2>Données personnelles</h2>
<h3>Ce que nous collectons</h3>
<p>Lorsque vous remplissez le formulaire de demande, nous recevons votre nom, votre e-mail ou votre téléphone, la prestation qui vous intéresse et votre message. Ces informations servent uniquement à répondre à votre demande et, si vous devenez client, à réaliser la prestation et à vous facturer.</p>
<h3>Qui les traite</h3>
<ul>
  <li>Le formulaire est transmis par le service <strong>Web3Forms</strong>, qui nous envoie votre demande par e-mail.</li>
  <li>Nos e-mails sont hébergés par <strong>Zoho Mail</strong>.</li>
  <li>Les paiements sont gérés par <strong>Stripe</strong> : nous n'avons jamais accès à vos coordonnées bancaires.</li>
</ul>
<p>Nous ne vendons ni ne louons vos données.</p>
<h3>Combien de temps</h3>
<p>Les demandes sans suite sont conservées au maximum 3 ans après notre dernier échange. Les données liées à une prestation (devis, factures) sont conservées pendant la durée imposée par la loi pour les documents comptables.</p>
<h3>Vos droits</h3>
<p>Vous pouvez demander l'accès, la rectification, l'effacement ou la limitation de vos données, ou vous opposer à leur traitement, en écrivant à ${mail}. Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>

<h2>Cookies</h2>
<p>Ce site n'utilise <strong>aucun cookie publicitaire ni de mesure d'audience</strong>. Il mémorise seulement, dans votre navigateur et pour la durée de votre visite, que l'intro vidéo a déjà été vue, afin de ne pas vous la remontrer.</p>
<p>Les polices d'écriture sont chargées depuis Google Fonts et les animations depuis cdnjs (Cloudflare) : comme pour toute page web, ces services reçoivent l'adresse IP de votre appareil pour vous envoyer les fichiers.</p>
</article>
`
}));

/* ======================= CGV ======================= */
write('cgv.html', page({
  path: '/cgv',
  title: 'Conditions générales de vente | Sakura Group',
  description: 'Conditions générales de vente de Sakura Group : création de sites web, vidéos IA, UGC IA, flyers animés et accompagnement (abonnement mensuel ou annuel).',
  jsonld: [breadcrumbLd([['Accueil', '/'], ['CGV', '/cgv']])],
  body: `
${pageHero('Informations légales', 'Conditions générales<br><em>de vente.</em>', `Dernière mise à jour : ${MAJ}.`, [['Accueil', '/'], ['CGV']])}
<article class="prose">
<h2>1. Qui sommes-nous</h2>
<p>Les présentes conditions s'appliquent aux prestations vendues par <strong>${E.nom}</strong>, ${E.forme.toLowerCase()} exerçant sous le nom commercial <strong>${E.commercial}</strong>, ${E.adresse}, SIRET ${E.siret}, ci-après « Sakura Group ». Contact : ${mail}.</p>
<p>Elles s'appliquent à tout client, professionnel ou particulier (« consommateur »). Toute commande vaut acceptation des présentes conditions.</p>

<h2>2. Prestations</h2>
<ul>
  <li><strong>Création de sites web</strong> : site vitrine simple (jusqu'à 5 pages), site motion design, site avec boutique intégrée (jusqu'à 20 produits, paiement par Stripe sur le compte du client).</li>
  <li><strong>Vidéos et visuels</strong> : vidéo IA à la demande (1 minute maximum), vidéo UGC IA réalisée avec un avatar IA, flyer animé.</li>
  <li><strong>Accompagnement</strong> : formules Essentiel et Pro, au mois ou à l'année (article 8).</li>
  <li><strong>Option hébergement</strong> : hébergement et nom de domaine pour un site acheté sans accompagnement, 20 € par an.</li>
</ul>
<p>Le contenu exact de chaque prestation est décrit sur le site et, pour toute prestation sur devis, dans le devis remis au client.</p>

<h2>3. Prix</h2>
<p>Les prix sont indiqués en euros. ${E.tva} : les prix affichés sont donc les prix à payer, sans TVA en plus.</p>
<p>Les prestations « sur devis » (vidéo UGC IA, flyer animé, demandes sur mesure) indiquent un prix de départ ; le prix définitif figure dans le devis, accepté avant tout paiement.</p>

<h2>4. Commande</h2>
<p>La commande se fait à partir du formulaire du site ou par e-mail. Sakura Group adresse au client un devis ou un récapitulatif (prestation, prix, délai). La commande est ferme dès l'acceptation du devis par le client et la réception du paiement.</p>

<h2>5. Paiement</h2>
<p>Le paiement se fait en ligne par carte bancaire via <strong>Stripe</strong>, au moyen d'un lien de paiement sécurisé :</p>
<ul>
  <li>paiement <strong>unique</strong> pour la création de site, les vidéos, les flyers et les packs ;</li>
  <li>paiement <strong>récurrent</strong> (mensuel ou annuel) pour l'accompagnement.</li>
</ul>
<p>Sakura Group n'a jamais accès aux coordonnées bancaires du client. Une facture est envoyée après chaque paiement. La prestation commence après réception du paiement.</p>

<h2>6. Délais et contenus</h2>
<p>Le délai de réalisation est en général de <strong>3 jours ouvrés au maximum</strong>, à compter de la réception du paiement <strong>et</strong> de tous les contenus nécessaires (textes, logo, photos, informations sur les produits…). Le délai exact est confirmé dans le devis.</p>
<p>Un retard dans l'envoi des contenus par le client décale d'autant la livraison. Le client garantit qu'il dispose des droits sur les contenus qu'il fournit.</p>

<h2>7. Validation et livraison</h2>
<p>Pour un site, une première version est présentée au client sur une adresse de test. Le client fait part de ses retours, qui sont intégrés dans la limite de ce qui a été prévu au devis. Une demande qui sort du devis (nouvelle page, nouvelle fonctionnalité) fait l'objet d'un devis complémentaire.</p>
<p>Le site est ensuite mis en ligne et ses fichiers sont remis au client. Les vidéos et flyers sont livrés sous forme de fichiers prêts à publier.</p>

<h2>8. Accompagnement (abonnement)</h2>
<ul>
  <li><strong>Essentiel</strong> : 39 € par mois ou 390 € par an. Hébergement et nom de domaine, maintenance et sauvegardes, modifications illimitées, réponse sous 72 heures.</li>
  <li><strong>Pro</strong> : 59 € par mois ou 590 € par an. Tout l'Essentiel, réponse sous 24 heures, un flyer animé offert par mois, un bilan mensuel des visites du site.</li>
</ul>
<p><strong>Modifications.</strong> Est une modification : le changement d'un texte, d'une photo, d'un prix, d'un horaire, l'ajout ou le retrait d'une section, la mise à jour d'un produit. Une refonte complète ou la création d'une nouvelle page entière fait l'objet d'un devis à part.</p>
<p><strong>Formule mensuelle.</strong> Sans engagement. Le client peut l'arrêter à tout moment, par e-mail ou depuis son <a href="https://billing.stripe.com/p/login/14AeVdaV6cybfre0WbefC00" rel="noopener">espace abonné Stripe</a> ; l'arrêt prend effet à la fin du mois déjà payé.</p>
<p><strong>Formule annuelle.</strong> Payée d'avance pour 12 mois et renouvelée à l'échéance sauf arrêt demandé par le client. Le client consommateur est informé par e-mail, au plus tôt trois mois et au plus tard un mois avant l'échéance, de la possibilité de ne pas renouveler, conformément à l'article L.215-1 du Code de la consommation.</p>
<p><strong>Fin de l'accompagnement.</strong> Sakura Group transfère au client son nom de domaine (code de transfert) et lui remet les fichiers de son site.</p>

<h2>9. Nom de domaine et propriété</h2>
<p>Le nom de domaine du client est enregistré à son nom. À réception du paiement complet, le client peut utiliser librement le site, les vidéos et les visuels créés pour lui, y compris à des fins publicitaires. Sakura Group peut présenter la réalisation dans son portfolio, sauf refus écrit du client.</p>

<h2>10. Vidéos réalisées avec l'IA</h2>
<p>Les vidéos IA et UGC IA sont créées avec des outils d'intelligence artificielle ; les vidéos UGC IA sont jouées par des avatars IA et non par de vraies personnes. Le client s'engage à ne pas les présenter comme des témoignages de vrais clients et à les signaler comme contenus générés par IA lorsqu'il les publie, conformément aux règles des plateformes.</p>

<h2>11. Droit de rétractation (clients consommateurs)</h2>
<p>Le client consommateur dispose d'un délai de 14 jours à compter de la commande pour se rétracter, en écrivant à ${mail}, sans avoir à se justifier.</p>
<p>Toutefois, conformément à l'article L.221-28 du Code de la consommation, ce droit ne peut pas être exercé pour :</p>
<ul>
  <li>une prestation de services pleinement exécutée avant la fin du délai, lorsque le client a demandé expressément qu'elle commence avant la fin du délai et a reconnu perdre son droit de rétractation ;</li>
  <li>la fourniture d'un contenu ou d'un bien nettement personnalisé, réalisé selon les demandes du client (site, vidéo ou visuel sur mesure).</li>
</ul>
<p>Si le client demande que la prestation commence avant la fin du délai et se rétracte ensuite, il paie la part de la prestation déjà réalisée.</p>

<h2>12. Responsabilité</h2>
<p>Sakura Group s'engage à réaliser les prestations avec soin. Sakura Group n'est pas responsable du contenu fourni par le client, des résultats commerciaux obtenus, ni des interruptions dues aux prestataires tiers (hébergement, Stripe, plateformes). Sakura Group ne garantit aucun résultat en nombre de ventes, de clients ou de vues.</p>

<h2>13. Données personnelles</h2>
<p>Les données du client sont traitées comme décrit dans nos <a href="/mentions-legales">mentions légales</a>.</p>

<h2>14. Réclamations et litiges</h2>
<p>Toute réclamation est à adresser à ${mail}. En cas de litige non résolu à l'amiable, ${mediateurTxt} Le client peut aussi saisir les tribunaux compétents. Les présentes conditions sont soumises au droit français.</p>
</article>
`
}));
