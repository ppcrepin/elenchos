/* Harnais du lot 6, dans Chromium sans tête (§9 ; contrôle 14 j), sur la version témoin construite.
 *
 *   node harnais/temoins-chromium.js CONSTRUCTION FICHIER_SCELLE DOSSIER_TEMOINS TRACE_HISTOIRE_P [RALENTI]
 *
 * 1. Chargement en mode app, comme sur l'iPhone (navigateur.js) : la page passe V1 à V6 et rend
 *    son premier écran ; aucune requête ne sort ; aucune erreur de la page.
 * 2. Histoire : la trace de l'histoire calculée dans le navigateur (ElenchosTemoin.traceHistoire)
 *    est identique, octet pour octet, à TRACE_HISTOIRE_P (Node), donc à C et à S.
 * 3. Témoins : chaque journal de DOSSIER_TEMOINS est rejoué par le moteur de la page dans le
 *    navigateur (mode moteur, ElenchosTemoin.traceMoteur) ; trace identique à <id>/trace-P.json.
 * 4. Vue de secours (§8.8) : processeur ralenti RALENTI fois (30 par défaut) pour que le chargement
 *    dure au moins 3 s ; la vue de secours ne doit jamais être peinte : au premier rendu de contenu
 *    (first-contentful-paint), elle est déjà cachée, ou invisible par son délai de 2 s.
 * Écrit un rapport sur la sortie standard ; code 1 au premier écart. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const NV = require('./navigateur.js');
const N = require('../noyau.js');

const [, , construction, fScelle, dTemoins, fTraceH, ralentiArg] = process.argv;
const RALENTI = Number(ralentiArg || 30);
const page = path.join(construction, 'temoin', 'index.html');
let ok = true;
const dire = (x) => console.log(x);
const ecart = (x) => { ok = false; console.log('ÉCART : ' + x); };

/** Observateurs posés avant tout script de la page : peintures, instant où la vue de secours est cachée. */
const SCRIPT_MESURE = `(function () {
  window.__mesure = { fcp: null, secoursCache: null, secoursVisibleAuFcp: null };
  try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) {
    if (e.name === 'first-contentful-paint') { window.__mesure.fcp = e.startTime; }
  }); }).observe({ type: 'paint', buffered: true }); } catch (x) {}
  new MutationObserver(function () {
    var s = document.getElementById('vue-secours');
    if (s && window.__mesure.secoursCache === null && (s.hidden || getComputedStyle(s).display === 'none')) { window.__mesure.secoursCache = performance.now(); }
  }).observe(document, { subtree: true, attributes: true, childList: true });
})();`;

async function session(ralenti, travail) {
  const env = await NV.ouvrir({ page, scriptsInit: [SCRIPT_MESURE], heure: Date.UTC(2026, 9, 19, 16, 0) });
  if (ralenti > 1) { const cdp = await env.contexte.newCDPSession(env.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: ralenti }); }
  const t0 = Date.now();
  await NV.charger(env);
  const ms = Date.now() - t0;
  await env.page.waitForTimeout(500);
  const r = await travail(env, ms);
  if (env.service.refusees.length) { ecart('requêtes refusées : ' + env.service.refusees.join(', ')); }
  env.journalErreurs.forEach(e => ecart(e));
  await NV.fermer(env);
  return r;
}

(async () => {
  dire('Chromium (playwright-core ' + NV.VERSION_PLAYWRIGHT + '), version témoin : ' + page + ' (SHA-256 ' + N.sha256(new Uint8Array(fs.readFileSync(page))) + ')');
  // 1 à 3, sans ralenti.
  await session(1, async (env, ms) => {
    dire('chargement : ' + ms + ' ms');
    const etat = await env.page.evaluate(() => ({ essai: !!window.ElenchosEssai, temoin: !!window.ElenchosTemoin, arrivee: !!(window.ElenchosEssai && window.ElenchosEssai.arrivee()) }));
    if (!etat.arrivee) { ecart('la page n\'a pas passé V6 (état à l\'arrivée absent)'); return; }
    const th = await env.page.evaluate(() => window.ElenchosTemoin.traceHistoire());
    const texteH = N.jsonCanonique(th);
    const attendu = fs.readFileSync(fTraceH, 'utf8');
    if (texteH === attendu) { dire('histoire : trace du navigateur identique à ' + path.basename(fTraceH) + ' (' + attendu.length + ' octets)'); }
    else { ecart('histoire : la trace du navigateur diffère de ' + fTraceH); }
    const ids = fs.readdirSync(dTemoins).filter(x => fs.existsSync(path.join(dTemoins, x, 'journal.json')) && !fs.existsSync(path.join(dTemoins, x, 'durees.json'))).sort(); // mode moteur seulement
    for (const id of ids) {
      const journal = JSON.parse(fs.readFileSync(path.join(dTemoins, id, 'journal.json'), 'utf8'));
      const t = await env.page.evaluate((j) => window.ElenchosTemoin.traceMoteur(j), journal);
      const texte = N.jsonCanonique(t);
      const p = fs.readFileSync(path.join(dTemoins, id, 'trace-P.json'), 'utf8');
      if (texte === p) { dire('témoin ' + id + ' : rejoué dans Chromium, trace identique à la trace P de Node'); }
      else { ecart('témoin ' + id + ' : la trace du navigateur diffère de ' + id + '/trace-P.json'); }
    }
  });
  // 4, ralenti.
  await session(RALENTI, async (env, ms) => {
    const m = await env.page.evaluate(() => {
      const s = document.getElementById('vue-secours');
      return Object.assign({}, window.__mesure, { secoursEncore: !!s && !s.hidden });
    });
    dire('ralenti ' + RALENTI + ' fois : chargement ' + ms + ' ms ; vue de secours cachée à ' + Math.round(m.secoursCache) + ' ms ; premier rendu de contenu à ' + (m.fcp === null ? 'aucun' : Math.round(m.fcp) + ' ms'));
    if (ms < 3000) { dire('  (chargement sous 3 s : augmenter RALENTI)'); }
    if (m.secoursCache === null || m.secoursEncore) { ecart('la vue de secours n\'a jamais été cachée'); }
    else if (m.fcp !== null && m.fcp < m.secoursCache) { ecart('la vue de secours a pu être peinte : premier rendu à ' + Math.round(m.fcp) + ' ms, cachée à ' + Math.round(m.secoursCache) + ' ms'); }
    else { dire('vue de secours jamais peinte'); }
  });
  dire(ok ? 'RÉSULTAT : aucun écart' : 'RÉSULTAT : écarts (voir plus haut)');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
