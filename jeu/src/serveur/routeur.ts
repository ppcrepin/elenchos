// Le routeur typé contre le contrat (`Routes`, jeu/src/contrat.ts). Étape 1, travail D (16 octobre 2026).
//
// Une route servie est un couple : `lire` (le corps reçu, vérifié champ par champ : un champ manquant, en trop ou hors
// liste donne `requete_invalide`, CONTRAT.md, 1.7) et `traiter`, dont le type n'accepte que les données et les erreurs
// que le contrat donne à CETTE route : un gestionnaire qui rendrait une forme inventée, ou une erreur que la route
// n'a pas, ne compile pas.
//
// Une route du contrat pas encore construite (l'étape 2 : le défi, les cercles, la journée, la révélation…) n'est pas
// dans la table : elle répond `introuvable` (404), comme une adresse inconnue et comme une route `/dev/` en ligne. C'est
// l'erreur que le contrat donne à une « route inconnue » (partie 6), et c'est la vérité pour l'application : le serveur
// ne connaît pas encore cette route. Les autres codes mentiraient : `indisponible` dit qu'un réglage manque (et
// l'application cacherait un bouton, `Etat.voies`, `Etat.message`), `erreur_serveur` dit qu'un défaut est survenu.
// Une branche d'une route construite qui attend l'étape 2 lève `PasEncoreConstruit`, qui répond de même.

import type { CodeErreur, Routes } from '../contrat.ts';
import type { SessionLue } from './sessions.ts';

export type NomRoute = keyof Routes;
export type Resultat<T, E extends CodeErreur> = { readonly donnees: T } | { readonly erreur: E };

export type Contexte = {
  /** L'heure du serveur à l'arrivée de la demande : elle seule juge « avant ou après 18h » (CONTRAT.md, partie 3). */
  readonly maintenant: Date;
  /** La session de l'en-tête `Authorization`, si elle existe et n'est pas échue. */
  readonly session: SessionLue | null;
};

export type Gestionnaire<R extends NomRoute> = (ctx: Contexte, envoi: Routes[R]['envoi'])
  => Promise<Resultat<Routes[R]['recu'], Routes[R]['erreurs']>>;

export type RouteServie<R extends NomRoute> = {
  /** Le corps reçu (null pour un `GET`), vérifié ; `undefined` : `requete_invalide`. */
  lire(corps: Record<string, unknown> | null): Routes[R]['envoi'] | undefined;
  traiter: Gestionnaire<R>;
};

export type TableDesRoutes = { [R in NomRoute]?: RouteServie<R> };

/** Une branche d'une route construite qui attend l'étape 2 : répond `introuvable`, comme une route pas encore construite. */
export class PasEncoreConstruit extends Error {
  override name = 'Error';
  constructor(quoi: string) { super(`pas encore construit : ${quoi}`); }
}

/** Le statut HTTP de chaque erreur (CONTRAT.md, partie 6). Le type exige toutes les erreurs du contrat. */
export const STATUTS: Record<CodeErreur, number> = {
  requete_invalide: 400, non_connecte: 401, origine_refusee: 403, introuvable: 404, mise_a_jour_requise: 426,
  trop_de_demandes: 429, erreur_serveur: 500, indisponible: 503,
  etape_incorrecte: 409, accord_requis: 409, accord_perime: 409, texte_ferme: 409, manche_fermee: 409, pas_encore_revele: 409,
  rien_a_reveler: 409, rien_a_deviner: 409, deja_repondu: 409, deja_validee: 409, carte_inconnue: 409,
  visage_non_propose: 409, visage_deja_pose: 409, pourquoi_sans_visage: 409, cercle_complet: 409, trois_cercles: 409,
  lien_deja_servi: 410, lien_expire: 410, connexion_expiree: 410,
  pseudo_pris: 422, pseudo_invalide: 422, nom_invalide: 422, adresse_invalide: 422, code_faux: 422, code_expire: 422,
  abonnement_invalide: 422,
  trop_essais: 429, trop_de_codes: 429,
};

// --- La lecture des corps ----------------------------------------------------------------------------------------

/** Vrai si le corps a exactement ces champs, ni plus ni moins. */
export function champsExacts(corps: Record<string, unknown> | null, champs: readonly string[]): corps is Record<string, unknown> {
  if (corps === null) return false;
  const cles = Object.keys(corps);
  return cles.length === champs.length && champs.every((c) => Object.prototype.hasOwnProperty.call(corps, c));
}

/** Un `GET` : rien à lire. */
export function rien(): null {
  return null;
}

/** Un texte en base64url d'exactement n caractères (un jeton de 32 octets : 43). */
export function b64urlDe(v: unknown, n: number): v is string {
  return typeof v === 'string' && v.length === n && /^[A-Za-z0-9_-]+$/.test(v);
}
