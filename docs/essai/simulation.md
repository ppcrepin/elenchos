# Spécification de la simulation : essai solo (étape 4)

*Rédigée par Game design le 4 octobre 2026 pour l'essai décidé en D-015 et D-016 (page jouable, quatre personnages inventés, une journée de jeu par séance, 14 jours). Version 4, intégrée par l'orchestrateur. La version 3 (après Cohérence, UX, Juridique) a reçu du Vérificateur « OK avec corrections » ; ses corrections sont appliquées. Les ajouts qui ont suivi (UX : cadre, carnet, typographie ; Front-end : faisabilité ; Game design : mesures ; Back-end : schéma ; Direction artistique : polices et cadre ; Juridique : carnet) ont été relus par Juridique et Cohérence, puis par le Vérificateur (« OK avec corrections » ; corrections appliquées, avec les confirmations de Game design, UX et Juridique). **Figée le 5 octobre 2026** : toute modification passe désormais par le circuit complet. Première modification après le gel, le 5 octobre 2026 : §7.9 (vote de l'Assemblée, UX et Back-end), avec ses renvois en §7.1, §7.8, §9 (contrôles 1, 5 et 11) et dans les annexes A et C ; en circuit avec le lot de textes. Spécification de travail, pas un texte pour le porteur. Personnages, vies et exemples fictifs.*

*Ce fichier se lit sans gâcher l'essai : profils cachés, règles de calcul des personnages (comment ils répondent, devinent, et comment les cartes sont choisies), réponses atypiques, absences et corrigé de fin d'essai sont dans `a-ne-pas-ouvrir/`. Reste ici, assumé : l'heure de jeu des fiches et la ligne « Déjà joué aujourd'hui » (§7.5), comme dans le produit. Le porteur n'a pas à lire ce fichier : « En bref » et « Décisions touchées » suffisent.*

*Ordre de lecture pour un agent qui applique : §0, §5.1 à §5.4, §6, puis `a-ne-pas-ouvrir/regles-de-calcul.md` et `a-ne-pas-ouvrir/schema.md`, puis le reste.*

## En bref

- **Ce qu'on teste** : le porteur joue seul, quatorze jours de jeu, face à quatre personnages inventés, sur une page aux couleurs de La Tablée tirée des maquettes finales.
- **Ce qui est scellé** : les textes et toutes les réponses des personnages, calculés avant la séance 0 ; l'empreinte du fichier est publiée avant de jouer.
- **Ce qui est calculé en direct** : les cartes servies, les devinettes des personnages, les points, les titres et le portrait, qui dépendent des coups du porteur.
- **Comment on contrôle** : un programme écrit à part refait tous les calculs sur des parties jouées par des joueurs témoins (§9) ; les réponses du porteur ne quittent jamais son navigateur (D-016).

Sources : D-006, D-010, D-011, D-014, D-015, D-016 ; `docs/produit.md`, règles 1 à 19 ; `docs/projet.md` §4, §5, §8 et §9 ; `docs/onboarding.md` ; tableau `S` de `docs/maquettes/maquettes-finales.html`.

## 0. Cadre commun

### Les quatre tensions de l'essai

| Code | Pôle 0 | Pôle 1 | Index T8 |
|---|---|---|---|
| S | Sécurité | Liberté individuelle | 0 |
| P | Précaution | Innovation | 3 |
| T | Tradition | Changement | 4 |
| L | Local | National | 7 |

- Écartées pour l'essai : Égalité/Mérite, Solidarité/Responsabilité et État/Marché (jugées trop proches du clivage gauche-droite) ; Souveraineté/Ouverture (immigration, Europe).
- Tradition/Changement est gardée à une condition pour Contenu : aucun texte de mœurs ou de religion qui suive une ligne de parti.
- Les quatre tensions écartées restent affichées dans Moi et dans Le Cercle, floues et immobiles.

### Notations

| Symbole | Sens |
|---|---|
| k | numéro de séance (0 à 15) |
| n | numéro de texte quotidien (1 à 14) ; E1, E2, E3 pour l'entrée |
| s | sens d'un texte : le pôle (0 ou 1) que sert « favorable » |
| v | valeur d'une position (tableau ci-dessous) |
| w | poids d'une réponse dans le portrait (§5.1) |
| c, ℓ | centre et largeur d'un curseur (§5.2) |

### Calendrier (lecture A de C-006, D-010)

| Séance | Jour | Révélation (texte) | Deviner (texte) | Répondre (texte) | En plus |
|---|---|---|---|---|---|
| 0 | entrée | — | « Et Agathe ? Sa réponse ? » sur E1, E2, E3 | E1, E2, E3 | consentement, compte simulé, entrée dans le cercle |
| 1 | lundi | — | « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » | 1 | — |
| 2 | mardi | — (pas de message de 18h) | 1 | 2 | — |
| k = 3 à 14 | … | k−2 | k−1 | k | — |
| 7 | dimanche | 5 | 6 | 7 | titres de la semaine 1 (aucun badge rare possible en semaine 1) |
| 14 | dimanche | 12 | 13 | 14 | badge rare éventuel, puis titres de la semaine 2 |
| 15 | clôture | 13 (pas de message de 18h : la séance s'ouvre sur la révélation) | — | — | fiche du texte 14, questions de fin, export, dévoilement (ordre au §7.4) |

- Séances 3 à 14 : ouvertes par le message de 18h validé (version du dimanche aux séances 7 et 14, D-014).
- Séances 2 et 15 : pas de message de 18h. Le message validé annonce « La révélation d'hier t'attend, et la question d'aujourd'hui » : il serait faux à la séance 2 (rien à révéler) et à la séance 15 (pas de question). En écrire un autre sortirait du validé (C-012).

### Les deux semaines

| | Séances | Révélations comptées (points, titres) | Réponses comptées (Le Fidèle, phrase de la semaine) |
|---|---|---|---|
| Semaine 1 | 1 à 7 | textes 1 à 5 | textes 1 à 6 |
| Semaine 2 | 8 à 14 | textes 6 à 12 | textes 7 à 13 |

- Le texte 7 se répond à la séance 7, après les titres : il compte en semaine 2.
- Le texte 13, révélé à la séance 15, ne compte dans aucune semaine. Le texte 14 n'est jamais deviné.
- Les points repartent de zéro à la séance 8.

**Règles de calendrier (Game design).** Une séance est atteinte dès que la barre l'affiche (« Entrée », « Jour k sur 14 » ou « Clôture »). Le texte quotidien n est révélé dès que la séance n+2 est atteinte, que le porteur ait lu la révélation ou non ; ses points, les titres, les curseurs vus (§5.4), les chiffres « Sur tout l'essai » du §8.4 (seuil de 5 compris) et la ligne « Révélation » du carnet le comptent alors. De même, les titres d'une semaine tombent dès que la séance 7 ou 14 est atteinte, vus ou non. Les textes d'entrée E1 à E3 ne sont jamais des « textes révélés ». L'ouverture d'une séance est le premier toucher du porteur dans cette séance, quel qu'il soit : d'ordinaire le message de 18h (séances 3 à 14), sinon n'importe quel élément du téléphone ou du cadre, « Jour suivant » et « Arrêter l'essai » compris. On ne quitte une séance et on ne copie le carnet que par un toucher : une séance atteinte a donc toujours une ouverture, un bloc de carnet et une entrée dans la trace.

### Positions

| Niveau | Libellé | Valeur v |
|---|---|---|
| 1 | Très défavorable | 0 |
| 2 | Défavorable | 0,25 |
| 3 | Neutre | 0,5 |
| 4 | Favorable | 0,75 |
| 5 | Très favorable | 1 |

Côté : défavorable (1, 2), neutre (3), favorable (4, 5).

### Tirage déterministe

- t(clé) = N / 16⁸, N étant l'entier écrit par les 8 premiers chiffres hexadécimaux de SHA-256(graine + "|" + clé).
- Graine : 16 caractères hexadécimaux minuscules, tirés au scellement et inscrits dans le fichier scellé. Chaîne hachée : graine + "|" + clé, en octets UTF-8, sans fin de ligne.
- Clé : texte UTF-8, champs séparés par « | », sans espace. k, n et semaine (1 ou 2) : entiers décimaux sans zéro initial. Textes d'entrée : E1, E2, E3. id : rang d'affichage de la considération, de 1 à 4. Prénoms tels qu'au §1, majuscule comprise ; le porteur s'écrit « porteur » dans tout champ. Exemple : t("raison|Odile|5|2").
- « Au hasard » ou « départage » = l'élément de plus petit t(clé). Mélanger une liste = la trier par t(clé|élément) croissant. Deux t exactement égaux : la clé la plus petite dans l'ordre des octets UTF-8 passe d'abord.
- Mise en œuvre (Front-end) : la page embarque sa propre fonction SHA-256, synchrone (FIPS 180-4), sans crypto.subtle ; le calcul reste synchrone et marche aussi en fichier local. Au chargement, dans cet ordre : autotest sur les trois exemples de FIPS 180-4 ; décodage du base64 en octets ; empreinte calculée sur ces octets, ceux-là mêmes qui sont lus ensuite, jamais sur un JSON réécrit ; décodage UTF-8 strict et lecture du JSON ; recalcul des trois vecteurs de test. Les cinq étapes sont numérotées V1 à V5 dans cet ordre. Un échec arrête la page, à n'importe quel chargement (§8.11). L'étape V3 (calcul de l'empreinte) n'échoue que sur une erreur interne : l'empreinte n'est comparée qu'à la fin, par le porteur (§8.6).
- N (au plus 2³² − 1) est un entier exact en JavaScript : t se compare par N. Toutes les clés sont en ASCII, ce que la page vérifie ; l'ordre des chaînes y est celui des octets UTF-8. La graine reste une chaîne ; aucun entier du fichier scellé ne dépasse 2⁵³.
- Vecteurs de test : l'agent qui scelle inscrit dans le fichier scellé, pour t("raison|Odile|E2|3"), t("hasard|Nassim|12|porteur") et t("surprise-semaine|2|11"), la chaîne hachée, les 8 chiffres hexadécimaux et N. Le programme de contrôle les reproduit avant tout autre calcul ; une seule différence arrête le contrôle.

### Calcul exact

Toutes les grandeurs sont exactes. Données et constantes valent leur écriture décimale (0,37 = 37/100). Les calculs se font en fractions, sans arrondi (liste des grandeurs concernées : `a-ne-pas-ouvrir/regles-de-calcul.md`). Toute comparaison (seuil, classement, égalité qui déclenche un départage) porte sur la valeur exacte. La virgule flottante n'est pas conforme : deux valeurs égales peuvent y différer d'un rien et changer un départage.

- Mise en œuvre (Front-end) : fractions de deux entiers BigInt, dénominateur positif, réduites après chaque opération. Une donnée ou une constante se construit depuis des entiers ou sa chaîne décimale (« 0.95 » → 95/100), jamais depuis un nombre à virgule : le constructeur le refuse. On ne divise jamais deux BigInt hors du calcul du PGCD (7n / 2n vaut 3n). a/b < c/d se teste par a·d < c·b ; l'égalité compare numérateurs et dénominateurs réduits. Médiane d'un nombre pair : (u + v) / 2, en fractions.
- Une fraction n'est convertie en nombre à virgule que pour dessiner (position et largeur d'un curseur) ; la valeur convertie ne revient jamais dans le calcul.
- Dans la trace et le programme de contrôle, une fraction s'écrit irréductible, « p/q », ou « p » si q = 1, signe au numérateur (forme de str(Fraction) en Python).

## 1. Les quatre personnages

Le cercle s'appelle « Amis » ; Agathe l'a créé ; les quatre personnages sont entrés avant le porteur, qui est le cinquième membre (règle 8 à cinq membres dès la séance 2). **Agathe invite le porteur.**

Fiches visibles par le porteur, dans la fiche « Qui est qui » (hors du téléphone, §8.2) :

| Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu |
|---|---|---|---|---|---|
| Agathe | 46 | sage-femme | Rennes | Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. | 7h40 |
| Nassim | 33 | électricien à son compte | Clermont-Ferrand | Refait des cuisines toute la semaine ; le samedi, il restaure de vieilles motos avec son père. | 12h45 |
| Odile | 69 | pharmacienne retraitée | Ribérac (Dordogne) | A tenu la pharmacie de son bourg pendant trente-cinq ans ; à 68 ans, elle s'est mise au paddle. | 9h10 |
| Valentin | 24 | développeur dans une jeune entreprise | Lyon | Écrit des applications pour téléphone ; le week-end, il court en montagne. | 23h20 |

Chaque personnage a un profil caché, fixé et scellé avant l'essai.

## 2 et 3. Comment un personnage répond et devine

Règles complètes : `a-ne-pas-ouvrir/regles-de-calcul.md`. Ce qui peut se dire : les réponses des personnages sont calculées et scellées avant la séance 0 et ne dépendent en rien de celles du porteur ; un personnage ne passe jamais.

## 4. Les trois réponses à deviner (règle 8)

### 4.1 à 4.4 Choix des cartes et de la carte à raison cachée

Règles complètes : `a-ne-pas-ouvrir/regles-de-calcul.md`. Rien à l'écran ne dit pourquoi une carte est servie.

### 4.5 Affichage

- Ordre des cartes : t("ordre|g|k|auteur"), jamais par surprise (g : le devineur, « porteur » quand c'est lui ; auteur : l'auteur d'origine, avant toute redistribution entre cartes identiques).
- Visages : Agathe, Nassim, Odile, Valentin, toujours dans cet ordre.
- Une carte dont la raison est « aucune » s'écrit : « Défavorable · aucune des quatre raisons ».
- Jamais montrés : le score de surprise, une étiquette « inattendue », qui est absent.

### 4.6 Révélation de la carte à raison cachée (C-011)

Les verdicts validés ne changent pas. On ajoute la ligne « Sa raison : « … » » en dernière ligne de la carte, en même temps que le visage, dans tous les cas sauf « Tu connais ton monde, et ses raisons. ».

| Cas | Carte |
|---|---|
| Bonne personne, raison fausse ou non tentée | **Très favorable · raison cachée** / Ton pari : Nassim, parce que « Ça coûte trop cher ». (ou « Ton pari : Nassim. ») / visage / **Tu connais ton monde.** / Sa raison : « Aucun enfant ne devrait sauter le déjeuner. » |
| Mauvaise personne | … / visage / **C'était Nassim.** / Ça alors ! / Sa raison : « … » |
| Carte passée | Tu avais passé. / visage / **C'était Nassim.** / Sa raison : « … » |
| Sa raison était « aucune » | Sa raison : aucune des quatre. |

- Ponctuation, comme dans toutes les maquettes (1.6, 2.1, 2.7a à 2.7e, 4.3, 5.4) : en fin de ligne (carte, « Ta devinette : », « Sa raison : », « Ta réponse : », lignes de 4.3), la raison garde son point, à l'intérieur des guillemets, et rien ne suit. Dans une phrase (« parce que … », « Ta raison, …, était … »), elle perd son point, et la ponctuation de la phrase vient après le guillemet fermant. Un « ? » ou un « ! » final reste toujours à l'intérieur ; il n'est jamais suivi d'un point, mais une virgule peut le suivre. « aucune » n'est pas une citation : pas de guillemets.
- Ligne rouge respectée (`projet.md` §9, rien de côte à côte) : « Ton pari » est une devinette, pas un avis (note validée de l'écran 1.6). La raison du porteur reste sur la carte des auteurs (2.7e), un autre écran. Si la raison du porteur est « aucune », la ligne « Ta raison… » de 2.7e disparaît.
- Cartes identiques servies ensemble : règle de redistribution des auteurs dans `a-ne-pas-ouvrir/regles-de-calcul.md`, §4.3 ; la révélation montre sous chaque carte l'auteur qui lui revient (C-010).

## 5. Le portrait

### 5.1 Classer chaque réponse

π = le pôle que sert la position (s si favorable, 1 − s si défavorable) ; ρ = le pôle de la raison (« aucun » si hors tension ou « aucune »).

| Cas | Poids w | Vers |
|---|---|---|
| Non neutre et ρ = π (arbitrage net) | 1 | π |
| Non neutre et ρ aucun (penchant) | 0,5 | π |
| Non neutre et ρ opposé (tiraillé) | 0 | — |
| Neutre | 0 | — |

### 5.2 Curseur

- Centre c = (2 + Σ w·π) / (4 + Σ w).
- Largeur ℓ = max(0,95 − 0,07 × Σ w ; 0,25).
- Net dès Σ w ≥ 10.

### 5.3 Dessin

Flou : zone de largeur ℓ centrée sur c, rognée au bord du curseur, jamais décalée. Net : un point à c. Ordre dans Moi : nets, puis flous du plus étroit au plus large ; à égalité S, P, T, L, puis les tensions écartées.

### 5.4 Ce qui est compté

- Portrait du porteur dans Moi : toute réponse dès qu'elle est donnée, entrée comprise (règle 15).
- Curseurs des autres vus par le porteur : seulement l'entrée et les textes ≤ k−2. Sinon un curseur qui bouge trahirait une réponse avant qu'on la devine (conséquence de D-010, lecture A).
- Le Cercle : aucune initiale sur les barres (personne n'est net) ; « Encore flou : » suivi de tous les membres.
- Toucher le visage d'un proche dans Le Cercle ouvre toujours l'écran d'un proche (4.3, D-010, §7.7), jamais la fiche « Qui est qui ».
- Tempéraments : non calculés, non affichés (il faut deux mois).
- Dans l'essai, aucun curseur ne devient net ; c'est voulu.

### 5.5 Les pôles dans les phrases (C-015)

| Tension | Pôle 0 | Pôle 1 | Après « Entre » |
|---|---|---|---|
| S | la sécurité | la liberté | sécurité et liberté |
| P | la précaution | l'innovation | précaution et innovation |
| T | la tradition | le changement | tradition et changement |
| L | la décision locale | la décision nationale | local et national |

- Local/National : le même nom des deux côtés, seul le niveau change. Opposer « règle » à « décision » ferait pencher la phrase (UX).
- Contraction : « à le » devient « au » (« … à la tradition comme au changement. »).

### 5.6 Phrase du jour (juste après chaque réponse quotidienne, jamais à l'entrée ; C-007)

| Cas | Phrase | Statut |
|---|---|---|
| Arbitrage net | « Aujourd'hui, tu as fait passer {pôle gagnant} avant {pôle perdant}. » | validée (`produit.md` §2, écrans 1.13 et 2.5) |
| Penchant | « Aujourd'hui, tu as penché vers {pôle}. » | nouvelle, convention d'essai |
| Tiraillé | « Aujourd'hui, tu as donné du poids à {pôle 0} comme à {pôle 1}. » | nouvelle, convention d'essai |
| Neutre | « Aujourd'hui, tu n'as penché ni vers {pôle 0} ni vers {pôle 1}. » | nouvelle, convention d'essai |

« Tenir la balance égale », proposé par Game design (v1) pour le cas neutre, est écarté par UX : il veut dire « être impartial » et sonne comme un compliment.

### 5.7 Phrase de la semaine (séances 7 et 14 ; C-008)

Elle porte sur les réponses de la semaine (textes 1 à 6, puis 7 à 13). Une réponse qui compte est une réponse de poids w > 0 (§5.1 : arbitrage net ou penchant). Le poids d'un pôle est la somme des w des réponses de la semaine qui vont vers lui. Parmi les tensions qui ont au moins 2 réponses qui comptent dans la semaine, on retient celle où la différence entre les poids de ses deux pôles est la plus grande ; à différence égale, celle au plus fort poids total ; puis S, P, T, L.

| Cas | Phrase | Statut |
|---|---|---|
| Une tension nette (la plus éloignée de 0,5) | « Entre {…} et {…}, tu choisis le plus souvent {…}. » | validée (écran 3.3e) ; n'apparaîtra pas dans l'essai |
| Sinon : tension retenue, différence non nulle (le pôle nommé est celui de plus fort poids) | « Cette semaine, entre {…} et {…}, tu as le plus souvent choisi {…}. » | nouvelle, convention d'essai |
| Tension retenue, différence nulle | « Cette semaine, entre {…} et {…}, tu as penché autant d'un côté que de l'autre. » | nouvelle, convention d'essai |
| Aucune tension n'a 2 réponses qui comptent | « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » | nouvelle, convention d'essai |

- Le curseur flou de la tension retenue s'affiche dessous (aucun curseur dans le dernier cas).
- Retenir d'abord la plus grande différence fait dire à la phrase la chose la plus nette de la semaine, comme la phrase validée retient la tension « la plus éloignée de 0,5 » (Game design).
- Écartés par UX, sur deux propositions de Game design (v1) : « Tes réponses n'ont pas encore tranché » sonne comme un reproche d'indécision, comme « L'Indécis » qu'a remplacé « Le Mesuré » (`projet.md` §4, D-010) ; « Tu n'as penché d'aucun côté », pour l'égalité, était faux : le joueur a penché, des deux côtés.

## 6. Titres et badges

1. Points : un par carte attribuée à son auteur ; raison cachée trouvée = personne et raison justes ; une carte compte dans la semaine où elle est révélée (§0).
2. Le Devin : le plus de points, au moins 1 ; égalité → le plus de raisons cachées trouvées ; puis t("devin|semaine|prénom").
3. Le Mystère : pour X, tentatives = attributions des autres sur les cartes de X révélées dans la semaine, passes exclues ; erreurs = tentatives qui n'ont pas désigné X ; au moins 6 tentatives ; plus forte proportion d'erreurs ; égalité → le plus d'erreurs, puis t("mystere|semaine|prénom").
4. Le Fidèle : tous ceux qui ont répondu à tous les textes de la semaine (1 à 6, puis 7 à 13). Libellés : semaine 1, « ont répondu chaque jour » (« a répondu chaque jour ») ; semaine 2, le libellé validé, « ont répondu les sept jours » (« a répondu les sept jours »).
5. Surprise de la semaine : parmi les textes révélés dans la semaine, la plus forte proportion d'attributions fausses, passes exclues, au moins 4 attributions ; égalité → le plus d'erreurs, puis t("surprise-semaine|semaine|n").
6. Le Sans-Faute : semaine 2 seulement ; chacune des 7 révélations avec au moins une carte, aucune passe, toutes les attributions justes ; raison cachée non exigée ; annoncé à la séance 14, avant les titres.
7. Le Pas de Côté : curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ; ne se déclenchera pas dans l'essai.
8. Séquence du dimanche : révélation habituelle ; badge rare éventuel ; Le Devin ; Le Mystère ; Le Fidèle ; surprise de la semaine ; phrase de la semaine ; fin. Jamais de total, de proportion ni de rang.
9. Titre sans titulaire (personne n'a de point, personne n'a 6 tentatives, aucun texte n'a 4 attributions, personne n'a répondu à tous les textes) : sa carte disparaît, avec sa pastille d'avancement. Jamais « Le Mystère : personne ». Règle générale : une pastille d'avancement par carte réellement montrée ce soir-là.

## 7. Dans le téléphone

Tout ce qui est dans le téléphone est le produit, en « tu », tel que validé (D-014). Ce qui suit précise les cas que les maquettes ne dessinent pas.

### 7.1 Écrans présents

- **Présents** : 1.1 à 1.9, 1.12, 2.1 à 2.7f, 3.1 à 3.3e, 4.2, 4.3, 5.2 à 5.5, 5.7, 5.11.
- **Absents** : 1.10, 1.11, 1.13, 1.14, 1.15, 5.1, 5.6, 5.8, 5.9, 5.10, 5.13, 5.14. Le cercle a cinq membres : ni « Il faut trois joueurs », ni « Inviter un proche » ; de 1.13, seule la ligne « Nouveau texte dans … » sert (séance 1).
- **Précisions** :
  - 2.2 : présent ; « Aucune de ces raisons » y reste, une carte à raison cachée pouvant valoir « aucune ».
  - 4.1 : seul son cadre s'affiche (en-tête Moi, sous-onglets, roue dentée) ; aucun curseur n'étant net, Moi › Portrait montre 5.11 pendant tout l'essai.
  - 5.2 : sans la ligne « Tempérament ».
  - 2.7f : partout sauf à la séance 15.
  - 3.2 : seulement s'il y a un badge.
  - 5.4 : présent, avec sa variante d'avant la révélation, ouverte depuis l'Historique : « Le vote et les auteurs : {jour} à 18h », sans lien officiel. Après la révélation, la ligne du vote suit le §7.9 ; « Proposé par … » passe au paragraphe suivant, comme en 1.6. Avant la révélation, ni vote ni date. Une source : la ligne validée « Sources : extraits des débats » est le lien. Deux sources ou plus : cette ligne devient un intitulé, et dessous une ligne-lien par source, « Extrait 1 », « Extrait 2 », « Extrait 3 » (44 px de haut au moins, nouvel onglet ; une liste pour un lecteur d'écran).
  - 5.12 : géré, si aucun personnage n'a répondu la veille ; son « Suivant » mène à la raison, puis à 2.5 ; le lendemain, la révélation commence au vote.
  - 4.2 : huit barres, dans l'ordre fixe ; avant le premier dimanche, aucun titre sous les visages et pas d'encadré « Surprise de la semaine ».
- **Liens vers un écran absent** : rien n'est masqué ; un toucher affiche dans le cadre, sous le téléphone, « Pas dans l'essai. », jusqu'au toucher suivant. Masquer « + Inviter » changerait un écran validé, et le porteur pourrait y lire une règle du produit. Concernés : « + Inviter » et « Amis ▾ » (4.2) ; « Changer · Créer · Quitter » et l'interrupteur du message de 18h (5.7) ; « Renvoyer le code » (1.9).
- **Croix des écrans de révélation** (2.7a à 3.3e) : dans l'essai, elle affiche « Pas dans l'essai. » ; la révélation se lit jusqu'au bout, pour que les titres et la phrase de la semaine ne puissent pas être sautés (le produit ne dit pas comment rouvrir une révélation fermée, C-016).
- **Autres touchers** : « Plus tard » (1.9) a le même effet que « Valider ». « Relire » (2.1) ouvre une feuille comme 2.2 : « Un vrai texte de l'Assemblée nationale · auteur masqué », le titre, les trois lignes, « ← Retour ». « Voir le scrutin sur le site de l'Assemblée » et « Sources : extraits des débats » sont de vrais liens, ouverts dans un nouvel onglet. Son propre visage dans Le Cercle ne réagit pas. « Qui, durée, droits » (1.3 et 5.7) et « Tout effacer » (5.7) : §8.9.

### 7.2 Entrée (séance 0)

- Message d'Agathe (écran 1.1, signé Agathe ; « Agathe te lance un défi ») → « Défi d'Agathe · Texte 1 sur 3 » → carte de consentement au premier toucher sur une position (écran 1.3, D-006) → raison → « Et Agathe ? Sa réponse ? » → révélation immédiate → textes 2 et 3 → bilan (1.7) → compte (1.8 et 1.9) → carnet (question 1 comprise, si un pari a été faux) ; « Jour suivant » ouvre 1.12.
- Le porteur ne voit que les réponses d'Agathe ; une devinette est juste si elle trouve le bon côté (D-011) ; bilan « 2 sur 3 », ou, à 0 ou 1 sur 3, « Agathe a réussi à te surprendre deux fois. » (ou « trois fois ») à la place du grand nombre (D-006, note de l'écran 1.7).
- Compte simulé : le porteur tape son pseudo en 1.8, seul champ actif (sans saisie automatique du navigateur) ; « Recevoir mon code » reste inactif tant qu'il est vide. L'adresse « toi@exemple.fr » est dessinée, pas un vrai champ, pour que le navigateur ne propose ni de la remplir ni de l'enregistrer. En 1.9 : « Code envoyé à toi@exemple.fr », cases dessinées et remplies, « Valider » actif. Aucun e-mail n'est saisi, envoyé ni conservé. Note dans le cadre, sur 1.8 : « Compte simulé : choisissez juste un pseudo. Il reste dans ce navigateur ; aucun e-mail n'est demandé ni envoyé. »
- Le pseudo s'affiche partout où les maquettes mettent « Marie » (visages et « Encore flou : » du Cercle, 3.2, 3.3a à 3.3c, 5.5, Réglages) ; « Toi » reste seulement dans la légende de 4.3. Il n'entre jamais dans le carnet exporté.

### 7.3 Séances 1 et 2

- **Séance 1.** « Aujourd'hui · lundi », barre d'étapes « Deviner ○ · Répondre ● », bandeau « Tu as rejoint Amis. », puis « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » (texte de `produit.md` §5 pour un cercle d'au moins trois membres ; l'écran 1.12 porte la variante des cercles de deux). L'écran « En attendant » (2.5) affiche « Nouveau texte dans … » au lieu de « Révélation dans … » : rien ne sera révélé à la séance 2.
- **Séance 2.** Pas de message de 18h : la séance s'ouvre sur « Aujourd'hui · mardi », étape Deviner (comme l'écran 2.1). « En attendant » affiche « Révélation dans … ».

### 7.4 Séance 15 (clôture), dans cet ordre

1. Révélation du texte 13, ouverte directement (sans message de 18h), de 2.7a à 2.7e, sans 2.7f. Le pied de la dernière carte dit seulement « {n} point(s) aujourd'hui » : le texte 13 ne compte dans aucune semaine.
2. Question 1 du carnet, s'il y a eu un « Ça alors ! » (pas de question 2 : il n'y a pas de texte du jour).
3. Fiche du texte 14 : le téléphone montre 5.4 comme après une révélation (vote, auteurs, raisons avec leurs députés, sources, lien). Au-dessus, dans le cadre : « Le texte du jour 14 ne sera pas deviné : l'essai s'arrête avant. Voici quand même son vote et ses auteurs. », puis « Continuer ».
4. Dans le cadre : « L'essai est fini. Deux questions, votre carnet à copier, puis le dévoilement. » (même ordre qu'au §8.10).
5. F2, puis F1 (§8.5).
6. « Copier mon carnet » (§8.7), avant le dévoilement : après le dévoilement, on ferme la page.
7. Dévoilement (§8.6).
8. « Tout effacer de ce navigateur » (§8.9).

### 7.5 Deviner et « Déjà joué aujourd'hui »

- Deviner propose toujours les quatre visages (D-011) ; rien ne dit qui n'a pas répondu.
- « Déjà joué aujourd'hui » : journée de 18h à 18h ; r(h) = (h − 18 + 24) mod 24. Un personnage s'affiche s'il a répondu au texte du jour et si r(son heure de jeu) ≤ r(heure réelle du porteur). Si aucun ne s'affiche, la ligne disparaît avec ses visages, et rien ne la remplace : tout remplaçant dirait qui n'a pas joué.

### 7.6 Élision et accords

- Agathe et Odile commencent par une voyelle : « Défi d'Agathe », « Tu as trouvé 2 réponses d'Agathe sur 3 », « Les réponses d'Odile », « Pour qu'Agathe sache que c'était toi… ». Tout gabarit « de {prénom} » ou « que {prénom} » sait élider.
- Accords : « a répondu » / « ont répondu » ; « député » / « députée » ; « 0 point », « 2 points ».

### 7.7 Écran d'un proche (4.3, « ses surprises », D-010)

- « ← Le Cercle » ; le visage ; dessous, « {Titre} cette semaine » s'il en a un, sinon rien ; « ● Toi   ◎ {Prénom} » ; huit superpositions dans l'ordre fixe (curseurs du proche : entrée et textes déjà révélés, §5.4).
- « Ses surprises », puis au plus deux lignes, la plus récente en haut. À gauche : « {Titre du texte} : {Position}, « {raison} » » (ou « …, aucune des quatre raisons »). À droite : « Tu pensais à {prénom} ». « Voir tout », seulement s'il y en a plus de deux, déplie les autres lignes sur place. Toucher une ligne ouvre 5.4.
- Une surprise = une carte de ce proche, déjà révélée, que le porteur a attribuée à quelqu'un d'autre. Exclus : les cartes passées, la bonne personne avec une raison fausse, les textes d'entrée.
- Sans aucune surprise, le titre « Ses surprises » disparaît aussi : « Pas encore de surprise » serait un score de zéro déguisé.
- Aucun nombre ; jamais la réponse du porteur à côté. Différence avec la maquette 4.3, dont une ligne n'a pas de raison : dans l'essai, la raison est toujours écrite.

### 7.8 Typographie à l'affichage (UX)

Les gabarits de cette spécification, les maquettes et le fichier scellé restent écrits en typographie simple. Au moment de l'affichage, la page et le programme de contrôle appliquent à chaque chaîne, avant d'y insérer le pseudo, ces règles dans cet ordre :
1. ' (U+0027) devient ’ (U+2019) ;
2. une espace U+0020 placée juste avant « ? », « ! » ou « ; » devient une espace fine insécable U+202F ;
3. une espace U+0020 placée juste avant « : », juste après « « », juste avant « » », juste avant « · » ou juste après « ← » devient une espace insécable U+00A0 ;
4. dans un compte à rebours « {h} h {mm} », les deux espaces deviennent U+00A0 ;
5. dans une date « {j} {mois} {aaaa} » (§7.9), les deux espaces deviennent U+00A0.

Le carnet n'applique que la règle 1. « 18h » reste tel quel (validé, D-014). La trace enregistre les phrases sous leur forme affichée. Aucun mot validé ne change ; seule la forme de l'apostrophe et de l'espace avant « ? », « ! », « ; » se voit (par exemple dans le message de 18h, « Ça alors ! », « Et Agathe ? Sa réponse ? »). Raison : avec des espaces ordinaires, un « ? » ou un « » » peut se retrouver seul en début de ligne sur un téléphone de 360 px ; et en Alegreya l'apostrophe droite ressemble à une marque de machine à écrire. À dire au porteur à la livraison.

### 7.9 Le vote de l'Assemblée (UX ; Back-end pour le fichier scellé)

Raison : la vérification des textes a montré que « Texte adopté. » seul serait faux pour un texte (seul son article unique a été voté) et trompeur pour d'autres (votes de première lecture, votes de 2023 : on croirait la loi en vigueur). Le gros titre de 2.7d répond toujours à « Et l'Assemblée ? » avec les mots validés ; une ligne s'ajoute dessous, au passé et datée, pour qu'aucune phrase ne devienne fausse pendant l'essai (le Sénat peut voter entre-temps).

**Pièces** (gabarits en typographie simple ; §7.8 à l'affichage) :
- {date} : « {j} {mois} {aaaa} », tiré de `vote.date` ; jour sans zéro initial, « 1er » pour le premier du mois ; mois en minuscules, pris dans une table fixe (janvier … décembre), jamais dans la langue du navigateur (contrôle 5).
- {étape}, selon `vote.etape` : `navette` → « Le Sénat devait encore voter. » ; `definitif` → « C'était le vote définitif du Parlement. » ; `aucune` → rien (et pas d'espace final).
- {article}, pour `sans_vote_ensemble` seulement : « Le {date}, son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte. »

| Où | `adopte` / `rejete` | `sans_vote_ensemble` |
|---|---|---|
| 2.7d, carte du vote (aussi le lendemain d'un 5.12) | « Et l'Assemblée ? », gros titre « Texte adopté. » ou « Texte rejeté. » (inchangés) ; dessous, en texte courant : « Le {date}. {étape} » | gros titre « Texte ni adopté ni rejeté. », puis {article} |
| 1.6, révélation immédiate (E1 à E3) | « L'Assemblée : texte adopté le {date}. {étape} » (ou « rejeté ») | « L'Assemblée : texte ni adopté ni rejeté. {article} » (ne sert pas dans l'essai) |
| 5.4, fiche après la révélation (texte 14 compris, §7.4) | « Vote : adopté le {date}. {étape} » (ou « rejeté ») | « Vote : ni adopté ni rejeté. {article} » |

**Règles :**
- Jamais de décompte pour/contre (beaucoup de votes se font à main levée) : le lien du scrutin donne les chiffres quand ils existent.
- La date fait partie du vote : jamais avant 18h. 2.1, « Relire » et la 5.4 d'avant la révélation restent sans date (lecture A, D-010) ; une date situerait le texte dans une majorité et aiderait à deviner le vote.
- Pas de « première lecture » : mot de procédure, faux pour une deuxième ou une nouvelle lecture ; les deux phrases d'étape couvrent toutes les lectures.
- Combinaisons permises (Back-end) : `adopte` avec `navette` ou `definitif` (jamais sans étape) ; `rejete` avec `navette` ou `aucune` ; `sans_vote_ensemble` avec `aucune`.
- Conditions de vérité, vérifiées par Contenu sur la page du scrutin et le dossier législatif (annexe A) : `navette` = après ce vote, le Sénat devait encore se prononcer (transmission au Sénat, commission mixte paritaire à venir, ou texte de commission mixte paritaire voté d'abord par l'Assemblée) ; `definitif` = dernier vote du Parlement sur ce texte (texte de commission mixte paritaire voté après le Sénat, adoption conforme au texte du Sénat, lecture définitive) ; `aucune` = le rejet a mis fin à l'examen, ou l'issue est `sans_vote_ensemble` ; `sans_vote_ensemble` = le texte n'a qu'un article, cet article est adopté, la séance s'arrête sans vote sur l'ensemble (dans l'essai, le texte 11 seul ; son lien mène au scrutin sur l'article). La date est celle de la page du scrutin, sans correction.
- Si aucune case n'est exacte pour un texte, Contenu ne force pas : le texte revient à UX ou passe en réserve.

**Exemples** (dates inventées, sauf les textes nommés) : texte 11 → 2.7d « Texte ni adopté ni rejeté. » / « Le 14 mars 2024, son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte. » ; E3 → 1.6 « L'Assemblée : texte adopté le 23 juin 2026. Le Sénat devait encore voter. » ; texte 7 → 2.7d « Texte adopté. » / « Le 4 mai 2023. Le Sénat devait encore voter. » ; un vote définitif → « Texte adopté. » / « Le 12 mars 2025. C'était le vote définitif du Parlement. » ; un rejet qui clôt l'examen → « Texte rejeté. » / « Le 30 janvier 2025. »

## 8. Le cadre de l'essai, hors du téléphone

### 8.1 Règle

Tout ce qui est en « vous » vit hors du téléphone : fond neutre, sans ronds de serviette ni typographie de La Tablée. Cela vaut pour la barre de l'essai, la fiche « Qui est qui », les notes (« Pas dans l'essai. », compte simulé, texte 14), le carnet, la clôture, le dévoilement, l'export et l'effacement.

Consigne visuelle (Direction artistique) : deux températures. Le téléphone est chaud (lin, brou, caramel, Alegreya) ; le cadre est gris froid, en police du système, comme la couche autour du téléphone dans les maquettes.
- Fond #EEF0EE (sombre #141516) ; panneaux #FFFFFF (#1D1E20), filet 1 px #C4C7C3 (#3D3F41), rayon 8 px, sans ombre.
- Texte #1C1D1F (#EBECE9) ; secondaire #676A67 (#A3A6A2) ; niveau AA.
- Un seul accent, le bleu d'annotation des maquettes, #23729C (#86C4E6) : liens, anneau de focus, filet gauche de 3 px des notes, un seul bouton mis en avant par vue. Le bleu n'entre jamais dans le téléphone ; les couleurs de La Tablée n'en sortent jamais.
- Police du système, 15 px, interligne 1,45 ; barre à 14 px ; rien sous 13 px ; graisses 400 et 600, jamais d'italique ; chiffres tabulaires.
- Le téléphone garde son contour à toutes les largeurs ; le cadre n'écrit jamais dedans ni par-dessus. Barre au-dessus ; notes, carnet et « Jour suivant » en dessous, à 24 px. Boutons du cadre bordés (1,5 px, rayon 8 px, 44 px de haut au moins), jamais pleins comme ceux du téléphone.
- Interdits dans le cadre : Alegreya, lin, brou, caramel, miel, double filet, ronds de serviette (dans « Qui est qui », les prénoms sont en gras, sans rond), ombres, halos, palette du soir.
- Test : texte masqué, chaque élément se range, à sa seule couleur et à sa seule police, côté téléphone ou côté cadre.

### 8.2 Barre, fiche « Qui est qui » et premier message

- Barre permanente : « Jour 3 sur 14 · mercredi » (« Entrée » à la séance 0, « Clôture » à la séance 15) ; juste après, le lien discret « Arrêter l'essai » (§8.10) ; un bouton « Qui est qui ? » ; le bouton « Jour suivant » en fin de séance, toujours actif (désactivé seulement le temps du passage, après le premier toucher), jamais à côté de « Arrêter l'essai ». À la clôture, ni « Arrêter l'essai » ni « Jour suivant ».
- « Jour suivant » alors que la journée n'est pas finie : confirmation dans le cadre, « Passer au jour suivant sans répondre ? » (ou « sans finir de deviner ? », ou « sans finir de deviner ni répondre ? ») ; « Ce que vous n'avez pas fait aujourd'hui restera ainsi : vous ne pourrez pas y revenir. » ; « Annuler » · « Aller au jour suivant », même poids visuel (libellé distinct du « Passer » des cartes, que compte le carnet). Une position sans raison compte comme pas de réponse. Les conséquences ne sont pas listées : le porteur les découvre comme un vrai joueur. Ensuite : le texte reste sans réponse du porteur (pas de phrase du jour, pas de ligne dans l'Historique, Le Fidèle perdu pour la semaine, les personnages devinent sans sa carte) ; les cartes non attribuées comptent comme passées. La liste à couvrir des parties témoins (§9 bis du fichier caché) comprend ce cas.
- Une fois, à la séance 1 : « Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez. » Le compte à rebours reste affiché dans le téléphone : c'est l'écran testé.
- Une fois, au début de la séance 0 (texte de Juridique, mis en forme par UX, puis corrigé et validé par Juridique) :
  « Vos réponses restent dans ce navigateur : la page n'envoie rien, pas même à l'équipe. Pour que personne d'autre ne les voie, et pour ne pas les perdre :
  - Jouez toujours sur le même appareil, que vous ne partagez pas, et ouvrez la page toujours de la même façon (même navigateur, ou toujours l'application Claude). Évitez la navigation privée : elle oublie tout à la fermeture.
  - Sur un appareil Apple, ne restez pas plus de sept jours sans revenir sur la page : au-delà, l'avancement peut s'effacer.
  - Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.
  - Dans la conversation, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit (vos phrases, votre portrait). Une capture d'écran sort du navigateur : avant d'en envoyer une, vérifiez qu'on n'y voit rien de tout cela. »
- La fiche s'ouvre d'elle-même une fois, au début de la séance 0, avant le message d'Agathe ; ensuite, par le bouton seulement, jamais depuis Le Cercle. Ouverte depuis Le Cercle, elle passerait pour une fonction du produit, qui ne montre jamais l'âge, le métier ou la ville d'un proche.
- En-tête : « Qui est qui · fiche d'essai. Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées. »
- Une carte par personne, dans l'ordre des visages. Exemple : « Agathe, 46 ans · sage-femme, Rennes. Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. Joue d'habitude vers 7h40. C'est elle qui vous invite. »

### 8.3 Carnet de bilan (chaque séance)

Sous le téléphone, après « En attendant » (séances 1 à 14 ; séance 0 : §7.2 ; séance 15 : §7.4), avant le bouton « Jour suivant » : un seul écran, une touche par question, environ 10 secondes (estimation). Les questions ne bloquent pas le passage au jour suivant.

1. Seulement s'il y a eu au moins un « Ça alors ! » à la révélation (à l'entrée aussi, sur l'un des trois textes, écran 1.6) : « Vos erreurs à la révélation : » J'aurais pu trouver · Je ne pouvais pas trouver · Les deux (ce dernier choix seulement s'il y a eu au moins deux erreurs).
2. « « {titre du texte du jour} » et ses quatre raisons : » Compris du premier coup · Compris en relisant · Pas tout compris. À la séance 0 : « Les trois textes et leurs raisons : ». Pas à la séance 15.
3. « Votre moment préféré : » parmi les moments vécus, dans l'ordre où ils ont eu lieu :

| Séance | Choix proposés |
|---|---|
| 0 | Donner mon avis · Deviner · La révélation · Aucun |
| 1 | Donner mon avis · Ma phrase du jour · Aucun |
| 2 | Deviner · Donner mon avis · Ma phrase du jour · Aucun |
| 3 à 6, 8 à 13 | La révélation · Deviner · Donner mon avis · Ma phrase du jour · Aucun |
| 7 et 14 | La révélation · Les titres · Ma phrase de la semaine · Deviner · Donner mon avis · Ma phrase du jour · Aucun |
| 15 | pas de question 3 |

« Les titres » regroupe le badge rare éventuel, les trois titres et la surprise de la semaine. « Ma phrase de la semaine » reste à part : c'est le seul moment de la semaine consacré au portrait, auquel le porteur tient (D-003).

### 8.4 Mesures automatiques (rien de politique)

Règle (Juridique) : un chiffre qui changerait si le porteur avait répondu autrement à un texte n'est jamais donné texte par texte. L'équipe connaît les réponses scellées des personnages et les règles : un tel chiffre, par séance, se recouperait.

Constat (Game design) : les cartes servies au porteur ne dépendent que du fichier scellé (sa propre réponse n'entre pas dans le calcul). Un chiffre qui ne porte que sur ces cartes est donc le même pour tout joueur : il décrit le fichier, pas l'essai. Ces chiffres vont au rapport de scellement (§9), pas au carnet. Inversement, ce que le porteur fait de ces cartes peut être donné séance par séance sans sortir de la règle ci-dessus ; seules la durée de Répondre et le nombre de « Relire » y font exception, risque assumé ci-dessous.

- **Ouverture d'une séance** : le premier toucher du porteur dans la séance (aux séances 3 à 14, le toucher du message de 18h, l'équivalent de l'ouverture de la notification dans le produit), pas l'affichage qui suit « Jour suivant ». Les jours écoulés, l'heure d'ouverture et la durée de la séance partent de ce toucher. La durée de la séance court jusqu'au dernier toucher de la séance (« Jour suivant » ou « Arrêter l'essai » confirmés compris) ; celle de Deviner, de l'affichage de l'écran au dernier toucher qui y a eu lieu ; celle de Répondre, comme au §8.12.
- **Par séance** (ce que le porteur fait, pas ce qu'il répond) : jour et heure d'ouverture (à l'heure près) et jours écoulés depuis la précédente (différence des dates locales de Paris), seule mesure du retour observée plutôt que déclarée ; durées de la séance, de Deviner et de Répondre ; nombre de « Relire » et de « Passer » (le bouton d'une carte de Deviner, seulement) ; à chaque révélation, le verdict de chaque carte de sa manche dans l'ordre d'affichage (juste avec la raison ; juste ; faux ; passé, cartes laissées sans attribution comprises) et la raison cachée tentée ou non. Ces verdicts ne dépendent pas de ses réponses (relu par Juridique : conforme, à condition que le contrôle 12 le prouve) ; avec le fichier scellé, ils permettent au bilan de croiser ses erreurs avec la question 1 du carnet. Risque assumé : la durée de Répondre et le nombre de « Relire » sont attachés à un texte ; ils disent l'hésitation, pas la réponse.
- **Par semaine** (résultats affichés dans le jeu) : titulaires du Sans-Faute (semaine 2), du Devin, du Mystère et du Fidèle ; le porteur s'y écrit « vous ». La surprise de la semaine et Le Pas de Côté n'y figurent pas : la première nomme un texte et dépend de sa réponse à ce texte ; le second dirait qu'une de ses réponses va contre son portrait.
- **Sur l'ensemble de l'essai**, un seul chiffre chacun, jamais par séance, par texte, par tension ni par personnage, et « pas de chiffre » tant que le porteur a répondu à moins de 5 des textes révélés (seuil confirmé par Juridique : sinon un arrêt précoce ramènerait ces chiffres à un chiffre par texte) ; la deuxième ligne vaut aussi « pas de chiffre » si aucune carte du porteur n'a été servie à un personnage :
  - justesse des personnages entre eux : cartes des manches des personnages dont l'auteur (après redistribution) est un personnage, attribuées juste, sur ces mêmes cartes ; manches révélées seulement ;
  - justesse des personnages sur les réponses du porteur : la même chose pour les cartes dont l'auteur est le porteur, en comptes bruts (Juridique : un pourcentage ne cacherait rien, le nombre de cartes se retrouvant avec le fichier scellé ; et ces deux nombres, cumulés sur au moins 5 textes, disent sa constance, pas ses réponses) ;
  - titres attribués par tirage au sort faute de départage (Devin, Mystère, surprise de la semaine ; semaines 1 et 2 ; de 0 à 6) : s'il vaut 0, la convention « départage final par tirage » n'a rien décidé (C-013).
- **Jamais** : une position, une raison, une phrase du jour ou de la semaine, un curseur, le pseudo du porteur ; ni un chiffre lié à un texte précis qui dépend de ses réponses (par exemple « au texte 5, Valentin a trouvé la réponse du porteur ») ; ni le mot « atypique » ou une mesure des réponses atypiques, qui dévoileraient un mécanisme caché.

### 8.5 Fin d'essai (séance 15, avant le dévoilement)

1. F2, posée d'abord pour ne pas être colorée par l'effort de la grille : « Au fil des deux semaines, deviner était : » De plus en plus amusant · Toujours aussi amusant · De moins en moins amusant · Jamais amusant.
2. F1 : « Où placez-vous chacun ? D'après ces deux semaines. Même si vous hésitez, choisissez. » Un bloc par personne (Agathe, Nassim, Odile, Valentin) ; dans chaque bloc, quatre lignes S, P, T, L avec les étiquettes du curseur aux deux bouts et trois ronds entre elles (« Sécurité ○ ○ ○ Liberté individuelle »), le rond du milieu étiqueté « Au milieu » une fois en tête de bloc. Seize touches, environ une minute (estimation). Au hasard, environ 5 cases justes sur 16. Corrigé : `a-ne-pas-ouvrir/profils.md`.

F1 et F2 ne disent rien des opinions du porteur : F1 porte sur des personnes inventées (D-015), F2 sur le jeu. Elles vont dans le carnet, F1 personnage par personnage.

### 8.6 Dévoilement

- D'abord ce qui se lit : profils, réponses atypiques texte par texte, absences, corrigé de F1 face aux choix du porteur. Ces textes restent à écrire, avec UX, avant de construire la page.
- Ensuite, une partie repliée « Pour le contrôle » : graine, fichier scellé, et :
  « Empreinte de ce fichier : » suivie de l'empreinte (présentation au §8.11), puis « Comparez-la, ligne par ligne, avec celle publiée dans la conversation le {date} à {heure} : elles doivent être identiques. Si un seul caractère diffère, dites-le dans la conversation. » (si la date n'est pas connue à la construction : « avec la dernière empreinte publiée dans la conversation avant votre première séance »).
- La page affiche l'empreinte, calculée à l'affichage sur les octets décodés du fichier embarqué, jamais écrite en dur ; elle n'affirme pas elle-même qu'elle correspond.

### 8.7 Export

Un seul export, « Copier mon carnet » (D-016), proposé à la clôture, dans le parcours « Arrêter l'essai » et dans la confirmation de « Tout effacer » (« Copier mon carnet d'abord ») : les réponses au carnet (§8.3), les mesures et chiffres du §8.4, F1 et F2, la raison d'un arrêt, rien d'autre (gabarit exact au §8.12). Jamais une position, une raison, une phrase du jour ou de la semaine, un curseur ni le pseudo du porteur. Dans tous les cas, le texte copié s'affiche en entier avant la copie : le porteur voit ce qu'il donne. Il se termine toujours par une ligne « Fin du carnet ». Après une copie réussie, et seulement alors : « Carnet copié : collez-le dans la conversation. » Le carnet s'affiche dans une zone de texte en lecture seule. « Copier mon carnet » appelle la copie directement dans le geste, sans attente avant l'appel ; en cas d'échec, une seconde méthode de copie sur la zone sélectionnée ; si les deux échouent, la page sélectionne tout le texte de la zone (avec « Tout sélectionner ») et affiche : « La copie automatique n'a pas fonctionné. Sélectionnez tout le texte ci-dessous, jusqu'à « Fin du carnet », copiez-le, puis collez-le dans la conversation. » Aucun autre export. Une réponse que le porteur citerait dans la conversation n'entre jamais dans le dépôt. Le dépôt du projet est public sur GitHub (vérifié le 4 octobre 2026) : le carnet tel quel y publierait, pour toujours, les jours, heures et durées de jeu du porteur. Décision du porteur (D-017) : le carnet reste dans la conversation ; le dépôt ne reçoit que le bilan chiffré qui en est tiré, sans dates ni heures.

### 8.8 Ce que la page garde, et où

- Les coups du porteur (positions, raisons, devinettes, passes), son pseudo, son consentement, son carnet, F1, F2, la séance et l'étape atteintes sont gardés dans le stockage de son navigateur, et nulle part ailleurs. Son portrait, les cartes, les points et les titres ne sont pas gardés : ils sont recalculés à chaque ouverture à partir des coups et du fichier scellé. La page n'envoie rien (D-016).
- Voie principale : la page publiée en privé sur claude.ai. Selon la documentation de l'outil de publication (consultée le 4 octobre 2026), chaque page publiée a sa propre origine ; ce qu'elle garde reste dans le navigateur de celui qui la consulte, survit aux nouvelles versions publiées à la même adresse, et n'est visible ni des autres visiteurs ni des autres pages ; le fichier construit est publié tel quel, depuis le disque, sans être recopié. Après publication, la page servie est relue et comparée octet pour octet au fichier construit ; si la plateforme l'a modifiée (enveloppe ajoutée, balises déplacées), la page de jeu est publiée comme fichier annexe servi tel quel, et la comparaison est refaite.
- Repli, si la voie principale échoue : le fichier HTML, ouvert sur un ordinateur, dans le navigateur habituel du porteur ; toujours le même fichier, au même endroit. Limites du repli : ordinateur seulement ; Chrome partage probablement le stockage entre fichiers locaux (un autre fichier HTML local pourrait le lire : à soumettre à Juridique avant d'y recourir) ; Firefox et Safari le gardent peut-être propre à chaque fichier (renommer ou déplacer le fichier ferait perdre la partie).
- Le stockage peut revenir vide en navigation privée (ce qui ne se détecte pas) ou si les données du site sont effacées. Safari efface le stockage d'un site après sept jours d'utilisation de Safari sans visite. L'application Claude peut ouvrir les pages dans sa propre vue, avec un stockage distinct de celui du navigateur : le porteur ouvre toujours la page de la même façon (même appareil, même navigateur ou même application). Risque sérieux sur iPhone et iPad (Juridique) : si la page s'affiche dans un cadre intégré à claude.ai, sous une autre origine, Safari (et tout navigateur sur iPhone) range son stockage à part et peut ne pas le garder après la fermeture ; « jusqu'à ce que vous les effaciez » deviendrait faux. Le porteur jouera sur iPhone ou iPad (D-017) : la page-test du contrôle 14 le vérifie sur son appareil, ouverte comme il l'ouvrira (le seul geste qu'on lui demande : ouvrir un lien, fermer Safari, le rouvrir plus tard, et dire ce que la page affiche) ; si le risque se confirme, la page s'ouvre seule, hors cadre, ou l'on passe au repli.
- Mise en œuvre (Front-end) : clés préfixées « elenchos-essai: », jamais d'effacement global du stockage. Chaque coup validé est écrit aussitôt ; après un rechargement, la page reprend à l'étape suivante et ne fait jamais rejouer un coup validé. L'état porte un numéro de format et un compteur d'écritures, vérifié avant chaque écriture : si un autre onglet l'a changé, la page s'arrête et propose « Reprendre ici », qui la recharge (§8.11). Quand on revient sur un onglet, la page relit l'état gardé avant tout toucher et se recharge s'il a changé, ce qui rend cet arrêt rare. « Jour suivant » est désactivé dès le premier toucher. Au chargement, la page écrit, relit et efface une clé d'essai ; si le stockage ne marche pas, l'entrée ne commence pas (§8.11). La persistance du stockage est demandée quand le navigateur le permet, sans compter dessus.
- Interdits dans la page : le stockage d'artefact de claude.ai (gardé chez Anthropic ; en mode partagé, visible de tous les visiteurs) ; l'appel à Claude, les connecteurs, le téléchargement ; tout script, style, police ou image venus d'ailleurs (Google Fonts, cdnjs, unpkg, jsDelivr…) ; tout envoi (fetch, XHR, WebSocket, formulaire, balise). Seules sorties : les liens que le porteur touche lui-même (scrutin, sources).
- Politique de sécurité, première balise après la déclaration d'encodage : `default-src 'none'; script-src 'sha256-…'; style-src 'sha256-…'; font-src data:; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`, empreintes des blocs calculées à la construction, ni 'unsafe-inline' ni 'unsafe-eval' ; puis aucune transmission de l'adresse d'origine (referrer). Liens externes ouverts sans lien avec la page (noopener, noreferrer). En conséquence : aucun attribut style ni gestionnaire d'événement écrit dans le HTML ; les positions des curseurs passent par le style de l'élément ; le base64 se décode localement, jamais par une requête ; le pseudo est inséré comme texte, jamais comme HTML. Cette politique bloque les chargements et les envois ordinaires, pas une navigation : la preuve reste le contrôle 5 et le panneau réseau (contrôle 14 a).
- Polices embarquées en woff2, réduites, six faces (Direction artistique) : Alegreya gras 700 (titres, verdicts, grand chiffre du bilan, en-têtes) ; Alegreya italique 500 (initiales des ronds de serviette, « E » de l'icône de notification) ; Alegreya italique gras 700 (initiales sur les curseurs) ; Alegreya Sans 400 (texte courant) ; Alegreya Sans gras 700 (bouton principal, position sur les cartes, question, bandeau, onglet actif, heure de l'écran verrouillé) ; Alegreya Sans italique 400 (la raison devinée sur la carte, « Ta devinette : « … » », seulement). Ce vrai italique remplace le faux italique que les maquettes finales affichaient par oubli de chargement : l'intention validée (annotation de l'écran 2.2) est rétablie, à citer au porteur à la livraison. Non embarqués : Alegreya Sans 500, Alegreya romain, Alegreya Sans gras italique, IBM Plex Mono ; la barre d'état du téléphone passe à la police du système, en chiffres tabulaires (léger écart visible avec les maquettes, à citer aussi). La fabrication de faces par le navigateur est bloquée (font-synthesis), pour qu'un oubli se voie au lieu d'être masqué.
- Caractères : latin de base, latin-1, latin étendu A, ponctuation française (dont l'espace fine insécable), €, les signes de l'interface présents dans ces polices (←, ▾, ●, ○, ◎, ✓ ; ceux qu'elles n'ont pas restent aux polices du système, ⚙ forcé en affichage texte), et tout caractère des textes scellés, vérifié à la construction ; fonctions OpenType kern, liga et tnum gardées ; chiffres comparés à l'œil avec les maquettes après réduction. Licence SIL Open Font License 1.1 : son texte complet et les mentions de copyright sont recopiés en commentaire dans la page ; si le fichier OFL.txt de la version employée réserve un nom de police, la police réduite prend un autre nom interne. Le cadre emploie les polices du système. Poids estimé de la page : 300 à 500 Ko.
- La page reste privée : jamais partagée, ni par lien public ni dans une organisation (« publier » veut dire ici mettre en ligne une version privée). Le porteur joue sur une version figée.

### 8.9 « Tout effacer » et « Qui, durée, droits »

La carte de consentement validée (1.3) promet « Tu peux tout effacer, quand tu veux » : l'essai tient cette promesse.

- **Où** : dans le téléphone, Moi › Réglages › « Tout effacer » (écran 5.7), rendu actif ; dans le cadre, à la clôture et à la fin du parcours d'arrêt, après le dévoilement (§7.4, point 8) : effacer avant détruirait F1, que le dévoilement compare au corrigé ; avant le dévoilement, seul « Copier mon carnet » est proposé. Jamais exécuté sans confirmation.
- **Quoi** : tout ce que la page a gardé (positions, raisons, devinettes, portrait, pseudo, consentement, carnet, F1, F2, séance atteinte). La page revient à l'entrée, comme à une première visite. Le carnet déjà copié n'est pas touché : il ne contient aucune réponse.
- **Confirmation pendant l'essai**, dans le cadre : « Tout effacer ? » ; « Vos réponses, votre carnet et votre avancement seront supprimés de ce navigateur. C'est définitif. Si vous recommencez, vous connaîtrez déjà les réponses des personnages : l'essai ne vaudra plus comme test. » ; boutons « Annuler » (mis en avant) · « Copier mon carnet d'abord » (le même export, pas un second) · « Tout effacer ».
- **À la clôture et à la fin du parcours d'arrêt, après le dévoilement** : « Une fois votre carnet copié, vous pouvez tout effacer de ce navigateur. » ; confirmation « Tout effacer ? Vos réponses et votre carnet seront supprimés de ce navigateur. C'est définitif. » · « Annuler » · « Tout effacer ».
- **Après** : « Tout est effacé de ce navigateur. »
- **« Qui, durée, droits »** (1.3 et 5.7) ouvre une note dans le cadre (validée par Juridique) :
  « Version d'essai. La vraie page sera écrite avant le lancement et relue par un avocat.
  Qui voit vos réponses : vous seulement, sur un appareil que vous ne partagez pas. Elles restent dans ce navigateur ; la page n'envoie rien, pas même à l'équipe.
  Durée : jusqu'à ce que vous les effaciez. Le navigateur peut aussi les perdre, par exemple en navigation privée, ou sur un appareil Apple après sept jours sans visite.
  Droits : « Tout effacer » (dans Moi, la roue dentée) les supprime de ce navigateur, quand vous voulez. »

### 8.10 Arrêter l'essai avant la fin

Arrêt possible à tout moment, de l'entrée au jour 14 (convention d'essai ; D-016 : « à son rythme »). Un arrêt ne décide rien pour le projet : la décision se prend au bilan (D-008). Il est définitif et n'est jamais suggéré.

- **Confirmation** : « Arrêter l'essai ? » / « Ensuite : quelques questions, votre carnet à copier, puis le dévoilement. C'est définitif : l'essai ne pourra pas reprendre. » ; « Annuler » · « Arrêter l'essai », même poids visuel, « Annuler » en premier.
- **Questions** : en tête, « Essai arrêté au jour 6. » (« Essai arrêté à l'entrée. » à la séance 0). « Vous arrêtez surtout parce que : » Je ne m'amuse pas · Je ne comprends pas tout · Je n'ai pas le temps · J'ai vu ce que je voulais voir · Autre raison. Dès le jour 3, dessous, F2 : « Jusqu'ici, deviner était : » et ses quatre choix. « Continuer », toujours actif : rien n'est obligatoire. Pas de champ de texte libre : une réponse politique pourrait s'y glisser.
- **F1, dès le jour 3, facultatif** : « Facultatif, environ une minute. Où placez-vous chacun ? D'après ce que vous avez vu. Même si vous hésitez, choisissez. » ; « Continuer » · « Sauter cette question » (libellé distinct du « Passer » des cartes).
- **Export** (§8.7) : le carnet porte le jour d'arrêt et la raison. Dessous : « Voir le dévoilement ».
- **Dévoilement** (§8.6), d'un toucher ; le corrigé de F1 n'apparaît que si F1 a été rempli.
- **Effacement** : mêmes textes qu'à la clôture (§8.9).
- **Après** : la barre affiche seulement « Essai arrêté au jour 6 ». Rouverte, la page reprend ce parcours là où il en était, jamais le jeu.
- Pourquoi l'export avant le dévoilement : après le dévoilement, on ferme la page ; le carnet doit être copié avant. Pourquoi « définitif » : le dévoilement et le carnet final closent l'essai. Pourquoi le seuil du jour 3 : avant, il n'y a eu qu'une seule manche de Deviner, F2 n'a pas de tendance à dire et F1 n'a pas de matière.

### 8.11 Arrêts techniques et empreinte (UX)

Le message remplace tout le cadre : pas de téléphone, pas de barre, ni « Qui est qui ? », ni « Arrêter l'essai », ni « Jour suivant » (on ne prend pas une décision définitive sur une page bloquée). Fond neutre, police du système, titre en gras, action en dernier ; aucune couleur ni pictogramme d'alerte ; tout tient sur un écran de téléphone.

1. **Vérification ratée au chargement** : « **La page s'est arrêtée par précaution.** À chaque ouverture, elle vérifie ses données et ses calculs. Cette fois, une vérification n'a pas donné le bon résultat : plutôt que de vous faire jouer sur un calcul peut-être faux, elle préfère s'arrêter. » ; seulement si une partie gardée est lisible : « Rien n'est effacé : ce que vous avez déjà joué reste dans ce navigateur. » ; puis « Dites-le dans la conversation, avec ce repère : **V4**. On vous dira quand rouvrir la page. » Le repère est V suivi du numéro de la vérification qui a échoué (V1 à V5, dans l'ordre du chargement décrit au §0), en gras, à chasse fixe.
2. **Stockage absent** : « **La page ne peut pas garder vos réponses.** Pour les retrouver d'un jour à l'autre, elle doit les enregistrer dans ce navigateur. Ouverte de cette façon, elle ne le peut pas : elle s'arrête donc avant de vous faire jouer. Si vous aviez déjà commencé l'essai, cette page n'a rien effacé. Dites-le dans la conversation : on vous proposera une autre façon de l'ouvrir. » La navigation privée n'est pas nommée : elle ne se détecte pas, et l'accuser serait faux dans la plupart des cas ; le message de la séance 0 la prévient.
3. **Autre onglet** : « **La page est ouverte deux fois.** Vous avez continué la partie dans un autre onglet. Pour ne pas effacer ce que vous y avez joué, celui-ci s'est arrêté ; votre dernier geste ici n'a pas été gardé. » ; bouton « Reprendre ici » ; dessous, plus petit : « Vous retrouverez la partie telle que vous l'avez laissée dans l'autre onglet. » Le bouton recharge la page, qui relit l'état gardé ; rien n'est jamais écrasé.
4. **Empreinte**, identique dans la page et dans la conversation : 16 groupes de 4 caractères, sur 4 lignes de 4 groupes ; minuscules ; chasse fixe, en couleur pleine ; une espace entre les groupes, un vrai retour à la ligne après chaque ligne. Message dans la conversation, avant la séance 0 : « Voici l'empreinte du fichier qui fixe d'avance les textes et toutes les réponses des quatre personnages : si une seule lettre du fichier changeait, l'empreinte changerait du tout au tout. Rien à faire d'ici là : à la fin de l'essai, la page affichera l'empreinte du fichier qu'elle contient, et si c'est la même que celle-ci, rien n'a été retouché pendant que vous jouiez. » Suivent l'empreinte, puis « Publiée le {date} à {heure}. »

### 8.12 Format du carnet (UX, fusionné avec Game design)

Le carnet se lit comme un formulaire : une ligne « intitulé : valeur. » par mesure, un bloc par séance, puis les titres, les chiffres globaux et les questions de fin. Les choix sont recopiés tels qu'ils sont écrits sur les boutons ; aucun code.

**Règles.**
- UTF-8 en forme NFC ; lignes séparées par U+000A seulement, sans tabulation ; blocs séparés par exactement une ligne vide ; pas de ligne vide au début ; le texte finit par une ligne vide, puis « Fin du carnet », sans retour à la ligne final.
- Seule l'espace U+0020 ; jamais deux espaces de suite, ni en début ou fin de ligne. Apostrophe U+2019 (§7.8, règle 1 seulement).
- Aucune ligne ne commence par « - », « * », « # », « > » ou par un chiffre suivi d'un point (le texte collé ne doit jamais être lu comme une liste ou un titre).
- Nombres en décimal, sans zéro initial ni séparateur de milliers. Accords : « 1 juste », « 2 justes » ; « fois » invariable.
- Durée, une seule forme : « {m} min {ss} s », m = ⌊d/60⌋ sans zéro initial, ss = d mod 60 sur deux chiffres (« 0 min 42 s », « 125 min 03 s »). Expression régulière : `\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b`. Aucune autre partie du carnet ne contient « min ».
- Comptes bruts « x fois sur y », sans arrondi.
- Date d'ouverture : date locale de Paris, jours et mois en minuscules (« lundi 19 octobre 2026 », « 1er » en lettres ordinaires pour le premier du mois) ; heure tronquée, sans zéro initial, « entre {h}h00 et {h}h59 » (« entre 0h00 et 0h59 »). « Jours écoulés depuis l'ouverture précédente » : sur sa propre ligne, absente à l'entrée, « 0 » le même jour.

**Gabarit** (crochets : ligne présente selon le cas) :

```
Carnet de l’essai Elenchos
Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, ni votre portrait, ni votre pseudo.
Les titres et les chiffres « Sur tout l’essai » dépendent en partie de vos avis, mais seulement en cumul, jamais texte par texte.
{Essai mené jusqu’à la clôture. | Essai arrêté au jour {k}. | Essai arrêté à l’entrée. | Essai en cours : carnet copié au jour {k}. | Essai en cours : carnet copié à l’entrée.}
[Raison de l’arrêt : {bouton | pas de réponse}.]

{Entrée | Jour {k} sur 14 | Clôture}
Ouverture : {lundi 19 octobre 2026}, entre {h}h00 et {h}h59.
[Jours écoulés depuis l’ouverture précédente : {n}.]
Durée : {D}{suite}.
[Boutons touchés : Relire {n} fois, Passer {n} fois.]
[Révélation : {verdict}, {verdict}, {verdict}.[ Raison cachée : {tentée | pas tentée}.]]
[Vos erreurs à la révélation : {bouton}.]
[{Le texte du jour et ses quatre raisons | Les trois textes et leurs raisons} : {bouton}.]
[Votre moment préféré : {bouton}.]

Titres de la semaine {1 | 2}
[Le Sans-Faute : {titulaires}.]
Le Devin : {titulaires}.
Le Mystère : {titulaires}.
Le Fidèle : {titulaires}.

Sur tout l’essai
Quand un personnage devinait la réponse d’un autre personnage, il a trouvé son auteur : {x fois sur y | pas de chiffre}.
Quand un personnage devinait l’une de vos réponses, il a trouvé que c’était vous : {x fois sur y | pas de chiffre}.
Titres attribués par tirage au sort, faute de départage : {n | pas de chiffre}.

Questions de fin
{Au fil des deux semaines | Jusqu’ici}, deviner était : {bouton | pas de réponse}.
Où vous placez chacun : {question passée.}
Agathe : {S} · {P} · {T} · {L}.
Nassim : …
Odile : …
Valentin : …

Fin du carnet
```

- {verdict} : « juste avec la raison », « juste », « faux » ou « passé », dans l'ordre d'affichage des cartes de la manche révélée ce jour-là (jouée à la séance précédente). La ligne « Révélation » existe à toutes les séances 3 à 15, que la révélation ait été lue ou non ; « Révélation : aucune carte. » si la manche était vide (écran 5.12 : le vote et les auteurs sont tout de même révélés), sans ligne « Raison cachée » ; « Raison cachée » seulement s'il y avait une carte à raison cachée. Placée dans le même bloc que « Vos erreurs à la révélation », elle permet de les croiser.
- {suite} : « , dont {D} pour deviner et {D} pour répondre », « , dont {D} pour deviner », « , dont {D} pour répondre » ou rien ; une durée absente disparaît ; si la durée de la séance est absente, toute la ligne disparaît. La durée de Répondre court de l'affichage de l'écran Répondre jusqu'à la raison validée ou, à défaut, jusqu'à « Jour suivant » : elle figure dès que l'écran a été affiché, que le porteur ait répondu ou non (sinon son absence dirait « n'a pas répondu à ce texte »).
- « Boutons touchés » n'existe qu'aux séances 2 à 14 (« Relire » et « Passer » sont dans Deviner, écran 2.1).
- {titulaires} : « pas attribué », ou la liste dans l'ordre Agathe, Nassim, Odile, Valentin, vous (« A », « A et B », « A, B et C »).
- {S} : « Sécurité », « Liberté individuelle », « au milieu entre Sécurité et Liberté individuelle » ou « sans choix entre Sécurité et Liberté individuelle » ; de même pour P, T et L.
- {bouton} : le libellé exact du bouton, majuscule comprise. Une question de séance sans réponse ne donne pas de ligne ; la raison de l'arrêt et F2 écrivent « pas de réponse ».
- Copie en cours d'essai (depuis la confirmation de « Tout effacer ») : le carnet porte « Essai en cours : carnet copié au jour {k}. » (ou « … à l’entrée. »), ne porte ni « Raison de l’arrêt » ni « Questions de fin », et s'arrête au bloc de la séance en cours ; les durées encore ouvertes de ce bloc s'arrêtent au toucher de « Copier mon carnet d'abord ». Les « Titres de la semaine » déjà tombés restent à leur place, après le bloc du jour 7 ou 14 ; vient ensuite « Sur tout l’essai » (mêmes règles qu'à l'arrêt). Le carnet ne dévoile rien avant le téléphone : avant d'avoir lu la révélation du jour, le porteur ne peut pas atteindre Moi › Réglages (la séance s'ouvre sur le message de 18h et la croix des révélations est inactive, §7.1).
- À l'arrêt, les durées encore ouvertes s'arrêtent au toucher de confirmation « Arrêter l'essai ».
- Le bloc « Titres de la semaine » suit le bloc du jour 7 ou du jour 14. Le bloc « Questions de fin » est absent en cas d'arrêt avant le jour 3 ; « Où vous placez chacun : question passée. » si F1 a été sautée ; sinon « Où vous placez chacun : » (deux-points final, sans point), suivi des quatre lignes. Une case laissée vide s'écrit « sans choix entre … ».
- « séance k » s'écrit « jour k », le mot de la barre que voit le porteur.

## 9. Ce qui est contrôlé

Les recalculs sont faits par un programme écrit à part, à partir de cette spécification et des fichiers de `a-ne-pas-ouvrir/` seuls, sans lire le code de la page. Le Vérificateur relit les résultats et les différences.

**Avant d'écrire la page.** Front-end a relu §0, §8.7, §8.8 et §9 (faisabilité confirmée, précisions intégrées) ; Back-end a écrit le schéma (`a-ne-pas-ouvrir/schema.md`) ; UX a écrit les textes des arrêts techniques et la présentation de l'empreinte (§8.11) ; la Direction artistique a confirmé les polices (§8.8) et donné la consigne visuelle du cadre (§8.1).

**Avant d'écrire le fichier scellé.** Le schéma du fichier scellé (noms de champs, types) et le format de la trace (par séance : cartes servies dans l'ordre, auteur, niveau, raison, carte à raison cachée, attributions du joueur et des personnages, côtés attendus, points, titres, phrases, curseurs, personnages affichés dans « Déjà joué aujourd'hui » pour l'heure fournie par le harnais, l'horloge de la page étant injectable dans la version témoin) sont fixés dans `a-ne-pas-ouvrir/schema.md` (Back-end ; rangé dans le dossier caché parce que les noms de certains champs laissent entrevoir les règles de calcul), à faire relire par l'auteur du programme de contrôle. Les points que la partie 6 du schéma laissait ouverts sont réglés : format du carnet (§8.12), mesures globales (§8.4), typographie (§7.8), plusieurs sources (§7.1). La difficulté est réglée une seule fois sur 200 parties de réglage. Protocole : `a-ne-pas-ouvrir/regles-de-calcul.md`, §9 bis.

**Rapport de scellement** (rangé dans `a-ne-pas-ouvrir/`, daté, écrit avec le fichier scellé) : les chiffres constants du fichier (§8.4) et les résultats du réglage ; détail au §9 bis du fichier caché.

**Avant d'écrire la page et le programme de contrôle.** Deux carnets de référence sont écrits à la main, avec leur journal (un arrêt au jour 4, une clôture), et deux cas chiffrés pour les règles les plus délicates (affectation lexicographique des devinettes, redistribution croisée de cartes identiques), rangés dans `a-ne-pas-ouvrir/` : les deux programmes s'y mesurent avant de se comparer entre eux.

**Avant la séance 0.** L'empreinte du fichier scellé est publiée dans la conversation, avec la date et l'heure, et dans un commit poussé sur `main` (GitHub horodate de façon indépendante de celui qui scelle).

**Parties témoins et parties au hasard, avant de donner la page au porteur.** Les parties témoins sont trois parties jouées sur la page par des joueurs témoins, chacun écrit pour couvrir des cas précis ; les parties au hasard sont 200 parties jouées avec des coups tirés au hasard. Elles remplacent les contrôles qui auraient demandé les réponses du porteur. Les unes et les autres sont rejouées par la page et par le programme indépendant, trace contre trace (protocole : §9 bis du fichier caché). La trace est produite par une version de la page construite à part pour les parties témoins ; la version du porteur ne contient aucune fonction de trace, ni d'autre export que « Copier mon carnet ».

- Une seule source (Front-end). Le fichier témoin est le fichier porteur plus un bloc de script, qui lit les résultats du moteur et écrit la trace sans rien modifier ; le contrôle 5 compare les deux fichiers (seules différences permises : ce bloc et son empreinte dans la politique de sécurité). Code non minifié.
- Le moteur (sélection, carte à raison cachée, devinettes, points, titres, badges, portrait, phrases) n'accède ni à l'écran, ni au stockage, ni à l'horloge, ni au hasard : il reçoit les coups, le fichier scellé et l'heure. Seule l'interface lit l'heure (heure de Paris, à la minute, tronquée, au premier toucher de chaque séance et à chaque affichage de « Déjà joué aujourd'hui ») ; la trace consigne l'heure lue et les visages affichés.
- Rejeu, sans rien ajouter à la page : un navigateur sans tête (Chromium et WebKit au moins), heure et fuseau (Europe/Paris) fixés par l'outil de test, joue par l'interface les parties témoins et au moins dix parties au hasard, une fois sur chaque version, en trouvant les boutons par leur rôle et leur nom. Il vérifie : texte affiché identique, écran par écran, dans les deux versions ; coups gardés dans le stockage identiques aux coups joués ; trace témoin identique à celle du programme indépendant. Les 200 parties au hasard sont rejouées par le moteur de la version témoin.

1. Empreinte : SHA-256 du fichier scellé (JSON canonique) égal à l'empreinte publiée ; données embarquées identiques ; vecteurs de test reproduits ; typographie simple dans les chaînes affichées du fichier scellé (ni U+2019, ni U+00A0, ni U+202F ; « ? », « ! », « ; », « : », « » » toujours précédés d'une espace, « « » toujours suivi d'une espace ; adresses, codes, dates et heures non concernés ; liste : `a-ne-pas-ouvrir/schema.md`, partie 4.1).
2. Profils : conformes au §1 et aux contraintes de `a-ne-pas-ouvrir/profils.md` ; aucune étiquette politique.
3. Réponses : toutes les réponses des personnages, recalculées par les règles de `a-ne-pas-ouvrir/regles-de-calcul.md`, réponses atypiques comprises.
4. Absences : celles prévues ; un absent ne répond pas et ne devine pas.
5. Code de la page : aucun appel au hasard du navigateur, aucune évaluation de code, aucun attribut style ni gestionnaire écrit dans le HTML, aucun effacement global du stockage, aucun formatage, dans le moteur ou l'interface, qui dépende de la langue du navigateur (ni `Intl`, ni `toLocale…`, ni `Date` pour lire une date scellée) ; réponses des personnages lues dans les données scellées ; les réponses des personnages ne dépendent en rien de celles du porteur ; la sélection n'utilise pas les profils cachés ; aucune des sorties interdites au §8.8 ; aucune capacité déclarée à la publication ; compte simulé ; la version du porteur et la version témoin ne diffèrent que par la trace.
6. Parties témoins et au hasard : sélections et carte à raison cachée reproduites.
7. Parties témoins et au hasard : devinettes des personnages reproduites.
8. Parties témoins et au hasard : points, titres et badges reproduits.
9. Parties témoins et au hasard : portrait et phrases reproduits.
10. Parties témoins et au hasard : lignes rouges sur tout ce qui a été affiché (jamais la réponse du porteur à côté d'une autre, aucun taux d'accord, aucun classement, jamais « n'a pas joué »).
11. Textes : toutes les chaînes affichées sur les parties témoins sont relevées et comparées aux maquettes finales, à l'annexe C et aux textes du cadre des §7 et §8 ; une chaîne absente des deux est un défaut, ponctuation (§4.6), élisions et accords (§7.6) compris ; les règles du §7.8 sont appliquées aux chaînes des maquettes et de l'annexe C avant la comparaison ; au rejeu à 320 px de large, aucune ligne affichée ne commence par « ? », « ! », « : », « ; », « » » ou « · ». Les phrases du vote (§7.9) attendues pour chaque texte sont calculées par le programme de contrôle à partir du fichier scellé (« 1er », mois, U+00A0) et comparées au relevé ; aucune chaîne du vote (issue, date, étape) n'apparaît pour un texte pas encore révélé (2.1, « Relire », 5.4 d'avant la révélation). Relevé relu par UX.
12. Export : sur les parties témoins et au hasard, le texte exporté ne contient que les lignes du gabarit du §8.12 ; le pseudo n'y figure jamais. Pour les trois parties témoins et dix parties au hasard, trois variantes rejouées avec la même horloge et les mêmes gestes, seules les réponses du porteur changeant (positions opposées ; toutes neutres ; mêmes positions avec d'autres raisons, dont « aucune ») : tous les blocs de séance et le bloc « Questions de fin » sont identiques octet pour octet, durées remplacées par « ‹durée› » comme au contrôle 13 ; seuls « Titres de la semaine » et « Sur tout l'essai » peuvent différer. Une partie arrêtée au jour 8 avec des réponses à 4 des 6 textes révélés affiche « pas de chiffre » aux trois lignes de « Sur tout l'essai » (Juridique) ; avec des réponses à 5 des 6, elle affiche les chiffres (sauf la deuxième ligne si aucune carte du porteur n'a été servie).
13. Version du porteur : les trois parties témoins sont rejouées par automate sur la version donnée au porteur ; le carnet qu'elle exporte est comparé à celui que le programme de contrôle calcule à partir du fichier scellé et du journal du harnais (durées masquées). Toute différence est un défaut.
14. Navigateur. Avant de donner la page, avec un joueur témoin, d'abord sur le fichier construit dans un navigateur sans tête, puis sur la version publiée dans la mesure où l'équipe peut l'ouvrir (le porteur n'a aucune manipulation technique à faire : consigne du porteur, `CLAUDE.md`) : (a) pendant une séance entière, le panneau réseau du navigateur ne montre aucune requête émise par la page après son chargement ; (b) une réponse survit à la fermeture de l'onglet, au lendemain et à une nouvelle publication ; (c) une autre page, publiée pour le test et ouverte dans le même navigateur, ne lit rien de ce que la page a gardé ; (d) après « Tout effacer », il ne reste rien ; (e) le carnet copié depuis la page publiée, puis collé dans une conversation, est identique octet pour octet (apostrophes, lignes vides) ; (f) sur le fichier construit, une requête réseau lancée depuis le navigateur de test est refusée par la politique de sécurité ; si la plateforme ajoute une enveloppe ou sa propre politique, l'équipe le dit. (b), (c) et (e) passent d'abord sur une page-test minimale, sans rien de l'essai, en tout début de fabrication : si la plateforme refuse, on le sait avant d'écrire la page. Si (b) ou (c) échoue, la page n'est pas donnée sous cette forme : l'orchestrateur trouve une autre façon de l'ouvrir qui garde les réponses dans le navigateur, et refait les mêmes tests. Le stockage de claude.ai n'est pas une solution de repli sans décision du porteur, car il modifierait D-016. Chez le porteur, la page refait sa vérification du stockage à chaque chargement (§8.8), et la barre affiche « Jour n sur 14 » à la réouverture : une partie perdue se voit aussitôt. Une nouvelle publication sans changement de code refait les contrôles 5, 12, 13 et 14, et la comparaison octet pour octet de la page servie (§8.8).

**Correctif.** Un défaut trouvé avant la séance 0 : on corrige, on re-scelle, on publie une nouvelle empreinte datée, on rejoue tous les contrôles. Après la séance 0, le fichier scellé ne change plus. Un correctif de la page est daté, refait les contrôles 5 à 14 avec une version témoin reconstruite, et sa date de publication est donnée dans la conversation ; le bilan la rapproche des dates d'ouverture du carnet. Si le défaut touche un calcul déjà montré, le bilan de l'essai marque l'essai comme affecté à partir de cette séance.

**Après l'essai.** Le Vérificateur relance les contrôles 1 à 4 sur le fichier dévoilé. Sur le carnet du porteur : aucun calcul ne cherche à retrouver les réponses du porteur à partir du carnet (pas d'essai de réponses possibles pour reproduire un chiffre).

15. Chiffres à rapporter : justesse du porteur par semaine, comptée à la révélation (semaine 1 : textes 1 à 5 ; semaine 2 : textes 6 à 12 ; texte 13 à part), sur toutes les cartes servies, passes et cartes sans attribution comprises (sinon passer ferait monter le chiffre) ; la même justesse sans les réponses atypiques, calculée par l'équipe avec le fichier scellé (vraie mesure de l'apprentissage : les réponses atypiques sont faites pour ne pas se deviner) ; repère indicatif, hypothèse de Game design non validée : 35 à 65 % en semaine 2 (au hasard, environ 25 %) ; pas un critère de décision (D-008) ; croisement des erreurs avec la question 1 du carnet ; chiffres globaux du §8.4. Le §9 bis calcule le joueur simulé de la même façon.

## Annexe A : ce que Contenu fournit

18 textes : 17 retenus (E1 à E3, puis 1 à 14) et 1 de réserve (T). La seconde réserve prévue (P) est vide : aucun texte P de sens 1 avec un vrai argument au pôle 1 dans le matériau (constat de Contenu, 5 octobre 2026).

Pour chaque texte : titre et trois lignes ; vote : issue, date et étape (§7.9), relevées sur la page du scrutin et le dossier législatif, puis vérifiées par un second agent, tout écart tranché avant le scellement ; auteur et groupe ; lien du scrutin et sources ; tension (S, P, T ou L) et sens s ; quatre considérations dans l'ordre d'affichage, chacune avec texte, côté, pôle (0, 1 ou aucun), député et groupe.

Contraintes :
- Vrais textes examinés à l'Assemblée et vrais arguments de députés, jamais inventés.
- Quatre considérations issues de quatre groupes différents (`projet.md` §8).
- Tradition/Changement : aucun texte de mœurs ou de religion qui suive une ligne de parti.
- Les annotations « tension », « sens » et « pôle » sont faites deux fois, indépendamment ; tout désaccord est tranché avant le scellement (une erreur fausserait tout le portrait).
- Répartition des tensions, des sens et des considérations : `a-ne-pas-ouvrir/regles-de-calcul.md`, annexe A.

## Annexe B : le fichier scellé

- Contenu : version et graine ; vecteurs de test (§0) ; les 17 textes retenus (les réserves ne sont pas scellées) ; les 4 fiches (heure de jeu, profil) ; l'inviteuse ; les absences ; les réponses atypiques ; toutes les réponses calculées ; le réglage (détail : `a-ne-pas-ouvrir/regles-de-calcul.md` et `a-ne-pas-ouvrir/schema.md`).
- Format : JSON canonique (UTF-8, clés triées, sans espaces, au sens de la RFC 8785) ; positions cachées écrites en centièmes entiers (37 pour 0,37) ; empreinte SHA-256 en hexadécimal, sur les octets du fichier ; schéma dans `a-ne-pas-ouvrir/schema.md` ; écrit par un agent distinct de celui qui écrit la page, avant la séance 0 ; embarqué dans la page en base64.
- Calculé en direct, jamais scellé (dépend du porteur) : sélections, devinettes des personnages, points, titres, portrait.
- Limite à dire au porteur : le fichier embarqué se décode. Comme pour `a-ne-pas-ouvrir/`, l'essai repose sur sa bonne foi.

## Annexe C : textes nouveaux à l'écran (liste à montrer au porteur à la livraison de la page)

Textes visibles dans l'essai qui ne figurent pas mot pour mot dans les maquettes finales validées (relevé UX).

**Dans le téléphone, nouveaux :**
1. « Sa raison : « … » » ; « Sa raison : aucune des quatre. »
2. La raison « aucune », écran par écran : cartes, « Défavorable · aucune des quatre raisons » ; 1.6, la ligne sous « Agathe : {Position} » devient « aucune des quatre raisons » ; 4.3, « {Titre du texte} : {Position}, aucune des quatre raisons » ; 5.4, « Ta réponse : {Position} · aucune des quatre raisons ».
3. « Ta devinette : aucune des quatre. » (2.1) ; « Ton pari : {prénom}, aucune des quatre raisons. »
4. Trois phrases du jour et trois phrases de la semaine (§5.6, §5.7).
5. Pôles jamais écrits : « la tradition », « le changement » (« au changement »), « la décision locale », « la décision nationale », « entre précaution et innovation », « entre tradition et changement », « entre local et national ».
6. « ont répondu chaque jour » / « a répondu chaque jour ».
7. « Pas encore de titre. Les titres tombent le dimanche, à 18h. » (5.2 et 5.5, avant les premiers titres).
8. Dates : le jour seul (« mercredi ») sur l'écran verrouillé et dans l'Historique ; « Semaine 1 », « Semaine 2 » en 5.2 et 5.5 (Front-end : rien ne s'y oppose).
9. Seulement si Contenu retient un projet de loi : « Proposé par le Gouvernement. »
10. Plusieurs sources en 5.4 : « Extrait 1 », « Extrait 2 », « Extrait 3 ».
11. Sous le vote (2.7d, 1.6, 5.4), la date : « Le 4 mai 2023. » en 2.7d, « texte adopté le 4 mai 2023 » en 1.6, « adopté le 4 mai 2023 » en 5.4 ; puis, selon le texte, « Le Sénat devait encore voter. » ou « C'était le vote définitif du Parlement. » (§7.9).
12. Texte 11 seulement : « Texte ni adopté ni rejeté. » ; « Le 14 mars 2024, son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte. » ; en 5.4, « Vote : ni adopté ni rejeté. » (§7.9).

**Dans le téléphone, forme seulement (aucun mot ne change) :** typographie à l'affichage (§7.8 : apostrophe courbe, espace fine avant « ? », « ! », « ; », espaces insécables dans les dates) ; en 5.4, « Proposé par … » passe au paragraphe suivant (§7.9) ; vrai italique d'Alegreya Sans pour la raison devinée ; barre d'état en police du système (§8.8).

**Dans le téléphone, validés ailleurs mais jamais dessinés :** « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » ; « Agathe a réussi à te surprendre deux fois. » ; « Le vote et les auteurs : {jour} à 18h » ; une carte bien devinée à 18h (« Ton pari : {prénom}. », le visage, « Tu connais ton monde. »).

**Dans le téléphone, texte validé employé dans un cas nouveau :** « Nouveau texte dans … » dans un cercle de cinq (D-011 ne le prévoit que sous trois membres).

**Dans le téléphone, seuls les noms changent :** prénoms, « Amis », vrais textes, vrais députés, groupes et votes ; « Tu as rejoint Amis. », « Agathe te lance un défi », « Les titres de la semaine · Amis », « {Pseudo} décroche Le Sans-Faute. », « toi@exemple.fr » ; élisions et accords (§7.6).

**Dans le cadre, tout est nouveau :** la barre, « Arrêter l'essai » et son parcours (§8.10), la confirmation de « Jour suivant », la note sur 18h et le message de la séance 0 (§8.2) ; la fiche « Qui est qui » ; « Pas dans l'essai. » ; la note du compte simulé ; la note « Qui, durée, droits » ; le carnet ; la note du texte 14, « Continuer », « L'essai est fini. Deux questions, votre carnet à copier, puis le dévoilement. » ; F2 et F1 ; le dévoilement ; « Copier mon carnet », « Carnet copié : collez-le dans la conversation. », la consigne de copie manuelle et « Fin du carnet » ; les trois arrêts techniques et le message d'empreinte (§8.11) ; les textes d'effacement (§8.9).

## Décisions touchées, conventions et constats

**Décisions modifiées : aucune, une précision.** D-015 prévoit que les réponses simulées soient contrôlées à la fin par le Vérificateur. Elles le sont avant l'essai (contrôles 1 à 4), puis à nouveau à la fin sur le fichier dévoilé ; l'empreinte, que le porteur compare lui-même (§8.6), prouve que le fichier n'a pas changé. Ce que D-016 (plus récent) rend impossible, c'est de recalculer la partie du porteur, ses réponses restant dans son navigateur : c'est remplacé par les contrôles 5 à 14 sur les parties témoins et au hasard, et par les chiffres du point 15. L'export est unique (D-016) ; « carnet de bilan » est lu comme incluant les mesures automatiques du §8.4. La page est décidée en D-016 (« maquette animée, pas l'application ») ; le fichier scellé, le harnais et le programme de contrôle découlent de D-015 : c'est de l'outillage d'essai, pas du code applicatif au sens de D-001 ni de la consigne du porteur « aucun code avant l'étape 6, même jetable ».

**Écarts de forme avec D-014, sans mot changé :** typographie à l'affichage (§7.8 : apostrophe courbe, espace fine avant « ? », « ! », « ; ») ; barre d'état du téléphone en police du système (§8.8). Le vrai italique d'Alegreya Sans rétablit l'annotation validée de l'écran 2.2. Ce sont des conventions d'essai ; pour le produit, ce sont des propositions.

**À dire au porteur.** Au début de la fabrication (règle « tenir le porteur au courant ») : la page, le fichier scellé, le harnais et le programme de contrôle sont de l'outillage d'essai, pas l'application. À la livraison de la page :
- la page, le fichier scellé, le harnais et le programme de contrôle sont de l'outillage d'essai, pas l'application (D-001 ; sa consigne « aucun code avant l'étape 6, même jetable ») ;
- la précision sur D-015 ci-dessus ;
- ce que contient le carnet qu'il copiera (§8.4, §8.7), et ce qu'il ne contient jamais ;
- les limites du stockage (navigation privée, Safari, ouvrir toujours la page de la même façon, §8.8) ; question à lui poser, en QCM, avant de construire : « Sur quel appareil jouerez-vous l'essai ? » — « Un ordinateur (Recommandé) » : le stockage y est le plus sûr et le téléphone dessiné s'y lit en entier ; « Un iPhone ou un iPad » : possible, sous réserve du test Safari (§8.8) ; « Un téléphone Android » : possible ;
- le fichier embarqué se décode, et la v2 de cette spécification, qui contenait les règles de calcul, reste lisible dans l'historique Git : l'essai repose sur sa bonne foi ;
- le dépôt du projet est public sur GitHub : tout ce qui y est poussé, y compris `a-ne-pas-ouvrir/` et bientôt le fichier scellé, est lisible par tous ; question à lui poser, en QCM, sur l'endroit où garder son carnet (§8.7) : « Où garder votre carnet de bilan ? » — « Dans la conversation seulement ; le dépôt ne reçoit que le bilan chiffré, sans dates ni heures (Recommandé) » : le dépôt est public et conserve tout ; « Dans le dépôt, tel quel » : simple, mais publie vos jours et heures de jeu pour toujours ; « Nulle part après le bilan » : le plus discret, mais on ne pourra plus recouper ;
- les textes nouveaux à l'écran (annexe C), dont la typographie à l'affichage (§7.8), le vrai italique d'Alegreya Sans et la barre d'état en police du système (§8.8).

**Conventions propres à l'essai :**
- quatre tensions seulement ;
- semaine 1 incomplète (révélations 1 à 5, réponses 1 à 6) ; texte 13 hors semaine ; texte 14 dévoilé sans attributions ;
- Le Fidèle en semaine 1, sur six textes, avec le libellé « ont répondu chaque jour » (la règle 12 et l'écran 3.3c disent « les sept jours ») ; il revient d'office au porteur s'il joue chaque séance ;
- départage final des titres par tirage ;
- personnages qui ne passent jamais ;
- pas de message de 18h aux séances 2 et 15 ; « Nouveau texte dans … » à la séance 1 (la variante que D-011 liait aux cercles de moins de trois membres sert ici pour un jour sans révélation) ;
- compte simulé, pseudo tapé ;
- arrêt possible à tout moment par « Arrêter l'essai » (§8.10) ; « Jour suivant » toujours actif, avec confirmation si la journée n'est pas finie ;
- typographie à l'affichage (§7.8) et barre d'état en police du système (§8.8), sans mot changé ;
- écrans absents et croix des révélations signalés par « Pas dans l'essai. » (§7.1) ; son propre visage ne réagit pas ; « Tout effacer » actif ; « Qui, durée, droits » ouvre une note dans le cadre, au lieu de la page d'information prévue en 1.3 ;
- écran d'un proche (4.3) : la raison toujours écrite sur les lignes de « Ses surprises » ;
- fiche « Qui est qui » et cadre de l'essai hors du téléphone ;
- vote de l'Assemblée daté et au passé, avec son étape (§7.9) ;
- textes nouveaux à l'écran : annexe C.

**Interprétations à confirmer :**
- « raison cachée trouvée » = personne et raison justes ;
- Le Sans-Faute : du lundi au dimanche, raison cachée non exigée, chaque révélation avec au moins une carte (C-014) ;
- Le Devin : au moins 1 point ;
- Le Mystère : erreurs sur ses propres réponses rapportées aux tentatives, passes exclues, au moins 6 tentatives ;
- surprise de la semaine : passes exclues, au moins 4 attributions ;
- Le Pas de Côté : penchant clair à |c − 0,5| ≥ 0,2 ;
- « inattendue de la part de son auteur » : lecture provisoire (C-009 ; détail dans `a-ne-pas-ouvrir/regles-de-calcul.md`) ;
- « Ses surprises » (4.3) : textes d'entrée exclus (D-010 ne fixe pas cette limite) ;
- cartes non attribuées quand le porteur passe au jour suivant : comptées comme passées ;
- cartes identiques servies ensemble : auteurs redistribués (C-010) ;
- phrase de la semaine : tension retenue par la plus grande différence entre les poids de ses pôles (C-008).

**Désaccords entre spécialistes, et choix retenu :**
- Second export des réponses du porteur, prévu par Game design en v1 : Cohérence, à la relecture de la v1, le jugeait contraire à D-016 ; UX, sans se prononcer sur le fond, en proposait un libellé plus clair. Retenu : pas de second export (Cohérence).
- Calcul des cartes servies : le Vérificateur proposait d'y inclure la réponse du devineur ; Game design l'exclut (détail : fichier caché). Retenu : Game design.
- Cartes identiques servies ensemble : le Vérificateur proposait « juste si c'est l'auteur de l'une des deux » ; Game design redistribue les auteurs, sinon Le Mystère compte les erreurs à l'envers. Retenu : Game design.
- Mesures du carnet : le Vérificateur les voulait toutes globales ; Juridique garde par séance ce que le porteur fait (pas ce qu'il répond). Retenu : Juridique. Ensuite, Game design a retiré du carnet quatre chiffres globaux de cette liste (réponses atypiques, cartes identiques, raisons « aucune », départages), constants pour un fichier donné, envoyés au rapport de scellement, et ajouté les verdicts par séance ; Juridique les a relus (conforme) et a remplacé le pourcentage proposé par UX par des comptes bruts. Retenu : Game design et Juridique.
- Pseudo : le Vérificateur proposait « Toi » ; UX fait taper un pseudo, comme les maquettes (« Toi » casserait « Toi décroche Le Sans-Faute. »). Retenu : UX.
- Confirmation de « Tout effacer » : Juridique la proposait dans le téléphone, en « tu » ; UX dans le cadre, en « vous », parce que ce qu'on perd ici est l'essai lui-même et que le texte du produit reste à écrire avec Juridique. Retenu : UX ; sa confirmation dit aussi, comme le demandait Juridique, que le carnet est effacé, et propose de le copier d'abord.
- Arrêt avant la fin : le Vérificateur proposait « Je m'ennuie » parmi les raisons et justifiait le caractère définitif par « vous connaissez déjà une partie des réponses » ; UX remplace par des raisons qui parlent du jeu, ajoute « J'ai vu ce que je voulais voir » (sans quoi toute raison serait un échec, contre D-008), et corrige la justification (connaître les réponses révélées fait partie du jeu ; ce qui clôt l'essai, c'est le dévoilement). Retenu : UX.
- Question « Envie de jouer demain ? » : proposée par le Vérificateur ; UX la déconseille (dans l'essai, « demain » est à un toucher ; intention déclarée, mesure faible ; met l'idée d'arrêter en tête ; un tiers de charge en plus). Retenu : pas de question ; la date et l'heure de chaque séance mesurent le rythme réel (§8.4).
- Place du schéma : Back-end recommandait de le laisser lisible (seuls des noms de champs y apparaissent) ; l'orchestrateur le range dans `a-ne-pas-ouvrir/`, comme pour les règles de calcul, puisque tous ses lecteurs lisent déjà ce dossier. Retenu : l'orchestrateur.
- Présentation de l'empreinte : Front-end proposait des groupes de 8 caractères ; UX des groupes de 4 (quatre caractères se retiennent d'un coup d'œil en passant d'un écran à l'autre ; chaque ligne tient sur un téléphone ; grille des numéros de sécurité de Signal et WhatsApp). Retenu : UX.
- Où ouvrir la page : Front-end recommandait le fichier local comme voie principale, pensant que claude.ai refuse le stockage du navigateur et ne permet pas de déposer un gros fichier tel quel. La documentation de l'outil de publication, dont dispose l'orchestrateur, dit le contraire sur les deux points (origine propre à chaque page, stockage gardé d'une version à l'autre, fichier publié depuis le disque). Le Vérificateur proposait aussi, en repli, un hébergement statique privé. Retenu : claude.ai en voie principale, avec comparaison octet pour octet de la page servie ; le fichier local en repli.
- « Qui, durée, droits » : Juridique proposait trois lignes dans le téléphone ; UX une note dans le cadre, pour ne pas écrire un texte de produit non validé. Retenu : la note dans le cadre (UX), avec la mention de l'avocat (Juridique).

**Manques du produit, ouverts dans `docs/decisions.md` :** C-007 à C-016. Deux points relevés dans la première version ne sont pas des manques : les curseurs des autres limités aux réponses déjà révélées découlent de D-010 (lecture A) ; Le Fidèle dans une semaine incomplète est tranché par la lettre de la règle 12 (« les sept jours »), et c'est l'essai qui s'en écarte, par convention.

## Limites et doutes

- Le Sans-Faute est presque inatteignable : une vingtaine d'attributions justes de suite en semaine 2.
- Quatorze jours ne montrent ni le Pas de Côté, ni les curseurs nets, ni les tempéraments ; c'est voulu.
- Les justesses visées sont des hypothèses (§9).
- Tradition/Changement garde un risque partisan ; le choix des textes est la seule protection.
- Les contrôles 6 à 11 portent sur les parties témoins et au hasard, jamais sur la partie du porteur (D-016) ; la version témoin et celle qu'il utilise sont reliées par la comparaison des deux fichiers (contrôle 5), le rejeu par l'interface et la comparaison du carnet (contrôle 13).
- Le porteur n'est pas un lecteur neuf (D-015) : la clarté des textes et des phrases ne sera vraiment vérifiée qu'en bêta. Il veut aussi que le jeu marche, et aucun libellé ne corrige ce biais ; les mesures automatiques font contrepoids.
- Les questions de fin ont leurs limites, décrites dans `a-ne-pas-ouvrir/regles-de-calcul.md`.
- Si les séances 1 à 14 tiennent sur moins de 10 jours distincts (dates de Paris ; seuil : hypothèse de Game design), l'essai ne dit rien de l'habitude quotidienne : il reste un test de compréhension et de déduction, et des révélations rapprochées aident la mémoire, donc gonflent la justesse et F1. Ce seuil ne s'annonce pas au porteur : D-016 dit « à son rythme », et l'annoncer ferait de la mesure du retour une consigne.
- « Pas dans l'essai. » coupe un peu l'immersion ; c'est le prix pour ne pas modifier les écrans validés.
- Avant un lancement public, à faire relire par un avocat (Juridique) : la page « Qui, durée, droits » complète (RGPD, art. 13) ; le sens de « Tout effacer » face aux titres passés gardés sous le pseudo (art. 17) ; l'analyse d'impact (art. 35) ; l'exemption de consentement pour le stockage du navigateur (art. 82 de la loi Informatique et Libertés). Les polices seront alors hébergées par le service.
- Rien ici ne dit ce que ressentent de vrais proches (D-015).
