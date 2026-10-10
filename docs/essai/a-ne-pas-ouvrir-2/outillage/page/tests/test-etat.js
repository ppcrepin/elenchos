/* Tests de l'état, format 2, et du journal, version 4 (second essai, lot 1).
 * Parties jouées par les seules transitions d'etat.js (tests/partie-test.js),
 * puis journal vérifié par les règles de la partie 4.4 du schéma (journal.js). */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const J = require('../journal.js');
const E = require('../etat.js');
const P = require('./partie-test.js');

const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const OCTETS = new Uint8Array(fs.readFileSync(SCELLE));
const EMPREINTE = N.sha256(OCTETS);
const scelle = JSON.parse(N.utf8Decoder(OCTETS));
const cal = C.lire(scelle);
const opts = (x) => Object.assign({ empreinte: EMPREINTE, cartes: () => P.CARTES }, x || {});
const journalDe = (etat) => E.journal(etat, cal, EMPREINTE);
const ecarts = (etat, x) => J.valider(scelle, cal, journalDe(etat), opts(x));
const relire = (etat) => E.verifierForme(JSON.parse(JSON.stringify(etat)), cal);
const regles = (l) => [...new Set(l.map(x => +x.split(',')[0].slice(6)))].sort((a, b) => a - b);

test('Partie complète : entrée, trois jours, deux sauts et leurs rattrapages, deux dimanches, clôture', () => {
  const etat = P.jouer(scelle, cal, { recharger: relire });
  assert.deepEqual(ecarts(etat), []);
  const j = journalDe(etat);
  assert.deepEqual(Object.keys(j.jours).map(Number).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(j.sauts.length, 2);
  assert.deepEqual(j.sauts.map(s => s.textes_atteints), [3, 6]);
  // Les réponses du rattrapage sont rangées au jour de leur texte (partie 4.3.9).
  assert.ok([4, 5, 6, 8, 9, 10, 11, 12, 13].every(d => j.jours[d].coups.reponse !== null));
  assert.ok([5, 6, 9, 13].every(d => j.jours[d].ouverture === null && j.jours[d].versions === null && j.jours[d].etapes === null));
  assert.equal(j.jours[15].coups.reponse, null);
  assert.equal(j.jours[1].coups.compte, 'email_valider');
  assert.equal(j.jours[1].etapes.entree, true);
  assert.equal(j.jours[2].etapes.entree, null);
  assert.equal(j.jours[4].coups.annuler_saut, 0);
  assert.equal(j.jours[4].coups.abandon, null);
  assert.equal(j.jours[2].coups.abandon, false);
  assert.equal(j.sauts[0].coups.ouvert.qui_est_qui, 1, 'ouverture pendant le saut : comptée au saut');
  assert.equal(j.jours[4].coups.ouvert.qui_est_qui, 1, 'ouverture avant la confirmation : comptée au jour');
  assert.deepEqual([j.jours[4].coups.ouvert.cercle, j.jours[4].coups.ouvert.moi, j.jours[4].coups.ouvert.proche], [0, 0, 0]);
  assert.deepEqual(j.jours[2].coups.pendant_deviner, { cercle: 0, proche: 1 });
  assert.notEqual(j.fin, null);
  // Forme canonique possible (aucune valeur hors du JSON canonique).
  assert.equal(typeof N.jsonCanonique(j), 'string');
  // Mode moteur : mêmes entrées, versions et étapes nulles.
  const jm = JSON.parse(JSON.stringify(j));
  jm.partie = { graine: null, id: 'a', mode: 'moteur' };
  Object.keys(jm.jours).forEach(k => { jm.jours[k].versions = null; jm.jours[k].etapes = null; });
  assert.deepEqual(J.valider(scelle, cal, jm, opts()), []);
});

test('« Abandonner cette journée » aux jours 1, 2, 3, 7 et 14, avec Deviner vide, à moitié ou plein non validé (R10)', () => {
  const etat = P.jouer(scelle, cal, { abandons: { 1: 'faces', 2: 'rien', 3: 'tout', 7: 'faces', 14: 'rien' } });
  assert.deepEqual(ecarts(etat), []);
  const j = journalDe(etat);
  assert.equal(j.jours[1].coups.abandon, true);
  assert.deepEqual(j.jours[1].coups.deviner.cartes.map(c => c.designe), ['Valentin', null, null]);
  assert.equal(j.jours[1].coups.deviner.validee, false);
  assert.equal(j.jours[2].coups.deviner, null, 'Deviner jamais affiché : pas de cartes');
  assert.equal(j.jours[3].coups.deviner.validee, false);
  assert.ok(j.jours[4], 'le jour 3 abandonné, le saut reste proposé (§0)');
  assert.equal(j.jours[14].coups.abandon, true);
  assert.ok(j.jours[15], 'abandon au jour 14 : la clôture suit');
});

test('« Annuler » sur la page du saut : seul son compte change (contrôle 14 b)', () => {
  const a = P.jouer(scelle, cal, { annuler: { 4: 2, 8: 1 } });
  const b = P.jouer(scelle, cal, {});
  assert.deepEqual(ecarts(a), []);
  const ja = journalDe(a), jb = journalDe(b);
  assert.equal(ja.jours[4].coups.annuler_saut, 2);
  assert.equal(ja.jours[8].coups.annuler_saut, 1);
  ja.jours[4].coups.annuler_saut = 0; ja.jours[8].coups.annuler_saut = 0;
  // Les ouvertures diffèrent par l'heure lue (plus de touchers) ; tout le reste des coups est identique.
  Object.keys(ja.jours).forEach(k => assert.deepEqual(ja.jours[k].coups, jb.jours[k].coups, 'jour ' + k));
});

test('Rattrapage interrompu (app fermée) puis repris : aucun texte répondu deux fois, aucun sauté', () => {
  let coupe = 0;
  const etat = P.jouer(scelle, cal, {
    recharger: (e) => {
      const r = E.rattrapage(e, cal);
      if (r && !r.termine) { coupe++; }
      return relire(e);
    }
  });
  assert.ok(coupe >= 7, 'rechargé au milieu des deux rattrapages');
  assert.deepEqual(ecarts(etat), []);
});

test('Arrêts : pendant l\'entrée, au jour 2, pendant un saut (F2 dès le jour 3, §8.10)', () => {
  const entree = P.jouer(scelle, cal, { arretA: { jour: 1, moment: 'entree', raison: 'pas_le_temps' } });
  assert.deepEqual(ecarts(entree), []);
  assert.equal(journalDe(entree).jours[1].coups.compte, null);
  const j2 = P.jouer(scelle, cal, { arretA: { jour: 2, moment: 'apres-reponse', raison: null } });
  assert.deepEqual(ecarts(j2), []);
  assert.throws(() => P.jouer(scelle, cal, { arretA: { jour: 2, moment: 'debut', f2: 'jamais' } }), /F2/);
  const saut = P.jouer(scelle, cal, { arretA: { jour: 5, moment: 'rattrapage', raison: 'autre', f2: 'jamais' } });
  assert.deepEqual(ecarts(saut), []);
  const js = journalDe(saut);
  assert.equal(js.arret.jour, 6);
  assert.equal(js.sauts[0].textes_atteints, 2);
  assert.ok(E.sautEnCours(saut), 'arrêté pendant le premier saut');
  // Arrêt après la dernière réponse du rattrapage, avant « Aller au dimanche » : le dimanche est atteint, sans ouverture.
  const finSaut = P.jouer(scelle, cal, { arretA: { jour: 7, moment: 'avant-aller-au-dimanche', raison: 'vu_assez', f2: 'jamais' } });
  assert.deepEqual(ecarts(finSaut), []);
  const jf = journalDe(finSaut);
  assert.equal(jf.arret.jour, 7);
  assert.equal(jf.jours[7].ouverture, null);
  assert.ok(E.sautEnCours(finSaut));
  // Sans arrêt, un dimanche sans ouverture reste une faute (règle 4).
  const jfaute = journalDe(P.jouer(scelle, cal, {}));
  jfaute.jours[7].ouverture = null; jfaute.jours[7].versions = null;
  assert.ok(regles(J.valider(scelle, cal, jfaute, opts())).includes(4));
});

test('Partie en cours : chaque état intermédiaire relu est valide (option enCours)', () => {
  let n = 0;
  P.jouer(scelle, cal, {
    recharger: (e) => {
      const l = J.valider(scelle, cal, journalDe(e), opts({ enCours: true }));
      assert.deepEqual(l, [], 'jour ' + E.K(e));
      n++;
      return relire(e);
    }
  });
  assert.equal(n, 17, "huit jours vécus et neuf textes de rattrapage");
});

test('Gestes refusés par les transitions (rien ne s\'écrit)', () => {
  const etat = E.nouvelEtat(cal);
  assert.throws(() => E.repondreEntree(etat, cal, scelle, 'E1', { niveau: 3, raison: 1 }), /consentement/);
  E.consentir(etat, cal);
  assert.throws(() => E.repondreEntree(etat, cal, scelle, 'E2', { niveau: 3, raison: 1 }), /tour/);
  assert.throws(() => E.repondreEntree(etat, cal, scelle, 'E1', { niveau: 3, raison: 9 }), /invalide/);
  assert.throws(() => E.ouvrirDeviner(etat, cal, 1, 3, 0), /compte/);
  assert.throws(() => E.allerAuJourSuivant(etat, cal, true), /entrée/);
  cal.textesEntree.forEach(t => { E.repondreEntree(etat, cal, scelle, t, { niveau: 2, raison: 'aucune' }); E.parierEntree(etat, cal, t, 2); });
  assert.throws(() => E.terminerCompte(etat, cal, 'Valentin', 'apple', 0), /pseudo/);
  assert.throws(() => E.terminerCompte(etat, cal, 'Moi', 'pigeon', 0), /voie/);
  E.terminerCompte(etat, cal, 'Moi', 'apple', 0);
  assert.throws(() => E.repondre(etat, scelle, cal, 1, { niveau: 3, raison: 1 }, 0), /Deviner/);
  E.ouvrirDeviner(etat, cal, 1, 3, 0);
  E.poserCarte(etat, 1, 0, 'Odile');
  E.poserCarte(etat, 1, 1, 'Odile');
  assert.deepEqual(etat.jours[1].coups.deviner.cartes.map(c => c.designe), [null, 'Odile', null], 'un visage quitte sa carte d\'origine');
  E.poserRaison(etat, scelle, cal, 1, 1, 2);
  E.poserCarte(etat, 1, 1, 'passe');
  assert.equal(etat.jours[1].coups.deviner.cartes[1].raison, null, 'la raison suit le visage');
  assert.throws(() => E.validerDeviner(etat, 1), /vide/);
  assert.throws(() => E.compter(etat, cal, 'rouvrir'), /révélation/);
  assert.throws(() => E.ouvrirPageSaut(etat, cal, 0), /saut/);
  assert.throws(() => E.finir(etat, cal, {}), /clôture/);
  assert.throws(() => E.arreter(etat, cal, 'pas_amuse', 'jamais'), /F2/);
});

test('Durées (§8.12) : jour, entrée, Deviner, Répondre ; saut, page, textes', () => {
  const etat = P.jouer(scelle, cal, {});
  const d1 = E.dureesJour(etat, cal, 1, 0);
  assert.ok(d1.duree_seance > 0 && d1.duree_entree > 0 && d1.duree_deviner > 0 && d1.duree_repondre >= 0);
  assert.deepEqual(E.dureesJour(etat, cal, 5, 0), { duree_deviner: null, duree_entree: null, duree_repondre: null, duree_seance: null });
  const d4 = E.dureesJour(etat, cal, 4, 0);
  assert.equal(d4.duree_entree, null);
  assert.equal(d4.duree_deviner, null);
  const s1 = E.dureesSaut(etat, 0, 0);
  assert.equal(s1.numero, 1);
  assert.equal(s1.durees_textes.length, 3);
  assert.ok(s1.duree_saut >= s1.duree_page + s1.durees_textes.reduce((a, b) => a + b, 0) - 3);
  const f = E.fichierDurees(etat, cal, 0);
  assert.deepEqual(Object.keys(f).sort(), ['copies', 'format', 'jours', 'partie', 'sauts', 'version']);
  assert.equal(f.sauts[1].durees_textes.length, 6);
  // Valeurs exactes, horloge maîtrisée : le jour 4 s'arrête à l'ouverture de la page confirmée.
  const e = E.nouvelEtat(cal);
  const j4 = E.nouveauJour(cal, 4);
  e.jours = { 4: j4 };
  E.toucher(e, cal, 1000, 1, () => '2026-10-22T08:00+02:00');
  E.ouvrirPageSaut(e, cal, 31000);
  E.annulerSaut(e, cal);
  E.ouvrirPageSaut(e, cal, 61000);
  E.toucher(e, cal, 90000, 1, () => { throw new Error('heure relue'); });
  E.confirmerSaut(e, cal, '2026-10-22T08:02+02:00', 91000);
  assert.equal(E.dureesJour(e, cal, 4, 0).duree_seance, 60);
  E.toucher(e, cal, 95000, 1, () => { throw new Error('heure lue pendant le saut'); });
  assert.deepEqual(E.dureesSaut(e, 0, 0), { duree_page: 30, duree_saut: 34, durees_textes: [4], numero: 1 });
});

test('Journaux fautifs : refusés avec la règle et le chemin (partie 4.4)', () => {
  const base = journalDe(P.jouer(scelle, cal, {}));
  const cas = {
    1: j => { j.version = 3; },
    2: j => { j.partie.id = 'Z'; },
    3: j => { delete j.jours[9]; },
    4: j => { j.jours[5].ouverture = j.jours[4].ouverture; },
    5: j => { j.jours[3].versions = [2, 1]; },
    6: j => { j.jours[1].coups.pseudo = 'Agathe'; },
    7: j => { j.jours[2].coups.deviner.cartes[0].raison = 1; },
    8: j => { j.jours[2].coups.deviner.validee = false; j.jours[2].coups.deviner.cartes[0].designe = null; },
    9: j => { j.jours[1].coups.rouvrir = 1; },
    10: j => { j.jours[2].coups.carnet.hesite = ['deviner']; },
    11: j => { j.jours[4].attente = { lectures: [{ heure: '19:00' }] }; },
    12: j => { j.jours[2].etapes.deviner = false; },
    13: j => { j.sauts[1].textes_atteints = 7; },
    14: j => { j.fin.portrait = 'beau'; },
    15: j => { j.copies = [{ coups: j.jours[2].coups, etapes: null, jour: 16, sauts: [], versions: [1] }]; }
  };
  for (const regle of Object.keys(cas)) {
    const j = JSON.parse(JSON.stringify(base));
    cas[regle](j);
    const l = J.valider(scelle, cal, j, opts());
    assert.ok(regles(l).includes(+regle), 'règle ' + regle + ' attendue : ' + l.join(' | '));
  }
  // Quelques fautes de plus, propres au second essai.
  const autres = [
    [3, j => { j.sauts = j.sauts.slice(0, 1); }],                         // jour 9 atteint sans second saut
    [7, j => { j.jours[2].coups.deviner.cartes[2].designe = 'Valentin'; }], // Valentin deux fois
    [8, j => { j.jours[2].coups.abandon = true; }],                       // abandon après la réponse
    [9, j => { j.jours[5].coups.ouvert.moi = 1; }],                       // compteur un jour sauté
    [9, j => { j.jours[2].coups.annuler_saut = 0; }],                     // annuler hors d'un point de saut
    [10, j => { j.jours[1].coups.carnet.moment = 'revelation'; }],        // choix non proposé au jour d'arrivée
    [10, j => { j.jours[14].coups.carnet.saut_clair = 'oui'; }],          // question du saut hors du premier dimanche
    [10, j => { j.jours[7].coups.carnet.hesite = ['deviner', 'nulle_part']; }],
    [12, j => { j.jours[4].etapes = { deviner: false, entree: null, repondre: false }; }],
    [13, j => { j.sauts[0].numero = 2; }],
    [4, j => { j.sauts[0].depart = N.paris(N.lireInstant(j.jours[7].ouverture) + 3600000).instant; }] // départ après la reprise
  ];
  autres.forEach(([regle, f], i) => {
    const j = JSON.parse(JSON.stringify(base));
    f(j);
    const l = J.valider(scelle, cal, j, opts());
    assert.ok(regles(l).includes(regle), 'cas ' + i + ', règle ' + regle + ' attendue : ' + l.join(' | '));
  });
  // Sans le nombre de cartes du moteur, la règle 7 ne compte pas les cartes (lots 2 et 3).
  const j = JSON.parse(JSON.stringify(base));
  j.jours[2].coups.deviner.cartes.push({ designe: 'Agathe', raison: null });
  assert.ok(regles(J.valider(scelle, cal, j, opts())).includes(7));
  assert.deepEqual(J.valider(scelle, cal, j, { empreinte: EMPREINTE }), []);
});

test('Pseudo (§7.19, E7) : prénoms refusés par leur squelette, initiale seule refusée', () => {
  const table = { 'а': 'a', 'е': 'e', 'о': 'o' };
  for (const x of ['Agathe', 'ODILE', 'Odìle', 'valentin', 'A', 'v', 'Ö']) { assert.equal(J.pseudoGardable(x, table), false, x); }
  assert.equal(J.pseudoGardable('Аgathе', table), false, 'а et е cyrilliques');
  assert.equal(J.pseudoGardable('Аgathе', {}), true, 'sans table, l\'imitation passe');
  for (const x of ['Moi', 'B', 'Témoin-b-4821-k', 'Agathe2', 'Val']) { assert.equal(J.pseudoGardable(x, table), true, x); }
  for (const x of ['', ' Moi', 'Moi ', 'a  b', 'x'.repeat(21), 'a\tb', 'é']) { assert.equal(J.pseudoGardable(x, table), false, JSON.stringify(x)); }
});

test('Forme de l\'état relu : un état abîmé est refusé (arrêt 1, M1)', () => {
  const etat = P.jouer(scelle, cal, {});
  assert.doesNotThrow(() => relire(etat));
  const cas = [
    e => { e.format = 1; },
    e => { delete e.jours[3]; },
    e => { e.jours[2].coups.extra = 1; },
    e => { e.sauts[0].numero = 2; },
    e => { e.horloge = -1; },
    e => { delete e.vue; },
    e => { e.jours[5].versions = []; }
  ];
  cas.forEach((f, i) => {
    const e = JSON.parse(JSON.stringify(etat));
    f(e);
    assert.throws(() => E.verifierForme(e, cal), /état/, 'cas ' + i);
  });
});

/* ------------------------------------------------------------------ */
/* Demandes de Back-end (10 octobre 2026) : arrêt complété, partie     */
/* close, « Reprendre » pendant un saut, copies avec leurs durées      */
/* ------------------------------------------------------------------ */

const instant = () => '2026-10-25T10:00+01:00';
function etatPendantSaut() {
  // Arrêt pendant le rattrapage du premier saut, puis l'arrêt retiré : l'état juste avant la confirmation.
  const s1 = cal.sauts[0];
  const e = P.jouer(scelle, cal, { arretA: { jour: s1.sautes[0], moment: 'rattrapage' } });
  e.arret = null;
  assert.ok(E.sautEnCours(e));
  return e;
}

test('Arrêt confirmé pendant un saut : plus aucun toucher ne compte (« clos ») ; la durée du saut ne bouge plus', () => {
  const e = etatPendantSaut();
  const s = E.sautEnCours(e);
  assert.equal(E.toucher(e, cal, 9e8, 1, instant), 'saut');          // le toucher qui confirme l'arrêt compte encore
  E.arreter(e, cal, null, null);
  const avant = E.dureesSaut(e, 0, 9e8);
  const jourAvant = JSON.stringify(E.jour(e, E.K(e)));
  assert.equal(E.toucher(e, cal, 2e9, 1, instant), 'clos');           // page de questions : rien n'est compté
  assert.equal(E.toucher(e, cal, 3e9, 1, instant), 'clos');
  assert.deepEqual(E.dureesSaut(e, 0, 4e9), avant);
  assert.equal(JSON.stringify(E.jour(e, E.K(e))), jourAvant);
  assert.equal(s.pp.dernier, 9e8);
  // Après la fin aussi.
  const f = P.jouer(scelle, cal, {});
  assert.equal(E.toucher(f, cal, 9e9, 1, instant), 'clos');
});

test('completerArret : raison et F2 posées après la confirmation ; F2 dès le jour 3 ; jamais sans arrêt ni après la fin', () => {
  const e = etatPendantSaut();
  E.arreter(e, cal, null, null);
  E.completerArret(e, cal, 'raison', 'vu_assez');
  E.completerArret(e, cal, 'f2', 'toujours_autant');
  E.completerArret(e, cal, 'raison', null); // choix effacé
  assert.deepEqual(e.arret, { f2: 'toujours_autant', jour: E.K(e), raison: null });
  assert.deepEqual(ecarts(e), []);
  assert.throws(() => E.completerArret(e, cal, 'raison', 'inconnu'), /état/);
  assert.throws(() => E.completerArret(e, cal, 'f1', null), /état/);
  // Arrêt au jour 2 : F2 refusée.
  const t = P.jouer(scelle, cal, { arretA: { jour: cal.premier + 1, moment: 'debut' } });
  assert.throws(() => E.completerArret(t, cal, 'f2', 'jamais'), /état/);
  E.completerArret(t, cal, 'raison', 'pas_le_temps');
  // Sans arrêt, ou après la fin : refusé.
  assert.throws(() => E.completerArret(etatPendantSaut(), cal, 'raison', 'autre'), /état/);
  const f = P.jouer(scelle, cal, {});
  assert.throws(() => E.completerArret(f, cal, 'raison', 'autre'), /état/);
});

test('« Reprendre la révélation » refusé pendant un saut en cours, même le jour de reprise atteint sans ouverture (Q-J3)', () => {
  const s1 = cal.sauts[0];
  const e = P.jouer(scelle, cal, { arretA: { jour: s1.reprise, moment: 'avant-aller-au-dimanche' } });
  e.arret = null;
  assert.equal(E.K(e), s1.reprise);
  assert.ok(E.sautEnCours(e));
  assert.throws(() => E.compter(e, cal, 'rouvrir'), /saut/);
  assert.equal(E.jour(e, s1.reprise).coups.rouvrir, 0);
});

test('Copie du carnet pendant un saut (Q-K7) : durées et sauts pris au toucher de la copie, repris par le journal et le fichier des durées', () => {
  const e = etatPendantSaut();
  E.toucher(e, cal, 5e8, 1, instant);
  const releve = E.releverCopie(e, cal, 5e8);
  const figees = JSON.parse(JSON.stringify(releve));
  // Le saut continue : ses durées courent, celles du relevé non.
  E.toucher(e, cal, 9e8, 1, instant);
  assert.ok(E.dureesSaut(e, 0, 9e8).duree_saut > releve.durees.sauts[0].duree_saut);
  assert.deepEqual(releve, figees);
  const D = E.fichierDurees(e, cal, 9e8, undefined, [releve]);
  assert.equal(D.copies.length, 1);
  assert.deepEqual(Object.keys(D.copies[0]).sort(), ['duree_deviner', 'duree_entree', 'duree_repondre', 'duree_seance', 'sauts']);
  assert.deepEqual(D.copies[0].sauts, figees.durees.sauts);
  assert.equal(D.copies[0].sauts[0].durees_textes.length, e.sauts[0].textes_atteints);
  const j = E.journal(e, cal, EMPREINTE, undefined, [releve]);
  assert.deepEqual(Object.keys(j.copies[0]).sort(), ['coups', 'etapes', 'jour', 'sauts', 'versions']);
  assert.equal(j.copies[0].jour, E.K(e));
  assert.deepEqual(j.copies[0].sauts, j.sauts);
  E.arreter(e, cal, null, null);
  assert.deepEqual(J.valider(scelle, cal, E.journal(e, cal, EMPREINTE, undefined, [releve]), opts()), []);
  // Sans relevé : tableaux vides, comme avant.
  assert.deepEqual(E.fichierDurees(e, cal, 9e8).copies, []);
  assert.deepEqual(E.journal(e, cal, EMPREINTE).copies, []);
});

test('Point de saut avant la confirmation : Le Cercle, Moi et un proche refusés ; la règle 9 du journal le vérifie (§0)', () => {
  const s1 = cal.sauts[0];
  const e = P.jouer(scelle, cal, { arretA: { jour: s1.point, moment: 'debut' } });
  e.arret = null;
  assert.equal(E.K(e), s1.point);
  ['cercle', 'moi', 'proche'].forEach(q => assert.throws(() => E.compter(e, cal, q), /point de saut/));
  E.compter(e, cal, 'qui_est_qui'); // la fiche du cadre reste accessible
  // Après la confirmation, les ouvertures vont au saut.
  E.ouvrirPageSaut(e, cal, 1e8);
  E.confirmerSaut(e, cal, '2026-10-22T19:00+02:00', 1e8 + 1000);
  E.compter(e, cal, 'moi');
  assert.equal(e.sauts[0].coups.ouvert.moi, 1);
  assert.equal(E.jour(e, s1.point).coups.ouvert.moi, 0);
  // Un journal qui en compte quand même au point de saut est refusé par la règle 9.
  const j = journalDe(P.jouer(scelle, cal, {}));
  j.jours[String(s1.point)].coups.ouvert.moi = 1;
  const l = J.valider(scelle, cal, j, opts());
  assert.ok(l.some(x => x.startsWith('règle 9, /jours/' + s1.point + '/coups/ouvert/moi')), l.join('\n'));
});
