// Les rôles des modules et leurs droits (P-22 ; DECISIONS-TECHNIQUES 1.6). En mode « roles » seulement.
//
// Cinq rôles sans mot de passe (NOLOGIN) : elenchos_jeu, elenchos_comptes, elenchos_envoi, elenchos_menage,
// elenchos_mesures. Aucun ne possède de table : les règles de cloisonnement s'appliquent à eux. Les connexions s'ouvrent
// au nom du propriétaire (l'adresse de Scalingo) et prennent le rôle de leur module dès l'ouverture (connexion.ts).
// Le propriétaire doit donc pouvoir créer ces rôles (CREATEROLE) : c'est ce qui reste à vérifier chez Scalingo. Sinon,
// le mode « repli » (LISEZMOI.md).
//
// DROITS est la seule source : la préparation l'applique, et un test compare les droits réels de la base à cette
// liste (un droit en trop fait échouer, P-22).

import type pg from 'pg';
import { MODULES, nomRole, type Module } from './connexion.ts';

/** Un droit sur une table ou une vue : « SELECT », « INSERT », « DELETE », « UPDATE », ou « UPDATE(col, col) ». */
export type Droit = string;

export type DroitsModule = {
  tables: Record<string, Droit[]>;
  fonctions: string[]; // signatures, ex. « compter_reponse(text, boolean) »
};

/** Les fonctions que les règles de cloisonnement appellent : tout rôle qui touche une table cloisonnée doit pouvoir
 *  les exécuter (PostgreSQL vérifie ce droit même pour une règle qui ne s'applique pas à lui). Elles ne rendent que ce
 *  qui concerne le joueur déclaré. */
const FONCTIONS_DES_REGLES = [
  'module_courant()', 'joueur_courant()', 'jeton_courant()', 'instant_du_jeu()', 'fin_du_jour_de_jeu(date)',
  'cloison_mes_cercles()', 'cloison_mes_membres()',
  'cloison_mes_proches()', 'cloison_mes_invitations()', 'cloison_cercles_invitation()', 'cloison_invitants_membres()',
  'cloison_invitants_joueurs()', 'cloison_reponses_offertes()', 'cloison_peut_entrer(uuid)',
];

export const DROITS: Record<Module, DroitsModule> = {
  jeu: {
    tables: {
      texte: ['SELECT'],
      calendrier: ['SELECT'],
      carte_accord: ['SELECT'],
      joueur: ['SELECT', 'INSERT', 'UPDATE(pseudo, pseudo_comparaison)'],
      consentement: ['SELECT', 'INSERT'],
      cercle: ['SELECT', 'INSERT', 'UPDATE(intitule)'],
      membre: ['SELECT', 'INSERT', 'DELETE'],
      invitation: ['SELECT', 'INSERT', 'UPDATE(invite_joueur_id, lie_le, score_entree)'],
      reponse: ['SELECT', 'INSERT'],
      manche: ['SELECT', 'INSERT', 'UPDATE(validee, cercle_regarde)'],
      carte: ['SELECT', 'INSERT', 'UPDATE(visage_membre_id, pourquoi, passee, videe_par_depart, verdict)'],
      journee_cercle: ['SELECT', 'INSERT', 'UPDATE(eveille, titres_calcules)'],
      compte_semaine: ['SELECT', 'INSERT', 'UPDATE(points, raisons_trouvees, tentatives_subies, erreurs_subies, jours_avec_cartes, erreurs_faites, passes_faites, textes_repondus)'],
      compte_texte_cercle: ['SELECT', 'INSERT', 'UPDATE(attributions, fausses)'],
      titre: ['SELECT', 'INSERT'],
      temperament: ['SELECT', 'INSERT', 'UPDATE(depuis)', 'DELETE'],
      portrait_dimanche: ['SELECT', 'INSERT', 'UPDATE(jour, nettes)'], // une ligne, remplacée chaque dimanche
      vu: ['SELECT', 'INSERT'],
      repondre_ouvert: ['SELECT', 'INSERT'],
      reprise_revelation: ['SELECT', 'INSERT', 'UPDATE(etape)'],
      // Le jeton d'appareil se remplace sans effacer la ligne, ni donc l'envoi du soir qui la verrouille (routes.ts).
      abonnement: ['SELECT', 'INSERT', 'UPDATE(jeton)', 'DELETE'],
      message_coupe: ['SELECT', 'INSERT', 'DELETE'],
      mesures_refusees: ['SELECT', 'INSERT', 'DELETE'], // le refus des mesures, posé et retiré par le joueur (D-066)
    },
    fonctions: [
      ...FONCTIONS_DES_REGLES,
      'compter_reponse(text, boolean)', 'ajouter_compteur(text, date)', 'ajouter_histogramme(date, smallint)',
      'ajouter_mesure(date, text, bigint, bigint)', 'oublier_scores(uuid)', 'cloison_ont_repondu(text)',
    ],
  },
  comptes: {
    tables: {
      joueur: ['SELECT(id, etat)', 'UPDATE(etat)', 'DELETE'],
      identite: ['SELECT', 'INSERT', 'DELETE'],
      session: ['SELECT', 'INSERT', 'UPDATE(expire_le)', 'DELETE'],
      connexion_en_cours: ['SELECT', 'INSERT', 'DELETE'],
      code_retour: ['SELECT', 'INSERT', 'DELETE'],
      code_email: ['SELECT', 'INSERT', 'UPDATE(essais)', 'DELETE'],
    },
    fonctions: [...FONCTIONS_DES_REGLES],
  },
  envoi: {
    tables: {
      abonnement: ['SELECT', 'DELETE'],
      message_coupe: ['SELECT'],
      envoi: ['SELECT', 'INSERT', 'UPDATE(reponse_code, recu_a)'],
    },
    // « message envoyé » et « message reçu », comptés au moment de l'envoi et de la réception (D-066, point 4).
    fonctions: [...FONCTIONS_DES_REGLES, 'ajouter_compteur(text, date)'],
  },
  menage: {
    tables: {
      texte: ['SELECT'],
      calendrier: ['SELECT'],
      carte_accord: ['SELECT'],
      ...Object.fromEntries(['joueur', 'identite', 'session', 'connexion_en_cours', 'code_retour', 'code_email',
        'consentement', 'cercle', 'membre', 'reponse', 'manche', 'carte', 'journee_cercle', 'compte_semaine',
        'compte_texte_cercle', 'titre', 'temperament', 'portrait_dimanche', 'vu', 'repondre_ouvert',
        'reprise_revelation', 'abonnement', 'message_coupe', 'mesures_refusees', 'envoi', 'apport_mesure']
        .map((t) => [t, ['SELECT', 'DELETE']])),
      invitation: ['SELECT', 'DELETE', 'UPDATE(score_entree)'],
      effacement: ['SELECT', 'INSERT', 'DELETE'],
      // La tâche du jour : le ménage ne tourne qu'une fois par jour (migration 0004, menage.ts).
      tache_du_jour: ['SELECT', 'INSERT', 'DELETE'],
    },
    fonctions: [...FONCTIONS_DES_REGLES],
  },
  mesures: {
    tables: {
      mesure_aucune: ['SELECT'],
      mesure_totaux: ['SELECT'],
      mesure_compteurs: ['SELECT'],
      mesure_histogramme: ['SELECT'],
    },
    // Les fonctions d'une vue s'exécutent avec les droits de qui la lit : la vue de « aucune » juge l'heure de la
    // révélation avec elles.
    fonctions: ['module_courant()', 'instant_du_jeu()', 'fin_du_jour_de_jeu(date)'],
  },
};

function identifiant(nom: string): string {
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(nom)) throw new Error('identifiant illisible');
  return `"${nom}"`;
}

/** Crée les rôles qui manquent et permet au propriétaire de les prendre (SET), sans hériter de leurs droits. */
export async function creerRoles(client: pg.ClientBase): Promise<void> {
  const version = Number((await client.query<{ v: string }>("SELECT current_setting('server_version_num') AS v")).rows[0]?.v);
  for (const module of MODULES) {
    const role = nomRole(module);
    const existe = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);
    if (existe.rowCount === 0) await client.query(`CREATE ROLE ${identifiant(role)} NOLOGIN NOINHERIT`);
    // PostgreSQL 16 distingue « prendre le rôle » (SET) et « hériter de ses droits » (INHERIT) ; avant, l'appartenance
    // suffit. Le propriétaire n'hérite de rien : il a déjà tout sur ses tables.
    await client.query(version >= 160000
      ? `GRANT ${identifiant(role)} TO CURRENT_USER WITH SET TRUE, INHERIT FALSE`
      : `GRANT ${identifiant(role)} TO CURRENT_USER`);
  }
}

/** Retire tous les droits des rôles des modules sur le schéma courant, puis donne exactement ceux de DROITS. */
export async function appliquerDroits(client: pg.ClientBase): Promise<void> {
  const schema = (await client.query<{ s: string }>('SELECT current_schema() AS s')).rows[0]?.s;
  if (!schema) throw new Error('schéma courant introuvable');
  const roles = MODULES.map((m) => identifiant(nomRole(m))).join(', ');
  const s = identifiant(schema);
  await client.query(`REVOKE ALL ON ALL TABLES IN SCHEMA ${s} FROM PUBLIC, ${roles}`);
  await client.query(`REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ${s} FROM PUBLIC, ${roles}`);
  await client.query(`REVOKE ALL ON SCHEMA ${s} FROM ${roles}`);
  // Les droits par colonne survivent à « REVOKE ALL ON ALL TABLES » : on les retire table par table.
  const colonnes = await client.query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = $1`, [schema]);
  const parTable = new Map<string, string[]>();
  for (const c of colonnes.rows) parTable.set(c.table_name, [...(parTable.get(c.table_name) ?? []), c.column_name]);
  for (const [table, cols] of parTable) {
    await client.query(`REVOKE ALL (${cols.map(identifiant).join(', ')}) ON ${identifiant(table)} FROM ${roles}`);
  }
  for (const module of MODULES) {
    const role = identifiant(nomRole(module));
    await client.query(`GRANT USAGE ON SCHEMA ${s} TO ${role}`);
    for (const [table, droits] of Object.entries(DROITS[module].tables)) {
      for (const droit of droits) {
        const m = /^(SELECT|INSERT|UPDATE|DELETE)(?:\(([a-z_, ]+)\))?$/.exec(droit);
        if (!m) throw new Error('droit illisible');
        const cols = m[2] ? `(${m[2].split(',').map((c) => identifiant(c.trim())).join(', ')})` : '';
        await client.query(`GRANT ${m[1]} ${cols} ON ${identifiant(table)} TO ${role}`);
      }
    }
    for (const f of DROITS[module].fonctions) {
      const m = /^([a-z_]+)\(([a-z, ]*)\)$/.exec(f);
      if (!m || !m[1]) throw new Error('fonction illisible');
      await client.query(`GRANT EXECUTE ON FUNCTION ${identifiant(m[1])}(${m[2] ?? ''}) TO ${role}`);
    }
  }
}
