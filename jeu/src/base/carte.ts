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
//
// Ce qui reste lisible en clair dans une copie de la base et dit quelque chose des réponses (dérivés acceptés pour le
// test par Juridique, relecture du 16 octobre 2026, à reporter dans docs/etape-6/donnees.md, partie 4). Ce sont
// probablement des données de l'art. 9, couvertes par le même accord que les réponses ; aucune ne dit un camp à elle
// seule. Les réponses et le « pourquoi » des cartes sont chiffrés (P-02) ; restent en clair :
// - carte.verdict avec carte.visage_membre_id : « juste » dit que le devineur a reconnu l'auteur ; « jumeau » dit que
//   le membre désigné a donné exactement la même réponse que l'auteur (D-024), ce que la révélation montre au devineur.
//   Au départ du membre désigné après 18h, « jumeau » devient « juste » (D-067 ; migration 0002) ;
// - carte.qui_et_pourquoi (usage 1, forme « booleen », durée de sa carte : comme les réponses) : la carte « qui et
//   pourquoi » n'est servie que si la raison de l'auteur n'est pas « aucune » ; une manche sans cette carte dit que
//   toutes les raisons servies étaient « aucune » ;
// - titre, sorte « pas_de_cote » : la réponse de son titulaire à ce texte allait contre son curseur, donc son côté
//   (fuite voulue par le §4 : le badge est annoncé au cercle ; regles.md, section 9). Effacé au départ de son
//   titulaire (D-066, point 1) ; premier candidat au chiffrement à la version publique ;
// - temperament : une part des réponses d'un joueur sur deux mois (règle 13 : L'Original, souvent seul de son côté ;
//   Le Pont, souvent neutre sur les textes qui divisent ; Le Mesuré, souvent neutre ; Le Tranché, souvent « Très … ») ;
// - portrait_dimanche.nettes : quelles tensions étaient nettes au dernier dimanche, sans leur sens (une ligne par
//   joueur) ;
// - compte_semaine, compte_texte_cercle : des comptes de cartes justes, fausses ou passées, sans aucune position.
// L'avis du cercle n'est pas gardé : il se calcule à la lecture (CONTRAT.md, partie 3).
//
// Les durées ci-dessous valent toutes dans une limite : pendant le test, toute donnée de joueur est effacée au plus
// tard à la fin du test (D-061, point 2). « Valable N minutes » est une validité : la ligne part à la passe du ménage
// qui suit (P-31 ; src/base/menage.ts).

import type pg from 'pg';

export type Usage = 1 | 2 | 3 | 4 | 5 | 'public' | 'technique';
export type Forme =
  | 'identifiant' // uuid tiré au hasard
  | 'reference' // uuid d'une autre ligne
  | 'empreinte' // 64 chiffres hexadécimaux (HMAC ou SHA-256)
  | 'jeton_appareil' // hexadécimal : l'adresse technique d'Apple pour le message de 18h
  | 'aleatoire' // base64url ou identifiant opaque tiré par le serveur ou l'application (nonce, défi, étape)
  | 'liste' // une valeur d'une liste fermée
  | 'texte_id' // « T01 »
  | 'date' | 'instant' | 'entier' | 'booleen'
  | 'chiffre' // chiffré par le programme (P-02) : une réponse, 31 octets ; le « pourquoi » d'une carte, 30 octets
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
    usage: 4, duree: 'Jusqu’à la déconnexion de l’appareil ou l’échéance, jamais au-delà de la fin du test ; joueur provisoire : 7 jours au plus',
    colonnes: { id: 'identifiant', empreinte: 'empreinte', joueur_id: 'reference', expire_le: 'instant' },
  },
  connexion_en_cours: {
    usage: 4, duree: 'Valable 10 minutes ; effacée à son usage, sinon à la passe suivante du ménage',
    colonnes: { id: 'identifiant', voie: 'liste', but: 'liste', nonce: 'aleatoire', etat_google: 'aleatoire',
      verificateur_google: 'aleatoire', defi: 'aleatoire', joueur_id: 'reference', expire_le: 'instant' },
  },
  code_retour: {
    usage: 4, duree: 'Valable une minute ; effacé à son usage, sinon à la passe suivante du ménage',
    colonnes: { empreinte: 'empreinte', defi: 'aleatoire', joueur_id: 'reference', refus: 'liste', expire_le: 'instant' },
  },
  code_email: {
    usage: 4, duree: 'Valable 15 minutes, une fois, 5 essais ; ligne gardée 24 heures au plus pour limiter les demandes par adresse, puis effacée par le ménage',
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
    usage: 1, duree: 'Jamais servi : jusqu’à son échéance (7 jours). Servi : tant que le cercle existe, sans plus désigner personne après le départ ou l’effacement de l’invité ; ne fait lire l’invité que 7 jours après sa liaison. Lien de créateur : effacé à son échéance. Score d’entrée : jusqu’à la lecture de l’annonce par l’invitant, 7 jours au plus après la liaison, effacé avec l’invité ou à son départ',
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
    usage: 1, duree: 'Comme les réponses (cercle_regarde : un verrou ; le geste se compte au moment où il a lieu ; validee : un booléen, sans heure)',
    colonnes: { id: 'identifiant', cercle_id: 'reference', devineur_membre_id: 'reference', jour: 'date',
      texte_id: 'texte_id', validee: 'booleen', cercle_regarde: 'booleen' },
  },
  carte: {
    usage: 1, duree: 'Comme les réponses ; une carte part avec son auteur, le visage d’un partant se vide',
    colonnes: { id: 'identifiant', manche_id: 'reference', cercle_id: 'reference', ordre: 'entier',
      auteur_membre_id: 'reference', qui_et_pourquoi: 'booleen', visage_membre_id: 'reference', pourquoi: 'chiffre',
      passee: 'booleen', videe_par_depart: 'booleen', verdict: 'liste' },
  },
  journee_cercle: {
    usage: 1, duree: 'Tant que le cercle existe',
    colonnes: { cercle_id: 'reference', jour: 'date', eveille: 'booleen', titres_calcules: 'booleen' },
  },
  compte_semaine: {
    usage: 1, duree: 'La semaine en cours et la précédente (ménage) ; partent au départ du cercle',
    colonnes: { cercle_id: 'reference', membre_id: 'reference', semaine: 'date', points: 'entier',
      raisons_trouvees: 'entier', tentatives_subies: 'entier', erreurs_subies: 'entier', jours_avec_cartes: 'entier',
      erreurs_faites: 'entier', passes_faites: 'entier', textes_repondus: 'entier' },
  },
  compte_texte_cercle: {
    usage: 1, duree: 'Jusqu’au lundi 18h qui suit sa semaine, comptée au jour où le texte se devine : la surprise de la semaine est alors figée dans les titres (ménage) ; restent au départ d’un auteur',
    colonnes: { cercle_id: 'reference', texte_id: 'texte_id', attributions: 'entier', fausses: 'entier' },
  },
  titre: {
    usage: 1, duree: 'Tant que le cercle existe ; sous « un ancien membre » après un départ (D-045), sauf Le Pas de Côté, effacé au départ de son titulaire (D-066, point 1)',
    colonnes: { id: 'identifiant', cercle_id: 'reference', sorte: 'liste', jour: 'date', membre_id: 'reference',
      texte_id: 'texte_id' },
  },
  temperament: {
    usage: 1, duree: 'Tant qu’il est tenu',
    colonnes: { id: 'identifiant', sorte: 'liste', joueur_id: 'reference', cercle_id: 'reference',
      membre_id: 'reference', depuis: 'date' },
  },
  portrait_dimanche: {
    usage: 1, duree: 'Une seule lecture par joueur, remplacée chaque dimanche',
    colonnes: { joueur_id: 'reference', jour: 'date', nettes: 'entier' },
  },
  vu: {
    usage: 1, duree: 'Sans heure. Révélation : jusqu’au 18h suivant (ménage). Objets d’un cercle : jusqu’au départ de ce cercle. Barre pleine : tant que le compte existe',
    colonnes: { joueur_id: 'reference', objet: 'liste', jour: 'date', cercle_id: 'reference' },
  },
  repondre_ouvert: {
    usage: 1, duree: 'Jusqu’à 18h10 le jour où le texte se ferme (règle 6 ; ménage)',
    colonnes: { joueur_id: 'reference', texte_id: 'texte_id', ouvert_le: 'instant' },
  },
  reprise_revelation: {
    usage: 1, duree: 'Du 18h au 18h suivant (ménage)',
    colonnes: { joueur_id: 'reference', jour: 'date', etape: 'aleatoire' },
  },
  abonnement: {
    usage: 1, duree: 'Jusqu’au retrait, à la déconnexion de l’appareil, à l’effacement, ou au refus d’Apple',
    colonnes: { id: 'identifiant', joueur_id: 'reference', session_id: 'reference', jeton: 'jeton_appareil' },
  },
  message_coupe: {
    usage: 1, duree: 'Jusqu’à ce que le joueur le rallume, ou à l’effacement',
    colonnes: { joueur_id: 'reference' },
  },
  mesures_refusees: {
    usage: 1, duree: 'Tant que le compte existe, ou jusqu’à ce que le joueur retire son refus (art. 21 ; D-066, point 3)',
    colonnes: { joueur_id: 'reference' },
  },
  envoi: {
    usage: 1, duree: 'Usages 1 (un envoi par soir) et 3 (message reçu). 7 jours (ménage), puis seulement des totaux par jour, comptés à l’envoi et à la réception (D-066, point 4)',
    colonnes: { id: 'identifiant', abonnement_id: 'reference', sorte: 'liste', jour: 'date', envoye_a: 'instant',
      reponse_code: 'entier', recu_a: 'instant' },
  },
  compte_aucune: {
    usage: 2, duree: 'Sans limite : anonyme ; non écrit pendant le test (D-066, point 2)',
    colonnes: { texte_id: 'texte_id', reponses: 'entier', aucune: 'entier' },
  },
  compteur: { usage: 3, duree: 'Sans limite : anonyme (des totaux par jour, sans personne)', colonnes: { sorte: 'liste', jour: 'date', nombre: 'entier' } },
  histogramme_raison: {
    usage: 3, duree: 'Sans limite : anonyme (P-40)',
    colonnes: { semaine: 'date', tranche: 'entier', nombre: 'entier' },
  },
  total_mesure: {
    usage: 3, duree: 'Sans limite : anonyme ; trois comptes de mi-bêta (usage 5) : non écrits pendant le test (D-066, point 2), durée à fixer dans l’analyse d’impact',
    colonnes: { periode: 'date', sorte: 'liste', numerateur: 'entier', denominateur: 'entier', joueurs: 'entier' },
  },
  apport_mesure: {
    usage: 3, duree: 'Jusqu’à la fin de sa période (ménage) : le verrou qui fait compter des joueurs distincts (D-066, point 4)',
    colonnes: { joueur_id: 'reference', periode: 'date', sorte: 'liste' },
  },
  effacement: {
    usage: 4, duree: 'Plus longue rotation des sauvegardes, plus 5 jours (P-32) ; joueurs provisoires effacés par le ménage compris ; lu avant toute restauration',
    colonnes: { joueur_id: 'identifiant', efface_le: 'date' },
  },
  tache_du_jour: {
    usage: 'technique', duree: '7 jours (ménage) : le verrou « une fois par jour » du ménage (migration 0004)',
    colonnes: { tache: 'liste', jour: 'date' },
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
  'histogramme_raison', 'total_mesure', 'tache_du_jour', 'migration'];

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
