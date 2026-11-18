/* Sakurya : la ville des membres (aperçu, pas encore reliée aux comptes) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 2752, H = 1536; // taille de l'image de la ville

  /* ---------- les bâtiments (coordonnées dans l'image) ---------- */
  const B = [
    { id: 'tour', x: 1076, y: 40, w: 600, h: 950, sign: [1376, 400], cls: 'big', label: 'Sakura Group', sub: 'La tour des services' },
    { id: 'cafe', x: 600, y: 820, w: 690, h: 430, sign: [925, 835], cls: 'gold', label: 'Le Café', sub: 'On discute ici' },
    { id: 'allo', x: 1700, y: 690, w: 500, h: 490, sign: [1946, 712], cls: '', label: 'Allô La Flem', sub: 'Partenaire livraison' },
    { id: 'moi', x: 373, y: 440, w: 507, h: 380, sign: [700, 805], cls: 'member', label: 'Ton entreprise', me: true },
    { id: 'membres', x: 2240, y: 570, w: 292, h: 380, sign: [2386, 585], cls: '', label: 'Les membres', sub: 'L\'annuaire des pros' }
  ];
  const METIERS = ['Tous', 'Ménage', 'Conciergerie', 'BTP', 'Peinture', 'Plomberie', 'Électricité', 'Beauté', 'Livraison', 'Web & com'];
  const GLOWS = [
    [850, 1000, 120], [1000, 1150, 140], [1130, 1095, 110], [1180, 1010, 90], // lanternes du café
    [1384, 1335, 150, 'pink'], [1930, 1340, 120], [1376, 290, 200, 'pink'], // fontaine, pont, emblème de la tour
    [560, 1240, 100], [1650, 1250, 90], [2200, 1180, 110]
  ];

  /* ---------- contenu des panneaux ---------- */
  const FLOORS = [
    ['5', 'Le Bureau Sakura Group', 'Accompagnement perso et ton site web', 'top', '/'],
    ['4', 'Les Missions', 'Les demandes de clients près de chez toi'],
    ['3', 'Le Studio', 'Site, fiche Google, logo, visuels IA'],
    ['2', 'Le Guichet', 'Statut, SIRET, déclarations, documents'],
    ['1', 'L\'École', 'Parcours, modèles, questions en direct'],
    ['RDC', 'L\'Accueil', 'Aide, nouveautés, premiers pas']
  ];
  let current = 'RDC'; // étage où se trouve le membre
  const liftHTML = () => `<div class="lift">${FLOORS.map((f, i) => `
    <button class="floor ${f[3] === 'top' ? 'top-floor' : ''} ${f[0] === current ? 'here' : ''}" data-floor="${f[0]}" ${f[4] ? `data-href="${f[4]}"` : ''} style="animation-delay:${80 + i * 60}ms">
      <span class="lvl">${f[0]}</span><span><b>${f[1]}</b><small>${f[2]}</small></span>${f[0] === current ? '<span class="here-tag">Tu es ici</span>' : `<span class="go" aria-hidden="true">${f[4] ? '↗' : '→'}</span>`}
    </button>`).join('')}</div>`;

  /* ---------- les étages : rubriques et contenu ---------- */
  const soon = '<span class="soon">Bientôt</span>';
  const ROOMS = {
    '1': {
      title: 'L\'École', lead: 'Ici, 1 leçon = 1 résultat : tu repars avec quelque chose de fait.', img: '../img/ecole',
      items: [
        { id: 'parcours', icon: '📺', label: 'Les parcours', sub: 'Par objectif et par métier', hot: [17.5, 22, 21, 28],
          html: `<p class="w-lead">Des parcours courts. Chaque leçon se termine par une action faite dans Sakurya.</p>
            <h4>Par objectif</h4>
            <div class="cards">
              <div class="c"><b>🎯 Mes 10 premiers clients en 30 jours</b>${soon}</div>
              <div class="c"><b>🚀 Me lancer en micro-entreprise de A à Z</b>${soon}</div>
              <div class="c"><b>🔄 Passer de particulier à pro (CESU → SIRET)</b>${soon}</div>
              <div class="c"><b>💶 Fixer mes prix sans me brader</b>${soon}</div>
              <div class="c"><b>⭐ Remplir mon agenda : Google, avis, bouche-à-oreille</b>${soon}</div>
              <div class="c"><b>🤖 L'IA pour mon métier</b>${soon}</div>
            </div>
            <h4>Par métier</h4>
            <div class="chips">${['Ménage', 'Conciergerie Airbnb', 'Peinture', 'Plomberie', 'Électricité', 'Livraison'].map((m) => `<span class="chip">${m}</span>`).join('')}</div>
            <p class="note">Parcours de base inclus dans l'abonnement. Formations avancées à la carte, dès 5 €.</p>` },
        { id: 'modeles', icon: '📚', label: 'La boîte à outils', sub: 'Tes contrats, à remplir toi-même', hot: [43, 21, 13.5, 36],
          html: `<p class="w-lead">Des modèles que tu remplis toi-même, question par question, puis que tu télécharges. Tous inclus dans ton abonnement, sans limite.</p>
            <h4>Tes contrats</h4>
            <div class="cards">
              <div class="c"><b>📑 Conditions générales de vente</b>${soon}</div>
              <div class="c"><b>🤝 Contrat de prestation</b>${soon}</div>
              <div class="c"><b>👷 Contrat de sous-traitance entre membres</b>${soon}</div>
              <div class="c"><b>✅ PV de réception de travaux</b>${soon}</div>
            </div>
            <h4>Si un client ne paie pas</h4>
            <div class="cards">
              <div class="c"><b>📨 Lettre de relance</b>${soon}</div>
              <div class="c"><b>⚠️ Mise en demeure</b>${soon}</div>
            </div>
            <h4>Au quotidien</h4>
            <div class="cards">
              <div class="c"><b>🧾 Attestation CESU</b>${soon}</div>
              <div class="c"><b>💬 Scripts d'appel et de SMS clients</b>${soon}</div>
            </div>
            <p class="note">Le contrat de prestation s'adapte à tous les métiers : ménage, conciergerie, chantier, livraison, jardinage, coiffure… Avant l'ouverture, les modèles seront relus par un avocat. Ce sont des modèles à remplir toi-même, pas un conseil juridique personnalisé : pour un cas particulier, demande à un avocat.</p>` },
        { id: 'live', icon: '🎙️', label: 'Questions en direct', sub: 'Une séance par mois', hot: [4, 51, 28, 37],
          html: `<p class="w-lead">Une fois par mois, Sakura Group répond en direct aux questions des membres.</p>
            <div class="box"><b>Prochaine séance</b><p>La date sera annoncée à l'ouverture de Sakurya.</p></div>
            <button class="btn" data-soon>Poser ma question</button>` }
      ]
    },
    '2': {
      title: 'Le Guichet', lead: 'L\'administratif, on le fait avec toi.', img: '../img/guichet',
      items: [
        { id: 'creer', icon: '🚀', label: 'Créer ma micro-entreprise', sub: 'Pas à pas, en 20 minutes', hot: [22.5, 50, 19, 44],
          html: `<p class="w-lead">Un formulaire guidé, étape par étape, avec à chaque fois le bon lien officiel.</p>
            <ol class="steps"><li>Ton activité et ton adresse</li><li>Ta déclaration sur le guichet officiel</li><li>Ton numéro SIRET</li><li>Ton compte bancaire pro</li><li>Ton assurance</li></ol>
            <p class="note">Pour un particulier : le passage du CESU au SIRET.</p><button class="btn" data-soon>Commencer</button>` },
        { id: 'calendrier', icon: '📅', label: 'Mes obligations', sub: 'Déclarations et rappels', hot: [37, 23, 24, 27],
          html: `<p class="w-lead">Tes déclarations URSSAF, ta CFE… avec un rappel avant chaque date.</p>
            <div class="box"><b>Ta déclaration URSSAF</b><p>Un rappel avant chaque date, avec le lien direct vers le site de l'URSSAF.</p></div>
            <div class="box"><b>⚠️ Alertes de plafond</b><p>Tu es prévenu quand tu approches du plafond de la micro-entreprise ou de la fin de la franchise de TVA.</p></div>` },
        { id: 'coffre', icon: '🗂️', label: 'Mon coffre-fort', sub: 'Tous mes documents pros', hot: [1, 18, 20, 70],
          html: `<p class="w-lead">Avis SIRET, attestation URSSAF, assurance, diplômes : tout est rangé, avec un rappel avant expiration.</p>
            <div class="box"><b>📤 Mon dossier pro en un clic</b><p>Envoie ton dossier complet à un client ou à un syndic.</p></div>
            <div class="box"><b>✔ Badge « Pro vérifié »</b><p>SIRET vérifié et assurance à jour : un badge s'affiche dans l'annuaire.</p></div>` },
        { id: 'aides', icon: '💰', label: 'Mes aides', sub: 'ACRE, aides de la région', hot: [56, 54, 10, 21],
          html: `<p class="w-lead">Réponds à 3 questions et vois les aides auxquelles tu as droit (ACRE, aides de la région Occitanie…).</p><button class="btn" data-soon>Faire le test</button>` },
        { id: 'factures', icon: '🧾', label: 'Mes factures', sub: 'Une solution gratuite et agréée',
          html: `<p class="w-lead">Sakurya ne fait pas tes factures, et c'est voulu : il existe des solutions gratuites agréées par l'État pour la facture électronique.</p>
            <div class="box"><b>Notre conseil : Tiime</b><p>Gratuit et agréé par l'État : tu reçois et tu envoies tes factures électroniques, et tu fais tes devis et factures sans limite. Sakura Group l'utilise aussi. Ce n'est pas un partenariat : on te le conseille parce que c'est gratuit et simple.</p></div>
            <div class="box"><b>Les dates à retenir</b><p>Recevoir des factures électroniques : obligatoire depuis le 1er septembre 2026. Envoyer tes factures à tes clients pros : à partir du 1er septembre 2027 pour les micro-entreprises.</p></div>
            <a class="btn" href="https://www.tiime.fr/" target="_blank" rel="noopener">Découvrir Tiime ↗</a>` },
        { id: 'partenaires', icon: '🏦', label: 'Banque et assurance', sub: 'Offres partenaires', hot: [68, 51, 6, 25],
          html: `<p class="w-lead">Des offres négociées pour les membres : compte pro, RC Pro, décennale.</p>
            <div class="box"><b>Partenaires</b><p>Les partenaires seront annoncés à l'ouverture.</p></div>` }
      ]
    },
    '3': {
      title: 'Le Studio', lead: 'On te rend visible : site, Google, image, contenus.', img: '../img/studio',
      items: [
        { id: 'site', icon: '🌐', label: 'Mon site web', sub: 'Commandé en 3 clics', hot: [24, 47, 27, 41],
          html: `<p class="w-lead">Choisis un modèle, remplis tes infos, et Sakura Group le livre. Tu suis l'avancement en direct.</p>
            <ol class="steps"><li>Choix du modèle</li><li>Tes infos : métier, photos, zone</li><li>En création</li><li>En relecture</li><li>En ligne 🎉</li></ol>
            <div class="box"><b>Prix</b><p>Pro : site vitrine offert. Essentiel et particuliers : tarif membre.</p></div><button class="btn" data-soon>Commander mon site</button>` },
        { id: 'google', icon: '⭐', label: 'Ma fiche Google', sub: 'Créée ou optimisée pour toi', hot: [40, 23, 21, 24],
          html: `<p class="w-lead">Photos, horaires, catégories, mots-clés : ta fiche Google, là où les clients cherchent un artisan en premier.</p><button class="btn" data-soon>La faire optimiser</button>` },
        { id: 'image', icon: '🎨', label: 'Mon image', sub: 'Logo, cartes, flyers, véhicule', hot: [51.5, 57, 22, 28],
          html: `<p class="w-lead">Logo, cartes de visite, flyers, marquage de véhicule, tenue brodée.</p><div class="box"><b>Impression</b><p>Avec des imprimeurs partenaires.</p></div>` },
        { id: 'atelier', icon: '🤖', label: 'L\'atelier IA', sub: 'Posts, visuels, vidéos', hot: [2, 30, 22, 42],
          html: `<p class="w-lead">Crée toi-même, en quelques clics :</p>
            <div class="cards"><div class="c"><b>📱 Posts Facebook et Instagram</b>${soon}</div><div class="c"><b>🏷️ Visuels promo</b>${soon}</div><div class="c"><b>📸 Photos de chantier en avant/après</b>${soon}</div><div class="c"><b>🎬 Petites vidéos pour TikTok</b>${soon}</div></div>
            <p class="note">Quota mensuel : plus grand en Pro.</p>` },
        { id: 'pack', icon: '🎁', label: 'Le pack Lancement', sub: 'Tout en une offre', hot: [74.5, 63, 10, 32],
          html: `<p class="w-lead">Site + fiche Google + logo + 3 vidéos, en une seule offre au tarif membre.</p><button class="btn" data-soon>Voir le pack</button>` }
      ]
    },
    '4': {
      title: 'Les Missions', lead: 'Les chantiers près de chez toi. 0 % de commission.', img: '../img/missions',
      items: [
        { id: 'demandes', icon: '📍', label: 'Le tableau des demandes', sub: 'Filtré par métier et zone', hot: [8.5, 10, 39.5, 47],
          html: `<p class="w-lead">Les demandes publiées par les clients, filtrées selon ton métier et ta zone. Les urgentes en tête.</p>
            <div class="mission example"><span class="tag-ex">Exemple</span><span class="tag-urg">Urgent</span><b>Peintre pour 2 chambres</b><small>Colomiers · cette semaine</small><button class="btn btn-sm" data-soon>Répondre</button></div>
            <div class="empty"><b>Les premières demandes arrivent</b><p>Dès l'ouverture, les vraies demandes des clients s'affichent ici.</p></div>` },
        { id: 'repondre', icon: '⚡', label: 'Répondre en 1 clic', sub: 'Un message prêt pour le client', hot: [1, 58, 35, 30],
          html: `<p class="w-lead">Tu cliques sur « Répondre » : un message est préparé à partir de la demande, avec tes disponibilités et ta zone. Tu ajustes et tu envoies.</p><div class="box"><b>Pourquoi c'est important</b><p>Le premier qui répond bien gagne souvent le chantier.</p></div>` },
        { id: 'sous', icon: '🤝', label: 'Sous-traitance', sub: 'Se passer du travail entre pros', hot: [49, 55, 32, 32],
          html: `<p class="w-lead">« Trop de travail, qui prend ce chantier ? » ou « Il me faut un électricien pour finir. » Les membres se passent du travail.</p>
            <div class="box"><b>👷 Équipes d'un jour</b><p>Pour un gros chantier, plusieurs métiers répondent ensemble au même client.</p></div>` },
        { id: 'alertes', icon: '🔔', label: 'Mes alertes', sub: 'Notification ou SMS', hot: [50, 25, 10, 20],
          html: `<p class="w-lead">Reçois une alerte dès qu'une mission tombe dans ton métier et ta zone.</p><button class="btn" data-soon>Régler mes alertes</button>` }
      ]
    },
    'RDC': {
      title: 'L\'Accueil', lead: 'Bienvenue. L\'ascenseur t\'emmène à chaque service.', items: []
    },
    /* ton bâtiment : ton bureau (toi seul le vois) */
    'moi': {
      title: 'Ton bureau', where: 'Ton entreprise · Ton bureau', own: true, img: '../img/bureau',
      items: [
        { id: 'fiche', icon: '📇', label: 'Ma fiche pro', sub: 'Ce que les autres voient de toi', hot: [1.5, 44, 12.5, 51],
          html: `<p class="w-lead">C'est ta fiche dans l'annuaire « Les membres ». Les autres membres et les clients qui cherchent un pro la voient là-bas, avec un bouton pour te contacter.</p>
            <div class="fiche example"><span class="tag-ex">Aperçu</span>
              <div class="fiche-top"><span class="avatar" aria-hidden="true">TP</span><span><b>Ton entreprise</b><small>Ton prénom · Ton métier · Ta ville</small></span></div>
              <p class="fiche-line">Tes services et tes prix</p>
              <p class="fiche-line">Tes photos de chantier</p>
              <p class="fiche-line">Les avis de tes clients</p>
              <span class="btn btn-sm fiche-contact" aria-hidden="true">Contacter</span>
            </div>
            <h4>À remplir</h4>
            <ol class="steps"><li>Le nom de ton enseigne (il s'affiche aussi sur ton bâtiment)</li><li>Ton métier et ta zone</li><li>Tes services et tes prix</li><li>Tes photos</li><li>Tes avis clients</li></ol>
            <button class="btn" data-soon>Modifier ma fiche</button>` },
        { id: 'secretaire', icon: '☎️', label: 'Ma secrétaire IA', sub: 'Offre Pro · elle répond pour toi', hot: [35, 50, 18.5, 34],
          html: `<p class="w-lead">Tu es sur un chantier et ton téléphone sonne ? Elle répond à ta place, au nom de ton entreprise.</p>
            <div class="box"><b>Ce qu'elle fait</b><ul><li>Elle décroche quand tu ne peux pas</li><li>Elle note le nom, le numéro et le besoin du client</li><li>Elle t'envoie un résumé de l'appel</li></ul></div>
            <div class="box"><b>Pour qui</b><p>Incluse dans l'offre Pro.</p></div>
            <button class="btn" data-soon>L'activer</button>` },
        { id: 'demandes', icon: '📬', label: 'Mes demandes', sub: 'Appels, clients, vues de ta fiche', hot: [56, 22, 21, 31.5],
          html: `<p class="w-lead">Ton mois en un coup d'œil : tout ce qui t'amène des clients.</p>
            <div class="stats-grid">
              <div class="stat"><small>Appels reçus</small><b>—</b></div>
              <div class="stat"><small>Demandes de clients</small><b>—</b></div>
              <div class="stat"><small>Vues de ta fiche</small><b>—</b></div>
              <div class="stat"><small>Réponses envoyées</small><b>—</b></div>
            </div>
            <div class="empty"><b>Rien pour l'instant</b><p>Tes chiffres s'affichent ici dès ton premier appel ou ta première demande.</p></div>` },
        { id: 'badges', icon: '🏆', label: 'Mes badges', sub: 'Gagnés à l\'École et au Guichet', hot: [82.5, 27, 17, 25],
          html: `<p class="w-lead">Tes badges s'affichent sur ta fiche dans l'annuaire. Et ton bâtiment s'embellit à chaque parcours terminé.</p>
            <div class="cards">
              <div class="c"><b>✔ Pro vérifié</b><span class="soon">À gagner</span></div>
              <div class="c"><b>🎓 Premier parcours</b><span class="soon">À gagner</span></div>
              <div class="c"><b>⭐ Premiers avis</b><span class="soon">À gagner</span></div>
              <div class="c"><b>📇 Fiche complète</b><span class="soon">À gagner</span></div>
            </div>
            <p class="note">« Pro vérifié » : SIRET vérifié et assurance à jour, au Guichet (étage 2 de la tour).</p>` }
      ]
    }
  };
  const PANELS = {
    tour: () => ({
      kicker: 'Tour Sakura Group', title: 'Bienvenue dans la tour',
      lead: 'Chaque étage, un service. Choisis ton étage, l\'ascenseur t\'y emmène.',
      body: liftHTML()
    }),
    cafe: () => ({
      kicker: 'Le Café', title: 'Le Café des membres',
      lead: 'Ici on discute, on s\'entraide et on se passe des missions entre pros.',
      body: `
        <div class="salon"><b># entraide</b><span>Poser une question</span></div>
        <div class="salon"><b># bons-plans</b><span>Fournisseurs, astuces</span></div>
        <div class="salon"><b># missions</b><span>Se passer du travail</span></div>
        <div class="salon"><b># toulouse</b><span>Les membres du coin</span></div>
        <button class="btn" data-soon>Entrer au Café</button>
        <p class="note">Les salons ouvrent avec les premiers membres.</p>`
    }),
    allo: () => ({
      kicker: 'Partenaire', title: 'Allô La Flem',
      lead: 'Livraison et conciergerie de proximité, partenaire de Sakurya pour le Sud.',
      body: `
        <div class="box"><b>Commerçants</b><p>Faire livrer tes clients près de chez toi.</p></div>
        <div class="box"><b>Livreurs indépendants</b><p>Trouver des courses autour de toi.</p></div>
        <div class="box"><b>Clients</b><p>Te faire livrer ou rendre service.</p></div>
        <a class="btn" href="https://allo-laflemme.fr/" target="_blank" rel="noopener">Découvrir Allô La Flem ↗</a>
        <p class="note">Présentation complète bientôt, en cours de validation avec Allô La Flem.</p>`
    }),
    moi: () => ({
      kicker: 'Ton entreprise', title: 'Ton bureau',
      lead: 'Ici, c\'est chez toi : toi seul vois ce bâtiment. Les autres te trouvent dans « Les membres ».',
      body: roomBody('moi')
    }),
    membres: () => ({
      kicker: 'L\'annuaire', title: 'Les membres de Sakurya',
      lead: 'Trouve un pro, un associé ou un sous-traitant, par métier et par ville.',
      body: `
        <label class="search"><span class="sr">Rechercher</span><input type="search" placeholder="Un métier, un nom, une ville…"></label>
        <div class="chips">${METIERS.map((m, i) => `<button class="chip${i ? '' : ' on'}">${m}</button>`).join('')}</div>
        <div class="empty">
          <b>Les premiers membres arrivent</b>
          <p>Dès l'ouverture, chaque pro inscrit apparaît ici avec son métier, sa ville et un bouton pour le contacter. On commence par Toulouse et ses environs.</p>
        </div>`
    })
  };

  /* ---------- construire la ville ---------- */
  const viewport = $('#viewport'), world = $('#world'), spots = $('#spots'), glows = $('#glows');
  world.style.width = W + 'px'; world.style.height = H + 'px';
  const pct = (v, t) => (v / t * 100) + '%';
  B.forEach((b) => {
    const s = document.createElement('button');
    s.className = 'spot'; s.dataset.id = b.id;
    s.setAttribute('aria-label', b.label);
    Object.assign(s.style, { left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H) });
    const sign = document.createElement('div');
    sign.className = 'sign ' + b.cls;
    sign.style.left = pct(b.sign[0], W); sign.style.top = pct(b.sign[1], H);
    sign.innerHTML = `<b>${b.me ? '<i class="dot"></i>' : ''}${b.label}</b>${b.sub ? `<small>${b.sub}</small>` : ''}${b.me ? '<small>Ton prénom</small>' : ''}`;
    s.addEventListener('pointerenter', () => sign.classList.add('hot'));
    s.addEventListener('pointerleave', () => sign.classList.remove('hot'));
    spots.append(s, sign);
  });
  GLOWS.forEach(([x, y, r, c], i) => {
    const g = document.createElement('i');
    g.className = 'glow' + (c ? ' ' + c : '');
    Object.assign(g.style, { left: pct(x, W), top: pct(y, H), width: r * 2 + 'px', height: r * 2 + 'px', animationDelay: `-${i * .7}s` });
    glows.append(g);
  });

  /* ---------- caméra : remplir l'écran, glisser, zoomer ---------- */
  const cam = { s: 1, x: 0, y: 0 };
  let base = 1, focused = null;
  const panelW = () => (innerWidth > 760 ? Math.min(420, innerWidth) : 0);
  function clamp() {
    const vw = innerWidth - (focused ? panelW() : 0), vh = innerHeight;
    cam.x = Math.min(0, Math.max(vw - W * cam.s, cam.x));
    cam.y = Math.min(0, Math.max(vh - H * cam.s, cam.y));
  }
  function apply() {
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    world.style.setProperty('--inv', (1 / cam.s).toFixed(4));
  }
  function fit(centerX = W * .5, centerY = H * .55) {
    base = Math.max(innerWidth / W, innerHeight / H);
    cam.s = base;
    cam.x = innerWidth / 2 - centerX * cam.s;
    cam.y = innerHeight / 2 - centerY * cam.s;
    clamp(); apply();
  }
  function travel(fn) {
    if (!reduce) world.classList.add('travel');
    fn(); apply();
    clearTimeout(travel.t); travel.t = setTimeout(() => world.classList.remove('travel'), 1150);
  }
  fit();
  addEventListener('resize', () => { if (focused) focus(focused, false); else fit(); });

  // glisser pour se déplacer
  let drag = null, moved = false;
  viewport.addEventListener('pointerdown', (e) => {
    if (focused) return;
    drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; moved = false;
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    moved = true; viewport.classList.add('dragging');
    cam.x = drag.cx + dx; cam.y = drag.cy + dy; clamp(); apply();
  });
  addEventListener('pointerup', () => { drag = null; viewport.classList.remove('dragging'); });

  /* ---------- entrer dans un bâtiment ---------- */
  const panel = $('#panel');
  function focus(b, animate = true) {
    const z = Math.max(base * 1.7, Math.min(innerWidth / (b.w * 1.9), innerHeight / (b.h * 1.6)));
    const s = Math.min(z, base * 2.6);
    const free = innerWidth - panelW();
    const go = () => {
      cam.s = s;
      cam.x = free / 2 - (b.x + b.w / 2) * s;
      cam.y = innerHeight * (innerWidth > 760 ? .5 : .32) - (b.y + b.h / 2) * s;
      clamp();
    };
    animate ? travel(go) : (go(), apply());
  }
  /* intérieurs déjà prêts (les autres arrivent) */
  const INSIDE = { tour: { img: '../img/hall', where: 'Tour Sakura Group · Rez-de-chaussée, l\'Accueil' }, moi: { room: 'moi' } };
  const inside = $('#inside'), insideImg = $('#insideImg');
  let insideTimer;
  function enter(id) {
    const it = INSIDE[id]; if (!it) return false;
    if (it.room) { current = it.room; setRoomImage(it.room); }
    else {
      insideImg.src = it.img + (innerWidth > 1700 ? '.webp' : '-1600.webp');
      $('#insideWhere').textContent = it.where;
    }
    clearTimeout(insideTimer);
    insideTimer = setTimeout(() => { inside.classList.add('on'); inside.setAttribute('aria-hidden', 'false'); }, reduce ? 0 : 750);
    return true;
  }
  function leave() {
    clearTimeout(insideTimer);
    const was = inside.classList.contains('on');
    inside.classList.remove('on'); inside.setAttribute('aria-hidden', 'true');
    return was;
  }
  function open(id) {
    const b = B.find((x) => x.id === id); if (!b) return;
    if (focused && focused.id !== id) leave();
    closeWin(); current = 'RDC'; hots.innerHTML = ''; inside.classList.remove('placeholder', 'narrow');
    focused = b; focus(b);
    const p = PANELS[id]();
    $('#pKicker').textContent = p.kicker; $('#pTitle').textContent = p.title; $('#pLead').textContent = p.lead;
    $('#pBody').innerHTML = p.body;
    const inDelay = enter(id) && !reduce ? 1000 : 0;
    setTimeout(() => { if (focused === b) { panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); } }, inDelay);
    $('#hint').classList.add('hide');
    setTimeout(() => $('#close').focus({ preventScroll: true }), inDelay + 400);
  }
  function closePanel() {
    if (!focused) return;
    const b = focused; focused = null;
    closeWin(); current = 'RDC'; hots.innerHTML = ''; inside.classList.remove('placeholder', 'narrow');
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    const wasInside = leave();
    setTimeout(() => travel(() => { base = Math.max(innerWidth / W, innerHeight / H); cam.s = base; cam.x = innerWidth / 2 - (b.x + b.w / 2) * base; cam.y = innerHeight / 2 - (b.y + b.h / 2) * base; clamp(); }), wasInside && !reduce ? 500 : 0);
  }

  /* ascenseur : les portes se ferment, l'étage défile, elles se rouvrent */
  const doors = $('#doors'), doorFloor = $('#doorFloor');
  const ORDER = ['RDC', '1', '2', '3', '4', '5'];
  let riding = false;
  function ride(target) {
    if (riding || target === current) return;
    riding = true; closeWin();
    doorFloor.textContent = current;
    doors.classList.add('closed');
    const a = ORDER.indexOf(current), z = ORDER.indexOf(target), step = z > a ? 1 : -1;
    let i = a;
    setTimeout(function next() {
      if (i !== z) { i += step; doorFloor.textContent = ORDER[i]; setTimeout(next, 380); return; }
      // arrivé : on change de pièce pendant que les portes sont fermées
      current = target;
      target === 'RDC' ? showLift() : showFloor(target);
      setTimeout(() => { doors.classList.remove('closed'); riding = false; }, 500);
    }, 800);
  }

  /* affichage d'un étage : image de la pièce, objets cliquables, rubriques */
  const hots = $('#hots'), win = $('#win');
  function setRoomImage(floor) {
    const r = ROOMS[floor];
    // sans image : le hall pour la tour, la ville floutée pour ton bureau
    const img = r && r.img ? r.img : r && r.own ? (NIGHT > .5 ? '../img/ville-nuit' : '../img/ville-jour') : '../img/hall';
    insideImg.src = img + (innerWidth > 1700 ? '.webp' : '-1600.webp');
    inside.classList.toggle('placeholder', !!(r && floor !== 'RDC' && !r.img));
    inside.classList.toggle('narrow', !!(r && r.own && r.img));
    inside.style.setProperty('--bg', `url(${insideImg.src})`);
    $('#insideWhere').textContent = r && r.where ? r.where : floor === 'RDC' ? 'Tour Sakura Group · Rez-de-chaussée, l\'Accueil' : `Tour Sakura Group · Étage ${floor}, ${r.title}`;
    hots.innerHTML = '';
    if (r && r.img) r.items.forEach((it) => {
      if (!it.hot) return;
      const h = document.createElement('button');
      h.className = 'hot'; h.dataset.item = it.id; h.dataset.pos = it.hot.join(',');
      h.innerHTML = `<span>${it.icon} ${it.label}</span>`;
      hots.append(h);
    });
    placeHots();
  }
  // place les objets cliquables sur l'image (qui remplit l'écran en « cover »)
  function placeHots() {
    const iw = insideImg.naturalWidth || 16, ih = insideImg.naturalHeight || 9;
    // « narrow » (ton bureau sur ordinateur) : l'image est entière à gauche du panneau, sinon elle remplit l'écran
    const narrow = inside.classList.contains('narrow') && innerWidth > 760;
    const cw = narrow ? insideImg.clientWidth : innerWidth, ch = innerHeight;
    const s = (narrow ? Math.min : Math.max)(cw / iw, ch / ih), ox = (cw - iw * s) / 2, oy = (ch - ih * s) / 2;
    $$('.hot', hots).forEach((h) => {
      const [x, y, w, hh] = h.dataset.pos.split(',').map(Number);
      Object.assign(h.style, { left: ox + iw * s * x / 100 + 'px', top: oy + ih * s * y / 100 + 'px', width: iw * s * w / 100 + 'px', height: ih * s * hh / 100 + 'px' });
    });
  }
  insideImg.addEventListener('load', placeHots);
  addEventListener('resize', placeHots);

  function showLift() {
    $('#pKicker').textContent = current === 'RDC' ? 'Tour Sakura Group' : `Tour Sakura Group · Étage ${current}`;
    $('#pTitle').textContent = 'L\'ascenseur';
    $('#pLead').textContent = 'Choisis ton étage.';
    $('#pBody').innerHTML = liftHTML();
    if (current === 'RDC') setRoomImage('RDC');
  }
  function showFloor(floor) {
    const r = ROOMS[floor];
    setRoomImage(floor);
    $('#pKicker').textContent = `Tour Sakura Group · Étage ${floor}`;
    $('#pTitle').textContent = r.title;
    $('#pLead').textContent = r.lead;
    $('#pBody').innerHTML = roomBody(floor);
  }
  // menu des rubriques d'une pièce (étage de la tour ou ton bureau)
  function roomBody(key) {
    const r = ROOMS[key];
    return `<div class="rooms">${r.items.map((it, i) => `
      <button class="room-item" data-item="${it.id}" style="animation-delay:${80 + i * 60}ms">
        <span class="ri-ico" aria-hidden="true">${it.icon}</span><span><b>${it.label}</b><small>${it.sub}</small></span><span class="go" aria-hidden="true">→</span>
      </button>`).join('')}</div>
      <div class="room-actions">${r.own ? '' : '<button class="btn btn-ghost" data-lift>🛗 Ascenseur</button>'}<button class="btn btn-ghost" data-exit>${r.own ? 'Retour à la ville' : 'Sortir de la tour'}</button></div>
      ${r.img ? '' : `<p class="note">${r.noImg || 'Image de cet étage à venir : pour l\'instant, le fond est celui du hall.'}</p>`}`;
  }
  function openWin(id) {
    const r = ROOMS[current]; const it = r && r.items.find((x) => x.id === id); if (!it) return;
    $('#winIcon').textContent = it.icon; $('#winTitle').textContent = it.label;
    $('#winBody').innerHTML = it.html;
    win.classList.add('open'); win.setAttribute('aria-hidden', 'false');
    $$('.room-item', panel).forEach((b) => b.classList.toggle('on', b.dataset.item === id));
    setTimeout(() => $('#winClose').focus({ preventScroll: true }), 300);
  }
  function closeWin() {
    if (!win.classList.contains('open')) return false;
    win.classList.remove('open'); win.setAttribute('aria-hidden', 'true');
    $$('.room-item', panel).forEach((b) => b.classList.remove('on'));
    return true;
  }
  $('#winClose').addEventListener('click', closeWin);
  hots.addEventListener('click', (e) => { const h = e.target.closest('.hot'); if (h) openWin(h.dataset.item); });
  win.addEventListener('click', (e) => { if (e.target.closest('[data-soon]')) toast('Bientôt disponible : ouverture avec les premiers membres.'); });
  spots.addEventListener('click', (e) => {
    const s = e.target.closest('.spot');
    if (!s || moved) return;
    open(s.dataset.id);
  });
  $('#close').addEventListener('click', closePanel);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !closeWin()) closePanel(); });

  // étages de la tour
  panel.addEventListener('click', (e) => {
    const f = e.target.closest('.floor');
    if (f) {
      if (f.dataset.href) { window.open(f.dataset.href, '_blank', 'noopener'); return; }
      if (f.dataset.floor === current) { current === 'RDC' ? toast('Tu es déjà à l\'accueil.') : showFloor(current); return; }
      ride(f.dataset.floor);
      return;
    }
    const ri = e.target.closest('.room-item');
    if (ri) { openWin(ri.dataset.item); return; }
    if (e.target.closest('[data-lift]')) { closeWin(); showLift(); return; }
    if (e.target.closest('[data-exit]')) { closePanel(); return; }
    const chip = e.target.closest('.chip');
    if (chip) { $$('.chip', panel).forEach((c) => c.classList.toggle('on', c === chip)); return; }
    if (e.target.closest('[data-soon]')) toast('Bientôt disponible : la ville ouvre avec les premiers membres.');
  });

  /* ---------- menu, membres en ligne, notifications ---------- */
  const toastEl = $('#toast'); let tt;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 2800); }
  const toolToBuilding = { messages: 'cafe', membres: 'membres' };
  // appels : ton bureau, rubrique secrétaire ; missions : la tour, étage 4
  const toolToRoom = { appels: ['moi', () => openWin('secretaire')], missions: ['tour', () => ride('4')] };
  $$('.side-btn').forEach((btn) => btn.addEventListener('click', () => {
    $$('.side-btn').forEach((x) => x.classList.toggle('active', x === btn));
    const t = btn.dataset.tool;
    if (t === 'ville') { closePanel(); return; }
    if (toolToBuilding[t]) { open(toolToBuilding[t]); return; }
    if (toolToRoom[t]) { const [id, then] = toolToRoom[t]; open(id); setTimeout(then, reduce ? 50 : 1300); return; }
    toast('Bientôt disponible.');
  }));
  const ob = $('#onlineBtn'), op = $('#onlinePanel');
  ob.addEventListener('click', () => { const o = op.hidden; op.hidden = !o; ob.setAttribute('aria-expanded', String(o)); });
  setTimeout(() => $('#hint').classList.add('hide'), 9000);

  /* ---------- jour / nuit et horloge (heure réelle) ---------- */
  const SUN = [[8.67,17.25],[8.08,18],[7.25,18.75],[7.25,20.5],[6.5,21.25],[5.83,21.9],[6.17,21.83],[6.83,21.17],[7.5,20.17],[7.75,18.5],[7.92,17.25],[8.58,16.92]];
  function nightLevel(d) {
    const [rise, set] = SUN[d.getMonth()], h = d.getHours() + d.getMinutes() / 60, T = .75;
    if (h >= rise + T && h <= set - T) return 0;
    if (h > rise - T && h < rise + T) return 1 - (h - (rise - T)) / (2 * T);
    if (h > set - T && h < set + T) return (h - (set - T)) / (2 * T);
    return 1;
  }
  let NIGHT = 0;
  function tick() {
    const d = new Date();
    const forced = new URLSearchParams(location.search).get('heure'); // aperçu : ?heure=14
    if (forced !== null && !isNaN(+forced)) d.setHours(+forced, 0);
    const n = nightLevel(d);
    NIGHT = n;
    $('#night').style.opacity = n.toFixed(2);
    glows.style.opacity = n.toFixed(2);
    document.body.classList.toggle('is-night', n > .5);
    $('#time').textContent = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('#date').textContent = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  // premier affichage sans fondu (pas de nuit qui s'efface en plein jour)
  $('#night').style.transition = glows.style.transition = 'none';
  tick();
  requestAnimationFrame(() => requestAnimationFrame(() => { $('#night').style.transition = glows.style.transition = ''; }));
  setInterval(tick, 15000);

  if (reduce) return;

  /* ---------- la vie de la ville : mer, fontaine, fenêtres, oiseaux ---------- */
  const life = $('#life'), lx = life.getContext('2d');
  life.width = W / 2; life.height = H / 2; lx.setTransform(.5, 0, 0, .5, 0, 0);
  const rnd = (a, b) => a + Math.random() * (b - a);
  let seaN = [], seaD = [], wins = [];
  // repère dans l'image les zones de mer et les fenêtres allumées
  function sample(img, test) {
    const sw = 688, sh = 384, c = document.createElement('canvas'); c.width = sw; c.height = sh;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, sw, sh);
    const d = g.getImageData(0, 0, sw, sh).data, out = [];
    for (let y = 0; y < sh; y += 2) for (let x = 0; x < sw; x += 2) {
      const i = (y * sw + x) * 4;
      if (test(d[i], d[i + 1], d[i + 2], x * 4, y * 4)) out.push([x * 4, y * 4]);
    }
    return out;
  }
  // la mer : sous l'horizon (y≈390), à gauche de la tour, hors du bâtiment du membre
  const isSea = (x, y) => x < 1050 && y > 398 && y < 700 && !(x > 360 && y > 470);
  const whenLoaded =(img, fn) => (img.complete && img.naturalWidth ? fn() : img.addEventListener('load', fn, { once: true }));
  whenLoaded($('#night'), () => {
    seaN = sample($('#night'), (r, g, b, x, y) => isSea(x, y) && b > r + 25 && b > 70);
    const lit = sample($('#night'), (r, g, b, x, y) => y < 1150 && r > 215 && g > 160 && b < 165);
    for (let k = 0; k < 400 && wins.length < 70; k++) {
      const p = lit[Math.floor(Math.random() * lit.length)];
      if (p && wins.every((w) => Math.hypot(w.x - p[0], w.y - p[1]) > 40)) wins.push({ x: p[0], y: p[1], mode: 0, until: performance.now() + rnd(2000, 15000) });
    }
  });
  whenLoaded($('#day'), () => {
    seaD = sample($('#day'), (r, g, b, x, y) => isSea(x, y) && b > r + 30 && g > r + 10);
  });

  // scintillements sur la mer
  const glints = Array.from({ length: 90 }, () => ({ t: Math.random(), v: rnd(.008, .02), x: 0, y: 0, s: 0 }));
  const placeGlint = (gl, pts, night) => {
    for (let k = 0; k < 6; k++) {
      const p = pts[Math.floor(Math.random() * pts.length)];
      if (!p) return;
      // la nuit, surtout dans le reflet de la lune
      if (night && Math.abs(p[0] - 360) > 110 && Math.random() > .25) continue;
      gl.x = p[0] + rnd(-4, 4); gl.y = p[1] + rnd(-3, 3); gl.s = rnd(1.5, 3.6) * (1 + (p[1] - 400) / 500); return;
    }
  };
  // fontaine (jet du haut, bassin du bas)
  const F = { x: 1383, y: 1245, bx: 1385, by: 1333 };
  const drops = [], ripples = [];
  // oiseaux
  let flock = [], nextFlock = performance.now() + 3000;

  function drawLife(now, dt) {
    lx.clearRect(0, 0, W, H);
    const n = NIGHT, day = 1 - n;

    // mer
    lx.globalCompositeOperation = 'lighter';
    for (const gl of glints) {
      gl.t += gl.v * dt;
      if (gl.t >= 1 || !gl.s) { gl.t = 0; placeGlint(gl, n > .5 ? seaN : seaD, n > .5); }
      if (!gl.s) continue;
      const a = Math.sin(gl.t * Math.PI) * .6;
      const moon = n > .5 ? Math.max(0, 1 - Math.abs(gl.x - 360) / 200) : .7;
      lx.globalAlpha = a * (.3 + .7 * moon);
      lx.fillStyle = n > .5 ? '#e4ecff' : '#ffffff';
      lx.beginPath(); lx.ellipse(gl.x, gl.y, gl.s * 1.8, gl.s * .45, 0, 0, 6.283); lx.fill();
    }

    // fontaine
    for (let k = 0; k < 2; k++) drops.push({ x: F.x, y: F.y, vx: rnd(-.55, .55), vy: rnd(-1.6, -1), life: 0 });
    if (Math.random() < .05 * dt) ripples.push({ r: 8, a: .5 });
    lx.fillStyle = n > .5 ? '#cfe0ff' : '#ffffff';
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += .06 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life += dt;
      if (d.y > F.by - 4 || d.life > 90) { drops.splice(i, 1); continue; }
      lx.globalAlpha = .55; lx.fillRect(d.x - 1, d.y - 1, 2.2, 2.2);
    }
    lx.strokeStyle = n > .5 ? '#bcd3ff' : '#ffffff'; lx.lineWidth = 1.6;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.r += .45 * dt; r.a -= .006 * dt;
      if (r.a <= 0 || r.r > 68) { ripples.splice(i, 1); continue; }
      lx.globalAlpha = r.a; lx.beginPath(); lx.ellipse(F.bx, F.by, r.r, r.r * .38, 0, 0, 6.283); lx.stroke();
    }

    // fenêtres qui s'allument / s'éteignent la nuit
    lx.globalCompositeOperation = 'source-over';
    if (n > .3) for (const w of wins) {
      if (now > w.until) { w.mode = w.mode ? 0 : (Math.random() < .55 ? 1 : 2); w.until = now + (w.mode ? rnd(4000, 14000) : rnd(3000, 18000)); }
      if (w.mode === 1) { // éteinte
        lx.globalAlpha = .78 * n; lx.fillStyle = '#0d1226';
        lx.beginPath(); lx.ellipse(w.x, w.y, 9, 11, 0, 0, 6.283); lx.fill();
      } else if (w.mode === 2) { // plus lumineuse
        lx.globalCompositeOperation = 'lighter';
        const g = lx.createRadialGradient(w.x, w.y, 0, w.x, w.y, 18);
        g.addColorStop(0, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,180,100,0)');
        lx.globalAlpha = n; lx.fillStyle = g; lx.fillRect(w.x - 18, w.y - 18, 36, 36);
        lx.globalCompositeOperation = 'source-over';
      }
    }

    // oiseaux (le jour)
    if (day > .3 && now > nextFlock && !flock.length) {
      const dir = Math.random() < .5 ? 1 : -1, y0 = rnd(110, 360), x0 = dir > 0 ? -60 : W + 60, sp = rnd(1.6, 2.6), count = Math.round(rnd(3, 6));
      flock = Array.from({ length: count }, (_, i) => ({ x: x0 - dir * i * rnd(18, 34), y: y0 + rnd(-22, 22) + i * 4, dir, sp: sp * rnd(.92, 1.08), ph: Math.random() * 6 }));
      nextFlock = now + rnd(12000, 26000);
    }
    lx.strokeStyle = 'rgba(28,32,44,.75)'; lx.lineWidth = 2.2; lx.lineCap = 'round';
    for (const b of flock) {
      b.x += b.dir * b.sp * dt; b.ph += .22 * dt; b.y += Math.sin(b.ph * .2) * .15;
      const f = Math.sin(b.ph) * 6, s = 9;
      lx.globalAlpha = Math.min(1, day * 1.4);
      lx.beginPath(); lx.moveTo(b.x - s, b.y - f); lx.quadraticCurveTo(b.x - s / 2, b.y - 1, b.x, b.y); lx.quadraticCurveTo(b.x + s / 2, b.y - 1, b.x + s, b.y - f); lx.stroke();
    }
    if (flock.length && flock.every((b) => b.x < -120 || b.x > W + 120)) flock = [];
    lx.globalAlpha = 1;
  }
  let lastLife = performance.now();
  (function loop(now) {
    const dt = Math.min(3, (now - lastLife) / 16.67); lastLife = now;
    drawLife(now, dt);
    requestAnimationFrame(loop);
  })(lastLife);

  /* ---------- pétales ---------- */
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let CW = 0, CH = 0, petals = [];
  const spawn = (any) => ({ x: Math.random() * CW * 1.2 - CW * .1, y: any ? Math.random() * CH : -20, s: 4 + Math.random() * 6, vy: .3 + Math.random() * .6, vx: .2 + Math.random() * .5, a: Math.random() * 6.28, va: (Math.random() - .5) * .04, sw: Math.random() * 6.28, o: .5 + Math.random() * .4 });
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    CW = cv.clientWidth; CH = cv.clientHeight; cv.width = CW * dpr; cv.height = CH * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    petals = Array.from({ length: Math.round(Math.min(40, CW / 32)) }, () => spawn(true));
  }
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(3, (now - last) / 16.67); last = now;
    ctx.clearRect(0, 0, CW, CH);
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.sw += .03 * dt; p.a += p.va * dt; p.y += p.vy * dt; p.x += (p.vx + Math.sin(p.sw) * .6) * dt;
      if (p.y > CH + 20 || p.x > CW + 30) { petals[i] = spawn(false); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1, .55 + .45 * Math.abs(Math.sin(p.sw))); ctx.globalAlpha = p.o;
      const g = ctx.createLinearGradient(-p.s, 0, p.s, 0); g.addColorStop(0, '#ffd6e5'); g.addColorStop(1, '#f08fb3'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
      ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
      ctx.fill(); ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(frame);
})();
