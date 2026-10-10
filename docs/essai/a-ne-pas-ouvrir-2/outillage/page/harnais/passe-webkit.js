/* Passe WebKit (§9, contrôle 14, « WebKit ») : sur une machine macOS de
 * GitHub Actions, lancée à la main, avec la même version de Playwright que
 * le rejeu Chromium.
 *
 *   1. Dans l'environnement de l'équipe (Chromium), après le rejeu :
 *      node harnais/passe-webkit.js attendus --rejeu D --journaux D/journaux --sortie ATTENDUS.json
 *        [--carnets-c DOSSIER] (carnets du programme de contrôle pour (a), (b), (c), s'ils sont donnés)
 *      Écrit les empreintes attendues : relevés écran par écran des parties
 *      témoins (version du porteur), coups joués, carnets et copies (durées
 *      masquées), traces des 200 parties au hasard (durées masquées).
 *      Aucune valeur en clair : seulement des SHA-256.
 *
 *   2. Sur la machine macOS :
 *      node harnais/passe-webkit.js passe --attendus ATTENDUS.json --scelle F --journaux D
 *        --construction V1 --construction-2 V2 --construction-3 V3 --rapport-construction RAPPORT.txt
 *      Le journal ne dit que « réussi » ou « échoué » et le chemin de chaque
 *      différence, sans valeur ; aucun fichier n'est téléversé.
 *
 *   3. Mode de diagnostic (option --diagnostic) : seulement la construction,
 *      une sonde du profil gardé sur disque (une clé de l'outil, posée sur une
 *      page vide de l'outil, relue ou non après fermeture propre et
 *      réouverture du même profil, en plusieurs variantes), puis (b) et (i),
 *      étape par étape. Chaque arrêt dit son étape, le geste demandé (libellé
 *      de la page) et la première ligne de l'erreur de l'outil avec le
 *      sélecteur attendu ; après chaque réouverture d'un profil, le nombre de
 *      clés retrouvées et si la clé de partie est là. Aucune valeur du jeu.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const O = require('./outils.js');

const TEMOINS = ['a', 'b', 'c'];

const X = require('../textes.js');
// Le message de copie dépend du presse-papiers du navigateur de l'outil (réussite ou seconde méthode) : il est
// remplacé par un repère ; le texte copié lui-même est vérifié à part (contrôle 14 e).
const MESSAGES_COPIE = [N.typographier(X.carnetCopie), N.typographier(X.copieEchec)];
function empreinteEcran(r) {
  return O.sha256Texte(O.canonique({ geste: r.geste, vue: r.vue, blocs: r.blocs.map(b => ({
    texte: MESSAGES_COPIE.indexOf(b.texte) >= 0 ? '‹message de copie›' : O.masquerCarnet(b.texte), zone: b.zone })) }));
}
function empreinteCoups(j) {
  return O.sha256Texte(O.canonique({ seances: j.seances.map(s => ({ k: s.k, ouverture: s.ouverture, versions: s.versions, etapes: s.etapes, coups: s.coups })), arret: j.arret, fin: j.fin }));
}

function attendus(a) {
  const r = { format: 'elenchos-essai-attendus-webkit', version: 1, temoins: {}, moteur: {} };
  for (const id of TEMOINS) {
    const releves = O.lireJson(path.join(a.rejeu, 'releves', id + '.porteur.json'));
    const journal = O.lireJson(path.join(a.journaux, id + '.journal.json'));
    const dossierCarnets = a['carnets-c'] || path.join(a.rejeu, 'page');
    const carnet = O.lireTexte(path.join(dossierCarnets, id + '.carnet.txt'));
    const copies = fs.readdirSync(dossierCarnets).filter(f => new RegExp('^' + id + '\\.copie-[0-9]+\\.txt$').test(f)).sort()
      .map(f => O.sha256Texte(O.masquerCarnet(O.lireTexte(path.join(dossierCarnets, f)))));
    r.temoins[id] = { ecrans: releves.map(empreinteEcran), coups: empreinteCoups(journal), carnet: O.sha256Texte(O.masquerCarnet(carnet)), copies };
  }
  for (const f of fs.readdirSync(path.join(a.rejeu, 'page')).filter(x => /^hasard-[0-9]{3}\.trace\.json$/.test(x)).sort()) {
    const t = O.lireJson(path.join(a.rejeu, 'page', f));
    if (t.partie.mode !== 'moteur') { continue; }
    r.moteur[t.partie.id] = O.sha256Texte(O.canonique(O.masquerTrace(t)));
  }
  r.carnets = a['carnets-c'] ? 'programme de contrôle' : 'page (Chromium)';
  O.ecrireJson(a.sortie, r);
  process.stdout.write('attendus écrits : ' + Object.keys(r.temoins).length + ' parties témoins, ' + Object.keys(r.moteur).length + ' traces\n');
}

async function passe(a) {
  // Chargé ici : Playwright n'est requis que sur la machine de la passe.
  const RJ = require('./rejeu.js');
  const C14 = require('./controle14.js');
  const NAV = require('./navigateur.js');
  const att = O.lireJson(a.attendus);
  const nav = a.navigateur || 'webkit'; // « chromium » : essai à blanc de la passe dans l'environnement de l'équipe
  const { scelle } = C14.lireScelle(a.scelle);
  const r = C14.creerRapport(true);
  const ecart = (chemin) => r.ok('différence : ' + chemin, false);
  // 1. octets construits = rapport de construction
  const rapport = O.lireTexte(a['rapport-construction']);
  for (const sorte of ['porteur', 'temoin']) {
    const m = rapport.match(new RegExp(sorte + '/index\\.html : [0-9]+ octets, SHA-256 ([0-9a-f]{64})'));
    r.ok('construction : ' + sorte + '/index.html égal au rapport de construction', m && m[1] === O.sha256Fichier(path.join(a.construction, sorte, 'index.html')));
  }
  const constructions = {};
  for (const c of ['construction', 'construction-2', 'construction-3']) { if (a[c]) { constructions[+O.lireTexte(path.join(a[c], 'version.txt')).trim()] = a[c]; } }
  if (a.diagnostic) { await diagnostic(a, nav, scelle, r, C14, NAV); return; }
  // 2. parties témoins sur la version du porteur, par l'interface
  for (const id of TEMOINS) {
    const journal = O.lireJson(path.join(a.journaux, id + '.journal.json'));
    const gestes = O.lireJson(path.join(a.journaux, id + '.gestes.json'));
    let res;
    try { res = await RJ.jouerSur({ scelle, journal, gestes, constructions, sorte: 'porteur', navigateur: nav }); }
    catch (e) { r.ok('partie ' + id + ' jouée par l’interface', false); continue; }
    const attendu = att.temoins[id];
    const ecrans = res.releves.map(empreinteEcran);
    let nEcarts = 0;
    for (let i = 0; i < Math.max(ecrans.length, attendu.ecrans.length); i++) {
      if (ecrans[i] !== attendu.ecrans[i]) { if (nEcarts++ < 20) { ecart('/temoins/' + id + '/ecrans/' + i); } }
    }
    r.ok('partie ' + id + ' : textes identiques, écran par écran, au relevé de Chromium', nEcarts === 0);
    const diff = RJ.comparerCoups(journal, res.journalPage);
    diff.slice(0, 20).forEach(d => ecart('/temoins/' + id + '/coups' + d.chemin));
    r.ok('partie ' + id + ' : coups gardés égaux aux coups joués', diff.length === 0);
    r.ok('partie ' + id + ' : carnet égal au carnet attendu (durées masquées)', O.sha256Texte(O.masquerCarnet(res.carnetZone || '')) === attendu.carnet);
    const copies = res.copies.map(c => O.sha256Texte(O.masquerCarnet(c.zone)));
    r.ok('partie ' + id + ' : copies égales aux copies attendues', O.canonique(copies) === O.canonique(attendu.copies));
    r.ok('partie ' + id + ' : aucune erreur de la page, aucune requête refusée', res.erreurs.length === 0 && res.requetesRefusees.length === 0);
  }
  // 3. 200 parties au hasard, par le moteur de la version témoin
  const ids = Object.keys(att.moteur).sort();
  const journaux = ids.map(id => O.lireJson(path.join(a.journaux, id + '.journal.json')));
  try {
    const m = await RJ.rejouerMoteur({ journaux, constructions, navigateur: nav });
    let n = 0;
    m.traces.forEach((t, i) => { if (O.sha256Texte(O.canonique(O.masquerTrace(t))) !== att.moteur[ids[i]]) { if (n++ < 20) { ecart('/moteur/' + ids[i]); } } });
    r.ok('parties au hasard : ' + ids.length + ' traces égales à celles de Chromium (durées masquées)', n === 0 && m.erreurs.length === 0);
  } catch (e) { r.ok('parties au hasard rejouées par le moteur', false); }
  // 4. contrôles (a), (b), (c), (d), (f), (h) ; largeur de U+202F ; (i) sans arrêt brutal
  const o = { navigateur: nav, icone: a.icone || path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'apple-touch-icon.png'),
    pageTest: a['page-test'] || path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'index.html'), scelle, cheminScelle: a.scelle,
    construction: a.construction, construction2: a['construction-2'], construction3: a['construction-3'],
    porteur: C14.porteurDe(a.construction), porteur2: C14.porteurDe(a['construction-2']), journaux: a.journaux };
  for (const [nom, f] of [['(a) (c)', C14.controleHors], ['(f)', C14.controleCsp], ['(b)', C14.controleMemoire], ['(d)', C14.controleEffacer], ['§8.11', C14.controleArrets],
    ['U+202F', C14.controleEspaceFine], ['(h) retours', C14.controleRetours], ['(h) tailles', C14.controleMiseEnPage], ['(h) autres écrans', C14.controleAutresEcrans], ['(i)', require('./durees.js').controleDurees]]) {
    if (a.rapide && /^\(h\) (tailles|autres)/.test(nom)) { continue; } // essai à blanc seulement
    try { await f(o, r); } catch (e) { r.ok(nom + ' joué jusqu’au bout', false); }
  }
  process.stdout.write((r.faux ? 'échoué' : 'réussi') + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + ')\n');
  process.exitCode = r.faux ? 1 : 0;
}

/** Mode de diagnostic : (b) et (i) étape par étape, après la sonde du profil gardé sur disque. */
async function diagnostic(a, nav, scelle, r, C14, NAV) {
  const o = { navigateur: nav, diagnostic: true, icone: a.icone || path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'apple-touch-icon.png'),
    pageTest: a['page-test'] || path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'index.html'), scelle, cheminScelle: a.scelle,
    construction: a.construction, construction2: a['construction-2'], construction3: a['construction-3'],
    porteur: C14.porteurDe(a.construction), porteur2: C14.porteurDe(a['construction-2']), journaux: a.journaux };
  const os = require('node:os');
  let construit = 'inconnu';
  try { construit = NAV.PW[nav].executablePath().match(/(webkit|chromium)-[0-9]+/)[0]; } catch (e) { /* inconnu */ }
  r.note('diagnostic : ' + nav + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + ', ' + construit + '), ' + process.platform + ' ' + os.release() + ' ' + os.arch());
  try { await C14.sondePersistance(o, r); } catch (e) { r.note('diagnostic : sonde du profil arrêtée : ' + C14.resumeErreur(e)); }
  o.etape = '(b) avant le début';
  try { await C14.controleMemoire(o, r); r.note('diagnostic : (b) joué jusqu’au bout'); } catch (e) {
    r.note('diagnostic : (b) arrêté à l’étape « ' + o.etape + ' » : ' + C14.resumeErreur(e));
    r.ok('(b) joué jusqu’au bout', false);
  }
  o.etape = '(i) avant le début';
  await require('./durees.js').controleDurees(o, r);
  process.stdout.write('diagnostic ' + (r.faux ? 'échoué' : 'réussi') + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + ')\n');
  process.exitCode = r.faux ? 1 : 0;
}

async function main() {
  const [commande, ...reste] = process.argv.slice(2);
  const a = O.argumentsCli(reste);
  if (commande === 'attendus') { attendus(a); return; }
  if (commande === 'passe') { await passe(a); return; }
  throw new Error('commande inconnue : ' + commande);
}

main().catch(() => { process.stdout.write('échoué\n'); process.exitCode = 2; });
