/* Joueurs témoins de mes tests (lot 3), écrits à la main. Ce ne sont pas
 * les parties témoins (a), (b), (c) du §9 bis, qui seront jouées par le
 * harnais (lot 8) ; ils s'en inspirent pour exercer les mêmes chemins. */
'use strict';
const J = require('./joueurs.js');

const PERSOS = ['Agathe', 'Nassim', 'Odile', 'Valentin'];

/** Choisit la raison qui donne la classe voulue (§5.1), si elle existe. */
function raisonPour(texte, niveau, classe) {
  const cote = niveau <= 2 ? -1 : (niveau === 3 ? 0 : 1);
  const pi = cote > 0 ? texte.sens : 1 - texte.sens;
  const cons = texte.considerations;
  const avec = f => { const c = cons.find(f); return c ? c.rang : null; };
  if (classe === 'arbitrage') { return avec(c => c.pole === pi); }
  if (classe === 'penchant') { return avec(c => c.pole === 'aucun') || 'aucune'; }
  if (classe === 'tiraille') { return avec(c => c.pole === 1 - pi); }
  return avec(() => true);
}

/** Témoin A : toujours Neutre, passe tout, ne répond pas au texte 10. */
function temoinA(empreinte) {
  return {
    id: 'a', mode: 'interface', empreinte,
    ouverture: k => J.instant(k, ['07:12', '08:30', '12:01', '19:45'][k % 4]),
    versions: () => [1],
    entree: () => ({ reponse: { niveau: 3, raison: 'aucune' }, pari: 3 }),
    pseudo: 'Témoin-a-ka',
    deviner: (k, cartes) => cartes.map(() => ({ designe: 'passe', raison: null })),
    repondre: (k) => k === 10 ? null : { niveau: 3, raison: (k % 3 === 0) ? 'aucune' : 1 },
    relire: k => k % 3,
    attente: k => ['21:10'],
    carnet: (k, i) => ({ q1: i.faux >= 1 ? 'ne_pouvais_pas' : null, q2: k === 15 || (k >= 1 && !(i.etapes && i.etapes.repondre)) ? null : 'en_relisant',
      q3: k === 15 ? null : 'aucun' }),
    fin: { f2: 'toujours_autant', f1: J.f1Plein('milieu') }
  };
}

/** Témoin B : réponses écrites pour parcourir les quatre classes du §5.1,
 *  tente toutes les raisons cachées, attribue au hasard (déterministe),
 *  heure jouée deux fois le 25 octobre, lectures à 17:59 et 18:00, une
 *  ouverture deux jours après la précédente, une copie en cours de séance,
 *  un changement de version, une position sans raison, des cartes
 *  attribuées sans « Valider ». */
function temoinB(empreinte) {
  const h = J.hasard(4242);
  const classes = ['arbitrage', 'penchant', 'tiraille', 'neutre'];
  const ouvertures = {
    0: '2026-10-19T20:05+02:00', 1: '2026-10-20T09:00+02:00', 2: '2026-10-21T09:00+02:00', 3: '2026-10-22T18:00+02:00',
    4: '2026-10-23T17:59+02:00', 5: '2026-10-24T23:50+02:00', 6: '2026-10-25T02:30+02:00', 7: '2026-10-25T02:30+01:00',
    8: '2026-10-25T10:00+01:00', 9: '2026-10-27T08:00+01:00', 10: '2026-10-28T08:00+01:00', 11: '2026-10-29T08:00+01:00',
    12: '2026-10-30T00:00+01:00', 13: '2026-10-31T13:13+01:00', 14: '2026-11-01T09:00+01:00', 15: '2026-11-03T18:30+01:00'
  };
  return {
    id: 'b', mode: 'interface', empreinte,
    ouverture: k => ouvertures[k],
    versions: k => k < 9 ? [1] : (k === 9 ? [1, 2] : [2]),
    entree: (E) => ({ E1: { reponse: { niveau: 5, raison: 2 }, pari: 1 }, E2: { reponse: { niveau: 2, raison: 'aucune' }, pari: 4 },
      E3: { reponse: { niveau: 3, raison: 3 }, pari: 3 } })[E],
    pseudo: 'Témoin-b-4821-k',
    deviner: (k, cartes) => {
      if (k === 12) { return null; } // cartes touchées sans « Valider »
      const libres = PERSOS.slice();
      return cartes.map((c, i) => {
        if (k % 5 === 0 && i === 0) { return { designe: 'passe', raison: null }; }
        const d = libres.splice(h(libres.length), 1)[0];
        return { designe: d, raison: c.cachee ? (k % 4 === 0 ? 'aucune' : (k % 4) + 0) : null };
      });
    },
    repondre: (k, t) => {
      if (k === 6) { return null; } // position donnée sans raison
      const classe = classes[k % 4];
      const niveau = classe === 'neutre' ? 3 : (k % 2 ? 5 : 2);
      const r = raisonPour(t, niveau, classe);
      return { niveau, raison: r === null ? 'aucune' : r };
    },
    relire: k => (k * 7) % 4,
    attente: k => k === 3 ? ['17:59', '18:00'] : (k === 7 ? ['02:30'] : ['22:15']),
    copies: (k, s) => k === 9 ? [{ k: 9, coups: JSON.parse(JSON.stringify(Object.assign({}, s.coups, { reponse: null, relire: 0,
      deviner: s.coups.deviner.map(() => ({ designe: null, raison: null })), carnet: { q1: null, q2: null, q3: null } }))),
      versions: [1], etapes: { deviner: true, repondre: false } }] : [],
    carnet: (k, i) => ({ q1: i.faux >= 2 ? 'les_deux' : (i.faux === 1 ? 'aurais_pu' : null),
      q2: k === 15 || (k >= 1 && !(i.etapes && i.etapes.repondre)) ? null : 'premier_coup',
      q3: k === 15 ? null : i.choix[k % i.choix.length] }),
    fin: { f2: 'de_plus_en_plus', f1: J.f1Plein((p, t) => ['pole0', 'milieu', 'pole1', null][(p.length + t.charCodeAt(0)) % 4]) }
  };
}

/** Témoin C : lit les cartes et attribue tout juste (auteur d'origine),
 *  avec la vraie raison de la carte cachée. */
function temoinC(empreinte, scelle) {
  return {
    id: 'c', mode: 'interface', empreinte,
    ouverture: k => J.instant(k, '20:00'),
    versions: () => [1],
    entree: (E, inv) => ({ reponse: { niveau: 4, raison: 1 }, pari: inv.niveau }),
    pseudo: 'Témoin-c-x',
    deviner: (k, cartes) => cartes.map(c => ({ designe: c.auteur === 'porteur' ? 'passe' : c.auteur,
      raison: c.cachee ? scelle.reponses[String(k - 1)][c.auteur].raison : null })),
    repondre: (k, t) => ({ niveau: 4, raison: raisonPour(t, 4, 'arbitrage') || 1 }),
    attente: () => ['23:59'],
    carnet: (k, i) => ({ q1: null, q2: null, q3: null }),
    fin: { f2: null, f1: J.f1Plein('pole1') }
  };
}

/** Arrêts : à l'entrée (avant 1.9), au jour 2, au jour 8 avec n réponses
 *  sur les 6 textes révélés, au jour 5 avec F1 sautée. */
function temoinArret(empreinte, k, opts) {
  opts = opts || {};
  return {
    id: opts.id || 'd', mode: 'interface', empreinte,
    ouverture: j => J.instant(j, '11:11'),
    versions: () => [1],
    entree: (E) => (k === 0 && E === 'E2') ? { reponse: { niveau: 1, raison: 2 }, pari: null } : { reponse: { niveau: 1, raison: 2 }, pari: 5 },
    pseudo: k === 0 ? null : 'Témoin-d-y',
    deviner: (j, cartes) => cartes.map((c, i) => ({ designe: i === 0 ? 'passe' : c.auteur === 'porteur' ? 'passe' : c.auteur, raison: null })),
    repondre: (j, t) => (opts.sansReponse || []).indexOf(j) >= 0 ? null : { niveau: 2, raison: 'aucune' },
    carnet: () => null,
    arret: { k, raison: opts.raison === undefined ? 'vu_assez' : opts.raison, f2: k >= 3 ? 'jamais' : null,
      f1: k >= 3 && !opts.sansF1 ? J.f1Plein('pole0') : null, carnetVide: true }
  };
}

module.exports = { temoinA, temoinB, temoinC, temoinArret, raisonPour };
