/* Outils communs du harnais (§9 ; schema.md, parties 3.1, 3.12, 4.2, 4.3).
 *
 * Lecture et écriture des fichiers en UTF-8 strict, forme canonique (partie
 * 1.1), masque des durées (partie 4.2 ; §8.12), comparaison chemin par
 * chemin (JSON Pointer, RFC 6901), empreintes. Outillage d'essai : n'entre
 * pas dans la page.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const N = require('../noyau.js');

function lireTexte(chemin) { return N.utf8Decoder(new Uint8Array(fs.readFileSync(chemin))); }
function lireJson(chemin) { return JSON.parse(lireTexte(chemin)); }
function ecrireTexte(chemin, texte) {
  fs.mkdirSync(path.dirname(chemin), { recursive: true });
  fs.writeFileSync(chemin, Buffer.from(N.utf8Encoder(texte)));
}
function ecrireJson(chemin, v) { ecrireTexte(chemin, N.jsonCanonique(v)); }
function canonique(v) { return N.jsonCanonique(v); }
function sha256Octets(octets) { return crypto.createHash('sha256').update(octets).digest('hex'); }
function sha256Texte(t) { return sha256Octets(Buffer.from(t, 'utf8')); }
function sha256Fichier(chemin) { return sha256Octets(fs.readFileSync(chemin)); }

/** Durées du carnet (expression régulière du §8.12) remplacées par « ‹durée› » (partie 4.3). */
function masquerCarnet(t) { return t.replace(/\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b/g, '‹durée›'); }

/** Trace aux durées masquées (partie 4.2, point 3) : entier sous une clé « duree_… » → 0. */
function masquerTrace(v) {
  if (Array.isArray(v)) { return v.map(masquerTrace); }
  if (v !== null && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) {
      o[k] = (k.indexOf('duree_') === 0 && Number.isInteger(v[k])) ? 0 : masquerTrace(v[k]);
    }
    return o;
  }
  return v;
}

function pointeur(chemin) { return chemin.map(x => '/' + String(x).replace(/~/g, '~0').replace(/\//g, '~1')).join(''); }

/** Différences entre deux valeurs JSON, chacune avec son chemin et les deux valeurs (partie 4.2, point 5). */
function differences(a, b, chemin, sortie) {
  chemin = chemin || []; sortie = sortie || [];
  const ta = Array.isArray(a) ? 'tableau' : (a === null ? 'null' : typeof a);
  const tb = Array.isArray(b) ? 'tableau' : (b === null ? 'null' : typeof b);
  if (ta !== tb) { sortie.push({ chemin: pointeur(chemin), a, b }); return sortie; }
  if (ta === 'tableau') {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (i >= a.length || i >= b.length) { sortie.push({ chemin: pointeur(chemin.concat([i])), a: a[i], b: b[i] }); }
      else { differences(a[i], b[i], chemin.concat([i]), sortie); }
    }
    return sortie;
  }
  if (ta === 'object') {
    const cles = Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).sort();
    for (const k of cles) {
      if (!(k in a) || !(k in b)) { sortie.push({ chemin: pointeur(chemin.concat([k])), a: a[k], b: b[k] }); }
      else { differences(a[k], b[k], chemin.concat([k]), sortie); }
    }
    return sortie;
  }
  if (a !== b) { sortie.push({ chemin: pointeur(chemin), a, b }); }
  return sortie;
}

/** Comparaison de deux traces (partie 4.2) : masque, forme canonique, octets ; liste des écarts. */
function comparerTraces(ta, tb) {
  const ma = masquerTrace(ta), mb = masquerTrace(tb);
  const egales = canonique(ma) === canonique(mb);
  return { egales, ecarts: egales ? [] : differences(ma, mb) };
}

/** Lignes différentes de deux textes (pour les carnets). */
function ecartsLignes(a, b) {
  const la = a.split('\n'), lb = b.split('\n'), e = [];
  const n = Math.max(la.length, lb.length);
  for (let i = 0; i < n; i++) { if (la[i] !== lb[i]) { e.push({ ligne: i + 1, a: la[i], b: lb[i] }); } }
  return e;
}

/** Arguments « --clé valeur » ; « --drapeau » seul vaut true. */
function argumentsCli(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!/^--/.test(argv[i])) { throw new Error('argument inattendu : ' + argv[i]); }
    const k = argv[i].slice(2);
    if (i + 1 < argv.length && !/^--/.test(argv[i + 1])) { a[k] = argv[i + 1]; i++; } else { a[k] = true; }
  }
  return a;
}

module.exports = { lireTexte, lireJson, ecrireTexte, ecrireJson, canonique, sha256Octets, sha256Texte, sha256Fichier,
  masquerCarnet, masquerTrace, differences, comparerTraces, ecartsLignes, pointeur, argumentsCli };
