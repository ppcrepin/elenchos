// JETABLE dans son détail ; REPRIS (proposé) : le traceur dans les journaux (P-07, P-08).
// Le serveur complet, sur un vrai PostgreSQL : codes d'essai, abonnement, réception, connexion, page de résultats,
// en-têtes de sécurité, effacement ; et le traceur, cherché dans tout ce que le programme écrit (P-07, P-08).

import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { after, before, test } from 'node:test';
import { b64url } from '../../src/crypto.ts';
import { horlogeReglable } from '../../src/horloge.ts';
import { creerPlanificateur } from '../../src/planificateur.ts';
import { creerEnvoyeur } from '../../src/push/envoyeur.ts';
import { creerApplication } from '../../src/serveur.ts';
import { baseDeTest, CODE_ACCES, CODES, configDeTest, fauxTelephone, journalCapture, ORIGINE, TRACEUR } from '../aides/outils.ts';

// Tout ce que le processus écrit pendant ces tests est capturé, pour y chercher le traceur.
const sortieCapturee: string[] = [];
const ecrireStdout = process.stdout.write.bind(process.stdout);
const ecrireStderr = process.stderr.write.bind(process.stderr);

let base: Awaited<ReturnType<typeof baseDeTest>>;
let adresse = '';
let fermer: () => Promise<void>;
const { journal, lignes } = journalCapture();
const horloge = horlogeReglable(new Date('2026-10-17T09:00:00Z'));
const config = configDeTest();
const envoisPush: { url: string }[] = [];
let nonceCourant = '';
let subCourant = TRACEUR.sub;
const { privateKey: cleFournisseur } = generateKeyPairSync('rsa', { modulusLength: 2048 });

function jeton(iss: string, aud: string): string {
  const t = Math.floor(horloge.maintenant().getTime() / 1000);
  const corps = { iss, aud, sub: subCourant, nonce: nonceCourant, iat: t, exp: t + 600, email: TRACEUR.email, name: TRACEUR.nom };
  const m = `${b64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))}.${b64url(Buffer.from(JSON.stringify(corps)))}`;
  return `${m}.${b64url(sign('sha256', Buffer.from(m), cleFournisseur))}`;
}

// Le seul accès du serveur au monde extérieur : Apple, Google, et le service d'acheminement (P-12).
const sortiesDuServeur: string[] = [];
const fauxMonde = (async (entree: string | URL | Request, init?: RequestInit) => {
  const url = entree instanceof Request ? entree.url : String(entree);
  sortiesDuServeur.push(new URL(url).host);
  if (url === 'https://oauth2.googleapis.com/token' || url === 'https://appleid.apple.com/auth/token') {
    const google = url.includes('google');
    const id_token = google
      ? jeton('https://accounts.google.com', 'client-google-de-test.apps.googleusercontent.com')
      : jeton('https://appleid.apple.com', 'fr.exemple.test18h.web');
    return new Response(JSON.stringify({ access_token: 'a', token_type: 'Bearer', expires_in: 3600, id_token }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
  envoisPush.push({ url });
  void init;
  return new Response(null, { status: 201 });
}) as typeof fetch;

before(async () => {
  process.stdout.write = ((t: string | Uint8Array, ...r: unknown[]) => { sortieCapturee.push(String(t)); return ecrireStdout(t, ...(r as [])); }) as typeof process.stdout.write;
  process.stderr.write = ((t: string | Uint8Array, ...r: unknown[]) => { sortieCapturee.push(String(t)); return ecrireStderr(t, ...(r as [])); }) as typeof process.stderr.write;
  base = await baseDeTest();
  const planificateur = creerPlanificateur({
    pool: base.pool, envoyeur: creerEnvoyeur(config.vapid ?? { publique: '', privee: '', contact: '' }, horloge, fauxMonde),
    horloge, journal, soirs: config.soirs ?? [], adressePublique: ORIGINE,
  });
  const serveur = creerApplication({ config, pool: base.pool, journal, horloge, planificateur, fetch: fauxMonde });
  await new Promise<void>((r) => serveur.listen(0, '127.0.0.1', () => r()));
  adresse = `http://127.0.0.1:${(serveur.address() as AddressInfo).port}`;
  fermer = () => new Promise<void>((r) => { serveur.closeAllConnections(); serveur.close(() => r()); });
});

after(async () => {
  await fermer();
  await base.fin();
  process.stdout.write = ecrireStdout;
  process.stderr.write = ecrireStderr;
});

type Options = { methode?: string; json?: unknown; formulaire?: Record<string, string>; cookie?: string; origine?: string | null; brut?: string; type?: string };

async function demander(chemin: string, o: Options = {}) {
  const entetes: Record<string, string> = {};
  if (o.origine !== null) entetes.Origin = o.origine ?? ORIGINE;
  if (o.cookie) entetes.Cookie = o.cookie;
  let body: string | undefined;
  if (o.json !== undefined) { entetes['Content-Type'] = 'application/json'; body = JSON.stringify(o.json); }
  if (o.formulaire) { entetes['Content-Type'] = 'application/x-www-form-urlencoded'; body = new URLSearchParams(o.formulaire).toString(); }
  if (o.brut !== undefined) { entetes['Content-Type'] = o.type ?? 'application/json'; body = o.brut; }
  const r = await fetch(adresse + chemin, { method: o.methode ?? (body !== undefined ? 'POST' : 'GET'), headers: entetes, body, redirect: 'manual' });
  return { statut: r.status, entetes: r.headers, texte: await r.text(), cookies: r.headers.getSetCookie() };
}

const cookieDe = (cookies: string[], nom: string) => cookies.find((c) => c.startsWith(nom + '='))?.split(';')[0] ?? '';

test('en-têtes de sécurité et demande de non-référencement sur toutes les réponses', async () => {
  for (const chemin of ['/', '/sw.js', '/api/etat', '/resultats', '/introuvable', '/preparer']) {
    const r = await demander(chemin, { origine: null });
    assert.match(r.entetes.get('content-security-policy') ?? '', /default-src 'none'/, chemin);
    assert.equal(r.entetes.get('x-content-type-options'), 'nosniff');
    assert.equal(r.entetes.get('x-robots-tag'), 'noindex, nofollow');
    assert.equal(r.entetes.get('referrer-policy'), 'no-referrer');
  }
  assert.equal((await demander('/introuvable', { origine: null })).statut, 404);
});

test('codes d’essai : sans code ou faux, refusé ; le bon code donne son téléphone ; jamais sans la bonne origine', async () => {
  assert.equal((await demander('/api/code', { json: {} })).statut, 403);
  assert.equal((await demander('/api/code', { json: { code: TRACEUR.code } })).statut, 403);
  const r = await demander('/api/code', { json: { code: ' GGGG-hhhh-JJJJ ' } });
  assert.equal(r.statut, 200);
  assert.deepEqual(JSON.parse(r.texte), { telephone: 3 });
  assert.equal((await demander('/api/code', { json: { code: CODES[2] }, origine: 'https://autre.exemple.invalid' })).statut, 403);
  assert.equal((await demander('/api/code', { json: { code: CODES[2] }, origine: null })).statut, 403);
});

test('abonnement : seulement avec un code, cinq au plus, un par téléphone, vers un service de la liste', async () => {
  const tel = fauxTelephone();
  assert.equal((await demander('/api/abonnement', { json: { abonnement: tel.abonnement } })).statut, 403);
  assert.equal((await demander('/api/abonnement', { json: { code: TRACEUR.code, abonnement: tel.abonnement } })).statut, 403);
  assert.equal((await base.pool.query('SELECT 1 FROM abonnement')).rowCount, 0);
  assert.equal((await demander('/api/abonnement', { json: { code: CODES[0], abonnement: fauxTelephone('exemple.invalid').abonnement } })).statut, 422);
  for (const [i, code] of CODES.entries()) {
    const r = await demander('/api/abonnement', { json: { code, abonnement: fauxTelephone().abonnement } });
    assert.equal(r.statut, 201);
    assert.deepEqual(JSON.parse(r.texte), { telephone: i + 1 });
  }
  // Le même code une seconde fois (icône réinstallée) remplace l'abonnement de ce téléphone : toujours cinq.
  assert.equal((await demander('/api/abonnement', { json: { code: CODES[0], abonnement: tel.abonnement } })).statut, 201);
  const r = await base.pool.query('SELECT telephone, adresse FROM abonnement ORDER BY telephone');
  assert.equal(r.rowCount, 5);
  assert.equal(r.rows[0].adresse, tel.abonnement.endpoint);
  assert.equal((await demander('/api/abonnement', { json: { code: CODES[1], abonnement: { endpoint: tel.abonnement.endpoint, keys: { p256dh: 'x', auth: 'y' } } } })).statut, 400);
});

test('réception : notée une fois, à l’heure du serveur ; un numéro inconnu ne change rien', async () => {
  horloge.regler(new Date('2026-10-17T09:00:00Z'));
  const res = await demander('/resultats/entree', { formulaire: { code: CODE_ACCES } });
  const porteur = cookieDe(res.cookies, '__Host-porteur');
  await demander('/resultats/essai', { formulaire: { telephone: '2' }, cookie: porteur });
  const envoi = (await base.pool.query("SELECT id FROM envoi WHERE telephone = 2 AND nature = 'essai'")).rows[0];
  assert.ok(envoi);
  assert.equal((await demander('/api/recu', { json: { envoi: '00000000-0000-4000-8000-0000000000ff' } })).statut, 204);
  assert.equal((await demander('/api/recu', { json: { envoi: TRACEUR.email } })).statut, 204);
  horloge.avancer(7_000);
  assert.equal((await demander('/api/recu', { json: { envoi: envoi.id } })).statut, 204);
  horloge.avancer(60_000);
  await demander('/api/recu', { json: { envoi: envoi.id } });
  const l = (await base.pool.query('SELECT envoye_a, recu_a FROM envoi WHERE id = $1', [envoi.id])).rows[0];
  assert.equal(l.recu_a.getTime() - l.envoye_a.getTime(), 7_000);
});

test('page de résultats : fermée sans le code d’accès ; ouverte avec ; aucune adresse ni empreinte affichée', async () => {
  const fermee = await demander('/resultats', { origine: null });
  assert.match(fermee.texte, /Votre code d’accès/);
  assert.ok(!fermee.texte.includes('T1'));
  assert.equal((await demander('/resultats/entree', { formulaire: { code: 'mauvais-code-1234567' } })).statut, 403);
  assert.equal((await demander('/resultats/entree', { formulaire: { code: CODE_ACCES }, origine: 'https://autre.exemple.invalid' })).statut, 403);
  const ok = await demander('/resultats/entree', { formulaire: { code: CODE_ACCES } });
  assert.equal(ok.statut, 303);
  const porteur = cookieDe(ok.cookies, '__Host-porteur');
  assert.match(ok.cookies.join(), /__Host-porteur=[^;]+; Path=\/; Secure; HttpOnly; SameSite=Strict/);
  const page = await demander('/resultats', { cookie: porteur, origine: null });
  assert.match(page.texte, /Mesures/);
  assert.match(page.texte, /T2 · iPhone · iOS \?/); // l'essai envoyé à T2 plus haut
  assert.ok(!page.texte.includes(TRACEUR.endpointChemin));
  assert.ok(!page.texte.includes('web.push.apple.com'));
  assert.equal((await demander('/resultats/essai', { formulaire: { telephone: '1' } })).statut, 403); // sans cookie
  const sys = await demander('/resultats/systeme', { formulaire: { telephone: '1', systeme: 'iOS 18.5' }, cookie: porteur });
  assert.match(sys.texte, /Version notée pour T1/);
  const refus = await demander('/resultats/systeme', { formulaire: { telephone: '1', systeme: TRACEUR.nom }, cookie: porteur });
  assert.match(refus.texte, /Version non notée/);
});

test('connexion Google puis Apple depuis la page : cookies sûrs, même compte retrouvé, adresse jamais gardée', async () => {
  const debut = await demander('/connexion/google', { origine: null });
  assert.equal(debut.statut, 302);
  const vers = new URL(debut.entetes.get('location') ?? '');
  assert.equal(vers.host, 'accounts.google.com');
  assert.match(debut.cookies[0] ?? '', /^__Host-transaction=[^;]+; Path=\/; Secure; HttpOnly; SameSite=None; Max-Age=600$/);
  nonceCourant = vers.searchParams.get('nonce') ?? '';
  const tx = cookieDe(debut.cookies, '__Host-transaction');
  const retour = await demander('/connexion/google/retour', {
    formulaire: { code: 'c', state: vers.searchParams.get('state') ?? '' }, cookie: tx, origine: 'https://accounts.google.com',
  });
  assert.equal(retour.statut, 303);
  assert.equal(retour.entetes.get('location'), '/');
  const session = cookieDe(retour.cookies, '__Host-session');
  assert.match(retour.cookies.join('|'), /__Host-session=[^;]+; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=2592000/);
  const etat = JSON.parse((await demander('/api/etat', { cookie: session, origine: null })).texte);
  assert.equal(etat.connexion, 'google');

  // Reconnexion (par exemple depuis l'icône) : même compte, pas un second.
  const d2 = await demander('/connexion/google', { origine: null });
  const v2 = new URL(d2.entetes.get('location') ?? '');
  nonceCourant = v2.searchParams.get('nonce') ?? '';
  await demander('/connexion/google/retour', { formulaire: { code: 'c', state: v2.searchParams.get('state') ?? '' }, cookie: cookieDe(d2.cookies, '__Host-transaction') });
  const d3 = await demander('/connexion/apple', { origine: null });
  const v3 = new URL(d3.entetes.get('location') ?? '');
  nonceCourant = v3.searchParams.get('nonce') ?? '';
  const r3 = await demander('/connexion/apple/retour', {
    formulaire: { code: 'c', state: v3.searchParams.get('state') ?? '', user: JSON.stringify({ name: { firstName: TRACEUR.nom }, email: TRACEUR.email }) },
    cookie: cookieDe(d3.cookies, '__Host-transaction'), origine: 'https://appleid.apple.com',
  });
  assert.equal(r3.statut, 303);
  const comptes = (await base.pool.query('SELECT numero, fournisseur, empreinte, email_recu FROM compte ORDER BY numero')).rows;
  assert.deepEqual(comptes.map((c) => [c.numero, c.fournisseur, c.email_recu]), [[1, 'google', true], [2, 'apple', true]]);
  for (const c of comptes) assert.match(c.empreinte, /^[0-9a-f]{64}$/);

  // Un retour sans la transaction (rejoué, ou venu d'ailleurs) est refusé.
  const rejoue = await demander('/connexion/google/retour', { formulaire: { code: 'c', state: v2.searchParams.get('state') ?? '' } });
  assert.equal(rejoue.statut, 400);
  // Déconnexion.
  const sortie = await demander('/deconnexion', { formulaire: {}, cookie: session });
  assert.match(sortie.cookies.join(), /__Host-session=; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=0/);
});

test('le serveur ne sort que vers Apple, Google et le service d’acheminement (P-12)', () => {
  for (const h of sortiesDuServeur) assert.ok(['oauth2.googleapis.com', 'appleid.apple.com', 'web.push.apple.com'].includes(h), h);
});

test('trop d’essais de codes : on refuse un moment, même le bon code', async () => {
  for (let i = 0; i < 25; i += 1) await demander('/api/code', { json: { code: `${TRACEUR.code}${i}` } });
  assert.equal((await demander('/api/code', { json: { code: CODES[0] } })).statut, 429);
  horloge.avancer(16 * 60_000);
  assert.equal((await demander('/api/code', { json: { code: CODES[0] } })).statut, 200);
});

test('erreurs provoquées avec le traceur dedans : demande illisible, trop grosse, mauvais type', async () => {
  assert.equal((await demander('/api/code', { brut: `{"code": "${TRACEUR.email}"` })).statut, 400);
  assert.equal((await demander('/api/code', { brut: 'x'.repeat(20_000) + TRACEUR.email })).statut, 413);
  assert.equal((await demander('/api/code', { brut: TRACEUR.email, type: 'text/plain' })).statut, 415);
  assert.equal((await demander(`/api/etat?email=${TRACEUR.email}`, { origine: null })).statut, 200);
  assert.equal((await demander(`/${TRACEUR.email}`, { origine: null })).statut, 404);
});

test('« Tout effacer » depuis la page : refusé sans confirmation, puis base vide et vérifiée', async () => {
  const ok = await demander('/resultats/entree', { formulaire: { code: CODE_ACCES } });
  const porteur = cookieDe(ok.cookies, '__Host-porteur');
  const sans = await demander('/resultats/tout-effacer', { formulaire: { confirmation: 'oui' }, cookie: porteur });
  assert.match(sans.texte, /Rien effacé/);
  assert.notEqual((await base.pool.query('SELECT 1 FROM abonnement')).rowCount, 0);
  const avec = await demander('/resultats/tout-effacer', { formulaire: { confirmation: 'EFFACER' }, cookie: porteur });
  assert.match(avec.texte, /Base vide : vérifié/);
  for (const t of ['telephone', 'abonnement', 'envoi', 'compte']) {
    assert.equal((await base.pool.query(`SELECT 1 FROM ${t}`)).rowCount, 0, t);
  }
});

test('P-07 et P-08 : le traceur n’apparaît dans aucune ligne écrite ; aucune adresse internet ; routes en modèle', () => {
  const tout = lignes.join('') + sortieCapturee.join('');
  assert.ok(lignes.length > 20);
  for (const valeur of [TRACEUR.email, TRACEUR.sub, TRACEUR.nom, TRACEUR.endpointChemin, TRACEUR.code, 'web.push.apple.com', '127.0.0.1', CODE_ACCES, ...CODES]) {
    assert.ok(!tout.includes(valeur), `trouvé dans les journaux : ${valeur}`);
  }
  assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(tout), 'aucun numéro d’envoi dans les journaux');
  assert.ok(!/[0-9a-f]{64}/.test(tout), 'aucune empreinte dans les journaux');
  for (const l of lignes) {
    const o = JSON.parse(l);
    for (const cle of Object.keys(o)) assert.ok(['evenement', 'route', 'statut', 'duree_ms', 'requete', 'erreur', 'detail', 'nombre', 'manquants'].includes(cle), cle);
  }
});

test('la session cesse avec « Tout effacer » : le compte n’existe plus, la page dit « pas connecté »', async () => {
  const d = await demander('/connexion/google', { origine: null });
  const v = new URL(d.entetes.get('location') ?? '');
  nonceCourant = v.searchParams.get('nonce') ?? '';
  subCourant = 'autre-sub-de-test';
  const r = await demander('/connexion/google/retour', { formulaire: { code: 'c', state: v.searchParams.get('state') ?? '' }, cookie: cookieDe(d.cookies, '__Host-transaction') });
  const session = cookieDe(r.cookies, '__Host-session');
  assert.equal(JSON.parse((await demander('/api/etat', { cookie: session, origine: null })).texte).connexion, 'google');
  await base.pool.query('TRUNCATE compte RESTART IDENTITY');
  assert.equal(JSON.parse((await demander('/api/etat', { cookie: session, origine: null })).texte).connexion, null);
});

test('chez Scalingo : toute demande en clair est renvoyée vers https, et HSTS est posé', async () => {
  const enLigne = configDeTest({ CONTAINER: 'web-1' });
  const app = creerApplication({ config: enLigne, pool: base.pool, journal, horloge, planificateur: null, fetch: fauxMonde });
  await new Promise<void>((r) => app.listen(0, '127.0.0.1', () => r()));
  const ici = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
  try {
    const clair = await fetch(ici + '/', { headers: { 'X-Forwarded-Proto': 'http' }, redirect: 'manual' });
    assert.equal(clair.status, 308);
    assert.equal(clair.headers.get('location'), ORIGINE + '/');
    const chiffre = await fetch(ici + '/', { headers: { 'X-Forwarded-Proto': 'https' } });
    assert.equal(chiffre.status, 200);
    assert.equal(chiffre.headers.get('strict-transport-security'), 'max-age=31536000');
  } finally {
    await new Promise<void>((r) => { app.closeAllConnections(); app.close(() => r()); });
  }
});
