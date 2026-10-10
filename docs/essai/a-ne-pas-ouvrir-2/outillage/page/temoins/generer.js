/* Joueurs témoins du second essai (lot 6 ; §9, « Parties témoins à ajouter » ;
 * fichier caché, point 12, et la liste qu'il reprend). Outillage d'essai.
 *
 *   node temoins/generer.js FICHIER_SCELLE [DOSSIER]   (DOSSIER : temoins/ par défaut)
 *
 * Chaque témoin est joué par les seules transitions d'etat.js (tests/partie-test.js),
 * comme le feraient les écrans, puis écrit en mode `moteur` (schéma, partie 4.3.1 :
 * versions, étapes, durées, carnet nuls) : DOSSIER/<id>/journal.json et trace-P.json
 * (trace de partie v4 de la page, ElenchosTrace.partie). Le programme de contrôle
 * rejoue chaque journal (temoins/comparer.sh). Les témoins qui demandent un écran
 * (mode interface : pseudo, rond, carnet, rechargement…) sont listés dans
 * temoins/LISTE.txt, pour la version témoin dans le navigateur.
 * Certains témoins lisent le fichier scellé (réponses des personnages) pour viser un
 * cas : c'est permis à un témoin, jamais à la page. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const P = path.join(__dirname, '..');
const N = require(P + '/noyau.js');
const C = require(P + '/calendrier.js');
const M = require(P + '/moteur.js');
const E = require(P + '/etat.js');
const Jn = require(P + '/journal.js');
const TR = require(P + '/trace.js');
const PT = require(P + '/tests/partie-test.js');

const fichier = process.argv[2];
const dossier = process.argv[3] || __dirname;
if (!fichier) { console.error('usage : node temoins/generer.js FICHIER_SCELLE [DOSSIER]'); process.exit(2); }
const octets = new Uint8Array(fs.readFileSync(fichier));
const scelle = JSON.parse(N.utf8Decoder(octets));
const cal = C.lire(scelle);
const empreinte = N.sha256(octets);
const arrivee = M.histoire(scelle, cal);
const resumeSha = N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee))));
const cartes = M.cartesServies(scelle, cal, arrivee);
const PERSOS = cal.membres.filter(m => m !== 'porteur');

/* ---------------- Stratégies ---------------- */

const tx = t => scelle.textes[t];
/** Réponse vers le pôle p, avec la raison attendue de son côté (arbitrage net). */
function attendue(t, p) {
  const x = tx(t), fav = x.sens === p;
  const r = x.considerations.find(c => c.pole === p && c.cote === (fav ? 'pour' : 'contre'));
  return { niveau: fav ? 5 : 1, raison: r.rang };
}
/** Réponse du côté qui sert p, avec l'inattendu croisé de ce côté (tiraillé, w = 0) ; s'il n'y en a pas, Neutre. */
function inattendue(t, p) {
  const x = tx(t), fav = x.sens === p;
  const r = x.considerations.find(c => c.cote === (fav ? 'pour' : 'contre') && c.pole === 1 - p);
  return r ? { niveau: fav ? 4 : 2, raison: r.rang } : { niveau: 3, raison: 'aucune' };
}
const neutre = () => ({ niveau: 3, raison: 'aucune' });
/** Les cartes servies au porteur le jour j (elles ne dépendent que du fichier). */
function cartesDuJour(etat, j) {
  return M.calculer(scelle, cal, arrivee, E.journal(etat, cal, empreinte)).jours[String(j)].cartes_porteur;
}
const rep = (m, t) => (scelle.reponses[t] && scelle.reponses[t][m]) || null;
const memes = (a, b) => a && b && a.niveau === b.niveau && a.raison === b.raison;
const tensionsVues = {};
function premiereFois(cle, t) { const k = cle + '|' + tx(t).tension; if (tensionsVues[k]) { return false; } tensionsVues[k] = true; return true; }
let compteurAlterne = {};

/* ---------------- Les témoins ---------------- */

const TEMOINS = [
  { id: 'a', but: 'premier essai (a) et « au centre » : toujours Neutre, raison « aucune » ; pari Neutre sur Valentin ; passe chaque carte et valide ; aucun curseur net, phrase de la semaine « floue », barre à 16 puis 17 sans curseur net',
    o: { reponse: neutre, paris: () => 3, visages: (j, n) => Array(n).fill('passe'), raison: () => null } },
  { id: 'b', but: 'premier essai (b) : réponses variées, toutes les raisons cachées tentées (justes ou non), « Reprendre » les jours pairs, Le Fidèle du porteur en semaine 14 (T1 à T6)',
    o: { raison: (j, e) => { const m = cartesDuJour(e, j); const c = m.cartes.find(x => x.cachee); const vraie = m.possibles[c.auteur].raison; return j % 2 ? (vraie === 'aucune' ? 1 : vraie) : 'aucune'; } } },
  { id: 'c', but: 'premier essai (c) : lit le fichier et attribue tout juste, raisons cachées comprises ; entrée 3 sur 3 face à Valentin ; compte Apple',
    o: { compte: 'apple', paris: (E1) => rep(cal.invitant, E1).niveau,
      visages: (j, n, e) => cartesDuJour(e, j).cartes.map(c => c.auteur),
      raison: (j, e) => { const m = cartesDuJour(e, j); const c = m.cartes.find(x => x.cachee); const r = m.possibles[c.auteur].raison; return r === 'aucune' ? null : r; } } },
  { id: 'd', but: '« tranché » : toujours l\'argument attendu, vers le même pôle sur chaque tension ; curseurs nets, phrase « nette » au second dimanche ; compte e-mail « Plus tard »',
    o: { compte: 'email_plus_tard', reponse: (t) => attendue(t, 1) } },
  { id: 'e', but: 'Pas de Côté du porteur sur T12 (S), révélé au vote le jour 14 ; barre pleine au premier curseur net, avant 16 réponses',
    o: { reponse: (t, k) => (tx(t).tension === 'S' ? attendue(t, t === '12' ? 0 : 1) : PT.reponseType(scelle, t, k)) } },
  { id: 'f', but: '« nuancé » (fichier caché, point 12) : l\'argument inattendu une fois par tension, l\'attendu ailleurs ; voir LISTE.txt pour ce que cela donne sur S',
    o: { reponse: (t) => (premiereFois('f', t) ? inattendue(t, 1) : attendue(t, 1)) } },
  { id: 'g', but: 'souvent l\'argument inattendu (une réponse sur deux par tension) : aucun curseur net, barre pleine à 16 sans curseur net',
    o: { reponse: (t) => { const k = 'g|' + tx(t).tension; compteurAlterne[k] = (compteurAlterne[k] || 0) + 1; return compteurAlterne[k] % 2 ? attendue(t, 1) : inattendue(t, 1); } } },
  { id: 'h', but: '« Abandonner cette journée » au jour 1 (après l\'entrée, avant Deviner), au jour 3 (un visage posé, puis le saut) et au jour 7 (Deviner plein non validé, dimanche) ; formes « question » et « vote » du message de 18h',
    o: { abandons: { 1: 'rien', 3: 'faces', 7: 'tout' } } },
  { id: 'i', but: '« Abandonner cette journée » aux jours 2 (Deviner plein non validé) et 14 (avant Deviner) : clôture au vote, sans cartes',
    o: { abandons: { 2: 'tout', 14: 'rien' } } },
  { id: 'j', but: '« Annuler » sur la page du saut (deux fois au premier, une au second), puis le saut',
    o: { annuler: { 4: 2, 8: 1 } } },
  { id: 'k', but: 'arrêt pendant le second saut (rattrapage), raison et F2 posées après la confirmation',
    o: { arretA: { jour: 10, moment: 'rattrapage', raison: 'pas_le_temps', f2: 'de_moins_en_moins' } } },
  { id: 'l', but: 'arrêt après la dernière réponse du premier rattrapage, avant « Aller au dimanche » : dimanche atteint sans ouverture (L1-4)',
    o: { arretA: { jour: 7, moment: 'avant-aller-au-dimanche', raison: 'vu_assez', f2: 'toujours_autant' } } },
  { id: 'm', but: 'arrêt pendant l\'entrée, avant toute réponse : barre à 0, compte nul',
    o: { arretA: { jour: 1, moment: 'entree', raison: null } } },
  { id: 'n', but: 'arrêt à l\'ouverture du jour 2 (avant le jour-seuil de F2)',
    o: { arretA: { jour: 2, moment: 'debut', raison: 'pas_compris' } } },
  { id: 'o', but: 'arrêt au jour 3, après la réponse, avec F2 (jour-seuil)',
    o: { arretA: { jour: 3, moment: 'apres-reponse', raison: 'autre', f2: 'jamais' } } },
  { id: 'p', but: 'entrée 0 sur 3 face à Valentin (paris du côté opposé) ; compte Google ; raison cachée jamais tentée',
    o: { compte: 'google', paris: (E1) => { const v = rep(cal.invitant, E1).niveau; return v >= 3 ? 1 : 5; }, raison: () => null } },
  { id: 'q', but: 'jumeaux : sur chaque carte, désigne un personnage non servi qui avait la même réponse s\'il y en a un ; sinon l\'auteur',
    o: { visages: (j, n, e) => {
      const m = cartesDuJour(e, j), servis = m.cartes.map(c => c.auteur), pris = [];
      return m.cartes.map(c => {
        const jumeau = PERSOS.find(p => !servis.includes(p) && !pris.includes(p) && memes(rep(p, m.texte), m.possibles[c.auteur]));
        const choix = jumeau || (pris.includes(c.auteur) ? 'passe' : c.auteur);
        if (choix !== 'passe') { pris.push(choix); }
        return choix;
      });
    } } }
];

/* ---------------- Génération ---------------- */

const lignes = [];
for (const t of TEMOINS) {
  compteurAlterne = {};
  Object.keys(tensionsVues).forEach(k => delete tensionsVues[k]);
  const etat = PT.jouer(scelle, cal, Object.assign({ cartes, pseudo: 'Témoin-' + t.id + '-deux-k' }, t.o));
  const journal = E.journal(etat, cal, empreinte, { graine: null, id: t.id, mode: 'moteur' });
  Object.values(journal.jours).forEach(d => { d.versions = null; d.etapes = null; d.attente = null; });
  const ecarts = Jn.valider(scelle, cal, journal, { empreinte, cartes });
  if (ecarts.length) { throw new Error('témoin ' + t.id + ' : journal refusé\n' + ecarts.join('\n')); }
  const trace = TR.partie(journal, M.calculer(scelle, cal, arrivee, journal), null, null, [], empreinte, resumeSha);
  const d = path.join(dossier, t.id);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'journal.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(journal))));
  const texte = N.jsonCanonique(trace);
  fs.writeFileSync(path.join(d, 'trace-P.json'), Buffer.from(N.utf8Encoder(texte)));
  lignes.push(t.id + ' : ' + t.but);
  console.log(t.id, 'jours ' + Object.keys(journal.jours).length, 'trace P SHA-256 ' + N.sha256(N.utf8Encoder(texte)).slice(0, 16));
}
fs.writeFileSync(path.join(dossier, 'temoins.txt'), 'Fichier scellé : SHA-256 ' + empreinte + '\n' + lignes.join('\n') + '\n');
