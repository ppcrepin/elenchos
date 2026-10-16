// L'envoyeur vers le service de messages d'Apple (APNs), en HTTP/2, avec les seuls modules de Node (DECISIONS-TECHNIQUES
// 1.13). Étape 1, travail D (16 octobre 2026). Remplace les trois modules du message web de test-18h/src/push/
// (chiffrement, envoyeur, services) : dans une application, Apple achemine et lit le message lui-même (P-06 ne
// s'applique plus ; P-05 tient : rien de personnel dans le contenu, CONTRAT.md, 2.13).
//
// - Le jeton du fournisseur (ES256, signé par la clé .p8 du porteur, `crypto.jwtES256`) est refait toutes les 40
//   minutes environ : Apple refuse un jeton de plus d'une heure, et un jeton renouvelé plus d'une fois toutes les 20
//   minutes (« TooManyProviderTokenUpdates »).
// - Le service de production par défaut, que les fabrications TestFlight utilisent ; « essai » (sandbox) seulement sur
//   réglage (APPLE_SERVICE_MESSAGES).
// - Le contenu est un `MessageApns` (contrat.ts) : titre, texte, `mutable-content` pour que l'extension signale la
//   réception, le numéro d'envoi tiré au hasard. Priorité 10 (immédiate), durée de vie 30 minutes : au-delà de 18h30,
//   le message serait « manqué » (même borne que le rattrapage du planificateur).
// - Un abonnement qu'Apple déclare inactif (410 : application désinstallée, jeton périmé) est à retirer : l'envoyeur le
//   dit (`retirer`), le planificateur le retire. Un 400 « BadDeviceToken » ne retire rien : il peut venir d'un réglage
//   du service qui ne correspond pas à la fabrication (production contre essai), et retirer alors effacerait tous les
//   abonnements d'un coup.
// - Rien du joueur dans le journal : ni jeton d'appareil, ni contenu. La raison donnée par Apple n'est gardée que si
//   elle est dans la liste fermée de sa documentation ; sinon « autre ».

import http2 from 'node:http2';
import type { KeyObject } from 'node:crypto';
import type { MessageApns } from '../contrat.ts';
import type { ServiceApns } from './config.ts';
import { jwtES256 } from './crypto.ts';
import type { Horloge } from './horloge.ts';

export const ADRESSES_APNS: Record<ServiceApns, string> = {
  production: 'https://api.push.apple.com',
  essai: 'https://api.sandbox.push.apple.com',
};

/** Le jeton du fournisseur est refait au-delà de cet âge (Apple : moins d'une heure, pas plus d'une fois par 20 min). */
export const RENOUVELLEMENT_JETON_MS = 40 * 60_000;
/** La durée de vie d'un message chez Apple : il n'est plus livré après (18h30 pour le message de 18h). */
export const DUREE_DE_VIE_S = 30 * 60;
const DELAI_REQUETE_MS = 15_000;

/** Les raisons de refus documentées par Apple (« Handling notification responses from APNs »). Liste fermée : toute
 *  autre valeur devient « autre » avant d'aller plus loin. */
export const RAISONS_APNS = [
  'BadCollapseId', 'BadDeviceToken', 'BadExpirationDate', 'BadMessageId', 'BadPriority', 'BadTopic',
  'DeviceTokenNotForTopic', 'DuplicateHeaders', 'IdleTimeout', 'InvalidPushType', 'MissingDeviceToken', 'MissingTopic',
  'PayloadEmpty', 'TopicDisallowed', 'BadCertificate', 'BadCertificateEnvironment', 'ExpiredProviderToken', 'Forbidden',
  'InvalidProviderToken', 'MissingProviderToken', 'UnrelatedKeyIdInToken', 'BadEnvironmentKeyInToken', 'BadPath',
  'MethodNotAllowed', 'ExpiredToken', 'Unregistered', 'PayloadTooLarge', 'TooManyProviderTokenUpdates', 'TooManyRequests',
  'InternalServerError', 'ServiceUnavailable', 'Shutdown',
] as const;
export type RaisonApns = (typeof RAISONS_APNS)[number] | 'autre' | 'reseau' | 'delai';

/** `statut` : le code HTTP d'Apple, null si la demande n'a pas abouti. `retirer` : l'abonnement est inactif (410). */
export type ResultatApns = { statut: number | null; raison: RaisonApns | null; retirer: boolean };

export type EnvoyeurApns = {
  envoyer(jetonAppareil: string, message: MessageApns): Promise<ResultatApns>;
  /** Ferme la connexion HTTP/2 (fin d'un lot, arrêt du serveur). */
  fermer(): void;
};

export type OptionsApns = {
  idEquipe: string;
  idCle: string;
  clePrivee: KeyObject;
  /** L'identifiant de l'application (« apns-topic »). */
  idApplication: string;
  service: ServiceApns;
  horloge: Horloge;
  /** Pour les tests seulement : l'adresse d'un faux service HTTP/2 local. */
  adresse?: string;
};

export const JETON_APPAREIL = /^[0-9a-f]{64,200}$/;

function raisonDe(corps: string): RaisonApns {
  try {
    const r = (JSON.parse(corps) as { reason?: unknown }).reason;
    return typeof r === 'string' && (RAISONS_APNS as readonly string[]).includes(r) ? (r as RaisonApns) : 'autre';
  } catch {
    return 'autre';
  }
}

export function creerEnvoyeurApns(o: OptionsApns): EnvoyeurApns {
  const adresse = o.adresse ?? ADRESSES_APNS[o.service];
  let jeton: { valeur: string; cree: number } | null = null;
  let session: http2.ClientHttp2Session | null = null;

  /** Le jeton du fournisseur : en-tête { alg: ES256, kid }, contenu { iss: équipe, iat }. */
  function jetonFournisseur(): string {
    const maintenant = o.horloge.maintenant().getTime();
    if (jeton && maintenant - jeton.cree < RENOUVELLEMENT_JETON_MS && maintenant >= jeton.cree) return jeton.valeur;
    const valeur = jwtES256({ kid: o.idCle }, { iss: o.idEquipe, iat: Math.floor(maintenant / 1000) }, o.clePrivee);
    jeton = { valeur, cree: maintenant };
    return valeur;
  }

  function connexion(): http2.ClientHttp2Session {
    if (session && !session.closed && !session.destroyed) return session;
    const s = http2.connect(adresse);
    s.on('error', () => { /* la demande en cours échoue d'elle-même ; rien à écrire (P-07) */ });
    s.on('goaway', () => { s.close(); });
    s.on('close', () => { if (session === s) session = null; });
    s.setTimeout(60_000, () => { s.close(); });
    session = s;
    return s;
  }

  return {
    envoyer(jetonAppareil, message) {
      if (!JETON_APPAREIL.test(jetonAppareil)) return Promise.resolve({ statut: null, raison: 'BadDeviceToken', retirer: false });
      const corps = JSON.stringify(message);
      const maintenant = o.horloge.maintenant().getTime();
      return new Promise<ResultatApns>((resoudre) => {
        let fini = false;
        const finir = (r: ResultatApns) => { if (!fini) { fini = true; resoudre(r); } };
        let requete: http2.ClientHttp2Stream;
        try {
          requete = connexion().request({
            ':method': 'POST',
            ':path': `/3/device/${jetonAppareil}`,
            authorization: `bearer ${jetonFournisseur()}`,
            'apns-topic': o.idApplication,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'apns-expiration': String(Math.floor(maintenant / 1000) + DUREE_DE_VIE_S),
            'content-type': 'application/json',
          });
        } catch {
          finir({ statut: null, raison: 'reseau', retirer: false });
          return;
        }
        let statut: number | null = null;
        const morceaux: Buffer[] = [];
        requete.setTimeout(DELAI_REQUETE_MS, () => {
          requete.close(http2.constants.NGHTTP2_CANCEL);
          finir({ statut: null, raison: 'delai', retirer: false });
        });
        requete.on('response', (entetes) => {
          const s = entetes[':status'];
          statut = typeof s === 'number' ? s : null;
        });
        requete.on('data', (m: Buffer) => { if (morceaux.length < 16) morceaux.push(m); });
        requete.on('error', () => finir({ statut: null, raison: 'reseau', retirer: false }));
        requete.on('end', () => {
          if (statut === null) { finir({ statut: null, raison: 'reseau', retirer: false }); return; }
          if (statut === 200) { finir({ statut, raison: null, retirer: false }); return; }
          const raison = raisonDe(Buffer.concat(morceaux).toString('utf8'));
          // Un jeton du fournisseur refusé comme échu : il sera refait au prochain envoi.
          if (raison === 'ExpiredProviderToken') jeton = null;
          finir({ statut, raison, retirer: statut === 410 });
        });
        requete.end(corps);
      });
    },
    fermer() {
      session?.close();
      session = null;
    },
  };
}
