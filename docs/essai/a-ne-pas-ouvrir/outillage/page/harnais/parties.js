/* Parties du harnais (§9 ; regles-de-calcul.md, §9 bis ; schema.md, parties
 * 3.1, 3.12, 4.4) : journaux écrits d'avance, avec les gestes que le journal
 * ne dit pas.
 *
 * - (a) : le journal de la partie témoin (a) est celui du carnet de
 *   référence (references/carnet-2-cloture-a/journal.json), rejoué tel quel
 *   (§9, « Carnets de référence » ; il n'en est écrit aucun autre).
 * - (b) : réponses écrites pour couvrir la liste du §9 bis et les cas de la
 *   partie 4.4 ; tente toutes les raisons cachées.
 * - (c) : lit le fichier scellé et attribue tout juste (Le Sans-Faute).
 * - (d) à (i) : arrêts (liste du §9 bis ; contrôle 12, jour 8).
 * - hasard-001 à hasard-200 : coups tirés au hasard, graine de chaque partie
 *   dérivée d'une graine maîtresse inscrite au rapport de contrôle.
 *
 * Le joueur voit ce que voit le porteur : les cartes servies (le moteur de
 * la page, en Node, sert ici d'écran) ; il ne lit les profils cachés que
 * pour (c), qui est fait pour cela. Les journaux écrits ici sont les
 * entrées du harnais et du programme de contrôle.
 */
'use strict';
const crypto = require('node:crypto');
const N = require('../noyau.js');
const M = require('../moteur.js');

const PERSOS = M.PERSONNAGES;
const TENSIONS = M.TENSIONS;
const POSITIONS = [1, 2, 3, 4, 5];

function coupsVides(k) {
  return { carnet: { q1: null, q2: null, q3: null }, consentement: null, deviner: null,
    entree: k === 0 ? { E1: { reponse: null, pari: null }, E2: { reponse: null, pari: null }, E3: { reponse: null, pari: null } } : null,
    pseudo: null, relire: 0, reponse: null };
}
function copie(v) { return JSON.parse(JSON.stringify(v)); }

/** Instant de Paris à la date civile (a, m, j) et à l'heure hh:mm ; décalage choisi s'il y a deux passages. */
function instant(a, m, j, hhmm, decalage) {
  const z = N.joursDepuisCivil(a, m, j);
  const local = (z * 1440 + N.lireHeure(hhmm)) * 60000;
  for (const dec of decalage ? [decalage] : [120, 60]) {
    const p = N.paris(local - dec * 60000);
    if (p.decalage === dec && p.numeroJour === z && p.minutesDuJour === N.lireHeure(hhmm)) { return p.instant; }
  }
  throw new Error('heure locale inexistante : ' + a + '-' + m + '-' + j + ' ' + hhmm);
}

/** Choisit la raison qui donne la classe voulue (§5.1), si elle existe. */
function raisonPour(texte, niveau, classe) {
  const cote = niveau <= 2 ? -1 : (niveau === 3 ? 0 : 1);
  const pi = cote > 0 ? texte.sens : 1 - texte.sens;
  const cons = texte.considerations;
  const avec = f => { const c = cons.find(f); return c ? c.rang : null; };
  if (classe === 'arbitrage') { return avec(c => c.pole === pi); }
  if (classe === 'penchant') { return avec(c => c.pole === 'aucun') || 'aucune'; }
  if (classe === 'tiraille') { return avec(c => c.pole === 1 - pi); }
  return avec(() => true);
}

function f1Plein(valeur) {
  const o = {};
  for (const p of PERSOS) { o[p] = {}; for (const t of TENSIONS) { o[p][t] = typeof valeur === 'function' ? valeur(p, t) : valeur; } }
  return o;
}

/**
 * Écrit le journal d'une partie (schema.md, partie 3.12) en la jouant
 * séance par séance : le moteur montre les cartes servies, le joueur
 * décide. Rend { journal, gestes }.
 *
 * joueur : {
 *   id, mode, graine, empreinte,
 *   ouverture(k), versions(k),
 *   entree(E, scelle) -> {reponse, pari} | null,  pseudo,
 *   deviner(k, cartes, manche) -> [{designe, raison}] | null (non validée),
 *   arreteAvantJouer(k) -> bool : séances 3 à 14, ni Deviner ni Répondre affichés,
 *   repondre(k, texte) -> {niveau, raison} | null,
 *   relire(k), carnet(k, infos) -> {q1, q2, q3}, attente(k) -> [heures],
 *   copies(k, etape) -> bool (copie à cette étape : 'deviner' avant tout geste, 'relire:n', 'valide', 'reponse'),
 *   gestes(k) -> objet de gestes (joueur.js), arret: {k, raison, f2, f1, carnet}, fin: {f2, f1}
 * }
 */
function jouer(scelle, joueur) {
  const journal = {
    format: 'elenchos-essai-journal', version: 3, empreinte_scelle: joueur.empreinte,
    partie: { id: joueur.id, mode: joueur.mode, graine: joueur.graine === undefined ? null : joueur.graine },
    seances: [], copies: [], arret: null, fin: null
  };
  const gestes = { seances: {} };
  const inter = joueur.mode === 'interface';
  const kFin = joueur.arret ? joueur.arret.k : 15;
  for (let k = 0; k <= kFin; k++) {
    const s = { k, ouverture: joueur.ouverture(k), versions: inter ? joueur.versions(k) : null,
      etapes: inter && k >= 1 && k <= 14 ? { deviner: false, repondre: false } : null, coups: coupsVides(k), attente: null };
    journal.seances.push(s);
    const c = s.coups;
    const g = joueur.gestes ? (joueur.gestes(k) || {}) : {};
    if (Object.keys(g).length) { gestes.seances[k] = g; }
    const estArret = joueur.arret && k === joueur.arret.k;
    const copier = (etape) => {
      if (!inter || !joueur.copies || k > 14 || !joueur.copies(k, etape)) { return; }
      journal.copies.push({ k, coups: copie(c), versions: s.versions.slice(0, joueur.versionsALaCopie ? joueur.versionsALaCopie(k) : s.versions.length),
        etapes: s.etapes ? copie(s.etapes) : null });
    };
    if (k === 0) {
      for (const E of ['E1', 'E2', 'E3']) {
        const e = joueur.entree(E, scelle);
        if (!e) { break; }
        c.consentement = true;
        c.entree[E] = { reponse: e.reponse, pari: e.pari };
        if (e.pari === null) { break; }
      }
      c.pseudo = joueur.pseudo;
    }
    // Ce que l'interface affiche (§7.1, §7.3) : à la séance 1, Répondre d'emblée ; à la séance 2, Deviner
    // d'emblée (Répondre s'il n'y a pas de carte) ; dès la séance 3, la révélation, puis « Jouer » mène à
    // Deviner, et « Valider » à Répondre. Seul choix du joueur : s'arrêter avant « Jouer » (séances 3 à 14).
    const avantJouer = k >= 3 && k <= 14 && !!(joueur.arreteAvantJouer && joueur.arreteAvantJouer(k));
    let valide = true;
    if (k >= 2 && k <= 14) {
      c.deviner = null;
      const R0 = M.calculer(scelle, journal);
      const manche = R0.seances[k].manches.porteur;
      c.deviner = manche.cartes.map(() => ({ designe: null, raison: null }));
      if (manche.cartes.length && !avantJouer) {
        if (inter) { s.etapes.deviner = true; }
        copier('deviner');
        const nRelire = joueur.relire ? joueur.relire(k) : 0;
        for (let i = 0; i < nRelire; i++) { c.relire += 1; copier('relire:' + c.relire); }
        const choix = joueur.deviner(k, manche.cartes, manche);
        if (choix) { c.deviner = choix; copier('valide'); }
      }
      valide = !avantJouer && c.deviner.every(d => d.designe !== null);
    }
    if (k >= 1 && k <= 14 && valide) {
      {
        if (inter) { s.etapes.repondre = true; }
        c.reponse = joueur.repondre(k, scelle.textes[String(k)]);
        if (c.reponse) { copier('reponse'); }
      }
    }
    if (k >= 1 && k <= 14 && c.reponse && valide && joueur.attente) {
      const h = joueur.attente(k);
      if (h && h.length) { s.attente = { lectures: h.map(x => ({ heure: x })) }; }
    }
    const veutCarnet = joueur.carnet && (!estArret || (joueur.arret.carnet));
    if (veutCarnet) {
      const R1 = M.calculer(scelle, journal);
      const verdicts = k >= 3 ? R1.seances[k].mesures.revelation_verdicts : null;
      const faux = k === 0 ? Object.values(R1.seances[0].entree.textes).filter(t => t.juste === false).length
        : (verdicts ? verdicts.filter(v => v === 'faux').length : 0);
      const choixQ3 = M.choixQ3(k, inter ? s.etapes : null);
      const q = joueur.carnet(k, { faux, etapes: s.etapes, choixQ3, pseudo: c.pseudo });
      if (q) {
        const r = { q1: faux >= 1 ? q.q1 : null, q2: q.q2, q3: q.q3 };
        if (r.q1 === 'les_deux' && faux < 2) { r.q1 = 'aurais_pu'; }
        if (k === 15 || (k >= 1 && inter && !(s.etapes && s.etapes.repondre))) { r.q2 = null; }
        if (k === 15) { r.q3 = null; }
        if (r.q3 !== null && choixQ3.indexOf(r.q3) < 0) { r.q3 = choixQ3.length ? choixQ3[choixQ3.length - 1] : null; }
        if (k === 0 && c.pseudo === null) { r.q1 = r.q2 = r.q3 = null; }
        c.carnet = r;
      }
    }
  }
  if (joueur.arret) { journal.arret = { k: joueur.arret.k, raison: joueur.arret.raison, f2: joueur.arret.k >= 3 ? joueur.arret.f2 : null, f1: joueur.arret.k >= 3 ? joueur.arret.f1 : null }; }
  else { journal.fin = joueur.fin; }
  return { journal, gestes };
}

/* ------------------------------------------------------------------ */
/* Tirage des parties au hasard (outil du harnais, jamais dans la page) */
/* ------------------------------------------------------------------ */

/** Générateur déterministe : SHA-256(graine | compteur), 32 bits à la fois. */
function generateur(graine) {
  let compteur = 0, tampon = [];
  function u32() {
    if (!tampon.length) {
      const h = crypto.createHash('sha256').update(graine + '|' + (compteur++)).digest();
      for (let i = 0; i < 32; i += 4) { tampon.push(h.readUInt32BE(i)); }
    }
    return tampon.shift();
  }
  const g = n => { // entier uniforme dans [0, n)
    const lim = Math.floor(0x100000000 / n) * n;
    let x; do { x = u32(); } while (x >= lim);
    return x % n;
  };
  g.choisir = a => a[g(a.length)];
  g.proba = p => g(1000) < p * 1000;
  return g;
}

function grainePartie(maitresse, i) { return crypto.createHash('sha256').update(maitresse + '|' + i).digest('hex').slice(0, 16); }

/** Joueur au hasard (partie hasard-nnn). */
function joueurHasard(scelle, empreinte, maitresse, i, mode) {
  const graine = grainePartie(maitresse, i);
  const g = generateur(graine);
  const id = 'hasard-' + String(i).padStart(3, '0');
  const arretK = g.proba(0.25) ? g(15) : null;
  // ouvertures : de 1 à 2 jours entre deux séances, parfois le même jour ; départ le 18 ou le 19 octobre
  const ouvertures = [];
  let jour = 18 + g(2), minute = 7 * 60 + g(14 * 60);
  for (let k = 0; k <= 15; k++) {
    if (k > 0) {
      const saut = g.choisir([0, 1, 1, 1, 1, 2]);
      if (saut === 0) { minute = Math.min(minute + 5 + g(120), 23 * 60 + 59); } else { jour += saut; minute = g(1440); }
    }
    const d = new Date(Date.UTC(2026, 9, jour));
    let hhmm = N.deux(Math.floor(minute / 60)) + ':' + N.deux(minute % 60);
    // heure sautée au passage à l'heure d'été : n'existe pas en octobre ; au 25 octobre, 02:00 à 02:59 deux fois : on prend un passage au hasard
    let inst;
    try { inst = instant(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hhmm, d.getUTCDate() === 25 && d.getUTCMonth() === 9 && minute >= 120 && minute < 180 ? g.choisir([120, 60]) : null); }
    catch (e) { inst = instant(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hhmm); }
    ouvertures.push(inst);
  }
  for (let k = 1; k <= 15; k++) { if (N.lireInstant(ouvertures[k]) < N.lireInstant(ouvertures[k - 1])) { ouvertures[k] = ouvertures[k - 1]; } }
  const reponse = (texte) => {
    if (g.proba(0.08)) { return null; }
    const niveau = g.choisir(POSITIONS);
    const raison = g.proba(0.15) ? 'aucune' : 1 + g(4);
    return { niveau, raison };
  };
  const inter = mode === 'interface';
  const pseudo = 'Hasard-' + graine.slice(0, 6) + '-x';
  const joueur = {
    id, mode, graine, empreinte,
    ouverture: k => ouvertures[k], versions: () => [1],
    entree: (E) => {
      if (arretK === 0 && E === 'E2' && g.proba(0.5)) { return null; }
      const r = { niveau: g.choisir(POSITIONS), raison: g.proba(0.1) ? 'aucune' : 1 + g(4) };
      return { reponse: r, pari: (arretK === 0 && E === 'E3' && g.proba(0.5)) ? null : g.choisir(POSITIONS) };
    },
    pseudo: arretK === 0 && g.proba(0.5) ? null : pseudo,
    arreteAvantJouer: () => g.proba(0.03),
    deviner: (k, cartes) => {
      if (inter && g.proba(0.07)) { return null; } // laissées sans « Valider »
      const libres = PERSOS.slice();
      return cartes.map(c => {
        if (g.proba(0.12) || !libres.length) { return { designe: 'passe', raison: null }; }
        const d = libres.splice(g(libres.length), 1)[0];
        return { designe: d, raison: c.cachee && g.proba(0.7) ? (g.proba(0.2) ? 'aucune' : 1 + g(4)) : null };
      });
    },
    repondre: (k, t) => reponse(t),
    relire: () => g.choisir([0, 0, 0, 1, 2]),
    attente: () => { const n = 1 + (g.proba(0.3) ? 1 : 0); const h = []; for (let x = 0; x < n; x++) { h.push(N.deux(g(24)) + ':' + N.deux(g(60))); } return h; },
    carnet: (k, info) => ({
      q1: g.proba(0.7) ? g.choisir(['aurais_pu', 'ne_pouvais_pas', 'les_deux']) : null,
      q2: g.proba(0.7) ? g.choisir(['premier_coup', 'en_relisant', 'pas_tout']) : null,
      q3: g.proba(0.7) && info.choixQ3.length ? g.choisir(info.choixQ3) : null
    }),
    copies: (k, etape) => inter && k >= 2 && etape === 'deviner' && g.proba(0.05),
    arret: arretK === null ? null : { k: arretK, raison: g.proba(0.8) ? g.choisir(['pas_amuse', 'pas_compris', 'pas_le_temps', 'vu_assez', 'autre']) : null,
      f2: g.proba(0.8) ? g.choisir(['de_plus_en_plus', 'toujours_autant', 'de_moins_en_moins', 'jamais']) : null,
      f1: g.proba(0.6) ? f1Plein(() => g.proba(0.85) ? g.choisir(['pole0', 'milieu', 'pole1']) : null) : null, carnet: g.proba(0.3) },
    fin: { f2: g.proba(0.9) ? g.choisir(['de_plus_en_plus', 'toujours_autant', 'de_moins_en_moins', 'jamais']) : null,
      f1: f1Plein(() => g.proba(0.9) ? g.choisir(['pole0', 'milieu', 'pole1']) : null) }
  };
  // en mode interface, les gestes non écrits dans le journal
  joueur.gestes = (k) => {
    const o = {};
    if (inter && g.proba(0.1)) { o.positionSansRaison = g.choisir(POSITIONS); }
    return o;
  };
  return joueur;
}

/* ------------------------------------------------------------------ */
/* Parties témoins                                                     */
/* ------------------------------------------------------------------ */

const CLASSES = ['arbitrage', 'penchant', 'tiraille', 'neutre'];

/** (b) : réponses écrites pour couvrir la liste du §9 bis et la partie 4.4. */
function temoinB(scelle, empreinte) {
  const ouv = {
    0: instant(2026, 10, 19, '20:05'), 1: instant(2026, 10, 20, '09:00'), 2: instant(2026, 10, 21, '09:00'),
    3: instant(2026, 10, 22, '18:00'), 4: instant(2026, 10, 23, '12:00'), 5: instant(2026, 10, 24, '23:40'),
    6: instant(2026, 10, 25, '02:10', 120), 7: instant(2026, 10, 25, '02:40', 60), 8: instant(2026, 10, 25, '10:00'),
    9: instant(2026, 10, 27, '08:00'), 10: instant(2026, 10, 28, '08:00'), 11: instant(2026, 10, 29, '08:00'),
    12: instant(2026, 10, 30, '00:00'), 13: instant(2026, 10, 31, '13:13'), 14: instant(2026, 11, 1, '09:00'),
    15: instant(2026, 11, 3, '18:30')
  };
  const lectures = { 1: ['09:05'], 2: ['09:20'], 3: ['23:58'], 4: ['17:59', '18:00'], 5: ['23:55'], 6: ['02:30', '02:30'], 7: ['02:45'],
    9: ['08:30'], 10: ['09:00', '09:05'], 11: ['20:00'], 13: ['13:20'], 14: ['09:10', '09:15'] };
  let raisonCachee = 0;
  return {
    id: 'b', mode: 'interface', empreinte,
    ouverture: k => ouv[k],
    // séance 5 atteinte sous 1, ouverte sous 2 ; séance 9 : 2, puis 3 (après la copie)
    versions: k => k < 5 ? [1] : (k < 9 ? [2] : (k === 9 ? [2, 3] : [3])),
    versionsALaCopie: () => 1,
    entree: (E) => ({ E1: { reponse: { niveau: 4, raison: 2 }, pari: 1 }, E2: { reponse: { niveau: 2, raison: 'aucune' }, pari: 4 },
      E3: { reponse: { niveau: 3, raison: 3 }, pari: 3 } })[E],
    pseudo: 'Témoin-b-4821-k',
    deviner: (k, cartes) => {
      if (k === 12) { return null; } // cartes attribuées sans « Valider »
      const libres = PERSOS.slice();
      return cartes.map((c, i) => {
        if ((k === 9 && i === 0) || (k === 13 && i === 1)) { return { designe: 'passe', raison: null }; }
        const d = libres.splice((k + i) % libres.length, 1)[0];
        let raison = null;
        if (c.cachee) { raison = ['aucune', 1, 2, 3, 4][raisonCachee % 5]; raisonCachee++; }
        return { designe: d, raison };
      });
    },
    repondre: (k, t) => {
      if (k === 8) { return null; } // position donnée sans raison
      const classe = CLASSES[k % 4];
      const niveau = classe === 'neutre' ? 3 : [5, 2, 4, 1][k % 4];
      const r = raisonPour(t, niveau, classe);
      return { niveau, raison: r === null ? 'aucune' : r };
    },
    relire: k => (k === 9 ? 2 : (k * 7) % 3),
    attente: k => lectures[k] || ['21:00'],
    copies: (k, etape) => k === 9 && etape === 'deviner',
    carnet: (k, i) => ({ q1: i.faux >= 2 ? 'les_deux' : 'aurais_pu', q2: ['premier_coup', 'en_relisant', 'pas_tout'][k % 3],
      q3: i.choixQ3.length ? i.choixQ3[k % i.choixQ3.length] : null }),
    gestes: k => ({ 8: { positionSansRaison: 4, annulerConfirmation: true }, 9: { rechargerApres: 'copie' },
      10: { cercle: true }, 12: { attribuerSansValider: [{ carte: 0, membre: 'Odile' }, { carte: 1, membre: 'passe' }] }, 14: { cercle: true } })[k],
    fin: { f2: 'de_plus_en_plus', f1: f1Plein((p, t) => ['pole0', 'milieu', 'pole1', null][(p.length + t.charCodeAt(0)) % 4]) }
  };
}

/** (c) : lit le fichier scellé et attribue tout juste, avec la vraie raison de la carte à raison cachée. */
function temoinC(scelle, empreinte) {
  return {
    id: 'c', mode: 'interface', empreinte,
    ouverture: k => instant(2026, 10, 19 + k, '20:00'),
    versions: () => [1],
    entree: (E, s) => ({ reponse: { niveau: 4, raison: 1 }, pari: s.reponses[E].Agathe.niveau }),
    pseudo: 'Témoin-c-7305-z',
    deviner: (k, cartes) => cartes.map(c => ({ designe: c.auteur === 'porteur' ? 'passe' : c.auteur,
      raison: c.cachee ? scelle.reponses[String(k - 1)][c.auteur].raison : null })),
    repondre: (k, t) => ({ niveau: 4, raison: raisonPour(t, 4, 'arbitrage') || 1 }),
    attente: () => ['23:59'],
    carnet: (k, i) => ({ q1: 'ne_pouvais_pas', q2: 'premier_coup', q3: i.choixQ3.length ? i.choixQ3[0] : null }),
    fin: { f2: 'toujours_autant', f1: f1Plein('pole1') }
  };
}

/** Parties d'arrêt (liste du §9 bis ; contrôle 12, arrêt au jour 8). */
function temoinArret(scelle, empreinte, id, k, o) {
  o = o || {};
  return {
    id, mode: 'interface', empreinte,
    ouverture: j => instant(2026, 10, 20 + j, '11:11'),
    versions: () => [1],
    entree: (E) => {
      if (k === 0 && E === 'E2') { return { reponse: { niveau: 1, raison: 2 }, pari: null }; }
      return { reponse: { niveau: 1, raison: 2 }, pari: 5 };
    },
    pseudo: k === 0 ? null : 'Témoin-' + id + '-552-q',
    deviner: (j, cartes) => (o.sansValider && j === k) ? null : cartes.map((c, i) => ({ designe: i === 0 ? 'passe' : (c.auteur === 'porteur' ? 'passe' : c.auteur), raison: null })),
    repondre: (j) => (o.sansReponse || []).indexOf(j) >= 0 ? null : { niveau: 2, raison: 'aucune' },
    attente: (j) => o.lectures && o.lectures[j] ? o.lectures[j] : ['12:12'],
    relire: () => 0,
    carnet: (j) => ({ q1: 'aurais_pu', q2: 'en_relisant', q3: 'aucun' }),
    copies: o.copie ? (j, etape) => j === o.copie.k && etape === o.copie.etape : null,
    gestes: o.gestes || null,
    arret: { k, raison: o.raison === undefined ? 'vu_assez' : o.raison, f2: 'jamais', f1: o.sansF1 ? null : f1Plein((p, t) => p === 'Odile' ? null : 'pole0'),
      carnet: !!o.carnet }
  };
}

function partiesTemoins(scelle, empreinte) {
  return [
    jouer(scelle, temoinB(scelle, empreinte)),
    jouer(scelle, temoinC(scelle, empreinte)),
    // arrêt à l'entrée, avant 1.9 (le deuxième pari manque)
    jouer(scelle, temoinArret(scelle, empreinte, 'd', 0, { raison: 'pas_compris' })),
    // arrêt avant le jour 3, journée pas finie (Deviner affiché, rien validé)
    jouer(scelle, temoinArret(scelle, empreinte, 'e', 2, { raison: null, sansValider: true })),
    // arrêt après le jour 3, F1 remplie, copie en cours d'essai après « En attendant »
    jouer(scelle, temoinArret(scelle, empreinte, 'f', 6, { copie: { k: 5, etape: 'reponse' }, lectures: { 5: ['12:12', '12:40'] } })),
    // arrêt avec F1 sautée, carnet du jour rempli puis « Annuler »
    jouer(scelle, temoinArret(scelle, empreinte, 'g', 5, { sansF1: true, carnet: true, lectures: { 5: ['12:12', '12:30'] } })),
    // contrôle 12 : arrêt au jour 8, réponses à 4 des 6 textes révélés, puis à 5 des 6
    jouer(scelle, temoinArret(scelle, empreinte, 'h', 8, { sansReponse: [2, 5] })),
    jouer(scelle, temoinArret(scelle, empreinte, 'i', 8, { sansReponse: [2] }))
  ];
}

function partiesHasard(scelle, empreinte, maitresse, debut, n, mode) {
  const r = [];
  for (let i = debut; i < debut + n; i++) { r.push(jouer(scelle, joueurHasard(scelle, empreinte, maitresse, i, mode))); }
  return r;
}

module.exports = { jouer, partiesTemoins, partiesHasard, grainePartie, generateur, instant, raisonPour, f1Plein, temoinB, temoinC, temoinArret, joueurHasard };
