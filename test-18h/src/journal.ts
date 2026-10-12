// REPRIS pour le vrai jeu (proposé) : un journal qui ne peut rien écrire de personnel (P-07).
// Chaque ligne n'a que des champs d'une liste fermée, et chaque texte vient d'une liste fermée :
// aucune valeur reçue d'un téléphone, d'Apple ou de Google ne peut y entrer, par construction.
// Jamais : adresse internet, abonnement, identifiant, adresse e-mail, code, contenu d'une demande.

const EVENEMENTS = [
  'demarrage', 'arret', 'schema', 'reglages', 'requete', 'planificateur', 'envoi', 'connexion', 'effacement', 'erreur',
] as const;
export type Evenement = (typeof EVENEMENTS)[number];

/** Les routes, sous forme de modèle. Toute autre adresse s'écrit « (autre) ». */
export const ROUTES = [
  'GET /', 'GET /preparer', 'GET (fichier)', 'GET /api/etat', 'POST /api/code', 'POST /api/abonnement', 'POST /api/recu',
  'GET /connexion/google', 'GET /connexion/apple', 'POST /connexion/google/retour', 'POST /connexion/apple/retour',
  'POST /deconnexion', 'GET /resultats', 'POST /resultats/entree', 'POST /resultats/sortie', 'POST /resultats/essai',
  'POST /resultats/systeme', 'POST /resultats/effacer-ligne', 'POST /resultats/effacer-compte',
  'POST /resultats/tout-effacer', '(autre)',
] as const;
export type Route = (typeof ROUTES)[number];

const DETAILS = [
  'pret', 'reglages incomplets', 'horloge arretee', 'horloge en marche', 'creneau', 'abonnement expire',
  'service refuse', 'envoi interrompu', 'base videe', 'base non vide', 'ligne effacee', 'compte efface',
  'refus code', 'refus telephone', 'trop d essais', 'origine refusee', 'refus fournisseur', 'etat different', 'jeton refuse',
  'reussie', 'pas de base', 'schema pret', 'signal', 'essai',
] as const;
export type Detail = (typeof DETAILS)[number];

export type Ligne = {
  evenement: Evenement;
  route?: Route;
  statut?: number;
  duree_ms?: number;
  requete?: string; // numéro tiré au hasard, propre à la requête
  erreur?: string; // type d'erreur, jamais son message (voir typeErreur)
  detail?: Detail;
  nombre?: number;
  manquants?: string[]; // noms de réglages manquants (des noms de variables, jamais des valeurs)
};

export type Journal = { ecrire(l: Ligne): void };

const NOMS_REGLAGES = /^[A-Z][A-Z0-9_]{0,63}$/;
const NUMERO_REQUETE = /^[0-9a-f]{8}$/;
const TYPE_ERREUR = /^[A-Za-z0-9_:.-]{1,60}$/;

/** Nettoie une ligne : tout ce qui n'est pas dans la liste fermée est retiré ou remplacé. */
export function assainir(l: Ligne): Record<string, unknown> {
  const sortie: Record<string, unknown> = {};
  sortie.evenement = (EVENEMENTS as readonly string[]).includes(l.evenement) ? l.evenement : 'erreur';
  if (l.route !== undefined) sortie.route = (ROUTES as readonly string[]).includes(l.route) ? l.route : '(autre)';
  if (Number.isInteger(l.statut)) sortie.statut = l.statut;
  if (typeof l.duree_ms === 'number' && Number.isFinite(l.duree_ms)) sortie.duree_ms = Math.round(l.duree_ms);
  if (l.requete !== undefined && NUMERO_REQUETE.test(l.requete)) sortie.requete = l.requete;
  if (l.erreur !== undefined) sortie.erreur = TYPE_ERREUR.test(l.erreur) ? l.erreur : 'autre';
  if (l.detail !== undefined && (DETAILS as readonly string[]).includes(l.detail)) sortie.detail = l.detail;
  if (Number.isInteger(l.nombre)) sortie.nombre = l.nombre;
  if (Array.isArray(l.manquants)) sortie.manquants = l.manquants.filter((n) => NOMS_REGLAGES.test(n));
  return sortie;
}

export function creerJournal(sortie: (texte: string) => void = (t) => process.stdout.write(t)): Journal {
  return {
    ecrire(l: Ligne) {
      sortie(JSON.stringify(assainir(l)) + '\n');
    },
  };
}

/** Le type d'une erreur, sans son message : un code d'erreur PostgreSQL, un code de bibliothèque, ou une classe connue. */
export function typeErreur(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as { code?: unknown; name?: unknown };
    // Codes PostgreSQL (« 23505 ») et codes de oauth4webapi (« OAUTH_RESPONSE_IS_NOT_CONFORM ») : des constantes.
    if (typeof o.code === 'string' && /^([0-9A-Z]{5}|OAUTH_[A-Z_]{1,50}|ERR_[A-Z_]{1,50}|E[A-Z]{2,20})$/.test(o.code)) {
      return o.code;
    }
    const classes = ['TypeError', 'RangeError', 'SyntaxError', 'AbortError', 'TimeoutError', 'Error'];
    if (typeof o.name === 'string' && classes.includes(o.name)) return o.name;
  }
  return 'autre';
}
