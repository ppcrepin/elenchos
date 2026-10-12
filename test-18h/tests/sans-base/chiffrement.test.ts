// REPRIS pour le vrai jeu (proposé) : test de P-06.
// P-06 : le contenu du message est chiffré pour le seul téléphone destinataire (RFC 8291).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chiffrerMessage, TAILLE_MAX_CONTENU } from '../../src/push/chiffrement.ts';
import { dechiffrer, fauxTelephone, TRACEUR } from '../aides/outils.ts';

test('RFC 8291, annexe A : le message chiffré est identique, octet pour octet', () => {
  const sortie = chiffrerMessage(Buffer.from('When I grow up, I want to be a watermelon'), {
    p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
    auth: 'BTBZMqHH6r4Tts7J_aSIgg',
  }, {
    clePriveeServeur: Buffer.from('yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw', 'base64url'),
    sel: Buffer.from('DGv6ra1nlYgDCS1FRnbzlw', 'base64url'),
  });
  assert.equal(
    sortie.toString('base64url'),
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
  );
});

test('le téléphone destinataire, et lui seul, retrouve le message', () => {
  const tel = fauxTelephone();
  const autre = fauxTelephone();
  const corps = chiffrerMessage(Buffer.from(`{"t":"${TRACEUR.nom}"}`), tel.abonnement.keys);
  assert.equal(dechiffrer(corps, tel), `{"t":"${TRACEUR.nom}"}`);
  assert.ok(!corps.includes(Buffer.from(TRACEUR.nom)), 'le traceur ne doit pas apparaître en clair');
  assert.throws(() => dechiffrer(corps, autre));
});

test('deux envois du même message donnent deux suites chiffrées différentes', () => {
  const tel = fauxTelephone();
  const a = chiffrerMessage(Buffer.from('même message'), tel.abonnement.keys);
  const b = chiffrerMessage(Buffer.from('même message'), tel.abonnement.keys);
  assert.notDeepEqual(a, b);
});

test('sans clés de chiffrement, ou avec des clés illisibles, l’envoi est refusé (P-06)', () => {
  // @ts-expect-error : appel volontairement incomplet
  assert.throws(() => chiffrerMessage(Buffer.from('x'), undefined), /P-06/);
  // @ts-expect-error : appel volontairement incomplet
  assert.throws(() => chiffrerMessage(Buffer.from('x'), { p256dh: 'abc' }), /P-06/);
  assert.throws(() => chiffrerMessage(Buffer.from('x'), { p256dh: 'AAAA', auth: 'AAAA' }), /P-06/);
});

test('un message trop long est refusé (Apple : 4 Ko au plus)', () => {
  const tel = fauxTelephone();
  assert.throws(() => chiffrerMessage(Buffer.alloc(TAILLE_MAX_CONTENU + 1), tel.abonnement.keys), /trop long/);
  assert.equal(chiffrerMessage(Buffer.alloc(TAILLE_MAX_CONTENU), tel.abonnement.keys).length, 4096);
});
