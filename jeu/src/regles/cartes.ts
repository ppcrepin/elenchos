// Les cartes à deviner (règles 3, 8 et 9) : les réponses possibles, la répartition d'un proche présent dans plusieurs
// de mes cercles (R8), le choix des cartes (les plus inattendues, R3 ; jamais deux identiques quand une autre peut
// prendre la place, R4), la carte « qui et pourquoi » et l'ordre d'affichage (D-038), les visages proposés (D-011,
// et ses deux exceptions ; un proche présent dans plusieurs de mes cercles n'est proposé que dans une seule de mes
// manches, qu'il ait répondu ou non). Tout se tire à 18h, parmi les réponses déjà fermées.
//
// Écarts avec l'essai 2 (`calculerManche`), regles.md l'emporte :
// - la carte « qui et pourquoi » est tirée au sort parmi les cartes servies dont la raison n'est pas « aucune » (règle 9,
//   D-038) ; l'essai prenait la carte de la place 3, ou la moins bien classée qui avait une raison ;
// - l'ordre : les autres cartes dans un ordre tiré, la carte « qui et pourquoi » en dernier ; l'essai mélangeait tout ;
// - un membre arrivé après la fermeture du texte n'est pas proposé (D-052, exception à D-011) ; l'essai ne servait que
//   les membres « au jour où le texte a été répondu » et n'avait pas de visages proposés à calculer ;
// - une réponse en retard (18h–18h10) n'est jamais servie (règle 6) ; l'essai n'avait pas de retard ;
// - plusieurs cercles (R8) : absents de l'essai.

import { Fraction } from './fraction.ts';
import { identiques, placeSurAxe } from './portrait.ts';
import { choisir, ordonner, type Hasard } from './tirage.ts';
import type { Curseur, IdCercle, IdMembre, Jour, MembreCercle, ReponseMoteur, TexteMoteur } from './types.ts';
import { REGLES } from './constantes.ts';

export type ReponseDuJour = { readonly reponse: ReponseMoteur; readonly tardive?: boolean };

export type CercleDuJour = {
  readonly id: IdCercle;
  /** Les membres actuels, dans l'ordre d'arrivée, en pause compris. */
  readonly membres: readonly MembreCercle[];
  /** Le cercle est éveillé pendant ce jour de jeu (règle 5) : sinon, pas de manche. */
  readonly eveille: boolean;
};

export type CarteServie = { readonly auteur: IdMembre; readonly reponse: ReponseMoteur; readonly cachee: boolean };

export type DetailPossible = {
  readonly x: Fraction;
  readonly surprise: Fraction;
  /** Le curseur de l'auteur, tel que le voit le joueur qui devine (règle 19), était net. */
  readonly parCurseur: boolean;
};

export type DetailChoix = {
  readonly possibles: ReadonlyMap<IdMembre, DetailPossible>;
  readonly mediane: Fraction | null;
  /** Surprises décroissantes, égalités dans l'ordre tiré. */
  readonly classement: readonly IdMembre[];
  /** Les auteurs servis, places 1 à 3, après les remplacements de R4. */
  readonly places: readonly IdMembre[];
  readonly remplacements: readonly { readonly ecartee: IdMembre; readonly place: number; readonly remplacante: IdMembre }[];
};

export type MancheServie = {
  readonly cercle: IdCercle;
  /** `endormi` : pas de manche (règle 5). `rien` : « Rien à deviner dans ce cercle aujourd'hui » (règle 3). */
  readonly statut: 'endormi' | 'rien' | 'cartes';
  /** Dans l'ordre d'affichage ; la carte « qui et pourquoi » en dernier. */
  readonly cartes: readonly CarteServie[];
  /** Les visages proposés, dans l'ordre d'arrivée. */
  readonly visages: readonly IdMembre[];
  readonly detail: DetailChoix | null;
};

export type ClesChoix = { readonly surprise: string; readonly hasard: string; readonly cachee: string; readonly ordre: string };

export function clesChoix(cercle: IdCercle, devineur: IdMembre, jour: Jour): ClesChoix {
  const s = `|${cercle}|${devineur}|${jour}|`;
  return { surprise: `surprise${s}`, hasard: `hasard${s}`, cachee: `cachee${s}`, ordre: `ordre${s}` };
}

/** La médiane ; avec un nombre pair de valeurs, la moyenne des deux du milieu. */
export function mediane(valeurs: readonly Fraction[]): Fraction {
  const v = [...valeurs].sort((a, b) => a.cmp(b));
  const n = v.length;
  if (n === 0) throw new Error('médiane de rien');
  if (n % 2 === 1) return v[(n - 1) / 2] as Fraction;
  return (v[n / 2 - 1] as Fraction).plus(v[n / 2] as Fraction).divise(2);
}

/**
 * Règle 8, le choix des cartes parmi les réponses possibles (déjà privées de la réponse du joueur qui devine, R3).
 * `curseursVus` : le curseur de chaque auteur sur la tension du texte, tel que le joueur qui devine le voit (lecture A).
 */
export function choisirCartes(entree: {
  readonly texte: TexteMoteur;
  /** Les auteurs possibles, dans l'ordre d'arrivée. */
  readonly possibles: readonly IdMembre[];
  readonly reponses: ReadonlyMap<IdMembre, ReponseDuJour>;
  readonly curseursVus: ReadonlyMap<IdMembre, Curseur>;
  readonly hasard: Hasard;
  readonly cles: ClesChoix;
}): DetailChoix {
  const { texte, possibles, reponses, curseursVus, hasard, cles } = entree;
  const rep = (m: IdMembre): ReponseMoteur => {
    const r = reponses.get(m);
    if (!r) throw new Error(`réponse absente : ${m}`);
    return r.reponse;
  };
  const xs = new Map(possibles.map((m) => [m, placeSurAxe(texte, rep(m).niveau)]));
  const med = possibles.length > 0 ? mediane([...xs.values()]) : null;
  const detail = new Map<IdMembre, DetailPossible>();
  for (const m of possibles) {
    const x = xs.get(m) as Fraction;
    const cur = curseursVus.get(m);
    const parCurseur = cur !== undefined && cur.net;
    const surprise = parCurseur ? x.moins(cur.c).abs() : x.moins(med as Fraction).abs();
    detail.set(m, { x, surprise, parCurseur });
  }
  const surpriseDe = (m: IdMembre): Fraction => (detail.get(m) as DetailPossible).surprise;
  const tire = ordonner(hasard, cles.surprise, possibles);
  const rangTire = new Map(tire.map((m, i) => [m, i]));
  const classement = [...possibles].sort((a, b) => {
    const c = surpriseDe(b).cmp(surpriseDe(a));
    return c !== 0 ? c : (rangTire.get(a) as number) - (rangTire.get(b) as number);
  });

  const places = classement.slice(0, 2);
  if (classement.length >= 3) {
    const troisieme = choisir(hasard, cles.hasard, classement.slice(2));
    if (troisieme !== null) places.push(troisieme);
  }

  // R4 : deux réponses identiques ne sont pas servies ensemble si une autre réponse peut prendre la place.
  const remplacements: { ecartee: IdMembre; place: number; remplacante: IdMembre }[] = [];
  for (;;) {
    const avecJumelle = places.filter((p) => places.some((o) => o !== p && identiques(rep(o), rep(p))));
    if (avecJumelle.length === 0) break;
    const eligibles = classement.filter((r) => !places.includes(r) && places.every((p) => !identiques(rep(r), rep(p))));
    const remplacante = eligibles[0];
    if (remplacante === undefined) break;
    const ecartee = avecJumelle.reduce((pire, p) => (classement.indexOf(p) > classement.indexOf(pire) ? p : pire));
    const place = places.indexOf(ecartee);
    places[place] = remplacante;
    remplacements.push({ ecartee, place: place + 1, remplacante });
  }
  return { possibles: detail, mediane: med, classement, places, remplacements };
}

/** Règle 9 : la carte « qui et pourquoi », tirée au sort parmi les cartes servies dont la raison n'est pas « aucune »
 *  (aucune si toutes sont « aucune ») ; les autres d'abord, dans un ordre tiré au sort ; elle en dernier. */
export function ordonnerCartes(
  places: readonly IdMembre[],
  reponses: ReadonlyMap<IdMembre, ReponseDuJour>,
  hasard: Hasard,
  cles: Pick<ClesChoix, 'cachee' | 'ordre'>,
): CarteServie[] {
  const rep = (m: IdMembre): ReponseMoteur => (reponses.get(m) as ReponseDuJour).reponse;
  const avecRaison = places.filter((m) => rep(m).raison !== 'aucune');
  const cachee = choisir(hasard, cles.cachee, avecRaison);
  const autres = ordonner(
    hasard,
    cles.ordre,
    places.filter((m) => m !== cachee),
  );
  const cartes = autres.map((m) => ({ auteur: m, reponse: rep(m), cachee: false }));
  if (cachee !== null) cartes.push({ auteur: cachee, reponse: rep(cachee), cachee: true });
  return cartes;
}

/** Règle 8 : les réponses possibles d'un cercle, avant R8 : les autres membres actuels qui étaient membres à la
 *  fermeture du texte (jour − 1) et y ont répondu à temps (une réponse en retard n'est jamais servie). */
export function possiblesDuCercle(
  cercle: CercleDuJour,
  devineur: IdMembre,
  jour: Jour,
  reponses: ReadonlyMap<IdMembre, ReponseDuJour>,
): IdMembre[] {
  return cercle.membres
    .filter((m) => m.id !== devineur && m.jourArrivee <= jour - 1)
    .filter((m) => {
      const r = reponses.get(m.id);
      return r !== undefined && r.tardive !== true;
    })
    .map((m) => m.id);
}

/**
 * Règle 3 (R8) : un proche présent dans plusieurs de mes cercles ne m'est servi qu'une fois par jour : dans le cercle
 * où son absence viderait la manche ; si son absence en viderait plusieurs, ou aucune, un tirage invisible choisit
 * (parmi celles qu'elle viderait, sinon parmi toutes). Plusieurs proches partagés se placent l'un après l'autre, dans
 * l'ordre où ils apparaissent dans mes cercles (ordre d'entrée dans les cercles, puis ordre d'arrivée), chacun voyant
 * les manches telles que les précédents les ont laissées (précision du moteur, la règle n'en dit rien).
 * Rend : proche → cercle où il est servi (seulement pour les proches possibles dans au moins deux cercles).
 */
export function repartirProches(
  devineur: IdMembre,
  jour: Jour,
  possibles: ReadonlyMap<IdCercle, readonly IdMembre[]>,
  ordreCercles: readonly IdCercle[],
  hasard: Hasard,
): Map<IdMembre, IdCercle> {
  const restants = new Map<IdCercle, IdMembre[]>(ordreCercles.map((c) => [c, [...(possibles.get(c) ?? [])]]));
  const ordreProches: IdMembre[] = [];
  for (const c of ordreCercles) for (const m of possibles.get(c) ?? []) if (!ordreProches.includes(m)) ordreProches.push(m);
  const placement = new Map<IdMembre, IdCercle>();
  for (const p of ordreProches) {
    const candidats = ordreCercles.filter((c) => (restants.get(c) ?? []).includes(p));
    if (candidats.length < 2) continue;
    const viderait = candidats.filter((c) => (restants.get(c) ?? []).length === 1);
    let choisi: IdCercle | null;
    if (viderait.length === 1) choisi = viderait[0] ?? null;
    else choisi = choisir(hasard, `r8|${devineur}|${jour}|${p}|`, viderait.length >= 2 ? viderait : candidats);
    if (choisi === null) continue;
    placement.set(p, choisi);
    for (const c of candidats) if (c !== choisi) restants.set(c, (restants.get(c) ?? []).filter((m) => m !== p));
  }
  return placement;
}

/** Règle 8 : les membres qui peuvent être proposés dans un cercle, avant R8 : les autres membres actuels qui étaient
 *  membres à la fermeture du texte (jour − 1), dans l'ordre d'arrivée, en pause compris (D-011). */
export function proposablesDuCercle(cercle: CercleDuJour, devineur: IdMembre, jour: Jour): IdMembre[] {
  return cercle.membres.filter((m) => m.id !== devineur && m.jourArrivee <= jour - 1).map((m) => m.id);
}

/**
 * Règle 3 (R8), côté visages : un proche présent dans plusieurs de mes cercles n'est proposé que dans une seule de mes
 * manches chaque jour, qu'il ait répondu ou non. C'est la lettre de la règle 3 (`produit.md` : « ne t'est proposée
 * qu'une fois par jour ») et du contrat (« servi, et proposé, qu'une fois par jour »), dans la lecture de Game design
 * retenue par l'équipe à l'étape 1 (D-062, point 5). Sans elle, son visage proposé partout trahirait qu'il n'a pas répondu (D-011),
 * et sa réponse en retard pourrait rapporter deux points de jumeau le même jour (règle 11).
 * - Un proche servi est proposé là où R8 le sert (`placement`).
 * - Un proche sans réponse servie (pas de réponse, ou réponse en retard) est proposé dans une seule de mes manches qui
 *   ont des cartes, après la répartition de R8 : la seule s'il n'y en a qu'une, sinon celle qu'un tirage invisible
 *   choisit. Si aucune n'a de cartes, il n'est proposé nulle part : il n'y a rien à deviner.
 * `proposables` : pour chaque cercle éveillé, `proposablesDuCercle`. `avecCartes` : les cercles dont la manche a des
 * cartes après R8. Rend : proche → cercle où il est proposé, ou null (nulle part), pour chaque proche proposable dans
 * au moins deux cercles.
 */
export function repartirVisages(
  devineur: IdMembre,
  jour: Jour,
  proposables: ReadonlyMap<IdCercle, readonly IdMembre[]>,
  ordreCercles: readonly IdCercle[],
  placement: ReadonlyMap<IdMembre, IdCercle>,
  avecCartes: ReadonlySet<IdCercle>,
  hasard: Hasard,
): Map<IdMembre, IdCercle | null> {
  const ordreProches: IdMembre[] = [];
  for (const c of ordreCercles) for (const m of proposables.get(c) ?? []) if (!ordreProches.includes(m)) ordreProches.push(m);
  const ou = new Map<IdMembre, IdCercle | null>();
  for (const p of ordreProches) {
    const siens = ordreCercles.filter((c) => (proposables.get(c) ?? []).includes(p));
    if (siens.length < 2) continue;
    const servi = placement.get(p);
    if (servi !== undefined) {
      ou.set(p, servi);
      continue;
    }
    const candidats = siens.filter((c) => avecCartes.has(c));
    ou.set(p, candidats.length <= 1 ? (candidats[0] ?? null) : choisir(hasard, `r8-visage|${devineur}|${jour}|${p}|`, candidats));
  }
  return ou;
}

/**
 * La journée d'un joueur qui devine : une manche par cercle, dans l'ordre où il est entré dans ces cercles (règle 3).
 * `texte` : le texte de la veille (jour − 1). `reponses` : les réponses des personnes à ce texte (une réponse vaut pour
 * tous les cercles). `curseursVus` : le curseur de chaque auteur sur la tension du texte, vu pendant ce jour (règle 19).
 */
export function servirLaJournee(entree: {
  readonly devineur: IdMembre;
  readonly jour: Jour;
  readonly texte: TexteMoteur;
  readonly cercles: readonly CercleDuJour[];
  readonly reponses: ReadonlyMap<IdMembre, ReponseDuJour>;
  readonly curseursVus: ReadonlyMap<IdMembre, Curseur>;
  readonly hasard: Hasard;
}): MancheServie[] {
  const { devineur, jour, texte, cercles, reponses, curseursVus, hasard } = entree;
  const eveilles = cercles.filter((c) => c.eveille && c.membres.some((m) => m.id === devineur));
  const ordreCercles = eveilles.map((c) => c.id);
  const possibles = new Map(eveilles.map((c) => [c.id, possiblesDuCercle(c, devineur, jour, reponses)]));
  const placement = repartirProches(devineur, jour, possibles, ordreCercles, hasard);
  const servis = new Map(
    eveilles.map((c) => [
      c.id,
      (possibles.get(c.id) ?? []).filter((m) => {
        const ou = placement.get(m);
        return ou === undefined || ou === c.id;
      }),
    ]),
  );
  const proposables = new Map(eveilles.map((c) => [c.id, proposablesDuCercle(c, devineur, jour)]));
  const avecCartes = new Set(ordreCercles.filter((c) => (servis.get(c) ?? []).length > 0));
  const proposeDans = repartirVisages(devineur, jour, proposables, ordreCercles, placement, avecCartes, hasard);
  return cercles.map((c): MancheServie => {
    if (!c.eveille || !c.membres.some((m) => m.id === devineur)) {
      return { cercle: c.id, statut: 'endormi', cartes: [], visages: [], detail: null };
    }
    const ici = servis.get(c.id) ?? [];
    const visages = (proposables.get(c.id) ?? []).filter((m) => {
      const ou = proposeDans.get(m);
      return ou === undefined || ou === c.id;
    });
    if (ici.length === 0) return { cercle: c.id, statut: 'rien', cartes: [], visages, detail: null };
    const cles = clesChoix(c.id, devineur, jour);
    const detail = choisirCartes({ texte, possibles: ici, reponses, curseursVus, hasard, cles });
    if (detail.places.length > REGLES.cartesMax) throw new Error('plus de trois cartes');
    const cartes = ordonnerCartes(detail.places, reponses, hasard, cles);
    return { cercle: c.id, statut: 'cartes', cartes, visages, detail };
  });
}
