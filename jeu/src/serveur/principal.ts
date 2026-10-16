// Le point d'entrée du serveur (Procfile : « web: node src/serveur/principal.ts » ; Scalingo installe le dossier jeu/,
// PROJECT_DIR=jeu). Étape 1, travail D (16 octobre 2026). Origine : test-18h/src/principal.ts (12 octobre 2026), adapté.
// Un seul processus : les échanges avec l'application, le message de 18h et le ménage quotidien. Pendant une mise en
// ligne, Scalingo fait tourner l'ancien et le nouveau conteneur ensemble un court moment : les verrous en base
// empêchent le double envoi et le double ménage (planificateur.ts).
//
// Au démarrage :
// 1. les réglages (config.ts) : un réglage dangereux présent chez Scalingo, ou un réglage indispensable absent, et le
//    serveur ne démarre pas ; les autres manques sont signalés par leur NOM et coupent seulement leur fonction ;
// 2. la base : les migrations, puis les rôles des modules (src/base/installation.ts) ;
// 3. une connexion par module (jeu, comptes, envoi, ménage), chacune sous son rôle ;
// 4. le serveur, puis le planificateur. En local, aucun message ne part vers Apple (DECISIONS-TECHNIQUES 1.13).
// Aucune erreur imprévue n'écrit son message, qui pourrait contenir une donnée : seulement son type (P-07).
//
// Le mode préparation (16 octobre 2026 ; CONTRAT.md, 2.17) : si les trois clés manquent toutes et que rien d'autre
// n'empêche de démarrer (`config.preparation`), les étapes 2 à 4 sont sautées. Seul le petit serveur de
// preparation.ts tourne : sans base, sans planificateur ni ménage, il ne sert que la page `/preparer`. Le journal dit
// seulement « mode preparation », sans la liste des réglages manquants.

import { creerPoolModule } from '../base/connexion.ts';
import { installerBase, RepliSansCloison } from '../base/installation.ts';
import { MigrationModifiee } from '../base/migrations.ts';
import { creerEnvoyeurApns } from './apns.ts';
import { creerVerificateurApple } from './apple.ts';
import { lireConfig, type Config } from './config.ts';
import { horlogeAcceleree, horlogeSysteme } from './horloge.ts';
import { creerJournal, typeErreur } from './journal.ts';
import { creerPlanificateur } from './planificateur.ts';
import { creerServeurPreparation } from './preparation.ts';
import { creerRoutes } from './routes.ts';
import { creerServeur } from './serveur.ts';

const journal = creerJournal();

process.on('uncaughtException', (e) => {
  journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
  process.exit(1);
});
process.on('unhandledRejection', (e) => {
  journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
  process.exit(1);
});

const config = lireConfig(process.env);
if (config.refuses.length > 0) {
  journal.ecrire({ evenement: 'demarrage', detail: 'reglages refuses', manquants: config.refuses });
  process.exit(1);
}
if (config.preparation) demarrerPreparation(config);
else await demarrerLeJeu(config);

/** Le mode préparation : la page `/preparer` seulement (preparation.ts). */
function demarrerPreparation(config: Config): void {
  const serveur = creerServeurPreparation(config);
  serveur.listen(config.port, () => journal.ecrire({ evenement: 'demarrage', detail: 'mode preparation' }));
  // Scalingo envoie SIGTERM, puis attend 30 secondes.
  process.on('SIGTERM', () => {
    journal.ecrire({ evenement: 'arret', detail: 'signal' });
    serveur.close(() => process.exit(0));
    serveur.closeAllConnections();
    setTimeout(() => process.exit(0), 20_000).unref();
  });
}

/** Le jeu : la base, les modules, le serveur, le planificateur. */
async function demarrerLeJeu(config: Config): Promise<void> {
  if (!config.peutDemarrer || !config.urlBase) {
    journal.ecrire({ evenement: 'demarrage', detail: config.urlBase ? 'reglages incomplets' : 'pas de base', manquants: config.manquants });
    process.exit(1);
  }
  const urlBase = config.urlBase;
  if (config.manquants.length > 0) journal.ecrire({ evenement: 'reglages', detail: 'reglages incomplets', manquants: config.manquants });
  // Le compte du porteur (étape 1) : on dit seulement que le réglage est présent, jamais sa valeur.
  if (config.comptePorteur) journal.ecrire({ evenement: 'reglages', detail: 'compte porteur', manquants: ['COMPTE_PORTEUR'] });

  try {
    await installerBase(urlBase, config.modeRoles, {}, journal);
  } catch (e) {
    if (e instanceof MigrationModifiee) journal.ecrire({ evenement: 'migration', detail: 'migration modifiee' });
    else if (e instanceof RepliSansCloison) journal.ecrire({ evenement: 'roles', detail: 'repli', erreur: 'repli_sans_cloison' });
    else journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
    process.exit(1);
  }

  // Peu de connexions : la plus petite base de Scalingo en accepte peu (à vérifier à l'ouverture), et le jeu a au plus
  // une trentaine de joueurs pendant le test.
  const pools = {
    jeu: creerPoolModule(urlBase, 'jeu', config.modeRoles, { max: 4 }),
    comptes: creerPoolModule(urlBase, 'comptes', config.modeRoles, { max: 2 }),
    envoi: creerPoolModule(urlBase, 'envoi', config.modeRoles, { max: 2 }),
    menage: creerPoolModule(urlBase, 'menage', config.modeRoles, { max: 1 }),
  };

  // L'horloge : celle du système en ligne ; accélérée en local seulement (ses réglages sont refusés en ligne).
  const accelere = !config.protege && (config.local.horlogeVitesse !== null || config.local.horlogeDepart !== null);
  const vitesse = accelere ? (config.local.horlogeVitesse ?? 1) : 1;
  const horloge = accelere ? horlogeAcceleree(config.local.horlogeDepart, vitesse) : horlogeSysteme;

  const verificateur = config.apple ? creerVerificateurApple({ audience: config.apple.idApplication, horloge }) : null;
  const envoyeur = config.apns && config.enLigne ? creerEnvoyeurApns({ ...config.apns, horloge }) : null;
  const planificateur = creerPlanificateur({ pools, envoyeur, horloge, journal, vitesse });
  const { table, recu } = creerRoutes({ pools, config, verificateur, journal });
  const serveur = creerServeur({ config, pools, horloge, vitesse, journal, table, recu });

  serveur.listen(config.port, () => {
    journal.ecrire({ evenement: 'demarrage', detail: 'pret' });
    planificateur.demarrer();
  });

  // Scalingo envoie SIGTERM, puis attend 30 secondes.
  process.on('SIGTERM', () => {
    journal.ecrire({ evenement: 'arret', detail: 'signal' });
    planificateur.arreter();
    serveur.close(() => {
      void Promise.all(Object.values(pools).map((p) => p.end())).finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 20_000).unref();
  });
}
