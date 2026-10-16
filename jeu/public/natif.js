// @ts-check
// Elenchos, étape 1 (coquille). La seule porte vers iOS (DECISIONS-TECHNIQUES.md 1.3) : notre module Swift
// (`ios/App/App/ElenchosNatif.swift`) et les deux modules officiels de Capacitor (notifications, cycle de vie).
//
// On parle au pont de Capacitor tel que l'application iOS l'injecte dans la page avant tout script (`native-bridge.js`
// de @capacitor/ios 8.5.3 : `Capacitor.nativePromise`, `Capacitor.addListener`). C'est ce que fait `registerPlugin` de
// @capacitor/core pour un module qui a son code natif ; on s'épargne ainsi une bibliothèque dans la page, qui reste
// lue telle quelle. Dans Chromium, pendant les tests, un faux pont de même forme est posé sur `globalThis.Capacitor`
// avant le chargement de la page (outil de test, à écrire) : aucun code de test ici.
//
// Rien de ce qui passe ici n'est gardé, sinon le jeton de session, dans le trousseau (P-11).
// Place réservée, étape 2 : la feuille du système pour Google, le lien universel reçu (`appUrlOpen`), et la feuille
// d'Apple de « Tout effacer ».

/**
 * @typedef {{
 *   nativePromise: (module: string, methode: string, options?: Record<string, unknown>) => Promise<unknown>,
 *   addListener: (module: string, evenement: string, rappel: (donnees: unknown) => void) => { remove: () => Promise<void> },
 * }} Pont
 */
/** @typedef {'iphone' | 'ipad' | 'mac'} Appareil */
/** @typedef {'accorde' | 'refuse' | 'a_demander'} AccordMessages */

const MODULE = 'ElenchosNatif';

/** @returns {Pont} */
function pont() {
  const cap = /** @type {{ Capacitor?: Partial<Pont> }} */ (/** @type {unknown} */ (globalThis)).Capacitor;
  if (!cap || typeof cap.nativePromise !== 'function' || typeof cap.addListener !== 'function') {
    throw new Error('pont_absent');
  }
  return /** @type {Pont} */ (cap);
}

/**
 * @param {string} module
 * @param {string} methode
 * @param {Record<string, unknown>} [options]
 * @returns {Promise<Record<string, unknown>>}
 */
async function appeler(module, methode, options = {}) {
  const resultat = await pont().nativePromise(module, methode, options);
  return resultat !== null && typeof resultat === 'object' ? /** @type {Record<string, unknown>} */ (resultat) : {};
}

/** Le code court d'un refus natif (`annule`, `echec`, `trousseau`…), ou `echec`. @param {unknown} e */
function codeRefus(e) {
  const code = e !== null && typeof e === 'object' && 'code' in e ? /** @type {{ code: unknown }} */ (e).code : null;
  return typeof code === 'string' ? code : 'echec';
}

// ---------------------------------------------------------------------------------------------------------------
// L'appareil et la fabrication

/** @returns {Promise<{ appareil: Appareil, fabrication: number }>} */
export async function appareil() {
  const r = await appeler(MODULE, 'appareil');
  const sorte = r.appareil === 'ipad' || r.appareil === 'mac' ? r.appareil : 'iphone';
  const fabrication = typeof r.fabrication === 'number' && Number.isInteger(r.fabrication) ? r.fabrication : 0;
  return { appareil: sorte, fabrication };
}

// ---------------------------------------------------------------------------------------------------------------
// Le trousseau

/** Le jeton de session, ou null s'il n'y en a pas, ou si le trousseau ne répond pas. @returns {Promise<string | null>} */
export async function lireJeton() {
  try {
    const r = await appeler(MODULE, 'lireJeton');
    return typeof r.jeton === 'string' ? r.jeton : null;
  } catch {
    return null;
  }
}

/** @param {string} jeton */
export async function ecrireJeton(jeton) {
  await appeler(MODULE, 'ecrireJeton', { jeton });
}

export async function effacerJeton() {
  await appeler(MODULE, 'effacerJeton');
}

// ---------------------------------------------------------------------------------------------------------------
// La connexion avec Apple (CONTRAT.md 2.5)

/**
 * Un vérificateur neuf, et son empreinte (`defi`), tirés par iOS. À garder dans la mémoire de l'écran seulement.
 * @returns {Promise<{ verificateur: string, defi: string }>}
 */
export async function verificateur() {
  const r = await appeler(MODULE, 'verificateur');
  if (typeof r.verificateur !== 'string' || typeof r.defi !== 'string') throw new Error('verificateur');
  return { verificateur: r.verificateur, defi: r.defi };
}

/**
 * Ouvre la feuille d'Apple avec le nonce donné par le serveur. Seul l'identifiant est demandé (D-061).
 * @param {string} nonce
 * @returns {Promise<{ issue: 'jeton', jetonIdentite: string } | { issue: 'annule' } | { issue: 'echec' }>}
 */
export async function connexionApple(nonce) {
  try {
    const r = await appeler(MODULE, 'connexionApple', { nonce });
    return typeof r.jetonIdentite === 'string' ? { issue: 'jeton', jetonIdentite: r.jetonIdentite } : { issue: 'echec' };
  } catch (e) {
    return codeRefus(e) === 'annule' ? { issue: 'annule' } : { issue: 'echec' };
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Le message de 18h (module officiel des notifications)

/** @param {Record<string, unknown>} r @returns {AccordMessages} */
function accordDe(r) {
  if (r.receive === 'granted') return 'accorde';
  if (r.receive === 'denied') return 'refuse';
  return 'a_demander';
}

/** Où en est l'accord d'iOS, sans rien demander. @returns {Promise<AccordMessages>} */
export async function accordMessages() {
  return accordDe(await appeler('PushNotifications', 'checkPermissions'));
}

/** Demande l'accord d'iOS. À n'appeler qu'après un toucher du joueur (CONTRAT.md 2.13). @returns {Promise<AccordMessages>} */
export async function demanderAccordMessages() {
  return accordDe(await appeler('PushNotifications', 'requestPermissions'));
}

/**
 * Le jeton d'appareil d'Apple, en hexadécimal minuscule, une fois l'accord donné. Refusé au bout de 20 secondes.
 * @returns {Promise<string>}
 */
export function jetonAppareil() {
  const p = pont();
  return new Promise((rendre, refuser) => {
    /** @type {{ remove: () => Promise<void> }[]} */
    const ecoutes = [];
    let fini = false;
    /** @param {() => void} suite */
    const finir = (suite) => {
      if (fini) return;
      fini = true;
      clearTimeout(minuterie);
      for (const e of ecoutes) void e.remove().catch(() => {});
      suite();
    };
    const minuterie = setTimeout(() => finir(() => refuser(new Error('jeton_appareil'))), 20000);
    ecoutes.push(p.addListener('PushNotifications', 'registration', (donnees) => {
      const valeur = donnees !== null && typeof donnees === 'object' ? /** @type {{ value?: unknown }} */ (donnees).value : null;
      if (typeof valeur === 'string' && /^[0-9A-Fa-f]{16,400}$/.test(valeur)) {
        finir(() => rendre(valeur.toLowerCase()));
      } else {
        finir(() => refuser(new Error('jeton_appareil')));
      }
    }));
    ecoutes.push(p.addListener('PushNotifications', 'registrationError', () => {
      finir(() => refuser(new Error('jeton_appareil')));
    }));
    p.nativePromise('PushNotifications', 'register', {}).catch(() => finir(() => refuser(new Error('jeton_appareil'))));
  });
}

/** Le joueur a touché un message : l'application s'ouvre, puis relit l'état (CONTRAT.md 2.13). @param {() => void} rappel */
export function surToucherMessage(rappel) {
  pont().addListener('PushNotifications', 'pushNotificationActionPerformed', () => rappel());
}

// ---------------------------------------------------------------------------------------------------------------
// Le cycle de vie (module officiel)

/** Retour au premier plan, depuis l'arrière-plan (CONTRAT.md 2.1). @param {() => void} rappel */
export function surRetourPremierPlan(rappel) {
  pont().addListener('App', 'resume', () => rappel());
}
