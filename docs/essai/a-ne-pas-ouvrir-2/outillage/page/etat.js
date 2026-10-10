/* État de la partie du second essai, format 2 (outillage d'essai, D-001 tenu ; lot 1).
 *
 * L'état est ce que la page garde sous la clé `elenchos-essai:partie-2`
 * (simulation-2.md, §8.8), en une seule écriture par geste. Il contient :
 * - le journal des entrées, version 4 (a-ne-pas-ouvrir-2/schema.md,
 *   partie 4.4) : jours atteints, sauts confirmés, arrêt, fin ;
 * - ce que la page seule garde : l'horloge de premier plan et ses repères
 *   (durées, §8.4), le compteur d'écritures (arrêt 3), et deux sacs laissés
 *   aux écrans (instance B) : `vue` et, par jour ou par saut, `page`.
 *
 * Toutes les fonctions sont pures au sens du moteur : elles ne lisent ni
 * l'écran, ni la mémoire, ni l'horloge, ni le hasard. Une transition
 * modifie l'état reçu en place et lève ErreurEtat si le geste n'est pas
 * permis : l'appelant (socle.js) écrit ensuite l'état d'un bloc. Une
 * transition = un geste = une écriture.
 *
 * Aucun numéro de jour n'est écrit ici : tout se lit dans `cal`.
 * Renvois : « §n » = simulation-2.md ; « partie n » = schema.md du second essai.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) {
  var ElenchosNoyau = require('./noyau.js');
  var ElenchosJournal = require('./journal.js');
}
/*node-fin*/

var ElenchosEtat = (function (N, J) {
  var FORMAT = 2;
  var PERSONNAGES = ['Agathe', 'Nassim', 'Odile', 'Valentin'];
  /** Repères de durée d'un jour (valeurs de l'horloge de premier plan, en ms). */
  var REPERES_JOUR = ['ouverture', 'dernier', 'fige', 'entreeDebut', 'entreeFin', 'devDebut', 'devDernier',
    'repDebut', 'repFin', 'repContinuer', 'pageSaut'];
  /** Repères de durée d'un saut. */
  var REPERES_SAUT = ['page', 'confirme', 'dernier', 'fin'];

  function ErreurEtat(message) {
    var e = new Error('état : ' + message);
    e.name = 'ErreurEtat';
    return e;
  }
  function exiger(c, m) { if (!c) { throw ErreurEtat(m); } }
  function cles(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).sort().join(',') : null; }
  function copie(v) { return JSON.parse(JSON.stringify(v)); }
  function ouvertVide() { return { cercle: 0, moi: 0, proche: 0, qui_est_qui: 0 }; }
  function reperesVides(liste) { var o = {}; liste.forEach(function (k) { o[k] = null; }); return o; }

  /* ================================================================== */
  /* Construction                                                       */
  /* ================================================================== */

  /** Les coups d'un jour qui vient d'être atteint (partie 4.3.3) : null là où le coup n'existe pas ce jour-là. */
  function coupsVides(cal, j) {
    var arrivee = cal.estArrivee(j);
    var entree = null;
    if (arrivee) { entree = {}; cal.textesEntree.forEach(function (E) { entree[E] = { pari: null, reponse: null }; }); }
    return {
      abandon: cal.estJoue(j) ? false : null,
      annuler_saut: cal.estPointDeSaut(j) ? 0 : null,
      carnet: { hesite: null, moment: null, moment_semaine: null, saut_clair: null },
      compte: null,
      consentement: null,
      deviner: null,
      entree: entree,
      ouvert: ouvertVide(),
      pendant_deviner: null,
      pseudo: null,
      relire: 0,
      reponse: null,
      rouvrir: 0
    };
  }

  /** Un jour atteint. `versions` commence vide : le premier toucher y met le numéro de la page. */
  function nouveauJour(cal, j) {
    var joue = cal.estJoue(j);
    return {
      ouverture: null,
      versions: cal.aUneOuverture(j) ? [] : null,
      etapes: joue ? { deviner: false, entree: cal.estArrivee(j) ? false : null, repondre: false } : null,
      coups: coupsVides(cal, j),
      pp: reperesVides(REPERES_JOUR),
      page: {}
    };
  }

  function nouvelEtat(cal) {
    var jours = {};
    jours[String(cal.premier)] = nouveauJour(cal, cal.premier);
    return {
      format: FORMAT,
      ecritures: 0,
      /** Horloge de premier plan de toute la partie, en ms (§8.4) ; les repères en sont des lectures. */
      horloge: 0,
      jours: jours,
      sauts: [],
      arret: null,
      fin: null,
      /** Aux écrans (instance B) : ce que montrent le téléphone et le cadre. */
      vue: {}
    };
  }

  /* ================================================================== */
  /* Lecture                                                            */
  /* ================================================================== */

  function K(etat) {
    var k = null;
    Object.keys(etat.jours).forEach(function (x) { if (k === null || +x > k) { k = +x; } });
    return k;
  }
  function jour(etat, j) { var d = etat.jours[String(j)]; exiger(!!d, 'jour non atteint : ' + j); return d; }
  function jourCourant(etat) { return jour(etat, K(etat)); }

  /** Le saut confirmé dont « Aller au dimanche » n'a pas encore été touché, ou null. */
  function sautEnCours(etat) {
    var s = etat.sauts[etat.sauts.length - 1];
    return s && s.pp.fin === null ? s : null;
  }

  /** Où en est le rattrapage (§7.4, §8.1 ter) : le saut en cours, le texte à montrer, et s'il est fini. */
  function rattrapage(etat, cal) {
    var s = sautEnCours(etat);
    if (!s) { return null; }
    var cs = cal.saut(s.numero);
    var repondus = 0;
    cs.jours.forEach(function (j) { var d = etat.jours[String(j)]; if (d && d.coups.reponse !== null) { repondus++; } });
    var fini = repondus === cs.textes.length;
    return {
      numero: s.numero, total: cs.textes.length, repondus: repondus, termine: fini,
      /** Rang (1, 2…) du texte affiché : le dernier atteint (« texte {k} sur {n} », §8.1). */
      rang: s.textes_atteints,
      jour: fini ? null : cs.jours[repondus],
      texte: fini ? null : cs.textes[repondus],
      reprise: cs.reprise
    };
  }

  /** La journée du jour j est-elle finie (« Jour suivant » actif, §8.1 bis) ? */
  function journeeFinie(etat, cal, j) {
    var d = jour(etat, j);
    if (!cal.estJoue(j)) { return false; }
    if (cal.estArrivee(j) && d.coups.compte === null) { return false; }
    return d.coups.reponse !== null;
  }

  /* ================================================================== */
  /* Horloge et touchers                                                */
  /* ================================================================== */

  /**
   * Toucher compté (§8.4 du premier essai, inchangé ; partie 4.3.2). Pendant
   * un saut confirmé et pas fini, il compte dans le saut ; sinon dans le jour
   * courant, s'il a une ouverture. lireInstant() n'est appelée qu'au premier
   * toucher d'un jour (seule lecture de l'heure, §8.8, « L'heure »).
   */
  function toucher(etat, cal, horloge, version, lireInstant) {
    var s = sautEnCours(etat);
    if (s) { s.pp.dernier = horloge; return 'saut'; }
    var k = K(etat), d = jour(etat, k);
    if (!cal.aUneOuverture(k)) { return 'aucun'; }
    if (d.pp.fige !== null) { return 'fige'; }
    if (d.ouverture === null) { d.ouverture = lireInstant(); d.pp.ouverture = horloge; }
    if (d.versions.length === 0 || d.versions[d.versions.length - 1] !== version) { d.versions.push(version); }
    d.pp.dernier = horloge;
    return 'jour';
  }

  /** Pose un repère de durée du jour j (premier affichage d'un écran, fin d'une étape) ; une seule fois. */
  function marquer(etat, j, nom, horloge, remplacer) {
    exiger(REPERES_JOUR.indexOf(nom) >= 0 && nom !== 'ouverture' && nom !== 'dernier', 'repère inconnu : ' + nom);
    var d = jour(etat, j);
    if (d.pp[nom] === null || remplacer) { d.pp[nom] = horloge; }
  }

  /* ================================================================== */
  /* Entrée (jour d'arrivée)                                            */
  /* ================================================================== */

  function entreeDe(etat, cal) { return jour(etat, cal.premier).coups; }
  function texteEntreeCourant(etat, cal) {
    var e = entreeDe(etat, cal).entree;
    for (var i = 0; i < cal.textesEntree.length; i++) { if (e[cal.textesEntree[i]].pari === null) { return cal.textesEntree[i]; } }
    return null;
  }
  /** Premier affichage de 1.2 : étape « entree » et début de la durée de l'entrée (§8.12). */
  function afficherEntree(etat, cal, horloge) {
    var d = jour(etat, cal.premier);
    d.etapes.entree = true;
    if (d.pp.entreeDebut === null) { d.pp.entreeDebut = horloge; }
  }
  function consentir(etat, cal) { entreeDe(etat, cal).consentement = true; }
  function repondreEntree(etat, cal, scelle, E, rep) {
    var c = entreeDe(etat, cal);
    exiger(E === texteEntreeCourant(etat, cal) && c.entree[E].reponse === null, 'texte d\'entrée hors de son tour : ' + E);
    exiger(c.consentement === true, 'réponse avant le consentement');
    exiger(J.estReponse(scelle, E, rep), 'réponse invalide');
    c.entree[E].reponse = { niveau: rep.niveau, raison: rep.raison };
  }
  function parierEntree(etat, cal, E, niveau) {
    var c = entreeDe(etat, cal);
    exiger(E === texteEntreeCourant(etat, cal) && c.entree[E].reponse !== null, 'pari hors de son tour : ' + E);
    exiger(Number.isSafeInteger(niveau) && niveau >= 1 && niveau <= 5, 'pari invalide');
    c.entree[E].pari = niveau;
  }
  /** Fin du compte (D-035) : pseudo et voie écrits ensemble (partie 4.4, règle 6). Arrête la durée de l'entrée. */
  function terminerCompte(etat, cal, pseudo, voie, horloge, confusables) {
    var c = entreeDe(etat, cal);
    exiger(texteEntreeCourant(etat, cal) === null, 'compte avant le dernier pari');
    exiger(c.compte === null, 'compte déjà fait');
    exiger(J.CODES.compte.indexOf(voie) >= 0, 'voie de compte inconnue');
    exiger(J.pseudoGardable(pseudo, confusables), 'pseudo refusé');
    c.pseudo = pseudo;
    c.compte = voie;
    marquer(etat, cal.premier, 'entreeFin', horloge);
  }

  /* ================================================================== */
  /* Deviner                                                            */
  /* ================================================================== */

  /** Premier affichage de Deviner le jour j, avec n cartes servies (moteur) : une seule écriture (FE-2). */
  function ouvrirDeviner(etat, cal, j, n, horloge) {
    var d = jour(etat, j);
    exiger(cal.ligne(j).deviner_porteur, 'pas de Deviner le jour ' + j);
    exiger(!cal.estArrivee(j) || d.coups.compte !== null, 'Deviner avant la fin du compte');
    exiger(Number.isSafeInteger(n) && n >= 1, 'nombre de cartes');
    if (d.coups.deviner !== null) { return; }
    var cartes = [];
    for (var i = 0; i < n; i++) { cartes.push({ designe: null, raison: null }); }
    d.coups.deviner = { cartes: cartes, validee: false };
    d.coups.pendant_deviner = { cercle: 0, proche: 0 };
    d.etapes.deviner = true;
    d.pp.devDebut = horloge;
    d.pp.devDernier = horloge;
  }
  function devinerOuvert(etat, j) {
    var d = jour(etat, j);
    exiger(d.coups.deviner !== null && !d.coups.deviner.validee, 'Deviner fermé le jour ' + j);
    return d;
  }
  /** Pose un visage, « passe » ou rien sur la carte i. Un visage déjà posé ailleurs quitte sa carte d'origine (R10, FE-2). */
  function poserCarte(etat, j, i, valeur, horloge) {
    var d = devinerOuvert(etat, j), cartes = d.coups.deviner.cartes;
    exiger(i >= 0 && i < cartes.length, 'carte inconnue');
    exiger(valeur === null || valeur === 'passe' || PERSONNAGES.indexOf(valeur) >= 0, 'valeur de carte');
    if (PERSONNAGES.indexOf(valeur) >= 0) {
      cartes.forEach(function (c, k) { if (k !== i && c.designe === valeur) { c.designe = null; c.raison = null; } });
    }
    cartes[i].designe = valeur;
    if (PERSONNAGES.indexOf(valeur) < 0) { cartes[i].raison = null; }
    if (horloge !== undefined) { d.pp.devDernier = horloge; }
  }
  /** Raison devinée sur la carte i (la carte à raison cachée : le moteur dit laquelle). */
  function poserRaison(etat, scelle, cal, j, i, raison, horloge) {
    var d = devinerOuvert(etat, j), c = d.coups.deviner.cartes[i];
    exiger(!!c && PERSONNAGES.indexOf(c.designe) >= 0, 'raison sans visage');
    exiger(raison === null || raison === 'aucune' || (Number.isSafeInteger(raison) && raison >= 1 && raison <= J.nombreRaisons(scelle, cal.texteDevine(j))), 'raison invalide');
    c.raison = raison;
    if (horloge !== undefined) { d.pp.devDernier = horloge; }
  }
  function validerDeviner(etat, j, horloge) {
    var d = devinerOuvert(etat, j);
    exiger(d.coups.deviner.cartes.every(function (c) { return c.designe !== null; }), 'carte vide');
    d.coups.deviner.validee = true;
    if (horloge !== undefined) { d.pp.devDernier = horloge; }
  }

  /* ================================================================== */
  /* Répondre (jours joués et rattrapage)                               */
  /* ================================================================== */

  /** Premier affichage de Répondre un jour joué. */
  function afficherRepondre(etat, cal, j, horloge) {
    var d = jour(etat, j);
    exiger(cal.estJoue(j), 'Répondre un jour non joué');
    d.etapes.repondre = true;
    if (d.pp.repDebut === null) { d.pp.repDebut = horloge; }
  }

  /**
   * Valide une réponse au texte du jour j. Un jour joué : après Deviner
   * validé. Pendant un rattrapage : le texte affiché ; le jour suivant est
   * atteint dans la même écriture (§0, « Ordre des jours dans un saut »).
   */
  function repondre(etat, scelle, cal, j, rep, horloge) {
    exiger(j === K(etat), 'réponse hors du jour courant');
    var d = jour(etat, j);
    exiger(d.coups.reponse === null, 'déjà répondu');
    exiger(J.estReponse(scelle, cal.ligne(j).repondu, rep), 'réponse invalide');
    if (cal.estJoue(j)) {
      exiger(d.coups.deviner !== null && d.coups.deviner.validee, 'Répondre avant la fin de Deviner');
      exiger(d.coups.abandon === false, 'journée abandonnée');
      d.coups.reponse = { niveau: rep.niveau, raison: rep.raison };
      d.pp.repFin = horloge;
      return null;
    }
    var r = rattrapage(etat, cal);
    exiger(!!r && r.jour === j && r.rang === r.repondus + 1, 'réponse de rattrapage hors de son tour');
    d.coups.reponse = { niveau: rep.niveau, raison: rep.raison };
    var s = sautEnCours(etat);
    var t = s.pp.textes[s.pp.textes.length - 1];
    t.fin = horloge;
    var suivant = cal.suivant(j);
    etat.jours[String(suivant)] = nouveauJour(cal, suivant);
    return suivant;
  }

  /* ================================================================== */
  /* Sauts (D-033 ; §0, §8.1 ter, §8.8)                                 */
  /* ================================================================== */

  /** Chaque ouverture de la page du saut : rien n'est joué, seul le repère d'ouverture est noté. */
  function ouvrirPageSaut(etat, cal, horloge) {
    var k = K(etat);
    exiger(cal.estPointDeSaut(k) && !sautEnCours(etat) && etat.sauts.length < cal.sautDuJour(k).numero, 'page du saut hors d\'un point de saut');
    jour(etat, k).pp.pageSaut = horloge;
  }
  /** « Annuler » sur la page du saut : seul son compte change (§8.8, contrôle 14 b). */
  function annulerSaut(etat, cal) {
    var k = K(etat);
    exiger(cal.estPointDeSaut(k) && !sautEnCours(etat), 'Annuler hors de la page du saut');
    jour(etat, k).coups.annuler_saut += 1;
  }
  /**
   * « Avancer au dimanche » : le départ du saut, en une écriture. Le premier
   * texte du rattrapage s'affiche aussitôt (textes_atteints = 1). Le bloc du
   * jour s'arrête à l'ouverture de la page confirmée (proposition de
   * Front-end, voir INTERFACE.md, écart L1-3).
   */
  function confirmerSaut(etat, cal, instant, horloge) {
    var k = K(etat), d = jour(etat, k);
    var cs = cal.sautDuJour(k);
    exiger(cal.estPointDeSaut(k) && !!cs && etat.sauts.length === cs.numero - 1, 'saut hors de son point');
    exiger(d.pp.pageSaut !== null, 'saut confirmé sans page du saut');
    N.lireInstant(instant);
    var page = d.pp.pageSaut;
    d.pp.fige = page;
    etat.sauts.push({
      numero: cs.numero,
      depart: instant,
      textes_atteints: 1,
      coups: { ouvert: ouvertVide() },
      pp: { page: page, confirme: horloge, dernier: horloge, fin: null, textes: [{ debut: horloge, fin: null }] },
      page: {}
    });
  }
  /** Affichage de la position du texte suivant du rattrapage (« Texte suivant »). */
  function afficherTexteRattrapage(etat, cal, horloge) {
    var r = rattrapage(etat, cal), s = sautEnCours(etat);
    exiger(!!r && !r.termine && r.rang === r.repondus, 'texte suivant avant la réponse au texte affiché');
    s.textes_atteints += 1;
    s.pp.textes.push({ debut: horloge, fin: null });
  }
  /** « Aller au dimanche » : fin du saut ; le toucher suivant ouvre le jour de reprise. */
  function finirSaut(etat, cal, horloge) {
    var r = rattrapage(etat, cal);
    exiger(!!r && r.termine, 'Aller au dimanche avant la fin du rattrapage');
    var s = sautEnCours(etat);
    s.pp.fin = horloge;
  }

  /* ================================================================== */
  /* Jour suivant, abandon (§8.1 bis ; R10)                             */
  /* ================================================================== */

  /**
   * « Aller au jour suivant » d'un jour joué, journée finie ou abandonnée
   * (le lien « Abandonner cette journée », confirmé, puis le carnet du jour).
   * Mène au jour suivant du calendrier : jour joué, point de saut ou clôture.
   */
  function allerAuJourSuivant(etat, cal, abandon) {
    var k = K(etat), d = jour(etat, k);
    exiger(cal.estJoue(k), '« Jour suivant » hors d\'un jour joué');
    exiger(!sautEnCours(etat), 'saut en cours');
    if (abandon) {
      exiger(!cal.estArrivee(k) || d.coups.compte !== null, 'abandon pendant l\'entrée');
      exiger(d.coups.reponse === null, 'abandon après la réponse');
      d.coups.abandon = true;
    } else {
      exiger(journeeFinie(etat, cal, k), 'journée pas finie');
    }
    var suivant = cal.suivant(k);
    exiger(suivant !== null, 'pas de jour suivant');
    etat.jours[String(suivant)] = nouveauJour(cal, suivant);
    return suivant;
  }

  /* ================================================================== */
  /* Compteurs et carnet                                                */
  /* ================================================================== */

  /**
   * Compte un geste (§8.4) : 'relire', 'rouvrir', ou une ouverture
   * ('cercle', 'moi', 'proche', 'qui_est_qui'). Pendant un saut en cours,
   * les ouvertures vont au saut. pendantDeviner : l'écran Deviner est
   * affiché (mesure de D-023), pour 'cercle' et 'proche'.
   */
  function compter(etat, cal, quoi, pendantDeviner) {
    var s = sautEnCours(etat);
    var k = K(etat), d = jour(etat, k);
    if (quoi === 'relire') { exiger(d.coups.deviner !== null, 'Relire sans Deviner'); d.coups.relire += 1; return; }
    if (quoi === 'rouvrir') {
      exiger(cal.estJoue(k) && cal.ligne(k).revelation_porteur === 'lue', 'Reprendre sans révélation à rouvrir');
      d.coups.rouvrir += 1; return;
    }
    exiger(J.CLES_OUVERT.indexOf(quoi) >= 0, 'geste inconnu : ' + quoi);
    if (s) { s.coups.ouvert[quoi] += 1; return; }
    exiger(!cal.estSaute(k), 'ouverture un jour sauté hors d\'un saut');
    d.coups.ouvert[quoi] += 1;
    if (pendantDeviner && (quoi === 'cercle' || quoi === 'proche') && d.coups.pendant_deviner !== null) { d.coups.pendant_deviner[quoi] += 1; }
  }

  /** Réponse à une question du carnet du jour j (§8.3) ; null efface le choix. */
  function repondreCarnet(etat, cal, j, champ, valeur) {
    var d = jour(etat, j);
    exiger(J.CLES_CARNET.indexOf(champ) >= 0, 'question inconnue : ' + champ);
    exiger(cal.estJoue(j), 'carnet hors d\'un jour joué');
    d.coups.carnet[champ] = valeur === null ? null : copie(valeur);
  }

  /* ================================================================== */
  /* Arrêt et fin (§8.5, §8.10)                                         */
  /* ================================================================== */

  function arreter(etat, cal, raison, f2) {
    var k = K(etat);
    exiger(k <= cal.dernierJeu, 'arrêt à la clôture');
    exiger(etat.arret === null && etat.fin === null, 'partie déjà close');
    exiger(raison === null || J.CODES.arret.indexOf(raison) >= 0, 'raison d\'arrêt');
    exiger(f2 === null || (k >= J.JOUR_F2 && J.CODES.f2.indexOf(f2) >= 0), 'F2 à l\'arrêt');
    etat.arret = { f2: f2, jour: k, raison: raison };
  }
  function finir(etat, cal, codes) {
    exiger(K(etat) === cal.dernier, 'fin avant la clôture');
    exiger(etat.arret === null && etat.fin === null, 'partie déjà close');
    var f = {};
    J.CLES_FIN.forEach(function (k) {
      var v = codes && Object.prototype.hasOwnProperty.call(codes, k) ? codes[k] : null;
      exiger(v === null || J.CODES[k].indexOf(v) >= 0, 'code de fin : ' + k);
      f[k] = v;
    });
    etat.fin = f;
  }

  /* ================================================================== */
  /* Durées (§8.4, §8.12 ; partie 4.3.10)                               */
  /* ================================================================== */

  function sec(ms) { return Math.floor(Math.max(0, ms) / 1000); }

  /** Durées du jour j, en secondes tronquées ; maintenant : l'horloge de premier plan à l'instant du calcul. */
  function dureesJour(etat, cal, j, maintenant) {
    var d = jour(etat, j), p = d.pp, et = d.etapes;
    var r = { duree_deviner: null, duree_entree: null, duree_repondre: null, duree_seance: null };
    if (!cal.aUneOuverture(j)) { return r; }
    var dernier = p.fige !== null ? p.fige : (p.dernier !== null ? p.dernier : p.ouverture);
    r.duree_seance = p.ouverture === null ? 0 : sec(dernier - p.ouverture);
    if (et && et.deviner) { r.duree_deviner = sec(p.devDernier - p.devDebut); }
    if (et && et.repondre) {
      var finRep = p.repFin !== null ? p.repFin : (p.repContinuer !== null ? p.repContinuer : (p.fige !== null ? p.fige : maintenant));
      r.duree_repondre = sec(finRep - p.repDebut);
    }
    if (et && et.entree) {
      var finEnt = p.entreeFin !== null ? p.entreeFin : (p.fige !== null ? p.fige : maintenant);
      r.duree_entree = sec(finEnt - p.entreeDebut);
    }
    return r;
  }

  /** Durées du saut i (partie 4.3.9) : page, saut entier, chaque texte atteint. */
  function dureesSaut(etat, i, maintenant) {
    var s = etat.sauts[i], p = s.pp;
    var finSaut = p.fin !== null ? p.fin : (p.dernier !== null ? p.dernier : maintenant);
    return {
      duree_page: sec(p.confirme - p.page),
      duree_saut: sec(finSaut - p.page),
      durees_textes: p.textes.map(function (t) { return sec((t.fin !== null ? t.fin : finSaut) - t.debut); }),
      numero: s.numero
    };
  }

  /* ================================================================== */
  /* Journal (partie 4.4)                                               */
  /* ================================================================== */

  /** Le journal des entrées, version 4, tiré de l'état. */
  function journal(etat, cal, empreinte, partie) {
    var jours = {};
    Object.keys(etat.jours).forEach(function (k) {
      var d = etat.jours[k];
      // Un jour atteint mais pas encore touché n'a ni ouverture ni versions (partie 4.4, règle 5).
      jours[k] = { attente: null, coups: copie(d.coups), etapes: d.etapes ? copie(d.etapes) : null, ouverture: d.ouverture,
        versions: d.ouverture === null ? null : d.versions.slice() };
    });
    return {
      arret: etat.arret ? copie(etat.arret) : null,
      copies: [],
      empreinte_scelle: empreinte,
      fin: etat.fin ? copie(etat.fin) : null,
      format: J.FORMAT,
      jours: jours,
      partie: partie || { graine: null, id: 'porteur', mode: 'interface' },
      sauts: etat.sauts.map(function (s) { return { coups: copie(s.coups), depart: s.depart, numero: s.numero, textes_atteints: s.textes_atteints }; }),
      version: J.VERSION
    };
  }

  /** Durées au format du fichier des durées, version 2 (partie 4.4). */
  function fichierDurees(etat, cal, maintenant, partieId) {
    var jours = {};
    Object.keys(etat.jours).forEach(function (k) { jours[k] = dureesJour(etat, cal, +k, maintenant); });
    return { format: 'elenchos-essai-durees', version: 2, partie: partieId || 'porteur', jours: jours, copies: [],
      sauts: etat.sauts.map(function (s, i) { return dureesSaut(etat, i, maintenant); }) };
  }

  /* ================================================================== */
  /* Forme de l'état relu (arrêt 1, repère M1)                          */
  /* ================================================================== */

  /** Lève une erreur si l'objet relu n'a pas la forme d'un état 2 pour ce calendrier. */
  function verifierForme(o, cal) {
    exiger(o && typeof o === 'object' && o.format === FORMAT, 'format');
    exiger(Number.isSafeInteger(o.ecritures) && o.ecritures >= 0, 'compteur d\'écritures');
    exiger(typeof o.horloge === 'number' && isFinite(o.horloge) && o.horloge >= 0, 'horloge');
    exiger(o.jours && typeof o.jours === 'object' && !Array.isArray(o.jours), 'jours');
    var n = Object.keys(o.jours).length;
    exiger(n >= 1, 'aucun jour');
    for (var j = cal.premier; j < cal.premier + n; j++) {
      var d = o.jours[String(j)];
      exiger(!!d && cal.existe(j), 'jours non consécutifs');
      exiger(cles(d) === 'coups,etapes,ouverture,page,pp,versions', 'clés du jour ' + j);
      exiger(cles(d.coups) === J.CLES_COUPS.slice().sort().join(','), 'coups du jour ' + j);
      exiger(cles(d.pp) === REPERES_JOUR.slice().sort().join(','), 'repères du jour ' + j);
      exiger((d.versions === null) === !cal.aUneOuverture(j), 'versions du jour ' + j);
    }
    exiger(Array.isArray(o.sauts), 'sauts');
    o.sauts.forEach(function (s, i) {
      exiger(cles(s) === 'coups,depart,numero,page,pp,textes_atteints' && s.numero === i + 1, 'saut ' + i);
      exiger(cles(s.pp) === REPERES_SAUT.concat(['textes']).sort().join(',') && Array.isArray(s.pp.textes), 'repères du saut ' + i);
    });
    exiger(o.arret === null || typeof o.arret === 'object', 'arrêt');
    exiger(o.fin === null || typeof o.fin === 'object', 'fin');
    exiger(o.vue && typeof o.vue === 'object' && !Array.isArray(o.vue), 'vue');
    return o;
  }

  return {
    FORMAT: FORMAT, REPERES_JOUR: REPERES_JOUR, REPERES_SAUT: REPERES_SAUT, ErreurEtat: ErreurEtat,
    nouvelEtat: nouvelEtat, nouveauJour: nouveauJour, coupsVides: coupsVides,
    K: K, jour: jour, jourCourant: jourCourant, sautEnCours: sautEnCours, rattrapage: rattrapage, journeeFinie: journeeFinie,
    toucher: toucher, marquer: marquer,
    texteEntreeCourant: texteEntreeCourant, afficherEntree: afficherEntree, consentir: consentir,
    repondreEntree: repondreEntree, parierEntree: parierEntree, terminerCompte: terminerCompte,
    ouvrirDeviner: ouvrirDeviner, poserCarte: poserCarte, poserRaison: poserRaison, validerDeviner: validerDeviner,
    afficherRepondre: afficherRepondre, repondre: repondre,
    ouvrirPageSaut: ouvrirPageSaut, annulerSaut: annulerSaut, confirmerSaut: confirmerSaut,
    afficherTexteRattrapage: afficherTexteRattrapage, finirSaut: finirSaut,
    allerAuJourSuivant: allerAuJourSuivant, compter: compter, repondreCarnet: repondreCarnet,
    arreter: arreter, finir: finir,
    dureesJour: dureesJour, dureesSaut: dureesSaut, fichierDurees: fichierDurees,
    journal: journal, verifierForme: verifierForme
  };
})(ElenchosNoyau, ElenchosJournal);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosEtat; }
/*node-fin*/
