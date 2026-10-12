// REPRIS pour le vrai jeu (proposé) : la garde des horaires.
// LA GARDE DES HORAIRES. Ce test échoue exprès de 15h à 19h et le dimanche, heure de Paris (D-043, D-054) :
// la fabrication chez Scalingo et la vérification sur GitHub échouent alors, et rien ne s'installe.
// En local seulement : IGNORER_HORAIRES=oui (refusé chez Scalingo et sur GitHub).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifierHoraires } from '../../src/garde-horaires.ts';

test('garde des horaires : pas d’installation de 15h à 19h ni le dimanche', () => {
  const verdict = verifierHoraires(new Date(), process.env);
  assert.ok(verdict.ok, verdict.message);
});
