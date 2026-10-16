// Les connexions à la base, une par module, et la déclaration de qui fait la demande (P-25).
// Origine du chiffrement : test-18h/src/base.ts (chiffrementBase, creerPool : REPRIS, 12 octobre 2026), copié tel quel.
//
// Chaque module du serveur (jeu, comptes, envoi, ménage, mesures) a son propre groupe de connexions. Toutes partent
// de la même adresse (celle que donne Scalingo, au nom du propriétaire des tables) ; c'est le paramètre de démarrage
// de la connexion qui fixe sous quel module elle agit, avant toute requête :
// - mode « roles » : « -c role=elenchos_jeu » ; la connexion agit sous ce rôle, qui n'est pas propriétaire des
//   tables et n'a que ses droits (P-22) ;
// - mode « repli » : « -c elenchos.module=jeu » ; la connexion reste celle du propriétaire, et seules les règles de
//   cloisonnement par ligne, imposées au propriétaire lui-même (FORCE ROW LEVEL SECURITY), la retiennent.
// Ce que chaque mode protège, et ce qu'il ne protège pas : jeu/src/base/LISEZMOI.md.

import pg from 'pg';
import type { ModeRoles } from '../serveur/config.ts';

/** Les modules du serveur, chacun avec ses droits (DECISIONS-TECHNIQUES 1.6 ; P-22). « proprietaire » ne sert
 *  qu'aux migrations, à l'import des textes et aux liens de créateur (outil du porteur). */
export const MODULES = ['jeu', 'comptes', 'envoi', 'menage', 'mesures'] as const;
export type Module = (typeof MODULES)[number];
export type ModuleOuProprietaire = Module | 'proprietaire';

/** Le nom PostgreSQL du rôle d'un module. Préfixé, pour ne jamais se confondre avec un autre compte de la base. */
export function nomRole(module: Module): string {
  return `elenchos_${module}`;
}

/** Le chiffrement de la connexion à la base, lu dans l'adresse. La base de Scalingo donne « sslmode=prefer ».
 *  Une adresse sans « sslmode » est traitée comme « prefer » : chiffrée, sans vérifier le certificat (comme libpq),
 *  pour que la connexion soit chiffrée même si le réglage « Force TLS » de Scalingo était oublié. Contrairement à
 *  libpq, on ne retombe jamais en clair : un serveur sans TLS est refusé. Seul « sslmode=disable » (base locale de
 *  test) se connecte en clair ; « verify-full » vérifie aussi le certificat. */
export function chiffrementBase(url: string): { adresse: string; ssl: false | { rejectUnauthorized: boolean } } {
  const u = new URL(url);
  const mode = u.searchParams.get('sslmode');
  u.searchParams.delete('sslmode');
  const ssl = mode === 'disable' ? false : { rejectUnauthorized: mode === 'verify-full' };
  return { adresse: u.toString(), ssl };
}

const NOM_SIMPLE = /^[a-z_][a-z0-9_]{0,62}$/;

export type OptionsPool = { schema?: string; max?: number };

/** Un groupe de connexions. Les paramètres de démarrage sont posés à l'ouverture de chaque connexion. */
export function creerPool(url: string, parametres: Record<string, string> = {}, options: OptionsPool = {}): pg.Pool {
  const { adresse, ssl } = chiffrementBase(url);
  const config: pg.PoolConfig = { connectionString: adresse, ssl, max: options.max ?? 5, connectionTimeoutMillis: 10_000 };
  const p: Record<string, string> = { ...parametres };
  if (options.schema !== undefined) p.search_path = options.schema;
  const morceaux: string[] = [];
  for (const [nom, valeur] of Object.entries(p)) {
    if (!/^[a-z_][a-z0-9_.]{0,62}$/.test(nom) || !NOM_SIMPLE.test(valeur)) throw new Error('paramètre de connexion illisible');
    morceaux.push(`-c ${nom}=${valeur}`);
  }
  if (morceaux.length > 0) config.options = morceaux.join(' ');
  const pool = new pg.Pool(config);
  pool.on('error', () => { /* une connexion inactive coupée : le pool la remplace ; rien à écrire (P-07) */ });
  return pool;
}

/** Le groupe de connexions d'un module, sous son rôle (mode « roles ») ou sous sa marque (mode « repli »). */
export function creerPoolModule(url: string, module: ModuleOuProprietaire, mode: ModeRoles, options: OptionsPool = {}): pg.Pool {
  if (module === 'proprietaire') return creerPool(url, { 'elenchos.module': 'proprietaire' }, options);
  const parametres: Record<string, string> = mode === 'roles' ? { role: nomRole(module) } : { 'elenchos.module': module };
  return creerPool(url, parametres, options);
}

/** Qui fait la demande, et quand. `joueur` : l'identifiant du joueur (compte ou provisoire) ; `jeton` : l'empreinte
 *  du jeton d'un lien d'invitation, pour qui ouvre un lien sans être encore joueur (P-29). Sans déclaration, les règles
 *  de cloisonnement ne voient personne et la base ne rend rien (DECISIONS-TECHNIQUES 1.6). `instant` : l'heure de
 *  l'horloge du serveur (horloge.ts), qui juge « avant ou après 18h » pour la base (`instant_du_jeu`, migration 0002) ;
 *  sans elle, la base prend sa propre heure. Le serveur la déclare à chaque transaction ; l'horloge accélérée du
 *  développement local et les tests en ont besoin. */
export type Declaration = { joueur?: string; jeton?: string; instant?: Date };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const HEX64 = /^[0-9a-f]{64}$/;

/** Une transaction qui déclare d'abord qui la fait (SET LOCAL : la déclaration meurt avec la transaction, et ne
 *  peut donc jamais passer à la demande suivante qui réutiliserait la connexion). */
export async function enTransaction<T>(pool: pg.Pool, qui: Declaration, travail: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  if (qui.joueur !== undefined && !UUID.test(qui.joueur)) throw new TypeError('joueur illisible');
  if (qui.jeton !== undefined && !HEX64.test(qui.jeton)) throw new TypeError('jeton illisible');
  if (qui.instant !== undefined && !Number.isFinite(qui.instant.getTime())) throw new TypeError('instant illisible');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (qui.joueur !== undefined) await client.query("SELECT set_config('elenchos.joueur', $1, true)", [qui.joueur]);
    if (qui.jeton !== undefined) await client.query("SELECT set_config('elenchos.jeton', $1, true)", [qui.jeton]);
    if (qui.instant !== undefined) await client.query("SELECT set_config('elenchos.instant', $1, true)", [qui.instant.toISOString()]);
    const resultat = await travail(client);
    await client.query('COMMIT');
    return resultat;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
