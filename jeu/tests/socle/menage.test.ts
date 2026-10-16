// P-31 : le ménage quotidien tient chaque durée de la carte des données (src/base/menage.ts ; Juridique, relecture du
// schéma, correction 1, bloquante avant la première vraie invitation). Une passe le jeudi 22 octobre 2026 à midi :
// pour chaque sorte d'échéance, une ligne échue part et une ligne voisine, pas encore échue, reste. Le joueur
// provisoire de plus de 7 jours est effacé comme par « Tout effacer », avec sa ligne au journal des effacements.
// Une seconde passe n'efface rien de plus. Rien d'autre ne bouge. Joué dans les deux modes.

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { passerLeMenage, type BilanMenage } from '../../src/base/menage.ts';
import { restesDuJoueur } from '../../src/base/effacement.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import type { Ligne } from '../../src/serveur/journal.ts';
import {
  baseDeTest, commeJoueur, empreinteDe, inviter, peupler, repondre, type BaseDeTest, type Invitation, type Monde,
} from './aides.ts';

const T = new Date('2026-10-22T10:00:00Z'); // jeudi 22 octobre 2026, midi à Paris
const avant = (ms: number) => new Date(T.getTime() - ms).toISOString();
const MINUTE = 60_000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`le ménage, mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let m: Monde;
    let zoe: string;
    let yann: string;
    let invZoe: Invitation;
    let invGardee: Invitation;
    const ids = {
      createurServi: randomUUID(), createurValable: randomUUID(), connexionValable: randomUUID(), codeValable: randomUUID(),
    };
    let comptes: Record<string, number>;
    const compter = async () => {
      const sortie: Record<string, number> = {};
      for (const t of ['joueur', 'membre', 'reponse', 'manche', 'carte', 'titre', 'cercle', 'temperament', 'identite', 'consentement']) {
        sortie[t] = Number((await base.admin.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${t}`)).rows[0]?.n);
      }
      return sortie;
    };
    const existe = async (sql: string, valeurs: unknown[] = []) => ((await base.admin.query(sql, valeurs)).rowCount ?? 0) > 0;

    before(async () => {
      base = await baseDeTest(mode);
      m = await peupler(base);
      const proprietaire = base.module('proprietaire');
      const a = base.admin;

      // Deux joueurs provisoires : Zoé, créée il y a 7 jours et une minute, liée à un lien de Léa avec son score ;
      // Yann, créé il y a 6 jours.
      zoe = randomUUID();
      yann = randomUUID();
      invZoe = await inviter(base, m.b, m.lea);
      for (const [id, jeton] of [[zoe, invZoe.jeton], [yann, undefined]] as const) {
        const consentement = randomUUID();
        await commeJoueur(base, id, async (c) => {
          await c.query("INSERT INTO joueur (id, etat, cree_le) VALUES ($1, 'provisoire', now())", [id]);
          await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), true)',
            [consentement, id]);
          await repondre(c, { ...m.lea, id, consentement }, 'T01', { position: 2, raison: 1 }, 'entree');
          if (jeton) {
            await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now(), score_entree = 2 WHERE empreinte_jeton = $2',
              [id, jeton]);
          }
        }, jeton);
      }
      await a.query('UPDATE joueur SET cree_le = $2 WHERE id = $1', [zoe, avant(7 * JOUR + MINUTE)]);
      await a.query('UPDATE joueur SET cree_le = $2 WHERE id = $1', [yann, avant(6 * JOUR)]);
      await a.query('UPDATE invitation SET lie_le = $2 WHERE id = $1', [invZoe.id, avant(7 * JOUR + MINUTE)]);

      // Les liens : un lien jamais servi, échu ; un autre, encore valable ; un lien servi échu (il reste) ; deux liens
      // de créateur, l'un servi et échu, l'autre encore valable.
      await a.query('UPDATE invitation SET expire_le = $2 WHERE id = $1', [m.invitations.invEnAttenteB.id, avant(HEURE)]);
      invGardee = await inviter(base, m.b, m.lea);
      await a.query('UPDATE invitation SET expire_le = $2 WHERE id = $1', [invGardee.id, avant(-JOUR)]);
      await a.query('UPDATE invitation SET expire_le = $2 WHERE id = $1', [m.invitations.invPaul.id, avant(JOUR)]);
      await proprietaire.query(
        "INSERT INTO invitation (id, sorte, empreinte_jeton, expire_le) VALUES ($1, 'createur', $2, $3), ($4, 'createur', $5, $6)",
        [ids.createurServi, randomBytes(32).toString('hex'), avant(HEURE), ids.createurValable, randomBytes(32).toString('hex'), avant(-JOUR)]);
      await a.query('UPDATE invitation SET invite_joueur_id = $2, lie_le = $3 WHERE id = $1', [ids.createurServi, m.marie.id, avant(2 * JOUR)]);
      // Les scores d'entrée : lié il y a 8 jours (effacé), et hier (gardé).
      await a.query('UPDATE invitation SET score_entree = 2, lie_le = $2 WHERE id = $1', [m.invitations.invHugoA.id, avant(8 * JOUR)]);
      await a.query('UPDATE invitation SET score_entree = 3, lie_le = $2 WHERE id = $1', [m.invitations.invHugoB.id, avant(JOUR)]);

      // Connexions en cours, codes de retour, codes e-mail.
      await a.query('UPDATE connexion_en_cours SET expire_le = $2 WHERE id = $1', [m.connexion.id, avant(1000)]);
      await a.query(`INSERT INTO connexion_en_cours (id, voie, but, nonce, defi, expire_le)
        VALUES ($1, 'apple', 'creation', 'nonce-valable-0123456789', $2, $3)`, [ids.connexionValable, 'd'.repeat(43), avant(-5 * MINUTE)]);
      await a.query('UPDATE code_retour SET expire_le = $1', [avant(1000)]);
      await a.query('UPDATE code_email SET cree_le = $1, expire_le = $2', [avant(25 * HEURE), avant(25 * HEURE - 15 * MINUTE)]);
      await a.query(`INSERT INTO code_email (id, empreinte_adresse, empreinte_code, cree_le, expire_le) VALUES ($1, $2, $3, $4, $5)`,
        [ids.codeValable, empreinteDe('valable@exemple.invalid'), empreinteDe('code-654321'), avant(HEURE), avant(HEURE - 15 * MINUTE)]);

      // Les sessions : celle de Léa est échue (son abonnement et son envoi partent avec elle) ; les autres valent 30 jours.
      await a.query('UPDATE session SET expire_le = $1', [avant(-30 * JOUR)]);
      await a.query('UPDATE session SET expire_le = $2 WHERE id = $1', [m.lea.sessionId, avant(MINUTE)]);

      // « Déjà vu » et reprise de la révélation : la révélation du mardi (vue jusqu'au mercredi 18h) part, celle du
      // mercredi (vue jusqu'au jeudi 18h) reste.
      await a.query(`INSERT INTO vu (joueur_id, objet, jour) VALUES ($1, 'revelation', '2026-10-20'), ($1, 'revelation', '2026-10-21')`,
        [m.marie.id]);
      await a.query(`INSERT INTO reprise_revelation (joueur_id, jour, etape) VALUES ($1, '2026-10-21', 'etape-gardee')`, [m.lea.id]);

      // « Écran Répondre affiché » : T06 (fermé mercredi 18h, 18h10 passé) part ; T12 (se ferme jeudi 18h) reste.
      // Les comptes par texte : T10 (deviné le mardi 6 octobre, deux semaines plus tôt) part ; T11 (deviné le mardi
      // 13, semaine précédente) et T04 (deviné le mardi 20, semaine en cours) restent.
      for (const [id, jour] of [['T10', '2026-10-05'], ['T11', '2026-10-12'], ['T12', '2026-10-22']]) {
        await proprietaire.query("INSERT INTO texte (id, role, tension, sens, contenu, empreinte) VALUES ($1, 'jour', 'L', 1, '{}', $2)",
          [id, 'e'.repeat(64)]);
        await proprietaire.query('INSERT INTO calendrier (jour, texte_id) VALUES ($1, $2)', [jour, id]);
      }
      await a.query('UPDATE repondre_ouvert SET ouvert_le = $1', [avant(JOUR)]);
      await a.query("INSERT INTO repondre_ouvert (joueur_id, texte_id, ouvert_le) VALUES ($1, 'T12', $2)", [m.marie.id, avant(HEURE)]);
      await a.query(`INSERT INTO compte_texte_cercle (cercle_id, texte_id, attributions, fausses) VALUES ($1, 'T10', 4, 1), ($1, 'T11', 4, 2)`,
        [m.a.id]);
      // Les comptes de la semaine : semaine du 11 octobre (part), du 18 (précédente) et du 25 (en cours, déjà là).
      await a.query(`INSERT INTO compte_semaine (cercle_id, membre_id, semaine, points) VALUES ($1, $2, '2026-10-11', 3), ($1, $2, '2026-10-18', 2)`,
        [m.a.id, m.a.membres.get(m.marie.id)]);

      // Les envois : celui de Marie a 8 jours ; les autres, un jour.
      await a.query('UPDATE envoi SET envoye_a = $1', [avant(JOUR)]);
      await a.query('UPDATE envoi SET envoye_a = $2 WHERE id = $1', [m.envois[m.marie.pseudo], avant(8 * JOUR)]);

      // Les verrous des joueurs distincts : la semaine du 18 octobre est close (dimanche 18h passé) ; celle du 25, non.
      await a.query("INSERT INTO apport_mesure (joueur_id, periode, sorte) VALUES ($1, '2026-10-18', 'justesse_cartes')", [m.paul.id]);

      comptes = await compter();
    });
    after(async () => { await base?.fin(); });

    test('une passe : chaque échéance part, rien d’autre', async () => {
      const lignes: Ligne[] = [];
      const bilan = await passerLeMenage(base.module('menage'), T, { ecrire: (l) => { lignes.push(l); } });
      const attendu: BilanMenage = {
        provisoires: 1, liens: 2, scores: 1, connexions: 1, codesRetour: 1, codesEmail: 1, sessions: 1, revelationsVues: 1,
        reprises: 1, repondreOuvert: 1, comptesSemaine: 1, comptesTexte: 1, envois: 1, verrous: 1,
      };
      assert.deepEqual(bilan, attendu);
      assert.deepEqual(lignes, [
        { evenement: 'menage', detail: 'provisoire efface', nombre: 1 },
        { evenement: 'menage', detail: 'echeances effacees', nombre: 14 },
      ]);
      // Zoé seule est partie, avec sa réponse et son accord : rien d'autre n'a bougé.
      const apres = await compter();
      const moins = (t: string) => (comptes[t] ?? 0) - 1;
      assert.deepEqual(apres, { ...comptes, joueur: moins('joueur'), reponse: moins('reponse'), consentement: moins('consentement') });
    });

    test('le joueur provisoire de plus de 7 jours est effacé comme par « Tout effacer », avec sa ligne au journal ; celui de 6 jours reste', async () => {
      assert.deepEqual(await restesDuJoueur(base.module('menage'), zoe), []);
      const journal = await base.admin.query('SELECT efface_le::text AS d FROM effacement WHERE joueur_id = $1', [zoe]);
      assert.deepEqual(journal.rows.map((l: object) => ({ ...l })), [{ d: '2026-10-22' }]);
      assert.ok(await existe('SELECT 1 FROM joueur WHERE id = $1', [yann]));
      // Son lien reste servi, sans plus la désigner ni porter son score (P-29).
      const lien = await base.admin.query('SELECT invite_joueur_id, lie_le IS NOT NULL AS servi, score_entree FROM invitation WHERE id = $1', [invZoe.id]);
      assert.deepEqual({ ...lien.rows[0] }, { invite_joueur_id: null, servi: true, score_entree: null });
    });

    test('les liens, les scores, les codes, les connexions et les sessions : l’échu part, le valable reste', async () => {
      assert.ok(!await existe('SELECT 1 FROM invitation WHERE id = $1', [m.invitations.invEnAttenteB.id]), 'lien jamais servi, échu');
      assert.ok(await existe('SELECT 1 FROM invitation WHERE id = $1', [invGardee.id]), 'lien encore valable');
      assert.ok(await existe('SELECT 1 FROM invitation WHERE id = $1', [m.invitations.invPaul.id]), 'lien servi, échu : il reste');
      assert.ok(!await existe('SELECT 1 FROM invitation WHERE id = $1', [ids.createurServi]), 'lien de créateur échu');
      assert.ok(await existe('SELECT 1 FROM invitation WHERE id = $1', [ids.createurValable]), 'lien de créateur valable');
      const score = async (id: string) => (await base.admin.query<{ s: number | null }>('SELECT score_entree AS s FROM invitation WHERE id = $1', [id])).rows[0]?.s;
      assert.equal(await score(m.invitations.invHugoA.id), null);
      assert.equal(await score(m.invitations.invHugoB.id), 3);
      assert.ok(!await existe('SELECT 1 FROM connexion_en_cours WHERE id = $1', [m.connexion.id]));
      assert.ok(await existe('SELECT 1 FROM connexion_en_cours WHERE id = $1', [ids.connexionValable]));
      assert.ok(!await existe('SELECT 1 FROM code_retour'));
      assert.deepEqual((await base.admin.query<{ id: string }>('SELECT id FROM code_email')).rows.map((l) => l.id), [ids.codeValable]);
      assert.ok(!await existe('SELECT 1 FROM session WHERE id = $1', [m.lea.sessionId]));
      assert.ok(!await existe('SELECT 1 FROM abonnement WHERE id = $1', [m.lea.abonnement]));
      assert.equal(Number((await base.admin.query<{ n: string }>('SELECT count(*)::text AS n FROM session')).rows[0]?.n), 4);
    });

    test('« déjà vu », reprise, écran Répondre, comptes, envois, verrous : l’échu part, le reste reste', async () => {
      const lignes = async (sql: string, valeurs: unknown[] = []) => (await base.admin.query(sql, valeurs)).rows.map((l: object) => ({ ...l }));
      assert.deepEqual(await lignes("SELECT objet, jour::text FROM vu WHERE joueur_id = $1 ORDER BY objet, jour", [m.marie.id]),
        [{ objet: 'arrivee', jour: null }, { objet: 'revelation', jour: '2026-10-21' }]);
      assert.deepEqual(await lignes('SELECT jour::text FROM reprise_revelation'), [{ jour: '2026-10-21' }]);
      assert.deepEqual(await lignes('SELECT texte_id FROM repondre_ouvert'), [{ texte_id: 'T12' }]);
      assert.deepEqual(await lignes('SELECT texte_id FROM compte_texte_cercle WHERE cercle_id = $1 ORDER BY texte_id', [m.a.id]),
        [{ texte_id: 'T04' }, { texte_id: 'T11' }]);
      assert.deepEqual(await lignes('SELECT semaine::text FROM compte_semaine WHERE membre_id = $1 ORDER BY semaine', [m.a.membres.get(m.marie.id)]),
        [{ semaine: '2026-10-18' }, { semaine: '2026-10-25' }]);
      assert.ok(!await existe('SELECT 1 FROM envoi WHERE id = $1', [m.envois[m.marie.pseudo]]));
      assert.ok(await existe('SELECT 1 FROM envoi WHERE id = $1', [m.envois[m.paul.pseudo]]));
      assert.deepEqual(await lignes('SELECT periode::text FROM apport_mesure'), [{ periode: '2026-10-25' }]);
    });

    test('une seconde passe à la même heure n’efface rien de plus ; seul le ménage peut la faire', async () => {
      const bilan = await passerLeMenage(base.module('menage'), T);
      assert.ok(Object.values(bilan).every((n) => n === 0), JSON.stringify(bilan));
      // Sous le module du jeu, rien ne passe : la première écriture est refusée ou ne trouve rien.
      const r = await passerLeMenage(base.module('jeu'), new Date('2027-01-01T10:00:00Z')).then(
        (b) => Object.values(b).every((n) => n === 0), (e: unknown) => (e as { code?: string }).code === '42501');
      assert.ok(r);
      assert.ok(await existe('SELECT 1 FROM joueur WHERE id = $1', [yann]));
    });
  });
}
