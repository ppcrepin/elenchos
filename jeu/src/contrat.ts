// Le contrat entre le serveur et l'interface, version de test (phase 0, D-060).
// Rédigé par Back-end et Front-end ensemble, 15 octobre 2026. Prose et règles : jeu/CONTRAT.md ; format des textes :
// jeu/textes/FORMAT.md.
//
// Ce fichier ne contient que des types, et les listes fermées dont ils dérivent (des constantes, sans logique).
// - Le serveur l'importe (`import type { … } from './contrat.ts'`) ; il se lit avec Node 22, sans fabrication
//   (`erasableSyntaxOnly` : ni enum, ni namespace, ni propriété de paramètre).
// - L'interface ne l'importe jamais à l'exécution : elle s'en sert dans ses commentaires JSDoc, vérifiés par `tsc`,
//   par exemple `/** @typedef {import('../src/contrat.ts').Aujourdhui} Aujourdhui */`.
//
// Trois règles tiennent tout le fichier :
// 1. Liste fermée (P-27) : un type contient ce que l'écran montre, rien de plus. Un champ ajouté ici « au cas où »
//    est une faute, même s'il ne contient rien de sensible.
// 2. Le serveur calcule, l'interface montre : aucun type ne demande à l'interface d'appliquer une règle du jeu
//    (verdicts, seuils, phrases, ordre des cartes, avis du cercle, titres sont rendus déjà faits).
// 3. Rien avant 18h (P-26) : aucun type servi avant la révélation ne porte le vote, un auteur, l'auteur d'une carte
//    ou l'avis du cercle, même sous une forme cachée.

// ============================================================================================================
// 1. Briques communes
// ============================================================================================================

/** Un instant, en ISO 8601 UTC : « 2026-11-20T17:00:00.000Z ». */
export type Instant = string;

/** Un jour civil à Paris : « 2026-11-20 ». */
export type DateCivile = string;

/** La position sur cinq niveaux : 1 Très défavorable, 2 Défavorable, 3 Neutre, 4 Favorable, 5 Très favorable.
 *  Les mots sont fixes : ils vivent dans l'interface. */
export type Position = 1 | 2 | 3 | 4 | 5;

/** Le rang d'affichage d'une raison (1 à 4), dans l'ordre tiré une fois par texte (jeu/textes/FORMAT.md, partie 4). */
export type RangRaison = 1 | 2 | 3 | 4;

/** Ce que le joueur choisit comme raison : une des quatre, ou « aucune ». */
export type ChoixRaison = RangRaison | 'aucune';

/** L'identifiant public d'un texte, celui du fichier des textes (« T07 »). */
export type IdTexte = string;

/** Le numéro d'une carte de Deviner : tiré au hasard pour chaque joueur et chaque jour, jamais relié à un membre (P-26). */
export type IdCarte = string;

/** Le numéro d'un membre dans son cercle : tiré au hasard à l'entrée dans le cercle. Ce n'est jamais l'identifiant
 *  du joueur en base (P-01) ; il ne sert qu'à désigner un visage. */
export type IdMembre = string;

/** Un visage : ce que le cercle voit d'un membre (P-27 : pseudo et rond, rien d'autre). */
export type Visage = {
  readonly id: IdMembre;
  readonly pseudo: string;
  /** Une ou deux lettres, uniques dans le cercle (E7). */
  readonly rond: string;
};

/** Les trois lignes d'un texte. */
export type Lignes = readonly [string, string, string];

/** Une raison telle qu'elle s'affiche : son rang et son argument, sans guillemets (l'interface les ajoute). */
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

/** Les voies de connexion offertes. `email` est faux tant que l'envoi d'e-mails n'est pas réglé (pas de domaine, D-060). */
export type Voies = {
  readonly apple: boolean;
  readonly google: boolean;
  readonly email: boolean;
};

// ============================================================================================================
// 2. L'enveloppe de chaque échange, et l'heure du serveur
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

/** Toute réponse JSON du serveur (sauf `POST /api/recu`, qui répond 204 sans corps). */
export type Reponse<T> =
  | {
      readonly ok: true;
      /** La version du code en ligne. Si elle change, l'interface se recharge (icône restée sur un ancien code). */
      readonly version: string;
      readonly horloge: Horloge;
      readonly donnees: T;
    }
  | {
      readonly ok: false;
      readonly version: string;
      readonly horloge: Horloge;
      readonly erreur: CodeErreur;
    };

// ============================================================================================================
// 3. Les erreurs (liste fermée)
// ============================================================================================================

export const CODES_ERREUR = [
  // Communes à toutes les routes
  'requete_invalide', // 400 : corps illisible, champ manquant ou en trop, valeur hors liste
  'non_connecte', // 401 : la route demande une session (provisoire ou compte)
  'origine_refusee', // 403 : POST qui ne vient pas de la page elle-même
  'introuvable', // 404 : route inconnue (et toute route /dev/ en ligne)
  'trop_de_demandes', // 429 : limiteur
  'erreur_serveur', // 500
  'indisponible', // 503 : fonction coupée faute de réglage (voie e-mail sans domaine, message de 18h sans clé)
  // Ordre du parcours
  'etape_incorrecte', // 409 : la demande ne correspond pas à l'étape où en est le joueur
  'accord_requis', // 409 : la carte de consentement (ou sa nouvelle version) doit être acceptée avant (P-34)
  'accord_perime', // 409 : la version de la carte, ou de la phrase d'invitation, envoyée n'est plus la bonne
  // Le temps
  'texte_ferme', // 409 : le texte s'est fermé à 18h (pas de retard en test, contenu-test.md)
  'manche_fermee', // 409 : la manche s'est fermée à 18h
  'pas_encore_revele', // 409 : fiche demandée avant la révélation du texte
  'rien_a_reveler', // 409 : aucune révélation jusqu'au prochain 18h
  'rien_a_deviner', // 409 : pas de manche miroir (1.11)
  // Les gestes
  'deja_repondu', // 409
  'deja_validee', // 409 : la manche est validée, rien ne change plus (règle 9)
  'carte_inconnue', // 409
  'visage_non_propose', // 409 : ce visage n'est pas proposé sur cette manche (règle 8)
  'visage_deja_pose', // 409 : chaque visage une fois (règle 8)
  'pourquoi_sans_visage', // 409 : le « pourquoi » se choisit une fois le visage posé (règle 9)
  // Le lien, le compte, le cercle
  'lien_deja_servi', // 410 : le lien s'est lié à un autre appareil entre-temps (P-29)
  'lien_expire', // 410
  'cercle_complet', // 409 : dix membres (règle 1)
  'pseudo_pris', // 422 (E7)
  'pseudo_invalide', // 422
  'nom_invalide', // 422 : nom du cercle
  'adresse_invalide', // 422 : adresse e-mail
  'code_faux', // 422
  'code_expire', // 422 : 15 minutes (P-41)
  'trop_essais', // 429 : 5 essais par code (P-41)
  'trop_de_codes', // 429 : codes demandés pour une même adresse (P-41)
  'passage_refuse', // 410 : code de passage inconnu, expiré ou déjà servi (partie 4 du contrat)
  'abonnement_invalide', // 422
] as const;
export type CodeErreur = (typeof CODES_ERREUR)[number];

// ============================================================================================================
// 4. Démarrer : l'état du joueur
// ============================================================================================================

export type ModeEntree = 'createur' | 'invite';

/** Où en est le joueur. L'interface en tire l'écran à montrer, avec le contexte de l'appareil (CONTRAT.md, 2.1). */
export type Parcours =
  /** Pas de session : N1, N9, ou l'ouverture d'un lien (`POST /api/lien`). */
  | { readonly etape: 'dehors' }
  /** Session provisoire, défi en cours : `faits` textes déjà répondus. */
  | { readonly etape: 'entree'; readonly mode: ModeEntree; readonly invitant: Visage | null; readonly faits: 0 | 1 | 2 }
  /** Session provisoire, trois textes répondus, pas encore de compte : bilan (1.7, N16), puis compte (1.8). */
  | { readonly etape: 'entree_finie'; readonly mode: ModeEntree }
  /** Compte de créateur sans cercle : 5.1. */
  | { readonly etape: 'nommer_cercle' }
  /** Compte dans un cercle : les trois onglets. */
  | { readonly etape: 'jeu' };

/** Ce qu'une connexion par Apple ou Google (retour de navigation) a donné, dit une seule fois. */
export type RefusConnexion =
  | 'refus_fournisseur' // le joueur a annulé chez Apple ou Google
  | 'compte_organisation' // compte Google d'employeur ou de lycée (P-41)
  | 'compte_inconnu' // « J'ai déjà un compte », mais aucun compte avec cette voie
  | 'deja_dans_un_cercle' // N12
  | 'cercle_complet' // N15
  | 'pseudo_pris' // le pseudo a été pris pendant la connexion : retour à 1.8
  | 'connexion_echouee';

/** L'annonce d'arrivée faite au créateur, tant que le cercle a moins de trois membres (1.10 ; D-006, D-011). */
export type AnnonceArrivee = {
  readonly visage: Visage;
  /** Faite par le serveur, la même que le message : « Marie a trouvé 2 de tes 3 réponses. À ton tour de deviner Marie. » */
  readonly texte: string;
  /** Vrai si le créateur doit deviner cet invité (son premier invité, quand ils sont deux : D-006, D-058). */
  readonly aDeviner: boolean;
};

export type Etat = {
  readonly session: 'aucune' | 'provisoire' | 'compte';
  readonly parcours: Parcours;
  /** Faux si une nouvelle version de la carte attend l'accord : la carte passe avant la prochaine réponse (P-34). */
  readonly accordAJour: boolean;
  /** Vrai à la première ouverture après 18h, tant que la révélation n'a pas été vue (E3). */
  readonly revelationAOuvrir: boolean;
  readonly annonces: readonly AnnonceArrivee[];
  readonly refusConnexion: RefusConnexion | null;
  readonly voies: Voies;
  /** La clé publique des messages (RFC 8292), ou null si le message de 18h est coupé. */
  readonly message: { readonly clePublique: string | null };
};

// ============================================================================================================
// 5. Le lien, la carte de consentement, le défi
// ============================================================================================================

/** Ce que donne un lien (créateur ou invitation). Les issues attendues sont des données, pas des erreurs. */
export type LienOuvert =
  | {
      readonly etat: 'ouvert';
      readonly mode: ModeEntree;
      /** null pour un lien de créateur. Jamais une réponse de l'invitant (P-29). */
      readonly invitant: Visage | null;
      readonly premierTexte: TexteARepondre;
    }
  /** 5.14 et N13 : « Demande-en une nouvelle à {pseudo}. » */
  | { readonly etat: 'expire' | 'deja_servi'; readonly invitant: string | null }
  /** Lien illisible ou inconnu : N13 sans prénom. */
  | { readonly etat: 'inconnu' }
  /** N15 */
  | { readonly etat: 'complet' }
  /** N12 */
  | { readonly etat: 'deja_dans_un_cercle' }
  /** Une entrée est déjà en cours dans ce navigateur : on la reprend. */
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

export type Entree =
  | {
      readonly etat: 'texte';
      readonly mode: ModeEntree;
      readonly invitant: Visage | null;
      readonly rang: 1 | 2 | 3;
      readonly texte: TexteARepondre;
    }
  | { readonly etat: 'finie' };

export type EnvoiReponseEntree = {
  readonly texte: IdTexte;
  readonly position: Position;
  readonly raison: ChoixRaison;
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

/** 1.7 pour l'invité, N16 pour le créateur. */
export type BilanEntree = { readonly mode: 'createur' } | ({ readonly mode: 'invite' } & BilanDefi);

// ============================================================================================================
// 6. Le compte
// ============================================================================================================

/** 1.8 (N7), N9, et « J'ai déjà un compte » (N1, N13). Le texte « Pourquoi Elenchos ? » ne vient qu'avec `creation`. */
export type EcranCompte = {
  readonly but: 'creation' | 'connexion';
  readonly pour: ModeEntree | null;
  readonly invitant: Visage | null;
  /** Le pseudo déjà accepté, s'il y en a un (retour d'Apple ou de Google avec un refus). */
  readonly pseudo: string | null;
  readonly voies: Voies;
};

export type ResultatConnexion = { readonly etat: 'connecte' } | { readonly etat: RefusConnexion };

// ============================================================================================================
// 7. Le cercle, l'invitation, le miroir
// ============================================================================================================

export type EcranInviter = {
  /** La phrase de consentement de l'invitant (P-35), servie avec sa version : « Tu envoies tes 3 réponses à la
   *  personne que tu invites. Ce lien est pour elle seule. » */
  readonly accord: { readonly version: string; readonly phrase: string };
  /** « Liens envoyés : 2 » : les liens créés par ce joueur et encore valables. */
  readonly liensEnvoyes: number;
  /** Faux sous trois membres : « Il faut être trois pour lancer le cercle. » */
  readonly lance: boolean;
  /** Vrai à dix membres : plus d'« Inviter » (règle 1, N15). */
  readonly complet: boolean;
};

export type LienCree = {
  /** L'adresse complète, jeton après « # » (P-08) : « https://…/#lien=… ». */
  readonly lien: string;
};

/** 1.11 : le créateur devine son premier invité, texte par texte, puis son bilan. */
export type Miroir =
  | { readonly etat: 'texte'; readonly invite: Visage; readonly rang: 1 | 2 | 3; readonly texte: { readonly id: IdTexte; readonly titre: string } }
  | ({ readonly etat: 'bilan' } & BilanDefi);

export type MiroirRevele = {
  readonly rang: 1 | 2 | 3;
  readonly pari: { readonly position: Position; readonly verdict: 'juste' | 'faux' };
  readonly reponseInvite: ReponseAffichee;
};

export type MembreDuCercle = {
  readonly visage: Visage;
  readonly moi: boolean;
  /** Les titres de la semaine, un par ligne (E10). Les mots (« Le Devin ») sont dans l'interface. */
  readonly titres: readonly Titre[];
};

export type Titre = 'devin' | 'mystere' | 'fidele';

/** 4.2, 1.15, 5.9 et 5.13 fondus, N15. */
export type Cercle = {
  readonly nom: string;
  /** Rangés par ordre d'arrivée (E10). */
  readonly membres: readonly MembreDuCercle[];
  readonly lance: boolean;
  readonly complet: boolean;
  /** `cercle_lance` une seule fois (1.15) ; `cercle_incomplet` sous trois membres (5.13). */
  readonly bandeau: 'cercle_lance' | 'cercle_incomplet' | null;
};

// ============================================================================================================
// 8. La journée
// ============================================================================================================

export type Repere = {
  /** `rien` : « rien hier », jamais barré (D-038). */
  readonly deviner: 'en_cours' | 'fait' | 'a_venir' | 'rien';
  readonly repondre: 'en_cours' | 'fait' | 'a_venir';
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
  /** La manche existe mais l'écran ne s'est jamais affiché : l'interface appelle `POST /api/deviner/ouvrir` en le
   *  montrant. Une manche jamais ouverte n'a pas de cartes (R10). */
  | { readonly type: 'deviner'; readonly ouverte: false; readonly nomCercle: string }
  | {
      readonly type: 'deviner';
      readonly ouverte: true;
      readonly nomCercle: string;
      readonly texteHier: TexteCourt;
      /** Dans l'ordre de la manche ; la carte cachée en dernier. */
      readonly cartes: readonly CarteADeviner[];
      /** Les visages proposés, par ordre d'arrivée (règle 8). */
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
  /** « Déjà joué aujourd'hui » ; vide, la ligne disparaît (E10). */
  readonly dejaJoue: readonly Visage[];
};

/** Aujourd'hui : 1.12, 1.13, 2.1, 2.3, 2.4, 2.5, 5.10, 5.12, 5.13. Le serveur choisit l'étape. */
export type Aujourdhui = {
  /** Le jour civil à Paris, en mots : « jeudi » (en-tête « Aujourd'hui · jeudi »). */
  readonly jour: string;
  readonly repere: Repere;
  /** « Il faut trois joueurs pour deviner. » sous trois membres (5.13, 5.10, 1.13). */
  readonly bandeau: 'cercle_incomplet' | null;
  /** « Tu as rejoint {nom}. », une seule fois (1.12). */
  readonly arrivee: { readonly nomCercle: string } | null;
  /** La ligne « Revoir la révélation », jusqu'au prochain 18h (E3). */
  readonly revoirRevelation: boolean;
  readonly etape: EtapeDeviner | EtapeRepondre | EtapeEnAttendant;
};

export type EnvoiPoser = { readonly carte: IdCarte; readonly visage: IdMembre | null };
export type EnvoiPourquoi = { readonly carte: IdCarte; readonly raison: RangRaison };
export type EnvoiPasser = { readonly carte: IdCarte };
export type EnvoiReponseDuJour = { readonly texte: IdTexte; readonly position: Position; readonly raison: ChoixRaison };

// ============================================================================================================
// 9. La révélation de 18h, la fiche d'un texte
// ============================================================================================================

/** juste : le visage posé est l'auteur ; jumeau : un proche qui avait donné exactement la même réponse (D-024) ;
 *  `_et_raison` : la personne et la raison cachée sont justes (R5). */
export type Verdict = 'juste' | 'juste_et_raison' | 'jumeau' | 'jumeau_et_raison' | 'faux' | 'passe';

export type CarteRevelee = {
  readonly position: Position;
  readonly raison: RaisonAffichee | 'aucune' | 'cachee';
  /** « Ton pari : Paul. » (avec « parce que « … » » sur la carte cachée) ; null : carte passée ou vide. */
  readonly pari: { readonly visage: Visage; readonly pourquoi: RaisonAffichee | null } | null;
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

export type RevelationTexte = {
  readonly id: IdTexte;
  readonly titre: string;
  readonly nomCercle: string;
  /** Dans l'ordre de la manche. null : la manche ne s'est jamais ouverte, ou il n'y avait pas de cartes ; la
   *  révélation commence au vote (R10, E1). */
  readonly attributions: readonly CarteRevelee[] | null;
  readonly vote: VoteAffiche;
  /** null sous trois réponses : ni ligne, ni graphique, ni phrase de remplacement (règle 10). */
  readonly avisCercle: AvisCercle | null;
  readonly auteurTexte: string;
  /** null si le joueur n'a pas répondu à ce texte, ou a répondu « aucune ». */
  readonly taRaison: string | null;
};

export type TitresSemaine = {
  readonly nomCercle: string;
  /** Chacun seulement s'il a un titulaire (R6). */
  readonly devin: Visage | null;
  readonly mystere: Visage | null;
  readonly fideles: readonly Visage[];
};

/** 2.7a à 2.7f, 3.3a à 3.3c sur un écran. Au moins une des deux parties est présente. */
export type Revelation = {
  readonly texte: RevelationTexte | null;
  /** Le dimanche, s'il y a au moins un titulaire. */
  readonly titres: TitresSemaine | null;
};

/** 5.4 allégée. Avant la révélation : le texte et ta réponse seulement, sans lien officiel. */
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
        /** La ligne d'erratum, si le texte a été corrigé (règle 20, allégée). */
        readonly erratum: string | null;
      };
};

// ============================================================================================================
// 10. Moi, les droits, l'effacement
// ============================================================================================================

export type LigneHistorique = {
  readonly texte: IdTexte;
  /** « Jeudi 3 avril », ou « Pour commencer · 4 mars » pour un texte d'entrée (E6). */
  readonly quand: string;
  readonly titre: string;
  readonly position: Position;
  /** null pour un texte d'entrée (pas de phrase du jour, règle 15). */
  readonly phraseDuJour: string | null;
  /** « révélé vendredi à 18h », ou null si pas encore révélé. */
  readonly revelation: string | null;
};

/** 4.1 et 5.11 allégés, 5.3 fondu dedans, 5.7 allégé. */
export type Moi = {
  readonly visage: Visage;
  /** « Ton portrait se dessine » : 60 crans (règle 18). null une fois montrée pleine. Visible de soi seul (D-026). */
  readonly barre: { readonly crans: number; readonly total: number; readonly pleine: boolean } | null;
  /** Les réponses, de la plus récente à la plus ancienne. */
  readonly historique: readonly LigneHistorique[];
  /** N14 : ajouter « Tes titres passés restent, sous « un ancien membre ». » */
  readonly aDesTitres: boolean;
};

/** Les deux blancs de « Qui, durée, droits » (N6), réglés par le porteur, jamais écrits dans le dépôt. */
export type Droits = {
  readonly responsable: string;
  readonly contact: string;
};

// ============================================================================================================
// 11. L'icône, le message de 18h, les mesures
// ============================================================================================================

export type CodePassage = {
  /** 32 octets tirés au hasard, en base64url. À placer après « # » : « /#passage=… » (partie 4 du contrat). */
  readonly code: string;
  readonly minutes: number;
};

export type EnvoiAbonnement = {
  readonly abonnement: {
    readonly endpoint: string;
    readonly keys: { readonly p256dh: string; readonly auth: string };
  };
};

/** Le contenu d'un message (forme « Declarative Web Push » d'iOS 18.4, lue aussi par `sw.js` avant iOS 18.4).
 *  Chiffré pour le seul téléphone (P-06). Le texte est fait par le serveur (E1). */
export type MessagePush = {
  readonly web_push: 8030;
  readonly mutable: true;
  readonly notification: {
    readonly title: string;
    readonly lang: 'fr';
    /** L'adresse de la page, sans rien d'autre : l'icône s'ouvre, puis `Etat` mène à la révélation. */
    readonly navigate: string;
    readonly data: { readonly envoi: string };
  };
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

/** Gestes que l'interface signale (mesures sur des gestes, jamais sur une réponse : D-041, P-39). */
export const GESTES = ['ouverture_icone'] as const;
export type Geste = (typeof GESTES)[number];

/** Liens arrêtés avant le premier texte, comptés sans personne (contenu-test.md, partie 5 ; N2, N3). */
export const SORTES_COMPTEUR = ['android', 'ordinateur', 'ipad', 'hors_safari'] as const;
export type SorteCompteur = (typeof SORTES_COMPTEUR)[number];

/** Ce qu'on marque comme vu. `revelation` sert aussi la mesure « révélation ouverte le soir même ». */
export const OBJETS_VU = ['revelation', 'arrivee', 'cercle_lance', 'annonces', 'barre_pleine'] as const;
export type ObjetVu = (typeof OBJETS_VU)[number];

// ============================================================================================================
// 12. Le développement local (jamais en ligne : CONTRAT.md, partie 5)
// ============================================================================================================

export type EnvoiConnexionEssai = { readonly code: string };
export type EnvoiHorloge = { readonly aller: 'bascule' | 'dix_secondes_avant' | 'dimanche_bascule' };

// ============================================================================================================
// 13. Le catalogue des routes
// ============================================================================================================

/** Erreurs qui peuvent toucher toute route, en plus de celles de la route. */
export type ErreurCommune = 'requete_invalide' | 'origine_refusee' | 'trop_de_demandes' | 'erreur_serveur';

type Route<Envoi, Recu, Erreurs extends CodeErreur> = {
  readonly envoi: Envoi;
  readonly recu: Recu;
  readonly erreurs: Erreurs | ErreurCommune;
};

type AvecSession = 'non_connecte';

/** Chaque route JSON : ce qu'envoie l'interface, ce qu'elle reçoit dans `donnees`, les erreurs possibles.
 *  Les navigations (`GET /`, `GET /connexion/…`, `POST /connexion/…/retour`) sont décrites dans CONTRAT.md, 2.5. */
export type Routes = {
  'GET /api/etat': Route<null, Etat, never>;
  'POST /api/lien': Route<{ readonly jeton: string }, LienOuvert, never>;
  'GET /api/accord': Route<null, CarteAccord, never>;
  'POST /api/accord': Route<EnvoiAccord, { readonly enregistre: true }, 'accord_perime' | 'lien_expire' | 'lien_deja_servi' | 'etape_incorrecte'>;
  'GET /api/entree': Route<null, Entree, AvecSession | 'etape_incorrecte'>;
  'POST /api/entree/repondre': Route<
    EnvoiReponseEntree,
    RevelationEntree,
    AvecSession | 'accord_requis' | 'deja_repondu' | 'etape_incorrecte' | 'lien_expire' | 'lien_deja_servi'
  >;
  'GET /api/entree/bilan': Route<null, BilanEntree, AvecSession | 'etape_incorrecte'>;
  'GET /api/compte': Route<null, EcranCompte, never>;
  'POST /api/compte/pseudo': Route<{ readonly pseudo: string }, { readonly accepte: true }, AvecSession | 'pseudo_pris' | 'pseudo_invalide' | 'etape_incorrecte'>;
  'POST /api/compte/email': Route<{ readonly adresse: string }, { readonly minutes: number }, 'adresse_invalide' | 'trop_de_codes' | 'indisponible' | 'etape_incorrecte'>;
  'POST /api/compte/code': Route<{ readonly code: string }, ResultatConnexion, 'code_faux' | 'code_expire' | 'trop_essais' | 'etape_incorrecte'>;
  'POST /api/cercle': Route<{ readonly nom: string }, { readonly cree: true }, AvecSession | 'nom_invalide' | 'etape_incorrecte'>;
  'GET /api/inviter': Route<null, EcranInviter, AvecSession | 'etape_incorrecte'>;
  'POST /api/inviter': Route<{ readonly accordVersion: string }, LienCree, AvecSession | 'accord_perime' | 'cercle_complet' | 'etape_incorrecte'>;
  'GET /api/miroir': Route<null, Miroir, AvecSession | 'rien_a_deviner'>;
  'POST /api/miroir/parier': Route<{ readonly texte: IdTexte; readonly pari: Position }, MiroirRevele, AvecSession | 'rien_a_deviner' | 'etape_incorrecte'>;
  'GET /api/aujourdhui': Route<null, Aujourdhui, AvecSession | 'etape_incorrecte'>;
  'POST /api/deviner/ouvrir': Route<null, Aujourdhui, AvecSession | 'manche_fermee' | 'etape_incorrecte'>;
  'POST /api/deviner/poser': Route<
    EnvoiPoser,
    Aujourdhui,
    AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue' | 'visage_non_propose' | 'visage_deja_pose'
  >;
  'POST /api/deviner/pourquoi': Route<EnvoiPourquoi, Aujourdhui, AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue' | 'pourquoi_sans_visage'>;
  'POST /api/deviner/passer': Route<EnvoiPasser, Aujourdhui, AvecSession | 'manche_fermee' | 'deja_validee' | 'carte_inconnue'>;
  'POST /api/deviner/valider': Route<null, Aujourdhui, AvecSession | 'manche_fermee' | 'deja_validee'>;
  'POST /api/repondre': Route<EnvoiReponseDuJour, Aujourdhui, AvecSession | 'accord_requis' | 'texte_ferme' | 'deja_repondu' | 'etape_incorrecte'>;
  'GET /api/revelation': Route<null, Revelation, AvecSession | 'rien_a_reveler'>;
  'POST /api/fiche': Route<{ readonly texte: IdTexte }, Fiche, AvecSession | 'pas_encore_revele' | 'introuvable'>;
  'POST /api/vu': Route<{ readonly objet: ObjetVu }, { readonly note: true }, AvecSession>;
  'GET /api/cercle': Route<null, Cercle, AvecSession | 'etape_incorrecte'>;
  'GET /api/moi': Route<null, Moi, AvecSession | 'etape_incorrecte'>;
  'GET /api/droits': Route<null, Droits, 'indisponible'>;
  'POST /api/passage': Route<null, CodePassage, AvecSession>;
  'POST /api/passage/echanger': Route<{ readonly code: string }, { readonly connecte: true }, 'passage_refuse'>;
  'POST /api/abonnement': Route<EnvoiAbonnement, { readonly abonne: true }, AvecSession | 'abonnement_invalide' | 'indisponible'>;
  'POST /api/geste': Route<{ readonly geste: Geste }, { readonly note: true }, AvecSession>;
  'POST /api/compteur': Route<{ readonly sorte: SorteCompteur }, { readonly note: true }, never>;
  'POST /api/tout-effacer': Route<{ readonly confirmation: 'tout-effacer' }, { readonly efface: true }, AvecSession>;
  'POST /api/deconnexion': Route<null, { readonly deconnecte: true }, never>;
  // Développement local seulement : en ligne, ces deux routes n'existent pas (réponse `introuvable`).
  'POST /dev/connexion': Route<EnvoiConnexionEssai, { readonly connecte: true }, 'introuvable' | 'code_faux'>;
  'POST /dev/horloge': Route<EnvoiHorloge, { readonly instant: Instant }, 'introuvable'>;
};

/** `POST /api/recu`, envoyée par `sw.js` seul, sans cookie : `{ envoi }`, réponse 204 sans corps (repris de test-18h). */
export type EnvoiRecu = { readonly envoi: string };

// ============================================================================================================
// 14. Le fichier des textes (jeu/textes/FORMAT.md)
// ============================================================================================================

/** Les huit tensions, dans l'ordre de la règle 16, avec les mots de D-053 (pôle 0, pôle 1). Les codes sont internes,
 *  jamais affichés. `court` sert après « Entre » dans les phrases (convention de l'essai, tensions.md, partie 1). */
export const TENSIONS = {
  S: { pole0: 'la sécurité', pole1: 'la liberté', court: ['sécurité', 'liberté'] },
  EM: { pole0: 'l’égalité', pole1: 'le mérite', court: ['égalité', 'mérite'] },
  SR: { pole0: 'la solidarité collective', pole1: 'la responsabilité individuelle', court: ['solidarité', 'responsabilité'] },
  P: { pole0: 'la précaution', pole1: 'l’innovation', court: ['précaution', 'innovation'] },
  T: { pole0: 'la tradition', pole1: 'le changement', court: ['tradition', 'changement'] },
  SO: { pole0: 'l’indépendance', pole1: 'l’ouverture', court: ['indépendance', 'ouverture'] },
  EP: { pole0: 'l’État', pole1: 'le privé', court: ['État', 'privé'] },
  L: { pole0: 'la décision locale', pole1: 'la décision nationale', court: ['local', 'national'] },
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
  /** Entrée : 1 à 3 (ordre du défi). Jour : 1 à 28 (ordre du calendrier). Réserve : 1 à 3. */
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
    /** `revele` : erreur sur ce qu'on apprend à 18h ; `repondu` : erreur sur ce à quoi on a répondu (règle 20). */
    readonly sorte: 'revele' | 'repondu';
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
