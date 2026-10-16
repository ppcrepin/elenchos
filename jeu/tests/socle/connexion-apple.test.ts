// La connexion Apple de bout en bout (src/serveur/connexion.ts ; CONTRAT.md, 2.5), contre un faux service de clés
// d'Apple et de faux jetons : le nonce donné par le serveur, le vérificateur (empreinte au début, octets à la fin), le
// jeton vérifié. Signature fausse, audience fausse, jeton échu : connexion_echouee, et la connexion reste ouverte pour
// le vrai jeton ; nonce faux ou rejoué, connexion de plus de 10 minutes : connexion_expiree ; vérificateur faux :
// connexion_echouee, et la connexion est consommée. Puis ce que devient le joueur, à la lettre du contrat : « J'ai déjà
// un compte » sans compte (compte_inconnu, rien de créé), un compte retrouvé, un créateur au bout de son défi, un invité
// (étape 2) ; et le compte du porteur à l'étape 1 (COMPTE_PORTEUR), une seule fois, tant qu'aucun compte n'existe.
// Joué dans les deux modes de la base.

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';
import { enTransaction } from '../../src/base/connexion.ts';
import type { ModeRoles } from '../../src/serveur/config.ts';
import { b64url, empreinte, empreinteIdentite } from '../../src/serveur/crypto.ts';
import { ouvrirSession } from '../../src/serveur/sessions.ts';
import { pseudoComparaison } from '../../src/regles/cercle.ts';
import { AUDIENCE, cleDeTest, contenuJuste, jetonApple } from './aides-apple.ts';
import { baseDeTest, commeJoueur, contenuPublic, creerCercle, inviter, nouveauJoueur, repondre, type BaseDeTest } from './aides.ts';
import { CLE_APPLE, serveurDeTest, verificateurEtDefi, type ServeurDeTest } from './aides-serveur.ts';

const MERCREDI_10H = new Date('2026-10-21T08:00:00Z');
const SUB_PORTEUR = '001234.porteur7q2.0001';
const SUB_AUTRE = '009876.inconnu7q2.0002';
const PSEUDO_PORTEUR = 'Porteur-Q7';

for (const mode of ['roles', 'repli'] as ModeRoles[]) {
  describe(`la connexion Apple, mode « ${mode} »`, () => {
    let base: BaseDeTest;
    let s: ServeurDeTest;

    before(async () => {
      base = await baseDeTest(mode);
      await contenuPublic(base);
      s = await serveurDeTest(base, MERCREDI_10H, { COMPTE_PORTEUR: PSEUDO_PORTEUR });
    });
    after(async () => {
      await s?.fin();
      await base?.fin();
    });

    /** Commencer, comme l'application : le défi au début ; rend le nonce et le vérificateur. */
    async function commencer(but: 'creation' | 'connexion', jeton?: string) {
      const { verificateur, defi } = verificateurEtDefi();
      const r = await s.demande('POST', '/api/connexion/debut', { ...(jeton ? { jeton } : {}), corps: { voie: 'apple', but, defi } });
      return { r, verificateur, nonce: r.json?.donnees?.nonce as string };
    }
    const finir = (jetonIdentite: string, verificateur: string, jeton?: string) =>
      s.demande('POST', '/api/connexion/apple', { ...(jeton ? { jeton } : {}), corps: { jetonIdentite, verificateur } });
    const comptes = async () => Number((await base.admin.query<{ n: string }>("SELECT count(*)::text AS n FROM joueur WHERE etat = 'compte'")).rows[0]?.n);

    test('le début : un nonce neuf pour Apple ; Google attend l’étape 2 ; « creation » sans défi ni réglage du porteur : etape_incorrecte', async () => {
      const a = await commencer('connexion');
      assert.equal(a.r.statut, 200);
      assert.deepEqual(Object.keys(a.r.json.donnees).sort(), ['nonce', 'voie']);
      assert.match(a.nonce, /^[A-Za-z0-9_-]{43}$/);
      assert.notEqual((await commencer('connexion')).nonce, a.nonce);
      const g = await s.demande('POST', '/api/connexion/debut', { corps: { voie: 'google', but: 'connexion', defi: 'd'.repeat(43) } });
      assert.equal(g.json.erreur, 'indisponible');
      const sans = await serveurDeTest(base, MERCREDI_10H);
      try {
        const { defi } = verificateurEtDefi();
        const c = await sans.demande('POST', '/api/connexion/debut', { corps: { voie: 'apple', but: 'creation', defi } });
        assert.equal(c.statut, 409);
        assert.equal(c.json.erreur, 'etape_incorrecte');
      } finally {
        await sans.fin();
      }
      // Rien de la connexion en cours n'est lisible ailleurs que par les comptes, et rien de ce qu'Apple renvoie n'y est.
      const l = await base.admin.query("SELECT voie, but, joueur_id FROM connexion_en_cours WHERE nonce = $1", [a.nonce]);
      assert.deepEqual(l.rows.map((x: object) => ({ ...x })), [{ voie: 'apple', but: 'connexion', joueur_id: null }]);
    });

    test('signature fausse, audience fausse, jeton échu, émetteur faux : connexion_echouee ; la connexion attend le vrai jeton', async () => {
      const { verificateur, nonce } = await commencer('connexion');
      const intruse = cleDeTest(CLE_APPLE.kid);
      const juste = contenuJuste(MERCREDI_10H, nonce, SUB_AUTRE);
      for (const j of [
        jetonApple(intruse, juste), jetonApple(CLE_APPLE, { ...juste, aud: 'fr.exemple.autre' }),
        jetonApple(CLE_APPLE, { ...juste, exp: Math.floor(MERCREDI_10H.getTime() / 1000) - 1 }),
        jetonApple(CLE_APPLE, { ...juste, iss: 'https://accounts.google.com' }), 'pas.un.jeton',
      ]) {
        const r = await finir(j, verificateur);
        assert.equal(r.statut, 200);
        assert.deepEqual(r.json.donnees, { etat: 'connexion_echouee' });
      }
      // Les faux jetons n'ont pas consommé la connexion : le vrai jeton pourra encore la finir.
      const n = await base.admin.query('SELECT 1 FROM connexion_en_cours WHERE nonce = $1', [nonce]);
      assert.equal(n.rowCount, 1);
    });

    test('le compte du porteur (étape 1) : la première connexion Apple ouvre un compte sous son pseudo, une seule fois', async () => {
      assert.equal(await comptes(), 0);
      const { verificateur, nonce } = await commencer('connexion');
      const r = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, nonce, SUB_PORTEUR)), verificateur);
      assert.equal(r.json.donnees.etat, 'connecte');
      const jeton = r.json.donnees.jeton as string;
      assert.match(jeton, /^[A-Za-z0-9_-]{43}$/);
      assert.equal(await comptes(), 1);
      // La base ne garde que des empreintes : ni l'identifiant d'Apple, ni le jeton.
      const id = await base.admin.query<{ joueur_id: string }>("SELECT joueur_id FROM identite WHERE voie = 'apple' AND empreinte = $1",
        [empreinteIdentite(s.config.cleIdentites as Buffer, 'identite', `apple:${SUB_PORTEUR}`)]);
      assert.equal(id.rowCount, 1);
      const joueur = id.rows[0]?.joueur_id as string;
      const tout = JSON.stringify((await base.admin.query('SELECT * FROM identite')).rows) + JSON.stringify((await base.admin.query('SELECT * FROM session')).rows);
      assert.ok(!tout.includes(SUB_PORTEUR) && !tout.includes(jeton));
      const sess = await base.admin.query('SELECT 1 FROM session WHERE empreinte = $1 AND joueur_id = $2',
        [empreinte(s.config.secretSession as Buffer, 'session', jeton), joueur]);
      assert.equal(sess.rowCount, 1);
      // L'état : un compte, sans cercle, sans accord.
      const etat = await s.demande('GET', '/api/etat', { jeton });
      assert.deepEqual([etat.json.donnees.session, etat.json.donnees.parcours, etat.json.donnees.accordAJour],
        ['compte', { etape: 'nommer_cercle', premierCercle: true }, false]);
      assert.equal((await base.admin.query<{ pseudo: string }>('SELECT pseudo FROM joueur WHERE id = $1', [joueur])).rows[0]?.pseudo, PSEUDO_PORTEUR);
      // Une autre identité, ensuite : un compte existe, le réglage n'a plus d'effet.
      const autre = await commencer('connexion');
      const ra = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, autre.nonce, SUB_AUTRE)), autre.verificateur);
      assert.deepEqual(ra.json.donnees, { etat: 'compte_inconnu' });
      assert.equal(await comptes(), 1);
      assert.equal((await base.admin.query("SELECT 1 FROM joueur WHERE etat = 'provisoire'")).rowCount, 0, 'aucun reste');
      const creation = await commencer('creation');
      assert.equal(creation.r.json.erreur, 'etape_incorrecte');
      // Le porteur se reconnecte (un autre iPhone, ou après « Se déconnecter ») : son compte, une nouvelle session.
      const re = await commencer('connexion');
      const rr = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, re.nonce, SUB_PORTEUR)), re.verificateur);
      assert.equal(rr.json.donnees.etat, 'connecte');
      assert.notEqual(rr.json.donnees.jeton, jeton);
      assert.equal(await comptes(), 1);
      assert.equal((await base.admin.query('SELECT 1 FROM session WHERE joueur_id = $1', [joueur])).rowCount, 2);
      // Avec une session de compte, on ne recommence pas une connexion.
      assert.equal((await commencer('connexion', jeton)).r.json.erreur, 'etape_incorrecte');
    });

    test('nonce faux ou rejoué, connexion de plus de 10 minutes : connexion_expiree', async () => {
      const a = await commencer('connexion');
      const faux = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, b64url(randomBytes(32)), SUB_PORTEUR)), a.verificateur);
      assert.equal(faux.statut, 410);
      assert.equal(faux.json.erreur, 'connexion_expiree');
      const bon = jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, a.nonce, SUB_PORTEUR));
      assert.equal((await finir(bon, a.verificateur)).json.donnees.etat, 'connecte');
      assert.equal((await finir(bon, a.verificateur)).json.erreur, 'connexion_expiree', 'rejoué');
      const b = await commencer('connexion');
      s.horloge.avancer(10 * 60_000);
      const tard = await finir(jetonApple(CLE_APPLE, contenuJuste(s.horloge.maintenant(), b.nonce, SUB_PORTEUR)), b.verificateur);
      assert.equal(tard.json.erreur, 'connexion_expiree');
      s.horloge.regler(MERCREDI_10H);
    });

    test('vérificateur faux : connexion_echouee, et la connexion est consommée (un jeton d’Apple volé ne sert à rien)', async () => {
      const a = await commencer('connexion');
      const jeton = jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, a.nonce, SUB_PORTEUR));
      const r = await finir(jeton, verificateurEtDefi().verificateur);
      assert.deepEqual(r.json.donnees, { etat: 'connexion_echouee' });
      assert.equal((await finir(jeton, a.verificateur)).json.erreur, 'connexion_expiree');
    });

    test('un créateur au bout de son défi devient un compte : même joueur, sa session provisoire remplacée', async () => {
      // Un joueur provisoire (option B) : son accord, ses trois réponses d'entrée, son pseudo, son lien de créateur lié.
      const id = randomUUID();
      const consentement = randomUUID();
      const lien = { id: randomUUID(), jeton: randomBytes(32).toString('hex') };
      await base.module('proprietaire').query(
        "INSERT INTO invitation (id, sorte, empreinte_jeton, expire_le) VALUES ($1, 'createur', $2, now() + interval '7 days')", [lien.id, lien.jeton]);
      await commeJoueur(base, id, async (c) => {
        await c.query("INSERT INTO joueur (id, etat, cree_le) VALUES ($1, 'provisoire', now())", [id]);
        await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), true)', [consentement, id]);
        await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE empreinte_jeton = $2', [id, lien.jeton]);
        for (const t of ['T01', 'T02']) await repondre(c, { id, consentement } as never, t, { position: 4, raison: 1 }, 'entree');
      }, lien.jeton, MERCREDI_10H);
      const provisoire = await enTransaction(base.module('comptes'), {}, (c) => ouvrirSession(c, s.config.secretSession as Buffer, id,
        new Date(MERCREDI_10H.getTime() + 7 * 86_400_000)));
      // Deux réponses sur trois, pas de pseudo : le défi n'est pas fini.
      assert.equal((await commencer('creation', provisoire)).r.json.erreur, 'etape_incorrecte');
      const etatEntree = await s.demande('GET', '/api/etat', { jeton: provisoire });
      assert.deepEqual([etatEntree.json.donnees.session, etatEntree.json.donnees.parcours],
        ['provisoire', { etape: 'entree', mode: 'createur', invitant: null, faits: 2 }]);
      await commeJoueur(base, id, async (c) => {
        await repondre(c, { id, consentement } as never, 'T03', { position: 2, raison: 0 }, 'entree');
        await c.query('UPDATE joueur SET pseudo = $2, pseudo_comparaison = $3 WHERE id = $1', [id, 'Createur-Q7', pseudoComparaison('Createur-Q7')]);
      }, undefined, MERCREDI_10H);
      assert.deepEqual((await s.demande('GET', '/api/etat', { jeton: provisoire })).json.donnees.parcours, { etape: 'entree_finie', mode: 'createur' });
      const a = await commencer('creation', provisoire);
      assert.equal(a.r.statut, 200);
      const r = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, a.nonce, '001111.createur7q2.0003')), a.verificateur, provisoire);
      assert.equal(r.json.donnees.etat, 'connecte');
      const etat = await base.admin.query<{ etat: string; pseudo: string }>('SELECT etat, pseudo FROM joueur WHERE id = $1', [id]);
      assert.deepEqual({ ...etat.rows[0] }, { etat: 'compte', pseudo: 'Createur-Q7' });
      assert.equal((await base.admin.query('SELECT 1 FROM reponse WHERE joueur_id = $1', [id])).rowCount, 3, 'ses réponses d’entrée restent');
      assert.equal((await s.demande('GET', '/api/etat', { jeton: provisoire })).json.donnees.session, 'aucune', 'session provisoire remplacée');
      const compte = await s.demande('GET', '/api/etat', { jeton: r.json.donnees.jeton });
      assert.deepEqual([compte.json.donnees.session, compte.json.donnees.parcours, compte.json.donnees.accordAJour],
        ['compte', { etape: 'nommer_cercle', premierCercle: true }, true]);
    });

    test('un invité au bout de son défi : étape 2 (entrée dans le cercle, annonce d’arrivée) ; rien n’est créé', async () => {
      const thomas = await nouveauJoueur(base, 'Thomas-Q7', 'T');
      const cercle = await creerCercle(base, thomas, 'Famille-Q7');
      const inv = await inviter(base, cercle, thomas);
      const id = randomUUID();
      const consentement = randomUUID();
      await commeJoueur(base, id, async (c) => {
        await c.query("INSERT INTO joueur (id, etat, pseudo, pseudo_comparaison, cree_le) VALUES ($1, 'provisoire', 'Marie-Q7', 'marie-q7', now())", [id]);
        await c.query('INSERT INTO consentement (id, joueur_id, version, donne_le, quinze_ans_et_plus) VALUES ($1, $2, 1, now(), true)', [consentement, id]);
        await c.query('UPDATE invitation SET invite_joueur_id = $1, lie_le = now() WHERE empreinte_jeton = $2', [id, inv.jeton]);
        for (const t of ['T01', 'T02', 'T03']) await repondre(c, { id, consentement } as never, t, { position: 3, raison: 2 }, 'entree');
      }, inv.jeton, MERCREDI_10H);
      const provisoire = await enTransaction(base.module('comptes'), {}, (c) => ouvrirSession(c, s.config.secretSession as Buffer, id,
        new Date(MERCREDI_10H.getTime() + 7 * 86_400_000)));
      const etat = await s.demande('GET', '/api/etat', { jeton: provisoire });
      assert.deepEqual(etat.json.donnees.parcours, { etape: 'entree_finie', mode: 'invite' });
      const a = await commencer('creation', provisoire);
      const r = await finir(jetonApple(CLE_APPLE, contenuJuste(MERCREDI_10H, a.nonce, '002222.invitee7q2.0004')), a.verificateur, provisoire);
      assert.equal(r.statut, 404);
      assert.equal(r.json.erreur, 'introuvable');
      assert.equal((await base.admin.query<{ etat: string }>('SELECT etat FROM joueur WHERE id = $1', [id])).rows[0]?.etat, 'provisoire');
    });

    test('le journal n’a reçu ni identifiant d’Apple, ni nonce, ni jeton, ni pseudo', () => {
      const tout = s.journal.join('');
      for (const v of [SUB_PORTEUR, SUB_AUTRE, PSEUDO_PORTEUR, 'Createur-Q7', 'Marie-Q7', AUDIENCE]) assert.ok(!tout.includes(v), v);
      assert.ok(s.journal.some((l) => l.includes('"detail":"compte porteur"')));
      assert.ok(s.journal.some((l) => l.includes('"detail":"verificateur faux"')));
      assert.ok(s.journal.some((l) => l.includes('"erreur":"signature"')));
    });
  });
}
