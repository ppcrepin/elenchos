// P-22 : les droits réels de chaque rôle, lus dans la base, sont exactement ceux de DROITS (src/base/roles.ts) :
// un droit en trop fait échouer. PUBLIC n'a rien. Les rôles ne possèdent rien, n'échappent pas aux règles, ne se
// connectent pas seuls ; le propriétaire peut les prendre sans hériter de leurs droits. Chaque table porte ses règles
// de cloisonnement, imposées aussi au propriétaire (FORCE).

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { CARTE, VUES } from '../../src/base/carte.ts';
import { MODULES, nomRole } from '../../src/base/connexion.ts';
import { jouerMigrations, lireMigrations, MigrationModifiee } from '../../src/base/migrations.ts';
import { creerPoolModule } from '../../src/base/connexion.ts';
import { DROITS } from '../../src/base/roles.ts';
import { installerBase, RepliSansCloison } from '../../src/base/installation.ts';
import { baseDeTest, PROPRIETAIRE_DE_TEST, type BaseDeTest } from './aides.ts';

let base: BaseDeTest;
before(async () => { base = await baseDeTest('roles'); });
after(async () => { await base?.fin(); });

const ROLES = MODULES.map(nomRole);

test('les droits réels de chaque rôle sont exactement ceux de la liste DROITS', async () => {
  const attendus = new Set<string>();
  const colonnes = (await base.admin.query<{ table_name: string; column_name: string }>(
    'SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = $1', [base.schema])).rows;
  for (const module of MODULES) {
    attendus.add(`${module} USAGE schéma`);
    for (const [table, droits] of Object.entries(DROITS[module].tables)) {
      for (const d of droits) {
        const m = /^([A-Z]+)(?:\(([a-z_, ]+)\))?$/.exec(d);
        if (m?.[2]) for (const c of m[2].split(',')) attendus.add(`${module} ${m[1]} ${table}.${c.trim()}`);
        else attendus.add(`${module} ${m?.[1]} ${table}`);
      }
    }
    for (const f of DROITS[module].fonctions) attendus.add(`${module} EXECUTE ${f.replace(/\s+/g, '')}`);
  }
  const reels = new Set<string>();
  const module = (role: string) => MODULES.find((m) => nomRole(m) === role) ?? `?${role}`;
  const tables = await base.admin.query<{ role: string; droit: string; objet: string }>(
    `SELECT g.rolname AS role, a.privilege_type AS droit, c.relname AS objet
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace, aclexplode(c.relacl) a
       JOIN pg_roles g ON g.oid = a.grantee
      WHERE n.nspname = $1 AND g.rolname = ANY ($2)`, [base.schema, ROLES]);
  for (const l of tables.rows) reels.add(`${module(l.role)} ${l.droit} ${l.objet}`);
  const cols = await base.admin.query<{ role: string; droit: string; objet: string; colonne: string }>(
    `SELECT g.rolname AS role, a.privilege_type AS droit, c.relname AS objet, at.attname AS colonne
       FROM pg_attribute at JOIN pg_class c ON c.oid = at.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace,
            aclexplode(at.attacl) a JOIN pg_roles g ON g.oid = a.grantee
      WHERE n.nspname = $1 AND g.rolname = ANY ($2)`, [base.schema, ROLES]);
  for (const l of cols.rows) reels.add(`${module(l.role)} ${l.droit} ${l.objet}.${l.colonne}`);
  const fonctions = await base.admin.query<{ role: string; signature: string }>(
    `SELECT g.rolname AS role, p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS signature
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace, aclexplode(p.proacl) a
       JOIN pg_roles g ON g.oid = a.grantee
      WHERE n.nspname = $1 AND g.rolname = ANY ($2)`, [base.schema, ROLES]);
  for (const l of fonctions.rows) {
    // « compter_reponse(p_texte text, p_aucune boolean) » → « compter_reponse(text,boolean) »
    const sig = l.signature.replace(/\b[a-z_]+ (?=[a-z]+[,)])/g, '').replace(/\s+/g, '');
    reels.add(`${module(l.role)} EXECUTE ${sig}`);
  }
  const usage = await base.admin.query<{ role: string }>(
    `SELECT g.rolname AS role FROM pg_namespace n, aclexplode(n.nspacl) a JOIN pg_roles g ON g.oid = a.grantee
      WHERE n.nspname = $1 AND a.privilege_type = 'USAGE' AND g.rolname = ANY ($2)`, [base.schema, ROLES]);
  for (const l of usage.rows) reels.add(`${module(l.role)} USAGE schéma`);
  assert.deepEqual([...reels].sort(), [...attendus].sort());
  assert.ok(colonnes.length > 0);
});

test('PUBLIC n’a aucun droit sur les tables, les vues ni les fonctions du jeu', async () => {
  const r = await base.admin.query(
    `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace, aclexplode(c.relacl) a
      WHERE n.nspname = $1 AND a.grantee = 0
     UNION ALL
     SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace, aclexplode(p.proacl) a
      WHERE n.nspname = $1 AND a.grantee = 0`, [base.schema]);
  assert.deepEqual(r.rows, []);
  // Une fonction sans liste de droits explicite donnerait EXECUTE à PUBLIC : toutes en ont une.
  const sansListe = await base.admin.query<{ proname: string }>(
    `SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = $1 AND p.proacl IS NULL`,
    [base.schema]);
  assert.deepEqual(sansListe.rows, []);
});

test('les rôles ne se connectent pas seuls, n’échappent pas aux règles, ne possèdent rien ; le propriétaire les prend sans hériter', async () => {
  const r = await base.admin.query<{ rolname: string; rolcanlogin: boolean; rolsuper: boolean; rolbypassrls: boolean; rolinherit: boolean }>(
    'SELECT rolname, rolcanlogin, rolsuper, rolbypassrls, rolinherit FROM pg_roles WHERE rolname = ANY ($1) ORDER BY rolname', [ROLES]);
  assert.equal(r.rowCount, MODULES.length);
  for (const l of r.rows) assert.deepEqual([l.rolcanlogin, l.rolsuper, l.rolbypassrls, l.rolinherit], [false, false, false, false], l.rolname);
  const possedes = await base.admin.query(
    `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace JOIN pg_roles g ON g.oid = c.relowner
      WHERE n.nspname = $1 AND g.rolname <> $2`, [base.schema, PROPRIETAIRE_DE_TEST]);
  assert.deepEqual(possedes.rows, []);
  const appartenance = await base.admin.query<{ role: string; herite: boolean; prend: boolean }>(
    `SELECT r.rolname AS role, bool_or(m.inherit_option) AS herite, bool_or(m.set_option) AS prend
       FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles p ON p.oid = m.member
      WHERE p.rolname = $1 AND r.rolname = ANY ($2) GROUP BY r.rolname`, [PROPRIETAIRE_DE_TEST, ROLES]);
  assert.equal(appartenance.rowCount, MODULES.length);
  for (const l of appartenance.rows) assert.deepEqual([l.herite, l.prend], [false, true], l.role);
  // Aucun rôle de module n'est membre d'un autre rôle (il n'hérite de rien).
  const membres = await base.admin.query(
    `SELECT 1 FROM pg_auth_members m JOIN pg_roles p ON p.oid = m.member WHERE p.rolname = ANY ($1)`, [ROLES]);
  assert.equal(membres.rowCount, 0);
});

test('chaque table porte ses règles de cloisonnement, imposées au propriétaire (FORCE), sauf la mémoire des migrations', async () => {
  const r = await base.admin.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
    `SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = $1 AND c.relkind = 'r' ORDER BY c.relname`, [base.schema]);
  assert.deepEqual(r.rows.map((l) => l.relname), Object.keys(CARTE).sort());
  for (const l of r.rows) {
    const attendu = l.relname !== 'migration';
    assert.deepEqual([l.relrowsecurity, l.relforcerowsecurity], [attendu, attendu], l.relname);
  }
  const vues = await base.admin.query<{ relname: string }>(
    `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = $1 AND c.relkind = 'v' ORDER BY 1`,
    [base.schema]);
  assert.deepEqual(vues.rows.map((l) => l.relname), [...VUES].sort());
});

test('le propriétaire lui-même, sans module déclaré, ne voit aucune donnée de joueur', async () => {
  const p = creerPoolModule(base.urlProprietaire, 'proprietaire', 'roles', { schema: base.schema });
  try {
    await p.query("INSERT INTO carte_accord (version, empreinte, nouvel_accord) VALUES (1, $1, true) ON CONFLICT DO NOTHING", ['a'.repeat(64)]);
    await base.admin.query("INSERT INTO joueur (id, etat, cree_le) VALUES ('8f3c0000-0000-4000-8000-0000000000aa', 'provisoire', now())");
    assert.equal((await p.query('SELECT * FROM joueur')).rowCount, 0);
    assert.equal((await p.query('SELECT * FROM carte_accord')).rowCount, 1);
  } finally {
    await p.end();
    await base.admin.query("DELETE FROM joueur WHERE id = '8f3c0000-0000-4000-8000-0000000000aa'");
  }
});

test('en mode « repli », un propriétaire qui échappe aux règles (superutilisateur) fait refuser l’installation', async () => {
  const schema = 'socle_su_' + Date.now().toString(36);
  await base.admin.query(`CREATE SCHEMA ${schema}`);
  try {
    await assert.rejects(installerBase(base.url, 'repli', { schema }), RepliSansCloison);
    const tables = await base.admin.query('SELECT 1 FROM pg_tables WHERE schemaname = $1', [schema]);
    assert.equal(tables.rowCount, 0); // rien n'a été joué
  } finally {
    await base.admin.query(`DROP SCHEMA ${schema} CASCADE`);
  }
});

test('les migrations : rejouées, elles ne changent rien ; une migration jouée puis modifiée fait refuser le démarrage', async () => {
  const p = creerPoolModule(base.urlProprietaire, 'proprietaire', 'roles', { schema: base.schema, max: 1 });
  try {
    const migrations = lireMigrations();
    assert.deepEqual(migrations.map((m) => m.numero), migrations.map((_m, i) => i + 1));
    assert.equal(await jouerMigrations(p, migrations), 0);
    const modifiees = migrations.map((m, i) => (i === 0 ? { ...m, empreinte: 'f'.repeat(64) } : m));
    await assert.rejects(jouerMigrations(p, modifiees), MigrationModifiee);
  } finally {
    await p.end();
  }
});
