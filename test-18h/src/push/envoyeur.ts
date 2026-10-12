// REPRIS pour le vrai jeu (proposé) : l'envoi d'un message web, chiffré (P-06), signé (VAPID, RFC 8292),
// en urgence « haute », avec une durée de vie bornée. Aucun service d'envoi intermédiaire (docs/plateforme.md).
// L'adresse de l'abonnement n'est jamais écrite dans un journal (P-07).

import { createECDH } from 'node:crypto';
import { clePriveeP256, deB64url, jwtES256 } from '../crypto.ts';
import type { Horloge } from '../horloge.ts';
import { chiffrerMessage, type ClesAbonnement } from './chiffrement.ts';
import { serviceDe } from './services.ts';

export type Abonnement = { adresse: string } & ClesAbonnement;

export type CleVapid = { publique: string; privee: string; contact: string };

export type ResultatEnvoi = {
  code: number | null; // code HTTP du service d'acheminement ; null si la demande n'a pas abouti
  motif: string | null; // motif renvoyé par le service (« BadJwtToken »…), ou type d'échec réseau
};

export type OptionsEnvoi = { ttl: number; urgence: 'very-low' | 'low' | 'normal' | 'high' };

/** Le message de 18h : urgence haute (passe le mode veille), 30 minutes de vie (au-delà, il est « manqué »). */
export const OPTIONS_18H: OptionsEnvoi = { ttl: 1800, urgence: 'high' };

export type Envoyeur = {
  envoyer(abonnement: Abonnement, contenu: unknown, options: OptionsEnvoi): Promise<ResultatEnvoi>;
};

type Fetch = typeof fetch;

export function creerEnvoyeur(vapid: CleVapid, horloge: Horloge, fetchImpl: Fetch = fetch): Envoyeur {
  const cle = clePriveeP256(vapid.privee, vapid.publique);
  const cache = new Map<string, { jeton: string; cree: number }>();

  // Apple : jeton valable moins d'un jour, et pas renouvelé plus d'une fois par heure (vérifié, Apple).
  function jetonPour(audience: string): string {
    const maintenant = horloge.maintenant().getTime();
    const deja = cache.get(audience);
    if (deja && maintenant - deja.cree < 6 * 3_600_000) return deja.jeton;
    const t = Math.floor(maintenant / 1000);
    const jeton = jwtES256({ typ: 'JWT' }, { aud: audience, exp: t + 12 * 3600, sub: vapid.contact }, cle);
    cache.set(audience, { jeton, cree: maintenant });
    return jeton;
  }

  return {
    async envoyer(abonnement, contenu, options) {
      if (serviceDe(abonnement.adresse) === null) return { code: null, motif: 'ServiceHorsListe' };
      const corps = chiffrerMessage(Buffer.from(JSON.stringify(contenu), 'utf8'), abonnement);
      const audience = new URL(abonnement.adresse).origin;
      let reponse: Response;
      try {
        reponse = await fetchImpl(abonnement.adresse, {
          method: 'POST',
          headers: {
            TTL: String(options.ttl),
            Urgency: options.urgence,
            'Content-Encoding': 'aes128gcm',
            'Content-Type': 'application/octet-stream',
            Authorization: `vapid t=${jetonPour(audience)}, k=${vapid.publique}`,
          },
          body: corps,
          redirect: 'error',
          signal: AbortSignal.timeout(15_000),
        });
      } catch (e) {
        const nom = e && typeof e === 'object' && 'name' in e && typeof e.name === 'string' ? e.name : '';
        return { code: null, motif: nom === 'TimeoutError' ? 'DelaiDepasse' : 'Reseau' };
      }
      let motif: string | null = null;
      if (reponse.status >= 300) {
        try {
          const json = (await reponse.json()) as { reason?: unknown };
          if (typeof json.reason === 'string' && /^[A-Za-z]{1,40}$/.test(json.reason)) motif = json.reason;
        } catch {
          motif = null;
        }
      } else {
        await reponse.body?.cancel();
      }
      return { code: reponse.status, motif };
    },
  };
}

/** Vérifie qu'une paire de clés VAPID se tient : la clé publique est bien celle de la clé privée. */
export function verifierCleVapid(publique: string, privee: string): boolean {
  try {
    const ecdh = createECDH('prime256v1');
    ecdh.setPrivateKey(deB64url(privee));
    return ecdh.getPublicKey().equals(deB64url(publique)) && clePriveeP256(privee, publique) !== null;
  } catch {
    return false;
  }
}
