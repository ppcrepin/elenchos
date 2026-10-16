// @ts-check
// Elenchos, étape 1 (coquille). Tous les mots fixes de l'application, dans un seul fichier (CONTRAT.md 1.6).
//
// Les mots ne sont pas écrits par Front-end : chaque texte qui manque porte la marque A_ECRIRE, avec en commentaire
// l'écran et ce qu'il doit dire ; UX les écrit. Les mots déjà écrits par UX sont recopiés tels quels, avec leur source.
// La fabrication pour TestFlight refuse toute page qui porte encore la marque (app-testflight.yml) ; celle du
// simulateur l'accepte, pour qu'on voie les écrans avant les mots.
//
// Une exception, par nécessité : les mots de la vue de secours sont dans index.html, puisqu'elle s'affiche quand ce
// script n'a pas pu démarrer.

export const TEXTES = Object.freeze({
  /** Écran d'accueil de l'application (N1, variante application ; CONTRAT.md 9, point 3). */
  accueil: Object.freeze({
    // Titre de l'écran d'accueil, dans l'application.
    titre: 'A_ECRIRE',
    // Une ou deux phrases : ce qu'est Elenchos, et que, pendant le test, on entre seulement par invitation.
    texte: 'A_ECRIRE',
    // Le bouton de connexion avec Apple. Apple n'accepte que ses intitulés (règles de présentation de « Se connecter
    // avec Apple ») : « Continuer avec Apple », « Se connecter avec Apple » ou « S'inscrire avec Apple ».
    apple: 'A_ECRIRE',
  }),

  /** La connexion avec Apple (CONTRAT.md 2.5 et 6). Le joueur qui ferme la feuille d'Apple ne voit rien. */
  connexion: Object.freeze({
    // Sous le bouton, quand la connexion a pris plus de 10 minutes (`connexion_expiree`) : sans ton d'erreur, il
    // suffit de recommencer.
    expiree: 'A_ECRIRE',
    // Refus `compte_inconnu` : aucun compte Elenchos n'est lié à ce compte Apple.
    compteInconnu: 'A_ECRIRE',
    // Refus `connexion_echouee` : la connexion n'a pas abouti ; recommencer.
    echouee: 'A_ECRIRE',
  }),

  /** Écran provisoire de l'étape 1, une fois connecté : il sera remplacé par Aujourd'hui à l'étape 2. */
  connecte: Object.freeze({
    // Titre : la connexion a réussi.
    titre: 'A_ECRIRE',
    // Une phrase : le jeu arrive dans une prochaine version ; pour l'instant, on vérifie le message de 18h.
    texte: 'A_ECRIRE',
  }),

  /** Le bloc du message de 18h (N10, sans sa variante « iPhone trop ancien » ; CONTRAT.md 2.13). */
  message: Object.freeze({
    // Une ou deux phrases au-dessus du bouton : un seul message par jour, à 18h, pour dire que la révélation et la
    // question du jour attendent ; iOS va demander l'accord.
    explication: 'A_ECRIRE',
    // Le bouton, qui seul déclenche la demande d'iOS. Mots de N10, cités par CONTRAT.md 2.13.
    bouton: 'Recevoir le message de 18h',
    // Après l'accord, une fois l'abonnement enregistré : c'est fait, le message arrivera vers 18h.
    abonne: 'A_ECRIRE',
    // iOS a refusé (maintenant ou avant) : comment l'autoriser dans Réglages, Notifications, Elenchos.
    refuse: 'A_ECRIRE',
  }),

  /** Écran « Mise à jour requise » : la fabrication est sous `fabricationMinimale` (CONTRAT.md 1.7 et 9). */
  miseAJour: Object.freeze({
    // Titre : une nouvelle version d'Elenchos est nécessaire.
    titre: 'A_ECRIRE',
    // Ce qu'il faut faire : ouvrir TestFlight et mettre à jour Elenchos ; rien de ce qui a été joué n'est perdu.
    texte: 'A_ECRIRE',
  }),

  /** N2, variante application : l'application est ouverte sur un iPad ou un Mac (D-054 ; CONTRAT.md 2.1). */
  appareil: Object.freeze({
    // Titre : Elenchos se joue sur iPhone.
    titre: 'A_ECRIRE',
    // Une phrase : pourquoi on ne peut pas jouer ici, et qu'il faut ouvrir Elenchos sur un iPhone.
    texte: 'A_ECRIRE',
  }),

  /** N18, pas de réseau : mots d'UX (phase 0), recopiés de CONTRAT.md, partie 11. */
  reseau: Object.freeze({
    titre: 'Pas de connexion',
    texte: 'Elenchos a besoin d’internet pour afficher le jeu. Il s’affichera dès que la connexion revient.',
    reessayer: 'Réessayer',
    injoignable: 'Elenchos ne répond pas pour l’instant. Réessaie dans quelques minutes.',
  }),

  /** Les erreurs (CONTRAT.md, partie 6). */
  erreurs: Object.freeze({
    // Message neutre, mots de CONTRAT.md, partie 6.
    neutre: 'Ça n’a pas marché',
    // `trop_de_demandes` : message générique, sans durée variable (le limiteur compte au plus un quart d'heure).
    tropDeDemandes: 'A_ECRIRE',
  }),
});
