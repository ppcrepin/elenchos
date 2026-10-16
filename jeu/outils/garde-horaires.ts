// Origine : test-18h/outils/garde-horaires.ts (REPRIS, 12 octobre 2026), copié tel quel.
// La garde des horaires, lancée par la fabrication chez Scalingo et par la fabrication de l'application : elle échoue
// de 15h à 19h et le dimanche, heure de Paris, et rien ne s'installe (D-043, D-054).

import { verifierHoraires } from '../src/serveur/garde-horaires.ts';

const verdict = verifierHoraires(new Date(), process.env);
process.stdout.write(verdict.message + '\n');
process.exit(verdict.ok ? 0 : 1);
