// JETABLE (test du message de 18h) : la lecture des réglages. Le principe est repris (tout secret par variable
// d'environnement, saisi par le porteur chez Scalingo, jamais dans le dépôt : D-048, P-16).
// Un réglage absent ou illisible n'arrête pas la page : la fonction qui en dépend est coupée, et le nom du
// réglage (jamais sa valeur) est signalé au journal et sur la page de résultats.

import { createPrivateKey, type KeyObject } from 'node:crypto';
import { deB64url } from './crypto.ts';
import { verifierCleVapid, type CleVapid } from './push/envoyeur.ts';

export type Soir = { dateISO: string; numero: number; telephones: number[] };

export type Config = {
  enLigne: boolean;
  port: number;
  adressePublique: string; // origine, sans « / » final
  urlBase: string | null;
  secretSession: Buffer | null;
  codesEssai: string[] | null; // forme normalisée, dans l'ordre T1…T5
  codeAccesPorteur: string | null;
  vapid: CleVapid | null;
  google: { idClient: string; secretClient: string } | null;
  apple: { idService: string; idEquipe: string; idCle: string; clePrivee: KeyObject } | null;
  soirs: Soir[] | null;
  manquants: string[]; // noms des réglages absents ou illisibles
};

export const NOMBRE_TELEPHONES = 5;

/** Un code se tape sans tirets ni espaces, en minuscules ou majuscules. */
export function normaliserCode(code: string): string {
  return code.normalize('NFKC').replace(/[\s-]/g, '').toLowerCase();
}

export function lireSoirs(texte: string): Soir[] | null {
  const soirs: Soir[] = [];
  const morceaux = texte.split(/[;,]/).map((m) => m.trim()).filter((m) => m !== '');
  if (morceaux.length === 0 || morceaux.length > 31) return null;
  for (const m of morceaux) {
    const r = /^(\d{4}-\d{2}-\d{2})=(\d)(?:@([1-5](?:\+[1-5])*))?$/.exec(m);
    if (!r || !r[1] || !r[2]) return null;
    const dateISO = r[1];
    const jour = new Date(dateISO + 'T12:00:00Z');
    if (Number.isNaN(jour.getTime()) || jour.toISOString().slice(0, 10) !== dateISO) return null;
    if (soirs.some((s) => s.dateISO === dateISO)) return null;
    const telephones = r[3] ? [...new Set(r[3].split('+').map(Number))].sort() : [1, 2, 3, 4, 5];
    soirs.push({ dateISO, numero: Number(r[2]), telephones });
  }
  return soirs.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

/** La clé .p8 d'Apple : acceptée telle quelle (PEM, même collée sur une ligne) ou codée en base64. */
export function lireClePriveeApple(texte: string): KeyObject | null {
  let t = texte.trim();
  if (!t.includes('BEGIN')) {
    try {
      const decode = Buffer.from(t, 'base64').toString('utf8');
      if (decode.includes('BEGIN PRIVATE KEY')) t = decode;
    } catch {
      return null;
    }
  }
  const m = /-----BEGIN PRIVATE KEY-----([\sA-Za-z0-9+/=]+)-----END PRIVATE KEY-----/.exec(t);
  const corps = m?.[1]?.replace(/\s+/g, '');
  if (!corps) return null;
  const pem = `-----BEGIN PRIVATE KEY-----\n${corps.replace(/(.{64})/g, '$1\n').replace(/\n$/, '')}\n-----END PRIVATE KEY-----\n`;
  try {
    const cle = createPrivateKey(pem);
    return cle.asymmetricKeyType === 'ec' && cle.asymmetricKeyDetails?.namedCurve === 'prime256v1' ? cle : null;
  } catch {
    return null;
  }
}

export function lireConfig(env: NodeJS.ProcessEnv): Config {
  const manquants: string[] = [];
  const val = (nom: string): string | null => {
    const v = env[nom];
    return v === undefined || v.trim() === '' ? null : v.trim();
  };
  const signaler = (nom: string) => { manquants.push(nom); };

  const enLigne = val('CONTAINER') !== null;
  const port = Number(val('PORT') ?? '8080');

  let adressePublique = val('ADRESSE_PUBLIQUE');
  if (!adressePublique && val('APP') && val('REGION_NAME')) {
    adressePublique = `https://${val('APP')}.${val('REGION_NAME')}.scalingo.io`;
  }
  if (!adressePublique) {
    adressePublique = `http://localhost:${port}`;
    if (enLigne) signaler('ADRESSE_PUBLIQUE');
  }
  adressePublique = adressePublique.replace(/\/+$/, '');
  try {
    const u = new URL(adressePublique);
    if (enLigne && u.protocol !== 'https:') signaler('ADRESSE_PUBLIQUE');
    adressePublique = u.origin;
  } catch {
    signaler('ADRESSE_PUBLIQUE');
  }

  const urlBase = val('SCALINGO_POSTGRESQL_URL') ?? val('DATABASE_URL');
  if (!urlBase) signaler('SCALINGO_POSTGRESQL_URL');

  let secretSession: Buffer | null = null;
  const s = val('SECRET_SESSION');
  try {
    if (s && deB64url(s).length >= 32) secretSession = deB64url(s);
  } catch { /* signalé plus bas */ }
  if (!secretSession) signaler('SECRET_SESSION');

  let codesEssai: string[] | null = null;
  const c = val('CODES_ESSAI');
  if (c) {
    const codes = c.split(';').map(normaliserCode).filter((x) => x !== '');
    const bons = codes.length === NOMBRE_TELEPHONES && new Set(codes).size === NOMBRE_TELEPHONES
      && codes.every((x) => /^[a-z0-9]{12,40}$/.test(x));
    if (bons) codesEssai = codes;
  }
  if (!codesEssai) signaler('CODES_ESSAI');

  let codeAccesPorteur: string | null = null;
  const a = val('CODE_ACCES_PORTEUR');
  if (a && /^[a-z0-9]{16,64}$/.test(normaliserCode(a))) codeAccesPorteur = normaliserCode(a);
  if (!codeAccesPorteur) signaler('CODE_ACCES_PORTEUR');

  let vapid: CleVapid | null = null;
  const vPub = val('VAPID_CLE_PUBLIQUE');
  const vPriv = val('VAPID_CLE_PRIVEE');
  if (vPub && vPriv && verifierCleVapid(vPub, vPriv)) {
    vapid = { publique: vPub, privee: vPriv, contact: adressePublique.startsWith('https:') ? adressePublique : 'https://localhost' };
  } else {
    if (!vPub || (vPriv && !verifierCleVapid(vPub, vPriv))) signaler('VAPID_CLE_PUBLIQUE');
    if (!vPriv) signaler('VAPID_CLE_PRIVEE');
  }

  let google: Config['google'] = null;
  const gId = val('GOOGLE_ID_CLIENT');
  const gSecret = val('GOOGLE_SECRET_CLIENT');
  if (gId && gSecret) google = { idClient: gId, secretClient: gSecret };
  else {
    if (!gId) signaler('GOOGLE_ID_CLIENT');
    if (!gSecret) signaler('GOOGLE_SECRET_CLIENT');
  }

  let apple: Config['apple'] = null;
  const aService = val('APPLE_ID_SERVICE');
  const aEquipe = val('APPLE_ID_EQUIPE');
  const aCle = val('APPLE_ID_CLE');
  const aPrivee = val('APPLE_CLE_PRIVEE');
  const clePrivee = aPrivee ? lireClePriveeApple(aPrivee) : null;
  if (aService && aEquipe && /^[A-Z0-9]{10}$/.test(aEquipe) && aCle && /^[A-Z0-9]{10}$/.test(aCle) && clePrivee) {
    apple = { idService: aService, idEquipe: aEquipe, idCle: aCle, clePrivee };
  } else {
    if (!aService) signaler('APPLE_ID_SERVICE');
    if (!aEquipe || !/^[A-Z0-9]{10}$/.test(aEquipe)) signaler('APPLE_ID_EQUIPE');
    if (!aCle || !/^[A-Z0-9]{10}$/.test(aCle)) signaler('APPLE_ID_CLE');
    if (!clePrivee) signaler('APPLE_CLE_PRIVEE');
  }

  const soirsTexte = val('SOIRS');
  const soirs = soirsTexte ? lireSoirs(soirsTexte) : null;
  if (!soirs) signaler('SOIRS');

  return {
    enLigne, port, adressePublique, urlBase, secretSession, codesEssai, codeAccesPorteur, vapid, google, apple, soirs,
    manquants: [...new Set(manquants)],
  };
}
