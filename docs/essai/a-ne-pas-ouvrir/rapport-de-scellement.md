# Rapport de scellement de l'essai

*Écrit par l'orchestrateur le 6 octobre 2026, avec le fichier scellé, à partir des sorties du programme de scellement et du programme de contrôle. Il suit le §9 de `docs/essai/simulation.md` (« Rapport de scellement ») et le §9 bis de `regles-de-calcul.md`. Il dévoile autant que `profils.md` : à ne pas ouvrir avant la fin de l'essai. Relu par le Vérificateur (OK avec corrections mineures, appliquées) ; pas de relecture Cohérence, s'agissant d'un rapport de faits.*

**En bref.** Le fichier `fichier-scelle.json` (30 978 octets, SHA-256 `59db7484…7b64`) fixe les 17 textes et les 64 réponses des quatre personnages. Sa graine se calcule depuis le commit `7f4d367` ; Git prouve l'ordre des commits, pas que la règle a été écrite en une fois (déclaration de l'équipe, §3). Le réglage sur 200 parties n'a déclenché aucun changement (§4). Les chiffres constants sont les mêmes pour le programme de scellement, le programme de contrôle et la référence manuelle (§5). Restent à faire : les étapes 1 et 2 du contrôle 1, après publication de l'empreinte et construction de la page (§2, §8).

## 1. Le fichier scellé

| | |
|---|---|
| Fichier | `docs/essai/a-ne-pas-ouvrir/fichier-scelle.json` |
| Taille | 30 978 octets |
| Empreinte (SHA-256 des octets) | `59db748499fd1ece3d5bf6f8ec4b3fed3badd15eb39cf474cd0e31d3045c7b64` |
| Format | JSON canonique, schéma du fichier scellé version 4 (`schema.md`, partie 2) |
| Graine | `23e3ee6ccdc3fb38` |
| Réglage | 3 réponses atypiques par personnage ; seuils non stricts (`seuils_stricts` faux) |
| Jour du scellement | 6 octobre 2026 |
| Publication de l'empreinte | commit `7b4f922` (`docs/essai/empreinte.md`), poussé sur `main` le 6 octobre 2026 à 15h13 (heure de Paris), heure de la poussée ; la même date et la même heure sont écrites dans le message de publication de la conversation (§8.11) et dans le fichier d'entrées de la construction (§8.8) |
| Sources consultées le | 5 octobre 2026 : date de la dernière vérification des textes par Contenu (en-têtes des quatre fiches de `textes/`) ; elle alimente la mention « consultés le » du pied de page (§8.2) |

**Comment il a été produit.** Le programme de scellement (`outillage/scellement/sceller.py`) a été relancé le 6 octobre 2026 sur le commit `75c29d0`, après la dernière relecture de la spécification (Cohérence, puis Vérificateur : « OK avec corrections mineures », corrections appliquées au commit `b791f9a`). Il a redonné, octet pour octet, le fichier candidat produit le 5 octobre et contrôlé depuis : même empreinte. Le programme écrit toujours « candidat » dans le nom de ses sorties et en tête de son rapport ; ses sorties de ce dernier passage sont rangées dans `outillage/scellement/final/` (`rapport-programme-scellement.txt`, `detail-manches-porteur.txt`, `empreintes-sources.json`). Le fichier scellé est le même que `outillage/scellement/candidat/fichier-scelle-candidat.json`.

**Publication de l'empreinte.** Dans la conversation, avec la date et l'heure, et dans un commit poussé sur `main` (`docs/essai/empreinte.md`) ; c'est l'heure de la poussée, enregistrée par GitHub, qui horodate de façon indépendante de l'équipe (§9, « Avant la séance 0 »). Elle est publiée avant que la page de l'essai remplace la page-test.

## 2. Contrôle du fichier (contrôles 1 à 4)

Programme de contrôle, sur le commit `75c29d0` (sortie : `outillage/controle/sorties/controle-scelle-final.txt`) :
- **Contrôle 1** : étapes 3 à 8 passées (forme, schéma, cohérence interne, vecteurs de test, typographie simple, fidélité aux fiches). Étapes 1 (empreinte publiée) et 2 (données embarquées dans la page) : à faire quand l'empreinte sera publiée et la page construite ; le contrôle 1 n'est complet qu'alors.
- **Mêmes sources** (étape 8) : les empreintes des sources lues par le programme de scellement, recopiées par l'orchestrateur en paramètre du programme de contrôle, sont identiques à celles qu'il a lues lui-même : oui. Sources : les quatre fiches de `textes/`, `votes.md`, `profils.md`, `simulation.md`, `schema.md`, et `regles-de-calcul.md` (lue par le programme de scellement ; appliquée mais non lue par le programme de contrôle ; même empreinte des deux côtés).
- **Relance au commit `49ecbdc`** (après les textes d'écran du commit `b04eb73`, qui changent `simulation.md` sans toucher au fichier) : le programme de scellement redonne les mêmes octets ; seule l'empreinte de `simulation.md` change parmi ses sources (`outillage/scellement/final/relance-49ecbdc/`). Relancé de même au commit `741af69`, après la reconstruction de la page (textes d'écran et liste des parties témoins changés dans `simulation.md` et `regles-de-calcul.md`) : mêmes octets (`outillage/scellement/final/relance-741af69/`). C'est sur les empreintes de la dernière relance que le contrôle 1 complet compare « Mêmes sources ».
- **Graine** (ajout du programme de contrôle, hors des huit étapes) : recalculée par la dérivation du §0, identique.
- **Contrôles 2, 3 et 4** (profils, réponses, absences) et **annexe A** du fichier caché : passés. Réponses « aucune » : 0 à l'entrée, 3 sur les textes devinés, 1 au texte 14 (au plus 4 attendues).
- Verdict : aucun défaut.

Hors de portée d'un programme (`schema.md`, partie 4.1) : la vérité des champs du vote, l'exactitude du mandat et du groupe des auteurs, la justesse de chaque forme d'élision, l'absence d'étiquette politique. Ils reposent sur Contenu et sur les relectures du lot de textes.

## 3. Graine

**Ce que Git prouve.** La graine et sa dérivation : les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai|graine|" + E), où E est l'empreinte du commit `7f4d367278ecf07b01ebad883b7ec75cf7840820` (§0 de `simulation.md`), soit `23e3ee6ccdc3fb38` ; chacun peut la recalculer. Le commit `7f4d367` a été poussé sur `main` avant le commit qui contient le programme de scellement et sa règle de dérivation (`719a3fa`, dix-sept minutes plus tard). Git prouve l'ordre des deux commits (`719a3fa` descend de `7f4d367`) ; les dix-sept minutes viennent des dates de commit, que leur auteur choisit (§9) ; l'heure de poussée enregistrée par GitHub pour ces deux commits n'a pas été relevée.

**Ce que l'équipe déclare, sans pouvoir le prouver.** La règle de dérivation (préfixe, choix du commit) a été écrite en une fois, sans essai d'un autre préfixe ni d'un autre commit ; une seule clé d'ordre des raisons a été calculée.

**Écrit ou changé après le commit `7f4d367`, la graine étant connue.**
- *Touche les réponses scellées* : la règle d'ordre des raisons (`regles-de-calcul.md`, §2, clé « ordre-raisons|X|i ») ; la précision de la procédure des réponses atypiques (`profils.md`, « Procédure »), déclarée conforme au programme déjà écrit ; le protocole du réglage (§9 bis), dont le résultat pouvait changer le nombre de réponses atypiques et ne l'a pas changé. Commits `cdc9b29` et `bcc3658` (5 octobre 2026).
- *Ne les touche pas* : le reste des lectures de la passe de spécification du 5 octobre 2026 (`cdc9b29`, `bcc3658`, `6ec7b42`) ; et les modifications du 6 octobre 2026 (`f491419`, `6580e6f`, `3553b2e`, `2c66a93`, `1df9aa5`, `1e631f2`, `4a0d03d`, `841b8bc`, `b791f9a`) : journée pas finie et carnet ; typographie et polices ; mise en forme du pseudo ; minimums du Mystère et de la surprise de la semaine ; curseur net impossible ; partie témoin (a) ; justesse mesurée et limites ; les deux vérifications ajoutées au contrôle 1 (espace avant « ? » ou « ! » non comptée ; aucune espace autre que U+0020), qui ont passé sur le candidat sans le modifier. Le fichier candidat a été produit le 5 octobre 2026 au commit `719a3fa`, sur la spécification du commit `7f4d367` : tout ce qui est listé ci-dessus a été écrit après lui. Preuve de fait pour la suite : le programme de scellement, mis en conformité avec la spécification finale et relancé sur `75c29d0`, redonne les mêmes octets, et le programme de contrôle, qui applique la spécification finale sans lire le programme de scellement, recalcule toutes les réponses scellées sans écart (contrôles 2 à 4). Aucune de ces modifications n'a donc changé le fichier. Ce que cette preuve ne couvre pas : que les trois règles du premier groupe, écrites après le candidat pour décrire ce que faisait déjà le programme de scellement, n'ont pas été choisies en connaissant le résultat ; seulement la déclaration ci-dessus.
- Tout correctif d'avant la séance 0 s'ajoutera à cette liste.

**Indépendance des programmes.** Chaque programme a été écrit par une instance distincte qui, jusqu'à ses premières sorties, ne lisait ni le code ni les sorties des autres ; seul le fichier candidat était partagé. Ensuite, et seulement pour la comparaison du §9, l'auteur du programme de contrôle a lu les carnets de référence (`comparaison.txt`, en-tête) ; il n'a lu ni `scellement/` (hors le fichier candidat) ni `page/`.
- Un écart, dû au brief de l'orchestrateur : l'auteur de la relecture du schéma, avant l'écriture du programme de contrôle, a lu le rapport du fichier candidat. Le programme de contrôle a donc été écrit par une instance neuve, qui n'a lu ni ce rapport ni rien sous `outillage/` en dehors du fichier candidat.
- La page a été écrite par une autre instance, avec la même règle.
- Les carnets de référence ont été calculés à la main par une instance distincte (rôle Game design, modèle de vérification, D-018), figés au commit `9d2d63d` avant toute comparaison.
- L'orchestrateur lit tout ; il n'écrit aucun programme. Il ne transmet aux auteurs des programmes que des fichiers de spécification et deux paramètres qu'il a recopiés lui-même : les empreintes des sources lues par le programme de scellement, et le jour du scellement (l'en-tête de `controle-scelle-final.txt` dit « recopié du rapport de scellement » : c'est l'orchestrateur qui a recopié, pas l'auteur du programme).

## 4. Réglage sur 200 parties (§9 bis)

Joué par le programme de contrôle sur le fichier candidat, avec le réglage par défaut. Graine de réglage g_R = `7a6af27c6d301be3` (SHA-256("elenchos-essai|reglage|23e3ee6ccdc3fb38"), 16 premiers chiffres). Sortie : `outillage/controle/sorties/reglage-candidat.txt` ; diagnostic : `outillage/controle/diagnostic/`.

| Justesse (justes / cartes servies des manches révélées) | Semaine 1 | Semaine 2 | Texte 13 |
|---|---|---|---|
| Joueur simulé | 1496/3000 (49,87 %) | 1529/4000 (38,23 %) | 61/600 (10,17 %) |
| Joueur simulé, sans les cartes atypiques | 1165/2400 (48,54 %) | 1429/2800 (51,04 %) | 61/400 (15,25 %) |
| Personnages sur les cartes du joueur simulé | 939/2934 (32,00 %) | 1096/4102 (26,72 %) | 248/636 (38,99 %) |
| Personnages entre eux | 4328/7866 (55,02 %) | 4812/11098 (43,36 %) | 683/1764 (38,72 %) |

Personnages entre eux, textes 1 à 13 : 9823/20728 (47,39 %).

**Décisions, comparées en fractions exactes.**
- Joueur simulé en semaine 2 : 1529/4000 n'est ni au-dessus de 7/10 ni sous 7/20 : **on garde trois réponses atypiques par personnage**.
- Personnages sur ses cartes en semaine 2 : 1096/4102 n'est pas au-dessus de 3/5 : **on garde les seuils non stricts**.
- Aucun des deux réglages n'est déclenché ; le candidat n'est pas refait.

**Diagnostic** (6 octobre 2026). La justesse des personnages sur les cartes du joueur simulé baisse de la semaine 1 à la semaine 2. Une erreur d'alignement du côté attendu a été écartée : croisement sur les 200 parties : chaque côté attendu faux vient d'une réponse atypique, à ce texte ou déjà vue (le croisement compte à part 130 cartes où la réponse du joueur simulé est neutre : sur une tension où sa réponse type est neutre, seule une réponse atypique vue a pu donner un côté, une réponse neutre pesant w = 0 ; `regles-de-calcul.md`, §3, point 6) ; aucun cas inexpliqué ; et journal écrit à la main, dont le résultat calculé d'avance par Game design est retrouvé. Pourquoi c'est plus bas en semaine 2 : en semaine 1, deux des quatre réponses atypiques (texte 3) reproduisent la carte d'Agathe et restent servies avec elle ; en semaine 2, trois réponses atypiques reproduisent la réponse type d'un autre personnage et en sont séparées (au texte 6 par le remplacement ; aux textes 9 et 12 parce que le tirage de la place 3 ne retient pas la jumelle). Les deux dernières manches du porteur (textes 12 et 13) comptent trois réponses atypiques sur six cartes. Détail : `regles-de-calcul.md`, §3, point 6, et « Limites ».

**Titulaires sur les 200 parties** (joueur simulé à la place du porteur) : semaine 1, Le Devin à Agathe 86 fois, au joueur simulé 61 ; Le Mystère au joueur simulé 134 fois ; semaine 2, Le Devin à Nassim 125 fois, au joueur simulé 40 ; Le Mystère au joueur simulé 102 fois. Le Mystère et la surprise de la semaine sans titulaire faute d'erreur : jamais (0 sur 400 semaines).

Fréquences et départages : voir la sortie du réglage.

## 5. Chiffres constants du fichier

Ils ne dépendent pas des coups du porteur. Ils portent sur ses manches des séances 2 à 14 (textes 1 à 13), pour une partie menée à la clôture. **Calculés trois fois, sans que l'un voie le travail de l'autre : par le programme de scellement, par le programme de contrôle, et à la main par l'auteur des carnets de référence (`outillage/references/manches-porteur.txt`, récapitulatif). Les trois sont égaux sur les lignes du tableau ci-dessous, sauf la ligne des raisons « aucune » parmi les réponses scellées. Celle-ci et les cases vues sont calculées par les deux programmes ; la référence manuelle ne les écrit pas, mais son récapitulatif des treize manches permet de les recompter, et le compte est le même.**

| Chiffre | Valeur |
|---|---|
| Cartes servies au porteur | 38 (3 par manche, sauf 2 à la séance 11) |
| Réponses atypiques parmi ses cartes | 10 sur 38 (même compte avant et après redistribution) |
| Remplacements de cartes identiques | 2 (séance 7, place 2 : carte de Valentin écartée, celle de Nassim à sa place ; séance 14, place 3 : carte de Nassim écartée, celle de Valentin à sa place) |
| Cartes identiques servies ensemble | 2 manches, 5 cartes (séance 4 : Odile, Valentin, Agathe ; séance 9 : Agathe, Valentin) |
| Raisons « aucune » parmi ses cartes | 2 affichées, 0 cachée ; 2 cartes à raison cachée déplacées par le §4.4 (séances 5 et 7) |
| Raisons « aucune » parmi les réponses scellées | 0 à l'entrée, 3 sur les textes devinés (Valentin aux textes 1 et 4, Agathe au texte 6), 1 au texte 14 (Valentin) |
| Égalités de classement | 2 (séances 3 et 4) |

**Cases vues** (ses cartes par personnage et par tension, plus les trois réponses d'entrée d'Agathe) :

| | S | P | T | L |
|---|---|---|---|---|
| Agathe | 4 | 3 | 1 | 4 |
| Nassim | 2 | 1 | 3 | 1 |
| Odile | 3 | 3 | 3 | 3 |
| Valentin | 3 | 3 | 2 | 2 |

Cases vues moins de deux fois, signalées : Agathe sur T, Nassim sur P, Nassim sur L. Est aussi signalée au bilan une case dont toutes les cartes vues sont des réponses atypiques : Valentin sur P (textes 3, 8 et 12). La justesse de F1 sera donnée sur les 16 cases, et sans les cases signalées.

## 6. Impossibilités avec ce lot

- **Écran 5.12** (aucune carte à deviner) : impossible. Chaque texte deviné a au moins deux réponses de personnages.
- **« Texte rejeté. »** : n'apparaît jamais. Seize textes sont adoptés ; le texte 11 est sans vote sur l'ensemble. À dire au porteur au bilan.
- **Curseur net** : impossible dans l'essai (Σ w ≤ 6 < 10) ; donc ni phrase « nette » de la semaine, ni Le Pas de Côté (`simulation.md`, §5.4).
- **Un titre sans titulaire.** Le Fidèle : impossible avec ce lot (Agathe n'a aucune absence ; elle le détient dans les 400 semaines du réglage). Le Devin, Le Mystère et la surprise de la semaine : possibles en principe (Le Devin si personne ne marque ; minimums du Mystère et de la surprise), jamais arrivés dans les 400 semaines du réglage. Lecture du code prévue au §9 bis, après le scellement : à faire avec les contrôles de la page.

## 7. Ce qui confirme le moteur avant la livraison de la page

Sur les deux journaux des carnets de référence (partie « r », arrêtée au jour 4 ; partie témoin (a), menée à la clôture), le programme de contrôle a comparé 5 571 valeurs des feuilles de calcul : un seul écart, du côté de la référence (une marque « atypique » manquante dans une table, sans effet sur un calcul) ; la référence n'a pas été retouchée (`outillage/controle/sorties/references/comparaison.txt`). Ses carnets (durées masquées) et la copie en cours d'essai sont identiques, octet pour octet, aux carnets calculés à la main. La page, écrite sans lire le programme de contrôle, donne sur ces deux journaux la même trace et les mêmes carnets que lui, octet pour octet (`outillage/page/sorties/references/` contre `outillage/controle/sorties/references/` : SHA-256 des traces `b6f733c2…` et `f046ac87…` des deux côtés, carnets comparés par `cmp` ; constaté par l'orchestrateur le 6 octobre 2026, commit `b328346`). La référence a été calculée à l'état du commit `1e631f2` de la spécification (`references/LISEZ-MOI.md`) ; les commits suivants n'ont rien changé de visible dans ces traces.

## 8. Limites

- Les trois calculs sont trois lectures de la même spécification, par deux modèles seulement : les programmes de scellement et de contrôle, comme la page, sur le modèle de production ; les carnets de référence sur le modèle de vérification (D-018). Une erreur de la spécification elle-même, ou un angle mort commun aux deux modèles, ne se voit pas (`CLAUDE.md`, « Limites assumées »).
- Le joueur simulé du réglage n'est pas le porteur : il est cohérent, ne se fatigue jamais, ne lit ni l'intensité ni les raisons. Ses chiffres sont un repère pour le bilan, pas une prédiction.
- La graine dépend d'un commit relu ; que la règle de dérivation ait été écrite en une fois est une déclaration de l'équipe, pas une preuve.
- La vérité des votes, des auteurs et des arguments repose sur Contenu et sur ses relectures, pas sur un programme.
- Les étapes 1 et 2 du contrôle 1 restent à faire (empreinte publiée, page construite).
