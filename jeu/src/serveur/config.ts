// Origine : test-18h/src/config.ts (12 octobre 2026), copie adaptée. Le principe est repris tel quel : tout secret
// passe par une variable d'environnement, saisie par le porteur chez Scalingo, jamais dans le dépôt (D-048, P-16) ;
// un réglage absent ou illisible est signalé par son NOM, jamais par sa valeur. Ce qui change pour le jeu :
// - quatre réglages sont indispensables : la base, SECRET_SESSION, CLE_REPONSES et CLE_IDENTITES (la clé des
//   empreintes d'identité, à part depuis le 16 octobre 2026 : changer SECRET_SESSION ne doit jamais rendre les comptes
//   introuvables). Sans l'un d'eux, le serveur refuse de démarrer, au lieu de tourner à moitié (P-02 : « sans clé, le
//   serveur refuse de démarrer »). Les trois clés doivent être distinctes. En ligne, FIN_DU_TEST l'est aussi : sans
//   elle, rien ne garantirait qu'aucune session ne dure au-delà de la fin du test (D-061, point 2) ;
// - les autres coupent seulement la fonction qui en dépend (connexion Apple ou Google, message de 18h, révocation
//   chez Apple, version minimale) ;
// - les réglages dangereux (horloge accélérée, connexion d'essai, garde des horaires levée) n'existent qu'en local :
//   présents chez Scalingo ou sur GitHub, ils sont REFUSÉS et le serveur ne démarre pas (CONTRAT.md, partie 5).
// Retirés : les codes d'essai, le calendrier des soirs, la clé VAPID (propres au test de 18h).
//
// Étape 1, travail D (16 octobre 2026) : les réglages d'Apple sont séparés par fonction, pour qu'un manque ne coupe
// que la sienne (DECISIONS-TECHNIQUES 1.7) :
// - la connexion Apple n'a besoin que de l'identifiant de l'application (APPLE_ID_APPLICATION) : c'est l'audience du
//   jeton signé par Apple, vérifié avec les clés publiques d'Apple, sans clé à nous ;
// - le message de 18h : l'identifiant d'équipe, la clé des messages (.p8) et son identifiant, le service d'Apple
//   (production par défaut ; « essai » seulement s'il le faut) ;
// - la révocation à « Tout effacer » (étape 2) : la clé « Se connecter avec Apple » et son identifiant, qui peuvent
//   être les mêmes que ceux des messages si le porteur a coché les deux services sur une seule clé (à vérifier) ;
// - FABRICATION_MINIMALE : le plus petit numéro de fabrication accepté (CONTRAT.md, 1.7) ; absent, tout est accepté ;
// - COMPTE_PORTEUR : à l'étape 1 seulement, le pseudo sous lequel la première connexion Apple ouvre le compte du
//   porteur, tant qu'aucun compte n'existe (CONTRAT.md, 2.5 ; arbitrage de l'équipe, renversable). Facultatif.

import { createPrivateKey, type KeyObject } from 'node:crypto';
import { deB64url } from './crypto.ts';
import { environnementProtege } from './garde-horaires.ts';

export type ModeRoles = 'roles' | 'repli';
/** Le service d'Apple pour les messages : « production » (les fabrications TestFlight), ou « essai » (sandbox). */
export type ServiceApns = 'production' | 'essai';

export type Config = {
  /** Vrai dans un conteneur de Scalingo. */
  enLigne: boolean;
  /** Vrai chez Scalingo (fabrication ou conteneur) ou sur GitHub : les réglages dangereux y sont refusés. */
  protege: boolean;
  port: number;
  adressePublique: string; // origine, sans « / » final
  version: string; // SOURCE_VERSION, posée par Scalingo ; « local » sur nos machines (DECISIONS-TECHNIQUES 1.10)
  urlBase: string | null;
  /** « roles » : un rôle de base par module ; « repli » : si Scalingo ne permet pas de créer des rôles
   *  (DECISIONS-TECHNIQUES 1.6 ; jeu/src/base/LISEZMOI.md). */
  modeRoles: ModeRoles;
  secretSession: Buffer | null;
  cleReponses: Buffer | null;
  /** La clé des empreintes d'identité (Apple, Google, e-mail), gardée hors ligne par le porteur ; ne se change jamais
   *  pendant le test (crypto.ts, `empreinteIdentite`). */
  cleIdentites: Buffer | null;
  /** La connexion Apple : l'application visée par le jeton (son identifiant, « bundle ID »). */
  apple: { idApplication: string } | null;
  /** Le message de 18h, envoyé au service d'Apple (APNs) : DECISIONS-TECHNIQUES 1.13. */
  apns: { idEquipe: string; idCle: string; clePrivee: KeyObject; idApplication: string; service: ServiceApns } | null;
  /** La révocation chez Apple à « Tout effacer » (étape 2 ; CONTRAT.md, 2.12). */
  revocation: { idEquipe: string; idCle: string; clePrivee: KeyObject; idApplication: string } | null;
  /** Le plus petit numéro de fabrication de l'application accepté (CONTRAT.md, 1.7). 0 : tout est accepté. */
  fabricationMinimale: number;
  /** Étape 1 : le pseudo du compte du porteur, ouvert par sa première connexion Apple (CONTRAT.md, 2.5). */
  comptePorteur: { pseudo: string } | null;
  google: { idClient: string; secretClient: string } | null;
  /** AAAA-MM-JJ : aucune session ne dure au-delà (DECISIONS-TECHNIQUES 1.8 ; D-061, point 2). Exigée en ligne. */
  finDuTest: string | null;
  /** Réglages de développement, lus seulement hors environnement protégé. */
  local: { horlogeVitesse: number | null; horlogeDepart: Date | null; codesEssai: string[] | null };
  manquants: string[]; // noms des réglages absents ou illisibles
  refuses: string[]; // noms des réglages dangereux présents dans un environnement protégé
  peutDemarrer: boolean;
};

/** Les réglages qui n'ont le droit d'exister qu'en local (CONTRAT.md, partie 5 ; garde-horaires.ts). */
export const REGLAGES_DANGEREUX = ['IGNORER_HORAIRES', 'HORLOGE_VITESSE', 'HORLOGE_DEPART', 'CODES_ESSAI_LOCAUX'] as const;

/** Un code se tape sans tirets ni espaces, en minuscules ou majuscules. */
export function normaliserCode(code: string): string {
  return code.normalize('NFKC').replace(/[\s-]/g, '').toLowerCase();
}

/** La clé .p8 d'Apple : acceptée telle quelle (PEM, même collée sur une ligne) ou codée en base64. */
export function lireClePriveeApple(texte: string): KeyObject | null {
  let t = texte.trim();
  if (!t.includes('BEGIN')) {
    try {
      const decode = Buffer.from(t, 'base64').toString('utf8');
      if (decode.includes('BEGIN PRIVATE KEY')) t = decode;
    } catch {
      return null;
    }
  }
  const m = /-----BEGIN PRIVATE KEY-----([\sA-Za-z0-9+/=]+)-----END PRIVATE KEY-----/.exec(t);
  const corps = m?.[1]?.replace(/\s+/g, '');
  if (!corps) return null;
  const pem = `-----BEGIN PRIVATE KEY-----\n${corps.replace(/(.{64})/g, '$1\n').replace(/\n$/, '')}\n-----END PRIVATE KEY-----\n`;
  try {
    const cle = createPrivateKey(pem);
    return cle.asymmetricKeyType === 'ec' && cle.asymmetricKeyDetails?.namedCurve === 'prime256v1' ? cle : null;
  } catch {
    return null;
  }
}

/** Un pseudo que la base acceptera (migration 0001, `joueur.pseudo`) : 1 à 24 caractères, ni « @ », ni « / », ni
 *  « : », ni « < » ou « > », ni caractère de contrôle, ni adresse IP. Le programme vérifie avant la base (P-07). */
export function pseudoAcceptable(pseudo: string): boolean {
  const n = [...pseudo].length;
  return n >= 1 && n <= 24 && pseudo === pseudo.trim() && !/[@/:<>\u0000-\u001f\u007f-\u009f]/.test(pseudo)
    && !/[0-9]+(\.[0-9]+){3}/.test(pseudo);
}

function dateCivile(texte: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texte)) return null;
  const d = new Date(texte + 'T12:00:00Z');
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== texte ? null : texte;
}

export function lireConfig(env: NodeJS.ProcessEnv): Config {
  const manquants: string[] = [];
  const refuses: string[] = [];
  const val = (nom: string): string | null => {
    const v = env[nom];
    return v === undefined || v.trim() === '' ? null : v.trim();
  };
  const signaler = (nom: string) => { manquants.push(nom); };

  const enLigne = val('CONTAINER') !== null;
  const protege = environnementProtege(env);
  const port = Number(val('PORT') ?? '8080');
  const version = val('SOURCE_VERSION') ?? 'local';

  // En ligne, l'adresse est exigée (le domaine du porteur, D-057, D-060) ; jamais déduite de celle de Scalingo.
  let adresseOk = true;
  let adressePublique = val('ADRESSE_PUBLIQUE');
  if (!adressePublique) {
    adressePublique = `http://localhost:${port}`;
    if (enLigne) { signaler('ADRESSE_PUBLIQUE'); adresseOk = false; }
  }
  adressePublique = adressePublique.replace(/\/+$/, '');
  try {
    const u = new URL(adressePublique);
    if (enLigne && u.protocol !== 'https:') { signaler('ADRESSE_PUBLIQUE'); adresseOk = false; }
    adressePublique = u.origin;
  } catch {
    signaler('ADRESSE_PUBLIQUE');
    adresseOk = false;
  }

  const urlBase = val('SCALINGO_POSTGRESQL_URL') ?? val('DATABASE_URL');
  if (!urlBase) signaler('SCALINGO_POSTGRESQL_URL');

  let modeRoles: ModeRoles = 'roles';
  const mode = val('MODE_ROLES');
  if (mode === 'repli') modeRoles = 'repli';
  else if (mode !== null && mode !== 'roles') refuses.push('MODE_ROLES'); // une valeur inconnue ne vaut pas « repli »

  const cle = (nom: string, exacte: boolean): Buffer | null => {
    const s = val(nom);
    try {
      if (s) {
        const b = deB64url(s);
        if (exacte ? b.length === 32 : b.length >= 32) return b;
      }
    } catch { /* signalé plus bas */ }
    signaler(nom);
    return null;
  };
  const secretSession = cle('SECRET_SESSION', false);
  let cleReponses = cle('CLE_REPONSES', true);
  let cleIdentites = cle('CLE_IDENTITES', true);
  // Trois clés distinctes : la même valeur collée deux fois ferait tomber la séparation (qui tient l'une tiendrait
  // l'autre). Le réglage fautif est signalé par son nom, jamais par sa valeur.
  if (cleIdentites && ((cleReponses && cleIdentites.equals(cleReponses)) || (secretSession && cleIdentites.equals(secretSession)))) {
    signaler('CLE_IDENTITES');
    cleIdentites = null;
  }
  if (cleReponses && secretSession && cleReponses.equals(secretSession)) {
    signaler('CLE_REPONSES');
    cleReponses = null;
  }

  // Apple. Chaque fonction a ses réglages ; un réglage partagé (équipe, application) manquant est signalé une fois.
  const dix = /^[A-Z0-9]{10}$/;
  const paquet = /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+){1,9}$/;
  const aAppli = val('APPLE_ID_APPLICATION');
  const idApplication = aAppli && paquet.test(aAppli) ? aAppli : null;
  if (!idApplication) signaler('APPLE_ID_APPLICATION');
  const aEquipe = val('APPLE_ID_EQUIPE');
  const idEquipe = aEquipe && dix.test(aEquipe) ? aEquipe : null;
  if (!idEquipe) signaler('APPLE_ID_EQUIPE');
  const cleApple = (nomId: string, nomCle: string): { idCle: string; clePrivee: KeyObject } | null => {
    const id = val(nomId);
    const texte = val(nomCle);
    const clePrivee = texte ? lireClePriveeApple(texte) : null;
    if (!id || !dix.test(id)) signaler(nomId);
    if (!clePrivee) signaler(nomCle);
    return id && dix.test(id) && clePrivee ? { idCle: id, clePrivee } : null;
  };
  const apple: Config['apple'] = idApplication ? { idApplication } : null;
  const cleMessages = cleApple('APPLE_ID_CLE_MESSAGES', 'APPLE_CLE_MESSAGES');
  let service: ServiceApns | null = 'production';
  const sm = val('APPLE_SERVICE_MESSAGES');
  if (sm === 'essai') service = 'essai';
  else if (sm !== null && sm !== 'production') { signaler('APPLE_SERVICE_MESSAGES'); service = null; }
  const apns: Config['apns'] = idEquipe && idApplication && cleMessages && service
    ? { idEquipe, idApplication, ...cleMessages, service } : null;
  const cleConnexion = cleApple('APPLE_ID_CLE_CONNEXION', 'APPLE_CLE_CONNEXION');
  const revocation: Config['revocation'] = idEquipe && idApplication && cleConnexion
    ? { idEquipe, idApplication, ...cleConnexion } : null;

  // La version minimale : un entier de 0 à 999 999 999. Absente ou illisible : signalée, et tout est accepté.
  let fabricationMinimale = 0;
  const fm = val('FABRICATION_MINIMALE');
  if (fm !== null && /^[0-9]{1,9}$/.test(fm)) fabricationMinimale = Number(fm);
  else signaler('FABRICATION_MINIMALE');

  // Le compte du porteur, à l'étape 1 : facultatif ; présent mais illisible, il est signalé et sans effet.
  let comptePorteur: Config['comptePorteur'] = null;
  const cp = val('COMPTE_PORTEUR');
  if (cp !== null) {
    if (pseudoAcceptable(cp)) comptePorteur = { pseudo: cp };
    else signaler('COMPTE_PORTEUR');
  }

  let google: Config['google'] = null;
  const gId = val('GOOGLE_ID_CLIENT');
  const gSecret = val('GOOGLE_SECRET_CLIENT');
  if (gId && gSecret) google = { idClient: gId, secretClient: gSecret };
  else {
    if (!gId) signaler('GOOGLE_ID_CLIENT');
    if (!gSecret) signaler('GOOGLE_SECRET_CLIENT');
  }

  const fin = val('FIN_DU_TEST');
  const finDuTest = fin ? dateCivile(fin) : null;
  if (!finDuTest) signaler('FIN_DU_TEST');

  // Réglages dangereux : refusés dans un environnement protégé, quelle que soit leur valeur.
  const local: Config['local'] = { horlogeVitesse: null, horlogeDepart: null, codesEssai: null };
  for (const nom of REGLAGES_DANGEREUX) {
    if (env[nom] !== undefined && env[nom] !== '' && protege) refuses.push(nom);
  }
  if (!protege) {
    const v = val('HORLOGE_VITESSE');
    if (v !== null) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 1 && n <= 10_000) local.horlogeVitesse = n;
      else signaler('HORLOGE_VITESSE');
    }
    const dep = val('HORLOGE_DEPART');
    if (dep !== null) {
      const d = new Date(dep);
      if (!Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(dep)) local.horlogeDepart = d;
      else signaler('HORLOGE_DEPART');
    }
    const c = val('CODES_ESSAI_LOCAUX');
    if (c !== null) {
      const codes = c.split(';').map(normaliserCode).filter((x) => x !== '');
      if (codes.length > 0 && new Set(codes).size === codes.length && codes.every((x) => /^[a-z0-9]{8,40}$/.test(x))) {
        local.codesEssai = codes;
      } else signaler('CODES_ESSAI_LOCAUX');
    }
  }

  const peutDemarrer = urlBase !== null && secretSession !== null && cleReponses !== null && cleIdentites !== null
    && refuses.length === 0 && (!enLigne || (adresseOk && finDuTest !== null));
  return {
    enLigne, protege, port, adressePublique, version, urlBase, modeRoles, secretSession, cleReponses, cleIdentites, apple, apns,
    revocation, fabricationMinimale, comptePorteur, google, finDuTest, local, manquants: [...new Set(manquants)],
    refuses: [...new Set(refuses)], peutDemarrer,
  };
}
