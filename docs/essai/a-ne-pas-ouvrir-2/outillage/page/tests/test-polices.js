/* Tests de la vérification de U+202F dans les polices embarquées (§8.8) :
 * polices/verifier-202f.js, lecteur WOFF2 sans dépendance.
 *   node --test tests/test-polices.js
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const V = require('../polices/verifier-202f.js');

const DOSSIER = path.join(__dirname, '..', 'polices');

/** Réécrit une police WOFF2 après avoir modifié son flux décompressé (tables de même longueur). */
function modifier(octets, f) {
  const b = Buffer.from(octets);
  const nTables = b.readUInt16BE(12);
  let p = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const x = b[p++]; v = (v << 7) | (x & 0x7f); if (!(x & 0x80)) { return v; } } throw new Error('base128'); };
  const dir = [];
  for (let i = 0; i < nTables; i++) {
    const flags = b[p++];
    if ((flags & 0x3f) === 0x3f) { p += 4; }
    const tag = flags & 0x3f;
    const version = (flags >> 6) & 3;
    const lg = base128();
    const transformee = (tag === 10 || tag === 11) ? version === 0 : version !== 0;
    dir.push({ tag, longueur: transformee ? base128() : lg });
  }
  const debut = p, taille = b.readUInt32BE(20);
  const flux = Buffer.from(zlib.brotliDecompressSync(b.subarray(debut, debut + taille)));
  f(flux, dir);
  const comp = zlib.brotliCompressSync(flux);
  const sortie = Buffer.concat([b.subarray(0, debut), comp]);
  sortie.writeUInt32BE(sortie.length, 8);
  sortie.writeUInt32BE(comp.length, 20);
  return sortie;
}

test('U+202F : les six faces embarquées ont un glyphe vide à la chasse du §8.8', () => {
  for (const [fichier, chasse] of Object.entries(V.CHASSES_202F)) {
    const r = V.verifierFace(fs.readFileSync(path.join(DOSSIER, fichier)), chasse);
    assert.ok(r.ok, fichier + ' : ' + r.message);
    assert.equal(r.contours, 0);
  }
});

test('U+202F : une chasse attendue différente est refusée', () => {
  const r = V.verifierFace(fs.readFileSync(path.join(DOSSIER, 'alegreya-sans-700.woff2')), 102);
  assert.ok(!r.ok);
  assert.match(r.message, /101 millièmes, 102 attendus/);
});

test('U+202F : une chasse modifiée dans la police est refusée', () => {
  const o = fs.readFileSync(path.join(DOSSIER, 'alegreya-700.woff2'));
  const t = V.tablesWoff2(o);
  const g = V.glypheDe(t.cmap.donnees, 0x202f);
  const nMet = t.hhea.donnees.readUInt16BE(34);
  const m = modifier(o, (flux, dir) => {
    // position de hmtx dans le flux : somme des longueurs des tables qui la précèdent (ordre du répertoire)
    let pos = 0;
    for (const d of dir) { if (d.tag === 3) { break; } pos += d.longueur; }
    flux.writeUInt16BE(150, pos + 4 * Math.min(g, nMet - 1));
  });
  const r = V.verifierFace(m, 116);
  assert.ok(!r.ok);
  assert.match(r.message, /150 millièmes/);
});

test('U+202F : un glyphe avec un contour est refusé', () => {
  const o = fs.readFileSync(path.join(DOSSIER, 'alegreya-700.woff2'));
  const t = V.tablesWoff2(o);
  const g = V.glypheDe(t.cmap.donnees, 0x202f);
  const m = modifier(o, (flux, dir) => {
    let pos = 0;
    for (const d of dir) { if (d.tag === 10) { break; } pos += d.longueur; }
    flux.writeInt16BE(1, pos + 36 + 2 * g); // flux nContour de glyf transformée
  });
  const r = V.verifierFace(m, 116);
  assert.ok(!r.ok);
  assert.match(r.message, /contour/);
});

test('U+202F : une face sans U+202F est refusée', () => {
  const o = fs.readFileSync(path.join(DOSSIER, 'alegreya-700.woff2'));
  const m = modifier(o, (flux, dir) => {
    // cmap : tout point de code U+202F renvoyé vers le glyphe 0 en effaçant les segments qui le couvrent
    let pos = 0;
    for (const d of dir) { if (d.tag === 0) { break; } pos += d.longueur; }
    const cmap = flux.subarray(pos);
    const n = cmap.readUInt16BE(2);
    for (let i = 0; i < n; i++) {
      const off = cmap.readUInt32BE(8 + 8 * i), t = cmap.subarray(off), format = t.readUInt16BE(0);
      if (format === 4) {
        const segX2 = t.readUInt16BE(6);
        for (let s = 0; s < segX2 / 2; s++) {
          const fin = t.readUInt16BE(14 + 2 * s), deb = t.readUInt16BE(16 + segX2 + 2 * s);
          if (deb <= 0x202f && fin >= 0x202f) { t.writeUInt16BE(0, 16 + 3 * segX2 + 2 * s); t.writeInt16BE(-0x202f, 16 + 2 * segX2 + 2 * s); }
        }
      }
      if (format === 12) {
        const nG = t.readUInt32BE(12);
        for (let s = 0; s < nG; s++) { if (t.readUInt32BE(16 + 12 * s) <= 0x202f && t.readUInt32BE(20 + 12 * s) >= 0x202f) { t.writeUInt32BE(0, 24 + 12 * s); } }
      }
    }
  });
  const r = V.verifierFace(m, 116);
  assert.ok(!r.ok, r.message);
});
