/* Socle de la page du second essai (outillage d'essai, D-001 tenu ; lot 1).
 *
 * Ce qui, dans la page, n'est ni le moteur ni un écran :
 * - le contexte (icône, onglet, cadre) et les écrans hors de l'icône (§8.13) ;
 * - les vérifications du chargement V1 à V6, dans l'ordre du schéma
 *   (a-ne-pas-ouvrir-2/schema.md, partie 3.4) : V1 à V5, histoire(), V6 ;
 * - la mémoire (memoire.js), la partie du premier essai repérée par la
 *   seule liste des clés, l'arrêt M1, les arrêts 2 et 3 ;
 * - l'horloge de premier plan et la lecture de l'heure (§8.8, « L'heure ») ;
 * - le toucher compté, le gestionnaire unique des touchers, le registre
 *   des actions des écrans ;
 * - le point d'accès en lecture de la version témoin (§9).
 *
 * Les écrans (téléphone et cadre, instance B, lots 4 et 5) se branchent par
 * demarrer(ecrans) ; leur contrat est dans INTERFACE.md. Tout ce qui
 * s'affiche, mots compris, est aux écrans : le socle n'écrit aucun texte.
 *
 * Constantes posées par la construction, avant ce fichier :
 *   ENTREES = {version_page, …} ; SCELLE_B64 ; CONFUSABLES (lot 6, {} en attendant).
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) {
  var ElenchosNoyau = require('./noyau.js');
  var ElenchosCalendrier = require('./calendrier.js');
  var ElenchosJournal = require('./journal.js');
  var ElenchosEtat = require('./etat.js');
  var ElenchosMemoire = require('./memoire.js');
  var ElenchosMoteur = require('./moteur.js');
}
/*node-fin*/

var ElenchosSocle = (function (N, C, J, E, Me, MoteurDeLaPage) {
  /** Clés des vecteurs de test, dans l'ordre (simulation-2.md, §0 ; schéma, partie 2.8). */
  var VECTEURS = ['raison|Odile|E2|3', 'hasard|Nassim|13|porteur', 'ecart-hstar|1|Valentin'];
  var FORMAT_SCELLE = 'elenchos-essai-scelle';
  var VERSION_SCELLE = 5;

  function creer(env) {
    var W = env.window, D = env.document, P = env.performance;
    /** Le moteur : celui de la page ; un autre seulement dans les tests du socle. */
    var M = env.moteur || MoteurDeLaPage;
    var confusables = env.confusables || {};
    var VERSION = env.version;
    var ecrans = null;
    var scelle = null, octetsScelle = null, texteScelle = null, empreinte = null, cal = null, arrivee = null;
    var etat = null, efface = false, arretTechnique = false;
    var visibleDepuis = null;
    var resultatsCache = null, resultatsCle = null;
    var lectures = []; // lectures d'« En attendant », relevées pour la version témoin, jamais gardées (§8.8)

    /* ---------------------------------------------------------------- */
    /* Contexte (page-test v2 : même code, même ordre)                  */
    /* ---------------------------------------------------------------- */

    function contexte() {
      var ua = W.navigator.userAgent;
      var points = W.navigator.maxTouchPoints || 0;
      var ipadBureau = /Macintosh/.test(ua) && points > 1;
      var estIOS = /iPhone|iPad|iPod/.test(ua) || ipadBureau;
      var dansCadre; try { dansCadre = W.self !== W.top; } catch (e) { dansCadre = true; }
      var standalone = W.navigator.standalone === true || (W.matchMedia ? W.matchMedia('(display-mode: standalone)').matches : false);
      var autreNavigateur = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|GSA\//.test(ua);
      var appareil = (/iPad/.test(ua) || ipadBureau) ? 'iPad' : 'iPhone';
      if (dansCadre || !estIOS) { return { hors: 'ailleurs', appareil: appareil }; }
      if (!standalone && autreNavigateur) { return { hors: 'autre', appareil: appareil }; }
      if (!standalone) { return { hors: 'onglet', appareil: appareil }; }
      return { hors: null, appareil: appareil };
    }

    /* ---------------------------------------------------------------- */
    /* V1 à V5 (§8.11 du premier essai ; schéma, partie 6 : version 5)  */
    /* ---------------------------------------------------------------- */

    /** Rend 0 si tout va bien, sinon le numéro de la vérification ratée. */
    function verifier() {
      try { if (!N.autotestSha256()) { return 1; } } catch (e) { return 1; }
      try { octetsScelle = N.base64Decoder(env.scelleB64); } catch (e) { return 2; }
      try { empreinte = N.sha256(octetsScelle); if (!/^[0-9a-f]{64}$/.test(empreinte)) { return 3; } } catch (e) { return 3; }
      try {
        texteScelle = N.utf8Decoder(octetsScelle);
        scelle = JSON.parse(texteScelle);
        if (!scelle || scelle.format !== FORMAT_SCELLE || scelle.version !== VERSION_SCELLE) { return 4; }
        if (N.jsonCanonique(scelle) !== texteScelle) { return 4; }
        cal = C.lire(scelle); // une table incohérente arrête la page (schéma, partie 7.1, point 1)
      } catch (e) { return 4; }
      try {
        var tir = N.creerTirage(scelle.graine);
        if (!Array.isArray(scelle.vecteurs_test) || scelle.vecteurs_test.length !== VECTEURS.length) { return 5; }
        for (var i = 0; i < VECTEURS.length; i++) {
          var v = scelle.vecteurs_test[i], r = tir.t(VECTEURS[i]);
          if (v.cle !== VECTEURS[i] || v.chaine !== r.chaine || v.hex8 !== r.hex8 || v.n !== r.n) { return 5; }
        }
      } catch (e) { return 5; }
      return 0;
    }

    /**
     * L'histoire et V6 (§8.8 ; schéma, parties 3.3 et 3.4) : M.histoire(scelle, cal)
     * rend l'état à l'arrivée, M.resume(arrivee) son résumé (partie 3.2).
     * Une erreur pendant le calcul, ou un moteur sans histoire, donne l'arrêt V6.
     * Tout se fait dans la même tâche que V1 à V5 et le premier écran (FE-4).
     */
    function verifierHistoire() {
      try {
        if (typeof M.histoire !== 'function' || typeof M.resume !== 'function') { return false; }
        var a = M.histoire(scelle, cal);
        var resume = M.resume(a);
        if (N.sha256(N.utf8Encoder(N.jsonCanonique(resume))) !== scelle.histoire.resume_sha256) { return false; }
        arrivee = gelerProfond(a);
        return true;
      } catch (e) { return false; }
    }
    function gelerProfond(o) {
      if (o && typeof o === 'object' && !Object.isFrozen(o)) {
        Object.freeze(o);
        Object.keys(o).forEach(function (k) { gelerProfond(o[k]); });
      }
      return o;
    }

    /* ---------------------------------------------------------------- */
    /* Horloges                                                          */
    /* ---------------------------------------------------------------- */

    /** Seule lecture de l'heure du téléphone, aux moments fixés par le §8.8 (« L'heure »). */
    function lireParis() { return N.paris(env.maintenantMs()); }
    function lireInstant() { return lireParis().instant; }

    function estVisible() { return D.visibilityState !== 'hidden'; }
    /** Horloge de premier plan de la partie, en ms (§8.4). */
    function horloge() {
      var en = visibleDepuis !== null ? P.now() - visibleDepuis : 0;
      return etat.horloge + Math.max(0, en);
    }
    function avancerHorloge(cible) {
      if (visibleDepuis !== null) { var m = P.now(); cible.horloge += Math.max(0, m - visibleDepuis); visibleDepuis = m; }
    }
    function arreterHorloge() {
      if (visibleDepuis === null || !etat) { return; }
      etat.horloge += Math.max(0, P.now() - visibleDepuis);
      visibleDepuis = null;
    }

    /* ---------------------------------------------------------------- */
    /* Mémoire                                                           */
    /* ---------------------------------------------------------------- */

    function verifierForme(o) { return E.verifierForme(o, cal); }
    function stockage() { return W.localStorage; }

    /** Écrit l'état d'un bloc ; un refus arrête la page (arrêts 2 et 3). */
    function ecrireEtat(e2) {
      if (efface || arretTechnique) { return false; }
      var r = Me.ecrire(stockage(), e2, verifierForme);
      if (r === 'arret2') { arreter(2); return false; }
      if (r === 'arret3') { arreter(3); return false; }
      return true;
    }

    /**
     * Un geste : la transition s'applique à une copie de l'état ; si elle
     * réussit, la copie devient l'état et s'écrit d'un bloc. Une transition
     * refusée (ErreurEtat) ne change rien et n'écrit rien.
     */
    function geste(transition) {
      if (!etat || efface || arretTechnique) { return undefined; }
      var copie = JSON.parse(JSON.stringify(etat));
      var h = horloge();
      var r = transition(copie, h);
      avancerHorloge(copie);
      if (ecrireEtat(copie)) { etat = copie; }
      return r;
    }

    function toutEffacer() { Me.toutEffacer(stockage()); efface = true; }

    function arreter(n, repere) {
      if (arretTechnique) { return; }
      arretTechnique = true;
      ecrans.arret(n, repere || null);
    }

    /* ---------------------------------------------------------------- */
    /* Toucher compté (§8.4, partie 4.3.2)                               */
    /* ---------------------------------------------------------------- */

    function couche() { return W.matchMedia && W.matchMedia('(max-height: 499px) and (orientation: landscape)').matches; }

    function toucherCompte() {
      if (!etat || efface || arretTechnique || couche()) { return; }
      var copie = JSON.parse(JSON.stringify(etat));
      var ou = E.toucher(copie, cal, horloge(), VERSION, lireInstant);
      if (ou === 'aucun' || ou === 'fige') { return; }
      avancerHorloge(copie);
      if (ecrireEtat(copie)) { etat = copie; }
    }

    /* ---------------------------------------------------------------- */
    /* Résultats du moteur                                              */
    /* ---------------------------------------------------------------- */

    /** Résultats du moteur pour l'état présent, recalculés seulement quand l'état a changé (lots 2 et 3). */
    function resultats() {
      var cle = etat.ecritures + '|' + JSON.stringify(etat.jours) + JSON.stringify(etat.sauts);
      if (cle !== resultatsCle) { resultatsCache = M.calculer(scelle, cal, arrivee, E.journal(etat, cal, empreinte)); resultatsCle = cle; }
      return resultatsCache;
    }

    /* ---------------------------------------------------------------- */
    /* Événements : un seul gestionnaire de touchers                     */
    /* ---------------------------------------------------------------- */

    function brancher() {
      D.addEventListener('pointerdown', function (ev) {
        if (ecrans.avantToucher) { ecrans.avantToucher(ev); }
        toucherCompte();
      }, true);
      D.addEventListener('keydown', function () { toucherCompte(); }, true);
      D.addEventListener('click', function (ev) {
        var b = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
        if (!b || b.getAttribute('aria-disabled') === 'true') { return; }
        var a = ecrans.actions[b.getAttribute('data-action')];
        if (a) { ev.preventDefault(); a(b); }
      });
      D.addEventListener('visibilitychange', function () {
        if (!etat || efface || arretTechnique) { return; }
        if (D.visibilityState === 'hidden') { arreterHorloge(); ecrireEtat(etat); return; }
        revenir();
      });
      W.addEventListener('pageshow', function (ev) { if (ev.persisted && etat && !efface && !arretTechnique) { revenir(); } });
    }

    /** Retour au premier plan : relire l'état gardé avant tout toucher (§8.8). */
    function revenir() {
      var garde;
      try { garde = Me.lireEtat(stockage(), verifierForme); } catch (e) { garde = undefined; }
      if (!garde || garde.ecritures !== etat.ecritures) { W.location.reload(); return; }
      if (visibleDepuis === null) { visibleDepuis = P.now(); }
      if (ecrans.revenu) { ecrans.revenu(); }
    }

    /* ---------------------------------------------------------------- */
    /* Point d'accès en lecture (§9, « Une seule source »)              */
    /* ---------------------------------------------------------------- */

    function pointDAcces() {
      W.ElenchosEssai = Object.freeze({
        version: VERSION,
        empreinte: function () { return empreinte; },
        etat: function () { return etat ? JSON.parse(JSON.stringify(etat)) : null; },
        journal: function () { return etat ? E.journal(etat, cal, empreinte) : null; },
        durees: function () { return etat ? E.fichierDurees(etat, cal, horloge()) : null; },
        resultats: function () { return etat ? resultats() : null; },
        arrivee: function () { return arrivee; },
        lectures: function () { return JSON.parse(JSON.stringify(lectures)); },
        /** Le moteur sur un journal donné (rejeu en mode moteur, §9) : calcul pur, rien n'est écrit. */
        calculer: function (j) { return scelle && arrivee ? M.calculer(scelle, cal, arrivee, j) : null; },
        histoire: function (collecteur) { return scelle ? M.histoire(scelle, cal, collecteur) : null; }
      });
    }

    /* ---------------------------------------------------------------- */
    /* Démarrage                                                        */
    /* ---------------------------------------------------------------- */

    /** Après la page d'effacement, ou d'emblée sans ancienne partie : la partie commence ou reprend. */
    function commencer(garde) {
      etat = garde || E.nouvelEtat(cal);
      if (estVisible()) { visibleDepuis = P.now(); }
      if (!garde) { if (!ecrireEtat(etat)) { return 'arret'; } }
      ecrans.rendre();
      return garde ? 'reprise' : 'nouvelle';
    }

    /**
     * Ordre du chargement (§8.8 ; schéma, partie 3.4 ; FE-4) :
     * contexte, V1 à V5, histoire et V6, mémoire (`verif-2`), partie gardée
     * (M1), partie du premier essai (liste des clés), puis la partie.
     * Rend ce qui a été fait, pour les tests : 'hors', 'arret', 'ancienne',
     * 'nouvelle' ou 'reprise'.
     */
    function demarrer(e) {
      ecrans = e;
      pointDAcces();
      var ctx = contexte();
      if (ctx.hors) { ecrans.hors(ctx.hors, ctx.appareil); return 'hors'; }
      var v = verifier();
      if (v !== 0) { arreter(1, 'V' + v); return 'arret'; }
      if (!verifierHistoire()) { arreter(1, 'V6'); return 'arret'; }
      if (!Me.memoireMarche(stockage(), 'v' + VERSION + '-' + env.maintenantMs())) { arreter(2); return 'arret'; }
      var garde;
      try { garde = Me.lireEtat(stockage(), verifierForme); } catch (x) { arreter(1, 'M1'); return 'arret'; }
      try { if (W.navigator.storage && W.navigator.storage.persist) { W.navigator.storage.persist().then(function () {}, function () {}); } } catch (x) { /* rien */ }
      brancher();
      var cles = Me.releverCles(stockage());
      if (cles.ancienne) {
        // Rien n'est écrit tant que la partie du premier essai est là (§8.2 A, §8.8).
        ecrans.ancienne({ deuxParties: garde !== null, appareil: ctx.appareil });
        return 'ancienne';
      }
      return commencer(garde);
    }

    /** « Effacer » de la page de la partie du premier essai, confirmé : retire ses clés, puis commence ou reprend. */
    function effacerAncienne() {
      Me.effacerAncienne(stockage());
      var garde;
      try { garde = Me.lireEtat(stockage(), verifierForme); } catch (x) { arreter(1, 'M1'); return 'arret'; }
      return commencer(garde);
    }

    return {
      demarrer: demarrer,
      effacerAncienne: effacerAncienne,
      geste: geste,
      toutEffacer: toutEffacer,
      arreter: arreter,
      /** Lecture de l'heure de Paris : seulement à l'affichage de 2.5 (« En attendant »), comme au premier essai. */
      lireParis: function () { var p = lireParis(); lectures.push({ jour: E.K(etat), heure: p.hhmm }); return p; },
      horloge: function () { return horloge(); },
      etat: function () { return etat; },
      scelle: function () { return scelle; },
      cal: function () { return cal; },
      arrivee: function () { return arrivee; },
      empreinte: function () { return empreinte; },
      resultats: resultats,
      efface: function () { return efface; },
      /** Table du squelette des pseudos (construction, lot 6), pour E.terminerCompte et le refus à la saisie. */
      confusables: function () { return confusables; }
    };
  }

  return { creer: creer, VECTEURS: VECTEURS };
})(ElenchosNoyau, ElenchosCalendrier, ElenchosJournal, ElenchosEtat, ElenchosMemoire, ElenchosMoteur);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosSocle; }
/*node-fin*/
