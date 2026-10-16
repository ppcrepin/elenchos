// Comparaison avec le moteur du second essai (docs/essai/a-ne-pas-ouvrir-2/outillage/page/moteur.js et noyau.js, lus
// pour leur code seulement), sur des milliers de cas tirés au hasard, pour les fonctions communes. Là où regles.md
// change un chiffre (seuil net, largeur, Pas de Côté), le moteur reçoit les chiffres de l'essai pour la comparaison ;
// là où regles.md change une règle (carte « qui et pourquoi », ordre, seuils des tempéraments, « Entre … »), la
// comparaison porte sur la partie commune et l'écart est dit en tête du fichier du moteur.

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  avisDuCercle,
  choisirCartes,
  classer,
  comptesDeLaSemaine,
  comptesTemperament,
  creerTirage,
  curseur,
  F,
  Fraction,
  mediane,
  ordreMoi,
  pasDeCote,
  phraseDimanche,
  phraseDuJour,
  portrait,
  revelerManche,
  servirLaJournee,
  titresDuDimanche,
  jourDeDate,
  type CodeTension,
  type Curseur,
  type EtatManche,
  type IdMembre,
  type MancheRevelee,
  type Niveau,
  type ReglagesPortrait,
  type ReponseDatee,
  type ReponseDuJour,
  type ReponseMoteur,
  type Sommes,
  type TexteMoteur,
  type RangRaison,
  type ChoixRaison,
  type Pole,
  type PoleRaison,
} from '../../src/regles/index.ts';
import { alea, graineHex } from './aides.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Quelconque = any;

const exiger = createRequire(import.meta.url);
const DOSSIER = new URL('../../../docs/essai/a-ne-pas-ouvrir-2/outillage/page/', import.meta.url);
const NOYAU: Quelconque = exiger(fileURLToPath(new URL('noyau.js', DOSSIER)));
const MOTEUR: Quelconque = exiger(fileURLToPath(new URL('moteur.js', DOSSIER)));
const R: Quelconque = MOTEUR.regles;

/** Les chiffres de l'essai (moteur.js : SEUIL_NET, C95, C07, C25, UN_CINQUIEME). */
const ESSAI: ReglagesPortrait = {
  seuilNet: F(10),
  largeurPlafond: F('0.95'),
  largeurPente: F('0.07'),
  largeurPlancher: F('0.25'),
  pasDeCoteEcart: F(1, 5),
};

const QUATRE: readonly CodeTension[] = ['S', 'P', 'T', 'L'];
const vers = (x: Fraction): Quelconque => NOYAU.Fraction(x.n, x.d);
const s = (x: Quelconque): string => (x === null || x === undefined ? 'null' : x.toString());
const normaliser = (p: string): string => p.replace(/’/g, "'").replace(/[  ]/g, ' ');

type Alea = ReturnType<typeof alea>;

function texteAuHasard(r: Alea, id: string, tension?: CodeTension): TexteMoteur {
  const raisons = ([1, 2, 3, 4] as RangRaison[]).map((rang) => ({
    rang,
    cote: r.bool() ? ('pour' as const) : ('contre' as const),
    pole: r.choix<PoleRaison>([0, 1, 'aucun']),
  }));
  return { id, tension: tension ?? r.choix(QUATRE), sens: r.choix<Pole>([0, 1]), raisons };
}
function reponseAuHasard(r: Alea, peuVariee = false): ReponseMoteur {
  const niveau = (peuVariee ? r.choix([2, 4]) : r.entier(1, 5)) as Niveau;
  const raison: ChoixRaison = peuVariee ? r.choix<ChoixRaison>([1, 3]) : r.bool(0.15) ? 'aucune' : (r.entier(1, 4) as RangRaison);
  return { niveau, raison };
}
function sommesAuHasard(r: Alea): Sommes {
  const W = F(r.entier(0, 30), 2);
  const Swp = W.fois(F(r.entier(0, 10), 10));
  return { W, Swp: F(Swp.n * 2n / Swp.d, 2) };
}

describe('Comparaison avec le moteur de l’essai 2', () => {
  test('le tirage t(clé) : mêmes nombres, même ordre (5 000 clés)', () => {
    const r = alea(1);
    for (let i = 0; i < 50; i++) {
      const g = graineHex(r);
      const a = creerTirage(g);
      const b = NOYAU.creerTirage(g);
      const elements = Array.from({ length: r.entier(1, 8) }, (_, k) => `m${k}`);
      for (let k = 0; k < 100; k++) {
        const cle = `cle|${r.entier(0, 1e6)}|`;
        assert.equal(a.t(cle).n, b.t(cle).n);
      }
      assert.deepEqual(a.ordonner('p|', elements), b.melanger(elements, 'p|'));
    }
  });

  test('classer (règle 17) : 20 000 réponses', () => {
    const r = alea(2);
    for (let i = 0; i < 20_000; i++) {
      const t = texteAuHasard(r, 'X');
      const rp = reponseAuHasard(r);
      const a = classer(t, rp);
      const b = R.classer(t, rp);
      assert.deepEqual([a.classe, a.w.toString(), a.pole], [b.classe, b.w.toString(), b.pole]);
    }
  });

  test('curseur (règle 17), chiffres de l’essai : 20 000 curseurs ; centre identique avec ceux de regles.md', () => {
    const r = alea(3);
    for (let i = 0; i < 20_000; i++) {
      const sm = sommesAuHasard(r);
      const a = curseur(sm, ESSAI);
      const b = R.curseur({ sw: vers(sm.W), swp: vers(sm.Swp) });
      assert.deepEqual([a.c.toString(), a.l.toString(), a.net], [b.c.toString(), b.l.toString(), b.net]);
      assert.equal(curseur(sm).c.toString(), b.c.toString());
    }
  });

  test('médiane : 5 000 listes', () => {
    const r = alea(4);
    for (let i = 0; i < 5_000; i++) {
      const l = Array.from({ length: r.entier(1, 9) }, () => F(r.entier(0, 4), 4));
      assert.equal(mediane(l).toString(), R.mediane(l.map(vers)).toString());
    }
  });

  test('les cartes servies et la révélation : 4 000 manches (R3, R4, jumeau, redistribution, verdicts, points)', () => {
    const r = alea(5);
    let remplacements = 0;
    let jumeaux = 0;
    let ensemble = 0;
    for (let i = 0; i < 4_000; i++) {
      const graine = graineHex(r);
      const J = r.entier(10, 900);
      const noms = Array.from({ length: r.entier(1, 9) }, (_, k) => `m${k}`);
      const membres = ['porteur', ...noms];
      const t = texteAuHasard(r, 'X');
      const peuVariee = r.bool(0.5);
      const reponses = new Map<IdMembre, ReponseMoteur>();
      for (const m of membres) if (r.bool(0.85)) reponses.set(m, reponseAuHasard(r, peuVariee));
      const sommes = new Map<IdMembre, Sommes>(membres.map((m) => [m, sommesAuHasard(r)]));
      const ctx = {
        tir: NOYAU.creerTirage(graine),
        cal: { texteRepondu: (j: number) => (j === J - 1 ? 'X' : null), semaineDuJour: () => null },
        texte: () => t,
        membres,
        estMembre: () => true,
        estEntree: () => true,
        reponse: (m: string) => reponses.get(m) ?? null,
        sommesJusqua: (m: string) => {
          const x = sommes.get(m) as Sommes;
          const o: Record<string, Quelconque> = {};
          for (const q of QUATRE) o[q] = { sw: vers(x.W), swp: vers(x.Swp) };
          return o;
        },
      };
      const essai = R.calculerManche(ctx, 'porteur', J, () => null, null);
      const possibles = noms.filter((m) => reponses.has(m));
      const curseursVus = new Map<IdMembre, Curseur>(possibles.map((m) => [m, curseur(sommes.get(m) as Sommes, ESSAI)]));
      const rd = new Map<IdMembre, ReponseDuJour>([...reponses].map(([m, x]) => [m, { reponse: x }]));
      const d = choisirCartes({
        texte: t,
        possibles,
        reponses: rd,
        curseursVus,
        hasard: creerTirage(graine),
        cles: { surprise: `surprise|porteur|${J}|`, hasard: `hasard|porteur|${J}|`, cachee: 'c|', ordre: 'o|' },
      });
      assert.deepEqual(d.classement, essai.classement);
      assert.deepEqual(d.places, essai.places);
      assert.deepEqual(d.remplacements, essai.remplacements);
      assert.equal(s(d.mediane), s(essai.mediane));
      for (const m of possibles) assert.equal(d.possibles.get(m)?.surprise.toString(), essai.possibles[m].surprise.toString());
      remplacements += d.remplacements.length;

      // La révélation, sur les cartes de l'essai (sa carte cachée et son ordre), avec des visages tirés au hasard.
      const libres = [...noms];
      const designations = essai.cartes.map((c: Quelconque) => {
        const passe = r.bool(0.15) || libres.length === 0;
        const designe = passe ? 'passe' : (libres.splice(r.entier(0, libres.length - 1), 1)[0] as string);
        return { designe, raison: c.cachee && !passe && r.bool(0.7) ? r.entier(1, 4) : null };
      });
      const essai2 = R.calculerManche(ctx, 'porteur', J, () => null, designations);
      const rev = R.calculerRevelation(ctx, J + 1, { porteur: essai2 }, {}).devineurs.porteur;
      const etat: EtatManche = {
        cercle: 'C',
        cartes: essai2.cartes.map((c: Quelconque, k: number) => ({
          auteur: c.auteur,
          reponse: reponses.get(c.auteur) as ReponseMoteur,
          cachee: c.cachee,
          visage: designations[k].designe === 'passe' ? null : designations[k].designe,
          pourquoi: c.cachee ? designations[k].raison : null,
          passee: designations[k].designe === 'passe',
          videeParDepart: false,
        })),
        visages: noms,
        ouverte: true,
        validee: true,
      };
      const moi = revelerManche({ etat, jour: J, texte: 'X', devineur: 'porteur', reponses, ordreArrivee: membres });
      assert.deepEqual(
        moi.cartes.map((c) => c.verdict),
        rev.verdicts,
      );
      assert.deepEqual(
        moi.cartes.map((c) => c.juste),
        rev.justes,
      );
      assert.deepEqual(
        moi.cartes.map((c) => c.jumeau),
        rev.jumeaux,
      );
      assert.deepEqual(
        moi.cartes.map((c) => c.auteur),
        essai2.cartes.map((c: Quelconque) => c.auteur_compte),
      );
      assert.equal(moi.points, rev.points);
      assert.equal(moi.raisonCacheeTrouvee, rev.raison_trouvee === true);
      jumeaux += moi.cartes.filter((c) => c.jumeau).length;
      ensemble += moi.cartes.filter((c) => c.auteur !== c.auteurServi).length;
    }
    // Les cas rares ont bien été rencontrés.
    assert.ok(remplacements > 100, `remplacements : ${remplacements}`);
    assert.ok(jumeaux > 100, `jumeaux : ${jumeaux}`);
    assert.ok(ensemble > 50, `redistributions : ${ensemble}`);
  });

  test('l’avis du cercle : 10 000 répartitions', () => {
    const r = alea(6);
    for (let i = 0; i < 10_000; i++) {
      const niveaux = Array.from({ length: r.entier(0, 10) }, () => r.entier(1, 5) as Niveau);
      const membres = niveaux.map((_, k) => `m${k}`);
      const ctx = { scelle: { textes: { X: {} } }, estEntree: () => false, membres, reponse: (m: string) => ({ niveau: niveaux[membres.indexOf(m)] }) };
      const a = avisDuCercle(niveaux);
      const b = R.avisCercle(ctx, 'X');
      if (b === null) assert.equal(a, null);
      else assert.deepEqual([a?.comptes, a?.milieu, a?.ligne], [b.comptes, b.milieu, b.ligne]);
    }
  });

  test('les titres de la semaine : 1 000 semaines (Le Devin, Le Mystère, Le Fidèle, la surprise, Le Sans-Faute)', () => {
    const r = alea(7);
    const dimanche = jourDeDate('2026-10-25');
    let tirages = 0;
    for (let i = 0; i < 1_000; i++) {
      const graine = graineHex(r);
      const membres = Array.from({ length: r.entier(3, 7) }, (_, k) => `m${k}`);
      const numero = r.entier(1, 50);
      const revelations: Record<number, Quelconque> = {};
      const manchesEssai: Record<number, Quelconque> = {};
      const miennes: MancheRevelee[] = [];
      const faible = r.bool(0.3); // des semaines à peu de cartes, pour les titres sans titulaire
      for (let d = 1; d <= 7; d++) {
        revelations[d] = { devineurs: {}, texte: `T${d}` };
        manchesEssai[d - 1] = {};
        for (const g of membres) {
          if (r.bool(faible ? 0.6 : 0.1)) continue;
          const autres = membres.filter((m) => m !== g);
          const n = r.entier(0, Math.min(3, autres.length));
          const cachee = n > 0 ? r.entier(0, n - 1) : -1;
          const cartes = Array.from({ length: n }, (_, k) => {
            const auteur = r.choix(autres);
            const designe = r.bool(0.1) ? null : r.choix(autres);
            const juste = designe !== null && r.bool(r.bool(0.1) ? 1 : 0.6);
            return { auteur, designe, juste, raisonTrouvee: k === cachee && juste && r.bool(0.4) };
          });
          revelations[d].devineurs[g] = { justes: cartes.map((c) => c.juste), points: cartes.filter((c) => c.juste).length, raison_trouvee: n ? cartes.some((c) => c.raisonTrouvee) : null };
          manchesEssai[d - 1][g] = { cartes: cartes.map((c) => ({ designe: c.designe ?? 'passe', auteur_compte: c.auteur })) };
          miennes.push({
            cercle: 'C',
            jour: dimanche - 7 + d,
            texte: `T${d}`,
            devineur: g,
            ouverte: true,
            cartes: cartes.map((c) => ({
              auteurServi: c.auteur,
              auteur: c.auteur,
              reponse: { niveau: 3, raison: 'aucune' },
              cachee: false,
              designe: c.designe,
              verdict: c.designe === null ? 'passe' : c.juste ? 'juste' : 'faux',
              juste: c.juste,
              jumeau: false,
              raisonTrouvee: c.raisonTrouvee,
              passeComptee: c.designe === null,
              h: Fraction.ZERO,
            })),
            points: cartes.filter((c) => c.juste).length,
            raisonCacheeTrouvee: cartes.some((c) => c.raisonTrouvee),
            hasard: Fraction.ZERO,
          });
        }
      }
      const repondu = new Map<string, boolean>();
      for (const m of membres) for (let d = 1; d <= 7; d++) repondu.set(`${m}|${d}`, r.bool(0.93));
      const ctx = {
        cal: { semaine: () => ({ premier_jour: 1, dernier_jour: 7 }), textesRepondusSemaine: () => ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], depuis: () => 0 },
        tir: NOYAU.creerTirage(graine),
        membres,
        estMembre: () => true,
        jourDe: (t: string) => Number(t.slice(1)),
        reponse: (m: string, t: string) => (repondu.get(`${m}|${t.slice(1)}`) ? {} : null),
        aUnTitre: () => true,
      };
      const b = R.calculerTitres(ctx, numero, revelations, manchesEssai);
      const a = titresDuDimanche({
        cercle: 'C',
        dimanche,
        eveilleDimanche: true,
        membres: membres.map((id) => ({ id, jourArrivee: 0 })),
        comptes: comptesDeLaSemaine(miennes, dimanche, 'C'),
        aRepondu: (m, j) => repondu.get(`${m}|${j - dimanche + 7}`) === true,
        hasard: creerTirage(graine),
        cles: { devin: `devin|${numero}|`, mystere: `mystere|${numero}|`, surprise: `surprise-semaine|${numero}|` },
      });
      assert.ok(a);
      assert.deepEqual([a.devin.titulaire, a.devin.departage], [b.devin.titulaire, b.devin.departage]);
      assert.deepEqual([a.mystere.titulaire, a.mystere.departage], [b.mystere.titulaire, b.mystere.departage]);
      assert.deepEqual(a.fideles, b.fidele.titulaires);
      assert.deepEqual([a.surprise.texte, a.surprise.departage], [b.surprise.texte, b.surprise.departage]);
      assert.deepEqual(a.sansFaute, b.sans_faute);
      tirages += [a.devin, a.mystere, a.surprise].filter((x) => x.departage === 'tirage').length;
    }
    assert.ok(tirages > 30, `départages par tirage : ${tirages}`);
  });

  test('les comptes des tempéraments, cercles de 3 à 5 (où « au plus un tiers » est « seul ») : 3 000 cas', () => {
    const r = alea(8);
    for (let i = 0; i < 3_000; i++) {
      const membres = Array.from({ length: r.entier(3, 5) }, (_, k) => `m${k}`);
      const p = membres[0] as string;
      const d = 100;
      const rep = new Map<string, Niveau>();
      const textes: Map<IdMembre, Niveau>[] = [];
      const neutreFort = r.bool(0.5);
      for (let k = d - 57; k <= d - 2; k++) {
        const t = new Map<IdMembre, Niveau>();
        for (const m of membres) {
          if (!r.bool(0.8)) continue;
          const v = (neutreFort && r.bool(0.3) ? 3 : r.entier(1, 5)) as Niveau;
          rep.set(`${m}|T${k}`, v);
          t.set(m, v);
        }
        textes.push(t);
      }
      const ctx = {
        cal: { texteRepondu: (k: number) => `T${k}`, depuis: () => 0 },
        estEntree: () => false,
        membres,
        reponse: (m: string, t: string) => {
          const v = rep.get(`${m}|${t}`);
          return v === undefined ? null : { niveau: v };
        },
      };
      const b = R.calculerTemperaments(ctx, d, p);
      const siennes = textes.filter((t) => t.has(p) && t.size >= 3).map((t) => t.get(p) as Niveau);
      const a = comptesTemperament(p, textes, siennes);
      assert.deepEqual(
        [a.reponsesCercle, a.cotePeuSuivi, a.textesPartages, a.neutreAuMilieu, a.neutres, a.tres],
        [b.reponses, b.seul_cote, b.textes_partages, b.seul_milieu, b.neutres, b.tres],
      );
    }
  });

  test('Le Pas de Côté, chiffres de l’essai : 3 000 historiques', () => {
    const r = alea(9);
    let oui = 0;
    for (let i = 0; i < 3_000; i++) {
      const K = r.entier(5, 40);
      const penchant = r.choix<Pole>([0, 1]);
      const textes = new Map<string, TexteMoteur>();
      const reponses = new Map<string, ReponseMoteur>();
      const datees: ReponseDatee[] = [];
      for (let k = 1; k <= K; k++) {
        const sens = r.choix<Pole>([0, 1]);
        const t: TexteMoteur = {
          id: `T${k}`,
          tension: r.choix(['S', 'P'] as const),
          sens,
          raisons: [
            { rang: 1, cote: 'pour', pole: sens },
            { rang: 2, cote: 'pour', pole: 'aucun' },
            { rang: 3, cote: 'contre', pole: sens === 1 ? 0 : 1 },
            { rang: 4, cote: 'contre', pole: sens },
          ],
        };
        const vers_ = k === K ? (r.bool(0.6) ? 1 - penchant : penchant) : r.bool(0.9) ? penchant : 1 - penchant;
        const rp: ReponseMoteur = r.bool(0.85)
          ? vers_ === sens
            ? { niveau: r.choix([4, 5] as Niveau[]), raison: 1 }
            : { niveau: r.choix([1, 2] as Niveau[]), raison: 3 }
          : reponseAuHasard(r);
        textes.set(t.id, t);
        reponses.set(t.id, rp);
        datees.push({ texte: t, reponse: rp, entree: false, jour: k, instant: k });
      }
      const ctx = {
        estEntree: () => false,
        texte: (id: string) => textes.get(id),
        jourDe: (id: string) => Number(id.slice(1)),
        membres: ['m'],
        reponse: (_m: string, id: string) => reponses.get(id) ?? null,
        sommesJusqua: (_m: string, d: number) => {
          const o: Record<string, Quelconque> = { S: R.sommesVides(), P: R.sommesVides(), T: R.sommesVides(), L: R.sommesVides() };
          for (let k = 1; k <= d; k++) {
            const t = textes.get(`T${k}`) as TexteMoteur;
            o[t.tension] = R.ajouter(o[t.tension], R.classer(t, reponses.get(t.id)), 1);
          }
          return o;
        },
      };
      const b = R.pasDeCote(ctx, `T${K}`).length === 1;
      const a = pasDeCote(datees, datees[K - 1] as ReponseDatee, ESSAI);
      assert.equal(a, b);
      if (a) oui++;
    }
    assert.ok(oui > 100, `Pas de Côté rencontrés : ${oui}`);
  });

  test('la phrase du jour (quatre tensions de l’essai) : toutes les réponses sur 2 000 textes', () => {
    const r = alea(10);
    for (let i = 0; i < 2_000; i++) {
      const t = texteAuHasard(r, 'X');
      for (let niveau = 1; niveau <= 5; niveau++) {
        for (const raison of [1, 2, 3, 4, 'aucune'] as ChoixRaison[]) {
          const rp = { niveau: niveau as Niveau, raison };
          assert.equal(phraseDuJour(t, rp).phrase, normaliser(R.phraseDuJour(t.tension, R.classer(t, rp))));
        }
      }
    }
  });

  test('la phrase de la semaine, chiffres de l’essai : 3 000 portraits (« Entre … » comparé hors de L)', () => {
    const r = alea(11);
    const cas = new Map<string, number>();
    for (let i = 0; i < 3_000; i++) {
      const K = r.entier(7, 90);
      const textes = new Map<string, TexteMoteur>();
      const reponses = new Map<string, ReponseMoteur | null>();
      const datees: ReponseDatee[] = [];
      const penchants = Object.fromEntries(QUATRE.map((q) => [q, r.choix<Pole>([0, 1])])) as Record<CodeTension, Pole>;
      for (let k = 1; k <= K; k++) {
        const tension = r.choix(QUATRE);
        const sens = r.choix<Pole>([0, 1]);
        const t: TexteMoteur = {
          id: `T${k}`,
          tension,
          sens,
          raisons: [
            { rang: 1, cote: 'pour', pole: sens },
            { rang: 2, cote: 'pour', pole: 'aucun' },
            { rang: 3, cote: 'contre', pole: sens === 1 ? 0 : 1 },
            { rang: 4, cote: 'contre', pole: sens },
          ],
        };
        textes.set(t.id, t);
        if (r.bool(0.15)) {
          reponses.set(t.id, null);
          continue;
        }
        const p = r.bool(0.8) ? penchants[tension] : 1 - penchants[tension];
        const rp: ReponseMoteur = r.bool(0.7) ? (p === sens ? { niveau: 4, raison: 1 } : { niveau: 2, raison: 3 }) : reponseAuHasard(r);
        reponses.set(t.id, rp);
        datees.push({ texte: t, reponse: rp, entree: false, jour: k, instant: k });
      }
      const sommesJusqua = (d: number): Record<string, Quelconque> => {
        const o: Record<string, Quelconque> = { S: R.sommesVides(), P: R.sommesVides(), T: R.sommesVides(), L: R.sommesVides() };
        for (let k = 1; k <= Math.min(d, K); k++) {
          const t = textes.get(`T${k}`) as TexteMoteur;
          const rp = reponses.get(t.id);
          if (rp) o[t.tension] = R.ajouter(o[t.tension], R.classer(t, rp), 1);
        }
        return o;
      };
      const semaine = Array.from({ length: 7 }, (_, k) => `T${K - 6 + k}`);
      const ctx = {
        sommesJusqua: (_m: string, d: number) => sommesJusqua(d),
        cal: { textesRepondusSemaine: () => semaine },
        reponse: (_m: string, id: string) => reponses.get(id) ?? null,
        texte: (id: string) => textes.get(id),
      };
      const b = R.phraseSemaine(ctx, 1, K + 1, K - 7);
      const a = phraseDimanche({
        portrait: portrait(datees, {}, ESSAI),
        nettesAuparavant: QUATRE.filter((q) => portrait(datees.filter((x) => x.jour <= K - 7), {}, ESSAI)[q].net),
        reponsesSemaine: datees.filter((x) => x.jour >= K - 6),
      });
      cas.set(a.cas, (cas.get(a.cas) ?? 0) + 1);
      if (a.cas === 'aucune') {
        // Écart voulu (D-052, R2 précisée) : l'essai écrivait « encore flou » chez qui avait déjà un curseur net.
        assert.equal(b.cas, 'floue');
        continue;
      }
      assert.equal(a.cas, b.cas);
      assert.equal(a.tension, b.tension);
      if (a.tension !== 'L') assert.equal(a.phrase, normaliser(b.phrase));
    }
    for (const c of ['nette', 'difference', 'egalite', 'floue', 'aucune']) assert.ok((cas.get(c) ?? 0) > 20, `${c} : ${cas.get(c)}`);
  });

  test('l’ordre de Moi, chiffres de l’essai : 5 000 portraits à quatre tensions', () => {
    const r = alea(12);
    for (let i = 0; i < 5_000; i++) {
      const p: Partial<Record<CodeTension, Curseur>> = {};
      const e: Record<string, Quelconque> = {};
      for (const q of QUATRE) {
        const sm = r.bool(0.3) ? { W: F(10), Swp: F(r.entier(0, 10)) } : sommesAuHasard(r);
        const c = curseur(sm, ESSAI);
        p[q] = c;
        e[q] = { c: vers(c.c), l: vers(c.l), net: c.net, somme_w: vers(c.W) };
      }
      assert.deepEqual(ordreMoi(p), R.ordreMoi(e));
    }
  });
});

describe('Le tirage est déterministe', () => {
  test('même graine, même journée ; une autre graine change les tirages', () => {
    const r = alea(13);
    let differentes = 0;
    for (let i = 0; i < 300; i++) {
      const noms = Array.from({ length: r.entier(4, 9) }, (_, k) => `m${k}`);
      const membres = ['moi', ...noms].map((id) => ({ id, jourArrivee: 0 }));
      const t = texteAuHasard(r, 'X');
      const reponses = new Map<IdMembre, ReponseDuJour>(noms.map((m) => [m, { reponse: reponseAuHasard(r) }]));
      const g = graineHex(r);
      const jouer = (graine: string): unknown =>
        JSON.parse(
          JSON.stringify(
            servirLaJournee({
              devineur: 'moi',
              jour: 1000,
              texte: t,
              cercles: [{ id: 'C', membres, eveille: true }],
              reponses,
              curseursVus: new Map(),
              hasard: creerTirage(graine),
            }),
            (_k, v) => (v instanceof Map ? [...v] : v),
          ),
        );
      assert.deepEqual(jouer(g), jouer(g));
      if (JSON.stringify(jouer(g)) !== JSON.stringify(jouer(`${g}x`))) differentes++;
    }
    assert.ok(differentes > 150, `journées changées par la graine : ${differentes}`);
  });
});
