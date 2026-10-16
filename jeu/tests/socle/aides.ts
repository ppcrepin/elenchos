// Les aides des tests du socle : une base d'essai par fichier de test, et un monde inventé de cinq joueurs et trois
// cercles, écrit par les vrais modules (jeu, comptes, envoi) sous leurs vraies règles.
// Origine du principe : test-18h/tests/aides/outils.ts (REPRIS : traceur, base d'essai dans un schéma neuf).
//
// La base d'essai : un schéma neuf, détruit à la fin, dont le propriétaire est un rôle SANS privilège de
// superutilisateur (elenchos_test_proprietaire), comme on suppose l'être celui de Scalingo : un superutilisateur
// échapperait aux règles de cloisonnement, et le test ne prouverait rien. Exige BASE_DE_TEST_URL (un PostgreSQL
// jetable, jamais une base réelle, D-048). Ces tests ne sont jamais sautés.
//
// Le traceur (docs/etape-6/donnees.md, partie 2) : chaque valeur saisie porte une marque reconnaissable.
// Les adresses e-mail sont au domaine réservé exemple.invalid (P-17).

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { creerPool, creerPoolModule, enTransaction, type ModuleOuProprietaire } from '../../src/base/connexion.ts';
import { installerBase } from '../../src/base/installation.ts';
import { pseudoComparaison } from '../../src/regles/cercle.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { chiffrerPourquoi, chiffrerReponse, type ReponseClaire } from '../../src/serveur/crypto.ts';

export const PROPRIETAIRE_DE_TEST = 'elenchos_test_proprietaire';
export const CLE_REPONSES_TEST = randomBytes(32);

export function urlDeTest(): string {
  const url = process.env.BASE_DE_TEST_URL;
  if (!url) {
    throw new Error('BASE_DE_TEST_URL manque : ces tests exigent un vrai PostgreSQL jetable (voir jeu/src/base/LISEZMOI.md). Ils ne sont jamais sautés.');
  }
  return url;
}

export type BaseDeTest = Awaited<ReturnType<typeof baseDeTest>>;

export async function baseDeTest(mode: ModeRoles) {
  const url = urlDeTest();
  const schema = 'socle_' + randomBytes(6).toString('hex');
  const racine = creerPool(url, {}, { max: 1 });
  await racine.query(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${PROPRIETAIRE_DE_TEST}') THEN
      CREATE ROLE ${PROPRIETAIRE_DE_TEST} LOGIN CREATEROLE NOSUPERUSER NOBYPASSRLS;
    END IF; END $$`);
  await racine.query(`CREATE SCHEMA ${schema} AUTHORIZATION ${PROPRIETAIRE_DE_TEST}`);
  await racine.end();
  const u = new URL(url);
  u.username = PROPRIETAIRE_DE_TEST;
  u.password = '';
  const urlProprietaire = u.toString();
  await installerBase(urlProprietaire, mode, { schema });

  // L'administrateur de la base d'essai (superutilisateur) : il voit tout, pour vérifier ce que la base contient.
  const admin = creerPool(url, {}, { schema, max: 2 });
  const pools = new Map<ModuleOuProprietaire, pg.Pool>();
  const module = (m: ModuleOuProprietaire): pg.Pool => {
    let p = pools.get(m);
    if (!p) { p = creerPoolModule(urlProprietaire, m, mode, { schema }); pools.set(m, p); }
    return p;
  };
  return {
    mode, schema, url, urlProprietaire, admin, module,
    async fin() {
      for (const p of pools.values()) await p.end();
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      await admin.end();
    },
  };
}

/** Une empreinte reconnaissable, tirée d'un mot du traceur. */
export function empreinteDe(mot: string): string {
  return createHash('sha256').update('traceur:' + mot).digest('hex');
}

export const JOURS = { lundi: '2026-10-19', mardi: '2026-10-20', mercredi: '2026-10-21', dimanche: '2026-10-25' };
/** Le mardi 20 octobre 2026 à midi, heure de Paris : avant la fermeture du texte du mardi. */
export const MARDI_MIDI = '2026-10-20T10:00:00Z';

export type Joueur = {
  id: string; pseudo: string; rond: string; consentement: string; session: string; sessionId: string; identite: string;
  abonnement: string; jeton: string;
};

/** Écrit, sous le module du jeu, une transaction déclarée au nom d'un joueur (et, si on la donne, à une heure). */
export function commeJoueur<T>(base: BaseDeTest, joueur: string, travail: (c: pg.PoolClient) => Promise<T>, jeton?: string,
  instant?: Date): Promise<T> {
  return enTransaction(base.module('jeu'), { joueur, ...(jeton === undefined ? {} : { jeton }), ...(instant === undefined ? {} : { instant }) },
    travail);
}

/** Une réponse chiffrée, et son apport au compte de « aucune ». */
export async function repondre(c: pg.ClientBase, joueur: Joueur, texte: string, r: ReponseClaire, moment: 'entree' | 'jour') {
  await c.query(
    `INSERT INTO reponse (joueur_id, texte_id, moment, chiffre, consentement_id) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (joueur_id, texte_id) DO NOTHING`,
    [joueur.id, texte, moment, chiffrerReponse(CLE_REPONSES_TEST, joueur.id, texte, r), joueur.consentement]);
  await c.query('SELECT compter_reponse($1, $2)', [texte, r.raison === 0]);
}

/** Le contenu public : six textes (trois d'entrée, trois du jour), un calendrier, une carte de consentement. */
export async function contenuPublic(base: BaseDeTest): Promise<void> {
  const p = base.module('proprietaire');
  await p.query("INSERT INTO carte_accord (version, empreinte, nouvel_accord) VALUES (1, $1, true) ON CONFLICT DO NOTHING",
    [empreinteDe('carte-v1')]);
  const textes: [string, string, string][] = [
    ['T01', 'entree', 'S'], ['T02', 'entree', 'EM'], ['T03', 'entree', 'P'],
    ['T04', 'jour', 'SR'], ['T05', 'jour', 'T'], ['T06', 'jour', 'SO'],
  ];
  for (const [id, role, tension] of textes) {
    await p.query(
      `INSERT INTO texte (id, role, tension, sens, contenu, empreinte) VALUES ($1, $2, $3, 0, $4, $5) ON CONFLICT DO NOTHING`,
      [id, role, tension, JSON.stringify({ titre: `Texte ${id}` }), empreinteDe(id)]);
  }
  for (const [jour, texte] of [[JOURS.lundi, 'T04'], [JOURS.mardi, 'T05'], [JOURS.mercredi, 'T06']]) {
    await p.query('INSERT INTO calendrier (jour, texte_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [jour, texte]);
  }
}

/** Un joueur : provisoire à l'accord (option B), puis compte (identité, session de l'appareil), sous les modules jeu
 *  et comptes ; puis l'abonnement au message de 18h de cet appareil. */
export async function nouveauJoueur(base: BaseDeTest, pseudo: string, rond: string): Promise<Joueur> {
  const j: Joueur = {
    id: randomUUID(), pseudo, rond, consentement: randomUUID(), session: empreinteDe('session-' + pseudo),
    sessionId: randomUUID(), identite: empreinteDe('sub-' + pseudo), abonnement: randomUUID(), jeton: createHash('sha256').update('jeton-' + pseudo).digest('hex'),
  };
  await commeJoueur(base, j.id, async (c) => {
    await c.query("INSERT INTO joueur (id, etat, cree_le) VALUES ($1, 'provisoire', now())", [j.id]);
    await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), true)',
      [j.consentement, j.id]);
    await c.query('UPDATE joueur SET pseudo = $2, pseudo_comparaison = $3 WHERE id = $1', [j.id, pseudo, pseudoComparaison(pseudo)]);
  });
  await enTransaction(base.module('comptes'), {}, async (c) => {
    await c.query("INSERT INTO identite (voie, empreinte, joueur_id) VALUES ('apple', $1, $2) ON CONFLICT DO NOTHING", [j.identite, j.id]);
    await c.query("UPDATE joueur SET etat = 'compte' WHERE id = $1", [j.id]);
    await c.query(`INSERT INTO session (id, empreinte, joueur_id, expire_le) VALUES ($1, $2, $3, now() + interval '30 days')
      ON CONFLICT (empreinte) DO NOTHING`, [j.sessionId, j.session, j.id]);
  });
  await commeJoueur(base, j.id, (c) => c.query(
    'INSERT INTO abonnement (id, joueur_id, session_id, jeton) VALUES ($1, $2, $3, $4) ON CONFLICT (session_id) DO NOTHING',
    [j.abonnement, j.id, j.sessionId, j.jeton]));
  return j;
}

export type Cercle = { id: string; intitule: string; membres: Map<string, string> }; // joueur → membre

/** Le créateur crée son cercle et y entre. */
export async function creerCercle(base: BaseDeTest, createur: Joueur, intitule: string): Promise<Cercle> {
  const cercle: Cercle = { id: randomUUID(), intitule, membres: new Map() };
  const membre = randomUUID();
  await commeJoueur(base, createur.id, async (c) => {
    await c.query("INSERT INTO cercle (id, intitule, entree_1, entree_2, entree_3) VALUES ($1, $2, 'T01', 'T02', 'T03')", [cercle.id, intitule]);
    await c.query(`INSERT INTO membre (id, cercle_id, joueur_id, rond, createur, arrive_le) VALUES ($1, $2, $3, $4, true, now())
      ON CONFLICT (cercle_id, joueur_id) DO NOTHING`, [membre, cercle.id, createur.id, createur.rond]);
  });
  cercle.membres.set(createur.id, membre);
  return cercle;
}

export type Invitation = { id: string; jeton: string };

/** Un membre invite (P-35 : son accord est gardé avec le lien). */
export async function inviter(base: BaseDeTest, cercle: Cercle, invitant: Joueur): Promise<Invitation> {
  const inv = { id: randomUUID(), jeton: randomBytes(32).toString('hex') };
  await commeJoueur(base, invitant.id, (c) => c.query(
    `INSERT INTO invitation (id, sorte, empreinte_jeton, cercle_id, invitant_membre_id, accord_invitant_version,
       accord_invitant_le, expire_le) VALUES ($1, 'invite', $2, $3, $4, 1, now(), now() + interval '7 days')`,
    [inv.id, inv.jeton, cercle.id, cercle.membres.get(invitant.id)]));
  return inv;
}

/** L'invité lie le lien à lui (à sa première réponse), puis entre dans le cercle. */
export async function entrer(base: BaseDeTest, cercle: Cercle, inv: Invitation, joueur: Joueur): Promise<string> {
  const membre = randomUUID();
  await commeJoueur(base, joueur.id, async (c) => {
    await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE empreinte_jeton = $2 AND lie_le IS NULL',
      [joueur.id, inv.jeton]);
    await c.query(`INSERT INTO membre (id, cercle_id, joueur_id, rond, createur, arrive_le) VALUES ($1, $2, $3, $4, false, now())
      ON CONFLICT (cercle_id, joueur_id) DO NOTHING`, [membre, cercle.id, joueur.id, joueur.rond]);
  }, inv.jeton);
  cercle.membres.set(joueur.id, membre);
  return membre;
}

export type Monde = Awaited<ReturnType<typeof peupler>>;

/**
 * Le monde inventé :
 * - « Famille » (A) : Marie (créatrice), Paul, Hugo ;
 * - « Amis » (B) : Léa (créatrice), Hugo, Inès ;
 * - « Seul » (C) : Hugo, seul membre.
 * Hugo est dans les trois. Marie n'est que dans A : rien de B ne doit lui parvenir.
 */
export async function peupler(base: BaseDeTest) {
  await contenuPublic(base);
  const marie = await nouveauJoueur(base, 'Marie-A7Q2', 'M');
  const paul = await nouveauJoueur(base, 'Paul-A7Q2', 'P');
  const hugo = await nouveauJoueur(base, 'Hugo-Trace7Q2', 'H');
  const lea = await nouveauJoueur(base, 'Lea-B7Q2', 'L');
  const ines = await nouveauJoueur(base, 'Ines-B7Q2', 'I');

  const a = await creerCercle(base, marie, 'Famille-A7Q2');
  const invPaul = await inviter(base, a, marie);
  await entrer(base, a, invPaul, paul);
  const invHugoA = await inviter(base, a, marie);
  await entrer(base, a, invHugoA, hugo);

  const b = await creerCercle(base, lea, 'Amis-B7Q2');
  const invHugoB = await inviter(base, b, lea);
  await entrer(base, b, invHugoB, hugo);
  const invInes = await inviter(base, b, lea);
  await entrer(base, b, invInes, ines);
  const invEnAttenteB = await inviter(base, b, lea); // pas encore ouvert

  const c = await creerCercle(base, hugo, 'Seul-Trace7Q2');

  // Les réponses : les trois textes d'entrée et deux textes du jour, pour chacun.
  const positions: Record<string, ReponseClaire> = {};
  for (const [i, j] of [marie, paul, hugo, lea, ines].entries()) {
    await commeJoueur(base, j.id, async (cl) => {
      for (const t of ['T01', 'T02', 'T03']) await repondre(cl, j, t, { position: 3, raison: 1 }, 'entree');
      for (const t of ['T04', 'T05']) {
        const r: ReponseClaire = { position: ((i % 5) + 1) as ReponseClaire['position'], raison: (i % 2 === 0 ? 0 : 2) as ReponseClaire['raison'] };
        positions[`${j.pseudo}:${t}`] = r;
        await repondre(cl, j, t, r, 'jour');
      }
    });
  }

  // La journée du mardi : Marie devine dans A, Léa devine dans B (texte T04 du lundi).
  const mancheA = randomUUID();
  const cartesA = [randomUUID(), randomUUID()];
  await commeJoueur(base, marie.id, async (cl) => {
    await cl.query('INSERT INTO manche (id, cercle_id, devineur_membre_id, jour, texte_id) VALUES ($1, $2, $3, $4, $5)',
      [mancheA, a.id, a.membres.get(marie.id), JOURS.mardi, 'T04']);
    await cl.query(`INSERT INTO carte (id, manche_id, cercle_id, ordre, auteur_membre_id, qui_et_pourquoi, visage_membre_id)
      VALUES ($1, $2, $3, 1, $4, false, $5), ($6, $2, $3, 2, $5, true, $4)`,
      [cartesA[0], mancheA, a.id, a.membres.get(paul.id), a.membres.get(hugo.id), cartesA[1]]);
    await cl.query('UPDATE manche SET validee = true WHERE id = $1', [mancheA]);
    await cl.query(`INSERT INTO journee_cercle (cercle_id, jour, eveille) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`, [a.id, JOURS.mardi]);
    await cl.query(`INSERT INTO compte_semaine (cercle_id, membre_id, semaine, points) VALUES ($1, $2, $3, 1)
      ON CONFLICT (membre_id, semaine) DO UPDATE SET points = compte_semaine.points + 1`, [a.id, a.membres.get(marie.id), JOURS.dimanche]);
    await cl.query(`INSERT INTO compte_texte_cercle (cercle_id, texte_id, attributions, fausses) VALUES ($1, 'T04', 2, 1)
      ON CONFLICT DO NOTHING`, [a.id]);
    await cl.query("INSERT INTO vu (joueur_id, objet, cercle_id) VALUES ($1, 'arrivee', $2) ON CONFLICT DO NOTHING",
      [marie.id, a.id]);
    await cl.query('INSERT INTO portrait_dimanche (joueur_id, jour, nettes) VALUES ($1, $2, 3)', [marie.id, JOURS.dimanche]);
    await cl.query('INSERT INTO repondre_ouvert (joueur_id, texte_id, ouvert_le) VALUES ($1, $2, now()) ON CONFLICT DO NOTHING',
      [marie.id, 'T06']);
    await cl.query('UPDATE manche SET cercle_regarde = true WHERE id = $1', [mancheA]);
  });
  const mancheB = randomUUID();
  const cartesB = [randomUUID(), randomUUID()];
  await commeJoueur(base, lea.id, async (cl) => {
    await cl.query('INSERT INTO manche (id, cercle_id, devineur_membre_id, jour, texte_id) VALUES ($1, $2, $3, $4, $5)',
      [mancheB, b.id, b.membres.get(lea.id), JOURS.mardi, 'T04']);
    // La carte « qui et pourquoi » d'Inès, où Léa a posé le visage de Hugo et deviné la raison de rang 2 : le
    // « pourquoi » est chiffré, lié à sa carte (correction 2).
    await cl.query(`INSERT INTO carte (id, manche_id, cercle_id, ordre, auteur_membre_id, qui_et_pourquoi, visage_membre_id, pourquoi)
      VALUES ($1, $2, $3, 1, $4, false, $5, NULL), ($6, $2, $3, 2, $5, true, $4, $7)`,
      [cartesB[0], mancheB, b.id, b.membres.get(hugo.id), b.membres.get(ines.id), cartesB[1],
        chiffrerPourquoi(CLE_REPONSES_TEST, cartesB[1] ?? '', 2)]);
    await cl.query(`INSERT INTO journee_cercle (cercle_id, jour, eveille) VALUES ($1, $2, true) ON CONFLICT DO NOTHING`, [b.id, JOURS.mardi]);
    await cl.query(`INSERT INTO compte_semaine (cercle_id, membre_id, semaine, points) VALUES ($1, $2, $3, 2)
      ON CONFLICT (membre_id, semaine) DO NOTHING`, [b.id, b.membres.get(lea.id), JOURS.dimanche]);
    await cl.query(`INSERT INTO compte_texte_cercle (cercle_id, texte_id, attributions, fausses) VALUES ($1, 'T04', 2, 2)
      ON CONFLICT DO NOTHING`, [b.id]);
    await cl.query("INSERT INTO vu (joueur_id, objet, cercle_id) VALUES ($1, 'cercle_lance', $2) ON CONFLICT DO NOTHING", [lea.id, b.id]);
    await cl.query("INSERT INTO reprise_revelation (joueur_id, jour, etape) VALUES ($1, $2, 'etape-B7Q2') ON CONFLICT DO NOTHING", [lea.id, JOURS.mardi]);
  });

  // Les titres du dimanche, et des tempéraments.
  const titres = { devinA: randomUUID(), devinB: randomUUID(), fideleB: randomUUID(), surpriseB: randomUUID(), pasDeCoteB: randomUUID() };
  const temperaments = { mesureHugo: randomUUID(), originalHugoB: randomUUID(), pontLeaB: randomUUID() };
  await commeJoueur(base, marie.id, (cl) => cl.query(
    "INSERT INTO titre (id, cercle_id, sorte, jour, membre_id) VALUES ($1, $2, 'devin', $3, $4)",
    [titres.devinA, a.id, JOURS.dimanche, a.membres.get(hugo.id)]));
  await commeJoueur(base, lea.id, async (cl) => {
    await cl.query(`INSERT INTO titre (id, cercle_id, sorte, jour, membre_id, texte_id) VALUES
      ($1, $5, 'devin', $6, $7, NULL), ($2, $5, 'fidele', $6, $8, NULL), ($3, $5, 'surprise', $6, NULL, 'T04'),
      ($4, $5, 'pas_de_cote', $6, $7, 'T05')`,
      [titres.devinB, titres.fideleB, titres.surpriseB, titres.pasDeCoteB, b.id, JOURS.dimanche, b.membres.get(hugo.id), b.membres.get(ines.id)]);
    await cl.query(`INSERT INTO temperament (id, sorte, cercle_id, membre_id, depuis) VALUES
      ($1, 'original', $3, $4, $5), ($2, 'pont', $3, $6, $5)`,
      [temperaments.originalHugoB, temperaments.pontLeaB, b.id, b.membres.get(hugo.id), JOURS.dimanche, b.membres.get(lea.id)]);
    await cl.query("UPDATE journee_cercle SET titres_calcules = true WHERE cercle_id = $1", [b.id]);
  });
  await commeJoueur(base, hugo.id, (cl) => cl.query(
    "INSERT INTO temperament (id, sorte, joueur_id, depuis) VALUES ($1, 'mesure', $2, $3)",
    [temperaments.mesureHugo, hugo.id, JOURS.dimanche]));

  // Le message de 18h : un envoi par abonnement, le mardi.
  const envois: Record<string, string> = {};
  await enTransaction(base.module('envoi'), {}, async (cl) => {
    for (const j of [marie, paul, hugo, lea, ines]) {
      envois[j.pseudo] = randomUUID();
      await cl.query(`INSERT INTO envoi (id, abonnement_id, sorte, jour, envoye_a, reponse_code) VALUES ($1, $2, 'soir', $3, now(), 200)
        ON CONFLICT DO NOTHING`, [envois[j.pseudo], j.abonnement, JOURS.mardi]);
    }
  });
  // Un code e-mail en cours ; une connexion par Google en cours et son code de retour (Hugo) ; Inès a coupé le message.
  const connexion = { id: randomUUID(), nonce: 'nonce-Trace7Q2-0123456789', etat: 'etat-Trace7Q2-0123456789',
    verificateur: 'verif-Trace7Q2-' + 'v'.repeat(40), defi: 'defi-Trace7Q2-' + 'd'.repeat(29), codeRetour: empreinteDe('retour-hugo') };
  await enTransaction(base.module('comptes'), {}, async (cl) => {
    await cl.query(
      "INSERT INTO code_email (id, empreinte_adresse, empreinte_code, cree_le, expire_le) VALUES ($1, $2, $3, now(), now() + interval '15 minutes')",
      [randomUUID(), empreinteDe('traceur-7q2@exemple.invalid'), empreinteDe('code-123456')]);
    await cl.query(`INSERT INTO connexion_en_cours (id, voie, but, nonce, etat_google, verificateur_google, defi, joueur_id, expire_le)
      VALUES ($1, 'google', 'connexion', $2, $3, $4, $5, $6, now() + interval '10 minutes')`,
    [connexion.id, connexion.nonce, connexion.etat, connexion.verificateur, connexion.defi, hugo.id]);
    await cl.query("INSERT INTO code_retour (empreinte, defi, joueur_id, expire_le) VALUES ($1, $2, $3, now() + interval '1 minute')",
      [connexion.codeRetour, connexion.defi, hugo.id]);
  });
  await commeJoueur(base, ines.id, (cl) => cl.query('INSERT INTO message_coupe (joueur_id) VALUES ($1) ON CONFLICT DO NOTHING', [ines.id]));
  // Le ménage du lundi est passé (migration 0004).
  await base.module('menage').query("INSERT INTO tache_du_jour (tache, jour) VALUES ('menage', $1) ON CONFLICT DO NOTHING", [JOURS.lundi]);
  // Les totaux, le mardi à midi (la semaine du dimanche 25 n'est pas close : migration 0003).
  await commeJoueur(base, marie.id, async (cl) => {
    await cl.query("SELECT ajouter_compteur('ipad', $1)", [JOURS.mardi]);
    await cl.query("SELECT ajouter_histogramme($1, 2::smallint)", [JOURS.dimanche]);
    await cl.query("SELECT ajouter_mesure($1, 'justesse_cartes', 1, 2)", [JOURS.dimanche]);
  }, undefined, new Date(MARDI_MIDI));

  return {
    marie, paul, hugo, lea, ines, a, b, c, positions, mancheA, mancheB, cartesA, cartesB, titres, temperaments, envois, connexion,
    invitations: { invPaul, invHugoA, invHugoB, invInes, invEnAttenteB },
  };
}

/** Tout ce qu'un module voit, table par table, sous une déclaration. Une table refusée par ses droits donne « refus ». */
export async function toutCeQuIlVoit(base: BaseDeTest, module: ModuleOuProprietaire, tables: string[],
  qui: { joueur?: string; jeton?: string } = {}): Promise<Record<string, unknown[] | 'refus'>> {
  const sortie: Record<string, unknown[] | 'refus'> = {};
  for (const t of tables) {
    try {
      sortie[t] = await enTransaction(base.module(module), qui, async (c) => (await c.query(`SELECT * FROM "${t}"`)).rows);
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && e.code === '42501') sortie[t] = 'refus';
      else throw e;
    }
  }
  return sortie;
}

/** Le contenu brut de toute la base, vu par l'administrateur (qui échappe aux règles). */
export async function toutLeContenu(base: BaseDeTest, tables: string[]): Promise<string> {
  const morceaux: string[] = [];
  for (const t of tables) {
    const r = await base.admin.query(`SELECT * FROM "${t}"`);
    morceaux.push(`${t}: ${JSON.stringify(r.rows, (_k, v: unknown) => (v && typeof v === 'object' && 'type' in v && v.type === 'Buffer' ? 'octets' : v))}`);
  }
  return morceaux.join('\n');
}
