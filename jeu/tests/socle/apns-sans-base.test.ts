// L'envoyeur vers Apple (src/serveur/apns.ts), contre un faux service HTTP/2 local : ce qui part (chemin, en-têtes,
// contenu), le jeton du fournisseur ES256 vérifié avec la clé publique et renouvelé au bout de 40 minutes seulement,
// un abonnement refusé (410) à retirer, un 400 qui ne retire rien, une raison inconnue d'Apple qui ne passe pas.

import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import http2 from 'node:http2';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { creerEnvoyeurApns, RENOUVELLEMENT_JETON_MS, type EnvoyeurApns } from '../../src/serveur/apns.ts';
import { deB64url } from '../../src/serveur/crypto.ts';
import { horlogeReglable } from '../../src/serveur/horloge.ts';
import { messageDu18h } from '../../src/serveur/planificateur.ts';
import { MESSAGES_18H, type Message18h } from '../../src/contrat.ts';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const JETON_OK = 'a'.repeat(64);
const JETON_PARTI = 'b'.repeat(64);
const JETON_MAUVAIS = 'c'.repeat(64);
const JETON_BIZARRE = 'd'.repeat(64);

type Recu = { entetes: http2.IncomingHttpHeaders; corps: string };
const recus: Recu[] = [];
let serveur: http2.Http2Server;
let adresse: string;

before(async () => {
  serveur = http2.createServer();
  serveur.on('stream', (flux, entetes) => {
    const morceaux: Buffer[] = [];
    flux.on('data', (m: Buffer) => morceaux.push(m));
    flux.on('end', () => {
      recus.push({ entetes, corps: Buffer.concat(morceaux).toString('utf8') });
      const chemin = String(entetes[':path']);
      const repondre = (statut: number, raison?: string) => {
        flux.respond({ ':status': statut, 'apns-id': 'id-apple' });
        flux.end(raison ? JSON.stringify({ reason: raison }) : undefined);
      };
      if (chemin.endsWith(JETON_PARTI)) repondre(410, 'Unregistered');
      else if (chemin.endsWith(JETON_MAUVAIS)) repondre(400, 'BadDeviceToken');
      else if (chemin.endsWith(JETON_BIZARRE)) repondre(400, 'traceur-7q2@exemple.invalid');
      else repondre(200);
    });
  });
  await new Promise<void>((r) => serveur.listen(0, '127.0.0.1', r));
  adresse = `http://127.0.0.1:${(serveur.address() as AddressInfo).port}`;
});
after(async () => { await new Promise<void>((r) => serveur.close(() => r())); });

const DEPART = new Date('2026-10-20T16:00:00Z'); // 18h00 à Paris
function envoyeur(horloge = horlogeReglable(DEPART)): { e: EnvoyeurApns; horloge: ReturnType<typeof horlogeReglable> } {
  return {
    e: creerEnvoyeurApns({
      idEquipe: 'EQUIPE1234', idCle: 'CLEMSG1234', clePrivee: privateKey, idApplication: 'fr.exemple.elenchos', service: 'production',
      horloge, adresse,
    }),
    horloge,
  };
}
const message = (envoi: string) => messageDu18h(MESSAGES_18H[2] as Message18h, envoi);

/** Le jeton du fournisseur reçu par le faux service : vérifié avec la clé publique, puis lu. */
function jetonRecu(r: Recu): { entete: Record<string, unknown>; contenu: Record<string, unknown> } {
  const [h, c, s] = String(r.entetes.authorization).replace(/^bearer /, '').split('.') as [string, string, string];
  assert.ok(verify('sha256', Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, deB64url(s)), 'signature ES256');
  return { entete: JSON.parse(deB64url(h).toString('utf8')), contenu: JSON.parse(deB64url(c).toString('utf8')) };
}

test('un envoi réussi : le chemin, les en-têtes d’Apple, le contenu MessageApns, le jeton ES256 de l’équipe', async () => {
  recus.length = 0;
  const { e } = envoyeur();
  const r = await e.envoyer(JETON_OK, message('8f3c0000-0000-4000-8000-000000000001'));
  e.fermer();
  assert.deepEqual(r, { statut: 200, raison: null, retirer: false });
  const [recu] = recus;
  assert.ok(recu);
  assert.equal(recu.entetes[':method'], 'POST');
  assert.equal(recu.entetes[':path'], `/3/device/${JETON_OK}`);
  assert.equal(recu.entetes['apns-topic'], 'fr.exemple.elenchos');
  assert.equal(recu.entetes['apns-push-type'], 'alert');
  assert.equal(recu.entetes['apns-priority'], '10');
  assert.equal(recu.entetes['apns-expiration'], String(Math.floor(DEPART.getTime() / 1000) + 1800));
  assert.deepEqual(JSON.parse(recu.corps), {
    aps: { alert: { title: 'Elenchos', body: '18h. La question d’aujourd’hui t’attend.' }, sound: 'default', 'mutable-content': 1 },
    envoi: '8f3c0000-0000-4000-8000-000000000001',
  });
  const { entete, contenu } = jetonRecu(recu);
  assert.deepEqual(entete, { kid: 'CLEMSG1234', alg: 'ES256' });
  assert.deepEqual(contenu, { iss: 'EQUIPE1234', iat: Math.floor(DEPART.getTime() / 1000) });
});

test('le jeton du fournisseur sert 40 minutes, puis il est refait (jamais plus d’une fois par 20 minutes)', async () => {
  recus.length = 0;
  const { e, horloge } = envoyeur();
  await e.envoyer(JETON_OK, message('8f3c0000-0000-4000-8000-000000000002'));
  horloge.avancer(RENOUVELLEMENT_JETON_MS - 1000);
  await e.envoyer(JETON_OK, message('8f3c0000-0000-4000-8000-000000000003'));
  horloge.avancer(2000);
  await e.envoyer(JETON_OK, message('8f3c0000-0000-4000-8000-000000000004'));
  e.fermer();
  const iats = recus.map((r) => jetonRecu(r).contenu.iat);
  const t0 = Math.floor(DEPART.getTime() / 1000);
  assert.deepEqual(iats, [t0, t0, t0 + Math.floor((RENOUVELLEMENT_JETON_MS + 1000) / 1000)]);
  assert.equal(recus[0]?.entetes.authorization, recus[1]?.entetes.authorization);
  assert.notEqual(recus[1]?.entetes.authorization, recus[2]?.entetes.authorization);
  assert.ok(RENOUVELLEMENT_JETON_MS >= 20 * 60_000 && RENOUVELLEMENT_JETON_MS < 60 * 60_000);
});

test('Apple refuse : 410 (application désinstallée, jeton périmé) se retire ; 400 ne retire rien ; une raison inconnue ne passe pas', async () => {
  const { e } = envoyeur();
  assert.deepEqual(await e.envoyer(JETON_PARTI, message('8f3c0000-0000-4000-8000-000000000005')), { statut: 410, raison: 'Unregistered', retirer: true });
  assert.deepEqual(await e.envoyer(JETON_MAUVAIS, message('8f3c0000-0000-4000-8000-000000000006')), { statut: 400, raison: 'BadDeviceToken', retirer: false });
  assert.deepEqual(await e.envoyer(JETON_BIZARRE, message('8f3c0000-0000-4000-8000-000000000007')), { statut: 400, raison: 'autre', retirer: false });
  e.fermer();
});

test('un jeton d’appareil illisible ne part pas ; un service injoignable rend « réseau », sans planter', async () => {
  const { e } = envoyeur();
  const avant = recus.length;
  assert.deepEqual(await e.envoyer('../../etc', message('8f3c0000-0000-4000-8000-000000000008')), { statut: null, raison: 'BadDeviceToken', retirer: false });
  assert.equal(recus.length, avant);
  const injoignable = creerEnvoyeurApns({
    idEquipe: 'EQUIPE1234', idCle: 'CLEMSG1234', clePrivee: privateKey, idApplication: 'fr.exemple.elenchos', service: 'production',
    horloge: horlogeReglable(DEPART), adresse: 'http://127.0.0.1:1',
  });
  const r = await injoignable.envoyer(JETON_OK, message('8f3c0000-0000-4000-8000-000000000009'));
  injoignable.fermer();
  assert.deepEqual(r, { statut: null, raison: 'reseau', retirer: false });
});
