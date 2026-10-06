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
      await new Promise(res => { const i = new Image(); i.onload = () => { r.image = 'passé'; res(); }; i.onerror = () => { r.image = 'refusé'; res(); }; i.src = 'https://ppcrepin.github.io/elenchos/essai/sonde.png'; });
      await new Promise(res => { const s = document.createElement('script'); s.onload = () => { r.script = 'passé'; res(); }; s.onerror = () => { r.script = 'refusé'; res(); }; s.src = 'https://ppcrepin.github.io/elenchos/essai/sonde.js'; document.head.appendChild(s); });
      await new Promise(res => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.onload = () => { r.style = 'passé'; res(); }; l.onerror = () => { r.style = 'refusé'; res(); }; l.href = 'https://ppcrepin.github.io/elenchos/essai/sonde.css'; document.head.appendChild(l); });
      try { const f = new FontFace('Sonde', 'url(https://ppcrepin.github.io/elenchos/essai/sonde.woff2)'); await f.load(); r.police = 'passé'; } catch (e) { r.police = 'refusé'; }
      await new Promise(res => { const fr = document.createElement('form'); fr.action = 'https://ppcrepin.github.io/elenchos/essai/sonde-form'; fr.method = 'post'; document.body.appendChild(fr); try { fr.submit(); } catch (e) { /* refusé */ } setTimeout(res, 300); });
      await new Promise(res => setTimeout(res, 300));
      r.violations = viol;
      return r;
    });
    const sorties = env.service.servies.slice(avant).concat(env.service.refusees);
    for (const k of ['fetch', 'image', 'script', 'style', 'police']) { rapport.ok('(f) requête « ' + k + ' » lancée depuis la page : refusée', essais[k] === 'refusé', essais[k]); }
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
  let env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.pageTest, icone: o.icone, profil, heure: jour0 });
  try {
    await NAV.charger(env);
    await env.page.waitForTimeout(500);
    const m = await memoire(env.page);
    rapport.ok('(b) la page-test a laissé sa clé dans la mémoire de l’origine', Object.keys(m).some(k => k.indexOf('elenchos-essai:sonde-icone') === 0), Object.keys(m).join(', '));
    // 2. la page de l'essai, sur cette mémoire : commence à l'entrée, n'en affiche rien
    env.service.servir(o.porteur);
    await NAV.charger(env);
    const t = await texteVisible(env.page);
    const v = await etatVue(env.page);
    rapport.ok('(b) sur la mémoire de la page-test, la page de l’essai commence à l’entrée', v && v.cadre && v.cadre.page === 'message0', JSON.stringify(v));
    rapport.ok('(b) … et n’affiche rien de la page-test', !/Ouvertures comptées|Repère|repère|Résultat/.test(t));
    const m2 = await memoire(env.page);
    rapport.ok('(b) … et ne touche pas sa clé', O.canonique(Object.keys(m2).filter(k => k.indexOf('sonde-icone') >= 0).map(k => [k, m2[k]])) === O.canonique(Object.keys(m).filter(k => k.indexOf('sonde-icone') >= 0).map(k => [k, m[k]])));
    // 3. un coup validé : la réponse au texte E1
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
  } finally { await NAV.fermer(env); }
  // 4. fermeture du navigateur, lendemain : la partie reprend à l'étape suivante
  env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone, profil, heure: jour0 + 86400000 });
  try {
    await NAV.charger(env);
    const e = await env.page.evaluate(() => window.ElenchosEssai.etat());
    rapport.ok('(b) navigateur fermé puis rouvert le lendemain : reprise à l’étape suivante (1.5, pari du texte 1)', e.vue.tel.ecran === '1.5' && e.vue.tel.E === 'E1' && e.seances[0].coups.entree.E1.reponse.niveau === 4, JSON.stringify(e.vue.tel));
  } finally { await NAV.fermer(env); }
  // 5. nouvelle publication (correctif) à la même adresse : reprise sans rejouer un coup
  env = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur2, icone: o.icone, profil, heure: jour0 + 2 * 86400000 });
  try {
    await NAV.charger(env);
    const e = await env.page.evaluate(() => window.ElenchosEssai.etat());
    rapport.ok('(b) correctif servi à la même adresse : la partie reprend à la même étape, coups gardés', e.vue.tel.ecran === '1.5' && e.seances[0].coups.entree.E1.reponse.niveau === 4 && (await env.page.evaluate(() => window.ElenchosEssai.version)) === versionDe(path.dirname(path.dirname(o.porteur2))));
  } finally { await NAV.fermer(env); }
  fs.rmSync(profil, { recursive: true, force: true });
  // 6. une clé de partie qui ne se lit pas : arrêt 1, repère M1, mémoire inchangée (§8.11)
  for (const [nom, brut] of [['texte abîmé', '{"format":1,"ecritures":3,"seances":[{"k":0'], ['numéro de format inconnu', '{"format":99,"ecritures":1,"seances":[]}']]) {
    const e2 = await NAV.ouvrir({ navigateur: o.navigateur, page: o.porteur, icone: o.icone });
    try {
      await poserCles(e2, { 'elenchos-essai:partie': brut });
      const avant = await memoire(e2.page);
      await NAV.charger(e2);
      const t = await texteVisible(e2.page);
      const repere = await e2.page.locator('.repere').textContent().catch(() => null);
      const apres = await memoire(e2.page);
      rapport.ok('(b) partie gardée illisible (' + nom + ') : arrêt 1, repère M1, sans « Rien n’est effacé »', repere === 'M1' && /La page s’est arrêtée par précaution/.test(t) && !/Rien n’est effacé/.test(t), String(repere));
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
    [600, 600], [601, 600], [320, 548]
  ];
  for (const nom of ['iPhone SE (3rd gen)', 'iPhone 13 Mini', 'iPhone 15', 'iPhone 15 Pro Max', 'iPad Mini', 'iPad (gen 11)', 'iPad Pro 11']) {
    const d = NAV.PW.devices[nom];
    const s = d.screen || d.viewport;
    t.push([s.width, s.height, nom], [s.height, s.width, nom + ' en largeur']);
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
  return Array.from(new Set(e));
}

async function controleMiseEnPage(o, rapport) {
  const journal = O.lireJson(path.join(o.journaux, 'b.journal.json'));
  const gestes = O.lireJson(path.join(o.journaux, 'b.gestes.json'));
  const constructions = { 1: porteurDe(o.construction), 2: porteurDe(o.construction2), 3: porteurDe(o.construction3 || o.construction2) };
  for (const [l, h, nom] of taillesH()) {
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
      jo.releverSiVoulu = async (geste) => {
        const m = await env.page.evaluate(RELEVE.mesurerDisposition);
        ecrans++;
        for (const x of verifierDisposition(m, { planche })) { (ecarts[x] = ecarts[x] || []).push('séance ' + jo.k + ', ' + geste); }
        return original(geste);
      };
      await jo.jouer(o.scelle);
      const liste = Object.keys(ecarts);
      rapport.ok('(h) ' + l + ' × ' + h + (nom ? ' (' + nom + ')' : '') + ' : ' + ecrans + ' écrans de la partie (b), disposition ' + (planche ? 'planche' : 'compacte'),
        liste.length === 0, liste.map(x => x + ' (' + ecarts[x].length + ' fois, d’abord ' + ecarts[x][0] + ')').join(' ; '));
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
      rapport.ok('(§8.11) vérification ' + repere + ' ratée : arrêt 1, repère ' + repere + ', rien d’écrit', r === repere && /La page s’est arrêtée par précaution/.test(t) && Object.keys(m).length === 0, String(r));
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
    porteur: porteurDe(a.construction), porteur2: a['construction-2'] ? porteurDe(a['construction-2']) : null, journaux: a.journaux
  };
  const points = (a.points || 'a,b,c,d,f,t,h,i').split(',');
  const r = creerRapport();
  r.note('Contrôle 14 sans tête : ' + o.navigateur + ' (Playwright ' + NAV.VERSION_PLAYWRIGHT + '), version du porteur ' + O.sha256Fichier(o.porteur));
  if (points.indexOf('a') >= 0 || points.indexOf('c') >= 0) { await controleHors(o, r); }
  if (points.indexOf('f') >= 0) { await controleCsp(o, r); }
  if (points.indexOf('b') >= 0) { await controleMemoire(o, r); }
  if (points.indexOf('d') >= 0) { await controleEffacer(o, r); }
  if (points.indexOf('t') >= 0) { await controleArrets(o, r); }
  if (points.indexOf('h') >= 0) { await controleEspaceFine(o, r); await controleRetours(o, r); if (!a['sans-tailles']) { await controleMiseEnPage(o, r); } }
  if (points.indexOf('i') >= 0) { await require('./durees.js').controleDurees(o, r); }
  r.note(r.faux ? r.faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes.');
  if (a.sortie) { O.ecrireTexte(path.join(a.sortie, 'rapport-controle14-' + o.navigateur + '.txt'), r.lignes.join('\n') + '\n'); }
  process.exitCode = r.faux ? 1 : 0;
}

if (require.main === module) { main().catch(e => { process.stderr.write((e && e.stack) || String(e)); process.stderr.write('\n'); process.exitCode = 2; }); }

module.exports = { verifierDisposition, visibilite, memoire, poserCles, taillesH, creerRapport, controleHors, controleCsp, controleMemoire, controleEffacer,
  controleMiseEnPage, controleEspaceFine, controleRetours, controleArrets, lireScelle, porteurDe };
