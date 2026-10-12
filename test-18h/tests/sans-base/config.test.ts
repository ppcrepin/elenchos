// JETABLE (test du message de 18h).
// Les réglages : cinq codes d'essai, calendrier des soirs, clé d'Apple ; un réglage absent est signalé par son nom.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lireClePriveeApple, lireConfig, lireSoirs, normaliserCode } from '../../src/config.ts';
import { clePriveeAppleEnPem, CODES, envDeTest } from '../aides/outils.ts';

test('configuration complète : rien ne manque', () => {
  const c = lireConfig(envDeTest());
  assert.deepEqual(c.manquants, []);
  assert.equal(c.codesEssai?.length, 5);
  assert.equal(c.codesEssai?.[0], 'aaaabbbbcccc');
});

test('codes d’essai : exactement cinq, tous différents, assez longs ; sinon l’abonnement est coupé', () => {
  assert.equal(lireConfig(envDeTest({ CODES_ESSAI: CODES.slice(0, 4).join(';') })).codesEssai, null);
  assert.equal(lireConfig(envDeTest({ CODES_ESSAI: [...CODES.slice(0, 4), CODES[0]].join(';') })).codesEssai, null);
  assert.equal(lireConfig(envDeTest({ CODES_ESSAI: 'a;b;c;d;e' })).codesEssai, null);
  assert.ok(lireConfig(envDeTest({ CODES_ESSAI: 'a;b;c;d;e' })).manquants.includes('CODES_ESSAI'));
  assert.equal(normaliserCode(' AAAA-bbbb cccc '), 'aaaabbbbcccc');
});

test('un réglage absent est signalé par son nom, jamais par une valeur', () => {
  const env = envDeTest();
  delete env.GOOGLE_SECRET_CLIENT;
  env.VAPID_CLE_PRIVEE = 'pas-une-cle';
  const c = lireConfig(env);
  assert.equal(c.google, null);
  assert.equal(c.vapid, null);
  assert.ok(c.manquants.includes('GOOGLE_SECRET_CLIENT'));
  assert.ok(c.manquants.includes('VAPID_CLE_PUBLIQUE'));
  for (const m of c.manquants) assert.match(m, /^[A-Z_]+$/);
});

test('calendrier des soirs : dates réelles, numéro du soir, téléphones visés', () => {
  assert.deepEqual(lireSoirs('2026-10-18=1; 2026-10-16=0@1; 2026-10-21=4@3+1'), [
    { dateISO: '2026-10-16', numero: 0, telephones: [1] },
    { dateISO: '2026-10-18', numero: 1, telephones: [1, 2, 3, 4, 5] },
    { dateISO: '2026-10-21', numero: 4, telephones: [1, 3] },
  ]);
  assert.equal(lireSoirs('2026-02-30=1'), null);
  assert.equal(lireSoirs('2026-10-18=1;2026-10-18=2'), null);
  assert.equal(lireSoirs('2026-10-18=1@6'), null);
  assert.equal(lireSoirs('demain'), null);
});

test('clé .p8 d’Apple : acceptée en PEM, sur une ligne, ou en base64 ; refusée sinon', () => {
  const pem = clePriveeAppleEnPem();
  assert.ok(lireClePriveeApple(pem));
  assert.ok(lireClePriveeApple(pem.replace(/\n/g, ' ')));
  assert.ok(lireClePriveeApple(Buffer.from(pem).toString('base64')));
  assert.equal(lireClePriveeApple('n’importe quoi'), null);
});

test('chez Scalingo, l’adresse publique se déduit du nom de l’application et de la région', () => {
  const env = envDeTest({ CONTAINER: 'web-1', APP: 'elenchos-test-18h', REGION_NAME: 'osc-fr1' });
  delete env.ADRESSE_PUBLIQUE;
  const c = lireConfig(env);
  assert.equal(c.adressePublique, 'https://elenchos-test-18h.osc-fr1.scalingo.io');
  assert.equal(c.enLigne, true);
});
