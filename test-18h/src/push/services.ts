// REPRIS pour le vrai jeu (proposé) : la liste fermée des services d'acheminement des messages (P-12, D-043, D-054).
// Le jeu se joue sur iPhone seulement (D-054) : un seul service, celui d'Apple, https://*.push.apple.com
// (vérifié, documentation d'Apple). Le serveur n'envoie jamais ailleurs : un abonnement vers un autre service
// (un Mac sous Chrome, par exemple) est refusé à l'abonnement, et le refus est noté au journal sans l'adresse.

export function serviceDe(adresse: string): 'apple' | null {
  let url: URL;
  try {
    url = new URL(adresse);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
  return url.hostname.toLowerCase().endsWith('.push.apple.com') ? 'apple' : null;
}
