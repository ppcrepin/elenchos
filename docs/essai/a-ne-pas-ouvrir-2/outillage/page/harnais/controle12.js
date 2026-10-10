/* Contrôle 12 (§9 ; schema.md, partie 4.3) : export.
 *
 *   node harnais/controle12.js --scelle F --construction V1 [--construction-2 V2 --construction-3 V3]
 *        --journaux D/journaux --rejeu D (sorties du rejeu : D/page) --sortie D
 *        [--parties a,b,c,hasard-201,...] [--navigateur chromium]
 *
 * 1. Chaque carnet et chaque copie exportés (rejeu) ne contiennent que des
 *    lignes du gabarit du §8.12 ; le pseudo n'y figure jamais.
 * 2. Pour les parties données (les trois parties témoins et dix parties au
 *    hasard), quatre variantes jouées par l'interface, sur la version
 *    témoin, avec la même horloge, les mêmes gestes, les mêmes versions et
 *    les mêmes étapes, seules les réponses du joueur changeant :
 *      positions opposées ; toutes neutres ; mêmes positions avec d'autres
 *      raisons (dont « aucune ») ; un texte laissé sans réponse après
 *      l'affichage de Répondre (« Jour suivant », « Oui, continuer »).
 *    Blocs de séance et « Questions de fin » identiques octet pour octet
 *    (durées masquées), mesures identiques (valeur des durées masquée),
 *    copies identiques ; seuls « Titres de la semaine » et « Sur tout
 *    l'essai » peuvent différer.
 * 3. Arrêt au jour 8 : réponses à 4 des 6 textes révélés → « pas de
 *    chiffre » aux trois lignes ; à 5 des 6 → des chiffres.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const M = require('../moteur.js');
const O = require('./outils.js');
const G = require('./gabarit.js');
const RJ = require('./rejeu.js');

function copie(v) { return JSON.parse(JSON.stringify(v)); }

/** Applique f à chaque réponse du joueur (entrée et textes quotidiens), séances et copies. */
function changerReponses(journal, f) {
  const j = copie(journal);
  const appliquer = (coups, k) => {
    if (coups.entree) { for (const E of ['E1', 'E2', 'E3']) { if (coups.entree[E].reponse) { coups.entree[E].reponse = f(coups.entree[E].reponse, k, E); } } }
    if (coups.reponse) { coups.reponse = f(coups.reponse, k, null); }
  };
  j.seances.forEach(s => appliquer(s.coups, s.k));
  j.copies.forEach(c => appliquer(c.coups, c.k));
  return j;
}

/** Séance de la quatrième variante : réponse donnée, toutes les questions qui s'appliquent répondues. */
function seanceSansReponse(scelle, journal) {
  const R = M.calculer(scelle, journal);
  const ordre = [];
  for (let k = 3; k <= Math.min(14, journal.seances.length - 1); k++) { ordre.push(k); }
  ordre.push(1, 2);
  for (const k of ordre.filter(x => x <= journal.seances.length - 1)) {
    const s = journal.seances[k];
    if (!s.coups.reponse) { continue; }
    if (journal.copies.some(c => c.k === k)) { continue; }
    const faux = k >= 3 ? R.seances[k].mesures.revelation_verdicts.filter(v => v === 'faux').length : 0;
    const q = s.coups.carnet;
    if ((faux >= 1 && q.q1 === null) || q.q2 === null || (M.choixQ3(k, s.etapes).length && q.q3 === null)) { continue; }
    if (journal.arret && journal.arret.k === k) { continue; }
    return k;
  }
  return null;
}

function variantes(scelle, journal) {
  const v = [];
  v.push({ nom: 'positions opposées', journal: changerReponses(journal, r => ({ niveau: 6 - r.niveau, raison: r.raison })) });
  v.push({ nom: 'toutes neutres', journal: changerReponses(journal, r => ({ niveau: 3, raison: r.raison })) });
  v.push({ nom: 'autres raisons, dont « aucune »', journal: changerReponses(journal, (r, k, E) => ({ niveau: r.niveau,
    raison: r.raison === 'aucune' ? 1 + (k % 4) : ((k + (E ? +E.charAt(1) : 0)) % 3 === 0 ? 'aucune' : (r.raison % 4) + 1) })) });
  const k4 = seanceSansReponse(scelle, journal);
  if (k4 !== null) {
    const j = copie(journal);
    j.seances[k4].coups.reponse = null;
    j.seances[k4].attente = null;
    v.push({ nom: 'texte ' + k4 + ' laissé sans réponse', journal: j, k: k4 });
  }
  return v;
}

function comparerCarnets(base, autre) {
  const a = G.blocs(base), b = G.blocs(autre);
  const e = [];
  if (a.tete !== b.tete) { e.push('en-tête'); }
  if (a.seances.length !== b.seances.length) { e.push('nombre de blocs de séance'); }
  a.seances.forEach((x, i) => { if (x !== b.seances[i]) { e.push('bloc de séance ' + i + ' : ' + O.ecartsLignes(x, b.seances[i] || '').map(l => '« ' + l.a + ' » / « ' + l.b + ' »').join(' ; ')); } });
  if (a.questions !== b.questions) { e.push('Questions de fin'); }
  if (a.fin !== b.fin) { e.push('Fin du carnet'); }
  if (O.canonique(a.autres) !== O.canonique(b.autres)) { e.push('autres blocs'); }
  return e;
}

async function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const octets = new Uint8Array(fs.readFileSync(a.scelle));
  const scelle = JSON.parse(N.utf8Decoder(octets));
  const constructions = {};
  for (const c of ['construction', 'construction-2', 'construction-3']) { if (a[c]) { constructions[+O.lireTexte(path.join(a[c], 'version.txt')).trim()] = a[c]; } }
  const lignes = [];
  let faux = 0;
  const ok = (quoi, juste, detail) => { if (!juste) { faux++; } const l = (juste ? 'juste : ' : 'FAUX : ') + quoi + (detail && !juste ? ' — ' + detail : ''); lignes.push(l); process.stdout.write(l + '\n'); };
  // 1. gabarit et pseudo, sur tout ce que le rejeu a exporté
  const g = G.gabaritCarnet();
  const dPage = path.join(a.rejeu, 'page');
  for (const f of fs.readdirSync(dPage).filter(x => /\.(carnet|copie-[0-9]+)\.txt$/.test(x)).sort()) {
    const id = f.split('.')[0];
    const texte = O.lireTexte(path.join(dPage, f));
    const hors = G.lignesHorsGabarit(texte, g);
    const pseudo = O.lireJson(path.join(a.journaux, id + '.journal.json')).seances[0].coups.pseudo;
    ok('12 : ' + f + ' : lignes du gabarit du §8.12 seulement, sans le pseudo', hors.length === 0 && !(pseudo && texte.indexOf(pseudo) >= 0), hors.slice(0, 3).join(' | '));
  }
  // 3. arrêt au jour 8
  for (const [id, chiffres] of [['h', false], ['i', true]]) {
    const f = path.join(dPage, id + '.carnet.txt');
    if (!fs.existsSync(f)) { ok('12 : carnet de la partie ' + id + ' présent', false); continue; }
    const st = G.blocs(O.lireTexte(f)).surTout || '';
    const l = st.split('\n').slice(1);
    const pasDeChiffre = l.filter(x => /: pas de chiffre\.$/.test(x)).length;
    ok('12 : arrêt au jour 8, partie ' + id + ' : ' + (chiffres ? 'des chiffres' : '« pas de chiffre » aux trois lignes'),
      chiffres ? (l.length === 3 && /[0-9]+ fois sur [0-9]+\.$/.test(l[0]) && /[0-9]\.$/.test(l[2])) : pasDeChiffre === 3, st);
  }
  // 2. variantes
  const parties = (a.parties || 'a,b,c,hasard-201,hasard-202,hasard-203,hasard-204,hasard-205,hasard-206,hasard-207,hasard-208,hasard-209,hasard-210').split(',');
  for (const id of parties) {
    const journal = O.lireJson(path.join(a.journaux, id + '.journal.json'));
    const gestes = O.lireJson(path.join(a.journaux, id + '.gestes.json'));
    const fTrace = path.join(dPage, id + '.trace.json');
    if (!fs.existsSync(fTrace)) { ok('12 : partie ' + id + ' : trace de base présente (rejeu)', false); continue; }
    const base = O.lireJson(fTrace);
    for (const v of variantes(scelle, journal)) {
      const e = M.validerJournal(scelle, v.journal);
      if (e.length) { ok('12 : partie ' + id + ', variante « ' + v.nom + ' » : journal valide', false, e.slice(0, 3).join(' ; ')); continue; }
      let r;
      try {
        r = await RJ.jouerSur({ scelle, journal: v.journal, gestes, constructions, sorte: 'temoin', navigateur: a.navigateur || 'chromium', relever: false });
      } catch (x) { ok('12 : partie ' + id + ', variante « ' + v.nom + ' » jouée', false, x.message); continue; }
      const t = r.trace;
      const ec = base.carnet ? comparerCarnets(base.carnet.texte, t.carnet.texte) : [];
      const em = [];
      base.seances.forEach((s, k) => { if (O.canonique(O.masquerTrace(s.mesures)) !== O.canonique(O.masquerTrace(t.seances[k].mesures))) { em.push('mesures de la séance ' + k); } });
      base.copies.forEach((c, i) => {
        const x = t.copies[i];
        if (!x) { em.push('copie ' + (i + 1) + ' absente'); return; }
        const ecc = comparerCarnets(c.texte, x.texte);
        if (ecc.length) { em.push('copie ' + (i + 1) + ' : ' + ecc.join(' ; ')); }
        if (O.canonique(O.masquerTrace(c.mesures)) !== O.canonique(O.masquerTrace(x.mesures))) { em.push('mesures de la copie ' + (i + 1)); }
      });
      ok('12 : partie ' + id + ', variante « ' + v.nom + ' » : blocs de séance, questions de fin, mesures et copies identiques', ec.length === 0 && em.length === 0, ec.concat(em).slice(0, 4).join(' ; '));
      if (r.erreurs.length) { ok('12 : partie ' + id + ', variante « ' + v.nom + ' » : aucune erreur de la page', false, r.erreurs.join(' ; ')); }
    }
  }
  lignes.push(faux ? faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes.');
  O.ecrireTexte(path.join(a.sortie, 'rapport-controle12.txt'), lignes.join('\n') + '\n');
  process.exitCode = faux ? 1 : 0;
}

if (require.main === module) { main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; }); }

module.exports = { variantes, comparerCarnets, changerReponses };
