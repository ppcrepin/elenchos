/* Tests du carnet du second essai (lot 5, instance B ; simulation-2.md, §8.12).
 * Parties jouées par le joueur scripté (tests/partie-test.js), moteur de la page,
 * fichier scellé de test (inventé). Outillage d'essai.
 *
 *   node --test tests/test-carnet.js
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const E = require('../etat.js');
const M = require('../moteur.js');
const CR = require('../carnet.js');
const PT = require('./partie-test.js');

const CHEMIN = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const octets = new Uint8Array(fs.readFileSync(CHEMIN));
const S = JSON.parse(N.utf8Decoder(octets));
const EMPREINTE = N.sha256(octets);
const cal = C.lire(S);
const arrivee = M.histoire(S, cal);
const cartes = M.cartesServies(S, cal, arrivee);

function carnetDe(etat, statut) {
  const j = E.journal(etat, cal, EMPREINTE);
  const R = M.calculer(S, cal, arrivee, j);
  return CR.texte(S, cal, j, R, E.fichierDurees(etat, cal, etat.horloge), statut || { type: etat.fin ? 'fin' : 'arret' });
}
function blocs(t) { return t.split('\n\n').map((b) => b.split('\n')[0]); }

/** Règles de forme du §8.12 (S1) : lignes, espaces, apostrophe, durées, listes. */
function verifierForme(t) {
  assert.equal(t, t.normalize('NFC'));
  assert.ok(t.endsWith('\n\nFin du carnet'), 'fin');
  assert.ok(!/\n\n\n/.test(t) && !t.startsWith('\n'), 'blocs séparés par une seule ligne vide');
  assert.ok(!/ {2}|^ | $|\t|\r/m.test(t), 'espaces');
  assert.ok(!/'/.test(t), 'apostrophe droite');
  assert.ok(!/^(?:[-*#>]|[0-9]+\.)/m.test(t), 'ligne lue comme une liste ou un titre');
  assert.ok(!/[  ]/.test(t), 'seule l\'espace U+0020');
  // « min » n'apparaît que dans les durées.
  const sansDurees = t.replace(/\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b/g, '');
  assert.ok(!/min/.test(sansDurees), 'min hors d\'une durée');
}

test('Partie entière : blocs dans l\'ordre vécu, forme du §8.12, rien de ce qui est interdit', () => {
  const etat = PT.jouer(S, cal, { cartes: cartes, pseudo: 'Zoé-Témoin', annuler: { 4: 2 } });
  const t = carnetDe(etat);
  verifierForme(t);
  assert.deepEqual(blocs(t), ['Carnet du second essai Elenchos', 'Jour 1 · lundi', 'Jour 2 · mardi', 'Jour 3 · mercredi', 'Jour 4 · jeudi',
    'Premier saut · jeudi à samedi', 'Jour 7 · dimanche', 'Semaine 1', 'Jour 8 · lundi', 'Second saut · lundi à samedi', 'Jour 14 · dimanche',
    'Semaine 2', 'Clôture', 'Sur tout l’essai', 'Questions de fin', 'Fin du carnet']);
  assert.ok(t.includes('Essai mené jusqu’à la clôture.'));
  assert.ok(!/Jour (5|6|9|10|11|12|13) /.test(t), 'un jour sauté ne s\'écrit jamais « Jour k »');
  assert.ok(!t.includes('Zoé'), 'jamais le pseudo');
  assert.ok(t.includes('Boutons touchés : Annuler 2 fois.'));
  assert.ok(t.includes('Compte : Recevoir un code par e-mail, puis Valider.'));
  assert.ok(/Entrée : paris sur Valentin (juste|faux), (juste|faux), (juste|faux)\./.test(t));
  assert.ok(/Pour répondre : (\d+ min \d\d s, ){2}\d+ min \d\d s\./.test(t), 'trois durées au premier saut');
  assert.ok(/Pour répondre : (\d+ min \d\d s, ){5}\d+ min \d\d s\./.test(t), 'six durées au second saut');
  assert.ok(t.includes('Ce que le jeu a fait pendant le saut, c’était clair : En partie.'));
  assert.equal((t.match(/Ce que le jeu a fait pendant le saut/g) || []).length, 1, 'question du saut en semaine 1 seulement');
  assert.ok(t.includes('Où vous avez hésité cette semaine : Deviner, Le saut.'));
  assert.ok(t.includes('Au fil de l’essai, deviner était : Toujours aussi amusant.'));
  assert.ok(t.includes('Avec des textes rejetés, « Et l’Assemblée ? » était : Avec un vrai suspense.'));
  // Jamais : l'avis du cercle, une position, une phrase, un curseur.
  ['adopté', 'rejeté.', 'partagé', 'Favorable', 'Défavorable', 'Neutre', 'Aujourd’hui, tu', 'curseur'].forEach((x) => assert.ok(!t.includes(x), 'interdit : ' + x));
  // Le bloc de la clôture garde les lignes du premier essai : pas de ligne « Ouvert ».
  const cloture = t.split('\n\n').filter((b) => b.startsWith('Clôture'))[0];
  assert.ok(!cloture.includes('Ouvert :') && cloture.includes('Révélation :'));
  // Aux points de saut : ni « Journée abandonnée », ni moment préféré (§8.12).
  const j4 = t.split('\n\n').filter((b) => b.startsWith('Jour 4'))[0];
  assert.ok(!j4.includes('Journée abandonnée') && !j4.includes('moment préféré') && j4.includes('Ouvert :'));
});

test('Arrêts : pendant l\'entrée, au jour k, pendant un saut, entre la dernière réponse et « Aller au dimanche »', () => {
  const entree = carnetDe(PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 1, moment: 'entree', raison: 'pas_le_temps' } }));
  verifierForme(entree);
  assert.ok(entree.includes('Essai arrêté pendant l’entrée.') && entree.includes('Raison de l’arrêt : Je n’ai pas le temps.'));
  assert.ok(!entree.includes('Questions de fin'), 'pas de questions de fin avant le jour 3');
  assert.ok(!entree.includes('Journée abandonnée'), 'pas de ligne « Journée abandonnée » pendant l\'entrée');

  const j2 = carnetDe(PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 2, moment: 'debut' } }));
  assert.ok(j2.includes('Essai arrêté au jour 2.') && j2.includes('Raison de l’arrêt : pas de réponse.') && !j2.includes('Questions de fin'));

  const saut = carnetDe(PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 5, moment: 'rattrapage', f2: 'jamais' } }));
  verifierForme(saut);
  assert.ok(saut.includes('Essai arrêté pendant le premier saut.'));
  assert.ok(saut.includes('Jusqu’ici, deviner était : Jamais amusant.'));
  assert.ok(/Pour répondre : \d+ min \d\d s, \d+ min \d\d s\./.test(saut), 'seules les durées des textes atteints');

  const avant = carnetDe(PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 7, moment: 'avant-aller-au-dimanche' } }));
  verifierForme(avant);
  assert.ok(avant.includes('Essai arrêté pendant le premier saut.'), 'L1-4 : le dimanche atteint sans ouverture est encore le saut');
  assert.ok(!avant.includes('Jour 7 ·'), 'pas de bloc pour un jour sans ouverture');
});

test('Copie en cours d\'essai (jour 7) : statut, pas de questions de fin ni de raison d\'arrêt', () => {
  const etat = PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 7, moment: 'apres-reponse' } });
  etat.arret = null; // la même partie, copiée au lieu d'être arrêtée
  const t = carnetDe(etat, { type: 'copie' });
  verifierForme(t);
  assert.ok(t.includes('Essai en cours : carnet copié au jour 7.'));
  assert.ok(!t.includes('Raison de l’arrêt') && !t.includes('Questions de fin'));
  assert.ok(t.includes('Semaine 1'));
});

test('Abandon : « Journée abandonnée : oui » ; verdicts « passé » pour les cartes laissées vides', () => {
  const t = carnetDe(PT.jouer(S, cal, { cartes: cartes, abandons: { 2: 'faces', 3: 'rien' } }));
  verifierForme(t);
  const b = (k) => t.split('\n\n').filter((x) => x.startsWith('Jour ' + k + ' '))[0];
  assert.ok(b(2).includes('Journée abandonnée : oui.') && b(3).includes('Journée abandonnée : oui.'));
  assert.ok(!b(3).includes('Pendant Deviner'), 'Deviner jamais affiché le jour 3');
  assert.ok(/Révélation : [^.]*passé/.test(b(3)), 'les cartes vides du jour 2 sont passées à la révélation du jour 3');
});

test('Règle de Juridique (contrôle 12) : hors cumul, le carnet ne change pas avec les réponses du porteur', () => {
  const autre = (t, k) => { const n = S.textes[t].considerations.length; return { niveau: 5 - (k % 5), raison: (k % n) + 1 }; };
  const a = carnetDe(PT.jouer(S, cal, { cartes: cartes }));
  const b = carnetDe(PT.jouer(S, cal, { cartes: cartes, reponse: autre }));
  const sansCumul = (t) => t.split('\n\n').filter((x) => !/^(Semaine \d|Sur tout l’essai)/.test(x)).join('\n\n');
  assert.equal(sansCumul(a), sansCumul(b));
});

test('Durée : forme « {m} min {ss} s »', () => {
  assert.equal(CR.duree(0), '0 min 00 s');
  assert.equal(CR.duree(42), '0 min 42 s');
  assert.equal(CR.duree(7503), '125 min 03 s');
});

test('Copie relevée (releverCopie) : le texte rebâti à la fin (texteCopie) est celui que le porteur a copié ce jour-là', () => {
  const etat = PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 7, moment: 'apres-reponse' } });
  etat.arret = null;
  const direct = carnetDe(etat, { type: 'copie' });
  const r = E.releverCopie(etat, cal, etat.horloge);
  const j = E.journal(etat, cal, EMPREINTE, undefined, [r]);
  const d = E.fichierDurees(etat, cal, etat.horloge, undefined, [r]);
  assert.equal(j.copies.length, 1);
  assert.equal(d.copies.length, 1);
  M.calculer(S, cal, arrivee, j); // le journal avec sa copie passe la validation du moteur
  const c = CR.texteCopie(S, cal, j, d, 0, (jt) => M.calculer(S, cal, arrivee, jt));
  assert.equal(c.texte, direct);
  assert.ok(c.mesures, 'mesures du jour de la copie');
});

test('Boutons touchés (§8.12) : seulement les jours avec Deviner, une fois l\'entrée finie ; jamais aux jours 4, 8 ni à la clôture', () => {
  const t = carnetDe(PT.jouer(S, cal, { cartes: cartes, annuler: { 4: 2 } }));
  const bloc = (titre) => t.split('\n\n').filter((x) => x.startsWith(titre))[0] || '';
  for (const titre of ['Jour 4 ', 'Jour 8 ', 'Clôture']) assert.ok(!bloc(titre).includes('Boutons touchés'), titre);
  assert.ok(t.includes('Boutons touchés'), 'présent ailleurs');
});

test('Dévoilement, {Pas de Côté} : n parmi 5, 6, 12, 13 ; facteurs 2, 3, 4 ; forme plurielle', () => {
  const X = require('../textes.js');
  // Partie de test : seul T12 (Sécurité ou Liberté individuelle) a assez de textes de sa tension avant lui.
  assert.deepEqual(CR.pasDeCotePossibles(S, cal, 2), []);
  assert.deepEqual(CR.pasDeCotePossibles(S, cal, 3), [12]);
  assert.deepEqual(CR.pasDeCotePossibles(S, cal, 4), [12]);
  // Jamais hors de 5, 6, 12, 13, même avec un facteur qui rendrait tout possible.
  assert.deepEqual(CR.pasDeCotePossibles(S, cal, 10), [5, 6, 12, 13]);
  // Deux jours : T13 passé sur la tension de T12.
  const S2 = JSON.parse(JSON.stringify(S));
  S2.textes['13'].tension = S2.textes['12'].tension;
  const n2 = CR.pasDeCotePossibles(S2, cal, 4);
  assert.deepEqual(n2, [12, 13]);
  const phrase = X.pasDeCotePossible(X.pasDeCoteJours(N.listeEt(n2.map((n) => String(n + 2)))));
  assert.ok(phrase.includes(' des jours 14 et 15, chacun sur la tension de son texte, '), phrase);
});

test('Dévoilement, tempéraments : calcul du jour 14, même après un arrêt (réponses non données = absentes)', () => {
  const d14 = cal.semaine(cal.semainesEssai[cal.semainesEssai.length - 1]).dernier_jour;
  const CODES = ['original', 'pont', 'mesure', 'tranche'];
  // Partie entière : le calcul hors moteur est celui de R.
  const pleine = PT.jouer(S, cal, { cartes: cartes });
  const jp = E.journal(pleine, cal, EMPREINTE);
  const R = M.calculer(S, cal, arrivee, jp);
  const tp = CR.temperamentsAu(M, S, cal, arrivee, jp, d14);
  Object.keys(tp).forEach((p) => assert.deepEqual(tp[p], R.jours[String(d14)].dimanche.temperaments[p].temperaments, p));
  // Arrêt pendant le premier saut : le jour 14 n'est pas atteint, le calcul existe pour chacun.
  const arrete = PT.jouer(S, cal, { cartes: cartes, arretA: { jour: 5, moment: 'rattrapage' } });
  const ja = E.journal(arrete, cal, EMPREINTE);
  assert.ok(!M.calculer(S, cal, arrivee, ja).jours[String(d14)], 'jour 14 non atteint');
  const ta = CR.temperamentsAu(M, S, cal, arrivee, ja, d14);
  assert.deepEqual(Object.keys(ta).sort(), Object.keys(S.personnages).sort());
  Object.keys(ta).forEach((p) => assert.ok(ta[p].every((c) => CODES.includes(c)), p));
  // Les réponses non données comptent comme absentes : le même calcul que si le porteur n'avait jamais répondu après l'arrêt,
  // c'est-à-dire celui de la partie entière privée de ses réponses des jours 5 à 14.
  const tronque = JSON.parse(JSON.stringify(jp));
  Object.keys(tronque.jours).forEach((k) => { if (+k >= 5) { delete tronque.jours[k]; } });
  tronque.fin = null;
  assert.deepEqual(CR.temperamentsAu(M, S, cal, arrivee, tronque, d14), CR.temperamentsAu(M, S, cal, arrivee,
    (() => { const x = JSON.parse(JSON.stringify(ja)); Object.keys(x.jours).forEach((k) => { if (+k >= 5) { delete x.jours[k]; } }); return x; })(), d14));
});
