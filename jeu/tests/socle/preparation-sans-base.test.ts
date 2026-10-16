// Le mode préparation (src/serveur/preparation.ts ; CONTRAT.md, 2.17), sans base et sans lancer de processus :
// - quand il s'ouvre (config.ts) : les trois clés absentes, et rien d'autre qui empêche de démarrer ; jamais avec une
//   ou deux clés, une clé illisible ou deux clés égales ;
// - ce que sert le petit serveur : `/preparer` et ses deux fichiers ; 503 et un corps neutre partout ailleurs ;
// - la page : aucune adresse extérieure, aucun échange, rien de gardé ;
// - les clés que tire le script de la page, exécuté dans Node avec crypto.getRandomValues, sont acceptées par
//   config.ts et distinctes.
// Le démarrage du vrai processus est vérifié à part (preparation-demarrage.test.ts).

import assert from 'node:assert/strict';
import { randomBytes, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import vm from 'node:vm';
import { CLES_DU_SERVEUR, lireConfig } from '../../src/serveur/config.ts';
import { b64url } from '../../src/serveur/crypto.ts';
import {
  CORPS_INDISPONIBLE, creerServeurPreparation, CSP_PREPARATION, DOSSIER_PAGES, FICHIERS_PREPARATION,
} from '../../src/serveur/preparation.ts';
import { envDeTest } from './aides-serveur.ts';

const SANS_CLES = { SECRET_SESSION: undefined, CLE_REPONSES: undefined, CLE_IDENTITES: undefined };
const EN_LIGNE = { CONTAINER: 'web-1', DATABASE_URL: undefined, SCALINGO_POSTGRESQL_URL: 'postgresql://inutile@127.0.0.1:1/inutile' };

// --- Quand le mode préparation s'ouvre ----------------------------------------------------------------------------

test('les trois clés absentes, et rien d’autre qui manque : mode préparation, en local comme en ligne', () => {
  for (const env of [envDeTest(SANS_CLES), envDeTest({ SECRET_SESSION: '', CLE_REPONSES: ' ', CLE_IDENTITES: '' }),
    envDeTest({ ...SANS_CLES, ...EN_LIGNE })]) {
    const c = lireConfig(env);
    assert.equal(c.preparation, true);
    assert.equal(c.peutDemarrer, false);
    for (const nom of CLES_DU_SERVEUR) assert.ok(c.manquants.includes(nom), nom);
  }
  // Les trois clés en place : le jeu, jamais la préparation.
  const complet = lireConfig(envDeTest());
  assert.equal(complet.preparation, false);
  assert.equal(complet.peutDemarrer, true);
});

test('une ou deux clés seulement : refus de démarrer, jamais la préparation (une erreur de saisie)', () => {
  const valeur = () => b64url(randomBytes(32));
  for (let masque = 1; masque < 7; masque++) {
    const presentes = CLES_DU_SERVEUR.filter((_, i) => (masque >> i) & 1);
    const env = envDeTest(Object.fromEntries(CLES_DU_SERVEUR.map((nom) => [nom, presentes.includes(nom) ? valeur() : undefined])));
    const c = lireConfig(env);
    assert.equal(c.preparation, false, presentes.join('+'));
    assert.equal(c.peutDemarrer, false, presentes.join('+'));
    for (const nom of CLES_DU_SERVEUR) if (!presentes.includes(nom)) assert.ok(c.manquants.includes(nom), nom);
  }
});

test('une clé illisible, ou deux clés égales : refus de démarrer, jamais la préparation', () => {
  const une = b64url(randomBytes(32));
  const cas: Record<string, string | undefined>[] = [
    // Une seule clé, mal copiée (trop courte, ou avec des signes que base64url n'a pas) ; les deux autres absentes.
    { ...SANS_CLES, CLE_REPONSES: une.slice(0, 40) },
    { ...SANS_CLES, SECRET_SESSION: 'pas+du+base64url/du-tout-pas-du-tout-pas-du-tout' },
    // Deux clés égales, la troisième présente ou absente.
    { CLE_REPONSES: une, CLE_IDENTITES: une },
    { SECRET_SESSION: une, CLE_IDENTITES: une },
    { SECRET_SESSION: une, CLE_REPONSES: une },
    { SECRET_SESSION: undefined, CLE_REPONSES: une, CLE_IDENTITES: une },
    { SECRET_SESSION: une, CLE_REPONSES: une, CLE_IDENTITES: une },
  ];
  for (const complements of cas) {
    const c = lireConfig(envDeTest(complements));
    assert.equal(c.preparation, false, JSON.stringify(Object.keys(complements)));
    assert.equal(c.peutDemarrer, false);
    assert.ok(!JSON.stringify([c.manquants, c.refuses]).includes(une));
  }
});

test('les trois clés absentes, mais autre chose empêche de démarrer : refus, pas de préparation', () => {
  const cas: Record<string, string | undefined>[] = [
    { ...SANS_CLES, DATABASE_URL: undefined }, // pas de base
    { ...SANS_CLES, ...EN_LIGNE, FIN_DU_TEST: undefined }, // en ligne sans fin du test
    { ...SANS_CLES, ...EN_LIGNE, ADRESSE_PUBLIQUE: undefined }, // en ligne sans adresse
    { ...SANS_CLES, ...EN_LIGNE, ADRESSE_PUBLIQUE: 'http://elenchos.exemple.invalid' }, // en ligne sans https
    { ...SANS_CLES, ...EN_LIGNE, HORLOGE_VITESSE: '168' }, // un réglage dangereux en ligne
    { ...SANS_CLES, MODE_ROLES: 'aucun' }, // une valeur inconnue
  ];
  for (const complements of cas) {
    const c = lireConfig(envDeTest(complements));
    assert.equal(c.preparation, false, JSON.stringify(complements));
    assert.equal(c.peutDemarrer, false, JSON.stringify(complements));
  }
});

// --- Ce que sert le petit serveur ---------------------------------------------------------------------------------

type Recu = { statut: number; entetes: http.IncomingHttpHeaders; texte: string };

function demande(port: number, methode: string, chemin: string, entetes: Record<string, string> = {}, corps?: string): Promise<Recu> {
  return new Promise((resoudre, rejeter) => {
    const req = http.request({ host: '127.0.0.1', port, method: methode, path: chemin, headers: entetes }, (res) => {
      const morceaux: Buffer[] = [];
      res.on('data', (m: Buffer) => morceaux.push(m));
      res.on('end', () => resoudre({ statut: res.statusCode ?? 0, entetes: res.headers, texte: Buffer.concat(morceaux).toString('utf8') }));
    });
    req.on('error', rejeter);
    if (corps !== undefined) req.write(corps);
    req.end();
  });
}

const ADRESSE = 'https://elenchos.exemple.invalid';
let local: http.Server;
let enLigne: http.Server;
let portLocal = 0;
let portEnLigne = 0;
before(async () => {
  local = creerServeurPreparation({ enLigne: false, adressePublique: ADRESSE });
  enLigne = creerServeurPreparation({ enLigne: true, adressePublique: ADRESSE });
  await new Promise<void>((r) => local.listen(0, '127.0.0.1', r));
  await new Promise<void>((r) => enLigne.listen(0, '127.0.0.1', r));
  portLocal = (local.address() as AddressInfo).port;
  portEnLigne = (enLigne.address() as AddressInfo).port;
});
after(() => {
  local?.closeAllConnections();
  enLigne?.closeAllConnections();
  local?.close();
  enLigne?.close();
});

test('/preparer et ses deux fichiers sont servis, sans cache, avec la règle de chargement stricte', async () => {
  for (const [chemin, f] of Object.entries(FICHIERS_PREPARATION)) {
    const r = await demande(portLocal, 'GET', chemin);
    assert.equal(r.statut, 200, chemin);
    assert.equal(r.entetes['content-type'], f.type);
    assert.equal(r.entetes['cache-control'], 'no-store');
    assert.equal(r.entetes['x-content-type-options'], 'nosniff');
    assert.equal(r.entetes['referrer-policy'], 'no-referrer');
    assert.equal(r.entetes['content-security-policy'], CSP_PREPARATION);
    assert.equal(r.entetes['set-cookie'], undefined);
    assert.equal(r.texte, readFileSync(join(DOSSIER_PAGES, f.fichier), 'utf8'));
  }
  const csp = CSP_PREPARATION.split('; ');
  for (const regle of ["default-src 'none'", "script-src 'self'", "style-src 'self'", "connect-src 'none'", "form-action 'none'",
    "frame-ancestors 'none'", "base-uri 'none'"]) assert.ok(csp.includes(regle), regle);
  assert.ok(!/unsafe|\*|https?:|data:|blob:/.test(CSP_PREPARATION));
  // Ce qui suit « ? » n'est jamais lu (P-08) ; HEAD rend les en-têtes sans corps.
  assert.equal((await demande(portLocal, 'GET', '/preparer?x=1')).statut, 200);
  const tete = await demande(portLocal, 'HEAD', '/preparer');
  assert.equal(tete.statut, 200);
  assert.equal(tete.texte, '');
});

test('tout le reste répond 503, avec le même corps neutre, sans aucune valeur', async () => {
  const autres: [string, string, Record<string, string>?, string?][] = [
    ['GET', '/'], ['GET', '/api/etat'], ['GET', '/api/etat', { origin: 'capacitor://localhost' }],
    ['OPTIONS', '/api/etat', { origin: 'capacitor://localhost', 'access-control-request-method': 'GET' }],
    ['POST', '/api/connexion/apple', { origin: 'capacitor://localhost', 'content-type': 'application/json' }, '{"jeton":"x"}'],
    ['POST', '/api/recu', { 'content-type': 'application/json' }, '{"envoi":"abc"}'],
    ['POST', '/dev/connexion', {}, '{}'], ['GET', '/invitation'], ['GET', '/confidentialite'],
    ['GET', '/.well-known/apple-app-site-association'], ['GET', '/favicon.ico'], ['GET', '/preparer/'],
    ['GET', '/preparer.html'], ['GET', '/PREPARER'], ['GET', '/../src/serveur/config.ts'], ['GET', '/pages/preparer.js'],
    ['POST', '/preparer', { 'content-type': 'application/x-www-form-urlencoded' }, 'a=b'], ['PUT', '/preparer.js'],
    ['DELETE', '/preparer'],
  ];
  for (const [methode, chemin, entetes, corps] of autres) {
    const r = await demande(portLocal, methode, chemin, entetes, corps);
    assert.equal(r.statut, 503, `${methode} ${chemin}`);
    assert.equal(r.texte, CORPS_INDISPONIBLE, `${methode} ${chemin}`);
    assert.equal(r.entetes['content-type'], 'text/plain; charset=utf-8');
    assert.equal(r.entetes['cache-control'], 'no-store');
    assert.equal(r.entetes['access-control-allow-origin'], undefined);
    assert.equal(r.entetes['set-cookie'], undefined);
  }
  // Le corps ne dit rien : ni le mode, ni un nom de réglage, ni une adresse.
  assert.ok(!/prepar|cle|secret|scalingo|elenchos|https?:|[A-Z]{2,}_/i.test(CORPS_INDISPONIBLE));
});

test('en ligne : la page n’est servie qu’en https ; en http, renvoi vers l’adresse publique, jamais vers l’hôte demandé', async () => {
  const https = await demande(portEnLigne, 'GET', '/preparer', { 'x-forwarded-proto': 'https' });
  assert.equal(https.statut, 200);
  assert.equal(https.entetes['strict-transport-security'], 'max-age=31536000');
  const http1 = await demande(portEnLigne, 'GET', '/preparer', { host: 'ailleurs.exemple.invalid' });
  assert.equal(http1.statut, 308);
  assert.equal(http1.entetes.location, `${ADRESSE}/preparer`);
  assert.equal(http1.texte, '');
  const autre = await demande(portEnLigne, 'GET', '/api/etat');
  assert.equal(autre.statut, 503);
  assert.equal(autre.texte, CORPS_INDISPONIBLE);
});

// --- La page --------------------------------------------------------------------------------------------------------

const PAGE = {
  html: readFileSync(join(DOSSIER_PAGES, 'preparer.html'), 'utf8'),
  js: readFileSync(join(DOSSIER_PAGES, 'preparer.js'), 'utf8'),
  css: readFileSync(join(DOSSIER_PAGES, 'preparer.css'), 'utf8'),
};

test('la page ne contient aucune adresse extérieure, ne charge que ses deux fichiers, n’envoie et ne garde rien', () => {
  for (const [nom, texte] of Object.entries(PAGE)) {
    assert.ok(!/https?:\/\//i.test(texte), `${nom} : adresse en dur`);
    assert.ok(!/(src|href|action)\s*=\s*["']?\/\//i.test(texte), `${nom} : adresse sans protocole`);
    assert.ok(!/@import|url\(/i.test(texte), `${nom} : chargement depuis la feuille de style`);
  }
  // Les seuls fichiers chargés par la page sont les deux qu'elle sert, à la racine du site.
  const charges = [...PAGE.html.matchAll(/\b(?:src|href)\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(charges.sort(), ['/preparer.css', '/preparer.js']);
  for (const c of charges) assert.ok(c !== undefined && c in FICHIERS_PREPARATION, c);
  // Rien en ligne que la règle de chargement bloquerait (sans quoi la page serait muette) : ni script, ni style, ni
  // gestionnaire d'événement écrits dans la page.
  assert.ok(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(PAGE.html));
  assert.ok(!/<style|\sstyle\s*=|\son[a-z]+\s*=/i.test(PAGE.html));
  assert.ok(!/<form|<iframe|<img|<link(?![^>]*rel="stylesheet")/i.test(PAGE.html));
  // Aucun échange, aucun stockage dans le script.
  assert.ok(!/fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|cookie|import\(|postMessage|window\.open|location/.test(PAGE.js));
  // Chaque élément que cherche le script existe dans la page.
  for (const m of PAGE.js.matchAll(/element\('([a-z-]+)'\)/g)) assert.ok(PAGE.html.includes(`id="${m[1]}"`), m[1]);
  // Les mots : pour le porteur (« vous »), à quoi servent les clés, ne jamais les envoyer.
  assert.match(PAGE.html, /ne les envoyez jamais à personne/);
  assert.match(PAGE.html, /n’envoie rien/);
  assert.ok(!/\btu\b|\bton\b|\bta\b|\btes\b/i.test(PAGE.html.replace(/<!--[\s\S]*?-->/g, '')));
});

// --- Le script de la page, exécuté dans Node --------------------------------------------------------------------

type Element = { textContent: string; hidden: boolean; disabled: boolean; ecouteurs: Map<string, () => unknown> };

/** Exécute le script de la page dans un contexte neuf, avec un faux document et le hasard de Node ; rend de quoi
 *  toucher les boutons et lire ce que la page montre. */
function chargerPage(getRandomValues: (t: Uint8Array) => Uint8Array = (t) => webcrypto.getRandomValues(t)) {
  const elements = new Map<string, Element>();
  for (const m of PAGE.html.matchAll(/id="([a-z-]+)"/g)) {
    const id = m[1]!;
    elements.set(id, {
      textContent: '', hidden: PAGE.html.includes(`id="${id}" hidden`), disabled: false, ecouteurs: new Map(),
    });
  }
  const objet = (e: Element) => ({
    get textContent() { return e.textContent; }, set textContent(v: string) { e.textContent = v; },
    get hidden() { return e.hidden; }, set hidden(v: boolean) { e.hidden = v; },
    get disabled() { return e.disabled; }, set disabled(v: boolean) { e.disabled = v; },
    addEventListener(type: string, f: () => unknown) { e.ecouteurs.set(type, f); },
  });
  const presse: string[] = [];
  let octetsTires = 0;
  const contexte = vm.createContext({
    document: { getElementById: (id: string) => (elements.has(id) ? objet(elements.get(id)!) : null) },
    crypto: { getRandomValues: (t: Uint8Array) => { octetsTires += t.length; return getRandomValues(t); } },
    btoa,
    navigator: { clipboard: { writeText: async (t: string) => { presse.push(t); } } },
  });
  vm.runInContext(PAGE.js, contexte, { filename: 'preparer.js' });
  const el = (id: string) => elements.get(id)!;
  return {
    el,
    async toucher(id: string) {
      if (el(id).disabled) return; // un bouton désactivé ne reçoit pas le toucher
      await el(id).ecouteurs.get('click')?.();
    },
    presse,
    octetsTires: () => octetsTires,
  };
}

test('les clés tirées par la page sont acceptées par config.ts, distinctes, et montrées une seule fois', async () => {
  const toutes = new Set<string>();
  for (let chargement = 0; chargement < 200; chargement++) {
    const page = chargerPage();
    assert.equal(page.el('resultat').hidden, true);
    await page.toucher('tirer');
    const texte = page.el('lignes').textContent;
    assert.equal(page.el('resultat').hidden, false);
    assert.equal(page.el('tirer').disabled, true);
    assert.equal(page.octetsTires(), 96); // trois fois 32 octets, tous par crypto.getRandomValues

    const lignes = texte.split('\n');
    assert.deepEqual(lignes.map((l) => l.split('=')[0]), [...CLES_DU_SERVEUR]);
    const valeurs = lignes.map((l) => l.slice(l.indexOf('=') + 1));
    for (const v of valeurs) {
      assert.match(v, /^[A-Za-z0-9_-]{43}$/);
      assert.equal(Buffer.from(v, 'base64url').length, 32);
      assert.equal(b64url(Buffer.from(v, 'base64url')), v); // écriture canonique
    }
    assert.equal(new Set(valeurs).size, 3);
    for (const v of valeurs) toutes.add(v);

    // config.ts accepte les trois lignes telles quelles : le jeu peut démarrer, rien ne manque des trois clés.
    const env = envDeTest(Object.fromEntries(lignes.map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])));
    const c = lireConfig(env);
    assert.equal(c.peutDemarrer, true);
    assert.equal(c.preparation, false);
    for (const nom of CLES_DU_SERVEUR) assert.ok(!c.manquants.includes(nom), nom);

    // Un seul tirage par chargement : un second toucher ne change rien.
    await page.toucher('tirer');
    assert.equal(page.el('lignes').textContent, texte);
    // Le bouton de copie met exactement les trois lignes dans le presse-papiers.
    await page.toucher('copier');
    assert.deepEqual(page.presse, [texte]);
    assert.equal(page.el('copier').textContent, 'Copié');
  }
  assert.equal(toutes.size, 600);
});

test('un hasard en panne (toujours la même valeur) ne montre aucune clé, et ne bloque pas la page', async () => {
  const page = chargerPage((t) => t.fill(7));
  await assert.rejects(page.toucher('tirer'), /tirage impossible/);
  assert.equal(page.el('resultat').hidden, true);
  assert.equal(page.el('lignes').textContent, '');
});
