/* Textes de la page du second essai (outillage d'essai, D-001 tenu ; lots 4 et 5, instance B).
 *
 * Tous les textes affichés, en typographie simple : apostrophe droite,
 * espaces ordinaires. L'affichage applique les règles du §7.8 de
 * simulation.md (noyau.typographier), puis insère le pseudo. Sources, citées
 * bloc par bloc : maquettes finales (écran n.n, D-014), simulation.md
 * (« S1 §n »), simulation-2.md (« §n ») et son annexe C. Front-end n'invente
 * aucun mot : un texte qui manque est marqué A_ECRIRE, et la construction
 * refuse d'écrire la version du porteur tant qu'il en reste un (construire.py).
 *
 * Les gabarits ne portent ni prénom de personnage ni nombre du calendrier :
 * l'invitant, le cercle, les jours et les semaines sont passés par
 * l'interface, qui les lit dans le fichier scellé. Exceptions, recopiées
 * telles qu'UX les a écrites : la page d'arrivée et la page du saut (§8.2,
 * §8.1 ter), qui nomment les jours de la semaine.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosTextes = (function (N) {

  /** Marque d'un texte qui manque encore (§8.6, §7.22) : la version du porteur ne se construit pas avec. */
  var A_ECRIRE = '[À ÉCRIRE]';

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
  /** Ordre fixe des quatre tensions écartées (S1 §5.3). */
  var ECARTEES = [1, 2, 5, 6];
  /** Pôles dans les phrases (S1 §5.5, E2) : pôle 0, pôle 1, après « Entre ». */
  var POLES_PHRASE = {
    S: ['la sécurité', 'la liberté', 'sécurité et liberté'],
    P: ['la précaution', "l'innovation", 'précaution et innovation'],
    T: ['la tradition', 'le changement', 'tradition et changement'],
    L: ['la décision locale', 'la décision nationale', 'local et national']
  };

  function majuscule(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /** La raison en fin de ligne : guillemets, ponctuation gardée (S1 §4.6). */
  function raisonFinLigne(texte) { return '« ' + texte + ' »'; }
  /** La raison dans une phrase : perd son point final ; « ? » et « ! » restent (S1 §4.6). */
  function raisonDansPhrase(texte) {
    var t = texte.charAt(texte.length - 1) === '.' ? texte.slice(0, -1) : texte;
    return '« ' + t + ' »';
  }
  function joindre(morceaux) { return morceaux.filter(function (x) { return x; }).join(' '); }

  var TITRES = { sans_faute: 'Le Sans-Faute', devin: 'Le Devin', mystere: 'Le Mystère', fidele: 'Le Fidèle' };
  var TITRES_COURTS = { sans_faute: 'Sans-Faute', devin: 'Devin', mystere: 'Mystère', fidele: 'Fidèle' };
  var ORDRE_TITRES = ['sans_faute', 'devin', 'mystere', 'fidele'];
  var TEMPERAMENTS = { original: "L'Original", pont: 'Le Pont', mesure: 'Le Mesuré', tranche: 'Le Tranché' };
  var ORDRE_TEMPERAMENTS = ['original', 'pont', 'mesure', 'tranche'];

  var T = {
    A_ECRIRE: A_ECRIRE,
    POSITIONS: POSITIONS, T8: T8, ECARTEES: ECARTEES, POLES_PHRASE: POLES_PHRASE,
    TITRES: TITRES, TITRES_COURTS: TITRES_COURTS, ORDRE_TITRES: ORDRE_TITRES,
    TEMPERAMENTS: TEMPERAMENTS, ORDRE_TEMPERAMENTS: ORDRE_TEMPERAMENTS,
    majuscule: majuscule, raisonFinLigne: raisonFinLigne, raisonDansPhrase: raisonDansPhrase, joindre: joindre,

    /* ---------------- Téléphone : entrée (1.1 à 1.9 ; §7.2) ---------------- */
    chatTitre: function (inv) { return inv; },
    chatBulle: "Tu crois me connaître ? J'ai répondu à 3 vraies questions de l'Assemblée. Devine ce que j'ai dit, 2 minutes.",
    chatApercuTitre: 'Elenchos',
    chatApercu: function (inv) { return inv + ' te lance un défi'; },
    chatAria: function (inv) { return 'Message ' + N.dePrenom(inv); },
    bandeDefi: function (inv, i, n) { return 'Défi ' + N.dePrenom(inv) + ' · Texte ' + i + ' sur ' + n; },
    consigneDefi: function (inv) { return "Réponds, puis devine ce qu'a dit " + inv + '.'; },
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
    etSaReponse: function (inv) { return 'Et ' + inv + ' ? Sa réponse ?'; },
    voirSaReponse: 'Voir sa réponse',
    bandeTexte: function (i, n) { return 'Texte ' + i + ' sur ' + n; },
    caAlors: 'Ça alors !',
    tuConnais: 'Tu connais ton monde.',
    tuConnaisRaisons: 'Tu connais ton monde, et ses raisons.',
    tonPari: function (position) { return 'Ton pari : ' + position + '.'; },
    ligneInvitant: function (inv, position) { return inv + ' : ' + position; },
    aucuneDesQuatreRaisons: 'aucune des quatre raisons',
    texteSuivant: 'Texte suivant',
    bilanGrand: function (n, total) { return n + ' sur ' + total; },
    bilanLigne: function (inv, n, total) { return 'Tu as trouvé ' + n + ' réponses ' + N.dePrenom(inv) + ' sur ' + total + '.'; },
    bilanSurprises: function (inv, n) { return inv + ' a réussi à te surprendre ' + (n === 3 ? 'trois' : 'deux') + ' fois.'; },
    portraitCommence: 'Ton portrait commence',
    chaqueReponseLes: 'Chaque réponse les précise.',
    creerCompte: 'Créer mon compte',
    // 1.8 selon D-035 (§7.2, annexe C point 1) : la fin « : un pseudo, ton e-mail. » est retirée.
    compteTexte: function (inv) { return 'Pour ' + N.quePrenom(inv) + " sache que c'était toi, et retrouver tes réponses demain."; },
    champPseudo: 'Pseudo',
    continuerApple: 'Continuer avec Apple',
    continuerGoogle: 'Continuer avec Google',
    recevoirCodeEmail: 'Recevoir un code par e-mail',
    // 1.8b (§7.2, annexe C point 2)
    champEmail: 'E-mail',
    emailDessine: 'toi@exemple.fr',
    recevrasCode: 'Tu recevras un code à six chiffres.',
    recevoirCode: 'Recevoir mon code',
    retourCompte: 'Retour',
    // 1.9
    codeEnvoye: 'Code envoyé à toi@exemple.fr',
    renvoyerCode: 'Renvoyer le code',
    plusTard: 'Plus tard',

    /* ---------------- Téléphone : Aujourd'hui ---------------- */
    ongletAujourdhui: "Aujourd'hui", ongletCercle: 'Le Cercle', ongletMoi: 'Moi',
    aujourdhui: function (jour) { return "Aujourd'hui · " + jour; },
    etapeDeviner: 'Deviner', etapeRepondre: 'Répondre',
    rejoint: function (cercle) { return 'Tu as rejoint ' + cercle + '.'; },
    rienAujourdhui: "Rien à deviner aujourd'hui.",
    hier: function (titre) { return 'Hier : ' + titre; },
    relire: 'Relire',
    aQui: 'À qui sont ces réponses ?',
    // §7.12, D-024 (produit.md §5)
    regleDeviner: 'Un proche par réponse, chacun une fois. Si deux ont donné la même, l\'un ou l\'autre est juste.',
    carteRaisonCachee: 'raison cachée',
    carteLigne: function (position, raison) { return position + ' · ' + raison; },
    taDevinette: function (raison) { return 'Ta devinette : ' + raison; },
    taDevinetteAucune: 'Ta devinette : aucune des quatre.',
    devineAussi: 'Devine aussi pourquoi',
    passer: 'Passer', passee: 'Passée',
    reponseNumero: function (i) { return 'Réponse ' + i; },
    feuillePourquoi: "Pourquoi, d'après toi ?",
    choisir: 'Choisir',
    retour: 'Retour',
    phraseDuJour: 'Ta phrase du jour',
    voirPortrait: 'Voir mon portrait',
    revelationDans: function (h, mm) { return 'Révélation dans ' + h + ' h ' + mm; },
    nouveauTexteDans: function (h, mm) { return 'Nouveau texte dans ' + h + ' h ' + mm; },
    dejaJoue: "Déjà joué aujourd'hui :",
    // E3 (§7.18 ; annexe C, point 11.6)
    reprendreRevelation: 'Reprendre la révélation',
    revoirRevelation: 'Revoir la révélation',

    /* ---------------- Message de 18h et révélation (§7.17, E1) ---------------- */
    message18hCartes: "18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui.",
    message18hVote: "18h. Le vote de l'Assemblée t'attend, et la question d'aujourd'hui.",
    message18hQuestion: "18h. La question d'aujourd'hui t'attend.",
    message18hTitres: 'Ce soir, aussi : les titres de la semaine.',
    notifMeta: 'Elenchos · maintenant',
    notifIcone: 'E',
    horlogeVerrou: '18:00',
    ecranVerrouille: 'Écran verrouillé',
    revelationAria: 'Révélation',
    fermer: 'Fermer',
    bandeRevelation: function (cercle, titre) { return cercle + ' · ' + titre; },
    tonPariPrenom: function (prenom) { return 'Ton pari : ' + prenom + '.'; },
    tonPariRaison: function (prenom, raisonPhrase) { return 'Ton pari : ' + prenom + ', parce que ' + raisonPhrase + '.'; },
    tonPariAucune: function (prenom) { return 'Ton pari : ' + prenom + ', aucune des quatre raisons.'; },
    tuAvaisPasse: 'Tu avais passé.',
    cEtait: function (prenom) { return "C'était " + prenom + '.'; },
    // D-024 (§7.13 ; annexe C, point 11.2)
    jumeau: function (auteur, designe) { return "C'était " + auteur + '. ' + designe + ' avait répondu la même chose.'; },
    saRaison: function (raison) { return 'Sa raison : ' + raison; },
    saRaisonAucune: 'Sa raison : aucune des quatre.',
    retournerCarte: 'Retourner la carte',
    points: function (n, m) {
      return N.accordNombre(n, 'point', 'points') + " aujourd'hui" + (m === null ? '' : ' · ' + m + ' cette semaine');
    },
    etLAssemblee: "Et l'Assemblée ?",
    issue: { adopte: 'Texte adopté.', rejete: 'Texte rejeté.' },
    issueParticipe: { adopte: 'adopté', rejete: 'rejeté' },

    /* Vote (S1 §7.9 ; §7.10, E4 ; conventions du 10 octobre 2026) */
    etape: { navette: 'Le Sénat devait encore voter.', definitif: "C'était le vote définitif du Parlement.", aucune: '' },
    objet: {
      texte: '',
      article: "C'était un article d'un texte plus long.",
      amendement: "C'était un amendement, une modification d'un texte en discussion.",
      resolution: "C'était une résolution, un texte qui invite le Gouvernement à agir, sans l'y obliger."
    },
    etapeTexte: { navette: 'Le Sénat devait encore voter ce texte.', aucune: '' },
    suite: { texte_tombe: "Avec lui, l'Assemblée a rejeté le texte entier.", texte_retire: 'Le jour même, le texte entier a été retiré.' },
    avantArticles: ', avant même l\'examen de ses articles.',
    leDate: function (date) { return 'Le ' + date + '.'; },
    leDateMotion: function (date) { return 'Le ' + date + ", avant même l'examen de ses articles."; },
    voteFiche: function (participe, date) { return 'Vote : ' + participe + ' le ' + date + '.'; },
    voteFicheMotion: function (date) { return 'Vote : rejeté le ' + date + ", avant même l'examen de ses articles."; },
    voteEntree: function (participe, date) { return "L'Assemblée : texte " + participe + ' le ' + date + '.'; },
    voteEntreeMotion: function (date) { return "L'Assemblée : texte rejeté le " + date + ", avant même l'examen de ses articles."; },
    lAssembleeTete: "L'Assemblée :",
    voteTete: 'Vote :',

    /* Auteurs (S1 §7.10 ; §7.11, E5) */
    proposeParGouvernement: 'Proposé par le Gouvernement.',
    proposeParCommission: function (libelle) { return 'Proposé par la ' + libelle + '.'; },
    proposePar: function (nom, suite) { return 'Proposé par ' + nom + ', ' + suite + '.'; },
    sansGroupe: function (mandat) { return mandat + ' sans groupe'; },
    sansGroupeListe: 'sans groupe',
    taRaison: function (raisonPhrase, deNom, suite) { return 'Ta raison, ' + raisonPhrase + ", était l'argument " + deNom + ', ' + suite + '.'; },

    /* Avis du cercle (§7.14, D-025 ; forme §7.23 B) */
    avisLigne: { adopte: "Ton cercle, lui, l'aurait adopté.", rejete: "Ton cercle, lui, l'aurait rejeté.", partage: 'Ton cercle, lui, était partagé.' },
    milieuDesReponses: 'Milieu des réponses',
    avisAria: function (parts, milieu) {
      return 'Réponses du cercle, de très défavorable à très favorable : ' + parts.map(function (x, i) { return POSITIONS[i].toLowerCase() + ', ' + x; }).join(' ; ') +
        '. Milieu des réponses : ' + milieu + '.';
    },
    avisMilieuEntre: function (a, b) { return 'entre ' + a + ' et ' + b; },
    avisPart: { aucune: 'aucune', peu: 'peu', partie: 'une partie', moitie: 'la moitié', plupart: 'la plupart', toutes: 'toutes' },

    maintenantQuestion: "Et maintenant, la question d'aujourd'hui.",
    texteEtSources: 'Le texte et ses sources',
    jouer: 'Jouer',
    badgeRare: 'Badge rare',
    sansFaute: function (noms, pluriel) { return noms + (pluriel ? ' décrochent' : ' décroche') + ' Le Sans-Faute.'; },
    sansFauteLigne: 'Sept jours sans erreur, sans rien passer.',
    // §7.22 : « {Prénom} décroche Le Pas de Côté. » ; la ligne de dessous n'est pas encore écrite (Game design).
    pasDeCote: function (noms, pluriel) { return noms + (pluriel ? ' décrochent' : ' décroche') + ' Le Pas de Côté.'; },
    // Ligne de Game design (§7.22, annexe C point 10) : un titulaire, ou plusieurs sur une seule carte.
    pasDeCoteLigne: function (pluriel) { return pluriel ? "Des réponses à l'opposé de ce que disaient leurs portraits." : "Une réponse à l'opposé de ce que disait son portrait."; },
    titresDeLaSemaine: function (cercle) { return 'Les titres de la semaine · ' + cercle; },
    devin: function (nom) { return 'Le Devin : ' + nom; },
    devinLigne: 'a le mieux deviné les autres cette semaine',
    mystere: function (nom) { return 'Le Mystère : ' + nom; },
    mystereLigne: 'le plus difficile à deviner cette semaine',
    fidele: function (noms) { return 'Le Fidèle : ' + noms; },
    fideleLigne: function (pluriel) { return pluriel ? 'ont répondu les sept jours' : 'a répondu les sept jours'; },
    surpriseSemaine: 'La surprise de la semaine',
    surpriseLigne: 'le texte qui a le plus trompé le cercle',
    voirLeTexte: 'Voir le texte',
    pourToiSemaine: 'Pour toi, cette semaine',

    /* ---------------- Le Cercle, Moi, fiches ---------------- */
    cercleTete: function (cercle) { return cercle + ' ▾'; },
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
    encoreFlous: 'Encore flous',
    // Barre du portrait (§7.15, D-026 ; annexe C point 5)
    barreEtiquette: 'Vers tes premiers curseurs nets',
    barreAria: function (valeur) { return 'Barre du portrait, vers tes premiers curseurs nets : ' + valeur + '.'; },
    barreValeurs: ['pas encore commencée', "moins d'un quart du chemin", 'un quart du chemin', 'la moitié du chemin', 'trois quarts du chemin', 'pleine'],
    semaine: function (n) { return 'Semaine ' + n; },
    titresMoi: function (titres, cercle) { return titres + ' · ' + cercle; },
    pasDeTitreAvant: 'Pas encore de titre. Les titres tombent le dimanche, à 18h.',
    pasDeTitreApres: 'Pas encore de titre. Les prochains tombent dimanche, à 18h.',
    historiqueGauche: function (jour, titre) { return majuscule(jour) + ' · ' + titre; },
    historiqueEntree: function (titre) { return 'Pour commencer · ' + titre; },
    historiqueRevele: function (position, jour) { return position + ' · révélé ' + jour + ' à 18h'; },
    revele: function (jour) { return 'révélé ' + jour; },
    voteEtAuteurs: function (jour) { return 'Le vote et les auteurs : ' + jour + ' à 18h'; },
    taReponse: 'Ta réponse :',
    quatreRaisons: 'Les quatre raisons',
    sources: 'Sources : extraits des débats',
    extrait: function (i) { return 'Extrait ' + i; },
    voirScrutin: "Voir le scrutin sur le site de l'Assemblée",
    titresPassesTitre: 'Titres des semaines passées',
    reglagesTitre: 'Réglages',
    compte: 'Compte',
    connexion: 'Connexion',
    connexionValeur: { apple: 'Apple', google: 'Google', email_valider: 'toi@exemple.fr', email_plus_tard: 'toi@exemple.fr' },
    cercles: 'Cercles',
    cerclesActions: 'Changer · Créer · Quitter',
    message18hTitre: 'Message de 18h',
    recevoirMessage: 'Recevoir le message de 18h',
    tesDonnees: 'Tes données',
    toutEffacer: 'Tout effacer',
    // Lecteur d'écran (§7.16)
    barreCercleAria: function (entre, nets, flous) {
      var l = ['Entre ' + entre + '.'];
      if (nets.length) { l.push('Nets : ' + nets.join(' ; ') + '.'); }
      if (flous.length) { l.push('Encore flous : ' + flous.join(', ') + '.'); }
      return l.join(' ');
    },
    versPole: function (pole) { return 'vers ' + pole; },
    auMilieu: 'au milieu',
    encoreFlouMin: 'encore flou',
    superpositionAria: function (tension, toi, prenom, lui) { return tension + ' : toi, ' + toi + ' ; ' + prenom + ', ' + lui + '.'; },

    /* ---------------- Cadre (en « vous ») ---------------- */
    barreDebut: 'Début',
    barreJour: function (k, jour) { return 'Jour ' + k + ' · ' + jour; },
    barreSaut: function (n) { return n === 1 ? 'Premier saut' : 'Second saut'; },
    barreRattrapage: function (n, k, total) { return (n === 1 ? 'Premier saut' : 'Second saut') + ' · texte ' + k + ' sur ' + total; },
    barreCloture: 'Clôture',
    barreArretJour: function (k) { return 'Essai arrêté au jour ' + k; },
    barreArretEntree: "Essai arrêté pendant l'entrée",
    barreArretSaut: function (n) { return 'Essai arrêté pendant le ' + (n === 1 ? 'premier' : 'second') + ' saut'; },
    arreterLEssai: "Arrêter l'essai",
    quiEstQuiBouton: 'Qui est qui ?',
    jourSuivant: 'Jour suivant',
    jourSuivantIndisponible: 'Jour suivant, indisponible tant que la journée n\'est pas finie',
    abandonnerJournee: 'Abandonner cette journée',
    abandonnerQuestion: 'Abandonner cette journée ?',
    abandonnerDefinitif: 'Vous ne pourrez pas y revenir.',
    abandonner: 'Abandonner',
    avancerAuDimanche: 'Avancer au dimanche',
    texteSuivantCadre: 'Texte suivant',
    texteSuivantIndisponible: 'Texte suivant, indisponible tant que vous n\'avez pas répondu',
    allerAuDimanche: 'Aller au dimanche',
    continuer: 'Continuer',
    annuler: 'Annuler',
    pasDansLEssai: "Pas dans l'essai.",

    // Phrases de perte (§8.1 bis)
    perteRevelation: 'La révélation s\'arrêtera là.',
    perteRevelationTitres: 'La révélation s\'arrêtera là, sans les titres ni votre phrase de la semaine.',
    perteRevelationPhrase: 'La révélation s\'arrêtera là, sans votre phrase de la semaine.',
    perteDevinerJamais: "Vous ne devinerez pas les réponses d'hier, et vous ne répondrez pas au texte du jour.",
    perteAucunVisage: function (n) {
      var sujet = n === 1 ? 'Votre carte comptera' : (n === 2 ? 'Vos deux cartes compteront' : 'Vos trois cartes compteront');
      return sujet + ' comme ' + (n === 1 ? 'passée' : 'passées') + ', et vous ne répondrez pas au texte du jour.';
    },
    perteCertainsVisages: function (n) {
      return 'Les visages déjà posés comptent comme si vous aviez validé ; ' + (n === 1 ? 'la carte sans visage comptera comme passée' : 'les deux cartes sans visage compteront comme passées') +
        '. Vous ne répondrez pas au texte du jour.';
    },
    perteTousVisages: 'Les visages déjà posés comptent comme si vous aviez validé. Vous ne répondrez pas au texte du jour.',
    perteReponse: 'Vous ne répondrez pas au texte du jour.',
    perteReponsePosition: 'Vous ne répondrez pas au texte du jour : une position sans raison ne compte pas.',

    // Notes de la bande
    noteCompte: function (appareil) { return 'Compte simulé : choisissez un pseudo, puis l\'un des trois boutons. Rien ne se connecte et rien n\'est envoyé, ni à Apple, ni à Google, ni par e-mail. Le pseudo reste dans votre ' + appareil + '.'; },
    notePrenom: 'Ce pseudo ressemble trop au prénom d\'un personnage : choisissez-en un autre.',
    noteRond: 'Ce pseudo donnerait le même rond qu\'un personnage : ajoutez une lettre.',
    noteApple: 'Dans le jeu, Apple vous demanderait ici de partager votre adresse e-mail ou de la masquer, puis de confirmer avec Face ID, Touch ID ou votre code. Dans l\'essai, rien ne s\'est connecté.',
    noteGoogle: 'Dans le jeu, Google vous demanderait ici de choisir votre compte ; seul un compte personnel serait accepté, pas celui d\'un employeur ou d\'une école. Dans l\'essai, rien ne s\'est connecté.',
    note18h: "Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez.",
    noteAccelere: function (fois) { return "Dans l'essai, votre portrait avance environ " + fois + ' fois plus vite que dans le jeu.'; },
    noteBarrePleine: "Votre barre est pleine. Ce qu'elle annoncera au bout, dans le jeu, n'est pas encore décidé : ici, elle reste pleine.",
    noteApresSaut: function (jours) { return 'Vous avez avancé de ' + jours + ' jours. Comme vous n\'avez rien deviné pendant le saut, la révélation de ce soir commence au vote.'; },
    noteDernierTexte: "Le texte de dimanche ne sera pas deviné : l'essai s'arrête avant. Voici quand même son vote et ses auteurs.",
    nombresEnLettres: { 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 12: 'douze' },

    allerJourSuivant: 'Aller au jour suivant',

    // Page A (§8.2), partie du premier essai
    ancienneTitre: 'La partie du premier essai est encore là',
    ancienneTexte: function (appareil) { return 'Votre ' + appareil + " garde encore vos réponses du premier essai. Elles ne servent plus, et l'essai ne garde qu'une partie à la fois : la page les efface avant de commencer. Votre carnet du premier essai, déjà dans la conversation, n'est pas touché."; },
    // Cas rare des deux parties (§8.2 A, UX, relu par Juridique le 10 octobre 2026).
    ancienneTitreDeux: 'Une partie du premier essai est revenue',
    ancienneTexteDeux: function (appareil) { return 'Votre ' + appareil + " garde de nouveau une partie du premier essai, avec vos réponses s'il y en a. Elles ne servent plus : la page les efface quand vous touchez le bouton. Ni votre partie du second essai ni votre carnet du premier essai, déjà dans la conversation, ne sont touchés."; },
    effacerEtCommencer: 'Effacer et commencer',
    effacerEtReprendre: 'Effacer et reprendre',
    ancienneConfirmationTitre: 'Effacer la partie du premier essai ?',
    ancienneConfirmation: "C'est définitif.",
    effacer: 'Effacer',

    // Page B (§8.2), texte de Juridique revalidé le 9 octobre 2026
    message0: function (appareil) {
      return [
        'Vos réponses restent dans votre ' + appareil + '.',
        "La page n'envoie rien, pas même à l'équipe. Pour que personne d'autre ne les voie, et pour ne pas les perdre :",
        [
          "Jouez toujours depuis l'icône « Essai » : c'est elle qui garde votre avancement. Ne la supprimez pas avant la fin de l'essai : cela pourrait tout effacer.",
          "Ne laissez personne d'autre ouvrir l'icône « Essai ».",
          'Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.',
          "Dans la conversation, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit : vos phrases, votre portrait, votre place dans Le Cercle et sur l'écran d'un proche, l'avis du cercle.",
          "Avant d'envoyer une capture d'écran, vérifiez qu'on n'y voit rien de tout cela, ni votre Historique. L'équipe connaît les réponses des personnages : une capture de l'avis du cercle suffirait à retrouver la vôtre. Et une capture reste dans vos photos, même après « Tout effacer »."
        ]
      ];
    },

    // Page C (§8.2), page d'arrivée
    arriveeTitre: function (cercle) { return 'Le cercle ' + cercle + ' joue depuis trois mois'; },
    arriveePanneau1: function (persos, inv) {
      return N.listeEt(persos) + ', les personnages du premier essai, y jouent ensemble. ' + inv + ' vous lance un défi : vous y entrez comme un nouveau venu. Vous ne verrez pas leurs révélations passées, seulement ce qu\'elles ont laissé : les titres, les tempéraments, la place de chacun sur les tensions.';
    },
    arriveeProgrammeTitre: 'Le programme',
    arriveeProgramme: [
      'Lundi, mardi, mercredi : vous jouez.',
      'Un saut vous mène au dimanche : vous répondez d\'affilée aux textes des jours sautés, sans deviner.',
      'Dimanche : vous jouez, avec les titres de la semaine.',
      'Un second saut, de la même façon, vous mène au dimanche suivant.',
      "Second dimanche : vous jouez, puis l'essai se termine."
    ],
    arriveeDuree: 'Vingt à vingt-cinq minutes en tout, en une ou plusieurs fois.',
    arriveePortraitTitre: 'Votre portrait va plus vite',
    arriveePortrait: function (fois) {
      return 'Dans le jeu, les premiers curseurs nets viennent vers trois mois. Ici, votre portrait avance environ ' + fois +
        ' fois plus vite : au second dimanche, il ressemblera à celui de trois mois de jeu. Mais il ne repose que sur vos réponses de l\'essai : une seule peut le faire basculer.';
    },
    arriveeFin: "Comme la première fois, n'ouvrez pas le dossier « a-ne-pas-ouvrir-2 » du dépôt avant la fin. La fiche des personnages reste à portée, par le bouton « Qui est qui ? ».",
    commencer: 'Commencer',

    // Fiche « Qui est qui » (S1 §8.2, en-tête inchangé ; §8.2)
    quiEstQuiTitre: "Qui est qui · fiche d'essai.",
    quiEstQuiEntete: "Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées.",
    ficheTete: function (age, metier, ville) { return ', ' + age + ' ans · ' + metier + ', ' + ville + '.'; },
    ficheHeure: function (heure) { return "Joue d'habitude vers " + heure + '.'; },
    ficheInvitant: "C'est lui qui vous invite.",

    // « Qui, durée, droits » (S1 §8.9 ; phrase ajoutée au §8.9 du second essai)
    droitsTitre: "Version d'essai. La vraie page sera écrite avant le lancement et relue par un avocat.",
    droits: function (appareil) {
      return [
        "Qui voit vos réponses : vous seulement, si personne d'autre n'ouvre l'icône « Essai ». Elles restent dans votre " + appareil + " : c'est l'icône « Essai » qui les garde. La page n'envoie rien, pas même à l'équipe. GitHub, qui héberge la page, voit l'adresse internet de votre connexion quand vous l'ouvrez, jamais vos réponses. Les boutons Apple et Google de l'écran du compte sont dessinés : ils ne se connectent à rien, et la page n'envoie rien à Apple ni à Google.",
        "Durée : jusqu'à ce que vous les effaciez. Elles peuvent aussi se perdre, par exemple si vous supprimez l'icône « Essai ».",
        'Droits : « Tout effacer » (dans Moi, la roue dentée) les efface, quand vous voulez.'
      ];
    },
    piedHebergeur: 'Page d\'essai non commerciale, hébergée par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
    piedSource: function (date) {
      return "Source des textes, votes, auteurs et arguments : Assemblée nationale, data.assemblee-nationale.fr (Licence Ouverte) et assemblee-nationale.fr ; consultés le " + date + ". Résumés et raisons réécrits par l'équipe de l'essai ; l'Assemblée n'y est pas associée.";
    },

    // Page du saut (§8.1 ter)
    sautTitre: 'Avancer au dimanche',
    friseLegendeJoue: 'vous jouez',
    friseLegendeRepond: 'vous répondez seulement',
    friseReprise: 'vous reprenez ici',
    friseInitiales: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    friseSemaine: function (n) { return 'Semaine ' + n; },
    friseAria1: 'Lundi, mardi et mercredi : vous avez joué. Jeudi, vendredi et samedi : vous répondez seulement. Dimanche : vous reprenez ici.',
    friseAria2: 'Semaine 1 : vous avez joué lundi, mardi, mercredi et dimanche ; jeudi, vendredi et samedi, vous avez répondu seulement. Semaine 2 : du lundi au samedi, vous répondez seulement. Dimanche : vous reprenez ici.',
    sautTexte1: {
      tete: 'Jeudi, vendredi et samedi :',
      puces: [
        'Agathe, Nassim, Odile et Valentin jouent comme chaque jour.',
        'Vous répondez d\'affilée aux trois textes de ces jours-là, sans deviner. Environ une minute.',
        'Ces réponses comptent comme les autres, pour votre portrait comme pour Le Fidèle.',
        'Les révélations de vendredi et de samedi ont lieu sans vous. Leurs votes et leurs auteurs seront dans votre Historique.'
      ],
      fin: 'Dimanche à 18h : la révélation, puis les titres de la semaine.'
    },
    sautTexte2: {
      tete: 'Du lundi au samedi :',
      puces: [
        'Agathe, Nassim, Odile et Valentin jouent comme chaque jour.',
        'Vous répondez d\'affilée aux six textes de ces jours-là, sans deviner. Environ deux minutes.',
        'Ces réponses comptent comme les autres, pour votre portrait comme pour Le Fidèle.',
        'Les révélations de mardi à samedi ont lieu sans vous. Leurs votes et leurs auteurs seront dans votre Historique.'
      ],
      fin: 'Dimanche à 18h : la révélation, puis les titres de la semaine. C\'est le dernier jour de jeu.'
    },

    // Carnet du jour (§8.3)
    carnetTitre: 'Votre carnet du jour',
    momentPrefere: 'Votre moment préféré :',
    momentPrefereDimanche: "Aujourd'hui, votre moment préféré :",
    choixMoment: { defi: function (inv) { return 'Le défi ' + N.dePrenom(inv); }, revelation: 'La révélation', titres: 'Les titres', phrase_semaine: 'Ma phrase de la semaine',
      deviner: 'Deviner', donner_avis: 'Donner mon avis', phrase_jour: 'Ma phrase du jour', aucun: 'Aucun' },
    questionSautClair: 'Ce que le jeu a fait pendant le saut, c\'était clair ?',
    choixSautClair: { non: 'Non', en_partie: 'En partie', oui: 'Oui' },
    questionHesite: 'Cette semaine, où avez-vous hésité ?',
    questionHesiteSous: 'Sur ce qu\'il fallait faire ou comprendre. Plusieurs choix possibles ; pour « Ailleurs », dites où dans la conversation.',
    choixHesite: { deviner: 'Deviner', repondre: 'Répondre', revelation: 'La révélation', avis_cercle: "L'avis du cercle", titres: 'Les titres', cercle: 'Le Cercle',
      portrait: 'Mon portrait', saut: 'Le saut', ailleurs: 'Ailleurs', nulle_part: 'Nulle part' },
    questionMomentSemaine: 'Cette semaine, votre moment préféré :',
    choixMomentSemaine: { revelation: 'La révélation', avis_cercle: "L'avis du cercle", titres: 'Les titres', phrase_semaine: 'Ma phrase de la semaine', deviner: 'Deviner',
      donner_avis: 'Donner mon avis', phrase_jour: 'Ma phrase du jour', cercle: 'Le Cercle', portrait: 'Mon portrait', aucun: 'Aucun' },

    // Arrêter l'essai (S1 §8.10 ; §8.10)
    arretConfirmationTitre: "Arrêter l'essai ?",
    arretConfirmation: "Ensuite : quelques questions, votre carnet à copier, puis le dévoilement. C'est définitif : l'essai ne pourra pas reprendre.",
    arretTeteJour: function (k) { return 'Essai arrêté au jour ' + k + '.'; },
    arretTeteEntree: "Essai arrêté pendant l'entrée.",
    arretTeteSaut: function (n) { return 'Essai arrêté pendant le ' + (n === 1 ? 'premier' : 'second') + ' saut.'; },
    arretRaison: 'Vous arrêtez surtout parce que :',
    choixArret: { pas_amuse: "Je ne m'amuse pas", pas_compris: 'Je ne comprends pas tout', pas_le_temps: "Je n'ai pas le temps",
      vu_assez: "J'ai vu ce que je voulais voir", autre: 'Autre raison' },
    f2Arret: "Jusqu'ici, deviner était :",
    choixF2: { de_plus_en_plus: 'De plus en plus amusant', toujours_autant: 'Toujours aussi amusant',
      de_moins_en_moins: 'De moins en moins amusant', jamais: 'Jamais amusant' },

    // Fin d'essai (§8.5)
    clotureTete: "L'essai est fini. Quelques questions, votre carnet à copier, puis le dévoilement.",
    questionsFin: [
      { cle: 'f2', q: "Au fil de l'essai, deviner était :" },
      { cle: 'servi', q: 'Ce qui vous a le plus servi pour deviner :' },
      { cle: 'regle', q: 'Dans Deviner, la règle écrite sous « À qui sont ces réponses ? » vous a paru :' },
      { cle: 'avis', q: "L'avis du cercle, à la révélation :" },
      { cle: 'raisons', q: 'Les quatre raisons, au moment de répondre, vous ont paru :' },
      { cle: 'portrait', q: 'Votre portrait, au second dimanche :' },
      { cle: 'barre', q: 'La barre du portrait :' },
      { cle: 'suspense', q: 'Avec des textes rejetés, « Et l\'Assemblée ? » était :' }
    ],
    choixFin: {
      servi: { souvenir: 'Le souvenir du premier essai', defi: function (inv) { return 'Le défi ' + N.dePrenom(inv); }, revelations: 'Les révélations', cercle: "Le Cercle ou l'écran d'un proche", rien: 'Rien de précis' },
      regle: { pas_claire: 'Pas claire', claire_etrange: 'Claire, mais étrange', claire: 'Claire', pas_lue: "Je ne l'ai pas lue" },
      avis: { sans_apprendre: "Je le lisais sans qu'il m'apprenne grand-chose", apprenait: "Il m'apprenait quelque chose sur le cercle", pas_lu: 'Je ne le lisais pas' },
      raisons: { pas_plus: "Pas plus nuancées qu'au premier essai", un_peu: 'Un peu plus nuancées', nettement: 'Nettement plus nuancées' },
      portrait: { ressemblait_pas: 'Il ne me ressemblait pas', un_peu: 'Il me ressemblait un peu', ressemblait: 'Il me ressemblait', pas_regarde: "Je ne l'ai pas regardé" },
      barre: { pas_remarquee: "Je ne l'ai pas remarquée", sans_savoir: 'Remarquée, sans savoir ce qu\'elle mesurait', comprise: 'Remarquée et comprise' },
      suspense: { sans: 'Sans suspense', un_peu: 'Avec un peu de suspense', vrai: 'Avec un vrai suspense' }
    },
    clotureApres: 'Pour tout le reste, vos mots dans la conversation, sans parler de vos réponses.',

    // Export (S1 §8.7)
    exportTitre: 'Votre carnet à copier',
    carnetAria: 'Carnet du second essai Elenchos',
    copierCarnet: 'Copier mon carnet',
    copierCarnetDabord: "Copier mon carnet d'abord",
    carnetCopie: 'Carnet copié : collez-le dans la conversation.',
    copieEchec: "La copie automatique n'a pas fonctionné. Sélectionnez tout le texte du carnet, jusqu'à « Fin du carnet », copiez-le, puis collez-le dans la conversation.",
    voirDevoilement: 'Voir le dévoilement',

    // Tout effacer (S1 §8.9)
    effacerTitre: 'Tout effacer ?',
    effacerPendant: "La page effacera vos réponses, votre carnet et votre avancement. C'est définitif. Si vous recommencez, vous connaîtrez déjà les réponses des personnages : l'essai ne vaudra plus comme test.",
    effacerApres: 'La page effacera vos réponses et votre carnet. C\'est définitif.',
    effacerInvite: 'Une fois votre carnet copié, vous pouvez tout effacer.',
    efface: 'La page a tout effacé.',

    /* Dévoilement (§8.6 ; textes d'UX et de Game design du 10 octobre 2026 :
       a-ne-pas-ouvrir-2/devoilement.md, gabarits et règles de calcul). Tous regroupés ici. */
    devoilementTitre: 'Le dévoilement',
    devoilementOuverture: "Voici ce que la page vous cachait : comment l'histoire du cercle a été calculée, le profil de chaque personnage, ses réponses données exprès contre ce profil et ses jours sans jouer. Tout en bas, « Pour le contrôle » : l'empreinte à comparer avec celle publiée dans la conversation.",
    commentLire: 'Comment lire',
    commentLireTextes: function (cinq, titreH86) {
      return [
        "Chaque personnage a gardé le profil du premier essai. Pour chaque tension, une place de 0 à 100 : 0 pour la première valeur (Sécurité), 100 pour la seconde (Liberté individuelle) ; de 41 à 59, au milieu. Et une fermeté : plus elle était forte, plus ses réponses s'éloignaient de Neutre, jusqu'à « Très ».",
        'Les réponses de chacun découlaient de son profil, sauf environ une sur ' + cinq + ", tirée au sort et donnée exprès contre ce profil pour que rien ne se devine à coup sûr : le côté opposé, sans « Très » (si le profil donnait Neutre, un côté tiré au sort). Quand ce côté allait contre sa valeur, il prenait l'argument inattendu de ce côté s'il y en avait un (au nom de sa valeur, ou pratique), sinon l'argument attendu. Jamais deux textes de suite pour un même personnage, jamais plus de deux personnages pour un même texte. Deux exceptions : le compte repart de zéro à votre arrivée, et les deux réponses imposées sur « " + titreH86 + " » (panneau suivant).",
        "Chacun s'absentait parfois, par tirage : une chance sur quatorze à chaque texte, jamais deux fois en sept textes de suite (l'histoire et l'essai se comptent chacun à part), jamais plus d'un absent pour un même texte. Ce jour-là, ni réponse ni devinette.",
        "Aux trois textes d'entrée et au texte du dernier jour, personne ne répondait contre son profil ni ne s'absentait.",
        'Toutes les réponses des personnages ont été calculées par des règles fixes, écrites et scellées avant l\'essai, sans rien savoir des vôtres.',
        '« Jour 2 » : le texte répondu le jour 2, deviné le jour 3, révélé le jour 4. « Jour 0 » : la veille de votre arrivée.'
      ];
    },
    /** {cinq} : mot de 1/α + 1 (α = reglage.alpha). */
    motAlpha: { '1/6': 'sept', '1/4': 'cinq', '1/3': 'quatre' },
    avantTitre: 'Avant votre arrivée',
    avantTextes: function (titreH86, r) {
      return [
        "Les treize semaines d'avant votre arrivée ont été calculées avec les mêmes règles, sur des textes sans titre ni mots : pour chacun, seulement une tension, la valeur qu'il faisait passer devant l'autre, et quatre raisons réduites à leur côté et à la valeur qu'elles servaient. Une seule exception : « " + titreH86 + ' », la surprise de la semaine que vous avez vue en arrivant. Sur ce texte, deux personnages ont répondu exprès contre leur profil, pour qu\'il devienne cette surprise.',
        "Pour ressembler à un cercle de trois mois, cette histoire devait remplir des conditions écrites avant l'essai : des curseurs nets pour chacun, des tempéraments, cette surprise de la semaine, des titres variés. Le calcul a été refait, tirage après tirage, jusqu'au premier qui les remplissait. Tirage retenu : " + r + '.'
      ];
    },
    pourVousTitre: "Ce que l'essai changeait pour vous",
    pourVousFacteur: function (trois, six) {
      return 'Votre portrait comptait chacune de vos réponses ' + trois + " fois ; le portrait de chaque personnage comptait chacune des siennes une fois ; et avec quatre tensions seulement, chacune revenait deux fois plus souvent que dans le jeu. Votre portrait avançait donc environ " + six + ' fois plus vite.';
    },
    pourVousCurseurs: function (nS, nP, nT, nL, seuil, fermees) {
      return "En tout, entrée et dernier jour compris, vous aviez " + nS + (nS >= 2 ? ' textes' : ' texte') + ' sur Sécurité ou Liberté individuelle, ' + nP + ' sur Précaution ou Innovation, ' + nT +
        ' sur Tradition ou Changement et ' + nL + ' sur Local ou National. Un curseur devenait net quand ses réponses pesaient au moins ' + seuil +
        " : une réponse favorable ou défavorable avec un argument attendu pèse 1 ; avec un argument pratique ou aucune des quatre raisons, 1/2 ; avec un argument au nom de l'autre valeur, 0 ; Neutre, 0. Avec si peu de réponses, une seule qui pèse 0 pouvait suffire à l'empêcher." +
        (fermees ? ' Sur ' + fermees + ', votre curseur ne pouvait pas devenir net.' : '');
    },
    /** {seuil} : 10/f écrit en mots (f = 2, 3, 4). */
    motSeuil: { 2: '5', 3: '3 et 1/3', 4: '2 et 1/2' },
    pasDeCotePossible: function (jours) { return 'Le Pas de Côté ne vous était possible qu\'à la révélation ' + jours + ', et seulement si votre curseur y était déjà net.'; },
    pasDeCoteJour: function (j, tension) { return 'du jour ' + j + ', sur ' + tension; },
    /** liste : les jours n + 2, règle de liste du §8.12 (« 7 et 8 », « 7, 8 et 14 »). */
    pasDeCoteJours: function (liste) { return 'des jours ' + liste + ', chacun sur la tension de son texte'; },
    pasDeCoteImpossible: 'Le Pas de Côté vous était impossible : aucun de vos curseurs ne pouvait être net assez tôt.',
    pourVousTitres: function (pts14, pts15) {
      return 'Les sauts vous ont fermé un titre et en ont presque fermé un autre. Vos cartes ne pouvaient être révélées que trois jours la première semaine et un jour la seconde ; celles des personnages, presque chaque jour. Le Sans-Faute demande des cartes révélées au moins cinq jours de la semaine : il vous était impossible. Le Devin va à qui marque le plus de points dans la semaine : vous pouviez en marquer au plus ' +
        pts14 + ' la première semaine et ' + pts15 + ' la seconde, quand un personnage pouvait en marquer jusqu\'à trois par jour.';
    },
    pourVousSupprimer: 'Tous les textes dont le titre commençait par « Supprimer » ont été rejetés : ce premier mot laissait deviner le vote.',
    phraseProfil: {
      Agathe: 'Faite pour ressembler à Nassim, sauf entre local et national.',
      Nassim: 'Fait pour ressembler à Agathe, sauf entre local et national.',
      Odile: 'Tranchée : loin du milieu et fermeté forte, sur les quatre tensions.',
      Valentin: 'Des valeurs que sa vie ne laisse pas deviner.'
    },
    titrePersonnage: function (prenom, age, metier, ville) { return prenom + ', ' + age + ' ans · ' + metier + ', ' + ville; },
    ligneProfil: function (p0, p1, lecture, p, fermete) { return p0 + ' ou ' + p1 + ' : ' + lecture + ' (' + p + ' sur 100, fermeté ' + fermete + ').'; },
    auMilieuProfil: 'au milieu',
    reponsesContre: "Réponses contre son profil pendant l'essai :",
    reponsesContreAucune: "Réponses contre son profil pendant l'essai : aucune.",
    jourTitre: function (n, titre) { return 'Jour ' + n + ' · ' + titre; },
    profilNeutre: 'Son profil donnait Neutre.',
    aDeviner: function (n) { return "Vous l'aviez à deviner le jour " + n + '.'; },
    joursSansJouer: function (liste) { return "Jours sans jouer pendant l'essai : " + liste + '.'; },
    joursSansJouerAucun: "Jours sans jouer pendant l'essai : aucun.",
    avantArrivee: function (a, b, m, total) {
      return 'Avant votre arrivée : ' + a + ' ' + (a >= 2 ? 'réponses' : 'réponse') + ' contre son profil sur ' + b + ', et ' + m + ' ' + (m >= 2 ? 'jours' : 'jour') + ' sans jouer sur ' + total + '.';
    },
    temperamentsAucun: 'Ses tempéraments au second dimanche : aucun.',
    temperamentsTete: 'Ses tempéraments au second dimanche, sur les huit semaines précédentes :',
    temperamentsRegles: {
      original: "L'Original : seul de son côté, favorable ou défavorable, sur au moins 3 de ses réponses sur 10.",
      pont: 'Le Pont : quand les autres se partageaient entre favorable et défavorable, seul à répondre Neutre, sur au moins 1 de ces textes sur 8 (et au moins 6 textes ainsi partagés).',
      mesure: 'Le Mesuré : Neutre sur au moins 1 de ses réponses sur 3.',
      tranche: 'Le Tranché : « Très favorable » ou « Très défavorable » sur au moins 1 de ses réponses sur 2.'
    },
    pourLeControle: 'Pour le contrôle',
    empreinteDe: 'Empreinte du fichier scellé :',
    comparez: function (date, heure) { return 'Si vous le voulez, comparez-la, ligne par ligne, avec celle publiée dans la conversation le ' + date + ' à ' + heure + ' : elles doivent être identiques. Si un seul caractère diffère, dites-le dans la conversation.'; },
    graine: 'Graine :',
    tirage: "Tirage retenu pour l'histoire :",
    fichierScelle: 'Fichier scellé :',
    devoilementFin: 'Les règles et le lot du second essai sont dans « a-ne-pas-ouvrir-2 » : vous pouvez maintenant l\'ouvrir.',
    devoilementEffacer: 'Si votre carnet est bien dans la conversation, vous pouvez tout effacer.',

    /* Arrêts techniques (S1 §8.11 ; §8.9 du second essai : repère V6, « V1 à V6 ») */
    arretVerifTitre: "La page s'est arrêtée par précaution.",
    arretVerif: "À chaque ouverture, elle vérifie ses données et ses calculs. Cette fois, une vérification n'a pas donné le bon résultat : plutôt que de vous faire jouer sur un calcul peut-être faux, elle préfère s'arrêter.",
    arretVerifGardee: function (appareil) { return "Rien n'est effacé : ce que vous avez déjà joué reste dans votre " + appareil + '.'; },
    arretVerifRepere: ['Dites-le dans la conversation, avec ce repère : ', '. On vous dira quand rouvrir la page.'],
    arretVerifRienEfface: "Cette page n'a rien effacé.",
    arretVerifRepereM1: ["Gardez l'icône « Essai » et dites-le dans la conversation, avec ce repère : ", '. On vous dira quand rouvrir la page.'],
    arretStockageTitre: 'La page ne peut pas garder vos réponses.',
    arretStockage: function (appareil) { return 'Pour les retrouver d\'un jour à l\'autre, elle doit les enregistrer dans votre ' + appareil + ". Ouverte depuis cette icône, elle n'y arrive pas : elle s'arrête donc avant de vous faire jouer. Si vous aviez déjà commencé l'essai, cette page n'a rien effacé. Gardez l'icône et dites-le dans la conversation : l'équipe vous dira quoi faire."; },
    arretDoubleTitre: "La page s'est ouverte deux fois en même temps.",
    arretDouble: "Pour ne rien écraser, cet écran s'est arrêté ; votre dernier geste ici n'a pas été gardé.",
    reprendreIci: 'Reprendre ici',
    arretDoublePetit: 'Vous retrouverez la partie telle qu\'elle a été gardée en dernier.',

    /* Écran couché (S1 §8.1) */
    coucheTitre: function (appareil) { return 'Tenez votre ' + appareil + ' en hauteur.'; },
    couche: 'En largeur, le téléphone de l\'essai ne tient pas dans l\'écran. Rien n\'est perdu : redressez l\'écran, et vous reprendrez où vous en étiez.',

    /* Écrans hors de l'icône (S1 §8.13, inchangés) */
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
