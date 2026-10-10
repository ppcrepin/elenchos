/* Lot 7, part B : parties jouées par l'interface (cas d'écran de temoins/LISEZ-MOI.txt, arrêts aux
 * jours-seuils, parties au hasard), dans Chromium, sur les trois appareils, en clair et en sombre.
 *
 *   node tests/lot7/parties.js CONSTRUCTION SORTIE_TEMOINS DOSSIER_RELEVES [id,id,...]
 *
 * Pour chaque partie : SORTIE_TEMOINS/<id>/ journal.json, durees.json, carnet.txt (partie close),
 * copies.json, gestes.json, plan.json, verifications.txt ; DOSSIER_RELEVES/<id>.releve.json (écran par
 * écran), <id>.blocs.json (blocs de texte distincts), <id>.devoilement.json (panneaux affichés).
 * Les journaux sont validés (ElenchosJournal.valider) ; A les fait rejouer par C.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const O = require('./outils.js');
const JO = require('./joueur.js');
const X = require('../../textes.js');
const N = require('../../noyau.js');

const n = O.normaliser;

/* ------------------------------------------------------------------ */
/* Cas                                                                 */
/* ------------------------------------------------------------------ */

const APP = ['iphone15', 'se', 'ipad'];
function cas() {
  const l = [];
  const ajouter = (id, plan, appareil, sombre, verifier) => l.push({ id, plan, appareil, sombre: !!sombre, verifier: verifier || (() => []) });

  // Cas d'écran (LISEZ-MOI, « cas d'écran »).
  ajouter('ecran-pseudo-alphabet', { graine: 11, pseudosRefuses: ['Οdile', 'Vаlentin', 'Аgathe'], pseudo: 'Lou', voie: 'apple' }, 'iphone15', false, (r) => {
    const refus = r.releve.filter((x) => /^pseudo:/.test(x.action) && x.bande && n(x.bande).includes(n(X.notePrenom)));
    return [['trois pseudos d\'un autre alphabet refusés, message du prénom à l\'écran', refus.length === 3, refus.length + ' refus vus']];
  });
  ajouter('ecran-rond-deux-lettres', { graine: 12, pseudo: 'Antoine', voie: 'google', pVisite: 1 }, 'se', true, (r) => {
    const vu = r.releve.some((x) => x.ecran === 'cercle' && x.tel && /(^|\n)An(\n|$)/.test(x.tel));
    return [['rond « An » dans Le Cercle pour le pseudo « Antoine »', vu, '']];
  });
  ajouter('ecran-compte-apple', { graine: 13, pseudo: 'Mia', voie: 'apple' }, 'ipad', false);
  ajouter('ecran-compte-google', { graine: 14, pseudo: 'Noé', voie: 'google' }, 'iphone15', true);
  ajouter('ecran-compte-email', { graine: 15, pseudo: 'Inès', voie: 'email' }, 'se', false);
  ajouter('ecran-compte-email-plus-tard', { graine: 16, pseudo: 'Jo', voie: 'email_plus_tard' }, 'ipad', true);
  ajouter('ecran-rattrapage-recharge', { graine: 17, recharges: [{ saut: 1, ecran: 'ratt-position', rang: 2 }, { saut: 2, ecran: 'ratt-position', rang: 4 }, { saut: 2, ecran: 'ratt-attente', rang: 5 }] }, 'iphone15', false, (r) => {
    const apres = r.releve.filter((x) => x.action === 'rechargement').map((x) => ((x.barre || '') + '\n' + (x.tel || '')).replace(/[\u00a0\u202f]/g, ' '));
    return [['après chaque rechargement, le rattrapage reprend sur un texte du saut', apres.length === 3 && apres.every((t) => /saut · texte \d+ sur \d+/.test(t)), apres.map((t) => (/saut · texte \d+ sur \d+/.exec(t) || ['?'])[0]).join(' ; ')]];
  });
  ajouter('ecran-fermeture-app', { graine: 18, fermetures: [{ saut: 1, ecran: 'ratt-position', rang: 2 }, { saut: 2, ecran: 'ratt-raison', rang: 3 }] }, 'se', true, (r) => {
    const apres = r.releve.filter((x) => x.action === 'reouverture').map((x) => ((x.barre || '') + '\n' + (x.tel || '')).replace(/[\u00a0\u202f]/g, ' '));
    return [['après la fermeture de l\'app, le rattrapage reprend sur un texte du saut', apres.length === 2 && apres.every((t) => /saut · texte \d+ sur \d+/.test(t)), apres.map((t) => (/saut · texte \d+ sur \d+/.exec(t) || ['?'])[0]).join(' ; ')]];
  });
  ajouter('ecran-revelation-rouverte', { graine: 19, croix: { 2: true, 3: true, 7: true }, revoir: { 2: true, 14: true } }, 'ipad', false, (r) => {
    const j = r.journal;
    const rouv = [2, 3, 7].map((d) => j.jours[String(d)].coups.rouvrir || 0);
    return [['« Reprendre la révélation » touché aux jours 2, 3 et 7', rouv.every((x) => x >= 1), 'compteurs : ' + rouv.join(', ')]];
  });
  ajouter('ecran-abandon-dimanche', { graine: 20, abandons: { 7: 'revelation', 14: 'revelation' } }, 'iphone15', true, (r) => {
    const conf = r.releve.filter((x) => x.action === 'abandonner').map((x) => x.bande || '');
    return [['abandon des deux dimanches avant les titres, phrase de perte à l\'écran', conf.length === 2 && conf.every((t) => t.length > 40), conf.map((t) => t.length + ' signes').join(', ')],
      ['« Journée abandonnée » aux jours 7 et 14', [7, 14].every((d) => r.journal.jours[String(d)].coups.abandon !== null && r.journal.jours[String(d)].coups.abandon !== undefined), '']];
  });
  ajouter('ecran-abandons-jours', { graine: 21, abandons: { 1: 'deviner', 2: 'repondre', 3: 'deviner' }, annulerSaut: { 1: true, 2: true } }, 'se', false);

  // Arrêt à chaque jour-seuil, et pendant chaque saut.
  const arrets = [
    ['arret-j1-entree', { jour: 1, moment: 'entree' }], ['arret-j1-compte', { jour: 1, moment: 'compte' }], ['arret-j1-deviner', { jour: 1, moment: 'deviner' }],
    ['arret-j2-revelation', { jour: 2, moment: 'revelation' }], ['arret-j3-repondre', { jour: 3, moment: 'repondre' }], ['arret-j3-attente', { jour: 3, moment: 'attente' }],
    ['arret-j4-revelation', { jour: 4, moment: 'revelation' }], ['arret-j4-apres-annuler', { jour: 4, moment: 'apres-annuler' }], ['arret-saut1-texte2', { saut: 1, moment: 'ratt-2' }],
    ['arret-j7-deviner', { jour: 7, moment: 'deviner' }], ['arret-j8-apres-annuler', { jour: 8, moment: 'apres-annuler' }], ['arret-saut2-texte5', { saut: 2, moment: 'ratt-5' }],
    ['arret-j14-attente', { jour: 14, moment: 'attente' }]
  ];
  arrets.forEach(([id, a], i) => ajouter(id, { graine: 40 + i, arret: a, annulerSaut: { 1: true, 2: true } }, APP[i % 3], i % 2 === 1, (r) => {
    const j = r.journal;
    const jour = a.saut ? (a.saut === 1 ? 4 : 8) + (+a.moment.slice(5)) - 1 : a.jour;
    return [['arrêt écrit au jour ' + jour, !!j.arret && j.arret.jour === jour, JSON.stringify(j.arret)],
      ['carnet d\'arrêt exporté', !!r.carnet && /Essai arrêté/.test(r.carnet), '']];
  }));

  // Au moins dix parties au hasard, gestes au hasard compris.
  for (let i = 0; i < 12; i++) {
    const R = O.hasard(1000 + i);
    const plan = { graine: 1000 + i, pseudo: R.parmi(['Zoé', 'Anaïs', 'Paul', 'Léo', 'Agnès', 'Ana', 'Camille', 'Éva', 'Nina', 'Odon', 'Vic', 'Hugo']),
      pPasser: R() * 0.3, pRaison: R(), pRelire: R() * 0.3, pVisite: R() * 0.6, pVisiteDeviner: R() * 0.3, pChanger: R() * 0.1 };
    if (R.oui(0.4)) { plan.croix = { [R.parmi([2, 3, 7, 14])]: true }; }
    if (R.oui(0.3)) { plan.revoir = { [R.parmi([2, 3, 7])]: true }; }
    if (R.oui(0.35)) { plan.abandons = { [R.parmi([1, 2, 3, 7, 14])]: R.parmi(['revelation', 'deviner', 'repondre']) }; }
    if (R.oui(0.3)) { plan.annulerSaut = { 1: R.oui(0.5), 2: R.oui(0.5) }; }
    if (R.oui(0.3)) { plan.recharges = [{ jour: R.parmi([2, 3, 7]), ecran: R.parmi(['deviner', 'repondre', 'attente']) }]; }
    if (R.oui(0.15)) { const d = R.parmi([2, 3, 7, 8, 14]); plan.arret = { jour: d, moment: R.parmi(['revelation', 'attente']) }; }
    ajouter('hasard-ecran-' + String(i + 1).padStart(2, '0'), plan, APP[i % 3], i % 2 === 0);
  }
  return l;
}

/* ------------------------------------------------------------------ */
/* Une partie                                                          */
/* ------------------------------------------------------------------ */

async function devoilementAffiche(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.page-cadre .panneau')).map((sec) => {
    const t = sec.querySelector(':scope > h2, :scope > summary');
    const blocs = [];
    sec.querySelectorAll('p, pre').forEach((x) => { blocs.push({ type: x.tagName.toLowerCase(), texte: x.textContent }); });
    return { titre: t ? t.textContent : null, blocs };
  }));
}

/** Noms de groupes du fichier scellé (toutes les valeurs « groupe »), pour la règle de coupure du contrôle 11. */
function groupesDe(scelle) {
  const l = new Set();
  (function voir(x) { if (Array.isArray(x)) { x.forEach(voir); } else if (x && typeof x === 'object') { Object.keys(x).forEach((k) => { if (k === 'groupe' && typeof x[k] === 'string') { l.add(x[k]); } else { voir(x[k]); } }); } })(scelle);
  return [...l];
}

async function jouerUne(nav, construction, c, sortie, releves) {
  const s = await O.ouvrir(nav, construction, { appareil: c.appareil, sombre: c.sombre });
  const t0 = Date.now();
  const r = await JO.jouer(s, c.plan, { coupures: c.appareil === 'se', groupes: groupesDe(construction.scelle) });
  const ms = Date.now() - t0;
  const etat = await O.etat(s.page);
  const close = !!(etat.fin || etat.arret);
  const jv = await O.journalValide(s, !close);
  const durees = await s.page.evaluate(() => window.ElenchosEssai.durees());
  const carnet = await s.page.evaluate(() => window.ElenchosEssai.carnet());
  const copies = await s.page.evaluate(() => window.ElenchosEssai.copies());
  const dv = r.raisonFin === 'devoilement' ? await devoilementAffiche(s.page) : null;
  const dossier = path.join(sortie, c.id);
  fs.mkdirSync(dossier, { recursive: true });
  const ecrire = (f, x) => fs.writeFileSync(path.join(dossier, f), typeof x === 'string' ? x : JSON.stringify(x, null, 1) + '\n');
  // Journal et durées sous forme canonique (schéma, partie 4.4 ; le programme de contrôle la vérifie).
  ecrire('journal.json', N.jsonCanonique(jv.journal)); ecrire('durees.json', N.jsonCanonique(durees)); ecrire('copies.json', copies);
  if (carnet) { ecrire('carnet.txt', carnet); }
  ecrire('gestes.json', r.gestes);
  ecrire('plan.json', Object.assign({ appareil: c.appareil, sombre: c.sombre }, c.plan));
  fs.mkdirSync(releves, { recursive: true });
  fs.writeFileSync(path.join(releves, c.id + '.releve.json'), JSON.stringify(r.releve));
  fs.writeFileSync(path.join(releves, c.id + '.blocs.json'), JSON.stringify([...r.blocs.entries()]));
  if (dv) { fs.writeFileSync(path.join(releves, c.id + '.devoilement.json'), JSON.stringify(dv, null, 1)); }
  const res = { journal: jv.journal, durees, carnet, copies, releve: r.releve, gestes: r.gestes };
  const verifs = [['journal valide (règles 1 à 15)', jv.erreurs.length === 0, jv.erreurs.slice(0, 5).join(' | ')],
    ['aucune erreur de script, aucune requête sortante', s.erreurs.length === 0 && s.refusees.filter((u) => !/apple-touch-icon/.test(u)).length === 0, s.erreurs.concat(s.refusees).slice(0, 3).join(' | ')],
    ['partie menée au dévoilement', r.raisonFin === 'devoilement', r.raisonFin]].concat(c.verifier(res));
  ecrire('verifications.txt', verifs.map((v) => (v[1] ? 'passé ' : 'ÉCART ') + v[0] + (v[2] ? ' (' + v[2] + ')' : '')).join('\n') + '\n');
  await s.ctx.close();
  return { id: c.id, ms, gestes: r.gestes.length, verifs };
}

(async () => {
  const [, , dossierConstruction, sortie, releves, filtre] = process.argv;
  const construction = O.lireConstruction(dossierConstruction);
  const liste = cas().filter((c) => !filtre || filtre.split(',').some((f) => c.id === f || (f.endsWith('*') && c.id.startsWith(f.slice(0, -1)))));
  const nav = await O.lancer();
  let ecarts = 0;
  for (const c of liste) {
    try {
      const r = await jouerUne(nav, construction, c, sortie, releves);
      const ko = r.verifs.filter((v) => !v[1]);
      ecarts += ko.length;
      console.log((ko.length ? 'ÉCART ' : 'passé ') + c.id + ' (' + c.appareil + (c.sombre ? ', sombre' : '') + ') : ' + r.gestes + ' gestes, ' + Math.round(r.ms / 1000) + ' s' + (ko.length ? ' : ' + ko.map((v) => v[0] + ' ' + v[2]).join(' ; ') : ''));
    } catch (x) {
      ecarts++;
      console.log('ÉCHEC ' + c.id + ' : ' + String(x && x.message || x).slice(0, 1500));
    }
  }
  await nav.close();
  console.log(ecarts ? 'RÉSULTAT : ' + ecarts + ' écart(s)' : 'RÉSULTAT : aucun écart');
  process.exit(ecarts ? 1 : 0);
})();
