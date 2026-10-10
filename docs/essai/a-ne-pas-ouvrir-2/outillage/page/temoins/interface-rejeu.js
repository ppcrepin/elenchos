/* Lot 7 (contrôles 6 à 9, 12 et 13) : prépare au rejeu par C les parties jouées par l'interface
 * (temoins/interface/<id>/, écrites par tests/lot7/parties.js de B), sans toucher à leurs fichiers.
 *
 *   node temoins/interface-rejeu.js FICHIER_SCELLE DOSSIER_PARTIES SORTIE
 *
 * Pour chaque partie : SORTIE/<id>/ journal.json et durees.json (copiés tels quels), trace-P.json (trace v4
 * de la page : moteur de la page dans Node sur ce journal, durées du fichier des durées, carnet et copies tels
 * que la page les a rendus : carnet.txt et copies.json de B), carnet-P.txt et copie-<n>-P.txt (textes de la
 * page, pour `controle.py carnets`). Le journal est d'abord validé (règles 1 à 15). Ensuite :
 *   sh temoins/comparer.sh FICHIER_SCELLE SORTIE
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');
const Jn = require('../journal.js');
const TR = require('../trace.js');

const [, , fScelle, dParties, dSortie] = process.argv;
if (!fScelle || !dParties || !dSortie) { console.error('usage : voir l\'en-tête'); process.exit(2); }
const octets = new Uint8Array(fs.readFileSync(fScelle));
const scelle = JSON.parse(N.utf8Decoder(octets));
const cal = C.lire(scelle);
const empreinte = N.sha256(octets);
const arrivee = M.histoire(scelle, cal);
const resumeSha = N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee))));
const cartes = M.cartesServies(scelle, cal, arrivee);
const lire = (f) => fs.readFileSync(f, 'utf8');

let refus = 0;
for (const id of fs.readdirSync(dParties).sort()) {
  const src = path.join(dParties, id);
  if (!fs.existsSync(path.join(src, 'journal.json'))) { continue; }
  const dst = path.join(dSortie, id);
  fs.mkdirSync(dst, { recursive: true });
  const journal = JSON.parse(lire(path.join(src, 'journal.json')));
  const durees = JSON.parse(lire(path.join(src, 'durees.json')));
  const ecarts = Jn.valider(scelle, cal, journal, { empreinte, cartes });
  if (ecarts.length) { console.log(id + ' : journal refusé : ' + ecarts.join(' ; ')); refus++; continue; }
  const carnet = fs.existsSync(path.join(src, 'carnet.txt')) ? lire(path.join(src, 'carnet.txt')) : null;
  const copies = JSON.parse(lire(path.join(src, 'copies.json')));
  fs.copyFileSync(path.join(src, 'journal.json'), path.join(dst, 'journal.json'));
  fs.copyFileSync(path.join(src, 'durees.json'), path.join(dst, 'durees.json'));
  const trace = TR.partie(journal, M.calculer(scelle, cal, arrivee, journal), durees, carnet, copies, empreinte, resumeSha);
  fs.writeFileSync(path.join(dst, 'trace-P.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(trace))));
  if (carnet !== null) { fs.writeFileSync(path.join(dst, 'carnet-P.txt'), carnet); }
  copies.forEach((c, i) => { fs.writeFileSync(path.join(dst, 'copie-' + (i + 1) + '-P.txt'), c.texte); });
  console.log(id + ' : prêt (' + copies.length + ' copie(s)' + (carnet === null ? ', sans carnet' : '') + ')');
}
process.exitCode = refus ? 1 : 0;
