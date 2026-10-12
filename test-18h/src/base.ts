// JETABLE (test du message de 18h) : la base du test et sa carte. Repris : le principe d'une carte des données
// comparée à la base réelle par un test (P-04, P-43), le verrou de l'envoi unique, l'effacement vérifié.
//
// Carte des données du test (docs/etape-6/test-18h.md, partie 5) — rien d'autre n'a le droit d'exister :
//   telephone  : numero (T1…T5), systeme (« iOS 18.5 », saisi par le porteur). Le service d'acheminement est
//                toujours Apple (D-054) : il n'est pas gardé.
//   abonnement : telephone, adresse (adresse technique du service d'acheminement), cle_p256dh, cle_auth
//   envoi      : id (tiré au hasard), telephone, nature (soir ou essai), soir_date, soir, forme
//                (classique ou déclarative), envoye_a, repondu_a, reponse_code, reponse_motif, recu_a
//   compte     : numero, fournisseur (apple ou google), empreinte (de l'identifiant), email_recu (oui ou non)
// Jamais : nom, adresse e-mail, adresse internet, heure d'ouverture de l'icône, heure du téléphone.

import pg from 'pg';

export const CARTE: Record<string, string[]> = {
  telephone: ['numero', 'systeme'],
  abonnement: ['telephone', 'adresse', 'cle_p256dh', 'cle_auth'],
  envoi: [
    'id', 'telephone', 'nature', 'soir_date', 'soir', 'forme', 'envoye_a', 'repondu_a', 'reponse_code', 'reponse_motif',
    'recu_a',
  ],
  compte: ['numero', 'fournisseur', 'empreinte', 'email_recu'],
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS telephone (
  numero smallint PRIMARY KEY CHECK (numero BETWEEN 1 AND 5),
  systeme text CHECK (systeme IS NULL OR systeme ~ '^iOS [0-9]{1,2}(\\.[0-9]{1,2}){0,2}$')
);
CREATE TABLE IF NOT EXISTS abonnement (
  telephone smallint PRIMARY KEY REFERENCES telephone (numero) ON DELETE CASCADE,
  adresse text NOT NULL CHECK (char_length(adresse) <= 1024),
  cle_p256dh text NOT NULL CHECK (char_length(cle_p256dh) <= 100),
  cle_auth text NOT NULL CHECK (char_length(cle_auth) <= 40)
);
CREATE TABLE IF NOT EXISTS envoi (
  id uuid PRIMARY KEY,
  telephone smallint NOT NULL REFERENCES telephone (numero) ON DELETE CASCADE,
  nature text NOT NULL CHECK (nature IN ('soir', 'essai')),
  soir_date date,
  soir smallint,
  forme text NOT NULL CHECK (forme IN ('classique', 'declarative')),
  envoye_a timestamptz NOT NULL,
  repondu_a timestamptz,
  reponse_code smallint,
  reponse_motif text CHECK (reponse_motif IS NULL OR reponse_motif ~ '^[A-Za-z]{1,40}$'),
  recu_a timestamptz,
  CHECK ((nature = 'soir') = (soir_date IS NOT NULL AND soir IS NOT NULL))
);
-- Le verrou de l'envoi unique : un seul envoi par soir, par téléphone et par forme, quel que soit le nombre de serveurs.
CREATE UNIQUE INDEX IF NOT EXISTS envoi_un_par_soir ON envoi (soir_date, telephone, forme) WHERE nature = 'soir';
CREATE TABLE IF NOT EXISTS compte (
  numero smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fournisseur text NOT NULL CHECK (fournisseur IN ('apple', 'google')),
  empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  email_recu boolean NOT NULL,
  UNIQUE (fournisseur, empreinte)
);
`;

/** La base de Scalingo donne « sslmode=prefer » : on chiffre la connexion, sans vérifier le certificat (comme libpq). */
export function creerPool(url: string, options: { schema?: string } = {}): pg.Pool {
  const u = new URL(url);
  const mode = u.searchParams.get('sslmode');
  u.searchParams.delete('sslmode');
  const ssl = mode === null || mode === 'disable' ? false : { rejectUnauthorized: mode === 'verify-full' };
  const config: pg.PoolConfig = { connectionString: u.toString(), ssl, max: 5, connectionTimeoutMillis: 10_000 };
  if (options.schema) config.options = `-c search_path=${options.schema}`;
  const pool = new pg.Pool(config);
  pool.on('error', () => { /* une connexion inactive coupée : le pool la remplace ; rien à écrire */ });
  return pool;
}

export async function preparerSchema(pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(1818)'); // deux conteneurs qui démarrent ensemble
    await client.query(SCHEMA);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

/** Les colonnes réelles de la base, pour la comparer à la carte (test de P-43). */
export async function colonnesReelles(pool: pg.Pool): Promise<Record<string, string[]>> {
  const r = await pool.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = current_schema() ORDER BY table_name, ordinal_position`,
  );
  const sortie: Record<string, string[]> = {};
  for (const l of r.rows) (sortie[l.table_name] ??= []).push(l.column_name);
  return sortie;
}

export type EtatBase = { vide: boolean; lignes: Record<string, number>; tablesHorsCarte: string[] };

export async function verifierVide(pool: pg.Pool): Promise<EtatBase> {
  const tables = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()`,
  );
  const tablesHorsCarte = tables.rows.map((t) => t.table_name).filter((t) => !(t in CARTE));
  const lignes: Record<string, number> = {};
  for (const t of Object.keys(CARTE)) {
    const r = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${t}`);
    lignes[t] = Number(r.rows[0]?.n ?? '-1');
  }
  const vide = tablesHorsCarte.length === 0 && Object.values(lignes).every((n) => n === 0);
  return { vide, lignes, tablesHorsCarte };
}

/** « Tout effacer » : vide la base (TRUNCATE libère les fichiers, contrairement à DELETE), puis vérifie qu'elle est vide. */
export async function toutEffacer(pool: pg.Pool): Promise<EtatBase> {
  await pool.query('TRUNCATE envoi, abonnement, telephone, compte RESTART IDENTITY');
  return verifierVide(pool);
}
