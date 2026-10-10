/* Trace de partie, version 4 (schéma, partie 4.3), écrite par la page (P) dans
 * Node, à partir d'un fichier scellé et d'un journal v4 : pour la comparer à
 * celle du programme de contrôle (C) avant que le harnais du lot 6 la lise
 * dans la version témoin. Mode `moteur` : durées, carnet et copies nuls ou
 * vides ; en mode `interface`, passer le fichier des durées v2.
 *
 *   node tests/trace-partie.js FICHIER_SCELLE JOURNAL SORTIE [DUREES]
 *   node tests/trace-partie.js FICHIER_SCELLE --temoin SORTIE_JOURNAL SORTIE   (partie complète du joueur scripté, mode moteur)
 */
'use strict';
const fs = require('node:fs');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');
const E = require('../etat.js');
const Jn = require('../journal.js');
const TR = require('../trace.js');
const PT = require('./partie-test.js');

const [, , fScelle, fJournal, a3, a4] = process.argv;
if (!fScelle || !fJournal || !a3) { console.error('usage : voir l\'en-tête'); process.exit(2); }
const octets = new Uint8Array(fs.readFileSync(fScelle));
const scelle = JSON.parse(N.utf8Decoder(octets));
const cal = C.lire(scelle);
const empreinte = N.sha256(octets);
const arrivee = M.histoire(scelle, cal);
const resumeSha = N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee))));
const cartes = M.cartesServies(scelle, cal, arrivee);
let journal, sortie, durees = null;
if (fJournal === '--temoin') {
  journal = E.journal(PT.jouer(scelle, cal, { cartes }), cal, empreinte, { graine: null, id: 'a', mode: 'moteur' });
  Object.values(journal.jours).forEach(d => { d.versions = null; d.etapes = null; });
  fs.writeFileSync(a3, Buffer.from(N.utf8Encoder(N.jsonCanonique(journal))));
  sortie = a4;
} else {
  journal = JSON.parse(fs.readFileSync(fJournal, 'utf8'));
  sortie = a3;
  if (a4) { durees = JSON.parse(fs.readFileSync(a4, 'utf8')); }
}
const ecarts = Jn.valider(scelle, cal, journal, { empreinte, cartes });
if (ecarts.length) { console.error('journal refusé :\n' + ecarts.join('\n')); process.exit(1); }
const trace = TR.partie(journal, M.calculer(scelle, cal, arrivee, journal), durees, null, [], empreinte, resumeSha);
const texte = N.jsonCanonique(trace);
fs.writeFileSync(sortie, Buffer.from(N.utf8Encoder(texte)));
console.log('trace de partie écrite :', sortie, (texte.length / 1024).toFixed(0) + ' Ko', 'SHA-256', N.sha256(N.utf8Encoder(texte)));
