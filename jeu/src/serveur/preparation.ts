// Le mode préparation du serveur (16 octobre 2026 ; CONTRAT.md, 2.17 ; DECISIONS-TECHNIQUES 1.17). Origine : la page
// `/preparer` du test de 18h (test-18h/src/serveur.ts et test-18h/public/preparer.*, 12 octobre 2026), adaptée.
// Le serveur du jeu refuse de démarrer sans ses trois clés (config.ts), et le porteur n'a aucun moyen de les tirer
// seul. Quand elles manquent toutes les trois, et seulement alors (`Config.preparation`), principal.ts démarre ce
// petit serveur à la place du jeu :
// - il ne touche pas à la base : aucune connexion, aucune migration ; ni planificateur, ni ménage ;
// - il ne sert que la page `/preparer` et ses deux fichiers (jeu/pages/). La page tire les clés DANS LE NAVIGATEUR et
//   n'envoie rien : sa règle de chargement interdit tout échange (`connect-src 'none'`) et tout fichier venu d'ailleurs ;
// - tout le reste répond 503, avec un corps neutre, le même partout, sans aucune valeur ni aucun nom de réglage ;
// - il n'écrit rien au journal à chaque demande : principal.ts n'y écrit, au démarrage, que « mode preparation ».
// En ligne, une demande arrivée en http (le routeur de Scalingo le dit par X-Forwarded-Proto) est renvoyée vers
// l'adresse publique, en https, pour la page, et reçoit 503 sinon : les clés ne s'affichent jamais sur une page qu'un
// intermédiaire aurait pu modifier.

import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Config } from './config.ts';

/** Le dossier des pages web du serveur (DECISIONS-TECHNIQUES 1.12). */
export const DOSSIER_PAGES = join(import.meta.dirname, '..', '..', 'pages');

/** Les seules adresses servies en mode préparation, et leur fichier. */
export const FICHIERS_PREPARATION: Readonly<Record<string, { fichier: string; type: string }>> = {
  '/preparer': { fichier: 'preparer.html', type: 'text/html; charset=utf-8' },
  '/preparer.js': { fichier: 'preparer.js', type: 'text/javascript; charset=utf-8' },
  '/preparer.css': { fichier: 'preparer.css', type: 'text/css; charset=utf-8' },
};

/** La règle de chargement de la page : rien d'ailleurs, aucun échange, aucun formulaire, aucune image (P-09, P-10). */
export const CSP_PREPARATION = [
  "default-src 'none'", "script-src 'self'", "style-src 'self'", "img-src 'none'", "connect-src 'none'",
  "form-action 'none'", "frame-ancestors 'none'", "base-uri 'none'",
].join('; ');

/** Le corps de toute autre réponse : neutre, le même pour toutes les adresses. */
export const CORPS_INDISPONIBLE = 'Service indisponible.\n';

export function creerServeurPreparation(config: Pick<Config, 'enLigne' | 'adressePublique'>): Server {
  // Lus une fois, au démarrage : un fichier manquant arrête le serveur tout de suite, au lieu d'une page vide.
  const contenus = new Map<string, Buffer>();
  for (const [chemin, f] of Object.entries(FICHIERS_PREPARATION)) contenus.set(chemin, readFileSync(join(DOSSIER_PAGES, f.fichier)));

  function entetes(res: ServerResponse, csp: string): void {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (config.enLigne) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }

  function indisponible(res: ServerResponse): void {
    entetes(res, "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(CORPS_INDISPONIBLE);
  }

  return createServer((req: IncomingMessage, res: ServerResponse) => {
    req.resume(); // aucun corps n'est lu ni gardé
    const methode = req.method ?? 'GET';
    // P-08 : on ne lit jamais ce qui suit « ? ».
    const chemin = (req.url ?? '/').split('?')[0] ?? '/';
    const f = FICHIERS_PREPARATION[chemin];
    const contenu = contenus.get(chemin);
    if ((methode !== 'GET' && methode !== 'HEAD') || !f || !contenu) {
      indisponible(res);
      return;
    }
    if (config.enLigne && req.headers['x-forwarded-proto'] !== 'https') {
      entetes(res, "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
      res.writeHead(308, { Location: config.adressePublique + chemin });
      res.end();
      return;
    }
    entetes(res, CSP_PREPARATION);
    res.writeHead(200, { 'Content-Type': f.type, 'Content-Length': String(contenu.length) });
    res.end(methode === 'HEAD' ? undefined : contenu);
  });
}
