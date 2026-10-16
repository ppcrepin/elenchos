// La garde des horaires (D-043, D-054) : aucune installation de 15h à 19h ni le dimanche, heure de Paris.
// Origine : test-18h/tests/sans-base/horloge-et-horaires.test.ts et garde-active.test.ts (REPRIS).
//
// LE DERNIER TEST ÉCHOUE EXPRÈS de 15h à 19h et le dimanche, heure de Paris : la fabrication chez Scalingo et la
// vérification sur GitHub échouent alors, et rien ne s'installe. En local seulement : IGNORER_HORAIRES=oui.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { test } from 'node:test';
import { environnementProtege, fenetreInterdite, MARQUEURS_PROTEGES, verifierHoraires } from '../../src/serveur/garde-horaires.ts';

test('créneau interdit : de 15h à 19h et tout le dimanche, heure de Paris', () => {
  const t = (iso: string) => fenetreInterdite(new Date(iso));
  assert.equal(t('2026-10-16T12:59:59Z'), false); // vendredi 14h59 (été)
  assert.equal(t('2026-10-16T13:00:00Z'), true); // vendredi 15h00
  assert.equal(t('2026-10-16T16:59:59Z'), true); // vendredi 18h59
  assert.equal(t('2026-10-16T17:00:00Z'), false); // vendredi 19h00
  assert.equal(t('2026-10-17T22:00:00Z'), true); // dimanche 0h00
  assert.equal(t('2026-10-18T21:59:59Z'), true); // dimanche 23h59
  assert.equal(t('2026-10-18T22:00:00Z'), false); // lundi 0h00
  assert.equal(t('2026-10-26T14:00:00Z'), true); // lundi 15h00, heure d'hiver (UTC+1)
  assert.equal(t('2026-10-26T13:59:00Z'), false); // lundi 14h59, heure d'hiver
  assert.equal(t('2026-10-25T08:00:00Z'), true); // dimanche du changement d'heure
  assert.equal(t('2027-03-29T13:00:00Z'), true); // lundi 15h00, heure d'été revenue (UTC+2)
  assert.equal(t('2027-03-29T12:59:59Z'), false);
});

test('IGNORER_HORAIRES ne lève la garde qu’en local, jamais chez Scalingo ni sur GitHub', () => {
  const interdit = new Date('2026-10-16T14:00:00Z'); // vendredi 16h
  assert.equal(verifierHoraires(interdit, {}).ok, false);
  assert.equal(verifierHoraires(interdit, { IGNORER_HORAIRES: 'oui' }).ok, true);
  assert.equal(verifierHoraires(interdit, { IGNORER_HORAIRES: 'OUI' }).ok, false);
  for (const marqueur of MARQUEURS_PROTEGES) {
    const env = { IGNORER_HORAIRES: 'oui', [marqueur]: 'x' };
    assert.equal(environnementProtege(env), true);
    assert.equal(verifierHoraires(interdit, env).ok, false, marqueur);
  }
  assert.equal(verifierHoraires(new Date('2026-10-16T08:00:00Z'), { APP: 'x' }).ok, true);
});

test('l’outil de la garde rend 1 dans le créneau interdit, même avec IGNORER_HORAIRES chez Scalingo ou sur GitHub', () => {
  const outil = join(import.meta.dirname, '..', '..', 'outils', 'garde-horaires.ts');
  const lancer = (env: Record<string, string>) => spawnSync(process.execPath, [outil], {
    env: { PATH: process.env.PATH ?? '', ...env }, encoding: 'utf8',
  });
  const local = lancer({ IGNORER_HORAIRES: 'oui' });
  assert.equal(local.status, 0, local.stdout);
  const protege = lancer({ IGNORER_HORAIRES: 'oui', CI: 'true' });
  assert.equal(protege.status, fenetreInterdite(new Date()) ? 1 : 0, protege.stdout);
  assert.match(protege.stdout, /^Horaires : /);
});

test('garde des horaires : pas d’installation de 15h à 19h ni le dimanche (échoue exprès dans ces créneaux)', () => {
  const verdict = verifierHoraires(new Date(), process.env);
  assert.ok(verdict.ok, verdict.message);
});
