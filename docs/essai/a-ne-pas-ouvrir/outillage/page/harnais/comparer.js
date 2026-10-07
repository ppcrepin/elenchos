/* Comparaison de la page (P) au programme de contrôle (C), partie par partie
 * (§9 ; schema.md, parties 4.2 et 4.3 ; contrôles 6 à 10 et 13).
 *
 *   node harnais/comparer.js --page DOSSIER_P --controle DOSSIER_C --sortie RAPPORT.txt
 *        [--motif-trace '{id}.trace.json'] [--motif-carnet '{id}.carnet.txt'] [--motif-copie '{id}.copie-{n}.txt']
 *        [--masquer-carnets] [--sans-traces] [--parties a,b,c] [--exiger]
 *
 * Contrôle 13 (carnet et copies de la version du porteur, comparés aux textes du programme de contrôle, durées
 * masquées), avec les noms de fichiers du programme de contrôle :
 *   node harnais/comparer.js --page SORTIE/page --controle DOSSIER_C/textes --sans-traces --exiger --parties a,b,c
 *        --motif-carnet '{id}/carnet-durees-masquees.txt' --motif-copie '{id}/copie-{n-1}-durees-masquees.txt'
 *        --sortie SORTIE/rapport-controle13-carnets.txt
 * Dans les motifs : {id} la partie, {n} le numéro de la copie chez P (1, 2…), {n-1} ce numéro moins un.
 * --exiger : un carnet ou une copie de P sans pendant chez C compte comme une différence (sinon il est ignoré).
 *
 * Pour chaque trace de P ({id}.trace.json) qui a sa trace chez C (même nom,
 * ou le motif donné) : durées masquées (valeur entière sous une clé
 * « duree_… » → 0), forme canonique, comparaison octet pour octet ; sinon,
 * chaque différence avec son chemin (JSON Pointer) et les deux valeurs.
 * Pour chaque carnet et chaque copie de P qui ont leur pendant chez C :
 * durées remplacées par « ‹durée› », comparaison octet pour octet ; sinon,
 * les lignes différentes.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const O = require('./outils.js');

function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const mT = a['motif-trace'] || '{id}.trace.json', mC = a['motif-carnet'] || '{id}.carnet.txt', mK = a['motif-copie'] || '{id}.copie-{n}.txt';
  const parties = a.parties ? new Set(String(a.parties).split(',')) : null;
  const retenue = id => !parties || parties.has(id);
  const lignes = [];
  let ecarts = 0, comparees = 0, absentes = [];
  for (const f of a['sans-traces'] ? [] : fs.readdirSync(a.page).filter(x => /\.trace\.json$/.test(x)).sort()) {
    const id = f.replace(/\.trace\.json$/, '');
    if (!retenue(id)) { continue; }
    const fc = path.join(a.controle, mT.replace('{id}', id));
    if (!fs.existsSync(fc)) { absentes.push(id); continue; }
    comparees++;
    // --masquer-carnets : durées masquées aussi dans les textes du carnet et des copies (deux rejeux de la page entre eux)
    const lire = x => a['masquer-carnets'] ? O.masquerTraceEtCarnets(O.lireJson(x)) : O.lireJson(x);
    const c = O.comparerTraces(lire(path.join(a.page, f)), lire(fc));
    if (c.egales) { lignes.push('identiques : ' + id); continue; }
    ecarts++;
    lignes.push('DIFFÉRENTES : ' + id + ' (' + c.ecarts.length + ' différence(s))');
    c.ecarts.slice(0, 50).forEach(e => lignes.push('  ' + e.chemin + ' : P ' + JSON.stringify(e.a) + ' ; C ' + JSON.stringify(e.b)));
  }
  const vus = new Set();
  for (const f of fs.readdirSync(a.page).filter(x => /\.(carnet|copie-[0-9]+)\.txt$/.test(x)).sort()) {
    const id = f.replace(/\.(carnet|copie-[0-9]+)\.txt$/, '');
    if (!retenue(id)) { continue; }
    vus.add(id);
    const copie = f.match(/\.copie-([0-9]+)\.txt$/);
    const nomC = copie ? mK.split('{id}').join(id).split('{n-1}').join(String(+copie[1] - 1)).split('{n}').join(copie[1]) : mC.split('{id}').join(id);
    const fc = path.join(a.controle, nomC);
    if (!fs.existsSync(fc)) {
      if (a.exiger) { comparees++; ecarts++; lignes.push('SANS PENDANT CHEZ C : ' + f + ' (' + nomC + ')'); }
      continue;
    }
    comparees++;
    const p = O.masquerCarnet(O.lireTexte(path.join(a.page, f))), c = O.masquerCarnet(O.lireTexte(fc));
    if (p === c) { lignes.push('identiques : ' + f); continue; }
    ecarts++;
    lignes.push('DIFFÉRENTS : ' + f);
    O.ecartsLignes(p, c).slice(0, 30).forEach(e => lignes.push('  ligne ' + e.ligne + ' : P « ' + e.a + ' » ; C « ' + e.b + ' »'));
  }
  if (parties && a.exiger) { for (const id of parties) { if (!vus.has(id)) { ecarts++; lignes.push('SANS CARNET CHEZ P : partie ' + id); } } }
  lignes.unshift('Comparaison P / C : ' + comparees + ' fichier(s) comparé(s), ' + ecarts + ' différent(s)' + (absentes.length ? ' ; sans trace de C : ' + absentes.join(', ') : ''), '');
  const texte = lignes.join('\n') + '\n';
  if (a.sortie) { O.ecrireTexte(a.sortie, texte); }
  process.stdout.write(texte.split('\n').slice(0, 3).join('\n') + '\n');
  process.exitCode = ecarts ? 1 : 0;
}

main();
