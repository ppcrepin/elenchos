// @ts-check
// Elenchos, étape 1 (coquille). Le point d'entrée : il lit l'appareil et le trousseau, demande l'état au serveur,
// choisit l'écran et redessine tout à chaque changement (DECISIONS-TECHNIQUES.md 1.2 et 1.3).
//
// Ce que fait la coquille, et rien de plus :
// - l'accueil, et la connexion avec Apple (feuille native ; nonce et vérificateur, CONTRAT.md 2.5) ;
// - une fois connecté, l'accord d'iOS pour le message de 18h, demandé seulement après un toucher, puis le jeton
//   d'appareil envoyé au serveur (`POST /api/abonnement`, CONTRAT.md 2.13), et renvoyé à chaque ouverture ;
// - l'écran de mise à jour sous `fabricationMinimale`, l'écran de l'iPad ou du Mac, l'écran sans réseau.
// Rien n'est gardé dans le téléphone, sauf le jeton de session dans le trousseau (P-11) ; aucune trace écrite.

import * as client from './client.js';
import { choisirEcran, butConnexion } from './ecran.js';
import { dessiner } from './ecrans.js';
import * as natif from './natif.js';
import { TEXTES } from './textes.js';

/** @typedef {import('./ecran.js').ReponseEtat} ReponseEtat */
/** @typedef {import('./ecrans.js').Vue} Vue */
/** @typedef {import('../src/contrat.ts').CodeErreur} CodeErreur */

// Le signal attendu par secours.js : le script a démarré.
document.documentElement.dataset.demarre = 'oui';

const memoire = {
  /** @type {import('./ecran.js').Appareil} */
  appareil: 'iphone',
  fabrication: 0,
  /** @type {ReponseEtat | null} */
  etat: null,
  /** Le jeton d'appareil a été envoyé depuis l'ouverture de l'application. */
  abonnementEnvoye: false,
};

/** @type {Vue} */
const vue = {
  ecran: 'accueil',
  occupe: false,
  avis: null,
  message: { disponible: false, accord: null, abonne: false, avis: null },
};

/** @type {string | null} */
let ecranAffiche = null;

function rendre() {
  const racine = document.getElementById('application');
  if (!racine) return;
  vue.ecran = choisirEcran({
    appareil: memoire.appareil,
    fabrication: memoire.fabrication,
    fabricationMinimale: client.fabricationMinimale(),
    etat: memoire.etat,
    enLigne: navigator.onLine,
  });
  vue.message.disponible = memoire.etat !== null && memoire.etat.ok && memoire.etat.donnees.message.disponible;
  racine.replaceChildren(dessiner(vue, { reessayer: actualiser, connexionApple, recevoirMessage }));
  if (vue.ecran !== ecranAffiche) {
    ecranAffiche = vue.ecran;
    const h1 = racine.querySelector('h1');
    if (h1) h1.focus();
  }
}

/** Le message d'une erreur commune (CONTRAT.md, partie 6). @param {CodeErreur} code */
function messageErreur(code) {
  return code === 'trop_de_demandes' ? TEXTES.erreurs.tropDeDemandes : TEXTES.erreurs.neutre;
}

/** Relit l'état : à l'ouverture, au retour au premier plan, après un message touché, après une connexion. */
async function actualiser() {
  vue.occupe = true;
  rendre();
  const r = await client.appeler('GET /api/etat', null);
  memoire.etat = r.joint ? r.reponse : null;
  vue.occupe = false;
  rendre();
  if (vue.ecran === 'connecte') await preparerMessage();
}

// ---------------------------------------------------------------------------------------------------------------
// La connexion avec Apple (CONTRAT.md 2.5)

async function connexionApple() {
  if (vue.occupe) return;
  vue.occupe = true;
  vue.avis = null;
  rendre();
  try {
    vue.avis = await connecter();
  } catch {
    vue.avis = TEXTES.erreurs.neutre;
  } finally {
    vue.occupe = false;
    rendre();
  }
}

/** La connexion, de bout en bout. Rend l'avis à montrer, ou null. Le vérificateur ne vit que dans cette fonction. */
async function connecter() {
  const { verificateur, defi } = await natif.verificateur();
  const debut = await client.appeler('POST /api/connexion/debut', { voie: 'apple', but: butConnexion(memoire.etat), defi });
  if (!debut.joint) return TEXTES.reseau.injoignable;
  if (!debut.reponse.ok) return apresErreur(debut.reponse.erreur);
  if (debut.reponse.donnees.voie !== 'apple') return TEXTES.erreurs.neutre;

  const feuille = await natif.connexionApple(debut.reponse.donnees.nonce);
  if (feuille.issue === 'annule') return null;
  if (feuille.issue === 'echec') return TEXTES.erreurs.neutre;

  const fin = await client.appeler('POST /api/connexion/apple', { jetonIdentite: feuille.jetonIdentite, verificateur });
  if (!fin.joint) return TEXTES.reseau.injoignable;
  if (!fin.reponse.ok) {
    if (fin.reponse.erreur === 'connexion_expiree') return TEXTES.connexion.expiree;
    return apresErreur(fin.reponse.erreur);
  }
  const resultat = fin.reponse.donnees;
  switch (resultat.etat) {
    case 'connecte':
      await client.changerJeton(resultat.jeton);
      await actualiser();
      return null;
    case 'compte_inconnu':
      return TEXTES.connexion.compteInconnu;
    case 'connexion_echouee':
      return TEXTES.connexion.echouee;
    default:
      // Les autres refus (cercle complet, pseudo pris, refus de Google…) ont leurs écrans à l'étape 2.
      return TEXTES.erreurs.neutre;
  }
}

/** Après une erreur du contrat : relire l'état quand l'étape a changé, sinon un message. @param {CodeErreur} code */
async function apresErreur(code) {
  if (code === 'etape_incorrecte' || code === 'non_connecte' || code === 'mise_a_jour_requise') {
    await actualiser();
    return null;
  }
  return messageErreur(code);
}

// ---------------------------------------------------------------------------------------------------------------
// Le message de 18h (CONTRAT.md 2.13)

/** À l'arrivée sur l'écran connecté : lire l'accord d'iOS, sans rien demander ; s'il est déjà donné, renvoyer le
 *  jeton d'appareil une fois par ouverture (iOS peut le changer). */
async function preparerMessage() {
  if (!vue.message.disponible) return;
  try {
    vue.message.accord = await natif.accordMessages();
  } catch {
    vue.message.accord = 'a_demander';
  }
  rendre();
  if (vue.message.accord === 'accorde' && !memoire.abonnementEnvoye) await abonner(false);
}

/** Le toucher sur « Recevoir le message de 18h » : la seule demande d'accord à iOS. */
async function recevoirMessage() {
  if (vue.occupe) return;
  vue.occupe = true;
  vue.message.avis = null;
  rendre();
  try {
    vue.message.accord = await natif.demanderAccordMessages();
    if (vue.message.accord === 'accorde') await abonner(true);
  } catch {
    vue.message.avis = TEXTES.erreurs.neutre;
  } finally {
    vue.occupe = false;
    rendre();
  }
}

/** Envoie le jeton d'appareil au serveur. @param {boolean} dire montrer un avis en cas d'échec */
async function abonner(dire) {
  try {
    const jeton = await natif.jetonAppareil();
    const r = await client.appeler('POST /api/abonnement', { jeton });
    if (!r.joint) {
      if (dire) vue.message.avis = TEXTES.reseau.injoignable;
    } else if (r.reponse.ok) {
      memoire.abonnementEnvoye = true;
      vue.message.abonne = true;
    } else if (dire) {
      vue.message.avis = messageErreur(r.reponse.erreur);
    }
  } catch {
    if (dire) vue.message.avis = TEXTES.erreurs.neutre;
  }
  rendre();
}

// ---------------------------------------------------------------------------------------------------------------
// Le démarrage

function montrerSecours() {
  const application = document.getElementById('application');
  const secours = document.getElementById('secours');
  if (application) application.hidden = true;
  if (secours) secours.hidden = false;
}

async function demarrer() {
  const infos = await natif.appareil();
  memoire.appareil = infos.appareil;
  memoire.fabrication = infos.fabrication;
  if (memoire.appareil !== 'iphone') {
    rendre();
    const serveur = client.adresseServeur();
    if (serveur) {
      client.configurer({ serveur, fabrication: memoire.fabrication, jeton: null });
      await client.appeler('POST /api/compteur', { sorte: 'ipad' });
    }
    return;
  }
  const serveur = client.adresseServeur();
  if (!serveur) throw new Error('adresse_serveur');
  client.configurer({ serveur, fabrication: memoire.fabrication, jeton: await natif.lireJeton() });
  natif.surRetourPremierPlan(() => void actualiser());
  natif.surToucherMessage(() => void actualiser());
  window.addEventListener('online', () => void actualiser());
  await actualiser();
}

demarrer().catch(montrerSecours);
