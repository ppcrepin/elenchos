/* Contexte réduit, construit à la main, pour les tests des règles du moteur
 * (lots 2 et 3) : il a la même interface que le contexte du moteur
 * (moteur.js, contexte), sans fichier scellé ni calendrier complets. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');

const F = N.Fraction;
const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, 'scelle-test.json');
const PERSONNAGES = JSON.parse(fs.readFileSync(SCELLE, 'utf8')).personnages;

/** Raisons d'un texte de sens 1 : 1 « pour » attendue (pôle 1), 2 « pour » hors tension,
 *  3 « contre » attendue (pôle 0), 4 « contre » croisée (pôle 1). */
const RAISONS = [{ cote: 'pour', pole: 1, rang: 1 }, { cote: 'pour', pole: 'aucun', rang: 2 },
  { cote: 'contre', pole: 0, rang: 3 }, { cote: 'contre', pole: 1, rang: 4 }];
const TX = (tension, titre) => ({ tension: tension || 'S', sens: 1, raisons: RAISONS, fiche: titre ? {} : null });

/**
 * spec : membres {nom: depuis}, jours {jour: texte répondu}, textes {t: texte},
 * reponses {t: {membre: {niveau, raison}}}, sommes (m, d) -> {S: {sw, swp}, …},
 * semaine {numero, premier_jour, dernier_jour}, entree [textes].
 */
function fauxCtx(spec) {
  const membres = Object.keys(spec.membres);
  const jourDe = {};
  Object.keys(spec.jours).forEach(d => { jourDe[spec.jours[d]] = +d; });
  const appels = [];
  const cal = {
    texteRepondu: d => (a(spec.jours, String(d)) ? spec.jours[String(d)] : null),
    depuis: m => spec.membres[m],
    semaine: n => { assert.equal(n, spec.semaine.numero); return spec.semaine; },
    semaineDuJour: d => (spec.semaine && d >= spec.semaine.premier_jour && d <= spec.semaine.dernier_jour ? spec.semaine.numero : null),
    textesRepondusSemaine: () => { const l = []; for (let d = spec.semaine.premier_jour - 1; d <= spec.semaine.dernier_jour - 1; d++) { if (a(spec.jours, String(d))) { l.push(spec.jours[String(d)]); } } return l; }
  };
  const vide = () => ({ sw: F(0), swp: F(0) });
  return {
    appels,
    scelle: { personnages: PERSONNAGES, reglage: { seuils_stricts: false, facteur: 3 }, textes: spec.textesJoues || {} },
    cal, tir: N.creerTirage('0123456789abcdef'), membres, premierJour: Math.min(...Object.keys(spec.jours).map(Number)),
    texte: t => spec.textes[t],
    estEntree: t => (spec.entree || []).includes(t),
    reponse: (m, t) => (spec.reponses[t] && spec.reponses[t][m]) || null,
    jourDe: t => jourDe[t],
    aUnTitre: t => spec.textes[t].fiche !== null,
    estMembre: (m, j) => spec.membres[m] <= j,
    sommesJusqua: (m, d) => { appels.push([m, d]); const s = spec.sommes ? spec.sommes(m, d) : null; return Object.assign({ S: vide(), P: vide(), T: vide(), L: vide() }, s || {}); }
  };
}
function a(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
const rep = (niveau, raison) => ({ niveau, raison });

module.exports = { RAISONS, TX, fauxCtx, rep, a };
