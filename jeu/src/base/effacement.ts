// « Tout effacer » (P-33, P-38) : un effacement immédiat, en une transaction, sous le rôle du ménage.
// Le principe vient de test-18h/outils/effacer.ts : effacer, puis vérifier qu'il ne reste rien.
//
// Effacer la ligne du joueur suffit : les clés étrangères emportent tout ce qui porte son identifiant (identités,
// sessions, accords, réponses, abonnements et envois, places dans les cercles, manches, cartes dont il est l'auteur,
// compteurs, tempéraments, lectures du dimanche, « vu »). Ce qui reste, voulu :
// - ses titres passés, sous « un ancien membre » (D-045, point 2) : la clé du titulaire devient vide ;
// - une carte où un proche avait posé son visage redevient vide (règle 4) ;
// - le lien qui l'avait fait entrer reste « servi », sans plus le désigner : il ne s'ouvre pas à un autre (P-29), et
//   l'invitant voit toujours le même nombre de liens envoyés (CONTRAT.md, 2.12) ;
// - les totaux déjà anonymes (P-23) ;
// - l'identifiant tiré au hasard, au journal des effacements (P-32), pour rejouer l'effacement après une restauration.
// Un cercle resté sans membre est effacé avec son histoire (carte des données, « Titres passés »).
// Aucun message au cercle (D-045).
//
// Ce que ce module ne fait pas encore (moteur de la journée, étape 2) : retirer des compteurs de la semaine une carte
// de l'effacé servie mais pas encore révélée (règle 4, « elle ne compte ni juste ni fausse »).

import type pg from 'pg';
import { CARTE, TABLES_SANS_JOUEUR } from './carte.ts';

export type BilanEffacement = { joueurEfface: boolean; cerclesEffaces: number };

/** `pool` : le module du ménage. `jour` : la date civile du jour, à Paris (horloge.ts). */
export async function toutEffacer(pool: pg.Pool, joueur: string, jour: string): Promise<BilanEffacement> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cercles = await client.query<{ cercle_id: string }>('SELECT cercle_id FROM membre WHERE joueur_id = $1', [joueur]);
    const efface = await client.query('DELETE FROM joueur WHERE id = $1', [joueur]);
    const vides = await client.query(
      `DELETE FROM cercle c WHERE c.id = ANY ($1::uuid[]) AND NOT EXISTS (SELECT 1 FROM membre m WHERE m.cercle_id = c.id)`,
      [cercles.rows.map((l) => l.cercle_id)]);
    if (efface.rowCount === 1) {
      await client.query('INSERT INTO effacement (joueur_id, efface_le) VALUES ($1, $2) ON CONFLICT (joueur_id) DO NOTHING',
        [joueur, jour]);
    }
    await client.query('COMMIT');
    return { joueurEfface: efface.rowCount === 1, cerclesEffaces: vides.rowCount ?? 0 };
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
