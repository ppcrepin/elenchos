// REPRIS pour le vrai jeu (proposé) : l’envoi unique de 18h.
// L'envoi de 18h, sur un vrai PostgreSQL, avec une horloge simulée :
// à l'heure, une seule fois même avec deux serveurs, rattrapé après un redémarrage, jamais après 18h30.

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { lireSoirs } from '../../src/config.ts';
import { creerDepot } from '../../src/depot.ts';
import { horlogeReglable } from '../../src/horloge.ts';
import { creerPlanificateur } from '../../src/planificateur.ts';
import { creerEnvoyeur } from '../../src/push/envoyeur.ts';
import { baseDeTest, dechiffrer, fauxService, fauxTelephone, journalCapture, ORIGINE, paireVapid } from '../aides/outils.ts';

let base: Awaited<ReturnType<typeof baseDeTest>>;
before(async () => { base = await baseDeTest(); });
after(async () => { await base.fin(); });

const SOIRS = lireSoirs('2026-10-16=0@1;2026-10-18=1;2026-10-19=2;2026-10-20=3;2026-10-25=4@2') ?? [];
const VAPID = { ...paireVapid(), contact: ORIGINE };

async function remise() {
  await base.pool.query('TRUNCATE envoi, abonnement, telephone, compte RESTART IDENTITY');
  const depot = creerDepot(base.pool);
  const tels = [1, 2, 3, 4, 5].map(() => fauxTelephone());
  for (const [i, t] of tels.entries()) {
    await depot.enregistrerAbonnement(i + 1, 'apple', t.abonnement.endpoint, t.abonnement.keys.p256dh, t.abonnement.keys.auth);
  }
  return tels;
}

function serveur(depart: string, pool = base.pool, reponse?: (url: string) => { statut: number; json?: unknown }) {
  const horloge = horlogeReglable(new Date(depart));
  const service = fauxService(reponse);
  const { journal, lignes } = journalCapture();
  const p = creerPlanificateur({
    pool, envoyeur: creerEnvoyeur(VAPID, horloge, service.fetch), horloge, journal, soirs: SOIRS, adressePublique: ORIGINE,
  });
  return { p, horloge, service, lignes };
}

const envois = async () => (await base.pool.query(
  'SELECT telephone, nature, soir, forme, envoye_a, reponse_code, recu_a FROM envoi ORDER BY telephone, forme',
)).rows;

test('à 17h59:59 rien ne part ; à 18h00:00 les cinq téléphones reçoivent « Test, soir 1 sur 3 », urgence haute', async () => {
  const tels = await remise();
  const s = serveur('2026-10-18T15:59:59Z'); // dimanche 18 octobre, 17h59:59 à Paris
  await s.p.tic();
  assert.equal(s.service.demandes.length, 0);
  s.horloge.regler(new Date('2026-10-18T16:00:00Z'));
  await s.p.tic();
  assert.equal(s.service.demandes.length, 5);
  for (const d of s.service.demandes) {
    assert.equal(d.entetes.urgency, 'high');
    assert.equal(d.entetes.ttl, '1800');
  }
  const contenu = JSON.parse(dechiffrer(s.service.demandes[0]?.corps ?? Buffer.alloc(0), tels[0] as ReturnType<typeof fauxTelephone>));
  assert.equal(contenu.notification.title, 'Test, soir 1 sur 3');
  const lignes = await envois();
  assert.equal(lignes.length, 5);
  for (const l of lignes) {
    assert.equal(l.reponse_code, 201);
    assert.equal(l.envoye_a.toISOString(), '2026-10-18T16:00:00.000Z');
  }
  // Un second tic, une minute plus tard : rien de plus.
  s.horloge.avancer(60_000);
  await s.p.tic();
  assert.equal(s.service.demandes.length, 5);
});

test('deux serveurs qui tournent en même temps, sur deux connexions : un seul envoi par téléphone', async () => {
  await remise();
  const autrePool = base.autrePool();
  try {
    const a = serveur('2026-10-19T16:00:00Z');
    const b = serveur('2026-10-19T16:00:00Z', autrePool);
    for (let i = 0; i < 5; i += 1) await Promise.all([a.p.tic(), b.p.tic(), a.p.tic(), b.p.tic()]);
    assert.equal(a.service.demandes.length + b.service.demandes.length, 5);
    const lignes = await envois();
    assert.equal(lignes.length, 5);
    assert.deepEqual(lignes.map((l) => l.telephone), [1, 2, 3, 4, 5]);
  } finally {
    await autrePool.end();
  }
});

test('redémarré à 18h00:30, le serveur voit que l’envoi n’a pas eu lieu et le fait ; après 18h30, plus rien', async () => {
  await remise();
  const s = serveur('2026-10-19T16:00:30Z');
  await s.p.tic();
  assert.equal(s.service.demandes.length, 5);
  await remise();
  const tard = serveur('2026-10-19T16:30:00Z');
  await tard.p.tic();
  assert.equal(tard.service.demandes.length, 0);
  const juste = serveur('2026-10-19T16:29:59Z');
  await juste.p.tic();
  assert.equal(juste.service.demandes.length, 5);
});

test('redémarré après un envoi déjà fait : aucun renvoi', async () => {
  await remise();
  const premier = serveur('2026-10-19T16:00:00Z');
  await premier.p.tic();
  const second = serveur('2026-10-19T16:00:40Z'); // un nouveau processus, sans mémoire
  await second.p.tic();
  assert.equal(second.service.demandes.length, 0);
});

test('envoi interrompu (verrou pris, serveur tombé avant l’envoi) : jamais renvoyé', async () => {
  await remise();
  await base.pool.query(
    `INSERT INTO envoi (id, telephone, nature, soir_date, soir, forme, envoye_a)
     VALUES ('00000000-0000-4000-8000-000000000001', 3, 'soir', '2026-10-19', 2, 'classique', '2026-10-19T16:00:00Z')`,
  );
  const s = serveur('2026-10-19T16:00:20Z');
  await s.p.tic();
  assert.equal(s.service.demandes.length, 4);
});

test('soir 3 : 18h00 pour les cinq ; 18h10, seconde forme sur T1 seulement, si son iOS l’accepte', async () => {
  const tels = await remise();
  const s = serveur('2026-10-20T16:00:00Z');
  await s.p.tic();
  assert.equal(s.service.demandes.length, 5);
  s.horloge.regler(new Date('2026-10-20T16:09:59Z'));
  await s.p.tic();
  assert.equal(s.service.demandes.length, 5);
  s.horloge.regler(new Date('2026-10-20T16:10:00Z'));
  await s.p.tic();
  assert.equal(s.service.demandes.length, 6);
  const derniere = s.service.demandes[5];
  assert.equal(derniere?.url, tels[0]?.abonnement.endpoint);
  const contenu = JSON.parse(dechiffrer(derniere?.corps ?? Buffer.alloc(0), tels[0] as ReturnType<typeof fauxTelephone>));
  assert.equal(contenu.web_push, 8030);
  assert.equal(contenu.mutable, true);
  assert.equal(contenu.notification.navigate, ORIGINE + '/');
  assert.equal(contenu.notification.title, 'Test, soir 3 sur 3 (seconde forme)');

  await remise();
  await creerDepot(base.pool).noterSysteme(1, 'iOS 17.6');
  const ancien = serveur('2026-10-20T16:10:00Z');
  await ancien.p.tic();
  assert.equal(ancien.service.demandes.filter((d) => d.url === tels[0]?.abonnement.endpoint).length, 0);
});

test('jour du changement d’heure (25 octobre) : 18h00 de Paris, c’est 17h00 UTC ; seuls les téléphones prévus', async () => {
  await remise();
  const s = serveur('2026-10-25T16:00:00Z'); // 17h00 à Paris ce jour-là
  await s.p.tic();
  assert.equal(s.service.demandes.length, 0);
  s.horloge.regler(new Date('2026-10-25T17:00:00Z'));
  await s.p.tic();
  assert.equal(s.service.demandes.length, 1); // « 2026-10-25=4@2 » : T2 seulement
});

test('jour sans soir prévu : rien ne part', async () => {
  await remise();
  const s = serveur('2026-10-17T16:00:00Z');
  await s.p.tic();
  assert.equal(s.service.demandes.length, 0);
});

test('abonnement expiré (410) : la réponse est notée, l’abonnement oublié, la ligne du téléphone gardée', async () => {
  const tels = await remise();
  const s = serveur('2026-10-19T16:00:00Z', base.pool, (url) => (url === tels[1]?.abonnement.endpoint ? { statut: 410, json: { reason: 'Unregistered' } } : { statut: 201 }));
  await s.p.tic();
  const r = await base.pool.query('SELECT reponse_code, reponse_motif FROM envoi WHERE telephone = 2');
  assert.deepEqual(r.rows[0], { reponse_code: 410, reponse_motif: 'Unregistered' });
  assert.equal((await base.pool.query('SELECT 1 FROM abonnement WHERE telephone = 2')).rowCount, 0);
  assert.equal((await base.pool.query('SELECT 1 FROM telephone WHERE numero = 2')).rowCount, 1);
  assert.ok(s.lignes.some((l) => l.includes('abonnement expire')));
});

test('la boucle se réveille au début exact du créneau', async () => {
  await remise();
  const s = serveur('2026-10-19T15:59:30Z');
  const attentes: number[] = [];
  let suite: (() => void) | null = null;
  const { journal } = journalCapture();
  const p = creerPlanificateur({
    pool: base.pool, envoyeur: creerEnvoyeur(VAPID, s.horloge, s.service.fetch), horloge: s.horloge, journal, soirs: SOIRS,
    adressePublique: ORIGINE,
    minuteur: { attendre: (ms, f) => { attentes.push(ms); suite = f; return { annuler: () => undefined }; } },
  });
  p.demarrer();
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(attentes[0], 30_000); // de 17h59:30 à 18h00:00 pile
  s.horloge.avancer(30_000);
  (suite as unknown as () => void)();
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(s.service.demandes.length, 5);
  p.arreter();
});
