# Profils cachés des personnages (à ne pas ouvrir avant la fin de l'essai)

*Spécification Game design, 4 octobre 2026. Personnages fictifs. Les fiches visibles (prénom, âge, métier, ville, ligne de vie, heure de jeu) sont dans `docs/essai/simulation.md` ; ce fichier contient ce que le porteur doit deviner.*

## Profils cachés : position p (0 à 1) et fermeté

Tensions : S = Sécurité (0) – Liberté individuelle (1) ; P = Précaution (0) – Innovation (1) ; T = Tradition (0) – Changement (1) ; L = Local (0) – National (1).

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | 0,65 moyenne | 0,68 moyenne | 0,58 faible | 0,25 moyenne |
| Nassim | 0,82 moyenne | 0,66 moyenne | 0,55 moyenne | 0,75 moyenne |
| Odile | 0,10 forte | 0,12 forte | 0,85 forte | 0,15 forte |
| Valentin | 0,45 faible | 0,25 moyenne | 0,30 moyenne | 0,70 faible |

## Réponse type qui en découle (règle 2.1 de la simulation)

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | simple, vers Liberté | simple, vers Innovation | neutre | simple, vers Local |
| Nassim | très, vers Liberté | simple, vers Innovation | neutre | simple, vers National |
| Odile | très, vers Sécurité | très, vers Précaution | très, vers Changement | très, vers Local |
| Valentin | neutre | simple, vers Précaution | simple, vers Tradition | simple, vers National |

## Comment les contraintes sont tenues

- Deux proches : Agathe et Nassim (même côté sur S, P, T ; opposés sur L ; ailleurs, seule l'intensité sur S et la raison sur T les distinguent).
- Une tranchée : Odile (fermeté forte partout).
- Des valeurs que sa vie ne laisse pas deviner : Valentin (jeune développeur, penche vers la précaution et la tradition).
- Aucun bloc calqué sur un parti : personne n'associe sécurité forte et tradition forte, ni liberté forte et changement fort.
- Chaque tension partage le cercle.
- Agathe invite le porteur.

## Corrigé de la question F1 (fin d'essai)

« Au milieu » si |p − 0,5| < 0,1 ; sinon le côté.

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | Liberté | Innovation | Milieu | Local |
| Nassim | Liberté | Innovation | Milieu | National |
| Odile | Sécurité | Précaution | Changement | Local |
| Valentin | Milieu | Précaution | Tradition | National |
