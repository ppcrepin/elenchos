// Origine : test-18h/src/journal.ts (REPRIS, 12 octobre 2026), copie adaptée : les listes fermées (événements,
// routes, détails) sont celles du jeu. Le mécanisme est inchangé.
// Un journal qui ne peut rien écrire de personnel (P-07) : chaque ligne n'a que des champs d'une liste fermée, et
// chaque texte vient d'une liste fermée ; aucune valeur reçue d'un téléphone, d'Apple ou de Google ne peut y entrer,
// par construction. Jamais : adresse internet, jeton d'appareil, identifiant, pseudo, adresse e-mail, code, contenu
// d'une demande. Scalingo garde ces journaux un an, hors d'atteinte de « Tout effacer » (P-07, vigilance).
//
// Les routes sont celles du contrat du jeu entier (jeu/CONTRAT.md, parties 2 et 7 ; les types `Routes` de
// jeu/src/contrat.ts), plus les navigations web (CONTRAT.md, 2.14) et `POST /api/recu`. La compilation vérifie que la
// liste et le contrat concordent dans les deux sens : une route ajoutée au contrat sans être ajoutée ici fait échouer
// `tsc` (`ROUTES_ALIGNEES`). Toute adresse qui n'est pas dans la liste s'écrit « (autre) ».

import type { Routes } from '../contrat.ts';

const EVENEMENTS = [
  'demarrage', 'arret', 'migration', 'roles', 'reglages', 'requete', 'planificateur', 'envoi', 'connexion',
  'effacement', 'menage', 'erreur',
] as const;
export type Evenement = (typeof EVENEMENTS)[number];

/** Les routes JSON du contrat, dans l'ordre de `Routes` (jeu/src/contrat.ts). */
const ROUTES_DU_CONTRAT = [
  'GET /api/etat',
  'POST /api/lien', 'GET /api/accord', 'POST /api/accord', 'GET /api/entree', 'POST /api/entree/repondre',
  'GET /api/entree/bilan',
  'GET /api/compte', 'POST /api/compte/pseudo', 'POST /api/connexion/debut', 'POST /api/connexion/apple',
  'POST /api/connexion/echanger', 'POST /api/compte/email', 'POST /api/compte/code', 'GET /api/rejoindre',
  'POST /api/rejoindre',
  'GET /api/cercles', 'POST /api/cercle', 'POST /api/cercle/voir', 'POST /api/cercle/titres', 'POST /api/cercle/quitter',
  'POST /api/proche', 'POST /api/inviter/voir', 'POST /api/inviter', 'GET /api/miroir', 'POST /api/miroir/parier',
  'GET /api/aujourdhui', 'POST /api/deviner/ouvrir', 'POST /api/deviner/poser', 'POST /api/deviner/pourquoi',
  'POST /api/deviner/passer', 'POST /api/deviner/valider', 'POST /api/repondre/ouvrir', 'POST /api/repondre',
  'GET /api/revelation', 'POST /api/revelation/etape', 'POST /api/fiche', 'POST /api/vu',
  'GET /api/moi', 'GET /api/moi/titres', 'GET /api/moi/historique', 'GET /api/reglages', 'POST /api/message',
  'GET /api/droits', 'POST /api/tout-effacer', 'POST /api/deconnexion',
  'POST /api/abonnement', 'POST /api/geste', 'POST /api/duree-raison', 'POST /api/compteur',
  'POST /dev/connexion', 'POST /dev/horloge',
] as const;

/** Vrai seulement si la liste ci-dessus et les clés de `Routes` sont exactement les mêmes : sinon `tsc` refuse
 *  l'affectation de `true`, et le contrôle du code échoue. */
type Egales<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const ROUTES_ALIGNEES: Egales<(typeof ROUTES_DU_CONTRAT)[number], keyof Routes> = true;

/** Les routes, sous forme de modèle : celles du contrat, `POST /api/recu` (l'extension de réception, hors de
 *  `Routes`), les navigations web (CONTRAT.md, 2.14) et les fichiers de ces pages. Toute autre adresse s'écrit
 *  « (autre) ». */
export const ROUTES = [
  ...ROUTES_DU_CONTRAT,
  'POST /api/recu',
  'GET /', 'GET /confidentialite', 'GET /invitation', 'GET /.well-known/apple-app-site-association',
  'POST /connexion/google/retour', 'GET (fichier)',
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
