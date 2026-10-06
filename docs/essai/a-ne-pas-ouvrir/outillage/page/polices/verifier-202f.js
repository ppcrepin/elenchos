/* Vérifie U+202F dans des polices WOFF2 (§8.8, « Vérification ») : la face
 * a un glyphe relié à U+202F, ce glyphe n'a aucun contour, et sa chasse
 * vaut la valeur attendue (en millièmes de cadratin).
 *
 * Sans dépendance : Node 22 (brotli de la bibliothèque standard). Lit le
 * format WOFF2 (W3C, « WOFF File Format 2.0 ») : en-tête, répertoire des
 * tables, flux décompressé ; tables cmap, head, hhea, maxp, hmtx (brute ou
 * transformée) et glyf (brute avec loca, ou transformée : flux nContour).
 *
 * Emplois :
 *   - par la construction (construire.py), sur chaque face avant de
 *     l'embarquer : elle refuse de s'exécuter si une vérification échoue ;
 *   - par le contrôle 5 (harnais/controle5.js), sur les polices lues dans
 *     les octets de la page construite.
 *
 * Ligne de commande : node verifier-202f.js FICHIER.woff2:CHASSE [...]
 *   sortie 0 si tout est juste, 1 sinon (un message par face).
 */
'use strict';
const zlib = require('node:zlib');

const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT',
  'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
  'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

function lireBase128(b, o) {
  let v = 0;
  for (let i = 0; i < 5; i++) {
    const x = b[o.p++];
    if (i === 0 && x === 0x80) { throw new Error('UIntBase128 : zéro initial'); }
    if (v & 0xfe000000) { throw new Error('UIntBase128 : dépassement'); }
    v = (v << 7) | (x & 0x7f);
    if (!(x & 0x80)) { return v >>> 0; }
  }
  throw new Error('UIntBase128 : trop long');
}

/** Tables d'une police WOFF2 : { tag: { donnees: Buffer, transformee: bool } }. */
function tablesWoff2(octets) {
  const b = Buffer.from(octets);
  if (b.readUInt32BE(0) !== 0x774f4632) { throw new Error('signature WOFF2 absente'); }
  if (b.readUInt32BE(4) === 0x74746366) { throw new Error('collection WOFF2 non prise en charge'); }
  const nTables = b.readUInt16BE(12);
  const tailleComprimee = b.readUInt32BE(20);
  const o = { p: 48 };
  const dir = [];
  for (let i = 0; i < nTables; i++) {
    const flags = b[o.p++];
    const idx = flags & 0x3f;
    let tag;
    if (idx === 0x3f) { tag = b.toString('latin1', o.p, o.p + 4); o.p += 4; } else { tag = TAGS[idx]; }
    const version = (flags >> 6) & 3;
    const longueur = lireBase128(b, o);
    const transformee = (tag === 'glyf' || tag === 'loca') ? version === 0 : version !== 0;
    const longueurT = transformee ? lireBase128(b, o) : longueur;
    dir.push({ tag, transformee, longueur: longueurT });
  }
  const flux = zlib.brotliDecompressSync(b.subarray(o.p, o.p + tailleComprimee));
  const tables = {};
  let p = 0;
  for (const t of dir) {
    tables[t.tag] = { donnees: flux.subarray(p, p + t.longueur), transformee: t.transformee };
    p += t.longueur;
  }
  if (p !== flux.length) { throw new Error('flux WOFF2 : longueur inattendue'); }
  return tables;
}

/** Glyphe relié au point de code u (cmap 3.10 format 12, sinon 3.1 ou 0.x format 4). */
function glypheDe(cmap, u) {
  const n = cmap.readUInt16BE(2);
  const sous = [];
  for (let i = 0; i < n; i++) {
    sous.push({ pid: cmap.readUInt16BE(4 + 8 * i), eid: cmap.readUInt16BE(6 + 8 * i), off: cmap.readUInt32BE(8 + 8 * i) });
  }
  const rang = s => (s.pid === 3 && s.eid === 10 ? 0 : (s.pid === 0 && s.eid >= 4 ? 1 : (s.pid === 3 && s.eid === 1 ? 2 : (s.pid === 0 ? 3 : 9))));
  sous.sort((a, b) => rang(a) - rang(b));
  for (const s of sous) {
    if (rang(s) === 9) { continue; }
    const t = cmap.subarray(s.off);
    const format = t.readUInt16BE(0);
    if (format === 12) {
      const nG = t.readUInt32BE(12);
      for (let i = 0; i < nG; i++) {
        const deb = t.readUInt32BE(16 + 12 * i), fin = t.readUInt32BE(20 + 12 * i), g = t.readUInt32BE(24 + 12 * i);
        if (u >= deb && u <= fin) { return g + (u - deb); }
      }
      return 0;
    }
    if (format === 4) {
      const segX2 = t.readUInt16BE(6);
      const fins = 14, debs = 16 + segX2, deltas = 16 + 2 * segX2, ranges = 16 + 3 * segX2;
      for (let i = 0; i < segX2 / 2; i++) {
        const fin = t.readUInt16BE(fins + 2 * i), deb = t.readUInt16BE(debs + 2 * i);
        if (u < deb || u > fin) { continue; }
        const delta = t.readInt16BE(deltas + 2 * i), range = t.readUInt16BE(ranges + 2 * i);
        if (range === 0) { return (u + delta) & 0xffff; }
        const g = t.readUInt16BE(ranges + 2 * i + range + 2 * (u - deb));
        return g === 0 ? 0 : (g + delta) & 0xffff;
      }
      return 0;
    }
  }
  return 0;
}

/** Nombre de contours du glyphe g (0 : glyphe vide). */
function contours(tables, g) {
  const glyf = tables.glyf;
  if (!glyf) { throw new Error('table glyf absente'); }
  if (glyf.transformee) {
    const d = glyf.donnees;
    const nGlyphes = d.readUInt16BE(4);
    if (g >= nGlyphes) { throw new Error('glyphe hors de la table'); }
    return d.readInt16BE(36 + 2 * g);
  }
  const head = tables.head.donnees;
  const long = head.readInt16BE(50) === 1;
  const loca = tables.loca.donnees;
  const deb = long ? loca.readUInt32BE(4 * g) : 2 * loca.readUInt16BE(2 * g);
  const fin = long ? loca.readUInt32BE(4 * g + 4) : 2 * loca.readUInt16BE(2 * g + 2);
  if (fin === deb) { return 0; }
  return glyf.donnees.readInt16BE(deb);
}

/** Chasse (unités) du glyphe g. */
function chasse(tables, g) {
  const nMetriques = tables.hhea.donnees.readUInt16BE(34);
  const h = tables.hmtx;
  const i = Math.min(g, nMetriques - 1);
  if (h.transformee) { return h.donnees.readUInt16BE(1 + 2 * i); }
  return h.donnees.readUInt16BE(4 * i);
}

/** Vérifie une face. Rend { ok, message, glyphe, contours, chasse, millièmes }. */
function verifierFace(octets, chasseAttendue) {
  const t = tablesWoff2(octets);
  const upm = t.head.donnees.readUInt16BE(18);
  const g = glypheDe(t.cmap.donnees, 0x202f);
  if (!g) { return { ok: false, message: 'U+202F absent de la face' }; }
  const n = contours(t, g);
  const c = chasse(t, g);
  const mill = Math.round(c * 1000 / upm);
  if (n !== 0) { return { ok: false, message: 'le glyphe de U+202F a ' + n + ' contour(s)', glyphe: g, contours: n, chasse: c, milliemes: mill }; }
  if (mill !== chasseAttendue) { return { ok: false, message: 'chasse de U+202F : ' + mill + ' millièmes, ' + chasseAttendue + ' attendus', glyphe: g, contours: n, chasse: c, milliemes: mill }; }
  return { ok: true, message: 'U+202F : glyphe ' + g + ', vide, ' + mill + ' millièmes', glyphe: g, contours: n, chasse: c, milliemes: mill };
}

/** Chasses attendues, face par face (§8.8 ; réponse de la Direction artistique à Q-F1). */
const CHASSES_202F = {
  'alegreya-700.woff2': 116, 'alegreya-italique-500.woff2': 124, 'alegreya-italique-700.woff2': 116,
  'alegreya-sans-400.woff2': 103, 'alegreya-sans-700.woff2': 101, 'alegreya-sans-italique-400.woff2': 105
};
/** Face embarquée → fichier, par famille, style et graisse (construire.py). */
const FACES = [
  ['Alegreya', 'normal', 700, 'alegreya-700.woff2'], ['Alegreya', 'italic', 500, 'alegreya-italique-500.woff2'],
  ['Alegreya', 'italic', 700, 'alegreya-italique-700.woff2'], ['Alegreya Sans', 'normal', 400, 'alegreya-sans-400.woff2'],
  ['Alegreya Sans', 'normal', 700, 'alegreya-sans-700.woff2'], ['Alegreya Sans', 'italic', 400, 'alegreya-sans-italique-400.woff2']
];

module.exports = { verifierFace, tablesWoff2, glypheDe, CHASSES_202F, FACES };

if (require.main === module) {
  const fs = require('node:fs');
  let ok = true;
  for (const a of process.argv.slice(2)) {
    const i = a.lastIndexOf(':');
    const r = verifierFace(fs.readFileSync(a.slice(0, i)), +a.slice(i + 1));
    process.stdout.write((r.ok ? 'juste : ' : 'FAUX : ') + a.slice(0, i) + ' : ' + r.message + '\n');
    if (!r.ok) { ok = false; }
  }
  process.exit(ok ? 0 : 1);
}
