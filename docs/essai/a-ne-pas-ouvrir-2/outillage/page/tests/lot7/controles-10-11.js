/* Lot 7, part B : contrôles 10 (lignes rouges) et 11 (chaînes) sur les parties jouées par l'interface.
 *
 *   node tests/lot7/controles-10-11.js CONSTRUCTION TEMOINS_INTERFACE DOSSIER_RELEVES PHRASES_C.json SCELLE.json SORTIE
 *        [--date-publication '1er janvier 2026' --heure-publication '0h00']
 *
 * PHRASES_C.json : `python3 -I outillage/controle/controle.py phrases --scelle …` (phrases attendues, version 2).
 * Le dévoilement de chaque partie menée jusque-là est comparé, panneau par panneau et bloc par bloc, à
 * `controle.py devoilement --journal <journal de la partie>` (programme de contrôle, C).
 * Écrit SORTIE/rapport-controle10.txt, SORTIE/rapport-controle11.txt, SORTIE/chaines-affichees.txt.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const O = require('./outils.js');

const args = process.argv.slice(2);
const opt = (nom, d) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : d; };
const [dossierConstruction, dossierTemoins, dossierReleves, fPhrases, fScelle, sortie] = args;
const DATE_PUB = opt('--date-publication', '1er janvier 2026');
const HEURE_PUB = opt('--heure-publication', '0h00');
const CONTROLE = path.resolve(__dirname, '../../../controle/controle.py');

const c = O.lireConstruction(dossierConstruction);
const cal = c.cal, S = c.scelle;
const N_SCELLE = require('../../noyau.js').utf8Decoder(c.octets);
void S;
const PH = JSON.parse(fs.readFileSync(fPhrases, 'utf8'));
const nz = (x) => String(x || '').replace(/[  ]/g, ' ').replace(/’/g, "'").replace(/\s+/g, ' ').trim();
const MEMBRES = O.PERSONNAGES;

const parties = fs.readdirSync(dossierTemoins).filter((id) => fs.existsSync(path.join(dossierTemoins, id, 'journal.json'))).sort();
const r10 = [], r11 = [], sansReleve = [];
const ecart10 = (id, regle, detail) => r10.push('ÉCART ' + id + ' : ' + regle + (detail ? ' (' + detail + ')' : ''));
const ecart11 = (id, regle, detail) => r11.push('ÉCART ' + id + ' : ' + regle + (detail ? ' (' + detail + ')' : ''));
const compte10 = {}, compte11 = {};
const vu = (t, regle) => { t[regle] = (t[regle] || 0) + 1; };

/** Jour où le porteur voit la révélation du texte t (ligne du calendrier dont `revele` vaut t), ou null. */
const jourRevelation = {};
for (let d = cal.premier; d <= cal.dernier; d++) { const l = cal.ligne(d); if (l.revele !== null && l.revele !== undefined) { jourRevelation[l.revele] = d; } }
// Le texte du dernier jour n'est jamais deviné : sa fiche (5.4) se montre à la clôture (§8.5, point 2).
for (let d = cal.premier; d <= cal.dernier; d++) { const t = cal.texteRepondu(d); if (t !== null && jourRevelation[t] === undefined) { jourRevelation[t] = cal.dernier; } }
function texteAffiche(r) {
  const v = r.vueTel || {};
  if (r.cadre) { return null; }
  if (r.ecran === 'repondre' || r.ecran === 'raison') { return cal.ligne(r.k).repondu; }
  if (r.ecran === 'deviner') { return cal.texteDevine(r.k); }
  if (/^ratt-/.test(r.ecran || '') && v.jour) { return cal.ligne(v.jour).repondu; }
  if (r.ecran === 'fiche' && v.texte) { return v.texte; }
  if (/^1\.[2-6]$/.test(r.ecran || '') && v.E) { return v.E; }
  return null;
}
// Les textes du lot (titres, résumés, raisons) peuvent contenir « % » : ce n'est pas un taux affiché par la page.
const LOT_PCT = [];
(function voir(x) { if (typeof x === 'string') { if (x.includes('%')) { LOT_PCT.push(nz(x)); } } else if (Array.isArray(x)) { x.forEach(voir); } else if (x && typeof x === 'object') { Object.keys(x).forEach((k) => voir(x[k])); } })(c.scelle);
const sansLot = (T) => nz(T).split('\n').filter((l) => !(l.includes('%') && LOT_PCT.some((x) => l.split('%').slice(0, -1).every((av) => x.replace(/\s/g, '').includes(av.replace(/\s/g, '').slice(-12) + '%'))))).join('\n');
const tout = (r) => [r.tel, r.cadreTexte, r.bande, r.barre, r.seule].filter(Boolean).join('\n');

const blocsTous = new Map();
let nReleves = 0;

for (const id of parties) {
  const d = path.join(dossierTemoins, id);
  const j = JSON.parse(fs.readFileSync(path.join(d, 'journal.json'), 'utf8'));
  const carnet = fs.existsSync(path.join(d, 'carnet.txt')) ? fs.readFileSync(path.join(d, 'carnet.txt'), 'utf8') : '';
  const copies = JSON.parse(fs.readFileSync(path.join(d, 'copies.json'), 'utf8'));
  const plan = JSON.parse(fs.readFileSync(path.join(d, 'plan.json'), 'utf8'));
  const fr = path.join(dossierReleves, id + '.releve.json');
  if (!fs.existsSync(fr)) { sansReleve.push(id); continue; }
  const R = JSON.parse(fs.readFileSync(fr, 'utf8'));
  nReleves += R.length;
  JSON.parse(fs.readFileSync(path.join(dossierReleves, id + '.blocs.json'), 'utf8')).forEach(([b, cle]) => { if (!blocsTous.has(b)) { blocsTous.set(b, id + ' · ' + cle); } });
  const textesCarnet = [carnet].concat(copies.map((x) => x.texte || '')).join('\n');
  const pseudo = plan.pseudo || 'Zoé';

  /* ---------------- Contrôle 10 ---------------- */
  for (const r of R) {
    const T = tout(r);
    // L'avis du cercle : seulement sur l'écran du vote, après la révélation, sur le texte révélé.
    if (r.escaliers && r.escaliers.length) {
      vu(compte10, 'avis du cercle relevé');
      const t = cal.texteRevele(r.k);
      const vote = t && PH.textes[t] && PH.textes[t].vote['2.7d'];
      if (r.ecran !== 'revelation' || r.cadre) { ecart10(id, 'avis du cercle hors de l\'écran du vote', r.ecran + ' / ' + r.cadre + ' au geste ' + r.n); }
      else if (!vote || !vote.every((l) => nz(r.tel).includes(nz(l)))) { ecart10(id, 'avis du cercle sur un autre écran que le vote du texte révélé', 'jour ' + r.k + ', texte ' + t + ', geste ' + r.n); }
      if (cal.ligne(r.k).revelation_porteur === 'aucune' || cal.ligne(r.k).revelation_porteur === 'jamais_lue') { ecart10(id, 'avis du cercle un jour sans révélation lue', 'jour ' + r.k); }
      for (const e of r.escaliers) {
        const h = e.html + ' ' + (e.aria || '');
        if (h.includes(pseudo) || /\b(toi|Toi|ta réponse|Ta réponse)\b/.test(h) || /class="[^"]*\b(porteur|moi|toi)\b/.test(h)) { ecart10(id, 'réponse du porteur marquée dans l\'avis du cercle', 'geste ' + r.n); }
      }
    }
    // La barre du portrait : jamais dans Le Cercle ni sur l'écran d'un proche.
    if (r.barresPortrait && (r.ecran === 'cercle' || r.ecran === 'proche') && !r.cadre) { ecart10(id, 'barre du portrait dans Le Cercle ou sur l\'écran d\'un proche', r.ecran + ', geste ' + r.n); }
    if (r.ecran === 'cercle' || r.ecran === 'proche') { vu(compte10, 'écrans du Cercle et d\'un proche relevés'); }
    // Aucune révélation d'avant l'arrivée ; aucun identifiant de texte abstrait.
    if (r.ecran === 'revelation' && !r.cadre && cal.ligne(r.k).revelation_porteur !== 'lue' && !cal.estCloture(r.k)) { ecart10(id, 'révélation montrée un jour où elle n\'est pas lue', 'jour ' + r.k); }
    if (/\bH\d{1,2}\b/.test(T)) { ecart10(id, 'identifiant de texte abstrait à l\'écran', (/.{0,30}\bH\d{1,2}\b.{0,30}/.exec(T) || [''])[0]); }
    // Lignes rouges du premier essai : aucun taux, aucun classement, jamais « n'a pas joué ».
    if (/%/.test(sansLot(T))) { ecart10(id, 'pourcentage à l\'écran', (/.{0,40}%.{0,10}/.exec(T) || [''])[0]); }
    if (/n.a pas jou/i.test(T)) { ecart10(id, '« n\'a pas joué » à l\'écran', ''); }
    if (/classement/i.test(T)) { ecart10(id, 'classement à l\'écran', ''); }
    // La phrase du jumeau ne nomme que le proche désigné.
    const re = /C.était ([^.\n]+)\. ([^.\n]+) avait répondu la même chose\./g;
    let m;
    while ((m = re.exec(nz(r.tel || ''))) !== null) {
      vu(compte10, 'phrases du jumeau relevées');
      const y = m[1].trim(), x = m[2].trim();
      const nomsX = MEMBRES.filter((p) => x.includes(p));
      if (x === y || nomsX.length > 1 || (nomsX.length === 0 && !x.includes(pseudo))) { ecart10(id, 'phrase du jumeau', m[0]); }
    }
    // « Ta réponse » n'est jamais à côté d'une réponse d'un autre membre.
    if (/Ta réponse/.test(nz(r.tel || '')) && new RegExp('C.était (' + MEMBRES.join('|') + ')\\.').test(nz(r.tel || ''))) { ecart10(id, 'réponse du porteur à côté de celle d\'un autre', 'geste ' + r.n); }
  }
  // Ni l'avis du cercle, ni la barre, ni une position dans le carnet et les copies.
  if (/(Très favorable|Très défavorable|\bFavorable\b|\bDéfavorable\b|\bNeutre\b|Milieu des réponses)/.test(textesCarnet)) { ecart10(id, 'position ou avis du cercle dans le carnet', (/.{0,40}(Favorable|Défavorable|Neutre|Milieu).{0,20}/.exec(textesCarnet) || [''])[0]); }
  if (/barre[^\n]*\d+ sur \d+|\b\d+\/16\b/.test(textesCarnet)) { ecart10(id, 'longueur de la barre dans le carnet', ''); }
  if (/Pas de Côté/.test(textesCarnet)) { ecart10(id, 'Pas de Côté dans le carnet', ''); }
  if (textesCarnet.includes(pseudo) && pseudo.length > 2) { ecart10(id, 'pseudo dans le carnet', ''); }

  /* ---------------- Contrôle 11 ---------------- */
  // Coupures à 320 px (parties jouées sur l'iPhone SE).
  for (const r of R) {
    if (r.coupures) { vu(compte11, 'écrans relevés à 320 px'); }
    for (const v of r.coupures || []) { ecart11(id, v.motif, v.contexte); }
  }
  // Phrases du vote et de l'auteur, attendues par C, sur l'écran de leur texte ; « était l'argument de ».
  const parJour = {};
  R.forEach((r) => { if (r.ecran === 'revelation' && !r.cadre) { (parJour[r.k] = parJour[r.k] || []).push(r); } });
  Object.keys(parJour).forEach((k) => {
    const t = cal.texteRevele(+k), P = PH.textes[t];
    if (!P) { return; }
    const txt = parJour[k].map((r) => nz(r.tel)).join('\n');
    const lu = parJour[k].some((r) => nz(r.tel).includes(nz(P.vote['2.7d'][0])));
    if (lu) {
      vu(compte11, 'votes 2.7d comparés');
      P.vote['2.7d'].forEach((l) => { if (!txt.includes(nz(l))) { ecart11(id, 'ligne du vote (2.7d) absente ou différente', 'texte ' + t + ' : ' + l); } });
      if (P.auteur['2.7e'] && txt.includes('Proposé') && !txt.includes(nz(P.auteur['2.7e']))) { ecart11(id, 'auteur (2.7e) différent', 'texte ' + t + ' : ' + P.auteur['2.7e']); }
      if (P.auteur['2.7e'] && txt.includes(nz(P.auteur['2.7e']))) { vu(compte11, 'auteurs 2.7e comparés'); }
    }
    (txt.match(/était l'argument [^\n]*?\.(?=\s|$)/g) || []).forEach((s) => {
      vu(compte11, '« était l\'argument de » comparés');
      if (!P.arguments.map(nz).some((a) => s === a || s.endsWith(a))) { ecart11(id, '« était l\'argument de » différent', 'texte ' + t + ' : ' + s); }
    });
  });
  // 1.6 (entrée) et 5.4 (fiche révélée).
  for (const r of R) {
    const t = texteAffiche(r), P = t && PH.textes[t];
    if (!P) { continue; }
    if (r.ecran === '1.6') {
      vu(compte11, 'écrans 1.6 comparés');
      (P.vote['1.6'] || []).forEach((l) => { if (!nz(r.tel).includes(nz(l))) { ecart11(id, 'ligne du vote (1.6) absente', t + ' : ' + l); } });
      if (P.auteur['1.6'] && !nz(r.tel).includes(nz(P.auteur['1.6']))) { ecart11(id, 'auteur (1.6) absent', t + ' : ' + P.auteur['1.6']); }
    }
    if (r.ecran === 'fiche' && P.vote['5.4'] && jourRevelation[t] !== undefined && r.k >= jourRevelation[t] && nz(r.tel).includes(nz(P.vote['5.4'][0]))) {
      vu(compte11, 'fiches 5.4 comparées');
      P.vote['5.4'].forEach((l) => { if (!nz(r.tel).includes(nz(l))) { ecart11(id, 'ligne du vote (5.4) absente', t + ' : ' + l); } });
      if (P.auteur['5.4'] && !nz(r.tel).includes(nz(P.auteur['5.4']))) { ecart11(id, 'auteur (5.4) absent', t + ' : ' + P.auteur['5.4']); }
    }
    // Aucune chaîne interdite tant que le texte n'est pas révélé (Répondre, Deviner et « Relire », rattrapage, fiche d'avant la révélation, entrée avant 1.6).
    const avant = jourRevelation[t] === undefined ? (/^E/.test(t) ? r.ecran !== '1.6' : true) : r.k < jourRevelation[t];
    if (avant && r.ecran !== '1.6') {
      vu(compte11, 'écrans d\'avant la révélation contrôlés');
      (P.interdites_avant_revelation || []).forEach((l) => { if (nz(r.tel).includes(nz(l))) { ecart11(id, 'chaîne interdite avant la révélation', t + ' (' + r.ecran + ', jour ' + r.k + ') : ' + l); } });
    }
  }
  // Dévoilement : panneaux de la page contre ceux de C.
  const fdv = path.join(dossierReleves, id + '.devoilement.json');
  if (fs.existsSync(fdv)) {
    const P = JSON.parse(fs.readFileSync(fdv, 'utf8'));
    const out = execFileSync('python3', ['-I', CONTROLE, 'devoilement', '--scelle', fScelle, '--journal', path.join(d, 'journal.json'),
      '--date-publication', DATE_PUB, '--heure-publication', HEURE_PUB], { encoding: 'utf8', maxBuffer: 1 << 26 });
    const Cd = JSON.parse(out);
    vu(compte11, 'dévoilements comparés à C');
    if (Cd.panneaux.length !== P.length) { ecart11(id, 'dévoilement : nombre de panneaux', 'P ' + P.length + ', C ' + Cd.panneaux.length); }
    Cd.panneaux.forEach((pc, i) => {
      const pp = P[i];
      if (!pp) { return; }
      if ((pc.titre || null) !== (pp.titre || null)) { ecart11(id, 'dévoilement : titre du panneau ' + (i + 1), 'P « ' + pp.titre + ' », C « ' + pc.titre + ' »'); }
      const bp = pp.blocs.map((b) => b.texte);
      if (bp.length !== pc.blocs.length) { ecart11(id, 'dévoilement : nombre de blocs du panneau ' + (i + 1), 'P ' + bp.length + ', C ' + pc.blocs.length); }
      pc.blocs.forEach((bc, k) => {
        const b = bp[k];
        if (bc === '{fichier}') { if (b !== N_SCELLE) { ecart11(id, 'dévoilement : fichier scellé affiché différent', ''); } return; }
        if (/^[0-9a-f]{64}$/.test(bc)) {
          const ok = typeof b === 'string' && b.replace(/\s/g, '') === bc && /^([0-9a-f]{4} ){3}[0-9a-f]{4}(\n([0-9a-f]{4} ){3}[0-9a-f]{4}){3}$/.test(b);
          if (!ok) { ecart11(id, 'dévoilement : empreinte (quatre lignes de quatre groupes)', JSON.stringify(b)); }
          return;
        }
        if (b !== bc) { ecart11(id, 'dévoilement : panneau ' + (i + 1) + ', bloc ' + (k + 1), 'P « ' + String(b).slice(0, 200) + ' » / C « ' + String(bc).slice(0, 200) + ' »'); }
      });
    });
  }
}

// Chiffre suivi d'une espace U+0020, bloc par bloc (hors carnet, empreinte, graine, fichier scellé : les <pre>).
for (const [b, ou] of blocsTous) {
  const m = /.{0,30}[0-9] .{0,20}/.exec(b.replace(/\n/g, ' ⏎ '));
  if (m && !/[0-9] ⏎/.test(m[0])) { ecart11('blocs', 'chiffre suivi d\'une espace U+0020', ou + ' : « ' + m[0] + ' »'); }
}

// Annexe C : chaque chaîne citée (fragments hors {…} et « … ») est affichée ou, à défaut, écrite dans textes.js.
const spec = fs.readFileSync(path.resolve(__dirname, '../../../../../simulation-2.md'), 'utf8');
const annexe = spec.slice(spec.indexOf('## Annexe C'), spec.indexOf('## Les décisions dans la page'));
const X = require('../../textes.js');
const echantillons = [];
Object.keys(X).forEach((k) => {
  const v = X[k];
  if (typeof v === 'string') { echantillons.push(v); }
  else if (Array.isArray(v)) { echantillons.push(JSON.stringify(v)); }
  else if (typeof v === 'function') { [['{A}', '{B}', '{C}', '{D}'], ['{A}', true], ['{A}', false], [1], [2]].forEach((a) => { try { const x = v.apply(null, a); echantillons.push(typeof x === 'string' ? x : JSON.stringify(x)); } catch (e) { /* gabarit à d'autres arguments */ } }); }
  else if (v && typeof v === 'object') { echantillons.push(JSON.stringify(v)); }
});
const textesJs = nz([fs.readFileSync(path.resolve(__dirname, '../../textes.js'), 'utf8').replace(/\\'/g, "'"), fs.readFileSync(path.resolve(__dirname, '../../carnet.js'), 'utf8').replace(/\\'/g, "'")].concat(echantillons).join('\n'));
// Retirées par l'annexe elle-même (note de l'assembleur, « Retiré ») : attendues absentes de l'écran.
// Gabarits dont l'annexe ne cite qu'un exemple (« … ») : la forme écrite par la page.
const COMPOSITES = { 'Proposé par la commission …': 'Proposé par la {A}.' };
const RETIREES = ['Le repère montre où le cercle se coupe en deux.', ': un pseudo, ton e-mail.', 'Pas dans l\'essai.'];
const affiche = nz([...blocsTous.keys()].join('\n'));
const citees = [];
for (let i = 0; i < annexe.length; i++) {
  if (annexe[i] !== '«') { continue; }
  let prof = 0, k = i;
  for (; k < annexe.length; k++) { if (annexe[k] === '«') { prof++; } else if (annexe[k] === '»' && --prof === 0) { break; } }
  citees.push(annexe.slice(i + 1, k).trim()); i = k;
}
const bilanC = [];
for (const q of citees) {
  const frags = q.split(/\{[^}]*\}|…|«[^»]*»/).map((x) => nz(x).replace(/^[\s,.;:]+|[\s]+$/g, '')).filter((x) => x.length >= 6);
  if (!frags.length) { continue; }
  if (COMPOSITES[q]) { bilanC.push((textesJs.includes(nz(COMPOSITES[q])) ? 'gabarit écrit dans textes.js' : 'ABSENTE') + ' : « ' + q + ' » (gabarit « ' + COMPOSITES[q] + ' »)'); if (!textesJs.includes(nz(COMPOSITES[q]))) { ecart11('annexe C', 'gabarit absent', q); } continue; }
  if (RETIREES.some((x) => nz(q) === nz(x))) { bilanC.push('retirée par l\'annexe (non vérifiée) : « ' + q + ' »'); continue; }
  const etat = frags.every((f) => affiche.includes(f)) ? 'affichée' : (frags.every((f) => textesJs.includes(f)) ? 'écrite dans textes.js (non affichée dans ces parties)' : 'ABSENTE');
  bilanC.push(etat + ' : « ' + q + ' »');
  if (etat === 'ABSENTE') { ecart11('annexe C', 'chaîne de l\'annexe C ni affichée ni écrite', q); }
}

fs.mkdirSync(sortie, { recursive: true });
const entete = (n, t) => 'Contrôle ' + n + ', parties jouées par l\'interface (Chromium ; iPhone 15, iPhone SE 320 × 548, iPad ; clair et sombre)\n' +
  'Parties : ' + (parties.length - sansReleve.length) + ' ; écrans relevés : ' + nReleves + (sansReleve.length ? ' (sans relevé, partie à l\'horloge de l\'outil du contrôle 14 i : ' + sansReleve.join(', ') + ')' : '') + '\n' + Object.keys(t).map((k) => '  ' + k + ' : ' + t[k]).join('\n') + '\n\n';
fs.writeFileSync(path.join(sortie, 'rapport-controle10.txt'), entete(10, compte10) + (r10.length ? r10.join('\n') : 'Aucun écart.') + '\n');
fs.writeFileSync(path.join(sortie, 'rapport-controle11.txt'), entete(11, compte11) + 'Annexe C :\n' + bilanC.join('\n') + '\n\n' + (r11.length ? r11.join('\n') : 'Aucun écart.') + '\n');
fs.writeFileSync(path.join(sortie, 'chaines-affichees.txt'), [...blocsTous.entries()].map(([b, ou]) => ou + '\t' + b.replace(/\n/g, ' ⏎ ')).sort().join('\n') + '\n');
console.log('contrôle 10 : ' + (r10.length ? r10.length + ' écart(s)' : 'aucun écart') + ' ; contrôle 11 : ' + (r11.length ? r11.length + ' écart(s)' : 'aucun écart'));
