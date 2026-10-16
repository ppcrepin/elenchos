// Le cercle (règles 1, 2, 3 et 5) : taille, pseudo, plusieurs cercles, pause et sommeil, message de 18h (D-029).

import { LETTRES_QUI_IMITENT } from './confusables.ts';
import { REGLES } from './constantes.ts';
import type { IdMembre, Jour, MembreCercle } from './types.ts';

/** Règle 1 : le cercle est complet à 10 membres, en pause compris : « Inviter » disparaît, et un lien ouvert alors ne
 *  fait entrer personne ; un invité qui finit son entrée pendant que le cercle se remplit n'entre pas (règle 2). */
export function peutEntrer(nombreMembres: number): boolean {
  return nombreMembres < REGLES.membresMax;
}
export const peutInviter = peutEntrer;

/** Règle 3 : trois cercles au plus par personne ; au-delà, le lien le lui dit (règle 15). */
export function peutRejoindre(nombreCerclesDuJoueur: number): boolean {
  return nombreCerclesDuJoueur < REGLES.cerclesMax;
}

/** Le squelette d'un pseudo (E7 ; essai 2, `squelette`, UTS #39 réduit) : décomposition, marques combinantes retirées,
 *  minuscules, puis chaque caractère que la table connaît remplacé par la lettre latine qu'il imite. La table est celle
 *  de confusables.ts, tirée de confusables.txt d'Unicode comme le prévoyait l'essai 2 (qui n'avait encore que {}). */
export function squelette(s: string, table: Readonly<Record<string, string>> = LETTRES_QUI_IMITENT): string {
  const d = s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
  let sortie = '';
  for (const c of d) sortie += Object.prototype.hasOwnProperty.call(table, c) ? table[c] : c;
  return sortie.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
}

/** La forme de comparaison d'un pseudo, gardée en base à côté de lui (`joueur.pseudo_comparaison`) : c'est elle que
 *  la base compare pour refuser deux pseudos semblables dans un cercle (E7 ; migration 0002, refus EL003). */
export function pseudoComparaison(pseudo: string): string {
  return squelette(pseudo);
}

/** Règle 1 (E7) : deux membres d'un même cercle n'ont jamais le même pseudo, comparé par squelette. */
export function pseudoLibre(pseudo: string, pseudosDuCercle: readonly string[], table: Readonly<Record<string, string>> = LETTRES_QUI_IMITENT): boolean {
  const s = squelette(pseudo, table);
  return !pseudosDuCercle.some((p) => squelette(p, table) === s);
}

/**
 * Règle 5 : à 18h, à la fin du jour de jeu `jour`, un membre qui n'a répondu à aucun des 7 derniers textes (ceux des
 * jours jour − 6 à jour) est en pause ; sa prochaine réponse l'en sort. Un membre arrivé depuis moins de 7 textes n'est
 * jamais en pause (lecture du moteur : il ne pouvait pas répondre aux textes d'avant son arrivée).
 */
export function enPause(entree: { readonly jour: Jour; readonly jourArrivee: Jour; readonly aRepondu: (jour: Jour) => boolean }): boolean {
  const premier = entree.jour - (REGLES.textesAvantPause - 1);
  if (premier < entree.jourArrivee) return false;
  for (let j = premier; j <= entree.jour; j++) if (entree.aRepondu(j)) return false;
  return true;
}

/**
 * Règle 5 : à chaque 18h (fin du jour de jeu `jour`), le cercle s'endort s'il compte moins de 3 membres hors pause : pas
 * de manche le jour suivant. Il se réveille à 18h dès qu'il en compte de nouveau 3. Rend l'état du jour de jeu
 * `jour + 1`. On répond toujours, et le vote et les auteurs tombent toujours (E1).
 */
export function eveilleLeLendemain(entree: {
  readonly jour: Jour;
  readonly membres: readonly MembreCercle[];
  readonly aRepondu: (membre: IdMembre, jour: Jour) => boolean;
}): { readonly eveille: boolean; readonly enPause: readonly IdMembre[] } {
  const pause = entree.membres
    .filter((m) => enPause({ jour: entree.jour, jourArrivee: m.jourArrivee, aRepondu: (j) => entree.aRepondu(m.id, j) }))
    .map((m) => m.id);
  return { eveille: entree.membres.length - pause.length >= REGLES.membresEveilles, enPause: pause };
}

/**
 * Le message de 18h (E1 ; D-029 : il continue pendant une pause, sans rien dire de l'absence). Trois formes, chacune
 * avec « Ce soir, aussi : les titres de la semaine. » le dimanche si au moins un de ses cercles a un titre :
 * « cartes » s'il avait des cartes dans la manche qui se révèle, « vote » s'il avait répondu au texte révélé,
 * « question » sinon (reprise de l'essai 2).
 */
export function formeMessage18h(entree: {
  readonly avaitDesCartes: boolean;
  readonly avaitReponduAuTexteRevele: boolean;
  readonly titresCeSoir: boolean;
}): { readonly forme: 'cartes' | 'vote' | 'question'; readonly titres: boolean } {
  const forme = entree.avaitDesCartes ? 'cartes' : entree.avaitReponduAuTexteRevele ? 'vote' : 'question';
  return { forme, titres: entree.titresCeSoir };
}
