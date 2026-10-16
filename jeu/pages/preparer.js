// @ts-check
// La page du mode préparation (preparer.html ; CONTRAT.md, 2.17). Reprise de test-18h/public/preparer.js
// (12 octobre 2026), réduite aux trois clés du serveur.
// Chaque clé : 32 octets tirés par crypto.getRandomValues, écrits en base64url sans « = » (43 signes). C'est la forme
// que lit src/serveur/config.ts : 32 octets exactement pour CLE_REPONSES et CLE_IDENTITES, au moins 32 pour
// SECRET_SESSION, les trois distinctes. Un seul tirage par chargement de la page. Aucune demande au réseau, rien de
// gardé (ni stockage, ni témoin) : les clés ne vivent que dans la page ouverte.
// Un script ordinaire, enfermé dans une fonction : il ne laisse aucun nom global.
'use strict';
(() => {
  const NOMS = ['SECRET_SESSION', 'CLE_REPONSES', 'CLE_IDENTITES'];

  /** Une clé : 32 octets tirés au hasard, en base64url sans « = ». */
  function cle() {
    const octets = crypto.getRandomValues(new Uint8Array(32));
    let s = '';
    for (const o of octets) s += String.fromCharCode(o);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** Trois clés distinctes. Deux tirages égaux n'arrivent pas en pratique ; s'ils arrivaient, on retirerait. Un
   *  hasard en panne, qui rendrait toujours la même valeur, ne montre rien, au lieu de bloquer la page. */
  function troisCles() {
    /** @type {string[]} */
    const cles = [];
    for (let essai = 0; essai < 10 && cles.length < NOMS.length; essai++) {
      const c = cle();
      if (!cles.includes(c)) cles.push(c);
    }
    if (cles.length < NOMS.length) throw new Error('tirage impossible');
    return cles;
  }

  /** @param {string} id */
  function element(id) {
    const e = document.getElementById(id);
    if (!e) throw new Error('élément manquant : ' + id);
    return e;
  }

  const tirer = /** @type {HTMLButtonElement} */ (element('tirer'));
  const copier = /** @type {HTMLButtonElement} */ (element('copier'));
  const lignes = element('lignes');
  const resultat = element('resultat');
  let texte = '';

  tirer.addEventListener('click', () => {
    if (texte !== '') return;
    const cles = troisCles();
    texte = NOMS.map((nom, i) => `${nom}=${cles[i]}`).join('\n');
    lignes.textContent = texte;
    resultat.hidden = false;
    tirer.disabled = true;
  });

  copier.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(texte);
      copier.textContent = 'Copié';
    } catch {
      copier.textContent = 'Sélectionnez les trois lignes et copiez-les à la main';
    }
  });
})();
