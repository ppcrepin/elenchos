/* Écrit, dans tests/journaux/, les journaux de mes joueurs témoins (lot 3)
 * et leurs fichiers de durées, en forme canonique (schema.md, partie 3.12).
 *   node tests/ecrire-journaux.js [FICHIER_SCELLE]
 * Les journaux dépendent des cartes servies : à réécrire si le fichier
 * scellé change. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../../noyau.js');
const J = require('./joueurs.js');
const T = require('./temoins.js');
const M = require('./moteur-premier-essai.js');

const chemin = process.argv[2] || path.join(__dirname, '../../../../../a-ne-pas-ouvrir/fichier-scelle.json');
const octets = new Uint8Array(fs.readFileSync(chemin));
const empreinte = N.sha256(octets);
const scelle = JSON.parse(N.utf8Decoder(octets));
const dossier = path.join(__dirname, 'journaux');
fs.mkdirSync(dossier, { recursive: true });

const joueurs = {
  'temoin-A': T.temoinA(empreinte), 'temoin-B': T.temoinB(empreinte), 'temoin-C': T.temoinC(empreinte, scelle),
  'arret-entree': T.temoinArret(empreinte, 0, { id: 'e' }), 'arret-jour-2': T.temoinArret(empreinte, 2, { id: 'f', raison: null }),
  'arret-jour-5-sans-F1': T.temoinArret(empreinte, 5, { id: 'g', sansF1: true }),
  'arret-jour-8-4-sur-6': T.temoinArret(empreinte, 8, { id: 'i', sansReponse: [2, 5] }),
  'arret-jour-8-5-sur-6': T.temoinArret(empreinte, 8, { id: 'j', sansReponse: [2] })
};
for (const nom of Object.keys(joueurs)) {
  const journal = J.jouer(scelle, joueurs[nom]);
  const ecarts = M.validerJournal(scelle, journal);
  if (ecarts.length) { throw new Error(nom + ' : ' + ecarts.join(' ; ')); }
  fs.writeFileSync(path.join(dossier, nom + '.journal.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(journal))));
  fs.writeFileSync(path.join(dossier, nom + '.durees.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(J.dureesPour(journal)))));
  console.log(nom, journal.seances.length, 'séances');
}
fs.writeFileSync(path.join(dossier, 'FICHIER-SCELLE.txt'), 'Journaux écrits sur le fichier scellé de SHA-256 ' + empreinte + '\n');
