// P-25 : le cloisonnement des cercles est imposé par la base elle-même. Un membre d'un cercle ne reçoit rien d'un
// autre cercle, même par une requête privée de tout filtre (« SELECT * » sur chaque table, sous le rôle du jeu) : c'est
// la base qui refuse. Sans déclaration, la base ne rend rien. Les identités ne sont lues que par les comptes (P-01) ;
// les réponses, jamais par l'envoi ni par les mesures (P-22, P-23) ; les mesures ne lisent que des totaux au-dessus des
// seuils. L'invitation ne montre les réponses d'entrée de l'invitant qu'à l'invité lié (P-29). « Rien avant 18h »
// (P-26) est tenu aussi par la base pour les réponses du jour : un proche ne les lit qu'après la fermeture du texte,
// et « déjà joué » passe par une fonction qui ne rend que des membres. La base et le moteur placent 18h au même instant.
//
// Tout est joué deux fois : en mode « roles » (un rôle par module) et en mode « repli » (le propriétaire, retenu par
// FORCE ROW LEVEL SECURITY), pour prouver que le repli tient le cloisonnement.

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { CARTE, VUES } from '../../src/base/carte.ts';
import { enTransaction } from '../../src/base/connexion.ts';
import { bascule, jourDeDate } from '../../src/regles/heure.ts';
import { ajouterJours } from '../../src/serveur/horloge.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { baseDeTest, commeJoueur, peupler, repondre, toutCeQuIlVoit, type BaseDeTest, type Monde } from './aides.ts';

const TABLES = Object.keys(CARTE).filter((t) => t !== 'migration');
const TABLES_JOUEUR = TABLES.filter((t) => !['texte', 'calendrier', 'carte_accord'].includes(t));
const PUBLIQUES = ['texte', 'calendrier', 'carte_accord'];

/** Tout ce qui appartient au cercle B (« Amis ») et à ses membres qui ne sont pas dans A : rien de cela ne doit
 *  parvenir à Marie, qui n'est que dans A. Hugo est dans les deux : son joueur et ses réponses ne sont pas « de B ». */
function secretsDeB(m: Monde): string[] {
  return [
    m.b.id, m.b.intitule, m.lea.id, m.lea.pseudo, m.ines.id, m.ines.pseudo, ...m.b.membres.values(), m.mancheB,
    ...m.cartesB, m.titres.devinB, m.titres.fideleB, m.titres.surpriseB, m.titres.pasDeCoteB,
    m.temperaments.originalHugoB, m.temperaments.pontLeaB, m.lea.consentement, m.ines.consentement,
    m.lea.abonnement, m.lea.jeton, m.ines.abonnement, m.ines.jeton, m.lea.session, m.lea.sessionId, m.lea.identite,
    'etape-B7Q2', m.connexion.nonce, m.connexion.codeRetour,
    m.invitations.invHugoB.id, m.invitations.invHugoB.jeton, m.invitations.invInes.id, m.invitations.invInes.jeton,
    m.invitations.invEnAttenteB.id, m.invitations.invEnAttenteB.jeton, m.c.id, m.c.intitule,
    ...m.c.membres.values(),
  ];
}

const code = (e: unknown) => (e && typeof e === 'object' && 'code' in e ? String(e.code) : String(e));

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`cloisonnement, mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let m: Monde;
    before(async () => {
      base = await baseDeTest(mode);
      m = await peupler(base);
    });
    after(async () => { await base?.fin(); });

    test('Marie, qui n’est que dans « Famille », ne reçoit rien d’« Amis » ni de « Seul », table par table, sans aucun filtre', async () => {
      const vu = await toutCeQuIlVoit(base, 'jeu', [...TABLES, ...VUES], { joueur: m.marie.id });
      const tout = JSON.stringify(vu);
      for (const s of secretsDeB(m)) assert.ok(!tout.includes(s), `Marie reçoit ${s}`);
      // Témoins : elle voit bien son cercle, Paul, Hugo et leurs réponses.
      assert.ok(tout.includes(m.a.id) && tout.includes(m.paul.pseudo) && tout.includes(m.hugo.pseudo));
      const reponses = vu.reponse as { joueur_id: string }[];
      assert.deepEqual(new Set(reponses.map((r) => r.joueur_id)), new Set([m.marie.id, m.paul.id, m.hugo.id]));
      // Le tempérament « pour toute la personne » de Hugo, son proche, lui est visible ; celui de Hugo dans B, non.
      assert.ok(tout.includes(m.temperaments.mesureHugo));
    });

    test('témoins : Inès voit « Amis », Hugo voit ses trois cercles', async () => {
      const ines = JSON.stringify(await toutCeQuIlVoit(base, 'jeu', TABLES, { joueur: m.ines.id }));
      assert.ok(ines.includes(m.b.id) && ines.includes(m.lea.pseudo) && ines.includes(m.titres.surpriseB));
      assert.ok(!ines.includes(m.a.id) && !ines.includes(m.marie.pseudo) && !ines.includes(m.paul.id));
      const hugo = (await toutCeQuIlVoit(base, 'jeu', ['cercle'], { joueur: m.hugo.id })).cercle as { id: string }[];
      assert.deepEqual(new Set(hugo.map((c) => c.id)), new Set([m.a.id, m.b.id, m.c.id]));
    });

    test('sans déclaration, ou avec un joueur inconnu ou un jeton inventé, la base ne rend rien d’un joueur', async () => {
      for (const qui of [{}, { joueur: randomUUID() }, { jeton: randomBytes(32).toString('hex') }]) {
        const vu = await toutCeQuIlVoit(base, 'jeu', TABLES_JOUEUR, qui);
        for (const t of TABLES_JOUEUR) {
          const v = vu[t];
          assert.ok(v === 'refus' || (Array.isArray(v) && v.length === 0), `${t} : ${JSON.stringify(v).slice(0, 80)}`);
        }
      }
      const publiques = await toutCeQuIlVoit(base, 'jeu', PUBLIQUES, {});
      for (const t of PUBLIQUES) assert.ok(Array.isArray(publiques[t]) && publiques[t].length > 0, t);
    });

    test('les identités, sessions et codes ne sont lus que par les comptes (P-01) ; les réponses jamais par l’envoi, les comptes ni les mesures', async () => {
      const vide = (v: unknown) => v === 'refus' || (Array.isArray(v) && v.length === 0);
      const jeu = await toutCeQuIlVoit(base, 'jeu', ['identite', 'session', 'connexion_en_cours', 'code_retour', 'code_email', 'envoi',
        'effacement'], { joueur: m.hugo.id });
      for (const [t, v] of Object.entries(jeu)) {
        assert.ok(vide(v), `jeu lit ${t}`);
        if (mode === 'roles') assert.equal(v, 'refus', `jeu : ${t} doit être refusé par ses droits`);
      }
      for (const module of ['envoi', 'comptes', 'mesures'] as const) {
        const v = await toutCeQuIlVoit(base, module, ['reponse', 'membre', 'cercle', 'manche', 'carte', 'titre'], { joueur: m.marie.id });
        for (const [t, x] of Object.entries(v)) assert.ok(vide(x), `${module} lit ${t}`);
      }
      const comptes = await toutCeQuIlVoit(base, 'comptes', ['identite', 'session'], {});
      assert.equal((comptes.identite as unknown[]).length, 5);
      const envoi = await toutCeQuIlVoit(base, 'envoi', ['abonnement', 'envoi'], {});
      assert.equal((envoi.abonnement as unknown[]).length, 5);
    });

    test('les mesures ne lisent que des totaux, au-dessus des seuils (P-21, P-23)', async () => {
      const vu = await toutCeQuIlVoit(base, 'mesures', [...VUES, 'compte_aucune', 'total_mesure'], {});
      assert.deepEqual(vu.mesure_aucune, []); // 5 réponses au plus par texte : sous le seuil de 30
      assert.deepEqual(vu.mesure_totaux, []); // 1 apport : sous le seuil de 10
      assert.equal((vu.mesure_compteurs as unknown[]).length, 1);
      if (mode === 'roles') {
        assert.equal(vu.compte_aucune, 'refus');
        assert.equal(vu.total_mesure, 'refus');
      }
      // Le jeu écrit les totaux sans pouvoir les lire.
      const jeu = await toutCeQuIlVoit(base, 'jeu', ['compte_aucune', 'compteur', 'histogramme_raison', 'total_mesure'], { joueur: m.marie.id });
      for (const v of Object.values(jeu)) assert.ok(v === 'refus' || (Array.isArray(v) && v.length === 0));
      // Au-dessus de 30 réponses, et seulement après la révélation (18h, deux jours après l'ouverture) : T07 s'est
      // ouvert il y a longtemps, T08 s'ouvrira dans longtemps.
      const proprietaire = base.module('proprietaire');
      for (const [id, jour] of [['T07', '2026-01-05'], ['T08', '2099-01-05']]) {
        await proprietaire.query("INSERT INTO texte (id, role, tension, sens, contenu, empreinte) VALUES ($1, 'jour', 'L', 1, '{}', $2)",
          [id, 'e'.repeat(64)]);
        await proprietaire.query('INSERT INTO calendrier (jour, texte_id) VALUES ($1, $2)', [jour, id]);
      }
      await commeJoueur(base, m.marie.id, async (c) => {
        for (let i = 0; i < 29; i += 1) for (const t of ['T07', 'T08']) await c.query('SELECT compter_reponse($1, $2)', [t, i % 3 === 0]);
      });
      const lire = async () => ((await toutCeQuIlVoit(base, 'mesures', ['mesure_aucune'], {})).mesure_aucune as { texte_id: string; reponses: number; aucune: number }[])
        .filter((l) => l.texte_id === 'T07' || l.texte_id === 'T08').map((l) => [l.texte_id, l.reponses, l.aucune]);
      assert.deepEqual(await lire(), []); // 29 : sous le seuil
      await commeJoueur(base, m.marie.id, async (c) => {
        for (const t of ['T07', 'T08']) await c.query('SELECT compter_reponse($1, true)', [t]);
      });
      assert.deepEqual(await lire(), [['T07', 30, 11]]); // T08 n'est pas encore révélé
    });

    test('Marie ne peut rien écrire dans « Amis » : la base refuse ou ne trouve rien', async () => {
      const refuse = async (sql: string, valeurs: unknown[]) => {
        await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query(sql, valeurs)), (e) => code(e) === '42501', sql);
      };
      await refuse('INSERT INTO manche (id, cercle_id, devineur_membre_id, jour, texte_id) VALUES ($1, $2, $3, $4, $5)',
        [randomUUID(), m.b.id, m.b.membres.get(m.hugo.id), '2026-10-21', 'T05']);
      await refuse("INSERT INTO titre (id, cercle_id, sorte, jour, membre_id) VALUES ($1, $2, 'devin', '2026-10-25', NULL)", [randomUUID(), m.b.id]);
      await refuse("INSERT INTO journee_cercle (cercle_id, jour, eveille) VALUES ($1, '2026-10-22', false)", [m.b.id]);
      await refuse("INSERT INTO membre (id, cercle_id, joueur_id, rond, createur, arrive_le) VALUES ($1, $2, $3, 'X', false, now())",
        [randomUUID(), m.b.id, m.marie.id]);
      await refuse('INSERT INTO reponse (joueur_id, texte_id, moment, chiffre, consentement_id) VALUES ($1, $2, $3, $4, $5)',
        [m.lea.id, 'T06', 'jour', Buffer.alloc(31), m.lea.consentement]);
      await refuse(`INSERT INTO invitation (id, sorte, empreinte_jeton, cercle_id, invitant_membre_id, accord_invitant_version,
        accord_invitant_le, expire_le) VALUES ($1, 'invite', $2, $3, $4, 1, now(), now())`,
      [randomUUID(), randomBytes(32).toString('hex'), m.b.id, m.b.membres.get(m.lea.id)]);
      const rien = async (sql: string, valeurs: unknown[]) => {
        const r = await commeJoueur(base, m.marie.id, (c) => c.query(sql, valeurs)).catch((e: unknown) => {
          if (code(e) === '42501') return { rowCount: 0 };
          throw e;
        });
        assert.equal(r.rowCount, 0, sql);
      };
      await rien("UPDATE cercle SET intitule = 'pris' WHERE id = $1", [m.b.id]);
      await rien('DELETE FROM membre WHERE id = $1', [m.b.membres.get(m.ines.id)]);
      await rien('UPDATE carte SET passee = true WHERE manche_id = $1', [m.mancheB]);
      await rien('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE id = $2', [m.marie.id, m.invitations.invEnAttenteB.id]);
      await rien('DELETE FROM abonnement WHERE joueur_id = $1', [m.lea.id]);
      // Poser sur sa carte le visage d'un membre d'un autre cercle : refusé par la base (EL005), sans valeur.
      await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query('UPDATE carte SET visage_membre_id = $1 WHERE id = $2',
        [m.b.membres.get(m.ines.id), m.cartesA[0]])), (e) => code(e) === 'EL005' && !/[0-9a-f]{8}-/.test(String((e as Error).message)));
      // Témoin : la même écriture dans son cercle passe.
      const ok = await commeJoueur(base, m.marie.id, (c) => c.query('UPDATE carte SET visage_membre_id = $1 WHERE id = $2',
        [m.a.membres.get(m.paul.id), m.cartesA[1]]));
      assert.equal(ok.rowCount, 1);
    });

    test('témoin : sans les règles de la base sur une table, Marie y lirait « Amis » (le test sait le voir)', async () => {
      await base.admin.query('ALTER TABLE titre DISABLE ROW LEVEL SECURITY');
      try {
        const vu = JSON.stringify(await toutCeQuIlVoit(base, 'jeu', ['titre'], { joueur: m.marie.id }));
        assert.ok(vu.includes(m.titres.devinB));
      } finally {
        await base.admin.query('ALTER TABLE titre ENABLE ROW LEVEL SECURITY');
      }
      const vu = JSON.stringify(await toutCeQuIlVoit(base, 'jeu', ['titre'], { joueur: m.marie.id }));
      assert.ok(!vu.includes(m.titres.devinB));
    });

    test('le score du défi s’efface à la lecture de l’annonce, sur les seuls liens de l’invitant, dans ce seul cercle', async () => {
      await commeJoueur(base, m.paul.id, (c) => c.query('UPDATE invitation SET score_entree = 2 WHERE id = $1', [m.invitations.invPaul.id]));
      await commeJoueur(base, m.hugo.id, (c) => c.query('UPDATE invitation SET score_entree = 3 WHERE invite_joueur_id = $1', [m.hugo.id]));
      const score = async (id: string) => (await base.admin.query<{ s: number | null }>('SELECT score_entree AS s FROM invitation WHERE id = $1', [id])).rows[0]?.s;
      assert.equal(await score(m.invitations.invHugoB.id), 3);
      // Marie n'a pas de lien dans « Amis » : rien n'y bouge. Paul n'a invité personne dans « Famille » : rien non plus.
      assert.equal((await commeJoueur(base, m.marie.id, (c) => c.query('SELECT oublier_scores($1) AS n', [m.b.id]))).rows[0]?.n, 0);
      assert.equal((await commeJoueur(base, m.paul.id, (c) => c.query('SELECT oublier_scores($1) AS n', [m.a.id]))).rows[0]?.n, 0);
      assert.equal((await commeJoueur(base, m.marie.id, (c) => c.query('SELECT oublier_scores($1) AS n', [m.a.id]))).rows[0]?.n, 2);
      assert.equal(await score(m.invitations.invPaul.id), null);
      assert.equal(await score(m.invitations.invHugoA.id), null);
      assert.equal(await score(m.invitations.invHugoB.id), 3);
    });

    test('rien avant 18h, tenu par la base : Marie ne lit la réponse de Paul au texte du mardi qu’à sa fermeture, mardi 18h', async () => {
      // T04 est le texte du jour de jeu du lundi (fermé lundi 18h), T05 celui du mardi (fermé mardi 18h, 16:00Z).
      const lire = async (instant: string) => {
        const lignes = await enTransaction(base.module('jeu'), { joueur: m.marie.id, instant: new Date(instant) },
          async (c) => (await c.query<{ joueur_id: string; texte_id: string }>('SELECT joueur_id, texte_id FROM reponse')).rows);
        return (joueur: string) => lignes.filter((l) => l.joueur_id === joueur).map((l) => l.texte_id).sort();
      };
      const avant = await lire('2026-10-20T15:59:59Z'); // mardi 17:59:59
      assert.deepEqual(avant(m.paul.id), ['T01', 'T02', 'T03', 'T04'], 'ses réponses d’entrée et celle du lundi, pas celle du mardi');
      assert.deepEqual(avant(m.hugo.id), ['T01', 'T02', 'T03', 'T04']);
      assert.deepEqual(avant(m.marie.id), ['T01', 'T02', 'T03', 'T04', 'T05'], 'les siennes, toujours');
      const a18h = await lire('2026-10-20T16:00:00Z'); // mardi 18:00:00
      assert.deepEqual(a18h(m.paul.id), ['T01', 'T02', 'T03', 'T04', 'T05']);
      // La veille, même la réponse du lundi est cachée ; les réponses d'entrée, jamais.
      assert.deepEqual((await lire('2026-10-18T12:00:00Z'))(m.paul.id), ['T01', 'T02', 'T03']);
      // Témoin : sans la règle de temps (une heure lointaine), tout se lit.
      assert.deepEqual((await lire('2099-01-01T00:00:00Z'))(m.hugo.id), ['T01', 'T02', 'T03', 'T04', 'T05']);
    });

    test('« déjà joué » avant 18h : des membres de ses cercles seulement, jamais une réponse ni un membre d’un autre cercle', async () => {
      const ontRepondu = (joueur: string, texte: string) => enTransaction(base.module('jeu'), { joueur, instant: new Date('2026-10-20T15:59:59Z') },
        async (c) => new Set((await c.query<{ r: string[] }>('SELECT cloison_ont_repondu($1) AS r', [texte])).rows[0]?.r ?? []));
      // Dans « Famille », Marie, Paul et Hugo ont répondu au texte du mardi.
      assert.deepEqual(await ontRepondu(m.marie.id, 'T05'), new Set([...m.a.membres.values()]));
      // Hugo est dans trois cercles : ses proches de chacun, sous leurs identifiants de membre.
      const hugo = await ontRepondu(m.hugo.id, 'T05');
      assert.deepEqual(hugo, new Set([...m.a.membres.values(), ...m.b.membres.values(), ...m.c.membres.values()]));
      // Personne n'a répondu au texte du mercredi ; un joueur sans cercle, ou inconnu, ne reçoit rien.
      assert.deepEqual(await ontRepondu(m.marie.id, 'T06'), new Set());
      assert.deepEqual(await ontRepondu(randomUUID(), 'T05'), new Set());
      // Ce que rend la fonction : des identifiants de membre, jamais ceux des joueurs (P-01).
      const joueurs = [m.marie, m.paul, m.hugo, m.lea, m.ines].map((j) => j.id);
      for (const id of hugo) assert.ok(!joueurs.includes(id));
    });

    test('la base et le moteur placent 18h au même instant, chaque jour de 2026 à 2028, changements d’heure compris', async () => {
      const jours: string[] = [];
      for (let d = '2026-01-01'; d < '2029-01-01'; d = ajouterJours(d, 1)) jours.push(d);
      const r = await base.admin.query<{ jour: string; fin: Date }>(
        'SELECT j::text AS jour, fin_du_jour_de_jeu(j) AS fin FROM unnest($1::date[]) AS j', [jours]);
      assert.equal(r.rowCount, jours.length);
      for (const l of r.rows) assert.equal(l.fin.getTime(), bascule(jourDeDate(l.jour)), l.jour);
    });

    test('une déclaration ne survit pas à sa transaction : la connexion suivante ne voit plus personne', async () => {
      const pool = base.module('jeu');
      await enTransaction(pool, { joueur: m.marie.id }, async (c) => {
        assert.ok(((await c.query('SELECT id FROM cercle')).rowCount ?? 0) > 0);
      });
      for (let i = 0; i < 6; i += 1) { // le pool réutilise ses connexions
        assert.equal((await pool.query('SELECT * FROM reponse')).rowCount, 0);
        assert.equal((await pool.query('SELECT * FROM membre')).rowCount, 0);
      }
    });

    test('l’invitation (P-29) : ouvrir le lien montre l’invitant, jamais ses réponses ; lié, ses trois réponses d’entrée seulement', async () => {
      const inv = m.invitations.invEnAttenteB; // un lien de Léa, pas encore ouvert
      // 1. On ouvre le lien, sans être joueur : le jeton déclaré montre le lien, le cercle, le visage de Léa.
      const ouvert = await toutCeQuIlVoit(base, 'jeu', TABLES, { jeton: inv.jeton });
      const tout = JSON.stringify(ouvert);
      assert.equal((ouvert.invitation as unknown[]).length, 1);
      assert.ok(tout.includes(m.b.id) && tout.includes(m.lea.pseudo));
      assert.deepEqual(ouvert.reponse, []);
      for (const s of [m.hugo.pseudo, m.ines.pseudo, m.ines.id, m.mancheB, m.titres.devinB]) assert.ok(!tout.includes(s), s);
      // 2. Zoé accepte la carte (joueur provisoire), répond, et lie le lien à elle.
      const zoe = { id: randomUUID(), consentement: randomUUID() };
      await commeJoueur(base, zoe.id, async (c) => {
        await c.query("INSERT INTO joueur (id, etat, cree_le) VALUES ($1, 'provisoire', now())", [zoe.id]);
        await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), true)',
          [zoe.consentement, zoe.id]);
        await repondre(c, { ...m.lea, id: zoe.id, consentement: zoe.consentement }, 'T01', { position: 1, raison: 3 }, 'entree');
        const lie = await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE empreinte_jeton = $2 AND lie_le IS NULL',
          [zoe.id, inv.jeton]);
        assert.equal(lie.rowCount, 1);
      }, inv.jeton);
      // 3. Liée, sans jeton : les trois réponses d'entrée de Léa, et rien d'autre de Léa ; rien de Hugo ni d'Inès.
      const lie = await toutCeQuIlVoit(base, 'jeu', TABLES, { joueur: zoe.id });
      const reponses = lie.reponse as { joueur_id: string; texte_id: string }[];
      assert.deepEqual(reponses.filter((r) => r.joueur_id === m.lea.id).map((r) => r.texte_id).sort(), ['T01', 'T02', 'T03']);
      assert.deepEqual(new Set(reponses.map((r) => r.joueur_id)), new Set([m.lea.id, zoe.id]));
      const toutLie = JSON.stringify(lie);
      for (const s of [m.hugo.pseudo, m.ines.pseudo, m.ines.id, m.mancheB, m.titres.devinB, m.a.id]) assert.ok(!toutLie.includes(s), s);
      // 4. Le lien a servi : quelqu'un d'autre qui le rouvre ne voit plus rien, et ne peut plus le lier.
      const autre = randomUUID();
      const rouvert = await toutCeQuIlVoit(base, 'jeu', ['invitation', 'cercle', 'joueur', 'membre', 'reponse'], { joueur: autre, jeton: inv.jeton });
      for (const [t, v] of Object.entries(rouvert)) assert.deepEqual(v, [], t);
      const vol = await commeJoueur(base, autre, (c) => c.query('UPDATE invitation SET invite_joueur_id = $1 WHERE empreinte_jeton = $2',
        [autre, inv.jeton]), inv.jeton);
      assert.equal(vol.rowCount, 0);
      // 5. Un joueur provisoire n'entre dans aucun cercle (DECISIONS-TECHNIQUES, partie 3, condition 4).
      await assert.rejects(commeJoueur(base, zoe.id, (c) => c.query(
        "INSERT INTO membre (id, cercle_id, joueur_id, rond, createur, arrive_le) VALUES ($1, $2, $3, 'Z', false, now())",
        [randomUUID(), m.b.id, zoe.id])), (e) => code(e) === 'EL006');
    });
  });
}
