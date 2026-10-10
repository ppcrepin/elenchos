/* Journal du second essai, version 4 (outillage d'essai, D-001 tenu ; lot 1).
 *
 * Codes des entrées (a-ne-pas-ouvrir-2/schema.md, partie 4.3.3) et règles
 * de validité du journal (partie 4.4), réécrites pour la table du
 * calendrier : aucun numéro de jour n'est écrit ici, tout se lit dans
 * `cal` (calendrier.js).
 *
 * Fonction pure : ni écran, ni mémoire, ni horloge, ni hasard.
 *
 *   valider(scelle, cal, journal, options) -> liste d'écarts « règle n, /chemin : … », vide si valide
 *     options.empreinte   : SHA-256 attendu du fichier scellé (règle 1), facultatif
 *     options.cartes(j)   : {n, cachee} cartes servies au porteur le jour j (moteur, lots 2 et 3).
 *                           Absent : la règle 7 ne compte pas les cartes ni ne situe la raison cachée.
 *     options.confusables : table du squelette (construction, lot 6) ; {} par défaut
 *     options.enCours     : vrai pour une partie pas finie (ni fin ni arrêt ; dernier jour sans ouverture permis)
 *
 * Renvois : « §n » = simulation-2.md ; « partie n » = schema.md du second essai.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosJournal = (function (N) {
  var FORMAT = 'elenchos-essai-journal';
  var VERSION = 4;
  var PERSONNAGES = ['Agathe', 'Nassim', 'Odile', 'Valentin'];
  /** §8.10 : F2 est posée à l'arrêt dès le jour 3, rattrapages compris (seuil de la spécification, pas du calendrier). */
  var JOUR_F2 = 3;
  var LONGUEUR_PSEUDO = 20;

  var CLES_JOURNAL = ['arret', 'copies', 'empreinte_scelle', 'fin', 'format', 'jours', 'partie', 'sauts', 'version'];
  var CLES_JOUR = ['attente', 'coups', 'etapes', 'ouverture', 'versions'];
  var CLES_COUPS = ['abandon', 'annuler_saut', 'carnet', 'compte', 'consentement', 'deviner', 'entree', 'ouvert',
    'pendant_deviner', 'pseudo', 'relire', 'reponse', 'rouvrir'];
  var CLES_OUVERT = ['cercle', 'moi', 'proche', 'qui_est_qui'];
  /** Ouvertures impossibles au point de saut avant la confirmation (règle 9 ; §0) : seule la fiche « Qui est qui » s'ouvre. */
  var OUVERT_HORS_POINT = ['cercle', 'moi', 'proche'];
  var CLES_CARNET = ['hesite', 'moment', 'moment_semaine', 'saut_clair'];
  var CLES_SAUT = ['coups', 'depart', 'numero', 'textes_atteints'];
  var CLES_ETAPES = ['deviner', 'entree', 'repondre'];
  var CLES_FIN = ['avis', 'barre', 'f2', 'portrait', 'raisons', 'regle', 'servi', 'suspense'];

  /** Codes, dans l'ordre d'affichage (partie 4.3.3 ; libellés : §8.3, §8.5). */
  var CODES = {
    moment_arrivee: ['defi', 'deviner', 'donner_avis', 'phrase_jour', 'aucun'],
    moment_jour: ['revelation', 'deviner', 'donner_avis', 'phrase_jour', 'aucun'],
    moment_dimanche: ['revelation', 'titres', 'phrase_semaine', 'deviner', 'donner_avis', 'phrase_jour', 'aucun'],
    saut_clair: ['non', 'en_partie', 'oui'],
    hesite: ['deviner', 'repondre', 'revelation', 'avis_cercle', 'titres', 'cercle', 'portrait', 'saut', 'ailleurs', 'nulle_part'],
    moment_semaine: ['revelation', 'avis_cercle', 'titres', 'phrase_semaine', 'deviner', 'donner_avis', 'phrase_jour', 'cercle', 'portrait', 'aucun'],
    f2: ['de_plus_en_plus', 'toujours_autant', 'de_moins_en_moins', 'jamais'],
    servi: ['souvenir', 'defi', 'revelations', 'cercle', 'rien'],
    regle: ['pas_claire', 'claire_etrange', 'claire', 'pas_lue'],
    avis: ['sans_apprendre', 'apprenait', 'pas_lu'],
    raisons: ['pas_plus', 'un_peu', 'nettement'],
    portrait: ['ressemblait_pas', 'un_peu', 'ressemblait', 'pas_regarde'],
    barre: ['pas_remarquee', 'sans_savoir', 'comprise'],
    suspense: ['sans', 'un_peu', 'vrai'],
    arret: ['pas_amuse', 'pas_compris', 'pas_le_temps', 'vu_assez', 'autre'],
    compte: ['apple', 'google', 'email_valider', 'email_plus_tard']
  };

  function cles(o) { return o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o).sort().join(',') : null; }
  function estEntier(x) { return Number.isSafeInteger(x); }
  function estCompteur(x) { return estEntier(x) && x >= 0; }
  function estNiveau(x) { return estEntier(x) && x >= 1 && x <= 5; }
  function nombreRaisons(scelle, texte) { return scelle.textes[texte].considerations.length; }
  /** Une raison : un rang de 1 au nombre de raisons du texte (lu dans les données, D-034), ou « aucune ». */
  function estRaison(scelle, texte, x) { return x === 'aucune' || (estEntier(x) && x >= 1 && x <= nombreRaisons(scelle, texte)); }
  function estReponse(scelle, texte, r) {
    return !!r && cles(r) === 'niveau,raison' && estNiveau(r.niveau) && estRaison(scelle, texte, r.raison);
  }
  function estPersonnage(x) { return PERSONNAGES.indexOf(x) >= 0; }

  /** Choix de « Votre moment préféré » proposés le jour j (§8.3), dans l'ordre ; filtrés selon
   *  les écrans affichés (etapes) en mode interface, jamais selon une réponse ; tous en mode moteur. */
  function choixMoment(cal, j, etapes) {
    var liste = cal.estArrivee(j) ? CODES.moment_arrivee : (cal.estDimanche(j) ? CODES.moment_dimanche : CODES.moment_jour);
    if (!etapes) { return liste.slice(); }
    return liste.filter(function (x) {
      if (x === 'deviner') { return etapes.deviner === true; }
      if (x === 'donner_avis' || x === 'phrase_jour') { return etapes.repondre === true; }
      return true;
    });
  }

  /** Pseudo gardable (partie 4.4, règle 6 ; §7.19, E7) : NFC, 1 à 20 points de code, sans Cc, Cf, Cs,
   *  sans blanc autre que U+0020, sans espace double ni au bord ; son squelette n'est celui d'aucun
   *  prénom ; d'un seul caractère, son squelette n'est l'initiale d'aucun personnage. */
  function pseudoGardable(x, table) {
    if (typeof x !== 'string') { return false; }
    var n = Array.from(x).length;
    if (n < 1 || n > LONGUEUR_PSEUDO || x.normalize('NFC') !== x) { return false; }
    if (/[\p{Cc}\p{Cf}\p{Cs}]/u.test(x) || /[^\S ]/u.test(x) || / {2}/.test(x) || x !== x.trim()) { return false; }
    var sq = N.squelette(x, table);
    if (PERSONNAGES.some(function (p) { return N.squelette(p, table) === sq; })) { return false; }
    if (n === 1 && PERSONNAGES.some(function (p) { return N.squelette(p.charAt(0), table) === sq; })) { return false; }
    return true;
  }

  function valider(scelle, cal, journal, options) {
    var o = options || {};
    var e = [];
    function err(regle, chemin, msg) { e.push('règle ' + regle + ', ' + chemin + ' : ' + msg); }

    /* Règle 1 : forme */
    if (!journal || cles(journal) !== CLES_JOURNAL.join(',')) { err(1, '', 'clés du journal'); return e; }
    if (journal.format !== FORMAT || journal.version !== VERSION) { err(1, '/version', 'format ou version'); }
    if (!/^[0-9a-f]{64}$/.test(journal.empreinte_scelle || '') || (o.empreinte && journal.empreinte_scelle !== o.empreinte)) {
      err(1, '/empreinte_scelle', 'empreinte du fichier scellé');
    }

    /* Règle 2 : partie */
    var p = journal.partie;
    var mode = p && p.mode;
    if (!p || cles(p) !== 'graine,id,mode') { err(2, '/partie', 'clés'); }
    else {
      if (mode !== 'interface' && mode !== 'moteur') { err(2, '/partie/mode', 'mode inconnu'); }
      var temoin = p.graine === null && /^[a-z]$/.test(p.id);
      var hasard = /^hasard-[0-9]{3}$/.test(p.id) && /^[0-9a-f]{16}$/.test(p.graine);
      var porteur = p.graine === null && p.id === 'porteur' && mode === 'interface';
      if (!temoin && !hasard && !porteur) { err(2, '/partie', 'id ou graine'); }
    }
    if (!Array.isArray(journal.sauts)) { err(13, '/sauts', 'tableau attendu'); return e; }
    if (!Array.isArray(journal.copies)) { err(15, '/copies', 'tableau attendu'); return e; }
    if (mode === 'moteur' && journal.copies.length) { err(2, '/copies', 'copies en mode moteur'); }

    /* Règle 3 : jours atteints */
    var J = journal.jours;
    if (!J || typeof J !== 'object' || Array.isArray(J)) { err(3, '/jours', 'objet attendu'); return e; }
    var K = cal.premier - 1;
    while (Object.prototype.hasOwnProperty.call(J, String(K + 1))) { K++; }
    if (K < cal.premier) { err(3, '/jours', 'le premier jour manque'); return e; }
    if (Object.keys(J).length !== K - cal.premier + 1) { err(3, '/jours', 'clés hors de la suite ' + cal.premier + ' à K'); return e; }
    if (K > cal.dernier) { err(3, '/jours', 'au-delà de la clôture'); return e; }
    var fin = journal.fin, arret = journal.arret;
    if (fin !== null && arret !== null) { err(3, '/fin', 'fin et arrêt à la fois'); }
    if (fin !== null && K !== cal.dernier) { err(3, '/fin', 'fin avant la clôture'); }
    if (arret !== null && (!arret || arret.jour !== K || K > cal.dernierJeu)) { err(3, '/arret/jour', 'arrêt hors du dernier jour atteint, ou à la clôture'); }
    if (!o.enCours && fin === null && arret === null) { err(3, '/fin', 'ni fin ni arrêt'); }

    var sautsConfirmes = journal.sauts.length;
    function sautConfirme(numero) { return numero <= sautsConfirmes; }
    function jourDe(j) { return J[String(j)]; }

    /* Règles 4 et 5 : ouvertures et versions, au fil des jours */
    var msPrec = null, versionPrec = null;
    var ouvertures = {};
    for (var j = cal.premier; j <= K; j++) {
      var ch = '/jours/' + j;
      var d = jourDe(j);
      if (cles(d) !== CLES_JOUR.join(',')) { err(1, ch, 'clés du jour'); return e; }
      if (cles(d.coups) !== CLES_COUPS.join(',')) { err(1, ch + '/coups', 'clés des coups'); return e; }
      var doit = cal.aUneOuverture(j);
      // Écart L1-4 (INTERFACE.md) : le jour de reprise est atteint à la dernière réponse du rattrapage (§0),
      // mais les touchers comptent au saut jusqu'à « Aller au dimanche » ; un arrêt entre les deux le laisse sans ouverture.
      var repriseSansOuverture = j === K && arret !== null && arret.jour === K && cal.sautQuiReprend(j) !== null;
      if (!doit && d.ouverture !== null) { err(4, ch + '/ouverture', 'jour sauté : nulle attendue'); }
      if (doit && d.ouverture === null && !(o.enCours && j === K) && !repriseSansOuverture) { err(4, ch + '/ouverture', 'absente'); }
      if (d.ouverture !== null) {
        try {
          var ms = N.lireInstant(d.ouverture);
          if (msPrec !== null && ms < msPrec) { err(4, ch + '/ouverture', 'antérieure à la précédente'); }
          msPrec = ms;
          ouvertures[j] = ms;
        } catch (x) { err(4, ch + '/ouverture', x.message); }
      }
      if (mode === 'moteur') {
        if (d.versions !== null || d.etapes !== null) { err(2, ch, 'versions et etapes nuls en mode moteur'); }
      } else if (mode === 'interface') {
        if ((d.versions !== null) !== (d.ouverture !== null)) { err(5, ch + '/versions', 'présentes exactement avec l\'ouverture'); }
        if (d.versions !== null) {
          if (!Array.isArray(d.versions) || !d.versions.length) { err(5, ch + '/versions', 'tableau non vide attendu'); }
          else {
            d.versions.forEach(function (v, i) {
              if (!estEntier(v) || v < 1) { err(5, ch + '/versions/' + i, 'entier ≥ 1'); }
              if (i > 0 && v <= d.versions[i - 1]) { err(5, ch + '/versions/' + i, 'non croissant'); }
            });
            if (versionPrec !== null && d.versions[0] < versionPrec) { err(5, ch + '/versions/0', 'inférieur au jour précédent'); }
            versionPrec = d.versions[d.versions.length - 1];
          }
        }
      }
    }

    /* Règles 6 à 12, jour par jour */
    var premierJour = jourDe(cal.premier).coups;
    for (var jj = cal.premier; jj <= K; jj++) { verifierJour(jj); }

    function verifierJour(j) {
      var ch = '/jours/' + j;
      var d = jourDe(j), c = d.coups, l = cal.ligne(j);
      var joue = cal.estJoue(j), point = cal.estPointDeSaut(j), saute = cal.estSaute(j), cloture = cal.estCloture(j);
      var arrivee = cal.estArrivee(j);

      /* Règle 6 : entrée */
      if (arrivee) {
        var ent = c.entree;
        if (cles(ent) !== cal.textesEntree.slice().sort().join(',')) { err(6, ch + '/coups/entree', 'textes d\'entrée attendus'); }
        else {
          var precOk = true, nbRep = 0;
          cal.textesEntree.forEach(function (E) {
            var r = ent[E], ce = ch + '/coups/entree/' + E;
            if (cles(r) !== 'pari,reponse') { err(6, ce, 'clés'); return; }
            if (r.reponse !== null && !estReponse(scelle, E, r.reponse)) { err(6, ce + '/reponse', 'réponse invalide'); }
            if (r.pari !== null && !estNiveau(r.pari)) { err(6, ce + '/pari', 'niveau attendu'); }
            if (r.pari !== null && r.reponse === null) { err(6, ce, 'pari sans réponse'); }
            if (r.reponse !== null && !precOk) { err(6, ce, 'texte joué hors ordre'); }
            precOk = r.reponse !== null && r.pari !== null;
            if (r.reponse !== null) { nbRep++; }
          });
          if (nbRep > 0 && c.consentement !== true) { err(6, ch + '/coups/consentement', 'true attendu dès une réponse'); }
          if (c.consentement !== null && c.consentement !== true) { err(6, ch + '/coups/consentement', 'true ou null'); }
          if ((c.pseudo === null) !== (c.compte === null)) { err(6, ch + '/coups/compte', 'pseudo et compte vont ensemble'); }
          if (c.pseudo !== null && !precOk) { err(6, ch + '/coups/pseudo', 'compte avant le dernier pari'); }
        }
        if (c.pseudo !== null && !pseudoGardable(c.pseudo, o.confusables)) { err(6, ch + '/coups/pseudo', 'pseudo refusé'); }
        if (c.compte !== null && CODES.compte.indexOf(c.compte) < 0) { err(6, ch + '/coups/compte', 'code'); }
        if (c.compte === null && (c.deviner !== null || c.reponse !== null)) { err(6, ch + '/coups', 'Deviner ou Répondre avant la fin du compte'); }
      } else if (c.entree !== null || c.pseudo !== null || c.consentement !== null || c.compte !== null) {
        err(6, ch + '/coups', 'entrée hors du jour d\'arrivée');
      }

      /* Règle 7 : Deviner */
      var cartes = null;
      if (!l.deviner_porteur) {
        if (c.deviner !== null) { err(7, ch + '/coups/deviner', 'nul attendu'); }
      } else if (c.deviner !== null) {
        var dv = c.deviner;
        if (cles(dv) !== 'cartes,validee' || !Array.isArray(dv.cartes) || typeof dv.validee !== 'boolean') { err(7, ch + '/coups/deviner', 'forme'); }
        else {
          cartes = o.cartes ? o.cartes(j) : null;
          if (cartes && dv.cartes.length !== cartes.n) { err(7, ch + '/coups/deviner/cartes', cartes.n + ' carte(s) attendue(s)'); }
          if (!dv.cartes.length) { err(7, ch + '/coups/deviner/cartes', 'au moins une carte'); }
          var vus = [];
          dv.cartes.forEach(function (x, i) {
            var cc = ch + '/coups/deviner/cartes/' + i;
            if (cles(x) !== 'designe,raison') { err(7, cc, 'clés'); return; }
            if (x.designe !== null && x.designe !== 'passe' && !estPersonnage(x.designe)) { err(7, cc + '/designe', 'valeur'); }
            if (estPersonnage(x.designe)) {
              if (vus.indexOf(x.designe) >= 0) { err(7, cc + '/designe', 'personnage désigné deux fois'); }
              vus.push(x.designe);
            }
            if (x.raison !== null) {
              if (!estRaison(scelle, l.manche, x.raison)) { err(7, cc + '/raison', 'valeur'); }
              if (!estPersonnage(x.designe)) { err(7, cc + '/raison', 'raison sans visage'); }
              if (cartes && cartes.cachee !== i) { err(7, cc + '/raison', 'raison hors de la carte à raison cachée'); }
            }
          });
          if (dv.validee && dv.cartes.some(function (x) { return x.designe === null; })) { err(7, ch + '/coups/deviner/validee', 'carte vide dans une manche validée'); }
          var finDuJour = c.abandon === true || (arret !== null && arret.jour === j) || (o.enCours && j === K);
          if (!dv.validee && !finDuJour) { err(7, ch + '/coups/deviner/validee', 'manche non validée hors d\'un abandon ou d\'un arrêt'); }
        }
      }

      /* Règle 8 : Répondre */
      if (c.reponse !== null) {
        if (cloture) { err(8, ch + '/coups/reponse', 'nulle à la clôture'); }
        else if (!estReponse(scelle, l.repondu, c.reponse)) { err(8, ch + '/coups/reponse', 'réponse invalide'); }
        if (joue && !(c.deviner !== null && c.deviner.validee === true)) { err(8, ch + '/coups/reponse', 'Répondre avant la fin de Deviner'); }
        if ((point || saute) && !sautConfirme(l.saut)) { err(8, ch + '/coups/reponse', 'réponse de rattrapage sans saut confirmé'); }
      }
      if (joue) {
        if (typeof c.abandon !== 'boolean') { err(9, ch + '/coups/abandon', 'booléen attendu'); }
        if (c.abandon === true && c.reponse !== null) { err(8, ch + '/coups/abandon', 'abandon après la réponse'); }
        if (c.abandon === true && arrivee && c.compte === null) { err(3, ch + '/coups/abandon', 'abandon pendant l\'entrée'); }
      } else if (c.abandon !== null) { err(9, ch + '/coups/abandon', 'nul hors des jours joués'); }

      /* Règle 9 : compteurs */
      if (!estCompteur(c.relire)) { err(9, ch + '/coups/relire', 'entier attendu'); }
      if (!estCompteur(c.rouvrir)) { err(9, ch + '/coups/rouvrir', 'entier attendu'); }
      if (cles(c.ouvert) !== CLES_OUVERT.join(',') || !CLES_OUVERT.every(function (k) { return estCompteur(c.ouvert[k]); })) { err(9, ch + '/coups/ouvert', 'quatre entiers'); }
      if (c.relire > 0 && c.deviner === null) { err(9, ch + '/coups/relire', 'Relire sans Deviner'); }
      if ((c.pendant_deviner === null) !== (c.deviner === null)) { err(9, ch + '/coups/pendant_deviner', 'présent exactement avec Deviner'); }
      if (c.pendant_deviner !== null && (cles(c.pendant_deviner) !== 'cercle,proche' || !estCompteur(c.pendant_deviner.cercle) || !estCompteur(c.pendant_deviner.proche))) {
        err(9, ch + '/coups/pendant_deviner', 'deux entiers');
      }
      if (c.rouvrir > 0 && !(joue && l.revelation_porteur === 'lue')) { err(9, ch + '/coups/rouvrir', 'hors d\'un jour joué à révélation lue'); }
      if (point) {
        if (!estCompteur(c.annuler_saut)) { err(9, ch + '/coups/annuler_saut', 'entier attendu au point de saut'); }
        OUVERT_HORS_POINT.forEach(function (k) { if (c.ouvert && c.ouvert[k] !== 0) { err(9, ch + '/coups/ouvert/' + k, '0 au point de saut : Le Cercle et Moi n\'y sont pas accessibles avant la confirmation'); } });
      }
      else if (c.annuler_saut !== null) { err(9, ch + '/coups/annuler_saut', 'nul hors d\'un point de saut'); }
      if (saute && (c.relire !== 0 || c.rouvrir !== 0 || (c.ouvert && CLES_OUVERT.some(function (k) { return c.ouvert[k] !== 0; })))) {
        err(9, ch + '/coups', 'compteurs à 0 un jour sauté');
      }

      /* Règle 10 : carnet du jour */
      var q = c.carnet;
      if (cles(q) !== CLES_CARNET.join(',')) { err(10, ch + '/coups/carnet', 'clés'); }
      else {
        if (q.moment !== null && (!joue || choixMoment(cal, j, mode === 'interface' ? d.etapes : null).indexOf(q.moment) < 0)) { err(10, ch + '/coups/carnet/moment', 'choix non proposé'); }
        if (arrivee && q.moment !== null && c.compte === null) { err(10, ch + '/coups/carnet/moment', 'avant la fin de l\'entrée'); }
        var premierDimancheApresSaut = cal.sauts.length ? cal.sauts[0].reprise : null;
        if (q.saut_clair !== null && (j !== premierDimancheApresSaut || CODES.saut_clair.indexOf(q.saut_clair) < 0)) { err(10, ch + '/coups/carnet/saut_clair', 'hors du jour de reprise du premier saut, ou code'); }
        var dimanche = joue && cal.estDimanche(j);
        if (q.moment_semaine !== null && (!dimanche || CODES.moment_semaine.indexOf(q.moment_semaine) < 0)) { err(10, ch + '/coups/carnet/moment_semaine', 'hors d\'un dimanche, ou code'); }
        if (q.hesite !== null) {
          if (!dimanche || !Array.isArray(q.hesite) || !q.hesite.length) { err(10, ch + '/coups/carnet/hesite', 'hors d\'un dimanche, ou vide'); }
          else {
            var rangs = q.hesite.map(function (x) { return CODES.hesite.indexOf(x); });
            if (rangs.some(function (r, i) { return r < 0 || (i > 0 && r <= rangs[i - 1]); })) { err(10, ch + '/coups/carnet/hesite', 'codes distincts, dans l\'ordre de la liste'); }
            if (q.hesite.indexOf('nulle_part') >= 0 && q.hesite.length > 1) { err(10, ch + '/coups/carnet/hesite', '« Nulle part » est seul'); }
          }
        }
      }

      /* Règle 11 : attente */
      if (d.attente !== null) {
        var finie = joue && c.reponse !== null;
        if (!finie) { err(11, ch + '/attente', '« En attendant » sur une journée pas finie'); }
        if (!d.attente || !Array.isArray(d.attente.lectures) || !d.attente.lectures.length) { err(11, ch + '/attente/lectures', 'au moins une lecture'); }
        else { d.attente.lectures.forEach(function (x, i) { try { N.lireHeure(x.heure); } catch (y) { err(11, ch + '/attente/lectures/' + i, y.message); } }); }
      }

      /* Règle 12 : étapes (mode interface) */
      if (mode === 'interface') {
        if (joue !== (d.etapes !== null)) { err(12, ch + '/etapes', 'présentes exactement aux jours joués'); }
        else if (d.etapes !== null) {
          var et = d.etapes;
          if (cles(et) !== CLES_ETAPES.join(',') || typeof et.deviner !== 'boolean' || typeof et.repondre !== 'boolean') { err(12, ch + '/etapes', 'forme'); }
          else {
            if (et.deviner !== (c.deviner !== null)) { err(12, ch + '/etapes/deviner', 'vrai exactement quand Deviner a été ouvert'); }
            if (c.reponse !== null && !et.repondre) { err(12, ch + '/etapes/repondre', 'vrai attendu'); }
            if (arrivee) {
              if (typeof et.entree !== 'boolean') { err(12, ch + '/etapes/entree', 'booléen au jour d\'arrivée'); }
              else if (!et.entree && cal.textesEntree.some(function (E) { return c.entree && c.entree[E] && c.entree[E].reponse !== null; })) { err(12, ch + '/etapes/entree', 'vrai attendu'); }
            } else if (et.entree !== null) { err(12, ch + '/etapes/entree', 'nul hors du jour d\'arrivée'); }
          }
        }
      }

      /* Règle 3 : le jour suivant n'existe que si celui-ci le permet */
      if (j < K) {
        var ok;
        if (joue) { ok = c.reponse !== null || (c.abandon === true && (!arrivee || c.compte !== null)); }
        else if (point) { ok = sautConfirme(l.saut) && c.reponse !== null; }
        else if (saute) { ok = c.reponse !== null; }
        else { ok = false; }
        if (!ok) { err(3, '/jours/' + (j + 1), 'atteint sans que le jour ' + j + ' le permette'); }
      }
    }
    if (premierJour === undefined) { err(3, '/jours', 'jour d\'arrivée absent'); }

    /* Règle 13 : sauts */
    journal.sauts.forEach(function (s, i) {
      var ch = '/sauts/' + i;
      if (cles(s) !== CLES_SAUT.join(',')) { err(13, ch, 'clés'); return; }
      if (s.numero !== i + 1 || i >= cal.sauts.length) { err(13, ch + '/numero', 'sauts numérotés 1, 2… dans l\'ordre'); return; }
      var cs = cal.saut(s.numero);
      if (!jourDe(cs.point)) { err(13, ch, 'saut confirmé avant son point de saut'); return; }
      if (cles(s.coups) !== 'ouvert' || cles(s.coups.ouvert) !== CLES_OUVERT.join(',') || !CLES_OUVERT.every(function (k) { return estCompteur(s.coups.ouvert[k]); })) { err(13, ch + '/coups', 'forme'); }
      var repondus = cs.jours.filter(function (x) { return jourDe(x) && jourDe(x).coups.reponse !== null; }).length;
      if (!estEntier(s.textes_atteints) || s.textes_atteints < 1 || s.textes_atteints > cs.textes.length) { err(13, ch + '/textes_atteints', 'de 1 au nombre de textes du saut'); }
      else if (s.textes_atteints < repondus || s.textes_atteints > repondus + 1) { err(13, ch + '/textes_atteints', 'entre les réponses données et une de plus'); }
      try {
        var ms = N.lireInstant(s.depart);
        if (ouvertures[cs.point] !== undefined && ms < ouvertures[cs.point]) { err(4, ch + '/depart', 'avant l\'ouverture du point de saut'); }
        if (ouvertures[cs.reprise] !== undefined && ms > ouvertures[cs.reprise]) { err(4, ch + '/depart', 'après l\'ouverture du jour de reprise'); }
      } catch (x) { err(4, ch + '/depart', x.message); }
    });
    cal.sauts.forEach(function (cs) {
      var apres = cs.point + 1;
      if (jourDe(apres) && !sautConfirme(cs.numero)) { err(13, '/sauts', 'saut ' + cs.numero + ' non confirmé alors que le jour ' + apres + ' est atteint'); }
    });

    /* Règle 14 : arrêt et fin */
    if (arret !== null) {
      if (cles(arret) !== 'f2,jour,raison') { err(14, '/arret', 'clés'); }
      else {
        if (arret.raison !== null && CODES.arret.indexOf(arret.raison) < 0) { err(14, '/arret/raison', 'code'); }
        if (arret.f2 !== null && (arret.jour < JOUR_F2 || CODES.f2.indexOf(arret.f2) < 0)) { err(14, '/arret/f2', 'nulle avant le jour ' + JOUR_F2 + ', ou code'); }
      }
    }
    if (fin !== null) {
      if (cles(fin) !== CLES_FIN.join(',')) { err(14, '/fin', 'clés'); }
      else { CLES_FIN.forEach(function (k) { if (fin[k] !== null && CODES[k].indexOf(fin[k]) < 0) { err(14, '/fin/' + k, 'code'); } }); }
    }

    /* Règle 15 : copies */
    var jourPrec = cal.premier;
    journal.copies.forEach(function (cp, i) {
      var ch = '/copies/' + i;
      if (cles(cp) !== 'coups,etapes,jour,sauts,versions') { err(15, ch, 'clés'); return; }
      if (!estEntier(cp.jour) || cp.jour < jourPrec || cp.jour > Math.min(K, cal.dernierJeu)) { err(15, ch + '/jour', 'hors bornes ou hors ordre'); return; }
      jourPrec = cp.jour;
      var d = jourDe(cp.jour);
      if (cles(cp.coups) !== CLES_COUPS.join(',')) { err(15, ch + '/coups', 'clés'); return; }
      if (cp.coups.reponse !== null && JSON.stringify(cp.coups.reponse) !== JSON.stringify(d.coups.reponse)) { err(15, ch + '/coups/reponse', 'différente du jour'); }
      if (cp.coups.relire > d.coups.relire) { err(15, ch + '/coups/relire', 'supérieur au jour'); }
      if (d.versions && (!Array.isArray(cp.versions) || cp.versions.some(function (v, k) { return d.versions[k] !== v; }))) { err(15, ch + '/versions', 'pas un début de celles du jour'); }
      if (cp.etapes && d.etapes && ((cp.etapes.deviner && !d.etapes.deviner) || (cp.etapes.repondre && !d.etapes.repondre))) { err(15, ch + '/etapes', 'vraie dans la copie, fausse dans le jour'); }
    });
    return e;
  }

  return {
    FORMAT: FORMAT, VERSION: VERSION, CODES: CODES, JOUR_F2: JOUR_F2,
    CLES_COUPS: CLES_COUPS, CLES_OUVERT: CLES_OUVERT, OUVERT_HORS_POINT: OUVERT_HORS_POINT, CLES_CARNET: CLES_CARNET, CLES_FIN: CLES_FIN,
    valider: valider, choixMoment: choixMoment, pseudoGardable: pseudoGardable, estReponse: estReponse, nombreRaisons: nombreRaisons
  };
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosJournal; }
/*node-fin*/
