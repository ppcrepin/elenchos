// Origine : test-18h/src/journal.ts (REPRIS, 12 octobre 2026), copie adaptée : les listes fermées (événements,
// routes, détails) sont celles du jeu. Le mécanisme est inchangé.
// Un journal qui ne peut rien écrire de personnel (P-07) : chaque ligne n'a que des champs d'une liste fermée, et
// chaque texte vient d'une liste fermée ; aucune valeur reçue d'un téléphone, d'Apple ou de Google ne peut y entrer,
// par construction. Jamais : adresse internet, jeton d'appareil, identifiant, pseudo, adresse e-mail, code, contenu
// d'une demande. Scalingo garde ces journaux un an, hors d'atteinte de « Tout effacer » (P-07, vigilance).
//
// Les routes suivent jeu/CONTRAT.md (état du 15 octobre 2026), moins ce que l'application iPhone rend sans objet
// (code de passage, geste de l'icône : plan-jeu-entier-equipe.md, 2.4). À réaligner quand le contrat du jeu entier
// sera posé : une route absente s'écrit « (autre) », ce qui ne fuit rien mais rend le journal moins utile.

const EVENEMENTS = [
  'demarrage', 'arret', 'migration', 'roles', 'reglages', 'requete', 'planificateur', 'envoi', 'connexion',
  'effacement', 'menage', 'erreur',
] as const;
export type Evenement = (typeof EVENEMENTS)[number];

/** Les routes, sous forme de modèle. Toute autre adresse s'écrit « (autre) ». */
export const ROUTES = [
  'GET /', 'GET (fichier)',
  'GET /api/etat', 'POST /api/lien', 'GET /api/accord', 'POST /api/accord',
  'GET /api/entree', 'POST /api/entree/repondre', 'GET /api/entree/bilan',
  'GET /api/compte', 'POST /api/compte/pseudo', 'POST /api/compte/email', 'POST /api/compte/code',
  'POST /api/cercle', 'GET /api/inviter', 'POST /api/inviter', 'GET /api/miroir', 'POST /api/miroir/parier',
  'GET /api/aujourdhui', 'POST /api/repondre', 'POST /api/deviner/ouvrir', 'POST /api/deviner/poser',
  'POST /api/deviner/pourquoi', 'POST /api/deviner/passer', 'POST /api/deviner/valider',
  'GET /api/revelation', 'POST /api/vu', 'POST /api/fiche',
  'POST /api/abonnement', 'POST /api/recu', 'POST /api/compteur',
  'GET /api/cercle', 'GET /api/moi', 'GET /api/droits', 'POST /api/tout-effacer', 'POST /api/deconnexion',
  'GET /connexion/apple', 'GET /connexion/google', 'POST /connexion/apple/retour', 'POST /connexion/google/retour',
  'POST /dev/connexion', 'POST /dev/horloge',
  '(autre)',
] as const;
export type Route = (typeof ROUTES)[number];

const DETAILS = [
  'pret', 'reglages incomplets', 'reglages refuses', 'pas de base', 'migrations jouees', 'migration modifiee',
  'roles prets', 'repli', 'horloge arretee', 'creneau', 'abonnement retire', 'service refuse', 'envoi interrompu',
  'compte efface', 'provisoire efface', 'effacement verifie', 'base non vide', 'refus code', 'trop d essais',
  'origine refusee', 'refus fournisseur', 'jeton refuse', 'reussie', 'signal',
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
  manquants?: string[]; // noms de réglages manquants ou refusés (des noms de variables, jamais des valeurs)
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

/** Le type d'une erreur, sans son message : un code d'erreur PostgreSQL (dont nos codes « EL… »), un code de
 *  bibliothèque, ou une classe connue. */
export function typeErreur(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as { code?: unknown; name?: unknown };
    // Codes PostgreSQL (« 23505 », « EL034 ») et codes de oauth4webapi (« OAUTH_RESPONSE_IS_NOT_CONFORM ») : des constantes.
    if (typeof o.code === 'string' && /^([0-9A-Z]{5}|OAUTH_[A-Z_]{1,50}|ERR_[A-Z_]{1,50}|E[A-Z]{2,20})$/.test(o.code)) {
      return o.code;
    }
    const classes = ['TypeError', 'RangeError', 'SyntaxError', 'AbortError', 'TimeoutError', 'Error'];
    if (typeof o.name === 'string' && classes.includes(o.name)) return o.name;
  }
  return 'autre';
}
