// Fabrique src/regles/confusables.ts, la table des lettres qui imitent les nôtres (E7), à partir du fichier
// confusables.txt d'Unicode (UTS #39), comme le prévoyait le second essai (docs/essai/a-ne-pas-ouvrir-2, noyau.js,
// `squelette` : « table tirée de confusables.txt à la construction ; {} en attendant »).
//
// Usage : node outils/confusables.ts chemin/vers/confusables.txt
// Le fichier se télécharge à https://www.unicode.org/Public/security/<version>/confusables.txt (ou dans le dépôt
// unicode-org/unicodetools, unicodetools/data/security/<version>/). Il n'est pas gardé dans le dépôt.
//
// Ce qui est retenu, pour un squelette qui met d'abord tout en minuscules sans accents (cercle.ts, `squelette`) :
// - un caractère seul, hors ASCII, qui reste lui-même après décomposition, retrait des accents et minuscules (c'est
//   sous cette forme que le squelette le rencontre) ;
// - dont le modèle, après la même mise en forme, est une seule lettre latine de a à z ou un chiffre de 0 à 9.
// Une majuscule d'un autre alphabet dont la minuscule n'a pas sa propre ligne prête son modèle à cette minuscule
// (par exemple les lettres cherokee). Les ressemblances entre caractères ASCII (« 0 » et « O », « l » et « I ») ne
// sont pas retenues : ce sont nos propres lettres.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const source = process.argv[2];
if (!source) {
  process.stdout.write('Usage : node outils/confusables.ts chemin/vers/confusables.txt\n');
  process.exit(1);
}
const brut = readFileSync(source);
const texte = brut.toString('utf8');
const version = /^# Version: (\S+)$/m.exec(texte)?.[1];
if (!version) throw new Error('confusables.txt : version introuvable');

const forme = (s: string) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
const propres = new Map<string, string>();
const empruntees = new Map<string, string>();
for (const ligne of texte.split('\n')) {
  const m = /^([0-9A-F]{4,6})\s*;\s*([0-9A-F ]+?)\s*;\s*MA\b/.exec(ligne);
  if (!m?.[1] || !m[2]) continue;
  const c = String.fromCodePoint(parseInt(m[1], 16));
  if (c.codePointAt(0)! < 0x80) continue;
  const modele = forme(m[2].split(' ').map((h) => String.fromCodePoint(parseInt(h, 16))).join(''));
  if (!/^[a-z0-9]$/.test(modele)) continue;
  const k = forme(c);
  if ([...k].length !== 1 || k.codePointAt(0)! < 0x80) continue;
  if (k === c) propres.set(c, modele);
  else if (!empruntees.has(k)) empruntees.set(k, modele);
}
const table = new Map(propres);
for (const [k, v] of empruntees) if (!table.has(k)) table.set(k, v);

const parModele = new Map<string, number[]>();
for (const [c, v] of table) parModele.set(v, [...(parModele.get(v) ?? []), c.codePointAt(0)!]);
const lignes = [...parModele.keys()].sort().map((v) => {
  const codes = (parModele.get(v) ?? []).sort((a, b) => a - b);
  const morceaux: string[] = [];
  for (let i = 0; i < codes.length; i += 10) {
    morceaux.push(`'${codes.slice(i, i + 10).map((n) => `\\u{${n.toString(16).toUpperCase()}}`).join('')}'`);
  }
  return `  ${v}: ${morceaux.join('\n    + ')},`;
});

const sortie = `// La table des lettres qui imitent les nôtres (E7) : chaque caractère d'un autre alphabet (ou d'une autre forme)
// qui ressemble à une lettre latine ou à un chiffre, et la lettre ou le chiffre qu'il imite. Elle sert au squelette
// d'un pseudo (cercle.ts), donc à « pseudo_comparaison » : « Mаrie » écrit avec un « а » cyrillique ne passe pas pour un
// autre pseudo que « Marie ».
//
// FICHIER FABRIQUÉ, à ne pas modifier à la main : node outils/confusables.ts confusables.txt (la règle de choix est en
// tête de l'outil). Source : confusables.txt d'Unicode ${version} (UTS #39), SHA-256
// ${createHash('sha256').update(brut).digest('hex')}.
// ${table.size} caractères. Les caractères sont écrits par leur numéro (\\u{…}), jamais tels quels : certains
// s'écrivent de droite à gauche, et le code doit se lire sans surprise.

/** Pour chaque lettre ou chiffre, les caractères qui l'imitent. */
const IMITATIONS: Readonly<Record<string, string>> = {
${lignes.join('\n')}
};

/** Caractère → la lettre latine (a à z) ou le chiffre qu'il imite. */
export const LETTRES_QUI_IMITENT: Readonly<Record<string, string>> = Object.freeze(Object.fromEntries(
  Object.entries(IMITATIONS).flatMap(([lettre, imitations]) => [...imitations].map((c) => [c, lettre])),
));
`;
writeFileSync(join(import.meta.dirname, '..', 'src', 'regles', 'confusables.ts'), sortie);
process.stdout.write(`confusables.ts : ${table.size} caractères (Unicode ${version}).\n`);
