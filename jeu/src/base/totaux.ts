// Écrire dans les totaux (migration 0003) : le seul chemin que le serveur prendra, à l'étape 2, pour ajouter à un
// total. Il porte le réglage du test (D-066, point 2) ; la base, elle, tient le refus des mesures (D-066, point 3),
// les joueurs distincts et la période close (D-066, point 4).
//
// LE RÉGLAGE DU TEST. Pendant le test, ni la part de « aucune » (`compte_aucune`) ni les trois comptes de mi-bêta (les
// sortes de réglage de `total_mesure`) ne sont écrits : avec 20 à 30 joueurs, le seuil de 30 n'est jamais atteint, et
// on traiterait des opinions pour rien (Juridique ; art. 5.1.c). C'est un réglage du serveur, figé dans le code et non
// une variable de l'hébergeur : il ne se rouvre que par une décision, pour la version publique (suspend D-027 et D-052,
// point 2, pour le test ; reprend ce que D-058 prévoyait). Les fonctions de la base restent.
//
// Chaque fonction écrit dans la transaction qu'on lui donne, déclarée au nom du joueur dont vient le geste
// (`enTransaction(pool, { joueur, instant }, …)`) : c'est ce qui permet à la base d'exclure un joueur qui a refusé
// qu'on compte ses gestes, et de compter des joueurs distincts.

import type pg from 'pg';
import type { SorteCompteur, SorteCompteurServeur } from '../contrat.ts';

/** D-066, point 2 : faux pendant tout le test. */
export const COMPTES_DE_REGLAGE = false;

/** Les mesures de la bêta (P-21, seuil de 10 joueurs distincts) : écrites pendant le test. */
export const SORTES_MESURE = ['justesse_cartes', 'justesse_hasard', 'mystere_nouveaux'] as const;
/** Les trois comptes de mi-bêta (P-22 a, seuil de 30) : jamais écrits pendant le test. */
export const SORTES_REGLAGE = [
  'pas_de_cote', 'temperament_original', 'temperament_pont', 'temperament_mesure', 'temperament_tranche',
  'curseur_net_40', 'curseur_net_60', 'curseur_net_80',
] as const;
export type SorteMesure = (typeof SORTES_MESURE)[number] | (typeof SORTES_REGLAGE)[number];

/** Une réponse au compte de « aucune » de son texte (D-027). Rend vrai si elle a été transmise à la base. */
export async function compterReponse(c: pg.ClientBase, texte: string, aucune: boolean, reglage = COMPTES_DE_REGLAGE): Promise<boolean> {
  if (!reglage) return false;
  await c.query('SELECT compter_reponse($1, $2)', [texte, aucune]);
  return true;
}

/** Un apport à un total des mesures. `periode` : le dernier jour de jeu de la période (le dimanche d'une semaine).
 *  Rend vrai si l'apport a été transmis à la base (qui peut encore l'écarter : refus, période close). */
export async function ajouterMesure(c: pg.ClientBase, periode: string, sorte: SorteMesure, numerateur: number,
  denominateur: number, reglage = COMPTES_DE_REGLAGE): Promise<boolean> {
  if (!reglage && (SORTES_REGLAGE as readonly string[]).includes(sorte)) return false;
  await c.query('SELECT ajouter_mesure($1, $2, $3, $4)', [periode, sorte, numerateur, denominateur]);
  return true;
}

/** Un geste au compteur de son jour (sans personne). */
export async function ajouterCompteur(c: pg.ClientBase, sorte: SorteCompteur | SorteCompteurServeur, jour: string): Promise<void> {
  await c.query('SELECT ajouter_compteur($1, $2)', [sorte, jour]);
}

/** La durée de l'écran de la raison, rangée dans sa tranche de la semaine (P-40). */
export async function ajouterHistogramme(c: pg.ClientBase, semaine: string, tranche: number): Promise<void> {
  await c.query('SELECT ajouter_histogramme($1, $2::smallint)', [semaine, tranche]);
}
