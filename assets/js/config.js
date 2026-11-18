// Réglages du site Sakura Group : modifie ici sans toucher au reste.
window.SAKURA = {
  email: "contact@sakuragroup.fr",
  // Clé publique Web3Forms (la même que badsociety.fr) : les demandes arrivent sur contact@sakuragroup.fr.
  formKey: "2c73ffb6-1e25-4365-b521-4a643331e9ce",
  // Liens de paiement Stripe : colle chaque lien quand il est créé. Vide = le bouton ouvre le formulaire.
  stripe: {
    essentielMois: "https://buy.stripe.com/14AeVdaV6cybfre0WbefC00",
    essentielAn: "https://buy.stripe.com/aFaaEX5AM8hV0wk8oDefC01"
    // Liens « Pro » désactivés dans Stripe le 18/11/2026 (offre retirée)
  },
  // Portail client Stripe : le client y gère ou arrête son abonnement
  portail: "https://billing.stripe.com/p/login/14AeVdaV6cybfre0WbefC00"
};
