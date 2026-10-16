// Les phrases du portrait (règle 18) : la phrase du jour, juste après chaque réponse du jour (jamais à l'entrée), et la
// phrase du dimanche, après les titres. Typographie simple ; `typographier` s'applique à l'affichage.

import { PORTRAIT, type ReglagesPortrait } from './constantes.ts';
import { Fraction } from './fraction.ts';
import { ajouter, classer, curseur, SOMMES_VIDES } from './portrait.ts';
import { aPole, motPole, ORDRE_TENSIONS, rangTension, sansArticle } from './tensions.ts';
import type { Classement, CodeTension, Curseur, Portrait, ReponseDatee, ReponseMoteur, Sommes, TexteMoteur } from './types.ts';

/** Règle 18 (R1) : la phrase du jour d'une réponse, selon sa classe (règle 17). */
export function phraseDuJour(texte: TexteMoteur, reponse: ReponseMoteur): { readonly classement: Classement; readonly phrase: string } {
  const cl = classer(texte, reponse);
  const t = texte.tension;
  const p0 = motPole(t, 0);
  const p1 = motPole(t, 1);
  let phrase: string;
  if (cl.classe === 'arbitrage' && cl.pole !== null) {
    phrase = `Aujourd'hui, tu as fait passer ${motPole(t, cl.pole)} avant ${motPole(t, cl.pole === 0 ? 1 : 0)}.`;
  } else if (cl.classe === 'penchant' && cl.pole !== null) {
    phrase = `Aujourd'hui, tu as penché vers ${motPole(t, cl.pole)}.`;
  } else if (cl.classe === 'tiraille') {
    phrase = `Aujourd'hui, tu as donné du poids ${aPole(p0)} comme ${aPole(p1)}.`;
  } else {
    phrase = `Aujourd'hui, tu n'as penché ni vers ${p0} ni vers ${p1}.`;
  }
  return { classement: cl, phrase };
}

/** « décision locale et décision nationale » : les deux valeurs sans article (regles.md, J9). */
export function entreDeux(t: CodeTension): string {
  return `${sansArticle(motPole(t, 0))} et ${sansArticle(motPole(t, 1))}`;
}

export type CasDimanche = 'nette' | 'difference' | 'egalite' | 'floue' | 'aucune';

export type PoidsSemaine = { readonly comptent: number; readonly pole0: Fraction; readonly pole1: Fraction };

export type PhraseDimanche = {
  readonly cas: CasDimanche;
  readonly tension: CodeTension | null;
  /** null : pas de phrase ce dimanche (forme 4). */
  readonly phrase: string | null;
  /** Les tensions devenues nettes depuis la lecture précédente. */
  readonly devenues: readonly CodeTension[];
  readonly poids: Readonly<Record<CodeTension, PoidsSemaine>>;
  /** Les tensions nettes à cette lecture : la référence du dimanche suivant. */
  readonly nettes: readonly CodeTension[];
};

/**
 * Règle 18 (R2, précisée par D-052), la phrase du dimanche, sur le portrait à cet instant (réponse du dimanche
 * comprise). On prend la première forme qui s'applique :
 * 1. une tension devenue nette depuis la lecture du dimanche précédent (premier dimanche : depuis l'arrivée) ; s'il y
 *    en a plusieurs, la plus éloignée de 1/2, puis le plus grand W, puis l'ordre des tensions ; un curseur net de
 *    centre exactement 1/2 n'y entre pas ;
 * 2. sinon le choix le plus marqué de la semaine : parmi les tensions qui ont au moins 2 réponses de poids non nul sur
 *    les 7 textes de la semaine, le plus grand écart entre les poids des deux pôles, puis le plus fort poids total,
 *    puis l'ordre des tensions ;
 * 3. sinon, si aucun curseur n'est net : « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » ;
 * 4. sinon, pas de phrase.
 */
export function phraseDimanche(entree: {
  /** Le portrait complet du joueur à cet instant (Moi). */
  readonly portrait: Portrait;
  /** Les tensions nettes à la lecture du dimanche précédent (premier dimanche : après l'entrée). */
  readonly nettesAuparavant: readonly CodeTension[];
  /** Ses réponses aux 7 textes de la semaine (jamais l'entrée). Un texte sorti des portraits n'y compte pas. */
  readonly reponsesSemaine: readonly ReponseDatee[];
}): PhraseDimanche {
  const p = entree.portrait;
  const nettes = ORDRE_TENSIONS.filter((t) => p[t].net);
  const devenues = nettes.filter((t) => !entree.nettesAuparavant.includes(t) && !p[t].c.egal(Fraction.DEMI));

  const poids = Object.fromEntries(ORDRE_TENSIONS.map((t) => [t, { comptent: 0, pole0: Fraction.ZERO, pole1: Fraction.ZERO }])) as Record<
    CodeTension,
    { comptent: number; pole0: Fraction; pole1: Fraction }
  >;
  for (const r of entree.reponsesSemaine) {
    if (r.entree || r.texte.retireDesPortraits) continue;
    const cl = classer(r.texte, r.reponse);
    if (cl.w.estZero()) continue;
    const pt = poids[r.texte.tension];
    if (cl.pole === 0) pt.pole0 = pt.pole0.plus(cl.w);
    else pt.pole1 = pt.pole1.plus(cl.w);
    pt.comptent += 1;
  }

  const base = { devenues, poids, nettes };
  if (devenues.length > 0) {
    const t = [...devenues].sort((x, y) => departageNettes(p[x], p[y], x, y))[0] as CodeTension;
    const gagnant = p[t].c.sup(Fraction.DEMI) ? 1 : 0;
    return { ...base, cas: 'nette', tension: t, phrase: `Entre ${entreDeux(t)}, tu choisis le plus souvent ${motPole(t, gagnant)}.` };
  }
  const retenues = ORDRE_TENSIONS.filter((t) => poids[t].comptent >= 2);
  if (retenues.length > 0) {
    let t = retenues[0] as CodeTension;
    for (const x of retenues.slice(1)) {
      const ex = poids[x].pole0.moins(poids[x].pole1).abs();
      const et = poids[t].pole0.moins(poids[t].pole1).abs();
      const c = ex.cmp(et);
      if (c > 0 || (c === 0 && poids[x].pole0.plus(poids[x].pole1).sup(poids[t].pole0.plus(poids[t].pole1)))) t = x;
    }
    const diff = poids[t].pole0.cmp(poids[t].pole1);
    if (diff === 0) {
      return { ...base, cas: 'egalite', tension: t, phrase: `Cette semaine, entre ${entreDeux(t)}, tu as penché autant d'un côté que de l'autre.` };
    }
    return {
      ...base,
      cas: 'difference',
      tension: t,
      phrase: `Cette semaine, entre ${entreDeux(t)}, tu as le plus souvent choisi ${motPole(t, diff > 0 ? 0 : 1)}.`,
    };
  }
  if (nettes.length === 0) {
    return { ...base, cas: 'floue', tension: null, phrase: 'Cette semaine, ton portrait est encore flou. Chaque réponse le précise.' };
  }
  return { ...base, cas: 'aucune', tension: null, phrase: null };
}

function departageNettes(a: Curseur, b: Curseur, ta: CodeTension, tb: CodeTension): number {
  const c = b.c.moins(Fraction.DEMI).abs().cmp(a.c.moins(Fraction.DEMI).abs());
  if (c !== 0) return c;
  const w = b.W.cmp(a.W);
  return w !== 0 ? w : rangTension(ta) - rangTension(tb);
}

/** Les sommes d'une tension sur une liste de réponses (outil des journées). */
export function sommesTension(reponses: readonly ReponseDatee[], t: CodeTension): Sommes {
  let s = SOMMES_VIDES;
  for (const r of reponses) if (r.texte.tension === t && !r.texte.retireDesPortraits) s = ajouter(s, classer(r.texte, r.reponse));
  return s;
}

export function curseurTension(reponses: readonly ReponseDatee[], t: CodeTension, reglages: ReglagesPortrait = PORTRAIT): Curseur {
  return curseur(sommesTension(reponses, t), reglages);
}
