/* Tests du moteur et du carnet (lot 3). Lancer : node --test tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const M = require('../moteur.js');
const TR = require('../trace.js');
const J = require('./joueurs.js');
const T = require('./temoins.js');

const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, '../../scellement/candidat/fichier-scelle-candidat.json');
const OCTETS = new Uint8Array(fs.readFileSync(SCELLE));
const EMPREINTE = N.sha256(OCTETS);
const scelle = JSON.parse(N.utf8Decoder(OCTETS));
/** Empreinte du candidat sur lequel les cas « à la main » ont été vérifiés. */
const CANDIDAT_VERIFIE = '59db748499fd1ece3d5bf6f8ec4b3fed3badd15eb39cf474cd0e31d3045c7b64';

const F = N.Fraction;
const PERSOS = M.PERSONNAGES, MEMBRES = M.MEMBRES, TENSIONS = M.TENSIONS;

/* ------------------------------------------------------------------ */
/* Schéma fermé de la trace (partie 3)                                 */
/* ------------------------------------------------------------------ */

function cles(o) { return Object.keys(o).sort().join(','); }
const RE_FRACTION = /^-?(0|[1-9][0-9]*)(\/[1-9][0-9]*)?$/;
function estFraction(s) {
  if (typeof s !== 'string' || !RE_FRACTION.test(s)) { return false; }
  const f = F(s);
  return f.toString() === s && (s.indexOf('/') < 0 || f.d >= 2n);
}

function verifierSchemaTrace(tr, mode) {
  assert.equal(cles(tr), 'agregats,arret,carnet,copies,empreinte_scelle,fin,format,partie,seances,version');
  assert.equal(tr.format, 'elenchos-essai-trace');
  assert.equal(tr.version, 3);
  assert.equal(cles(tr.agregats), 'justesse_personnages_entre_eux,justesse_personnages_sur_porteur,titres_tires_au_sort');
  tr.seances.forEach((s, k) => {
    const ou = 'séance ' + k;
    assert.equal(cles(s), 'attente,coups,curseurs_vus,dimanche,entree,etapes,k,manches,mesures,ouverture,phrase_jour,portrait,revelation,surprises_proches,versions', ou);
    assert.equal(s.entree === null, k !== 0, ou + ' entree');
    assert.equal(s.revelation === null, !(k >= 3 && k <= 15), ou + ' revelation');
    assert.equal(s.manches === null, !(k >= 2 && k <= 14), ou + ' manches');
    assert.equal(s.dimanche === null, !(k === 7 || k === 14), ou + ' dimanche');
    assert.equal(s.phrase_jour === null, !(k >= 1 && k <= 14 && s.coups.reponse !== null), ou + ' phrase_jour');
    if (mode === 'moteur') { assert.equal(s.versions, null); assert.equal(s.etapes, null); }
    assert.equal(cles(s.mesures), 'duree_deviner,duree_repondre,duree_seance,jours_ecoules,passer,relire,revelation_raison_tentee,revelation_verdicts');
    assert.equal(cles(s.portrait), 'ordre_moi,tensions');
    assert.deepEqual(s.portrait.ordre_moi.slice().sort(), ['L', 'P', 'S', 'T']);
    for (const t of TENSIONS) {
      assert.equal(cles(s.portrait.tensions[t]), 'c,l,net,somme_w');
      assert.ok(['c', 'l', 'somme_w'].every(x => estFraction(s.portrait.tensions[t][x])));
      assert.equal(s.portrait.tensions[t].net, false);
    }
    assert.equal(cles(s.curseurs_vus), 'Agathe,Nassim,Odile,Valentin');
    assert.equal(cles(s.surprises_proches), 'Agathe,Nassim,Odile,Valentin');
    if (s.manches) {
      assert.ok(s.manches.porteur, ou + ' : le porteur a toujours une manche');
      for (const g of Object.keys(s.manches)) {
        const m = s.manches[g];
        assert.equal(cles(m), 'cartes,classement,cotes_attendus,curseur_porteur,departages,mediane,ordre,places,possibles,raison_cachee,rangs,remplacements,texte,total');
        assert.equal(m.texte, String(k - 1));
        for (const a of Object.keys(m.possibles)) {
          assert.equal(cles(m.possibles[a]), 'c,distance,l,niveau,q,raison,rarete,somme_w,surprise,x');
          ['c', 'distance', 'l', 'q', 'rarete', 'somme_w', 'surprise', 'x'].forEach(x => assert.ok(estFraction(m.possibles[a][x]), ou + ' ' + x));
        }
        for (const c of m.cartes) { assert.equal(cles(c), 'auteur,auteur_compte,cachee,designe,raison_devinee'); }
        if (g === 'porteur') { assert.equal(m.rangs, null); assert.equal(m.cotes_attendus, null); assert.equal(m.curseur_porteur, null); assert.equal(m.total, null); }
        else { assert.equal(cles(m.curseur_porteur), 'c,somme_w'); }
      }
    }
    if (s.revelation) {
      assert.equal(cles(s.revelation), 'devineurs,texte');
      for (const g of Object.keys(s.revelation.devineurs)) { assert.equal(cles(s.revelation.devineurs[g]), 'justes,points,points_semaine,raison_trouvee,verdicts'); }
    }
    if (s.dimanche) {
      assert.equal(cles(s.dimanche), 'devin,fidele,mystere,pas_de_cote,phrase_semaine,sans_faute,semaine,surprise');
      assert.equal(cles(s.dimanche.devin), 'departage,points,raisons,titulaire');
      assert.equal(cles(s.dimanche.mystere), 'departage,erreurs,tentatives,titulaire');
      assert.equal(cles(s.dimanche.surprise), 'attributions,departage,erreurs,texte');
      assert.equal(cles(s.dimanche.phrase_semaine), 'cas,phrase,poids,tension');
      assert.deepEqual(s.dimanche.pas_de_cote, []);
    }
    if (s.attente) { s.attente.lectures.forEach(l => assert.equal(cles(l), 'heure,visages')); }
    if (s.phrase_jour) { assert.equal(cles(s.phrase_jour), 'classe,phrase,pole,texte,w'); }
  });
  // forme canonique possible (NFC, entiers, clés ASCII)
  N.jsonCanonique(tr);
}

/* ------------------------------------------------------------------ */
/* Invariants des règles                                               */
/* ------------------------------------------------------------------ */

function rep(tr, membre, n) {
  if (membre !== 'porteur') { return scelle.reponses[n][membre] || null; }
  if (/^E/.test(n)) { return tr.seances[0].coups.entree[n].reponse; }
  return tr.seances[+n] ? tr.seances[+n].coups.reponse : null;
}

function verifierRegles(tr) {
  const K = tr.seances.length - 1;
  tr.seances.forEach((s, k) => {
    if (!s.manches) { return; }
    const n = String(k - 1);
    for (const g of Object.keys(s.manches)) {
      const m = s.manches[g];
      if (g !== 'porteur') { assert.ok(scelle.reponses[String(k)][g], 'un absent ne devine pas'); }
      const auteurs = MEMBRES.filter(x => x !== g && rep(tr, x, n));
      assert.deepEqual(Object.keys(m.possibles).sort(), auteurs.slice().sort(), 'possibles');
      assert.equal(m.places.length, Math.min(3, auteurs.length));
      assert.equal(new Set(m.places).size, m.places.length);
      assert.deepEqual(m.ordre.slice().sort(), m.places.slice().sort());
      assert.deepEqual(m.cartes.map(c => c.auteur), m.ordre);
      assert.equal(m.cartes.filter(c => c.cachee).length, m.cartes.length ? 1 : 0);
      if (m.cartes.length) { assert.equal(m.cartes.find(c => c.cachee).auteur, m.raison_cachee); }
      // classement par surprise décroissante
      for (let i = 1; i < m.classement.length; i++) {
        assert.ok(F(m.possibles[m.classement[i - 1]].surprise).cmp(m.possibles[m.classement[i]].surprise) >= 0);
      }
      // redistribution : permutation des auteurs, seulement entre cartes identiques
      assert.deepEqual(m.cartes.map(c => c.auteur_compte).sort(), m.cartes.map(c => c.auteur).sort());
      for (const c of m.cartes) {
        if (c.auteur_compte !== c.auteur) {
          const a = m.possibles[c.auteur], b = m.possibles[c.auteur_compte];
          assert.ok(a.niveau === b.niveau && a.raison === b.raison, 'redistribution entre cartes identiques seulement');
        }
      }
      // les cartes placées identiques restent seulement si aucune réponse non placée n'est différente
      if (g !== 'porteur') {
        const des = m.cartes.map(c => c.designe);
        assert.ok(des.every(d => d !== 'passe' && d !== null && d !== g && MEMBRES.includes(d)), 'un personnage ne passe jamais');
        assert.equal(new Set(des).size, des.length);
        assert.equal(cles(m.rangs), MEMBRES.filter(x => x !== g).sort().join(','));
        assert.deepEqual(Object.values(m.rangs).sort(), [1, 2, 3, 4]);
        for (const c of m.cartes) { if (c.cachee) { assert.notEqual(c.raison_devinee, null); assert.notEqual(c.raison_devinee, 'aucune'); } else { assert.equal(c.raison_devinee, null); } }
        assert.equal(m.cotes_attendus.porteur === 'inconnu', m.curseur_porteur.somme_w === '0');
      }
    }
  });
  tr.seances.forEach((s, k) => {
    if (!s.revelation) { return; }
    for (const g of Object.keys(s.revelation.devineurs)) {
      const d = s.revelation.devineurs[g];
      const m = tr.seances[k - 1].manches[g];
      assert.equal(d.points, m.cartes.filter(c => c.designe === c.auteur_compte).length);
      assert.equal(d.justes.length, m.cartes.length);
      if (k === 15) { assert.equal(d.points_semaine, null); }
      else if (k !== 3 && k !== 8 && tr.seances[k - 1].revelation && tr.seances[k - 1].revelation.devineurs[g]) {
        assert.equal(d.points_semaine, tr.seances[k - 1].revelation.devineurs[g].points_semaine + d.points);
      }
    }
  });
  // phrases
  const phrasesJour = /^Aujourd’hui, tu (as fait passer .+ avant .+|as penché vers .+|as donné du poids (à|au) .+ comme (à|au) .+|n’as penché ni vers .+ ni vers .+)\.$/;
  tr.seances.forEach(s => {
    if (s.phrase_jour) { assert.match(s.phrase_jour.phrase, phrasesJour); assert.ok(!/ à le /.test(s.phrase_jour.phrase)); }
    if (s.dimanche) {
      assert.match(s.dimanche.phrase_semaine.phrase, /^(Cette semaine, entre .+ et .+, tu as (le plus souvent choisi .+|penché autant d’un côté que de l’autre)\.|Cette semaine, ton portrait est encore flou\. Chaque réponse le précise\.)$/);
      const d = s.dimanche;
      const maxP = Math.max(...MEMBRES.map(x => d.devin.points[x]));
      if (d.devin.titulaire) { assert.equal(d.devin.points[d.devin.titulaire], maxP); } else { assert.equal(maxP, 0); }
      if (d.mystere.titulaire) { assert.ok(d.mystere.tentatives[d.mystere.titulaire] >= 6 && d.mystere.erreurs[d.mystere.titulaire] >= 1); }
      for (const m of MEMBRES) { if (d.mystere.erreurs[m] === 0) { assert.notEqual(d.mystere.titulaire, m, 'Le Mystère exige au moins 1 erreur'); } }
      if (d.surprise.texte) { assert.ok(d.surprise.attributions[d.surprise.texte] >= 4 && d.surprise.erreurs[d.surprise.texte] >= 1); }
      if (d.semaine === 1) { assert.deepEqual(d.sans_faute, []); }
    }
  });
  assert.ok(K >= 0);
}

/* ------------------------------------------------------------------ */
/* Forme du carnet (§8.12)                                             */
/* ------------------------------------------------------------------ */

const RE_DUREE = /\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b/g;

function verifierFormeCarnet(texte, pseudo) {
  assert.ok(texte.endsWith('\n\nFin du carnet'));
  assert.ok(!texte.startsWith('\n'));
  assert.equal(texte, texte.normalize('NFC'));
  assert.ok(!/[\t\r  ']/.test(texte), 'seule l’espace U+0020, apostrophe U+2019');
  assert.ok(!/\n\n\n/.test(texte), 'une seule ligne vide entre deux blocs');
  for (const ligne of texte.split('\n')) {
    assert.ok(!/ {2}|^ | $/.test(ligne), 'espaces : ' + ligne);
    assert.ok(!/^([-*#>]|[0-9]+\.)/.test(ligne), 'ligne lue comme une liste : ' + ligne);
  }
  assert.equal(texte.replace(RE_DUREE, '‹durée›').indexOf('min'), -1, '« min » hors des durées');
  if (pseudo) { assert.equal(texte.indexOf(pseudo), -1, 'le pseudo n’entre jamais dans le carnet'); }
}

function masquerDurees(texte) { return texte.replace(RE_DUREE, '‹durée›'); }

/** Blocs de séance d'un carnet (titres et chiffres globaux exclus). */
function blocsSeance(texte) {
  return texte.split('\n\n').filter(b => /^(Entrée|Jour [0-9]+ sur 14|Clôture)\n/.test(b)).map(masquerDurees);
}

/* ------------------------------------------------------------------ */

function partie(joueur) {
  const journal = J.jouer(scelle, joueur);
  const ecarts = M.validerJournal(scelle, journal);
  assert.deepEqual(ecarts, [], 'journal valide');
  const durees = joueur.mode === 'interface' ? J.dureesPour(journal) : null;
  const tr = TR.tracer(N, M, scelle, journal, durees, EMPREINTE);
  return { journal, tr, durees };
}

const temoins = [
  ['A', () => T.temoinA(EMPREINTE)],
  ['B', () => T.temoinB(EMPREINTE)],
  ['C', () => T.temoinC(EMPREINTE, scelle)]
];

for (const [nom, fab] of temoins) {
  test('Témoin ' + nom + ' : journal valide, trace au schéma fermé, règles, carnet', () => {
    const { journal, tr } = partie(fab());
    verifierSchemaTrace(tr, 'interface');
    verifierRegles(tr);
    verifierFormeCarnet(tr.carnet.texte, journal.seances[0].coups.pseudo);
    tr.copies.forEach(c => verifierFormeCarnet(c.texte, journal.seances[0].coups.pseudo));
    // déterminisme
    assert.equal(N.jsonCanonique(TR.tracer(N, M, scelle, journal, J.dureesPour(journal), EMPREINTE)), N.jsonCanonique(tr));
  });
}

test('Témoin A : passe tout (verdicts « passé »), pas de réponse au texte 10, Fidèle sans le porteur en semaine 2', () => {
  const { tr } = partie(T.temoinA(EMPREINTE));
  for (let k = 3; k <= 15; k++) { assert.ok(tr.seances[k].mesures.revelation_verdicts.every(v => v === 'passe')); }
  assert.equal(tr.seances[10].coups.reponse, null);
  assert.equal(tr.seances[10].phrase_jour, null);
  assert.ok(tr.seances[7].dimanche.fidele.titulaires.includes('porteur'));
  assert.ok(!tr.seances[14].dimanche.fidele.titulaires.includes('porteur'));
  assert.equal(tr.seances[14].dimanche.devin.points.porteur, 0);
  tr.seances.forEach(s => { if (s.phrase_jour) { assert.equal(s.phrase_jour.classe, 'neutre'); assert.equal(s.phrase_jour.pole, null); } });
  assert.match(tr.carnet.texte, /\nJour 10 sur 14\n[^]*?Durée : ‹?[0-9]+ min [0-9]{2} s, dont [0-9]+ min [0-9]{2} s pour deviner et [0-9]+ min [0-9]{2} s pour répondre\./);
});

test('Témoin C : tout juste, raisons trouvées, Le Sans-Faute obtenu', () => {
  const { tr } = partie(T.temoinC(EMPREINTE, scelle));
  for (let k = 3; k <= 15; k++) {
    const v = tr.seances[k].mesures.revelation_verdicts;
    assert.ok(v.every(x => x === 'juste_et_raison' || x === 'juste'), 'séance ' + k + ' : ' + v);
    assert.equal(v.filter(x => x === 'juste_et_raison').length, v.length ? 1 : 0);
  }
  assert.ok(tr.seances[14].dimanche.sans_faute.includes('porteur'), 'le porteur qui trouve tout décroche Le Sans-Faute');
  assert.equal(tr.seances[7].dimanche.devin.raisons.porteur, 5);
});

test('Témoin B : 25 octobre, version 1 puis 2, copie en cours de séance, position sans raison, manche non validée', () => {
  const { journal, tr } = partie(T.temoinB(EMPREINTE));
  assert.equal(tr.seances[6].ouverture, '2026-10-25T02:30+02:00');
  assert.equal(tr.seances[7].ouverture, '2026-10-25T02:30+01:00');
  assert.equal(tr.seances[7].mesures.jours_ecoules, 0);
  assert.equal(tr.seances[9].mesures.jours_ecoules, 2);
  assert.match(tr.carnet.texte, /\nJour 6 sur 14\nOuverture : dimanche 25 octobre 2026, entre 2h00 et 2h59\.\n/);
  assert.match(tr.carnet.texte, /\nJour 9 sur 14\n(.*\n){2}Version de la page : 1, puis 2\.\n/);
  assert.match(tr.carnet.texte, /\nJour 10 sur 14\n(.*\n){2}Version de la page : 2\.\n/);
  assert.equal(tr.seances[6].coups.reponse, null);
  assert.equal(tr.seances[6].etapes.repondre, true);
  assert.ok(tr.seances[12].coups.deviner.every(d => d.designe === null));
  assert.equal(tr.seances[12].coups.reponse, null);
  assert.ok(tr.seances[13].mesures.revelation_verdicts.every(v => v === 'passe'));
  // lectures d'« En attendant » à 17:59 et 18:00 (§7.5)
  assert.deepEqual(tr.seances[3].attente.lectures.map(l => l.heure), ['17:59', '18:00']);
  assert.equal(M.minutesAvantDixHuit('17:59'), 1);
  assert.equal(M.minutesAvantDixHuit('18:00'), 1440);
  // copie : état d'avant, carnet en cours
  assert.equal(tr.copies.length, 1);
  const cp = tr.copies[0];
  assert.match(cp.texte, /\nEssai en cours : carnet copié au jour 9\.\n/);
  assert.ok(!/Questions de fin|Raison de l’arrêt/.test(cp.texte));
  assert.match(cp.texte, /\nJour 9 sur 14\n(.*\n){2}Version de la page : 1\.\n/);
  assert.match(cp.texte, /Titres de la semaine 1\n/);
  assert.ok(!/Titres de la semaine 2/.test(cp.texte));
  assert.match(cp.texte, /Jour 9 sur 14\n(.*\n){3}Durée : [0-9]+ min [0-9]{2} s, dont [0-9]+ min [0-9]{2} s pour deviner\.\nBoutons touchés : Relire 0 fois, Passer 0 fois\./);
  assert.equal(cp.mesures.passer, 0);
  assert.equal(cp.mesures.relire, 0);
  assert.deepEqual(cp.mesures.revelation_verdicts, tr.seances[9].mesures.revelation_verdicts);
  // les blocs des séances 0 à 8 sont les mêmes dans la copie et dans le carnet final
  assert.deepEqual(blocsSeance(cp.texte).slice(0, 9), blocsSeance(tr.carnet.texte).slice(0, 9));
});

test('Arrêts : à l’entrée, au jour 2, au jour 5 sans F1 ; « Questions de fin » dès le jour 3', () => {
  const a0 = partie(T.temoinArret(EMPREINTE, 0, { id: 'e' })).tr;
  assert.match(a0.carnet.texte, /^Carnet de l’essai Elenchos\n.*\n.*\nEssai arrêté à l’entrée\.\nRaison de l’arrêt : J’ai vu ce que je voulais voir\.\n\nEntrée\n/);
  assert.ok(!/Questions de fin/.test(a0.carnet.texte));
  assert.match(a0.carnet.texte, /Sur tout l’essai\n.*: pas de chiffre\.\n.*: pas de chiffre\.\nTitres attribués par tirage au sort, faute de départage : pas de chiffre\.\n\nFin du carnet$/);
  assert.equal(a0.seances.length, 1);
  assert.equal(a0.seances[0].entree.textes.E2.juste, null);
  assert.equal(a0.seances[0].entree.textes.E3.juste, null);
  const a2 = partie(T.temoinArret(EMPREINTE, 2, { id: 'f', raison: null })).tr;
  assert.match(a2.carnet.texte, /\nEssai arrêté au jour 2\.\nRaison de l’arrêt : pas de réponse\.\n/);
  assert.ok(!/Questions de fin/.test(a2.carnet.texte));
  const a5 = partie(T.temoinArret(EMPREINTE, 5, { id: 'g', sansF1: true })).tr;
  assert.match(a5.carnet.texte, /\n\nQuestions de fin\nJusqu’ici, deviner était : Jamais amusant\.\nOù vous placez chacun : question passée\.\n\nFin du carnet$/);
  const a6 = partie(T.temoinArret(EMPREINTE, 6, { id: 'h' })).tr;
  assert.match(a6.carnet.texte, /\nOù vous placez chacun :\nAgathe : Sécurité · Précaution · Tradition · Local\.\nNassim : /);
});

test('Arrêt au jour 8 : « pas de chiffre » avec 4 réponses sur 6 textes révélés, des chiffres avec 5 (contrôle 12)', () => {
  const quatre = partie(T.temoinArret(EMPREINTE, 8, { id: 'i', sansReponse: [2, 5] })).tr;
  assert.match(quatre.carnet.texte, /Sur tout l’essai\n.*: pas de chiffre\.\n.*: pas de chiffre\.\n.*: pas de chiffre\./);
  const cinq = partie(T.temoinArret(EMPREINTE, 8, { id: 'j', sansReponse: [2] })).tr;
  assert.match(cinq.carnet.texte, /Sur tout l’essai\nQuand un personnage devinait la réponse d’un autre personnage, il a trouvé son auteur : [0-9]+ fois sur [0-9]+\.\n/);
  assert.match(cinq.carnet.texte, /Titres attribués par tirage au sort, faute de départage : [0-6]\./);
});

test('Contrôle 12 : quatre variantes des réponses, mêmes blocs de séance', () => {
  for (const [nom, fab] of temoins) {
    const base = partie(fab()).tr;
    const variantes = [
      j => Object.assign(j, { repondre: (k, t) => { const r = fab().repondre(k, t); return r ? { niveau: 6 - r.niveau, raison: r.raison } : r; } }),
      j => Object.assign(j, { repondre: (k, t) => fab().repondre(k, t) ? { niveau: 3, raison: 2 } : null }),
      j => Object.assign(j, { repondre: (k, t) => { const r = fab().repondre(k, t); return r ? { niveau: r.niveau, raison: r.raison === 'aucune' ? 1 : (r.raison % 4 === 0 ? 'aucune' : r.raison + 1) } : r; } }),
      j => Object.assign(j, { repondre: (k, t) => k === 4 ? null : fab().repondre(k, t), attente: k => k === 4 ? [] : fab().attente(k) })
    ];
    variantes.forEach((v, i) => {
      const tr = partie(v(fab())).tr;
      assert.deepEqual(blocsSeance(tr.carnet.texte), blocsSeance(base.carnet.texte), 'témoin ' + nom + ', variante ' + (i + 1));
      tr.seances.forEach((s, k) => {
        const a = Object.assign({}, s.mesures), b = Object.assign({}, base.seances[k].mesures);
        assert.deepEqual(a, b, 'mesures, séance ' + k);
      });
      tr.copies.forEach((c, j) => assert.deepEqual(blocsSeance(c.texte), blocsSeance(base.copies[j].texte)));
    });
  }
});

test('Validité du journal : des journaux fautifs sont refusés', () => {
  const j = J.jouer(scelle, T.temoinB(EMPREINTE));
  const muter = f => { const x = JSON.parse(JSON.stringify(j)); f(x); return M.validerJournal(scelle, x); };
  assert.notDeepEqual(muter(x => { x.seances[3].coups.deviner[0].designe = x.seances[3].coups.deviner[1].designe; }), []);
  assert.notDeepEqual(muter(x => { x.seances[1].coups.relire = 2; }), []);
  assert.notDeepEqual(muter(x => { x.seances[4].ouverture = '2026-10-19T08:00+02:00'; }), []);
  assert.notDeepEqual(muter(x => { x.seances[2].coups.carnet.q1 = 'aurais_pu'; }), []);
  assert.notDeepEqual(muter(x => { x.seances[1].coups.carnet.q3 = 'deviner'; }), []);
  assert.notDeepEqual(muter(x => { x.seances[0].coups.entree.E2.pari = null; }), []);
  assert.notDeepEqual(muter(x => { x.fin.f1 = null; }), []);
  assert.notDeepEqual(muter(x => { x.seances[9].versions = [2, 1]; }), []);
  assert.notDeepEqual(muter(x => { x.seances[5].etapes.repondre = false; }), []);
  assert.notDeepEqual(muter(x => { x.seances[5].coups.deviner.forEach(d => { d.raison = null; }); x.seances[5].coups.deviner[0].raison = 9; }), []);
  assert.notDeepEqual(muter(x => { x.arret = { k: 15, raison: null, f2: null, f1: null }; }), []);
  // pseudo tel que la page le garde (§7.2, Q-F7)
  for (const p of ['', ' Lou', 'Lou ', 'Lou  B', 'Lou\u00a0B', 'Lou\u200bB', 'e\u0301', 'ODILE', 'Témoin-b-4821-k-trop-long']) {
    assert.notDeepEqual(muter(x => { x.seances[0].coups.pseudo = p; }), [], JSON.stringify(p));
  }
  assert.deepEqual(muter(x => { x.seances[0].coups.pseudo = 'Témoin-b-4821-k'; }), []);
  // copies : règles 7 et 10 sur leurs coups (règle 14)
  assert.equal(j.copies.length, 1);
  assert.deepEqual(muter(() => {}), []);
  assert.notDeepEqual(muter(x => { x.copies[0].coups.carnet.q3 = 'titres'; }), []);
  assert.notDeepEqual(muter(x => { x.copies[0].coups.deviner = x.copies[0].coups.deviner.concat([{ designe: null, raison: null }]); }), []);
  assert.notDeepEqual(muter(x => { x.copies[0].k = 15; }), []);
  assert.throws(() => TR.tracer(N, M, scelle, Object.assign({}, j, { seances: j.seances.slice(0, 4) }), null, EMPREINTE));
});

test('Q3 : choix selon les écrans affichés, jamais selon la réponse (§8.3, commit 3553b2e)', () => {
  assert.deepEqual(M.choixQ3(0, null), ['donner_avis', 'deviner', 'revelation', 'aucun']);
  assert.deepEqual(M.choixQ3(1, { deviner: false, repondre: true }), ['donner_avis', 'phrase_jour', 'aucun']);
  assert.deepEqual(M.choixQ3(1, { deviner: false, repondre: false }), ['aucun']);
  assert.deepEqual(M.choixQ3(5, { deviner: false, repondre: true }), ['revelation', 'donner_avis', 'phrase_jour', 'aucun']);
  assert.deepEqual(M.choixQ3(7, { deviner: true, repondre: false }), ['revelation', 'titres', 'phrase_semaine', 'deviner', 'aucun']);
  assert.deepEqual(M.choixQ3(15, null), []);
});

test('200 parties au hasard (mode moteur) : schéma, règles, déterminisme ; couverture relevée', () => {
  const couverture = {};
  const noter = c => { couverture[c] = (couverture[c] || 0) + 1; };
  for (let i = 1; i <= 200; i++) {
    const h = J.hasard(1000 + i);
    const choixRaison = () => [1, 2, 3, 4, 'aucune'][h(5)];
    const arret = h(10) === 0 ? 1 + h(14) : null;
    const joueur = {
      id: 'hasard-' + String(i).padStart(3, '0'), graine: N.sha256(N.asciiOctets('graine-test-' + i)).slice(0, 16), mode: 'moteur', empreinte: EMPREINTE,
      ouverture: k => J.instant(k, N.deux(h(24)) + ':' + N.deux(h(60))),
      entree: () => ({ reponse: { niveau: 1 + h(5), raison: choixRaison() }, pari: 1 + h(5) }),
      pseudo: 'Hasard-' + i + '-x',
      deviner: (k, cartes) => {
        if (h(12) === 0) { return null; }
        const libres = PERSOS.slice();
        return cartes.map(c => {
          if (h(5) === 0) { return { designe: 'passe', raison: null }; }
          const d = libres.splice(h(libres.length), 1)[0];
          return { designe: d, raison: c.cachee && h(2) ? choixRaison() : null };
        });
      },
      repondre: () => h(8) === 0 ? null : { niveau: 1 + h(5), raison: choixRaison() },
      relire: () => h(3),
      attente: () => [N.deux(h(24)) + ':' + N.deux(h(60))],
      carnet: null,
      arret: arret === null ? null : { k: arret, raison: null, f2: null, f1: null },
      fin: { f2: null, f1: J.f1Plein(null) }
    };
    const { journal, tr } = partie(joueur);
    verifierSchemaTrace(tr, 'moteur');
    verifierRegles(tr);
    assert.equal(tr.carnet, null);
    assert.equal(N.jsonCanonique(TR.tracer(N, M, scelle, journal, null, EMPREINTE)), N.jsonCanonique(tr));
    // couverture
    tr.seances.forEach(s => {
      if (s.phrase_jour) { noter('phrase du jour ' + s.phrase_jour.classe); }
      if (s.dimanche) {
        noter('phrase de la semaine ' + s.dimanche.phrase_semaine.cas);
        ['devin', 'mystere', 'surprise'].forEach(t => noter(t + ' départage ' + s.dimanche[t].departage));
        if (s.dimanche.sans_faute.length) { noter('Sans-Faute obtenu'); }
        noter('Fidèle ' + (s.dimanche.fidele.titulaires.includes('porteur') ? 'avec' : 'sans') + ' le porteur');
      }
      if (!s.manches) { return; }
      for (const g of Object.keys(s.manches)) {
        const m = s.manches[g];
        noter('manche de ' + m.cartes.length + ' carte(s)');
        if (m.remplacements.length) { noter('cartes identiques remplacées'); }
        const auts = m.cartes.map(c => m.possibles[c.auteur]);
        if (auts.some((a, x) => auts.some((b, y) => x !== y && a.niveau === b.niveau && a.raison === b.raison))) { noter('cartes identiques servies ensemble'); }
        if (m.cartes.some(c => c.auteur_compte !== c.auteur)) { noter('attribution croisée de cartes identiques'); }
        if (m.cotes_attendus) { noter('côté attendu du porteur ' + m.cotes_attendus.porteur); }
        if (m.cartes.length && m.possibles[m.places[m.places.length - 1]].raison === 'aucune' && m.raison_cachee !== m.places[m.places.length - 1]) { noter('carte cachée déplacée (« aucune »)'); }
      }
    });
  }
  console.log('Couverture des 200 parties au hasard :\n' + Object.keys(couverture).sort().map(c => '  ' + c + ' : ' + couverture[c]).join('\n'));
});

/* ------------------------------------------------------------------ */
/* Cas vérifiés à la main sur le candidat 59db7484…                    */
/* ------------------------------------------------------------------ */

test('Cas vérifiés à la main (candidat 59db7484…)', { skip: EMPREINTE !== CANDIDAT_VERIFIE ? 'fichier scellé différent : cas à revérifier à la main' : false }, () => {
  // 1. Manche du porteur, séance 5 (texte 4), joueur « z » de la note de vérification
  const z = {
    id: 'z', mode: 'moteur', empreinte: EMPREINTE, ouverture: k => J.instant(k, '09:00'),
    entree: () => ({ reponse: { niveau: 4, raison: 1 }, pari: 4 }), pseudo: 'T-z',
    deviner: (k, cartes) => cartes.map(c => ({ designe: c.auteur === 'Agathe' ? 'Agathe' : 'passe', raison: null })),
    repondre: k => ({ niveau: (k % 5) + 1, raison: (k % 4) + 1 }),
    fin: { f2: null, f1: J.f1Plein(null) }
  };
  const m5 = partie(z).tr.seances[5].manches.porteur;
  const p = m5.possibles;
  assert.deepEqual([p.Agathe.x, p.Agathe.c, p.Agathe.l, p.Agathe.q, p.Agathe.distance, p.Agathe.rarete, p.Agathe.surprise],
    ['3/4', '2/3', '81/100', '1/5', '1/12', '1/8', '7/60']);
  assert.equal(m5.mediane, '5/8');
  assert.deepEqual([p.Nassim.surprise, p.Odile.surprise, p.Valentin.surprise], ['11/30', '17/30', '1/8']);
  assert.deepEqual(m5.classement, ['Odile', 'Nassim', 'Valentin', 'Agathe']);
  assert.equal(m5.raison_cachee, 'Nassim', 'Valentin a « aucune » : la carte cachée passe à la moins bien classée avec une raison');
  // 2. Manche d'Odile, séance 11 (texte 10) : côtés attendus, affectation lexicographique, raison devinée
  const y = Object.assign({}, z, {
    deviner: (k, cartes) => cartes.map(c => ({ designe: c.auteur === 'porteur' ? 'passe' : c.auteur, raison: c.cachee ? 1 : null })),
    repondre: (k, t) => ({ niveau: 5, raison: t.considerations.findIndex(c => c.cote === 'pour' && c.pole === t.sens) + 1 || 1 })
  });
  const m11 = partie(y).tr.seances[11].manches.Odile;
  assert.deepEqual(m11.rangs, { porteur: 1, Valentin: 2, Nassim: 3, Agathe: 4 });
  assert.deepEqual(m11.cotes_attendus, { Agathe: -1, Nassim: -1, Valentin: 0, porteur: 0 });
  assert.deepEqual(m11.curseur_porteur, { somme_w: '3', c: '3/7' });
  assert.equal(m11.possibles.porteur.surprise, '17/56');
  assert.deepEqual(m11.cartes.map(c => [c.auteur, c.designe, c.raison_devinee]),
    [['Valentin', 'porteur', null], ['porteur', 'Valentin', null], ['Agathe', 'Nassim', 1]]);
  assert.equal(m11.total, 3);
});

test('Durées et corrigé de F1', () => {
  assert.equal(M.duree(42), '0 min 42 s');
  assert.equal(M.duree(7503), '125 min 03 s');
  assert.throws(() => M.duree(1.5));
  const c = M.corrigeF1(scelle);
  assert.equal(cles(c), 'Agathe,Nassim,Odile,Valentin');
  for (const p of PERSOS) {
    for (const t of TENSIONS) {
      const pos = scelle.personnages[p].profil[t].position;
      assert.equal(c[p][t], Math.abs(pos - 50) < 10 ? 'milieu' : (pos > 50 ? 'pole1' : 'pole0'));
    }
  }
  assert.equal(M.casesJustes(c, c), 16);
  assert.equal(M.casesJustes(J.f1Plein(null), c), 0);
});

/* ------------------------------------------------------------------ */
/* Gabarit du §8.12, lu dans simulation.md                             */
/* ------------------------------------------------------------------ */

const { gabaritCarnet } = require('../harnais/gabarit.js');

test('Carnet : chaque ligne suit une ligne du gabarit du §8.12 (lu dans simulation.md)', () => {
  const g = gabaritCarnet();
  assert.ok(g.length >= 30, 'gabarit lu : ' + g.length + ' lignes');
  const textes = [];
  for (const [, fab] of temoins) { const tr = partie(fab()).tr; textes.push(tr.carnet.texte); tr.copies.forEach(c => textes.push(c.texte)); }
  for (const [k, o] of [[0, { id: 'k' }], [5, { id: 'l', sansF1: true }], [8, { id: 'm' }]]) { textes.push(partie(T.temoinArret(EMPREINTE, k, o)).tr.carnet.texte); }
  for (const t of textes) {
    for (const ligne of t.split('\n')) {
      if (ligne === '') { continue; }
      assert.ok(g.some(x => x.re.test(ligne)), 'ligne hors gabarit : « ' + ligne + ' »');
    }
  }
});
