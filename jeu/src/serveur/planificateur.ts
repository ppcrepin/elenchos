// Le planificateur : le message de 18h et le ménage quotidien. Étape 1, travail D (16 octobre 2026).
// Origine : test-18h/src/planificateur.ts (12 octobre 2026, « REPRIS pour le vrai jeu »), adapté
// (DECISIONS-TECHNIQUES 1.13 et 2.1). Repris tels quels :
// - il tient l'horloge lui-même (pas l'outil d'horaires de Scalingo, qui peut sauter une exécution) ;
// - avant chaque envoi, il prend un verrou en base : une ligne « envoi » unique par soir et par abonnement
//   (`envoi_un_par_soir`, migration 0001). Deux serveurs qui tournent en même temps (une mise en ligne) : un seul gagne ;
// - redémarré à 18h00 et 30 secondes, il voit que l'envoi n'a pas eu lieu et le fait ; après 18h30, il ne rattrape
//   plus rien (le message serait « manqué » de toute façon, et Apple ne le livrerait plus : apns.ts) ;
// - s'il s'arrête entre le verrou et l'envoi, la ligne reste sans réponse et rien n'est renvoyé : ne jamais envoyer
//   deux fois passe avant tout.
// Changé :
// - un envoi par soir vers chaque abonnement actif (un par appareil, CONTRAT.md, 2.13), au lieu des soirs et des
//   téléphones numérotés du test ; un joueur qui a coupé le message n'en reçoit plus (D-029 ; CONTRAT.md, 2.12) ; un
//   joueur en pause en reçoit toujours (D-029) ; deux abonnements qui portent le même jeton d'appareil (deux comptes
//   sur un même iPhone) ne font partir qu'un message ;
// - l'envoi part directement chez Apple (apns.ts) ; un abonnement qu'Apple déclare inactif est retiré ;
// - le texte est un des six de `MESSAGES_18H`, choisi selon ce qui attend le joueur (E1 ; `formeMessage18h`, le moteur) ;
// - « message envoyé » se compte quand Apple accepte, au nom du joueur de l'abonnement, dans un total du jour sans
//   personne (D-066, point 4 ; la base écarte celui qui a refusé qu'on compte ses gestes, point 3) ; « message reçu »
//   se compte à `POST /api/recu` (routes.ts) ;
// - le ménage quotidien (src/base/menage.ts), à 4h, heure de Paris (proposé), ou dès que possible s'il n'a pas pu
//   tourner, jamais de 17h30 à 18h30 (P-31) : de 4h à 17h30. Sa ligne de `tache_du_jour` (migration 0004) le fait
//   tourner une fois par jour, jamais deux fois en même temps, même avec deux serveurs ou après un redémarrage.
// Rien ne se calcule à 18h pile (D-043) : à 18h, le planificateur compare l'heure et envoie.
// Le journal ne reçoit aucune valeur de joueur : ni jeton d'appareil, ni identifiant, ni texte.

import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import { MESSAGES_18H, type Message18h, type MessageApns } from '../contrat.ts';
import { enTransaction } from '../base/connexion.ts';
import { menageDuJour } from '../base/menage.ts';
import { formeMessage18h } from '../regles/cercle.ts';
import type { EnvoyeurApns } from './apns.ts';
import { ajouterJours, instantParis, partiesParis, type Horloge } from './horloge.ts';
import { typeErreur, type Journal } from './journal.ts';

/** Le message part à 18h00, heure de Paris ; il se rattrape jusqu'à 18h30. */
export const RATTRAPAGE_MS = 30 * 60_000;
/** Le ménage : à partir de 4h (proposé), jusqu'à 17h30 au plus tard (jamais de 17h30 à 18h30, P-31). */
export const MENAGE_DEBUT_MINUTES = 4 * 60;
export const MENAGE_FIN_MINUTES = 17 * 60 + 30;
const PAS_EN_CRENEAU_MS = 15_000;
const PAS_HORS_CRENEAU_MS = 60_000;
/** Un ménage qui a échoué (la base ne répondait pas) est retenté un quart d'heure plus tard. */
const MENAGE_REESSAI_MS = 15 * 60_000;
const ENVOIS_EN_PARALLELE = 8;

/** Ce qui attend un joueur à 18h, tous cercles confondus (E1 ; CONTRAT.md, 2.13). */
export type Attente = {
  /** Des cartes dans la manche qui se révèle, dans un de ses cercles. */
  avaitDesCartes: boolean;
  /** Il avait répondu au texte qui se révèle : le vote l'attend. */
  avaitReponduAuTexteRevele: boolean;
  /** Le dimanche, un titre dans un de ses cercles. */
  titresCeSoir: boolean;
};
export type CeQuiAttend = (joueur: string, jour: string) => Promise<Attente>;

/** À L'ÉTAPE 1, SANS JEU : rien n'attend que la question du jour (aucune manche, aucune réponse, aucun titre n'existe
 *  encore). Le texte qui part est donc « 18h. La question d'aujourd'hui t'attend. », la forme que le contrat donne
 *  quand ni cartes ni vote n'attendent (E1), et le dimanche aussi, puisqu'il n'y a pas de titres. L'étape 2 remplace
 *  cette fonction par la vraie, sans rien changer d'autre. */
export const rienNAttendEncore: CeQuiAttend = () =>
  Promise.resolve({ avaitDesCartes: false, avaitReponduAuTexteRevele: false, titresCeSoir: false });

/** Le texte du message de 18h : un des six de `MESSAGES_18H`, jamais un autre (liste fermée, P-05). */
export function texteDuMessage18h(a: Attente): Message18h {
  const { forme, titres } = formeMessage18h(a);
  const i = (forme === 'cartes' ? 0 : forme === 'vote' ? 1 : 2) + (titres ? 3 : 0);
  return MESSAGES_18H[i] as Message18h;
}

/** Le contenu d'un message de 18h (`MessageApns`) : rien de personnel, sauf le numéro d'envoi tiré au hasard. */
export function messageDu18h(texte: Message18h, envoi: string): MessageApns {
  return { aps: { alert: { title: 'Elenchos', body: texte }, sound: 'default', 'mutable-content': 1 }, envoi };
}

/** Le jour (civil, à Paris) dont le message de 18h est en cours d'envoi ou de rattrapage ; null hors de 18h–18h30. */
export function creneauDuSoir(maintenant: Date): string | null {
  const jour = partiesParis(maintenant).dateISO;
  const debut = instantParis(jour, 18, 0).getTime();
  const t = maintenant.getTime();
  return t >= debut && t < debut + RATTRAPAGE_MS ? jour : null;
}

/** Le jour dont le ménage peut tourner maintenant ; null hors de 4h–17h30. */
export function creneauDuMenage(maintenant: Date): string | null {
  const p = partiesParis(maintenant);
  const m = p.heure * 60 + p.minute;
  return m >= MENAGE_DEBUT_MINUTES && m < MENAGE_FIN_MINUTES ? p.dateISO : null;
}

export type Minuteur = { attendre(ms: number, suite: () => void): { annuler(): void } };
const minuteurSysteme: Minuteur = {
  attendre(ms, suite) {
    const t = setTimeout(suite, ms);
    return { annuler: () => clearTimeout(t) };
  },
};

export type DependancesPlanificateur = {
  pools: { envoi: pg.Pool; menage: pg.Pool };
  /** null : le message de 18h est coupé (pas de clé, ou en local : aucun message ne part). */
  envoyeur: EnvoyeurApns | null;
  horloge: Horloge;
  journal: Journal;
  ceQuiAttend?: CeQuiAttend;
  minuteur?: Minuteur;
  /** 1 en ligne ; l'horloge accélérée du développement local avance plus vite que les minuteurs. */
  vitesse?: number;
};

export type Planificateur = {
  tic(): Promise<void>;
  demarrer(): void;
  arreter(): void;
};

type LigneAbonnement = { id: string; jeton: string; joueur_id: string };

export function creerPlanificateur(d: DependancesPlanificateur): Planificateur {
  const minuteur = d.minuteur ?? minuteurSysteme;
  const ceQuiAttend = d.ceQuiAttend ?? rienNAttendEncore;
  const vitesse = d.vitesse ?? 1;
  let envoiEnCours = false;
  let menageEnCours = false;
  let menageFait: string | null = null;
  let menageEchoueLe = -Infinity;
  let attente: { annuler(): void } | null = null;
  let arrete = true;

  async function abonnementsSansEnvoi(jour: string): Promise<LigneAbonnement[]> {
    const r = await d.pools.envoi.query<LigneAbonnement>(
      `SELECT DISTINCT ON (a.jeton) a.id, a.jeton, a.joueur_id FROM abonnement a
        WHERE NOT EXISTS (SELECT 1 FROM message_coupe c WHERE c.joueur_id = a.joueur_id)
          AND NOT EXISTS (SELECT 1 FROM envoi e JOIN abonnement b ON b.id = e.abonnement_id
                           WHERE b.jeton = a.jeton AND e.jour = $1 AND e.sorte = 'soir')
        ORDER BY a.jeton, a.id`, [jour]);
    return r.rows;
  }

  /** Un envoi : le verrou d'abord ; sans lui, rien. Rend vrai si ce serveur a envoyé. */
  async function envoyerA(envoyeur: EnvoyeurApns, ab: LigneAbonnement, jour: string): Promise<boolean> {
    const id = randomUUID();
    const pris = await d.pools.envoi.query(
      `INSERT INTO envoi (id, abonnement_id, sorte, jour, envoye_a) VALUES ($1, $2, 'soir', $3, $4)
       ON CONFLICT (abonnement_id, jour) WHERE sorte = 'soir' DO NOTHING RETURNING id`,
      [id, ab.id, jour, d.horloge.maintenant()]);
    if (pris.rowCount !== 1) return false; // déjà envoyé, par ce serveur ou par un autre
    let attente: Attente;
    try {
      attente = await ceQuiAttend(ab.joueur_id, jour);
    } catch (e) {
      // Mieux vaut la forme la plus neutre que pas de message : le verrou est pris, il n'y aura pas d'autre essai.
      d.journal.ecrire({ evenement: 'erreur', detail: 'creneau', erreur: typeErreur(e) });
      attente = await rienNAttendEncore(ab.joueur_id, jour);
    }
    const r = await envoyeur.envoyer(ab.jeton, messageDu18h(texteDuMessage18h(attente), id));
    await enTransaction(d.pools.envoi, { joueur: ab.joueur_id, instant: d.horloge.maintenant() }, async (c) => {
      await c.query('UPDATE envoi SET reponse_code = $2 WHERE id = $1', [id, r.statut]);
      if (r.statut === 200) await c.query("SELECT ajouter_compteur('message_envoye', $1::date)", [jour]);
      if (r.retirer) await c.query('DELETE FROM abonnement WHERE id = $1', [ab.id]);
    });
    d.journal.ecrire({
      evenement: 'envoi', detail: r.retirer ? 'abonnement retire' : 'creneau', statut: r.statut ?? 0,
      ...(r.raison ? { erreur: r.raison } : {}),
    });
    return true;
  }

  async function envoyerLeSoir(envoyeur: EnvoyeurApns, jour: string): Promise<void> {
    const file = await abonnementsSansEnvoi(jour);
    if (file.length === 0) return;
    let envoyes = 0;
    const ouvriers = Array.from({ length: Math.min(ENVOIS_EN_PARALLELE, file.length) }, async () => {
      for (let ab = file.shift(); ab !== undefined; ab = file.shift()) {
        try {
          if (await envoyerA(envoyeur, ab, jour)) envoyes += 1;
        } catch (e) {
          d.journal.ecrire({ evenement: 'erreur', detail: 'envoi interrompu', erreur: typeErreur(e) });
        }
      }
    });
    await Promise.all(ouvriers);
    envoyeur.fermer();
    d.journal.ecrire({ evenement: 'planificateur', detail: 'soir fini', nombre: envoyes });
  }

  async function tic(): Promise<void> {
    const maintenant = d.horloge.maintenant();
    const soir = creneauDuSoir(maintenant);
    if (soir !== null && d.envoyeur && !envoiEnCours) {
      envoiEnCours = true;
      try {
        await envoyerLeSoir(d.envoyeur, soir);
      } catch (e) {
        d.journal.ecrire({ evenement: 'erreur', detail: 'envoi interrompu', erreur: typeErreur(e) });
      } finally {
        envoiEnCours = false;
      }
    }
    const jourMenage = creneauDuMenage(maintenant);
    if (jourMenage !== null && menageFait !== jourMenage && !menageEnCours
      && maintenant.getTime() - menageEchoueLe >= MENAGE_REESSAI_MS) {
      menageEnCours = true;
      try {
        await menageDuJour(d.pools.menage, maintenant, jourMenage, d.journal);
        menageFait = jourMenage;
      } catch (e) {
        menageEchoueLe = maintenant.getTime();
        d.journal.ecrire({ evenement: 'erreur', detail: 'echeances effacees', erreur: typeErreur(e) });
      } finally {
        menageEnCours = false;
      }
    }
  }

  /** Le prochain réveil : toutes les 15 secondes pendant le créneau du soir ; sinon à 18h00 ou à 4h00 pile s'ils
   *  sont proches, et au plus tard dans une minute. */
  function delaiSuivant(maintenant: Date): number {
    if (creneauDuSoir(maintenant) !== null) return PAS_EN_CRENEAU_MS / vitesse;
    const t = maintenant.getTime();
    const jour = partiesParis(maintenant).dateISO;
    const cibles = [instantParis(jour, 18, 0), instantParis(ajouterJours(jour, 1), 18, 0), instantParis(jour, 4, 0),
      instantParis(ajouterJours(jour, 1), 4, 0)].map((x) => x.getTime()).filter((x) => x > t);
    const prochain = Math.min(...cibles);
    return Math.max(0, Math.min(prochain - t, PAS_HORS_CRENEAU_MS)) / vitesse;
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
      d.journal.ecrire({ evenement: 'planificateur', detail: d.envoyeur ? 'horloge en marche' : 'horloge arretee' });
      void tic().finally(boucle);
    },
    arreter() {
      arrete = true;
      attente?.annuler();
      d.envoyeur?.fermer();
    },
  };
}
