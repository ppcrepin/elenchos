// P-04 : la base est exactement sa carte. Chaque table et chaque colonne réelles figurent sur la carte des données
// (src/base/carte.ts), et rien d'autre n'existe. Aucune colonne ne peut porter un nom, une adresse e-mail ou une
// adresse internet : par son nom, par son type, et parce que la base refuse ces valeurs (témoins ci-dessous).
// P-03 a : un seul pseudo, sur le joueur, aucun sur un cercle.

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { CARTE, colonnesReelles, TABLES_SANS_JOUEUR, VUES, type Forme } from '../../src/base/carte.ts';
import { baseDeTest, peupler, type BaseDeTest } from './aides.ts';

let base: BaseDeTest;
before(async () => {
  base = await baseDeTest('roles');
  await peupler(base);
});
after(async () => { await base?.fin(); });

test('les tables et colonnes réelles sont exactement celles de la carte, dans les deux sens', async () => {
  const reelles = await colonnesReelles(base.admin, base.schema);
  const trier = (o: Record<string, string[]>) => Object.fromEntries(Object.entries(o).map(([t, c]) => [t, [...c].sort()]).sort());
  const carte = Object.fromEntries(Object.entries(CARTE).map(([t, d]) => [t, Object.keys(d.colonnes)]));
  assert.deepEqual(trier(reelles), trier(carte));
});

test('les vues sont exactement celles des mesures', async () => {
  const r = await base.admin.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.views WHERE table_schema = $1 ORDER BY table_name`, [base.schema]);
  assert.deepEqual(r.rows.map((l) => l.table_name), [...VUES].sort());
});

const TYPE_ATTENDU: Record<Forme, string[]> = {
  identifiant: ['uuid'], reference: ['uuid'], empreinte: ['text'], jeton_appareil: ['text'], aleatoire: ['text'], liste: ['text'],
  texte_id: ['text'], date: ['date'], instant: ['timestamp with time zone'], entier: ['smallint', 'integer', 'bigint'],
  booleen: ['boolean'], chiffre: ['bytea'], pseudo: ['text'], intitule: ['text'], rond: ['text'], contenu_public: ['jsonb'],
  nom_migration: ['text'],
};

test('chaque colonne a le type de sa forme ; aucun type d’adresse ; du texte libre seulement pour le pseudo et le nom du cercle', async () => {
  const r = await base.admin.query<{ table_name: string; column_name: string; data_type: string }>(
    `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = $1`, [base.schema]);
  for (const c of r.rows) {
    const forme = CARTE[c.table_name]?.colonnes[c.column_name];
    if (forme === undefined) continue; // les vues : vérifiées par leur définition
    assert.ok(TYPE_ATTENDU[forme].includes(c.data_type), `${c.table_name}.${c.column_name} : ${c.data_type} pour ${forme}`);
    assert.ok(!['inet', 'cidr', 'macaddr', 'macaddr8', 'json'].includes(c.data_type), `${c.table_name}.${c.column_name}`);
    if (forme === 'contenu_public') assert.ok(TABLES_SANS_JOUEUR.includes(c.table_name), c.table_name);
  }
  const libres = Object.entries(CARTE).flatMap(([t, d]) => Object.entries(d.colonnes)
    .filter(([, f]) => f === 'pseudo' || f === 'intitule').map(([c]) => `${t}.${c}`)).sort();
  assert.deepEqual(libres, ['cercle.intitule', 'joueur.pseudo', 'joueur.pseudo_comparaison']);
});

test('aucun nom de colonne n’évoque un nom, une adresse ou un appareil, sauf une empreinte', () => {
  const evoque = /(^|_)(nom|prenom|name|email|mail|courriel|ip|adresse|url|agent|navigateur|naissance|photo|telephone|appareil)(_|$)/;
  for (const [t, d] of Object.entries(CARTE)) {
    for (const [c, forme] of Object.entries(d.colonnes)) {
      if (t === 'migration') continue; // le nom d'un fichier de migration
      if (evoque.test(c)) assert.equal(forme, 'empreinte', `${t}.${c}`);
    }
  }
  // Un seul pseudo (P-03 a) : sur le joueur, aucun sur un cercle ou un membre.
  const pseudos = Object.entries(CARTE).flatMap(([t, d]) => Object.keys(d.colonnes).filter((c) => /pseudo/.test(c)).map((c) => `${t}.${c}`));
  assert.deepEqual(pseudos.sort(), ['joueur.pseudo', 'joueur.pseudo_comparaison']);
});

test('témoin : la base refuse une adresse e-mail, une adresse internet ou une adresse IP dans chaque colonne de texte d’un joueur', async () => {
  const valeurs = ['traceur-7q2@exemple.invalid', 'https://traceur-7q2.exemple.invalid/x', '203.0.113.7', 'Traceur 203.0.113.7'];
  const r = await base.admin.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns c
      WHERE table_schema = $1 AND data_type = 'text'
        AND table_name IN (SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE')`,
    [base.schema]);
  const essayees: string[] = [];
  const client = await base.admin.connect();
  try {
    for (const { table_name: t, column_name: c } of r.rows) {
      if (t === 'migration' || ['texte', 'calendrier', 'carte_accord'].includes(t)) continue;
      const n = await client.query(`SELECT 1 FROM "${t}" LIMIT 1`);
      assert.equal(n.rowCount, 1, `le monde inventé doit remplir ${t} pour que ${t}.${c} soit essayée`);
      for (const v of valeurs) {
        await client.query('BEGIN');
        try {
          await client.query(`UPDATE "${t}" SET "${c}" = $1 WHERE ctid = (SELECT ctid FROM "${t}" LIMIT 1)`, [v]);
          assert.fail(`${t}.${c} accepte « ${v} »`);
        } catch (e) {
          const code = (e as { code?: string }).code;
          // 23514 : contrainte de forme ; 23503 : un numéro de texte inconnu ; 23505 : jamais attendu ici.
          assert.ok(code === '23514' || code === '23503', `${t}.${c} : ${code ?? String(e)}`);
        } finally {
          await client.query('ROLLBACK');
        }
      }
      essayees.push(`${t}.${c}`);
    }
  } finally {
    client.release();
  }
  assert.ok(essayees.includes('joueur.pseudo') && essayees.includes('cercle.intitule') && essayees.includes('membre.rond'));
  assert.ok(essayees.includes('abonnement.jeton') && essayees.includes('identite.empreinte'));
});

test('la base accepte un pseudo ordinaire, accents et espaces compris', async () => {
  const client = await base.admin.connect();
  try {
    await client.query('BEGIN');
    for (const p of ['Élodie', 'Jean-Marc', 'Mamie Jo', 'Zoé 2', 'Ægir', 'Léa.B']) {
      await client.query('UPDATE joueur SET pseudo = $1 WHERE ctid = (SELECT ctid FROM joueur LIMIT 1)', [p]);
    }
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
