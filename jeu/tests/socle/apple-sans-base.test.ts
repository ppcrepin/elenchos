// La vérification du jeton d'identité d'Apple (src/serveur/apple.ts ; CONTRAT.md, 2.5), contre un faux service de clés :
// un jeton juste passe ; une signature fausse, un algorithme autre que RS256, un émetteur ou une audience faux, un
// jeton échu, sans nonce ou illisible sont refusés ; une clé inconnue fait relire la liste, au plus une fois par minute.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { creerVerificateurApple, JetonAppleRefuse, type RaisonRefusApple } from '../../src/serveur/apple.ts';
import { b64url } from '../../src/serveur/crypto.ts';
import { horlogeReglable } from '../../src/serveur/horloge.ts';
import { AUDIENCE, cleDeTest, contenuJuste, fauxServiceDeCles, jetonApple } from './aides-apple.ts';

const MAINTENANT = new Date('2026-10-20T15:00:00Z');
const NONCE = b64url(Buffer.alloc(32, 7));
const K1 = cleDeTest('cle-apple-1');
const K2 = cleDeTest('cle-apple-2');
const INTRUSE = { ...cleDeTest('cle-apple-1') }; // même « kid », autre clé : une signature fausse

function monter(cles = () => [K1]) {
  const horloge = horlogeReglable(MAINTENANT);
  const service = fauxServiceDeCles(cles);
  const v = creerVerificateurApple({ audience: AUDIENCE, horloge, fetch: service.fetch });
  return { horloge, service, v };
}

async function refus(promesse: Promise<unknown>, raison: RaisonRefusApple): Promise<void> {
  await assert.rejects(promesse, (e: unknown) => e instanceof JetonAppleRefuse && e.raison === raison, raison);
}

test('un jeton juste rend l’identifiant et le nonce, rien d’autre', async () => {
  const { v, service } = monter();
  const r = await v.verifier(jetonApple(K1, { ...contenuJuste(MAINTENANT, NONCE), email: 'traceur-7q2@exemple.invalid' }));
  assert.deepEqual(r, { sub: '001234.traceur7q2abcdef.0042', nonce: NONCE });
  assert.equal(service.etat.lectures, 1);
  // La liste est gardée en mémoire : un second jeton ne la relit pas.
  await v.verifier(jetonApple(K1, contenuJuste(MAINTENANT, NONCE)));
  assert.equal(service.etat.lectures, 1);
});

test('signature fausse, algorithme autre que RS256 : refusés', async () => {
  const { v } = monter();
  await refus(v.verifier(jetonApple(INTRUSE, contenuJuste(MAINTENANT, NONCE))), 'signature');
  // Le contenu changé après la signature.
  const [h, , s] = jetonApple(K1, contenuJuste(MAINTENANT, NONCE)).split('.');
  const autre = b64url(Buffer.from(JSON.stringify(contenuJuste(MAINTENANT, NONCE, 'autre-sub'))));
  await refus(v.verifier(`${h}.${autre}.${s}`), 'signature');
  await refus(v.verifier(jetonApple(K1, contenuJuste(MAINTENANT, NONCE), { alg: 'none' })), 'algorithme');
  await refus(v.verifier(jetonApple(K1, contenuJuste(MAINTENANT, NONCE), { alg: 'HS256' })), 'algorithme');
});

test('émetteur faux, audience fausse, jeton échu, sans nonce, sans identifiant : refusés', async () => {
  const { v } = monter();
  const juste = contenuJuste(MAINTENANT, NONCE);
  await refus(v.verifier(jetonApple(K1, { ...juste, iss: 'https://accounts.google.com' })), 'emetteur');
  await refus(v.verifier(jetonApple(K1, { ...juste, aud: 'fr.exemple.autre-application' })), 'audience');
  await refus(v.verifier(jetonApple(K1, { ...juste, aud: [AUDIENCE, 'autre'] })), 'audience');
  await refus(v.verifier(jetonApple(K1, { ...juste, exp: Math.floor(MAINTENANT.getTime() / 1000) })), 'echu');
  await refus(v.verifier(jetonApple(K1, { ...juste, exp: Math.floor(MAINTENANT.getTime() / 1000) - 3600 })), 'echu');
  const { nonce: _n, ...sansNonce } = juste;
  await refus(v.verifier(jetonApple(K1, sansNonce)), 'sans_nonce');
  const { sub: _s, ...sansSub } = juste;
  await refus(v.verifier(jetonApple(K1, sansSub)), 'sans_identifiant');
});

test('un jeton illisible est refusé avant toute lecture des clés', async () => {
  const { v, service } = monter();
  for (const j of ['', 'a.b', 'a.b.c.d', 'é.b.c', 'x'.repeat(9000), `${b64url(Buffer.from('[1]'))}.e30.c2ln`]) {
    await refus(v.verifier(j), 'illisible');
  }
  assert.equal(service.etat.lectures, 0);
});

test('une clé inconnue fait relire la liste, au plus une fois par minute (Apple change de clés)', async () => {
  let cles = [K1];
  const { v, service, horloge } = monter(() => cles);
  await v.verifier(jetonApple(K1, contenuJuste(MAINTENANT, NONCE)));
  cles = [K1, K2];
  // Moins d'une minute après la dernière lecture : pas de relecture, la clé reste inconnue.
  await refus(v.verifier(jetonApple(K2, contenuJuste(MAINTENANT, NONCE))), 'cle_inconnue');
  assert.equal(service.etat.lectures, 1);
  horloge.avancer(61_000);
  const r = await v.verifier(jetonApple(K2, contenuJuste(horloge.maintenant(), NONCE)));
  assert.equal(r.nonce, NONCE);
  assert.equal(service.etat.lectures, 2);
});

test('le service de clés d’Apple injoignable : refusé, sans planter', async () => {
  const horloge = horlogeReglable(MAINTENANT);
  const service = fauxServiceDeCles(() => [K1], () => true);
  const v = creerVerificateurApple({ audience: AUDIENCE, horloge, fetch: service.fetch });
  await refus(v.verifier(jetonApple(K1, contenuJuste(MAINTENANT, NONCE))), 'cles_injoignables');
});
