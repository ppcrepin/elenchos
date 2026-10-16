// Le démarrage du vrai processus (src/serveur/principal.ts) en mode préparation, et ses refus (CONTRAT.md, 2.17).
// Le serveur est lancé comme chez Scalingo (`node src/serveur/principal.ts`), avec une base injoignable : s'il y
// touchait, il s'arrêterait. Aucune base de test n'est nécessaire. Hors de la fabrication chez Scalingo (le nom ne
// finit pas par « -sans-base ») : il lance des processus et attend leur fin.

import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import { join } from 'node:path';
import { test } from 'node:test';
import { CLES_DU_SERVEUR } from '../../src/serveur/config.ts';
import { b64url } from '../../src/serveur/crypto.ts';
import { CORPS_INDISPONIBLE } from '../../src/serveur/preparation.ts';

const PRINCIPAL = join(import.meta.dirname, '..', '..', 'src', 'serveur', 'principal.ts');
/** Une base qui ne répond jamais : le port 1 de la machine. */
const BASE_INJOIGNABLE = 'postgresql://inutile@127.0.0.1:1/inutile';
const LIGNE_PREPARATION = '{"evenement":"demarrage","detail":"mode preparation"}';

async function portLibre(): Promise<number> {
  const s = net.createServer();
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', r));
  const port = (s.address() as net.AddressInfo).port;
  await new Promise<void>((r) => s.close(() => r()));
  return port;
}

type Processus = { enfant: ChildProcess; sortie: () => string; erreurs: () => string; fin: Promise<number | null> };

/** Lance le serveur avec ces réglages seulement (aucun réglage de la machine qui fait les tests). */
function lancer(reglages: Record<string, string>): Processus {
  const enfant = spawn(process.execPath, [PRINCIPAL], {
    env: { PATH: process.env.PATH ?? '', DATABASE_URL: BASE_INJOIGNABLE, ...reglages },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let sortie = '';
  let erreurs = '';
  enfant.stdout!.on('data', (m: Buffer) => { sortie += m.toString('utf8'); });
  enfant.stderr!.on('data', (m: Buffer) => { erreurs += m.toString('utf8'); });
  const fin = new Promise<number | null>((r) => enfant.on('exit', (code) => r(code)));
  return { enfant, sortie: () => sortie, erreurs: () => erreurs, fin };
}

async function attendre(condition: () => boolean, ms = 15_000): Promise<void> {
  const limite = Date.now() + ms;
  while (!condition()) {
    if (Date.now() > limite) throw new Error('délai dépassé');
    await new Promise((r) => setTimeout(r, 20));
  }
}

function get(port: number, chemin: string): Promise<{ statut: number; texte: string }> {
  return new Promise((resoudre, rejeter) => {
    http.get({ host: '127.0.0.1', port, path: chemin, agent: false }, (res) => {
      const morceaux: Buffer[] = [];
      res.on('data', (m: Buffer) => morceaux.push(m));
      res.on('end', () => resoudre({ statut: res.statusCode ?? 0, texte: Buffer.concat(morceaux).toString('utf8') }));
    }).on('error', rejeter);
  });
}

test('sans les trois clés, le serveur démarre en mode préparation : sans base, la page seule, un journal d’une ligne', async () => {
  const port = await portLibre();
  const p = lancer({ PORT: String(port) });
  try {
    await attendre(() => p.sortie().includes('\n'));
    const page = await get(port, '/preparer');
    assert.equal(page.statut, 200);
    assert.match(page.texte, /<title>Préparer le serveur<\/title>/);
    assert.equal((await get(port, '/preparer.js')).statut, 200);
    for (const chemin of ['/', '/api/etat', '/invitation', '/confidentialite']) {
      const r = await get(port, chemin);
      assert.equal(r.statut, 503, chemin);
      assert.equal(r.texte, CORPS_INDISPONIBLE, chemin);
    }
    // Le journal ne dit que le mode : ni la liste des réglages manquants, ni une ligne par demande.
    assert.equal(p.sortie(), LIGNE_PREPARATION + '\n');
    assert.equal(p.erreurs(), '');
  } finally {
    p.enfant.kill('SIGTERM');
  }
  assert.equal(await p.fin, 0);
  assert.equal(p.sortie(), `${LIGNE_PREPARATION}\n{"evenement":"arret","detail":"signal"}\n`);
});

test('une ou deux clés seulement, ou deux clés égales : le serveur refuse de démarrer, sans jamais passer en préparation', async () => {
  const cas: Record<string, string>[] = [];
  for (let masque = 1; masque < 7; masque++) {
    cas.push(Object.fromEntries(CLES_DU_SERVEUR.filter((_, i) => (masque >> i) & 1).map((nom) => [nom, b64url(randomBytes(32))])));
  }
  const une = b64url(randomBytes(32));
  cas.push({ SECRET_SESSION: b64url(randomBytes(32)), CLE_REPONSES: une, CLE_IDENTITES: une });
  cas.push({ SECRET_SESSION: une, CLE_REPONSES: une, CLE_IDENTITES: b64url(randomBytes(32)) });
  cas.push({ CLE_REPONSES: une, CLE_IDENTITES: une });

  await Promise.all(cas.map(async (reglages) => {
    const p = lancer({ PORT: String(await portLibre()), ...reglages });
    let minuterie: NodeJS.Timeout | undefined;
    const code = await Promise.race([p.fin, new Promise<'delai'>((r) => { minuterie = setTimeout(() => r('delai'), 15_000); })]);
    clearTimeout(minuterie);
    if (code === 'delai') p.enfant.kill('SIGKILL');
    const quoi = Object.keys(reglages).join('+');
    assert.equal(code, 1, quoi);
    const lignes = p.sortie().trim().split('\n').map((l) => JSON.parse(l) as { evenement: string; detail?: string; manquants?: string[] });
    // Une seule ligne : le refus, au stade des réglages (jamais la base, qui ne répond pas).
    assert.equal(lignes.length, 1, quoi);
    assert.equal(lignes[0]!.evenement, 'demarrage', quoi);
    assert.equal(lignes[0]!.detail, 'reglages incomplets', quoi);
    assert.ok(!p.sortie().includes('mode preparation'), quoi);
    for (const nom of CLES_DU_SERVEUR) {
      if (!(nom in reglages)) assert.ok(lignes[0]!.manquants?.includes(nom), `${quoi} : ${nom}`);
    }
    // Les noms, jamais les valeurs.
    for (const v of Object.values(reglages)) assert.ok(!p.sortie().includes(v) && !p.erreurs().includes(v), quoi);
  }));
});
