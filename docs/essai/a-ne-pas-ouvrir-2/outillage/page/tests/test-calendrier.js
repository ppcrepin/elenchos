/* Tests du calendrier lu dans le fichier scellé (second essai, lot 1).
 * Les valeurs attendues ci-dessous viennent du §0 de simulation-2.md et des
 * tables du schéma (partie 2.4) ; le code de la page, lui, n'en écrit aucune. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../calendrier.js');

const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const brut = fs.readFileSync(SCELLE, 'utf8');
function scelle() { return JSON.parse(brut); }
const cal = C.lire(scelle());
const T = (a, b) => { const l = []; for (let n = a; n <= b; n++) { l.push(String(n)); } return l; };

test('Lecture de la table : bornes, types, jours de la semaine', () => {
  assert.equal(cal.premier, 1);
  assert.equal(cal.dernier, 15);
  assert.equal(cal.dernierJeu, 14);
  assert.deepEqual(cal.jours.filter(l => l.type === 'joue').map(l => l.jour), [1, 2, 3, 7, 14]);
  assert.deepEqual(cal.jours.filter(l => l.type === 'joue_puis_saut').map(l => l.jour), [4, 8]);
  assert.deepEqual(cal.jours.filter(l => l.type === 'saute').map(l => l.jour), [5, 6, 9, 10, 11, 12, 13]);
  assert.ok(cal.estCloture(15) && !cal.estCloture(14));
  assert.ok(cal.estDimanche(7) && cal.estDimanche(14) && !cal.estDimanche(8));
  assert.ok(cal.estArrivee(1) && !cal.estArrivee(2));
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15].map(j => cal.aUneOuverture(j)), [true, true, true, true, false, false, true, true, false, true, true]);
  assert.equal(cal.suivant(14), 15);
  assert.equal(cal.suivant(15), null);
  assert.throws(() => cal.ligne(16));
  assert.ok(Object.isFrozen(cal) && Object.isFrozen(cal.jours[0]) && Object.isFrozen(cal.sauts[0].jours));
});

test('Sauts : points, jours couverts, textes du rattrapage, reprise (§0)', () => {
  assert.equal(cal.sauts.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(cal.sauts[0])), { numero: 1, point: 4, sautes: [5, 6], jours: [4, 5, 6], textes: ['4', '5', '6'], reprise: 7 });
  assert.deepEqual(JSON.parse(JSON.stringify(cal.sauts[1])), { numero: 2, point: 8, sautes: [9, 10, 11, 12, 13], jours: [8, 9, 10, 11, 12, 13], textes: T(8, 13), reprise: 14 });
  assert.equal(cal.sautDuJour(5).numero, 1);
  assert.equal(cal.sautDuJour(7), null);
  assert.equal(cal.sautQuiReprend(14).numero, 2);
  assert.equal(cal.sautQuiReprend(3), null);
});

test('Textes : répondu, révélé, deviné ; jour de réponse ; ordre (partie 1.3)', () => {
  assert.equal(cal.texteRepondu(0), '0');
  assert.equal(cal.texteRepondu(-1), 'H90');
  assert.equal(cal.texteRepondu(-90), 'H1');
  assert.equal(cal.texteRepondu(15), null);
  assert.equal(cal.texteRevele(1), 'H90');
  assert.equal(cal.texteDevine(1), '0');
  assert.equal(cal.texteRevele(15), '13');
  assert.equal(cal.texteDevine(15), null);
  assert.equal(cal.jourDeReponse('H86'), -5);
  assert.equal(cal.jourDeReponse('0'), 0);
  assert.equal(cal.jourDeReponse('14'), 14);
  assert.throws(() => cal.jourDeReponse('E1'));
  assert.deepEqual(cal.textesEntree, ['E1', 'E2', 'E3']);
  const h = []; for (let i = 1; i <= 90; i++) { h.push('H' + i); }
  assert.deepEqual(cal.ordreTextes, ['E1', 'E2', 'E3'].concat(h, T(0, 14)));
});

test('Semaines : ce qu\'elles comptent (schéma, partie 2.4, exemples)', () => {
  assert.equal(cal.semaines.length, 15);
  assert.deepEqual(cal.textesRevelesSemaine(1), ['H1', 'H2', 'H3', 'H4', 'H5']);
  assert.deepEqual(cal.textesRepondusSemaine(1), ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
  assert.deepEqual(cal.textesRevelesSemaine(14), ['H90'].concat(T(0, 5)));
  assert.deepEqual(cal.textesRepondusSemaine(14), T(0, 6));
  assert.deepEqual(cal.textesRevelesSemaine(15), T(6, 12));
  assert.deepEqual(cal.textesRepondusSemaine(15), T(7, 13));
  assert.deepEqual(cal.textesRevelesSemaine(13).slice(-1), ['H89']);
  assert.equal(cal.semaineDuJour(1), 14);
  assert.equal(cal.semaineDuJour(14), 15);
  assert.equal(cal.semaineDuJour(15), null);
  assert.equal(cal.semaineDuJour(-90), 1);
  assert.deepEqual(cal.semainesEssai, [14, 15]);
  assert.equal(cal.rangEssai(14), 1);
  assert.equal(cal.rangEssai(15), 2);
  assert.throws(() => cal.rangEssai(13));
});

test('Membres : invitant, jour d\'arrivée du porteur', () => {
  assert.equal(cal.invitant, 'Valentin');
  assert.equal(cal.nomCercle, 'Amis');
  assert.deepEqual(cal.membres, ['Agathe', 'Nassim', 'Odile', 'Valentin', 'porteur']);
  assert.equal(cal.depuis('porteur'), 1);
  assert.equal(cal.depuis('Odile'), -90);
});

test('Tables incohérentes : refusées (la page s\'arrête en V4)', () => {
  const cas = {
    'texte révélé décalé': s => { s.calendrier[5].revele = '2'; },
    'manche décalée': s => { s.calendrier[2].manche = '0'; },
    'clôture avant la fin': s => { s.calendrier[13].type = 'cloture'; },
    'saut sans point de saut': s => { s.calendrier[3].type = 'saute'; s.calendrier[3].revelation_porteur = 'jamais_lue'; },
    'deviner_porteur contraire au type': s => { s.calendrier[4].deviner_porteur = true; },
    'révélation lue un jour sauté': s => { s.calendrier[4].revelation_porteur = 'lue'; },
    'révélation lue au jour d\'arrivée': s => { s.calendrier[0].revelation_porteur = 'lue'; },
    'jour manquant': s => { s.calendrier.splice(6, 1); },
    'nom du jour hors de la suite': s => { s.calendrier[2].nom_jour = 'jeudi'; },
    'semaines non contiguës': s => { s.semaines[3].premier_jour += 1; s.semaines[3].dernier_jour += 1; },
    'porteur arrivé un autre jour': s => { s.cercle.membres[4].depuis = 2; },
    'invitant hors du cercle': s => { s.cercle.invitant = 'Zoé'; },
    'texte répondu deux fois': s => { s.calendrier[9].repondu = '8'; },
    'clé en trop': s => { s.calendrier[0].semaine = 14; },
    'sauts dans le désordre': s => { for (const l of s.calendrier) { if (l.saut !== null) { l.saut = 3 - l.saut; } } },
    'saut qui reprend sur un jour sauté': s => { s.calendrier[6].type = 'saute'; s.calendrier[6].saut = 1; s.calendrier[6].deviner_porteur = false; s.calendrier[6].revelation_porteur = 'jamais_lue'; }
  };
  for (const nom of Object.keys(cas)) {
    const s = scelle();
    cas[nom](s);
    assert.throws(() => C.lire(s), C.ErreurCalendrier.name ? /calendrier/ : Error, nom);
  }
});

test('Aucun 14, 15, 16 ni 91 écrit en dur dans le code du lot 1 (schéma, partie 7.1, point 1)', () => {
  // Seules exceptions : des largeurs de format (hex16) et les numéros des règles de validité
  // du schéma (« err(14, … », règles 14 et 15 de la partie 4.4), pas des valeurs du calendrier.
  const permis = [/\[0-9a-f\]\{16\}/g, /err\((14|15), /g];
  for (const f of ['calendrier.js', 'journal.js', 'etat.js', 'memoire.js', 'socle.js']) {
    let code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    code = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    for (const p of permis) { code = code.replace(p, ''); }
    const trouves = code.match(/\b(14|15|16|91)\b/g);
    assert.equal(trouves, null, f + ' : ' + (trouves || []).join(', '));
  }
});
