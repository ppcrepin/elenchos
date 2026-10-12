// REPRIS pour le vrai jeu (proposé) : créneaux, P-05, mesure « reçu ».
// Les créneaux d'envoi, le contenu des messages (P-05 : rien de personnel) et le resultat des réceptions.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classer, libelleReponse } from '../../src/mesure.ts';
import { accepteSecondeForme, contenuDuMessage, creneauxDuSoir, titreDuSoir } from '../../src/planificateur.ts';

test('message classique à 18h00 pour les téléphones du soir ; seconde forme à 18h10, soir 3, T1 seulement', () => {
  const tous = [1, 2, 3, 4, 5];
  assert.deepEqual(creneauxDuSoir({ dateISO: '2026-10-18', numero: 1, telephones: tous }).map((c) => [c.forme, c.heure, c.minute, c.telephones]), [
    ['classique', 18, 0, tous],
  ]);
  assert.deepEqual(creneauxDuSoir({ dateISO: '2026-10-20', numero: 3, telephones: tous }).map((c) => [c.forme, c.heure, c.minute, c.telephones]), [
    ['classique', 18, 0, tous], ['declarative', 18, 10, [1]],
  ]);
  assert.equal(creneauxDuSoir({ dateISO: '2026-10-20', numero: 3, telephones: [2] }).length, 1);
  assert.equal(accepteSecondeForme('iOS 18.4'), true);
  assert.equal(accepteSecondeForme('iOS 26.0'), true);
  assert.equal(accepteSecondeForme(null), true);
  assert.equal(accepteSecondeForme('iOS 18.3.2'), false);
  assert.equal(accepteSecondeForme('iOS 16.4'), false);
});

test('les messages : neutres, « Test, soir n sur 3 », sans rien de personnel (P-05)', () => {
  assert.equal(titreDuSoir(1), 'Test, soir 1 sur 3');
  assert.equal(titreDuSoir(3), 'Test, soir 3 sur 3');
  assert.equal(titreDuSoir(0), 'Test, répétition');
  assert.equal(titreDuSoir(4), 'Test, soir ajouté');
  const id = '0b6f5a3e-58a5-4c0e-9a51-3d7c2b1a9e40';
  assert.deepEqual(contenuDuMessage('classique', 'Test, soir 1 sur 3', id, 'https://x.invalid'), {
    notification: { title: 'Test, soir 1 sur 3', lang: 'fr', data: { envoi: id } },
  });
  assert.deepEqual(contenuDuMessage('declarative', 'T', id, 'https://x.invalid'), {
    web_push: 8030, mutable: true, notification: { title: 'T', lang: 'fr', data: { envoi: id }, navigate: 'https://x.invalid/' },
  });
});

test('resultat : à l’heure avant 18h02, acceptable avant 18h05, en retard jusqu’à 18h30, manqué au-delà', () => {
  const base = {
    nature: 'soir' as const, soir_date: '2026-10-19', forme: 'classique' as const,
    envoye_a: new Date('2026-10-19T16:00:01Z'), repondu_a: new Date('2026-10-19T16:00:01.300Z'), reponse_code: 201,
  };
  const apres = (iso: string) => new Date(iso);
  const c = (recu: string | null, maintenant = '2026-10-19T17:00:00Z') =>
    classer({ ...base, recu_a: recu ? apres(recu) : null }, apres(maintenant));
  assert.deepEqual(c('2026-10-19T16:00:09Z'), { resultat: 'à l’heure', ecart: 9 });
  assert.deepEqual(c('2026-10-19T16:02:00Z'), { resultat: 'acceptable', ecart: 120 });
  assert.deepEqual(c('2026-10-19T16:05:00Z'), { resultat: 'en retard', ecart: 300 });
  assert.deepEqual(c('2026-10-19T16:31:00Z'), { resultat: 'manqué', ecart: 1860 });
  assert.deepEqual(c(null), { resultat: 'manqué', ecart: null });
  assert.deepEqual(c(null, '2026-10-19T16:10:00Z'), { resultat: 'en attente', ecart: null });
  assert.equal(classer({ ...base, reponse_code: 410, recu_a: null }, apres('2026-10-19T17:00:00Z')).resultat, 'refusé par le service');
  assert.equal(classer({ ...base, reponse_code: null, repondu_a: null, recu_a: null }, apres('2026-10-19T16:10:00Z')).resultat, 'envoi interrompu');
  assert.equal(libelleReponse(201, null), 'accepté');
  assert.equal(libelleReponse(410, null), 'refusé 410');
  assert.equal(libelleReponse(null, 'Reseau'), 'pas de réponse (Reseau)');
});
