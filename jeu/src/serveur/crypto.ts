// Origine : test-18h/src/crypto.ts (REPRIS, 12 octobre 2026), copie adaptée :
// - les clés dérivées portent l'étiquette « elenchos-jeu: » (et non plus « elenchos-test-18h: ») : aucune empreinte
//   du test de 18h ne peut servir dans le jeu ;
// - retirés : les clés P-256 sous forme web (completer32, clePriveeP256, clePubliqueP256), propres au message web,
//   remplacé par le service d'Apple (plan-jeu-entier-equipe.md, 2.2) ;
// - ajoutés : l'empreinte avec clé (P-01, DECISIONS-TECHNIQUES 1.7) et le chiffrement des réponses (P-02) ;
// - ajoutés le 16 octobre 2026 (relecture de l'étape 1, corrections 2 et 9) : le « pourquoi » des cartes, chiffré comme
//   les réponses ; les empreintes d'identité, tirées d'une clé à elles (CLE_IDENTITES) et non plus du secret de session.
// Toutes les briques viennent de node:crypto (aucune bibliothèque).

import {
  createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, sign, timingSafeEqual, type KeyObject,
} from 'node:crypto';

export function b64url(b: Buffer | Uint8Array): string {
  return Buffer.from(b).toString('base64url');
}

export function deB64url(s: string): Buffer {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('base64url illisible');
  return Buffer.from(s, 'base64url');
}

/** Les usages d'une clé dérivée du secret de session (SECRET_SESSION). Une liste fermée : deux usages n'ont jamais la
 *  même clé. Changer ce secret déconnecte tout le monde (les empreintes des jetons changent), sans perdre aucun compte. */
export type Usage = 'session' | 'jeton-invitation' | 'code-email' | 'abonnement' | 'tirage' | 'comparaison';

/** Les usages de la clé des identités (CLE_IDENTITES) : l'identifiant Apple ou Google (« identite »), l'adresse e-mail
 *  (« adresse »). Cette clé ne sert qu'à elles, et ne se change jamais pendant le test : la changer rendrait tous les
 *  comptes introuvables. Le porteur la garde hors ligne, comme CLE_REPONSES (DECISIONS-TECHNIQUES 1.7). */
export type UsageIdentite = 'identite' | 'adresse';

/** Une clé dérivée du secret de session, propre à un usage. */
export function deriverCle(secret: Buffer, usage: Usage): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), Buffer.from('elenchos-jeu:' + usage), 32));
}

/** Une clé dérivée de la clé des identités, propre à un usage. L'étiquette diffère de celles du secret de session :
 *  même si les deux réglages recevaient par erreur la même valeur, aucune clé ne serait partagée. */
export function deriverCleIdentite(cleIdentites: Buffer, usage: UsageIdentite): Buffer {
  return Buffer.from(hkdfSync('sha256', cleIdentites, Buffer.alloc(0), Buffer.from('elenchos-jeu:identites:' + usage), 32));
}

export function hmacHex(cle: Buffer, texte: string): string {
  return createHmac('sha256', cle).update(texte, 'utf8').digest('hex');
}

/** L'empreinte avec clé d'une valeur tirée par le jeu (jeton, code) : 64 chiffres hexadécimaux. La base ne garde
 *  jamais la valeur, seulement cette empreinte (P-01). */
export function empreinte(secret: Buffer, usage: Usage, valeur: string): string {
  return hmacHex(deriverCle(secret, usage), valeur);
}

/** L'empreinte avec clé d'une identité (identifiant Apple ou Google, adresse e-mail), avec la seule clé des identités :
 *  c'est elle qui retrouve un compte. La base ne garde jamais la valeur (P-01). */
export function empreinteIdentite(cleIdentites: Buffer, usage: UsageIdentite, valeur: string): string {
  return hmacHex(deriverCleIdentite(cleIdentites, usage), valeur);
}

/** Un jeton tiré au hasard (session, lien d'invitation) : 32 octets, en base64url. */
export function jetonAuHasard(): string {
  return b64url(randomBytes(32));
}

/** Comparaison à temps constant de deux textes (on compare leurs empreintes, de même longueur). */
export function egalAtempsConstant(cle: Buffer, a: string, b: string): boolean {
  const ha = createHmac('sha256', cle).update(a).digest();
  const hb = createHmac('sha256', cle).update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Scelle un petit objet : chiffré et authentifié (AES-256-GCM). */
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

/** Un jeton JWT signé ES256 : jeton du fournisseur pour le service de messages d'Apple ; secret client d'Apple. */
export function jwtES256(entete: Record<string, unknown>, contenu: Record<string, unknown>, cle: KeyObject): string {
  const morceaux = `${b64url(Buffer.from(JSON.stringify({ ...entete, alg: 'ES256' })))}.${b64url(Buffer.from(JSON.stringify(contenu)))}`;
  const signature = sign('sha256', Buffer.from(morceaux), { key: cle, dsaEncoding: 'ieee-p1363' });
  return `${morceaux}.${b64url(signature)}`;
}

// --- Le chiffrement des réponses (P-02) --------------------------------------------------------------------------
// Une réponse (position et raison) est chiffrée par le programme avant d'entrer dans la base, avec CLE_REPONSES,
// réglée chez Scalingo et gardée hors ligne par le porteur. Forme : 1 octet de version de clé, 12 octets d'IV,
// 16 octets d'étiquette, 2 octets chiffrés. La longueur est fixe : elle ne dit rien de la réponse. Les données
// associées lient le chiffré à sa ligne (joueur et texte) : recopié sur la ligne d'un autre, il ne s'ouvre pas.
//
// Le « pourquoi » d'une carte (le rang de la raison devinée, 1 à 4, sur la carte « qui et pourquoi ») est chiffré de
// la même façon, avec la même clé : avec le verdict « juste et raison », il dirait en clair la raison choisie par
// l'auteur. Forme : 1 octet de version, 12 d'IV, 16 d'étiquette, 1 octet chiffré (30 octets) ; données associées :
// l'identifiant de la carte.

export type Position = 1 | 2 | 3 | 4 | 5;
/** 0 = « aucune » ; 1 à 4 = le rang de la raison choisie. */
export type Raison = 0 | 1 | 2 | 3 | 4;
export type ReponseClaire = { position: Position; raison: Raison };
/** Le rang de la raison devinée sur la carte « qui et pourquoi ». */
export type Pourquoi = 1 | 2 | 3 | 4;

export const VERSION_CLE_REPONSES = 1;
export const LONGUEUR_REPONSE_CHIFFREE = 1 + 12 + 16 + 2;
export const LONGUEUR_POURQUOI_CHIFFRE = 1 + 12 + 16 + 1;

function chiffrerOctets(cle: Buffer, lieu: string, clair: Buffer): Buffer {
  if (cle.length !== 32) throw new Error('clé des réponses illisible');
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', cle, iv);
  c.setAAD(Buffer.from(lieu, 'utf8'));
  const corps = Buffer.concat([c.update(clair), c.final()]);
  return Buffer.concat([Buffer.from([VERSION_CLE_REPONSES]), iv, c.getAuthTag(), corps]);
}

/** Les octets clairs, ou null si le chiffré a été altéré, déplacé sur une autre ligne, ou chiffré sous une autre clé. */
function dechiffrerOctets(cle: Buffer, lieu: string, chiffre: Buffer, longueur: number): Buffer | null {
  if (chiffre.length !== longueur || chiffre[0] !== VERSION_CLE_REPONSES) return null;
  try {
    const d = createDecipheriv('aes-256-gcm', cle, chiffre.subarray(1, 13));
    d.setAAD(Buffer.from(lieu, 'utf8'));
    d.setAuthTag(chiffre.subarray(13, 29));
    return Buffer.concat([d.update(chiffre.subarray(29)), d.final()]);
  } catch {
    return null;
  }
}

const lieuReponse = (joueur: string, texte: string) => `elenchos-jeu:reponse:${joueur}:${texte}`;
const lieuPourquoi = (carte: string) => `elenchos-jeu:pourquoi:${carte}`;

export function chiffrerReponse(cle: Buffer, joueur: string, texte: string, r: ReponseClaire): Buffer {
  if (!Number.isInteger(r.position) || r.position < 1 || r.position > 5) throw new RangeError('position');
  if (!Number.isInteger(r.raison) || r.raison < 0 || r.raison > 4) throw new RangeError('raison');
  return chiffrerOctets(cle, lieuReponse(joueur, texte), Buffer.from([r.position, r.raison]));
}

/** Ouvre une réponse chiffrée ; null si elle a été altérée, déplacée sur une autre ligne, ou chiffrée sous une autre clé. */
export function dechiffrerReponse(cle: Buffer, joueur: string, texte: string, chiffre: Buffer): ReponseClaire | null {
  const clair = dechiffrerOctets(cle, lieuReponse(joueur, texte), chiffre, LONGUEUR_REPONSE_CHIFFREE);
  const position = clair?.[0];
  const raison = clair?.[1];
  if (position === undefined || raison === undefined || position < 1 || position > 5 || raison > 4) return null;
  return { position: position as Position, raison: raison as Raison };
}

export function chiffrerPourquoi(cle: Buffer, carte: string, pourquoi: Pourquoi): Buffer {
  if (!Number.isInteger(pourquoi) || pourquoi < 1 || pourquoi > 4) throw new RangeError('pourquoi');
  return chiffrerOctets(cle, lieuPourquoi(carte), Buffer.from([pourquoi]));
}

/** Ouvre le « pourquoi » d'une carte ; null s'il a été altéré, déplacé sur une autre carte, ou chiffré sous une autre clé. */
export function dechiffrerPourquoi(cle: Buffer, carte: string, chiffre: Buffer): Pourquoi | null {
  const rang = dechiffrerOctets(cle, lieuPourquoi(carte), chiffre, LONGUEUR_POURQUOI_CHIFFRE)?.[0];
  return rang === undefined || rang < 1 || rang > 4 ? null : (rang as Pourquoi);
}
