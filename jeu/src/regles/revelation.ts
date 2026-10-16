// La révélation de 18h (règles 10 et 11) : verdicts, points, jumeau (D-024), cartes identiques (R4), raison cachée
// trouvée (R5), hasard de la manche (D-041), avis du cercle (D-025), « ses surprises » (règle 19).
// Portage de `estJuste`, `redistribuer`, `verdict`, des points de `calculerRevelation` et d'`avisCercle` (essai 2).

import { F, Fraction } from './fraction.ts';
import type { EtatManche } from './manche.ts';
import { cote, identiques } from './portrait.ts';
import type { IdCercle, IdMembre, IdTexte, Jour, Niveau, ReponseMoteur } from './types.ts';
import { REGLES } from './constantes.ts';

export type Verdict = 'juste' | 'juste_et_raison' | 'jumeau' | 'jumeau_et_raison' | 'faux' | 'passe';

export type CarteRevelee = {
  /** L'auteur de la carte servie. */
  readonly auteurServi: IdMembre;
  /** L'auteur après redistribution entre cartes identiques servies ensemble : celui de « C'était … », du Mystère et
   *  de « ses surprises ». */
  readonly auteur: IdMembre;
  readonly reponse: ReponseMoteur;
  readonly cachee: boolean;
  /** null : passée (vide à 18h). */
  readonly designe: IdMembre | null;
  readonly verdict: Verdict;
  readonly juste: boolean;
  /** Le visage posé est un jumeau (même réponse, autre auteur) : « Paul avait répondu la même chose. » */
  readonly jumeau: boolean;
  /** Carte « qui et pourquoi » : la personne et la raison sont justes (R5). */
  readonly raisonTrouvee: boolean;
  /** Une passe qui compte contre Le Sans-Faute (une carte vidée par un départ n'en est pas une). */
  readonly passeComptee: boolean;
  /** D-041 : part des visages proposés qui avaient donné cette réponse. */
  readonly h: Fraction;
};

export type MancheRevelee = {
  readonly cercle: IdCercle;
  /** Le jour de jeu de la manche ; la révélation tombe à sa fin. */
  readonly jour: Jour;
  readonly texte: IdTexte;
  readonly devineur: IdMembre;
  readonly ouverte: boolean;
  /** Vide si la manche ne s'est jamais ouverte (R10) ou s'il n'y avait rien à deviner. */
  readonly cartes: readonly CarteRevelee[];
  readonly points: number;
  readonly raisonCacheeTrouvee: boolean;
  /** D-041 : le nombre de cartes justes qu'on aurait en posant les visages au hasard. */
  readonly hasard: Fraction;
};

/**
 * Règles 10 et 11 : la manche se ferme telle qu'elle est ; un visage posé compte, une carte vide est passée.
 * `reponses` : les réponses au texte (toutes, retard compris) des membres actuels, pour le jumeau et le hasard.
 * `ordreArrivee` : les membres du cercle dans l'ordre d'arrivée (redistribution entre cartes identiques).
 */
export function revelerManche(entree: {
  readonly etat: EtatManche;
  readonly jour: Jour;
  readonly texte: IdTexte;
  readonly devineur: IdMembre;
  readonly reponses: ReadonlyMap<IdMembre, ReponseMoteur>;
  readonly ordreArrivee: readonly IdMembre[];
}): MancheRevelee {
  const { etat, reponses, ordreArrivee } = entree;
  const base = { cercle: etat.cercle, jour: entree.jour, texte: entree.texte, devineur: entree.devineur, ouverte: etat.ouverte };
  if (!etat.ouverte || etat.cartes.length === 0) {
    return { ...base, cartes: [], points: 0, raisonCacheeTrouvee: false, hasard: Fraction.ZERO };
  }
  const cartes = etat.cartes;
  const comptes = redistribuer(
    cartes.map((c) => ({ auteur: c.auteur, reponse: c.reponse, designe: c.visage })),
    ordreArrivee,
  );
  const revelees = cartes.map((c, i): CarteRevelee => {
    const designe = c.visage;
    const rd = designe === null ? undefined : reponses.get(designe);
    const juste = rd !== undefined && identiques(rd, c.reponse);
    const auteur = comptes[i] as IdMembre;
    const jumeau = juste && designe !== auteur;
    const raisonTrouvee = c.cachee && juste && c.pourquoi !== null && c.pourquoi === c.reponse.raison;
    let verdict: Verdict;
    if (designe === null) verdict = 'passe';
    else if (!juste) verdict = 'faux';
    else verdict = `${jumeau ? 'jumeau' : 'juste'}${raisonTrouvee ? '_et_raison' : ''}` as Verdict;
    const bons = etat.visages.filter((v) => {
      const r = reponses.get(v);
      return r !== undefined && identiques(r, c.reponse);
    }).length;
    const h = etat.visages.length === 0 ? Fraction.ZERO : F(bons, etat.visages.length);
    return {
      auteurServi: c.auteur,
      auteur,
      reponse: c.reponse,
      cachee: c.cachee,
      designe,
      verdict,
      juste,
      jumeau,
      raisonTrouvee,
      passeComptee: designe === null && !c.videeParDepart,
      h,
    };
  });
  return {
    ...base,
    cartes: revelees,
    points: revelees.filter((c) => c.juste).length,
    raisonCacheeTrouvee: revelees.some((c) => c.raisonTrouvee),
    hasard: Fraction.somme(revelees.map((c) => c.h)),
  };
}

/** R4 et règle 11 : entre cartes identiques servies ensemble, chaque auteur désigné devient l'auteur de la carte où on
 *  l'a posé ; les autres vont aux cartes restantes dans l'ordre d'arrivée. Rend l'auteur compté de chaque carte. */
export function redistribuer(
  cartes: readonly { readonly auteur: IdMembre; readonly reponse: ReponseMoteur; readonly designe: IdMembre | null }[],
  ordreArrivee: readonly IdMembre[],
): IdMembre[] {
  const comptes = cartes.map((c) => c.auteur);
  const vus = new Set<number>();
  const rang = (m: IdMembre): number => {
    const i = ordreArrivee.indexOf(m);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  cartes.forEach((c, i) => {
    if (vus.has(i)) return;
    const groupe: number[] = [];
    cartes.forEach((d, k) => {
      if (identiques(c.reponse, d.reponse)) groupe.push(k);
    });
    for (const k of groupe) vus.add(k);
    if (groupe.length < 2) return;
    const auteurs = groupe.map((k) => (cartes[k] as (typeof cartes)[number]).auteur);
    const pris: IdMembre[] = [];
    const libres: number[] = [];
    for (const k of groupe) {
      const d = (cartes[k] as (typeof cartes)[number]).designe;
      if (d !== null && auteurs.includes(d) && !pris.includes(d)) {
        comptes[k] = d;
        pris.push(d);
      } else {
        libres.push(k);
      }
    }
    const restants = auteurs.filter((x) => !pris.includes(x)).sort((x, y) => rang(x) - rang(y));
    libres.forEach((k, x) => {
      comptes[k] = restants[x] as IdMembre;
    });
  });
  return comptes;
}

export type LigneAvis = 'adopte' | 'rejete' | 'partage';

export const PHRASES_AVIS: Readonly<Record<LigneAvis, string>> = Object.freeze({
  adopte: "Ton cercle, lui, l'aurait adopté.",
  rejete: "Ton cercle, lui, l'aurait rejeté.",
  partage: 'Ton cercle, lui, était partagé.',
});

export type AvisDuCercle = {
  readonly comptes: readonly [number, number, number, number, number];
  readonly milieu: readonly Niveau[];
  readonly ligne: LigneAvis;
  readonly phrase: string;
};

/**
 * Règle 10 (D-025) : sur les réponses des membres actuels au texte révélé, retard compris. Sous 3 réponses : rien
 * (null). On range les n réponses de TD à TF ; n impair : la mention de rang (n + 1)/2 ; n pair : les deux du milieu, ou
 * une seule si elles sont égales. Favorable : « adopté » ; défavorable : « rejeté » ; neutre, ou deux côtés différents :
 * « partagé ». La réponse du joueur n'est jamais marquée (rien ici ne la distingue).
 */
export function avisDuCercle(niveaux: readonly Niveau[]): AvisDuCercle | null {
  const n = niveaux.length;
  if (n < REGLES.seuilAvisCercle) return null;
  const v = [...niveaux].sort((a, b) => a - b);
  const comptes: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const x of v) comptes[x - 1] = (comptes[x - 1] ?? 0) + 1;
  let milieu: Niveau[];
  let cotes: number[];
  if (n % 2 === 1) {
    const m = v[(n - 1) / 2] as Niveau;
    milieu = [m];
    cotes = [cote(m)];
  } else {
    const x = v[n / 2 - 1] as Niveau;
    const y = v[n / 2] as Niveau;
    milieu = x === y ? [x] : [x, y];
    cotes = [cote(x), cote(y)];
  }
  const commun = cotes.every((c) => c === cotes[0]) ? (cotes[0] as number) : 0;
  const ligne: LigneAvis = commun > 0 ? 'adopte' : commun < 0 ? 'rejete' : 'partage';
  return { comptes, milieu, ligne, phrase: PHRASES_AVIS[ligne] };
}

/** Règle 19, « ses surprises » : les réponses révélées de ce proche que j'avais attribuées à un membre dont la réponse
 *  différait ; ni passes, ni textes d'entrée (ils ne sont jamais dans une manche), ni jumeau désigné (D-024, R12). */
export function sesSurprises(manchesDuJoueur: readonly MancheRevelee[], proche: IdMembre): IdTexte[] {
  const r: IdTexte[] = [];
  for (const m of manchesDuJoueur) {
    for (const c of m.cartes) if (c.auteur === proche && c.designe !== null && !c.juste) r.push(m.texte);
  }
  return r;
}
