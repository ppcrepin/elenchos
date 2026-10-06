/* Captures du contrôle 14 h pour la Direction artistique (§8.1 ; §8.8) :
 * chaque sorte d'écran de la partie (b), en clair et en sombre, en couleur
 * et en niveaux de gris (deux tests de la consigne visuelle), et, à pleine
 * résolution, les lignes où juger à l'œil l'espace fine avant « ? » et « ! »
 * (« Ça alors ! » en Alegreya gras, une question en Alegreya Sans gras, une
 * phrase en Alegreya Sans).
 *
 *   node harnais/captures.js --scelle F --journaux D/journaux --construction V1
 *        [--construction-2 V2 --construction-3 V3] --sortie DOSSIER [--appareil 'iPhone 15']
 *
 * Les niveaux de gris sont faits après coup par ImageMagick (convert), s'il
 * est présent ; rien n'est ajouté à la page.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const N = require('../noyau.js');
const O = require('./outils.js');
const NAV = require('./navigateur.js');
const { Joueur } = require('./joueur.js');

async function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const scelle = JSON.parse(N.utf8Decoder(new Uint8Array(fs.readFileSync(a.scelle))));
  const journal = O.lireJson(path.join(a.journaux, 'b.journal.json'));
  const gestes = O.lireJson(path.join(a.journaux, 'b.gestes.json'));
  const constructions = {};
  for (const c of ['construction', 'construction-2', 'construction-3']) { if (a[c]) { constructions[+O.lireTexte(path.join(a[c], 'version.txt')).trim()] = path.join(a[c], 'porteur', 'index.html'); } }
  const icone = a.icone || path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'apple-touch-icon.png');
  let gris = true;
  try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); } catch (e) { gris = false; }
  for (const sombre of [false, true]) {
    const d = path.join(a.sortie, sombre ? 'sombre' : 'clair');
    fs.mkdirSync(d, { recursive: true });
    const env = await NAV.ouvrir({ page: constructions[1], icone, sombre, appareil: a.appareil || 'iPhone 15', heure: N.lireInstant(journal.seances[0].ouverture) - 60000 });
    const vues = new Set();
    let n = 0;
    const jo = new Joueur(env, journal, constructions, { relever: false, gestes });
    const prendre = async (nom) => {
      const f = path.join(d, String(++n).padStart(3, '0') + '-' + nom.replace(/[^A-Za-z0-9À-ÿ.-]+/g, '-').slice(0, 50) + '.png');
      await env.page.screenshot({ path: f });
      if (gris) { execFileSync('convert', [f, '-colorspace', 'Gray', f.replace(/\.png$/, '-gris.png')]); }
    };
    const fine = async (sel, nom) => {
      const l = env.page.locator(sel).first();
      if (await l.count()) { await l.screenshot({ path: path.join(d, 'espace-fine-' + nom + '.png') }); }
    };
    jo.releverSiVoulu = async (geste) => {
      const v = await env.page.evaluate(() => {
        const e = window.ElenchosEssai && window.ElenchosEssai.etat();
        if (!e) { return null; }
        const s = e.seances[e.seances.length - 1];
        const note = document.querySelector('.bande .note');
        return { tel: e.vue.tel.ecran, cadre: e.vue.cadre ? e.vue.cadre.page : null, k: s.k, rev: e.vue.tel.ecran === 'revelation' ? s.rev.i : null,
          note: note ? note.textContent.slice(0, 20) : null, feuille: !!document.querySelector('.feuille') };
      });
      if (!v) { return; }
      const cle = [v.cadre || v.tel, v.cadre ? '' : (v.rev !== null ? 'r' + v.rev : ''), v.note || '', v.feuille ? 'feuille' : '', v.k === 7 || v.k === 14 ? 'dim' : ''].join('|');
      if (!vues.has(cle)) { vues.add(cle); await prendre('s' + v.k + '-' + (v.cadre || v.tel) + (v.rev !== null ? '-' + v.rev : '') + (v.note ? '-note' : '') + (v.feuille ? '-feuille' : '')); }
      if (v.tel === '1.6' && !v.cadre) { await fine('.telephone .big', 'ca-alors-alegreya-gras'); }
      if (v.tel === '1.1') { await fine('.telephone .bubble', 'phrase-alegreya-sans'); }
      if (v.tel === '1.2' && !v.cadre) { await fine('.telephone .q', 'question-alegreya-sans-gras'); }
    };
    await jo.jouer(scelle);
    await NAV.fermer(env);
    process.stdout.write((sombre ? 'sombre' : 'clair') + ' : ' + n + ' écrans' + (gris ? ', avec niveaux de gris' : '') + '\n');
  }
}

main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; });
