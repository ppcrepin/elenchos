/* Joueur du harnais : joue un journal par l'interface (§9, « Rejeu »).
 *
 * Il trouve chaque bouton par son rôle et son nom, dans la zone où il est
 * affiché (téléphone, barre, bande, page du cadre). Il fixe l'heure de
 * Paris avant le premier toucher de chaque séance et avant chaque
 * affichage d'« En attendant » (schema.md, partie 3.1, « Horloge »), et
 * sert la construction dont le numéro est dans `versions` (rechargement :
 * correctif). Il ne lit la page que par le DOM, la mémoire, le point
 * d'accès en lecture window.ElenchosEssai et, dans la version témoin, le
 * bloc témoin (ElenchosTemoin) ; il n'y ajoute rien.
 *
 * Gestes non écrits dans le journal (partie 3.12), réglés par `gestes` :
 *   gestes.seances[k] = {
 *     attribuerSansValider: [{carte, membre}]  cartes touchées sans « Valider »,
 *     positionSansRaison: niveau                position donnée, raison laissée,
 *     rechargerApres: 'ouverture' | 'copie' | 'deviner' | 'reponse'   moment du correctif,
 *     reprendreApres: même valeurs : l'app fermée puis rouverte (rechargement, même version),
 *     cercle: true, moi: true                   écrans Le Cercle, un proche, Moi, une fiche,
 *     annulerConfirmation: true                 « Jour suivant », « Annuler », puis la suite
 *   }
 *   gestes.relever : relevé du texte affiché après chaque geste (contrôle 11)
 */
'use strict';
const N = require('../noyau.js');
const X = require('../textes.js');
const NAV = require('./navigateur.js');
const RELEVE = require('./releve.js');

const PERSOS = ['Agathe', 'Nassim', 'Odile', 'Valentin'];
const T8 = X.T8;

function echapper(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
/** Nom accessible attendu : le texte du bouton, après la typographie du §7.8 ; blancs indifférents. */
function motif(s) { return new RegExp('^\\s*' + echapper(N.typographier(s)).replace(/\s+/g, '\\s*') + '\\s*$'); }
function motifDebut(s) { return new RegExp('^\\s*' + echapper(N.typographier(s)).replace(/\s+/g, '\\s*')); }

/** Instant (ms) d'un instant du journal (partie 1.2). */
function ms(instant) { return N.lireInstant(instant); }

/** Premier instant, après `depuis` (exclu si `strict`), où l'heure de Paris vaut hhmm. */
function prochaineHeure(depuis, hhmm, strict) {
  const cible = N.lireHeure(hhmm);
  let t = Math.floor(depuis / 60000) * 60000;
  if (strict || t < depuis) { t += 60000; }
  for (let i = 0; i < 3 * 1440; i++, t += 60000) {
    if (N.paris(t).minutesDuJour === cible) { return t; }
  }
  throw new Error('heure introuvable : ' + hhmm);
}

function copieProfonde(v) { return JSON.parse(JSON.stringify(v)); }
function egal(a, b) { return N.jsonCanonique(a) === N.jsonCanonique(b); }

class ErreurJeu extends Error {}

class Joueur {
  /**
   * env : rendu par navigateur.ouvrir ; journal : le journal à jouer ;
   * constructions : { [version]: chemin du fichier servi } ;
   * options : { temoin: bool, relever: bool, gestes, captures: dossier|null }
   */
  constructor(env, journal, constructions, options) {
    this.env = env; this.page = env.page; this.j = journal; this.constructions = constructions;
    this.o = Object.assign({ temoin: false, relever: true, gestes: { seances: {} } }, options || {});
    this.gestes = this.o.gestes.seances || {};
    this.releves = [];        // relevés écran par écran
    this.precedents = [];     // relevés du bloc témoin des chargements précédents
    this.copiesTextes = [];   // textes copiés en cours d'essai (« Copier mon carnet d'abord »)
    this.carnetCopie = null;  // texte copié à la fin
    this.carnetZone = null;
    this.version = null;      // version servie
    this.k = 0;
    this.lectures = [];       // heures prévues pour la séance en cours (file)
    this.derniereLecture = null;
    this.copiesAFaire = (journal.copies || []).map(c => c);
    this.modele = null;       // ce que le harnais a joué dans la séance en cours (pour les copies)
    this.nbGestes = 0;
  }

  /* ---------------- zones ---------------- */
  get tel() { return this.page.locator('.telephone'); }
  get bande() { return this.page.locator('.bande'); }
  get barre() { return this.page.locator('header.barre'); }
  get cadre() { return this.page.locator('.cadre-milieu'); }

  /* ---------------- version servie, chargements ---------------- */
  async servir(version) {
    const chemin = this.constructions[version];
    if (!chemin) { throw new ErreurJeu('construction absente pour la version ' + version); }
    this.env.service.servir(chemin);
    this.version = version;
  }
  async charger() {
    await NAV.charger(this.env);
    await this.page.waitForFunction(() => window.ElenchosEssai !== undefined);
    await this.releverSiVoulu('chargement');
  }
  /** Rechargement provoqué par le harnais : relevés du bloc témoin pris d'abord (partie 3.1). */
  async recharger(version) {
    // une page rechargée sur « En attendant » le réaffiche : c'est une lecture (§7.5)
    const vue = await this.page.evaluate(() => { const e = window.ElenchosEssai && window.ElenchosEssai.etat(); return e ? e.vue : null; });
    if (vue && !vue.cadre && vue.tel.ecran === 'attente') { await this.avantAttente(); }
    if (this.o.temoin) { this.precedents.push(await this.page.evaluate(() => window.ElenchosTemoin.releves())); }
    if (version !== undefined && version !== this.version) { await this.servir(version); }
    await this.charger();
  }

  /* ---------------- horloge ---------------- */
  async heure(t) { await NAV.fixerHeure(this.env, t); }

  /* ---------------- gestes ---------------- */
  async releverSiVoulu(geste) {
    if (this.o.captures) {
      this.nCapture = (this.nCapture || 0) + 1;
      const nom = String(this.nCapture).padStart(4, '0') + '-s' + this.k + '-' + geste.replace(/[^A-Za-z0-9À-ÿ]+/g, '-').slice(0, 40) + '.png';
      await this.page.screenshot({ path: require('node:path').join(this.o.captures, nom) });
    }
    if (!this.o.relever) { return; }
    const r = await this.page.evaluate(RELEVE.releverEcran);
    const vue = await this.page.evaluate(() => {
      const e = window.ElenchosEssai && window.ElenchosEssai.etat();
      if (!e) { return null; }
      const s = e.seances[e.seances.length - 1], t = e.vue.tel;
      return { k: s.k, tel: t.ecran, E: t.E || null, texte: t.texte || null, texte14: !!t.texte14, membre: t.membre || null, rev: t.ecran === 'revelation' ? s.rev.i : null,
        cadre: e.vue.cadre ? e.vue.cadre.page : null };
    });
    this.releves.push({ seance: this.k, geste, vue, blocs: r.blocs, coupures: r.coupures });
  }

  async toucher(zone, role, nom, options) {
    options = options || {};
    const m = nom instanceof RegExp ? nom : (options.debut ? motifDebut(nom) : motif(nom));
    const l = zone.getByRole(role, { name: m });
    const n = await l.count();
    if (n !== 1) {
      const noms = await zone.getByRole(role).evaluateAll(es => es.map(e => e.getAttribute('aria-label') || e.textContent));
      throw new ErreurJeu('séance ' + this.k + ' : ' + n + ' « ' + role + ' » nommé ' + m + ' (présents : ' + JSON.stringify(noms).slice(0, 600) + ')');
    }
    if (await l.getAttribute('aria-disabled') === 'true') { throw new ErreurJeu('séance ' + this.k + ' : bouton inactif ' + m); }
    await l.click();
    if (options.attendre) { await options.attendre(); }
    this.nbGestes++;
    await this.releverSiVoulu(role + ' ' + (nom instanceof RegExp ? nom.source : nom));
  }
  async bouton(zone, nom, options) { return this.toucher(zone, 'button', nom, options); }

  async present(zone, role, nom) { return (await zone.getByRole(role, { name: motif(nom) }).count()) > 0; }

  /** Tout geste qui affiche « En attendant » consomme la prochaine heure prévue. */
  async avantAttente() {
    if (!this.lectures.length) { throw new ErreurJeu('séance ' + this.k + ' : « En attendant » affiché sans heure prévue au journal'); }
    const h = this.lectures.shift();
    const t = prochaineHeure(this.derniereLecture !== null ? this.derniereLecture : ms(this.j.seances[this.k].ouverture), h, this.derniereLecture !== null);
    this.derniereLecture = t;
    await this.heure(t);
  }

  /* ---------------- copies en cours d'essai (règle 14 ; §8.9, §8.12) ---------------- */
  etatModele() { return { coups: this.modele.coups, versions: this.modele.versions, etapes: this.modele.etapes }; }
  async peutCopier() {
    while (this.copiesAFaire.length && this.copiesAFaire[0].k === this.k) {
      const c = this.copiesAFaire[0];
      if (!egal({ coups: c.coups, versions: c.versions, etapes: c.etapes }, this.etatModele())) { return; }
      this.copiesAFaire.shift();
      await this.copierEnCours();
    }
  }
  async copierEnCours() {
    const ecranAvant = await this.page.evaluate(() => window.ElenchosEssai.etat().vue.tel.ecran);
    await this.bouton(this.tel, X.ongletMoi);
    await this.bouton(this.tel, X.reglagesNom);
    await this.bouton(this.tel, X.toutEffacer);
    await this.bouton(this.bande, X.copierCarnetDabord);
    const zone = await this.page.locator('#zone-carnet').textContent();
    await this.bouton(this.bande, X.copierCarnet, { attendre: () => this.messageCopie() });
    const presse = await this.lirePressePapiers();
    this.copiesTextes.push({ k: this.k, zone, presse });
    await this.bouton(this.bande, X.fermer);
    await this.bouton(this.bande, X.annuler);
    // retour à l'écran du jour
    if (ecranAvant === 'attente') { await this.avantAttente(); }
    await this.bouton(this.tel, X.ongletAujourdhui);
  }
  /** La copie se fait par une promesse (presse-papiers) : le message de la bande vient après le geste. */
  async messageCopie() { await this.bande.getByRole('status').waitFor({ state: 'visible', timeout: 5000 }); }
  async lirePressePapiers() {
    try { return await this.page.evaluate(() => navigator.clipboard.readText()); } catch (e) { return null; }
  }

  /* ---------------- séance 0 ---------------- */
  async seance0() {
    const s = this.j.seances[0], c = s.coups;
    await this.heure(ms(s.ouverture));
    this.modele = { coups: copieProfonde(c), versions: s.versions, etapes: null };
    // premier message, puis « Qui est qui ? » (§8.2)
    await this.bouton(this.bande, X.continuer);
    await this.bouton(this.bande, X.fermer);
    await this.verifierVersions();
    // 1.1
    await this.bouton(this.tel, /^\s*Elenchos/);
    let consenti = false;
    for (const E of ['E1', 'E2', 'E3']) {
      const e = c.entree[E];
      if (e.reponse === null) { return 'entree'; }
      await this.bouton(this.tel, X.POSITIONS[e.reponse.niveau - 1]);
      if (!consenti) { await this.bouton(this.tel, X.jAccepte); consenti = true; }
      await this.bouton(this.tel, X.suivant);
      const tx = this.scelle.textes[E];
      await this.bouton(this.tel, e.reponse.raison === 'aucune' ? X.aucuneRaison : X.raisonFinLigne(tx.considerations[e.reponse.raison - 1].texte));
      await this.bouton(this.tel, X.valider);
      if (e.pari === null) { return 'entree'; }
      await this.bouton(this.tel, X.POSITIONS[e.pari - 1]);
      await this.bouton(this.tel, X.voirSaReponse);
      await this.bouton(this.tel, E === 'E3' ? X.suivant : X.texteSuivant);
    }
    if (c.pseudo === null) { return 'entree'; }
    await this.bouton(this.tel, X.creerCompte);
    // frappe caractère par caractère (§7.2 : mise en forme à la saisie, champ jamais réécrit)
    await this.tel.getByRole('textbox', { name: motif(X.champPseudo) }).pressSequentially(this.o.saisiePseudo || c.pseudo);
    await this.releverSiVoulu('saisie du pseudo');
    await this.bouton(this.tel, X.recevoirCode);
    await this.bouton(this.tel, X.valider);
    return 'fini';
  }

  /** Après le premier toucher de chaque chargement, le numéro gardé doit être celui de la version servie. */
  async verifierVersions() { /* la comparaison se fait à la fin, sur la mémoire et le journal */ }

  /* ---------------- carnet du jour ---------------- */
  async repondreCarnet(q) {
    const libelles = { q1: X.choixQ1, q2: X.choixQ2, q3: X.choixQ3 };
    for (const cle of ['q1', 'q2', 'q3']) {
      if (q[cle] !== null) { await this.bouton(this.cadre, libelles[cle][q[cle]]); }
    }
  }

  /* ---------------- révélation ---------------- */
  /** Joue la révélation jusqu'à « Jouer » (exclu) ou jusqu'à la page du cadre (séance 15). */
  async revelation(jusquAJouer) {
    for (let garde = 0; garde < 40; garde++) {
      const enCadre = await this.cadre.isVisible();
      if (enCadre) { return 'cadre'; }
      const fiche = await this.page.evaluate(() => window.ElenchosEssai.etat().vue.tel.ecran);
      if (fiche !== 'revelation') { return fiche; }
      if (await this.present(this.tel, 'button', X.retournerCarte)) {
        await this.bouton(this.tel, X.retournerCarte);
        await this.tel.locator('.apres:not(.cache)').waitFor({ state: 'attached' });
        await this.tel.getByRole('button', { name: motif(X.suivant) }).waitFor();
        await this.releverSiVoulu('carte retournée');
        continue;
      }
      if (this.croixAFaire) { this.croixAFaire = false; await this.bouton(this.tel, X.fermer); }
      if (await this.present(this.tel, 'button', X.jouer)) {
        if (jusquAJouer) { return 'jouer'; }
        await this.bouton(this.tel, X.jouer);
        return 'joue';
      }
      await this.bouton(this.tel, X.suivant);
    }
    throw new ErreurJeu('séance ' + this.k + ' : révélation sans fin');
  }

  /* ---------------- Deviner ---------------- */
  async deviner(coups, g) {
    const m = this.modele;
    m.etapes.deviner = true;
    await this.peutCopier();
    for (let i = 0; i < coups.relire; i++) {
      await this.bouton(this.tel, X.relire);
      await this.bouton(this.tel, '← ' + X.retour);
      m.coups.relire += 1;
      await this.peutCopier();
    }
    if (g.rechargerApres === 'copie') { await this.correctif(); }
    const valide = coups.deviner.every(d => d.designe !== null);
    if (!valide) {
      for (const a of (g.attribuerSansValider || [])) {
        const carte = this.tel.getByRole('group', { name: 'Réponse ' + (a.carte + 1), exact: true });
        if (a.membre === 'passe') { await this.bouton(carte, X.passer); } else { await this.bouton(carte, a.membre); }
      }
      return false;
    }
    for (let i = 0; i < coups.deviner.length; i++) {
      const d = coups.deviner[i];
      const carte = this.tel.getByRole('group', { name: 'Réponse ' + (i + 1), exact: true });
      if (d.designe === 'passe') { await this.bouton(carte, X.passer); continue; }
      await this.bouton(carte, d.designe);
      if (d.raison !== null) {
        await this.bouton(carte, X.devineAussi);
        const tx = this.scelle.textes[String(this.k - 1)];
        await this.bouton(this.tel.locator('.feuille'), d.raison === 'aucune' ? X.aucuneRaison : X.raisonFinLigne(tx.considerations[d.raison - 1].texte));
        await this.bouton(this.tel.locator('.feuille'), X.choisir);
      }
    }
    await this.bouton(this.tel, X.valider);
    m.coups.deviner = copieProfonde(coups.deviner);
    await this.peutCopier();
    if (g.rechargerApres === 'deviner') { await this.correctif(); }
    return true;
  }

  async correctif() {
    const vs = this.j.seances[this.k].versions;
    const suivante = vs[vs.length - 1];
    await this.recharger(suivante);
    this.modele.versions = vs.slice();
  }

  /* ---------------- Répondre ---------------- */
  async repondre(coups, g) {
    const m = this.modele;
    m.etapes.repondre = true;
    await this.peutCopier();
    if (coups.reponse === null) {
      if (g.positionSansRaison) {
        await this.bouton(this.tel, X.POSITIONS[g.positionSansRaison - 1]);
        await this.bouton(this.tel, X.suivant);
      }
      return false;
    }
    const tx = this.scelle.textes[String(this.k)];
    await this.bouton(this.tel, X.POSITIONS[coups.reponse.niveau - 1]);
    await this.bouton(this.tel, X.suivant);
    await this.bouton(this.tel, coups.reponse.raison === 'aucune' ? X.aucuneRaison : X.raisonFinLigne(tx.considerations[coups.reponse.raison - 1].texte));
    await this.avantAttente();
    await this.bouton(this.tel, X.valider);
    m.coups.reponse = copieProfonde(coups.reponse);
    await this.peutCopier();
    if (g.rechargerApres === 'reponse') { await this.correctif(); if (await this.ecranTel() === 'attente') { /* relu au chargement */ } }
    return true;
  }

  async ecranTel() { return this.page.evaluate(() => window.ElenchosEssai.etat().vue.tel.ecran); }

  /** Lectures supplémentaires : Le Cercle, puis Aujourd'hui (une lecture par retour). */
  async lecturesEnPlus(n) {
    for (let i = 0; i < n; i++) {
      await this.bouton(this.tel, X.ongletCercle);
      await this.avantAttente();
      await this.bouton(this.tel, X.ongletAujourdhui);
    }
  }

  /* ---------------- une séance de jeu (1 à 14) ---------------- */
  async seanceJour(k, estArret) {
    const s = this.j.seances[k], c = s.coups, g = Object.assign({}, this.gestes[k] || {});
    if (s.versions.length > 1 && !g.rechargerApres) { g.rechargerApres = 'ouverture'; }
    this.modele = { coups: { carnet: { q1: null, q2: null, q3: null }, consentement: null, deviner: Array.isArray(c.deviner) ? c.deviner.map(() => ({ designe: null, raison: null })) : null,
      entree: null, pseudo: null, relire: 0, reponse: null }, versions: [s.versions[0]], etapes: { deviner: false, repondre: false } };
    // séance atteinte sous un numéro, ouverte sous le suivant (partie 4.4)
    if (s.versions[0] !== this.version) { await this.recharger(s.versions[0]); }
    await this.heure(ms(s.ouverture));
    // premier toucher : message de 18h (3 à 14), sinon l'en-tête du jour
    this.croixAFaire = !!g.croix;
    if (k >= 3) {
      await this.bouton(this.tel, X.notifMeta, { debut: true });
    } else {
      await this.toucher(this.tel, 'heading', X.aujourdhui(X.JOURS_SEANCE[k]));
    }
    if (g.rechargerApres === 'ouverture') { await this.correctif(); }
    let ecran = await this.ecranTel();
    if (ecran === 'revelation') {
      const fin = await this.revelation(!s.etapes.deviner && !s.etapes.repondre);
      if (fin === 'jouer') { ecran = 'revelation'; } else { ecran = await this.ecranTel(); }
    }
    let valide = true;
    if (ecran === 'deviner') {
      valide = await this.deviner(c, g);
      ecran = await this.ecranTel();
    } else if (Array.isArray(c.deviner) && c.deviner.length && s.etapes.deviner) {
      throw new ErreurJeu('séance ' + k + ' : Deviner attendu, écran ' + ecran);
    }
    let finie = false;
    if (valide && ecran === 'repondre') {
      finie = await this.repondre(c, g);
    }
    if (g.cercle) { await this.visiterCercle(finie); }
    const qVides = c.carnet.q1 === null && c.carnet.q2 === null && c.carnet.q3 === null;
    // à l'arrêt, un carnet du jour rempli puis « Annuler » rend 2.5 : une lecture de plus
    const reservees = (estArret && !qVides && finie) ? 1 : 0;
    const lecturesRestantes = this.lectures.length - reservees;
    if (finie && lecturesRestantes > 0) { await this.lecturesEnPlus(lecturesRestantes); }
    // fin de la journée : « Jour suivant » (§8.2, §8.3)
    if (g.annulerConfirmation && !finie) {
      await this.bouton(this.bande, X.jourSuivant);
      await this.bouton(this.bande, X.annuler);
    }
    if (estArret && qVides) { return; }
    await this.bouton(this.bande, X.jourSuivant);
    if (!finie) { await this.bouton(this.bande, X.ouiContinuer); }
    await this.repondreCarnet(c.carnet);
    this.modele.coups.carnet = copieProfonde(c.carnet);
    if (estArret) {
      if (finie) { await this.avantAttente(); }
      await this.bouton(this.bande, X.annuler);
      return;
    }
    await this.bouton(this.bande, X.allerJourSuivant);
  }

  /** Le Cercle (4.2), chaque proche (4.3), titres passés (5.5), Moi (5.11, 5.2, 5.3), une fiche (5.4), Réglages (5.7) et
   *  « Qui, durée, droits », un lien vers un écran absent (« + Inviter »). */
  async visiterCercle(finie) {
    await this.bouton(this.tel, X.ongletCercle);
    await this.bouton(this.tel, X.inviter);
    for (const p of PERSOS) {
      await this.bouton(this.tel, new RegExp('^' + p + '\\b'));
      if (await this.present(this.tel, 'button', X.voirTout)) { await this.bouton(this.tel, X.voirTout); }
      await this.bouton(this.tel, '← ' + X.leCercle);
    }
    await this.bouton(this.tel, X.titresPassesLien);
    await this.bouton(this.tel, '← ' + X.leCercle);
    await this.bouton(this.tel, X.ongletMoi);
    await this.bouton(this.tel, X.sousOnglets[1]);
    await this.bouton(this.tel, X.sousOnglets[2]);
    const lignes = this.tel.locator('.listrow[data-action="fiche"]');
    if (await lignes.count()) {
      await lignes.first().click();
      this.nbGestes++;
      await this.releverSiVoulu('fiche depuis l’Historique');
      await this.bouton(this.tel, '← ' + X.retour);
    }
    await this.bouton(this.tel, X.sousOnglets[0]);
    await this.bouton(this.tel, X.reglagesNom);
    await this.bouton(this.tel, X.quiDureeDroits);
    await this.bouton(this.bande, X.fermer);
    if (finie) { await this.avantAttente(); }
    await this.bouton(this.tel, X.ongletAujourdhui);
  }

  /* ---------------- arrêt (§8.10) et clôture (§7.4) ---------------- */
  async remplirF1(f1) {
    for (const p of PERSOS) {
      for (const code of ['S', 'P', 'T', 'L']) {
        const v = f1[p][code];
        if (v === null) { continue; }
        const poles = T8.find(x => x.code === code).poles;
        const groupe = this.cadre.getByRole('radiogroup', { name: motif(p + ' : ' + poles[0] + ' ou ' + poles[1]) });
        const aria = p + ' : ' + (v === 'milieu' ? X.auMilieu : (v === 'pole0' ? poles[0] : poles[1]));
        await this.toucher(groupe, 'radio', aria);
      }
    }
  }
  async exporterEtDevoiler() {
    this.carnetZone = await this.page.locator('#zone-carnet').textContent();
    await this.bouton(this.bande, X.copierCarnet, { attendre: () => this.messageCopie() });
    this.carnetCopie = await this.lirePressePapiers();
    await this.bouton(this.bande, X.voirDevoilement);
  }
  async arret(a) {
    await this.bouton(this.barre, X.arreterLEssai);
    await this.bouton(this.bande, X.arreterLEssai);
    if (a.raison !== null) { await this.bouton(this.cadre, X.choixArret[a.raison]); }
    if (a.k >= 3 && a.f2 !== null) { await this.bouton(this.cadre, X.choixF2[a.f2]); }
    await this.bouton(this.bande, X.continuer);
    if (a.k >= 3) {
      if (a.f1 === null) { await this.bouton(this.bande, X.sauterQuestion); }
      else { await this.remplirF1(a.f1); await this.bouton(this.bande, X.continuer); }
    }
    await this.exporterEtDevoiler();
  }
  async cloture() {
    const s = this.j.seances[15], c = s.coups, f = this.j.fin;
    this.modele = null;
    if (s.versions[0] !== this.version) { await this.recharger(s.versions[0]); }
    await this.heure(ms(s.ouverture));
    const fin = await this.revelation(false);
    if (fin !== 'cadre' && fin !== 'fiche') { throw new ErreurJeu('clôture : écran inattendu ' + fin); }
    if (await this.present(this.bande, 'button', X.continuer) && await this.page.evaluate(() => window.ElenchosEssai.etat().vue.cadre && window.ElenchosEssai.etat().vue.cadre.page === 'carnet')) {
      if (c.carnet.q1 !== null) { await this.bouton(this.cadre, X.choixQ1[c.carnet.q1]); }
      await this.bouton(this.bande, X.continuer);
    }
    // fiche du texte 14, puis F2 et F1
    await this.bouton(this.bande, X.continuer);
    if (f.f2 !== null) { await this.bouton(this.cadre, X.choixF2[f.f2]); }
    await this.bouton(this.bande, X.continuer);
    await this.remplirF1(f.f1);
    await this.bouton(this.bande, X.continuer);
    await this.exporterEtDevoiler();
  }

  /* ---------------- la partie ---------------- */
  async jouer(scelle) {
    this.scelle = scelle;
    const J = this.j;
    const K = J.seances.length - 1;
    await this.servir(J.seances[0].versions[0]);
    await this.charger();
    for (let k = 0; k <= K; k++) {
      this.k = k;
      const s = J.seances[k];
      this.lectures = s.attente ? s.attente.lectures.map(l => l.heure) : [];
      this.derniereLecture = null;
      const estArret = J.arret !== null && k === K;
      if (k === 0) {
        const r = await this.seance0();
        if (r === 'entree') { if (!estArret) { throw new ErreurJeu('entrée inachevée sans arrêt'); } break; }
        if (estArret) {
          if (s.coups.carnet.q1 !== null || s.coups.carnet.q2 !== null || s.coups.carnet.q3 !== null) { await this.repondreCarnet(s.coups.carnet); }
          await this.bouton(this.bande, X.annuler);
          break;
        }
        await this.repondreCarnet(s.coups.carnet);
        await this.bouton(this.bande, X.allerJourSuivant);
        continue;
      }
      if (k === 15) { await this.cloture(); break; }
      await this.seanceJour(k, estArret);
      if (this.lectures.length) { throw new ErreurJeu('séance ' + k + ' : lectures prévues non faites : ' + this.lectures.join(', ')); }
    }
    if (J.arret) { await this.arret(J.arret); }
    if (this.copiesAFaire.length) { throw new ErreurJeu('copies non faites : ' + this.copiesAFaire.length); }
    return this.resultat();
  }

  async resultat() {
    const page = this.page;
    const r = {
      journalPage: await page.evaluate(() => window.ElenchosEssai.journal()),
      memoire: await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const c = localStorage.key(i); o[c] = localStorage.getItem(c); } return o; }),
      carnetZone: this.carnetZone, carnetCopie: this.carnetCopie, copies: this.copiesTextes,
      releves: this.releves, erreurs: this.env.journalErreurs.slice(), requetesRefusees: this.env.service.refusees.slice(),
      gestes: this.nbGestes
    };
    if (this.o.temoin) {
      r.trace = await page.evaluate(([partie, precedents]) => window.ElenchosTemoin.trace(partie, precedents), [this.j.partie, this.precedents]);
    }
    return r;
  }
}

module.exports = { Joueur, ErreurJeu, motif, prochaineHeure, ms };
