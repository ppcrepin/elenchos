/* Première mesure de performance de l'histoire (lot 2 ; §8.8, budgets ; §9,
 * contrôle 14 j, qui fera la mesure complète au lot 7).
 *
 *   node tests/mesure-histoire.js [FICHIER_SCELLE] [RALENTI]
 *
 * Dans Chromium sans tête (playwright-core de l'environnement, chemin réglable
 * par ELENCHOS_PLAYWRIGHT), processeur ralenti RALENTI fois (4 par défaut,
 * Emulation.setCPUThrottlingRate) : page minimale faite des mêmes sources que
 * la page (noyau, calendrier, moteur), fichier embarqué en base64. On mesure,
 * dans une même tâche : décodage base64, empreinte, lecture du JSON, table du
 * calendrier, histoire(), résumé canonique et son SHA-256 (V6). Premier
 * calcul après chargement (froid), puis dix de plus (chaud). Rien n'est publié. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');

const ICI = path.join(__dirname, '..');
const scelleChemin = process.argv[2] || path.join(__dirname, 'scelle-test.json');
const ralenti = Number(process.argv[3] || 4);
const pw = require(process.env.ELENCHOS_PLAYWRIGHT || '/opt/node-tools/node_modules/playwright-core');

function sansNode(s) { return s.replace(/\/\*node-debut\*\/[\s\S]*?\/\*node-fin\*\//g, ''); }
const sources = ['noyau.js', 'calendrier.js', 'moteur.js'].map(n => sansNode(fs.readFileSync(path.join(ICI, n), 'utf8'))).join('\n');
const b64 = N.base64Encoder(new Uint8Array(fs.readFileSync(scelleChemin)));
const page = '<!doctype html><meta charset="utf-8"><title>mesure</title><script>var SCELLE_B64 = "' + b64 + '";\n' + sources + '\n' +
  'function chargerHistoire() {' +
  '  var N = ElenchosNoyau, t0 = performance.now();' +
  '  var octets = N.base64Decoder(SCELLE_B64); var empreinte = N.sha256(octets);' +
  '  var scelle = JSON.parse(N.utf8Decoder(octets)); var cal = ElenchosCalendrier.lire(scelle);' +
  '  var t1 = performance.now();' +
  '  var arr = ElenchosMoteur.histoire(scelle, cal);' +
  '  var t2 = performance.now();' +
  '  var sha = N.sha256(N.utf8Encoder(N.jsonCanonique(ElenchosMoteur.resume(arr))));' +
  '  var t3 = performance.now();' +
  '  return { avant: t1 - t0, histoire: t2 - t1, v6: t3 - t2, total: t3 - t0, ok: sha === scelle.histoire.resume_sha256 };' +
  '}</script>';

(async () => {
  const navigateur = await pw.chromium.launch({ executablePath: process.env.ELENCHOS_CHROMIUM || undefined });
  const ctx = await navigateur.newContext();
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: ralenti });
  await p.setContent(page);
  const froid = await p.evaluate(() => chargerHistoire());
  const chauds = [];
  for (let i = 0; i < 10; i++) { chauds.push(await p.evaluate(() => chargerHistoire())); }
  const version = navigateur.version();
  await navigateur.close();
  const r = x => x.toFixed(0) + ' ms';
  const med = k => { const v = chauds.map(c => c[k]).sort((a, b) => a - b); return (v[4] + v[5]) / 2; };
  console.log('Chromium ' + version + ', processeur ralenti ' + ralenti + ' fois ; fichier ' + path.basename(scelleChemin));
  console.log('froid : décodage+empreinte+JSON+calendrier ' + r(froid.avant) + ' ; histoire() ' + r(froid.histoire) + ' ; résumé+SHA-256 ' + r(froid.v6) + ' ; total ' + r(froid.total) + ' ; V6 ' + (froid.ok ? 'passe' : 'ÉCHOUE'));
  console.log('chaud (médiane de 10) : histoire() ' + r(med('histoire')) + ' ; total ' + r(med('total')) + ' ; max total ' + r(Math.max(...chauds.map(c => c.total))));
  console.log('budget du §8.8 (calcul de l\'histoire au chargement) : 1000 ms → ' + (froid.total <= 1000 ? 'tenu' : 'DÉPASSÉ'));
})().catch(e => { console.error(e); process.exit(1); });
