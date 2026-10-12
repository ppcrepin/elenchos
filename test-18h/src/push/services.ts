// REPRIS pour le vrai jeu (proposé) : la liste fermée des services d'acheminement des messages (P-12, D-043).
// Le serveur n'envoie jamais à une adresse hors de cette liste : un abonnement vers ailleurs est refusé.
// Apple : https://*.push.apple.com (vérifié, documentation d'Apple). Les autres : de mémoire, gardés pour le relevé de P-12.

export type Service = 'apple' | 'google' | 'mozilla' | 'microsoft';

export function serviceDe(adresse: string): Service | null {
  let url: URL;
  try {
    url = new URL(adresse);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
  const h = url.hostname.toLowerCase();
  if (h.endsWith('.push.apple.com')) return 'apple';
  if (h === 'fcm.googleapis.com') return 'google';
  if (h === 'updates.push.services.mozilla.com') return 'mozilla';
  if (h.endsWith('.notify.windows.com')) return 'microsoft';
  return null;
}

export const NOMS_SERVICES: Record<Service, string> = {
  apple: 'Apple', google: 'Google', mozilla: 'Mozilla', microsoft: 'Microsoft',
};
