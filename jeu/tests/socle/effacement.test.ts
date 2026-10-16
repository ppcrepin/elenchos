// P-33, P-38 : « Tout effacer » ne laisse aucune trace dans la base (traceur). Hugo, présent dans trois cercles, efface
// tout. Ensuite, une lecture brute de toute la base (par l'administrateur, qui échappe aux règles) ne contient plus
// rien de lui : ni identifiant, ni pseudo, ni empreinte, ni jeton, ni réponse, ni place dans un cercle. Restent,
// voulus : ses titres passés sous « un ancien membre » (D-045, point 2), les totaux anonymes (P-23), et son identifiant
// tiré au hasard au journal des effacements (P-32). Le cercle dont il était le seul membre disparaît avec son histoire.
// Joué dans les deux modes.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { CARTE } from '../../src/base/carte.ts';
import { enTransaction } from '../../src/base/connexion.ts';
import { restesDuJoueur, toutEffacer } from '../../src/base/effacement.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { baseDeTest, peupler, toutCeQuIlVoit, toutLeContenu, type BaseDeTest, type Monde } from './aides.ts';

const TABLES = Object.keys(CARTE);

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`« Tout effacer », mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let m: Monde;
    let traces: string[];
    let aucuneAvant: unknown;
    before(async () => {
      base = await baseDeTest(mode);
      m = await peupler(base);
      traces = [
        m.hugo.pseudo, m.hugo.pseudo.toLowerCase(), m.hugo.identite, m.hugo.session, m.hugo.sessionId, m.hugo.consentement,
        m.connexion.id, m.connexion.nonce, m.connexion.etat, m.connexion.verificateur, m.connexion.defi, m.connexion.codeRetour,
        m.hugo.abonnement, m.hugo.jeton, m.envois[m.hugo.pseudo] ?? 'absent', ...[m.a, m.b, m.c].map((c) => c.membres.get(m.hugo.id) ?? 'absent'),
        m.c.id, m.c.intitule, m.temperaments.mesureHugo, m.temperaments.originalHugoB, m.cartesA[1] ?? 'absent',
        m.cartesB[0] ?? 'absent',
      ];
      aucuneAvant = (await base.admin.query('SELECT * FROM compte_aucune ORDER BY texte_id')).rows;
      const avant = await toutLeContenu(base, TABLES);
      for (const t of traces) assert.ok(avant.includes(t), `témoin absent avant l’effacement : ${t}`);
    });
    after(async () => { await base?.fin(); });

    test('après l’effacement, le traceur de Hugo n’est plus nulle part dans la base', async () => {
      const bilan = await toutEffacer(base.module('menage'), m.hugo.id, '2026-10-22');
      assert.deepEqual(bilan, { joueurEfface: true, cerclesEffaces: 1 });
      const apres = await toutLeContenu(base, TABLES);
      for (const t of traces) assert.ok(!apres.includes(t), `reste : ${t}`);
      // Son identifiant n'apparaît plus qu'une fois : au journal des effacements.
      assert.equal(apres.split(m.hugo.id).length - 1, 1);
      const journal = await base.admin.query('SELECT joueur_id::text AS j, efface_le::text AS d FROM effacement');
      assert.deepEqual(journal.rows, [{ j: m.hugo.id, d: '2026-10-22' }]);
      assert.deepEqual(await restesDuJoueur(base.module('menage'), m.hugo.id), []);
    });

    test('ce qui reste, voulu : ses titres sous « un ancien membre », les cartes où on l’avait désigné, vides ; les totaux, inchangés', async () => {
      const titres = await base.admin.query<{ id: string; membre_id: string | null }>(
        'SELECT id, membre_id FROM titre WHERE id = ANY ($1::uuid[]) ORDER BY id',
        [[m.titres.devinA, m.titres.devinB, m.titres.pasDeCoteB]]);
      assert.equal(titres.rowCount, 3);
      for (const t of titres.rows) assert.equal(t.membre_id, null);
      const fidele = await base.admin.query<{ membre_id: string }>('SELECT membre_id FROM titre WHERE id = $1', [m.titres.fideleB]);
      assert.equal(fidele.rows[0]?.membre_id, m.b.membres.get(m.ines.id)); // le titre d'Inès ne bouge pas
      // La carte de Paul, où Marie avait posé le visage de Hugo, redevient vide ; celle dont Hugo était l'auteur part.
      const cartes = await base.admin.query<{ id: string; visage_membre_id: string | null }>(
        'SELECT id, visage_membre_id FROM carte WHERE manche_id = $1', [m.mancheA]);
      assert.deepEqual(cartes.rows, [{ id: m.cartesA[0], visage_membre_id: null }]);
      // Les liens qui l'avaient fait entrer restent servis, sans plus le désigner (P-29 ; CONTRAT.md, 2.12).
      const liens = await base.admin.query<{ invite_joueur_id: string | null; servi: boolean }>(
        'SELECT invite_joueur_id, lie_le IS NOT NULL AS servi FROM invitation WHERE id = ANY ($1::uuid[])',
        [[m.invitations.invHugoA.id, m.invitations.invHugoB.id]]);
      assert.deepEqual(liens.rows, [{ invite_joueur_id: null, servi: true }, { invite_joueur_id: null, servi: true }]);
      // Les totaux ne reculent pas (P-23).
      assert.deepEqual((await base.admin.query('SELECT * FROM compte_aucune ORDER BY texte_id')).rows, aucuneAvant);
    });

    test('les autres joueurs et leurs cercles sont intacts ; Hugo n’apparaît plus à personne', async () => {
      const marie = await toutCeQuIlVoit(base, 'jeu', ['membre', 'reponse', 'joueur'], { joueur: m.marie.id });
      assert.equal((marie.membre as unknown[]).length, 2); // Marie et Paul
      assert.deepEqual(new Set((marie.joueur as { id: string }[]).map((j) => j.id)), new Set([m.marie.id, m.paul.id]));
      const lea = await toutCeQuIlVoit(base, 'jeu', ['membre'], { joueur: m.lea.id });
      assert.equal((lea.membre as unknown[]).length, 2); // Léa et Inès
      // L'ancienne session et l'identité ne mènent plus à rien.
      const comptes = await enTransaction(base.module('comptes'), {}, async (c) => [
        (await c.query('SELECT 1 FROM session WHERE empreinte = $1', [m.hugo.session])).rowCount,
        (await c.query('SELECT 1 FROM identite WHERE empreinte = $1', [m.hugo.identite])).rowCount,
      ]);
      assert.deepEqual(comptes, [0, 0]);
      // Aucun abonnement ne reste à qui envoyer le message de 18h.
      const envoi = await toutCeQuIlVoit(base, 'envoi', ['abonnement'], {});
      assert.ok(!JSON.stringify(envoi).includes(m.hugo.jeton));
    });

    test('effacer une seconde fois ne change rien', async () => {
      const avant = await toutLeContenu(base, TABLES);
      assert.deepEqual(await toutEffacer(base.module('menage'), m.hugo.id, '2026-10-23'), { joueurEfface: false, cerclesEffaces: 0 });
      assert.equal(await toutLeContenu(base, TABLES), avant);
    });

    test('seul le ménage peut effacer un joueur ; le jeu ne le peut pas', async () => {
      const r = await enTransaction(base.module('jeu'), { joueur: m.paul.id }, (c) => c.query('DELETE FROM joueur WHERE id = $1', [m.paul.id]))
        .catch((e: unknown) => (e && typeof e === 'object' && 'code' in e && e.code === '42501' ? { rowCount: 0 } : Promise.reject(e)));
      assert.equal(r.rowCount, 0);
      assert.equal((await base.admin.query('SELECT 1 FROM joueur WHERE id = $1', [m.paul.id])).rowCount, 1);
    });
  });
}
