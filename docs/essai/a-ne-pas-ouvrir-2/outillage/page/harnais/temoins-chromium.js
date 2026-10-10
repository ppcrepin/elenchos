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
 * 4. Vue de secours (§8.8) : processeur ralenti 3, 5, 7 et RALENTI fois (30 par défaut : chargement
 *    de plus de 3 s) ; à chaque image (requestAnimationFrame), #vue-secours ne doit être ni présente
 *    et visible (getComputedStyle) : elle n'est jamais peinte.
 * 5. Sans script (page sans ses scripts) : la vue de secours est cachée à 1,9 s et visible à 2,2 s.
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

/**
 * Sonde posée avant tout script de la page : à chaque image (requestAnimationFrame, juste avant la
 * peinture), elle note si #vue-secours est présente, non retirée et visible (getComputedStyle).
 * Une image où elle l'est est une image où la vue de secours a été peinte.
 */
const SCRIPT_MESURE = `(function () {
  var m = window.__mesure = { images: 0, imagesVisible: 0, premiereVisible: null, derniereImage: null };
  function image(t) {
    var s = document.getElementById('vue-secours');
    m.images += 1; m.derniereImage = t;
    if (s && !s.hidden && getComputedStyle(s).display !== 'none' && getComputedStyle(s).visibility === 'visible') {
      m.imagesVisible += 1; if (m.premiereVisible === null) { m.premiereVisible = t; }
    }
    if (t < 30000) { requestAnimationFrame(image); }
  }
  requestAnimationFrame(image);
})();`;

async function session(ralenti, travail, cheminPage) {
  const env = await NV.ouvrir({ page: cheminPage || page, scriptsInit: [SCRIPT_MESURE], heure: Date.UTC(2026, 9, 19, 16, 0) });
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
  // 4, ralenti : la vue de secours ne doit être visible sur aucune image.
  for (const r of [3, 5, 7, RALENTI]) {
    await session(r, async (env, ms) => {
      await env.page.waitForTimeout(1500);
      const m = await env.page.evaluate(() => Object.assign({}, window.__mesure));
      dire('ralenti ' + r + ' fois : chargement ' + ms + ' ms ; ' + m.images + ' images observées ; vue de secours visible sur ' + m.imagesVisible + (m.premiereVisible === null ? '' : ' (première à ' + Math.round(m.premiereVisible) + ' ms)'));
      if (m.imagesVisible) { ecart('ralenti ' + r + ' fois : la vue de secours a été peinte'); }
    });
  }
  // 5, sans script : la vue de secours, cachée à 1,9 s, est visible à 2,2 s (CSS seul, §8.8).
  const sansScript = path.join(path.dirname(page), 'sans-script.html');
  const html = fs.readFileSync(page, 'utf8');
  fs.writeFileSync(sansScript, html.replace(/<script>[\s\S]*?<\/script>/g, ''));
  await session(1, async (env) => {
    const lire = () => env.page.evaluate(() => ({ t: performance.now(), v: getComputedStyle(document.getElementById('vue-secours')).visibility }));
    let a = await lire(); while (a.t < 1900) { await env.page.waitForTimeout(20); a = await lire(); }
    let b = await lire(); while (b.t < 2200) { await env.page.waitForTimeout(20); b = await lire(); }
    dire('sans script : ' + a.v + ' à ' + Math.round(a.t) + ' ms, ' + b.v + ' à ' + Math.round(b.t) + ' ms');
    if (!(a.t < 2000 && a.v === 'hidden' && b.v === 'visible')) { ecart('sans script : attendu caché à 1,9 s et visible à 2,2 s'); }
  }, sansScript);
  fs.unlinkSync(sansScript);
  dire(ok ? 'RÉSULTAT : aucun écart' : 'RÉSULTAT : écarts (voir plus haut)');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
