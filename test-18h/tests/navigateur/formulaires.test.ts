// REPRIS pour le vrai jeu (proposé) : les vrais formulaires, soumis par un vrai navigateur (Chromium).
// Les tests HTTP posent leurs en-têtes eux-mêmes ; seul un navigateur montre ce qu'il envoie vraiment
// (par exemple « Origin: null » sous une mauvaise politique de référent). Exige NAVIGATEUR_CHEMIN ou le Chromium
// de l'environnement des agents ; ce test n'est jamais sauté.

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { chromium, type Browser } from 'playwright-core';
import { deriverCle, sceller } from '../../src/crypto.ts';
import { creerDepot } from '../../src/depot.ts';
import { horlogeSysteme } from '../../src/horloge.ts';
import { creerApplication } from '../../src/serveur.ts';
import { baseDeTest, CODE_ACCES, configDeTest, journalCapture } from '../aides/outils.ts';

const CHEMIN = process.env.NAVIGATEUR_CHEMIN ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let base: Awaited<ReturnType<typeof baseDeTest>>;
let navigateur: Browser;
let origine = '';
let fermer: () => Promise<void>;
const config = configDeTest();
const { journal } = journalCapture();

before(async () => {
  if (!existsSync(CHEMIN)) throw new Error(`Navigateur introuvable (${CHEMIN}) : réglez NAVIGATEUR_CHEMIN. Ce test n’est jamais sauté.`);
  base = await baseDeTest();
  const serveur = creerApplication({ config, pool: base.pool, journal, horloge: horlogeSysteme, planificateur: null });
  await new Promise<void>((r) => serveur.listen(0, () => r()));
  origine = `http://localhost:${(serveur.address() as AddressInfo).port}`;
  config.adressePublique = origine; // la page et le serveur parlent de la même origine
  fermer = () => new Promise<void>((r) => { serveur.closeAllConnections(); serveur.close(() => r()); });
  navigateur = await chromium.launch({ executablePath: CHEMIN });
});

after(async () => {
  await navigateur?.close();
  await fermer?.();
  await base?.fin();
});

test('le porteur entre sur la page de résultats par le vrai formulaire, puis en sort', async () => {
  const page = await navigateur.newPage();
  await page.goto(origine + '/resultats');
  await page.fill('#code', CODE_ACCES);
  await Promise.all([page.waitForLoadState('load'), page.click('button[type=submit]')]);
  assert.equal(await page.locator('h2', { hasText: 'Mesures' }).count(), 1, await page.content());
  await page.click('form[action="/resultats/sortie"] button');
  await page.waitForSelector('#code');
  await page.close();
});

test('un mauvais code d’accès donne une page lisible, pas une réponse technique', async () => {
  const page = await navigateur.newPage();
  await page.goto(origine + '/resultats');
  await page.fill('#code', 'mauvais-code-1234567');
  await page.click('button[type=submit]');
  await page.waitForSelector('text=Code refusé.');
  await page.close();
});

test('la déconnexion depuis la page des téléphones marche par le vrai formulaire', async () => {
  const numero = await creerDepot(base.pool).compte('google', 'f'.repeat(64), false);
  const cle = deriverCle(config.secretSession as Buffer, 'cookies');
  const contexte = await navigateur.newContext();
  await contexte.addCookies([{
    name: '__Host-session', value: sceller({ c: numero, f: 'google', e: Date.now() + 3_600_000 }, cle),
    domain: 'localhost', path: '/', secure: true, httpOnly: true, sameSite: 'Lax',
  }]);
  const page = await contexte.newPage();
  await page.goto(origine + '/');
  await page.waitForSelector('#etat-connexion:has-text("connecté avec Google")');
  assert.equal(await page.isVisible('#apple'), false, 'Apple caché hors du téléphone 1');
  await page.click('#form-sortie button');
  await page.waitForSelector('#etat-connexion:has-text("aucune")');
  await contexte.close();
});

test('page des téléphones dans Safari (hors de l’icône) : trois lignes, Apple caché, aide vers l’icône', async () => {
  const page = await navigateur.newPage();
  await page.goto(origine + '/');
  await page.waitForSelector('#etat-connexion:has-text("aucune")');
  assert.equal(await page.textContent('#etat-icone'), 'non');
  assert.equal(await page.isVisible('#apple'), false);
  assert.equal(await page.isVisible('#pret'), false);
  await page.click('#recevoir');
  await page.waitForSelector('text=Les messages n’arrivent que dans l’icône.');
  await page.close();
});
