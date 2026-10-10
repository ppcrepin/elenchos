/* Tests du moteur, lot 3 (moteur du porteur) du second essai : calculer(),
 * cartesServies() et la trace de partie v4, sur le fichier scellé de test
 * (inventé) et sur le candidat 1 du scellement (provisoire, histoire
 * concordante à trois). Cas construits à la main pour l'avis du cercle, la
 * phrase « nette », l'ordre de Moi ; parties jouées par les transitions
 * d'etat.js (tests/partie-test.js) pour le reste.
 * Variable ELENCHOS_CANDIDAT pour un autre fichier que le candidat 1. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const E = require('../etat.js');
const Jn = require('../journal.js');
const M = require('../moteur.js');
const TR = require('../trace.js');
const PT = require('./partie-test.js');
const { TX, fauxCtx, rep } = require('./contexte-main.js');

const F = N.Fraction;
const R_ = M.regles;
const fr = x => x.toString();
const FICHIERS = {
  test: process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json'),
  candidat: process.env.ELENCHOS_CANDIDAT || path.join(__dirname, '..', '..', 'scellement', 'candidat-1', 'fichier-scelle-candidat-1.json')
};

function charger(f) {
  const octets = new Uint8Array(fs.readFileSync(f));
  const scelle = JSON.parse(N.utf8Decoder(octets));
  const cal = C.lire(scelle);
  const arrivee = M.histoire(scelle, cal);
  geler(arrivee);
  return { octets, scelle, cal, arrivee, empreinte: N.sha256(octets), cartes: M.cartesServies(scelle, cal, arrivee) };
}
function geler(o) { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.keys(o).forEach(k => geler(o[k])); } return o; }
function jouer(x, options) {
  const etat = PT.jouer(x.scelle, x.cal, Object.assign({ cartes: x.cartes }, options || {}));
  return E.journal(etat, x.cal, x.empreinte);
}
function verifierJournal(x, j, enCours) {
  assert.deepEqual(Jn.valider(x.scelle, x.cal, j, { empreinte: x.empreinte, cartes: x.cartes, enCours: !!enCours }), []);
}
const cles = o => Object.keys(o).sort().join(',');

/* ------------------------------------------------------------------ */
/* Règles construites à la main                                        */
/* ------------------------------------------------------------------ */

test('Avis du cercle (§7.14, D-025) : milieu, ligne, seuil de trois réponses, jamais sur un texte abstrait', () => {
  const avis = (niveaux) => {
    const reponses = { 9: {} };
    ['Agathe', 'Nassim', 'Odile', 'Valentin', 'porteur'].forEach((m, i) => { if (i < niveaux.length) { reponses[9][m] = rep(niveaux[i], 1); } });
    const ctx = fauxCtx({ membres: { Agathe: -90, Nassim: -90, Odile: -90, Valentin: -90, porteur: 1 }, jours: { 9: '9' },
      textes: { 9: TX('S', true) }, textesJoues: { 9: {} }, reponses });
    const r = R_.avisCercle(ctx, '9');
    return r && [r.comptes.join(''), r.ligne, r.milieu.join(',')];
  };
  assert.deepEqual(avis([5, 1, 4, 4, 2]), ['11021', 'adopte', '4']);     // impair : rang 3 sur 5 = 4
  assert.deepEqual(avis([1, 2, 3, 3, 5]), ['11201', 'partage', '3']);    // impair, milieu neutre
  assert.deepEqual(avis([2, 3, 4, 5]), ['01111', 'partage', '3,4']);     // pair, deux mentions, côtés différents
  assert.deepEqual(avis([4, 5, 5, 4]), ['00022', 'adopte', '4,5']);      // pair, deux mentions du même côté
  assert.deepEqual(avis([1, 2, 2, 4]), ['12010', 'rejete', '2']);        // pair, une seule mention
  assert.deepEqual(avis([2, 2, 4, 5]), ['02011', 'partage', '2,4']);     // pair, côtés opposés
  assert.deepEqual(avis([3, 3, 3, 3]), ['00400', 'partage', '3']);       // unanimement neutre : « partagé »
  assert.equal(avis([1, 5]), null);                                      // sous trois réponses
  const ctxH = fauxCtx({ membres: { Agathe: -90 }, jours: { 1: 'H1' }, textes: { H1: TX('S') }, reponses: { H1: {} } });
  assert.equal(R_.avisCercle(ctxH, 'H1'), null);                         // texte abstrait : pas de vote
});

test('Ordre de Moi (§5.3 du second essai) : nets du plus éloigné de 1/2, puis Σ, puis S, P, T, L ; flous du plus étroit', () => {
  const c = (sw, swp) => R_.curseur({ sw: F(sw), swp: F(swp) });
  // S net c = 12/14 (écart 5/14) ; L net c = 2/16 (écart 3/8) ; P flou Σ = 6 ; T flou Σ = 9.
  assert.deepEqual(R_.ordreMoi({ S: c(10, 10), P: c(6, 3), T: c(9, 0), L: c(12, 0) }), ['L', 'S', 'T', 'P']);
  // Deux nets au même écart : le plus grand Σ d'abord ; deux flous de même largeur : S, P, T, L.
  assert.deepEqual(R_.ordreMoi({ S: c(10, 10), P: c(12, 12), T: c(0, 0), L: c(0, 0) }), ['P', 'S', 'T', 'L']);
});

test('Phrase de la semaine (§5.7 du second essai) : forme « nette » sur une tension devenue nette, sinon les formes du premier essai', () => {
  const s3 = (sw, swp) => ({ sw: F(sw), swp: F(swp) });
  function cas(lecture, reference, reponses) {
    const jours = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' };
    const textes = {}; Object.values(jours).forEach(t => { textes[t] = TX(['S', 'P', 'T', 'L', 'S', 'P'][+t - 1], true); });
    const ctx = fauxCtx({ membres: { porteur: 1 }, jours, textes, reponses: reponses || {}, semaine: { numero: 14, premier_jour: 1, dernier_jour: 7 },
      sommes: (m, d) => (d === 6 ? lecture : reference) });
    return R_.phraseSemaine(ctx, 14, 7, 0);
  }
  // S devient nette vers la liberté (c = 14/16), L reste floue.
  let p = cas({ S: s3(12, 12), L: s3(3, 0) }, { S: s3(9, 9) });
  assert.deepEqual([p.cas, p.tension, p.devenues, p.reference], ['nette', 'S', ['S'], []]);
  assert.equal(p.phrase, 'Entre sécurité et liberté, tu choisis le plus souvent la liberté.');
  // Déjà nette à la lecture précédente : elle n'est pas « devenue » ; sans réponse de la semaine : « floue ».
  p = cas({ S: s3(12, 12) }, { S: s3(10, 10) });
  assert.deepEqual([p.cas, p.devenues, p.reference], ['floue', [], ['S']]);
  // Nette au centre exact (c = 1/2) : n'entre pas.
  p = cas({ P: s3(12, 6) }, {}); // c = (2 + 6)/(4 + 12) = 1/2
  assert.deepEqual([p.cas, p.devenues], ['floue', []]);
  // Trois devenues : S (c = 14/16) et L (c = 2/16) à 3/8 de 1/2, T (c = 12/14) à 5/14 ; S et L à égalité de Σ (12) : S d'abord.
  p = cas({ S: s3(12, 12), L: s3(12, 0), T: s3(10, 10) }, {});
  assert.deepEqual([p.tension, p.devenues], ['S', ['S', 'T', 'L']]);
  assert.equal(p.phrase, 'Entre sécurité et liberté, tu choisis le plus souvent la liberté.');
  p = cas({ L: s3(12, 0) }, {});
  assert.equal(p.phrase, 'Entre local et national, tu choisis le plus souvent la décision locale.');
  // Sans tension devenue nette : les poids de la semaine, poids normaux (deux arbitrages sur S vers 1, un penchant sur P).
  p = cas({}, {}, { 1: { porteur: rep(5, 1) }, 5: { porteur: rep(4, 1) }, 2: { porteur: rep(4, 2) } });
  assert.deepEqual([p.cas, p.tension, fr(p.poids.S.pole1), p.poids.S.comptent], ['difference', 'S', '2', 2]);
});

/* ------------------------------------------------------------------ */
/* Parties jouées, sur les deux fichiers                               */
/* ------------------------------------------------------------------ */

for (const [nom, fichier] of Object.entries(FICHIERS)) {
  if (!fs.existsSync(fichier)) { continue; }
  const x = charger(fichier);
  const { scelle, cal, arrivee } = x;
  const PERSOS = cal.membres.filter(m => m !== 'porteur');

  test(nom + ' : partie complète, journal valide avec le nombre de cartes du moteur (règle 7), présence des champs (partie 4.3.2)', () => {
    const j = jouer(x);
    verifierJournal(x, j);
    const avant = JSON.stringify(j);
    const R = M.calculer(scelle, cal, arrivee, j);
    assert.equal(JSON.stringify(j), avant, 'journal intact');
    assert.deepEqual(Object.keys(R.jours).map(Number), cal.jours.map(l => l.jour));
    for (const l of cal.jours) {
      const d = l.jour, r = R.jours[String(d)], c = j.jours[String(d)].coups;
      assert.equal(cles(r), 'attente,cartes_porteur,cercle,compte_a_rebours,curseurs_vus,dimanche,entree,manches,message,mesures,phrase_jour,portrait,revelation,surprises_proches');
      assert.equal(r.manches === null, l.manche === null, 'manches ' + d);
      if (r.manches) {
        assert.equal('porteur' in r.manches, c.deviner !== null, 'manche du porteur ouverte ' + d);
        assert.deepEqual(Object.keys(r.manches).filter(g => g !== 'porteur').sort(), PERSOS.filter(p => !scelle.absences[p].includes(l.repondu)).sort());
      }
      assert.equal(r.revelation.texte, l.revele);
      assert.equal(r.message !== null, (cal.estJoue(d) && !cal.estArrivee(d)) || cal.estPointDeSaut(d), 'message ' + d);
      assert.equal(r.phrase_jour !== null, c.reponse !== null, 'phrase du jour ' + d);
      assert.equal(r.dimanche !== null, cal.estDimanche(d) && d <= cal.dernierJeu, 'dimanche ' + d);
      assert.equal(r.mesures !== null, cal.aUneOuverture(d), 'mesures ' + d);
      assert.equal(r.cartes_porteur !== null, l.deviner_porteur, 'cartes ' + d);
      if (l.deviner_porteur) {
        assert.deepEqual(x.cartes(d), { cachee: r.cartes_porteur.cartes.findIndex(cc => cc.cachee), n: r.cartes_porteur.cartes.length });
        if (c.deviner) { assert.equal(r.manches.porteur, r.cartes_porteur); }
      }
      assert.equal(r.entree !== null, cal.estArrivee(d));
      assert.equal(r.compte_a_rebours !== null, cal.estJoue(d));
    }
    assert.equal(R.titres.length, cal.semaines.length);
    assert.equal(R.sauts.length, cal.sauts.length);
    // Trace de partie v4 : schéma fermé, forme canonique.
    const tr = TR.partie(j, R, null, null, [], x.empreinte, N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee)))));
    assert.equal(cles(tr), 'agregats,arret,carnet,copies,empreinte_scelle,fin,format,jours,partie,resume_histoire,sauts,version');
    Object.values(tr.jours).forEach(d => assert.equal(cles(d), 'attente,cercle,coups,curseurs_vus,dimanche,entree,etapes,manches,message,mesures,ouverture,phrase_jour,portrait,revelation,surprises_proches,versions'));
    Object.values(tr.jours).forEach(d => { if (d.mesures) { assert.equal(cles(d.mesures), 'abandon,compte,duree_deviner,duree_entree,duree_repondre,duree_seance,entree_verdicts,jours_ecoules,ouvert,passer,pendant_deviner,relire,revelation_raison_tentee,revelation_rouverte,revelation_verdicts'); } });
    tr.sauts.forEach(s => assert.equal(cles(s), 'coups,depart,mesures,numero,textes_atteints'));
    assert.equal(N.jsonCanonique(tr), N.jsonCanonique(TR.partie(j, M.calculer(scelle, cal, arrivee, j), null, null, [], x.empreinte, tr.resume_histoire)));
  });

  test(nom + ' : jour d\'arrivée — révélation du dernier texte de l\'histoire, entrée avec l\'invitant, membres selon le jour', () => {
    const j = jouer(x, { paris: (E) => scelle.reponses[E][cal.invitant].niveau }); // paris tous du bon côté
    const R = M.calculer(scelle, cal, arrivee, j);
    const P = cal.premier, r1 = R.jours[String(P)];
    // La révélation du jour 1 : la manche de la veille, jouée à quatre (état à l'arrivée), sans avis du cercle.
    assert.equal(r1.revelation.texte, arrivee.manche_jour_0.texte);
    assert.equal(r1.revelation.avis_cercle, null);
    assert.deepEqual(Object.keys(r1.revelation.devineurs).sort(), Object.keys(arrivee.manche_jour_0.manches).sort());
    // Entrée : la réponse de l'invitant, paris du bon côté.
    assert.equal(r1.entree.justes, cal.textesEntree.length);
    cal.textesEntree.forEach(E => assert.deepEqual(r1.entree.textes[E].invitant, scelle.reponses[E][cal.invitant]));
    assert.deepEqual(r1.mesures.entree_verdicts, cal.textesEntree.map(() => 'juste'));
    assert.equal(r1.mesures.compte, 'email_valider');
    // Jour 1 : les personnages ne proposent pas le porteur ; le porteur a les réponses des personnages, trois cartes au plus.
    Object.entries(r1.manches).forEach(([g, m]) => {
      if (g !== 'porteur') { assert.ok(!m.candidats.includes('porteur')); assert.deepEqual(Object.values(m.rangs).sort(), [1, 2, 3]); }
    });
    assert.deepEqual(r1.manches.porteur.candidats, PERSOS);
    assert.ok(r1.manches.porteur.cartes.length <= 3 && r1.manches.porteur.cartes.length >= 2);
    // Jour 2 : le porteur est candidat ; rangs de 1 à 4.
    Object.entries(R.jours[String(P + 1)].manches).forEach(([g, m]) => {
      if (g !== 'porteur') { assert.ok(m.candidats.includes('porteur')); assert.deepEqual(Object.values(m.rangs).sort(), [1, 2, 3, 4]); }
    });
    // Semaine 14 : la révélation du jour 1 compte pour les points ; le texte abstrait ne peut pas être la surprise ;
    // le porteur est Fidèle (textes répondus depuis son arrivée).
    const w = R.titres.find(t => t.semaine === cal.semainesEssai[0]);
    const pts = PERSOS.map(p => (r1.revelation.devineurs[p] ? r1.revelation.devineurs[p].points : 0));
    PERSOS.forEach((p, i) => assert.ok(w.devin.points[p] >= pts[i]));
    assert.notEqual(w.surprise.texte, arrivee.manche_jour_0.texte);
    assert.ok(arrivee.manche_jour_0.texte in w.surprise.attributions);
    assert.ok(w.fidele.titulaires.includes('porteur'));
    // Le Cercle des jours 1 à 6 : la dernière semaine de l'histoire, les tempéraments du jour 0.
    const der = arrivee.titres[arrivee.titres.length - 1];
    assert.equal(r1.cercle.surprise, der.surprise.texte);
    PERSOS.forEach(p => assert.deepEqual(r1.cercle.temperaments[p], arrivee.temperaments[p].temperaments));
    assert.deepEqual(r1.cercle.titres.porteur, []);
  });

  test(nom + ' : curseurs vus (poids normaux, jusqu\'au jour j − 2) et portrait accéléré (facteur), recalculés sans l\'état à l\'arrivée', () => {
    const j = jouer(x);
    const R = M.calculer(scelle, cal, arrivee, j);
    // Contexte sans graine : tout refait depuis le premier jour de l'histoire.
    const reponseP = (t) => {
      if (cal.textesEntree.includes(t)) { return j.jours[String(cal.premier)].coups.entree[t].reponse; }
      if (scelle.histoire.textes[t]) { return null; }
      const d = cal.jourDeReponse(t); return j.jours[String(d)] ? j.jours[String(d)].coups.reponse : null;
    };
    const ctx = R_.contexte(scelle, cal, reponseP, null);
    const ctxSeme = R_.contexte(scelle, cal, reponseP, arrivee);
    for (const l of cal.jours) {
      const d = l.jour;
      PERSOS.forEach(p => M.TENSIONS.forEach(t => {
        const a = R_.curseur(ctx.sommesJusqua(p, d - 2)[t]), b = R.jours[String(d)].curseurs_vus[p][t];
        assert.ok(a.c.egal(b.c) && a.somme_w.egal(b.somme_w) && a.net === b.net, 'curseur vu ' + p + ' ' + t + ' ' + d);
      }));
      // Le portrait du porteur : Σ = facteur × Σ des poids normaux.
      M.TENSIONS.forEach(t => {
        let s = R_.sommesVides();
        cal.ordreTextes.forEach(n => {
          const r = reponseP(n); const tx = scelle.textes[n];
          if (r && tx && tx.tension === t && (cal.textesEntree.includes(n) || cal.jourDeReponse(n) <= d)) { s = R_.ajouter(s, R_.classer(tx, r), 1); }
        });
        assert.ok(R.jours[String(d)].portrait.tensions[t].somme_w.egal(s.sw.fois(scelle.reglage.facteur)), 'facteur ' + t + ' ' + d);
      });
    }
    // Côté attendu du porteur vu par un personnage (fichier caché, point 4) : ses seules cartes vues dans les manches
    // de ce personnage déjà révélées, même tension, poids normaux.
    let vus = 0;
    for (const l of cal.jours) {
      const ms = R.jours[String(l.jour)].manches;
      if (!ms) { continue; }
      Object.entries(ms).forEach(([g, m]) => {
        if (g === 'porteur' || !m.candidats.includes('porteur')) { return; }
        const tx = scelle.textes[m.texte];
        let s = R_.sommesVides();
        for (let d = cal.premier; d <= l.jour - 1; d++) {
          const mg = R.jours[String(d)] && R.jours[String(d)].manches && R.jours[String(d)].manches[g];
          if (mg && mg.places.includes('porteur') && scelle.textes[mg.texte].tension === tx.tension) { s = R_.ajouter(s, R_.classer(scelle.textes[mg.texte], reponseP(mg.texte)), 1); }
        }
        const cu = R_.curseur(s);
        assert.ok(cu.somme_w.egal(m.curseur_porteur.somme_w) && cu.c.egal(m.curseur_porteur.c), 'curseur du porteur vu par ' + g + ' le jour ' + l.jour);
        const al = tx.sens === 1 ? cu.c : F(1).moins(cu.c);
        assert.equal(m.cotes_attendus.porteur, cu.somme_w.estZero() ? 'inconnu' : R_.coteAttendu(al, scelle.reglage.seuils_stricts));
        if (!cu.somme_w.estZero()) { vus++; }
      });
    }
    assert.ok(vus > 0, 'au moins un côté attendu du porteur connu');
    // Graine de l'état à l'arrivée : avant elle, les sommes se retrouvent en retirant les réponses (Pas de Côté du jour 1).
    for (let d = cal.premier - 6; d <= cal.premier + 2; d++) {
      PERSOS.forEach(p => M.TENSIONS.forEach(t => {
        const a = ctx.sommesJusqua(p, d)[t], b = ctxSeme.sommesJusqua(p, d)[t];
        assert.ok(a.sw.egal(b.sw) && a.swp.egal(b.swp), 'graine ' + p + ' ' + t + ' ' + d);
      }));
    }
  });

  test(nom + ' : R10 et E1 — abandons, visages posés sans « Valider », manche jamais ouverte, formes du message et compte à rebours', () => {
    const P = cal.premier;
    // Jour 1 abandonné après l'entrée, avant Deviner ; jour 2 : un seul visage posé, puis abandon ; jour 3 : complet.
    const j = jouer(x, { abandons: { [P]: 'rien', [P + 1]: 'faces' } });
    verifierJournal(x, j);
    const R = M.calculer(scelle, cal, arrivee, j);
    const r = d => R.jours[String(d)];
    assert.ok(!('porteur' in r(P).manches));                       // jamais ouverte : pas de cartes
    assert.equal(r(P).compte_a_rebours, 'nouveau_texte');          // ni carte, ni texte répondu révélé demain
    assert.deepEqual(r(P + 1).message, { forme: 'question', titres: false }); // ni carte, ni réponse à T0
    assert.equal(r(P + 1).revelation.devineurs.porteur, undefined);
    assert.equal(r(P + 1).mesures.revelation_verdicts, null);
    // Jour 2 : la manche abandonnée compte telle quelle : un visage posé, les autres cartes vides comptent comme passées.
    const m2 = r(P + 1).manches.porteur;
    assert.ok(m2);
    const v3 = r(P + 2).revelation.devineurs.porteur.verdicts;
    assert.equal(v3.length, m2.cartes.length);
    assert.ok(v3.slice(1).every(v => v === 'passe'));
    assert.ok(['juste', 'jumeau', 'faux'].includes(v3[0]));
    assert.deepEqual(r(P + 2).message, { forme: 'cartes', titres: false });
    assert.deepEqual(r(P + 2).mesures.revelation_verdicts, v3);
    assert.equal(r(P + 2).mesures.revelation_raison_tentee, false);
    // Les jours sautés : jamais de manche du porteur ; le dimanche s'ouvre sur le vote (T5 répondu au rattrapage).
    cal.jours.filter(l => !l.deviner_porteur && l.manche !== null).forEach(l => assert.ok(!('porteur' in r(l.jour).manches)));
    const dim = cal.sauts[0].reprise;
    assert.equal(r(dim).message.forme, 'vote');
    assert.equal(r(dim).message.titres, [R.titres.find(t => t.semaine === cal.semaineDuJour(dim))].some(w => w.devin.titulaire || w.mystere.titulaire || w.fidele.titulaires.length || w.sans_faute.length));
    assert.equal(r(cal.sauts[0].point).message.forme, 'cartes');
  });

  test(nom + ' : barre du portrait (§5.8) — un cran par réponse validée, entrée comprise ; pleine à la longueur du fichier ou au premier curseur net', () => {
    const j = jouer(x);
    const R = M.calculer(scelle, cal, arrivee, j);
    let n = cal.textesEntree.length, pleine = false, prec = F(0);
    for (const l of cal.jours) {
      const r = R.jours[String(l.jour)];
      if (j.jours[String(l.jour)].coups.reponse) { n++; }
      pleine = pleine || n >= scelle.reglage.barre || M.TENSIONS.some(t => r.portrait.tensions[t].net);
      assert.equal(r.portrait.barre.n, n);
      assert.equal(r.portrait.barre.pleine, pleine);
      assert.ok(r.portrait.barre.longueur.egal(pleine ? F(1) : F(n, scelle.reglage.barre)));
      assert.ok(r.portrait.barre.longueur.supEgal(prec)); // ne recule jamais
      prec = r.portrait.barre.longueur;
    }
  });

  test(nom + ' : un porteur qui tranche sur S — curseur net, barre pleine par le curseur, phrase « nette », Pas de Côté à la révélation', () => {
    // Les textes S du porteur : l'entrée et les textes du calendrier sur S, dans l'ordre.
    const textesS = cal.ordreTextes.filter(t => scelle.textes[t] && scelle.textes[t].tension === 'S');
    const repondusS = textesS.filter(t => cal.textesEntree.includes(t) || cal.jourDeReponse(t) >= cal.premier);
    const dernier = repondusS[repondusS.length - 1]; // le dernier texte S répondu : à contre-courant
    function arbitrage(t, pole) {
      const tx = scelle.textes[t];
      const fav = tx.sens === pole;
      const r = tx.considerations.find(cc => cc.pole === pole && cc.cote === (fav ? 'pour' : 'contre'));
      return { niveau: fav ? 5 : 1, raison: r.rang };
    }
    const reponse = (t, k) => (scelle.textes[t].tension === 'S' ? arbitrage(t, t === dernier ? 0 : 1) : PT.reponseType(scelle, t, k));
    const j = jouer(x, { reponse });
    verifierJournal(x, j);
    const R = M.calculer(scelle, cal, arrivee, j);
    const jourDernier = cal.jourDeReponse(dernier);
    // Avant le dernier texte S : Σ = facteur × (nombre de réponses S) ; net dès que Σ ≥ 10.
    const avant = R.jours[String(jourDernier - 1)].portrait.tensions.S;
    const nb = repondusS.length - 1;
    assert.ok(avant.somme_w.egal(F(nb * scelle.reglage.facteur)));
    const net = nb * scelle.reglage.facteur >= 10;
    assert.equal(avant.net, net);
    // Pas de Côté du porteur à la révélation du dernier texte S, si le curseur d'avant est net et penche (c ≥ 7/10).
    const rv = R.jours[String(jourDernier + 2)];
    if (rv) {
      const penche = avant.c.moins(F(1, 2)).abs().supEgal(F(1, 5));
      assert.equal(rv.revelation.pas_de_cote.includes('porteur'), net && penche);
    }
    // Dans l'ordre retenu (fichier caché, point 14 ; les deux fichiers le suivent) : le curseur S est net après T9,
    // et le Pas de Côté du porteur tombe à la révélation de T12, au second dimanche.
    assert.ok(net && rv && rv.revelation.pas_de_cote.includes('porteur'));
    const dDernierDim = cal.semaine(cal.semainesEssai[cal.semainesEssai.length - 1]).dernier_jour;
    assert.equal(R.jours[String(dDernierDim)].dimanche.phrase_semaine.cas, 'nette');
    // Barre pleine dès le premier jour où S est net, même avant le nombre de réponses du fichier.
    const premierNet = cal.jours.find(l => R.jours[String(l.jour)].portrait.tensions.S.net);
    assert.ok(premierNet);
    assert.equal(R.jours[String(premierNet.jour)].portrait.barre.pleine, true);
    assert.ok(R.jours[String(premierNet.jour)].portrait.barre.n < scelle.reglage.barre);
    // Phrase « nette » au premier dimanche où S est nette à la lecture (veille du dimanche) et ne l'était pas avant.
    const dims = cal.semainesEssai.map(n => cal.semaine(n).dernier_jour);
    dims.forEach((d, i) => {
      const ps = R.jours[String(d)].dimanche.phrase_semaine;
      if (ps.lecture.S.net && !ps.reference.includes('S')) {
        assert.equal(ps.cas, 'nette');
        assert.equal(ps.tension, 'S');
        assert.equal(ps.phrase, N.typographier('Entre sécurité et liberté, tu choisis le plus souvent la liberté.'));
      }
      if (i === 0) { assert.equal(ps.cas === 'nette', false, 'impossible au premier dimanche avec cet ordre des textes (§5.7)'); }
    });
  });

  test(nom + ' : arrêts (pendant un rattrapage, avant « Aller au dimanche ») et partie en cours : calcul jusqu\'au jour atteint', () => {
    const s1 = cal.sauts[0];
    const a1 = jouer(x, { arretA: { jour: s1.sautes[0], moment: 'rattrapage', raison: 'vu_assez' } });
    verifierJournal(x, a1);
    let R = M.calculer(scelle, cal, arrivee, a1);
    assert.equal(R.K, s1.sautes[0] + 1);
    assert.equal(R.sauts.length, 1);
    const a2 = jouer(x, { arretA: { jour: s1.reprise, moment: 'avant-aller-au-dimanche' } });
    verifierJournal(x, a2);
    R = M.calculer(scelle, cal, arrivee, a2);
    assert.equal(R.K, s1.reprise);
    assert.equal(R.jours[String(s1.reprise)].mesures.jours_ecoules, null); // jour de reprise sans ouverture (L1-4)
    assert.ok(R.jours[String(s1.reprise)].dimanche); // le dimanche est atteint : ses titres tombent
    const enCours = jouer(x, { pasDeFin: true });
    R = M.calculer(scelle, cal, arrivee, enCours);
    assert.equal(R.K, cal.dernier);
  });

  test(nom + ' : règle 7 du journal branchée sur le moteur — nombre de cartes et place de la raison cachée', () => {
    const j = jouer(x);
    const P = cal.premier;
    const k = cal.jours.find(l => l.deviner_porteur && l.jour > P).jour;
    const n = x.cartes(k).n;
    const faux = JSON.parse(JSON.stringify(j));
    faux.jours[String(k)].coups.deviner.cartes.push({ designe: null, raison: null });
    assert.ok(Jn.valider(scelle, cal, faux, { cartes: x.cartes }).some(e => e.startsWith('règle 7') && e.includes(n + ' carte(s) attendue(s)')));
    assert.throws(() => M.calculer(scelle, cal, arrivee, faux), /carte/);
    const faux2 = JSON.parse(JSON.stringify(j));
    const cs = faux2.jours[String(k)].coups.deviner.cartes;
    const autre = (x.cartes(k).cachee + 1) % n;
    cs[autre] = { designe: 'Agathe', raison: 1 };
    assert.ok(Jn.valider(scelle, cal, faux2, { cartes: x.cartes }).some(e => e.includes('raison hors de la carte à raison cachée')));
    // Les cartes du porteur ne dépendent que du fichier : un autre joueur reçoit les mêmes.
    const j2 = jouer(x, { reponse: (t) => ({ niveau: 3, raison: 'aucune' }) });
    const R1 = M.calculer(scelle, cal, arrivee, j), R2 = M.calculer(scelle, cal, arrivee, j2);
    cal.jours.filter(l => l.deviner_porteur).forEach(l => {
      assert.deepEqual(R1.jours[String(l.jour)].cartes_porteur.cartes.map(c => [c.auteur, c.cachee]), R2.jours[String(l.jour)].cartes_porteur.cartes.map(c => [c.auteur, c.cachee]));
    });
  });

  test(nom + ' : « Sur tout l\'essai » (agrégats, §8.4) — seuil de cinq textes répondus parmi les révélés ; jumeau compté juste', () => {
    const R = M.calculer(scelle, cal, arrivee, jouer(x));
    assert.ok(R.agregats.justesse_personnages_entre_eux.total > 0);
    assert.ok(R.agregats.justesse_personnages_sur_porteur.total > 0);
    assert.ok(R.agregats.titres_tires_au_sort >= 0);
    // Arrêt tôt : sous le seuil, aucun chiffre.
    const tot = jouer(x, { arretA: { jour: cal.premier + 2, moment: 'debut' } });
    assert.deepEqual(M.calculer(scelle, cal, arrivee, tot).agregats, { justesse_personnages_entre_eux: null, justesse_personnages_sur_porteur: null, titres_tires_au_sort: null });
  });
}

test('Performance (Node, sans ralenti) : calculer() sur la partie complète, budget de 100 ms par geste du §8.8', () => {
  const x = charger(FICHIERS.test);
  const j = jouer(x);
  const t = [];
  for (let i = 0; i < 5; i++) { const t0 = process.hrtime.bigint(); M.calculer(x.scelle, x.cal, x.arrivee, j); t.push(Number(process.hrtime.bigint() - t0) / 1e6); }
  t.sort((a, b) => a - b);
  // La mesure qui compte : Chromium ralenti quatre fois (tests/mesure-histoire.js, mode geste), puis contrôle 14 j.
  assert.ok(t[2] < 100, 'médiane ' + t[2] + ' ms');
});

test('Aucun nombre du calendrier écrit en dur dans le moteur ni dans la trace (schéma, partie 7.1)', () => {
  for (const f of ['moteur.js', 'trace.js']) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const trouves = code.match(/(^|[^0-9A-Za-z_.\/])-?(7|13|14|15|16|90|91)(?![0-9])/g);
    assert.equal(trouves, null, f + ' : ' + trouves);
  }
});
