// Les aides des tests de la connexion Apple : un faux service de clés d'Apple et de faux jetons d'identité, signés par
// des clés RSA tirées pour le test. Rien ne part vers Apple.

import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import { b64url } from '../../src/serveur/crypto.ts';
import { EMETTEUR_APPLE } from '../../src/serveur/apple.ts';

export const AUDIENCE = 'fr.exemple.elenchos';

export type CleDeTest = { kid: string; privee: KeyObject; publique: KeyObject };

export function cleDeTest(kid: string): CleDeTest {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return { kid, privee: privateKey, publique: publicKey };
}

/** Un jeton d'identité comme Apple le rend : RS256, émetteur, audience, échéance, nonce, identifiant. */
export function jetonApple(cle: CleDeTest, contenu: Record<string, unknown>, entete: Record<string, unknown> = {}): string {
  const h = b64url(Buffer.from(JSON.stringify({ alg: 'RS256', kid: cle.kid, ...entete })));
  const c = b64url(Buffer.from(JSON.stringify(contenu)));
  const s = b64url(sign('RSA-SHA256', Buffer.from(`${h}.${c}`), cle.privee));
  return `${h}.${c}.${s}`;
}

export function contenuJuste(maintenant: Date, nonce: string, sub = '001234.traceur7q2abcdef.0042'): Record<string, unknown> {
  const t = Math.floor(maintenant.getTime() / 1000);
  return { iss: EMETTEUR_APPLE, aud: AUDIENCE, iat: t, exp: t + 600, sub, nonce, nonce_supported: true };
}

/** Un faux service de clés : la liste qu'on lui donne, et le nombre de fois qu'on l'a lue. */
export function fauxServiceDeCles(cles: () => CleDeTest[], enPanne = () => false) {
  const etat = { lectures: 0 };
  const faux: typeof fetch = async () => {
    etat.lectures += 1;
    if (enPanne()) return new Response('indisponible', { status: 503 });
    const keys = cles().map((k) => ({ ...k.publique.export({ format: 'jwk' }), kid: k.kid, alg: 'RS256', use: 'sig' }));
    return new Response(JSON.stringify({ keys }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return { fetch: faux, etat };
}
