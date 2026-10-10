/* Parties au hasard (§9, contrôles 6 à 9 : « les 200 parties au hasard »), en mode moteur.
 *   node temoins/hasard.js FICHIER_SCELLE SORTIE [NOMBRE=200]
 * Graine des parties : les 16 premiers chiffres hexadécimaux de SHA-256(« elenchos-essai-2|hasard| » + SHA-256 du
 * fichier scellé) ; partie i (1 à NOMBRE) : SHA-256(graine + « | » + i), 16 chiffres (journal : partie.graine).
 * Chaque coup est tiré de SHA-256(graine de la partie + « | » + clé) : réponses, raisons, paris, compte, visages,
 * passes, raisons cachées, abandons, « Annuler » au saut, arrêts (un sur huit environ). Aucun hasard du système.
 * Écrit SORTIE/hasard-NNN/journal.json et trace-P.json, et SORTIE/graine.txt. */
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

const [, , fichier, sortie, nombreArg] = process.argv;
const NOMBRE = Number(nombreArg || 200);
const octets = new Uint8Array(fs.readFileSync(fichier));
const scelle = JSON.parse(N.utf8Decoder(octets));
const cal = C.lire(scelle);
const empreinte = N.sha256(octets);
const arrivee = M.histoire(scelle, cal);
const resumeSha = N.sha256(N.utf8Encoder(N.jsonCanonique(M.resume(arrivee))));
const cartes = M.cartesServies(scelle, cal, arrivee);
const sha = (s) => N.sha256(N.utf8Encoder(s));
const GRAINE = sha('elenchos-essai-2|hasard|' + empreinte).slice(0, 16);
const PERSOS = cal.membres.filter(m => m !== 'porteur');
const J_CODES = { moment: (cal, j) => Jn.choixMoment(cal, j, null) };
fs.mkdirSync(sortie, { recursive: true });
fs.writeFileSync(path.join(sortie, 'graine.txt'), 'Fichier scellé : SHA-256 ' + empreinte + '\nGraine des parties au hasard : ' + GRAINE + ' (SHA-256 de « elenchos-essai-2|hasard| » + empreinte, 16 premiers chiffres)\nNombre : ' + NOMBRE + '\n');

for (let i = 1; i <= NOMBRE; i++) {
  const id = 'hasard-' + String(i).padStart(3, '0');
  const g = sha(GRAINE + '|' + i).slice(0, 16);
  const tire = (cle, n) => parseInt(sha(g + '|' + cle).slice(0, 8), 16) % n;
  const tx = (t) => scelle.textes[t];
  const o = {
    cartes, gestes: tire('gestes', 4) !== 0, memeJour: tire('meme-jour', 3) === 0,
    pseudo: 'Témoin-hasard-' + i + '-k', compte: ['apple', 'google', 'email_valider', 'email_plus_tard'][tire('compte', 4)],
    paris: (t) => 1 + tire('pari|' + t, 5),
    reponse: (t) => { const n = tx(t).considerations.length; const r = tire('raison|' + t, n + 1); return { niveau: 1 + tire('niveau|' + t, 5), raison: r === n ? 'aucune' : r + 1 }; },
    visages: (j, n) => {
      const ordre = PERSOS.slice().sort((a, b) => tire('visage|' + j + '|' + a, 1e6) - tire('visage|' + j + '|' + b, 1e6));
      return ordre.slice(0, n).map((x, k) => (tire('passe|' + j + '|' + k, 5) === 0 ? 'passe' : x));
    },
    raison: (j) => (tire('cachee|' + j, 3) === 0 ? null : 1 + tire('raison-cachee|' + j, 4)),
    carnet: (j) => ({ moment: J_CODES.moment(cal, j)[tire('moment|' + j, J_CODES.moment(cal, j).length)], saut_clair: Jn.CODES.saut_clair[tire('saut-clair', 3)],
      hesite: [Jn.CODES.hesite[tire('hesite|' + j, Jn.CODES.hesite.length)]], moment_semaine: Jn.CODES.moment_semaine[tire('ms|' + j, Jn.CODES.moment_semaine.length)] }),
    fin: { f2: Jn.CODES.f2[tire('f2', 4)], servi: Jn.CODES.servi[tire('servi', 5)], regle: Jn.CODES.regle[tire('regle', 4)], avis: Jn.CODES.avis[tire('avis', 3)],
      raisons: Jn.CODES.raisons[tire('raisons', 3)], portrait: Jn.CODES.portrait[tire('portrait', 4)], barre: Jn.CODES.barre[tire('barre', 3)], suspense: Jn.CODES.suspense[tire('suspense', 3)] }
  };
  // Abandons : jamais pendant l'entrée ; aux jours joués, un sur six, sous l'une des trois formes.
  const abandons = {};
  cal.jours.filter(l => l.type === 'joue').forEach(l => { if (tire('abandon|' + l.jour, 6) === 0) { abandons[l.jour] = ['rien', 'faces', 'tout'][tire('forme|' + l.jour, 3)]; } });
  o.abandons = abandons;
  const annuler = {};
  cal.sauts.forEach(s => { annuler[s.point] = tire('annuler|' + s.numero, 4) === 0 ? 1 + tire('annuler-n|' + s.numero, 2) : 0; });
  o.annuler = annuler;
  if (tire('arret', 8) === 0) {
    const moments = [];
    cal.jours.forEach(l => {
      if (l.type === 'cloture') { return; }
      if (l.type !== 'saute') { moments.push({ jour: l.jour, moment: 'debut' }); }
      if (l.type === 'joue' && !abandons[l.jour]) { moments.push({ jour: l.jour, moment: 'apres-reponse' }); }
      if (l.type === 'saute') { moments.push({ jour: l.jour, moment: 'rattrapage' }); }
    });
    moments.push({ jour: cal.premier, moment: 'entree' });
    cal.sauts.forEach(s => moments.push({ jour: s.reprise, moment: 'avant-aller-au-dimanche' }));
    const a = moments[tire('arret-moment', moments.length)];
    o.arretA = Object.assign(a, { raison: tire('arret-raison', 6) === 0 ? null : Jn.CODES.arret[tire('arret-code', 5)], f2: a.jour >= Jn.JOUR_F2 && a.moment !== 'entree' ? Jn.CODES.f2[tire('arret-f2', 4)] : null });
  }
  const etat = PT.jouer(scelle, cal, o);
  const journal = E.journal(etat, cal, empreinte, { graine: g, id, mode: 'moteur' });
  Object.values(journal.jours).forEach(d => { d.versions = null; d.etapes = null; d.attente = null; });
  const ecarts = Jn.valider(scelle, cal, journal, { empreinte, cartes });
  if (ecarts.length) { throw new Error(id + ' : journal refusé\n' + ecarts.join('\n')); }
  const trace = TR.partie(journal, M.calculer(scelle, cal, arrivee, journal), null, null, [], empreinte, resumeSha);
  const d = path.join(sortie, id);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'journal.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(journal))));
  fs.writeFileSync(path.join(d, 'trace-P.json'), Buffer.from(N.utf8Encoder(N.jsonCanonique(trace))));
}
console.log(NOMBRE + ' parties au hasard écrites dans ' + sortie + ' (graine ' + GRAINE + ')');
