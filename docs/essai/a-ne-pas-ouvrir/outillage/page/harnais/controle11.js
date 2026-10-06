/* Contrôle 11 (§9 ; schema.md, partie 4.5) : textes affichés, sur les relevés.
 *
 *   node harnais/controle11.js --scelle F --journaux D/journaux --rejeu D
 *        --construction V1 [--construction-2 V2 --construction-3 V3] --sortie D
 *        [--phrases PHRASES_ATTENDUES.json] [--parties a,b,...] [--navigateur chromium]
 *
 * - Rejoue les parties témoins sur la version du porteur à 320 × 548 px et
 *   relève les coupures automatiques de ligne : aucune juste avant « ? »,
 *   « ! », « : », « ; », « » », « · » ou « % », ni juste après un chiffre
 *   ou le trait d'union d'un sigle de groupe. Hors zone du carnet,
 *   empreinte, graine et fichier scellé.
 * - Sur les relevés du rejeu (D/releves) : aucun chiffre suivi d'une espace
 *   U+0020, bloc par bloc (mêmes exclusions).
 * - Avec le fichier des phrases attendues écrit par le programme de
 *   contrôle (partie 4.5) : chaque chaîne de vote et d'auteur de l'écran
 *   est un bloc du relevé ; chaque « Ta raison, … » finit par la chaîne
 *   d'arguments du rang de cette raison ; aucune chaîne interdite avant la
 *   révélation du texte. Sans ce fichier : les mêmes vérifications sur les
 *   noms (auteur, députés) lus dans le fichier scellé, en attendant.
 * - Écrit la liste des chaînes affichées distinctes, écran par écran, pour
 *   la comparaison aux maquettes, à l'annexe C et aux textes du cadre
 *   (relue par UX).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');
const O = require('./outils.js');
const RJ = require('./rejeu.js');

const AVANT_INTERDIT = new Set(['?', '!', ':', ';', '»', '·', '%']);

function lireReleves(dossier, id, sorte) {
  const f = path.join(dossier, id + '.' + sorte + '.json');
  return fs.existsSync(f) ? O.lireJson(f) : null;
}

/** Coupures fautives d'un relevé (règles du contrôle 11). */
function coupuresFautives(releves, sigles) {
  const e = [];
  for (const r of releves) {
    for (const c of r.coupures) {
      if (c.zone === 'exclue') { continue; }
      let raison = null;
      if (AVANT_INTERDIT.has(c.apres)) { raison = 'coupure juste avant « ' + c.apres + ' »'; }
      else if (/[0-9]/.test(c.avant) && !c.blanc) { raison = 'coupure juste après un chiffre (sans blanc)'; }
      else if (/[0-9]/.test(c.avant)) { raison = 'coupure juste après un chiffre'; }
      else if (c.avant === '-' && sigles.some(s => s.indexOf('-') >= 0 && c.bloc.indexOf(s) >= 0)) { raison = 'coupure après le trait d’union d’un sigle'; }
      if (raison) { e.push({ seance: r.seance, geste: r.geste, raison, bloc: c.bloc }); }
    }
  }
  return e;
}

/** Chiffre suivi d'une espace U+0020, bloc par bloc. */
function chiffresEspace(releves) {
  const e = [];
  for (const r of releves) {
    for (const b of r.blocs) {
      if (b.zone === 'exclue') { continue; }
      const m = b.texte.match(/[0-9] /);
      if (m) { e.push({ seance: r.seance, geste: r.geste, bloc: b.texte.slice(Math.max(0, m.index - 30), m.index + 30) }); }
    }
  }
  return e;
}

/** Contrôle 10, la part qui se lit dans le relevé : jamais « n'a pas joué », aucun taux d'accord, aucun classement. */
function lignesRouges(releves) {
  const e = [];
  const motifs = [[/n[’']a pas joué|n[’']ont pas joué/i, '« n’a pas joué »'], [/taux|pourcentage|% d[’']accord/i, 'taux d’accord'], [/classement|\bclassé|\b[0-9]+e sur\b/i, 'classement']];
  for (const r of releves) {
    for (const b of r.blocs) {
      if (b.zone === 'exclue') { continue; }
      for (const [m, quoi] of motifs) { if (m.test(b.texte)) { e.push({ seance: r.seance, geste: r.geste, quoi, bloc: b.texte.slice(0, 80) }); } }
    }
  }
  return e;
}

/** Texte révélé à l'écran du relevé ? n : numéro du texte quotidien ; vue : celle du relevé. */
function estRevele(n, k) { return +n <= 13 && +n + 2 <= k; }

function verifierPhrases(releves, journal, scelle, phrases, compte) {
  const e = [];
  compte = compte || {};
  const compter = (x) => { compte[x] = (compte[x] || 0) + 1; };
  const reponse = (n) => { const s = journal.seances[+n]; return s ? s.coups.reponse : null; };
  for (const r of releves) {
    const v = r.vue;
    if (!v) { continue; }
    const blocs = r.blocs.map(b => b.texte);
    let id = null, ecran = null;
    if (v.tel === '1.6' && !v.cadre) { id = v.E; ecran = '1.6'; }
    else if (v.tel === 'revelation' && !v.cadre) {
      id = String(v.k - 2);
      if (blocs.some(b => b === N.typographier("Et l'Assemblée ?"))) { ecran = '2.7d'; }
      else if (blocs.some(b => /^Proposé par /.test(b))) { ecran = '2.7e'; }
    } else if (v.tel === 'fiche' && !v.cadre) { id = v.texte; ecran = (v.texte14 || estRevele(v.texte, v.k)) ? '5.4' : '5.4-avant'; }
    else if (v.tel === 'deviner' && !v.cadre) { id = String(v.k - 1); ecran = '2.1'; }
    if (!id || !ecran) { continue; }
    const p = phrases.textes[id];
    if (!p) { continue; }
    compter(ecran);
    if (ecran === '2.1' || ecran === '5.4-avant') {
      for (const x of p.interdites_avant_revelation) {
        if (blocs.some(b => b.indexOf(x) >= 0)) { e.push({ seance: r.seance, geste: r.geste, ecran, texte: id, quoi: 'chaîne interdite avant la révélation', chaine: x }); }
      }
      continue;
    }
    const cle = ecran;
    for (const x of (p.vote[cle] || [])) { if (blocs.indexOf(x) < 0) { e.push({ seance: r.seance, geste: r.geste, ecran, texte: id, quoi: 'bloc du vote absent', chaine: x }); } }
    if (cle !== '2.7d' && p.auteur[cle]) { if (blocs.indexOf(p.auteur[cle]) < 0) { e.push({ seance: r.seance, geste: r.geste, ecran, texte: id, quoi: 'phrase de l’auteur absente', chaine: p.auteur[cle] }); } }
    if (ecran === '1.6' || ecran === '2.7e') {
      const rep = ecran === '1.6' ? journal.seances[0].coups.entree[id].reponse : reponse(id);
      const ta = blocs.filter(b => /^Ta raison, /.test(b));
      if (rep && rep.raison !== 'aucune') {
        compter('Ta raison');
        if (ta.length !== 1 || !ta[0].endsWith(p.arguments[rep.raison - 1])) { e.push({ seance: r.seance, geste: r.geste, ecran, texte: id, quoi: '« Ta raison, … » ne finit pas par l’argument attendu', chaine: ta.join(' | ') }); }
      } else if (ta.length) { e.push({ seance: r.seance, geste: r.geste, ecran, texte: id, quoi: '« Ta raison, … » affichée sans raison' }); }
    }
  }
  return e;
}

/** Faute du fichier des phrases : la liste des noms tirée du fichier scellé (vérification provisoire). */
function phrasesProvisoires(scelle) {
  const textes = {};
  for (const id of Object.keys(scelle.textes)) {
    const t = scelle.textes[id];
    const noms = [];
    if (t.auteur.type !== 'gouvernement') { noms.push(t.auteur.nom); }
    t.considerations.forEach(c => noms.push(c.depute.nom));
    textes[id] = { vote: {}, auteur: {}, arguments: ['', '', '', ''], interdites_avant_revelation: noms.concat([N.typographier(N.dateLongue(t.vote.date))]) };
  }
  return { textes, provisoire: true };
}

async function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const octets = new Uint8Array(fs.readFileSync(a.scelle));
  const scelle = JSON.parse(N.utf8Decoder(octets));
  const constructions = {};
  for (const c of ['construction', 'construction-2', 'construction-3']) { if (a[c]) { constructions[+O.lireTexte(path.join(a[c], 'version.txt')).trim()] = a[c]; } }
  const sigles = Array.from(new Set(Object.values(scelle.textes).flatMap(t => [t.auteur.groupe].concat(t.considerations.map(c => c.depute.groupe))).filter(Boolean)));
  const lignes = [];
  let faux = 0;
  const ok = (quoi, juste, detail) => { if (!juste) { faux++; } const l = (juste ? 'juste : ' : 'FAUX : ') + quoi + (detail && !juste ? ' — ' + detail : ''); lignes.push(l); process.stdout.write(l + '\n'); };
  const phrases = a.phrases ? O.lireJson(a.phrases) : phrasesProvisoires(scelle);
  if (!phrases.provisoire) {
    ok('11 : fichier des phrases attendues : format « elenchos-essai-phrases » version 1, même fichier scellé',
      phrases.format === 'elenchos-essai-phrases' && phrases.version === 1 && phrases.empreinte_scelle === N.sha256(octets), phrases.empreinte_scelle);
  }
  if (phrases.provisoire) { lignes.push('Phrases attendues : fichier du programme de contrôle non fourni ; vérification provisoire des noms et des dates du vote avant la révélation seulement.'); }
  const parties = (a.parties || 'a,b,c,d,e,f,g,h,i,j').split(',');
  const chaines = new Map();
  for (const id of parties) {
    const journal = O.lireJson(path.join(a.journaux, id + '.journal.json'));
    const gestes = O.lireJson(path.join(a.journaux, id + '.gestes.json'));
    const releves = lireReleves(path.join(a.rejeu, 'releves'), id, 'porteur');
    if (!releves) { ok('11 : partie ' + id + ' : relevé du rejeu présent', false); continue; }
    for (const r of releves) { for (const b of r.blocs) { if (b.zone === 'exclue') { continue; } const cle = b.zone + '\t' + b.texte; if (!chaines.has(cle)) { chaines.set(cle, (r.vue ? (r.vue.cadre || r.vue.tel) : 'chargement') + ' (partie ' + id + ', séance ' + r.seance + ')'); } } }
    const lr = lignesRouges(releves);
    ok('10 : partie ' + id + ' : ni « n’a pas joué », ni taux d’accord, ni classement, dans tout ce qui a été affiché', lr.length === 0, lr.slice(0, 3).map(x => x.quoi + ' : « ' + x.bloc + ' »').join(' ; '));
    const ce = chiffresEspace(releves);
    ok('11 : partie ' + id + ' : aucun chiffre suivi d’une espace U+0020', ce.length === 0, ce.slice(0, 3).map(x => '« ' + x.bloc + ' »').join(' ; '));
    const compte = {};
    const ep = verifierPhrases(releves, journal, scelle, phrases, compte);
    ok('11 : partie ' + id + ' : phrases du vote et de l’auteur, « Ta raison », rien avant la révélation' + (phrases.provisoire ? ' (provisoire)' : '') +
      ' — écrans vus : ' + Object.keys(compte).sort().map(k => k + ' × ' + compte[k]).join(', '), ep.length === 0,
      ep.slice(0, 3).map(x => x.ecran + ' texte ' + x.texte + ' : ' + x.quoi + ' « ' + (x.chaine || '') + ' »').join(' ; '));
    // à 320 px de large
    if (!a['sans-320']) {
      let r320;
      try { r320 = await RJ.jouerSur({ scelle, journal, gestes, constructions, sorte: 'porteur', navigateur: a.navigateur || 'chromium', appareil: 'iPhone SE', largeur: 320, hauteur: 548 }); }
      catch (x) { ok('11 : partie ' + id + ' jouée à 320 px', false, x.message); continue; }
      O.ecrireJson(path.join(a.sortie, 'releves-320', id + '.json'), r320.releves);
      const cf = coupuresFautives(r320.releves, sigles);
      ok('11 : partie ' + id + ', 320 × 548 px : aucune coupure de ligne fautive', cf.length === 0,
        cf.slice(0, 4).map(x => x.raison + ' : « ' + x.bloc.slice(0, 70) + ' » (séance ' + x.seance + ')').join(' ; '));
    }
  }
  const liste = Array.from(chaines.entries()).map(([k, v]) => k.split('\t')[1] + '\t' + k.split('\t')[0] + '\t' + v).sort();
  O.ecrireTexte(path.join(a.sortie, 'chaines-affichees.txt'), 'Chaînes affichées distinctes (hors zone du carnet, empreinte, graine, fichier scellé) : texte, zone, premier écran.\n\n' + liste.join('\n') + '\n');
  lignes.push(faux ? faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes.');
  O.ecrireTexte(path.join(a.sortie, 'rapport-controle11.txt'), lignes.join('\n') + '\n');
  process.exitCode = faux ? 1 : 0;
}

if (require.main === module) { main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; }); }

module.exports = { coupuresFautives, chiffresEspace, verifierPhrases, lignesRouges };
