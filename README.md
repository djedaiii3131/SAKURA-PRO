# Site Sakura Group (refonte)

Site HTML statique, sans dépendance à installer.

- Aperçu local : `node serve.mjs` puis http://localhost:5173 (ou `PORT=5190 node serve.mjs`).
- Réglages (e-mail, clé du formulaire, liens Stripe) : `assets/js/config.js`.
- Pages de services : modifier `_dev/build-pages.mjs`, puis `node _dev/build-pages.mjs`.
- Blog : ajouter ou modifier un article dans `_dev/articles.mjs`, puis `node _dev/build-blog.mjs` (régénère aussi `sitemap.xml` et `robots.txt`).
- `index.html` (page d'accueil) se modifie directement.
- `_ancien/` : copie de l'ancien site, à ne pas mettre en ligne.

À faire avant la mise en ligne : liens Stripe de l'accompagnement, mentions légales et conditions de vente (SIRET nécessaire).
