// Les mesures que le serveur compte lui-même, au moment du geste, sans rien garder de la personne
// (`SORTES_COMPTEUR_SERVEUR`, contrat.ts ; CONTRAT.md, 2.15 ; D-066, point 4). Étape 1, travail D (16 octobre 2026).
//
// « LE SOIR MÊME » (compteur `revelation_ouverte_le_soir`, CONTRAT.md, 2.9). PROPOSÉ PAR BACK-END, À CONFIRMER PAR GAME
// DESIGN : une révélation est ouverte « le soir même » si sa première ouverture a lieu entre 18h et minuit, heure de
// Paris, le jour civil où elle tombe. Pourquoi minuit : en français, le soir finit à minuit ; une heure fixe se dit
// en une phrase au porteur, là où une durée (« dans les 6 heures ») se lirait mal ; et elle sépare nettement ceux qui
// viennent au rendez-vous de ceux qui découvrent la révélation le lendemain, avant le 18h suivant. Un seul réglage,
// ci-dessous : le changer ne demande que de changer ce nombre.
//
// La mesure se compte quand `POST /api/vu { objet: 'revelation' }` (étape 2) note la première ouverture.

import { ajouterJours, fermetureDuJour, instantParis, partiesParis } from './horloge.ts';

/** L'heure de Paris où finit « le soir même », comptée depuis minuit du jour de la révélation : 24 = minuit (proposé,
 *  à confirmer par Game design). */
export const FIN_DU_SOIR_MEME_HEURE = 24;

/** Vrai si une révélation tombée à 18h le jour civil `jour` (« AAAA-MM-JJ ») a été ouverte le soir même, à l'instant
 *  `ouverture`. */
export function ouverteLeSoirMeme(ouverture: Date, jour: string): boolean {
  const debut = fermetureDuJour(jour); // 18h ce jour-là : la révélation tombe
  const fin = instantParis(ajouterJours(jour, Math.floor(FIN_DU_SOIR_MEME_HEURE / 24)), FIN_DU_SOIR_MEME_HEURE % 24, 0);
  return ouverture.getTime() >= debut.getTime() && ouverture.getTime() < fin.getTime();
}

/** Le jour civil, à Paris, d'un instant : le jour des compteurs du message de 18h (`envoi.jour`). */
export function jourCivil(d: Date): string {
  return partiesParis(d).dateISO;
}
