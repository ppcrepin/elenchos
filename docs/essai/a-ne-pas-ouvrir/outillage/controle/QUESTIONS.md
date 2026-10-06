# Programme de contrôle (C) : points de spécification lus d'une certaine façon

Auteur : Back-end, rôle « auteur du programme de contrôle ». Chaque point donne la section, la citation, la lecture retenue et ce que fait C en attendant. Aucun ne bloque le scellement. Les points marqués **[à trancher]** demandent un arbitrage ; les autres sont des lectures sans effet sur le lot, données pour que le circuit puisse les relire.

## Jalon 1 (scellement)

### Q1. Jour du scellement passé au contrôle 1
- **Source.** Schéma, partie 4.1, étape 4 : « au plus tard le jour du scellement. Ce jour n'est pas dans le fichier : le programme de contrôle le reçoit en paramètre, recopié du rapport de scellement ».
- **Lecture.** Paramètre obligatoire `--date-scellement`. Sur le candidat, j'ai passé le 2026-10-06 (jour du contrôle), faute de rapport de scellement.
- **À refaire** avec le jour écrit au rapport de scellement, au moment du scellement.

### Q2. Graine vérifiée hors des huit étapes (ajout de C)
- **Source.** Simulation, §0 : la graine est « les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai|graine|" + E) […] ce qui donne 23e3ee6ccdc3fb38 ». Aucune étape de la partie 4.1 ne la recalcule.
- **Lecture.** C la recalcule et compte une différence comme un défaut, rapporté à part (« Hors étapes »), sans changer l'ordre des huit étapes.
- **Effet sur le candidat.** Identique.

### Q3. « Mêmes sources » : comparaison avec le rapport de scellement
- **Source.** Schéma, partie 4.1, étape 8, « Mêmes sources » : « Si un même fichier a deux empreintes différentes : échec ».
- **Problème.** L'auteur de C ne lit pas le rapport de l'agent qui scelle (brief, indépendance).
- **Lecture.** C écrit le SHA-256 des huit sources lues (et, pour information, de `regles-de-calcul.md` et de `devoilement.md`, qu'il applique sans les lire). L'option `--empreintes-scellement` reçoit un JSON `{nom de fichier : SHA-256}` recopié du rapport de scellement par l'orchestrateur ; C compare alors et échoue sur toute différence. Sans elle, le rapport dit « non comparé ».

### Q4. Cases vues : auteur d'origine
- **Source.** Fichier caché, §9 bis, « cases vues » : « le nombre de ses cartes sur un texte de cette tension ».
- **Lecture.** Compté par auteur d'origine. C'est le même nombre que par auteur après redistribution : la redistribution permute les auteurs à l'intérieur d'un groupe de cartes identiques, sans en changer le nombre, et le contenu de la carte est le même. Le chiffre est donc constant, comme le §9 bis l'exige.

### Q5. Côté attendu du joueur vu par un personnage : « qu'il a eues dans ses propres cartes »
- **Source.** Fichier caché, §3, point 2.
- **Lecture.** La réponse du joueur au texte m compte si le joueur figure dans `places` de la manche de g à la séance m + 1 (auteur d'origine). Lire par `auteur_compte` donne le même ensemble de réponses (point Q4).

### Q6. Le Mystère avec zéro erreur **[à trancher, sans effet mesuré]**
- **Source.** Simulation, §6, point 3 : « au moins 6 tentatives ; plus forte proportion d'erreurs ». Le Devin exige « au moins 1 » point ; Le Mystère n'exige aucune erreur.
- **Lecture (à la lettre).** Un membre à 6 tentatives et 0 erreur peut être Le Mystère si personne n'a mieux. C le calcule ainsi.
- **Mesure.** Jamais arrivé sur les 400 dimanches du réglage. À ranger avec C-013.

### Q7. Le Pas de Côté
- **Source.** Simulation, §6, point 7 : « curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ». Ne sont fixés ni les membres concernés, ni la réponse regardée (celle de la semaine ? du dimanche ?).
- **Lecture.** Aucun curseur n'atteint Σ w = 10 dans l'essai (au plus 6 réponses sur une tension) : C rend un tableau vide et s'arrête avec une erreur explicite si un curseur l'atteignait, plutôt que de deviner la règle.

### Q8. Phrase de la semaine, cas « nette »
- **Source.** Simulation, §5.7, première ligne du tableau.
- **Lecture.** Le pôle nommé est celui du côté de c ; si c = 1/2 exactement, rien n'est fixé. Le cas ne peut pas arriver dans l'essai (aucun curseur net) ; C s'arrête s'il arrivait.

### Q9. Réglage : ce que C rapporte au-delà des deux décisions
- **Source.** Fichier caché, §9 bis, « Ce qu'on relève ».
- **Lecture.** « Justesse des personnages entre eux » : par semaine et sur les textes 1 à 13. « Fréquences des cartes identiques » : remplacements, et manches et cartes servies ensemble, comptés séparément. Le texte 13 est donné à part (hors semaine).

### Q10. Redistribution : un auteur désigné sur deux cartes d'un même groupe
- **Source.** Fichier caché, §4.3, étape 4.
- **Lecture.** Impossible avec un journal valide (règle 7 de la partie 3.12) et avec l'affectation des personnages (une personne par carte). Si cela arrivait, C prendrait la première carte dans l'ordre d'affichage. Sans effet.
