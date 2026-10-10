/* Carnet et copie du jour 7 de la partie témoin (a) contre les carnets de référence (B) et (C)
 * (references/carnets-et-cas-chiffres.md, Game design). Durées, dates, heures et version masquées ;
 * {T1}…{T6}, {x1}/{y1}, {x2}/{y2}, {n} lus dans la trace. Liste chaque écart de ligne.
 *   node temoins/comparer-reference.js REFERENCES.md DOSSIER_A_INTERFACE */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const [, , fRef, d] = process.argv;
const md = fs.readFileSync(fRef, 'utf8');
const partie = (t) => { const i = md.indexOf('## (' + t + ')'); const j = md.indexOf('\n## (', i + 5); return md.slice(i, j < 0 ? undefined : j); };
const bloc = (s) => s.slice(s.indexOf('```\n') + 4, s.indexOf('\n```', s.indexOf('```\n') + 4));
const B = bloc(partie('B')), Cc = bloc(partie('C'));
const trace = JSON.parse(fs.readFileSync(path.join(d, 'trace-P.json'), 'utf8'));
const membres = ['Agathe', 'Nassim', 'Odile', 'Valentin', 'porteur'];
const tit = (l) => (l && l.length ? N.listeEt(l.slice().sort((a, b) => membres.indexOf(a) - membres.indexOf(b)).map(m => m === 'porteur' ? 'vous' : m)) : 'pas attribué');
const dims = Object.values(trace.jours).filter(j => j.dimanche).map(j => j.dimanche);
const v = {
  T1: tit(dims[0].sans_faute), T2: tit(dims[0].devin.titulaire ? [dims[0].devin.titulaire] : []), T3: tit(dims[0].mystere.titulaire ? [dims[0].mystere.titulaire] : []),
  T4: tit(dims[1].sans_faute), T5: tit(dims[1].devin.titulaire ? [dims[1].devin.titulaire] : []), T6: tit(dims[1].mystere.titulaire ? [dims[1].mystere.titulaire] : []),
  x1: trace.agregats.justesse_personnages_entre_eux.justes, y1: trace.agregats.justesse_personnages_entre_eux.total,
  x2: trace.agregats.justesse_personnages_sur_porteur.justes, y2: trace.agregats.justesse_personnages_sur_porteur.total, n: trace.agregats.titres_tires_au_sort
};
const remplir = (s) => s.replace(/\{(T[1-6]|x[12]|y[12]|n)\}/g, (m, k) => String(v[k]));
const masquer = (s) => s.replace(/Ouverture : [^,]+, entre \d+h00 et \d+h59\./g, 'Ouverture : {date}, entre {h}h00 et {h}h59.')
  .replace(/Version de la page : [0-9, puis]+\./g, 'Version de la page : {version}.').replace(/\d+ min \d\d s/g, '{D}');
const enTete = B.split('\n\nJour 1 · lundi')[0];
const blocsB = 'Jour 1 · lundi' + B.split('\n\nJour 1 · lundi')[1];
const attenduFinal = remplir(enTete.replace('Essai en cours : carnet copié au jour 7.', 'Essai mené jusqu’à la clôture.') + '\n\n' + blocsB + '\n\n' + Cc);
// Copie du jour 7 : (B), puis le bloc « Jour 7 », « Semaine 1 » et « Sur tout l'essai » de (C), sans « Questions de fin ».
const jour7 = Cc.slice(0, Cc.indexOf('\n\nJour 8 · lundi'));
const surTout = Cc.slice(Cc.indexOf('Sur tout l’essai'), Cc.indexOf('\n\nQuestions de fin'));
// Les chiffres « Sur tout l'essai » d'une copie sont ceux du jour de la copie : la référence les laisse à lire ;
// ils sont comparés au programme de contrôle (controle.py carnets), ici seulement leur forme.
const attenduCopie = remplir(B + '\n\n' + jour7.replace(/\{(T[1-6])\}/g, (m, k) => String(v[k])) + '\n\n' + surTout.replace(/\{(x[12]|y[12]|n)\}/g, '\u0001') + '\n\nFin du carnet');
const egal = (a, b) => (a.indexOf('\u0001') < 0 ? a === b : new RegExp('^' + a.split('\u0001').map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[0-9]+') + '$').test(b));
function comparer(nom, attendu, page) {
  const a = attendu.split('\n'), p = masquer(page).split('\n');
  const n = Math.max(a.length, p.length);
  let ecarts = 0;
  // Alignement simple : diff ligne à ligne par plus longue sous-suite commune.
  const L = Array.from({ length: a.length + 1 }, () => new Array(p.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) { for (let j = p.length - 1; j >= 0; j--) { L[i][j] = egal(a[i], p[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]); } }
  let i = 0, j = 0; const sortie = [];
  while (i < a.length || j < p.length) {
    if (i < a.length && j < p.length && egal(a[i], p[j])) { i++; j++; continue; }
    if (j < p.length && (i === a.length || L[i][j + 1] >= L[i + 1][j])) { sortie.push('  + page, ligne ' + (j + 1) + ' : ' + p[j]); j++; ecarts++; }
    else { sortie.push('  − référence, ligne ' + (i + 1) + ' : ' + a[i]); i++; ecarts++; }
  }
  console.log(nom + ' : ' + (ecarts ? ecarts + ' ligne(s) en écart' : 'identique à la référence (masques appliqués)'));
  sortie.forEach(x => console.log(x));
  return n;
}
comparer('Carnet final (C)', attenduFinal, fs.readFileSync(path.join(d, 'carnet-P.txt'), 'utf8'));
comparer('Copie du jour 7 (B)', attenduCopie, fs.readFileSync(path.join(d, 'copie-1-P.txt'), 'utf8'));
