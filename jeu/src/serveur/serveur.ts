// Le serveur HTTP du jeu (CONTRAT.md, parties 1, 4 et 6 ; DECISIONS-TECHNIQUES 1.8 et 1.10). Étape 1, travail D
// (16 octobre 2026). Origine : test-18h/src/serveur.ts (12 octobre 2026), adapté. Repris : `node:http` sans cadre web,
// le corps lu jusqu'à 16 Kio, les en-têtes de sécurité, « rien dans les adresses » (P-08), la redirection vers https
// derrière le routeur de Scalingo, le journal à listes fermées (P-07), un limiteur sans aucune adresse internet gardée.
// Changé pour l'application :
// - plus de cookie ni de contrôle d'origine par cookie : la session est un jeton dans `Authorization: Bearer`
//   (sessions.ts) ;
// - CORS pour la seule origine de l'application, `capacitor://localhost` : `GET` et `POST`, et les trois en-têtes
//   `Authorization`, `Content-Type`, `Elenchos-Fabrication`, sans identifiants de navigateur. Une demande venue d'une
//   autre origine reçoit `origine_refusee` ; nos propres pages (l'adresse publique) sont acceptées. Une demande SANS
//   origine n'est acceptée que sur `POST /api/recu`, que l'extension envoie (les navigateurs donnent toujours une
//   origine à une demande d'une autre adresse, et à tout `POST`) ;
// - la version minimale : `fabricationMinimale` dans chaque enveloppe, et `mise_a_jour_requise` (426) à toute demande
//   dont l'en-tête `Elenchos-Fabrication` porte un numéro plus petit, jamais à `GET /api/etat` ;
// - l'enveloppe `Reponse<T>` du contrat, et le routeur typé contre `Routes` (routeur.ts) ;
// - le limiteur : un par session, et un compteur commun pour les demandes sans session, sur un quart d'heure au plus
//   (le message fixe « réessaie dans un quart d'heure » reste vrai) ; un troisième, à part, pour `POST /api/recu`.
// Non repris : les pages et la page de résultats du test, le code d'accès du porteur, les codes d'essai.

import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type pg from 'pg';
import type { CodeErreur, Horloge as HorlogeContrat, Reponse } from '../contrat.ts';
import type { Config } from './config.ts';
import { fermetureDuJour, jourDeJeu, type Horloge } from './horloge.ts';
import { ROUTES, typeErreur, type Detail, type Journal, type Route } from './journal.ts';
import { PasEncoreConstruit, STATUTS, type Contexte, type NomRoute, type RouteServie, type TableDesRoutes } from './routeur.ts';
import { jetonDeLEntete, lireSession, type SessionLue } from './sessions.ts';

/** L'origine de l'interface embarquée (Capacitor, iOS). */
export const ORIGINE_APPLICATION = 'capacitor://localhost';
const ENTETES_PERMIS = ['authorization', 'content-type', 'elenchos-fabrication'];
const TAILLE_MAX_CORPS = 16_384;

/** Le limiteur : `maximum` demandes par fenêtre glissante d'un quart d'heure au plus (CONTRAT.md, 1.7). */
export const LIMITES = {
  fenetreMs: 15 * 60_000,
  parSession: 600,
  sansSession: 300,
  recu: 3000,
};

export type DependancesServeur = {
  config: Pick<Config, 'enLigne' | 'adressePublique' | 'secretSession' | 'fabricationMinimale'>;
  pools: { comptes: pg.Pool };
  horloge: Horloge;
  /** 1 en ligne ; plus en local, horloge accélérée (CONTRAT.md, partie 5). */
  vitesse: number;
  journal: Journal;
  table: TableDesRoutes;
  recu(corps: unknown, maintenant: Date): Promise<void>;
};

/** Ce que le journal dira d'une demande : sa route (liste fermée) et, s'il y a lieu, un détail (liste fermée). */
type Suivi = { route: Route; detail?: Detail };

class ErreurDemande extends Error {
  override name = 'Error';
  readonly code: CodeErreur;
  constructor(code: CodeErreur) {
    super(code);
    this.code = code;
  }
}

function creerLimiteur(horloge: Horloge, maximum: number) {
  const fenetres = new Map<string, number[]>();
  return {
    /** Compte une demande ; vrai si la limite est dépassée. */
    depasse(cle: string): boolean {
      const t = horloge.maintenant().getTime();
      const l = (fenetres.get(cle) ?? []).filter((x) => t - x < LIMITES.fenetreMs);
      l.push(t);
      fenetres.set(cle, l);
      if (fenetres.size > 10_000) {
        for (const [k, v] of fenetres) if (v.every((x) => t - x >= LIMITES.fenetreMs)) fenetres.delete(k);
      }
      return l.length > maximum;
    },
  };
}

async function lireCorps(req: IncomingMessage): Promise<string> {
  const morceaux: Buffer[] = [];
  let taille = 0;
  for await (const m of req) {
    const b = m as Buffer;
    taille += b.length;
    if (taille > TAILLE_MAX_CORPS) throw new ErreurDemande('requete_invalide');
    morceaux.push(b);
  }
  return Buffer.concat(morceaux).toString('utf8');
}

async function lireJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (!/^application\/json(;|$)/.test(req.headers['content-type'] ?? '')) throw new ErreurDemande('requete_invalide');
  try {
    const v: unknown = JSON.parse(await lireCorps(req));
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch (e) {
    if (e instanceof ErreurDemande) throw e;
  }
  throw new ErreurDemande('requete_invalide');
}

/** Vide le corps d'une demande qu'on ne lit pas, sans le garder. */
async function ignorerCorps(req: IncomingMessage): Promise<void> {
  let taille = 0;
  for await (const m of req) {
    taille += (m as Buffer).length;
    if (taille > TAILLE_MAX_CORPS) throw new ErreurDemande('requete_invalide');
  }
}

export function creerServeur(d: DependancesServeur): Server {
  const { config, journal, horloge } = d;
  const limiteSession = creerLimiteur(horloge, LIMITES.parSession);
  const limiteCommune = creerLimiteur(horloge, LIMITES.sansSession);
  const limiteRecu = creerLimiteur(horloge, LIMITES.recu);
  const routesDuContrat = new Set<string>(ROUTES);

  function horlogeDe(maintenant: Date): HorlogeContrat {
    return { instant: maintenant.toISOString(), bascule: fermetureDuJour(jourDeJeu(maintenant)).toISOString(), vitesse: d.vitesse };
  }

  function entetesCommuns(res: ServerResponse, origineApp: boolean): void {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Vary', 'Origin');
    if (config.enLigne) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    if (origineApp) res.setHeader('Access-Control-Allow-Origin', ORIGINE_APPLICATION);
  }

  function envoyer(res: ServerResponse, statut: number, corps: Reponse<unknown>): void {
    res.writeHead(statut, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(corps));
  }

  function erreur(res: ServerResponse, code: CodeErreur, maintenant: Date): void {
    envoyer(res, STATUTS[code], { ok: false, fabricationMinimale: config.fabricationMinimale, horloge: horlogeDe(maintenant), erreur: code });
  }

  /** Une route `/api/` ou `/dev/`. Rend la route pour le journal. */
  async function api(req: IncomingMessage, res: ServerResponse, methode: string, chemin: string, requeteAvecQuestion: boolean,
    suivi: Suivi): Promise<Route> {
    const maintenant = horloge.maintenant();
    const origine = req.headers.origin;
    const origineApp = origine === ORIGINE_APPLICATION;
    const origineAcceptee = origineApp || origine === config.adressePublique;
    entetesCommuns(res, origineApp);
    const cle = `${methode} ${chemin}`;
    const route: Route = routesDuContrat.has(cle) ? (cle as Route) : '(autre)';
    suivi.route = route;

    // La demande préalable du navigateur intégré (CORS) : l'application seulement, GET et POST, les trois en-têtes.
    if (methode === 'OPTIONS') {
      const demandee = String(req.headers['access-control-request-method'] ?? '');
      const entetes = String(req.headers['access-control-request-headers'] ?? '').toLowerCase().split(',').map((x) => x.trim()).filter((x) => x);
      if (!origineApp || !['GET', 'POST'].includes(demandee) || !entetes.every((x) => ENTETES_PERMIS.includes(x))) {
        res.removeHeader('Access-Control-Allow-Origin');
        throw new ErreurDemande('origine_refusee');
      }
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, Elenchos-Fabrication',
        'Access-Control-Max-Age': '600',
      });
      res.end();
      return route;
    }

    // La réception du message, envoyée par l'extension, sans session et sans origine : 204, quoi qu'il arrive.
    if (cle === 'POST /api/recu') {
      if (origine !== undefined && !origineAcceptee) throw new ErreurDemande('origine_refusee');
      let corps: unknown = null;
      try {
        corps = await lireJson(req);
      } catch { /* un corps illisible ne change rien : 204 */ }
      if (!limiteRecu.depasse('recu')) await d.recu(corps, maintenant);
      res.writeHead(204);
      res.end();
      return 'POST /api/recu';
    }

    if (!origineAcceptee) throw new ErreurDemande('origine_refusee');
    if (requeteAvecQuestion) throw new ErreurDemande('requete_invalide'); // P-08 : rien après « ? »

    // La version minimale (jamais sur GET /api/etat, par laquelle l'application l'apprend).
    if (cle !== 'GET /api/etat') {
      const f = req.headers['elenchos-fabrication'];
      if (f !== undefined) {
        if (typeof f !== 'string' || !/^[0-9]{1,9}$/.test(f)) throw new ErreurDemande('requete_invalide');
        if (Number(f) < config.fabricationMinimale) {
          suivi.detail = 'mise a jour requise';
          throw new ErreurDemande('mise_a_jour_requise');
        }
      }
    }

    // Une route du contrat pas encore construite, une route /dev/ (jamais montée à l'étape 1), une adresse inconnue.
    const servie = (d.table as Record<string, RouteServie<NomRoute> | undefined>)[cle];
    if (route === '(autre)' || servie === undefined) {
      if (route !== '(autre)') suivi.detail = 'pas encore construit';
      throw new ErreurDemande('introuvable');
    }

    // La session, puis le limiteur (un par session ; commun sans session).
    let session: SessionLue | null = null;
    const jeton = jetonDeLEntete(req.headers.authorization);
    if (jeton !== null && config.secretSession) session = await lireSession(d.pools.comptes, config.secretSession, jeton, maintenant);
    if (session ? limiteSession.depasse(session.id) : limiteCommune.depasse('commun')) {
      suivi.detail = 'trop de demandes';
      throw new ErreurDemande('trop_de_demandes');
    }

    // Le corps : un GET n'en a pas ; un POST porte du JSON, vérifié champ par champ.
    let corps: Record<string, unknown> | null = null;
    if (methode === 'POST') corps = await lireJson(req);
    else await ignorerCorps(req);
    const envoi = servie.lire(corps);
    if (envoi === undefined) throw new ErreurDemande('requete_invalide');

    const ctx: Contexte = { maintenant, session };
    const r = await (servie.traiter as (c: Contexte, e: unknown) => Promise<{ donnees: unknown } | { erreur: CodeErreur }>)(ctx, envoi);
    if ('erreur' in r) erreur(res, r.erreur, maintenant);
    else envoyer(res, 200, { ok: true, fabricationMinimale: config.fabricationMinimale, horloge: horlogeDe(maintenant), donnees: r.donnees });
    return route;
  }

  async function routeur(req: IncomingMessage, res: ServerResponse, suivi: Suivi): Promise<Route> {
    const methode = req.method ?? 'GET';
    const url = req.url ?? '/';
    const i = url.indexOf('?');
    // P-08 : on ne lit jamais ce qui suit « ? » ; une adresse /api/ qui en porte est refusée.
    const chemin = i >= 0 ? url.slice(0, i) : url;
    if (chemin.startsWith('/api/') || chemin.startsWith('/dev/')) return api(req, res, methode, chemin, i >= 0, suivi);
    // Les navigations (la page publique, la confidentialité, l'invitation, le fichier d'association, le retour de
    // Google : CONTRAT.md, 2.14) viennent aux étapes 2 et 4. D'ici là : introuvable, sans corps.
    entetesCommuns(res, false);
    res.writeHead(404);
    res.end();
    const nav = `${methode} ${chemin}`;
    return (ROUTES as readonly string[]).includes(nav) ? (nav as Route) : '(autre)';
  }

  return createServer((req, res) => {
    const debut = performance.now();
    const requete = randomBytes(4).toString('hex');
    // Chez Scalingo, la connexion chiffrée s'arrête au routeur, qui le dit par X-Forwarded-Proto.
    if (config.enLigne && req.headers['x-forwarded-proto'] !== 'https') {
      const chemin = (req.url ?? '/').split('?')[0] ?? '/';
      if (chemin.startsWith('/api/')) {
        entetesCommuns(res, false);
        erreur(res, 'requete_invalide', horloge.maintenant());
      } else {
        res.writeHead(308, { Location: config.adressePublique + (chemin.startsWith('/') ? chemin : '/') });
        res.end();
      }
      journal.ecrire({ evenement: 'requete', route: '(autre)', statut: res.statusCode, requete });
      return;
    }
    const suivi: Suivi = { route: '(autre)' };
    routeur(req, res, suivi).then(
      (route) => journal.ecrire({ evenement: 'requete', route, statut: res.statusCode, duree_ms: performance.now() - debut, requete }),
      (e: unknown) => {
        const code: CodeErreur = e instanceof ErreurDemande ? e.code : e instanceof PasEncoreConstruit ? 'introuvable' : 'erreur_serveur';
        if (!res.headersSent) {
          if (!res.hasHeader('Cache-Control')) entetesCommuns(res, req.headers.origin === ORIGINE_APPLICATION);
          erreur(res, code, horloge.maintenant());
        } else res.end();
        journal.ecrire({
          evenement: code === 'erreur_serveur' ? 'erreur' : 'requete', route: suivi.route, statut: STATUTS[code], requete,
          duree_ms: performance.now() - debut,
          ...(code === 'erreur_serveur' ? { erreur: typeErreur(e) } : {}),
          ...(e instanceof PasEncoreConstruit ? { detail: 'pas encore construit' as const } : suivi.detail ? { detail: suivi.detail } : {}),
        });
      },
    );
  });
}
