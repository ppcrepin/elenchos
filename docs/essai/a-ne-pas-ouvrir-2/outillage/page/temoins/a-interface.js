/* Partie témoin (a) en mode interface (lot 6) : les coups du tableau (A) des carnets de référence,
 * joués par les transitions d'etat.js, avec les durées, le carnet de la page (carnet.js) et une copie
 * du carnet au jour 7 (E.releverCopie, CR.texteCopie). Écrit DOSSIER/{journal.json, durees.json,
 * carnet-P.txt, copie-1-P.txt, trace-P.json}.
 *   node temoins/a-interface.js FICHIER_SCELLE DOSSIER [VARIANTE]
 * VARIANTE (contrôle 12 : mêmes gestes, seules les réponses du porteur changent, entrée et rattrapage compris) :
 *   neutre (par défaut, la partie (a)) ; favorable (Très favorable, première raison « pour ») ;
 *   defavorable (Très défavorable, première raison « contre ») ; raisons (Favorable, une autre raison à chaque texte). */
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
const CR = require(P + '/carnet.js');
const PT = require(P + '/tests/partie-test.js');
const OPTIONS_A = require('./options-a.js');

const [, , fichier, dossier, variante] = process.argv;
const octets = new Uint8Array(fs.readFileSync(fichier));
const scelle = JSON.parse(N.utf8Decoder(octets));
const cal = C.lire(scelle);
const empreinte = N.sha256(octets);
const arrivee = M.histoire(scelle, cal);
const resumeSha = N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee))));
const cartes = M.cartesServies(scelle, cal, arrivee);
const releves = [];
const JOUR_COPIE = cal.sauts[0].reprise; // le premier dimanche (tableau (A) : « Copier mon carnet » au jour 7)

const raisonDe = (t, cote, k) => { const l = scelle.textes[t].considerations.filter(c => !cote || c.cote === cote); return l[k % l.length].rang; };
const REPONSES = {
  favorable: (t) => ({ niveau: 5, raison: raisonDe(t, 'pour', 0) }),
  defavorable: (t) => ({ niveau: 1, raison: raisonDe(t, 'contre', 0) }),
  raisons: (t, k) => ({ niveau: 4, raison: raisonDe(t, 'pour', k + 1) })
};
const etat = PT.jouer(scelle, cal, Object.assign({}, OPTIONS_A, variante && variante !== 'neutre' ? { reponse: REPONSES[variante] } : {}, { cartes,
  copier: (j, e, h) => { if (j === JOUR_COPIE) { releves.push(E.releverCopie(e, cal, h)); } } }));
const MAINTENANT = 1e9; // horloge de premier plan au moment du relevé : toutes les durées sont closes
const journal = E.journal(etat, cal, empreinte, { graine: null, id: 'a', mode: 'interface' }, releves);
const durees = E.fichierDurees(etat, cal, MAINTENANT, 'a', releves);
const ecarts = Jn.valider(scelle, cal, journal, { empreinte, cartes });
if (ecarts.length) { console.error(ecarts.join('\n')); process.exit(1); }
const calculer = (j) => M.calculer(scelle, cal, arrivee, j);
const R = calculer(journal);
const carnet = CR.texte(scelle, cal, journal, R, durees, { type: 'fin' });
const copies = journal.copies.map((cp, i) => {
  const x = CR.texteCopie(scelle, cal, journal, durees, i, calculer);
  const m = TR.enTrace(x.mesures);
  const dc = durees.copies[i];
  ['duree_deviner', 'duree_entree', 'duree_repondre', 'duree_seance'].forEach(k => { m[k] = dc[k]; });
  // Partie 4.3.11 : `sauts` reprend l'état des sauts à l'instant de la copie (coups et textes atteints) ; leurs durées sont au fichier des durées.
  return { coups: cp.coups, etapes: cp.etapes, jour: cp.jour, mesures: m, sauts: cp.sauts, texte: x.texte, versions: cp.versions };
});
const trace = TR.partie(journal, R, durees, carnet, copies, empreinte, resumeSha);
fs.mkdirSync(dossier, { recursive: true });
const ecrire = (n, t) => fs.writeFileSync(path.join(dossier, n), Buffer.from(N.utf8Encoder(t)));
ecrire('journal.json', N.jsonCanonique(journal));
ecrire('durees.json', N.jsonCanonique(durees));
ecrire('carnet-P.txt', carnet);
copies.forEach((c, i) => ecrire('copie-' + (i + 1) + '-P.txt', c.texte));
ecrire('trace-P.json', N.jsonCanonique(trace));
console.log('témoin (a), mode interface : ' + Object.keys(journal.jours).length + ' jours, ' + copies.length + ' copie(s) ; trace P SHA-256 ' + N.sha256(N.utf8Encoder(N.jsonCanonique(trace))));
