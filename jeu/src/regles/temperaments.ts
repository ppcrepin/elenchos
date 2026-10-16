// Les tempéraments (règle 13), chaque dimanche au moment des titres, sur les 56 derniers jours de jeu.
// Portage de `calculerTemperaments` (essai 2), avec ces écarts, regles.md l'emporte :
// - L'Original : son côté réunit au plus un tiers des réponses du cercle à ce texte, lui compris (l'essai : « seul de
//   son côté ») ; seuil par taille : 2/5 à 3 membres, 1/3 à 4, 1/4 dès 5 (l'essai : 3/10 partout) ;
// - Le Pont : les Neutre font au plus un tiers des réponses du texte (l'essai : « seul au milieu ») ; seuil 1/4 (essai : 1/8) ;
// - Le Mesuré et Le Tranché valent pour toute la personne, sur toutes ses réponses (l'essai ne comptait que les textes
//   à 3 réponses dans son cercle unique) ;
// - un tempérament obtenu se garde tant que la part reste aux 4/5 du seuil (marge absente de l'essai).
//
// Lectures du moteur (regles.md ne les dit pas, à confirmer par Game design) :
// - la fenêtre est celle des textes révélés pendant ces 56 jours de jeu, c'est-à-dire les textes des jours
//   dimanche − 56 à dimanche − 1 : le texte du dimanche n'est révélé que le lundi (lecture A) ; c'était l'essai ;
// - « au moins 20 réponses » : pour L'Original et Le Pont, 20 réponses à des textes qui comptent (au moins 3 réponses
//   dans le cercle) ; pour Le Mesuré et Le Tranché, 20 réponses en tout ;
// - « une première réponse vieille de 56 jours au moins » : jour de cette réponse ≤ dimanche − 56 ; dans le cercle,
//   c'est le jour d'arrivée.

import { REGLES, seuilOriginal } from './constantes.ts';
import { F, type Fraction } from './fraction.ts';
import { cote } from './portrait.ts';
import type { IdMembre, Jour, Niveau, Temperament } from './types.ts';

export type ComptesTemperament = {
  /** Réponses à des textes qui comptent dans ce cercle (au moins 3 réponses). */
  readonly reponsesCercle: number;
  /** Textes où son côté réunit au plus un tiers des réponses (jamais un Neutre). */
  readonly cotePeuSuivi: number;
  /** Textes partagés (les autres : au moins un favorable et un défavorable). */
  readonly textesPartages: number;
  /** Parmi eux, ceux où il a répondu Neutre et où les Neutre font au plus un tiers des réponses. */
  readonly neutreAuMilieu: number;
  /** Toutes ses réponses de la fenêtre (Le Mesuré, Le Tranché). */
  readonly reponses: number;
  readonly neutres: number;
  readonly tres: number;
};

/** La fenêtre des tempéraments au dimanche `dimanche` : les jours de jeu des textes qui comptent. */
export function fenetreTemperaments(dimanche: Jour): { readonly premier: Jour; readonly dernier: Jour } {
  return { premier: dimanche - REGLES.temperamentFenetre, dernier: dimanche - 1 };
}

/**
 * Les comptes d'une personne. `textesDuCercle` : pour chaque texte du jour de la fenêtre, les positions des membres
 * actuels du cercle qui y ont répondu (retard compris). `sesReponses` : ses positions aux textes du jour de la fenêtre,
 * tous cercles confondus.
 */
export function comptesTemperament(
  personne: IdMembre,
  textesDuCercle: readonly ReadonlyMap<IdMembre, Niveau>[],
  sesReponses: readonly Niveau[],
): ComptesTemperament {
  let reponsesCercle = 0;
  let cotePeuSuivi = 0;
  let textesPartages = 0;
  let neutreAuMilieu = 0;
  for (const t of textesDuCercle) {
    const sienne = t.get(personne);
    if (sienne === undefined || t.size < REGLES.temperamentReponsesTexteMin) continue;
    reponsesCercle += 1;
    const n = t.size;
    const toutes = [...t.values()].map(cote);
    const autres = [...t.entries()].filter(([m]) => m !== personne).map(([, v]) => cote(v));
    const cs = cote(sienne);
    const tiers = (k: number): boolean => F(k, n).infEgal(REGLES.originalPartCoteMax);
    if (cs !== 0 && tiers(toutes.filter((c) => c === cs).length)) cotePeuSuivi += 1;
    if (autres.some((c) => c > 0) && autres.some((c) => c < 0)) {
      textesPartages += 1;
      if (cs === 0 && F(toutes.filter((c) => c === 0).length, n).infEgal(REGLES.pontPartNeutreMax)) neutreAuMilieu += 1;
    }
  }
  return {
    reponsesCercle,
    cotePeuSuivi,
    textesPartages,
    neutreAuMilieu,
    reponses: sesReponses.length,
    neutres: sesReponses.filter((v) => cote(v) === 0).length,
    tres: sesReponses.filter((v) => v === 1 || v === 5).length,
  };
}

/**
 * Règle 13 : les tempéraments d'une personne dans un cercle, au dimanche.
 * `tailleCercle` : membres actuels, en pause compris. `precedents` : ceux qu'elle avait (cercle pour L'Original et
 * Le Pont, personne pour Le Mesuré et Le Tranché), pour la marge des 4/5.
 */
export function temperaments(entree: {
  readonly dimanche: Jour;
  readonly comptes: ComptesTemperament;
  readonly tailleCercle: number;
  /** Le jour de jeu de sa première réponse dans ce cercle (son arrivée). */
  readonly premiereReponseCercle: Jour;
  /** Le jour de jeu de sa toute première réponse. */
  readonly premiereReponse: Jour;
  readonly precedents: ReadonlySet<Temperament>;
}): { readonly cercle: readonly Temperament[]; readonly personne: readonly Temperament[] } {
  const { comptes: n, dimanche, precedents } = entree;
  const ancien = (premier: Jour): boolean => premier <= dimanche - REGLES.temperamentAnciennete;
  const atteint = (t: Temperament, part: Fraction, seuil: Fraction): boolean =>
    part.supEgal(precedents.has(t) ? seuil.fois(REGLES.temperamentMarge) : seuil);
  const cercle: Temperament[] = [];
  const personne: Temperament[] = [];
  if (ancien(entree.premiereReponseCercle) && n.reponsesCercle >= REGLES.temperamentReponsesMin) {
    if (atteint('original', F(n.cotePeuSuivi, n.reponsesCercle), seuilOriginal(entree.tailleCercle))) cercle.push('original');
    if (n.textesPartages >= REGLES.pontTextesMin && atteint('pont', F(n.neutreAuMilieu, n.textesPartages), REGLES.pontSeuil)) cercle.push('pont');
  }
  if (ancien(entree.premiereReponse) && n.reponses >= REGLES.temperamentReponsesMin) {
    if (atteint('mesure', F(n.neutres, n.reponses), REGLES.mesureSeuil)) personne.push('mesure');
    if (atteint('tranche', F(n.tres, n.reponses), REGLES.trancheSeuil)) personne.push('tranche');
  }
  return { cercle, personne };
}

const NOMS: Readonly<Record<Temperament, string>> = { original: "L'Original", pont: 'Le Pont', mesure: 'Le Mesuré', tranche: 'Le Tranché' };
const ORDRE: readonly Temperament[] = ['original', 'pont', 'mesure', 'tranche'];

/** Règle 13, sous un visage : un par ligne, L'Original, Le Pont, Le Mesuré, Le Tranché ; L'Original et Le Pont de ce
 *  cercle, Le Mesuré et Le Tranché de la personne (affichés dans chacun de ses cercles, lecture de R9). */
export function sousLeVisage(duCercle: readonly Temperament[], dePersonne: readonly Temperament[]): string[] {
  const tous = new Set<Temperament>([...duCercle.filter((t) => t === 'original' || t === 'pont'), ...dePersonne.filter((t) => t === 'mesure' || t === 'tranche')]);
  return ORDRE.filter((t) => tous.has(t)).map((t) => NOMS[t]);
}

/** Règle 13, dans Moi : tous, avec le nom du cercle pour L'Original et Le Pont (« Le Pont (Famille) »), dans l'ordre
 *  des tempéraments, puis dans l'ordre d'entrée dans les cercles. */
export function dansMoi(parCercle: readonly { readonly nom: string; readonly temperaments: readonly Temperament[] }[], dePersonne: readonly Temperament[]): string[] {
  const r: string[] = [];
  for (const t of ORDRE) {
    if (t === 'original' || t === 'pont') {
      for (const c of parCercle) if (c.temperaments.includes(t)) r.push(`${NOMS[t]} (${c.nom})`);
    } else if (dePersonne.includes(t)) r.push(NOMS[t]);
  }
  return r;
}
