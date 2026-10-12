// JETABLE (test du message de 18h) : le serveur web du test. Repris : les en-têtes de sécurité, les cookies sûrs,
// la vérification d'origine, le principe « rien dans les adresses » (P-08) et le journal sobre (P-07).

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import type pg from 'pg';
import { toutEffacer } from './base.ts';
import { creerConnexion, RefusConnexion, type Fournisseur, type Transaction } from './connexion.ts';
import { chiffrerMessage } from './push/chiffrement.ts';
import { TELEPHONE_PORTEUR } from './planificateur.ts';
import { normaliserCode, type Config } from './config.ts';
import { deriverCle, egalAtempsConstant, hmacHex, ouvrir, sceller } from './crypto.ts';
import { creerDepot } from './depot.ts';
import type { Horloge } from './horloge.ts';
import { typeErreur, type Journal, type Route } from './journal.ts';
import { pageEntree, pageMessage, pageResultats } from './pages.ts';
import type { Planificateur } from './planificateur.ts';
import { serviceDe } from './push/services.ts';

const DOSSIER_PUBLIC = join(import.meta.dirname, '..', 'public');

const FICHIERS: Record<string, { fichier: string; type: string; cache: string }> = {
  '/': { fichier: 'index.html', type: 'text/html; charset=utf-8', cache: 'no-cache' },
  '/preparer': { fichier: 'preparer.html', type: 'text/html; charset=utf-8', cache: 'no-cache' },
  '/app.js': { fichier: 'app.js', type: 'text/javascript; charset=utf-8', cache: 'no-cache' },
  '/preparer.js': { fichier: 'preparer.js', type: 'text/javascript; charset=utf-8', cache: 'no-cache' },
  '/resultats.js': { fichier: 'resultats.js', type: 'text/javascript; charset=utf-8', cache: 'no-cache' },
  '/sw.js': { fichier: 'sw.js', type: 'text/javascript; charset=utf-8', cache: 'no-cache' },
  '/style.css': { fichier: 'style.css', type: 'text/css; charset=utf-8', cache: 'no-cache' },
  '/manifest.webmanifest': { fichier: 'manifest.webmanifest', type: 'application/manifest+json', cache: 'no-cache' },
  '/apple-touch-icon.png': { fichier: 'apple-touch-icon.png', type: 'image/png', cache: 'public, max-age=86400' },
  '/icone-192.png': { fichier: 'icone-192.png', type: 'image/png', cache: 'public, max-age=86400' },
  '/icone-512.png': { fichier: 'icone-512.png', type: 'image/png', cache: 'public, max-age=86400' },
  '/favicon-32.png': { fichier: 'favicon-32.png', type: 'image/png', cache: 'public, max-age=86400' },
  '/favicon.ico': { fichier: 'favicon-32.png', type: 'image/png', cache: 'public, max-age=86400' },
};

/** La page refuse tout chargement venu d'ailleurs (P-09, P-10). */
export const CSP = [
  "default-src 'none'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "connect-src 'self'",
  "manifest-src 'self'", "worker-src 'self'", "form-action 'self'", "frame-ancestors 'none'", "base-uri 'none'",
].join('; ');

const COOKIE_SESSION = '__Host-session';
const COOKIE_TRANSACTION = '__Host-transaction';
const COOKIE_PORTEUR = '__Host-porteur';
/** Le numéro du téléphone (T1…T5), gardé dans le seul téléphone après son abonnement : la connexion Apple n'est
 *  proposée et acceptée que sur T1, le téléphone du porteur (condition 3 de Juridique). */
const COOKIE_TELEPHONE = '__Host-telephone';

type Dependances = {
  config: Config;
  pool: pg.Pool;
  journal: Journal;
  horloge: Horloge;
  planificateur: Planificateur | null;
  fetch?: typeof fetch;
};

class ErreurHttp extends Error {
  statut: number;
  constructor(statut: number) {
    super(String(statut));
    this.statut = statut;
  }
}

/** Un compteur d'échecs, commun à tous (on ne garde aucune adresse internet) : au-delà, on refuse un moment. */
function creerLimiteur(horloge: Horloge, maximum: number, fenetreMs: number) {
  let echecs: number[] = [];
  return {
    bloque(): boolean {
      const t = horloge.maintenant().getTime();
      echecs = echecs.filter((x) => t - x < fenetreMs);
      return echecs.length >= maximum;
    },
    echec(): void {
      echecs.push(horloge.maintenant().getTime());
    },
  };
}

function lireCookies(req: IncomingMessage): Record<string, string> {
  const sortie: Record<string, string> = {};
  for (const morceau of (req.headers.cookie ?? '').split(';')) {
    const i = morceau.indexOf('=');
    if (i > 0) sortie[morceau.slice(0, i).trim()] = morceau.slice(i + 1).trim();
  }
  return sortie;
}

function cookie(nom: string, valeur: string, maxAge: number, sameSite: 'Lax' | 'Strict' | 'None'): string {
  return `${nom}=${valeur}; Path=/; Secure; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}`;
}

async function lireCorps(req: IncomingMessage, limite = 16_384): Promise<string> {
  const morceaux: Buffer[] = [];
  let taille = 0;
  for await (const m of req) {
    const b = m as Buffer;
    taille += b.length;
    if (taille > limite) throw new ErreurHttp(413);
    morceaux.push(b);
  }
  return Buffer.concat(morceaux).toString('utf8');
}

async function lireJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (!(req.headers['content-type'] ?? '').startsWith('application/json')) throw new ErreurHttp(415);
  try {
    const v: unknown = JSON.parse(await lireCorps(req));
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  } catch (e) {
    if (e instanceof ErreurHttp) throw e;
  }
  throw new ErreurHttp(400);
}

async function lireFormulaire(req: IncomingMessage): Promise<URLSearchParams> {
  if (!(req.headers['content-type'] ?? '').startsWith('application/x-www-form-urlencoded')) throw new ErreurHttp(415);
  return new URLSearchParams(await lireCorps(req));
}

export function creerApplication(d: Dependances): Server {
  const { config, journal, horloge } = d;
  const depot = creerDepot(d.pool);
  const connexion = creerConnexion(config, horloge, d.fetch ?? fetch);
  const secret = config.secretSession;
  const cleCookies = secret ? deriverCle(secret, 'cookies') : null;
  const cleEmpreinte = secret ? deriverCle(secret, 'empreinte') : null;
  const cleComparaison = secret ? deriverCle(secret, 'comparaison') : randomBytes(32);
  const limiteCodes = creerLimiteur(horloge, 20, 15 * 60_000);
  const limitePorteur = creerLimiteur(horloge, 10, 15 * 60_000);
  const contenus = new Map<string, Buffer>();
  for (const [chemin, f] of Object.entries(FICHIERS)) contenus.set(chemin, readFileSync(join(DOSSIER_PUBLIC, f.fichier)));

  function telephoneDuCode(code: unknown): number | null {
    if (typeof code !== 'string' || !config.codesEssai) return null;
    const c = normaliserCode(code);
    let trouve: number | null = null;
    config.codesEssai.forEach((bon, i) => {
      if (egalAtempsConstant(cleComparaison, bon, c)) trouve = i + 1;
    });
    return trouve;
  }

  function sessionValide(req: IncomingMessage): { compte: number; fournisseur: Fournisseur } | null {
    if (!cleCookies) return null;
    const s = ouvrir(lireCookies(req)[COOKIE_SESSION], cleCookies) as { c?: unknown; f?: unknown; e?: unknown } | null;
    if (!s || typeof s.c !== 'number' || (s.f !== 'google' && s.f !== 'apple') || typeof s.e !== 'number') return null;
    if (s.e < horloge.maintenant().getTime()) return null;
    return { compte: s.c, fournisseur: s.f };
  }

  function porteurValide(req: IncomingMessage): boolean {
    if (!cleCookies) return false;
    const p = ouvrir(lireCookies(req)[COOKIE_PORTEUR], cleCookies) as { p?: unknown; e?: unknown } | null;
    return !!p && p.p === true && typeof p.e === 'number' && p.e > horloge.maintenant().getTime();
  }

  /** Une demande qui modifie quelque chose doit venir de la page elle-même. La politique de référent « same-origin »
   *  garde l'en-tête Origin des formulaires ; en défense, « Sec-Fetch-Site: same-origin » est aussi accepté. */
  function origineAcceptee(req: IncomingMessage): boolean {
    if (req.headers.origin === config.adressePublique) return true;
    const sansOrigine = req.headers.origin === undefined || req.headers.origin === 'null';
    return sansOrigine && req.headers['sec-fetch-site'] === 'same-origin';
  }

  function telephoneDuCookie(req: IncomingMessage): number | null {
    if (!cleCookies) return null;
    const t = ouvrir(lireCookies(req)[COOKIE_TELEPHONE], cleCookies) as { t?: unknown; e?: unknown } | null;
    if (!t || typeof t.t !== 'number' || typeof t.e !== 'number' || t.e < horloge.maintenant().getTime()) return null;
    return t.t;
  }

  function envoyer(res: ServerResponse, statut: number, type: string, corps: string | Buffer, entetes: Record<string, string | string[]> = {}) {
    res.writeHead(statut, { 'Content-Type': type, 'Cache-Control': 'no-store', ...entetes });
    res.end(corps);
  }
  const json = (res: ServerResponse, statut: number, objet: unknown, entetes: Record<string, string | string[]> = {}) =>
    envoyer(res, statut, 'application/json; charset=utf-8', JSON.stringify(objet), entetes);
  const html = (res: ServerResponse, statut: number, corps: string, entetes: Record<string, string | string[]> = {}) =>
    envoyer(res, statut, 'text/html; charset=utf-8', corps, entetes);
  const rediriger = (res: ServerResponse, vers: string, entetes: Record<string, string | string[]> = {}) => {
    res.writeHead(303, { Location: vers, 'Cache-Control': 'no-store', ...entetes });
    res.end();
  };

  async function routeur(req: IncomingMessage, res: ServerResponse): Promise<Route> {
    const methode = req.method ?? 'GET';
    // P-08 : on ne lit jamais la partie « ? » d'une adresse ; tout passe dans le corps des demandes.
    const chemin = (req.url ?? '/').split('?')[0] ?? '/';

    if (methode === 'GET' && FICHIERS[chemin]) {
      const f = FICHIERS[chemin];
      envoyer(res, 200, f.type, contenus.get(chemin) ?? '', { 'Cache-Control': f.cache });
      return chemin === '/' ? 'GET /' : chemin === '/preparer' ? 'GET /preparer' : 'GET (fichier)';
    }

    if (methode === 'GET' && chemin === '/api/etat') {
      const s = sessionValide(req);
      const connecte = s ? await depot.compteExiste(s.compte, s.fournisseur) : false;
      json(res, 200, {
        connexion: connecte && s ? s.fournisseur : null,
        cleMessages: config.vapid?.publique ?? null,
        abonnementPossible: config.vapid !== null && config.codesEssai !== null,
        apple: connexion.disponible('apple') && telephoneDuCookie(req) === TELEPHONE_PORTEUR,
        google: connexion.disponible('google'),
      });
      return 'GET /api/etat';
    }

    if (methode === 'POST' && chemin.startsWith('/api/')) {
      if (!origineAcceptee(req)) throw new ErreurHttp(403);
      const route: Route = chemin === '/api/code' ? 'POST /api/code' : chemin === '/api/abonnement' ? 'POST /api/abonnement'
        : chemin === '/api/recu' ? 'POST /api/recu' : '(autre)';
      if (route === '(autre)') throw new ErreurHttp(404);
      const corps = await lireJson(req);

      if (route === 'POST /api/recu') {
        // L'heure de réception est l'heure du serveur à l'arrivée de cet avis (jamais l'heure du téléphone).
        const id = corps.envoi;
        if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
          await depot.noterReception(id, horloge.maintenant());
        }
        res.writeHead(204, { 'Cache-Control': 'no-store' });
        res.end();
        return route;
      }

      if (limiteCodes.bloque()) {
        journal.ecrire({ evenement: 'requete', route, detail: 'trop d essais' });
        json(res, 429, { erreur: 'trop d’essais' });
        return route;
      }
      const telephone = telephoneDuCode(corps.code);
      if (telephone === null) {
        limiteCodes.echec();
        journal.ecrire({ evenement: 'requete', route, detail: 'refus code' });
        json(res, 403, { erreur: 'code refusé' });
        return route;
      }
      if (route === 'POST /api/code') {
        json(res, 200, { telephone });
        return route;
      }
      // Abonnement : seulement avec un code d'essai, un abonnement par téléphone, cinq au plus.
      if (!config.vapid) throw new ErreurHttp(503);
      const ab = corps.abonnement as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | undefined;
      const adresse = ab?.endpoint;
      const p256dh = ab?.keys?.p256dh;
      const auth = ab?.keys?.auth;
      if (typeof adresse !== 'string' || typeof p256dh !== 'string' || typeof auth !== 'string'
        || !/^[A-Za-z0-9_-]{80,100}$/.test(p256dh) || !/^[A-Za-z0-9_-]{16,32}$/.test(auth) || adresse.length > 1024) {
        throw new ErreurHttp(400);
      }
      if (serviceDe(adresse) === null) {
        journal.ecrire({ evenement: 'requete', route, detail: 'service refuse' });
        json(res, 422, { erreur: 'service d’acheminement hors de la liste' });
        return route;
      }
      // Les clés doivent servir : un chiffrement à blanc, sinon un envoi raterait plus tard sans être rejoué.
      try {
        chiffrerMessage(Buffer.from('{}'), { p256dh, auth });
      } catch {
        throw new ErreurHttp(400);
      }
      await depot.enregistrerAbonnement(telephone, adresse, p256dh, auth);
      const marque = cleCookies
        ? sceller({ t: telephone, e: horloge.maintenant().getTime() + 30 * 86_400_000 }, cleCookies) : null;
      json(res, 201, { telephone }, marque ? { 'Set-Cookie': cookie(COOKIE_TELEPHONE, marque, 30 * 86_400, 'Lax') } : {});
      return route;
    }

    const debutConnexion = /^\/connexion\/(google|apple)$/.exec(chemin);
    if (methode === 'GET' && debutConnexion) {
      const f = debutConnexion[1] as Fournisseur;
      const route: Route = f === 'google' ? 'GET /connexion/google' : 'GET /connexion/apple';
      if (!connexion.disponible(f) || !cleCookies) {
        html(res, 503, pageMessage('Connexion pas encore prête', 'Ce bouton ne marche pas encore. Réessaie plus tard.', '/'));
        return route;
      }
      if (f === 'apple' && telephoneDuCookie(req) !== TELEPHONE_PORTEUR) {
        journal.ecrire({ evenement: 'connexion', route, detail: 'refus telephone' });
        html(res, 403, pageMessage('La connexion n’a pas marché', 'Ce bouton ne marche que sur le téléphone 1.', '/'));
        return route;
      }
      const { url, transaction } = await connexion.debut(f);
      // Le retour d'Apple ou de Google est un formulaire envoyé depuis leur site : il faut SameSite=None pour ce cookie.
      res.writeHead(302, {
        Location: url,
        'Cache-Control': 'no-store',
        'Set-Cookie': cookie(COOKIE_TRANSACTION, sceller(transaction, cleCookies), 600, 'None'),
      });
      res.end();
      return route;
    }

    const retourConnexion = /^\/connexion\/(google|apple)\/retour$/.exec(chemin);
    if (methode === 'POST' && retourConnexion) {
      const f = retourConnexion[1] as Fournisseur;
      const route: Route = f === 'google' ? 'POST /connexion/google/retour' : 'POST /connexion/apple/retour';
      const effacerTransaction = cookie(COOKIE_TRANSACTION, '', 0, 'None');
      if (!cleCookies || !cleEmpreinte) throw new ErreurHttp(503);
      const parametres = await lireFormulaire(req);
      const transaction = ouvrir(lireCookies(req)[COOKIE_TRANSACTION], cleCookies) as Transaction | null;
      try {
        const identite = await connexion.retour(f, parametres, transaction);
        const empreinte = hmacHex(cleEmpreinte, `${identite.fournisseur}:${identite.sub}`);
        const numero = await depot.compte(identite.fournisseur, empreinte, identite.emailRecu);
        const session = sceller({ c: numero, f: identite.fournisseur, e: horloge.maintenant().getTime() + 30 * 86_400_000 }, cleCookies);
        journal.ecrire({ evenement: 'connexion', route, detail: 'reussie' });
        rediriger(res, '/', { 'Set-Cookie': [effacerTransaction, cookie(COOKIE_SESSION, session, 30 * 86_400, 'Lax')] });
      } catch (e) {
        const raison = e instanceof RefusConnexion ? e.raison : 'jeton refuse';
        journal.ecrire({ evenement: 'connexion', route, detail: raison });
        const nom = f === 'apple' ? 'Apple' : 'Google';
        const textes = {
          'refus fournisseur': `${nom} a annulé ou refusé la connexion. Tu peux réessayer.`,
          'etat different': 'La connexion a expiré, ou elle s’est terminée dans Safari au lieu de l’icône. Reviens et recommence.',
          'jeton refuse': `La réponse de ${nom} n’a pas pu être vérifiée. Réessaie.`,
        } as const;
        html(res, 400, pageMessage('La connexion n’a pas marché', textes[raison], '/'), { 'Set-Cookie': effacerTransaction });
      }
      return route;
    }

    if (methode === 'POST' && chemin === '/deconnexion') {
      if (!origineAcceptee(req)) throw new ErreurHttp(403);
      rediriger(res, '/', { 'Set-Cookie': cookie(COOKIE_SESSION, '', 0, 'Lax') });
      return 'POST /deconnexion';
    }

    if (methode === 'GET' && chemin === '/resultats') {
      if (!porteurValide(req)) html(res, 200, pageEntree(null));
      else html(res, 200, await pageResultats(config, depot, horloge.maintenant(), null));
      return 'GET /resultats';
    }

    if (methode === 'POST' && chemin.startsWith('/resultats/')) {
      if (!origineAcceptee(req)) throw new ErreurHttp(403);
      const action = chemin.slice('/resultats/'.length);
      const routes: Record<string, Route> = {
        entree: 'POST /resultats/entree', sortie: 'POST /resultats/sortie', essai: 'POST /resultats/essai',
        systeme: 'POST /resultats/systeme', 'effacer-ligne': 'POST /resultats/effacer-ligne',
        'effacer-compte': 'POST /resultats/effacer-compte', 'tout-effacer': 'POST /resultats/tout-effacer',
      };
      const route = routes[action];
      if (!route) throw new ErreurHttp(404);
      const formulaire = await lireFormulaire(req);

      if (route === 'POST /resultats/entree') {
        if (!cleCookies || !config.codeAccesPorteur) {
          html(res, 503, pageEntree('Le code d’accès n’est pas encore réglé chez Scalingo.'));
          return route;
        }
        if (limitePorteur.bloque()) {
          html(res, 429, pageEntree('Trop d’essais. Réessayez dans un quart d’heure.'));
          return route;
        }
        if (!egalAtempsConstant(cleComparaison, config.codeAccesPorteur, normaliserCode(formulaire.get('code') ?? ''))) {
          limitePorteur.echec();
          html(res, 403, pageEntree('Code refusé. Vérifiez-le et réessayez.'));
          return route;
        }
        const jeton = sceller({ p: true, e: horloge.maintenant().getTime() + 12 * 3_600_000 }, cleCookies);
        rediriger(res, '/resultats', { 'Set-Cookie': cookie(COOKIE_PORTEUR, jeton, 12 * 3600, 'Strict') });
        return route;
      }
      if (route === 'POST /resultats/sortie') {
        rediriger(res, '/resultats', { 'Set-Cookie': cookie(COOKIE_PORTEUR, '', 0, 'Strict') });
        return route;
      }
      if (!porteurValide(req)) throw new ErreurHttp(403);

      const numero = (nom: string, max: number): number | null => {
        const v = Number(formulaire.get(nom));
        return Number.isInteger(v) && v >= 1 && v <= max ? v : null;
      };
      let message: string;
      if (route === 'POST /resultats/essai') {
        if (!d.planificateur) message = 'Envoi impossible : la clé des messages n’est pas réglée chez Scalingo (lignes VAPID_ de la page Préparer).';
        else {
          const cibles = formulaire.get('telephone') === 'tous' ? [1, 2, 3, 4, 5] : [numero('telephone', 5)].filter((n): n is number => n !== null);
          const mots = { envoye: 'envoyé', 'pas abonne': 'pas abonné', 'trop tot': 'déjà envoyé il y a moins de 20 s, attendez un peu' } as const;
          const issues = await Promise.all(cibles.map(async (n) => {
            const issue = d.planificateur ? await d.planificateur.envoyerEssai(n) : 'pas abonne';
            return `T${n} : ${mots[issue]}`;
          }));
          message = `Message d’essai — ${issues.join(', ')}. Regardez le tableau dans une minute.`;
        }
      } else if (route === 'POST /resultats/systeme') {
        const n = numero('telephone', 5);
        const v = (formulaire.get('systeme') ?? '').trim();
        const valide = v === '' || /^iOS [0-9]{1,2}(\.[0-9]{1,2}){0,2}$/.test(v);
        message = n && valide && (await depot.noterSysteme(n, v === '' ? null : v))
          ? `Version notée pour T${n}.` : 'Version non notée : le téléphone n’est pas encore inscrit, ou la version n’est pas écrite comme « iOS 18.5 ».';
      } else if (route === 'POST /resultats/effacer-ligne') {
        const n = numero('telephone', 5);
        if (n) await depot.effacerLigne(n);
        journal.ecrire({ evenement: 'effacement', detail: 'ligne effacee' });
        message = n ? `Ligne de T${n} effacée.` : 'Rien effacé.';
      } else if (route === 'POST /resultats/effacer-compte') {
        const n = numero('numero', 1000);
        if (n) await depot.effacerCompte(n);
        journal.ecrire({ evenement: 'effacement', detail: 'compte efface' });
        message = n ? `Compte ${n} effacé.` : 'Rien effacé.';
      } else {
        if (formulaire.get('confirmation') !== 'EFFACER') message = 'Rien effacé : tapez EFFACER pour confirmer.';
        else {
          const etat = await toutEffacer(d.pool);
          journal.ecrire({ evenement: 'effacement', detail: etat.vide ? 'base videe' : 'base non vide' });
          const detail = Object.entries(etat.lignes).map(([t, n]) => `${t} : ${n}`).join(', ');
          html(res, 200, pageMessage(
            etat.vide ? 'Base vide : vérifié' : 'Attention : la base n’est pas vide',
            `Lignes restantes : ${detail}.${etat.tablesHorsCarte.length ? ' Tables absentes de la carte des données : ' + etat.tablesHorsCarte.join(', ') + '.' : ''} `
              + 'Étape suivante : supprimer l’application et sa base chez Scalingo (pas-à-pas « Effacement »).',
            '/resultats',
          ));
          return route;
        }
      }
      html(res, 200, await pageResultats(config, depot, horloge.maintenant(), message));
      return route;
    }

    throw new ErreurHttp(404);
  }

  return createServer((req, res) => {
    const debut = performance.now();
    const requete = randomBytes(4).toString('hex');
    // En-têtes de sécurité sur toutes les réponses (P-41) ; demande de non-référencement (comme D-019).
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin'); // « no-referrer » ferait envoyer « Origin: null » aux formulaires
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (config.enLigne) res.setHeader('Strict-Transport-Security', 'max-age=31536000');

    // Chez Scalingo, la connexion chiffrée s'arrête au routeur, qui le dit par X-Forwarded-Proto.
    if (config.enLigne && req.headers['x-forwarded-proto'] !== 'https') {
      res.writeHead(308, { Location: config.adressePublique + '/' });
      res.end();
      journal.ecrire({ evenement: 'requete', route: '(autre)', statut: 308, requete });
      return;
    }

    routeur(req, res).then(
      (route) => journal.ecrire({ evenement: 'requete', route, statut: res.statusCode, duree_ms: performance.now() - debut, requete }),
      (e: unknown) => {
        const statut = e instanceof ErreurHttp ? e.statut : 500;
        const navigation = req.headers['sec-fetch-mode'] === 'navigate' || (req.headers.accept ?? '').includes('text/html');
        if (res.headersSent) res.end();
        else if (navigation) {
          const retour = (req.url ?? '').startsWith('/resultats') ? '/resultats' : '/';
          html(res, statut, pageMessage('La demande n’a pas abouti', `Erreur ${statut}. Revenir à la page, puis réessayer.`, retour));
        } else json(res, statut, { erreur: statut });
        journal.ecrire({
          evenement: statut >= 500 ? 'erreur' : 'requete', route: '(autre)', statut, requete,
          duree_ms: performance.now() - debut, ...(statut >= 500 ? { erreur: typeErreur(e) } : {}),
        });
      },
    );
  });
}
