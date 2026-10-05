# Spécification de la simulation : essai solo (étape 4)

*Rédigée par Game design le 4 octobre 2026 pour l'essai décidé en D-015 et D-016 (page jouable, quatre personnages inventés, une journée de jeu par séance, 14 jours). Version 4, intégrée par l'orchestrateur. La version 3 (après Cohérence, UX, Juridique) a reçu du Vérificateur « OK avec corrections » ; ses corrections sont appliquées. Les ajouts qui ont suivi (UX : cadre, carnet, typographie ; Front-end : faisabilité ; Game design : mesures ; Back-end : schéma ; Direction artistique : polices et cadre ; Juridique : carnet) ont été relus par Juridique et Cohérence, puis par le Vérificateur (« OK avec corrections » ; corrections appliquées, avec les confirmations de Game design, UX et Juridique). **Figée le 5 octobre 2026** : toute modification passe désormais par le circuit complet. Modifications après le gel, le 5 octobre 2026 : §7.9 (vote de l'Assemblée, UX et Back-end), avec ses renvois en §7.1, §7.8, §9 (contrôles 1, 5 et 11) et dans les annexes A et C ; puis, après la relecture du lot de textes par Cohérence, §7.10 (auteurs et groupes), §7.6 (élision devant un nom de député) et §7.8 (règle 6, nombres), avec leurs renvois en §7.1, §9 (contrôle 11), annexes A et C et « Décisions touchées » (UX et Back-end) ; annexe A (une seule réserve) ; puis, après le rapport de Contenu sur les groupes, §7.6 (élision fixée nom par nom), §7.10 (libellé court des groupes, moment, coupure), annexes A et C, conventions (UX, Back-end) ; puis, après D-019, §8.1 (mise en page sur iPhone et iPad, UX et Direction artistique), §8.2, §8.3, §8.7, §8.9, §8.10, §8.11 (textes et placement pour l'icône, Juridique et UX), §8.8 et §9, contrôles 5, 13 et 14, « Correctif », « Avant la séance 0 » (Front-end), nouveau §8.13 (UX), §8.12 (ligne de version), §7.1, §7.2, §7.4, annexe C, « À dire au porteur », « Décisions touchées », désaccords et limites. En circuit avec le lot de textes. Spécification de travail, pas un texte pour le porteur. Personnages, vies et exemples fictifs.*

*Ce fichier se lit sans gâcher l'essai : profils cachés, règles de calcul des personnages (comment ils répondent, devinent, et comment les cartes sont choisies), réponses atypiques, absences et corrigé de fin d'essai sont dans `a-ne-pas-ouvrir/`. Reste ici, assumé : l'heure de jeu des fiches et la ligne « Déjà joué aujourd'hui » (§7.5), comme dans le produit. Le porteur n'a pas à lire ce fichier : « En bref » et « Décisions touchées » suffisent.*

*Ordre de lecture pour un agent qui applique : §0, §5.1 à §5.4, §6, puis `a-ne-pas-ouvrir/regles-de-calcul.md` et `a-ne-pas-ouvrir/schema.md`, puis le reste.*

## En bref

- **Ce qu'on teste** : le porteur joue seul, quatorze jours de jeu, face à quatre personnages inventés, sur une page aux couleurs de La Tablée tirée des maquettes finales.
- **Ce qui est scellé** : les textes et toutes les réponses des personnages, calculés avant la séance 0 ; l'empreinte du fichier est publiée avant de jouer.
- **Ce qui est calculé en direct** : les cartes servies, les devinettes des personnages, les points, les titres et le portrait, qui dépendent des coups du porteur.
- **Comment on contrôle** : un programme écrit à part refait tous les calculs sur des parties jouées par des joueurs témoins (§9) ; les réponses du porteur ne quittent jamais son appareil (D-016, D-019).

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
- Écartés par UX, sur deux propositions de Game design (v1) : « Tes réponses n'ont pas encore tranché » sonne comme un reproche d'indécision, comme « L'Indécis », que remplace « Le Mesuré » (`projet.md` §4 ; nom proposé, à confirmer, `produit.md` §9, D-010) ; « Tu n'as penché d'aucun côté », pour l'égalité, était faux : le joueur a penché, des deux côtés.

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

- **Présents** : 1.1 à 1.9, 1.12, 2.1 à 2.7f, 3.1 à 3.3e, 4.2, 4.3, 5.2 à 5.5, 5.7, 5.11 ; 4.1 (cadre seul) et 5.12 (si le cas se présente), voir Précisions.
- **Absents** : 1.10, 1.11, 1.13, 1.14, 1.15, 5.1, 5.6, 5.8, 5.9, 5.10, 5.13, 5.14. Le cercle a cinq membres : ni « Il faut trois joueurs », ni « Inviter un proche » ; de 1.13, seule la ligne « Nouveau texte dans … » sert (séance 1).
- **Précisions** :
  - 2.2 : présent ; « Aucune de ces raisons » y reste, une carte à raison cachée pouvant valoir « aucune ».
  - 2.1 : « Valider » n'est actif que quand chaque carte est attribuée ou passée, comme sur la maquette, où les trois cartes le sont ; la raison de la carte à raison cachée n'est pas exigée. Seul « Valider » enregistre la manche : au passage au jour suivant, une carte attribuée sans « Valider » compte comme laissée sans attribution, donc passée (§8.2). « En attendant » (2.5) ne s'affiche donc que quand la journée est finie (§8.3).
  - 4.1 : seul son cadre s'affiche (en-tête Moi, sous-onglets, roue dentée) ; aucun curseur n'étant net, Moi › Portrait montre 5.11 pendant tout l'essai.
  - 5.2 : sans la ligne « Tempérament ».
  - 2.7f : partout sauf à la séance 15.
  - 3.2 : seulement s'il y a un badge.
  - 5.4 : présent, avec sa variante d'avant la révélation, ouverte depuis l'Historique : « Le vote et les auteurs : {jour} à 18h », sans lien officiel. Après la révélation, la ligne du vote suit le §7.9 ; « Proposé par … » passe au paragraphe suivant, comme en 1.6, et suit le §7.10. Avant la révélation, ni vote ni date. Une source : la ligne validée « Sources : extraits des débats » est le lien. Deux sources ou plus : cette ligne devient un intitulé, et dessous une ligne-lien par source, « Extrait 1 », « Extrait 2 », « Extrait 3 » (44 px de haut au moins, nouvel onglet ; une liste pour un lecteur d'écran).
  - 5.12 : géré, si aucun personnage n'a répondu la veille ; son « Suivant » mène à la raison, puis à 2.5 ; le lendemain, la révélation commence au vote.
  - 4.2 : huit barres, dans l'ordre fixe ; avant le premier dimanche, aucun titre sous les visages et pas d'encadré « Surprise de la semaine ».
- **Liens vers un écran absent** : rien n'est masqué ; un toucher affiche « Pas dans l'essai. » dans la bande, sous le téléphone (§8.1), jusqu'au toucher suivant. Masquer « + Inviter » changerait un écran validé, et le porteur pourrait y lire une règle du produit. Concernés : « + Inviter » et « Amis ▾ » (4.2) ; « Changer · Créer · Quitter » et l'interrupteur du message de 18h (5.7) ; « Renvoyer le code » (1.9).
- **Croix des écrans de révélation** (2.7a à 3.3e) : dans l'essai, elle affiche « Pas dans l'essai. » ; la révélation se lit jusqu'au bout, pour que les titres et la phrase de la semaine ne puissent pas être sautés (le produit ne dit pas comment rouvrir une révélation fermée, C-016).
- **Autres touchers** : « Plus tard » (1.9) a le même effet que « Valider ». « Relire » (2.1) ouvre une feuille comme 2.2 : « Un vrai texte de l'Assemblée nationale · auteur masqué », le titre, les trois lignes, « ← Retour ». « Voir le scrutin sur le site de l'Assemblée » et « Sources : extraits des débats » sont de vrais liens, ouverts dans un nouvel onglet. Son propre visage dans Le Cercle ne réagit pas. « Qui, durée, droits » (1.3 et 5.7) et « Tout effacer » (5.7) : §8.9.

### 7.2 Entrée (séance 0)

- Message d'Agathe (écran 1.1, signé Agathe ; « Agathe te lance un défi ») → « Défi d'Agathe · Texte 1 sur 3 » → carte de consentement au premier toucher sur une position (écran 1.3, D-006) → raison → « Et Agathe ? Sa réponse ? » → révélation immédiate → textes 2 et 3 → bilan (1.7) → compte (1.8 et 1.9) → « Fin de la journée », qui s'ouvre d'elle-même (§8.3 ; question 1 comprise, si un pari a été faux) ; « Aller au jour suivant » ouvre 1.12.
- Le porteur ne voit que les réponses d'Agathe ; une devinette est juste si elle trouve le bon côté (D-011) ; bilan « 2 sur 3 », ou, à 0 ou 1 sur 3, « Agathe a réussi à te surprendre deux fois. » (ou « trois fois ») à la place du grand nombre (D-006, note de l'écran 1.7).
- Compte simulé : le porteur tape son pseudo en 1.8, seul champ actif (sans saisie automatique du navigateur) ; « Recevoir mon code » reste inactif tant qu'il est vide. L'adresse « toi@exemple.fr » est dessinée, pas un vrai champ, pour que le navigateur ne propose ni de la remplir ni de l'enregistrer. En 1.9 : « Code envoyé à toi@exemple.fr », cases dessinées et remplies, « Valider » actif. Aucun e-mail n'est saisi, envoyé ni conservé. Note dans la bande (§8.1), sur 1.8 : « Compte simulé : choisissez juste un pseudo. Il reste dans votre {appareil} ; aucun e-mail n'est demandé ni envoyé. »
- Le pseudo s'affiche partout où les maquettes mettent « Marie » (visages et « Encore flou : » du Cercle, 3.2, 3.3a à 3.3c, 5.5, Réglages) ; « Toi » reste seulement dans la légende de 4.3. Il n'entre jamais dans le carnet exporté.

### 7.3 Séances 1 et 2

- **Séance 1.** « Aujourd'hui · lundi », barre d'étapes « Deviner ○ · Répondre ● », bandeau « Tu as rejoint Amis. », puis « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » (texte de `produit.md` §5 pour un cercle d'au moins trois membres ; l'écran 1.12 porte la variante des cercles de deux). L'écran « En attendant » (2.5) affiche « Nouveau texte dans … » au lieu de « Révélation dans … » : rien ne sera révélé à la séance 2.
- **Séance 2.** Pas de message de 18h : la séance s'ouvre sur « Aujourd'hui · mardi », étape Deviner (comme l'écran 2.1). « En attendant » affiche « Révélation dans … ».

### 7.4 Séance 15 (clôture), dans cet ordre

1. Révélation du texte 13, ouverte directement (sans message de 18h), de 2.7a à 2.7e, sans 2.7f. Le pied de la dernière carte dit seulement « {n} point(s) aujourd'hui » : le texte 13 ne compte dans aucune semaine.
2. Question 1 du carnet, s'il y a eu un « Ça alors ! » : page du cadre « Votre carnet du jour » (§8.1), réduite à cette question, avec « Continuer » (pas de question 2 : il n'y a pas de texte du jour).
3. Fiche du texte 14 : le téléphone montre 5.4 comme après une révélation (vote, auteurs, raisons avec leurs députés, sources, lien). Dans la bande (§8.1) : « Le texte du jour 14 ne sera pas deviné : l'essai s'arrête avant. Voici quand même son vote et ses auteurs. », avec « Continuer » à la place de « Jour suivant ».
4. Page du cadre : « L'essai est fini. Deux questions, votre carnet à copier, puis le dévoilement. » (même ordre qu'au §8.10), suivi de F2, puis « Continuer ».
5. Page du cadre : F1 (§8.5), puis « Continuer ».
6. « Copier mon carnet » (§8.7), avant le dévoilement : après le dévoilement, on ferme la page.
7. Dévoilement (§8.6).
8. « Tout effacer » (§8.9).

### 7.5 Deviner et « Déjà joué aujourd'hui »

- Deviner propose toujours les quatre visages (D-011) ; rien ne dit qui n'a pas répondu.
- « Déjà joué aujourd'hui » : journée de 18h à 18h ; r(h) = (h − 18 + 24) mod 24. Un personnage s'affiche s'il a répondu au texte du jour et si r(son heure de jeu) ≤ r(heure réelle du porteur). Si aucun ne s'affiche, la ligne disparaît avec ses visages, et rien ne la remplace : tout remplaçant dirait qui n'a pas joué.

### 7.6 Élision et accords

- Agathe et Odile commencent par une voyelle : « Défi d'Agathe », « Tu as trouvé 2 réponses d'Agathe sur 3 », « Les réponses d'Odile », « Pour qu'Agathe sache que c'était toi… ». Tout gabarit « de {prénom} » ou « que {prénom} » sait élider.
- Devant un nom de député, « était l'argument de {nom} » (1.6, 2.7e) suit l'usage, qui se règle à l'oreille : « d' » devant un son de voyelle, h muet compris ; « de » devant un nom qui commence par le son « y » (« Yann », « Iouri ») ou par un h aspiré ; en cas de doute, la forme qu'écrit le compte rendu de l'Assemblée. Exemples inventés : « l'argument d'Inès Morel », « l'argument d'Élise Caron », « l'argument d'Hélène Brun », « l'argument de Paul Roux », « l'argument de Iouri Lenoir ». Dans l'essai, la page ne déduit pas la forme de la seule initiale : la forme de chaque nom qui commence par une voyelle, un H ou un Y est fixée nom par nom dans le tableau de `a-ne-pas-ouvrir/schema.md` (partie 2.8), et le fichier scellé la porte pour chaque député (partie 2.3) : la page la lit, sans regarder l'initiale. Le contrôle 11 se sert du même tableau, sans refaire la règle.
- Accords : « a répondu » / « ont répondu » ; « député » / « députée » ; « sénateur » / « sénatrice » (§7.10) ; « 0 point », « 2 points ».

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
5. dans une date « {j} {mois} {aaaa} » (§7.9), les deux espaces deviennent U+00A0 ;
6. une espace U+0020 placée juste après un chiffre devient insécable : espace fine insécable U+202F si elle sépare deux tranches d'un nombre (elle est suivie d'exactement trois chiffres, puis d'un caractère qui n'est pas un chiffre, ou de la fin de la chaîne) ou si elle précède « % » ; espace insécable U+00A0 dans tous les autres cas. Ainsi « 12 000 euros » s'affiche « 12 », U+202F, « 000 », U+00A0, « euros » ; « 15 % » s'affiche « 15 », U+202F, « % » ; « 300 personnes » s'affiche « 300 », U+00A0, « personnes ».

Les règles s'appliquent à la phrase entière, une fois insérées toutes ses valeurs (nombres, dates, noms, sigles), sauf le pseudo, inséré après. Le carnet n'applique que la règle 1. L'empreinte, la graine et le fichier scellé montrés au dévoilement (§8.6, §8.11) n'en appliquent aucune : ce sont des codes, recopiés tels quels. « 18h » reste tel quel (validé, D-014). La trace enregistre les phrases sous leur forme affichée. Aucun mot validé ne change ; seule se voit la forme de l'apostrophe, de l'espace avant « ? », « ! », « ; », « % » et de l'espace entre les tranches d'un nombre (par exemple dans le message de 18h, « Ça alors ! », « Et Agathe ? Sa réponse ? », « 12 000 euros »). Raison : avec des espaces ordinaires, un « ? » ou un « » » peut se retrouver seul en début de ligne sur un téléphone de 360 px, et un nombre peut se couper en deux (« 12 » en fin de ligne, « 000 euros » au début de la suivante) ; et en Alegreya l'apostrophe droite ressemble à une marque de machine à écrire. À dire au porteur à la livraison.

### 7.9 Le vote de l'Assemblée (UX ; Back-end pour le fichier scellé)

Raison : la vérification des textes a montré que « Texte adopté. » seul peut être faux (quand seul l'article unique a été voté) ou trompeur (vote de première lecture, vote ancien : on croirait la loi en vigueur). Le gros titre de 2.7d répond toujours à « Et l'Assemblée ? » avec les mots validés ; une ligne s'ajoute dessous, au passé et datée, pour qu'aucune phrase ne devienne fausse pendant l'essai (le Sénat peut voter entre-temps).

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
- Conditions de vérité, vérifiées par Contenu sur la page du scrutin et le dossier législatif (annexe A) : `navette` = après ce vote, le Sénat devait encore se prononcer (transmission au Sénat, commission mixte paritaire à venir, ou texte de commission mixte paritaire voté d'abord par l'Assemblée) ; `definitif` = dernier vote du Parlement sur ce texte (texte de commission mixte paritaire voté après le Sénat, adoption conforme au texte du Sénat, lecture définitive) ; `aucune` = le rejet a mis fin à l'examen, ou l'issue est `sans_vote_ensemble` ; `sans_vote_ensemble` = le texte n'a qu'un article, cet article est adopté, la séance s'arrête sans vote sur l'ensemble (dans l'essai, un seul texte ; son lien mène au scrutin sur l'article). La date est celle de la page du scrutin, sans correction.
- Si aucune case n'est exacte pour un texte, Contenu ne force pas : le texte revient à UX ou passe en réserve.

**Exemples** (textes et dates inventés, pour ne rien dévoiler de l'essai) : un article unique voté sans vote sur l'ensemble → 2.7d « Texte ni adopté ni rejeté. » / « Le 3 décembre 2024, son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte. » ; un texte d'entrée adopté avant le Sénat → 1.6 « L'Assemblée : texte adopté le 18 mars 2025. Le Sénat devait encore voter. » ; un texte quotidien en première lecture → 2.7d « Texte adopté. » / « Le 9 octobre 2024. Le Sénat devait encore voter. » ; un vote définitif → « Texte adopté. » / « Le 12 mars 2025. C'était le vote définitif du Parlement. » ; un rejet qui clôt l'examen → « Texte rejeté. » / « Le 30 janvier 2025. »

### 7.10 Auteurs et groupes (UX ; Back-end pour le fichier scellé)

Les maquettes n'écrivent que « député » et « [Groupe A] ». Le lot demande trois précisions : un auteur peut être sénateur, un mandat peut avoir changé avant le vote, un même groupe ne doit s'écrire que d'une façon.

- **Mandat.** En 1.6 et 2.7e : « Proposé par {nom}, {mandat}, {groupe}. », où {mandat} vaut « député » ou « députée » (`auteur.type` = `depute`), « sénateur » ou « sénatrice » (`senateur`), selon `feminin`. En 5.4 : « Proposé par {nom}, {groupe}. » pour un député (gabarit validé) ; « Proposé par {nom}, sénateur, {groupe}. » (ou « sénatrice ») pour un sénateur : la fiche s'ouvre aussi sans passer par 2.7e, et sans le mot on lirait « député ». Un projet de loi : « Proposé par le Gouvernement. » (annexe C, point 9).
- **Moment.** Mandat et groupe sont ceux de l'acte que la phrase prête à la personne : le dépôt du texte pour « Proposé par », même si l'auteur a changé de mandat ou de groupe avant le vote, et même si ce groupe ne porte plus ce nom au moment du vote (le dépôt peut précéder le vote d'une législature) ; la séance d'où vient l'extrait pour « était l'argument de ». Raison : c'est la seule règle qui reste vraie pour un auteur qui n'a plus de mandat au moment du vote ; un groupe d'une législature passée n'est pas une erreur.
- **Groupe.** Son libellé court, tel que l'institution l'imprime dans ses comptes rendus, casse comprise : le plus souvent un sigle (« EcoS », « Dem », « LFI-NFP »), parfois le nom en toutes lettres, quand c'est la seule forme courte de l'open data (par exemple pour un groupe du Sénat). Une seule écriture par groupe, prise dans la liste fermée de `a-ne-pas-ouvrir/schema.md` (partie 2.7) : groupe de l'Assemblée, dans sa législature, pour un député ; groupe du Sénat pour un sénateur. Jamais un code interne de l'open data (« ECOS », « DEM », « UDDPLR »).
- **D'un seul tenant.** Un sigle ne se coupe pas en fin de ligne (« LFI- », puis « NFP » à la ligne suivante, est un défaut). La chaîne affichée garde son trait d'union U+002D ; le moyen revient à Front-end. Un groupe écrit en plusieurs mots (nom en toutes lettres) peut passer à la ligne à son espace, comme deux mots ordinaires (UX).
- **Pour le produit, rien n'est décidé.** Le libellé court est une convention d'essai : la plupart des sigles ne disent rien à qui ne suit pas la politique, et certains surprennent par leur casse. Sigle ou nom : à trancher en bêta, avec de vraies personnes (D-015). Le moment retenu (dépôt ou vote) est aussi à trancher pour le produit.

## 8. Le cadre de l'essai, hors du téléphone

### 8.1 Règle

Tout ce qui est en « vous » vit hors du téléphone : fond neutre, sans ronds de serviette ni typographie de La Tablée. Cela vaut pour la barre de l'essai, la fiche « Qui est qui », les notes (« Pas dans l'essai. », compte simulé, note sur 18h, texte 14), le carnet, la clôture, le dévoilement, l'export, l'effacement et le pied de page.

Consigne visuelle (Direction artistique) : deux températures. Le téléphone est chaud (lin, brou, caramel, Alegreya) ; le cadre est gris froid, en police du système, comme la couche autour du téléphone dans les maquettes.
- Fond #EEF0EE (sombre #141516) ; panneaux #FFFFFF (#1D1E20), filet 1 px #C4C7C3 (#3D3F41), rayon 8 px, sans ombre.
- Texte #1C1D1F (#EBECE9) ; secondaire #676A67 (#A3A6A2) ; niveau AA.
- Un seul accent, le bleu d'annotation des maquettes, #23729C (#86C4E6) : liens, anneau de focus, filet gauche de 3 px des notes, un seul bouton mis en avant par vue. Le bleu n'entre jamais dans le téléphone ; les couleurs de La Tablée n'en sortent jamais.
- Police du système, 15 px, interligne 1,45 ; barre à 14 px ; rien sous 13 px ; graisses 400 et 600, jamais d'italique ; chiffres tabulaires. Échelle : 13 px (pied de page, « Arrêter l'essai », ligne placée sous un bouton) ; 14 px (barre) ; 15 px (texte, notes, boutons) ; 17 px en 600 (titre d'une page du cadre) ; 21,6 px en 600 (titre d'un arrêt technique, §8.11, et des écrans hors de l'icône, §8.13, comme dans la page-test) ; chasse fixe du système en 14 px, interligne 1,5 (empreinte, graine, fichier scellé, repère V, texte du carnet à copier).
- Boutons du cadre bordés (1,5 px, rayon 8 px, 44 px de haut au moins), jamais pleins comme ceux du téléphone : bordure en couleur secondaire, texte en couleur de texte ; le bouton mis en avant a sa bordure et son texte en accent.
- Interdits dans le cadre : Alegreya, lin, brou, caramel, miel, double filet, ronds de serviette (dans « Qui est qui », les prénoms sont en gras, sans rond), ombres, halos, palette du soir ; flou, transparence et voile (la barre et la bande sont opaques).
- Test : texte masqué, chaque élément se range, à sa seule couleur et à sa seule police, côté téléphone ou côté cadre. Second test : capture en niveaux de gris, en clair et en sombre ; le contour du jeu se suit d'un bout à l'autre. Les deux fonds ont presque la même clarté (rapport de contraste 1,01 : 1 entre #EEF0EE et le lin, 1,02 : 1 entre #141516 et le brou) : c'est le contour qui sépare, pas la teinte.

**Mise en page (UX pour le parcours, Direction artistique pour la forme).** L'essai se joue sur un iPhone ou un iPad, depuis l'icône (D-019). Plus rien ne se place à la suite du téléphone, dans le défilement de la page : sous un téléphone de 560 à 740 px de haut, notes, carnet et « Jour suivant » tomberaient hors de l'écran, même sur un iPad. La bande, sous le téléphone, reste toujours à l'écran. Principe : une seule couche parle à la fois. Le cadre n'écrit jamais dans le téléphone ni par-dessus (ni feuille, ni bulle, ni voile). Une note courte, la confirmation de « Jour suivant » et les messages de copie du carnet vont dans la bande, sous le milieu (liste au point « Bande ») ; tout autre texte du cadre (message, fiche, note « Qui, durée, droits », question, parcours) est une page du cadre, qui prend la place du téléphone. Ailleurs dans cette spécification, « dans le cadre » se lit selon cette règle.

Trois zones, de haut en bas, dans une même colonne :
1. la barre de l'essai ;
2. le milieu : le téléphone, ou une page du cadre à sa place, jamais les deux ;
3. la bande : la note du moment s'il y en a une, puis l'action du cadre (« Jour suivant » aux séances 1 à 14, ou l'action de la page du cadre affichée ; à l'entrée, pendant le jeu, aucune).

La page elle-même ne défile pas et ne rebondit pas : seul le milieu défile (l'écran du téléphone, comme dans les maquettes, ou la page du cadre). La barre et la bande restent toujours visibles. Une seule exception, au point « Hauteur » de la disposition compacte. Le milieu prend toute la place qui reste ; quand une note apparaît, il raccourcit d'autant, par le bas : ce que le porteur vient de toucher ne bouge pas, et la note ne couvre jamais le téléphone.

**Disposition**, choisie selon la taille de la fenêtre, jamais selon l'appareil ni selon la place que laisse le clavier :

| Disposition | Quand | En pratique |
|---|---|---|
| Compacte | largeur < 600 px ou hauteur < 900 px, hors du cas suivant | tous les iPhone tenus en hauteur ; iPad en largeur, sauf le 13 pouces ; iPad en écran partagé |
| Écran couché | hauteur < 500 px et largeur > hauteur | iPhone tenu en largeur |
| Planche | largeur ≥ 600 px et hauteur ≥ 900 px | iPad en hauteur ; iPad 13 pouces en largeur |

**Compacte.** Le téléphone n'est plus dessiné : l'appareil en est un. Le jeu garde le contour de son écran, qui dit sans un mot « ceci est le jeu, le reste est l'essai ».
- Colonne : largeur de la fenêtre moins 2 × G, au plus 440 px, centrée ; G = max(12 px, zone sûre latérale).
- De haut en bas : max(8 px, zone sûre du haut + 4 px) ; barre (44 px au moins) ; 16 px ; milieu ; 12 px ; bande ; max(12 px, zone sûre du bas).
- Écran du jeu : contour 2 px à l'encre du téléphone (#2A211C ; #F2ECE3 en sombre et en palette du soir), rayon 20 px, fond du téléphone, sans ombre. Pas de barre d'état dessinée : la vraie, juste au-dessus, en tient lieu (deux heures superposées se contrediraient). L'écran verrouillé (2.6) garde sa grande horloge, qui fait partie de l'écran. Pas de bord intérieur sur les côtés (le contenu des écrans garde ses marges de 14 px) ; 8 px en haut et en bas. La zone de toucher de la croix des révélations, 44 × 44 px, a son coin à 8 px du haut et du bord droit intérieurs ; la croix y est centrée. Hauteur : tout ce qui reste, 200 px au moins. En dessous, et seulement là, la page défile : la bande reste alors à l'écran, en bas, puisqu'elle porte l'action (sauf sous le clavier d'iOS pendant une saisie) ; la barre peut sortir par le haut. C'est un garde-fou : le pire cas prévu, l'iPhone SE en affichage agrandi (fenêtre de 320 × 548 px en mode app, la même qu'au contrôle 14 h) avec le libellé du jour sur deux lignes et la confirmation de « Jour suivant » ouverte, en reste proche (estimations de 200 à 250 px, mesurées au contrôle 14 h) ; de même une petite fenêtre d'iPad. Le clavier n'y entre pas : sur iOS, il passe par-dessus la page sans en changer la taille.
- Rayon de 20 px : assez rond pour se lire comme un écran, assez loin des 34 px du téléphone dessiné pour ne pas figurer un second appareil, nettement plus rond que les panneaux du cadre (8 px).

**Écran couché.** Il ne concerne que le jeu et les pages du cadre ; les arrêts techniques (§8.11), les écrans hors de l'icône (§8.13) et la vue de secours restent lisibles en largeur. Une vue remplace tout, sans barre ni bande, aux mesures des arrêts techniques (plus bas) : « **Tenez votre {appareil} en hauteur.** En largeur, le téléphone de l'essai ne tient pas dans l'écran. Rien n'est perdu : redressez l'écran, et vous reprendrez où vous en étiez. » Aucun bouton ; un toucher sur cette vue n'est pas compté (ni ouverture de séance, ni geste) et n'écrit rien ; le temps passé couché, l'app au premier plan, reste dans les durées du §8.4. Le redresser rend l'écran tel qu'il était.

**Planche (iPad tenu en hauteur ; iPad 13 pouces dans les deux sens).** Le téléphone dessiné des maquettes, sans autre changement : 380 px de large ; contour 2 px à l'encre du téléphone ; rayon 34 px ; bord intérieur de 10 px en haut et en bas, 8 px sur les côtés ; barre d'état dessinée, en police du système (§8.8). Une colonne de 380 px, centrée, porte la barre, le milieu et la bande. De haut en bas : max(24 px, zone sûre du haut + 12 px) ; barre ; 24 px ; téléphone ; 24 px ; bande ; max(24 px, zone sûre du bas). Le téléphone prend la place qui reste, entre 480 et 740 px de haut ; les seuils garantissent les 480 px, même avec une note ou une confirmation. L'ensemble s'aligne en haut ; la place en trop reste vide, en bas. Une page du cadre y prend exactement la place du téléphone (380 px de large, même hauteur) : la bande ne bouge pas quand on passe de l'un à l'autre.

**Barre** (toutes dispositions), sur le fond de la page, sans panneau ni filet ; toujours visible, sauf au §8.11, au §8.13 et sur l'écran couché.
- À gauche, sur deux lignes : « Jour 3 sur 14 · mercredi » (14 px, 600, couleur de texte), puis le lien discret « Arrêter l'essai » (13 px, 400, accent, souligné ; zone de toucher de 44 px de haut, sans empiéter sur une autre cible).
- À droite : « Qui est qui ? », bouton bordé, 14 px, 600, 44 px de haut, marge intérieure de 12 px, à 8 px au moins du texte.
- Rien n'est coupé ni tronqué : si le texte ne tient pas, la barre grandit (à 320 px, le libellé du jour peut passer sur deux lignes).
- Sur une page du cadre, la barre ne garde que le libellé du jour : ni « Arrêter l'essai » ni « Qui est qui ? ».

**Bande** (toutes dispositions), sur le fond de la page.
- Note : panneau, filet 1 px, filet gauche de 3 px en accent, rayon 8 px, marge intérieure de 10 × 12 px, texte 15 px en couleur de texte. La rangée d'action vient 8 px dessous. La note est annoncée aux lecteurs d'écran quand elle apparaît. Elle apparaît d'un coup, sans glissement, ou par un fondu de 150 ms au plus si les animations sont permises.
- Une seule note à la fois : la plus récente prend la place, et quand elle part, la note durable qu'elle cachait revient (note sur 18h, note du compte simulé) ; « Annuler » d'une confirmation rend de même la note qu'elle remplaçait. Les notes n'accompagnent que le téléphone : une page du cadre les cache, elles reviennent avec lui. Seules vont dans la bande :
  - « Pas dans l'essai. » : dès le toucher, jusqu'au toucher suivant ;
  - la note du compte simulé : tant que 1.8 est affiché (le clavier d'iOS peut la couvrir pendant la saisie ; elle a été lue avant) ;
  - la note sur 18h : à la séance 1, dès que la journée est finie (le téléphone montre alors « En attendant »), jusqu'à la fin de la séance, juste au-dessus du « Jour suivant » dont elle parle ;
  - la note du texte 14 : à la clôture, avec « Continuer » à la place de « Jour suivant » (§7.4) ;
  - la confirmation de « Jour suivant » (§8.2) : dans le même panneau que la note, à la place du bouton ; la question en 600, la phrase, puis « Annuler » · « Aller au jour suivant », bordés, de même poids, côte à côte s'ils tiennent, sinon l'un sous l'autre, « Annuler » d'abord. Le milieu garde son contenu et raccourcit, comme pour une note : le porteur voit ce qu'il laisse.
  - les messages de copie du carnet (§8.7) : au-dessus de « Copier mon carnet », tant que la page de l'export est affichée (le porteur doit pouvoir relire la consigne pendant qu'il sélectionne le texte).
- Rangée d'action, 44 px de haut par ligne de boutons. « Jour suivant » est à droite, de la largeur de son libellé (16 px de marge intérieure), à bordure neutre. Il passe en accent (bordure et texte) dès que la journée est finie (§8.3) ; le téléphone montre alors « En attendant » (2.5). Il le reste jusqu'au passage, même si le porteur ouvre ensuite Le Cercle ou Moi. Pendant le passage au jour suivant, il est désactivé : bordure couleur filet, texte secondaire. L'action d'une page du cadre (« Continuer », « Fermer »…) prend la même place. Plusieurs actions (« Annuler » · « Aller au jour suivant », « Continuer » · « Sauter cette question », les trois boutons de la confirmation de « Tout effacer », « Copier mon carnet » puis « Voir le dévoilement ») suivent la règle de la confirmation : côte à côte si elles tiennent, sinon l'une sous l'autre, 8 px entre elles, dans l'ordre du texte ; la bande grandit d'autant.
- Au moins 16 px entre une cible du cadre et une cible du téléphone. Rien de lisible ni de touchable dans la zone de la barre d'accueil d'iOS.

**Page du cadre** (au milieu, à la place du téléphone).
- Liste : message de la séance 0, fiche « Qui est qui », note « Qui, durée, droits », « Fin de la journée » (le carnet, §8.3), parcours « Arrêter l'essai » (confirmation, questions, F1, export, dévoilement, effacement), clôture à partir du point 2 du §7.4 (sauf le point 3), confirmation de « Tout effacer » et copie qui en part. Une seule à la fois.
- Aspect : fond de la page, sans contour. Titre en tête, en 17 px, 600 ; sans titre propre (message de la séance 0, §8.2), la première phrase, en gras, en tient lieu, à cette taille. Contenu en panneaux (marge intérieure de 16 px, 12 px entre deux panneaux).
- Défilement : un seul, celui du milieu ; la zone du carnet à copier prend la hauteur de son texte, sans défilement propre.
- Action : dans la bande, toujours visible. Le pied de page est le dernier élément de la page.
- À l'ouverture, le lecteur d'écran se place sur le titre. Passage du téléphone à une page du cadre, et retour : ni glissement latéral ni feuille qui monte (ce sont des gestes du téléphone) ; un fondu de 150 ms au plus si les animations sont permises, aucun si « Réduire les animations » est activé.
- En la quittant (« Annuler », « Fermer »), le porteur retrouve le téléphone exactement où il l'avait laissé : même écran, même défilement, même saisie. Rouverte (l'app fermée, puis relancée), la page revient au même écran du téléphone ou à la même page du cadre ; le défilement repart du haut, et une saisie non validée (le pseudo en cours de frappe) est perdue ; une confirmation ouverte à la fermeture ne revient pas : on ne rouvre jamais sur une décision.
- Choix (carnet, F2, raison d'arrêt) : boutons bordés de 44 px au moins, 8 px entre eux. Le choix retenu prend une bordure de 2 px en accent et une coche « ✓ » devant le libellé, pour ne jamais dépendre de la couleur seule ; la coche n'entre pas dans le carnet. F1 : rond vide ○, rond retenu ●, en couleur de texte, zone de toucher de 44 × 44 px ; à 320 px, les étiquettes des deux pôles sur une ligne, les trois ronds dessous, rien de tronqué.

**Pied de page** (texte : Juridique, §8.2).
- Place : dernier élément de chaque page du cadre et de chaque écran hors de l'icône (§8.13). Jamais pendant le jeu (en disposition compacte, il prendrait jusqu'à un tiers de l'écran) : il ferme chaque journée (« Fin de la journée ») et la fiche « Qui est qui », ouverte à tout moment par la barre. Jamais dans la barre, la bande ni le téléphone. Pas sur les arrêts techniques (§8.11).
- Aspect : 24 px au-dessus, un filet de 1 px sur toute la largeur, puis 12 px. Texte en 13 px, interligne 1,45, couleur secondaire, police du système, sans lien ; une ligne par mention, 6 px entre elles.

**Arrêts techniques (§8.11), écrans hors de l'icône (§8.13) et écran couché.** Vue seule, sans barre, sans bande, sans téléphone ; la page défile normalement. Mesures de la page-test : en haut, max(24 px, zone sûre du haut + 12 px) ; sur les côtés, max(16 px, zone sûre latérale) ; en bas, max(40 px, zone sûre du bas + 24 px). Colonne de 34 rem au plus, centrée ; titre en 21,6 px, 600 ; l'action, s'il y en a une, vient en dernier, bouton bordé en accent.

**Zones sûres et barre d'état d'iOS.**
- Rien de lisible ni de touchable sous l'encoche, l'îlot dynamique ou la barre d'accueil : toutes les marges ci-dessus partent des zones sûres ; le fond du cadre s'y prolonge.
- La bande de la barre d'état prend la couleur du fond du cadre (#EEF0EE, ou #141516 en sombre), jamais le lin ni la palette du soir. L'heure et la batterie sont foncées sur fond clair, claires sur fond sombre. Moyen (Front-end) : les balises du §8.8, celles de la page-test : barre d'état d'iOS en style « default » (iOS y accorde l'heure au mode clair ou sombre) et `theme-color` à la couleur du fond du cadre, selon le mode ; le script ne les change jamais. « black-translucent » est exclu : il force une heure blanche, illisible sur #EEF0EE. La teinte de la bande, c'est iOS qui la pose : s'il ignore `theme-color`, elle est blanche (noire en sombre), toujours lisible ; l'écart ne se voit que sur l'appareil.

**Mode sombre.** Le cadre suit le réglage de l'appareil (couleurs entre parenthèses ci-dessus). Le téléphone suit les maquettes : brou en sombre, palette du soir pour la révélation, jamais hors du téléphone (D-012, D-014). Le fond est posé avant tout contenu, dans le bloc de style de l'en-tête : la page ne montre aucun éclair blanc. L'écran de lancement d'iOS, qui précède la page, ne se règle qu'avec des images de démarrage, donc des fichiers de plus sur `gh-pages` (exclus, §8.8) : en mode sombre, un bref écran clair reste possible à un lancement à froid.

**Ce qui ne change pas** : aucun mot validé ; aucun écran du téléphone ni aucun de leurs éléments (contenu, ordre, marges intérieures, typographie, couleurs) ; seul change l'habillage de présentation en disposition compacte (plus d'appareil dessiné ni de barre d'état dessinée, contour d'écran de 20 px de rayon, largeur de la colonne) ; la palette et les interdits du cadre ; les deux températures ; le test « texte masqué » ; les boutons bordés du cadre ; la règle « le cadre n'écrit jamais dans le téléphone ni par-dessus ». En planche (iPad tenu en hauteur ; iPad 13 pouces dans les deux sens), le téléphone dessiné, tel que dans les maquettes.

### 8.2 Barre, fiche « Qui est qui » et premier message

- Barre permanente (place : §8.1) : « Jour 3 sur 14 · mercredi » (« Entrée » à la séance 0, « Clôture » à la séance 15) ; juste dessous, le lien discret « Arrêter l'essai » (§8.10) ; à droite, le bouton « Qui est qui ? ». Dans la bande (§8.1), de la séance 1 à la séance 14, le bouton « Jour suivant », toujours actif, jamais à côté de « Arrêter l'essai », qui reste dans la barre : si la journée n'est pas finie (définition : §8.3), il fait place à la confirmation ci-dessous ; sinon, il ouvre la page du cadre « Fin de la journée » (§8.3). Dans l'une comme dans l'autre, « Aller au jour suivant » fait passer au jour suivant ; il est désactivé dès le premier toucher, le temps du passage. C'est ce toucher que comptent les mesures (§8.4, §8.12). À la clôture, ni « Arrêter l'essai » ni « Jour suivant ». À l'entrée, pas de « Jour suivant » : l'entrée se termine par 1.9, qui ouvre d'elle-même « Fin de la journée » (§8.3), ou par « Arrêter l'essai ». Elle porte le consentement (1.3) et le pseudo (1.8) : la sauter ferait répondre sans consentement (D-006) et laisserait sans pseudo les phrases qui l'affichent. Le porteur découvre « Jour suivant » à la séance 1 ; la note sur 18h, qui l'explique, apparaît dès que la journée est finie (§8.3).
- « Jour suivant » alors que la journée n'est pas finie : confirmation dans la bande, à la place du bouton (§8.1), « Passer au jour suivant sans répondre ? » (ou « sans finir de deviner ? », ou « sans finir de deviner ni répondre ? ») ; « Ce que vous n'avez pas fait aujourd'hui restera ainsi : vous ne pourrez pas y revenir. » ; « Annuler » · « Aller au jour suivant », même poids visuel (libellé distinct du « Passer » des cartes, que compte le carnet). Variante : « sans finir de deviner ni répondre ? » tant que Deviner n'est pas validé ; « sans répondre ? » quand Deviner est validé ou vide (séance 1, écran 5.12). « sans finir de deviner ? » ne sert pas dans l'essai, puisque Répondre ne s'ouvre qu'après Deviner. Une position sans raison compte comme pas de réponse. Les conséquences ne sont pas listées : le porteur les découvre comme un vrai joueur. Ensuite : le texte reste sans réponse du porteur (pas de phrase du jour, pas de ligne dans l'Historique, Le Fidèle perdu pour la semaine, les personnages devinent sans sa carte) ; les cartes non attribuées comptent comme passées. La liste à couvrir des parties témoins (§9 bis du fichier caché) comprend ce cas.
- Une fois, à la séance 1, dans la bande (§8.1), dès que la journée est finie (§8.3 ; le téléphone montre alors « En attendant ») et jusqu'à la fin de la séance : « Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez. » Le compte à rebours reste affiché dans le téléphone : c'est l'écran testé.
- Une fois, au début de la séance 0, avant la fiche « Qui est qui » (texte de Juridique, mis en forme par UX, puis corrigé et validé par Juridique ; revu après D-019). C'est la première page du cadre de l'essai (§8.1) ; la barre n'y montre que « Entrée ». Première phrase en gras ; « Continuer », dans la bande, est le seul bouton mis en avant ; ensuite la fiche s'ouvre, puis le téléphone montre le message d'Agathe. {appareil} vaut « iPhone » ou « iPad », comme dans la page-test (§8.8).
  « **Vos réponses restent dans votre {appareil}.** La page n'envoie rien, pas même à l'équipe. Pour que personne d'autre ne les voie, et pour ne pas les perdre :
  - Jouez toujours depuis l'icône « Essai » : c'est elle qui garde votre avancement. Ne la supprimez pas avant la fin de l'essai : cela pourrait tout effacer.
  - Ne laissez personne d'autre ouvrir l'icône « Essai ».
  - Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.
  - Dans la conversation, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit (vos phrases, votre portrait). Une capture d'écran reste dans vos photos, même après « Tout effacer » : avant d'en envoyer une, vérifiez qu'on n'y voit rien de tout cela. »
- La fiche s'ouvre d'elle-même une fois, à la séance 0, après le message ci-dessus et avant le message d'Agathe. C'est une page du cadre (§8.1) ; « Fermer », dans la bande, la referme et rend le téléphone tel qu'il était ; ensuite, par le bouton seulement, jamais depuis Le Cercle. Ouverte depuis Le Cercle, elle passerait pour une fonction du produit, qui ne montre jamais l'âge, le métier ou la ville d'un proche.
- En-tête : « Qui est qui · fiche d'essai. Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées. »
- Une carte par personne, dans l'ordre des visages. Exemple : « Agathe, 46 ans · sage-femme, Rennes. Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. Joue d'habitude vers 7h40. C'est elle qui vous invite. »
- Pied de page (Juridique ; place et aspect : §8.1), dernier élément de chaque page du cadre et des écrans du §8.13, en texte secondaire de 13 px, police du système, sans lien ; jamais pendant le jeu ni dans le téléphone ; pas sur les arrêts techniques du §8.11 ; sur la vue de secours, la première ligne seulement, écrite telle quelle dans le HTML, puisque le script n'y a pas tourné :
  - partout où il figure, écrans du §8.13 compris : « Page d'essai non commerciale, hébergée par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis. » (mention due à tout visiteur : loi du 21 juin 2004, art. 1-1) ;
  - en plus, sur chaque page du cadre, jamais sur les écrans du §8.13, qui n'affichent aucune donnée de l'Assemblée : « Source des textes, votes, auteurs et arguments : Assemblée nationale, data.assemblee-nationale.fr (Licence Ouverte) et assemblee-nationale.fr ; consultés le {date}. Résumés et raisons réécrits par l'équipe de l'essai ; l'Assemblée n'y est pas associée. » {date} : date de la dernière vérification des textes par Contenu avant le scellement, écrite à la construction, au format « {j} {mois} {aaaa} » du §7.9.
  - Les deux lignes figurent aussi, en entier, en commentaire dans l'en-tête du fichier, avec la licence des polices (§8.8), après les balises du §8.8 : jamais avant la déclaration d'encodage, qui doit tenir dans les 1 024 premiers octets du fichier.

### 8.3 Carnet de bilan (chaque séance)

À la fin de chaque séance, dans la page du cadre « Fin de la journée » (§8.1) : « Jour suivant » l'ouvre quand la journée est finie : Deviner validé (« Valider » de 2.1), s'il y a des cartes, et la réponse du jour validée (position et raison) ; à la séance 0, la journée est finie après 1.9, et la page s'ouvre alors d'elle-même (« Valider » ou « Plus tard ») ; à la séance 15, voir §7.4. De haut en bas : le titre « Votre carnet du jour » ; les questions ci-dessous qui s'appliquent ; le pied de page. Dans la bande : « Annuler » · « Aller au jour suivant », ce dernier mis en avant. « Annuler » ramène au téléphone, les réponses déjà touchées gardées. À la séance 0, il ramène à 1.9, dont « Valider » ou « Plus tard » rouvre la page : l'entrée n'a pas de « Jour suivant » (§8.2), et le porteur n'aurait sinon plus que « Arrêter l'essai ». Un seul écran, une touche par question, environ 10 secondes (estimation). Les questions ne bloquent pas le passage au jour suivant. Journée pas finie : la confirmation du §8.2, sans carnet, comme avant.

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

- **Ouverture d'une séance** : le premier toucher du porteur dans la séance (aux séances 3 à 14, le toucher du message de 18h, l'équivalent de l'ouverture de la notification dans le produit), pas l'affichage qui suit « Aller au jour suivant ». Les jours écoulés, l'heure d'ouverture et la durée de la séance partent de ce toucher. La durée de la séance court jusqu'au dernier toucher de la séance, « Aller au jour suivant » ou le toucher qui confirme « Arrêter l'essai » compris : elle comprend donc le carnet du jour (environ 10 secondes, §8.3). Celle de Deviner court de l'affichage de l'écran au dernier toucher qui y a eu lieu ; celle de Répondre, comme au §8.12. Ces trois durées ne comptent que le temps où l'app « Essai » est au premier plan : quand elle passe en arrière-plan, que l'écran se verrouille ou qu'elle se ferme, le décompte s'arrête ; il reprend quand elle revient à l'écran (moyen, et tenue si iOS ferme l'app : §8.8, « Mise en œuvre »). Raison : sinon, un porteur qui laisse sa journée sur « En attendant » et touche « Jour suivant » le lendemain aurait une séance de vingt heures ; de même pour un appel en pleine partie.
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

Un seul export, « Copier mon carnet » (D-016), proposé à la clôture, dans le parcours « Arrêter l'essai » et dans la confirmation de « Tout effacer » (« Copier mon carnet d'abord ») : les réponses au carnet (§8.3), les mesures et chiffres du §8.4, F1 et F2, la raison d'un arrêt, rien d'autre (gabarit exact au §8.12). Jamais une position, une raison, une phrase du jour ou de la semaine, un curseur ni le pseudo du porteur. Dans tous les cas, le texte copié s'affiche en entier avant la copie : le porteur voit ce qu'il donne. Il se termine toujours par une ligne « Fin du carnet ». Après une copie réussie, et seulement alors : « Carnet copié : collez-le dans la conversation. » Le carnet s'affiche dans un bloc de texte en lecture seule, comme le résultat de la page-test (pas un champ de saisie), page du cadre (§8.1) : le bloc prend la hauteur de son texte, « Copier mon carnet » est dans la bande, toujours visible, et les messages de copie s'y affichent au-dessus de lui, comme une note. « Copier mon carnet » appelle la copie directement dans le geste, sans attente avant l'appel ; en cas d'échec, une seconde méthode de copie sur la zone sélectionnée ; si les deux échouent, la page sélectionne tout le texte du bloc (avec « Tout sélectionner ») et affiche : « La copie automatique n'a pas fonctionné. Sélectionnez tout le texte du carnet, jusqu'à « Fin du carnet », copiez-le, puis collez-le dans la conversation. » Aucun autre export. Une réponse que le porteur citerait dans la conversation n'entre jamais dans le dépôt. Le dépôt du projet est public sur GitHub (vérifié le 4 octobre 2026) : le carnet tel quel y publierait, pour toujours, les jours, heures et durées de jeu du porteur. Décision du porteur (D-017) : le carnet reste dans la conversation ; le dépôt ne reçoit que le bilan chiffré qui en est tiré, sans dates ni heures.

### 8.8 Ce que la page garde, et où

- Les coups du porteur (positions, raisons, devinettes, passes), son pseudo, son consentement, son carnet (avec, pour chaque séance, ses durées, closes ou en cours, et le numéro de version de la page, §8.12), F1, F2, la séance et l'étape atteintes, et la vue ouverte (écran du téléphone ou page du cadre, §8.1), sont gardés dans la mémoire de l'icône « Essai » de son écran d'accueil, sur son iPhone (ou iPad), et nulle part ailleurs (D-019). C'est la mémoire qu'iOS donne à cette icône ; d'après WebKit, elle est distincte de celle de Safari et des autres navigateurs. Son portrait, les cartes, les points et les titres ne sont pas gardés : ils sont recalculés à chaque ouverture à partir des coups et du fichier scellé. La page n'envoie rien (D-016).
- Publication (D-019) : GitHub Pages, à `https://ppcrepin.github.io/elenchos/essai/`, depuis la branche `gh-pages` du dépôt, poussée à part, jamais fusionnée dans `main`, jamais réécrite pendant l'essai (`CLAUDE.md`). La branche publiée ne contient que trois fichiers : `.nojekyll` à la racine (GitHub sert alors les fichiers tels quels, sans les transformer) ; dans `essai/`, `index.html`, la page construite, et `apple-touch-icon.png`, l'image de l'icône, identique octet pour octet à celle de la page-test. La source de la page et son programme de construction suivent la règle normale (branche de travail et `main`). La page de l'essai remplace la page-test à la même adresse : même icône, même libellé, même mémoire. Non-référencement par la balise `robots` (plus bas), sans fichier `robots.txt` : celui d'un site de projet n'est pas lu, et un « Disallow » empêcherait les moteurs de lire la balise.
- Voie principale : l'icône. Le porteur l'a ajoutée à son écran d'accueil pour la page-test ; il joue toujours depuis elle et ne la supprime pas avant la fin de l'essai (D-019). Sur iPhone et iPad, chaque façon d'ouvrir la page a sa propre mémoire : un onglet de Safari, un autre navigateur, le navigateur intégré d'une application (celle de Claude comprise), l'icône. Seule l'icône compte. Le risque relevé avant D-019 s'est confirmé (affichée dans le cadre d'un autre site, la page perd sa mémoire à la fermeture de l'application) ; le remède prévu est appliqué : la page s'ouvre seule, depuis l'icône.
- Selon le contexte. Au chargement, avant tout accès à la mémoire, la page reconnaît le contexte par les tests de la page-test v2, repris à l'identique (même code, même ordre : cadre, appareil, iPad qui se présente comme un Mac, autre navigateur, mode app). Elle ne lance l'essai que dans l'icône. Ailleurs, elle affiche l'un des écrans du §8.13 (textes d'UX, annexe C), ne lance rien et n'écrit rien :
  - icône, en mode app, sur iPhone ou iPad : l'essai ;
  - onglet de Safari sur iPhone ou iPad, y compris le navigateur intégré d'une application (il se présente comme Safari) et une icône qui s'ouvre comme un onglet : renvoi vers l'icône ; l'ajout à l'écran d'accueil, en partie repliée ; pour une icône ouverte comme un onglet, un bloc de lignes à copier dans la conversation ;
  - autre navigateur sur iPhone ou iPad (Chrome, Firefox, Edge…, reconnus à leur nom) : ouvrir l'adresse dans Safari ;
  - ordinateur (application web du Dock comprise), téléphone Android, ou page affichée dans un cadre, quel que soit l'appareil : l'essai se joue sur l'iPhone ou l'iPad, depuis l'icône.

  Raison : une seule mémoire. Une partie dans un onglet et une autre dans l'icône rendraient « Tout effacer » incomplet (Juridique) ; et seule l'icône a passé la page-test.
- Repli, si la page-test v2 échoue dans l'icône : la même page, à la même adresse, ouverte sur un ordinateur, en page principale. Il modifie D-017 : nouvelle question au porteur (D-019). La page serait alors construite pour ne se lancer que sur ordinateur (une seule mémoire, de même), et Juridique revaliderait les textes des §8.2 et §8.9. Sur ordinateur, chaque navigateur a sa propre mémoire, et Safari sur Mac applique la règle des sept jours. Abandonnés : claude.ai (mémoire perdue sur iPhone, D-019) et le fichier local.
- Risques restants, dans l'icône :
  - supprimer l'icône efface probablement sa mémoire (non vérifié : le vérifier ferait perdre la partie) ;
  - une seconde icône a probablement sa propre mémoire, vide : la page y repart de l'entrée (consigne du §8.2 : ne pas rejouer, le dire) ;
  - une icône ajoutée avec l'interrupteur « app web » coupé s'ouvre comme un onglet : la page ne lance pas l'essai et le dit ;
  - sept jours : WebKit efface la mémoire d'un site après sept jours d'utilisation de Safari sans interaction avec ce site ; une application web de l'écran d'accueil n'est pas Safari : elle compte ses propres jours d'usage, chaque usage remet le compteur à zéro, et WebKit écrit ne pas s'attendre à ce que ses données soient effacées (billet « Full Third-Party Cookie Blocking and More », mars 2020) ; cela ne se teste pas en temps utile ;
  - navigation privée : sans objet ; l'essai ne se lance jamais dans un onglet, privé ou non, et l'icône n'a pas de mode privé ;
  - effacer l'historique et les données de Safari (Réglages) : effet sur la mémoire de l'icône inconnu ;
  - espace presque plein : iOS peut effacer des données de sites ; la persistance demandée réduit ce risque sans l'exclure ;
  - mise à jour d'iOS pendant l'essai : elle peut changer ces règles ;
  - sans réseau, l'icône peut ne pas ouvrir la page (pas de service worker, voulu) ; une fois la page ouverte, la séance se joue sans réseau, et la mémoire n'en dépend pas ;
  - après une publication, une app restée ouverte, ou une page encore en cache (dix minutes chez GitHub Pages), garde l'ancienne version (§9, « Correctif »).

  Dans tous les cas, la page vérifie sa mémoire à chaque chargement, et la barre affiche « Jour n sur 14 » à la réouverture : une perte se voit aussitôt.
- Mise en œuvre (Front-end) : une seule mémoire, celle qu'emploie la page-test (`localStorage`), éprouvée sur l'appareil ; ni cookie, ni `sessionStorage`, ni IndexedDB, ni Cache Storage, ni service worker, ni manifeste (un service worker pourrait servir une version périmée après un correctif ; un manifeste demanderait un second fichier et une directive de plus). Clés préfixées « elenchos-essai: », jamais d'effacement global : « Tout effacer » retire une à une les clés de ce préfixe, et elles seules. Hors de l'icône, la page n'écrit rien et ne lit rien dans la mémoire. Dans l'icône : chaque coup validé est écrit aussitôt ; après un rechargement (app fermée par iOS, retour d'un lien externe, réouverture), la page reprend à l'étape suivante et ne fait jamais rejouer un coup validé. L'état porte un numéro de format et un compteur d'écritures, vérifié avant chaque écriture : si une autre instance de la page l'a changé, la page s'arrête et propose « Reprendre ici », qui la recharge (§8.11). Quand l'app revient au premier plan, la page relit l'état gardé avant tout toucher et se recharge s'il a changé. « Aller au jour suivant » est désactivé dès le premier toucher (§8.2). Durées (§8.4) : elles se mesurent à l'horloge des durées du navigateur, qui ne suit pas l'heure du téléphone (un changement d'heure ne les fausse pas), et seulement pendant que la page est visible : le décompte s'arrête quand iOS signale la page cachée (arrière-plan, écran verrouillé, fermeture de l'app) et reprend quand elle redevient visible. Pour chaque durée ouverte (séance, Deviner, Répondre), l'état garde le temps de premier plan déjà compté et sa valeur au dernier toucher compté, qui est la durée retenue ; il les écrit à chaque toucher compté, à chaque passage en arrière-plan et avant tout rechargement voulu. Si iOS ferme l'app en arrière-plan, rien n'est perdu : tout a été écrit quand la page a été cachée, et à la réouverture la durée repart de ce qui est gardé. Si l'app s'arrête d'un coup au premier plan (plantage, manque de mémoire), seul manque le temps écoulé depuis la dernière écriture. Le numéro de version de la page est écrit avec la séance au premier toucher compté, puis à chaque toucher compté qui a lieu sous un autre numéro (§8.12). Au chargement, la page écrit, relit et efface une clé de vérification, de nom distinct de celle de la page-test ; si la mémoire ne marche pas, l'entrée ne commence pas (§8.11). La persistance du stockage est demandée à chaque ouverture, sans compter dessus. La clé de la page-test, `elenchos-essai:sonde-icone`, reste en place : la page de l'essai ne la lit, ne l'écrit ni ne l'efface ; seul « Tout effacer » la retire, avec les autres ; elle ne compte jamais comme une partie gardée (§8.11), et une mémoire qui ne contient qu'elle est vide : l'essai commence à l'entrée. Liens externes : nouvel onglet, `rel="noopener noreferrer"` ; dans l'icône, iOS les ouvre hors de l'app. Vue de secours : écrite dans le HTML, visible tant que le script n'a affiché aucune vue ; si le script ne démarre pas (empreinte refusée, erreur, iOS trop ancien), le porteur la voit, jamais une page blanche (texte d'UX, repris de la page-test).
- Balises de la page publiée, en tête du fichier, dans cet ordre ; ce sont celles de la page-test v2, plus la balise `referrer`. Libellé et image de l'icône sont figés à l'ajout ; les garder identiques donne la même icône si le porteur devait la rajouter.
  ```
  <!doctype html>
  <html lang="fr">
  <head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="{politique ci-dessous}">
  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Essai">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#EEF0EE" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#141516" media="(prefers-color-scheme: dark)">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="icon" type="image/png" href="apple-touch-icon.png">
  <title>Essai</title>
  ```
  `viewport` ne bloque pas le zoom (accessibilité). `apple-mobile-web-app-capable` ouvre l'icône en app sur les iOS d'avant la version 26.
- Politique de sécurité, en balise, juste après la déclaration d'encodage (GitHub Pages n'envoie aucun en-tête de ce type et ne permet pas d'en ajouter) : `default-src 'none'; script-src 'sha256-…'; style-src 'sha256-…'; font-src data:; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'`. Un seul bloc de script, un seul bloc de style ; leurs empreintes sont calculées à la construction, comme pour la page-test ; ni 'unsafe-inline' ni 'unsafe-eval'. `img-src 'self'` sert à l'image de l'icône, à côté de la page, comme dans la page-test : le navigateur la demande au chargement (`rel="icon"`), iOS à l'ajout. `'self'` couvre toute l'adresse `ppcrepin.github.io`, partagée par les sites Pages du compte : la page ne crée elle-même aucune image hors `data:` (contrôle 5), et le panneau réseau le prouve (contrôle 14 a). `frame-ancestors` est sans effet en balise : un autre site peut afficher la page dans un cadre, mais elle y reconnaît le cadre et ne lance pas l'essai. Tous les textes affichés, le fichier scellé et les polices sont dans ces deux blocs, donc couverts par leurs empreintes ; seule la vue de secours est écrite dans le HTML. En conséquence : aucun attribut style ni gestionnaire d'événement écrit dans le HTML ; les positions des curseurs passent par le style de l'élément ; le base64 se décode localement, jamais par une requête ; le pseudo est inséré comme texte, jamais comme HTML. Cette politique bloque les chargements et les envois ordinaires, pas une navigation : la preuve reste le contrôle 5 et le panneau réseau (contrôle 14 a).
- Interdits dans la page : tout stockage distant, celui des artefacts de claude.ai compris ; l'appel à Claude, les connecteurs, le téléchargement ; tout script, style, police ou image venus d'ailleurs (Google Fonts, cdnjs, unpkg, jsDelivr…) ; tout envoi (fetch, XHR, WebSocket, sendBeacon, formulaire, balise, préchargement) ; toute autre mémoire que celle décrite plus haut. Seules requêtes : la page et l'image de l'icône, à leur adresse fixe, sans paramètre, demandées par le navigateur. Seules sorties : les liens que le porteur touche lui-même (scrutin, sources) et le carnet qu'il copie lui-même (§8.7).
- Polices embarquées en woff2, réduites, six faces (Direction artistique) : Alegreya gras 700 (titres, verdicts, grand chiffre du bilan, en-têtes) ; Alegreya italique 500 (initiales des ronds de serviette, « E » de l'icône de notification) ; Alegreya italique gras 700 (initiales sur les curseurs) ; Alegreya Sans 400 (texte courant) ; Alegreya Sans gras 700 (bouton principal, position sur les cartes, question, bandeau, onglet actif, heure de l'écran verrouillé) ; Alegreya Sans italique 400 (la raison devinée sur la carte, « Ta devinette : « … » », seulement). Ce vrai italique remplace le faux italique que les maquettes finales affichaient par oubli de chargement : l'intention validée (annotation de l'écran 2.2) est rétablie, à citer au porteur à la livraison. Non embarqués : Alegreya Sans 500, Alegreya romain, Alegreya Sans gras italique, IBM Plex Mono ; la barre d'état du téléphone passe à la police du système, en chiffres tabulaires (léger écart visible avec les maquettes, à citer aussi). La fabrication de faces par le navigateur est bloquée (font-synthesis), pour qu'un oubli se voie au lieu d'être masqué.
- Caractères : latin de base, latin-1, latin étendu A, ponctuation française (dont l'espace fine insécable), €, les signes de l'interface présents dans ces polices (←, ▾, ●, ○, ◎, ✓ ; ceux qu'elles n'ont pas restent aux polices du système, ⚙ forcé en affichage texte), et tout caractère des textes scellés, vérifié à la construction ; fonctions OpenType kern, liga et tnum gardées ; chiffres comparés à l'œil avec les maquettes après réduction. Licence SIL Open Font License 1.1 : son texte complet et les mentions de copyright sont recopiés en commentaire dans la page ; si le fichier OFL.txt de la version employée réserve un nom de police, la police réduite prend un autre nom interne. Le cadre emploie les polices du système. Poids estimé de la page : 300 à 500 Ko.
- La page est publique et non référencée (D-019) : qui a l'adresse peut l'ouvrir. Elle ne contient rien du porteur : son pseudo, ses réponses et ses heures de jeu naissent et restent dans son appareil. Elle contient le fichier scellé, qui se décode (annexe B), et de vrais textes, votes et arguments de l'Assemblée (mention de la source : Juridique). Un visiteur ne peut pas jouer dans un onglet ; depuis sa propre icône, il jouerait dans son propre appareil, et rien ne nous parviendrait. Le porteur joue sur une version figée : `gh-pages` ne reçoit plus que des correctifs (§9, « Correctif »).

### 8.9 « Tout effacer » et « Qui, durée, droits »

La carte de consentement validée (1.3) promet « Tu peux tout effacer, quand tu veux » : l'essai tient cette promesse.

- **Où** : dans le téléphone, Moi › Réglages › « Tout effacer » (écran 5.7), rendu actif ; dans le cadre, à la clôture et à la fin du parcours d'arrêt, après le dévoilement (§7.4, point 8) : effacer avant détruirait F1, que le dévoilement compare au corrigé ; avant le dévoilement, seul « Copier mon carnet » est proposé. Jamais exécuté sans confirmation.
- **Quoi** : tout ce que la page a gardé (positions, raisons, devinettes, pseudo, consentement, carnet, F1, F2, séance et étape atteintes, vue ouverte ; le portrait, recalculé à partir des coups, disparaît avec eux), et la trace de la page-test (`elenchos-essai:sonde-icone` : un repère, un compte d'ouvertures et deux instants ; ni réponse ni pseudo), que la page de l'essai ne lit ni ne modifie avant (§8.8). La page revient à l'entrée, comme à une première visite. Le carnet déjà copié n'est pas touché : il ne contient aucune réponse.
- **Confirmation pendant l'essai**, dans le cadre : « Tout effacer ? » ; « La page effacera vos réponses, votre carnet et votre avancement. C'est définitif. Si vous recommencez, vous connaîtrez déjà les réponses des personnages : l'essai ne vaudra plus comme test. » ; boutons « Annuler » (mis en avant) · « Copier mon carnet d'abord » (le même export, pas un second) · « Tout effacer ».
- **À la clôture et à la fin du parcours d'arrêt, après le dévoilement** : « Une fois votre carnet copié, vous pouvez tout effacer. » ; confirmation « Tout effacer ? La page effacera vos réponses et votre carnet. C'est définitif. » · « Annuler » · « Tout effacer ».
- **Après** : « La page a tout effacé. »
- **« Qui, durée, droits »** (1.3 et 5.7) ouvre une note dans le cadre (validée par Juridique ; revue après D-019) :
  « Version d'essai. La vraie page sera écrite avant le lancement et relue par un avocat.
  Qui voit vos réponses : vous seulement, si personne d'autre n'ouvre l'icône « Essai ». Elles restent dans votre {appareil} : c'est l'icône « Essai » qui les garde. La page n'envoie rien, pas même à l'équipe. GitHub, qui héberge la page, voit l'adresse internet de votre connexion quand vous l'ouvrez, jamais vos réponses.
  Durée : jusqu'à ce que vous les effaciez. Elles peuvent aussi se perdre, par exemple si vous supprimez l'icône « Essai ».
  Droits : « Tout effacer » (dans Moi, la roue dentée) les efface, quand vous voulez. »

### 8.10 Arrêter l'essai avant la fin

Arrêt possible à tout moment, de l'entrée au jour 14 (convention d'essai ; D-016 : « à son rythme »). Un arrêt ne décide rien pour le projet : la décision se prend au bilan (D-008). Il est définitif et n'est jamais suggéré.

- **Place** : la confirmation, puis chaque étape du parcours, est une page du cadre (§8.1), dans cet ordre ; le téléphone ne revient pas.
- **Confirmation** : « Arrêter l'essai ? » / « Ensuite : quelques questions, votre carnet à copier, puis le dévoilement. C'est définitif : l'essai ne pourra pas reprendre. » ; « Annuler » · « Arrêter l'essai », même poids visuel, « Annuler » en premier.
- **Questions** : en tête, « Essai arrêté au jour 6. » (« Essai arrêté à l'entrée. » à la séance 0). « Vous arrêtez surtout parce que : » Je ne m'amuse pas · Je ne comprends pas tout · Je n'ai pas le temps · J'ai vu ce que je voulais voir · Autre raison. Dès le jour 3, dessous, F2 : « Jusqu'ici, deviner était : » et ses quatre choix. « Continuer », toujours actif : rien n'est obligatoire. Pas de champ de texte libre : une réponse politique pourrait s'y glisser.
- **F1, dès le jour 3, facultatif** : « Facultatif, environ une minute. Où placez-vous chacun ? D'après ce que vous avez vu. Même si vous hésitez, choisissez. » ; « Continuer » · « Sauter cette question » (libellé distinct du « Passer » des cartes).
- **Export** (§8.7) : le carnet porte le jour d'arrêt et la raison. Dessous : « Voir le dévoilement ».
- **Dévoilement** (§8.6), d'un toucher ; le corrigé de F1 n'apparaît que si F1 a été rempli.
- **Effacement** : mêmes textes qu'à la clôture (§8.9).
- **Après** : la barre affiche seulement « Essai arrêté au jour 6 ». Rouverte, la page reprend ce parcours là où il en était, jamais le jeu.
- Pourquoi l'export avant le dévoilement : après le dévoilement, on ferme la page ; le carnet doit être copié avant. Pourquoi « définitif » : le dévoilement et le carnet final closent l'essai. Pourquoi le seuil du jour 3 : avant, il n'y a eu qu'une seule manche de Deviner, F2 n'a pas de tendance à dire et F1 n'a pas de matière.

### 8.11 Arrêts techniques et empreinte (UX)

Le message remplace tout le cadre : pas de téléphone, pas de barre, pas de bande, pas de pied de page, ni « Qui est qui ? », ni « Arrêter l'essai », ni « Jour suivant » (on ne prend pas une décision définitive sur une page bloquée). Fond neutre, police du système, titre en gras, action en dernier ; aucune couleur ni pictogramme d'alerte ; tout tient sur un écran de téléphone, dans ses zones sûres. Mesures : §8.1, « Arrêts techniques ».

1. **Vérification ratée au chargement** : « **La page s'est arrêtée par précaution.** À chaque ouverture, elle vérifie ses données et ses calculs. Cette fois, une vérification n'a pas donné le bon résultat : plutôt que de vous faire jouer sur un calcul peut-être faux, elle préfère s'arrêter. » ; seulement si une partie gardée est lisible : « Rien n'est effacé : ce que vous avez déjà joué reste dans votre {appareil}. » ; puis « Dites-le dans la conversation, avec ce repère : **V4**. On vous dira quand rouvrir la page. » Le repère est V suivi du numéro de la vérification qui a échoué (V1 à V5, dans l'ordre du chargement décrit au §0), en gras, à chasse fixe.
2. **Stockage absent** : « **La page ne peut pas garder vos réponses.** Pour les retrouver d'un jour à l'autre, elle doit les enregistrer dans votre {appareil}. Ouverte depuis cette icône, elle n'y arrive pas : elle s'arrête donc avant de vous faire jouer. Si vous aviez déjà commencé l'essai, cette page n'a rien effacé. Gardez l'icône et dites-le dans la conversation : l'équipe vous dira quoi faire. » Ce message ne s'affiche que dans l'icône : ailleurs, la page ne lance pas l'essai (§8.13).
3. **Page ouverte deux fois** : « **La page s'est ouverte deux fois en même temps.** Pour ne rien écraser, cet écran s'est arrêté ; votre dernier geste ici n'a pas été gardé. » ; bouton « Reprendre ici » ; dessous, plus petit : « Vous retrouverez la partie telle qu'elle a été gardée en dernier. » Le bouton recharge la page, qui relit l'état gardé ; rien n'est jamais écrasé. Dans l'icône, ce cas devient rare (une seule fenêtre ; état relu au retour au premier plan, §8.8).
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
Version de la page : {version}.
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
- {suite} : « , dont {D} pour deviner et {D} pour répondre », « , dont {D} pour deviner », « , dont {D} pour répondre » ou rien ; une durée absente disparaît ; si la durée de la séance est absente, toute la ligne disparaît. La durée de Répondre court de l'affichage de l'écran Répondre jusqu'à la raison validée ou, à défaut, jusqu'au toucher « Aller au jour suivant » (temps au premier plan seulement, §8.4) : elle figure dès que l'écran a été affiché, que le porteur ait répondu ou non (sinon son absence dirait « n'a pas répondu à ce texte »).
- {version} : le numéro de version écrit dans le script de la page, 1 à la première publication de la page de l'essai, plus 1 à chaque correctif (§9, « Correctif »), pour chaque version qui a servi pendant la séance : celle sous laquelle la séance a été ouverte (premier toucher, §8.4), puis, si un toucher compté dans la durée de la séance (§8.4) a lieu sous un autre numéro que le dernier écrit, ce numéro, séparé par « , puis » (« 1, puis 2 »). Une séance affichée par une version mais ouverte sous la suivante n'écrit que la suivante. C'est le même numéro que la ligne « Version de la page » du bloc de diagnostic (§8.13).
- « Boutons touchés » n'existe qu'aux séances 2 à 14 (« Relire » et « Passer » sont dans Deviner, écran 2.1).
- {titulaires} : « pas attribué », ou la liste dans l'ordre Agathe, Nassim, Odile, Valentin, vous (« A », « A et B », « A, B et C »).
- {S} : « Sécurité », « Liberté individuelle », « au milieu entre Sécurité et Liberté individuelle » ou « sans choix entre Sécurité et Liberté individuelle » ; de même pour P, T et L.
- {bouton} : le libellé exact du bouton, majuscule comprise. Une question de séance sans réponse ne donne pas de ligne ; la raison de l'arrêt et F2 écrivent « pas de réponse ».
- Copie en cours d'essai (depuis la confirmation de « Tout effacer ») : le carnet porte « Essai en cours : carnet copié au jour {k}. » (ou « … à l’entrée. »), ne porte ni « Raison de l’arrêt » ni « Questions de fin », et s'arrête au bloc de la séance en cours ; les durées encore ouvertes de ce bloc s'arrêtent au toucher de « Copier mon carnet d'abord ». Les « Titres de la semaine » déjà tombés restent à leur place, après le bloc du jour 7 ou 14 ; vient ensuite « Sur tout l’essai » (mêmes règles qu'à l'arrêt). Le carnet ne dévoile rien avant le téléphone : avant d'avoir lu la révélation du jour, le porteur ne peut pas atteindre Moi › Réglages (la séance s'ouvre sur le message de 18h et la croix des révélations est inactive, §7.1).
- À l'arrêt, les durées encore ouvertes s'arrêtent au toucher de confirmation « Arrêter l'essai » ; à la clôture, au « Continuer » qui suit F1 et ouvre la page de l'export (§7.4).
- Le bloc « Titres de la semaine » suit le bloc du jour 7 ou du jour 14. Le bloc « Questions de fin » est absent en cas d'arrêt avant le jour 3 ; « Où vous placez chacun : question passée. » si F1 a été sautée ; sinon « Où vous placez chacun : » (deux-points final, sans point), suivi des quatre lignes. Une case laissée vide s'écrit « sans choix entre … ».
- « séance k » s'écrit « jour k », le mot de la barre que voit le porteur.

### 8.13 Quand l'essai ne se lance pas (UX)

L'essai se joue seulement depuis l'icône « Essai » de l'écran d'accueil (D-019). Ailleurs, la page ne lance pas l'essai, n'écrit rien et ne montre rien de la partie : elle affiche l'un des écrans ci-dessous (situations détectées : §8.8). Comme au §8.11, l'écran remplace tout le cadre, sans téléphone, ni barre, ni bande, mais avec le pied de page (§8.2) ; fond neutre, police du système, titre en gras ; tout tient sur un écran de téléphone, encadrés repliés fermés à l'arrivée. Aucun bouton n'est mis en avant : l'action se passe hors de la page. L'adresse s'affiche en entier, en texte sélectionnable, jamais en lien : dans un cadre, un lien s'ouvrirait au mauvais endroit. La page applique les règles 1 à 3 du §7.8, sauf à l'adresse (aucune règle) et au bloc de diagnostic (règle 1 seulement, §8.12). Ces écrans reprennent ceux de la page-test ; le porteur ayant déjà l'icône, le message principal n'est plus « ajoutez-la » mais « ouvrez-la », et l'ajout passe dans un encadré replié, précédé d'une mise en garde.

**1. Onglet de Safari, sur iPhone ou iPad**
- Titre : « Ouvrez plutôt l'icône « Essai » »
- Dessous : « L'essai se joue depuis l'icône « Essai » de votre écran d'accueil : c'est elle qui garde votre avancement. Ici, dans Safari, la page ne lance pas l'essai et n'enregistre rien. »
- Dans un panneau : « Pour y aller : revenez à l'écran d'accueil, puis touchez l'icône « Essai ». »
- Encadré replié « Pas d'icône « Essai » sur cet écran d'accueil ? » :
  - « Vous avez déjà commencé l'essai ? N'ajoutez pas de nouvelle icône. Cherchez-la sur vos autres pages d'écran d'accueil, ou continuez sur l'appareil où vous avez commencé. Si elle a disparu, dites-le d'abord dans la conversation. »
  - « Pas encore commencé ? Ajoutez-la : », puis :
    1. « Touchez le bouton Partager : un carré d'où sort une flèche vers le haut, en bas ou en haut de l'écran. Vous ne le voyez pas ? Touchez le bouton à trois points (•••), puis « Partager ». »
    2. « Dans la liste, touchez « Sur l'écran d'accueil ». Faites défiler vers le bas si besoin. »
    3. « Le nom proposé est « Essai » : ne le changez pas. L'image à côté doit montrer une fiche blanche sur fond gris, avec un trait bleu ; sinon, touchez « Annuler » et dites-le dans la conversation. Si un interrupteur parle d'« app web », il doit être activé (vert). »
    4. « Touchez « Ajouter », en haut à droite. »
    5. « Sur votre écran d'accueil, touchez la nouvelle icône « Essai ». L'essai commence là. »
  - « « Sur l'écran d'accueil » n'apparaît pas, même en bas de la liste ? La page est sans doute ouverte dans une autre application (la conversation, par exemple), et non dans Safari. Copiez l'adresse, ouvrez Safari, collez-la dans la barre d'adresse, puis reprenez à l'étape 1. Si rien ne marche, dites-le dans la conversation. » ; l'adresse ; un bouton bordé « Copier l'adresse ».
- Encadré replié « Vous avez touché l'icône « Essai » et vous voyez cette page ? » : « L'icône s'est ouverte dans Safari au lieu de s'ouvrir comme une app. Copiez ces lignes, collez-les dans la conversation et gardez l'icône : l'équipe vous dira quoi faire. » ; le bloc de diagnostic (point 5) ; un bouton bordé « Copier ces lignes ».

**2. Autre navigateur, sur iPhone ou iPad** (Chrome, Firefox, Edge… quand il se détecte ; sinon, l'écran 1 s'affiche)
- Titre : « Ouvrez plutôt l'icône « Essai » »
- Dessous : « L'essai se joue depuis l'icône « Essai » de votre écran d'accueil : c'est elle qui garde votre avancement. Ici, dans ce navigateur, la page ne lance pas l'essai et n'enregistre rien. »
- Dans un panneau : « Pour y aller : revenez à l'écran d'accueil, puis touchez l'icône « Essai ». »
- Encadré replié « Pas d'icône « Essai » sur cet écran d'accueil ? » : le premier paragraphe de l'écran 1 (« Vous avez déjà commencé l'essai ? … »), puis « Pas encore commencé ? L'icône s'ajoute depuis Safari : copiez l'adresse, ouvrez Safari et collez-la dans la barre d'adresse. La page vous guidera. » ; l'adresse ; un bouton bordé « Copier l'adresse ».

**3. Dans un cadre, sur un ordinateur, ou sur un autre appareil qu'un iPhone ou un iPad**
- Titre : « L'essai ne s'ouvre pas ici. »
- Dessous : « Il se joue sur votre iPhone ou votre iPad, depuis l'icône « Essai » de l'écran d'accueil. »
- Puis : « Pas d'icône « Essai » ? Ouvrez cette adresse dans Safari, sur l'iPhone ou l'iPad : », et l'adresse.

**4. Copie**
- Adresse : « Adresse copiée : collez-la dans Safari. » ; en cas d'échec : « La copie n'a pas fonctionné : recopiez l'adresse ci-dessus dans Safari. »
- Lignes : « Lignes copiées : collez-les dans la conversation. » ; en cas d'échec, la page sélectionne le bloc et affiche : « La copie automatique n'a pas fonctionné. Sélectionnez tout le texte des lignes, jusqu'à « Fin du diagnostic », copiez-le, puis collez-le dans la conversation. »

**5. Bloc de diagnostic** (écran 1 seulement). Règles du §8.12 : lignes séparées par U+000A, apostrophe U+2019, pas de point final, rien après la dernière ligne. Rien de la partie : ni pseudo, ni réponse, ni heure. {version} : le numéro de version de la page (§8.12), le même que dans le carnet.

```
Diagnostic de l’essai
Version de la page : {version}
Résultat : essai non lancé, page ouverte dans un onglet
Site : {origine}
Page : {seule | dans un cadre}
Ouverte depuis : {l’icône de l’écran d’accueil | un onglet du navigateur}
Écran tactile : {oui | non}
Navigateur : {chaîne complète du navigateur}

Fin du diagnostic
```

**6. Secours**, visible tant que le script n'a affiché aucun écran, dans l'icône comme ailleurs ; écrit directement en typographie d'affichage, puisque le script n'a pas tourné :
- Titre : « La page n'a pas pu démarrer. »
- Dessous : « Ce n'est pas une erreur de votre part, et cette page n'a rien effacé. Dites-le dans la conversation, en précisant d'où vous l'avez ouverte : l'icône « Essai », Safari, ou ailleurs. »

Aucune mesure : hors de l'icône, la page n'écrit rien. À relever dans la conversation : si le porteur arrive sur l'un de ces écrans, et s'il en sort seul.

## 9. Ce qui est contrôlé

Les recalculs sont faits par un programme écrit à part, à partir de cette spécification et des fichiers de `a-ne-pas-ouvrir/` seuls, sans lire le code de la page. Le Vérificateur relit les résultats et les différences.

**Avant d'écrire la page.** Front-end a relu §0, §8.7, §8.8 et §9 (faisabilité confirmée, précisions intégrées) ; Back-end a écrit le schéma (`a-ne-pas-ouvrir/schema.md`) ; UX a écrit les textes des arrêts techniques et la présentation de l'empreinte (§8.11) ; la Direction artistique a confirmé les polices (§8.8) et donné la consigne visuelle du cadre (§8.1).

**Avant d'écrire le fichier scellé.** Le schéma du fichier scellé (noms de champs, types) et le format de la trace (par séance : cartes servies dans l'ordre, auteur, niveau, raison, carte à raison cachée, attributions du joueur et des personnages, côtés attendus, points, titres, phrases, curseurs, personnages affichés dans « Déjà joué aujourd'hui » pour l'heure fournie par le harnais, l'horloge de la page étant injectable dans la version témoin) sont fixés dans `a-ne-pas-ouvrir/schema.md` (Back-end ; rangé dans le dossier caché parce que les noms de certains champs laissent entrevoir les règles de calcul), à faire relire par l'auteur du programme de contrôle. Les points que la partie 6 du schéma laissait ouverts sont réglés : format du carnet (§8.12), mesures globales (§8.4), typographie (§7.8), plusieurs sources (§7.1). La difficulté est réglée une seule fois sur 200 parties de réglage. Protocole : `a-ne-pas-ouvrir/regles-de-calcul.md`, §9 bis.

**Rapport de scellement** (rangé dans `a-ne-pas-ouvrir/`, daté, écrit avec le fichier scellé) : les chiffres constants du fichier (§8.4) et les résultats du réglage ; détail au §9 bis du fichier caché.

**Avant d'écrire la page et le programme de contrôle.** Deux carnets de référence sont écrits à la main, avec leur journal (un arrêt au jour 4, une clôture), et deux cas chiffrés pour les règles les plus délicates (affectation lexicographique des devinettes, redistribution croisée de cartes identiques), rangés dans `a-ne-pas-ouvrir/` : les deux programmes s'y mesurent avant de se comparer entre eux.

**Avant la séance 0.** L'empreinte du fichier scellé est publiée dans la conversation, avec la date et l'heure, et dans un commit poussé sur `main`. La date écrite dans un commit est celle que choisit son auteur : ce qui horodate de façon indépendante de celui qui scelle, c'est l'heure de la poussée, enregistrée par GitHub dans le journal d'activité du dépôt. L'empreinte est publiée avant que la page de l'essai remplace la page-test : sinon, une ouverture de l'icône par habitude lancerait la séance 0 avant elle (UX).

**Parties témoins et parties au hasard, avant de donner la page au porteur.** Les parties témoins sont trois parties jouées sur la page par des joueurs témoins, chacun écrit pour couvrir des cas précis ; les parties au hasard sont 200 parties jouées avec des coups tirés au hasard. Elles remplacent les contrôles qui auraient demandé les réponses du porteur. Les unes et les autres sont rejouées par la page et par le programme indépendant, trace contre trace (protocole : §9 bis du fichier caché). La trace est produite par une version de la page construite à part pour les parties témoins ; la version du porteur ne contient aucune fonction de trace, ni d'autre export que « Copier mon carnet ».

- Une seule source (Front-end). Le fichier témoin est le fichier porteur plus un bloc de script, qui lit les résultats du moteur et écrit la trace sans rien modifier ; le contrôle 5 compare les deux fichiers (seules différences permises : ce bloc et son empreinte dans la politique de sécurité). Code non minifié.
- Le moteur (sélection, carte à raison cachée, devinettes, points, titres, badges, portrait, phrases) n'accède ni à l'écran, ni au stockage, ni à l'horloge, ni au hasard : il reçoit les coups, le fichier scellé et l'heure. Seule l'interface lit l'heure (heure de Paris, à la minute, tronquée, au premier toucher de chaque séance et à chaque affichage de « Déjà joué aujourd'hui ») ; la trace consigne l'heure lue et les visages affichés.
- Rejeu, sans rien ajouter à la page : un navigateur sans tête (Chromium et WebKit au moins), heure et fuseau (Europe/Paris) fixés par l'outil de test, joue par l'interface les parties témoins et au moins dix parties au hasard, une fois sur chaque version, en trouvant les boutons par leur rôle et leur nom. Les deux versions sont servies à l'adresse de l'essai et jouées dans le contexte de l'icône, réglé par l'outil comme au contrôle 14 ; rien n'est ajouté à la page. Il vérifie : texte affiché identique, écran par écran, dans les deux versions ; coups gardés dans le stockage identiques aux coups joués ; trace témoin identique à celle du programme indépendant. Les 200 parties au hasard sont rejouées par le moteur de la version témoin.

1. Empreinte : SHA-256 du fichier scellé (JSON canonique) égal à l'empreinte publiée ; données embarquées identiques ; vecteurs de test reproduits ; typographie simple dans les chaînes affichées du fichier scellé (ni U+2019, ni U+00A0, ni U+202F ; « ? », « ! », « ; », « : », « » », « % » toujours précédés d'une espace, « « » toujours suivi d'une espace ; adresses, codes, dates et heures non concernés ; liste : `a-ne-pas-ouvrir/schema.md`, partie 4.1).
2. Profils : conformes au §1 et aux contraintes de `a-ne-pas-ouvrir/profils.md` ; aucune étiquette politique.
3. Réponses : toutes les réponses des personnages, recalculées par les règles de `a-ne-pas-ouvrir/regles-de-calcul.md`, réponses atypiques comprises.
4. Absences : celles prévues ; un absent ne répond pas et ne devine pas.
5. Code de la page : aucun appel au hasard du navigateur (le repère de la page-test n'est pas repris), aucune évaluation de code, aucun attribut style ni gestionnaire écrit dans le HTML, aucun effacement global du stockage, aucun formatage, dans le moteur ou l'interface, qui dépende de la langue du navigateur (ni `Intl`, ni `toLocale…`, ni `Date` pour lire une date scellée) ; réponses des personnages lues dans les données scellées ; les réponses des personnages ne dépendent en rien de celles du porteur ; la sélection n'utilise pas les profils cachés ; aucune des sorties interdites au §8.8 ; compte simulé ; la version du porteur et la version témoin ne diffèrent que par la trace. Publication et mémoire (§8.8) : en tête du fichier, les balises du §8.8, dans leur ordre ; dans la politique de sécurité, les empreintes des deux seuls blocs, de script et de style ; tous les textes affichés, sauf la vue de secours, dans le bloc de script ; détection du contexte identique à celle de la page-test v2 ; aucune décision fondée sur l'adresse ou l'origine de la page ; aucun accès à la mémoire avant la détection du contexte ; hors de l'icône, aucune écriture ni lecture de la mémoire ; aucune clé hors du préfixe « elenchos-essai: » ; la clé `elenchos-essai:sonde-icone` jamais lue, écrite ni effacée, sauf par « Tout effacer » ; ni cookie, ni `sessionStorage`, ni IndexedDB, ni Cache Storage, ni service worker, ni manifeste ; aucune image créée hors `data:`. L'arbre du commit de `gh-pages` à publier ne contient que `.nojekyll`, `essai/index.html` (la version du porteur, jamais la version témoin) et `essai/apple-touch-icon.png`, cette image identique octet pour octet à celle de la page-test.
6. Parties témoins et au hasard : sélections et carte à raison cachée reproduites.
7. Parties témoins et au hasard : devinettes des personnages reproduites.
8. Parties témoins et au hasard : points, titres et badges reproduits.
9. Parties témoins et au hasard : portrait et phrases reproduits.
10. Parties témoins et au hasard : lignes rouges sur tout ce qui a été affiché (jamais la réponse du porteur à côté d'une autre, aucun taux d'accord, aucun classement, jamais « n'a pas joué »).
11. Textes : toutes les chaînes affichées sur les parties témoins sont relevées et comparées aux maquettes finales, à l'annexe C et aux textes du cadre des §7 et §8 ; une chaîne absente des deux est un défaut, ponctuation (§4.6), élisions et accords (§7.6), mandat et groupe (§7.10) compris ; « d' » est attendu devant les noms que `a-ne-pas-ouvrir/schema.md` (partie 2.8) marque `d'`, « de » devant tous les autres ; les règles du §7.8 sont appliquées aux chaînes des maquettes et de l'annexe C avant la comparaison ; au rejeu à 320 px de large, aucune coupure automatique de ligne (une fin de bloc ou un retour à la ligne voulu n'en est pas une) ne tombe juste avant « ? », « ! », « : », « ; », « » », « · » ou « % », ni juste après un chiffre ou le trait d'union d'un sigle de groupe (`a-ne-pas-ouvrir/schema.md`, partie 2.7) ; dans le relevé, pris bloc par bloc, aucun chiffre n'est suivi d'une espace U+0020. Ne sont pas concernés : la zone du carnet, l'empreinte, la graine et le fichier scellé montrés au dévoilement. Les phrases du vote (§7.9) attendues pour chaque texte sont calculées par le programme de contrôle à partir du fichier scellé (« 1er », mois, U+00A0) et comparées au relevé ; aucune chaîne du vote (issue, date, étape) n'apparaît pour un texte pas encore révélé (2.1, « Relire », 5.4 d'avant la révélation). Relevé relu par UX.
12. Export : sur les parties témoins et au hasard, le texte exporté ne contient que les lignes du gabarit du §8.12 ; le pseudo n'y figure jamais. Pour les trois parties témoins et dix parties au hasard, trois variantes rejouées avec la même horloge, les mêmes gestes et la même version de la page, seules les réponses du porteur changeant (positions opposées ; toutes neutres ; mêmes positions avec d'autres raisons, dont « aucune ») : tous les blocs de séance et le bloc « Questions de fin » sont identiques octet pour octet, durées remplacées par « ‹durée› » comme au contrôle 13 ; seuls « Titres de la semaine » et « Sur tout l'essai » peuvent différer. Une partie arrêtée au jour 8 avec des réponses à 4 des 6 textes révélés affiche « pas de chiffre » aux trois lignes de « Sur tout l'essai » (Juridique) ; avec des réponses à 5 des 6, elle affiche les chiffres (sauf la deuxième ligne si aucune carte du porteur n'a été servie).
13. Version du porteur : les trois parties témoins sont rejouées par automate sur la version donnée au porteur (octets du commit de `gh-pages` préparé pour la publication, servis et joués comme au contrôle 14) ; le carnet qu'elle exporte est comparé à celui que le programme de contrôle calcule à partir du fichier scellé et du journal du harnais (durées masquées). Le numéro de version de la page servie à chaque chargement entre dans ce journal : le harnais le tient du programme de construction, qui l'écrit à côté du fichier construit, jamais du code de la page ; la ligne « Version de la page » est ainsi comparée comme les autres. Toute différence est un défaut.
14. Navigateur et publication. L'équipe n'a pas d'iPhone et ne peut pas ouvrir `ppcrepin.github.io` depuis son environnement. Elle vérifie donc la version du porteur hors de l'appareil, avec un joueur témoin, dans un navigateur sans tête (Chromium et WebKit), avant de donner la page et à chaque correctif ; ce qui ne se vérifie que dans l'icône l'a été par la page-test v2, chez le porteur (plus bas). Le porteur n'a pas d'autre geste technique que l'ajout de l'icône, fait une fois (D-019), et, après une publication, fermer puis rouvrir l'app, comme pendant la page-test.

Rejeu sans rien ajouter à la page. L'outil de test sert lui-même, à l'adresse de l'essai, les octets de `essai/index.html` et de `essai/apple-touch-icon.png` lus dans le commit de `gh-pages` préparé pour la publication, et refuse toute autre requête en la consignant (aucune ne sort). Il présente à la page le contexte de l'icône : un iPhone (nom de navigateur pris dans la liste d'appareils de l'outil, jamais celui du porteur, qui reste dans la conversation ; largeur ; écran tactile), en mode app (la propriété du navigateur que la page lit pour reconnaître l'icône, fixée par l'outil avant tout script de la page, comme l'heure et le fuseau). Il ne contourne pas la politique de sécurité de la page. La page exécute ainsi les mêmes octets, par le même chemin de code, que chez le porteur ; elle ne sait pas qu'elle est testée. Les mêmes réglages servent au contrôle 13 et aux rejeux du préambule ; changés (sans mode app, autre nom de navigateur, ordinateur, cadre), ils rejouent les vues hors de l'icône.

(a) Réseau : pendant une séance entière, aucune requête de la page après son chargement ; au chargement, au plus la page et l'image de l'icône, à leur adresse fixe, sans paramètre ; de même dans chaque contexte hors de l'icône.
(b) Mémoire. Sans tête, avec un profil gardé sur disque : un coup validé survit à la fermeture du navigateur, au lendemain (horloge avancée d'un jour) et à une nouvelle publication (un correctif, servi à la même adresse, reprend la partie à l'étape suivante sans faire rejouer un coup) ; chargée sur une mémoire qui contient la clé de la page-test, la page de l'essai commence à l'entrée et n'en affiche rien. Dans l'icône, sur le même stockage : la page-test v2 le vérifie (plus bas). La tenue au-delà de sept jours repose sur WebKit (§8.8). Un correctif chargé en cours de séance donne, dans le bloc de cette séance, « Version de la page : 1, puis 2. ».
(c) Une seule mémoire. Sans tête : dans chaque contexte hors de l'icône (onglet d'iPhone ou d'iPad, iPad qui se présente comme un Mac compris ; autre navigateur ; ordinateur ; cadre d'une autre origine), la page affiche la vue prévue, ne lance pas l'essai et n'écrit rien (mémoire inchangée après le chargement et après un toucher sur chaque bouton) ; une page d'une autre origine, ouverte dans le même navigateur, ne lit rien de ce que la page a gardé. Par l'API GitHub, avant la première publication de la page de l'essai et à chaque correctif : aucun autre dépôt du compte n'a de site Pages, et il n'existe pas de site à la racine (dépôt `ppcrepin.github.io`) ; rien d'autre n'est publié à cette adresse pendant l'essai. L'inventaire ne voit que les dépôts accessibles à l'équipe ; s'il en manque, l'équipe le dit. Dans l'appareil, qu'un onglet de Safari à la même adresse ne lise rien de la mémoire de l'icône : montré par la page-test si son étape facultative a été faite ; sinon, hypothèse appuyée par WebKit, sans effet sur la règle « une seule mémoire », puisque l'essai ne se lance que dans l'icône.
(d) Après « Tout effacer », il ne reste aucune clé « elenchos-essai: », clé de la page-test comprise ; une clé hors de ce préfixe, posée par l'outil avant la partie, est intacte.
(e) Copie. Sans tête : le texte copié par « Copier mon carnet » est identique, octet pour octet, à celui de la zone (apostrophes, lignes vides, « Fin du carnet » sans retour final). Depuis l'icône, collé dans la conversation : la page-test l'a montré avec son bloc témoin, copié par la même première méthode (presse-papiers appelé dans le geste) ; au premier carnet réellement collé, l'équipe vérifie en plus les règles du §8.12.
(f) Politique de sécurité : sur les octets à publier, une requête lancée depuis la page par l'outil (fetch, image hors `data:`, script, style, police, formulaire) est refusée ; une copie dont le bloc de script diffère d'un octet affiche la vue de secours, jamais une page blanche ni l'essai.
(g) Publication, à chaque publication : (1) l'objet Git `essai/index.html` du commit poussé sur `gh-pages` a le même SHA-256 que les octets contrôlés, lu par Git puis par l'API GitHub, et `essai/apple-touch-icon.png` est l'image de la page-test ; l'arbre ne contient que les trois fichiers du §8.8 ; (2) l'API GitHub montre le déploiement Pages de ce commit réussi (dernière construction : état `built`, commit égal au commit poussé) ; son heure, donnée par GitHub, est l'heure de publication ; (3) si l'équipe peut lancer une tâche GitHub Actions (outillage rangé sur `main`), cette tâche lit la page servie et son image depuis les machines de GitHub, au moins dix minutes après le déploiement, compare leurs SHA-256 (corps décompressé) aux objets Git et relève les en-têtes. Sans ce droit, l'équipe le dit à la livraison : que la page servie soit le fichier construit n'est alors établi que par (1) et (2), c'est-à-dire par ce que GitHub déclare avoir déployé, pas par une lecture de la page servie. Sur l'iPhone, deux choses seulement se vérifient : le fichier scellé embarqué (V1 à V5 à chaque chargement, puis la comparaison du porteur à l'empreinte publiée, §8.6), et le fait que le script exécuté est celui dont la politique de sécurité servie porte l'empreinte (f) ; cette politique voyageant dans la page elle-même, elle ne prouve pas que la page servie est le fichier construit.

(h) Mise en page (§8.1). Sans tête, sur la version du porteur, dans le contexte de l'icône, en clair et en sombre, à des tailles de fenêtre fixées d'avance : chaque seuil de part et d'autre (599 et 600 px de large ; 899 et 900, 499 et 500 px de haut ; fenêtre carrée et à peine plus large que haute), 320 × 548 px (iPhone SE en affichage agrandi), et les tailles des iPhone et iPad de la liste d'appareils de l'outil, en hauteur et en largeur. Sur chaque écran des parties témoins, avec chaque note et avec la confirmation de « Jour suivant » : la disposition attendue pour la taille ; la page elle-même ne défile pas, sauf si l'écran du jeu tomberait sous 200 px, et il en a alors 200 ; l'écran du jeu fait au moins 200 px en disposition compacte, de 480 à 740 px en planche ; barre et bande entièrement dans la fenêtre, sans chevauchement avec le milieu ; aucun défilement de côté ; quand une note apparaît, l'élément touché garde sa place ; au moins 16 px entre une cible du cadre et une cible du téléphone, et 44 px de haut pour une cible du cadre. Retours : téléphone défilé, puis une page du cadre ouverte et refermée, puis l'écran tourné et redressé : même écran, même défilement, même saisie, et mémoire inchangée pendant l'écran couché, l'app restée au premier plan ; relance avec une page du cadre ouverte : la même page ; avec une confirmation ouverte : pas de confirmation. Par relecture du code : disposition choisie par des requêtes média sur la taille de la fenêtre, jamais d'après le nom de l'appareil ni la place du clavier ; chaque marge du §8.1 part de la zone sûre ; le script ne change jamais `theme-color`. Captures en clair et en sombre, en couleur et en niveaux de gris, pour les deux tests de la Direction artistique (§8.1). L'outil ne reproduit ni les zones sûres, ni le clavier, ni la barre d'état d'iOS : ces trois points ne se voient que sur l'appareil.

(i) Durées (§8.4, §8.8). Les contrôles 12 et 13 les masquent : elles sont vérifiées ici, sans masque, sur un scénario écrit d'avance avec ses valeurs attendues, calculées à la main. L'outil fixe l'horloge (la date et l'horloge des durées) et fait passer la page en arrière-plan puis au premier plan (état de visibilité et événement fixés par l'outil, comme le mode app ; rien n'est ajouté à la page). Cas couverts : un toucher, une pause au premier plan, dix heures en arrière-plan, un retour, un dernier toucher (la durée compte la pause, pas les dix heures) ; une journée laissée en arrière-plan sur « En attendant » jusqu'au lendemain, puis « Jour suivant » et « Aller au jour suivant » (la nuit n'est pas comptée) ; l'app fermée en arrière-plan (navigateur fermé, profil gardé), rouverte le lendemain (la durée reprend où elle en était) ; un arrêt brutal au premier plan, provoqué par l'outil (Chromium : seul manque le temps écoulé depuis la dernière écriture) ; un passage par l'écran couché (son temps compte, son toucher non) ; l'heure du téléphone changée pendant une durée (sans effet) ; un correctif chargé en cours de séance (« Version de la page : 1, puis 2. »). L'outil ne reproduit pas les moments où iOS ne signale pas la page cachée (Centre de notifications, appel en bandeau, feuille de navigation ouverte par-dessus l'app) : ils comptent alors comme du premier plan.

Page-test v2 (D-019). Publiée à l'adresse de l'essai avant d'écrire la page, sans rien de l'essai, elle vérifie dans l'icône du porteur ce que l'équipe ne peut pas vérifier : trois ouvertures, la première, une minute après la fermeture de l'app, puis le lendemain (au moins 20 h après la première), après la publication d'une version 2. Réussite si, aux trois ouvertures, les lignes collées disent « Site : https://ppcrepin.github.io », « Page : seule », « Ouverte depuis : l’icône de l’écran d’accueil », le même repère, et une ligne « Navigateur » sans CriOS, FxiOS ni EdgiOS ; « Résultat : mémoire conservée » aux ouvertures 2 et 3, avec « Ouvertures comptées » d'au moins 2, puis d'au moins 3 (iOS peut recharger la page de lui-même) ; « Version de la page : 2 » à la troisième ; un bloc témoin identique octet pour octet. Facultatif, pour (c) : depuis un onglet de Safari, « Mémoire de l’icône lisible depuis cet onglet : non ». Le résultat reste dans la conversation (D-017) : ni heure ni version d'iOS dans le dépôt. La page de l'essai n'est publiée qu'après cette réussite ; elle remplace la page-test à la même adresse.

Si la page-test échoue dans l'icône (mémoire perdue, repère changé), la page de l'essai n'est pas publiée pour l'icône : il reste la même page, ouverte sur un ordinateur, ce qui modifie D-017 (nouvelle question au porteur, D-019) ; elle serait construite pour ne se lancer que là, et les mêmes contrôles seraient refaits. Si (b), (c), (d), (f), (h) ou (i) échoue sans tête, c'est un défaut de la page, corrigé avant publication. Si l'inventaire de (c) trouve un autre site Pages sur le compte, l'équipe le soumet à Juridique avant la séance 0. Aucun stockage distant, claude.ai compris, n'est un repli sans décision du porteur : il modifierait D-016. Chez le porteur, la page refait sa vérification de la mémoire à chaque chargement (§8.8), et la barre affiche « Jour n sur 14 » à la réouverture : une partie perdue se voit aussitôt. Une publication dont `essai/index.html` a exactement les octets de la précédente (même SHA-256) ne refait que (g) et l'inventaire de (c) : les autres contrôles portent sur ces octets et restent acquis. Toute publication qui change un octet de la page est un correctif (ci-dessous).

**Correctif.** Un défaut trouvé avant la séance 0 : on corrige, on re-scelle, on publie une nouvelle empreinte datée, on rejoue tous les contrôles. Après la séance 0, le fichier scellé ne change plus. Un correctif de la page augmente le numéro de version écrit dans le script et refait, avant d'être poussé, les contrôles 5 à 14 avec une version témoin reconstruite, et l'étape 2 du contrôle 1 (données embarquées identiques au fichier scellé) ; le contrôle 14 b y vérifie qu'une partie gardée par la version précédente reprend à l'étape suivante sans rejouer un coup (si le format de l'état doit changer, le correctif lit l'ancien format, et ce passage est rejoué). La publication est un nouveau commit sur `gh-pages`, jamais une réécriture, qui ne change que `essai/index.html` ; la preuve (contrôle 14 g) est refaite. L'heure de publication est celle du déploiement, donnée par GitHub. L'équipe l'annonce dans la conversation au moins dix minutes après la fin du déploiement (durée de cache de GitHub Pages), avec une seule consigne : avant la séance suivante, fermer l'app « Essai » puis la rouvrir, comme pendant la page-test (une app restée ouverte garde l'ancienne version). La première publication de la page de l'essai, qui remplace la page-test, s'annonce de la même façon. Le bilan lit dans le carnet la version qui a servi à chaque séance (ligne « Version de la page », §8.12) : une séance ouverte sans cette réouverture a pu tourner sur l'ancienne version, et la ligne le dit. Si le défaut touche un calcul déjà montré, le bilan de l'essai marque l'essai comme affecté à partir de la première séance où la version fautive a montré ce calcul.

**Après l'essai.** Le Vérificateur relance les contrôles 1 à 4 sur le fichier dévoilé. Sur le carnet du porteur : aucun calcul ne cherche à retrouver les réponses du porteur à partir du carnet (pas d'essai de réponses possibles pour reproduire un chiffre).

15. Chiffres à rapporter : justesse du porteur par semaine, comptée à la révélation (semaine 1 : textes 1 à 5 ; semaine 2 : textes 6 à 12 ; texte 13 à part), sur toutes les cartes servies, passes et cartes sans attribution comprises (sinon passer ferait monter le chiffre) ; la même justesse sans les réponses atypiques, calculée par l'équipe avec le fichier scellé (vraie mesure de l'apprentissage : les réponses atypiques sont faites pour ne pas se deviner) ; repère indicatif, hypothèse de Game design non validée : 35 à 65 % en semaine 2 (au hasard, environ 25 %) ; pas un critère de décision (D-008) ; croisement des erreurs avec la question 1 du carnet ; chiffres globaux du §8.4. Le §9 bis calcule le joueur simulé de la même façon.

## Annexe A : ce que Contenu fournit

18 textes : 17 retenus (E1 à E3, puis 1 à 14) et 1 de réserve (T). La seconde réserve prévue (P) est vide : aucun texte P de sens 1 avec un vrai argument au pôle 1 dans le matériau (constat de Contenu, 5 octobre 2026).

Pour chaque texte : titre et trois lignes ; vote : issue, date et étape (§7.9), relevées sur la page du scrutin et le dossier législatif, puis vérifiées par un second agent, tout écart tranché avant le scellement ; auteur, avec son mandat (député ou sénateur) et son groupe au dépôt (§7.10) ; lien du scrutin et sources ; tension (S, P, T ou L) et sens s ; quatre considérations dans l'ordre d'affichage, chacune avec texte, côté, pôle (0, 1 ou aucun), député et groupe à la séance de l'extrait (§7.10). Chaque groupe s'écrit par son libellé court (§7.10), pris dans la liste fermée de `a-ne-pas-ouvrir/schema.md` (partie 2.7), que Contenu remplit avant le scellement, avec la source de chaque ligne.

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
11. Sous le vote (2.7d, 1.6, 5.4), la date : « Le 9 octobre 2024. » en 2.7d, « texte adopté le 9 octobre 2024 » en 1.6, « adopté le 9 octobre 2024 » en 5.4 (date inventée) ; puis, selon le texte, « Le Sénat devait encore voter. » ou « C'était le vote définitif du Parlement. » (§7.9).
12. Si un texte n'a pas eu de vote sur l'ensemble : « Texte ni adopté ni rejeté. » ; « Le {date}, son article unique a été adopté, mais la séance a pris fin à minuit sans vote sur l'ensemble du texte. » ; en 5.4, « Vote : ni adopté ni rejeté. » (§7.9).
13. Si un texte a été déposé par un sénateur : « Proposé par {nom}, sénateur, {groupe}. » (ou « sénatrice »), en 2.7e et en 5.4 ; en 5.4, le mot du mandat s'ajoute au gabarit validé, qui ne l'écrit pas pour un député (§7.10).
14. Règle d'affichage, à dire avec la liste : le mandat et le groupe de l'auteur sont ceux du jour du dépôt, même si le vote a eu lieu plus tard, parfois dans une autre législature ; un groupe peut donc s'afficher sous un nom qu'il ne porte plus. Le groupe de l'auteur d'une raison est celui du jour où il l'a dite (§7.10).

**Dans le téléphone, forme seulement (aucun mot ne change) :** typographie à l'affichage (§7.8 : apostrophe courbe, espace fine avant « ? », « ! », « ; », « % » et entre les tranches d'un nombre, espaces insécables dans les dates et après un nombre) ; sigle de groupe jamais coupé en fin de ligne (§7.10) ; en 5.4, « Proposé par … » passe au paragraphe suivant (§7.9) ; vrai italique d'Alegreya Sans pour la raison devinée ; barre d'état en police du système (§8.8) ; sur iPhone, et sur iPad tenu en largeur (sauf le 13 pouces) ou en écran partagé, le téléphone n'est plus dessiné : l'écran du jeu garde un contour, sans barre d'état dessinée (la vraie est juste au-dessus), et prend toute la hauteur entre la barre et la bande ; sur iPad tenu en hauteur et sur l'iPad 13 pouces, le téléphone dessiné des maquettes, inchangé (§8.1).

**Dans le téléphone, validés ailleurs mais jamais dessinés :** « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » ; « Agathe a réussi à te surprendre deux fois. » ; « Le vote et les auteurs : {jour} à 18h » ; une carte bien devinée à 18h (« Ton pari : {prénom}. », le visage, « Tu connais ton monde. »).

**Dans le téléphone, texte validé employé dans un cas nouveau :** « Nouveau texte dans … » dans un cercle de cinq (D-011 ne le prévoit que sous trois membres).

**Dans le téléphone, seuls les noms changent :** prénoms, « Amis », vrais textes, vrais députés, groupes (par le libellé court qu'imprime l'institution, le plus souvent un sigle, §7.10) et votes ; « Tu as rejoint Amis. », « Agathe te lance un défi », « Les titres de la semaine · Amis », « {Pseudo} décroche Le Sans-Faute. », « toi@exemple.fr » ; élisions et accords (§7.6).

**Dans le cadre, tout est nouveau :** la barre, « Arrêter l'essai » et son parcours (§8.10), la confirmation de « Jour suivant », la note sur 18h et le message de la séance 0 avec son bouton « Continuer » (§8.2) ; la fiche « Qui est qui » ; « Pas dans l'essai. » ; la note du compte simulé ; la note « Qui, durée, droits » ; le carnet ; la note du texte 14, « Continuer », « L'essai est fini. Deux questions, votre carnet à copier, puis le dévoilement. » ; F2 et F1 ; le dévoilement ; « Copier mon carnet », « Carnet copié : collez-le dans la conversation. », la consigne de copie manuelle et « Fin du carnet » ; les trois arrêts techniques et le message d'empreinte (§8.11) ; les textes d'effacement (§8.9) ; le pied de page : hébergement, et source des données de l'Assemblée dans l'icône (Juridique, §8.2) ; les écrans affichés quand l'essai ne se lance pas (onglet de Safari, autre navigateur, cadre ou ordinateur), leurs messages de copie, le bloc de diagnostic et l'écran de secours (§8.13) ; « Votre carnet du jour » (page « Fin de la journée », §8.3) ; « Fermer » (fiche « Qui est qui », note « Qui, durée, droits ») ; l'écran couché, « Tenez votre {appareil} en hauteur. » et sa phrase (§8.1) ; le nouveau texte de l'arrêt 3 (§8.11) ; la ligne « Version de la page : {version}. » du carnet (§8.12). {appareil} y vaut « iPhone » ou « iPad ». Forme : la coche « ✓ » devant un choix retenu (§8.1).

**Hors de la page :** le nom « Essai » sous l'icône de l'écran d'accueil, et son image, une fiche blanche sur fond gris avec un trait bleu, sans nom ni logo (D-013, D-014). Ajoutés avec la page-test, ils restent pour l'essai : iOS les fige au moment de l'ajout.

## Décisions touchées, conventions et constats

**Décisions modifiées : aucune, une précision.** D-015 prévoit que les réponses simulées soient contrôlées à la fin par le Vérificateur. Elles le sont avant l'essai (contrôles 1 à 4), puis à nouveau à la fin sur le fichier dévoilé ; l'empreinte, que le porteur compare lui-même (§8.6), prouve que le fichier n'a pas changé. Ce que D-016 (plus récent) rend impossible, c'est de recalculer la partie du porteur, ses réponses restant dans son appareil (D-016, D-019) : c'est remplacé par les contrôles 5 à 14 sur les parties témoins et au hasard, et par les chiffres du point 15. D-019 (page publiée sur GitHub Pages, jouée depuis l'icône de l'écran d'accueil) est appliquée aux §8.8, §8.13 et au contrôle 14, avec la précision qu'elle apporte à D-017 (c'est l'icône qui garde l'avancement) ; le nom Elenchos et le compte `ppcrepin` figurent dans l'adresse publique, déjà publics par le dépôt (D-013 non touché). L'export est unique (D-016) ; « carnet de bilan » est lu comme incluant les mesures automatiques du §8.4. La page est décidée en D-016 (« maquette animée, pas l'application ») ; le fichier scellé, le harnais et le programme de contrôle découlent de D-015 : c'est de l'outillage d'essai, pas du code applicatif au sens de D-001 ni de la consigne du porteur « aucun code avant l'étape 6, même jetable ».

**Écarts de forme avec D-014, sans mot changé :** typographie à l'affichage (§7.8 : apostrophe courbe, espace fine avant « ? », « ! », « ; », « % » et dans les nombres) ; barre d'état du téléphone en police du système (§8.8) ; sur iPhone, et sur iPad tenu en largeur (sauf le 13 pouces) ou en écran partagé, le téléphone n'est plus dessiné : l'écran du jeu garde un contour, sans barre d'état dessinée, et la vraie barre d'état d'iOS en tient lieu ; sur iPad tenu en hauteur et sur l'iPad 13 pouces, le téléphone dessiné des maquettes, inchangé (§8.1). Le vrai italique d'Alegreya Sans rétablit l'annotation validée de l'écran 2.2. Ce sont des conventions d'essai ; pour le produit, ce sont des propositions.

**À dire au porteur.** Au début de la fabrication (règle « tenir le porteur au courant ») : la page, le fichier scellé, le harnais et le programme de contrôle sont de l'outillage d'essai, pas l'application. À la livraison de la page :
- la page, le fichier scellé, le harnais et le programme de contrôle sont de l'outillage d'essai, pas l'application (D-001 ; sa consigne « aucun code avant l'étape 6, même jetable ») ;
- la précision sur D-015 ci-dessus ;
- ce que contient le carnet qu'il copiera (§8.4, §8.7), et ce qu'il ne contient jamais ;
- où vivent ses réponses et ce qui peut les perdre (§8.2, §8.8, §8.13) : il joue toujours depuis l'icône « Essai » et ne la supprime pas avant la fin ; ouverte ailleurs (Safari, autre navigateur, cadre, ordinateur), la page ne lance pas l'essai et le dit ; si un jour elle repart du début, il ne rejoue pas et le dit dans la conversation ; l'essai fini et tout effacé, il peut supprimer l'icône. La page de l'essai remplace la page-test à la même adresse : même icône, rien à rajouter. Ce que l'équipe a vérifié elle-même, et ce qu'elle n'a pas pu vérifier depuis son environnement (la page servie ne s'y ouvre pas ; preuve retenue au §9, contrôle 14 g). Rien à lui redemander : l'appareil et la façon d'ouvrir la page sont tranchés (D-017, D-019) ;
- le fichier embarqué se décode, et la v2 de cette spécification, qui contenait les règles de calcul, reste lisible dans l'historique Git : l'essai repose sur sa bonne foi ;
- le dépôt du projet est public sur GitHub, et la page de l'essai aussi (D-019) : tout ce qui y est poussé, y compris `a-ne-pas-ouvrir/` et bientôt le fichier scellé, est lisible par tous ; la page publiée ne contient rien de lui ; son carnet reste dans la conversation, le dépôt ne reçoit que le bilan chiffré, sans dates ni heures (D-017) ;
- la page publiée a une image à côté d'elle, celle de l'icône, et sa politique de sécurité autorise les images de sa propre adresse (`img-src 'self'`, §8.8) ; après chaque publication d'un correctif, une seule consigne : fermer l'app « Essai », puis la rouvrir (§9, « Correctif ») ;
- les textes nouveaux à l'écran (annexe C), dont la typographie à l'affichage (§7.8), le vrai italique d'Alegreya Sans et la barre d'état en police du système (§8.8).

**Conventions propres à l'essai :**
- quatre tensions seulement ;
- semaine 1 incomplète (révélations 1 à 5, réponses 1 à 6) ; texte 13 hors semaine ; texte 14 dévoilé sans attributions ;
- Le Fidèle en semaine 1, sur six textes, avec le libellé « ont répondu chaque jour » (la règle 12 et l'écran 3.3c disent « les sept jours ») ; il revient d'office au porteur s'il joue chaque séance ;
- départage final des titres par tirage ;
- personnages qui ne passent jamais ;
- pas de message de 18h aux séances 2 et 15 ; « Nouveau texte dans … » à la séance 1 (la variante que D-011 liait aux cercles de moins de trois membres sert ici pour un jour sans révélation) ;
- compte simulé, pseudo tapé ;
- arrêt possible à tout moment par « Arrêter l'essai » (§8.10) ; « Jour suivant » toujours actif de la séance 1 à la séance 14, avec confirmation si la journée n'est pas finie ; à l'entrée, pas de « Jour suivant » : elle se termine par 1.9 (§8.2) ;
- typographie à l'affichage (§7.8) et barre d'état en police du système (§8.8), sans mot changé ;
- écrans absents et croix des révélations signalés par « Pas dans l'essai. » (§7.1) ; son propre visage ne réagit pas ; « Tout effacer » actif ; « Qui, durée, droits » ouvre une note dans le cadre, au lieu de la page d'information prévue en 1.3 ;
- écran d'un proche (4.3) : la raison toujours écrite sur les lignes de « Ses surprises » ;
- fiche « Qui est qui » et cadre de l'essai hors du téléphone ;
- vote de l'Assemblée daté et au passé, avec son étape (§7.9) ;
- auteurs et groupes : mandat et groupe au dépôt, groupe de l'orateur à la séance de l'extrait, groupes écrits par leur libellé court, tel que l'institution l'imprime ; « sénateur » en 2.7e et en 5.4 (§7.10) ;
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
- Où ouvrir la page : Front-end recommandait d'abord le fichier local, pensant que claude.ai refuse le stockage du navigateur ; la documentation de l'outil de publication disant le contraire, claude.ai fut retenu en voie principale, le fichier local en repli ; le Vérificateur proposait un hébergement statique privé. Le test de mémoire a ensuite montré que, sur iPhone, une page affichée dans claude.ai perd tout à la fermeture de l'application. Front-end et Juridique ont recommandé ensemble GitHub Pages et l'icône de l'écran d'accueil ; le porteur l'a choisi (D-019). Abandonnés : claude.ai et le fichier local ; l'hébergement privé est dépassé. Dernier désaccord : Front-end acceptait que la page se lance aussi dans un onglet de Safari ; Juridique voulait qu'elle ne s'y lance pas, pour une seule mémoire ; UX de même (un onglet qui repartirait de l'entrée ferait croire la partie perdue) ; Front-end s'y est rangé. Retenu : Juridique ; la page ne se lance que dans l'icône (§8.8), comme la page-test.
- Élision devant un prénom en I qui se prononce « y » : UX proposait de suivre la lettre (« d' ») ; Contenu, l'usage constant du compte rendu de l'Assemblée et la prononciation (« de »). UX s'y range. Retenu : Contenu.
- Libellé des groupes : UX proposait les capitales (« ECOS », « DEM ») et un sigle pour le groupe du Sénat ; Contenu a montré que ce sont des codes internes, ou une forme absente de l'open data. Retenu : Contenu (« EcoS », « Dem », nom en toutes lettres quand c'est la seule forme courte).
- Groupe écrit en plusieurs mots (« Les Républicains ») : Back-end voulait qu'il ne se coupe jamais en fin de ligne, espace comprise (« sénateur, Les » puis « Républicains » se lit mal) ; UX laisse la coupure à l'espace, comme entre deux mots ordinaires, et ne protège que le trait d'union. Retenu : UX (§7.10 est une règle d'UX).
- Phrase des sept jours (§8.2, §8.9) : Juridique la gardait par prudence (avis du 5 octobre) ; Front-end et UX la jugeaient sans objet pour l'icône, et UX y voyait une consigne de rythme. Retenu : retirée ; Juridique s'y range sur la foi de WebKit (§8.8).
- Clé de la page-test (`elenchos-essai:sonde-icone`) : Juridique préférait que la page de l'essai l'efface au premier lancement (minimisation) ; Front-end la laisse en place jusqu'à « Tout effacer » (une écriture de moins ; elle ne contient ni réponse ni pseudo). Retenu : Front-end, qui tient le minimum demandé par Juridique (« Tout effacer » la retire, contrôle 14 d).
- Mise en page sur iPhone (§8.1) : UX et la Direction artistique s'accordent sur l'essentiel (plus rien à la suite du téléphone dans le défilement de la page ; notes toujours au même endroit, dans la bande sous l'écran ; un texte long du cadre prend la place du téléphone ; contour gardé ; pas de barre d'état dessinée sur iPhone ; pied de page hors du jeu). Points tranchés par l'orchestrateur : iPhone tenu en largeur, UX proposait un écran « Tenez votre iPhone en hauteur », la Direction artistique une disposition en deux colonnes ; retenu : UX (une disposition de moins à construire et à tester ; le jeu se tient en hauteur). Confirmation de « Jour suivant », UX la mettait en page du cadre, la Direction artistique dans la bande ; retenu : la bande (courte, elle laisse voir ce que le porteur quitte, à la place du bouton touché). Action d'une page du cadre, UX la plaçait en fin de contenu, la Direction artistique dans la bande ; retenu : la bande (toujours visible, à la place de « Jour suivant »). Barre sur une page du cadre, la Direction artistique gardait tout, bouton « Qui est qui ? » enfoncé ; UX n'y laisse que le libellé du jour ; retenu : UX. Zone de toucher de « Arrêter l'essai » : 24 px (Direction artistique) ou 44 px (UX) ; retenu : 44 px. Zone du carnet à copier : UX la faisait défiler à l'intérieur ; la Direction artistique, un seul défilement ; retenu : la Direction artistique.
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
- Avant un lancement public, à faire relire par un avocat (Juridique) : la page « Qui, durée, droits » complète (RGPD, art. 13) ; le sens de « Tout effacer » face aux titres passés gardés sous le pseudo (art. 17) ; l'analyse d'impact (art. 35) ; l'exemption de consentement pour le stockage du navigateur (art. 82 de la loi Informatique et Libertés) ; les mentions d'identification de l'éditeur (loi du 21 juin 2004, art. 1-1, issu de la loi du 21 mai 2024). Les polices seront alors hébergées par le service.
- Le carnet du jour se remplit derrière « Jour suivant » : un porteur qui laisse sa journée sur « En attendant » le remplira à son retour, un jour plus tard ; la question 1 (« J'aurais pu trouver ») en souffre le plus. À relever au bilan, dans la conversation, sans nouvelle mesure (Game design).
- Rien ici ne dit ce que ressentent de vrais proches (D-015).
