/* Textes de la page de l'essai (outillage d'essai, D-001 tenu).
 *
 * Tous les textes affichés, en typographie simple : apostrophe droite,
 * espaces ordinaires. L'affichage applique les règles du §7.8
 * (noyau.typographier), puis insère le pseudo. Sources, citées texte par
 * texte : maquettes finales (écran n.n, D-014), simulation.md (§n),
 * a-ne-pas-ouvrir/devoilement.md, annexe C. Front-end n'invente aucun
 * mot : un texte manquant est une question (QUESTIONS.md).
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosTextes = (function (N) {

  var POSITIONS = ['Très défavorable', 'Défavorable', 'Neutre', 'Favorable', 'Très favorable'];
  /** Les huit tensions dans l'ordre fixe des maquettes, avec leur code d'essai. */
  var T8 = [
    { code: 'S', poles: ['Sécurité', 'Liberté individuelle'] },
    { code: null, poles: ['Égalité', 'Mérite'] },
    { code: null, poles: ['Solidarité collective', 'Responsabilité individuelle'] },
    { code: 'P', poles: ['Précaution', 'Innovation'] },
    { code: 'T', poles: ['Tradition', 'Changement'] },
    { code: null, poles: ['Souveraineté', 'Ouverture'] },
    { code: null, poles: ['État', 'Marché'] },
    { code: 'L', poles: ['Local', 'National'] }
  ];
  /** Ordre fixe des quatre tensions écartées, dans Moi (§5.3). */
  var ECARTEES = [1, 2, 5, 6];
  /** Jour de la séance n (§7.1, « 5.3 et 5.4, jours ») ; la table continue après 14. */
  var JOURS_SEANCE = [null, 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 'lundi', 'mardi'];
  var CERCLE = 'Amis';

  function majuscule(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /** La raison en fin de ligne : guillemets, ponctuation gardée (§4.6). */
  function raisonFinLigne(texte) { return '« ' + texte + ' »'; }
  /** La raison dans une phrase : perd son point final ; « ? » et « ! » restent (§4.6). */
  function raisonDansPhrase(texte) {
    var t = texte.charAt(texte.length - 1) === '.' ? texte.slice(0, -1) : texte;
    return '« ' + t + ' »';
  }

  var T = {
    POSITIONS: POSITIONS, T8: T8, ECARTEES: ECARTEES, JOURS_SEANCE: JOURS_SEANCE, CERCLE: CERCLE,
    majuscule: majuscule, raisonFinLigne: raisonFinLigne, raisonDansPhrase: raisonDansPhrase,

    /* ---------------- Téléphone : entrée (1.1 à 1.9) ---------------- */
    chatTitre: 'Agathe', // 1.1, « ← Thomas » devient le prénom de l'inviteuse
    chatBulle: "Tu crois me connaître ? J'ai répondu à 3 vraies questions de l'Assemblée. Devine ce que j'ai dit, 2 minutes.",
    chatApercuTitre: 'Elenchos',
    chatApercu: 'Agathe te lance un défi',
    bandeDefi: function (i) { return 'Défi ' + N.dePrenom('Agathe') + ' · Texte ' + i + ' sur 3'; },
    consigneDefi: "Réponds, puis devine ce qu'a dit Agathe.",
    etiquetteTexte: "Un vrai texte de l'Assemblée nationale · auteur masqué",
    tonAvis: 'Ton avis ?',
    suivant: 'Suivant',
    consentementRetour: 'Retour au texte',
    consentementTitre: 'Avant ta première réponse',
    consentementTexte: 'Tes réponses révèlent tes opinions politiques. Elles servent au jeu : tes proches te devinent, ton portrait se dessine. Seul ton cercle les voit, elles ne sont jamais vendues. Tu peux tout effacer, quand tu veux. 15 ans et plus.',
    quiDureeDroits: 'Qui, durée, droits',
    jAccepte: "J'accepte",
    changerPosition: 'Changer ma position',
    rappelAvis: function (titre, position) { return titre + ' · Ton avis : ' + position; },
    questionRaison: "Qu'est-ce qui a le plus pesé ?",
    aucuneRaison: 'Aucune de ces raisons',
    definitive: 'Ta réponse sera définitive.',
    valider: 'Valider',
    etSaReponse: 'Et Agathe ? Sa réponse ?',
    voirSaReponse: 'Voir sa réponse',
    bandeTexte: function (i) { return 'Texte ' + i + ' sur 3'; },
    caAlors: 'Ça alors !',
    tuConnais: 'Tu connais ton monde.',
    tuConnaisRaisons: 'Tu connais ton monde, et ses raisons.',
    tonPari: function (position) { return 'Ton pari : ' + position + '.'; },
    ligneInviteuse: function (position) { return 'Agathe : ' + position; },
    aucuneDesQuatreRaisons: 'aucune des quatre raisons',
    texteSuivant: 'Texte suivant',
    bilanGrand: function (n) { return n + ' sur 3'; },
    bilanLigne: function (n) { return 'Tu as trouvé ' + n + ' réponses ' + N.dePrenom('Agathe') + ' sur 3.'; },
    bilanSurprises: function (n) { return 'Agathe a réussi à te surprendre ' + (n === 3 ? 'trois' : 'deux') + ' fois.'; },
    portraitCommence: 'Ton portrait commence',
    chaqueReponseLes: 'Chaque réponse les précise.',
    creerCompte: 'Créer mon compte',
    compteTexte: 'Pour ' + N.quePrenom('Agathe') + " sache que c'était toi, et retrouver tes réponses demain : un pseudo, ton e-mail.",
    champPseudo: 'Pseudo',
    champEmail: 'E-mail',
    emailDessine: 'toi@exemple.fr',
    recevoirCode: 'Recevoir mon code',
    codeEnvoye: 'Code envoyé à toi@exemple.fr',
    renvoyerCode: 'Renvoyer le code',
    plusTard: 'Plus tard',

    /* ---------------- Téléphone : Aujourd'hui ---------------- */
    ongletAujourdhui: "Aujourd'hui", ongletCercle: 'Le Cercle', ongletMoi: 'Moi',
    aujourdhui: function (jour) { return "Aujourd'hui · " + jour; },
    etapeDeviner: 'Deviner', etapeRepondre: 'Répondre',
    rejoint: 'Tu as rejoint ' + CERCLE + '.',
    rienPourLinstant: "Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner.",
    rienAujourdhui: "Rien à deviner aujourd'hui.",
    hier: function (titre) { return 'Hier : ' + titre; },
    relire: 'Relire',
    aQui: 'À qui sont ces réponses ?',
    carteRaisonCachee: 'raison cachée',
    carteLigne: function (position, raison) { return position + ' · ' + raison; },
    taDevinette: function (raison) { return 'Ta devinette : ' + raison; },
    taDevinetteAucune: 'Ta devinette : aucune des quatre.',
    devineAussi: 'Devine aussi pourquoi',
    passer: 'Passer', passee: 'Passée',
    feuillePourquoi: "Pourquoi, d'après toi ?",
    choisir: 'Choisir',
    retour: 'Retour',
    phraseDuJour: 'Ta phrase du jour',
    voirPortrait: 'Voir mon portrait',
    revelationDans: function (h, mm) { return 'Révélation dans ' + h + ' h ' + mm; },
    nouveauTexteDans: function (h, mm) { return 'Nouveau texte dans ' + h + ' h ' + mm; },
    dejaJoue: "Déjà joué aujourd'hui :",

    /* ---------------- Message de 18h et révélation ---------------- */
    message18h: "18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui.",
    message18hDimanche: "18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. Ce soir, aussi : les titres de la semaine.",
    notifMeta: 'Elenchos · maintenant',
    notifIcone: 'E',
    horlogeVerrou: '18:00',
    bandeRevelation: function (titre) { return CERCLE + ' · ' + titre; },
    tonPariPrenom: function (prenom) { return 'Ton pari : ' + prenom + '.'; },
    tonPariRaison: function (prenom, raisonPhrase) { return 'Ton pari : ' + prenom + ', parce que ' + raisonPhrase + '.'; },
    tonPariAucune: function (prenom) { return 'Ton pari : ' + prenom + ', aucune des quatre raisons.'; },
    tuAvaisPasse: 'Tu avais passé.',
    cEtait: function (prenom) { return "C'était " + prenom + '.'; },
    saRaison: function (raison) { return 'Sa raison : ' + raison; },
    saRaisonAucune: 'Sa raison : aucune des quatre.',
    retournerCarte: 'Retourner la carte',
    points: function (n, m) {
      return N.accordNombre(n, 'point', 'points') + " aujourd'hui" + (m === null ? '' : ' · ' + m + ' cette semaine');
    },
    etLAssemblee: "Et l'Assemblée ?",
    issue: { adopte: 'Texte adopté.', rejete: 'Texte rejeté.', sans_vote_ensemble: 'Texte ni adopté ni rejeté.' },
    etape: { navette: 'Le Sénat devait encore voter.', definitif: "C'était le vote définitif du Parlement.", aucune: '' },
    articleUnique: function (date) { return 'Le ' + date + ", son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte."; },
    fermer: 'Fermer',
    maintenantQuestion: "Et maintenant, la question d'aujourd'hui.",
    texteEtSources: 'Le texte et ses sources',
    jouer: 'Jouer',
    badgeRare: 'Badge rare',
    sansFaute: function (noms, pluriel) { return noms + (pluriel ? ' décrochent' : ' décroche') + ' Le Sans-Faute.'; },
    sansFauteLigne: 'Sept jours sans erreur, sans rien passer.',
    titresDeLaSemaine: 'Les titres de la semaine · ' + CERCLE,
    devin: function (nom) { return 'Le Devin : ' + nom; },
    devinLigne: 'a le mieux deviné les autres cette semaine',
    mystere: function (nom) { return 'Le Mystère : ' + nom; },
    mystereLigne: 'le plus difficile à deviner cette semaine',
    fidele: function (noms) { return 'Le Fidèle : ' + noms; },
    fideleLigne: function (semaine, pluriel) {
      return semaine === 1 ? (pluriel ? 'ont répondu chaque jour' : 'a répondu chaque jour')
        : (pluriel ? 'ont répondu les sept jours' : 'a répondu les sept jours');
    },
    surpriseSemaine: 'La surprise de la semaine',
    surpriseLigne: 'le texte qui a le plus trompé le cercle',
    voirLeTexte: 'Voir le texte',
    pourToiSemaine: 'Pour toi, cette semaine',

    /* ---------------- Le Cercle, Moi, fiches ---------------- */
    cercleTete: CERCLE + ' ▾',
    inviter: '+ Inviter',
    ouChacun: 'Où chacun se place',
    encoreFlou: function (noms) { return 'Encore flou : ' + noms; },
    surpriseEncadre: 'Surprise de la semaine :',
    titresPassesLien: 'Titres des semaines passées →',
    leCercle: 'Le Cercle',
    titreCetteSemaine: function (titres) { return titres + ' cette semaine'; },
    legendeToi: 'Toi',
    sesSurprises: 'Ses surprises',
    surpriseLigneTexte: function (titre, position, raison) { return titre + ' : ' + position + ', ' + raison; },
    tuPensais: function (prenom) { return 'Tu pensais à ' + prenom; },
    voirTout: 'Voir tout',
    moi: 'Moi',
    reglagesIcone: '⚙',
    reglagesNom: 'Réglages',
    sousOnglets: ['Portrait', 'Titres', 'Historique'],
    portraitPasForme: 'Chaque réponse le précise. Il faut environ trois mois pour les premiers curseurs nets.',
    semaine: function (n) { return 'Semaine ' + n; },
    titresMoi: function (titres) { return titres + ' · ' + CERCLE; },
    pasDeTitreAvant: 'Pas encore de titre. Les titres tombent le dimanche, à 18h.',
    pasDeTitreApres: 'Pas encore de titre. Les prochains tombent dimanche, à 18h.',
    historiqueGauche: function (jour, titre) { return majuscule(jour) + ' · ' + titre; },
    historiqueRevele: function (position, jour) { return position + ' · révélé ' + jour + ' à 18h'; },
    revele: function (jour) { return 'révélé ' + jour; },
    voteEtAuteurs: function (jour) { return 'Le vote et les auteurs : ' + jour + ' à 18h'; },
    taReponse: 'Ta réponse :',
    vote: 'Vote :',
    quatreRaisons: 'Les quatre raisons',
    sources: 'Sources : extraits des débats',
    extrait: function (i) { return 'Extrait ' + i; },
    voirScrutin: "Voir le scrutin sur le site de l'Assemblée",
    titresPassesTitre: 'Titres des semaines passées',
    titresPassesLigne: function (devin, mystere, fideles) {
      var parts = [];
      if (devin) { parts.push('Devin : ' + devin); }
      if (mystere) { parts.push('Mystère : ' + mystere); }
      if (fideles) { parts.push('Fidèle : ' + fideles); }
      return parts.join(' · ');
    },
    reglagesTitre: 'Réglages',
    compte: 'Compte',
    cercles: 'Cercles',
    cerclesActions: 'Changer · Créer · Quitter',
    message18hTitre: 'Message de 18h',
    recevoirMessage: 'Recevoir le message de 18h',
    tesDonnees: 'Tes données',
    toutEffacer: 'Tout effacer',

    /* ---------------- Phrases de l'Assemblée (§7.9, §7.10) ---------------- */
    proposeParGouvernement: 'Proposé par le Gouvernement.',

    /* ---------------- Cadre (en « vous ») ---------------- */
    barreEntree: 'Entrée',
    barreJour: function (k, jour) { return 'Jour ' + k + ' sur 14 · ' + jour; },
    barreCloture: 'Clôture',
    barreArret: function (k) { return k === 0 ? "Essai arrêté à l'entrée" : 'Essai arrêté au jour ' + k; },
    arreterLEssai: "Arrêter l'essai",
    quiEstQuiBouton: 'Qui est qui ?',
    jourSuivant: 'Jour suivant',
    continuer: 'Continuer',
    annuler: 'Annuler',
    pasDansLEssai: "Pas dans l'essai.",
    noteCompte: function (appareil) { return 'Compte simulé : choisissez juste un pseudo. Il reste dans votre ' + appareil + ' ; aucun e-mail n\'est demandé ni envoyé.'; },
    notePrenom: "Ce pseudo est le prénom d'un personnage : choisissez-en un autre.",
    note18h: "Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez.",
    noteTexte14: "Le texte du jour 14 ne sera pas deviné : l'essai s'arrête avant. Voici quand même son vote et ses auteurs.",
    confirmationQuestion: function (deviner) { return deviner ? 'Passer au jour suivant sans finir de deviner ni répondre ?' : 'Passer au jour suivant sans répondre ?'; },
    confirmationPhrase: "Une fois au jour suivant, ce que vous n'avez pas fait aujourd'hui restera ainsi : vous ne pourrez pas y revenir.",
    ouiContinuer: 'Oui, continuer',
    allerJourSuivant: 'Aller au jour suivant',

    message0: function (appareil) {
      return [
        'Vos réponses restent dans votre ' + appareil + '.',
        "La page n'envoie rien, pas même à l'équipe. Pour que personne d'autre ne les voie, et pour ne pas les perdre :",
        [
          "Jouez toujours depuis l'icône « Essai » : c'est elle qui garde votre avancement. Ne la supprimez pas avant la fin de l'essai : cela pourrait tout effacer.",
          "Ne laissez personne d'autre ouvrir l'icône « Essai ».",
          'Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.',
          "Dans la conversation, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit (vos phrases, votre portrait). Une capture d'écran reste dans vos photos, même après « Tout effacer » : avant d'en envoyer une, vérifiez qu'on n'y voit rien de tout cela."
        ]
      ];
    },
    quiEstQuiTitre: "Qui est qui · fiche d'essai.",
    quiEstQuiEntete: "Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées.",
    ficheTete: function (prenom, age, metier, ville) { return prenom + ', ' + age + ' ans · ' + metier + ', ' + ville + '.'; },
    ficheHeure: function (heure) { return "Joue d'habitude vers " + heure + '.'; },
    ficheInviteuse: "C'est elle qui vous invite.",
    droitsTitre: "Version d'essai. La vraie page sera écrite avant le lancement et relue par un avocat.",
    droits: function (appareil) {
      return [
        "Qui voit vos réponses : vous seulement, si personne d'autre n'ouvre l'icône « Essai ». Elles restent dans votre " + appareil + " : c'est l'icône « Essai » qui les garde. La page n'envoie rien, pas même à l'équipe. GitHub, qui héberge la page, voit l'adresse internet de votre connexion quand vous l'ouvrez, jamais vos réponses.",
        "Durée : jusqu'à ce que vous les effaciez. Elles peuvent aussi se perdre, par exemple si vous supprimez l'icône « Essai ».",
        'Droits : « Tout effacer » (dans Moi, la roue dentée) les efface, quand vous voulez.'
      ];
    },
    piedHebergeur: 'Page d\'essai non commerciale, hébergée par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
    piedSource: function (date) {
      return "Source des textes, votes, auteurs et arguments : Assemblée nationale, data.assemblee-nationale.fr (Licence Ouverte) et assemblee-nationale.fr ; consultés le " + date + ". Résumés et raisons réécrits par l'équipe de l'essai ; l'Assemblée n'y est pas associée.";
    },

    carnetTitre: 'Votre carnet du jour',
    q1: 'Vos erreurs à la révélation :',
    q2: function (titre) { return '« ' + titre + ' » et ses quatre raisons :'; },
    q2Entree: 'Les trois textes et leurs raisons :',
    q3: 'Votre moment préféré :',
    choixQ1: { aurais_pu: "J'aurais pu trouver", ne_pouvais_pas: 'Je ne pouvais pas trouver', les_deux: 'Les deux' },
    choixQ2: { premier_coup: 'Compris du premier coup', en_relisant: 'Compris en relisant', pas_tout: 'Pas tout compris' },
    choixQ3: { revelation: 'La révélation', titres: 'Les titres', phrase_semaine: 'Ma phrase de la semaine', deviner: 'Deviner',
      donner_avis: 'Donner mon avis', phrase_jour: 'Ma phrase du jour', aucun: 'Aucun' },
    ordreQ1: ['aurais_pu', 'ne_pouvais_pas', 'les_deux'],
    ordreQ2: ['premier_coup', 'en_relisant', 'pas_tout'],

    arretConfirmationTitre: "Arrêter l'essai ?",
    arretConfirmation: "Ensuite : quelques questions, votre carnet à copier, puis le dévoilement. C'est définitif : l'essai ne pourra pas reprendre.",
    arretTete: function (k) { return k === 0 ? "Essai arrêté à l'entrée." : 'Essai arrêté au jour ' + k + '.'; },
    arretRaison: 'Vous arrêtez surtout parce que :',
    choixArret: { pas_amuse: "Je ne m'amuse pas", pas_compris: 'Je ne comprends pas tout', pas_le_temps: "Je n'ai pas le temps",
      vu_assez: "J'ai vu ce que je voulais voir", autre: 'Autre raison' },
    ordreArret: ['pas_amuse', 'pas_compris', 'pas_le_temps', 'vu_assez', 'autre'],
    f2Arret: "Jusqu'ici, deviner était :",
    f2Fin: 'Au fil des deux semaines, deviner était :',
    choixF2: { de_plus_en_plus: 'De plus en plus amusant', toujours_autant: 'Toujours aussi amusant',
      de_moins_en_moins: 'De moins en moins amusant', jamais: 'Jamais amusant' },
    ordreF2: ['de_plus_en_plus', 'toujours_autant', 'de_moins_en_moins', 'jamais'],
    f1Arret: ['Facultatif, environ une minute.', 'Où placez-vous chacun ?', "D'après ce que vous avez vu. Même si vous hésitez, choisissez."],
    f1Fin: ['Où placez-vous chacun ?', "D'après ces deux semaines. Même si vous hésitez, choisissez."],
    auMilieu: 'Au milieu',
    sauterQuestion: 'Sauter cette question',
    clotureTete: "L'essai est fini. Deux questions, votre carnet à copier, puis le dévoilement.",

    exportTitre: 'Votre carnet à copier',
    copierCarnet: 'Copier mon carnet',
    copierCarnetDabord: "Copier mon carnet d'abord",
    carnetCopie: 'Carnet copié : collez-le dans la conversation.',
    copieEchec: "La copie automatique n'a pas fonctionné. Sélectionnez tout le texte du carnet, jusqu'à « Fin du carnet », copiez-le, puis collez-le dans la conversation.",
    voirDevoilement: 'Voir le dévoilement',

    effacerTitre: 'Tout effacer ?',
    effacerPendant: "La page effacera vos réponses, votre carnet et votre avancement. C'est définitif. Si vous recommencez, vous connaîtrez déjà les réponses des personnages : l'essai ne vaudra plus comme test.",
    effacerApres: 'La page effacera vos réponses et votre carnet. C\'est définitif.',
    effacerInvite: 'Une fois votre carnet copié, vous pouvez tout effacer.',
    efface: 'La page a tout effacé.',

    /* Dévoilement (a-ne-pas-ouvrir/devoilement.md) */
    devoilementTitre: 'Le dévoilement',
    devoilementOuverture: "Voici ce que la page vous cachait : le profil de chaque personnage, ses réponses données exprès contre ce profil et ses jours sans jouer. Tout en bas, « Pour le contrôle » : l'empreinte à comparer avec celle publiée dans la conversation.",
    devoilementF1: function (x) { return 'Où vous placiez chacun : ' + N.accordNombre(x, 'case juste', 'cases justes') + ' sur 16. Au hasard, environ 5.'; },
    commentLire: 'Comment lire',
    commentLire1: "Chaque personnage avait un profil fixé avant l'essai. Pour chaque tension, une place de 0 à 100 : 0 pour la première valeur (Sécurité), 100 pour la seconde (Liberté individuelle) ; de 41 à 59, au milieu. Et une fermeté : plus elle était forte, plus ses réponses s'éloignaient de Neutre, jusqu'à « Très ».",
    commentLire2: function (nombre) { return 'Les réponses de chacun découlaient de son profil, sauf ' + nombre + " par personnage, données exprès contre ce profil pour que rien ne se devine à coup sûr. Toutes ont été calculées par des règles fixes, écrites et scellées avant l'essai, sans rien savoir des vôtres."; },
    commentLire3: '« Jour 5 » : le texte auquel vous avez répondu le jour 5, deviné le jour 6, révélé le jour 7. Un jour sans jouer : ni réponse, ni devinette.',
    nombresEnLettres: { 2: 'deux', 3: 'trois', 4: 'quatre' },
    phraseProfil: {
      Agathe: 'Faite pour ressembler à Nassim, sauf entre local et national.',
      Nassim: 'Fait pour ressembler à Agathe, sauf entre local et national.',
      Odile: 'Tranchée : loin du milieu et fermeté forte, sur les quatre tensions.',
      Valentin: 'Des valeurs que sa vie ne laisse pas deviner.'
    },
    ligneProfil: function (p0, p1, lecture, p, fermete) { return p0 + ' ou ' + p1 + ' : ' + lecture + ' (' + p + ' sur 100, fermeté ' + fermete + ').'; },
    auMilieuMin: 'au milieu',
    vousJuste: 'Vous : juste.',
    vousChoix: function (choix) { return 'Vous : ' + choix + '.'; },
    vousPasDeChoix: 'Vous : pas de choix.',
    reponsesContre: 'Réponses contre son profil :',
    jourTitre: function (n, titre) { return 'Jour ' + n + ' · ' + titre; },
    profilNeutre: 'Son profil donnait Neutre.',
    aDeviner: function (n) { return "Vous l'aviez à deviner le jour " + n + '.'; },
    joursSansJouer: function (liste) { return 'Jours sans jouer : ' + liste + '.'; },
    joursSansJouerAucun: 'Jours sans jouer : aucun.',
    pourLeControle: 'Pour le contrôle',
    graine: 'Graine :',
    fichierScelle: 'Fichier scellé :',
    empreinteDe: 'Empreinte du fichier scellé :',
    comparez: function (date, heure) { return 'Comparez-la, ligne par ligne, avec celle publiée dans la conversation le ' + date + ' à ' + heure + ' : elles doivent être identiques. Si un seul caractère diffère, dites-le dans la conversation.'; },
    devoilementFin: "Les règles complètes, les profils et les textes sont dans le dossier « a-ne-pas-ouvrir » du dépôt : vous pouvez maintenant l'ouvrir.",

    /* Arrêts techniques (§8.11) */
    arretVerifTitre: "La page s'est arrêtée par précaution.",
    arretVerif: "À chaque ouverture, elle vérifie ses données et ses calculs. Cette fois, une vérification n'a pas donné le bon résultat : plutôt que de vous faire jouer sur un calcul peut-être faux, elle préfère s'arrêter.",
    arretVerifGardee: function (appareil) { return "Rien n'est effacé : ce que vous avez déjà joué reste dans votre " + appareil + '.'; },
    arretVerifRepere: ['Dites-le dans la conversation, avec ce repère : ', '. On vous dira quand rouvrir la page.'],
    // M1, partie gardée illisible (§8.11, commit 413abb0)
    arretVerifRienEfface: "Cette page n'a rien effacé.",
    arretVerifRepereM1: ["Gardez l'icône « Essai » et dites-le dans la conversation, avec ce repère : ", '. On vous dira quand rouvrir la page.'],
    arretStockageTitre: 'La page ne peut pas garder vos réponses.',
    arretStockage: function (appareil) { return 'Pour les retrouver d\'un jour à l\'autre, elle doit les enregistrer dans votre ' + appareil + ". Ouverte depuis cette icône, elle n'y arrive pas : elle s'arrête donc avant de vous faire jouer. Si vous aviez déjà commencé l'essai, cette page n'a rien effacé. Gardez l'icône et dites-le dans la conversation : l'équipe vous dira quoi faire."; },
    arretDoubleTitre: "La page s'est ouverte deux fois en même temps.",
    arretDouble: "Pour ne rien écraser, cet écran s'est arrêté ; votre dernier geste ici n'a pas été gardé.",
    reprendreIci: 'Reprendre ici',
    arretDoublePetit: 'Vous retrouverez la partie telle qu\'elle a été gardée en dernier.',

    /* Écran couché (§8.1) */
    coucheTitre: function (appareil) { return 'Tenez votre ' + appareil + ' en hauteur.'; },
    couche: 'En largeur, le téléphone de l\'essai ne tient pas dans l\'écran. Rien n\'est perdu : redressez l\'écran, et vous reprendrez où vous en étiez.',

    /* Écrans hors de l'icône (§8.13) */
    adresse: 'https://ppcrepin.github.io/elenchos/essai/',
    ongletTitre: "Ouvrez plutôt l'icône « Essai »",
    ongletDessous: "L'essai se joue depuis l'icône « Essai » de votre écran d'accueil : c'est elle qui garde votre avancement. Ici, dans Safari, la page ne lance pas l'essai et n'enregistre rien.",
    autreDessous: "L'essai se joue depuis l'icône « Essai » de votre écran d'accueil : c'est elle qui garde votre avancement. Ici, dans ce navigateur, la page ne lance pas l'essai et n'enregistre rien.",
    pourYAller: "Pour y aller : revenez à l'écran d'accueil, puis touchez l'icône « Essai ».",
    pasDIcone: "Pas d'icône « Essai » sur cet écran d'accueil ?",
    dejaCommence: "Vous avez déjà commencé l'essai ? N'ajoutez pas de nouvelle icône. Cherchez-la sur vos autres pages d'écran d'accueil, ou continuez sur l'appareil où vous avez commencé. Si elle a disparu, dites-le d'abord dans la conversation.",
    pasEncore: 'Pas encore commencé ? Ajoutez-la :',
    etapesAjout: [
      'Touchez le bouton Partager : un carré d\'où sort une flèche vers le haut, en bas ou en haut de l\'écran. Vous ne le voyez pas ? Touchez le bouton à trois points (•••), puis « Partager ».',
      "Dans la liste, touchez « Sur l'écran d'accueil ». Faites défiler vers le bas si besoin.",
      "Le nom proposé est « Essai » : ne le changez pas. L'image à côté doit montrer une fiche blanche sur fond gris, avec un trait bleu ; sinon, touchez « Annuler » et dites-le dans la conversation. Si un interrupteur parle d'« app web », il doit être activé (vert).",
      'Touchez « Ajouter », en haut à droite.',
      "Sur votre écran d'accueil, touchez la nouvelle icône « Essai ». L'essai commence là."
    ],
    pasDeSurEcran: "« Sur l'écran d'accueil » n'apparaît pas, même en bas de la liste ? La page est sans doute ouverte dans une autre application (la conversation, par exemple), et non dans Safari. Copiez l'adresse, ouvrez Safari, collez-la dans la barre d'adresse, puis reprenez à l'étape 1. Si rien ne marche, dites-le dans la conversation.",
    copierAdresse: "Copier l'adresse",
    iconeOnglet: "Vous avez touché l'icône « Essai » et vous voyez cette page ?",
    iconeOngletTexte: "L'icône s'est ouverte dans Safari au lieu de s'ouvrir comme une app. Copiez ces lignes, collez-les dans la conversation et gardez l'icône : l'équipe vous dira quoi faire.",
    copierLignes: 'Copier ces lignes',
    pasEncoreAutre: "Pas encore commencé ? L'icône s'ajoute depuis Safari : copiez l'adresse, ouvrez Safari et collez-la dans la barre d'adresse. La page vous guidera.",
    ailleursTitre: "L'essai ne s'ouvre pas ici.",
    ailleursDessous: "Il se joue sur votre iPhone ou votre iPad, depuis l'icône « Essai » de l'écran d'accueil.",
    ailleursAdresse: "Pas d'icône « Essai » ? Ouvrez cette adresse dans Safari, sur l'iPhone ou l'iPad :",
    adresseCopiee: 'Adresse copiée : collez-la dans Safari.',
    adresseEchec: "La copie n'a pas fonctionné : recopiez l'adresse ci-dessus dans Safari.",
    lignesCopiees: 'Lignes copiées : collez-les dans la conversation.',
    lignesEchec: "La copie automatique n'a pas fonctionné. Sélectionnez tout le texte des lignes, jusqu'à « Fin du diagnostic », copiez-le, puis collez-le dans la conversation."
  };
  return T;
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosTextes; }
/*node-fin*/
