// Le témoin des clés (migration 0005 ; src/base/temoin.ts ; CONTRAT.md, 2.17). CLE_REPONSES et CLE_IDENTITES ne
// changent jamais pendant le test : au premier démarrage normal, le serveur range une empreinte à sens unique de
// chacune ; ensuite, si l'une ne correspond plus, il refuse de démarrer, avec un détail fixe et le seul nom de la clé.
// Trois cas, demandés par l'équipe : première fois, il enregistre ; mêmes clés, il démarre ; clé changée, il refuse.
//
// D'abord la fonction, dans les deux modes de la base ; puis le vrai processus (src/serveur/principal.ts), lancé
// comme chez Scalingo contre une base de test neuve. Exige BASE_DE_TEST_URL, comme les autres tests avec base.

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import net from 'node:net';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import type pg from 'pg';
import { creerPool, MODULES } from '../../src/base/connexion.ts';
import { ClesChangees, verifierTemoinDesCles } from '../../src/base/temoin.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { b64url, temoinDeCle, type CleTemoin } from '../../src/serveur/crypto.ts';
import { baseDeTest, PROPRIETAIRE_DE_TEST, toutCeQuIlVoit, urlDeTest, type BaseDeTest } from './aides.ts';

/** Toutes les écritures d'une clé qu'un journal ou une table pourraient trahir. */
function formes(cle: Buffer): string[] {
  return [cle.toString('hex'), b64url(cle), cle.toString('base64')];
}

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`le témoin des clés, mode « ${mode} »`, () => {
    let base: BaseDeTest;
    before(async () => { base = await baseDeTest(mode); });
    after(async () => { await base?.fin(); });

    const reponses = randomBytes(32);
    const identites = randomBytes(32);
    const verifier = (r: Buffer, i: Buffer) =>
      verifierTemoinDesCles(base.urlProprietaire, { CLE_REPONSES: r, CLE_IDENTITES: i }, { schema: base.schema });
    const ranges = async () =>
      (await base.admin.query<{ cle: string; empreinte: string }>('SELECT cle, empreinte FROM temoin_cle ORDER BY cle')).rows;
    const refusees = (attendues: CleTemoin[]) => (e: unknown) => {
      assert.ok(e instanceof ClesChangees, String(e));
      assert.deepEqual(e.cles, attendues);
      return true;
    };

    test('première fois : il range une empreinte de chaque clé, qui ne contient la clé sous aucune forme', async () => {
      assert.deepEqual(await ranges(), []);
      assert.equal(await verifier(reponses, identites), 'enregistre');
      const r = await ranges();
      assert.deepEqual(r, [
        { cle: 'CLE_IDENTITES', empreinte: temoinDeCle(identites, 'CLE_IDENTITES') },
        { cle: 'CLE_REPONSES', empreinte: temoinDeCle(reponses, 'CLE_REPONSES') },
      ]);
      const tout = JSON.stringify(r);
      for (const f of [...formes(reponses), ...formes(identites)]) assert.ok(!tout.includes(f), 'la clé est lisible dans le témoin');
      // L'étiquette est propre à chaque clé : la même valeur collée aux deux places n'aurait pas le même témoin.
      assert.notEqual(temoinDeCle(reponses, 'CLE_REPONSES'), temoinDeCle(reponses, 'CLE_IDENTITES'));
    });

    test('mêmes clés : il démarre, sans rien écrire', async () => {
      const avant = await ranges();
      assert.equal(await verifier(reponses, identites), 'conforme');
      assert.equal(await verifier(Buffer.from(reponses), Buffer.from(identites)), 'conforme');
      assert.deepEqual(await ranges(), avant);
    });

    test('une clé changée : refus, avec le seul nom de la clé en cause, et rien n’est écrit', async () => {
      const avant = await ranges();
      const autre = randomBytes(32);
      await assert.rejects(verifier(autre, identites), refusees(['CLE_REPONSES']));
      await assert.rejects(verifier(reponses, autre), refusees(['CLE_IDENTITES']));
      // Les deux clés échangées l'une avec l'autre : les deux sont refusées.
      await assert.rejects(verifier(identites, reponses), refusees(['CLE_REPONSES', 'CLE_IDENTITES']));
      // Le message de l'erreur est fixe : aucune valeur, ni l'ancienne ni la nouvelle.
      await assert.rejects(verifier(autre, identites), (e: unknown) => {
        const texte = String(e) + JSON.stringify(e);
        for (const f of [...formes(autre), ...formes(reponses), ...formes(identites)]) assert.ok(!texte.includes(f));
        return true;
      });
      assert.deepEqual(await ranges(), avant);
    });

    test('un témoin manquant est rangé, l’autre toujours comparé', async () => {
      await base.admin.query("DELETE FROM temoin_cle WHERE cle = 'CLE_IDENTITES'");
      // CLE_REPONSES a changé : refus, et le témoin manquant n'est pas rangé pour autant.
      await assert.rejects(verifier(randomBytes(32), identites), refusees(['CLE_REPONSES']));
      assert.deepEqual((await ranges()).map((l) => l.cle), ['CLE_REPONSES']);
      assert.equal(await verifier(reponses, identites), 'enregistre');
      assert.deepEqual((await ranges()).map((l) => l.cle), ['CLE_IDENTITES', 'CLE_REPONSES']);
      assert.equal(await verifier(reponses, identites), 'conforme');
    });

    test('deux démarrages en même temps, la première fois : un seul range le témoin, l’autre le compare', async () => {
      await base.admin.query('DELETE FROM temoin_cle');
      const issues = await Promise.all([verifier(reponses, identites), verifier(reponses, identites)]);
      assert.deepEqual(issues.sort(), ['conforme', 'enregistre']);
      assert.equal((await ranges()).length, 2);
    });

    test('aucun module ne lit le témoin : seul le propriétaire, au démarrage', async () => {
      for (const m of MODULES) {
        const v = (await toutCeQuIlVoit(base, m, ['temoin_cle'], {})).temoin_cle;
        if (mode === 'roles') assert.equal(v, 'refus', m);
        else assert.deepEqual(v, [], m);
      }
    });
  });
}

// --- Le vrai processus ---------------------------------------------------------------------------------------------

const PRINCIPAL = join(import.meta.dirname, '..', '..', 'src', 'serveur', 'principal.ts');
const LIGNE_ENREGISTRE = '{"evenement":"demarrage","detail":"temoin des cles enregistre"}';
const LIGNE_PRET = '{"evenement":"demarrage","detail":"pret"}';

async function portLibre(): Promise<number> {
  const s = net.createServer();
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', r));
  const port = (s.address() as net.AddressInfo).port;
  await new Promise<void>((r) => s.close(() => r()));
  return port;
}

type Cles = { SECRET_SESSION: string; CLE_REPONSES: string; CLE_IDENTITES: string };
type Demarrage = { code: number | null; sortie: string; erreurs: string };

/** Lance le serveur avec ces seuls réglages ; s'il est prêt, l'arrête comme Scalingo (SIGTERM). Rend son code de
 *  sortie et tout ce qu'il a écrit. */
async function demarrer(urlBase: string, cles: Cles): Promise<Demarrage> {
  const enfant = spawn(process.execPath, [PRINCIPAL], {
    env: { PATH: process.env.PATH ?? '', DATABASE_URL: urlBase, PORT: String(await portLibre()), ...cles },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let sortie = '';
  let erreurs = '';
  enfant.stdout.on('data', (m: Buffer) => {
    sortie += m.toString('utf8');
    if (sortie.includes(LIGNE_PRET + '\n')) enfant.kill('SIGTERM');
  });
  enfant.stderr.on('data', (m: Buffer) => { erreurs += m.toString('utf8'); });
  const delai = setTimeout(() => enfant.kill('SIGKILL'), 60_000);
  const code = await new Promise<number | null>((r) => enfant.on('exit', (c) => r(c)));
  clearTimeout(delai);
  return { code, sortie, erreurs };
}

function lignes(d: Demarrage): string[] {
  return d.sortie.trim().split('\n');
}

describe('le vrai démarrage du serveur (principal.ts), contre une base neuve', () => {
  let admin: pg.Pool;
  let nomBase: string;
  let urlBase: string;
  const cles: Cles = {
    SECRET_SESSION: b64url(randomBytes(32)), CLE_REPONSES: b64url(randomBytes(32)), CLE_IDENTITES: b64url(randomBytes(32)),
  };
  const toutesLesValeurs: string[] = [...Object.values(cles)];
  const sansValeur = (d: Demarrage, quoi: string) => {
    for (const v of toutesLesValeurs) assert.ok(!d.sortie.includes(v) && !d.erreurs.includes(v), `${quoi} : une clé est écrite`);
  };

  before(async () => {
    const url = urlDeTest();
    admin = creerPool(url, {}, { max: 1 });
    await admin.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${PROPRIETAIRE_DE_TEST}') THEN
        CREATE ROLE ${PROPRIETAIRE_DE_TEST} LOGIN CREATEROLE NOSUPERUSER NOBYPASSRLS;
      END IF; END $$`);
    nomBase = 'elenchos_temoin_' + randomBytes(6).toString('hex');
    await admin.query(`CREATE DATABASE ${nomBase} OWNER ${PROPRIETAIRE_DE_TEST}`);
    const u = new URL(url);
    u.username = PROPRIETAIRE_DE_TEST;
    u.password = '';
    u.pathname = '/' + nomBase;
    urlBase = u.toString();
  });
  after(async () => {
    if (nomBase) await admin.query(`DROP DATABASE IF EXISTS ${nomBase} WITH (FORCE)`);
    await admin?.end();
  });

  test('premier démarrage normal : le témoin est rangé, puis le serveur est prêt', async () => {
    const d = await demarrer(urlBase, cles);
    assert.equal(d.code, 0, d.sortie);
    const l = lignes(d);
    assert.ok(l.includes(LIGNE_ENREGISTRE), d.sortie);
    assert.ok(l.indexOf(LIGNE_ENREGISTRE) < l.indexOf(LIGNE_PRET), d.sortie);
    sansValeur(d, 'premier démarrage');
  });

  test('mêmes clés : il démarre, sans rien ranger de nouveau', async () => {
    const d = await demarrer(urlBase, cles);
    assert.equal(d.code, 0, d.sortie);
    assert.ok(lignes(d).includes(LIGNE_PRET), d.sortie);
    assert.ok(!d.sortie.includes('temoin des cles enregistre'), d.sortie);
    sansValeur(d, 'mêmes clés');
  });

  test('CLE_REPONSES ou CLE_IDENTITES changée : il refuse de démarrer, avec un détail fixe et le seul nom de la clé', async () => {
    for (const nom of ['CLE_REPONSES', 'CLE_IDENTITES'] as const) {
      const nouvelle = b64url(randomBytes(32));
      toutesLesValeurs.push(nouvelle);
      const d = await demarrer(urlBase, { ...cles, [nom]: nouvelle });
      assert.equal(d.code, 1, `${nom} : ${d.sortie}`);
      const l = lignes(d);
      assert.equal(l.at(-1), `{"evenement":"demarrage","detail":"cles changees","manquants":["${nom}"]}`, nom);
      assert.ok(!l.includes(LIGNE_PRET), nom);
      assert.equal(d.erreurs, '', nom);
      sansValeur(d, nom);
    }
  });

  test('SECRET_SESSION changé : il démarre (tout le monde est déconnecté, rien n’est perdu)', async () => {
    const d = await demarrer(urlBase, { ...cles, SECRET_SESSION: b64url(randomBytes(32)) });
    assert.equal(d.code, 0, d.sortie);
    assert.ok(lignes(d).includes(LIGNE_PRET), d.sortie);
  });
});
