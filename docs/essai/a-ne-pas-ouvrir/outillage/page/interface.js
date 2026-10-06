/* Interface de la page de l'essai (outillage d'essai, D-001 tenu).
 *
 * Téléphone (§7), cadre (§8.1 à §8.10), mémoire et durées (§8.4, §8.8),
 * arrêts techniques (§8.11), écrans hors de l'icône (§8.13).
 * Rendu par createElement et textContent seulement ; positions des
 * curseurs par le style de l'élément ; un seul gestionnaire de touchers.
 * Le moteur (moteur.js) calcule tout ce qui est compté ; l'interface ne
 * lit l'heure qu'au premier toucher d'une séance et à chaque affichage
 * d'« En attendant » (§9).
 *
 * Constantes posées par la construction, avant ce fichier :
 *   ENTREES = {version_page, consultes_le, empreinte_publiee_le, empreinte_publiee_a}
 *   SCELLE_B64 : le fichier scellé en base64 (repère du contrôle 1, étape 2).
 */
'use strict';

var ElenchosInterface = (function (N, M, X) {
  var F = N.Fraction;
  var VERSION = ENTREES.version_page;
  var PERSOS = M.PERSONNAGES;
  var CLE = 'elenchos-essai:partie';
  var CLE_VERIF = 'elenchos-essai:verif';
  var PREFIXE = 'elenchos-essai:';
  var FORMAT_ETAT = 1;

  /* ================================================================== */
  /* Outils du DOM                                                      */
  /* ================================================================== */

  function h(tag, attributs) {
    var e = document.createElement(tag);
    if (attributs) {
      Object.keys(attributs).forEach(function (k) {
        var v = attributs[k];
        if (v === null || v === undefined || v === false) { return; }
        if (k === 'class') { e.className = v; }
        else if (k === 'action') { e.setAttribute('data-action', v); }
        else if (v === true) { e.setAttribute(k, ''); }
        else { e.setAttribute(k, String(v)); }
      });
    }
    for (var i = 2; i < arguments.length; i++) { ajouter(e, arguments[i]); }
    return e;
  }
  function ajouter(e, c) {
    if (c === null || c === undefined || c === false) { return; }
    if (Array.isArray(c)) { c.forEach(function (x) { ajouter(e, x); }); return; }
    if (typeof c === 'string') { e.appendChild(document.createTextNode(c)); return; }
    e.appendChild(c);
  }
  function vider(e) { while (e.firstChild) { e.removeChild(e.firstChild); } }

  /** Typographie d'affichage (§7.8, règles 1 à 6). */
  function t(s) { return N.typographier(s); }
  /** Gabarit avec « {pseudo} » : règles appliquées avant d'insérer le pseudo. */
  var MARQUE = '\ue000';
  function tp(gabarit) { return N.typographier(gabarit.split('{pseudo}').join(MARQUE)).split(MARQUE).join(pseudo()); }

  /* ================================================================== */
  /* Contexte (page-test v2 : même code, même ordre, §8.8)              */
  /* ================================================================== */

  var ua = navigator.userAgent;
  var points = navigator.maxTouchPoints || 0;
  var tactile = points > 0;
  var ipadBureau = /Macintosh/.test(ua) && points > 1;
  var estIOS = /iPhone|iPad|iPod/.test(ua) || ipadBureau;
  var appareil = (/iPad/.test(ua) || ipadBureau) ? 'iPad' : 'iPhone';
  var dansCadre; try { dansCadre = window.self !== window.top; } catch (e) { dansCadre = true; }
  var standalone = window.navigator.standalone === true ||
    (window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false);
  var autreNavigateur = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|GSA\//.test(ua);

  /* ================================================================== */
  /* Données scellées et vérifications V1 à V5 (§0, §8.11)              */
  /* ================================================================== */

  var scelle = null, octetsScelle = null, texteScelle = null, empreinte = null;

  /** Rend 0 si tout va bien, sinon le numéro de la vérification ratée. */
  function verifier() {
    try { if (!N.autotestSha256()) { return 1; } } catch (e) { return 1; }
    try { octetsScelle = N.base64Decoder(SCELLE_B64); } catch (e) { return 2; }
    try { empreinte = N.sha256(octetsScelle); if (!/^[0-9a-f]{64}$/.test(empreinte)) { return 3; } } catch (e) { return 3; }
    try {
      texteScelle = N.utf8Decoder(octetsScelle);
      scelle = JSON.parse(texteScelle);
      if (!scelle || scelle.format !== 'elenchos-essai-scelle' || scelle.version !== 4) { return 4; }
      if (N.jsonCanonique(scelle) !== texteScelle) { return 4; }
    } catch (e) { return 4; }
    try {
      var tir = N.creerTirage(scelle.graine);
      var cles = ['raison|Odile|E2|3', 'hasard|Nassim|12|porteur', 'surprise-semaine|2|11'];
      if (!Array.isArray(scelle.vecteurs_test) || scelle.vecteurs_test.length !== 3) { return 5; }
      for (var i = 0; i < 3; i++) {
        var v = scelle.vecteurs_test[i], r = tir.t(cles[i]);
        if (v.cle !== cles[i] || v.chaine !== r.chaine || v.hex8 !== r.hex8 || v.n !== r.n) { return 5; }
      }
    } catch (e) { return 5; }
    return 0;
  }

  /* ================================================================== */
  /* Mémoire (§8.8)                                                     */
  /* ================================================================== */

  var etat = null;          // l'état gardé
  var efface = false;       // après « Tout effacer », plus rien ne s'écrit
  var arretTechnique = false;

  function lireBrut() { return window.localStorage.getItem(CLE); }

  /** L'état gardé, ou null s'il n'y en a pas ; lève une erreur s'il est illisible. */
  function lireEtat() {
    var brut = lireBrut();
    if (brut === null) { return null; }
    var o = JSON.parse(brut);
    if (!o || o.format !== FORMAT_ETAT || !Array.isArray(o.seances)) { throw new Error('état illisible'); }
    return o;
  }

  function memoireMarche() {
    try {
      var jeton = 'v' + VERSION + '-' + Date.now();
      window.localStorage.setItem(CLE_VERIF, jeton);
      var ok = window.localStorage.getItem(CLE_VERIF) === jeton;
      window.localStorage.removeItem(CLE_VERIF);
      return ok && window.localStorage.getItem(CLE_VERIF) === null;
    } catch (e) { return false; }
  }

  /** Écrit l'état d'un bloc, après avoir vérifié que personne d'autre ne l'a changé (arrêt 3). */
  function ecrire() {
    if (efface || arretTechnique) { return; }
    var garde;
    try { garde = lireEtat(); } catch (e) { garde = undefined; }
    var compteur = garde ? garde.ecritures : (garde === null ? 0 : -1);
    if (compteur !== etat.ecritures) { arreter3(); return; }
    etat.ecritures += 1;
    try { window.localStorage.setItem(CLE, JSON.stringify(etat)); }
    catch (e) { etat.ecritures -= 1; arreter2(); }
  }

  /** Retire une à une les clés « elenchos-essai: », et elles seules (§8.9). */
  function toutEffacer() {
    var cles = [];
    for (var i = 0; i < window.localStorage.length; i++) {
      var c = window.localStorage.key(i);
      if (c !== null && c.indexOf(PREFIXE) === 0) { cles.push(c); }
    }
    cles.forEach(function (c) { window.localStorage.removeItem(c); });
    efface = true;
  }

  /* ================================================================== */
  /* Horloges : heure de Paris (lue à des moments fixés) et premier plan */
  /* ================================================================== */

  /** Seul accès à l'heure du téléphone (§9) : au premier toucher d'une
   *  séance et à chaque affichage d'« En attendant ». */
  function lireHeure() { return N.paris(Date.now()); }

  var visibleDepuis = null; // instant (performance.now) depuis lequel la page est visible
  function estVisible() { return document.visibilityState !== 'hidden'; }
  /** Temps de premier plan de la séance en cours, en ms (§8.4, §8.8). */
  function ppMaintenant() {
    var s = seanceCourante();
    var en = visibleDepuis !== null ? performance.now() - visibleDepuis : 0;
    return s.pp.total + Math.max(0, en);
  }
  function ppArreter() {
    if (visibleDepuis === null || !etat) { return; }
    var s = seanceCourante();
    s.pp.total += Math.max(0, performance.now() - visibleDepuis);
    visibleDepuis = null;
  }
  function ppReprendre() { if (visibleDepuis === null) { visibleDepuis = performance.now(); } }

  /* ================================================================== */
  /* État de la partie                                                  */
  /* ================================================================== */

  function coupsVides(k) {
    return { carnet: { q1: null, q2: null, q3: null }, consentement: null, deviner: null,
      entree: k === 0 ? { E1: { reponse: null, pari: null }, E2: { reponse: null, pari: null }, E3: { reponse: null, pari: null } } : null,
      pseudo: null, relire: 0, reponse: null };
  }

  function nouvelleSeance(k) {
    return {
      k: k, ouverture: null, versions: [], etapes: k >= 1 && k <= 14 ? { deviner: false, repondre: false } : null,
      coups: coupsVides(k),
      pp: { total: 0, ouverture: null, dernier: null, devDebut: null, devDernier: null, repDebut: null, repFin: null, repContinuer: null, fige: null },
      rev: { i: 0, ret: [], fin: false },
      entreeFinie: false
    };
  }

  function nouvelEtat() {
    return {
      format: FORMAT_ETAT, ecritures: 0, seances: [nouvelleSeance(0)],
      vue: { tel: { ecran: '1.1', pile: [] }, cadre: { page: 'message0' } },
      arret: null, fin: null, parcours: null
    };
  }

  function seanceCourante() { return etat.seances[etat.seances.length - 1]; }
  function K() { return etat.seances.length - 1; }
  function pseudo() { return etat.seances[0].coups.pseudo || ''; }

  /** Le journal des entrées (schema.md, partie 3.12) tiré de l'état. */
  function journal() {
    return {
      partie: { id: 'porteur', mode: 'interface', graine: null },
      seances: etat.seances.map(function (s) {
        return { k: s.k, ouverture: s.ouverture, versions: s.versions.slice(), etapes: s.etapes, coups: s.coups, attente: null };
      }),
      copies: [], arret: etat.arret ? sansEtape(etat.arret) : null, fin: etat.fin ? sansEtape(etat.fin) : null
    };
  }
  function sansEtape(o) { var c = {}; Object.keys(o).forEach(function (k) { if (k !== 'etape') { c[k] = o[k]; } }); return c; }

  var resultatsCache = null, resultatsCle = null;
  /** Résultats du moteur pour l'état présent (recalculés à chaque changement). */
  function R() {
    var cle = etat.ecritures + '|' + JSON.stringify(etat.seances.map(function (s) { return [s.ouverture, s.coups]; }));
    if (cle !== resultatsCle) { resultatsCache = M.calculer(scelle, journal()); resultatsCle = cle; }
    return resultatsCache;
  }

  /** Durées d'une séance, en secondes tronquées (§8.4, §8.12). */
  function dureesSeance(s, maintenant) {
    var p = s.pp;
    var fin = function (x) { return Math.floor(Math.max(0, x) / 1000); };
    var dernier = p.fige !== null ? p.fige : (p.dernier !== null ? p.dernier : p.ouverture);
    var d = { k: s.k, duree_seance: p.ouverture === null ? 0 : fin(dernier - p.ouverture), duree_deviner: null, duree_repondre: null };
    if (s.etapes && s.etapes.deviner) { d.duree_deviner = fin(p.devDernier - p.devDebut); }
    if (s.etapes && s.etapes.repondre) {
      var finRep = p.repFin !== null ? p.repFin : (p.repContinuer !== null ? p.repContinuer : (p.fige !== null ? p.fige : maintenant));
      d.duree_repondre = fin(finRep - p.repDebut);
    }
    return d;
  }

  /* ================================================================== */
  /* Le jour : où en est la séance                                      */
  /* ================================================================== */

  function texteDuJour(k) { return scelle.textes[String(k)]; }
  function jourDeSeance(k) { return X.JOURS_SEANCE[k]; }
  function mancheDuJour() { var r = R().seances[K()]; return r.manches ? r.manches.porteur : null; }
  function aDesCartes() { var m = mancheDuJour(); return !!(m && m.cartes.length); }
  function mancheValidee(s) { return !Array.isArray(s.coups.deviner) || s.coups.deviner.every(function (d) { return d.designe !== null; }); }

  function journeeFinie() {
    var s = seanceCourante();
    if (s.k === 0) { return s.entreeFinie; }
    if (s.k >= 1 && s.k <= 14) { return mancheValidee(s) && s.coups.reponse !== null; }
    return false;
  }

  /** L'écran que montre l'onglet « Aujourd'hui » (§7.1, calendrier §0). */
  function ecranDuJour() {
    var s = seanceCourante(), k = s.k;
    if (k >= 3 && !s.rev.fin) { return s.rev.i === 0 && !s.rev.commencee && k <= 14 ? 'verrou' : 'revelation'; }
    if (k >= 2 && k <= 14 && aDesCartes() && !mancheValidee(s)) { return 'deviner'; }
    if (s.coups.reponse === null) { return 'repondre'; }
    return 'attente';
  }

  /* ================================================================== */
  /* Séquence de la révélation (§7.1, §6 point 8)                       */
  /* ================================================================== */

  function sequenceRevelation(k) {
    var r = R().seances[k];
    var manche = R().seances[k - 1].manches.porteur;
    var seq = [];
    manche.cartes.forEach(function (c, i) { seq.push({ type: 'carte', i: i }); });
    seq.push({ type: 'vote' }, { type: 'auteurs' });
    var d = r.dimanche;
    if (d) {
      if (d.sans_faute.length) { seq.push({ type: 'badge' }); }
      if (d.devin.titulaire) { seq.push({ type: 'devin' }); }
      if (d.mystere.titulaire) { seq.push({ type: 'mystere' }); }
      if (d.fidele.titulaires.length) { seq.push({ type: 'fidele' }); }
      if (d.surprise.texte) { seq.push({ type: 'surprise' }); }
      seq.push({ type: 'phrase' });
    }
    if (k <= 14) { seq.push({ type: 'fin' }); }
    return seq;
  }

  /* ================================================================== */
  /* Pièces de texte (§4.5, §4.6, §7.6, §7.9, §7.10)                    */
  /* ================================================================== */

  function nomMembre(m) { return m === 'porteur' ? pseudo() : m; }
  function initiale(m) {
    if (m !== 'porteur') { return m.charAt(0); }
    var c = Array.from(pseudo())[0] || '';
    return c.toUpperCase();
  }
  function position(niveau) { return X.POSITIONS[niveau - 1]; }
  function consideration(texte, raison) { return texte.considerations[raison - 1]; }
  /** « Défavorable · « Ça coûte trop cher. » » (carte, fin de ligne) */
  function ligneCarte(texte, rep, cachee) {
    if (cachee) { return X.carteLigne(position(rep.niveau), X.carteRaisonCachee); }
    if (rep.raison === 'aucune') { return X.carteLigne(position(rep.niveau), X.aucuneDesQuatreRaisons); }
    return X.carteLigne(position(rep.niveau), X.raisonFinLigne(consideration(texte, rep.raison).texte));
  }
  function dateVote(texte) { return N.dateLongue(texte.vote.date); }
  /** Phrase de l'étape, ou rien (§7.9). */
  function etapeVote(texte) { return X.etape[texte.vote.etape]; }
  function joindre(a, b) { return b ? a + ' ' + b : a; }

  function proposePar(texte, ecran) {
    var a = texte.auteur;
    if (a.type === 'gouvernement') { return X.proposeParGouvernement; }
    var mandat = a.type === 'depute' ? N.mandatDepute(a.feminin) : N.mandatSenateur(a.feminin);
    if (ecran === '5.4' && a.type === 'depute') { return 'Proposé par ' + a.nom + ', ' + a.groupe + '.'; }
    return 'Proposé par ' + a.nom + ', ' + mandat + ', ' + a.groupe + '.';
  }
  function taRaison(texte, raison) {
    var c = consideration(texte, raison);
    return 'Ta raison, ' + X.raisonDansPhrase(c.texte) + ', était l\'argument ' + N.deDepute(c.depute) + ', ' +
      N.mandatDepute(c.depute.feminin) + ', ' + c.depute.groupe + '.';
  }

  /** Groupe de l'auteur, d'un seul tenant au trait d'union (§7.10). */
  function avecSigles(chaine, sigles) {
    // Le texte est rendu en morceaux : chaque sigle à trait d'union dans un élément insécable.
    var morceaux = [chaine];
    sigles.forEach(function (sg) {
      if (sg.indexOf('-') < 0) { return; }
      var suite = [];
      morceaux.forEach(function (m) {
        if (typeof m !== 'string') { suite.push(m); return; }
        var parts = m.split(sg);
        parts.forEach(function (p, i) { if (i > 0) { suite.push(h('span', { class: 'sigle' }, sg)); } if (p) { suite.push(p); } });
      });
      morceaux = suite;
    });
    return morceaux;
  }
  function siglesTexte(texte) {
    var s = [];
    if (texte.auteur.groupe) { s.push(texte.auteur.groupe); }
    texte.considerations.forEach(function (c) { s.push(c.depute.groupe); });
    return s;
  }

  /* ================================================================== */
  /* Blocs du téléphone (vocabulaire des maquettes finales)             */
  /* ================================================================== */

  function bloc(classe, contenu) { return h('div', { class: classe }, contenu); }
  function band(s) { return bloc('band', s); }
  function banner(s) { return bloc('banner', s); }
  function label(s) { return bloc('label', s); }
  function ttl(s) { return h('h2', { class: 'ttl' }, s); }
  function lignes(arr) { return h('div', { class: 'lines' }, arr.map(function (x) { return h('span', null, x); })); }
  function q(s) { return bloc('q', s); }
  function p(s) { return bloc('p', s); }
  function small(s) { return bloc('small', s); }
  function big(s) { return h('div', { class: 'big' }, s); }
  function rule() { return h('hr', { class: 'rule' }); }
  function back(s, action) { return h('button', { type: 'button', class: 'plain back', action: action }, t('← ' + s)); }
  function lien(s, action, params) {
    var a = h('button', { type: 'button', class: 'link', action: action }, s);
    if (params) { Object.keys(params).forEach(function (k) { a.setAttribute('data-' + k, params[k]); }); }
    return a;
  }
  function absent(s) { return lien(s, 'absent'); }
  function dot(lettre, taille, nom, legende, etatFace, action, params, aria) {
    var tag = action ? 'button' : 'div';
    var e = h(tag, { type: action ? 'button' : null, class: 'face ' + (taille || '') + ' ' + (etatFace || ''), action: action,
      'aria-pressed': etatFace === 'on' && action === 'visage' ? 'true' : (action === 'visage' ? 'false' : null),
      'aria-disabled': etatFace === 'off' ? 'true' : null, 'aria-label': aria || null },
    h('span', { class: 'dot', 'aria-hidden': aria ? 'true' : null }, lettre),
    nom ? h('span', { class: 'nom' }, nom) : null,
    legende ? (Array.isArray(legende) ? legende.map(function (l) { return h('span', { class: 'cap' }, l); }) : h('span', { class: 'cap' }, legende)) : null);
    if (params) { Object.keys(params).forEach(function (k) { e.setAttribute('data-' + k, params[k]); }); }
    return e;
  }
  function faces(arr) { return h('div', { class: 'faces' }, arr); }
  function opts(liste, choisi, action, extraGap) {
    return h('div', { class: 'opts', role: 'group' }, liste.map(function (x, i) {
      var v = x.valeur;
      return h('button', { type: 'button', class: 'opt' + (choisi === v ? ' on' : '') + (x.gap ? ' gap' : ''), action: action,
        'data-valeur': String(v), 'aria-pressed': choisi === v ? 'true' : 'false' }, t(x.libelle));
    }));
  }
  function positions(choisie, action) {
    return opts(X.POSITIONS.map(function (l, i) { return { valeur: i + 1, libelle: l }; }), choisie, action);
  }
  function raisons(texte, choisie, action) {
    var l = texte.considerations.map(function (c) { return { valeur: c.rang, libelle: X.raisonFinLigne(c.texte) }; });
    l.push({ valeur: 'aucune', libelle: X.aucuneRaison, gap: true });
    return opts(l, choisie, action);
  }
  function steps(etats) {
    var noms = [X.etapeDeviner, X.etapeRepondre];
    var e = h('div', { class: 'steps' });
    etats.forEach(function (s, i) {
      if (i > 0) { e.appendChild(h('span', { 'aria-hidden': 'true' }, '·')); }
      var mark = s === 'on' ? '●' : (s === 'done' ? '✓' : '○');
      e.appendChild(h('span', { class: s }, noms[i] + ' ' + mark));
    });
    return e;
  }
  function hd(gauche, droite) { return h('div', { class: 'hd' }, gauche, droite || null); }
  function hdTitre(s) { return h('h2', { class: 'hd-titre' }, s); }

  /** Curseur flou (§5.3) : zone de largeur ℓ centrée sur c, rognée au bord, jamais décalée. */
  function zone(c, l, rev) {
    var cc = c.pourDessiner(), ll = l.pourDessiner();
    var g = Math.max(0, cc - ll / 2), d = Math.min(1, cc + ll / 2);
    var e = h('span', { class: 'haze' + (rev ? ' rev' : '') });
    e.style.left = (g * 100) + '%';
    e.style.width = ((d - g) * 100) + '%';
    return e;
  }
  function poles(i) { return h('div', { class: 'poles' }, h('span', null, t(X.T8[i].poles[0])), h('span', null, t(X.T8[i].poles[1]))); }
  var ECARTE = { c: F(1, 2), l: F('0.95') };
  function slider(i, cur) { return h('div', { class: 'slider', role: 'img', 'aria-label': t(X.T8[i].poles[0] + ' ou ' + X.T8[i].poles[1]) }, poles(i), h('div', { class: 'track' }, zone(cur.c, cur.l))); }
  function overlay(i, moi, lui) {
    return h('div', { class: 'slider', role: 'img', 'aria-label': t(X.T8[i].poles[0] + ' ou ' + X.T8[i].poles[1]) }, poles(i), h('div', { class: 'track' }, zone(moi.c, moi.l), zone(lui.c, lui.l, true)));
  }
  function indexT8(code) { for (var i = 0; i < 8; i++) { if (X.T8[i].code === code) { return i; } } return -1; }

  /* ================================================================== */
  /* Écrans du téléphone                                                */
  /* ================================================================== */

  var temp = {}; // choix pas encore validés (jamais gardés : §7.1, §8.8)

  function ecranTel(corps, bas, options) {
    options = options || {};
    var e = h('section', { class: 'tel-ecran' + (options.soir ? ' soir' : ''), 'aria-label': options.aria || null });
    var c = h('div', { class: 'corps' }, corps);
    e.appendChild(c);
    if (bas && bas.length) { e.appendChild(h('div', { class: 'bas' }, bas)); }
    if (options.croix) { e.appendChild(h('button', { type: 'button', class: 'croix', action: 'absent', 'aria-label': 'Fermer' }, '×')); }
    if (options.feuille) { e.appendChild(options.feuille); }
    return e;
  }
  function btn1(s, action, actif, params) {
    var b = h('button', { type: 'button', class: 'btn1', action: action, 'aria-disabled': actif === false ? 'true' : null }, t(s));
    if (params) { Object.keys(params).forEach(function (k) { b.setAttribute('data-' + k, params[k]); }); }
    return b;
  }
  function tabbar(actif) {
    var onglets = [[X.ongletAujourdhui, 'onglet-jour'], [X.ongletCercle, 'onglet-cercle'], [X.ongletMoi, 'onglet-moi']];
    return h('nav', { class: 'tabbar', 'aria-label': 'Onglets' }, onglets.map(function (o, i) {
      return h('button', { type: 'button', class: 'tab' + (i === actif ? ' on' : ''), action: o[1], 'aria-current': i === actif ? 'page' : null }, t(o[0]));
    }));
  }

  /* ---- Entrée ---- */

  function e11() {
    return ecranTel([
      h('div', { class: 'chat-hd' }, t('← ' + X.chatTitre)),
      h('div', { class: 'bubble' }, t(X.chatBulle)),
      h('button', { type: 'button', class: 'preview', action: 'apercu' }, h('b', null, t(X.chatApercuTitre)), h('span', null, t(X.chatApercu)))
    ], null, { aria: 'Message d’Agathe' });
  }

  function numeroE(E) { return +E.charAt(1); }

  function e12(E) {
    var tx = scelle.textes[E];
    return ecranTel([
      band(t(X.bandeDefi(numeroE(E)))), small(t(X.consigneDefi)), label(t(X.etiquetteTexte)), ttl(t(tx.titre)),
      lignes(tx.lignes.map(t)), q(t(X.tonAvis)), positions(temp.position || null, 'entree-position')
    ], [btn1(X.suivant, 'entree-suivant', !!temp.position)]);
  }
  function e13() {
    return ecranTel([
      back(X.consentementRetour, 'consentement-retour'), ttl(t(X.consentementTitre)), p(t(X.consentementTexte)),
      lien(t(X.quiDureeDroits), 'droits')
    ], [btn1(X.jAccepte, 'consentement-accepter')]);
  }
  function e14(E) {
    var tx = scelle.textes[E];
    return ecranTel([
      back(X.changerPosition, 'entree-changer'), band(t(X.bandeDefi(numeroE(E)))),
      small(t(X.rappelAvis(tx.titre, position(temp.position)))), q(t(X.questionRaison)),
      raisons(tx, temp.raison === undefined ? null : temp.raison, 'entree-raison'), small(t(X.definitive))
    ], [btn1(X.valider, 'entree-valider-raison', temp.raison !== undefined && temp.raison !== null)]);
  }
  function e15(E) {
    var tx = scelle.textes[E];
    return ecranTel([
      band(t(X.bandeDefi(numeroE(E)))), faces([dot('A', 'L', 'Agathe')]), big(t(X.etSaReponse)), small(t(tx.titre)),
      positions(temp.pari || null, 'entree-pari')
    ], [btn1(X.voirSaReponse, 'entree-voir', !!temp.pari)]);
  }
  function e16(E) {
    var tx = scelle.textes[E];
    var c = etat.seances[0].coups.entree[E];
    var inv = R().seances[0].entree.textes[E];
    var invRep = inv.inviteuse;
    var raisonInv = invRep.raison === 'aucune' ? X.aucuneDesQuatreRaisons : X.raisonFinLigne(consideration(tx, invRep.raison).texte);
    var voteLigne = (tx.vote.issue === 'sans_vote_ensemble') ? joindre("L'Assemblée : texte ni adopté ni rejeté.", X.articleUnique(dateVote(tx)))
      : joindre("L'Assemblée : texte " + (tx.vote.issue === 'adopte' ? 'adopté' : 'rejeté') + ' le ' + dateVote(tx) + '.', etapeVote(tx));
    var voteT = t(voteLigne);
    var tete = t("L'Assemblée :");
    var sigles = siglesTexte(tx);
    var suite = numeroE(E) < 3 ? X.texteSuivant : X.suivant; // Q-F8
    return ecranTel([
      band(t(X.bandeTexte(numeroE(E)))),
      big(t(inv.juste ? X.tuConnais : X.caAlors)),
      p(t(X.tonPari(position(c.pari)))),
      h('div', { class: 'faces faceline' }, h('div', { class: 'face' }, h('span', { class: 'dot', 'aria-hidden': 'true' }, 'A')),
        h('div', { class: 'p' }, h('b', null, t(X.ligneInviteuse(position(invRep.niveau)))), h('br'), t(raisonInv))),
      rule(),
      h('div', { class: 'p' }, h('b', null, tete), avecSigles(voteT.slice(tete.length), [])),
      h('div', { class: 'p' }, avecSigles(t(proposePar(tx, '1.6')), sigles)),
      c.reponse.raison === 'aucune' ? null : h('div', { class: 'p' }, avecSigles(t(taRaison(tx, c.reponse.raison)), sigles))
    ], [btn1(suite, 'entree-texte-suivant')]);
  }
  function e17() {
    var n = R().seances[0].entree.justes;
    var portrait = R().seances[0].portrait.tensions;
    return ecranTel([
      n >= 2 ? h('div', { class: 'huge' }, t(X.bilanGrand(n))) : big(t(X.bilanSurprises(3 - n))),
      n >= 2 ? p(t(X.bilanLigne(n))) : null,
      rule(), label(t(X.portraitCommence)),
      ['S', 'P', 'L'].map(function (code) { return slider(indexT8(code), portrait[code]); }),
      small(t(X.chaqueReponseLes))
    ], [btn1(X.creerCompte, 'creer-compte')]);
  }
  function e18() {
    var champ = h('input', { class: 'champ', id: 'champ-pseudo', type: 'text', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
      'aria-label': t(X.champPseudo), name: 'pseudo-essai' });
    champ.value = temp.saisie || '';
    var valide = pseudoValide(temp.saisie || '');
    return ecranTel([
      p(t(X.compteTexte)),
      h('label', { class: 'field', for: 'champ-pseudo' }, t(X.champPseudo), champ),
      h('div', { class: 'field' }, t(X.champEmail), h('div', { class: 'dessin' }, X.emailDessine))
    ], [btn1(X.recevoirCode, 'recevoir-code', valide)]);
  }
  function e19() {
    return ecranTel([
      p(t(X.codeEnvoye)),
      h('div', { class: 'code', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6].map(function () { return h('div', { class: 'rempli' }); })),
      absent(t(X.renvoyerCode)), lien(t(X.plusTard), 'code-valider')
    ], [btn1(X.valider, 'code-valider')]);
  }

  /* ---- Pseudo (§7.2, Q-F7) ---- */

  var RE_INVISIBLES = /[\p{Cc}\p{Cf}\p{Cs}]/gu;
  function formaterPseudo(s) {
    s = s.normalize('NFC').replace(RE_INVISIBLES, '').replace(/\s/gu, ' ').replace(/ {2,}/g, ' ');
    s = s.replace(/^ +| +$/g, '');
    return s.normalize('NFC');
  }
  function estPrenom(s) { return PERSOS.some(function (p) { return p.toLowerCase() === s.toLowerCase(); }); }
  function pseudoValide(saisie) {
    var f = formaterPseudo(saisie);
    var n = Array.from(f).length;
    return n >= 1 && n <= 20 && !estPrenom(f);
  }

  /* ---- Aujourd'hui ---- */

  function hdJour() { return hd(hdTitre(t(X.aujourdhui(jourDeSeance(K()))))); }

  function eRepondre() {
    var k = K(), tx = texteDuJour(k);
    var corps = [];
    if (k === 1) {
      corps.push(hdJour(), steps(['off', 'on']), band(t(X.rejoint)), banner(t(X.rienPourLinstant)));
    } else if (!aDesCartes()) {
      corps.push(hdJour(), steps(['strike', 'on']), banner(t(X.rienAujourdhui)));
    } else {
      corps.push(steps(['done', 'on']));
    }
    corps.push(label(t(X.etiquetteTexte)), ttl(t(tx.titre)), lignes(tx.lignes.map(t)), q(t(X.tonAvis)), positions(temp.position || null, 'jour-position'));
    return ecranTel(corps, [btn1(X.suivant, 'jour-suivant-raison', !!temp.position), tabbar(0)]);
  }
  function eRaison() {
    var k = K(), tx = texteDuJour(k);
    return ecranTel([
      back(X.changerPosition, 'jour-changer'), small(t(X.rappelAvis(tx.titre, position(temp.position)))),
      q(t(X.questionRaison)), raisons(tx, temp.raison === undefined ? null : temp.raison, 'jour-raison'), small(t(X.definitive))
    ], [btn1(X.valider, 'jour-valider-raison', temp.raison !== undefined && temp.raison !== null), tabbar(0)]);
  }

  var derniereLecture = null;
  function eAttente() {
    var k = K(), r = R().seances[k];
    var lu = derniereLecture;
    var m = lu.minutesDuJour;
    var reste = 1440 - ((m - 1080 + 1440) % 1440);
    var hh = Math.floor(reste / 60), mm = N.deux(reste % 60);
    var visages = M.visagesDejaJoue(scelle, k, lu.hhmm);
    return ecranTel([
      hdJour(),
      h('div', { class: 'box' }, label(t(X.phraseDuJour)), p(r.phrase_jour.phrase), lien(t(X.voirPortrait), 'voir-portrait')),
      big(t(k === 1 ? X.nouveauTexteDans(hh, mm) : X.revelationDans(hh, mm))),
      visages.length ? small(t(X.dejaJoue)) : null,
      visages.length ? faces(visages.map(function (v) { return dot(v.charAt(0), 'S', v); })) : null
    ], [tabbar(0)]);
  }

  function eDeviner() {
    var k = K(), m = mancheDuJour();
    var tx = texteDuJour(k - 1);
    if (!temp.choix) { temp.choix = m.cartes.map(function () { return { designe: null, raison: null }; }); }
    var ch = temp.choix;
    var poses = ch.map(function (c) { return c.designe; });
    var cartes = m.cartes.map(function (c, i) {
      var rep = m.possibles[c.auteur];
      var choix = ch[i];
      var passee = choix.designe === 'passe';
      var lignesCarte = [h('div', { class: 'ans' }, t(ligneCarte(tx, rep, c.cachee)))];
      if (c.cachee && choix.raison !== null && !passee) {
        lignesCarte.push(h('div', { class: 'why' }, choix.raison === 'aucune' ? t(X.taDevinetteAucune)
          : t(X.taDevinette(X.raisonFinLigne(consideration(tx, choix.raison).texte)))));
      }
      if (c.cachee && !passee) { lignesCarte.push(h('button', { type: 'button', class: 'btn2', action: 'devine-pourquoi', 'data-carte': i }, t(X.devineAussi))); }
      var visages = PERSOS.map(function (pp) {
        var surCette = choix.designe === pp;
        var ailleurs = !surCette && poses.indexOf(pp) >= 0;
        return dot(pp.charAt(0), 'S', pp, null, surCette ? 'on' : (ailleurs ? 'off' : ''), 'visage', { carte: i, membre: pp }, pp);
      });
      return h('div', { class: 'guess' + (passee ? ' passed' : ''), role: 'group', 'aria-label': 'Réponse ' + (i + 1) },
        lignesCarte,
        h('div', { class: 'row' }, faces(visages), h('button', { type: 'button', class: 'link', action: 'passer', 'data-carte': i,
          'aria-pressed': passee ? 'true' : 'false' }, t(passee ? X.passee : X.passer))));
    });
    var pret = ch.every(function (c) { return c.designe !== null; });
    var feuille = null;
    if (temp.feuille === 'relire') { feuille = feuilleRelire(tx); }
    else if (temp.feuille !== undefined && temp.feuille !== null) { feuille = feuilleRaison(tx, temp.feuille); }
    return ecranTel([
      hdJour(), steps(['on', 'off']), label(t(X.CERCLE)),
      h('div', { class: 'small' }, t(X.hier(tx.titre) + ' · '), h('button', { type: 'button', class: 'link en-ligne', action: 'relire' }, t(X.relire))),
      q(t(X.aQui)), cartes
    ], [btn1(X.valider, 'deviner-valider', pret), tabbar(0)], { feuille: feuille });
  }
  function feuille(contenu) {
    return h('div', { class: 'feuille-fond' },
      h('button', { type: 'button', class: 'voile', action: 'feuille-fermer', 'aria-label': t(X.retour) }),
      h('div', { class: 'feuille', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'grab', 'aria-hidden': 'true' }), contenu));
  }
  function feuilleRaison(tx, i) {
    var choisie = temp.raisonFeuille !== undefined ? temp.raisonFeuille : temp.choix[i].raison;
    return feuille([ttl(t(X.feuillePourquoi)), raisons(tx, choisie, 'feuille-raison'),
      btn1(X.choisir, 'feuille-choisir', choisie !== null && choisie !== undefined)]);
  }
  function feuilleRelire(tx) {
    return feuille([label(t(X.etiquetteTexte)), ttl(t(tx.titre)), lignes(tx.lignes.map(t)), back(X.retour, 'feuille-fermer')]);
  }

  /* ---- Message de 18h et révélation ---- */

  function eVerrou() {
    var k = K();
    return ecranTel([h('div', { class: 'lock' },
      h('div', { class: 'small' }, t(jourDeSeance(k))),
      h('div', { class: 'clock' }, X.horlogeVerrou),
      h('button', { type: 'button', class: 'notif', action: 'notification' },
        h('span', { class: 'meta' }, h('i', { 'aria-hidden': 'true' }, X.notifIcone), t(X.notifMeta)),
        h('span', null, t(k === 7 || k === 14 ? X.message18hDimanche : X.message18h))))], null, { aria: 'Écran verrouillé' });
  }

  function eRevelation() {
    var s = seanceCourante(), k = s.k;
    var seq = sequenceRevelation(k);
    var i = Math.min(s.rev.i, seq.length - 1);
    var el = seq[i];
    var dots = h('div', { class: 'dots', 'aria-hidden': 'true' }, seq.map(function (x, j) { return h('i', { class: j <= i ? 'on' : '' }); }));
    var r = R().seances[k];
    var n = String(k - 2), tx = scelle.textes[n];
    var sigles = siglesTexte(tx);
    var corps = [dots], bas = [];
    var suivant = btn1(X.suivant, 'rev-suivant');
    if (el.type === 'carte') {
      var manche = R().seances[k - 1].manches.porteur;
      var c = manche.cartes[el.i];
      var rep = manche.possibles[c.auteur];
      var verdict = r.revelation.devineurs.porteur.verdicts[el.i];
      var retournee = !!s.rev.ret[el.i];
      var pari;
      if (verdict === 'passe') { pari = X.tuAvaisPasse; }
      else if (c.cachee && c.raison_devinee === 'aucune') { pari = X.tonPariAucune(c.designe); }
      else if (c.cachee && c.raison_devinee !== null) { pari = X.tonPariRaison(c.designe, X.raisonDansPhrase(consideration(tx, c.raison_devinee).texte)); }
      else { pari = X.tonPariPrenom(c.designe); }
      var apres = [];
      if (verdict === 'juste_et_raison') { apres.push(big(t(X.tuConnaisRaisons))); }
      else if (verdict === 'juste') { apres.push(big(t(X.tuConnais))); }
      else if (verdict === 'faux') { apres.push(big(t(X.cEtait(c.auteur_compte))), p(t(X.caAlors))); }
      else { apres.push(big(t(X.cEtait(c.auteur_compte)))); }
      if (c.cachee && verdict !== 'juste_et_raison') {
        apres.push(small(t(rep.raison === 'aucune' ? X.saRaisonAucune : X.saRaison(X.raisonFinLigne(consideration(tx, rep.raison).texte)))));
      }
      if (el.i === manche.cartes.length - 1) {
        var dv = r.revelation.devineurs.porteur;
        apres.push(rule(), small(t(X.points(dv.points, dv.points_semaine))));
      }
      var rond = h('div', { class: 'rond' + (retournee ? ' retourne' : '') },
        h('div', { class: 'rond-interieur' },
          h('button', { type: 'button', class: 'rond-face rond-recto', action: retournee ? null : 'retourner', 'aria-label': retournee ? null : t(X.retournerCarte),
            'aria-hidden': retournee ? 'true' : null, tabindex: retournee ? '-1' : null }, '?'),
          h('div', { class: 'rond-face rond-verso', 'aria-hidden': retournee ? null : 'true' }, initiale(c.auteur_compte))));
      corps.push(band(t(X.bandeRevelation(tx.titre))), h('div', { class: 'p' }, h('b', null, t(ligneCarte(tx, rep, c.cachee)))),
        small(t(pari)), h('div', { class: 'faces centre' }, h('div', { class: 'face L' }, rond)),
        h('div', { class: 'apres' + (retournee ? '' : ' cache'), 'aria-hidden': retournee ? null : 'true', 'aria-live': 'polite' }, apres));
      if (!retournee) { suivant.classList.add('reserve'); suivant.setAttribute('aria-hidden', 'true'); suivant.setAttribute('tabindex', '-1'); suivant.removeAttribute('data-action'); }
    } else if (el.type === 'vote') {
      corps.push(band(t(tx.titre)), q(t(X.etLAssemblee)), big(t(X.issue[tx.vote.issue])),
        p(t(tx.vote.issue === 'sans_vote_ensemble' ? X.articleUnique(dateVote(tx)) : joindre('Le ' + dateVote(tx) + '.', etapeVote(tx)))));
    } else if (el.type === 'auteurs') {
      var maRep = etat.seances[+n].coups.reponse;
      corps.push(band(t(tx.titre)), h('div', { class: 'p' }, avecSigles(t(proposePar(tx, '2.7e')), sigles)));
      if (maRep && maRep.raison !== 'aucune') { corps.push(rule(), h('div', { class: 'p' }, avecSigles(t(taRaison(tx, maRep.raison)), sigles))); }
    } else if (el.type === 'badge') {
      var sf = r.dimanche.sans_faute;
      corps.push(label(t(X.badgeRare)), faces(sf.map(function (m) { return dot(initiale(m), 'L'); })),
        big(tp(X.sansFaute(N.listeEt(sf.map(function (m) { return m === 'porteur' ? '{pseudo}' : m; })), sf.length > 1))),
        p(t(X.sansFauteLigne)));
    } else if (el.type === 'devin' || el.type === 'mystere') {
      var tit = r.dimanche[el.type].titulaire;
      var nomT = tit === 'porteur' ? '{pseudo}' : tit;
      corps.push(label(t(X.titresDeLaSemaine)), faces([dot(initiale(tit), 'L')]),
        big(tp(el.type === 'devin' ? X.devin(nomT) : X.mystere(nomT))), p(t(el.type === 'devin' ? X.devinLigne : X.mystereLigne)));
    } else if (el.type === 'fidele') {
      var fs = r.dimanche.fidele.titulaires;
      corps.push(label(t(X.titresDeLaSemaine)), faces(fs.map(function (m) { return dot(initiale(m), 'L', nomMembre(m)); })),
        big(tp(X.fidele(N.listeEt(fs.map(function (m) { return m === 'porteur' ? '{pseudo}' : m; }))))),
        p(t(X.fideleLigne(r.dimanche.semaine, fs.length > 1))));
    } else if (el.type === 'surprise') {
      var ts = scelle.textes[r.dimanche.surprise.texte];
      corps.push(label(t(X.surpriseSemaine)), big(t(ts.titre)), p(t(X.surpriseLigne)), lien(t(X.voirLeTexte), 'fiche', { texte: r.dimanche.surprise.texte }));
    } else if (el.type === 'phrase') {
      var ps = r.dimanche.phrase_semaine;
      corps.push(label(t(X.pourToiSemaine)), big(ps.phrase));
      if (ps.tension) { corps.push(slider(indexT8(ps.tension), R().seances[k - 1].portrait.tensions[ps.tension])); }
    } else if (el.type === 'fin') {
      corps.push(big(t(X.maintenantQuestion)), lien(t(X.texteEtSources), 'fiche', { texte: n }));
      suivant = btn1(X.jouer, 'rev-jouer');
    }
    bas.push(suivant);
    return ecranTel(corps, bas, { soir: true, croix: true, aria: 'Révélation' });
  }

  /* ---- Le Cercle ---- */

  /** Titres de la dernière semaine tombée, par membre (§7.1 : 4.2, 4.3). */
  function titresSemaine() {
    var k = K(), d = null;
    if (k >= 14) { d = R().seances[14].dimanche; } else if (k >= 7) { d = R().seances[7].dimanche; }
    var t2 = {};
    M.MEMBRES.forEach(function (m) { t2[m] = []; });
    if (!d) { return { titres: t2, dimanche: null }; }
    if (d.devin.titulaire) { t2[d.devin.titulaire].push('Le Devin'); }
    if (d.mystere.titulaire) { t2[d.mystere.titulaire].push('Le Mystère'); }
    d.fidele.titulaires.forEach(function (m) { t2[m].push('Le Fidèle'); });
    return { titres: t2, dimanche: d };
  }
  function membresTous() { return PERSOS.concat(['porteur']); }
  function encoreFlou() { return tp(X.encoreFlou(N.listeEt(PERSOS).replace(' et ', ', ') + ' et {pseudo}')); }

  function eCercle() {
    var ts = titresSemaine();
    var visages = membresTous().map(function (m) {
      var legende = ts.titres[m].map(t);
      if (m === 'porteur') { return dot(initiale(m), '', pseudo(), legende); }
      return dot(m.charAt(0), '', m, legende, '', 'proche', { membre: m }, [m].concat(legende).join(', '));
    });
    var corps = [hd(h('button', { type: 'button', class: 'plain hd-gauche', action: 'absent' }, t(X.cercleTete)),
      h('button', { type: 'button', class: 'plain right', action: 'absent' }, t(X.inviter))), faces(visages)];
    if (ts.dimanche && ts.dimanche.surprise.texte) {
      corps.push(h('div', { class: 'box' }, h('div', { class: 'p' }, h('b', null, t(X.surpriseEncadre)), ' ' + t(scelle.textes[ts.dimanche.surprise.texte].titre))));
    }
    corps.push(label(t(X.ouChacun)));
    for (var i = 0; i < 8; i++) {
      corps.push(h('div', { class: 'slider' }, poles(i), h('div', { class: 'track' }), small(encoreFlou())));
    }
    corps.push(lien(t(X.titresPassesLien), 'titres-passes'));
    return ecranTel(corps, [tabbar(1)]);
  }

  function eProche(m) {
    var k = K(), r = R().seances[k];
    var ts = titresSemaine();
    var tit = ts.titres[m];
    var corps = [back(X.leCercle, 'retour'), faces([dot(m.charAt(0), 'L', m, tit.length ? t(X.titreCetteSemaine(N.listeEt(tit))) : null)]),
      small(t('● ' + X.legendeToi) + '   ' + t('◎ ' + m))];
    for (var i = 0; i < 8; i++) {
      var code = X.T8[i].code;
      if (code) { corps.push(overlay(i, r.portrait.tensions[code], r.curseurs_vus[m][code])); }
      else { corps.push(overlay(i, ECARTE, ECARTE)); }
    }
    var sur = r.surprises_proches[m];
    if (sur.length) {
      corps.push(label(t(X.sesSurprises)));
      var montrees = temp.voirTout === m ? sur : sur.slice(0, 2);
      montrees.forEach(function (n) {
        var manche = R().seances[+n + 1].manches.porteur;
        var c = manche.cartes.filter(function (x) { return x.auteur_compte === m; })[0];
        var rep = manche.possibles[c.auteur];
        var tx = scelle.textes[n];
        var raison = rep.raison === 'aucune' ? X.aucuneDesQuatreRaisons : X.raisonFinLigne(consideration(tx, rep.raison).texte);
        corps.push(h('button', { type: 'button', class: 'listrow', action: 'fiche', 'data-texte': n },
          h('span', null, t(X.surpriseLigneTexte(tx.titre, position(rep.niveau), raison))), h('span', null, t(X.tuPensais(c.designe)))));
      });
      if (sur.length > 2 && temp.voirTout !== m) { corps.push(lien(t(X.voirTout), 'voir-tout', { membre: m })); }
    }
    return ecranTel(corps, [tabbar(1)]);
  }

  function semainesTombees() { var k = K(), l = []; if (k >= 14) { l.push(2); } if (k >= 7) { l.push(1); } return l; }

  function eTitresPasses() {
    var corps = [back(X.leCercle, 'retour'), ttl(t(X.titresPassesTitre))];
    var sem = semainesTombees();
    if (!sem.length) { corps.push(p(t(X.pasDeTitreAvant))); }
    sem.forEach(function (w) {
      var d = R().seances[w === 1 ? 7 : 14].dimanche;
      var nom = function (m) { return m === 'porteur' ? '{pseudo}' : m; };
      corps.push(h('div', { class: 'listrow' }, h('span', null, t(X.semaine(w))),
        h('span', null, tp(X.titresPassesLigne(d.devin.titulaire ? nom(d.devin.titulaire) : null, d.mystere.titulaire ? nom(d.mystere.titulaire) : null,
          d.fidele.titulaires.length ? d.fidele.titulaires.map(nom).join(', ') : null)))));
    });
    return ecranTel(corps, [tabbar(1)]);
  }

  /* ---- Moi ---- */

  function enteteMoi(courant) {
    var cibles = ['moi-portrait', 'moi-titres', 'moi-historique'];
    return [hd(hdTitre(t(X.moi)), h('button', { type: 'button', class: 'plain right', action: 'reglages', 'aria-label': t(X.reglagesNom) }, h('span', { class: 'texte-systeme' }, X.reglagesIcone))),
      h('div', { class: 'subtabs' }, X.sousOnglets.map(function (o, i) {
        return i === courant ? h('span', { class: 'on', 'aria-current': 'page' }, t(o)) : h('button', { type: 'button', class: 'plain', action: cibles[i] }, t(o));
      }))];
  }
  function ordreMoi() {
    var r = R().seances[K()];
    return r.portrait.ordre_moi.map(function (c) { return { i: indexT8(c), cur: r.portrait.tensions[c] }; })
      .concat(X.ECARTEES.map(function (i) { return { i: i, cur: ECARTE }; }));
  }
  function eMoiPortrait() {
    return ecranTel(enteteMoi(0).concat(ordreMoi().map(function (x) { return slider(x.i, x.cur); }), [small(t(X.portraitPasForme))]), [tabbar(2)]);
  }
  function eMoiTitres() {
    var corps = enteteMoi(1);
    var sem = semainesTombees(), lignesT = [];
    sem.forEach(function (w) {
      var d = R().seances[w === 1 ? 7 : 14].dimanche, l = [];
      if (d.devin.titulaire === 'porteur') { l.push('Le Devin'); }
      if (d.mystere.titulaire === 'porteur') { l.push('Le Mystère'); }
      if (d.fidele.titulaires.indexOf('porteur') >= 0) { l.push('Le Fidèle'); }
      if (l.length) { lignesT.push(h('div', { class: 'listrow' }, h('span', null, t(X.semaine(w))), h('span', null, t(X.titresMoi(l.join(', ')))))); }
    });
    if (lignesT.length) { corps = corps.concat(lignesT); }
    else { corps.push(p(t(sem.length ? X.pasDeTitreApres : X.pasDeTitreAvant))); }
    return ecranTel(corps, [tabbar(2)]);
  }
  function eMoiHistorique() {
    var corps = enteteMoi(2), k = K();
    for (var n = Math.min(k, 14); n >= 1; n--) {
      var rep = etat.seances[n].coups.reponse;
      if (!rep) { continue; }
      var revele = n + 2 <= k && n <= 13;
      var droite = revele ? position(rep.niveau) : X.historiqueRevele(position(rep.niveau), jourDeSeance(n + 2));
      corps.push(h('button', { type: 'button', class: 'listrow', action: 'fiche', 'data-texte': String(n) },
        h('span', null, t(X.historiqueGauche(jourDeSeance(n), scelle.textes[String(n)].titre))), h('span', null, t(droite))));
    }
    return ecranTel(corps, [tabbar(2)]);
  }

  function eFiche(n, options) {
    options = options || {};
    var tx = scelle.textes[n], k = K();
    var revele = options.texte14 || (+n + 2 <= k && +n <= 13);
    var sigles = siglesTexte(tx);
    var rep = etat.seances[+n] ? etat.seances[+n].coups.reponse : null;
    var corps = [back(X.retour, options.texte14 ? 'absent' : 'retour'), ttl(t(tx.titre))];
    if (revele && !options.texte14) { corps.push(small(t(X.revele(jourDeSeance(+n + 2))))); }
    corps.push(lignes(tx.lignes.map(t)));
    if (rep) {
      var raison = rep.raison === 'aucune' ? X.aucuneDesQuatreRaisons : X.raisonFinLigne(consideration(tx, rep.raison).texte);
      corps.push(h('div', { class: 'p' }, h('b', null, t(X.taReponse)), ' ' + t(position(rep.niveau) + ' · ' + raison)));
    }
    if (!revele) {
      corps.push(p(t(X.voteEtAuteurs(jourDeSeance(+n + 2)))));
      return ecranTel(corps, [tabbar(ongletCourant())]);
    }
    var voteLigne = tx.vote.issue === 'sans_vote_ensemble' ? joindre('Vote : ni adopté ni rejeté.', X.articleUnique(dateVote(tx)))
      : joindre('Vote : ' + (tx.vote.issue === 'adopte' ? 'adopté' : 'rejeté') + ' le ' + dateVote(tx) + '.', etapeVote(tx));
    var vt = t(voteLigne);
    corps.push(h('div', { class: 'p' }, h('b', null, t(X.vote)), avecSigles(vt.slice(t(X.vote).length), [])));
    corps.push(h('div', { class: 'p' }, avecSigles(t(proposePar(tx, '5.4')), sigles)));
    corps.push(label(t(X.quatreRaisons)));
    tx.considerations.forEach(function (c) {
      corps.push(h('div', { class: 'listrow' }, h('span', null, t(X.raisonFinLigne(c.texte))),
        h('span', null, avecSigles(t(c.depute.nom + ', ' + c.depute.groupe), [c.depute.groupe]))));
    });
    if (tx.sources.length === 1) {
      corps.push(h('a', { class: 'link', href: tx.sources[0], target: '_blank', rel: 'noopener noreferrer' }, t(X.sources)));
    } else {
      corps.push(small(t(X.sources)));
      corps.push(h('ul', { class: 'extraits' }, tx.sources.map(function (u, i) {
        return h('li', null, h('a', { class: 'link extrait', href: u, target: '_blank', rel: 'noopener noreferrer' }, t(X.extrait(i + 1))));
      })));
    }
    var bas = [h('a', { class: 'btn1', href: tx.lien_scrutin, target: '_blank', rel: 'noopener noreferrer' }, t(X.voirScrutin))];
    if (!options.texte14) { bas.push(tabbar(ongletCourant())); }
    return ecranTel(corps, bas);
  }

  function eReglages() {
    return ecranTel([
      back(X.moi, 'retour'), ttl(t(X.reglagesTitre)),
      label(t(X.compte)), h('div', { class: 'listrow' }, h('span', null, t(X.champPseudo)), h('span', null, pseudo())),
      h('div', { class: 'listrow' }, h('span', null, t(X.champEmail)), h('span', null, X.emailDessine)),
      label(t(X.cercles)), h('div', { class: 'listrow' }, h('span', null, t(X.CERCLE)), h('button', { type: 'button', class: 'plain', action: 'absent' }, t(X.cerclesActions))),
      label(t(X.message18hTitre)), h('button', { type: 'button', class: 'toggle', action: 'absent', role: 'switch', 'aria-checked': 'true' }, h('span', null, t(X.recevoirMessage)), h('i', { 'aria-hidden': 'true' })),
      label(t(X.tesDonnees)), lien(t(X.quiDureeDroits), 'droits'), rule(), lien(t(X.toutEffacer), 'effacer')
    ], [tabbar(2)]);
  }

  function ongletCourant() {
    var pile = etat.vue.tel.pile;
    var base = pile.length ? pile[0].ecran : etat.vue.tel.ecran;
    if (/^(cercle|proche|titres-passes)$/.test(base)) { return 1; }
    if (/^(moi-|reglages)/.test(base)) { return 2; }
    return 0;
  }

  /** L'écran du téléphone que désigne la vue gardée. */
  function rendreTelephone() {
    var v = etat.vue.tel, e = v.ecran;
    switch (e) {
      case '1.1': return e11();
      case '1.2': return e12(v.E);
      case '1.3': return e13();
      case '1.4': return e14(v.E);
      case '1.5': return e15(v.E);
      case '1.6': return e16(v.E);
      case '1.7': return e17();
      case '1.8': return e18();
      case '1.9': return e19();
      case 'repondre': return eRepondre();
      case 'raison': return eRaison();
      case 'attente': return eAttente();
      case 'deviner': return eDeviner();
      case 'verrou': return eVerrou();
      case 'revelation': return eRevelation();
      case 'cercle': return eCercle();
      case 'proche': return eProche(v.membre);
      case 'titres-passes': return eTitresPasses();
      case 'moi-portrait': return eMoiPortrait();
      case 'moi-titres': return eMoiTitres();
      case 'moi-historique': return eMoiHistorique();
      case 'fiche': return eFiche(v.texte, { texte14: v.texte14 });
      case 'reglages': return eReglages();
    }
    throw new Error('écran inconnu : ' + e);
  }

  /* ================================================================== */
  /* Le cadre : barre, bande, pages (§8.1 à §8.10)                      */
  /* ================================================================== */

  var bande = { note: null, confirmation: false, passage: false, messageCopie: null };

  function libelleJour() {
    if (etat.arret) { return X.barreArret(etat.arret.k); }
    var k = K();
    if (k === 0) { return X.barreEntree; }
    if (k === 15) { return X.barreCloture; }
    return X.barreJour(k, jourDeSeance(k));
  }

  function rendreBarre() {
    var pageCadre = !!etat.vue.cadre;
    var k = K();
    var gauche = h('div', { class: 'barre-gauche' }, h('div', { class: 'barre-jour' }, t(libelleJour())));
    if (!pageCadre && !etat.arret && k <= 14) { gauche.appendChild(h('button', { type: 'button', class: 'barre-arret', action: 'arreter' }, t(X.arreterLEssai))); }
    var droite = (!pageCadre && !etat.arret) ? h('button', { type: 'button', class: 'bouton-cadre barre-qui', action: 'qui-est-qui' }, t(X.quiEstQuiBouton)) : null;
    return h('header', { class: 'barre' }, gauche, droite);
  }

  function noteDurable() {
    if (etat.vue.cadre) { return null; }
    var e = etat.vue.tel.ecran;
    if (e === '1.8') { return estPrenom(formaterPseudo(temp.saisie || '')) && formaterPseudo(temp.saisie || '') ? X.notePrenom : X.noteCompte(appareil); }
    if (K() === 1 && journeeFinie()) { return X.note18h; }
    if (etat.vue.tel.texte14) { return X.noteTexte14; }
    return null;
  }

  function bouton(libelle, action, options) {
    options = options || {};
    return h('button', { type: 'button', class: 'bouton-cadre' + (options.avant ? ' avant' : '') + (options.desactive ? ' desactive' : ''), action: options.desactive ? null : action,
      'aria-disabled': options.desactive ? 'true' : null }, t(libelle));
  }

  function rendreBande() {
    var e = h('div', { class: 'bande' });
    var cadre = etat.vue.cadre;
    var actions = [];
    var note = null;
    if (cadre) {
      if (bande.messageCopie && cadre.page === 'export') { note = bande.messageCopie; }
      actions = actionsPage(cadre);
    } else {
      note = bande.note || noteDurable();
      var k = K();
      if (etat.vue.tel.texte14) { actions = [bouton(X.continuer, 'cloture-apres-14', { avant: true })]; }
      else if (bande.confirmation) {
        var s = seanceCourante();
        var confirmation = h('div', { class: 'note confirmation', role: 'alertdialog', 'aria-live': 'assertive' },
          h('p', { class: 'fort' }, t(X.confirmationQuestion(!mancheValidee(s) || (k >= 2 && aDesCartes() && !mancheValidee(s))))),
          h('p', null, t(X.confirmationPhrase)),
          h('div', { class: 'actions' }, bouton(X.annuler, 'confirmation-annuler'), bouton(X.ouiContinuer, 'confirmation-continuer')));
        e.appendChild(confirmation);
        return e;
      } else if (k >= 1 && k <= 14 && !etat.arret) {
        actions = [bouton(X.jourSuivant, 'jour-suivant', { avant: journeeFinie() })];
      }
    }
    if (note) { e.appendChild(h('div', { class: 'note', role: 'status' }, t(note))); }
    if (actions.length) { e.appendChild(h('div', { class: 'actions' }, actions)); }
    return e;
  }

  function pied(avecSource) {
    return h('footer', { class: 'pied' }, h('p', null, t(X.piedHebergeur)), avecSource ? h('p', null, t(X.piedSource(N.dateLongue(ENTREES.consultes_le)))) : null);
  }
  function panneau() { return h('div', { class: 'panneau' }, Array.prototype.slice.call(arguments)); }
  function titrePage(s) { return h('h1', { class: 'titre-page', tabindex: '-1' }, s); }

  function choix(liste, choisi, action, extra) {
    return h('div', { class: 'choix', role: 'group' }, liste.map(function (x) {
      var on = choisi === x.code;
      var b = h('button', { type: 'button', class: 'bouton-choix' + (on ? ' retenu' : ''), action: action, 'data-valeur': x.code, 'aria-pressed': on ? 'true' : 'false' },
        on ? h('span', { class: 'coche', 'aria-hidden': 'true' }, '✓ ') : null, t(x.libelle));
      if (extra) { Object.keys(extra).forEach(function (k) { b.setAttribute('data-' + k, extra[k]); }); }
      return b;
    }));
  }
  function libelles(ordre, table) { return ordre.map(function (c) { return { code: c, libelle: table[c] }; }); }

  function pageCarnet(cadre) {
    var s = seanceCourante(), k = s.k, c = s.coups.carnet;
    var r = R().seances[k];
    var faux = k === 0 ? ['E1', 'E2', 'E3'].filter(function (e) { return r.entree.textes[e].juste === false; }).length
      : (r.mesures.revelation_verdicts ? r.mesures.revelation_verdicts.filter(function (v) { return v === 'faux'; }).length : 0);
    var contenu = [titrePage(t(X.carnetTitre))];
    if (faux >= 1) {
      var o1 = X.ordreQ1.filter(function (x) { return x !== 'les_deux' || faux >= 2; });
      contenu.push(panneau(h('p', { class: 'fort' }, t(X.q1)), choix(libelles(o1, X.choixQ1), c.q1, 'carnet-q', { q: 'q1' })));
    }
    if (k !== 15 && (k === 0 || (s.etapes && s.etapes.repondre))) {
      contenu.push(panneau(h('p', { class: 'fort' }, t(k === 0 ? X.q2Entree : X.q2(texteDuJour(k).titre))), choix(libelles(X.ordreQ2, X.choixQ2), c.q2, 'carnet-q', { q: 'q2' })));
    }
    if (k !== 15) {
      var o3 = M.choixQ3(k, s.etapes);
      contenu.push(panneau(h('p', { class: 'fort' }, t(X.q3)), choix(libelles(o3, X.choixQ3), c.q3, 'carnet-q', { q: 'q3' })));
    }
    contenu.push(pied(true));
    return contenu;
  }

  function pageMessage0() {
    var m = X.message0(appareil);
    return [panneau(h('h1', { class: 'titre-page', tabindex: '-1' }, t(m[0])), h('p', null, t(m[1])), h('ul', null, m[2].map(function (x) { return h('li', null, t(x)); }))), pied(true)];
  }
  function pageQuiEstQui() {
    var cartes = PERSOS.map(function (pp) {
      var f = scelle.personnages[pp];
      return panneau(h('p', null, h('strong', null, pp), t(X.ficheTete('', f.age, f.metier, f.ville).slice(0))),
        h('p', null, t(f.ligne_de_vie + ' ' + X.ficheHeure(N.heureEcrite(f.heure_de_jeu)) + (pp === scelle.cercle.inviteuse ? ' ' + X.ficheInviteuse : ''))));
    });
    return [titrePage(t(X.quiEstQuiTitre)), h('p', null, t(X.quiEstQuiEntete))].concat(cartes, [pied(true)]);
  }
  function pageDroits() {
    return [titrePage(t(X.droitsTitre)), panneau(X.droits(appareil).map(function (x) { return h('p', null, t(x)); })), pied(true)];
  }
  function pageArretConfirmation() {
    return [titrePage(t(X.arretConfirmationTitre)), h('p', null, t(X.arretConfirmation)), pied(true)];
  }
  function pageArretQuestions() {
    var a = etat.arret;
    var contenu = [titrePage(t(X.arretTete(a.k))), panneau(h('p', { class: 'fort' }, t(X.arretRaison)), choix(libelles(X.ordreArret, X.choixArret), a.raison, 'arret-raison'))];
    if (a.k >= 3) { contenu.push(panneau(h('p', { class: 'fort' }, t(X.f2Arret)), choix(libelles(X.ordreF2, X.choixF2), a.f2, 'f2'))); }
    contenu.push(pied(true));
    return contenu;
  }
  function grilleF1(f1) {
    return PERSOS.map(function (pp) {
      var lignesF = ['S', 'P', 'T', 'L'].map(function (code) {
        var poleL = X.T8[indexT8(code)].poles;
        var v = f1 ? f1[pp][code] : null;
        var rond = function (val, aria) {
          var on = v === val;
          return h('button', { type: 'button', class: 'rond-f1' + (on ? ' on' : ''), action: 'f1', 'data-membre': pp, 'data-tension': code, 'data-valeur': val,
            role: 'radio', 'aria-checked': on ? 'true' : 'false', 'aria-label': t(pp + ' : ' + aria) }, on ? '●' : '○');
        };
        return h('div', { class: 'ligne-f1', role: 'radiogroup', 'aria-label': t(pp + ' : ' + poleL[0] + ' ou ' + poleL[1]) },
          h('span', { class: 'pole-g' }, t(poleL[0])), h('span', { class: 'pole-d' }, t(poleL[1])),
          h('span', { class: 'ronds' }, rond('pole0', poleL[0]), rond('milieu', X.auMilieu), rond('pole1', poleL[1])));
      });
      return panneau(h('p', { class: 'fort' }, pp), h('div', { class: 'au-milieu', 'aria-hidden': 'true' }, t(X.auMilieu)), lignesF);
    });
  }
  function pageF1(enTete, f1) {
    return [titrePage(t(enTete[0]))].concat(enTete.slice(1).map(function (x) { return h('p', null, t(x)); }), grilleF1(f1), [pied(true)]);
  }
  function pageClotureF2() {
    return [titrePage(t(X.clotureTete)), panneau(h('p', { class: 'fort' }, t(X.f2Fin)), choix(libelles(X.ordreF2, X.choixF2), etat.fin.f2, 'f2')), pied(true)];
  }
  function pageExport(cadre) {
    var texte = texteCarnetExport(cadre);
    return [h('pre', { class: 'carnet', id: 'zone-carnet', tabindex: '-1', 'aria-label': 'Carnet de l’essai Elenchos' }, texte), pied(true)];
  }
  function pageEffacer(cadre) {
    var apres = cadre.apres;
    return [titrePage(t(X.effacerTitre)), h('p', null, t(apres ? X.effacerApres : X.effacerPendant)), pied(true)];
  }

  function actionsPage(cadre) {
    switch (cadre.page) {
      case 'message0': return [bouton(X.continuer, 'message0-continuer', { avant: true })];
      case 'quiestqui': case 'droits': return [bouton(X.fermer, 'fermer-page')];
      case 'carnet':
        if (K() === 15) { return [bouton(X.continuer, 'cloture-apres-q1', { avant: true })]; }
        return [bouton(X.annuler, 'carnet-annuler'), bouton(X.allerJourSuivant, 'aller-jour-suivant', { avant: true, desactive: bande.passage })];
      case 'arret-confirmation': return [bouton(X.annuler, 'fermer-page'), bouton(X.arreterLEssai, 'arret-confirmer')];
      case 'arret-questions': return [bouton(X.continuer, 'arret-continuer', { avant: true })];
      case 'arret-f1': return [bouton(X.continuer, 'f1-continuer', { avant: true }), bouton(X.sauterQuestion, 'f1-sauter')];
      case 'cloture-f2': return [bouton(X.continuer, 'cloture-f2-continuer', { avant: true })];
      case 'cloture-f1': return [bouton(X.continuer, 'f1-continuer', { avant: true })];
      case 'export':
        if (cadre.copie) { return [bouton(X.copierCarnet, 'copier-carnet', { avant: true }), bouton(X.fermer, 'export-fermer')]; }
        return [bouton(X.copierCarnet, 'copier-carnet', { avant: true }), bouton(X.voirDevoilement, 'voir-devoilement')];
      case 'devoilement': return [bouton(X.toutEffacer, 'effacer')];
      case 'effacer': return [bouton(X.annuler, 'fermer-page', { avant: true }), bouton(X.copierCarnetDabord, 'copier-dabord'), bouton(X.toutEffacer, 'effacer-confirmer')];
    }
    return [];
  }

  function rendrePageCadre() {
    var c = etat.vue.cadre;
    var contenu;
    switch (c.page) {
      case 'message0': contenu = pageMessage0(); break;
      case 'quiestqui': contenu = pageQuiEstQui(); break;
      case 'droits': contenu = pageDroits(); break;
      case 'carnet': contenu = pageCarnet(c); break;
      case 'arret-confirmation': contenu = pageArretConfirmation(); break;
      case 'arret-questions': contenu = pageArretQuestions(); break;
      case 'arret-f1': contenu = pageF1(X.f1Arret, etat.arret.f1); break;
      case 'cloture-f2': contenu = pageClotureF2(); break;
      case 'cloture-f1': contenu = pageF1(X.f1Fin, etat.fin.f1); break;
      case 'export': contenu = pageExport(c); break;
      case 'devoilement': contenu = pageDevoilement(); break;
      case 'effacer': contenu = pageEffacer(c); break;
      default: throw new Error('page inconnue : ' + c.page);
    }
    return h('div', { class: 'page-cadre', role: 'region' }, contenu);
  }

  /* ---- Carnet exporté (§8.7, §8.12) ---- */

  function dureesToutes(maintenant) { return etat.seances.map(function (s) { return dureesSeance(s, maintenant); }); }

  function texteCarnetExport(cadre) {
    if (cadre.copie) { return cadre.copie.texte; }
    var j = journal();
    var statut = etat.fin ? { type: 'fin' } : { type: 'arret' };
    return M.carnet(scelle, j, R(), dureesToutes(null), statut);
  }

  /* ---- Dévoilement (devoilement.md) ---- */

  function pageDevoilement() {
    var f1 = etat.fin ? etat.fin.f1 : (etat.arret ? etat.arret.f1 : null);
    var corrige = M.corrigeF1(scelle);
    var contenu = [titrePage(t(X.devoilementTitre))];
    var ouv = [h('p', null, t(X.devoilementOuverture))];
    if (f1) { ouv.push(h('p', null, t(X.devoilementF1(M.casesJustes(f1, corrige))))); }
    contenu.push(panneau(ouv));
    var nb = scelle.reponses_atypiques.Agathe.length;
    contenu.push(panneau(h('h2', { class: 'fort' }, t(X.commentLire)), h('p', null, t(X.commentLire1)), h('p', null, t(X.commentLire2(X.nombresEnLettres[nb]))), h('p', null, t(X.commentLire3))));
    PERSOS.forEach(function (pp) {
      var f = scelle.personnages[pp];
      var bloc2 = [h('h2', { class: 'fort' }, t(pp + ', ' + f.age + ' ans · ' + f.metier + ', ' + f.ville)), h('p', null, t(X.phraseProfil[pp]))];
      ['S', 'P', 'T', 'L'].forEach(function (code) {
        var pl = X.T8[indexT8(code)].poles, pr = f.profil[code];
        var lecture = corrige[pp][code] === 'milieu' ? X.auMilieuMin : (corrige[pp][code] === 'pole1' ? pl[1] : pl[0]);
        var ligne = X.ligneProfil(pl[0], pl[1], lecture, pr.position, pr.fermete);
        if (f1) {
          var v = f1[pp][code];
          var vous = v === null ? X.vousPasDeChoix : (v === corrige[pp][code] ? X.vousJuste : X.vousChoix(v === 'milieu' ? X.auMilieuMin : (v === 'pole1' ? pl[1] : pl[0])));
          ligne += ' ' + vous;
        }
        bloc2.push(h('p', null, t(ligne)));
      });
      bloc2.push(h('p', { class: 'fort' }, t(X.reponsesContre)));
      scelle.reponses_atypiques[pp].forEach(function (a) {
        var tx = scelle.textes[a.texte], rep = scelle.reponses[a.texte][pp];
        var raison = rep.raison === 'aucune' ? X.aucuneDesQuatreRaisons : X.raisonFinLigne(consideration(tx, rep.raison).texte);
        var extra = [];
        if (a.cote_tire !== null) { extra.push(X.profilNeutre); }
        var sn = +a.texte + 1;
        if (sn <= K() && sn <= 14) {
          var mp = R().seances[sn].manches && R().seances[sn].manches.porteur;
          if (mp && mp.places.indexOf(pp) >= 0) { extra.push(X.aDeviner(sn)); }
        }
        bloc2.push(h('div', { class: 'atypique' }, h('p', null, t(X.jourTitre(a.texte, tx.titre))), h('p', null, t(position(rep.niveau) + ' · ' + raison)),
          extra.length ? h('p', null, t(extra.join(' '))) : null));
      });
      var abs = scelle.absences[pp];
      bloc2.push(h('p', null, t(abs.length ? X.joursSansJouer(N.listeEt(abs)) : X.joursSansJouerAucun)));
      contenu.push(h('section', { class: 'panneau', 'aria-label': pp }, bloc2));
    });
    var groupes = empreinte.match(/.{4}/g);
    var lignesEmp = [0, 1, 2, 3].map(function (i) { return groupes.slice(4 * i, 4 * i + 4).join(' '); }).join('\n');
    contenu.push(h('details', { class: 'panneau controle' }, h('summary', null, t(X.pourLeControle)),
      h('p', null, t(X.graine)), h('pre', { class: 'code-brut' }, scelle.graine),
      h('p', null, t(X.fichierScelle)), h('pre', { class: 'code-brut scelle' }, texteScelle),
      h('p', null, t(X.empreinteDe)), h('pre', { class: 'code-brut empreinte' }, lignesEmp),
      h('p', null, t(X.comparez(N.dateLongue(ENTREES.empreinte_publiee_le), N.heureEcrite(ENTREES.empreinte_publiee_a))))));
    contenu.push(panneau(h('p', null, t(X.devoilementFin)), h('p', null, t(X.effacerInvite))));
    contenu.push(pied(true));
    return contenu;
  }

  /* ================================================================== */
  /* Vues seules : arrêts techniques, écrans hors de l'icône, couché    */
  /* ================================================================== */

  var racine = null, vueSeule = null, vueCouchee = null;

  function montrerVueSeule(contenu, avecPied) {
    var secours = document.getElementById('vue-secours');
    if (secours) { secours.hidden = true; }
    if (racine) { racine.hidden = true; }
    vueSeule = document.getElementById('vue-seule') || document.body.appendChild(h('main', { id: 'vue-seule', class: 'vue-seule' }));
    vider(vueSeule);
    ajouter(vueSeule, contenu);
    if (avecPied) { vueSeule.appendChild(pied(false)); }
    vueSeule.hidden = false;
  }

  function arreter1(v) {
    arretTechnique = true;
    var lisible = false;
    try { lisible = lireEtat() !== null; } catch (e) { lisible = false; }
    montrerVueSeule([h('h1', null, t(X.arretVerifTitre)), h('p', null, t(X.arretVerif)), lisible ? h('p', null, t(X.arretVerifGardee(appareil))) : null,
      h('p', null, t(X.arretVerifRepere[0].replace(/ $/, '')), ' ', h('strong', { class: 'repere' }, v), t(X.arretVerifRepere[1]))]);
  }
  function arreter2() {
    arretTechnique = true;
    montrerVueSeule([h('h1', null, t(X.arretStockageTitre)), h('p', null, t(X.arretStockage(appareil)))]);
  }
  function arreter3() {
    arretTechnique = true;
    montrerVueSeule([h('h1', null, t(X.arretDoubleTitre)), h('p', null, t(X.arretDouble)),
      h('button', { type: 'button', class: 'bouton-cadre avant', action: 'recharger' }, t(X.reprendreIci)), h('p', { class: 'petit' }, t(X.arretDoublePetit))]);
  }

  /* ---- Écrans hors de l'icône (§8.13) : règles 1 à 3 du §7.8 ---- */

  function t3(s) { return N.typographier13(s); }
  function blocAdresse() { return h('p', { class: 'adresse' }, X.adresse); }

  function diagnostic() {
    return ['Diagnostic de l’essai', 'Version de la page : ' + VERSION, 'Résultat : essai non lancé, page ouverte dans un onglet',
      'Site : ' + location.origin, 'Page : ' + (dansCadre ? 'dans un cadre' : 'seule'),
      'Ouverte depuis : ' + (standalone ? 'l’icône de l’écran d’accueil' : 'un onglet du navigateur'),
      'Écran tactile : ' + (tactile ? 'oui' : 'non'), 'Navigateur : ' + ua, '', 'Fin du diagnostic'].join('\n');
  }

  function ecranHors(type) {
    var c = [];
    if (type === 'ailleurs') {
      c.push(h('h1', null, t3(X.ailleursTitre)), h('p', null, t3(X.ailleursDessous)), h('p', null, t3(X.ailleursAdresse)), blocAdresse());
    } else {
      c.push(h('h1', null, t3(X.ongletTitre)), h('p', null, t3(type === 'onglet' ? X.ongletDessous : X.autreDessous)), h('div', { class: 'panneau' }, h('p', null, t3(X.pourYAller))));
      var plie = [h('summary', null, t3(X.pasDIcone)), h('p', null, t3(X.dejaCommence))];
      if (type === 'onglet') {
        plie.push(h('p', null, t3(X.pasEncore)), h('ol', null, X.etapesAjout.map(function (x) { return h('li', null, t3(x)); })), h('p', null, t3(X.pasDeSurEcran)));
      } else {
        plie.push(h('p', null, t3(X.pasEncoreAutre)));
      }
      plie.push(blocAdresse(), h('button', { type: 'button', class: 'bouton-cadre', action: 'copier-adresse' }, t3(X.copierAdresse)), h('p', { class: 'note message-copie', role: 'status', hidden: true }));
      c.push(h('details', { class: 'panneau' }, plie));
      if (type === 'onglet') {
        c.push(h('details', { class: 'panneau' }, h('summary', null, t3(X.iconeOnglet)), h('p', null, t3(X.iconeOngletTexte)),
          h('pre', { class: 'code-brut', id: 'diagnostic' }, diagnostic()),
          h('button', { type: 'button', class: 'bouton-cadre', action: 'copier-lignes' }, t3(X.copierLignes)), h('p', { class: 'note message-copie', role: 'status', hidden: true })));
      }
    }
    montrerVueSeule(c, true);
  }

  /* ================================================================== */
  /* Rendu                                                              */
  /* ================================================================== */

  var milieuTel = null, milieuCadre = null, barreEl = null, bandeEl = null;
  var pageAffichee = null; // page du cadre à l'écran (pour garder ou remettre son défilement)
  function cleDePage(c) { return c.page + (c.copie ? ':copie' : '') + (c.apres ? ':apres' : ''); }

  function rendre(options) {
    options = options || {};
    if (arretTechnique || efface) { return; }
    var nouvelleBarre = rendreBarre();
    racine.replaceChild(nouvelleBarre, barreEl); barreEl = nouvelleBarre;
    if (etat.vue.cadre) {
      var memePage = pageAffichee === cleDePage(etat.vue.cadre);
      var defileCadre = memePage ? milieuCadre.scrollTop : 0;
      vider(milieuCadre);
      milieuCadre.appendChild(rendrePageCadre());
      milieuCadre.hidden = false;
      milieuTel.hidden = true;
      milieuCadre.scrollTop = defileCadre; // une autre page commence en haut ; la même garde sa place
      pageAffichee = cleDePage(etat.vue.cadre);
      if (options.focus !== false) { var ti = milieuCadre.querySelector('.titre-page, #zone-carnet'); if (ti) { try { ti.focus({ preventScroll: true }); } catch (e) { ti.focus(); } } }
    } else {
      pageAffichee = null;
      milieuCadre.hidden = true;
      milieuTel.hidden = false;
      if (options.telephone !== false) {
        var defile = options.garderDefilement ? (milieuTel.querySelector('.corps') || {}).scrollTop : 0;
        vider(milieuTel);
        milieuTel.appendChild(rendreTelephone());
        if (defile) { milieuTel.querySelector('.corps').scrollTop = defile; }
      }
    }
    var nouvelleBande = rendreBande();
    racine.replaceChild(nouvelleBande, bandeEl); bandeEl = nouvelleBande;
  }

  function construireRacine() {
    var secours = document.getElementById('vue-secours');
    racine = h('div', { id: 'app', class: 'app' });
    barreEl = h('header'); bandeEl = h('div');
    var milieu = h('div', { class: 'milieu' });
    milieuTel = h('div', { class: 'telephone' });
    milieuCadre = h('div', { class: 'cadre-milieu', hidden: true });
    milieu.appendChild(milieuTel); milieu.appendChild(milieuCadre);
    racine.appendChild(barreEl); racine.appendChild(milieu); racine.appendChild(bandeEl);
    document.body.appendChild(racine);
    vueCouchee = h('main', { class: 'vue-couchee', 'aria-hidden': 'false' }, h('h1', null, t(X.coucheTitre(appareil))), h('p', null, t(X.couche)));
    document.body.appendChild(vueCouchee);
    if (secours) { secours.hidden = true; }
  }

  /* ================================================================== */
  /* Navigation et coups                                                */
  /* ================================================================== */

  /** Affiche un écran du téléphone, avec ses effets (étapes vues, durées, lecture de l'heure). */
  function allerA(ecran, params, empiler) {
    var v = etat.vue.tel;
    if (empiler) { v.pile.push(copieVue(v)); }
    else if (empiler === false) { v.pile = []; }
    var nv = { ecran: ecran, pile: v.pile };
    if (params) { Object.keys(params).forEach(function (k) { nv[k] = params[k]; }); }
    etat.vue.tel = nv;
    effetsAffichage();
  }
  function copieVue(v) { var c = {}; Object.keys(v).forEach(function (k) { if (k !== 'pile') { c[k] = v[k]; } }); return c; }

  function effetsAffichage() {
    var s = seanceCourante(), e = etat.vue.tel.ecran;
    if (etat.vue.cadre) { return; }
    if (e === 'deviner' && s.etapes && !s.etapes.deviner && aDesCartes()) {
      s.etapes.deviner = true; s.pp.devDebut = ppMaintenant(); s.pp.devDernier = s.pp.devDebut;
    }
    if (e === 'repondre' && s.etapes && !s.etapes.repondre) {
      s.etapes.repondre = true; s.pp.repDebut = ppMaintenant();
    }
    if (e === 'attente') { lireEnAttendant(); }
  }

  var lectures = []; // relevées pour le point d'accès (bloc témoin), jamais gardées (§8.8)
  function lireEnAttendant() {
    derniereLecture = lireHeure();
    var k = K();
    var visages = M.visagesDejaJoue(scelle, k, derniereLecture.hhmm);
    var detail = { seance: k, heure: derniereLecture.hhmm, visages: visages.slice() };
    lectures.push(detail);
    try { window.dispatchEvent(new CustomEvent('elenchos-essai:lecture', { detail: JSON.parse(JSON.stringify(detail)) })); } catch (e) { /* rien */ }
  }

  function allerAuJour(empiler) { allerA(ecranDuJour(), null, empiler === undefined ? false : empiler); }

  /* ---- Toucher compté (§0, §8.4) ---- */

  function couche() { return window.matchMedia && window.matchMedia('(max-height: 499px) and (orientation: landscape)').matches; }

  function toucherCompte(cible) {
    if (!etat || efface || arretTechnique) { return; }
    if (couche()) { return; }
    var s = seanceCourante();
    var pp = ppMaintenant();
    if (s.pp.fige !== null) { return; }
    if (s.ouverture === null) {
      s.ouverture = lireHeure().instant;
      s.pp.ouverture = pp;
    }
    if (s.versions.length === 0 || s.versions[s.versions.length - 1] !== VERSION) { s.versions.push(VERSION); }
    s.pp.dernier = pp;
    var action = cible && cible.closest && cible.closest('[data-action]') ? cible.closest('[data-action]').getAttribute('data-action') : null;
    if (!etat.vue.cadre && etat.vue.tel.ecran === 'deviner' && s.pp.devDebut !== null && !mancheValidee(s)) { s.pp.devDernier = pp; }
    if (action === 'confirmation-continuer') {
      if (s.etapes && s.etapes.repondre && s.coups.reponse === null) { s.pp.repContinuer = pp; }
    }
    ecrire();
  }

  /* ---- Actions ---- */

  var A = {};

  A['absent'] = function () { bande.note = X.pasDansLEssai; rendre({ telephone: false }); };
  A['qui-est-qui'] = function () { etat.vue.cadre = { page: 'quiestqui' }; ecrire(); rendre(); };
  A['droits'] = function () { etat.vue.cadre = { page: 'droits' }; ecrire(); rendre(); };
  A['fermer-page'] = function () { etat.vue.cadre = etat.vue.cadreSous || null; delete etat.vue.cadreSous; ecrire(); rendreRetourTelephone(); };
  A['recharger'] = function () { location.reload(); };

  function rendreRetourTelephone() {
    if (!etat.vue.cadre && etat.vue.tel.ecran === 'attente') { effetsAffichage(); rendre(); return; }
    rendre({ telephone: milieuTel.firstChild ? false : true });
  }

  A['message0-continuer'] = function () { etat.vue.cadre = { page: 'quiestqui' }; ecrire(); rendre(); };

  /* Entrée */
  function texteEntreeCourant() {
    var e = etat.seances[0].coups.entree;
    if (!e.E1.pari) { return 'E1'; } if (!e.E2.pari) { return 'E2'; } return 'E3';
  }
  A['apercu'] = function () { temp = {}; allerA('1.2', { E: texteEntreeCourant() }); ecrire(); rendre(); };
  A['entree-position'] = function (b) {
    temp.position = +b.getAttribute('data-valeur');
    if (etat.seances[0].coups.consentement !== true) { allerA('1.3', { E: etat.vue.tel.E }); ecrire(); }
    rendre();
  };
  A['consentement-retour'] = function () { temp.position = null; allerA('1.2', { E: etat.vue.tel.E }); ecrire(); rendre(); };
  A['consentement-accepter'] = function () { etat.seances[0].coups.consentement = true; allerA('1.2', { E: etat.vue.tel.E }); ecrire(); rendre(); };
  A['entree-suivant'] = function () { if (!temp.position) { return; } temp.raison = null; allerA('1.4', { E: etat.vue.tel.E }); ecrire(); rendre(); };
  A['entree-changer'] = function () { allerA('1.2', { E: etat.vue.tel.E }); ecrire(); rendre(); };
  A['entree-raison'] = function (b) { var v = b.getAttribute('data-valeur'); temp.raison = v === 'aucune' ? 'aucune' : +v; rendre({ garderDefilement: true }); };
  A['entree-valider-raison'] = function () {
    if (temp.raison === null || temp.raison === undefined) { return; }
    var E = etat.vue.tel.E;
    etat.seances[0].coups.entree[E].reponse = { niveau: temp.position, raison: temp.raison };
    temp = {}; allerA('1.5', { E: E }); ecrire(); rendre();
  };
  A['entree-pari'] = function (b) { temp.pari = +b.getAttribute('data-valeur'); rendre({ garderDefilement: true }); };
  A['entree-voir'] = function () {
    if (!temp.pari) { return; }
    var E = etat.vue.tel.E;
    etat.seances[0].coups.entree[E].pari = temp.pari;
    temp = {}; allerA('1.6', { E: E }); ecrire(); rendre();
  };
  A['entree-texte-suivant'] = function () {
    var E = etat.vue.tel.E;
    temp = {};
    if (E === 'E3') { allerA('1.7'); } else { allerA('1.2', { E: E === 'E1' ? 'E2' : 'E3' }); }
    ecrire(); rendre();
  };
  A['creer-compte'] = function () { temp = { saisie: '' }; allerA('1.8'); ecrire(); rendre(); };
  A['recevoir-code'] = function () {
    if (!pseudoValide(temp.saisie || '')) { return; }
    etat.seances[0].coups.pseudo = formaterPseudo(temp.saisie);
    temp = {}; allerA('1.9'); ecrire(); rendre();
  };
  A['code-valider'] = function () {
    etat.seances[0].entreeFinie = true;
    etat.vue.cadre = { page: 'carnet' };
    ecrire(); rendre();
  };

  /* Jour */
  A['jour-position'] = function (b) { temp.position = +b.getAttribute('data-valeur'); rendre({ garderDefilement: true }); };
  A['jour-suivant-raison'] = function () { if (!temp.position) { return; } temp.raison = null; allerA('raison'); ecrire(); rendre(); };
  A['jour-changer'] = function () { allerA('repondre'); ecrire(); rendre(); };
  A['jour-raison'] = function (b) { var v = b.getAttribute('data-valeur'); temp.raison = v === 'aucune' ? 'aucune' : +v; rendre({ garderDefilement: true }); };
  A['jour-valider-raison'] = function () {
    if (temp.raison === null || temp.raison === undefined) { return; }
    var s = seanceCourante();
    s.coups.reponse = { niveau: temp.position, raison: temp.raison };
    if (s.pp.repFin === null) { s.pp.repFin = ppMaintenant(); }
    temp = {}; allerA('attente', null, false); ecrire(); rendre();
  };

  /* Deviner (§7.1, gestes) */
  A['visage'] = function (b) {
    var i = +b.getAttribute('data-carte'), m = b.getAttribute('data-membre');
    var ch = temp.choix;
    if (ch.some(function (c, j) { return j !== i && c.designe === m; })) { return; } // grisé : ne réagit pas
    if (ch[i].designe === m) { ch[i].designe = null; }
    else { ch[i].designe = m; }
    rendre({ garderDefilement: true });
  };
  A['passer'] = function (b) {
    var i = +b.getAttribute('data-carte'), c = temp.choix[i];
    if (c.designe === 'passe') { c.designe = null; }
    else { c.designe = 'passe'; c.raison = null; }
    rendre({ garderDefilement: true });
  };
  A['devine-pourquoi'] = function (b) { temp.feuille = +b.getAttribute('data-carte'); delete temp.raisonFeuille; rendre({ garderDefilement: true }); };
  A['feuille-raison'] = function (b) { var v = b.getAttribute('data-valeur'); temp.raisonFeuille = v === 'aucune' ? 'aucune' : +v; rendre({ garderDefilement: true }); };
  A['feuille-choisir'] = function () {
    if (temp.raisonFeuille === undefined || temp.raisonFeuille === null) { return; }
    temp.choix[temp.feuille].raison = temp.raisonFeuille;
    temp.feuille = null; delete temp.raisonFeuille; rendre({ garderDefilement: true });
  };
  A['feuille-fermer'] = function () { temp.feuille = null; delete temp.raisonFeuille; rendre({ garderDefilement: true }); };
  A['relire'] = function () { var s = seanceCourante(); s.coups.relire += 1; temp.feuille = 'relire'; ecrire(); rendre({ garderDefilement: true }); };
  A['deviner-valider'] = function () {
    var ch = temp.choix;
    if (!ch.every(function (c) { return c.designe !== null; })) { return; }
    var m = mancheDuJour(), s = seanceCourante();
    s.coups.deviner = ch.map(function (c, i) {
      return { designe: c.designe, raison: m.cartes[i].cachee && c.designe !== 'passe' ? c.raison : null };
    });
    temp = {};
    allerA('repondre', null, false); ecrire(); rendre();
  };

  /* Message de 18h et révélation */
  A['notification'] = function () { var s = seanceCourante(); s.rev.commencee = true; allerA('revelation', null, false); ecrire(); rendre(); };
  A['retourner'] = function () {
    var s = seanceCourante(); var seq = sequenceRevelation(s.k); var el = seq[s.rev.i];
    if (el.type !== 'carte') { return; }
    s.rev.ret[el.i] = true; ecrire();
    var reduire = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rond = milieuTel.querySelector('.rond');
    if (rond && !reduire) {
      rond.classList.add('bascule');
      window.setTimeout(function () { rendre({ garderDefilement: true }); var b = milieuTel.querySelector('.apres'); if (b) { b.setAttribute('tabindex', '-1'); } }, 450);
    } else { rendre({ garderDefilement: true }); }
  };
  A['rev-suivant'] = function () {
    var s = seanceCourante(); var seq = sequenceRevelation(s.k);
    if (s.rev.i < seq.length - 1) { s.rev.i += 1; ecrire(); rendre(); return; }
    // dernière carte de la clôture (§7.4) : question 1, puis fiche du texte 14
    s.rev.fin = true; ecrire(); apresRevelationCloture();
  };
  A['rev-jouer'] = function () { var s = seanceCourante(); s.rev.fin = true; temp = {}; allerAuJour(false); ecrire(); rendre(); };

  /* Onglets et fiches */
  A['onglet-jour'] = function () { temp.voirTout = null; allerAuJour(false); ecrire(); rendre(); };
  A['onglet-cercle'] = function () { allerA('cercle', null, false); ecrire(); rendre(); };
  A['onglet-moi'] = function () { allerA('moi-portrait', null, false); ecrire(); rendre(); };
  A['moi-portrait'] = A['onglet-moi'];
  A['moi-titres'] = function () { allerA('moi-titres', null, false); ecrire(); rendre(); };
  A['moi-historique'] = function () { allerA('moi-historique', null, false); ecrire(); rendre(); };
  A['voir-portrait'] = A['onglet-moi'];
  A['reglages'] = function () { allerA('reglages', null, true); ecrire(); rendre(); };
  A['proche'] = function (b) { allerA('proche', { membre: b.getAttribute('data-membre') }, true); ecrire(); rendre(); };
  A['voir-tout'] = function (b) { temp.voirTout = b.getAttribute('data-membre'); rendre({ garderDefilement: true }); };
  A['titres-passes'] = function () { allerA('titres-passes', null, true); ecrire(); rendre(); };
  A['fiche'] = function (b) { allerA('fiche', { texte: b.getAttribute('data-texte') }, true); ecrire(); rendre(); };
  A['retour'] = function () {
    var v = etat.vue.tel;
    if (!v.pile.length) { allerAuJour(false); }
    else { var prec = v.pile.pop(); var pile = v.pile; etat.vue.tel = prec; etat.vue.tel.pile = pile; effetsAffichage(); }
    ecrire(); rendre();
  };

  /* Jour suivant (§8.2, §8.3) */
  A['jour-suivant'] = function () {
    if (journeeFinie()) { etat.vue.cadre = { page: 'carnet' }; ecrire(); rendre(); return; }
    bande.confirmation = true; rendre({ telephone: false });
  };
  A['confirmation-annuler'] = function () { bande.confirmation = false; rendre({ telephone: false }); };
  A['confirmation-continuer'] = function () { bande.confirmation = false; etat.vue.cadre = { page: 'carnet' }; ecrire(); rendre(); };
  A['carnet-q'] = function (b) {
    var s = seanceCourante();
    s.coups.carnet[b.getAttribute('data-q')] = b.getAttribute('data-valeur');
    ecrire(); rendre({ focus: false });
  };
  A['carnet-annuler'] = function () {
    etat.vue.cadre = null; ecrire();
    if (K() === 0) { allerA('1.9'); ecrire(); rendre(); return; }
    rendreRetourTelephone();
  };
  A['aller-jour-suivant'] = function () {
    if (bande.passage) { return; }
    bande.passage = true;
    rendre({ telephone: false, focus: false });
    var k = K();
    var s = nouvelleSeance(k + 1);
    ppArreter();
    etat.seances.push(s);
    visibleDepuis = estVisible() ? performance.now() : null;
    etat.vue.cadre = null;
    temp = {};
    if (k + 1 >= 2 && k + 1 <= 14) {
      var c = R().seances[k + 1].manches.porteur.cartes.length;
      s.coups.deviner = []; for (var i = 0; i < c; i++) { s.coups.deviner.push({ designe: null, raison: null }); }
    }
    if (k + 1 === 15) { s.rev.commencee = true; }
    allerAuJour(false);
    ecrire();
    bande.passage = false;
    rendre();
  };

  /* Clôture (§7.4) */
  function apresRevelationCloture() {
    var r = R().seances[15];
    var faux = r.mesures.revelation_verdicts.filter(function (v) { return v === 'faux'; }).length;
    if (faux >= 1) { etat.vue.cadre = { page: 'carnet' }; }
    else { ficheTexte14(); }
    ecrire(); rendre();
  }
  function ficheTexte14() { etat.vue.cadre = null; allerA('fiche', { texte: '14', texte14: true }, false); }
  A['cloture-apres-q1'] = function () { ficheTexte14(); ecrire(); rendre(); };
  A['cloture-apres-14'] = function () {
    etat.fin = { f2: null, f1: null, etape: 'f2' };
    etat.vue.tel = { ecran: 'fiche', texte: '14', texte14: true, pile: [] };
    etat.vue.cadre = { page: 'cloture-f2' };
    ecrire(); rendre();
  };
  A['cloture-f2-continuer'] = function () {
    etat.fin.etape = 'f1';
    if (!etat.fin.f1) { etat.fin.f1 = f1Vide(); }
    etat.vue.cadre = { page: 'cloture-f1' }; ecrire(); rendre();
  };

  /* Arrêter l'essai (§8.10) */
  A['arreter'] = function () { etat.vue.cadre = { page: 'arret-confirmation' }; ecrire(); rendre(); };
  A['arret-confirmer'] = function () {
    var s = seanceCourante();
    s.pp.fige = ppMaintenant();
    etat.arret = { k: K(), raison: null, f2: null, f1: null, etape: 'questions' };
    etat.vue.cadre = { page: 'arret-questions' };
    ecrire(); rendre();
  };
  A['arret-raison'] = function (b) { etat.arret.raison = b.getAttribute('data-valeur'); ecrire(); rendre({ focus: false }); };
  A['f2'] = function (b) { var o = etat.arret || etat.fin; o.f2 = b.getAttribute('data-valeur'); ecrire(); rendre({ focus: false }); };
  A['arret-continuer'] = function () {
    if (etat.arret.k >= 3) { etat.arret.etape = 'f1'; if (!etat.arret.f1) { etat.arret.f1 = f1Vide(); } etat.vue.cadre = { page: 'arret-f1' }; }
    else { etat.arret.etape = 'export'; etat.vue.cadre = { page: 'export' }; }
    ecrire(); rendre();
  };
  function f1Vide() { var o = {}; PERSOS.forEach(function (pp) { o[pp] = { S: null, P: null, T: null, L: null }; }); return o; }
  A['f1'] = function (b) {
    var o = etat.arret || etat.fin;
    if (!o.f1) { o.f1 = f1Vide(); }
    o.f1[b.getAttribute('data-membre')][b.getAttribute('data-tension')] = b.getAttribute('data-valeur');
    ecrire(); rendre({ focus: false });
  };
  A['f1-sauter'] = function () { etat.arret.f1 = null; etat.arret.etape = 'export'; etat.vue.cadre = { page: 'export' }; ecrire(); rendre(); };
  A['f1-continuer'] = function () {
    var o = etat.arret || etat.fin;
    if (etat.fin) { seanceCourante().pp.fige = ppMaintenant(); }
    o.etape = 'export'; etat.vue.cadre = { page: 'export' }; ecrire(); rendre();
  };
  A['voir-devoilement'] = function () {
    var o = etat.arret || etat.fin; o.etape = 'devoilement';
    bande.messageCopie = null; etat.vue.cadre = { page: 'devoilement' }; ecrire(); rendre();
  };

  /* Export : copie dans le geste (§8.7) */
  function copierTexte(texte, zone, reussite, echec) {
    function seconde() {
      try {
        var r = document.createRange(); r.selectNodeContents(zone);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        if (document.execCommand && document.execCommand('copy')) { reussite(); return; }
      } catch (e) { /* suite */ }
      try { var r2 = document.createRange(); r2.selectNodeContents(zone); var s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r2); } catch (e) { /* rien */ }
      echec();
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(reussite, seconde); }
      else { seconde(); }
    } catch (e) { seconde(); }
  }
  A['copier-carnet'] = function () {
    var zone = document.getElementById('zone-carnet');
    var texte = zone.textContent;
    copierTexte(texte, zone, function () { bande.messageCopie = X.carnetCopie; rendreBandeSeule(); },
      function () { bande.messageCopie = X.copieEchec; rendreBandeSeule(); });
  };
  function rendreBandeSeule() { var nb = rendreBande(); racine.replaceChild(nb, bandeEl); bandeEl = nb; }

  /* Tout effacer (§8.9) */
  A['effacer'] = function () {
    var apres = !!((etat.arret && (etat.arret.etape === 'devoilement')) || (etat.fin && etat.fin.etape === 'devoilement'));
    etat.vue.cadreSous = etat.vue.cadre;
    etat.vue.cadre = { page: 'effacer', apres: apres };
    ecrire(); rendre();
  };
  var copiesDuChargement = [];
  A['copier-dabord'] = function () {
    var apres = etat.vue.cadre.apres;
    var cadreRetour = { page: 'effacer', apres: apres };
    if (apres) { etat.vue.cadre = { page: 'export', copie: { texte: texteCarnetExport({}) }, retour: cadreRetour }; ecrire(); rendre(); return; }
    var s = seanceCourante();
    var D = dureesToutes(null);
    var dc = dureesSeance(s, ppMaintenant());
    var c = { k: s.k, coups: JSON.parse(JSON.stringify(s.coups)), versions: s.versions.slice(), etapes: s.etapes ? { deviner: s.etapes.deviner, repondre: s.etapes.repondre } : null };
    var cp = M.copie(scelle, journal(), c, D, dc);
    copiesDuChargement.push(JSON.parse(JSON.stringify(cp)));
    etat.vue.cadre = { page: 'export', copie: { texte: cp.texte }, retour: cadreRetour };
    ecrire(); rendre();
  };
  A['export-fermer'] = function () { bande.messageCopie = null; etat.vue.cadre = etat.vue.cadre.retour; ecrire(); rendre(); };
  A['effacer-confirmer'] = function () {
    toutEffacer();
    montrerVueSeule([h('h1', null, t(X.efface))]);
  };

  /* Écrans hors de l'icône : copies */
  function messageCopie(b, texte) { var m = b.parentNode.querySelector('.message-copie'); if (m) { m.textContent = t3(texte); m.hidden = false; } }
  A['copier-adresse'] = function (b) {
    var zone = b.parentNode.querySelector('.adresse');
    copierTexte(X.adresse, zone, function () { messageCopie(b, X.adresseCopiee); }, function () { messageCopie(b, X.adresseEchec); });
  };
  A['copier-lignes'] = function (b) {
    var zone = document.getElementById('diagnostic');
    copierTexte(zone.textContent, zone, function () { messageCopie(b, X.lignesCopiees); }, function () { messageCopie(b, X.lignesEchec); });
  };

  /* ================================================================== */
  /* Événements : un seul gestionnaire de touchers                      */
  /* ================================================================== */

  function brancher() {
    document.addEventListener('pointerdown', function (ev) {
      if (bande.note && ev.target && !(ev.target.closest && ev.target.closest('[data-action="absent"]'))) { bande.note = null; if (racine && !arretTechnique) { rendreBandeSeule(); } }
      toucherCompte(ev.target);
    }, true);
    document.addEventListener('keydown', function (ev) { toucherCompte(ev.target); }, true);
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-action]') : null;
      if (!b) { return; }
      if (b.getAttribute('aria-disabled') === 'true') { return; }
      var a = b.getAttribute('data-action');
      if (A[a]) { ev.preventDefault(); A[a](b); }
    });
    document.addEventListener('input', function (ev) {
      if (ev.target && ev.target.id === 'champ-pseudo') {
        var avant = temp.saisie || '';
        var v = ev.target.value;
        if (Array.from(formaterPseudo(v)).length > 20) { ev.target.value = avant; return; }
        temp.saisie = v;
        var bt = milieuTel.querySelector('[data-action="recevoir-code"]');
        if (bt) { if (pseudoValide(v)) { bt.removeAttribute('aria-disabled'); } else { bt.setAttribute('aria-disabled', 'true'); } }
        rendreBandeSeule();
      }
    });
    document.addEventListener('visibilitychange', function () {
      if (!etat || efface || arretTechnique) { return; }
      if (document.visibilityState === 'hidden') { ppArreter(); ecrire(); return; }
      revenir();
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted && etat && !efface && !arretTechnique) { revenir(); } });
  }

  /** Retour au premier plan : relire l'état gardé avant tout toucher (§8.8). */
  function revenir() {
    var garde;
    try { garde = lireEtat(); } catch (e) { garde = undefined; }
    if (!garde || garde.ecritures !== etat.ecritures) { location.reload(); return; }
    ppReprendre();
    if (!etat.vue.cadre && etat.vue.tel.ecran === 'attente') { effetsAffichage(); rendre(); }
  }

  /* ================================================================== */
  /* Point d'accès en lecture (§9, « Une seule source »)                */
  /* ================================================================== */

  function pointDAcces() {
    window.ElenchosEssai = Object.freeze({
      version: VERSION,
      empreinte: function () { return empreinte; },
      etat: function () { return etat ? JSON.parse(JSON.stringify(etat)) : null; },
      journal: function () { return etat ? JSON.parse(JSON.stringify(journal())) : null; },
      resultats: function () { return etat ? R() : null; },
      durees: function () { return etat ? dureesToutes(ppMaintenant()) : null; },
      carnet: function () { return etat && (etat.fin || etat.arret) ? M.carnet(scelle, journal(), R(), dureesToutes(null), etat.fin ? { type: 'fin' } : { type: 'arret' }) : null; },
      copies: function () { return JSON.parse(JSON.stringify(copiesDuChargement)); },
      lectures: function () { return JSON.parse(JSON.stringify(lectures)); },
      /** Le moteur de la page sur un journal donné (rejeu en mode moteur, §9) : calcul pur, rien n'est écrit. */
      calculer: function (j) { return scelle ? M.calculer(scelle, j) : null; }
    });
  }

  /* ================================================================== */
  /* Démarrage                                                          */
  /* ================================================================== */

  /** À la réouverture, une vue gardée peut demander un choix perdu (§8.1, §8.8) : on revient à l'étape. */
  function normaliserVue() {
    var v = etat.vue.tel;
    if (v.ecran === '1.3' || v.ecran === '1.4') { etat.vue.tel = { ecran: '1.2', E: v.E, pile: [] }; }
    if (v.ecran === '1.8') { etat.vue.tel = { ecran: '1.8', pile: [] }; }
    if (v.ecran === 'raison') { etat.vue.tel = { ecran: 'repondre', pile: [] }; }
    if (etat.vue.cadre && etat.vue.cadre.page === 'carnet' && !journeeFinie() && K() >= 1 && K() <= 14) { etat.vue.cadre = null; }
    if (etat.vue.cadre && etat.vue.cadre.page === 'export' && etat.vue.cadre.copie && etat.vue.cadre.retour) { etat.vue.cadre = etat.vue.cadre.retour; }
    if (etat.vue.cadre && etat.vue.cadre.page === 'effacer') { etat.vue.cadre = etat.vue.cadreSous || null; delete etat.vue.cadreSous; }
    if (etat.vue.cadre && etat.vue.cadre.page === 'arret-confirmation') { etat.vue.cadre = null; }
    temp = {};
  }

  function demarrer() {
    pointDAcces();
    if (dansCadre || !estIOS) { ecranHors('ailleurs'); brancherHors(); return; }
    if (!standalone && autreNavigateur) { ecranHors('autre'); brancherHors(); return; }
    if (!standalone) { ecranHors('onglet'); brancherHors(); return; }
    var v = verifier();
    if (v !== 0) { brancherHors(); arreter1('V' + v); return; }
    if (!memoireMarche()) { arreter2(); return; }
    var garde;
    try { garde = lireEtat(); } catch (e) { brancherHors(); arreter1('V4'); return; }
    try { if (navigator.storage && navigator.storage.persist) { navigator.storage.persist().then(function () {}, function () {}); } } catch (e) { /* rien */ }
    etat = garde || nouvelEtat();
    construireRacine();
    if (estVisible()) { visibleDepuis = performance.now(); }
    normaliserVue();
    brancher();
    if (!garde) { ecrire(); }
    if (!etat.vue.cadre && etat.vue.tel.ecran === 'attente') { effetsAffichage(); }
    rendre();
  }
  function brancherHors() {
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-action]') : null;
      if (b && A[b.getAttribute('data-action')]) { ev.preventDefault(); A[b.getAttribute('data-action')](b); }
    });
  }

  return { demarrer: demarrer };
})(ElenchosNoyau, ElenchosMoteur, ElenchosTextes);

ElenchosInterface.demarrer();
