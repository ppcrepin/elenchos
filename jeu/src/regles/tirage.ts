// Le tirage (regles.md, section 2, « Tirages ») : « au hasard » veut dire un tirage équitable, fait une fois, gardé avec
// la journée, pour qu'une journée se rejoue à l'identique. La méthode est celle de l'essai 2 (noyau.js, `creerTirage`) :
// t(clé) = les 8 premiers chiffres hexadécimaux de SHA-256(graine + « | » + clé), lus comme un entier. Un tirage ne
// dépend que de la graine et de la clé : il donne le même résultat quel que soit qui le déclenche et dans quel ordre
// (DECISIONS-TECHNIQUES.md, 1.4). La graine est un secret du serveur (P-26) ; le moteur ne la choisit jamais.
//
// Le moteur ne tire jamais directement : il demande à un `Hasard` d'ordonner une liste sous une clé. Choisir un élément
// au hasard, c'est prendre le premier de cet ordre. Les tests des journées jouées à la main (regles.md, section 6)
// donnent leurs tirages comme des entrées, par un `Hasard` écrit d'avance.

import { createHash } from 'node:crypto';

export class ErreurTirage extends Error {
  override name = 'ErreurTirage';
}

/** Ordonne des identifiants sous une clé. Doit rendre une permutation de `elements`, la même pour la même clé et les
 *  mêmes éléments. */
export interface Hasard {
  ordonner<T extends string>(prefixe: string, elements: readonly T[]): T[];
}

const ASCII_IMPRIMABLE = /^[\x20-\x7e]*$/;

export type ValeurTirage = { readonly cle: string; readonly n: number };

/** Le tirage de l'essai 2, pour une graine (ASCII imprimable, au moins 16 caractères ; l'essai prenait 16 chiffres
 *  hexadécimaux, et ses graines restent valables ici). */
export function creerTirage(graine: string): Hasard & {
  readonly graine: string;
  t(cle: string): ValeurTirage;
  comparer(a: ValeurTirage, b: ValeurTirage): number;
  plusPetit<T extends string>(elements: readonly T[], prefixe: string): T | null;
} {
  if (typeof graine !== 'string' || graine.length < 16 || !ASCII_IMPRIMABLE.test(graine) || graine.includes('|')) {
    throw new ErreurTirage('graine invalide : 16 caractères ASCII au moins, sans « | »');
  }
  const memo = new Map<string, ValeurTirage>();
  const t = (cle: string): ValeurTirage => {
    if (!ASCII_IMPRIMABLE.test(cle)) throw new ErreurTirage(`clé de tirage hors ASCII : ${cle}`);
    const deja = memo.get(cle);
    if (deja) return deja;
    const hex = createHash('sha256').update(`${graine}|${cle}`, 'latin1').digest('hex');
    const r = Object.freeze({ cle, n: parseInt(hex.slice(0, 8), 16) });
    memo.set(cle, r);
    return r;
  };
  /** N croissant, puis clé dans l'ordre des octets (essai 2). */
  const comparer = (a: ValeurTirage, b: ValeurTirage): number => {
    if (a.n !== b.n) return a.n < b.n ? -1 : 1;
    return a.cle < b.cle ? -1 : a.cle > b.cle ? 1 : 0;
  };
  const ordonner = <T extends string>(prefixe: string, elements: readonly T[]): T[] =>
    elements
      .map((e) => ({ e, v: t(prefixe + e) }))
      .sort((x, y) => comparer(x.v, y.v))
      .map((p) => p.e);
  return {
    graine,
    t,
    comparer,
    ordonner,
    plusPetit: <T extends string>(elements: readonly T[], prefixe: string): T | null =>
      elements.length === 0 ? null : (ordonner(prefixe, elements)[0] ?? null),
  };
}

/** Le premier élément de l'ordre tiré : un choix au hasard. */
export function choisir<T extends string>(hasard: Hasard, prefixe: string, elements: readonly T[]): T | null {
  if (elements.length === 0) return null;
  const ordre = hasard.ordonner(prefixe, elements);
  verifierPermutation(ordre, elements);
  return ordre[0] ?? null;
}

/** L'ordre tiré, vérifié : une permutation des éléments, sinon une erreur (un `Hasard` fautif ne passe pas). */
export function ordonner<T extends string>(hasard: Hasard, prefixe: string, elements: readonly T[]): T[] {
  const ordre = hasard.ordonner(prefixe, elements);
  verifierPermutation(ordre, elements);
  return ordre;
}

function verifierPermutation<T extends string>(ordre: readonly T[], elements: readonly T[]): void {
  if (ordre.length !== elements.length || new Set(ordre).size !== ordre.length || !elements.every((e) => ordre.includes(e))) {
    throw new ErreurTirage('le tirage ne rend pas une permutation des éléments');
  }
}
