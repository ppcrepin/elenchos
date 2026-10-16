// Chaque règle chiffrée de docs/etape-6/regles.md (section 3) a son test : ses chiffres, ses bornes, ses cas limites.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  appliquerGeste,
  avisDuCercle,
  barre,
  bascule,
  bilanDefi,
  choisirCartes,
  classer,
  clesChoix,
  comptesDeLaSemaine,
  comptesTemperament,
  controleGroupes,
  controleMelange,
  controleSens,
  creerTirage,
  curseur,
  curseurDepuis,
  decalageParis,
  devinetteEntreeJuste,
  enPause,
  etatMoi,
  eveilleLeLendemain,
  F,
  inactivite,
  jourDeDate,
  jourDeJeu,
  lienValide,
  nouvelleManche,
  ordonnerCartes,
  ORDRE_TENSIONS,
  pasDeCote,
  phraseApresReponse,
  peutEntrer,
  peutRejoindre,
  portrait,
  portraitVu,
  pseudoLibre,
  reponseAcceptee,
  revelerManche,
  seuilOriginal,
  servirLaJournee,
  temperaments,
  textesEntreeAPoser,
  titresDuDimanche,
  vueDuCercle,
  PORTRAIT,
  PORTRAIT_QUATRE_TENSIONS,
  type CarteServie,
  type CercleDuJour,
  type ComptesTemperament,
  type IdMembre,
  type MancheRevelee,
  type MancheServie,
  type MembreCercle,
  type Niveau,
  type ReponseDatee,
  type ReponseDuJour,
} from '../../src/regles/index.ts';
import { hasardEcrit, rep, texte } from './aides.ts';

const LUNDI = jourDeDate('2026-10-19');
const H = 3_600_000;
const MIN = 60_000;

function membres(...ids: string[]): MembreCercle[] {
  return ids.map((id) => ({ id, jourArrivee: LUNDI - 30 }));
}

describe('Règle 1 · Taille et pseudo', () => {
  test('de 3 à 10 membres : complet à 10, le lien ne fait entrer personne', () => {
    assert.equal(peutEntrer(9), true);
    assert.equal(peutEntrer(10), false);
  });
  test('pseudo comparé sans majuscules, accents, ni lettres d’autres alphabets qui imitent les nôtres', () => {
    assert.equal(pseudoLibre('marié', ['Marie']), false);
    assert.equal(pseudoLibre('MARIE', ['Marie']), false);
    assert.equal(pseudoLibre('Mаrie', ['Marie'], { а: 'a' }), false, 'a cyrillique');
    assert.equal(pseudoLibre('Maria', ['Marie']), true);
  });
});

describe('Règle 2 · Inviter', () => {
  test('un lien à usage unique, valable 7 jours', () => {
    const t0 = 1_800_000_000_000;
    assert.equal(lienValide({ creeLe: t0, maintenant: t0 + 7 * 24 * H - 1, dejaUtilise: false }), true);
    assert.equal(lienValide({ creeLe: t0, maintenant: t0 + 7 * 24 * H, dejaUtilise: false }), false);
    assert.equal(lienValide({ creeLe: t0, maintenant: t0 + H, dejaUtilise: true }), false);
  });
});

describe('Règle 3 · Plusieurs cercles', () => {
  test('trois cercles au plus ; neuf cartes par jour au plus ; une manche par cercle dans l’ordre d’entrée', () => {
    assert.equal(peutRejoindre(2), true);
    assert.equal(peutRejoindre(3), false);
    const t = texte('X', 'S', 1, 'p1 pa c0 c1');
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    const reponses = new Map<IdMembre, ReponseDuJour>(ids.map((m, i) => [m, { reponse: { niveau: ((i % 5) + 1) as Niveau, raison: ((i % 4) + 1) as 1 } }]));
    const cercles: CercleDuJour[] = [
      { id: 'C1', membres: membres('moi', 'a', 'b', 'c', 'd'), eveille: true },
      { id: 'C2', membres: membres('moi', 'e', 'f', 'g', 'h'), eveille: true },
      { id: 'C3', membres: membres('moi', 'i', 'j', 'k', 'l'), eveille: true },
    ];
    const j = servirLaJournee({ devineur: 'moi', jour: LUNDI, texte: t, cercles, reponses, curseursVus: new Map(), hasard: creerTirage('fedcba9876543210') });
    assert.deepEqual(
      j.map((m) => m.cercle),
      ['C1', 'C2', 'C3'],
    );
    assert.equal(
      j.reduce((s, m) => s + m.cartes.length, 0),
      9,
    );
  });
  test('R8 : si son absence viderait deux manches, le tirage choisit entre elles ; l’autre est sautée', () => {
    const t = texte('X', 'S', 1, 'p1 pa c0 c1');
    const reponses = new Map<IdMembre, ReponseDuJour>([['p', { reponse: rep('F · R1') }]]);
    const cercles: CercleDuJour[] = [
      { id: 'C1', membres: membres('moi', 'p', 'x'), eveille: true },
      { id: 'C2', membres: membres('moi', 'p', 'y'), eveille: true },
    ];
    const j = servirLaJournee({
      devineur: 'moi',
      jour: LUNDI,
      texte: t,
      cercles,
      reponses,
      curseursVus: new Map(),
      hasard: hasardEcrit({ [`r8|moi|${LUNDI}|p|`]: ['C2'] }),
    });
    assert.deepEqual(
      j.map((m) => m.statut),
      ['rien', 'cartes'],
    );
    assert.deepEqual(j[0]?.visages, ['x'], 'dans l’autre manche, son visage n’est pas proposé');
    assert.deepEqual(j[1]?.visages, ['p', 'y']);
  });
  test('R8 : un proche sans réponse est proposé dans ses deux cercles (rien n’est servi ailleurs)', () => {
    const t = texte('X', 'S', 1, 'p1 pa c0 c1');
    const reponses = new Map<IdMembre, ReponseDuJour>([
      ['x', { reponse: rep('F · R1') }],
      ['y', { reponse: rep('F · R1') }],
    ]);
    const cercles: CercleDuJour[] = [
      { id: 'C1', membres: membres('moi', 'p', 'x'), eveille: true },
      { id: 'C2', membres: membres('moi', 'p', 'y'), eveille: true },
    ];
    const j = servirLaJournee({ devineur: 'moi', jour: LUNDI, texte: t, cercles, reponses, curseursVus: new Map(), hasard: creerTirage('fedcba9876543210') });
    assert.deepEqual(
      j.map((m) => m.visages),
      [
        ['p', 'x'],
        ['p', 'y'],
      ],
    );
  });
});

describe('Règle 5 · Pause, sommeil, effacement', () => {
  // « Amis » : Léa, Marie, Hugo. Léa ne répond plus à partir d'un lundi.
  const amis = membres('Lea', 'Marie', 'Hugo');
  const dimanche = LUNDI + 6;
  const leaRepond = (j: number): boolean => j < LUNDI || j === LUNDI + 9; // revient le mercredi suivant, à 8h
  const aRepondu = (m: IdMembre, j: number): boolean => (m === 'Lea' ? leaRepond(j) : true);

  test('pause à 18h le jour où se ferme le septième texte sans réponse', () => {
    assert.equal(enPause({ jour: dimanche - 1, jourArrivee: LUNDI - 30, aRepondu: leaRepond }), false, 'six textes seulement');
    assert.equal(enPause({ jour: dimanche, jourArrivee: LUNDI - 30, aRepondu: leaRepond }), true);
    assert.equal(enPause({ jour: dimanche, jourArrivee: LUNDI + 2, aRepondu: () => false }), false, 'arrivé depuis moins de 7 textes');
  });
  test('le cercle s’endort au dimanche 18h (titres tombés : éveillé le dimanche), pas de manche lundi ; il se réveille mercredi à 18h', () => {
    assert.equal(eveilleLeLendemain({ jour: dimanche - 1, membres: amis, aRepondu }).eveille, true, 'éveillé pendant le dimanche');
    const d = eveilleLeLendemain({ jour: dimanche, membres: amis, aRepondu });
    assert.deepEqual(d, { eveille: false, enPause: ['Lea'] });
    assert.equal(eveilleLeLendemain({ jour: LUNDI + 8, membres: amis, aRepondu }).eveille, false);
    assert.equal(eveilleLeLendemain({ jour: LUNDI + 9, membres: amis, aRepondu }).eveille, true, 'Léa répond mercredi : réveil à 18h, manche jeudi');
  });
  test('pas de titres si le cercle dormait pendant le jour de jeu du dimanche', () => {
    const t = titresDuDimanche({
      cercle: 'Amis',
      dimanche,
      eveilleDimanche: false,
      membres: amis,
      comptes: { parDevineur: new Map(), parAuteur: new Map(), parTexte: new Map() },
      aRepondu: () => true,
      hasard: creerTirage('fedcba9876543210'),
    });
    assert.equal(t, null);
  });
  test('effacement après 12 mois sans ouverture ; un e-mail 30 jours avant, une seule fois', () => {
    const ouvert = Date.UTC(2026, 9, 16, 10, 0);
    const un = inactivite({ derniereOuverture: ouvert, maintenant: Date.UTC(2027, 8, 15, 10, 0), emailDejaEnvoye: false });
    assert.deepEqual([un.effacer, un.envoyerEmail], [false, false]);
    const deux = inactivite({ derniereOuverture: ouvert, maintenant: Date.UTC(2027, 8, 17, 10, 0), emailDejaEnvoye: false });
    assert.deepEqual([deux.effacer, deux.envoyerEmail], [false, true]);
    assert.equal(inactivite({ derniereOuverture: ouvert, maintenant: Date.UTC(2027, 8, 17, 10, 0), emailDejaEnvoye: true }).envoyerEmail, false);
    assert.equal(un.effacementLe, Date.UTC(2027, 9, 16, 10, 0));
    assert.equal(inactivite({ derniereOuverture: ouvert, maintenant: Date.UTC(2027, 9, 16, 10, 0), emailDejaEnvoye: true }).effacer, true);
  });
});

describe('Règle 6 · L’heure, le retard, le mélange', () => {
  test('18h heure de Paris, en hiver comme en été ; le jour de jeu bascule à 18h00', () => {
    const ete = jourDeDate('2026-07-15');
    const hiver = jourDeDate('2026-12-15');
    assert.equal(bascule(ete), Date.UTC(2026, 6, 15, 16, 0));
    assert.equal(bascule(hiver), Date.UTC(2026, 11, 15, 17, 0));
    assert.equal(jourDeJeu(bascule(hiver) - 1), hiver);
    assert.equal(jourDeJeu(bascule(hiver)), hiver + 1);
    // Jours de changement d'heure.
    assert.equal(decalageParis(bascule(jourDeDate('2026-03-29'))), 120);
    assert.equal(decalageParis(bascule(jourDeDate('2026-10-25'))), 60);
    assert.equal(bascule(jourDeDate('2026-10-25')), Date.UTC(2026, 9, 25, 17, 0));
  });
  test('en retard jusqu’à 18h10, si Répondre s’était affiché avant 18h00', () => {
    const j = LUNDI;
    const fin = bascule(j);
    const ok = (envoi: number, aff: number | null): ReturnType<typeof reponseAcceptee> => reponseAcceptee({ jourTexte: j, instantEnvoi: envoi, instantAffichageRepondre: aff });
    assert.deepEqual(ok(fin - 1, null), { acceptee: true, tardive: false });
    assert.deepEqual(ok(fin + 10 * MIN - 1, fin - 1), { acceptee: true, tardive: true });
    assert.deepEqual(ok(fin + 10 * MIN, fin - 1), { acceptee: false });
    assert.deepEqual(ok(fin + MIN, fin), { acceptee: false }, 'affiché à 18h00 pile : trop tard');
    assert.deepEqual(ok(fin + MIN, null), { acceptee: false });
    assert.deepEqual(ok(bascule(j - 1) - 1, null), { acceptee: false }, 'avant l’ouverture');
  });
  test('le mélange : 10 à 18 rejetés sur 28 textes glissants', () => {
    const serie = (rejetes: number): ('adopte' | 'rejete')[] => Array.from({ length: 28 }, (_, i) => (i < rejetes ? 'rejete' : 'adopte'));
    assert.deepEqual(controleMelange(serie(10)), []);
    assert.deepEqual(controleMelange(serie(18)), []);
    assert.deepEqual(controleMelange(serie(9)), [0]);
    assert.deepEqual(controleMelange(serie(19)), [0]);
  });
});

describe('Règle 7 · Répondre : égalité entre groupes', () => {
  test('84 textes, 336 raisons, 10 groupes : de 23 à 44 chacun', () => {
    const base = (x: number, y: number): Map<string, number> => {
      const m = new Map<string, number>([
        ['A', x],
        ['B', y],
      ]);
      // Les huit autres font 269 raisons : 7 × 34 + 31 (total 336 avec 23 + 44, ou 22 + 45).
      for (let i = 0; i < 7; i++) m.set(`G${i}`, 34);
      m.set('G7', 31);
      assert.equal([...m.values()].reduce((a, b) => a + b, 0), 336);
      return m;
    };
    assert.deepEqual(controleGroupes(base(23, 44)), []);
    assert.deepEqual(controleGroupes(base(22, 45)), ['A', 'B']);
  });
});

describe('Règle 8 · Les cartes à deviner', () => {
  const t = texte('X', 'S', 1, 'p1 pa c0 c1');
  test('trois réponses possibles ou moins : toutes servies', () => {
    for (const n of [1, 2, 3]) {
      const ids = ['a', 'b', 'c'].slice(0, n);
      const reponses = new Map<IdMembre, ReponseDuJour>(ids.map((m, i) => [m, { reponse: { niveau: (i + 1) as Niveau, raison: 1 } }]));
      const d = choisirCartes({ texte: t, possibles: ids, reponses, curseursVus: new Map(), hasard: creerTirage('fedcba9876543210'), cles: clesChoix('C', 'moi', LUNDI) });
      assert.deepEqual([...d.places].sort(), ids);
    }
  });
  test('la réponse du joueur qui devine n’entre jamais dans le calcul (R3)', () => {
    const reponses = new Map<IdMembre, ReponseDuJour>([
      ['moi', { reponse: rep('TD · R3') }],
      ['a', { reponse: rep('F · R1') }],
      ['b', { reponse: rep('F · R1') }],
      ['c', { reponse: rep('TF · R1') }],
      ['d', { reponse: rep('D · R3') }],
    ]);
    const [m] = servirLaJournee({
      devineur: 'moi',
      jour: LUNDI,
      texte: t,
      cercles: [{ id: 'C', membres: membres('moi', 'a', 'b', 'c', 'd'), eveille: true }],
      reponses,
      curseursVus: new Map(),
      hasard: creerTirage('fedcba9876543210'),
    }) as [MancheServie];
    assert.ok(!m.cartes.some((c) => c.auteur === 'moi'));
    assert.equal(m.detail?.mediane?.toString(), '3/4', 'médiane de 1/4, 3/4, 3/4, 1');
  });
  test('deux réponses identiques servies ensemble seulement si aucune autre ne peut prendre la place (R4)', () => {
    const reponses = new Map<IdMembre, ReponseDuJour>([
      ['a', { reponse: rep('TD · R3') }],
      ['b', { reponse: rep('TD · R3') }],
      ['c', { reponse: rep('TD · R3') }],
      ['d', { reponse: rep('TF · R1') }],
    ]);
    const d = choisirCartes({ texte: t, possibles: ['a', 'b', 'c', 'd'], reponses, curseursVus: new Map(), hasard: creerTirage('fedcba9876543210'), cles: clesChoix('C', 'moi', LUNDI) });
    assert.equal(d.places.filter((p) => p === 'd').length, 1, 'd prend une place');
    assert.equal(d.places.length, 3);
  });
  test('un membre arrivé après la fermeture du texte n’est pas proposé (exception à D-011) ; un membre en pause l’est', () => {
    const reponses = new Map<IdMembre, ReponseDuJour>([['a', { reponse: rep('F · R1') }]]);
    const cercle: CercleDuJour = {
      id: 'C',
      membres: [
        { id: 'moi', jourArrivee: LUNDI - 30 },
        { id: 'a', jourArrivee: LUNDI - 30 },
        { id: 'pause', jourArrivee: LUNDI - 30 },
        { id: 'nouveau', jourArrivee: LUNDI },
      ],
      eveille: true,
    };
    const [m] = servirLaJournee({ devineur: 'moi', jour: LUNDI, texte: t, cercles: [cercle], reponses, curseursVus: new Map(), hasard: creerTirage('fedcba9876543210') }) as [MancheServie];
    assert.deepEqual(m.visages, ['a', 'pause']);
  });
  test('une réponse en retard n’est jamais servie, mais son auteur reste proposé', () => {
    const reponses = new Map<IdMembre, ReponseDuJour>([
      ['a', { reponse: rep('F · R1') }],
      ['b', { reponse: rep('D · R3'), tardive: true }],
    ]);
    const [m] = servirLaJournee({
      devineur: 'moi',
      jour: LUNDI,
      texte: t,
      cercles: [{ id: 'C', membres: membres('moi', 'a', 'b'), eveille: true }],
      reponses,
      curseursVus: new Map(),
      hasard: creerTirage('fedcba9876543210'),
    }) as [MancheServie];
    assert.deepEqual(
      m.cartes.map((c) => c.auteur),
      ['a'],
    );
    assert.deepEqual(m.visages, ['a', 'b']);
  });
});

describe('Règle 9 · La carte « qui et pourquoi », et Valider', () => {
  const t = texte('X', 'S', 1, 'p1 pa c0 c1');
  const reponses = new Map<IdMembre, ReponseDuJour>([
    ['a', { reponse: rep('F · aucune') }],
    ['b', { reponse: rep('D · aucune') }],
    ['c', { reponse: rep('TF · R1') }],
  ]);
  test('tirée parmi les cartes dont la raison n’est pas « aucune » ; aucune si toutes sont « aucune »', () => {
    const cartes = ordonnerCartes(['a', 'b', 'c'], reponses, creerTirage('fedcba9876543210'), { cachee: 'k|', ordre: 'o|' });
    assert.equal(cartes[2]?.auteur, 'c');
    assert.equal(cartes[2]?.cachee, true);
    const sans = ordonnerCartes(['a', 'b'], reponses, creerTirage('fedcba9876543210'), { cachee: 'k|', ordre: 'o|' });
    assert.ok(sans.every((c) => !c.cachee));
  });
  test('sa place ne dépend pas du classement : sur 2 000 tirages, chaque carte avec raison l’est à peu près autant', () => {
    const r3 = new Map<IdMembre, ReponseDuJour>([
      ['a', { reponse: rep('F · R1') }],
      ['b', { reponse: rep('D · R3') }],
      ['c', { reponse: rep('TF · R1') }],
    ]);
    const compte = new Map<string, number>();
    for (let i = 0; i < 2000; i++) {
      const cartes = ordonnerCartes(['a', 'b', 'c'], r3, creerTirage(`graine-${String(i).padStart(10, '0')}`), { cachee: 'k|', ordre: 'o|' });
      const c = cartes[2]?.auteur as string;
      compte.set(c, (compte.get(c) ?? 0) + 1);
    }
    for (const x of ['a', 'b', 'c']) assert.ok((compte.get(x) ?? 0) > 550, `${x} : ${compte.get(x)}`);
  });
  test('les gestes : un visage par carte, chacun une fois ; changer garde le « pourquoi » ; retirer ou passer l’efface ; Valider fige', () => {
    const cartes: CarteServie[] = [
      { auteur: 'a', reponse: rep('F · R1'), cachee: false },
      { auteur: 'c', reponse: rep('TF · R1'), cachee: true },
    ];
    let e = nouvelleManche({ cercle: 'C', statut: 'cartes', cartes, visages: ['a', 'b', 'c'], detail: null });
    const g = (x: Parameters<typeof appliquerGeste>[1]): ReturnType<typeof appliquerGeste> => appliquerGeste(e, x);
    assert.deepEqual(g({ type: 'pourquoi', carte: 1, raison: 2 }), { refus: 'pourquoi_sans_visage' });
    assert.deepEqual(g({ type: 'pourquoi', carte: 0, raison: 2 }), { refus: 'pas_de_pourquoi_ici' });
    assert.deepEqual(g({ type: 'poser', carte: 0, visage: 'z' }), { refus: 'visage_non_propose' });
    const pas = (x: ReturnType<typeof appliquerGeste>): typeof e => {
      if ('refus' in x) throw new Error(x.refus);
      return x.etat;
    };
    e = pas(g({ type: 'poser', carte: 0, visage: 'a' }));
    assert.deepEqual(g({ type: 'poser', carte: 1, visage: 'a' }), { refus: 'visage_deja_pose' });
    e = pas(g({ type: 'poser', carte: 1, visage: 'b' }));
    e = pas(g({ type: 'pourquoi', carte: 1, raison: 2 }));
    e = pas(g({ type: 'poser', carte: 1, visage: 'c' }));
    assert.equal(e.cartes[1]?.pourquoi, 2, 'changer de visage garde le « pourquoi »');
    e = pas(g({ type: 'retirer', carte: 1 }));
    assert.equal(e.cartes[1]?.pourquoi, null, 'retirer l’efface');
    e = pas(g({ type: 'poser', carte: 1, visage: 'c' }));
    e = pas(g({ type: 'pourquoi', carte: 1, raison: 1 }));
    e = pas(g({ type: 'passer', carte: 1 }));
    assert.deepEqual([e.cartes[1]?.visage, e.cartes[1]?.pourquoi, e.cartes[1]?.passee], [null, null, true], 'passer l’efface');
    e = pas(g({ type: 'valider' }));
    assert.deepEqual(g({ type: 'poser', carte: 1, visage: 'c' }), { refus: 'deja_validee' });
    assert.equal(e.ouverte, true);
  });
});

describe('Règle 10 · 18h : l’avis du cercle', () => {
  test('seuil de 3 réponses ; en dessous, rien', () => {
    assert.equal(avisDuCercle([4, 5]), null);
    assert.equal(avisDuCercle([4, 5, 1])?.ligne, 'adopte');
  });
  test('la mention du milieu ; nombre pair ; deux côtés ; cercle tout entier neutre', () => {
    assert.deepEqual(avisDuCercle([1, 2, 2, 4, 5])?.milieu, [2]);
    assert.deepEqual(avisDuCercle([2, 2, 4, 4]), { comptes: [0, 2, 0, 2, 0], milieu: [2, 4], ligne: 'partage', phrase: 'Ton cercle, lui, était partagé.' });
    assert.deepEqual(avisDuCercle([4, 4, 5, 1])?.milieu, [4]);
    assert.equal(avisDuCercle([4, 4, 5, 1])?.ligne, 'adopte');
    assert.equal(avisDuCercle([4, 5, 2, 1])?.ligne, 'partage');
    assert.equal(avisDuCercle([1, 2, 2, 5])?.ligne, 'rejete');
    assert.equal(avisDuCercle([3, 3, 3])?.ligne, 'partage');
  });
});

describe('Règle 11 · Les points et le hasard', () => {
  test('un point par bonne attribution ; le jumeau compte juste ; la raison cachée ne rapporte rien', () => {
    const cartes: CarteServie[] = [
      { auteur: 'a', reponse: rep('F · R1'), cachee: false },
      { auteur: 'b', reponse: rep('D · R3'), cachee: true },
    ];
    let e = nouvelleManche({ cercle: 'C', statut: 'cartes', cartes, visages: ['a', 'b', 'j'], detail: null });
    for (const g of [
      { type: 'poser', carte: 0, visage: 'j' },
      { type: 'poser', carte: 1, visage: 'b' },
      { type: 'pourquoi', carte: 1, raison: 3 },
    ] as const) {
      const r = appliquerGeste(e, g);
      if ('refus' in r) throw new Error(r.refus);
      e = r.etat;
    }
    const r = revelerManche({
      etat: e,
      jour: LUNDI,
      texte: 'X',
      devineur: 'moi',
      reponses: new Map([
        ['a', rep('F · R1')],
        ['b', rep('D · R3')],
        ['j', rep('F · R1')],
      ]),
      ordreArrivee: ['a', 'b', 'j'],
    });
    assert.deepEqual(
      r.cartes.map((c) => c.verdict),
      ['jumeau', 'juste_et_raison'],
    );
    assert.equal(r.points, 2);
    assert.equal(r.hasard.toString(), '1', '2/3 + 1/3');
  });
});

describe('Règle 12 · Les titres du dimanche : minimums et départages', () => {
  const dim = LUNDI + 6;
  const m4 = membres('a', 'b', 'c', 'd');
  const titres = (parDevineur: [string, number, number][], parAuteur: [string, number, number][], parTexte: [string, number, number][]) =>
    titresDuDimanche({
      cercle: 'C',
      dimanche: dim,
      eveilleDimanche: true,
      membres: m4,
      comptes: {
        parDevineur: new Map(parDevineur.map(([m, justes, raisons]) => [m, { joursAvecCartes: 7, justes, erreurs: 1, passes: 0, raisonsTrouvees: raisons }])),
        parAuteur: new Map(parAuteur.map(([m, tentatives, erreurs]) => [m, { tentatives, erreurs }])),
        parTexte: new Map(parTexte.map(([t, attributions, fausses]) => [t, { attributions, fausses }])),
      },
      aRepondu: () => true,
      hasard: hasardEcrit({ [`devin|C|${dim}|`]: ['b'], [`mystere|C|${dim}|`]: ['d'], [`surprise-semaine|C|${dim}|`]: ['T2'] }),
    });
  test('Le Devin : au moins 1 point ; puis raisons ; puis tirage', () => {
    assert.equal(titres([['a', 0, 0]], [], [])?.devin.titulaire, null);
    assert.deepEqual(titres([['a', 5, 1], ['b', 5, 2]], [], [])?.devin, { titulaire: 'b', departage: 'raisons' });
    assert.deepEqual(titres([['a', 5, 2], ['b', 5, 2]], [], [])?.devin, { titulaire: 'b', departage: 'tirage' });
  });
  test('Le Mystère : au moins 6 tentatives et 1 erreur ; part, puis erreurs, puis tirage', () => {
    assert.equal(titres([], [['a', 5, 5]], [])?.mystere.titulaire, null);
    assert.equal(titres([], [['a', 6, 0]], [])?.mystere.titulaire, null);
    assert.equal(titres([], [['a', 6, 1]], [])?.mystere.titulaire, 'a');
    assert.deepEqual(titres([], [['a', 6, 3], ['c', 8, 4]], [])?.mystere, { titulaire: 'c', departage: 'erreurs' });
    assert.deepEqual(titres([], [['c', 8, 4], ['d', 8, 4]], [])?.mystere, { titulaire: 'd', departage: 'tirage' });
  });
  test('La surprise : au moins 4 attributions et 1 fausse ; part, puis erreurs, puis tirage', () => {
    assert.equal(titres([], [], [['T1', 3, 3]])?.surprise.texte, null);
    assert.equal(titres([], [], [['T1', 4, 0]])?.surprise.texte, null);
    assert.equal(titres([], [], [['T1', 4, 1]])?.surprise.texte, 'T1');
    assert.deepEqual(titres([], [], [['T1', 4, 2], ['T2', 4, 2]])?.surprise, { texte: 'T2', departage: 'tirage' });
  });
  test('Le Fidèle : les 7 textes, retard compris ; pas un arrivé en cours de semaine ; plusieurs titulaires', () => {
    const t = titresDuDimanche({
      cercle: 'C',
      dimanche: dim,
      eveilleDimanche: true,
      membres: [...membres('a', 'b'), { id: 'n', jourArrivee: LUNDI + 1 }],
      comptes: { parDevineur: new Map(), parAuteur: new Map(), parTexte: new Map() },
      aRepondu: (m, j) => m !== 'b' || j !== LUNDI + 3,
      hasard: creerTirage('fedcba9876543210'),
    });
    assert.deepEqual(t?.fideles, ['a']);
  });
});

describe('Règle 13 · Les tempéraments : seuils', () => {
  test('L’Original : 2/5 à 3 membres, 1/3 à 4, 1/4 dès 5', () => {
    assert.deepEqual([3, 4, 5, 10].map((n) => seuilOriginal(n).toString()), ['2/5', '1/3', '1/4', '1/4']);
  });
  test('L’Original : « au plus un tiers du cercle » ; à six, deux membres d’accord le sont ; un Neutre jamais', () => {
    const six = (moi: Niveau, autres: Niveau[]): ComptesTemperament =>
      comptesTemperament('moi', [new Map<IdMembre, Niveau>([['moi', moi], ...autres.map((v, i) => [`x${i}`, v] as [string, Niveau])])], [moi]);
    assert.equal(six(1, [1, 5, 5, 5, 5]).cotePeuSuivi, 1, '2 sur 6');
    assert.equal(six(1, [1, 2, 5, 5, 5]).cotePeuSuivi, 0, '3 sur 6');
    assert.equal(six(3, [5, 5, 5, 5, 5]).cotePeuSuivi, 0);
    const trois = comptesTemperament('moi', [new Map<IdMembre, Niveau>([['moi', 1], ['x', 5], ['y', 4]])], [1]);
    assert.equal(trois.cotePeuSuivi, 1);
    const deux = comptesTemperament('moi', [new Map<IdMembre, Niveau>([['moi', 1], ['x', 5]])], [1]);
    assert.equal(deux.reponsesCercle, 0, 'un texte compte s’il a au moins 3 réponses dans le cercle');
  });
  test('Le Pont : textes partagés, Neutre, au plus un tiers de Neutre', () => {
    const c = comptesTemperament(
      'moi',
      [
        new Map<IdMembre, Niveau>([['moi', 3], ['x', 1], ['y', 5]]),
        new Map<IdMembre, Niveau>([['moi', 3], ['x', 1], ['y', 5], ['z', 3]]),
        new Map<IdMembre, Niveau>([['moi', 3], ['x', 1], ['y', 2]]),
      ],
      [3, 3, 3],
    );
    assert.deepEqual([c.textesPartages, c.neutreAuMilieu], [2, 1]);
  });
  const ancien = LUNDI - 100;
  const t = (comptes: Partial<ComptesTemperament>, precedents: string[] = [], premier = ancien) =>
    temperaments({
      dimanche: LUNDI + 6,
      comptes: { reponsesCercle: 0, cotePeuSuivi: 0, textesPartages: 0, neutreAuMilieu: 0, reponses: 0, neutres: 0, tres: 0, ...comptes },
      tailleCercle: 5,
      premiereReponseCercle: premier,
      premiereReponse: premier,
      precedents: new Set(precedents as never[]),
    });
  test('Le Pont : au moins 6 textes partagés et 1/4 ; Le Mesuré 1/3 ; Le Tranché 1/2 ; 20 réponses ; 56 jours', () => {
    assert.deepEqual(t({ reponsesCercle: 20, textesPartages: 6, neutreAuMilieu: 2 }).cercle, ['pont']);
    assert.deepEqual(t({ reponsesCercle: 20, textesPartages: 5, neutreAuMilieu: 5 }).cercle, []);
    assert.deepEqual(t({ reponses: 21, neutres: 7 }).personne, ['mesure']);
    assert.deepEqual(t({ reponses: 21, neutres: 6 }).personne, []);
    assert.deepEqual(t({ reponses: 20, tres: 10 }).personne, ['tranche']);
    assert.deepEqual(t({ reponses: 19, tres: 19 }).personne, []);
    assert.deepEqual(t({ reponses: 20, tres: 10 }, [], LUNDI + 6 - 56).personne, ['tranche'], 'première réponse vieille de 56 jours');
    assert.deepEqual(t({ reponses: 20, tres: 10 }, [], LUNDI + 6 - 55).personne, [], '55 jours : trop jeune');
  });
  test('garder un tempérament : la part reste aux 4/5 du seuil', () => {
    assert.deepEqual(t({ reponses: 20, tres: 8 }, ['tranche']).personne, ['tranche'], '8/20 = 2/5 = 4/5 × 1/2');
    assert.deepEqual(t({ reponses: 20, tres: 7 }, ['tranche']).personne, []);
    assert.deepEqual(t({ reponses: 20, tres: 8 }).personne, []);
  });
});

describe('Règle 14 · Les badges rares', () => {
  const dim = LUNDI + 6;
  const manche = (jour: number, cartes: Partial<MancheRevelee['cartes'][number]>[]): MancheRevelee => ({
    cercle: 'C',
    jour,
    texte: `T${jour}`,
    devineur: 'moi',
    ouverte: true,
    cartes: cartes.map((c) => ({
      auteurServi: 'a',
      auteur: 'a',
      reponse: rep('F · R1'),
      cachee: false,
      designe: 'a',
      verdict: 'juste',
      juste: true,
      jumeau: false,
      raisonTrouvee: false,
      passeComptee: false,
      h: F(1, 2),
      ...c,
    })),
    points: cartes.length,
    raisonCacheeTrouvee: false,
    hasard: F(0),
  });
  const sansFaute = (manches: MancheRevelee[]): readonly string[] =>
    titresDuDimanche({
      cercle: 'C',
      dimanche: dim,
      eveilleDimanche: true,
      membres: membres('moi', 'a'),
      comptes: comptesDeLaSemaine(manches, dim, 'C'),
      aRepondu: () => true,
      hasard: creerTirage('fedcba9876543210'),
    })?.sansFaute ?? [];
  test('Le Sans-Faute : des cartes au moins 5 jours, aucune erreur ni passe ; un jour sans carte ne compte pas', () => {
    const cinq = [0, 1, 2, 3, 4].map((k) => manche(LUNDI + k, [{}]));
    assert.deepEqual(sansFaute(cinq), ['moi']);
    assert.deepEqual(sansFaute(cinq.slice(0, 4)), []);
    assert.deepEqual(sansFaute([...cinq.slice(0, 4), manche(LUNDI + 4, [])]), [], 'un jour sans carte');
    assert.deepEqual(sansFaute([...cinq, manche(LUNDI + 5, [{ designe: null, verdict: 'passe', juste: false, passeComptee: true }])]), []);
    assert.deepEqual(sansFaute([...cinq, manche(LUNDI + 5, [{ juste: false, verdict: 'faux', designe: 'b' }])]), []);
    assert.deepEqual(sansFaute([...cinq, manche(LUNDI + 5, [{ designe: null, verdict: 'passe', juste: false, passeComptee: false }])]), ['moi'], 'carte vidée par un départ');
  });
  const S = (id: string, rep_: string, jour: number) => ({ texte: texte(id, 'S', 1, 'p1 pa c0 c1'), reponse: rep(rep_), entree: false, jour, instant: jour }) as ReponseDatee;
  const serie = (n: number, ecarts = 0): ReponseDatee[] => [
    ...Array.from({ length: ecarts }, (_, i) => S(`e${i}`, 'D · R3', i)),
    ...Array.from({ length: n }, (_, i) => S(`s${i}`, 'F · R1', 100 + i)),
  ];
  const contraire = S('k', 'D · R3', 1000);
  test('Le Pas de Côté : dix arbitrages nets d’un côté, puis une réponse franchement contraire', () => {
    assert.equal(pasDeCote([...serie(10), contraire], contraire), true);
    assert.equal(pasDeCote([...serie(9), contraire], contraire), false);
  });
  test('avec un seul écart, quinze arbitrages du même côté', () => {
    assert.equal(pasDeCote([...serie(15, 1), contraire], contraire), true);
    assert.equal(pasDeCote([...serie(14, 1), contraire], contraire), false);
  });
  test('pas sur un penchant, pas à l’entrée, pas dans le sens du curseur ; seuil 7/20 (l’essai prenait 1/5)', () => {
    const penchant = S('k2', 'D · aucune', 1000);
    assert.equal(pasDeCote([...serie(12), penchant], penchant), false);
    const entree = { ...contraire, entree: true };
    assert.equal(pasDeCote([...serie(12), entree], entree), false);
    const meme = S('k3', 'F · R1', 1000);
    assert.equal(pasDeCote([...serie(12), meme], meme), false);
    assert.equal(PORTRAIT.pasDeCoteEcart.toString(), '7/20');
  });
});

describe('Règle 15 · L’entrée', () => {
  test('le défi : une devinette est juste si elle trouve le bon côté ; à 0 ou 1, on compte les surprises', () => {
    assert.equal(devinetteEntreeJuste(5, 4), true);
    assert.equal(devinetteEntreeJuste(3, 4), false);
    assert.deepEqual(bilanDefi([5, 1, 3], [4, 2, 3]), { justes: 3, sur: 3, surprises: null });
    assert.deepEqual(bilanDefi([5, 5, 3], [1, 2, 3]), { justes: 1, sur: 3, surprises: 2 });
  });
  test('un joueur déjà inscrit : la réponse déjà donnée est reprise ; la barre avance de 2 crans, pas de 3', () => {
    const r = textesEntreeAPoser(['E1', 'E2', 'E3'], new Set(['E2', 'Z']));
    assert.deepEqual(r, { aPoser: ['E1', 'E3'], repris: ['E2'] });
    assert.equal(barre(10 + r.aPoser.length).crans - barre(10).crans, 2);
  });
  test('les textes d’entrée comptent pour le portrait et la barre', () => {
    const e = { texte: texte('E1', 'P', 1, 'p1 p1 c0 c0'), reponse: rep('F · R1'), entree: true, jour: LUNDI, instant: 0 } as ReponseDatee;
    assert.equal(portrait([e]).P.W.toString(), '1');
    assert.equal(portraitVu([e], LUNDI).P.W.toString(), '1', 'le cercle voit l’entrée');
    assert.equal(phraseApresReponse(e), null, 'pas de phrase du jour à l’entrée');
    assert.equal(phraseApresReponse({ ...e, entree: false }), "Aujourd'hui, tu as fait passer l'innovation avant la précaution.");
  });
});

describe('Règle 16 · Les tensions', () => {
  test('huit tensions dans l’ordre fixe', () => {
    assert.deepEqual(ORDRE_TENSIONS, ['S', 'EM', 'SR', 'P', 'T', 'SO', 'EP', 'L']);
  });
  test('sur 8 semaines, autant de textes dans chaque sens, à un près ; l’exception de D-064', () => {
    const l = (a: number, b: number) => [...Array.from({ length: a }, () => ({ tension: 'P' as const, sens: 0 as const })), ...Array.from({ length: b }, () => ({ tension: 'P' as const, sens: 1 as const }))];
    assert.deepEqual(controleSens(l(4, 3)), []);
    assert.deepEqual(controleSens(l(5, 3)), ['P']);
    assert.deepEqual(controleSens(l(5, 3), ['P']), []);
  });
});

describe('Règle 17 · Le curseur', () => {
  test('les poids : arbitrage 1, penchant 1/2, tiraillé 0, neutre 0', () => {
    const t = texte('X', 'P', 1, 'p1 pa c1 c0');
    assert.deepEqual([classer(t, rep('F · R1')).classe, classer(t, rep('F · R1')).w.toString(), classer(t, rep('F · R1')).pole], ['arbitrage', '1', 1]);
    assert.deepEqual([classer(t, rep('F · R2')).classe, classer(t, rep('F · R2')).w.toString()], ['penchant', '1/2']);
    assert.deepEqual([classer(t, rep('F · aucune')).classe, classer(t, rep('F · aucune')).w.toString()], ['penchant', '1/2']);
    assert.deepEqual([classer(t, rep('D · R3')).classe, classer(t, rep('D · R3')).w.toString()], ['tiraille', '0']);
    assert.deepEqual([classer(t, rep('D · R4')).classe, classer(t, rep('D · R4')).pole], ['arbitrage', 0]);
    assert.deepEqual([classer(t, rep('N · R1')).classe, classer(t, rep('N · R1')).w.toString()], ['neutre', '0']);
  });
  test('Marie, précaution / innovation : 17/23 et 47/160, puis 19/25, net', () => {
    const avant = curseur({ W: F(15, 2), Swp: F(13, 2) });
    assert.deepEqual([avant.c.toString(), avant.l.toString(), avant.net], ['17/23', '47/160', false]);
    const apres = curseur({ W: F(17, 2), Swp: F(15, 2) });
    assert.deepEqual([apres.c.toString(), apres.l.toString(), apres.net], ['19/25', '1/4', true]);
  });
  test('net dès W ≥ 8, largeur au plancher ; 14 si la bêta ne fait circuler que quatre tensions', () => {
    assert.equal(curseurDepuis(F(15, 2), 0).net, false);
    assert.equal(curseurDepuis(8, 0).net, true);
    assert.equal(curseurDepuis(8, 0).l.toString(), '1/4');
    assert.equal(curseurDepuis(13, 0, PORTRAIT_QUATRE_TENSIONS).net, false);
    assert.equal(curseurDepuis(14, 0, PORTRAIT_QUATRE_TENSIONS).net, true);
  });
});

describe('Règle 18 · La barre', () => {
  test('60 crans, un par réponse ; pleine, elle se montre une fois, puis disparaît', () => {
    assert.deepEqual(barre(0), { crans: 0, sur: 60, pleine: false });
    assert.deepEqual(barre(75), { crans: 60, sur: 60, pleine: true });
    assert.deepEqual(etatMoi({ reponses: 30, barrePleineDejaMontree: false, unCurseurNet: true }), { barre: 'en_cours', portraitPasEncoreForme: false, ligneSansCurseurNet: false });
    assert.deepEqual(etatMoi({ reponses: 30, barrePleineDejaMontree: false, unCurseurNet: false }), { barre: 'en_cours', portraitPasEncoreForme: true, ligneSansCurseurNet: false });
    assert.deepEqual(etatMoi({ reponses: 60, barrePleineDejaMontree: false, unCurseurNet: false }), { barre: 'pleine_a_montrer', portraitPasEncoreForme: false, ligneSansCurseurNet: false });
    assert.deepEqual(etatMoi({ reponses: 61, barrePleineDejaMontree: true, unCurseurNet: false }), { barre: 'disparue', portraitPasEncoreForme: false, ligneSansCurseurNet: true });
    assert.deepEqual(etatMoi({ reponses: 61, barrePleineDejaMontree: true, unCurseurNet: true }), { barre: 'disparue', portraitPasEncoreForme: false, ligneSansCurseurNet: false });
  });
});

describe('Règle 19 · Ce que voit le cercle', () => {
  const t = (id: string): ReturnType<typeof texte> => texte(id, 'S', 1, 'p1 pa c0 c1');
  const reponses: ReponseDatee[] = [
    { texte: t('e'), reponse: rep('F · R1'), entree: true, jour: LUNDI - 40, instant: 1 },
    ...Array.from({ length: 10 }, (_, i) => ({ texte: t(`d${i}`), reponse: rep('F · R1'), entree: false, jour: LUNDI - 10 + i, instant: 10 + i }) as ReponseDatee),
  ];
  test('lecture A : pendant le jour D, seulement l’entrée et les textes jusqu’à D − 2', () => {
    // Le dernier texte est du jour LUNDI − 1 : il se révèle à la fin du jour LUNDI.
    assert.equal(portraitVu(reponses, LUNDI).S.W.toString(), '10');
    assert.equal(portraitVu(reponses, LUNDI + 1).S.W.toString(), '11');
    assert.equal(portrait(reponses).S.W.toString(), '11', 'toi, dans Moi, tu vois tout');
  });
  test('Le Cercle : initiales des nets à leur centre, « Encore flou : » les autres dans l’ordre d’arrivée', () => {
    const v = vueDuCercle(membres('a', 'b', 'c'), new Map([
      ['a', portrait([])],
      ['b', portrait(reponses)],
    ]));
    assert.deepEqual(
      v.S.nets.map((n) => [n.membre, n.c.toString()]),
      [['b', '13/15']],
    );
    assert.deepEqual(v.S.flous, ['a', 'c']);
  });
});

describe('Règle 20 · Un texte corrigé après coup', () => {
  test('sorti des portraits : la réponse reste, elle ne compte plus dans aucun curseur', () => {
    const x = { texte: texte('X', 'S', 1, 'p1 pa c0 c1', true), reponse: rep('F · R1'), entree: false, jour: LUNDI, instant: 0 } as ReponseDatee;
    assert.equal(portrait([x]).S.W.toString(), '0');
  });
  test('erreur d’étiquette : les curseurs sont recalculés avec la bonne étiquette', () => {
    const faux = texte('X', 'S', 1, 'p0 pa c0 c1');
    const juste = texte('X', 'S', 1, 'p1 pa c0 c1');
    const r = rep('F · R1');
    const avant = portrait([{ texte: faux, reponse: r, entree: false, jour: LUNDI, instant: 0 }]).S;
    const apres = portrait([{ texte: juste, reponse: r, entree: false, jour: LUNDI, instant: 0 }]).S;
    assert.deepEqual([avant.W.toString(), apres.W.toString()], ['0', '1']);
  });
});
