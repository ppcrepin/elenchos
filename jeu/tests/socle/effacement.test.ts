// P-33, P-38 : « Tout effacer » ne laisse aucune trace dans la base (traceur). Hugo, présent dans trois cercles, efface
// tout. Ensuite, une lecture brute de toute la base (par l'administrateur, qui échappe aux règles) ne contient plus
// rien de lui : ni identifiant, ni pseudo, ni empreinte, ni jeton, ni réponse, ni place dans un cercle. Restent,
// voulus : ses titres passés sous « un ancien membre » (D-045, point 2), sauf Le Pas de Côté, effacé (D-066, point 1),
// les totaux anonymes (P-23), et son identifiant tiré au hasard au journal des effacements (P-32). Le cercle dont il
// était le seul membre disparaît avec son histoire. Le score de son défi d'entrée part aussi (CONTRAT.md, 2.12).
// Effacé le mardi à midi, avant 18h : les cartes où l'on avait posé son visage dans les manches du jour redeviennent
// vides, marquées « vidées par un départ » (règle 4).
// Puis « Quitter un cercle » (règle 4, J10), avant et après 18h : le verdict, le « jumeau » devenu « juste », le Pas de
// Côté, « déjà vu », et le lien qui ne désigne plus le partant (Juridique). Joué dans les deux modes.

import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { CARTE } from '../../src/base/carte.ts';
import { enTransaction } from '../../src/base/connexion.ts';
import { restesDuJoueur, toutEffacer } from '../../src/base/effacement.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { baseDeTest, commeJoueur, peupler, toutCeQuIlVoit, toutLeContenu, type BaseDeTest, type Monde } from './aides.ts';

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
      // Le score de son défi d'entrée dans « Famille », pas encore lu par Marie.
      await commeJoueur(base, m.hugo.id, (c) => c.query('UPDATE invitation SET score_entree = 2 WHERE id = $1', [m.invitations.invHugoA.id]));
      const avant = await toutLeContenu(base, TABLES);
      for (const t of traces) assert.ok(avant.includes(t), `témoin absent avant l’effacement : ${t}`);
    });
    after(async () => { await base?.fin(); });

    test('après l’effacement, le traceur de Hugo n’est plus nulle part dans la base', async () => {
      const bilan = await toutEffacer(base.module('menage'), m.hugo.id, new Date('2026-10-20T10:00:00Z')); // mardi, midi
      assert.deepEqual(bilan, { joueurEfface: true, cerclesEffaces: 1 });
      const apres = await toutLeContenu(base, TABLES);
      for (const t of traces) assert.ok(!apres.includes(t), `reste : ${t}`);
      // Son identifiant n'apparaît plus qu'une fois : au journal des effacements.
      assert.equal(apres.split(m.hugo.id).length - 1, 1);
      const journal = await base.admin.query('SELECT joueur_id::text AS j, efface_le::text AS d FROM effacement');
      assert.deepEqual(journal.rows, [{ j: m.hugo.id, d: '2026-10-20' }]);
      assert.deepEqual(await restesDuJoueur(base.module('menage'), m.hugo.id), []);
    });

    test('ce qui reste, voulu : ses titres sous « un ancien membre », sauf Le Pas de Côté ; les cartes où on l’avait désigné, vides ; les totaux, inchangés ; plus de score', async () => {
      const titres = await base.admin.query<{ id: string; membre_id: string | null }>(
        'SELECT id, membre_id FROM titre WHERE id = ANY ($1::uuid[]) ORDER BY id',
        [[m.titres.devinA, m.titres.devinB, m.titres.pasDeCoteB]]);
      // Le Devin dans « Famille » et dans « Amis » restent, sans titulaire ; son Pas de Côté est effacé (D-066, point 1).
      assert.deepEqual(new Set(titres.rows.map((t) => t.id)), new Set([m.titres.devinA, m.titres.devinB]));
      for (const t of titres.rows) assert.equal(t.membre_id, null);
      const fidele = await base.admin.query<{ membre_id: string }>('SELECT membre_id FROM titre WHERE id = $1', [m.titres.fideleB]);
      assert.equal(fidele.rows[0]?.membre_id, m.b.membres.get(m.ines.id)); // le titre d'Inès ne bouge pas
      // La carte de Paul, où Marie avait posé le visage de Hugo, redevient vide, « vidée par un départ » : la manche du
      // mardi n'est pas finie (règle 4). Celle dont Hugo était l'auteur part.
      const cartes = async (manche: string) => (await base.admin.query(
        'SELECT id, visage_membre_id, pourquoi, videe_par_depart FROM carte WHERE manche_id = $1 ORDER BY ordre', [manche])).rows
        .map((c: object) => ({ ...c }));
      assert.deepEqual(await cartes(m.mancheA), [{ id: m.cartesA[0], visage_membre_id: null, pourquoi: null, videe_par_depart: true }]);
      // Dans « Amis », la carte « qui et pourquoi » d'Inès, où Léa avait posé Hugo : vide, et son « pourquoi » effacé.
      assert.deepEqual(await cartes(m.mancheB), [{ id: m.cartesB[1], visage_membre_id: null, pourquoi: null, videe_par_depart: true }]);
      // Les liens qui l'avaient fait entrer restent servis, sans plus le désigner ni porter son score (P-29, P-38 ;
      // CONTRAT.md, 2.12).
      const liens = await base.admin.query<{ invite_joueur_id: string | null; servi: boolean; score_entree: number | null }>(
        'SELECT invite_joueur_id, lie_le IS NOT NULL AS servi, score_entree FROM invitation WHERE id = ANY ($1::uuid[])',
        [[m.invitations.invHugoA.id, m.invitations.invHugoB.id]]);
      assert.deepEqual(liens.rows, [
        { invite_joueur_id: null, servi: true, score_entree: null }, { invite_joueur_id: null, servi: true, score_entree: null },
      ]);
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
      assert.deepEqual(await toutEffacer(base.module('menage'), m.hugo.id, new Date('2026-10-23T10:00:00Z')),
        { joueurEfface: false, cerclesEffaces: 0 });
      assert.equal(await toutLeContenu(base, TABLES), avant);
    });

    test('seul le ménage peut effacer un joueur ; le jeu ne le peut pas', async () => {
      const r = await enTransaction(base.module('jeu'), { joueur: m.paul.id }, (c) => c.query('DELETE FROM joueur WHERE id = $1', [m.paul.id]))
        .catch((e: unknown) => (e && typeof e === 'object' && 'code' in e && e.code === '42501' ? { rowCount: 0 } : Promise.reject(e)));
      assert.equal(r.rowCount, 0);
      assert.equal((await base.admin.query('SELECT 1 FROM joueur WHERE id = $1', [m.paul.id])).rowCount, 1);
    });
  });

  describe(`« Quitter un cercle » (règle 4, J10), mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let m: Monde;
    before(async () => {
      base = await baseDeTest(mode);
      m = await peupler(base);
    });
    after(async () => { await base?.fin(); });

    type Carte = { id: string; visage_membre_id: string | null; videe_par_depart: boolean; verdict: string | null };
    const cartesDe = async (manche: string) => (await base.admin.query<Carte>(
      'SELECT id, visage_membre_id, videe_par_depart, verdict FROM carte WHERE manche_id = $1 ORDER BY ordre', [manche]))
      .rows.map((c) => ({ ...c }));
    const quitter = (joueur: string, membre: string | undefined, instant: string) => commeJoueur(base, joueur,
      (c) => c.query('DELETE FROM membre WHERE id = $1', [membre]), undefined, new Date(instant));
    const lien = async (id: string) => ({ ...(await base.admin.query<{ invite_joueur_id: string | null; servi: boolean; score_entree: number | null }>(
      'SELECT invite_joueur_id, lie_le IS NOT NULL AS servi, score_entree FROM invitation WHERE id = $1', [id])).rows[0] });

    test('avant 18h : Inès quitte « Amis » ; sa carte part, celle où Léa l’avait désignée redevient vide, sans verdict, « vidée par un départ »', async () => {
      // Le verdict est écrit au geste (CONTRAT.md, partie 3) : Léa avait posé Inès sur la carte de Hugo, jugée « juste ».
      await base.admin.query("UPDATE carte SET verdict = 'juste' WHERE id = $1", [m.cartesB[0]]);
      // Le score de son défi d'entrée, pas encore lu par Léa.
      await commeJoueur(base, m.ines.id, (c) => c.query('UPDATE invitation SET score_entree = 1 WHERE id = $1', [m.invitations.invInes.id]));
      await quitter(m.ines.id, m.b.membres.get(m.ines.id), '2026-10-20T15:59:59Z'); // mardi 17:59:59
      assert.deepEqual(await cartesDe(m.mancheB), [{ id: m.cartesB[0], visage_membre_id: null, videe_par_depart: true, verdict: null }]);
    });

    test('Inès partie ne lit plus rien d’« Amis » par le lien de Léa : il ne la désigne plus, et perd son score (Juridique, P-25)', async () => {
      assert.deepEqual(await lien(m.invitations.invInes.id), { invite_joueur_id: null, servi: true, score_entree: null });
      const tables = ['cercle', 'invitation', 'joueur', 'membre', 'reponse'];
      const vu = await toutCeQuIlVoit(base, 'jeu', tables, { joueur: m.ines.id });
      const tout = JSON.stringify(vu);
      for (const s of [m.b.id, m.b.intitule, m.lea.id, m.lea.pseudo, m.invitations.invInes.id]) assert.ok(!tout.includes(s), s);
      assert.deepEqual(new Set((vu.reponse as { joueur_id: string }[]).map((r) => r.joueur_id)), new Set([m.ines.id]));
      // Témoin : si le lien la désignait encore, elle lirait le nom du cercle, le pseudo de Léa et ses trois réponses
      // d'entrée (le cas relevé par Juridique, que le test sait voir).
      await base.admin.query('UPDATE invitation SET invite_joueur_id = $1 WHERE id = $2', [m.ines.id, m.invitations.invInes.id]);
      try {
        const temoin = await toutCeQuIlVoit(base, 'jeu', tables, { joueur: m.ines.id });
        const t = JSON.stringify(temoin);
        assert.ok(t.includes(m.b.intitule) && t.includes(m.lea.pseudo));
        assert.deepEqual((temoin.reponse as { joueur_id: string; texte_id: string }[]).filter((r) => r.joueur_id === m.lea.id)
          .map((r) => r.texte_id).sort(), ['T01', 'T02', 'T03']);
      } finally {
        await base.admin.query('UPDATE invitation SET invite_joueur_id = NULL WHERE id = $1', [m.invitations.invInes.id]);
      }
    });

    test('après 18h, la manche est jouée : Paul quitte « Famille » ; la carte où Marie l’avait désigné perd son visage, et son « jumeau » devient « juste »', async () => {
      // Paul avait donné la même réponse que Hugo : la carte de Hugo, où Marie avait posé Paul, était un jumeau
      // (D-024). Avec un visage vide, « jumeau » dirait qu'un ancien membre pensait comme Hugo (Juridique ; à
      // confirmer par Game design).
      await base.admin.query("UPDATE carte SET verdict = 'jumeau_et_raison' WHERE id = $1", [m.cartesA[1]]);
      await commeJoueur(base, m.paul.id, (c) => c.query('UPDATE invitation SET score_entree = 3 WHERE id = $1', [m.invitations.invPaul.id]));
      await quitter(m.paul.id, m.a.membres.get(m.paul.id), '2026-10-20T16:00:00Z'); // mardi 18:00:00
      assert.deepEqual(await cartesDe(m.mancheA), [{ id: m.cartesA[1], visage_membre_id: null, videe_par_depart: false, verdict: 'juste_et_raison' }]);
      assert.deepEqual(await lien(m.invitations.invPaul.id), { invite_joueur_id: null, servi: true, score_entree: null });
      // Il garde son compte et ses autres cercles ; personne d'autre ne peut le faire partir.
      assert.equal((await base.admin.query('SELECT 1 FROM joueur WHERE id = $1', [m.paul.id])).rowCount, 1);
      const r = await commeJoueur(base, m.marie.id, (c) => c.query('DELETE FROM membre WHERE id = $1', [m.a.membres.get(m.hugo.id)]));
      assert.equal(r.rowCount, 0);
    });

    test('Hugo quitte « Amis » : son Pas de Côté y est effacé (D-066, point 1), son Devin reste sous « un ancien membre » ; ce qu’il y avait vu part, pas ailleurs', async () => {
      await commeJoueur(base, m.hugo.id, (c) => c.query(
        "INSERT INTO vu (joueur_id, objet, cercle_id) VALUES ($1, 'arrivee', $2), ($1, 'arrivee', $3), ($1, 'barre_pleine', NULL)",
        [m.hugo.id, m.b.id, m.a.id]));
      await quitter(m.hugo.id, m.b.membres.get(m.hugo.id), '2026-10-21T10:00:00Z'); // mercredi midi
      const titres = await base.admin.query<{ id: string; membre_id: string | null }>(
        'SELECT id, membre_id FROM titre WHERE id = ANY ($1::uuid[])', [[m.titres.devinB, m.titres.pasDeCoteB, m.titres.devinA]]);
      assert.deepEqual(Object.fromEntries(titres.rows.map((t) => [t.id, t.membre_id])),
        { [m.titres.devinB]: null, [m.titres.devinA]: m.a.membres.get(m.hugo.id) });
      const vus = await base.admin.query<{ objet: string; cercle_id: string | null }>(
        'SELECT objet, cercle_id FROM vu WHERE joueur_id = $1 ORDER BY objet', [m.hugo.id]);
      assert.deepEqual(vus.rows.map((v) => ({ ...v })), [{ objet: 'arrivee', cercle_id: m.a.id }, { objet: 'barre_pleine', cercle_id: null }]);
      // Ce que Léa avait vu dans « Amis » reste : elle n'est pas partie.
      assert.equal((await base.admin.query("SELECT 1 FROM vu WHERE joueur_id = $1 AND cercle_id = $2", [m.lea.id, m.b.id])).rowCount, 1);
    });
  });
}
