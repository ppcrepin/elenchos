/* Tests du moteur, lot 2 (histoire) du second essai.
 *
 * Deux sortes de tests :
 * - des cas construits à la main, sur un contexte réduit (quelques membres,
 *   quelques textes, des sommes de curseur posées), dont le résultat attendu
 *   est calculé à la main dans le commentaire : ils vérifient les RÈGLES
 *   (§4, §5, §6 de simulation-2.md ; fichier caché, points 4 à 9) ;
 * - des tests sur le fichier scellé de test (inventé, « provisoire ») : forme,
 *   invariants, déterminisme, V6, trace de l'histoire au schéma fermé.
 * Aucun ne prouve la concordance avec le contrôle et le scellement : il faut
 * pour cela la graine finale et le candidat 1 (comparaison à trois, §9).
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const M = require('../moteur.js');
const TR = require('../trace.js');

const F = N.Fraction;
const R = M.regles;
const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const OCTETS = new Uint8Array(fs.readFileSync(SCELLE));
const lire = () => JSON.parse(N.utf8Decoder(OCTETS));
const PERSONNAGES = lire().personnages;
const fr = (x) => x.toString();

/* ------------------------------------------------------------------ */
/* Contexte construit à la main                                        */
/* ------------------------------------------------------------------ */

const { RAISONS, TX, fauxCtx, rep } = require('./contexte-main.js');

/* ------------------------------------------------------------------ */
/* Portrait (§5.1, §5.2, §5.9)                                          */
/* ------------------------------------------------------------------ */

test('Classer une réponse et calculer un curseur (§5.1, §5.2), facteur du porteur (§5.9)', () => {
  const tx = TX('S');
  const c = (n, r) => { const k = R.classer(tx, rep(n, r)); return [k.classe, fr(k.w), k.pole]; };
  assert.deepEqual(c(5, 1), ['arbitrage', '1', 1]);       // favorable, sert 1 ; raison de pôle 1
  assert.deepEqual(c(4, 2), ['penchant', '1/2', 1]);      // raison hors tension
  assert.deepEqual(c(2, 3), ['arbitrage', '1', 0]);       // défavorable, sert 0 ; raison de pôle 0
  assert.deepEqual(c(2, 4), ['tiraille', '0', null]);     // défavorable, raison de pôle 1 (inattendue croisée)
  assert.deepEqual(c(2, 'aucune'), ['penchant', '1/2', 0]);
  assert.deepEqual(c(3, 1), ['neutre', '0', null]);
  // Σw = 10, Σwπ = 10 : c = 12/14 = 6/7, ℓ = max(0,95 − 0,70 ; 0,25) = 1/4, net.
  let k = R.curseur({ sw: F(10), swp: F(10) });
  assert.deepEqual([fr(k.c), fr(k.l), k.net], ['6/7', '1/4', true]);
  // Σw = 19/2, Σwπ = 0 : c = 2/(27/2) = 4/27, ℓ = 0,95 − 0,665 = 57/200, flou.
  k = R.curseur({ sw: F(19, 2), swp: F(0) });
  assert.deepEqual([fr(k.c), fr(k.l), k.net], ['4/27', '57/200', false]);
  // Facteur 3 : un penchant vers 1 compte 3/2.
  const s = R.ajouter(R.sommesVides(), R.classer(tx, rep(4, 2)), 3);
  assert.deepEqual([fr(s.sw), fr(s.swp)], ['3/2', '3/2']);
});

/* ------------------------------------------------------------------ */
/* Manches : R3, membres selon le jour, toutes les cartes à quatre      */
/* ------------------------------------------------------------------ */

function specManche(sommesOdile) {
  return {
    membres: { Agathe: -90, Nassim: -90, Odile: -90, Valentin: -90, porteur: 1 },
    jours: { '-10': 'H1', '-9': 'H2' },
    textes: { H1: TX('S'), H2: TX('P') },
    reponses: { H1: { Agathe: rep(1, 3), Nassim: rep(4, 1), Odile: rep(3, 1), Valentin: rep(3, 3) } },
    sommes: (m, d) => (m === 'Odile' ? { S: sommesOdile } : null)
  };
}

test('R3 : un curseur net sert par la distance, un curseur flou par la rareté ; la réponse du devineur n\'entre pas (§4, caché 5)', () => {
  // Réponses à H1 (sens 1) : Nassim 4 (x = 3/4), Odile 3 (x = 1/2), Valentin 3 (x = 1/2) ; Agathe devine, sa réponse 1 (x = 0) n'entre pas.
  // Médiane des possibles = 1/2 ; raretés : Nassim 1/4, Odile 0, Valentin 0.
  // Odile nette (Σw = 10, Σwπ = 0, c = 2/14 = 1/7) : surprise = distance = |1/2 − 1/7| = 5/14 > 1/4.
  let ctx = fauxCtx(specManche({ sw: F(10), swp: F(0) }));
  let m = R.calculerManche(ctx, 'Agathe', -9, () => null, null);
  assert.equal(fr(m.mediane), '1/2');
  assert.deepEqual([m.possibles.Odile.net, fr(m.possibles.Odile.c), fr(m.possibles.Odile.distance), fr(m.possibles.Odile.rarete), fr(m.possibles.Odile.surprise)],
    [true, '1/7', '5/14', '0', '5/14']);
  assert.deepEqual([fr(m.possibles.Nassim.rarete), fr(m.possibles.Nassim.surprise)], ['1/4', '1/4']);
  assert.deepEqual(m.classement, ['Odile', 'Nassim', 'Valentin']);
  assert.equal(m.departages, 0);
  // Le curseur vu est celui des textes répondus jusqu'au jour j − 2.
  assert.ok(ctx.appels.every(([, d]) => d === -11));
  // Odile floue (Σw = 19/2) : surprise = rareté = 0, à égalité avec Valentin, départagés par t("surprise|Agathe|-9|…").
  ctx = fauxCtx(specManche({ sw: F(19, 2), swp: F(0) }));
  m = R.calculerManche(ctx, 'Agathe', -9, () => null, null);
  assert.equal(fr(m.possibles.Odile.surprise), '0');
  const t = ctx.tir;
  const odileAvant = t.comparer(t.t('surprise|Agathe|-9|Odile'), t.t('surprise|Agathe|-9|Valentin')) < 0;
  assert.deepEqual(m.classement, ['Nassim'].concat(odileAvant ? ['Odile', 'Valentin'] : ['Valentin', 'Odile']));
  assert.equal(m.departages, 1);
});

test('À quatre membres, toutes les réponses sont servies, dans l\'ordre de l\'étape 1, sans remplacement ; carte cachée en dernière place', () => {
  const s = specManche({ sw: F(10), swp: F(0) });
  s.reponses.H1.Valentin = rep(3, 1); // Odile et Valentin identiques (3, raison 1)
  const ctx = fauxCtx(s);
  const m = R.calculerManche(ctx, 'Agathe', -9, () => null, null);
  assert.equal(m.cartes.length, 3);
  assert.deepEqual(m.places, m.classement);
  assert.deepEqual(m.remplacements, []);
  assert.equal(m.raison_cachee, m.places[2]);
  assert.deepEqual(m.ordre, ctx.tir.melanger(m.places, 'ordre|Agathe|-9|'));
  // Carte cachée « aucune » : déplacée sur la moins bien classée qui a une raison (règles 1 §4.4).
  const s2 = specManche({ sw: F(10), swp: F(0) });
  s2.reponses.H1.Valentin = rep(3, 'aucune');
  const m2 = R.calculerManche(fauxCtx(s2), 'Agathe', -9, () => null, null);
  assert.equal(m2.places[2], 'Valentin');
  assert.equal(m2.raison_cachee, 'Nassim'); // Odile (1re), Nassim (2e), Valentin (3e, « aucune »)
});

test('Membres selon le jour : un membre n\'est candidat que pour un texte répondu depuis son entrée ; rangs de 1 au nombre de candidats (§4, caché 4)', () => {
  const s = {
    membres: { Agathe: -90, Nassim: -90, Odile: -90, Valentin: -90, porteur: 1 },
    jours: { 0: '0', 1: '1' },
    textes: { 0: TX('S', true), 1: TX('L', true) },
    reponses: { 0: { Nassim: rep(4, 1), Odile: rep(2, 3), Valentin: rep(5, 1) }, 1: { Nassim: rep(4, 1), Odile: rep(2, 3), porteur: rep(1, 3) } }
  };
  const ctx = fauxCtx(s);
  // Jour 1 : manche sur T0, répondu au jour 0, avant l'arrivée du porteur.
  const m1 = R.calculerManche(ctx, 'Agathe', 1, () => null, null);
  assert.deepEqual(m1.candidats, ['Nassim', 'Odile', 'Valentin']);
  assert.deepEqual(Object.values(m1.rangs).sort(), [1, 2, 3]);
  assert.equal(m1.curseur_porteur, null);
  assert.ok(!('porteur' in m1.cotes_attendus));
  // Jour 2 : le porteur est candidat ; il n'a rien montré : côté « inconnu », curseur vu {1/2, 0}.
  const m2 = R.calculerManche(ctx, 'Agathe', 2, () => null, null);
  assert.deepEqual(m2.candidats, ['Nassim', 'Odile', 'Valentin', 'porteur']);
  assert.deepEqual(Object.values(m2.rangs).sort(), [1, 2, 3, 4]);
  assert.deepEqual(Object.keys(m2.possibles).sort(), ['Nassim', 'Odile', 'porteur']);
  assert.equal(m2.cotes_attendus.porteur, 'inconnu');
  assert.deepEqual([fr(m2.curseur_porteur.c), fr(m2.curseur_porteur.somme_w)], ['1/2', '0']);
  // Côté attendu d'un personnage : sa position de profil, alignée sur le sens (règles 1 §3.2).
  const p = F(PERSONNAGES.Nassim.profil.L.position, 100);
  assert.equal(m2.cotes_attendus.Nassim, p.supEgal(F(3, 5)) ? 1 : (p.infEgal(F(2, 5)) ? -1 : 0));
  // Total maximal : chaque carte vaut 2 si son côté égale le côté attendu de la personne désignée.
  const cotes = m2.cotes_attendus;
  const total = m2.cartes.reduce((s0, c) => s0 + R.score(R.cote(m2.possibles[c.auteur].niveau), cotes[c.designe]), 0);
  assert.equal(total, m2.total);
});

test('Redistribution des auteurs entre cartes identiques servies ensemble (règles 1 §4.3, étape 4)', () => {
  const possibles = { Nassim: rep(4, 1), Odile: rep(4, 1), Valentin: rep(2, 3) };
  const cartes = [
    { auteur: 'Odile', auteur_compte: 'Odile', designe: 'Valentin' },
    { auteur: 'Nassim', auteur_compte: 'Nassim', designe: 'Odile' },
    { auteur: 'Valentin', auteur_compte: 'Valentin', designe: 'Nassim' }];
  R.redistribuer(cartes, possibles, ['Agathe', 'Nassim', 'Odile', 'Valentin', 'porteur']);
  // La carte de Nassim, désignée Odile, revient à Odile ; la carte d'Odile, désignée hors du groupe, prend le reste : Nassim.
  assert.deepEqual(cartes.map(c => c.auteur_compte), ['Nassim', 'Odile', 'Valentin']);
});

/* ------------------------------------------------------------------ */
/* Révélation : D-024, R5, Pas de Côté (R11)                            */
/* ------------------------------------------------------------------ */

function specRevelation() {
  return {
    membres: { Agathe: -90, Nassim: -90, Odile: -90, Valentin: -90, porteur: 1 },
    jours: { 3: '3', 4: '4' },
    textes: { 3: TX('S', true), 4: TX('P', true) },
    reponses: { 3: { Agathe: rep(5, 1), Nassim: rep(4, 1), Odile: rep(4, 1), Valentin: rep(2, 3), porteur: rep(1, 3) } },
    semaine: { numero: 14, premier_jour: 1, dernier_jour: 7 }
  };
}
function mancheMain(cartes, possibles) {
  return { texte: '3', cartes, possibles };
}

test('D-024 : désigner un jumeau non servi est juste ; raison cachée trouvée (R5) ; verdicts du porteur', () => {
  const ctx = fauxCtx(specRevelation());
  const possibles = { Nassim: rep(4, 1), Valentin: rep(2, 3), porteur: rep(1, 3) };
  // Odile (4, 1) n'est pas servie ; elle est la jumelle de Nassim.
  const porteur = mancheMain([
    { auteur: 'Nassim', auteur_compte: 'Nassim', cachee: true, designe: 'Odile', raison_devinee: 1 },
    { auteur: 'Valentin', auteur_compte: 'Valentin', cachee: false, designe: 'passe', raison_devinee: null },
    { auteur: 'porteur', auteur_compte: 'porteur', cachee: false, designe: 'Agathe', raison_devinee: null }], possibles);
  const agathe = mancheMain([
    { auteur: 'Nassim', auteur_compte: 'Nassim', cachee: false, designe: 'Nassim', raison_devinee: null },
    { auteur: 'Valentin', auteur_compte: 'Valentin', cachee: true, designe: 'Valentin', raison_devinee: 4 }], { Nassim: rep(4, 1), Valentin: rep(2, 3) });
  const prec = { 4: { devineurs: { Agathe: { points: 2 } } } };
  const r = R.calculerRevelation(ctx, 5, { porteur, Agathe: agathe }, prec);
  assert.equal(r.texte, '3');
  assert.deepEqual(r.devineurs.porteur, { jumeaux: [true, false, false], justes: [true, false, false], points: 1, points_semaine: 1,
    raison_trouvee: true, verdicts: ['jumeau_et_raison', 'passe', 'faux'] });
  // Agathe : deux justes, mauvaise raison ; points de la semaine = 2 (jour 4) + 2.
  assert.deepEqual(r.devineurs.Agathe, { jumeaux: [false, false], justes: [true, true], points: 2, points_semaine: 4,
    raison_trouvee: false, verdicts: null });
});

test('Le Pas de Côté (R11 ; caché 8) : arbitrage net contre un curseur net et clairement penché, juste avant la réponse', () => {
  const s = specRevelation();
  // H : sens 1. Nassim répond 2 avec la raison 3 (pôle 0) : arbitrage vers 0.
  s.reponses['3'] = { Agathe: rep(2, 3), Nassim: rep(2, 3), Odile: rep(5, 1), Valentin: rep(2, 3), porteur: rep(2, 'aucune') };
  const sommes = {
    Nassim: { sw: F(10), swp: F(10) },       // c = 6/7 : net, penche vers 1 → Pas de Côté
    Odile: { sw: F(10), swp: F(10) },        // répond vers 1, du côté de son curseur → non
    Valentin: { sw: F(10), swp: F(39, 5) },  // c = (2 + 39/5)/14 = 7/10 : |c − 1/2| = 1/5 exactement → oui (seuil compris)
    Agathe: { sw: F(19, 2), swp: F(19, 2) }, // c = 23/27 mais flou → non
    porteur: { sw: F(12), swp: F(12) }       // net, mais penchant (raison « aucune ») → non
  };
  s.sommes = (m) => ({ S: sommes[m] });
  const ctx = fauxCtx(s);
  assert.deepEqual(R.pasDeCote(ctx, '3'), ['Nassim', 'Valentin']);
  // Le curseur « juste avant » : toutes les réponses jusqu'à la veille du jour du texte (jour 3 → 2).
  assert.ok(ctx.appels.every(([, d]) => d === 2));
  // Juste sous le seuil : c = (2 + 7,7)/14 = 97/140, |c − 1/2| = 27/140 < 1/5 → non.
  sommes.Valentin = { sw: F(10), swp: F(77, 10) };
  assert.deepEqual(R.pasDeCote(fauxCtx(s), '3'), ['Nassim']);
  // Jamais sur l'entrée.
  s.entree = ['3'];
  assert.deepEqual(R.pasDeCote(fauxCtx(s), '3'), []);
});

/* ------------------------------------------------------------------ */
/* Titres d'une semaine (§6, R7 ; caché 9)                              */
/* ------------------------------------------------------------------ */

test('Titres : Le Sans-Faute (R7), Le Devin, Le Mystère (jumeau jamais une erreur), Le Fidèle, la surprise réservée aux textes qui ont un titre', () => {
  // Semaine 1, jours 1 à 7 ; révélations les jours 3 à 7 (textes répondus jours 1 à 5).
  const membres = { Agathe: -90, Nassim: -90, Odile: -90, Valentin: 3 };
  const jours = {}, textes = {}, reponses = {};
  for (let d = 0; d <= 6; d++) { jours[d] = 'X' + d; textes['X' + d] = TX('S', d !== 4); reponses['X' + d] = { Agathe: rep(4, 1), Nassim: rep(4, 1), Odile: rep(2, 3) }; }
  reponses.X2.Valentin = rep(2, 3); // Valentin, arrivé le jour 3, ne répond qu'à partir de X3… sauf X5 (manquée)
  reponses.X3.Valentin = rep(2, 3); reponses.X4.Valentin = rep(2, 3); reponses.X6.Valentin = rep(2, 3);
  const ctx = fauxCtx({ membres, jours, textes, reponses, semaine: { numero: 1, premier_jour: 1, dernier_jour: 7 } });
  const revelations = {}, manches = {};
  const carte = (auteur, designe, juste) => ({ c: { auteur, auteur_compte: auteur, designe }, juste });
  function jour(d, parDevineur) {
    manches[d - 1] = {}; const dv = {};
    Object.keys(parDevineur).forEach(g => {
      const l = parDevineur[g];
      manches[d - 1][g] = { cartes: l.map(x => x.c) };
      dv[g] = { justes: l.map(x => x.juste), points: l.filter(x => x.juste).length, raison_trouvee: g === 'Odile' };
    });
    revelations[d] = { texte: 'X' + (d - 2), devineurs: dv };
  }
  // Agathe : 5 jours de cartes. Nassim : des cartes 4 jours seulement (pas le jour 7). Odile : une passe le jour 5.
  // Odile trouve chaque jour la raison cachée (raison_trouvee), les autres jamais.
  for (let d = 3; d <= 7; d++) {
    const p = {
      Agathe: [carte('Nassim', 'Nassim', true), carte('Odile', 'Odile', true)],
      Odile: d === 5 ? [carte('Agathe', 'passe', false), carte('Nassim', 'Nassim', true)] : [carte('Agathe', 'Agathe', true), carte('Nassim', 'Nassim', true)]
    };
    if (d !== 7) { p.Nassim = [carte('Agathe', 'Agathe', true), carte('Odile', 'Odile', true)]; }
    jour(d, p);
  }
  // Jour 7 : Odile désigne Agathe sur la carte de Nassim ; même réponse (4, 1) : juste (jumeau), jamais une erreur.
  manches[6].Odile.cartes[1] = { auteur: 'Nassim', auteur_compte: 'Nassim', designe: 'Agathe' };
  // Jour 4 (texte X2, qui a un titre) : Agathe se trompe sur la carte de Nassim.
  manches[3].Agathe.cartes[0] = { auteur: 'Nassim', auteur_compte: 'Nassim', designe: 'Odile' };
  revelations[4].devineurs.Agathe.justes[0] = false; revelations[4].devineurs.Agathe.points -= 1;
  // Jour 6 (texte X4, sans titre) : Nassim se trompe sur la carte d'Agathe.
  manches[5].Nassim.cartes[0] = { auteur: 'Agathe', auteur_compte: 'Agathe', designe: 'Odile' };
  revelations[6].devineurs.Nassim.justes[0] = false; revelations[6].devineurs.Nassim.points -= 1;

  const w = R.calculerTitres(ctx, 1, revelations, manches);
  // Sans-Faute : Agathe a une erreur, Nassim n'a que 4 jours de cartes, Odile a passé → personne.
  assert.deepEqual(w.sans_faute, []);
  // Points : Agathe 10 − 1 = 9 ; Nassim 4 × 2 − 1 = 7 ; Odile 4 × 2 + 1 = 9 (passe : 0) ; Valentin 0.
  // Égalité Agathe – Odile, départagée par les raisons trouvées (Odile 5, Agathe 0).
  assert.deepEqual(w.devin.points, { Agathe: 9, Nassim: 7, Odile: 9, Valentin: 0 });
  assert.deepEqual([w.devin.titulaire, w.devin.departage], ['Odile', 'raisons']);
  // Le Fidèle : Valentin, membre depuis le jour 3, a manqué X5 (répondu le jour 5) → non.
  assert.deepEqual(w.fidele.titulaires, ['Agathe', 'Nassim', 'Odile']);
  // Le Mystère : Nassim 1 erreur sur 10 tentatives ; Agathe 1 sur 8 (passe exclue) ; Odile 0 sur 9 → Agathe.
  assert.deepEqual([w.mystere.tentatives, w.mystere.erreurs], [{ Agathe: 8, Nassim: 10, Odile: 9, Valentin: 0 }, { Agathe: 1, Nassim: 1, Odile: 0, Valentin: 0 }]);
  assert.deepEqual([w.mystere.titulaire, w.mystere.departage], ['Agathe', 'aucun']);
  // La surprise : X2 (titre, 1 erreur sur 6) ; X4 (1 sur 6) n'a pas de titre et ne peut pas l'être.
  assert.deepEqual(w.surprise.attributions, { X1: 6, X2: 6, X3: 5, X4: 6, X5: 4 });
  assert.deepEqual(w.surprise.erreurs, { X1: 0, X2: 1, X3: 0, X4: 1, X5: 0 });
  assert.deepEqual([w.surprise.texte, w.surprise.departage], ['X2', 'aucun']);

  // Plus d'erreur pour Agathe : Le Sans-Faute (5 jours, tout juste) et Le Devin seule en tête (10).
  manches[3].Agathe.cartes[0] = { auteur: 'Nassim', auteur_compte: 'Nassim', designe: 'Nassim' };
  revelations[4].devineurs.Agathe.justes[0] = true; revelations[4].devineurs.Agathe.points += 1;
  // Plus d'erreur pour Nassim non plus : tout juste, mais des cartes 4 jours seulement → toujours pas de Sans-Faute.
  manches[5].Nassim.cartes[0] = { auteur: 'Agathe', auteur_compte: 'Agathe', designe: 'Agathe' };
  revelations[6].devineurs.Nassim.justes[0] = true; revelations[6].devineurs.Nassim.points += 1;
  const w2 = R.calculerTitres(ctx, 1, revelations, manches);
  assert.deepEqual(w2.sans_faute, ['Agathe']);
  assert.deepEqual([w2.devin.titulaire, w2.devin.departage], ['Agathe', 'aucun']);
  assert.equal(w2.surprise.texte, null); // X2 n'a plus d'erreur ; X4 n'a pas de titre
  // Égalité de points sans raison trouvée : tirage t("devin|1|…").
  revelations[5].devineurs.Odile.points = 2;
  Object.values(revelations).forEach(r => { Object.values(r.devineurs).forEach(x => { x.raison_trouvee = false; }); });
  const w3 = R.calculerTitres(ctx, 1, revelations, manches);
  assert.deepEqual([w3.devin.titulaire, w3.devin.departage], [ctx.tir.plusPetit(['Agathe', 'Odile'], 'devin|1|'), 'tirage']);
});

/* ------------------------------------------------------------------ */
/* Tempéraments sur deux mois glissants (§6, point 8 ; caché 7)         */
/* ------------------------------------------------------------------ */

function specTemperaments(opts) {
  // Dimanche d = 0. Fenêtre : textes révélés des jours −55 à 0, donc répondus des jours −57 à −2.
  const o = opts || {};
  const membres = { Agathe: o.depuisAgathe === undefined ? -90 : o.depuisAgathe, Nassim: -90, Odile: -90, Valentin: -90 };
  const jours = {}, textes = {}, reponses = {};
  let n = 0;
  const ajouter = (d, r) => { const t = 'Y' + (n++); jours[d] = t; textes[t] = TX('S'); reponses[t] = r; };
  // 6 textes : Agathe seule favorable (5, « Très »), les autres 1, 2, 3 → seul de son côté, pas partagé.
  for (let i = 0; i < 6; i++) { ajouter(-57 + i, { Agathe: rep(5, 1), Nassim: rep(1, 3), Odile: rep(2, 3), Valentin: rep(3, 2) }); }
  // 14 textes (ou 13) : Agathe seule neutre, les autres 4, 2, 4 → partagé, seule au milieu.
  const nb = o.moinsUn ? 13 : (o.cinqPartages ? 5 : 14);
  for (let i = 0; i < nb; i++) { ajouter(-50 + i, { Agathe: rep(3, 2), Nassim: rep(4, 1), Odile: rep(2, 3), Valentin: rep(4, 1) }); }
  // Variante : 9 textes de plus, tous favorables (ni partagés, ni seule de son côté).
  if (o.cinqPartages) { for (let i = 0; i < 9; i++) { ajouter(-30 + i, { Agathe: rep(4, 1), Nassim: rep(4, 1), Odile: rep(4, 1), Valentin: rep(4, 1) }); } }
  // Hors du compte : un texte à deux réponses ; un texte révélé le jour −56 (hors fenêtre) ; un texte révélé après d.
  ajouter(-20, { Agathe: rep(5, 1), Nassim: rep(1, 3) });
  ajouter(-58, { Agathe: rep(5, 1), Nassim: rep(1, 3), Odile: rep(1, 3) });
  ajouter(-1, { Agathe: rep(5, 1), Nassim: rep(1, 3), Odile: rep(1, 3) });
  return fauxCtx({ membres, jours, textes, reponses });
}

test('Tempéraments : décomptes, seuils compris, fenêtre de 56 jours, ancienneté (caché 7 ; partie 4.3.8)', () => {
  // 20 réponses : seul de son côté 6/20 = 3/10 (seuil compris) → L'Original ; partagés 14 ≥ 6, seule au milieu 14/14 → Le Pont ;
  // neutres 14/20 ≥ 1/3 → Le Mesuré ; « Très » 6/20 < 1/2 → pas Le Tranché.
  const t = R.calculerTemperaments(specTemperaments(), 0, 'Agathe');
  assert.deepEqual(t, { neutres: 14, reponses: 20, seul_cote: 6, seul_milieu: 14, temperaments: ['original', 'pont', 'mesure'], textes_partages: 14, tres: 6 });
  // 19 réponses : aucun tempérament, décomptes écrits quand même.
  const t2 = R.calculerTemperaments(specTemperaments({ moinsUn: true }), 0, 'Agathe');
  assert.deepEqual([t2.reponses, t2.temperaments], [19, []]);
  // Cinq textes partagés seulement (il en faut six), seule au milieu sur les cinq : pas de Pont.
  const t4 = R.calculerTemperaments(specTemperaments({ cinqPartages: true }), 0, 'Agathe');
  assert.deepEqual(t4, { neutres: 5, reponses: 20, seul_cote: 6, seul_milieu: 5, temperaments: ['original'], textes_partages: 5, tres: 6 });
  // Membre depuis 55 jours seulement : aucun.
  const t3 = R.calculerTemperaments(specTemperaments({ depuisAgathe: -55 }), 0, 'Agathe');
  assert.deepEqual([t3.reponses, t3.temperaments], [20, []]);
  // Nassim : 20 réponses ; « Très » sur 6 ; jamais seul de son côté (Odile défavorable avec lui, puis Valentin favorable avec lui) ;
  // les 20 textes sont partagés pour lui (les autres y ont au moins un favorable et un défavorable).
  const n = R.calculerTemperaments(specTemperaments(), 0, 'Nassim');
  assert.deepEqual(n, { neutres: 0, reponses: 20, seul_cote: 0, seul_milieu: 0, temperaments: [], textes_partages: 20, tres: 6 });
});

/* ------------------------------------------------------------------ */
/* L'histoire sur le fichier scellé de test                            */
/* ------------------------------------------------------------------ */

const scelle = lire();
const cal = C.lire(scelle);
const collecte = {};
const t0 = process.hrtime.bigint();
const arrivee = M.histoire(scelle, cal, collecte);
const msHistoire = Number(process.hrtime.bigint() - t0) / 1e6;
const resume = M.resume(arrivee);

test('Histoire : jours, manches à quatre, révélations, coupure à la veille de l\'arrivée (§1, §8.8 ; partie 3.1)', () => {
  const premier = cal.semaines[0].premier_jour, coupure = cal.premier - 1;
  const jours = Object.keys(collecte.jours).map(Number).sort((x, y) => x - y);
  assert.equal(jours[0], premier);
  assert.equal(jours[jours.length - 1], coupure);
  assert.equal(jours.length, coupure - premier + 1);
  const perso = cal.membres.filter(m => m !== 'porteur');
  for (const d of jours) {
    const j = collecte.jours[String(d)];
    assert.equal(j.repondu, cal.texteRepondu(d));
    if (cal.texteRepondu(d - 1) === null) { assert.deepEqual(j.manches, {}); }
    if (cal.texteRepondu(d - 2) === null) { assert.equal(j.revelation, null); } else { assert.equal(j.revelation.texte, cal.texteRepondu(d - 2)); }
    for (const g of Object.keys(j.manches)) {
      const m = j.manches[g];
      // Présent : pas absent au texte répondu ce jour-là.
      assert.ok(!scelle.absences[g].includes(cal.texteRepondu(d)));
      assert.equal(m.texte, cal.texteRepondu(d - 1));
      assert.deepEqual(m.candidats, perso.filter(p => p !== g));
      assert.deepEqual(Object.values(m.rangs).sort(), [1, 2, 3]);
      const repondants = m.candidats.filter(p => scelle.reponses[m.texte][p]);
      assert.equal(m.cartes.length, repondants.length);
      assert.deepEqual(m.remplacements, []);
      assert.deepEqual(m.places, m.classement);
      assert.equal(m.curseur_porteur, null);
      for (const p of Object.keys(m.possibles)) {
        const x = m.possibles[p];
        assert.ok(x.surprise.egal(x.net ? x.distance : x.rarete));
      }
    }
    // Chaque personnage présent joue.
    if (cal.texteRepondu(d - 1) !== null) {
      assert.deepEqual(Object.keys(j.manches).sort(), perso.filter(p => !scelle.absences[p].includes(cal.texteRepondu(d))).sort());
    }
  }
  assert.equal(arrivee.manche_jour_0.texte, cal.texteRepondu(coupure - 1));
  assert.equal(arrivee.coupure, coupure);
});

test('Histoire : curseurs à l\'arrivée recalculés naïvement (entrée et textes répondus jusqu\'au jour j − 2 de l\'arrivée)', () => {
  for (const p of cal.membres.filter(m => m !== 'porteur')) {
    for (const t of M.TENSIONS) {
      let s = R.sommesVides();
      for (const x of cal.ordreTextes) {
        const jour = cal.textesEntree.includes(x) ? -Infinity : cal.jourDeReponse(x);
        if (jour > cal.premier - 2) { continue; }
        const tx = scelle.textes[x] || scelle.histoire.textes[x];
        const r = scelle.reponses[x][p];
        if (tx.tension === t && r) { s = R.ajouter(s, R.classer(tx, r), 1); }
      }
      const c = R.curseur(s);
      assert.ok(c.c.egal(arrivee.curseurs[p][t].c) && c.somme_w.egal(arrivee.curseurs[p][t].somme_w), p + ' ' + t);
    }
  }
});

test('Histoire : titres des semaines, surprise réservée aux textes qui ont un titre, tempéraments dans l\'ordre d\'affichage', () => {
  const semaines = cal.semaines.filter(w => w.dernier_jour < cal.premier);
  assert.deepEqual(arrivee.titres.map(x => x.semaine), semaines.map(w => w.numero));
  for (const x of arrivee.titres) {
    const titres = cal.textesRevelesSemaine(x.semaine).filter(t => scelle.histoire.textes[t] && scelle.histoire.textes[t].fiche);
    if (titres.length === 0) { assert.equal(x.surprise.texte, null); } else { assert.ok(x.surprise.texte === null || titres.includes(x.surprise.texte)); }
    assert.deepEqual(Object.keys(x.devin.points), cal.membres.filter(m => m !== 'porteur'));
    assert.deepEqual(Object.keys(x.surprise.attributions).sort(), cal.textesRevelesSemaine(x.semaine).slice().sort());
  }
  for (const p of Object.keys(arrivee.temperaments)) {
    const l = arrivee.temperaments[p].temperaments;
    assert.deepEqual(l, M.ORDRE_TEMPERAMENTS.filter(x => l.includes(x)));
    const n = arrivee.temperaments[p];
    assert.ok(n.seul_milieu <= n.textes_partages && n.textes_partages <= n.reponses && n.neutres + n.tres <= n.reponses);
  }
});

test('Résumé (partie 3) : ASCII, forme canonique, V6 sur le fichier de test ; calcul déterministe, fichier scellé intact', () => {
  const texte = N.jsonCanonique(resume);
  assert.match(texte, /^[\x20-\x7e]*$/);
  assert.equal(N.sha256(N.utf8Encoder(texte)), scelle.histoire.resume_sha256);
  assert.deepEqual(Object.keys(resume).sort(), ['curseurs', 'format', 'manche_jour_0', 'temperaments', 'tirage', 'titres', 'version']);
  assert.equal(resume.titres.length, cal.semaines.filter(w => w.dernier_jour < cal.premier).length);
  assert.deepEqual(Object.keys(resume.titres[0]).sort(), ['devin', 'fidele', 'mystere', 'sans_faute', 'semaine', 'surprise']);
  assert.deepEqual(Object.keys(resume.manche_jour_0.devineurs[Object.keys(resume.manche_jour_0.devineurs)[0]][0]).sort(),
    ['auteur', 'auteur_compte', 'cachee', 'designe', 'raison_devinee']);
  // Deux calculs, même résumé ; le fichier n'est pas modifié.
  const s2 = lire();
  assert.equal(N.jsonCanonique(M.resume(M.histoire(s2, C.lire(s2)))), texte);
  assert.deepEqual(s2, lire());
  assert.deepEqual(scelle, lire());
  // Une autre version du fichier est refusée.
  const v4 = lire(); v4.version = 4;
  assert.throws(() => M.histoire(v4, cal), /moteur/);
});

test('Trace de l\'histoire, version 1 (partie 4.2) : schéma fermé, fractions « p/q »', () => {
  const tr = TR.histoire(collecte, resume, N.sha256(N.utf8Encoder(N.jsonCanonique(resume))), N.sha256(OCTETS));
  const cles = o => Object.keys(o).sort().join(',');
  assert.equal(cles(tr), 'arrivee,empreinte_scelle,format,jours,semaines,version');
  assert.equal(tr.format, 'elenchos-essai-trace-histoire');
  assert.equal(cles(tr.arrivee), 'curseurs,resume,resume_sha256,temperaments');
  const RE = /^-?(0|[1-9][0-9]*)(\/[1-9][0-9]*)?$/;
  for (const j of Object.keys(tr.jours)) {
    const x = tr.jours[j];
    assert.equal(cles(x), 'manches,repondu,revelation');
    for (const g of Object.keys(x.manches)) {
      const m = x.manches[g];
      assert.equal(cles(m), 'candidats,cartes,classement,cotes_attendus,curseur_porteur,departages,mediane,ordre,places,possibles,raison_cachee,rangs,remplacements,texte,total');
      for (const p of Object.values(m.possibles)) {
        assert.equal(cles(p), 'c,distance,l,net,niveau,raison,rarete,somme_w,surprise,x');
        ['c', 'distance', 'l', 'rarete', 'somme_w', 'surprise', 'x'].forEach(k => assert.match(p[k], RE));
      }
      m.cartes.forEach(c => assert.equal(cles(c), 'auteur,auteur_compte,cachee,designe,raison_devinee'));
    }
    if (x.revelation) {
      assert.equal(cles(x.revelation), 'devineurs,pas_de_cote,texte');
      Object.values(x.revelation.devineurs).forEach(d => assert.equal(cles(d), 'jumeaux,justes,points,points_semaine,raison_trouvee,verdicts'));
    }
  }
  tr.semaines.forEach(w => {
    assert.equal(cles(w), 'devin,fidele,mystere,sans_faute,semaine,surprise');
    assert.equal(cles(w.devin), 'departage,points,raisons,titulaire');
    assert.equal(cles(w.mystere), 'departage,erreurs,tentatives,titulaire');
    assert.equal(cles(w.surprise), 'attributions,departage,erreurs,texte');
  });
  Object.values(tr.arrivee.curseurs).forEach(p => Object.values(p).forEach(c => assert.equal(cles(c), 'c,l,net,somme_w')));
  Object.values(tr.arrivee.temperaments).forEach(t => assert.equal(cles(t), 'neutres,reponses,seul_cote,seul_milieu,temperaments,textes_partages,tres'));
  // La trace se met en forme canonique, et elle est la même à chaque calcul.
  const texte = N.jsonCanonique(tr);
  assert.equal(N.jsonCanonique(TR.tracerHistoire(N, C, M, OCTETS)), texte);
});

test('Aucun nombre du calendrier écrit en dur dans le moteur (schéma, partie 7.1)', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'moteur.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const trouves = code.match(/(^|[^0-9A-Za-z_.\/])-?(7|13|14|15|16|90|91)(?![0-9])/g);
  assert.equal(trouves, null, 'nombres trouvés : ' + trouves);
});

test('Performance, première mesure (Node, sans ralenti) : histoire() bien sous le budget de 1 s du §8.8', () => {
  // La mesure qui compte se fait dans Chromium ralenti quatre fois : tests/mesure-histoire.js (lot 2), puis contrôle 14 j.
  assert.ok(msHistoire < 1000, 'histoire() : ' + msHistoire + ' ms');
});
