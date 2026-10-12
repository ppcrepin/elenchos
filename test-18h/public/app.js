// @ts-check
// JETABLE (test du message de 18h) : la page installée sur l'écran d'accueil. Mots relus par UX le 12 octobre 2026.
// Elle ne dit que trois choses : ouverte depuis l'icône ou non, messages autorisés ou non, connecté ou non et
// par qui (jamais l'adresse e-mail). Elle ne garde rien dans le téléphone : session et numéro du téléphone sont des
// cookies du serveur. Rien d'Apple ni de Google n'est chargé ici (P-10) : « Continuer avec… » sont de simples liens.

const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));

const TEXTES = {
  oui: 'oui',
  non: 'non',
  autorises: 'autorisés',
  nonAutorises: 'pas encore autorisés',
  refuses: 'refusés',
  indisponibles: 'seulement depuis l’icône',
  connecteGoogle: 'connecté avec Google',
  connecteApple: 'connecté avec Apple',
  pasConnecte: 'aucune',
  ouvrirIcone: 'Les messages n’arrivent que dans l’icône. Dans Safari : Partager, puis « Sur l’écran d’accueil ». Ouvre ensuite l’icône.',
  tropAncien: 'Ce téléphone ne peut pas recevoir les messages : il faut iOS 16.4 ou plus récent (Réglages, Général, Informations).',
  codeRefuse: 'Code refusé. Vérifie-le et réessaie.',
  tropEssais: 'Trop d’essais. Réessaie dans un quart d’heure.',
  codeAccepte: (/** @type {number} */ n) => `C’est le téléphone ${n}. Touche « Autoriser les messages », puis « Autoriser ».`,
  abonne: (/** @type {number} */ n) => `C’est fait : le téléphone ${n} recevra le message vers 18h.`,
  refusIphone: 'Messages refusés. Pour les autoriser : Réglages, Notifications, « Test 18h ».',
  erreur: 'Ça n’a pas marché. Réessaie dans un moment.',
  pasPret: 'Les messages ne sont pas encore prêts. Réessaie plus tard.',
};

/** @type {{ connexion: 'google'|'apple'|null, cleMessages: string|null, abonnementPossible: boolean, apple: boolean, google: boolean } | null} */
let etatServeur = null;
let codeValide = '';
let aideAffichee = false;

function depuisIcone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || /** @type {{ standalone?: boolean }} */ (window.navigator).standalone === true;
}

function messagesPossibles() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function aide(/** @type {string|null} */ texte) {
  const p = $('aide');
  p.textContent = texte ?? '';
  p.hidden = !texte;
  aideAffichee = !!texte;
}

/** L'abonnement de ce téléphone, sans jamais attendre indéfiniment le service de réception. */
async function abonnementActuel() {
  if (!messagesPossibles()) return null;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Le service de réception prêt, ou null au bout de cinq secondes. */
function serviceDeReceptionPret() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((fin) => setTimeout(() => fin(null), 5000)),
  ]);
}

async function afficher() {
  // D'abord le serveur : la ligne « Connexion » ne dépend pas du service de réception.
  try {
    const r = await fetch('/api/etat', { cache: 'no-store', credentials: 'same-origin' });
    etatServeur = await r.json();
  } catch {
    etatServeur = null;
  }
  const c = etatServeur?.connexion ?? null;
  $('etat-connexion').textContent = c === 'google' ? TEXTES.connecteGoogle : c === 'apple' ? TEXTES.connecteApple : TEXTES.pasConnecte;
  $('form-sortie').hidden = c === null;
  $('apple').hidden = etatServeur?.apple !== true;

  $('etat-icone').textContent = depuisIcone() ? TEXTES.oui : TEXTES.non;

  let messages = TEXTES.indisponibles;
  let autorises = false;
  if (messagesPossibles()) {
    if (Notification.permission === 'denied') {
      messages = TEXTES.refuses;
      if (!aideAffichee) aide(TEXTES.refusIphone);
    } else {
      const ab = await abonnementActuel().catch(() => null);
      autorises = Notification.permission === 'granted' && !!ab;
      messages = autorises ? TEXTES.autorises : TEXTES.nonAutorises;
    }
  } else if (depuisIcone() && !aideAffichee) {
    aide(TEXTES.tropAncien);
  }
  $('etat-messages').textContent = messages;
  $('pret').hidden = !(autorises && c !== null);
}

function base64VersOctets(/** @type {string} */ b64) {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (ch) => ch.charCodeAt(0));
}

$('recevoir').addEventListener('click', () => {
  aide(null);
  if (!depuisIcone()) {
    aide(TEXTES.ouvrirIcone);
    return;
  }
  if (!messagesPossibles()) {
    aide(TEXTES.tropAncien);
    return;
  }
  if (!etatServeur?.abonnementPossible) {
    aide(TEXTES.pasPret);
    return;
  }
  $('form-code').hidden = false;
  /** @type {HTMLInputElement} */ ($('code')).focus();
});

$('form-code').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  aide(null);
  const code = /** @type {HTMLInputElement} */ ($('code')).value;
  try {
    const r = await fetch('/api/code', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }), credentials: 'same-origin',
    });
    if (r.status === 429) return aide(TEXTES.tropEssais);
    if (!r.ok) return aide(TEXTES.codeRefuse);
    const { telephone } = await r.json();
    codeValide = code;
    $('form-code').hidden = true;
    $('autoriser').hidden = false;
    aide(TEXTES.codeAccepte(telephone));
  } catch {
    aide(TEXTES.erreur);
  }
});

// Apple : la demande d'autorisation doit partir tout de suite du toucher sur un bouton (vérifié, Apple).
$('autoriser').addEventListener('click', async () => {
  aide(null);
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      aide(TEXTES.refusIphone);
      await afficher();
      return;
    }
    const reg = /** @type {ServiceWorkerRegistration | null} */ (await serviceDeReceptionPret());
    const cle = etatServeur?.cleMessages;
    if (!reg) return aide(TEXTES.erreur);
    if (!cle) return aide(TEXTES.pasPret);
    const abonnement = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64VersOctets(cle) });
    const r = await fetch('/api/abonnement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeValide, abonnement: abonnement.toJSON() }),
      credentials: 'same-origin',
    });
    if (!r.ok) {
      await abonnement.unsubscribe();
      aide(r.status === 403 ? TEXTES.codeRefuse : TEXTES.erreur);
      return;
    }
    const { telephone } = await r.json();
    $('autoriser').hidden = true;
    codeValide = '';
    aide(TEXTES.abonne(telephone));
  } catch {
    aide(TEXTES.erreur);
  }
  await afficher();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
}
void afficher();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void afficher();
});
