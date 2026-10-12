// REPRIS pour le vrai jeu (proposé) : la mesure « message de 18h reçu » (docs/produit.md, section 8).
// « Résultat » : une catégorie, jamais un rang (§9). Seuils du test (docs/etape-6/test-18h.md, partie 1) : à l'heure avant 18h02 (l'alerte de D-043), acceptable avant
// 18h05, en retard jusqu'à 18h30, manqué au-delà.

import { instantParis } from './horloge.ts';

export type EnvoiMesure = {
  nature: 'soir' | 'essai';
  soir_date: string | null;
  forme: 'classique' | 'declarative';
  envoye_a: Date;
  repondu_a: Date | null;
  reponse_code: number | null;
  recu_a: Date | null;
};

export type Resultat =
  | 'à l’heure' | 'acceptable' | 'en retard' | 'manqué' | 'en attente' | 'envoi en cours' | 'envoi interrompu'
  | 'refusé par le service' | '—';

export function heurePrevue(e: EnvoiMesure): Date {
  if (e.nature === 'soir' && e.soir_date) return instantParis(e.soir_date, 18, e.forme === 'declarative' ? 10 : 0);
  return e.envoye_a;
}

export function classer(e: EnvoiMesure, maintenant: Date): { resultat: Resultat; ecart: number | null } {
  const prevue = heurePrevue(e).getTime();
  const ecart = e.recu_a ? Math.round((e.recu_a.getTime() - prevue) / 1000) : null;
  if (e.reponse_code === null) {
    if (e.repondu_a !== null) return { resultat: 'envoi interrompu', ecart };
    return { resultat: maintenant.getTime() - e.envoye_a.getTime() > 120_000 ? 'envoi interrompu' : 'envoi en cours', ecart };
  }
  if (e.reponse_code < 200 || e.reponse_code >= 300) return { resultat: 'refusé par le service', ecart };
  if (e.nature === 'essai') return { resultat: '—', ecart };
  if (ecart !== null) {
    if (ecart < 120) return { resultat: 'à l’heure', ecart };
    if (ecart < 300) return { resultat: 'acceptable', ecart };
    if (ecart <= 1800) return { resultat: 'en retard', ecart };
    return { resultat: 'manqué', ecart };
  }
  return { resultat: maintenant.getTime() > prevue + 1_800_000 ? 'manqué' : 'en attente', ecart };
}

export function libelleReponse(code: number | null, motif: string | null): string {
  if (code === null) return motif ? `pas de réponse (${motif})` : 'pas de réponse';
  if (code >= 200 && code < 300) return 'accepté';
  return `refusé ${code}${motif ? ' ' + motif : ''}`;
}
