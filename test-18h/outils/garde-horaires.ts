// REPRIS pour le vrai jeu (proposé) : la garde des horaires, lancée par la fabrication chez Scalingo (« npm run build »).
// Elle échoue de 15h à 19h et le dimanche, heure de Paris : la fabrication échoue, et Scalingo n'installe rien (D-043).

import { verifierHoraires } from '../src/garde-horaires.ts';

const verdict = verifierHoraires(new Date(), process.env);
process.stdout.write(verdict.message + '\n');
process.exit(verdict.ok ? 0 : 1);
