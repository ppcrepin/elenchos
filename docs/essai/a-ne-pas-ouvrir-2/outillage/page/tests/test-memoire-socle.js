/* Tests de la mémoire et du départ de la page (second essai, lot 1) :
 * clés `partie-2` et `verif-2`, partie du premier essai repérée par la seule
 * liste des clés, ordre du chargement (contexte, V1 à V6, mémoire, M1,
 * ancienne partie), arrêts 2 et 3, geste d'un bloc. Navigateur simulé. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const E = require('../etat.js');
const Me = require('../memoire.js');
const S = require('../socle.js');

const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const PREMIER = path.join(__dirname, '..', '..', '..', '..', 'a-ne-pas-ouvrir', 'fichier-scelle.json');
const base = JSON.parse(fs.readFileSync(SCELLE, 'utf8'));
const cal = C.lire(JSON.parse(fs.readFileSync(SCELLE, 'utf8')));

/** Faux localStorage : ordre d'insertion, espion des lectures de contenu. */
class Stockage {
  constructor(init) { this.m = new Map(Object.entries(init || {})); this.lus = []; this.refus = false; }
  get length() { return this.m.size; }
  key(i) { return i < this.m.size ? [...this.m.keys()][i] : null; }
  getItem(k) { this.lus.push(k); return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { if (this.refus) { throw new Error('QuotaExceededError'); } this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}

const RESUME = { format: 'elenchos-essai-resume-histoire', version: 1, tirage: 1 };
/** Moteur simulé : histoire() et resume() rendent un résumé fixe (le vrai arrive au lot 2). */
const moteurFaux = { histoire: () => ({ resume: RESUME }), resume: (a) => a.resume, calculer: () => ({}) };

function b64(objet) { return N.base64Encoder(N.utf8Encoder(N.jsonCanonique(objet))); }
function scelleAvecResume(modif) {
  const s = JSON.parse(JSON.stringify(base));
  s.histoire.resume_sha256 = N.sha256(N.utf8Encoder(N.jsonCanonique(RESUME)));
  if (modif) { modif(s); }
  return s;
}

function env(opts) {
  const o = opts || {};
  const appels = [];
  const st = o.stockage || new Stockage();
  const w = {
    navigator: Object.assign({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', maxTouchPoints: 5, standalone: true }, o.navigator || {}),
    matchMedia: () => ({ matches: false }), localStorage: st, addEventListener: () => {}, location: { reload: () => appels.push(['recharge']) }
  };
  w.self = w; w.top = o.cadre ? {} : w;
  let t = 0;
  const ecrans = {
    rendre: () => appels.push(['rendre']), arret: (n, r, info) => appels.push(info === undefined ? ['arret', n, r] : ['arret', n, r, info]), hors: (x) => appels.push(['hors', x]),
    ancienne: (x) => appels.push(['ancienne', x.deuxParties]), actions: {}
  };
  const socle = S.creer({
    window: w, document: { visibilityState: 'visible', addEventListener: () => {} }, performance: { now: () => (t += 250) },
    maintenantMs: () => Date.UTC(2026, 9, 19, 16, 0), version: 1,
    scelleB64: o.scelleB64 || b64(scelleAvecResume()), moteur: o.moteur || moteurFaux
  });
  return { socle, st, appels, ecrans, demarrer: () => socle.demarrer(ecrans) };
}

test('Contexte : hors de l\'icône, rien n\'est vérifié ni écrit (§8.13)', () => {
  const ordi = env({ navigator: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', maxTouchPoints: 0, standalone: undefined } });
  assert.equal(ordi.demarrer(), 'hors');
  assert.deepEqual(ordi.appels, [['hors', 'ailleurs']]);
  assert.equal(ordi.st.length, 0);
  assert.equal(env({ navigator: { standalone: false } }).demarrer(), 'hors');
  const chrome = env({ navigator: { standalone: false, userAgent: 'Mozilla/5.0 (iPhone) CriOS/120' } });
  chrome.demarrer();
  assert.deepEqual(chrome.appels, [['hors', 'autre']]);
  const cadre = env({ cadre: true });
  cadre.demarrer();
  assert.deepEqual(cadre.appels, [['hors', 'ailleurs']]);
});

test('Nouvelle partie : `partie-2` écrite d\'un bloc, `verif-2` effacée, aucune autre clé', () => {
  const x = env();
  assert.equal(x.demarrer(), 'nouvelle');
  assert.deepEqual(x.appels, [['rendre']]);
  assert.deepEqual([...x.st.m.keys()], ['elenchos-essai:partie-2']);
  const o = JSON.parse(x.st.m.get('elenchos-essai:partie-2'));
  assert.equal(o.format, 2);
  assert.equal(o.ecritures, 1);
  assert.deepEqual(Object.keys(o.jours), ['1']);
  // Rechargée, la partie reprend.
  const y = env({ stockage: x.st });
  assert.equal(y.demarrer(), 'reprise');
  assert.equal(y.socle.etat().ecritures, 1);
});

test('Vérifications du chargement : V2, V4 (version, table), V5, V6', () => {
  const cas = [
    ['V2', { scelleB64: 'abc' }],
    ['V4', { scelleB64: N.base64Encoder(new Uint8Array(fs.readFileSync(PREMIER))) }], // le fichier du premier essai (version 4)
    ['V4', { scelleB64: b64(scelleAvecResume(s => { s.calendrier[5].revele = '2'; })) }],
    ['V4', { scelleB64: N.base64Encoder(N.utf8Encoder(JSON.stringify(scelleAvecResume(), null, 1))) }], // pas canonique
    ['V5', { scelleB64: b64(scelleAvecResume(s => { s.vecteurs_test[1].n += 1; })) }],
    ['V6', { scelleB64: b64(base) }],                                                  // le résumé du moteur simulé n'est pas celui du fichier
    ['V6', { moteur: { calculer: () => ({}) } }],                                     // moteur sans histoire (lot 1)
    ['V6', { moteur: { histoire: () => { throw new Error('calcul'); }, resume: () => RESUME } }]
  ];
  for (const [repere, o] of cas) {
    const x = env(o);
    assert.equal(x.demarrer(), 'arret', repere);
    assert.deepEqual(x.appels, [['arret', 1, repere, { partieLisible: false }]], repere); // aucune partie gardée
    assert.equal(x.st.length, 0, repere + ' : rien d\'écrit');
  }
  // L'état à l'arrivée est gelé en profondeur et n'est jamais écrit en mémoire.
  const x = env();
  x.demarrer();
  assert.ok(Object.isFrozen(x.socle.arrivee()) && Object.isFrozen(x.socle.arrivee().resume));
  assert.ok(!x.st.m.get('elenchos-essai:partie-2').includes('elenchos-essai-resume-histoire'));
});

test('V6 avec le vrai moteur (lot 2) : l\'histoire du fichier de test passe ; une réponse scellée changée l\'arrête', () => {
  const M = require('../moteur.js');
  const x = env({ scelleB64: b64(base), moteur: M });
  assert.equal(x.demarrer(), 'nouvelle');
  const arr = x.socle.arrivee();
  assert.ok(Object.isFrozen(arr) && Object.isFrozen(arr.titres[0].devin.points) && Object.isFrozen(arr.curseurs.Agathe.S.c));
  assert.throws(() => { 'use strict'; arr.titres[0].devin.titulaire = 'Odile'; });
  assert.ok(!x.st.m.get('elenchos-essai:partie-2').includes('elenchos-essai-resume-histoire'));
  // Lot 3 : les résultats du moteur sur la partie neuve (jour d'arrivée, rien de joué) ; les cartes à servir existent déjà.
  const R = x.socle.resultats();
  assert.equal(R.K, cal.premier);
  assert.ok(R.jours[String(cal.premier)].cartes_porteur.cartes.length >= 2);
  assert.equal(R.jours[String(cal.premier)].entree, null); // 1.2 pas encore affiché
  // Une seule réponse de l'histoire changée (niveau d'un personnage présent au premier texte) : V6.
  const autre = JSON.parse(JSON.stringify(base));
  const h = Object.keys(autre.histoire.textes).filter(t => autre.histoire.textes[t].jour === cal.semaines[0].premier_jour)[0];
  const p = Object.keys(autre.reponses[h])[0];
  autre.reponses[h][p].niveau = autre.reponses[h][p].niveau === 5 ? 1 : 5;
  const y = env({ scelleB64: b64(autre), moteur: M });
  assert.equal(y.demarrer(), 'arret');
  assert.deepEqual(y.appels, [['arret', 1, 'V6', { partieLisible: false }]]);
  assert.equal(y.st.length, 0);
});

test('Arrêt V : `partieLisible` lu en lecture seule dans `partie-2` (forme sans calendrier), jamais dans la clé du premier essai', () => {
  // Une partie gardée valide, puis un fichier scellé refusé en V4 : partieLisible vrai, rien de changé.
  const x = env();
  x.demarrer();
  const st = x.st;
  st.m.set('elenchos-essai:partie', 'ancien');
  const avant = JSON.stringify([...st.m.entries()]);
  st.lus = [];
  const y = env({ stockage: st, scelleB64: b64(scelleAvecResume(s => { s.calendrier[5].revele = '2'; })) });
  assert.equal(y.demarrer(), 'arret');
  assert.deepEqual(y.appels, [['arret', 1, 'V4', { partieLisible: true }]]);
  assert.equal(JSON.stringify([...st.m.entries()]), avant, 'aucune clé ni compteur changé');
  assert.deepEqual(st.lus, ['elenchos-essai:partie-2']);
  // Partie gardée abîmée : faux, et toujours rien d'écrit.
  for (const abime of ['{', JSON.stringify({ format: 2, ecritures: 0, horloge: 0, jours: {}, sauts: [], vue: {} }), JSON.stringify({ format: 2, ecritures: -1, horloge: 0, jours: { 1: {} }, sauts: [], vue: {} })]) {
    const st2 = new Stockage({ 'elenchos-essai:partie-2': abime });
    const z = env({ stockage: st2, scelleB64: b64(scelleAvecResume(s => { s.vecteurs_test[1].n += 1; })) });
    z.demarrer();
    assert.deepEqual(z.appels, [['arret', 1, 'V5', { partieLisible: false }]], abime);
    assert.equal(st2.m.get('elenchos-essai:partie-2'), abime);
  }
  // M1, arrêts 2 et 3 : pas de troisième argument (voir les autres tests).
});

test('Mémoire refusée : arrêt 2 ; partie illisible : arrêt 1 (M1), rien n\'est effacé ni réécrit', () => {
  const st = new Stockage(); st.refus = true;
  const x = env({ stockage: st });
  assert.equal(x.demarrer(), 'arret');
  assert.deepEqual(x.appels, [['arret', 2, null]]);
  for (const abime of ['{', '{"format":1}', JSON.stringify({ format: 2, ecritures: 0 })]) {
    const st2 = new Stockage({ 'elenchos-essai:partie-2': abime, 'elenchos-essai:partie': 'ancien' });
    const y = env({ stockage: st2 });
    assert.equal(y.demarrer(), 'arret');
    assert.deepEqual(y.appels, [['arret', 1, 'M1']]);
    assert.equal(st2.m.get('elenchos-essai:partie-2'), abime);
    assert.ok(st2.m.has('elenchos-essai:partie'));
  }
});

test('Partie du premier essai : repérée par la seule liste des clés, jamais lue, effacée avec ses traces (§8.2 A, §8.8)', () => {
  const st = new Stockage({ 'elenchos-essai:partie': '{"secret":"réponses du premier essai"}', 'elenchos-essai:verif': 'x', 'elenchos-essai:sonde-icone': 'y', 'autre-site': 'z' });
  const x = env({ stockage: st });
  assert.equal(x.demarrer(), 'ancienne');
  assert.deepEqual(x.appels, [['ancienne', false]]);
  assert.ok(!st.m.has('elenchos-essai:partie-2'), 'rien n\'est écrit tant qu\'elle est là');
  const lus = st.lus.filter(k => k !== 'elenchos-essai:partie-2' && k !== 'elenchos-essai:verif-2');
  assert.deepEqual(lus, [], 'aucune autre clé lue');
  assert.equal(x.socle.effacerAncienne(), 'nouvelle');
  assert.deepEqual([...st.m.keys()].sort(), ['autre-site', 'elenchos-essai:partie-2']);
  assert.deepEqual(st.lus.filter(k => k !== 'elenchos-essai:partie-2' && k !== 'elenchos-essai:verif-2'), []);
});

test('Les deux parties à la fois : même page ; `partie-2` n\'est pas touchée et la partie reprend à son étape', () => {
  const premier = env();
  premier.demarrer();
  const gardee = premier.st.m.get('elenchos-essai:partie-2');
  premier.st.m.set('elenchos-essai:partie', 'ancien');
  const x = env({ stockage: premier.st });
  assert.equal(x.demarrer(), 'ancienne');
  assert.deepEqual(x.appels, [['ancienne', true]]);
  assert.equal(x.socle.effacerAncienne(), 'reprise');
  assert.equal(x.st.m.get('elenchos-essai:partie-2'), gardee);
  assert.ok(!x.st.m.has('elenchos-essai:partie'));
});

test('Geste : une transition, une écriture ; une transition refusée n\'écrit rien ; arrêt 3 si la page est ouverte deux fois', () => {
  const x = env();
  x.demarrer();
  const avant = x.st.m.get('elenchos-essai:partie-2');
  x.socle.geste((e, h) => { E.afficherEntree(e, x.socle.cal(), h); E.consentir(e, x.socle.cal()); });
  const o = JSON.parse(x.st.m.get('elenchos-essai:partie-2'));
  assert.equal(o.ecritures, 2);
  assert.equal(o.jours[1].coups.consentement, true);
  assert.ok(o.jours[1].pp.entreeDebut > 0);
  assert.ok(o.horloge > 0, 'l\'horloge de premier plan avance');
  const ecrit = x.st.m.get('elenchos-essai:partie-2');
  assert.throws(() => x.socle.geste((e) => { E.consentir(e, x.socle.cal()); E.parierEntree(e, x.socle.cal(), 'E1', 3); }), /tour/);
  assert.equal(x.st.m.get('elenchos-essai:partie-2'), ecrit, 'rien d\'écrit');
  assert.equal(x.socle.etat().jours[1].coups.entree.E1.pari, null, 'rien de changé en mémoire vive');
  assert.notEqual(avant, ecrit);
  // Une autre page écrit entre-temps : arrêt 3.
  const autre = JSON.parse(ecrit); autre.ecritures += 1;
  x.st.m.set('elenchos-essai:partie-2', JSON.stringify(autre));
  x.socle.geste((e) => { E.compter(e, x.socle.cal(), 'moi'); });
  assert.deepEqual(x.appels.slice(-1), [['arret', 3, null]]);
  // Après un arrêt technique, plus rien ne s'écrit.
  x.socle.geste((e) => { E.compter(e, x.socle.cal(), 'moi'); });
  assert.equal(JSON.parse(x.st.m.get('elenchos-essai:partie-2')).ecritures, autre.ecritures);
});

test('« Tout effacer » : toutes les clés « elenchos-essai: », et elles seules', () => {
  const st = new Stockage({ 'elenchos-essai:partie': 'a', 'autre': 'b', 'elenchos-essai:sonde-icone': 'c' });
  const x = env({ stockage: st });
  x.demarrer();
  x.socle.effacerAncienne();
  st.m.set('elenchos-essai:verif', 'd');
  x.socle.toutEffacer();
  assert.deepEqual([...st.m.keys()], ['autre']);
  x.socle.geste((e) => { E.compter(e, x.socle.cal(), 'moi'); });
  assert.deepEqual([...st.m.keys()], ['autre'], 'après « Tout effacer », plus rien ne s\'écrit');
});

test('Relevé des clés et écriture (memoire.js) sans socle', () => {
  const st = new Stockage({ 'elenchos-essai:partie-2': '1', 'elenchos-essai:sonde-icone': '2', 'x': '3' });
  assert.deepEqual(Me.releverCles(st), { ancienne: false, partie2: true, restes: ['elenchos-essai:sonde-icone'] });
  assert.deepEqual(st.lus, []);
  assert.equal(Me.memoireMarche(st, 'jeton'), true);
  assert.ok(!st.m.has('elenchos-essai:verif-2'));
  const e = E.nouvelEtat(cal);
  const st2 = new Stockage();
  assert.equal(Me.ecrire(st2, e, o => E.verifierForme(o, cal)), 'ok');
  assert.equal(Me.ecrire(st2, e, o => E.verifierForme(o, cal)), 'ok');
  const e2 = JSON.parse(JSON.stringify(e)); e2.ecritures = 0;
  assert.equal(Me.ecrire(st2, e2, o => E.verifierForme(o, cal)), 'arret3');
  st2.refus = true;
  assert.equal(Me.ecrire(st2, e, o => E.verifierForme(o, cal)), 'arret2');
  assert.equal(e.ecritures, 2);
});
