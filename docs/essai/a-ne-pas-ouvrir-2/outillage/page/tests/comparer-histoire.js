/* Comparaison à trois de la trace de l'histoire (§9 ; schéma, partie 5.3) :
 * page (P), programme de contrôle (C), programme de scellement (S), deux à
 * deux, octet pour octet, sans aucun masquage. En cas d'écart, donne les
 * premiers chemins JSON Pointer qui diffèrent (jour, manche, révélation,
 * semaine…), pour savoir où regarder (partie 5.3, tableau).
 *
 *   node tests/comparer-histoire.js P=trace-p.json C=trace-c.json [S=trace-s.json] [--max 20]
 *
 * Code de sortie : 0 si tout est identique, 1 sinon. */
'use strict';
const fs = require('node:fs');

const args = process.argv.slice(2);
let max = 20;
const traces = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--max') { max = Number(args[++i]); continue; }
  const k = args[i].indexOf('=');
  traces.push({ nom: args[i].slice(0, k), octets: fs.readFileSync(args[i].slice(k + 1)) });
}
if (traces.length < 2) { console.error('usage : node tests/comparer-histoire.js P=… C=… [S=…]'); process.exit(2); }

const echap = s => String(s).replace(/~/g, '~0').replace(/\//g, '~1');
function differences(x, y, chemin, sortie) {
  if (sortie.length >= max) { return; }
  if (x === null || y === null || typeof x !== 'object' || typeof y !== 'object' || Array.isArray(x) !== Array.isArray(y)) {
    if (JSON.stringify(x) !== JSON.stringify(y)) { sortie.push(chemin + ' : ' + JSON.stringify(x) + ' ≠ ' + JSON.stringify(y)); }
    return;
  }
  const cles = Array.from(new Set(Object.keys(x).concat(Object.keys(y)))).sort((a, b) => (Buffer.from(a) < Buffer.from(b) ? -1 : 1));
  for (const k of cles) {
    if (!(k in x)) { sortie.push(chemin + '/' + echap(k) + ' : absent de la première'); continue; }
    if (!(k in y)) { sortie.push(chemin + '/' + echap(k) + ' : absent de la seconde'); continue; }
    differences(x[k], y[k], chemin + '/' + echap(k), sortie);
    if (sortie.length >= max) { return; }
  }
}

let ok = true;
for (let i = 0; i < traces.length; i++) {
  for (let j = i + 1; j < traces.length; j++) {
    const a = traces[i], b = traces[j];
    if (Buffer.compare(a.octets, b.octets) === 0) { console.log(a.nom + ' = ' + b.nom + ' : identiques, octet pour octet (' + a.octets.length + ' octets)'); continue; }
    ok = false;
    const d = [];
    differences(JSON.parse(a.octets.toString('utf8')), JSON.parse(b.octets.toString('utf8')), '', d);
    console.log(a.nom + ' ≠ ' + b.nom + (d.length ? ' ; premières différences :' : ' : mêmes valeurs, octets différents (forme canonique ?)'));
    d.forEach(l => console.log('  ' + l));
  }
}
process.exit(ok ? 0 : 1);
