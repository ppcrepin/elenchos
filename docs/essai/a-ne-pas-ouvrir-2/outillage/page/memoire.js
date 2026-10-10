/* Mémoire de la page du second essai (outillage d'essai, D-001 tenu ; lot 1).
 *
 * simulation-2.md, §8.8, « Les clés » et « La partie du premier essai » :
 * - `elenchos-essai:partie-2` porte toute la partie, écrite d'un bloc ;
 * - `elenchos-essai:verif-2` est écrite, relue, puis effacée à chaque chargement ;
 * - la partie du premier essai se repère à la seule présence de la clé
 *   `elenchos-essai:partie` dans la LISTE des clés : la page ne lit jamais
 *   le contenu de `elenchos-essai:partie`, `elenchos-essai:verif` ni
 *   `elenchos-essai:sonde-icone`, et n'y écrit jamais ;
 * - l'effacement de l'ancienne partie retire toutes les clés
 *   « elenchos-essai: » sauf celles du second essai ; « Tout effacer »
 *   les retire toutes.
 *
 * Le stockage est passé en paramètre (window.localStorage dans la page,
 * un faux dans les tests) : ce module ne touche à rien d'autre.
 */
'use strict';

var ElenchosMemoire = (function () {
  var PREFIXE = 'elenchos-essai:';
  var CLE = PREFIXE + 'partie-2';
  var CLE_VERIF = PREFIXE + 'verif-2';
  var CLE_ANCIENNE = PREFIXE + 'partie';
  var CLES_ESSAI_2 = [CLE, CLE_VERIF];

  /** Les clés présentes, lues par leur seule liste (key(i)), jamais par leur contenu. */
  function listeDesCles(stockage) {
    var l = [];
    for (var i = 0; i < stockage.length; i++) {
      var c = stockage.key(i);
      if (c !== null) { l.push(c); }
    }
    return l;
  }

  /**
   * Ce que la liste des clés dit, sans lire aucun contenu :
   * ancienne : la partie du premier essai est là ; restes : les autres clés
   * « elenchos-essai: » qui ne sont pas du second essai (dont l'ancienne).
   */
  function releverCles(stockage) {
    var cles = listeDesCles(stockage);
    var restes = cles.filter(function (c) { return c.indexOf(PREFIXE) === 0 && CLES_ESSAI_2.indexOf(c) < 0; });
    return { ancienne: cles.indexOf(CLE_ANCIENNE) >= 0, partie2: cles.indexOf(CLE) >= 0, restes: restes };
  }

  /** Vérification de la mémoire à chaque chargement (§8.8 du premier essai), avec `verif-2`. */
  function memoireMarche(stockage, jeton) {
    try {
      stockage.setItem(CLE_VERIF, jeton);
      var ok = stockage.getItem(CLE_VERIF) === jeton;
      stockage.removeItem(CLE_VERIF);
      return ok && stockage.getItem(CLE_VERIF) === null;
    } catch (e) { return false; }
  }

  /** Le texte gardé sous `partie-2`, ou null ; la seule clé dont la page lise le contenu. */
  function lireBrut(stockage) { return stockage.getItem(CLE); }

  /**
   * Arrêts V (§8.11 du premier essai) : la partie gardée se lit-elle ? Lecture
   * seule de `partie-2`, jamais de la clé du premier essai ; rien n'est écrit.
   * forme(o) lève si la forme ne convient pas. Toute exception donne faux.
   */
  function partieLisible(stockage, forme) {
    try {
      var brut = lireBrut(stockage);
      if (brut === null) { return false; }
      forme(JSON.parse(brut));
      return true;
    } catch (e) { return false; }
  }

  /**
   * L'état gardé, ou null s'il n'y en a pas. Lève une erreur s'il est
   * illisible (arrêt 1, repère M1) ; verifierForme(o) lève aussi.
   */
  function lireEtat(stockage, verifierForme) {
    var brut = lireBrut(stockage);
    if (brut === null) { return null; }
    var o = JSON.parse(brut);
    verifierForme(o);
    return o;
  }

  /**
   * Écrit l'état d'un bloc, après avoir vérifié que personne d'autre ne
   * l'a changé depuis (arrêt 3, page ouverte deux fois). Rend 'ok',
   * 'arret2' (écriture refusée par le navigateur) ou 'arret3'.
   */
  function ecrire(stockage, etat, verifierForme) {
    var garde;
    try { garde = lireEtat(stockage, verifierForme); } catch (e) { garde = undefined; }
    var compteur = garde ? garde.ecritures : (garde === null ? 0 : -1);
    if (compteur !== etat.ecritures) { return 'arret3'; }
    etat.ecritures += 1;
    try { stockage.setItem(CLE, JSON.stringify(etat)); }
    catch (e) { etat.ecritures -= 1; return 'arret2'; }
    return 'ok';
  }

  /** Efface la partie du premier essai et ses traces : toutes les clés « elenchos-essai: » sauf `partie-2` et `verif-2`. */
  function effacerAncienne(stockage) {
    releverCles(stockage).restes.forEach(function (c) { stockage.removeItem(c); });
  }

  /** « Tout effacer » (5.7, clôture, arrêt) : toutes les clés « elenchos-essai: », sans exception. */
  function toutEffacer(stockage) {
    listeDesCles(stockage).filter(function (c) { return c.indexOf(PREFIXE) === 0; })
      .forEach(function (c) { stockage.removeItem(c); });
  }

  return {
    PREFIXE: PREFIXE, CLE: CLE, CLE_VERIF: CLE_VERIF, CLE_ANCIENNE: CLE_ANCIENNE,
    listeDesCles: listeDesCles, releverCles: releverCles, memoireMarche: memoireMarche,
    lireEtat: lireEtat, partieLisible: partieLisible, ecrire: ecrire, effacerAncienne: effacerAncienne, toutEffacer: toutEffacer
  };
})();

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosMemoire; }
/*node-fin*/
