// Une manche en cours (règle 9) et ce que lui fait un départ (règle 4). L'état est un brouillon gardé à chaque geste ;
// « Valider » le fige ; à 18h, il compte tel qu'il est (règle 10).

import type { CarteServie, MancheServie } from './cartes.ts';
import type { IdCercle, IdMembre, RangRaison, ReponseMoteur } from './types.ts';

export type CarteEnJeu = {
  readonly auteur: IdMembre;
  readonly reponse: ReponseMoteur;
  readonly cachee: boolean;
  /** Le visage posé, ou null (vide ou passée). */
  readonly visage: IdMembre | null;
  /** Le « pourquoi » de la carte « qui et pourquoi », choisi une fois son visage posé. */
  readonly pourquoi: RangRaison | null;
  /** Passée par un geste du joueur. */
  readonly passee: boolean;
  /** Vidée par le départ du membre dont le visage y était posé (règle 4) : vide à 18h, elle est passée, mais cette
   *  passe ne compte jamais contre Le Sans-Faute. Un geste sur la carte efface cette marque. */
  readonly videeParDepart: boolean;
};

export type EtatManche = {
  readonly cercle: IdCercle;
  readonly cartes: readonly CarteEnJeu[];
  readonly visages: readonly IdMembre[];
  /** L'écran Deviner s'est affiché (R10) : sinon la manche n'a pas de cartes à 18h. */
  readonly ouverte: boolean;
  readonly validee: boolean;
};

export type Geste =
  | { readonly type: 'ouvrir' }
  | { readonly type: 'poser'; readonly carte: number; readonly visage: IdMembre }
  | { readonly type: 'retirer'; readonly carte: number }
  | { readonly type: 'passer'; readonly carte: number }
  | { readonly type: 'pourquoi'; readonly carte: number; readonly raison: RangRaison }
  | { readonly type: 'valider' };

export type RefusGeste = 'deja_validee' | 'carte_inconnue' | 'visage_non_propose' | 'visage_deja_pose' | 'pourquoi_sans_visage' | 'pas_de_pourquoi_ici';

export function nouvelleManche(servie: MancheServie): EtatManche {
  return {
    cercle: servie.cercle,
    cartes: servie.cartes.map((c: CarteServie) => ({ ...c, visage: null, pourquoi: null, passee: false, videeParDepart: false })),
    visages: servie.visages,
    ouverte: false,
    validee: false,
  };
}

/** Règle 9 : un geste sur la manche. Une carte, un visage ; chaque visage une fois. Changer de visage garde le
 *  « pourquoi » ; retirer le visage ou passer la carte l'efface. Après « Valider », rien ne change. */
export function appliquerGeste(etat: EtatManche, geste: Geste): { readonly etat: EtatManche } | { readonly refus: RefusGeste } {
  if (geste.type === 'ouvrir') return { etat: etat.ouverte ? etat : { ...etat, ouverte: true } };
  if (etat.validee) return { refus: 'deja_validee' };
  if (geste.type === 'valider') return { etat: { ...etat, ouverte: true, validee: true } };
  const carte = etat.cartes[geste.carte];
  if (carte === undefined) return { refus: 'carte_inconnue' };
  let nouvelle: CarteEnJeu;
  switch (geste.type) {
    case 'poser': {
      if (!etat.visages.includes(geste.visage)) return { refus: 'visage_non_propose' };
      if (etat.cartes.some((c, i) => i !== geste.carte && c.visage === geste.visage)) return { refus: 'visage_deja_pose' };
      nouvelle = { ...carte, visage: geste.visage, passee: false, videeParDepart: false };
      break;
    }
    case 'retirer':
      nouvelle = { ...carte, visage: null, pourquoi: null, passee: false, videeParDepart: false };
      break;
    case 'passer':
      nouvelle = { ...carte, visage: null, pourquoi: null, passee: true, videeParDepart: false };
      break;
    case 'pourquoi': {
      if (!carte.cachee) return { refus: 'pas_de_pourquoi_ici' };
      if (carte.visage === null) return { refus: 'pourquoi_sans_visage' };
      nouvelle = { ...carte, pourquoi: geste.raison };
      break;
    }
  }
  const cartes = etat.cartes.map((c, i) => (i === geste.carte ? nouvelle : c));
  return { etat: { ...etat, ouverte: true, cartes } };
}

/**
 * Règle 4 : un membre part avant 18h. Sa carte pas encore révélée disparaît (ni juste ni fausse) ; une carte où son
 * visage était posé redevient vide, même dans une manche validée, qui ne se rouvre pas pour autant ; son visage n'est
 * plus proposé ; la carte « qui et pourquoi » n'est pas remplacée si c'était la sienne.
 */
export function appliquerDepart(etat: EtatManche, partant: IdMembre): EtatManche {
  const cartes = etat.cartes
    .filter((c) => c.auteur !== partant)
    .map((c) => (c.visage === partant ? { ...c, visage: null, pourquoi: null, passee: false, videeParDepart: true } : c));
  return { ...etat, cartes, visages: etat.visages.filter((v) => v !== partant) };
}
