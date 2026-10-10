/* Remet journal.json et durees.json de chaque partie sous forme canonique (N.jsonCanonique). */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../../noyau.js');
const d = process.argv[2];
for (const id of fs.readdirSync(d)) {
  for (const f of ['journal.json', 'durees.json']) {
    const p = path.join(d, id, f);
    if (fs.existsSync(p)) { fs.writeFileSync(p, N.jsonCanonique(JSON.parse(fs.readFileSync(p, 'utf8')))); }
  }
}
