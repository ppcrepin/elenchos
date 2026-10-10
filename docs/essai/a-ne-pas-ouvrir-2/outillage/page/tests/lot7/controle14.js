/* Lot 7, part B : contrôle 14 à l'écran : (b) mémoire, (d) « Tout effacer », (h) captures de mise en page à
 * toutes les tailles, (i) durées, (j) performance par geste. Chromium (équipe) ou WebKit (passe WebKit).
 *
 *   node tests/lot7/controle14.js CONSTRUCTION PAGE_PREMIER_ESSAI.html SORTIE_RAPPORTS SORTIE_CAPTURES [b,d,h,i,j] [TEMOINS_INTERFACE]
 *        [--navigateur chromium|webkit] [--sobre] [--diagnostic]
 *
 * PAGE_PREMIER_ESSAI.html : la page du premier essai reconstruite depuis ses sources (construire.py du premier
 * essai, sur son fichier scellé et ses entrées : mêmes octets que la version publiée).
 * Rien n'est ajouté à la page. Pour (b), l'outil compte les lectures de la mémoire par un script posé avant
 * ceux de la page (comme les observateurs du harnais d'A) ; il pose lui-même les clés d'un autre essai.
 * (b) comprend un profil gardé sur disque (contexte persistant), fermé puis rouvert.
 * TEMOINS_INTERFACE (facultatif, « - » pour aucun) : la partie de (i) y est gardée (ecran-durees-fermeture).
 * --sobre (passe WebKit) : la sortie ne dit que « juste » ou « ÉCART », le contrôle et, pour un écart, le chemin
 *   d'une différence ; aucune valeur du jeu, puis « réussi » ou « échoué ».
 * --diagnostic : chaque scénario dit ses étapes ; un arrêt dit son étape et la première ligne de l'erreur de
 *   l'outil (geste demandé, boutons affichés : des noms d'action, jamais un texte) ; une sonde du profil gardé
 *   sur disque (clé de l'outil sur une page vide de l'outil, relue ou non après réouverture) passe d'abord.
 */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const O = require('./outils.js');
const JO = require('./joueur.js');
const N = require('../../noyau.js');

const ARGS = process.argv.slice(2);
const option = (nom) => { const i = ARGS.indexOf(nom); return i >= 0 ? ARGS[i + 1] : null; };
const TYPE = option('--navigateur') || 'chromium';
const SOBRE = ARGS.includes('--sobre'), DIAG = ARGS.includes('--diagnostic');
const POS = ARGS.filter((x, i) => !x.startsWith('--') && !(i > 0 && ARGS[i - 1] === '--navigateur'));
const [dConstruction, fPremier, dRapports, dCaptures, pointsArg, dTemoinsArg] = POS;
const dTemoins = dTemoinsArg && dTemoinsArg !== '-' ? dTemoinsArg : null;
const POINTS = (pointsArg || 'b,d,h,i,j').split(',');
const c = O.lireConstruction(dConstruction);
const HTML_PREMIER = fs.readFileSync(fPremier, 'utf8');
fs.mkdirSync(dRapports, { recursive: true });

const lignes = [];
let ecarts = 0;
const sortie = (x) => process.stdout.write(x + '\n');
/** detail : valeurs, au rapport seulement ; chemins : chemins d'une différence, sans valeur (sortie sobre). */
const ok = (pt, quoi, vrai, detail, chemins) => {
  if (!vrai) { ecarts++; }
  lignes.push((vrai ? 'passé ' : 'ÉCART ') + '(' + pt + ') ' + quoi + (detail ? ' — ' + detail : ''));
  if (SOBRE) { sortie((vrai ? 'juste ' : 'ÉCART ') + '(' + pt + ') ' + quoi + (!vrai && chemins ? ' — ' + chemins : '')); }
};
const dire = (x) => { lignes.push(x); if (!SOBRE) { console.log(x); } else if (/^\([a-z]\) [^:]*$/.test(x)) { sortie(x); } };
let ETAPE = '';
const etape = (x) => { ETAPE = x; if (DIAG) { sortie('  étape : ' + x); } };
const premiereLigne = (x) => String(x && x.message || x).split('\n')[0].replace(/\s+/g, ' ').slice(0, 240);
/** Un scénario : un arrêt est un écart qui dit son étape, et les scénarios suivants sont joués quand même. */
async function scenario(pt, nom, f) {
  const ouverts = [];
  const ouvrir = async (o) => { const s = await O.ouvrir(NAVIGATEUR, c, Object.assign({ type: TYPE }, o)); ouverts.push(s); return s; };
  if (DIAG) { sortie('scénario (' + pt + ') ' + nom); }
  etape('ouverture');
  try { await f(ouvrir); }
  catch (x) {
    ecarts++;
    lignes.push('ÉCART (' + pt + ') ' + nom + ' : arrêté à l\'étape « ' + ETAPE + ' » : ' + premiereLigne(x));
    sortie('ÉCART (' + pt + ') ' + nom + ' : arrêté à l\'étape « ' + ETAPE + ' »' + (SOBRE && !DIAG ? '' : ' : ' + premiereLigne(x)));
  } finally {
    for (const s of ouverts) { try { await s.ctx.close(); } catch (x) { /* déjà fermé */ } }
  }
}
let NAVIGATEUR = null;

/** Lectures et écritures de la mémoire, relevées avant tout script de la page. */
const ESPION = `(function () {
  var L = []; Object.defineProperty(window, '__memoire', { value: L, enumerable: false });
  var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem;
  P.getItem = function (k) { L.push(['lit', k]); return g.call(this, k); };
  P.setItem = function (k, v) { L.push(['ecrit', k]); return s.call(this, k, v); };
  P.removeItem = function (k) { L.push(['efface', k]); return r.call(this, k); };
})();`;
const cles = (s) => s.page.evaluate(() => { const l = []; for (let i = 0; i < localStorage.length; i++) { l.push(localStorage.key(i)); } return l.sort(); });
const memoire = (s) => s.page.evaluate(() => (window.__memoire || []).slice());
/** Page du cadre affichée ; sans vue gardée (aucun geste encore), la page s'ouvre sur le premier message. */
const cadreDe = (e) => (!e ? null : (e.vue && e.vue.tel ? (e.vue.cadre ? e.vue.cadre.page : null) : 'message0'));
const valeur = (s, k) => s.page.evaluate((k) => localStorage.getItem(k), k);
async function toucherAction(s, a, d) {
  const L = await O.actions(s.page);
  const x = L.find((y) => y.a === a && Object.keys(d || {}).every((k) => y.d[k] === d[k]));
  if (!x) { throw new Error('bouton absent : ' + a + ' ; boutons : ' + L.map((y) => y.a).join(', ')); }
  await O.toucher(s, x);
  await s.page.waitForTimeout(30);
}
async function servir(s, html) { s.ctx.__s.htmlCourant = html; }
/** Page vide de l'outil, servie à l'adresse de l'essai pour poser des clés avant tout chargement de la page. */
const VIDE = '<!doctype html><title>outil</title>';
async function poser(s, paires) { await s.page.evaluate((p) => { p.forEach(([k, v]) => localStorage.setItem(k, v)); }, paires); }
async function jouerJusqua(s, plan, f) { return JO.jouer(s, plan, { jusqua: f }); }
function diff(a, b, chemin, out) {
  if (JSON.stringify(a) === JSON.stringify(b)) { return out; }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) === !Array.isArray(b)) {
    new Set(Object.keys(a).concat(Object.keys(b))).forEach((k) => diff(a[k], b[k], chemin + '/' + k, out));
  } else { out.push(chemin + ' : ' + JSON.stringify(a) + ' → ' + JSON.stringify(b)); }
  return out;
}

/* ------------------------------------------------------------------ */
/* (b) mémoire et (d) « Tout effacer »                                 */
/* ------------------------------------------------------------------ */
async function pointB() {
  dire('(b) mémoire');
  await scenario('b', 'sans ancienne partie', async (ouvrir) => {
    const s = await ouvrir({ scriptsInit: [ESPION] });
    etape('premier message');
    ok('b', 'sans ancienne partie : la page s\'ouvre sur le premier message', cadreDe(await O.etat(s.page)) === 'message0', '');
    await toucherAction(s, 'message0-continuer');
    const k = await cles(s);
    ok('b', 'sans ancienne partie : seule la clé partie-2 est écrite', JSON.stringify(k) === JSON.stringify(['elenchos-essai:partie-2']), k.join(', '), k.length + ' clé(s)');
    const m = await memoire(s);
    ok('b', 'aucune écriture hors de partie-2 et verif-2', m.filter((x) => x[0] !== 'lit').every((x) => x[1] === 'elenchos-essai:partie-2' || x[1] === 'elenchos-essai:verif-2'), [...new Set(m.map((x) => x[0] + ' ' + x[1]))].join(', '));
  });

  await scenario('b', 'ancienne partie présente', async (ouvrir) => {
    const s = await ouvrir({ scriptsInit: [ESPION], aller: false, html: VIDE });
    etape('clés du premier essai posées sur la page vide de l\'outil');
    await s.page.goto(O.ADRESSE);
    await poser(s, [['elenchos-essai:partie', '{illisible, jamais lu'], ['elenchos-essai:sonde', 'x'], ['autre-site:cle', 'garde']]);
    await servir(s, c.html);
    etape('chargement de la page');
    await s.page.reload(); await s.page.waitForTimeout(50);
    ok('b', 'ancienne partie présente : la page de la partie du premier essai est proposée', (await O.actions(s.page)).some((x) => x.a === 'ancienne-effacer'), '');
    const m = await memoire(s);
    ok('b', 'ancienne partie : repérée par la liste des clés, jamais lue', !m.some((x) => x[0] === 'lit' && x[1] === 'elenchos-essai:partie'), '');
    etape('« Effacer », puis « Annuler »');
    await toucherAction(s, 'ancienne-effacer'); await toucherAction(s, 'ancienne-annuler');
    ok('b', '« Annuler » sur la confirmation garde l\'ancienne partie', (await cles(s)).includes('elenchos-essai:partie'), '');
    etape('« Effacer », puis confirmer');
    await toucherAction(s, 'ancienne-effacer'); await toucherAction(s, 'ancienne-confirmer');
    const k = await cles(s);
    ok('b', 'effacement de l\'ancienne partie : clés du premier essai retirées, autres sites intacts', !k.some((x) => x.startsWith('elenchos-essai:') && x !== 'elenchos-essai:partie-2') && k.includes('autre-site:cle'), k.join(', '));
    ok('b', 'puis la partie commence (premier message)', cadreDe(await O.etat(s.page)) === 'message0', '');
  });

  await scenario('b', 'les deux clés, puis la page du premier essai sur la même mémoire', async (ouvrir) => {
    const s = await ouvrir({ scriptsInit: [ESPION] });
    etape('partie jouée jusqu\'à Deviner du jour 2');
    await jouerJusqua(s, { graine: 501, pseudo: 'Zoé', voie: 'apple' }, (info) => info.k === 2 && info.ecran === 'deviner');
    const ecranAvant = (await O.etat(s.page)).vue.tel.ecran;
    // La page quittée écrit son état (horloge des durées) : la référence est prise après, sur la page vide de l'outil.
    etape('clé du premier essai posée sur la page vide de l\'outil');
    await servir(s, VIDE); await s.page.reload();
    const avant = await valeur(s, 'elenchos-essai:partie-2');
    await poser(s, [['elenchos-essai:partie', '{illisible']]);
    etape('rechargement de la page');
    await servir(s, c.html); await s.page.reload(); await s.page.waitForTimeout(50);
    ok('b', 'les deux clés : la page de la partie du premier essai est proposée', (await O.actions(s.page)).some((x) => x.a === 'ancienne-effacer'), '');
    ok('b', 'les deux clés : partie-2 inchangée au chargement', (await valeur(s, 'elenchos-essai:partie-2')) === avant, '', '/elenchos-essai:partie-2');
    const m = await memoire(s);
    ok('b', 'les deux clés : l\'ancienne jamais lue', !m.some((x) => x[0] === 'lit' && x[1] === 'elenchos-essai:partie'), '');
    etape('effacement de l\'ancienne partie');
    await toucherAction(s, 'ancienne-effacer'); await toucherAction(s, 'ancienne-confirmer');
    const e = await O.etat(s.page);
    ok('b', 'les deux clés : après l\'effacement, la partie reprend où elle était', e.vue.tel.ecran === ecranAvant && JSON.stringify(Object.keys(e.jours)) === JSON.stringify(Object.keys(JSON.parse(avant).jours)), e.vue.tel.ecran + ' / ' + ecranAvant);
    ok('b', 'les deux clés : seules partie-2 (et verif-2) restent', JSON.stringify(await cles(s)) === JSON.stringify(['elenchos-essai:partie-2']), (await cles(s)).join(', '));
    etape('page du premier essai chargée sur la même mémoire');
    await servir(s, VIDE); await s.page.reload();
    const avant2 = await valeur(s, 'elenchos-essai:partie-2');
    await servir(s, HTML_PREMIER);
    await s.page.reload(); await s.page.waitForTimeout(150);
    ok('b', 'page du premier essai sur la même mémoire : partie-2 intacte à son chargement', (await valeur(s, 'elenchos-essai:partie-2')) === avant2, (await cles(s)).join(', '), '/elenchos-essai:partie-2');
    etape('premier toucher dans la page du premier essai');
    const L1 = await O.actions(s.page);
    if (L1.length) { await O.toucher(s, L1[0]); await s.page.waitForTimeout(50); }
    const cles2 = await cles(s);
    ok('b', 'page du premier essai : partie-2 intacte après son premier toucher', (await valeur(s, 'elenchos-essai:partie-2')) === avant2, cles2.join(', '), '/elenchos-essai:partie-2');
    etape('retour sur la page du second essai');
    await servir(s, c.html);
    await s.page.reload(); await s.page.waitForTimeout(50);
    const proposee = (await O.actions(s.page)).some((x) => x.a === 'ancienne-effacer');
    ok('b', 'retour sur la nouvelle page : l\'effacement de l\'ancienne partie est proposé si la clé du premier essai existe', proposee === cles2.includes('elenchos-essai:partie'), 'clé du premier essai : ' + (cles2.includes('elenchos-essai:partie') ? 'créée' : 'non créée') + ' ; page proposée : ' + proposee);
  });

  await scenario('b', 'profil gardé sur disque, fermé puis rouvert', async (ouvrir) => {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'elenchos-profil-'));
    try {
      etape('ouverture d\'un profil neuf');
      let s = await ouvrir({ profil });
      etape('partie jouée jusqu\'à Répondre du jour 3');
      await jouerJusqua(s, { graine: 505, pseudo: 'Zoé', voie: 'google' }, (info) => info.k === 3 && info.ecran === 'repondre');
      const e0 = await O.etat(s.page);
      etape('fermeture propre du profil');
      await s.ctx.close();
      etape('réouverture du même profil');
      s = await ouvrir({ profil });
      await s.page.waitForTimeout(100);
      etape('relecture de la partie');
      const e1 = await O.etat(s.page);
      const coups = (e) => JSON.stringify(Object.keys(e.jours).map((k) => [k, e.jours[k].coups]));
      ok('b', 'profil gardé sur disque : après fermeture et réouverture, la partie est retrouvée, coups compris', !!e1 && coups(e1) === coups(e0), '', e1 ? '/jours' : '/elenchos-essai:partie-2 (absente)');
      ok('b', 'profil gardé sur disque : la partie reprend sur le même écran', !!e1 && e1.vue && e1.vue.tel && e1.vue.tel.ecran === e0.vue.tel.ecran, '', '/vue/tel/ecran');
      const jv = await O.journalValide(s, true);
      ok('b', 'profil gardé sur disque : journal valide après réouverture', jv.erreurs.length === 0, jv.erreurs.slice(0, 3).join(' | '));
      etape('un geste après la réouverture');
      const r = await JO.jouer(s, { graine: 506, pseudo: 'Zoé' }, { jusqua: (info) => info.k === 4 });
      ok('b', 'profil gardé sur disque : la partie se poursuit jusqu\'au jour 4', r.raisonFin === 'jusqua', '');
    } finally { fs.rmSync(profil, { recursive: true, force: true }); }
  });

  await scenario('b', '« Annuler » sur la page du saut', async (ouvrir) => {
    const s = await ouvrir({});
    etape('partie jouée jusqu\'à 2.7f du jour 4');
    await jouerJusqua(s, { graine: 502, pseudo: 'Zoé', voie: 'google' }, async (info, et, ss) => info.k === 4 && info.ecran === 'revelation' && (await O.actions(ss.page)).some((x) => x.a === 'rev-jouer'));
    const j0 = (await O.journalValide(s, true)).journal;
    etape('« Jouer », puis « Annuler » sur la page du saut');
    await toucherAction(s, 'rev-jouer');
    ok('b', '« Jouer » au jour 4 ouvre la page du saut', cadreDe(await O.etat(s.page)) === 'saut', '');
    await toucherAction(s, 'saut-annuler');
    const j1 = (await O.journalValide(s, true)).journal;
    const d = diff(j0, j1, '', []);
    ok('b', '« Annuler » sur la page du saut : seul le compte de « Annuler » change dans la partie', d.length === 1 && /^\/jours\/4\/coups\/annuler_saut/.test(d[0]), d.join(' ; '), d.map((x) => x.split(' : ')[0]).join(' ; '));
    const e = await O.etat(s.page);
    ok('b', '« Annuler » ramène sur 2.7f', e.vue.tel.ecran === 'revelation' && !e.vue.cadre, '');
  });

  await scenario('b', 'rechargement au milieu du rattrapage', async (ouvrir) => {
    const s = await ouvrir({});
    etape('partie jouée, rechargements aux textes 2 (premier saut) et 4 (second saut)');
    const r = await JO.jouer(s, { graine: 507, pseudo: 'Zoé', voie: 'apple', recharges: [{ saut: 1, ecran: 'ratt-position', rang: 2 }, { saut: 2, ecran: 'ratt-raison', rang: 4 }] });
    const avantApres = r.releve.map((x, i) => [r.releve[i - 1], x]).filter(([, x]) => x.action === 'rechargement')
      .map(([a, b]) => [/saut · texte \d+ sur \d+/.exec(O.normaliser(a.barre || '')), /saut · texte \d+ sur \d+/.exec(O.normaliser(b.barre || ''))]);
    ok('b', 'rechargement au milieu du rattrapage : la page reprend sur le texte où elle était', avantApres.length === 2 && avantApres.every(([a, b]) => a && b && a[0] === b[0]), '');
    const jv = await O.journalValide(s, false);
    ok('b', 'rechargement au milieu du rattrapage : journal valide, aucun texte répondu deux fois ni sauté', jv.erreurs.length === 0 && jv.journal.sauts.every((x) => x.textes_atteints === (x.numero === 1 ? 3 : 6)), jv.erreurs.slice(0, 3).join(' | '));
  });

  dire('(d) « Tout effacer »');
  await scenario('d', '« Tout effacer » pendant l\'essai', async (ouvrir) => {
    const s = await ouvrir({});
    etape('partie jouée jusqu\'au jour 2');
    await jouerJusqua(s, { graine: 503, pseudo: 'Zoé', voie: 'apple' }, (info) => info.k === 2 && info.ecran === 'attente');
    await poser(s, [['elenchos-essai:partie', '{ancienne'], ['elenchos-essai:sonde-icone', '1'], ['elenchos-essai:verif', 'x'], ['autre-site:cle', 'garde']]);
    etape('Moi › Réglages › Tout effacer');
    await toucherAction(s, 'onglet-moi'); await toucherAction(s, 'reglages'); await toucherAction(s, 'effacer');
    ok('d', '« Tout effacer » pendant l\'essai : confirmation avec « Copier mon carnet d\'abord »', (await O.actions(s.page)).some((x) => x.a === 'copier-dabord'), '');
    etape('confirmation');
    await toucherAction(s, 'effacer-confirmer');
    const k = await cles(s);
    ok('d', '« Tout effacer » pendant l\'essai : plus aucune clé « elenchos-essai: », premier essai compris ; autres sites intacts', !k.some((x) => x.startsWith('elenchos-essai:')) && k.includes('autre-site:cle'), k.join(', '));
    etape('rechargement');
    await s.page.reload(); await s.page.waitForTimeout(50);
    ok('d', 'après « Tout effacer », un rechargement repart du premier message', cadreDe(await O.etat(s.page)) === 'message0', '');
  });
  await scenario('d', '« Tout effacer » après le dévoilement', async (ouvrir) => {
    const s = await ouvrir({});
    etape('partie arrêtée au jour 3, jusqu\'au dévoilement');
    await JO.jouer(s, { graine: 504, pseudo: 'Zoé', voie: 'apple', arret: { jour: 3, moment: 'attente' } });
    await poser(s, [['elenchos-essai:partie', '{ancienne'], ['elenchos-essai:sonde-icone', '1'], ['autre-site:cle', 'garde']]);
    etape('« Tout effacer », puis confirmer');
    await toucherAction(s, 'effacer'); await toucherAction(s, 'effacer-confirmer');
    const k = await cles(s);
    ok('d', '« Tout effacer » après le dévoilement : plus aucune clé « elenchos-essai: », premier essai compris', !k.some((x) => x.startsWith('elenchos-essai:')) && k.includes('autre-site:cle'), k.join(', '));
  });
}

/** Diagnostic : une clé de l'outil, posée sur une page vide de l'outil, est-elle relue après fermeture et réouverture du profil ? */
async function sondeProfil() {
  for (const v of [{ nom: 'fermeture aussitôt', attente: 0 }, { nom: 'fermeture après 2 s réelles', attente: 2000 }]) {
    const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'elenchos-sonde-'));
    let s = null;
    try {
      etape('sonde (' + v.nom + ') : ouverture d\'un profil neuf');
      s = await O.ouvrir(null, c, { type: TYPE, profil, aller: false, html: VIDE });
      await s.page.goto(O.ADRESSE);
      await s.page.evaluate(() => localStorage.setItem('outil-sonde', 'x'));
      if (v.attente) { await s.page.waitForTimeout(v.attente); }
      etape('sonde (' + v.nom + ') : fermeture propre');
      await s.ctx.close(); s = null;
      etape('sonde (' + v.nom + ') : réouverture du même profil');
      s = await O.ouvrir(null, c, { type: TYPE, profil, aller: false, html: VIDE });
      await s.page.goto(O.ADRESSE);
      const lu = await s.page.evaluate(() => localStorage.getItem('outil-sonde') === 'x');
      const n = await s.page.evaluate(() => localStorage.length);
      sortie('  sonde du profil gardé (' + v.nom + ') : clé relue après réouverture : ' + (lu ? 'oui' : 'non') + ' ; clés retrouvées : ' + n);
    } catch (x) { sortie('  sonde du profil gardé (' + v.nom + ') : arrêtée à l\'étape « ' + ETAPE + ' » : ' + premiereLigne(x)); }
    finally { if (s) { try { await s.ctx.close(); } catch (x) { /* déjà fermé */ } } fs.rmSync(profil, { recursive: true, force: true }); }
  }
}

/* ------------------------------------------------------------------ */
/* (h) captures de mise en page                                         */
/* ------------------------------------------------------------------ */
const VOULUES = [
  ['arrivee', (r) => r.cadre === 'arrivee'],
  ['1.8', (r) => r.ecran === '1.8' && !r.cadre],
  ['ligne-de-regle', (r) => r.ecran === 'deviner' && !r.cadre],
  ['graphique', (r) => r.escaliers && r.escaliers.length > 0],
  ['page-du-saut-1', (r) => r.cadre === 'saut' && r.k === 4],
  ['rattrapage', (r) => r.ecran === 'ratt-position' && !r.cadre],
  ['rattrapage-2.5', (r) => r.ecran === 'ratt-attente' && !r.cadre],
  ['page-du-saut-2', (r) => r.cadre === 'saut' && r.k === 8],
  ['barre', (r) => r.barresPortrait > 0 && r.ecran === 'moi-portrait'],
  ['titres-passes', (r) => r.ecran === 'titres-passes' && !r.cadre],
  ['cercle', (r) => r.ecran === 'cercle' && !r.cadre],
  ['deux-lettres', (r) => r.ecran === 'cercle' && !r.cadre && /(^|\n)An(\n|$)/.test((r.tel || '').split(/Où chacun se place|OÙ CHACUN SE PLACE/i)[1] || '')],
  ['proche', (r) => r.ecran === 'proche' && !r.cadre],
  ['carnet-du-jour', (r) => r.cadre === 'carnet'],
  ['devoilement', (r) => r.cadre === 'devoilement']
];
async function verifierMiseEnPage(s, nom) {
  return s.page.evaluate((nom) => {
    const pb = [];
    const W = innerWidth, H = innerHeight;
    if (document.documentElement.scrollWidth > W + 1) { pb.push('défilement horizontal de la page (' + document.documentElement.scrollWidth + ' > ' + W + ')'); }
    if (document.scrollingElement.scrollHeight > H + 1) { pb.push('la page elle-même défile (' + document.scrollingElement.scrollHeight + ' > ' + H + ')'); }
    document.querySelectorAll('#app *').forEach((x) => {
      if (x.closest('[hidden]') || !x.childNodes.length) { return; }
      const propre = Array.from(x.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!propre) { return; }
      const r = x.getBoundingClientRect(); if (!r.width) { return; }
      if (r.right > W + 1 || r.left < -1) { pb.push('texte hors de l\'écran : « ' + x.textContent.trim().slice(0, 40) + ' »'); }
      if (getComputedStyle(x).overflowX === 'visible' && x.scrollWidth > x.clientWidth + 1 && x.clientWidth > 0 && getComputedStyle(x).display !== 'inline') { pb.push('texte qui déborde de sa boîte : « ' + x.textContent.trim().slice(0, 40) + ' » (' + x.scrollWidth + ' > ' + x.clientWidth + ')'); }
    });
    if (nom === 'titres-passes') {
      const defile = Array.from(document.querySelectorAll('.telephone *')).some((x) => /auto|scroll/.test(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight + 1);
      if (!defile) { pb.push('la liste des titres passés ne défile pas dans l\'écran du jeu (ou tient sans défiler)'); }
    }
    if (nom === 'deux-lettres') {
      const marques = Array.from(document.querySelectorAll('.telephone *')).filter((x) => x.children.length === 0 && /^[A-ZÀ-Ý][a-zà-ÿ]$/.test(x.textContent.trim()));
      if (!marques.length) { pb.push('aucune marque à deux lettres sur un curseur'); }
      marques.forEach((x) => { if (x.scrollWidth > x.clientWidth + 1) { pb.push('deux lettres qui débordent de leur marque (« ' + x.textContent + ' »)'); } });
    }
    return [...new Set(pb)].slice(0, 12);
  }, nom);
}
async function pointH() {
  const nav = NAVIGATEUR;
  dire('(h) mise en page');
  const rapportH = [];
  for (const appareil of ['iphone15', 'se', 'ipad']) {
    for (const sombre of [false, true]) {
      const dossier = path.join(dCaptures, appareil + (sombre ? '-sombre' : '-clair'));
      fs.mkdirSync(dossier, { recursive: true });
      const s = await O.ouvrir(nav, c, { appareil, sombre });
      const pris = new Set();
      let i = 0;
      const prendre = async (r) => {
        for (const [nom, f] of VOULUES) {
          if (pris.has(nom) || !f(r)) { continue; }
          pris.add(nom);
          await s.page.waitForTimeout(nom === 'graphique' ? 400 : 60);
          // La forme à juger est amenée au milieu de l'écran du jeu (défilement par l'outil, sans toucher).
          await s.page.evaluate((nom) => {
            let x = null;
            if (nom === 'graphique') { x = document.querySelector('.escalier'); }
            else if (nom === 'barre') { x = document.querySelector('.barre-zone'); }
            else if (nom === 'deux-lettres') { const l = Array.from(document.querySelectorAll('.telephone *')).filter((y) => y.children.length === 0 && y.textContent.trim() === 'An'); x = l[l.length - 1] || null; }
            if (x) { x.scrollIntoView({ block: 'center' }); }
          }, nom);
          await s.page.waitForTimeout(60);
          await s.page.screenshot({ path: path.join(dossier, String(++i).padStart(2, '0') + '-' + nom + '.png') });
          const pb = await verifierMiseEnPage(s, nom);
          rapportH.push((pb.length ? 'ÉCART ' : 'passé ') + appareil + (sombre ? ' sombre' : ' clair') + ' · ' + nom + (pb.length ? ' : ' + pb.join(' ; ') : ''));
          if (pb.length) { ecarts++; }
        }
      };
      await JO.jouer(s, { graine: 600 + (appareil.length * 7) + (sombre ? 1 : 0), pseudo: 'Antoine', voie: 'email', visitesCompletes: true, annulerSaut: { 1: true }, trancher: { S: 1, P: 0, T: 1, L: 0 } }, { apres: async (ss, r) => prendre(r) });
      const manquent = VOULUES.map((x) => x[0]).filter((x) => !pris.has(x));
      rapportH.push((manquent.length ? 'ÉCART ' : 'passé ') + appareil + (sombre ? ' sombre' : ' clair') + ' : écrans capturés ' + pris.size + '/' + VOULUES.length + (manquent.length ? ' (manquent : ' + manquent.join(', ') + ')' : ''));
      if (manquent.length) { ecarts++; }
      await s.ctx.close();
    }
  }
  rapportH.forEach((x) => lignes.push('(h) ' + x));
}

/* ------------------------------------------------------------------ */
/* (i) durées, horloge de l'outil                                       */
/* ------------------------------------------------------------------ */
async function pointI() {
  dire('(i) durées');
  await scenario('i', 'durées à l\'horloge de l\'outil', async (ouvrir) => {
  const DELTA = 3000, PAUSE = 10 * 60 * 1000;
  const debut = Date.UTC(2026, 9, 19, 16, 0);
  const s = await ouvrir({ horloge: true, heure: debut, aller: false });
  etape('horloge de l\'outil arrêtée, chargement');
  await s.ctx.clock.pauseAt(debut + 1000);
  await s.page.goto(O.ADRESSE);
  let F = 0;
  const plan = {
    graine: 700, pseudo: 'Zoé', voie: 'apple', horloge: true, annulerSaut: { 1: true },
    fermetures: [{ saut: 1, ecran: 'ratt-raison', rang: 2, ms: PAUSE }, { saut: 2, ecran: 'ratt-position', rang: 4, ms: PAUSE }],
    recharges: [{ saut: 1, ecran: 'ratt-position', rang: 3 }, { saut: 2, ecran: 'ratt-raison', rang: 5 }],
    pause: async (ss, info) => { await ss.ctx.clock.fastForward(DELTA); F += DELTA; info.F = F; if (DIAG && info.n % 25 === 0) { etape('partie à l\'horloge de l\'outil, geste ' + info.n); } }
  };
  etape('partie à l\'horloge de l\'outil');
  const r = await JO.jouer(s, plan);
  etape('lecture des durées');
  const durees = await s.page.evaluate(() => window.ElenchosEssai.durees());
  const jv = await O.journalValide(s, false);
  ok('i', 'partie à l\'horloge de l\'outil, deux fermetures de l\'app et deux rechargements pendant les rattrapages : journal valide', jv.erreurs.length === 0, jv.erreurs.slice(0, 3).join(' | '));
  const G = r.gestes;
  const unite = (ms) => ms / 1000; // durées en secondes entières
  [1, 2].forEach((numero) => {
    const confirmes = G.map((g, i) => [g, i]).filter(([g]) => g.a === 'saut-confirmer');
    const [gc, ic] = confirmes[numero - 1];
    let io = ic - 1; while (io >= 0 && !['rev-jouer', 'ouvrir-saut'].includes(G[io].a)) { io--; }
    const ifin = G.findIndex((g, i) => i > ic && g.a === 'aller-au-dimanche');
    const total = numero === 1 ? 3 : 6;
    const attendu = { duree_page: unite(gc.F - G[io].F), duree_saut: unite(G[ifin].F - G[io].F), durees_textes: [] };
    let iaff = ic;
    for (let rg = 1; rg <= total; rg++) {
      const iv = G.findIndex((g, i) => i > iaff && g.a === 'ratt-valider');
      attendu.durees_textes.push(unite(G[iv].F - G[iaff].F));
      if (rg < total) { iaff = G.findIndex((g, i) => i > iv && g.a === 'texte-suivant'); }
    }
    const lu = durees.sauts.find((x) => x.numero === numero);
    const fer = G.filter((g) => g.special === 'fermeture');
    ok('i', 'saut ' + numero + ' : durée du saut, dont la page du saut, et durée de chaque texte du rattrapage (une fermeture de 10 min et un rechargement au milieu)',
      lu && lu.duree_page === attendu.duree_page && lu.duree_saut === attendu.duree_saut && JSON.stringify(lu.durees_textes) === JSON.stringify(attendu.durees_textes),
      'attendu ' + JSON.stringify(attendu) + ' ; lu ' + JSON.stringify(lu) + ' ; fermetures aux gestes ' + fer.map((g) => g.n).join(', '),
      !lu ? '/sauts/' + (numero - 1) : ['duree_page', 'duree_saut'].filter((x) => lu[x] !== attendu[x]).map((x) => '/sauts/' + (numero - 1) + '/' + x)
        .concat(attendu.durees_textes.map((v, i2) => (lu.durees_textes || [])[i2] === v ? null : '/sauts/' + (numero - 1) + '/durees_textes/' + i2).filter(Boolean)).join(' ; '));
  });
  // Jour 4 : la durée de la séance s'arrête à l'ouverture de la page du saut que « Avancer au dimanche » confirme.
  const ic1 = G.findIndex((g) => g.a === 'saut-confirmer');
  let io1 = ic1 - 1; while (io1 >= 0 && !['rev-jouer', 'ouvrir-saut'].includes(G[io1].a)) { io1--; }
  const ideb4 = G.findIndex((g) => g.k === 4 && g.a);
  ok('i', 'jour 4 : la séance s\'arrête à l\'ouverture de la page du saut confirmée (la page quittée par « Annuler » compte dans le jour)',
    durees.jours['4'].duree_seance === unite(G[io1].F - G[ideb4].F), 'attendu ' + unite(G[io1].F - G[ideb4].F) + ', lu ' + durees.jours['4'].duree_seance, '/jours/4/duree_seance');
  if (dTemoins) {
    const d = path.join(dTemoins, 'ecran-durees-fermeture');
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'journal.json'), N.jsonCanonique(jv.journal));
    fs.writeFileSync(path.join(d, 'durees.json'), N.jsonCanonique(durees));
    fs.writeFileSync(path.join(d, 'copies.json'), JSON.stringify(await s.page.evaluate(() => window.ElenchosEssai.copies()), null, 1) + '\n');
    const carnet = await s.page.evaluate(() => window.ElenchosEssai.carnet());
    if (carnet) { fs.writeFileSync(path.join(d, 'carnet.txt'), carnet); }
    fs.writeFileSync(path.join(d, 'gestes.json'), JSON.stringify(r.gestes, null, 1) + '\n');
    fs.writeFileSync(path.join(d, 'plan.json'), JSON.stringify(Object.assign({ appareil: 'iphone15', sombre: false, delta_ms: DELTA, pause_ms: PAUSE }, plan, { pause: 'horloge de l\'outil : +3 s avant chaque geste' }), null, 1) + '\n');
  }
  });
}

/* ------------------------------------------------------------------ */
/* (j) performance, Chromium ralenti quatre fois                         */
/* ------------------------------------------------------------------ */
const MESURE = `(function () {
  var M = { app: null, secoursCache: null, evts: [] }; Object.defineProperty(window, '__perf', { value: M, enumerable: false });
  new MutationObserver(function () {
    if (M.app === null && document.getElementById('app')) { M.app = performance.now(); }
    var s = document.getElementById('vue-secours'); if (s && M.secoursCache === null && s.hidden) { M.secoursCache = performance.now(); }
  }).observe(document, { subtree: true, childList: true, attributes: true });
  try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) {
    if (/^(click|pointerdown|pointerup|keydown|input)$/.test(e.name)) { M.evts.push({ n: e.name, t: Math.round(e.startTime), proc: Math.round(e.processingEnd - e.processingStart), duree: Math.round(e.duration) }); }
  }); }).observe({ type: 'event', durationThreshold: 16, buffered: true }); } catch (x) {}
})();`;
async function pointJ() {
  const nav = NAVIGATEUR;
  dire('(j) performance (Chromium ralenti quatre fois)');
  const chargements = [], histoires = [];
  for (let i = 0; i < 3; i++) {
    const s = await O.ouvrir(nav, c, { ralenti: 4, scriptsInit: [MESURE], aller: false });
    await s.page.goto(O.ADRESSE, { waitUntil: 'load' });
    await s.page.waitForTimeout(300);
    const m = await s.page.evaluate(() => ({ app: window.__perf.app, cache: window.__perf.secoursCache }));
    chargements.push(Math.round(m.app));
    const h = await s.page.evaluate(() => { const t = performance.now(); window.ElenchosEssai.histoire(); return performance.now() - t; });
    histoires.push(Math.round(h));
    await s.ctx.close();
  }
  const med = (l) => l.slice().sort((a, b) => a - b)[Math.floor(l.length / 2)];
  ok('j', 'calcul de l\'histoire (budget 1 s) : ' + histoires.join(', ') + ' ms', Math.max(...histoires) <= 1000, 'médiane ' + med(histoires) + ' ms');
  ok('j', 'chargement entier, de la navigation au premier écran (à comparer aux 2 s de la vue de secours) : ' + chargements.join(', ') + ' ms', Math.max(...chargements) < 2000, 'médiane ' + med(chargements) + ' ms');
  // Temps par geste sur une partie entière, la plus longue des parties jouées (visites comprises).
  const s = await O.ouvrir(nav, c, { ralenti: 4, scriptsInit: [MESURE] });
  const parGeste = [];
  let vus = 0;
  const r = await JO.jouer(s, { graine: 800, pseudo: 'Zoé', voie: 'email', visitesCompletes: true, croix: { 2: true, 7: true }, revoir: { 3: true }, annulerSaut: { 1: true, 2: true } }, {
    apres: async (ss, rr, x) => {
      await ss.page.waitForTimeout(20);
      const l = await ss.page.evaluate(() => window.__perf.evts.length);
      const nouveaux = await ss.page.evaluate((v) => window.__perf.evts.slice(v), vus);
      vus = l;
      const proc = nouveaux.filter((y) => y.n === 'click' || y.n === 'pointerup' || y.n === 'pointerdown').reduce((m, y) => Math.max(m, y.proc), 0);
      parGeste.push({ geste: x.a, jour: rr.k, ecran: rr.ecran || rr.cadre, traitement: proc });
    }
  });
  const ev = await s.page.evaluate(() => window.__perf.evts);
  const lentsG = parGeste.filter((g) => g.traitement > 100);
  const parAction = {};
  parGeste.forEach((g) => { parAction[g.geste] = Math.max(parAction[g.geste] || 0, g.traitement); });
  dire('(j) traitement le plus long par sorte de geste (ms) : ' + Object.keys(parAction).sort((a, b) => parAction[b] - parAction[a]).slice(0, 10).map((k) => k + ' ' + parAction[k]).join(', '));
  if (lentsG.length) { dire('(j) gestes au-delà de 100 ms : ' + lentsG.map((g) => g.geste + ' (jour ' + g.jour + ', ' + g.ecran + ') ' + g.traitement + ' ms').join(' ; ')); }
  const traitement = ev.map((x) => x.proc).sort((a, b) => a - b);
  const max = traitement.length ? traitement[traitement.length - 1] : 0;
  const p95 = traitement.length ? traitement[Math.floor(traitement.length * 0.95)] : 0;
  const lents = ev.filter((x) => x.proc > 100);
  ok('j', 'temps par geste (budget 100 ms) sur une partie entière de ' + r.gestes.length + ' gestes : ' + ev.length + ' évènements de plus de 16 ms, traitement max ' + max + ' ms, 95e centile ' + p95 + ' ms', lents.length === 0,
    lents.slice(0, 8).map((x) => x.n + ' ' + x.proc + ' ms').join(', '));
  fs.writeFileSync(path.join(dRapports, 'controle14j-evenements.json'), JSON.stringify({ chargements, histoires, evenements: ev }, null, 1));
  await s.ctx.close();
}

(async () => {
  NAVIGATEUR = await O.lancer(TYPE);
  let version = 'inconnue';
  try { version = require(path.join(process.env.ELENCHOS_PLAYWRIGHT || '/opt/node-tools/node_modules/playwright-core', 'package.json')).version; } catch (x) { /* inconnue */ }
  if (DIAG) { sortie('diagnostic : ' + TYPE + ' (Playwright ' + version + '), ' + process.platform + ' ' + os.release() + ' ' + os.arch()); await sondeProfil(); }
  try {
    if (POINTS.includes('b') || POINTS.includes('d')) { await pointB(); }
    if (POINTS.includes('h')) { await pointH(); }
    if (POINTS.includes('i')) { await pointI(); }
    if (POINTS.includes('j')) { await pointJ(); }
  } catch (x) { ecarts++; lignes.push('ÉCHEC : ' + String(x && x.stack || x).slice(0, 2000)); sortie('ÉCART : arrêt du contrôle à l\'étape « ' + ETAPE + ' »'); }
  await NAVIGATEUR.close();
  const t = 'Contrôle 14 à l\'écran (' + POINTS.join(', ') + '), ' + TYPE + ' (Playwright ' + version + ')\n' +
    'Construction : ' + c.fichier + ' (SHA-256 ' + N.sha256(new Uint8Array(fs.readFileSync(c.fichier))) + ')\n' +
    'Page du premier essai : ' + fPremier + ' (SHA-256 ' + N.sha256(new Uint8Array(fs.readFileSync(fPremier))) + ')\n\n' + lignes.join('\n') + '\n\n' + (ecarts ? 'RÉSULTAT : ' + ecarts + ' écart(s)' : 'RÉSULTAT : aucun écart') + '\n';
  fs.writeFileSync(path.join(dRapports, 'rapport-controle14-ecran-' + POINTS.join('') + (TYPE === 'chromium' ? '' : '-' + TYPE) + '.txt'), t);
  if (SOBRE) { sortie((DIAG ? 'diagnostic ' : '') + (ecarts ? 'échoué' : 'réussi') + ' (' + TYPE + ', Playwright ' + version + ')'); }
  else { console.log(t.split('\n').filter((x) => /^(ÉCART|ÉCHEC|RÉSULTAT|\(h\) ÉCART)/.test(x)).join('\n')); }
  process.exit(ecarts ? 1 : 0);
})();
