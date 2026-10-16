// Les huit tensions, dans leur ordre fixe (règle 16), et leurs mots (E2 ; D-053, point 3). Typographie simple
// (apostrophe droite) : la typographie d'affichage (`typographier`, essai 2) s'applique après, dans le module des
// phrases du serveur (DECISIONS-TECHNIQUES.md, 1.4).
//
// « Entre » : la phrase du dimanche écrit les deux valeurs sans leur article (regles.md, J9 : « Entre décision locale
// et décision nationale, … »), forme validée avec D-052 et confirmée par Game design à l'étape 1. Elle remplace la forme
// courte de l'essai (« local et national », « solidarité et responsabilité »), que tensions.md ne faisait que proposer.
// Le contrat (`TENSIONS.sansArticle`, jeu/src/contrat.ts) et jeu/textes/FORMAT.md (partie 6) donnent la même forme ;
// un test des règles vérifie que les deux listes concordent.

import type { CodeTension } from './types.ts';

export const ORDRE_TENSIONS: readonly CodeTension[] = ['S', 'EM', 'SR', 'P', 'T', 'SO', 'EP', 'L'];

export const MOTS_TENSIONS: Readonly<Record<CodeTension, { readonly pole0: string; readonly pole1: string }>> = Object.freeze({
  S: { pole0: 'la sécurité', pole1: 'la liberté' },
  EM: { pole0: "l'égalité", pole1: 'le mérite' },
  SR: { pole0: 'la solidarité collective', pole1: 'la responsabilité individuelle' },
  P: { pole0: 'la précaution', pole1: "l'innovation" },
  T: { pole0: 'la tradition', pole1: 'le changement' },
  SO: { pole0: "l'indépendance", pole1: "l'ouverture" },
  EP: { pole0: "l'État", pole1: 'le privé' },
  L: { pole0: 'la décision locale', pole1: 'la décision nationale' },
});

export function motPole(tension: CodeTension, pole: 0 | 1): string {
  const m = MOTS_TENSIONS[tension];
  return pole === 0 ? m.pole0 : m.pole1;
}

/** Le mot sans son article : « la sécurité » → « sécurité », « l'égalité » → « égalité ». */
export function sansArticle(mot: string): string {
  if (mot.startsWith('la ')) return mot.slice(3);
  if (mot.startsWith('le ')) return mot.slice(3);
  if (mot.startsWith("l'")) return mot.slice(2);
  return mot;
}

/** « à la sécurité », « au mérite », « à l'égalité ». */
export function aPole(mot: string): string {
  return mot.startsWith('le ') ? `au ${mot.slice(3)}` : `à ${mot}`;
}

export function rangTension(t: CodeTension): number {
  return ORDRE_TENSIONS.indexOf(t);
}
