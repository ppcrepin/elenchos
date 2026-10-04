# Profils cachés des personnages (à ne pas ouvrir avant la fin de l'essai)

*Spécification Game design, 4 octobre 2026 ; version 2, relue par Cohérence. Personnages fictifs. Les fiches visibles (prénom, âge, métier, ville, ligne de vie, heure de jeu) et toutes les règles de calcul sont dans `docs/essai/simulation.md`. Ce fichier contient ce que le porteur doit deviner, et ce qui l'aiderait à deviner.*

## Profils cachés : position p (0 à 1) et fermeté

Tensions : S = Sécurité (0) – Liberté individuelle (1) ; P = Précaution (0) – Innovation (1) ; T = Tradition (0) – Changement (1) ; L = Local (0) – National (1).

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | 0,65 moyenne | 0,68 moyenne | 0,58 faible | 0,25 moyenne |
| Nassim | 0,82 moyenne | 0,66 moyenne | 0,55 moyenne | 0,75 moyenne |
| Odile | 0,10 forte | 0,12 forte | 0,85 forte | 0,15 forte |
| Valentin | 0,45 faible | 0,25 moyenne | 0,30 moyenne | 0,70 faible |

## Réponse type qui en découle (règle 2.1 de la simulation)

« Simple » = Favorable ou Défavorable ; « très » = Très favorable ou Très défavorable. La table est écrite en pôles : elle vaut quel que soit le sens s du texte (si s = 0, la position bascule mais sert le même pôle).

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | simple, vers Liberté | simple, vers Innovation | neutre | simple, vers Local |
| Nassim | très, vers Liberté | simple, vers Innovation | neutre | simple, vers National |
| Odile | très, vers Sécurité | très, vers Précaution | très, vers Changement | très, vers Local |
| Valentin | neutre | simple, vers Précaution | simple, vers Tradition | simple, vers National |

Valeurs de d = (p − 0,5) × m, pour s = 1 (calcul vérifié par Cohérence) :

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | +0,15 | +0,18 | +0,048 | −0,25 |
| Nassim | +0,32 | +0,16 | +0,05 | +0,25 |
| Odile | −0,64 | −0,608 | +0,56 | −0,56 |
| Valentin | −0,03 | −0,25 | −0,20 | +0,12 |

## Contraintes que les profils respectent

Issues de la conception relue avant D-015 (non consignée dans le dépôt).

- Deux proches : Agathe et Nassim (même côté sur S et P, neutres tous deux sur T, opposés sur L ; sur S, seule l'intensité les distingue ; sur T, seule la raison : Agathe, fermeté faible, prend d'abord la considération hors tension, Nassim, fermeté moyenne, celle du pôle Changement).
- Une tranchée : Odile (fermeté forte partout, |d| ≥ 0,56).
- Des valeurs que sa vie ne laisse pas deviner : Valentin (jeune développeur, penche vers la précaution et la tradition).
- Aucun bloc calqué sur un parti, au sens du critère retenu : personne n'associe sécurité forte et tradition forte, ni liberté forte et changement fort. (Le critère ne regarde que ces deux paires ; il ne prouve pas l'absence de toute ressemblance partisane.)
- Chaque tension partage le cercle : S (2 Liberté, 1 Sécurité, 1 neutre), P (2 et 2), T (1, 1 et 2 neutres), L (2 et 2).
- Agathe invite le porteur.
- Conséquence : sur les textes P, Agathe et Nassim donneront souvent la même carte (même niveau, même règle de raison) ; la règle des cartes identiques (§4.3 de la simulation) se déclenchera.

## Réponses atypiques (complète le §2.3 de la simulation)

- Exactement 3 par personnage, sur les textes 1 à 13 ; aucune sur l'entrée ni sur le texte 14 (12 sur 48 réponses devinables, 25 %).
- Contraintes : (a) jamais un jour d'absence ; (b) jamais deux textes consécutifs pour un même personnage ; (c) au plus deux personnages en écart sur un même texte ; (d) au moins un écart dans les textes 1 à 6 et un dans les textes 7 à 13.
- Procédure : personnages dans l'ordre Agathe, Nassim, Odile, Valentin ; textes 1 à 13 classés par t("ecart|prénom|n") croissant ; on retient, en respectant (a) à (c) : le premier valable entre 1 et 6, le premier valable entre 7 et 13, puis le premier valable restant.

## Absences (complète le §2.4 de la simulation)

| Personnage | Textes sans réponse |
|---|---|
| Agathe | aucun |
| Nassim | 3 et 10 |
| Odile | 10 |
| Valentin | 5 |

Toutes tombent sur des textes 1 à 13 : 52 réponses quotidiennes (56 moins 4), dont 48 devinables (textes 1 à 13). Le texte 10 n'a que deux réponses de personnages (Agathe, Valentin).

## Corrigé de la question F1 (fin d'essai)

« Au milieu » si |p − 0,5| < 0,1 ; sinon le côté.

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | Liberté | Innovation | Au milieu | Local |
| Nassim | Liberté | Innovation | Au milieu | National |
| Odile | Sécurité | Précaution | Changement | Local |
| Valentin | Au milieu | Précaution | Tradition | National |
