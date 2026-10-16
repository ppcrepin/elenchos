// L'entrée (règle 15 ; D-006, D-011) : le défi des trois textes, et un joueur déjà inscrit qui rejoint un autre cercle.

import { cote } from './portrait.ts';
import type { IdTexte, Niveau } from './types.ts';

/** D-011 : à l'entrée, une devinette est juste si elle trouve le bon côté (défavorable, neutre, favorable). Vaut aussi
 *  quand le créateur devine à son tour l'invité, à deux (D-006). */
export function devinetteEntreeJuste(pari: Niveau, reponse: Niveau): boolean {
  return cote(pari) === cote(reponse);
}

/** D-006 : « 2 sur 3 », non conservé ; à 0 ou 1, on compte les surprises (« Thomas a réussi à te surprendre deux
 *  fois. »). */
export function bilanDefi(paris: readonly Niveau[], reponses: readonly Niveau[]): {
  readonly justes: number;
  readonly sur: number;
  /** Le nombre de surprises, seulement à 0 ou 1 juste ; sinon null. */
  readonly surprises: number | null;
} {
  if (paris.length !== reponses.length) throw new Error('autant de paris que de réponses');
  const justes = paris.filter((p, i) => devinetteEntreeJuste(p, reponses[i] as Niveau)).length;
  return { justes, sur: paris.length, surprises: justes <= 1 ? paris.length - justes : null };
}

/** Règle 15 : un joueur qui rejoint un autre cercle répond aux trois textes de ce cercle ; une réponse déjà donnée à
 *  l'un d'eux est reprise, sans compter deux fois. Rend les textes à lui poser et ceux repris ; la barre n'avance que
 *  des premiers (un cran par texte nouveau). */
export function textesEntreeAPoser(
  textesDuCercle: readonly IdTexte[],
  dejaRepondus: ReadonlySet<IdTexte>,
): { readonly aPoser: readonly IdTexte[]; readonly repris: readonly IdTexte[] } {
  return {
    aPoser: textesDuCercle.filter((t) => !dejaRepondus.has(t)),
    repris: textesDuCercle.filter((t) => dejaRepondus.has(t)),
  };
}
