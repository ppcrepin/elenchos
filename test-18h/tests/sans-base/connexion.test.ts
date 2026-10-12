// REPRIS pour le vrai jeu (proposé) : tests de la connexion (P-03, P-10).
// La connexion Google et Apple, contre de faux serveurs d'Apple et de Google :
// demande minimale (P-03), state, nonce, PKCE chez Google, retour par formulaire, adresse e-mail jetée.

import assert from 'node:assert/strict';
import { generateKeyPairSync, sign, verify, createPublicKey } from 'node:crypto';
import { test } from 'node:test';
import { adresseDeRetour, creerConnexion, RefusConnexion, type Fournisseur } from '../../src/connexion.ts';
import { b64url, deB64url } from '../../src/crypto.ts';
import { horlogeReglable } from '../../src/horloge.ts';
import { configDeTest, ORIGINE, TRACEUR } from '../aides/outils.ts';

const { privateKey: cleFournisseur } = generateKeyPairSync('rsa', { modulusLength: 2048 });

function jetonIdentite(revendications: Record<string, unknown>): string {
  const morceaux = `${b64url(Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1', typ: 'JWT' })))}.${b64url(Buffer.from(JSON.stringify(revendications)))}`;
  return `${morceaux}.${b64url(sign('sha256', Buffer.from(morceaux), cleFournisseur))}`;
}

type Requete = { url: string; corps: URLSearchParams };

function fauxFournisseur(f: Fournisseur, horloge: { maintenant(): Date }, revendications: (nonce: string) => Record<string, unknown>) {
  const requetes: Requete[] = [];
  let nonceAttendu = '';
  const faux = (async (entree: string | URL | Request, init?: RequestInit) => {
    const url = entree instanceof Request ? entree.url : String(entree);
    const corps = new URLSearchParams(String(init?.body ?? ''));
    requetes.push({ url, corps });
    const t = Math.floor(horloge.maintenant().getTime() / 1000);
    const iss = f === 'google' ? 'https://accounts.google.com' : 'https://appleid.apple.com';
    const aud = f === 'google' ? 'client-google-de-test.apps.googleusercontent.com' : 'fr.exemple.test18h.web';
    const id_token = jetonIdentite({ iss, aud, iat: t, exp: t + 600, ...revendications(nonceAttendu) });
    return new Response(JSON.stringify({ access_token: 'a', token_type: 'Bearer', expires_in: 3600, id_token }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return { fetch: faux, requetes, fixerNonce: (n: string) => { nonceAttendu = n; } };
}

async function parcours(f: Fournisseur, revendications: (nonce: string) => Record<string, unknown>, retouche?: (p: URLSearchParams) => void) {
  const config = configDeTest();
  const horloge = horlogeReglable(new Date('2026-10-17T09:00:00Z'));
  const faux = fauxFournisseur(f, horloge, revendications);
  const connexion = creerConnexion(config, horloge, faux.fetch);
  const { url, transaction } = await connexion.debut(f);
  faux.fixerNonce(transaction.n);
  const p = new URLSearchParams({ code: 'code-de-test', state: transaction.s });
  if (f === 'apple') p.set('user', JSON.stringify({ name: { firstName: TRACEUR.nom }, email: TRACEUR.email }));
  retouche?.(p);
  return { url: new URL(url), transaction, faux, connexion, p, config };
}

test('Google : demande minimale, form_post, state, nonce et PKCE ; rien d’autre', async () => {
  const { url, transaction } = await parcours('google', (n) => ({ sub: TRACEUR.sub, nonce: n }));
  assert.equal(url.origin + url.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
  const q = Object.fromEntries(url.searchParams);
  assert.equal(q.scope, 'openid email'); // jamais « profile » : ni nom ni photo (P-03)
  assert.equal(q.response_type, 'code');
  assert.equal(q.response_mode, 'form_post');
  assert.equal(q.redirect_uri, `${ORIGINE}/connexion/google/retour`);
  assert.equal(q.state, transaction.s);
  assert.equal(q.nonce, transaction.n);
  assert.equal(q.code_challenge_method, 'S256');
  assert.ok(q.code_challenge && transaction.v);
  assert.deepEqual(Object.keys(q).sort(), ['client_id', 'code_challenge', 'code_challenge_method', 'nonce', 'redirect_uri', 'response_mode', 'response_type', 'scope', 'state']);
});

test('Apple : form_post, state, nonce ; pas de PKCE (non annoncé par Apple)', async () => {
  const { url, transaction } = await parcours('apple', (n) => ({ sub: TRACEUR.sub, nonce: n }));
  assert.equal(url.origin + url.pathname, 'https://appleid.apple.com/auth/authorize');
  assert.equal(url.searchParams.get('response_mode'), 'form_post');
  assert.equal(url.searchParams.get('scope'), 'openid email'); // jamais « name » (P-03)
  assert.equal(url.searchParams.get('code_challenge'), null);
  assert.equal(transaction.v, null);
});

test('Google : retour réussi ; le vérificateur PKCE part avec le code ; l’adresse est notée « reçue », pas rendue', async () => {
  const { connexion, transaction, p, faux } = await parcours('google', (n) => ({ sub: TRACEUR.sub, nonce: n, email: TRACEUR.email, name: TRACEUR.nom }));
  const identite = await connexion.retour('google', p, transaction);
  assert.deepEqual(identite, { fournisseur: 'google', sub: TRACEUR.sub, emailRecu: true });
  assert.ok(!JSON.stringify(identite).includes(TRACEUR.email));
  const r = faux.requetes[0];
  assert.equal(r?.url, 'https://oauth2.googleapis.com/token');
  assert.equal(r?.corps.get('code_verifier'), transaction.v);
  assert.equal(r?.corps.get('client_secret'), 'secret-google-de-test');
  assert.equal(r?.corps.get('redirect_uri'), adresseDeRetour(ORIGINE, 'google'));
});

test('Apple : secret client signé par la clé .p8, cinq minutes ; le champ « user » (nom) est ignoré', async () => {
  const { connexion, transaction, p, faux, config } = await parcours('apple', (n) => ({ sub: TRACEUR.sub, nonce: n, email: TRACEUR.email, email_verified: 'true' }));
  const identite = await connexion.retour('apple', p, transaction);
  assert.deepEqual(identite, { fournisseur: 'apple', sub: TRACEUR.sub, emailRecu: true });
  assert.ok(!JSON.stringify(identite).includes(TRACEUR.nom));
  const r = faux.requetes[0];
  assert.equal(r?.url, 'https://appleid.apple.com/auth/token');
  assert.equal(r?.corps.get('code_verifier'), null);
  const secret = r?.corps.get('client_secret') ?? '';
  const [e, c, s] = secret.split('.') as [string, string, string];
  assert.deepEqual(JSON.parse(deB64url(e).toString()), { kid: 'KEY1234567', alg: 'ES256' });
  const contenu = JSON.parse(deB64url(c).toString());
  assert.equal(contenu.iss, 'ABCDE12345');
  assert.equal(contenu.sub, 'fr.exemple.test18h.web');
  assert.equal(contenu.aud, 'https://appleid.apple.com');
  assert.equal(contenu.exp - contenu.iat, 300);
  const publique = createPublicKey(config.apple?.clePrivee ?? '');
  assert.ok(verify('sha256', Buffer.from(`${e}.${c}`), { key: publique, dsaEncoding: 'ieee-p1363' }, deB64url(s)));
});

test('sans adresse e-mail dans la réponse : « reçue : non »', async () => {
  const { connexion, transaction, p } = await parcours('google', (n) => ({ sub: TRACEUR.sub, nonce: n }));
  assert.equal((await connexion.retour('google', p, transaction)).emailRecu, false);
});

test('refus : state différent, nonce différent, transaction absente ou expirée, refus de l’utilisateur', async () => {
  const etat = await parcours('google', (n) => ({ sub: TRACEUR.sub, nonce: n }), (p) => p.set('state', 'autre'));
  await assert.rejects(etat.connexion.retour('google', etat.p, etat.transaction), (e) => e instanceof RefusConnexion && e.raison === 'etat different');

  const nonce = await parcours('google', () => ({ sub: TRACEUR.sub, nonce: 'pas-le-bon' }));
  await assert.rejects(nonce.connexion.retour('google', nonce.p, nonce.transaction), (e) => e instanceof RefusConnexion && e.raison === 'jeton refuse');

  const absente = await parcours('apple', (n) => ({ sub: TRACEUR.sub, nonce: n }));
  await assert.rejects(absente.connexion.retour('apple', absente.p, null), (e) => e instanceof RefusConnexion && e.raison === 'etat different');
  await assert.rejects(absente.connexion.retour('apple', absente.p, { ...absente.transaction, f: 'google' }), RefusConnexion);
  await assert.rejects(absente.connexion.retour('apple', absente.p, { ...absente.transaction, e: 0 }), RefusConnexion);

  const refus = await parcours('apple', (n) => ({ sub: TRACEUR.sub, nonce: n }), (p) => { p.delete('code'); p.set('error', 'user_cancelled_authorize'); });
  await assert.rejects(refus.connexion.retour('apple', refus.p, refus.transaction), (e) => e instanceof RefusConnexion && e.raison === 'refus fournisseur');

  const mauvaisEmetteur = await parcours('google', (n) => ({ sub: TRACEUR.sub, nonce: n }), (p) => p.set('iss', 'https://exemple.invalid'));
  await assert.rejects(mauvaisEmetteur.connexion.retour('google', mauvaisEmetteur.p, mauvaisEmetteur.transaction), RefusConnexion);
});
