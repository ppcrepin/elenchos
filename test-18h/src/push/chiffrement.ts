// REPRIS pour le vrai jeu (proposé) : le chiffrement du message pour un seul téléphone (P-06).
// Norme : RFC 8291 (chiffrement des messages web), sur RFC 8188 (codage « aes128gcm »).
// Vérifié par l'exemple chiffré de la RFC 8291 (annexe A), rejoué octet pour octet par les tests.
// Apple et Google acheminent le message sans pouvoir le lire.

import { createCipheriv, createECDH, hkdfSync, randomBytes } from 'node:crypto';
import { deB64url } from '../crypto.ts';

export type ClesAbonnement = { p256dh: string; auth: string };

/** Pour les tests seulement : imposer la clé éphémère et le sel de l'exemple de la RFC. */
export type ReglagesDeTest = { clePriveeServeur?: Buffer; sel?: Buffer };

const TAILLE_ENREGISTREMENT = 4096;
export const TAILLE_MAX_CONTENU = 3993; // 4096 - 86 (en-tête) - 16 (étiquette) - 1 (délimiteur)

export function chiffrerMessage(contenu: Buffer, cles: ClesAbonnement, test: ReglagesDeTest = {}): Buffer {
  if (!cles || typeof cles.p256dh !== 'string' || typeof cles.auth !== 'string') {
    throw new Error('envoi refusé : pas de clés de chiffrement (P-06)');
  }
  const clePubliqueTelephone = deB64url(cles.p256dh);
  const secretAuth = deB64url(cles.auth);
  if (clePubliqueTelephone.length !== 65 || clePubliqueTelephone[0] !== 4 || secretAuth.length !== 16) {
    throw new Error('envoi refusé : clés de chiffrement illisibles (P-06)');
  }
  if (contenu.length > TAILLE_MAX_CONTENU) throw new Error('message trop long');

  const ecdh = createECDH('prime256v1');
  if (test.clePriveeServeur) ecdh.setPrivateKey(test.clePriveeServeur);
  else ecdh.generateKeys();
  const clePubliqueServeur = ecdh.getPublicKey();
  const secretPartage = ecdh.computeSecret(clePubliqueTelephone);
  const sel = test.sel ?? randomBytes(16);

  // RFC 8291, partie 3.4 : « WebPush: info » || 0x00 || clé du téléphone || clé du serveur.
  const infoCle = Buffer.concat([Buffer.from('WebPush: info\0', 'latin1'), clePubliqueTelephone, clePubliqueServeur]);
  const ikm = Buffer.from(hkdfSync('sha256', secretPartage, secretAuth, infoCle, 32));
  // RFC 8188, partie 2.2 et 2.3.
  const cek = Buffer.from(hkdfSync('sha256', ikm, sel, Buffer.from('Content-Encoding: aes128gcm\0', 'latin1'), 16));
  const nonce = Buffer.from(hkdfSync('sha256', ikm, sel, Buffer.from('Content-Encoding: nonce\0', 'latin1'), 12));

  // Un seul enregistrement : le contenu, puis le délimiteur 0x02 (dernier enregistrement), sans remplissage.
  const clair = Buffer.concat([contenu, Buffer.from([2])]);
  const chiffreur = createCipheriv('aes-128-gcm', cek, nonce);
  const chiffre = Buffer.concat([chiffreur.update(clair), chiffreur.final(), chiffreur.getAuthTag()]);

  const entete = Buffer.alloc(16 + 4 + 1);
  sel.copy(entete, 0);
  entete.writeUInt32BE(TAILLE_ENREGISTREMENT, 16);
  entete.writeUInt8(clePubliqueServeur.length, 20);
  return Buffer.concat([entete, clePubliqueServeur, chiffre]);
}
