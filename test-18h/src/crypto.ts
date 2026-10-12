// REPRIS pour le vrai jeu (proposé) : petites briques de chiffrement, toutes tirées de node:crypto (aucune bibliothèque).

import {
  createCipheriv, createDecipheriv, createHmac, createPrivateKey, createPublicKey, hkdfSync, randomBytes, sign,
  timingSafeEqual, type KeyObject,
} from 'node:crypto';

export function b64url(b: Buffer | Uint8Array): string {
  return Buffer.from(b).toString('base64url');
}

export function deB64url(s: string): Buffer {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('base64url illisible');
  return Buffer.from(s, 'base64url');
}

/** Une clé dérivée du secret de session, propre à un usage (cookie, empreinte, comparaison). */
export function deriverCle(secret: Buffer, usage: string): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), Buffer.from('elenchos-test-18h:' + usage), 32));
}

export function hmacHex(cle: Buffer, texte: string): string {
  return createHmac('sha256', cle).update(texte, 'utf8').digest('hex');
}

/** Comparaison à temps constant de deux textes (on compare leurs empreintes, de même longueur). */
export function egalAtempsConstant(cle: Buffer, a: string, b: string): boolean {
  const ha = createHmac('sha256', cle).update(a).digest();
  const hb = createHmac('sha256', cle).update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Scelle un petit objet dans un cookie : chiffré et authentifié (AES-256-GCM). */
export function sceller(objet: unknown, cle: Buffer): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', cle, iv);
  const corps = Buffer.concat([c.update(JSON.stringify(objet), 'utf8'), c.final()]);
  return b64url(Buffer.concat([iv, c.getAuthTag(), corps]));
}

export function ouvrir(texte: string | undefined, cle: Buffer): unknown {
  if (!texte || texte.length > 4096) return null;
  try {
    const brut = deB64url(texte);
    if (brut.length < 29) return null;
    const d = createDecipheriv('aes-256-gcm', cle, brut.subarray(0, 12));
    d.setAuthTag(brut.subarray(12, 28));
    const clair = Buffer.concat([d.update(brut.subarray(28)), d.final()]).toString('utf8');
    return JSON.parse(clair);
  } catch {
    return null;
  }
}

/** Clé privée P-256 à partir de sa forme web (« d », 32 octets) et de la clé publique (65 octets, forme non compressée). */
export function clePriveeP256(priveeB64: string, publiqueB64: string): KeyObject {
  const pub = deB64url(publiqueB64);
  const d = deB64url(priveeB64);
  if (pub.length !== 65 || pub[0] !== 4 || d.length !== 32) throw new Error('clé P-256 illisible');
  return createPrivateKey({
    key: { kty: 'EC', crv: 'P-256', d: b64url(d), x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)) },
    format: 'jwk',
  });
}

export function clePubliqueP256(publiqueB64: string): KeyObject {
  const pub = deB64url(publiqueB64);
  if (pub.length !== 65 || pub[0] !== 4) throw new Error('clé P-256 illisible');
  return createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: b64url(pub.subarray(1, 33)), y: b64url(pub.subarray(33, 65)) },
    format: 'jwk',
  });
}

/** Un jeton JWT signé ES256 (VAPID pour l'envoi des messages ; secret client pour Apple). */
export function jwtES256(entete: Record<string, unknown>, contenu: Record<string, unknown>, cle: KeyObject): string {
  const morceaux = `${b64url(Buffer.from(JSON.stringify({ ...entete, alg: 'ES256' })))}.${b64url(Buffer.from(JSON.stringify(contenu)))}`;
  const signature = sign('sha256', Buffer.from(morceaux), { key: cle, dsaEncoding: 'ieee-p1363' });
  return `${morceaux}.${b64url(signature)}`;
}
