/* Moteur de la page de l'essai (outillage d'essai, D-001 tenu).
 *
 * Fonctions pures : elles reçoivent le fichier scellé (objet lu), le
 * journal des entrées (schema.md, partie 3.12 : coups, ouvertures,
 * versions, écrans affichés, heures lues pour « En attendant ») et, pour
 * le carnet, les durées mesurées par l'interface. Elles n'accèdent ni à
 * l'écran, ni au stockage, ni à l'horloge, ni au hasard (simulation.md, §9).
 *
 *   calculer(scelle, journal)          -> toutes les grandeurs de la partie 3
 *                                         du schéma, séance par séance
 *   copie(scelle, journal, c, D, dc)   -> copie du carnet en cours d'essai
 *   carnet(scelle, journal, resultats, durees, statut) -> texte du §8.12
 *   validerJournal(scelle, journal)    -> liste des écarts aux règles de
 *                                         validité (partie 3.12)
 *
 * Renvois : « §n » = simulation.md ; « règles §n » = regles-de-calcul.md ;
 * « partie n » = schema.md.
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { var ElenchosNoyau = require('./noyau.js'); }
/*node-fin*/

var ElenchosMoteur = (function (N) {
  var F = N.Fraction;

  var PERSONNAGES = ['Agathe', 'Nassim', 'Odile', 'Valentin'];
  var MEMBRES = PERSONNAGES.concat(['porteur']);
  var TENSIONS = ['S', 'P', 'T', 'L'];
  var ENTREE = ['E1', 'E2', 'E3'];
  var TEXTES = ENTREE.concat(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']);

  var C95 = F('0.95'), C07 = F('0.07'), C25 = F('0.25'), C70 = F('0.70'), DEUX_CINQ = F(2, 5), TROIS_CINQ = F(3, 5);
  var DEMI = F(1, 2);

  function ErreurMoteur(message) {
    var e = new Error(message);
    e.name = 'ErreurMoteur';
    return e;
  }
  function exiger(cond, message) { if (!cond) { throw ErreurMoteur(message); } }

  function rangMembre(m) { return MEMBRES.indexOf(m); }
  function trierMembres(liste) { return liste.slice().sort(function (a, b) { return rangMembre(a) - rangMembre(b); }); }
  function estPersonnage(x) { return PERSONNAGES.indexOf(x) >= 0; }

  /* ------------------------------------------------------------------ */
  /* Positions, côtés, classement d'une réponse (§0, §5.1)               */
  /* ------------------------------------------------------------------ */

  /** Côté d'un niveau : -1 défavorable, 0 neutre, 1 favorable. */
  function cote(niveau) { return niveau <= 2 ? -1 : (niveau === 3 ? 0 : 1); }
  /** Valeur v d'une position (§0). */
  function valeur(niveau) { return F(niveau - 1, 4); }

  /** §5.1 : classe, poids w et pôle π d'une réponse sur un texte. */
  function classer(texte, rep) {
    var c = cote(rep.niveau);
    if (c === 0) { return { classe: 'neutre', w: F(0), pole: null }; }
    var pi = c > 0 ? texte.sens : 1 - texte.sens;
    var rho = rep.raison === 'aucune' ? 'aucun' : texte.considerations[rep.raison - 1].pole;
    if (rho === 'aucun') { return { classe: 'penchant', w: F(1, 2), pole: pi }; }
    if (rho === pi) { return { classe: 'arbitrage', w: F(1), pole: pi }; }
    return { classe: 'tiraille', w: F(0), pole: null };
  }

  /** §5.2 : curseur sur une liste de {texte, rep} d'une même tension. */
  function curseur(reponses) {
    var sw = F(0), swp = F(0);
    for (var i = 0; i < reponses.length; i++) {
      var k = classer(reponses[i].texte, reponses[i].rep);
      sw = sw.plus(k.w);
      if (k.pole === 1) { swp = swp.plus(k.w); }
    }
    var c = F(2).plus(swp).divise(F(4).plus(sw));
    var l = F.max(C95.moins(C07.fois(sw)), C25);
    return { somme_w: sw, c: c, l: l, net: sw.supEgal(10) };
  }

  /* ------------------------------------------------------------------ */
  /* Contexte : fichier scellé et journal                                */
  /* ------------------------------------------------------------------ */

  function contexte(scelle, journal) {
    exiger(scelle && scelle.format === 'elenchos-essai-scelle' && scelle.version === 4, 'fichier scellé : format ou version inattendus');
    var tir = N.creerTirage(scelle.graine);
    var S = journal.seances;
    exiger(Array.isArray(S) && S.length >= 1 && S.length <= 16, 'journal : séances absentes');
    var K = S.length - 1;

    function texte(n) { return scelle.textes[n]; }

    /** Réponse d'un membre à un texte, ou null. */
    function reponse(membre, n) {
      if (membre !== 'porteur') {
        var r = scelle.reponses[n][membre];
        return r ? r : null;
      }
      if (ENTREE.indexOf(n) >= 0) {
        var e = S[0].coups.entree;
        return e && e[n] && e[n].reponse ? e[n].reponse : null;
      }
      var k = +n;
      return k <= K && S[k].coups.reponse ? S[k].coups.reponse : null;
    }

    /** Réponses d'un membre, sur une tension : entrée et textes 1..jusqua. */
    function reponsesSur(membre, tension, jusqua) {
      var liste = [];
      var noms = ENTREE.slice();
      for (var n = 1; n <= jusqua; n++) { noms.push(String(n)); }
      for (var i = 0; i < noms.length; i++) {
        var t = texte(noms[i]);
        if (t.tension !== tension) { continue; }
        var r = reponse(membre, noms[i]);
        if (r) { liste.push({ texte: t, rep: r, n: noms[i] }); }
      }
      return liste;
    }

    return { scelle: scelle, journal: journal, S: S, K: K, tir: tir, texte: texte, reponse: reponse, reponsesSur: reponsesSur };
  }

  /* ------------------------------------------------------------------ */
  /* Une manche de Deviner (règles §3 et §4, partie 3.6)                 */
  /* ------------------------------------------------------------------ */

  function identiques(a, b) { return a.niveau === b.niveau && a.raison === b.raison; }

  function mediane(valeurs) {
    var v = valeurs.slice().sort(function (a, b) { return a.cmp(b); });
    var n = v.length;
    if (n % 2 === 1) { return v[(n - 1) / 2]; }
    return v[n / 2 - 1].plus(v[n / 2]).divise(2);
  }

  /** Côté attendu, aligné sur le sens du texte, d'une valeur a (règles §3.2). */
  function coteAttendu(a, stricts) {
    if (stricts) { return a.sup(TROIS_CINQ) ? 1 : (a.inf(DEUX_CINQ) ? -1 : 0); }
    return a.supEgal(TROIS_CINQ) ? 1 : (a.infEgal(DEUX_CINQ) ? -1 : 0);
  }

  /** Score d'une carte de côté sigma pour un candidat de côté attendu e (règles §3.3). */
  function score(sigma, e) {
    if (e !== 'inconnu' && sigma === e) { return 2; }
    if (sigma === 0 || e === 0 || e === 'inconnu') { return 1; }
    return 0;
  }

  /** Raison devinée sur la carte à raison cachée (règles §3.5). */
  function raisonDevinee(texte, sigma, e) {
    var liste = [];
    for (var i = 0; i < 4; i++) {
      var cons = texte.considerations[i];
      if (sigma === 0 || (sigma > 0 && cons.cote === 'pour') || (sigma < 0 && cons.cote === 'contre')) { liste.push(cons); }
    }
    if (liste.length === 0) { return 'aucune'; }
    if (e === 1 || e === -1) {
      var vise = e === 1 ? texte.sens : 1 - texte.sens;
      for (var j = 0; j < liste.length; j++) { if (liste[j].pole === vise) { return liste[j].rang; } }
    }
    for (var k = 0; k < liste.length; k++) { if (liste[k].pole === 'aucun') { return liste[k].rang; } }
    return liste[0].rang;
  }

  /**
   * Manche du devineur g à la séance k (2 à 14), sur le texte k-1.
   * mancheDe(j, g) rend la manche déjà calculée de g à la séance j < k.
   */
  function calculerManche(ctx, g, k, mancheDe) {
    var tir = ctx.tir;
    var n = String(k - 1);
    var tx = ctx.texte(n);
    var auteurs = MEMBRES.filter(function (m) { return m !== g && ctx.reponse(m, n) !== null; });

    // §4.2 : grandeurs de surprise
    var possibles = {};
    var xs = [];
    auteurs.forEach(function (a) {
      var rep = ctx.reponse(a, n);
      var v = valeur(rep.niveau);
      var x = tx.sens === 1 ? v : F(1).moins(v);
      var cur = curseur(ctx.reponsesSur(a, tx.tension, k - 2));
      var q = C95.moins(cur.l).divise(C70);
      var distance = x.moins(cur.c).abs();
      possibles[a] = { niveau: rep.niveau, raison: rep.raison, somme_w: cur.somme_w, x: x, c: cur.c, l: cur.l, q: q, distance: distance };
      xs.push(x);
    });
    var med = auteurs.length ? mediane(xs) : null;
    auteurs.forEach(function (a) {
      var p = possibles[a];
      p.rarete = p.x.moins(med).abs();
      p.surprise = p.q.fois(p.distance).plus(F(1).moins(p.q).fois(p.rarete));
    });

    // §4.3, étape 1 : classement
    var classement = auteurs.slice().sort(function (a, b) {
      var c = possibles[b].surprise.cmp(possibles[a].surprise);
      if (c !== 0) { return c; }
      return tir.comparer(tir.t('surprise|' + g + '|' + k + '|' + a), tir.t('surprise|' + g + '|' + k + '|' + b));
    });
    var departages = 0;
    for (var i = 0; i < classement.length;) {
      var j = i + 1;
      while (j < classement.length && possibles[classement[j]].surprise.egal(possibles[classement[i]].surprise)) { j++; }
      if (j - i >= 2) { departages++; }
      i = j;
    }

    // étape 2 : places
    var places = classement.slice(0, 2);
    if (classement.length >= 3) { places.push(tir.plusPetit(classement.slice(2), 'hasard|' + g + '|' + k + '|')); }

    // étape 3 : cartes identiques remplacées
    var remplacements = [];
    function rep(a) { return possibles[a]; }
    for (;;) {
      var avecJumelle = places.filter(function (p) {
        return places.some(function (o) { return o !== p && identiques(rep(o), rep(p)); });
      });
      if (avecJumelle.length === 0) { break; }
      var eligibles = classement.filter(function (r) {
        return places.indexOf(r) < 0 && places.every(function (p) { return !identiques(rep(r), rep(p)); });
      });
      if (eligibles.length === 0) { break; }
      var ecartee = avecJumelle.reduce(function (pire, p) { return classement.indexOf(p) > classement.indexOf(pire) ? p : pire; });
      var place = places.indexOf(ecartee);
      places[place] = eligibles[0];
      remplacements.push({ place: place + 1, ecartee: ecartee, remplacante: eligibles[0] });
    }

    // §4.4 : carte à raison cachée
    var cachee = null;
    if (places.length) {
      cachee = places[places.length - 1];
      if (rep(cachee).raison === 'aucune') {
        var avecRaison = places.filter(function (p) { return rep(p).raison !== 'aucune'; });
        if (avecRaison.length) {
          cachee = avecRaison.reduce(function (pire, p) { return classement.indexOf(p) > classement.indexOf(pire) ? p : pire; });
        }
      }
    }

    // §4.5 : ordre d'affichage
    var ordre = tir.melanger(places, 'ordre|' + g + '|' + k + '|');
    var cartes = ordre.map(function (a) {
      return { auteur: a, auteur_compte: a, cachee: a === cachee, designe: null, raison_devinee: null };
    });

    var resultat = {
      texte: n, possibles: possibles, mediane: med, classement: classement, departages: departages,
      remplacements: remplacements, places: places.slice(), raison_cachee: cachee, ordre: ordre, cartes: cartes,
      rangs: null, cotes_attendus: null, curseur_porteur: null, total: null
    };

    if (g === 'porteur') {
      // coups.deviner vaut null tant que la page n'a pas encore montré la manche
      // (elle demande alors au moteur les cartes à servir) ; sinon, une entrée par carte.
      var dev = ctx.S[k].coups.deviner;
      exiger(dev === null || (Array.isArray(dev) && dev.length === cartes.length),
        'séance ' + k + ' : coups.deviner doit avoir ' + cartes.length + ' élément(s)');
      if (dev) { cartes.forEach(function (c, i) { c.designe = dev[i].designe; c.raison_devinee = dev[i].raison; }); }
    } else {
      devinerPersonnage(ctx, g, k, tx, resultat, mancheDe);
    }
    redistribuer(resultat.cartes, possibles);
    return resultat;
  }

  /** Règles §3 : rangs, côtés attendus, affectation, raison devinée. */
  function devinerPersonnage(ctx, g, k, tx, res, mancheDe) {
    var tir = ctx.tir;
    var candidats = MEMBRES.filter(function (m) { return m !== g; });
    var melange = tir.melanger(candidats, 'devine|' + g + '|' + k + '|');
    var rangs = {};
    melange.forEach(function (c, i) { rangs[c] = i + 1; });

    // côté attendu de chaque candidat (règles §3.2)
    var cotes = {};
    var curPorteur = null;
    candidats.forEach(function (x) {
      if (x !== 'porteur') {
        var p = F(ctx.scelle.personnages[x].profil[tx.tension].position, 100);
        cotes[x] = coteAttendu(tx.sens === 1 ? p : F(1).moins(p), false);
        return;
      }
      var vues = [];
      for (var j = 1; j <= k - 2; j++) {
        var nj = String(j);
        var tj = ctx.texte(nj);
        if (tj.tension !== tx.tension) { continue; }
        var m = mancheDe(j + 1, g);
        if (m && m.places.indexOf('porteur') >= 0) { vues.push({ texte: tj, rep: ctx.reponse('porteur', nj) }); }
      }
      var cur = curseur(vues);
      curPorteur = { somme_w: cur.somme_w, c: cur.c };
      if (cur.somme_w.estZero()) { cotes[x] = 'inconnu'; return; }
      cotes[x] = coteAttendu(tx.sens === 1 ? cur.c : F(1).moins(cur.c), ctx.scelle.reglage.seuils_stricts === true);
    });

    // affectation de total maximal, la plus petite dans l'ordre lexicographique des rangs (règles §3.4)
    var cartes = res.cartes;
    var parRang = {};
    candidats.forEach(function (c) { parRang[rangs[c]] = c; });
    var meilleur = null, meilleurTotal = -1;
    var suite = [];
    (function explorer(i, total) {
      if (i === cartes.length) {
        if (total > meilleurTotal) { meilleurTotal = total; meilleur = suite.slice(); }
        return;
      }
      for (var r = 1; r <= 4; r++) {
        if (suite.indexOf(r) >= 0) { continue; }
        var cand = parRang[r];
        suite.push(r);
        explorer(i + 1, total + score(cote(res.possibles[cartes[i].auteur].niveau), cotes[cand]));
        suite.pop();
      }
    })(0, 0);
    cartes.forEach(function (c, i) { c.designe = parRang[meilleur[i]]; });
    cartes.forEach(function (c) {
      if (c.cachee) { c.raison_devinee = raisonDevinee(tx, cote(res.possibles[c.auteur].niveau), cotes[c.designe]); }
    });
    res.rangs = rangs;
    res.cotes_attendus = cotes;
    res.curseur_porteur = curPorteur;
    res.total = cartes.length ? meilleurTotal : 0;
  }

  /** Règles §4.3, étape 4 : auteurs redistribués entre cartes identiques. */
  function redistribuer(cartes, possibles) {
    var vus = [];
    cartes.forEach(function (c, i) {
      if (vus.indexOf(i) >= 0) { return; }
      var groupe = [];
      cartes.forEach(function (d, j) { if (identiques(possibles[c.auteur], possibles[d.auteur])) { groupe.push(j); } });
      groupe.forEach(function (j) { vus.push(j); });
      if (groupe.length < 2) { return; }
      var auteurs = groupe.map(function (j) { return cartes[j].auteur; });
      var pris = [], libres = [];
      groupe.forEach(function (j) {
        var d = cartes[j].designe;
        if (d !== null && d !== 'passe' && auteurs.indexOf(d) >= 0) { cartes[j].auteur_compte = d; pris.push(d); }
        else { libres.push(j); }
      });
      var restants = trierMembres(auteurs.filter(function (a) { return pris.indexOf(a) < 0; }));
      libres.forEach(function (j, i) { cartes[j].auteur_compte = restants[i]; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Révélation (partie 3.7)                                             */
  /* ------------------------------------------------------------------ */

  function semaineDeRevelation(k) { return k >= 3 && k <= 7 ? 1 : (k >= 8 && k <= 14 ? 2 : null); }

  function estPasse(designe) { return designe === 'passe' || designe === null; }

  function calculerRevelation(ctx, k, manchesVeille, revelations) {
    var devineurs = {};
    Object.keys(manchesVeille).forEach(function (g) {
      var m = manchesVeille[g];
      var justes = m.cartes.map(function (c) { return c.designe === c.auteur_compte; });
      var trouvee = null;
      var verdicts = [];
      m.cartes.forEach(function (c, i) {
        var raisonJuste = c.cachee && justes[i] && c.raison_devinee !== null && c.raison_devinee === m.possibles[c.auteur].raison;
        if (c.cachee) { trouvee = !!raisonJuste; }
        verdicts.push(estPasse(c.designe) ? 'passe' : (justes[i] ? (raisonJuste ? 'juste_et_raison' : 'juste') : 'faux'));
      });
      var points = justes.filter(Boolean).length;
      var sem = semaineDeRevelation(k);
      var ps = null;
      if (sem !== null) {
        ps = points;
        for (var j = (sem === 1 ? 3 : 8); j < k; j++) {
          if (revelations[j] && revelations[j].devineurs[g]) { ps += revelations[j].devineurs[g].points; }
        }
      }
      devineurs[g] = { justes: justes, raison_trouvee: m.cartes.length ? trouvee : null, points: points,
        points_semaine: ps, verdicts: g === 'porteur' ? verdicts : null };
    });
    return { texte: String(k - 2), devineurs: devineurs };
  }

  /* ------------------------------------------------------------------ */
  /* Phrases du jour et de la semaine (§5.5 à §5.7)                      */
  /* ------------------------------------------------------------------ */

  var POLES = {
    S: ['la sécurité', 'la liberté'], P: ['la précaution', "l'innovation"],
    T: ['la tradition', 'le changement'], L: ['la décision locale', 'la décision nationale']
  };
  var ENTRE = { S: 'sécurité et liberté', P: 'précaution et innovation', T: 'tradition et changement', L: 'local et national' };

  function aPole(p) { return p.indexOf('le ') === 0 ? 'au ' + p.slice(3) : 'à ' + p; }

  function phraseDuJour(tension, cl) {
    var p = POLES[tension];
    var s;
    if (cl.classe === 'arbitrage') { s = "Aujourd'hui, tu as fait passer " + p[cl.pole] + ' avant ' + p[1 - cl.pole] + '.'; }
    else if (cl.classe === 'penchant') { s = "Aujourd'hui, tu as penché vers " + p[cl.pole] + '.'; }
    else if (cl.classe === 'tiraille') { s = "Aujourd'hui, tu as donné du poids " + aPole(p[0]) + ' comme ' + aPole(p[1]) + '.'; }
    else { s = "Aujourd'hui, tu n'as penché ni vers " + p[0] + ' ni vers ' + p[1] + '.'; }
    return N.typographier(s);
  }

  function portraitDe(ctx, jusqua) {
    var tensions = {};
    TENSIONS.forEach(function (t) { tensions[t] = curseur(ctx.reponsesSur('porteur', t, jusqua)); });
    var nets = TENSIONS.filter(function (t) { return tensions[t].net; });
    var flous = TENSIONS.filter(function (t) { return !tensions[t].net; }).sort(function (a, b) {
      var c = tensions[a].l.cmp(tensions[b].l);
      return c !== 0 ? c : TENSIONS.indexOf(a) - TENSIONS.indexOf(b);
    });
    return { tensions: tensions, ordre_moi: nets.concat(flous) };
  }

  function phraseSemaine(ctx, semaine, k) {
    var premiers = semaine === 1 ? [1, 6] : [7, 13];
    var poids = {};
    TENSIONS.forEach(function (t) { poids[t] = { pole0: F(0), pole1: F(0), comptent: 0 }; });
    for (var n = premiers[0]; n <= premiers[1]; n++) {
      var r = ctx.reponse('porteur', String(n));
      if (!r) { continue; }
      var tx = ctx.texte(String(n));
      var cl = classer(tx, r);
      if (cl.w.estZero()) { continue; }
      var pt = poids[tx.tension];
      if (cl.pole === 0) { pt.pole0 = pt.pole0.plus(cl.w); } else { pt.pole1 = pt.pole1.plus(cl.w); }
      pt.comptent += 1;
    }
    // Curseur net impossible dans l'essai (§5.4, §5.7) : s'il se présentait, on s'arrête sans choisir de lecture.
    TENSIONS.forEach(function (t) { exiger(!curseur(ctx.reponsesSur('porteur', t, Math.min(k, 14))).net, 'phrase de la semaine : curseur net, impossible dans l\'essai (§5.4)'); });
    var tension = null, cas, phrase;
    var retenues = TENSIONS.filter(function (t) { return poids[t].comptent >= 2; });
    if (retenues.length === 0) {
      cas = 'floue';
      phrase = 'Cette semaine, ton portrait est encore flou. Chaque réponse le précise.';
    } else {
      tension = retenues.reduce(function (best, t) {
        var ecartT = poids[t].pole0.moins(poids[t].pole1).abs(), ecartB = poids[best].pole0.moins(poids[best].pole1).abs();
        var c = ecartT.cmp(ecartB);
        if (c !== 0) { return c > 0 ? t : best; }
        var totT = poids[t].pole0.plus(poids[t].pole1), totB = poids[best].pole0.plus(poids[best].pole1);
        return totT.sup(totB) ? t : best;
      });
      var pw = poids[tension];
      var diff = pw.pole0.cmp(pw.pole1);
      if (diff === 0) {
        cas = 'egalite';
        phrase = 'Cette semaine, entre ' + ENTRE[tension] + ", tu as penché autant d'un côté que de l'autre.";
      } else {
        cas = 'difference';
        phrase = 'Cette semaine, entre ' + ENTRE[tension] + ', tu as le plus souvent choisi ' + POLES[tension][diff > 0 ? 0 : 1] + '.';
      }
    }
    return { poids: poids, tension: tension, cas: cas, phrase: N.typographier(phrase) };
  }

  /* ------------------------------------------------------------------ */
  /* Le dimanche (§6, partie 3.9)                                        */
  /* ------------------------------------------------------------------ */

  function titulaireParTirage(ctx, cle, liste) { return ctx.tir.plusPetit(liste, cle); }

  function calculerDimanche(ctx, k, revelations, manches) {
    var semaine = k === 7 ? 1 : 2;
    var seances = [];
    for (var j = (semaine === 1 ? 3 : 8); j <= k; j++) { seances.push(j); }

    // Le Sans-Faute (semaine 2)
    var sansFaute = [];
    if (semaine === 2) {
      MEMBRES.forEach(function (m) {
        var ok = seances.every(function (j) {
          var mv = manches[j - 1] && manches[j - 1][m];
          return mv && mv.cartes.length >= 1 && mv.cartes.every(function (c) { return !estPasse(c.designe) && c.designe === c.auteur_compte; });
        });
        if (ok) { sansFaute.push(m); }
      });
    }

    // Le Pas de Côté : ne peut pas se déclencher (Σw ≤ 6 < 10 pour tout curseur de l'essai, règles §4.2).
    MEMBRES.forEach(function (m) {
      TENSIONS.forEach(function (t) {
        exiger(!curseur(ctx.reponsesSur(m, t, Math.min(k, 14))).net, 'Pas de Côté : curseur net, impossible dans l\'essai (§5.4)');
      });
    });

    // Le Devin
    var points = {}, raisons = {};
    MEMBRES.forEach(function (m) { points[m] = 0; raisons[m] = 0; });
    seances.forEach(function (j) {
      var dv = revelations[j].devineurs;
      Object.keys(dv).forEach(function (m) { points[m] += dv[m].points; if (dv[m].raison_trouvee === true) { raisons[m] += 1; } });
    });
    var devin = { titulaire: null, points: points, raisons: raisons, departage: 'aucun' };
    var maxP = Math.max.apply(null, MEMBRES.map(function (m) { return points[m]; }));
    if (maxP >= 1) {
      var tete = MEMBRES.filter(function (m) { return points[m] === maxP; });
      if (tete.length === 1) { devin.titulaire = tete[0]; }
      else {
        var maxR = Math.max.apply(null, tete.map(function (m) { return raisons[m]; }));
        var tete2 = tete.filter(function (m) { return raisons[m] === maxR; });
        if (tete2.length === 1) { devin.titulaire = tete2[0]; devin.departage = 'raisons'; }
        else { devin.titulaire = titulaireParTirage(ctx, 'devin|' + semaine + '|', tete2); devin.departage = 'tirage'; }
      }
    }

    // Le Mystère
    var tentatives = {}, erreurs = {};
    MEMBRES.forEach(function (m) { tentatives[m] = 0; erreurs[m] = 0; });
    seances.forEach(function (j) {
      var mv = manches[j - 1];
      Object.keys(mv).forEach(function (g) {
        mv[g].cartes.forEach(function (c) {
          if (estPasse(c.designe)) { return; }
          tentatives[c.auteur_compte] += 1;
          if (c.designe !== c.auteur_compte) { erreurs[c.auteur_compte] += 1; }
        });
      });
    });
    var mystere = { titulaire: null, tentatives: tentatives, erreurs: erreurs, departage: 'aucun' };
    var eligibles = MEMBRES.filter(function (m) { return tentatives[m] >= 6 && erreurs[m] >= 1; }); // §6, points 3 et 9
    if (eligibles.length) {
      var prop = function (m) { return F(erreurs[m], tentatives[m]); };
      var maxProp = eligibles.reduce(function (b, m) { return prop(m).sup(b) ? prop(m) : b; }, prop(eligibles[0]));
      var t1 = eligibles.filter(function (m) { return prop(m).egal(maxProp); });
      if (t1.length === 1) { mystere.titulaire = t1[0]; }
      else {
        var maxE = Math.max.apply(null, t1.map(function (m) { return erreurs[m]; }));
        var t2 = t1.filter(function (m) { return erreurs[m] === maxE; });
        if (t2.length === 1) { mystere.titulaire = t2[0]; mystere.departage = 'erreurs'; }
        else { mystere.titulaire = titulaireParTirage(ctx, 'mystere|' + semaine + '|', t2); mystere.departage = 'tirage'; }
      }
    }

    // Le Fidèle
    var bornes = semaine === 1 ? [1, 6] : [7, 13];
    var fideles = MEMBRES.filter(function (m) {
      for (var n = bornes[0]; n <= bornes[1]; n++) { if (!ctx.reponse(m, String(n))) { return false; } }
      return true;
    });

    // Surprise de la semaine
    var attributions = {}, errs = {};
    seances.forEach(function (j) {
      var n = String(j - 2);
      attributions[n] = 0; errs[n] = 0;
      var mv = manches[j - 1];
      Object.keys(mv).forEach(function (g) {
        mv[g].cartes.forEach(function (c) {
          if (estPasse(c.designe)) { return; }
          attributions[n] += 1;
          if (c.designe !== c.auteur_compte) { errs[n] += 1; }
        });
      });
    });
    var surprise = { texte: null, attributions: attributions, erreurs: errs, departage: 'aucun' };
    var textesElig = Object.keys(attributions).filter(function (n) { return attributions[n] >= 4 && errs[n] >= 1; }) // §6, points 5 et 9
      .sort(function (a, b) { return +a - +b; });
    if (textesElig.length) {
      var pr = function (n) { return F(errs[n], attributions[n]); };
      var mx = textesElig.reduce(function (b, n) { return pr(n).sup(b) ? pr(n) : b; }, pr(textesElig[0]));
      var s1 = textesElig.filter(function (n) { return pr(n).egal(mx); });
      if (s1.length === 1) { surprise.texte = s1[0]; }
      else {
        var me = Math.max.apply(null, s1.map(function (n) { return errs[n]; }));
        var s2 = s1.filter(function (n) { return errs[n] === me; });
        if (s2.length === 1) { surprise.texte = s2[0]; surprise.departage = 'erreurs'; }
        else { surprise.texte = titulaireParTirage(ctx, 'surprise-semaine|' + semaine + '|', s2); surprise.departage = 'tirage'; }
      }
    }

    return {
      semaine: semaine, sans_faute: sansFaute, pas_de_cote: [], devin: devin, mystere: mystere,
      fidele: { titulaires: fideles }, surprise: surprise, phrase_semaine: phraseSemaine(ctx, semaine, k)
    };
  }

  /* ------------------------------------------------------------------ */
  /* Calcul d'une partie                                                 */
  /* ------------------------------------------------------------------ */

  function minutesR(m) { return (m - 1080 + 1440) % 1440; }

  /** Personnages affichés dans « Déjà joué aujourd'hui » à la séance k (§7.5). */
  function visagesDejaJoue(scelle, k, heure) {
    var r = minutesR(N.lireHeure(heure));
    return PERSONNAGES.filter(function (p) {
      return !!scelle.reponses[String(k)][p] && minutesR(N.lireHeure(scelle.personnages[p].heure_de_jeu)) <= r;
    });
  }

  /** Compte à rebours de 2.5 (§7.5) : minutes jusqu'au prochain 18:00. */
  function minutesAvantDixHuit(heure) { return 1440 - minutesR(N.lireHeure(heure)); }

  /**
   * Toutes les grandeurs de la partie 3 du schéma, séance par séance, sauf
   * les durées (entrées de l'interface) et le carnet. Les fractions sont des
   * objets Fraction ; trace() les écrit « p/q ».
   */
  function calculer(scelle, journal) {
    var ctx = contexte(scelle, journal);
    var S = ctx.S, K = ctx.K;
    var manches = {};     // manches[k][g]
    var revelations = {}; // revelations[k]
    var dimanches = {};
    function mancheDe(j, g) { return manches[j] ? (manches[j][g] || null) : null; }

    for (var k = 2; k <= Math.min(K, 14); k++) {
      manches[k] = {};
      var devineurs = ['porteur'].concat(PERSONNAGES.filter(function (p) { return !!scelle.reponses[String(k)][p]; }));
      for (var i = 0; i < devineurs.length; i++) { manches[k][devineurs[i]] = calculerManche(ctx, devineurs[i], k, mancheDe); }
    }
    for (var kr = 3; kr <= Math.min(K, 15); kr++) { revelations[kr] = calculerRevelation(ctx, kr, manches[kr - 1], revelations); }
    [7, 14].forEach(function (kd) { if (kd <= K) { dimanches[kd] = calculerDimanche(ctx, kd, revelations, manches); } });

    var seances = S.map(function (s, k) {
      exiger(s.k === k, 'séance ' + k + ' : numéro inattendu');
      var res = { k: k, entree: null, revelation: revelations[k] || null, manches: manches[k] || null, phrase_jour: null,
        attente: null, dimanche: dimanches[k] || null };
      if (k === 0) {
        var textes = {}, justes = 0;
        ENTREE.forEach(function (e) {
          var inv = scelle.reponses[e][scelle.cercle.inviteuse];
          var ce = s.coups.entree && s.coups.entree[e] ? s.coups.entree[e] : { pari: null };
          var juste = ce.pari === null || ce.pari === undefined ? null : cote(ce.pari) === cote(inv.niveau);
          if (juste === true) { justes++; }
          textes[e] = { inviteuse: { niveau: inv.niveau, raison: inv.raison }, juste: juste };
        });
        res.entree = { textes: textes, justes: justes };
      }
      if (k >= 1 && k <= 14 && s.coups.reponse) {
        var cl = classer(ctx.texte(String(k)), s.coups.reponse);
        res.phrase_jour = { texte: String(k), classe: cl.classe, w: cl.w, pole: cl.w.estZero() ? null : cl.pole,
          phrase: phraseDuJour(ctx.texte(String(k)).tension, cl) };
      }
      if (s.attente) {
        exiger(k >= 1 && k <= 14, 'séance ' + k + ' : « En attendant » hors des séances 1 à 14');
        res.attente = { lectures: s.attente.lectures.map(function (l) { return { heure: l.heure, visages: visagesDejaJoue(scelle, k, l.heure) }; }) };
      }
      res.portrait = portraitDe(ctx, Math.min(k, 14));
      var vus = {};
      PERSONNAGES.forEach(function (p) {
        vus[p] = {};
        TENSIONS.forEach(function (t) {
          var c = curseur(ctx.reponsesSur(p, t, k - 2));
          vus[p][t] = { somme_w: c.somme_w, c: c.c, l: c.l };
        });
      });
      res.curseurs_vus = vus;
      var surprises = {};
      PERSONNAGES.forEach(function (p) {
        var liste = [];
        for (var n = Math.min(k - 2, 13); n >= 1; n--) {
          var mp = manches[n + 1] && manches[n + 1].porteur;
          if (!mp) { continue; }
          mp.cartes.forEach(function (c) {
            if (c.auteur_compte === p && !estPasse(c.designe) && c.designe !== p) { liste.push(String(n)); }
          });
        }
        surprises[p] = liste;
      });
      res.surprises_proches = surprises;
      res.mesures = mesuresSansDurees(s, k, revelations[k] || null, S[k - 1] || null,
        revelations[k] ? manches[k - 1].porteur : null);
      return res;
    });

    return { seances: seances, agregats: agregats(ctx, revelations, manches, dimanches), revelations: revelations,
      manches: manches, dimanches: dimanches };
  }

  /** Mesures de la séance k (partie 3.10), durées laissées nulles :
   *  l'interface les mesure, trace() les place. mancheRevelee : la manche
   *  du porteur révélée à cette séance (jouée à la séance k-1). */
  function mesuresSansDurees(s, k, revelation, precedente, mancheRevelee) {
    var dev = s.coups.deviner;
    var mesure = {
      // une séance affichée mais pas encore touchée n'a pas d'ouverture (page en cours de jeu)
      jours_ecoules: precedente && precedente.ouverture && s.ouverture ? N.joursEcoules(precedente.ouverture, s.ouverture) : null,
      duree_seance: null, duree_deviner: null, duree_repondre: null,
      relire: s.coups.relire,
      passer: Array.isArray(dev) ? dev.filter(function (d) { return d.designe === 'passe'; }).length : 0,
      revelation_verdicts: null, revelation_raison_tentee: null
    };
    if (revelation) {
      mesure.revelation_verdicts = revelation.devineurs.porteur.verdicts.slice();
      var cachee = mancheRevelee.cartes.filter(function (x) { return x.cachee; })[0];
      mesure.revelation_raison_tentee = cachee ? cachee.raison_devinee !== null : null;
    }
    return mesure;
  }

  function agregats(ctx, revelations, manches, dimanches) {
    var K = ctx.K;
    var reponduRevele = 0;
    for (var n = 1; n <= 13 && n + 2 <= K; n++) { if (ctx.reponse('porteur', String(n))) { reponduRevele++; } }
    if (reponduRevele < 5) {
      return { justesse_personnages_entre_eux: null, justesse_personnages_sur_porteur: null, titres_tires_au_sort: null };
    }
    var ee = { justes: 0, total: 0 }, sp = { justes: 0, total: 0 };
    for (var k = 3; k <= Math.min(K, 15); k++) {
      var mv = manches[k - 1];
      Object.keys(mv).forEach(function (g) {
        if (g === 'porteur') { return; }
        mv[g].cartes.forEach(function (c) {
          var cible = c.auteur_compte === 'porteur' ? sp : ee;
          cible.total += 1;
          if (c.designe === c.auteur_compte) { cible.justes += 1; }
        });
      });
    }
    var tirages = 0;
    Object.keys(dimanches).forEach(function (kd) {
      var d = dimanches[kd];
      [d.devin, d.mystere, d.surprise].forEach(function (t) { if (t.departage === 'tirage') { tirages++; } });
    });
    return { justesse_personnages_entre_eux: ee.total ? ee : null, justesse_personnages_sur_porteur: sp.total ? sp : null,
      titres_tires_au_sort: tirages };
  }

  /* ------------------------------------------------------------------ */
  /* Carnet (§8.12)                                                      */
  /* ------------------------------------------------------------------ */

  var LIBELLES = {
    q1: { aurais_pu: 'J’aurais pu trouver', ne_pouvais_pas: 'Je ne pouvais pas trouver', les_deux: 'Les deux' },
    q2: { premier_coup: 'Compris du premier coup', en_relisant: 'Compris en relisant', pas_tout: 'Pas tout compris' },
    q3: { revelation: 'La révélation', titres: 'Les titres', phrase_semaine: 'Ma phrase de la semaine', deviner: 'Deviner',
      donner_avis: 'Donner mon avis', phrase_jour: 'Ma phrase du jour', aucun: 'Aucun' },
    arret: { pas_amuse: 'Je ne m’amuse pas', pas_compris: 'Je ne comprends pas tout', pas_le_temps: 'Je n’ai pas le temps',
      vu_assez: 'J’ai vu ce que je voulais voir', autre: 'Autre raison' },
    f2: { de_plus_en_plus: 'De plus en plus amusant', toujours_autant: 'Toujours aussi amusant',
      de_moins_en_moins: 'De moins en moins amusant', jamais: 'Jamais amusant' }
  };
  var VERDICTS = { juste_et_raison: 'juste avec la raison', juste: 'juste', faux: 'faux', passe: 'passé' };
  var POLES_F1 = { S: ['Sécurité', 'Liberté individuelle'], P: ['Précaution', 'Innovation'], T: ['Tradition', 'Changement'], L: ['Local', 'National'] };

  function libelle(table, code) {
    exiger(Object.prototype.hasOwnProperty.call(LIBELLES[table], code), 'code inconnu ' + table + ' : ' + code);
    return LIBELLES[table][code];
  }

  /** « {m} min {ss} s » (§8.12). */
  function duree(d) {
    exiger(Number.isSafeInteger(d) && d >= 0, 'durée invalide : ' + d);
    return Math.floor(d / 60) + ' min ' + N.deux(d % 60) + ' s';
  }

  function titulaires(liste) {
    if (!liste.length) { return 'pas attribué'; }
    return N.listeEt(trierMembres(liste).map(function (m) { return m === 'porteur' ? 'vous' : m; }));
  }

  function caseF1(t, v) {
    var p = POLES_F1[t];
    if (v === 'pole0') { return p[0]; }
    if (v === 'pole1') { return p[1]; }
    if (v === 'milieu') { return 'au milieu entre ' + p[0] + ' et ' + p[1]; }
    exiger(v === null, 'case F1 invalide : ' + v);
    return 'sans choix entre ' + p[0] + ' et ' + p[1];
  }

  /**
   * Texte du carnet (§8.12). statut : {type: 'fin'} | {type: 'arret'} |
   * {type: 'copie', k}. durees : une entrée {k, duree_seance,
   * duree_deviner, duree_repondre} par séance du journal donné.
   */
  function carnet(scelle, journal, R, durees, statut) {
    var S = journal.seances, K = S.length - 1;
    var l = [];
    l.push('Carnet de l’essai Elenchos');
    l.push('Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, ni votre portrait, ni votre pseudo.');
    l.push('Les titres et les chiffres « Sur tout l’essai » dépendent en partie de vos avis, mais seulement en cumul, jamais texte par texte.');
    if (statut.type === 'fin') {
      exiger(K === 15, 'carnet : fin avant la clôture');
      l.push('Essai mené jusqu’à la clôture.');
    } else if (statut.type === 'arret') {
      exiger(journal.arret && journal.arret.k === K, 'carnet : arrêt incohérent');
      l.push(K === 0 ? 'Essai arrêté à l’entrée.' : 'Essai arrêté au jour ' + K + '.');
      l.push('Raison de l’arrêt : ' + (journal.arret.raison === null ? 'pas de réponse' : libelle('arret', journal.arret.raison)) + '.');
    } else {
      exiger(statut.type === 'copie' && statut.k === K, 'carnet : copie incohérente');
      l.push(K === 0 ? 'Essai en cours : carnet copié à l’entrée.' : 'Essai en cours : carnet copié au jour ' + K + '.');
    }

    for (var k = 0; k <= K; k++) {
      var s = S[k], m = R.seances[k].mesures, d = durees[k];
      exiger(d && d.k === k, 'carnet : durées absentes pour la séance ' + k);
      l.push('');
      l.push(k === 0 ? 'Entrée' : (k === 15 ? 'Clôture' : 'Jour ' + k + ' sur 14'));
      var h = +s.ouverture.slice(11, 13);
      l.push('Ouverture : ' + N.dateCarnet(s.ouverture) + ', entre ' + h + 'h00 et ' + h + 'h59.');
      if (k >= 1) { l.push('Jours écoulés depuis l’ouverture précédente : ' + m.jours_ecoules + '.'); }
      exiger(Array.isArray(s.versions) && s.versions.length >= 1, 'carnet : versions absentes, séance ' + k);
      l.push('Version de la page : ' + s.versions.join(', puis ') + '.');
      var suite = '';
      if (d.duree_deviner !== null && d.duree_repondre !== null) { suite = ', dont ' + duree(d.duree_deviner) + ' pour deviner et ' + duree(d.duree_repondre) + ' pour répondre'; }
      else if (d.duree_deviner !== null) { suite = ', dont ' + duree(d.duree_deviner) + ' pour deviner'; }
      else if (d.duree_repondre !== null) { suite = ', dont ' + duree(d.duree_repondre) + ' pour répondre'; }
      l.push('Durée : ' + duree(d.duree_seance) + suite + '.');
      if (k >= 2 && k <= 14) { l.push('Boutons touchés : Relire ' + m.relire + ' fois, Passer ' + m.passer + ' fois.'); }
      if (k >= 3) {
        var v = m.revelation_verdicts;
        if (v.length === 0) { l.push('Révélation : aucune carte.'); }
        else {
          var ligne = 'Révélation : ' + v.map(function (x) { return VERDICTS[x]; }).join(', ') + '.';
          if (m.revelation_raison_tentee !== null) { ligne += ' Raison cachée : ' + (m.revelation_raison_tentee ? 'tentée' : 'pas tentée') + '.'; }
          l.push(ligne);
        }
      }
      var q = s.coups.carnet;
      if (q.q1 !== null) { l.push('Vos erreurs à la révélation : ' + libelle('q1', q.q1) + '.'); }
      if (q.q2 !== null) { l.push((k === 0 ? 'Les trois textes et leurs raisons' : 'Le texte du jour et ses quatre raisons') + ' : ' + libelle('q2', q.q2) + '.'); }
      if (q.q3 !== null) { l.push('Votre moment préféré : ' + libelle('q3', q.q3) + '.'); }

      if (k === 7 || k === 14) {
        var dm = R.seances[k].dimanche;
        l.push('');
        l.push('Titres de la semaine ' + dm.semaine);
        if (dm.semaine === 2) { l.push('Le Sans-Faute : ' + titulaires(dm.sans_faute) + '.'); }
        l.push('Le Devin : ' + titulaires(dm.devin.titulaire ? [dm.devin.titulaire] : []) + '.');
        l.push('Le Mystère : ' + titulaires(dm.mystere.titulaire ? [dm.mystere.titulaire] : []) + '.');
        l.push('Le Fidèle : ' + titulaires(dm.fidele.titulaires) + '.');
      }
    }

    var a = R.agregats;
    l.push('');
    l.push('Sur tout l’essai');
    l.push('Quand un personnage devinait la réponse d’un autre personnage, il a trouvé son auteur : ' +
      (a.justesse_personnages_entre_eux ? a.justesse_personnages_entre_eux.justes + ' fois sur ' + a.justesse_personnages_entre_eux.total : 'pas de chiffre') + '.');
    l.push('Quand un personnage devinait l’une de vos réponses, il a trouvé que c’était vous : ' +
      (a.justesse_personnages_sur_porteur ? a.justesse_personnages_sur_porteur.justes + ' fois sur ' + a.justesse_personnages_sur_porteur.total : 'pas de chiffre') + '.');
    l.push('Titres attribués par tirage au sort, faute de départage : ' + (a.titres_tires_au_sort === null ? 'pas de chiffre' : a.titres_tires_au_sort) + '.');

    var fin = statut.type === 'fin' ? journal.fin : (statut.type === 'arret' && K >= 3 ? journal.arret : null);
    if (fin) {
      l.push('');
      l.push('Questions de fin');
      l.push((statut.type === 'fin' ? 'Au fil des deux semaines' : 'Jusqu’ici') + ', deviner était : ' +
        (fin.f2 === null ? 'pas de réponse' : libelle('f2', fin.f2)) + '.');
      if (fin.f1 === null) { l.push('Où vous placez chacun : question passée.'); }
      else {
        l.push('Où vous placez chacun :');
        PERSONNAGES.forEach(function (p) {
          l.push(p + ' : ' + TENSIONS.map(function (t) { return caseF1(t, fin.f1[p][t]); }).join(' · ') + '.');
        });
      }
    }
    l.push('');
    l.push('Fin du carnet');
    var texte = l.join('\n');
    exiger(texte.normalize('NFC') === texte && texte.indexOf("'") < 0 && !/ {2}|^ | $/m.test(texte), 'carnet : forme invalide');
    return texte;
  }

  /* ------------------------------------------------------------------ */
  /* Durées et copie du carnet en cours d'essai (§8.12, partie 3.2)      */
  /* ------------------------------------------------------------------ */

  /** Vérifie qu'une ligne de durées suit la présence fixée par etapes
   *  (partie 3.10) ; rend la ligne. */
  function dureesConformes(durees, k, etapes, ou) {
    exiger(durees && durees.k === k, ou + ' : durées absentes');
    exiger(Number.isSafeInteger(durees.duree_seance), ou + ' : duree_seance absente');
    var dev = !!(etapes && etapes.deviner), rep = !!(etapes && etapes.repondre);
    exiger((durees.duree_deviner !== null) === dev, ou + ' : présence de duree_deviner contraire à etapes');
    exiger((durees.duree_repondre !== null) === rep, ou + ' : présence de duree_repondre contraire à etapes');
    return durees;
  }

  function copierCoups(c) { return JSON.parse(JSON.stringify(c)); }

  /**
   * Copie du carnet faite en cours d'essai, au toucher « Copier mon carnet
   * d'abord » (§8.12) : séances 0 à c.k, la séance c.k prise dans l'état
   * de la copie (coups, versions, etapes). D : durées des séances 0 à
   * c.k - 1 ; dc : durées de la séance c.k à l'instant de la copie.
   * Rend {k, coups, versions, etapes, mesures, texte} (partie 3.2).
   */
  function copie(scelle, journal, c, D, dc) {
    var S = journal.seances;
    exiger(c.k >= 0 && c.k < S.length, 'copie : séance inconnue');
    var j2 = { partie: journal.partie, seances: S.slice(0, c.k).concat([{ k: c.k, ouverture: S[c.k].ouverture, versions: c.versions,
      etapes: c.etapes, coups: c.coups, attente: null }]), copies: [], arret: null, fin: null };
    var R2 = calculer(scelle, j2);
    dureesConformes(dc, c.k, c.etapes, 'copie');
    var mc = {};
    Object.keys(R2.seances[c.k].mesures).forEach(function (x) { mc[x] = R2.seances[c.k].mesures[x]; });
    mc.duree_seance = dc.duree_seance; mc.duree_deviner = dc.duree_deviner; mc.duree_repondre = dc.duree_repondre;
    return { k: c.k, coups: copierCoups(c.coups), versions: c.versions.slice(), etapes: c.etapes ? { deviner: c.etapes.deviner, repondre: c.etapes.repondre } : null,
      mesures: mc, texte: carnet(scelle, j2, R2, D.slice(0, c.k).concat([dc]), { type: 'copie', k: c.k }) };
  }

  /* ------------------------------------------------------------------ */
  /* Validité du journal (partie 3.12)                                   */
  /* ------------------------------------------------------------------ */

  var Q3_CHOIX = {
    0: ['donner_avis', 'deviner', 'revelation', 'aucun'],
    1: ['donner_avis', 'phrase_jour', 'aucun'],
    2: ['deviner', 'donner_avis', 'phrase_jour', 'aucun'],
    courant: ['revelation', 'deviner', 'donner_avis', 'phrase_jour', 'aucun'],
    dimanche: ['revelation', 'titres', 'phrase_semaine', 'deviner', 'donner_avis', 'phrase_jour', 'aucun']
  };

  /** Choix de la question 3 proposés à la séance k (§8.3, « Moments
   *  vécus », commit 3553b2e), dans l'ordre du tableau. Aux séances 1 à 14,
   *  selon les écrans affichés (etapes), jamais selon la réponse :
   *  « Deviner » si etapes.deviner ; « Donner mon avis » et « Ma phrase du
   *  jour » si etapes.repondre. etapes vaut null en mode moteur : la liste
   *  est alors la plus large (aucun écran n'est connu). */
  function choixQ3(k, etapes) {
    var c = k === 0 ? Q3_CHOIX[0] : (k === 1 ? Q3_CHOIX[1] : (k === 2 ? Q3_CHOIX[2] : (k === 7 || k === 14 ? Q3_CHOIX.dimanche : (k <= 14 ? Q3_CHOIX.courant : []))));
    if (k < 1 || k > 14 || !etapes) { return c.slice(); }
    return c.filter(function (x) {
      if (x === 'deviner') { return etapes.deviner; }
      if (x === 'donner_avis' || x === 'phrase_jour') { return etapes.repondre; }
      return true;
    });
  }

  function estNiveau(x) { return Number.isSafeInteger(x) && x >= 1 && x <= 5; }
  function estRaison(x) { return x === 'aucune' || (Number.isSafeInteger(x) && x >= 1 && x <= 4); }
  function estReponse(r) { return r && typeof r === 'object' && estNiveau(r.niveau) && estRaison(r.raison) && Object.keys(r).length === 2; }

  /** Rend la liste des écarts (« règle n, /chemin : … »), vide si le journal est valide. */
  function validerJournal(scelle, journal) {
    var e = [];
    function err(regle, chemin, msg) { e.push('règle ' + regle + ', ' + chemin + ' : ' + msg); }
    var S = journal.seances;
    if (!Array.isArray(S) || S.length < 1 || S.length > 16) { err(3, '/seances', 'séances absentes'); return e; }
    var K = S.length - 1;
    var p = journal.partie || {};
    var mode = p.mode;
    if (mode !== 'interface' && mode !== 'moteur') { err(2, '/partie/mode', 'mode inconnu'); }
    if (p.graine === null ? !/^[a-z]$/.test(p.id) : !(/^hasard-[0-9]{3}$/.test(p.id) && /^[0-9a-f]{16}$/.test(p.graine))) {
      err(2, '/partie', 'id ou graine invalides');
    }
    if ((journal.fin === null) === (journal.arret === null)) { err(3, '/fin', 'exactement un de fin et arret'); }
    if (journal.fin !== null && K !== 15) { err(3, '/fin', 'fin avant la séance 15'); }
    if (journal.arret !== null && journal.arret.k !== K) { err(3, '/arret/k', 'arret.k différent de la dernière séance'); }
    if (mode === 'moteur' && journal.copies.length) { err(2, '/copies', 'copies en mode moteur'); }

    var prevMs = null, prevVersion = null;
    var tx = scelle.textes;
    // Pour les règles qui dépendent des cartes servies, on calcule les manches au fil de l'eau.
    var R = null;
    try { R = calculer(scelle, journal); } catch (x) { err(7, '/seances', 'calcul impossible : ' + x.message); return e; }

    S.forEach(function (s, k) {
      var ch = '/seances/' + k;
      var c = s.coups;
      if (s.k !== k) { err(3, ch + '/k', 'numéro'); }
      try {
        var ms = N.lireInstant(s.ouverture);
        if (prevMs !== null && ms < prevMs) { err(4, ch + '/ouverture', 'ouverture antérieure à la précédente'); }
        prevMs = ms;
      } catch (x) { err(4, ch + '/ouverture', x.message); }
      if (mode === 'moteur') {
        if (s.versions !== null || s.etapes !== null) { err(2, ch, 'versions et etapes nuls en mode moteur'); }
      } else {
        if (!Array.isArray(s.versions) || !s.versions.length) { err(5, ch + '/versions', 'absentes'); }
        else {
          s.versions.forEach(function (v, i) {
            if (!Number.isSafeInteger(v) || v < 1) { err(5, ch + '/versions/' + i, 'entier ≥ 1 attendu'); }
            if (i > 0 && v <= s.versions[i - 1]) { err(5, ch + '/versions/' + i, 'non croissant'); }
          });
          if (prevVersion !== null && s.versions[0] < prevVersion) { err(5, ch + '/versions/0', 'inférieur à la séance précédente'); }
          prevVersion = s.versions[s.versions.length - 1];
        }
        if (k === 0 || k === 15) { if (s.etapes !== null) { err(12, ch + '/etapes', 'nul attendu'); } }
        else if (!s.etapes || typeof s.etapes.deviner !== 'boolean' || typeof s.etapes.repondre !== 'boolean') { err(12, ch + '/etapes', 'absent'); }
      }
      var cles = ['carnet', 'consentement', 'deviner', 'entree', 'pseudo', 'relire', 'reponse'];
      if (!c || Object.keys(c).sort().join() !== cles.join()) { err(1, ch + '/coups', 'clés inattendues'); return; }
      if (!Number.isSafeInteger(c.relire) || c.relire < 0) { err(1, ch + '/coups/relire', 'entier attendu'); }
      if ((k < 2 || k > 14) && c.relire !== 0) { err(9, ch + '/coups/relire', '0 attendu hors des séances 2 à 14'); }

      // Entrée (règle 6)
      if (k === 0) {
        var ent = c.entree;
        if (!ent || Object.keys(ent).sort().join() !== 'E1,E2,E3') { err(6, ch + '/coups/entree', 'E1, E2, E3 attendus'); }
        else {
          var precOk = true, nbRep = 0;
          ENTREE.forEach(function (x) {
            var r = ent[x];
            if (r.reponse !== null && !estReponse(r.reponse)) { err(6, ch + '/coups/entree/' + x, 'réponse invalide'); }
            if (r.pari !== null && !estNiveau(r.pari)) { err(6, ch + '/coups/entree/' + x + '/pari', 'niveau attendu'); }
            if (r.pari !== null && r.reponse === null) { err(6, ch + '/coups/entree/' + x, 'pari sans réponse'); }
            if (r.reponse !== null && !precOk) { err(6, ch + '/coups/entree/' + x, 'texte joué hors ordre'); }
            precOk = r.reponse !== null && r.pari !== null;
            if (r.reponse !== null) { nbRep++; }
          });
          if (nbRep > 0 && c.consentement !== true) { err(6, ch + '/coups/consentement', 'true attendu dès une réponse'); }
          if (c.pseudo !== null && !(ent.E3.pari !== null)) { err(6, ch + '/coups/pseudo', 'pseudo avant le troisième pari'); }
        }
        if (c.pseudo !== null) {
          if (typeof c.pseudo !== 'string' || !c.pseudo.length || c.pseudo.normalize('NFC') !== c.pseudo || /[\u0000-\u001f\u007f]/.test(c.pseudo) ||
            Array.from(c.pseudo).length > 20 || c.pseudo !== c.pseudo.trim()) { err(6, ch + '/coups/pseudo', 'pseudo invalide'); }
        }
        if (K >= 1 && c.pseudo === null) { err(6, ch + '/coups/pseudo', 'pseudo attendu pour quitter l’entrée'); }
      } else {
        if (c.entree !== null || c.pseudo !== null || c.consentement !== null) { err(6, ch + '/coups', 'entrée hors séance 0'); }
      }

      // Deviner (règle 7)
      var manche = R.seances[k].manches ? R.seances[k].manches.porteur : null;
      var validee = true, sansCarte = false;
      if (k >= 2 && k <= 14) {
        if (!Array.isArray(c.deviner)) { err(7, ch + '/coups/deviner', 'tableau attendu'); }
        else {
          sansCarte = c.deviner.length === 0;
          var nuls = c.deviner.filter(function (d) { return d.designe === null; }).length;
          validee = nuls === 0;
          if (nuls > 0 && nuls !== c.deviner.length) { err(7, ch + '/coups/deviner', 'manche à moitié validée'); }
          var vus = [];
          c.deviner.forEach(function (d, i) {
            var cd = ch + '/coups/deviner/' + i;
            if (Object.keys(d).sort().join() !== 'designe,raison') { err(7, cd, 'clés'); }
            if (d.designe !== null && d.designe !== 'passe' && !estPersonnage(d.designe)) { err(7, cd + '/designe', 'valeur'); }
            if (estPersonnage(d.designe)) { if (vus.indexOf(d.designe) >= 0) { err(7, cd + '/designe', 'personnage désigné deux fois'); } vus.push(d.designe); }
            if (d.raison !== null) {
              if (!estRaison(d.raison)) { err(7, cd + '/raison', 'valeur'); }
              if (!manche || !manche.cartes[i] || !manche.cartes[i].cachee) { err(7, cd + '/raison', 'raison hors de la carte à raison cachée'); }
              if (!estPersonnage(d.designe)) { err(7, cd + '/raison', 'raison sans visage'); }
              if (nuls > 0) { err(7, cd + '/raison', 'raison dans une manche non validée'); }
            }
          });
        }
      } else if (c.deviner !== null) { err(7, ch + '/coups/deviner', 'nul attendu'); }

      // Répondre (règle 8)
      if (k >= 1 && k <= 14) {
        if (c.reponse !== null && !estReponse(c.reponse)) { err(8, ch + '/coups/reponse', 'réponse invalide'); }
        if (c.reponse !== null && !validee) { err(8, ch + '/coups/reponse', 'réponse avant « Valider »'); }
      } else if (c.reponse !== null) { err(8, ch + '/coups/reponse', 'nul attendu'); }

      // Carnet du jour (règle 10)
      var q = c.carnet;
      if (!q || Object.keys(q).sort().join() !== 'q1,q2,q3') { err(10, ch + '/coups/carnet', 'clés'); return; }
      var faux = 0;
      if (k === 0) {
        ENTREE.forEach(function (x) { if (R.seances[0].entree.textes[x].juste === false) { faux++; } });
        if ((q.q1 !== null || q.q2 !== null || q.q3 !== null) && c.pseudo === null) { err(10, ch + '/coups/carnet', 'questions avant 1.9'); }
      } else if (k >= 3) {
        faux = R.seances[k].mesures.revelation_verdicts.filter(function (v) { return v === 'faux'; }).length;
      }
      if (q.q1 !== null) {
        if (!Object.prototype.hasOwnProperty.call(LIBELLES.q1, q.q1)) { err(10, ch + '/coups/carnet/q1', 'code'); }
        if (faux < 1 || (q.q1 === 'les_deux' && faux < 2)) { err(10, ch + '/coups/carnet/q1', 'pas assez de « Ça alors ! »'); }
      }
      if (q.q2 !== null) {
        if (!Object.prototype.hasOwnProperty.call(LIBELLES.q2, q.q2)) { err(10, ch + '/coups/carnet/q2', 'code'); }
        if (k === 15) { err(10, ch + '/coups/carnet/q2', 'pas de q2 à la clôture'); }
        if (k >= 1 && k <= 14 && mode === 'interface' && !(s.etapes && s.etapes.repondre)) { err(10, ch + '/coups/carnet/q2', 'Répondre pas affiché'); }
      }
      var etq3 = mode === 'interface' ? s.etapes : (sansCarte ? { deviner: false, repondre: true } : null);
      if (q.q3 !== null && choixQ3(k, etq3).indexOf(q.q3) < 0) { err(10, ch + '/coups/carnet/q3', 'choix non proposé'); }

      // Attente (règle 11)
      if (s.attente !== null) {
        var finie = k >= 1 && k <= 14 && c.reponse !== null && validee;
        if (!finie) { err(11, ch + '/attente', '« En attendant » sur une journée pas finie'); }
        if (!s.attente.lectures || !s.attente.lectures.length) { err(11, ch + '/attente/lectures', 'au moins une lecture'); }
        else { s.attente.lectures.forEach(function (l, i) { try { N.lireHeure(l.heure); } catch (x) { err(11, ch + '/attente/lectures/' + i, x.message); } }); }
      }

      // Étapes (règle 12)
      if (mode === 'interface' && s.etapes && k >= 1 && k <= 14) {
        if (k === 1 && s.etapes.deviner) { err(12, ch + '/etapes/deviner', 'faux attendu à la séance 1'); }
        if (Array.isArray(c.deviner) && c.deviner.some(function (d) { return d.designe !== null; }) && !s.etapes.deviner) { err(12, ch + '/etapes/deviner', 'vrai attendu'); }
        if (c.reponse !== null && !s.etapes.repondre) { err(12, ch + '/etapes/repondre', 'vrai attendu'); }
        if (sansCarte && s.etapes.deviner) { err(12, ch + '/etapes/deviner', 'faux un jour sans carte'); }
      }
    });

    // Arrêt et fin (règle 13)
    function validerF1(f1, ch) {
      if (Object.keys(f1).sort().join() !== PERSONNAGES.slice().sort().join()) { err(13, ch, 'personnages'); return; }
      PERSONNAGES.forEach(function (p) {
        if (Object.keys(f1[p]).sort().join() !== 'L,P,S,T') { err(13, ch + '/' + p, 'tensions'); return; }
        TENSIONS.forEach(function (t) { if ([null, 'pole0', 'milieu', 'pole1'].indexOf(f1[p][t]) < 0) { err(13, ch + '/' + p + '/' + t, 'code'); } });
      });
    }
    if (journal.arret) {
      var a = journal.arret;
      if (a.raison !== null && !Object.prototype.hasOwnProperty.call(LIBELLES.arret, a.raison)) { err(13, '/arret/raison', 'code'); }
      if (a.k < 3 && (a.f2 !== null || a.f1 !== null)) { err(13, '/arret', 'f1 et f2 nuls avant le jour 3'); }
      if (a.f2 !== null && !Object.prototype.hasOwnProperty.call(LIBELLES.f2, a.f2)) { err(13, '/arret/f2', 'code'); }
      if (a.f1 !== null) { validerF1(a.f1, '/arret/f1'); }
    }
    if (journal.fin) {
      if (journal.fin.f2 !== null && !Object.prototype.hasOwnProperty.call(LIBELLES.f2, journal.fin.f2)) { err(13, '/fin/f2', 'code'); }
      if (!journal.fin.f1) { err(13, '/fin/f1', 'objet attendu'); } else { validerF1(journal.fin.f1, '/fin/f1'); }
    }

    // Copies (règle 14)
    var prevK = 0;
    (journal.copies || []).forEach(function (cp, i) {
      var ch = '/copies/' + i;
      if (!(cp.k >= 0 && cp.k <= Math.min(K, 14)) || cp.k < prevK) { err(14, ch + '/k', 'hors bornes (0 à min(K, 14)) ou hors ordre'); return; }
      prevK = cp.k;
      var s = S[cp.k];
      if (cp.coups.relire > s.coups.relire) { err(14, ch + '/coups/relire', 'supérieur à la séance'); }
      if (cp.coups.reponse !== null && JSON.stringify(cp.coups.reponse) !== JSON.stringify(s.coups.reponse)) { err(14, ch + '/coups/reponse', 'différente de la séance'); }
      if (Array.isArray(cp.coups.deviner)) {
        cp.coups.deviner.forEach(function (d, j) {
          if (d.designe !== null && (!s.coups.deviner || s.coups.deviner[j].designe !== d.designe)) { err(14, ch + '/coups/deviner/' + j, 'désignation différente'); }
          if (d.raison !== null && (!s.coups.deviner || s.coups.deviner[j].raison !== d.raison)) { err(14, ch + '/coups/deviner/' + j, 'raison différente'); }
        });
      }
      if (!Array.isArray(cp.versions) || cp.versions.some(function (v, j) { return s.versions[j] !== v; })) { err(14, ch + '/versions', 'pas un début de celles de la séance'); }
      if (cp.etapes && s.etapes && ((cp.etapes.deviner && !s.etapes.deviner) || (cp.etapes.repondre && !s.etapes.repondre))) { err(14, ch + '/etapes', 'étape vraie dans la copie, fausse dans la séance'); }
    });
    return e;
  }

  /* ------------------------------------------------------------------ */
  /* Corrigé de F1 (devoilement.md)                                      */
  /* ------------------------------------------------------------------ */

  /** Corrigé de F1 : « milieu » de 41 à 59, sinon le pôle du côté de p. */
  function corrigeF1(scelle) {
    var c = {};
    PERSONNAGES.forEach(function (p) {
      c[p] = {};
      TENSIONS.forEach(function (t) {
        var pos = scelle.personnages[p].profil[t].position;
        c[p][t] = pos >= 41 && pos <= 59 ? 'milieu' : (pos >= 60 ? 'pole1' : 'pole0');
      });
    });
    return c;
  }

  function casesJustes(f1, corrige) {
    var n = 0;
    PERSONNAGES.forEach(function (p) { TENSIONS.forEach(function (t) { if (f1[p][t] !== null && f1[p][t] === corrige[p][t]) { n++; } }); });
    return n;
  }

  return {
    PERSONNAGES: PERSONNAGES, MEMBRES: MEMBRES, TENSIONS: TENSIONS, ENTREE: ENTREE, TEXTES: TEXTES,
    cote: cote, valeur: valeur, classer: classer, curseur: curseur,
    calculer: calculer, carnet: carnet, copie: copie, dureesConformes: dureesConformes, validerJournal: validerJournal,
    visagesDejaJoue: visagesDejaJoue, minutesAvantDixHuit: minutesAvantDixHuit, choixQ3: choixQ3,
    phraseDuJour: phraseDuJour, corrigeF1: corrigeF1, casesJustes: casesJustes, duree: duree, LIBELLES: LIBELLES
  };
})(ElenchosNoyau);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosMoteur; }
/*node-fin*/
