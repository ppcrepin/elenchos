/* Trace de l'histoire (schéma, partie 4.2) écrite par la page (auteur P), sous
 * forme canonique, sans fin de ligne, pour la comparer octet pour octet à
 * celles du contrôle (C) et du scellement (S) (§9 ; partie 5.3).
 *
 *   node tests/trace-histoire.js FICHIER_SCELLE SORTIE
 *
 * Au lot 6, le harnais l'obtiendra de la version témoin elle-même
 * (window.ElenchosEssai.histoire(collecteur), puis ElenchosTrace.histoire) ;
 * ce script fait le même calcul dans Node, avec les mêmes fichiers. */
'use strict';
const fs = require('node:fs');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');
const TR = require('../trace.js');

const [, , entree, sortie] = process.argv;
if (!entree || !sortie) { console.error('usage : node tests/trace-histoire.js FICHIER_SCELLE SORTIE'); process.exit(2); }
const t0 = process.hrtime.bigint();
const trace = TR.tracerHistoire(N, C, M, new Uint8Array(fs.readFileSync(entree)));
const texte = N.jsonCanonique(trace);
fs.writeFileSync(sortie, Buffer.from(N.utf8Encoder(texte)));
console.log('trace de l\'histoire écrite :', sortie, (texte.length / 1024).toFixed(0) + ' Ko', 'SHA-256', N.sha256(N.utf8Encoder(texte)),
  'en', Number(process.hrtime.bigint() - t0) / 1e6, 'ms');
