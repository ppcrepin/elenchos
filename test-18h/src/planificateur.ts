// REPRIS pour le vrai jeu (proposé) : le service qui envoie à 18h, heure de Paris, et ne peut pas envoyer deux fois.
// - Il tient l'horloge lui-même (pas l'outil d'horaires de Scalingo, qui peut sauter une exécution).
// - Avant chaque envoi, il prend un verrou en base : une ligne « envoi » unique par soir, téléphone et forme.
//   Deux serveurs qui tournent en même temps (une mise en ligne en cours, par exemple) : un seul gagne.
// - Redémarré à 18h00 et 30 secondes, il voit que l'envoi n'a pas eu lieu et le fait ; après 18h30, il ne
//   rattrape plus rien (le message serait « manqué » de toute façon).
// - Si le serveur s'arrête entre le verrou et l'envoi, la ligne reste sans réponse et rien n'est renvoyé :
//   ne jamais envoyer deux fois passe avant tout (la page de résultats montre « envoi interrompu »).
// JETABLE : les textes « Test, soir n sur 3 » (mots provisoires, à revoir par UX) et la seconde forme du soir 3.

import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import type { Soir } from './config.ts';
import { instantParis, partiesParis, type Horloge } from './horloge.ts';
import { typeErreur, type Journal } from './journal.ts';
import { OPTIONS_18H, type Envoyeur, type ResultatEnvoi } from './push/envoyeur.ts';

export const RATTRAPAGE_MS = 30 * 60_000; // après 18h30, on ne rattrape plus
const PAS_EN_CRENEAU_MS = 15_000;
const PAS_HORS_CRENEAU_MS = 60_000;

// Mots provisoires, à revoir par UX. Neutres, sans rien du jeu (avis de Juridique, D-014).
export function titreDuSoir(numero: number): string {
  if (numero === 0) return 'Test, répétition';
  if (numero >= 1 && numero <= 3) return `Test, soir ${numero} sur 3`;
  return 'Test, soir ajouté';
}
export const TITRE_ESSAI = 'Test, message d’essai';
export const SUFFIXE_SECONDE_FORME = ' (seconde forme)';

export type Forme = 'classique' | 'declarative';
export type Creneau = { soir: Soir; forme: Forme; heure: number; minute: number; telephones: number[] };

/** La seconde forme d'iOS 18.4 : au soir 3, sur le téléphone du porteur (T1) seulement, à 18h10. */
export const TELEPHONE_PORTEUR = 1;

export function creneauxDuSoir(soir: Soir): Creneau[] {
  const c: Creneau[] = [{ soir, forme: 'classique', heure: 18, minute: 0, telephones: soir.telephones }];
  if (soir.numero === 3 && soir.telephones.includes(TELEPHONE_PORTEUR)) {
    c.push({ soir, forme: 'declarative', heure: 18, minute: 10, telephones: [TELEPHONE_PORTEUR] });
  }
  return c;
}

/** iOS 18.4 ou plus récent (ou version inconnue) : la seconde forme peut s'essayer. */
export function accepteSecondeForme(systeme: string | null): boolean {
  if (!systeme) return true;
  const m = /^iOS (\d+)(?:\.(\d+))?/.exec(systeme);
  if (!m) return true;
  const majeure = Number(m[1]);
  const mineure = Number(m[2] ?? '0');
  return majeure > 18 || (majeure === 18 && mineure >= 4);
}

/** Le contenu chiffré du message. Toucher le message ne fait rien (voir public/sw.js) ; la seconde forme exige une
 *  adresse « navigate », ouverte par iOS au toucher : c'est la page elle-même. */
export function contenuDuMessage(forme: Forme, titre: string, idEnvoi: string, adressePublique: string): unknown {
  const notification = { title: titre, lang: 'fr', data: { envoi: idEnvoi } };
  if (forme === 'classique') return { notification };
  return { web_push: 8030, mutable: true, notification: { ...notification, navigate: adressePublique + '/' } };
}

type LigneAbonnement = { telephone: number; adresse: string; cle_p256dh: string; cle_auth: string; systeme: string | null };

export type Planificateur = {
  tic(): Promise<void>;
  demarrer(): void;
  arreter(): void;
  envoyerEssai(telephone: number): Promise<'envoye' | 'pas abonne' | 'trop tot'>;
};

export type DependancesPlanificateur = {
  pool: pg.Pool;
  envoyeur: Envoyeur;
  horloge: Horloge;
  journal: Journal;
  soirs: Soir[];
  adressePublique: string;
  minuteur?: { attendre(ms: number, suite: () => void): { annuler(): void } };
};

const minuteurSysteme = {
  attendre(ms: number, suite: () => void) {
    const t = setTimeout(suite, ms);
    return { annuler: () => clearTimeout(t) };
  },
};

export function creerPlanificateur(d: DependancesPlanificateur): Planificateur {
  const minuteur = d.minuteur ?? minuteurSysteme;
  let enCours = false;
  let attente: { annuler(): void } | null = null;
  let arrete = true;

  async function abonnements(telephones: number[]): Promise<LigneAbonnement[]> {
    const r = await d.pool.query<LigneAbonnement>(
      `SELECT a.telephone, a.adresse, a.cle_p256dh, a.cle_auth, t.systeme
         FROM abonnement a JOIN telephone t ON t.numero = a.telephone
        WHERE a.telephone = ANY($1::smallint[]) ORDER BY a.telephone`,
      [telephones],
    );
    return r.rows;
  }

  async function noterReponse(id: string, ab: LigneAbonnement, res: ResultatEnvoi): Promise<void> {
    await d.pool.query(
      'UPDATE envoi SET repondu_a = $2, reponse_code = $3, reponse_motif = $4 WHERE id = $1',
      [id, d.horloge.maintenant(), res.code, res.motif],
    );
    // Abonnement expiré ou retiré (404, 410) : on l'oublie, comme la norme le demande. La ligne d'envoi garde le code.
    if (res.code === 404 || res.code === 410) {
      await d.pool.query('DELETE FROM abonnement WHERE telephone = $1 AND adresse = $2', [ab.telephone, ab.adresse]);
      d.journal.ecrire({ evenement: 'envoi', detail: 'abonnement expire', statut: res.code });
    }
  }

  async function envoyerA(creneau: Creneau, ab: LigneAbonnement): Promise<void> {
    const id = randomUUID();
    const pris = await d.pool.query(
      `INSERT INTO envoi (id, telephone, nature, soir_date, soir, forme, envoye_a)
       VALUES ($1, $2, 'soir', $3, $4, $5, $6)
       ON CONFLICT (soir_date, telephone, forme) WHERE nature = 'soir' DO NOTHING
       RETURNING id`,
      [id, ab.telephone, creneau.soir.dateISO, creneau.soir.numero, creneau.forme, d.horloge.maintenant()],
    );
    if (pris.rowCount !== 1) return; // déjà envoyé, par ce serveur ou par un autre
    const titre = titreDuSoir(creneau.soir.numero) + (creneau.forme === 'declarative' ? SUFFIXE_SECONDE_FORME : '');
    const res = await d.envoyeur.envoyer(ab, contenuDuMessage(creneau.forme, titre, id, d.adressePublique), OPTIONS_18H);
    await noterReponse(id, ab, res);
    d.journal.ecrire({ evenement: 'envoi', detail: 'creneau', statut: res.code ?? 0 });
  }

  async function executer(creneau: Creneau): Promise<void> {
    let lignes = await abonnements(creneau.telephones);
    if (creneau.forme === 'declarative') lignes = lignes.filter((l) => accepteSecondeForme(l.systeme));
    const resultats = await Promise.allSettled(lignes.map((l) => envoyerA(creneau, l)));
    for (const r of resultats) {
      if (r.status === 'rejected') {
        d.journal.ecrire({ evenement: 'erreur', detail: 'envoi interrompu', erreur: typeErreur(r.reason) });
      }
    }
  }

  function creneauxEnCours(maintenant: Date): Creneau[] {
    const jour = partiesParis(maintenant).dateISO;
    const soir = d.soirs.find((s) => s.dateISO === jour);
    if (!soir) return [];
    return creneauxDuSoir(soir).filter((c) => {
      const debut = instantParis(jour, c.heure, c.minute).getTime();
      return maintenant.getTime() >= debut && maintenant.getTime() < debut + RATTRAPAGE_MS;
    });
  }

  /** Délai jusqu'au prochain réveil : le début exact du prochain créneau, ou un pas régulier. */
  function delaiSuivant(maintenant: Date): number {
    if (creneauxEnCours(maintenant).length > 0) return PAS_EN_CRENEAU_MS;
    const t = maintenant.getTime();
    let prochain = Infinity;
    for (const soir of d.soirs) {
      for (const c of creneauxDuSoir(soir)) {
        const debut = instantParis(soir.dateISO, c.heure, c.minute).getTime();
        if (debut > t) prochain = Math.min(prochain, debut);
      }
    }
    return Math.max(0, Math.min(prochain - t, PAS_HORS_CRENEAU_MS));
  }

  async function tic(): Promise<void> {
    if (enCours) return;
    enCours = true;
    try {
      for (const creneau of creneauxEnCours(d.horloge.maintenant())) await executer(creneau);
    } catch (e) {
      d.journal.ecrire({ evenement: 'erreur', detail: 'envoi interrompu', erreur: typeErreur(e) });
    } finally {
      enCours = false;
    }
  }

  function boucle(): void {
    if (arrete) return;
    attente = minuteur.attendre(delaiSuivant(d.horloge.maintenant()), () => {
      void tic().finally(boucle);
    });
  }

  return {
    tic,
    demarrer() {
      if (!arrete) return;
      arrete = false;
      d.journal.ecrire({ evenement: 'planificateur', detail: 'horloge en marche', nombre: d.soirs.length });
      void tic().finally(boucle);
    },
    arreter() {
      arrete = true;
      attente?.annuler();
    },
    async envoyerEssai(telephone) {
      const [ab] = await abonnements([telephone]);
      if (!ab) return 'pas abonne';
      const dernier = await d.pool.query<{ n: string }>(
        `SELECT count(*)::text AS n FROM envoi WHERE telephone = $1 AND nature = 'essai' AND envoye_a > $2`,
        [telephone, new Date(d.horloge.maintenant().getTime() - 20_000)],
      );
      if (Number(dernier.rows[0]?.n ?? '0') > 0) return 'trop tot';
      const id = randomUUID();
      await d.pool.query(
        `INSERT INTO envoi (id, telephone, nature, forme, envoye_a) VALUES ($1, $2, 'essai', 'classique', $3)`,
        [id, telephone, d.horloge.maintenant()],
      );
      const res = await d.envoyeur.envoyer(ab, contenuDuMessage('classique', TITRE_ESSAI, id, d.adressePublique), OPTIONS_18H);
      await noterReponse(id, ab, res);
      d.journal.ecrire({ evenement: 'envoi', detail: 'essai', statut: res.code ?? 0 });
      return 'envoye';
    },
  };
}
