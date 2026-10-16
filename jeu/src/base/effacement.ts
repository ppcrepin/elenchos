// « Tout effacer » (P-33, P-38) : un effacement immédiat, en une transaction, sous le rôle du ménage. Le ménage
// quotidien efface de la même façon les joueurs provisoires à 7 jours (menage.ts).
// Le principe vient de test-18h/outils/effacer.ts : effacer, puis vérifier qu'il ne reste rien.
//
// Effacer la ligne du joueur suffit, ou presque : les clés étrangères emportent tout ce qui porte son identifiant
// (identités, sessions, accords, réponses, abonnements et envois, places dans les cercles, manches, cartes dont il est
// l'auteur, compteurs, tempéraments, lecture du dimanche, « vu », refus des mesures, verrous des totaux). Une seule
// chose ne porte pas son identifiant et s'efface d'abord : le score de son défi d'entrée, gardé sur le lien qui l'avait
// fait entrer (CONTRAT.md, 2.12 : « ses réponses et son score sont effacés » ; P-38). Le départ de chacune de ses
// places fait le reste (déclencheur membre_avant_depart, migration 0002) :
// - ses badges Le Pas de Côté s'effacent (D-066, point 1) ; ses autres titres passés restent, sous « un ancien
//   membre » (D-045, point 2) : la clé du titulaire devient vide ;
// - une carte où un proche avait posé son visage redevient vide (règle 4) : avant 18h, avec la marque « vidée par un
//   départ » et sans verdict ; après 18h, la manche est jouée, seul le visage se vide, et un « jumeau » devient
//   « juste » ;
// - le lien qui l'avait fait entrer reste « servi », sans plus le désigner ni porter son score : il ne s'ouvre pas à
//   un autre (P-29), et l'invitant voit toujours le même nombre de liens envoyés (CONTRAT.md, 2.12).
// Restent aussi : les totaux déjà anonymes (P-23) ; l'identifiant tiré au hasard, au journal des effacements (P-32),
// pour rejouer l'effacement après une restauration.
// Un cercle resté sans membre est effacé avec son histoire (carte des données, « Titres passés »).
// Aucun message au cercle (D-045).
//
// Ce que ce module ne fait pas encore (moteur de la journée, étape 2) : retirer des compteurs de la semaine une carte
// de l'effacé servie mais pas encore révélée (règle 4, « elle ne compte ni juste ni fausse »).

import type pg from 'pg';
import { partiesParis } from '../serveur/horloge.ts';
import { CARTE, TABLES_SANS_JOUEUR } from './carte.ts';

export type BilanEffacement = { joueurEfface: boolean; cerclesEffaces: number };

/** Efface des joueurs dans une transaction déjà ouverte, sous le module du ménage, l'instant déjà déclaré
 *  (`elenchos.instant`). `jour` : la date du journal des effacements. Rend les joueurs effacés et le nombre de cercles
 *  restés vides, effacés avec eux. */
export async function effacerJoueurs(client: pg.ClientBase, joueurs: string[], jour: string): Promise<{ effaces: string[]; cerclesEffaces: number }> {
  if (joueurs.length === 0) return { effaces: [], cerclesEffaces: 0 };
  const cercles = await client.query<{ cercle_id: string }>(
    'SELECT DISTINCT cercle_id FROM membre WHERE joueur_id = ANY ($1::uuid[])', [joueurs]);
  await client.query('UPDATE invitation SET score_entree = NULL WHERE invite_joueur_id = ANY ($1::uuid[]) AND score_entree IS NOT NULL',
    [joueurs]);
  const effaces = (await client.query<{ id: string }>('DELETE FROM joueur WHERE id = ANY ($1::uuid[]) RETURNING id', [joueurs]))
    .rows.map((l) => l.id);
  const vides = await client.query(
    `DELETE FROM cercle c WHERE c.id = ANY ($1::uuid[]) AND NOT EXISTS (SELECT 1 FROM membre m WHERE m.cercle_id = c.id)`,
    [cercles.rows.map((l) => l.cercle_id)]);
  if (effaces.length > 0) {
    await client.query(
      'INSERT INTO effacement (joueur_id, efface_le) SELECT j, $2 FROM unnest($1::uuid[]) AS j ON CONFLICT (joueur_id) DO NOTHING',
      [effaces, jour]);
  }
  return { effaces, cerclesEffaces: vides.rowCount ?? 0 };
}

/** `pool` : le module du ménage. `instant` : l'heure de l'horloge du serveur (horloge.ts) ; elle dit à la base si les
 *  manches du jour sont encore ouvertes (avant 18h), et donne la date du journal des effacements. */
export async function toutEffacer(pool: pg.Pool, joueur: string, instant: Date): Promise<BilanEffacement> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('elenchos.instant', $1, true)", [instant.toISOString()]);
    const r = await effacerJoueurs(client, [joueur], partiesParis(instant).dateISO);
    await client.query('COMMIT');
    return { joueurEfface: r.effaces.length === 1, cerclesEffaces: r.cerclesEffaces };
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

/** Les colonnes de la carte qui désignent un joueur (forme « reference » nommée joueur_id ou invite_joueur_id). */
const COLONNES_JOUEUR: [string, string][] = Object.entries(CARTE)
  .filter(([table]) => !TABLES_SANS_JOUEUR.includes(table) && table !== 'effacement')
  .flatMap(([table, t]) => Object.keys(t.colonnes)
    .filter((c) => c === 'joueur_id' || c === 'invite_joueur_id' || (table === 'joueur' && c === 'id'))
    .map((c): [string, string] => [table, c]));

/** Vérifie qu'aucune ligne ne désigne encore ce joueur. Rend les tables où il en reste (vide : rien ne reste).
 *  `pool` : le module du ménage, qui voit tout. */
export async function restesDuJoueur(pool: pg.Pool, joueur: string): Promise<string[]> {
  const restes: string[] = [];
  for (const [table, colonne] of COLONNES_JOUEUR) {
    const r = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM "${table}" WHERE "${colonne}" = $1`, [joueur]);
    if (Number(r.rows[0]?.n ?? '1') !== 0) restes.push(table);
  }
  return restes;
}
