// Les équilibres du contenu servi, chiffrés par les règles 6, 7 et 16. Ce sont des contrôles sur la liste des textes
// (jamais sur les joueurs) ; la chaîne des textes et l'import du lot s'en servent.

import { REGLES } from './constantes.ts';
import { F } from './fraction.ts';
import type { CodeTension, Pole } from './types.ts';

/** Règle 6 (D-028) : sur 4 semaines glissantes (28 textes), adoptés et rejetés font chacun entre un tiers et deux tiers
 *  des textes servis, soit 10 à 18 rejetés sur 28. Rend les débuts de fenêtre en défaut. */
export function controleMelange(issues: readonly ('adopte' | 'rejete')[]): number[] {
  const n = REGLES.melangeFenetre;
  const defauts: number[] = [];
  for (let i = 0; i + n <= issues.length; i++) {
    const rejetes = issues.slice(i, i + n).filter((x) => x === 'rejete').length;
    if (F(rejetes, n).inf(F(1, 3)) || F(rejetes, n).sup(F(2, 3))) defauts.push(i);
  }
  return defauts;
}

/** Règle 7 (D-044, point 3) : sur 12 semaines glissantes, chaque groupe fournit entre 2/3 et 4/3 de la part égale des
 *  raisons ; les raisons d'un député non inscrit (au plus une par texte) sont hors du compte. Rend les groupes hors
 *  de la fourchette (un groupe du compte qui ne fournit rien doit figurer avec 0). */
export function controleGroupes(raisonsParGroupe: ReadonlyMap<string, number>): string[] {
  const groupes = [...raisonsParGroupe.keys()];
  if (groupes.length === 0) return [];
  const total = [...raisonsParGroupe.values()].reduce((a, b) => a + b, 0);
  const egale = F(total, groupes.length);
  const min = egale.fois(REGLES.groupesPartMin);
  const max = egale.fois(REGLES.groupesPartMax);
  return groupes.filter((g) => {
    const k = F(raisonsParGroupe.get(g) ?? 0);
    return k.inf(min) || k.sup(max);
  });
}

/** Règle 16 (E9) : sur 8 semaines, pour chaque tension, autant de textes où « favorable » sert une valeur que l'autre, à
 *  un texte près quand leur nombre est impair. Rend les tensions en défaut. D-064 relâche cette règle pour « tradition
 *  ou changement » (3 pour 1, sur cette seule tension) : `exceptions` la nomme. */
export function controleSens(textes: readonly { readonly tension: CodeTension; readonly sens: Pole }[], exceptions: readonly CodeTension[] = []): CodeTension[] {
  const parTension = new Map<CodeTension, [number, number]>();
  for (const t of textes) {
    const c = parTension.get(t.tension) ?? [0, 0];
    c[t.sens] += 1;
    parTension.set(t.tension, c);
  }
  return [...parTension.entries()].filter(([t, [a, b]]) => !exceptions.includes(t) && Math.abs(a - b) > 1).map(([t]) => t);
}
