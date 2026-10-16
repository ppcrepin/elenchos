// Le ménage quotidien (P-31) : il tient chaque durée de la carte des données (carte.ts) en effaçant ce qui est échu.
// Juridique l'exige avant la première vraie invitation (relecture du schéma, 16 octobre 2026, correction 1) : sans lui,
// aucune durée promise par « Qui, durée, droits » n'est tenue (art. 5.1.e). Il tourne sous le rôle du ménage, en une
// transaction, avec l'heure du serveur déclarée (`elenchos.instant`, comme toute transaction du jeu). Le planificateur
// (src/serveur/planificateur.ts, étape 1, travail D) l'appelle chaque jour à 4 h, heure de Paris, ou dès que possible
// avant 17 h 30 s'il était arrêté, jamais entre 17 h 30 et 18 h 30 (P-31, proposé), par `menageDuJour` : une ligne de
// `tache_du_jour` (migration 0004), prise au début de la transaction, fait qu'il ne tourne jamais deux fois en même
// temps, ni deux fois le même jour. Il peut aussi être relancé à la main : une seconde passe à la même heure n'efface
// rien de plus.
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
// - les comptes de la semaine, au-delà de la semaine en cours et de la précédente ; les comptes d'attributions par
//   texte, au lundi 18h qui suit leur semaine, quand la surprise de la semaine est figée dans les titres (Juridique ;
//   arbitrage de l'équipe du 16 octobre 2026) ;
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
  // Gardés jusqu'au lundi 18h qui suit la semaine où le texte se devine (calendrier.jour + 1) : le dimanche 18h, les
  // titres et la surprise de la semaine tombent, et s'écrivent à leur première lecture (R6). Le calcul des titres doit
  // donc se faire avant le lundi 18h, même si personne n'ouvre le jeu : à garantir par le serveur de l'étape 2.
  ['comptesTexte', `DELETE FROM compte_texte_cercle t USING calendrier c
                     WHERE c.texte_id = t.texte_id AND fin_du_jour_de_jeu(${DIMANCHE('(c.jour + 1)')} + 1) <= instant_du_jeu()`],
  ['envois', `DELETE FROM envoi WHERE envoye_a <= instant_du_jeu() - interval '7 days'`],
  ['verrous', 'DELETE FROM apport_mesure WHERE fin_du_jour_de_jeu(periode) <= instant_du_jeu()'],
];

/** Le travail d'une passe, dans une transaction déjà ouverte, l'instant déjà déclaré. */
async function passe(client: pg.ClientBase, instant: Date): Promise<BilanMenage> {
  const echus = await client.query<{ id: string }>(
    `SELECT id FROM joueur WHERE etat = 'provisoire' AND cree_le <= instant_du_jeu() - interval '7 days'`);
  const { effaces } = await effacerJoueurs(client, echus.rows.map((l) => l.id), partiesParis(instant).dateISO);
  const bilan = { provisoires: effaces.length } as BilanMenage;
  for (const [cle, sql] of ECHEANCES) bilan[cle] = (await client.query(sql)).rowCount ?? 0;
  return bilan;
}

function journaliser(bilan: BilanMenage, journal?: Journal): void {
  journal?.ecrire({ evenement: 'menage', detail: 'provisoire efface', nombre: bilan.provisoires });
  journal?.ecrire({
    evenement: 'menage', detail: 'echeances effacees',
    nombre: ECHEANCES.reduce((n, [cle]) => n + bilan[cle], 0),
  });
}

/** Une transaction du module du ménage, l'instant déclaré. */
async function enTransactionMenage<T>(pool: pg.Pool, instant: Date, travail: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('elenchos.instant', $1, true)", [instant.toISOString()]);
    const r = await travail(client);
    await client.query('COMMIT');
    return r;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

/** Une passe du ménage. `pool` : le module du ménage. `instant` : l'heure de l'horloge du serveur (horloge.ts). */
export async function passerLeMenage(pool: pg.Pool, instant: Date, journal?: Journal): Promise<BilanMenage> {
  const bilan = await enTransactionMenage(pool, instant, (c) => passe(c, instant));
  journaliser(bilan, journal);
  return bilan;
}

/** Le ménage du jour `jour` (« AAAA-MM-JJ », jour civil à Paris), une fois : la ligne de `tache_du_jour` est prise au
 *  début de la transaction. Un second appel le même jour, d'ici ou d'un autre serveur, attend que le premier finisse,
 *  puis rend null sans rien faire ; si le premier a échoué, sa ligne est partie avec lui, et le second fait le ménage.
 *  Les lignes de plus de 7 jours partent au passage. */
export async function menageDuJour(pool: pg.Pool, instant: Date, jour: string, journal?: Journal): Promise<BilanMenage | null> {
  const bilan = await enTransactionMenage(pool, instant, async (c) => {
    const pris = await c.query(
      "INSERT INTO tache_du_jour (tache, jour) VALUES ('menage', $1) ON CONFLICT (tache, jour) DO NOTHING RETURNING jour", [jour]);
    if (pris.rowCount !== 1) return null;
    const b = await passe(c, instant);
    await c.query("DELETE FROM tache_du_jour WHERE jour < $1::date - 7", [jour]);
    return b;
  });
  if (bilan === null) journal?.ecrire({ evenement: 'menage', detail: 'menage deja passe' });
  else journaliser(bilan, journal);
  return bilan;
}
