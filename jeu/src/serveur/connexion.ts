// La connexion : `POST /api/connexion/debut` et `POST /api/connexion/apple` (CONTRAT.md, 2.5 ; DECISIONS-TECHNIQUES
// 1.14). Étape 1, travail D (16 octobre 2026). La voie Google (la feuille du système, le retour par formulaire, le
// code de retour d'une minute) viendra à l'étape 2, reprise de test-18h/src/connexion.ts (`oauth4webapi`) : d'ici là,
// `connexion/debut` lui répond `indisponible` et `Etat.voies.google` vaut faux.
//
// Le vérificateur (CONTRAT.md, 2.5) suit exactement la méthode « S256 » de PKCE (RFC 7636, 4.1 et 4.2) :
// l'application tire 32 octets au hasard et les écrit en base64url sans remplissage (43 caractères) : c'est le
// vérificateur ; le défi est le SHA-256 de ces 43 caractères ASCII, écrit en base64url (43 caractères). Elle envoie le
// défi au début, le vérificateur à la fin. Un jeton d'Apple volé ne sert à rien sans la mémoire de l'application.
//
// À la fin, le serveur, dans cet ordre (CONTRAT.md, 2.5) :
// 1. vérifie le jeton d'Apple (apple.ts) ; un jeton refusé rend `connexion_echouee` ;
// 2. retrouve et CONSOMME la connexion en cours par son nonce (une seule fois, même si la demande est rejouée) ;
//    absente ou échue (10 minutes) : `connexion_expiree` ;
// 3. compare le vérificateur au défi ; faux : `connexion_echouee` (la connexion est déjà consommée) ;
// 4. crée ou retrouve le compte, par l'empreinte de l'identifiant d'Apple (CLE_IDENTITES : jamais l'identifiant
//    lui-même, P-01), et ouvre une session pour cet appareil.
//
// Ce que fait l'étape 4, selon le joueur, à la lettre du contrat :
// - un compte retrouvé, sans joueur provisoire : une session ; c'est « J'ai déjà un compte » ;
// - aucun compte, « J'ai déjà un compte » : `compte_inconnu` (rien n'est créé) ;
// - un joueur provisoire au bout de son défi (`creation`, pseudo choisi) : il devient un compte, avec son accord, ses
//   réponses d'entrée et son lien (c'est la même ligne de joueur, option B), et sa session provisoire est remplacée.
//   Pour un CRÉATEUR, c'est tout : il nommera son cercle. Pour un INVITÉ, l'entrée dans le cercle, le cercle complet,
//   le pseudo pris et l'annonce d'arrivée (2.5, 2.7) viennent à l'étape 2 avec le défi ;
// - un compte qui existe déjà et se reconnecte depuis un défi (le joueur provisoire se fond dans le compte) : étape 2.
// Ces deux branches de l'étape 2 répondent `introuvable` (`PasEncoreConstruit`, routeur.ts) : à l'étape 1, aucun
// joueur provisoire ne peut exister, puisque `POST /api/accord` n'est pas encore construit.
//
// LE COMPTE DU PORTEUR, À L'ÉTAPE 1 (arbitrage de l'équipe, renversable ; CONTRAT.md, 2.5). Le contrat ne crée un
// compte qu'au bout du défi, qui vient à l'étape 2 ; sans compte, pas de session, donc pas d'abonnement au message de
// 18h, que l'étape 1 doit prouver sur l'iPhone du porteur. Le réglage COMPTE_PORTEUR (un pseudo) comble ce trou, et
// seulement lui : TANT QU'AUCUN COMPTE N'EXISTE DANS LA BASE, la première connexion Apple sans joueur provisoire, d'une
// identité inconnue, ouvre un compte sous ce pseudo, sans défi ni carte. Dès qu'un compte existe, le réglage n'a plus
// d'effet ; le porteur le retire chez Scalingo après sa première connexion (pas-à-pas). Ce compte n'a ni accord, ni
// réponse, ni cercle : `Etat` le met à 5.1 (nommer le cercle), avec `accordAJour` faux.

import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type pg from 'pg';
import type { DebutConnexion, EnvoiConnexionApple, EnvoiDebutConnexion, ResultatConnexion } from '../contrat.ts';
import { enTransaction } from '../base/connexion.ts';
import { pseudoComparaison } from '../regles/cercle.ts';
import type { VerificateurApple, JetonApple } from './apple.ts';
import { JetonAppleRefuse } from './apple.ts';
import type { Config } from './config.ts';
import { b64url, empreinteIdentite, jetonAuHasard } from './crypto.ts';
import type { Journal } from './journal.ts';
import { b64urlDe, champsExacts, PasEncoreConstruit, type Contexte, type Resultat, type RouteServie } from './routeur.ts';
import { echeanceCompte, ouvrirSession } from './sessions.ts';

/** Une connexion commencée vaut 10 minutes (CONTRAT.md, 2.5). */
export const DUREE_CONNEXION_MS = 10 * 60_000;
/** Le verrou qui empêche deux ouvertures du compte du porteur en même temps (un nombre fixe, propre à ce verrou). */
const VERROU_PORTEUR = 6_202_612;

export type DependancesConnexion = {
  pools: { jeu: pg.Pool; comptes: pg.Pool };
  config: Pick<Config, 'secretSession' | 'cleIdentites' | 'apple' | 'comptePorteur' | 'finDuTest'>;
  verificateur: VerificateurApple | null;
  journal: Journal;
};

/** Le défi d'un vérificateur : base64url(SHA-256(ASCII(vérificateur))), comme PKCE « S256 » (RFC 7636, 4.2). */
export function defiDe(verificateur: string): string {
  return b64url(createHash('sha256').update(verificateur, 'ascii').digest());
}

/** Ce qu'il faut savoir d'un joueur provisoire pour le faire compte : son défi fini, son pseudo, son lien. */
type EtatProvisoire = { faits: number; pseudo: boolean; sorte: 'createur' | 'invite' | null };

export function creerConnexion(d: DependancesConnexion): {
  debut: RouteServie<'POST /api/connexion/debut'>;
  apple: RouteServie<'POST /api/connexion/apple'>;
} {
  const { comptes, jeu } = d.pools;

  async function etatProvisoire(joueur: string, instant: Date): Promise<EtatProvisoire> {
    return enTransaction(jeu, { joueur, instant }, async (c) => {
      const r = await c.query<{ faits: number; pseudo: boolean | null; sorte: 'createur' | 'invite' | null }>(
        `SELECT (SELECT count(*) FROM reponse WHERE joueur_id = $1 AND moment = 'entree')::int AS faits,
                (SELECT pseudo IS NOT NULL FROM joueur WHERE id = $1 AND etat = 'provisoire') AS pseudo,
                (SELECT sorte FROM invitation WHERE invite_joueur_id = $1 ORDER BY lie_le DESC LIMIT 1) AS sorte`, [joueur]);
      const l = r.rows[0];
      return { faits: l?.faits ?? 0, pseudo: l?.pseudo === true, sorte: l?.sorte ?? null };
    });
  }

  /** Le compte du porteur peut-il encore s'ouvrir ? Le réglage est là, et aucun compte n'existe. */
  async function porteurPossible(): Promise<boolean> {
    if (!d.config.comptePorteur) return false;
    const r = await comptes.query("SELECT 1 FROM joueur WHERE etat = 'compte' LIMIT 1");
    return (r.rowCount ?? 0) === 0;
  }

  async function sessionDuCompte(joueur: string, maintenant: Date): Promise<string> {
    const secret = d.config.secretSession as Buffer;
    return enTransaction(comptes, { instant: maintenant }, (c) => ouvrirSession(c, secret, joueur, echeanceCompte(maintenant, d.config.finDuTest)));
  }

  /** Le compte du porteur (étape 1) : rend la session, ou null si un compte existe déjà ou si l'identité a été prise
   *  entre-temps. Le joueur est d'abord inscrit provisoire par le jeu (seul module qui crée un joueur), puis fait compte
   *  par les comptes, sous un verrou ; s'il ne devient pas compte, il est effacé aussitôt. */
  async function ouvrirCompteDuPorteur(empreinte: string, maintenant: Date): Promise<string | null> {
    const pseudo = d.config.comptePorteur?.pseudo;
    const secret = d.config.secretSession;
    if (!pseudo || !secret || !(await porteurPossible())) return null;
    const id = randomUUID();
    await enTransaction(jeu, { joueur: id, instant: maintenant }, (c) => c.query(
      "INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'provisoire', $2, $3, $4)",
      [id, pseudo, pseudoComparaison(pseudo), maintenant]));
    let jeton: string | null = null;
    try {
      jeton = await enTransaction(comptes, { instant: maintenant }, async (c) => {
        await c.query('SELECT pg_advisory_xact_lock($1)', [VERROU_PORTEUR]);
        if (((await c.query("SELECT 1 FROM joueur WHERE etat = 'compte' LIMIT 1")).rowCount ?? 0) > 0) return null;
        const pris = await c.query(
          "INSERT INTO identite (voie, empreinte, joueur_id) VALUES ('apple', $1, $2) ON CONFLICT (voie, empreinte) DO NOTHING RETURNING joueur_id",
          [empreinte, id]);
        if (pris.rowCount !== 1) return null;
        await c.query("UPDATE joueur SET etat = 'compte' WHERE id = $1 AND etat = 'provisoire'", [id]);
        return ouvrirSession(c, secret, id, echeanceCompte(maintenant, d.config.finDuTest));
      });
    } finally {
      if (jeton === null) await comptes.query("DELETE FROM joueur WHERE id = $1 AND etat = 'provisoire'", [id]);
    }
    return jeton;
  }

  /** Un joueur provisoire, créateur, au bout de son défi, devient un compte (CONTRAT.md, 2.5). Rend la session. */
  async function creerCompteDuCreateur(joueur: string, empreinte: string, maintenant: Date): Promise<string | 'pris' | 'etape'> {
    const secret = d.config.secretSession as Buffer;
    return enTransaction(comptes, { instant: maintenant }, async (c) => {
      const pris = await c.query(
        "INSERT INTO identite (voie, empreinte, joueur_id) VALUES ('apple', $1, $2) ON CONFLICT (voie, empreinte) DO NOTHING RETURNING joueur_id",
        [empreinte, joueur]);
      if (pris.rowCount !== 1) return 'pris';
      const fait = await c.query("UPDATE joueur SET etat = 'compte' WHERE id = $1 AND etat = 'provisoire' RETURNING id", [joueur]);
      if (fait.rowCount !== 1) throw new EtapeIncorrecte();
      // La session provisoire est remplacée par celle du compte (« le jeton du compte le remplace dans le trousseau »).
      await c.query('DELETE FROM session WHERE joueur_id = $1', [joueur]);
      return ouvrirSession(c, secret, joueur, echeanceCompte(maintenant, d.config.finDuTest));
    }).catch((e: unknown) => {
      if (e instanceof EtapeIncorrecte) return 'etape' as const;
      throw e;
    });
  }

  const debut: RouteServie<'POST /api/connexion/debut'> = {
    lire(corps) {
      if (!champsExacts(corps, ['voie', 'but', 'defi'])) return undefined;
      const { voie, but, defi } = corps;
      if ((voie !== 'apple' && voie !== 'google') || (but !== 'creation' && but !== 'connexion') || !b64urlDe(defi, 43)) return undefined;
      return { voie, but, defi } satisfies EnvoiDebutConnexion;
    },
    async traiter(ctx: Contexte, e): Promise<Resultat<DebutConnexion, 'etape_incorrecte' | 'indisponible'>> {
      if (e.voie === 'google') return { erreur: 'indisponible' }; // étape 2
      if (!d.config.apple || !d.verificateur || !d.config.secretSession || !d.config.cleIdentites) return { erreur: 'indisponible' };
      const s = ctx.session;
      if (s?.etat === 'compte') return { erreur: 'etape_incorrecte' };
      if (e.but === 'creation') {
        if (s === null) {
          if (!(await porteurPossible())) return { erreur: 'etape_incorrecte' };
        } else {
          const p = await etatProvisoire(s.joueur, ctx.maintenant);
          if (p.faits < 3 || !p.pseudo || p.sorte === null) return { erreur: 'etape_incorrecte' };
        }
      }
      const nonce = jetonAuHasard();
      await comptes.query(
        `INSERT INTO connexion_en_cours (id, voie, but, nonce, defi, joueur_id, expire_le)
         VALUES ($1, 'apple', $2, $3, $4, $5, $6)`,
        [randomUUID(), e.but, nonce, e.defi, s?.joueur ?? null, new Date(ctx.maintenant.getTime() + DUREE_CONNEXION_MS)]);
      return { donnees: { voie: 'apple', nonce } };
    },
  };

  const apple: RouteServie<'POST /api/connexion/apple'> = {
    lire(corps) {
      if (!champsExacts(corps, ['jetonIdentite', 'verificateur'])) return undefined;
      const { jetonIdentite, verificateur } = corps;
      if (typeof jetonIdentite !== 'string' || jetonIdentite.length === 0 || jetonIdentite.length > 8192 || !b64urlDe(verificateur, 43)) {
        return undefined;
      }
      return { jetonIdentite, verificateur } satisfies EnvoiConnexionApple;
    },
    async traiter(ctx, e): Promise<Resultat<ResultatConnexion, 'connexion_expiree' | 'etape_incorrecte'>> {
      const echouee = { donnees: { etat: 'connexion_echouee' } } as const;
      if (!d.verificateur || !d.config.cleIdentites || !d.config.secretSession) return echouee;
      // 1. Le jeton d'Apple.
      let jeton: JetonApple;
      try {
        jeton = await d.verificateur.verifier(e.jetonIdentite);
      } catch (err) {
        const raison = err instanceof JetonAppleRefuse ? err.raison : 'illisible';
        d.journal.ecrire({ evenement: 'connexion', detail: raison === 'cles_injoignables' ? 'cles apple' : 'jeton refuse', erreur: raison });
        return echouee;
      }
      // 2. La connexion en cours, consommée.
      const cx = await comptes.query<{ but: 'creation' | 'connexion'; defi: string; joueur_id: string | null; expire_le: Date }>(
        "DELETE FROM connexion_en_cours WHERE nonce = $1 AND voie = 'apple' RETURNING but, defi, joueur_id, expire_le", [jeton.nonce]);
      const l = cx.rows[0];
      if (!l || l.expire_le <= ctx.maintenant) {
        d.journal.ecrire({ evenement: 'connexion', detail: 'connexion expiree' });
        return { erreur: 'connexion_expiree' };
      }
      // 3. Le vérificateur.
      const attendu = Buffer.from(l.defi, 'ascii');
      const recu = Buffer.from(defiDe(e.verificateur), 'ascii');
      if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) {
        d.journal.ecrire({ evenement: 'connexion', detail: 'verificateur faux' });
        return echouee;
      }
      // 4. Le compte.
      const empreinte = empreinteIdentite(d.config.cleIdentites, 'identite', `apple:${jeton.sub}`);
      const trouve = (await comptes.query<{ joueur_id: string }>(
        "SELECT joueur_id FROM identite WHERE voie = 'apple' AND empreinte = $1", [empreinte])).rows[0]?.joueur_id;
      const provisoire = l.joueur_id;
      const connecte = (jetonSession: string): Resultat<ResultatConnexion, never> => {
        d.journal.ecrire({ evenement: 'connexion', detail: 'reussie' });
        return { donnees: { etat: 'connecte', jeton: jetonSession } };
      };

      if (trouve !== undefined) {
        if (provisoire !== null && provisoire !== trouve) throw new PasEncoreConstruit('compte retrouvé depuis un défi (fusion)');
        return connecte(await sessionDuCompte(trouve, ctx.maintenant));
      }
      if (provisoire === null) {
        const porteur = await ouvrirCompteDuPorteur(empreinte, ctx.maintenant);
        if (porteur !== null) {
          d.journal.ecrire({ evenement: 'connexion', detail: 'compte porteur' });
          return connecte(porteur);
        }
        if (l.but === 'creation') return { erreur: 'etape_incorrecte' };
        d.journal.ecrire({ evenement: 'connexion', detail: 'compte inconnu' });
        return { donnees: { etat: 'compte_inconnu' } };
      }
      if (l.but === 'connexion') {
        d.journal.ecrire({ evenement: 'connexion', detail: 'compte inconnu' });
        return { donnees: { etat: 'compte_inconnu' } };
      }
      const p = await etatProvisoire(provisoire, ctx.maintenant);
      if (p.faits < 3 || !p.pseudo || p.sorte === null) return { erreur: 'etape_incorrecte' };
      if (p.sorte === 'invite') throw new PasEncoreConstruit('compte d’un invité (entrée dans le cercle, annonce d’arrivée)');
      const r = await creerCompteDuCreateur(provisoire, empreinte, ctx.maintenant);
      if (r === 'etape') return { erreur: 'etape_incorrecte' };
      if (r === 'pris') throw new PasEncoreConstruit('compte retrouvé depuis un défi (fusion)');
      return connecte(r);
    },
  };

  return { debut, apple };
}

class EtapeIncorrecte extends Error {
  override name = 'Error';
}
