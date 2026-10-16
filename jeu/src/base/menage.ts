// Le ménage quotidien (P-31) : il tient chaque durée de la carte des données (carte.ts) en effaçant ce qui est échu.
// Juridique l'exige avant la première vraie invitation (relecture du schéma, 16 octobre 2026, correction 1) : sans lui,
// aucune durée promise par « Qui, durée, droits » n'est tenue (art. 5.1.e). Il tourne sous le rôle du ménage, en une
// transaction, avec l'heure du serveur déclarée (`elenchos.instant`, comme toute transaction du jeu) ; le planificateur
// de l'étape 2 l'appellera chaque jour (P-31 : « un effacement quotidien »). Il peut être relancé : une seconde passe
// à la même heure n'efface rien de plus.
//
// Ce qu'il efface, et pourquoi (la durée de la carte entre parenthèses) :
// - les joueurs provisoires créés il y a 7 jours ou plus, comme « Tout effacer » (DECISIONS-TECHNIQUES, partie 3 ;
//   N6, N15 : « effacées au bout de 7 jours »), avec leur ligne au journal des effacements (P-32) ;
// - les liens échus jamais servis, et les liens de créateur échus (servis ou non) ; un lien d'invitation servi reste,
//   sans plus désigner personne s'il le faut (carte.ts, « invitation ») ;
// - les scores d'entrée, 7 jours après la liaison du lien (la base ne garde pas la date du compte, qui la suit de
//   peu) ;
// - les connexions en cours et les codes de retour échus ; les codes e-mail de plus de 24 heures ; les sessions
//   échues (avec leur abonnement au message) ;
// - « déjà vu » d'une révélation et la reprise de la révélation, au 18h qui suit la révélation ; la note « écran
//   Répondre affiché », à 18h10 le jour où le texte se ferme ;
// - les comptes de la semaine et par texte, au-delà de la semaine en cours et de la précédente ;
// - les envois du message de plus de 7 jours (les totaux du jour sont déjà comptés, D-066, point 4) ;
// - les verrous des joueurs distincts (apport_mesure) d'une période close.
//
// Ce qu'il ne fait pas : l'effacement après 12 mois d'inactivité (D-045, point 1 ; P-30) et la rotation du journal des
// effacements (P-32), sans objet pendant le test, où tout est effacé à la fin (D-061, point 2).

import type pg from 'pg';
import { partiesParis } from '../serveur/horloge.ts';
import type { Journal } from '../serveur/journal.ts';
import { effacerJoueurs } from './effacement.ts';

export type BilanMenage = {
  provisoires: number; liens: number; scores: number; connexions: number; codesRetour: number; codesEmail: number;
  sessions: number; revelationsVues: number; reprises: number; repondreOuvert: number; comptesSemaine: number;
  comptesTexte: number; envois: number; verrous: number;
};

/** Le dimanche qui clôt la semaine d'un jour de jeu, en SQL (règle 12 : « semaine » = le dimanche qui la clôt). */
const DIMANCHE = (d: string) => `(${d} + ((7 - extract(isodow FROM ${d})::int) % 7))`;

/** Les effacements d'échéance, chacun une requête sans valeur venue de l'extérieur : l'heure est celle déclarée. */
const ECHEANCES: [Exclude<keyof BilanMenage, 'provisoires'>, string][] = [
  ['liens', `DELETE FROM invitation WHERE expire_le <= instant_du_jeu() AND (lie_le IS NULL OR sorte = 'createur')`],
  ['scores', `UPDATE invitation SET score_entree = NULL
               WHERE score_entree IS NOT NULL AND lie_le <= instant_du_jeu() - interval '7 days'`],
  ['connexions', 'DELETE FROM connexion_en_cours WHERE expire_le <= instant_du_jeu()'],
  ['codesRetour', 'DELETE FROM code_retour WHERE expire_le <= instant_du_jeu()'],
  ['codesEmail', `DELETE FROM code_email WHERE cree_le <= instant_du_jeu() - interval '24 hours'`],
  ['sessions', 'DELETE FROM session WHERE expire_le <= instant_du_jeu()'],
  // `jour` est le jour de jeu de la manche révélée : révélée à 18h à sa fin, gardée jusqu'au 18h suivant.
  ['revelationsVues', `DELETE FROM vu WHERE objet = 'revelation' AND fin_du_jour_de_jeu(jour + 1) <= instant_du_jeu()`],
  ['reprises', 'DELETE FROM reprise_revelation WHERE fin_du_jour_de_jeu(jour + 1) <= instant_du_jeu()'],
  ['repondreOuvert', `DELETE FROM repondre_ouvert r USING calendrier c
                       WHERE c.texte_id = r.texte_id AND fin_du_jour_de_jeu(c.jour) + interval '10 minutes' <= instant_du_jeu()`],
  // Gardés : la semaine en cours et la précédente. Une ligne part quand la semaine qui suit la sienne est finie.
  ['comptesSemaine', 'DELETE FROM compte_semaine WHERE fin_du_jour_de_jeu(semaine + 7) <= instant_du_jeu()'],
  ['comptesTexte', `DELETE FROM compte_texte_cercle t USING calendrier c
                     WHERE c.texte_id = t.texte_id AND fin_du_jour_de_jeu(${DIMANCHE('(c.jour + 1)')} + 7) <= instant_du_jeu()`],
  ['envois', `DELETE FROM envoi WHERE envoye_a <= instant_du_jeu() - interval '7 days'`],
  ['verrous', 'DELETE FROM apport_mesure WHERE fin_du_jour_de_jeu(periode) <= instant_du_jeu()'],
];

/** Une passe du ménage. `pool` : le module du ménage. `instant` : l'heure de l'horloge du serveur (horloge.ts). */
export async function passerLeMenage(pool: pg.Pool, instant: Date, journal?: Journal): Promise<BilanMenage> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('elenchos.instant', $1, true)", [instant.toISOString()]);
    const echus = await client.query<{ id: string }>(
      `SELECT id FROM joueur WHERE etat = 'provisoire' AND cree_le <= instant_du_jeu() - interval '7 days'`);
    const { effaces } = await effacerJoueurs(client, echus.rows.map((l) => l.id), partiesParis(instant).dateISO);
    const bilan = { provisoires: effaces.length } as BilanMenage;
    for (const [cle, sql] of ECHEANCES) bilan[cle] = (await client.query(sql)).rowCount ?? 0;
    await client.query('COMMIT');
    journal?.ecrire({ evenement: 'menage', detail: 'provisoire efface', nombre: bilan.provisoires });
    journal?.ecrire({
      evenement: 'menage', detail: 'echeances effacees',
      nombre: ECHEANCES.reduce((n, [cle]) => n + bilan[cle], 0),
    });
    return bilan;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
