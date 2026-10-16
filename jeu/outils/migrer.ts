// Prépare la base : les migrations en attente, puis, en mode « roles », les rôles des modules et leurs droits.
// Lancé avant le serveur (et par lui au démarrage). Il n'écrit que par le journal : aucune valeur, aucun réglage.
// Il refuse de tourner si un réglage dangereux est présent chez Scalingo ou sur GitHub (config.ts).

import { installerBase } from '../src/base/installation.ts';
import { MigrationModifiee } from '../src/base/migrations.ts';
import { lireConfig } from '../src/serveur/config.ts';
import { creerJournal, typeErreur } from '../src/serveur/journal.ts';

const journal = creerJournal();
const config = lireConfig(process.env);
if (!config.urlBase) {
  journal.ecrire({ evenement: 'migration', detail: 'pas de base', manquants: config.manquants });
  process.exit(1);
}
if (config.refuses.length > 0) {
  journal.ecrire({ evenement: 'reglages', detail: 'reglages refuses', manquants: config.refuses });
  process.exit(1);
}
try {
  await installerBase(config.urlBase, config.modeRoles, {}, journal);
} catch (e) {
  if (e instanceof MigrationModifiee) journal.ecrire({ evenement: 'migration', detail: 'migration modifiee' });
  else journal.ecrire({ evenement: 'erreur', erreur: typeErreur(e) });
  process.exit(1);
}
