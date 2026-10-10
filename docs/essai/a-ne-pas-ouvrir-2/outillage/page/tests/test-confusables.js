/* Table des lettres qui imitent les nôtres (lot 6 ; §8.8 ; §7.19, E7) : tirée de confusables.txt
 * 16.0.0 (confusables/reduire.py), embarquée par construire.py. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const J = require('../journal.js');

const t = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'confusables', 'table-16.0.0.json'), 'ascii'));

test('Table des confusables : version et source du §8.8, un caractère vers une lettre de A à Z', () => {
  assert.equal(t.version, '16.0.0');
  assert.equal(t.source_sha256, '95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611');
  assert.ok(Object.keys(t.table).length > 500);
  assert.ok(Object.entries(t.table).every(([k, v]) => Array.from(k).length === 1 && /^[A-Za-z]$/.test(v)));
  assert.equal(t.table['а'], 'a'); // а cyrillique
  assert.equal(t.table['о'], 'o'); // о cyrillique
});

test('Pseudo imité par des lettres d\'un autre alphabet : refusé avec la table, accepté sans (E7)', () => {
  const imite = 'Аgаthe'; // « Аgаthe » : deux а cyrilliques
  assert.equal(J.pseudoGardable(imite, {}), true);
  assert.equal(J.pseudoGardable(imite, t.table), false);
  assert.equal(J.pseudoGardable('О', t.table), false); // О cyrillique seul : le rond d'Odile
  assert.equal(J.pseudoGardable('Témoin A', t.table), true);
});
