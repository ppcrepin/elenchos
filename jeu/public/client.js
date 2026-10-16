// @ts-check
// Elenchos, étape 1 (coquille). Les échanges avec le serveur (CONTRAT.md 1.7 ; DECISIONS-TECHNIQUES.md 1.3).
//
// - L'adresse du serveur est fixée à la fabrication : la balise `elenchos-serveur` de index.html, remplie par
//   `ios/App/fixer-adresse.sh` à partir du réglage ELENCHOS_SERVEUR. La règle de chargement de la page (CSP) ne permet
//   les échanges qu'avec cette adresse.
// - Trois en-têtes : `Authorization: Bearer {jeton}` s'il y a une session, `Elenchos-Fabrication`, `Content-Type` sur
//   un POST. Jamais de cookie, jamais rien dans l'adresse (P-08).
// - Toute réponse est une enveloppe `Reponse<T>` ; le client retient la plus récente `fabricationMinimale`.
// - Un jeton refusé (`non_connecte`) est effacé du trousseau (CONTRAT.md, partie 6).

import * as natif from './natif.js';

/** @typedef {import('../src/contrat.ts').Routes} Routes */
/** @typedef {import('../src/contrat.ts').CodeErreur} CodeErreur */
/**
 * @template T
 * @typedef {import('../src/contrat.ts').Reponse<T>} Reponse
 */
/**
 * Le résultat d'un échange : `joint` faux si rien n'est revenu (pas de réseau, serveur muet, réponse illisible).
 * @template T
 * @typedef {{ joint: false } | { joint: true, reponse: Reponse<T> }} Resultat
 */

const DELAI_MS = 15000;

/** @type {{ serveur: string, fabrication: number, jeton: string | null, fabricationMinimale: number | null }} */
const etat = { serveur: '', fabrication: 0, jeton: null, fabricationMinimale: null };

/**
 * L'adresse du serveur écrite dans la page à la fabrication, ou null si elle manque (marque non remplacée).
 * @returns {string | null}
 */
export function adresseServeur() {
  const balise = document.querySelector('meta[name="elenchos-serveur"]');
  const adresse = balise ? balise.getAttribute('content') ?? '' : '';
  return /^(https:\/\/[a-z0-9.-]+|http:\/\/localhost:[0-9]{2,5})$/.test(adresse) ? adresse : null;
}

/** @param {{ serveur: string, fabrication: number, jeton: string | null }} reglages */
export function configurer(reglages) {
  etat.serveur = reglages.serveur;
  etat.fabrication = reglages.fabrication;
  etat.jeton = reglages.jeton;
}

/** Range un nouveau jeton (connexion réussie) : dans le trousseau d'abord, puis pour les échanges suivants. @param {string} jeton */
export async function changerJeton(jeton) {
  await natif.ecrireJeton(jeton);
  etat.jeton = jeton;
}

/** La plus récente `fabricationMinimale` reçue, ou null avant le premier échange. */
export function fabricationMinimale() {
  return etat.fabricationMinimale;
}

/** @param {unknown} v @returns {v is Reponse<unknown>} */
function estEnveloppe(v) {
  if (v === null || typeof v !== 'object') return false;
  const e = /** @type {Record<string, unknown>} */ (v);
  return typeof e.ok === 'boolean' && typeof e.fabricationMinimale === 'number' && typeof e.horloge === 'object'
    && (e.ok ? 'donnees' in e : typeof e.erreur === 'string');
}

/**
 * Un échange du contrat. Exemple : `appeler('POST /api/abonnement', { jeton })`.
 * @template {keyof Routes} R
 * @param {R} route
 * @param {Routes[R]['envoi']} envoi `null` pour un GET
 * @returns {Promise<Resultat<Routes[R]['recu']>>}
 */
export async function appeler(route, envoi) {
  const [methode, chemin] = route.split(' ');
  if (!etat.serveur || (methode !== 'GET' && methode !== 'POST') || !chemin) return { joint: false };

  /** @type {Record<string, string>} */
  const entetes = { 'Elenchos-Fabrication': String(etat.fabrication) };
  const jetonEnvoye = etat.jeton;
  if (jetonEnvoye) entetes.Authorization = `Bearer ${jetonEnvoye}`;
  if (methode === 'POST') entetes['Content-Type'] = 'application/json';

  const arret = new AbortController();
  const minuterie = setTimeout(() => arret.abort(), DELAI_MS);
  /** @type {unknown} */
  let corps;
  try {
    const reponse = await fetch(etat.serveur + chemin, {
      method: methode,
      headers: entetes,
      body: methode === 'POST' ? JSON.stringify(envoi ?? {}) : undefined,
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal: arret.signal,
    });
    corps = await reponse.json();
  } catch {
    return { joint: false };
  } finally {
    clearTimeout(minuterie);
  }
  if (!estEnveloppe(corps)) return { joint: false };

  etat.fabricationMinimale = corps.fabricationMinimale;
  if (!corps.ok && corps.erreur === 'non_connecte' && jetonEnvoye !== null && etat.jeton === jetonEnvoye) {
    etat.jeton = null;
    await natif.effacerJeton().catch(() => {});
  }
  return { joint: true, reponse: /** @type {Reponse<Routes[R]['recu']>} */ (corps) };
}
