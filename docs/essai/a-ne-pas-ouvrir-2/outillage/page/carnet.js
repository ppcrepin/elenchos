/* Carnet du second essai (outillage d'essai, D-001 tenu ; lot 5, instance B).
 *
 * Le texte que « Copier mon carnet » donne au porteur (simulation-2.md,
 * §8.12, écarts au gabarit du §8.12 de simulation.md). Fonction pure, sur le
 * journal (etat.js, partie 4.4 du schéma), les résultats du moteur (R, partie
 * 4.3) et le fichier des durées (E.fichierDurees) : la version témoin et le
 * contrôle 13 la rejouent à l'identique (INTERFACE.md, § 7).
 *
 *   texte(scelle, cal, journal, R, durees, statut) -> chaîne
 *     statut : {type: 'fin'} | {type: 'arret'} | {type: 'copie'}
 *
 * Ce que le carnet ne porte jamais (§8.12, en tête ; §8.4) : un avis, une
 * raison, une phrase, un curseur, le pseudo, l'avis du cercle, et rien
 * texte par texte qui changerait avec les réponses du porteur.
 *
 * Les intitulés recopient les boutons tels qu'ils sont écrits (textes.js).
 * Seule la règle 1 de la typographie (apostrophe) s'applique (S1 §8.12).
 */
'use strict';

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) {
  var ElenchosNoyau = require('./noyau.js');
  var ElenchosJournal = require('./journal.js');
  var ElenchosTextes = require('./textes.js');
}
/*node-fin*/

var ElenchosCarnet = (function (N, J, X) {
  var PERSONNAGES = ['Agathe', 'Nassim', 'Odile', 'Valentin'];

  function ErreurCarnet(message) { var e = new Error('carnet : ' + message); e.name = 'ErreurCarnet'; return e; }
  function exiger(c, m) { if (!c) { throw ErreurCarnet(m); } }

  /** « {m} min {ss} s » (S1 §8.12). */
  function duree(d) {
    exiger(Number.isSafeInteger(d) && d >= 0, 'durée invalide');
    return Math.floor(d / 60) + ' min ' + N.deux(d % 60) + ' s';
  }
  function lib(table, code, inv) { var v = table[code]; exiger(v !== undefined, 'code inconnu : ' + code); return typeof v === 'function' ? v(inv) : v; }

  var VERDICTS = { juste_et_raison: 'juste avec la raison', juste: 'juste', jumeau_et_raison: 'juste par la même réponse avec la raison',
    jumeau: 'juste par la même réponse', faux: 'faux', passe: 'passé' };
  var COMPTE = { apple: 'Continuer avec Apple', google: 'Continuer avec Google',
    email_valider: 'Recevoir un code par e-mail, puis Valider', email_plus_tard: 'Recevoir un code par e-mail, puis Plus tard' };
  var FIN = [
    ['f2', null, 'deviner était'],
    ['servi', 'Ce qui vous a le plus servi pour deviner'],
    ['regle', 'La règle écrite dans Deviner vous a paru'],
    ['avis', "L'avis du cercle, à la révélation"],
    ['raisons', 'Les quatre raisons, au moment de répondre'],
    ['portrait', 'Votre portrait, au second dimanche'],
    ['barre', 'La barre du portrait'],
    ['suspense', 'Avec des textes rejetés, « Et l\'Assemblée ? » était']
  ];

  /** « A », « A et B », « A, B et C », dans l'ordre des membres ; le porteur s'écrit « vous ». */
  function titulaires(cal, liste) {
    if (!liste || !liste.length) { return 'pas attribué'; }
    var ordre = cal.membres;
    var tries = liste.slice().sort(function (a, b) { return ordre.indexOf(a) - ordre.indexOf(b); });
    return N.listeEt(tries.map(function (m) { return m === 'porteur' ? 'vous' : m; }));
  }

  /** Le saut confirmé dont le jour j fait partie (point de saut ou jour sauté), ou null. */
  function sautConfirmeDuJour(cal, journal, j) {
    var cs = cal.sautDuJour(j);
    if (!cs) { return null; }
    return journal.sauts.some(function (s) { return s.numero === cs.numero; }) ? cs : null;
  }

  /** Où la partie s'est arrêtée, ou a été copiée (§8.10, §8.12 ; partie 4.3.3) : {quoi: 'entree'|'saut'|'jour', n, k}. */
  function moment(cal, journal, k) {
    var d1 = journal.jours[String(cal.premier)];
    if (k === cal.premier && d1 && d1.coups.compte === null) { return { quoi: 'entree', k: k }; }
    var cs = sautConfirmeDuJour(cal, journal, k);
    if (cs) {
      var s = journal.sauts.filter(function (x) { return x.numero === cs.numero; })[0];
      // Au point de saut, le saut est confirmé : la partie est dans le saut.
      if (s) { return { quoi: 'saut', n: cs.numero, k: k }; }
    }
    var cr = cal.sautQuiReprend(k);
    if (cr && journal.jours[String(k)] && journal.jours[String(k)].ouverture === null &&
        journal.sauts.some(function (x) { return x.numero === cr.numero; })) { return { quoi: 'saut', n: cr.numero, k: k }; } // INTERFACE.md, L1-4
    return { quoi: 'jour', k: k };
  }

  function ligneStatut(m, type) {
    var nom = m.n === 1 ? 'premier' : 'second';
    if (type === 'arret') {
      if (m.quoi === 'entree') { return 'Essai arrêté pendant l\'entrée.'; }
      if (m.quoi === 'saut') { return 'Essai arrêté pendant le ' + nom + ' saut.'; }
      return 'Essai arrêté au jour ' + m.k + '.';
    }
    if (m.quoi === 'entree') { return 'Essai en cours : carnet copié pendant l\'entrée.'; }
    if (m.quoi === 'saut') { return 'Essai en cours : carnet copié pendant le ' + nom + ' saut.'; }
    return 'Essai en cours : carnet copié au jour ' + m.k + '.';
  }

  function ouvert(o) {
    return 'Le Cercle ' + o.cercle + ' fois, écran d\'un proche ' + o.proche + ' fois, Moi ' + o.moi + ' fois, fiche « Qui est qui » ' + o.qui_est_qui + ' fois';
  }

  function blocJour(l, cal, journal, R, durees, j) {
    var d = journal.jours[String(j)], c = d.coups, m = R.jours[String(j)].mesures, du = durees.jours[String(j)];
    exiger(m, 'mesures absentes, jour ' + j);
    exiger(du && Number.isSafeInteger(du.duree_seance), 'durées absentes, jour ' + j);
    var cloture = cal.estCloture(j), joue = cal.estJoue(j), arrivee = cal.estArrivee(j);
    l.push('');
    l.push(cloture ? 'Clôture' : 'Jour ' + j + ' · ' + cal.ligne(j).nom_jour);
    var h = +d.ouverture.slice(11, 13);
    l.push('Ouverture : ' + N.dateCarnet(d.ouverture) + ', entre ' + h + 'h00 et ' + h + 'h59.');
    if (m.jours_ecoules !== null && m.jours_ecoules !== undefined) { l.push('Jours écoulés depuis l\'ouverture précédente : ' + m.jours_ecoules + '.'); }
    exiger(Array.isArray(d.versions) && d.versions.length >= 1, 'versions absentes, jour ' + j);
    l.push('Version de la page : ' + d.versions.join(', puis ') + '.');
    var parts = [];
    if (du.duree_entree !== null) { parts.push(duree(du.duree_entree) + ' pour l\'entrée'); }
    if (du.duree_deviner !== null) { parts.push(duree(du.duree_deviner) + ' pour deviner'); }
    if (du.duree_repondre !== null) { parts.push(duree(du.duree_repondre) + ' pour répondre'); }
    l.push('Durée : ' + duree(du.duree_seance) + (parts.length ? ', dont ' + N.listeEt(parts) : '') + '.');
    if (arrivee) {
      if (m.entree_verdicts && m.entree_verdicts.length) {
        l.push('Entrée : paris sur ' + cal.invitant + ' ' + m.entree_verdicts.join(', ') + '.');
      }
      if (c.compte !== null) { l.push('Compte : ' + COMPTE[c.compte] + '.'); }
    }
    // Jours 1 (une fois l'entrée finie), 2, 3, 7 et 14, même à 0 ; jamais aux points de saut ni à la clôture (§8.12).
    if (cal.ligne(j).deviner_porteur && !(arrivee && c.compte === null)) { l.push('Boutons touchés : Relire ' + m.relire + ' fois, Passer ' + m.passer + ' fois.'); }
    if (m.revelation_verdicts !== null && m.revelation_verdicts !== undefined) {
      var v = m.revelation_verdicts;
      if (v.length === 0) { l.push('Révélation : aucune carte.'); }
      else {
        var ligne = 'Révélation : ' + v.map(function (x) { exiger(VERDICTS[x], 'verdict inconnu : ' + x); return VERDICTS[x]; }).join(', ') + '.';
        if (m.revelation_raison_tentee !== null && m.revelation_raison_tentee !== undefined) { ligne += ' Raison cachée : ' + (m.revelation_raison_tentee ? 'tentée' : 'pas tentée') + '.'; }
        l.push(ligne);
      }
    }
    if (joue && cal.ligne(j).revelation_porteur === 'lue') { l.push('Révélation rouverte : ' + c.rouvrir + ' fois.'); }
    if (!cloture) { l.push('Ouvert : ' + ouvert(c.ouvert) + '.'); }
    if (c.pendant_deviner !== null) { l.push('Pendant Deviner : Le Cercle ' + c.pendant_deviner.cercle + ' fois, écran d\'un proche ' + c.pendant_deviner.proche + ' fois.'); }
    if (joue && !(arrivee && c.compte === null)) { l.push('Journée abandonnée : ' + (c.abandon ? 'oui' : 'non') + '.'); }
    if (joue && c.carnet.moment !== null) {
      var choix = X.choixMoment[c.carnet.moment];
      exiger(choix !== undefined, 'moment inconnu');
      l.push('Votre moment préféré : ' + (typeof choix === 'function' ? choix(cal.invitant) : choix) + '.');
    }
  }

  function blocSaut(l, cal, journal, durees, s) {
    var cs = cal.saut(s.numero);
    var du = durees.sauts.filter(function (x) { return x.numero === s.numero; })[0];
    exiger(du, 'durées du saut ' + s.numero + ' absentes');
    l.push('');
    l.push((s.numero === 1 ? 'Premier' : 'Second') + ' saut · ' + cal.ligne(cs.jours[0]).nom_jour + ' à ' + cal.ligne(cs.jours[cs.jours.length - 1]).nom_jour);
    l.push('Durée : ' + duree(du.duree_saut) + ', dont ' + duree(du.duree_page) + ' sur la page du saut.');
    l.push('Pour répondre : ' + du.durees_textes.map(duree).join(', ') + '.');
    l.push('Boutons touchés : Annuler ' + journal.jours[String(cs.point)].coups.annuler_saut + ' fois.');
    l.push('Ouvert : ' + ouvert(s.coups.ouvert) + '.');
  }

  function blocSemaine(l, cal, journal, R, j) {
    var dm = R.jours[String(j)].dimanche;
    exiger(dm, 'dimanche absent, jour ' + j);
    var q = journal.jours[String(j)].coups.carnet;
    l.push('');
    l.push('Semaine ' + cal.rangEssai(cal.semaineDuJour(j)));
    l.push('Le Sans-Faute : ' + titulaires(cal, dm.sans_faute) + '.');
    l.push('Le Devin : ' + titulaires(cal, dm.devin.titulaire ? [dm.devin.titulaire] : []) + '.');
    l.push('Le Mystère : ' + titulaires(cal, dm.mystere.titulaire ? [dm.mystere.titulaire] : []) + '.');
    l.push('Le Fidèle : ' + titulaires(cal, dm.fidele.titulaires) + '.');
    if (cal.sauts.length && j === cal.sauts[0].reprise) {
      l.push('Ce que le jeu a fait pendant le saut, c\'était clair : ' + (q.saut_clair === null ? 'pas de réponse' : lib(X.choixSautClair, q.saut_clair)) + '.');
    }
    l.push('Où vous avez hésité cette semaine : ' + (q.hesite === null || !q.hesite.length ? 'pas de réponse' : q.hesite.map(function (x) { return lib(X.choixHesite, x); }).join(', ')) + '.');
    l.push('Cette semaine, votre moment préféré : ' + (q.moment_semaine === null ? 'pas de réponse' : lib(X.choixMomentSemaine, q.moment_semaine)) + '.');
  }

  /**
   * Le carnet (§8.12). journal : E.journal(etat, cal, empreinte) ; R : moteur sur ce
   * même journal ; durees : E.fichierDurees(etat, cal, maintenant).
   */
  function texte(scelle, cal, journal, R, durees, statut) {
    var K = cal.premier - 1;
    while (journal.jours[String(K + 1)]) { K++; }
    exiger(K >= cal.premier, 'aucun jour atteint');
    var l = [];
    l.push('Carnet du second essai Elenchos');
    l.push('Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, ni votre portrait, ni votre pseudo, ni l\'avis du cercle.');
    l.push('Les titres et les chiffres « Sur tout l\'essai » dépendent en partie de vos avis, mais seulement en cumul, jamais texte par texte.');
    if (statut.type === 'fin') {
      exiger(journal.fin && K === cal.dernier, 'fin avant la clôture');
      l.push('Essai mené jusqu\'à la clôture.');
    } else if (statut.type === 'arret') {
      exiger(journal.arret && journal.arret.jour === K, 'arrêt incohérent');
      l.push(ligneStatut(moment(cal, journal, K), 'arret'));
      l.push('Raison de l\'arrêt : ' + (journal.arret.raison === null ? 'pas de réponse' : lib(X.choixArret, journal.arret.raison)) + '.');
    } else {
      exiger(statut.type === 'copie' && !journal.fin && !journal.arret, 'copie incohérente');
      l.push(ligneStatut(moment(cal, journal, K), 'copie'));
    }

    for (var j = cal.premier; j <= K; j++) {
      var d = journal.jours[String(j)];
      if (cal.aUneOuverture(j) && d.ouverture !== null) { blocJour(l, cal, journal, R, durees, j); }
      if (cal.estPointDeSaut(j)) {
        var cs = cal.sautDuJour(j);
        journal.sauts.filter(function (s) { return s.numero === cs.numero; }).forEach(function (s) { blocSaut(l, cal, journal, durees, s); });
      }
      if (cal.estDimanche(j) && cal.semaineDuJour(j) !== null && cal.semainesEssai.indexOf(cal.semaineDuJour(j)) >= 0) { blocSemaine(l, cal, journal, R, j); }
    }

    var a = R.agregats;
    exiger(a, 'agrégats absents');
    l.push('');
    l.push('Sur tout l\'essai');
    l.push('Quand un personnage devinait la réponse d\'un autre personnage, il a trouvé son auteur : ' +
      (a.justesse_personnages_entre_eux ? a.justesse_personnages_entre_eux.justes + ' fois sur ' + a.justesse_personnages_entre_eux.total : 'pas de chiffre') + '.');
    l.push('Quand un personnage devinait l\'une de vos réponses, il a trouvé que c\'était vous : ' +
      (a.justesse_personnages_sur_porteur ? a.justesse_personnages_sur_porteur.justes + ' fois sur ' + a.justesse_personnages_sur_porteur.total : 'pas de chiffre') + '.');
    l.push('Titres attribués par tirage au sort, faute de départage : ' + (a.titres_tires_au_sort === null ? 'pas de chiffre' : a.titres_tires_au_sort) + '.');

    if (statut.type === 'fin') {
      l.push('');
      l.push('Questions de fin');
      FIN.forEach(function (f) {
        var v = journal.fin[f[0]];
        var valeur = v === null ? 'pas de réponse' : (f[0] === 'f2' ? lib(X.choixF2, v) : lib(X.choixFin[f[0]], v, cal.invitant));
        l.push((f[0] === 'f2' ? 'Au fil de l\'essai, ' + f[2] : f[1]) + ' : ' + valeur + '.');
      });
    } else if (statut.type === 'arret' && K >= J.JOUR_F2) {
      l.push('');
      l.push('Questions de fin');
      l.push('Jusqu\'ici, deviner était : ' + (journal.arret.f2 === null ? 'pas de réponse' : lib(X.choixF2, journal.arret.f2)) + '.');
    }
    l.push('');
    l.push('Fin du carnet');
    var t = N.apostrophes(l.join('\n'));
    exiger(t.normalize('NFC') === t && !/ {2}|^ | $|\t/m.test(t), 'forme invalide');
    exiger(!/^(?:[-*#>]|[0-9]+\.)/m.test(t), 'ligne qui se lirait comme une liste ou un titre');
    return t;
  }

  /**
   * La copie i du journal (partie 4.3.11 ; E.releverCopie), refaite telle qu'au toucher de
   * la copie : jours atteints jusqu'au sien, son jour et ses sauts tels qu'ils étaient,
   * ses durées. calculer(journal) : le moteur (M.calculer, avec le fichier et l'état à
   * l'arrivée). Rend {texte, mesures}. La page et le contrôle 13 passent par ici tous deux.
   */
  function texteCopie(scelle, cal, journal, durees, i, calculer) {
    var cp = journal.copies[i], dc = durees.copies[i];
    exiger(cp && dc, 'copie ' + i + ' absente');
    var jours = {}, dj = {};
    for (var j = cal.premier; j <= cp.jour; j++) {
      var d = journal.jours[String(j)];
      exiger(d, 'jour ' + j + ' absent du journal');
      jours[String(j)] = j < cp.jour ? d : { attente: null, coups: cp.coups, etapes: cp.etapes, ouverture: d.ouverture, versions: cp.versions };
      dj[String(j)] = j < cp.jour ? durees.jours[String(j)] :
        { duree_deviner: dc.duree_deviner, duree_entree: dc.duree_entree, duree_repondre: dc.duree_repondre, duree_seance: dc.duree_seance };
    }
    var jt = { arret: null, copies: [], empreinte_scelle: journal.empreinte_scelle, fin: null, format: journal.format, jours: jours,
      partie: journal.partie, sauts: cp.sauts, version: journal.version };
    var R = calculer(jt);
    var t = texte(scelle, cal, jt, R, { jours: dj, sauts: dc.sauts, copies: [] }, { type: 'copie' });
    return { texte: t, mesures: R.jours[String(cp.jour)].mesures };
  }

  return { texte: texte, texteCopie: texteCopie, duree: duree, moment: moment, VERDICTS: VERDICTS, PERSONNAGES: PERSONNAGES, ErreurCarnet: ErreurCarnet };
})(ElenchosNoyau, ElenchosJournal, ElenchosTextes);

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosCarnet; }
/*node-fin*/
