// Les aides des tests du serveur HTTP : un serveur monté sur une base d'essai (aides.ts), avec un faux service de clés
// d'Apple, une horloge réglable et un journal qu'on relit ; et une fonction qui fait une demande comme l'application
// (origine `capacitor://localhost`, en-têtes du contrat), sans rien de plus que `node:http`.

import { createHash, generateKeyPairSync, randomBytes } from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { creerVerificateurApple } from '../../src/serveur/apple.ts';
import { lireConfig } from '../../src/serveur/config.ts';
import { b64url } from '../../src/serveur/crypto.ts';
import { horlogeReglable } from '../../src/serveur/horloge.ts';
import { creerJournal } from '../../src/serveur/journal.ts';
import { creerRoutes } from '../../src/serveur/routes.ts';
import { creerServeur, ORIGINE_APPLICATION } from '../../src/serveur/serveur.ts';
import { AUDIENCE, cleDeTest, fauxServiceDeCles } from './aides-apple.ts';
import type { BaseDeTest } from './aides.ts';

export const ADRESSE_PUBLIQUE = 'https://elenchos.exemple.invalid';
export const CLE_APPLE = cleDeTest('cle-apple-test');

export function envDeTest(complements: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const p8 = Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()).toString('base64');
  const env: NodeJS.ProcessEnv = {
    ADRESSE_PUBLIQUE, DATABASE_URL: 'postgresql://inutile@127.0.0.1:1/inutile',
    SECRET_SESSION: b64url(randomBytes(32)), CLE_REPONSES: b64url(randomBytes(32)), CLE_IDENTITES: b64url(randomBytes(32)),
    APPLE_ID_APPLICATION: AUDIENCE, APPLE_ID_EQUIPE: 'EQUIPE1234', APPLE_ID_CLE_MESSAGES: 'CLEMSG1234', APPLE_CLE_MESSAGES: p8,
    APPLE_ID_CLE_CONNEXION: 'CLECNX1234', APPLE_CLE_CONNEXION: p8, FABRICATION_MINIMALE: '0', FIN_DU_TEST: '2027-03-31',
  };
  for (const [k, v] of Object.entries(complements)) {
    if (v === undefined) delete env[k];
    else env[k] = v;
  }
  return env;
}

export type ServeurDeTest = Awaited<ReturnType<typeof serveurDeTest>>;

export async function serveurDeTest(base: BaseDeTest, depart: Date, complements: Record<string, string | undefined> = {}) {
  const lignes: string[] = [];
  const journal = creerJournal((t) => lignes.push(t));
  const config = lireConfig(envDeTest(complements));
  const horloge = horlogeReglable(depart);
  const cles = fauxServiceDeCles(() => [CLE_APPLE]);
  const verificateur = config.apple ? creerVerificateurApple({ audience: config.apple.idApplication, horloge, fetch: cles.fetch }) : null;
  const pools = { jeu: base.module('jeu'), comptes: base.module('comptes'), envoi: base.module('envoi') };
  const { table, recu } = creerRoutes({ pools, config, verificateur, journal });
  const serveur = creerServeur({ config, pools, horloge, vitesse: 1, journal, table, recu });
  await new Promise<void>((r) => serveur.listen(0, '127.0.0.1', r));
  const port = (serveur.address() as AddressInfo).port;

  type Options = { origine?: string | null; jeton?: string; fabrication?: string; corps?: unknown; brut?: string; type?: string;
    entetes?: Record<string, string> };
  async function demande(methode: string, chemin: string, o: Options = {}): Promise<{ statut: number; entetes: http.IncomingHttpHeaders; json: any; texte: string }> {
    const entetes: Record<string, string> = { ...o.entetes };
    const origine = o.origine === undefined ? ORIGINE_APPLICATION : o.origine;
    if (origine !== null) entetes.origin = origine;
    if (o.jeton !== undefined) entetes.authorization = `Bearer ${o.jeton}`;
    if (o.fabrication !== undefined) entetes['elenchos-fabrication'] = o.fabrication;
    let corps: string | undefined = o.brut;
    if (o.corps !== undefined) corps = JSON.stringify(o.corps);
    if (corps !== undefined) entetes['content-type'] = o.type ?? 'application/json';
    return new Promise((resoudre, rejeter) => {
      const req = http.request({ host: '127.0.0.1', port, method: methode, path: chemin, headers: entetes }, (res) => {
        const morceaux: Buffer[] = [];
        res.on('data', (m: Buffer) => morceaux.push(m));
        res.on('end', () => {
          const texte = Buffer.concat(morceaux).toString('utf8');
          let json: unknown = null;
          try { json = texte ? JSON.parse(texte) : null; } catch { json = null; }
          resoudre({ statut: res.statusCode ?? 0, entetes: res.headers, json, texte });
        });
      });
      req.on('error', rejeter);
      if (corps !== undefined) req.write(corps);
      req.end();
    });
  }

  return {
    config, horloge, journal: lignes, demande, cles, serveur,
    fin: () => new Promise<void>((r) => { serveur.close(() => r()); serveur.closeAllConnections(); }),
  };
}

/** Un vérificateur et son défi, comme l'application les tire (PKCE « S256 »). */
export function verificateurEtDefi(): { verificateur: string; defi: string } {
  const verificateur = b64url(randomBytes(32));
  return { verificateur, defi: b64url(createHash('sha256').update(verificateur, 'ascii').digest()) };
}
