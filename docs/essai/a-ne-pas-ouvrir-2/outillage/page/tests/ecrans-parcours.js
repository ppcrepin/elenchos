/* Parcours des écrans du second essai dans un navigateur (lots 4 et 5, instance B ; outillage d'essai).
 *
 *   node tests/ecrans-parcours.js PAGE_TEMOIN.html [DOSSIER_CAPTURES]
 *
 * La page (version témoin construite par construire.py sur le fichier scellé de
 * test) est servie à l'adresse de l'essai, dans Chromium sans tête, profil
 * iPhone 15, en mode app (navigator.standalone), comme le harnais du premier
 * essai : toute autre requête est refusée et consignée. Le script joue par les
 * seuls touchers (data-action), jamais par le point d'accès, et vérifie :
 *   A. une partie entière : entrée, trois jours, premier saut (avec « Annuler »),
 *      dimanche (titres, questions, copie du carnet), second saut, second
 *      dimanche, clôture, questions de fin, carnet, dévoilement, « Tout effacer » ;
 *      la croix et « Reprendre / Revoir la révélation » ; Le Cercle, un proche,
 *      Moi, l'Historique, une fiche ; un abandon de journée avec des visages posés ;
 *      un rechargement au milieu d'un rattrapage ;
 *   B. un arrêt pendant le premier saut, après un rechargement ;
 *   C. la page de la partie du premier essai (clé repérée par la liste seule) ;
 *   D. le refus du pseudo (prénom, rond).
 * À chaque étape : aucune erreur de script, aucune requête sortante, journal
 * valide (ElenchosJournal.valider, règles 1 à 15, partie en cours ou finie),
 * et des textes attendus à l'écran. Rien n'est publié.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ICI = path.join(__dirname, '..');
const N = require('../noyau.js');
const C = require('../calendrier.js');
const J = require('../journal.js');
const M = require('../moteur.js');

const PW = require(process.env.ELENCHOS_PLAYWRIGHT || '/opt/node-tools/node_modules/playwright-core');
const ADRESSE = 'https://ppcrepin.github.io/elenchos/essai/';
const PAGE = process.argv[2];
const APPAREIL_MOT = /iPad/.test(process.env.ELENCHOS_APPAREIL || '') ? 'iPad' : 'iPhone';
const CAPTURES = process.argv[3] || null;
if (!PAGE) { console.error('usage : node tests/ecrans-parcours.js PAGE_TEMOIN.html [DOSSIER_CAPTURES]'); process.exit(2); }
if (CAPTURES) { fs.mkdirSync(CAPTURES, { recursive: true }); }

// Le fichier scellé embarqué, relu depuis la page (repère du contrôle 1).
const html = fs.readFileSync(PAGE, 'utf8');
const b64 = /\/\*elenchos-scelle\*\/"([A-Za-z0-9+/=]+)"/.exec(html)[1];
const octets = N.base64Decoder(b64);
const SCELLE = JSON.parse(N.utf8Decoder(octets));
const EMPREINTE = N.sha256(octets);
const cal = C.lire(SCELLE);
const arrivee = M.histoire(SCELLE, cal);
const cartes = M.cartesServies(SCELLE, cal, arrivee);

let nCaptures = 0;
/** Comparaison de textes : espaces insécables, apostrophe et capitales (étiquettes en capitales par le style) ramenées. */
function normaliser(x) { return x.replace(/[\u00a0\u202f]/g, ' ').replace(/\u2019/g, "'").toLowerCase(); }
const bilan = [];
function noter(s) { bilan.push(s); console.log('  ' + s); }

async function ouvrir(navigateur, options) {
  const o = options || {};
  // Appareil : iPhone 15 par défaut ; ELENCHOS_APPAREIL (nom de la liste de Playwright), ELENCHOS_LARGEUR et ELENCHOS_HAUTEUR
  // (par exemple 320 × 548, l'iPhone SE en affichage agrandi), ELENCHOS_SOMBRE=1 pour le mode sombre.
  const reglages = Object.assign({}, PW.devices[process.env.ELENCHOS_APPAREIL || 'iPhone 15'], { locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  if (process.env.ELENCHOS_LARGEUR) { reglages.viewport = { width: +process.env.ELENCHOS_LARGEUR, height: +process.env.ELENCHOS_HAUTEUR }; }
  if (process.env.ELENCHOS_SOMBRE) { reglages.colorScheme = 'dark'; }
  const ctx = o.contexte || await navigateur.newContext(reglages);
  if (!o.contexte) {
    await ctx.addInitScript(`Object.defineProperty(Navigator.prototype, 'standalone', { configurable: true, get: function () { return true; } });`);
    if (o.avant) { await ctx.addInitScript(o.avant); }
  }
  const refusees = [], erreurs = [];
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (route.request().method() === 'GET' && u === ADRESSE) { return route.fulfill({ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' }, body: html }); }
    refusees.push(u);
    return route.abort('blockedbyclient');
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => erreurs.push(String(e && e.stack || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/apple-touch-icon|ERR_BLOCKED_BY_CLIENT/.test(m.text())) { erreurs.push('console : ' + m.text()); } });
  await page.goto(ADRESSE);
  return { ctx, page, refusees, erreurs };
}

function joueur(s, nom) {
  const page = s.page;
  async function sansErreur(ou) {
    if (s.erreurs.length) { throw new Error(nom + ', ' + ou + ' : erreur de la page\n' + s.erreurs.join('\n')); }
    const hors = s.refusees.filter((u) => !/apple-touch-icon\.png$/.test(u));
    if (hors.length) { throw new Error(nom + ', ' + ou + ' : requête sortante ' + hors.join(', ')); }
  }
  async function toucher(action, attrs) {
    let sel = '[data-action="' + action + '"]';
    Object.keys(attrs || {}).forEach((k) => { sel += '[data-' + k + '="' + attrs[k] + '"]'; });
    // Le voile d'une feuille porte la même action que son « ← Retour » : on touche le bouton de la feuille.
    const l = action === 'feuille-fermer' ? page.locator('.feuille ' + sel + ':visible').first() : page.locator(sel + ':visible').first();
    await l.waitFor({ state: 'visible', timeout: 4000 }).catch(() => { throw new Error(nom + ' : rien à toucher pour ' + sel + '\n--- écran ---\n' + '(voir capture)'); });
    await l.click();
    await page.waitForTimeout(action === 'retourner' ? 520 : 20);
    await sansErreur(action);
  }
  async function existe(action, attrs) {
    let sel = '[data-action="' + action + '"]';
    Object.keys(attrs || {}).forEach((k) => { sel += '[data-' + k + '="' + attrs[k] + '"]'; });
    return (await page.locator(sel + ':visible').count()) > 0;
  }
  async function texte() { return page.evaluate(() => document.body.innerText); }
  async function voit(s2) { const t = await texte(); const n = normaliser; if (!n(t).includes(n(s2))) { throw new Error(nom + ' : texte attendu absent : « ' + s2 + ' »\n--- écran ---\n' + t.slice(0, 2500)); } }
  async function nevoitpas(s2) { const t = await texte(); const n = normaliser; if (n(t).includes(n(s2))) { throw new Error(nom + ' : texte inattendu : « ' + s2 + ' »'); } }
  async function etat() { return page.evaluate(() => window.ElenchosEssai.etat()); }
  async function capture(etiquette) {
    if (!CAPTURES) { return; }
    nCaptures++;
    await page.screenshot({ path: path.join(CAPTURES, String(nCaptures).padStart(3, '0') + '-' + nom + '-' + etiquette + '.png') });
  }
  async function journalValide(enCours) {
    const j = await page.evaluate(() => window.ElenchosEssai.journal());
    const e = J.valider(SCELLE, cal, j, { empreinte: EMPREINTE, cartes: cartes, enCours: enCours });
    if (e.length) { throw new Error(nom + ' : journal refusé\n' + e.join('\n')); }
    return j;
  }
  async function taper(x) { await page.locator('#champ-pseudo').fill(x); await page.waitForTimeout(20); await sansErreur('saisie'); }
  return { page, toucher, existe, texte, voit, nevoitpas, etat, capture, journalValide, taper, sansErreur };
}

/* ------------------------------------------------------------------ */
/* Morceaux de partie                                                 */
/* ------------------------------------------------------------------ */

async function debut(P) {
  await P.voit('Vos réponses restent dans votre ' + APPAREIL_MOT + '.');
  await P.voit('Début');
  await P.capture('message0');
  await P.toucher('message0-continuer');
  await P.voit('Le cercle Amis joue depuis trois mois');
  await P.voit('environ six fois plus vite');
  await P.capture('arrivee');
  await P.toucher('commencer');
  await P.voit('Valentin te lance un défi');
  await P.voit('Jour 1 · lundi');
}

async function entree(P, pseudo, voie) {
  await P.toucher('apercu');
  for (let i = 0; i < 3; i++) {
    await P.voit('Défi de Valentin · Texte ' + (i + 1) + ' sur 3');
    await P.toucher('entree-position', { valeur: String(1 + (i * 2) % 5) });
    if (i === 0) { await P.voit('Avant ta première réponse'); await P.toucher('consentement-accepter'); }
    await P.toucher('entree-suivant');
    await P.toucher('entree-raison', { valeur: i === 2 ? 'aucune' : String(i + 1) });
    await P.toucher('entree-valider-raison');
    await P.voit('Et Valentin ? Sa réponse ?');
    await P.toucher('entree-pari', { valeur: String(5 - i) });
    await P.toucher('entree-voir');
    await P.voit("L'Assemblée :");
    if (i === 0) { await P.capture('1.6'); }
    await P.toucher('entree-texte-suivant');
  }
  await P.voit('Ton portrait commence');
  await P.voit('environ six fois plus vite');
  await P.capture('1.7');
  await P.toucher('creer-compte');
  await P.voit('Pour que Valentin sache que c');
  await P.voit('Compte simulé');
  await P.capture('1.8');
  await P.taper(pseudo);
  if (voie === 'email') {
    await P.toucher('compte-email');
    await P.voit('Tu recevras un code à six chiffres.');
    await P.capture('1.8b');
    await P.toucher('recevoir-code');
    await P.voit('Code envoyé à toi@exemple.fr');
    await P.toucher('code-valider');
  } else {
    await P.toucher(voie === 'apple' ? 'compte-apple' : 'compte-google');
    await P.voit(voie === 'apple' ? 'Dans le jeu, Apple vous demanderait' : 'Dans le jeu, Google vous demanderait');
  }
}

/** Deviner : un visage différent par carte, la raison cachée tentée ; renvoie le nombre de cartes. */
async function deviner(P, options) {
  const o = options || {};
  await P.voit('À qui sont ces réponses ?');
  await P.voit('Un proche par réponse, chacun une fois.');
  const e = await P.etat();
  const k = Math.max(...Object.keys(e.jours).map(Number));
  const n = e.jours[String(k)].coups.deviner.cartes.length;
  const visages = ['Agathe', 'Nassim', 'Odile', 'Valentin'];
  if (o.relire) { await P.toucher('relire'); await P.toucher('feuille-fermer'); }
  const jusqua = o.jusqua === undefined ? n : o.jusqua;
  for (let i = 0; i < jusqua; i++) {
    if (await P.existe('devine-pourquoi', { carte: String(i) }) && o.raisonAvant) {
      await P.toucher('devine-pourquoi', { carte: String(i) });
      await P.toucher('feuille-raison', { valeur: 'aucune' });
      await P.toucher('feuille-choisir');
    }
    if (o.passer && i === n - 1) { await P.toucher('passer', { carte: String(i) }); continue; }
    await P.toucher('visage', { carte: String(i), membre: visages[(i + (o.decalage || 0)) % 4] });
    if (await P.existe('devine-pourquoi', { carte: String(i) }) && !o.raisonAvant) {
      await P.toucher('devine-pourquoi', { carte: String(i) });
      await P.toucher('feuille-raison', { valeur: '1' });
      await P.toucher('feuille-choisir');
      await P.voit('Ta devinette');
    }
  }
  if (o.capture) { await P.capture(o.capture); }
  if (jusqua === n) { await P.toucher('deviner-valider'); }
  return n;
}

async function repondre(P, niveau, raison, actionPos, actionSuivant, actionRaison, actionValider) {
  await P.toucher(actionPos || 'jour-position', { valeur: String(niveau) });
  await P.toucher(actionSuivant || 'jour-suivant-raison');
  await P.voit("Qu'est-ce qui a le plus pesé ?");
  await P.toucher(actionRaison || 'jour-raison', { valeur: String(raison) });
  await P.toucher(actionValider || 'jour-valider-raison');
  await P.voit('Ta phrase du jour');
}

async function carnetDuJour(P, dimanche, premierDimanche) {
  await P.voit('Votre carnet du jour');
  await P.toucher('carnet-q', { q: 'moment', valeur: 'aucun' });
  if (dimanche) {
    if (premierDimanche) { await P.voit('pendant le saut, c'); await P.toucher('carnet-q', { q: 'saut_clair', valeur: 'oui' }); }
    await P.toucher('carnet-hesite', { valeur: 'deviner' });
    await P.toucher('carnet-hesite', { valeur: 'saut' });
    await P.toucher('carnet-q', { q: 'moment_semaine', valeur: 'portrait' });
  }
}

/** La révélation jusqu'au bout : chaque carte retournée, puis « Suivant » jusqu'à « Jouer » (ou la fin à la clôture). */
async function revelation(P, jour, options) {
  const o = options || {};
  for (let pas = 0; pas < 30; pas++) {
    if (await P.existe('retourner')) { await P.toucher('retourner'); continue; }
    const t = normaliser(await P.texte());
    if (t.includes("et l'assemblée ?") && o.captureVote) {
      await P.capture('2.7d-j' + jour); o.captureVote = false;
      if (process.env.ELENCHOS_DEBUG) { console.log(await P.page.evaluate(() => { const e = document.querySelector('.escalier'); return e ? e.outerHTML + '\n' + Array.from(e.children).map((x) => x.className + ' ' + JSON.stringify(x.getBoundingClientRect())).join('\n') : 'pas d\'escalier'; })); }
    }
    if (t.includes('pour toi, cette semaine') && o.capturePhrase) { await P.capture('3.3e-j' + jour); o.capturePhrase = false; }
    if (t.includes('les titres de la semaine') && o.captureTitre) { await P.capture('3.3-j' + jour); o.captureTitre = false; }
    if (await P.existe('rev-jouer')) { return; }
    if (await P.existe('rev-suivant')) { await P.toucher('rev-suivant'); continue; }
    if (await P.existe('rev-fin-cloture')) { return; }
    throw new Error('révélation du jour ' + jour + ' : ni carte, ni « Suivant », ni « Jouer »');
  }
  throw new Error('révélation trop longue');
}

async function saut(P, numero, total, options) {
  const o = options || {};
  await P.toucher('notification');
  await revelation(P, numero === 1 ? 4 : 8);
  await P.voit("Et maintenant, la question d'aujourd'hui.");
  await P.voit('Avancer au dimanche');
  await P.nevoitpas('Abandonner cette journée');
  if (numero === 1) {
    await P.toucher('croix');
    await P.voit("Pas dans l'essai.");
  }
  await P.toucher('rev-jouer');
  await P.voit(numero === 1 ? 'Premier saut' : 'Second saut');
  await P.voit(numero === 1 ? 'Jeudi, vendredi et samedi' : 'Du lundi au samedi');
  await P.capture('saut' + numero);
  if (numero === 1) {
    await P.toucher('saut-annuler'); await P.voit("Et maintenant, la question d'aujourd'hui.");
    // §0 : tant que le saut n'est pas confirmé, ni Le Cercle ni Moi (2.7f, puis la fiche du texte).
    assert.ok(!(await P.existe('onglet-cercle')) && !(await P.existe('onglet-moi')), 'onglets au jour 4 avant confirmation');
    if (await P.existe('fiche')) {
      await P.toucher('fiche');
      assert.ok(!(await P.existe('onglet-cercle')) && !(await P.existe('onglet-moi')), 'onglets sur la fiche au jour 4');
      await P.toucher('retour');
      await P.voit("Et maintenant, la question d'aujourd'hui.");
    }
    await P.toucher('ouvrir-saut');
  }
  await P.toucher('saut-confirmer');
  for (let k = 1; k <= total; k++) {
    await P.voit((numero === 1 ? 'Premier' : 'Second') + ' saut · texte ' + k + ' sur ' + total);
    // Pendant un saut, la révélation ne se reprend pas (« Reprendre la révélation » absent).
    assert.ok(!(await P.existe('rouvrir')), 'rouvrir proposé pendant un saut');
    if (o.arreterAu === k) { return 'arret'; }
    if (o.recharger === k) { await P.page.reload(); await P.page.waitForTimeout(100); await P.sansErreur('rechargement'); await P.voit('texte ' + k + ' sur ' + total); }
    await repondre(P, 1 + (k % 5), k % 4 === 0 ? 'aucune' : 1 + (k % 4), 'ratt-position', 'ratt-suivant-raison', 'ratt-raison', 'ratt-valider');
    if (k === 1 && numero === 1) { await P.capture('ratt-2.5'); await P.toucher('onglet-moi'); await P.voit('Vers tes premiers curseurs nets'); await P.toucher('onglet-jour'); }
    await P.journalValide(true);
    await P.toucher(k < total ? 'texte-suivant' : 'aller-au-dimanche');
  }
  await P.voit('18:00');
  await P.voit('Vous avez avancé de ' + (numero === 1 ? 'trois' : 'six') + ' jours.');
  return 'ok';
}

/* ------------------------------------------------------------------ */
/* Parcours A : une partie entière                                    */
/* ------------------------------------------------------------------ */

async function parcoursA(navigateur) {
  console.log('Parcours A : partie entière');
  const s = await ouvrir(navigateur);
  const P = joueur(s, 'A');
  await debut(P);
  await entree(P, 'Pierre', 'email');
  noter('A : entrée et compte (e-mail, code) faits');

  // Jour 1 : Deviner T0, Répondre T1.
  await P.voit('Tu as rejoint Amis.');
  await P.voit('Jour 1 · lundi');
  await P.voit('Abandonner cette journée');
  await deviner(P, { relire: true, capture: '2.1-j1' });
  await repondre(P, 4, 2);
  await P.voit("Dans l'essai, pas besoin d'attendre 18h");
  await P.capture('2.5-j1');
  await P.toucher('onglet-cercle');
  await P.voit('Où chacun se place');
  await P.voit('Surprise de la semaine');
  await P.capture('4.2-j1');
  await P.toucher('proche', { membre: 'Odile' });
  await P.voit('Toi');
  await P.capture('4.3-j1');
  await P.toucher('retour');
  await P.toucher('titres-passes');
  await P.voit('Semaine 13');
  await P.capture('5.5-j1');
  await P.toucher('onglet-moi');
  await P.voit('Vers tes premiers curseurs nets');
  await P.capture('5.11-j1');
  await P.toucher('moi-historique');
  await P.voit('Pour commencer ·');
  await P.toucher('onglet-jour');
  await P.toucher('jour-suivant');
  await carnetDuJour(P, false);
  await P.capture('carnet-j1');
  await P.toucher('aller-jour-suivant');
  await P.journalValide(true);
  noter('A : jour 1 fini');

  // Jour 2 : message, révélation de T0 (croix, reprise, revoir), Deviner, Répondre.
  await P.voit('Jour 2 · mardi');
  await P.voit("18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui.");
  await P.capture('2.6-j2');
  await P.toucher('notification');
  await P.capture('2.7a-j2');
  await P.toucher('retourner');
  await P.capture('2.7a-j2-retournee');
  await P.toucher('croix');
  await P.voit('Reprendre la révélation');
  await P.toucher('rouvrir');
  await revelation(P, 2, { captureVote: true });
  await P.toucher('rev-jouer');
  await P.voit('Revoir la révélation');
  await deviner(P, { raisonAvant: true, decalage: 1 });
  await repondre(P, 2, 'aucune');
  await P.toucher('jour-suivant');
  await carnetDuJour(P, false);
  await P.toucher('aller-jour-suivant');
  await P.journalValide(true);
  noter('A : jour 2 fini (croix, « Reprendre », « Revoir »)');

  // Jour 3 : abandon pendant Deviner, un visage posé.
  await P.toucher('notification');
  await revelation(P, 3);
  await P.toucher('rev-jouer');
  await deviner(P, { jusqua: 1 });
  await P.toucher('abandonner');
  await P.voit('Abandonner cette journée ?');
  await P.voit('Les visages déjà posés comptent comme si vous aviez validé ;');
  await P.capture('abandon-j3');
  await P.toucher('abandon-annuler');
  await P.toucher('abandonner');
  await P.toucher('abandon-confirmer');
  await carnetDuJour(P, false);
  await P.toucher('aller-jour-suivant');
  await P.journalValide(true);
  noter('A : jour 3 abandonné avec un visage posé (phrase de perte vue)');

  // Jour 4 : premier saut (« Annuler » une fois), rattrapage, rechargement au deuxième texte.
  await P.voit('Jour 4 · jeudi');
  await saut(P, 1, 3, { recharger: 2 });
  noter('A : premier saut (Annuler, rechargement au texte 2)');

  // Jour 7 : dimanche au vote, titres, phrase de la semaine ; carnet, copie.
  await P.voit("Le vote de l'Assemblée t'attend");
  await P.capture('3.1-j7');
  await P.toucher('notification');
  await P.voit('Vous avez avancé de trois jours.');
  await revelation(P, 7, { captureVote: true, capturePhrase: true, captureTitre: true });
  await P.toucher('rev-jouer');
  await deviner(P, { passer: true });
  await repondre(P, 5, 3);
  await P.toucher('jour-suivant');
  await carnetDuJour(P, true, true);
  await P.capture('carnet-j7');
  await P.toucher('aller-jour-suivant');
  await P.voit('Votre carnet à copier');
  await P.voit('Essai en cours : carnet copié au jour 7.');
  await P.voit('Premier saut · jeudi à samedi');
  await P.voit('Semaine 1');
  await P.capture('copie-j7');
  const copieJ7 = await P.page.evaluate(() => document.getElementById('zone-carnet').textContent);
  await P.toucher('aller-jour-suivant');
  const jc = await P.journalValide(true);
  assert.equal(jc.copies.length, 1, 'le relevé de la copie est dans le journal');
  assert.equal(jc.copies[0].jour, 7);
  assert.equal((await P.page.evaluate(() => window.ElenchosEssai.durees())).copies.length, 1);
  noter('A : dimanche 1 (titres, phrase, carnet, copie)');

  // Jour 8 : second saut.
  await P.voit('Jour 8 · lundi');
  await saut(P, 2, 6);
  noter('A : second saut');

  // Jour 14 : second dimanche.
  await P.toucher('notification');
  await revelation(P, 14, { captureVote: true, capturePhrase: true });
  await P.toucher('rev-jouer');
  await deviner(P, { decalage: 2 });
  await repondre(P, 3, 1);
  await P.toucher('onglet-moi');
  await P.capture('moi-j14');
  await P.toucher('onglet-cercle');
  await P.capture('4.2-j14');
  await P.toucher('onglet-jour');
  await P.toucher('jour-suivant');
  await carnetDuJour(P, true, false);
  await P.toucher('aller-jour-suivant');
  await P.journalValide(true);
  noter('A : dimanche 2');

  // Clôture.
  await P.voit('Clôture');
  await revelation(P, 15);
  await P.toucher('croix');
  await P.voit("Pas dans l'essai.");
  await P.toucher('rev-fin-cloture');
  await P.voit("Le texte de dimanche ne sera pas deviné");
  await P.capture('5.4-T14');
  await P.toucher('cloture-apres-dernier');
  await P.voit("L'essai est fini.");
  for (const [cle, v] of [['f2', 'toujours_autant'], ['servi', 'defi'], ['regle', 'claire'], ['avis', 'pas_lu'], ['raisons', 'un_peu'], ['portrait', 'pas_regarde'], ['barre', 'comprise'], ['suspense', 'vrai']]) {
    await P.toucher('fin-choix', { cle: cle, valeur: v });
  }
  await P.capture('questions-fin');
  await P.toucher('cloture-continuer');
  await P.voit('Votre carnet à copier');
  await P.voit('Essai mené jusqu');
  await P.voit('Fin du carnet');
  const carnet = await P.page.evaluate(() => document.getElementById('zone-carnet').textContent);
  await P.capture('export-final');
  const j = await P.journalValide(false);
  await P.toucher('voir-devoilement');
  await P.voit('Le dévoilement');
  await P.capture('devoilement');
  // Dévoilement sur la partie de test : tous les panneaux, aucun trou, l'empreinte du fichier scellé.
  const dv = await P.page.evaluate(() => ({ n: document.querySelectorAll('.panneau').length, t: Array.from(document.querySelectorAll('.panneau')).map((x) => { const c = x.cloneNode(true); c.querySelectorAll('pre').forEach((p) => p.remove()); return c.textContent; }).join('\n'),
    controle: (document.querySelector('details.controle') || {}).textContent || '', empreinte: window.ElenchosEssai.empreinte(),
    copies: window.ElenchosEssai.copies() }));
  assert.ok(dv.n >= 7, 'panneaux du dévoilement : ' + dv.n);
  assert.ok(normaliser(dv.t).includes(normaliser("Le Pas de Côté ne vous était possible qu'à la révélation du jour 14, sur Sécurité ou Liberté individuelle")), 'Pas de Côté (facteur 3 : T12 seul)');
  assert.ok(normaliser(dv.t).includes(normaliser('En tout, entrée et dernier jour compris, vous aviez 5 textes sur Sécurité')), 'comptes E1 à E3, T1 à T14');
  assert.ok(normaliser(dv.t).includes(normaliser('Sur Tradition ou Changement, votre curseur ne pouvait pas devenir net.')), 'tension fermée');
  assert.equal((dv.t.match(/Ses tempéraments au second dimanche/g) || []).length, 4);
  const trou = /.{0,60}(?:À ÉCRIRE|undefined|NaN|null|\[object|\{[a-zA-Z_]+\}).{0,60}/.exec(dv.t);
  assert.ok(!trou, 'trou dans le dévoilement : ' + (trou && trou[0]));
  assert.ok(dv.controle.replace(/\s+/g, '').includes(dv.empreinte) && dv.controle.includes('"graine"'), 'empreinte absente du panneau de contrôle');
  assert.equal(j.copies.length, 1, 'la copie du jour 7 reste dans le journal final');
  assert.equal(dv.copies.length, 1);
  assert.equal(normaliser(dv.copies[0].texte), normaliser(copieJ7), 'texte de la copie rebâti = texte copié au jour 7');
  await P.toucher('effacer');
  await P.voit('Tout effacer ?');
  await P.toucher('effacer-confirmer');
  await P.voit('La page a tout effacé.');
  const cles = await P.page.evaluate(() => { const l = []; for (let i = 0; i < localStorage.length; i++) { l.push(localStorage.key(i)); } return l; });
  assert.deepEqual(cles.filter((c) => c.startsWith('elenchos-essai:')), []);
  noter('A : clôture, questions de fin, carnet, dévoilement, « Tout effacer » (aucune clé restante)');
  await s.ctx.close();
  return { carnet, journal: j };
}

/* ------------------------------------------------------------------ */
/* Parcours B : arrêt pendant le premier saut                         */
/* ------------------------------------------------------------------ */

async function parcoursB(navigateur) {
  console.log('Parcours B : arrêt pendant le premier saut');
  const s = await ouvrir(navigateur);
  const P = joueur(s, 'B');
  await debut(P);
  await entree(P, 'Anne', 'apple');
  await P.voit('Tu as rejoint Amis.');
  for (let jour = 1; jour <= 3; jour++) {
    if (jour > 1) { await P.toucher('notification'); await revelation(P, jour); await P.toucher('rev-jouer'); }
    await deviner(P);
    await repondre(P, jour, 1);
    await P.toucher('jour-suivant');
    await P.toucher('aller-jour-suivant');
  }
  const r = await saut(P, 1, 3, { arreterAu: 2 });
  assert.equal(r, 'arret');
  await P.page.reload(); await P.page.waitForTimeout(100);
  await P.voit('Premier saut · texte 2 sur 3');
  await P.toucher('arreter');
  await P.voit("Arrêter l'essai ?");
  await P.toucher('arret-confirmer');
  await P.voit('Essai arrêté pendant le premier saut.');
  // L'arrêt est écrit dès la confirmation (E.arreter) : un rechargement retrouve la page des questions.
  const ea = await P.etat();
  assert.ok(ea.arret, 'arrêt écrit à la confirmation');
  await P.journalValide(false);
  await P.page.reload(); await P.page.waitForTimeout(100);
  await P.voit('Essai arrêté pendant le premier saut.');
  assert.ok(await P.existe('arret-raison'), 'page des questions d\'arrêt retrouvée au rechargement');
  await P.toucher('arret-raison', { valeur: 'vu_assez' });
  await P.toucher('arret-f2', { valeur: 'de_plus_en_plus' });
  await P.capture('arret-questions');
  await P.toucher('arret-continuer');
  await P.voit('Essai arrêté pendant le premier saut.');
  await P.voit('Raison de l');
  await P.voit("Jusqu'ici, deviner était : De plus en plus amusant.");
  const ef = await P.etat();
  assert.equal(ef.arret.raison, 'vu_assez');
  assert.equal(ef.arret.f2, 'de_plus_en_plus');
  const carnet = await P.page.evaluate(() => document.getElementById('zone-carnet').textContent);
  await P.journalValide(false);
  await P.page.reload(); await P.page.waitForTimeout(100);
  await P.voit('Votre carnet à copier');
  // Dévoilement après un arrêt : tout est montré ; tempéraments du second dimanche pour chacun (non atteint).
  await P.toucher('voir-devoilement');
  await P.voit('Le dévoilement');
  const nTemp = await P.page.evaluate(() => Array.from(document.querySelectorAll('.panneau p')).filter((x) => /^Ses tempéraments au second dimanche/.test(x.textContent)).length);
  assert.equal(nTemp, 4, 'tempéraments après un arrêt');
  await P.capture('devoilement-apres-arret');
  noter('B : arrêt pendant le saut, carnet, reprise du parcours d\'arrêt au rechargement');
  await s.ctx.close();
  return { carnet };
}

/* ------------------------------------------------------------------ */
/* Parcours C : partie du premier essai ; D : refus du pseudo         */
/* ------------------------------------------------------------------ */

async function parcoursC(navigateur) {
  console.log('Parcours C : partie du premier essai');
  const s = await ouvrir(navigateur, { avant: "if (!sessionStorageMarque()) {}; function sessionStorageMarque() { try { if (!localStorage.getItem('elenchos-essai:marque-test')) { localStorage.setItem('elenchos-essai:partie', 'contenu jamais lu'); localStorage.setItem('elenchos-essai:sonde-icone', 'x'); localStorage.setItem('elenchos-essai:marque-test', '1'); } } catch (e) {} return true; }" });
  const P = joueur(s, 'C');
  await P.voit('La partie du premier essai est encore là');
  await P.capture('ancienne');
  await P.toucher('ancienne-effacer');
  await P.voit('Effacer la partie du premier essai ?');
  await P.toucher('ancienne-confirmer');
  await P.voit('Vos réponses restent dans votre ' + APPAREIL_MOT + '.');
  const cles = await P.page.evaluate(() => { const l = []; for (let i = 0; i < localStorage.length; i++) { l.push(localStorage.key(i)); } return l.sort(); });
  assert.deepEqual(cles, ['elenchos-essai:partie-2']);
  noter('C : page de la partie du premier essai, effacement (ne reste que partie-2)');
  await s.ctx.close();
}

async function parcoursD(navigateur) {
  console.log('Parcours D : refus du pseudo');
  const s = await ouvrir(navigateur);
  const P = joueur(s, 'D');
  await debut(P);
  await P.toucher('apercu');
  for (let i = 0; i < 3; i++) {
    await P.toucher('entree-position', { valeur: '3' });
    if (i === 0) { await P.toucher('consentement-accepter'); }
    await P.toucher('entree-suivant');
    await P.toucher('entree-raison', { valeur: '1' });
    await P.toucher('entree-valider-raison');
    await P.toucher('entree-pari', { valeur: '3' });
    await P.toucher('entree-voir');
    await P.toucher('entree-texte-suivant');
  }
  await P.toucher('creer-compte');
  await P.taper('ODILE');
  await P.voit('Ce pseudo ressemble trop au prénom');
  await P.taper('V');
  await P.voit('Ce pseudo donnerait le même rond');
  await P.capture('pseudo-refuse');
  await P.taper('Antoine');
  await P.voit('Compte simulé');
  await P.toucher('compte-google');
  await P.toucher('onglet-cercle');
  const rond = await P.page.evaluate(() => Array.from(document.querySelectorAll('.faces .face .dot')).map((x) => x.textContent));
  assert.ok(rond.includes('An'), 'rond à deux lettres attendu : ' + rond.join(','));
  noter('D : pseudo refusé (prénom, rond) ; rond « An » pour « Antoine »');
  await s.ctx.close();
}

(async () => {
  const navigateur = await PW.chromium.launch({ executablePath: process.env.ELENCHOS_CHROMIUM || undefined });
  let code = 0;
  try {
    const a = await parcoursA(navigateur);
    const b = await parcoursB(navigateur);
    await parcoursC(navigateur);
    await parcoursD(navigateur);
    if (CAPTURES) {
      fs.writeFileSync(path.join(CAPTURES, 'carnet-A.txt'), a.carnet);
      fs.writeFileSync(path.join(CAPTURES, 'carnet-B.txt'), b.carnet);
    }
    console.log('Parcours réussis : ' + bilan.length + ' étapes vérifiées.');
  } catch (e) {
    console.error('ÉCHEC : ' + (e && e.stack || e));
    code = 1;
  } finally {
    await navigateur.close();
  }
  process.exit(code);
})();
