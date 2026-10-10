/* Écrans de la page du second essai : téléphone et cadre (outillage d'essai, D-001 tenu ;
 * lots 4 et 5, instance B).
 *
 * Contrat avec le socle et le moteur : INTERFACE.md. Le socle fait le contexte,
 * les vérifications V1 à V6, la mémoire, les horloges, le toucher compté et le
 * gestionnaire unique des touchers ; il appelle ici `rendre`, `arret`, `hors`,
 * `ancienne` et les actions (`data-action`). Chaque geste passe par
 * socle.geste : une transition d'etat.js (ou un simple changement de vue), une
 * écriture. Les écrans ne lisent jamais l'heure eux-mêmes (socle.lireParis,
 * socle.instantDuSaut), n'accèdent jamais à la mémoire du navigateur et n'écrivent aucun
 * nombre du calendrier : tout se lit dans `cal`.
 *
 * Téléphone (simulation-2.md, §7), cadre (§8), formes de la Direction
 * artistique (§7.23 ; frise : §8.1 ter). Rendu par createElement et
 * textContent seulement ; positions par le style de l'élément (CSSOM).
 *
 * Renvois : « §n » = simulation-2.md ; « S1 §n » = simulation.md.
 */
'use strict';

var ElenchosInterface = (function (N, X, E, J, CR, M, S) {
  var VERSION = ENTREES.version_page;
  var PORTEUR = 'porteur';

  var socle = null, cal = null, scelle = null;
  var racine = null, barreEl = null, bandeEl = null, milieuTel = null, milieuCadre = null, vueCouchee = null;
  var pageAffichee = null;
  /** Choix pas encore validés (position, raison, pseudo en cours de frappe) : jamais gardés (S1 §7.1, §8.8). */
  var temp = {};
  /** État passager de la bande : note du moment, confirmation, message de copie. */
  var bande = { note: null, confirmation: false, ancienneConfirmation: false, messageCopie: null, passage: false };
  /** Lecture de l'heure pour 2.5 : refaite à chaque nouvel affichage (S1 §7.5). */
  var lecture = null, relireHeure = true;
  /** Copies du carnet faites pendant ce chargement (version témoin, partie 4.3.11). */
  var copiesDuChargement = [];
  /** Relevés E.releverCopie des copies faites pendant ce chargement (Q-K7) : jamais écrits, rendus au socle. */
  var relevesCopies = [];
  var ancienneInfo = null;
  /** La note passagère à ôter quand le toucher en cours aura fait son geste. */
  var noteAEffacer = null;

  /* ================================================================== */
  /* Contexte d'affichage (lecture seule du navigateur)                 */
  /* ================================================================== */

  var ua = navigator.userAgent;
  var points = navigator.maxTouchPoints || 0;
  var ipadBureau = /Macintosh/.test(ua) && points > 1;
  var appareil = (/iPad/.test(ua) || ipadBureau) ? 'iPad' : 'iPhone';

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
  function donnees(e, params) { if (params) { Object.keys(params).forEach(function (k) { e.setAttribute('data-' + k, params[k]); }); } return e; }

  /** Typographie d'affichage (S1 §7.8, règles 1 à 6). */
  function t(s) { return N.typographier(s); }
  /** Gabarit avec « {pseudo} » : règles appliquées avant d'insérer le pseudo (S1 §7.8). */
  var MARQUE = '';
  function tp(gabarit) { return N.typographier(gabarit.split('{pseudo}').join(MARQUE)).split(MARQUE).join(pseudo()); }
  function frac(x) { return x instanceof N.Fraction ? x : N.Fraction(String(x)); }

  /* ================================================================== */
  /* Lectures de l'état et du moteur                                    */
  /* ================================================================== */

  function etat() { return socle.etat(); }
  function R() { return socle.resultats(); }
  function Rj(j) { return R().jours[String(j)]; }
  function K() { return E.K(etat()); }
  function jourE(e, j) { return e.jours[String(j)]; }
  function personnages() { return cal.membres.filter(function (m) { return m !== PORTEUR; }); }
  function pseudo() { var c = etat() ? jourE(etat(), cal.premier).coups.pseudo : null; return c || ''; }
  function nomMembre(m) { return m === PORTEUR ? pseudo() : m; }
  function nomOuMarque(m) { return m === PORTEUR ? '{pseudo}' : m; }
  function position(niveau) { return X.POSITIONS[niveau - 1]; }
  function texteDe(n) { return scelle.textes[n]; }
  function consideration(tx, rang) { return tx.considerations.filter(function (c) { return c.rang === rang; })[0]; }
  function raisonEnLigne(tx, raison) { return raison === 'aucune' ? X.aucuneDesQuatreRaisons : X.raisonFinLigne(consideration(tx, raison).texte); }
  function titreDe(n) {
    if (Object.prototype.hasOwnProperty.call(scelle.textes, n)) { return scelle.textes[n].titre; }
    var hx = scelle.histoire.textes[n];
    return hx && hx.fiche ? hx.fiche.titre : '';
  }
  /** La réponse du porteur au texte n, ou null. */
  function reponsePorteur(n) {
    var e = etat();
    if (cal.textesEntree.indexOf(n) >= 0) { var x = jourE(e, cal.premier).coups.entree[n]; return x ? x.reponse : null; }
    var d = cal.jourDeReponse(n);
    var dd = jourE(e, d);
    return dd ? dd.coups.reponse : null;
  }
  /** Nom du jour qui vient k jours après le jour j (S1 §7.1 : la table des jours continue après la clôture). */
  function nomJourApres(j, k) { var i = N.JOURS.indexOf(cal.ligne(j).nom_jour); return N.JOURS[(i + k) % 7]; }
  function nomJour(j) { return cal.ligne(j).nom_jour; }
  function confusables() { return socle.confusables(); }
  function facteurEnLettres() { return X.nombresEnLettres[2 * scelle.reglage.facteur] || String(2 * scelle.reglage.facteur); }

  /** La vue gardée, ou la vue de départ tant que rien n'a été écrit (§8.2). */
  function vueDe(e) {
    if (!e.vue.tel) { return { tel: { ecran: '1.1', pile: [] }, cadre: { page: 'message0' } }; }
    return e.vue;
  }
  function vue() { return vueDe(etat()); }
  function initVue(e) { if (!e.vue.tel) { e.vue.tel = { ecran: '1.1', pile: [] }; e.vue.cadre = { page: 'message0' }; } }

  /** Le jour dont le téléphone montre l'état : pendant un saut, celui du texte affiché (§7.4). */
  function jourAffiche() {
    var e = etat();
    var r = E.rattrapage(e, cal);
    if (!r) { return K(); }
    var v = vue().tel;
    if (v.jour !== undefined && v.jour !== null) { return v.jour; }
    return r.rang > r.repondus ? r.jour : cal.saut(r.numero).jours[r.repondus - 1];
  }

  /* ================================================================== */
  /* Gestes                                                             */
  /* ================================================================== */

  /** Un geste : la fonction reçoit la copie de l'état et l'horloge ; une écriture (socle.geste). */
  function geste(fn) {
    return socle.geste(function (e, hh) {
      initVue(e);
      var r = fn(e, hh);
      // Durée de Deviner : jusqu'au dernier toucher fait pendant qu'il est affiché (S1 §8.4).
      var k = E.K(e), d = jourE(e, k);
      if (!E.sautEnCours(e) && e.vue.tel.ecran === 'deviner' && !e.vue.cadre && d.coups.deviner && !d.coups.deviner.validee) {
        E.marquer(e, k, 'devDernier', hh, true);
      }
      return r;
    });
  }

  /** Affiche un écran du téléphone dans la copie e, avec ses effets (étapes vues, débuts de durées). */
  function aller(e, hh, ecran, params, empiler) {
    var v = e.vue.tel;
    var pile = empiler === true ? v.pile.concat([copieVue(v)]) : (empiler === false ? [] : v.pile);
    var nv = { ecran: ecran, pile: pile };
    if (params) { Object.keys(params).forEach(function (k) { nv[k] = params[k]; }); }
    e.vue.tel = nv;
    effets(e, hh);
  }
  function copieVue(v) { var c = {}; Object.keys(v).forEach(function (k) { if (k !== 'pile') { c[k] = v[k]; } }); return c; }

  function effets(e, hh) {
    var v = e.vue.tel, k = E.K(e), d = jourE(e, k);
    if (v.ecran === '1.2') { E.afficherEntree(e, cal, hh); }
    if (v.ecran === 'deviner' && d.coups.deviner === null) { E.ouvrirDeviner(e, cal, k, Rj(k).cartes_porteur.cartes.length, hh); }
    if (v.ecran === 'repondre' && cal.estJoue(k)) { E.afficherRepondre(e, cal, k, hh); }
    if (v.ecran === 'attente') { relireHeure = true; }
    if (v.ecran === 'revelation') { marquerRevelation(e, k); }
  }

  /** L'écran qu'ouvre l'onglet « Aujourd'hui » (§7.3, §7.4). */
  function ecranDuJour(e) {
    var k = E.K(e), d = jourE(e, k);
    var r = E.rattrapage(e, cal);
    if (r) {
      if (r.rang > r.repondus) { return { ecran: 'ratt-position', jour: r.jour }; }
      return { ecran: 'ratt-attente', jour: cal.saut(r.numero).jours[r.repondus - 1] };
    }
    var rev = d.page.rev || {};
    if (cal.estCloture(k)) { return { ecran: 'revelation' }; }
    if (Rj(k).message && !rev.commencee) { return { ecran: 'verrou' }; }
    if (rev.ouverte) { return { ecran: 'revelation' }; }
    if (cal.ligne(k).deviner_porteur && !(d.coups.deviner && d.coups.deviner.validee)) { return { ecran: 'deviner' }; }
    if (d.coups.reponse === null) { return { ecran: 'repondre' }; }
    return { ecran: 'attente' };
  }
  function allerAuJour(e, hh) { var x = ecranDuJour(e); var p = {}; if (x.jour !== undefined) { p.jour = x.jour; } aller(e, hh, x.ecran, p, false); }

  /* ================================================================== */
  /* Pièces de texte : vote (E4), auteurs (E5), pseudo et rond (E7)     */
  /* ================================================================== */

  function dateVote(tx) { return N.dateLongue(tx.vote.date); }
  /** {objet} {étape-texte} {suite} pour un article, un amendement ou une résolution (§7.10). */
  function suiteObjet(tx) {
    var v = tx.vote;
    return X.joindre([X.objet[v.objet], X.etapeTexte[v.etape], v.suite ? X.suite[v.suite] : '']);
  }
  /** Ligne datée de 2.7d (§7.10). */
  function ligneVote27d(tx) {
    var v = tx.vote;
    if (v.objet === 'motion') { return X.leDateMotion(dateVote(tx)); }
    if (v.objet === 'texte') { return X.joindre([X.leDate(dateVote(tx)), X.etape[v.etape]]); }
    return X.joindre([X.leDate(dateVote(tx)), suiteObjet(tx)]);
  }
  /** Ligne du vote de 5.4 (§7.10). */
  function ligneVote54(tx) {
    var v = tx.vote;
    if (v.objet === 'motion') { return X.voteFicheMotion(dateVote(tx)); }
    var tete = X.voteFiche(X.issueParticipe[v.issue], dateVote(tx));
    return v.objet === 'texte' ? X.joindre([tete, X.etape[v.etape]]) : X.joindre([tete, suiteObjet(tx)]);
  }
  /** Ligne du vote de 1.6 (§7.10). */
  function ligneVote16(tx) {
    var v = tx.vote;
    if (v.objet === 'motion') { return X.voteEntreeMotion(dateVote(tx)); }
    var tete = X.voteEntree(X.issueParticipe[v.issue], dateVote(tx));
    return v.objet === 'texte' ? X.joindre([tete, X.etape[v.etape]]) : X.joindre([tete, suiteObjet(tx)]);
  }

  /** « {nom}, {mandat}, {groupe} » ou « {nom}, {député} sans groupe » (§7.11, gabarit validé de D-014). */
  function elu(a, sansMandat) {
    var mandat = a.type === 'senateur' ? N.mandatSenateur(a.feminin) : N.mandatDepute(a.feminin);
    if (a.groupe === null) { return { nom: a.nom, suite: X.sansGroupe(mandat), groupe: null }; }
    return { nom: a.nom, suite: sansMandat ? a.groupe : mandat + ', ' + a.groupe, groupe: a.groupe };
  }
  function proposePar(tx, ecran) {
    var a = tx.auteur;
    if (a.type === 'gouvernement') { return { texte: X.proposeParGouvernement, noms: [], groupes: [] }; }
    if (a.type === 'commission') { return { texte: X.proposeParCommission(a.libelle), noms: [], groupes: [] }; }
    var x = elu(a, ecran === '5.4' && a.type === 'depute');
    return { texte: X.proposePar(x.nom, x.suite), noms: [x.nom], groupes: x.groupe ? [x.groupe] : [] };
  }
  function taRaison(tx, raison) {
    var c = consideration(tx, raison);
    var x = elu(c.depute, false);
    return { texte: X.taRaison(X.raisonDansPhrase(c.texte), N.deDepute(c.depute), x.suite), noms: [c.depute.nom], groupes: x.groupe ? [x.groupe] : [] };
  }

  /**
   * Coupures (§7.11) : jamais dans un nom de personne ; un nom de groupe passe à la
   * ligne à ses espaces seulement, jamais à un trait d'union, et une ligne ne
   * commence jamais par « - ». Rend des morceaux de texte et des éléments insécables.
   */
  function insecables(chaine, noms, groupes) {
    var proteges = [];
    noms.forEach(function (n) { proteges.push(t(n)); });
    groupes.forEach(function (g) {
      var mots = t(g).split(' ');
      for (var i = 0; i < mots.length; i++) {
        if (mots[i] === '-' && i > 0) { proteges.push(mots[i - 1] + ' -'); }
        else if (mots[i].indexOf('-') > 0) { proteges.push(mots[i]); }
      }
    });
    var morceaux = [chaine];
    proteges.sort(function (a, b) { return b.length - a.length; }).forEach(function (p) {
      var suite = [];
      morceaux.forEach(function (m) {
        if (typeof m !== 'string') { suite.push(m); return; }
        var parts = m.split(p);
        parts.forEach(function (x, i) { if (i > 0) { suite.push(h('span', { class: 'insecable' }, p)); } if (x) { suite.push(x); } });
      });
      morceaux = suite;
    });
    return morceaux;
  }
  function phraseElus(o) { return insecables(t(o.texte), o.noms, o.groupes); }

  var RE_INVISIBLES = /[\p{Cc}\p{Cf}\p{Cs}]/gu;
  /** Mise en forme du pseudo à la saisie (S1 §7.2). */
  function formaterPseudo(s) {
    s = s.normalize('NFC').replace(RE_INVISIBLES, '').replace(/\s/gu, ' ').replace(/ {2,}/g, ' ');
    return s.replace(/^ +| +$/g, '').normalize('NFC');
  }
  /** Motif du refus (§7.19) : null si le pseudo est gardable. */
  function motifRefus(f) {
    if (!f) { return 'vide'; }
    if (J.pseudoGardable(f, confusables())) { return null; }
    var sq = N.squelette(f, confusables());
    if (personnages().some(function (p) { return N.squelette(p, confusables()) === sq; })) { return 'prenom'; }
    if (Array.from(f).length === 1 && personnages().some(function (p) { return N.squelette(p.charAt(0), confusables()) === sq; })) { return 'rond'; }
    return 'autre';
  }
  /** Rond du porteur (E7, §7.19) : une lettre, ou deux si la première est l'initiale d'un personnage. */
  function rondPorteur() {
    var c = Array.from(pseudo());
    if (!c.length) { return ''; }
    var premier = c[0].toUpperCase();
    var sq = N.squelette(c[0], confusables());
    if (personnages().some(function (p) { return N.squelette(p.charAt(0), confusables()) === sq; })) {
      var suivant = c.slice(1).filter(function (x) { return x !== ' '; })[0] || '';
      return premier + suivant;
    }
    return premier;
  }
  function initiale(m) { return m === PORTEUR ? rondPorteur() : m.charAt(0); }

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
  function lien(s, action, params) { return donnees(h('button', { type: 'button', class: 'link', action: action }, s), params); }
  function absent(s) { return lien(s, 'absent'); }
  function dot(lettre, taille, nom, legende, etatFace, action, params, aria) {
    var tag = action ? 'button' : 'div';
    var e = h(tag, { type: action ? 'button' : null, class: 'face ' + (taille || '') + ' ' + (etatFace || ''), action: action,
      'aria-pressed': action === 'visage' ? (etatFace === 'on' ? 'true' : 'false') : null,
      'aria-disabled': etatFace === 'off' ? 'true' : null, 'aria-label': aria || null },
    h('span', { class: 'dot', 'aria-hidden': aria ? 'true' : null }, lettre),
    nom ? h('span', { class: 'nom' }, nom) : null,
    legende ? (Array.isArray(legende) ? legende.map(function (l) { return h('span', { class: 'cap' }, l); }) : h('span', { class: 'cap' }, legende)) : null);
    return donnees(e, params);
  }
  function faces(arr, classe) { return h('div', { class: 'faces' + (classe ? ' ' + classe : '') }, arr); }
  function opts(liste, choisi, action) {
    return h('div', { class: 'opts', role: 'group' }, liste.map(function (x) {
      var v = x.valeur;
      return h('button', { type: 'button', class: 'opt' + (choisi === v ? ' on' : '') + (x.gap ? ' gap' : ''), action: action,
        'data-valeur': String(v), 'aria-pressed': choisi === v ? 'true' : 'false' }, t(x.libelle));
    }));
  }
  function positions(choisie, action) { return opts(X.POSITIONS.map(function (l, i) { return { valeur: i + 1, libelle: l }; }), choisie, action); }
  function raisons(tx, choisie, action) {
    var l = tx.considerations.map(function (c) { return { valeur: c.rang, libelle: X.raisonFinLigne(c.texte) }; });
    l.push({ valeur: 'aucune', libelle: X.aucuneRaison, gap: true });
    return opts(l, choisie, action);
  }
  function lireValeur(b) { var v = b.getAttribute('data-valeur'); return v === 'aucune' ? 'aucune' : +v; }
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
  function hdJour(j) { return hd(hdTitre(t(X.aujourdhui(nomJour(j))))); }

  /* ---- Curseurs (S1 §5.3 ; maquettes 4.1, 4.3, 5.11) ---- */

  function indexT8(code) { for (var i = 0; i < 8; i++) { if (X.T8[i].code === code) { return i; } } return -1; }
  function poles(i) { return h('div', { class: 'poles' }, h('span', null, t(X.T8[i].poles[0])), h('span', null, t(X.T8[i].poles[1]))); }
  var ECARTE = { c: N.Fraction(1, 2), l: N.Fraction('0.95'), net: false };
  /** Curseur flou : zone de largeur ℓ centrée sur c, rognée au bord, jamais décalée. */
  function zone(cur, rev) {
    var cc = frac(cur.c).pourDessiner(), ll = frac(cur.l).pourDessiner();
    var g = Math.max(0, cc - ll / 2), d = Math.min(1, cc + ll / 2);
    var e = h('span', { class: 'haze' + (rev ? ' rev' : '') });
    e.style.left = (g * 100) + '%';
    e.style.width = ((d - g) * 100) + '%';
    return e;
  }
  /** Curseur net : un point (§7.15 ; maquette 4.1) ; creux pour le proche (4.3). */
  function pt(cur, creux) {
    var e = h('span', { class: 'pt' + (creux ? ' hollow' : '') });
    e.style.left = (frac(cur.c).pourDessiner() * 100) + '%';
    return e;
  }
  function marque(cur, rev) { return cur.net ? pt(cur, rev) : zone(cur, rev); }
  function ariaCurseur(i) { return t(X.T8[i].poles[0] + ' ou ' + X.T8[i].poles[1]); }
  function slider(i, cur) { return h('div', { class: 'slider', role: 'img', 'aria-label': ariaCurseur(i) }, poles(i), h('div', { class: 'track' }, marque(cur))); }
  /** Lecture d'un curseur en mots (§7.16) : « vers {pôle} », « au milieu », « encore flou ». */
  function lectureCurseur(code, cur) {
    if (!cur || !cur.net) { return X.encoreFlouMin; }
    var c = frac(cur.c);
    if (c.inf(N.Fraction(2, 5))) { return X.versPole(X.POLES_PHRASE[code][0]); }
    if (c.sup(N.Fraction(3, 5))) { return X.versPole(X.POLES_PHRASE[code][1]); }
    return X.auMilieu;
  }

  /* ================================================================== */
  /* Écrans du téléphone                                                */
  /* ================================================================== */

  function ecranTel(corps, bas, options) {
    options = options || {};
    var e = h('section', { class: 'tel-ecran' + (options.soir ? ' soir' : '') + (options.croix ? ' a-croix' : ''), 'aria-label': options.aria || null });
    e.appendChild(h('div', { class: 'corps' }, corps));
    if (bas && bas.length) { e.appendChild(h('div', { class: 'bas' }, bas)); }
    if (options.croix) { e.appendChild(h('button', { type: 'button', class: 'croix', action: 'croix', 'aria-label': t(X.fermer) }, '×')); }
    if (options.feuille) { e.appendChild(options.feuille); }
    return e;
  }
  function btn1(s, action, actif, params) {
    return donnees(h('button', { type: 'button', class: 'btn1', action: action, 'aria-disabled': actif === false ? 'true' : null }, t(s)), params);
  }
  /** Jours 4 et 8, saut pas encore confirmé (§0, « Annuler ») : ni Le Cercle ni Moi ; pendant le rattrapage, les onglets sont actifs (§7.4). */
  function ongletsFermes() { var e = etat(); return cal.estPointDeSaut(K()) && !E.sautEnCours(e) && !e.arret && !e.fin; }
  function tabbar(actif) {
    if (ongletsFermes()) { return null; }
    var onglets = [[X.ongletAujourdhui, 'onglet-jour'], [X.ongletCercle, 'onglet-cercle'], [X.ongletMoi, 'onglet-moi']];
    return h('nav', { class: 'tabbar', 'aria-label': 'Onglets' }, onglets.map(function (o, i) {
      return h('button', { type: 'button', class: 'tab' + (i === actif ? ' on' : ''), action: o[1], 'aria-current': i === actif ? 'page' : null }, t(o[0]));
    }));
  }

  /* ---- Entrée (§7.2) ---- */

  function nEntree() { return cal.textesEntree.length; }
  function rangEntree(E1) { return cal.textesEntree.indexOf(E1) + 1; }

  function e11() {
    var inv = cal.invitant;
    return ecranTel([
      h('div', { class: 'chat-hd' }, t('← ' + X.chatTitre(inv))),
      h('div', { class: 'bubble' }, t(X.chatBulle)),
      h('button', { type: 'button', class: 'preview', action: 'apercu' }, h('b', null, t(X.chatApercuTitre)), h('span', null, t(X.chatApercu(inv))))
    ], null, { aria: t(X.chatAria(inv)) });
  }
  function e12(En) {
    var tx = texteDe(En);
    return ecranTel([
      band(t(X.bandeDefi(cal.invitant, rangEntree(En), nEntree()))), small(t(X.consigneDefi(cal.invitant))), label(t(X.etiquetteTexte)), ttl(t(tx.titre)),
      lignes(tx.lignes.map(t)), q(t(X.tonAvis)), positions(temp.position || null, 'entree-position')
    ], [btn1(X.suivant, 'entree-suivant', !!temp.position)]);
  }
  function e13() {
    return ecranTel([
      back(X.consentementRetour, 'consentement-retour'), ttl(t(X.consentementTitre)), p(t(X.consentementTexte)),
      lien(t(X.quiDureeDroits), 'droits')
    ], [btn1(X.jAccepte, 'consentement-accepter')]);
  }
  function e14(En) {
    var tx = texteDe(En);
    return ecranTel([
      back(X.changerPosition, 'entree-changer'), band(t(X.bandeDefi(cal.invitant, rangEntree(En), nEntree()))),
      small(t(X.rappelAvis(tx.titre, position(temp.position)))), q(t(X.questionRaison)),
      raisons(tx, temp.raison === undefined ? null : temp.raison, 'entree-raison'), small(t(X.definitive))
    ], [btn1(X.valider, 'entree-valider-raison', temp.raison !== undefined && temp.raison !== null)]);
  }
  function e15(En) {
    var tx = texteDe(En), inv = cal.invitant;
    return ecranTel([
      band(t(X.bandeDefi(inv, rangEntree(En), nEntree()))), faces([dot(initiale(inv), 'L', inv)]), big(t(X.etSaReponse(inv))), small(t(tx.titre)),
      positions(temp.pari || null, 'entree-pari')
    ], [btn1(X.voirSaReponse, 'entree-voir', !!temp.pari)]);
  }
  function e16(En) {
    var tx = texteDe(En), inv = cal.invitant;
    var c = jourE(etat(), cal.premier).coups.entree[En];
    var x = Rj(cal.premier).entree.textes[En];
    var o = proposePar(tx, '1.6');
    var tete = t(X.lAssembleeTete);
    var vote = t(ligneVote16(tx));
    var dernier = rangEntree(En) === nEntree();
    return ecranTel([
      band(t(X.bandeTexte(rangEntree(En), nEntree()))),
      big(t(x.juste ? X.tuConnais : X.caAlors)),
      p(t(X.tonPari(position(c.pari)))),
      h('div', { class: 'faces faceline' }, h('div', { class: 'face' }, h('span', { class: 'dot', 'aria-hidden': 'true' }, initiale(inv))),
        h('div', { class: 'p' }, h('b', null, t(X.ligneInvitant(inv, position(x.invitant.niveau)))), h('br'), t(raisonEnLigne(tx, x.invitant.raison)))),
      rule(),
      h('div', { class: 'p' }, h('b', null, tete), vote.slice(tete.length)),
      h('div', { class: 'p' }, phraseElus(o)),
      c.reponse.raison === 'aucune' ? null : h('div', { class: 'p' }, phraseElus(taRaison(tx, c.reponse.raison)))
    ], [btn1(dernier ? X.suivant : X.texteSuivant, 'entree-texte-suivant')]);
  }
  /** Tensions des textes d'entrée, dans leur ordre, sans doublon (§7.2, 1.7). */
  function tensionsEntree() {
    var l = [];
    cal.textesEntree.forEach(function (En) { var c = texteDe(En).tension; if (l.indexOf(c) < 0) { l.push(c); } });
    return l;
  }
  function e17() {
    var x = Rj(cal.premier).entree, n = x.justes, total = nEntree(), inv = cal.invitant;
    var portrait = Rj(cal.premier).portrait.tensions;
    return ecranTel([
      n >= 2 ? h('div', { class: 'huge' }, t(X.bilanGrand(n, total))) : big(t(X.bilanSurprises(inv, total - n))),
      n >= 2 ? p(t(X.bilanLigne(inv, n, total))) : null,
      rule(), label(t(X.portraitCommence)),
      tensionsEntree().map(function (code) { return slider(indexT8(code), portrait[code]); }),
      small(t(X.chaqueReponseLes))
    ], [btn1(X.creerCompte, 'creer-compte')]);
  }
  function pseudoSaisi() { return formaterPseudo(temp.saisie || ''); }
  function e18() {
    var champ = h('input', { class: 'champ', id: 'champ-pseudo', type: 'text', autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-label': t(X.champPseudo), name: 'pseudo-essai' });
    champ.value = temp.saisie || '';
    var ok = motifRefus(pseudoSaisi()) === null;
    function voie(libelle, action) {
      return h('button', { type: 'button', class: 'btn2 voie', action: action, 'aria-disabled': ok ? null : 'true' }, t(libelle));
    }
    return ecranTel([
      p(t(X.compteTexte(cal.invitant))),
      h('label', { class: 'field', for: 'champ-pseudo' }, t(X.champPseudo), champ),
      h('div', { class: 'voies' }, voie(X.continuerApple, 'compte-apple'), voie(X.continuerGoogle, 'compte-google'), voie(X.recevoirCodeEmail, 'compte-email'))
    ], null);
  }
  function e18b() {
    return ecranTel([
      back(X.retourCompte, 'compte-retour'),
      h('div', { class: 'field' }, t(X.champEmail), h('div', { class: 'dessin' }, X.emailDessine)),
      small(t(X.recevrasCode))
    ], [btn1(X.recevoirCode, 'recevoir-code')]);
  }
  function e19() {
    return ecranTel([
      p(t(X.codeEnvoye)),
      h('div', { class: 'code', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5, 6].map(function () { return h('div', { class: 'rempli' }); })),
      absent(t(X.renvoyerCode)), lien(t(X.plusTard), 'code-plus-tard')
    ], [btn1(X.valider, 'code-valider')]);
  }

  /* ---- Aujourd'hui ---- */

  /** « Reprendre la révélation » / « Revoir la révélation » (E3, §7.18). */
  function ligneRouvrir() {
    var k = K();
    // Jamais pendant un saut en cours (jour de reprise atteint sans ouverture compris, Q-J3).
    if (E.sautEnCours(etat()) || !cal.estJoue(k) || cal.ligne(k).revelation_porteur !== 'lue' || !revelationPresente(k)) { return null; }
    var rev = jourE(etat(), k).page.rev;
    if (!rev || !rev.commencee || rev.ouverte) { return null; }
    var fini = rev.max >= sequenceRevelation(k).length - 1;
    return h('button', { type: 'button', class: 'rouvrir', action: 'rouvrir' }, h('span', null, t(fini ? X.revoirRevelation : X.reprendreRevelation)), h('span', { 'aria-hidden': 'true' }, '›'));
  }

  function eDeviner() {
    var k = K(), mp = Rj(k).cartes_porteur;
    var tx = texteDe(cal.texteDevine(k));
    var dv = jourE(etat(), k).coups.deviner;
    var ch = dv.cartes;
    var poses = ch.map(function (c) { return c.designe; });
    var raisonsAvant = temp.raisonsAvant || {};
    var cartes = mp.cartes.map(function (c, i) {
      var rep = mp.possibles[c.auteur];
      var choix = ch[i];
      var passee = choix.designe === 'passe';
      var raison = choix.raison !== null ? choix.raison : (raisonsAvant[i] !== undefined ? raisonsAvant[i] : null);
      var lignesCarte = [h('div', { class: 'ans' }, t(c.cachee ? X.carteLigne(position(rep.niveau), X.carteRaisonCachee) :
        X.carteLigne(position(rep.niveau), raisonEnLigne(tx, rep.raison))))];
      if (c.cachee && raison !== null && !passee) {
        lignesCarte.push(h('div', { class: 'why' }, raison === 'aucune' ? t(X.taDevinetteAucune) : t(X.taDevinette(X.raisonFinLigne(consideration(tx, raison).texte)))));
      }
      if (c.cachee && !passee) { lignesCarte.push(h('button', { type: 'button', class: 'btn2', action: 'devine-pourquoi', 'data-carte': i }, t(X.devineAussi))); }
      var visages = personnages().map(function (m) {
        var surCette = choix.designe === m;
        var ailleurs = !surCette && poses.indexOf(m) >= 0;
        return dot(initiale(m), 'S', m, null, surCette ? 'on' : (ailleurs ? 'off' : ''), 'visage', { carte: i, membre: m }, m);
      });
      return h('div', { class: 'guess' + (passee ? ' passed' : ''), role: 'group', 'aria-label': t(X.reponseNumero(i + 1)) },
        lignesCarte,
        h('div', { class: 'row' }, faces(visages), h('button', { type: 'button', class: 'link', action: 'passer', 'data-carte': i,
          'aria-pressed': passee ? 'true' : 'false' }, t(passee ? X.passee : X.passer))));
    });
    var pret = ch.every(function (c) { return c.designe !== null; });
    var feuille = null;
    if (temp.feuille === 'relire') { feuille = feuilleRelire(tx); }
    else if (temp.feuille !== undefined && temp.feuille !== null) { feuille = feuilleRaison(tx, temp.feuille, raisonsAvant); }
    var corps = [hdJour(k), ligneRouvrir(), steps(['on', 'off'])];
    if (cal.estArrivee(k)) { corps.push(band(t(X.rejoint(cal.nomCercle)))); }
    corps.push(label(t(cal.nomCercle)),
      h('div', { class: 'small' }, t(X.hier(tx.titre) + ' · '), h('button', { type: 'button', class: 'link en-ligne', action: 'relire' }, t(X.relire))),
      q(t(X.aQui)));
    // La ligne de règle (§7.12, §7.23 A) : sous la question, reliée aux cartes comme description.
    corps.push(h('div', { class: 'small regle', id: 'regle-deviner' }, t(X.regleDeviner)));
    corps.push(h('div', { class: 'cartes', role: 'group', 'aria-describedby': 'regle-deviner' }, cartes));
    return ecranTel(corps, [btn1(X.valider, 'deviner-valider', pret), tabbar(0)], { feuille: feuille });
  }
  function feuille(contenu) {
    return h('div', { class: 'feuille-fond' },
      h('button', { type: 'button', class: 'voile', action: 'feuille-fermer', 'aria-label': t(X.retour) }),
      h('div', { class: 'feuille', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'grab', 'aria-hidden': 'true' }),
        h('div', { class: 'feuille-defile' }, contenu)));
  }
  function feuilleRaison(tx, i, raisonsAvant) {
    var dv = jourE(etat(), K()).coups.deviner;
    var actuelle = dv.cartes[i].raison !== null ? dv.cartes[i].raison : (raisonsAvant[i] !== undefined ? raisonsAvant[i] : null);
    var choisie = temp.raisonFeuille !== undefined ? temp.raisonFeuille : actuelle;
    return feuille([ttl(t(X.feuillePourquoi)), raisons(tx, choisie, 'feuille-raison'),
      btn1(X.choisir, 'feuille-choisir', choisie !== null && choisie !== undefined)]);
  }
  function feuilleRelire(tx) {
    return feuille([label(t(X.etiquetteTexte)), ttl(t(tx.titre)), lignes(tx.lignes.map(t)), back(X.retour, 'feuille-fermer')]);
  }

  function eRepondre() {
    var k = K(), tx = texteDe(cal.ligne(k).repondu);
    var corps = [ligneRouvrir(), steps(['done', 'on']), label(t(X.etiquetteTexte)), ttl(t(tx.titre)), lignes(tx.lignes.map(t)), q(t(X.tonAvis)),
      positions(temp.position || null, 'jour-position')];
    return ecranTel(corps, [btn1(X.suivant, 'jour-suivant-raison', !!temp.position), tabbar(0)]);
  }
  function eRaison(rattrapage) {
    var j = rattrapage ? jourAffiche() : K();
    var tx = texteDe(cal.ligne(j).repondu);
    return ecranTel([
      back(X.changerPosition, rattrapage ? 'ratt-changer' : 'jour-changer'), small(t(X.rappelAvis(tx.titre, position(temp.position)))),
      q(t(X.questionRaison)), raisons(tx, temp.raison === undefined ? null : temp.raison, rattrapage ? 'ratt-raison' : 'jour-raison'), small(t(X.definitive))
    ], [btn1(X.valider, rattrapage ? 'ratt-valider' : 'jour-valider-raison', temp.raison !== undefined && temp.raison !== null), tabbar(0)]);
  }

  function lireEnAttendant() {
    if (relireHeure || lecture === null) { lecture = socle.lireParis(); relireHeure = false; }
    return lecture;
  }
  function eAttente() {
    var k = K(), r = Rj(k);
    var lu = lireEnAttendant();
    var reste = 1440 - ((lu.minutesDuJour - 1080 + 1440) % 1440);
    var hh = Math.floor(reste / 60), mm = N.deux(reste % 60);
    var visages = M.visagesDejaJoue(scelle, cal, k, lu.hhmm);
    return ecranTel([
      hdJour(k), ligneRouvrir(),
      h('div', { class: 'box' }, label(t(X.phraseDuJour)), p(r.phrase_jour.phrase), lien(t(X.voirPortrait), 'voir-portrait')),
      big(t(r.compte_a_rebours === 'revelation' ? X.revelationDans(hh, mm) : X.nouveauTexteDans(hh, mm))),
      visages.length ? small(t(X.dejaJoue)) : null,
      visages.length ? faces(visages.map(function (v) { return dot(initiale(v), 'S', v); })) : null
    ], [tabbar(0)]);
  }

  /* ---- Rattrapage (§7.4) ---- */

  function eRattPosition() {
    var j = jourAffiche(), tx = texteDe(cal.ligne(j).repondu);
    return ecranTel([
      hdJour(j), steps(['off', 'on']), label(t(X.etiquetteTexte)), ttl(t(tx.titre)), lignes(tx.lignes.map(t)), q(t(X.tonAvis)),
      positions(temp.position || null, 'ratt-position')
    ], [btn1(X.suivant, 'ratt-suivant-raison', !!temp.position), tabbar(0)]);
  }
  /** 2.5 réduit (§7.4) : le jour, la phrase du jour, rien d'autre. */
  function eRattAttente() {
    var j = jourAffiche();
    return ecranTel([
      hdJour(j),
      h('div', { class: 'box' }, label(t(X.phraseDuJour)), p(Rj(j).phrase_jour.phrase), lien(t(X.voirPortrait), 'voir-portrait'))
    ], [tabbar(0)]);
  }

  /* ---- Message de 18h et révélation (§7.17, §7.18, §7.5) ---- */

  function texteMessage(m) {
    var s = m.forme === 'cartes' ? X.message18hCartes : (m.forme === 'vote' ? X.message18hVote : X.message18hQuestion);
    return m.titres ? s + ' ' + X.message18hTitres : s;
  }
  function eVerrou() {
    var k = K();
    return ecranTel([h('div', { class: 'lock' },
      h('div', { class: 'small' }, t(nomJour(k))),
      h('div', { class: 'clock' }, X.horlogeVerrou),
      h('button', { type: 'button', class: 'notif', action: 'notification' },
        h('span', { class: 'meta' }, h('i', { 'aria-hidden': 'true' }, X.notifIcone), t(X.notifMeta)),
        h('span', null, t(texteMessage(Rj(k).message)))))], null, { aria: t(X.ecranVerrouille) });
  }

  /** La révélation du jour j existe-t-elle pour le porteur (vote ou cartes, ou titres) ? */
  function revelationPresente(j) {
    if (cal.estCloture(j)) { return true; }
    var m = Rj(j).message;
    if (!m) { return false; }
    return sequenceRevelation(j).some(function (x) { return x.type !== 'fin'; });
  }

  /** La séquence de la révélation du jour j (§7.5 ; maquettes 2.7a à 3.3e). */
  function sequenceRevelation(j) {
    var r = Rj(j), rev = r.revelation, m = r.message;
    var seq = [];
    var dv = rev && rev.devineurs ? rev.devineurs[PORTEUR] : null;
    var manche = dv ? Rj(j - 1).manches[PORTEUR] : null;
    if (manche) { manche.cartes.forEach(function (c, i) { seq.push({ type: 'carte', i: i }); }); }
    var voteVisible = m ? m.forme !== 'question' : true;
    if (rev && voteVisible) {
      seq.push({ type: 'vote' }, { type: 'auteurs' });
      if (rev.pas_de_cote && rev.pas_de_cote.length) { seq.push({ type: 'pas_de_cote' }); }
    }
    var d = r.dimanche;
    if (d) {
      if (d.sans_faute.length) { seq.push({ type: 'sans_faute' }); }
      if (d.devin.titulaire) { seq.push({ type: 'devin' }); }
      if (d.mystere.titulaire) { seq.push({ type: 'mystere' }); }
      if (d.fidele.titulaires.length) { seq.push({ type: 'fidele' }); }
      if (d.surprise.texte) { seq.push({ type: 'surprise' }); }
      seq.push({ type: 'phrase' });
    }
    if (!cal.estCloture(j)) { seq.push({ type: 'fin' }); }
    return seq;
  }
  function revDe(e, j) {
    var pg = jourE(e, j).page;
    if (!pg.rev) { pg.rev = { commencee: false, ouverte: false, i: 0, max: -1, ret: [], fin: false }; }
    return pg.rev;
  }
  function marquerRevelation(e, j) {
    var rv = revDe(e, j);
    var seq = sequenceRevelation(j);
    if (rv.i > seq.length - 1) { rv.i = seq.length - 1; }
    rv.max = Math.max(rv.max, rv.i);
    if (seq[rv.i] && seq[rv.i].type === 'fin') { rv.fin = true; }
  }

  function eRevelation() {
    var k = K(), rv = jourE(etat(), k).page.rev;
    var seq = sequenceRevelation(k);
    var i = Math.min(rv.i, seq.length - 1);
    var el = seq[i];
    var dots = h('div', { class: 'dots', 'aria-hidden': 'true' }, seq.map(function (x, j) { return h('i', { class: j <= i ? 'on' : '' }); }));
    var r = Rj(k), n = r.revelation ? r.revelation.texte : null, tx = n !== null && scelle.textes[n] ? scelle.textes[n] : null;
    var corps = [dots], bas = [];
    var dernier = i === seq.length - 1;
    var suivant = btn1(X.suivant, dernier ? 'rev-fin-cloture' : 'rev-suivant');
    if (el.type === 'carte') {
      var manche = Rj(k - 1).manches[PORTEUR];
      var c = manche.cartes[el.i];
      var rep = manche.possibles[c.auteur];
      var dv = r.revelation.devineurs[PORTEUR];
      var verdict = dv.verdicts[el.i];
      var retournee = !!rv.ret[el.i];
      var pari;
      if (verdict === 'passe') { pari = X.tuAvaisPasse; }
      else if (c.cachee && c.raison_devinee === 'aucune') { pari = X.tonPariAucune(nomMembre(c.designe)); }
      else if (c.cachee && c.raison_devinee !== null) { pari = X.tonPariRaison(nomMembre(c.designe), X.raisonDansPhrase(consideration(tx, c.raison_devinee).texte)); }
      else { pari = X.tonPariPrenom(nomMembre(c.designe)); }
      var apres = [];
      var auteur = nomMembre(c.auteur_compte);
      if (verdict === 'juste_et_raison') { apres.push(big(t(X.tuConnaisRaisons))); }
      else if (verdict === 'juste') { apres.push(big(t(X.tuConnais))); }
      else if (verdict === 'jumeau_et_raison') { apres.push(big(t(X.tuConnaisRaisons)), p(t(X.jumeau(auteur, nomMembre(c.designe))))); }
      else if (verdict === 'jumeau') { apres.push(big(t(X.tuConnais)), p(t(X.jumeau(auteur, nomMembre(c.designe))))); }
      else if (verdict === 'faux') { apres.push(big(t(X.cEtait(auteur))), p(t(X.caAlors))); }
      else { apres.push(big(t(X.cEtait(auteur)))); }
      if (c.cachee && verdict !== 'juste_et_raison' && verdict !== 'jumeau_et_raison') {
        apres.push(small(t(rep.raison === 'aucune' ? X.saRaisonAucune : X.saRaison(X.raisonFinLigne(consideration(tx, rep.raison).texte)))));
      }
      if (el.i === manche.cartes.length - 1) { apres.push(rule(), small(t(X.points(dv.points, dv.points_semaine)))); }
      var rond = h('div', { class: 'rond' + (retournee ? ' retourne' : '') },
        h('div', { class: 'rond-interieur' },
          h('button', { type: 'button', class: 'rond-face rond-recto', action: retournee ? null : 'retourner', 'aria-label': retournee ? null : t(X.retournerCarte),
            'aria-hidden': retournee ? 'true' : null, tabindex: retournee ? '-1' : null }, '?'),
          h('div', { class: 'rond-face rond-verso', 'aria-hidden': retournee ? null : 'true' }, initiale(c.auteur_compte))));
      corps.push(band(t(X.bandeRevelation(cal.nomCercle, tx.titre))), h('div', { class: 'p' }, h('b', null, t(c.cachee ?
        X.carteLigne(position(rep.niveau), X.carteRaisonCachee) : X.carteLigne(position(rep.niveau), raisonEnLigne(tx, rep.raison))))),
        small(t(pari)), h('div', { class: 'faces centre' }, h('div', { class: 'face L' }, rond)),
        h('div', { class: 'apres' + (retournee ? '' : ' cache'), 'aria-hidden': retournee ? null : 'true', 'aria-live': 'polite' }, apres));
      if (!retournee) { suivant.classList.add('reserve'); suivant.setAttribute('aria-hidden', 'true'); suivant.setAttribute('tabindex', '-1'); suivant.removeAttribute('data-action'); }
    } else if (el.type === 'vote') {
      corps.push(band(t(tx.titre)), q(t(X.etLAssemblee)), big(t(X.issue[tx.vote.issue])), p(t(ligneVote27d(tx))));
      if (r.revelation.avis_cercle) { corps.push(avisCercle(r.revelation.avis_cercle)); }
    } else if (el.type === 'auteurs') {
      corps.push(band(t(tx.titre)), h('div', { class: 'p' }, phraseElus(proposePar(tx, '2.7e'))));
      var maRep = reponsePorteur(n);
      if (maRep && maRep.raison !== 'aucune') { corps.push(rule(), h('div', { class: 'p' }, phraseElus(taRaison(tx, maRep.raison)))); }
    } else if (el.type === 'pas_de_cote' || el.type === 'sans_faute') {
      var liste = el.type === 'pas_de_cote' ? r.revelation.pas_de_cote : r.dimanche.sans_faute;
      var noms = N.listeEt(liste.map(nomOuMarque));
      corps.push(label(t(X.badgeRare)), faces(liste.map(function (m) { return dot(initiale(m), 'L'); })),
        big(tp(el.type === 'pas_de_cote' ? X.pasDeCote(noms, liste.length > 1) : X.sansFaute(noms, liste.length > 1))),
        p(t(el.type === 'pas_de_cote' ? X.pasDeCoteLigne(liste.length > 1) : X.sansFauteLigne)));
    } else if (el.type === 'devin' || el.type === 'mystere') {
      var tit = r.dimanche[el.type].titulaire;
      corps.push(label(t(X.titresDeLaSemaine(cal.nomCercle))), faces([dot(initiale(tit), 'L')]),
        big(tp(el.type === 'devin' ? X.devin(nomOuMarque(tit)) : X.mystere(nomOuMarque(tit)))), p(t(el.type === 'devin' ? X.devinLigne : X.mystereLigne)));
    } else if (el.type === 'fidele') {
      var fs = r.dimanche.fidele.titulaires;
      corps.push(label(t(X.titresDeLaSemaine(cal.nomCercle))), faces(fs.map(function (m) { return dot(initiale(m), 'L', nomMembre(m)); })),
        big(tp(X.fidele(N.listeEt(fs.map(nomOuMarque))))), p(t(X.fideleLigne(fs.length > 1))));
    } else if (el.type === 'surprise') {
      var st = r.dimanche.surprise.texte;
      corps.push(label(t(X.surpriseSemaine)), big(t(titreDe(st))), p(t(X.surpriseLigne)),
        scelle.textes[st] ? lien(t(X.voirLeTexte), 'fiche', { texte: st }) : null);
    } else if (el.type === 'phrase') {
      var ps = r.dimanche.phrase_semaine;
      corps.push(label(t(X.pourToiSemaine)), big(ps.phrase));
      if (ps.tension) { corps.push(slider(indexT8(ps.tension), Rj(k - 1).portrait.tensions[ps.tension])); }
    } else if (el.type === 'fin') {
      corps.push(big(t(X.maintenantQuestion)), n !== null && tx ? lien(t(X.texteEtSources), 'fiche', { texte: n }) : null);
      suivant = btn1(X.jouer, 'rev-jouer');
    }
    bas.push(suivant);
    return ecranTel(corps, bas, { soir: true, croix: true, aria: t(X.revelationAria) });
  }

  /* ---- L'avis du cercle (§7.14 ; forme : §7.23 B) ---- */

  function partEnMots(c, total) {
    if (c === 0) { return X.avisPart.aucune; }
    if (c === total) { return X.avisPart.toutes; }
    if (2 * c === total) { return X.avisPart.moitie; }
    if (2 * c > total) { return X.avisPart.plupart; }
    if (4 * c < total) { return X.avisPart.peu; }
    return X.avisPart.partie;
  }
  function avisCercle(a) {
    var total = a.comptes.reduce(function (s, x) { return s + x; }, 0);
    var cumul = 0;
    var rangs = X.POSITIONS.map(function (lib, i) {
      var c = a.comptes[i];
      var g = cumul;
      cumul += c;
      var milieu = a.milieu.indexOf(i + 1) >= 0;
      var piste = h('span', { class: 'piste' });
      if (c > 0) {
        var b = h('i', { class: 'part' });
        // Fractions exactes ; une frontière commune à deux barres tombe au même endroit (§7.23 B).
        b.style.left = (100 * g / total) + '%';
        b.style.width = (100 * c / total) + '%';
        piste.appendChild(b);
      }
      // Le libellé et son double en gras, invisible, dans la même case : la colonne prend la largeur
      // du plus large libellé composé en gras, quel que soit celui qui l'est (§7.23 B).
      var etiquette = h('span', { class: 'lib' + (c === 0 ? ' vide' : '') + (milieu ? ' mediane' : '') }, h('span', null, t(lib)), h('span', { class: 'fantome' }, t(lib)));
      // Rangée explicite : le fil occupe la colonne des barres sur les cinq rangées.
      etiquette.style.gridRow = String(i + 1); piste.style.gridRow = String(i + 1);
      etiquette.style.gridColumn = '1'; piste.style.gridColumn = '2';
      return [etiquette, piste];
    });
    var milieu = a.milieu.length === 2 ? X.avisMilieuEntre(position(a.milieu[0]).toLowerCase(), position(a.milieu[1]).toLowerCase()) : position(a.milieu[0]).toLowerCase();
    var aria = t(X.avisAria(a.comptes.map(function (c) { return partEnMots(c, total); }), milieu));
    // La légende du fil est la sixième rangée de la même grille : elle se centre sous le fil (§7.14).
    var graphe = h('div', { class: 'escalier', role: 'img', 'aria-label': aria },
      rangs, h('span', { class: 'fil-zone', 'aria-hidden': 'true' }, h('i', { class: 'fil' })),
      h('span', { class: 'legende-milieu', 'aria-hidden': 'true' }, t(X.milieuDesReponses)));
    // Les libellés dessinés ne sont pas lus une seconde fois : l'image a son nom.
    Array.prototype.forEach.call(graphe.querySelectorAll('.lib'), function (x) { x.setAttribute('aria-hidden', 'true'); });
    return h('div', { class: 'box avis' }, h('div', { class: 'ttl' }, t(X.avisLigne[a.ligne])), graphe);
  }

  /* ---- Le Cercle (4.2, §7.16), l'écran d'un proche (4.3) ---- */

  function titresLibelles(codes) { return X.ORDRE_TITRES.filter(function (c) { return codes.indexOf(c) >= 0; }).map(function (c) { return X.TITRES[c]; }); }
  function temperamentsLibelles(codes) { return X.ORDRE_TEMPERAMENTS.filter(function (c) { return codes.indexOf(c) >= 0; }).map(function (c) { return X.TEMPERAMENTS[c]; }); }

  /** Les curseurs que le porteur voit le jour j : les siens (accélérés), et ceux des personnages. */
  function curseurDe(j, m, code) { return m === PORTEUR ? Rj(j).portrait.tensions[code] : Rj(j).curseurs_vus[m][code]; }
  /** Son rond est-il posé sur au moins une barre du Cercle (note du portrait accéléré, §7.15) ? */
  function rondPorteurPose(j) { return ['S', 'P', 'T', 'L'].some(function (c) { return Rj(j).portrait.tensions[c].net; }); }

  /** Deux ronds dont les centres sont plus proches que cette part de la barre se chevauchent (rond de 24 px, barre d'environ 270 px). */
  var CHEVAUCHEMENT = 0.09;
  function barreCercle(j, i) {
    var code = X.T8[i].code;
    var membres = cal.membres;
    var nets = [], flous = [];
    membres.forEach(function (m) {
      var cur = code ? curseurDe(j, m, code) : null;
      if (cur && cur.net) { nets.push({ m: m, c: frac(cur.c).pourDessiner(), cur: cur }); } else { flous.push(m); }
    });
    var track = h('div', { class: 'track barre-cercle' });
    // Deux ronds trop proches : l'un passe au-dessus du fil, l'autre dessous ; l'ordre de gauche à droite est gardé (§7.16).
    var tries = nets.slice().sort(function (a, b) { return a.c - b.c; });
    var niveaux = [];
    tries.forEach(function (x, k) {
      if (k > 0 && x.c - tries[k - 1].c < CHEVAUCHEMENT) {
        if (!niveaux[k - 1]) { niveaux[k - 1] = 'haut'; }
        niveaux[k] = niveaux[k - 1] === 'haut' ? 'bas' : 'haut';
      } else { niveaux[k] = ''; }
    });
    tries.forEach(function (x, k) {
      var e = h('span', { class: 'ini' + (niveaux[k] ? ' ' + niveaux[k] : '') }, initiale(x.m));
      e.style.left = (x.c * 100) + '%';
      track.appendChild(e);
    });
    if (niveaux.some(function (x) { return x; })) { track.classList.add('etagee'); }
    var entre = code ? X.POLES_PHRASE[code][2] : X.T8[i].poles[0] + ' et ' + X.T8[i].poles[1];
    var aria = X.barreCercleAria(entre, nets.map(function (x) { return nomMembre(x.m) + ', ' + lectureCurseur(code, x.cur); }), flous.map(nomMembre));
    return h('div', { class: 'slider', role: 'img', 'aria-label': t(aria) }, h('div', { class: 'poles', 'aria-hidden': 'true' }, h('span', null, t(X.T8[i].poles[0])), h('span', null, t(X.T8[i].poles[1]))),
      track, flous.length ? h('div', { class: 'small', 'aria-hidden': 'true' }, tp(X.encoreFlou(flous.map(nomOuMarque).join(', ')))) : null);
  }

  function eCercle() {
    var j = jourAffiche(), r = Rj(j);
    var visages = cal.membres.map(function (m) {
      var legende = titresLibelles(r.cercle.titres[m] || []).concat(m === PORTEUR ? [] : temperamentsLibelles(r.cercle.temperaments[m] || [])).map(t);
      if (m === PORTEUR) { return dot(initiale(m), '', pseudo(), legende, '', 'mon-visage', null, [pseudo()].concat(legende).join(', ')); }
      return dot(initiale(m), '', m, legende, '', 'proche', { membre: m }, [m].concat(legende).join(', '));
    });
    var corps = [hd(h('button', { type: 'button', class: 'plain hd-gauche', action: 'absent' }, t(X.cercleTete(cal.nomCercle))),
      h('button', { type: 'button', class: 'plain right', action: 'absent' }, t(X.inviter))), faces(visages)];
    if (r.cercle.surprise) {
      // L'encadré n'ouvre rien (§7.16).
      corps.push(h('div', { class: 'box' }, h('div', { class: 'p' }, h('b', null, t(X.surpriseEncadre)), ' ' + t(titreDe(r.cercle.surprise)))));
    }
    corps.push(label(t(X.ouChacun)));
    for (var i = 0; i < 8; i++) { corps.push(barreCercle(j, i)); }
    corps.push(lien(t(X.titresPassesLien), 'titres-passes'));
    return ecranTel(corps, [tabbar(1)]);
  }

  function eProche(m) {
    var j = jourAffiche(), r = Rj(j);
    var tit = titresLibelles(r.cercle.titres[m] || []);
    var corps = [back(X.leCercle, 'retour'), faces([dot(initiale(m), 'L', m, tit.length ? t(X.titreCetteSemaine(N.listeEt(tit))) : null)]),
      small(t('● ' + X.legendeToi) + '   ' + t('◎ ' + m))];
    // D'abord les tensions où vous êtes nets tous les deux, puis les autres, chaque groupe dans l'ordre fixe (maquette 4.3).
    var ordre = [0, 1, 2, 3, 4, 5, 6, 7];
    var deuxNets = function (i) { var c = X.T8[i].code; return !!c && curseurDe(j, PORTEUR, c).net && curseurDe(j, m, c).net; };
    ordre.filter(deuxNets).concat(ordre.filter(function (i) { return !deuxNets(i); })).forEach(function (i) {
      var code = X.T8[i].code;
      var moi = code ? curseurDe(j, PORTEUR, code) : ECARTE, lui = code ? curseurDe(j, m, code) : ECARTE;
      var aria = X.superpositionAria(ariaCurseur(i), lectureCurseur(code, moi), m, lectureCurseur(code, lui));
      corps.push(h('div', { class: 'slider', role: 'img', 'aria-label': t(aria) }, poles(i), h('div', { class: 'track' }, marque(moi), marque(lui, true))));
    });
    var sur = r.surprises_proches[m] || [];
    if (sur.length) {
      corps.push(label(t(X.sesSurprises)));
      var montrees = temp.voirTout === m ? sur : sur.slice(0, 2);
      montrees.forEach(function (n) {
        var manche = Rj(cal.jourDeReponse(n) + 1).manches[PORTEUR];
        var c = manche.cartes.filter(function (x) { return x.auteur_compte === m; })[0];
        var rep = manche.possibles[c.auteur];
        var tx = texteDe(n);
        corps.push(h('button', { type: 'button', class: 'listrow', action: 'fiche', 'data-texte': n },
          h('span', null, t(X.surpriseLigneTexte(tx.titre, position(rep.niveau), raisonEnLigne(tx, rep.raison)))), h('span', null, t(X.tuPensais(nomMembre(c.designe))))));
      });
      if (sur.length > 2 && temp.voirTout !== m) { corps.push(lien(t(X.voirTout), 'voir-tout', { membre: m })); }
    }
    return ecranTel(corps, [tabbar(1)]);
  }

  /** Titres de chaque semaine tombée (5.5, 5.2) : R.titres, forme de calculerTitres. */
  function semainesTombees() { return (R().titres || []).slice(); }
  function titulairesDe(w) {
    return { sans_faute: w.sans_faute || [], devin: w.devin && w.devin.titulaire ? [w.devin.titulaire] : [],
      mystere: w.mystere && w.mystere.titulaire ? [w.mystere.titulaire] : [], fidele: w.fidele ? w.fidele.titulaires : [] };
  }
  function eTitresPasses() {
    var corps = [back(X.leCercle, 'retour'), ttl(t(X.titresPassesTitre))];
    semainesTombees().reverse().forEach(function (w) {
      var tt = titulairesDe(w);
      var parts = X.ORDRE_TITRES.filter(function (c) { return tt[c].length; }).map(function (c) {
        return X.TITRES_COURTS[c] + ' : ' + tt[c].map(nomOuMarque).join(', ');
      });
      corps.push(h('div', { class: 'listrow' }, h('span', null, t(X.semaine(w.semaine))), h('span', null, tp(parts.join(' · ')))));
    });
    return ecranTel(corps, [tabbar(1)]);
  }

  /* ---- Moi (4.1, 5.11, 5.2, 5.3), fiche (5.4), réglages (5.7) ---- */

  function enteteMoi(courant) {
    var cibles = ['moi-portrait', 'moi-titres', 'moi-historique'];
    return [hd(hdTitre(t(X.moi)), h('button', { type: 'button', class: 'plain right', action: 'reglages', 'aria-label': t(X.reglagesNom) }, h('span', { class: 'texte-systeme' }, X.reglagesIcone))),
      h('div', { class: 'subtabs' }, X.sousOnglets.map(function (o, i) {
        return i === courant ? h('span', { class: 'on', 'aria-current': 'page' }, t(o)) : h('button', { type: 'button', class: 'plain', action: cibles[i] }, t(o));
      }))];
  }
  /** La barre du portrait (§7.15 ; forme §7.23 C). */
  function barrePortrait(j) {
    var b = Rj(j).portrait.barre;
    var longueur = frac(b.longueur).pourDessiner();
    var avant = vue().barreVue !== undefined ? vue().barreVue : null;
    // Arrondi au quart inférieur (§7.15), sur la fraction exacte.
    var quart = Math.min(3, Math.floor(Number(frac(b.longueur).fois(4).n / frac(b.longueur).fois(4).d)));
    var valeur = b.pleine ? X.barreValeurs[5] : (b.n === 0 ? X.barreValeurs[0] : X.barreValeurs[1 + quart]);
    var fait = h('i', { class: 'fait' });
    var depart = avant === null ? longueur : Math.min(avant, longueur);
    fait.style.width = (depart * 100) + '%';
    var chemin = h('span', { class: 'chemin' }, fait);
    var e = h('div', { class: 'box barre-portrait' }, label(t(X.barreEtiquette)),
      h('div', { class: 'barre-zone', role: 'img', 'aria-label': t(X.barreAria(valeur)) }, chemin, h('i', { class: 'borne' })));
    if (depart < longueur) { animerBarre(fait, longueur); }
    return { el: e, longueur: longueur, pleine: b.pleine };
  }
  function animerBarre(fait, longueur) {
    var reduire = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduire) { fait.style.width = (longueur * 100) + '%'; return; }
    window.setTimeout(function () { fait.classList.add('avance'); fait.style.width = (longueur * 100) + '%'; }, 150);
  }
  function eMoiPortrait() {
    var j = jourAffiche(), r = Rj(j);
    var bp = barrePortrait(j);
    var tensions = r.portrait.tensions, ordre = r.portrait.ordre_moi;
    var nets = ordre.filter(function (c) { return tensions[c].net; }), flous = ordre.filter(function (c) { return !tensions[c].net; });
    var corps = enteteMoi(0).concat([bp.el]);
    if (nets.length) {
      // 4.1 : les curseurs nets, sans intitulé ; « Encore flous », les flous, puis les tensions écartées ; pas de phrase en bas.
      nets.forEach(function (c) { corps.push(slider(indexT8(c), tensions[c])); });
      corps.push(label(t(X.encoreFlous)));
      flous.forEach(function (c) { corps.push(slider(indexT8(c), tensions[c])); });
      X.ECARTEES.forEach(function (i) { corps.push(slider(i, ECARTE)); });
    } else {
      // 5.11 : les huit curseurs, puis la phrase validée.
      ordre.forEach(function (c) { corps.push(slider(indexT8(c), tensions[c])); });
      X.ECARTEES.forEach(function (i) { corps.push(slider(i, ECARTE)); });
      corps.push(small(t(X.portraitPasForme)));
    }
    return ecranTel(corps, [tabbar(2)]);
  }
  function eMoiTitres() {
    var corps = enteteMoi(1);
    var essai = semainesTombees().filter(function (w) { return cal.semainesEssai.indexOf(w.semaine) >= 0; });
    var lignesT = [];
    essai.slice().reverse().forEach(function (w) {
      var tt = titulairesDe(w);
      var l = X.ORDRE_TITRES.filter(function (c) { return tt[c].indexOf(PORTEUR) >= 0; }).map(function (c) { return X.TITRES[c]; });
      if (l.length) { lignesT.push(h('div', { class: 'listrow' }, h('span', null, t(X.semaine(w.semaine))), h('span', null, t(X.titresMoi(l.join(', '), cal.nomCercle))))); }
    });
    if (lignesT.length) { corps = corps.concat(lignesT); }
    else { corps.push(p(t(essai.length ? X.pasDeTitreApres : X.pasDeTitreAvant))); }
    return ecranTel(corps, [tabbar(2)]);
  }
  function eMoiHistorique() {
    var corps = enteteMoi(2), e = etat(), k = K();
    for (var j = Math.min(k, cal.dernierJeu); j >= cal.premier; j--) {
      var d = jourE(e, j);
      if (!d || !d.coups.reponse) { continue; }
      var n = cal.ligne(j).repondu;
      var revele = j + 2 <= k;
      var droite = revele ? position(d.coups.reponse.niveau) : X.historiqueRevele(position(d.coups.reponse.niveau), nomJourApres(j, 2));
      corps.push(h('button', { type: 'button', class: 'listrow', action: 'fiche', 'data-texte': n },
        h('span', null, t(X.historiqueGauche(nomJour(j), texteDe(n).titre))), h('span', null, t(droite))));
    }
    // Les textes d'entrée, en bas, le plus ancien en bas (E6, §7.1).
    cal.textesEntree.slice().reverse().forEach(function (En) {
      var rep = reponsePorteur(En);
      if (!rep) { return; }
      corps.push(h('button', { type: 'button', class: 'listrow', action: 'fiche', 'data-texte': En },
        h('span', null, t(X.historiqueEntree(texteDe(En).titre))), h('span', null, t(position(rep.niveau)))));
    });
    return ecranTel(corps, [tabbar(2)]);
  }

  /** Le texte n est-il révélé au porteur à ce point de la partie ? */
  function estRevele(n) {
    if (cal.textesEntree.indexOf(n) >= 0) { return true; }
    return cal.jourDeReponse(n) + 2 <= K();
  }
  function eFiche(n, options) {
    options = options || {};
    var tx = texteDe(n);
    var entree = cal.textesEntree.indexOf(n) >= 0;
    var revele = options.dernier || estRevele(n);
    var j = entree ? null : cal.jourDeReponse(n);
    var rep = reponsePorteur(n);
    var corps = [back(X.retour, options.dernier ? 'absent' : 'retour'), ttl(t(tx.titre))];
    if (revele && !options.dernier && !entree) { corps.push(small(t(X.revele(nomJourApres(j, 2))))); }
    corps.push(lignes(tx.lignes.map(t)));
    if (rep) { corps.push(h('div', { class: 'p' }, h('b', null, t(X.taReponse)), ' ' + t(position(rep.niveau) + ' · ' + raisonEnLigne(tx, rep.raison)))); }
    if (!revele) {
      corps.push(p(t(X.voteEtAuteurs(nomJourApres(j, 2)))));
      return ecranTel(corps, [tabbar(ongletCourant())]);
    }
    var vt = t(ligneVote54(tx)), tete = t(X.voteTete);
    corps.push(h('div', { class: 'p' }, h('b', null, tete), vt.slice(tete.length)));
    corps.push(h('div', { class: 'p' }, phraseElus(proposePar(tx, '5.4'))));
    corps.push(label(t(X.quatreRaisons)));
    tx.considerations.forEach(function (c) {
      var dep = c.depute;
      corps.push(h('div', { class: 'listrow' }, h('span', null, t(X.raisonFinLigne(c.texte))),
        h('span', null, h('span', { class: 'insecable' }, t(dep.nom)), h('br'), insecables(t(dep.groupe === null ? X.sansGroupeListe : dep.groupe), [], dep.groupe ? [dep.groupe] : []))));
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
    if (!options.dernier) { bas.push(tabbar(ongletCourant())); }
    return ecranTel(corps, bas);
  }
  function eReglages() {
    var c = jourE(etat(), cal.premier).coups.compte;
    return ecranTel([
      back(X.moi, 'retour'), ttl(t(X.reglagesTitre)),
      label(t(X.compte)), h('div', { class: 'listrow' }, h('span', null, t(X.champPseudo)), h('span', null, pseudo())),
      h('div', { class: 'listrow' }, h('span', null, t(X.connexion)), h('span', null, c ? X.connexionValeur[c] : '')),
      label(t(X.cercles)), h('div', { class: 'listrow' }, h('span', null, t(cal.nomCercle)), h('button', { type: 'button', class: 'plain', action: 'absent' }, t(X.cerclesActions))),
      label(t(X.message18hTitre)), h('button', { type: 'button', class: 'toggle', action: 'absent', role: 'switch', 'aria-checked': 'true' }, h('span', null, t(X.recevoirMessage)), h('i', { 'aria-hidden': 'true' })),
      label(t(X.tesDonnees)), lien(t(X.quiDureeDroits), 'droits'), rule(), lien(t(X.toutEffacer), 'effacer')
    ], [tabbar(2)]);
  }

  function ongletCourant() {
    var v = vue().tel;
    var base = v.pile.length ? v.pile[0].ecran : v.ecran;
    if (/^(cercle|proche|titres-passes)$/.test(base)) { return 1; }
    if (/^(moi-|reglages)/.test(base)) { return 2; }
    return 0;
  }

  function rendreTelephone() {
    var v = vue().tel, e = v.ecran;
    switch (e) {
      case '1.1': return e11();
      case '1.2': return e12(v.E);
      case '1.3': return e13();
      case '1.4': return e14(v.E);
      case '1.5': return e15(v.E);
      case '1.6': return e16(v.E);
      case '1.7': return e17();
      case '1.8': return e18();
      case '1.8b': return e18b();
      case '1.9': return e19();
      case 'deviner': return eDeviner();
      case 'repondre': return eRepondre();
      case 'raison': return eRaison(false);
      case 'attente': return eAttente();
      case 'ratt-position': return eRattPosition();
      case 'ratt-raison': return eRaison(true);
      case 'ratt-attente': return eRattAttente();
      case 'verrou': return eVerrou();
      case 'revelation': return eRevelation();
      case 'cercle': return eCercle();
      case 'proche': return eProche(v.membre);
      case 'titres-passes': return eTitresPasses();
      case 'moi-portrait': return eMoiPortrait();
      case 'moi-titres': return eMoiTitres();
      case 'moi-historique': return eMoiHistorique();
      case 'fiche': return eFiche(v.texte, { dernier: v.dernier });
      case 'reglages': return eReglages();
    }
    throw new Error('écran inconnu : ' + e);
  }

  /* ================================================================== */
  /* Le cadre : barre, bande, pages (§8)                                */
  /* ================================================================== */

  function journalCourant() { return E.journal(etat(), cal, socle.empreinte(), undefined, relevesCopies); }
  function dureesCourantes() { return E.fichierDurees(etat(), cal, socle.horloge(), undefined, relevesCopies); }
  function momentArret() { return CR.moment(cal, journalCourant(), K()); }
  function libelleBarre() {
    var e = etat();
    if (!e) { return X.barreDebut; }
    var v = vue(), c = v.cadre;
    if (e.arret) {
      var m = momentArret();
      return m.quoi === 'entree' ? X.barreArretEntree : (m.quoi === 'saut' ? X.barreArretSaut(m.n) : X.barreArretJour(m.k));
    }
    if (c && (c.page === 'message0' || c.page === 'arrivee')) { return X.barreDebut; }
    if (c && c.page === 'saut') { return X.barreSaut(cal.sautDuJour(K()).numero); }
    var r = E.rattrapage(e, cal);
    if (r) { return X.barreRattrapage(r.numero, r.rang, r.total); }
    if (cal.estCloture(K())) { return X.barreCloture; }
    return X.barreJour(K(), nomJour(K()));
  }
  function rendreBarre() {
    var e = etat();
    var v = e ? vue() : null;
    var pageCadre = !e || !!v.cadre;
    var gauche = h('div', { class: 'barre-gauche' }, h('div', { class: 'barre-jour' }, t(libelleBarre())));
    var enJeu = e && !pageCadre && !e.arret && !e.fin;
    if (enJeu && K() <= cal.dernierJeu) { gauche.appendChild(h('button', { type: 'button', class: 'barre-arret', action: 'arreter' }, t(X.arreterLEssai))); }
    var droite = enJeu ? h('button', { type: 'button', class: 'bouton-cadre barre-qui', action: 'qui-est-qui' }, t(X.quiEstQuiBouton)) : null;
    return h('header', { class: 'barre' }, gauche, droite);
  }

  /** Les écrans qui montrent un curseur du porteur (§7.15, signalement). */
  function montreCurseurPorteur() {
    var v = vue().tel, e = v.ecran;
    if (e === '1.7' || e === 'moi-portrait' || e === 'proche') { return true; }
    if (e === 'cercle') { return rondPorteurPose(jourAffiche()); }
    if (e === 'revelation') {
      var k = K(), seq = sequenceRevelation(k), el = seq[Math.min(jourE(etat(), k).page.rev.i, seq.length - 1)];
      return el.type === 'phrase' && !!Rj(k).dimanche.phrase_semaine.tension;
    }
    return false;
  }
  function noteDurable() {
    var e = etat(), v = vue();
    if (v.cadre) { return null; }
    var ec = v.tel.ecran;
    if (ec === '1.8' || ec === '1.8b' || ec === '1.9') {
      var mot = ec === '1.8' ? motifRefus(pseudoSaisi()) : null;
      if (mot === 'prenom') { return X.notePrenom; }
      if (mot === 'rond') { return X.noteRond; }
      return X.noteCompte(appareil);
    }
    if (v.noteSaut && (ec === 'verrou' || (ec === 'revelation' && elementCourant().type === 'carte') || (ec === 'revelation' && elementCourant().type === 'vote'))) {
      return X.noteApresSaut(X.nombresEnLettres[v.noteSaut.jours] || String(v.noteSaut.jours));
    }
    if (ec === 'fiche' && v.tel.dernier) { return X.noteDernierTexte; }
    if (montreCurseurPorteur()) { return X.noteAccelere(facteurEnLettres()); }
    if (cal.estArrivee(K()) && E.journeeFinie(e, cal, K())) { return X.note18h; }
    return null;
  }
  function elementCourant() { var k = K(), seq = sequenceRevelation(k); return seq[Math.min(jourE(etat(), k).page.rev.i, seq.length - 1)]; }

  function bouton(libelle, action, options) {
    options = options || {};
    return h('button', { type: 'button', class: 'bouton-cadre' + (options.avant ? ' avant' : '') + (options.desactive ? ' desactive' : ''), action: options.desactive ? null : action,
      'aria-disabled': options.desactive ? 'true' : null, 'aria-label': options.aria || null }, t(libelle));
  }
  function lienCadre(libelle, action) { return h('button', { type: 'button', class: 'lien-cadre', action: action }, t(libelle)); }

  /** Phrase de perte de « Abandonner cette journée » (§8.1 bis). */
  function phrasePerte() {
    var e = etat(), k = K(), d = jourE(e, k);
    var l = [];
    if (revelationPresente(k)) {
      var seq = sequenceRevelation(k), rv = d.page.rev || { max: -1 };
      if (rv.max < seq.length - 1) {
        var iTitres = -1, iPhrase = -1;
        seq.forEach(function (x, i) {
          if (iTitres < 0 && ['sans_faute', 'devin', 'mystere', 'fidele', 'surprise'].indexOf(x.type) >= 0) { iTitres = i; }
          if (x.type === 'phrase') { iPhrase = i; }
        });
        if (Rj(k).dimanche && iTitres >= 0 && rv.max < iTitres) { l.push(X.perteRevelationTitres); }
        else if (Rj(k).dimanche && iPhrase >= 0 && rv.max < iPhrase) { l.push(X.perteRevelationPhrase); }
        else { l.push(X.perteRevelation); }
      }
    }
    var dv = d.coups.deviner;
    if (cal.ligne(k).deviner_porteur && dv === null) { l.push(X.perteDevinerJamais); }
    else if (dv && !dv.validee) {
      var n = dv.cartes.length;
      var sans = dv.cartes.filter(function (c) { return personnages().indexOf(c.designe) < 0; }).length;
      if (sans === n) { l.push(X.perteAucunVisage(n)); }
      else if (sans > 0) { l.push(X.perteCertainsVisages(sans)); }
      else { l.push(X.perteTousVisages); }
    } else {
      l.push(temp.position && temp.jour === k ? X.perteReponsePosition : X.perteReponse);
    }
    return l.join(' ');
  }

  function rendreBande() {
    var e = h('div', { class: 'bande' });
    var et = etat();
    if (!et) {
      // Page de la partie du premier essai (§8.2 A), avant tout état.
      if (bande.ancienneConfirmation) {
        e.appendChild(h('div', { class: 'note confirmation', role: 'alertdialog', 'aria-live': 'assertive' },
          h('p', { class: 'fort' }, t(X.ancienneConfirmationTitre)), h('p', null, t(X.ancienneConfirmation)),
          h('div', { class: 'actions' }, bouton(X.annuler, 'ancienne-annuler', { avant: true }), bouton(X.effacer, 'ancienne-confirmer'))));
      } else {
        e.appendChild(h('div', { class: 'actions' }, bouton(ancienneInfo && ancienneInfo.deuxParties ? X.effacerEtReprendre : X.effacerEtCommencer, 'ancienne-effacer', { avant: true })));
      }
      return e;
    }
    var v = vue(), cadre = v.cadre, actions = [], note = null;
    if (cadre) {
      if (bande.messageCopie && cadre.page === 'export') { note = bande.messageCopie; }
      actions = actionsPage(cadre);
    } else {
      note = bande.note || noteDurable();
      var k = K();
      var r = E.rattrapage(et, cal);
      if (r) {
        if (r.termine) { actions = [bouton(X.allerAuDimanche, 'aller-au-dimanche', { avant: true })]; }
        else {
          var pret = r.rang === r.repondus;
          actions = [bouton(X.texteSuivantCadre, 'texte-suivant', { avant: pret, desactive: !pret, aria: pret ? null : t(X.texteSuivantIndisponible) })];
        }
      } else if (et.arret || et.fin) {
        actions = [];
      } else if (v.tel.ecran === 'fiche' && v.tel.dernier) {
        actions = [bouton(X.continuer, 'cloture-apres-dernier', { avant: true })];
      } else if (cal.estPointDeSaut(k)) {
        var rv = jourE(et, k).page.rev;
        if (rv && rv.fin) { actions = [bouton(X.avancerAuDimanche, 'ouvrir-saut', { avant: true })]; }
      } else if (cal.estJoue(k) && !(cal.estArrivee(k) && jourE(et, k).coups.compte === null)) {
        if (bande.confirmation) {
          e.appendChild(h('div', { class: 'note confirmation', role: 'alertdialog', 'aria-live': 'assertive' },
            h('p', { class: 'fort' }, t(X.abandonnerQuestion)), h('p', null, t(phrasePerte())), h('p', null, t(X.abandonnerDefinitif)),
            h('div', { class: 'actions' }, bouton(X.abandonner, 'abandon-confirmer'), bouton(X.annuler, 'abandon-annuler', { avant: true }))));
          return e;
        }
        var finie = E.journeeFinie(et, cal, k);
        var rangee = h('div', { class: 'actions rangee-jour' });
        if (!finie) { rangee.appendChild(lienCadre(X.abandonnerJournee, 'abandonner')); }
        rangee.appendChild(bouton(X.jourSuivant, 'jour-suivant', { avant: finie, desactive: !finie, aria: finie ? null : t(X.jourSuivantIndisponible) }));
        if (note) { e.appendChild(h('div', { class: 'note', role: 'status' }, t(note))); }
        e.appendChild(rangee);
        return e;
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
      var on = Array.isArray(choisi) ? choisi.indexOf(x.code) >= 0 : choisi === x.code;
      var b = h('button', { type: 'button', class: 'bouton-choix' + (on ? ' retenu' : ''), action: action, 'data-valeur': x.code, 'aria-pressed': on ? 'true' : 'false' },
        on ? h('span', { class: 'coche', 'aria-hidden': 'true' }, '✓ ') : null, t(x.libelle));
      return donnees(b, extra);
    }));
  }
  function libelles(codes, table) {
    return codes.map(function (c) { var v = table[c]; return { code: c, libelle: typeof v === 'function' ? v(cal.invitant) : v }; });
  }

  function actionsPage(c) {
    switch (c.page) {
      case 'message0': return [bouton(X.continuer, 'message0-continuer', { avant: true })];
      case 'arrivee': return [bouton(X.commencer, 'commencer', { avant: true })];
      case 'quiestqui': case 'droits': return [bouton(X.fermer, 'fermer-page')];
      case 'carnet': return [bouton(X.annuler, 'carnet-annuler'), bouton(X.allerJourSuivant, 'aller-jour-suivant', { avant: true, desactive: bande.passage })];
      case 'saut': return [bouton(X.annuler, 'saut-annuler'), bouton(X.avancerAuDimanche, 'saut-confirmer', { avant: true })];
      case 'arret-confirmation': return [bouton(X.annuler, 'fermer-page'), bouton(X.arreterLEssai, 'arret-confirmer')];
      case 'arret-questions': return [bouton(X.continuer, 'arret-continuer', { avant: true })];
      case 'cloture-questions': return [bouton(X.continuer, 'cloture-continuer', { avant: true })];
      case 'export':
        if (c.mode === 'jour') { return [bouton(X.copierCarnet, 'copier-carnet', { avant: true }), bouton(X.allerJourSuivant, 'aller-jour-suivant', { desactive: bande.passage })]; }
        if (c.mode === 'dabord') { return [bouton(X.copierCarnet, 'copier-carnet', { avant: true }), bouton(X.fermer, 'export-fermer')]; }
        return [bouton(X.copierCarnet, 'copier-carnet', { avant: true }), bouton(X.voirDevoilement, 'voir-devoilement')];
      case 'devoilement': return [bouton(X.toutEffacer, 'effacer')];
      case 'effacer': return [bouton(X.annuler, 'fermer-page', { avant: true }), bouton(X.copierCarnetDabord, 'copier-dabord'), bouton(X.toutEffacer, 'effacer-confirmer')];
    }
    return [];
  }

  /* ---- Pages du début (§8.2) ---- */

  function pageAncienne() {
    return [titrePage(t(ancienneInfo && ancienneInfo.deuxParties ? X.ancienneTitreDeux : X.ancienneTitre)), panneau(h('p', null, t(ancienneInfo && ancienneInfo.deuxParties ? X.ancienneTexteDeux(appareil) : X.ancienneTexte(appareil)))), pied(true)];
  }
  function pageMessage0() {
    var m = X.message0(appareil);
    return [panneau(h('h1', { class: 'titre-page', tabindex: '-1' }, t(m[0])), h('p', null, t(m[1])), h('ul', null, m[2].map(function (x) { return h('li', null, t(x)); }))), pied(true)];
  }
  function pageArrivee() {
    return [titrePage(t(X.arriveeTitre(cal.nomCercle))),
      panneau(h('p', null, t(X.arriveePanneau1(personnages(), cal.invitant)))),
      panneau(h('h2', null, t(X.arriveeProgrammeTitre)), h('ul', null, X.arriveeProgramme.map(function (x) { return h('li', null, t(x)); })), h('p', null, t(X.arriveeDuree))),
      panneau(h('h2', null, t(X.arriveePortraitTitre)), h('p', null, t(X.arriveePortrait(facteurEnLettres())))),
      h('p', null, t(X.arriveeFin)), pied(true)];
  }
  function pageQuiEstQui() {
    var cartes = personnages().map(function (pp) {
      var f = scelle.personnages[pp];
      return panneau(h('p', null, h('strong', null, pp), t(X.ficheTete(f.age, f.metier, f.ville))),
        h('p', null, t(f.ligne_de_vie + ' ' + X.ficheHeure(N.heureEcrite(f.heure_de_jeu)) + (pp === cal.invitant ? ' ' + X.ficheInvitant : ''))));
    });
    return [titrePage(t(X.quiEstQuiTitre)), h('p', null, t(X.quiEstQuiEntete))].concat(cartes, [pied(true)]);
  }
  function pageDroits() { return [titrePage(t(X.droitsTitre)), panneau(X.droits(appareil).map(function (x) { return h('p', null, t(x)); })), pied(true)]; }

  /* ---- Page du saut et sa frise (§8.1 ter) ---- */

  function frise(numero) {
    var cs = cal.saut(numero);
    var semaines = cal.semainesEssai.filter(function (w) { return cal.semaine(w).premier_jour <= cs.reprise; });
    var grille = h('div', { class: 'frise-grille' + (semaines.length > 1 ? ' deux' : '') });
    if (semaines.length > 1) { grille.appendChild(h('span')); }
    X.friseInitiales.forEach(function (x) { grille.appendChild(h('span', { class: 'frise-tete' }, x)); });
    semaines.forEach(function (w) {
      if (semaines.length > 1) { grille.appendChild(h('span', { class: 'frise-semaine' }, t(X.friseSemaine(cal.rangEssai(w))))); }
      var sem = cal.semaine(w);
      for (var d = sem.premier_jour; d <= sem.dernier_jour; d++) {
        // Un jour joué (abandonné compris) : ● ; un jour où l'on répond seulement : ○ ; le dimanche de reprise : ● (§8.1 ter).
        var repond = cal.estPointDeSaut(d) ? (cal.sautDuJour(d).numero <= numero) : cal.estSaute(d);
        grille.appendChild(h('span', { class: 'frise-jour' }, repond ? '○' : '●'));
      }
    });
    var derniere = cal.semaine(semaines[semaines.length - 1]);
    var col = cs.reprise - derniere.premier_jour;
    var fleche = h('div', { class: 'frise-grille fleche' + (semaines.length > 1 ? ' deux' : '') });
    if (semaines.length > 1) { fleche.appendChild(h('span')); }
    for (var i = 0; i < 7; i++) { fleche.appendChild(h('span', { class: 'frise-jour' }, i === col ? '↑' : '')); }
    return h('div', { class: 'frise', role: 'img', 'aria-label': t(numero === 1 ? X.friseAria1 : X.friseAria2) },
      grille, fleche, h('div', { class: 'frise-reprise' }, t(X.friseReprise)),
      h('div', { class: 'frise-legende' }, h('span', null, t('● ' + X.friseLegendeJoue)), h('span', null, t('○ ' + X.friseLegendeRepond))));
  }
  function pageSaut() {
    var numero = cal.sautDuJour(K()).numero;
    var tx = numero === 1 ? X.sautTexte1 : X.sautTexte2;
    return [titrePage(t(X.sautTitre)), panneau(frise(numero)),
      panneau(h('p', null, t(tx.tete)), h('ul', null, tx.puces.map(function (x) { return h('li', null, t(x)); })), h('p', null, t(tx.fin))), pied(true)];
  }

  /* ---- Carnet du jour (§8.3) ---- */

  function pageCarnet(c) {
    var e = etat(), j = c.jour, d = jourE(e, j), q2 = d.coups.carnet;
    var contenu = [titrePage(t(X.carnetTitre))];
    var dimanche = cal.estDimanche(j);
    var codes = J.choixMoment(cal, j, d.etapes);
    contenu.push(panneau(h('p', { class: 'fort' }, t(dimanche ? X.momentPrefereDimanche : X.momentPrefere)),
      choix(libelles(codes, X.choixMoment), q2.moment, 'carnet-q', { q: 'moment' })));
    if (dimanche) {
      if (cal.sauts.length && j === cal.sauts[0].reprise) {
        contenu.push(panneau(h('p', { class: 'fort' }, t(X.questionSautClair)), choix(libelles(J.CODES.saut_clair, X.choixSautClair), q2.saut_clair, 'carnet-q', { q: 'saut_clair' })));
      }
      contenu.push(panneau(h('p', { class: 'fort' }, t(X.questionHesite)), h('p', { class: 'petit' }, t(X.questionHesiteSous)),
        choix(libelles(J.CODES.hesite, X.choixHesite), q2.hesite || [], 'carnet-hesite')));
      contenu.push(panneau(h('p', { class: 'fort' }, t(X.questionMomentSemaine)), choix(libelles(J.CODES.moment_semaine, X.choixMomentSemaine), q2.moment_semaine, 'carnet-q', { q: 'moment_semaine' })));
    }
    contenu.push(pied(true));
    return contenu;
  }

  /* ---- Arrêt (§8.10), clôture (§8.5), export (S1 §8.7) ---- */

  function pageArretConfirmation() { return [titrePage(t(X.arretConfirmationTitre)), h('p', null, t(X.arretConfirmation)), pied(true)]; }
  function teteArret() {
    var m = momentArret();
    return m.quoi === 'entree' ? X.arretTeteEntree : (m.quoi === 'saut' ? X.arretTeteSaut(m.n) : X.arretTeteJour(m.k));
  }
  function pageArretQuestions() {
    var a = etat().arret;
    var contenu = [titrePage(t(teteArret())), panneau(h('p', { class: 'fort' }, t(X.arretRaison)), choix(libelles(J.CODES.arret, X.choixArret), a.raison, 'arret-raison'))];
    if (a.jour >= J.JOUR_F2) { contenu.push(panneau(h('p', { class: 'fort' }, t(X.f2Arret)), choix(libelles(J.CODES.f2, X.choixF2), a.f2, 'arret-f2'))); }
    contenu.push(pied(true));
    return contenu;
  }
  function pageClotureQuestions(c) {
    var codes = c.codes || {};
    var contenu = [titrePage(t(X.clotureTete))];
    X.questionsFin.forEach(function (x) {
      var table = x.cle === 'f2' ? X.choixF2 : X.choixFin[x.cle];
      contenu.push(panneau(h('p', { class: 'fort' }, t(x.q)), choix(libelles(J.CODES[x.cle], table), codes[x.cle] || null, 'fin-choix', { cle: x.cle })));
    });
    contenu.push(h('p', null, t(X.clotureApres)), pied(true));
    return contenu;
  }
  function pageExport(c) {
    var texte = c.texte || texteCarnetFinal();
    return [titrePage(t(X.exportTitre)), h('pre', { class: 'carnet', id: 'zone-carnet', tabindex: '-1', 'aria-label': t(X.carnetAria) }, texte), pied(true)];
  }
  function pageEffacer(c) { return [titrePage(t(X.effacerTitre)), h('p', null, t(c.apres ? X.effacerApres : X.effacerPendant)), pied(true)]; }

  /** Carnet final (fin ou arrêt), recalculé sur l'état gardé (§8.12). */
  function texteCarnetFinal() {
    return CR.texte(scelle, cal, journalCourant(), R(), dureesCourantes(), { type: etat().fin ? 'fin' : 'arret' });
  }
  /** Copie en cours d'essai (§8.12) : le carnet figé à ce toucher. Rend {texte, copie de la trace}. */
  function faireCopie() {
    // Le relevé est pris au toucher (E.releverCopie), jamais écrit ; le texte se refait sur lui (CR.texteCopie),
    // comme le refera le contrôle 13 sur le journal.
    relevesCopies.push(E.releverCopie(etat(), cal, socle.horloge()));
    var i = relevesCopies.length - 1;
    var j = journalCourant();
    var x = CR.texteCopie(scelle, cal, j, dureesCourantes(), i, function (jt) { return M.calculer(scelle, cal, socle.arrivee(), jt); });
    var cp = Object.assign({}, j.copies[i], { mesures: x.mesures, texte: x.texte });
    copiesDuChargement.push(JSON.parse(JSON.stringify(cp, function (cle, val) { return val instanceof N.Fraction ? val.toString() : val; })));
    return x.texte;
  }

  /* ---- Dévoilement (§8.6 ; a-ne-pas-ouvrir-2/devoilement.md, gabarits et règles de calcul) ---- */

  function enLettres(n) { return X.nombresEnLettres[n] || String(n); }
  function nomTension(code) { var pl = X.T8[indexT8(code)].poles; return pl[0] + ' ou ' + pl[1]; }
  /** Le dernier dimanche de l'essai (« le second dimanche ») : fin de la dernière semaine de l'essai. */
  function dernierDimanche() { return cal.semaine(cal.semainesEssai[cal.semainesEssai.length - 1]).dernier_jour; }
  /** Textes du porteur avant le second dimanche, entrée comprise (E1 à E3, T1 à T13), dans l'ordre. */
  function textesPorteurAvant(jour) {
    var l = cal.textesEntree.slice();
    for (var j = cal.premier; j < jour; j++) { var t2 = cal.ligne(j).repondu; if (t2 !== null) { l.push(t2); } }
    return l;
  }
  function panneauPourVous() {
    var f = scelle.reglage.facteur, d14 = dernierDimanche();
    var compte = function (liste, code) { return liste.filter(function (x) { return texteDe(x).tension === code; }).length; };
    var tous = textesPorteurAvant(d14);
    var n = {}; ['S', 'P', 'T', 'L'].forEach(function (c) { n[c] = compte(tous, c); });
    var fermees = ['S', 'P', 'T', 'L'].filter(function (c) { return n[c] * f < 10; }).map(nomTension);
    var l = [h('h2', null, t(X.pourVousTitre)),
      h('p', null, t(X.pourVousFacteur(enLettres(f), enLettres(2 * f)))),
      h('p', null, t(X.pourVousCurseurs(n.S, n.P, n.T, n.L, X.motSeuil[f], fermees.length ? N.listeEt(fermees) : null)))];
    // Le Pas de Côté : textes Tn (n ≤ 13) dont la tension compte déjà au moins 10/f textes avant lui.
    var possibles = [];
    for (var j = cal.premier; j < d14; j++) {
      var tj = cal.ligne(j).repondu;
      if (tj === null) { continue; }
      if (compte(textesPorteurAvant(j), texteDe(tj).tension) * f >= 10) { possibles.push({ jour: j + 2, tension: nomTension(texteDe(tj).tension) }); }
    }
    l.push(h('p', null, t(!possibles.length ? X.pasDeCoteImpossible : X.pasDeCotePossible(possibles.length === 1 ?
      X.pasDeCoteJour(possibles[0].jour, possibles[0].tension) :
      X.pasDeCoteJours(possibles.map(function (x) { return X.pasDeCoteJourListe(x.jour, x.tension); }).join(' ; '))))));
    // {pts14}, {pts15} : cartes servies au porteur dans ses manches révélées pendant chaque semaine de l'essai (plafond, sans les coups).
    var cs = M.cartesServies(scelle, cal, socle.arrivee());
    var pts = cal.semainesEssai.map(function (w) {
      var sem = cal.semaine(w), total = 0;
      for (var d = sem.premier_jour - 1; d < sem.dernier_jour; d++) { if (cal.existe(d) && cal.ligne(d).deviner_porteur) { total += cs(d).n; } }
      return total;
    });
    l.push(h('p', null, t(X.pourVousTitres(enLettres(pts[0]), enLettres(pts[1])))));
    var supprimer = Object.keys(scelle.textes).filter(function (x) { return /^Supprimer/.test(scelle.textes[x].titre); });
    if (supprimer.length >= 2 && supprimer.every(function (x) { return scelle.textes[x].vote.issue === 'rejete'; })) { l.push(h('p', null, t(X.pourVousSupprimer))); }
    return h('section', { class: 'panneau' }, l);
  }
  function panneauPersonnage(pp) {
    var f = scelle.personnages[pp], k = K();
    var b = [h('h2', null, t(X.titrePersonnage(pp, f.age, f.metier, f.ville))), h('p', null, t(X.phraseProfil[pp]))];
    ['S', 'P', 'T', 'L'].forEach(function (code) {
      var pl = X.T8[indexT8(code)].poles, pr = f.profil[code];
      var lecture = pr.position >= 41 && pr.position <= 59 ? X.auMilieuProfil : (pr.position < 41 ? pl[0] : pl[1]);
      b.push(h('p', null, t(X.ligneProfil(pl[0], pl[1], lecture, pr.position, pr.fermete))));
    });
    var dernierTexte = cal.ligne(cal.dernierJeu).repondu;
    var pendantEssai = function (x) { return Object.prototype.hasOwnProperty.call(scelle.textes, x) && cal.textesEntree.indexOf(x) < 0 && x !== dernierTexte; };
    var atyp = scelle.reponses_atypiques[pp].filter(function (a) { return pendantEssai(a.texte); });
    if (!atyp.length) { b.push(h('p', { class: 'fort' }, t(X.reponsesContreAucune))); }
    else {
      b.push(h('p', { class: 'fort' }, t(X.reponsesContre)));
      atyp.forEach(function (a) {
        var tx = texteDe(a.texte), rep = scelle.reponses[a.texte][pp], n = cal.jourDeReponse(a.texte);
        var extra = [];
        if (a.cote_tire !== null) { extra.push(X.profilNeutre); }
        // La réponse était une carte de la manche du porteur du jour n + 1, et cette manche a été ouverte.
        var mp = n + 1 <= k && cal.existe(n + 1) && Rj(n + 1).manches ? Rj(n + 1).manches[PORTEUR] : null;
        if (mp && mp.cartes.some(function (c) { return c.auteur === pp; })) { extra.push(X.aDeviner(n + 1)); }
        b.push(h('div', { class: 'atypique' }, h('p', null, t(X.jourTitre(n, tx.titre))), h('p', null, t(position(rep.niveau) + ' · ' + raisonEnLigne(tx, rep.raison))),
          extra.length ? h('p', null, t(extra.join(' '))) : null));
      });
    }
    var abs = scelle.absences[pp].filter(pendantEssai).map(function (x) { return String(cal.jourDeReponse(x)); });
    b.push(h('p', null, t(abs.length ? X.joursSansJouer(N.listeEt(abs)) : X.joursSansJouerAucun)));
    var hist = Object.keys(scelle.histoire.textes);
    var aH = scelle.reponses_atypiques[pp].filter(function (a) { return hist.indexOf(a.texte) >= 0; }).length;
    var mH = scelle.absences[pp].filter(function (x) { return hist.indexOf(x) >= 0; }).length;
    b.push(h('p', null, t(X.avantArrivee(aH, hist.length - mH, mH, hist.length))));
    // Tempéraments au second dimanche, s'il a été atteint (après un arrêt plus tôt, le calcul n'existe pas).
    var d14 = dernierDimanche();
    var dm = d14 <= k ? Rj(d14).dimanche : null;
    if (dm) {
      var temps = dm.temperaments[pp].temperaments;
      if (!temps.length) { b.push(h('p', null, t(X.temperamentsAucun))); }
      else { b.push(h('p', null, t(X.temperamentsTete))); X.ORDRE_TEMPERAMENTS.filter(function (c) { return temps.indexOf(c) >= 0; }).forEach(function (c) { b.push(h('p', null, t(X.temperamentsRegles[c]))); }); }
    }
    return h('section', { class: 'panneau', 'aria-label': pp }, b);
  }
  function pageDevoilement() {
    var h86 = 'H86'; // devoilement.md : {titre H86} = histoire.textes.H86.fiche.titre
    var contenu = [titrePage(t(X.devoilementTitre)), panneau(h('p', null, t(X.devoilementOuverture)))];
    contenu.push(h('section', { class: 'panneau' }, [h('h2', null, t(X.commentLire))].concat(X.commentLireTextes(X.motAlpha[scelle.reglage.alpha], titreDe(h86)).map(function (x) { return h('p', null, t(x)); }))));
    contenu.push(h('section', { class: 'panneau' }, [h('h2', null, t(X.avantTitre))].concat(X.avantTextes(titreDe(h86), String(scelle.histoire.tirage)).map(function (x) { return h('p', null, t(x)); }))));
    contenu.push(panneauPourVous());
    personnages().forEach(function (pp) { contenu.push(panneauPersonnage(pp)); });
    var groupes = socle.empreinte().match(/.{4}/g);
    var lignesEmp = [0, 1, 2, 3].map(function (i) { return groupes.slice(4 * i, 4 * i + 4).join(' '); }).join('\n');
    contenu.push(h('details', { class: 'panneau controle' }, h('summary', null, t(X.pourLeControle)),
      h('p', null, t(X.empreinteDe)), h('pre', { class: 'code-brut empreinte' }, lignesEmp),
      h('p', null, t(X.comparez(N.dateLongue(ENTREES.empreinte_publiee_le), N.heureEcrite(ENTREES.empreinte_publiee_a)))),
      h('p', null, t(X.graine)), h('pre', { class: 'code-brut' }, scelle.graine),
      h('p', null, t(X.tirage)), h('pre', { class: 'code-brut' }, String(scelle.histoire.tirage)),
      h('p', null, t(X.fichierScelle)), h('pre', { class: 'code-brut scelle' }, N.utf8Decoder(N.base64Decoder(SCELLE_B64)))));
    contenu.push(panneau(h('p', null, t(X.devoilementFin)), h('p', null, t(X.devoilementEffacer))));
    contenu.push(pied(true));
    return contenu;
  }

  function rendrePageCadre() {
    var c = vue().cadre, contenu;
    switch (c.page) {
      case 'message0': contenu = pageMessage0(); break;
      case 'arrivee': contenu = pageArrivee(); break;
      case 'quiestqui': contenu = pageQuiEstQui(); break;
      case 'droits': contenu = pageDroits(); break;
      case 'saut': contenu = pageSaut(); break;
      case 'carnet': contenu = pageCarnet(c); break;
      case 'arret-confirmation': contenu = pageArretConfirmation(); break;
      case 'arret-questions': contenu = pageArretQuestions(); break;
      case 'cloture-questions': contenu = pageClotureQuestions(c); break;
      case 'export': contenu = pageExport(c); break;
      case 'devoilement': contenu = pageDevoilement(); break;
      case 'effacer': contenu = pageEffacer(c); break;
      default: throw new Error('page inconnue : ' + c.page);
    }
    return h('div', { class: 'page-cadre', role: 'region' }, contenu);
  }

  /* ================================================================== */
  /* Vues seules : arrêts techniques, écrans hors de l'icône            */
  /* ================================================================== */

  function montrerVueSeule(contenu, avecPied) {
    var secours = document.getElementById('vue-secours');
    if (secours) { secours.hidden = true; }
    if (racine) { racine.hidden = true; }
    var vs = document.getElementById('vue-seule') || document.body.appendChild(h('main', { id: 'vue-seule', class: 'vue-seule' }));
    vider(vs);
    ajouter(vs, contenu);
    if (avecPied) { vs.appendChild(pied(false)); }
    vs.hidden = false;
  }

  /** Arrêts du §8.11 (S1) ; repères V1 à V6 et M1 (§8.9 du second essai). */
  function arret(n, repere, info) {
    if (n === 1) {
      var m1 = repere === 'M1';
      var consigne = m1 ? X.arretVerifRepereM1 : X.arretVerifRepere;
      montrerVueSeule([h('h1', null, t(X.arretVerifTitre)), h('p', null, t(X.arretVerif)),
        m1 ? h('p', null, t(X.arretVerifRienEfface)) : (info && info.partieLisible ? h('p', null, t(X.arretVerifGardee(appareil))) : null),
        h('p', null, t(consigne[0].replace(/ $/, '')), ' ', h('strong', { class: 'repere' }, repere), t(consigne[1]))]);
    } else if (n === 2) {
      montrerVueSeule([h('h1', null, t(X.arretStockageTitre)), h('p', null, t(X.arretStockage(appareil)))]);
    } else {
      montrerVueSeule([h('h1', null, t(X.arretDoubleTitre)), h('p', null, t(X.arretDouble)),
        h('button', { type: 'button', class: 'bouton-cadre avant', action: 'recharger' }, t(X.reprendreIci)), h('p', { class: 'petit' }, t(X.arretDoublePetit))]);
      brancherHors();
    }
  }

  function t3(s) { return N.typographier13(s); }
  function blocAdresse() { return h('p', { class: 'adresse' }, X.adresse); }
  function diagnostic(type) {
    var standalone = window.navigator.standalone === true || (window.matchMedia ? window.matchMedia('(display-mode: standalone)').matches : false);
    var dansCadre; try { dansCadre = window.self !== window.top; } catch (x) { dansCadre = true; }
    return ['Diagnostic de l’essai', 'Version de la page : ' + VERSION, 'Résultat : essai non lancé, page ouverte dans un onglet',
      'Site : ' + location.origin, 'Page : ' + (dansCadre ? 'dans un cadre' : 'seule'),
      'Ouverte depuis : ' + (standalone ? 'l’icône de l’écran d’accueil' : 'un onglet du navigateur'),
      'Écran tactile : ' + (points > 0 ? 'oui' : 'non'), 'Navigateur : ' + ua, '', 'Fin du diagnostic'].join('\n');
  }
  /** Écrans hors de l'icône (S1 §8.13, inchangés). */
  function hors(type) {
    var c = [];
    if (type === 'ailleurs') {
      c.push(h('h1', null, t3(X.ailleursTitre)), h('p', null, t3(X.ailleursDessous)), h('p', null, t3(X.ailleursAdresse)), blocAdresse());
    } else {
      c.push(h('h1', null, t3(X.ongletTitre)), h('p', null, t3(type === 'onglet' ? X.ongletDessous : X.autreDessous)), h('div', { class: 'panneau' }, h('p', null, t3(X.pourYAller))));
      var plie = [h('summary', null, t3(X.pasDIcone)), h('p', null, t3(X.dejaCommence))];
      if (type === 'onglet') { plie.push(h('p', null, t3(X.pasEncore)), h('ol', null, X.etapesAjout.map(function (x) { return h('li', null, t3(x)); })), h('p', null, t3(X.pasDeSurEcran))); }
      else { plie.push(h('p', null, t3(X.pasEncoreAutre))); }
      plie.push(blocAdresse(), h('button', { type: 'button', class: 'bouton-cadre', action: 'copier-adresse' }, t3(X.copierAdresse)), h('p', { class: 'note message-copie', role: 'status', hidden: true }));
      c.push(h('details', { class: 'panneau' }, plie));
      if (type === 'onglet') {
        c.push(h('details', { class: 'panneau' }, h('summary', null, t3(X.iconeOnglet)), h('p', null, t3(X.iconeOngletTexte)),
          h('pre', { class: 'code-brut', id: 'diagnostic' }, diagnostic(type)),
          h('button', { type: 'button', class: 'bouton-cadre', action: 'copier-lignes' }, t3(X.copierLignes)), h('p', { class: 'note message-copie', role: 'status', hidden: true })));
      }
    }
    montrerVueSeule(c, true);
    brancherHors();
  }
  var horsBranche = false;
  /** Hors de l'icône et à l'arrêt 3, le socle n'a pas branché son gestionnaire : un seul ici, pour ces boutons. */
  function brancherHors() {
    if (horsBranche) { return; }
    horsBranche = true;
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-action]') : null;
      if (!b) { return; }
      var a = b.getAttribute('data-action');
      if (a === 'copier-adresse' || a === 'copier-lignes' || a === 'recharger') { ev.preventDefault(); ev.stopImmediatePropagation(); A[a](b); }
    }, true);
  }

  /* ================================================================== */
  /* Rendu                                                              */
  /* ================================================================== */

  function cleDePage(c) { return c.page + (c.mode ? ':' + c.mode : '') + (c.jour ? ':' + c.jour : ''); }

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
    document.addEventListener('input', surSaisie);
    // Après le gestionnaire du socle (inscrit avant) : la note passagère part, sauf si le geste en a posé une autre.
    document.addEventListener('click', function () {
      if (noteAEffacer !== null && bande.note === noteAEffacer) { bande.note = null; if (etat() && !socle.efface()) { rendreBandeSeule(); } }
      noteAEffacer = null;
    });
    window.addEventListener('resize', empilerActions);
  }

  function rendre(options) {
    options = options || {};
    if (socle.efface()) { return; }
    if (!racine) { construireRacine(); }
    var nb = rendreBarre(); racine.replaceChild(nb, barreEl); barreEl = nb;
    var e = etat();
    var cadre = e ? vue().cadre : { page: 'ancienne' };
    if (cadre) {
      var cle = cleDePage(cadre);
      var meme = pageAffichee === cle;
      var defile = meme ? milieuCadre.scrollTop : 0;
      vider(milieuCadre);
      milieuCadre.appendChild(e ? rendrePageCadre() : h('div', { class: 'page-cadre', role: 'region' }, pageAncienne()));
      milieuCadre.hidden = false; milieuTel.hidden = true;
      milieuCadre.scrollTop = defile;
      pageAffichee = cle;
      if (options.focus !== false && !meme) { var ti = milieuCadre.querySelector('.titre-page, #zone-carnet'); if (ti) { try { ti.focus({ preventScroll: true }); } catch (x) { ti.focus(); } } }
    } else {
      pageAffichee = null;
      milieuCadre.hidden = true; milieuTel.hidden = false;
      if (options.telephone !== false) {
        var corps = milieuTel.querySelector('.corps');
        var defileTel = options.garderDefilement && corps ? corps.scrollTop : 0;
        vider(milieuTel);
        milieuTel.appendChild(rendreTelephone());
        if (defileTel) { milieuTel.querySelector('.corps').scrollTop = defileTel; }
        apresRenduTelephone();
      }
    }
    rendreBandeSeule();
  }
  function rendreBandeSeule() { var nb = rendreBande(); racine.replaceChild(nb, bandeEl); bandeEl = nb; empilerActions(); }

  /** Effets d'un affichage qui ne s'écrivent qu'à part : dernier n de la barre, note de la barre pleine (§7.15). */
  function apresRenduTelephone() {
    var v = vue();
    if (v.tel.ecran !== 'moi-portrait') { return; }
    var b = Rj(jourAffiche()).portrait.barre;
    var longueur = frac(b.longueur).pourDessiner();
    var noteUneFois = b.pleine && !v.barrePleineVue;
    if (v.barreVue !== longueur || noteUneFois) {
      geste(function (e) { e.vue.barreVue = longueur; if (noteUneFois) { e.vue.barrePleineVue = true; } });
      if (noteUneFois) { bande.note = X.noteBarrePleine; }
    }
  }

  /** Rangées d'action de la bande (S1 §8.1) : côte à côte si elles tiennent, sinon l'une sous l'autre. */
  function empilerActions() {
    if (!bandeEl) { return; }
    Array.prototype.forEach.call(bandeEl.querySelectorAll('.actions'), function (a) {
      a.classList.remove('empile');
      var boutons = a.children, largeur = 0;
      if (boutons.length < 2) { return; }
      for (var i = 0; i < boutons.length; i++) { largeur += boutons[i].getBoundingClientRect().width; }
      largeur += (parseFloat(getComputedStyle(a).columnGap) || 0) * (boutons.length - 1);
      if (largeur > a.clientWidth + 0.5) { a.classList.add('empile'); }
    });
  }

  /** Saisie du pseudo (1.8) : le bouton et la note suivent, sans redessiner le champ. */
  function surSaisie(ev) {
    if (!ev.target || ev.target.id !== 'champ-pseudo') { return; }
    var avant = temp.saisie || '';
    var v = ev.target.value;
    if (Array.from(formaterPseudo(v)).length > 20) { ev.target.value = avant; return; }
    temp.saisie = v;
    var ok = motifRefus(formaterPseudo(v)) === null;
    Array.prototype.forEach.call(milieuTel.querySelectorAll('.voie'), function (b) { if (ok) { b.removeAttribute('aria-disabled'); } else { b.setAttribute('aria-disabled', 'true'); } });
    rendreBandeSeule();
  }

  /** À l'ouverture : on ne rouvre jamais sur une décision (S1 §8.1) ; les choix non validés sont perdus. */
  function normaliserAuChargement() {
    var e = etat();
    if (!e || !e.vue.tel) { return; }
    var v = e.vue, tel = v.tel, c = v.cadre;
    if (tel.ecran === '1.3' || tel.ecran === '1.4') { v.tel = { ecran: '1.2', E: tel.E, pile: [] }; }
    if ((tel.ecran === '1.8b' || tel.ecran === '1.9') && !tel.pseudo) { v.tel = { ecran: '1.8', pile: [] }; }
    if (tel.ecran === 'raison') { v.tel = { ecran: 'repondre', pile: [] }; }
    if (tel.ecran === 'ratt-raison') { v.tel = { ecran: 'ratt-position', jour: tel.jour, pile: [] }; }
    if (c && c.page === 'saut') { v.cadre = null; }
    if (c && c.page === 'carnet' && c.abandon) { v.cadre = null; }
    if (c && c.page === 'export' && c.mode === 'dabord') { v.cadre = c.retour && c.retour.sous ? c.retour.sous : null; }
    if (c && c.page === 'effacer') { v.cadre = c.sous || null; }
    if (c && c.page === 'arret-confirmation') { v.cadre = null; }
    if (c && (c.page === 'quiestqui' || c.page === 'droits')) { v.cadre = c.sous || null; }
    temp = {};
  }

  /* ================================================================== */
  /* Actions                                                            */
  /* ================================================================== */

  var A = {};
  function apres(options) { rendre(options); }

  A['absent'] = function () { bande.note = X.pasDansLEssai; rendreBandeSeule(); };
  A['recharger'] = function () { location.reload(); };

  /* Pages du début (§8.2) */
  A['ancienne-effacer'] = function () { bande.ancienneConfirmation = true; rendreBandeSeule(); };
  A['ancienne-annuler'] = function () { bande.ancienneConfirmation = false; rendreBandeSeule(); };
  A['ancienne-confirmer'] = function () { bande.ancienneConfirmation = false; socle.effacerAncienne(); };
  A['message0-continuer'] = function () { geste(function (e) { e.vue.cadre = { page: 'arrivee' }; }); apres(); };
  A['commencer'] = function () { geste(function (e) { e.vue.cadre = null; e.vue.tel = { ecran: '1.1', pile: [] }; }); apres(); };

  /* Pages qu'on ferme (fiche, droits) */
  A['qui-est-qui'] = function () { geste(function (e) { E.compter(e, cal, 'qui_est_qui', devinerEnCours(e)); e.vue.cadre = { page: 'quiestqui', sous: e.vue.cadre || null }; }); apres(); };
  A['droits'] = function () { geste(function (e) { e.vue.cadre = { page: 'droits', sous: e.vue.cadre || null }; }); apres(); };
  A['fermer-page'] = function () { geste(function (e) { var c = e.vue.cadre; e.vue.cadre = c && c.sous ? c.sous : null; }); apres({ telephone: true, garderDefilement: true }); };

  /* Entrée (§7.2) */
  A['apercu'] = function () { temp = {}; geste(function (e, hh) { aller(e, hh, '1.2', { E: E.texteEntreeCourant(e, cal) }); }); apres(); };
  A['entree-position'] = function (b) {
    temp.position = +b.getAttribute('data-valeur');
    if (jourE(etat(), cal.premier).coups.consentement !== true) { geste(function (e, hh) { aller(e, hh, '1.3', { E: e.vue.tel.E }); }); }
    apres({ garderDefilement: true });
  };
  A['consentement-retour'] = function () { temp.position = null; geste(function (e, hh) { aller(e, hh, '1.2', { E: e.vue.tel.E }); }); apres(); };
  A['consentement-accepter'] = function () { geste(function (e, hh) { E.consentir(e, cal); aller(e, hh, '1.2', { E: e.vue.tel.E }); }); apres(); };
  A['entree-suivant'] = function () { if (!temp.position) { return; } temp.raison = null; geste(function (e, hh) { aller(e, hh, '1.4', { E: e.vue.tel.E }); }); apres(); };
  A['entree-changer'] = function () { geste(function (e, hh) { aller(e, hh, '1.2', { E: e.vue.tel.E }); }); apres(); };
  A['entree-raison'] = function (b) { temp.raison = lireValeur(b); apres({ garderDefilement: true }); };
  A['entree-valider-raison'] = function () {
    if (temp.raison === null || temp.raison === undefined) { return; }
    var rep = { niveau: temp.position, raison: temp.raison };
    geste(function (e, hh) { var En = e.vue.tel.E; E.repondreEntree(e, cal, scelle, En, rep); aller(e, hh, '1.5', { E: En }); });
    temp = {}; apres();
  };
  A['entree-pari'] = function (b) { temp.pari = +b.getAttribute('data-valeur'); apres({ garderDefilement: true }); };
  A['entree-voir'] = function () {
    if (!temp.pari) { return; }
    var pari = temp.pari;
    geste(function (e, hh) { var En = e.vue.tel.E; E.parierEntree(e, cal, En, pari); aller(e, hh, '1.6', { E: En }); });
    temp = {}; apres();
  };
  A['entree-texte-suivant'] = function () {
    temp = {};
    geste(function (e, hh) { var suivant = E.texteEntreeCourant(e, cal); if (suivant === null) { aller(e, hh, '1.7'); } else { aller(e, hh, '1.2', { E: suivant }); } });
    apres();
  };
  A['creer-compte'] = function () { temp = { saisie: '' }; geste(function (e, hh) { aller(e, hh, '1.8'); }); apres(); };
  function terminerCompte(voie, pseudoGarde) {
    geste(function (e, hh) {
      E.terminerCompte(e, cal, pseudoGarde, voie, hh, confusables());
      aller(e, hh, 'deviner', null, false);
    });
    temp = {};
  }
  A['compte-apple'] = function () { var f = pseudoSaisi(); if (motifRefus(f) !== null) { return; } terminerCompte('apple', f); bande.note = X.noteApple; apres(); };
  A['compte-google'] = function () { var f = pseudoSaisi(); if (motifRefus(f) !== null) { return; } terminerCompte('google', f); bande.note = X.noteGoogle; apres(); };
  A['compte-email'] = function () {
    var f = pseudoSaisi(); if (motifRefus(f) !== null) { return; }
    geste(function (e, hh) { aller(e, hh, '1.8b', { pseudo: f }); }); apres();
  };
  A['compte-retour'] = function () { var f = vue().tel.pseudo || ''; geste(function (e, hh) { aller(e, hh, '1.8'); }); temp = { saisie: f }; apres(); };
  A['recevoir-code'] = function () { var f = vue().tel.pseudo; geste(function (e, hh) { aller(e, hh, '1.9', { pseudo: f }); }); apres(); };
  A['code-valider'] = function () { terminerCompte('email_valider', vue().tel.pseudo); apres(); };
  A['code-plus-tard'] = function () { terminerCompte('email_plus_tard', vue().tel.pseudo); apres(); };

  /* Aujourd'hui : Deviner (S1 §7.1, gestes ; R10 : chaque visage s'écrit dès qu'il est posé) */
  function devinerEnCours(e) { var d = jourE(e, E.K(e)); return !E.sautEnCours(e) && !!d.coups.deviner && !d.coups.deviner.validee; }
  function carteCachee(i) { return Rj(K()).cartes_porteur.cartes[i].cachee; }
  A['visage'] = function (b) {
    var i = +b.getAttribute('data-carte'), m = b.getAttribute('data-membre');
    var ch = jourE(etat(), K()).coups.deviner.cartes;
    if (ch.some(function (c, x) { return x !== i && c.designe === m; })) { return; } // grisé : ne réagit pas
    var avant = temp.raisonsAvant && temp.raisonsAvant[i] !== undefined ? temp.raisonsAvant[i] : null;
    geste(function (e, hh) {
      var k = E.K(e);
      if (ch[i].designe === m) { E.poserCarte(e, k, i, null, hh); }
      else {
        E.poserCarte(e, k, i, m, hh);
        if (carteCachee(i) && avant !== null && jourE(e, k).coups.deviner.cartes[i].raison === null) { E.poserRaison(e, scelle, cal, k, i, avant, hh); }
      }
    });
    if (temp.raisonsAvant) { delete temp.raisonsAvant[i]; }
    apres({ garderDefilement: true });
  };
  A['passer'] = function (b) {
    var i = +b.getAttribute('data-carte');
    var c = jourE(etat(), K()).coups.deviner.cartes[i];
    geste(function (e, hh) { E.poserCarte(e, E.K(e), i, c.designe === 'passe' ? null : 'passe', hh); });
    if (temp.raisonsAvant) { delete temp.raisonsAvant[i]; }
    apres({ garderDefilement: true });
  };
  A['devine-pourquoi'] = function (b) { temp.feuille = +b.getAttribute('data-carte'); delete temp.raisonFeuille; apres({ garderDefilement: true }); };
  A['feuille-raison'] = function (b) { temp.raisonFeuille = lireValeur(b); apres({ garderDefilement: true }); };
  A['feuille-choisir'] = function () {
    if (temp.raisonFeuille === undefined || temp.raisonFeuille === null) { return; }
    var i = temp.feuille, r = temp.raisonFeuille;
    var c = jourE(etat(), K()).coups.deviner.cartes[i];
    if (personnages().indexOf(c.designe) >= 0) { geste(function (e, hh) { E.poserRaison(e, scelle, cal, E.K(e), i, r, hh); }); }
    else { temp.raisonsAvant = temp.raisonsAvant || {}; temp.raisonsAvant[i] = r; }
    temp.feuille = null; delete temp.raisonFeuille; apres({ garderDefilement: true });
  };
  A['feuille-fermer'] = function () { temp.feuille = null; delete temp.raisonFeuille; apres({ garderDefilement: true }); };
  A['relire'] = function () { geste(function (e) { E.compter(e, cal, 'relire'); }); temp.feuille = 'relire'; apres({ garderDefilement: true }); };
  A['deviner-valider'] = function () {
    if (!jourE(etat(), K()).coups.deviner.cartes.every(function (c) { return c.designe !== null; })) { return; }
    geste(function (e, hh) { E.validerDeviner(e, E.K(e), hh); aller(e, hh, 'repondre', null, false); });
    temp = {}; apres();
  };

  /* Aujourd'hui : Répondre */
  A['jour-position'] = function (b) { temp.position = +b.getAttribute('data-valeur'); temp.jour = K(); apres({ garderDefilement: true }); };
  A['jour-suivant-raison'] = function () { if (!temp.position) { return; } temp.raison = null; geste(function (e, hh) { aller(e, hh, 'raison'); }); apres(); };
  A['jour-changer'] = function () { geste(function (e, hh) { aller(e, hh, 'repondre'); }); apres(); };
  A['jour-raison'] = function (b) { temp.raison = lireValeur(b); apres({ garderDefilement: true }); };
  A['jour-valider-raison'] = function () {
    if (temp.raison === null || temp.raison === undefined) { return; }
    var rep = { niveau: temp.position, raison: temp.raison };
    geste(function (e, hh) { E.repondre(e, scelle, cal, E.K(e), rep, hh); aller(e, hh, 'attente', null, false); });
    temp = {}; apres();
  };

  /* Rattrapage (§7.4, §8.1 ter) */
  A['ratt-position'] = function (b) { temp.position = +b.getAttribute('data-valeur'); apres({ garderDefilement: true }); };
  A['ratt-suivant-raison'] = function () { if (!temp.position) { return; } temp.raison = null; geste(function (e, hh) { aller(e, hh, 'ratt-raison', { jour: e.vue.tel.jour }); }); apres(); };
  A['ratt-changer'] = function () { geste(function (e, hh) { aller(e, hh, 'ratt-position', { jour: e.vue.tel.jour }); }); apres(); };
  A['ratt-raison'] = function (b) { temp.raison = lireValeur(b); apres({ garderDefilement: true }); };
  A['ratt-valider'] = function () {
    if (temp.raison === null || temp.raison === undefined) { return; }
    var rep = { niveau: temp.position, raison: temp.raison };
    geste(function (e, hh) {
      var r = E.rattrapage(e, cal);
      var j = r.jour;
      E.repondre(e, scelle, cal, j, rep, hh);
      aller(e, hh, 'ratt-attente', { jour: j }, false);
    });
    temp = {}; apres();
  };
  A['texte-suivant'] = function () {
    geste(function (e, hh) { E.afficherTexteRattrapage(e, cal, hh); var r = E.rattrapage(e, cal); aller(e, hh, 'ratt-position', { jour: r.jour }, false); });
    temp = {}; apres();
  };
  A['aller-au-dimanche'] = function () {
    geste(function (e, hh) {
      var r = E.rattrapage(e, cal);
      E.finirSaut(e, cal, hh);
      e.vue.noteSaut = { jour: r.reprise, jours: cal.saut(r.numero).jours.length };
      aller(e, hh, 'verrou', null, false);
    });
    temp = {}; apres();
  };

  /* Message de 18h et révélation (§7.17, §7.18) */
  A['notification'] = function () {
    var k = K(), m = Rj(k).message;
    geste(function (e, hh) {
      var rv = revDe(e, k);
      rv.commencee = true;
      if (cal.estPointDeSaut(k) && m.forme === 'question') {
        // Rien à révéler : le toucher ouvre la page du saut (§7.4).
        rv.ouverte = true; rv.i = 0; aller(e, hh, 'revelation', null, false);
        E.ouvrirPageSaut(e, cal, hh); e.vue.cadre = { page: 'saut' };
        return;
      }
      if (m.forme === 'question') { rv.ouverte = false; allerAuJour(e, hh); return; }
      rv.ouverte = true; rv.i = 0; aller(e, hh, 'revelation', null, false);
    });
    apres();
  };
  A['retourner'] = function () {
    var k = K(), rv = jourE(etat(), k).page.rev, seq = sequenceRevelation(k), el = seq[rv.i];
    if (!el || el.type !== 'carte') { return; }
    geste(function (e) { revDe(e, k).ret[el.i] = true; });
    var reduire = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rond = milieuTel.querySelector('.rond');
    if (rond && !reduire) {
      rond.classList.add('bascule');
      window.setTimeout(function () { apres({ garderDefilement: true }); var b2 = milieuTel.querySelector('.apres'); if (b2) { b2.setAttribute('tabindex', '-1'); } }, 450);
    } else { apres({ garderDefilement: true }); }
  };
  A['rev-suivant'] = function () {
    var k = K();
    geste(function (e, hh) {
      var rv = revDe(e, k), seq = sequenceRevelation(k);
      if (seq[rv.i] && seq[rv.i].type === 'vote' && e.vue.noteSaut) { delete e.vue.noteSaut; }
      if (rv.i < seq.length - 1) { rv.i += 1; }
      aller(e, hh, 'revelation', null, false);
    });
    apres();
  };
  /** Dernière carte de la révélation de clôture : la fiche du dernier texte (§7.5, point 2). */
  A['rev-fin-cloture'] = function () {
    var k = K();
    if (!cal.estCloture(k)) { A['rev-suivant'](); return; }
    geste(function (e, hh) { var rv = revDe(e, k); rv.ouverte = false; if (e.vue.noteSaut) { delete e.vue.noteSaut; } aller(e, hh, 'fiche', { texte: cal.ligne(cal.dernierJeu).repondu, dernier: true }, false); });
    apres();
  };
  A['rev-jouer'] = function () {
    var k = K();
    if (cal.estPointDeSaut(k)) { A['ouvrir-saut'](); return; }
    geste(function (e, hh) { revDe(e, k).ouverte = false; allerAuJour(e, hh); });
    temp = {}; apres();
  };
  A['croix'] = function () {
    var k = K();
    if (cal.estPointDeSaut(k) || cal.estCloture(k)) { A['absent'](); return; }
    geste(function (e, hh) {
      var rv = revDe(e, k);
      if (e.vue.noteSaut && sequenceRevelation(k)[rv.i] && ['carte', 'vote'].indexOf(sequenceRevelation(k)[rv.i].type) >= 0) { delete e.vue.noteSaut; }
      rv.ouverte = false; allerAuJour(e, hh);
    });
    apres();
  };
  A['rouvrir'] = function () {
    var k = K();
    geste(function (e, hh) {
      E.compter(e, cal, 'rouvrir');
      var rv = revDe(e, k);
      var fini = rv.max >= sequenceRevelation(k).length - 1;
      if (fini) { rv.i = 0; }
      rv.ouverte = true; aller(e, hh, 'revelation', null, false);
    });
    apres();
  };

  /* Onglets, fiches, Le Cercle, Moi */
  A['onglet-jour'] = function () { temp.voirTout = null; geste(function (e, hh) { allerAuJour(e, hh); }); apres(); };
  A['onglet-cercle'] = function () { if (ongletsFermes()) { return; } geste(function (e, hh) { var dv = devinerEnCours(e); E.compter(e, cal, 'cercle', dv); aller(e, hh, 'cercle', { jour: e.vue.tel.jour }, false); }); apres(); };
  function ouvrirMoi(e, hh, sous) { E.compter(e, cal, 'moi', devinerEnCours(e)); aller(e, hh, sous || 'moi-portrait', { jour: e.vue.tel.jour }, false); }
  A['onglet-moi'] = function () { if (ongletsFermes()) { return; } geste(function (e, hh) { ouvrirMoi(e, hh); }); apres(); };
  A['voir-portrait'] = A['onglet-moi'];
  A['mon-visage'] = A['onglet-moi'];
  A['moi-portrait'] = function () { geste(function (e, hh) { aller(e, hh, 'moi-portrait', { jour: e.vue.tel.jour }, false); }); apres(); };
  A['moi-titres'] = function () { geste(function (e, hh) { aller(e, hh, 'moi-titres', { jour: e.vue.tel.jour }, false); }); apres(); };
  A['moi-historique'] = function () { geste(function (e, hh) { aller(e, hh, 'moi-historique', { jour: e.vue.tel.jour }, false); }); apres(); };
  A['reglages'] = function () { geste(function (e, hh) { aller(e, hh, 'reglages', { jour: e.vue.tel.jour }, true); }); apres(); };
  A['proche'] = function (b) {
    var m = b.getAttribute('data-membre');
    geste(function (e, hh) { E.compter(e, cal, 'proche', devinerEnCours(e)); aller(e, hh, 'proche', { membre: m, jour: e.vue.tel.jour }, true); });
    apres();
  };
  A['voir-tout'] = function (b) { temp.voirTout = b.getAttribute('data-membre'); apres({ garderDefilement: true }); };
  A['titres-passes'] = function () { geste(function (e, hh) { aller(e, hh, 'titres-passes', { jour: e.vue.tel.jour }, true); }); apres(); };
  A['fiche'] = function (b) { var n = b.getAttribute('data-texte'); geste(function (e, hh) { aller(e, hh, 'fiche', { texte: n, jour: e.vue.tel.jour }, true); }); apres(); };
  A['retour'] = function () {
    geste(function (e, hh) {
      var v = e.vue.tel;
      if (!v.pile.length) { allerAuJour(e, hh); return; }
      var prec = v.pile[v.pile.length - 1], pile = v.pile.slice(0, -1);
      e.vue.tel = prec; e.vue.tel.pile = pile; effets(e, hh);
    });
    apres();
  };

  /* « Jour suivant », « Abandonner cette journée » (§8.1, §8.1 bis), carnet du jour (§8.3) */
  A['jour-suivant'] = function () {
    bande.confirmation = false;
    if (!E.journeeFinie(etat(), cal, K())) { return; }
    geste(function (e) { e.vue.cadre = { page: 'carnet', jour: E.K(e), abandon: false }; });
    apres();
  };
  A['abandonner'] = function () { bande.confirmation = true; rendreBandeSeule(); };
  A['abandon-annuler'] = function () { bande.confirmation = false; rendreBandeSeule(); };
  A['abandon-confirmer'] = function () {
    bande.confirmation = false;
    geste(function (e, hh) {
      var k = E.K(e), d = jourE(e, k);
      // Durée de Répondre : jusqu'à ce toucher, à défaut de raison validée (S1 §8.12).
      if (d.etapes && d.etapes.repondre && d.coups.reponse === null) { E.marquer(e, k, 'repContinuer', hh, true); }
      e.vue.cadre = { page: 'carnet', jour: k, abandon: true };
    });
    apres();
  };
  A['carnet-q'] = function (b) {
    var champ = b.getAttribute('data-q'), v = b.getAttribute('data-valeur');
    geste(function (e) { E.repondreCarnet(e, cal, e.vue.cadre.jour, champ, v); });
    apres({ focus: false });
  };
  A['carnet-hesite'] = function (b) {
    var v = b.getAttribute('data-valeur');
    geste(function (e) {
      var j = e.vue.cadre.jour, l = (jourE(e, j).coups.carnet.hesite || []).slice();
      if (l.indexOf(v) >= 0) { l = l.filter(function (x) { return x !== v; }); }
      else if (v === 'nulle_part') { l = ['nulle_part']; }
      else { l = l.filter(function (x) { return x !== 'nulle_part'; }).concat([v]); }
      l = J.CODES.hesite.filter(function (x) { return l.indexOf(x) >= 0; });
      E.repondreCarnet(e, cal, j, 'hesite', l.length ? l : null);
    });
    apres({ focus: false });
  };
  A['carnet-annuler'] = function () { geste(function (e) { e.vue.cadre = null; }); apres({ garderDefilement: true }); };
  A['aller-jour-suivant'] = function () {
    if (bande.passage) { return; }
    var c = vue().cadre, k = K();
    // Après le carnet du premier dimanche : le carnet à copier (§8.3).
    if (c.page === 'carnet' && cal.sauts.length && k === cal.sauts[0].reprise) {
      var texte = faireCopie();
      geste(function (e) { e.vue.cadre = { page: 'export', mode: 'jour', jour: k, abandon: c.abandon, texte: texte }; });
      bande.messageCopie = null; apres(); return;
    }
    bande.passage = true;
    rendreBandeSeule();
    var abandon = !!c.abandon;
    geste(function (e) {
      var suivant = E.allerAuJourSuivant(e, cal, abandon);
      e.vue.cadre = null;
      // Le moteur n'a pas encore calculé le nouveau jour : l'écran se choisit sans lui. Un jour joué ou un
      // point de saut s'ouvre sur le message de 18h (§7.3, §7.4) ; la clôture, sur la révélation (§7.5).
      if (cal.estCloture(suivant)) { var rv = revDe(e, suivant); rv.commencee = true; rv.ouverte = true; e.vue.tel = { ecran: 'revelation', pile: [] }; }
      else { e.vue.tel = { ecran: 'verrou', pile: [] }; }
    });
    temp = {}; bande.passage = false; bande.messageCopie = null;
    apres();
  };

  /* Le saut (§8.1 ter) */
  A['ouvrir-saut'] = function () { geste(function (e, hh) { E.ouvrirPageSaut(e, cal, hh); e.vue.cadre = { page: 'saut' }; }); apres(); };
  A['saut-annuler'] = function () { geste(function (e) { E.annulerSaut(e, cal); e.vue.cadre = null; }); apres(); };
  A['saut-confirmer'] = function () {
    geste(function (e, hh) {
      E.confirmerSaut(e, cal, socle.instantDuSaut(), hh);
      e.vue.cadre = null;
      var r = E.rattrapage(e, cal);
      aller(e, hh, 'ratt-position', { jour: r.jour }, false);
    });
    temp = {}; apres();
  };

  /* Clôture (§7.5, §8.5) */
  A['cloture-apres-dernier'] = function () { geste(function (e) { e.vue.cadre = { page: 'cloture-questions', codes: {} }; }); apres(); };
  A['fin-choix'] = function (b) {
    var cle = b.getAttribute('data-cle'), v = b.getAttribute('data-valeur');
    geste(function (e) { var c = e.vue.cadre; c.codes = c.codes || {}; c.codes[cle] = v; });
    apres({ focus: false });
  };
  A['cloture-continuer'] = function () {
    var codes = vue().cadre.codes || {};
    geste(function (e, hh) { E.marquer(e, E.K(e), 'fige', hh); E.finir(e, cal, codes); e.vue.cadre = { page: 'export', mode: 'final' }; });
    bande.messageCopie = null; apres();
  };

  /* Arrêter l'essai (§8.10) */
  A['arreter'] = function () { geste(function (e) { e.vue.cadre = { page: 'arret-confirmation' }; }); apres(); };
  A['arret-confirmer'] = function () {
    geste(function (e, hh) {
      var k = E.K(e);
      // L'arrêt est écrit dès la confirmation, raison et F2 à compléter (§8.10).
      if (cal.aUneOuverture(k)) { E.marquer(e, k, 'fige', hh); }
      E.arreter(e, cal, null, null);
      e.vue.cadre = { page: 'arret-questions' };
    });
    apres();
  };
  A['arret-raison'] = function (b) { var v = b.getAttribute('data-valeur'); geste(function (e) { E.completerArret(e, cal, 'raison', v); }); apres({ focus: false }); };
  A['arret-f2'] = function (b) { var v = b.getAttribute('data-valeur'); geste(function (e) { E.completerArret(e, cal, 'f2', v); }); apres({ focus: false }); };
  A['arret-continuer'] = function () {
    geste(function (e) { e.vue.cadre = { page: 'export', mode: 'final' }; });
    bande.messageCopie = null; apres();
  };
  A['voir-devoilement'] = function () { bande.messageCopie = null; geste(function (e) { e.vue.cadre = { page: 'devoilement' }; }); apres(); };

  /* Export : copie dans le geste (S1 §8.7) */
  function copierTexte(texte, zone, reussite, echec) {
    function seconde() {
      try {
        var r = document.createRange(); r.selectNodeContents(zone);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        if (document.execCommand && document.execCommand('copy')) { reussite(); return; }
      } catch (x) { /* suite */ }
      try { var r2 = document.createRange(); r2.selectNodeContents(zone); var s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(r2); } catch (x) { /* rien */ }
      echec();
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte).then(reussite, seconde); }
      else { seconde(); }
    } catch (x) { seconde(); }
  }
  A['copier-carnet'] = function () {
    var zone = document.getElementById('zone-carnet');
    copierTexte(zone.textContent, zone, function () { bande.messageCopie = X.carnetCopie; rendreBandeSeule(); },
      function () { bande.messageCopie = X.copieEchec; rendreBandeSeule(); });
  };
  A['export-fermer'] = function () { bande.messageCopie = null; geste(function (e) { e.vue.cadre = e.vue.cadre.retour; }); apres(); };

  /* Tout effacer (S1 §8.9) */
  A['effacer'] = function () {
    var e0 = etat();
    var apresDevoilement = !!(e0.fin || e0.arret);
    geste(function (e) { e.vue.cadre = { page: 'effacer', apres: apresDevoilement, sous: e.vue.cadre || null }; });
    apres();
  };
  A['copier-dabord'] = function () {
    var c = vue().cadre;
    var texte = c.apres ? texteCarnetFinal() : faireCopie();
    geste(function (e) { e.vue.cadre = { page: 'export', mode: 'dabord', texte: texte, retour: c }; });
    bande.messageCopie = null; apres();
  };
  A['effacer-confirmer'] = function () {
    socle.toutEffacer();
    var titre = h('h1', { tabindex: '-1' }, t(X.efface));
    montrerVueSeule([titre]);
    try { titre.focus({ preventScroll: true }); } catch (x) { titre.focus(); }
  };

  /* Écrans hors de l'icône : copies */
  function messageCopie(b, texte) { var m = b.parentNode.querySelector('.message-copie'); if (m) { m.textContent = t3(texte); m.hidden = false; } }
  A['copier-adresse'] = function (b) { copierTexte(X.adresse, b.parentNode.querySelector('.adresse'), function () { messageCopie(b, X.adresseCopiee); }, function () { messageCopie(b, X.adresseEchec); }); };
  A['copier-lignes'] = function (b) { var z = document.getElementById('diagnostic'); copierTexte(z.textContent, z, function () { messageCopie(b, X.lignesCopiees); }, function () { messageCopie(b, X.lignesEchec); }); };

  /* ================================================================== */
  /* Branchement au socle                                               */
  /* ================================================================== */

  var ecrans = {
    rendre: function () { normaliserAuChargement(); relireHeure = true; rendre(); },
    arret: arret,
    hors: function (type) { hors(type); },
    ancienne: function (info) { ancienneInfo = info; rendre(); },
    actions: A,
    /**
     * Une note passagère part au toucher suivant (S1 §8.1). Elle part après le geste, au « click » :
     * l'ôter dès le « pointerdown » ferait bouger le téléphone sous le doigt (la bande raccourcit), et
     * le toucher tomberait à côté de sa cible.
     */
    avantToucher: function (ev) {
      var cible = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
      noteAEffacer = bande.note && !(cible && cible.getAttribute('data-action') === 'absent') ? bande.note : null;
    },
    revenu: function () { if (etat() && !vue().cadre && vue().tel.ecran === 'attente') { relireHeure = true; rendre(); } },
    carnet: function () { var e = etat(); return e && (e.fin || e.arret) ? texteCarnetFinal() : null; },
    copies: function () { return JSON.parse(JSON.stringify(copiesDuChargement)); },
    relevesCopies: function () { return relevesCopies; }
  };

  function demarrer() {
    socle = S.creer({
      window: window, document: document, performance: performance,
      maintenantMs: function () { return Date.now(); },
      version: ENTREES.version_page, scelleB64: SCELLE_B64, confusables: CONFUSABLES
    });
    // Le calendrier et le fichier ne sont lus qu'après V1 à V5 : les écrans les prennent au premier rendu.
    var rendreSocle = ecrans.rendre, ancienneSocle = ecrans.ancienne;
    ecrans.rendre = function () { cal = socle.cal(); scelle = socle.scelle(); rendreSocle(); };
    ecrans.ancienne = function (info) { cal = socle.cal(); scelle = socle.scelle(); ancienneSocle(info); };
    return socle.demarrer(ecrans);
  }

  return { demarrer: demarrer };
})(ElenchosNoyau, ElenchosTextes, ElenchosEtat, ElenchosJournal, ElenchosCarnet, ElenchosMoteur, ElenchosSocle);

ElenchosInterface.demarrer();
