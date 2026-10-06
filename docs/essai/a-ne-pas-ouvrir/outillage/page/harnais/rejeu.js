/* Rejeu des parties par l'interface et par le moteur (§9, « Rejeu » ;
 * contrôles 6 à 10 et 13 ; schema.md, parties 3.1 et 4.2).
 *
 * Pour une partie jouée par l'interface :
 *   - version témoin : trace de la page (bloc témoin), relevé écran par écran ;
 *   - version du porteur : carnet copié, copies en cours d'essai, relevé ;
 *   - vérifie : texte affiché identique, écran par écran, dans les deux
 *     versions ; coups gardés dans la mémoire identiques aux coups joués ;
 *     texte copié identique à la zone du carnet ; aucune requête refusée,
 *     aucune erreur de la page.
 * Pour une partie au hasard en mode moteur : trace par le moteur de la
 * version témoin (ElenchosTemoin.traceMoteur).
 */
'use strict';
const path = require('node:path');
const N = require('../noyau.js');
const O = require('./outils.js');
const NAV = require('./navigateur.js');
const { Joueur } = require('./joueur.js');

/** Les constructions servies : { [version]: dossier } → chemins par version et par sorte. */
function cheminsConstructions(constructions, sorte) {
  const c = {};
  for (const v of Object.keys(constructions)) { c[v] = path.join(constructions[v], sorte, 'index.html'); }
  return c;
}

/** Joue un journal sur une sorte de construction (« temoin » ou « porteur »). */
async function jouerSur(options) {
  const { scelle, journal, gestes, constructions, sorte, navigateur, fuseau, langue, icone, relever, captures, appareil, largeur, hauteur, sombre } = options;
  const chemins = cheminsConstructions(constructions, sorte);
  const premier = N.lireInstant(journal.seances[0].ouverture) - 60000;
  const gp = (gestes && gestes.partie) || {};
  const env = await NAV.ouvrir({ navigateur, fuseau: fuseau || 'Europe/Paris', langue: langue || 'fr-FR', page: chemins[journal.seances[0].versions ? journal.seances[0].versions[0] : 1],
    icone, heure: premier, appareil, largeur, hauteur, sombre, scriptsInit: gp.copieRefusee ? [NAV.SCRIPT_COPIE_REFUSEE] : [] });
  const j = new Joueur(env, journal, chemins, { temoin: sorte === 'temoin', relever: relever !== false, gestes: gestes || { seances: {} }, captures: captures || null });
  try {
    const r = await j.jouer(scelle);
    return r;
  } catch (e) {
    let capture = null;
    try { capture = await env.page.screenshot({ type: 'png' }); } catch (x) { /* rien */ }
    const err = new Error('partie ' + journal.partie.id + ' (' + sorte + ') : ' + e.message);
    err.capture = capture; err.releves = j.releves.slice(-3); err.erreursPage = env.journalErreurs.slice();
    throw err;
  } finally {
    await NAV.fermer(env);
  }
}

/** Journal gardé par la page, comparé au journal joué (entrées seulement ; attente et copies relevées à part). */
function comparerCoups(journal, journalPage) {
  const e = [];
  if (journal.seances.length !== journalPage.seances.length) { e.push({ chemin: '/seances', a: journal.seances.length, b: journalPage.seances.length }); return e; }
  journal.seances.forEach((s, k) => {
    for (const c of ['ouverture', 'versions', 'etapes', 'coups']) {
      O.differences(s[c], journalPage.seances[k][c], ['seances', k, c], e);
    }
  });
  O.differences(journal.arret, journalPage.arret, ['arret'], e);
  O.differences(journal.fin, journalPage.fin, ['fin'], e);
  return e;
}

/** Relevés de deux versions, écran par écran (blocs seulement : texte et zone). */
function comparerReleves(ra, rb) {
  const e = [];
  const n = Math.max(ra.length, rb.length);
  for (let i = 0; i < n; i++) {
    const a = ra[i], b = rb[i];
    if (!a || !b) { e.push({ ecran: i, a: a ? a.geste : null, b: b ? b.geste : null }); continue; }
    // les durées du carnet (zone du carnet) dépendent du temps réel du rejeu : masquées (partie 4.3)
    const blocs = r => r.blocs.map(x => ({ texte: O.masquerCarnet(x.texte), zone: x.zone }));
    const ta = O.canonique({ geste: a.geste, vue: a.vue, blocs: blocs(a) }), tb = O.canonique({ geste: b.geste, vue: b.vue, blocs: blocs(b) });
    if (ta !== tb) { e.push({ ecran: i, seance: a.seance, geste: a.geste, differences: O.differences({ vue: a.vue, blocs: blocs(a) }, { vue: b.vue, blocs: blocs(b) }).slice(0, 5) }); }
  }
  return e;
}

/** Copies du carnet relevées par le bloc témoin, entrées seulement (pour le journal). */
function copiesJournal(trace) { return trace.copies.map(c => ({ k: c.k, coups: c.coups, versions: c.versions, etapes: c.etapes })); }

/** Rejeu complet d'une partie jouée par l'interface, sur les deux versions. */
async function rejouerPartie(options) {
  const { journal } = options;
  const res = { id: journal.partie.id, defauts: [] };
  const t = await jouerSur(Object.assign({}, options, { sorte: 'temoin' }));
  const p = await jouerSur(Object.assign({}, options, { sorte: 'porteur' }));
  res.trace = t.trace;
  res.carnet = p.carnetZone;
  res.copies = p.copies.map(c => c.zone);
  res.relevesTemoin = t.releves; res.relevesPorteur = p.releves;
  res.gestes = t.gestes;
  // texte affiché identique, écran par écran (§9)
  const ecartsReleves = comparerReleves(t.releves, p.releves);
  if (ecartsReleves.length) { res.defauts.push({ controle: 'rejeu', quoi: 'texte affiché différent entre les deux versions', ecarts: ecartsReleves.slice(0, 10) }); }
  // coups gardés identiques aux coups joués (mémoire de chaque version)
  for (const [nom, r] of [['témoin', t], ['porteur', p]]) {
    const efface = !!(options.gestes && options.gestes.partie && options.gestes.partie.effacerApres);
    if (efface) {
      // « Tout effacer » joué à la fin : plus aucune clé de la page (§8.9 ; contrôle 14 d) ; coups comparés à ce que la page tient encore
      if (Object.keys(r.memoire).some(c => c.indexOf('elenchos-essai:') === 0)) { res.defauts.push({ controle: '14 d', quoi: 'clé « elenchos-essai: » restée après « Tout effacer » (' + nom + ')' }); }
    } else {
      const brut = r.memoire['elenchos-essai:partie'];
      let garde = null;
      try { garde = JSON.parse(brut); } catch (e) { /* rien */ }
      if (!garde) { res.defauts.push({ controle: 'rejeu', quoi: 'mémoire illisible (' + nom + ')' }); continue; }
    }
    const e1 = comparerCoups(journal, r.journalPage);
    if (e1.length) { res.defauts.push({ controle: 'rejeu', quoi: 'coups gardés différents des coups joués (' + nom + ')', ecarts: e1.slice(0, 10) }); }
    const cles = Object.keys(r.memoire).filter(c => c.indexOf('elenchos-essai:') !== 0);
    if (cles.length) { res.defauts.push({ controle: 'rejeu', quoi: 'clé hors du préfixe (' + nom + ')', cles }); }
    if (r.erreurs.length) { res.defauts.push({ controle: 'rejeu', quoi: 'erreurs de la page (' + nom + ')', erreurs: r.erreurs.slice(0, 10) }); }
    if (r.requetesRefusees.length) { res.defauts.push({ controle: '14 a', quoi: 'requêtes refusées (' + nom + ')', requetes: r.requetesRefusees }); }
    if (r.carnetCopie !== null && r.carnetCopie !== r.carnetZone) { res.defauts.push({ controle: '14 e', quoi: 'texte copié différent de la zone (' + nom + ')' }); }
    r.copies.forEach((c, i) => { if (c.presse !== null && c.presse !== c.zone) { res.defauts.push({ controle: '14 e', quoi: 'copie ' + (i + 1) + ' : texte copié différent de la zone (' + nom + ')' }); } });
  }
  // carnet du porteur = carnet de la version témoin (même construction)
  if (O.masquerCarnet(t.carnetZone || '') !== O.masquerCarnet(p.carnetZone || '')) { res.defauts.push({ controle: '13', quoi: 'carnet différent entre les deux versions (durées masquées)' }); }
  if (O.canonique(p.copies.map(c => O.masquerCarnet(c.zone))) !== O.canonique(t.copies.map(c => O.masquerCarnet(c.zone)))) { res.defauts.push({ controle: '13', quoi: 'copies différentes entre les deux versions (durées masquées)' }); }
  // la trace porte les copies jouées
  if (O.canonique(copiesJournal(t.trace)) !== O.canonique(journal.copies)) { res.defauts.push({ controle: 'rejeu', quoi: 'copies relevées différentes des copies jouées' }); }
  // lectures d'« En attendant » : heures relevées = heures jouées
  t.trace.seances.forEach((s, k) => {
    const a = s.attente ? s.attente.lectures.map(l => l.heure) : null, b = journal.seances[k].attente ? journal.seances[k].attente.lectures.map(l => l.heure) : null;
    if (O.canonique(a) !== O.canonique(b)) { res.defauts.push({ controle: 'rejeu', quoi: 'lectures d’« En attendant » différentes, séance ' + k, a, b }); }
  });
  // pseudo jamais dans le carnet (contrôle 12)
  const pseudo = journal.seances[0].coups.pseudo;
  if (pseudo && ((p.carnetZone || '').indexOf(pseudo) >= 0 || p.copies.some(c => c.zone.indexOf(pseudo) >= 0))) { res.defauts.push({ controle: '12', quoi: 'le pseudo figure dans le carnet' }); }
  return res;
}

/** Rejeu d'une partie témoin sur la version témoin seule, dans un autre fuseau (§9 : America/New_York). */
async function rejouerFuseau(options) {
  const t = await jouerSur(Object.assign({}, options, { sorte: 'temoin', relever: false }));
  return { trace: t.trace, carnet: t.carnetZone, copies: t.copies.map(c => c.zone), erreurs: t.erreurs };
}

/** Parties au hasard en mode moteur : traces par le moteur de la version témoin. */
async function rejouerMoteur(options) {
  const { journaux, constructions, navigateur, icone } = options;
  const chemins = cheminsConstructions(constructions, 'temoin');
  const env = await NAV.ouvrir({ navigateur, page: chemins[1], icone, heure: null });
  try {
    await NAV.charger(env);
    await env.page.waitForFunction(() => window.ElenchosTemoin !== undefined);
    const traces = [];
    for (const j of journaux) {
      traces.push(await env.page.evaluate((jj) => window.ElenchosTemoin.traceMoteur(jj), j));
    }
    return { traces, erreurs: env.journalErreurs.slice(), refusees: env.service.refusees.slice() };
  } finally { await NAV.fermer(env); }
}

module.exports = { jouerSur, rejouerPartie, rejouerFuseau, rejouerMoteur, comparerCoups, comparerReleves, cheminsConstructions };
