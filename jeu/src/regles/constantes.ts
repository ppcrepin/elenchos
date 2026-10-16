// Les chiffres des règles (docs/etape-6/regles.md, validé par D-052). Un seul endroit : chaque fonction du moteur les
// reçoit de là, et les tests de comparaison avec l'essai 2 passent les valeurs de l'essai à la place.

import { F, type Fraction } from './fraction.ts';

export type ReglagesPortrait = {
  /** Règle 17 : net dès W ≥ 8 (l'essai prenait 10). */
  readonly seuilNet: Fraction;
  /** Règle 17 : ℓ = max(plafond − pente × W ; plancher). */
  readonly largeurPlafond: Fraction;
  readonly largeurPente: Fraction;
  readonly largeurPlancher: Fraction;
  /** Règle 14 : Le Pas de Côté demande |c − 1/2| ≥ 7/20 (l'essai prenait 1/5). */
  readonly pasDeCoteEcart: Fraction;
};

export const PORTRAIT: ReglagesPortrait = Object.freeze({
  seuilNet: F(8),
  largeurPlafond: F(19, 20),
  largeurPente: F(7, 80),
  largeurPlancher: F(1, 4),
  pasDeCoteEcart: F(7, 20),
});

/** Si la bêta ne fait circuler que quatre tensions, le seuil passe à 14 (règle 17, section 5). */
export const PORTRAIT_QUATRE_TENSIONS: ReglagesPortrait = Object.freeze({ ...PORTRAIT, seuilNet: F(14) });

export const REGLES = Object.freeze({
  /** Règle 1. */
  membresMin: 3,
  membresMax: 10,
  /** Règle 2 : lien d'invitation valable 7 jours (à confirmer par UX). */
  lienInvitationMs: 7 * 24 * 3600 * 1000,
  /** Règle 3. */
  cerclesMax: 3,
  /** Règle 5 : pause après 7 textes sans réponse ; sommeil sous 3 membres hors pause. */
  textesAvantPause: 7,
  membresEveilles: 3,
  /** Règle 5 : effacement après 12 mois sans ouverture ; e-mail 30 jours avant. */
  moisAvantEffacement: 12,
  joursPrevenance: 30,
  /** Règle 6 : réponse en retard acceptée jusqu'à 18h10 (exclu : 18:10:00 est refusé). */
  retardMs: 10 * 60 * 1000,
  /** Règle 8 : trois cartes au plus par cercle. */
  cartesMax: 3,
  /** Règle 10 : l'avis du cercle dès 3 réponses. */
  seuilAvisCercle: 3,
  /** Règle 12. */
  devinPointsMin: 1,
  mystereTentativesMin: 6,
  mystereErreursMin: 1,
  surpriseAttributionsMin: 4,
  surpriseErreursMin: 1,
  /** Règle 13. */
  temperamentFenetre: 56,
  temperamentAnciennete: 56,
  temperamentReponsesMin: 20,
  temperamentReponsesTexteMin: 3,
  /** Part maximale du cercle du côté de L'Original, lui compris ; part maximale de Neutre pour Le Pont. */
  originalPartCoteMax: F(1, 3),
  pontPartNeutreMax: F(1, 3),
  pontTextesMin: 6,
  pontSeuil: F(1, 4),
  mesureSeuil: F(1, 3),
  trancheSeuil: F(1, 2),
  /** Garder un tempérament : la part reste au moins aux 4/5 du seuil. */
  temperamentMarge: F(4, 5),
  /** Règle 14 : Le Sans-Faute demande des cartes au moins 5 jours. */
  sansFauteJoursMin: 5,
  /** Règle 18 : la barre « Ton portrait se dessine », 60 crans. */
  barreCrans: 60,
  /** Règle 6 (D-028) : sur 28 textes glissants, entre un tiers et deux tiers de rejetés. */
  melangeFenetre: 28,
  /** Règle 7 (D-044) : sur 12 semaines glissantes, chaque groupe fournit entre 2/3 et 4/3 de la part égale. */
  groupesPartMin: F(2, 3),
  groupesPartMax: F(4, 3),
});

/** Règle 13 : le seuil de L'Original selon la taille du cercle (membres en pause compris). */
export function seuilOriginal(tailleCercle: number): Fraction {
  if (tailleCercle <= 3) return F(2, 5);
  if (tailleCercle === 4) return F(1, 3);
  return F(1, 4);
}
