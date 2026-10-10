/* Couverture des témoins (lot 6) : ce que les traces P des témoins montrent, cas par cas,
 * contre la liste du §9 (« Parties témoins à ajouter »), du fichier caché (point 12) et
 * de la liste reprise du premier essai. Un cas absent est soit impossible avec ce fichier
 * (dit comme tel), soit un écran (version témoin dans le navigateur).
 *   node temoins/couverture.js FICHIER_SCELLE [DOSSIER]  -> DOSSIER/couverture.txt */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const P = path.join(__dirname, '..');
const N = require(P + '/noyau.js');
const C = require(P + '/calendrier.js');
const fichier = process.argv[2], dossier = process.argv[3] || __dirname;
const scelle = JSON.parse(fs.readFileSync(fichier, 'utf8'));
const cal = C.lire(scelle);
const ids = fs.readdirSync(dossier).filter(x => fs.existsSync(path.join(dossier, x, 'trace-P.json'))).sort();
const cas = {};
const vu = (nom, id) => { (cas[nom] = cas[nom] || new Set()).add(id); };
const identiques = (a, b) => a.niveau === b.niveau && a.raison === b.raison;
for (const id of ids) {
  const t = JSON.parse(fs.readFileSync(path.join(dossier, id, 'trace-P.json'), 'utf8'));
  const J = t.jours;
  if (t.arret) { vu('arrêt au jour ' + t.arret.jour + (cal.sautDuJour(t.arret.jour) || cal.sautQuiReprend(t.arret.jour) ? ' (saut)' : ''), id); }
  if (t.fin) { vu('partie menée à la clôture', id); }
  const temps = {};
  for (const k of Object.keys(J)) {
    const d = J[k], j = +k;
    if (d.coups.compte) { vu('compte ' + d.coups.compte, id); }
    if (d.entree) { vu('entrée ' + d.entree.justes + ' sur ' + cal.textesEntree.length, id); }
    if (d.coups.abandon) { vu('abandon au jour ' + j, id); }
    if (d.coups.annuler_saut) { vu('« Annuler » au saut', id); }
    if (d.message) { vu('message « ' + d.message.forme + ' »' + (d.message.titres ? ' + titres' : ''), id); }
    const b = d.portrait.barre;
    if (b.n === 0) { vu('barre à 0', id); }
    if (!b.pleine && b.n * 2 === scelle.reglage.barre) { vu('barre à mi-chemin', id); }
    if (b.n === scelle.reglage.barre) { vu('barre pleine exactement (' + b.n + ')', id); }
    if (b.n > scelle.reglage.barre) { vu('barre au-delà', id); }
    if (b.pleine && b.n < scelle.reglage.barre) { vu('barre pleine par le premier curseur net', id); }
    if (Object.values(d.portrait.tensions).some(x => x.net)) { vu('curseur net du porteur', id); }
    if (d.dimanche) {
      vu('phrase de la semaine « ' + d.dimanche.phrase_semaine.cas + ' »', id);
      if (d.dimanche.sans_faute.length) { vu('Le Sans-Faute obtenu (' + d.dimanche.sans_faute.join(', ') + ')', id); }
      ['devin', 'mystere', 'surprise'].forEach(x => { if (d.dimanche[x].departage !== 'aucun') { vu('départage ' + x + ' par ' + d.dimanche[x].departage, id); } });
      if (d.dimanche.fidele.titulaires.includes('porteur')) { vu('Le Fidèle du porteur, semaine ' + d.dimanche.semaine, id); }
      Object.entries(d.dimanche.temperaments).forEach(([p, x]) => { temps[p] = temps[p] || []; temps[p].push(x.temperaments.join('+')); });
    }
    const r = d.revelation;
    if (r) {
      if (r.pas_de_cote.length) { vu('Pas de Côté ' + r.pas_de_cote.map(m => m === 'porteur' ? 'du porteur' : 'd\'un personnage').join(', ') + ' (révélation ' + cal.ligne(j).revelation_porteur + ')', id); }
      if (r.avis_cercle) {
        const n = r.avis_cercle.comptes.reduce((a, x) => a + x, 0);
        vu('avis du cercle à ' + n + ' réponses', id);
        if (r.avis_cercle.milieu.length === 2) { vu('avis : deux mentions du milieu', id); }
        if (r.avis_cercle.milieu.length === 1 && r.avis_cercle.milieu[0] === 3) { vu('avis : milieu neutre', id); }
        vu('avis : ligne « ' + r.avis_cercle.ligne + ' »', id);
      }
      if (scelle.textes[r.texte] && scelle.textes[r.texte].vote.issue === 'rejete' && cal.ligne(j).revelation_porteur === 'lue') { vu('« Texte rejeté. » sur une révélation lue', id); }
      if (r.devineurs.porteur) { r.devineurs.porteur.verdicts.forEach(v => vu('verdict ' + v, id)); }
      Object.entries(r.devineurs).forEach(([g, x]) => { if (g !== 'porteur' && x.jumeaux.some(Boolean)) { vu('jumeau désigné par un personnage', id); } });
    }
    if (d.manches) {
      for (const [g, m] of Object.entries(d.manches)) {
        Object.values(m.possibles).forEach(x => vu(x.net ? 'R3 : surprise par la distance (curseur net de l’auteur)' : 'R3 : surprise par la rareté (curseur flou)', id));
        if (g === 'porteur') {
          vu('manche du porteur à ' + m.cartes.length + ' cartes', id);
          const pl = m.places.map(a => m.possibles[a]);
          if (pl.some((x, i) => pl.some((y, k) => k !== i && identiques(x, y)))) { vu('cartes identiques servies ensemble (porteur)', id); }
          if (m.remplacements.length) { vu('cartes identiques remplacées (porteur)', id); }
          const c = m.cartes.find(x => x.cachee);
          if (c && m.places[m.places.length - 1] !== c.auteur) { vu('carte à raison cachée déplacée (raison « aucune »)', id); }
          if (m.cartes.some(x => x.auteur !== x.auteur_compte)) { vu('auteurs redistribués (porteur)', id); }
        } else if (m.cotes_attendus && 'porteur' in m.cotes_attendus) {
          vu('côté attendu du porteur : ' + m.cotes_attendus.porteur, id);
          if (m.remplacements.length) { vu('cartes identiques remplacées (personnage)', id); }
        }
      }
    }
  }
  Object.entries(temps).forEach(([p, l]) => { if (new Set(l).size > 1) { vu('tempérament qui change entre les dimanches (' + p + ')', id); } });
}
const lignes = Object.keys(cas).sort().map(k => k + ' : ' + [...cas[k]].sort().join(' '));
fs.writeFileSync(path.join(dossier, 'couverture.txt'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
