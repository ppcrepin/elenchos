// Le serveur HTTP de l'étape 1 (src/serveur/serveur.ts, routes.ts ; CONTRAT.md, parties 1, 2.1, 2.12, 2.13, 4 et 6),
// sur une base d'essai : CORS et origine, enveloppe et en-têtes, rien après « ? », corps vérifiés, routes pas encore
// construites, version minimale (426, jamais sur GET /api/etat), jeton de session (absent, faux, échu, prolongé une
// fois par jour, fermé), l'état minimal d'un joueur sans cercle, l'abonnement au message, le message coupé, et un
// journal sans aucune valeur de joueur.

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { enTransaction } from '../../src/base/connexion.ts';
import { ouvrirSession } from '../../src/serveur/sessions.ts';
import { ORIGINE_APPLICATION } from '../../src/serveur/serveur.ts';
import { baseDeTest, peupler, type BaseDeTest, type Monde } from './aides.ts';
import { ADRESSE_PUBLIQUE, serveurDeTest, type ServeurDeTest } from './aides-serveur.ts';

const MARDI_15H = new Date('2026-10-20T13:00:00Z'); // mardi 20 octobre 2026, 15h à Paris
const CLES_ETAT = ['accordAJour', 'annonces', 'defi', 'message', 'parcours', 'revelationAOuvrir', 'session', 'voies'];
const JETON_APPAREIL = 'f'.repeat(63) + 'a';

describe('le serveur HTTP de l’étape 1', () => {
  let base: BaseDeTest;
  let m: Monde;
  let s: ServeurDeTest;
  /** Une session de compte ouverte pour un joueur du monde inventé ; rend le jeton que l'application garderait. */
  const sessionDe = (joueur: string, expire = new Date(MARDI_15H.getTime() + 30 * 86_400_000), serveur = s) =>
    enTransaction(base.module('comptes'), {}, (c) => ouvrirSession(c, serveur.config.secretSession as Buffer, joueur, expire));
  const echeance = async (joueur: string) => (await base.admin.query<{ e: Date }>(
    'SELECT max(expire_le) AS e FROM session WHERE joueur_id = $1', [joueur])).rows[0]?.e;

  before(async () => {
    base = await baseDeTest('roles');
    m = await peupler(base);
    s = await serveurDeTest(base, MARDI_15H, { FABRICATION_MINIMALE: '5' });
  });
  after(async () => {
    await s?.fin();
    await base?.fin();
  });

  test('CORS : la demande préalable de l’application reçoit les seules méthodes et en-têtes du contrat', async () => {
    const r = await s.demande('OPTIONS', '/api/abonnement', { entetes: {
      'access-control-request-method': 'POST', 'access-control-request-headers': 'authorization, content-type, elenchos-fabrication',
    } });
    assert.equal(r.statut, 204);
    assert.equal(r.entetes['access-control-allow-origin'], ORIGINE_APPLICATION);
    assert.equal(r.entetes['access-control-allow-methods'], 'GET, POST');
    assert.equal(r.entetes['access-control-allow-headers'], 'Authorization, Content-Type, Elenchos-Fabrication');
    assert.equal(r.entetes['access-control-allow-credentials'], undefined);
    for (const [origine, methode, entetes] of [
      ['https://autre.exemple.invalid', 'POST', 'content-type'], [ORIGINE_APPLICATION, 'PUT', 'content-type'],
      [ORIGINE_APPLICATION, 'POST', 'content-type, x-autre'], [ADRESSE_PUBLIQUE, 'POST', 'content-type'],
    ] as const) {
      const refus = await s.demande('OPTIONS', '/api/abonnement', { origine, entetes: {
        'access-control-request-method': methode, 'access-control-request-headers': entetes } });
      assert.equal(refus.statut, 403, `${origine} ${methode} ${entetes}`);
      assert.equal(refus.json?.erreur, 'origine_refusee');
      assert.equal(refus.entetes['access-control-allow-origin'], undefined);
    }
  });

  test('origine : l’application et nos pages passent ; une autre origine, ou aucune, reçoit origine_refusee (sauf POST /api/recu)', async () => {
    const app = await s.demande('GET', '/api/etat');
    assert.equal(app.statut, 200);
    assert.equal(app.entetes['access-control-allow-origin'], ORIGINE_APPLICATION);
    assert.equal((await s.demande('GET', '/api/etat', { origine: ADRESSE_PUBLIQUE })).statut, 200);
    for (const origine of ['https://autre.exemple.invalid', 'null', null]) {
      const r = await s.demande('GET', '/api/etat', { origine });
      assert.equal(r.statut, 403, String(origine));
      assert.equal(r.json.erreur, 'origine_refusee');
      assert.equal(r.entetes['access-control-allow-origin'], undefined);
    }
    assert.equal((await s.demande('POST', '/api/recu', { origine: null, corps: { envoi: randomUUID() } })).statut, 204);
    assert.equal((await s.demande('POST', '/api/recu', { origine: 'https://autre.exemple.invalid', corps: { envoi: randomUUID() } })).statut, 403);
  });

  test('l’enveloppe du contrat, et les en-têtes de sécurité, sur chaque réponse', async () => {
    const r = await s.demande('GET', '/api/etat');
    assert.deepEqual(Object.keys(r.json).sort(), ['donnees', 'fabricationMinimale', 'horloge', 'ok']);
    assert.equal(r.json.ok, true);
    assert.equal(r.json.fabricationMinimale, 5);
    // Le prochain 18h : le mardi 20 octobre 2026 à 18h, heure de Paris (UTC+2).
    assert.deepEqual(r.json.horloge, { instant: MARDI_15H.toISOString(), bascule: '2026-10-20T16:00:00.000Z', vitesse: 1 });
    assert.equal(r.entetes['cache-control'], 'no-store');
    assert.equal(r.entetes['x-content-type-options'], 'nosniff');
    assert.equal(r.entetes['referrer-policy'], 'no-referrer');
    assert.equal(r.entetes['set-cookie'], undefined);
    const e = await s.demande('GET', '/api/aujourdhui');
    assert.deepEqual(Object.keys(e.json).sort(), ['erreur', 'fabricationMinimale', 'horloge', 'ok']);
    assert.equal(e.entetes['cache-control'], 'no-store');
  });

  test('sans session : l’état « dehors », dans la liste fermée de `Etat`', async () => {
    const r = await s.demande('GET', '/api/etat');
    assert.deepEqual(Object.keys(r.json.donnees).sort(), CLES_ETAT);
    assert.deepEqual(r.json.donnees, {
      session: 'aucune', parcours: { etape: 'dehors' }, accordAJour: true, revelationAOuvrir: false, annonces: [], defi: null,
      voies: { apple: true, google: false, email: false }, message: { disponible: true },
    });
  });

  test('une route du contrat pas encore construite, une route /dev/, une adresse inconnue : introuvable (404)', async () => {
    for (const [methode, chemin] of [['GET', '/api/aujourdhui'], ['POST', '/api/repondre'], ['POST', '/dev/horloge'],
      ['GET', '/api/inconnue'], ['GET', '/']] as const) {
      const r = await s.demande(methode, chemin, methode === 'POST' ? { corps: {} } : {});
      assert.equal(r.statut, 404, `${methode} ${chemin}`);
      if (chemin.startsWith('/api/') || chemin.startsWith('/dev/')) assert.equal(r.json.erreur, 'introuvable');
    }
  });

  test('rien après « ? » ; un corps illisible, d’un autre type, trop long ou avec un champ en trop : requete_invalide', async () => {
    const jeton = await sessionDe(m.paul.id);
    assert.equal((await s.demande('GET', '/api/etat?pseudo=x')).json.erreur, 'requete_invalide');
    for (const o of [
      { brut: '{"actif":' }, { brut: '[true]' }, { corps: { actif: true }, type: 'text/plain' }, { corps: { actif: 'oui' } },
      { corps: { actif: true, autre: 1 } }, { corps: {} }, { brut: JSON.stringify({ actif: true, x: 'a'.repeat(17_000) }) },
    ]) {
      const r = await s.demande('POST', '/api/message', { jeton, ...o });
      assert.equal(r.statut, 400, JSON.stringify(o).slice(0, 60));
      assert.equal(r.json.erreur, 'requete_invalide');
    }
  });

  test('la version minimale : 426 sous le numéro réglé, jamais sur GET /api/etat ; sans en-tête, rien n’est exigé', async () => {
    const jeton = await sessionDe(m.paul.id);
    const vieille = await s.demande('POST', '/api/message', { jeton, fabrication: '4', corps: { actif: true } });
    assert.equal(vieille.statut, 426);
    assert.equal(vieille.json.erreur, 'mise_a_jour_requise');
    assert.equal(vieille.json.fabricationMinimale, 5);
    assert.equal((await s.demande('GET', '/api/aujourdhui', { fabrication: '4' })).statut, 426);
    const etat = await s.demande('GET', '/api/etat', { fabrication: '4' });
    assert.equal(etat.statut, 200);
    assert.equal(etat.json.fabricationMinimale, 5);
    assert.equal((await s.demande('GET', '/api/etat', { fabrication: 'pas-un-nombre' })).statut, 200);
    assert.equal((await s.demande('POST', '/api/message', { jeton, fabrication: '5', corps: { actif: true } })).statut, 200);
    assert.equal((await s.demande('POST', '/api/message', { jeton, corps: { actif: true } })).statut, 200);
    assert.equal((await s.demande('POST', '/api/message', { jeton, fabrication: '5a', corps: { actif: true } })).statut, 400);
  });

  test('le jeton de session : absent, inventé, échu ou mal écrit : non_connecte ; valable : accepté', async () => {
    const jeton = await sessionDe(m.paul.id);
    const echu = await sessionDe(m.paul.id, new Date(MARDI_15H.getTime() - 1000));
    for (const j of [undefined, 'x'.repeat(43), echu, `${jeton}x`]) {
      const r = await s.demande('POST', '/api/abonnement', { ...(j === undefined ? {} : { jeton: j }), corps: { jeton: JETON_APPAREIL } });
      assert.equal(r.statut, 401, String(j).slice(0, 8));
      assert.equal(r.json.erreur, 'non_connecte');
    }
    const brut = await s.demande('POST', '/api/abonnement', { corps: { jeton: JETON_APPAREIL }, entetes: { authorization: jeton } });
    assert.equal(brut.statut, 401); // sans « Bearer »
    assert.equal((await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: JETON_APPAREIL } })).statut, 200);
  });

  test('GET /api/etat : un compte sans cercle va à 5.1 (accord pas encore donné) ; un compte dans un cercle, au jeu', async () => {
    const id = randomUUID();
    await base.admin.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'compte', 'Seul-Q7', 'seul-q7', now())", [id]);
    const seul = await s.demande('GET', '/api/etat', { jeton: await sessionDe(id) });
    assert.deepEqual(Object.keys(seul.json.donnees).sort(), CLES_ETAT);
    assert.equal(seul.json.donnees.session, 'compte');
    assert.deepEqual(seul.json.donnees.parcours, { etape: 'nommer_cercle', premierCercle: true });
    assert.equal(seul.json.donnees.accordAJour, false);
    const marie = await s.demande('GET', '/api/etat', { jeton: await sessionDe(m.marie.id) });
    assert.deepEqual(marie.json.donnees.parcours, { etape: 'jeu' });
    assert.equal(marie.json.donnees.accordAJour, true);
  });

  test('l’ouverture prolonge la session de 30 jours, une fois par jour au plus, jamais au-delà de la fin du test', async () => {
    const id = randomUUID();
    await base.admin.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'compte', 'Long-Q7', 'long-q7', now())", [id]);
    const jeton = await sessionDe(id, new Date(MARDI_15H.getTime() + 2 * 86_400_000));
    await s.demande('GET', '/api/etat', { jeton });
    const prolongee = await echeance(id);
    assert.equal(prolongee?.toISOString(), new Date(MARDI_15H.getTime() + 30 * 86_400_000).toISOString());
    s.horloge.avancer(3_600_000); // une heure plus tard : rien ne s'écrit
    await s.demande('GET', '/api/etat', { jeton });
    assert.equal((await echeance(id))?.toISOString(), prolongee?.toISOString());
    // Près de la fin du test (31 mars 2027), l'échéance s'arrête à minuit, heure de Paris.
    s.horloge.regler(new Date('2027-03-20T10:00:00Z'));
    await base.admin.query('UPDATE session SET expire_le = $2 WHERE joueur_id = $1', [id, new Date('2027-03-21T10:00:00Z')]);
    await s.demande('GET', '/api/etat', { jeton });
    assert.equal((await echeance(id))?.toISOString(), '2027-03-31T22:00:00.000Z');
    s.horloge.regler(MARDI_15H);
  });

  test('l’abonnement : un par session ; le même jeton ne change rien ; un nouveau jeton remplace l’ancien sans effacer la ligne', async () => {
    const id = randomUUID();
    await base.admin.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'compte', 'Abo-Q7', 'abo-q7', now())", [id]);
    const jeton = await sessionDe(id);
    assert.equal((await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: 'zz' } })).json.erreur, 'abonnement_invalide');
    assert.equal((await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: 'a'.repeat(63) } })).json.erreur, 'abonnement_invalide');
    const r = await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: JETON_APPAREIL.toUpperCase() } });
    assert.deepEqual(r.json.donnees, { abonne: true });
    const lignes = async () => (await base.admin.query<{ id: string; jeton: string }>('SELECT id, jeton FROM abonnement WHERE joueur_id = $1', [id])).rows;
    const [premiere] = await lignes();
    assert.equal(premiere?.jeton, JETON_APPAREIL); // en minuscules
    await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: JETON_APPAREIL } });
    await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: 'e'.repeat(64) } });
    assert.deepEqual(await lignes(), [{ id: premiere?.id, jeton: 'e'.repeat(64) }]);
  });

  test('sans clé des messages chez l’hébergeur : l’abonnement est indisponible, et l’état le dit', async () => {
    const sans = await serveurDeTest(base, MARDI_15H, { APPLE_CLE_MESSAGES: undefined });
    try {
      assert.equal(sans.config.apns, null);
      assert.ok(sans.config.manquants.includes('APPLE_CLE_MESSAGES'));
      const r = await sans.demande('POST', '/api/abonnement', { jeton: await sessionDe(m.paul.id, undefined, sans), corps: { jeton: JETON_APPAREIL } });
      assert.equal(r.statut, 503);
      assert.equal(r.json.erreur, 'indisponible');
      assert.deepEqual((await sans.demande('GET', '/api/etat')).json.donnees.message, { disponible: false });
    } finally {
      await sans.fin();
    }
  });

  test('couper et rallumer le message de 18h (D-029) ; se déconnecter ferme la session et son abonnement', async () => {
    const id = randomUUID();
    await base.admin.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'compte', 'Coupe-Q7', 'coupe-q7', now())", [id]);
    const jeton = await sessionDe(id);
    const coupe = async () => ((await base.admin.query('SELECT 1 FROM message_coupe WHERE joueur_id = $1', [id])).rowCount ?? 0) > 0;
    assert.deepEqual((await s.demande('POST', '/api/message', { jeton, corps: { actif: false } })).json.donnees, { actif: false });
    assert.equal(await coupe(), true);
    await s.demande('POST', '/api/message', { jeton, corps: { actif: false } });
    assert.deepEqual((await s.demande('POST', '/api/message', { jeton, corps: { actif: true } })).json.donnees, { actif: true });
    assert.equal(await coupe(), false);
    await s.demande('POST', '/api/abonnement', { jeton, corps: { jeton: JETON_APPAREIL } });
    assert.deepEqual((await s.demande('POST', '/api/deconnexion', { jeton })).json.donnees, { deconnecte: true });
    assert.equal((await base.admin.query('SELECT 1 FROM session WHERE joueur_id = $1', [id])).rowCount, 0);
    assert.equal((await base.admin.query('SELECT 1 FROM abonnement WHERE joueur_id = $1', [id])).rowCount, 0);
    assert.equal((await s.demande('GET', '/api/etat', { jeton })).json.donnees.session, 'aucune');
    assert.deepEqual((await s.demande('POST', '/api/deconnexion')).json.donnees, { deconnecte: true });
  });

  test('le limiteur : au-delà de la limite, trop_de_demandes, sans rien garder de la personne', async () => {
    const r: number[] = [];
    for (let i = 0; i < 305; i += 1) r.push((await s.demande('POST', '/api/connexion/debut', { corps: { voie: 'google', but: 'connexion', defi: 'd'.repeat(43) } })).statut);
    assert.ok(r.slice(0, 250).every((x) => x === 503), 'google : indisponible tant que l’étape 2 n’est pas faite');
    assert.equal(r.at(-1), 429);
    s.horloge.avancer(15 * 60_000);
    assert.equal((await s.demande('POST', '/api/connexion/debut', { corps: { voie: 'google', but: 'connexion', defi: 'd'.repeat(43) } })).statut, 503);
    s.horloge.regler(MARDI_15H);
  });

  test('le journal n’a reçu aucune valeur de joueur : ni jeton, ni pseudo, ni jeton d’appareil, ni adresse', async () => {
    const tout = s.journal.join('');
    for (const v of [JETON_APPAREIL, 'e'.repeat(64), 'Seul-Q7', 'Abo-Q7', m.marie.pseudo, m.paul.id, 'pseudo=x', '127.0.0.1']) {
      assert.ok(!tout.includes(v), v);
    }
    for (const l of s.journal) {
      const o = JSON.parse(l) as Record<string, unknown>;
      assert.ok(Object.keys(o).every((k) => ['evenement', 'route', 'statut', 'duree_ms', 'requete', 'erreur', 'detail', 'nombre', 'manquants'].includes(k)));
    }
    assert.ok(s.journal.some((l) => l.includes('"route":"GET /api/aujourdhui"') && l.includes('pas encore construit')));
  });
});
