/* Moteur de la page du second essai (outillage d'essai, D-001 tenu).
 *
 * LOTS 2 ET 3 : les règles communes (portrait, manches, révélations, titres,
 * tempéraments, Pas de Côté), `histoire` et `resume` (lot 2), `calculer`
 * et `cartesServies` (lot 3).
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
 *   calculer(scelle, cal, arrivee, journal) -> R : les jours 1 à K de la
 *        partie (trace de partie, partie 4.3, sans les durées ni les entrées),
 *        R.sauts, R.titres (toutes les semaines tombées), R.agregats ; en plus,
 *        pour les écrans, R.jours[j].cartes_porteur et .compte_a_rebours.
 *   cartesServies(scelle, cal, arrivee) -> j -> {n, cachee} : les cartes du
 *        porteur, qui ne dépendent que du fichier (règle 7 du journal).
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
  function retirer(s, cl, facteur) {
    if (cl.w.estZero()) { return s; }
    var w = cl.w.fois(facteur);
    return { sw: s.sw.moins(w), swp: cl.pole === 1 ? s.swp.moins(w) : s.swp };
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

  /* Le tirage d'une graine, gardé d'un calcul à l'autre : t(clé) ne dépend que de
   * la graine et de la clé, et chaque geste refait le calcul (§8.8, budget de
   * 100 ms par geste). Un cache, pas un état : le résultat est le même sans lui. */
  var tirages = Object.create(null);
  function tirageDe(graine) {
    if (!tirages[graine]) { tirages[graine] = N.creerTirage(graine); }
    return tirages[graine];
  }

  /**
   * reponsePorteur(t) : la réponse du porteur au texte t, ou null (lot 3 :
   * lue dans le journal). Dans l'histoire, le porteur n'a pas de réponse.
   * arrivee (lot 3, facultatif) : l'état à l'arrivée ; les sommes des
   * personnages partent alors de ses `sommes` (vues le jour de l'arrivée),
   * que V6 a vérifiées, au lieu de refaire l'histoire.
   */
  function contexte(scelle, cal, reponsePorteur, arrivee) {
    exiger(scelle && scelle.format === 'elenchos-essai-scelle' && scelle.version === 5, 'fichier scellé : format ou version inattendus');
    exiger(cal && typeof cal.texteRepondu === 'function', 'calendrier absent');
    var tir = tirageDe(scelle.graine);
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
    var graine = arrivee ? { jour: cal.premier - 2, sommes: arrivee.sommes } : null;
    function sommesJusqua(m, d) {
      var tab = memo[m];
      if (!tab && graine && a(graine.sommes, m)) {
        tab = memo[m] = { dernier: graine.jour, parJour: Object.create(null) };
        tab.parJour[String(graine.jour)] = graine.sommes[m];
      }
      if (tab && d < tab.premier) { d = tab.premier; }
      if (tab && !tab.parJour[String(d)] && d < tab.dernier) {
        // Avant la graine (Pas de Côté sur le dernier texte de l'histoire) : on retire, jour après jour, les réponses.
        var cur = tab.parJour[String(graine.jour)];
        for (var x = graine.jour; x > d; x--) {
          var tx0 = cal.texteRepondu(x);
          if (tx0 !== null) {
            var r0 = reponse(m, tx0);
            if (r0) { var t0 = texte(tx0); var c0 = {}; TENSIONS.forEach(function (y) { c0[y] = cur[y]; }); c0[t0.tension] = retirer(cur[t0.tension], classer(t0, r0), facteur(m)); cur = c0; }
          }
          tab.parJour[String(x - 1)] = cur;
        }
        return tab.parJour[String(d)];
      }
      if (!tab) {
        var s0 = {};
        TENSIONS.forEach(function (x) { s0[x] = sommesVides(); });
        entree.forEach(function (t) {
          var r = reponse(m, t);
          if (r) { var tx = texte(t); s0[tx.tension] = ajouter(s0[tx.tension], classer(tx, r), facteur(m)); }
        });
        tab = memo[m] = { premier: premierJour - 1, dernier: premierJour - 1, parJour: Object.create(null) };
        tab.parJour[String(premierJour - 1)] = s0;
      }
      if (d < premierJour - 1) { d = premierJour - 1; }
      if (tab.parJour[String(d)]) { return tab.parJour[String(d)]; }
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
      for (var d = Math.max(ctx.premierJour, ctx.cal.depuis(PORTEUR)); d <= j - 1; d++) {
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

  /* ------------------------------------------------------------------ */
  /* Phrases (§5.5 à §5.7 du premier essai ; §5.7 du second)             */
  /* ------------------------------------------------------------------ */

  var POLES = {
    S: ['la sécurité', 'la liberté'], P: ['la précaution', "l'innovation"],
    T: ['la tradition', 'le changement'], L: ['la décision locale', 'la décision nationale']
  };
  var ENTRE = { S: 'sécurité et liberté', P: 'précaution et innovation', T: 'tradition et changement', L: 'local et national' };
  function aPole(p) { return p.indexOf('le ') === 0 ? 'au ' + p.slice(3) : 'à ' + p; }

  /** §5.6 du premier essai (règle 18, R1). */
  function phraseDuJour(tension, cl) {
    var p = POLES[tension];
    var s;
    if (cl.classe === 'arbitrage') { s = "Aujourd'hui, tu as fait passer " + p[cl.pole] + ' avant ' + p[1 - cl.pole] + '.'; }
    else if (cl.classe === 'penchant') { s = "Aujourd'hui, tu as penché vers " + p[cl.pole] + '.'; }
    else if (cl.classe === 'tiraille') { s = "Aujourd'hui, tu as donné du poids " + aPole(p[0]) + ' comme ' + aPole(p[1]) + '.'; }
    else { s = "Aujourd'hui, tu n'as penché ni vers " + p[0] + ' ni vers ' + p[1] + '.'; }
    return N.typographier(s);
  }

  /** §5.3 du second essai : nets du plus éloigné de 1/2, puis plus grand Σ, puis S, P, T, L ; puis flous du plus étroit. */
  function ordreMoi(tensions) {
    var rang = function (t) { return TENSIONS.indexOf(t); };
    var nets = TENSIONS.filter(function (t) { return tensions[t].net; }).sort(function (x, y) {
      var c = tensions[y].c.moins(DEMI).abs().cmp(tensions[x].c.moins(DEMI).abs());
      if (c !== 0) { return c; }
      c = tensions[y].somme_w.cmp(tensions[x].somme_w);
      return c !== 0 ? c : rang(x) - rang(y);
    });
    var flous = TENSIONS.filter(function (t) { return !tensions[t].net; }).sort(function (x, y) {
      var c = tensions[x].l.cmp(tensions[y].l);
      return c !== 0 ? c : rang(x) - rang(y);
    });
    return nets.concat(flous);
  }

  /**
   * §5.7 du second essai, phrase de la semaine lue à l'ouverture du dimanche d.
   * jourReference : la lecture précédente (veille du dimanche précédent), ou
   * l'état après l'entrée pour la première semaine de l'essai.
   */
  function phraseSemaine(ctx, numero, d, jourReference) {
    var lecture = {}, ref = [];
    var sL = ctx.sommesJusqua(PORTEUR, d - 1), sR = ctx.sommesJusqua(PORTEUR, jourReference);
    TENSIONS.forEach(function (t) {
      var c = curseur(sL[t]);
      lecture[t] = { c: c.c, net: c.net, somme_w: c.somme_w };
      if (curseur(sR[t]).net) { ref.push(t); }
    });
    var devenues = TENSIONS.filter(function (t) { return lecture[t].net && ref.indexOf(t) < 0 && !lecture[t].c.egal(DEMI); });
    // Poids de la semaine, poids normaux (S1, partie 3.9).
    var poids = {};
    TENSIONS.forEach(function (t) { poids[t] = { comptent: 0, pole0: F(0), pole1: F(0) }; });
    ctx.cal.textesRepondusSemaine(numero).forEach(function (n) {
      var r = ctx.reponse(PORTEUR, n);
      if (!r) { return; }
      var tx = ctx.texte(n), cl = classer(tx, r);
      if (cl.w.estZero()) { return; }
      var pt = poids[tx.tension];
      if (cl.pole === 0) { pt.pole0 = pt.pole0.plus(cl.w); } else { pt.pole1 = pt.pole1.plus(cl.w); }
      pt.comptent += 1;
    });
    var tension = null, cas, phrase;
    if (devenues.length) {
      tension = devenues.slice().sort(function (x, y) {
        var c = lecture[y].c.moins(DEMI).abs().cmp(lecture[x].c.moins(DEMI).abs());
        if (c !== 0) { return c; }
        c = lecture[y].somme_w.cmp(lecture[x].somme_w);
        return c !== 0 ? c : TENSIONS.indexOf(x) - TENSIONS.indexOf(y);
      })[0];
      cas = 'nette';
      phrase = 'Entre ' + ENTRE[tension] + ', tu choisis le plus souvent ' + POLES[tension][lecture[tension].c.sup(DEMI) ? 1 : 0] + '.';
    } else {
      var retenues = TENSIONS.filter(function (t) { return poids[t].comptent >= 2; });
      if (retenues.length === 0) {
        cas = 'floue';
        phrase = 'Cette semaine, ton portrait est encore flou. Chaque réponse le précise.';
      } else {
        tension = retenues.reduce(function (best, t) {
          var c = poids[t].pole0.moins(poids[t].pole1).abs().cmp(poids[best].pole0.moins(poids[best].pole1).abs());
          if (c !== 0) { return c > 0 ? t : best; }
          return poids[t].pole0.plus(poids[t].pole1).sup(poids[best].pole0.plus(poids[best].pole1)) ? t : best;
        });
        var diff = poids[tension].pole0.cmp(poids[tension].pole1);
        if (diff === 0) {
          cas = 'egalite';
          phrase = 'Cette semaine, entre ' + ENTRE[tension] + ", tu as penché autant d'un côté que de l'autre.";
        } else {
          cas = 'difference';
          phrase = 'Cette semaine, entre ' + ENTRE[tension] + ', tu as le plus souvent choisi ' + POLES[tension][diff > 0 ? 0 : 1] + '.';
        }
      }
    }
    return { cas: cas, devenues: devenues, lecture: lecture, phrase: N.typographier(phrase), poids: poids, reference: ref, tension: tension };
  }

  /* ------------------------------------------------------------------ */
  /* L'avis du cercle (§7.14, D-025)                                     */
  /* ------------------------------------------------------------------ */

  function avisCercle(ctx, t) {
    if (!a(ctx.scelle.textes, t) || ctx.estEntree(t)) { return null; } // texte abstrait : pas de vote
    var niveaux = ctx.membres.map(function (m) { return ctx.reponse(m, t); })
      .filter(function (r) { return r !== null; }).map(function (r) { return r.niveau; }).sort(function (x, y) { return x - y; });
    var n = niveaux.length;
    if (n < 3) { return null; }
    var comptes = [0, 0, 0, 0, 0];
    niveaux.forEach(function (v) { comptes[v - 1] += 1; });
    var milieu, cotes;
    if (n % 2 === 1) { milieu = [niveaux[(n - 1) / 2]]; cotes = [cote(milieu[0])]; }
    else {
      var x = niveaux[n / 2 - 1], y = niveaux[n / 2];
      milieu = x === y ? [x] : [x, y];
      cotes = [cote(x), cote(y)];
    }
    var commun = cotes.every(function (c) { return c === cotes[0]; }) ? cotes[0] : 0;
    return { comptes: comptes, ligne: commun > 0 ? 'adopte' : (commun < 0 ? 'rejete' : 'partage'), milieu: milieu };
  }

  /* ------------------------------------------------------------------ */
  /* « Déjà joué aujourd'hui » (§7.5 du premier essai)                    */
  /* ------------------------------------------------------------------ */

  function minutesR(m) { return (m - 1080 + 1440) % 1440; }
  /** Personnages affichés dans « Déjà joué aujourd'hui » le jour j, à l'heure lue (« HH:MM »). */
  function visagesDejaJoue(scelle, cal, j, heure) {
    var t = cal.texteRepondu(j);
    var r = minutesR(N.lireHeure(heure));
    return cal.membres.filter(function (p) {
      return p !== PORTEUR && t !== null && a(scelle.reponses[t], p) && minutesR(N.lireHeure(scelle.personnages[p].heure_de_jeu)) <= r;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Les jours de l'essai (partie 4.3 ; lot 3)                           */
  /* ------------------------------------------------------------------ */

  function copieJson(v) { return v === null || v === undefined ? null : JSON.parse(JSON.stringify(v)); }

  /** Les réponses du porteur lues dans un journal v4 : t -> {niveau, raison} ou null (jours atteints seulement). */
  function reponsesDuJournal(scelle, cal, journal) {
    var J = journal.jours, P = cal.premier, K = P - 1;
    while (a(J, String(K + 1))) { K++; }
    var entreeJ = K >= P ? J[String(P)].coups.entree : null;
    return function (t) {
      if (cal.textesEntree.indexOf(t) >= 0) { return entreeJ && entreeJ[t] && entreeJ[t].reponse ? entreeJ[t].reponse : null; }
      if (a(scelle.histoire.textes, t)) { return null; }
      var d = cal.jourDeReponse(t);
      if (d < P || d > K) { return null; }
      return J[String(d)].coups.reponse || null;
    };
  }

  /**
   * Tempéraments des personnages au jour d (§6, point 8 ; partie 4.3.8), pour un
   * journal quelconque : les décomptes et la liste, personnage par personnage.
   * C'est le calcul de `calculer` aux dimanches ; le carnet (carnet.js) s'en sert
   * pour un jour où `calculer` ne l'a pas fait. -> {personnage: {neutres, reponses,
   * seul_cote, seul_milieu, temperaments, textes_partages, tres}}
   */
  function temperamentsAu(scelle, cal, arrivee, journal, d) {
    var ctx = contexte(scelle, cal, reponsesDuJournal(scelle, cal, journal), arrivee);
    var r = {};
    ctx.personnages.forEach(function (p) { r[p] = calculerTemperaments(ctx, d, p); });
    return r;
  }

  /** Cartes servies au porteur le jour j : elles ne dépendent que du fichier (règle 7 du journal). */
  function cartesServies(scelle, cal, arrivee) {
    var ctx = contexte(scelle, cal, null, arrivee);
    var memo = {};
    return function (j) {
      if (!a(memo, j)) {
        if (!cal.existe(j) || !cal.ligne(j).deviner_porteur) { memo[j] = null; }
        else {
          var m = calculerManche(ctx, PORTEUR, j, function () { return null; }, null);
          var cachee = -1;
          m.cartes.forEach(function (c, i) { if (c.cachee) { cachee = i; } });
          memo[j] = { cachee: cachee, n: m.cartes.length };
        }
      }
      return memo[j];
    };
  }

  /**
   * calculer(scelle, cal, arrivee, journal) : tout ce que la trace de partie
   * (partie 4.3) tire du fichier, de l'état à l'arrivée et du journal, jours 1
   * à K, sans les durées. Fonction pure ; le journal n'est pas modifié.
   */
  function calculer(scelle, cal, arrivee, journal) {
    exiger(journal && journal.format === 'elenchos-essai-journal' && journal.version === 4, 'journal : format ou version');
    exiger(arrivee && arrivee.coupure === cal.premier - 1, 'état à l\'arrivée absent');
    var J = journal.jours;
    var P = cal.premier, K = P - 1;
    while (a(J, String(K + 1))) { K++; }
    exiger(K >= P && K <= cal.dernier, 'journal : jours atteints');
    var jour = function (j) { return J[String(j)]; };
    var entreeJ = jour(P).coups.entree;
    var reponsePorteur = reponsesDuJournal(scelle, cal, journal);
    var ctx = contexte(scelle, cal, reponsePorteur, arrivee);

    var manches = {}, revelations = {}, cartesPorteur = {};
    manches[P - 1] = arrivee.manche_jour_0.manches;
    function mancheDe(d, g) { return manches[d] && manches[d][g] ? manches[d][g] : null; }

    for (var j = P; j <= K; j++) {
      manches[j] = {};
      if (cal.ligne(j).manche !== null) {
        ctx.personnages.forEach(function (g) {
          if (ctx.estMembre(g, j) && ctx.present(g, j)) { manches[j][g] = calculerManche(ctx, g, j, mancheDe, null); }
        });
        if (cal.ligne(j).deviner_porteur) {
          var dv = jour(j).coups.deviner;
          var mp = calculerManche(ctx, PORTEUR, j, mancheDe, dv ? dv.cartes : null);
          cartesPorteur[j] = mp;
          if (dv) { manches[j][PORTEUR] = mp; } // R10 : une manche jamais ouverte n'a pas de cartes
        } else {
          exiger(jour(j).coups.deviner === null, 'jour ' + j + ' : Deviner hors des jours où il s\'ouvre');
        }
      }
      if (cal.texteRepondu(j - 2) !== null) {
        var rv = calculerRevelation(ctx, j, manches[j - 1], revelations);
        revelations[j] = { avis_cercle: avisCercle(ctx, rv.texte), devineurs: rv.devineurs, pas_de_cote: rv.pas_de_cote, texte: rv.texte };
      } else { revelations[j] = null; }
    }

    // Titres des semaines de l'essai dont le dimanche est atteint.
    var semainesEssai = cal.semainesEssai.map(function (n) { return cal.semaine(n); }).filter(function (w) { return w.dernier_jour <= K; });
    var titresEssai = semainesEssai.map(function (w) { return calculerTitres(ctx, w.numero, revelations, manches); });
    var dimanches = {}, tempsParJour = {};
    semainesEssai.forEach(function (w, i) {
      var d = w.dernier_jour;
      var prec = i === 0 ? P - 1 : semainesEssai[i - 1].dernier_jour - 1;
      var temps = {};
      ctx.personnages.forEach(function (p) { temps[p] = calculerTemperaments(ctx, d, p); });
      tempsParJour[d] = temps;
      var x = titresEssai[i];
      dimanches[d] = { devin: x.devin, fidele: x.fidele, mystere: x.mystere, phrase_semaine: phraseSemaine(ctx, w.numero, d, prec),
        sans_faute: x.sans_faute, semaine: x.semaine, surprise: x.surprise, temperaments: temps };
    });
    var tousTitres = arrivee.titres.concat(titresEssai);

    function aUnTitulaire(x) { return x.sans_faute.length > 0 || x.devin.titulaire !== null || x.mystere.titulaire !== null || x.fidele.titulaires.length > 0; }

    var barrePleine = false;
    var ouverturePrec = null;
    var jours = {};
    for (var d = P; d <= K; d++) {
      var l = cal.ligne(d), c = jour(d).coups;
      var joue = cal.estJoue(d);
      var R = {};

      // Entrée (jour d'arrivée) : présente dès que 1.2 a été affiché ; en mode moteur, toujours.
      R.entree = null;
      if (cal.estArrivee(d) && (jour(d).etapes === null || jour(d).etapes.entree === true)) {
        var textes = {}, justes = 0;
        cal.textesEntree.forEach(function (E) {
          var inv = scelle.reponses[E][cal.invitant];
          var pari = entreeJ && entreeJ[E] ? entreeJ[E].pari : null;
          var juste = pari === null || pari === undefined ? null : cote(pari) === cote(inv.niveau);
          if (juste === true) { justes++; }
          textes[E] = { invitant: { niveau: inv.niveau, raison: inv.raison }, juste: juste };
        });
        R.entree = { justes: justes, textes: textes };
      }

      R.manches = l.manche !== null ? manches[d] : null;
      R.revelation = revelations[d];

      // Message de 18h (E1, §0) : jours joués sauf l'arrivée, et points de saut.
      R.message = null;
      if ((joue && !cal.estArrivee(d)) || cal.estPointDeSaut(d)) {
        var mv = mancheDe(d - 1, PORTEUR);
        var forme = mv && mv.cartes.length >= 1 ? 'cartes' : (reponsePorteur(cal.texteRepondu(d - 2)) ? 'vote' : 'question');
        R.message = { forme: forme, titres: cal.estDimanche(d) && !!dimanches[d] && aUnTitulaire(dimanches[d]) };
      }

      // Phrase du jour : chaque jour où le porteur a répondu, rattrapage compris.
      R.phrase_jour = null;
      if (c.reponse) {
        var tj = l.repondu, cl = classer(ctx.texte(tj), c.reponse);
        R.phrase_jour = { classe: cl.classe, phrase: phraseDuJour(ctx.texte(tj).tension, cl), pole: cl.w.estZero() ? null : cl.pole, texte: tj, w: cl.w };
      }

      R.attente = jour(d).attente ? { lectures: jour(d).attente.lectures.map(function (x) { return { heure: x.heure, visages: visagesDejaJoue(scelle, cal, d, x.heure) }; }) } : null;
      R.dimanche = dimanches[d] || null;

      // Portrait du porteur et barre (§5.8, §5.9 ; partie 4.3.6).
      var sp = ctx.sommesJusqua(PORTEUR, d);
      var tensions = {};
      TENSIONS.forEach(function (t) { tensions[t] = curseur(sp[t]); });
      var n = cal.textesEntree.filter(function (E) { return reponsePorteur(E) !== null; }).length;
      for (var x = P; x <= d; x++) { if (jour(x).coups.reponse) { n++; } }
      barrePleine = barrePleine || n >= scelle.reglage.barre || TENSIONS.some(function (t) { return tensions[t].net; });
      R.portrait = { barre: { longueur: barrePleine ? F(1) : F(n, scelle.reglage.barre), n: n, pleine: barrePleine }, ordre_moi: ordreMoi(tensions), tensions: tensions };

      // Curseurs vus : entrée et textes répondus jusqu'au jour j − 2, poids normaux.
      R.curseurs_vus = {};
      ctx.personnages.forEach(function (p) {
        var s = ctx.sommesJusqua(p, d - 2);
        R.curseurs_vus[p] = {};
        TENSIONS.forEach(function (t) { R.curseurs_vus[p][t] = curseur(s[t]); });
      });

      // Le Cercle affiché : la dernière semaine tombée, les tempéraments du dernier calcul.
      var sem = tousTitres.filter(function (w) { return cal.semaine(w.semaine).dernier_jour <= d; }).pop();
      var titresCercle = {};
      ctx.membres.forEach(function (m) {
        var lt = [];
        if (sem.sans_faute.indexOf(m) >= 0) { lt.push('sans_faute'); }
        if (sem.devin.titulaire === m) { lt.push('devin'); }
        if (sem.mystere.titulaire === m) { lt.push('mystere'); }
        if (sem.fidele.titulaires.indexOf(m) >= 0) { lt.push('fidele'); }
        titresCercle[m] = lt;
      });
      var dTemp = Object.keys(tempsParJour).map(Number).filter(function (y) { return y <= d; }).pop();
      var temps = dTemp === undefined ? arrivee.temperaments : tempsParJour[dTemp];
      var tempsCercle = {};
      ctx.personnages.forEach(function (p) { tempsCercle[p] = temps[p].temperaments.slice(); });
      R.cercle = { surprise: sem.surprise.texte, temperaments: tempsCercle, titres: titresCercle };

      // « Ses surprises » : cartes révélées de ce proche attribuées à un membre dont la réponse différait.
      R.surprises_proches = {};
      ctx.personnages.forEach(function (p) { R.surprises_proches[p] = []; });
      for (var y = d; y >= P; y--) {
        var mr = mancheDe(y - 1, PORTEUR);
        if (!mr || !revelations[y]) { continue; }
        var jus = revelations[y].devineurs[PORTEUR].justes;
        mr.cartes.forEach(function (cc, i) {
          if (a(R.surprises_proches, cc.auteur_compte) && !estPasse(cc.designe) && !jus[i]) { R.surprises_proches[cc.auteur_compte].push(mr.texte); }
        });
      }

      // Mesures sans les durées (partie 4.3.10) : jours joués, points de saut, clôture, s'ils ont été ouverts
      // (un jour de reprise atteint sans ouverture, règle 4, n'a pas de séance : pas de mesures).
      R.mesures = null;
      if (cal.aUneOuverture(d) && jour(d).ouverture !== null) {
        var o = jour(d).ouverture;
        var mrv = mancheDe(d - 1, PORTEUR);
        var rvp = revelations[d] && revelations[d].devineurs[PORTEUR] ? revelations[d].devineurs[PORTEUR] : null;
        var cach = mrv ? mrv.cartes.filter(function (cc) { return cc.cachee; })[0] : null;
        R.mesures = {
          abandon: joue ? c.abandon : null,
          compte: cal.estArrivee(d) ? c.compte : null,
          duree_deviner: null, duree_entree: null, duree_repondre: null, duree_seance: null,
          entree_verdicts: R.entree ? cal.textesEntree.filter(function (E) { return R.entree.textes[E].juste !== null; })
            .map(function (E) { return R.entree.textes[E].juste ? 'juste' : 'faux'; }) : null,
          jours_ecoules: o !== null && ouverturePrec !== null ? N.joursEcoules(ouverturePrec, o) : null,
          ouvert: copieJson(c.ouvert),
          passer: c.deviner ? c.deviner.cartes.filter(function (cc) { return cc.designe === 'passe'; }).length : 0,
          pendant_deviner: copieJson(c.pendant_deviner),
          relire: c.relire,
          revelation_raison_tentee: cach ? cach.raison_devinee !== null : null,
          revelation_rouverte: joue && l.revelation_porteur === 'lue' ? c.rouvrir : null,
          revelation_verdicts: rvp ? rvp.verdicts.slice() : null
        };
      }
      if (jour(d).ouverture !== null) { ouverturePrec = jour(d).ouverture; }

      // Pour les écrans : cartes à servir, libellé du compte à rebours (§7.6).
      R.cartes_porteur = cartesPorteur[d] || null;
      R.compte_a_rebours = null;
      if (joue) {
        var mj = mancheDe(d, PORTEUR);
        R.compte_a_rebours = (mj && mj.cartes.length >= 1) || (cal.texteRepondu(d - 1) !== null && reponsePorteur(cal.texteRepondu(d - 1))) ? 'revelation' : 'nouveau_texte';
      }
      jours[String(d)] = R;
    }

    var sauts = journal.sauts.map(function (s) {
      return { coups: copieJson(s.coups), depart: s.depart,
        mesures: { duree_page: null, duree_saut: null, durees_textes: null, ouvert: copieJson(s.coups.ouvert) },
        numero: s.numero, textes_atteints: s.textes_atteints };
    });

    return { K: K, agregats: agregats(ctx, revelations, manches, titresEssai, K), jours: jours, sauts: sauts, titres: tousTitres };
  }

  /** « Sur tout l'essai » (§8.4 ; S1, partie 3.10) : manches jouées depuis l'arrivée et déjà révélées. */
  function agregats(ctx, revelations, manches, titresEssai, K) {
    var cal = ctx.cal, P = cal.premier;
    var revelesRepondus = 0;
    for (var j = P; j <= K; j++) {
      if (revelations[j] && a(ctx.scelle.textes, revelations[j].texte) && ctx.reponse(PORTEUR, revelations[j].texte)) { revelesRepondus++; }
    }
    if (revelesRepondus < 5) { return { justesse_personnages_entre_eux: null, justesse_personnages_sur_porteur: null, titres_tires_au_sort: null }; }
    var entre = { justes: 0, total: 0 }, sur = { justes: 0, total: 0 };
    for (var d = P + 1; d <= K; d++) {
      if (!revelations[d]) { continue; }
      Object.keys(revelations[d].devineurs).forEach(function (g) {
        if (g === PORTEUR) { return; }
        var m = manches[d - 1][g];
        m.cartes.forEach(function (c, i) {
          var cible = c.auteur_compte === PORTEUR ? sur : entre;
          cible.total += 1;
          if (revelations[d].devineurs[g].justes[i]) { cible.justes += 1; }
        });
      });
    }
    var tirages = 0;
    titresEssai.forEach(function (w) { [w.devin, w.mystere, w.surprise].forEach(function (x) { if (x.departage === 'tirage') { tirages++; } }); });
    return { justesse_personnages_entre_eux: entre.total ? entre : null, justesse_personnages_sur_porteur: sur.total ? sur : null, titres_tires_au_sort: tirages };
  }

  return {
    ErreurMoteur: ErreurMoteur,
    PORTEUR: PORTEUR, TENSIONS: TENSIONS, ORDRE_TEMPERAMENTS: ORDRE_TEMPERAMENTS,
    histoire: histoire, resume: resume, calculer: calculer, cartesServies: cartesServies, visagesDejaJoue: visagesDejaJoue,
    temperamentsAu: temperamentsAu, reponsesDuJournal: reponsesDuJournal,
    regles: {
      contexte: contexte, cote: cote, valeur: valeur, identiques: identiques, classer: classer,
      sommesVides: sommesVides, ajouter: ajouter, curseur: curseur, mediane: mediane,
      coteAttendu: coteAttendu, score: score, raisonDevinee: raisonDevinee,
      calculerManche: calculerManche, redistribuer: redistribuer, estJuste: estJuste,
      pasDeCote: pasDeCote, calculerRevelation: calculerRevelation, calculerTitres: calculerTitres,
      calculerTemperaments: calculerTemperaments, TEMP: TEMP,
      phraseDuJour: phraseDuJour, phraseSemaine: phraseSemaine, ordreMoi: ordreMoi, avisCercle: avisCercle, agregats: agregats
    }
  };
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosMoteur; }
/*node-fin*/
