/* Partie témoin (a) : les coups du tableau (A) de references/carnets-et-cas-chiffres.md (Game design),
 * pour tests/partie-test.js. Toujours Neutre, raison « aucune » ; pari Neutre sur Valentin ; pseudo
 * « Témoin A » ; compte e-mail puis Valider ; Passer chaque carte, Valider, aucune raison tentée ;
 * rien d'ouvert ni rouvert ; carnet « Aucun », saut clair « Oui », hésité « Nulle part » ; questions
 * de fin du tableau ; toute la partie le même jour (« Jours écoulés : 0 »). */
'use strict';
module.exports = {
  reponse: () => ({ niveau: 3, raison: 'aucune' }), paris: () => 3, pseudo: 'Témoin A', compte: 'email_valider', gestes: false, memeJour: true,
  visages: (j, n) => Array(n).fill('passe'), raison: () => null,
  carnet: () => ({ moment: 'aucun', saut_clair: 'oui', hesite: ['nulle_part'], moment_semaine: 'aucun' }),
  fin: { f2: 'toujours_autant', servi: 'rien', regle: 'pas_lue', avis: 'pas_lu', raisons: 'pas_plus', portrait: 'pas_regarde', barre: 'pas_remarquee', suspense: 'sans' }
};
