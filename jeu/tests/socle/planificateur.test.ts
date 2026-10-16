// Le planificateur sur une base d'essai (src/serveur/planificateur.ts ; DECISIONS-TECHNIQUES 1.13), avec l'horloge
// réglable et un faux envoyeur : à 18h, un message par abonnement actif (le message coupé respecté, la pause non) ;
// jamais deux fois ; redémarré à 18h00m30, il rattrape ; après 18h30, plus rien ; deux serveurs en même temps : un seul
// envoie ; un abonnement refusé par Apple est retiré ; deux abonnements au même jeton d'appareil : un seul message ;
// « message envoyé » et « message reçu » comptés par jour, sans le joueur qui a refusé qu'on compte ses gestes. Puis
// le ménage : une fois par jour, à partir de 4h, jamais de 17h30 à 18h30, jamais deux fois en même temps.

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { menageDuJour } from '../../src/base/menage.ts';
import { enTransaction } from '../../src/base/connexion.ts';
import type { MessageApns } from '../../src/contrat.ts';
import type { EnvoyeurApns, ResultatApns } from '../../src/serveur/apns.ts';
import { lireConfig } from '../../src/serveur/config.ts';
import { horlogeReglable, instantParis } from '../../src/serveur/horloge.ts';
import { creerJournal } from '../../src/serveur/journal.ts';
import { creerPlanificateur, type Planificateur } from '../../src/serveur/planificateur.ts';
import { creerRoutes } from '../../src/serveur/routes.ts';
import { baseDeTest, commeJoueur, contenuPublic, nouveauJoueur, peupler, type BaseDeTest, type Joueur, type Monde } from './aides.ts';
import { envDeTest } from './aides-serveur.ts';

type Envoye = { jeton: string; message: MessageApns };

function fauxEnvoyeur(refuses: Set<string> = new Set()) {
  const envoyes: Envoye[] = [];
  const e: EnvoyeurApns = {
    async envoyer(jeton, message): Promise<ResultatApns> {
      envoyes.push({ jeton, message });
      await new Promise((r) => setTimeout(r, 5)); // le temps d'un aller et retour chez Apple
      return refuses.has(jeton) ? { statut: 410, raison: 'Unregistered', retirer: true } : { statut: 200, raison: null, retirer: false };
    },
    fermer() {},
  };
  return { e, envoyes };
}

const a18h = (jour: string, secondes = 0) => new Date(instantParis(jour, 18, 0).getTime() + secondes * 1000);

describe('le message de 18h', () => {
  let base: BaseDeTest;
  let m: Monde;
  const lignes: string[] = [];
  const journal = creerJournal((t) => lignes.push(t));
  let tous: Joueur[];

  before(async () => {
    base = await baseDeTest('roles');
    m = await peupler(base);
    tous = [m.marie, m.paul, m.hugo, m.lea, m.ines];
  });
  after(async () => { await base?.fin(); });

  const planificateur = (horloge: ReturnType<typeof horlogeReglable>, e: EnvoyeurApns | null): Planificateur =>
    creerPlanificateur({ pools: { envoi: base.module('envoi'), menage: base.module('menage') }, envoyeur: e, horloge, journal });
  const compteur = async (sorte: string, jour: string) => Number((await base.admin.query<{ n: number }>(
    'SELECT nombre AS n FROM compteur WHERE sorte = $1 AND jour = $2', [sorte, jour])).rows[0]?.n ?? 0);
  const envoisDuJour = async (jour: string) => (await base.admin.query<{ abonnement_id: string }>(
    "SELECT abonnement_id FROM envoi WHERE sorte = 'soir' AND jour = $1", [jour])).rows.map((l) => l.abonnement_id);

  test('à 18h : un message par abonnement actif, le texte de l’étape 1 ; pas avant ; jamais deux fois ; rattrapé jusqu’à 18h30', async () => {
    const jour = '2026-10-22';
    const horloge = horlogeReglable(a18h(jour, -1));
    const { e, envoyes } = fauxEnvoyeur();
    const p = planificateur(horloge, e);
    await p.tic();
    assert.equal(envoyes.length, 0, '17:59:59');
    horloge.regler(a18h(jour));
    await p.tic();
    // Inès a coupé le message (D-029) ; les quatre autres le reçoivent (un joueur en pause aussi : le planificateur
    // ne regarde pas la pause, D-029).
    assert.deepEqual(envoyes.map((x) => x.jeton).sort(), [m.marie, m.paul, m.hugo, m.lea].map((j) => j.jeton).sort());
    for (const x of envoyes) {
      assert.equal(x.message.aps.alert.body, '18h. La question d’aujourd’hui t’attend.');
      assert.match(x.message.envoi, /^[0-9a-f-]{36}$/);
    }
    assert.equal(new Set(envoyes.map((x) => x.message.envoi)).size, 4);
    assert.equal(await compteur('message_envoye', jour), 4);
    horloge.regler(a18h(jour, 15));
    await p.tic();
    assert.equal(envoyes.length, 4, 'jamais deux fois');
    // Un autre serveur, démarré à 18h00m30 : tout est déjà parti.
    const autre = fauxEnvoyeur();
    await planificateur(horlogeReglable(a18h(jour, 30)), autre.e).tic();
    assert.equal(autre.envoyes.length, 0);
    // Un abonnement pris à 18h10 est rattrapé ; un autre, pris à 18h30, attend le lendemain.
    const zoe = await nouveauJoueur(base, 'Zoe-Q7', 'Z');
    horloge.regler(a18h(jour, 600));
    await p.tic();
    assert.equal(envoyes.at(-1)?.jeton, zoe.jeton);
    const yann = await nouveauJoueur(base, 'Yann-Q7', 'Y');
    horloge.regler(a18h(jour, 1800));
    await p.tic();
    assert.ok(!envoyes.some((x) => x.jeton === yann.jeton), 'après 18h30, plus rien');
    tous.push(zoe, yann);
    assert.equal((await envoisDuJour(jour)).length, 5);
  });

  test('redémarré à 18h00m30, il envoie ce qui n’est pas parti ; après 18h30, il ne fait rien', async () => {
    const { e, envoyes } = fauxEnvoyeur();
    await planificateur(horlogeReglable(a18h('2026-10-23', 30)), e).tic();
    assert.equal(envoyes.length, 6); // tous sauf Inès
    const tard = fauxEnvoyeur();
    await planificateur(horlogeReglable(a18h('2026-10-24', 1801)), tard.e).tic();
    assert.equal(tard.envoyes.length, 0);
    assert.deepEqual(await envoisDuJour('2026-10-24'), []);
  });

  test('deux serveurs en même temps (une mise en ligne) : chaque abonnement reçoit un seul message', async () => {
    const jour = '2026-10-25'; // dimanche, passage à l'heure d'hiver : 18h à Paris = 17h UTC
    assert.equal(a18h(jour).toISOString(), '2026-10-25T17:00:00.000Z');
    const un = fauxEnvoyeur();
    const deux = fauxEnvoyeur();
    await Promise.all([planificateur(horlogeReglable(a18h(jour)), un.e).tic(), planificateur(horlogeReglable(a18h(jour)), deux.e).tic()]);
    const jetons = [...un.envoyes, ...deux.envoyes].map((x) => x.jeton);
    assert.equal(jetons.length, 6);
    assert.equal(new Set(jetons).size, 6);
    const ab = await envoisDuJour(jour);
    assert.equal(ab.length, 6);
    assert.equal(new Set(ab).size, 6);
  });

  test('Apple refuse un abonnement (410) : il est retiré ; deux abonnements au même jeton d’appareil : un seul message', async () => {
    const jour = '2026-10-26';
    // Marie a un second appareil… qui porte le même jeton (deux sessions sur un même iPhone).
    const session = randomUUID();
    await enTransaction(base.module('comptes'), {}, (c) => c.query(
      "INSERT INTO session (id, empreinte, joueur_id, expire_le) VALUES ($1, $2, $3, now() + interval '30 days')",
      [session, 'a'.repeat(64), m.marie.id]));
    await commeJoueur(base, m.marie.id, (c) => c.query('INSERT INTO abonnement (id, joueur_id, session_id, jeton) VALUES ($1, $2, $3, $4)',
      [randomUUID(), m.marie.id, session, m.marie.jeton]));
    const { e, envoyes } = fauxEnvoyeur(new Set([m.hugo.jeton]));
    await planificateur(horlogeReglable(a18h(jour)), e).tic();
    assert.equal(envoyes.filter((x) => x.jeton === m.marie.jeton).length, 1);
    assert.equal((await base.admin.query('SELECT 1 FROM abonnement WHERE joueur_id = $1', [m.hugo.id])).rowCount, 0, 'retiré');
    assert.ok(lignes.some((l) => l.includes('"detail":"abonnement retire"') && l.includes('"statut":410')));
    assert.equal(await compteur('message_envoye', jour), 5); // 6 messages, dont un refusé
  });

  test('« message envoyé » et « message reçu » : comptés une fois, par jour, sans le joueur qui a refusé qu’on compte ses gestes', async () => {
    const jour = '2026-10-27';
    await commeJoueur(base, m.paul.id, (c) => c.query('INSERT INTO mesures_refusees (joueur_id) VALUES ($1)', [m.paul.id]));
    const { e, envoyes } = fauxEnvoyeur();
    await planificateur(horlogeReglable(a18h(jour)), e).tic();
    assert.equal(envoyes.length, 5);
    assert.equal(await compteur('message_envoye', jour), 4, 'Paul n’est pas compté');
    const { recu } = creerRoutes({
      pools: { jeu: base.module('jeu'), comptes: base.module('comptes'), envoi: base.module('envoi') },
      config: lireConfig(envDeTest()), verificateur: null, journal,
    });
    const recuLe = a18h(jour, 4);
    for (const x of envoyes) await recu({ envoi: x.message.envoi }, recuLe);
    for (const x of envoyes) await recu({ envoi: x.message.envoi }, recuLe); // une seconde fois : rien de plus
    await recu({ envoi: randomUUID() }, recuLe);
    await recu({ envoi: 'pas-un-numero' }, recuLe);
    await recu(null, recuLe);
    assert.equal(await compteur('message_recu', jour), 4);
    const r = await base.admin.query<{ n: string }>("SELECT count(*)::text AS n FROM envoi WHERE jour = $1 AND recu_a = $2", [jour, recuLe]);
    assert.equal(Number(r.rows[0]?.n), 5, 'l’heure de réception est celle du serveur');
  });

  test('le journal du planificateur : ni jeton d’appareil, ni identifiant, ni numéro d’envoi, ni texte', () => {
    const tout = lignes.join('');
    for (const j of tous) for (const v of [j.jeton, j.id, j.pseudo, j.abonnement]) assert.ok(!tout.includes(v), v);
    assert.ok(!tout.includes('question'));
    assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-/.test(tout));
    assert.ok(lignes.some((l) => l.includes('"detail":"soir fini"')));
  });
});

describe('le ménage quotidien', () => {
  let base: BaseDeTest;
  const lignes: string[] = [];
  const journal = creerJournal((t) => lignes.push(t));
  const a = (jour: string, h: number, mn = 0) => instantParis(jour, h, mn);
  const taches = async () => (await base.admin.query<{ jour: string }>("SELECT jour::text AS jour FROM tache_du_jour WHERE tache = 'menage' ORDER BY jour"))
    .rows.map((l) => l.jour);
  const passes = () => lignes.filter((l) => l.includes('"detail":"echeances effacees"')).length;

  before(async () => {
    base = await baseDeTest('roles');
    await contenuPublic(base);
  });
  after(async () => { await base?.fin(); });

  const planificateur = (horloge: ReturnType<typeof horlogeReglable>) =>
    creerPlanificateur({ pools: { envoi: base.module('envoi'), menage: base.module('menage') }, envoyeur: null, horloge, journal });

  test('à 4h, une fois par jour ; pas avant ; un serveur redémarré dans la journée ne le refait pas', async () => {
    const horloge = horlogeReglable(a('2026-11-02', 3, 59));
    const p = planificateur(horloge);
    await p.tic();
    assert.deepEqual(await taches(), []);
    horloge.regler(a('2026-11-02', 4, 0));
    await p.tic();
    assert.deepEqual(await taches(), ['2026-11-02']);
    assert.equal(passes(), 1);
    horloge.regler(a('2026-11-02', 4, 1));
    await p.tic();
    await planificateur(horlogeReglable(a('2026-11-02', 10, 0))).tic();
    assert.equal(passes(), 1);
    assert.ok(lignes.some((l) => l.includes('"detail":"menage deja passe"')));
  });

  test('jamais de 17h30 à 18h30 : un serveur arrêté toute la journée attend le lendemain 4h', async () => {
    for (const [h, mn] of [[17, 30], [17, 45], [18, 15], [23, 0]] as const) await planificateur(horlogeReglable(a('2026-11-03', h, mn))).tic();
    assert.ok(!(await taches()).includes('2026-11-03'));
    // Arrêté jusqu'à 11h : il le fait dès son démarrage.
    await planificateur(horlogeReglable(a('2026-11-04', 11, 0))).tic();
    assert.ok((await taches()).includes('2026-11-04'));
  });

  test('deux serveurs en même temps : un seul ménage ; la ligne de plus de 7 jours part', async () => {
    const jour = '2026-11-12';
    const r = await Promise.all([1, 2, 3].map(() => menageDuJour(base.module('menage'), a(jour, 4), jour, journal)));
    assert.equal(r.filter((x) => x !== null).length, 1);
    assert.deepEqual(await taches(), ['2026-11-12'], 'les lignes du 2 et du 4 novembre ont plus de 7 jours');
  });

  test('seul le module du ménage écrit la tâche du jour', async () => {
    await assert.rejects(menageDuJour(base.module('jeu'), a('2026-11-13', 4), '2026-11-13'), (e: unknown) => (e as { code?: string }).code === '42501');
  });
});
