// @ts-check
// Elenchos, étape 1 (coquille). Les écrans de la coquille, dessinés à partir de la vue, avec `createElement` et
// `textContent`, jamais `innerHTML` (DECISIONS-TECHNIQUES.md 1.2). Les mots viennent de textes.js.

import { TEXTES } from './textes.js';

/** @typedef {import('./ecran.js').NomEcran} NomEcran */
/** @typedef {import('./natif.js').AccordMessages} AccordMessages */
/**
 * Ce que l'écran montre.
 * @typedef {{
 *   ecran: NomEcran,
 *   occupe: boolean,
 *   avis: string | null,
 *   message: { disponible: boolean, accord: AccordMessages | null, abonne: boolean, avis: string | null },
 * }} Vue
 */
/**
 * Les gestes possibles.
 * @typedef {{ reessayer: () => void, connexionApple: () => void, recevoirMessage: () => void }} Gestes
 */

/**
 * @param {string} balise
 * @param {{ classe?: string, texte?: string }} [options]
 * @param {Node[]} [enfants]
 */
function el(balise, options = {}, enfants = []) {
  const n = document.createElement(balise);
  if (options.classe) n.className = options.classe;
  if (options.texte !== undefined) n.textContent = options.texte;
  for (const e of enfants) n.appendChild(e);
  return n;
}

/** Le titre de l'écran : c'est lui qui reçoit le focus à chaque changement d'écran (VoiceOver le lit). @param {string} texte */
function titre(texte) {
  const h = el('h1', { texte });
  h.tabIndex = -1;
  return h;
}

/** @param {string} texte @param {() => void} geste @param {boolean} [inactif] */
function bouton(texte, geste, inactif = false) {
  const b = /** @type {HTMLButtonElement} */ (el('button', { classe: 'bouton', texte }));
  b.type = 'button';
  b.disabled = inactif;
  b.addEventListener('click', geste);
  return b;
}

/** Une ligne d'avis sous le geste principal, annoncée par VoiceOver. @param {string | null} texte */
function avis(texte) {
  const p = el('p', { classe: 'avis', texte: texte ?? '' });
  p.setAttribute('role', 'status');
  return p;
}

/**
 * @param {Vue} vue
 * @param {Gestes} gestes
 * @returns {HTMLElement}
 */
export function dessiner(vue, gestes) {
  const section = el('section', { classe: `ecran ecran-${vue.ecran.replace(/_/g, '-')}` });
  const ajouter = (/** @type {Node[]} */ ...noeuds) => { for (const n of noeuds) section.appendChild(n); };

  switch (vue.ecran) {
    case 'appareil':
      ajouter(titre(TEXTES.appareil.titre), el('p', { texte: TEXTES.appareil.texte }));
      break;
    case 'mise_a_jour':
      ajouter(titre(TEXTES.miseAJour.titre), el('p', { texte: TEXTES.miseAJour.texte }));
      break;
    case 'hors_ligne':
      ajouter(
        titre(TEXTES.reseau.titre),
        el('p', { texte: TEXTES.reseau.texte }),
        bouton(TEXTES.reseau.reessayer, gestes.reessayer, vue.occupe),
      );
      break;
    case 'injoignable':
      ajouter(
        titre(TEXTES.reseau.injoignable),
        bouton(TEXTES.reseau.reessayer, gestes.reessayer, vue.occupe),
      );
      break;
    case 'accueil':
      ajouter(
        titre(TEXTES.accueil.titre),
        el('p', { texte: TEXTES.accueil.texte }),
        bouton(TEXTES.accueil.apple, gestes.connexionApple, vue.occupe),
        avis(vue.avis),
      );
      break;
    case 'connecte':
      ajouter(titre(TEXTES.connecte.titre), el('p', { texte: TEXTES.connecte.texte }));
      if (vue.message.disponible) ajouter(blocMessage(vue, gestes));
      break;
  }
  return section;
}

/** N10 : le bloc du message de 18h. @param {Vue} vue @param {Gestes} gestes */
function blocMessage(vue, gestes) {
  const bloc = el('div', { classe: 'bloc-message' });
  if (vue.message.abonne) {
    bloc.appendChild(el('p', { texte: TEXTES.message.abonne }));
  } else if (vue.message.accord === 'refuse') {
    bloc.appendChild(el('p', { texte: TEXTES.message.refuse }));
  } else {
    bloc.appendChild(el('p', { texte: TEXTES.message.explication }));
    bloc.appendChild(bouton(TEXTES.message.bouton, gestes.recevoirMessage, vue.occupe || vue.message.accord === null));
  }
  bloc.appendChild(avis(vue.message.avis));
  return bloc;
}
