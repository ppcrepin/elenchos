/* Contrôle 14 (i) : durées (§8.4, §8.8 ; §9). Scénario écrit d'avance,
 * valeurs attendues calculées à la main (ci-dessous, en commentaire de
 * chaque cas), vérifiées sans masque.
 *
 * L'outil fixe l'horloge (la date et l'horloge des durées : page.clock,
 * arrêtée, avancée par runFor ou fastForward), l'état de visibilité et son
 * évènement, et coupe le navigateur. Rien n'est ajouté à la page ; les
 * durées sont lues par le point d'accès en lecture (ElenchosEssai.durees)
 * et dans le carnet exporté.
 *
 * Toutes les durées de premier plan d'une séance partent de « Aller au
 * jour suivant » de la séance d'avant (ou du chargement, à la séance 0) ;
 * duree_seance va du premier au dernier toucher compté (§8.4).
 */
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const X = require('../textes.js');
const O = require('./outils.js');
const NAV = require('./navigateur.js');
const { motif } = require('./joueur.js');
const C14 = () => require('./controle14.js'); // mode de diagnostic (chargé à l'usage : controle14.js charge ce fichier)

const S = 1000, H = 3600 * S;
const JOUR0 = Date.UTC(2026, 9, 19, 17, 0); // lundi 19 octobre 2026, 19:00 à Paris

async function visibilite(page, etat) {
  await page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, etat);
}

/** Coupe net le navigateur d'un profil gardé sur disque (arrêt brutal) : processus tués, sans fermeture propre. */
function couperNet(profil) {
  const ps = execFileSync('ps', ['-eo', 'pid=,args='], { encoding: 'utf8' });
  const pids = ps.split('\n').filter(l => l.indexOf(profil) >= 0).map(l => +l.trim().split(/\s+/)[0]).filter(Boolean);
  for (const p of pids) { try { process.kill(p, 'SIGKILL'); } catch (e) { /* déjà fini */ } }
  return pids.length;
}

class Scenario {
  constructor(o, rapport) { this.o = o; this.r = rapport; this.profil = fs.mkdtempSync(path.join(os.tmpdir(), 'elenchos-profil-i-')); this.env = null; this.t = JOUR0; this.ouvertures = 0; }
  /** Étape en cours et dernier geste demandé (libellé de la page, jamais une valeur du jeu) : mode de diagnostic. */
  etape(nom) { this.o.etape = nom; this.geste = null; }
  async ouvrir(page, depuis) {
    const n = ++this.ouvertures;
    const avant = this.o.etape;
    this.o.etape = avant + ' — ' + (n === 1 ? 'ouverture du profil neuf' : 'réouverture du même profil');
    this.env = await NAV.ouvrir({ navigateur: this.o.navigateur, page, icone: this.o.icone, profil: this.profil, heure: depuis });
    this.o.etape = avant + ' — horloge arrêtée (pauseAt)';
    await this.env.contexte.clock.pauseAt(depuis);
    this.o.etape = avant + ' — chargement de la page';
    await NAV.charger(this.env);
    this.o.etape = avant + ' — attente du point d’accès en lecture (waitForFunction)';
    await this.env.page.waitForFunction(() => window.ElenchosEssai !== undefined);
    if (n > 1) { await C14().noterMemoire(this.o, this.r, '(i) profil rouvert (ouverture ' + n + ')', this.page); }
    this.o.etape = avant;
  }
  async fermer() {
    try { await NAV.fermer(this.env); } catch (e) { if (this.o.diagnostic && this.o.navigateur !== 'chromium') { this.r.note('diagnostic : (i) fermeture du navigateur : ' + C14().resumeErreur(e)); } } // coupé net (Chromium) : attendu
    this.env = null;
  }
  get page() { return this.env.page; }
  async avancer(ms) { await this.env.contexte.clock.runFor(ms); }
  async toucher(zone, nom) {
    this.geste = zone + ' › ' + (nom instanceof RegExp ? String(nom) : '« ' + nom + ' »');
    const z = { tel: '.telephone', bande: '.bande', barre: 'header.barre', cadre: '.cadre-milieu' }[zone];
    const l = nom === 'heading' ? this.page.locator(z).getByRole('heading') : this.page.locator(z).getByRole('button', { name: nom instanceof RegExp ? nom : motif(nom) });
    await l.first().click();
  }
  /** Avance de `ms` au premier plan, puis touche. */
  async apres(ms, zone, nom) { await this.avancer(ms); await this.toucher(zone, nom); }
  async durees() { return this.page.evaluate(() => window.ElenchosEssai.durees()); }
  async verifier(quoi, k, attendu) {
    const d = (await this.durees())[k];
    const juste = ['duree_seance', 'duree_deviner', 'duree_repondre'].every(c => attendu[c] === undefined || d[c] === attendu[c]);
    this.r.ok('(i) ' + quoi, juste, 'lu ' + JSON.stringify(d) + ', attendu ' + JSON.stringify(attendu));
  }
}

async function controleDurees(o, rapport) {
  if (o.navigateur !== 'chromium') { rapport.note('(i) durées : arrêt brutal non reproduit sous ' + o.navigateur + ' ; cas sans arrêt brutal seulement'); }
  const sc = new Scenario(o, rapport);
  try {
    sc.etape('(i) ouverture');
    await sc.ouvrir(o.porteur, JOUR0);
    const T = X;
    sc.etape('(i) cas 1, séance 0');
    /* Séance 0. Cas 1 : un toucher, une pause au premier plan, dix heures en arrière-plan, un retour, un dernier toucher.
     * Touchers (temps de premier plan depuis le chargement) : 5 s « Continuer » (ouverture) ; 8 s « Fermer » ;
     * 10 s message ; 14 s Neutre ; 15 s « J'accepte » ; 16 s « Suivant » ; 18 s raison ; 20 s « Valider ».
     * Pause de 30 s au premier plan (50 s), arrière-plan 10 h (non compté), retour, 4 s : pari (54 s).
     * duree_seance = 54 − 5 = 49 s. */
    await sc.apres(5 * S, 'bande', T.continuer);
    await sc.apres(3 * S, 'bande', T.fermer);
    await sc.apres(2 * S, 'tel', /^\s*Elenchos/);
    await sc.apres(4 * S, 'tel', T.POSITIONS[2]);
    await sc.apres(1 * S, 'tel', T.jAccepte);
    await sc.apres(1 * S, 'tel', T.suivant);
    await sc.apres(2 * S, 'tel', T.aucuneRaison);
    await sc.apres(2 * S, 'tel', T.valider);
    await sc.avancer(30 * S);
    await visibilite(sc.page, 'hidden');
    await sc.env.contexte.clock.fastForward(10 * H);
    await visibilite(sc.page, 'visible');
    await sc.apres(4 * S, 'tel', T.POSITIONS[2]);
    await sc.verifier('cas 1 (pause au premier plan comptée, dix heures en arrière-plan non comptées) : séance 0, 49 s', 0, { duree_seance: 49 });
    sc.etape('(i) séance 0, fin de l’entrée et compte');
    // fin de l'entrée : 1 s par geste (55 s « Voir sa réponse » … ) ; textes 2 et 3 identiques ; compte
    const suite = [[T.voirSaReponse], [T.texteSuivant], [T.POSITIONS[2]], [T.suivant], [T.aucuneRaison], [T.valider], [T.POSITIONS[2]], [T.voirSaReponse], [T.texteSuivant],
      [T.POSITIONS[2]], [T.suivant], [T.aucuneRaison], [T.valider], [T.POSITIONS[2]], [T.voirSaReponse], [T.suivant], [T.creerCompte]];
    for (const [n] of suite) { await sc.apres(1 * S, 'tel', n); }
    await sc.avancer(1 * S);
    await sc.page.locator('.telephone').getByRole('textbox').pressSequentially('Durées-x');
    await sc.apres(1 * S, 'tel', T.recevoirCode);
    await sc.apres(1 * S, 'tel', T.valider);
    // 54 + 17 + 1 (frappe : chaque touche est un toucher compté, au même instant) + 1 + 1 = 74 s ; « Aller au jour suivant » à 76 s
    await sc.apres(2 * S, 'bande', T.allerJourSuivant);
    await sc.verifier('séance 0 : de l’ouverture (5 s) à « Aller au jour suivant » (76 s) : 71 s', 0, { duree_seance: 71 });

    /* Séance 1. Cas 2 : une journée laissée en arrière-plan sur « En attendant » jusqu'au lendemain.
     * Répondre affiché à 0 s (au « Aller au jour suivant »). Touchers : 2 s en-tête (ouverture), 5 s position, 6 s « Suivant »,
     * 8 s raison, 9 s « Valider » (fin de duree_repondre = 9 s). 2.5 affiché ; 3 s plus tard, arrière-plan, 14 h ; retour ;
     * 5 s : « Jour suivant » (17 s) ; 3 s : « Aller au jour suivant » (20 s).
     * duree_seance = 20 − 2 = 18 s ; duree_repondre = 9 s. */
    sc.etape('(i) cas 2, séance 1');
    await sc.apres(2 * S, 'tel', 'heading');
    await sc.apres(3 * S, 'tel', T.POSITIONS[3]);
    await sc.apres(1 * S, 'tel', T.suivant);
    await sc.apres(2 * S, 'tel', T.aucuneRaison);
    await sc.apres(1 * S, 'tel', T.valider);
    await sc.avancer(3 * S);
    await visibilite(sc.page, 'hidden');
    await sc.env.contexte.clock.fastForward(14 * H);
    await visibilite(sc.page, 'visible');
    await sc.apres(5 * S, 'bande', T.jourSuivant);
    await sc.apres(3 * S, 'bande', T.allerJourSuivant);
    await sc.verifier('cas 2 (nuit en arrière-plan sur « En attendant » non comptée) : séance 1, 18 s, dont 9 s pour répondre', 1, { duree_seance: 18, duree_repondre: 9 });

    /* Séance 2. Cas 3 : l'app fermée en arrière-plan, rouverte le lendemain : la durée reprend où elle en était.
     * Deviner affiché à 0 s. Touchers : 4 s en-tête (ouverture), 6 s « Relire », 8 s « ← Retour » (dernier toucher sur Deviner : 8 s).
     * 2 s plus tard (10 s), arrière-plan, navigateur fermé ; rouvert le lendemain, 3 s : « Passer » ×3 et « Valider »
     * à 13, 14, 15, 16 s (duree_deviner = 16 s) ; Répondre affiché à 16 s ; position 18 s, « Suivant » 19 s, raison 20 s,
     * « Valider » 21 s (duree_repondre = 21 − 16 = 5 s).
     * Cas 7 : l'heure du téléphone avancée de trois heures (Date seule) avant « Aller au jour suivant », sans effet.
     * « Jour suivant » 25 s, « Aller au jour suivant » 27 s : duree_seance = 27 − 4 = 23 s. */
    sc.etape('(i) cas 3, séance 2, avant la fermeture');
    await sc.apres(4 * S, 'tel', 'heading');
    await sc.apres(2 * S, 'tel', T.relire);
    await sc.apres(2 * S, 'tel', '← ' + T.retour);
    await sc.avancer(2 * S);
    await visibilite(sc.page, 'hidden');
    sc.etape('(i) cas 3, fermeture propre du navigateur (profil gardé)');
    await sc.fermer();
    sc.etape('(i) cas 3, lendemain');
    await sc.ouvrir(o.porteur, JOUR0 + 2 * 24 * H);
    sc.etape('(i) cas 3, séance 2, après la réouverture');
    // n cartes : « Passer » à 13, 14, … 12 + n s ; « Valider » à 13 + n s (fin de duree_deviner)
    const groupes = sc.page.locator('.telephone').getByRole('group', { name: /^Réponse [0-9]$/ });
    const nCartes = await groupes.count();
    await sc.avancer(2 * S);
    for (let i = 0; i < nCartes; i++) { await sc.avancer(1 * S); await groupes.nth(i).getByRole('button', { name: motif(T.passer) }).click(); }
    await sc.apres(1 * S, 'tel', T.valider);
    const t = 13 + nCartes;
    const finDeviner = t;
    await sc.apres(2 * S, 'tel', T.POSITIONS[1]);
    await sc.apres(1 * S, 'tel', T.suivant);
    await sc.apres(1 * S, 'tel', T.aucuneRaison);
    await sc.apres(1 * S, 'tel', T.valider);
    await sc.env.contexte.clock.setSystemTime(JOUR0 + 2 * 24 * H + 3 * H);
    await sc.apres(4 * S, 'bande', T.jourSuivant);
    await sc.apres(2 * S, 'bande', T.allerJourSuivant);
    await sc.verifier('cas 3 et 7 (app fermée en arrière-plan puis rouverte ; heure du téléphone changée) : séance 2, ' + (finDeviner + 11 - 4) + ' s, dont ' + finDeviner + ' s pour deviner et 5 s pour répondre',
      2, { duree_seance: finDeviner + 11 - 4, duree_deviner: finDeviner, duree_repondre: 5 });

    if (o.navigateur === 'chromium') {
      /* Séance 3. Cas 4 : arrêt brutal au premier plan, au moins 10 s après la dernière écriture.
       * Touchers : 3 s message de 18h (ouverture), 5 s « Retourner la carte ». Puis 12 s sans toucher (17 s), coupure nette
       * (attente réelle de 11 s avant de couper : écriture de Chromium sur le disque).
       * Réouverture : la séance reprend à 5 s (dernière écriture) ; 2 s plus tard, toucher (7 s) : duree_seance = 7 − 3 = 4 s. */
      await sc.apres(3 * S, 'tel', /^\s*Elenchos/);
      await sc.apres(2 * S, 'tel', T.retournerCarte);
      await sc.avancer(12 * S);
      await sc.page.waitForTimeout(11000);
      couperNet(sc.profil);
      await sc.fermer();
      await sc.ouvrir(o.porteur, JOUR0 + 3 * 24 * H);
      await sc.apres(2 * S, 'tel', T.suivant);
      await sc.verifier('cas 4 (arrêt brutal 12 s après la dernière écriture : ces 12 s manquent) : séance 3, 4 s', 3, { duree_seance: 4 });
      /* Cas 5 : arrêt brutal moins d'une seconde après un coup validé : la page reprend après ce coup ou à son étape. */
      const avant = await sc.page.evaluate(() => window.ElenchosEssai.etat().seances.length);
      for (let g = 0; g < 30; g++) {
        const fin = await sc.page.locator('.telephone').getByRole('button', { name: motif(T.jouer) }).count();
        if (fin) { break; }
        const retourner = await sc.page.locator('.telephone').getByRole('button', { name: motif(T.retournerCarte) }).count();
        if (retourner) { await sc.apres(1 * S, 'tel', T.retournerCarte); await sc.avancer(500); continue; }
        await sc.apres(1 * S, 'tel', T.suivant);
      }
      await sc.apres(1 * S, 'tel', T.jouer);
      const n3 = await sc.page.locator('.telephone').getByRole('button', { name: motif(T.passer) }).count();
      for (let i = 0; i < n3; i++) { await sc.page.locator('.telephone').getByRole('group', { name: 'Réponse ' + (i + 1), exact: true }).getByRole('button', { name: motif(T.passer) }).click(); }
      await sc.apres(1 * S, 'tel', T.valider);
      await sc.apres(1 * S, 'tel', T.POSITIONS[4]);
      await sc.apres(1 * S, 'tel', T.suivant);
      await sc.apres(1 * S, 'tel', T.aucuneRaison);
      // les écritures d'avant sont sur le disque (Chromium les y met par lots, au plus tard 5 s après) : 11 s réelles ;
      // puis « Valider » et coupure aussitôt
      await sc.page.waitForTimeout(11000);
      await sc.toucher('tel', T.valider);
      couperNet(sc.profil);
      await sc.fermer();
      await sc.ouvrir(o.porteur, JOUR0 + 3 * 24 * H + H);
      const e = await sc.page.evaluate(() => window.ElenchosEssai.etat());
      const s3 = e.seances[3];
      const apresCoup = s3.coups.reponse !== null && e.vue.tel.ecran === 'attente';
      const aSonEtape = s3.coups.reponse === null && (e.vue.tel.ecran === 'repondre' || e.vue.tel.ecran === 'raison');
      rapport.ok('(i) cas 5 (arrêt brutal moins d’une seconde après « Valider ») : la page reprend ' + (apresCoup ? 'après ce coup' : (aSonEtape ? 'à son étape' : 'entre les deux')),
        apresCoup || aSonEtape, JSON.stringify({ reponse: s3.coups.reponse, ecran: e.vue.tel.ecran, seances: e.seances.length, avant }));
      if (!apresCoup) {
        await sc.apres(1 * S, 'tel', T.POSITIONS[4]); await sc.apres(1 * S, 'tel', T.suivant); await sc.apres(1 * S, 'tel', T.aucuneRaison); await sc.apres(1 * S, 'tel', T.valider);
      }
      await sc.apres(1 * S, 'bande', T.jourSuivant);
      await sc.apres(1 * S, 'bande', T.allerJourSuivant);

      /* Cas 5 bis (§9, 14 i ; §8.8) : arrêt brutal moins d'une seconde après trois coups validés en moins de cinq
       * secondes (« Valider » de Deviner, « Valider » de la réponse, un choix du carnet du jour). La page reprend après
       * le dernier coup gardé, à l'étape du premier coup perdu, jamais entre deux coups. */
      await sc.apres(1 * S, 'tel', /^\s*Elenchos/);
      for (let g = 0; g < 30; g++) {
        if (await sc.page.locator('.telephone').getByRole('button', { name: motif(T.jouer) }).count()) { break; }
        if (await sc.page.locator('.telephone').getByRole('button', { name: motif(T.retournerCarte) }).count()) { await sc.apres(1 * S, 'tel', T.retournerCarte); await sc.avancer(500); continue; }
        await sc.apres(1 * S, 'tel', T.suivant);
      }
      await sc.apres(1 * S, 'tel', T.jouer);
      const kb = await sc.page.evaluate(() => window.ElenchosEssai.etat().seances.length - 1);
      await sc.page.waitForTimeout(11000); // tout ce qui précède est sur le disque
      const groupesB = sc.page.locator('.telephone').getByRole('group', { name: /^Réponse [0-9]$/ });
      const nB = await groupesB.count();
      const t0 = Date.now();
      for (let i = 0; i < nB; i++) { await groupesB.nth(i).getByRole('button', { name: motif(T.passer) }).click(); }
      await sc.toucher('tel', T.valider);                                    // coup 1 : la manche
      await sc.toucher('tel', T.POSITIONS[1]); await sc.toucher('tel', T.suivant); await sc.toucher('tel', T.aucuneRaison);
      await sc.toucher('tel', T.valider);                                    // coup 2 : la réponse
      await sc.toucher('bande', T.jourSuivant);
      await sc.toucher('cadre', T.choixQ2.premier_coup);                     // coup 3 : le carnet du jour
      const ecoule = Date.now() - t0;
      couperNet(sc.profil);
      await sc.fermer();
      await sc.ouvrir(o.porteur, JOUR0 + 4 * 24 * H + 2 * H);
      const eb = await sc.page.evaluate(() => window.ElenchosEssai.etat());
      const sb = eb.seances[kb];
      const c1 = Array.isArray(sb.coups.deviner) && sb.coups.deviner.length > 0 && sb.coups.deviner.every(d => d.designe !== null);
      const c2 = sb.coups.reponse !== null, c3 = sb.coups.carnet.q2 !== null;
      const garde = c3 ? 3 : (c2 ? 2 : (c1 ? 1 : 0));
      const prefixe = (!c3 || c2) && (!c2 || c1);
      const cadre = eb.vue.cadre ? eb.vue.cadre.page : null, ecran = eb.vue.tel.ecran;
      const etape = garde === 0 ? (!cadre && ecran === 'deviner') : (garde === 1 ? (!cadre && (ecran === 'repondre' || ecran === 'raison'))
        : (garde === 2 ? ((!cadre && ecran === 'attente') || cadre === 'carnet') : cadre === 'carnet'));
      rapport.ok('(i) cas 5 bis (arrêt brutal moins d’une seconde après trois coups validés en ' + (ecoule / 1000).toFixed(1) + ' s) : la page reprend après le coup ' + garde +
        ' gardé sur 3, à l’étape du premier coup perdu, jamais entre deux coups', ecoule < 5000 && eb.seances.length - 1 === kb && prefixe && etape,
        JSON.stringify({ garde, prefixe, cadre, ecran, ecoule }));
      // la suite rejoue les coups perdus
      if (!c1) { const g2 = sc.page.locator('.telephone').getByRole('group', { name: /^Réponse [0-9]$/ }); for (let i = 0; i < nB; i++) { await g2.nth(i).getByRole('button', { name: motif(T.passer) }).click(); } await sc.apres(1 * S, 'tel', T.valider); }
      if (!c2) { await sc.apres(1 * S, 'tel', T.POSITIONS[1]); await sc.apres(1 * S, 'tel', T.suivant); await sc.apres(1 * S, 'tel', T.aucuneRaison); await sc.apres(1 * S, 'tel', T.valider); }
      if (!(eb.vue.cadre && eb.vue.cadre.page === 'carnet' && c2)) { if (!(await sc.page.locator('.cadre-milieu').isVisible())) { await sc.apres(1 * S, 'bande', T.jourSuivant); } }
      if (!c3) { await sc.apres(1 * S, 'cadre', T.choixQ2.premier_coup); }
      await sc.apres(1 * S, 'bande', T.allerJourSuivant);
    }

    /* Séance suivante. Cas 6 : passage par l'écran couché (son temps compte, son toucher non).
     * Touchers : 2 s message de 18h (ouverture) ; puis écran couché pendant 20 s, avec un toucher sur la vue couchée à 10 s
     * (non compté : duree_seance reste 0 s) ; redressé à 22 s ; toucher à 25 s : duree_seance = 25 − 2 = 23 s.
     * Cas 8 : un correctif (version 2) chargé ensuite : « Version de la page : 1, puis 2. » ; la durée continue :
     * après rechargement, 3 s, toucher : 23 + 3 = 26 s (le temps du rechargement lui-même n'est pas compté :
     * horloge arrêtée). */
    sc.etape('(i) cas 6, écran couché');
    const k = await sc.page.evaluate(() => window.ElenchosEssai.etat().seances.length - 1);
    await sc.apres(2 * S, 'tel', /^\s*Elenchos/);
    const vp = sc.page.viewportSize();
    await sc.page.setViewportSize({ width: 740, height: 390 });
    await sc.avancer(8 * S);
    await sc.page.locator('.vue-couchee').click();
    await sc.verifier('cas 6 (toucher sur l’écran couché non compté) : séance ' + k + ', 0 s', k, { duree_seance: 0 });
    await sc.avancer(12 * S);
    await sc.page.setViewportSize(vp);
    await sc.apres(3 * S, 'tel', T.retournerCarte);
    await sc.verifier('cas 6 (temps de l’écran couché compté) : séance ' + k + ', 23 s', k, { duree_seance: 23 });
    sc.etape('(i) cas 8, correctif chargé');
    sc.env.service.servir(o.porteur2);
    await sc.page.reload();
    await sc.page.waitForFunction(() => window.ElenchosEssai !== undefined);
    await sc.apres(3 * S, 'tel', T.suivant);
    await sc.verifier('cas 8 (correctif chargé en cours de séance, la durée continue) : séance ' + k + ', 26 s', k, { duree_seance: 26 });
    const vs = await sc.page.evaluate((kk) => window.ElenchosEssai.etat().seances[kk].versions, k);
    rapport.ok('(i) cas 8 : versions de la séance ' + k + ' : 1, puis 2', O.canonique(vs) === '[1,2]', JSON.stringify(vs));
    // le carnet exporté dit les mêmes durées : arrêt, export
    sc.etape('(i) carnet exporté');
    await sc.toucher('barre', T.arreterLEssai);
    await sc.apres(1 * S, 'bande', T.arreterLEssai);
    await sc.apres(1 * S, 'bande', T.continuer);
    await sc.apres(1 * S, 'bande', T.sauterQuestion);
    const carnet = await sc.page.locator('#zone-carnet').textContent();
    const d = await sc.durees();
    const fmt = s => Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';
    rapport.ok('(i) carnet : « Durée : ' + fmt(d[0].duree_seance) + '. » à l’entrée, « Version de la page : 1, puis 2. » au jour ' + k,
      carnet.indexOf('\nDurée : ' + fmt(d[0].duree_seance) + '.\n') > 0 && carnet.indexOf('Version de la page : 1, puis 2.') > 0);
  } catch (e) {
    if (o.diagnostic) { rapport.note('diagnostic : (i) arrêté à l’étape « ' + o.etape + ' »' + (sc.geste ? ', geste demandé : ' + sc.geste : '') + ' : ' + C14().resumeErreur(e)); }
    rapport.ok('(i) scénario des durées joué jusqu’au bout', false, e.message);
  } finally {
    await sc.fermer();
    fs.rmSync(sc.profil, { recursive: true, force: true });
  }
}

module.exports = { controleDurees };
