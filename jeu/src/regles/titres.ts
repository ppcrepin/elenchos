// Les titres du dimanche (règle 12), les badges rares (règle 14), les titres passés et « un ancien membre » (règle 4,
// D-045). Portage de `calculerTitres` (essai 2), avec ces écarts, regles.md l'emporte :
// - Le Fidèle : un membre arrivé dans le cercle en cours de semaine ne peut pas l'avoir (l'essai le comptait depuis son
//   arrivée, par convention) ;
// - la surprise de la semaine : tout texte des sept manches peut l'être (l'essai écartait ses textes sans fiche) ;
// - Le Sans-Faute : une carte vidée par un départ ne compte pas comme passe (règle 4) ;
// - pas de titres si le cercle dormait pendant le jour de jeu du dimanche (règle 5) ; l'essai n'avait pas de sommeil ;
// - seuls les membres actuels reçoivent un titre (règle 4).

import { REGLES } from './constantes.ts';
import { F, type Fraction } from './fraction.ts';
import { jourSemaine } from './heure.ts';
import { pasDeCote } from './portrait.ts';
import type { MancheRevelee } from './revelation.ts';
import { choisir, type Hasard } from './tirage.ts';
import type { IdCercle, IdMembre, IdTexte, Jour, MembreCercle, ReponseDatee } from './types.ts';
import { PORTRAIT, type ReglagesPortrait } from './constantes.ts';

export type ComptesDevineur = {
  readonly joursAvecCartes: number;
  readonly justes: number;
  readonly erreurs: number;
  /** Passes comptées (une carte vidée par un départ n'en est pas une). */
  readonly passes: number;
  readonly raisonsTrouvees: number;
};
export type ComptesAuteur = { readonly tentatives: number; readonly erreurs: number };
export type ComptesTexte = { readonly attributions: number; readonly fausses: number };

export type ComptesSemaine = {
  readonly parDevineur: ReadonlyMap<IdMembre, ComptesDevineur>;
  readonly parAuteur: ReadonlyMap<IdMembre, ComptesAuteur>;
  readonly parTexte: ReadonlyMap<IdTexte, ComptesTexte>;
};

/** La semaine d'un dimanche : ses sept jours de jeu, du lundi au dimanche. */
export function joursDeLaSemaine(dimanche: Jour): Jour[] {
  if (jourSemaine(dimanche) !== 6) throw new Error(`le jour ${dimanche} n'est pas un dimanche`);
  return [0, 1, 2, 3, 4, 5, 6].map((k) => dimanche - 6 + k);
}

/** Les comptes d'un cercle sur les manches révélées de la semaine (passes exclues des tentatives et attributions ;
 *  désigner un jumeau n'est jamais une erreur). Les manches d'un ancien membre restent comptées pour les textes. */
export function comptesDeLaSemaine(manches: readonly MancheRevelee[], dimanche: Jour, cercle: IdCercle): ComptesSemaine {
  const jours = new Set(joursDeLaSemaine(dimanche));
  const dv = new Map<IdMembre, { joursAvecCartes: number; justes: number; erreurs: number; passes: number; raisonsTrouvees: number }>();
  const au = new Map<IdMembre, { tentatives: number; erreurs: number }>();
  const tx = new Map<IdTexte, { attributions: number; fausses: number }>();
  for (const m of manches) {
    if (m.cercle !== cercle || !jours.has(m.jour)) continue;
    const d = dv.get(m.devineur) ?? { joursAvecCartes: 0, justes: 0, erreurs: 0, passes: 0, raisonsTrouvees: 0 };
    dv.set(m.devineur, d);
    if (m.cartes.length === 0) continue;
    d.joursAvecCartes += 1;
    if (m.raisonCacheeTrouvee) d.raisonsTrouvees += 1;
    const t = tx.get(m.texte) ?? { attributions: 0, fausses: 0 };
    tx.set(m.texte, t);
    for (const c of m.cartes) {
      if (c.designe === null) {
        if (c.passeComptee) d.passes += 1;
        continue;
      }
      const a = au.get(c.auteur) ?? { tentatives: 0, erreurs: 0 };
      au.set(c.auteur, a);
      a.tentatives += 1;
      t.attributions += 1;
      if (c.juste) d.justes += 1;
      else {
        d.erreurs += 1;
        a.erreurs += 1;
        t.fausses += 1;
      }
    }
  }
  return { parDevineur: dv, parAuteur: au, parTexte: tx };
}

export type Departage = 'aucun' | 'raisons' | 'erreurs' | 'tirage';

export type TitresDimanche = {
  readonly devin: { readonly titulaire: IdMembre | null; readonly departage: Departage };
  readonly mystere: { readonly titulaire: IdMembre | null; readonly departage: Departage };
  readonly fideles: readonly IdMembre[];
  readonly surprise: { readonly texte: IdTexte | null; readonly departage: Departage };
  /** Règle 14 : annoncé le dimanche avec la révélation, avant les titres. */
  readonly sansFaute: readonly IdMembre[];
};

/**
 * Règles 12 et 14 : les titres d'un cercle au dimanche 18h. null si le cercle dormait pendant le jour de jeu du
 * dimanche (règle 5) ; Le Sans-Faute tombe avec eux (lecture du moteur, à confirmer par Game design).
 * Un titre sans titulaire n'apparaît pas (R6) : son titulaire vaut null, ou la liste est vide.
 */
export function titresDuDimanche(entree: {
  readonly cercle: IdCercle;
  readonly dimanche: Jour;
  readonly eveilleDimanche: boolean;
  /** Les membres actuels, dans l'ordre d'arrivée. */
  readonly membres: readonly MembreCercle[];
  readonly comptes: ComptesSemaine;
  /** A répondu (retard compris) au texte du jour de jeu `jour`. */
  readonly aRepondu: (membre: IdMembre, jour: Jour) => boolean;
  readonly hasard: Hasard;
  /** Les préfixes des tirages de départage ; par défaut, ils nomment le cercle et le dimanche. */
  readonly cles?: { readonly devin: string; readonly mystere: string; readonly surprise: string };
}): TitresDimanche | null {
  const { cercle, dimanche, membres, comptes, hasard } = entree;
  const cles = entree.cles ?? {
    devin: `devin|${cercle}|${dimanche}|`,
    mystere: `mystere|${cercle}|${dimanche}|`,
    surprise: `surprise-semaine|${cercle}|${dimanche}|`,
  };
  const jours = joursDeLaSemaine(dimanche);
  if (!entree.eveilleDimanche) return null;
  const ids = membres.map((m) => m.id);
  const dev = (m: IdMembre): ComptesDevineur =>
    comptes.parDevineur.get(m) ?? { joursAvecCartes: 0, justes: 0, erreurs: 0, passes: 0, raisonsTrouvees: 0 };
  const aut = (m: IdMembre): ComptesAuteur => comptes.parAuteur.get(m) ?? { tentatives: 0, erreurs: 0 };

  // Le Devin : le plus de points, au moins 1 ; puis le plus de raisons cachées trouvées ; puis un tirage.
  let devin: TitresDimanche['devin'] = { titulaire: null, departage: 'aucun' };
  const maxP = Math.max(0, ...ids.map((m) => dev(m).justes));
  if (maxP >= REGLES.devinPointsMin) {
    const tete = ids.filter((m) => dev(m).justes === maxP);
    if (tete.length === 1) devin = { titulaire: tete[0] ?? null, departage: 'aucun' };
    else {
      const maxR = Math.max(...tete.map((m) => dev(m).raisonsTrouvees));
      const tete2 = tete.filter((m) => dev(m).raisonsTrouvees === maxR);
      devin =
        tete2.length === 1
          ? { titulaire: tete2[0] ?? null, departage: 'raisons' }
          : { titulaire: choisir(hasard, cles.devin, tete2), departage: 'tirage' };
    }
  }

  // Le Mystère : la plus forte part d'erreurs, au moins 6 tentatives et 1 erreur ; puis le plus d'erreurs ; puis un tirage.
  let mystere: TitresDimanche['mystere'] = { titulaire: null, departage: 'aucun' };
  const elig = ids.filter((m) => aut(m).tentatives >= REGLES.mystereTentativesMin && aut(m).erreurs >= REGLES.mystereErreursMin);
  if (elig.length > 0) {
    const part = (m: IdMembre): Fraction => F(aut(m).erreurs, aut(m).tentatives);
    const max = elig.reduce((b, m) => (part(m).sup(b) ? part(m) : b), part(elig[0] as IdMembre));
    const t1 = elig.filter((m) => part(m).egal(max));
    if (t1.length === 1) mystere = { titulaire: t1[0] ?? null, departage: 'aucun' };
    else {
      const maxE = Math.max(...t1.map((m) => aut(m).erreurs));
      const t2 = t1.filter((m) => aut(m).erreurs === maxE);
      mystere =
        t2.length === 1
          ? { titulaire: t2[0] ?? null, departage: 'erreurs' }
          : { titulaire: choisir(hasard, cles.mystere, t2), departage: 'tirage' };
    }
  }

  // Le Fidèle : tous ceux qui ont répondu aux 7 textes de la semaine, retard compris ; pas un membre arrivé en cours de
  // semaine (arrivé pendant le jour de jeu du lundi, il a pu répondre aux sept : il n'est pas « en cours de semaine »).
  const lundi = jours[0] as Jour;
  const fideles = membres.filter((m) => m.jourArrivee <= lundi && jours.every((j) => entree.aRepondu(m.id, j))).map((m) => m.id);

  // La surprise de la semaine : la plus forte part d'attributions fausses, au moins 4 attributions et 1 fausse ; puis le
  // plus d'erreurs ; puis un tirage.
  let surprise: TitresDimanche['surprise'] = { texte: null, departage: 'aucun' };
  const textes = [...comptes.parTexte.entries()]
    .filter(([, c]) => c.attributions >= REGLES.surpriseAttributionsMin && c.fausses >= REGLES.surpriseErreursMin)
    .map(([t]) => t)
    .sort();
  if (textes.length > 0) {
    const ct = (t: IdTexte): ComptesTexte => comptes.parTexte.get(t) as ComptesTexte;
    const part = (t: IdTexte): Fraction => F(ct(t).fausses, ct(t).attributions);
    const max = textes.reduce((b, t) => (part(t).sup(b) ? part(t) : b), part(textes[0] as IdTexte));
    const s1 = textes.filter((t) => part(t).egal(max));
    if (s1.length === 1) surprise = { texte: s1[0] ?? null, departage: 'aucun' };
    else {
      const me = Math.max(...s1.map((t) => ct(t).fausses));
      const s2 = s1.filter((t) => ct(t).fausses === me);
      surprise =
        s2.length === 1
          ? { texte: s2[0] ?? null, departage: 'erreurs' }
          : { texte: choisir(hasard, cles.surprise, s2), departage: 'tirage' };
    }
  }

  // Le Sans-Faute : des cartes au moins 5 jours, aucune erreur, aucune passe (la raison cachée n'est pas exigée).
  const sansFaute = ids.filter((m) => {
    const d = dev(m);
    return d.joursAvecCartes >= REGLES.sansFauteJoursMin && d.erreurs === 0 && d.passes === 0;
  });

  return { devin, mystere, fideles, surprise, sansFaute };
}

/** Règle 14, Le Pas de Côté, à la révélation d'un texte du jour : les membres dont la réponse à ce texte en est un.
 *  Annoncé dans chacun de leurs cercles, après les auteurs ; plusieurs le même soir sont possibles. */
export function pasDeCoteALaRevelation(
  texte: IdTexte,
  reponsesDesPersonnes: ReadonlyMap<IdMembre, readonly ReponseDatee[]>,
  reglages: ReglagesPortrait = PORTRAIT,
): IdMembre[] {
  const r: IdMembre[] = [];
  for (const [m, toutes] of reponsesDesPersonnes) {
    const la = toutes.find((x) => x.texte.id === texte && !x.entree);
    if (la && pasDeCote(toutes, la, reglages)) r.push(m);
  }
  return r;
}

/** Règle 14 : un titre ou un badge (Le Sans-Faute, Le Pas de Côté) annoncé à la fin du jour de jeu `annonce` reste sous
 *  le visage jusqu'aux titres suivants : jusqu'à la fin du premier dimanche qui suit l'annonce (le dimanche d'après,
 *  pour une annonce faite un dimanche). */
export function visibleSousLeVisage(annonce: Jour, jourCourant: Jour): boolean {
  if (jourCourant <= annonce) return false;
  const finDeVie = annonce + (jourSemaine(annonce) === 6 ? 7 : 6 - jourSemaine(annonce));
  return jourCourant <= finDeVie;
}

export type TitrePasse = {
  readonly dimanche: Jour;
  readonly titre: 'devin' | 'mystere' | 'fidele' | 'sans_faute' | 'pas_de_cote';
  readonly titulaire: IdMembre;
};

/** Règle 4 (D-045) : les titres passés restent dans l'historique ; celui d'un membre parti s'écrit « un ancien
 *  membre », et deux anciens membres ne se distinguent pas. `actuels` : les adhésions en cours (qui revient a une
 *  nouvelle adhésion, et ses anciens titres restent sous « un ancien membre »). */
export function titresPasses(
  historique: readonly TitrePasse[],
  actuels: ReadonlySet<IdMembre>,
): { readonly dimanche: Jour; readonly titre: TitrePasse['titre']; readonly titulaire: IdMembre | 'ancien_membre' }[] {
  return historique.map((t) => ({ dimanche: t.dimanche, titre: t.titre, titulaire: actuels.has(t.titulaire) ? t.titulaire : 'ancien_membre' }));
}
