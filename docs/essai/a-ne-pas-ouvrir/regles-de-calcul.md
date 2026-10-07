# Règles de calcul des personnages (à ne pas ouvrir avant la fin de l'essai)

*Spécification Game design, 4 octobre 2026 ; version 3, après Cohérence, UX, Juridique et le Vérificateur. Modifications après le gel, le 5 octobre 2026, en circuit avec le lot de textes : annexe A (« Effet attendu », avec le lot scellé) ; §9 bis (« Texte rejeté. » jamais affiché ; liste à couvrir : arrêt à l'entrée avant 1.9, cartes attribuées sans « Valider ») ; puis, passe de spécification avant fabrication (Game design, 5 octobre 2026) : §2 (ordre d'affichage des raisons, tiré au scellement), §3, points 1 et 4, §4.3 (étape 3), §9 bis (protocole du réglage ; chiffres constants, calculés deux fois). Puis, le 6 octobre 2026, réponses de Game design aux questions de la fabrication : §3, point 6 (justesse mesurée au réglage, remplace l'hypothèse), §4.2 (rareté sans réponse du porteur ; curseur net impossible), §9 bis (partie témoin (a), repère du joueur simulé sans réponses atypiques, titres sans titulaire faute d'erreur, case signalée de F1) et « Limites » (valeurs mesurées) ; relues par Cohérence (compatible avec réserves) puis par le Vérificateur (OK avec corrections mineures) avant le scellement ; corrections appliquées. Puis, le 6 octobre 2026 (commit `741af69`), §9 bis : parties témoins (d) à (j), impossibilités constatées avec le lot ; le 7 octobre 2026, §9 bis : auteur du rapport de contrôle. Relus par Cohérence puis par le Vérificateur avant la publication de la page. Complète `docs/essai/simulation.md`, dont elle garde la numérotation (§2, §3, §4.1 à §4.4, annexe A) pour que les renvois restent justes. Lire ces règles avant la fin de l'essai aiderait à deviner : comment les personnages répondent, devinent, et comment les cartes sont choisies.*

Les notations communes (k, n, s, v, w, c, ℓ), le tirage déterministe et le calcul exact sont au §0 de `simulation.md`. Le calcul exact s'applique aux données et constantes (p, v, m, 0,07, 0,95, 0,70, seuils) et à toutes les grandeurs calculées (a, d, c, ℓ, q, distance, médiane, rareté, surprise, poids). Profils, réponses atypiques et absences : `profils.md`.

## Notations propres à ce fichier

| Symbole | Sens |
|---|---|
| p | position cachée d'un personnage sur une tension, de 0 à 1 |
| x | valeur d'une position ramenée sur l'axe de la tension (§4.2) |
| σ | côté d'une carte, dans les termes du texte, sans alignement : +1 si Favorable ou Très favorable, 0 si Neutre, −1 si Défavorable ou Très défavorable (§3). Le côté attendu (§3.2) s'exprime de la même façon : +1 = favorable. |

« Écart » désigne uniquement une réponse atypique (§2.3). La distance entre une réponse et un curseur s'appelle « distance ».

## 2. Comment un personnage répond

Contenu fournit pour chaque texte (annexe A) : la tension ; le sens s ; quatre considérations numérotées de 1 à 4 dans la fiche, chacune avec un côté (pour ou contre) et un pôle (0, 1 ou aucun). **Ordre d'affichage**, tiré au scellement : les quatre considérations du texte X sont mélangées au sens du §0 de `simulation.md`, c'est-à-dire triées par t("ordre-raisons|X|i") croissant, i étant leur numéro dans la fiche. La première du tri reçoit le rang 1, et ainsi de suite. Le rang est l'« id » des clés de tirage et la valeur de `raison`. Le programme de contrôle refait ce tirage à partir des fiches.

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

1. À chaque séance k de 2 à 14, chaque personnage présent (le texte k n'est pas dans ses absences) joue une manche sur le texte k−1. Ses cartes sont choisies comme au §4, avec lui pour devineur. Candidats : les quatre autres membres, porteur et absents compris.
2. Côté attendu d'un candidat X vu par le devineur g, aligné sur le sens du texte : +1, 0 ou −1.
   - X personnage : a = p de X aligné (2.1) ; +1 si a ≥ 0,6 ; −1 si a ≤ 0,4 ; sinon 0.
   - X porteur : g n'utilise que les réponses du porteur qu'il a eues dans ses propres cartes, déjà révélées (textes ≤ k−2), sur la même tension ; on calcule le centre c du §5.2 de `simulation.md` sur ces seules réponses ; Σ w = 0 → « inconnu » ; sinon on aligne c sur le sens du texte (c si s = 1, 1 − c si s = 0) et on applique les mêmes seuils. Voulu : un seul arbitrage net vu suffit à donner un côté (c = 3/5 ou 2/5, seuils compris), comme deux penchants de même sens ; un seul penchant ne suffit pas (c = 5/9).
   - Ce curseur du porteur vu par g (§3.2) n'est pas celui du §4.2 (réponses d'entrée et toutes ses réponses aux textes ≤ k−2) : c'est voulu, g ne connaît que ce qu'il a deviné.
3. Score d'une carte de côté σ pour X : 2 si σ égale le côté attendu (0 et 0 compris) ; sinon 1 si l'un des deux vaut 0 ou si X est « inconnu » ; sinon 0.
4. Attribution : les candidats sont mélangés par t("devine|g|k|candidat") ; chacun reçoit son rang, de 1 à 4, dans cette liste. Une affectation (une carte = une personne, chaque personne au plus une fois) s'écrit comme la suite des rangs des candidats attribués aux cartes, prises dans l'ordre d'affichage du §4.5 de `simulation.md`, calculé pour g comme pour le porteur. Parmi les affectations de total maximal, on retient la plus petite dans l'ordre lexicographique : (1, 4, 2) passe avant (2, 1, 3). Les personnages ne passent jamais. Une manche sans réponse possible n'a pas de carte : rangs et côtés calculés, total 0. C'est impossible avec ce lot, où chaque texte a au moins deux réponses de personnages.
5. Raison cachée : parmi les considérations du côté de la carte (les quatre si elle est neutre). Candidat choisi attendu à +1 ou −1 : la première, dans l'ordre d'affichage, dont le pôle correspond (+1 → s ; −1 → 1 − s) ; s'il n'y en a pas, la règle suivante. Candidat attendu à 0 ou « inconnu » : la première hors tension, sinon la première. « aucune » seulement si le côté de la carte n'a aucune considération, ce que l'annexe A exclut : un personnage ne devine jamais « aucune ».
6. Justesse mesurée au réglage (§9 bis : fichier candidat, 200 parties, réglage par défaut, aucun des deux réglages déclenché). Elle remplace l'hypothèse de Game design (60 à 70 % entre personnages ; 30 à 50 % sur le porteur, en hausse), que la mesure dément sur les deux points.
   - Personnages entre eux : 55,0 % en semaine 1 (textes 1 à 5), 43,4 % en semaine 2 (textes 6 à 12), 38,7 % au texte 13 ; 47,4 % sur les textes 1 à 13.
   - Personnages sur les cartes du joueur simulé : 32,0 % en semaine 1, 26,7 % en semaine 2, 39,0 % au texte 13 (au hasard : 25 %).
   - Joueur simulé : 49,9 % en semaine 1, 38,2 % en semaine 2, 10,2 % au texte 13 ; sans les cartes qui sont des réponses atypiques : 48,5 %, 51,0 % et 15,3 %. Sa baisse en semaine 2 vient entièrement des cartes atypiques.
   Pourquoi c'est plus bas que prévu : un personnage ne lit que le côté d'une carte, jamais l'intensité ni la raison ; chaque tension a au moins deux personnages du même côté (deux paires sur P et sur L) ; le porteur, candidat à chaque manche, prend des cartes qui ne sont pas les siennes ; une réponse atypique fausse en général deux attributions, la sienne et celle du membre qu'elle imite. Pourquoi c'est plus bas en semaine 2 : « Semaine 2 plus dure », dans les limites en fin de fichier ; repris au rapport de scellement. Sur les cartes du porteur, la justesse ne monte pas avec l'information. Vérifié le 6 octobre 2026 par le programme de contrôle, sur les 200 parties et sur un journal écrit à la main : aucune erreur d'alignement ; chaque côté attendu faux vient d'une réponse atypique, à ce texte ou déjà vue (les cas où la réponse du joueur simulé est neutre en font partie : sur une tension où sa réponse type est neutre, seule une réponse atypique vue a pu donner un côté, une réponse neutre pesant w = 0). Un porteur « inconnu » prend par élimination les cartes qu'aucun autre candidat n'explique ; un côté connu est faux 4 fois sur 10 en semaine 2, et, juste, il reste disputé par des personnages du même côté, départagés par les rangs. Ce sont des devineurs mécaniques : ces chiffres ne sont ni des cibles ni des critères (D-008).

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
| Rareté | \|x − médiane des x des réponses possibles (§4.1)\|, c'est-à-dire des réponses au texte k−1 de tous les membres sauf le devineur (porteur compris quand un personnage devine et que le porteur a répondu ; un membre sans réponse au texte k − 1 n'a pas de x ; une seule réponse possible : la médiane est son x, la rareté vaut 0). Nombre pair de réponses : moyenne des deux valeurs centrales. |
| Surprise | q × distance + (1 − q) × rareté |

- Au départ, q ≈ 0 : on sert, parmi les réponses à deviner, celles qui se distinguent le plus des autres. La réponse du devineur n'entre jamais dans le calcul : elle tirerait la médiane vers elle et ferait servir d'abord les réponses opposées à la sienne (mise en avant silencieuse du désaccord, contraire à l'esprit de `projet.md` §9).
- À mesure que les curseurs se resserrent, on sert les réponses inattendues de la part de leur auteur.
- Dans l'essai, le curseur qui sert à la surprise compte au plus 4 réponses sur une tension (S : l'entrée et les trois textes S qui précèdent le quatrième ; le cinquième est le texte 14, jamais deviné) : Σ w ≤ 4, donc ℓ ≥ 0,67 et q ≤ 0,4. La rareté pèse donc au moins 60 % pendant tout l'essai. C'est une lecture de la règle 8 pour la période où les curseurs sont flous (C-009). Le portrait de Moi, qui compte aussi le texte 14, va jusqu'à 6 réponses sur S (Σ w ≤ 6, ℓ ≥ 0,53) : aucun curseur ne devient net. Plus largement, sur toute la durée de l'essai, un membre a au plus 6 réponses sur S (E1 et les textes 1, 4, 7, 10, 14), 4 sur P, 3 sur T et 4 sur L ; w ≤ 1 (`simulation.md`, §5.1), donc Σ w ≤ 6 < 10 pour tout membre, toute tension et toute séance.

### 4.3 Choix

1. Classer les réponses possibles par surprise décroissante ; à surprise égale, par t("surprise|g|k|auteur") croissant.
2. Places 1 et 2 : les deux premières. Place 3 : parmi les suivantes, celle de plus petit t("hasard|g|k|auteur"). Avec trois réponses possibles, la place 3 revient à la troisième ; avec deux, il n'y a pas de place 3 ; avec une, seulement la place 1.
3. Cartes identiques : même niveau et même raison, « aucune » comprise, que la raison soit affichée ou cachée. Tant que deux cartes placées sont identiques et qu'une réponse non placée n'est identique à aucune carte placée : écarter, parmi les cartes placées qui ont une jumelle placée, la moins bien classée (ordre de l'étape 1) et mettre à sa place, au même numéro, la première de ces réponses dans l'ordre de l'étape 1.
4. Cartes identiques restées ensemble (C-010) : avant tout compte (révélation, points, titres, badges), on redistribue leurs auteurs entre elles. Chaque auteur du groupe désigné sur l'une de ces cartes devient l'auteur de cette carte ; les autres auteurs du groupe vont aux cartes restantes, dans l'ordre des visages (porteur en dernier) et l'ordre d'affichage. Désigner l'un des auteurs sur l'une de ces cartes est donc toujours juste. La révélation montre sous chaque carte son auteur redistribué. Le §6 de `simulation.md` s'applique ensuite sans exception.

### 4.4 Carte à raison cachée

La carte de la dernière place (3, sinon 2, sinon 1). Si sa raison est « aucune » : la moins bien classée (§4.3, étape 1) des cartes servies dont la raison n'est pas « aucune » ; s'il n'y en a pas, la carte de la dernière place malgré tout.

## 9 bis. Réglage avant scellement et parties témoins

**Avant de sceller, une seule fois.** Le programme de contrôle joue 200 parties de réglage sur le fichier candidat, avec le réglage par défaut (trois réponses atypiques par personnage, seuils non stricts). La place du porteur est tenue par un joueur simulé.

- **Hasard propre au réglage.**
  - Graine de réglage g_R : les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai|reglage|" + graine du fichier candidat).
  - Pour la partie i (1 à 200, en décimal sans zéro initial), t_i(clé) = N / 16⁸, où N est tiré comme au §0 de SHA-256(g_R + "|" + i + "|" + clé) ; départages et égalités exactes comme au §0.
  - Un entier de 0 à 100 vaut ⌊101·N / 2³²⌋. Un choix parmi trois vaut ⌊3·N / 2³²⌋ (0, 1 ou 2).
- **Profil.** Pour chaque tension T, tirés indépendamment :
  - position : entier de 0 à 100, de la clé « position|T » ;
  - fermeté : faible, moyenne ou forte (0, 1 ou 2), de la clé « fermete|T ».
- **Réponses.**
  - À tous les textes, entrée comprise, par les règles 2.1 et 2.2, avec t_i("raison|porteur|texte|id").
  - Trois réponses atypiques par la procédure de `profils.md`, avec t_i("ecart|porteur|n") et t_i("cote-ecart|porteur|n"). Seules les contraintes (b) et (d) s'appliquent : il n'est jamais absent, et (c) ne compte que les personnages.
  - Il répond chaque jour et ne passe jamais.
- **Devinettes.**
  - Règle du §3, avec t_i("devine|porteur|k|candidat") pour les rangs.
  - Côté attendu d'un personnage : le centre c de son curseur tel que le porteur le voit (§5.4 de `simulation.md` : réponses d'entrée et textes ≤ k−2), aligné sur le sens du texte (c si s = 1, 1 − c sinon). +1 si ≥ 3/5, −1 si ≤ 2/5, 0 entre les deux, « inconnu » si Σ w = 0. Ces seuils ne sont jamais stricts : le réglage strict ne vise que le côté attendu du porteur.
  - Il tente toujours la raison cachée (règle 3.5).
- **Le reste suit le jeu.** Cartes, devinettes des personnages et titres suivent les règles du jeu, avec la graine du fichier.
- **Pourquoi des tirages propres à chaque partie.** Les cartes servies au joueur simulé et les côtés qu'il attend ne dépendent que du fichier. Avec les rangs de la graine du fichier, sa justesse serait la même dans les 200 parties et ne mesurerait qu'un seul tirage des départages.

**Mesures.**
- La justesse compte les cartes attribuées juste (auteur après redistribution), sur toutes les cartes servies des manches révélées dans la semaine (semaine 1 : textes 1 à 5 ; semaine 2 : textes 6 à 12).
- Elle est cumulée sur les 200 parties (Σ justes / Σ cartes) et comparée en fraction exacte.
- Ce qu'on relève :
  - justesse des personnages entre eux ;
  - justesse des personnages sur les cartes du joueur simulé, semaines 1 et 2 ;
  - justesse du joueur simulé, semaines 1 et 2, avec et sans les réponses atypiques (repère pour le bilan, `simulation.md`, §9, point 15) ;
  - fréquences des cartes identiques, des raisons « aucune » et des manches à deux cartes, pour sa manche et pour celles des personnages ;
  - titulaires des titres.
- Les cases vues sont des chiffres constants : on les reprend du rapport de scellement.
- La justesse de F1 est donnée deux fois au bilan : sur les 16 cases, et sans les cases signalées. Est aussi signalée, au bilan, une case dont toutes les cartes vues sont des réponses atypiques (dans ce lot : Valentin sur P).

Deux réglages possibles, et seulement ceux-là. Ils se lisent sur les mêmes 200 parties et ne sont jamais rejoués :
- joueur simulé en semaine 2 strictement au-dessus de 7/10 → quatre réponses atypiques par personnage ; strictement sous 7/20 → deux. Le candidat est alors refait, avec la même graine, et `profils.md` est mis à jour ;
- personnages sur les cartes du joueur simulé en semaine 2 strictement au-dessus de 3/5 → seuils stricts pour le côté attendu du porteur (> 3/5 et < 2/5 : il faut deux arbitrages nets, ou un arbitrage net et un penchant).

Le seuil haut (70 %) laisse une marge au-dessus du repère indicatif de `simulation.md` (35 à 65 % en semaine 2) : on ne règle que si le joueur simulé sort nettement de la fourchette, pas pour un écart de quelques points dû au hasard des textes.

Résultats et réglages sont inscrits au rapport de scellement, datés, avant le scellement ; ensuite rien ne change. Le rapport de scellement porte aussi un paragraphe « Graine », qui sépare ce que Git prouve de ce que l'équipe déclare. Ce que Git prouve : la graine et sa dérivation (§0 de `simulation.md`) ; le commit 7f4d367 a été poussé sur `main` avant le commit qui contient le programme de scellement et sa règle de dérivation (719a3fa, dix-sept minutes plus tard). Ce que l'équipe déclare, sans pouvoir le prouver : la règle de dérivation (préfixe, choix du commit) a été écrite en une fois, sans essai d'un autre préfixe ni d'un autre commit ; une seule clé d'ordre des raisons a été calculée. Puis la liste de tout ce qui a été écrit ou changé après ce commit, la graine étant connue, en deux groupes. Touche les réponses scellées : la règle d'ordre des raisons ; la précision de la procédure des réponses atypiques (`profils.md`, « Procédure »), déclarée conforme au programme déjà écrit ; le protocole du réglage, dont le résultat peut changer le nombre de réponses atypiques. Ne les touche pas : le reste des lectures de la passe de spécification du 5 octobre 2026, et les modifications du 6 octobre 2026 (journée pas finie et carnet ; typographie et polices ; mise en forme du pseudo ; minimums du Mystère et de la surprise de la semaine ; curseur net impossible ; partie témoin (a) ; justesse mesurée et limites ; les deux vérifications ajoutées au contrôle 1, espace avant « ? » ou « ! » non comptée et aucune espace autre que U+0020, qui ont passé sur le candidat sans le modifier). Tout correctif d'avant la séance 0 s'ajoute à la liste. Il dit enfin que l'auteur de la relecture du schéma a lu le rapport du fichier candidat, et que le programme de contrôle est écrit par une instance qui n'a lu ni ce rapport ni rien sous `outillage/`. Le rapport de scellement contient aussi les chiffres constants du fichier, ceux qui ne dépendent pas des coups du porteur. Ils portent sur ses manches des séances 2 à 14 (textes 1 à 13, tous révélés à la séance 15) :
- **part de réponses atypiques** parmi ses cartes : cartes dont (auteur, texte) figure dans `reponses_atypiques`, sur toutes ses cartes. Le compte est le même avant et après redistribution des cartes identiques ;
- **remplacements** de cartes identiques (§4.3, étape 3) ;
- **cartes identiques servies ensemble** : nombre de manches et nombre de cartes ;
- **raisons « aucune »** parmi ses cartes :
  - affichées : cartes non cachées dont la raison est « aucune » ;
  - cachées : carte à raison cachée dont la vraie raison est « aucune », ce qui n'arrive que si toutes ses cartes sont « aucune » (§4.4) ;
  - cartes à raison cachée déplacées par le §4.4 ;
- **raisons « aucune » parmi les réponses scellées** : entrée, textes devinés et texte 14 à part ; cela vérifie l'annexe A ;
- **égalités de classement** : somme des `departages` (schéma, partie 3.6) de ses treize manches ;
- **cases vues** : pour chaque personnage et chaque tension, le nombre de ses cartes sur un texte de cette tension, plus une case par réponse d'entrée d'Agathe (E1 S, E2 P, E3 L), pour une partie menée à la clôture. Une case vue moins de 2 fois est signalée ;
- **impossibilités** : l'écran 5.12 peut-il arriver (plus petit nombre de réponses de personnages à un texte) ; « Texte rejeté. » peut-il apparaître.

Ces chiffres sont calculés deux fois, sans que l'un voie le code de l'autre : par le programme de contrôle et par le programme de scellement. Ils doivent être égaux ; une différence est un défaut, réglé avant le scellement.

**Après le scellement, avant de donner la page.** Des parties témoins jouées sur la page, réponses et devinettes consignées : trois écrites d'avance, (a) à (c), puis celles qu'ajoute la liste à couvrir, (d) à (j) :
- (a) toujours Neutre avec la raison « aucune », à l'entrée comme aux textes quotidiens ; à l'entrée, pari « Neutre » sur Agathe aux trois textes ; passe chaque carte (« Passer ») et valide chaque manche ; au texte 10, l'écran Répondre est affiché puis laissé sans réponse (« Jour suivant », puis « Oui, continuer ») : à la séance 11, Agathe et Valentin ont une manche d'une carte, Nassim et Odile une manche de deux cartes (au texte 10, seuls Agathe et Valentin ont répondu, et le porteur n'a pas de réponse) ;
- (b) réponses écrites pour couvrir la liste ci-dessous, tente toutes les raisons cachées ;
- (c) lit le fichier scellé et attribue tout juste, pour Le Sans-Faute.
- (d) à (j) : parties témoins de plus, écrites par Front-end pour couvrir la liste ci-dessous et les écrans du contrôle 11 (règle « sinon, une partie témoin de plus ») ; chacune est décrite en tête de `outillage/page/harnais/parties.js`. (j) ouvre les écrans qu'aucune autre n'affiche : message du pseudo égal à un prénom, fiche 5.4 d'un texte déjà révélé, consigne de copie manuelle, confirmation de « Tout effacer » d'après le dévoilement, « La page a tout effacé. ».

Plus 200 parties au hasard, graine inscrite au rapport de contrôle (`rapport-de-controle.md`, compilé par l'orchestrateur à partir des sorties des programmes ; le Vérificateur en vérifie chaque affirmation et y appose son verdict), jouées par la page et par le programme indépendant, comparées trace contre trace : toute différence est un défaut. D'une partie à l'autre, aucune réponse de personnage ne change.

**Liste à couvrir**, au moins une fois sur l'ensemble des parties ; sinon, une partie témoin de plus :
- manches de 3, 2 et 1 carte ;
- cartes identiques remplacées, et servies ensemble avec une attribution croisée ;
- côté attendu du porteur « inconnu », 0, +1, −1 ;
- les quatre lignes du §4.6 de `simulation.md` ; carte à raison cachée déplacée parce que sa raison était « aucune » ; carte « aucune des quatre raisons » ;
- les quatre phrases du jour ; les trois phrases de la semaine ;
- cartes laissées sans attribution, ou attribuées sans « Valider », au passage au jour suivant ; position donnée sans raison ; texte laissé sans réponse ;
- arrêt à l'entrée, avant 1.9 ; arrêt avant le jour 3, arrêt après le jour 3 avec F1 remplie, arrêt avec F1 sautée ; carnet copié depuis la confirmation de « Tout effacer » en cours d'essai ;
- Le Devin départagé par les raisons cachées ; Le Sans-Faute obtenu et manqué ; Le Fidèle avec et sans le porteur ;
- chaque départage par t ;
- l'écran 5.12 (personne n'a répondu la veille), s'il peut arriver.

Ce que les données scellées rendent impossible (un titre sans titulaire, par exemple) est listé comme tel et vérifié à la lecture du code. Le Mystère et la surprise de la semaine sans titulaire faute d'erreur (`simulation.md`, §6, points 3, 5 et 9) ne sont pas impossibles en principe, mais n'arrivent dans aucune des 400 semaines du réglage : ils sont listés avec ces cas et vérifiés de la même façon. Avec le lot de textes retenu : « Texte rejeté. » n'apparaît jamais (les 17 textes sont adoptés, ou sans vote sur l'ensemble pour le texte 11) ; à écrire au rapport de scellement et à dire au porteur au bilan. N'apparaissent jamais non plus : « Sa raison : aucune des quatre. » (la carte à raison cachée du porteur n'a jamais la raison « aucune ») ; le singulier de Le Fidèle (deux personnages répondent tous les jours, chaque semaine). « … décrochent Le Sans-Faute » (plusieurs titulaires) n'est arrivé dans aucune des 220 parties du harnais, sans être prouvé impossible.

## Annexe A : contraintes de Contenu (complète l'annexe A de `simulation.md`)

- Au moins une considération « pour » et une « contre » (deux et deux recommandé) ; au moins une sur chaque pôle.
- Hors tension : au plus une considération par texte. Parmi les 4 textes S devinés (S des textes 1 à 13), exactement 2 en ont une et 2 n'en ont aucune ; parmi les 3 textes T, exactement 2 en ont une et 1 n'en a aucune. Ailleurs, texte 14 compris, libre. Effet attendu : seul un personnage neutre de fermeté faible (Valentin sur S, Agathe sur T, `profils.md`), sur un texte sans considération hors tension, répond « aucune ». Avec le lot scellé : au plus 3 sur les textes devinés (Valentin aux textes 1 et 4, Agathe au texte 6), plus 1 au texte 14 (Valentin) ; aucune à l'entrée (E1 a une considération hors tension ; personne n'est neutre et peu ferme sur P ni sur L). Au plus 4 en tout, moins si une réponse atypique tombe sur 1, 4 ou 6 ; mesuré au §9 bis. Si Contenu ne peut pas tenir cette répartition avec de vrais arguments, il le signale ; la règle 2.2 ne change pas, seul ce nombre varie.
- Textes d'entrée : clivants (`docs/onboarding.md`), un par tension, sur S, P et L.
- Textes quotidiens : S 5, P 3, T 3, L 3 ; le texte 14 est un texte S, si bien que les 13 textes devinés se répartissent S 4, P 3, T 3, L 3 ; jamais la même tension deux jours de suite ; chaque tension au moins une fois dans les textes 1 à 6 et dans les textes 7 à 13 ; pour chaque tension, au moins un texte de chaque sens ; le texte 1 n'a pas la tension de E3. Ordre retenu : S T P S L T | S P L S T P L | S.
- Réserve de faisabilité, levée ainsi (constat de Contenu, 5 octobre 2026) : seuls trois vrais textes Tradition/Changement tiennent (hors mœurs et religion, quatre arguments de quatre groupes, au moins un par pôle), d'où T 3 et S 5 (Game design). Le quatrième candidat (jardins d'enfants, 38 voix contre 4) reste en réserve : peu disputé, ses arguments « contre » seraient minces et l'écran des quatre raisons paraîtrait déséquilibré. Textes tirés des 16e et 17e législatures.

## Limites propres aux règles de calcul

- Risque à long terme (règles 8 et 19 ensemble) : des joueurs pourraient apprendre à « lire à l'envers » la sélection ; à surveiller en bêta.
- Tradition/Changement n'a que trois textes, tous devinés. Odile et Valentin y sont presque toujours servis ; Agathe et Nassim, neutres tous deux, se disputent la troisième place au tirage : l'un des deux n'y sera vu qu'une fois au plus, sauf réponse atypique (estimation de Game design, mesurée au §9 bis). Sa case est alors signalée, et F1 est aussi donnée sans elle.
- Les sens sont déséquilibrés : 10 textes quotidiens de sens 0 contre 4 de sens 1 (S : 4 contre 1). Si le porteur tend à approuver les textes proposés, son portrait penchera vers sécurité, précaution, tradition et local sans qu'il l'ait voulu ; les vrais textes trouvés ne permettent pas de le corriger. À regarder au bilan.
- Titres biaisés (mesuré au réglage, 200 parties, joueur simulé à la place du porteur) : Le Mystère va au joueur simulé 134 fois sur 200 en semaine 1 et 102 en semaine 2 ; Le Devin, 61 et 40 fois. Le porteur, qui lit aussi l'intensité et les raisons, gagnera probablement Le Devin plus souvent ; Le Mystère lui reviendra probablement au moins une semaine sur deux.
- Être deviné : les personnages trouvent les réponses du porteur à peu près au niveau du hasard (32,0 % puis 26,7 % au réglage ; hasard 25 %), parce qu'ils ne connaissent de lui que le côté de ses quelques cartes vues, sur la même tension. L'essai ne peut pas faire vivre « mon cercle me connaît ». La ligne du carnet « Quand un personnage devinait l'une de vos réponses… » ne mesure pas la constance du porteur : le joueur simulé, cohérent, n'y fait pas mieux. À dire au bilan, jamais avant.
- Semaine 2 plus dure, par le lot : en semaine 1, deux des quatre réponses atypiques (texte 3) reproduisent la carte d'Agathe et restent servies avec elle ; en semaine 2, trois réponses atypiques reproduisent la réponse type d'un autre personnage et en sont séparées : la jumelle typique n'est pas servie au porteur (au texte 6 par le remplacement de l'étape 3 du §4.3 ; aux textes 9 et 12 parce que le tirage de la place 3 ne la retient pas, et le remplacement l'aurait écartée s'il l'avait retenue). Les deux dernières manches du porteur (textes 12 et 13) comptent trois réponses atypiques sur six cartes. Au bilan, lire F2 et sa justesse avec ce repère.
- Valentin sur P : ses trois réponses aux textes P (3, 8, 12) sont des réponses atypiques ; tout ce que le porteur voit de lui sur P, hors l'entrée, va vers l'innovation, alors que le corrigé de F1 dit « Précaution ». Non corrigé : changer la procédure après le tirage reviendrait à choisir le lot.
- Les personnages devinent mécaniquement (le côté, pas l'intensité).
- Agathe et Nassim sur les textes P : tant qu'aucun des deux n'a fait d'écart sur P, une carte de l'un ou de l'autre ne peut pas être départagée ; c'est pile ou face, le prix du profil « deux proches ». La réponse « Je ne pouvais pas trouver » du carnet le mesurera.
- Le joueur simulé du §9 bis n'est pas le porteur : il est cohérent et ne se fatigue jamais. Les seuils de réglage (35 %, 60 %, 70 %) et la loi uniforme de son profil sont des hypothèses de Game design. Le réglage se joue une seule fois : si le nombre de réponses atypiques change, le critère des 60 % n'est pas remesuré sur le fichier refait.
- La version 2 de `simulation.md`, qui contenait ces règles, est sur `main` et dans l'historique Git. Si le porteur l'a lue, le déplacement ne retire rien : l'essai repose sur sa bonne foi, comme pour tout ce dossier. À lui dire à la livraison de la page, sans lui poser de question.
- Des profils figés risquent d'être « résolus » dès la deuxième semaine ; F2 le mesure.
- F1 n'a pas de « Je ne sais pas » : le doute se reporte sur « Au milieu », ce qui fausse un peu la justesse sur un profil proche du centre, s'il y en a. F1 mesure à la fois la lecture du portrait des autres et l'inférence. Ne pas annoncer F1 au porteur : la question est posée à l'improviste, par conception.
