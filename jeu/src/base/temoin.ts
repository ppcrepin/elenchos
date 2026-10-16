// Le témoin des clés (16 octobre 2026 ; migration 0005 ; CONTRAT.md, 2.17 ; DECISIONS-TECHNIQUES 1.7).
//
// CLE_REPONSES et CLE_IDENTITES ne changent jamais pendant le test : la première ouvre les réponses chiffrées, la
// seconde retrouve les comptes. Des clés retirées par erreur puis remplacées (par exemple tirées de nouveau sur la page
// /preparer) laisseraient le serveur démarrer avec des clés qui n'ouvrent rien, sans que rien ne le dise. Le témoin
// rend cette erreur impossible à manquer :
// - au premier démarrage normal, le serveur range en base une empreinte à sens unique de chacune des deux clés
//   (crypto.ts, temoinDeCle), qui ne permet pas de retrouver la clé ;
// - à chaque démarrage suivant, il recalcule les deux empreintes : si l'une ne correspond plus, il refuse de démarrer
//   (principal.ts), avec un détail fixe dans le journal et le seul NOM de la clé en cause, jamais une valeur.
// SECRET_SESSION n'a pas de témoin : le changer déconnecte tout le monde sans rien perdre (DECISIONS-TECHNIQUES 1.7),
// et c'est le geste à faire s'il fuit.
//
// Le mode préparation ne touche pas à la base (preparation.ts) : il n'écrit ni ne lit le témoin. C'est le démarrage
// normal qui suit, une fois les clés saisies, qui l'écrit la première fois.
// Tout se fait sous le propriétaire des tables, dans une transaction et sous un verrou : deux conteneurs qui démarrent
// ensemble pour la première fois (une mise en ligne) n'écrivent qu'un témoin, et le second le compare.

import { creerPoolModule, type OptionsPool } from './connexion.ts';
import { temoinDeCle, type CleTemoin } from '../serveur/crypto.ts';

/** Les deux clés qui ont un témoin, dans l'ordre où le journal les nomme. */
export const CLES_TEMOINS: readonly CleTemoin[] = ['CLE_REPONSES', 'CLE_IDENTITES'];
const VERROU_TEMOIN = 6_202_612; // un nombre fixe, propre à ce verrou (6 202 610 : migrations ; 6 202 611 : rôles ; 6 202 613 : compte du porteur)

/** Une clé ne correspond plus à son témoin : le serveur ne doit pas démarrer. `cles` : leurs noms, jamais leurs valeurs. */
export class ClesChangees extends Error {
  override name = 'Error';
  readonly cles: CleTemoin[];
  constructor(cles: CleTemoin[]) {
    super('clés changées depuis le premier démarrage');
    this.cles = cles;
  }
}

/** « enregistre » : un témoin manquait, il est maintenant rangé (le premier démarrage normal) ; « conforme » : les deux
 *  clés sont celles du premier démarrage. Une clé qui ne correspond plus lève `ClesChangees`, et rien n'est écrit. */
export type IssueTemoin = 'enregistre' | 'conforme';

/** Compare les deux clés à leur témoin, ou range le témoin qui manque. `url` : l'adresse de la base, au nom du
 *  propriétaire des tables (après installerBase, qui a joué la migration 0005). */
export async function verifierTemoinDesCles(url: string, cles: Readonly<Record<CleTemoin, Buffer>>,
  options: OptionsPool = {}): Promise<IssueTemoin> {
  const attendus = new Map(CLES_TEMOINS.map((nom) => [nom, temoinDeCle(cles[nom], nom)]));
  // Le propriétaire se connecte de la même façon dans les deux modes (connexion.ts) : le mode passé ne change rien.
  const pool = creerPoolModule(url, 'proprietaire', 'roles', { ...options, max: 1 });
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [VERROU_TEMOIN]);
      const r = await client.query<{ cle: CleTemoin; empreinte: string }>('SELECT cle, empreinte FROM temoin_cle');
      const ranges = new Map(r.rows.map((l) => [l.cle, l.empreinte]));
      const changees = CLES_TEMOINS.filter((nom) => ranges.has(nom) && ranges.get(nom) !== attendus.get(nom));
      if (changees.length > 0) throw new ClesChangees(changees);
      const manquants = CLES_TEMOINS.filter((nom) => !ranges.has(nom));
      for (const nom of manquants) {
        await client.query('INSERT INTO temoin_cle (cle, empreinte) VALUES ($1, $2) ON CONFLICT (cle) DO NOTHING',
          [nom, attendus.get(nom)]);
      }
      await client.query('COMMIT');
      return manquants.length > 0 ? 'enregistre' : 'conforme';
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}
