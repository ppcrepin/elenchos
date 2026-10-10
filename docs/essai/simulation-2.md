# Le second essai : ce qui change

*Statut : spécification du second essai (étape 4), écrite comme un écart à `docs/essai/simulation.md`. Version 3, assemblée le 9 octobre 2026 à partir des sections de Game design (pilote), UX, Direction artistique, Front-end et Contenu ; elle applique les arbitrages de l'orchestrateur sur les désaccords et les écarts de la version 1. Relue par Cohérence (compatible avec réserves, levées) et par le Vérificateur (OK avec corrections, appliquées). Décisions appliquées : D-032 à D-035 (D-033 remplace D-032 sur la durée, l'entrée, le rappel des profils et le nombre de dimanches ; D-034 pour les raisons ; D-035 pour le compte). Personnages, vies et exemples fictifs.*

*Principe : **tout ce qui n'est pas dit ici reste comme dans `simulation.md`.** Les numéros de sections du premier essai sont gardés ; une section nouvelle prend un numéro libre ou un « bis ». Les règles de calcul des personnages, l'ordre du lot et le calibrage de l'histoire sont dans `a-ne-pas-ouvrir-2/regles-de-calcul-2.md`, jamais ici.*

*Ordre de lecture : instance moteur : §0, §1, §4 à §6, fichier caché, annexes A et B, §9. Instance téléphone et cadre : §0 (calendrier, sauts, message), §7, §8, annexe C. Programme de contrôle : §0, §9, annexe B, fichier caché.*

*Lecture : chaque section dit qui l'a écrite ; le texte des spécialistes est recopié mot pour mot. « [Assembleur : …] » est une note de l'assembleur (écart, manque, renvoi) ; « [renvoi] » signale un renvoi rapproché vers ce document ; « (arbitrage de l'orchestrateur : … ; positions : …) » rapporte, à sa place, un désaccord tranché et la position de chaque rôle. Le relevé complet est à la fin (« Notes de l'assembleur »). Quand un spécialiste renvoie à sa version de travail du 8 octobre (« reprendre … mot pour mot »), ce texte est recopié ici à sa place, pour que le document se lise seul.*

## En bref

- **Forme (D-033)** : deux semaines de jeu, du jour 1 (lundi) au jour 14 (dimanche), clôture au jour 15. Cinq jours joués (1, 2, 3, 7, 14) ; deux sauts à points fixes, annoncés au départ (jours 4 à 6, puis 8 à 13), pendant lesquels le porteur répond d'affilée aux textes sautés, sans deviner (§0).
- **Entrée** : le porteur arrive en nouveau venu, par le défi de Valentin (trois textes d'entrée), dans le cercle « Amis », qui joue depuis treize semaines. Aucune aide ajoutée, pas de rappel des profils (§1, §7.2, D-023).
- **Les personnages** : les mêmes quatre, avec les mêmes profils cachés. L'histoire du cercle (jours −90 à 0) est calculée sur des textes abstraits, scellée, et calibrée sur des critères écrits d'avance ; le porteur n'en voit que les traces : titres, tempéraments, initiales sur les barres, surprise de la semaine (§1, §7.16).
- **Compte (D-035)** : l'écran 1.8 montre trois voies de même poids, Apple, Google et e-mail ; elles sont dessinées et ne se connectent à rien (§7.2, §8.8).
- **Portrait accéléré** : les poids du porteur comptent triple ; son portrait avance environ six fois plus vite que dans le jeu. La page d'arrivée puis une note de la bande le disent (§5.9, §7.15).
- **Barre du portrait** : 16 crans, entrée comprise ; pleine à 16 réponses ou dès le premier curseur net, puis pleine sans rien annoncer ; dans Moi › Portrait seulement (§5.8, §7.15).
- **Deviner et révéler** : cinq manches (T0, T1, T2, T6, T13), quinze cartes en tout. Le jumeau compte juste (D-024) ; l'avis du cercle s'affiche à la révélation dès trois réponses, en escalier, sans aucun nombre (D-025 ; §4, §7.14, §7.23).
- **Ce qui devient vivant** : curseurs nets, tempéraments, phrase « nette » du dimanche, Le Pas de Côté (§5, §6).
- **Raisons (D-034)** : toujours quatre, deux de chaque côté, avec un argument inattendu de chaque côté ou aucun. Rien ne change à l'écran (§7.21, annexe A).
- **Lot et délai** : 18 textes scellés (6 à 12 rejetés, cible 7), deux réserves, une fiche légère ; 5,5 à 7 jours de calendrier entre la spécification validée et la page contrôlée, Contenu en parallèle (annexe A, « Lots et délai »).

## 0. Cadre commun (Game design)

Ce qui n'est pas dit ici reste comme au §0 de `simulation.md` : les quatre tensions, les notations, les positions, le tirage déterministe, le calcul exact.

### Graine et tirage

- **Graine.** Les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai-2|graine|" + E). E est l'empreinte complète (40 chiffres hexadécimaux minuscules) du commit de cette spécification relue, avant le premier fichier candidat.
  - Elle ne change plus, même si le fichier est refait : réglage, calibrage de l'histoire, candidat en deux temps, correctif d'avant le jour 1.
- **Clés.** Comme au premier essai, avec trois ajouts :
  - un jour d'avant l'arrivée s'écrit avec le signe moins (« -37 ») ;
  - les textes de l'histoire s'écrivent H1 à H90 ;
  - les semaines se numérotent de 1 à 15 depuis le début du cercle, et le numéro de tirage de l'histoire r est un entier décimal (§1).
- **Vecteurs de test** : t("raison|Odile|E2|3"), t("hasard|Nassim|13|porteur"), t("ecart-hstar|1|Valentin").

### Notations ajoutées

| Symbole | Sens |
|---|---|
| j | jour, de −90 à 15. Le jour 1 est le lundi de l'arrivée ; le jour j est un lundi si (j − 1) mod 7 = 0. |
| Tn | texte du jour n (n = 0 à 14), répondu le jour n |
| Hi | texte de l'histoire (i = 1 à 90), répondu le jour i − 91 |
| semaine | de 1 à 15 depuis le début du cercle. La semaine w va du jour 7(w − 14) + 1 au jour 7(w − 13). Les semaines 1 à 13 sont l'histoire ; les semaines 14 et 15 sont les deux semaines de l'essai (« première » et « seconde semaine »). |

### Calendrier jour par jour (lecture A, D-010)

Un texte répondu le jour j est deviné le jour j + 1 et révélé le jour j + 2.

| Jour | Vécu par le porteur | Révélation | Deviner | Répondre | En plus |
|---|---|---|---|---|---|
| −90 à 0 | non : histoire calculée (§1) | — | — | personnages : H1 à H90, puis T0 au jour 0 | 13 semaines, avec leurs titres |
| 1 · lundi | joué | — | T0 | E1, E2, E3 (entrée), puis T1 | pages du début ; défi de Valentin ; compte (1.8, D-035) ; « Tu as rejoint Amis. » |
| 2 · mardi | joué | T0, avec cartes | T1 | T2 | — |
| 3 · mercredi | joué | T1, avec cartes | T2 | T3 | — |
| 4 · jeudi | joué jusqu'à la révélation, puis premier saut | T2, avec cartes | jamais ouverte (T3) | T4, au rattrapage | page du saut |
| 5 · vendredi | sauté | T3 : révélée au vote, jamais lue | jamais ouverte (T4) | T5, au rattrapage | — |
| 6 · samedi | sauté | T4 : révélée au vote, jamais lue | jamais ouverte (T5) | T6, au rattrapage | — |
| 7 · dimanche | joué | T5, au vote | T6 | T7 | badges rares, titres de la semaine 14, phrase de la semaine ; questions du dimanche ; copie du carnet |
| 8 · lundi | joué jusqu'à la révélation, puis second saut | T6, avec cartes | jamais ouverte (T7) | T8, au rattrapage | page du saut |
| 9 à 13 · mardi à samedi | sautés | T7 à T11 : révélées au vote, jamais lues | jamais ouvertes (T8 à T12) | T9 à T13, au rattrapage | — |
| 14 · dimanche | joué | T12, au vote | T13 | T14 | badges rares, titres de la semaine 15, phrase de la semaine ; questions du dimanche |
| 15 · lundi | clôture | T13, avec cartes | — | — | fiche de T14, questions de fin, copie, dévoilement, « Tout effacer » |

- **« Au vote »** : révélation sans cartes, parce que la manche n'a jamais été ouverte (R10). Elle commence au vote : vote, avis du cercle, auteurs, badges rares.
- **« Jamais lue »** : la révélation a lieu sans le porteur et ne revient pas (E3). Le vote et les auteurs se lisent dans l'Historique (5.4).
- **Bilan** : cinq manches (T0, T1, T2, T6, T13), et exactement quinze cartes. Chaque texte a au moins trois réponses de personnages (au plus une absence par texte, fichier caché).
- **Révélations lues** : E1 à E3 (1.6), T0, T1, T2, T6 et T13 avec cartes ; T5 et T12 au vote.

### Les sauts (D-033)

- **Deux sauts, à points fixes, annoncés sur la page du début** : jours 4 à 6, puis jours 8 à 13. Il n'y en a pas d'autre, et on ne peut pas les éviter.
- **Déroulé du premier saut** (le second est identique, jours 8 à 13, textes T8 à T13) :
  1. « Aller au jour suivant » du jour 3 atteint le jour 4.
  2. Message de 18h, puis révélation de T2 : les cartes de mercredi.
  3. Depuis 2.7f (« Jouer ») ou depuis la bande (« Avancer au dimanche »), la page du saut (frise).
  4. « Avancer au dimanche » lance le rattrapage : Répondre T4, T5, T6, d'affilée.
  5. Écran verrouillé du jour 7, avec le message de 18h du dimanche.
  
  Mots et formes : UX (§7.4, §8.1 ter) [renvoi].
- **« Annuler »** ramène au téléphone : la révélation du jour, Le Cercle, Moi. La seule suite possible reste « Avancer au dimanche ». Les jours 4 et 8 n'offrent jamais de Deviner : les manches de T3 et de T7 ne sont jamais ouvertes.
- **Rattrapage.**
  - C'est l'écran Répondre du produit, un texte à la fois. La phrase du jour s'affiche après chaque réponse (règle 18).
  - Une réponse est exigée pour chaque texte (UX). « Arrêter l'essai » reste possible.
  - Ces réponses comptent pour tout : portrait, barre, Le Fidèle, phrase de la semaine, cartes servies aux personnages, avis du cercle.
- **Ordre des jours dans un saut.**
  - Le jour 5 est atteint quand la réponse à T4 est validée ; le jour 6, après T5 ; le jour 7, après T6.
  - Au second saut : le jour k + 1 est atteint quand Tk est validé, pour k = 8 à 13.
  - Chaque jour, les personnages jouent avec la réponse du porteur de la veille.
- **Ce qu'un saut fait perdre** :
  - les manches des jours sautés : jamais ouvertes, donc sans cartes (R10) ;
  - leurs révélations : jamais lues (E3).
  
  Aucun dimanche n'est sauté.

### Règles de calendrier (reprises du premier essai)

- Un jour est atteint dès que la barre de l'essai l'affiche, ou, pendant un saut, selon l'ordre ci-dessus.
- Le texte n est révélé dès que le jour n + 2 est atteint, qu'il ait été lu ou non. Ses points, les titres et les curseurs vus le comptent alors.
- Les titres d'une semaine tombent dès que son dimanche (jour 7 ou 14) est atteint.
- Ouverture d'un jour, toucher : définitions de `simulation.md` §0, inchangées.

### Les deux semaines de l'essai

| | Jours | Révélations comptées (points, Le Devin, Le Mystère, Le Sans-Faute, surprise) | Réponses comptées (Le Fidèle, phrase de la semaine) |
|---|---|---|---|
| Semaine 14 (première) | 1 à 7 | textes révélés les jours 1 à 7 : H90 (jour 1), puis T0 à T5. Pour le porteur : ses manches sur T0, T1, T2. | T0 à T6 ; pour le porteur, T1 à T6, depuis son arrivée |
| Semaine 15 (seconde) | 8 à 14 | T6 à T12. Pour le porteur : sa manche sur T6. | T7 à T13 |

- T13, révélé le jour 15, ne compte dans aucune semaine. T14 n'est jamais deviné.
- Les points repartent de zéro au jour 8.
- H90 compte pour les points, Le Mystère et Le Sans-Faute de la semaine 14. Il ne peut pas être sa surprise : il n'a pas de titre (convention d'essai).
- Les semaines 14 et 15 du cercle sont les semaines 1 et 2 de l'essai : c'est ainsi que les nomment le cadre (frise, carnet), Front-end (§9, contrôle 15) et Contenu (annexe A, A.6). (arbitrage de l'orchestrateur : phrase de correspondance ajoutée ; positions : Game design et le téléphone numérotent 14 et 15 ; le cadre, Front-end et Contenu, 1 et 2.)

### Abandonner une journée (le lien à part de D-032, R10)

- Possible aux jours joués : 1 (seulement après l'entrée, qui porte le consentement et le pseudo), 2, 3, 7, 14.
  - (arbitrage de l'orchestrateur : jamais aux jours 4 et 8, où il n'y a ni lien ni « Jour suivant », comme au §8.1, au §8.3, dans le format du carnet (§8.12) et dans les parties témoins (§9) ; positions : Game design permettait d'abandonner aux jours 4 et 8 avant le saut ; UX ne met ni le lien ni « Jour suivant » ces jours-là.)
- Il mène à la même suite que « Jour suivant » : jour suivant, saut ou clôture.
- Abandonner vaut 18h :
  - la manche se ferme telle qu'elle est ;
  - un visage posé compte, même sans « Valider » ;
  - une raison posée avec son visage compte ;
  - une passe posée compte comme passe ;
  - une carte vide est passée.
- Une manche dont l'écran Deviner ne s'est jamais affiché n'a pas de cartes.
- Une position sans raison n'est pas une réponse.
- Une révélation non lue ne revient pas. Les titres restent visibles sous les visages et dans les titres passés. La phrase de la semaine d'un dimanche abandonné avant la fin des titres est perdue.
- La confirmation dit ce qu'on perd (mots d'UX, §8.1 bis [renvoi]).

### Le message de 18h (E1)

| Jour | Forme, si chaque journée jouée a été finie |
|---|---|
| 1 | aucun : on arrive en cours de journée |
| 2, 3, 4, 8 | « 18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. » |
| 7, 14 | « 18h. Le vote de l'Assemblée t'attend, et la question d'aujourd'hui. » Puis « Ce soir, aussi : les titres de la semaine. » s'il y a au moins un titre |
| 5, 6, 9 à 13 | aucun : ce sont des jours de saut |
| 15 | aucun (convention du premier essai) |

Après un abandon, la règle générale d'E1 s'applique :
- des cartes : forme « Qui avait dit quoi » ;
- sinon, le vote d'un texte auquel le porteur a répondu : forme « vote » ;
- sinon : « 18h. La question d'aujourd'hui t'attend. ».

**Pause (règle 5)** : sans objet (règle des absences au fichier caché, qui l'exclut).

## 1. Les personnages et l'histoire du cercle (Game design)

### Les personnages

- **Les mêmes** : Agathe, Nassim, Odile et Valentin, dans le cercle « Amis », avec les mêmes profils cachés. Ces profils sont recopiés sans changement dans `a-ne-pas-ouvrir-2/`.
- Les visages restent dans le même ordre. Le porteur vient en dernier : il est arrivé le dernier, il est le cinquième membre.
- Ils ne passent jamais.
- **Valentin invite le porteur** (D-033). C'est le moins deviné du premier essai (0 sur 10, bilan). Ses réponses aux trois textes d'entrée sont calculées comme les autres (fichier caché, 2.5).
- **Fiche « Qui est qui »** : la vie des personnages (âge, métier, ville, ligne de vie, heure de jeu), et « C'est lui qui vous invite. » sous Valentin.
  - Il n'y a pas de rappel des profils : Le Cercle le remplace (D-033).
  - Mots et place : UX (§8.2) [renvoi].
- **Nouveau dossier `docs/essai/a-ne-pas-ouvrir-2/`.** La page du début dit qu'il reste fermé jusqu'à la fin (mots d'UX et de Juridique : §8.2, page C [renvoi]).
- Les personnages s'absentent parfois et répondent parfois contre leur profil, exprès, avant comme pendant l'essai, par les mêmes règles (fichier caché). Il n'y a jamais plus d'une absence par texte.

### L'histoire du cercle

- **Durée** : 13 semaines, jours −90 à 0. Agathe a créé le cercle ; les quatre personnages en sont membres depuis le jour −90.
  - Ils ont répondu aux trois textes d'entrée du cercle, E1 à E3, les mêmes que ceux du porteur (`docs/onboarding.md`, D-006). Ces réponses comptent pour leur portrait (règle 15).
  - Le porteur devient membre le jour 1.
- **À quatre** (jusqu'au jour 1), chaque personnage devine toutes les réponses des trois autres. La règle 8 ne sélectionne qu'à partir de cinq membres.
  - Les personnages devinent T0 le jour 1 sans proposer le porteur, arrivé après le jour où T0 a été répondu (§4).
  - La sélection de la règle 8 s'applique aux manches des personnages dès le jour 2, et à la manche du porteur dès le jour 1 : sur T0, il a quatre réponses de personnages (trois s'il y a une absence) pour trois cartes.
- **Les textes.** H1 à H90 sont des textes abstraits : une tension, un sens, quatre raisons décrites par leur côté et leur pôle. Ils n'ont ni titre, ni mots, ni auteur, ni vote. Ils ne s'affichent jamais.
  - Exception : H86 (jour −5, mardi), « Vaisselle en plastique interdite dans les cantines d'enfants ».
  - Il a une fiche légère (titre, tension, sens, vote) et des raisons abstraites, jamais montrées.
  - C'est la surprise de la semaine 13, affichée dans Le Cercle les jours 1 à 6 (maquette 4.2).
  - Toucher l'encadré : recommandation de GD, « Pas dans l'essai. ». Le porteur n'a jamais répondu à ce texte, et sa fiche n'a ni raisons ni auteurs. Décision d'UX. [Assembleur : UX a tranché : l'encadré n'ouvre rien, la fiche légère n'est jamais affichée (§7.16).]
- **Le calcul.** Les réponses de l'histoire sont scellées. Tout le reste est recalculé dans la page et par le programme indépendant (Front-end) : cartes, devinettes, titres, curseurs, tempéraments. Le rapport de scellement publie l'état à l'arrivée, que les deux doivent retrouver.
- **Le calibrage.** L'histoire est vérifiée contre des critères écrits d'avance :
  - les curseurs nets de chacun ;
  - les tempéraments ;
  - la surprise de la semaine 13 ;
  - des titres variés.
  
  Si elle ne les remplit pas, le calcul est refait avec le numéro de tirage suivant (r = 1, 2…), jusqu'au premier qui les remplit. Le numéro retenu est inscrit au fichier scellé et montré au dévoilement. Rien de l'histoire ne dépend du porteur. Les tirages de la période de l'essai (T0 à T14) ne dépendent pas de r.
- **Ce que le porteur en voit**, comme tout nouveau venu (UX, §7.16 [renvoi]) :
  - sous les visages, les titres de la semaine 13 et les tempéraments ;
  - la surprise de la semaine 13 ;
  - les initiales sur les barres des tensions où un curseur est net ;
  - l'écran d'un proche, au portrait net ;
  - les titres passés des semaines 1 à 13.
  
  Jamais une révélation, un texte ou une réponse d'avant son arrivée.
- **À l'arrivée**, chaque personnage a trois ou quatre curseurs nets sur les quatre tensions de l'essai. Les quatre tensions écartées restent floues et immobiles.

## 2 et 3. Comment un personnage répond et devine (Game design)

Tout est dans `a-ne-pas-ouvrir-2/regles-de-calcul-2.md`. Ce qui peut se dire ici :
- toutes les réponses des personnages, histoire comprise, sont scellées avant le jour 1 et ne dépendent en rien de celles du porteur ;
- un personnage ne passe jamais ;
- ses devinettes se comptent comme celles du porteur (§4, D-024).

## 4. Les réponses à deviner (Game design)

**§4.1 à §4.4** : règles complètes dans le fichier caché. Quatre points :

- **Réponses « inattendues » (R3).**
  - Si le curseur de l'auteur est flou, une réponse inattendue est celle qui se distingue le plus des autres réponses du jour.
  - S'il est net, c'est celle qui s'écarte le plus de ce curseur.
  - Le curseur est celui que le devineur peut voir : l'entrée et les textes déjà révélés.
  - La réponse du devineur n'entre jamais dans le calcul.
  - Le mélange des deux du premier essai est retiré.
- **Ce qui est juste (D-024, R4).** Une attribution est juste si le membre désigné a donné exactement la réponse de la carte : même position, même raison, « aucune » comprise.
  - Une seule règle couvre donc trois cas : l'auteur, un jumeau non servi, deux cartes identiques servies ensemble.
  - On évite de servir le même jour deux réponses identiques quand une autre peut prendre la place (R4).
  - L'auteur d'une carte est son auteur d'origine ; pour des cartes identiques servies ensemble, les auteurs sont redistribués comme au premier essai. Cet auteur ne sert qu'à « C'était … », au Mystère et à « Ses surprises ».
- **Raison cachée trouvée** : la personne est juste, au sens ci-dessus, et la raison aussi (R5).
- **Qui est proposé (convention d'essai).** Tous les autres membres (D-011), sauf un membre arrivé après le jour où le texte a été répondu. Le jour 1, les personnages devinent T0 sans proposer le porteur. Le produit ne dit rien de ce cas (constat pour l'étape 6).

**§4.5** : inchangé.

**§4.6** : inchangé, plus le jumeau.
- Si le membre désigné avait donné la même réponse que l'auteur, le verdict est « Tu connais ton monde. » (ou « …, et ses raisons. »).
- Il est suivi de « C'était {auteur}. {Prénom} avait répondu la même chose. ». Jamais « Ça alors ! ».
- Place et visage : UX (§7.13 [renvoi]).

**« Ses surprises »** : les cartes révélées de ce proche que le porteur a attribuées à un membre dont la réponse différait.
- Un jumeau désigné n'en est pas une (règle 19).
- Sont exclus : les cartes passées et les textes d'entrée.

## 5. Le portrait (Game design ; place et forme : UX, §7.15, et Direction artistique, §7.23)

**§5.1, §5.2, §5.5, §5.6** : inchangés. Netteté : Σw ≥ 10. Les poids du porteur sont triplés (§5.9).

**§5.3, ordre dans Moi** (convention d'essai) :
- d'abord les curseurs nets, du plus éloigné de 1/2 au plus proche, puis du plus grand Σ au plus petit, puis dans l'ordre S, P, T, L ;
- puis les flous, du plus étroit au plus large, à égalité dans l'ordre S, P, T, L ;
- puis les quatre tensions écartées.

Les nets passent par leur écart à 1/2 : c'est la « hiérarchie des valeurs » que le porteur veut voir, et c'est la mesure que retient la phrase validée de 3.3e.

**§5.4 Ce qui est compté**
- **Le portrait du porteur**, dans Moi et sur son rond dans Le Cercle : toutes ses réponses dès qu'elles sont données (entrée, jours joués, rattrapage), avec des poids triplés.
- **Les personnages** : leurs réponses à E1 à E3, à toute l'histoire et à l'essai, avec des poids normaux. Le porteur ne voit d'eux que l'entrée et les textes déjà révélés (≤ j − 2 au jour j : lecture A).
- **Le Cercle** : sur chaque barre, l'initiale de chaque membre dont le curseur est net, placée à son centre. « Encore flou : » liste les autres, dans l'ordre des membres.
- **L'écran d'un proche** : les deux portraits superposés. Un curseur net se dessine en point.
- **Curseurs nets.** Ils existent maintenant pour les personnages dès l'arrivée, et pour le porteur dans la seconde semaine au plus tôt (§5.7).
  - Entrent donc dans l'essai : R3 par la distance, la phrase « nette » du dimanche, Le Pas de Côté.
  - La règle du premier essai (« un programme qui rencontre un curseur net s'arrête ») est retirée.

**§5.7 Phrase de la semaine** (R2, D-030)
- **Moment de lecture** (proposition de Front-end, confirmée) : à l'ouverture du dimanche, sur toutes les réponses déjà données, entrée et rattrapage compris (9 réponses au jour 7, 16 au jour 14), avant la réponse du dimanche. La phrase ne change pas pendant la séance. Le curseur affiché dessous est celui de Moi à cet instant.
- **Forme « nette », validée (3.3e)** : « Entre {…} et {…}, tu choisis le plus souvent {…}. ». Conditions (conventions d'essai) :
  - seulement pour une tension devenue nette depuis la lecture du dimanche précédent. Pour la semaine 14, la référence est l'état à l'arrivée, après l'entrée ;
  - s'il y en a plusieurs : la plus éloignée de 1/2, puis le plus grand Σ, puis S, P, T, L ;
  - un curseur net dont le centre vaut exactement 1/2 n'y entre pas.
  
  Raison : « devenue nette » (R2). Une tension déjà nette répétée chaque dimanche ne dirait plus rien.
- **Sinon**, les trois formes du premier essai (§5.7 de `simulation.md`), sur les réponses de la semaine (T1 à T6, puis T7 à T13).
- **Dans cet essai**, la forme nette est impossible au jour 7 : au plus trois réponses par tension, soit Σ ≤ 9 avec les poids triplés. Elle devient possible au jour 14.

**§5.8 La barre du portrait** (D-026 ; D-033 pour l'essai)
- Un cran par réponse validée, position et raison. Les trois réponses d'entrée comptent (lecture de Front-end, comme le portrait).
- **16 crans.** Elle est pleine à 16 réponses (E1 à E3, puis T1 à T13), ou dès le premier curseur net du porteur (proposition d'UX acceptée). Ensuite, elle reste pleine, sans rien annoncer (D-033).
- Elle ne recule jamais et ne porte aucune date. Elle n'est visible que du porteur (D-026) : place dans Moi seulement (UX).
- Remarque de GD à UX : une étiquette du type « vers tes premiers curseurs nets » sous une barre pleine, sans curseur net, promettrait ce qui ne vient pas. C'est le cas que D-026 redoutait. À régler par UX ; vos « deux lectures » vont dans ce sens. [Assembleur : UX garde l'étiquette « Vers tes premiers curseurs nets » et ajoute une note unique du cadre quand la barre est pleine (§7.15) ; Game design range le cas parmi les constats pour l'étape 6. Cohérence : lecture d'UX confirmée. « Sans texte » (D-033) reprend « elle reste pleine, sans rien dire » de la proposition validée et vise le message au bout ; l'étiquette est une convention d'essai non validée (annexe C, point 5) ; l'objection de Game design est le point que D-026 laisse à l'étape 6, que l'essai laisse ouvert à dessein.]

**§5.9 Le portrait accéléré** (D-033 ; facteur : convention d'essai)
- **Calcul** : chaque poids du porteur compte triple (3w) dans Σ, donc dans le centre, la largeur et le seuil de netteté. Les poids des personnages ne changent pas.
- **Pourquoi 3.**
  - L'essai n'a que quatre tensions : chacune reçoit deux fois plus de textes que dans le jeu. Avec le facteur 3, le portrait avance environ six fois plus vite. Le second dimanche, avec 16 réponses, ressemble à environ trois mois de jeu (une centaine de réponses).
  - C'est aussi le facteur qui imite le mieux la sévérité du jeu.
    - Dans le jeu, à trois mois, une tension compte environ onze réponses et devient nette s'il y a au moins dix arbitrages nets.
    - Dans l'essai, une tension en compte trois à cinq, quatre le plus souvent. Avec quatre, il faut les quatre (ou trois, plus un penchant).
    - Pour un joueur qui fait un arbitrage net quatre fois sur cinq, la chance qu'une tension soit nette vaut environ 0,32 dans le jeu, 0,41 avec le facteur 3, et 0,82 avec le facteur 4.
- **Ce qui n'est pas accéléré** :
  - la phrase du jour ;
  - la barre (elle compte des réponses) ;
  - les tempéraments ;
  - les portraits des personnages ;
  - l'idée que les personnages se font du porteur pour le deviner (fichier caché, règle 3.2).
- **Signalement** : la page du début, puis une note dans la bande sur chaque écran qui montre un curseur du porteur (UX, §8.2 C et §7.15 [renvoi]). Proposition de mots : « Dans l'essai, votre portrait avance environ six fois plus vite que dans le jeu. »
- **Réglage du facteur** : contrôlé une fois sur les 200 parties de réglage (fichier caché, §9 bis). Il passe à 4 ou à 2 seulement si le critère écrit l'exige. Le chiffre du signalement suit alors le facteur, partout où il est écrit (page d'arrivée §8.2 C, note de la bande §7.15, dévoilement §8.6) : « environ huit fois » pour 4, « environ quatre fois » pour 2 ; la page le lit dans le fichier scellé avec le facteur. Un facteur autre que 3 touche D-033 (« environ six fois plus vite ») : il est dit au porteur à la livraison, comme une information.

## 6. Titres et badges (Game design ; écrans : UX)

Le §6 du premier essai s'applique, avec ces changements :

1. **Points** : un par attribution juste au sens du §4, jumeau compris.
2. **Le Devin** : au moins un point. En cas d'égalité, le plus de raisons cachées trouvées, puis le tirage.
3. **Le Mystère** : tentatives sur les cartes de X révélées dans la semaine, passes exclues.
   - Une erreur désigne un membre dont la réponse diffère ; désigner un jumeau n'est jamais une erreur.
   - Il faut au moins six tentatives et une erreur (R6).
4. **Le Fidèle** (convention d'essai pour le nouveau venu) : tous ceux qui ont répondu à tous les textes de la semaine répondus depuis leur arrivée.
   - Pour le porteur, en semaine 14 : T1 à T6.
   - Libellés : semaine 14, « ont répondu chaque jour » (vrai pour tous) ; semaine 15, « ont répondu les sept jours » (validé).
   - Le produit ne dit rien du nouveau venu arrivé en cours de semaine (constat pour l'étape 6).
5. **La surprise de la semaine** : passes exclues, au moins quatre attributions dont une fausse. Un jumeau n'est jamais faux.
   - Dans l'essai, seul un texte qui a un titre peut être la surprise. H90 en est exclu en semaine 14.
   - En semaine 13, H86 l'est par le calcul ordinaire (calibrage).
6. **Le Sans-Faute (R7)** : aucune erreur ni passe les jours où le membre a des cartes, et des cartes au moins cinq jours de la semaine. La raison cachée n'est pas exigée.
   - Il est possible pour les personnages, chaque semaine, histoire comprise.
   - Il est impossible pour le porteur : il a des cartes trois jours en semaine 14 et un jour en semaine 15.
   - Il est annoncé avant les titres, puis vit comme un titre (UX §7.20 [renvoi]).
7. **Le Pas de Côté (R11 ; seuil : convention d'essai)**
   - Une réponse du jour qui fait nettement passer une valeur avant l'autre (arbitrage net, §5.1), à l'opposé du curseur de son auteur sur cette tension, tel qu'il était juste avant cette réponse : toutes ses réponses précédentes, entrée comprise, avec ses propres poids.
   - Ce curseur doit être net (Σ ≥ 10) et pencher clairement (|c − 1/2| ≥ 1/5, le seuil du premier essai).
   - Il vaut pour tout membre, sur les textes du jour, jamais l'entrée.
   - Il est annoncé à la révélation de ce texte, avec les badges rares, après les auteurs. Plusieurs le même soir sont possibles.
   - Il ne vit pas ensuite comme un titre : R11 ne le dit pas, contrairement à R7. Une révélation jamais lue l'emporte avec elle. Jamais dans le carnet.
   - Pour le porteur, il reste rare avec le facteur 3 : sur chaque tension, sa quatrième réponse est la première qui peut rendre le curseur net, et il faut ensuite une réponse nettement contraire sur un texte dont la révélation est lue. Le détail, qui dépend de l'ordre des textes, est rangé au fichier caché. (arbitrage de l'orchestrateur : rangé au fichier caché, à lire après l'essai.)
8. **Tempéraments** (règle 13, R9 ; seuils et fenêtre : conventions d'essai)
   - **Calcul** : chaque dimanche, au moment des titres (jours 0, 7, 14).
     - Sur les réponses aux textes révélés pendant les 56 derniers jours, ce dimanche compris. Textes d'entrée exclus.
     - Un texte compte s'il a au moins trois réponses.
     - Côtés : défavorable (1, 2), neutre (3), favorable (4, 5).
   - **Conditions** : être membre depuis au moins 56 jours, et avoir au moins 20 réponses dans la fenêtre. Le porteur n'en a donc aucun pendant l'essai.
   - **L'Original** : seul de son côté (favorable ou défavorable), sans aucun autre membre de ce côté, sur au moins 3 de ses réponses sur 10.
   - **Le Pont** : seul au milieu (seul « Neutre »), alors que les autres ont au moins une réponse favorable et une défavorable, sur au moins 1 de ces textes sur 8. Il faut au moins 6 textes ainsi partagés.
   - **Le Mesuré** : « Neutre » sur au moins 1 de ses réponses sur 3.
   - **Le Tranché** : « Très … » sur au moins 1 de ses réponses sur 2.
   - **Affichage** : sous le visage, après les titres, un par ligne, dans l'ordre L'Original, Le Pont, Le Mesuré, Le Tranché. Dans Moi : « Le Pont (Amis) » (R9). Jamais dans le carnet.
   - **Désaccord nommé** : `projet.md` §4 définit Le Pont « par tension ». L'essai le définit texte par texte. C'est plus simple, et cela se limite de soi-même aux textes où le cercle se partage.
9. **Séquence du dimanche, titre sans titulaire, cumul des titres** : inchangés.

## 7. Dans le téléphone (UX ; formes : Direction artistique, §7.23 ; calcul de l'avis du cercle : Game design, §7.14)

*[Assembleur : les numéros du §7 sont ceux d'UX. UX ajoute « 7.4 Les jours de saut » et décale donc d'un cran la suite par rapport à `simulation.md` : ici 7.5 (dimanches et clôture) ≈ 7.4 du premier essai ; 7.6 Deviner = 7.5 ; 7.7 Élision = 7.6 ; 7.8 Typographie = 7.8 ; 7.9 (réservé, écran d'un proche traité au 7.16) = 7.7 ; 7.10 Vote = 7.9 ; 7.11 Auteurs = 7.10. Les sections 7.12 à 7.23 sont nouvelles. La section de la Direction artistique, numérotée §7.11 chez elle, devient ici §7.23. Dans les textes repris de la version de travail d'UX, « la simulation 1 » désigne `simulation.md`.]*

Le téléphone montre le produit, en « tu » : les maquettes validées (D-014) et ce qu'y ajoutent D-024 à D-030 (`produit.md`). Les écrans de la journée ne sont pas redessinés (D-022). L'entrée revient (D-033), avec l'écran du compte de D-035, dessiné. Le cercle a trois mois d'histoire : des écrans jamais vus au premier essai s'affichent pleins (§7.16). Le portrait du porteur est accéléré (§7.15).

### 7.1 Écrans présents (écarts au §7.1 de `simulation.md`)
- **Présents :**
  - 1.1 à 1.9 : 1.8 est redessiné selon D-035, et un écran 1.8b s'ajoute pour la voie e-mail (§7.2) ;
  - 2.1 à 2.7f, 3.1 à 3.3e ;
  - 4.1, en entier dès qu'un curseur du porteur est net (§7.15) ;
  - 4.2 et 4.3 pleins (§7.16) ;
  - 5.2 à 5.5, 5.7, 5.11, et 5.12 si le cas se présente.
- **Absents :** 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 5.1, 5.6, 5.8, 5.9, 5.10, 5.13, 5.14.
  - 1.12 ne sert pas : au premier Aujourd'hui, une manche est ouverte (§7.2, fin).
- **5.2** : sans la ligne « Tempérament » (le porteur n'en a aucun : il faut deux mois, règle 13).
  - Lignes : « Semaine {n} » · « {titres} · Amis ».
- **5.3** : les trois textes d'entrée y figurent (E6), en bas de la liste, la plus ancienne en bas. Chacun à gauche « Pour commencer · {titre} », à droite « {Position} ». L'essai n'a pas de dates : « Pour commencer » tient lieu de jour.
- **5.7** : la ligne « E-mail » devient « Connexion ». Sa valeur dépend du bouton touché en 1.8 : « Apple », « Google » ou « toi@exemple.fr ».
- **2.5 pendant un saut** : réduit (§7.4).
- **Croix des révélations (2.7a à 3.3e)** :
  - elle ferme la révélation (E3, §7.18 [renvoi]) ;
  - sauf aux jours 4 et 8 et à la clôture, où elle affiche « Pas dans l'essai. ». Ces jours-là, la révélation se lit jusqu'à 2.7f, qui mène au saut (§7.4) ou à la suite de la clôture.
- **Son propre visage dans Le Cercle** : il ouvre Moi › Portrait (E3).
- **Liens vers un écran absent** : toucher affiche « Pas dans l'essai. » dans la bande. Concernés :
  - « + Inviter » et « Amis ▾ » (4.2) ;
  - « Changer · Créer · Quitter » et l'interrupteur du message de 18h (5.7) ;
  - « Renvoyer le code » (1.9).

### 7.2 L'entrée (jour 1), invitée par Valentin
Le parcours de `simulation.md` §7.2, avec Valentin à la place d'Agathe et D-035 pour le compte. Après « Commencer » (§8.2), le téléphone s'ouvre sur 1.1. La barre affiche « Jour 1 · lundi ». Pendant l'entrée, il n'y a ni « Jour suivant » ni lien pour abandonner la journée : l'entrée porte le consentement et le compte.

- **1.1**, la messagerie (décor, pas un écran du jeu) :
  - en-tête « Valentin » ;
  - bulle « Tu crois me connaître ? J'ai répondu à 3 vraies questions de l'Assemblée. Devine ce que j'ai dit, 2 minutes. » ;
  - aperçu du lien « Elenchos » / « Valentin te lance un défi ».
  - Toucher l'aperçu ouvre 1.2.
- **1.2** :
  - bandeau « Défi de Valentin · Texte 1 sur 3 » ;
  - « Réponds, puis devine ce qu'a dit Valentin. » ;
  - « Un vrai texte de l'Assemblée nationale · auteur masqué » ;
  - le titre, les trois lignes, « Ton avis ? », les cinq positions ;
  - « Suivant ».
- **1.3**, carte de consentement : inchangée. Elle s'ouvre au premier toucher sur une position du texte 1, avant tout enregistrement (D-006).
- **1.4** :
  - « ← Changer ma position » ;
  - le bandeau ;
  - « {titre} · Ton avis : {Position} » ;
  - « Qu'est-ce qui a le plus pesé ? » ;
  - les quatre raisons, puis « Aucune de ces raisons » ;
  - « Ta réponse sera définitive. » ;
  - « Valider ».
- **1.5** :
  - le bandeau ;
  - le visage « Valentin » ;
  - « Et Valentin ? Sa réponse ? » ;
  - le titre, les cinq positions ;
  - « Voir sa réponse », inactif tant qu'aucune position n'est choisie.
- **1.6** :
  - « Texte 1 sur 3 » ;
  - verdict « Ça alors ! » ou « Tu connais ton monde. » (juste = bon côté, D-011) ;
  - « Ton pari : {Position}. » ;
  - la ligne de Valentin : rond V, « Valentin : {Position} », dessous « « {raison} » » ou « aucune des quatre raisons » ;
  - un filet ;
  - « L'Assemblée : texte {adopté | rejeté} le {date}. {étape} » (§7.10) ;
  - « Proposé par … » (§7.11) ;
  - « Ta raison, « … », était l'argument de … » (absente si la raison est « aucune ») ;
  - bouton « Texte suivant » après les textes 1 et 2, « Suivant » après le texte 3.
- **1.7** :
  - « 2 sur 3 » et « Tu as trouvé 2 réponses de Valentin sur 3. » (ou 3) ;
  - à 0 ou 1 sur 3 : « Valentin a réussi à te surprendre trois fois. » (ou « deux fois. »), à la place des deux ;
  - un filet, « Ton portrait commence », les trois curseurs des tensions des textes d'entrée dans leur ordre, « Chaque réponse les précise. » ;
  - « Créer mon compte ».
  - Pas de barre en 1.7 : sa place dans le produit se fixe à l'étape 6, et la Direction artistique ne la met que dans Moi.
  - Note du portrait accéléré dans la bande (§7.15).
- **1.8, le compte (D-035)**, de haut en bas :
  ```
  Pour que Valentin sache que c'était toi,
  et retrouver tes réponses demain.

  Pseudo   [                        ]

  [        Continuer avec Apple        ]
  [        Continuer avec Google       ]
  [    Recevoir un code par e-mail     ]
  ```
  - **Le texte.** La phrase validée perd sa fin « : un pseudo, ton e-mail. », devenue fausse. L'étiquette du champ reste « Pseudo » (mot validé), jamais pré-rempli. C'est le seul champ actif, sans saisie automatique du navigateur.
  - **Les trois boutons** (convention d'essai) : dans cet ordre (sur iPhone et iPad, Apple d'abord), de même taille et de même poids, aucun mis en avant.
    - Pour l'essai, je recommande les mots seuls, sans logo ni couleur de marque. Raison : Juridique veut l'e-mail « aussi visible que les deux boutons », et une page d'essai n'a pas à reproduire les marques d'Apple ou de Google. Forme : Direction artistique. [Assembleur : forme pas encore donnée ; Front-end la demande avant le lot 1 (« Lots et délai ») et, à défaut, prévoit des boutons en texte seul (§8.8).] Dans le produit, ce sont les règles de marque qui s'appliqueront (étape 6), avec les six règles de Juridique de D-035, dont une mention « compte personnel » avant le toucher de Google.
  - **Inactivité.** Les trois boutons restent inactifs tant que le pseudo est vide ou refusé (§7.19).
  - **Note de la bande, tant que 1.8 ou 1.8b est affiché** : « Compte simulé : choisissez un pseudo, puis l'un des trois boutons. Rien ne se connecte et rien n'est envoyé, ni à Apple, ni à Google, ni par e-mail. Le pseudo reste dans votre {appareil}. »
  - **« Continuer avec Apple »** mène tout droit au premier Aujourd'hui (fin de cette section). La bande montre alors, jusqu'au toucher suivant : « Dans le jeu, Apple vous demanderait ici de partager votre adresse e-mail ou de la masquer, puis de confirmer avec Face ID, Touch ID ou votre code. Dans l'essai, rien ne s'est connecté. »
  - **« Continuer avec Google »** : de même, avec la note « Dans le jeu, Google vous demanderait ici de choisir votre compte ; seul un compte personnel serait accepté, pas celui d'un employeur ou d'une école. Dans l'essai, rien ne s'est connecté. »
  - **« Recevoir un code par e-mail »** ouvre 1.8b.
- **1.8b, l'e-mail** (dessin d'essai ; dans le produit, l'étape 6 redessine 1.8) :
  - « ← Retour », qui ramène à 1.8 avec le pseudo gardé ;
  - le champ « E-mail », dessiné et non saisissable, qui affiche « toi@exemple.fr » ;
  - « Tu recevras un code à six chiffres. » ;
  - « Recevoir mon code », vers 1.9.
  - Pourquoi un écran de plus : la voie e-mail coûte une saisie et un code. Le porteur doit le voir pour juger D-035.
- **1.9** : comme au premier essai.
  - « Code envoyé à toi@exemple.fr », cases dessinées et remplies ;
  - « Renvoyer le code » (affiche « Pas dans l'essai. ») ;
  - « Plus tard », même effet que « Valider » ;
  - « Valider ».
- **Le premier Aujourd'hui** (Apple, Google, « Valider » ou « Plus tard ») :
  - en-tête « Aujourd'hui · lundi », barre d'étapes « Deviner ● · Répondre ○ » ;
  - bandeau « Tu as rejoint Amis. », une seule fois ;
  - puis l'écran 2.1 sur T0 : « Amis » ; « Hier : {titre} · Relire » ; « À qui sont ces réponses ? » ; la ligne de règle (§7.12) ; les cartes.
  - La barre des trois onglets apparaît. Ensuite, Répondre T1, puis 2.5.
  - Aucune aide n'est ajoutée (D-023). Le porteur n'a jamais lu T0 : « Relire » est à l'écran, et le carnet compte ses touchers.
  - Je retire la note « Ce texte d'hier, vous ne l'avez pas lu… » de ma version de travail : elle aiderait le nouveau venu, ce que D-023 écarte. Le cas est noté pour l'étape 6 (limites).

### 7.3 Les jours joués (1, 2, 3, 7, 14)
- **Ouverture.** Les jours 2, 3, 7 et 14 s'ouvrent sur le message de 18h (§7.17). Le jour 1 s'ouvre sur l'entrée.
- **La journée.** Révélation, Deviner, Répondre, 2.5 « En attendant » : comme au premier essai.
- **Compte à rebours.** 2.5 affiche toujours « Révélation dans … » : le lendemain d'un jour joué, il y a toujours des cartes à révéler, ou la clôture.
- **2.5** ne change pas (D-022) : pas de barre (§7.15).

### 7.4 Les jours de saut, côté téléphone (jours 4 et 8)
- **Ouverture.** Le jour s'ouvre sur 2.6, première forme (« 18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. »). Puis la révélation des cartes de la veille, de 2.7a à 2.7f. La croix affiche « Pas dans l'essai. ». Si des abandons ont laissé la révélation sans cartes, elle commence au vote (2.7d), et 2.7f mène au saut comme d'ordinaire ; si elle n'a rien à montrer (troisième forme du message, après un abandon avant la réponse et un autre avant Deviner), le toucher du message ouvre directement la page du saut, et la bande affiche « Avancer au dimanche ».
- **2.7f**, « Et maintenant, la question d'aujourd'hui. » : son bouton « Jouer » ouvre la page du saut (§8.1 ter [renvoi]). Au même moment, la bande affiche « Avancer au dimanche », qui ouvre la même page.
  - Aucune manche ne s'ouvre ces jours-là : T3, T4, T5, puis T7 à T12, n'ont pas de cartes (R10).
  - « Le texte et ses sources » fonctionne normalement.
- **Le rattrapage**, une fois le saut confirmé : un texte par jour sauté, dans l'ordre des jours.
  - **Position.** L'écran Répondre a la forme de 1.12 sans ses deux bandeaux :
    - en-tête « Aujourd'hui · {jeudi} » ;
    - barre d'étapes « Deviner ○ · Répondre ● » ;
    - « Un vrai texte de l'Assemblée nationale · auteur masqué » ;
    - le titre, les trois lignes, « Ton avis ? », les positions ;
    - « Suivant ».
  - **Raison.** Puis 2.4, la raison, inchangée (« Ta réponse sera définitive. », « Valider »).
  - **Après « Valider », 2.5 réduit** (convention d'essai) :
    - « Aujourd'hui · {jeudi} » ;
    - l'encadré « Ta phrase du jour », avec sa phrase (règle 18) et « Voir mon portrait » ;
    - rien d'autre : ni compte à rebours, ni « Déjà joué aujourd'hui ». Le jour passe d'un coup ; une heure n'y voudrait rien dire.
  - **Pas de barre** dans ces écrans (§7.15).
  - Le porteur ne peut pas laisser un texte sans réponse : comme à l'entrée, le repère « texte k sur n » appelle une réponse. Pour en sortir : « Arrêter l'essai ».
  - Les onglets restent actifs : Le Cercle et Moi montrent l'état du jour du texte affiché.
- **Après le dernier texte** : « Aller au dimanche » (bande, §8.1 ter [renvoi]) ouvre 3.1, l'écran verrouillé du dimanche.

### 7.5 Les dimanches (jours 7 et 14) et la clôture
- **Message.** 3.1, deuxième forme, avec l'ajout du dimanche : « 18h. Le vote de l'Assemblée t'attend, et la question d'aujourd'hui. Ce soir, aussi : les titres de la semaine. »
  - L'ajout n'apparaît que si au moins un titre a un titulaire (R6).
  - Toucher ouvre 2.7d : la révélation commence au vote, puisque la manche de la veille n'a jamais été ouverte.
- **Ordre.** 2.7d (vote et avis du cercle), 2.7e, 3.2 s'il y a un badge, 3.3a à 3.3d, 3.3e, 2.7f, « Jouer » (Deviner T6 ou T13), Répondre, 2.5.
- **Clôture** (reprendre le §7.4 de `simulation.md`, sans ses points 2 et 5 [renvoi : version de travail d'UX], avec ces mots) :
  1. La révélation de T13, avec ses cartes, de 2.7a à 2.7e, sans 2.7f ; au vote, depuis 2.7d, si la manche de T13 n'a jamais été ouverte (R10, après un abandon au jour 14). La croix affiche « Pas dans l'essai. ». Le pied de la dernière carte dit seulement « {n} point(s) aujourd'hui ». L'avis du cercle s'affiche.
  2. La fiche de T14 (5.4, après révélation). Dans la bande : « Le texte de dimanche ne sera pas deviné : l'essai s'arrête avant. Voici quand même son vote et ses auteurs. », avec « Continuer ».
  3. Puis le cadre (§8.5 [renvoi]).
  - Pas de message de 18h à la clôture.

### 7.6 à 7.9 Deviner, élision, typographie
- **§7.6 Deviner, « Déjà joué aujourd'hui », compte à rebours** : reprendre le texte de la version de travail d'UX, recopié ci-dessous mot pour mot.
- **§7.7 Élision et accords** : reprendre le texte de la version de travail d'UX, recopié ci-dessous, avec en plus :
  - « Défi de Valentin », « réponses de Valentin », « Pour que Valentin sache… » : sans élision ;
  - Agathe et Odile gardent l'élision.
- **§7.8 Typographie** : inchangée. Elle s'applique aux textes nouveaux.
- **§7.9** : réservé à l'écran d'un proche, traité au §7.16.

**Texte repris pour le §7.6 (UX, version de travail, mot pour mot)**

Rien ne change, sauf le libellé du compte à rebours dans 2.5 (E1 ; `produit.md` §5) :
- « Révélation dans … » si la révélation suivante contiendra quelque chose : au moins une carte de la manche du jour, ou le vote d'un texte auquel le porteur a répondu ;
- sinon « Nouveau texte dans … ».

Le calcul est celui de la simulation 1.

**Texte repris pour le §7.7 (UX, version de travail, mot pour mot)**

Rien ne change. Accords nouveaux (§8.1 bis [renvoi]) :
- « Votre carte comptera » / « Vos deux cartes compteront » ;
- « la carte sans visage comptera » / « les deux cartes sans visage compteront ».

### 7.10 Le vote de l'Assemblée (E4)
Reprendre le texte de la version de travail d'UX, recopié ci-dessous mot pour mot, avec la ligne 1.6, désormais servie : « L'Assemblée : texte {adopté | rejeté} le {date}. {objet} {étape-texte} ».

**Texte repris (UX, version de travail, mot pour mot)**

Le §7.9 de la simulation 1 vaut pour un texte entier. Ce qui s'ajoute :
- **Nouveau champ `vote.objet`** (Back-end ; faits relevés par Contenu) : `texte`, `article`, `amendement` ou `motion`.
- **Gros titre** : il ne change pas, « Texte adopté. » ou « Texte rejeté. » (D-014). Contenu le recommande : « Amendement rejeté. » toucherait D-014.
- **{objet}** :
  - `texte` : rien ;
  - `article` : « C'était un article d'un texte plus long. » ;
  - `amendement` : « C'était un amendement, une modification d'un texte en discussion. »
- **{étape-texte}**, pour un article ou un amendement :
  - `navette` : « Le Sénat devait encore voter ce texte. » ;
  - `aucune` : rien.

| Où | `texte` | `article` ou `amendement` | `motion` de rejet adoptée |
|---|---|---|---|
| 2.7d | « Le {date}. {étape} » (inchangé) | « Le {date}. {objet} {étape-texte} » | « Texte rejeté. », puis « Le {date}, avant même l'examen de ses articles. » |
| 5.4 | « Vote : adopté le {date}. {étape} » | « Vote : adopté le {date}. {objet} {étape-texte} » (ou « rejeté ») | « Vote : rejeté le {date}, avant même l'examen de ses articles. » |
| 1.6 | inchangé | « L'Assemblée : texte adopté le {date}. {objet} {étape-texte} » | « L'Assemblée : texte rejeté le {date}, avant même l'examen de ses articles. » |

*[Assembleur : la marque [durée] de la ligne 1.6 est retirée : l'entrée revient, la ligne est servie.]*

- **Combinaisons permises** (Back-end les contrôle) :
  - article ou amendement adopté : `navette` ou `aucune` ;
  - article ou amendement rejeté : `aucune` seulement ;
  - jamais `definitif` : si aucune case n'est exacte, Contenu met le texte en réserve. (arbitrage de l'orchestrateur : jamais `definitif`, position plus prudente pour une première version ; Contenu en tient compte au relevé ; positions : UX, jamais `definitif`, le texte va en réserve ; Contenu, `navette` ou `definitif`.)
  - `navette` veut dire : après ce vote, le Sénat devait encore se prononcer sur le texte qui contient cet article ou cet amendement.
- **Motion** : celle qui est adoptée par les partisans du texte, pour un motif de procédure, n'est pas servie comme un rejet (D-028, Contenu).
- **Règles inchangées** : jamais avant 18h, jamais de décompte des voix (E4 renvoie les voix à l'étape 6).
- **Exemple** (inventé) : « Texte rejeté. » / « Le 13 février 2025. C'était un amendement, une modification d'un texte en discussion. »

### 7.11 Auteurs et groupes (E5)
Reprendre le texte de la version de travail d'UX, recopié ci-dessous mot pour mot. Le gabarit « {mandat} du groupe {groupe} » n'est pas retenu pour l'essai (Cohérence) : aucune décision ne le porte, et E5 (D-030) n'a changé que le nom du groupe, pas le gabarit validé de 1.6, 2.7e et 5.4 (D-014). L'essai garde la virgule validée : « {nom}, {mandat}, {groupe} » (en 5.4, « {nom}, {groupe} » pour un député). La lisibilité des noms de groupes en plusieurs mots, relevée par UX, est un constat pour l'étape 6.

**Texte repris (UX, version de travail, mot pour mot)**

Ces points remplacent « Groupe » et « D'un seul tenant » du §7.10 de la simulation 1. La règle du moment (le dépôt du texte ; la séance d'où vient l'extrait) ne change pas.

- **Groupe.** Son nom officiel en toutes lettres, avec la casse de l'institution, pris dans la liste fermée de Contenu.
  - Exemples : « Les Démocrates », « Écologiste et Social ».
  - Jamais de sigle dans l'essai : une seule écriture par groupe, et les listes passent à la ligne (simulation 1, §8.1). (arbitrage de l'orchestrateur : jamais de sigle dans l'essai, groupes en toutes lettres (E5) ; positions : UX, jamais de sigle ; Contenu, le sigle officiel là où la place manque.)
- **Gabarit** (proposition d'UX, qui touche les gabarits validés de 1.6, 2.7e et 5.4, D-014) :
  - « Proposé par {nom}, {mandat} du groupe {groupe}. »
  - « Ta raison, « … », était l'argument de {nom}, {mandat} du groupe {groupe}. »
  - En 5.4, le même gabarit, mandat compris. Exemple inventé : « Proposé par Karim Benali, député du groupe Les Démocrates. »
  - Pourquoi : écrits en toutes lettres après une virgule, plusieurs noms se lisent comme des adjectifs (« députée, Écologiste et Social ») ; et l'un d'eux contient lui-même des virgules (« Libertés, Indépendants, Outre-mer et Territoires »).
  - Si la virgule validée est gardée : « {nom}, {mandat}, {groupe} » (en 5.4, « {nom}, {groupe} » pour un député). Rien d'autre ne change.
- **Député non inscrit** : « {nom}, {député | députée} sans groupe ».
- **Amendement de commission** : « Proposé par la {commission}. » {commission} est le libellé court, avec une minuscule au début, tiré de la liste de Contenu (par exemple « commission des affaires sociales »).
- **Gouvernement** : « Proposé par le Gouvernement. » (inchangé).
- **5.4, liste des raisons** : à droite, le nom, puis à la ligne le groupe (ou « sans groupe »), sans virgule.
- **Coupure** :
  - un nom de groupe passe à la ligne à ses espaces, jamais à un trait d'union ;
  - une ligne ne commence jamais par « - » (cas de « La France insoumise - Nouveau Front Populaire ») ;
  - le moyen revient à Front-end.

### 7.12 La ligne de règle de Deviner (D-024)
- Reprendre le texte de la version de travail d'UX, recopié ci-dessous : « Un proche par réponse, chacun une fois. Si deux ont donné la même, l'un ou l'autre est juste. »
- Forme : Direction artistique, §7.23 A [renvoi].

**Texte repris (UX, version de travail, mot pour mot)**

- **Texte** : « Un proche par réponse, chacun une fois. Si deux ont donné la même, l'un ou l'autre est juste. » (`produit.md` §5).
- **Place** : en 2.1, juste sous « À qui sont ces réponses ? », avant la première carte. Elle s'affiche chaque jour où 2.1 montre au moins une carte, mais pas en 5.12.
- **Forme** : texte secondaire. La forme d'essai revient à la Direction artistique. Le lecteur d'écran la lit juste après la question.
- Rien d'autre ne change en 2.1 (D-022).

### 7.13 Le proche qui avait répondu la même chose (D-024)
Reprendre le texte de la version de travail d'UX, recopié ci-dessous mot pour mot (« C'était {Y}. {X} avait répondu la même chose. »).

**Texte repris (UX, version de travail, mot pour mot)**

**Le cas.** Sur une carte, le porteur a désigné X. X n'est pas l'auteur de la carte (après la redistribution des cartes identiques servies ensemble, R4, Game design), mais il avait donné exactement la même réponse. C'est compté juste.

**La carte retournée, de haut en bas :**
- la ligne de la carte et « Ton pari : {X}. », inchangées ;
- le visage de l'auteur Y, jamais celui de X : le visage dit toujours qui a écrit la carte ;
- en gros, le verdict validé : « Tu connais ton monde. », ou « Tu connais ton monde, et ses raisons. » si la raison cachée est trouvée ;
- dessous : « C'était {Y}. {X} avait répondu la même chose. » ;
- sur la carte à raison cachée, « Sa raison : « … » » en dernière ligne (R5), sauf si la raison est trouvée ;
- sur la dernière carte, le filet et les points, inchangés.

**Exemple** (inventé) : « Défavorable · « Ça coûte trop cher. » » / « Ton pari : Valentin. » / rond N / **Tu connais ton monde.** / « C'était Nassim. Valentin avait répondu la même chose. »

La place de ces lignes est réservée avant le retournement, comme au §7.1 de la simulation 1. Le lecteur d'écran lit le verdict, puis cette ligne.

### 7.14 L'avis du cercle (D-025)
Reprendre le texte de la version de travail d'UX (recopié plus bas), avec trois changements qui l'alignent sur la forme de la Direction artistique (§7.23 B [renvoi], l'escalier).
- **Graphique.** La forme est l'escalier de la Direction artistique : je retire ma recommandation d'un pavé par réponse. Son argument l'emporte : un séparateur par réponse fait compter les personnes, et l'on chercherait qui est qui (§9).
- **Légende**, centrée sous le fil (24 signes au plus) : « Milieu des réponses ». Elle remplace « Le repère montre où le cercle se coupe en deux. », trop long pour la place. Pas d'étiquette dans la boîte : la ligne « Ton cercle, lui, … » en tient lieu.
- **Lecteur d'écran**, sans chiffre (règle 2 de la Direction artistique) :
  - la ligne, puis « Réponses du cercle, de très défavorable à très favorable : très défavorable, {part} ; défavorable, {part} ; neutre, {part} ; favorable, {part} ; très favorable, {part}. Milieu des réponses : {position}. » ;
  - {part} vaut « aucune » (0), « peu » (moins d'un quart), « une partie » (d'un quart à moins de la moitié), « la moitié », « la plupart » (plus de la moitié, pas toutes) ou « toutes » ;
  - avec deux mentions du milieu : « Milieu des réponses : entre {a} et {b}. ».
  - Cette lecture est moins précise que l'image (voir les limites).
- Le reste ne change pas : le seuil de trois réponses ; rien en dessous ; jamais en 5.4, 3.3d ou Le Cercle ; la réponse du porteur jamais marquée ; jamais rien dans le carnet.

**Texte repris (UX, version de travail), sans les passages que les trois changements remplacent**

- **Où.** En 2.7d, après un filet, sous la ligne datée du vote, chaque fois que la révélation montre le vote, clôture comprise.
  - Jamais ailleurs : ni en 5.4, ni en 3.3d, ni dans Le Cercle. C'est une lecture d'UX de D-025, listée parmi ce qui reste à régler dans `produit.md`.
- **Réponses comptées.** Celles des membres au texte révélé, le porteur compris s'il y a répondu.
- **Seuil** (convention d'essai, D-032) : au moins trois réponses.
  - En dessous : ni ligne, ni graphique, ni phrase de remplacement. La carte reste celle du premier essai (même principe que « Déjà joué aujourd'hui », E10).
- **La ligne** (mots de D-025) : « Ton cercle, lui, l'aurait adopté. » / « Ton cercle, lui, l'aurait rejeté. » / « Ton cercle, lui, était partagé. ». Le choix de la ligne suit la règle de Game design.
- **Ce que le graphique doit dire.** La forme revient à la Direction artistique.
  - Les cinq positions, avec leurs libellés validés, dans l'ordre de Répondre : de « Très défavorable » à « Très favorable ». Toutes sont affichées, même vides.
  - Pour chaque position, la part du cercle qui l'a donnée : une longueur, sans chiffre ni pourcentage. [Assembleur : la recommandation d'un pavé par réponse est retirée par le changement « Graphique » ci-dessus.]
  - Un repère marque la mention du milieu. Avec un nombre pair de réponses, si les deux mentions du milieu diffèrent, les deux sont marquées (à confirmer par Game design, qui fixe la règle de la ligne). [Assembleur : confirmé par le calcul de Game design ci-dessous (« On marque les deux réponses centrales »).]
  - [Assembleur : la ligne « Dessous : … » est remplacée par le changement « Légende » ci-dessus.]
  - Jamais : un prénom, un visage, une couleur par position (D-012), un total écrit, ni la réponse du porteur marquée (lecture d'UX : le « jamais » de 2.7a tient).
- **Affichage.** La carte s'affiche d'un bloc, sans carte fermée.
  - La ligne de l'avis se voit sans défiler, sur tout iPhone.
  - Sur le plus petit écran, le graphique peut demander de défiler (à mesurer au contrôle 14 h).
- [Assembleur : le point « Lecteur d'écran » est remplacé par le changement « Lecteur d'écran » ci-dessus.]
- **Carnet et mesures** : jamais rien de l'avis du cercle (Juridique).

**Le calcul de la ligne (Game design ; inchangé depuis sa version de travail, mot pour mot)**

On range les n réponses au texte révélé, de « Très défavorable » à « Très favorable ».

- **n impair.** La mention du milieu est celle de rang (n + 1)/2. Si elle est du côté favorable, la ligne est « Ton cercle, lui, l'aurait adopté. » ; du côté défavorable, « … rejeté. » ; neutre, « … était partagé. ».
- **n pair.** On marque les deux réponses centrales, ou une seule si elles sont égales. La ligne prend leur côté commun ; s'il n'y en a pas, ou si ce côté est neutre, « était partagé ». Cette règle est symétrique : retenir la médiane inférieure ferait pencher vers le rejet.
- **Sous trois réponses**, ni ligne ni graphique (Juridique).
- La réponse du porteur n'est jamais marquée sur le graphique (lecture d'UX de la maquette 2.7a).
- Les personnages automatiques ne se servent pas de l'avis du cercle.
- **Objection d'UX** : un cercle unanimement neutre serait dit « partagé ». Ce cas ne peut pas se produire avec ces personnages (pourquoi : fichier caché). Le rapport de scellement le vérifie. Pour le produit, la question reste ouverte.

### 7.15 Le portrait accéléré, à l'écran (D-033, D-026)
- **Ce qui change pour le porteur.** Ses curseurs se resserrent plus vite (calcul de Game design : poids triples). Un ou deux peuvent devenir nets pendant l'essai. Les mots validés ne changent pas.
- **Moi › Portrait, sans curseur net : 5.11**, de haut en bas :
  - l'encadré de la barre ;
  - les huit curseurs (les quatre tensions écartées restent floues et immobiles) ;
  - la phrase validée « Chaque réponse le précise. Il faut environ trois mois pour les premiers curseurs nets. ». Elle reste vraie pour le jeu : la note de la bande dit l'écart de l'essai.
- **Moi › Portrait, dès qu'un curseur est net : 4.1**, de haut en bas :
  - l'en-tête « Moi », la roue dentée, les sous-onglets ;
  - l'encadré de la barre ;
  - les curseurs nets (un point), dans l'ordre du §5.3 de Game design (du plus éloigné de 1/2 au plus proche, puis du plus grand Σ), sans intitulé, comme sur la maquette ;
  - l'intitulé « Encore flous », puis les curseurs flous, du plus étroit au plus large, puis les quatre tensions écartées.
  - Pas d'encadré « Ton tempérament » : le porteur n'en a aucun. Pas de phrase en bas (maquette 4.1).
- **La barre** (forme : Direction artistique, §7.23 C [renvoi]).
  - **Place.** Dans Moi › Portrait seulement : en tête de 5.11, puis de 4.1.
    - Je retire sa place en 2.5, proposée dans ma version de travail. La Direction artistique a raison : D-022 garde 2.5 tel quel, et l'annexe de `produit.md` ne la place qu'en 1.7, 4.1 et 5.11.
  - **Étiquette de l'encadré** : « Vers tes premiers curseurs nets ». Aucune autre ligne.
  - **Longueur.** n/N, où n compte toutes les réponses du porteur, entrée comprise. N vaut 16 (Game design).
    - **Proposition d'UX, à confirmer par Game design** : la barre est aussi pleine dès qu'un curseur est net, même avant 16 réponses. Sinon, l'écran montrerait « pas encore » au-dessus d'un curseur net, alors que D-026 définit la barre comme le chemin « jusqu'aux premiers curseurs nets ». [Assembleur : confirmé par Game design, §5.8.]
  - **Pleine, sans texte (D-033).** Une fois pleine, elle le reste. L'étiquette ne change pas, rien ne s'ajoute dans le téléphone, pas de mouvement de fin.
    - Je lis « sans texte » comme « sans message au bout » : l'étiquette est le nom de la barre, pas un message. Confirmé par Cohérence (§5.8).
  - **Lecteur d'écran** : « Barre du portrait, vers tes premiers curseurs nets : {valeur}. ». {valeur} vaut « pas encore commencée », « moins d'un quart du chemin », « un quart du chemin », « la moitié du chemin », « trois quarts du chemin » (arrondi au quart inférieur), puis « pleine ».
- **3.3e**, la phrase de la semaine.
  - Si une tension est nette quand la phrase est calculée (moment de lecture : Game design, §5.7 [renvoi]), c'est la phrase validée : « Entre {…} et {…}, tu choisis le plus souvent {…}. ». Son curseur net s'affiche dessous, avec l'intitulé validé « Pour toi, cette semaine ».
  - Sinon, les phrases de la règle 18 (R2).
- **Le signalement**, en deux endroits :
  1. **la page d'arrivée** (§8.2, page C) ;
  2. **une note durable dans la bande** : « Dans l'essai, votre portrait avance environ six fois plus vite que dans le jeu. »
     - « six » suit le facteur (§5.9) : « quatre » pour 2, « huit » pour 4.
     - Elle s'affiche chaque fois que le téléphone montre un curseur du porteur : 1.7 ; 3.3e (sauf la phrase sans curseur) ; 5.11 et 4.1 ; 4.3 ; et 4.2 quand son rond est posé sur au moins une barre.
     - Une note passagère peut la cacher ; elle revient ensuite (règle de la bande, §8.1 de `simulation.md`).
- **La barre pleine, dans le cadre**, une seule fois : la première fois que Moi › Portrait montre la barre pleine, la bande affiche jusqu'au toucher suivant « Votre barre est pleine. Ce qu'elle annoncera au bout, dans le jeu, n'est pas encore décidé : ici, elle reste pleine. »
  - Le téléphone reste sans texte (D-033). C'est le cadre qui le dit au moment où la question se pose, pour que le porteur ne prenne pas ce silence pour un défaut de la page.

### 7.16 Un cercle de trois mois : les écrans jamais vus au premier essai
Ces mots sont ceux des maquettes, dans un cas qu'elles ne dessinaient pas. Aucun ne s'explique au nouveau venu (D-023).

- **Le Cercle (4.2), les visages.** Agathe, Nassim, Odile, Valentin, puis le porteur, arrivé le dernier. Sous chaque visage, un titre par ligne, dans cet ordre :
  - **les titres de la dernière semaine** : « Le Sans-Faute » (R7, la semaine qui suit son annonce), « Le Devin », « Le Mystère », « Le Fidèle ». Avant le premier dimanche, ce sont les titres de la dernière semaine avant l'arrivée ;
  - **puis les tempéraments de ce cercle** (R9) : « L'Original », « Le Pont », « Le Mesuré », « Le Tranché », sans nom de cercle sous un visage.
  - Rien sous le visage du porteur tant qu'il n'a pas de titre. Il n'a jamais de tempérament dans l'essai.
- **L'encadré « Surprise de la semaine »** : « Surprise de la semaine : {titre} », le label en gras. Avant le premier dimanche, {titre} est celui du texte d'avant l'arrivée (Game design, §1 [renvoi]).
  - L'encadré n'ouvre rien, comme sur la maquette 4.2. La fiche légère de ce texte n'est donc jamais affichée.
- **« Où chacun se place »** : huit barres, dans l'ordre fixe.
  - Sur chaque barre, le rond de chaque membre dont le curseur est net, à sa place (initiale en Alegreya italique gras ; deux lettres pour le porteur si E7 le demande).
  - Dessous, « Encore flou : {prénoms, dans l'ordre des membres} », seulement s'il reste au moins un membre flou.
  - Si deux ronds se chevauchent, chacun reste lisible et leur ordre de gauche à droite est gardé. Le moyen revient à la Direction artistique et à Front-end. [Assembleur : pas encore écrit.]
  - Lecteur d'écran, une phrase par barre : « Entre {sécurité} et {liberté}. Nets : {Agathe}, vers {la liberté} ; {Nassim}, au milieu. Encore flous : {Odile, Valentin, pseudo}. »
    - « vers {pôle 0} » si le centre est sous 0,4, « au milieu » de 0,4 à 0,6, « vers {pôle 1} » au-dessus. Les libellés des pôles sont ceux du §5.5.
    - Une partie absente est omise.
- **« Titres des semaines passées → » (5.5).** Une ligne par semaine, la plus récente en haut : « Semaine {n} » · « Sans-Faute : {A} · Devin : {B} · Mystère : {C} · Fidèle : {D, E} ».
  - Un titre sans titulaire est omis de sa ligne.
  - n compte les semaines depuis la première du cercle : 1 à 13 avant l'arrivée, puis 14 et 15. L'essai n'a pas de dates ; « Semaine 14 » dit au nouveau venu que le cercle existait avant lui.
  - Les mêmes numéros servent en 5.2.
- **L'écran d'un proche (4.3), avec un portrait net.**
  - « ← Le Cercle » ; le visage ; « {Titre} cette semaine » s'il en a un (sinon rien) ; « ● Toi   ◎ {Prénom} ».
  - Les huit superpositions : d'abord les tensions où vous êtes nets tous les deux, puis les autres, chaque groupe dans l'ordre fixe (note de la maquette 4.3). Un curseur net est un point, un curseur flou une zone.
  - Puis « Ses surprises », comme au §7.7 de `simulation.md` (un jumeau désigné n'en est pas une, D-024).
  - Lecteur d'écran, par tension : « {Tension} : toi, {vers … | au milieu | encore flou} ; {Prénom}, {vers … | au milieu | encore flou}. »
  - Note du portrait accéléré dans la bande.

### 7.17 Le message de 18h (E1)
- Reprendre le texte de la version de travail d'UX, recopié ci-dessous (trois formes et ajout du dimanche).
- Formes servies dans l'essai :
  - **première forme** : jours 2, 3, 4 et 8 ;
  - **deuxième forme, avec l'ajout du dimanche** : jours 7 et 14 ;
  - **troisième forme** : servie seulement après un abandon, par la règle générale d'E1 (§0, « Le message de 18h ») ; aux jours 4 et 8, son toucher ouvre la page du saut (§7.4) ; (arbitrage de l'orchestrateur : position de Game design ; positions : UX, « jamais servie » ; Game design, la règle générale d'E1 s'applique après un abandon.)
  - le jour 1 s'ouvre sur 1.1 ; la clôture, sur la révélation, sans message.

**Texte repris (UX, version de travail, mot pour mot)**

Chaque jour, sauf à la clôture, s'ouvre sur 2.6 (le jour seul, comme au premier essai). [Assembleur : dans le second essai, les jours qui s'ouvrent sur 2.6 sont ceux de la liste ci-dessus et du §0.] La forme dépend de ce que contient la révélation, selon la règle 10, E1 et R10 (Game design) :
1. **au moins une carte** : « 18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. » Le toucher ouvre 2.7a.
2. **pas de carte, mais le vote d'un texte auquel le porteur a répondu** : « 18h. Le vote de l'Assemblée t'attend, et la question d'aujourd'hui. » Le toucher ouvre 2.7d (la révélation commence au vote).
3. **sinon** : « 18h. La question d'aujourd'hui t'attend. » Le toucher ouvre Aujourd'hui.

Le dimanche, si au moins un titre a un titulaire (R6), « Ce soir, aussi : les titres de la semaine. » s'ajoute à la fin (3.1).

### 7.18 Rouvrir la révélation ; son propre visage (E3)
Reprendre le texte de la version de travail d'UX, recopié ci-dessous, avec une exception : aux jours 4 et 8 et à la clôture, la croix affiche « Pas dans l'essai. » (§7.1).

**Texte repris (UX, version de travail, mot pour mot)**

- **La croix** ferme la révélation et mène à Aujourd'hui, à l'étape du jour.
- **Pour la rouvrir**, jusqu'au passage au jour suivant (qui tient lieu du 18h suivant), une ligne en haut d'Aujourd'hui :
  - « Reprendre la révélation », si sa dernière carte n'a pas été affichée : elle rouvre sur la carte quittée ;
  - « Revoir la révélation », si elle a été lue jusqu'au bout : elle rouvre sur sa première carte. C'est une précision d'UX sur E3.
  - Les cartes déjà retournées s'affichent retournées, sans mouvement.
- **Place de la ligne** : sous l'en-tête de 2.1, 2.5 et 5.12, et en tête de 2.3 ; pas en 2.4 ni sur une feuille.
  - Elle fait au moins 44 px de haut et porte « › ».
  - Pas de ligne un jour sans révélation.
- **Son propre visage dans Le Cercle** : il ouvre Moi › Portrait.

### 7.19 Pseudo et rond (E7)
- Reprendre le texte de la version de travail d'UX, recopié ci-dessous, avec deux changements :
  - le pseudo se tape en 1.8 ;
  - les deux messages de refus s'affichent dans la bande, à la place de la note du compte simulé, tant que le pseudo est refusé : « Ce pseudo ressemble trop au prénom d'un personnage : choisissez-en un autre. » et « Ce pseudo donnerait le même rond qu'un personnage : ajoutez une lettre. ».
- Le pseudo s'affiche partout où les maquettes mettent « Marie ». Il n'entre jamais dans le carnet.

**Texte repris (UX, version de travail, mot pour mot)**

- **Où il se tape** : [Assembleur : remplacé par le premier changement ci-dessus : en 1.8.] Mise en forme et longueur : comme au §7.2 de la simulation 1.
- **Refus.** Le pseudo est refusé s'il est égal à un prénom de personnage une fois les deux ramenés à la même forme :
  - sans majuscules (correspondance par défaut d'Unicode) ;
  - sans accents (décomposition NFD, signes retirés) ;
  - en ramenant à la lettre imitée les lettres d'autres alphabets qui imitent les nôtres (squelette des confusables d'Unicode, UTS #39 ; moyen : Front-end).
  - Message : « Ce pseudo ressemble trop au prénom d'un personnage : choisissez-en un autre. »
- **Rond.** Le premier caractère, en capitale s'il en a une.
  - Si ce caractère, ramené à la même forme, est l'initiale d'un personnage (A, N, O, V), le rond porte deux caractères : le premier, puis le suivant qui n'est pas une espace, tel qu'il a été tapé (« Antoine » donne « An »).
  - Un pseudo d'un seul caractère dans ce cas est refusé : « Ce pseudo donnerait le même rond qu'un personnage : ajoutez une lettre. »

### 7.20 Le Sans-Faute après son annonce (R7)
Reprendre le texte de la version de travail d'UX, recopié ci-dessous mot pour mot. Il apparaît aussi dans les titres passés de l'histoire du cercle.

**Texte repris (UX, version de travail, mot pour mot)**

Cette section remplace « ne s'affiche qu'en 3.2 et dans le carnet ».
- **3.2** : inchangé.
- **Ensuite, il vit comme un titre :**
  - en 4.2, sur sa propre ligne sous le visage ;
  - en 4.3 : « Le Sans-Faute et Le Fidèle cette semaine » ;
  - en 5.2 : « Le Sans-Faute, Le Fidèle · Amis » ;
  - en 5.5 : « Sans-Faute : {A} · Devin : … » (omis s'il n'a pas de titulaire).
- **Ordre, partout** : Le Sans-Faute, Le Devin, Le Mystère, Le Fidèle. Sans total.

### 7.21 Les raisons nuancées (D-034) : rien ne change à l'écran
- **Mêmes écrans, mêmes mots.** 1.4, 2.4, 2.2 et 5.4 ne changent pas :
  - quatre raisons mêlées dans l'ordre tiré, sans « pour » ni « contre » ;
  - « Aucune de ces raisons » en dernier.
  - « aucune des quatre raisons », « Sa raison : aucune des quatre. », « Ta devinette : aucune des quatre. » restent exacts : il y a toujours quatre raisons.
- **Jamais** d'étiquette « inattendu », de rangement par côté, ni de signe qui distingue l'argument inattendu. Ce serait nommer le lien caché entre raison et valeur (`projet.md` §5).
- **La phrase du jour.** « Aujourd'hui, tu as donné du poids à {a} comme à {b}. » (R1) reviendra plus souvent, quand le porteur prend l'argument inattendu de son côté. Les mots ne changent pas.
- **La condition d'UX de D-034** (un argument inattendu se lit tout de suite du bon côté) se vérifie sur les textes, par l'annotation à l'aveugle de Contenu, pas à l'écran.
- **La règle interne**, un argument inattendu de chaque côté ou aucun, est aussi une règle d'écran : un seul argument inattendu d'un côté se lirait comme un biais. Je la soutiens.
- **Une question de fin** porte sur l'écran des raisons (§8.5 [renvoi], question 5).

### 7.22 Autres règles, à l'écran
- **Sans changement par rapport au premier essai** :
  - R1, R2 (règle 18) ;
  - R5, R6, E2 (libellés du §5.5 de `simulation.md`), E10 ;
  - E8 (rien à l'écran) ; E9, E11 et D-028 (Contenu, rien à l'écran).
- **Désormais vivants** :
  - E6 (« Pour commencer », §7.1) ;
  - la phrase nette du dimanche (§7.15) ;
  - les curseurs nets, les tempéraments, les initiales (§7.16) ;
  - Le Pas de Côté, avec la règle de Game design. Ses mots sont ceux de l'annonce d'un badge rare : « {Prénom} décroche Le Pas de Côté. ». La ligne de dessous est à écrire par Game design, sur le modèle « Sept jours sans erreur, sans rien passer. ». Ce texte n'est dans aucune maquette : il entre dans l'annexe C. [Assembleur : la ligne de dessous n'est pas encore écrite.]
- **R8** : hors de portée (un seul cercle).
- **R9** : appliquée (tempéraments sous les visages, dans ce cercle).
- **R10** : c'est le passage au jour suivant qui ferme la manche.
- **D-027** : écartée de l'essai. **« Valider »** : inchangé (étape 6).

### 7.23 Trois formes nouvelles dans le téléphone (Direction artistique ; mots : UX)

*[Assembleur : §7.11 chez la Direction artistique ; renuméroté ici, le §7.11 d'UX étant pris. Écrit avant D-033 : les passages alignés sur l'arbitrage de l'orchestrateur sont marqués.]*

**Ce qui change par rapport à `simulation.md`, §8.1 (« Ce qui ne change pas »).** Le téléphone reçoit trois ajouts, et seulement ces trois :
- la ligne qui dit la règle de Deviner (2.1) ;
- l'avis du cercle (2.7d) ;
- la barre du portrait (Moi › Portrait, 5.11).

Tout se construit avec ce qui existe déjà dans `style.css` : les variables de couleur, les polices embarquées, la boîte (classe `box`), les filets. Aucune couleur, police, taille de texte ni ombre nouvelle. Les mots sont ceux d'UX (annexe C). Cette section fixe la place, la forme et l'affichage selon les cas. Ce sont des formes d'essai : rien n'est validé pour le produit (D-011, D-014 ; voir la fin de la section).

**Les couleurs, avec leurs noms de La Tablée (D-012)**

| Nom | Variable de la page | Clair | Sombre et soir |
|---|---|---|---|
| Fond : Lin grisé / Brou | `--screen` | #F2EEE8 | #1C1612 |
| Surface des boîtes : Assiette / Noyer | `--fill` | #FFFFFF | #29211B |
| Texte : Brou de noix / Lin | `--ink` | #2A211C | #F2ECE3 |
| Texte secondaire : Étain | `--muted` | #6B5F57 | #B8ACA2 |
| La teinte : Caramel / Miel | `--caramel` | #8A5714 | #E9B45A |
| Filet (le texte à 18 %) | `--line` | rgba(42,33,28,.18) | rgba(242,236,227,.18) |

**Trois règles valables pour les trois formes**
1. Les positions restent dans la couleur du texte. La teinte ne marque que « toi » et le décor (règle 1 de l'univers, retenue par D-012). Elle ne distingue jamais une position d'une autre.
2. Aucun nombre, aucun pourcentage, aucune date. Ni à l'écran, ni dans ce que lit le lecteur d'écran.
3. Un seul mouvement nouveau : la barre qui avance (C). L'avis du cercle ne s'anime pas. Animer une répartition, ce serait mettre en scène le désaccord (`projet.md` §9). D-025 assouplit cette ligne rouge pour le graphique, pas pour sa mise en scène.

#### A. La ligne de règle de Deviner (2.1 ; D-024)

- **Place.** Juste sous « À qui sont ces réponses ? », au-dessus de la première carte.
  - 2 px sous la question : marge haute de −8 px, puisque l'écran espace ses éléments de 10 px.
  - 10 px au-dessus de la première carte.
  - La question et sa règle se lisent comme un seul bloc.
- **Forme.** Celle des consignes déjà validées (« Réponds, puis devine ce qu'a dit Thomas. » en 1.2 ; « Ta réponse sera définitive. » en 2.4) :
  - classe `small` : Alegreya Sans 400, 0,85 rem, interligne 1,45, Étain ;
  - alignée à gauche, lignes équilibrées (`text-wrap: pretty`) ;
  - pas d'italique : il est réservé à « Ta devinette », dans les cartes ;
  - ni gras, ni pictogramme, ni encadré : un encadré la ferait ressembler au bandeau « Rien à deviner aujourd'hui. ».
- **Place des mots.** Trois lignes au plus à 320 px (environ 130 signes) ; deux lignes à 375 px (environ 95 signes).
- **Contraste.** Étain sur Lin grisé : 5,3 : 1. Sur Brou : 8,1 : 1. Le niveau AA est tenu.
- **Quand elle s'affiche.** Seulement si l'écran a au moins une carte. Elle est absente de 5.12. Si UX la limite à certains jours, son absence ne déplace rien d'autre.
- **Lecteur d'écran.** Elle est lue juste après la question. Front-end la relie au groupe des cartes, comme description.
- **Effet connu.** Elle descend les cartes d'environ 40 px. L'écran défile déjà (§8.1).

#### B. L'avis du cercle (2.7d ; D-025)

**Place.** Sur la carte du vote, toujours en palette du soir, 10 px sous la ligne datée du vote (§7.9 de `simulation.md` ; ici §7.10 [renvoi]) : une boîte identique à celle de « Ta phrase du jour ».
- Classe `box` : surface Noyer, double filet de 6 px en Miel en haut, rayon 14 px, ombre de la palette du soir, marge intérieure de 10 px, 8 px entre ses éléments.
- Le vote de l'Assemblée reste en typographie, sur le fond éclairé par la lampe. Tout ce qui parle du cercle va dans la boîte : « eux » dehors, « nous » dedans.
- La boîte est opaque : elle garde aussi les contrastes à l'abri de la lueur de la lampe. Sans elle, un texte en Étain près du centre de la lueur tomberait vers 3,3 : 1.

**Dans la boîte, de haut en bas**
1. *(Facultatif, si UX le veut)* une étiquette, classe `label`.
2. La ligne de l'avis (mots d'UX) :
   - classe `ttl` : Alegreya 700, 1,3 rem, Lin, lignes équilibrées ;
   - deux lignes au plus, soit environ 50 signes ;
   - plus petite que « Texte rejeté. » (1,8 rem) : l'Assemblée d'abord, le cercle ensuite, dans la même police.
3. Le graphique, décrit ci-dessous.
4. *(Facultatif, si UX le veut)* une légende du fil du milieu : sous le graphique, centrée sur le fil, 0,72 rem, Étain, une ligne de 24 signes au plus.

**Le graphique : un escalier de jugement majoritaire.**

Le graphique habituel du jugement majoritaire est une seule barre de 100 %, avec une couleur par mention et une ligne à 50 %. La mention que coupe la ligne est celle du milieu. Ici, il ne marche pas :
- une seule teinte (D-012) interdit les cinq couleurs ;
- cinq libellés ne tiennent pas sous une barre de téléphone.

L'escalier déplie cette barre. Chaque position a sa rangée et son libellé. Chaque morceau garde sa place horizontale dans la barre de 100 %. Le fil à 50 % traverse les cinq rangées.

```
 Très défavorable  ▬▬▬▬······│·········
      Défavorable  ····▬▬▬▬··│·········
           Neutre  ··········│·········
        Favorable  ········▬▬▬▬▬▬▬▬····   ← mention du milieu : libellé en gras
   Très favorable  ··········│·····▬▬▬▬
```

*Exemple : cinq réponses (une très défavorable, une défavorable, deux favorables, une très favorable). Le fil du milieu passe sous la barre « Favorable ».*

- **Rangées.**
  - Toujours cinq, dans l'ordre validé de l'écran Répondre : « Très défavorable » en haut, « Très favorable » en bas.
  - 20 px de haut chacune.
- **Colonne des libellés.**
  - Les cinq libellés validés, en Alegreya Sans 0,85 rem, interligne 20 px, alignés à droite.
  - Jamais coupés, jamais tronqués.
  - Largeur commune : celle du plus large des cinq composé en gras (700), mesurée par la page avec les polices embarquées. Environ 110 px, à mesurer.
- **Zone des barres.**
  - Elle commence 8 px après les libellés. Sa largeur W est le reste.
  - Environ 126 px à 320 px, 181 px à 375 px, 236 px à 430 px, 194 px en planche (iPad).
- **Fil de rangée.**
  - Un filet de 1 px, couleur Filet, sur toute la largeur W, au milieu de chaque rangée.
  - Il relie le libellé à sa barre, même quand elle est loin à droite.
- **Barres.**
  - 10 px de haut, centrées dans la rangée, rayon 2 px, en Lin (la couleur du texte).
  - Notations : T est le nombre de réponses ; c_k est le nombre cumulé de réponses jusqu'à la position k incluse.
  - La barre de la position k va de W·c_{k−1}/T à W·c_k/T.
  - Calcul en fractions exactes (§0). Arrondi au pixel de l'appareil seulement pour dessiner.
  - Chaque frontière est arrondie une seule fois : la fin d'une barre et le début de la suivante tombent sur le même pixel.
  - Position sans réponse : pas de barre.
- **Fil du milieu.**
  - 2 px, en Miel, vertical, à W/2.
  - Il va de 6 px au-dessus de la première rangée à 6 px sous la dernière : 112 px en tout.
  - Il passe au-dessus des fils de rangée et sous les barres. On le voit dans le vide ; il disparaît dans la barre qu'il traverse.
  - Pas de pointillés, pas de « 50 % ».
- **Mention du milieu.**
  - C'est la rangée dont la barre contient W/2, ou les deux rangées dans le cas pair décrit plus bas. Leur libellé passe en gras (700).
  - C'est la même mention que celle dont part la ligne de l'avis. La page ne la recalcule pas pour dessiner : elle lit celle du moteur de la page. Le contrôle vérifie que le fil tombe bien dans sa barre.
- **Couleur des libellés.**
  - Lin, 400, si la position a au moins une réponse.
  - Étain, 400, si elle n'en a aucune.
  - Lin, 700, pour la mention du milieu.
  - Aucune rangée n'a de couleur à elle : ce sont le gras et le fil qui marquent, pas la couleur.
- **Ce qui n'y est jamais.**
  - Un nombre, un pourcentage, un total.
  - Un séparateur par réponse : il ferait compter les personnes.
  - La réponse du joueur, marquée ou distinguée. Le « jamais » de 2.7a tient (lecture d'UX).
  - Plusieurs cercles additionnés. Dans le produit : une boîte par cercle, avec son nom en étiquette.
  - Une animation : le graphique arrive avec la carte, immobile.
- **Contrastes, sur Noyer.** Lin : 13,5 : 1. Étain : 7,1 : 1. Miel : 8,4 : 1. Les fils de rangée (1,7 : 1) sont un décor : ce sont le libellé et la barre qui portent l'information.
- **Hauteur et défilement.**
  - La boîte fait environ 175 px avec la ligne de l'avis sur une ligne, 200 px sur deux lignes.
  - Sur un iPhone SE (375 × 667, ouvert depuis l'icône), la carte tient sans défiler si le bandeau du titre tient sur une ligne. Sinon, elle défile d'environ 20 px.
  - À 320 px (affichage agrandi), elle défile.
  - C'est permis : au §8.1, l'écran défile et rien ne se comprime. « Suivant » reste en bas.
  - Mesure à faire au contrôle 14 h.
- **Lecteur d'écran.**
  - Il lit d'abord la ligne de l'avis, puis le graphique comme une seule image (rôle « image »).
  - Le nom de cette image est une phrase d'UX qui dit en mots la part de chaque position, dans l'ordre, et la mention du milieu. Jamais de pourcentage.
  - Les libellés dessinés ne sont pas lus une seconde fois.

**Ce qui s'affiche selon les cas**

| Cas | Ce qui s'affiche |
|---|---|
| Trois réponses ou plus, nombre impair | Le fil coupe une barre ; un libellé en gras. |
| Nombre pair, les deux réponses du milieu à deux positions différentes | Le fil tombe exactement entre la fin d'une barre et le début de la suivante (W/2 = W·c_k/T). Il touche les deux ; les deux libellés passent en gras. La ligne de l'avis suit la convention de Game design (§7.14 [renvoi]). |
| Mention du milieu « Neutre » | Rien de particulier : la rangée Neutre passe en gras comme une autre (`projet.md` §2 : « Neutre est une réponse comme une autre »). |
| Cercle unanime | Une seule barre, sur toute la largeur. Le fil se voit au-dessus et au-dessous, dans les quatre rangées vides, et disparaît dans la barre ; son libellé passe en gras. Le fil ne coupe jamais une barre en deux : une barre pleine coupée se lirait « partagé ». |
| Le joueur n'a pas répondu | Rien de particulier : le graphique compte les réponses qui existent. |
| Moins de trois réponses (seuil d'essai) | Ni boîte, ni ligne, ni graphique, et aucune place réservée : la carte est la 2.7d du premier essai (gros titre et ligne datée). Si UX écrit une phrase pour ce cas : sous la ligne datée, classe `small`, sans boîte, parce qu'une boîte encadrerait un vide. |

**Les formes envisagées, et pourquoi l'escalier**
1. **L'escalier (recommandé).** Il est fidèle au jugement majoritaire : le fil montre *pourquoi* une mention est celle du cercle. Chaque position est nommée. Une seule teinte suffit.
2. **Un histogramme simple** : cinq barres qui partent toutes de la gauche, la mention du milieu en gras. Il est plus familier. Mais rien n'y montre pourquoi c'est la mention du milieu, et il se lit comme un sondage. C'est la forme de repli si l'escalier déroute le porteur.
3. **La barre unique empilée** (la forme classique) : écartée. Elle demande une couleur par mention (contraire à D-012), et ses libellés ne tiennent pas à 320 px.
4. **Un rond par réponse** : écarté. Les ronds de serviette sont les visages du jeu : ce graphique ferait des personnes, et pousserait à chercher qui est qui, et où l'on est soi-même (§9, 2.7a).
5. **Un hémicycle ou un camembert** : écartés. Le premier est le dessin de l'Assemblée (trop institutionnel), le second celui des sondages.

**Un désaccord avec Front-end** (son avis sur l'essai 2, §1.2 b). Front-end proposait cinq rangées alignées à gauche, avec un signe pour marquer le milieu. Je propose l'escalier et le fil. Nous sommes d'accord sur deux points : aucun nombre, une seule teinte. [Assembleur : Front-end, dans ses sections finales, renvoie aux formes de la Direction artistique sans revenir sur ce point.]

#### C. La barre du portrait (Moi › Portrait ; D-026)

- **Place.**
  - Dans Moi › Portrait. Dans l'essai, c'est l'écran 5.11, puis 4.1 dès qu'un curseur du porteur est net (§7.15). [Assembleur, sur arbitrage de l'orchestrateur : « affiché pendant tout l'essai (§7.1) » remplacé ; texte de la Direction artistique écrit avant D-033.]
  - Premier élément sous les sous-onglets, au-dessus des huit curseurs.
  - La phrase validée du bas de 5.11 (« Chaque réponse le précise. … ») ne bouge pas.
  - La barre n'apparaît nulle part ailleurs : ni dans Le Cercle, ni sur l'écran d'un proche, ni en 2.5, ni dans le cadre de l'essai ou le carnet. D-026 la veut visible du joueur seul ; D-022 garde 2.5 tel quel.
  - La phrase du jour (2.5) mène déjà à Moi par « Voir mon portrait ».
- **Boîte.** La même que « Ta phrase du jour » (classe `box`). Dedans :
  - une étiquette (classe `label`, mots d'UX) ;
  - la barre ;
  - si UX le veut, une ligne en classe `small` dessous, deux lignes au plus.
  
  C'est l'élément « pour toi seul » en tête du portrait, comme le tempérament en 4.1.
- **La barre elle-même : le chemin, la partie faite, la borne.**
  - **Le chemin** : 8 px de haut, rayon 4 px, couleur Filet, toute la largeur W de la boîte. Environ 244 px à 320 px, 299 px à 375 px, 354 px à 430 px, 312 px en planche.
  - **La partie faite** :
    - en Caramel (Miel en mode sombre), à partir de la gauche ;
    - son bout droit, arrondi, est à W·min(n, N)/N. Ici, n est le nombre de réponses comptées et N la cible fixée par Game design, N = 16 (§5.8) ; la partie faite va aussi jusqu'au bout (W) dès le premier curseur net du porteur, même avant 16 réponses (§5.8, §7.15) ; [Assembleur, sur arbitrage de l'orchestrateur : N = 16 et la barre pleine au premier curseur net ajoutés.]
    - son bout gauche est caché sous le bord arrondi du chemin (le chemin coupe ce qui dépasse) : la première réponse se voit ainsi à sa vraie longueur, un seizième de W ; [Assembleur, sur arbitrage de l'orchestrateur : « environ 3 px » retiré.]
    - si n = 0, rien ;
    - elle n'est jamais plus courte qu'à l'affichage précédent.
  - **La borne** :
    - un trait de 2 × 16 px, rayon 1 px, en Brou de noix (Lin en mode sombre) ;
    - il ferme le chemin à droite et dépasse de 4 px au-dessus et au-dessous ;
    - c'est lui qui dit où finit le chemin : la couleur Filet seule est trop pâle (1,4 : 1).
  - Ni nombre, ni pourcentage, ni graduation, ni date, ni repère « aujourd'hui ».
  - **Teinte** : la barre est à toi. Elle prend donc la teinte qui marque « toi », comme ton halo dans les curseurs (règle 1 de l'univers).
- **Mouvement.** C'est la seule animation nouvelle.
  - Quand la barre s'affiche et que n a grandi depuis son dernier affichage, la partie faite s'allonge de l'ancienne longueur à la nouvelle.
  - Une seule fois, en 600 ms, courbe « ease-out », 150 ms après l'affichage de l'écran.
  - Pas d'appel, pas de pulsation, pas de son, pas de vibration. Jamais à rebours.
  - Avec « Réduire les animations » : la nouvelle longueur s'affiche directement.
  - La page garde le dernier n affiché, dans l'appareil seulement. n compte des réponses : c'est un geste (avis de Juridique sur l'essai 2, §1.5). Mais la barre pleine avant 16 réponses dit qu'un curseur est net, ce qui dépend des avis : son état ne va jamais dans le carnet (contrôle 12).
- **Contrastes.**
  - Caramel : 6,1 : 1 sur Assiette, 4,2 : 1 sur le chemin.
  - Miel : 8,4 : 1 sur Noyer, 5,0 : 1 sur le chemin.
  - Borne : 15,8 : 1 en clair, 13,5 : 1 en sombre.
  - Étiquette en Étain : 6,2 : 1 en clair, 7,1 : 1 en sombre.
- **Lecteur d'écran.** Une phrase d'UX. Jamais un pourcentage, jamais un nombre de réponses.
- [Assembleur, sur arbitrage de l'orchestrateur : le point « Ce qu'elle montre en une semaine » de la Direction artistique, écrit pour une cible d'environ trois mois, est retiré : avec N = 16, chaque réponse fait un seizième du chemin.]
- **Formes écartées.**
  - Un point de couture par réponse : chaque réponse se verrait comme un cran, mais 90 points se lisent comme une règle graduée et poussent à compter.
  - Un nombre ou un pourcentage : il ferait du portrait une tâche à finir (risque relevé par Game design au bilan), et la cible n'est pas encore réglée (étape 6).
  - Une perle creuse au bout du chemin : le rond creux à double anneau veut déjà dire « l'autre » sur l'écran d'un proche (« ◎ Hugo »).
- [Assembleur, sur arbitrage de l'orchestrateur : le point « Si UX place aussi la barre en 2.5 » de la Direction artistique est retiré : la barre est dans Moi › Portrait seulement.]

#### Ce qui reste une forme d'essai, à soumettre au porteur pour le produit (D-011, D-014 ; D-025 : « la forme, avant la bêta »)
- **L'avis du cercle** :
  - l'escalier ou l'histogramme simple ;
  - la boîte sur la carte du vote ;
  - les barres en couleur du texte et le fil en Miel ;
  - l'absence de nombres ;
  - un graphique immobile ;
  - une boîte par cercle quand on a plusieurs cercles.
- **La barre** :
  - sa forme : chemin, partie faite, borne ;
  - son mouvement ;
  - ses places : Moi seul, ou aussi 2.5 et 1.7 ;
  - ce qu'elle annonce au bout (étape 6, D-026).
- **La ligne de règle** :
  - son poids : discrète comme les consignes, ou plus forte ;
  - sa durée : tous les jours, ou les premières semaines seulement (UX, étape 6).

Le porteur verra ces formes à la livraison, dans la liste de ce qui est nouveau à l'écran (annexe C). Comme pour D-014, rien ne vaut pour le produit sans son accord.

## 8. Le cadre (UX ; §8.3 à §8.6 : Game design pour le contenu, UX pour les textes ; §8.8 : Front-end)

*[Assembleur : UX numérotait ses sections du cadre de 8.1 à 8.9. Elles sont rangées ici sous les numéros de `simulation.md` : 8.1 Règle (UX 8.1) ; 8.1 bis « Jour suivant », « Abandonner cette journée » (UX 8.3) ; 8.1 ter Le saut (UX 8.4) ; 8.2 Début (UX 8.2) ; 8.3 Carnet (Game design, puis UX 8.5) ; 8.5 Fin d'essai (Game design ; UX 8.6 et 8.7) ; 8.6 Dévoilement (Game design ; UX 8.8) ; 8.10 Arrêter l'essai (UX 8.8) ; 8.12 Format du carnet (UX 8.9). Les renvois internes sont rapprochés. §8.7 (export) : rien de changé n'est écrit, hors la copie du dimanche (§8.3).]*

### 8.1 Règle (UX ; écarts)
- **La barre de l'essai** affiche :
  - « Début » ;
  - « Jour {k} · {jour} » pour les jours 1, 2, 3, 4, 7, 8 et 14 ;
  - « Premier saut » ou « Second saut » sur la page du saut ;
  - « Premier saut · texte {k} sur 3 » et « Second saut · texte {k} sur 6 » pendant le rattrapage ;
  - « Clôture ».
  - « sur 14 » disparaît : on ne joue pas tous les jours.
- **La rangée d'action de la bande, aux jours joués**, une fois l'entrée finie :
  - **journée pas finie** : à gauche, le lien « Abandonner cette journée », style de « Arrêter l'essai » (13 px, accent, souligné, 44 px de haut). À droite, « Jour suivant », désactivé : bordure couleur filet, texte secondaire. Le lecteur d'écran dit « Jour suivant, indisponible tant que la journée n'est pas finie » ;
  - **journée finie** : le lien disparaît, et « Jour suivant » passe en accent.
  - **Pourquoi « Abandonner cette journée »**, et plus « Sauter cette journée » comme dans ma version de travail : « saut » désigne désormais les sauts de D-033. Le même verbe pour deux gestes ferait prendre le lien de mercredi pour le saut annoncé.
- **Aux jours 4 et 8** : pas de lien ni de « Jour suivant ». « Avancer au dimanche » (accent) apparaît quand le téléphone affiche 2.7f. (arbitrage de l'orchestrateur : position d'UX, le §0 est aligné ; positions : UX, ni lien ni « Jour suivant » ces jours-là ; Game design, abandon possible avant le saut.)
- **Pendant le rattrapage** : à droite, « Texte suivant », désactivé tant que la raison n'est pas validée (le lecteur d'écran dit « Texte suivant, indisponible tant que vous n'avez pas répondu »), puis en accent. Au dernier texte, le bouton s'appelle « Aller au dimanche ».

### 8.1 bis « Jour suivant », « Abandonner cette journée » (UX)
- **« Jour suivant »** n'est actif qu'une fois la journée finie. Il ouvre « Votre carnet du jour » (§8.3 [renvoi]), puis « Aller au jour suivant » fait passer au jour suivant.
- **« Abandonner cette journée »** remplace la rangée par une confirmation :
  - « **Abandonner cette journée ?** » ;
  - la phrase de perte ;
  - « Vous ne pourrez pas y revenir. » ;
  - « Abandonner » · « Annuler ». « Annuler » est mis en avant, à droite (en bas si les boutons s'empilent).
  - « Abandonner » ouvre « Votre carnet du jour ». Rien n'est joué avant « Aller au jour suivant » : « Annuler » ramène à la journée, intacte.
- **Phrases de perte.** R10 appliquée, confirmée par Game design : un visage posé compte.
  - **Révélation pas finie, cartes à deviner ce jour-là** : « La révélation s'arrêtera là. Vous ne devinerez pas les réponses d'hier, et vous ne répondrez pas au texte du jour. »
  - **Le dimanche** : si 3.3a n'a pas été affiché, la première phrase devient « La révélation s'arrêtera là, sans les titres ni votre phrase de la semaine. ». Si 3.3a a été affiché mais pas 3.3e : « La révélation s'arrêtera là, sans votre phrase de la semaine. ».
  - **Révélation finie, Deviner jamais affiché** : « Vous ne devinerez pas les réponses d'hier, et vous ne répondrez pas au texte du jour. »
  - **Deviner affiché, pas validé** :
    - aucune carte avec un visage : « {Votre carte comptera | Vos deux cartes compteront | Vos trois cartes compteront} comme {passée | passées}, et vous ne répondrez pas au texte du jour. » ;
    - certaines cartes avec un visage : « Les visages déjà posés comptent comme si vous aviez validé ; {la carte sans visage comptera | les deux cartes sans visage compteront} comme {passée | passées}. Vous ne répondrez pas au texte du jour. » ;
    - toutes les cartes avec un visage : « Les visages déjà posés comptent comme si vous aviez validé. Vous ne répondrez pas au texte du jour. »
  - **Deviner fait, ou rien à deviner** : « Vous ne répondrez pas au texte du jour. ». Avec une position choisie sans raison : « Vous ne répondrez pas au texte du jour : une position sans raison ne compte pas. »

### 8.1 ter Le saut : la page, le rattrapage, la note qui suit (UX)
**Déclenchement** (convention d'essai, dans l'ordre que le porteur a validé : « Vous voyez d'abord la révélation de vos devinettes du mercredi. Puis une page montre la semaine »).
- Aux jours 4 et 8, une fois 2.7f affiché, deux gestes ouvrent la page du saut : « Avancer au dimanche » dans la bande, et « Jouer » dans le téléphone.
- Le saut n'a lieu qu'à ces deux points fixes.

**La page du saut** (page du cadre ; barre : « Premier saut » ou « Second saut »).
- Titre : « Avancer au dimanche ».
- **La frise**, au-dessus du texte, en police du système, signes et lettres en couleur de texte. Jamais la couleur seule.
  - Premier saut :
    ```
     L   M   M   J   V   S   D
     ●   ●   ●   ○   ○   ○   ●
                             ↑ vous reprenez ici
    ● vous jouez    ○ vous répondez seulement
    ```
  - Second saut, deux rangées, avec en tête de ligne « Semaine 1 » et « Semaine 2 » :
    ```
               L   M   M   J   V   S   D
    Semaine 1  ●   ●   ●   ○   ○   ○   ●
    Semaine 2  ○   ○   ○   ○   ○   ○   ●
                                       ↑ vous reprenez ici
    ● vous jouez    ○ vous répondez seulement
    ```
  - Un jour abandonné reste « ● » : c'est un jour où vous avez joué.
  - Lecteur d'écran (la frise est une image) :
    - premier saut : « Lundi, mardi et mercredi : vous avez joué. Jeudi, vendredi et samedi : vous répondez seulement. Dimanche : vous reprenez ici. » ;
    - second saut : « Semaine 1 : vous avez joué lundi, mardi, mercredi et dimanche ; jeudi, vendredi et samedi, vous avez répondu seulement. Semaine 2 : du lundi au samedi, vous répondez seulement. Dimanche : vous reprenez ici. »
- **Le texte, premier saut** :
  « Jeudi, vendredi et samedi :
  - Agathe, Nassim, Odile et Valentin jouent comme chaque jour.
  - Vous répondez d'affilée aux trois textes de ces jours-là, sans deviner. Environ une minute.
  - Ces réponses comptent comme les autres, pour votre portrait comme pour Le Fidèle.
  - Les révélations de vendredi et de samedi ont lieu sans vous. Leurs votes et leurs auteurs seront dans votre Historique.
  Dimanche à 18h : la révélation, puis les titres de la semaine. »
- **Le texte, second saut** :
  « Du lundi au samedi :
  - Agathe, Nassim, Odile et Valentin jouent comme chaque jour.
  - Vous répondez d'affilée aux six textes de ces jours-là, sans deviner. Environ deux minutes.
  - Ces réponses comptent comme les autres, pour votre portrait comme pour Le Fidèle.
  - Les révélations de mardi à samedi ont lieu sans vous. Leurs votes et leurs auteurs seront dans votre Historique.
  Dimanche à 18h : la révélation, puis les titres de la semaine. C'est le dernier jour de jeu. »
- **Bande** : « Annuler » · « Avancer au dimanche ». Le second est mis en avant, à droite : c'est le seul chemin, pas une décision qui fait perdre quelque chose.
  - « Annuler » rend le téléphone sur 2.7f, avec « Avancer au dimanche » dans la bande.
  - Rouverte après une fermeture, la page revient sur 2.7f : on ne rouvre jamais sur une décision (§8.1 de `simulation.md`).

**Le rattrapage** : le téléphone, au §7.4. La barre affiche « Premier saut · texte {k} sur 3 » (ou « Second saut · texte {k} sur 6 »). Bande : « Texte suivant », puis « Aller au dimanche ». Il n'y a pas de page de carnet entre les textes.

**La note qui suit le saut** (bande).
- Texte : « Vous avez avancé de {trois | six} jours. Comme vous n'avez rien deviné pendant le saut, la révélation de ce soir commence au vote. »
- Elle s'affiche de l'écran verrouillé du dimanche jusqu'à ce que le porteur quitte la carte du vote (2.7d).
- Raison : c'est le seul effet du saut qui pourrait passer pour un défaut, puisqu'aucune carte n'est à retourner.

### 8.2 Début de l'essai (UX ; texte B : Juridique)
Des pages du cadre, dans cet ordre. La barre affiche « Début ».

**A. Seulement si l'icône garde la partie du premier essai** : le texte de la version de travail d'UX, recopié ci-dessous mot pour mot (« La partie du premier essai est encore là »…, « Effacer et commencer », sa confirmation).

1. **Si l'icône garde la partie du premier essai** (Front-end la détecte sans la lire) :
   - Titre : « La partie du premier essai est encore là »
   - « Votre {appareil} garde encore vos réponses du premier essai. Elles ne servent plus, et l'essai ne garde qu'une partie à la fois : la page les efface avant de commencer. Votre carnet du premier essai, déjà dans la conversation, n'est pas touché. »
   - Bouton : « Effacer et commencer ». Il ouvre la confirmation « Effacer la partie du premier essai ? » / « C'est définitif. » · « Annuler » · « Effacer ».
   - L'effacement retire aussi la trace de la page-test (Juridique). Sans effacement, l'essai ne commence pas.

*[Assembleur : Front-end (§8.8) demande à UX si la phrase « la page les efface avant de commencer » doit changer dans le cas rare où les deux parties sont là. Proposition de Juridique, mots à confirmer par UX : dans ce cas, « Elles ne servent plus, et l'essai ne garde qu'une partie à la fois : la page les efface avant de commencer. » devient « Elles ne servent plus : la page les efface. Votre partie en cours n'est pas touchée. », et le bouton devient « Effacer et reprendre ».]*

**B. Le premier message** (texte de Juridique, revalidé par lui le 9 octobre 2026). C'est le texte du §8.2 de `simulation.md`, dont la dernière puce est remplacée par les deux dernières ci-dessous :
« **Vos réponses restent dans votre {appareil}.** La page n'envoie rien, pas même à l'équipe. Pour que personne d'autre ne les voie, et pour ne pas les perdre :
- Jouez toujours depuis l'icône « Essai » : c'est elle qui garde votre avancement. Ne la supprimez pas avant la fin de l'essai : cela pourrait tout effacer.
- Ne laissez personne d'autre ouvrir l'icône « Essai ».
- Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.
- Dans la conversation, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit : vos phrases, votre portrait, votre place dans Le Cercle et sur l'écran d'un proche, l'avis du cercle.
- Avant d'envoyer une capture d'écran, vérifiez qu'on n'y voit rien de tout cela, ni votre Historique. L'équipe connaît les réponses des personnages : une capture de l'avis du cercle suffirait à retrouver la vôtre. Et une capture reste dans vos photos, même après « Tout effacer ». »
Bande : « Continuer ».

**C. La page d'arrivée** (UX). Titre : « Le cercle Amis joue depuis trois mois ». Trois panneaux, puis une ligne.
- Panneau 1 : « Agathe, Nassim, Odile et Valentin, les personnages du premier essai, y jouent ensemble. Valentin vous lance un défi : vous y entrez comme un nouveau venu. Vous ne verrez pas leurs révélations passées, seulement ce qu'elles ont laissé : les titres, les tempéraments, la place de chacun sur les tensions. »
- Panneau 2, intitulé « Le programme » :
  - « Lundi, mardi, mercredi : vous jouez. »
  - « Un saut vous mène au dimanche : vous répondez d'affilée aux textes des jours sautés, sans deviner. »
  - « Dimanche : vous jouez, avec les titres de la semaine. »
  - « Un second saut, de la même façon, vous mène au dimanche suivant. »
  - « Second dimanche : vous jouez, puis l'essai se termine. »
  - Dessous : « Vingt à vingt-cinq minutes en tout, en une ou plusieurs fois. »
- Panneau 3, intitulé « Votre portrait va plus vite » : « Dans le jeu, les premiers curseurs nets viennent vers trois mois. Ici, votre portrait avance environ {six} fois plus vite : au second dimanche, il ressemblera à celui de trois mois de jeu. Mais il ne repose que sur vos réponses de l'essai : une seule peut le faire basculer. »
  - « {six} » suit le facteur lu dans le fichier scellé (§5.9) : « quatre » pour 2, « huit » pour 4.
- Ligne finale : « Comme la première fois, n'ouvrez pas le dossier « a-ne-pas-ouvrir-2 » du dépôt avant la fin. La fiche des personnages reste à portée, par le bouton « Qui est qui ? ». »
- Bande : « Commencer ». Le téléphone s'ouvre ensuite sur 1.1.
- La page fait environ 160 mots : elle défile un peu sur un iPhone SE. C'est permis, puisque seul le milieu défile (§8.1 de `simulation.md`).

**La fiche « Qui est qui ».**
- Elle ne s'ouvre plus d'elle-même : le porteur connaît déjà les personnages. Elle s'ouvre par le bouton de la barre seulement.
- En-tête inchangé.
- Une carte par personnage, réduite à la vie (Game design, §1 [renvoi]) : âge, métier, ville, ligne de vie, heure de jeu. Celle de Valentin finit par « C'est lui qui vous invite. ».
- Ni profil, ni rappel.

**La note sur 18h** (texte inchangé) : au jour 1, dès que la journée est finie : « Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez. »

### 8.3 Carnet (contenu : Game design ; format : UX)

- **Chaque jour joué (1, 2, 3, 7, 14)**, une question : « Votre moment préféré : ».
  - Les choix sont les moments vécus, dans l'ordre, selon les écrans affichés, jamais selon une réponse.
  - Jour 1 : Le défi de Valentin · Deviner · Donner mon avis · Ma phrase du jour · Aucun.
  - Jours 2 et 3 : La révélation · Deviner · Donner mon avis · Ma phrase du jour · Aucun.
  - Jours 7 et 14 : La révélation · Les titres · Ma phrase de la semaine · Deviner · Donner mon avis · Ma phrase du jour · Aucun.
  - « L'avis du cercle » n'est jamais un choix du jour (Juridique). Il n'est demandé qu'en cumul.
- **Jours de saut, marqués.**
  - Les jours 4 et 8 ont un bloc de mesures seulement (révélation lue). Il n'a ni moment préféré, ni « Journée abandonnée ».
  - Chaque saut a un bloc « Premier saut · jeudi à samedi » ou « Second saut · lundi à samedi », avec sa durée, la durée de chaque réponse de rattrapage, « Annuler » et les écrans ouverts.
  - Les jours 5, 6 et 9 à 13 n'ont jamais de bloc « Jour {k} ». Un jour de saut ne doit jamais se lire comme un jour joué (contrainte 2 de GD).
- **Le dimanche**, après la question du jour :
  - au jour 7 seulement, d'abord : « Ce que le jeu a fait pendant le saut, c'était clair ? » ;
  - puis « Cette semaine, où avez-vous hésité ? » et « Cette semaine, votre moment préféré : », avec les choix d'UX, dont « Le Cercle » et « Mon portrait » ; « Le saut » est un choix de « où avez-vous hésité ? » seulement. (arbitrage de l'orchestrateur : liste d'UX ; positions : Game design citait « Le saut » parmi les choix ; UX le met dans « où avez-vous hésité ? » seulement.)
- **Copie** : au jour 7 seulement (la clôture suit le jour 14).
- **Questions de fin** : les huit d'UX (§8.5 [renvoi]), sans changement. GD confirme le retrait de F1 : les profils sont connus depuis le premier dévoilement, et F1 mesurerait ce souvenir. Ma v2 la gardait « si le porteur entre sans rappel » ; je change de position.
- Les réponses du rattrapage sont des réponses du porteur. Elles entrent dans « Sur tout l'essai » comme les autres, jamais texte par texte.

**La page « Votre carnet du jour » (UX)**

La page « Votre carnet du jour » s'ouvre par « Jour suivant » ou par « Abandonner ». Ses règles de `simulation.md` §8.3 ne changent pas, sauf ses questions.
- **Où la page existe.** Seulement aux jours joués (1, 2, 3, 7, 14). Les jours 4 et 8 et les sauts n'ont pas de page : leurs blocs du carnet ne portent que des mesures.
- **Chaque jour joué, une question : « Votre moment préféré : »** (le dimanche : « Aujourd'hui, votre moment préféré : »). Les choix sont rangés dans l'ordre vécu, et proposés selon les écrans affichés, jamais selon une réponse :
  - [Assembleur : les choix des jours 1, 2 et 3, 7 et 14 sont mot pour mot ceux de Game design, ci-dessus ; une seule version est gardée.]
  - « Le défi de Valentin » est toujours proposé au jour 1 : l'entrée vient avant tout le reste.
  - « L'avis du cercle » n'est jamais un choix du jour (Juridique, Game design).
- **Le dimanche, en plus, après la question du jour** (sans option recommandée, comme au premier essai ; ordre neutre repris de D-021 par convention, voir « Décisions touchées », UX) :
  1. **Au jour 7 seulement**, en premier : « Ce que le jeu a fait pendant le saut, c'était clair ? » : Non · En partie · Oui.
  2. « Cette semaine, où avez-vous hésité ? » En dessous : « Sur ce qu'il fallait faire ou comprendre. Plusieurs choix possibles ; pour « Ailleurs », dites où dans la conversation. »
     - Choix : Deviner · Répondre · La révélation · L'avis du cercle · Les titres · Le Cercle · Mon portrait · Le saut · Ailleurs · Nulle part.
     - « Nulle part » retire les autres choix, et inversement.
  3. « Cette semaine, votre moment préféré : » La révélation · L'avis du cercle · Les titres · Ma phrase de la semaine · Deviner · Donner mon avis · Ma phrase du jour · Le Cercle · Mon portrait · Aucun. Un seul choix.
- **Après le carnet du jour 7** : « Aller au jour suivant » passe d'abord par « Votre carnet à copier » (§8.7 de `simulation.md`), avec « Copier mon carnet » · « Aller au jour suivant ». Le carnet porte alors « Essai en cours : carnet copié au jour 7. ».
- **Après le jour 14**, « Aller au jour suivant » ouvre la clôture.

### 8.4 Mesures automatiques (Game design ; règle de Juridique du premier essai ; lignes nouvelles confirmées par Juridique le 9 octobre 2026, sous la condition du contrôle 12)

La règle de Juridique du premier essai s'applique telle quelle : rien qui changerait si le porteur avait répondu autrement n'est donné texte par texte.

- **Chaque jour joué, comme au premier essai** : ouverture, jours écoulés, version, durées (séance, Deviner, Répondre), « Relire », « Passer », verdicts, raison cachée tentée.
- **En plus, chaque jour** (des gestes, qui ne dépendent jamais des réponses) :
  - deux verdicts nouveaux : « juste par la même réponse » et « … avec la raison ». Ils ne dépendent que des personnages ;
  - « Journée abandonnée : oui | non ». Avec la durée de Répondre, un « oui » peut dire qu'un texte lu est resté sans réponse. C'est une abstention, pas un avis : risque assumé, comme la durée de Répondre (Juridique) ;
  - « Révélation rouverte : {n} fois » (E3). Comme « Relire », un geste attaché à un jour : il peut dire un intérêt pour la révélation, avis du cercle compris, jamais une réponse. Risque assumé (Juridique) ;
  - « Ouvert : Le Cercle {n} fois, écran d'un proche {n} fois, Moi {n} fois, fiche « Qui est qui » {n} fois ».
- **Jour 1 en plus** : les paris de l'entrée (juste ou faux, selon Valentin et la devinette ; confirmé par Juridique : le verdict dit ce que le porteur a deviné d'un personnage, jamais ce qu'il pense, à condition que le contrôle 12 prouve qu'il ne change pas avec ses propres réponses d'entrée), la voie de compte touchée (D-035 ; un geste), la durée de l'entrée.
- **Aux jours 1 à 3**, les ouvertures du Cercle et de l'écran d'un proche faites pendant que Deviner est affiché (proposition d'UX). C'est la mesure de D-023 : le nouveau venu se sert-il du Cercle pour deviner ? Ligne « Pendant Deviner » du carnet (§8.12).
- **Après chaque saut** (jours 7 et 14) : les mêmes ouvertures (proposition d'UX).
- **Bloc de saut** : durée du saut, dont la page du saut ; durée de chaque réponse de rattrapage. C'est le même risque assumé que la durée de Répondre au premier essai : attachée à un texte, elle dit l'hésitation, pas la réponse.
- **Sur tout l'essai** : les trois lignes du premier essai, calculées sur la période de l'essai (manches des jours 1 à 15), avec « pas de chiffre » sous cinq textes répondus parmi les textes révélés.
- **Jamais** :
  - « adopté », « rejeté » ou « partagé » texte par texte, ni « seul de son avis », ni le temps passé sur le graphique ;
  - un curseur, le nombre de curseurs nets du porteur, la forme de sa phrase du dimanche, un Pas de Côté ;
  - la part de raisons inattendues qu'il a choisies : ce sont ses réponses (D-016). Le lot en donne le chiffre côté contenu (Contenu A.8).
- **D-027** : écartée de l'essai. La part de « aucune » des personnages va au rapport de scellement.

### 8.5 Fin d'essai (ordre et contenu : Game design ; textes et questions : UX)

**Ordre à la clôture (jour 15)**
1. La révélation de T13, avec ses cartes. Le pied dit seulement « {n} point(s) aujourd'hui » : elle est hors semaine.
2. La fiche de T14, jamais deviné.
3. Les questions de fin.
4. « Copier mon carnet ».
5. Le dévoilement.
6. « Tout effacer ».

**La page de clôture (UX)**

Après la fiche de T14 (§7.5) :
1. Page du cadre : « L'essai est fini. Quelques questions, votre carnet à copier, puis le dévoilement. », suivie des questions de fin (§8.7), puis « Continuer ».

*[Assembleur : les étapes 2 à 4 d'UX (« Copier mon carnet », le dévoilement, « Tout effacer ») sont celles de Game design ci-dessus.]*

#### Questions de fin (UX)
Sur la page « L'essai est fini » : huit questions, un seul choix et une touche chacune, environ 40 secondes. « Continuer » est toujours actif ; pas de champ libre ; sans option recommandée.
- **Ordre des choix** : F2 garde celui du premier essai. Les autres vont du moins confortable au plus confortable. « Je ne l'ai pas lue », « Je ne l'ai pas regardé », « Je ne le lisais pas » et « Rien de précis » viennent en dernier.

1. **F2** : « Au fil de l'essai, deviner était : » De plus en plus amusant · Toujours aussi amusant · De moins en moins amusant · Jamais amusant.
2. « Ce qui vous a le plus servi pour deviner : » Le souvenir du premier essai · Le défi de Valentin · Les révélations · Le Cercle ou l'écran d'un proche · Rien de précis. (D-023 : on observe sans aider. Les mesures disent ce qu'il a ouvert ; la question dit ce qui a compté, y compris le souvenir, qu'aucune mesure ne voit.)
3. « Dans Deviner, la règle écrite sous « À qui sont ces réponses ? » vous a paru : » Pas claire · Claire, mais étrange · Claire · Je ne l'ai pas lue. (D-024)
4. « L'avis du cercle, à la révélation : » Je le lisais sans qu'il m'apprenne grand-chose · Il m'apprenait quelque chose sur le cercle · Je ne le lisais pas. (D-025)
5. « Les quatre raisons, au moment de répondre, vous ont paru : » Pas plus nuancées qu'au premier essai · Un peu plus nuancées · Nettement plus nuancées. (D-034 ; la question porte sur l'écran, jamais sur les choix)
6. « Votre portrait, au second dimanche : » Il ne me ressemblait pas · Il me ressemblait un peu · Il me ressemblait · Je ne l'ai pas regardé. (D-033 ; un jugement sur la ressemblance, rien sur le contenu)
7. « La barre du portrait : » Je ne l'ai pas remarquée · Remarquée, sans savoir ce qu'elle mesurait · Remarquée et comprise. (D-026)
8. « Avec des textes rejetés, « Et l'Assemblée ? » était : » Sans suspense · Avec un peu de suspense · Avec un vrai suspense. (D-028)

Dessous : « Pour tout le reste, vos mots dans la conversation, sans parler de vos réponses. »

**Retirées** :
- F1 : les profils sont connus depuis le premier dévoilement.
- « Passer de Deviner à Répondre » (dans ma version de travail) : D-022 a renvoyé la clarté de la journée à la bêta, la journée n'a pas changé, et le porteur a déjà répondu au premier bilan. Une question de moins.

### 8.6 Dévoilement (Game design ; textes : voir la note)

**Dévoilement** (textes d'UX, sur le modèle de `devoilement.md`, rangés dans `a-ne-pas-ouvrir-2/`)
1. **Ouverture**, sans rien sur F1.
2. **Comment lire.**
   - La place sur 100 et la fermeté, comme au premier essai.
   - la part et la forme des réponses données exprès contre le profil (texte au fichier caché, avec la règle qu'il dévoile).
   - Les absences.
   - « Jour {n} » : le texte répondu le jour n, deviné le jour n + 1, révélé le jour n + 2.
3. **L'histoire du cercle.**
   - « Les treize semaines d'avant votre arrivée ont été calculées avec les mêmes règles, sur des textes sans titre (une tension, un sens), sauf « {titre de H86} ». »
   - « Le calcul a été refait jusqu'à remplir des critères écrits d'avance : curseurs nets, tempéraments, surprise de la semaine, titres variés. Tirage retenu : {r}. »
   - Puis : « Votre portrait comptait vos réponses {trois} fois. » ({trois} suit le facteur, §5.9).
   - Pourquoi Le Devin et Le Sans-Faute étaient hors de portée : trois manches, puis une, contre sept.
4. **Un panneau par personnage** :
   - sa phrase fixe ;
   - ses quatre lignes, avec la place sur 100 et la fermeté ;
   - « Réponses contre son profil pendant l'essai : », texte par texte (T0 à T13), avec « Vous l'aviez à deviner le jour {n+1} ({jour}). » quand c'est vrai ;
   - « Avant votre arrivée : {a} réponses contre son profil sur {b}. » ;
   - ses jours sans jouer pendant l'essai, puis leur nombre avant ;
   - ses tempéraments au jour 14, chacun avec sa règle en mots.
5. **Pour le contrôle** : empreinte, graine, numéro r, fichier scellé.
6. **Fin** : « Les règles et le lot du second essai sont dans « a-ne-pas-ouvrir-2 » : vous pouvez maintenant l'ouvrir. ».

**Ajout d'UX**

- **Dévoilement** : textes de Game design sur le modèle de `devoilement.md`. Pour UX :
  - « Si vous le voulez, comparez-la… » devant l'empreinte ;

*[Assembleur : les deux autres points d'UX (« Vous l'aviez à deviner le jour {k} ({jour}). » ; la phrase finale sur « a-ne-pas-ouvrir-2 ») sont ceux de Game design ci-dessus. Game design attribue les textes du dévoilement à UX, UX à Game design : les phrases citées ici sont de Game design ; le texte complet, sur le modèle de `devoilement.md`, est à écrire par UX avant le lot 5, sur ces phrases (arbitrage de l'orchestrateur : UX avait écrit les textes du premier dévoilement avec Game design).]*

### 8.8 Ce que la page garde, et où (Front-end ; écart au premier essai)

*[Assembleur, sur arbitrage de l'orchestrateur : « Sauter cette journée », nom de la version de travail d'UX, est remplacé par « Abandonner cette journée » dans les sections de Front-end (§8.8, §9, « Lots et délai »).]*

**Ce qui ne change pas** (premier essai, §8.8 et §8.13) :
- une seule mémoire (`localStorage`), celle de l'icône « Essai » ; les clés commencent par « elenchos-essai: » ;
- chaque coup est écrit aussitôt, en une seule écriture. Le compteur d'écritures déclenche l'arrêt 3. Au retour au premier plan, la page relit l'état. À chaque chargement, elle vérifie sa mémoire ;
- les durées ne comptent que le temps passé au premier plan ;
- la détection du contexte, les écrans affichés hors de l'icône et la vue de secours ;
- les balises, la politique de sécurité, les polices (U+202F compris) et les interdits ;
- la page n'envoie rien (D-016, D-019).

La page-test n'est pas refaite : D-019 l'a éprouvée, et la page vérifie sa mémoire à chaque chargement.

**Les clés.**
- **`elenchos-essai:partie-2`** porte toute la partie du second essai, en une seule clé écrite d'un bloc. Son numéro de format est 2.
- **`elenchos-essai:verif-2`** est la clé de vérification : écrite, relue, puis effacée à chaque chargement. Son nom diffère de celui du premier essai (`elenchos-essai:verif`).
- **La page ne lit jamais le contenu de `elenchos-essai:partie`, `elenchos-essai:verif` ni `elenchos-essai:sonde-icone`, et n'y écrit jamais.** Elle les voit seulement dans la liste des clés (plus bas).

**Ce que l'état garde, en plus du premier essai :**
- le pseudo, tapé en 1.8 ;
- les coups de l'entrée : les trois réponses, et les trois devinettes sur Valentin (D-033) ;
- les visages, passes et raisons posés dans Deviner et pas encore validés. Ils sont écrits dès qu'ils sont posés, puisqu'ils comptent quand la journée est abandonnée (R10, conventions de Game design, §0 [renvoi]) ;
- les journées abandonnées par le lien « Abandonner cette journée » ;
- pour chaque saut :
  - le moment où il part ;
  - l'étape atteinte dans le rattrapage ;
  - chaque réponse du rattrapage, écrite dès qu'elle est validée ;
- les comptes de gestes demandés par Game design : révélation rouverte, Le Cercle, écran d'un proche, Moi, fiche ouverts ;
- les durées du saut et de chaque texte du rattrapage ;
- les réponses du carnet, dont les questions du dimanche (trois au jour 7, deux au jour 14 ; UX, §8.3). [Assembleur, sur arbitrage de l'orchestrateur : « les deux questions du dimanche » remplacé, d'après UX.]

Le bouton touché en 1.8 n'est gardé que si Game design en fait une mesure (c'est un geste). Si UX dessine un champ d'e-mail en 1.8 ou en 1.9, ce qu'on y tape n'est ni gardé ni envoyé (contrôles 5 et 14 b). [Assembleur : Game design en fait une mesure (§8.4, « la voie de compte touchée ») et le carnet a sa ligne « Compte » (§8.12). UX ne dessine aucun champ saisissable : 1.8b affiche « toi@exemple.fr » (§7.2).]

**Recalculé, jamais gardé :**
- l'histoire du cercle ;
- les cartes, les devinettes des personnages, les points et les titres ;
- le portrait accéléré, la barre ;
- l'avis du cercle, le jumeau ;
- les tempéraments, Le Pas de Côté, les phrases.

**L'histoire : calculée au chargement, gardée en mémoire vive.**

*Pourquoi.* Aujourd'hui, le moteur est une seule fonction pure, `calculer(scellé, journal)`, qui recalcule toute la partie à chaque geste. Avec 91 jours d'histoire en fractions exactes, ce serait de l'ordre d'une seconde par geste sur iPhone (estimation, non mesurée). C'est inacceptable.

*Comment.* Le moteur est coupé en deux fonctions pures, qui ne lisent ni l'écran, ni la mémoire, ni l'horloge, ni le hasard :
1. **`histoire(scellé)`** calcule tout ce qui ne dépend pas du porteur, jusqu'à son arrivée. Elle rend l'« état à l'arrivée » :
   - par personnage et par tension, les sommes qui font le curseur ;
   - les réponses des deux derniers mois, pour les tempéraments sur deux mois glissants ;
   - les titres des treize semaines ;
   - la surprise de la semaine d'avant l'arrivée ;
   - ce qu'il faut pour R3 (distance au curseur) et pour Le Pas de Côté.
2. **`calculer(scellé, étatÀLArrivée, journal)`** calcule, à chaque geste, les jours qui suivent l'arrivée, à partir de cet état.

*La règle de la coupure.* Tout texte révélé après l'arrivée passe par le calcul de chaque geste : à cinq membres, les cartes servies dépendent de la présence du porteur. Seule exception : la manche du jour 0 sur H90, jouée à quatre, reste dans l'histoire. Sa révélation, au jour 1, passe par le calcul de chaque geste et compte en semaine 14.

*Mise en cache.*
- L'état à l'arrivée est calculé une fois par chargement, après les vérifications V1 à V5, puis gelé en profondeur : aucun geste ne peut le modifier.
- Il vit en mémoire vive seulement, jamais dans `localStorage`. Une seconde copie gardée pourrait diverger de la première, et elle ne ferait rien gagner.

*Nouvelle vérification au chargement, V6.*
- La page calcule le SHA-256 d'un résumé canonique de son état à l'arrivée : titres et surprise de chaque semaine, curseurs à l'arrivée en fractions, tempéraments à l'arrivée, manche du jour 0 sur H90, numéro de tirage. Le format exact est celui du schéma de Back-end (`a-ne-pas-ouvrir-2/schema.md`, partie 3).
- Elle compare cette empreinte à celle que le programme de scellement, qui calcule déjà l'histoire pour la régler, a inscrite dans le fichier scellé. Le résumé lui-même n'est pas dans le fichier : il est joint au rapport de scellement.
- Un écart arrête la page, comme un vecteur de test faux : arrêt 1 du §8.11, repère V6 (§8.9, 8.11 et 8.13 ci-dessous). Une erreur pendant le calcul de l'histoire donne le même arrêt. (à confirmer par UX)
- Ce que cela apporte : la preuve, sur l'iPhone même, que le moteur de Safari retrouve la même histoire. Personne dans l'équipe n'a d'iPhone.
- Ce n'est pas sceller des résultats : seule une empreinte est scellée, et la page ne s'en sert jamais pour afficher quoi que ce soit.

*Budgets*, mesurés au contrôle 14 j :
- calcul de l'histoire au chargement : au plus 1 s ;
- chaque geste : au plus 100 ms ;
- dans Chromium ralenti quatre fois, puis dans la passe WebKit.

*Repli si un budget est dépassé malgré la mise en cache* : sceller les résultats de l'histoire. C'est un choix technique de Front-end, de Back-end et de Game design, pas une question au porteur (D-005, D-009). Il passe par Cohérence et le Vérificateur, parce qu'il change ce paragraphe.

*La vue de secours* n'apparaît qu'au bout de 2 secondes. Elle est écrite dans le HTML et rendue visible par le seul style (une animation retardée de `visibility`, sans script). Sans ce délai, elle passerait sous les yeux du porteur pendant le calcul de l'histoire. Si le script ne démarre pas, elle apparaît quand même.

**La partie du premier essai** (condition de Juridique, avant le premier jour).
- La page la repère à la seule présence de la clé `elenchos-essai:partie` dans la liste des clés, jamais à son contenu. Elle ne déclenche donc jamais l'arrêt M1.
- **Si elle est là**, une page du cadre propose de l'effacer, avant tout le reste (texte d'UX, avec confirmation). L'essai ne commence pas tant qu'elle est là.
- **L'effacement retire** `elenchos-essai:partie`, `elenchos-essai:verif` et `elenchos-essai:sonde-icone`, c'est-à-dire toutes les clés « elenchos-essai: » sauf celles du second essai. La trace de la page-test part donc avec elle (Juridique).
- **Cas rare : les deux parties à la fois.** Il arrive si une ancienne page restée en cache a été rouverte après le début du second essai. La même page d'effacement s'affiche. `partie-2` n'est pas touchée, et la partie reprend à son étape. UX dit si la phrase « la page les efface avant de commencer » doit changer dans ce cas. [Assembleur : pas de réponse d'UX à ce jour.]
- **« Tout effacer »** (5.7, clôture, arrêt) retire toutes les clés « elenchos-essai: », sans exception.

**Départ et compte (D-033, D-035).**
- Ordre : la page d'arrivée du cadre, puis l'entrée (D-006, défi de Valentin), puis le reste de la séance 1 (Game design, §0 [renvoi]). La place de la carte de consentement 1.3, avant la première réponse, ne change pas.
- **Écran 1.8 :** pseudo, puis « Continuer avec Apple », « Continuer avec Google », « Recevoir un code par e-mail ». Ce sont des boutons dessinés :
  - ni lien, ni adresse, ni fenêtre ;
  - aucun fichier d'Apple ou de Google embarqué ni chargé (règle de Juridique ; politique de sécurité) ;
  - ce que fait leur toucher : UX ;
  - leur aspect : la Direction artistique. À défaut, des boutons en texte seul. Les logos suivent des règles de marque qui ne se règlent qu'à l'étape 6.
- **Refus du pseudo (E7, §7.19 d'UX [renvoi]).** La comparaison avec les prénoms se fait sur un « squelette » au sens d'Unicode UTS #39 : décomposition, accents retirés, minuscules, et chaque lettre d'un autre alphabet qui imite une lettre latine (le а cyrillique pour le a) ramenée à cette lettre.
  - La table de ces lettres est réduite aux caractères qui se ramènent à une seule lettre latine de base. Elle est tirée, à la construction, du fichier `confusables.txt` d'Unicode (version et SHA-256 notés). Elle pèse quelques Ko, selon mon estimation.
  - Aucune fonction ne dépend de la langue du navigateur (contrôle 5).

**Sauts et rattrapage, dans la mémoire.**
- La page du saut ne change rien à la partie ; « Annuler » n'écrit que son compte de touchers, comme « Relire » et « Passer ».
- « Avancer au dimanche » écrit, en une seule écriture, le départ du saut. Les jours couverts et la révélation du point de saut se lisent dans la table du calendrier, jamais dans l'état : cette révélation appartient à son jour (4 ou 8), comme celle de tout jour joué.
- Chaque réponse du rattrapage est écrite dès qu'elle est validée. Si l'app est fermée au milieu, la page reprend au texte suivant. Aucun texte n'est répondu deux fois, aucun n'est sauté en silence.
- Le jour du dimanche n'est atteint qu'après la dernière réponse du rattrapage.
- Si UX permet de laisser un texte du rattrapage sans réponse, l'état le note « sans réponse ». [Assembleur : UX exige une réponse (§7.4) : sans objet.]

**L'heure.**
- Elle n'est lue, comme au premier essai, qu'au premier toucher d'une séance et à l'affichage de 2.5.
- Pendant un saut, elle n'est lue qu'au départ du saut, et en 2.5 seulement si UX y affiche cet écran. [Assembleur : UX affiche un 2.5 réduit, sans compte à rebours (§7.4).]
- Aucune règle de jeu ne dépend de l'heure.
- La nuit du 25 octobre 2026, le compte à rebours affiche une heure de trop, sans effet sur le jeu.

**Publication** (D-019, `CLAUDE.md`).
- Même adresse, même titre « Essai », même image d'icône à l'octet près : l'icône du porteur sert telle quelle.
- Un nouveau commit sur `gh-pages` remplace `essai/index.html`. Il n'est jamais réécrit. L'arbre garde trois fichiers.
- L'empreinte du nouveau fichier scellé est publiée avant le remplacement.
- L'annonce part au moins dix minutes après le déploiement, avec une consigne : fermer l'app, puis la rouvrir.
- Le numéro de version repart à 1. La nouvelle clé et le titre du carnet distinguent les deux essais.

**Construction et sources.**
- Les sources du second essai sont une copie, rangée dans `docs/essai/a-ne-pas-ouvrir-2/outillage/page/`, avec son propre fichier d'entrées, `a-ne-pas-ouvrir-2/entrees-construction.json`. C'est une proposition de chemin ; l'orchestrateur a le dernier mot.
- Les sources du premier essai restent telles quelles : le bilan s'y réfère.
- Ce qui change dans la construction :
  - la version du schéma attendue ;
  - les champs nouveaux (annexe B) ;
  - la table des lettres qui imitent les nôtres ;
  - les chaînes nouvelles, vérifiées contre les polices.
- Les polices et leurs fichiers ne changent pas (mêmes SHA-256), sauf si une chaîne nouvelle (nom de groupe, libellé de commission, mot d'UX) demande un caractère absent des polices réduites : la réduction est alors refaite, et ses SHA-256 sont notés (limites de la Direction artistique).
- Poids estimé de la page : 340 à 550 Ko.

**Ce que les changements touchent dans la page.**

Environ les deux tiers du code sont repris sans changement :
- le noyau : SHA-256, fractions, typographie, heure de Paris ;
- les écrans et les gestes du téléphone ;
- la révélation ;
- le cadre ;
- la mémoire, les durées, le harnais.

| Élément | Moteur | Téléphone ou cadre | Contrôles |
|---|---|---|---|
| Calendrier | Une table lue dans le fichier scellé. Plus aucun 14, 15 ou 16 écrit en dur. Les règles de validité du journal sont réécrites pour cette table. | Barre « Jour 7 · dimanche » (UX) | 6 à 13 |
| Histoire | `histoire(scellé)`, mise en cache, V6 | Le Cercle : initiales, tempéraments, titres. Treize semaines de titres passés, dont la liste défile à l'intérieur de l'écran. Écran d'un proche au portrait net. Surprise d'avant l'arrivée : son titre seul ; l'encadré n'ouvre rien (UX, §7.16). | 3, 6 à 10, 14 j |
| Entrée | Revient. L'invitant est lu dans le fichier (Valentin). | 1.1 à 1.9 du premier essai, 1.8 redessiné | 6, 11 |
| Sauts, rattrapage | Séances couvertes, manches jamais ouvertes (R10), révélation au début du saut | Page du saut et sa frise, repère « Texte n sur m », note de la bande | 6 à 14 |
| Portrait accéléré | Poids du porteur multipliés par le facteur lu dans le fichier scellé. Ceux des personnages ne changent pas. | Signalement (UX), dont le chiffre suit le facteur (§5.9) | 9, 11 |
| Barre | Compte jusqu'à la valeur lue dans le fichier (16), ou pleine dès le premier curseur net, puis reste pleine | Moi › Portrait seulement : 5.11, puis 4.1 dès qu'un curseur est net ; sans texte une fois pleine | 9, 10, 12 |
| Curseurs nets | Phrase « nette », Le Pas de Côté, R3 par distance : conventions de Game design | Moi, Le Cercle. Deux lettres sur une marque de curseur (E7). | 7, 9, 14 h |
| D-024 (jumeau) | Juste si le visage désigné a donné la même position et la même raison, pour tous les devineurs. S'applique aux points, au Mystère (jamais une erreur), à la surprise de la semaine, à « Ses surprises » et aux chiffres « Sur tout l'essai ». | Ligne de règle sous « À qui sont ces réponses ? » (2.1). Phrase du jumeau sur la carte, dans la place réservée (rien ne bouge, §7.1). | 6 à 12 |
| R4 | Déjà dans la page | — | — |
| R7 | Le Sans-Faute chaque semaine, histoire comprise ; aucune erreur ni passe les jours où le membre a des cartes, et des cartes au moins cinq jours (§6, point 6) | — | 8 |
| R10 | La manche jamais ouverte n'a pas de cartes, et la révélation commence au vote (l'information est déjà notée). Les visages posés comptent à l'abandon d'une journée, selon la convention. | — | 6, 8, 12 |
| D-025 (avis du cercle) | Décompte des positions des membres qui ont répondu au texte révélé, seuil de trois, ligne selon la règle de Game design | 2.7d, forme de la Direction artistique. Fait d'éléments HTML (ni image ni canvas), avec un texte pour le lecteur d'écran (UX). | 9, 10, 11, 12, 14 h |
| E1 | Le message dépend de ce qui attend : des cartes, le vote seul, ou rien. Le dimanche, l'ajout seulement s'il y a des titres. | 2.6. Un jour où il n'y a rien à révéler n'a pas de révélation (table d'UX). | 11 |
| E3 | — | La croix ferme la révélation ; une ligne en haut d'Aujourd'hui la rouvre là où on l'avait laissée, jusqu'au jour suivant | 11, 14 h |
| E4, E5 | Lecture des champs nouveaux | Lignes du vote d'un article, d'un amendement, d'une motion. Groupes en toutes lettres. Phrases de la commission, du Gouvernement, du député non inscrit. | 1, 11 |
| E7 | — | Rond à deux lettres | 11, 14 h |
| D-034 | Rien : toujours quatre raisons. Le nombre de raisons reste lu dans les données. | Rien | 1 |

*[Assembleur, sur arbitrage de l'orchestrateur : la ligne « D-024, R4, R5, R7, R10, E1, E3, E4, E5, E7, D-025 », qui renvoyait à la version de travail de Front-end, est remplacée par les lignes de cette version, recopiées mot pour mot (R5 n'y a pas de ligne). Dans la ligne R10, « au saut » devient « à l'abandon d'une journée ». Ligne « Barre » : alignée sur §5.8 et §7.15. Ligne « Histoire » : l'encadré de la surprise n'ouvre rien et la fiche légère n'est jamais affichée (UX, §7.16) ; seul son titre l'est.]*

**Accessibilité des formes nouvelles.**
- La frise du saut, le graphique et la barre sont faits d'éléments HTML, ni image ni canvas.
- Chacun a un texte pour le lecteur d'écran, écrit par UX.
- La frise ne distingue jamais un jour par la couleur seule.

### 8.9, 8.11 et 8.13 (UX)

- **§8.9, §8.11, §8.13** : inchangés.
- La note « Qui, durée, droits » garde le texte du §8.9 de `simulation.md`, avec une phrase de plus à la fin de son paragraphe « Qui voit vos réponses » : « Les boutons Apple et Google de l'écran du compte sont dessinés : ils ne se connectent à rien, et la page n'envoie rien à Apple ni à Google. » Le reste ne change pas : l'avis du cercle n'est vu que du porteur (confirmé par Juridique).

- **Arrêt V6** (§8.8) : l'arrêt 1 du §8.11 de  (à confirmer par UX)

### 8.10 Arrêter l'essai (UX)

- **Arrêter l'essai** (§8.10 de `simulation.md`) : possible de l'entrée au jour 14, rattrapage compris.
  - En tête de la page de questions : « Essai arrêté au jour {k}. », « Essai arrêté pendant l'entrée. » ou « Essai arrêté pendant le {premier | second} saut. ».
  - Les raisons d'arrêt ne changent pas. F2 (« Jusqu'ici, deviner était : ») est posée dès le jour 3, rattrapages compris. Plus de F1.

### 8.12 Format du carnet (UX ; écarts au gabarit du §8.12 de `simulation.md`)
```
Carnet du second essai Elenchos
Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, ni votre portrait, ni votre pseudo, ni l’avis du cercle.
Les titres et les chiffres « Sur tout l’essai » dépendent en partie de vos avis, mais seulement en cumul, jamais texte par texte.
{Essai mené jusqu’à la clôture. | Essai arrêté au jour {k}. | Essai arrêté pendant l’entrée. | Essai arrêté pendant le {premier | second} saut. | Essai en cours : carnet copié au jour {k}. | Essai en cours : carnet copié pendant l’entrée. | Essai en cours : carnet copié pendant le {premier | second} saut.}
[Raison de l’arrêt : {bouton | pas de réponse}.]

Jour {k} · {jour}
Ouverture : {date}, entre {h}h00 et {h}h59.
[Jours écoulés depuis l’ouverture précédente : {n}.]
Version de la page : {version}.
Durée : {D}{suite}.
[Entrée : paris sur Valentin {verdict}, {verdict}, {verdict}.]
[Compte : {Continuer avec Apple | Continuer avec Google | Recevoir un code par e-mail, puis Valider | Recevoir un code par e-mail, puis Plus tard}.]
[Boutons touchés : Relire {n} fois, Passer {n} fois.]
[Révélation : {verdicts}.[ Raison cachée : {tentée | pas tentée}.]]
[Révélation rouverte : {n} fois.]
[Ouvert : Le Cercle {n} fois, écran d’un proche {n} fois, Moi {n} fois, fiche « Qui est qui » {n} fois.]
[Pendant Deviner : Le Cercle {n} fois, écran d’un proche {n} fois.]
[Journée abandonnée : {oui | non}.]
[Votre moment préféré : {bouton}.]

{Premier saut · jeudi à samedi | Second saut · lundi à samedi}
Durée : {D}, dont {D} sur la page du saut.
Pour répondre : {D}, {D}, {D}[, {D}, {D}, {D}].
Boutons touchés : Annuler {n} fois.
Ouvert : Le Cercle {n} fois, écran d’un proche {n} fois, Moi {n} fois, fiche « Qui est qui » {n} fois.

Semaine {1 | 2}
Le Sans-Faute : {titulaires | pas attribué}.
Le Devin : {titulaires | pas attribué}.
Le Mystère : {titulaires | pas attribué}.
Le Fidèle : {titulaires | pas attribué}.
[Ce que le jeu a fait pendant le saut, c’était clair : {bouton | pas de réponse}.]
Où vous avez hésité cette semaine : {choix, séparés par « , » | pas de réponse}.
Cette semaine, votre moment préféré : {bouton | pas de réponse}.

Sur tout l’essai
(les trois lignes du premier essai, inchangées)

Questions de fin
{Au fil de l’essai | Jusqu’ici}, deviner était : {bouton | pas de réponse}.
Ce qui vous a le plus servi pour deviner : {bouton | pas de réponse}.
La règle écrite dans Deviner vous a paru : {bouton | pas de réponse}.
L’avis du cercle, à la révélation : {bouton | pas de réponse}.
Les quatre raisons, au moment de répondre : {bouton | pas de réponse}.
Votre portrait, au second dimanche : {bouton | pas de réponse}.
La barre du portrait : {bouton | pas de réponse}.
Avec des textes rejetés, « Et l’Assemblée ? » était : {bouton | pas de réponse}.

Fin du carnet
```
**Règles de présence** (toujours selon les écrans affichés, jamais selon une réponse) :
- **Blocs, dans l'ordre vécu** : Jour 1, 2, 3, 4, Premier saut, Jour 7, Semaine 1, Jour 8, Second saut, Jour 14, Semaine 2, Clôture. Le bloc « Clôture » garde les lignes du premier essai.
- **« Entrée » et « Compte »** : au jour 1 seulement, dès que la ligne est atteinte.
  - {verdict} vaut « juste » ou « faux ». Il ne dépend que de Valentin et de la devinette, jamais des réponses du porteur : confirmé par Juridique, sous la condition du contrôle 12.
  - {suite} au jour 1 : « , dont {D} pour l'entrée, {D} pour deviner et {D} pour répondre ». La durée de l'entrée va du premier affichage de 1.2 au bouton du compte (ou à « Valider » ou « Plus tard » de 1.9).
- **Aux jours 4 et 8** : Ouverture, Version, Durée, Révélation, Raison cachée, Ouvert. Ni « Journée abandonnée », ni moment préféré. Le bloc du jour s'arrête au toucher « Avancer au dimanche » qui confirme le saut : ce qui précède (y compris une page du saut quittée par « Annuler ») compte dans le jour ; ce qui suit, dans le bloc de saut.
- **« Révélation rouverte »** : chaque jour qui a une révélation qu'on peut fermer (jours 2, 3, 7, 14), même à 0.
- **« Journée abandonnée »** : chaque jour joué, après l'entrée.
- **« Pendant Deviner »** : chaque jour où l'écran Deviner a été affiché (jours 1, 2, 3, 7, 14), même à 0 : les ouvertures du Cercle et de l'écran d'un proche faites pendant que Deviner est affiché (mesure de D-023, §8.4). Elles comptent aussi dans la ligne « Ouvert ».
- **Bloc de saut.** « Pour répondre » donne la durée de chaque texte, dans l'ordre, du premier affichage de sa position à sa raison validée. C'est le même risque assumé que pour la durée de Répondre au premier essai (§8.4 de `simulation.md`).
  - Un saut arrêté en cours n'écrit que les durées des textes atteints.
  - « dont {D} sur la page du saut » compte la seule ouverture confirmée par « Avancer au dimanche » ; « Annuler {n} fois » compte les ouvertures quittées, dont le temps est dans la durée du jour.
  - Un jour de saut n'est jamais écrit « Jour {k} » : un jour en raccourci ne se lit jamais comme un jour joué (Game design, contrainte 2).
- **Bloc « Semaine »** : [renvoi : correspondance avec les semaines 14 et 15 du cercle, §0]
  - Le Sans-Faute figure dans les deux semaines : les personnages peuvent l'avoir (R7).
  - {titulaires} : Agathe, Nassim, Odile, Valentin, vous, dans cet ordre.
  - La question du saut ne figure qu'en semaine 1.
- **Lors d'un arrêt**, seule F2 reste dans « Questions de fin ».

## 9. Ce qui est contrôlé (Front-end ; réglage, calibrage et point 15 : Game design ; ajout : Direction artistique)

**Ce qui ne change pas :**
- le programme de contrôle, écrit à part sans lire le code de la page ;
- les parties témoins et les 200 parties au hasard ;
- le rejeu dans Chromium, à l'heure de Paris et à celle de New York ;
- la passe WebKit, aux mêmes conditions ;
- la version témoin, qui ne diffère de celle du porteur que par la trace ;
- les règles du correctif et le contrôle d'après l'essai.

**Avant d'écrire la page.** Le schéma de Back-end, nouvelle version, doit fixer :
- les champs de l'annexe B ;
- le format canonique du résumé de l'histoire (V6) ;
- la trace étendue :
  - une partie « histoire » : par jour, les cartes, les devinettes, les points et Le Pas de Côté de chaque révélation ; par semaine, les titres ; à l'arrivée, les curseurs et les tempéraments ;
  - des séances marquées « saut », avec le rattrapage.

L'auteur du programme de contrôle relit ce schéma.

**L'histoire est comparée une fois par fichier, pas à chaque partie.** Elle ne dépend pas du porteur. La trace complète de l'histoire est donc comparée une seule fois, jour par jour, entre la page, le programme de contrôle et le rapport de scellement. Ensuite, chaque partie ne compare que le résumé V6 et les jours qui suivent l'arrivée. Cela fait gagner du temps machine, sans rien perdre.

**Carnets de référence et cas chiffrés.** Ils sont faits par une instance distincte, rôle Game design, sur le modèle de vérification (D-018), à partir de la spécification et du fichier candidat seuls.
- **Deux carnets :**
  - (r) jusqu'à l'ouverture du premier dimanche : il couvre l'entrée, trois jours joués, le premier saut et son rattrapage ;
  - (a) la clôture de la partie témoin (a).
- **Quatre cas chiffrés à la main**, puisque 91 jours ne se refont pas à la main :
  - la semaine d'histoire qui précède l'arrivée (titres, et la surprise affichée) ;
  - un curseur de personnage à l'arrivée ;
  - un tempérament sur deux mois glissants ;
  - le curseur accéléré du porteur de la partie (a) au second dimanche.

**Contrôle par contrôle :**
1. Le nouveau fichier :
   - empreinte, vecteurs de test et typographie ;
   - fidélité aux fiches, champs nouveaux compris (E4, E5) et fiche légère comprise ;
   - les textes abstraits ne portent aucun mot ;
   - la règle de D-034, « un argument inattendu de chaque côté, ou aucun », est vérifiée sur les annotations des fiches, si Contenu l'adopte. [Assembleur : Contenu l'adopte (annexe A, A.7, point 6).]
2. Les profils sont identiques à ceux du premier fichier scellé, champ par champ : c'est la promesse « les mêmes personnages » (D-032, D-033).
3. Les réponses des personnages, histoire comprise (environ 360 réponses), sont recalculées. Les critères de réglage de l'histoire (Game design, §1 [renvoi]) sont vérifiés, pas seulement rapportés :
   - les critères exacts du calibrage de Game design (§1 ; détail au fichier caché, « Calibrage de l'histoire »).
   - (arbitrage de l'orchestrateur : le contrôle renvoie aux critères de Game design ; positions : Front-end citait « deux à quatre curseurs nets par personnage, dans un ordre différent ; au moins un tempérament ; la surprise de la semaine 13 est bien le texte de la fiche légère » ; Game design les a remplacés par des critères exacts.)
4. Les absences, histoire comprise.
5. Le code de la page. En plus du premier essai :
   - les clés anciennes ne sont repérées que dans la liste des clés : aucune lecture de leur contenu ;
   - aucune écriture hors de `partie-2` et `verif-2`, sauf les effacements décrits plus haut ;
   - l'état à l'arrivée n'est jamais écrit en mémoire, et il est gelé ;
   - le facteur et la longueur de la barre sont lus dans le fichier, jamais écrits en dur ;
   - les boutons de 1.8 n'ont ni lien, ni requête, ni ressource venue d'ailleurs ;
   - aucun champ d'e-mail n'est gardé ;
   - le graphique, la barre et la frise sont faits d'éléments HTML.
6. à 9. Les parties témoins et au hasard, recalculées par le programme indépendant et comparées trace contre trace. En plus du premier essai :
   - l'histoire, une fois ;
   - le jumeau ;
   - R3 par la rareté, puis par la distance au curseur net ;
   - R7, et R10 (manches jamais ouvertes, visages posés) ;
   - l'avis du cercle ;
   - la barre ;
   - le facteur, appliqué au seul porteur ;
   - la phrase « nette » ;
   - Le Pas de Côté, pour les personnages et pour le porteur ;
   - les tempéraments sur deux mois glissants.
10. Les lignes rouges :
    - l'avis du cercle est la seule exception admise (D-025) :
      - il ne s'affiche que sur l'écran du vote, après la révélation, et ne porte que sur le texte révélé ;
      - la réponse du porteur n'y est pas marquée (lecture d'UX) ;
      - il n'apparaît jamais dans le carnet.

      La phrase du jumeau ne nomme que le proche désigné. Le reste est inchangé.
      [Assembleur, sur arbitrage de l'orchestrateur : texte du contrôle 10 de la version de travail de Front-end, recopié mot pour mot à la place de « comme dans … ».]
    - la barre n'apparaît jamais dans Le Cercle, sur l'écran d'un proche ni dans le carnet ;
    - aucun écran ne montre une révélation d'avant l'arrivée, ni l'identifiant d'un texte abstrait.
11. Les chaînes sont relevées contre l'annexe C du second essai : page d'arrivée, page du saut et sa frise, repère du rattrapage, signalement du portrait accéléré, 1.8, repère V6, et ce que listait la version de travail de Front-end : « Les chaînes sont relevées contre l'annexe C du second essai. Un nom de groupe en toutes lettres peut se couper à ses espaces ; un sigle à trait d'union, jamais. » [Assembleur, sur arbitrage de l'orchestrateur : texte du contrôle 11 de la version de travail de Front-end, recopié mot pour mot ; aucun sigle n'est plus servi (arbitrage sur les sigles).] Un nom de groupe en toutes lettres ne se coupe qu'à ses espaces. Aucune ligne ne commence par « - ».
12. Le carnet :
    - les variantes du premier essai, réponses d'entrée et du rattrapage comprises (positions opposées, toutes neutres, autres raisons), paris de l'entrée et devinettes inchangés : les blocs restent identiques octet pour octet, durées masquées, lignes « Entrée » et « Compte » comprises ;
    - quatrième variante : le lien « Abandonner cette journée » ;
    - cinquième variante, nouvelle : un rattrapage interrompu (app fermée), puis repris ;
    - un jour couvert par un saut n'est jamais écrit comme un jour joué (format d'UX) ;
    - rien de l'avis du cercle, de la barre ni du Pas de Côté du porteur dans le carnet.
13. Inchangé, sauts compris.
14. Navigateur et publication. En plus du premier essai :
    - (b) mémoire :
      - ancienne partie présente, absente, et les deux clés à la fois ;
      - la page du premier essai, reconstruite depuis ses sources et chargée sur la même mémoire, ne touche pas `partie-2` ;
      - « Annuler » sur la page du saut ne change que le compte de touchers, rien de la partie ;
      - un rechargement au milieu du rattrapage reprend au texte suivant ;
    - (c) l'inventaire des sites du compte est refait avant la publication ;
    - (d) « Tout effacer » retire aussi les clés du premier essai ;
    - (g) la publication est un remplacement : trois fichiers, image identique ;
    - (h) mise en page, à toutes les tailles : la page d'arrivée, 1.8, la page du saut, le rattrapage, le graphique, la barre, la ligne de règle, la liste des titres passés (elle défile dans l'écran du jeu, jamais la page), deux lettres sur une marque de curseur ;
    - (i) durées : celle du saut, et celle de chaque texte du rattrapage, y compris après une fermeture de l'app au milieu ;
    - **(j) nouveau, performance** : temps de l'histoire au chargement, temps du chargement entier (de V1 au premier écran, à comparer aux 2 s de la vue de secours ; un cas du harnais ralentit l'histoire à 3 s et vérifie que la vue de secours n'est jamais dessinée), et temps par geste sur la partie témoin la plus longue, dans Chromium ralenti quatre fois et dans la passe WebKit. Un dépassement des budgets du §8.8 est un défaut.
15. Les chiffres suivent le calendrier de Game design :
    - semaine 1 : manches T0 à T2 ;
    - semaine 2 : manche T6 ; [renvoi : semaines 14 et 15 du cercle, §0]
    - T13 à part ;
    - quinze cartes au plus, avec et sans les réponses atypiques ;
    - le reste, au point 15 de Game design.

**Parties témoins à ajouter** (la liste complète revient à Game design, §9 bis) :
- une partie complète, avec les deux sauts ;
- « Annuler » sur la page du saut, puis le saut ;
- un rattrapage interrompu puis repris ;
- un texte du rattrapage sans réponse, si UX le permet ; [Assembleur : UX ne le permet pas (§7.4) : sans objet.]
- « Abandonner cette journée » aux jours 1, 2, 3, 7 et 14. Le jour 3 abandonné, le saut reste proposé : c'est ma lecture, à confirmer par UX ; [Assembleur : Game design le confirme : abandonner mène à la même suite que « Jour suivant » (§0).]
- portrait accéléré :
  - un joueur qui tranche (un ou deux curseurs nets au second dimanche) ;
  - un joueur souvent au centre (aucun curseur net) ;
  - un joueur qui prend souvent l'argument inattendu ;
  - un joueur toujours neutre ;
- la barre à 0, à mi-chemin, pleine exactement, puis au-delà ;
- la phrase « nette » du second dimanche, et son absence ;
- Le Pas de Côté chez un personnage, et chez le porteur dans le seul cas que permet l'ordre des textes (fichier caché, points 12 et 14) ;
- l'entrée à 0 sur 3 et à 3 sur 3 face à Valentin ;
- un pseudo refusé par une lettre d'un autre alphabet ;
- le rond à deux lettres ;
- chacun des trois boutons de 1.8 ;
- les trois formes du message de 18h ;
- tout ce que listait la version de travail de Front-end : jumeau, cartes identiques, texte rejeté, article, amendement, motion, commission, député non inscrit, révélation fermée puis rouverte ; [renvoi : la liste est donnée ici]
- un arrêt à chaque jour-seuil, et un arrêt pendant un saut.

**Temps machine** (estimation) : 3 à 4 h en série, environ 2 h en parallèle. Le premier essai avait pris environ 4 h en série.

### Réglage, calibrage et point 15 (Game design ; partie publique)

- **Calibrage de l'histoire** : critères et numéro de tirage (§1). Il est refait au candidat final, avec les vrais textes d'entrée.
- **Réglage** : 200 parties de réglage sur le fichier candidat, une seule fois.
  - Le joueur simulé tient la place du porteur. Il sait ce qu'un nouveau venu sait : l'entrée, Le Cercle (curseurs vus) et les révélations. Il devine aux cinq manches du calendrier. Ses attributions se comptent avec D-024.
  - On règle :
    - la part de réponses atypiques (valeur par défaut et crans : fichier caché) ;
    - le second réglage du premier essai (seuils stricts), inchangé ;
    - le contrôle du facteur du portrait (§5.9).
  - Les seuils sont dans le fichier caché.
- **Nouveaux chiffres constants au rapport de scellement** :
  - les jumeaux non servis que le porteur peut désigner ;
  - la justesse au hasard avec D-024, sur ses quinze cartes ;
  - le nombre de réponses par texte révélé ;
  - les « Texte rejeté. » parmi les révélations lues (entrée comprise) ;
  - la part de « aucune » chez les personnages ;
  - la preuve qu'un cercle unanimement neutre n'arrive pas ;
  - l'état à l'arrivée (curseurs nets, tempéraments, titres, surprise) ;
  - les Pas de Côté des personnages sur les révélations lues ;
  - les textes du lot qui ont des inattendus, par type.
- **Point 15** :
  - Justesse du porteur, jumeaux compris, sur ses quinze cartes. Avec et sans les réponses atypiques, et personnage par personnage.
  - Comparée au hasard (chiffre constant), au premier essai (6 cartes justes sur 38 ; 4 sur 28 sur les réponses ordinaires) et au joueur simulé.
  - Repère, hypothèse de GD et non critère (D-008) : au moins quatre cartes justes sur dix sur les réponses ordinaires. Sur une dizaine de cartes, c'est fragile.
  - Part de « La révélation » comme moment préféré, comparée au premier essai (5 fois sur 13 proposés).
  - Réponses aux questions de fin sur le portrait (D-033) et sur les raisons (D-034).

### Ajout de la Direction artistique (contrôles des formes du §7.23), pour Front-end et le programme de contrôle

1. **Géométrie de l'avis du cercle**, pour chaque texte révélé :
   - les frontières des barres valent W·c_k/T, en fractions exactes ;
   - le fil est à W/2 ;
   - le ou les libellés en gras sont la ou les mentions du milieu calculées par le moteur ;
   - la ligne de l'avis et le gras désignent la même mention ;
   - sous le seuil, il n'y a pas de boîte.
2. **Aucun chiffre** dans les deux boîtes : ni chiffre ni « % », ni à l'écran ni dans les noms lus par le lecteur d'écran.
3. **Couleurs.** Chaque élément des trois formes a une couleur du tableau. Les cinq barres ont la même couleur. Aucune rangée n'a de couleur propre.
4. **Barre du portrait.**
   - Sa longueur vaut W·min(n, N)/N, avec N = 16, ou W dès le premier curseur net du porteur. [Assembleur, sur arbitrage de l'orchestrateur : N = 16 et la barre pleine au premier curseur net ajoutés.]
   - Elle ne raccourcit jamais d'un affichage à l'autre, sur toute une partie témoin.
   - Elle n'apparaît sur aucun écran autre que Moi › Portrait. [Assembleur, sur arbitrage de l'orchestrateur : « (sauf si 2.5 est retenu) » retiré.]
5. **Ligne de règle.** Présente si et seulement si l'écran Deviner a au moins une carte.
6. **Captures** (contrôle 14 h), en clair et en sombre, à 320 × 548, 375 × 667, 430 × 932 et en planche :
   - à capturer :
     - 2.1 avec sa ligne ;
     - 2.7d dans quatre cas : impair, pair à deux mentions, unanime, sous le seuil ;
     - 5.11 avec n = 3 (après l'entrée), n = 7 et n = 13 ; n = 0 par le harnais seulement ;
     - la barre pleine : à 16 réponses, et au premier curseur net avant 16 ;
     - 4.1 avec la barre en tête ; [Assembleur, sur arbitrage de l'orchestrateur : les deux captures ci-dessus sont ajoutées.]
   - à vérifier :
     - aucun texte hors de sa boîte ni tronqué ;
     - le fil visible au-dessus et au-dessous des barres ;
     - aucune barre coupée en deux par le fil.
   
   La Direction artistique relit ces captures avant la publication, comme au premier essai.

## Annexe A · Le lot

### Partie Game design (ordre et contraintes de jeu ; la part de Contenu suit, que Game design accepte)

- **18 textes en jeu, scellés.**
  - E1, E2, E3 : entrée (défi de Valentin), trois tensions différentes (ordre au fichier caché).
  - T0 : répondu par les personnages, deviné le jour 1. Jamais répondu par le porteur ; texte entier ou article central.
  - T1 à T14.
- **Plus** deux réserves non scellées (une rejetée, une T) et la fiche légère H86.
- **Avant la phrase du second dimanche**, le porteur répond à 16 textes : trois sur Tradition/Changement, faute de stock (le repli prévu devient l'ordre retenu), quatre ou cinq sur chacune des autres tensions. Le détail est au fichier caché.
- **Ordre des tensions** : fixé par GD (fichier caché). E1 à E3, T0 et T14 sont choisis pour leur rôle ; dans chaque tension, les autres textes vont dans leurs cases par tirage au scellement (D-028 : « dans un ordre tiré au hasard »), avec une contrainte de sens. Un ordre de repli est prévu si un texte tombe à la vérification (fichier caché).
- **D-028** et **D-034** : comme Contenu les écrit, A.3 et A.7 ci-dessous. [Assembleur : les deux puces de Game design sur ces points redisent Contenu sans écart ; une seule version est gardée.]
- **E4, E5, E8, E9 et E11** : comme Contenu les applique.

### Partie Contenu (A.1 à A.9)

**Annexe A : ce que Contenu fournit (écart à `simulation.md`)**

Tout ce qui n'est pas dit ici reste comme à l'annexe A de `simulation.md` et dans `a-ne-pas-ouvrir/textes/conventions.md`.

**A.1 Le lot**
- **18 textes en jeu, scellés :**
  - E1 à E3 : les textes d'entrée (défi de Valentin) ;
  - T0 : déjà répondu par les personnages, servi en Deviner le jour 1, jamais répondu par le porteur ;
  - T1 à T14 : répondus par le porteur, les jours joués et pendant les sauts.
- **2 fiches de réserve, non scellées :** une rejetée, une Tradition/Changement. Une réserve remplace d'abord un texte de même tension, puis de même résultat.
- **1 fiche légère :** la surprise de la semaine d'avant l'arrivée (A.6).
- **Fenêtre :** 17e législature, votes jusqu'au 2 octobre 2026 ; et, pour les cases que la 17e ne remplit pas, la 16e législature (2022-2024), comme au premier essai. Tout est déjà voté (E11). (Arbitrage de l'orchestrateur, 9 octobre 2026, après le relevé ciblé : dans la 17e législature, Précaution/Innovation, Tradition/Changement et Local/National n'offrent pas assez de textes conformes ; positions : Contenu proposait d'ouvrir la 16e pour T, ou d'assouplir E9 et la répartition par tension. L'exclusion des dossiers et des mesures du premier essai, A.5, vaut dans les deux législatures. Un groupe s'écrit tel qu'il était au dépôt, §7.11.)
- **Où :** toutes les fiches du lot, réserves comprises, vont dans `docs/essai/a-ne-pas-ouvrir-2/textes/`, jamais dans `a-ne-pas-ouvrir/`, que le porteur peut lire depuis le premier dévoilement. Seul `a-ne-pas-ouvrir/textes/conventions.md` est cité, parce qu'il ne dévoile rien du second lot.

**A.2 Tensions et sens**
- **Répartition.** S, P, T, L. Avant la phrase du second dimanche, le porteur répond à 16 textes (E1 à E3, T1 à T13), La convention 13 de Game design en voulait quatre par tension ; le stock ne donne que trois textes Tradition/Changement qui passent les conventions : c'est le repli prévu (annexe A, partie Game design), et les autres tensions en reçoivent quatre ou cinq. T0 et T14 complètent deux tensions, que Game design choisit avec l'ordre (fichier caché).
- **E9.** Dans chaque tension, les deux sens, à un texte près.
- **Tradition/Changement.** Aucun texte de mœurs ou de religion qui suive une ligne de parti (inchangé).

**A.3 Mélange (D-028)**
- Entre 6 et 12 rejetés sur les 18, cible 7 ; la répartition par tension, le nombre retenu et son écart à la cible sont au fichier caché ; les bornes de D-028 sont tenues. Au moins un rejeté parmi E1 à E3.
- Une motion de rejet adoptée par les partisans du texte pour un motif de procédure ne compte pas, et n'est pas servie.
- Dans chaque tension, au moins un adopté et un rejeté si le stock le permet. Sur le lot, le sens est croisé avec le résultat.
- Si une case reste vide, l'orchestrateur relâche au point d'étape, dans cet ordre :
  1. le partage adopté/rejeté dans une tension ;
  2. le croisement sens × résultat ;
  3. le nombre de rejetés, de 7 à 6.
- Jamais moins de 6 rejetés.

**A.4 Objet du vote**
- Texte entier, article, amendement ou motion. L'objet est inscrit dans la fiche et relevé deux fois.
- L'objet ne trahit pas le résultat :
  - tout type d'objet servi au moins deux fois compte au moins un adopté et un rejeté ;
  - au moins un texte entier ou article central est rejeté.
- **T0 :** texte entier ou article central, sens net, jamais un rejet de circonstance.
- **Entrée :** trois tensions différentes, des mesures qui divisent et se comprennent seules. Un amendement est admis s'il se lit sans le texte autour.
- **Même dossier :** au plus deux scrutins par dossier, sur des mesures sans rapport et des tensions différentes.
- **Amendement de suppression :** la ligne du vote reste exacte sur le scrutin servi, sans en emprunter un autre. Selon le cas, la mesure servie est l'article visé ou l'amendement lui-même (règle au fichier caché). Le titre et les lignes n'enchaînent jamais deux négations.

**A.5 Jamais joués**
- Aucun des 19 textes préparés pour le premier essai (17 joués, la réserve T, la réserve P écartée), ni aucun scrutin de leurs dossiers.
- Aucune mesure déjà jouée, même votée dans un autre dossier.

**A.6 La surprise d'avant l'arrivée (fiche légère)**
- **Titre affiché** dans Le Cercle pendant la semaine 1 (maquette 4.2) : « Vaisselle en plastique interdite dans les cantines d'enfants ». 60 caractères, à recompter par le programme. [renvoi : semaine 14 du cercle, §0]
- **Le reste de la fiche va dans `a-ne-pas-ouvrir-2/textes/`.** (arbitrage de l'orchestrateur : le public garde le titre seulement ; tension, sens, vote, scrutin et dossier sont rangés au fichier caché.)
- Pas de lignes, de raisons ni d'auteur : rien d'autre ne s'affiche (UX, §7.16 [renvoi]).
- Le titre et le vote sont relevés deux fois, comme pour une fiche complète. Game design règle l'histoire pour que ce texte soit bien la surprise.

**A.7 Fiches : conventions 1 à 10, avec ces changements**
1. **Titres :** sans deux-points, 60 caractères au plus (E8).
2. **Groupes :** en toutes lettres, pris dans la liste fermée (E5). Remplace le libellé court de la convention 8 et du §7.10, sous réserve d'UX pour la place à l'écran. (arbitrage de l'orchestrateur : jamais de sigle dans l'essai, §7.11 ; la ligne est ramenée à cette règle ; positions : Contenu, « le sigle officiel seulement là où la place manque » ; UX, jamais de sigle.)
3. **Vote :** la ligne dit l'objet du vote (E4). Les faits viennent de Contenu, les mots d'UX. Proposition, à confirmer par UX et Back-end, pour un amendement ou un article :
   - rejeté : étape `aucune` ;
   - adopté : l'étape du texte après cette lecture (`navette` ou `aucune`, comme au §7.10) ; jamais `definitif` : si aucune case n'est exacte, le texte va en réserve. (arbitrage de l'orchestrateur : position d'UX ; Contenu en tient compte au relevé ; positions : Contenu, `navette` ou `definitif` ; UX, jamais `definitif`.)
4. **Auteur d'un amendement :** le premier signataire que nomme le titre du scrutin, avec son mandat et son groupe au dépôt.
   - Les amendements identiques d'autres groupes sont notés dans la fiche ; leur affichage revient à UX. [Assembleur : UX n'a pas encore écrit cet affichage.]
   - Pour un amendement du Gouvernement : « Proposé par le Gouvernement. »
5. **Raisons (D-034) :** quatre, deux « pour » et deux « contre », de quatre groupes. De chaque côté, une raison attendue et une seconde, attendue ou inattendue :
   - *attendue* : elle sert le pôle de son côté (« pour » : le pôle s ; « contre » : l'autre) ;
   - *inattendue croisée* : elle défend son côté au nom du pôle d'en face ;
   - *inattendue pratique* : pôle « aucun » (efficacité, coût, faisabilité, droit).

   Le type se déduit du côté et du pôle, déjà dans la fiche. Pas de champ nouveau : le programme de contrôle le recalcule.
6. **Règle interne : un inattendu de chaque côté, ou aucun.**
   - Si le débat (règle 8) offre de chaque côté un inattendu qui passe toutes les conventions, on les prend tous les deux. Ce n'est pas un choix.
   - Si un seul côté en offre un : aucun inattendu. Chaque côté a alors deux raisons attendues ; à défaut, le texte est remplacé.
   - Entre deux inattendus d'un même côté, le croisé passe avant le pratique. Les deux côtés n'ont pas à avoir le même type ; le vérificateur de symétrie juge leur force.
   - Pas de quota.
7. **Convention 4 revue :**
   - au plus deux raisons « aucun » par texte, une par côté, et seulement comme inattendue (une attendue porte toujours un pôle) ;
   - remplace « au plus une » ;
   - remplace aussi la répartition hors tension fixée d'avance dans l'annexe A des règles de calcul : le nombre suit le débat, et Game design règle les personnages sur le lot fourni.
8. **Arguments sur la mesure** (amendement ou article). Une raison peut venir de tout le débat en séance, à la même lecture, sur la mesure votée : discussion générale, orateurs inscrits sur l'article, amendements identiques ou concurrents, sous-amendements. Trois conditions :
   1. elle parle de cette mesure, pas du texte en général ;
   2. la mesure n'a pas changé sur le point visé entre l'extrait et le vote ;
   3. l'orateur a voté dans le sens de sa raison à ce scrutin-là (convention 1 pour un absent ou un abstentionniste).

   Les propos du Gouvernement ne sont jamais des raisons.
9. **Convention 3 renforcée.** Un inattendu croisé se dit souvent avec le mot du pôle d'en face (« la liberté de quelques-uns… »). Il est réécrit sans nommer ce pôle, et sa fidélité est vérifiée.
10. **Annotation à l'aveugle étendue** (condition d'UX, D-034).
    - L'annotateur voit le titre, les trois lignes et une seule raison ; il dit aussi le côté.
    - Si le côté d'un inattendu n'est pas retrouvé du premier coup, on prend un autre inattendu du même côté.
    - S'il n'y en a pas, la règle 6 s'applique : aucun inattendu.
11. **Vérifications (§8) :** comme au premier essai. En plus, l'adversaire vérifie si un côté paraît « plus raisonnable » à cause de son inattendu.

**A.8 Un premier chiffre sur les raisons, pour le bilan**
- **Au relevé :** la part des candidats lus qui offrent un inattendu de chaque côté. C'est le seul chiffre qui dit ce que les débats offrent.
- **Sur le lot :** le nombre de textes servis avec la paire, par type. Ce chiffre surestime le premier, puisque le lot est choisi.
- Ces chiffres portent sur le contenu, jamais sur les réponses du porteur (D-016, D-027).

**A.9 Délai**
- 3,5 à 4 jours après validation, comme annoncé.
- **Tradition/Changement.** Le relevé ciblé, 16e législature comprise, n'a trouvé que trois textes T qui passent les conventions, plus une réserve. Le lot prend le repli à trois textes T (partie Game design ci-dessus ; détail au fichier caché).

## Annexe B · Le fichier scellé (Front-end ; écart)

**Contenu :**
- **Version du schéma et graine.** La graine est celle de Game design : préfixe « elenchos-essai-2|graine| », plus l'empreinte du commit de la spécification relue.
- **Vecteurs de test** : trois, dont un sur une clé de l'histoire (clé choisie par Game design).
- **Calendrier** : une table, une ligne par jour, de 1 à 15. Elle donne le jour de la semaine, le type (joué, point de saut, sauté ou clôture ; l'entrée fait partie du jour 1), le saut, les textes révélé, deviné et répondu, et ce que le porteur en vit. Les semaines forment une seconde table ; le dimanche se lit au jour de la semaine. Forme exacte : schéma de Back-end, partie 2.4.
- **Cercle** : son nom, « Amis » ; l'invitant, Valentin (le nom du champ revient à Back-end, puisque le premier fichier écrivait « inviteuse ») ; l'ordre d'arrivée.
- **Personnages** : les quatre fiches, identiques au premier fichier (contrôle 2).
- **Histoire** : 91 jours, de −90 à 0. Les jours −90 à −1 ont chacun un texte abstrait, H1 à H90 ; le jour 0 est celui de T0, un texte joué :
  - un identifiant, une tension, un sens ;
  - si les règles de l'histoire s'en servent, quatre raisons abstraites (côté, pôle), sans aucun mot (Game design le dit) ;
  - les réponses des quatre personnages, les absences et les réponses atypiques ;
  - un seul vrai texte, la surprise de la semaine 13, avec sa fiche légère : titre, tension, sens, vote.
- **Textes joués** : E1 à E3 et T0 à T14, en fiches complètes. Champs nouveaux (E4, E5) :
  - l'objet du vote : texte entier, article, amendement ou motion ;
  - les auteurs « commission » et « non inscrit » ;
  - les groupes en toutes lettres.

  Un champ marquant l'argument inattendu n'est ajouté que si la règle de Game design pour les personnages s'en sert. Sinon, il reste dans les fiches, que le contrôle 1 lit. [Assembleur : Contenu (annexe A, A.7, point 5) n'ajoute pas de champ : le type se déduit du côté et du pôle. À fixer au schéma avec Game design et Back-end.]
- **Réponses des personnages aux textes joués**, absences et réponses atypiques.
- **Réglage** :
  - le facteur du portrait accéléré (3, ou 4 ou 2 si le réglage l'exige ; le contrôle vérifie que la valeur est l'une des trois permises par la spécification : 2, 3 ou 4) ; (arbitrage de l'orchestrateur : la règle de Game design, §5.9, fixe les valeurs ; positions : Game design, 2, 3 ou 4 ; Front-end, 3 ou 4.)
  - la longueur de la barre ;
  - la part de réponses atypiques (valeur par défaut et crans : fichier caché) ;
  - les seuils stricts (second réglage du premier essai).

  Les autres seuils (tempéraments, Pas de Côté, netteté) restent dans la spécification, et chaque programme les tient de son côté. Les lire dans le fichier rendrait le contrôle moins indépendant.
- **Résumé de l'histoire** : son SHA-256 seulement (V6). Le résumé complet est dans le rapport de scellement.

**Format, auteur, embarquement** : comme au premier essai. JSON canonique, écrit par un agent distinct de celui de la page, embarqué en base64.

**Taille** : 25 à 35 Ko de plus (estimation).

**Jamais scellé** : tout ce qui dépend du porteur, et les résultats de l'histoire eux-mêmes (sauf repli, §8.8).

**Limite, inchangée** : le fichier se décode. Il donne les réponses des personnages ; l'essai repose sur la bonne foi du porteur.

## Annexe C · Textes nouveaux à l'écran (UX ; à montrer au porteur à la livraison, avec les formes de la Direction artistique, §7.23)

**Dans le téléphone, nouveaux :**
1. 1.8 selon D-035 : « Pour que Valentin sache que c'était toi, et retrouver tes réponses demain. » ; « Continuer avec Apple », « Continuer avec Google », « Recevoir un code par e-mail ».
2. 1.8b : « Tu recevras un code à six chiffres. » (le champ « E-mail » et « Recevoir mon code » sont des mots validés).
3. 5.7 : la ligne « Connexion » et ses valeurs.
4. 2.5 réduit pendant le rattrapage (aucun mot nouveau : un écran qui perd deux lignes).
5. « Vers tes premiers curseurs nets » et sa phrase pour le lecteur d'écran.
6. 4.1 avec curseurs nets, sans tempérament.
7. Dans des cas jamais affichés : les tempéraments sous les visages ; les initiales sur les barres ; l'écran d'un proche net ; « Semaine {n} » en 5.2 et 5.5 ; « Pour commencer · {titre} » en 5.3 ; la surprise de la semaine d'avant l'arrivée.
8. Pour le lecteur d'écran : les barres du Cercle, les superpositions de 4.3, l'avis du cercle (avec ses mots de part).
9. « Milieu des réponses », sous l'avis du cercle.
10. « {Prénom} décroche Le Pas de Côté. » et sa ligne (à écrire par Game design).
11. Les points 1 à 10 de l'annexe C de la version de travail d'UX, sauf le 4 (remplacé par le point 5 ci-dessus) et le 5 (formes du message de 18h, inchangées), recopiés mot pour mot :
    1. La ligne de règle de Deviner (§7.12 [renvoi]).
    2. « C'était {Y}. {X} avait répondu la même chose. »
    3. Les trois lignes de l'avis du cercle, le graphique, « Le repère montre où le cercle se coupe en deux. » et sa phrase pour le lecteur d'écran. [Assembleur : « Le repère montre où le cercle se coupe en deux. » est remplacé par « Milieu des réponses » (point 9 ci-dessus).]
    6. « Reprendre la révélation » ; « Revoir la révélation ».
    7. Les lignes du vote : « C'était un amendement, une modification d'un texte en discussion. » ; « C'était un article d'un texte plus long. » ; « Le Sénat devait encore voter ce texte. » ; « …, avant même l'examen de ses articles. »
    8. Les groupes en toutes lettres, dans le gabarit validé ; « sans groupe » ; « Proposé par la commission … ».
    9. Le Sans-Faute dans 4.2, 4.3, 5.2 et 5.5.
    10. Le rond à deux lettres.

**Ce qui change sans mot nouveau** :
- la croix qui ferme la révélation, sauf aux jours 4 et 8 et à la clôture ;
- son propre visage qui ouvre son portrait ;
- « Jouer » qui mène au saut aux jours 4 et 8 ;
- la barre qui s'allonge, puis reste pleine ;
- les curseurs du porteur, accélérés.

**Retiré** : les sigles ; « Pas dans l'essai. » sur la croix (sauf jours 4, 8 et clôture) ; « : un pseudo, ton e-mail. » en 1.8.

**Dans le cadre, nouveaux** :
- la page de la partie du premier essai ;
- les deux puces sur la conversation et les captures, dans le premier message ;
- la page d'arrivée ;
- « Abandonner cette journée », sa confirmation, ses phrases de perte et « Abandonner » ;
- « Jour suivant » désactivé ;
- « Avancer au dimanche », la page du saut, sa frise et ses deux textes ;
- « Texte suivant », « Aller au dimanche » ;
- les libellés de la barre (« Début », « Jour {k} · {jour} », « Premier saut · texte {k} sur 3 »…) ;
- la note du compte simulé et les deux notes d'Apple et de Google ; la phrase sur ces boutons dans « Qui, durée, droits » ;
- la note du portrait accéléré et la note de la barre pleine ;
- la note qui suit le saut ;
- « C'est lui qui vous invite. » ;
- les questions du dimanche (dont celle du saut) et les huit questions de fin ;
- les nouvelles lignes du carnet ;
- « Essai arrêté pendant l'entrée. », « … pendant le premier saut. » ;
- « Si vous le voulez » devant l'empreinte.

## Les décisions dans la page, règle par règle (Game design)

| Règle | Dans le second essai |
|---|---|
| D-022 | Les écrans ne changent pas, sauf ce qu'ajoutent D-024, D-025, D-026, D-033 (pages du cadre, rattrapage) et D-035 (1.8). |
| D-023 | Le porteur entre en nouveau venu par l'entrée validée (D-006, défi de Valentin), sans aide ajoutée : pas de rappel des profils. Le Cercle montre ce que le produit montre à tout nouveau venu. |
| D-024 | Le jumeau compte juste (§4), avec la ligne de règle dans Deviner et « … avait répondu la même chose. ». Ce n'est ni une erreur, ni une surprise, et il ne fait pas perdre Le Sans-Faute. |
| D-025 | L'avis du cercle s'affiche seulement à la révélation, dès trois réponses (convention d'essai). La réponse du porteur compte s'il a répondu. Calcul : §7.14 [renvoi], inchangé. Jamais dans le carnet. |
| D-026 | Barre de 16 crans, entrée comprise ; pleine aussi dès le premier curseur net ; ensuite pleine, sans rien annoncer (D-033). |
| D-027 | Écartée de l'essai. Part de « aucune » des personnages au rapport. |
| D-028 | Lot : 6 à 12 rejetés sur 18 (cible 7), un au moins à l'entrée. |
| D-029 | Sans objet : jamais de pause. |
| D-033 | §0 (calendrier, sauts), §1 (histoire), §5.8 et §5.9. |
| D-034 | Le lot (annexe A) ; la règle de raison des personnages (fichier caché) ; les phrases du jour inchangées (R1 couvre la réponse « tiraillée ») ; une question de fin sur l'écran des raisons. |
| D-035 | 1.8 avec trois voies dessinées, qui ne se connectent à rien ; le pseudo se tape. Aucune règle de jeu ne change. |
| R1, R5, R12, E2, E10 | Inchangées (premier essai). |
| R2 | La forme nette devient possible au jour 14 (§5.7). |
| R3 | §4 : rareté si le curseur est flou, distance s'il est net. |
| R4 | Inchangée ; ce qui est juste suit D-024. |
| R6 | Avec D-024. |
| R7 | §6 : possible pour les personnages, impossible pour le porteur. |
| R8 | Sans objet (un seul cercle). |
| R9 | Appliquée : « (Amis) » dans Moi. |
| R10 | Appliquée à « Abandonner cette journée » et aux sauts. La tolérance après 18h est sans objet. |
| R11 | §6, point 7. |
| E1 | §0, message de 18h. |
| E3 | La révélation se rouvre jusqu'au jour suivant. Son propre visage ouvre son portrait. |
| E4, E5, E8, E9, E11 | Sur le lot et à l'écran (Contenu, UX). |
| E6 | Appliquée : les textes d'entrée dans l'Historique (mots : UX). |
| E7 | Rond à deux lettres. |

## Décisions touchées, conventions d'essai et désaccords

### Décisions antérieures touchées

#### Game design

- **Aucune décision n'est modifiée pour le produit.** D-033, D-034 et D-035 sont appliquées. Pour l'essai seulement, Le Pont est calculé texte par texte, et non « par tension » comme le dit `projet.md` §4 (validé) : convention d'essai, nommée au §6 (point 8), sans effet sur le porteur, qui n'a aucun tempérament dans l'essai.
- **D-026** : touchée dans l'essai seulement, comme le prévoit D-033. La barre est pleine à 16 réponses ou au premier curseur net, puis le reste sans rien annoncer. Le produit ne change pas.
- **D-032** : remplacée par D-033 sur la durée, l'entrée et le rappel des profils. Le lien pour sauter une journée tient, sous le nom d'UX.
- **D-016 et D-015** : touchées comme le dit D-033 (sauts ; histoire scellée d'avance).
- **D-023** : tenue ; on observe sans aider.
- **D-028** : appliquée au lot.
- **D-024 et D-025** : appliquées.
- **D-027** : écartée de l'essai.
- **R2, R3, R7, R10, R11, E1 et E6** : appliquées, avec des conventions d'essai pour les points qu'elles ne chiffrent pas.
- **`simulation.md`** n'est pas une décision. Ses conventions qui changent sont listées en D.
- **La promesse publiée** dans `retours-du-8-octobre.md` (« quatre ou cinq réponses par tension ») ne tient pas pour Tradition/Changement : le stock ne donne que trois textes T (annexe A, A.9). À dire au porteur à la livraison, sans question.

#### UX

- **D-033** : appliquée (nouveau venu invité par Valentin, trois jours joués, deux sauts à points fixes, rattrapage sans deviner, portrait accéléré signalé, barre pleine sans texte). Deux lectures d'UX, dites comme telles :
  - « sans texte » veut dire sans message au bout, et l'étiquette de la barre reste ;
  - le cadre peut, une fois, dire pourquoi la barre se tait.
- **D-035** : appliquée dans l'essai (1.8 dessiné, sans connexion). La voie e-mail sur un écran 1.8b est un dessin d'essai : 1.8, 5.7 et 5.14 se redessinent à l'étape 6. La fin de la phrase validée de 1.8 (« : un pseudo, ton e-mail. ») est retirée, devenue fausse ; c'est un écart à D-014 qui découle de D-035.
- **D-014** : les écarts propres à l'essai sont listés en annexe C (2.5 réduit pendant le rattrapage, croix inactive aux jours 4 et 8, 1.8b, la ligne « Connexion » de 5.7, « Pour commencer · {titre} » en 5.3).
- **D-022** : tenue. 2.5 ne change pas aux jours joués, et la barre n'y est pas. La version réduite ne sert qu'aux sauts (convention d'essai).
- **D-023** : tenue. Aucune aide pour le nouveau venu ; la note « Relire » est retirée.
- **D-026** : dans l'essai seulement, par D-033. La place (Moi seul) et « pleine dès le premier curseur net » sont des conventions d'essai ; le produit ne change pas.
- **D-032** : le lien pour sauter un jour existe toujours, sous un autre nom (« Abandonner cette journée »). D-032 décrivait le geste (« sauter un jour passe par un lien à part, qui dit ce qu'on perd ») sans en fixer le libellé. Le carnet touche D-032 sur un point : « deux questions le dimanche » devient trois au jour 7, la question sur la clarté du saut étant rendue nécessaire par D-033 ; deux au jour 14.
- **D-006** : tenue. Carte de consentement au premier avis de l'entrée, compte après la première révélation.
- **D-021** : non invoquée, et sa portée (« ce bilan ») n'est pas étendue. Les questions du carnet sont des instruments de mesure de la page, comme au premier essai (`simulation.md` §8.3 et §8.5, posées sans option recommandée avant D-021) : ce ne sont pas des questions au porteur au sens de D-001. L'ordre neutre de D-021 (échelles dans l'ordre naturel, réponse confortable jamais en tête, « Rien » ou « Nulle part » en dernier) est repris par convention d'essai. Les questions de ressenti du bilan du second essai, posées dans la conversation, demanderont que la question de D-021 soit reposée (`essai-2-proposition.md`). Lecture confirmée par Cohérence.
- **D-034** : aucun écran ne change ; une question de fin s'ajoute.

#### Front-end

- **Aucune n'est modifiée par mes propositions.**
- **Appliquées :**
  - D-033 : entrée, sauts, histoire, portrait accéléré, barre pleine sans texte ;
  - D-035 : boutons dessinés ;
  - D-034 : rien à changer dans la page ;
  - D-016 et D-019 : données dans l'appareil, même adresse, même icône ;
  - D-001 (et D-005, suspendu par D-009) : aucune notification, aucun code applicatif ;
  - D-001 : outillage d'essai.
- **Hors des décisions (conventions de `simulation.md`, qui n'est pas une décision) :**
  - V6 et la vue de secours retardée s'ajoutent au §8.8 et au §0 du premier essai ;
  - la clé `verif-2` remplace la clé de vérification.
- **`simulation.md` et les sources du premier essai ne sont pas touchés.**

#### Front-end : outillage d'essai

- **Ce qui est de l'outillage d'essai.** La page, ses tests, son harnais, le programme de contrôle et le fichier scellé du second essai, y compris l'histoire, les sauts et le portrait accéléré. Ce n'est pas l'application (D-001). Trois conditions :
  1. un seul appareil ;
  2. rien ne sort : ni serveur, ni notification, ni requête après le chargement ; le carnet est copié à la main ;
  3. un seul essai : ensuite la page est archivée, et l'étape 6 ne repart pas d'elle.
- **Formes et règles d'essai, pas modèles du produit** :
  - le facteur du portrait ;
  - la barre qui reste pleine ;
  - les seuils des tempéraments et du Pas de Côté ;
  - le graphique, la barre, la frise ;
  - le calcul de l'histoire dans le navigateur. Dans le produit, l'histoire est vécue et gardée, pas recalculée.
- **Les boutons Apple et Google sont dessinés** (D-035, D-016) : aucun programme d'Apple ni de Google, aucun compte développeur, rien de chargé.
- **Ce qui ferait sortir de l'outillage** : une notification, un stockage distant, une mesure envoyée, un second appareil synchronisé, une heure lue sur Internet, une vraie connexion Google ou Apple.

#### Direction artistique

**Aucune n'est modifiée.** Ce que la proposition applique ou laisse en place :
- **D-012.** Aucune couleur nouvelle. La règle 1 de l'univers est appliquée : les positions sont dans la couleur du texte, la teinte marque « toi » (la barre) et le décor (le fil, les doubles filets). Une seule teinte, et aucune paire qui fasse drapeau : Lin, Miel et Brou sont de la même famille chaude.
- **D-014.**
  - Les ajouts ne vont que là où l'annexe de `produit.md` les place : 2.1, 2.7d, 5.11.
  - La boîte sur une carte de révélation est un dessin nouveau, que D-025 couvre.
  - Le « jamais » de 2.7a tient : la réponse du joueur n'est pas marquée. C'est une lecture d'UX, que Cohérence classe parmi ce qui reste à régler ; je la suis.
- **D-022.** L'écran 2.1 ne reçoit que la ligne de règle. L'écran 2.5 ne change pas. [Assembleur, sur arbitrage de l'orchestrateur : la parenthèse sur une variante en 2.5 est retirée.]
- **D-025, D-026.** Ce sont des formes, sans rien décider pour le produit. Le graphique n'additionne jamais plusieurs cercles. La barre n'est visible que du joueur.
- **`projet.md` §9.** Le graphique est immobile, sans nombre ni marque « toi » : la mise en scène reste au minimum que D-025 a accepté. Rien d'institutionnel : ni hémicycle, ni camembert.

*[Assembleur : Contenu a aussi un bloc « Décisions antérieures touchées » ; il n'est pas repris, la consigne limitant la part de Contenu à l'annexe A. Ses conventions changées figurent dans l'annexe A (A.7).]*

### Conventions d'essai (rien n'est décidé pour le produit)

#### Game design

- calendrier et sauts (§0) ;
- histoire de 13 semaines et calibrage par numéro de tirage ;
- R3 : rareté ou distance, selon que le curseur est flou ou net ;
- facteur 3 et son contrôle ;
- barre de 16 crans, entrée comprise, pleine aussi au premier curseur net ;
- moment où le portrait est lu, et règle « devenue nette » ;
- ordre des curseurs nets dans Moi ;
- tempéraments (fenêtre, ancienneté, seuils) ;
- Pas de Côté (seuil 1/5 ; il ne vit pas ensuite) ;
- Le Fidèle pour le nouveau venu ;
- surprise réservée aux textes qui ont un titre ;
- nouveau venu non proposé pour un texte d'avant son arrivée ;
- règle 2.2 bis ;
- α, β et proportions de l'histoire.

#### UX

1. **La place de la barre** : Moi › Portrait seulement. Elle est pleine à 16 réponses, ou dès le premier curseur net (ce second point est à confirmer par Game design). [Assembleur : confirmé, §5.8.] Une fois pleine, elle le reste, sans texte dans le téléphone, avec une note unique dans le cadre.
2. **Le signalement de l'accélération** : la page d'arrivée, puis une note durable dans la bande, sur chaque écran qui montre un curseur du porteur.
3. **1.8 dans l'essai** : trois boutons égaux, sans logo ; 1.8b pour l'e-mail ; ni Apple ni Google ne se connectent, et la bande dit ce qu'ils auraient fait.
4. **Le déclenchement du saut** : depuis 2.7f des jours 4 et 8, par la bande ou par « Jouer » ; « Annuler » est toujours possible.
5. **Le rattrapage** : l'écran Répondre, puis 2.5 réduit ; une réponse est exigée pour chaque texte ; le repère est dans la barre de l'essai.
6. **La numérotation** « Semaine {n} » depuis le début du cercle.
7. **« Abandonner cette journée »** à la place de « Sauter cette journée ».

#### Front-end : conventions techniques et points à accorder

- **Le moment où le portrait est lu (proposition de Front-end ; Game design la confirme ou la remplace au §5.7).** [Assembleur : confirmée, §5.7.]
  - La phrase du jour lit le portrait juste après la réponse, cette réponse comprise.
  - La phrase de la semaine le lit à l'ouverture du dimanche, avant la réponse du dimanche. Elle compte toutes les réponses déjà données, entrée et rattrapage compris.
  - Au second dimanche, cela fait 16 réponses (E1 à E3, puis T1 à T13), ce qui concorde avec le chiffre de Game design. La phrase ne change pas pendant la séance, ce qui garde le carnet et la trace déterministes.
- **Désaccord de chiffres à trancher par Game design : la barre ne peut pas atteindre 16 si elle ne compte que les réponses du jour.** [Assembleur : tranché par Game design : l'entrée compte, N = 16 (§5.8).]
  - Le §5.8 de la version de travail de Game design dit « à chaque réponse du jour validée ». Or le porteur n'en donne que 14 au plus (T1 à T14).
  - Lecture de Front-end : elle compte aussi les trois réponses d'entrée, comme le portrait (règle 15). Sinon, la longueur doit passer à 13.
  - Le code ne dépend pas de ce choix : la longueur et la règle de comptage sont lues dans le fichier et dans la spécification.
- **Avec Game design, sur la portée** : il jugeait que des conventions d'essai suffisaient pour l'histoire. J'avais écrit « hors de portée sans décision ». Je m'y range : mon « hors de portée » visait l'absence de règle. Les coûts ci-dessus supposent ces conventions écrites avant le lot 2.
- **Recalculer ou sceller l'histoire** : Game design et Front-end recommandent de la recalculer, avec V6 et le repli décrits plus haut. Back-end n'a pas donné d'avis sur ce point.
- **Avec Contenu, sur le chemin critique** : chacun désignait le chantier de l'autre. Avec le candidat en deux temps, les textes sortent du chemin critique, à une condition : que la fiche légère arrive le premier jour.

### Désaccords et changements de position

#### Game design

- **Déclenchement du saut** : ma convention 2 (depuis « Fin de la journée ») contre UX (après la révélation du jour 4). Arbitré par l'orchestrateur pour UX ; aligné.
- **Raisons hors tension selon le débat** (Contenu) : accepté. La contrainte sur P (jumeaux) disparaît.
- **Règle interne de D-034** : Contenu écrivait « si possible ». Son annexe tient maintenant « un de chaque côté, ou aucun » (règle 6), la position d'UX et de GD. Il n'y a plus de désaccord.
- **Front-end, « hors de portée »** : levé ; il s'y range (Front-end, « Conventions techniques » [renvoi]).
- **Mes propres changements** :
  - F1 retirée ;
  - seuils de réglage revenus à ceux du premier essai (7/20 au lieu de 2/5) ;
  - « la moitié de rejetés » (spec2) remplacé par la cible de Contenu (7) ;
  - « deux à quatre curseurs nets » remplacé par un critère exact ;
  - R3 sur les cartes du porteur : son curseur jusqu'au jour j − 2, et non « tel qu'il est affiché » (lecture A) ;
  - « texte du rattrapage laissé sans réponse » retiré (UX).
- **Le Pont** : défini texte par texte, et non par tension comme dans `projet.md` §4.

#### UX

- **Le déclenchement du saut (UX contre Game design, convention 2).**
  - Game design le déclenche depuis « Fin de la journée » du mercredi, et jamais depuis le téléphone.
  - Je le place après la révélation du jeudi, depuis la bande et depuis « Jouer » de 2.7f. C'est l'ordre décrit au porteur dans `retours-du-8-octobre.md`, qu'il a validé avec D-033 (« d'abord la révélation…, puis une page »).
  - Avec cet ordre, la page « Fin de la journée » du mercredi viendrait avant la révélation. Le geste naturel à la fin d'une révélation, c'est « Jouer ».
  - Si Game design tient à un déclenchement uniquement par le cadre : « Jouer » afficherait « Pas dans l'essai. », et seul le bouton de la bande mènerait au saut. C'est un toucher perdu de plus, mais aucune règle n'est enfreinte. À arbitrer par l'orchestrateur. [Assembleur : arbitré par l'orchestrateur pour UX ; Game design s'aligne (ses désaccords, ci-dessus).]
- **La barre pleine dès le premier curseur net** : c'est une proposition d'UX. Game design a fixé « pleine à 16 réponses » et n'en a pas parlé. [Assembleur : Game design l'accepte (§5.8).]
- **Le lecteur d'écran sans chiffre** : je suis la règle 2 de la Direction artistique (aucun nombre, même lu). Mais ma lecture en mots (« peu », « une partie », « la plupart ») est moins précise que l'image. Une alternative textuelle équivalente donnerait le compte. C'est à trancher avant la bêta, avec Juridique.
- **Positions retirées de ma version de travail** :
  - la barre en 2.5 (je me range à la Direction artistique) ;
  - le pavé par réponse (même chose) ;
  - la note « Relire » du jour 1 (D-023) ;
  - la question sur la fluidité.
- **Restent ouverts** :
  - les sigles (Contenu les admet là où la place manque ; UX écrit toujours le nom en toutes lettres) ; (arbitrage de l'orchestrateur : jamais de sigle dans l'essai.)

#### Direction artistique

Son désaccord avec Front-end sur la forme du graphique (escalier contre rangées alignées à gauche) est écrit au §7.23 B, à la fin.

### Constats pour l'étape 6 (Game design ; pas des questions)

- un nouveau venu proposé pour un texte d'avant son arrivée ;
- Le Fidèle d'un nouveau venu arrivé en cours de semaine ;
- l'ancienneté nécessaire pour les tempéraments ;
- la lecture « devenue nette » de R2 ;
- ce que devient Le Pas de Côté après son annonce ;
- l'étiquette d'une barre pleine sans curseur net.
- la lisibilité du gabarit « {nom}, {mandat}, {groupe} » avec des noms de groupes en plusieurs mots (UX).

### À dire au porteur

#### Front-end

- Même icône, rien à réinstaller. Le jour de la publication, fermez l'app, puis rouvrez-la.
- Si vous avez supprimé l'icône après le premier essai, rajoutez-la : deux minutes, la page vous guide.
- Au premier lancement, si la partie du premier essai est encore là, la page propose de l'effacer. C'est nécessaire avant de commencer.
- À chaque ouverture, la page recalcule trois mois de vie du cercle : comptez une seconde au plus avant le premier écran.
- Les boutons Apple et Google de l'écran du compte sont dessinés. Ils ne se connectent à rien.
- Ne changez pas la date ni l'heure de l'iPhone. Si la page repart du début, ne rejouez pas : dites-le dans la conversation.
- Passe WebKit faite ou non : les phrases du premier essai, reprises.

#### Autres rôles (renvois)

- Game design : la promesse « quatre ou cinq réponses par tension » ne tient pas pour Tradition/Changement (« Décisions antérieures touchées », Game design, dernière puce) ; le facteur du portrait, s'il change au réglage (§5.9).
- UX et Direction artistique : l'annexe C et les formes du §7.23, montrées à la livraison.

## Limites et doutes

### Game design

- Une limite de Game design sur le portrait du porteur est rangée au fichier caché (`a-ne-pas-ouvrir-2/regles-de-calcul-2.md`). (arbitrage de l'orchestrateur : rangé au fichier caché, à lire après l'essai.)
- **Quinze cartes en tout.** La justesse est un indice, pas une mesure.
- **Les titres du porteur.** Trois manches en semaine 14 et une en semaine 15, contre sept pour chaque personnage : Le Devin lui est presque inaccessible, Le Sans-Faute tout à fait (§6, point 6) ; Le Fidèle et Le Mystère restent à sa portée. C'est une conséquence des sauts (D-033). À dire au dévoilement, pas avant.
- **Les seuils des tempéraments** sont calés sur ces personnages (estimations à la main, à confirmer par le calcul). Une précision sur un tempérament est rangée au fichier caché. (arbitrage de l'orchestrateur : rangé au fichier caché, à lire après l'essai.)
- **Calibrage par numéro de tirage.** Il est honnête parce que fixé d'avance et indépendant du porteur. Mais l'histoire est alors choisie pour être lisible, ce qui rend Le Cercle plus parlant qu'un vrai cercle.
- Une limite de Game design sur la forme des réponses atypiques est rangée au fichier caché (à lire après l'essai).
- **Proportions des raisons de l'histoire** fixées à 1/2 : le premier relevé de Contenu (3 ou 4 paires sur 10, échantillon non représentatif) donne moins. Effet invisible pour le porteur, sauf sur la fréquence des Pas de Côté d'avant l'arrivée, qu'il ne voit pas.
- **Les jumeaux** ne sont plus garantis (contrainte P retirée) : D-024 peut ne pas être éprouvé. Le rapport le dira.
- **Le Pas de Côté du porteur** reste rare : il faut un curseur déjà net, puis une réponse nettement contraire sur un texte dont la révélation est lue. Le badge se verra plus sûrement chez un personnage, s'il en tombe un sur une révélation lue (chiffre constant).
- **À vérifier avec de vraies personnes** :
  - si un nouveau venu se sert du Cercle pour deviner ;
  - si des tempéraments et des titres non expliqués se comprennent ;
  - si un portrait tiré de seize réponses « sonne juste » ;
  - si l'argument inattendu se lit du bon côté ;
  - si la barre fait revenir.

### UX

- **Un seul lecteur, qui connaît les règles.** L'essai ne dira pas ce qu'un vrai nouveau venu comprend de « Le Mystère », « Le Pont » ou des initiales sur les barres. Rien ne les explique dans le produit (constat pour l'étape 6, déjà noté). Le porteur ne pourra pas ressentir ce manque.
- **Constat pour l'étape 6.** Le premier Deviner d'un nouveau venu porte sur un texte qu'il n'a jamais lu. Le produit ne le dit nulle part.
- **La frise** n'a été lue par personne ; elle doit se comprendre en une lecture. La question du saut, au jour 7, la vérifie en partie.
- **La note du portrait accéléré** s'affiche souvent : elle peut devenir du bruit. Je l'ai préférée à un oubli, puisque Juridique et D-033 veulent que la page le dise.
- **Deux messages côte à côte** : « Il faut environ trois mois pour les premiers curseurs nets » (validé) et la note « six fois plus vite ». Ensemble, ils peuvent faire relire.
- **La barre peut être pleine sans aucun curseur net** si le porteur répond souvent au centre ou prend souvent l'argument inattendu (D-034). C'est l'objection de D-026, vécue : la note de la barre pleine ne la masque pas.
- **« Jouer » qui ouvre une page du cadre** est un passage nouveau entre les deux couches. Il peut surprendre une première fois.
- **Les boutons sans logo** paraîtront moins réels qu'un vrai écran de connexion ; l'essai ne dira rien de la confiance qu'inspire un bouton Google sur un jeu politique (bêta).
- **Les durées** (une minute, deux minutes, vingt à vingt-cinq minutes) sont des estimations tirées des médianes du premier essai.
- **La page d'arrivée** fait environ 160 mots : un peu plus qu'un écran d'iPhone SE.
- **À vérifier avec de vraies personnes** :
  - la frise et la page du saut, lues par quelqu'un qui découvre ;
  - si un nouveau venu lit Le Cercle pour deviner ;
  - si l'écran 1.8 à trois voies se comprend sans aide ;
  - si l'argument inattendu se lit du bon côté ;
  - si un portrait net en deux semaines paraît juste.

### Front-end

- **Les temps de calcul sont des estimations.** Rien n'est mesuré tant que le lot 2 n'existe pas. Le repli coûte environ un jour.
- **Trois programmes calculent l'histoire** : la page, le contrôle et le scellement. C'est la principale source de défauts. Les cas chiffrés à la main n'en couvrent qu'une partie, puisque 91 jours ne se refont pas à la main.
- **Pas d'iPhone dans l'équipe.**
  - V6 prouve que l'iPhone retrouve la même histoire, pas que l'affichage est juste.
  - Les hauteurs sont mesurées sans la barre d'état ni la barre d'accueil d'iOS.
- **Deux instances en parallèle** : le gain d'environ un jour suppose que l'interface convenue au lot 1 tienne.
- **La table des lettres qui imitent les nôtres est réduite** : elle couvre les imitations de lettres latines de base, pas toutes les ruses possibles. C'est suffisant pour quatre prénoms.
- **Délais** : des fourchettes, tirées d'un seul précédent.
- **À éprouver avec de vraies personnes** :
  - la frise du saut, lue en une fois ;
  - si le signalement du portrait accéléré est compris ;
  - si une seconde d'attente à l'ouverture gêne ;
  - si des boutons Apple et Google qui ne mènent à rien déroutent ;
  - le graphique de l'avis du cercle entre de vrais proches.

### Direction artistique

- **Rien n'est dessiné en image.** Je n'écris pas de code. Le premier rendu sera celui de Front-end : d'où la relecture des captures (contrôle 6).
- **Les mesures sont des estimations.** La largeur des libellés (environ 110 px) et les hauteurs n'ont pas été mesurées avec les polices réelles. La règle qui fait foi : jamais de troncature ; c'est la colonne qui s'élargit. Si les mots d'UX demandent des caractères absents des polices réduites, Front-end refait la réduction.
- **L'iPhone SE.** Dans le pire cas, la carte du vote défile d'environ 20 px. Le graphique peut alors être sous le bord, et le porteur risque de toucher « Suivant » avant de le voir.
- **L'escalier.** Le porteur connaît le jugement majoritaire et le lira sans peine ; un joueur ordinaire peut ne pas comprendre le fil. L'histogramme simple est prêt en repli.
- **Cercle unanime et « Neutre ».** Si le cercle est unanimement neutre, le graphique montre une seule barre pleine, alors que la convention fait écrire « était partagé ». Le dessin donnera raison à l'objection d'UX sur cette convention.
- **La barre.** L'essai ne dira pas si la barre fait revenir (D-032). Si le porteur ouvre peu Moi, il la verra peu : c'est une donnée de l'essai. [Assembleur, sur arbitrage de l'orchestrateur : l'estimation par réponse, écrite avant D-033, est retirée.]
- **La boîte sur la carte du vote** peut sembler lourde après « Texte rejeté. ». C'est au porteur d'en juger.
- **À tester avec de vraies personnes (bêta)** :
  - le graphique se lit-il en cinq secondes ? (« Qu'a pensé ton cercle ? », « Où est le milieu ? ») ;
  - les joueurs cherchent-ils leur propre réponse dans le graphique ?
  - le graphique fait-il « sondage » ?
  - la ligne de règle est-elle lue ?
  - la barre est-elle vue dans Moi, et que croit-on qu'elle promet ?
  - le Miel rappelle-t-il un parti ? (risque noté en D-012).
- **Ce que l'essai ne peut pas dire** : ce que fait « tu es le seul défavorable » entre de vrais proches. Face à des personnages inventés, cette gêne ne se ressent pas.

## Lots et délai (Front-end)

**À recevoir avant le lot 1 :**
- la spécification relue (Cohérence, Vérificateur), avec les conventions de Game design écrites : calendrier, seuils des tempéraments, R11, R3 sur curseur net, facteur, phrase « nette », moment où le portrait est lu ;
- le schéma, nouvelle version (Back-end) ;
- l'annexe C (UX) ;
- la confirmation de Juridique sur le premier message (§8.2 B), les lignes nouvelles du carnet (§8.12 : « Entrée », « Compte », « Pendant Deviner », bloc de saut) et la note « Qui, durée, droits » (§8.9) : donnée le 9 octobre 2026, sous la condition du contrôle 12 ;
- le schéma de Back-end, nouvelle version (annexe B, V6, trace étendue), avant le lot 1 ;
- le texte complet du dévoilement (UX, sur les phrases de Game design du §8.6) et la ligne sous « {Prénom} décroche Le Pas de Côté. » (Game design), avant le lot 5 ;
- les formes de la Direction artistique : graphique, barre, ligne de règle, frise, page du saut, boutons de 1.8. [Assembleur : la Direction artistique a donné les trois premières (§7.23) ; la frise est décrite par UX (§8.1 ter) ; la page du saut et les boutons de 1.8 n'ont pas encore de forme.]

**Ce qui raccourcit le chemin critique : un fichier candidat en deux temps.**
- L'histoire repose sur des textes abstraits. Elle ne dépend donc pas des textes de Contenu, sauf la fiche légère, que Contenu peut livrer le premier jour.
- **Candidat 1** (vers le jour 2) : l'histoire complète et des textes provisoires, marqués comme tels, jamais publiés. Il permet de comparer l'histoire de la page, du programme de contrôle et du programme de scellement avant la fin des textes.
- **Candidat final** (vers le jour 4) : les vrais textes. On y règle le facteur (environ ¼ de jour), puis on scelle.

**Le travail est confié à deux instances Front-end après le lot 1** : l'une écrit le moteur, l'autre le téléphone et le cadre, sur une interface convenue au lot 1.

| Lot | Contenu | Travail | Instance |
|---|---|---|---|
| 1. Socle | Calendrier en table, clés `partie-2` et `verif-2`, ancienne partie, format d'état 2 (sauts, rattrapage), départ, interface entre moteur et écrans, tests du noyau | ½ à 1 j | A |
| 2. Histoire | Membres selon le jour, toutes les cartes servies à quatre, titres de chaque semaine, curseurs nets, R3 par distance, tempéraments sur deux mois glissants, R11, état à l'arrivée gelé, V6, première mesure de performance | 1,5 à 2 j | A |
| 3. Moteur du porteur | Entrée avec Valentin, sauts dans le journal, D-024, R7, R10, avis du cercle, barre, facteur, phrase « nette », Pas de Côté, E1 | 1 j | A |
| 4. Téléphone | 1.8, ligne de règle, jumeau, 2.7d, barre, 2.6, E3, E4, E5, E7, Le Cercle avec son histoire, écran d'un proche net, Moi, signalement | 1 à 1,5 j | B |
| 5. Cadre | Page d'arrivée, « Jour suivant », « Abandonner cette journée », page du saut et frise, rattrapage, notes, carnet, copie du dimanche, clôture, dévoilement, arrêts | 1 j | B |
| 6. Témoins et construction | Joueurs témoins nouveaux, 200 parties, harnais des sauts, `construire.py` (table des lettres, champs), carnets de référence | 1 j | A et B |
| 7. Contrôles et publication | Contrôles 5 à 14 (j compris), passe WebKit, captures, empreinte, remplacement, preuve 14 g | 1 j | A |

**Délai :**
- **Travail** : 7 à 8,5 jours.
- **Calendrier** : 5,5 à 7 jours entre la spécification validée et la page contrôlée. C'est le chiffre annoncé au porteur dans `retours-du-8-octobre.md`, et il tient.
- **En parallèle** :
  - le programme de contrôle (un autre agent, environ 4 à 5,5 jours, histoire comprise), prêt au lot 6 ;
  - le programme de scellement, qui calcule l'histoire pour la régler ;
  - Contenu (3,5 à 4 jours).
- **Non comptés** : les attentes de « on continue » (D-020) et les coupures dues aux limites d'utilisation (D-018).

**Chemin critique.** C'est la page et le programme de contrôle, plus les textes : le candidat en deux temps retire les textes du chemin. Deux risques peuvent allonger le délai :
- un désaccord sur l'histoire entre les trois programmes (page, contrôle, scellement), qui se règle au lot 2 ;
- un budget de performance dépassé : repli sur une histoire scellée, environ +1 jour.

**Points d'étape (D-020)** : les cinq annoncés au porteur, sans en ajouter.
1. règles relues ;
2. textes prêts. Ce point dit aussi si l'histoire concorde entre les trois programmes : c'est le risque principal, et il est connu à ce moment ;
3. page finie, sur le candidat final ;
4. contrôles finis, WebKit et performance compris ;
5. publication, l'empreinte étant publiée juste avant.

Tout de suite, en plus, si le repli sur une histoire scellée devient nécessaire. Ce serait une information, pas une question (D-005).

## Notes de l'assembleur (version 3)

*Ces notes ne sont pas des règles. La version 2 applique les arbitrages de l'orchestrateur ; chacun est écrit à sa place, sous la forme « (arbitrage de l'orchestrateur : … ; positions : …) ». Restent ici ce qui est encore ouvert.*

### Arbitrages appliqués dans cette version

1. **Abandonner une journée** : jamais aux jours 4 et 8 (position d'UX). Le §0 de Game design est aligné.
2. **Sigles** : jamais de sigle dans l'essai (position d'UX, E5). La ligne de Contenu (A.7, point 2) est ramenée à cette règle.
3. **Étape `definitif`** d'un article ou d'un amendement adopté : jamais ; le texte va en réserve (position d'UX). Contenu en tient compte au relevé (A.7, point 3).
4. **Facteur du portrait** : 2, 3 ou 4 (position de Game design). L'annexe B de Front-end est alignée.
5. **Critères du calibrage** : ceux de Game design, au fichier caché. Le contrôle 3 de Front-end y renvoie.
6. **Barre du portrait** : Moi › Portrait seulement (5.11, puis 4.1 dès qu'un curseur est net), N = 16, pleine aussi au premier curseur net. Alignés : la Direction artistique (§7.23 C, ajout au §9, décisions, limites ; chiffres d'une cible de trois mois et passages sur 2.5 retirés ; captures de la barre pleine et de 4.1 ajoutées) et Front-end (§8.8, tableau).
7. **« Abandonner cette journée »** remplace « Sauter cette journée » dans les sections de Front-end.
8. **Message de 18h** : la troisième forme sert après un abandon (Game design) ; le §7.17 d'UX est aligné.
9. **Semaines** : une phrase de correspondance au §0 (semaines 14 et 15 du cercle = semaines 1 et 2 de l'essai).
10. **Questions du dimanche** : trois au jour 7 (UX) ; Front-end est aligné (§8.8).
11. **« Le saut »** reste un choix de « où avez-vous hésité ? » (UX) ; le §8.3 de Game design est aligné.
12. **Passages sensibles** rangés au fichier caché, avec une ligne de renvoi neutre à leur place : un point des limites de Game design sur le portrait du porteur ; une précision sur un tempérament ; deux phrases du §6, point 7, qui dépendent de l'ordre des textes ; dans A.6, tout sauf le titre de la surprise.
13. **Renvois de Front-end à sa version de travail** : la ligne « D-024, R4… » du tableau du §8.8 et les contrôles 10 et 11 du §9 sont remplacés par le texte de cette version, recopié mot pour mot.

### Restent ouverts

**Désaccords nommés par les rôles eux-mêmes**
- Le lecteur d'écran sans chiffre (UX, §7.14 et ses désaccords) : la règle 2 de la Direction artistique contre une alternative textuelle équivalente ; à trancher avant la bêta. Avis de Juridique (9 octobre 2026) : une alternative équivalente ne dit rien de plus que l'image, donc rien de plus sur les réponses ; aucune objection de protection des données. Le choix relève du design et de l'accessibilité (WCAG 2.1, critère 1.1.1).
- Le Pont défini texte par texte (Game design, §6, point 8) contre « par tension » dans `projet.md` §4.
- La forme du graphique (Direction artistique contre Front-end, §7.23 B) : Front-end ne la reprend pas ; probablement levé, à confirmer.


**Textes qui manquent**
- La forme des trois boutons de 1.8 et celle de la page du saut (Direction artistique ; Front-end les demande avant le lot 1).
- Le moyen pour deux ronds qui se chevauchent dans Le Cercle (Direction artistique et Front-end, §7.16).
- La ligne sous « {Prénom} décroche Le Pas de Côté. » (Game design ; §7.22 et annexe C).
- Le texte complet du dévoilement : Game design l'attribue à UX, UX à Game design (§8.6).
- Le repère de l'arrêt V6 (UX, §8.11 ; demandé par Front-end, §8.8).
- La phrase de la page d'effacement quand les deux parties sont là (UX ; demandée par Front-end, §8.8 et §8.2).
- L'affichage des amendements identiques d'autres groupes (UX ; Contenu, A.7, point 4).
- Le champ « argument inattendu » du fichier scellé, à fixer au schéma (Front-end, annexe B ; Contenu, A.7, point 5 : pas de champ).

**Écarts non arbitrés**
- Dans « Ce qui reste une forme d'essai » de la Direction artistique (§7.23), la question pour le produit « ses places : Moi seul, ou aussi 2.5 et 1.7 » est gardée : elle porte sur le produit, pas sur l'essai.

**Numérotation** : UX numérote ses sections du §7 et du §8 sans suivre `simulation.md` ; elles sont rangées sous les numéros du premier essai, avec renvois rapprochés (notes en tête du §7 et du §8). La section de la Direction artistique, §7.11 chez elle, devient §7.23.

### Ce qui n'est pas repris

- **Contenu** : seulement la partie 1 (annexe A). Ni le relevé des candidats (partie 2), ni ses blocs « Décisions touchées » et « Limites et doutes ».
- **Game design** : ses réponses aux messages des rôles (partie 0) ; le bloc caché C, rangé à part (`a-ne-pas-ouvrir-2/regles-de-calcul-2.md`), avec les passages déplacés.
- **UX** : sa table « Comment lire ces sections » (le calendrier et les libellés de la barre de l'essai sont au §0 et au §8.1).
- Les listes « Sources lues » et « Fichiers utiles » de chaque rôle.
