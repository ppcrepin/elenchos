// REPRIS pour le vrai jeu (proposé) : horloge de 18h et règle des horaires.
// L'horloge de Paris (changements d'heure compris) et la règle des horaires de mise en ligne (D-043).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { environnementProtege, fenetreInterdite, verifierHoraires } from '../../src/garde-horaires.ts';
import { heureParis, instantParis, lendemain, partiesParis } from '../../src/horloge.ts';

test('18h à Paris, l’hiver et l’été, et autour des changements d’heure', () => {
  assert.equal(instantParis('2026-10-24', 18, 0).toISOString(), '2026-10-24T16:00:00.000Z'); // été (UTC+2)
  assert.equal(instantParis('2026-10-25', 18, 0).toISOString(), '2026-10-25T17:00:00.000Z'); // jour du passage à l'hiver
  assert.equal(instantParis('2026-10-26', 18, 0).toISOString(), '2026-10-26T17:00:00.000Z');
  assert.equal(instantParis('2026-03-28', 18, 0).toISOString(), '2026-03-28T17:00:00.000Z');
  assert.equal(instantParis('2026-03-29', 18, 0).toISOString(), '2026-03-29T16:00:00.000Z'); // jour du passage à l'été
  assert.equal(instantParis('2026-10-20', 18, 10).toISOString(), '2026-10-20T16:10:00.000Z');
  assert.throws(() => instantParis('2026-03-29', 2, 30), /inexistante/); // 2h30 n'existe pas ce jour-là
  assert.equal(heureParis(new Date('2026-10-25T17:00:09Z')), '18:00:09');
  assert.equal(lendemain('2026-10-24'), '2026-10-25');
  assert.equal(lendemain('2026-10-25'), '2026-10-26');
  const p = partiesParis(new Date('2026-10-18T15:59:59Z'));
  assert.deepEqual(p, { dateISO: '2026-10-18', heure: 17, minute: 59, seconde: 59, jourSemaine: 0 });
});

test('créneau interdit : de 15h à 19h et tout le dimanche, heure de Paris', () => {
  const paris = (iso: string) => new Date(iso);
  assert.equal(fenetreInterdite(paris('2026-10-16T12:59:59Z')), false); // vendredi 14h59
  assert.equal(fenetreInterdite(paris('2026-10-16T13:00:00Z')), true); // vendredi 15h00
  assert.equal(fenetreInterdite(paris('2026-10-16T16:59:59Z')), true); // vendredi 18h59
  assert.equal(fenetreInterdite(paris('2026-10-16T17:00:00Z')), false); // vendredi 19h00
  assert.equal(fenetreInterdite(paris('2026-10-17T22:00:00Z')), true); // dimanche 0h00
  assert.equal(fenetreInterdite(paris('2026-10-18T21:59:59Z')), true); // dimanche 23h59
  assert.equal(fenetreInterdite(paris('2026-10-18T22:00:00Z')), false); // lundi 0h00
  assert.equal(fenetreInterdite(paris('2026-10-26T14:00:00Z')), true); // lundi 15h00, heure d'hiver (UTC+1)
  assert.equal(fenetreInterdite(paris('2026-10-26T13:59:00Z')), false); // lundi 14h59, heure d'hiver
});

test('IGNORER_HORAIRES ne lève la garde qu’en local, jamais chez Scalingo ni sur GitHub', () => {
  const interdit = new Date('2026-10-16T14:00:00Z'); // vendredi 16h
  assert.equal(verifierHoraires(interdit, {}).ok, false);
  assert.equal(verifierHoraires(interdit, { IGNORER_HORAIRES: 'oui' }).ok, true);
  for (const marqueur of ['SOURCE_VERSION', 'APP', 'CONTAINER', 'SCALINGO_POSTGRESQL_URL', 'STACK', 'CI', 'GITHUB_ACTIONS']) {
    const env = { IGNORER_HORAIRES: 'oui', [marqueur]: 'x' };
    assert.equal(environnementProtege(env), true);
    assert.equal(verifierHoraires(interdit, env).ok, false, marqueur);
  }
  assert.equal(verifierHoraires(new Date('2026-10-16T08:00:00Z'), { APP: 'x' }).ok, true);
});
