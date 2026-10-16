// Origine : test-18h/src/horloge.ts (REPRIS, 12 octobre 2026). Adapté le 16 octobre 2026 (relecture de l'étape 1,
// corrections 1 et 5) : tous les calculs d'heure passent désormais par le moteur, `src/regles/heure.ts`, SEULE SOURCE
// du jour de jeu, de l'heure d'été et du jour de la semaine. Ce fichier garde l'horloge du serveur, qu'un test peut
// régler (outil « horloge simulée » de docs/etape-6/donnees.md), et traduit les numéros de jour du moteur en dates
// « AAAA-MM-JJ », celles de la base.
//
// Le jour de jeu (regles.md §2 ; CONTRAT.md, partie 3) va de 18h à 18h, heure de Paris, et porte le nom du jour où il
// FINIT : le « jour de jeu du jeudi » commence le mercredi à 18h et finit le jeudi à 18h. La base suit la même
// convention (`fin_du_jour_de_jeu`, migration 0002) ; un test compare la base et le moteur, jour par jour.
// Rien ne se calcule à 18h pile (D-043) : ces fonctions disent seulement de quel côté de 18h on se trouve.

import {
  bascule, civilDepuisJours, jourDeJeu as jourDeJeuDuMoteur, joursDepuisCivil, jourSemaine, paris,
} from '../regles/heure.ts';
import type { Jour } from '../regles/types.ts';

export type Horloge = { maintenant(): Date };

export const horlogeSysteme: Horloge = { maintenant: () => new Date() };

/** Horloge simulée pour les tests : on la règle, on l'avance. */
export function horlogeReglable(depart: Date): Horloge & { regler(d: Date): void; avancer(ms: number): void } {
  let t = depart.getTime();
  return {
    maintenant: () => new Date(t),
    regler: (d: Date) => { t = d.getTime(); },
    avancer: (ms: number) => { t += ms; },
  };
}

/** L'heure du rendez-vous : 18h00, heure de Paris (§2). */
export const HEURE_DU_RENDEZ_VOUS = 18;

const deux = (n: number) => String(n).padStart(2, '0');

/** La date « AAAA-MM-JJ » d'un numéro de jour du moteur (jours depuis le 1970-01-01). */
export function dateDeJour(z: Jour): string {
  const c = civilDepuisJours(z);
  return `${String(c.annee).padStart(4, '0')}-${deux(c.mois)}-${deux(c.jour)}`;
}

/** Le numéro de jour du moteur d'une date « AAAA-MM-JJ ». Une date qui n'existe pas (« 2026-02-30 ») est refusée. */
export function jourDeDateISO(dateISO: string): Jour {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) throw new Error('horloge: date illisible');
  const z = joursDepuisCivil(Number(m[1]), Number(m[2]), Number(m[3]));
  if (dateDeJour(z) !== dateISO) throw new Error('horloge: date illisible');
  return z;
}

export type PartiesParis = {
  dateISO: string; // AAAA-MM-JJ, jour civil à Paris
  heure: number;
  minute: number;
  seconde: number;
  jourSemaine: number; // 0 = lundi … 6 = dimanche, comme le moteur (src/regles/heure.ts)
};

export function partiesParis(d: Date): PartiesParis {
  const ms = d.getTime();
  const p = paris(ms); // refuse un instant invalide
  return {
    dateISO: dateDeJour(p.numeroJour),
    heure: Math.floor(p.minutesDuJour / 60),
    minute: p.minutesDuJour % 60,
    // Paris est décalé d'heures entières : les secondes sont celles de l'instant UTC.
    seconde: ((Math.floor(ms / 1000) % 60) + 60) % 60,
    jourSemaine: jourSemaine(p.numeroJour),
  };
}

/** L'instant (UTC) qui correspond à « dateISO, heure:minute » à Paris. Paris est à UTC+1 l'hiver, UTC+2 l'été. Une
 *  heure qui existe deux fois (la nuit du passage à l'hiver) rend la seconde ; une heure qui n'existe pas est refusée. */
export function instantParis(dateISO: string, heure: number, minute: number): Date {
  const z = jourDeDateISO(dateISO);
  const voulue = heure * 60 + minute;
  for (const decalage of [60, 120]) {
    const ms = (z * 1440 + voulue - decalage) * 60_000;
    const p = paris(ms);
    if (p.numeroJour === z && p.minutesDuJour === voulue) return new Date(ms);
  }
  throw new Error('horloge: heure inexistante à Paris ce jour-là');
}

/** « 18:00:09 », heure de Paris. */
export function heureParis(d: Date): string {
  const p = partiesParis(d);
  return `${deux(p.heure)}:${deux(p.minute)}:${deux(p.seconde)}`;
}

/** Ajoute n jours à une date civile (« 2026-10-25 » + 1 = « 2026-10-26 »), sans passer par l'heure : un jour civil
 *  dure 23 ou 25 heures les jours de changement d'heure, et seule la date compte ici. */
export function ajouterJours(dateISO: string, n: number): string {
  return dateDeJour(jourDeDateISO(dateISO) + n);
}

/** Le jour de jeu en cours : le jour civil de Paris s'il est avant 18h, le lendemain sinon (le moteur, `jourDeJeu`).
 *  À 17:59:59 le 25 octobre, c'est le 25 ; à 18:00:00, c'est le 26. */
export function jourDeJeu(d: Date): string {
  return dateDeJour(jourDeJeuDuMoteur(d.getTime()));
}

/** L'ouverture du jour de jeu j : 18h00 à Paris, la veille. C'est l'ouverture du texte du jour j. */
export function ouvertureDuJour(jour: string): Date {
  return new Date(bascule(jourDeDateISO(jour) - 1));
}

/** La fin du jour de jeu j : 18h00 à Paris, ce jour-là. Le texte du jour j s'y ferme, la manche du jour j s'y révèle.
 *  Un jour de jeu dure 23 ou 25 heures quand l'heure change pendant la nuit. */
export function fermetureDuJour(jour: string): Date {
  return new Date(bascule(jourDeDateISO(jour)));
}

/** La semaine d'un jour de jeu, nommée par son dimanche : elle compte les jours de jeu du lundi au dimanche, et ses
 *  titres tombent le dimanche à 18h (règle 12 ; regles.md §2). Le jour de jeu du dimanche clôt sa semaine. */
export function dimancheDeLaSemaine(jour: string): string {
  const z = jourDeDateISO(jour);
  return dateDeJour(z + 6 - jourSemaine(z));
}
