/* Assemblage de la trace (schema.md, partie 3.2) : outillage d'essai.
 *
 * N'entre jamais dans la version du porteur (simulation.md, §9 : « la
 * version du porteur ne contient aucune fonction de trace »). Sert à
 * rejouer.js et aux tests (Node), et au bloc de la version témoin, qui
 * l'emploie sur les résultats que la page a calculés (point d'accès
 * window.ElenchosEssai), sans rien recalculer (partie 3.1).
 *
 *   assembler(journal, R, D, carnetTexte, copies, empreinte) -> trace
 *   tracer(N, M, scelle, journal, durees, empreinte)          -> trace (Node)
 */
'use strict';

var ElenchosTrace = (function () {

  /** Une fraction du moteur (objet aux champs n et d BigInt) s'écrit « p/q ». */
  function estFraction(v) { return v !== null && typeof v === 'object' && typeof v.n === 'bigint' && typeof v.d === 'bigint'; }

  function enTrace(v) {
    if (estFraction(v)) { return v.toString(); }
    if (Array.isArray(v)) { return v.map(enTrace); }
    if (v !== null && typeof v === 'object') {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = enTrace(v[k]); });
      return o;
    }
    return v;
  }

  function copie(v) { return JSON.parse(JSON.stringify(v)); }

  function seanceTrace(s, r, d) {
    var m = {};
    Object.keys(r.mesures).forEach(function (k) { m[k] = r.mesures[k]; });
    m.duree_seance = d.duree_seance; m.duree_deviner = d.duree_deviner; m.duree_repondre = d.duree_repondre;
    var manches = null;
    if (r.manches) {
      manches = {};
      Object.keys(r.manches).forEach(function (g) {
        var x = r.manches[g];
        manches[g] = { texte: x.texte, possibles: x.possibles, mediane: x.mediane, classement: x.classement,
          departages: x.departages, remplacements: x.remplacements, places: x.places, raison_cachee: x.raison_cachee,
          ordre: x.ordre, cartes: x.cartes, rangs: x.rangs, cotes_attendus: x.cotes_attendus,
          curseur_porteur: x.curseur_porteur, total: x.total };
      });
    }
    return enTrace({
      k: s.k, ouverture: s.ouverture, versions: s.versions, etapes: s.etapes, coups: copie(s.coups),
      entree: r.entree, revelation: r.revelation, manches: manches, phrase_jour: r.phrase_jour, attente: r.attente,
      dimanche: r.dimanche, portrait: r.portrait, curseurs_vus: r.curseurs_vus, surprises_proches: r.surprises_proches, mesures: m
    });
  }

  /**
   * journal : les entrées (partie 3.12) ; R : résultats de calculer() ;
   * D : une ligne de durées par séance ; carnetTexte : texte de « Copier
   * mon carnet » à la fin (null en mode moteur) ; copies : celles de la
   * partie 3.2, déjà faites (moteur.copie) ; empreinte : hex64.
   */
  function assembler(journal, R, D, carnetTexte, copies, empreinte) {
    return {
      format: 'elenchos-essai-trace', version: 3, empreinte_scelle: empreinte, partie: copie(journal.partie),
      seances: journal.seances.map(function (s, k) { return seanceTrace(s, R.seances[k], D[k]); }),
      arret: copie(journal.arret), fin: copie(journal.fin), agregats: enTrace(R.agregats),
      carnet: carnetTexte === null ? null : { texte: carnetTexte }, copies: copies.map(enTrace)
    };
  }

  /** Trace complète par le moteur seul, à partir du journal (Node). */
  function tracer(N, M, scelle, journal, durees, empreinte) {
    var ecarts = M.validerJournal(scelle, journal);
    if (ecarts.length) { throw new Error('journal invalide : ' + ecarts.slice(0, 5).join(' ; ')); }
    var mode = journal.partie.mode;
    var R = M.calculer(scelle, journal);
    var D = journal.seances.map(function (s, k) {
      return mode === 'interface' ? M.dureesConformes(durees.seances[k], k, s.etapes, 'séance ' + k)
        : { k: k, duree_seance: null, duree_deviner: null, duree_repondre: null };
    });
    var texte = mode === 'interface' ? M.carnet(scelle, journal, R, D, journal.fin ? { type: 'fin' } : { type: 'arret' }) : null;
    var copies = mode === 'interface' ? journal.copies.map(function (c, i) { return M.copie(scelle, journal, c, D, durees.copies[i]); }) : [];
    return assembler(journal, R, D, texte, copies, empreinte);
  }

  return { enTrace: enTrace, assembler: assembler, tracer: tracer };
})();

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosTrace; }
/*node-fin*/
