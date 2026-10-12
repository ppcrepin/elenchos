// JETABLE (test du message de 18h) : le point d'entrée (Procfile : « web: node src/principal.ts »).
// Un seul processus : la page, la page de résultats et l'horloge de 18h. Pendant une mise en ligne, Scalingo fait
// tourner l'ancien et le nouveau conteneur ensemble un court moment : le verrou en base empêche le double envoi.

import { creerPool, preparerSchema } from './base.ts';
import { lireConfig } from './config.ts';
import { horlogeSysteme } from './horloge.ts';
import { creerJournal, typeErreur } from './journal.ts';
import { creerPlanificateur } from './planificateur.ts';
import { creerEnvoyeur } from './push/envoyeur.ts';
import { creerApplication } from './serveur.ts';

const journal = creerJournal();

// Aucune erreur non prévue n'écrit son message (il pourrait contenir une donnée) : seulement son type (P-07).
process.on('uncaughtException', (e) => {
  journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
  process.exit(1);
});
process.on('unhandledRejection', (e) => {
  journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
  process.exit(1);
});

const config = lireConfig(process.env);
if (!config.urlBase) {
  journal.ecrire({ evenement: 'demarrage', detail: 'pas de base', manquants: config.manquants });
  process.exit(1);
}
if (config.manquants.length > 0) journal.ecrire({ evenement: 'reglages', detail: 'reglages incomplets', manquants: config.manquants });

const pool = creerPool(config.urlBase);
await preparerSchema(pool);
journal.ecrire({ evenement: 'schema', detail: 'schema pret' });

const planificateur = config.vapid
  ? creerPlanificateur({
    pool,
    envoyeur: creerEnvoyeur(config.vapid, horlogeSysteme),
    horloge: horlogeSysteme,
    journal,
    soirs: config.soirs ?? [],
    adressePublique: config.adressePublique,
  })
  : null;

const serveur = creerApplication({ config, pool, journal, horloge: horlogeSysteme, planificateur });
serveur.listen(config.port, () => {
  journal.ecrire({ evenement: 'demarrage', detail: 'pret' });
  if (planificateur && config.soirs) planificateur.demarrer();
  else journal.ecrire({ evenement: 'planificateur', detail: 'horloge arretee' });
});

// Scalingo envoie SIGTERM, puis attend 30 secondes.
process.on('SIGTERM', () => {
  journal.ecrire({ evenement: 'arret', detail: 'signal' });
  planificateur?.arreter();
  serveur.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(0), 20_000).unref();
});
