// Préparer la base au démarrage : les migrations, puis, en mode « roles », les rôles et leurs droits.
// Tout se fait sous le propriétaire des tables, avant que le moindre module n'ouvre une connexion.

import type { ModeRoles } from '../serveur/config.ts';
import type { Journal } from '../serveur/journal.ts';
import { creerPoolModule, type OptionsPool } from './connexion.ts';
import { jouerMigrations, lireMigrations } from './migrations.ts';
import { appliquerDroits, creerRoles } from './roles.ts';

export async function installerBase(url: string, mode: ModeRoles, options: OptionsPool = {}, journal?: Journal): Promise<void> {
  const pool = creerPoolModule(url, 'proprietaire', mode, { ...options, max: 1 });
  try {
    const n = await jouerMigrations(pool, lireMigrations());
    journal?.ecrire({ evenement: 'migration', detail: 'migrations jouees', nombre: n });
    if (mode === 'repli') {
      journal?.ecrire({ evenement: 'roles', detail: 'repli' });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(6202611)');
      await creerRoles(client);
      await appliquerDroits(client);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
    journal?.ecrire({ evenement: 'roles', detail: 'roles prets' });
  } finally {
    await pool.end();
  }
}
