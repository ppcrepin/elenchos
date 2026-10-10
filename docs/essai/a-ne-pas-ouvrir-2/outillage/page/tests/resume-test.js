/* Résumé de l'histoire (schéma, partie 3) calculé par la page, pour le fichier
 * scellé DE TEST seulement (lot 2). Écrit le résumé canonique, sans fin de
 * ligne, comme le `resume-histoire.json` du scellement.
 *
 *   node tests/resume-test.js FICHIER_SCELLE SORTIE
 *
 * Circulaire par construction : il ne prouve rien de la concordance avec le
 * contrôle et le scellement (voir tests/scelle-test.py). */
'use strict';
const fs = require('node:fs');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');

const [, , entree, sortie] = process.argv;
if (!entree || !sortie) { console.error('usage : node tests/resume-test.js FICHIER_SCELLE SORTIE'); process.exit(2); }
const scelle = JSON.parse(N.utf8Decoder(new Uint8Array(fs.readFileSync(entree))));
const texte = N.jsonCanonique(M.resume(M.histoire(scelle, C.lire(scelle))));
fs.writeFileSync(sortie, Buffer.from(N.utf8Encoder(texte)));
console.log('résumé écrit :', sortie, 'SHA-256', N.sha256(N.utf8Encoder(texte)));
