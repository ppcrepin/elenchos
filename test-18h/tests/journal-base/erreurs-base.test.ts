// REPRIS pour le vrai jeu (proposé) : condition 6 de Juridique. Ce que Scalingo garde un an (ses journaux, dont
// celui de la base) ne doit rien contenir de nous sur les prêteurs. On le prouve sans journal réel (D-048) :
// on joue ici, sur une base locale, tout ce qui pourrait faire écrire une erreur à PostgreSQL, puis on lit son journal.
// Exige JOURNAL_BASE_DE_TEST : le chemin du fichier journal du PostgreSQL local (voir LISEZMOI.md). Jamais sauté.
// Limite : les réglages de journal de la base de Scalingo ne sont pas connus ; ce test vaut pour les réglages par
// défaut de PostgreSQL (erreurs écrites avec leur requête, jamais les valeurs des paramètres).

import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { creerDepot } from '../../src/depot.ts';
import { horlogeReglable } from '../../src/horloge.ts';
import { creerPlanificateur } from '../../src/planificateur.ts';
import { creerEnvoyeur } from '../../src/push/envoyeur.ts';
import { creerApplication } from '../../src/serveur.ts';
import { baseDeTest, CODE_ACCES, CODES, configDeTest, fauxService, fauxTelephone, journalCapture, ORIGINE } from '../aides/outils.ts';

const JOURNAL = process.env.JOURNAL_BASE_DE_TEST;
const TRACE = 'tracejb9';

let base: Awaited<ReturnType<typeof baseDeTest>>;
let adresse = '';
let fermer: () => Promise<void>;
const config = configDeTest({ SOIRS: '2026-10-19=2' });
const horloge = horlogeReglable(new Date('2026-10-19T16:00:00Z'));
const { journal, lignes } = journalCapture();
const service = fauxService();

const lireDepuis = (debut: number) => readFileSync(JOURNAL as string).subarray(debut).toString('utf8');

before(async () => {
  if (!JOURNAL) throw new Error('JOURNAL_BASE_DE_TEST manque (chemin du journal du PostgreSQL local). Ce test n’est jamais sauté.');
  base = await baseDeTest();
  const planificateur = creerPlanificateur({
    pool: base.pool, envoyeur: creerEnvoyeur(config.vapid ?? { publique: '', privee: '', contact: '' }, horloge, service.fetch),
    horloge, journal, soirs: config.soirs ?? [], adressePublique: ORIGINE,
  });
  const serveur = creerApplication({ config, pool: base.pool, journal, horloge, planificateur });
  await new Promise<void>((r) => serveur.listen(0, '127.0.0.1', () => r()));
  adresse = `http://127.0.0.1:${(serveur.address() as AddressInfo).port}`;
  fermer = () => new Promise<void>((r) => { serveur.closeAllConnections(); serveur.close(() => r()); });
});
after(async () => { await fermer?.(); await base?.fin(); });

const poster = (chemin: string, corps: unknown) => fetch(adresse + chemin, {
  method: 'POST', headers: { Origin: ORIGINE, 'Content-Type': 'application/json' }, body: JSON.stringify(corps),
});
const formulaire = (chemin: string, champs: Record<string, string>, cookie = '') => fetch(adresse + chemin, {
  method: 'POST', redirect: 'manual',
  headers: { Origin: ORIGINE, 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie },
  body: new URLSearchParams(champs).toString(),
});

test('aucune erreur de la base ne recopie une valeur des prêteurs, et notre journal n’a aucun couple « téléphone + heure »', async () => {
  const debut = statSync(JOURNAL as string).size;
  const tel = fauxTelephone();
  tel.abonnement.endpoint = `https://web.push.apple.com/${TRACE}-adresse`;
  // Doublons : le même téléphone deux fois, la même adresse sur deux téléphones (aucune contrainte sur l'adresse).
  for (const code of [CODES[0], CODES[0], CODES[1]]) assert.equal((await poster('/api/abonnement', { code, abonnement: tel.abonnement })).status, 201);
  // Valeurs refusées par le programme avant la base : adresse trop longue, clés fausses, réception mal formée.
  const longue = { ...tel.abonnement, endpoint: `https://web.push.apple.com/${TRACE}${'x'.repeat(1100)}` };
  assert.equal((await poster('/api/abonnement', { code: CODES[2], abonnement: longue })).status, 400);
  assert.equal((await poster('/api/abonnement', { code: CODES[2], abonnement: { ...tel.abonnement, keys: { p256dh: TRACE, auth: TRACE } } })).status, 400);
  assert.equal((await poster('/api/recu', { envoi: TRACE })).status, 204);
  // Le porteur : une version mal écrite, un numéro de ligne absurde.
  const entree = await formulaire('/resultats/entree', { code: CODE_ACCES });
  const porteur = (entree.headers.getSetCookie()[0] ?? '').split(';')[0] ?? '';
  await formulaire('/resultats/systeme', { telephone: '1', systeme: `iOS ${TRACE}` }, porteur);
  await formulaire('/resultats/effacer-ligne', { telephone: TRACE }, porteur);
  // Le même compte deux fois.
  const depot = creerDepot(base.pool);
  await depot.compte('google', 'e'.repeat(64), true);
  await depot.compte('google', 'e'.repeat(64), true);
  // Deux serveurs qui envoient le même soir (le verrou joue par « ON CONFLICT », sans erreur).
  const autre = base.autrePool();
  const second = creerPlanificateur({
    pool: autre, envoyeur: creerEnvoyeur(config.vapid ?? { publique: '', privee: '', contact: '' }, horloge, service.fetch),
    horloge, journal, soirs: config.soirs ?? [], adressePublique: ORIGINE,
  });
  const premier = creerPlanificateur({
    pool: base.pool, envoyeur: creerEnvoyeur(config.vapid ?? { publique: '', privee: '', contact: '' }, horloge, service.fetch),
    horloge, journal, soirs: config.soirs ?? [], adressePublique: ORIGINE,
  });
  await Promise.all([premier.tic(), second.tic(), premier.tic(), second.tic()]);
  await autre.end();
  assert.equal(service.demandes.length, 2);
  await new Promise((r) => setTimeout(r, 300)); // le journal de la base s'écrit un peu après

  const nouveau = lireDepuis(debut);
  assert.ok(!nouveau.includes(TRACE), `valeur recopiée dans le journal de la base :\n${nouveau}`);
  assert.ok(!/web\.push\.apple\.com|duplicate key|violates/i.test(nouveau), `erreur de la base :\n${nouveau}`);
  for (const l of lignes) {
    const o = JSON.parse(l);
    assert.ok(!('telephone' in o), l);
    if (o.evenement === 'envoi') assert.ok(!('nombre' in o), l);
  }
});

test('témoin : une contrainte violée en direct recopie bien la valeur (le test ci-dessus sait la voir)', async () => {
  const debut = statSync(JOURNAL as string).size;
  await base.pool.query('INSERT INTO telephone (numero) VALUES (5) ON CONFLICT DO NOTHING');
  await assert.rejects(base.pool.query(`UPDATE telephone SET systeme = 'iOS ${TRACE}' WHERE numero = 5`));
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(lireDepuis(debut).includes(TRACE), 'le journal de la base n’est pas lu : test sans valeur');
});
