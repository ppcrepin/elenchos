// Le portrait : poids d'une réponse, curseurs, ce que voit le cercle, ordre de Moi, la barre, Le Pas de Côté
// (règles 14, 16 à 19, et 20 pour un texte corrigé). Portage de `classer`, `curseur`, `ordreMoi`, `pasDeCote` de
// l'essai 2, avec les chiffres de regles.md.

import { PORTRAIT, REGLES, type ReglagesPortrait } from './constantes.ts';
import { F, Fraction } from './fraction.ts';
import { ORDRE_TENSIONS, rangTension } from './tensions.ts';
import type {
  Classement,
  CodeTension,
  Cote,
  Curseur,
  IdMembre,
  Jour,
  MembreCercle,
  Niveau,
  Portrait,
  ReponseDatee,
  ReponseMoteur,
  Sommes,
  TexteMoteur,
} from './types.ts';

export class ErreurRegles extends Error {
  override name = 'ErreurRegles';
}

/** Côté d'une position : -1 défavorable, 0 neutre, 1 favorable. */
export function cote(niveau: Niveau): Cote {
  return niveau <= 2 ? -1 : niveau === 3 ? 0 : 1;
}

/** Valeur v d'une position : 0, 1/4, 1/2, 3/4, 1. */
export function valeur(niveau: Niveau): Fraction {
  return F(niveau - 1, 4);
}

/** Place x sur l'axe de la tension : v si s = 1, 1 − v si s = 0. */
export function placeSurAxe(texte: TexteMoteur, niveau: Niveau): Fraction {
  const v = valeur(niveau);
  return texte.sens === 1 ? v : Fraction.UN.moins(v);
}

/** Même position et même raison, « aucune » comprise (D-024, R4). */
export function identiques(a: ReponseMoteur, b: ReponseMoteur): boolean {
  return a.niveau === b.niveau && a.raison === b.raison;
}

/** Règle 17 : arbitrage net (w = 1), penchant (1/2), tiraillé (0), neutre (0). */
export function classer(texte: TexteMoteur, reponse: ReponseMoteur): Classement {
  const c = cote(reponse.niveau);
  if (c === 0) return { classe: 'neutre', w: Fraction.ZERO, pole: null };
  const pi = c > 0 ? texte.sens : texte.sens === 1 ? 0 : 1;
  if (reponse.raison === 'aucune') return { classe: 'penchant', w: Fraction.DEMI, pole: pi };
  const raison = texte.raisons.find((r) => r.rang === reponse.raison);
  if (!raison) throw new ErreurRegles(`raison ${reponse.raison} absente du texte ${texte.id}`);
  if (raison.pole === 'aucun') return { classe: 'penchant', w: Fraction.DEMI, pole: pi };
  if (raison.pole === pi) return { classe: 'arbitrage', w: Fraction.UN, pole: pi };
  return { classe: 'tiraille', w: Fraction.ZERO, pole: null };
}

export const SOMMES_VIDES: Sommes = Object.freeze({ W: Fraction.ZERO, Swp: Fraction.ZERO });

export function ajouter(s: Sommes, cl: Classement): Sommes {
  if (cl.w.estZero()) return s;
  return { W: s.W.plus(cl.w), Swp: cl.pole === 1 ? s.Swp.plus(cl.w) : s.Swp };
}

/** Règle 17 : c = (2 + Σwπ) / (4 + W) ; ℓ = max(19/20 − 7/80 × W ; 1/4) ; net dès W ≥ 8. */
export function curseur(s: Sommes, reglages: ReglagesPortrait = PORTRAIT): Curseur {
  const c = F(2).plus(s.Swp).divise(F(4).plus(s.W));
  const l = Fraction.max(reglages.largeurPlafond.moins(reglages.largeurPente.fois(s.W)), reglages.largeurPlancher);
  return { c, l, W: s.W, net: s.W.supEgal(reglages.seuilNet) };
}

/** Curseur depuis W et Σwπ donnés (journées de regles.md, où les curseurs sont des entrées). */
export function curseurDepuis(W: Fraction | number, Swp: Fraction | number, reglages: ReglagesPortrait = PORTRAIT): Curseur {
  return curseur({ W: F(W), Swp: F(Swp) }, reglages);
}

export type FiltrePortrait = {
  /** Lecture A (règle 19) : le cercle voit l'entrée et les réponses déjà révélées. Pendant le jour de jeu D, ce sont
   *  les textes du jour jusqu'à D − 2 (le texte D − 1 se révèle à la fin du jour D). */
  readonly vuPendantLeJour?: Jour;
  /** « Juste avant » une réponse (Le Pas de Côté) : seulement les réponses enregistrées strictement avant cet instant. */
  readonly avantInstant?: number;
};

/** Les sommes de chaque tension sur les réponses d'un joueur. Un texte sorti des portraits (règle 20) n'y compte pas.
 *  Une personne ne répond qu'une fois à un texte : une réponse reprise (règle 15) ne doit figurer qu'une fois. */
export function sommesDuPortrait(reponses: readonly ReponseDatee[], filtre: FiltrePortrait = {}): Record<CodeTension, Sommes> {
  const vus = new Set<string>();
  const s = Object.fromEntries(ORDRE_TENSIONS.map((t) => [t, SOMMES_VIDES])) as Record<CodeTension, Sommes>;
  for (const r of reponses) {
    if (vus.has(r.texte.id)) throw new ErreurRegles(`deux réponses au texte ${r.texte.id}`);
    vus.add(r.texte.id);
    if (r.texte.retireDesPortraits) continue;
    if (filtre.vuPendantLeJour !== undefined && !r.entree && r.jour > filtre.vuPendantLeJour - 2) continue;
    if (filtre.avantInstant !== undefined && !(r.instant < filtre.avantInstant)) continue;
    s[r.texte.tension] = ajouter(s[r.texte.tension], classer(r.texte, r.reponse));
  }
  return s;
}

export function portrait(reponses: readonly ReponseDatee[], filtre: FiltrePortrait = {}, reglages: ReglagesPortrait = PORTRAIT): Portrait {
  const s = sommesDuPortrait(reponses, filtre);
  return Object.fromEntries(ORDRE_TENSIONS.map((t) => [t, curseur(s[t], reglages)])) as Record<CodeTension, Curseur>;
}

/** Règle 19 : le portrait que voit le cercle pendant le jour de jeu D (lecture A). C'est aussi celui de la surprise
 *  (règle 8). Il ne dépend jamais d'une réponse non révélée. */
export function portraitVu(reponses: readonly ReponseDatee[], jour: Jour, reglages: ReglagesPortrait = PORTRAIT): Portrait {
  return portrait(reponses, { vuPendantLeJour: jour }, reglages);
}

/** Règle 19, Moi : les nets du plus éloigné de 1/2 au plus proche, puis du plus grand W, puis l'ordre des tensions ;
 *  puis les flous du plus étroit au plus large, puis l'ordre des tensions. */
export function ordreMoi(p: Partial<Record<CodeTension, Curseur>>): CodeTension[] {
  const presentes = ORDRE_TENSIONS.filter((t) => p[t] !== undefined);
  const cur = (t: CodeTension): Curseur => p[t] as Curseur;
  const nets = presentes
    .filter((t) => cur(t).net)
    .sort((x, y) => {
      const c = cur(y).c.moins(Fraction.DEMI).abs().cmp(cur(x).c.moins(Fraction.DEMI).abs());
      if (c !== 0) return c;
      const w = cur(y).W.cmp(cur(x).W);
      return w !== 0 ? w : rangTension(x) - rangTension(y);
    });
  const flous = presentes
    .filter((t) => !cur(t).net)
    .sort((x, y) => {
      const c = cur(x).l.cmp(cur(y).l);
      return c !== 0 ? c : rangTension(x) - rangTension(y);
    });
  return [...nets, ...flous];
}

/** Règle 19, Le Cercle : sur chaque barre, les membres dont le curseur (vu) est net, à leur centre ; « Encore flou : »
 *  les autres, dans l'ordre d'arrivée. */
export function vueDuCercle(
  membres: readonly MembreCercle[],
  portraitsVus: ReadonlyMap<IdMembre, Portrait>,
): Record<CodeTension, { readonly nets: readonly { readonly membre: IdMembre; readonly c: Fraction }[]; readonly flous: readonly IdMembre[] }> {
  const r = {} as Record<CodeTension, { nets: { membre: IdMembre; c: Fraction }[]; flous: IdMembre[] }>;
  for (const t of ORDRE_TENSIONS) {
    const nets: { membre: IdMembre; c: Fraction }[] = [];
    const flous: IdMembre[] = [];
    for (const m of membres) {
      const p = portraitsVus.get(m.id);
      if (p && p[t].net) nets.push({ membre: m.id, c: p[t].c });
      else flous.push(m.id);
    }
    r[t] = { nets, flous };
  }
  return r;
}

/**
 * Règle 14, Le Pas de Côté : la réponse `r` (un texte du jour, jamais l'entrée) est un arbitrage net (w = 1) vers le
 * pôle opposé au penchant du curseur de cette tension tel qu'il était juste avant (toutes les réponses précédentes,
 * entrée comprise), ce curseur étant net et penchant très clairement : |c − 1/2| ≥ 7/20.
 * `toutes` : toutes les réponses du joueur (celles d'après `r` sont ignorées).
 */
export function pasDeCote(toutes: readonly ReponseDatee[], r: ReponseDatee, reglages: ReglagesPortrait = PORTRAIT): boolean {
  if (r.entree || r.texte.retireDesPortraits) return false;
  const cl = classer(r.texte, r.reponse);
  if (cl.classe !== 'arbitrage') return false;
  const avant = curseur(sommesDuPortrait(toutes, { avantInstant: r.instant })[r.texte.tension], reglages);
  if (!avant.net) return false;
  const ecart = avant.c.moins(Fraction.DEMI).abs();
  if (ecart.inf(reglages.pasDeCoteEcart)) return false;
  return avant.c.sup(Fraction.DEMI) ? cl.pole === 0 : cl.pole === 1;
}

/** Règle 18 : la barre « Ton portrait se dessine », un cran par réponse, entrée comprise ; 60 crans ; elle ne recule
 *  jamais, ne porte aucune date et ne saute jamais au plein au premier curseur net. `reponses` : le nombre de textes
 *  différents auxquels le joueur a répondu (une réponse reprise à l'entrée d'un autre cercle ne compte qu'une fois). */
export function barre(reponses: number): { readonly crans: number; readonly sur: number; readonly pleine: boolean } {
  if (!Number.isSafeInteger(reponses) || reponses < 0) throw new ErreurRegles('nombre de réponses invalide');
  return { crans: Math.min(reponses, REGLES.barreCrans), sur: REGLES.barreCrans, pleine: reponses >= REGLES.barreCrans };
}

/** Règle 18, ce que montre Moi autour de la barre. La barre pleine se montre pleine une fois, à la prochaine ouverture
 *  de Moi (« Ta barre est pleine. Ton portrait, lui, continue. »), puis disparaît, avec l'état « portrait pas encore
 *  formé ». Ensuite, sans curseur net, une seule ligne au-dessus des curseurs (« Tes curseurs se précisent à chaque
 *  réponse, chacun à son rythme. »), jusqu'au premier curseur net. */
export function etatMoi(entree: {
  readonly reponses: number;
  /** La barre pleine a déjà été montrée une fois. */
  readonly barrePleineDejaMontree: boolean;
  readonly unCurseurNet: boolean;
}): { readonly barre: 'en_cours' | 'pleine_a_montrer' | 'disparue'; readonly portraitPasEncoreForme: boolean; readonly ligneSansCurseurNet: boolean } {
  const b = barre(entree.reponses);
  if (!b.pleine) return { barre: 'en_cours', portraitPasEncoreForme: !entree.unCurseurNet, ligneSansCurseurNet: false };
  if (!entree.barrePleineDejaMontree) return { barre: 'pleine_a_montrer', portraitPasEncoreForme: false, ligneSansCurseurNet: false };
  return { barre: 'disparue', portraitPasEncoreForme: false, ligneSansCurseurNet: !entree.unCurseurNet };
}

export function unCurseurNet(p: Portrait): boolean {
  return ORDRE_TENSIONS.some((t) => p[t].net);
}
