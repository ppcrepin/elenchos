// Les équilibres du contenu servi, chiffrés par les règles 6, 7 et 16. Ce sont des contrôles sur la liste des textes
// (jamais sur les joueurs) ; la chaîne des textes et l'import du lot s'en servent.

import { REGLES } from './constantes.ts';
import { F, type Fraction } from './fraction.ts';
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

/** Une tension où un sens peut manquer (D-064) : `pole`, le sens qui peut être en minorité, doit faire au moins
 *  `partMin` des textes de la tension ; il ne peut jamais dépasser l'autre de plus d'un texte (la règle ordinaire). */
export type ExceptionSens = { readonly pole: Pole; readonly partMin: Fraction };

/** D-064 (arbitrage de l'équipe, qui relâche E9 sur cette seule tension, faute de textes récents « tradition ») :
 *  pour « tradition ou changement », 3 textes « changement » pour 1 « tradition » au plus, soit des textes de sens 0
 *  (favorable sert la tradition) au moins pour un quart (jeu/textes/FORMAT.md, C23). 3 contre 1 passe ; 4 contre 0
 *  échoue ; 3 « tradition » contre 1 échoue aussi : l'exception ne vaut que dans le sens où les textes manquent. */
export const EXCEPTIONS_SENS: Readonly<Partial<Record<CodeTension, ExceptionSens>>> = Object.freeze({
  T: Object.freeze({ pole: 0, partMin: F(1, 4) }),
});

/** Règle 16 (E9) : sur 8 semaines, pour chaque tension, autant de textes où « favorable » sert une valeur que l'autre, à
 *  un texte près quand leur nombre est impair. Rend les tensions en défaut. Une tension nommée dans `exceptions` suit
 *  son exception (par défaut, celle de D-064), et seulement elle : le moteur et le contrôle du lot disent la même chose. */
export function controleSens(
  textes: readonly { readonly tension: CodeTension; readonly sens: Pole }[],
  exceptions: Readonly<Partial<Record<CodeTension, ExceptionSens>>> = EXCEPTIONS_SENS,
): CodeTension[] {
  const parTension = new Map<CodeTension, [number, number]>();
  for (const t of textes) {
    const c = parTension.get(t.tension) ?? [0, 0];
    c[t.sens] += 1;
    parTension.set(t.tension, c);
  }
  return [...parTension.entries()].filter(([t, compte]) => {
    if (Math.abs(compte[0] - compte[1]) <= 1) return false;
    const e = exceptions[t];
    if (e === undefined) return true;
    const minoritaire = compte[e.pole];
    const autre = compte[1 - e.pole] ?? 0;
    return minoritaire > autre || F(minoritaire, minoritaire + autre).inf(e.partMin);
  }).map(([t]) => t);
}
