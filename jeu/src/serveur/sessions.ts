// Les sessions : un jeton tiré au hasard, gardé dans le trousseau de l'iPhone, envoyé dans l'en-tête
// `Authorization: Bearer …` ; la base n'en garde que l'empreinte avec clé, sous le module des comptes (P-01, P-11,
// P-41 ; DECISIONS-TECHNIQUES 1.8 ; CONTRAT.md, 1.7). Étape 1, travail D (16 octobre 2026). Remplace les cookies
// scellés de test-18h/src/serveur.ts : sans cookie, une page d'un autre site ne peut pas agir au nom du joueur.
//
// - Un jeton : 32 octets, en base64url (43 caractères). Son empreinte : HMAC avec la clé dérivée « session » de
//   SECRET_SESSION. Changer ce secret déconnecte tout le monde, sans perdre aucun compte.
// - L'échéance d'une session de compte : 30 jours, prolongée à chaque ouverture, jamais au-delà de la fin du test
//   (FIN_DU_TEST, à minuit, heure de Paris : D-061, point 2). Pour qu'une lecture rejouée ne change rien (CONTRAT.md,
//   1.5), la prolongation ne s'écrit qu'une fois par jour au plus.
// - La session d'un joueur provisoire (étape 2, `POST /api/accord`) : 7 jours au plus, jamais prolongée.

import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { empreinte, jetonAuHasard } from './crypto.ts';
import { ajouterJours, instantParis } from './horloge.ts';

export const DUREE_SESSION_MS = 30 * 24 * 3_600_000;
/** La prolongation ne s'écrit que si elle repousse l'échéance d'au moins un jour. */
export const PAS_DE_PROLONGATION_MS = 24 * 3_600_000;
export const JETON_SESSION = /^[A-Za-z0-9_-]{43}$/;

export type SessionLue = {
  /** L'identifiant de la ligne : « l'appareil », auquel s'attache l'abonnement au message. */
  readonly id: string;
  readonly joueur: string;
  readonly etat: 'provisoire' | 'compte';
  readonly expireLe: Date;
};

/** La fin du test : minuit, heure de Paris, à la fin du jour FIN_DU_TEST. null en local sans ce réglage. */
export function finDuTest(fin: string | null): Date | null {
  return fin === null ? null : instantParis(ajouterJours(fin, 1), 0, 0);
}

/** L'échéance d'une session de compte ouverte ou prolongée à cet instant. */
export function echeanceCompte(maintenant: Date, fin: string | null): Date {
  const voulue = new Date(maintenant.getTime() + DUREE_SESSION_MS);
  const borne = finDuTest(fin);
  return borne !== null && borne < voulue ? borne : voulue;
}

/** Le jeton lu dans l'en-tête `Authorization: Bearer …` ; null s'il n'y en a pas ou s'il est illisible. */
export function jetonDeLEntete(entete: string | undefined): string | null {
  if (entete === undefined) return null;
  const m = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(entete);
  return m?.[1] ?? null;
}

/** Ouvre une session pour un joueur, dans une transaction du module des comptes. Rend le jeton, que seul
 *  l'appareil garde ; la base n'en garde que l'empreinte. */
export async function ouvrirSession(c: pg.ClientBase, secret: Buffer, joueur: string, expireLe: Date): Promise<string> {
  const jeton = jetonAuHasard();
  await c.query(
    `INSERT INTO session (id, empreinte, joueur_id, expire_le) VALUES ($1, $2, $3, $4)
     ON CONFLICT (empreinte) DO NOTHING`,
    [randomUUID(), empreinte(secret, 'session', jeton), joueur, expireLe]);
  return jeton;
}

/** La session d'un jeton, si elle existe et n'est pas échue (module des comptes). */
export async function lireSession(pool: pg.Pool, secret: Buffer, jeton: string, maintenant: Date): Promise<SessionLue | null> {
  if (!JETON_SESSION.test(jeton)) return null;
  const r = await pool.query<{ id: string; joueur_id: string; etat: 'provisoire' | 'compte'; expire_le: Date }>(
    `SELECT s.id, s.joueur_id, j.etat, s.expire_le FROM session s JOIN joueur j ON j.id = s.joueur_id
      WHERE s.empreinte = $1 AND s.expire_le > $2`,
    [empreinte(secret, 'session', jeton), maintenant]);
  const l = r.rows[0];
  return l ? { id: l.id, joueur: l.joueur_id, etat: l.etat, expireLe: l.expire_le } : null;
}

/** Prolonge une session de compte (à chaque ouverture : `GET /api/etat`), au plus une fois par jour. Rend vrai si
 *  l'échéance a changé. */
export async function prolongerSession(pool: pg.Pool, s: SessionLue, maintenant: Date, fin: string | null): Promise<boolean> {
  if (s.etat !== 'compte') return false;
  const nouvelle = echeanceCompte(maintenant, fin);
  if (nouvelle.getTime() - s.expireLe.getTime() < PAS_DE_PROLONGATION_MS) return false;
  const r = await pool.query('UPDATE session SET expire_le = $2 WHERE id = $1 AND expire_le < $2', [s.id, nouvelle]);
  return (r.rowCount ?? 0) === 1;
}

/** Ferme la session de cet appareil ; son abonnement au message part avec elle (clé étrangère). */
export async function fermerSession(pool: pg.Pool, id: string): Promise<void> {
  await pool.query('DELETE FROM session WHERE id = $1', [id]);
}
