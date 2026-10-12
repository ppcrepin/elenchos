// REPRIS pour le vrai jeu (proposé) : les outils de test (traceur, faux téléphone, faux service).
// Aides des tests : réglages inventés, faux téléphone, faux service d'acheminement, journal capturé, base d'essai.
// Toutes les valeurs « traceur » sont uniques et reconnaissables (outil « traceur » de docs/etape-6/donnees.md) ;
// les adresses e-mail sont au domaine réservé exemple.invalid (P-17).

import { createDecipheriv, createECDH, generateKeyPairSync, hkdfSync, randomBytes, randomUUID } from 'node:crypto';
import { creerPool, preparerSchema } from '../../src/base.ts';
import { lireConfig, type Config } from '../../src/config.ts';
import { b64url, deB64url } from '../../src/crypto.ts';
import { creerJournal, type Journal } from '../../src/journal.ts';

export const TRACEUR = {
  email: 'traceur-7q2@exemple.invalid',
  sub: 'traceur-sub-7Q2',
  nom: 'Traceur-nom-7Q2',
  endpointChemin: 'traceur-endpoint-7Q2',
  code: 'traceurcode7q2x',
};

export const CODES = ['aaaa-bbbb-cccc', 'dddd-eeee-ffff', 'gggg-hhhh-jjjj', 'kkkk-mmmm-nnnn', 'pppp-qqqq-rrrr'];
export const CODE_ACCES = 'acces-porteur-2345-6789';
export const ORIGINE = 'https://elenchos-test-18h.osc-fr1.scalingo.io';

export function paireVapid(): { publique: string; privee: string } {
  const e = createECDH('prime256v1');
  e.generateKeys();
  return { publique: b64url(e.getPublicKey()), privee: b64url(e.getPrivateKey()) };
}

export function clePriveeAppleEnPem(): string {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
}

export function envDeTest(complements: Record<string, string> = {}): NodeJS.ProcessEnv {
  const v = paireVapid();
  return {
    ADRESSE_PUBLIQUE: ORIGINE,
    SCALINGO_POSTGRESQL_URL: 'postgresql://inutile@127.0.0.1:1/inutile',
    SECRET_SESSION: b64url(randomBytes(32)),
    CODES_ESSAI: CODES.join(';'),
    CODE_ACCES_PORTEUR: CODE_ACCES,
    VAPID_CLE_PUBLIQUE: v.publique,
    VAPID_CLE_PRIVEE: v.privee,
    GOOGLE_ID_CLIENT: 'client-google-de-test.apps.googleusercontent.com',
    GOOGLE_SECRET_CLIENT: 'secret-google-de-test',
    APPLE_ID_SERVICE: 'fr.exemple.test18h.web',
    APPLE_ID_EQUIPE: 'ABCDE12345',
    APPLE_ID_CLE: 'KEY1234567',
    APPLE_CLE_PRIVEE: Buffer.from(clePriveeAppleEnPem()).toString('base64'),
    SOIRS: '2026-10-16=0@1;2026-10-17=0;2026-10-18=1;2026-10-19=2;2026-10-20=3;2026-10-25=4@2',
    ...complements,
  };
}

export function configDeTest(complements: Record<string, string> = {}): Config {
  const c = lireConfig(envDeTest(complements));
  if (c.manquants.length > 0) throw new Error('config de test incomplète : ' + c.manquants.join(', '));
  return c;
}

/** Un faux téléphone : sa paire de clés et son secret, comme un vrai navigateur les crée à l'abonnement. */
export function fauxTelephone(hote = 'web.push.apple.com') {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  const auth = randomBytes(16);
  return {
    ecdh,
    auth,
    abonnement: {
      endpoint: `https://${hote}/${TRACEUR.endpointChemin}-${randomUUID()}`,
      keys: { p256dh: b64url(ecdh.getPublicKey()), auth: b64url(auth) },
    },
  };
}

/** Déchiffrement côté téléphone (RFC 8291) : pour vérifier ce que reçoit vraiment le téléphone. */
export function dechiffrer(corps: Buffer, tel: { ecdh: ReturnType<typeof createECDH>; auth: Buffer }): string {
  const sel = corps.subarray(0, 16);
  const longueurCle = corps.readUInt8(20);
  const cleServeur = corps.subarray(21, 21 + longueurCle);
  const chiffre = corps.subarray(21 + longueurCle);
  const secret = tel.ecdh.computeSecret(cleServeur);
  const info = Buffer.concat([Buffer.from('WebPush: info\0', 'latin1'), tel.ecdh.getPublicKey(), cleServeur]);
  const ikm = Buffer.from(hkdfSync('sha256', secret, tel.auth, info, 32));
  const cek = Buffer.from(hkdfSync('sha256', ikm, sel, Buffer.from('Content-Encoding: aes128gcm\0', 'latin1'), 16));
  const nonce = Buffer.from(hkdfSync('sha256', ikm, sel, Buffer.from('Content-Encoding: nonce\0', 'latin1'), 12));
  const d = createDecipheriv('aes-128-gcm', cek, nonce);
  d.setAuthTag(chiffre.subarray(chiffre.length - 16));
  const clair = Buffer.concat([d.update(chiffre.subarray(0, chiffre.length - 16)), d.final()]);
  let fin = clair.length - 1;
  while (fin >= 0 && clair[fin] === 0) fin -= 1;
  if (clair[fin] !== 2) throw new Error('délimiteur absent');
  return clair.subarray(0, fin).toString('utf8');
}

export type DemandeRecue = { url: string; entetes: Record<string, string>; corps: Buffer };

/** Un faux service d'acheminement : note chaque demande, répond par le code voulu. */
export function fauxService(reponse: (url: string) => { statut: number; json?: unknown } = () => ({ statut: 201 })) {
  const demandes: DemandeRecue[] = [];
  const faux = (async (entree: string | URL | Request, init?: RequestInit) => {
    const url = String(entree);
    const entetes: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => { entetes[k] = v; });
    const corps = Buffer.from(init?.body as Uint8Array);
    demandes.push({ url, entetes, corps });
    const r = reponse(url);
    return new Response(r.json === undefined ? null : JSON.stringify(r.json), { status: r.statut });
  }) as typeof fetch;
  return { fetch: faux, demandes };
}

export function journalCapture(): { journal: Journal; lignes: string[] } {
  const lignes: string[] = [];
  return { journal: creerJournal((t) => { lignes.push(t); }), lignes };
}

/** Une base PostgreSQL d'essai, dans un schéma neuf, détruit à la fin. Exige BASE_DE_TEST_URL. */
export async function baseDeTest() {
  const url = process.env.BASE_DE_TEST_URL;
  if (!url) {
    throw new Error('BASE_DE_TEST_URL manque : ces tests exigent un vrai PostgreSQL (voir LISEZMOI.md). Ils ne sont jamais sautés.');
  }
  const schema = 't18h_' + randomBytes(6).toString('hex');
  const admin = creerPool(url);
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = creerPool(url, { schema });
  await preparerSchema(pool);
  return {
    pool,
    url,
    schema,
    autrePool: () => creerPool(url, { schema }),
    async fin() {
      await pool.end();
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      await admin.end();
    },
  };
}

export { b64url, deB64url };
