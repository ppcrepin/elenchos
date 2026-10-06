/* Rejoue un journal par le moteur de la page (Node 22), sans navigateur.
 *
 *   node rejouer.js --scelle FICHIER_SCELLE.json --journal JOURNAL.json
 *        [--durees DUREES.json] --sortie DOSSIER
 *
 * Écrit dans DOSSIER : trace.json (forme canonique, partie 1.1), et en mode
 * interface carnet.txt et copie-{i}.txt (textes exacts du §8.12).
 * Le fichier scellé est lu en octets : empreinte calculée sur ces octets,
 * décodage UTF-8 strict, JSON relu en forme canonique (comme V3 et V4).
 * Outillage d'essai : sert à produire les sorties de la page pour les
 * journaux des carnets de référence et du harnais (§9).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('./noyau.js');
const M = require('./moteur.js');
const TR = require('./trace.js');

function arguments_() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) { a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1]; }
  for (const c of ['scelle', 'journal', 'sortie']) { if (!a[c]) { throw new Error('argument manquant : --' + c); } }
  return a;
}

function lireJson(chemin) {
  const texte = N.utf8Decoder(new Uint8Array(fs.readFileSync(chemin)));
  return JSON.parse(texte);
}

function main() {
  const a = arguments_();
  const octets = new Uint8Array(fs.readFileSync(a.scelle));
  const empreinte = N.sha256(octets);
  const texte = N.utf8Decoder(octets);
  const scelle = JSON.parse(texte);
  if (N.jsonCanonique(scelle) !== texte) { throw new Error('fichier scellé : pas en forme canonique'); }
  const journal = lireJson(a.journal);
  if (journal.format !== 'elenchos-essai-journal' || journal.version !== 3) { throw new Error('journal : format ou version inattendus'); }
  if (journal.empreinte_scelle !== empreinte) { throw new Error('journal : empreinte du fichier scellé différente (' + journal.empreinte_scelle + ')'); }
  const durees = a.durees ? lireJson(a.durees) : null;
  const tr = TR.tracer(N, M, scelle, journal, durees, empreinte);
  fs.mkdirSync(a.sortie, { recursive: true });
  fs.writeFileSync(path.join(a.sortie, 'trace.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(tr))));
  if (tr.carnet) { fs.writeFileSync(path.join(a.sortie, 'carnet.txt'), Buffer.from(N.utf8Encoder(tr.carnet.texte))); }
  tr.copies.forEach((c, i) => fs.writeFileSync(path.join(a.sortie, 'copie-' + (i + 1) + '.txt'), Buffer.from(N.utf8Encoder(c.texte))));
  process.stdout.write('trace : ' + N.sha256(N.utf8Encoder(N.jsonCanonique(tr))) + '\n');
}

main();
