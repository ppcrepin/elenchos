# Spécification de la simulation : essai solo (étape 4)

*Rédigée par Game design le 4 octobre 2026 pour l'essai décidé en D-015 et D-016 (page jouable, quatre personnages inventés, une journée de jeu par séance, 14 jours). Version 3, intégrée par l'orchestrateur après les relectures de Cohérence, UX, Juridique et du Vérificateur (verdict : OK avec corrections ; corrections appliquées). Les précisions ajoutées ensuite par UX (cadre de l'essai) et Front-end (faisabilité) seront revues par Cohérence et le Vérificateur avec la page elle-même. Spécification de travail, pas un texte pour le porteur. Personnages, vies et exemples fictifs.*

*Ce fichier se lit sans gâcher l'essai : profils cachés, règles de calcul des personnages (comment ils répondent, devinent, et comment les cartes sont choisies), réponses atypiques, absences et corrigé de fin d'essai sont dans `a-ne-pas-ouvrir/`. Reste ici, assumé : l'heure de jeu des fiches et la ligne « Déjà joué aujourd'hui » (§7.5), comme dans le produit. Le porteur n'a pas à lire ce fichier : « En bref » et « Décisions touchées » suffisent.*

*Ordre de lecture pour un agent qui applique : §0, §5.1 à §5.4, §6, puis `a-ne-pas-ouvrir/regles-de-calcul.md`, puis le reste.*

## En bref

- **Ce qu'on teste** : le porteur joue seul, quatorze jours de jeu, face à quatre personnages inventés, sur une page aux couleurs de La Tablée tirée des maquettes finales.
- **Ce qui est scellé** : les textes et toutes les réponses des personnages, calculés avant la séance 0 ; l'empreinte du fichier est publiée avant de jouer.
- **Ce qui est calculé en direct** : les cartes servies, les devinettes des personnages, les points, les titres et le portrait, qui dépendent des coups du porteur.
- **Comment on contrôle** : un programme écrit à part refait tous les calculs sur des parties jouées avec des joueurs inventés (§9) ; les réponses du porteur ne quittent jamais son navigateur (D-016).

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
| 15 | clôture | 13 (pas de message de 18h : la séance s'ouvre sur la révélation) | — | — | fiche du texte 14, questions de fin, dévoilement, export (ordre au §7.4) |

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
- Mise en œuvre (Front-end) : la page embarque sa propre fonction SHA-256, synchrone (FIPS 180-4), sans crypto.subtle ; le calcul reste synchrone et marche aussi en fichier local. Au chargement, dans cet ordre : autotest sur les trois exemples de FIPS 180-4 ; décodage du base64 en octets ; empreinte calculée sur ces octets, ceux-là mêmes qui sont lus ensuite, jamais sur un JSON réécrit ; décodage UTF-8 strict et lecture du JSON ; recalcul des trois vecteurs de test. Un échec arrête la page avant la séance 0 (§8.11).
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
  - 5.4 : présent, avec sa variante d'avant la révélation, ouverte depuis l'Historique : « Le vote et les auteurs : {jour} à 18h », sans lien officiel.
  - 5.12 : géré, si aucun personnage n'a répondu la veille ; son « Suivant » mène à la raison, puis à 2.5 ; le lendemain, la révélation commence au vote.
  - 4.2 : huit barres, dans l'ordre fixe ; avant le premier dimanche, aucun titre sous les visages et pas d'encadré « Surprise de la semaine ».
- **Liens vers un écran absent** : rien n'est masqué ; un toucher affiche dans le cadre, sous le téléphone, « Pas dans l'essai. », jusqu'au toucher suivant. Masquer « + Inviter » changerait un écran validé, et le porteur pourrait y lire une règle du produit. Concernés : « + Inviter » et « Amis ▾ » (4.2) ; « Changer · Créer · Quitter » et l'interrupteur du message de 18h (5.7) ; « Renvoyer le code » (1.9).
- **Croix des écrans de révélation** (2.7a à 3.3e) : dans l'essai, elle affiche « Pas dans l'essai. » ; la révélation se lit jusqu'au bout, pour que les titres et la phrase de la semaine ne puissent pas être sautés (le produit ne dit pas comment rouvrir une révélation fermée, C-016).
- **Autres touchers** : « Plus tard » (1.9) a le même effet que « Valider ». « Relire » (2.1) ouvre une feuille comme 2.2 : « Un vrai texte de l'Assemblée nationale · auteur masqué », le titre, les trois lignes, « ← Retour ». « Voir le scrutin sur le site de l'Assemblée » et « Sources : extraits des débats » sont de vrais liens, ouverts dans un nouvel onglet. Son propre visage dans Le Cercle ne réagit pas. « Qui, durée, droits » (1.3 et 5.7) et « Tout effacer » (5.7) : §8.9.

### 7.2 Entrée (séance 0)

- Message d'Agathe (écran 1.1, signé Agathe ; « Agathe te lance un défi ») → « Défi d'Agathe · Texte 1 sur 3 » → carte de consentement au premier toucher sur une position (écran 1.3, D-006) → raison → « Et Agathe ? Sa réponse ? » → révélation immédiate → textes 2 et 3 → bilan (1.7) → compte (1.8 et 1.9) → carnet ; « Jour suivant » ouvre 1.12.
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
4. Dans le cadre : « L'essai est fini. Deux questions, puis le dévoilement. »
5. F2, puis F1 (§8.5).
6. Dévoilement (§8.6).
7. « Copier mon carnet » (§8.7).
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

- Barre permanente : « Jour 3 sur 14 · mercredi » (« Entrée » à la séance 0, « Clôture » à la séance 15) ; juste après, le lien discret « Arrêter l'essai » (§8.10) ; un bouton « Qui est qui ? » ; le bouton « Jour suivant » en fin de séance, toujours actif, jamais à côté de « Arrêter l'essai ».
- « Jour suivant » alors que la journée n'est pas finie : confirmation dans le cadre, « Passer au jour suivant sans répondre ? » (ou « sans finir de deviner ? », ou « sans finir de deviner ni répondre ? ») ; « Ce que vous n'avez pas fait aujourd'hui restera ainsi : vous ne pourrez pas y revenir. » ; « Annuler » · « Passer », même poids visuel. Une position sans raison compte comme pas de réponse. Les conséquences ne sont pas listées : le porteur les découvre comme un vrai joueur. Ensuite : le texte reste sans réponse du porteur (pas de phrase du jour, pas de ligne dans l'Historique, Le Fidèle perdu pour la semaine, les personnages devinent sans sa carte) ; les cartes non attribuées comptent comme passées. La partie témoin (a) couvre ce cas.
- Une fois, à la séance 1 : « Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez. » Le compte à rebours reste affiché dans le téléphone : c'est l'écran testé.
- Une fois, au début de la séance 0 (texte de Juridique, réécrit par UX sans en changer le sens : la liste d'écrans, encore inconnus du porteur à ce moment, devient une règle) :
  « Vos réponses restent dans ce navigateur : personne d'autre ne les voit, l'équipe non plus. En pratique :
  - Jouez sur un appareil à vous, en ouvrant toujours la page de la même façon (même navigateur, ou toujours l'application Claude), et pas en navigation privée : elle oublie tout à la fermeture.
  - Sur un appareil Apple, ne restez pas plus de sept jours sans revenir sur la page : au-delà, l'avancement peut s'effacer.
  - Si un jour la page repart du début alors que vous aviez commencé, ne rejouez pas : dites-le dans la conversation.
  - Dans la conversation et sur vos captures d'écran, parlez du jeu, pas de vos réponses ni de ce que le jeu en dit (vos phrases, votre portrait). »
- La fiche s'ouvre d'elle-même une fois, au début de la séance 0, avant le message d'Agathe ; ensuite, par le bouton seulement, jamais depuis Le Cercle. Ouverte depuis Le Cercle, elle passerait pour une fonction du produit, qui ne montre jamais l'âge, le métier ou la ville d'un proche.
- En-tête : « Qui est qui · fiche d'essai. Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées. »
- Une carte par personne, dans l'ordre des visages. Exemple : « Agathe, 46 ans · sage-femme, Rennes. Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. Joue d'habitude vers 7h40. C'est elle qui vous invite. »

### 8.3 Carnet de bilan (chaque séance)

Sous le téléphone, après « En attendant » (séances 1 à 14 ; séance 0 : §7.2 ; séance 15 : §7.4), avant le bouton « Jour suivant » : un seul écran, une touche par question, environ 10 secondes (estimation). Les questions ne bloquent pas le passage au jour suivant.

1. Seulement s'il y a eu au moins un « Ça alors ! » à la révélation : « Vos erreurs à la révélation : » J'aurais pu trouver · Je ne pouvais pas trouver · Les deux (ce dernier choix seulement s'il y a eu au moins deux erreurs).
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

- **Par séance** (ce que le porteur fait, pas ce qu'il répond) : jour et heure d'ouverture de la séance (à l'heure près) et jours écoulés depuis la précédente, seule mesure du retour observée plutôt que déclarée ; durées de la séance, de Deviner et de Répondre ; nombre de « Relire » et de « Passer » ; dans sa manche Deviner, attributions justes, raison cachée tentée puis trouvée. Risque assumé : la durée de Répondre et le nombre de « Relire » sont attachés à un texte ; ils disent l'hésitation, pas la réponse.
- **Par semaine** (résultats affichés dans le jeu) : titres reçus par le porteur ; titulaires de chaque titre.
- **Sur l'ensemble de l'essai**, un seul chiffre chacun, jamais par séance, par texte, par tension ni par personnage (agrégats pour le contrôle 15) : justesse des personnages sur toutes les cartes ; justesse des personnages sur les réponses du porteur (proportion seule) ; part de réponses atypiques parmi les cartes proposées au porteur ; cartes identiques remplacées, et servies ensemble, dans la manche du porteur ; nombre de raisons « aucune » chez les personnages ; nombre de départages par tirage.
- **Jamais** : une position, une raison, une phrase du jour ou de la semaine, un curseur, le pseudo du porteur ; ni un chiffre lié à un texte précis qui dépend de ses réponses (par exemple « au texte 5, Valentin a trouvé la réponse du porteur »).

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

Un seul export, « Copier mon carnet » (D-016), proposé à la clôture, dans le parcours « Arrêter l'essai » et dans la confirmation de « Tout effacer » (« Copier mon carnet d'abord ») : le carnet, les mesures et agrégats du §8.4, F1 et F2, rien d'autre. Jamais une position, une raison, une phrase du jour ou de la semaine, un curseur ni le pseudo du porteur. Dans tous les cas, le texte copié s'affiche en entier avant la copie : le porteur voit ce qu'il donne. Il se termine toujours par une ligne « Fin du carnet ». Après une copie réussie, et seulement alors : « Carnet copié : collez-le dans la conversation. » Le carnet s'affiche dans une zone de texte en lecture seule. « Copier mon carnet » appelle la copie directement dans le geste, sans attente avant l'appel ; en cas d'échec, une seconde méthode de copie sur la zone sélectionnée ; si les deux échouent, la page sélectionne tout le texte de la zone (avec « Tout sélectionner ») et affiche : « La copie automatique n'a pas fonctionné. Sélectionnez tout le texte ci-dessous, jusqu'à « Fin du carnet », copiez-le, puis collez-le dans la conversation. » Aucun autre export. Dans le dépôt n'entre que ce carnet ; une réponse que le porteur citerait dans la conversation n'y entre jamais.

### 8.8 Ce que la page garde, et où

- Les coups du porteur (positions, raisons, devinettes, passes), son pseudo, son consentement, son carnet, F1, F2, la séance et l'étape atteintes sont gardés dans le stockage de son navigateur, et nulle part ailleurs. Son portrait, les cartes, les points et les titres ne sont pas gardés : ils sont recalculés à chaque ouverture à partir des coups et du fichier scellé. La page n'envoie rien (D-016).
- Voie principale : la page publiée en privé sur claude.ai. Selon la documentation de l'outil de publication (consultée le 4 octobre 2026), chaque page publiée a sa propre origine ; ce qu'elle garde reste dans le navigateur de celui qui la consulte, survit aux nouvelles versions publiées à la même adresse, et n'est visible ni des autres visiteurs ni des autres pages ; le fichier construit est publié tel quel, depuis le disque, sans être recopié. Après publication, la page servie est relue et comparée octet pour octet au fichier construit ; si la plateforme l'a modifiée (enveloppe ajoutée, balises déplacées), la page de jeu est publiée comme fichier annexe servi tel quel, et la comparaison est refaite.
- Repli, si la voie principale échoue : le fichier HTML, ouvert sur un ordinateur, dans le navigateur habituel du porteur ; toujours le même fichier, au même endroit. Limites du repli : ordinateur seulement ; Chrome partage probablement le stockage entre fichiers locaux (un autre fichier HTML local pourrait le lire : à soumettre à Juridique avant d'y recourir) ; Firefox et Safari le gardent peut-être propre à chaque fichier (renommer ou déplacer le fichier ferait perdre la partie).
- Le stockage peut revenir vide en navigation privée (ce qui ne se détecte pas) ou si les données du site sont effacées. Safari efface le stockage d'un site après sept jours d'utilisation de Safari sans visite. L'application Claude peut ouvrir les pages dans sa propre vue, avec un stockage distinct de celui du navigateur : le porteur ouvre toujours la page de la même façon (même appareil, même navigateur ou même application).
- Mise en œuvre (Front-end) : clés préfixées « elenchos-essai: », jamais d'effacement global du stockage. Chaque coup validé est écrit aussitôt ; après un rechargement, la page reprend à l'étape suivante et ne fait jamais rejouer un coup validé. L'état porte un numéro de format et un compteur d'écritures, vérifié avant chaque écriture : si un autre onglet l'a changé, la page s'arrête et propose « Reprendre ici », qui la recharge (§8.11). Quand on revient sur un onglet, la page relit l'état gardé avant tout toucher et se recharge s'il a changé, ce qui rend cet arrêt rare. « Jour suivant » est désactivé dès le premier toucher. Au chargement, la page écrit, relit et efface une clé d'essai ; si le stockage ne marche pas, l'entrée ne commence pas (§8.11). La persistance du stockage est demandée quand le navigateur le permet, sans compter dessus.
- Interdits dans la page : le stockage d'artefact de claude.ai (gardé chez Anthropic ; en mode partagé, visible de tous les visiteurs) ; l'appel à Claude, les connecteurs, le téléchargement ; tout script, style, police ou image venus d'ailleurs (Google Fonts, cdnjs, unpkg, jsDelivr…) ; tout envoi (fetch, XHR, WebSocket, formulaire, balise). Seules sorties : les liens que le porteur touche lui-même (scrutin, sources).
- Politique de sécurité, première balise après la déclaration d'encodage : `default-src 'none'; script-src 'sha256-…'; style-src 'sha256-…'; font-src data:; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`, empreintes des blocs calculées à la construction, ni 'unsafe-inline' ni 'unsafe-eval' ; puis aucune transmission de l'adresse d'origine (referrer). Liens externes ouverts sans lien avec la page (noopener, noreferrer). En conséquence : aucun attribut style ni gestionnaire d'événement écrit dans le HTML ; les positions des curseurs passent par le style de l'élément ; le base64 se décode localement, jamais par une requête ; le pseudo est inséré comme texte, jamais comme HTML. Cette politique bloque les chargements et les envois ordinaires, pas une navigation : la preuve reste le contrôle 5 et le panneau réseau (contrôle 14 a).
- Polices embarquées en woff2, réduites, six faces (Direction artistique) : Alegreya gras 700 (titres, verdicts, grand chiffre du bilan, en-têtes) ; Alegreya italique 500 (initiales des ronds de serviette, « E » de l'icône de notification) ; Alegreya italique gras 700 (initiales sur les curseurs) ; Alegreya Sans 400 (texte courant) ; Alegreya Sans gras 700 (bouton principal, position sur les cartes, question, bandeau, onglet actif, heure de l'écran verrouillé) ; Alegreya Sans italique 400 (la raison devinée sur la carte, « Ta devinette : « … » », seulement). Ce vrai italique remplace le faux italique que les maquettes finales affichaient par oubli de chargement : l'intention validée (annotation de l'écran 2.2) est rétablie, à citer au porteur à la livraison. Non embarqués : Alegreya Sans 500, Alegreya romain, Alegreya Sans gras italique, IBM Plex Mono ; la barre d'état du téléphone passe à la police du système, en chiffres tabulaires (léger écart visible avec les maquettes, à citer aussi). La fabrication de faces par le navigateur est bloquée (font-synthesis), pour qu'un oubli se voie au lieu d'être masqué.
- Caractères : latin de base, latin-1, latin étendu A, ponctuation française (dont l'espace fine insécable), €, les signes de l'interface présents dans ces polices (←, ▾, ●, ○, ◎, ✓ ; ceux qu'elles n'ont pas restent aux polices du système, ⚙ forcé en affichage texte), et tout caractère des textes scellés, vérifié à la construction ; fonctions OpenType kern, liga et tnum gardées ; chiffres comparés à l'œil avec les maquettes après réduction. Licence SIL Open Font License 1.1 : son texte complet et les mentions de copyright sont recopiés en commentaire dans la page ; si le fichier OFL.txt de la version employée réserve un nom de police, la police réduite prend un autre nom interne. Le cadre emploie les polices du système. Poids estimé de la page : 300 à 500 Ko.
- La page reste privée : jamais partagée, ni par lien public ni dans une organisation (« publier » veut dire ici mettre en ligne une version privée). Le porteur joue sur une version figée.

### 8.9 « Tout effacer » et « Qui, durée, droits »

La carte de consentement validée (1.3) promet « Tu peux tout effacer, quand tu veux » : l'essai tient cette promesse.

- **Où** : dans le téléphone, Moi › Réglages › « Tout effacer » (écran 5.7), rendu actif ; dans le cadre, à la clôture, sous « Copier mon carnet ». Jamais exécuté sans confirmation.
- **Quoi** : tout ce que la page a gardé (positions, raisons, devinettes, portrait, pseudo, consentement, carnet, F1, F2, séance atteinte). La page revient à l'entrée, comme à une première visite. Le carnet déjà copié n'est pas touché : il ne contient aucune réponse.
- **Confirmation pendant l'essai**, dans le cadre : « Tout effacer ? » ; « Vos réponses, votre carnet et votre avancement seront supprimés de ce navigateur. C'est définitif. Si vous recommencez, vous connaîtrez déjà les réponses des personnages : l'essai ne vaudra plus comme test. » ; boutons « Annuler » (mis en avant) · « Copier mon carnet d'abord » (le même export, pas un second) · « Tout effacer ».
- **À la clôture** : « Une fois votre carnet copié, vous pouvez tout effacer de ce navigateur. » ; confirmation « Tout effacer ? Vos réponses et votre carnet seront supprimés de ce navigateur. C'est définitif. » · « Annuler » · « Tout effacer ».
- **Après** : « Tout est effacé de ce navigateur. »
- **« Qui, durée, droits »** (1.3 et 5.7) ouvre une note dans le cadre :
  « Version d'essai. La vraie page sera écrite avant le lancement et relue par un avocat.
  Qui voit vos réponses : personne d'autre que vous. Elles restent dans ce navigateur ; la page n'envoie rien.
  Durée : jusqu'à ce que vous les effaciez. Le navigateur peut aussi les perdre : en navigation privée, ou sur un appareil Apple après sept jours sans visite.
  Droits : « Tout effacer » (dans Moi, la roue dentée) les supprime, quand vous voulez. »

### 8.10 Arrêter l'essai avant la fin

Le porteur peut s'arrêter quand il veut (D-008 : aucune règle d'arrêt fixée d'avance). L'arrêt est possible de l'entrée au jour 14 ; il est définitif ; il n'est jamais suggéré.

- **Confirmation** : « Arrêter l'essai ? » / « Ensuite : quelques questions, votre carnet à copier, puis le dévoilement. C'est définitif : l'essai ne pourra pas reprendre. » ; « Annuler » · « Arrêter l'essai », même poids visuel, « Annuler » en premier.
- **Questions** : en tête, « Essai arrêté au jour 6. » (« Essai arrêté à l'entrée. » à la séance 0). « Vous arrêtez surtout parce que : » Je ne m'amuse pas · Je ne comprends pas tout · Je n'ai pas le temps · J'ai vu ce que je voulais voir · Autre raison. Dès le jour 3, dessous, F2 : « Jusqu'ici, deviner était : » et ses quatre choix. « Continuer », toujours actif : rien n'est obligatoire. Pas de champ de texte libre : une réponse politique pourrait s'y glisser.
- **F1, dès le jour 3, facultatif** : « Facultatif, environ une minute. Où placez-vous chacun ? D'après ce que vous avez vu. Même si vous hésitez, choisissez. » ; « Continuer » · « Passer ».
- **Export** (§8.7) : le carnet porte le jour d'arrêt et la raison. Dessous : « Voir le dévoilement ».
- **Dévoilement** (§8.6), d'un toucher ; le corrigé de F1 n'apparaît que si F1 a été rempli.
- **Effacement** : mêmes textes qu'à la clôture (§8.9).
- **Après** : la barre affiche seulement « Essai arrêté au jour 6 ». Rouverte, la page reprend ce parcours là où il en était, jamais le jeu.
- Pourquoi l'export avant le dévoilement : après le dévoilement, on ferme la page ; le carnet doit être copié avant. Pourquoi « définitif » : le dévoilement et le carnet final closent l'essai. Pourquoi le seuil du jour 3 : avant, il n'y a eu qu'une ou deux manches de Deviner, F2 n'a pas de tendance à dire et F1 n'a pas de matière.

### 8.11 Arrêts techniques et empreinte (UX)

Le message remplace tout le cadre : pas de téléphone, pas de barre, ni « Qui est qui ? », ni « Arrêter l'essai », ni « Jour suivant » (on ne prend pas une décision définitive sur une page bloquée). Fond neutre, police du système, titre en gras, action en dernier ; aucune couleur ni pictogramme d'alerte ; tout tient sur un écran de téléphone.

1. **Vérification ratée au chargement** : « **La page s'est arrêtée par précaution.** À chaque ouverture, elle vérifie ses données et ses calculs. Cette fois, une vérification n'a pas donné le bon résultat : plutôt que de vous faire jouer sur un calcul peut-être faux, elle préfère s'arrêter. » ; seulement si une partie gardée est lisible : « Rien n'est effacé : ce que vous avez déjà joué reste dans ce navigateur. » ; puis « Dites-le dans la conversation, avec ce repère : **V3**. On vous dira quand rouvrir la page. » Le repère est V suivi du numéro de la vérification qui a échoué (V1 à V5, dans l'ordre du chargement décrit au §0), en gras, à chasse fixe.
2. **Stockage absent** : « **La page ne peut pas garder vos réponses.** Pour les retrouver d'un jour à l'autre, elle doit les enregistrer dans ce navigateur. Ouverte de cette façon, elle ne le peut pas : elle s'arrête donc avant de vous faire jouer. Si vous aviez déjà commencé l'essai, cette page n'a rien effacé. Dites-le dans la conversation : on vous proposera une autre façon de l'ouvrir. » La navigation privée n'est pas nommée : elle ne se détecte pas, et l'accuser serait faux dans la plupart des cas ; le message de la séance 0 la prévient.
3. **Autre onglet** : « **La page est ouverte deux fois.** Vous avez continué la partie dans un autre onglet. Pour ne pas effacer ce que vous y avez joué, celui-ci s'est arrêté ; votre dernier geste ici n'a pas été gardé. » ; bouton « Reprendre ici » ; dessous, plus petit : « Vous retrouverez la partie telle que vous l'avez laissée dans l'autre onglet. » Le bouton recharge la page, qui relit l'état gardé ; rien n'est jamais écrasé.
4. **Empreinte**, identique dans la page et dans la conversation : 16 groupes de 4 caractères, sur 4 lignes de 4 groupes ; minuscules ; chasse fixe, en couleur pleine ; une espace entre les groupes, un vrai retour à la ligne après chaque ligne. Message dans la conversation, avant la séance 0 : « Voici l'empreinte du fichier qui fixe d'avance les textes et toutes les réponses des quatre personnages : si une seule lettre du fichier changeait, l'empreinte changerait du tout au tout. Rien à faire d'ici là : à la fin de l'essai, la page affichera l'empreinte du fichier qu'elle contient, et si c'est la même que celle-ci, rien n'a été retouché pendant que vous jouiez. » Suivent l'empreinte, puis « Publiée le {date} à {heure}. »

## 9. Ce qui est contrôlé

Les recalculs sont faits par un programme écrit à part, à partir de cette spécification et des fichiers de `a-ne-pas-ouvrir/` seuls, sans lire le code de la page. Le Vérificateur relit les résultats et les différences.

**Avant d'écrire la page.** Front-end a relu §0, §8.7, §8.8 et §9 (faisabilité confirmée, précisions intégrées) ; Back-end relit l'annexe B et le schéma ; UX a écrit les textes des arrêts techniques et la présentation de l'empreinte (§8.11) ; la Direction artistique a confirmé les polices (§8.8) et donné la consigne visuelle du cadre (§8.1).

**Avant d'écrire le fichier scellé.** Le schéma du fichier scellé (noms de champs, types) et le format de la trace (par séance : cartes servies dans l'ordre, auteur, niveau, raison, carte à raison cachée, attributions du joueur et des personnages, côtés attendus, points, titres, phrases, curseurs, personnages affichés dans « Déjà joué aujourd'hui » pour l'heure fournie par le harnais, l'horloge de la page étant injectable dans la version témoin) sont fixés dans `a-ne-pas-ouvrir/schema.md` (Back-end ; rangé dans le dossier caché parce que les noms de certains champs laissent entrevoir les règles de calcul), à faire relire par l'auteur du programme de contrôle. Restent à fixer avant d'écrire le programme de contrôle (partie 6 du schéma) : le format exact du carnet (UX, avec Front-end) ; la définition des agrégats du §8.4 (Game design) ; la typographie des phrases (apostrophe, espaces fines) ; l'affichage de plusieurs sources pour un texte (écran 5.4). La difficulté est réglée une seule fois sur 200 parties simulées. Protocole : `a-ne-pas-ouvrir/regles-de-calcul.md`, §9 bis.

**Avant la séance 0.** L'empreinte du fichier scellé est publiée dans la conversation, avec la date et l'heure.

**Parties témoins et parties au hasard, avant de donner la page au porteur.** Les parties témoins sont trois parties jouées sur la page avec des joueurs inventés, chacun écrit pour couvrir des cas précis ; les parties au hasard sont 200 parties jouées avec des coups tirés au hasard. Elles remplacent les contrôles qui auraient demandé les réponses du porteur. Les unes et les autres sont rejouées par la page et par le programme indépendant, trace contre trace (protocole : §9 bis du fichier caché). La trace est produite par une version de la page construite à part pour les parties témoins ; la version du porteur ne contient aucune fonction de trace, ni d'autre export que « Copier mon carnet ».

- Une seule source (Front-end). Le fichier témoin est le fichier porteur plus un bloc de script, qui lit les résultats du moteur et écrit la trace sans rien modifier ; le contrôle 5 compare les deux fichiers (seules différences permises : ce bloc et son empreinte dans la politique de sécurité). Code non minifié.
- Le moteur (sélection, carte à raison cachée, devinettes, points, titres, badges, portrait, phrases) n'accède ni à l'écran, ni au stockage, ni à l'horloge, ni au hasard : il reçoit les coups, le fichier scellé et l'heure. Seule l'interface lit l'heure (heure locale, à la minute, tronquée, à chaque affichage de « Déjà joué aujourd'hui ») ; la trace consigne l'heure lue et les visages affichés.
- Rejeu, sans rien ajouter à la page : un navigateur sans tête (Chromium et WebKit au moins), heure et fuseau (Europe/Paris) fixés par l'outil de test, joue par l'interface les parties témoins et au moins dix parties au hasard, une fois sur chaque version, en trouvant les boutons par leur rôle et leur nom. Il vérifie : texte affiché identique, écran par écran, dans les deux versions ; coups gardés dans le stockage identiques aux coups joués ; trace témoin identique à celle du programme indépendant. Les 200 parties au hasard sont rejouées par le moteur de la version témoin.

1. Empreinte : SHA-256 du fichier scellé (JSON canonique) égal à l'empreinte publiée ; données embarquées identiques ; vecteurs de test reproduits.
2. Profils : conformes au §1 et aux contraintes de `a-ne-pas-ouvrir/profils.md` ; aucune étiquette politique.
3. Réponses : toutes les réponses des personnages, recalculées par les règles de `a-ne-pas-ouvrir/regles-de-calcul.md`, réponses atypiques comprises.
4. Absences : celles prévues ; un absent ne répond pas et ne devine pas.
5. Code de la page : aucun appel au hasard du navigateur, aucune évaluation de code, aucun attribut style ni gestionnaire écrit dans le HTML, aucun effacement global du stockage, aucun formatage du moteur qui dépende de la langue du navigateur ; réponses des personnages lues dans les données scellées ; les réponses des personnages ne dépendent en rien de celles du porteur ; la sélection n'utilise pas les profils cachés ; aucune des sorties interdites au §8.8 ; aucune capacité déclarée à la publication ; compte simulé ; la version du porteur et la version témoin ne diffèrent que par la trace.
6. Parties témoins et au hasard : sélections et carte à raison cachée reproduites.
7. Parties témoins et au hasard : devinettes des personnages reproduites.
8. Parties témoins et au hasard : points, titres et badges reproduits.
9. Parties témoins et au hasard : portrait et phrases reproduits.
10. Parties témoins et au hasard : lignes rouges sur tout ce qui a été affiché (jamais la réponse du porteur à côté d'une autre, aucun taux d'accord, aucun classement, jamais « n'a pas joué »).
11. Textes : toutes les chaînes affichées sur les parties témoins sont relevées et comparées aux maquettes finales et à l'annexe C ; une chaîne absente des deux est un défaut, ponctuation (§4.6), élisions et accords (§7.6) compris. Relevé relu par UX.
12. Export : sur les parties témoins et au hasard, le texte exporté ne contient que les champs listés au §8.4. Deux parties jouées avec les mêmes devinettes et des réponses opposées du porteur donnent, séance par séance, les mêmes champs, hors durées, nombre de « Relire » et heures d'ouverture.
13. Version du porteur : les trois parties témoins sont rejouées par automate sur la version donnée au porteur ; le carnet qu'elle exporte est comparé à celui que le programme de contrôle calcule d'après la trace de la version témoin. Toute différence est un défaut.
14. Navigateur. Avant de donner la page, avec un joueur témoin, d'abord sur le fichier construit dans un navigateur sans tête, puis sur la version publiée dans la mesure où l'équipe peut l'ouvrir (le porteur n'a aucune manipulation technique à faire, D-005) : (a) pendant une séance entière, le panneau réseau du navigateur ne montre aucune requête émise par la page après son chargement ; (b) une réponse survit à la fermeture de l'onglet, au lendemain et à une nouvelle publication ; (c) une autre page, publiée pour le test et ouverte dans le même navigateur, ne lit rien de ce que la page a gardé ; (d) après « Tout effacer », il ne reste rien. Si (b) ou (c) échoue, la page n'est pas donnée sous cette forme : l'orchestrateur trouve une autre façon de l'ouvrir qui garde les réponses dans le navigateur, et refait les mêmes tests. Le stockage de claude.ai n'est pas une solution de repli sans décision du porteur, car il modifierait D-016. Chez le porteur, la page refait sa vérification du stockage à chaque chargement (§8.8), et la barre affiche « Jour n sur 14 » à la réouverture : une partie perdue se voit aussitôt. Toute nouvelle publication refait les contrôles 5, 12, 13 et 14, et la comparaison octet pour octet de la page servie (§8.8).

**Correctif.** Un défaut trouvé avant la séance 0 : on corrige, on re-scelle, on publie une nouvelle empreinte datée, on rejoue tous les contrôles. Après la séance 0, le fichier scellé ne change plus. Un correctif de la page est daté, refait les contrôles 5 et 11 à 14, et est noté dans le carnet (« Correctif publié avant la séance k »). Si le défaut touche un calcul déjà montré, le rapport final marque l'essai comme affecté à partir de cette séance.

**Après l'essai, sur le carnet du porteur.**

15. Chiffres à rapporter : justesse du porteur en semaines 1 et 2 ; repère indicatif, hypothèse de Game design non validée : 35 à 65 % en semaine 2 (au hasard, environ 25 %) ; pas un critère de décision (D-008) ; agrégats du §8.4.

## Annexe A : ce que Contenu fournit

19 textes : 17 retenus (E1 à E3, puis 1 à 14) et 2 de réserve.

Pour chaque texte : titre et trois lignes ; vote ; auteur et groupe ; lien du scrutin et sources ; tension (S, P, T ou L) et sens s ; quatre considérations dans l'ordre d'affichage, chacune avec texte, côté, pôle (0, 1 ou aucun), député et groupe.

Contraintes :
- Vrais textes examinés à l'Assemblée et vrais arguments de députés, jamais inventés.
- Quatre considérations issues de quatre groupes différents (`projet.md` §8).
- Tradition/Changement : aucun texte de mœurs ou de religion qui suive une ligne de parti.
- Les annotations « tension », « sens » et « pôle » sont faites deux fois, indépendamment ; tout désaccord est tranché avant le scellement (une erreur fausserait tout le portrait).
- Répartition des tensions, des sens et des considérations : `a-ne-pas-ouvrir/regles-de-calcul.md`, annexe A.

## Annexe B : le fichier scellé

- Contenu : version et graine ; vecteurs de test (§0) ; les 17 textes retenus (les réserves ne sont pas scellées) ; les 4 fiches (heure de jeu, profil) ; l'inviteuse ; les absences ; les réponses atypiques ; toutes les réponses calculées (détail : `a-ne-pas-ouvrir/regles-de-calcul.md`).
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
8. Dates : le jour seul (« mercredi ») sur l'écran verrouillé et dans l'Historique ; « Semaine 1 », « Semaine 2 » en 5.2 et 5.5 (à confirmer avec Front-end).
9. Seulement si Contenu retient un projet de loi : « Proposé par le Gouvernement. »

**Dans le téléphone, validés ailleurs mais jamais dessinés :** « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » ; « Agathe a réussi à te surprendre deux fois. » ; « Le vote et les auteurs : {jour} à 18h » ; une carte bien devinée à 18h (« Ton pari : {prénom}. », le visage, « Tu connais ton monde. »).

**Dans le téléphone, texte validé employé dans un cas nouveau :** « Nouveau texte dans … » dans un cercle de cinq (D-011 ne le prévoit que sous trois membres).

**Dans le téléphone, seuls les noms changent :** prénoms, « Amis », vrais textes, vrais députés, groupes et votes ; « Tu as rejoint Amis. », « Agathe te lance un défi », « Les titres de la semaine · Amis », « {Pseudo} décroche Le Sans-Faute. », « toi@exemple.fr » ; élisions et accords (§7.6).

**Dans le cadre, tout est nouveau :** la barre, « Arrêter l'essai » et son parcours (§8.10), la confirmation de « Jour suivant », la note sur 18h et le message de la séance 0 (§8.2) ; la fiche « Qui est qui » ; « Pas dans l'essai. » ; la note du compte simulé ; la note « Qui, durée, droits » ; le carnet ; la note du texte 14, « Continuer », « L'essai est fini. Deux questions, puis le dévoilement. » ; F2 et F1 ; le dévoilement ; « Copier mon carnet », « Carnet copié : collez-le dans la conversation. », la consigne de copie manuelle et « Fin du carnet » ; les trois arrêts techniques et le message d'empreinte (§8.11) ; les textes d'effacement (§8.9).

## Décisions touchées, conventions et constats

**Décisions modifiées : aucune, une précision.** D-015 prévoyait un contrôle final, par le Vérificateur, de ce que le porteur a joué. D-016, plus récent, garde ses réponses dans son navigateur : ce contrôle n'est plus possible sur sa partie. Il est remplacé par les parties témoins et au hasard (§9), par la comparaison du carnet de la version du porteur (contrôle 13) et, à la fin, par le contrôle du carnet (contrôle 15) ; le porteur compare lui-même l'empreinte (§8.6). L'export est unique (D-016) ; « carnet de bilan » est lu comme incluant les mesures automatiques du §8.4. La page est décidée en D-016 (« maquette animée, pas l'application ») ; le fichier scellé et le programme de contrôle découlent de D-015 : c'est de l'outillage d'essai, pas du code applicatif au sens de D-001.

**À dire au porteur à la livraison de la page :**
- la page, le fichier scellé et le programme de contrôle sont de l'outillage d'essai, pas l'application (D-001) ;
- la précision sur D-015 ci-dessus ;
- ce que contient le carnet qu'il copiera (§8.4, §8.7), et ce qu'il ne contient jamais ;
- les limites du stockage (navigation privée, Safari, ouvrir toujours la page de la même façon, §8.8) ;
- le fichier embarqué se décode, et la v2 de cette spécification, qui contenait les règles de calcul, reste lisible dans l'historique Git : l'essai repose sur sa bonne foi ;
- les textes nouveaux à l'écran (annexe C).

**Conventions propres à l'essai :**
- quatre tensions seulement ;
- semaine 1 incomplète (révélations 1 à 5, réponses 1 à 6) ; texte 13 hors semaine ; texte 14 dévoilé sans attributions ;
- Le Fidèle en semaine 1, sur six textes, avec le libellé « ont répondu chaque jour » (la règle 12 et l'écran 3.3c disent « les sept jours ») ; il revient d'office au porteur s'il joue chaque séance ;
- départage final des titres par tirage ;
- personnages qui ne passent jamais ;
- pas de message de 18h aux séances 2 et 15 ; « Nouveau texte dans … » à la séance 1 (la variante que D-011 liait aux cercles de moins de trois membres sert ici pour un jour sans révélation) ;
- compte simulé, pseudo tapé ;
- arrêt possible à tout moment par « Arrêter l'essai » (§8.10) ; « Jour suivant » toujours actif, avec confirmation si la journée n'est pas finie ;
- écrans absents et croix des révélations signalés par « Pas dans l'essai. » (§7.1) ; son propre visage ne réagit pas ; « Tout effacer » actif ; « Qui, durée, droits » ouvre une note dans le cadre, au lieu de la page d'information prévue en 1.3 ;
- écran d'un proche (4.3) : la raison toujours écrite sur les lignes de « Ses surprises » ;
- fiche « Qui est qui » et cadre de l'essai hors du téléphone ;
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
- Agrégats du carnet : le Vérificateur les voulait tous globaux ; Juridique garde par séance ce que le porteur fait (pas ce qu'il répond). Retenu : Juridique.
- Pseudo : le Vérificateur proposait « Toi » ; UX fait taper un pseudo, comme les maquettes (« Toi » casserait « Toi décroche Le Sans-Faute. »). Retenu : UX.
- Confirmation de « Tout effacer » : Juridique la proposait dans le téléphone, en « tu » ; UX dans le cadre, en « vous », parce que ce qu'on perd ici est l'essai lui-même et que le texte du produit reste à écrire avec Juridique. Retenu : UX ; sa confirmation dit aussi, comme le demandait Juridique, que le carnet est effacé, et propose de le copier d'abord.
- Arrêt avant la fin : le Vérificateur proposait « Je m'ennuie » parmi les raisons et justifiait le caractère définitif par « vous connaissez déjà une partie des réponses » ; UX remplace par des raisons qui parlent du jeu, ajoute « J'ai vu ce que je voulais voir » (sans quoi toute raison serait un échec, contre D-008), et corrige la justification (connaître les réponses révélées fait partie du jeu ; ce qui clôt l'essai, c'est le dévoilement). Retenu : UX.
- Question « Envie de jouer demain ? » : proposée par le Vérificateur ; UX la déconseille (dans l'essai, « demain » est à un toucher ; intention déclarée, mesure faible ; met l'idée d'arrêter en tête ; un tiers de charge en plus). Retenu : pas de question ; la date et l'heure de chaque séance mesurent le rythme réel (§8.4).
- Place du schéma : Back-end recommandait de le laisser lisible (seuls des noms de champs y apparaissent) ; l'orchestrateur le range dans `a-ne-pas-ouvrir/`, comme pour les règles de calcul, puisque tous ses lecteurs lisent déjà ce dossier. Retenu : l'orchestrateur.
- Présentation de l'empreinte : Front-end proposait des groupes de 8 caractères ; UX des groupes de 4 (quatre caractères se retiennent d'un coup d'œil en passant d'un écran à l'autre ; chaque ligne tient sur un téléphone ; grille des numéros de sécurité de Signal et WhatsApp). Retenu : UX.
- Où ouvrir la page : Front-end recommandait le fichier local comme voie principale, pensant que claude.ai refuse le stockage du navigateur et ne permet pas de déposer un gros fichier tel quel. La documentation de l'outil de publication, dont dispose l'orchestrateur, dit le contraire sur les deux points (origine propre à chaque page, stockage gardé d'une version à l'autre, fichier publié depuis le disque). Retenu : claude.ai en voie principale, avec comparaison octet pour octet de la page servie ; le fichier local en repli.
- « Qui, durée, droits » : Juridique proposait trois lignes dans le téléphone ; UX une note dans le cadre, pour ne pas écrire un texte de produit non validé. Retenu : la note dans le cadre (UX), avec la mention de l'avocat (Juridique).

**Manques du produit, ouverts dans `docs/decisions.md` :** C-007 à C-016. Deux points relevés dans la première version ne sont pas des manques : les curseurs des autres limités aux réponses déjà révélées découlent de D-010 (lecture A) ; Le Fidèle dans une semaine incomplète est tranché par la lettre de la règle 12 (« les sept jours »), et c'est l'essai qui s'en écarte, par convention.

## Limites et doutes

- Le Sans-Faute est presque inatteignable : une vingtaine d'attributions justes de suite en semaine 2.
- Quatorze jours ne montrent ni le Pas de Côté, ni les curseurs nets, ni les tempéraments ; c'est voulu.
- Les justesses visées sont des hypothèses (§9).
- Des profils figés risquent d'être « résolus » dès la deuxième semaine ; F2 le mesure.
- Tradition/Changement garde un risque partisan ; le choix des textes est la seule protection.
- Les contrôles 6 à 11 portent sur les parties témoins et au hasard, jamais sur la partie du porteur (D-016) ; la comparaison du carnet (contrôle 13) est le seul lien entre la version témoin et celle qu'il utilise.
- Le porteur n'est pas un lecteur neuf (D-015) : la clarté des textes et des phrases ne sera vraiment vérifiée qu'en bêta. Il veut aussi que le jeu marche, et aucun libellé ne corrige ce biais ; les mesures automatiques font contrepoids.
- F1 n'a pas de « Je ne sais pas » : le doute se reporte sur « Au milieu », ce qui fausse un peu la justesse sur un profil proche du centre, s'il y en a. F1 mesure aussi à la fois la lecture du portrait des autres et l'inférence.
- « Pas dans l'essai. » coupe un peu l'immersion ; c'est le prix pour ne pas modifier les écrans validés.
- Avant un lancement public, à faire relire par un avocat (Juridique) : la page « Qui, durée, droits » complète (RGPD, art. 13) ; le sens de « Tout effacer » face aux titres passés gardés sous le pseudo (art. 17) ; l'analyse d'impact (art. 35) ; l'exemption de consentement pour le stockage du navigateur (art. 82 de la loi Informatique et Libertés). Les polices seront alors hébergées par le service.
- Rien ici ne dit ce que ressentent de vrais proches (D-015).
