/* Joueurs témoins écrits pour les tests du moteur (lot 3).
 *
 * jouer(scelle, joueur) écrit un journal (schema.md, partie 3.12) en jouant
 * séance par séance, comme le fera le harnais : à chaque séance, le moteur
 * dit quelles cartes sont servies ; le joueur décide ses coups. Le moteur
 * ne fait que montrer les cartes : les décisions du joueur sont écrites
 * ici, à la main, et ne lisent jamais les profils cachés.
 */
'use strict';
const N = require('../../noyau.js');
const M = require('./moteur-premier-essai.js');

const PERSOS = M.PERSONNAGES;
const TENSIONS = M.TENSIONS;

function coupsVides() {
  return { carnet: { q1: null, q2: null, q3: null }, consentement: null, deviner: null, entree: null, pseudo: null, relire: 0, reponse: null };
}

/** Instant de Paris k jours après le lundi 19 octobre 2026, à hh:mm. */
function instant(jour, hhmm) {
  const z = N.joursDepuisCivil(2026, 10, 19) + jour;
  const local = (z * 1440 + N.lireHeure(hhmm)) * 60000;
  // premier passage de cette heure locale à Paris (heure d'été d'abord)
  for (const dec of [120, 60]) {
    const p = N.paris(local - dec * 60000);
    if (p.decalage === dec && p.numeroJour === z && p.minutesDuJour === N.lireHeure(hhmm)) { return p.instant; }
  }
  throw new Error('heure locale inexistante : ' + jour + ' ' + hhmm);
}

/**
 * joueur : {
 *   id, mode ('interface' | 'moteur'), graine (null pour un témoin),
 *   ouverture(k) -> instant, versions(k) -> [entiers] (interface),
 *   entree(E, inviteuse) -> {reponse, pari} ou null pour s'arrêter avant,
 *   pseudo -> chaîne ou null (arrêt avant 1.9),
 *   deviner(k, cartesServies, ctx) -> [{designe, raison}] (ou null : manche non validée),
 *   repondre(k, texte) -> {niveau, raison} ou null,
 *   repondreAffiche(k) -> bool (l'écran Répondre a été affiché),
 *   relire(k) -> entier, carnet(k, infos) -> {q1, q2, q3},
 *   attente(k) -> [heures] (journée finie seulement),
 *   arret -> {k, raison, f2, f1} ou null ; fin -> {f2, f1} ; copies(k, etat) -> [copie]
 * }
 */
function jouer(scelle, joueur) {
  const journal = {
    format: 'elenchos-essai-journal', version: 3, empreinte_scelle: joueur.empreinte,
    partie: { id: joueur.id, mode: joueur.mode, graine: joueur.graine === undefined ? null : joueur.graine },
    seances: [], copies: [], arret: null, fin: null
  };
  const interface_ = joueur.mode === 'interface';
  const kFin = joueur.arret ? joueur.arret.k : 15;
  for (let k = 0; k <= kFin; k++) {
    const s = { k, ouverture: joueur.ouverture(k), versions: interface_ ? joueur.versions(k) : null,
      etapes: interface_ && k >= 1 && k <= 14 ? { deviner: false, repondre: false } : null, coups: coupsVides(), attente: null };
    journal.seances.push(s);
    const c = s.coups;
    if (k === 0) {
      c.entree = { E1: { reponse: null, pari: null }, E2: { reponse: null, pari: null }, E3: { reponse: null, pari: null } };
      for (const E of ['E1', 'E2', 'E3']) {
        const e = joueur.entree(E, scelle.reponses[E].Agathe);
        if (!e) { break; }
        c.consentement = true;
        c.entree[E] = { reponse: e.reponse, pari: e.pari };
        if (e.pari === null) { break; }
      }
      c.pseudo = joueur.pseudo;
    }
    let cartes = null;
    if (k >= 2 && k <= 14) {
      // cartes servies au joueur : le moteur, sur le journal tel qu'il est
      c.deviner = null;
      const R0 = M.calculer(scelle, journal);
      cartes = R0.seances[k].manches.porteur.cartes;
      c.deviner = cartes.map(() => ({ designe: null, raison: null }));
      const choix = joueur.deviner(k, cartes, R0.seances[k].manches.porteur);
      if (choix) { c.deviner = choix; }
      if (interface_ && cartes.length) { s.etapes.deviner = true; }
      c.relire = joueur.relire ? joueur.relire(k) : 0;
    }
    const valide = !Array.isArray(c.deviner) || c.deviner.every(d => d.designe !== null);
    if (k >= 1 && k <= 14 && valide) {
      const affiche = joueur.repondreAffiche ? joueur.repondreAffiche(k) : true;
      if (affiche) {
        if (interface_) { s.etapes.repondre = true; }
        c.reponse = joueur.repondre(k, scelle.textes[String(k)]);
      }
    }
    // copies faites en cours de séance (avant les questions du carnet)
    if (interface_ && joueur.copies) {
      for (const cp of joueur.copies(k, s) || []) { journal.copies.push(cp); }
    }
    if (k >= 1 && k <= 14 && c.reponse && valide && joueur.attente) {
      const h = joueur.attente(k);
      if (h && h.length) { s.attente = { lectures: h.map(x => ({ heure: x })) }; }
    }
    if (joueur.carnet && !(joueur.arret && k === joueur.arret.k && joueur.arret.carnetVide)) {
      const R1 = M.calculer(scelle, journal);
      const verdicts = k >= 3 ? R1.seances[k].mesures.revelation_verdicts : null;
      const faux = k === 0 ? Object.values(R1.seances[0].entree.textes).filter(t => t.juste === false).length
        : (verdicts ? verdicts.filter(v => v === 'faux').length : 0);
      const q = joueur.carnet(k, { faux, etapes: s.etapes, pseudo: c.pseudo, choix: M.choixQ3(k, s.etapes) });
      if (q) { c.carnet = q; }
    }
  }
  if (joueur.arret) { journal.arret = { k: joueur.arret.k, raison: joueur.arret.raison, f2: joueur.arret.f2, f1: joueur.arret.f1 }; }
  else { journal.fin = joueur.fin; }
  return journal;
}

/** Durées inventées pour le carnet (mode interface), présentes selon etapes. */
function dureesPour(journal) {
  const ligne = (k, etapes, base) => ({ k, duree_seance: base, duree_deviner: etapes && etapes.deviner ? base % 97 + 3 : null,
    duree_repondre: etapes && etapes.repondre ? base % 61 + 5 : null });
  return {
    format: 'elenchos-essai-durees', version: 1, partie: journal.partie.id,
    seances: journal.seances.map(s => ligne(s.k, s.etapes, 120 + 37 * s.k)),
    copies: journal.copies.map((c, i) => ligne(c.k, c.etapes, 40 + 11 * i))
  };
}

function f1Plein(valeur) {
  const o = {};
  for (const p of PERSOS) { o[p] = {}; for (const t of TENSIONS) { o[p][t] = typeof valeur === 'function' ? valeur(p, t) : valeur; } }
  return o;
}

/** Générateur pseudo-aléatoire déterministe (pour les tests seulement). */
function hasard(graine) {
  let x = graine >>> 0 || 1;
  return function (n) { x = (Math.imul(x ^ (x >>> 15), 2246822519) + 0x9e3779b9) >>> 0; x ^= x >>> 13; return (x >>> 0) % n; };
}

module.exports = { jouer, dureesPour, coupsVides, instant, f1Plein, hasard };
