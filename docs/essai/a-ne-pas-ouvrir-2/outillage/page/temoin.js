/* Bloc de la version témoin, second essai (simulation-2.md, §9 ; schéma, parties 4.1 à 4.3).
 *
 * Présent dans la seule version témoin, placé avant le script principal, avec
 * trace.js (ElenchosTrace) devant lui. Il n'ajoute ni bouton ni export, ne
 * recalcule rien que la page ne calcule déjà : il lit le point d'accès
 * window.ElenchosEssai (socle.js) et met les résultats au format des traces.
 *
 *   ElenchosTemoin.releves()            -> {lectures, copies} du chargement en cours
 *   ElenchosTemoin.trace(partie, precedents) -> trace de partie v4 (mode interface)
 *   ElenchosTemoin.traceMoteur(journal) -> trace de partie v4 d'un journal donné (mode moteur)
 *   ElenchosTemoin.traceHistoire()      -> trace de l'histoire v1 (une fois par fichier)
 */
'use strict';

var ElenchosTemoin = (function (TR) {
  function E() { return window.ElenchosEssai; }

  /** Relevés du chargement en cours (« relevés hors de la mémoire ») : lectures d'« En attendant », copies du carnet. */
  function releves() { return { lectures: E().lectures(), copies: E().copies() }; }

  /**
   * Trace de la partie jouée (mode interface). partie : {graine, id, mode} (harnais) ;
   * precedents : relevés des chargements précédents, pris par le harnais avant chaque
   * rechargement ; mis bout à bout avec ceux du chargement en cours.
   */
  function trace(partie, precedents) {
    var tous = (precedents || []).concat([releves()]);
    var lectures = [], copies = [];
    tous.forEach(function (r) { lectures = lectures.concat(r.lectures); copies = copies.concat(r.copies); });
    var j = E().journal();
    j.partie = partie;
    Object.keys(j.jours).forEach(function (k) {
      var ls = lectures.filter(function (l) { return String(l.jour) === k; });
      j.jours[k].attente = ls.length ? { lectures: ls.map(function (l) { return { heure: l.heure }; }) } : null;
    });
    var R = E().calculer(j);
    return TR.partie(j, R, E().durees(), E().carnet(), copies, E().empreinte(), E().resumeSha256());
  }

  /** Rejeu d'un journal par le moteur de la version témoin seul (mode moteur, partie 4.1). */
  function traceMoteur(journal) {
    return TR.partie(journal, E().calculer(journal), null, null, [], E().empreinte(), E().resumeSha256());
  }

  /** Trace de l'histoire (partie 4.2), calculée par la page dans le navigateur. */
  function traceHistoire() {
    var collecte = {};
    var a = E().histoire(collecte);
    return TR.histoire(collecte, E().resume(a), E().resumeSha256(a), E().empreinte());
  }

  window.ElenchosTemoin = Object.freeze({ releves: releves, trace: trace, traceMoteur: traceMoteur, traceHistoire: traceHistoire });
  return window.ElenchosTemoin;
})(ElenchosTrace);
