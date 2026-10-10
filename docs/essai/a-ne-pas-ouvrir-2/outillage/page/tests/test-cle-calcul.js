/* Lot 7 : clé du cache des résultats du socle (M.cleCalcul). Le socle ne recalcule `calculer` que si la clé
 * change ; il faut donc que deux journaux de même clé donnent les mêmes résultats.
 * Preuve en deux temps, sur le fichier scellé final et sur tous les journaux témoins (mode moteur, (a) en mode
 * interface, les 37 parties jouées par l'interface), entiers et coupés à chaque jour atteint :
 *  1. chaque lecture que `calculer` fait dans le journal (relevée par un Proxy) porte sur une partie de la clé ;
 *     `calculer` étant une fonction pure, même clé => mêmes lectures => mêmes résultats ;
 *  2. contre-épreuve : en changeant tout ce qui n'est pas dans la clé (versions, autres étapes, partie, copies,
 *     arrêt, fin, empreinte), la clé et les résultats (JSON canonique) restent les mêmes.
 * Variable ELENCHOS_SCELLE_FINAL pour un autre fichier. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');

const ICI = path.join(__dirname, '..');
const FICHIER = process.env.ELENCHOS_SCELLE_FINAL || path.join(ICI, '..', '..', 'fichier-scelle.json');
const DISPONIBLE = fs.existsSync(FICHIER);

function journauxTemoins() {
  const l = [];
  const voir = (d) => {
    if (!fs.existsSync(d)) { return; }
    fs.readdirSync(d).sort().forEach((id) => {
      const f = path.join(d, id, 'journal.json');
      if (fs.existsSync(f)) { l.push({ id, journal: JSON.parse(fs.readFileSync(f, 'utf8')) }); }
    });
  };
  voir(path.join(ICI, 'temoins'));
  voir(path.join(ICI, 'temoins', 'interface'));
  return l;
}

/** Le journal coupé après le jour k (jours suivants et sauts partis après k retirés). */
function coupe(journal, k) {
  const j = JSON.parse(JSON.stringify(journal));
  Object.keys(j.jours).forEach((x) => { if (+x > k) { delete j.jours[x]; } });
  j.sauts = j.sauts.filter((s) => s.depart <= k);
  j.arret = null; j.fin = null; j.copies = [];
  return j;
}

/** Proxy qui relève chaque chemin lu (get, has, getOwnPropertyDescriptor ; ownKeys noté « * »). */
function espion(objet, lus) {
  const envelopper = (o, chemin) => new Proxy(o, {
    get(c, p, r) {
      const v = Reflect.get(c, p, r);
      if (typeof p !== 'string') { return v; }
      lus.push(chemin.concat(p));
      return v && typeof v === 'object' ? envelopper(v, chemin.concat(p)) : v;
    },
    has(c, p) { if (typeof p === 'string') { lus.push(chemin.concat(p)); } return Reflect.has(c, p); },
    getOwnPropertyDescriptor(c, p) { if (typeof p === 'string') { lus.push(chemin.concat(p)); } return Reflect.getOwnPropertyDescriptor(c, p); },
    ownKeys(c) { lus.push(chemin.concat('*')); return Reflect.ownKeys(c); }
  });
  return envelopper(objet, []);
}

/** Vrai si le chemin lu est couvert par M.cleCalcul. */
function dansLaCle(ch) {
  if (ch.length === 1) { return ['format', 'version', 'jours', 'sauts'].indexOf(ch[0]) >= 0; }
  if (ch[0] === 'sauts') { return true; }
  if (ch[0] !== 'jours') { return false; }
  if (ch.length === 2) { return true; } // un jour, ou la liste des jours
  if (ch.length === 3) { return ['coups', 'etapes', 'attente', 'ouverture'].indexOf(ch[2]) >= 0; }
  if (ch[2] === 'coups' || ch[2] === 'attente') { return true; }
  return ch[2] === 'etapes' && ch.length === 4 && ch[3] === 'entree';
}

/** Tout ce qui n'est pas dans la clé, changé. */
function brouiller(journal) {
  const j = JSON.parse(JSON.stringify(journal));
  Object.values(j.jours).forEach((d) => {
    if (d.versions) { d.versions = d.versions.map(() => 99); }
    if (d.etapes) { Object.keys(d.etapes).forEach((e) => { if (e !== 'entree') { d.etapes[e] = !d.etapes[e]; } }); }
  });
  j.partie = { graine: 'brouillee', id: 'autre', mode: j.partie && j.partie.mode === 'moteur' ? 'interface' : 'moteur' };
  j.copies = [{ brouille: true }];
  j.arret = { brouille: true };
  j.fin = { brouille: true };
  j.empreinte_scelle = '0'.repeat(64);
  return j;
}

test('Clé du cache (M.cleCalcul) : calculer ne lit dans le journal que ce que la clé contient, et brouiller le reste ne change rien', { skip: DISPONIBLE ? false : 'fichier scellé final absent' }, () => {
  const scelle = JSON.parse(N.utf8Decoder(new Uint8Array(fs.readFileSync(FICHIER))));
  const cal = C.lire(scelle);
  const arrivee = M.histoire(scelle, cal);
  const liste = journauxTemoins();
  assert.ok(liste.length >= 22, 'journaux témoins : ' + liste.length);
  let cas = 0;
  const horsCle = new Set();
  liste.forEach(({ id, journal }) => {
    const K = Math.max(...Object.keys(journal.jours).map(Number));
    const versions = [journal];
    for (let k = cal.premier; k < K; k++) { versions.push(coupe(journal, k)); }
    versions.forEach((j) => {
      const lus = [];
      const R = N.jsonCanonique(M.calculer(scelle, cal, arrivee, espion(j, lus)));
      lus.forEach((ch) => { if (!dansLaCle(ch)) { horsCle.add(id + ' : ' + ch.join('/')); } });
      const b = brouiller(j);
      assert.equal(M.cleCalcul(b), M.cleCalcul(j), id + ' : clé changée par ce qui n\'en fait pas partie');
      assert.equal(N.jsonCanonique(M.calculer(scelle, cal, arrivee, b)), R, id + ' : résultats changés par ce qui n\'est pas dans la clé');
      cas++;
    });
  });
  assert.deepEqual([...horsCle].slice(0, 10), [], 'lectures hors de la clé');
  assert.ok(cas > liste.length, 'cas : ' + cas);
});

test('Clé du cache : un changement de ce que lit le moteur change la clé', () => {
  const base = { format: 'elenchos-essai-journal', version: 4, sauts: [],
    jours: { 1: { attente: null, coups: { reponse: null }, etapes: { entree: false, deviner: false }, ouverture: null, versions: null } } };
  const k0 = M.cleCalcul(base);
  const autre = (f) => { const j = JSON.parse(JSON.stringify(base)); f(j); return M.cleCalcul(j); };
  assert.notEqual(autre((j) => { j.jours[1].coups.reponse = { niveau: 1, raison: null }; }), k0);
  assert.notEqual(autre((j) => { j.jours[1].etapes.entree = true; }), k0);
  assert.notEqual(autre((j) => { j.jours[1].etapes = null; }), k0);
  assert.notEqual(autre((j) => { j.jours[1].ouverture = '2026-10-10T18:00'; }), k0);
  assert.notEqual(autre((j) => { j.jours[2] = j.jours[1]; }), k0);
  assert.notEqual(autre((j) => { j.sauts.push({ coups: {}, depart: 1, numero: 1, textes_atteints: 0 }); }), k0);
  assert.equal(autre((j) => { j.jours[1].versions = [1]; j.jours[1].etapes.deviner = true; }), k0);
});
