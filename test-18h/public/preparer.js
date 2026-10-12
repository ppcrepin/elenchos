// @ts-check
// JETABLE (test du message de 18h) : fabrique, dans le navigateur du porteur, les valeurs secrètes du test.
// Tirage par crypto.getRandomValues (sans biais : tirage rejeté au-delà du dernier multiple de l'alphabet).
// Aucune requête réseau : la page n'envoie rien (et sa politique de sécurité ne l'autorise qu'à son propre site).

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // sans i, l, o, 0, 1 : pas de confusion à la lecture

function tirer(/** @type {number} */ n) {
  let sortie = '';
  const limite = 256 - (256 % ALPHABET.length);
  while (sortie.length < n) {
    const octets = crypto.getRandomValues(new Uint8Array(n * 2));
    for (const o of octets) {
      if (o < limite && sortie.length < n) sortie += ALPHABET[o % ALPHABET.length];
    }
  }
  return sortie;
}

function enGroupes(/** @type {string} */ t, /** @type {number} */ taille) {
  return (t.match(new RegExp(`.{1,${taille}}`, 'g')) ?? []).join('-');
}

function b64url(/** @type {Uint8Array} */ octets) {
  let s = '';
  for (const o of octets) s += String.fromCharCode(o);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deB64url(/** @type {string} */ t) {
  const s = atob(t.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (t.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function cleVapid() {
  const paire = /** @type {CryptoKeyPair} */ (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']));
  const jwk = await crypto.subtle.exportKey('jwk', paire.privateKey);
  if (!jwk.d || !jwk.x || !jwk.y) throw new Error('clé incomplète');
  const publique = new Uint8Array(65);
  publique[0] = 4;
  publique.set(deB64url(jwk.x), 1);
  publique.set(deB64url(jwk.y), 33);
  return { privee: jwk.d, publique: b64url(publique) };
}

async function copier(/** @type {string} */ texte, /** @type {HTMLElement} */ bouton) {
  try {
    await navigator.clipboard.writeText(texte);
    bouton.textContent = 'Copié';
  } catch {
    bouton.textContent = 'Sélectionnez le texte et copiez-le à la main';
  }
}

const boutonFabriquer = /** @type {HTMLButtonElement} */ (document.getElementById('fabriquer'));
boutonFabriquer.addEventListener('click', async () => {
  const codes = [1, 2, 3, 4, 5].map(() => enGroupes(tirer(12), 4));
  const acces = enGroupes(tirer(20), 5);
  const secret = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const vapid = await cleVapid();
  const lignes = [
    `SECRET_SESSION=${secret}`,
    `CODES_ESSAI=${codes.join(';')}`,
    `CODE_ACCES_PORTEUR=${acces}`,
    `VAPID_CLE_PUBLIQUE=${vapid.publique}`,
    `VAPID_CLE_PRIVEE=${vapid.privee}`,
  ].join('\n');
  /** @type {HTMLElement} */ (document.getElementById('lignes')).textContent = lignes;
  const liste = /** @type {HTMLElement} */ (document.getElementById('a-garder'));
  liste.replaceChildren(
    ...codes.map((c, i) => Object.assign(document.createElement('li'), { textContent: `Code d’essai du téléphone T${i + 1} : ${c}` })),
    Object.assign(document.createElement('li'), { textContent: `Votre code d’accès aux résultats : ${acces}` }),
  );
  /** @type {HTMLElement} */ (document.getElementById('resultat')).hidden = false;
  boutonFabriquer.disabled = true;
  const boutonCopier = /** @type {HTMLElement} */ (document.getElementById('copier-lignes'));
  boutonCopier.onclick = () => copier(lignes, boutonCopier);
});

const entreeP8 = /** @type {HTMLInputElement} */ (document.getElementById('fichier-p8'));
entreeP8.addEventListener('change', async () => {
  const erreur = /** @type {HTMLElement} */ (document.getElementById('erreur-p8'));
  const zone = /** @type {HTMLElement} */ (document.getElementById('resultat-p8'));
  erreur.hidden = true;
  zone.hidden = true;
  const fichier = entreeP8.files && entreeP8.files[0];
  if (!fichier) return;
  const texte = (await fichier.text()).trim();
  if (!texte.startsWith('-----BEGIN PRIVATE KEY-----') || !texte.endsWith('-----END PRIVATE KEY-----') || texte.length > 1000) {
    erreur.textContent = 'Ce fichier ne ressemble pas à une clé .p8 d’Apple.';
    erreur.hidden = false;
    return;
  }
  const ligne = `APPLE_CLE_PRIVEE=${btoa(texte)}`;
  /** @type {HTMLElement} */ (document.getElementById('ligne-p8')).textContent = ligne;
  zone.hidden = false;
  const boutonCopier = /** @type {HTMLElement} */ (document.getElementById('copier-p8'));
  boutonCopier.onclick = () => copier(ligne, boutonCopier);
  entreeP8.value = '';
});
