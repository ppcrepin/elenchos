// Les routes servies à l'étape 1 (travail D, 16 octobre 2026), et leur table. Toutes les autres routes du contrat
// répondent `introuvable` jusqu'à l'étape 2 (routeur.ts) : elles s'ajouteront à cette table sans rien changer d'autre.
//
// - `GET /api/etat` : la forme que le contrat donne à un joueur sans cercle (CONTRAT.md, 2.1) ; pour un compte dans un
//   cercle, `jeu`, sans annonce ni défi ni révélation à ouvrir, qui n'existent qu'avec le jeu (étape 2).
// - `POST /api/connexion/debut`, `POST /api/connexion/apple` : connexion.ts.
// - `POST /api/abonnement` : le jeton d'appareil d'Apple, lié à la session de cet appareil (CONTRAT.md, 2.13).
// - `POST /api/message` : couper ou rallumer le message de 18h pour tous ses appareils (D-029 ; CONTRAT.md, 2.12).
// - `POST /api/deconnexion` : la session de cet appareil et son abonnement partent (P-41).
// - `POST /api/recu` (hors de `Routes` : 204 sans corps) : la réception signalée par l'extension de l'application.

import { randomUUID } from 'node:crypto';
import type pg from 'pg';
import type { Etat, Parcours, Visage } from '../contrat.ts';
import { enTransaction } from '../base/connexion.ts';
import type { Config } from './config.ts';
import { creerConnexion, type DependancesConnexion } from './connexion.ts';
import type { Journal } from './journal.ts';
import { champsExacts, PasEncoreConstruit, rien, type TableDesRoutes } from './routeur.ts';
import { fermerSession, prolongerSession } from './sessions.ts';

export type DependancesRoutes = DependancesConnexion & {
  pools: { jeu: pg.Pool; comptes: pg.Pool; envoi: pg.Pool };
  config: DependancesConnexion['config'] & Pick<Config, 'apns'>;
  journal: Journal;
};

/** Un jeton d'appareil d'Apple : de l'hexadécimal (64 caractères aujourd'hui ; Apple prévient qu'il peut s'allonger). */
const JETON_APPAREIL = /^[0-9a-fA-F]{64,200}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function creerRoutes(d: DependancesRoutes): { table: TableDesRoutes; recu(corps: unknown, maintenant: Date): Promise<void> } {
  const { jeu, comptes, envoi } = d.pools;
  const connexion = creerConnexion(d);

  /** Le joueur a-t-il accepté la dernière carte qui demande un nouvel accord (P-34 ; même règle que la base,
   *  `reponse_avant_ecriture`, migration 0002) ? */
  async function accordAJour(c: pg.ClientBase, joueur: string): Promise<boolean> {
    const r = await c.query<{ a_jour: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM consentement c WHERE c.joueur_id = $1 AND c.donne_le <= instant_du_jeu()
         AND c.version >= coalesce((SELECT max(a.version) FROM carte_accord a WHERE a.nouvel_accord), 0)) AS a_jour`, [joueur]);
    return r.rows[0]?.a_jour === true;
  }

  async function parcoursDe(joueur: string, etat: 'provisoire' | 'compte', maintenant: Date): Promise<{ parcours: Parcours; accord: boolean }> {
    return enTransaction(jeu, { joueur, instant: maintenant }, async (c) => {
      const accord = await accordAJour(c, joueur);
      if (etat === 'compte') {
        const n = (await c.query<{ n: number }>('SELECT count(*)::int AS n FROM membre WHERE joueur_id = $1', [joueur])).rows[0]?.n ?? 0;
        // « premierCercle » faux dit que le joueur a quitté tous ses cercles : « Quitter » vient à l'étape 2, avec la
        // marque qui le dira (aucune date de départ n'est gardée, DECISIONS-TECHNIQUES 1.5).
        return { parcours: n > 0 ? { etape: 'jeu' } : { etape: 'nommer_cercle', premierCercle: true }, accord };
      }
      // Le joueur provisoire du défi (option B) : son lien, son invitant, ses réponses d'entrée.
      const faits = (await c.query<{ n: number }>(
        "SELECT count(*)::int AS n FROM reponse WHERE joueur_id = $1 AND moment = 'entree'", [joueur])).rows[0]?.n ?? 0;
      const lien = (await c.query<{ sorte: 'createur' | 'invite'; membre: string | null; rond: string | null; pseudo: string | null }>(
        `SELECT i.sorte, m.id AS membre, m.rond, j.pseudo
           FROM invitation i LEFT JOIN membre m ON m.id = i.invitant_membre_id LEFT JOIN joueur j ON j.id = m.joueur_id
          WHERE i.invite_joueur_id = $1 ORDER BY i.lie_le DESC LIMIT 1`, [joueur])).rows[0];
      // Avant sa première réponse, le lien n'est pas encore lié au joueur (P-29) : où le garder entre l'accord et cette
      // réponse se décide avec `POST /api/accord`, à l'étape 2.
      if (!lien) throw new PasEncoreConstruit('état d’un joueur provisoire avant sa première réponse');
      const mode = lien.sorte === 'createur' ? 'createur' : 'invite';
      if (faits >= 3) return { parcours: { etape: 'entree_finie', mode }, accord };
      const invitant: Visage | null = lien.membre && lien.rond && lien.pseudo ? { id: lien.membre, pseudo: lien.pseudo, rond: lien.rond } : null;
      return { parcours: { etape: 'entree', mode, invitant, faits: faits as 0 | 1 | 2 }, accord };
    });
  }

  const table: TableDesRoutes = {
    'GET /api/etat': {
      lire: rien,
      async traiter(ctx) {
        const base: Omit<Etat, 'session' | 'parcours' | 'accordAJour'> = {
          revelationAOuvrir: false, // la révélation : étape 2
          annonces: [], // l'annonce d'arrivée : étape 2, avec le compte d'un invité
          defi: null, // le défi d'un joueur inscrit : étape 2
          voies: { apple: d.config.apple !== null && d.verificateur !== null, google: false, email: false },
          message: { disponible: d.config.apns !== null },
        };
        const s = ctx.session;
        if (s === null) return { donnees: { session: 'aucune', parcours: { etape: 'dehors' }, accordAJour: true, ...base } };
        const { parcours, accord } = await parcoursDe(s.joueur, s.etat, ctx.maintenant);
        // L'ouverture prolonge la session (au plus une fois par jour : sessions.ts).
        await prolongerSession(comptes, s, ctx.maintenant, d.config.finDuTest);
        return { donnees: { session: s.etat, parcours, accordAJour: accord, ...base } };
      },
    },

    'POST /api/connexion/debut': connexion.debut,
    'POST /api/connexion/apple': connexion.apple,

    'POST /api/abonnement': {
      lire(corps) {
        if (!champsExacts(corps, ['jeton']) || typeof corps.jeton !== 'string') return undefined;
        return { jeton: corps.jeton };
      },
      async traiter(ctx, e) {
        const s = ctx.session;
        if (s === null) return { erreur: 'non_connecte' };
        if (d.config.apns === null) return { erreur: 'indisponible' };
        if (!JETON_APPAREIL.test(e.jeton)) return { erreur: 'abonnement_invalide' };
        const jeton = e.jeton.toLowerCase();
        // Un abonnement par session (par appareil). Le même jeton renvoyé ne change rien ; un jeton nouveau remplace
        // l'ancien sans effacer la ligne, donc sans effacer l'envoi du soir qui la verrouille (« jamais deux fois »).
        await enTransaction(jeu, { joueur: s.joueur, instant: ctx.maintenant }, (c) => c.query(
          `INSERT INTO abonnement (id, joueur_id, session_id, jeton) VALUES ($1, $2, $3, $4)
           ON CONFLICT (session_id) DO UPDATE SET jeton = EXCLUDED.jeton WHERE abonnement.jeton <> EXCLUDED.jeton`,
          [randomUUID(), s.joueur, s.id, jeton]));
        return { donnees: { abonne: true } };
      },
    },

    'POST /api/message': {
      lire(corps) {
        if (!champsExacts(corps, ['actif']) || typeof corps.actif !== 'boolean') return undefined;
        return { actif: corps.actif };
      },
      async traiter(ctx, e) {
        const s = ctx.session;
        if (s === null) return { erreur: 'non_connecte' };
        await enTransaction(jeu, { joueur: s.joueur, instant: ctx.maintenant }, (c) => c.query(
          e.actif ? 'DELETE FROM message_coupe WHERE joueur_id = $1'
            : 'INSERT INTO message_coupe (joueur_id) VALUES ($1) ON CONFLICT (joueur_id) DO NOTHING', [s.joueur]));
        return { donnees: { actif: e.actif } };
      },
    },

    'POST /api/deconnexion': {
      lire(corps) {
        return corps === null || champsExacts(corps, []) ? null : undefined;
      },
      async traiter(ctx) {
        if (ctx.session !== null) await fermerSession(comptes, ctx.session.id);
        return { donnees: { deconnecte: true } };
      },
    },
  };

  /** `POST /api/recu { envoi }` : la réception d'un message, signalée par l'extension, sans session. L'heure est celle
   *  du serveur. Une réception compte une fois, et seulement pour le message de 18h (« message reçu », `produit.md`
   *  §8) ; elle est ajoutée au compteur du jour de cet envoi au nom du joueur de l'abonnement, pour que la base écarte
   *  celui qui a refusé qu'on compte ses gestes (D-066, point 3). Rien n'est répondu, quoi qu'il arrive : un numéro
   *  inconnu ne se distingue pas d'un bon (204). */
  async function recu(corps: unknown, maintenant: Date): Promise<void> {
    const id = corps && typeof corps === 'object' && !Array.isArray(corps) ? (corps as { envoi?: unknown }).envoi : undefined;
    if (typeof id !== 'string' || !UUID.test(id) || Object.keys(corps as object).length !== 1) return;
    await enTransaction(envoi, { instant: maintenant }, async (c) => {
      const r = await c.query<{ sorte: string; jour: string; joueur_id: string }>(
        `UPDATE envoi e SET recu_a = $2 FROM abonnement a
          WHERE e.id = $1 AND e.recu_a IS NULL AND a.id = e.abonnement_id
          RETURNING e.sorte, e.jour::text AS jour, a.joueur_id`, [id, maintenant]);
      const l = r.rows[0];
      if (!l || l.sorte !== 'soir') return;
      await c.query("SELECT set_config('elenchos.joueur', $1, true)", [l.joueur_id]);
      await c.query("SELECT ajouter_compteur('message_recu', $1::date)", [l.jour]);
    });
  }

  return { table, recu };
}
