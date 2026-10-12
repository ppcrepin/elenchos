// REPRIS pour le vrai jeu (proposé) : tests de l’envoi (P-06, P-12).
// L'envoi : signature VAPID (RFC 8292, règles d'Apple), urgence haute, durée de vie, liste fermée des services.

import assert from 'node:assert/strict';
import { verify } from 'node:crypto';
import { test } from 'node:test';
import { clePubliqueP256, deB64url } from '../../src/crypto.ts';
import { horlogeReglable } from '../../src/horloge.ts';
import { creerEnvoyeur, OPTIONS_18H, verifierCleVapid } from '../../src/push/envoyeur.ts';
import { serviceDe } from '../../src/push/services.ts';
import { dechiffrer, fauxService, fauxTelephone, ORIGINE, paireVapid } from '../aides/outils.ts';

const abonnementDe = (t: ReturnType<typeof fauxTelephone>) => ({
  adresse: t.abonnement.endpoint, p256dh: t.abonnement.keys.p256dh, auth: t.abonnement.keys.auth,
});

test('demande conforme : TTL de 30 minutes, urgence haute, aes128gcm, jeton VAPID valide pour Apple', async () => {
  const v = paireVapid();
  const horloge = horlogeReglable(new Date('2026-10-18T16:00:00Z'));
  const service = fauxService();
  const envoyeur = creerEnvoyeur({ ...v, contact: ORIGINE }, horloge, service.fetch);
  const tel = fauxTelephone();
  const res = await envoyeur.envoyer(abonnementDe(tel), { notification: { title: 'Test, soir 1 sur 3' } }, OPTIONS_18H);
  assert.deepEqual(res, { code: 201, motif: null });

  const d = service.demandes[0];
  assert.ok(d);
  assert.equal(d.entetes.ttl, '1800');
  assert.equal(d.entetes.urgency, 'high');
  assert.equal(d.entetes['content-encoding'], 'aes128gcm');
  const m = /^vapid t=([^,]+), k=([A-Za-z0-9_-]+)$/.exec(d.entetes.authorization ?? '');
  assert.ok(m && m[1] && m[2]);
  assert.equal(m[2], v.publique);
  const [entete, contenu, signature] = m[1].split('.') as [string, string, string];
  assert.deepEqual(JSON.parse(deB64url(entete).toString()), { typ: 'JWT', alg: 'ES256' });
  const revendications = JSON.parse(deB64url(contenu).toString());
  assert.equal(revendications.aud, 'https://web.push.apple.com'); // l'origine du service, sans chemin
  assert.equal(revendications.sub, ORIGINE); // une adresse https, pas d'e-mail personnel
  const t = Math.floor(horloge.maintenant().getTime() / 1000);
  assert.ok(revendications.exp > t && revendications.exp <= t + 24 * 3600, 'expiration à moins d’un jour (Apple)');
  assert.ok(verify('sha256', Buffer.from(`${entete}.${contenu}`), { key: clePubliqueP256(v.publique), dsaEncoding: 'ieee-p1363' }, deB64url(signature)));
  assert.equal(JSON.parse(dechiffrer(d.corps, tel)).notification.title, 'Test, soir 1 sur 3');
});

test('le jeton VAPID n’est pas refait plus d’une fois par heure (Apple)', async () => {
  const v = paireVapid();
  const horloge = horlogeReglable(new Date('2026-10-18T16:00:00Z'));
  const service = fauxService();
  const envoyeur = creerEnvoyeur({ ...v, contact: ORIGINE }, horloge, service.fetch);
  const tel = fauxTelephone();
  await envoyeur.envoyer(abonnementDe(tel), {}, OPTIONS_18H);
  horloge.avancer(59 * 60_000);
  await envoyeur.envoyer(abonnementDe(tel), {}, OPTIONS_18H);
  assert.equal(service.demandes[0]?.entetes.authorization, service.demandes[1]?.entetes.authorization);
});

test('la réponse d’Apple est rendue : code et motif, rien d’autre', async () => {
  const v = paireVapid();
  const service = fauxService(() => ({ statut: 403, json: { reason: 'BadJwtToken' } }));
  const envoyeur = creerEnvoyeur({ ...v, contact: ORIGINE }, horlogeReglable(new Date()), service.fetch);
  assert.deepEqual(await envoyeur.envoyer(abonnementDe(fauxTelephone()), {}, OPTIONS_18H), { code: 403, motif: 'BadJwtToken' });
  const bizarre = fauxService(() => ({ statut: 400, json: { reason: '<script>traceur-7q2@exemple.invalid' } }));
  const e2 = creerEnvoyeur({ ...v, contact: ORIGINE }, horlogeReglable(new Date()), bizarre.fetch);
  assert.deepEqual(await e2.envoyer(abonnementDe(fauxTelephone()), {}, OPTIONS_18H), { code: 400, motif: null });
});

test('jamais d’envoi hors de la liste fermée des services (P-12)', async () => {
  const v = paireVapid();
  const service = fauxService();
  const envoyeur = creerEnvoyeur({ ...v, contact: ORIGINE }, horlogeReglable(new Date()), service.fetch);
  const res = await envoyeur.envoyer(abonnementDe(fauxTelephone('exemple.invalid')), {}, OPTIONS_18H);
  assert.deepEqual(res, { code: null, motif: 'ServiceHorsListe' });
  assert.equal(service.demandes.length, 0);
  assert.equal(serviceDe('https://web.push.apple.com/abc'), 'apple');
  assert.equal(serviceDe('https://api.push.apple.com/abc'), 'apple');
  assert.equal(serviceDe('https://fcm.googleapis.com/fcm/send/abc'), 'google');
  assert.equal(serviceDe('http://web.push.apple.com/abc'), null);
  assert.equal(serviceDe('https://push.apple.com.exemple.invalid/abc'), null);
  assert.equal(serviceDe('https://web.push.apple.com:8443/abc'), null);
  assert.equal(serviceDe('https://utilisateur' + '@web.push.apple.com/abc'), null); // identifiants dans l'adresse : refusés
});

test('une paire VAPID incohérente est reconnue', () => {
  const a = paireVapid();
  const b = paireVapid();
  assert.equal(verifierCleVapid(a.publique, a.privee), true);
  assert.equal(verifierCleVapid(a.publique, b.privee), false);
  assert.equal(verifierCleVapid('xyz', a.privee), false);
});
