// @ts-check
// Elenchos, étape 1 (coquille). Le choix de l'écran : une fonction pure, qui se teste sans navigateur
// (DECISIONS-TECHNIQUES.md 1.3 ; CONTRAT.md 2.1).
//
// L'étape 1 n'en couvre que le haut du tableau de CONTRAT.md 2.1 : l'appareil, la version minimale, le réseau, et
// « dehors » ou « connecté ». Les autres lignes (lien reçu, carte de consentement, défi, cercles, journée…) viennent
// avec leurs écrans, à l'étape 2. En attendant, tout ce qui n'est pas un compte connecté montre l'accueil.

/** @typedef {import('../src/contrat.ts').Etat} Etat */
/** @typedef {import('../src/contrat.ts').Reponse<Etat>} ReponseEtat */
/** @typedef {'iphone' | 'ipad' | 'mac'} Appareil */
/** @typedef {'appareil' | 'mise_a_jour' | 'hors_ligne' | 'injoignable' | 'accueil' | 'connecte'} NomEcran */

/**
 * @param {{
 *   appareil: Appareil,
 *   fabrication: number,
 *   fabricationMinimale: number | null,
 *   etat: ReponseEtat | null,
 *   enLigne: boolean,
 * }} entree
 *   `fabricationMinimale` : la plus récente reçue, de n'importe quel échange (null avant le premier) ;
 *   `etat` : la dernière réponse de `GET /api/etat`, null si elle n'est pas arrivée ;
 *   `enLigne` : ce que le téléphone dit de son réseau.
 * @returns {NomEcran}
 */
export function choisirEcran(entree) {
  if (entree.appareil !== 'iphone') return 'appareil';
  if (entree.fabricationMinimale !== null && entree.fabrication < entree.fabricationMinimale) return 'mise_a_jour';
  if (entree.etat === null) return entree.enLigne ? 'injoignable' : 'hors_ligne';
  if (!entree.etat.ok) return 'injoignable';
  return entree.etat.donnees.session === 'compte' ? 'connecte' : 'accueil';
}

/**
 * Le but d'une connexion (CONTRAT.md 2.5) : `creation` à la fin du défi, `connexion` sinon.
 * @param {ReponseEtat | null} etat
 * @returns {'creation' | 'connexion'}
 */
export function butConnexion(etat) {
  return etat !== null && etat.ok && etat.donnees.parcours.etape === 'entree_finie' ? 'creation' : 'connexion';
}
