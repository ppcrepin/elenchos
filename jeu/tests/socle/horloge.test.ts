// L'horloge de 18h, à l'heure de Paris (règle 6 ; D-043). Les trois premiers cas viennent de
// test-18h/tests/sans-base/horloge-et-horaires.test.ts (REPRIS). Ajoutés : le jour de jeu autour de 18h, et les deux
// prochains changements d'heure, le dimanche 25 octobre 2026 (on recule d'une heure) et le dimanche 28 mars 2027
// (on avance d'une heure). Ces deux dimanches, les titres tombent aussi à 18h.
//
// Le jour de jeu porte le nom du jour où il FINIT (regles.md §2 ; CONTRAT.md, partie 3) : le mardi à 17:59:59, on est
// dans le jour de jeu du mardi ; à 18:00:00, dans celui du mercredi. horloge.ts ne calcule plus rien lui-même : il
// appelle le moteur (src/regles/heure.ts). Le dernier test compare le moteur à la base de fuseaux de Node.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jourDeDate, jourSemaine } from '../../src/regles/heure.ts';
import {
  ajouterJours, dateDeJour, dimancheDeLaSemaine, fermetureDuJour, heureParis, horlogeReglable, instantParis, jourDeDateISO,
  jourDeJeu, ouvertureDuJour, partiesParis,
} from '../../src/serveur/horloge.ts';

test('18h à Paris, l’hiver et l’été, et autour des changements d’heure (repris)', () => {
  assert.equal(instantParis('2026-10-24', 18, 0).toISOString(), '2026-10-24T16:00:00.000Z'); // été (UTC+2)
  assert.equal(instantParis('2026-10-25', 18, 0).toISOString(), '2026-10-25T17:00:00.000Z'); // jour du passage à l'hiver
  assert.equal(instantParis('2026-10-26', 18, 0).toISOString(), '2026-10-26T17:00:00.000Z');
  assert.equal(instantParis('2026-10-20', 18, 10).toISOString(), '2026-10-20T16:10:00.000Z');
  assert.equal(heureParis(new Date('2026-10-25T17:00:09Z')), '18:00:09');
  const p = partiesParis(new Date('2026-10-18T15:59:59Z'));
  assert.deepEqual(p, { dateISO: '2026-10-18', heure: 17, minute: 59, seconde: 59, jourSemaine: 6 }); // dimanche
});

test('28 mars 2027 : 18h passe de UTC+1 à UTC+2 ; 2h30 n’existe pas cette nuit-là', () => {
  assert.equal(instantParis('2027-03-27', 18, 0).toISOString(), '2027-03-27T17:00:00.000Z'); // hiver
  assert.equal(instantParis('2027-03-28', 18, 0).toISOString(), '2027-03-28T16:00:00.000Z'); // jour du passage à l'été
  assert.throws(() => instantParis('2027-03-28', 2, 30), /inexistante/);
  // 25 octobre 2026 : 2h30 existe deux fois ; l'horloge rend la seconde (déjà à l'heure d'hiver). Le jeu ne demande
  // jamais cette heure-là : seule 18h compte.
  assert.equal(instantParis('2026-10-25', 2, 30).toISOString(), '2026-10-25T01:30:00.000Z');
});

test('17:59:59 contre 18:00:00 : le jour de jeu bascule à 18h pile, heure de Paris, et porte le nom du jour où il finit', () => {
  // Un jour ordinaire : le mardi à 17:59:59, c'est encore le jour de jeu du mardi ; à 18:00:00, celui du mercredi.
  assert.equal(jourDeJeu(new Date('2026-10-20T15:59:59Z')), '2026-10-20'); // mardi 17:59:59
  assert.equal(jourDeJeu(new Date('2026-10-20T16:00:00Z')), '2026-10-21'); // mardi 18:00:00
  // Dimanche 25 octobre 2026, passage à l'heure d'hiver (UTC+1 l'après-midi).
  assert.equal(heureParis(new Date('2026-10-25T16:59:59Z')), '17:59:59');
  assert.equal(jourDeJeu(new Date('2026-10-25T16:59:59Z')), '2026-10-25');
  assert.equal(jourDeJeu(new Date('2026-10-25T16:59:59.999Z')), '2026-10-25');
  assert.equal(jourDeJeu(new Date('2026-10-25T17:00:00Z')), '2026-10-26');
  // À 16:00Z ce jour-là, il est 17h à Paris : la veille d'une heure d'été ne vaut plus.
  assert.equal(jourDeJeu(new Date('2026-10-25T16:00:00Z')), '2026-10-25');
  // Dimanche 28 mars 2027, passage à l'heure d'été (UTC+2 l'après-midi).
  assert.equal(heureParis(new Date('2027-03-28T15:59:59Z')), '17:59:59');
  assert.equal(jourDeJeu(new Date('2027-03-28T15:59:59Z')), '2027-03-28');
  assert.equal(jourDeJeu(new Date('2027-03-28T16:00:00Z')), '2027-03-29');
  // À 17:00Z ce jour-là, il est déjà 19h à Paris.
  assert.equal(jourDeJeu(new Date('2027-03-28T17:00:00Z')), '2027-03-29');
  // Minuit ne change rien : le jour de jeu court de 18h à 18h.
  assert.equal(jourDeJeu(new Date('2026-10-25T22:30:00Z')), '2026-10-26'); // dimanche 23h30
  assert.equal(jourDeJeu(new Date('2026-10-25T23:30:00Z')), '2026-10-26'); // lundi 0h30
});

test('un jour de jeu dure 25 heures quand on recule d’une heure (celui du 25 octobre 2026), 23 quand on avance (28 mars 2027)', () => {
  const heures = (jour: string) => (fermetureDuJour(jour).getTime() - ouvertureDuJour(jour).getTime()) / 3_600_000;
  assert.equal(heures('2026-10-25'), 25); // du samedi 24 à 18h au dimanche 25 à 18h
  assert.equal(heures('2026-10-26'), 24);
  assert.equal(heures('2027-03-28'), 23); // du samedi 27 à 18h au dimanche 28 à 18h
  assert.equal(heures('2027-03-29'), 24);
  assert.equal(ouvertureDuJour('2026-10-25').toISOString(), '2026-10-24T16:00:00.000Z');
  assert.equal(fermetureDuJour('2026-10-25').toISOString(), '2026-10-25T17:00:00.000Z');
  assert.equal(fermetureDuJour('2027-03-28').toISOString(), '2027-03-28T16:00:00.000Z');
  // Le texte du jour de jeu du jeudi 22 octobre s'ouvre le mercredi 21 à 18h et se ferme le jeudi 22 à 18h.
  assert.equal(ouvertureDuJour('2026-10-22').toISOString(), instantParis('2026-10-21', 18, 0).toISOString());
  assert.equal(fermetureDuJour('2026-10-22').toISOString(), instantParis('2026-10-22', 18, 0).toISOString());
});

test('l’horloge simulée franchit 18h et les changements d’heure', () => {
  const h = horlogeReglable(new Date('2026-10-25T16:59:59Z'));
  assert.equal(jourDeJeu(h.maintenant()), '2026-10-25');
  h.avancer(1000);
  assert.equal(jourDeJeu(h.maintenant()), '2026-10-26');
  assert.equal(heureParis(h.maintenant()), '18:00:00');
  h.regler(new Date('2027-03-28T15:59:59Z'));
  assert.equal(jourDeJeu(h.maintenant()), '2027-03-28');
  h.avancer(1000);
  assert.equal(jourDeJeu(h.maintenant()), '2027-03-29');
});

test('dates civiles et semaine nommée par son dimanche (règle 12) ; un seul jour de la semaine, 0 = lundi', () => {
  assert.equal(ajouterJours('2026-10-25', 1), '2026-10-26');
  assert.equal(ajouterJours('2027-03-01', -1), '2027-02-28');
  assert.equal(ajouterJours('2028-03-01', -1), '2028-02-29');
  assert.equal(jourSemaine(jourDeDate('2026-10-19')), 0); // lundi
  assert.equal(jourSemaine(jourDeDate('2026-10-25')), 6); // dimanche
  assert.equal(partiesParis(new Date('2026-10-19T10:00:00Z')).jourSemaine, 0);
  assert.equal(dimancheDeLaSemaine('2026-10-19'), '2026-10-25'); // lundi
  assert.equal(dimancheDeLaSemaine('2026-10-24'), '2026-10-25'); // samedi
  assert.equal(dimancheDeLaSemaine('2026-10-25'), '2026-10-25'); // le dimanche clôt sa semaine
  assert.equal(dimancheDeLaSemaine('2026-10-26'), '2026-11-01');
  assert.equal(dimancheDeLaSemaine('2027-03-28'), '2027-03-28');
  assert.equal(dateDeJour(jourDeDateISO('2026-10-25')), '2026-10-25');
  assert.throws(() => ajouterJours('25/10/2026', 1), /illisible/);
  assert.throws(() => jourDeDateISO('2026-02-30'), /illisible/);
});

test('le moteur et la base de fuseaux de Node donnent la même heure de Paris, chaque heure de 2026 à 2028', () => {
  const intl = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    weekday: 'short', hourCycle: 'h23',
  });
  const jours: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  let n = 0;
  for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2029, 0, 1); t += 3_600_000) {
    const p: Record<string, string> = {};
    for (const m of intl.formatToParts(new Date(t))) p[m.type] = m.value;
    const attendu = { dateISO: `${p.year}-${p.month}-${p.day}`, heure: Number(p.hour), minute: Number(p.minute), jour: jours[p.weekday ?? ''] };
    const vu = partiesParis(new Date(t));
    assert.deepEqual({ dateISO: vu.dateISO, heure: vu.heure, minute: vu.minute, jour: vu.jourSemaine }, attendu, new Date(t).toISOString());
    n += 1;
  }
  assert.ok(n > 26_000);
});
