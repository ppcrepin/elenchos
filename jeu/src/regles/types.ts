// Les types propres au moteur de règles. Ils ne dépendent pas de `jeu/src/contrat.ts` (le contrat de l'interface) :
// le moteur calcule, le serveur traduit en écrans.
//
// Le jour de jeu (regles.md, section 2) : il va de 18h à 18h, heure de Paris. Un `Jour` est le numéro du jour civil de
// Paris où il FINIT à 18h, compté en jours depuis le 1970-01-01 (voir `heure.ts`). Le « jour de jeu du jeudi » commence
// le mercredi à 18h et finit le jeudi à 18h ; il porte le numéro du jeudi. Le texte du jour d est celui auquel on répond
// pendant le jour de jeu d ; la manche du jour d devine le texte du jour d − 1 ; sa révélation tombe à la fin du jour d
// (lecture A, D-010). Le texte qui s'ouvre à 18h le jour civil d est donc celui du jour de jeu d + 1. `jeu/CONTRAT.md`
// (partie 3) nomme les textes de la même façon.

import type { Fraction } from './fraction.ts';

export type Jour = number;
export type IdMembre = string;
export type IdTexte = string;
export type IdCercle = string;

/** 1 Très défavorable, 2 Défavorable, 3 Neutre, 4 Favorable, 5 Très favorable. */
export type Niveau = 1 | 2 | 3 | 4 | 5;
export type RangRaison = 1 | 2 | 3 | 4;
export type ChoixRaison = RangRaison | 'aucune';
export type Pole = 0 | 1;
export type PoleRaison = Pole | 'aucun';
/** -1 défavorable, 0 neutre, 1 favorable. */
export type Cote = -1 | 0 | 1;

/** Les huit tensions, codes internes (règle 16 ; jeu/textes/FORMAT.md, partie 6). */
export type CodeTension = 'S' | 'EM' | 'SR' | 'P' | 'T' | 'SO' | 'EP' | 'L';

export type RaisonDuTexte = {
  readonly rang: RangRaison;
  /** L'argument défend une position favorable (« pour ») ou défavorable (« contre »). */
  readonly cote: 'pour' | 'contre';
  /** La valeur que sert l'argument, ou « aucun » (raison hors tension). */
  readonly pole: PoleRaison;
};

export type TexteMoteur = {
  readonly id: IdTexte;
  readonly tension: CodeTension;
  /** Le pôle que sert « favorable ». */
  readonly sens: Pole;
  readonly raisons: readonly RaisonDuTexte[];
  /** Règle 20 : le texte est sorti des portraits (erreur sur ce à quoi on a répondu). Les réponses restent ; elles ne
   *  comptent plus dans aucun curseur. Une erreur d'étiquette se corrige en donnant les bonnes `raisons`. */
  readonly retireDesPortraits?: boolean;
};

export type ReponseMoteur = { readonly niveau: Niveau; readonly raison: ChoixRaison };

/** Une réponse d'un joueur, datée. Une personne répond une fois à un texte, pour tous ses cercles (règle 3). */
export type ReponseDatee = {
  readonly texte: TexteMoteur;
  readonly reponse: ReponseMoteur;
  /** Texte d'entrée (règle 15) : compte pour le portrait et la barre, jamais pour les points ni les titres. */
  readonly entree: boolean;
  /** Texte du jour : le jour de jeu du texte (une réponse en retard garde le jour de son texte). Entrée : le jour de
   *  jeu où la réponse a été donnée. */
  readonly jour: Jour;
  /** Instant d'enregistrement (ms UTC) : l'ordre des réponses, pour « juste avant » (Le Pas de Côté, règle 14). */
  readonly instant: number;
  /** Règle 6 : acceptée entre 18h et 18h10. Elle compte partout, mais n'est jamais servie à deviner. */
  readonly tardive?: boolean;
};

export type Classe = 'arbitrage' | 'penchant' | 'tiraille' | 'neutre';

/** Règle 17 : la classe d'une réponse, son poids w et le pôle vers lequel elle compte. */
export type Classement = {
  readonly classe: Classe;
  readonly w: Fraction;
  readonly pole: Pole | null;
};

/** Les sommes d'un curseur : W = Σw et Σwπ (π vaut 0 ou 1). */
export type Sommes = { readonly W: Fraction; readonly Swp: Fraction };

export type Curseur = {
  readonly c: Fraction;
  readonly l: Fraction;
  readonly W: Fraction;
  readonly net: boolean;
};

export type Portrait = Readonly<Record<CodeTension, Curseur>>;

/** Un membre d'un cercle. `id` désigne l'adhésion : qui part puis revient entre avec un nouvel identifiant (règle 4,
 *  « il entre comme un nouveau membre »), et ses anciens titres restent sous « un ancien membre ». */
export type MembreCercle = {
  readonly id: IdMembre;
  /** Le jour de jeu de son arrivée dans ce cercle. Il était membre à la fermeture du texte du jour d si
   *  `jourArrivee <= d`. */
  readonly jourArrivee: Jour;
};

export type Temperament = 'original' | 'pont' | 'mesure' | 'tranche';
export const ORDRE_TEMPERAMENTS: readonly Temperament[] = ['original', 'pont', 'mesure', 'tranche'];
