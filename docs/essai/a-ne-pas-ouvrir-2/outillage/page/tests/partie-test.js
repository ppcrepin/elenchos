/* Joueur scripté des tests du lot 1 (second essai) : joue une partie par les
 * seules transitions d'etat.js, comme le feront les écrans, avec un nombre de
 * cartes fixé à la main (le moteur des lots 2 et 3 le donnera). Il ne lit
 * jamais les réponses des personnages. Outillage d'essai. */
'use strict';
const N = require('../noyau.js');
const E = require('../etat.js');

/** Cartes servies au porteur sans moteur (lot 1) : trois, la troisième à raison cachée.
 *  Depuis le lot 3, options.cartes(j) donne les vraies (M.cartesServies). */
const CARTES = { n: 3, cachee: 2 };

/** Horloge et heure de Paris simulées : chaque appel avance d'une minute, à partir du lundi 19 octobre 2026, 8 h. */
function horloges() {
  let ms = Date.UTC(2026, 9, 19, 6, 0); // 8 h à Paris (heure d'été)
  let h = 0;
  return {
    instant: () => { ms += 60000; return N.paris(ms).instant; },
    pp: (pas) => { h += (pas === undefined ? 7000 : pas); return h; },
    sauter: (jours) => { ms += jours * 86400000; }
  };
}

function reponseType(scelle, texte, k) {
  const n = scelle.textes[texte].considerations.length;
  const r = k % (n + 1);
  return { niveau: 1 + (k % 5), raison: r === n ? 'aucune' : r + 1 };
}

/**
 * Joue une partie. options :
 *   abandons : {jour: 'rien' | 'faces' | 'tout'} — abandon ce jour-là, avec Deviner laissé vide, à moitié, ou plein non validé
 *   annuler  : {point: n} — « Annuler » n fois sur la page du saut avant de confirmer
 *   arretA   : {jour, moment: 'debut' | 'apres-reponse' | 'entree', raison, f2} — arrêt
 *   recharger(etat) : rend l'état relu (JSON) ; appelé à chaque jour et au milieu des rattrapages
 *   pasDeFin : laisse la partie en cours à la clôture
 *   cartes(j) : {n, cachee} cartes servies le jour j (lot 3 : M.cartesServies) ; CARTES par défaut
 *   visages(j, n) : les visages posés, carte par carte ; ['Valentin', 'passe', 'Odile'] par défaut
 *   raison(j) : la raison tentée sur la carte cachée ; 'aucune' par défaut (null : pas de tentative)
 *   reponse(texte, k) : la réponse du porteur ; reponseType par défaut
 *   paris(E, i) : le pari de l'entrée ; 1 + 2i mod 5 par défaut
 */
function jouer(scelle, cal, options) {
  const o = options || {};
  const hz = horloges();
  const recharger = o.recharger || (x => x);
  let etat = E.nouvelEtat(cal);
  const rep = o.reponse || ((t, k) => reponseType(scelle, t, k));
  const toucher = () => E.toucher(etat, cal, hz.pp(), 1, hz.instant);
  const arret = (j, moment) => o.arretA && o.arretA.jour === j && o.arretA.moment === moment;
  const arreter = () => { toucher(); E.arreter(etat, cal, o.arretA.raison || null, o.arretA.f2 || null); return etat; };

  for (let j = cal.premier; j <= cal.dernier; j++) {
    etat = recharger(etat);
    if (E.K(etat) !== j) { throw new Error('jour courant ' + E.K(etat) + ' au lieu de ' + j); }
    if (cal.estSaute(j)) { continue; } // atteint par le rattrapage
    toucher();
    if (cal.estCloture(j)) {
      if (o.pasDeFin) { return etat; }
      E.finir(etat, cal, { f2: 'toujours_autant', servi: 'revelations', regle: 'claire', avis: 'apprenait', raisons: 'un_peu', portrait: 'un_peu', barre: 'comprise', suspense: 'vrai' });
      return etat;
    }
    if (arret(j, 'debut')) { return arreter(); }
    if (cal.estArrivee(j)) {
      E.afficherEntree(etat, cal, hz.pp());
      E.consentir(etat, cal);
      if (arret(j, 'entree')) { return arreter(); }
      cal.textesEntree.forEach((t, i) => {
        E.repondreEntree(etat, cal, scelle, t, rep(t, i + 1));
        E.parierEntree(etat, cal, t, o.paris ? o.paris(t, i) : 1 + ((i * 2) % 5));
      });
      E.terminerCompte(etat, cal, o.pseudo || 'Témoin-l-lot-un', o.compte || 'email_valider', hz.pp());
    }
    if (cal.estJoue(j)) {
      if (cal.ligne(j).revelation_porteur === 'lue' && j % 2 === 0) { E.compter(etat, cal, 'rouvrir'); }
      E.compter(etat, cal, 'cercle');
      const ab = o.abandons && o.abandons[j];
      if (ab === 'rien') { E.allerAuJourSuivant(etat, cal, true); continue; }
      const cartes = o.cartes ? o.cartes(j) : CARTES;
      E.ouvrirDeviner(etat, cal, j, cartes.n, hz.pp());
      E.compter(etat, cal, 'proche', true);
      E.compter(etat, cal, 'relire');
      const visages = o.visages ? o.visages(j, cartes.n) : ['Valentin', 'passe', 'Odile'];
      const jusqua = ab === 'faces' ? 1 : cartes.n;
      for (let i = 0; i < jusqua; i++) { E.poserCarte(etat, j, i, visages[i], hz.pp()); }
      const raison = o.raison ? o.raison(j) : 'aucune';
      if (jusqua === cartes.n && raison !== null && ['Agathe', 'Nassim', 'Odile', 'Valentin'].includes(visages[cartes.cachee])) {
        E.poserRaison(etat, scelle, cal, j, cartes.cachee, raison, hz.pp());
      }
      if (ab) { E.allerAuJourSuivant(etat, cal, true); continue; }
      E.validerDeviner(etat, j, hz.pp());
      E.afficherRepondre(etat, cal, j, hz.pp());
      toucher();
      E.repondre(etat, scelle, cal, j, rep(cal.ligne(j).repondu, j), hz.pp());
      if (arret(j, 'apres-reponse')) { return arreter(); }
      E.repondreCarnet(etat, cal, j, 'moment', cal.estArrivee(j) ? 'defi' : 'deviner');
      if (cal.sauts.length && j === cal.sauts[0].reprise) { E.repondreCarnet(etat, cal, j, 'saut_clair', 'en_partie'); }
      if (cal.estDimanche(j)) {
        E.repondreCarnet(etat, cal, j, 'hesite', ['deviner', 'saut']);
        E.repondreCarnet(etat, cal, j, 'moment_semaine', 'portrait');
      }
      toucher();
      E.allerAuJourSuivant(etat, cal, false);
      hz.sauter(1);
      continue;
    }
    // Point de saut : la révélation se lit, puis la page du saut, « Annuler » éventuel, puis le rattrapage.
    const n = (o.annuler && o.annuler[j]) || 0;
    for (let i = 0; i < n; i++) { E.ouvrirPageSaut(etat, cal, hz.pp()); toucher(); E.annulerSaut(etat, cal); }
    E.compter(etat, cal, 'qui_est_qui'); // seule ouverture possible avant la confirmation (règle 9)
    E.ouvrirPageSaut(etat, cal, hz.pp());
    toucher();
    E.confirmerSaut(etat, cal, hz.instant(), hz.pp());
    E.compter(etat, cal, 'qui_est_qui');
    for (;;) {
      const r = E.rattrapage(etat, cal);
      if (r.termine) {
        if (arret(r.reprise, 'avant-aller-au-dimanche')) { return arreter(); }
        break;
      }
      if (r.rang === r.repondus) { E.afficherTexteRattrapage(etat, cal, hz.pp()); continue; }
      toucher();
      E.repondre(etat, scelle, cal, r.jour, rep(r.texte, r.jour + 1), hz.pp());
      if (arret(r.jour, 'rattrapage')) { return arreter(); }
      etat = recharger(etat);
    }
    toucher();
    E.finirSaut(etat, cal, hz.pp());
    hz.sauter(cal.saut(cal.sautDuJour(j).numero).jours.length);
    j = E.K(etat) - 1;
  }
  return etat;
}

module.exports = { jouer, CARTES, horloges, reponseType };
