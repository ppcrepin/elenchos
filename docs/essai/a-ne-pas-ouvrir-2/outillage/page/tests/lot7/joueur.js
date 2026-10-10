/* Lot 7, part B : joueur par l'interface. Il lit les boutons affichés et l'état (point d'accès en
 * lecture), décide selon un plan et une graine, et touche. Chaque geste est relevé (contrôles 10, 11).
 *
 * Plan (tout est facultatif) :
 *   graine            entier : tous les choix au hasard en découlent
 *   pseudo, voie      pseudo tapé en 1.8 ; voie : 'apple' | 'google' | 'email' | 'email_plus_tard'
 *   pseudosRefuses    pseudos tapés d'abord (refus attendu, message relevé)
 *   pPasser, pRaison, pRelire, pVisite, pVisiteDeviner, pChanger   probabilités des gestes
 *   croix             { jour: true } : révélation fermée par la croix, puis rouverte (« Reprendre »)
 *   revoir            { jour: true } : « Revoir la révélation » une fois la journée finie
 *   abandons          { jour: 'revelation' | 'deviner' | 'repondre' } : « Abandonner cette journée »
 *   arret             { jour, moment: 'entree' | 'compte' | 'revelation' | 'deviner' | 'repondre' | 'attente' | 'saut' | 'ratt-N' }
 *   recharges         [{ jour, ecran, rang }] : rechargement quand l'écran est affiché (rang : texte du rattrapage)
 *   fermetures        [{ jour, ecran, rang, ms }] : l'app fermée (page fermée) puis rouverte dans la même mémoire
 *   annulerSaut       { 1: true, 2: true } : « Annuler » sur la page du saut, puis le saut
 *   effacer           true : « Tout effacer » après le dévoilement
 *   pause             (s, info) => promesse : appelé avant chaque geste (horloge de l'outil, contrôle 14 i)
 */
'use strict';
const O = require('./outils.js');

const MAX_GESTES = 4000;

async function jouer(s, plan, options) {
  const o = options || {};
  const R = O.hasard(plan.graine || 1);
  const p = (x, d) => (plan[x] === undefined ? d : plan[x]);
  const mem = { faits: new Set(), choix: {}, visites: [], gestes: [], releve: [], blocs: new Map(), pseudoFait: false, refusIdx: 0 };
  const une = (cle) => { if (mem.faits.has(cle)) { return false; } mem.faits.add(cle); return true; };
  let fini = false, n = 0, raisonFin = null;
  /** Joueur qui tranche (plan.trancher = pôle visé, 0 ou 1, par tension) : « Très » du côté du pôle, argument attendu. */
  function tranche(t) {
    const tx = s.construction.scelle.textes[t];
    if (!plan.trancher || !tx || plan.trancher[tx.tension] === undefined) { return null; }
    const P = plan.trancher[tx.tension];
    const niveau = tx.sens === P ? 5 : 1, cote = niveau === 5 ? 'pour' : 'contre';
    const att = tx.considerations.find((x) => x.cote === cote && x.pole === P) || tx.considerations.find((x) => x.cote === cote && x.pole === 'aucun');
    return { niveau: String(niveau), raison: att ? String(att.rang) : 'aucune' };
  }

  async function noter(action) {
    const r = await O.relever(s.page);
    if (o.coupures) { r.coupures = await O.coupures(s.page, o.groupes); }
    const cle = (r.cadre || '-') + '|' + (r.ecran || '-');
    r.blocs.forEach((b) => { if (!mem.blocs.has(b)) { mem.blocs.set(b, cle); } });
    delete r.blocs;
    r.n = n; r.action = action;
    mem.releve.push(r);
    return r;
  }

  await noter('chargement');
  while (!fini) {
    if (++n > MAX_GESTES) { throw new Error('partie trop longue (' + MAX_GESTES + ' gestes)'); }
    if (s.erreurs.length) { throw new Error('erreur de la page : ' + s.erreurs.join('\n')); }
    const e = await O.etat(s.page);
    const L = await O.actions(s.page);
    const G = O.grouper(L);
    const has = (a) => !!(G[a] && G[a].length);
    const pick = (a, f) => { const l = (G[a] || []).filter(f || (() => true)); return l.length ? R.parmi(l) : null; };
    const vue = e ? e.vue : null;
    const ecran = vue && vue.tel ? vue.tel.ecran : null;
    const cadre = vue && vue.cadre ? vue.cadre.page : null;
    const k = e ? Math.max.apply(null, Object.keys(e.jours).map(Number)) : null;
    const dj = e && k !== null ? e.jours[String(k)] : null;
    const ratt = await s.page.evaluate(() => { const m = /(Premier|Second) saut · texte (\d+) sur/.exec(document.body.innerText.replace(/[\u00a0\u202f]/g, ' ')); return m ? { saut: m[1] === 'Premier' ? 1 : 2, rang: +m[2] } : null; });
    const rangRatt = ratt ? ratt.rang : null;
    const sautRatt = ratt ? ratt.saut : null;
    const correspond = (r) => (r.saut !== undefined ? r.saut === sautRatt : r.jour === k) && r.ecran === (ecran || cadre) && (r.rang === undefined || r.rang === rangRatt);
    const info = { k, ecran, cadre, rangRatt, n };
    if (o.jusqua && await o.jusqua(info, e, s)) { fini = true; raisonFin = 'jusqua'; break; }
    if (plan.pause) { await plan.pause(s, info); }

    let x = null, special = null;

    // Fin : le dévoilement est atteint.
    if (cadre === 'devoilement') {
      if (plan.effacer && has('effacer') && une('effacer')) { x = pick('effacer'); }
      else if (has('effacer-confirmer')) { x = pick('effacer-confirmer'); }
      else { fini = true; raisonFin = 'devoilement'; break; }
    }
    // Rechargement et fermeture de l'app aux moments du plan.
    if (!x) {
      for (const [i, r] of (plan.recharges || []).entries()) {
        if (correspond(r) && une('recharge-' + i)) { special = { type: 'recharge' }; break; }
      }
    }
    if (!x && !special) {
      for (const [i, r] of (plan.fermetures || []).entries()) {
        if (correspond(r) && une('fermeture-' + i)) { special = { type: 'fermeture', ms: r.ms || 0 }; break; }
      }
    }
    // Arrêt de l'essai au moment du plan.
    const ar = plan.arret;
    if (!x && !special && ar && !e.arret && (ar.saut !== undefined ? ar.saut === sautRatt : k === ar.jour)) {
      const m = ar.moment;
      const ok = (m === 'entree' && ecran && /^1\.[2-6]$/.test(ecran)) || (m === 'compte' && (ecran === '1.8' || ecran === '1.8b' || ecran === '1.9')) ||
        (m === 'revelation' && ecran === 'revelation') || (m === 'deviner' && ecran === 'deviner') || (m === 'repondre' && ecran === 'repondre') ||
        (m === 'attente' && ecran === 'attente') || (m === 'apres-annuler' && ecran === 'revelation' && mem.faits.has('annuler-saut-' + k)) || (/^ratt-/.test(m) && rangRatt === +m.slice(5) && ecran === 'ratt-position') ||
        (m === 'verrou' && ecran === 'verrou');
      if (ok && has('arreter')) { x = pick('arreter'); }
    }
    if (!x && !special && has('arret-confirmer')) { x = pick('arret-confirmer'); }
    if (!x && !special && cadre === 'arret-questions') {
      if (has('arret-raison') && une('arret-raison')) { x = pick('arret-raison'); }
      else if (has('arret-f2') && une('arret-f2')) { x = pick('arret-f2'); }
      else if (has('arret-continuer')) { x = pick('arret-continuer'); }
    }
    // Pages du cadre.
    if (!x && !special) {
      if (has('ancienne-effacer') || has('ancienne-confirmer') || has('ancienne-annuler')) {
        const voulu = plan.ancienne || 'ancienne-effacer';
        x = pick(has(voulu) ? voulu : (has('ancienne-confirmer') ? 'ancienne-confirmer' : 'ancienne-annuler'));
      } else if (has('message0-continuer')) { x = pick('message0-continuer'); }
      else if (has('commencer')) { x = pick('commencer'); }
      else if (cadre === 'effacer') { x = pick(has('fermer-page') ? 'fermer-page' : 'effacer-confirmer'); }
      else if (cadre === 'cloture-questions') {
        const cles = [...new Set((G['fin-choix'] || []).map((y) => y.d.cle))].filter((c) => !mem.faits.has('fin-' + c));
        if (cles.length) { const c = cles[0]; mem.faits.add('fin-' + c); if (R.oui(0.9)) { x = pick('fin-choix', (y) => y.d.cle === c); } }
        if (!x) { x = pick('cloture-continuer'); }
      } else if (cadre === 'export') {
        x = pick('voir-devoilement') || pick('aller-jour-suivant') || pick('export-fermer');
      } else if (cadre === 'carnet') {
        const qs = [...new Set((G['carnet-q'] || []).map((y) => y.d.q))].filter((q) => !mem.faits.has('cq-' + k + '-' + q));
        if (qs.length) { const q = qs[0]; mem.faits.add('cq-' + k + '-' + q); if (R.oui(0.85)) { x = pick('carnet-q', (y) => y.d.q === q); } }
        if (!x && has('carnet-hesite') && une('ch-' + k) && R.oui(0.6)) { x = pick('carnet-hesite'); }
        if (!x) { x = pick('aller-jour-suivant'); }
      } else if (cadre === 'saut') {
        if (plan.annulerSaut && plan.annulerSaut[k === 4 ? 1 : 2] && has('saut-annuler') && une('annuler-saut-' + k)) { x = pick('saut-annuler'); }
        else { x = pick('saut-confirmer'); }
      } else if (cadre === 'arret-confirmation') { x = pick('arret-confirmer'); }
      else if (cadre === 'quiestqui' || cadre === 'droits') { x = pick('fermer-page') || pick('retour'); }
    }
    // Abandon d'une journée au moment du plan.
    if (!x && !special && plan.abandons && plan.abandons[k] && !e.arret) {
      const m = plan.abandons[k];
      if (has('abandon-confirmer')) { x = pick('abandon-confirmer'); }
      else if (has('abandonner') && ((m === 'revelation' && ecran === 'revelation') || (m === 'deviner' && ecran === 'deviner' && dj.coups.deviner && dj.coups.deviner.cartes.some((c) => c.designe !== null)) ||
        (m === 'repondre' && ecran === 'repondre')) && une('abandon-' + k)) { x = pick('abandonner'); }
    }
    if (!x && !special && has('abandon-confirmer')) { x = pick('abandon-annuler'); }
    // Feuilles (raison devinée, relire).
    if (!x && !special && (has('feuille-choisir') || has('feuille-raison'))) {
      if (has('feuille-choisir')) { x = pick('feuille-choisir'); }
      else { x = pick('feuille-raison'); }
    }
    if (!x && !special && has('feuille-fermer') && !has('feuille-raison')) { x = pick('feuille-fermer'); }
    // Visites prévues (Le Cercle, un proche, Moi…).
    if (!x && !special && mem.visites.length) {
      while (mem.visites.length && !x) { const a = mem.visites.shift(); x = pick(a); }
    }
    // Téléphone.
    if (!x && !special) {
      if (has('notification')) { x = pick('notification'); }
      else if (has('apercu')) { x = pick('apercu'); }
      else if (has('consentement-accepter')) { x = pick('consentement-accepter'); }
      else if (ecran === 'revelation') {
        if (plan.croix && plan.croix[k] && has('croix') && une('croix-' + k)) { x = pick('croix'); }
        else { x = pick('retourner') || pick('rev-suivant') || pick('rev-jouer') || pick('rev-fin-cloture'); }
      }
      else if (has('cloture-apres-dernier')) { x = pick('cloture-apres-dernier'); }
      else if (has('rouvrir') && plan.croix && plan.croix[k] && mem.faits.has('croix-' + k) && une('rouvrir-' + k)) { x = pick('rouvrir'); }
      else if (has('rouvrir') && plan.revoir && plan.revoir[k] && ecran === 'attente' && une('revoir-' + k)) { x = pick('rouvrir'); }
      else if (/^1\.[2-6]$/.test(ecran || '')) {
        if (has('entree-texte-suivant')) { x = pick('entree-texte-suivant'); }
        else if (has('entree-voir')) { x = pick('entree-voir'); }
        else if (has('entree-pari')) { x = pick('entree-pari'); }
        else if (has('entree-valider-raison')) { x = pick('entree-valider-raison'); }
        else if (has('entree-raison')) { const tc = tranche(vue.tel.E); x = (tc && pick('entree-raison', (y) => y.d.valeur === tc.raison)) || pick('entree-raison'); }
        else if (has('entree-suivant')) { x = R.oui(p('pChanger', 0.05)) && une('ech-' + n) ? pick('entree-position') : pick('entree-suivant'); }
        else if (has('entree-position')) { const tc = tranche(vue.tel.E); x = (tc && pick('entree-position', (y) => y.d.valeur === tc.niveau)) || pick('entree-position'); }
      }
      else if (has('creer-compte')) { x = pick('creer-compte'); }
      else if (ecran === '1.8') {
        const refus = plan.pseudosRefuses || [];
        if (mem.refusIdx < refus.length) { special = { type: 'taper', valeur: refus[mem.refusIdx++] }; }
        else if (!mem.pseudoFait) { mem.pseudoFait = true; special = { type: 'taper', valeur: plan.pseudo || 'Zoé' }; }
        else {
          const v = plan.voie || R.parmi(['apple', 'google', 'email', 'email_plus_tard']);
          x = pick(v === 'apple' ? 'compte-apple' : v === 'google' ? 'compte-google' : 'compte-email');
          if (!x) { throw new Error('1.8 : bouton de compte absent (pseudo refusé ?)'); }
        }
      }
      else if (ecran === '1.8b') { x = pick('recevoir-code'); }
      else if (ecran === '1.9') { x = pick(plan.voie === 'email_plus_tard' ? 'code-plus-tard' : 'code-valider'); }
      else if (ecran === 'deviner') {
        const dv = dj.coups.deviner;
        if (dv && !dv.validee) {
          if (R.oui(p('pVisiteDeviner', 0.08)) && k <= 3 && une('visdev-' + k)) { mem.visites.push('onglet-cercle', 'proche', 'onglet-jour'); x = pick('onglet-cercle'); }
          else if (has('relire') && R.oui(p('pRelire', 0.15)) && une('relire-' + k)) { x = pick('relire'); }
          else {
            const vide = dv.cartes.findIndex((c) => c.designe === null);
            if (vide >= 0) {
              if (R.oui(p('pPasser', 0.12))) { x = pick('passer', (y) => +y.d.carte === vide); }
              if (!x) {
                const pris = new Set(dv.cartes.map((c) => c.designe));
                const libres = O.PERSONNAGES.filter((m) => !pris.has(m));
                const m = libres.length ? R.parmi(libres) : R.parmi(O.PERSONNAGES);
                x = pick('visage', (y) => +y.d.carte === vide && y.d.membre === m) || pick('visage', (y) => +y.d.carte === vide) || pick('passer', (y) => +y.d.carte === vide);
              }
            } else {
              const raisonAFaire = (G['devine-pourquoi'] || []).filter((y) => !mem.faits.has('dp-' + k + '-' + y.d.carte));
              if (raisonAFaire.length && R.oui(p('pRaison', 0.6))) { const y = raisonAFaire[0]; mem.faits.add('dp-' + k + '-' + y.d.carte); x = y; }
              else { raisonAFaire.forEach((y) => mem.faits.add('dp-' + k + '-' + y.d.carte)); x = pick('deviner-valider'); }
            }
          }
        }
      }
      else if (ecran === 'repondre' || ecran === 'raison' || ecran === 'ratt-position' || ecran === 'ratt-raison') {
        const pre = /^ratt/.test(ecran) ? 'ratt' : 'jour';
        x = pick(pre + '-valider-raison') || (pre === 'ratt' ? pick('ratt-valider') : null);
        const tA = pre === 'ratt' ? (vue.tel.jour ? s.construction.cal.ligne(vue.tel.jour).repondu : null) : s.construction.cal.ligne(k).repondu;
        const tc = tA ? tranche(tA) : null;
        if (!x && has(pre + '-raison')) { x = (tc && pick(pre + '-raison', (y) => y.d.valeur === tc.raison)) || pick(pre + '-raison'); }
        if (!x && has(pre + '-suivant-raison')) { x = !tc && R.oui(p('pChanger', 0.05)) && une('chg-' + n) ? pick(pre + '-position') : pick(pre + '-suivant-raison'); }
        if (!x && has(pre + '-position')) { x = (tc && pick(pre + '-position', (y) => y.d.valeur === tc.niveau)) || pick(pre + '-position'); }
      }
      else if (ecran === 'ratt-attente') { x = pick('texte-suivant') || pick('aller-au-dimanche'); }
      else if (ecran === 'attente') {
        if (plan.visitesCompletes && une('visite-' + k)) {
          mem.visites.push('proche', 'retour', 'onglet-moi', 'moi-portrait', 'retour', 'moi-titres', 'retour', 'titres-passes', 'retour', 'moi-historique', 'retour', 'onglet-cercle', 'titres-passes', 'retour', 'onglet-jour');
          x = pick('onglet-cercle');
        }
        if (!x && une('visite-' + k) && R.oui(p('pVisite', 0.3))) {
          mem.visites.push('proche', 'retour', 'onglet-moi', R.parmi(['moi-titres', 'moi-historique', 'moi-portrait', 'titres-passes']), 'retour', 'onglet-jour');
          x = pick('onglet-cercle');
        }
        if (!x) { x = pick('jour-suivant') || pick('ouvrir-saut') || pick('aller-jour-suivant'); }
      }
      else if (ecran === 'verrou') { x = pick('notification'); }
      else if (['cercle', 'proche', 'fiche', 'moi-portrait', 'moi-titres', 'moi-historique', 'titres-passes', 'reglages'].includes(ecran)) { x = pick('retour') || pick('onglet-jour'); }
    }
    // Repli : la suite de la journée.
    if (!x && !special) { x = pick('ouvrir-saut') || pick('texte-suivant') || pick('aller-au-dimanche') || pick('jour-suivant') || pick('aller-jour-suivant') || pick('onglet-jour') || pick('retour'); }
    if (!x && !special) {
      if (e && (e.arret || e.fin) && !cadre) { fini = true; raisonFin = 'close sans dévoilement'; break; }
      throw new Error('aucun geste possible : ' + JSON.stringify(info) + ' ; boutons : ' + L.map((y) => y.a).join(', '));
    }

    if (special && special.type === 'recharge') {
      // Horloge de l'outil : le passage en arrière-plan est fixé par l'outil, comme pour une fermeture (sinon WebKit
      // et Chromium ne le signalent pas de la même façon au rechargement).
      if (plan.horloge) { await s.page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); }); }
      await s.page.reload(); await s.page.waitForTimeout(50);
      mem.gestes.push({ n, special: 'recharge', k, ecran: ecran || cadre });
      await noter('rechargement');
      continue;
    }
    if (special && special.type === 'fermeture') {
      // L'app passe en arrière-plan (évènement de visibilité, comme iOS), puis elle est fermée.
      await s.page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      await s.page.close({ runBeforeUnload: true });
      s.page = await s.ctx.newPage();
      if (plan.horloge && special.ms) { await s.ctx.clock.fastForward(special.ms); }
      s.page.on('pageerror', (er) => s.erreurs.push(String(er && er.stack || er)));
      await s.page.goto(O.ADRESSE); await s.page.waitForTimeout(50);
      mem.gestes.push({ n, special: 'fermeture', k, ecran: ecran || cadre, F: info.F });
      await noter('reouverture');
      continue;
    }
    if (special && special.type === 'taper') {
      await s.page.locator('#champ-pseudo').fill(special.valeur);
      await s.page.waitForTimeout(10);
      mem.gestes.push({ n, special: 'pseudo', valeur: special.valeur });
      await noter('pseudo:' + special.valeur);
      continue;
    }
    mem.gestes.push({ n, a: x.a, d: x.d, k, ecran, cadre, F: info.F });
    const t0 = Date.now();
    await O.toucher(s, x);
    if (o.mesurer) { o.mesurer(x, Date.now() - t0); }
    const rr = await noter(x.a + (Object.keys(x.d).length ? ' ' + JSON.stringify(x.d) : ''));
    if (o.apres) { await o.apres(s, rr, x); }
  }
  return { gestes: mem.gestes, releve: mem.releve, blocs: mem.blocs, raisonFin };
}

module.exports = { jouer };
