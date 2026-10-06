/* Navigateur sans tête du harnais (§9, « Rejeu » ; contrôle 14, « Rejeu sans
 * rien ajouter à la page »).
 *
 * - L'outil sert lui-même, à l'adresse de l'essai, les octets de la page et
 *   de l'image de l'icône, et refuse toute autre requête en la consignant
 *   (aucune ne sort).
 * - Contexte de l'icône : un iPhone de la liste d'appareils de l'outil, en
 *   mode app (navigator.standalone fixé avant tout script de la page), écran
 *   tactile ; fuseau de la machine réglé par l'outil (variable TZ du
 *   navigateur et fuseau du contexte).
 * - Horloge de l'outil (page.clock) : la date et l'horloge des durées.
 * - Rien n'est ajouté à la page, et la politique de sécurité n'est pas
 *   contournée.
 *
 * Playwright : playwright-core, version relevée au rapport (1.56.1 dans
 * l'environnement de l'équipe ; même version sur la machine macOS de la
 * passe WebKit). Chemin du paquet : variable ELENCHOS_PLAYWRIGHT, sinon
 * /opt/node-tools/node_modules/playwright-core, sinon « playwright-core ».
 */
'use strict';
const fs = require('node:fs');

function chargerPlaywright() {
  const essais = [process.env.ELENCHOS_PLAYWRIGHT, '/opt/node-tools/node_modules/playwright-core', 'playwright-core'].filter(Boolean);
  for (const e of essais) {
    try { return require(e); } catch (x) { /* suivant */ }
  }
  throw new Error('playwright-core introuvable (ELENCHOS_PLAYWRIGHT)');
}
const PW = chargerPlaywright();
const VERSION_PLAYWRIGHT = (() => {
  for (const e of [process.env.ELENCHOS_PLAYWRIGHT, '/opt/node-tools/node_modules/playwright-core', 'playwright-core'].filter(Boolean)) {
    try { return require(e + '/package.json').version; } catch (x) { /* suivant */ }
  }
  return 'inconnue';
})();

const ADRESSE = 'https://ppcrepin.github.io/elenchos/essai/';
const ADRESSE_ICONE = ADRESSE + 'apple-touch-icon.png';
const APPAREIL = 'iPhone 15';

/**
 * Service des octets. `page` : chemin du fichier servi pour l'adresse de
 * l'essai (changeable : correctif) ; `icone` : chemin de l'image.
 * Toute autre requête est refusée et consignée.
 */
function creerService(cheminPage, cheminIcone) {
  const s = {
    cheminPage, cheminIcone, servies: [], refusees: [],
    servir(chemin) { s.cheminPage = chemin; }
  };
  s.gestionnaire = async (route) => {
    const req = route.request();
    const u = req.url();
    if (req.method() === 'GET' && u === ADRESSE) {
      s.servies.push(u);
      return route.fulfill({ status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=600' }, body: fs.readFileSync(s.cheminPage) });
    }
    if (req.method() === 'GET' && u === ADRESSE_ICONE && s.cheminIcone) {
      s.servies.push(u);
      return route.fulfill({ status: 200, headers: { 'content-type': 'image/png' }, body: fs.readFileSync(s.cheminIcone) });
    }
    s.refusees.push(req.method() + ' ' + u);
    return route.abort('blockedbyclient');
  };
  return s;
}

/** Script fixé par l'outil avant tout script de la page : le mode app (la propriété que lit la page). */
function scriptModeApp(app) {
  return app ? `Object.defineProperty(Navigator.prototype, 'standalone', { configurable: true, get: function () { return true; } });`
    : `Object.defineProperty(Navigator.prototype, 'standalone', { configurable: true, get: function () { return false; } });`;
}

/**
 * Ouvre un navigateur et un contexte.
 * options : {
 *   navigateur: 'chromium' | 'webkit', fuseau: 'Europe/Paris', langue: 'fr-FR',
 *   appareil: nom d'un appareil de l'outil (null : ordinateur), app: true (mode app),
 *   largeur, hauteur (fenêtre ; sinon celle de l'appareil), sombre: false,
 *   profil: dossier d'un profil gardé sur disque (null : profil jetable),
 *   heure: instant de départ de l'horloge (ms) ; null : pas d'horloge installée,
 *   reduire: false (« Réduire les animations »),
 *   page, icone : chemins des octets servis
 * }
 * Rend { navigateur, contexte, page, service, journalErreurs }.
 */
async function ouvrir(options) {
  const o = Object.assign({ navigateur: 'chromium', fuseau: 'Europe/Paris', langue: 'fr-FR', appareil: APPAREIL, app: true, sombre: false,
    profil: null, heure: null, reduire: false }, options);
  const type = PW[o.navigateur];
  if (!type) { throw new Error('navigateur inconnu : ' + o.navigateur); }
  const d = o.appareil ? Object.assign({}, PW.devices[o.appareil]) : {};
  if (o.appareil && !PW.devices[o.appareil]) { throw new Error('appareil inconnu : ' + o.appareil); }
  delete d.defaultBrowserType;
  if (o.navigateur === 'webkit') { /* WebKit de l'outil : isMobile pris en charge */ }
  const ctxOptions = Object.assign(d, {
    locale: o.langue, timezoneId: o.fuseau, colorScheme: o.sombre ? 'dark' : 'light',
    reducedMotion: o.reduire ? 'reduce' : 'no-preference', serviceWorkers: 'block', acceptDownloads: false
  });
  if (o.largeur && o.hauteur) { ctxOptions.viewport = { width: o.largeur, height: o.hauteur }; ctxOptions.screen = { width: o.largeur, height: o.hauteur }; }
  const env = Object.assign({}, process.env, { TZ: o.fuseau });
  let navigateur = null, contexte;
  if (o.profil) {
    contexte = await type.launchPersistentContext(o.profil, Object.assign({ env }, ctxOptions));
  } else {
    navigateur = await type.launch({ env });
    contexte = await navigateur.newContext(ctxOptions);
  }
  const service = creerService(o.page, o.icone);
  await contexte.route('**/*', service.gestionnaire);
  await contexte.addInitScript(scriptModeApp(o.app));
  if (o.navigateur === 'chromium') {
    try { await contexte.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://ppcrepin.github.io' }); } catch (x) { /* rien */ }
  }
  if (o.heure !== null) { await contexte.clock.install({ time: o.heure }); }
  const page = contexte.pages()[0] || await contexte.newPage();
  const journalErreurs = [];
  const brancher = (p) => {
    p.on('pageerror', e => journalErreurs.push('erreur de la page : ' + e.message));
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') { journalErreurs.push('console (' + m.type() + ') : ' + m.text()); } });
  };
  brancher(page);
  contexte.on('page', brancher);
  return { navigateur, contexte, page, service, journalErreurs, options: o };
}

async function fermer(env) {
  if (env.navigateur) { await env.navigateur.close(); } else { await env.contexte.close(); }
}

async function charger(env) {
  await env.page.goto(ADRESSE, { waitUntil: 'load' });
}

/** Fixe l'heure lue par la page (Date.now) ; les minuteries continuent (setFixedTime). */
async function fixerHeure(env, ms) { await env.contexte.clock.setFixedTime(ms); }

module.exports = { PW, VERSION_PLAYWRIGHT, ADRESSE, ADRESSE_ICONE, APPAREIL, ouvrir, fermer, charger, fixerHeure, creerService };
