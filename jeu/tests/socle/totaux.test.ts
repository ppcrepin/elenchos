// Les totaux après la relecture de Juridique (16 octobre 2026) et D-066 :
// - point 3 : un joueur qui refuse qu'on compte ses gestes n'entre dans aucun total, tant que dure son refus ;
// - point 4 : le seuil d'un total des mesures compte des joueurs distincts (« un joueur qui apporte 30 fois ne
//   débloque rien ») ; une période close ne reçoit plus rien ;
// - point 2 : pendant le test, ni la part de « aucune » ni les trois comptes de mi-bêta ne sont écrits (réglage du
//   serveur, src/base/totaux.ts) ;
// - la lecture du dimanche : une seule ligne par joueur, remplacée chaque dimanche (Juridique, correction 7).
// Et les listes fermées de la base suivent celles du code. Joué dans les deux modes.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { enTransaction } from '../../src/base/connexion.ts';
import {
  ajouterCompteur, ajouterHistogramme, ajouterMesure, COMPTES_DE_REGLAGE, compterReponse, SORTES_MESURE, SORTES_REGLAGE,
} from '../../src/base/totaux.ts';
import { SORTES_COMPTEUR, SORTES_COMPTEUR_SERVEUR } from '../../src/contrat.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { baseDeTest, commeJoueur, nouveauJoueur, peupler, toutCeQuIlVoit, type BaseDeTest, type Monde } from './aides.ts';

const code = (e: unknown) => (e && typeof e === 'object' && 'code' in e ? String(e.code) : String(e));
/** Une semaine de jeu qui n'est pas celle du monde inventé : du lundi 26 octobre au dimanche 1er novembre 2026. */
const DIMANCHE = '2026-11-01';
const MARDI = new Date('2026-10-27T10:00:00Z');

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`les totaux, mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let m: Monde;
    before(async () => {
      base = await baseDeTest(mode);
      m = await peupler(base);
    });
    after(async () => { await base?.fin(); });

    /** Tout ce que contiennent les tables de totaux (vu par l'administrateur). */
    const totaux = async () => {
      const lignes: Record<string, unknown[]> = {};
      for (const t of ['compte_aucune', 'compteur', 'histogramme_raison', 'total_mesure', 'apport_mesure']) {
        lignes[t] = (await base.admin.query(`SELECT * FROM ${t} ORDER BY 1, 2, 3`)).rows.map((l: object) => ({ ...l }));
      }
      return lignes;
    };
    /** Un geste de chaque sorte, au nom d'un joueur. */
    const gestes = (joueur: string) => commeJoueur(base, joueur, async (c) => {
      await c.query('SELECT compter_reponse($1, true)', ['T06']);
      await c.query("SELECT ajouter_compteur('revelation_ouverte', $1)", ['2026-10-27']);
      await c.query('SELECT ajouter_histogramme($1, 3::smallint)', [DIMANCHE]);
      await c.query("SELECT ajouter_mesure($1, 'justesse_hasard', 1, 4)", [DIMANCHE]);
    }, undefined, MARDI);

    test('D-066, point 3 : un joueur qui refuse qu’on compte ses gestes n’entre dans aucun total ; à son retrait, il y entre de nouveau', async () => {
      await commeJoueur(base, m.paul.id, (c) => c.query('INSERT INTO mesures_refusees (joueur_id) VALUES ($1) ON CONFLICT DO NOTHING', [m.paul.id]));
      const avant = await totaux();
      await gestes(m.paul.id);
      // Les compteurs du message, écrits par le module de l'envoi au nom du joueur de l'abonnement.
      await enTransaction(base.module('envoi'), { joueur: m.paul.id, instant: MARDI },
        (c) => c.query("SELECT ajouter_compteur('message_recu', $1)", ['2026-10-27']));
      assert.deepEqual(await totaux(), avant, 'rien de Paul');
      // Témoin : les mêmes gestes de Marie comptent.
      await gestes(m.marie.id);
      await enTransaction(base.module('envoi'), { joueur: m.marie.id, instant: MARDI },
        (c) => c.query("SELECT ajouter_compteur('message_recu', $1)", ['2026-10-27']));
      const marie = await totaux();
      assert.notDeepEqual(marie, avant);
      assert.equal(marie.apport_mesure?.length, (avant.apport_mesure?.length ?? 0) + 1);
      // Paul retire son refus : ses gestes comptent de nouveau.
      await commeJoueur(base, m.paul.id, (c) => c.query('DELETE FROM mesures_refusees WHERE joueur_id = $1', [m.paul.id]));
      await gestes(m.paul.id);
      assert.notDeepEqual(await totaux(), marie);
      // Le refus est à soi : Marie ne peut ni le lire ni le poser pour un autre.
      const vu = await toutCeQuIlVoit(base, 'jeu', ['mesures_refusees'], { joueur: m.marie.id });
      assert.deepEqual(vu.mesures_refusees, []);
      await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query('INSERT INTO mesures_refusees (joueur_id) VALUES ($1)', [m.ines.id])),
        (e) => code(e) === '42501');
    });

    test('D-066, point 4 : un joueur qui apporte 30 fois ne débloque rien ; dix joueurs distincts, oui', async () => {
      const apporter = (joueur: string, fois: number) => commeJoueur(base, joueur, async (c) => {
        for (let i = 0; i < fois; i += 1) await c.query("SELECT ajouter_mesure($1, 'justesse_cartes', 1, 1)", [DIMANCHE]);
      }, undefined, MARDI);
      // Seule la semaine du 1er novembre peut atteindre le seuil (le monde inventé n'a qu'un apport le 25 octobre).
      const lire = async () => ((await toutCeQuIlVoit(base, 'mesures', ['mesure_totaux'], {})).mesure_totaux as
        { sorte: string; numerateur: string; joueurs: number }[]).filter((l) => l.sorte === 'justesse_cartes');
      await apporter(m.hugo.id, 30);
      assert.deepEqual(await lire(), []);
      const brut = await base.admin.query<{ numerateur: string; joueurs: number }>(
        "SELECT numerateur::text, joueurs FROM total_mesure WHERE periode = $1 AND sorte = 'justesse_cartes'", [DIMANCHE]);
      assert.deepEqual(brut.rows.map((l) => ({ ...l })), [{ numerateur: '30', joueurs: 1 }]);
      // Neuf autres joueurs, un apport chacun : dix joueurs distincts, le seuil est atteint.
      const autres = [m.marie, m.paul, m.lea, m.ines];
      for (let i = 0; i < 5; i += 1) autres.push(await nouveauJoueur(base, `Dix-Q2-${i}`, 'Z'));
      for (const j of autres.slice(0, 8)) await apporter(j.id, 1);
      assert.deepEqual(await lire(), [], 'neuf joueurs : sous le seuil');
      await apporter(autres[8]?.id ?? '', 1);
      assert.deepEqual((await lire()).map((l) => [l.numerateur, l.joueurs]), [['39', 10]]);
      // Le verrou ne se lit par aucun module.
      for (const module of ['jeu', 'mesures', 'envoi', 'comptes'] as const) {
        const v = (await toutCeQuIlVoit(base, module, ['apport_mesure'], { joueur: m.hugo.id })).apport_mesure;
        assert.ok(v === 'refus' || (Array.isArray(v) && v.length === 0), module);
      }
    });

    test('une période close (18h son dernier jour) ne reçoit plus rien ; une mesure sans joueur déclaré est refusée (EL040)', async () => {
      const apport = (instant: string) => commeJoueur(base, m.lea.id,
        (c) => c.query("SELECT ajouter_mesure($1, 'mystere_nouveaux', 1, 1)", [DIMANCHE]), undefined, new Date(instant));
      const joueurs = async () => (await base.admin.query<{ joueurs: number }>(
        "SELECT joueurs FROM total_mesure WHERE periode = $1 AND sorte = 'mystere_nouveaux'", [DIMANCHE])).rows[0]?.joueurs;
      await apport('2026-11-01T16:59:59Z'); // dimanche 17:59:59 (heure d'hiver)
      assert.equal(await joueurs(), 1);
      await commeJoueur(base, m.ines.id, (c) => c.query("SELECT ajouter_mesure($1, 'mystere_nouveaux', 1, 1)", [DIMANCHE]),
        undefined, new Date('2026-11-01T17:00:00Z')); // dimanche 18:00:00 : la semaine est close
      assert.equal(await joueurs(), 1);
      await assert.rejects(enTransaction(base.module('jeu'), { instant: MARDI },
        (c) => c.query("SELECT ajouter_mesure($1, 'justesse_cartes', 1, 1)", [DIMANCHE])),
      (e) => code(e) === 'EL040' && !/[0-9a-f]{8}-/.test(String((e as Error).message)));
    });

    test('D-066, point 2 : pendant le test, la part de « aucune » et les trois comptes de mi-bêta ne sont pas écrits (réglage du serveur)', async () => {
      assert.equal(COMPTES_DE_REGLAGE, false);
      const avant = await totaux();
      const ecrits = await commeJoueur(base, m.marie.id, async (c) => {
        const r = [await compterReponse(c, 'T06', true)];
        for (const s of SORTES_REGLAGE) r.push(await ajouterMesure(c, DIMANCHE, s, 1, 1));
        return r;
      }, undefined, MARDI);
      assert.ok(ecrits.every((e) => e === false));
      assert.deepEqual(await totaux(), avant);
      // Les mesures de la bêta, les compteurs et l'histogramme, eux, s'écrivent.
      await commeJoueur(base, m.marie.id, async (c) => {
        assert.equal(await ajouterMesure(c, DIMANCHE, 'justesse_hasard', 1, 2), true);
        await ajouterCompteur(c, 'cercle_pendant_deviner', '2026-10-27');
        await ajouterHistogramme(c, DIMANCHE, 4);
      }, undefined, MARDI);
      assert.notDeepEqual(await totaux(), avant);
      // Témoin : le réglage ouvert (version publique), les deux s'écrivent.
      const temoin = await totaux();
      await commeJoueur(base, m.lea.id, async (c) => {
        assert.equal(await compterReponse(c, 'T06', false, true), true);
        assert.equal(await ajouterMesure(c, DIMANCHE, 'pas_de_cote', 1, 1, true), true);
      }, undefined, MARDI);
      const apres = await totaux();
      assert.notDeepEqual(apres.compte_aucune, temoin.compte_aucune);
      assert.ok((apres.total_mesure as { sorte: string }[]).some((l) => l.sorte === 'pas_de_cote'));
    });

    test('la lecture du dimanche : une seule ligne par joueur, remplacée chaque dimanche', async () => {
      await commeJoueur(base, m.marie.id, (c) => c.query(
        `INSERT INTO portrait_dimanche (joueur_id, jour, nettes) VALUES ($1, $2, 5)
         ON CONFLICT (joueur_id) DO UPDATE SET jour = EXCLUDED.jour, nettes = EXCLUDED.nettes`, [m.marie.id, DIMANCHE]));
      const r = await base.admin.query('SELECT jour::text, nettes FROM portrait_dimanche WHERE joueur_id = $1', [m.marie.id]);
      assert.deepEqual(r.rows.map((l: object) => ({ ...l })), [{ jour: DIMANCHE, nettes: 5 }]);
      // Une seconde ligne pour le même joueur est impossible (la base n'a pas d'historique à garder).
      await assert.rejects(base.admin.query("INSERT INTO portrait_dimanche (joueur_id, jour, nettes) VALUES ($1, '2026-11-08', 1)", [m.marie.id]),
        (e) => code(e) === '23505');
    });
  });
}

describe('les listes fermées de la base suivent celles du code', () => {
  let base: BaseDeTest;
  before(async () => { base = await baseDeTest('roles'); });
  after(async () => { await base?.fin(); });

  const valeursDuControle = async (table: string, colonne: string) => {
    const r = await base.admin.query<{ d: string }>(
      `SELECT pg_get_constraintdef(c.oid) AS d FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = $1 AND t.relname = $2 AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE $3`,
      [base.schema, table, `%${colonne}%`]);
    assert.equal(r.rowCount, 1, `${table}.${colonne}`);
    return [...(r.rows[0]?.d ?? '').matchAll(/'([a-z0-9_]+)'::text/g)].map((x) => x[1]).sort();
  };

  test('les compteurs : SORTES_COMPTEUR et SORTES_COMPTEUR_SERVEUR du contrat', async () => {
    assert.deepEqual(await valeursDuControle('compteur', 'sorte'), [...SORTES_COMPTEUR, ...SORTES_COMPTEUR_SERVEUR].sort());
  });

  test('les totaux des mesures et leur verrou : SORTES_MESURE et SORTES_REGLAGE de totaux.ts', async () => {
    const attendues = [...SORTES_MESURE, ...SORTES_REGLAGE].sort();
    assert.deepEqual(await valeursDuControle('total_mesure', 'sorte'), attendues);
    assert.deepEqual(await valeursDuControle('apport_mesure', 'sorte'), attendues);
  });
});
