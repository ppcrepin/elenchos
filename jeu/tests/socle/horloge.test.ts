// L'horloge de 18h, à l'heure de Paris (règle 6 ; D-043). Les trois premiers cas viennent de
// test-18h/tests/sans-base/horloge-et-horaires.test.ts (REPRIS). Ajoutés : le jour de jeu autour de 18h, et les deux
// prochains changements d'heure, le dimanche 25 octobre 2026 (on recule d'une heure) et le dimanche 28 mars 2027
// (on avance d'une heure). Ces deux dimanches, les titres tombent aussi à 18h.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ajouterJours, dimancheDeLaSemaine, fermetureDuJour, heureParis, horlogeReglable, instantParis, jourDeJeu, jourSemaine,
  ouvertureDuJour, partiesParis,
} from '../../src/serveur/horloge.ts';

test('18h à Paris, l’hiver et l’été, et autour des changements d’heure (repris)', () => {
  assert.equal(instantParis('2026-10-24', 18, 0).toISOString(), '2026-10-24T16:00:00.000Z'); // été (UTC+2)
  assert.equal(instantParis('2026-10-25', 18, 0).toISOString(), '2026-10-25T17:00:00.000Z'); // jour du passage à l'hiver
  assert.equal(instantParis('2026-10-26', 18, 0).toISOString(), '2026-10-26T17:00:00.000Z');
  assert.equal(instantParis('2026-10-20', 18, 10).toISOString(), '2026-10-20T16:10:00.000Z');
  assert.equal(heureParis(new Date('2026-10-25T17:00:09Z')), '18:00:09');
  const p = partiesParis(new Date('2026-10-18T15:59:59Z'));
  assert.deepEqual(p, { dateISO: '2026-10-18', heure: 17, minute: 59, seconde: 59, jourSemaine: 0 });
});

test('28 mars 2027 : 18h passe de UTC+1 à UTC+2 ; 2h30 n’existe pas cette nuit-là', () => {
  assert.equal(instantParis('2027-03-27', 18, 0).toISOString(), '2027-03-27T17:00:00.000Z'); // hiver
  assert.equal(instantParis('2027-03-28', 18, 0).toISOString(), '2027-03-28T16:00:00.000Z'); // jour du passage à l'été
  assert.throws(() => instantParis('2027-03-28', 2, 30), /inexistante/);
  // 25 octobre 2026 : 2h30 existe deux fois ; on prend la première (encore à l'heure d'été).
  assert.equal(instantParis('2026-10-25', 2, 30).toISOString(), '2026-10-25T00:30:00.000Z');
});

test('17:59:59 contre 18:00:00 : le jour de jeu bascule à 18h pile, heure de Paris', () => {
  // Un jour ordinaire.
  assert.equal(jourDeJeu(new Date('2026-10-20T15:59:59Z')), '2026-10-19'); // mardi 17:59:59
  assert.equal(jourDeJeu(new Date('2026-10-20T16:00:00Z')), '2026-10-20'); // mardi 18:00:00
  // Dimanche 25 octobre 2026, passage à l'heure d'hiver (UTC+1 l'après-midi).
  assert.equal(heureParis(new Date('2026-10-25T16:59:59Z')), '17:59:59');
  assert.equal(jourDeJeu(new Date('2026-10-25T16:59:59Z')), '2026-10-24');
  assert.equal(jourDeJeu(new Date('2026-10-25T16:59:59.999Z')), '2026-10-24');
  assert.equal(jourDeJeu(new Date('2026-10-25T17:00:00Z')), '2026-10-25');
  // À 16:00Z ce jour-là, il est 17h à Paris : la veille d'une heure d'été ne vaut plus.
  assert.equal(jourDeJeu(new Date('2026-10-25T16:00:00Z')), '2026-10-24');
  // Dimanche 28 mars 2027, passage à l'heure d'été (UTC+2 l'après-midi).
  assert.equal(heureParis(new Date('2027-03-28T15:59:59Z')), '17:59:59');
  assert.equal(jourDeJeu(new Date('2027-03-28T15:59:59Z')), '2027-03-27');
  assert.equal(jourDeJeu(new Date('2027-03-28T16:00:00Z')), '2027-03-28');
  // À 17:00Z ce jour-là, il est déjà 19h à Paris.
  assert.equal(jourDeJeu(new Date('2027-03-28T17:00:00Z')), '2027-03-28');
  // Minuit ne change rien : le jour de jeu court de 18h à 18h.
  assert.equal(jourDeJeu(new Date('2026-10-25T23:30:00Z')), '2026-10-25'); // 0h30 le lundi 26
});

test('un jour de jeu dure 25 heures la nuit du 25 octobre 2026, 23 heures celle du 28 mars 2027', () => {
  const heures = (jour: string) => (fermetureDuJour(jour).getTime() - ouvertureDuJour(jour).getTime()) / 3_600_000;
  assert.equal(heures('2026-10-24'), 25);
  assert.equal(heures('2026-10-25'), 24);
  assert.equal(heures('2027-03-27'), 23);
  assert.equal(heures('2027-03-28'), 24);
  assert.equal(ouvertureDuJour('2026-10-24').toISOString(), '2026-10-24T16:00:00.000Z');
  assert.equal(fermetureDuJour('2026-10-24').toISOString(), '2026-10-25T17:00:00.000Z');
  assert.equal(fermetureDuJour('2027-03-27').toISOString(), '2027-03-28T16:00:00.000Z');
});

test('l’horloge simulée franchit 18h et les changements d’heure', () => {
  const h = horlogeReglable(new Date('2026-10-25T16:59:59Z'));
  assert.equal(jourDeJeu(h.maintenant()), '2026-10-24');
  h.avancer(1000);
  assert.equal(jourDeJeu(h.maintenant()), '2026-10-25');
  assert.equal(heureParis(h.maintenant()), '18:00:00');
  h.regler(new Date('2027-03-28T15:59:59Z'));
  assert.equal(jourDeJeu(h.maintenant()), '2027-03-27');
  h.avancer(1000);
  assert.equal(jourDeJeu(h.maintenant()), '2027-03-28');
});

test('dates civiles et semaine nommée par son dimanche (règle 12)', () => {
  assert.equal(ajouterJours('2026-10-25', 1), '2026-10-26');
  assert.equal(ajouterJours('2027-03-01', -1), '2027-02-28');
  assert.equal(ajouterJours('2028-03-01', -1), '2028-02-29');
  assert.equal(jourSemaine('2026-10-25'), 0);
  assert.equal(jourSemaine('2027-03-28'), 0);
  assert.equal(dimancheDeLaSemaine('2026-10-19'), '2026-10-25'); // lundi
  assert.equal(dimancheDeLaSemaine('2026-10-24'), '2026-10-25'); // samedi
  assert.equal(dimancheDeLaSemaine('2026-10-25'), '2026-10-25'); // le dimanche clôt sa semaine
  assert.equal(dimancheDeLaSemaine('2026-10-26'), '2026-11-01');
  assert.equal(dimancheDeLaSemaine('2027-03-28'), '2027-03-28');
  assert.throws(() => ajouterJours('25/10/2026', 1), /illisible/);
});
