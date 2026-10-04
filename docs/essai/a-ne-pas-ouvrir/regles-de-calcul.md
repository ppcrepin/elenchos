# Règles de calcul des personnages (à ne pas ouvrir avant la fin de l'essai)

*Spécification Game design, 4 octobre 2026 ; version 3, après Cohérence, UX, Juridique et le Vérificateur. Complète `docs/essai/simulation.md`, dont elle garde la numérotation (§2, §3, §4.1 à §4.4, annexe A) pour que les renvois restent justes. Lire ces règles avant la fin de l'essai aiderait à deviner : comment les personnages répondent, devinent, et comment les cartes sont choisies.*

Les notations communes (k, n, s, v, w, c, ℓ), le tirage déterministe et le calcul exact sont au §0 de `simulation.md`. Le calcul exact s'applique aux données et constantes (p, v, m, 0,07, 0,95, 0,70, seuils) et à toutes les grandeurs calculées (a, d, c, ℓ, q, distance, médiane, rareté, surprise, poids). Profils, réponses atypiques et absences : `profils.md`.

## Notations propres à ce fichier

| Symbole | Sens |
|---|---|
| p | position cachée d'un personnage sur une tension, de 0 à 1 |
| x | valeur d'une position ramenée sur l'axe de la tension (§4.2) |
| σ | côté d'une carte : +1, 0 ou −1 (§3) |

« Écart » désigne uniquement une réponse atypique (§2.3). La distance entre une réponse et un curseur s'appelle « distance ».

## 2. Comment un personnage répond

Contenu fournit pour chaque texte (annexe A) : la tension ; le sens s ; quatre considérations dans l'ordre d'affichage, chacune avec un côté (pour ou contre) et un pôle (0, 1 ou aucun).

### 2.1 Position type

1. a = p si s = 1, sinon a = 1 − p.
2. d = (a − 0,5) × m, avec m = 0,6 (fermeté faible), 1,0 (moyenne), 1,6 (forte).
3. |d| < 0,10 → Neutre ; 0,10 ≤ |d| < 0,30 → Favorable si d > 0, Défavorable sinon ; |d| ≥ 0,30 → Très favorable ou Très défavorable selon le signe.

### 2.2 Raison

- Ensemble E : position favorable → considérations « pour » ; défavorable → « contre » ; neutre → les quatre.
- Pôle visé : position non neutre → le pôle que sert la position (s si favorable, 1 − s si défavorable) ; neutre → 1 si p > 0,5, sinon 0.

| Cas | 1er choix | 2e choix | 3e choix | En dernier |
|---|---|---|---|---|
| Fermeté faible, non neutre | hors tension | du pôle visé | le reste de E | « aucune » |
| Fermeté moyenne ou forte, non neutre | du pôle visé | hors tension | le reste de E | « aucune » |
| Neutre, fermeté faible | hors tension | — | — | « aucune » |
| Neutre, fermeté moyenne ou forte | du pôle visé | hors tension | — | « aucune » |

- « Hors tension » s'entend toujours à l'intérieur de E. E vide → « aucune ». On prend le premier niveau non vide ; plusieurs candidates → départage par t("raison|prénom|texte|id").
- Voulu : un personnage neutre et peu ferme prend l'argument hors tension s'il y en a un ; sinon il ne se reconnaît dans aucune des quatre raisons et répond « aucune ». La fréquence de ce cas est fixée par l'annexe A.

### 2.3 Écarts au profil (réponses atypiques)

- Forme : côté opposé à la réponse type, au niveau simple (Favorable ou Défavorable) ; si la réponse type est neutre, Favorable si t("cote-ecart|prénom|texte") < 0,5, sinon Défavorable ; raison selon 2.2 avec le nouveau côté.
- Jamais sur l'entrée ni sur le texte 14.
- Nombre, contraintes et procédure de tirage : `profils.md`.
- Le fichier scellé inscrit, pour chaque réponse atypique, le côté tiré quand la réponse type était neutre.

### 2.4 Absences

- Une absence le jour n : pas de réponse au texte n, aucune devinette à la séance n. Calendrier : `profils.md`.
- Comme dans le produit, une absence peut se déduire (« Déjà joué aujourd'hui » et les heures de jeu de la fiche) ; D-011 interdit de la dire, pas de la déduire.
- Aucune pause : il faudrait sept jours sans réponse.

### 2.5 Entrée

Les personnages répondent à E1, E2, E3 par 2.1 et 2.2, sans écart. Le porteur ne voit que les réponses d'Agathe.

## 3. Comment un personnage devine

1. À chaque séance k de 2 à 14, chaque personnage présent joue une manche sur le texte k−1. Ses cartes sont choisies comme au §4, avec lui pour devineur. Candidats : les quatre autres membres, porteur et absents compris.
2. Côté attendu d'un candidat X vu par le devineur g, aligné sur le sens du texte : +1, 0 ou −1.
   - X personnage : a = p de X aligné (2.1) ; +1 si a ≥ 0,6 ; −1 si a ≤ 0,4 ; sinon 0.
   - X porteur : g n'utilise que les réponses du porteur qu'il a eues dans ses propres cartes, déjà révélées (textes ≤ k−2), sur la même tension ; on calcule le centre c du §5.2 de `simulation.md` sur ces seules réponses ; Σ w = 0 → « inconnu » ; sinon on aligne c sur le sens du texte (c si s = 1, 1 − c si s = 0) et on applique les mêmes seuils. Voulu : un seul arbitrage net vu suffit à donner un côté (c = 3/5 ou 2/5, seuils compris), comme deux penchants de même sens ; un seul penchant ne suffit pas (c = 5/9).
   - Ce curseur du porteur vu par g (§3.2) n'est pas celui du §4.2 (réponses d'entrée et toutes ses réponses aux textes ≤ k−2) : c'est voulu, g ne connaît que ce qu'il a deviné.
3. Score d'une carte de côté σ pour X : 2 si σ égale le côté attendu (0 et 0 compris) ; sinon 1 si l'un des deux vaut 0 ou si X est « inconnu » ; sinon 0.
4. Attribution : les candidats sont mélangés par t("devine|g|k|candidat") ; chacun reçoit son rang, de 1 à 4, dans cette liste. Une affectation (une carte = une personne, chaque personne au plus une fois) s'écrit comme la suite des rangs des candidats attribués aux cartes, prises dans l'ordre d'affichage du §4.5 de `simulation.md`, calculé pour g comme pour le porteur. Parmi les affectations de total maximal, on retient la plus petite dans l'ordre lexicographique : (1, 4, 2) passe avant (2, 1, 3). Les personnages ne passent jamais.
5. Raison cachée : parmi les considérations du côté de la carte (les quatre si elle est neutre). Candidat choisi attendu à +1 ou −1 : la première, dans l'ordre d'affichage, dont le pôle correspond (+1 → s ; −1 → 1 − s) ; s'il n'y en a pas, la règle suivante. Candidat attendu à 0 ou « inconnu » : la première hors tension, sinon la première. « aucune » seulement si le côté de la carte n'a aucune considération, ce que l'annexe A exclut : un personnage ne devine jamais « aucune ».
6. Justesse visée (hypothèse de Game design, non validée ni par le calcul ni par un essai) : 60 à 70 % sur les cartes des personnages ; 30 à 50 % sur les réponses du porteur devinées par les personnages, en hausse. Remplacée avant le scellement par les valeurs mesurées (§9 bis).

## 4. Les trois réponses à deviner (règle 8)

### 4.1 Réponses possibles

Pour le devineur g à la séance k : les réponses au texte k−1 des membres autres que g qui ont répondu.

### 4.2 Score de surprise (calculé à partir des seules réponses, jamais des profils cachés)

| Grandeur | Définition |
|---|---|
| x | position sur l'axe : v si s = 1, 1 − v si s = 0 |
| Curseur de l'auteur | centre c et largeur ℓ (§5.2 de `simulation.md`), sur ses réponses d'entrée et ses réponses aux textes ≤ k−2 |
| q | (0,95 − ℓ) / 0,70 : 0 au départ, 1 quand le curseur est net |
| Distance | \|x − c\| |
| Rareté | \|x − médiane des x des réponses possibles (§4.1)\|, c'est-à-dire des réponses au texte k−1 de tous les membres sauf le devineur (porteur compris quand un personnage devine). Nombre pair de réponses : moyenne des deux valeurs centrales. |
| Surprise | q × distance + (1 − q) × rareté |

- Au départ, q ≈ 0 : on sert, parmi les réponses à deviner, celles qui se distinguent le plus des autres. La réponse du devineur n'entre jamais dans le calcul : elle tirerait la médiane vers elle et ferait servir d'abord les réponses opposées à la sienne (mise en avant silencieuse du désaccord, contraire à l'esprit de `projet.md` §9).
- À mesure que les curseurs se resserrent, on sert les réponses inattendues de la part de leur auteur.
- Dans l'essai, Σ w ne dépasse pas 5 sur une tension : ℓ reste ≥ 0,60 et q ≤ 0,5. La rareté pèse donc au moins la moitié pendant tout l'essai. C'est une lecture de la règle 8 pour la période où les curseurs sont flous (C-009).

### 4.3 Choix

1. Classer les réponses possibles par surprise décroissante ; à surprise égale, par t("surprise|g|k|auteur") croissant.
2. Places 1 et 2 : les deux premières. Place 3 : parmi les suivantes, celle de plus petit t("hasard|g|k|auteur"). Avec trois réponses possibles, la place 3 revient à la troisième ; avec deux, il n'y a pas de place 3 ; avec une, seulement la place 1.
3. Cartes identiques : même niveau et même raison, « aucune » comprise, que la raison soit affichée ou cachée. Tant que deux cartes placées sont identiques et qu'une réponse non placée n'est identique à aucune carte placée : écarter la moins bien classée des deux (ordre de l'étape 1) et mettre à sa place, au même numéro, la première de ces réponses dans l'ordre de l'étape 1.
4. Cartes identiques restées ensemble (C-010) : avant tout compte (révélation, points, titres, badges), on redistribue leurs auteurs entre elles. Chaque auteur du groupe désigné sur l'une de ces cartes devient l'auteur de cette carte ; les autres auteurs du groupe vont aux cartes restantes, dans l'ordre des visages (porteur en dernier) et l'ordre d'affichage. Désigner l'un des auteurs sur l'une de ces cartes est donc toujours juste. La révélation montre sous chaque carte son auteur redistribué. Le §6 de `simulation.md` s'applique ensuite sans exception.

### 4.4 Carte à raison cachée

La carte de la dernière place (3, sinon 2, sinon 1). Si sa raison est « aucune » : la moins bien classée (§4.3, étape 1) des cartes servies dont la raison n'est pas « aucune » ; s'il n'y en a pas, la carte de la dernière place malgré tout.

## 9 bis. Réglage avant scellement et parties témoins

**Avant de sceller, une seule fois.** Le programme indépendant joue 200 parties sur les textes et les réponses prêts à sceller. La place du porteur est tenue par un joueur simulé au profil cohérent tiré au hasard (position et fermeté par tension, règles 2.1 à 2.3, trois réponses atypiques). Il devine par la règle du §3, le côté attendu de chaque personnage étant tiré de son curseur tel que le porteur le voit (§5.4 de `simulation.md`). On relève : justesse des personnages entre eux ; justesse des personnages sur les réponses du joueur simulé, semaines 1 et 2 ; justesse du joueur simulé, semaines 1 et 2 ; fréquence des cartes identiques, des raisons « aucune », des manches à deux cartes ; titulaires des titres.

Deux réglages possibles, et seulement ceux-là :
- joueur simulé au-dessus de 70 % en semaine 2 → quatre réponses atypiques par personnage au lieu de trois ; sous 35 % → deux (`profils.md` mis à jour) ;
- personnages au-dessus de 60 % sur les réponses du joueur simulé en semaine 2 → seuils stricts pour le côté attendu du porteur (> 3/5 et < 2/5 : il faut deux arbitrages, ou un arbitrage et un penchant).

Le seuil haut (70 %) laisse une marge au-dessus du repère indicatif de `simulation.md` (35 à 65 % en semaine 2) : on ne règle que si le joueur simulé sort nettement de la fourchette, pas pour un écart de quelques points dû au hasard des textes.

Résultats et réglages sont inscrits ici, datés, avant le scellement ; ensuite rien ne change.

**Après le scellement, avant de donner la page.** Trois parties témoins jouées sur la page, réponses et devinettes consignées :
- (a) toujours Neutre, passe tout, ne répond pas au texte 10 (manches d'une carte) ;
- (b) réponses écrites pour couvrir la liste ci-dessous, tente toutes les raisons cachées ;
- (c) lit le fichier scellé et attribue tout juste, pour Le Sans-Faute.

Plus 200 parties au hasard, graine publiée avec le rapport, jouées par la page et par le programme indépendant, comparées trace contre trace : toute différence est un défaut. D'une partie à l'autre, aucune réponse de personnage ne change.

**Liste à couvrir**, au moins une fois sur l'ensemble des parties ; sinon, une partie témoin de plus :
- manches de 3, 2 et 1 carte ;
- cartes identiques remplacées, et servies ensemble avec une attribution croisée ;
- côté attendu du porteur « inconnu », 0, +1, −1 ;
- les quatre lignes du §4.6 de `simulation.md` ; carte à raison cachée déplacée parce que sa raison était « aucune » ; carte « aucune des quatre raisons » ;
- les quatre phrases du jour ; les trois phrases de la semaine ;
- Le Devin départagé par les raisons cachées ; Le Sans-Faute obtenu et manqué ; Le Fidèle avec et sans le porteur ;
- chaque départage par t ;
- l'écran 5.12 (personne n'a répondu la veille), s'il peut arriver.

Ce que les données scellées rendent impossible (un titre sans titulaire, par exemple) est listé comme tel et vérifié à la lecture du code.

## Annexe A : contraintes de Contenu (complète l'annexe A de `simulation.md`)

- Au moins une considération « pour » et une « contre » (deux et deux recommandé) ; au moins une sur chaque pôle.
- Hors tension : au plus une considération par texte. Parmi les 4 textes quotidiens S, exactement 2 en ont une et 2 n'en ont aucune ; de même parmi les 4 textes quotidiens T. Ailleurs, libre. Effet attendu : au plus 4 « aucune » chez les personnages (estimation ; mesurée au §9 bis). Si Contenu ne peut pas tenir cette répartition avec de vrais arguments, il le signale ; la règle 2.2 ne change pas, seul ce nombre varie.
- Textes d'entrée : clivants (`docs/onboarding.md`), un par tension, sur S, P et L.
- Textes quotidiens : S 4, P 3, T 4, L 3 ; jamais la même tension deux jours de suite ; chaque tension au moins une fois dans les textes 1 à 6 et dans les textes 7 à 13 ; pour chaque tension, au moins un texte de chaque sens ; le texte 1 n'a pas la tension de E3. Exemple d'ordre valable (Vérificateur) : S T P L S T | P S L T S P T | L.
- Réserve de faisabilité : quatre vrais textes Tradition/Changement hors mœurs et religion, avec quatre arguments de quatre groupes et au moins un par pôle, seront difficiles à trouver. Contenu confirme avant de sceller.

## Limites propres aux règles de calcul

- Titres biaisés : les personnages gagneront probablement Le Devin ; le porteur sera probablement Le Mystère en semaine 1.
- Les personnages devinent mécaniquement (le côté, pas l'intensité).
- Agathe et Nassim sur les textes P : tant qu'aucun des deux n'a fait d'écart sur P, une carte de l'un ou de l'autre ne peut pas être départagée ; c'est pile ou face, le prix du profil « deux proches ». La réponse « Je ne pouvais pas trouver » du carnet le mesurera.
- Le joueur simulé du §9 bis n'est pas le porteur : il est cohérent et ne se fatigue jamais. Les seuils de réglage (35 %, 60 %, 70 %) sont des hypothèses de Game design.
- La version 2 de `simulation.md`, qui contenait ces règles, est sur `main` et dans l'historique Git. Si le porteur l'a lue, le déplacement ne retire rien : l'essai repose sur sa bonne foi, comme pour tout ce dossier. À lui dire à la livraison de la page, sans lui poser de question.
