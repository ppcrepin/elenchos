// REPRIS pour le vrai jeu (proposé) : la connexion Google et Apple, écrite dans notre programme (D-035, D-048),
// avec la bibliothèque oauth4webapi (certifiée OpenID, sans dépendance).
// - Flux « code d'autorisation », avec `state` et `nonce` ; PKCE chez Google, qui l'annonce ; pas chez Apple,
//   qui ne l'annonce pas (sa connexion web ne le documente pas).
// - Retour par formulaire (« form_post ») chez les deux : le code n'apparaît jamais dans une adresse (P-08).
//   Chez Apple, c'est obligatoire dès qu'on demande l'adresse e-mail.
// - On ne demande que l'identifiant et l'adresse e-mail (D-035, P-03) : jamais le nom ni la photo.
// - On ne garde que l'empreinte de l'identifiant et « adresse reçue : oui ou non » ; l'adresse est lue puis jetée.
// - Rien d'Apple ni de Google n'est chargé dans la page (P-10) : les boutons sont des liens vers notre serveur,
//   qui renvoie vers Apple ou Google seulement après le toucher.
// - Les jetons d'identité arrivent directement d'Apple ou de Google, sur une connexion chiffrée et vérifiée :
//   OpenID Connect (partie 3.1.3.7) permet alors de ne pas en vérifier la signature ; tout le reste est vérifié
//   (émetteur, destinataire, expiration, nonce).

import * as oauth from 'oauth4webapi';
import { jwtES256 } from './crypto.ts';
import type { Config } from './config.ts';
import type { Horloge } from './horloge.ts';

export type Fournisseur = 'google' | 'apple';

export const SERVEURS: Record<Fournisseur, oauth.AuthorizationServer> = {
  // Valeurs de https://accounts.google.com/.well-known/openid-configuration (lues le 12 octobre 2026).
  google: {
    issuer: 'https://accounts.google.com',
    authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_endpoint: 'https://oauth2.googleapis.com/token',
    jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
  },
  // Valeurs de https://appleid.apple.com/.well-known/openid-configuration (documentation d'Apple ; de mémoire pour
  // le document lui-même, que l'environnement des agents ne peut pas ouvrir).
  apple: {
    issuer: 'https://appleid.apple.com',
    authorization_endpoint: 'https://appleid.apple.com/auth/authorize',
    token_endpoint: 'https://appleid.apple.com/auth/token',
    jwks_uri: 'https://appleid.apple.com/auth/keys',
  },
};

export type Transaction = { f: Fournisseur; s: string; n: string; v: string | null; e: number };

export type Identite = { fournisseur: Fournisseur; sub: string; emailRecu: boolean };

export class RefusConnexion extends Error {
  raison: 'refus fournisseur' | 'etat different' | 'jeton refuse';
  constructor(raison: 'refus fournisseur' | 'etat different' | 'jeton refuse') {
    super(raison);
    this.raison = raison;
  }
}

export type Connexion = {
  disponible(f: Fournisseur): boolean;
  debut(f: Fournisseur): Promise<{ url: string; transaction: Transaction }>;
  retour(f: Fournisseur, parametres: URLSearchParams, transaction: Transaction | null): Promise<Identite>;
};

export function adresseDeRetour(adressePublique: string, f: Fournisseur): string {
  return `${adressePublique}/connexion/${f}/retour`;
}

export function creerConnexion(config: Config, horloge: Horloge, fetchImpl: typeof fetch = fetch): Connexion {
  function client(f: Fournisseur): oauth.Client {
    if (f === 'google' && config.google) return { client_id: config.google.idClient };
    if (f === 'apple' && config.apple) return { client_id: config.apple.idService };
    throw new RefusConnexion('refus fournisseur');
  }

  /** Apple : le « secret client » est un jeton signé par la clé .p8, valable cinq minutes, refait à chaque fois. */
  function authentification(f: Fournisseur): oauth.ClientAuth {
    if (f === 'google' && config.google) return oauth.ClientSecretPost(config.google.secretClient);
    if (f === 'apple' && config.apple) {
      const t = Math.floor(horloge.maintenant().getTime() / 1000);
      const secret = jwtES256(
        { kid: config.apple.idCle },
        { iss: config.apple.idEquipe, iat: t, exp: t + 300, aud: 'https://appleid.apple.com', sub: config.apple.idService },
        config.apple.clePrivee,
      );
      return oauth.ClientSecretPost(secret);
    }
    throw new RefusConnexion('refus fournisseur');
  }

  return {
    disponible: (f) => (f === 'google' ? config.google !== null : config.apple !== null),

    async debut(f) {
      const c = client(f);
      const etat = oauth.generateRandomState();
      const nonce = oauth.generateRandomNonce();
      const verificateur = f === 'google' ? oauth.generateRandomCodeVerifier() : null;
      const url = new URL(SERVEURS[f].authorization_endpoint as string);
      url.searchParams.set('client_id', c.client_id);
      url.searchParams.set('redirect_uri', adresseDeRetour(config.adressePublique, f));
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('response_mode', 'form_post');
      url.searchParams.set('scope', 'openid email');
      url.searchParams.set('state', etat);
      url.searchParams.set('nonce', nonce);
      if (verificateur) {
        url.searchParams.set('code_challenge', await oauth.calculatePKCECodeChallenge(verificateur));
        url.searchParams.set('code_challenge_method', 'S256');
      }
      const e = horloge.maintenant().getTime() + 10 * 60_000;
      return { url: url.toString(), transaction: { f, s: etat, n: nonce, v: verificateur, e } };
    },

    async retour(f, parametres, transaction) {
      if (!transaction || transaction.f !== f || transaction.e < horloge.maintenant().getTime()) {
        throw new RefusConnexion('etat different');
      }
      const as = SERVEURS[f];
      const c = client(f);
      let rappel: URLSearchParams;
      try {
        // On ne lit que ces champs ; celui qu'Apple ajoute la première fois (« user », avec le nom) est ignoré.
        const utiles = new URLSearchParams();
        for (const nom of ['code', 'state', 'error', 'iss']) {
          const v = parametres.get(nom);
          if (v !== null) utiles.set(nom, v);
        }
        rappel = oauth.validateAuthResponse(as, c, utiles, transaction.s);
      } catch (e) {
        throw new RefusConnexion(e instanceof oauth.AuthorizationResponseError ? 'refus fournisseur' : 'etat different');
      }
      try {
        const reponse = await oauth.authorizationCodeGrantRequest(
          as, c, authentification(f), rappel, adresseDeRetour(config.adressePublique, f),
          transaction.v ?? oauth.nopkce,
          { [oauth.customFetch]: fetchImpl, signal: AbortSignal.timeout(15_000) },
        );
        const resultat = await oauth.processAuthorizationCodeResponse(as, c, reponse, {
          expectedNonce: transaction.n,
          requireIdToken: true,
        });
        const revendications = oauth.getValidatedIdTokenClaims(resultat);
        if (!revendications || typeof revendications.sub !== 'string' || revendications.sub === '') {
          throw new RefusConnexion('jeton refuse');
        }
        // L'adresse est lue ici pour savoir si elle a été reçue, puis jetée avec le reste de la réponse.
        const emailRecu = typeof revendications.email === 'string' && revendications.email.includes('@');
        return { fournisseur: f, sub: revendications.sub, emailRecu };
      } catch (e) {
        if (e instanceof RefusConnexion) throw e;
        throw new RefusConnexion('jeton refuse');
      }
    },
  };
}
