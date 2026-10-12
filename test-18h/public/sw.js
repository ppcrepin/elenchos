// @ts-check
/// <reference lib="webworker" />
// REPRIS pour le vrai jeu (proposé) : la réception du message dans le téléphone.
// - Chaque message reçu s'affiche (sinon Safari retire l'autorisation : vérifié, Apple).
// - À l'arrivée, le téléphone prévient le serveur, qui note l'heure de réception. On n'envoie que le numéro
//   d'envoi, tiré au hasard : ni l'heure du téléphone, ni rien d'autre (docs/etape-6/test-18h.md, partie 1).
// - Un toucher sur le message ne fait rien : pas d'ouverture de fenêtre. (Limite : iOS peut ouvrir l'icône de
//   lui-même au toucher ; et la seconde forme d'iOS 18.4 ouvre toujours son adresse « navigate ».)
// - Seconde forme (« Declarative Web Push », iOS 18.4) avec mutable : le système passe ici la notification
//   proposée ; on ne l'affiche pas nous-mêmes (le système l'affiche), on prévient seulement le serveur.
//   Avant iOS 18.4, le même contenu arrive comme un message classique : on l'affiche.

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const FORME_ENVOI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

sw.addEventListener('install', () => {
  void sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

/** Prévient le serveur de la réception ; un second essai trois secondes plus tard si le réseau hésite. */
async function signalerReception(/** @type {unknown} */ envoi) {
  if (typeof envoi !== 'string' || !FORME_ENVOI.test(envoi)) return;
  for (let essai = 0; essai < 2; essai += 1) {
    try {
      const r = await fetch('/api/recu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envoi }),
        credentials: 'omit',
        cache: 'no-store',
      });
      if (r.ok) return;
    } catch {
      // réseau indisponible : on réessaie une fois
    }
    await new Promise((fin) => setTimeout(fin, 3000));
  }
}

sw.addEventListener('push', (event) => {
  const e = /** @type {PushEvent & { notification?: Notification, proposedNotification?: Notification }} */ (event);
  const proposee = e.notification ?? e.proposedNotification ?? null;
  if (proposee) {
    // Seconde forme, iOS 18.4 et plus : le système affiche la notification proposée.
    event.waitUntil(signalerReception(proposee.data && proposee.data.envoi));
    return;
  }
  let titre = 'Test';
  /** @type {unknown} */
  let envoi = null;
  try {
    const m = event.data ? event.data.json() : null;
    const n = m && m.notification;
    if (n && typeof n.title === 'string' && n.title.length <= 80) titre = n.title;
    envoi = n && n.data ? n.data.envoi : null;
  } catch {
    // contenu illisible : on affiche quand même un message neutre
  }
  event.waitUntil(Promise.all([
    sw.registration.showNotification(titre, { lang: 'fr', data: { envoi } }),
    signalerReception(envoi),
  ]));
});

// Toucher le message : on le ferme, rien d'autre. Ni ouverture de fenêtre, ni envoi au serveur.
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
