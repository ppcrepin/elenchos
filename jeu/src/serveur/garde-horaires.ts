// Origine : test-18h/src/garde-horaires.ts (REPRIS, 12 octobre 2026), copié tel quel ; seul le jour de la semaine suit
// désormais la convention du moteur (6 = dimanche ; horloge.ts, 16 octobre 2026).
// La règle des horaires de mise en ligne (D-043, D-054, CLAUDE.md) : aucune installation de 15h à 19h ni le dimanche,
// heure de Paris. Les vérifications automatiques échouent exprès dans ces créneaux : Scalingo refuse alors d'installer
// (fabrication en échec, ou vérification GitHub en échec). La même règle vaut pour les versions de l'application
// proposées aux testeurs (plan-jeu-entier-equipe.md, 2.2).
// La variable IGNORER_HORAIRES=oui lève la garde en local seulement : elle est refusée chez Scalingo et sur GitHub.

import { partiesParis } from './horloge.ts';

export function fenetreInterdite(d: Date): boolean {
  const p = partiesParis(d);
  return p.jourSemaine === 6 || (p.heure >= 15 && p.heure < 19);
}

/** Les variables qui disent qu'on tourne chez Scalingo (fabrication ou conteneur) ou dans une vérification
 *  automatique (GitHub). Leur seule présence suffit, quelle que soit leur valeur. */
export const MARQUEURS_PROTEGES = ['SOURCE_VERSION', 'APP', 'CONTAINER', 'SCALINGO_POSTGRESQL_URL', 'STACK', 'CI', 'GITHUB_ACTIONS'] as const;

/** Vrai si l'on tourne chez Scalingo (fabrication ou conteneur) ou dans une vérification automatique (GitHub). */
export function environnementProtege(env: NodeJS.ProcessEnv): boolean {
  return MARQUEURS_PROTEGES.some((nom) => env[nom] !== undefined && env[nom] !== '');
}

export type VerdictHoraires = { ok: boolean; message: string };

export function verifierHoraires(d: Date, env: NodeJS.ProcessEnv): VerdictHoraires {
  if (!fenetreInterdite(d)) return { ok: true, message: 'Horaires : installation permise.' };
  const demande = env.IGNORER_HORAIRES === 'oui';
  if (demande && !environnementProtege(env)) {
    return { ok: true, message: 'Horaires : créneau interdit, garde levée en local (IGNORER_HORAIRES=oui).' };
  }
  const refus = demande ? ' IGNORER_HORAIRES est refusé ici (Scalingo ou GitHub).' : '';
  return {
    ok: false,
    message: 'Horaires : aucune installation de 15h à 19h ni le dimanche, heure de Paris (D-043).' + refus,
  };
}
