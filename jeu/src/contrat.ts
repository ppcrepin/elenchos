// Le contrat entre le serveur et l'application, pour le jeu entier (D-062), dans une application iPhone (Capacitor,
// interface embarquée), testée par TestFlight. Étape 1, travail A (D-064). Back-end et Front-end ensemble, 16 octobre
// 2026 ; remplace la version de test de la phase 0 (D-060, 15 octobre 2026). Prose et règles : jeu/CONTRAT.md ;
// format des textes : jeu/textes/FORMAT.md ; choix techniques : jeu/DECISIONS-TECHNIQUES.md.
//
// Ce fichier ne contient que des types, et les listes fermées dont ils dérivent (des constantes, sans logique).
// - Le serveur l'importe (`import type { … } from './contrat.ts'`) ; il se lit avec Node 22, sans fabrication
//   (`erasableSyntaxOnly` : ni enum, ni namespace, ni propriété de paramètre).
// - L'interface embarquée ne l'importe jamais à l'exécution : elle s'en sert dans ses commentaires JSDoc, vérifiés par
//   `tsc`, par exemple `/** @typedef {import('../src/contrat.ts').Aujourdhui} Aujourdhui */`.
// - Le moteur de règles (`src/regles/`) a ses propres types et ne dépend pas de ce fichier.
//
// Quatre règles tiennent tout le fichier :
// 1. Liste fermée (P-27) : un type contient ce que l'écran montre, rien de plus. Un champ ajouté ici « au cas où »
//    est une faute, même s'il ne contient rien de sensible.
// 2. Le serveur calcule, l'application montre : aucun type ne demande à l'application d'appliquer une règle du jeu
//    (verdicts, seuils, phrases, ordre des cartes et des étapes de la révélation, avis du cercle, titres, curseurs,
//    tempéraments sont rendus déjà faits).
// 3. Rien avant 18h (P-26) : aucun type servi avant la révélation ne porte le vote, un auteur, l'auteur d'une carte
//    ou l'avis du cercle, même sous une forme cachée. Ce qu'on reçoit d'un autre membre (curseurs, tempéraments,
//    surprises) se calcule d'après ses seules réponses déjà révélées (P-27 a, lecture A).
// 4. Rien dans les adresses (P-08) : aucun identifiant, jeton ou réponse dans un chemin ou après un « ? ». Les jetons
//    voyagent dans un en-tête, dans le corps d'une demande, ou après un « # ».

// ============================================================================================================
// 1. Briques communes
// ============================================================================================================

/** Un instant, en ISO 8601 UTC : « 2026-11-20T17:00:00.000Z ». */
export type Instant = string;

/** Un jour civil à Paris : « 2026-11-20 ». */
export type DateCivile = string;

/** Un nombre de 0 à 1000 (millièmes), entier : position d'affichage sur un curseur. Entier plutôt que nombre à virgule,
 *  pour que deux réponses égales soient égales octet pour octet (test des réponses inversées, P-27 a). */
export type Millieme = number;

/** La position sur cinq niveaux : 1 Très défavorable, 2 Défavorable, 3 Neutre, 4 Favorable, 5 Très favorable.
 *  Les mots sont fixes : ils vivent dans l'application. */
export type Position = 1 | 2 | 3 | 4 | 5;

/** Le rang d'affichage d'une raison (1 à 4), dans l'ordre tiré une fois par texte (jeu/textes/FORMAT.md, partie 4). */
export type RangRaison = 1 | 2 | 3 | 4;

/** Ce que le joueur choisit comme raison : une des quatre, ou « aucune ». */
export type ChoixRaison = RangRaison | 'aucune';

/** L'identifiant public d'un texte, celui du fichier des textes (« T07 »). */
export type IdTexte = string;

/** Le numéro d'une carte de Deviner : tiré au hasard pour chaque joueur, chaque cercle et chaque jour, jamais relié à un
 *  membre (P-26). Unique parmi toutes les cartes du joueur ce jour-là : il suffit à désigner la manche. */
export type IdCarte = string;

/** Le numéro d'un cercle, vu par un de ses membres : tiré au hasard à la création du cercle. Jamais l'identifiant du
 *  cercle en base. */
export type IdCercle = string;

/** Le numéro d'un membre dans un cercle : tiré au hasard à l'entrée dans ce cercle. Une même personne a un numéro
 *  différent dans chacun de ses cercles. Ce n'est jamais l'identifiant du joueur en base (P-01) ; il ne sert qu'à
 *  désigner un visage. */
export type IdMembre = string;

/** Un visage : ce que le cercle voit d'un membre (P-27 : pseudo et rond, rien d'autre). Le pseudo est celui du compte,
 *  le même dans tous ses cercles (P-03 a) ; le rond est propre au cercle (E7). */
export type Visage = {
  readonly id: IdMembre;
  readonly pseudo: string;
  /** Une ou deux lettres, uniques dans le cercle (E7). */
  readonly rond: string;
};

/** Un cercle nommé, tel qu'il apparaît dans un en-tête, une étape de révélation ou une liste. */
export type CercleCourt = {
  readonly id: IdCercle;
  readonly nom: string;
};

/** Les trois lignes d'un texte. */
export type Lignes = readonly [string, string, string];

/** Une raison telle qu'elle s'affiche : son rang et son argument, sans guillemets (l'application les ajoute). */
export type RaisonAffichee = {
  readonly rang: RangRaison;
  readonly texte: string;
};

/** Le texte du jour, ou un texte d'entrée, avant d'y répondre : jamais l'auteur, la tension, le vote, le lien officiel. */
export type TexteARepondre = {
  readonly id: IdTexte;
  readonly titre: string;
  readonly lignes: Lignes;
  /** Les quatre raisons, dans l'ordre d'affichage (rang 1 à 4). */
  readonly raisons: readonly RaisonAffichee[];
};

/** Un texte déjà répondu, rappelé en tête d'un écran (« Hier : … · Relire »). */
export type TexteCourt = {
  readonly id: IdTexte;
  readonly titre: string;
  readonly lignes: Lignes;
};

/** Un texte désigné par son seul titre (surprise de la semaine, écran d'un proche) : il mène à sa fiche. */
export type TexteNomme = {
  readonly id: IdTexte;
  readonly titre: string;
};

/** Une réponse telle qu'on la montre : position et raison. */
export type ReponseAffichee = {
  readonly position: Position;
  readonly raison: RaisonAffichee | 'aucune';
};

/** Le vote, après 18h seulement. Les deux lignes sont faites par le serveur (E4 : le jeu garde les faits et en tire
 *  la phrase). Exemple : titre « Texte adopté. », ligne « Le 9 octobre 2024. Le Sénat devait encore voter. » */
export type VoteAffiche = {
  readonly titre: string;
  readonly ligne: string;
};

/** Les voies de connexion offertes. `email` est faux tant que l'envoi d'e-mails n'est pas réglé (pas de domaine,
 *  D-060 point 2 : il arrive à l'étape 4). */
export type Voies = {
  readonly apple: boolean;
  readonly google: boolean;
  readonly email: boolean;
};

/** La voie par laquelle un compte a été créé. Rendue au seul titulaire (Réglages, et après « Tout effacer » pour N14) ;
 *  jamais servie au sujet d'un autre membre (P-27). */
export type Voie = 'apple' | 'google' | 'email';

/** Un jeton de session : 32 octets tirés au hasard, en base64url. L'application le garde dans le trousseau de l'iPhone
 *  et l'envoie dans l'en-tête `Authorization: Bearer …` ; la base n'en garde que l'empreinte avec clé (P-11, P-41). */
export type JetonSession = string;

// ============================================================================================================
// 2. L'enveloppe de chaque échange, l'heure du serveur, la version minimale
// ============================================================================================================

/** L'heure, donnée par le serveur (R10 : jamais celle du téléphone). */
export type Horloge = {
  /** L'heure du serveur au moment de la réponse. */
  readonly instant: Instant;
  /** Le prochain 18h, heure de Paris : fin du jour de jeu en cours. Cible de tous les comptes à rebours. */
  readonly bascule: Instant;
  /** 1 en ligne, toujours. Plus grand seulement en développement local, horloge accélérée (CONTRAT.md, partie 5). */
  readonly vitesse: number;
};

/** Toute réponse JSON du serveur (sauf `POST /api/recu`, qui répond 204 sans corps, et les navigations). */
export type Reponse<T> =
  | {
      readonly ok: true;
      /** Le plus petit numéro de fabrication de l'application que le serveur accepte. L'application compare le sien
       *  (envoyé dans l'en-tête `Elenchos-Fabrication`) : en dessous, elle montre l'écran de mise à jour (CONTRAT.md,
       *  1.7). */
      readonly fabricationMinimale: number;
      readonly horloge: Horloge;
      readonly donnees: T;
    }
  | {
      readonly ok: false;
      readonly fabricationMinimale: number;
      readonly horloge: Horloge;
      readonly erreur: CodeErreur;
    };

// ============================================================================================================
// 3. Les erreurs (liste fermée)
// ============================================================================================================

export const CODES_ERREUR = [
  // Communes à toutes les routes
  'requete_invalide', // 400 : corps illisible, champ manquant ou en trop, valeur hors liste
  'non_connecte', // 401 : la route demande une session (provisoire ou compte), absente, inconnue ou échue
  'origine_refusee', // 403 : demande d'un navigateur venue d'une autre origine que l'application ou nos pages
  'introuvable', // 404 : route inconnue (et toute route /dev/ en ligne) ; cercle, membre ou texte inconnu du joueur
  'mise_a_jour_requise', // 426 : en-tête `Elenchos-Fabrication` sous `fabricationMinimale` (jamais sur GET /api/etat)
  'trop_de_demandes', // 429 : limiteur
  'erreur_serveur', // 500
  'indisponible', // 503 : fonction coupée faute de réglage (voie e-mail sans domaine, message de 18h sans clé)
  // Ordre du parcours
  'etape_incorrecte', // 409 : la demande ne correspond pas à l'étape où en est le joueur
  'accord_requis', // 409 : la carte de consentement (ou sa nouvelle version) doit être acceptée avant (P-34)
  'accord_perime', // 409 : la version de la carte, ou de la phrase d'invitation, envoyée n'est plus la bonne
  // Le temps
  'texte_ferme', // 409 : le texte s'est fermé à 18h (18h10 si l'écran Répondre s'était affiché avant 18h, R10)
  'manche_fermee', // 409 : la manche s'est fermée à 18h
  'pas_encore_revele', // 409 : fiche d'un texte ni révélé, ni servi au joueur
  'rien_a_reveler', // 409 : aucune révélation jusqu'au prochain 18h
  'rien_a_deviner', // 409 : pas de manche miroir (1.11)
  // Les gestes
  'deja_repondu', // 409
  'deja_validee', // 409 : la manche est validée, rien ne change plus (règle 9)
  'carte_inconnue', // 409
  'visage_non_propose', // 409 : ce visage n'est pas proposé sur cette manche (règle 8, R8)
  'visage_deja_pose', // 409 : chaque visage une fois (règle 8)
  'pourquoi_sans_visage', // 409 : le « pourquoi » se choisit une fois le visage posé (règle 9)
  // Le lien, le compte, les cercles
  'lien_deja_servi', // 410 : le lien s'est lié à un autre joueur entre-temps (P-29)
  'lien_expire', // 410
  'connexion_expiree', // 410 : connexion commencée il y a plus de 10 minutes, ou code de retour de plus d'une minute
  'cercle_complet', // 409 : dix membres (règle 1)
  'trois_cercles', // 409 : le joueur a déjà trois cercles (règle 3)
  'pseudo_pris', // 422 (E7)
  'pseudo_invalide', // 422
  'nom_invalide', // 422 : nom du cercle
  'adresse_invalide', // 422 : adresse e-mail
  'code_faux', // 422
  'code_expire', // 422 : 15 minutes (P-41)
  'trop_essais', // 429 : 5 essais par code (P-41)
  'trop_de_codes', // 429 : codes demandés pour une même adresse (P-41)
  'abonnement_invalide', // 422 : jeton d'appareil illisible
] as const;
export type CodeErreur = (typeof CODES_ERREUR)[number];

// ============================================================================================================
// 4. Démarrer : l'état du joueur
// ============================================================================================================

export type ModeEntree = 'createur' | 'invite';

/** Où en est le joueur. L'application en tire l'écran à montrer (CONTRAT.md, 2.1). */
export type Parcours =
  /** Pas de session : N1 dans l'application, ou l'ouverture d'un lien (`POST /api/lien`). */
  | { readonly etape: 'dehors' }
  /** Session provisoire, défi en cours : `faits` textes déjà répondus. */
  | { readonly etape: 'entree'; readonly mode: ModeEntree; readonly invitant: Visage | null; readonly faits: 0 | 1 | 2 }
  /** Session provisoire, trois textes répondus, pas encore de compte : bilan (1.7, N16), puis compte (1.8). */
  | { readonly etape: 'entree_finie'; readonly mode: ModeEntree }
  /** Compte sans aucun cercle : 5.1. `premierCercle` faux : le joueur a quitté tous ses cercles (mots d'UX). */
  | { readonly etape: 'nommer_cercle'; readonly premierCercle: boolean }
  /** Compte dans au moins un cercle : les trois onglets. */
  | { readonly etape: 'jeu' };

/** Le défi d'un autre cercle, relevé par un joueur qui a déjà un compte (règle 15). Il vit à côté du jeu : le joueur
 *  garde ses cercles pendant ce temps. `faits` à 3 : il reste à le rejoindre (`GET /api/rejoindre`). */
export type DefiEnCours = {
  readonly invitant: Visage;
  readonly faits: 0 | 1 | 2 | 3;
};

/** L'annonce d'arrivée faite au créateur, tant que son cercle a moins de trois membres (1.10 ; D-006, D-011). */
export type AnnonceArrivee = {
  readonly cercle: CercleCourt;
  readonly visage: Visage;
  /** Faite par le serveur, pour l'écran seulement (D-011) : « Marie a trouvé 2 de tes 3 réponses. À ton tour de deviner
   *  Marie. », ou la première phrase seule si `aDeviner` est faux. Le message envoyé, lui, ne porte jamais le score : il
   *  prend un texte de `MESSAGES_ARRIVEE` (partie 13). */
  readonly texte: string;
  /** Vrai si le créateur doit deviner cet invité : son premier invité, quand ils sont deux (D-006, D-011), dans chaque
   *  cercle qu'il crée (extension de D-006 aux cercles suivants, proposé). */
  readonly aDeviner: boolean;
};

export type Etat = {
  readonly session: 'aucune' | 'provisoire' | 'compte';
  readonly parcours: Parcours;
  /** Faux si une nouvelle version de la carte attend l'accord : la carte passe avant la prochaine réponse (P-34). */
  readonly accordAJour: boolean;
  /** Vrai à la première ouverture après 18h, tant que la révélation n'a pas été ouverte (E3). */
  readonly revelationAOuvrir: boolean;
  readonly annonces: readonly AnnonceArrivee[];
  /** Un défi d'un autre cercle en cours, pour un compte (règle 15) ; null sinon. */
  readonly defi: DefiEnCours | null;
  readonly voies: Voies;
  /** Faux si le message de 18h est coupé faute de clé chez l'hébergeur : le bloc N10 n'apparaît pas. */
  readonly message: { readonly disponible: boolean };
};

// ============================================================================================================
// 5. Le lien, la carte de consentement, le défi
// ============================================================================================================

/** Ce que donne un lien (créateur, invitation, relecture d'Apple). Les issues attendues sont des données, pas des
 *  erreurs. */
export type LienOuvert =
  | {
      readonly etat: 'ouvert';
      readonly mode: ModeEntree;
      /** null pour un lien de créateur. Jamais une réponse de l'invitant (P-29). */
      readonly invitant: Visage | null;
      /** Vrai si le joueur a déjà un compte (règle 15) : pas de carte (déjà acceptée), pas de compte à créer. */
      readonly dejaInscrit: boolean;
      readonly premierTexte: TexteARepondre;
      /** Sa réponse déjà donnée à ce texte, reprise sans compter deux fois (règle 15) ; null sinon. */
      readonly reprise: ReponseAffichee | null;
    }
  /** 5.14 et N13 : « Demande-en une nouvelle à {pseudo}. » ; `invitant` null pour un lien de créateur. */
  | { readonly etat: 'expire' | 'deja_servi'; readonly invitant: string | null }
  /** Lien illisible ou inconnu : N13 sans pseudo. */
  | { readonly etat: 'inconnu' }
  /** N15, premier moment. */
  | { readonly etat: 'complet'; readonly invitant: string }
  /** N12 : le joueur est déjà membre de ce cercle. */
  | { readonly etat: 'deja_membre'; readonly cercle: CercleCourt }
  /** Règle 15 : le joueur a déjà trois cercles. */
  | { readonly etat: 'trois_cercles' }
  /** Une entrée est déjà en cours sur cet appareil, ou un défi déjà en cours sur ce compte : on la reprend. */
  | { readonly etat: 'entree_en_cours' };

/** La carte de consentement (1.3, N5), servie par le serveur pour que l'empreinte enregistrée soit celle du texte lu. */
export type CarteAccord = {
  readonly version: string;
  /** SHA-256 du texte exact (titre et paragraphes), en hexadécimal. */
  readonly empreinte: string;
  readonly titre: string;
  readonly paragraphes: readonly string[];
};

export type EnvoiAccord = {
  readonly version: string;
  readonly empreinte: string;
  readonly quinzeAnsEtPlus: true;
  /** Le jeton du lien (partie après « # ») pour un premier accord ; null pour un nouvel accord d'un compte. */
  readonly jeton: string | null;
};

/** Réponse à `POST /api/accord`. `jeton` : la session provisoire créée par un premier accord, à ranger dans le
 *  trousseau ; null pour le nouvel accord d'un compte, qui garde sa session. */
export type AccordEnregistre = {
  readonly jeton: JetonSession | null;
};

export type Entree =
  | {
      readonly etat: 'texte';
      readonly mode: ModeEntree;
      readonly invitant: Visage | null;
      readonly rang: 1 | 2 | 3;
      readonly texte: TexteARepondre;
      /** Règle 15 : la réponse déjà donnée à ce texte par un joueur inscrit ; l'écran la montre au lieu de la demander,
       *  puis passe à « Et {pseudo} ? ». null sinon. */
      readonly reprise: ReponseAffichee | null;
    }
  | { readonly etat: 'finie' };

export type EnvoiReponseEntree = {
  readonly texte: IdTexte;
  /** La réponse ; null si `Entree.reprise` n'est pas null (réponse reprise, règle 15). */
  readonly reponse: { readonly position: Position; readonly raison: ChoixRaison } | null;
  /** « Et Thomas ? » : la position devinée (jugée sur le côté, D-011). null pour le créateur. */
  readonly pari: Position | null;
};

/** La révélation immédiate d'un texte d'entrée (1.6). */
export type RevelationEntree = {
  readonly rang: 1 | 2 | 3;
  /** null pour le créateur (1.6 sans « Ton pari » ni verdict). */
  readonly pari: { readonly position: Position; readonly verdict: 'juste' | 'faux' } | null;
  /** La réponse de l'invitant, jamais envoyée avant le pari (P-29). null pour le créateur. */
  readonly reponseInvitant: ReponseAffichee | null;
  readonly vote: VoteAffiche;
  /** « Proposé par …, député, … » (E5). */
  readonly auteurTexte: string;
  /** « Ta raison, « … », était l'argument de …, député, … » ; null si « aucune ». */
  readonly taRaison: string | null;
};

/** Un bilan de défi : celui de l'invité (1.7) ou celui du créateur qui devine son invité (1.11). Le serveur choisit la
 *  forme (E10) : `score` montre « 2 sur 3 », `surprises` montre « … a réussi à te surprendre deux fois. » */
export type BilanDefi = {
  readonly autre: Visage;
  readonly forme: 'score' | 'surprises';
  readonly trouves: 0 | 1 | 2 | 3;
  readonly surprises: 0 | 1 | 2 | 3;
};

/** 1.7 pour l'invité, N16 pour le créateur. `curseurs` : les curseurs que ses trois réponses d'entrée ont touchés,
 *  encore flous (1.7, « Ton portrait commence ») ; `barre` : la barre déjà avancée (D-026), null si pleine. */
export type BilanEntree =
  | { readonly mode: 'createur'; readonly curseurs: readonly CurseurAffiche[]; readonly barre: Barre | null }
  | ({ readonly mode: 'invite'; readonly curseurs: readonly CurseurAffiche[]; readonly barre: Barre | null } & BilanDefi);

// ============================================================================================================
// 6. Le compte et la connexion
// ============================================================================================================

/** 1.8 (N7) et « J'ai déjà un compte » (N1, N13). Le texte « Pourquoi Elenchos ? » ne vient qu'avec `creation`. */
export type EcranCompte = {
  readonly but: 'creation' | 'connexion';
  readonly pour: ModeEntree | null;
  readonly invitant: Visage | null;
  /** Le pseudo déjà accepté, s'il y en a un (retour d'une connexion refusée). */
  readonly pseudo: string | null;
  readonly voies: Voies;
  /** N15, second moment : le cercle de l'invitant s'est rempli pendant l'entrée. L'écran N15 prend la place du compte,
   *  après le bilan. Toujours faux pour le créateur et pour `connexion`. */
  readonly cercleComplet: boolean;
};

/** Ce qu'une connexion refuse, dit une seule fois. */
export type RefusConnexion =
  | 'refus_fournisseur' // le joueur a annulé chez Google, ou Google a refusé
  | 'compte_organisation' // compte Google d'employeur ou de lycée (P-41)
  | 'compte_inconnu' // « J'ai déjà un compte », mais aucun compte avec cette voie
  | 'cercle_complet' // N15
  | 'pseudo_pris' // le pseudo a été pris pendant la connexion : retour à 1.8
  | 'connexion_echouee';

/** Le résultat d'une connexion (Apple, échange du code de Google, code e-mail). `jeton` remplace dans le trousseau la
 *  session provisoire, s'il y en avait une. */
export type ResultatConnexion =
  | { readonly etat: 'connecte'; readonly jeton: JetonSession }
  | { readonly etat: RefusConnexion };

/** `POST /api/connexion/debut` : commencer une connexion par Apple ou Google. `defi` : SHA-256, en base64url, d'un
 *  vérificateur de 32 octets tiré au hasard par l'application et gardé dans sa seule mémoire, jusqu'à la fin (CONTRAT.md,
 *  2.5). */
export type EnvoiDebutConnexion = {
  readonly voie: 'apple' | 'google';
  readonly but: 'creation' | 'connexion';
  readonly defi: string;
};

export type DebutConnexion =
  /** À passer tel quel à la feuille d'Apple, qui le recopie dans le jeton signé. Vaut 10 minutes, une fois. */
  | { readonly voie: 'apple'; readonly nonce: string }
  /** L'adresse de Google à ouvrir dans la feuille du système (ASWebAuthenticationSession), avec le schéma de retour. */
  | { readonly voie: 'google'; readonly adresse: string; readonly schemaRetour: 'elenchos' };

/** `POST /api/connexion/apple` : ce que la feuille d'Apple a rendu, et le vérificateur. */
export type EnvoiConnexionApple = {
  /** Le jeton signé par Apple (JWT), avec l'identifiant pour seule information (D-061, P-03). */
  readonly jetonIdentite: string;
  readonly verificateur: string;
};

/** `POST /api/connexion/echanger` : le code lu après « # » dans l'adresse de retour `elenchos://connexion#code=…`
 *  (une minute, une fois), et le vérificateur. */
export type EnvoiEchangeConnexion = {
  readonly code: string;
  readonly verificateur: string;
};

/** L'écran qui fait entrer un joueur inscrit dans le cercle d'un défi relevé (règle 15 ; mots d'UX). */
export type EcranRejoindre = {
  readonly invitant: Visage;
  /** Son pseudo de compte. */
  readonly pseudo: string;
  /** Vrai si ce pseudo est déjà pris dans ce cercle : il en choisit un autre, qui vaudra pour tous ses cercles. */
  readonly pseudoPris: boolean;
  /** Ce qui l'empêche d'entrer, dit une fois, ou null : le cercle s'est rempli pendant le défi (N15, second moment) ;
   *  il a déjà trois cercles, ou il est déjà membre de ce cercle (cas d'un compte retrouvé à la connexion, 2.5). */
  readonly obstacle: 'cercle_complet' | 'trois_cercles' | 'deja_membre' | null;
};

// ============================================================================================================
// 7. Les cercles, l'invitation, le miroir
// ============================================================================================================

/** 5.6 : la feuille « Tes cercles », et la liste des Réglages. Rangés dans l'ordre d'entrée (règle 3). */
export type MesCercles = {
  readonly cercles: readonly CercleCourt[];
  /** Faux à trois cercles : « + Créer un cercle » est grisé (règle 3). */
  readonly peutCreer: boolean;
};

export type EcranInviter = {
  readonly cercle: CercleCourt;
  /** La phrase de consentement de l'invitant (P-35), servie avec sa version : « Tu envoies tes 3 réponses à la
   *  personne que tu invites. Ce lien est pour elle seule. » */
  readonly accord: { readonly version: string; readonly phrase: string };
  /** « Liens envoyés : 2 » : les liens créés par ce joueur pour ce cercle et encore valables. */
  readonly liensEnvoyes: number;
  /** Faux sous trois membres : « Il faut être trois pour lancer le cercle. » */
  readonly lance: boolean;
  /** Vrai à dix membres : plus d'« Inviter » (règle 1, N15). */
  readonly complet: boolean;
};

export type LienCree = {
  /** L'adresse complète de la page d'invitation, jeton après « # » (P-08) : « https://elenchos.fr/invitation#lien=… ». */
  readonly lien: string;
};

/** 1.11 : le créateur devine son premier invité, texte par texte, puis son bilan. */
export type Miroir =
  | {
      readonly etat: 'texte';
      readonly cercle: CercleCourt;
      readonly invite: Visage;
      readonly rang: 1 | 2 | 3;
      readonly texte: TexteNomme;
    }
  | ({ readonly etat: 'bilan'; readonly cercle: CercleCourt } & BilanDefi);

export type MiroirRevele = {
  readonly rang: 1 | 2 | 3;
  readonly pari: { readonly position: Position; readonly verdict: 'juste' | 'faux' };
  readonly reponseInvite: ReponseAffichee;
};

/** Les titres de la semaine (règle 12). */
export type Titre = 'devin' | 'mystere' | 'fidele';
/** Les badges rares, qui vivent ensuite comme des titres (règle 14, R7). */
export type Badge = 'sans_faute' | 'pas_de_cote';
/** Les tempéraments (règle 13). `original` et `pont` se calculent par cercle ; `mesure` et `tranche`, pour la personne. */
export type Temperament = 'original' | 'pont' | 'mesure' | 'tranche';

/** Ce qui s'écrit sous un visage, une ligne chacun (E10), dans l'ordre que le serveur donne : titres de la semaine
 *  (Le Devin, Le Mystère, Le Fidèle), badges jusqu'aux titres suivants (Le Sans-Faute, Le Pas de Côté), puis
 *  tempéraments (L'Original et Le Pont de ce cercle, Le Mesuré et Le Tranché de la personne : R9, règle 13). Les mots
 *  sont dans l'application. */
export type Distinction = Titre | Badge | Temperament;

/** Un curseur tel qu'il se dessine (règle 17) : centre et largeur, en millièmes ; `net` à W ≥ 8, largeur au plancher.
 *  Celui d'un autre membre se calcule d'après son entrée et ses réponses déjà révélées (règle 19, P-27 a). */
export type CurseurAffiche = {
  readonly tension: CodeTension;
  readonly net: boolean;
  /** 0 : tout au pôle 0 ; 1000 : tout au pôle 1. */
  readonly centre: Millieme;
  readonly largeur: Millieme;
};

/** Un tempérament, avec le nom de son cercle pour L'Original et Le Pont (« Le Pont (Famille) », R9) ; null pour Le
 *  Mesuré et Le Tranché. */
export type TemperamentAffiche = {
  readonly temperament: Temperament;
  readonly cercle: string | null;
};

export type MembreDuCercle = {
  readonly visage: Visage;
  readonly moi: boolean;
  /** Une ligne chacune, dans l'ordre donné (E10, R9). Jamais la pause (P-27). */
  readonly distinctions: readonly Distinction[];
};

/** Une barre « Où chacun se place » (4.2) : une par tension, toujours dans l'ordre fixe (règle 16). */
export type BarreTension = {
  readonly tension: CodeTension;
  /** Les membres dont le curseur est net, à leur centre (initiale : le rond du visage). */
  readonly nets: readonly { readonly membre: IdMembre; readonly centre: Millieme }[];
  /** « Encore flou : … », dans l'ordre d'arrivée. */
  readonly flous: readonly IdMembre[];
};

/** 4.2, 1.15, 5.9, 5.13. */
export type Cercle = {
  readonly cercle: CercleCourt;
  /** Rangés par ordre d'arrivée (E10). */
  readonly membres: readonly MembreDuCercle[];
  /** « Surprise de la semaine : … » (la dernière, jusqu'aux titres suivants) ; null s'il n'y en a pas (R6). */
  readonly surpriseSemaine: TexteNomme | null;
  /** Les huit barres, dans l'ordre des tensions. */
  readonly barres: readonly BarreTension[];
  readonly lance: boolean;
  readonly complet: boolean;
  /** `cercle_lance` une seule fois par membre (1.15) ; `cercle_incomplet` sous trois membres actifs, au départ ou en
   *  sommeil (5.13, 5.9 : les mêmes mots, sans jamais dire qui a arrêté). */
  readonly bandeau: 'cercle_lance' | 'cercle_incomplet' | null;
  /** Vrai s'il y a des titres passés à montrer (« Titres des semaines passées → », 5.5). */
  readonly titresPasses: boolean;
};

/** Une surprise d'un proche (règle 19, R12) : une de ses réponses révélées que tu avais attribuée à quelqu'un d'autre,
 *  dont la réponse différait ; ni passes, ni textes d'entrée, ni jumeau. La raison est toujours écrite (E10). */
export type SurpriseProche = {
  readonly texte: TexteNomme;
  readonly reponse: ReponseAffichee;
  /** « Tu pensais à Paul. » ; null : la personne désignée a quitté le cercle (« un ancien membre », mots d'UX). */
  readonly tuPensais: Visage | null;
};

/** 4.3, l'écran d'un proche : vos deux portraits superposés et ses surprises, sans aucun chiffre (D-010, question 2). */
export type Proche = {
  readonly cercle: CercleCourt;
  readonly visage: Visage;
  readonly distinctions: readonly Distinction[];
  /** Les huit tensions : d'abord celles où vous êtes nets tous les deux, puis les autres, dans l'ordre fixe (4.3). Ton
   *  curseur est ton portrait entier ; le sien, d'après ses réponses révélées (règle 19). */
  readonly curseurs: readonly { readonly toi: CurseurAffiche; readonly lui: CurseurAffiche }[];
  /** De la plus récente à la plus ancienne. L'écran en montre deux, puis « Voir tout ». */
  readonly surprises: readonly SurpriseProche[];
};

/** Une ligne des titres passés : un titre ou un badge, ses titulaires présents, et combien d'anciens membres l'avaient
 *  (D-045 point 2 ; deux anciens membres ne se distinguent pas, règle 4). */
export type LigneTitrePasse = {
  readonly distinction: Titre | Badge;
  readonly titulaires: readonly Visage[];
  readonly anciensMembres: number;
};

/** 5.5 : titres des semaines passées, de la plus récente à la plus ancienne, sans total (R7). */
export type TitresPasses = {
  readonly cercle: CercleCourt;
  readonly semaines: readonly {
    /** « Semaine du 26 mai », fait par le serveur. */
    readonly semaine: string;
    readonly lignes: readonly LigneTitrePasse[];
  }[];
};

// ============================================================================================================
// 8. La journée
// ============================================================================================================

/** Le repère de la journée (D-038). Avec plusieurs cercles, la seconde ligne de Deviner les nomme (« Famille ✓ ·
 *  Amis ») ; un cercle endormi n'y figure pas (règle 5). */
export type Repere = {
  /** `rien` : « rien hier », jamais barré (D-038). */
  readonly deviner: 'en_cours' | 'fait' | 'a_venir' | 'rien';
  readonly repondre: 'en_cours' | 'fait' | 'a_venir';
  /** Vide avec un seul cercle. `rien` : « Rien à deviner dans {nom} aujourd'hui » (manche vidée, règle 3). */
  readonly cercles: readonly { readonly nom: string; readonly etat: 'fait' | 'en_cours' | 'a_venir' | 'rien' }[];
};

/** Une carte de Deviner, avant 18h : une réponse sans nom (P-26). */
export type CarteADeviner = {
  readonly id: IdCarte;
  readonly position: Position;
  /** `cachee` : la carte « qui et pourquoi », toujours en dernier (règle 9, D-038). */
  readonly raison: RaisonAffichee | 'aucune' | 'cachee';
  /** Le visage posé dans le brouillon, ou null. */
  readonly pose: IdMembre | null;
  /** Le « pourquoi » choisi, sur la carte cachée seulement. */
  readonly pourquoi: RangRaison | null;
  readonly passee: boolean;
};

export type EtapeDeviner =
  /** La manche existe mais son écran ne s'est jamais affiché : l'application appelle `POST /api/deviner/ouvrir` en le
   *  montrant. Une manche jamais ouverte n'a pas de cartes (R10). */
  | { readonly type: 'deviner'; readonly ouverte: false; readonly cercle: CercleCourt; readonly rang: number; readonly total: number }
  | {
      readonly type: 'deviner';
      readonly ouverte: true;
      readonly cercle: CercleCourt;
      /** « Amis · 2 sur 2 » (5.8) : rang de cette manche parmi celles du jour, dans l'ordre d'entrée (règle 3). */
      readonly rang: number;
      readonly total: number;
      readonly texteHier: TexteCourt;
      /** Dans l'ordre de la manche ; la carte cachée en dernier. */
      readonly cartes: readonly CarteADeviner[];
      /** Les visages proposés, par ordre d'arrivée (règle 8). Un proche présent dans plusieurs de tes cercles n'est
       *  proposé que dans une seule de tes manches du jour, qu'il ait répondu ou non (R8). */
      readonly proposes: readonly Visage[];
      /** Les quatre raisons du texte d'hier, pour la feuille 2.2 ; null s'il n'y a pas de carte cachée. */
      readonly raisonsHier: readonly RaisonAffichee[] | null;
    };

export type EtapeRepondre = {
  readonly type: 'repondre';
  /** Le bandeau au-dessus du texte : 1.12 (`pour_l_instant`, `pour_l_instant_moins_de_trois`), 5.12 (`aujourd_hui`). */
  readonly rienADeviner: 'pour_l_instant' | 'pour_l_instant_moins_de_trois' | 'aujourd_hui' | null;
  readonly texte: TexteARepondre;
};

export type EtapeEnAttendant = {
  readonly type: 'en_attendant';
  /** Faite par le serveur (règle 18, R1, mots de D-053). */
  readonly phraseDuJour: string;
  /** « Révélation dans … » ou « Nouveau texte dans … » (E1) ; la cible est toujours `horloge.bascule`. */
  readonly compteARebours: 'revelation' | 'nouveau_texte';
  /** « Déjà joué aujourd'hui », un groupe par cercle éveillé, dans l'ordre d'entrée ; un cercle où personne n'a joué
   *  n'y figure pas, et la ligne disparaît si aucun (E10). Jamais qui n'a pas joué. */
  readonly dejaJoue: readonly { readonly cercle: string; readonly visages: readonly Visage[] }[];
};

/** Aujourd'hui : 1.12, 1.13, 2.1, 2.3, 2.4, 2.5, 5.8, 5.10, 5.12, 5.13. Le serveur choisit l'étape et la manche. */
export type Aujourdhui = {
  /** Le jour civil à Paris, en mots : « jeudi » (en-tête « Aujourd'hui · jeudi »). */
  readonly jour: string;
  readonly repere: Repere;
  /** « Il faut trois joueurs pour deviner. » quand aucun de ses cercles n'a trois membres actifs (5.10, 5.13, 1.13). */
  readonly bandeau: 'cercle_incomplet' | null;
  /** « Tu as rejoint {nom}. », une seule fois (1.12). */
  readonly arrivee: { readonly cercle: CercleCourt } | null;
  /** La ligne en haut d'Aujourd'hui, jusqu'au prochain 18h (E3, mots d'UX) : `finir` (« Finir la révélation › »), elle
   *  reprend à `Revelation.reprise` ; `revoir` (« Revoir la révélation › »), elle a été lue jusqu'à la fin ; null. */
  readonly revoirRevelation: 'finir' | 'revoir' | null;
  readonly etape: EtapeDeviner | EtapeRepondre | EtapeEnAttendant;
};

export type EnvoiCercle = { readonly cercle: IdCercle };
export type EnvoiPoser = { readonly carte: IdCarte; readonly visage: IdMembre | null };
export type EnvoiPourquoi = { readonly carte: IdCarte; readonly raison: RangRaison };
export type EnvoiPasser = { readonly carte: IdCarte };
export type EnvoiReponseDuJour = { readonly texte: IdTexte; readonly position: Position; readonly raison: ChoixRaison };

/** Réponse à `POST /api/repondre`. `enRetard` : la réponse est arrivée entre 18h00 et 18h10, acceptée parce que l'écran
 *  Répondre s'était affiché avant 18h (R10, règle 6) ; sa phrase du jour se montre une fois, puis la révélation. */
export type ReponseFaite = {
  readonly aujourdhui: Aujourdhui;
  readonly enRetard: { readonly phraseDuJour: string } | null;
};

// ============================================================================================================
// 9. La révélation de 18h, la fiche d'un texte
// ============================================================================================================

/** juste : le visage posé est l'auteur ; jumeau : un proche qui avait donné exactement la même réponse (D-024) ;
 *  `_et_raison` : la personne et la raison cachée sont justes (R5). */
export type Verdict = 'juste' | 'juste_et_raison' | 'jumeau' | 'jumeau_et_raison' | 'faux' | 'passe';

export type CarteRevelee = {
  readonly position: Position;
  readonly raison: RaisonAffichee | 'aucune' | 'cachee';
  /** « Ton pari : Paul. » (avec « parce que « … » » sur la carte cachée) ; null : carte passée ou vide.
   *  `parti` : le membre que tu avais désigné a quitté le cercle (ou tout effacé) après 18h. La carte garde son verdict
   *  et son point, mais la révélation et « Revoir la révélation » ne montrent plus le pari : ni pseudo, ni « un ancien
   *  membre », ni « … avait répondu la même chose. », seulement le verdict et « C'était {auteur}. » (D-067 ; CONTRAT.md,
   *  partie 3). Distinct de null, qui dit une carte passée ou vidée par un départ avant 18h. Servi à l'étape 2 ; mots :
   *  UX (verdict faux sans pari : à confirmer avec UX, avis de Game design). */
  readonly pari: { readonly visage: Visage; readonly pourquoi: RaisonAffichee | null } | 'parti' | null;
  /** « C'était Hugo. » Pour deux cartes identiques servies ensemble, l'auteur est déjà réattribué (R4). */
  readonly auteur: Visage;
  readonly verdict: Verdict;
  /** « Sa raison : « … » » sur la carte cachée, sauf si personne et raison sont trouvées (R5). */
  readonly saRaison: RaisonAffichee | null;
};

/** L'avis du cercle (D-025), dès trois réponses (règle 10) ; jamais un pourcentage, jamais la réponse du joueur marquée. */
export type AvisCercle = {
  /** « Ton cercle, lui, l'aurait adopté. » (ou « rejeté », ou « était partagé »). */
  readonly ligne: string;
  /** Le nombre de réponses à chaque position, de Très défavorable à Très favorable. */
  readonly comptes: readonly [number, number, number, number, number];
  /** La mention du milieu : une position, ou deux si le nombre de réponses est pair et qu'elles diffèrent. */
  readonly milieu: readonly Position[];
};

/** Une étape de la révélation, dans l'ordre de D-011 et de la règle 10, calculé par le serveur : les attributions cercle
 *  par cercle (dans l'ordre d'entrée), le vote et l'avis de chaque cercle, les auteurs, les badges rares cercle par
 *  cercle, puis le dimanche les titres, la surprise de la semaine de chaque cercle et ta phrase de la semaine. La fin
 *  (2.7f) est un écran de l'application. `id` : opaque, stable du 18h au 18h suivant, sert à reprendre (E3). */
export type EtapeRevelation =
  | {
      readonly id: string;
      readonly type: 'attribution';
      readonly cercle: CercleCourt;
      /** « 2 sur 3 » dans la manche de ce cercle. */
      readonly rang: number;
      readonly total: number;
      readonly carte: CarteRevelee;
      /** Sur la dernière carte du cercle : « 1 point aujourd'hui · 4 cette semaine » (2.7c, tes points seulement) ;
       *  null sur les autres. */
      readonly points: { readonly aujourdhui: number; readonly semaine: number } | null;
    }
  | {
      readonly id: string;
      readonly type: 'vote';
      readonly vote: VoteAffiche;
      /** Un avis par cercle qui a au moins trois réponses, jamais additionnés (D-025, règle 10) ; vide sinon. */
      readonly avis: readonly { readonly cercle: CercleCourt; readonly avis: AvisCercle }[];
    }
  | {
      readonly id: string;
      readonly type: 'auteurs';
      readonly auteurTexte: string;
      /** null si le joueur n'a pas répondu à ce texte, ou a répondu « aucune ». */
      readonly taRaison: string | null;
    }
  | {
      readonly id: string;
      readonly type: 'badge';
      readonly badge: Badge;
      readonly cercle: CercleCourt;
      /** « Inès décroche Le Sans-Faute. » (3.2) ; plusieurs le même soir sont possibles (règle 14). */
      readonly titulaires: readonly Visage[];
    }
  | {
      readonly id: string;
      readonly type: 'titre';
      readonly cercle: CercleCourt;
      readonly titre: Titre;
      /** Au moins un : un titre sans titulaire n'a pas d'étape (R6). */
      readonly titulaires: readonly Visage[];
    }
  | {
      readonly id: string;
      readonly type: 'surprise_semaine';
      readonly cercle: CercleCourt;
      readonly texte: TexteNomme;
    }
  | {
      readonly id: string;
      readonly type: 'phrase_semaine';
      /** Faite par le serveur (règle 18, R2, R12) ; l'étape n'existe pas les dimanches sans phrase. */
      readonly phrase: string;
      /** Ton curseur sur la tension de la phrase, ton portrait entier (3.3e). */
      readonly curseur: CurseurAffiche;
    };

/** 2.7a à 2.7f, 3.2, 3.3a à 3.3e : une seule révélation pour tous tes cercles (règle 3), valable du 18h au 18h suivant. */
export type Revelation = {
  /** Le texte révélé ce soir (bandeau, « Le texte et ses sources » à la fin) ; null s'il n'y en a pas pour toi
   *  (un dimanche où seuls les titres tombent). */
  readonly texte: TexteNomme | null;
  /** Au moins une étape. */
  readonly etapes: readonly EtapeRevelation[];
  /** L'étape où reprendre (E3), la dernière vue ; null : depuis le début. Si cette étape a disparu (un départ, règle 4),
   *  le serveur donne la suivante. */
  readonly reprise: string | null;
};

/** 5.4. Avant la révélation : le texte et ta réponse seulement, sans lien officiel. */
export type Fiche = {
  readonly id: IdTexte;
  readonly titre: string;
  readonly lignes: Lignes;
  readonly taReponse: ReponseAffichee | null;
  readonly revelation:
    | { readonly faite: false; /** « Le vote et les auteurs : vendredi à 18h » */ readonly quand: string }
    | {
        readonly faite: true;
        /** « révélé jeudi » */
        readonly quand: string;
        readonly vote: VoteAffiche;
        readonly auteurTexte: string;
        /** Les quatre raisons et leurs députés (« Nadia Ferrand, Les Démocrates »), dans l'ordre d'affichage. */
        readonly raisons: readonly { readonly texte: string; readonly depute: string }[];
        readonly lienScrutin: string;
        /** La ligne d'erratum, si le texte a été corrigé (règle 20) : « Corrigé le 12 novembre : … ». */
        readonly erratum: string | null;
      };
};

// ============================================================================================================
// 10. Moi, les Réglages, les droits, l'effacement
// ============================================================================================================

/** La barre « Ton portrait se dessine » : 60 crans (règle 18), visible de toi seul (D-026). */
export type Barre = {
  readonly crans: number;
  readonly total: number;
};

/** 4.1 et 5.11 : ton portrait entier (règle 19 : tu vois tout). */
export type Moi = {
  readonly pseudo: string;
  /** Les huit curseurs, dans l'ordre de la règle 19 : nets d'abord (du plus éloigné du milieu au plus proche, puis du
   *  plus grand poids), puis les flous (du plus étroit au plus large), puis l'ordre des tensions. */
  readonly curseurs: readonly CurseurAffiche[];
  /** Tous tes tempéraments (R9), dans l'ordre L'Original, Le Pont, Le Mesuré, Le Tranché. */
  readonly temperaments: readonly TemperamentAffiche[];
  /** null une fois pleine et montrée (règle 18). */
  readonly barre: Barre | null;
  /** La ligne sous la barre ou au-dessus des curseurs (mots validés, règle 18 et 5.11) :
   *  `pas_encore_forme` : « Chaque réponse le précise. Il faut environ trois mois pour les premiers curseurs nets. »
   *  (barre pas pleine et aucun curseur net) ; `barre_pleine` : « Ta barre est pleine. Ton portrait, lui, continue. »,
   *  une fois, puis `POST /api/vu { objet: 'barre_pleine' }` ; `se_precisent` : « Tes curseurs se précisent à chaque
   *  réponse, chacun à son rythme. » (barre partie, aucun curseur net) ; null sinon. */
  readonly ligne: 'pas_encore_forme' | 'barre_pleine' | 'se_precisent' | null;
};

/** 5.2 : tes titres, semaine par semaine, sans total (R7), et tes tempéraments en tête. */
export type MesTitres = {
  readonly temperaments: readonly TemperamentAffiche[];
  readonly semaines: readonly {
    /** « Semaine du 26 mai » */
    readonly semaine: string;
    readonly titres: readonly { readonly distinction: Titre | Badge; readonly cercle: string }[];
  }[];
};

export type LigneHistorique = {
  readonly texte: IdTexte;
  /** « Jeudi 3 avril », ou « Pour commencer · 4 mars » pour un texte d'entrée (E6). Le jour d'un texte du jour est son
   *  jour de jeu : le texte du jeudi s'ouvre le mercredi à 18h et se révèle le vendredi à 18h (CONTRAT.md, partie 3 ;
   *  maquette 5.3). */
  readonly quand: string;
  readonly titre: string;
  readonly position: Position;
  /** null pour un texte d'entrée (pas de phrase du jour, règle 15). */
  readonly phraseDuJour: string | null;
  /** « révélé vendredi à 18h », ou null si pas encore révélé. */
  readonly revelation: string | null;
  /** « Texte corrigé après ta réponse. » (mots d'UX) : vrai si le texte est sorti des portraits, erratum de sorte
   *  `repondu` (règle 20). */
  readonly corrige: boolean;
};

/** 5.3 : tes réponses, de la plus récente à la plus ancienne, textes d'entrée compris (E6). */
export type Historique = {
  readonly lignes: readonly LigneHistorique[];
};

/** 5.7 : les Réglages. Jamais l'adresse e-mail : elle n'est pas gardée (seule son empreinte l'est). */
export type Reglages = {
  readonly pseudo: string;
  /** « Connecté avec Apple » (mots d'UX). */
  readonly voie: Voie;
  readonly cercles: readonly CercleCourt[];
  /** Le message de 18h, de notre côté : coupé ici, il ne part plus vers aucun de ses appareils (D-029). L'accord
   *  d'iOS, lui, se lit dans le téléphone. */
  readonly message: { readonly actif: boolean };
};

/** Les blancs de « Qui, durée, droits » (N6), réglés par le porteur chez l'hébergeur, jamais écrits dans le dépôt. */
export type Droits = {
  /** « [Prénom Nom] » */
  readonly responsable: string;
  /** « [Prénom] », seul, là où le texte de Juridique le demande. */
  readonly prenom: string;
  /** « [adresse e-mail] » de contact. */
  readonly contact: string;
};

/** `POST /api/tout-effacer`. `apple` : pour un compte Apple, ce que rend la feuille d'Apple montrée à la confirmation
 *  (N14), qui sert à révoquer le lien chez Apple sans rien garder ; null si le joueur l'a fermée, pour un autre compte
 *  ou pour un joueur provisoire. L'effacement se fait dans tous les cas. */
export type EnvoiToutEffacer = {
  readonly confirmation: 'tout-effacer';
  readonly apple: { readonly codeAutorisation: string } | null;
};

export type ToutEfface = {
  readonly efface: true;
  /** La voie du compte, pour le texte d'après de N14 ; null pour un joueur provisoire. */
  readonly voie: Voie | null;
  /** Vrai si le lien a été révoqué chez Apple ; faux sinon : N14 dit alors comment le retirer soi-même. */
  readonly revoque: boolean;
};

// ============================================================================================================
// 11. Le message de 18h, la version, les mesures
// ============================================================================================================

/** `POST /api/abonnement` : le jeton d'appareil que donne iOS (APNs), en hexadécimal, après l'accord d'iOS. */
export type EnvoiAbonnement = {
  readonly jeton: string;
};

/** Le contenu d'un message, envoyé à Apple (APNs) sans intermédiaire. Apple peut le lire : il ne contient rien de
 *  personnel, sauf le pseudo de l'annonce d'arrivée (P-05). Le texte est fait par le serveur (E1). */
export type MessageApns = {
  readonly aps: {
    readonly alert: { readonly title: 'Elenchos'; readonly body: string };
    readonly sound: 'default';
    /** Fait passer le message par l'extension de l'application, qui signale la réception (`POST /api/recu`). */
    readonly 'mutable-content': 1;
  };
  /** Le numéro d'envoi, tiré au hasard, sans lien avec le joueur. */
  readonly envoi: string;
};

/** Les textes possibles du message de 18h (E1, D-014). Liste fermée : un texte nouveau ne part pas sans son test (P-05). */
export const MESSAGES_18H = [
  '18h. Qui avait dit quoi ? La révélation d’hier t’attend, et la question d’aujourd’hui.',
  '18h. Le vote de l’Assemblée t’attend, et la question d’aujourd’hui.',
  '18h. La question d’aujourd’hui t’attend.',
  '18h. Qui avait dit quoi ? La révélation d’hier t’attend, et la question d’aujourd’hui. Ce soir, aussi : les titres de la semaine.',
  '18h. Le vote de l’Assemblée t’attend, et la question d’aujourd’hui. Ce soir, aussi : les titres de la semaine.',
  '18h. La question d’aujourd’hui t’attend. Ce soir, aussi : les titres de la semaine.',
] as const;
export type Message18h = (typeof MESSAGES_18H)[number];

/** Les textes possibles de l'annonce d'arrivée envoyée en message (UX ; à relire par Juridique). Sans le score, qui
 *  reste à l'écran (`AnnonceArrivee.texte`, D-011) : un message s'affiche sur l'écran verrouillé et passe par Apple.
 *  Le premier quand le créateur doit deviner cet invité, le second sinon. Le serveur remplace {pseudo} ; liste fermée,
 *  comme `MESSAGES_18H` (P-05). */
export const MESSAGES_ARRIVEE = [
  '{pseudo} a relevé ton défi. À ton tour de deviner {pseudo}.',
  '{pseudo} a relevé ton défi.',
] as const;
export type MessageArrivee = (typeof MESSAGES_ARRIVEE)[number];

/** Gestes que l'application signale (mesures sur des gestes, jamais sur une réponse : D-041, P-39).
 *  `cercle_pendant_deviner` : Le Cercle ou l'écran d'un proche ouvert pendant une manche pas encore validée
 *  (`produit.md` §8, « Qui regarde Le Cercle pour deviner »). */
export const GESTES = ['cercle_pendant_deviner'] as const;
export type Geste = (typeof GESTES)[number];

/** Liens arrêtés avant le premier texte, comptés sans rien garder de la personne (N2 ; page d'invitation) : `android`,
 *  `ordinateur`, `ipad` (page web, ou application ouverte sur un iPad) ; `iphone_sans_application` (la page d'invitation
 *  s'est affichée sur un iPhone : l'application n'y est pas encore). */
export const SORTES_COMPTEUR = ['android', 'ordinateur', 'ipad', 'iphone_sans_application'] as const;
export type SorteCompteur = (typeof SORTES_COMPTEUR)[number];

/** Comptés par le serveur lui-même, au moment du geste, en totaux par jour, sans rien garder de la personne (D-066,
 *  point 4) ; jamais pour un joueur qui a refusé qu'on compte ses gestes (D-066, point 3 : la base l'exclut) :
 *  - les réponses du jour refusées après 18h (`texte_ferme`), et celles acceptées en retard (R10) : ils diront si
 *    18h10 est bien réglé ;
 *  - `revelation_ouverte` et `revelation_ouverte_le_soir` : la première ouverture d'une révélation (`POST /api/vu`,
 *    objet `revelation`), et parmi elles celles du soir même (« le soir » : défini par Game design) ;
 *  - `cercle_pendant_deviner` : le geste `POST /api/geste`, une fois par manche (le verrou `manche.cercle_regarde`) ;
 *  - `message_envoye` et `message_recu` : le message de 18h envoyé, puis reçu (`POST /api/recu`) ; « message reçu »
 *    (D-005, condition 2). Les envois ne sont gardés en détail que 7 jours. */
export const SORTES_COMPTEUR_SERVEUR = [
  'reponse_refusee_apres_18h', 'reponse_en_retard', 'revelation_ouverte', 'revelation_ouverte_le_soir',
  'cercle_pendant_deviner', 'message_envoye', 'message_recu',
] as const;
export type SorteCompteurServeur = (typeof SORTES_COMPTEUR_SERVEUR)[number];

/** Ce qu'on marque comme vu, sans heure. `revelation` (première ouverture) déclenche aussi les compteurs du jour
 *  `revelation_ouverte` et `revelation_ouverte_le_soir` (D-066, point 4). `arrivee` et `cercle_lance` portent le cercle
 *  concerné, et s'effacent au départ de ce cercle ; les autres, `cercle: null`. */
export const OBJETS_VU = ['revelation', 'arrivee', 'cercle_lance', 'annonces', 'barre_pleine'] as const;
export type ObjetVu = (typeof OBJETS_VU)[number];

/** `POST /api/duree-raison` : la durée de l'écran de la raison (2.4), en secondes entières, plafonnée à 600. Rangée
 *  aussitôt dans un histogramme de la semaine, jamais sous l'identifiant du joueur, ni par texte (P-40). */
export type EnvoiDureeRaison = { readonly secondes: number };

// ============================================================================================================
// 12. Le développement local (jamais en ligne : CONTRAT.md, partie 5)
// ============================================================================================================

export type EnvoiConnexionEssai = { readonly code: string };
export type EnvoiHorloge = { readonly aller: 'bascule' | 'dix_secondes_avant' | 'dimanche_bascule' };

// ============================================================================================================
// 13. Le catalogue des routes
// ============================================================================================================

/** Erreurs qui peuvent toucher toute route, en plus de celles de la route. */
export type ErreurCommune = 'requete_invalide' | 'origine_refusee' | 'mise_a_jour_requise' | 'trop_de_demandes' | 'erreur_serveur';

type Route<Envoi, Recu, Erreurs extends CodeErreur> = {
  readonly envoi: Envoi;
  readonly recu: Recu;
  readonly erreurs: Erreurs | ErreurCommune;
};

/** `GET /api/etat` ne répond jamais `mise_a_jour_requise` : c'est par elle qu'une fabrication trop ancienne apprend
 *  `fabricationMinimale` et montre l'écran de mise à jour. */
type RouteEtat<Recu> = {
  readonly envoi: null;
  readonly recu: Recu;
  readonly erreurs: Exclude<ErreurCommune, 'mise_a_jour_requise'>;
};

type AvecSession = 'non_connecte';
/** Un cercle désigné qui n'est pas un des siens répond comme un cercle qui n'existe pas. */
type AvecCercle = 'non_connecte' | 'introuvable';

/** Chaque route JSON : ce qu'envoie l'application, ce qu'elle reçoit dans `donnees`, les erreurs possibles.
 *  Les navigations (pages web, retour de Google, fichier d'association) sont décrites dans CONTRAT.md, 2.5 et 2.14. */
export type Routes = {
  'GET /api/etat': RouteEtat<Etat>;
  // Le lien, la carte, le défi
  'POST /api/lien': Route<{ readonly jeton: string }, LienOuvert, never>;
  'GET /api/accord': Route<null, CarteAccord, never>;
  'POST /api/accord': Route<EnvoiAccord, AccordEnregistre, 'accord_perime' | 'lien_expire' | 'lien_deja_servi' | 'etape_incorrecte'>;
  'GET /api/entree': Route<null, Entree, AvecSession | 'etape_incorrecte'>;
  'POST /api/entree/repondre': Route<
    EnvoiReponseEntree,
    RevelationEntree,
    AvecSession | 'accord_requis' | 'deja_repondu' | 'etape_incorrecte' | 'lien_expire' | 'lien_deja_servi'
  >;
  'GET /api/entree/bilan': Route<null, BilanEntree, AvecSession | 'etape_incorrecte'>;
  // Le compte et la connexion
  'GET /api/compte': Route<null, EcranCompte, never>;
  'POST /api/compte/pseudo': Route<{ readonly pseudo: string }, { readonly accepte: true }, AvecSession | 'pseudo_pris' | 'pseudo_invalide' | 'etape_incorrecte'>;
  'POST /api/connexion/debut': Route<EnvoiDebutConnexion, DebutConnexion, 'etape_incorrecte' | 'indisponible'>;
  'POST /api/connexion/apple': Route<EnvoiConnexionApple, ResultatConnexion, 'connexion_expiree' | 'etape_incorrecte'>;
  'POST /api/connexion/echanger': Route<EnvoiEchangeConnexion, ResultatConnexion, 'connexion_expiree' | 'etape_incorrecte'>;
  'POST /api/compte/email': Route<{ readonly adresse: string }, { readonly minutes: number }, 'adresse_invalide' | 'trop_de_codes' | 'indisponible' | 'etape_incorrecte'>;
  'POST /api/compte/code': Route<{ readonly code: string }, ResultatConnexion, 'code_faux' | 'code_expire' | 'trop_essais' | 'etape_incorrecte'>;
  'GET /api/rejoindre': Route<null, EcranRejoindre, AvecSession | 'etape_incorrecte'>;
  'POST /api/rejoindre': Route<
    { readonly pseudo: string | null },
    { readonly cercle: CercleCourt },
    AvecSession | 'pseudo_pris' | 'pseudo_invalide' | 'cercle_complet' | 'trois_cercles' | 'etape_incorrecte' | 'lien_expire'
  >;
  // Les cercles
  'GET /api/cercles': Route<null, MesCercles, AvecSession | 'etape_incorrecte'>;
  'POST /api/cercle': Route<{ readonly nom: string }, { readonly cercle: CercleCourt }, AvecSession | 'nom_invalide' | 'trois_cercles' | 'etape_incorrecte'>;
  'POST /api/cercle/voir': Route<EnvoiCercle, Cercle, AvecCercle>;
  'POST /api/cercle/titres': Route<EnvoiCercle, TitresPasses, AvecCercle>;
  'POST /api/cercle/quitter': Route<
    { readonly cercle: IdCercle; readonly confirmation: 'quitter' },
    { readonly quitte: true },
    AvecCercle
  >;
  'POST /api/proche': Route<{ readonly cercle: IdCercle; readonly membre: IdMembre }, Proche, AvecCercle>;
  'POST /api/inviter/voir': Route<EnvoiCercle, EcranInviter, AvecCercle>;
  'POST /api/inviter': Route<
    { readonly cercle: IdCercle; readonly accordVersion: string },
    LienCree,
    AvecCercle | 'accord_perime' | 'cercle_complet'
  >;
  'GET /api/miroir': Route<null, Miroir, AvecSession | 'rien_a_deviner'>;
  'POST /api/miroir/parier': Route<
    { readonly cercle: IdCercle; readonly texte: IdTexte; readonly pari: Position },
    MiroirRevele,
    AvecCercle | 'rien_a_deviner' | 'etape_incorrecte'
  >;
  // La journée
  'GET /api/aujourdhui': Route<null, Aujourdhui, AvecSession | 'etape_incorrecte'>;
  'POST /api/deviner/ouvrir': Route<EnvoiCercle, Aujourdhui, AvecCercle | 'manche_fermee' | 'etape_incorrecte'>;
  'POST /api/deviner/poser': Route<
    EnvoiPoser,
    Aujourdhui,
    AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue' | 'visage_non_propose' | 'visage_deja_pose'
  >;
  'POST /api/deviner/pourquoi': Route<EnvoiPourquoi, Aujourdhui, AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue' | 'pourquoi_sans_visage'>;
  'POST /api/deviner/passer': Route<EnvoiPasser, Aujourdhui, AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue'>;
  'POST /api/deviner/valider': Route<EnvoiCercle, Aujourdhui, AvecCercle | 'manche_fermee' | 'deja_validee'>;
  'POST /api/repondre/ouvrir': Route<{ readonly texte: IdTexte }, { readonly note: true }, AvecSession | 'texte_ferme' | 'etape_incorrecte'>;
  'POST /api/repondre': Route<EnvoiReponseDuJour, ReponseFaite, AvecSession | 'accord_requis' | 'texte_ferme' | 'deja_repondu' | 'etape_incorrecte'>;
  // La révélation, la fiche
  'GET /api/revelation': Route<null, Revelation, AvecSession | 'rien_a_reveler'>;
  'POST /api/revelation/etape': Route<{ readonly etape: string | 'fin' }, { readonly note: true }, AvecSession | 'rien_a_reveler'>;
  'POST /api/fiche': Route<{ readonly texte: IdTexte }, Fiche, AvecSession | 'pas_encore_revele' | 'introuvable'>;
  'POST /api/vu': Route<{ readonly objet: ObjetVu; readonly cercle: IdCercle | null }, { readonly note: true }, AvecSession | 'introuvable'>;
  // Moi, Réglages, droits
  'GET /api/moi': Route<null, Moi, AvecSession | 'etape_incorrecte'>;
  'GET /api/moi/titres': Route<null, MesTitres, AvecSession | 'etape_incorrecte'>;
  'GET /api/moi/historique': Route<null, Historique, AvecSession | 'etape_incorrecte'>;
  'GET /api/reglages': Route<null, Reglages, AvecSession | 'etape_incorrecte'>;
  'POST /api/message': Route<{ readonly actif: boolean }, { readonly actif: boolean }, AvecSession>;
  'GET /api/droits': Route<null, Droits, 'indisponible'>;
  /** Accepté en session provisoire (« Effacer mes réponses », 1.8) ; `voie` est null pour un joueur provisoire. */
  'POST /api/tout-effacer': Route<EnvoiToutEffacer, ToutEfface, AvecSession>;
  'POST /api/deconnexion': Route<null, { readonly deconnecte: true }, never>;
  // Le message de 18h, les mesures
  'POST /api/abonnement': Route<EnvoiAbonnement, { readonly abonne: true }, AvecSession | 'abonnement_invalide' | 'indisponible'>;
  'POST /api/geste': Route<{ readonly geste: Geste }, { readonly note: true }, AvecSession>;
  'POST /api/duree-raison': Route<EnvoiDureeRaison, { readonly note: true }, AvecSession>;
  'POST /api/compteur': Route<{ readonly sorte: SorteCompteur }, { readonly note: true }, never>;
  // Développement local seulement : en ligne, ces deux routes n'existent pas (réponse `introuvable`).
  'POST /dev/connexion': Route<EnvoiConnexionEssai, { readonly jeton: JetonSession }, 'introuvable' | 'code_faux'>;
  'POST /dev/horloge': Route<EnvoiHorloge, { readonly instant: Instant }, 'introuvable'>;
};

/** `POST /api/recu`, envoyée par l'extension de l'application seule, sans session : `{ envoi }`, réponse 204 sans
 *  corps (repris de test-18h). */
export type EnvoiRecu = { readonly envoi: string };

// ============================================================================================================
// 14. Le fichier des textes (jeu/textes/FORMAT.md)
// ============================================================================================================

/** Les huit tensions, dans l'ordre de la règle 16, avec les mots de D-053 (pôle 0, pôle 1). Les codes sont internes,
 *  jamais affichés. `sansArticle` sert après « Entre » dans la phrase du dimanche : le libellé unique de E2, sans son
 *  article (regles.md, J9 : « Entre décision locale et décision nationale, … »). */
export const TENSIONS = {
  S: { pole0: 'la sécurité', pole1: 'la liberté', sansArticle: ['sécurité', 'liberté'] },
  EM: { pole0: 'l’égalité', pole1: 'le mérite', sansArticle: ['égalité', 'mérite'] },
  SR: { pole0: 'la solidarité collective', pole1: 'la responsabilité individuelle', sansArticle: ['solidarité collective', 'responsabilité individuelle'] },
  P: { pole0: 'la précaution', pole1: 'l’innovation', sansArticle: ['précaution', 'innovation'] },
  T: { pole0: 'la tradition', pole1: 'le changement', sansArticle: ['tradition', 'changement'] },
  SO: { pole0: 'l’indépendance', pole1: 'l’ouverture', sansArticle: ['indépendance', 'ouverture'] },
  EP: { pole0: 'l’État', pole1: 'le privé', sansArticle: ['État', 'privé'] },
  L: { pole0: 'la décision locale', pole1: 'la décision nationale', sansArticle: ['décision locale', 'décision nationale'] },
} as const;
export type CodeTension = keyof typeof TENSIONS;

export type RoleTexte = 'entree' | 'jour' | 'reserve';

export type GroupePermis = {
  /** Nom officiel en toutes lettres (E5), égal au `libelle` de l'organe. */
  readonly libelle: string;
  readonly chambre: 'assemblee' | 'senat';
  /** Numéro de législature pour l'Assemblée ; null pour le Sénat. */
  readonly legislature: number | null;
  /** Identifiant de l'organe dans l'open data (« PO845454 »). */
  readonly identifiant: string;
};

export type CommissionPermise = {
  /** Libellé court, minuscule au début, commençant par « commission ». */
  readonly libelle: string;
  readonly identifiant: string;
};

export type Elu = {
  /** Prénom et nom, tels qu'affichés. */
  readonly nom: string;
  /** Vrai : « députée », « sénatrice ». */
  readonly feminin: boolean;
  /** Un `libelle` de `groupes`, ou null pour un député non inscrit (« sans groupe »). */
  readonly groupe: string | null;
};

export type AuteurDuTexte =
  | ({ readonly type: 'depute' | 'senateur'; readonly depot: DateCivile } & Elu)
  | { readonly type: 'gouvernement'; readonly depot: DateCivile }
  | { readonly type: 'commission'; readonly libelle: string; readonly depot: DateCivile };

export type VoteDuTexte = {
  readonly objet: 'texte' | 'article' | 'amendement' | 'motion' | 'resolution';
  readonly issue: 'adopte' | 'rejete';
  readonly etape: 'navette' | 'definitif' | 'aucune';
  readonly date: DateCivile;
  readonly suite: null | 'texte_tombe' | 'texte_retire';
  /** Vrai pour une motion de rejet adoptée par les partisans du texte pour un motif de procédure : ne compte pas
   *  comme un rejet (D-028, règle d'application de Contenu). */
  readonly rejetDeProcedure: boolean;
};

export type RaisonDuTexte = {
  /** « r1 » à « r4 », dans l'ordre choisi par Contenu ; l'ordre d'affichage est tiré à part (FORMAT.md, partie 4). */
  readonly id: 'r1' | 'r2' | 'r3' | 'r4';
  /** Le côté que défend l'argument : `pour` = favorable au texte. */
  readonly cote: 'pour' | 'contre';
  /** La valeur que sert l'argument : 0, 1, ou `aucun` (raison pratique, hors de la tension). */
  readonly pole: 0 | 1 | 'aucun';
  /** L'argument, sans guillemets, avec sa ponctuation finale. */
  readonly texte: string;
  readonly depute: Elu & { readonly elision: 'de' | "d'" };
  readonly source: {
    /** La page du compte rendu, sur www.assemblee-nationale.fr. */
    readonly adresse: string;
    /** Le jour de la séance : le groupe est celui de ce jour-là (E5, règle du moment). */
    readonly date: DateCivile;
    /** Les mots du député, recopiés tels quels. Jamais envoyés au téléphone : ils servent aux vérifications. */
    readonly extrait: string;
  };
};

export type TexteDuLot = {
  /** « T01 » à « T99 ». */
  readonly id: IdTexte;
  readonly role: RoleTexte;
  /** Entrée : 1 à 3 (ordre du défi). Jour : 1 à n, contigu (ordre du calendrier). Réserve : 1 à r. */
  readonly rang: number;
  readonly titre: string;
  readonly lignes: Lignes;
  readonly tension: CodeTension;
  /** 0 si être favorable sert le pôle 0 de la tension, 1 s'il sert le pôle 1. */
  readonly sens: 0 | 1;
  /** La commission saisie au fond (un `libelle` de `commissions`). */
  readonly commission: string;
  readonly auteur: AuteurDuTexte;
  readonly vote: VoteDuTexte;
  readonly scrutin: { readonly legislature: number; readonly numero: number };
  readonly lienScrutin: string;
  readonly raisons: readonly [RaisonDuTexte, RaisonDuTexte, RaisonDuTexte, RaisonDuTexte];
  readonly erratum: null | {
    readonly date: DateCivile;
    /** `revele` : erreur sur ce qu'on apprend à 18h ; `repondu` : erreur sur ce à quoi on a répondu, le texte sort des
     *  portraits ; `etiquette` : erreur sur le pôle d'une raison ou le sens du texte, jamais montrés, les curseurs sont
     *  recalculés (règle 20). */
    readonly sorte: 'revele' | 'repondu' | 'etiquette';
    readonly texte: string;
  };
  /** SHA-256, en hexadécimal, du JSON canonique du texte sans ce champ (FORMAT.md, partie 5). */
  readonly empreinte: string;
};

export type FichierTextes = {
  readonly format: 'elenchos-textes/1';
  readonly lot: {
    readonly nom: string;
    /** Vrai pour un fichier d'exemple : seuls les contrôles texte par texte s'appliquent. */
    readonly exemple: boolean;
    readonly etat: 'provisoire' | 'final';
    readonly date: DateCivile;
  };
  readonly groupes: readonly GroupePermis[];
  readonly commissions: readonly CommissionPermise[];
  readonly textes: readonly TexteDuLot[];
};
