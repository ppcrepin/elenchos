/* Lot 7, part B (contrôles à l'écran) : outils communs. Outillage d'essai (D-001 tenu).
 *
 * La page construite (version témoin) est servie à l'adresse de l'essai dans Chromium sans tête
 * (Playwright), en mode app (navigator.standalone), sur un appareil de la liste de l'outil ; toute
 * autre requête est refusée et consignée. Rien n'est ajouté à la page : l'outil lit le DOM, la
 * mémoire et le point d'accès en lecture (window.ElenchosEssai), et touche par les seuls boutons
 * (data-action), comme un doigt.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const N = require('../../noyau.js');
const C = require('../../calendrier.js');
const M = require('../../moteur.js');
const J = require('../../journal.js');

const PW = require(process.env.ELENCHOS_PLAYWRIGHT || '/opt/node-tools/node_modules/playwright-core');
const ADRESSE = 'https://ppcrepin.github.io/elenchos/essai/';
const PERSONNAGES = ['Agathe', 'Nassim', 'Odile', 'Valentin'];

/** Appareils du lot 7 : iPhone 15, iPhone SE en affichage agrandi (320 × 548), iPad ; clair et sombre. */
const APPAREILS = {
  'iphone15': { nom: 'iPhone 15' },
  'se': { nom: 'iPhone SE', largeur: 320, hauteur: 548 },
  'ipad': { nom: 'iPad (gen 11)' }
};

/** Construction : le fichier scellé est relu dans la page (repère du contrôle 1), jamais ailleurs. */
function lireConstruction(dossier, version) {
  const fichier = path.join(dossier, version || 'temoin', 'index.html');
  const html = fs.readFileSync(fichier, 'utf8');
  const b64 = /\/\*elenchos-scelle\*\/"([A-Za-z0-9+/=]+)"/.exec(html)[1];
  const octets = N.base64Decoder(b64);
  const scelle = JSON.parse(N.utf8Decoder(octets));
  const cal = C.lire(scelle);
  const arrivee = M.histoire(scelle, cal);
  return { fichier, html, octets, scelle, empreinte: N.sha256(octets), cal, arrivee, cartes: M.cartesServies(scelle, cal, arrivee) };
}

/** Graine → suite pseudo-aléatoire (mulberry32), pour des parties au hasard rejouables. */
function hasard(graine) {
  let a = graine >>> 0;
  const f = function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.entier = (n) => Math.floor(f() * n);
  f.parmi = (l) => l[Math.floor(f() * l.length)];
  f.oui = (p) => f() < p;
  return f;
}

/** Navigateur de l'outil : Chromium (sans hinting, comme le harnais d'A) ou WebKit (passe WebKit). */
async function lancer(type) { return type === 'webkit' ? PW.webkit.launch() : PW.chromium.launch({ args: ['--font-render-hinting=none'] }); }

/**
 * Un contexte (une mémoire) et une page. o.appareil : clé de APPAREILS ; o.sombre ; o.html (octets servis) ;
 * o.horloge : true pour l'horloge de l'outil (page.clock, installée à o.heure) ; o.ralenti : facteur CPU ;
 * o.profil : dossier d'un profil gardé sur disque (contexte persistant), avec o.type ('chromium' | 'webkit').
 */
async function ouvrir(navigateur, construction, o) {
  o = o || {};
  const ap = APPAREILS[o.appareil || 'iphone15'];
  const reglages = Object.assign({}, PW.devices[ap.nom], { locale: 'fr-FR', timezoneId: 'Europe/Paris', colorScheme: o.sombre ? 'dark' : 'light', serviceWorkers: 'block' });
  delete reglages.defaultBrowserType;
  if (ap.largeur) { reglages.viewport = { width: ap.largeur, height: ap.hauteur }; reglages.screen = { width: ap.largeur, height: ap.hauteur }; }
  const ctx = o.contexte || (o.profil ? await PW[o.type || 'chromium'].launchPersistentContext(o.profil, Object.assign({}, reglages, o.type === 'webkit' ? {} : { args: ['--font-render-hinting=none'] })) : await navigateur.newContext(reglages));
  const s = { ctx, construction, refusees: [], erreurs: [], html: o.html || construction.html, appareil: o.appareil || 'iphone15', sombre: !!o.sombre };
  if (!o.contexte) {
    await ctx.addInitScript(`Object.defineProperty(Navigator.prototype, 'standalone', { configurable: true, get: function () { return true; } });`);
    for (const sc of o.scriptsInit || []) { await ctx.addInitScript(sc); }
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (route.request().method() === 'GET' && u === ADRESSE) { return route.fulfill({ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: s.servi() }); }
      s.refusees.push(u);
      return route.abort('blockedbyclient');
    });
    ctx.__s = s;
  }
  const parent = ctx.__s || s;
  s.servi = () => parent.htmlCourant || s.html;
  parent.htmlCourant = s.html;
  if (o.horloge) { await ctx.clock.install({ time: o.heure || Date.UTC(2026, 9, 19, 8, 0) }); }
  s.page = (o.profil && ctx.pages()[0]) || await ctx.newPage();
  if (o.ralenti && o.ralenti > 1) { const cdp = await ctx.newCDPSession(s.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: o.ralenti }); s.cdp = cdp; }
  s.page.on('pageerror', (e) => s.erreurs.push(String(e && e.stack || e)));
  s.page.on('console', (m) => { if (m.type() === 'error' && !/apple-touch-icon|ERR_BLOCKED_BY_CLIENT/.test(m.text())) { s.erreurs.push('console : ' + m.text()); } });
  if (o.aller !== false) { await s.page.goto(ADRESSE); }
  return s;
}

/** Boutons touchables : visibles, ni désactivés ni réservés ; la feuille avant son voile. */
async function actions(page) {
  return page.evaluate(() => {
    const l = Array.from(document.querySelectorAll('[data-action]'));
    return l.map((e, i) => {
      if (e.getAttribute('aria-disabled') === 'true' || e.closest('[hidden]') || e.classList.contains('voile')) { return null; }
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) { return null; }
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none') { return null; }
      const d = {}; Object.keys(e.dataset).forEach((k) => { if (k !== 'action') { d[k] = e.dataset[k]; } });
      return { i, a: e.dataset.action, d, txt: (e.innerText || '').trim().slice(0, 80) };
    }).filter(Boolean);
  });
}
function grouper(liste) { const g = {}; liste.forEach((x) => { (g[x.a] = g[x.a] || []).push(x); }); return g; }

/** Toucher l'élément i de la liste [data-action] (un clic de l'outil, au centre de l'élément). */
async function toucher(s, x) {
  const l = s.page.locator('[data-action]').nth(x.i);
  await l.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  await l.click({ timeout: 5000 });
  await s.page.waitForTimeout(x.a === 'retourner' ? 520 : 0);
}

async function etat(page) { return page.evaluate(() => window.ElenchosEssai && window.ElenchosEssai.etat()); }

/** Relevé de l'écran : vue, zones de texte, formes présentes (contrôles 10 et 11). */
async function relever(page) {
  return page.evaluate(() => {
    const e = window.ElenchosEssai ? window.ElenchosEssai.etat() : null;
    const txt = (sel) => { const z = document.querySelector(sel); return z && !z.closest('[hidden]') ? z.innerText : null; };
    const k = e ? Math.max.apply(null, Object.keys(e.jours).map(Number)) : null;
    const tel = document.querySelector('.telephone');
    const blocs = [];
    // Blocs de texte : chaque élément feuille porteur de texte (contrôle 11, « bloc par bloc »).
    const racines = [document.querySelector('#app'), document.querySelector('#vue-seule')].filter((x) => x && !x.hidden);
    racines.forEach((r) => {
      r.querySelectorAll('h1,h2,h3,p,li,button,a,span,div,b,label,summary,pre').forEach((x) => {
        if (x.closest('[hidden]') || x.closest('.zone-carnet') || x.id === 'zone-carnet' || x.closest('#zone-carnet') || x.closest('pre')) { return; }
        const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') { return; }
        const propre = Array.from(x.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
        if (propre) { blocs.push(x.innerText.trim()); }
      });
    });
    return {
      k, ecran: e && e.vue && e.vue.tel ? e.vue.tel.ecran : null, cadre: e && e.vue && e.vue.cadre ? e.vue.cadre.page : null,
      arret: !!(e && e.arret), fin: !!(e && e.fin),
      tel: tel && !tel.closest('[hidden]') ? tel.innerText : null,
      cadreTexte: txt('.cadre-milieu'), barre: txt('#app > header'), bande: (function () { const a = document.querySelector('#app'); return a && a.lastElementChild ? a.lastElementChild.innerText : null; })(),
      seule: txt('#vue-seule'), secours: txt('#vue-secours'),
      escaliers: Array.from(document.querySelectorAll('.escalier')).filter((x) => !x.closest('[hidden]')).map((x) => ({ texte: x.innerText, aria: x.getAttribute('aria-label'), html: x.outerHTML })),
      vueTel: e && e.vue && e.vue.tel ? JSON.parse(JSON.stringify(e.vue.tel, (cle, v) => (cle === 'pile' ? undefined : v))) : null,
      barresPortrait: Array.from(document.querySelectorAll('.barre-zone')).filter((x) => !x.closest('[hidden]')).length,
      frise: !!document.querySelector('.frise'),
      blocs
    };
  });
}

/** Le journal de la page, validé (ElenchosJournal.valider, règles 1 à 15). */
async function journalValide(s, enCours) {
  const c = s.construction;
  const j = await s.page.evaluate(() => window.ElenchosEssai.journal());
  const e = J.valider(c.scelle, c.cal, j, { empreinte: c.empreinte, cartes: c.cartes, enCours: enCours });
  return { journal: j, erreurs: e };
}


/**
 * Contrôle 11, coupures automatiques de ligne à l'écran (à 320 px) : aucune juste avant « ? », « ! », « : », « ; »,
 * « » », « · » ou « % », ni juste après un chiffre ; un nom ne se coupe jamais à un trait d'union ; aucune ligne
 * ne commence par « - ». Une fin de bloc ou un retour à la ligne voulu (<br>) n'est pas une coupure. Hors zone du
 * carnet, empreinte, graine et fichier scellé (pre).
 */
async function coupures(page, groupes) {
  return page.evaluate((groupes) => {
    const AVANT = '?!:;»·%';
    const res = [];
    const racines = [document.querySelector('#app'), document.querySelector('#vue-seule')].filter((x) => x && !x.hidden);
    const bloc = (el) => { let x = el; while (x && x !== document.body) { const d = getComputedStyle(x).display; if (d !== 'inline' && d !== 'inline-block' && d !== 'contents') { return x; } x = x.parentElement; } return document.body; };
    const exclu = (el) => !!(el.closest('[hidden]') || el.closest('pre') || el.closest('#zone-carnet') || el.closest('[aria-hidden="true"]'));
    racines.forEach((r) => {
      const blocs = new Set();
      const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (n.textContent.trim() && !exclu(n.parentElement)) { blocs.add(bloc(n.parentElement)); } }
      blocs.forEach((B) => {
        const cs = getComputedStyle(B); if (cs.visibility === 'hidden' || cs.display === 'none') { return; }
        let prev = null, prevTop = null, prevH = 0, brut = '';
        const w = document.createTreeWalker(B, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (n.nodeType === 1) {
            if (n.tagName === 'BR') { prev = null; prevTop = null; }
            else if (n !== B && bloc(n) === n) { prev = null; prevTop = null; }
            continue;
          }
          if (exclu(n.parentElement) || bloc(n.parentElement) !== B) { continue; }
          const t = n.textContent;
          const rg = document.createRange();
          for (let i = 0; i < t.length; i++) {
            const c = t[i];
            const insecable = c === ' ' || c === ' ';
            if (c === '\n') { prev = null; prevTop = null; brut = ''; continue; }
            if (/\s/.test(c) && !insecable) { brut += c; continue; }
            rg.setStart(n, i); rg.setEnd(n, i + 1);
            const rects = rg.getClientRects();
            if (!rects.length) { brut += c; continue; }
            const rc = rects[0];
            if (rc.width === 0 && rc.height === 0) { brut += c; continue; }
            if (prevTop !== null && rc.top > prevTop + Math.max(4, prevH * 0.5)) {
              const p = prev;
              let motif = null;
              if (AVANT.indexOf(c) >= 0) { motif = 'coupure avant « ' + c + ' »'; }
              else if (/[0-9]/.test(p)) { motif = 'coupure après un chiffre'; }
              else if (/[-‐‑]$/.test(brut) && groupes.some((g) => g.indexOf(brut.slice(-6) + t.slice(i, i + 4)) >= 0)) { motif = 'nom de groupe coupé à un trait d\'union'; }
              else if (c === '-') { motif = 'ligne qui commence par « - »'; }
              if (motif) { res.push({ motif, contexte: (B.innerText || '').replace(/\s+/g, ' ').slice(0, 160), car: c }); }
            }
            if (!insecable) { prev = c; }
            brut += c;
            prevTop = rc.top; prevH = rc.height;
          }
        }
      });
    });
    return res;
  }, groupes || []);
}

function normaliser(x) { return String(x).replace(/[  ]/g, ' ').replace(/’/g, "'"); }

module.exports = { PW, ADRESSE, PERSONNAGES, APPAREILS, lireConstruction, hasard, lancer, ouvrir, actions, grouper, toucher, etat, relever, journalValide, normaliser, coupures };
