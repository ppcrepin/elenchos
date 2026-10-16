// Origine : test-18h/src/horloge.ts (REPRIS, 12 octobre 2026), copié tel quel ; ajouté pour le jeu : le jour de jeu
// et ses bornes (règle 6 : le texte s'ouvre à 18h, heure de Paris, pour 24 heures), et la semaine (règle 12).
// Une seule horloge pour tout le serveur, qu'un test peut régler (outil « horloge simulée » de docs/etape-6/donnees.md).
// Rien ne se calcule à 18h pile (D-043) : ces fonctions disent seulement de quel côté de 18h on se trouve.

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

export type PartiesParis = {
  dateISO: string; // AAAA-MM-JJ, jour civil à Paris
  heure: number;
  minute: number;
  seconde: number;
  jourSemaine: number; // 0 = dimanche … 6 = samedi
};

const FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  weekday: 'short', hourCycle: 'h23',
});

const JOURS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function partiesParis(d: Date): PartiesParis {
  const p: Record<string, string> = {};
  for (const morceau of FORMAT.formatToParts(d)) p[morceau.type] = morceau.value;
  const jour = JOURS[p.weekday ?? ''];
  if (jour === undefined) throw new Error('horloge: jour illisible');
  return {
    dateISO: `${p.year}-${p.month}-${p.day}`,
    heure: Number(p.hour),
    minute: Number(p.minute),
    seconde: Number(p.second),
    jourSemaine: jour,
  };
}

/** L'instant (UTC) qui correspond à « dateISO, heure:minute » à Paris. Paris est à UTC+1 l'hiver, UTC+2 l'été. */
export function instantParis(dateISO: string, heure: number, minute: number): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) throw new Error('horloge: date illisible');
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), heure, minute, 0, 0);
  for (const decalage of [1, 2]) {
    const essai = new Date(base - decalage * 3_600_000);
    const p = partiesParis(essai);
    if (p.dateISO === dateISO && p.heure === heure && p.minute === minute) return essai;
  }
  throw new Error('horloge: heure inexistante à Paris ce jour-là');
}

/** « 18:00:09 », heure de Paris. */
export function heureParis(d: Date): string {
  const p = partiesParis(d);
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${deux(p.heure)}:${deux(p.minute)}:${deux(p.seconde)}`;
}

// --- Ajouté pour le jeu -------------------------------------------------------------------------------------------

/** L'heure du rendez-vous : 18h00, heure de Paris (§2). */
export const HEURE_DU_RENDEZ_VOUS = 18;

/** Ajoute n jours à une date civile (« 2026-10-25 » + 1 = « 2026-10-26 »), sans passer par l'heure : un jour civil
 *  dure 23 ou 25 heures les jours de changement d'heure, et seule la date compte ici. */
export function ajouterJours(dateISO: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) throw new Error('horloge: date illisible');
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n, 12));
  return d.toISOString().slice(0, 10);
}

/** Le jour de jeu en cours : le jour civil dont le texte s'est ouvert à 18h et n'est pas encore fermé.
 *  À 17:59:59 le 25 octobre, c'est le 24 ; à 18:00:00, c'est le 25. */
export function jourDeJeu(d: Date): string {
  const p = partiesParis(d);
  return p.heure >= HEURE_DU_RENDEZ_VOUS ? p.dateISO : ajouterJours(p.dateISO, -1);
}

/** L'ouverture du texte du jour j : 18h00 à Paris, ce jour-là. */
export function ouvertureDuJour(jour: string): Date {
  return instantParis(jour, HEURE_DU_RENDEZ_VOUS, 0);
}

/** La fermeture du texte du jour j : 18h00 à Paris le lendemain. Le jour de jeu dure 23 ou 25 heures quand
 *  l'heure change pendant la nuit. */
export function fermetureDuJour(jour: string): Date {
  return ouvertureDuJour(ajouterJours(jour, 1));
}

/** Le jour de la semaine d'une date civile (0 = dimanche). */
export function jourSemaine(dateISO: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) throw new Error('horloge: date illisible');
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12)).getUTCDay();
}

/** La semaine d'un jour de jeu, nommée par son dimanche : la semaine du jeu va du lundi au dimanche, et ses titres
 *  tombent le dimanche à 18h (règle 12). Le jour de jeu du dimanche appartient à la semaine qu'il clôt. */
export function dimancheDeLaSemaine(jour: string): string {
  const js = jourSemaine(jour);
  return ajouterJours(jour, js === 0 ? 0 : 7 - js);
}
