// L'heure du jeu (règle 6, R10) : 18h, heure de Paris, donnée par le jeu et non par le téléphone. Aucune horloge
// système : chaque fonction reçoit l'instant (ms UTC) en argument. Calendrier et heure d'été repris du noyau de
// l'essai 2 (`joursDepuisCivil`, `decalageParis`), sans l'API d'internationalisation.

import { REGLES } from './constantes.ts';
import type { Jour } from './types.ts';

const MS_JOUR = 86_400_000;
const MS_MINUTE = 60_000;
const MINUTES_18H = 18 * 60;

/** Jours depuis le 1970-01-01 (calendrier grégorien proleptique ; H. Hinnant, days_from_civil). */
export function joursDepuisCivil(a: number, m: number, j: number): number {
  a -= m <= 2 ? 1 : 0;
  const ere = Math.floor(a / 400);
  const ade = a - ere * 400;
  const mp = (m + 9) % 12;
  const adj = Math.floor((153 * mp + 2) / 5) + j - 1;
  const ad = ade * 365 + Math.floor(ade / 4) - Math.floor(ade / 100) + adj;
  return ere * 146097 + ad - 719468;
}

export function civilDepuisJours(z: number): { readonly annee: number; readonly mois: number; readonly jour: number } {
  z += 719468;
  const ere = Math.floor(z / 146097);
  const dde = z - ere * 146097;
  const ade = Math.floor((dde - Math.floor(dde / 1460) + Math.floor(dde / 36524) - Math.floor(dde / 146096)) / 365);
  const a = ade + ere * 400;
  const adj = dde - (365 * ade + Math.floor(ade / 4) - Math.floor(ade / 100));
  const mp = Math.floor((5 * adj + 2) / 153);
  const j = adj - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { annee: a + (m <= 2 ? 1 : 0), mois: m, jour: j };
}

/** 0 = lundi … 6 = dimanche ; le 1970-01-01 était un jeudi. */
export function jourSemaine(z: number): number {
  return (((z % 7) + 7 + 3) % 7) as number;
}

function joursDansMois(a: number, m: number): number {
  if (m === 2) return a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0) ? 29 : 28;
  return m === 4 || m === 6 || m === 9 || m === 11 ? 30 : 31;
}

function dernierDimanche(a: number, m: number): number {
  const z = joursDepuisCivil(a, m, joursDansMois(a, m));
  return z - ((jourSemaine(z) + 1) % 7);
}

/** Décalage de Paris en minutes (60 ou 120) : heure d'été du dernier dimanche de mars, 1 h UTC, au dernier dimanche
 *  d'octobre, 1 h UTC (règle européenne). */
export function decalageParis(msUtc: number): number {
  const a = civilDepuisJours(Math.floor(msUtc / MS_JOUR)).annee;
  const debut = dernierDimanche(a, 3) * MS_JOUR + 3_600_000;
  const fin = dernierDimanche(a, 10) * MS_JOUR + 3_600_000;
  return msUtc >= debut && msUtc < fin ? 120 : 60;
}

/** Le jour civil de Paris (numéro) et la minute du jour, à un instant. */
export function paris(msUtc: number): { readonly numeroJour: number; readonly minutesDuJour: number } {
  if (!Number.isFinite(msUtc)) throw new Error('instant invalide');
  const minutesLocales = Math.floor(msUtc / MS_MINUTE) + decalageParis(msUtc);
  const z = Math.floor(minutesLocales / 1440);
  return { numeroJour: z, minutesDuJour: minutesLocales - z * 1440 };
}

/** L'instant (ms UTC) de 18h00, heure de Paris, le jour civil z : la fin du jour de jeu z. Les changements d'heure
 *  ont lieu à 1 h UTC : 18h n'est jamais ambigu. */
export function bascule(z: Jour): number {
  const dec = decalageParis(z * MS_JOUR + 12 * 3_600_000);
  return (z * 1440 + MINUTES_18H - dec) * MS_MINUTE;
}

/** Le jour de jeu en cours à un instant : le jour civil de Paris s'il est avant 18h, le lendemain sinon. */
export function jourDeJeu(msUtc: number): Jour {
  const p = paris(msUtc);
  return p.minutesDuJour >= MINUTES_18H ? p.numeroJour + 1 : p.numeroJour;
}

/** Le numéro d'une date civile « AAAA-MM-JJ ». */
export function jourDeDate(date: string): Jour {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
  if (!m) throw new Error(`date mal écrite : ${date}`);
  return joursDepuisCivil(Number(m[1]), Number(m[2]), Number(m[3]));
}

/**
 * Règle 6 (R10, chiffré par D-052) : une réponse au texte du jour de jeu `jourTexte`. Elle est acceptée pendant son jour
 * de jeu ; en retard, jusqu'à 18h10 (18:10:00 exclu), si l'écran Répondre de ce texte s'était affiché avant 18h00.
 * Une réponse en retard compte pour le portrait, la barre, Le Fidèle et l'avis du cercle, jamais pour les cartes.
 */
export function reponseAcceptee(entree: {
  readonly jourTexte: Jour;
  readonly instantEnvoi: number;
  /** Le premier affichage de l'écran Répondre de ce texte, ou null. */
  readonly instantAffichageRepondre: number | null;
}): { readonly acceptee: false } | { readonly acceptee: true; readonly tardive: boolean } {
  const ouverture = bascule(entree.jourTexte - 1);
  const fermeture = bascule(entree.jourTexte);
  const e = entree.instantEnvoi;
  if (e >= ouverture && e < fermeture) return { acceptee: true, tardive: false };
  const aff = entree.instantAffichageRepondre;
  if (e >= fermeture && e < fermeture + REGLES.retardMs && aff !== null && aff >= ouverture && aff < fermeture) {
    return { acceptee: true, tardive: true };
  }
  return { acceptee: false };
}

/** Règle 2 : un lien d'invitation, à usage unique, valable 7 jours (à confirmer par UX). */
export function lienValide(entree: { readonly creeLe: number; readonly maintenant: number; readonly dejaUtilise: boolean }): boolean {
  return !entree.dejaUtilise && entree.maintenant >= entree.creeLe && entree.maintenant < entree.creeLe + REGLES.lienInvitationMs;
}

/**
 * Règle 5 : un compte qui n'ouvre pas le jeu pendant 12 mois est effacé ; un e-mail part 30 jours avant, un seul par
 * période d'inactivité ; toute ouverture remet le compteur à zéro. « 12 mois » se lit en mois du calendrier de Paris :
 * même jour du mois, douze mois plus tard (le dernier jour du mois s'il n'existe pas), à la même heure (lecture du
 * moteur, à confirmer avec `donnees.md`).
 */
export function inactivite(entree: {
  readonly derniereOuverture: number;
  readonly maintenant: number;
  readonly emailDejaEnvoye: boolean;
}): { readonly effacer: boolean; readonly envoyerEmail: boolean; readonly effacementLe: number } {
  const p = paris(entree.derniereOuverture);
  const c = civilDepuisJours(p.numeroJour);
  const mois = c.mois - 1 + REGLES.moisAvantEffacement;
  const annee = c.annee + Math.floor(mois / 12);
  const m = (mois % 12) + 1;
  const jour = Math.min(c.jour, joursDansMois(annee, m));
  const z = joursDepuisCivil(annee, m, jour);
  const dec = decalageParis(z * MS_JOUR + 12 * 3_600_000);
  const effacementLe = (z * 1440 + p.minutesDuJour - dec) * MS_MINUTE;
  const effacer = entree.maintenant >= effacementLe;
  const prevenir = entree.maintenant >= effacementLe - REGLES.joursPrevenance * MS_JOUR;
  return { effacer, envoyerEmail: !effacer && prevenir && !entree.emailDejaEnvoye, effacementLe };
}

/** Règle 20 (et D-043 pour une mise en ligne) : le retrait d'un texte des portraits s'applique hors de 15h–19h, heure
 *  de Paris, et jamais le dimanche, pour ne croiser ni les titres du dimanche ni la révélation préparée d'avance. */
export function retraitPermis(msUtc: number): boolean {
  const p = paris(msUtc);
  if (jourSemaine(p.numeroJour) === 6) return false;
  return p.minutesDuJour < 15 * 60 || p.minutesDuJour >= 19 * 60;
}
