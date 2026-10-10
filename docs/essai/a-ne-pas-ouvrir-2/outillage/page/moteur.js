/* Moteur de la page du second essai (outillage d'essai, D-001 tenu).
 *
 * ÉTAT AU LOT 2 (histoire) : les règles communes (portrait, manches, révélations,
 * titres, tempéraments, Pas de Côté), `histoire` et `resume`. `calculer`
 * (jours de l'essai) arrive au lot 3 ; d'ici là il lève une erreur.
 * Le moteur du premier essai est gardé dans tests/premier-essai/.
 *
 * Fonctions pures : elles ne lisent ni l'écran, ni la mémoire, ni l'horloge,
 * ni le hasard (§8.8). Toutes les grandeurs sont exactes (fractions BigInt).
 * Aucun nombre du calendrier n'est écrit ici : jours, semaines, membres et
 * textes se lisent dans `cal` (calendrier.js) et le fichier scellé.
 *
 *   histoire(scelle, cal[, collecteur]) -> l'état à l'arrivée (jours de la
 *        première semaine du cercle à la veille de l'arrivée). Si `collecteur`
 *        est un objet, il reçoit le détail de chaque jour, de chaque semaine et
 *        de l'arrivée, pour la trace de l'histoire (trace.js, version témoin).
 *   resume(arrivee) -> le résumé de la partie 3.2 du schéma (V6), en chaînes
 *        ASCII et fractions écrites « p/q ».
 *   regles -> les règles une à une, pour les tests et pour le lot 3.
 *
 * Renvois : « §n » = simulation-2.md ; « caché n » = a-ne-pas-ouvrir-2/
 * regles-de-calcul-2.md, point n ; « règles 1 §n » = a-ne-pas-ouvrir/
 * regles-de-calcul.md ; « partie n » = a-ne-pas-ouvrir-2/schema.md.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosMoteur = (function (N) {
  var F = N.Fraction;

  var PORTEUR = 'porteur';
  /** Les quatre tensions de l'essai, dans l'ordre S, P, T, L (partie 1.3). */
  var TENSIONS = ['S', 'P', 'T', 'L'];

  /* Constantes des règles (spécification ; jamais lues dans le fichier, annexe B). */
  var C95 = F('0.95'), C07 = F('0.07'), C25 = F('0.25');
  var DEMI = F(1, 2), UN_CINQUIEME = F(1, 5), DEUX_CINQ = F(2, 5), TROIS_CINQ = F(3, 5);
  var SEUIL_NET = F(10);                    // §5.1 : net dès Σw ≥ 10
  var MIN_TENTATIVES_MYSTERE = 6;           // §6, point 3
  var MIN_ATTRIBUTIONS_SURPRISE = 4;        // §6, point 5
  var MIN_JOURS_SANS_FAUTE = 5;             // §6, point 6 (R7)
  var TEMP = {                              // §6, point 8 (conventions d'essai)
    fenetre: 56, anciennete: 56, minReponses: 20, minReponsesTexte: 3,
    original: F(3, 10), pontTextes: 6, pont: F(1, 8), mesure: F(1, 3), tranche: F(1, 2)
  };
  var ORDRE_TEMPERAMENTS = ['original', 'pont', 'mesure', 'tranche'];

  function ErreurMoteur(message) {
    var e = new Error('moteur : ' + message);
    e.name = 'ErreurMoteur';
    return e;
  }
  function exiger(cond, message) { if (!cond) { throw ErreurMoteur(message); } }
  function a(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /* ------------------------------------------------------------------ */
  /* Positions et portrait (§0, §5.1, §5.2 du premier essai)             */
  /* ------------------------------------------------------------------ */

  /** Côté d'un niveau : -1 défavorable, 0 neutre, 1 favorable. */
  function cote(niveau) { return niveau <= 2 ? -1 : (niveau === 3 ? 0 : 1); }
  /** Valeur v d'une position. */
  function valeur(niveau) { return F(niveau - 1, 4); }
  function identiques(r1, r2) { return r1.niveau === r2.niveau && r1.raison === r2.raison; }

  /** Les raisons d'un texte : `considerations` (texte joué) ou `raisons` (texte abstrait). */
  function raisonsDe(tx) { return tx.considerations || tx.raisons; }
  function raisonDeRang(tx, rang) {
    var l = raisonsDe(tx);
    for (var i = 0; i < l.length; i++) { if (l[i].rang === rang) { return l[i]; } }
    throw ErreurMoteur('raison ' + rang + ' absente du texte');
  }

  /** §5.1 : classe, poids w et pôle π d'une réponse. */
  function classer(tx, rep) {
    var c = cote(rep.niveau);
    if (c === 0) { return { classe: 'neutre', w: F(0), pole: null }; }
    var pi = c > 0 ? tx.sens : 1 - tx.sens;
    var rho = rep.raison === 'aucune' ? 'aucun' : raisonDeRang(tx, rep.raison).pole;
    if (rho === 'aucun') { return { classe: 'penchant', w: DEMI, pole: pi }; }
    if (rho === pi) { return { classe: 'arbitrage', w: F(1), pole: pi }; }
    return { classe: 'tiraille', w: F(0), pole: null };
  }

  /** Sommes d'un curseur : Σw et Σw·π (π vaut 0 ou 1). */
  function sommesVides() { return { sw: F(0), swp: F(0) }; }
  function ajouter(s, cl, facteur) {
    if (cl.w.estZero()) { return s; }
    var w = cl.w.fois(facteur);
    return { sw: s.sw.plus(w), swp: cl.pole === 1 ? s.swp.plus(w) : s.swp };
  }
  /** §5.2 : centre, largeur, netteté. */
  function curseur(s) {
    var c = F(2).plus(s.swp).divise(F(4).plus(s.sw));
    var l = F.max(C95.moins(C07.fois(s.sw)), C25);
    return { c: c, l: l, net: s.sw.supEgal(SEUIL_NET), somme_w: s.sw };
  }

  /* ------------------------------------------------------------------ */
  /* Contexte : fichier scellé, calendrier, réponses                     */
  /* ------------------------------------------------------------------ */

  /**
   * reponsePorteur(t) : la réponse du porteur au texte t, ou null (lot 3 :
   * lue dans le journal). Dans l'histoire, le porteur n'a pas de réponse.
   */
  function contexte(scelle, cal, reponsePorteur) {
    exiger(scelle && scelle.format === 'elenchos-essai-scelle' && scelle.version === 5, 'fichier scellé : format ou version inattendus');
    exiger(cal && typeof cal.texteRepondu === 'function', 'calendrier absent');
    var tir = N.creerTirage(scelle.graine);
    var membres = cal.membres.slice();
    var personnages = membres.filter(function (m) { return m !== PORTEUR; });
    var entree = cal.textesEntree.slice();
    var facteurPorteur = scelle.reglage.facteur;
    exiger(Number.isSafeInteger(facteurPorteur) && facteurPorteur >= 1, 'facteur');
    var premierJour = cal.semaines[0].premier_jour;

    function texte(t) {
      var x = a(scelle.textes, t) ? scelle.textes[t] : (a(scelle.histoire.textes, t) ? scelle.histoire.textes[t] : null);
      exiger(x !== null, 'texte inconnu : ' + t);
      return x;
    }
    function estEntree(t) { return entree.indexOf(t) >= 0; }
    function reponse(m, t) {
      if (m === PORTEUR) { return reponsePorteur ? reponsePorteur(t) : null; }
      exiger(a(scelle.reponses, t), 'réponses absentes : ' + t);
      var r = a(scelle.reponses[t], m) ? scelle.reponses[t][m] : null;
      var absent = scelle.absences[m].indexOf(t) >= 0;
      exiger((r === null) === absent, 'réponse et absence de ' + m + ' au texte ' + t);
      return r;
    }
    /** Un personnage est présent au jour j s'il n'est pas absent au texte répondu ce jour-là (partie 2.7). */
    function present(m, j) {
      if (m === PORTEUR) { return true; }
      var t = cal.texteRepondu(j);
      return t === null || scelle.absences[m].indexOf(t) < 0;
    }
    function facteur(m) { return m === PORTEUR ? facteurPorteur : 1; }
    function jourDe(t) { return cal.jourDeReponse(t); }
    function aUnTitre(t) {
      if (a(scelle.textes, t)) { return true; }
      return a(scelle.histoire.textes, t) && scelle.histoire.textes[t].fiche !== null;
    }

    /* Sommes de chaque membre, par tension, sur l'entrée et les textes répondus
     * jusqu'au jour d compris, avec ses propres poids (facteur pour le porteur). */
    var memo = Object.create(null);
    function sommesJusqua(m, d) {
      var tab = memo[m];
      if (!tab) {
        var s0 = {};
        TENSIONS.forEach(function (x) { s0[x] = sommesVides(); });
        entree.forEach(function (t) {
          var r = reponse(m, t);
          if (r) { var tx = texte(t); s0[tx.tension] = ajouter(s0[tx.tension], classer(tx, r), facteur(m)); }
        });
        tab = memo[m] = { dernier: premierJour - 1, parJour: Object.create(null) };
        tab.parJour[String(premierJour - 1)] = s0;
      }
      if (d < premierJour - 1) { d = premierJour - 1; }
      while (tab.dernier < d) {
        var prec = tab.parJour[String(tab.dernier)];
        var jour = tab.dernier + 1;
        var suiv = {};
        TENSIONS.forEach(function (x) { suiv[x] = prec[x]; });
        var t = cal.texteRepondu(jour);
        if (t !== null) {
          var r = reponse(m, t);
          if (r) { var tx = texte(t); suiv[tx.tension] = ajouter(suiv[tx.tension], classer(tx, r), facteur(m)); }
        }
        tab.parJour[String(jour)] = suiv;
        tab.dernier = jour;
      }
      return tab.parJour[String(d)];
    }

    return {
      scelle: scelle, cal: cal, tir: tir, membres: membres, personnages: personnages, entree: entree,
      premierJour: premierJour, texte: texte, estEntree: estEntree, reponse: reponse, present: present,
      facteur: facteur, jourDe: jourDe, aUnTitre: aUnTitre, sommesJusqua: sommesJusqua,
      estMembre: function (m, j) { return cal.depuis(m) <= j; }
    };
  }

  /* ------------------------------------------------------------------ */
  /* Une manche (§4 ; caché 4 et 5 ; règles 1 §3 et §4 ; partie 4.3.4)   */
  /* ------------------------------------------------------------------ */

  function mediane(valeurs) {
    var v = valeurs.slice().sort(function (x, y) { return x.cmp(y); });
    var n = v.length;
    if (n % 2 === 1) { return v[(n - 1) / 2]; }
    return v[n / 2 - 1].plus(v[n / 2]).divise(2);
  }

  /** Côté attendu, aligné sur le sens du texte, d'une valeur x (règles 1 §3.2). */
  function coteAttendu(x, stricts) {
    if (stricts) { return x.sup(TROIS_CINQ) ? 1 : (x.inf(DEUX_CINQ) ? -1 : 0); }
    return x.supEgal(TROIS_CINQ) ? 1 : (x.infEgal(DEUX_CINQ) ? -1 : 0);
  }

  /** Score d'une carte de côté sigma pour un candidat de côté attendu e (règles 1 §3.3). */
  function score(sigma, e) {
    if (e !== 'inconnu' && sigma === e) { return 2; }
    if (sigma === 0 || e === 0 || e === 'inconnu') { return 1; }
    return 0;
  }

  /** Raison devinée sur la carte à raison cachée (règles 1 §3.5). */
  function raisonDevinee(tx, sigma, e) {
    var liste = raisonsDe(tx).filter(function (r) {
      return sigma === 0 || (sigma > 0 && r.cote === 'pour') || (sigma < 0 && r.cote === 'contre');
    });
    if (liste.length === 0) { return 'aucune'; }
    if (e === 1 || e === -1) {
      var vise = e === 1 ? tx.sens : 1 - tx.sens;
      for (var i = 0; i < liste.length; i++) { if (liste[i].pole === vise) { return liste[i].rang; } }
    }
    for (var k = 0; k < liste.length; k++) { if (liste[k].pole === 'aucun') { return liste[k].rang; } }
    return liste[0].rang;
  }

  /**
   * Manche du devineur g au jour j, sur le texte répondu au jour j − 1.
   * mancheDe(d, g) : la manche déjà calculée de g au jour d < j (pour le côté
   * attendu du porteur). designations : pour le porteur seulement (lot 3),
   * tableau de {designe, raison} ou null (Deviner jamais affiché).
   */
  function calculerManche(ctx, g, j, mancheDe, designations) {
    var tir = ctx.tir, cal = ctx.cal;
    var n = cal.texteRepondu(j - 1);
    exiger(n !== null, 'jour ' + j + ' : pas de texte à deviner');
    var tx = ctx.texte(n);
    var cj = String(j);
    // Candidats : les autres membres qui l'étaient le jour où le texte a été répondu (§4, caché 4).
    var candidats = ctx.membres.filter(function (m) { return m !== g && ctx.estMembre(m, j - 1); });
    var auteurs = candidats.filter(function (m) { return ctx.reponse(m, n) !== null; });

    // R3 (caché 5, 4.2) : curseur de l'auteur vu au jour j (textes répondus jusqu'au jour j − 2), ses propres poids.
    var possibles = {};
    var xs = [];
    auteurs.forEach(function (au) {
      var rep = ctx.reponse(au, n);
      var v = valeur(rep.niveau);
      var x = tx.sens === 1 ? v : F(1).moins(v);
      var cur = curseur(ctx.sommesJusqua(au, j - 2)[tx.tension]);
      possibles[au] = { c: cur.c, distance: x.moins(cur.c).abs(), l: cur.l, net: cur.net, niveau: rep.niveau,
        raison: rep.raison, rarete: null, somme_w: cur.somme_w, surprise: null, x: x };
      xs.push(x);
    });
    var med = auteurs.length ? mediane(xs) : null;
    auteurs.forEach(function (au) {
      var p = possibles[au];
      p.rarete = p.x.moins(med).abs();
      p.surprise = p.net ? p.distance : p.rarete;
    });

    // Classement (règles 1 §4.3, étape 1).
    var classement = auteurs.slice().sort(function (x, y) {
      var c = possibles[y].surprise.cmp(possibles[x].surprise);
      if (c !== 0) { return c; }
      return tir.comparer(tir.t('surprise|' + g + '|' + cj + '|' + x), tir.t('surprise|' + g + '|' + cj + '|' + y));
    });
    var departages = 0;
    for (var i = 0; i < classement.length;) {
      var k = i + 1;
      while (k < classement.length && possibles[classement[k]].surprise.egal(possibles[classement[i]].surprise)) { k++; }
      if (k - i >= 2) { departages++; }
      i = k;
    }

    // Places (étape 2). À quatre membres, il y a au plus trois réponses : toutes sont servies, dans l'ordre de l'étape 1.
    var places = classement.slice(0, 2);
    if (classement.length >= 3) { places.push(tir.plusPetit(classement.slice(2), 'hasard|' + g + '|' + cj + '|')); }

    // Cartes identiques remplacées (étape 3).
    var remplacements = [];
    for (;;) {
      var avecJumelle = places.filter(function (p) {
        return places.some(function (o) { return o !== p && identiques(possibles[o], possibles[p]); });
      });
      if (avecJumelle.length === 0) { break; }
      var eligibles = classement.filter(function (r) {
        return places.indexOf(r) < 0 && places.every(function (p) { return !identiques(possibles[r], possibles[p]); });
      });
      if (eligibles.length === 0) { break; }
      var ecartee = avecJumelle.reduce(function (pire, p) { return classement.indexOf(p) > classement.indexOf(pire) ? p : pire; });
      var place = places.indexOf(ecartee);
      places[place] = eligibles[0];
      remplacements.push({ ecartee: ecartee, place: place + 1, remplacante: eligibles[0] });
    }

    // Carte à raison cachée (règles 1 §4.4).
    var cachee = null;
    if (places.length) {
      cachee = places[places.length - 1];
      if (possibles[cachee].raison === 'aucune') {
        var avecRaison = places.filter(function (p) { return possibles[p].raison !== 'aucune'; });
        if (avecRaison.length) {
          cachee = avecRaison.reduce(function (pire, p) { return classement.indexOf(p) > classement.indexOf(pire) ? p : pire; });
        }
      }
    }

    // Ordre d'affichage (§4.5 du premier essai).
    var ordre = tir.melanger(places, 'ordre|' + g + '|' + cj + '|');
    var cartes = ordre.map(function (au) {
      return { auteur: au, auteur_compte: au, cachee: au === cachee, designe: null, raison_devinee: null };
    });

    var res = {
      candidats: candidats, cartes: cartes, classement: classement, cotes_attendus: null, curseur_porteur: null,
      departages: departages, mediane: med, ordre: ordre, places: places.slice(), possibles: possibles,
      raison_cachee: cachee, rangs: null, remplacements: remplacements, texte: n, total: null
    };

    if (g === PORTEUR) {
      exiger(designations === null || designations === undefined || (Array.isArray(designations) && designations.length === cartes.length),
        'jour ' + j + ' : le porteur doit avoir ' + cartes.length + ' carte(s)');
      if (designations) { cartes.forEach(function (c, x) { c.designe = designations[x].designe; c.raison_devinee = designations[x].raison; }); }
    } else {
      devinerPersonnage(ctx, g, j, tx, res, mancheDe);
    }
    redistribuer(cartes, possibles, ctx.membres);
    return res;
  }

  /** Règles 1 §3 et caché 4 : rangs, côtés attendus, affectation, raison devinée. */
  function devinerPersonnage(ctx, g, j, tx, res, mancheDe) {
    var tir = ctx.tir;
    var candidats = res.candidats;
    var rangs = {};
    tir.melanger(candidats, 'devine|' + g + '|' + j + '|').forEach(function (c, i) { rangs[c] = i + 1; });

    var cotes = {};
    var curPorteur = null;
    candidats.forEach(function (x) {
      if (x !== PORTEUR) {
        var p = F(ctx.scelle.personnages[x].profil[tx.tension].position, 100);
        cotes[x] = coteAttendu(tx.sens === 1 ? p : F(1).moins(p), false);
        return;
      }
      // Le porteur : ses réponses vues dans les cartes de g, déjà révélées, même tension, poids normaux (caché 4).
      var s = sommesVides();
      for (var d = ctx.premierJour; d <= j - 1; d++) {
        var m = mancheDe(d, g);
        if (!m || m.places.indexOf(PORTEUR) < 0) { continue; }
        var tm = ctx.texte(m.texte);
        if (tm.tension !== tx.tension) { continue; }
        s = ajouter(s, classer(tm, ctx.reponse(PORTEUR, m.texte)), 1);
      }
      var cur = curseur(s);
      curPorteur = { c: cur.c, somme_w: cur.somme_w };
      if (cur.somme_w.estZero()) { cotes[x] = 'inconnu'; return; }
      cotes[x] = coteAttendu(tx.sens === 1 ? cur.c : F(1).moins(cur.c), ctx.scelle.reglage.seuils_stricts === true);
    });

    // Affectation de total maximal, la plus petite dans l'ordre lexicographique des rangs (règles 1 §3.4).
    var cartes = res.cartes;
    var nb = candidats.length;
    var parRang = {};
    candidats.forEach(function (c) { parRang[rangs[c]] = c; });
    var meilleur = null, meilleurTotal = -1;
    var suite = [];
    (function explorer(i, total) {
      if (i === cartes.length) {
        if (total > meilleurTotal) { meilleurTotal = total; meilleur = suite.slice(); }
        return;
      }
      for (var r = 1; r <= nb; r++) {
        if (suite.indexOf(r) >= 0) { continue; }
        suite.push(r);
        explorer(i + 1, total + score(cote(res.possibles[cartes[i].auteur].niveau), cotes[parRang[r]]));
        suite.pop();
      }
    })(0, 0);
    exiger(cartes.length === 0 || meilleur !== null, 'affectation impossible');
    cartes.forEach(function (c, i) { c.designe = parRang[meilleur[i]]; });
    cartes.forEach(function (c) {
      if (c.cachee) { c.raison_devinee = raisonDevinee(tx, cote(res.possibles[c.auteur].niveau), cotes[c.designe]); }
    });
    res.rangs = rangs;
    res.cotes_attendus = cotes;
    res.curseur_porteur = curPorteur;
    res.total = cartes.length ? meilleurTotal : 0;
  }

  /** Règles 1 §4.3, étape 4 : auteurs redistribués entre cartes identiques. */
  function redistribuer(cartes, possibles, membres) {
    var vus = [];
    var ordreMembre = function (x, y) { return membres.indexOf(x) - membres.indexOf(y); };
    cartes.forEach(function (c, i) {
      if (vus.indexOf(i) >= 0) { return; }
      var groupe = [];
      cartes.forEach(function (d, k) { if (identiques(possibles[c.auteur], possibles[d.auteur])) { groupe.push(k); } });
      groupe.forEach(function (k) { vus.push(k); });
      if (groupe.length < 2) { return; }
      var auteurs = groupe.map(function (k) { return cartes[k].auteur; });
      var pris = [], libres = [];
      groupe.forEach(function (k) {
        var d = cartes[k].designe;
        if (d !== null && d !== 'passe' && auteurs.indexOf(d) >= 0 && pris.indexOf(d) < 0) { cartes[k].auteur_compte = d; pris.push(d); }
        else { libres.push(k); }
      });
      var restants = auteurs.filter(function (x) { return pris.indexOf(x) < 0; }).sort(ordreMembre);
      libres.forEach(function (k, x) { cartes[k].auteur_compte = restants[x]; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Révélation (§4 ; D-024 ; R5 ; R11 ; parties 4.3.5)                  */
  /* ------------------------------------------------------------------ */

  function estPasse(designe) { return designe === 'passe' || designe === null; }

  /** Juste (D-024) : le membre désigné a donné exactement la réponse de la carte. */
  function estJuste(ctx, manche, carte) {
    if (estPasse(carte.designe)) { return false; }
    var r = ctx.reponse(carte.designe, manche.texte);
    return r !== null && identiques(r, manche.possibles[carte.auteur]);
  }

  /** Verdicts du porteur (partie 4.3.5). */
  function verdict(juste, jumeau, raison, passe) {
    if (passe) { return 'passe'; }
    if (!juste) { return 'faux'; }
    return (jumeau ? 'jumeau' : 'juste') + (raison ? '_et_raison' : '');
  }

  /**
   * Le Pas de Côté (§6, point 7 ; caché 8) sur le texte t : arbitrage net à
   * l'opposé du curseur net et clairement penché de son auteur, tel qu'il était
   * juste avant (toutes ses réponses antérieures, entrée comprise, ses poids).
   */
  function pasDeCote(ctx, t) {
    if (ctx.estEntree(t)) { return []; }
    var tx = ctx.texte(t);
    var jour = ctx.jourDe(t);
    return ctx.membres.filter(function (m) {
      var r = ctx.reponse(m, t);
      if (r === null) { return false; }
      var cl = classer(tx, r);
      if (cl.classe !== 'arbitrage') { return false; }
      var cur = curseur(ctx.sommesJusqua(m, jour - 1)[tx.tension]);
      if (!cur.net || cur.c.moins(DEMI).abs().inf(UN_CINQUIEME)) { return false; }
      return cur.c.sup(DEMI) ? cl.pole === 0 : cl.pole === 1;
    });
  }

  /**
   * Révélation du jour j : le texte répondu au jour j − 2, avec les manches
   * jouées au jour j − 1. revelations[d] : révélations déjà calculées (points de la semaine).
   */
  function calculerRevelation(ctx, j, manchesVeille, revelations) {
    var cal = ctx.cal;
    var t = cal.texteRepondu(j - 2);
    var semaine = cal.semaineDuJour(j);
    var devineurs = {};
    Object.keys(manchesVeille).forEach(function (g) {
      var m = manchesVeille[g];
      var justes = [], jumeaux = [], verdicts = [];
      var trouvee = null;
      m.cartes.forEach(function (c) {
        var juste = estJuste(ctx, m, c);
        var jumeau = juste && c.designe !== c.auteur_compte;
        var raison = c.cachee && juste && c.raison_devinee !== null && c.raison_devinee === m.possibles[c.auteur].raison;
        if (c.cachee) { trouvee = raison; }
        justes.push(juste);
        jumeaux.push(jumeau);
        verdicts.push(verdict(juste, jumeau, raison, estPasse(c.designe)));
      });
      var points = justes.filter(Boolean).length;
      var ps = null;
      if (semaine !== null) {
        ps = points;
        var w = cal.semaine(semaine);
        for (var d = w.premier_jour; d < j; d++) {
          if (revelations[d] && revelations[d].devineurs[g]) { ps += revelations[d].devineurs[g].points; }
        }
      }
      devineurs[g] = { jumeaux: jumeaux, justes: justes, points: points, points_semaine: ps,
        raison_trouvee: m.cartes.length ? trouvee : null, verdicts: g === PORTEUR ? verdicts : null };
    });
    return { devineurs: devineurs, pas_de_cote: pasDeCote(ctx, t), texte: t };
  }

  /* ------------------------------------------------------------------ */
  /* Titres d'une semaine (§6 ; caché 9 ; partie 4.2 et S1 3.9)          */
  /* ------------------------------------------------------------------ */

  /**
   * Titres de la semaine `numero`. revelations[d] et manches[d] : calculés pour
   * tous les jours de la semaine. Membres de la semaine : ceux qui le sont à son
   * dernier jour, dans l'ordre des visages.
   */
  function calculerTitres(ctx, numero, revelations, manches) {
    var cal = ctx.cal, tir = ctx.tir;
    var w = cal.semaine(numero);
    var membres = ctx.membres.filter(function (m) { return ctx.estMembre(m, w.dernier_jour); });
    var jours = [];
    for (var d = w.premier_jour; d <= w.dernier_jour; d++) { if (revelations[d]) { jours.push(d); } }
    function mancheRevelee(d, g) { return manches[d - 1] && manches[d - 1][g] ? manches[d - 1][g] : null; }
    function zero() { var o = {}; membres.forEach(function (m) { o[m] = 0; }); return o; }

    // Le Sans-Faute (R7) : des cartes au moins cinq jours, aucune erreur ni passe ces jours-là.
    var sansFaute = membres.filter(function (m) {
      var avecCartes = jours.filter(function (d) { var x = mancheRevelee(d, m); return x && x.cartes.length >= 1; });
      if (avecCartes.length < MIN_JOURS_SANS_FAUTE) { return false; }
      return avecCartes.every(function (d) { return revelations[d].devineurs[m].justes.every(Boolean); });
    });

    // Le Devin : le plus de points, au moins un ; puis les raisons cachées trouvées ; puis t("devin|w|prénom").
    var points = zero(), raisons = zero();
    jours.forEach(function (d) {
      var dv = revelations[d].devineurs;
      Object.keys(dv).forEach(function (m) {
        if (!a(points, m)) { return; }
        points[m] += dv[m].points;
        if (dv[m].raison_trouvee === true) { raisons[m] += 1; }
      });
    });
    var devin = { departage: 'aucun', points: points, raisons: raisons, titulaire: null };
    var maxP = Math.max.apply(null, membres.map(function (m) { return points[m]; }));
    if (maxP >= 1) {
      var tete = membres.filter(function (m) { return points[m] === maxP; });
      if (tete.length === 1) { devin.titulaire = tete[0]; }
      else {
        var maxR = Math.max.apply(null, tete.map(function (m) { return raisons[m]; }));
        var tete2 = tete.filter(function (m) { return raisons[m] === maxR; });
        if (tete2.length === 1) { devin.titulaire = tete2[0]; devin.departage = 'raisons'; }
        else { devin.titulaire = tir.plusPetit(tete2, 'devin|' + numero + '|'); devin.departage = 'tirage'; }
      }
    }

    // Le Mystère et la surprise : tentatives, passes exclues ; une erreur désigne un membre dont la réponse diffère.
    var tentatives = zero(), erreurs = zero();
    var attributions = {}, errs = {};
    jours.forEach(function (d) {
      var t = revelations[d].texte;
      attributions[t] = 0; errs[t] = 0;
      var dv = revelations[d].devineurs;
      Object.keys(dv).forEach(function (g) {
        var m = mancheRevelee(d, g);
        m.cartes.forEach(function (c, i) {
          if (estPasse(c.designe)) { return; }
          var faux = !dv[g].justes[i];
          attributions[t] += 1;
          if (faux) { errs[t] += 1; }
          if (a(tentatives, c.auteur_compte)) {
            tentatives[c.auteur_compte] += 1;
            if (faux) { erreurs[c.auteur_compte] += 1; }
          }
        });
      });
    });
    var mystere = { departage: 'aucun', erreurs: erreurs, tentatives: tentatives, titulaire: null };
    var elig = membres.filter(function (m) { return tentatives[m] >= MIN_TENTATIVES_MYSTERE && erreurs[m] >= 1; });
    if (elig.length) {
      var prop = function (m) { return F(erreurs[m], tentatives[m]); };
      var maxProp = elig.reduce(function (b, m) { return prop(m).sup(b) ? prop(m) : b; }, prop(elig[0]));
      var t1 = elig.filter(function (m) { return prop(m).egal(maxProp); });
      if (t1.length === 1) { mystere.titulaire = t1[0]; }
      else {
        var maxE = Math.max.apply(null, t1.map(function (m) { return erreurs[m]; }));
        var t2 = t1.filter(function (m) { return erreurs[m] === maxE; });
        if (t2.length === 1) { mystere.titulaire = t2[0]; mystere.departage = 'erreurs'; }
        else { mystere.titulaire = tir.plusPetit(t2, 'mystere|' + numero + '|'); mystere.departage = 'tirage'; }
      }
    }

    // Le Fidèle : tous les textes de la semaine répondus depuis son arrivée (§6, point 4).
    var repondus = cal.textesRepondusSemaine(numero);
    var fideles = membres.filter(function (m) {
      return repondus.every(function (t) { return ctx.jourDe(t) < cal.depuis(m) || ctx.reponse(m, t) !== null; });
    });

    // La surprise de la semaine : seul un texte qui a un titre peut l'être (caché 9).
    var surprise = { attributions: attributions, departage: 'aucun', erreurs: errs, texte: null };
    var textesElig = Object.keys(attributions).filter(function (t) {
      return ctx.aUnTitre(t) && attributions[t] >= MIN_ATTRIBUTIONS_SURPRISE && errs[t] >= 1;
    });
    if (textesElig.length) {
      var pr = function (t) { return F(errs[t], attributions[t]); };
      var mx = textesElig.reduce(function (b, t) { return pr(t).sup(b) ? pr(t) : b; }, pr(textesElig[0]));
      var s1 = textesElig.filter(function (t) { return pr(t).egal(mx); });
      if (s1.length === 1) { surprise.texte = s1[0]; }
      else {
        var me = Math.max.apply(null, s1.map(function (t) { return errs[t]; }));
        var s2 = s1.filter(function (t) { return errs[t] === me; });
        if (s2.length === 1) { surprise.texte = s2[0]; surprise.departage = 'erreurs'; }
        else { surprise.texte = tir.plusPetit(s2, 'surprise-semaine|' + numero + '|'); surprise.departage = 'tirage'; }
      }
    }

    return { devin: devin, fidele: { titulaires: fideles }, mystere: mystere, sans_faute: sansFaute, semaine: numero, surprise: surprise };
  }

  /* ------------------------------------------------------------------ */
  /* Tempéraments (§6, point 8 ; caché 7 ; partie 4.3.8)                 */
  /* ------------------------------------------------------------------ */

  function calculerTemperaments(ctx, d, p) {
    var cal = ctx.cal;
    var n = { neutres: 0, reponses: 0, seul_cote: 0, seul_milieu: 0, textes_partages: 0, tres: 0 };
    for (var jour = d - (TEMP.fenetre - 1); jour <= d; jour++) {
      var t = cal.texteRepondu(jour - 2); // révélé ce jour-là
      if (t === null || ctx.estEntree(t)) { continue; }
      var rp = ctx.reponse(p, t);
      if (rp === null) { continue; }
      var autres = ctx.membres.filter(function (m) { return m !== p; })
        .map(function (m) { return ctx.reponse(m, t); }).filter(function (r) { return r !== null; });
      if (autres.length + 1 < TEMP.minReponsesTexte) { continue; }
      var cp = cote(rp.niveau);
      n.reponses += 1;
      if (cp === 0) { n.neutres += 1; }
      if (rp.niveau === 1 || rp.niveau === 5) { n.tres += 1; }
      if (cp !== 0 && !autres.some(function (r) { return cote(r.niveau) === cp; })) { n.seul_cote += 1; }
      var partage = autres.some(function (r) { return cote(r.niveau) > 0; }) && autres.some(function (r) { return cote(r.niveau) < 0; });
      if (partage) {
        n.textes_partages += 1;
        if (cp === 0 && !autres.some(function (r) { return cote(r.niveau) === 0; })) { n.seul_milieu += 1; }
      }
    }
    var liste = [];
    if (d - cal.depuis(p) >= TEMP.anciennete && n.reponses >= TEMP.minReponses) {
      var part = function (x) { return F(x, n.reponses); };
      if (part(n.seul_cote).supEgal(TEMP.original)) { liste.push('original'); }
      if (n.textes_partages >= TEMP.pontTextes && F(n.seul_milieu, n.textes_partages).supEgal(TEMP.pont)) { liste.push('pont'); }
      if (part(n.neutres).supEgal(TEMP.mesure)) { liste.push('mesure'); }
      if (part(n.tres).supEgal(TEMP.tranche)) { liste.push('tranche'); }
    }
    n.temperaments = liste;
    return n;
  }

  /* ------------------------------------------------------------------ */
  /* L'histoire (§1, §8.8 ; partie 3)                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Jours de la première semaine du cercle à la veille de l'arrivée : manches,
   * révélations, titres des semaines tombées, tempéraments du dernier dimanche,
   * curseurs vus à l'arrivée. Ne dépend en rien du porteur.
   */
  function histoire(scelle, cal, collecteur) {
    var ctx = contexte(scelle, cal, null);
    var coupure = cal.premier - 1;
    var manches = {}, revelations = {};
    function mancheDe(d, g) { return manches[d] && manches[d][g] ? manches[d][g] : null; }

    for (var j = ctx.premierJour; j <= coupure; j++) {
      manches[j] = {};
      if (cal.texteRepondu(j - 1) !== null) {
        ctx.personnages.forEach(function (g) {
          if (ctx.estMembre(g, j) && ctx.present(g, j)) { manches[j][g] = calculerManche(ctx, g, j, mancheDe, null); }
        });
      }
      revelations[j] = cal.texteRepondu(j - 2) !== null && manches[j - 1] ? calculerRevelation(ctx, j, manches[j - 1], revelations) : null;
    }

    var semaines = cal.semaines.filter(function (w) { return w.dernier_jour <= coupure; });
    exiger(semaines.length >= 1 && semaines[semaines.length - 1].dernier_jour === coupure, 'la veille de l\'arrivée finit une semaine');
    var titres = semaines.map(function (w) { return calculerTitres(ctx, w.numero, revelations, manches); });

    var curseurs = {}, sommes = {}, temperaments = {};
    ctx.personnages.forEach(function (p) {
      curseurs[p] = {}; sommes[p] = {};
      var s = ctx.sommesJusqua(p, cal.premier - 2); // vus au jour de l'arrivée : entrée et textes répondus jusqu'au jour j − 2
      TENSIONS.forEach(function (t) { sommes[p][t] = s[t]; curseurs[p][t] = curseur(s[t]); });
      temperaments[p] = calculerTemperaments(ctx, coupure, p);
    });

    if (collecteur && typeof collecteur === 'object') {
      collecteur.jours = {};
      for (var d = ctx.premierJour; d <= coupure; d++) {
        collecteur.jours[String(d)] = { manches: manches[d], repondu: cal.texteRepondu(d), revelation: revelations[d] };
      }
      collecteur.semaines = titres;
      collecteur.arrivee = { curseurs: curseurs, temperaments: temperaments };
    }

    return {
      coupure: coupure,
      curseurs: curseurs,
      manche_jour_0: { manches: manches[coupure], texte: cal.texteRepondu(coupure - 1) },
      sommes: sommes,
      temperaments: temperaments,
      tirage: scelle.histoire.tirage,
      titres: titres
    };
  }

  /** Le résumé de l'état à l'arrivée (partie 3.2), prêt pour la forme canonique. */
  function resume(arr) {
    var curseurs = {}, temps = {}, devineurs = {};
    Object.keys(arr.curseurs).forEach(function (p) {
      curseurs[p] = {};
      TENSIONS.forEach(function (t) {
        curseurs[p][t] = { c: arr.curseurs[p][t].c.toString(), somme_w: arr.curseurs[p][t].somme_w.toString() };
      });
      temps[p] = arr.temperaments[p].temperaments.slice();
    });
    Object.keys(arr.manche_jour_0.manches).forEach(function (g) {
      devineurs[g] = arr.manche_jour_0.manches[g].cartes.map(function (c) {
        return { auteur: c.auteur, auteur_compte: c.auteur_compte, cachee: c.cachee, designe: c.designe, raison_devinee: c.raison_devinee };
      });
    });
    return {
      curseurs: curseurs,
      format: 'elenchos-essai-resume-histoire',
      manche_jour_0: { devineurs: devineurs, texte: arr.manche_jour_0.texte },
      temperaments: temps,
      tirage: arr.tirage,
      titres: arr.titres.map(function (x) {
        return { devin: x.devin.titulaire, fidele: x.fidele.titulaires.slice(), mystere: x.mystere.titulaire,
          sans_faute: x.sans_faute.slice(), semaine: x.semaine, surprise: x.surprise.texte };
      }),
      version: 1
    };
  }

  /** Lot 3. */
  function calculer() { throw ErreurMoteur('calculer : lot 3, pas encore écrit'); }

  return {
    ErreurMoteur: ErreurMoteur,
    PORTEUR: PORTEUR, TENSIONS: TENSIONS, ORDRE_TEMPERAMENTS: ORDRE_TEMPERAMENTS,
    histoire: histoire, resume: resume, calculer: calculer,
    regles: {
      contexte: contexte, cote: cote, valeur: valeur, identiques: identiques, classer: classer,
      sommesVides: sommesVides, ajouter: ajouter, curseur: curseur, mediane: mediane,
      coteAttendu: coteAttendu, score: score, raisonDevinee: raisonDevinee,
      calculerManche: calculerManche, redistribuer: redistribuer, estJuste: estJuste,
      pasDeCote: pasDeCote, calculerRevelation: calculerRevelation, calculerTitres: calculerTitres,
      calculerTemperaments: calculerTemperaments, TEMP: TEMP
    }
  };
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosMoteur; }
/*node-fin*/
