// JETABLE (test du message de 18h) : les lectures et écritures de la base du test, et rien d'autre.
// Toutes les valeurs passent en paramètres de requête, jamais dans le texte SQL.

import type pg from 'pg';
import type { Fournisseur } from './connexion.ts';

export function creerDepot(pool: pg.Pool) {
  return {
    /** Un abonnement par téléphone : le doublon se contrôle sur le numéro du téléphone (clé primaire), jamais par une
     *  contrainte d'unicité sur l'adresse d'abonnement, qu'une erreur de doublon recopierait dans le journal de la base
     *  (condition 6 de Juridique). Les deux écritures sont des « ON CONFLICT » : aucune erreur n'est levée. */
    async enregistrerAbonnement(telephone: number, adresse: string, p256dh: string, auth: string) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          'INSERT INTO telephone (numero) VALUES ($1) ON CONFLICT (numero) DO NOTHING',
          [telephone],
        );
        await client.query(
          `INSERT INTO abonnement (telephone, adresse, cle_p256dh, cle_auth) VALUES ($1, $2, $3, $4)
           ON CONFLICT (telephone) DO UPDATE SET adresse = EXCLUDED.adresse, cle_p256dh = EXCLUDED.cle_p256dh,
             cle_auth = EXCLUDED.cle_auth`,
          [telephone, adresse, p256dh, auth],
        );
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw e;
      } finally {
        client.release();
      }
    },

    /** L'heure de réception notée par le serveur, une seule fois par envoi, dans les deux jours. */
    async noterReception(idEnvoi: string, maintenant: Date): Promise<boolean> {
      const r = await pool.query(
        `UPDATE envoi SET recu_a = $2 WHERE id = $1 AND recu_a IS NULL AND envoye_a > $3`,
        [idEnvoi, maintenant, new Date(maintenant.getTime() - 2 * 24 * 3_600_000)],
      );
      return r.rowCount === 1;
    },

    /** Retrouve le compte par l'empreinte de l'identifiant, ou le crée. Les numéros se suivent sans trou (1, 2, 3…) :
     *  on cherche d'abord, pour ne pas consommer un numéro à chaque reconnexion. */
    async compte(fournisseur: Fournisseur, empreinte: string, emailRecu: boolean): Promise<number> {
      const existant = await pool.query<{ numero: number }>(
        `UPDATE compte SET email_recu = email_recu OR $3 WHERE fournisseur = $1 AND empreinte = $2 RETURNING numero`,
        [fournisseur, empreinte, emailRecu],
      );
      const deja = existant.rows[0]?.numero;
      if (deja !== undefined) return deja;
      const cree = await pool.query<{ numero: number }>(
        `INSERT INTO compte (fournisseur, empreinte, email_recu) VALUES ($1, $2, $3)
         ON CONFLICT (fournisseur, empreinte) DO NOTHING RETURNING numero`,
        [fournisseur, empreinte, emailRecu],
      );
      const numero = cree.rows[0]?.numero;
      if (numero !== undefined) return numero;
      const r = await pool.query<{ numero: number }>(
        'SELECT numero FROM compte WHERE fournisseur = $1 AND empreinte = $2', [fournisseur, empreinte],
      );
      const trouve = r.rows[0]?.numero;
      if (trouve === undefined) throw new Error('compte introuvable');
      return trouve;
    },

    async compteExiste(numero: number, fournisseur: Fournisseur): Promise<boolean> {
      const r = await pool.query('SELECT 1 FROM compte WHERE numero = $1 AND fournisseur = $2', [numero, fournisseur]);
      return r.rowCount === 1;
    },

    async noterSysteme(telephone: number, systeme: string | null): Promise<boolean> {
      const r = await pool.query('UPDATE telephone SET systeme = $2 WHERE numero = $1', [telephone, systeme]);
      return r.rowCount === 1;
    },

    async effacerLigne(telephone: number): Promise<void> {
      await pool.query('DELETE FROM telephone WHERE numero = $1', [telephone]);
    },

    async effacerCompte(numero: number): Promise<void> {
      await pool.query('DELETE FROM compte WHERE numero = $1', [numero]);
    },

    async lireTout() {
      const telephones = await pool.query<{ numero: number; systeme: string | null; abonne: boolean }>(
        `SELECT t.numero, t.systeme, (a.telephone IS NOT NULL) AS abonne
           FROM telephone t LEFT JOIN abonnement a ON a.telephone = t.numero ORDER BY t.numero`,
      );
      const envois = await pool.query<{
        id: string; telephone: number; nature: 'soir' | 'essai'; soir_date: string | null; soir: number | null;
        forme: 'classique' | 'declarative'; envoye_a: Date; repondu_a: Date | null; reponse_code: number | null;
        reponse_motif: string | null; recu_a: Date | null;
      }>(
        `SELECT id, telephone, nature, to_char(soir_date, 'YYYY-MM-DD') AS soir_date, soir, forme, envoye_a, repondu_a,
                reponse_code, reponse_motif, recu_a
           FROM envoi ORDER BY telephone, envoye_a`,
      );
      const comptes = await pool.query<{ numero: number; fournisseur: Fournisseur; email_recu: boolean }>(
        'SELECT numero, fournisseur, email_recu FROM compte ORDER BY numero',
      );
      return { telephones: telephones.rows, envois: envois.rows, comptes: comptes.rows };
    },
  };
}

export type Depot = ReturnType<typeof creerDepot>;
