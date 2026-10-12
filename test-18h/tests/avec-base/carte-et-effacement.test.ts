// P-43 : la base du test n'a que les champs de sa carte ; « Tout effacer » la vide, puis vérifie qu'elle est vide.

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { CARTE, colonnesReelles, toutEffacer, verifierVide } from '../../src/base.ts';
import { creerDepot } from '../../src/depot.ts';
import { baseDeTest, fauxTelephone, TRACEUR } from '../aides/outils.ts';

let base: Awaited<ReturnType<typeof baseDeTest>>;
before(async () => { base = await baseDeTest(); });
after(async () => { await base.fin(); });

test('les tables et colonnes réelles sont exactement celles de la carte', async () => {
  assert.deepEqual(await colonnesReelles(base.pool), CARTE);
});

test('aucune colonne ne peut porter un nom, une adresse e-mail, une adresse internet ou une heure d’ouverture', () => {
  const toutes = Object.values(CARTE).flat().join(' ');
  assert.ok(!/nom|email(?!_recu)|mail\b|ip|ouvert|pseudo|user|agent|appareil/i.test(toutes.replace('numero', '')));
});

test('la base refuse ce que la carte ne permet pas', async () => {
  const depot = creerDepot(base.pool);
  await assert.rejects(base.pool.query("INSERT INTO telephone (numero, service) VALUES (6, 'apple')")); // un sixième téléphone
  await base.pool.query("INSERT INTO telephone (numero, service) VALUES (1, 'apple')");
  await assert.rejects(base.pool.query('UPDATE telephone SET systeme = $1 WHERE numero = 1', [`iPhone de ${TRACEUR.nom}`]));
  await assert.rejects(base.pool.query("INSERT INTO telephone (numero, service) VALUES (2, 'inconnu')"));
  await assert.rejects(base.pool.query("INSERT INTO compte (fournisseur, empreinte, email_recu) VALUES ('google', $1, true)", [TRACEUR.email]));
  await assert.rejects(base.pool.query(
    "INSERT INTO envoi (id, telephone, nature, forme, envoye_a, reponse_motif) VALUES (gen_random_uuid(), 1, 'essai', 'classique', now(), $1)",
    [TRACEUR.email],
  ));
  await assert.rejects(base.pool.query( // un envoi « soir » sans date de soir
    "INSERT INTO envoi (id, telephone, nature, forme, envoye_a) VALUES (gen_random_uuid(), 1, 'soir', 'classique', now())",
  ));
  await depot.effacerLigne(1);
});

test('« Tout effacer » vide la base et le vérifie : ni abonnement, ni identifiant, ni heure', async () => {
  const depot = creerDepot(base.pool);
  for (const n of [1, 2, 3, 4, 5]) {
    const t = fauxTelephone();
    await depot.enregistrerAbonnement(n, 'apple', t.abonnement.endpoint, t.abonnement.keys.p256dh, t.abonnement.keys.auth);
  }
  await base.pool.query(`INSERT INTO envoi (id, telephone, nature, soir_date, soir, forme, envoye_a, recu_a)
    VALUES (gen_random_uuid(), 2, 'soir', '2026-10-18', 1, 'classique', now(), now())`);
  await depot.compte('google', 'a'.repeat(64), true);
  await depot.compte('apple', 'b'.repeat(64), false);
  assert.equal((await verifierVide(base.pool)).vide, false);

  const etat = await toutEffacer(base.pool);
  assert.equal(etat.vide, true);
  assert.deepEqual(etat.lignes, { telephone: 0, abonnement: 0, envoi: 0, compte: 0 });
  assert.deepEqual(etat.tablesHorsCarte, []);
  // Le traceur n'est plus nulle part : relecture brute de toutes les tables.
  for (const t of Object.keys(CARTE)) {
    const r = await base.pool.query(`SELECT * FROM ${t}`);
    assert.ok(!JSON.stringify(r.rows).includes(TRACEUR.endpointChemin));
  }
  // Les numéros de compte repartent de 1 : rien ne trahit qu'il y en a eu.
  assert.equal(await depot.compte('google', 'c'.repeat(64), false), 1);
  await toutEffacer(base.pool);
});

test('une table hors carte rend la base « non vide »', async () => {
  await base.pool.query('CREATE TABLE intruse (x int)');
  const etat = await verifierVide(base.pool);
  assert.equal(etat.vide, false);
  assert.deepEqual(etat.tablesHorsCarte, ['intruse']);
  await base.pool.query('DROP TABLE intruse');
});

test('effacer la ligne d’un téléphone (un prêteur qui se retire) efface son abonnement et ses heures', async () => {
  const depot = creerDepot(base.pool);
  const t = fauxTelephone();
  await depot.enregistrerAbonnement(4, 'apple', t.abonnement.endpoint, t.abonnement.keys.p256dh, t.abonnement.keys.auth);
  await base.pool.query(`INSERT INTO envoi (id, telephone, nature, forme, envoye_a) VALUES (gen_random_uuid(), 4, 'essai', 'classique', now())`);
  await depot.effacerLigne(4);
  assert.equal((await verifierVide(base.pool)).vide, true);
});
