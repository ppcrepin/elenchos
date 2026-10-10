/* Bloc de la version témoin (simulation.md, §9 ; schema.md, partie 3.1).
 *
 * Présent dans la seule version témoin, placé avant le script principal.
 * Il relève les lectures d'« En attendant » (évènement
 * elenchos-essai:lecture) et, sur demande du harnais, écrit la trace à
 * partir de ce que la page a gardé et calculé (point d'accès
 * window.ElenchosEssai), sans rien recalculer ni rien modifier. Il n'ajoute
 * ni bouton ni export. Avec trace.js (ElenchosTrace) devant lui.
 */
'use strict';

var ElenchosTemoin = (function (TR) {
  var lectures = [];
  window.addEventListener('elenchos-essai:lecture', function (e) { lectures.push(JSON.parse(JSON.stringify(e.detail))); });

  function E() { return window.ElenchosEssai; }

  /** Relevés du chargement en cours (partie 3.1, « Relevés hors de la mémoire »). */
  function releves() { return { lectures: lectures.slice(), copies: E().copies() }; }

  /**
   * Trace de la partie (partie 3.2). partie : {id, mode, graine} (harnais) ;
   * precedents : relevés des chargements précédents, dans l'ordre, que le
   * harnais a pris avant chaque rechargement ; mis bout à bout avec ceux-ci.
   */
  function trace(partie, precedents) {
    var tous = (precedents || []).concat([releves()]);
    var toutesLectures = [], toutesCopies = [];
    tous.forEach(function (r) { toutesLectures = toutesLectures.concat(r.lectures); toutesCopies = toutesCopies.concat(r.copies); });
    var j = E().journal();
    j.partie = partie;
    var R = E().resultats();
    var D = E().durees();
    var seances = j.seances.map(function (s) {
      var ls = toutesLectures.filter(function (l) { return l.seance === s.k; });
      return Object.assign({}, s, { attente: ls.length ? { lectures: ls.map(function (l) { return { heure: l.heure }; }) } : null });
    });
    j.seances = seances;
    var t = TR.assembler(j, R, D, E().carnet(), toutesCopies, E().empreinte());
    t.seances.forEach(function (s) {
      var ls = toutesLectures.filter(function (l) { return l.seance === s.k; });
      s.attente = ls.length ? { lectures: ls.map(function (l) { return { heure: l.heure, visages: l.visages }; }) } : null;
    });
    return t;
  }

  /** Rejeu par le moteur de la version témoin seul (mode moteur, partie 3.1). */
  function traceMoteur(journal) {
    var R = E().calculer(journal);
    var D = journal.seances.map(function (s) { return { k: s.k, duree_seance: null, duree_deviner: null, duree_repondre: null }; });
    var t = TR.assembler(journal, R, D, null, [], E().empreinte());
    t.seances.forEach(function (s, k) { s.attente = R.seances[k].attente ? TR.enTrace(R.seances[k].attente) : null; });
    return t;
  }

  window.ElenchosTemoin = Object.freeze({ releves: releves, trace: trace, traceMoteur: traceMoteur });
  return window.ElenchosTemoin;
})(ElenchosTrace);
