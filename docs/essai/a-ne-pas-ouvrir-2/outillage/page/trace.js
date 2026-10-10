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

  function copie(v) { return v === null || v === undefined ? null : JSON.parse(JSON.stringify(v)); }

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

  /**
   * Trace de l'histoire, version 1 (second essai ; a-ne-pas-ouvrir-2/schema.md,
   * partie 4.2). `collecte` : ce que M.histoire(scelle, cal, collecte) a rempli
   * (jours, semaines, arrivee) ; `resume` : M.resume(arrivee) ; `resumeSha256` :
   * son empreinte (V6) ; `empreinte` : SHA-256 du fichier scellé. Rien n'est
   * recalculé ici : les grandeurs sont celles du moteur, écrites en « p/q ».
   * Le point d'entrée du harnais (version témoin) l'appelle une fois par fichier.
   */
  function histoire(collecte, resume, resumeSha256, empreinte) {
    var jours = {};
    Object.keys(collecte.jours).forEach(function (j) {
      var x = collecte.jours[j];
      jours[j] = { manches: enTrace(x.manches), repondu: x.repondu, revelation: x.revelation ? enTrace(x.revelation) : null };
    });
    var curseurs = {};
    Object.keys(collecte.arrivee.curseurs).forEach(function (p) {
      curseurs[p] = {};
      Object.keys(collecte.arrivee.curseurs[p]).forEach(function (t) {
        var c = collecte.arrivee.curseurs[p][t];
        curseurs[p][t] = { c: c.c.toString(), l: c.l.toString(), net: c.net, somme_w: c.somme_w.toString() };
      });
    });
    return {
      arrivee: { curseurs: curseurs, resume: copie(resume), resume_sha256: resumeSha256, temperaments: enTrace(collecte.arrivee.temperaments) },
      empreinte_scelle: empreinte,
      format: 'elenchos-essai-trace-histoire',
      jours: jours,
      semaines: enTrace(collecte.semaines),
      version: 1
    };
  }

  /**
   * Trace de partie, version 4 (second essai ; schéma, partie 4.3). Entrées :
   * le journal v4 ; R = M.calculer(scelle, cal, arrivee, journal) ; D = le
   * fichier des durées v2 (null en mode moteur) ; le texte du carnet et les
   * copies (écrans, instance B) ; l'empreinte du fichier et celle du résumé.
   * Rien n'est recalculé ; seules les durées sont posées dans les mesures.
   */
  var CLES_R = ['entree', 'manches', 'revelation', 'message', 'phrase_jour', 'attente', 'dimanche', 'portrait', 'curseurs_vus',
    'cercle', 'surprises_proches', 'mesures'];
  function partie(journal, R, D, carnetTexte, copies, empreinte, resumeSha256) {
    var jours = {};
    Object.keys(journal.jours).forEach(function (k) {
      var j = journal.jours[k], r = R.jours[k];
      var x = { coups: copie(j.coups), etapes: copie(j.etapes), ouverture: j.ouverture, versions: copie(j.versions) };
      CLES_R.forEach(function (c) { x[c] = enTrace(r[c]); });
      if (x.mesures) {
        var d = D && D.jours[k] ? D.jours[k] : null;
        ['duree_deviner', 'duree_entree', 'duree_repondre', 'duree_seance'].forEach(function (c) { x.mesures[c] = d ? d[c] : null; });
      }
      jours[k] = x;
    });
    var sauts = R.sauts.map(function (s, i) {
      var x = enTrace(s);
      var d = D && D.sauts[i] ? D.sauts[i] : null;
      ['duree_page', 'duree_saut', 'durees_textes'].forEach(function (c) { x.mesures[c] = d ? copie(d[c]) : null; });
      return x;
    });
    // Copies (partie 4.3.11) : les mesures du moteur n'ont pas de durées ; comme pour les jours et les sauts, elles
    // viennent du fichier des durées (copies[i]), quand il y en a un.
    var copiesTrace = (copies || []).map(function (c, i) {
      var x = copie(c), d = D && D.copies && D.copies[i] ? D.copies[i] : null;
      if (x.mesures && d) { ['duree_deviner', 'duree_entree', 'duree_repondre', 'duree_seance'].forEach(function (k) { x.mesures[k] = d[k]; }); }
      return x;
    });
    return {
      agregats: enTrace(R.agregats), arret: copie(journal.arret), carnet: carnetTexte === undefined || carnetTexte === null ? null : { texte: carnetTexte },
      copies: copiesTrace, empreinte_scelle: empreinte, fin: copie(journal.fin), format: 'elenchos-essai-trace',
      jours: jours, partie: copie(journal.partie), resume_histoire: resumeSha256, sauts: sauts, version: 4
    };
  }

  /** Node et harnais : la trace de l'histoire d'un fichier scellé, de bout en bout. */
  function tracerHistoire(N, C, M, octets) {
    var scelle = JSON.parse(N.utf8Decoder(octets));
    var collecte = {};
    var arrivee = M.histoire(scelle, C.lire(scelle), collecte);
    var resume = M.resume(arrivee);
    return histoire(collecte, resume, N.sha256(N.utf8Encoder(N.jsonCanonique(resume))), N.sha256(octets));
  }

  return { enTrace: enTrace, assembler: assembler, tracer: tracer, histoire: histoire, tracerHistoire: tracerHistoire, partie: partie };
})();

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosTrace; }
/*node-fin*/
