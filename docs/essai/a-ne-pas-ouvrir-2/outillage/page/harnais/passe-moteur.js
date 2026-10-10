/* Passe du moteur dans un navigateur (second essai ; §9, contrôles 6 à 9 rejoués dans le navigateur, contrôle 14 j),
 * sur la version témoin construite, en mode app. Chromium dans l'environnement de l'équipe ; WebKit sur la machine
 * macOS de la passe WebKit (.github/workflows/essai2-passe-webkit.yml).
 *
 *   node harnais/passe-moteur.js --navigateur chromium|webkit --construction DOSSIER --scelle F --temoins DOSSIER
 *        --trace-histoire TRACE_HISTOIRE_P [--hasard DOSSIER] [--rapport-construction RAPPORT] [--ralentis 3,5,7,30]
 *
 * 1. La page passe V1 à V6 et rend son premier écran ; aucune requête ne sort ; aucune erreur de la page.
 * 2. Histoire : trace calculée dans le navigateur = TRACE_HISTOIRE_P, octet pour octet.
 * 3. Témoins (et parties au hasard) en mode moteur : chaque journal rejoué par le moteur de la page dans le
 *    navigateur (ElenchosTemoin.traceMoteur) ; trace = <id>/trace-P.json, octet pour octet.
 * 4. Performance (§8.8, budgets) : histoire() au chargement (au plus 1 s), calculer() sur la partie la plus longue
 *    (au plus 100 ms par geste) ; dans Chromium, aussi processeur ralenti 4 fois.
 * 5. Vue de secours : à chaque image (requestAnimationFrame), jamais présente et visible pendant un chargement
 *    ralenti (Chromium seulement : WebKit n'a pas de ralenti du processeur) ; sans script, cachée à 1,9 s et visible à 2,2 s.
 * Le journal ne contient aucune valeur du jeu : « juste » ou « ÉCART » et le chemin d'une différence, des durées en ms.
 * Code de sortie : 0 sans écart, 1 sinon. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const NV = require('./navigateur.js');
const O = require('./outils.js');
const N = require('../noyau.js');

const a = O.argumentsCli(process.argv.slice(2));
const NAV = a.navigateur || 'chromium';
const page = path.join(a.construction, 'temoin', 'index.html');
let ecarts = 0;
const dire = (x) => console.log(x);
const ecart = (x) => { ecarts++; console.log('ÉCART : ' + x); };

const SONDE = `(function () {
  var m = window.__mesure = { images: 0, imagesVisible: 0 };
  function image(t) {
    var s = document.getElementById('vue-secours');
    m.images += 1;
    if (s && !s.hidden && getComputedStyle(s).display !== 'none' && getComputedStyle(s).visibility === 'visible') { m.imagesVisible += 1; }
    if (t < 30000) { requestAnimationFrame(image); }
  }
  requestAnimationFrame(image);
})();`;

async function session(options, travail) {
  const env = await NV.ouvrir(Object.assign({ navigateur: NAV, page, scriptsInit: [SONDE], heure: Date.UTC(2026, 9, 19, 16, 0) }, options.ouvrir || {}));
  if (options.ralenti > 1) { const cdp = await env.contexte.newCDPSession(env.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: options.ralenti }); }
  const t0 = Date.now();
  await NV.charger(env);
  const ms = Date.now() - t0;
  await env.page.waitForTimeout(300);
  await travail(env, ms);
  if (env.service.refusees.length) { ecart('requête refusée (' + env.service.refusees.length + ')'); }
  env.journalErreurs.forEach(() => ecart('erreur de la page'));
  await NV.fermer(env);
}

function comparerTexte(nom, obtenu, attendu) {
  if (obtenu === attendu) { return true; }
  const x = JSON.parse(obtenu), y = JSON.parse(attendu);
  const chemin = (function premier(u, v, c) {
    if (JSON.stringify(u) === JSON.stringify(v)) { return null; }
    if (!u || !v || typeof u !== 'object' || typeof v !== 'object') { return c || '/'; }
    for (const k of Array.from(new Set(Object.keys(u).concat(Object.keys(v)))).sort()) { const r = premier(u[k], v[k], c + '/' + k); if (r) { return r; } }
    return c || '/';
  })(x, y, '');
  ecart(nom + ' : première différence en ' + chemin);
  return false;
}

(async () => {
  dire('Passe du moteur, ' + NAV + ' (playwright-core ' + NV.VERSION_PLAYWRIGHT + ')');
  if (a['rapport-construction']) {
    const r = O.lireTexte(a['rapport-construction']);
    for (const v of ['porteur', 'temoin']) {
      const h = O.sha256Fichier(path.join(a.construction, v, 'index.html'));
      if (r.indexOf(h) < 0) { ecart('construction : SHA-256 de ' + v + '/index.html absent du rapport de construction'); } else { dire('juste : ' + v + '/index.html identique à la construction de référence'); }
    }
  }
  const dossiers = [a.temoins].concat(a.hasard ? [a.hasard] : []);
  const journaux = [];
  dossiers.forEach(d => fs.readdirSync(d).sort().forEach(id => {
    const j = path.join(d, id, 'journal.json');
    if (fs.existsSync(j) && !fs.existsSync(path.join(d, id, 'durees.json'))) { journaux.push({ id, d }); }
  }));
  await session({}, async (env, ms) => {
    const pret = await env.page.evaluate(() => !!(window.ElenchosEssai && window.ElenchosEssai.arrivee() && window.ElenchosTemoin));
    if (!pret) { ecart('la page n\'a pas passé V1 à V6'); return; }
    dire('juste : V1 à V6 et premier écran (chargement ' + ms + ' ms)');
    if (comparerTexte('histoire', N.jsonCanonique(await env.page.evaluate(() => window.ElenchosTemoin.traceHistoire())), O.lireTexte(a['trace-histoire']))) { dire('juste : trace de l\'histoire identique'); }
    let justes = 0, plusLong = null;
    for (const x of journaux) {
      const journal = O.lireJson(path.join(x.d, x.id, 'journal.json'));
      const t = N.jsonCanonique(await env.page.evaluate((j) => window.ElenchosTemoin.traceMoteur(j), journal));
      if (comparerTexte(x.id, t, O.lireTexte(path.join(x.d, x.id, 'trace-P.json')))) { justes++; }
      if (!plusLong || Object.keys(journal.jours).length > Object.keys(plusLong.jours).length) { plusLong = journal; }
    }
    dire('juste : ' + justes + ' parties sur ' + journaux.length + ' rejouées, traces identiques');
    const perf = await env.page.evaluate((j) => {
      const E = window.ElenchosEssai, t = [];
      const h0 = performance.now(); E.histoire({}); const h = performance.now() - h0;
      for (let i = 0; i < 10; i++) { const g0 = performance.now(); E.calculer(JSON.parse(JSON.stringify(j))); t.push(performance.now() - g0); }
      t.sort((x, y) => x - y);
      return { histoire: h, mediane: (t[4] + t[5]) / 2, max: t[9] };
    }, plusLong);
    dire('performance : histoire recalculée ' + Math.round(perf.histoire) + ' ms (tirage déjà en cache ; le chargement entier, plus haut, la contient à froid) ; geste : médiane ' + Math.round(perf.mediane) + ' ms, max ' + Math.round(perf.max) + ' ms (budget 100)');
    if (perf.histoire > 1000) { ecart('budget de l\'histoire dépassé'); }
    if (perf.max > 100) { ecart('budget du geste dépassé'); }
  });
  for (const r of (NAV === 'chromium' ? String(a.ralentis || '4,3,5,7,30').split(',').map(Number) : [])) {
    await session({ ralenti: r }, async (env, ms) => {
      await env.page.waitForTimeout(1500);
      const m = await env.page.evaluate(() => Object.assign({}, window.__mesure));
      const p = r === 4 ? await env.page.evaluate(() => { const E = window.ElenchosEssai; const h0 = performance.now(); E.histoire({}); return performance.now() - h0; }) : null;
      dire('ralenti ' + r + ' fois : chargement ' + ms + ' ms (V1 à V6, histoire à froid et premier écran ; budget de la vue de secours : 2 000)' + (p === null ? '' : ', histoire recalculée ' + Math.round(p) + ' ms') + ' ; vue de secours visible sur ' + m.imagesVisible + ' image(s) sur ' + m.images);
      if (m.imagesVisible) { ecart('vue de secours peinte (ralenti ' + r + ')'); }
      if (p !== null && p > 1000) { ecart('budget de l\'histoire dépassé (ralenti 4)'); }
    });
  }
  const sansScript = path.join(path.dirname(page), 'sans-script.html');
  fs.writeFileSync(sansScript, fs.readFileSync(page, 'utf8').replace(/<script>[\s\S]*?<\/script>/g, ''));
  // Sans horloge de l'outil : l'animation CSS suit le temps réel, que l'horloge simulée ne fait pas avancer au même pas (constaté sous WebKit).
  await session({ ouvrir: { page: sansScript, heure: null } }, async (env) => {
    const lire = () => env.page.evaluate(() => ({ t: performance.now(), v: getComputedStyle(document.getElementById('vue-secours')).visibility }));
    let x = await lire(); while (x.t < 1900) { await env.page.waitForTimeout(20); x = await lire(); }
    let y = await lire(); while (y.t < 2200) { await env.page.waitForTimeout(20); y = await lire(); }
    if (x.t < 2000 && x.v === 'hidden' && y.v === 'visible') { dire('juste : sans script, vue de secours cachée à ' + Math.round(x.t) + ' ms, visible à ' + Math.round(y.t) + ' ms'); }
    else { ecart('sans script : vue de secours ' + x.v + ' à ' + Math.round(x.t) + ' ms, ' + y.v + ' à ' + Math.round(y.t) + ' ms'); }
  });
  fs.unlinkSync(sansScript);
  dire(ecarts ? 'échoué : ' + ecarts + ' écart(s)' : 'réussi');
  process.exit(ecarts ? 1 : 0);
})().catch(e => { console.log('échoué : erreur du harnais (' + (e && e.name) + ')'); process.exit(2); });
