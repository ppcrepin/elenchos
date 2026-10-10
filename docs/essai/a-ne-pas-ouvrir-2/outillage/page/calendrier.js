/* Calendrier du second essai (outillage d'essai, D-001 tenu ; lot 1).
 *
 * Lit les tables `calendrier`, `semaines`, `cercle` et `histoire.textes`
 * du fichier scellé (a-ne-pas-ouvrir-2/schema.md, parties 2.3, 2.4, 2.6),
 * en vérifie la cohérence interne, et répond à toutes les questions de
 * calendrier de la page. Aucun numéro de jour, de semaine ni de texte
 * n'est écrit ici : tout se lit dans les tables (schéma, partie 7.1,
 * point 1). La conformité des tables aux valeurs exigées par le §0 est
 * l'affaire du contrôle 1 ; la page, elle, refuse une table incohérente
 * (arrêt V4).
 *
 * Fonction pure : ni écran, ni mémoire, ni horloge, ni hasard.
 *
 *   lire(scelle) -> cal (gelé)   ; lève ErreurCalendrier si une table est incohérente
 *
 * Renvois : « §n » = simulation-2.md ; « partie n » = schema.md du second essai.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosCalendrier = (function (N) {
  var TYPES = ['joue', 'joue_puis_saut', 'saute', 'cloture'];
  var CLES_JOUR = ['deviner_porteur', 'jour', 'manche', 'nom_jour', 'repondu', 'revelation_porteur', 'revele', 'saut', 'type'];
  var CLES_SEMAINE = ['dernier_jour', 'numero', 'premier_jour'];
  var DIMANCHE = 'dimanche';
  var LONGUEUR_SEMAINE = 7;

  function ErreurCalendrier(message) {
    var e = new Error('calendrier : ' + message);
    e.name = 'ErreurCalendrier';
    return e;
  }
  function exiger(c, m) { if (!c) { throw ErreurCalendrier(m); } }
  function estEntier(x) { return Number.isSafeInteger(x); }
  function cles(o) { return Object.keys(o).sort().join(','); }
  function geler(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { geler(o[k]); });
    }
    return o;
  }

  function lire(scelle) {
    exiger(scelle && typeof scelle === 'object', 'fichier scellé absent');
    var L = scelle.calendrier, W = scelle.semaines, cercle = scelle.cercle;
    exiger(Array.isArray(L) && L.length >= 2, 'table absente');
    exiger(Array.isArray(W) && W.length >= 1, 'table des semaines absente');
    exiger(cercle && Array.isArray(cercle.membres), 'cercle absent');
    exiger(scelle.textes && typeof scelle.textes === 'object', 'textes absents');
    exiger(scelle.histoire && scelle.histoire.textes && typeof scelle.histoire.textes === 'object', 'histoire absente');

    var premier = L[0].jour;
    exiger(estEntier(premier), 'premier jour');
    var dernier = premier + L.length - 1;

    /* --- Textes répondus avant l'arrivée : histoire, puis la manche du premier jour --- */
    var texteDuJourAvant = Object.create(null); // jour (chaîne) -> texte
    var jourDuTexte = Object.create(null);      // texte -> jour
    Object.keys(scelle.histoire.textes).forEach(function (h) {
      var j = scelle.histoire.textes[h].jour;
      exiger(estEntier(j) && j < premier, 'jour du texte ' + h);
      exiger(!texteDuJourAvant[String(j)], 'deux textes de l\'histoire le jour ' + j);
      exiger(!Object.prototype.hasOwnProperty.call(scelle.textes, h), 'texte ' + h + ' à la fois joué et abstrait');
      texteDuJourAvant[String(j)] = h;
      jourDuTexte[h] = j;
    });

    /* --- Lignes du calendrier --- */
    var lignes = [];
    var parJour = Object.create(null);
    L.forEach(function (l, i) {
      var ou = 'ligne ' + i;
      exiger(l && typeof l === 'object' && cles(l) === CLES_JOUR.join(','), ou + ' : clés');
      exiger(l.jour === premier + i, ou + ' : jours non consécutifs');
      exiger(N.JOURS.indexOf(l.nom_jour) >= 0, ou + ' : nom du jour');
      if (i > 0) { exiger(N.JOURS.indexOf(l.nom_jour) === (N.JOURS.indexOf(L[i - 1].nom_jour) + 1) % N.JOURS.length, ou + ' : nom du jour hors de la suite'); }
      exiger(TYPES.indexOf(l.type) >= 0, ou + ' : type');
      exiger((l.type === 'cloture') === (i === L.length - 1), ou + ' : la clôture est le dernier jour, et lui seul');
      exiger(l.saut === null || (estEntier(l.saut) && l.saut >= 1), ou + ' : saut');
      exiger((l.saut === null) === (l.type === 'joue' || l.type === 'cloture'), ou + ' : saut et type');
      exiger(typeof l.deviner_porteur === 'boolean' && l.deviner_porteur === (l.type === 'joue'), ou + ' : deviner_porteur et type');
      ['revele', 'manche', 'repondu'].forEach(function (c) { exiger(l[c] === null || typeof l[c] === 'string', ou + ' : ' + c); });
      exiger((l.repondu === null) === (l.type === 'cloture'), ou + ' : répondu');
      exiger((l.manche === null) === (l.type === 'cloture'), ou + ' : manche');
      if (l.repondu !== null) {
        exiger(Object.prototype.hasOwnProperty.call(scelle.textes, l.repondu), ou + ' : texte répondu inconnu');
        exiger(!(l.repondu in jourDuTexte), ou + ' : texte répondu deux fois');
        jourDuTexte[l.repondu] = l.jour;
      }
      lignes.push(l);
      parJour[String(l.jour)] = l;
    });
    // La manche du premier jour porte sur le texte répondu la veille de l'arrivée.
    var veille = L[0].manche;
    exiger(veille !== null && Object.prototype.hasOwnProperty.call(scelle.textes, veille) && !(veille in jourDuTexte), 'manche du premier jour');
    exiger(!texteDuJourAvant[String(premier - 1)], 'deux textes la veille de l\'arrivée');
    texteDuJourAvant[String(premier - 1)] = veille;
    jourDuTexte[veille] = premier - 1;

    function texteRepondu(d) {
      if (d >= premier && d <= dernier) { return parJour[String(d)].repondu; }
      return texteDuJourAvant[String(d)] || null;
    }
    lignes.forEach(function (l) {
      var ou = 'jour ' + l.jour;
      exiger(l.revele === texteRepondu(l.jour - 2), ou + ' : le texte révélé n\'est pas celui du jour j − 2');
      if (l.type !== 'cloture') { exiger(l.manche === texteRepondu(l.jour - 1), ou + ' : la manche ne porte pas sur le texte du jour j − 1'); }
      var attendue = l.type === 'saute' ? 'jamais_lue' : (l.jour - 1 < premier ? 'aucune' : 'lue');
      exiger(l.revelation_porteur === attendue, ou + ' : revelation_porteur');
    });

    /* --- Sauts --- */
    var sauts = [];
    var sautParJour = Object.create(null);
    var i = 0;
    while (i < lignes.length) {
      var l = lignes[i];
      if (l.saut === null) { i++; continue; }
      exiger(l.type === 'joue_puis_saut', 'jour ' + l.jour + ' : un saut commence par un point de saut');
      exiger(l.saut === sauts.length + 1, 'jour ' + l.jour + ' : sauts numérotés dans l\'ordre');
      var jours = [l.jour];
      var k = i + 1;
      while (k < lignes.length && lignes[k].saut === l.saut) {
        exiger(lignes[k].type === 'saute', 'jour ' + lignes[k].jour + ' : jour de saut non sauté');
        jours.push(lignes[k].jour);
        k++;
      }
      exiger(k < lignes.length && lignes[k].type === 'joue', 'saut ' + l.saut + ' : il reprend sur un jour joué');
      var s = { numero: l.saut, point: l.jour, sautes: jours.slice(1), jours: jours,
        textes: jours.map(function (j) { return parJour[String(j)].repondu; }), reprise: lignes[k].jour };
      jours.forEach(function (j) { sautParJour[String(j)] = s; });
      sauts.push(s);
      i = k;
    }

    /* --- Semaines --- */
    var semaines = [];
    var semaineParJour = Object.create(null);
    W.forEach(function (w, n) {
      var ou = 'semaine ' + n;
      exiger(w && typeof w === 'object' && cles(w) === CLES_SEMAINE.join(','), ou + ' : clés');
      exiger(w.numero === n + 1, ou + ' : numéro');
      exiger(estEntier(w.premier_jour) && w.dernier_jour === w.premier_jour + LONGUEUR_SEMAINE - 1, ou + ' : durée');
      if (n > 0) { exiger(w.premier_jour === W[n - 1].dernier_jour + 1, ou + ' : semaines non contiguës'); }
      for (var d = w.premier_jour; d <= w.dernier_jour; d++) {
        semaineParJour[String(d)] = w.numero;
        if (parJour[String(d)]) {
          var nom = parJour[String(d)].nom_jour;
          if (d === w.premier_jour) { exiger(nom === N.JOURS[0], ou + ' : ne commence pas un lundi'); }
          if (d === w.dernier_jour) { exiger(nom === DIMANCHE, ou + ' : ne finit pas un dimanche'); }
        }
      }
      semaines.push(w);
    });
    var derniereSemaine = W[W.length - 1];
    exiger(derniereSemaine.dernier_jour === dernier - 1, 'la dernière semaine finit la veille de la clôture');
    exiger(!semaineParJour[String(dernier)], 'la clôture n\'appartient à aucune semaine');
    Object.keys(jourDuTexte).forEach(function (t) {
      var d = jourDuTexte[t];
      exiger(d >= W[0].premier_jour - 1, 'texte ' + t + ' répondu avant la première semaine');
    });

    /* --- Membres --- */
    var arrivee = null;
    cercle.membres.forEach(function (m) {
      exiger(m && estEntier(m.depuis) && typeof m.membre === 'string', 'membre');
      if (m.membre === 'porteur') { arrivee = m.depuis; }
    });
    exiger(arrivee === premier, 'le porteur arrive le premier jour du calendrier');
    exiger(typeof cercle.invitant === 'string' && cercle.membres.some(function (m) { return m.membre === cercle.invitant; }), 'invitant');

    /* --- Textes d'entrée : clés E1, E2… du fichier, dans l'ordre des nombres --- */
    var entree = Object.keys(scelle.textes).filter(function (t) { return /^E[1-9][0-9]*$/.test(t); })
      .sort(function (a, b) { return +a.slice(1) - +b.slice(1); });
    exiger(entree.length >= 1, 'textes d\'entrée');

    var semainesEssai = semaines.filter(function (w) { return w.premier_jour >= premier; }).map(function (w) { return w.numero; });

    /* --- Questions --- */
    function ligne(j) { var l = parJour[String(j)]; exiger(!!l, 'jour inconnu : ' + j); return l; }
    function existe(j) { return !!parJour[String(j)]; }
    function semaine(numero) { var w = semaines[numero - 1]; exiger(!!w, 'semaine inconnue : ' + numero); return w; }
    function joursDe(numero) { var w = semaine(numero), l = []; for (var d = w.premier_jour; d <= w.dernier_jour; d++) { l.push(d); } return l; }

    var cal = {
      premier: premier,
      dernier: dernier,
      /** Dernier jour où l'on peut encore jouer, répondre, copier en cours d'essai : la veille de la clôture. */
      dernierJeu: dernier - 1,
      jours: lignes,
      sauts: sauts,
      semaines: semaines,
      semainesEssai: semainesEssai,
      textesEntree: entree,
      invitant: cercle.invitant,
      nomCercle: cercle.nom,
      membres: cercle.membres.map(function (m) { return m.membre; }),
      depuis: function (membre) {
        var m = cercle.membres.filter(function (x) { return x.membre === membre; })[0];
        exiger(!!m, 'membre inconnu : ' + membre);
        return m.depuis;
      },

      ligne: ligne,
      existe: existe,
      type: function (j) { return ligne(j).type; },
      estJoue: function (j) { return existe(j) && ligne(j).type === 'joue'; },
      estPointDeSaut: function (j) { return existe(j) && ligne(j).type === 'joue_puis_saut'; },
      estSaute: function (j) { return existe(j) && ligne(j).type === 'saute'; },
      estCloture: function (j) { return existe(j) && ligne(j).type === 'cloture'; },
      /** Jour qui a une ouverture (premier toucher) : joué, point de saut ou clôture (partie 4.4, règle 4). */
      aUneOuverture: function (j) { return existe(j) && ligne(j).type !== 'saute'; },
      estDimanche: function (j) { return existe(j) && ligne(j).nom_jour === DIMANCHE; },
      /** Le jour d'arrivée : l'entrée en fait partie. */
      estArrivee: function (j) { return j === premier; },
      suivant: function (j) { return existe(j + 1) ? j + 1 : null; },

      saut: function (numero) { var s = sauts[numero - 1]; exiger(!!s, 'saut inconnu : ' + numero); return s; },
      /** Le saut auquel appartient le jour (point de saut ou jour sauté), ou null. */
      sautDuJour: function (j) { return sautParJour[String(j)] || null; },
      /** Le saut qui reprend ce jour-là, ou null. */
      sautQuiReprend: function (j) { return sauts.filter(function (s) { return s.reprise === j; })[0] || null; },

      texteRepondu: texteRepondu,
      jourDeReponse: function (t) { exiger(t in jourDuTexte, 'texte sans jour : ' + t); return jourDuTexte[t]; },
      texteRevele: function (j) { return ligne(j).revele; },
      texteDevine: function (j) { return ligne(j).manche; },

      semaine: semaine,
      semaineDuJour: function (d) { return semaineParJour[String(d)] || null; },
      /** Rang d'une semaine de l'essai (1, 2…) : « Semaine 1 », « Semaine 2 » du cadre (§0). */
      rangEssai: function (numero) { var r = semainesEssai.indexOf(numero); exiger(r >= 0, 'semaine hors de l\'essai : ' + numero); return r + 1; },
      /** Textes révélés pendant la semaine : répondus de premier_jour − 2 à dernier_jour − 2 (partie 2.4). */
      textesRevelesSemaine: function (numero) {
        return joursDe(numero).map(function (d) { return texteRepondu(d - 2); }).filter(function (t) { return t !== null; });
      },
      /** Textes répondus comptés dans la semaine : de premier_jour − 1 à dernier_jour − 1 (partie 2.4). */
      textesRepondusSemaine: function (numero) {
        return joursDe(numero).map(function (d) { return texteRepondu(d - 1); }).filter(function (t) { return t !== null; });
      },
      /** Ordre des textes (partie 1.3) : entrée, histoire, puis textes du calendrier. */
      ordreTextes: entree.concat(Object.keys(jourDuTexte).filter(function (t) { return entree.indexOf(t) < 0; })
        .sort(function (a, b) { return jourDuTexte[a] - jourDuTexte[b]; }))
    };
    geler(lignes); geler(sauts); geler(semaines); geler(semainesEssai); geler(entree); geler(cal.membres); geler(cal.ordreTextes);
    return Object.freeze(cal);
  }

  return { lire: lire, TYPES: TYPES, ErreurCalendrier: ErreurCalendrier };
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosCalendrier; }
/*node-fin*/
