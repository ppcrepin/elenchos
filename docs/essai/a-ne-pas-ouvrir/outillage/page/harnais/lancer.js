/* Harnais de la page de l'essai (§9 ; schema.md, parties 3.1, 3.12, 4.2 à 4.4).
 *
 *   node harnais/lancer.js journaux --scelle F --references DOSSIER --sortie D
 *       Écrit les journaux du harnais (parties témoins, parties au hasard)
 *       et leurs gestes : D/journaux/{id}.journal.json, {id}.gestes.json.
 *       Graine maîtresse des parties au hasard : les 16 premiers caractères
 *       du SHA-256 du fichier scellé (rien n'est choisi), inscrite dans
 *       D/journaux/hasard.json.
 *
 *   node harnais/lancer.js rejeu --scelle F --construction DOSSIER_V1
 *       [--construction-2 DOSSIER_V2 --construction-3 DOSSIER_V3]
 *       --journaux D/journaux --sortie D [--parties a,b,...]
 *       [--navigateur chromium|webkit] [--icone apple-touch-icon.png]
 *       Joue chaque partie « interface » sur les deux versions ; parties
 *       témoins rejouées aussi sous America/New_York ; parties « moteur »
 *       rejouées par le moteur de la version témoin. Écrit traces, carnets,
 *       copies, relevés et D/rapport-rejeu.txt.
 *
 * Les autres contrôles : controles.js.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const M = require('../moteur.js');
const TR = require('../trace.js');
const O = require('./outils.js');
const P = require('./parties.js');
const RJ = require('./rejeu.js');
const NAV = require('./navigateur.js');

const ICONE_DEFAUT = path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'apple-touch-icon.png');

function lireScelle(chemin) {
  const octets = new Uint8Array(fs.readFileSync(chemin));
  const texte = N.utf8Decoder(octets);
  const scelle = JSON.parse(texte);
  if (N.jsonCanonique(scelle) !== texte) { throw new Error('fichier scellé : pas en forme canonique'); }
  return { scelle, empreinte: N.sha256(octets) };
}

function versionDe(dossier) { return +O.lireTexte(path.join(dossier, 'version.txt')).trim(); }

function constructionsDe(a) {
  const c = {};
  for (const cle of ['construction', 'construction-2', 'construction-3']) {
    if (!a[cle]) { continue; }
    c[versionDe(a[cle])] = a[cle];
  }
  return c;
}

/* ---------------- journaux ---------------- */

function ecrireJournaux(a) {
  const { scelle, empreinte } = lireScelle(a.scelle);
  const d = path.join(a.sortie, 'journaux');
  fs.mkdirSync(d, { recursive: true });
  const ecrits = [];
  const ecrire = (journal, gestes) => {
    const id = journal.partie.id;
    const e = M.validerJournal(scelle, journal);
    if (e.length) { throw new Error('journal ' + id + ' invalide : ' + e.join(' ; ')); }
    O.ecrireJson(path.join(d, id + '.journal.json'), journal);
    O.ecrireJson(path.join(d, id + '.gestes.json'), gestes || { seances: {} });
    ecrits.push(id);
  };
  // (a) : le journal du carnet de référence, tel quel (§9)
  if (a.references) {
    const ja = path.join(a.references, 'carnet-2-cloture-a', 'journal.json');
    const brut = O.lireTexte(ja);
    const journal = JSON.parse(brut);
    if (journal.empreinte_scelle !== empreinte) { throw new Error('journal (a) : autre fichier scellé'); }
    fs.mkdirSync(d, { recursive: true });
    fs.copyFileSync(ja, path.join(d, 'a.journal.json'));
    O.ecrireJson(path.join(d, 'a.gestes.json'), { seances: {} });
    ecrits.push('a');
  }
  for (const p of P.partiesTemoins(scelle, empreinte)) { ecrire(p.journal, p.gestes); }
  const maitresse = empreinte.slice(0, 16);
  for (const p of P.partiesHasard(scelle, empreinte, maitresse, 1, 200, 'moteur')) { ecrire(p.journal, p.gestes); }
  for (const p of P.partiesHasard(scelle, empreinte, maitresse, 201, 10, 'interface')) { ecrire(p.journal, p.gestes); }
  O.ecrireJson(path.join(d, 'hasard.json'), { graine_maitresse: maitresse, regle: 'graine de la partie i = 16 premiers caractères de SHA-256(maîtresse « | » i) ; 1 à 200 : mode moteur ; 201 à 210 : mode interface',
    empreinte_scelle: empreinte });
  process.stdout.write('journaux écrits : ' + ecrits.length + ' (' + d + ')\n');
}

/* ---------------- rejeu ---------------- */

function lireJournaux(dossier, parties) {
  const ids = fs.readdirSync(dossier).filter(f => /\.journal\.json$/.test(f)).map(f => f.replace(/\.journal\.json$/, ''));
  const choisis = parties ? parties.split(',') : ids;
  return choisis.sort().map(id => ({ id, journal: O.lireJson(path.join(dossier, id + '.journal.json')),
    gestes: fs.existsSync(path.join(dossier, id + '.gestes.json')) ? O.lireJson(path.join(dossier, id + '.gestes.json')) : { seances: {} } }));
}

/** Durées de la trace de la page (fichier des durées, partie 3.12), pour le rejeu de Node. */
function dureesDe(trace) {
  const l = x => ({ k: x.k, duree_seance: x.mesures.duree_seance, duree_deviner: x.mesures.duree_deviner, duree_repondre: x.mesures.duree_repondre });
  return { format: 'elenchos-essai-durees', version: 1, partie: trace.partie.id, seances: trace.seances.map(l), copies: trace.copies.map(l) };
}

async function rejeu(a) {
  const { scelle, empreinte } = lireScelle(a.scelle);
  const constructions = constructionsDe(a);
  const navigateur = a.navigateur || 'chromium';
  const icone = a.icone || ICONE_DEFAUT;
  const sortie = a.sortie;
  const parties = lireJournaux(a.journaux, a.parties);
  const lignes = [];
  let defauts = 0;
  const fichierRapport = path.join(sortie, 'rapport-rejeu-' + navigateur + '.txt');
  fs.mkdirSync(sortie, { recursive: true });
  fs.writeFileSync(fichierRapport, '');
  const dire = s => { lignes.push(s); process.stdout.write(s + '\n'); fs.appendFileSync(fichierRapport, s + '\n'); };
  dire('Rejeu : ' + navigateur + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + '), constructions ' + Object.keys(constructions).map(v => 'v' + v + ' ' + O.sha256Fichier(path.join(constructions[v], 'porteur', 'index.html')).slice(0, 12) + '/' + O.sha256Fichier(path.join(constructions[v], 'temoin', 'index.html')).slice(0, 12)).join(', '));
  const moteur = parties.filter(p => p.journal.partie.mode === 'moteur');
  const inter = parties.filter(p => p.journal.partie.mode === 'interface');
  for (const p of inter) {
    const t0 = Date.now();
    let r;
    try {
      r = await RJ.rejouerPartie({ scelle, journal: p.journal, gestes: p.gestes, constructions, navigateur, icone });
    } catch (e) {
      defauts++;
      dire('ÉCHEC ' + p.id + ' : ' + e.message);
      if (e.capture) { fs.mkdirSync(path.join(sortie, 'echecs'), { recursive: true }); fs.writeFileSync(path.join(sortie, 'echecs', p.id + '.png'), e.capture); }
      if (e.releves) { O.ecrireJson(path.join(sortie, 'echecs', p.id + '.releves.json'), { releves: e.releves, erreurs: e.erreursPage }); }
      continue;
    }
    O.ecrireJson(path.join(sortie, 'page', p.id + '.trace.json'), r.trace);
    if (r.carnet !== null) { O.ecrireTexte(path.join(sortie, 'page', p.id + '.carnet.txt'), r.carnet); O.ecrireTexte(path.join(sortie, 'page', p.id + '.carnet-masque.txt'), O.masquerCarnet(r.carnet)); }
    r.copies.forEach((c, i) => { O.ecrireTexte(path.join(sortie, 'page', p.id + '.copie-' + (i + 1) + '.txt'), c); O.ecrireTexte(path.join(sortie, 'page', p.id + '.copie-' + (i + 1) + '-masque.txt'), O.masquerCarnet(c)); });
    // relevé de la version du porteur (celui de la version témoin lui est identique, vérifié ci-dessus) ; coupures : voir le contrôle 11
    O.ecrireJson(path.join(sortie, 'releves', p.id + '.porteur.json'), r.relevesPorteur.map(x => ({ seance: x.seance, geste: x.geste, vue: x.vue, blocs: x.blocs })));
    // contrôle interne : la trace de la page égale celle du moteur de la page rejoué dans Node (mêmes durées)
    const tn = TR.tracer(N, M, scelle, Object.assign({}, p.journal), dureesDe(r.trace), empreinte);
    const cn = O.comparerTraces(r.trace, tn);
    if (!cn.egales) { r.defauts.push({ controle: 'interne', quoi: 'trace de la page ≠ moteur de la page dans Node', ecarts: cn.ecarts.slice(0, 10) }); }
    // parties témoins : même partie sous America/New_York (§9)
    if (/^[a-z]$/.test(p.id) && !a['sans-fuseau']) {
      const ny = await RJ.rejouerFuseau({ scelle, journal: p.journal, gestes: p.gestes, constructions, navigateur, icone, fuseau: 'America/New_York', langue: 'en-US' });
      const c1 = O.comparerTraces(O.masquerTraceEtCarnets(ny.trace), O.masquerTraceEtCarnets(r.trace));
      if (!c1.egales) { r.defauts.push({ controle: 'fuseau', quoi: 'trace sous America/New_York différente', ecarts: c1.ecarts.slice(0, 10) }); }
      if (O.masquerCarnet(ny.carnet || '') !== O.masquerCarnet(r.carnet || '')) { r.defauts.push({ controle: 'fuseau', quoi: 'carnet sous America/New_York différent' }); }
      if (O.canonique(ny.copies.map(O.masquerCarnet)) !== O.canonique(r.copies.map(O.masquerCarnet))) { r.defauts.push({ controle: 'fuseau', quoi: 'copies sous America/New_York différentes' }); }
    }
    O.ecrireJson(path.join(sortie, 'defauts', p.id + '.json'), r.defauts);
    defauts += r.defauts.length;
    dire((r.defauts.length ? 'DÉFAUTS ' : 'juste ') + p.id + ' : ' + r.gestes + ' gestes, ' + Math.round((Date.now() - t0) / 1000) + ' s' +
      (r.defauts.length ? ' — ' + r.defauts.map(x => '[' + x.controle + '] ' + x.quoi).join(' ; ') : ''));
  }
  if (moteur.length) {
    const r = await RJ.rejouerMoteur({ journaux: moteur.map(p => p.journal), constructions, navigateur, icone });
    let ecartsNode = 0;
    r.traces.forEach((t, i) => {
      O.ecrireJson(path.join(sortie, 'page', moteur[i].id + '.trace.json'), t);
      const tn = TR.tracer(N, M, scelle, moteur[i].journal, null, empreinte);
      if (!O.comparerTraces(t, tn).egales) { ecartsNode++; }
    });
    if (r.erreurs.length || r.refusees.length) { defauts++; dire('DÉFAUTS moteur : ' + r.erreurs.concat(r.refusees).join(' ; ')); }
    if (ecartsNode) { defauts++; dire('DÉFAUTS moteur : ' + ecartsNode + ' traces différentes du moteur de la page dans Node'); }
    dire('parties au hasard, mode moteur : ' + r.traces.length + ' traces écrites');
  }
  dire('Rejeu : ' + (defauts ? defauts + ' défaut(s)' : 'aucun défaut'));
  return defauts;
}

async function main() {
  const [commande, ...reste] = process.argv.slice(2);
  const a = O.argumentsCli(reste);
  if (commande === 'journaux') { ecrireJournaux(a); return; }
  if (commande === 'rejeu') { const d = await rejeu(a); process.exitCode = d ? 1 : 0; return; }
  throw new Error('commande inconnue : ' + commande + ' (journaux, rejeu)');
}

main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; });
