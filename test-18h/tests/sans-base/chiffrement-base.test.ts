// REPRIS pour le vrai jeu (proposé) : la connexion à la base est chiffrée, sauf demande explicite (base locale).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chiffrementBase } from '../../src/base.ts';

test('sans « sslmode », la connexion est chiffrée comme avec « prefer » ; en clair seulement avec « disable »', () => {
  const sans = chiffrementBase('postgresql://u:x@base.exemple.invalid:31000/b');
  assert.deepEqual(sans.ssl, { rejectUnauthorized: false });
  assert.deepEqual(chiffrementBase('postgresql://u:x@base.exemple.invalid:31000/b?sslmode=prefer').ssl, { rejectUnauthorized: false });
  assert.deepEqual(chiffrementBase('postgresql://u:x@base.exemple.invalid:31000/b?sslmode=require').ssl, { rejectUnauthorized: false });
  assert.deepEqual(chiffrementBase('postgresql://u:x@base.exemple.invalid:31000/b?sslmode=verify-full').ssl, { rejectUnauthorized: true });
  assert.equal(chiffrementBase('postgresql://u:x@127.0.0.1:54329/b?sslmode=disable').ssl, false);
  assert.ok(!chiffrementBase('postgresql://u:x@h:1/b?sslmode=prefer').adresse.includes('sslmode'));
});
