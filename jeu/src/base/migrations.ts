// Les migrations : des fichiers SQL numérotés (src/base/migrations/NNNN-nom.sql), joués dans l'ordre, une seule fois,
// sous le propriétaire des tables et seulement par lui (DECISIONS-TECHNIQUES 1.5). Puis, en mode « roles », les
// rôles des modules et leurs droits (roles.ts).
//
// Une migration déjà jouée ne se modifie jamais : son empreinte est gardée, et le serveur refuse de démarrer si le
// fichier a changé depuis. Une correction se fait par une migration nouvelle.
// Toutes les migrations en attente se jouent dans une seule transaction, sous un verrou : deux conteneurs qui
// démarrent ensemble (Scalingo, pendant une mise en ligne) ne les jouent pas deux fois.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type pg from 'pg';

export const DOSSIER_MIGRATIONS = join(import.meta.dirname, 'migrations');
const NOM = /^(\d{4})-[a-z0-9-]+\.sql$/;
const VERROU_MIGRATIONS = 6_202_610; // un nombre fixe, propre à ce verrou

export type Migration = { numero: number; nom: string; sql: string; empreinte: string };

export function lireMigrations(dossier = DOSSIER_MIGRATIONS): Migration[] {
  const migrations = readdirSync(dossier)
    .filter((nom) => NOM.test(nom))
    .sort()
    .map((nom) => {
      const sql = readFileSync(join(dossier, nom), 'utf8');
      return { numero: Number(NOM.exec(nom)?.[1]), nom, sql, empreinte: createHash('sha256').update(sql).digest('hex') };
    });
  migrations.forEach((m, i) => {
    if (m.numero !== i + 1) throw new Error('migrations : numérotation trouée ou en double');
  });
  return migrations;
}

export class MigrationModifiee extends Error {
  override name = 'Error';
  constructor() { super('migration déjà jouée, modifiée depuis'); }
}

/** Joue les migrations en attente. Rend le nombre de migrations jouées. `pool` : le propriétaire des tables. */
export async function jouerMigrations(pool: pg.Pool, migrations = lireMigrations()): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [VERROU_MIGRATIONS]);
    await client.query(`CREATE TABLE IF NOT EXISTS migration (
      numero integer PRIMARY KEY, nom text NOT NULL, empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
      jouee_le timestamptz NOT NULL DEFAULT now())`);
    await client.query('REVOKE ALL ON TABLE migration FROM PUBLIC');
    const deja = await client.query<{ numero: number; empreinte: string }>('SELECT numero, empreinte FROM migration');
    const jouees = new Map(deja.rows.map((l) => [l.numero, l.empreinte]));
    let n = 0;
    for (const m of migrations) {
      const empreinte = jouees.get(m.numero);
      if (empreinte !== undefined) {
        if (empreinte !== m.empreinte) throw new MigrationModifiee();
        continue;
      }
      await client.query(m.sql);
      await client.query('INSERT INTO migration (numero, nom, empreinte) VALUES ($1, $2, $3) ON CONFLICT (numero) DO NOTHING',
        [m.numero, m.nom, m.empreinte]);
      n += 1;
    }
    await client.query('COMMIT');
    return n;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
