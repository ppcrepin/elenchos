// Origine : test-18h/outils/garde-horaires.ts (REPRIS, 12 octobre 2026), copié tel quel.
// La garde des horaires, lancée par la fabrication chez Scalingo (script « build » de package.json) : elle échoue de
// 15h à 19h et le dimanche, heure de Paris, et rien ne s'installe (D-043, D-054).
// La fabrication de l'application pour TestFlight ne l'appelle pas : elle a sa propre règle, plus stricte, écrite en
// shell dans .github/workflows/app-testflight.yml (refus dès 14h et le dimanche, puis de nouveau à 15h avant l'envoi ;
// DECISIONS-TECHNIQUES 1.15). Deux règles, donc deux codes : qui change l'une vérifie l'autre.

import { verifierHoraires } from '../src/serveur/garde-horaires.ts';

const verdict = verifierHoraires(new Date(), process.env);
process.stdout.write(verdict.message + '\n');
process.exit(verdict.ok ? 0 : 1);
