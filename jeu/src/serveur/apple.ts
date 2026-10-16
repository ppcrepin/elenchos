// La vérification du jeton d'identité que rend la feuille « Se connecter avec Apple » de l'application (CONTRAT.md,
// 2.5 ; DECISIONS-TECHNIQUES 1.14). Étape 1, travail D (16 octobre 2026). Seulement `node:crypto` et `fetch` : aucune
// bibliothèque. Le flux web de test-18h/src/connexion.ts (code d'autorisation, retour par formulaire) ne sert plus pour
// Apple : la feuille native rend directement le jeton signé, que l'application nous transmet.
//
// Ce qui est vérifié, dans cet ordre, et rien n'est cru avant :
// 1. la forme : trois morceaux en base64url, un en-tête et un contenu JSON, 8 Kio au plus ;
// 2. la signature : RS256 seulement (jamais « none », jamais un autre algorithme annoncé par le jeton), avec la clé
//    publique d'Apple que désigne l'en-tête (« kid »). Les clés viennent de https://appleid.apple.com/auth/keys, sont
//    gardées en mémoire, et relues au plus une fois par minute quand un jeton annonce une clé inconnue (Apple en change
//    de temps en temps), et au moins une fois par jour ;
// 3. l'émetteur (https://appleid.apple.com), l'audience (l'identifiant de l'application, réglé par le porteur :
//    APPLE_ID_APPLICATION) et l'échéance (« exp », à l'heure du serveur, sans marge) ;
// 4. la présence d'un nonce et d'un identifiant (« sub »). Le nonce est comparé ensuite, par l'appelant, à celui de la
//    connexion en cours (connexion.ts) : c'est lui qui retrouve la connexion.
// On ne lit que « sub » et « nonce » : ni l'adresse e-mail, ni le nom (D-061 : l'application ne les demande pas).
// Aucune de ces valeurs n'entre dans le journal : un refus y est décrit par une raison d'une liste fermée.

import { createPublicKey, verify, type KeyObject } from 'node:crypto';
import { deB64url } from './crypto.ts';
import type { Horloge } from './horloge.ts';

export const EMETTEUR_APPLE = 'https://appleid.apple.com';
export const ADRESSE_CLES_APPLE = 'https://appleid.apple.com/auth/keys';

/** Une clé inconnue fait relire la liste au plus une fois par minute ; la liste est relue au moins une fois par jour. */
const RELECTURE_MIN_MS = 60_000;
const RELECTURE_MAX_MS = 24 * 3_600_000;
const TAILLE_MAX_JETON = 8192;

export const RAISONS_REFUS_APPLE = [
  'illisible', 'algorithme', 'cle_inconnue', 'signature', 'emetteur', 'audience', 'echu', 'sans_nonce', 'sans_identifiant',
  'cles_injoignables',
] as const;
export type RaisonRefusApple = (typeof RAISONS_REFUS_APPLE)[number];

export class JetonAppleRefuse extends Error {
  override name = 'Error';
  readonly raison: RaisonRefusApple;
  constructor(raison: RaisonRefusApple) {
    super('jeton Apple refusé');
    this.raison = raison;
  }
}

/** Ce qu'on garde d'un jeton vérifié : l'identifiant chez Apple (jamais gardé tel quel : connexion.ts n'en garde que
 *  l'empreinte, avec CLE_IDENTITES) et le nonce, qui retrouve la connexion en cours. */
export type JetonApple = { readonly sub: string; readonly nonce: string };

export type VerificateurApple = { verifier(jeton: string): Promise<JetonApple> };

export type OptionsVerificateur = {
  /** L'identifiant de l'application (APPLE_ID_APPLICATION) : le jeton doit lui être destiné. */
  audience: string;
  horloge: Horloge;
  /** Remplaçable par les tests (un faux service de clés). */
  fetch?: typeof fetch;
  adresseCles?: string;
};

function json(morceau: string): Record<string, unknown> | null {
  try {
    const v: unknown = JSON.parse(deB64url(morceau).toString('utf8'));
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function creerVerificateurApple(o: OptionsVerificateur): VerificateurApple {
  const fetchImpl = o.fetch ?? fetch;
  const adresse = o.adresseCles ?? ADRESSE_CLES_APPLE;
  let cles = new Map<string, KeyObject>();
  let luesLe = -Infinity;
  let lecture: Promise<void> | null = null;

  async function lireCles(): Promise<void> {
    luesLe = o.horloge.maintenant().getTime();
    const r = await fetchImpl(adresse, { redirect: 'error', signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new JetonAppleRefuse('cles_injoignables');
    const corps = (await r.json()) as { keys?: unknown };
    if (!Array.isArray(corps.keys)) throw new JetonAppleRefuse('cles_injoignables');
    const nouvelles = new Map<string, KeyObject>();
    for (const k of corps.keys as Record<string, unknown>[]) {
      if (!k || k.kty !== 'RSA' || typeof k.kid !== 'string' || typeof k.n !== 'string' || typeof k.e !== 'string') continue;
      if (k.alg !== undefined && k.alg !== 'RS256') continue;
      if (k.use !== undefined && k.use !== 'sig') continue;
      try {
        nouvelles.set(k.kid, createPublicKey({ key: { kty: 'RSA', n: k.n, e: k.e }, format: 'jwk' }));
      } catch { /* une clé illisible est ignorée */ }
    }
    cles = nouvelles;
  }

  /** La clé d'un « kid » : relue si elle est inconnue (une fois par minute au plus) ou si la liste a plus d'un jour. */
  async function cle(kid: string): Promise<KeyObject> {
    const age = o.horloge.maintenant().getTime() - luesLe;
    if ((!cles.has(kid) && age >= RELECTURE_MIN_MS) || age >= RELECTURE_MAX_MS) {
      lecture ??= lireCles().finally(() => { lecture = null; });
      try {
        await lecture;
      } catch (e) {
        if (!cles.has(kid)) throw e instanceof JetonAppleRefuse ? e : new JetonAppleRefuse('cles_injoignables');
      }
    }
    const k = cles.get(kid);
    if (!k) throw new JetonAppleRefuse('cle_inconnue');
    return k;
  }

  return {
    async verifier(jeton: string): Promise<JetonApple> {
      if (typeof jeton !== 'string' || jeton.length > TAILLE_MAX_JETON) throw new JetonAppleRefuse('illisible');
      const morceaux = jeton.split('.');
      if (morceaux.length !== 3 || !morceaux.every((m) => /^[A-Za-z0-9_-]+$/.test(m))) throw new JetonAppleRefuse('illisible');
      const [h, c, s] = morceaux as [string, string, string];
      const entete = json(h);
      const contenu = json(c);
      if (!entete || !contenu) throw new JetonAppleRefuse('illisible');
      if (entete.alg !== 'RS256') throw new JetonAppleRefuse('algorithme');
      if (typeof entete.kid !== 'string' || entete.kid.length === 0 || entete.kid.length > 64) throw new JetonAppleRefuse('cle_inconnue');
      const k = await cle(entete.kid);
      if (!verify('RSA-SHA256', Buffer.from(`${h}.${c}`, 'ascii'), k, deB64url(s))) throw new JetonAppleRefuse('signature');

      if (contenu.iss !== EMETTEUR_APPLE) throw new JetonAppleRefuse('emetteur');
      const aud = contenu.aud;
      const audienceJuste = aud === o.audience || (Array.isArray(aud) && aud.length === 1 && aud[0] === o.audience);
      if (!audienceJuste) throw new JetonAppleRefuse('audience');
      if (typeof contenu.exp !== 'number' || !Number.isFinite(contenu.exp) || contenu.exp * 1000 <= o.horloge.maintenant().getTime()) {
        throw new JetonAppleRefuse('echu');
      }
      if (typeof contenu.nonce !== 'string' || !/^[A-Za-z0-9_-]{16,128}$/.test(contenu.nonce)) throw new JetonAppleRefuse('sans_nonce');
      if (typeof contenu.sub !== 'string' || !/^[A-Za-z0-9._-]{1,255}$/.test(contenu.sub)) throw new JetonAppleRefuse('sans_identifiant');
      return { sub: contenu.sub, nonce: contenu.nonce };
    },
  };
}
