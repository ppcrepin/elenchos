// REPRIS pour le vrai jeu (proposé) : l'horloge de 18h, à l'heure de Paris, changements d'heure compris.
// Une seule horloge pour tout le programme, qu'un test peut régler (outil « horloge simulée » de docs/etape-6/donnees.md).

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

/** Le jour civil parisien suivant, « AAAA-MM-JJ ». */
export function lendemain(dateISO: string): string {
  const midi = instantParis(dateISO, 12, 0);
  return partiesParis(new Date(midi.getTime() + 24 * 3_600_000)).dateISO;
}
