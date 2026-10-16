// Les briques du serveur qui n'ont pas besoin de base : réglages (config.ts), journal (P-07), chiffrement (P-01, P-02),
// chiffrement de la connexion à la base. Origine : test-18h/tests/sans-base/ (journal, chiffrement-base : REPRIS).

import assert from 'node:assert/strict';
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { chiffrementBase, creerPoolModule } from '../../src/base/connexion.ts';
import { lireConfig, REGLAGES_DANGEREUX } from '../../src/serveur/config.ts';
import {
  b64url, chiffrerPourquoi, chiffrerReponse, dechiffrerPourquoi, dechiffrerReponse, deriverCle, deriverCleIdentite, empreinte,
  empreinteIdentite, LONGUEUR_POURQUOI_CHIFFRE, LONGUEUR_REPONSE_CHIFFREE,
} from '../../src/serveur/crypto.ts';
import { assainir, creerJournal, ROUTES, ROUTES_ALIGNEES, typeErreur, type Ligne } from '../../src/serveur/journal.ts';

const TRACEUR = { email: 'traceur-7q2@exemple.invalid', sub: 'traceur-sub-7Q2', pseudo: 'Traceur-pseudo-7Q2', jeton: 'ab'.repeat(32) };

function envComplet(complements: Record<string, string> = {}): NodeJS.ProcessEnv {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return {
    ADRESSE_PUBLIQUE: 'https://elenchos.exemple.invalid',
    // DATABASE_URL, et non SCALINGO_POSTGRESQL_URL : la seconde marque à elle seule un environnement protégé.
    DATABASE_URL: 'postgresql://inutile@127.0.0.1:1/inutile',
    SECRET_SESSION: b64url(randomBytes(32)),
    CLE_REPONSES: b64url(randomBytes(32)),
    CLE_IDENTITES: b64url(randomBytes(32)),
    APPLE_ID_EQUIPE: 'ABCDE12345',
    APPLE_ID_CLE: 'KEY1234567',
    APPLE_ID_APPLICATION: 'fr.exemple.elenchos',
    APPLE_CLE_PRIVEE: Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()).toString('base64'),
    GOOGLE_ID_CLIENT: 'client-google-de-test.apps.googleusercontent.com',
    GOOGLE_SECRET_CLIENT: 'secret-google-de-test',
    FIN_DU_TEST: '2027-03-31',
    ...complements,
  };
}

test('réglages complets : rien ne manque, le serveur peut démarrer', () => {
  const c = lireConfig(envComplet());
  assert.deepEqual(c.manquants, []);
  assert.deepEqual(c.refuses, []);
  assert.equal(c.peutDemarrer, true);
  assert.equal(c.modeRoles, 'roles');
  assert.equal(c.version, 'local');
});

test('sans base, sans SECRET_SESSION, sans CLE_REPONSES ou sans CLE_IDENTITES (32 octets exactement), le serveur refuse de démarrer (P-02)', () => {
  for (const [nom, signale] of [['DATABASE_URL', 'SCALINGO_POSTGRESQL_URL'], ['SECRET_SESSION', 'SECRET_SESSION'], ['CLE_REPONSES', 'CLE_REPONSES'],
    ['CLE_IDENTITES', 'CLE_IDENTITES']] as const) {
    const env = envComplet();
    delete env[nom];
    const c = lireConfig(env);
    assert.equal(c.peutDemarrer, false, nom);
    assert.ok(c.manquants.includes(signale), nom);
  }
  assert.equal(lireConfig(envComplet({ CLE_REPONSES: b64url(randomBytes(31)) })).peutDemarrer, false);
  assert.equal(lireConfig(envComplet({ CLE_REPONSES: b64url(randomBytes(33)) })).peutDemarrer, false);
  assert.equal(lireConfig(envComplet({ SECRET_SESSION: 'pas+du+base64url' })).peutDemarrer, false);
  assert.equal(lireConfig(envComplet({ CLE_IDENTITES: b64url(randomBytes(31)) })).peutDemarrer, false);
});

test('les trois clés sont distinctes : la même valeur collée deux fois est refusée, signalée par son nom', () => {
  const une = b64url(randomBytes(32));
  for (const [env, signale] of [
    [{ CLE_IDENTITES: une, CLE_REPONSES: une }, 'CLE_IDENTITES'],
    [{ CLE_IDENTITES: une, SECRET_SESSION: une }, 'CLE_IDENTITES'],
    [{ CLE_REPONSES: une, SECRET_SESSION: une }, 'CLE_REPONSES'],
  ] as const) {
    const c = lireConfig(envComplet(env));
    assert.equal(c.peutDemarrer, false, signale);
    assert.ok(c.manquants.includes(signale), signale);
    assert.ok(!JSON.stringify(c.manquants).includes(une));
  }
});

test('en ligne, FIN_DU_TEST est exigée : sans elle, le serveur refuse de démarrer (D-061, point 2) ; en local, elle peut manquer', () => {
  const enLigne = envComplet({ CONTAINER: 'web-1' });
  assert.equal(lireConfig(enLigne).peutDemarrer, true);
  delete enLigne.FIN_DU_TEST;
  const c = lireConfig(enLigne);
  assert.equal(c.enLigne, true);
  assert.equal(c.peutDemarrer, false);
  assert.ok(c.manquants.includes('FIN_DU_TEST'));
  assert.equal(lireConfig(envComplet({ CONTAINER: 'web-1', FIN_DU_TEST: '2027-02-30' })).peutDemarrer, false);
  const local = envComplet();
  delete local.FIN_DU_TEST;
  assert.equal(lireConfig(local).peutDemarrer, true);
});

test('un réglage absent ou illisible est signalé par son nom, jamais par sa valeur ; la fonction qui en dépend est coupée', () => {
  const env = envComplet({ APPLE_ID_EQUIPE: TRACEUR.email, GOOGLE_SECRET_CLIENT: '' });
  const c = lireConfig(env);
  assert.equal(c.apple, null);
  assert.equal(c.google, null);
  assert.equal(c.peutDemarrer, true); // Apple et Google coupés, le reste tourne
  assert.ok(c.manquants.includes('APPLE_ID_EQUIPE'));
  assert.ok(c.manquants.includes('GOOGLE_SECRET_CLIENT'));
  for (const m of c.manquants) assert.match(m, /^[A-Z_]+$/);
  assert.ok(!JSON.stringify([c.manquants, c.refuses]).includes(TRACEUR.email));
});

test('les réglages dangereux sont refusés chez Scalingo et sur GitHub : le serveur ne démarre pas', () => {
  for (const nom of REGLAGES_DANGEREUX) {
    for (const marqueur of ['CONTAINER', 'CI', 'SOURCE_VERSION', 'SCALINGO_POSTGRESQL_URL']) {
      const c = lireConfig(envComplet({ [nom]: 'oui', [marqueur]: 'x' }));
      assert.deepEqual(c.refuses, [nom], `${nom} avec ${marqueur}`);
      assert.equal(c.peutDemarrer, false);
    }
  }
  // En local, ils sont lus.
  const local = lireConfig(envComplet({ HORLOGE_VITESSE: '168', HORLOGE_DEPART: '2026-10-19T15:59:50Z', CODES_ESSAI_LOCAUX: 'marie-1234;paul-5678' }));
  assert.deepEqual(local.refuses, []);
  assert.equal(local.local.horlogeVitesse, 168);
  assert.equal(local.local.horlogeDepart?.toISOString(), '2026-10-19T15:59:50.000Z');
  assert.deepEqual(local.local.codesEssai, ['marie1234', 'paul5678']);
});

test('MODE_ROLES : « roles » par défaut, « repli » sur demande ; toute autre valeur est refusée, jamais prise pour un repli', () => {
  assert.equal(lireConfig(envComplet({ MODE_ROLES: 'repli' })).modeRoles, 'repli');
  const c = lireConfig(envComplet({ MODE_ROLES: 'aucun' }));
  assert.deepEqual(c.refuses, ['MODE_ROLES']);
  assert.equal(c.peutDemarrer, false);
});

test('en ligne, l’adresse publique est exigée en https, jamais déduite de celle de Scalingo', () => {
  const env = envComplet({ CONTAINER: 'web-1', APP: 'elenchos' });
  delete env.ADRESSE_PUBLIQUE;
  const c = lireConfig(env);
  assert.equal(c.enLigne, true);
  assert.equal(c.peutDemarrer, false);
  assert.ok(c.manquants.includes('ADRESSE_PUBLIQUE'));
  assert.ok(!c.adressePublique.includes('scalingo.io'));
  assert.equal(lireConfig(envComplet({ CONTAINER: 'web-1', ADRESSE_PUBLIQUE: 'http://elenchos.exemple.invalid' })).peutDemarrer, false);
});

test('le journal ne garde que ses champs permis, et des valeurs de liste fermée (P-07)', () => {
  const sale = {
    evenement: 'requete', route: `/api/repondre?pseudo=${TRACEUR.pseudo}`, statut: 200, requete: TRACEUR.sub,
    erreur: `Erreur avec ${TRACEUR.email}`, detail: TRACEUR.pseudo, manquants: ['CLE_REPONSES', TRACEUR.email],
    jeton: TRACEUR.jeton, ip: '203.0.113.7',
  } as unknown as Ligne;
  assert.deepEqual(assainir(sale), { evenement: 'requete', route: '(autre)', statut: 200, erreur: 'autre', manquants: ['CLE_REPONSES'] });
  const lignes: string[] = [];
  creerJournal((t) => lignes.push(t)).ecrire(sale);
  const tout = lignes.join('');
  for (const v of Object.values(TRACEUR)) assert.ok(!tout.includes(v));
  assert.ok(!tout.includes('203.0.113.7'));
  assert.deepEqual(assainir({ evenement: 'requete', route: 'POST /api/tout-effacer', statut: 204 }),
    { evenement: 'requete', route: 'POST /api/tout-effacer', statut: 204 });
});

test('le journal connaît chaque route du contrat (vérifié aussi à la compilation), et rien d’autre que les navigations', () => {
  assert.equal(ROUTES_ALIGNEES, true);
  for (const r of ['GET /api/cercles', 'POST /api/revelation/etape', 'POST /api/connexion/debut', 'POST /api/proche',
    'POST /api/rejoindre', 'POST /api/cercle/quitter', 'POST /api/geste', 'GET /api/reglages', 'POST /api/message',
    'GET /api/moi/titres', 'GET /api/moi/historique', 'POST /api/inviter/voir', 'POST /api/recu', 'GET /confidentialite'] as const) {
    assert.equal(assainir({ evenement: 'requete', route: r }).route, r, r);
  }
  // 50 routes de `Routes` sous /api/ et /dev/, plus POST /api/recu : les 51 routes /api/ du contrat et les deux /dev/.
  assert.equal(ROUTES.filter((r) => r.startsWith('GET /api/') || r.startsWith('POST /api/')).length, 51);
  assert.equal(ROUTES.filter((r) => r.includes(' /dev/')).length, 2);
  // Les routes de la version de test qui n'existent plus s'écrivent « (autre) ».
  for (const r of ['POST /api/passage', 'POST /api/cercle/voir?cercle=x', 'GET /api/cercle']) {
    assert.equal(assainir({ evenement: 'requete', route: r as Ligne['route'] }).route, '(autre)', r);
  }
});

test('le type d’une erreur, jamais son message ; nos refus de la base gardent leur code « EL… »', () => {
  assert.equal(typeErreur(Object.assign(new Error(`clé ${TRACEUR.email} en double`), { code: '23505' })), '23505');
  assert.equal(typeErreur(Object.assign(new Error('reponse sans accord (P-34)'), { code: 'EL034' })), 'EL034');
  assert.equal(typeErreur(new TypeError(TRACEUR.email)), 'TypeError');
  assert.equal(typeErreur(Object.assign(new Error('x'), { code: TRACEUR.email })), 'Error');
  assert.equal(typeErreur(TRACEUR.email), 'autre');
});

test('réponses chiffrées (P-02) : longueur fixe, deux chiffrés différents pour la même réponse, liés à leur ligne', () => {
  const cle = randomBytes(32);
  const joueur = '8f3c0000-0000-4000-8000-000000000001';
  const a = chiffrerReponse(cle, joueur, 'T04', { position: 2, raison: 0 });
  const b = chiffrerReponse(cle, joueur, 'T04', { position: 2, raison: 0 });
  assert.equal(a.length, LONGUEUR_REPONSE_CHIFFREE);
  assert.notDeepEqual(a, b);
  assert.deepEqual(dechiffrerReponse(cle, joueur, 'T04', a), { position: 2, raison: 0 });
  assert.equal(dechiffrerReponse(cle, joueur, 'T05', a), null); // recopiée sur un autre texte
  assert.equal(dechiffrerReponse(cle, '8f3c0000-0000-4000-8000-000000000002', 'T04', a), null); // sur un autre joueur
  assert.equal(dechiffrerReponse(randomBytes(32), joueur, 'T04', a), null); // une autre clé
  const altere = Buffer.from(a);
  altere[30] = (altere[30] ?? 0) ^ 1;
  assert.equal(dechiffrerReponse(cle, joueur, 'T04', altere), null);
  assert.throws(() => chiffrerReponse(cle, joueur, 'T04', { position: 6 as 1, raison: 0 }), RangeError);
  // Toutes les réponses ont la même longueur : la taille ne dit rien.
  const tailles = new Set([1, 2, 3, 4, 5].flatMap((p) => [0, 1, 2, 3, 4].map((r) =>
    chiffrerReponse(cle, joueur, 'T04', { position: p as 1, raison: r as 0 }).length)));
  assert.deepEqual([...tailles], [LONGUEUR_REPONSE_CHIFFREE]);
});

test('empreintes avec clé (P-01) : une clé par usage, jamais celles du test de 18h ; les identités, de leur seule clé', () => {
  const secret = randomBytes(32);
  const cleIdentites = randomBytes(32);
  assert.notDeepEqual(deriverCle(secret, 'tirage'), deriverCle(secret, 'session'));
  const e = empreinteIdentite(cleIdentites, 'adresse', TRACEUR.email);
  assert.match(e, /^[0-9a-f]{64}$/);
  assert.notEqual(e, empreinteIdentite(cleIdentites, 'identite', TRACEUR.email));
  assert.notEqual(e, empreinteIdentite(randomBytes(32), 'adresse', TRACEUR.email));
  // Une même valeur dans les deux réglages ne donne jamais la même clé : les étiquettes diffèrent.
  assert.notDeepEqual(deriverCleIdentite(secret, 'identite'), deriverCle(secret, 'session'));
  assert.notEqual(empreinteIdentite(secret, 'identite', TRACEUR.sub), empreinte(secret, 'session', TRACEUR.sub));
  // Changer SECRET_SESSION ne change aucune empreinte d'identité : les comptes restent retrouvables.
  const avant = lireConfig(envComplet({ CLE_IDENTITES: b64url(cleIdentites) }));
  const apres = lireConfig(envComplet({ CLE_IDENTITES: b64url(cleIdentites) }));
  assert.notDeepEqual(avant.secretSession, apres.secretSession);
  assert.ok(avant.cleIdentites && apres.cleIdentites);
  assert.equal(empreinteIdentite(avant.cleIdentites, 'identite', TRACEUR.sub), empreinteIdentite(apres.cleIdentites, 'identite', TRACEUR.sub));
});

test('le « pourquoi » d’une carte est chiffré (correction 2) : longueur fixe, deux chiffrés différents, lié à sa carte', () => {
  const cle = randomBytes(32);
  const carte = '8f3c0000-0000-4000-8000-0000000000c1';
  const a = chiffrerPourquoi(cle, carte, 2);
  const b = chiffrerPourquoi(cle, carte, 2);
  assert.equal(a.length, LONGUEUR_POURQUOI_CHIFFRE);
  assert.equal(LONGUEUR_POURQUOI_CHIFFRE, 30);
  assert.notDeepEqual(a, b);
  assert.equal(dechiffrerPourquoi(cle, carte, a), 2);
  assert.equal(dechiffrerPourquoi(cle, carte, b), 2);
  assert.equal(dechiffrerPourquoi(cle, '8f3c0000-0000-4000-8000-0000000000c2', a), null); // recopié sur une autre carte
  assert.equal(dechiffrerPourquoi(randomBytes(32), carte, a), null); // une autre clé
  const altere = Buffer.from(a);
  altere[29] = (altere[29] ?? 0) ^ 1;
  assert.equal(dechiffrerPourquoi(cle, carte, altere), null);
  // Un chiffré de réponse n'est jamais pris pour un « pourquoi », ni l'inverse : longueur et données associées diffèrent.
  assert.equal(dechiffrerPourquoi(cle, carte, chiffrerReponse(cle, carte, 'T04', { position: 2, raison: 2 })), null);
  assert.throws(() => chiffrerPourquoi(cle, carte, 0 as 1), RangeError);
  const tailles = new Set(([1, 2, 3, 4] as const).map((r) => chiffrerPourquoi(cle, carte, r).length));
  assert.deepEqual([...tailles], [LONGUEUR_POURQUOI_CHIFFRE]);
});

test('connexion à la base : chiffrée sauf « sslmode=disable » ; le module se déclare à l’ouverture', async () => {
  assert.deepEqual(chiffrementBase('postgresql://u@exemple.invalid:31000/b').ssl, { rejectUnauthorized: false });
  assert.deepEqual(chiffrementBase('postgresql://u@exemple.invalid:31000/b?sslmode=prefer').ssl, { rejectUnauthorized: false });
  assert.deepEqual(chiffrementBase('postgresql://u@exemple.invalid:31000/b?sslmode=verify-full').ssl, { rejectUnauthorized: true });
  assert.equal(chiffrementBase('postgresql://u@127.0.0.1:54329/b?sslmode=disable').ssl, false);
  assert.ok(!chiffrementBase('postgresql://u@exemple.invalid:1/b?sslmode=prefer').adresse.includes('sslmode'));
  const roles = creerPoolModule('postgresql://u@exemple.invalid:1/b', 'jeu', 'roles', { schema: 'essai' });
  const repli = creerPoolModule('postgresql://u@exemple.invalid:1/b', 'mesures', 'repli');
  const options = (p: unknown) => (p as { options: { options?: string } }).options.options;
  assert.equal(options(roles), '-c role=elenchos_jeu -c search_path=essai');
  assert.equal(options(repli), '-c elenchos.module=mesures');
  await roles.end();
  await repli.end();
});
