// Ce que la base refuse elle-même, sans dépendre du programme :
// - P-34 : aucune réponse sans un accord du même joueur, à jour de la dernière version « nouvel accord » de la carte ;
// - règle 1 : dix membres au plus ; règle 3 : trois cercles au plus ; E7 : pseudo et rond uniques dans le cercle ;
// - DECISIONS-TECHNIQUES, partie 3 : un joueur provisoire n'est membre d'aucun cercle ;
// - P-35 : aucun lien d'invitation sans l'accord de l'invitant.
// Chaque refus porte un code « EL… » et un message fixe : aucune valeur, aucun identifiant (P-07 : le journal de la
// base, gardé un an chez Scalingo, recopie le message d'erreur).

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import {
  baseDeTest, commeJoueur, creerCercle, entrer, inviter, nouveauJoueur, peupler, repondre, type BaseDeTest, type Monde,
} from './aides.ts';

let base: BaseDeTest;
let m: Monde;
before(async () => {
  base = await baseDeTest('roles');
  m = await peupler(base);
});
after(async () => { await base?.fin(); });

/** Le refus attendu, et un message sans valeur : ni identifiant, ni empreinte, ni pseudo. */
function refus(attendu: string) {
  return (e: unknown) => {
    const o = e as { code?: string; message?: string; detail?: string };
    assert.equal(o.code, attendu, o.message);
    assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}|[0-9a-f]{32}|7Q2/i.test(`${o.message ?? ''} ${o.detail ?? ''}`), o.message);
    assert.equal(o.detail, undefined);
    return true;
  };
}

test('P-34 : une réponse sans accord, ou avec l’accord d’un autre, est refusée par la base', async () => {
  await assert.rejects(commeJoueur(base, m.paul.id, (c) => repondre(c, { ...m.paul, consentement: randomUUID() }, 'T06', { position: 1, raison: 0 }, 'jour')),
    refus('EL034'));
  await assert.rejects(commeJoueur(base, m.paul.id, (c) => repondre(c, { ...m.paul, consentement: m.marie.consentement }, 'T06', { position: 1, raison: 0 }, 'jour')),
    refus('EL034'));
});

test('P-34 : une version « nouvel accord » de la carte bloque la réponse suivante jusqu’au nouvel accord', async () => {
  await base.module('proprietaire').query("INSERT INTO carte_accord (version, empreinte, nouvel_accord) VALUES (2, $1, true)", ['c'.repeat(64)]);
  try {
    await assert.rejects(commeJoueur(base, m.paul.id, (c) => repondre(c, m.paul, 'T06', { position: 4, raison: 1 }, 'jour')), refus('EL034'));
    const nouveau = randomUUID();
    await commeJoueur(base, m.paul.id, async (c) => {
      await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 2, now(), true)', [nouveau, m.paul.id]);
      await repondre(c, { ...m.paul, consentement: nouveau }, 'T06', { position: 4, raison: 1 }, 'jour');
    });
    const r = await base.admin.query('SELECT 1 FROM reponse WHERE joueur_id = $1 AND texte_id = $2', [m.paul.id, 'T06']);
    assert.equal(r.rowCount, 1);
    // Une version simplement corrigée (sans « nouvel accord ») ne bloque personne.
    await base.module('proprietaire').query("INSERT INTO carte_accord (version, empreinte, nouvel_accord) VALUES (3, $1, false)", ['d'.repeat(64)]);
    await commeJoueur(base, m.paul.id, async (c) => {
      await base.module('proprietaire').query("INSERT INTO texte (id, role, tension, sens, contenu, empreinte) VALUES ('T09', 'jour', 'EP', 0, '{}', $1)", ['e'.repeat(64)]);
      await repondre(c, { ...m.paul, consentement: nouveau }, 'T09', { position: 5, raison: 2 }, 'jour');
    });
  } finally {
    await base.admin.query('DELETE FROM carte_accord WHERE version > 1 AND NOT EXISTS (SELECT 1 FROM consentement c WHERE c.version = carte_accord.version)');
  }
});

test('P-34 : l’accord est enregistré à l’heure du serveur, pas avant ; « 15 ans et plus » est exigé', async () => {
  const futur = randomUUID();
  await commeJoueur(base, m.ines.id, (c) => c.query(
    "INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now() + interval '1 hour', true)",
    [futur, m.ines.id]));
  await assert.rejects(commeJoueur(base, m.ines.id, (c) => repondre(c, { ...m.ines, consentement: futur }, 'T06', { position: 2, raison: 0 }, 'jour')),
    refus('EL034'));
  await assert.rejects(commeJoueur(base, m.ines.id, (c) => c.query(
    'INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), false)', [randomUUID(), m.ines.id])),
  (e) => (e as { code?: string }).code === '23514');
});

test('règle 1 : un cercle compte dix membres au plus ; le onzième est refusé par la base', async () => {
  const createur = await nouveauJoueur(base, 'Dix-0', 'A');
  const cercle = await creerCercle(base, createur, 'Complet');
  const lettres = 'BCDEFGHIJK';
  for (let i = 1; i <= 10; i += 1) {
    const j = await nouveauJoueur(base, `Dix-${i}`, lettres[i - 1] ?? 'Z');
    const inv = await inviter(base, cercle, createur);
    if (i <= 9) await entrer(base, cercle, inv, j);
    else await assert.rejects(entrer(base, cercle, inv, j), refus('EL001'));
  }
  assert.equal((await base.admin.query('SELECT 1 FROM membre WHERE cercle_id = $1', [cercle.id])).rowCount, 10);
});

test('règle 3 : trois cercles au plus ; Hugo, déjà dans trois, ne peut pas entrer dans un quatrième', async () => {
  const d = await creerCercle(base, m.paul, 'Quatrieme');
  const inv = await inviter(base, d, m.paul);
  await assert.rejects(entrer(base, d, inv, m.hugo), refus('EL002'));
});

test('E7 : deux membres d’un cercle n’ont jamais le même pseudo (comparé) ni le même rond', async () => {
  const sosie = await nouveauJoueur(base, 'MARIE-a7q2', 'Q'); // même forme de comparaison que « Marie-A7Q2 »
  const inv = await inviter(base, m.a, m.marie);
  await assert.rejects(entrer(base, m.a, inv, sosie), refus('EL003'));
  const homonyme = await nouveauJoueur(base, 'Mathilde', 'M'); // même rond que Marie
  const inv2 = await inviter(base, m.a, m.marie);
  await assert.rejects(entrer(base, m.a, inv2, homonyme), refus('EL004'));
  // Changer de pseudo pour celui d'un proche : refusé ; pour un pseudo libre : accepté.
  await assert.rejects(commeJoueur(base, m.paul.id, (c) => c.query(
    'UPDATE joueur SET pseudo = $2, pseudo_comparaison = $3 WHERE id = $1', [m.paul.id, 'Hugo', m.hugo.pseudo.toLowerCase()])), refus('EL003'));
  await commeJoueur(base, m.paul.id, (c) => c.query(
    'UPDATE joueur SET pseudo = $2, pseudo_comparaison = $3 WHERE id = $1', [m.paul.id, 'Polo', 'polo']));
});

test('un joueur provisoire n’est membre d’aucun cercle, même avec un lien lié à lui', async () => {
  const inv = await inviter(base, m.a, m.marie);
  const zoe = randomUUID();
  await commeJoueur(base, zoe, async (c) => {
    await c.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'provisoire', 'Zoe', 'zoe', now())", [zoe]);
    await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE empreinte_jeton = $2', [zoe, inv.jeton]);
  }, inv.jeton);
  await assert.rejects(commeJoueur(base, zoe, (c) => c.query(
    "INSERT INTO membre (id, cercle_id, joueur_id, rond, createur, arrive_le) VALUES ($1, $2, $3, 'Z', false, now())",
    [randomUUID(), m.a.id, zoe])), refus('EL006'));
});

test('P-35 : aucun lien d’invitation sans l’accord de l’invitant (version et date)', async () => {
  await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query(
    `INSERT INTO invitation (id, sorte, empreinte_jeton, cercle_id, invitant_membre_id, expire_le)
     VALUES ($1, 'invite', $2, $3, $4, now() + interval '7 days')`,
    [randomUUID(), randomBytes(32).toString('hex'), m.a.id, m.a.membres.get(m.marie.id)])),
  (e) => (e as { code?: string }).code === '23514');
  // Un lien de créateur n'a ni cercle ni invitant : seul le porteur le fabrique (module « proprietaire »).
  await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query(
    "INSERT INTO invitation (id, sorte, empreinte_jeton, expire_le) VALUES ($1, 'createur', $2, now() + interval '7 days')",
    [randomUUID(), randomBytes(32).toString('hex')])), (e) => (e as { code?: string }).code === '42501');
  await base.module('proprietaire').query(
    "INSERT INTO invitation (id, sorte, empreinte_jeton, expire_le) VALUES ($1, 'createur', $2, now() + interval '7 days')",
    [randomUUID(), randomBytes(32).toString('hex')]);
});

test('une réponse est définitive : le jeu ne peut ni la changer ni l’effacer', async () => {
  for (const sql of ['UPDATE reponse SET en_retard = true WHERE joueur_id = $1', 'DELETE FROM reponse WHERE joueur_id = $1']) {
    await assert.rejects(commeJoueur(base, m.marie.id, (c) => c.query(sql, [m.marie.id])), (e) => (e as { code?: string }).code === '42501', sql);
  }
});
