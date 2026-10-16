// La carte des données de la base du jeu (P-04 ; docs/etape-6/donnees.md, partie 4) : chaque table, chaque colonne,
// son usage et sa forme. Une colonne absente de cette carte n'a pas le droit d'exister : un test compare la base
// réelle à la carte, colonne par colonne (tests/socle/carte.test.ts).
//
// Usages (D-042, point 2 ; D-052, point 2) : 1 faire tourner le jeu ; 2 la part de « aucune » ; 3 les mesures sur les
// gestes ; 4 la sécurité ; 5 régler les seuils du jeu. « public » : données de l'Assemblée ; « technique » : la
// mémoire des migrations, sans donnée.
//
// Formes : ce qu'une colonne peut contenir. Aucune ne peut porter un nom, une adresse e-mail ou une adresse internet :
// les seules colonnes de texte libre sont le pseudo et le nom du cercle, et la base y refuse « @ », « / », « : » et
// les adresses IP ; les autres textes sont des empreintes hexadécimales, des valeurs d'une liste fermée ou des
// numéros de texte, tous contraints par la base.

import type pg from 'pg';

export type Usage = 1 | 2 | 3 | 4 | 5 | 'public' | 'technique';
export type Forme =
  | 'identifiant' // uuid tiré au hasard
  | 'reference' // uuid d'une autre ligne
  | 'empreinte' // 64 chiffres hexadécimaux (HMAC ou SHA-256)
  | 'jeton_appareil' // hexadécimal : l'adresse technique d'Apple pour le message de 18h
  | 'liste' // une valeur d'une liste fermée
  | 'texte_id' // « T01 »
  | 'date' | 'instant' | 'entier' | 'booleen'
  | 'chiffre' // réponse chiffrée, 31 octets
  | 'pseudo' | 'intitule' | 'rond' // texte court, saisi par le joueur, contraint
  | 'contenu_public' // jsonb, contenu de l'Assemblée
  | 'nom_migration'; // « 0001-tables.sql »

export type Table = { usage: Usage; duree: string; colonnes: Record<string, Forme> };

export const CARTE: Record<string, Table> = {
  texte: {
    usage: 'public', duree: 'Tant que le texte est gardé',
    colonnes: { id: 'texte_id', role: 'liste', tension: 'liste', sens: 'entier', contenu: 'contenu_public',
      empreinte: 'empreinte', erratum: 'contenu_public', retire_des_portraits_le: 'date' },
  },
  calendrier: { usage: 'public', duree: 'Tant que le texte est gardé', colonnes: { jour: 'date', texte_id: 'texte_id' } },
  carte_accord: {
    usage: 'public', duree: 'Tant qu’un accord s’y rapporte',
    colonnes: { version: 'entier', empreinte: 'empreinte', nouvel_accord: 'booleen' },
  },
  joueur: {
    usage: 1, duree: 'Tant que le compte existe ; joueur provisoire : 7 jours au plus ; au plus jusqu’à la fin du test (D-061)',
    colonnes: { id: 'identifiant', etat: 'liste', pseudo: 'pseudo', pseudo_comparaison: 'pseudo', cree_le: 'instant' },
  },
  identite: {
    usage: 1, duree: 'Tant que le compte existe',
    colonnes: { voie: 'liste', empreinte: 'empreinte', joueur_id: 'reference' },
  },
  session: {
    usage: 4, duree: 'Jusqu’à la déconnexion ou l’échéance, jamais au-delà de la fin du test',
    colonnes: { empreinte: 'empreinte', joueur_id: 'reference', expire_le: 'instant' },
  },
  code_email: {
    usage: 4, duree: '15 minutes',
    colonnes: { id: 'identifiant', empreinte_adresse: 'empreinte', empreinte_code: 'empreinte', cree_le: 'instant',
      expire_le: 'instant', essais: 'entier' },
  },
  consentement: {
    usage: 1, duree: 'Tant que le compte existe',
    colonnes: { id: 'identifiant', joueur_id: 'reference', version: 'entier', donne_le: 'instant', quinze_ans_et_plus: 'booleen' },
  },
  cercle: {
    usage: 1, duree: 'Tant qu’il a un membre',
    colonnes: { id: 'identifiant', intitule: 'intitule', entree_1: 'texte_id', entree_2: 'texte_id', entree_3: 'texte_id' },
  },
  membre: {
    usage: 1, duree: 'Jusqu’au départ du cercle ou à l’effacement',
    colonnes: { id: 'identifiant', cercle_id: 'reference', joueur_id: 'reference', rond: 'rond', createur: 'booleen',
      arrive_le: 'instant' },
  },
  invitation: {
    usage: 1, duree: 'Jusqu’à son usage, 7 jours au plus ; le score d’entrée, jusqu’à son échéance',
    colonnes: { id: 'identifiant', sorte: 'liste', empreinte_jeton: 'empreinte', cercle_id: 'reference',
      invitant_membre_id: 'reference', accord_invitant_version: 'entier', accord_invitant_le: 'instant',
      expire_le: 'instant', lie_le: 'instant', invite_joueur_id: 'reference', score_entree: 'entier' },
  },
  reponse: {
    usage: 1, duree: 'Tant que le compte existe ; au départ d’un cercle, elles quittent ce cercle',
    colonnes: { joueur_id: 'reference', texte_id: 'texte_id', moment: 'liste', chiffre: 'chiffre', en_retard: 'booleen',
      consentement_id: 'reference' },
  },
  manche: {
    usage: 1, duree: 'Comme les réponses',
    colonnes: { id: 'identifiant', cercle_id: 'reference', devineur_membre_id: 'reference', jour: 'date',
      texte_id: 'texte_id', validee_le: 'instant' },
  },
  carte: {
    usage: 1, duree: 'Comme les réponses',
    colonnes: { id: 'identifiant', manche_id: 'reference', cercle_id: 'reference', ordre: 'entier',
      auteur_membre_id: 'reference', qui_et_pourquoi: 'booleen', visage_membre_id: 'reference', pourquoi: 'entier',
      passee: 'booleen', verdict: 'liste' },
  },
  journee_cercle: {
    usage: 1, duree: 'Tant que le cercle existe',
    colonnes: { cercle_id: 'reference', jour: 'date', eveille: 'booleen', titres_calcules: 'booleen' },
  },
  compte_semaine: {
    usage: 1, duree: 'Jusqu’au départ du cercle',
    colonnes: { cercle_id: 'reference', membre_id: 'reference', semaine: 'date', points: 'entier',
      raisons_trouvees: 'entier', tentatives_subies: 'entier', erreurs_subies: 'entier', jours_avec_cartes: 'entier',
      erreurs_faites: 'entier', passes_faites: 'entier', textes_repondus: 'entier' },
  },
  compte_texte_cercle: {
    usage: 1, duree: 'Tant que le cercle existe',
    colonnes: { cercle_id: 'reference', texte_id: 'texte_id', attributions: 'entier', fausses: 'entier' },
  },
  titre: {
    usage: 1, duree: 'Tant que le cercle existe ; sous « un ancien membre » après un départ (D-045)',
    colonnes: { id: 'identifiant', cercle_id: 'reference', sorte: 'liste', jour: 'date', membre_id: 'reference',
      texte_id: 'texte_id' },
  },
  temperament: {
    usage: 1, duree: 'Tant qu’il est tenu',
    colonnes: { id: 'identifiant', sorte: 'liste', joueur_id: 'reference', cercle_id: 'reference',
      membre_id: 'reference', depuis: 'date' },
  },
  portrait_dimanche: {
    usage: 1, duree: 'Comme les réponses',
    colonnes: { joueur_id: 'reference', jour: 'date', nettes: 'entier' },
  },
  vu: {
    usage: 1, duree: 'Tant que le compte existe',
    colonnes: { joueur_id: 'reference', objet: 'liste', jour: 'date', membre_id: 'reference', cercle_id: 'reference' },
  },
  abonnement: {
    usage: 1, duree: 'Jusqu’au retrait, à l’effacement, ou au refus d’Apple',
    colonnes: { id: 'identifiant', joueur_id: 'reference', jeton: 'jeton_appareil' },
  },
  envoi: {
    usage: 3, duree: '13 mois au plus (gestes), au plus jusqu’à la fin du test',
    colonnes: { id: 'identifiant', abonnement_id: 'reference', sorte: 'liste', jour: 'date', envoye_a: 'instant',
      reponse_code: 'entier', recu_a: 'instant' },
  },
  compte_aucune: {
    usage: 2, duree: 'Sans limite : anonyme',
    colonnes: { texte_id: 'texte_id', reponses: 'entier', aucune: 'entier' },
  },
  compteur: { usage: 3, duree: 'Sans limite : anonyme', colonnes: { sorte: 'liste', jour: 'date', nombre: 'entier' } },
  histogramme_raison: {
    usage: 3, duree: 'Sans limite : anonyme (P-40)',
    colonnes: { semaine: 'date', tranche: 'entier', nombre: 'entier' },
  },
  total_mesure: {
    usage: 3, duree: 'Sans limite : anonyme ; trois comptes de mi-bêta (usage 5) : à fixer dans l’analyse d’impact',
    colonnes: { periode: 'date', sorte: 'liste', numerateur: 'entier', denominateur: 'entier', effectif: 'entier' },
  },
  effacement: {
    usage: 4, duree: 'Plus longue rotation des sauvegardes, plus 5 jours (P-32)',
    colonnes: { joueur_id: 'identifiant', efface_le: 'date' },
  },
  migration: {
    usage: 'technique', duree: 'Tant que la base existe',
    colonnes: { numero: 'entier', nom: 'nom_migration', empreinte: 'empreinte', jouee_le: 'instant' },
  },
};

/** Les vues que lit le module des mesures (P-23) : des totaux, au-dessus des seuils. */
export const VUES = ['mesure_aucune', 'mesure_compteurs', 'mesure_histogramme', 'mesure_totaux'];

/** Les tables sans aucune donnée de joueur. */
export const TABLES_SANS_JOUEUR = ['texte', 'calendrier', 'carte_accord', 'compte_aucune', 'compteur',
  'histogramme_raison', 'total_mesure', 'migration'];

/** Les colonnes réelles d'un schéma : { table: [colonnes] }, vues comprises. */
export async function colonnesReelles(client: pg.Pool | pg.ClientBase, schema: string): Promise<Record<string, string[]>> {
  const r = await client.query<{ table_name: string; column_name: string }>(
    `SELECT c.table_name, c.column_name FROM information_schema.columns c
       JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = $1 AND t.table_type = 'BASE TABLE' ORDER BY c.table_name, c.ordinal_position`, [schema]);
  const sortie: Record<string, string[]> = {};
  for (const l of r.rows) (sortie[l.table_name] ??= []).push(l.column_name);
  return sortie;
}
