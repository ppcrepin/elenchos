/* Gabarit du carnet (§8.12), lu dans simulation.md, et découpage du carnet
 * en blocs (contrôle 12). Sert aux tests (tests/test-moteur.js) et au
 * harnais (controle12.js).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const O = require('./outils.js');

/** Convertit une ligne du gabarit en expression régulière : {…} est une
 *  valeur (ou des choix « A | B », eux-mêmes convertis), […] est facultatif,
 *  « … » vaut n'importe quel texte. Dans un choix, x, y, n et « bouton »
 *  sont des valeurs. */
function versRe(s) {
  const echapper = c => c.replace(/[.*+?^$()|\\[\]{}]/g, '\\$&');
  let r = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '{' || c === '[') {
      const ferme = c === '{' ? '}' : ']';
      let prof = 0, j = i;
      for (; j < s.length; j++) { if (s[j] === c) { prof++; } else if (s[j] === ferme && --prof === 0) { break; } }
      const dedans = s.slice(i + 1, j);
      if (c === '[') { r += '(?:' + versRe(dedans) + ')?'; }
      else {
        const choix = []; let p = 0, d = 0;
        for (let x = 0; x < dedans.length; x++) {
          if (dedans[x] === '{' || dedans[x] === '[') { p++; } else if (dedans[x] === '}' || dedans[x] === ']') { p--; }
          else if (p === 0 && dedans.slice(x, x + 3) === ' | ') { choix.push(dedans.slice(d, x)); d = x + 3; x += 2; }
        }
        choix.push(dedans.slice(d));
        r += choix.length === 1 ? '.+?' : '(?:' + choix.map(a => /^(x fois sur y|n|bouton)$/.test(a) ? (a === 'x fois sur y' ? '[0-9]+ fois sur [0-9]+' : '.+?') : versRe(a)).join('|') + ')';
      }
      i = j;
    } else if (c === '…') { r += '.+?'; }
    else { r += echapper(c); }
  }
  return r;
}

/** Lignes du gabarit du §8.12, avec les lectures écrites dans le texte du §8.12. */
function gabaritCarnet(cheminSimulation) {
  const sim = fs.readFileSync(cheminSimulation || path.join(__dirname, '..', '..', '..', '..', 'simulation.md'), 'utf8');
  const debut = sim.indexOf('**Gabarit**');
  const ouvre = sim.indexOf('```\n', debut) + 4;
  const bloc = sim.slice(ouvre, sim.indexOf('\n```', ouvre));
  const lignes = bloc.split('\n').filter(l => l !== '');
  // §8.12 : sans F1 sautée, « Où vous placez chacun : » (deux-points final, sans point)
  lignes.push('Où vous placez chacun :');
  // §8.12 : un verdict par carte de la manche (manches de 1 ou 2 cartes), ou « aucune carte » (5.12)
  lignes.push('[Révélation : {verdict}.[ Raison cachée : {tentée | pas tentée}.]]');
  lignes.push('[Révélation : {verdict}, {verdict}.[ Raison cachée : {tentée | pas tentée}.]]');
  lignes.push('Révélation : aucune carte.');
  return lignes.map(l => ({ ligne: l, re: new RegExp('^' + versRe(l) + '$') }));
}

/** Lignes d'un carnet hors du gabarit. */
function lignesHorsGabarit(texte, g) {
  return texte.split('\n').filter(l => l !== '' && !g.some(x => x.re.test(l)));
}

/** Blocs du carnet séparés par une ligne vide, durées masquées, rangés par sorte. */
function blocs(texte) {
  const r = { tete: null, seances: [], titres: [], surTout: null, questions: null, fin: null, autres: [] };
  texte.split('\n\n').map(O.masquerCarnet).forEach((b, i) => {
    if (i === 0) { r.tete = b; }
    else if (/^(Entrée|Jour [0-9]+ sur 14|Clôture)\n/.test(b)) { r.seances.push(b); }
    else if (/^Titres de la semaine/.test(b)) { r.titres.push(b); }
    else if (/^Sur tout l’essai\n/.test(b)) { r.surTout = b; }
    else if (/^Questions de fin\n/.test(b)) { r.questions = b; }
    else if (b === 'Fin du carnet') { r.fin = b; }
    else { r.autres.push(b); }
  });
  return r;
}

module.exports = { versRe, gabaritCarnet, lignesHorsGabarit, blocs };
