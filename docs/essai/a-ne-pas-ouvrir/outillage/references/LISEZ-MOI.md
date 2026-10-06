# Carnets de référence et cas chiffrés (§9 de `simulation.md`)

Auteur : Game design, instance « carnets de référence », distincte de celles qui écrivent la page, le programme de contrôle et le programme de scellement. Sous `outillage/`, seul `scellement/candidat/fichier-scelle-candidat.json` a été lu (SHA-256 `59db748499fd1ece3d5bf6f8ec4b3fed3badd15eb39cf474cd0e31d3045c7b64`) ; ni le programme de scellement, ni ses rapports, ni `controle/`, ni `page/`, ni aucun rapport d'agent du scratchpad.

Spécification appliquée : `simulation.md`, `regles-de-calcul.md`, `profils.md` (vérification seulement), `schema.md` (parties 1 à 4), à l'état du commit `1e631f2` (changements des commits `6580e6f`, `3553b2e`, `2c66a93`, `1df9aa5` et `1e631f2` pris en compte).

## Méthode

Tout est calculé à la main : chaque grandeur est posée sur une feuille en texte, une ligne par grandeur, avec sa règle (section citée) et sa valeur. L'outil n'a servi qu'à deux choses : calculer des SHA-256 (`tirages.txt`, empreinte du fichier candidat) et vérifier des opérations sur fractions (sommes, produits, comparaisons) que j'avais d'abord posées à la main. La mise en forme canonique des JSON (RFC 8785) est faite par la bibliothèque standard, qui ne calcule rien. Aucun programme n'applique une règle du jeu.

## Fichiers

- `tirages.txt` — table de tous les t(clé) utiles (surprise, hasard, ordre, devine, devin, mystere, surprise-semaine), par SHA-256, graine `23e3ee6ccdc3fb38` ; vecteurs de test du fichier candidat recalculés et égaux.
- `commun-tables.txt` — tensions et pôles des 17 textes ; x ; classement w/π des réponses scellées ; curseurs des personnages par tension après chaque texte (= curseurs vus) ; côtés attendus des personnages ; r des heures de jeu.
- `manches-porteur.txt` — les 13 manches du porteur (séances 2 à 14), communes à toutes les parties, avec un récapitulatif et les chiffres constants qui en découlent (à recouper avec le rapport de scellement, que je n'ai pas lu).
- `carnet-1-jour-4/` — partie « r », arrêtée au jour 4 : `journal.json`, `durees.json`, `carnet-attendu.txt`, `copie-1-attendue.txt` (copie en cours d'essai à la séance 4), `feuille-de-calcul.txt`.
- `carnet-2-cloture-a/` — partie témoin (a), menée à la clôture : `journal.json`, `durees.json`, `carnet-attendu.txt`, feuilles A (séances 2 à 4), B (Nassim séance 4, séances 5 à 7), C (8 à 10), C2 (11 à 14), D (révélations du porteur, titres, agrégats, portrait, « En attendant », mesures, carnet ligne par ligne).
- `cas-affectation-lexicographique.txt` — séance 2, devineur Valentin (quatre affectations à égalité), puis Odile (deux).
- `cas-redistribution-croisee.txt` — séance 9 du porteur (deux cartes identiques), attribution croisée et variantes ; séance 4 (trois cartes identiques).
- `QUESTIONS.md` — ambiguïtés rencontrées, mes lectures, et leur sort.

## État

| Référence | État |
|---|---|
| Carnet 1 (jour 4) | fini : journal, durées, carnet, copie, feuille. Manque : les 11 manches des personnages des séances 2 à 4 (hors carnet ; voir feuille, partie 7). |
| Carnet 2 (clôture de (a)) | fini : journal, durées, carnet, 48 manches de personnages, titres, agrégats. |
| Cas « affectation lexicographique » | fini. |
| Cas « redistribution croisée » | fini. |

## Durées

Dans les carnets attendus, chaque durée s'écrit « ‹durée› », comme au contrôle 13. Les fichiers `durees.json` donnent des valeurs entières libres, cohérentes avec `etapes` ; seule leur présence compte (schéma, partie 4.2).

## Où un écart se règle

Ligne par ligne, sur la feuille concernée : la référence peut avoir tort (§9, « Usage »). Les lignes que je juge les plus exposées sont listées dans le rapport de livraison (ordre lexicographique des affectations, remplacements de cartes identiques, comptes du Mystère).
