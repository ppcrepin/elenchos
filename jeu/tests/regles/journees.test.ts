// Les dix journées jouées à la main (docs/etape-6/regles.md, section 6), rejouées par le moteur : il doit retrouver
// exactement les mêmes résultats. Textes fictifs A à N ; les tirages sont des entrées, comme dans regles.md.

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  appliquerDepart,
  appliquerGeste,
  avisDuCercle,
  barre,
  comptesDeLaSemaine,
  curseur,
  curseurDepuis,
  dansMoi,
  eveilleLeLendemain,
  F,
  formeMessage18h,
  jourDeDate,
  jourSemaine,
  nouvelleManche,
  ordreMoi,
  pasDeCote,
  pasDeCoteALaRevelation,
  phraseDimanche,
  phraseDuJour,
  portrait,
  reponseAcceptee,
  retraitPermis,
  revelerManche,
  servirLaJournee,
  sousLeVisage,
  temperaments,
  titresDuDimanche,
  titresPasses,
  visibleSousLeVisage,
  bascule,
  type CercleDuJour,
  type CodeTension,
  type ComptesSemaine,
  type ComptesTemperament,
  type Curseur,
  type EtatManche,
  type Geste,
  type IdMembre,
  type Jour,
  type MancheRevelee,
  type MancheServie,
  type MembreCercle,
  type ReponseDatee,
  type ReponseDuJour,
  type ReponseMoteur,
  type TexteMoteur,
  type Temperament,
} from '../../src/regles/index.ts';
import { hasardEcrit, rep, texte } from './aides.ts';

// ------------------------------------------------------------------------------------------------------------------
// Le décor
// ------------------------------------------------------------------------------------------------------------------

const LUNDI = jourDeDate('2026-10-19'); // le lundi de la « semaine 3 »
const DIMANCHE = LUNDI + 6;

const TEXTES: Record<string, TexteMoteur> = {
  A: texte('A', 'S', 0, 'p0 pa c1 c0'),
  B: texte('B', 'P', 1, 'p1 p1 c0 c0'),
  C: texte('C', 'T', 0, 'p0 p1 c1 ca'),
  D: texte('D', 'L', 1, 'p1 p1 c0 c0'),
  E: texte('E', 'P', 0, 'p0 p0 c1 c1'),
  F: texte('F', 'S', 1, 'p1 pa c0 c1'),
  G: texte('G', 'L', 0, 'p0 pa c1 c0'),
  H: texte('H', 'T', 1, 'p1 p1 c0 c0'),
};
/** Le jour de jeu de chaque texte : A le dimanche de la semaine 2, B le lundi … H le dimanche. */
const JOUR: Record<string, Jour> = { A: LUNDI - 1, B: LUNDI, C: LUNDI + 1, D: LUNDI + 2, E: LUNDI + 3, F: LUNDI + 4, G: LUNDI + 5, H: LUNDI + 6 };

const TABLE: Record<string, Record<string, string | null>> = {
  A: { Thomas: 'F · R1', Marie: 'D · R3', Hugo: 'TF · R2', Ines: 'D · R3', Paul: 'D · R4', Lea: null },
  B: { Thomas: 'F · R1', Marie: 'F · R2', Hugo: 'D · R3', Ines: 'TF · R2', Paul: 'D · R3', Lea: null },
  C: { Thomas: null, Marie: 'F · R1', Hugo: 'D · R3', Ines: 'D · R3', Paul: 'N · R4', Lea: null },
  D: { Thomas: 'F · R1', Marie: 'D · R3', Hugo: 'TF · R2', Ines: 'F · R2', Paul: 'D · R4', Lea: null },
  E: { Thomas: 'F · R1', Marie: 'D · R3', Hugo: 'F · R2', Ines: 'TD · R4', Paul: 'N · R1', Lea: 'F · R1' },
  F: { Thomas: 'TF · R1', Marie: 'F · R2', Hugo: 'D · R4', Ines: 'N · R3', Paul: 'D · R3', Lea: null },
  G: { Thomas: 'D · R3', Marie: 'F · R1', Hugo: null, Ines: 'F · R2', Paul: 'F · R1', Lea: null },
  H: { Thomas: 'N · R3', Marie: 'N · R1', Hugo: 'D · R3', Ines: 'F · R1', Paul: 'F · R2', Lea: null },
};
/** Inès a répondu à F à 18h04 (J5) : en retard, acceptée. */
const TARDIVES = new Set(['F:Ines']);

const FAMILLE_MEMBRES: MembreCercle[] = ['Thomas', 'Marie', 'Hugo', 'Ines', 'Paul'].map((id) => ({ id, jourArrivee: LUNDI - 14 }));
const AMIS_MEMBRES: MembreCercle[] = ['Lea', 'Marie', 'Hugo'].map((id) => ({ id, jourArrivee: JOUR.D as Jour }));

function famille(): CercleDuJour {
  return { id: 'Famille', membres: FAMILLE_MEMBRES, eveille: true };
}
function amis(jour: Jour): CercleDuJour {
  // « Amis » n'a pas de manche les jours J1 à J3 ; il se réveille le mercredi à 18h (vérifié plus bas).
  return { id: 'Amis', membres: AMIS_MEMBRES, eveille: jour >= LUNDI + 3 };
}

function reponsesDuJour(t: string): Map<IdMembre, ReponseDuJour> {
  const m = new Map<IdMembre, ReponseDuJour>();
  for (const [p, r] of Object.entries(TABLE[t] ?? {})) if (r) m.set(p, { reponse: rep(r), tardive: TARDIVES.has(`${t}:${p}`) });
  return m;
}
function reponsesBrutes(t: string, membres: readonly MembreCercle[]): Map<IdMembre, ReponseMoteur> {
  const m = new Map<IdMembre, ReponseMoteur>();
  for (const x of membres) {
    const r = TABLE[t]?.[x.id];
    if (r) m.set(x.id, rep(r));
  }
  return m;
}
function niveauxDuCercle(t: string, membres: readonly MembreCercle[]): (1 | 2 | 3 | 4 | 5)[] {
  return [...reponsesBrutes(t, membres).values()].map((r) => r.niveau);
}

function cles(cercle: string, jour: Jour): { surprise: string; hasard: string; cachee: string; ordre: string } {
  const s = `|${cercle}|Marie|${jour}|`;
  return { surprise: `surprise${s}`, hasard: `hasard${s}`, cachee: `cachee${s}`, ordre: `ordre${s}` };
}

/** La journée de Marie : les manches servies. */
function servirMarie(jour: Jour, t: string, script: Record<string, string[]>, curseursVus = new Map<IdMembre, Curseur>()): MancheServie[] {
  const hasard = hasardEcrit(script);
  const r = servirLaJournee({
    devineur: 'Marie',
    jour,
    texte: TEXTES[t] as TexteMoteur,
    cercles: [famille(), amis(jour)],
    reponses: reponsesDuJour(t),
    curseursVus,
    hasard,
  });
  // Chaque tirage donné par regles.md a bien servi.
  for (const k of Object.keys(script)) if (!hasard.utilisees.has(k)) throw new Error(`tirage écrit non utilisé : ${k}`);
  return r;
}

function jouer(servie: MancheServie, gestes: readonly Geste[]): EtatManche {
  let etat = nouvelleManche(servie);
  for (const g of [{ type: 'ouvrir' } as Geste, ...gestes]) {
    const r = appliquerGeste(etat, g);
    if ('refus' in r) throw new Error(`geste refusé : ${r.refus}`);
    etat = r.etat;
  }
  return etat;
}

function auteurs(m: MancheServie): string[] {
  return m.cartes.map((c) => c.auteur);
}

const reveleesDeMarie: MancheRevelee[] = [];
function reveler(etat: EtatManche, jour: Jour, t: string, membres: readonly MembreCercle[]): MancheRevelee {
  const r = revelerManche({
    etat,
    jour,
    texte: t,
    devineur: 'Marie',
    reponses: reponsesBrutes(t, membres),
    ordreArrivee: membres.map((m) => m.id),
  });
  reveleesDeMarie.push(r);
  return r;
}

function phraseDe(qui: string, t: string): string {
  return phraseDuJour(TEXTES[t] as TexteMoteur, rep(TABLE[t]?.[qui] as string)).phrase;
}

// ------------------------------------------------------------------------------------------------------------------

describe('Le décor', () => {
  test('la semaine 3 va du lundi au dimanche ; « Amis » se réveille le mercredi à 18h', () => {
    assert.equal(jourSemaine(LUNDI), 0);
    assert.equal(jourSemaine(DIMANCHE), 6);
    const etat = eveilleLeLendemain({ jour: JOUR.D as Jour, membres: AMIS_MEMBRES, aRepondu: () => false });
    assert.equal(etat.eveille, true, 'trois membres, aucun en pause : manche le jeudi');
  });
});

describe('J1 · Lundi : une manche ordinaire, curseurs flous', () => {
  const jour = LUNDI;
  const [fam, am] = servirMarie(jour, 'A', {
    [cles('Famille', jour).surprise]: ['Paul', 'Ines', 'Thomas'],
    [cles('Famille', jour).hasard]: ['Ines', 'Thomas'],
    [cles('Famille', jour).cachee]: ['Paul'],
    [cles('Famille', jour).ordre]: ['Ines', 'Hugo'],
  }) as [MancheServie, MancheServie];

  test('le choix des cartes : médiane 1/2, surprises, places', () => {
    const d = fam.detail;
    assert.ok(d);
    assert.equal(am.statut, 'endormi');
    assert.equal(d.mediane?.toString(), '1/2');
    assert.deepEqual(
      ['Thomas', 'Hugo', 'Ines', 'Paul'].map((m) => d.possibles.get(m)?.x.toString()),
      ['1/4', '0', '3/4', '3/4'],
    );
    assert.deepEqual(
      ['Hugo', 'Thomas', 'Ines', 'Paul'].map((m) => d.possibles.get(m)?.surprise.toString()),
      ['1/2', '1/4', '1/4', '1/4'],
    );
    assert.deepEqual(d.classement, ['Hugo', 'Paul', 'Ines', 'Thomas']);
    assert.deepEqual(d.places, ['Hugo', 'Paul', 'Ines']);
    assert.deepEqual(d.remplacements, []);
  });
  test('carte « qui et pourquoi » : Paul, en dernier ; ordre Inès, Hugo, Paul ; quatre visages', () => {
    assert.deepEqual(auteurs(fam), ['Ines', 'Hugo', 'Paul']);
    assert.deepEqual(
      fam.cartes.map((c) => c.cachee),
      [false, false, true],
    );
    assert.deepEqual(fam.visages, ['Thomas', 'Hugo', 'Ines', 'Paul']);
  });
  test('18h : verdicts, points, hasard 3/4, avis « rejeté », phrase du jour', () => {
    const etat = jouer(fam, [
      { type: 'poser', carte: 0, visage: 'Thomas' },
      { type: 'poser', carte: 1, visage: 'Hugo' },
      { type: 'poser', carte: 2, visage: 'Paul' },
      { type: 'pourquoi', carte: 2, raison: 4 },
      { type: 'valider' },
    ]);
    const r = reveler(etat, jour, 'A', FAMILLE_MEMBRES);
    assert.deepEqual(
      r.cartes.map((c) => [c.verdict, c.auteur]),
      [
        ['faux', 'Ines'],
        ['juste', 'Hugo'],
        ['juste_et_raison', 'Paul'],
      ],
    );
    assert.equal(r.points, 2);
    assert.equal(r.raisonCacheeTrouvee, true);
    assert.equal(r.hasard.toString(), '3/4');
    const avis = avisDuCercle(niveauxDuCercle('A', FAMILLE_MEMBRES));
    assert.deepEqual(avis?.milieu, [2]);
    assert.equal(avis?.phrase, "Ton cercle, lui, l'aurait rejeté.");
    assert.equal(phraseDe('Marie', 'B'), "Aujourd'hui, tu as fait passer l'innovation avant la précaution.");
  });
});

describe('J2 · Mardi : deux réponses identiques, puis un jumeau', () => {
  const jour = LUNDI + 1;
  const [fam] = servirMarie(jour, 'B', {
    [cles('Famille', jour).surprise]: ['Hugo', 'Paul', 'Thomas'],
    [cles('Famille', jour).hasard]: ['Paul', 'Thomas'],
    [cles('Famille', jour).cachee]: ['Thomas'],
    [cles('Famille', jour).ordre]: ['Hugo', 'Ines'],
  }) as [MancheServie];

  test('Hugo et Paul (D · R3) : Paul, moins bien classé, est remplacé par Thomas', () => {
    const d = fam.detail;
    assert.ok(d);
    assert.equal(d.mediane?.toString(), '1/2');
    assert.deepEqual(d.classement, ['Ines', 'Hugo', 'Paul', 'Thomas']);
    assert.deepEqual(d.remplacements, [{ ecartee: 'Paul', place: 3, remplacante: 'Thomas' }]);
    assert.deepEqual(d.places, ['Ines', 'Hugo', 'Thomas']);
    assert.deepEqual(auteurs(fam), ['Hugo', 'Ines', 'Thomas']);
    assert.equal(fam.cartes[2]?.cachee, true);
  });
  test('18h : le jumeau compte juste, le Mystère compte une tentative sur Hugo ; hasard 1 ; « adopté »', () => {
    const etat = jouer(fam, [
      { type: 'poser', carte: 0, visage: 'Paul' },
      { type: 'poser', carte: 1, visage: 'Ines' },
      { type: 'poser', carte: 2, visage: 'Thomas' },
      { type: 'pourquoi', carte: 2, raison: 2 },
      { type: 'valider' },
    ]);
    const r = reveler(etat, jour, 'B', FAMILLE_MEMBRES);
    assert.deepEqual(
      r.cartes.map((c) => [c.verdict, c.auteur, c.jumeau]),
      [
        ['jumeau', 'Hugo', true],
        ['juste', 'Ines', false],
        ['juste', 'Thomas', false],
      ],
    );
    assert.equal(r.points, 3);
    assert.equal(r.hasard.toString(), '1');
    assert.deepEqual(
      r.cartes.map((c) => c.h.toString()),
      ['1/2', '1/4', '1/4'],
    );
    assert.equal(avisDuCercle(niveauxDuCercle('B', FAMILLE_MEMBRES))?.ligne, 'adopte');
    assert.equal(phraseDe('Marie', 'C'), "Aujourd'hui, tu as fait passer la tradition avant le changement.");
  });
});

describe('J3 · Mercredi : deux cartes identiques servies ensemble', () => {
  const jour = LUNDI + 2;
  const [fam] = servirMarie(jour, 'C', {
    [cles('Famille', jour).cachee]: ['Ines'],
    [cles('Famille', jour).ordre]: ['Paul', 'Hugo'],
  }) as [MancheServie];

  test('trois réponses : toutes servies, Hugo et Inès ensemble ; Thomas proposé', () => {
    assert.deepEqual(fam.detail?.remplacements, []);
    assert.deepEqual(auteurs(fam), ['Paul', 'Hugo', 'Ines']);
    assert.equal(fam.cartes[2]?.cachee, true);
    assert.deepEqual(fam.visages, ['Thomas', 'Hugo', 'Ines', 'Paul']);
  });
  test('18h : redistribution entre cartes identiques ; « partagé » à nombre pair', () => {
    const etat = jouer(fam, [
      { type: 'poser', carte: 0, visage: 'Thomas' },
      { type: 'poser', carte: 1, visage: 'Ines' },
      { type: 'poser', carte: 2, visage: 'Hugo' },
      { type: 'pourquoi', carte: 2, raison: 3 },
      { type: 'valider' },
    ]);
    const r = reveler(etat, jour, 'C', FAMILLE_MEMBRES);
    assert.deepEqual(
      r.cartes.map((c) => [c.auteurServi, c.auteur, c.verdict]),
      [
        ['Paul', 'Paul', 'faux'],
        ['Hugo', 'Ines', 'juste'],
        ['Ines', 'Hugo', 'juste_et_raison'],
      ],
    );
    const avis = avisDuCercle(niveauxDuCercle('C', FAMILLE_MEMBRES));
    assert.deepEqual(avis?.milieu, [2, 3]);
    assert.equal(avis?.phrase, 'Ton cercle, lui, était partagé.');
    assert.equal(phraseDe('Marie', 'D'), "Aujourd'hui, tu as fait passer la décision locale avant la décision nationale.");
  });
});

describe('J4 · Jeudi : deux cercles, et Hugo dans les deux', () => {
  const jour = LUNDI + 3;
  const [fam, am] = servirMarie(jour, 'D', {
    [cles('Famille', jour).cachee]: ['Ines'],
    [cles('Famille', jour).ordre]: ['Paul', 'Thomas'],
  }) as [MancheServie, MancheServie];

  test('R8 : sans Hugo, « Amis » serait vide : il y est servi, et absent de « Famille »', () => {
    assert.deepEqual(auteurs(fam), ['Paul', 'Thomas', 'Ines']);
    assert.equal(fam.cartes[2]?.cachee, true);
    assert.deepEqual(fam.visages, ['Thomas', 'Ines', 'Paul']);
    assert.deepEqual(auteurs(am), ['Hugo']);
    assert.equal(am.cartes[0]?.cachee, true, 'une manche d’une seule carte est la carte « qui et pourquoi »');
    assert.deepEqual(am.visages, ['Lea', 'Hugo']);
  });
  test('18h : une révélation, cercle par cercle ; 1 point dans chacun ; avis seulement dans « Famille »', () => {
    const rf = reveler(
      jouer(fam, [
        { type: 'poser', carte: 0, visage: 'Paul' },
        { type: 'poser', carte: 1, visage: 'Ines' },
        { type: 'poser', carte: 2, visage: 'Thomas' },
        { type: 'valider' },
      ]),
      jour,
      'D',
      FAMILLE_MEMBRES,
    );
    assert.deepEqual(
      rf.cartes.map((c) => [c.verdict, c.auteur]),
      [
        ['juste', 'Paul'],
        ['faux', 'Thomas'],
        ['faux', 'Ines'],
      ],
    );
    const ra = revelerManche({
      etat: jouer(am, [{ type: 'poser', carte: 0, visage: 'Hugo' }, { type: 'pourquoi', carte: 0, raison: 1 }, { type: 'valider' }]),
      jour,
      texte: 'D',
      devineur: 'Marie',
      reponses: reponsesBrutes('D', AMIS_MEMBRES),
      ordreArrivee: AMIS_MEMBRES.map((m) => m.id),
    });
    assert.deepEqual(
      ra.cartes.map((c) => c.verdict),
      ['juste'],
    );
    assert.equal(rf.points, 1);
    assert.equal(ra.points, 1);
    assert.equal(avisDuCercle(niveauxDuCercle('D', FAMILLE_MEMBRES))?.ligne, 'adopte');
    assert.equal(avisDuCercle(niveauxDuCercle('D', AMIS_MEMBRES)), null);
    assert.equal(phraseDe('Marie', 'E'), "Aujourd'hui, tu as fait passer l'innovation avant la précaution.");
  });
});

describe('J5 · Vendredi : 18h arrive en pleine manche', () => {
  const jour = LUNDI + 4;
  const [fam, am] = servirMarie(jour, 'E', {
    [`r8|Marie|${jour}|Hugo|`]: ['Famille'],
    [cles('Famille', jour).surprise]: ['Paul', 'Hugo', 'Thomas'],
    [cles('Famille', jour).hasard]: ['Hugo', 'Thomas'],
    [cles('Famille', jour).cachee]: ['Hugo'],
    [cles('Famille', jour).ordre]: ['Ines', 'Paul'],
  }) as [MancheServie, MancheServie];

  test('R8 par tirage : Hugo dans « Famille » ; « Amis » n’a qu’un visage proposé', () => {
    const d = fam.detail;
    assert.ok(d);
    assert.equal(d.mediane?.toString(), '3/8');
    assert.deepEqual(
      ['Ines', 'Thomas', 'Hugo', 'Paul'].map((m) => d.possibles.get(m)?.surprise.toString()),
      ['5/8', '1/8', '1/8', '1/8'],
    );
    assert.deepEqual(d.places, ['Ines', 'Paul', 'Hugo']);
    assert.deepEqual(auteurs(fam), ['Ines', 'Paul', 'Hugo']);
    assert.deepEqual(auteurs(am), ['Lea']);
    assert.deepEqual(am.visages, ['Lea']);
  });
  test('la manche non validée se ferme telle quelle : la carte vide est passée', () => {
    let etat = jouer(fam, [
      { type: 'poser', carte: 0, visage: 'Ines' },
      { type: 'poser', carte: 1, visage: 'Thomas' },
    ]);
    assert.equal(etat.validee, false);
    const r = reveler(etat, jour, 'E', FAMILLE_MEMBRES);
    assert.deepEqual(
      r.cartes.map((c) => [c.verdict, c.auteur]),
      [
        ['juste', 'Ines'],
        ['faux', 'Paul'],
        ['passe', 'Hugo'],
      ],
    );
    assert.equal(r.cartes[2]?.passeComptee, true);
    // Paul avait validé à 14h : sa manche est figée.
    etat = jouer(fam, [{ type: 'valider' }]);
    const refus = appliquerGeste(etat, { type: 'poser', carte: 0, visage: 'Ines' });
    assert.deepEqual(refus, { refus: 'deja_validee' });
    const ra = revelerManche({
      etat: jouer(am, [{ type: 'poser', carte: 0, visage: 'Lea' }, { type: 'pourquoi', carte: 0, raison: 1 }, { type: 'valider' }]),
      jour,
      texte: 'E',
      devineur: 'Marie',
      reponses: reponsesBrutes('E', AMIS_MEMBRES),
      ordreArrivee: AMIS_MEMBRES.map((m) => m.id),
    });
    assert.deepEqual(
      ra.cartes.map((c) => c.verdict),
      ['juste_et_raison'],
    );
  });
  test('avis du cercle : « partagé » dans « Famille », « adopté » dans « Amis » (trois réponses)', () => {
    assert.equal(avisDuCercle(niveauxDuCercle('E', FAMILLE_MEMBRES))?.ligne, 'partage');
    const a = avisDuCercle(niveauxDuCercle('E', AMIS_MEMBRES));
    assert.equal(a?.ligne, 'adopte');
  });
  test('les quatre phrases du jour (texte F)', () => {
    assert.equal(phraseDe('Thomas', 'F'), "Aujourd'hui, tu as fait passer la liberté avant la sécurité.");
    assert.equal(phraseDe('Marie', 'F'), "Aujourd'hui, tu as penché vers la liberté.");
    assert.equal(phraseDe('Hugo', 'F'), "Aujourd'hui, tu as donné du poids à la sécurité comme à la liberté.");
    assert.equal(phraseDe('Ines', 'F'), "Aujourd'hui, tu n'as penché ni vers la sécurité ni vers la liberté.");
    assert.equal(phraseDe('Paul', 'F'), "Aujourd'hui, tu as fait passer la sécurité avant la liberté.");
  });
  test('Inès ouvre Répondre à 17h58 et valide à 18h04 : acceptée, en retard', () => {
    const fin = bascule(JOUR.F as Jour);
    const r = reponseAcceptee({ jourTexte: JOUR.F as Jour, instantEnvoi: fin + 4 * 60_000, instantAffichageRepondre: fin - 2 * 60_000 });
    assert.deepEqual(r, { acceptee: true, tardive: true });
  });
});

describe('J6 · Samedi : une manche à deux cartes', () => {
  const jour = LUNDI + 5;
  const [fam, am] = servirMarie(jour, 'F', {
    [cles('Famille', jour).cachee]: ['Thomas'],
  }) as [MancheServie, MancheServie];

  test('la réponse en retard d’Inès n’est pas servie ; Hugo va dans « Amis » ; deux cartes', () => {
    assert.deepEqual(auteurs(am), ['Hugo']);
    assert.deepEqual(auteurs(fam), ['Paul', 'Thomas']);
    assert.equal(fam.cartes[1]?.cachee, true, 'une manche à deux cartes met la carte « qui et pourquoi » en second');
    assert.deepEqual(fam.visages, ['Thomas', 'Ines', 'Paul']);
  });
  test('Hugo n’ouvre pas le jeu : sa manche n’a pas de cartes, la révélation commence au vote', () => {
    const [, amHugo] = servirLaJournee({
      devineur: 'Hugo',
      jour,
      texte: TEXTES.F as TexteMoteur,
      cercles: [famille(), amis(jour)],
      reponses: reponsesDuJour('F'),
      curseursVus: new Map(),
      hasard: hasardEcrit({}),
    }) as [MancheServie, MancheServie];
    const r = revelerManche({ etat: nouvelleManche(amHugo), jour, texte: 'F', devineur: 'Hugo', reponses: new Map(), ordreArrivee: [] });
    assert.equal(r.ouverte, false);
    assert.deepEqual(r.cartes, []);
  });
  test('18h : trois points ; « partagé » avec la réponse en retard ; rien dans « Amis »', () => {
    const rf = reveler(
      jouer(fam, [
        { type: 'poser', carte: 0, visage: 'Paul' },
        { type: 'poser', carte: 1, visage: 'Thomas' },
        { type: 'pourquoi', carte: 1, raison: 1 },
        { type: 'valider' },
      ]),
      jour,
      'F',
      FAMILLE_MEMBRES,
    );
    assert.deepEqual(
      rf.cartes.map((c) => c.verdict),
      ['juste', 'juste_et_raison'],
    );
    const ra = revelerManche({
      etat: jouer(am, [{ type: 'poser', carte: 0, visage: 'Hugo' }, { type: 'pourquoi', carte: 0, raison: 3 }, { type: 'valider' }]),
      jour,
      texte: 'F',
      devineur: 'Marie',
      reponses: reponsesBrutes('F', AMIS_MEMBRES),
      ordreArrivee: AMIS_MEMBRES.map((m) => m.id),
    });
    assert.deepEqual(
      ra.cartes.map((c) => c.verdict),
      ['juste'],
    );
    const avis = avisDuCercle(niveauxDuCercle('F', FAMILLE_MEMBRES));
    assert.deepEqual(avis?.comptes, [0, 2, 1, 1, 1]);
    assert.equal(avis?.ligne, 'partage');
    assert.equal(avisDuCercle(niveauxDuCercle('F', AMIS_MEMBRES)), null);
    assert.equal(phraseDe('Marie', 'G'), "Aujourd'hui, tu as fait passer la décision locale avant la décision nationale.");
  });
});

describe('J7 · Dimanche : les titres et la phrase de la semaine', () => {
  const jour = DIMANCHE;
  const [fam, am] = servirMarie(jour, 'G', {
    [cles('Famille', jour).cachee]: ['Thomas'],
    [cles('Famille', jour).ordre]: ['Paul', 'Ines'],
  }) as [MancheServie, MancheServie];

  test('« Amis » : rien à deviner ; « Famille » : Paul, Inès, puis Thomas ; Marie trouve tout', () => {
    assert.equal(am.statut, 'rien');
    assert.deepEqual(auteurs(fam), ['Paul', 'Ines', 'Thomas']);
    // Hugo n'a pas répondu à G : il n'est proposé que dans « Famille », la seule de ses manches qui a des cartes (R8).
    assert.deepEqual(fam.visages, ['Thomas', 'Hugo', 'Ines', 'Paul']);
    assert.deepEqual(am.visages, ['Lea']);
    const r = reveler(
      jouer(fam, [
        { type: 'poser', carte: 0, visage: 'Paul' },
        { type: 'poser', carte: 1, visage: 'Ines' },
        { type: 'poser', carte: 2, visage: 'Thomas' },
        { type: 'pourquoi', carte: 2, raison: 3 },
        { type: 'valider' },
      ]),
      jour,
      'G',
      FAMILLE_MEMBRES,
    );
    assert.equal(r.points, 3);
    assert.equal(r.raisonCacheeTrouvee, true);
    assert.equal(avisDuCercle(niveauxDuCercle('G', FAMILLE_MEMBRES))?.ligne, 'adopte');
    assert.equal(avisDuCercle(niveauxDuCercle('G', AMIS_MEMBRES)), null);
    assert.equal(phraseDe('Marie', 'H'), "Aujourd'hui, tu n'as penché ni vers la tradition ni vers le changement.");
    assert.deepEqual(formeMessage18h({ avaitDesCartes: true, avaitReponduAuTexteRevele: true, titresCeSoir: true }), { forme: 'cartes', titres: true });
  });

  test('la ligne de Marie dans les comptes de la semaine, tirée de ses sept manches', () => {
    const c = comptesDeLaSemaine(reveleesDeMarie, DIMANCHE, 'Famille');
    assert.deepEqual(c.parDevineur.get('Marie'), { joursAvecCartes: 7, justes: 14, erreurs: 5, passes: 1, raisonsTrouvees: 4 });
  });

  test('les titres de « Famille » : Marie Le Devin, Inès Le Mystère, trois Fidèles, la surprise D, pas de Sans-Faute', () => {
    const parDevineur = new Map([
      ['Thomas', { joursAvecCartes: 6, justes: 9, erreurs: 4, passes: 0, raisonsTrouvees: 2 }],
      ['Marie', { joursAvecCartes: 7, justes: 14, erreurs: 5, passes: 1, raisonsTrouvees: 4 }],
      ['Hugo', { joursAvecCartes: 6, justes: 11, erreurs: 0, passes: 2, raisonsTrouvees: 2 }],
      ['Ines', { joursAvecCartes: 7, justes: 9, erreurs: 8, passes: 1, raisonsTrouvees: 1 }],
      ['Paul', { joursAvecCartes: 7, justes: 14, erreurs: 6, passes: 0, raisonsTrouvees: 3 }],
    ]);
    const parAuteur = new Map([
      ['Thomas', { tentatives: 15, erreurs: 4 }],
      ['Marie', { tentatives: 16, erreurs: 4 }],
      ['Hugo', { tentatives: 16, erreurs: 4 }],
      ['Ines', { tentatives: 18, erreurs: 6 }],
      ['Paul', { tentatives: 15, erreurs: 5 }],
    ]);
    const parTexte = new Map([
      ['A', { attributions: 14, fausses: 4 }],
      ['B', { attributions: 13, fausses: 2 }],
      ['C', { attributions: 9, fausses: 3 }],
      ['D', { attributions: 10, fausses: 5 }],
      ['E', { attributions: 8, fausses: 4 }],
      ['F', { attributions: 12, fausses: 3 }],
      ['G', { attributions: 14, fausses: 2 }],
    ]);
    // Contrôle de regles.md : 80 attributions et 23 erreurs dans les trois tableaux ; 57 justes.
    const somme = (l: number[]): number => l.reduce((a, b) => a + b, 0);
    assert.equal(somme([...parTexte.values()].map((x) => x.attributions)), 80);
    assert.equal(somme([...parAuteur.values()].map((x) => x.tentatives)), 80);
    assert.equal(somme([...parDevineur.values()].map((x) => x.erreurs)), 23);
    assert.equal(somme([...parDevineur.values()].map((x) => x.justes)), 57);
    const comptes: ComptesSemaine = { parDevineur, parAuteur, parTexte };
    const textesDeLaSemaine = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const t = titresDuDimanche({
      cercle: 'Famille',
      dimanche: DIMANCHE,
      eveilleDimanche: true,
      membres: FAMILLE_MEMBRES,
      comptes,
      aRepondu: (m, j) => TABLE[textesDeLaSemaine[j - LUNDI] as string]?.[m] != null,
      hasard: hasardEcrit({}),
    });
    assert.ok(t);
    assert.deepEqual(t.devin, { titulaire: 'Marie', departage: 'raisons' });
    assert.deepEqual(t.mystere, { titulaire: 'Ines', departage: 'erreurs' });
    assert.deepEqual(t.fideles, ['Marie', 'Ines', 'Paul']);
    assert.deepEqual(t.surprise, { texte: 'D', departage: 'erreurs' });
    assert.deepEqual(t.sansFaute, []);
  });

  test('« Amis » : personne n’est Le Fidèle (le cercle est né mercredi)', () => {
    const t = titresDuDimanche({
      cercle: 'Amis',
      dimanche: DIMANCHE,
      eveilleDimanche: true,
      membres: AMIS_MEMBRES,
      comptes: { parDevineur: new Map(), parAuteur: new Map(), parTexte: new Map() },
      aRepondu: () => true,
      hasard: hasardEcrit({}),
    });
    assert.deepEqual(t?.fideles, []);
  });

  const reponsesSemaineMarie: ReponseDatee[] = ['B', 'C', 'D', 'E', 'F', 'G', 'H'].map((t, i) => ({
    texte: TEXTES[t] as TexteMoteur,
    reponse: rep(TABLE[t]?.Marie as string),
    entree: false,
    jour: JOUR[t] as Jour,
    instant: i,
  }));

  test('la phrase de la semaine de Marie : P et L à égalité, l’ordre des tensions retient P', () => {
    const toutes: ReponseDatee[] = [
      { texte: TEXTES.A as TexteMoteur, reponse: rep('D · R3'), entree: false, jour: JOUR.A as Jour, instant: -1 },
      ...reponsesSemaineMarie,
    ];
    const p = phraseDimanche({ portrait: portrait(toutes), nettesAuparavant: [], reponsesSemaine: reponsesSemaineMarie });
    assert.equal(p.cas, 'difference');
    assert.equal(p.phrase, "Cette semaine, entre précaution et innovation, tu as le plus souvent choisi l'innovation.");
    assert.equal(p.poids.P.pole1.toString(), '2');
    assert.equal(p.poids.L.pole0.toString(), '2');
    assert.equal(p.poids.T.comptent, 1);
    assert.equal(p.poids.S.comptent, 1);
    assert.equal(p.poids.S.pole1.toString(), '1/2');
  });

  test('les deux autres formes, et pas de phrase chez qui a un curseur net', () => {
    const P1 = texte('P1', 'P', 1, 'p1 p1 c0 c0');
    const P2 = texte('P2', 'P', 1, 'p1 p1 c0 c0');
    const semaine: ReponseDatee[] = [
      { texte: P1, reponse: rep('F · R1'), entree: false, jour: LUNDI, instant: 1 },
      { texte: P2, reponse: rep('D · R3'), entree: false, jour: LUNDI + 1, instant: 2 },
    ];
    const egal = phraseDimanche({ portrait: portrait(semaine), nettesAuparavant: [], reponsesSemaine: semaine });
    assert.equal(egal.phrase, "Cette semaine, entre précaution et innovation, tu as penché autant d'un côté que de l'autre.");
    const floue = phraseDimanche({ portrait: portrait([]), nettesAuparavant: [], reponsesSemaine: [] });
    assert.equal(floue.phrase, 'Cette semaine, ton portrait est encore flou. Chaque réponse le précise.');
    const avecNet = { ...portrait([]), S: curseurDepuis(8, 8) };
    const aucune = phraseDimanche({ portrait: avecNet, nettesAuparavant: ['S'], reponsesSemaine: [] });
    assert.equal(aucune.cas, 'aucune');
    assert.equal(aucune.phrase, null);
  });
});

// ------------------------------------------------------------------------------------------------------------------
// Semaine 13
// ------------------------------------------------------------------------------------------------------------------

const LUNDI13 = LUNDI + 70;
const MARDI13 = LUNDI13 + 1;

/** Un historique de réponses à des textes S d'arbitrage net vers un pôle (outil). */
function historique(qui: string, n: number, pole: 0 | 1, depuis: number, tension: CodeTension = 'S'): ReponseDatee[] {
  return Array.from({ length: n }, (_, i) => ({
    texte: texte(`${qui}-${tension}${i}`, tension, 1, 'p1 p1 c0 c0'),
    reponse: rep(pole === 1 ? 'F · R1' : 'D · R3'),
    entree: false,
    jour: depuis + i,
    instant: (depuis + i) * 1000,
  }));
}

describe('J8 · Semaine 13, mardi : un curseur net, un Pas de Côté, une barre pleine', () => {
  const K = texte('K', 'S', 0, 'p0 p0 c1 c1');
  const N = texte('N', 'L', 0, 'p0 pa c1 c0');
  const reponsesK = new Map<IdMembre, ReponseDuJour>([
    ['Thomas', { reponse: rep('TD · R3') }],
    ['Hugo', { reponse: rep('F · R1') }],
    ['Ines', { reponse: rep('F · R2') }],
    ['Paul', { reponse: rep('D · R3') }],
  ]);
  const curseursVus = new Map<IdMembre, Curseur>([
    ['Thomas', curseurDepuis(9, 8)],
    ['Hugo', curseurDepuis(F(13, 2), 1)],
    ['Ines', curseurDepuis(8, 0)],
    ['Paul', curseurDepuis(12, 0)],
  ]);

  test('les curseurs vus par Marie', () => {
    assert.deepEqual(
      [...curseursVus.values()].map((c) => [c.c.toString(), c.net]),
      [
        ['10/13', true],
        ['2/7', false],
        ['1/6', true],
        ['1/8', true],
      ],
    );
  });

  test('la surprise par le curseur net ; Paul, Hugo, puis Inès tirée ; Hugo « qui et pourquoi »', () => {
    const c = cles('Famille', MARDI13);
    const [fam] = servirLaJournee({
      devineur: 'Marie',
      jour: MARDI13,
      texte: K,
      cercles: [{ id: 'Famille', membres: FAMILLE_MEMBRES, eveille: true }],
      reponses: reponsesK,
      curseursVus,
      hasard: hasardEcrit({ [c.hasard]: ['Ines', 'Thomas'], [c.cachee]: ['Hugo'], [c.ordre]: ['Paul', 'Ines'] }),
    }) as [MancheServie];
    const d = fam.detail;
    assert.ok(d);
    assert.deepEqual(
      ['Thomas', 'Hugo', 'Ines', 'Paul'].map((m) => [d.possibles.get(m)?.x.toString(), d.possibles.get(m)?.surprise.toString(), d.possibles.get(m)?.parCurseur]),
      [
        ['1', '3/13', true],
        ['1/4', '1/4', false],
        ['1/4', '1/12', true],
        ['3/4', '5/8', true],
      ],
    );
    assert.equal(d.mediane?.toString(), '1/2');
    assert.deepEqual(d.classement, ['Paul', 'Hugo', 'Thomas', 'Ines']);
    assert.deepEqual(auteurs(fam), ['Paul', 'Ines', 'Hugo']);
    const r = revelerManche({
      etat: jouer(fam, [
        { type: 'poser', carte: 0, visage: 'Thomas' },
        { type: 'poser', carte: 1, visage: 'Ines' },
        { type: 'poser', carte: 2, visage: 'Hugo' },
        { type: 'pourquoi', carte: 2, raison: 1 },
        { type: 'valider' },
      ]),
      jour: MARDI13,
      texte: 'K',
      devineur: 'Marie',
      reponses: new Map([...reponsesK].map(([m, x]) => [m, x.reponse])),
      ordreArrivee: FAMILLE_MEMBRES.map((m) => m.id),
    });
    assert.deepEqual(
      r.cartes.map((x) => [x.verdict, x.auteur]),
      [
        ['faux', 'Paul'],
        ['juste', 'Ines'],
        ['juste_et_raison', 'Hugo'],
      ],
    );
  });

  test('Le Pas de Côté de Paul, annoncé à la révélation de K ; il vit jusqu’aux titres de dimanche', () => {
    const avant = historique('Paul', 12, 0, LUNDI13 - 40);
    const sienne: ReponseDatee = { texte: K, reponse: rep('D · R3'), entree: false, jour: LUNDI13, instant: LUNDI13 * 1000 };
    const toutes = [...avant, sienne];
    const cur = curseur({ W: F(12), Swp: F(0) });
    assert.equal(cur.c.toString(), '1/8');
    assert.equal(pasDeCote(toutes, sienne), true);
    assert.deepEqual(pasDeCoteALaRevelation('K', new Map([['Paul', toutes]])), ['Paul']);
    const apres = portrait(toutes).S;
    assert.equal(apres.W.toString(), '13');
    assert.equal(apres.c.toString(), '3/17');
    assert.ok(apres.c.moins(F(1, 2)).abs().inf(F(7, 20)), 'un nouveau Pas de Côté n’est pas encore possible');
    // Annoncé à la fin du mardi : sous le visage du mercredi au dimanche, jusqu'aux titres.
    assert.equal(visibleSousLeVisage(MARDI13, MARDI13), false);
    assert.equal(visibleSousLeVisage(MARDI13, MARDI13 + 1), true);
    assert.equal(visibleSousLeVisage(MARDI13, LUNDI13 + 6), true);
    assert.equal(visibleSousLeVisage(MARDI13, LUNDI13 + 7), false);
  });

  test('Marie répond à N : son curseur L devient net ; sa soixantième réponse remplit la barre', () => {
    const avantL = [...historique('Marie', 6, 0, LUNDI13 - 50, 'L'), ...historique('Marie', 1, 1, LUNDI13 - 30, 'L').map((r) => ({ ...r, texte: { ...r.texte, id: 'Marie-L-x' } }))];
    const l0 = portrait(avantL).L;
    assert.deepEqual([l0.W.toString(), l0.c.toString(), l0.net], ['7', '3/11', false]);
    const n: ReponseDatee = { texte: N, reponse: rep('F · R1'), entree: false, jour: MARDI13, instant: MARDI13 * 1000 };
    assert.equal(phraseDuJour(N, n.reponse).phrase, "Aujourd'hui, tu as fait passer la décision locale avant la décision nationale.");
    const l1 = portrait([...avantL, n]).L;
    assert.deepEqual([l1.W.toString(), l1.c.toString(), l1.net], ['8', '1/4', true]);
    assert.deepEqual(barre(59), { crans: 59, sur: 60, pleine: false });
    assert.deepEqual(barre(60), { crans: 60, sur: 60, pleine: true });
  });

  test('Moi, chez Marie : l’ordre des huit curseurs et leurs largeurs', () => {
    const p: Record<CodeTension, Curseur> = {
      P: curseurDepuis(F(17, 2), F(15, 2)),
      L: curseurDepuis(8, 1),
      S: curseurDepuis(6, F(9, 2)),
      T: curseurDepuis(5, 2),
      SR: curseurDepuis(3, 1),
      EM: curseurDepuis(2, 1),
      SO: curseurDepuis(F(3, 2), 0),
      EP: curseurDepuis(0, 0),
    };
    assert.deepEqual(ordreMoi(p), ['P', 'L', 'S', 'T', 'SR', 'EM', 'SO', 'EP']);
    assert.deepEqual(
      ordreMoi(p).map((t) => [p[t].c.toString(), p[t].net ? 'net' : p[t].l.toString()]),
      [
        ['19/25', 'net'],
        ['1/4', 'net'],
        ['13/20', '17/40'],
        ['4/9', '41/80'],
        ['3/7', '11/16'],
        ['1/2', '31/40'],
        ['4/11', '131/160'],
        ['1/2', '19/20'],
      ],
    );
  });
});

describe('J9 · Semaine 13, dimanche : une tension devenue nette, les tempéraments', () => {
  const DIM13 = LUNDI13 + 6;

  test('la phrase de la semaine : L est devenue nette', () => {
    const p = { ...portrait([]), P: curseurDepuis(F(17, 2), F(15, 2)), L: curseurDepuis(8, 1) };
    const r = phraseDimanche({ portrait: p, nettesAuparavant: ['P'], reponsesSemaine: [] });
    assert.equal(r.cas, 'nette');
    assert.deepEqual(r.devenues, ['L']);
    assert.equal(r.phrase, 'Entre décision locale et décision nationale, tu choisis le plus souvent la décision locale.');
  });

  const vide: ComptesTemperament = { reponsesCercle: 0, cotePeuSuivi: 0, textesPartages: 0, neutreAuMilieu: 0, reponses: 0, neutres: 0, tres: 0 };
  const ancien = DIM13 - 80;
  const calc = (comptes: Partial<ComptesTemperament>, taille: number, precedents: Temperament[] = []) =>
    temperaments({ dimanche: DIM13, comptes: { ...vide, ...comptes }, tailleCercle: taille, premiereReponseCercle: ancien, premiereReponse: ancien, precedents: new Set(precedents) });

  test('« Famille » (5 membres)', () => {
    // Thomas : 19 réponses, il perd ceux qu'il avait.
    assert.deepEqual(calc({ reponsesCercle: 19, cotePeuSuivi: 10, reponses: 19, neutres: 10 }, 5, ['original', 'mesure']), { cercle: [], personne: [] });
    // Marie : Le Pont gardé (7/31 ≥ 1/5) ; sans l'avoir eu, elle ne l'obtiendrait pas (7/31 < 1/4).
    const marie = { reponsesCercle: 50, textesPartages: 31, neutreAuMilieu: 7, reponses: 50, neutres: 8, tres: 5 };
    assert.deepEqual(calc(marie, 5, ['pont']).cercle, ['pont']);
    assert.deepEqual(calc(marie, 5).cercle, []);
    // Paul : L'Original, 14/52 ≥ 1/4.
    assert.deepEqual(calc({ reponsesCercle: 52, cotePeuSuivi: 14, reponses: 52 }, 5).cercle, ['original']);
    // Hugo : Le Tranché, 24/47 ≥ 1/2.
    assert.deepEqual(calc({ reponsesCercle: 47, reponses: 47, tres: 24 }, 5).personne, ['tranche']);
    // Inès : Le Mesuré, 15/44 ≥ 1/3.
    assert.deepEqual(calc({ reponsesCercle: 44, reponses: 44, neutres: 15 }, 5).personne, ['mesure']);
  });

  test('« Amis » (3 membres) : Marie est L’Original (19/44 ≥ 2/5) ; Moi et sous les visages', () => {
    assert.deepEqual(calc({ reponsesCercle: 44, cotePeuSuivi: 19, reponses: 50 }, 3).cercle, ['original']);
    assert.deepEqual(
      dansMoi(
        [
          { nom: 'Famille', temperaments: ['pont'] },
          { nom: 'Amis', temperaments: ['original'] },
        ],
        [],
      ),
      ["L'Original (Amis)", 'Le Pont (Famille)'],
    );
    assert.deepEqual(sousLeVisage(['pont'], []), ['Le Pont']);
    assert.deepEqual(sousLeVisage(['original'], []), ["L'Original"]);
  });
});

describe('J10 · Semaine 14 : un départ, une arrivée, un texte corrigé', () => {
  const LUNDI14 = LUNDI13 + 7;
  const MARDI14 = LUNDI14 + 1;
  const M = texte('M', 'T', 1, 'p1 p1 c0 c0');
  const reponsesM = new Map<IdMembre, ReponseDuJour>([
    ['Thomas', { reponse: rep('F · R1') }],
    ['Marie', { reponse: rep('F · R2') }],
    ['Hugo', { reponse: rep('F · R2') }],
    ['Ines', { reponse: rep('TF · R1') }],
    ['Paul', { reponse: rep('TD · R3') }],
  ]);

  test('Paul quitte « Famille » le mardi à 11h : sa carte disparaît, la carte où il était posé redevient vide', () => {
    const c = cles('Famille', MARDI14);
    const [fam] = servirLaJournee({
      devineur: 'Marie',
      jour: MARDI14,
      texte: M,
      cercles: [{ id: 'Famille', membres: FAMILLE_MEMBRES, eveille: true }],
      reponses: reponsesM,
      curseursVus: new Map(),
      hasard: hasardEcrit({
        [c.surprise]: ['Thomas', 'Hugo'],
        [c.hasard]: ['Thomas'],
        [c.cachee]: ['Thomas'],
        [c.ordre]: ['Ines', 'Paul'],
      }),
    }) as [MancheServie];
    assert.deepEqual(auteurs(fam).sort(), ['Ines', 'Paul', 'Thomas']);
    assert.equal(fam.cartes[2]?.auteur, 'Thomas');
    const iInes = fam.cartes.findIndex((x) => x.auteur === 'Ines');
    const brouillon = jouer(fam, [{ type: 'poser', carte: iInes, visage: 'Paul' }]);
    const apres = appliquerDepart(brouillon, 'Paul');
    assert.deepEqual(
      apres.cartes.map((x) => [x.auteur, x.visage, x.videeParDepart]),
      [
        ['Ines', null, true],
        ['Thomas', null, false],
      ],
    );
    assert.equal(apres.cartes[1]?.cachee, true, 'la carte « qui et pourquoi » de Thomas reste');
    assert.ok(!apres.visages.includes('Paul'));
    // Vide à 18h : passée, sans compter contre Le Sans-Faute.
    const membresApres = FAMILLE_MEMBRES.filter((m) => m.id !== 'Paul');
    const repApres = new Map([...reponsesM].filter(([m]) => m !== 'Paul').map(([m, x]) => [m, x.reponse]));
    const r = revelerManche({ etat: apres, jour: MARDI14, texte: 'M', devineur: 'Marie', reponses: repApres, ordreArrivee: membresApres.map((m) => m.id) });
    assert.equal(r.cartes[0]?.verdict, 'passe');
    assert.equal(r.cartes[0]?.passeComptee, false);
    // Validée avant le départ : la carte redevient vide de même, la manche ne se rouvre pas.
    const validee = appliquerDepart(jouer(fam, [{ type: 'poser', carte: iInes, visage: 'Paul' }, { type: 'valider' }]), 'Paul');
    assert.equal(validee.validee, true);
    assert.equal(validee.cartes[0]?.visage, null);
    assert.deepEqual(appliquerGeste(validee, { type: 'poser', carte: 0, visage: 'Hugo' }), { refus: 'deja_validee' });
    // L'avis du cercle sur M compte quatre réponses.
    assert.equal(avisDuCercle([...repApres.values()].map((x) => x.niveau))?.comptes.reduce((a, b) => a + b, 0), 4);
  });

  test('« Semaine 13 · Le Devin : un ancien membre » ; Paul ne peut plus être Le Mystère', () => {
    const actuels = new Set(FAMILLE_MEMBRES.filter((m) => m.id !== 'Paul').map((m) => m.id));
    assert.deepEqual(titresPasses([{ dimanche: LUNDI13 + 6, titre: 'devin', titulaire: 'Paul' }], actuels), [
      { dimanche: LUNDI13 + 6, titre: 'devin', titulaire: 'ancien_membre' },
    ]);
    const t = titresDuDimanche({
      cercle: 'Famille',
      dimanche: LUNDI14 + 6,
      eveilleDimanche: true,
      membres: FAMILLE_MEMBRES.filter((m) => m.id !== 'Paul'),
      comptes: { parDevineur: new Map(), parAuteur: new Map([['Paul', { tentatives: 20, erreurs: 20 }], ['Hugo', { tentatives: 6, erreurs: 1 }]]), parTexte: new Map() },
      aRepondu: () => true,
      hasard: hasardEcrit({}),
    });
    assert.equal(t?.mystere.titulaire, 'Hugo');
  });

  test('Zoé entre le mercredi à 10h : pas proposée sur le texte du mardi, proposée et servie le jeudi ; pas Fidèle', () => {
    const MERCREDI14 = LUNDI14 + 2;
    const avecZoe: MembreCercle[] = [...FAMILLE_MEMBRES.filter((m) => m.id !== 'Paul'), { id: 'Zoe', jourArrivee: MERCREDI14 }];
    const rep1 = new Map<IdMembre, ReponseDuJour>([
      ['Thomas', { reponse: rep('F · R1') }],
      ['Hugo', { reponse: rep('D · R3') }],
      ['Ines', { reponse: rep('N · R1') }],
    ]);
    const mercredi = servirLaJournee({
      devineur: 'Marie',
      jour: MERCREDI14,
      texte: texte('Mardi', 'P', 1, 'p1 p1 c0 c0'),
      cercles: [{ id: 'Famille', membres: avecZoe, eveille: true }],
      reponses: rep1,
      curseursVus: new Map(),
      hasard: hasardEcrit({}),
    })[0] as MancheServie;
    assert.ok(!mercredi.visages.includes('Zoe'));
    // Zoé joue la manche ouverte tout de suite (D-039).
    const deZoe = servirLaJournee({
      devineur: 'Zoe',
      jour: MERCREDI14,
      texte: texte('Mardi', 'P', 1, 'p1 p1 c0 c0'),
      cercles: [{ id: 'Famille', membres: avecZoe, eveille: true }],
      reponses: rep1,
      curseursVus: new Map(),
      hasard: hasardEcrit({}),
    })[0] as MancheServie;
    assert.equal(deZoe.statut, 'cartes');
    const jeudi = servirLaJournee({
      devineur: 'Marie',
      jour: MERCREDI14 + 1,
      texte: texte('Mercredi', 'P', 1, 'p1 p1 c0 c0'),
      cercles: [{ id: 'Famille', membres: avecZoe, eveille: true }],
      reponses: new Map([...rep1, ['Zoe', { reponse: rep('TF · R2') }]]),
      curseursVus: new Map(),
      hasard: hasardEcrit({}),
    })[0] as MancheServie;
    assert.ok(jeudi.visages.includes('Zoe'));
    assert.ok(jeudi.cartes.some((x) => x.auteur === 'Zoe'));
    const t = titresDuDimanche({
      cercle: 'Famille',
      dimanche: LUNDI14 + 6,
      eveilleDimanche: true,
      membres: avecZoe,
      comptes: { parDevineur: new Map(), parAuteur: new Map(), parTexte: new Map() },
      aRepondu: () => true,
      hasard: hasardEcrit({}),
    });
    assert.ok(!t?.fideles.includes('Zoe'));
  });

  test('le texte N est corrigé jeudi à 10h : il sort des portraits ; le curseur L de Marie n’est plus net ; la barre reste pleine', () => {
    const JEUDI14 = LUNDI14 + 3;
    assert.equal(retraitPermis(bascule(JEUDI14) - 8 * 3_600_000), true, 'jeudi 10h');
    assert.equal(retraitPermis(bascule(JEUDI14) - 2 * 3_600_000), false, 'jeudi 16h');
    assert.equal(retraitPermis(bascule(LUNDI14 + 6) - 8 * 3_600_000), false, 'jamais le dimanche');
    const N = texte('N', 'L', 0, 'p0 pa c1 c0');
    const avantL = [...historique('Marie', 6, 0, LUNDI13 - 50, 'L'), ...historique('Marie', 1, 1, LUNDI13 - 30, 'L').map((r) => ({ ...r, texte: { ...r.texte, id: 'Marie-L-x' } }))];
    const n: ReponseDatee = { texte: { ...N, retireDesPortraits: true }, reponse: rep('F · R1'), entree: false, jour: MARDI13, instant: MARDI13 * 1000 };
    const l = portrait([...avantL, n]).L;
    assert.deepEqual([l.W.toString(), l.c.toString(), l.l.toString(), l.net], ['7', '3/11', '27/80', false]);
    assert.equal(barre(60).pleine, true, 'la barre ne recule jamais : la réponse reste');
    // Si L redevient net un jour, la phrase du dimanche dit de nouveau « devenue nette ».
    const p = { ...portrait([]), P: curseurDepuis(F(17, 2), F(15, 2)), L: curseurDepuis(9, 1) };
    assert.equal(phraseDimanche({ portrait: p, nettesAuparavant: ['P'], reponsesSemaine: [] }).cas, 'nette');
  });
});
