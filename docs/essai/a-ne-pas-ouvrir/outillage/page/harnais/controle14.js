/* Contrôle 14 sans tête (§9) : (a) réseau, (b) mémoire, (c) une seule mémoire,
 * (d) « Tout effacer », (e) copie, (f) politique de sécurité, (h) mise en
 * page et largeur de U+202F, (i) durées. (g) se fait à la publication.
 *
 *   node harnais/controle14.js --construction V1 --construction-2 V2 --scelle F
 *        --journaux D/journaux --sortie D [--navigateur chromium|webkit]
 *        [--points a,b,c,d,f,h,i] [--page-test INDEX_PAGE_TEST.html] [--icone PNG]
 *
 * Rien n'est ajouté à la page : l'outil sert les octets, fixe le contexte
 * (appareil, mode app, fuseau, horloge, visibilité) et lit le DOM et la
 * mémoire. Pour (b) et (d), l'outil pose lui-même des clés dans la mémoire
 * de l'origine avant la partie, en servant d'abord à la même adresse la
 * page-test (comme chez le porteur) ou une page vide de l'outil.
 */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const N = require('../noyau.js');
const X = require('../textes.js');
const O = require('./outils.js');
const NAV = require('./navigateur.js');
const RELEVE = require('./releve.js');
const { Joueur, motif } = require('./joueur.js');
const V = require('../polices/verifier-202f.js');

const ICONE_DEFAUT = path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'apple-touch-icon.png');
const PAGE_TEST_DEFAUT = path.join(__dirname, '..', '..', '..', '..', 'page-test-icone', 'index.html');
const ADRESSE = NAV.ADRESSE;

function lireScelle(chemin) {
  const octets = new Uint8Array(fs.readFileSync(chemin));
  return { scelle: JSON.parse(N.utf8Decoder(octets)), empreinte: N.sha256(octets) };
}
function versionDe(dossier) { return +O.lireTexte(path.join(dossier, 'version.txt')).trim(); }
function porteurDe(dossier) { return path.join(dossier, 'porteur', 'index.html'); }

async function memoire(page) {
  return page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const c = localStorage.key(i); o[c] = localStorage.getItem(c); } return o; });
}
async function etatVue(page) { return page.evaluate(() => { const e = window.ElenchosEssai && window.ElenchosEssai.etat(); return e ? e.vue : null; }); }
async function texteVisible(page) { return page.evaluate(() => document.body.innerText); }

/** Page vide de l'outil, servie un instant à l'adresse de l'essai pour poser des clés dans la mémoire de l'origine. */
const PAGE_OUTIL = path.join(os.tmpdir(), 'elenchos-outil-vide.html');
fs.writeFileSync(PAGE_OUTIL, '<!doctype html><meta charset="utf-8"><title>outil</title>');

/* ------------------------------------------------------------------ */
/* Mode de diagnostic (passe WebKit, --diagnostic) : où un scénario      */
/* s'arrête et pourquoi, sans aucune valeur du jeu                      */
/* ------------------------------------------------------------------ */

/** Message d'erreur de l'outil, réduit à sa première ligne et au sélecteur attendu (« waiting for … ») :
 *  jamais le contenu de la page (lignes « resolved to <…> » du journal d'appel). */
function resumeErreur(e) {
  const lignes = String((e && e.message) || e).replace(/\x1b\[[0-9;]*m/g, '').split('\n');
  const attente = lignes.find(l => /^\s*- waiting for /.test(l));
  return lignes[0].slice(0, 200) + (attente ? ' | ' + attente.trim().slice(0, 200) : '');
}

/** Étape en cours d'un scénario, pour le mode de diagnostic. */
function etape(o, nom) { o.etape = nom; }

/** Ce que l'outil retrouve dans la mémoire de l'origine après une réouverture : nombre de clés, clé de partie présente ou non. */
async function noterMemoire(o, rapport, quoi, page) {
  if (!o.diagnostic) { return; }
  const m = await page.evaluate(() => ({ n: localStorage.length, partie: localStorage.getItem('elenchos-essai:partie') !== null })).catch(e => ({ erreur: resumeErreur(e) }));
  rapport.note('diagnostic : ' + quoi + ' : ' + (m.erreur ? 'mémoire illisible par l’outil (' + m.erreur + ')' : m.n + ' clé(s) dans la mémoire de l’origine, clé de partie ' + (m.partie ? 'présente' : 'absente')));
}

/** Fichiers de stockage local d'un profil (noms seulement) : WebKit et Chromium les nomment différemment. */
function fichiersStockage(profil) {
  let n = 0, octets = 0;
  const parcourir = (d) => {
    let liste = [];
    try { liste = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const f of liste) {
      const c = path.join(d, f.name);
      if (f.isDirectory()) { parcourir(c); } else if (/local ?storage/i.test(c)) { n++; try { octets += fs.statSync(c).size; } catch (e) { /* disparu */ } }
    }
  };
  parcourir(profil);
  return n + ' fichier(s) de stockage local, ' + octets + ' octets';
}

/** Sonde du lancement seul, sans aucune page chargée (rien ne sort : la page de départ est vide) : le navigateur crée-t-il son
 *  contexte par défaut avec un profil gardé sur disque ? Variantes pour départager les causes : options de l'outil retirées,
 *  forme du dossier de profil (créé par l'outil, créé par Playwright, chemin réel sans lien symbolique), avec ou sans fenêtre ;
 *  et, pour comparaison, un contexte jetable (sans profil), qui marche dans la passe. */
async function sondeLancement(o, rapport) {
  const type = NAV.PW[o.navigateur];
  const variantes = [
    ['contexte jetable, sans profil (comparaison)', null, {}],
    ['profil gardé, aucune option de l’outil, dossier créé par l’outil', 'outil', {}],
    ['profil gardé, aucune option de l’outil, dossier temporaire créé par Playwright', 'playwright', {}],
    ['profil gardé, aucune option de l’outil, chemin réel du dossier (liens symboliques résolus)', 'reel', {}],
    ['profil gardé, aucune option de l’outil, avec fenêtre (headless: false)', 'outil', { headless: false }]
  ];
  for (const [nom, forme, options] of variantes) {
    const dossier = forme ? profilNeuf('lancement') : null;
    let navigateur = null, contexte = null;
    try {
      if (!forme) { navigateur = await type.launch(options); contexte = await navigateur.newContext(); await contexte.newPage(); }
      else { contexte = await type.launchPersistentContext(forme === 'playwright' ? '' : (forme === 'reel' ? fs.realpathSync(dossier) : dossier), options); }
      rapport.note('diagnostic : lancement (' + nom + ') : contexte créé, ' + contexte.pages().length + ' page(s)');
    } catch (e) {
      rapport.note('diagnostic : lancement (' + nom + ') : échoué : ' + resumeErreur(e));
    } finally {
      try { if (navigateur) { await navigateur.close(); } else if (contexte) { await contexte.close(); } } catch (e) { /* déjà fermé */ }
      if (dossier) { fs.rmSync(dossier, { recursive: true, force: true }); }
    }
  }
}

/** Sonde du profil gardé sur disque : une clé de l'outil (aucune valeur du jeu), posée sur la page vide de l'outil à l'adresse
 *  de l'essai, est-elle relue après une fermeture propre du navigateur et une réouverture du même profil ? Plusieurs variantes,
 *  pour isoler la cause : attente réelle avant la fermeture, horloge de l'outil, appareil émulé. */
async function sondePersistance(o, rapport) {
  await sondeLancement(o, rapport);
  const jour0 = Date.UTC(2026, 9, 19, 18, 0);
  const variantes = [
    { nom: 'iPhone 15, horloge de l’outil, fermeture aussitôt', appareil: 'iPhone 15', heure: jour0, attente: 0 },
    { nom: 'iPhone 15, horloge de l’outil, fermeture après 2 s réelles', appareil: 'iPhone 15', heure: jour0, attente: 2000 },
    { nom: 'iPhone 15, horloge de l’outil, fermeture après 12 s réelles', appareil: 'iPhone 15', heure: jour0, attente: 12000 },
    { nom: 'iPhone 15, sans horloge de l’outil, fermeture aussitôt', appareil: 'iPhone 15', heure: null, attente: 0 },
    { nom: 'ordinateur, sans horloge de l’outil, fermeture aussitôt', appareil: null, heure: null, attente: 0 }
  ];
  for (const v of variantes) {
    const profil = profilNeuf('sonde');
    let ou = 'ouverture du profil neuf';
    let env = null;
    try {
      env = await NAV.ouvrir({ navigateur: o.navigateur, page: PAGE_OUTIL, icone: o.icone, profil, appareil: v.appareil, heure: v.heure });
      ou = 'clé de l’outil posée';
      await NAV.charger(env);
      await env.page.evaluate(() => localStorage.setItem('outil-sonde', 'x'));
      const relue = await env.page.evaluate(() => localStorage.getItem('outil-sonde') === 'x');
      if (v.attente) { await env.page.waitForTimeout(v.attente); }
      ou = 'fermeture propre';
      await NAV.fermer(env); env = null;
      const disque = fichiersStockage(profil);
      ou = 'réouverture du même profil';
      env = await NAV.ouvrir({ navigateur: o.navigateur, page: PAGE_OUTIL, icone: o.icone, profil, appareil: v.appareil, heure: v.heure });
      ou = 'relecture';
      await NAV.charger(env);
      const lu = await env.page.evaluate(() => localStorage.getItem('outil-sonde') === 'x');
      rapport.note('diagnostic : profil gardé (' + v.nom + ') : clé relue avant fermeture : ' + (relue ? 'oui' : 'non') + ' ; après fermeture : ' + disque +
        ' ; clé relue après réouverture : ' + (lu ? 'oui' : 'non'));
    } catch (e) {
      rapport.note('diagnostic : profil gardé (' + v.nom + ') : arrêté à l’étape « ' + ou + ' » : ' + resumeErreur(e));
    } finally {
      if (env) { try { await NAV.fermer(env); } catch (e) { /* déjà fermé */ } }
      fs.rmSync(profil, { recursive: true, force: true });
    }
  }
}

async function poserCles(env, cles) {
  const ancien = env.service.cheminPage;
  env.service.servir(PAGE_OUTIL);
  await env.page.goto(ADRESSE);
  await env.page.evaluate((c) => { Object.keys(c).forEach(k => localStorage.setItem(k, c[k])); }, cles);
  env.service.servir(ancien);
}

/** Visibilité fixée par l'outil (§9, 14 i : « état de visibilité et événement fixés par l'outil, comme le mode app »). */
async function visibilite(page, etat) {
  await page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, etat);
}

/* ------------------------------------------------------------------ */
/* (a) et (c) : contextes hors de l'icône, réseau                       */
/* ------------------------------------------------------------------ */

const CONTEXTES_HORS = [
  { nom: 'onglet d’iPhone (Safari)', appareil: 'iPhone 15', app: false, vue: 'onglet' },
  { nom: 'onglet d’iPad', appareil: 'iPad (gen 11)', app: false, vue: 'onglet' },
  { nom: 'iPad qui se présente comme un Mac', appareil: null, app: false, ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', tactile: true, vue: 'onglet' },
  { nom: 'autre navigateur sur iPhone (Chrome)', appareil: 'iPhone 15', app: false, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1', vue: 'autre' },
  { nom: 'ordinateur', appareil: null, app: false, vue: 'ailleurs' },
  { nom: 'iPhone, icône, mais page dans un cadre d’une autre origine', appareil: 'iPhone 15', app: true, cadre: true, vue: 'ailleurs' }
];

async function controleHors(o, rapport) {
  for (const c of CONTEXTES_HORS) {
    const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone, appareil: c.appareil, app: c.app, ua: c.ua, tactile: c.tactile });
    try {
      if (c.tactile && o.navigateur === 'chromium') {
        const cdp = await env.contexte.newCDPSession(env.page);
        await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      }
      await poserCles(env, { 'autre-cle-outil': 'x' });
      const avant = await memoire(env.page);
      if (c.cadre) {
        // page d'une autre origine, servie par l'outil, qui encadre la page de l'essai
        await env.contexte.route('https://autre-origine.invalid/', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
          body: '<!doctype html><meta charset="utf-8"><iframe src="' + ADRESSE + '" width="390" height="600"></iframe>' }));
        await env.page.goto('https://autre-origine.invalid/');
        const f = env.page.frames().find(x => x.url() === ADRESSE);
        await f.waitForLoadState('load');
        const t = await f.evaluate(() => document.body.innerText);
        rapport.ok('(c) ' + c.nom + ' : vue « ' + c.vue + ' »', /L’essai ne s’ouvre pas ici/.test(t), t.slice(0, 60));
      } else {
        await NAV.charger(env);
        if (c.tactile && (await env.page.evaluate(() => navigator.maxTouchPoints || 0)) < 2) {
          rapport.note('(c) ' + c.nom + ' : non reproduit par l’outil sous ' + o.navigateur + ' (navigator.maxTouchPoints < 2)');
          continue;
        }
        const t = await texteVisible(env.page);
        const attendu = c.vue === 'onglet' ? /Ouvrez plutôt l’icône/ : (c.vue === 'autre' ? /dans ce navigateur, la page ne lance pas/ : /L’essai ne s’ouvre pas ici/);
        rapport.ok('(c) ' + c.nom + ' : vue « ' + c.vue + ' »', attendu.test(t), t.slice(0, 60));
        // un toucher sur chaque bouton, chaque partie repliée
        const n = await env.page.locator('summary, button').count();
        for (let i = 0; i < n; i++) { try { await env.page.locator('summary, button').nth(i).click({ timeout: 2000 }); } catch (e) { /* bouton caché */ } }
        const apres = await memoire(env.page);
        rapport.ok('(c) ' + c.nom + ' : mémoire inchangée après le chargement et un toucher sur chaque bouton', O.canonique(avant) === O.canonique(apres), JSON.stringify(apres));
      }
      rapport.ok('(a) ' + c.nom + ' : aucune requête hors de la page et de l’icône', env.service.refusees.length === 0, env.service.refusees.join(', '));
    } finally { await NAV.fermer(env); }
  }
  // une page d'une autre origine, dans le même navigateur, ne lit rien de ce que la page a gardé
  const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
  try {
    await NAV.charger(env);
    await env.page.getByRole('button', { name: motif(X.continuer) }).click();
    await env.contexte.route('https://autre-origine.invalid/', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>autre</title>' }));
    const p2 = await env.contexte.newPage();
    await p2.goto('https://autre-origine.invalid/');
    const n = await p2.evaluate(() => localStorage.length);
    rapport.ok('(c) une page d’une autre origine, dans le même navigateur, ne lit rien de la mémoire de la page', n === 0, n + ' clé(s)');
  } finally { await NAV.fermer(env); }
}

/* ------------------------------------------------------------------ */
/* (f) politique de sécurité                                            */
/* ------------------------------------------------------------------ */

async function controleCsp(o, rapport) {
  const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
  try {
    await NAV.charger(env);
    const avant = env.service.servies.length;
    const essais = await env.page.evaluate(async () => {
      const r = {};
      const viol = [];
      document.addEventListener('securitypolicyviolation', e => viol.push(e.violatedDirective + ' ' + e.blockedURI));
      try { await fetch('https://ppcrepin.github.io/elenchos/essai/sonde-fetch'); r.fetch = 'passé'; } catch (e) { r.fetch = 'refusé'; }
      await new Promise(res => { const i = new Image(); i.onload = () => { r.image = 'passé'; res(); }; i.onerror = () => { r.image = 'refusé'; res(); }; i.src = 'https://autre-origine.invalid/sonde.png'; });
      await new Promise(res => { const s = document.createElement('script'); s.onload = () => { r.script = 'passé'; res(); }; s.onerror = () => { r.script = 'refusé'; res(); }; s.src = 'https://ppcrepin.github.io/elenchos/essai/sonde.js'; document.head.appendChild(s); });
      await new Promise(res => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.onload = () => { r.style = 'passé'; res(); }; l.onerror = () => { r.style = 'refusé'; res(); }; l.href = 'https://ppcrepin.github.io/elenchos/essai/sonde.css'; document.head.appendChild(l); });
      try { const f = new FontFace('Sonde', 'url(https://ppcrepin.github.io/elenchos/essai/sonde.woff2)'); await f.load(); r.police = 'passé'; } catch (e) { r.police = 'refusé'; }
      await new Promise(res => { const fr = document.createElement('form'); fr.action = 'https://ppcrepin.github.io/elenchos/essai/sonde-form'; fr.method = 'post'; document.body.appendChild(fr); try { fr.submit(); } catch (e) { /* refusé */ } setTimeout(res, 300); });
      await new Promise(res => setTimeout(res, 300));
      r.violations = viol;
      return r;
    });
    const sorties = env.service.servies.slice(avant).concat(env.service.refusees);
    for (const k of ['fetch', 'image', 'script', 'style', 'police']) { rapport.ok('(f) requête « ' + k + ' » lancée depuis la page' + (k === 'image' ? ' (image d’une autre adresse)' : ' (à l’adresse de la page)') + ' : refusée', essais[k] === 'refusé', essais[k]); }
    rapport.note('(f) note : une image demandée à l’adresse de la page elle-même passe la politique (img-src \'self\', voulu pour l’image de l’icône, §8.8) ; que la page n’en crée aucune relève du contrôle 5.');
    rapport.ok('(f) formulaire : refusé, aucune requête n’atteint l’outil', sorties.length === 0, sorties.join(', ') + ' ; violations : ' + essais.violations.join(' | '));
  } finally { await NAV.fermer(env); }
  // une copie dont le bloc de script diffère d'un octet : vue de secours
  const html = O.lireTexte(o.porteur);
  const i = html.indexOf('/* ---- interface.js ---- */');
  const modifie = html.slice(0, i) + '/* ---- interface.js ----- */' + html.slice(i + '/* ---- interface.js ---- */'.length);
  const chemin = path.join(os.tmpdir(), 'elenchos-essai-modifie.html');
  O.ecrireTexte(chemin, modifie);
  const env2 = await NAV.ouvrir({ navigateur: o.navigateur, page: chemin, icone: o.icone });
  try {
    await NAV.charger(env2);
    await env2.page.waitForTimeout(300);
    const t = await texteVisible(env2.page);
    rapport.ok('(f) script modifié d’un octet : vue de secours, jamais une page blanche ni l’essai', /La page n’a pas pu démarrer/.test(t) && !/Continuer/.test(t), t.slice(0, 60));
  } finally { await NAV.fermer(env2); }
}

/* ------------------------------------------------------------------ */
/* (b) mémoire, (d) « Tout effacer »                                    */
/* ------------------------------------------------------------------ */

function profilNeuf(nom) { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'elenchos-profil-' + nom + '-')); return d; }

async function controleMemoire(o, rapport) {
  const profil = profilNeuf('b');
  const jour0 = Date.UTC(2026, 9, 19, 18, 0);
  // 1. la page-test, ouverte depuis l'icône à la même adresse, laisse sa clé
  etape(o, '(b) 1. profil neuf, page-test');
  let env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.pageTest, icone: o.icone, profil, heure: jour0 });
  try {
    await NAV.charger(env);
    await env.page.waitForTimeout(500);
    const m = await memoire(env.page);
    rapport.ok('(b) la page-test a laissé sa clé dans la mémoire de l’origine', Object.keys(m).some(k => k.indexOf('elenchos-essai:sonde-icone') === 0), Object.keys(m).join(', '));
    // 2. la page de l'essai, sur cette mémoire : commence à l'entrée, n'en affiche rien
    etape(o, '(b) 2. page de l’essai sur la mémoire de la page-test');
    env.service.servir(o.porteur);
    await NAV.charger(env);
    const t = await texteVisible(env.page);
    const v = await etatVue(env.page);
    rapport.ok('(b) sur la mémoire de la page-test, la page de l’essai commence à l’entrée', v && v.cadre && v.cadre.page === 'message0', JSON.stringify(v));
    rapport.ok('(b) … et n’affiche rien de la page-test', !/Ouvertures comptées|Repère|repère|Résultat/.test(t));
    const m2 = await memoire(env.page);
    rapport.ok('(b) … et ne touche pas sa clé', O.canonique(Object.keys(m2).filter(k => k.indexOf('sonde-icone') >= 0).map(k => [k, m2[k]])) === O.canonique(Object.keys(m).filter(k => k.indexOf('sonde-icone') >= 0).map(k => [k, m[k]])));
    // 3. un coup validé : la réponse au texte E1
    etape(o, '(b) 3. un coup validé (réponse au texte E1)');
    await env.contexte.clock.setFixedTime(jour0 + 60000);
    for (const n of [X.continuer, X.fermer]) { await env.page.locator('.bande').getByRole('button', { name: motif(n) }).click(); }
    await env.page.locator('.telephone').getByRole('button', { name: /^\s*Elenchos/ }).click();
    const tel = env.page.locator('.telephone');
    await tel.getByRole('button', { name: motif(X.POSITIONS[3]) }).click();
    await tel.getByRole('button', { name: motif(X.jAccepte) }).click();
    await tel.getByRole('button', { name: motif(X.suivant) }).click();
    await tel.getByRole('button', { name: motif(X.aucuneRaison) }).click();
    await tel.getByRole('button', { name: motif(X.valider) }).click();
    const avant = JSON.parse((await memoire(env.page))['elenchos-essai:partie']);
    rapport.ok('(b) coup validé gardé (réponse au texte E1)', avant.seances[0].coups.entree.E1.reponse && avant.seances[0].coups.entree.E1.reponse.niveau === 4);
  } finally { etape(o, '(b) 3 bis. fermeture propre du navigateur (profil gardé)'); await NAV.fermer(env); }
  // 4. fermeture du navigateur, lendemain : la partie reprend à l'étape suivante
  etape(o, '(b) 4. réouverture du même profil le lendemain');
  env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone, profil, heure: jour0 + 86400000 });
  try {
    etape(o, '(b) 4. chargement de la page sur le profil rouvert');
    await NAV.charger(env);
    await noterMemoire(o, rapport, '(b) 4. profil rouvert le lendemain', env.page);
    etape(o, '(b) 4. lecture de l’état par le point d’accès en lecture');
    const e = await env.page.evaluate(() => window.ElenchosEssai.etat());
    rapport.ok('(b) navigateur fermé puis rouvert le lendemain : reprise à l’étape suivante (1.5, pari du texte 1)', e.vue.tel.ecran === '1.5' && e.vue.tel.E === 'E1' && e.seances[0].coups.entree.E1.reponse.niveau === 4, JSON.stringify(e.vue.tel));
  } finally { await NAV.fermer(env); }
  // 5. nouvelle publication (correctif) à la même adresse : reprise sans rejouer un coup
  etape(o, '(b) 5. réouverture du même profil, correctif servi');
  env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur2, icone: o.icone, profil, heure: jour0 + 2 * 86400000 });
  try {
    await NAV.charger(env);
    await noterMemoire(o, rapport, '(b) 5. profil rouvert, correctif servi', env.page);
    const e = await env.page.evaluate(() => window.ElenchosEssai.etat());
    rapport.ok('(b) correctif servi à la même adresse : la partie reprend à la même étape, coups gardés', e.vue.tel.ecran === '1.5' && e.seances[0].coups.entree.E1.reponse.niveau === 4 && (await env.page.evaluate(() => window.ElenchosEssai.version)) === versionDe(path.dirname(path.dirname(o.porteur2))));
  } finally { await NAV.fermer(env); }
  fs.rmSync(profil, { recursive: true, force: true });
  // 6. une clé de partie qui ne se lit pas : arrêt 1, repère M1, mémoire inchangée (§8.11)
  etape(o, '(b) 6. partie gardée illisible (M1)');
  for (const [nom, brut] of [['texte abîmé', '{"format":1,"ecritures":3,"seances":[{"k":0'], ['numéro de format inconnu', '{"format":99,"ecritures":1,"seances":[]}']]) {
    const e2 = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
    try {
      await poserCles(e2, { 'elenchos-essai:partie': brut });
      const avant = await memoire(e2.page);
      await NAV.charger(e2);
      const t = await texteVisible(e2.page);
      const repere = await e2.page.locator('.repere').textContent().catch(() => null);
      const apres = await memoire(e2.page);
      const attendus = [X.arretVerifTitre, X.arretVerifRienEfface, X.arretVerifRepereM1[0].replace(/ $/, '') + ' M1' + X.arretVerifRepereM1[1]].map(x => N.typographier(x));
      const lignes = t.split('\n').map(x => x.trim()).filter(Boolean);
      rapport.ok('(b) partie gardée illisible (' + nom + ') : arrêt 1, repère M1, « Cette page n’a rien effacé. », consigne de garder l’icône, sans « Rien n’est effacé »',
        repere === 'M1' && attendus.every(x => lignes.indexOf(x) >= 0) && !/Rien n’est effacé/.test(t) &&
        lignes.indexOf(attendus[1]) < lignes.indexOf(attendus[2]), String(repere) + ' ; ' + JSON.stringify(lignes));
      rapport.ok('(b) … mémoire inchangée, l’entrée ne commence pas', O.canonique(avant) === O.canonique(apres) && !/Continuer/.test(t));
    } finally { await NAV.fermer(e2); }
  }
}

async function controleEffacer(o, rapport) {
  // pendant l'essai (Moi › Réglages) et après le dévoilement
  for (const moment of ['pendant', 'apres']) {
    const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone, heure: Date.UTC(2026, 9, 19, 18, 0) });
    try {
      await poserCles(env, { 'autre-cle-outil': 'à garder', 'elenchos-essai:sonde-icone': '{"repere":"x"}' });
      const journal = O.lireJson(path.join(o.journaux, (moment === 'pendant' ? 'e' : 'd') + '.journal.json'));
      if (moment === 'pendant') {
        // la partie (e) jusqu'au jour 2, puis Moi › Réglages › « Tout effacer »
        const j = JSON.parse(JSON.stringify(journal));
        j.arret = null;
        const jo = new Joueur(env, j, { 1: o.porteur }, { relever: false });
        jo.scelle = o.scelle;
        await jo.servir(1); await jo.charger();
        jo.k = 0; jo.lectures = []; await jo.seance0();
        await jo.repondreCarnet(j.seances[0].coups.carnet);
        await env.page.locator('.bande').getByRole('button', { name: motif(X.allerJourSuivant) }).click();
        const tel = env.page.locator('.telephone');
        await tel.getByRole('button', { name: motif(X.ongletMoi) }).click();
        await tel.getByRole('button', { name: motif(X.reglagesNom) }).click();
        await tel.getByRole('button', { name: motif(X.toutEffacer) }).click();
      } else {
        const jo = new Joueur(env, journal, { 1: o.porteur }, { relever: false });
        await jo.jouer(o.scelle);
        await env.page.locator('.bande').getByRole('button', { name: motif(X.toutEffacer) }).click();
      }
      const t1 = await texteVisible(env.page);
      rapport.ok('(d) « Tout effacer » (' + moment + ') : confirmation affichée', /Tout effacer\s*\?/.test(t1));
      await env.page.locator('.bande').getByRole('button', { name: motif(X.toutEffacer) }).click();
      const m = await memoire(env.page);
      const t2 = await texteVisible(env.page);
      rapport.ok('(d) après « Tout effacer » (' + moment + ') : aucune clé « elenchos-essai: », clé de la page-test comprise', !Object.keys(m).some(k => k.indexOf('elenchos-essai:') === 0), JSON.stringify(m));
      rapport.ok('(d) … la clé hors du préfixe, posée par l’outil, est intacte', m['autre-cle-outil'] === (moment === 'pendant' ? 'à garder' : 'à garder'));
      const vue = await env.page.evaluate(() => {
        const v = document.getElementById('vue-seule');
        return { titre: v && v.querySelector('h1') ? v.querySelector('h1').textContent : null, boutons: v ? v.querySelectorAll('button, a').length : -1,
          pied: v ? v.querySelectorAll('.pied').length : -1, app: !!(document.getElementById('app') && !document.getElementById('app').hidden), focus: document.activeElement && document.activeElement.tagName };
      });
      rapport.ok('(d) … vue seule « La page a tout effacé. », sans bouton ni pied de page, titre sous le lecteur d’écran',
        vue.titre === N.typographier(X.efface) && vue.boutons === 0 && vue.pied === 0 && !vue.app && vue.focus === 'H1', JSON.stringify(vue));
      // la page revient à l'entrée, comme à une première visite
      await NAV.charger(env);
      const v = await etatVue(env.page);
      rapport.ok('(d) … rouverte, la page revient à l’entrée', v && v.cadre && v.cadre.page === 'message0');
    } finally { await NAV.fermer(env); }
  }
}

/* ------------------------------------------------------------------ */
/* (h) mise en page                                                     */
/* ------------------------------------------------------------------ */

function taillesH() {
  const t = [
    [599, 900], [600, 900], [600, 899], [768, 900], [768, 899], [500, 499], [800, 500], [700, 499], [700, 500],
    [600, 600], [601, 600], [320, 548],
    // iPad 13 pouces, hors de la liste de l'outil : la seule planche en largeur (§8.1, « iPad 13 pouces dans les deux sens »)
    [1032, 1376, 'iPad 13 pouces, taille fixée par l’outil'], [1376, 1032, 'iPad 13 pouces, taille fixée par l’outil, en largeur']
  ];
  const vues = new Set(t.map(x => x[0] + 'x' + x[1]));
  for (const nom of ['iPhone SE (3rd gen)', 'iPhone 13 Mini', 'iPhone 15', 'iPhone 15 Pro Max', 'iPad Mini', 'iPad (gen 5)', 'iPad (gen 6)', 'iPad (gen 7)', 'iPad (gen 11)', 'iPad Pro 11']) {
    const d = NAV.PW.devices[nom];
    const s = d.screen || d.viewport;
    for (const [l, h, n] of [[s.width, s.height, nom], [s.height, s.width, nom + ' en largeur']]) {
      if (!vues.has(l + 'x' + h)) { vues.add(l + 'x' + h); t.push([l, h, n]); } // même taille qu'un autre appareil : une fois
    }
  }
  return t;
}

/** Vérifie une mesure de disposition (§8.1 ; 14 h). Rend la liste des écarts. */
function verifierDisposition(m, attendu) {
  const e = [];
  const F = m.fenetre;
  if (attendu.couche) {
    if (!m.couchee || m.app) { e.push('écran couché attendu'); }
    return e;
  }
  if (m.couchee) { e.push('vue couchée inattendue'); return e; }
  if (m.defilement.largeur > m.defilement.visibleL + 0.5) { e.push('défilement de côté'); }
  const ecran = m.cadre || m.ecran;
  if (attendu.planche) {
    if (!m.planche) { e.push('planche attendue'); }
    if (m.milieu && (m.milieu.h < 480 - 0.5 || m.milieu.h > 740 + 0.5)) { e.push('planche : écran du jeu de ' + Math.round(m.milieu.h) + ' px (480 à 740)'); }
    // la bande garde sa hauteur réelle et tient dans la fenêtre ; le milieu prend la place qui reste (§8.1, « Planche »)
    if (m.defilement.hauteur > m.defilement.visible + 0.5) { e.push('planche : la page défile'); }
    for (const [nom, b] of [['barre', m.barre], ['bande', m.bande]]) {
      if (b && (b.y < -0.5 || b.b > F.h + 0.5)) { e.push('planche : ' + nom + ' hors de la fenêtre'); }
    }
    const basAttendu = 24; // max(24 px, zone sûre du bas) : l'outil n'a pas de zone sûre
    if (m.milieu && m.bande && m.milieu.h < 740 - 0.5 && Math.abs(F.h - m.bande.b - basAttendu) > 1) {
      e.push('planche : l’écran du jeu (' + Math.round(m.milieu.h) + ' px) ne prend pas la place qui reste (' + Math.round(F.h - m.bande.b) + ' px sous la bande, ' + basAttendu + ' attendus)');
    }
  } else {
    if (m.planche) { e.push('compact attendu'); }
    if (m.milieu && m.milieu.h < 200 - 0.5) { e.push('écran du jeu de ' + Math.round(m.milieu.h) + ' px (< 200)'); }
    const pageDefile = m.defilement.hauteur > m.defilement.visible + 0.5;
    if (pageDefile && !(m.milieu && Math.abs(m.milieu.h - 200) < 1)) { e.push('la page défile alors que l’écran du jeu a ' + (m.milieu ? Math.round(m.milieu.h) : '?') + ' px'); }
    if (!pageDefile) {
      for (const [nom, b] of [['barre', m.barre], ['bande', m.bande]]) {
        if (b && (b.y < -0.5 || b.b > F.h + 0.5)) { e.push(nom + ' hors de la fenêtre'); }
      }
    }
  }
  if (m.barre && m.milieu && m.barre.b > m.milieu.y + 0.5) { e.push('barre et milieu se chevauchent'); }
  if (m.bande && m.milieu && m.milieu.b > m.bande.y + 0.5) { e.push('milieu et bande se chevauchent'); }
  for (const c of m.cibles) {
    if (c.h < 44 - 0.5) { e.push('cible du cadre de ' + Math.round(c.h) + ' px de haut : « ' + c.texte + ' »'); }
    for (const t of m.telCibles) {
      const dx = Math.max(0, Math.max(c.x, t.x) - Math.min(c.x + c.l, t.x + t.l));
      const dy = Math.max(0, Math.max(c.y, t.y) - Math.min(c.y + c.h, t.y + t.h));
      if (Math.max(dx, dy) < 16 - 0.5 && t.y < F.h && t.y + t.h > 0) { e.push('moins de 16 px entre « ' + c.texte + ' » et une cible du téléphone'); break; }
    }
  }
  e.push(...verifierRevelation(m, attendu), ...verifierSousOnglets(m), ...verifierActions(m), ...verifierTextes(m), ...verifierLignesListe(m));
  return Array.from(new Set(e));
}

/** Révélations (§8.1) : zone de la croix à sa place ; centre des points à la hauteur du centre de la croix ;
 *  ni point ni filet ne touche la croix ; écart habituel sous les points ; aucun texte sous le dessin de la croix. */
function verifierRevelation(m, attendu) {
  const r = m.revelation;
  if (!r || r.defile > 0.5) { return []; } // le contenu défilé passe sous la croix, comme dans les maquettes : seul compte l'écran tel qu'il s'ouvre
  const e = [];
  const [haut, droite] = attendu.planche ? [18, 16] : [8, 8]; // planche : l'écran commence au bord intérieur de 10 px en haut, 8 px sur les côtés
  const c = r.croix;
  if (Math.abs(c.y - r.ecran.y - haut) > 0.5 || Math.abs(r.ecran.d - c.d - droite) > 0.5 || Math.abs(c.l - 44) > 0.5 || Math.abs(c.h - 44) > 0.5) {
    e.push('croix : zone de ' + Math.round(c.l) + ' × ' + Math.round(c.h) + ' px à ' + (c.y - r.ecran.y).toFixed(1) + ' px du haut et ' + (r.ecran.d - c.d).toFixed(1) + ' px du bord droit (attendu 44 × 44, ' + haut + ' et ' + droite + ')');
  }
  if (!r.points) { e.push('révélation sans rangée de points'); return e; }
  const ecartCentres = (r.points.y + r.points.b) / 2 - (c.y + c.h / 2);
  if (Math.abs(ecartCentres) > 0.5) { e.push('révélation : centre des points à ' + ecartCentres.toFixed(1) + ' px du centre de la croix'); }
  const touche = (a, b) => a && b && a.d > b.x && a.x < b.d && a.b > b.y && a.y < b.b;
  if (touche(r.points, { x: c.x, d: c.d, y: c.y, b: c.b })) { e.push('révélation : la rangée de points entre dans la zone de la croix'); }
  if (touche(r.filet, r.dessin)) { e.push('révélation : le double filet touche la croix'); }
  if (r.filet && r.dessin && r.filet.y < r.dessin.b) { e.push('révélation : le double filet passe au-dessus du bas de la croix'); }
  if (r.suivant && Math.abs(r.suivant.y - r.points.b - 10) > 0.5) { e.push('révélation : ' + (r.suivant.y - r.points.b).toFixed(1) + ' px sous les points (10 attendus)'); }
  if (r.sous.length) { e.push('révélation : texte sous le dessin de la croix (« ' + r.sous[0] + ' »)'); }
  return e;
}

/** Aucun texte ne déborde de sa boîte, ni de la marge de 14 px de l'écran du jeu. */
function verifierTextes(m) {
  return (m.debords || []).map(x => 'texte qui déborde (' + x.ou + ') : « ' + x.texte + ' »');
}

/** Aucune ligne de liste n'est plus basse que son contenu : 7 px au-dessus et au-dessous du texte, 44 px au moins si elle se touche. */
function verifierLignesListe(m) {
  const e = [];
  for (const l of m.lignesListe || []) {
    if (l.deborde || l.dessus < 7 - 0.5 || l.dessous < 7 - 0.5) { e.push('ligne de liste plus basse que son contenu (' + l.dessus.toFixed(1) + ' px au-dessus, ' + l.dessous.toFixed(1) + ' px au-dessous) : « ' + l.texte + ' »'); }
    if (l.touchable && l.h < 44 - 0.5) { e.push('ligne de liste touchable de ' + Math.round(l.h) + ' px : « ' + l.texte + ' »'); }
  }
  return e;
}

/** Sous-onglets de Moi : une ligne de base commune, onglet actif compris. */
function verifierSousOnglets(m) {
  const b = (m.sousOnglets || []).map(x => x.base);
  if (b.length < 2) { return []; }
  const ecart = Math.max(...b) - Math.min(...b);
  return ecart > 0.5 ? ['sous-onglets de Moi : lignes de base décalées de ' + ecart.toFixed(1) + ' px'] : [];
}

/** Rangées d'action (§8.1) : côte à côte si elles tiennent, sinon toutes l'une sous l'autre, 8 px entre elles, dans l'ordre du texte. */
function verifierActions(m) {
  const e = [];
  for (const a of m.actions || []) {
    const B = a.boutons;
    if (B.length < 2) { continue; }
    const noms = B.map(b => '« ' + b.texte + ' »').join(', ');
    const lignes = [];
    for (const b of B) { if (!lignes.some(y => Math.abs(y - b.y) < 1)) { lignes.push(b.y); } }
    const tiennent = B.every(b => b.lignes === 1) && B.reduce((s, b) => s + b.naturelle, 0) + a.ecart * (B.length - 1) <= a.largeur + 0.5;
    if (lignes.length === 1) {
      if (!B.every((b, i) => i === 0 || b.x > B[i - 1].x)) { e.push('actions côte à côte hors de l’ordre du texte : ' + noms); }
      const deborde = B.some(b => b.x < a.x - 0.5 || b.x + b.l > a.x + a.largeur + 0.5);
      if (!tiennent || deborde) { e.push('actions côte à côte qui ne tiennent pas : ' + noms); }
    } else if (lignes.length === B.length) {
      if (!B.every((b, i) => i === 0 || b.y > B[i - 1].y)) { e.push('actions l’une sous l’autre hors de l’ordre du texte : ' + noms); }
      if (!B.every((b, i) => i === 0 || Math.abs(b.y - (B[i - 1].y + B[i - 1].h) - 8) < 0.5)) { e.push('actions l’une sous l’autre sans 8 px entre elles : ' + noms); }
      if (tiennent) { e.push('actions l’une sous l’autre alors qu’elles tiennent côte à côte : ' + noms); }
    } else {
      e.push('actions sur ' + lignes.length + ' lignes pour ' + B.length + ' boutons (ni côte à côte ni l’une sous l’autre) : ' + noms);
    }
  }
  return e;
}

async function controleMiseEnPage(o, rapport) {
  const journal = O.lireJson(path.join(o.journaux, 'b.journal.json'));
  const gestes = O.lireJson(path.join(o.journaux, 'b.gestes.json'));
  const constructions = { 1: porteurDe(o.construction), 2: porteurDe(o.construction2), 3: porteurDe(o.construction3 || o.construction2) };
  const choisies = o.tailles ? o.tailles.split(',').map(x => x.split('x').map(Number)) : null;
  for (const [l, h, nom] of taillesH().filter(t => !choisies || choisies.some(c => c[0] === t[0] && c[1] === t[1]))) {
    const couche = h <= 499 && l > h;
    const planche = l >= 600 && h >= 900;
    const env = await NAV.ouvrir({ navigateur: o.navigateur, page: constructions[1], icone: o.icone, largeur: l, hauteur: h, heure: N.lireInstant(journal.seances[0].ouverture) - 60000 });
    const ecarts = {};
    let ecrans = 0;
    try {
      if (couche) {
        await NAV.charger(env);
        const m = await env.page.evaluate(RELEVE.mesurerDisposition);
        const e = verifierDisposition(m, { couche: true });
        rapport.ok('(h) ' + l + ' × ' + h + (nom ? ' (' + nom + ')' : '') + ' : écran couché', e.length === 0, e.join(' ; '));
        continue;
      }
      const jo = new Joueur(env, journal, constructions, { relever: false, gestes });
      const original = jo.releverSiVoulu.bind(jo);
      const vus = { note: 0, confirmation: 0, trois: 0 };
      jo.releverSiVoulu = async (geste) => {
        const m = await env.page.evaluate(RELEVE.mesurerDisposition);
        ecrans++;
        if (m.bandeContenu.note) { vus.note++; }
        if (m.bandeContenu.confirmation) { vus.confirmation++; }
        if (m.bandeContenu.boutons >= 3) { vus.trois++; }
        for (const x of verifierDisposition(m, { planche })) { (ecarts[x] = ecarts[x] || []).push('séance ' + jo.k + ', ' + geste); }
        return original(geste);
      };
      await jo.jouer(o.scelle);
      const liste = Object.keys(ecarts);
      rapport.ok('(h) ' + l + ' × ' + h + (nom ? ' (' + nom + ')' : '') + ' : ' + ecrans + ' écrans de la partie (b), disposition ' + (planche ? 'planche' : 'compacte') +
        ', dont ' + vus.note + ' avec une note, ' + vus.confirmation + ' avec la confirmation de « Jour suivant », ' + vus.trois + ' avec trois boutons (« Tout effacer ? »)',
        liste.length === 0 && vus.note > 0 && vus.confirmation > 0 && vus.trois > 0, liste.map(x => x + ' (' + ecarts[x].length + ' fois, d’abord ' + ecarts[x][0] + ')').join(' ; '));
    } catch (e) {
      rapport.ok('(h) ' + l + ' × ' + h + (nom ? ' (' + nom + ')' : '') + ' : partie (b) jouée', false, e.message);
    } finally { await NAV.fermer(env); }
  }
}

/* ------------------------------------------------------------------ */
/* Arrêts techniques (§8.11) : vérifications V2, V4, V5 ; stockage absent ; page ouverte deux fois */
/* ------------------------------------------------------------------ */

/** Copie de la page dont le fichier scellé embarqué est remplacé (politique de sécurité recalculée) : outil du contrôle seulement. */
function pageAvecScelle(porteur, b64) {
  const crypto = require('node:crypto');
  const html = O.lireTexte(porteur);
  const ancien = html.match(/\/\*elenchos-scelle\*\/"([A-Za-z0-9+/=]*)"/)[1];
  const vieuxScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const script = vieuxScript.replace(ancien, b64);
  const h = s => "'sha256-" + crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('base64') + "'";
  const chemin = path.join(os.tmpdir(), 'elenchos-essai-scelle-' + crypto.createHash('sha256').update(b64).digest('hex').slice(0, 8) + '.html');
  O.ecrireTexte(chemin, html.replace(vieuxScript, script).replace(h(vieuxScript), h(script)));
  return chemin;
}

async function controleArrets(o, rapport) {
  const octets = Buffer.from(fs.readFileSync(o.cheminScelle));
  const sc = JSON.parse(octets.toString('utf8'));
  const canon = v => Buffer.from(N.jsonCanonique(v), 'utf8').toString('base64');
  const cas = [
    ['V2', octets.toString('base64').replace(/^(.{10})/, '$1*')],
    ['V4', canon(Object.assign({}, sc, { version: 3 }))],
    ['V5', canon(Object.assign({}, sc, { vecteurs_test: sc.vecteurs_test.map((v, i) => i === 1 ? Object.assign({}, v, { n: v.n + 1 }) : v) }))]
  ];
  for (const [repere, b64] of cas) {
    const env = await NAV.ouvrir({ navigateur: o.navigateur, page: pageAvecScelle(o.porteur, b64), icone: o.icone });
    try {
      await NAV.charger(env);
      const r = await env.page.locator('.repere').textContent().catch(() => null);
      const t = await texteVisible(env.page);
      const m = await memoire(env.page);
      rapport.ok('(§8.11) vérification ' + repere + ' ratée : arrêt 1, repère ' + repere + ', consigne ordinaire, rien d’écrit', r === repere && /La page s’est arrêtée par précaution/.test(t) &&
        !/Cette page n’a rien effacé|Gardez l’icône/.test(t) && Object.keys(m).length === 0, String(r));
    } finally { await NAV.fermer(env); }
  }
  // stockage absent (le navigateur refuse d'écrire : l'outil le règle avant tout script, comme le mode app)
  const env2 = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
  try {
    await env2.contexte.addInitScript('Storage.prototype.setItem = function () { throw new Error("QuotaExceededError"); };');
    await NAV.charger(env2);
    const t = await texteVisible(env2.page);
    rapport.ok('(§8.11) stockage absent : arrêt 2', /La page ne peut pas garder vos réponses/.test(t) && !/Continuer/.test(t));
  } finally { await NAV.fermer(env2); }
  // page ouverte deux fois : la seconde écrit, la première s'arrête à son geste suivant, sans rien écraser
  const env3 = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
  try {
    await NAV.charger(env3);
    const p1 = env3.page;
    const p2 = await env3.contexte.newPage();
    await p2.goto(ADRESSE);
    await p2.waitForFunction(() => window.ElenchosEssai !== undefined);
    await p2.locator('.bande').getByRole('button', { name: motif(X.continuer) }).click();
    const garde = (await memoire(p2))['elenchos-essai:partie'];
    await p1.locator('.bande').getByRole('button', { name: motif(X.continuer) }).click();
    const t = await texteVisible(p1);
    const apres = (await memoire(p1))['elenchos-essai:partie'];
    rapport.ok('(§8.11) page ouverte deux fois : arrêt 3, « Reprendre ici », rien d’écrasé', /La page s’est ouverte deux fois en même temps/.test(t) && apres === garde);
    await p1.getByRole('button', { name: motif(X.reprendreIci) }).click();
    await p1.waitForFunction(() => window.ElenchosEssai !== undefined && window.ElenchosEssai.etat() !== null);
    const v = await etatVue(p1);
    rapport.ok('(§8.11) « Reprendre ici » : la partie telle qu’elle a été gardée en dernier', v && v.cadre && v.cadre.page === 'quiestqui', JSON.stringify(v));
  } finally { await NAV.fermer(env3); }
}

/** Retours (14 h) : défilement, page du cadre, écran tourné, relances. */
async function controleRetours(o, rapport) {
  const journal = O.lireJson(path.join(o.journaux, 'b.journal.json'));
  const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone, heure: N.lireInstant(journal.seances[0].ouverture) - 60000 });
  const page = env.page;
  const tel = page.locator('.telephone'), bande = page.locator('.bande'), barre = page.locator('header.barre');
  const b = (zone, nom) => zone.getByRole('button', { name: motif(nom) }).click();
  const corps = () => page.evaluate(() => { const c = document.querySelector('.telephone .corps'); return c ? c.scrollTop : null; });
  const tourner = async (l, h) => { await page.setViewportSize({ width: l, height: h }); await page.waitForTimeout(50); };
  try {
    await NAV.charger(env);
    const vp = page.viewportSize();
    // séance 0 jusqu'à 1.8, avec une saisie
    await b(bande, X.continuer); await b(bande, X.fermer);
    await tel.getByRole('button', { name: /^\s*Elenchos/ }).click();
    const jo = new Joueur(env, journal, { 1: o.porteur }, { relever: false });
    jo.scelle = o.scelle; jo.version = 1;
    for (const E of ['E1', 'E2', 'E3']) {
      const e = journal.seances[0].coups.entree[E];
      await b(tel, X.POSITIONS[e.reponse.niveau - 1]);
      if (E === 'E1') { await b(tel, X.jAccepte); }
      await b(tel, X.suivant);
      const tx = o.scelle.textes[E];
      await b(tel, e.reponse.raison === 'aucune' ? X.aucuneRaison : X.raisonFinLigne(tx.considerations[e.reponse.raison - 1].texte));
      await b(tel, X.valider);
      await b(tel, X.POSITIONS[e.pari - 1]); await b(tel, X.voirSaReponse); await b(tel, E === 'E3' ? X.suivant : X.texteSuivant);
    }
    await b(tel, X.creerCompte);
    await tel.getByRole('textbox').pressSequentially('Retours-q');
    const m0 = await memoire(page);
    await tourner(vp.height, Math.min(vp.width, 420));
    const couche = await page.evaluate(() => getComputedStyle(document.querySelector('.vue-couchee')).display !== 'none');
    await page.locator('.vue-couchee').click();
    const m1 = await memoire(page);
    await tourner(vp.width, vp.height);
    const saisie = await tel.getByRole('textbox').inputValue();
    rapport.ok('(h) écran tourné puis redressé sur 1.8 : vue couchée, puis même écran et même saisie ; mémoire inchangée pendant l’écran couché',
      couche && saisie === 'Retours-q' && O.canonique(m0) === O.canonique(m1) && (await etatVue(page)).tel.ecran === '1.8', JSON.stringify({ couche, saisie }));
    await b(tel, X.recevoirCode); await b(tel, X.valider);
    await b(bande, X.allerJourSuivant);
    // séance 1 : téléphone défilé, page du cadre ouverte et refermée
    await page.evaluate(() => { const c = document.querySelector('.telephone .corps'); c.scrollTop = 120; });
    const d0 = await corps();
    await b(barre, X.quiEstQuiBouton); await b(bande, X.fermer);
    const d1 = await corps();
    rapport.ok('(h) téléphone défilé, « Qui est qui ? » ouvert et refermé : même écran, même défilement', d0 > 0 && d0 === d1 && (await etatVue(page)).tel.ecran === 'repondre', d0 + ' / ' + d1);
    // position choisie, écran tourné et redressé : même choix, même défilement
    await b(tel, X.POSITIONS[1]);
    const d2 = await corps();
    await tourner(vp.height, Math.min(vp.width, 420)); await tourner(vp.width, vp.height);
    const choix = await tel.getByRole('button', { name: motif(X.POSITIONS[1]) }).getAttribute('aria-pressed');
    rapport.ok('(h) écran tourné et redressé sur Répondre : même choix, même défilement', choix === 'true' && (await corps()) === d2, choix + ' ; ' + d2 + ' / ' + (await corps()));
    // relance avec une page du cadre ouverte : la même page
    await b(barre, X.quiEstQuiBouton);
    await page.reload(); await page.waitForFunction(() => window.ElenchosEssai !== undefined);
    rapport.ok('(h) relance avec « Qui est qui ? » ouvert : la même page', (await etatVue(page)).cadre && (await etatVue(page)).cadre.page === 'quiestqui');
    await b(bande, X.fermer);
    // relance avec une confirmation ouverte : pas de confirmation
    await b(bande, X.jourSuivant);
    const conf = await bande.getByRole('alertdialog').count();
    await page.reload(); await page.waitForFunction(() => window.ElenchosEssai !== undefined);
    rapport.ok('(h) relance avec la confirmation de « Jour suivant » ouverte : pas de confirmation', conf === 1 && (await bande.getByRole('alertdialog').count()) === 0 && (await bande.getByRole('button', { name: motif(X.jourSuivant) }).count()) === 1);
    // carnet du jour d'une journée pas finie : relance → téléphone à l'écran d'avant « Jour suivant », choix gardés
    await b(bande, X.jourSuivant); await b(bande, X.ouiContinuer);
    await b(page.locator('.cadre-milieu'), X.choixQ2.pas_tout);
    await page.reload(); await page.waitForFunction(() => window.ElenchosEssai !== undefined);
    const e1 = await page.evaluate(() => window.ElenchosEssai.etat());
    rapport.ok('(h) relance sur le carnet du jour d’une journée pas finie : téléphone à l’écran d’avant « Jour suivant », choix du carnet gardés',
      !e1.vue.cadre && e1.vue.tel.ecran === 'repondre' && e1.seances[1].coups.carnet.q2 === 'pas_tout', JSON.stringify({ cadre: e1.vue.cadre, ecran: e1.vue.tel.ecran, q2: e1.seances[1].coups.carnet.q2 }));
    // une note apparaît : l'élément touché garde sa place (« + Inviter », lien vers un écran absent)
    await b(tel, X.ongletCercle);
    const inviter = tel.getByRole('button', { name: motif(X.inviter) });
    const r0 = await inviter.boundingBox();
    await inviter.click();
    const r1 = await inviter.boundingBox();
    const note = await bande.getByRole('status').textContent().catch(() => '');
    rapport.ok('(h) note « Pas dans l’essai. » : l’élément touché garde sa place', note === N.typographier(X.pasDansLEssai) && r0 && r1 && r0.x === r1.x && r0.y === r1.y, JSON.stringify([r0, r1, note]));
    await b(tel, X.ongletAujourdhui);
    // relance pendant la copie ouverte par « Copier mon carnet d'abord » : ni copie ni confirmation, l'écran d'où la confirmation a été ouverte
    await b(tel, X.ongletMoi);
    await tel.getByRole('button', { name: motif(X.reglagesNom) }).click();
    await b(tel, X.toutEffacer);
    await b(bande, X.copierCarnetDabord);
    const avantRelance = (await etatVue(page)).cadre;
    await page.reload(); await page.waitForFunction(() => window.ElenchosEssai !== undefined);
    const v2 = await etatVue(page);
    rapport.ok('(h) relance pendant la copie ouverte par « Copier mon carnet d’abord » : ni copie ni confirmation, Moi › Réglages',
      avantRelance && avantRelance.page === 'export' && !v2.cadre && v2.tel.ecran === 'reglages', JSON.stringify(v2));
    rapport.ok('(h) retours : aucune erreur de la page', env.journalErreurs.length === 0, env.journalErreurs.join(' ; '));
  } catch (e) {
    rapport.ok('(h) retours joués jusqu’au bout', false, e.message);
  } finally { await NAV.fermer(env); }
}

/** Largeur rendue d'une U+202F dans chaque face (§8.8 ; 14 h) : mesurée par le moteur de rendu. */
async function controleEspaceFine(o, rapport) {
  const env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
  try {
    await NAV.charger(env);
    for (const [famille, style, graisse, fichier] of V.FACES) {
      const r = await env.page.evaluate(async ([f, s, g]) => {
        const police = s + ' ' + g + ' 1000px "' + f + '"';
        await document.fonts.load(police, '\u202f');
        const c = document.createElement('canvas').getContext('2d');
        c.font = police;
        const fine = c.measureText('\u202f').width, espace = c.measureText(' ').width;
        c.font = s + ' ' + g + ' 1000px monospace';
        return { fine, espace, chargee: document.fonts.check(police, '\u202f'), secours: c.measureText('\u202f').width };
      }, [famille, style, graisse]);
      rapport.ok('(h) largeur rendue d’une U+202F, ' + fichier + ' : ' + V.CHASSES_202F[fichier] + ' millièmes attendus', r.chargee && Math.round(r.fine) === V.CHASSES_202F[fichier],
        'mesurée ' + r.fine.toFixed(2) + ' ; espace ' + r.espace.toFixed(2) + ' ; police de secours ' + r.secours.toFixed(2));
    }
  } finally { await NAV.fermer(env); }
}

/* ------------------------------------------------------------------ */
/* Rapport et commande                                                  */
/* ------------------------------------------------------------------ */

/** Rapport ; discret : sans aucun détail ni valeur (passe WebKit : « réussi » ou « échoué » et le chemin de chaque différence). */
function creerRapport(discret) {
  const lignes = [];
  let faux = 0;
  return {
    ok(quoi, juste, detail) {
      if (!juste) { faux++; }
      const l = (juste ? 'juste : ' : 'FAUX : ') + quoi + (detail && !juste && !discret ? ' — ' + detail : '');
      lignes.push(l); if (!discret || !juste) { process.stdout.write(l + '\n'); }
    },
    note(s) { lignes.push(s); process.stdout.write(s + '\n'); },
    get faux() { return faux; }, lignes
  };
}

async function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const { scelle } = lireScelle(a.scelle);
  const o = {
    navigateur: a.navigateur || 'chromium', icone: a.icone || ICONE_DEFAUT, pageTest: a['page-test'] || PAGE_TEST_DEFAUT, scelle, cheminScelle: a.scelle,
    construction: a.construction, construction2: a['construction-2'], construction3: a['construction-3'],
    porteur: porteurDe(a.construction), porteur2: a['construction-2'] ? porteurDe(a['construction-2']) : null, journaux: a.journaux, tailles: a.tailles || null
  };
  const points = (a.points || 'a,b,c,d,f,t,h,i').split(',');
  const r = creerRapport();
  r.note('Contrôle 14 sans tête : ' + o.navigateur + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + '), version du porteur ' + O.sha256Fichier(o.porteur));
  if (points.indexOf('a') >= 0 || points.indexOf('c') >= 0) { await controleHors(o, r); }
  if (points.indexOf('f') >= 0) { await controleCsp(o, r); }
  if (points.indexOf('b') >= 0) { await controleMemoire(o, r); }
  if (points.indexOf('d') >= 0) { await controleEffacer(o, r); }
  if (points.indexOf('t') >= 0) { await controleArrets(o, r); }
  if (points.indexOf('h') >= 0) { await controleEspaceFine(o, r); await controleRetours(o, r); }
  if (points.indexOf('h') >= 0 || points.indexOf('tailles') >= 0) { if (!a['sans-tailles']) { await controleMiseEnPage(o, r); } }
  if (points.indexOf('i') >= 0) { await require('./durees.js').controleDurees(o, r); }
  r.note(r.faux ? r.faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes.');
  if (a.sortie) { O.ecrireTexte(path.join(a.sortie, 'rapport-controle14-' + o.navigateur + '.txt'), r.lignes.join('\n') + '\n'); }
  process.exitCode = r.faux ? 1 : 0;
}

if (require.main === module) { main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; }); }

module.exports = { verifierTextes, verifierLignesListe, resumeErreur, sondePersistance, noterMemoire, verifierDisposition, verifierRevelation, verifierSousOnglets, verifierActions, pageAvecScelle, visibilite, memoire, poserCles, taillesH, creerRapport, controleHors, controleCsp, controleMemoire, controleEffacer,
  controleMiseEnPage, controleEspaceFine, controleRetours, controleArrets, lireScelle, porteurDe };
