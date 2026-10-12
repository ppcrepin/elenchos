// REPRIS pour le vrai jeu (proposé) : test de la réception dans le téléphone.
// La réception dans le téléphone (public/sw.js), jouée dans un faux téléphone :
// le message s'affiche toujours, la réception est signalée avec le seul numéro d'envoi, et un toucher ne fait rien.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

const CODE = readFileSync(join(import.meta.dirname, '..', '..', 'public', 'sw.js'), 'utf8');
const ID = '0b6f5a3e-58a5-4c0e-9a51-3d7c2b1a9e40';

function fauxTelephone(reponseServeur = 204) {
  const ecouteurs: Record<string, (e: unknown) => void> = {};
  const affichees: { titre: string; options: unknown }[] = [];
  const demandes: { url: string; init: RequestInit }[] = [];
  const fenetres: string[] = [];
  const self = {
    addEventListener: (type: string, f: (e: unknown) => void) => { ecouteurs[type] = f; },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined, openWindow: async (url: string) => { fenetres.push(url); return null; } },
    registration: { showNotification: async (titre: string, options: unknown) => { affichees.push({ titre, options }); } },
  };
  const contexte = vm.createContext({
    self,
    fetch: async (url: string, init: RequestInit) => { demandes.push({ url, init }); return { ok: reponseServeur < 300 }; },
    setTimeout: (f: () => void) => { f(); return 0; },
    JSON, Promise,
  });
  vm.runInContext(CODE, contexte);
  async function declencher(type: string, evenement: Record<string, unknown>) {
    const attentes: Promise<unknown>[] = [];
    ecouteurs[type]?.({ ...evenement, waitUntil: (p: Promise<unknown>) => attentes.push(p) });
    await Promise.all(attentes);
  }
  return { declencher, affichees, demandes, fenetres };
}

const donnees = (objet: unknown) => ({ json: () => JSON.parse(JSON.stringify(objet)) });

test('message classique : il s’affiche, et le serveur est prévenu avec le seul numéro d’envoi', async () => {
  const t = fauxTelephone();
  await t.declencher('push', { data: donnees({ notification: { title: 'Test, soir 2 sur 3', lang: 'fr', data: { envoi: ID } } }) });
  assert.equal(t.affichees.length, 1);
  assert.equal(t.affichees[0]?.titre, 'Test, soir 2 sur 3');
  assert.equal(t.demandes.length, 1);
  assert.equal(t.demandes[0]?.url, '/api/recu');
  assert.equal(t.demandes[0]?.init.method, 'POST');
  assert.equal(t.demandes[0]?.init.credentials, 'omit');
  assert.deepEqual(JSON.parse(String(t.demandes[0]?.init.body)), { envoi: ID }); // pas l'heure du téléphone, rien d'autre
});

test('contenu illisible : un message neutre s’affiche quand même (sinon Safari retire l’autorisation)', async () => {
  const t = fauxTelephone();
  await t.declencher('push', { data: { json: () => { throw new SyntaxError('x'); } } });
  assert.equal(t.affichees.length, 1);
  assert.equal(t.affichees[0]?.titre, 'Test');
  assert.equal(t.demandes.length, 0);
});

test('seconde forme (iOS 18.4, mutable) : le système affiche, la page prévient seulement le serveur', async () => {
  const t = fauxTelephone();
  await t.declencher('push', { data: null, notification: { title: 'Test, soir 3 sur 3 (seconde forme)', data: { envoi: ID } } });
  assert.equal(t.affichees.length, 0);
  assert.deepEqual(JSON.parse(String(t.demandes[0]?.init.body)), { envoi: ID });
});

test('seconde forme reçue par un iOS plus ancien : affichée comme un message classique', async () => {
  const t = fauxTelephone();
  await t.declencher('push', {
    data: donnees({ web_push: 8030, mutable: true, notification: { title: 'Test, soir 3 sur 3 (seconde forme)', navigate: 'https://x.invalid/', data: { envoi: ID } } }),
  });
  assert.equal(t.affichees.length, 1);
  assert.equal(t.demandes.length, 1);
});

test('si le serveur ne répond pas, un seul second essai', async () => {
  const t = fauxTelephone(500);
  await t.declencher('push', { data: donnees({ notification: { title: 'Test', data: { envoi: ID } } }) });
  assert.equal(t.demandes.length, 2);
});

test('un numéro d’envoi mal formé n’est jamais renvoyé au serveur', async () => {
  const t = fauxTelephone();
  await t.declencher('push', { data: donnees({ notification: { title: 'Test', data: { envoi: 'traceur-7q2@exemple.invalid' } } }) });
  assert.equal(t.affichees.length, 1);
  assert.equal(t.demandes.length, 0);
});

test('toucher le message ne fait rien : il se ferme, aucune fenêtre ne s’ouvre, rien n’est envoyé', async () => {
  const t = fauxTelephone();
  let fermee = false;
  await t.declencher('notificationclick', { notification: { close: () => { fermee = true; }, data: { envoi: ID } }, action: '' });
  assert.equal(fermee, true);
  assert.deepEqual(t.fenetres, []);
  assert.equal(t.demandes.length, 0);
  assert.ok(!/openWindow|clients\.matchAll|focus\(/.test(CODE), 'le code ne doit ouvrir ni chercher aucune fenêtre');
});
