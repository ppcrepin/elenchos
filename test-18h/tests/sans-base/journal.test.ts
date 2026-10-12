// P-07 : le journal ne peut rien écrire de personnel, par construction (champs et textes d'une liste fermée).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assainir, creerJournal, typeErreur, type Ligne } from '../../src/journal.ts';
import { TRACEUR } from '../aides/outils.ts';

test('une ligne ne garde que ses champs permis, et des valeurs de liste fermée', () => {
  const sale = {
    evenement: 'requete', route: `/api/recu?email=${TRACEUR.email}`, statut: 200, requete: TRACEUR.sub,
    erreur: `Erreur avec ${TRACEUR.email}`, detail: TRACEUR.nom, manquants: ['SOIRS', TRACEUR.email],
    adresse: 'https://web.push.apple.com/' + TRACEUR.endpointChemin, ip: '203.0.113.7',
  } as unknown as Ligne;
  const propre = assainir(sale);
  assert.deepEqual(propre, { evenement: 'requete', route: '(autre)', statut: 200, erreur: 'autre', manquants: ['SOIRS'] });
  const lignes: string[] = [];
  creerJournal((t) => lignes.push(t)).ecrire(sale);
  const tout = lignes.join('');
  for (const v of Object.values(TRACEUR)) assert.ok(!tout.includes(v));
  assert.ok(!tout.includes('203.0.113.7'));
});

test('le type d’une erreur, jamais son message', () => {
  assert.equal(typeErreur(Object.assign(new Error(`clé ${TRACEUR.email} en double`), { code: '23505' })), '23505');
  assert.equal(typeErreur(new TypeError(TRACEUR.email)), 'TypeError');
  assert.equal(typeErreur(Object.assign(new Error('x'), { code: TRACEUR.email })), 'Error');
  assert.equal(typeErreur(TRACEUR.email), 'autre');
  assert.equal(typeErreur({ name: TRACEUR.nom }), 'autre');
});
