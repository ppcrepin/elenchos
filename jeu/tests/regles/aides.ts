// Outils des tests du moteur de règles : textes et réponses en notation courte, tirages écrits d'avance (les journées de
// regles.md donnent leurs tirages comme des entrées), générateur pseudo-aléatoire à graine pour les comparaisons.

import { creerTirage, type Hasard } from '../../src/regles/tirage.ts';
import type {
  ChoixRaison,
  CodeTension,
  Niveau,
  Pole,
  PoleRaison,
  RaisonDuTexte,
  RangRaison,
  ReponseMoteur,
  TexteMoteur,
} from '../../src/regles/types.ts';

/** « p0 pa c1 c0 » : R1 pour, pôle 0 ; R2 pour, hors tension ; R3 contre, pôle 1 ; R4 contre, pôle 0. */
export function texte(id: string, tension: CodeTension, sens: Pole, raisons: string, retire = false): TexteMoteur {
  const parts = raisons.split(' ');
  if (parts.length !== 4) throw new Error('quatre raisons');
  const rs: RaisonDuTexte[] = parts.map((p, i) => {
    const cote = p[0] === 'p' ? 'pour' : 'contre';
    const pole: PoleRaison = p[1] === 'a' ? 'aucun' : p[1] === '0' ? 0 : 1;
    return { rang: (i + 1) as RangRaison, cote, pole };
  });
  return retire ? { id, tension, sens, raisons: rs, retireDesPortraits: true } : { id, tension, sens, raisons: rs };
}

const NIVEAUX: Record<string, Niveau> = { TD: 1, D: 2, N: 3, F: 4, TF: 5 };

/** « F · R1 », « D·R3 », « N · aucune ». */
export function rep(s: string): ReponseMoteur {
  const m = /^(TD|D|N|F|TF)\s*·\s*(R[1-4]|aucune)$/.exec(s.trim());
  if (!m) throw new Error(`réponse illisible : ${s}`);
  const raison: ChoixRaison = m[2] === 'aucune' ? 'aucune' : (Number((m[2] as string).slice(1)) as RangRaison);
  return { niveau: NIVEAUX[m[1] as string] as Niveau, raison };
}

/** Un tirage écrit d'avance : pour une clé donnée, l'ordre voulu (les éléments absents de la liste viennent après,
 *  dans l'ordre du repli). Les autres clés passent au repli, et sont notées. */
export function hasardEcrit(script: Readonly<Record<string, readonly string[]>>, repli: Hasard = creerTirage('0123456789abcdef')): Hasard & {
  readonly nonEcrites: string[];
  readonly utilisees: Set<string>;
} {
  const nonEcrites: string[] = [];
  const utilisees = new Set<string>();
  return {
    nonEcrites,
    utilisees,
    ordonner<T extends string>(prefixe: string, elements: readonly T[]): T[] {
      const voulu = script[prefixe];
      const base = repli.ordonner(prefixe, elements);
      if (!voulu) {
        if (elements.length > 1) nonEcrites.push(prefixe);
        return base;
      }
      utilisees.add(prefixe);
      for (const v of voulu) if (!elements.includes(v as T)) throw new Error(`tirage écrit : « ${v} » absent sous ${prefixe}`);
      const rang = (e: T): number => {
        const i = voulu.indexOf(e);
        return i < 0 ? voulu.length + base.indexOf(e) : i;
      };
      return [...elements].sort((a, b) => rang(a) - rang(b));
    },
  };
}

/** Générateur pseudo-aléatoire à graine (mulberry32) : les comparaisons sont rejouables. */
export function alea(graine: number): {
  (): number;
  entier(min: number, max: number): number;
  choix<T>(l: readonly T[]): T;
  bool(p?: number): boolean;
} {
  let a = graine >>> 0;
  const f = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const g = f as ReturnType<typeof alea>;
  g.entier = (min, max) => min + Math.floor(f() * (max - min + 1));
  g.choix = <T,>(l: readonly T[]): T => l[Math.floor(f() * l.length)] as T;
  g.bool = (p = 0.5) => f() < p;
  return g;
}

export function graineHex(r: ReturnType<typeof alea>): string {
  let s = '';
  for (let i = 0; i < 16; i++) s += '0123456789abcdef'[r.entier(0, 15)];
  return s;
}
