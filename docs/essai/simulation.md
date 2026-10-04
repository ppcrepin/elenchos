# Spécification de la simulation : essai solo (étape 4)

*Rédigée par Game design le 4 octobre 2026 pour l'essai décidé en D-015 et D-016 (page jouable, quatre personnages inventés, une journée de jeu par séance, 14 jours). Version 2 : relue par Cohérence et UX, corrections intégrées par l'orchestrateur ; en attente du Vérificateur. Spécification de travail, pas un texte pour le porteur. Personnages, vies et exemples fictifs.*

*Ce fichier se lit sans gâcher l'essai. **Tout ce que le porteur doit deviner est dans `a-ne-pas-ouvrir/`** : profils cachés, réponses atypiques, absences, corrigé de fin d'essai.*

Sources : D-006, D-010, D-011, D-014, D-015, D-016 ; `docs/produit.md`, règles 1 à 19 ; `docs/projet.md` §4, §5 et §8 ; `docs/onboarding.md` ; tableau `S` de `docs/maquettes/maquettes-finales.html`.

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
- Les quatre tensions écartées restent affichées dans Moi, floues et immobiles.

### Notations

| Symbole | Sens |
|---|---|
| k | numéro de séance (0 à 15) |
| n | numéro de texte quotidien (1 à 14) ; E1, E2, E3 pour l'entrée |
| p | position cachée d'un personnage sur une tension, de 0 à 1 |
| s | sens d'un texte : le pôle (0 ou 1) que sert « favorable » |
| v | valeur d'une position (tableau ci-dessous) |
| x | valeur d'une position ramenée sur l'axe de la tension (§4.2) |
| w | poids d'une réponse dans le portrait (§5.1) |
| c, ℓ | centre et largeur d'un curseur (§5.2) |
| σ | côté d'une carte : +1, 0 ou −1 (§3) |

« Écart » désigne uniquement une réponse atypique (§2.3). La distance entre une réponse et un curseur s'appelle « distance ».

### Calendrier (lecture A de C-006, D-010)

| Séance | Jour | Révélation (texte) | Deviner (texte) | Répondre (texte) | En plus |
|---|---|---|---|---|---|
| 0 | entrée | — | « Et Agathe ? Sa réponse ? » sur E1, E2, E3 | E1, E2, E3 | consentement, compte simulé, entrée dans le cercle |
| 1 | lundi | — | « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » | 1 | — |
| 2 | mardi | — (pas de message de 18h) | 1 | 2 | — |
| k = 3 à 14 | … | k−2 | k−1 | k | — |
| 7 | dimanche | 5 | 6 | 7 | badge rare éventuel, puis titres de la semaine 1 |
| 14 | dimanche | 12 | 13 | 14 | badge rare éventuel, puis titres de la semaine 2 |
| 15 | clôture | 13 (pas de message de 18h) | — | — | fiche du texte 14 (vote et auteurs, sans attributions), questions de fin, dévoilement, export |

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

- t(clé) = les 8 premiers chiffres hexadécimaux de SHA-256(graine + "|" + clé), divisés par 16^8.
- Graine : 16 caractères hexadécimaux aléatoires, tirés au scellement et inscrits dans le fichier scellé.
- « Au hasard » ou « départage » = l'élément de plus petit t(clé). Mélanger une liste = la trier par t(clé|élément) croissant.

## 1. Les quatre personnages

Le cercle s'appelle « Amis » ; Agathe l'a créé ; les quatre personnages sont entrés avant le porteur, qui est le cinquième membre (règle 8 à cinq membres dès la séance 2). **Agathe invite le porteur.**

Fiches visibles par le porteur, dans la fiche « Qui est qui » (hors du téléphone, §8.2) :

| Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu |
|---|---|---|---|---|---|
| Agathe | 46 | sage-femme | Rennes | Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. | 7h40 |
| Nassim | 33 | électricien à son compte | Clermont-Ferrand | Refait des cuisines toute la semaine ; le samedi, il restaure de vieilles motos avec son père. | 12h45 |
| Odile | 69 | pharmacienne retraitée | Ribérac (Dordogne) | A tenu la pharmacie de son bourg pendant trente-cinq ans ; à 68 ans, elle s'est mise au paddle. | 9h10 |
| Valentin | 24 | développeur dans une jeune entreprise | Lyon | Écrit des applications pour téléphone ; le week-end, il court en montagne. | 23h20 |

Chaque personnage a, sur chaque tension, une position cachée p (0 à 1) et une fermeté (faible, moyenne, forte). Profils, contraintes qu'ils respectent, réponses atypiques et absences : `a-ne-pas-ouvrir/profils.md`.

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

« Hors tension » s'entend toujours à l'intérieur de E. E vide → « aucune ». On prend le premier niveau non vide ; plusieurs candidates → départage par t("raison|prénom|texte|id").

### 2.3 Écarts au profil (réponses atypiques)

- Forme : côté opposé à la réponse type, au niveau simple (Favorable ou Défavorable) ; si la réponse type est neutre, Favorable si t("cote-ecart|prénom|texte") < 0,5, sinon Défavorable ; raison selon 2.2 avec le nouveau côté.
- Jamais sur l'entrée ni sur le texte 14.
- Nombre, contraintes et procédure de tirage : `a-ne-pas-ouvrir/profils.md`.

### 2.4 Absences

- Une absence le jour n : pas de réponse au texte n, aucune devinette à la séance n. Calendrier des absences : `a-ne-pas-ouvrir/profils.md`.
- Deviner propose toujours les quatre visages, absents compris (D-011). Rien ne dit qui est absent. Comme dans le produit, une absence peut se déduire (« Déjà joué aujourd'hui » et les heures de jeu de la fiche) ; D-011 interdit de la dire, pas de la déduire.
- Aucune pause : il faudrait sept jours sans réponse.

### 2.5 Entrée

Les personnages répondent à E1, E2, E3 par 2.1 et 2.2, sans écart. Le porteur ne voit que les réponses d'Agathe (« Et Agathe ? Sa réponse ? », puis révélation immédiate). Une devinette est juste si elle trouve le bon côté (D-011). Bilan « 2 sur 3 », ou compte des surprises à 0 ou 1 sur 3 (D-006, écran 1.7).

### 2.6 « Déjà joué aujourd'hui »

Journée de 18h à 18h ; m(h) = (h − 18 + 24) mod 24. Un personnage s'affiche s'il a répondu au texte du jour et si m(son heure de jeu) ≤ m(heure réelle du porteur). Jamais la liste de qui n'a pas joué.

## 3. Comment un personnage devine

1. À chaque séance k de 2 à 14, chaque personnage présent joue une manche sur le texte k−1. Ses cartes sont choisies comme au §4, avec lui pour devineur. Candidats : les quatre autres membres, porteur et absents compris.
2. Côté attendu d'un candidat X vu par le devineur g, aligné sur le sens du texte : +1, 0 ou −1.
   - X personnage : a = p de X aligné (2.1) ; +1 si a ≥ 0,6 ; −1 si a ≤ 0,4 ; sinon 0.
   - X porteur : g n'utilise que les réponses du porteur qu'il a eues dans ses propres cartes, déjà révélées (textes ≤ k−2), sur la même tension ; on calcule le centre c du §5.2 sur ces seules réponses ; Σ w = 0 → « inconnu » ; sinon on aligne c sur le sens du texte (c si s = 1, 1 − c si s = 0) et on applique les mêmes seuils.
3. Score d'une carte de côté σ pour X : 2 si σ égale le côté attendu ; 1 si l'un des deux vaut 0 ou si X est « inconnu » ; 0 s'ils sont opposés.
4. Attribution : parmi toutes les affectations une carte = une personne, celle de total maximal ; égalité → candidats mélangés par t("devine|g|k|candidat"), puis première affectation maximale dans l'ordre lexicographique. Les personnages ne passent jamais.
5. Raison cachée : parmi les considérations du côté de la carte (les quatre si neutre), la première dans l'ordre d'affichage dont le pôle correspond au côté attendu du candidat choisi (+1 → s ; −1 → 1 − s) ; candidat attendu à 0 ou « inconnu » → la première hors tension, sinon la première ; rien de possible → « aucune ».
6. Justesse attendue (hypothèse) : 60 à 70 % sur les cartes des personnages ; 30 à 50 % sur celles du porteur, en hausse.

## 4. Les trois réponses à deviner (règle 8)

### 4.1 Réponses possibles

Pour le devineur g à la séance k : les réponses au texte k−1 des membres autres que g qui ont répondu.

### 4.2 Score de surprise (calculé à partir des seules réponses, jamais des profils cachés)

| Grandeur | Définition |
|---|---|
| x | position sur l'axe : v si s = 1, 1 − v si s = 0 |
| Curseur de l'auteur | centre c et largeur ℓ (§5.2), sur ses réponses d'entrée et ses réponses aux textes ≤ k−2 |
| q | (0,95 − ℓ) / 0,70 : 0 au départ, 1 quand le curseur est net |
| Distance | \|x − c\| |
| Rareté | \|x − médiane des x de toutes les réponses au texte k−1, porteur compris\| |
| Surprise | q × distance + (1 − q) × rareté |

- Au départ, q ≈ 0 : on sert les réponses les plus singulières du jour. À mesure que les curseurs se resserrent, on sert les réponses inattendues de la part de leur auteur.
- Dans l'essai, Σ w ne dépasse pas 5 sur une tension : ℓ reste ≥ 0,60 et q ≤ 0,5. La rareté pèse donc au moins la moitié pendant tout l'essai. C'est une lecture de la règle 8 pour la période où les curseurs sont flous (interprétation à confirmer, C-009).

### 4.3 Choix

- Trois réponses possibles ou moins : toutes.
- Sinon : les deux plus fortes surprises (départage t("surprise|g|k|auteur")), plus une au hasard parmi les autres (t("hasard|g|k|auteur")).
- Cartes identiques (même niveau, même raison) : jamais ensemble ; on remplace la moins bien classée par la suivante ; si c'est impossible, les deux attributions comptent justes (C-010).

### 4.4 Carte à raison cachée

- Trois cartes : la carte tirée au hasard, si sa raison n'est pas « aucune » ; sinon la moins surprenante dont la raison n'est pas « aucune » ; sinon la carte tirée au hasard malgré tout.
- Deux cartes : la moins surprenante, même exception.
- Une carte : celle-là.

### 4.5 Affichage

- Ordre des cartes : t("ordre|g|k|auteur"), jamais par surprise.
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

- La raison s'écrit comme sur les cartes, avec sa propre ponctuation, et rien après le guillemet fermant.
- Ligne rouge respectée (§9, rien de côte à côte) : « Ton pari » est une devinette, pas un avis (note validée de l'écran 1.6). La raison du porteur reste sur la carte des auteurs (2.7e), un autre écran. Si la raison du porteur est « aucune », la ligne « Ta raison… » de 2.7e disparaît.

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

Flou : zone de largeur ℓ centrée sur c. Net : un point à c. Ordre dans Moi : nets, puis flous du plus étroit au plus large ; à égalité S, P, T, L, puis les tensions écartées.

### 5.4 Ce qui est compté

- Portrait du porteur dans Moi : toute réponse dès qu'elle est donnée, entrée comprise (règle 15).
- Curseurs des autres vus par le porteur : seulement l'entrée et les textes ≤ k−2. Sinon un curseur qui bouge trahirait une réponse avant qu'on la devine (conséquence de D-010, lecture A).
- Le Cercle : aucune initiale sur les barres (personne n'est net) ; « Encore flou : » suivi de tous les membres.
- Toucher un visage dans Le Cercle ouvre toujours l'écran d'un proche (4.3, D-010), jamais la fiche « Qui est qui ».
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
| Arbitrage net | « Aujourd'hui, tu as fait passer {pôle gagnant} avant {pôle perdant}. » | validée (règle 18, écrans 1.13 et 2.5) |
| Penchant | « Aujourd'hui, tu as penché vers {pôle}. » | nouvelle, convention d'essai |
| Tiraillé | « Aujourd'hui, tu as donné du poids à {pôle 0} comme à {pôle 1}. » | nouvelle, convention d'essai |
| Neutre | « Aujourd'hui, tu n'as penché ni vers {pôle 0} ni vers {pôle 1}. » | nouvelle, convention d'essai |

« Tenir la balance égale », proposé d'abord pour le cas neutre, est écarté : il veut dire « être impartial » et sonne comme un compliment (UX).

### 5.7 Phrase de la semaine (séances 7 et 14 ; C-008)

Elle porte sur les réponses de la semaine (textes 1 à 6, puis 7 à 13). Un arbitrage est une réponse de poids w > 0 (§5.1) ; le poids d'arbitrage d'une tension est la somme de ces poids.

| Cas | Phrase | Statut |
|---|---|---|
| Une tension nette (la plus éloignée de 0,5) | « Entre {…} et {…}, tu choisis le plus souvent {…}. » | validée (écran 3.3e) ; n'apparaîtra pas dans l'essai |
| Sinon, tension au plus fort poids d'arbitrage de la semaine (à égalité S, P, T, L) ; au moins 2 arbitrages et un pôle l'emporte | « Cette semaine, entre {…} et {…}, tu as le plus souvent choisi {…}. » | nouvelle, convention d'essai |
| Même tension, au moins 2 arbitrages, autant de poids des deux côtés | « Cette semaine, entre {…} et {…}, tu as penché autant d'un côté que de l'autre. » | nouvelle, convention d'essai |
| Moins de 2 arbitrages sur chaque tension | « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » | nouvelle, convention d'essai |

- Le curseur flou de la tension retenue s'affiche dessous (aucun curseur dans le dernier cas).
- « Tes réponses n'ont pas encore tranché », proposé d'abord, est écarté : il sonne comme un reproche d'indécision, ce que D-010 a voulu éviter en remplaçant « L'Indécis » par « Le Mesuré ». « Tu n'as penché d'aucun côté », proposé pour l'égalité, était faux : le joueur a penché, des deux côtés (UX).

## 6. Titres et badges

1. Points : un par carte attribuée à son auteur ; raison cachée trouvée = personne et raison justes ; une carte compte dans la semaine où elle est révélée (§0).
2. Le Devin : le plus de points, au moins 1 ; égalité → le plus de raisons cachées trouvées ; puis t("devin|semaine|prénom").
3. Le Mystère : pour X, tentatives = attributions des autres sur les cartes de X révélées dans la semaine, passes exclues ; erreurs = tentatives qui n'ont pas désigné X ; au moins 6 tentatives ; plus forte proportion d'erreurs ; égalité → le plus d'erreurs, puis t("mystere|semaine|prénom").
4. Le Fidèle : tous ceux qui ont répondu à tous les textes de la semaine (1 à 6, puis 7 à 13). Libellés : semaine 1, « ont répondu chaque jour » (« a répondu chaque jour ») ; semaine 2, le libellé validé, « ont répondu les sept jours » (« a répondu les sept jours »).
5. Surprise de la semaine : parmi les textes révélés dans la semaine, la plus forte proportion d'attributions fausses, passes exclues, au moins 4 attributions ; égalité → le plus d'erreurs, puis t("surprise-semaine|semaine|n").
6. Le Sans-Faute : semaine 2 seulement ; chacune des 7 révélations avec au moins une carte, aucune passe, toutes les attributions justes ; raison cachée non exigée ; annoncé à la séance 14, avant les titres.
7. Le Pas de Côté : curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ; ne se déclenchera pas dans l'essai.
8. Séquence du dimanche : révélation habituelle ; badge rare éventuel ; Le Devin ; Le Mystère ; Le Fidèle ; surprise de la semaine ; phrase de la semaine ; fin. Jamais de total, de proportion ni de rang.
9. Titre sans titulaire (personne n'a de point, personne n'a 6 tentatives, aucun texte n'a 4 attributions, personne n'a répondu à tous les textes) : sa carte disparaît et les points de progression s'ajustent. Jamais « Le Mystère : personne ».

## 7. Écrans propres à l'essai, dans le téléphone

Tout ce qui est dans le téléphone est le produit, en « tu », tel que validé (D-014). Ce qui suit précise les cas que les maquettes ne dessinent pas.

1. **Séance 0.** Message d'Agathe (écran 1.1, signé Agathe) → « Défi d'Agathe · Texte 1 sur 3 » → carte de consentement au premier toucher sur une position (écran 1.3, D-006) → raison → « Et Agathe ? Sa réponse ? » → révélation immédiate → textes 2 et 3 → bilan (1.7) → compte (1.8 et 1.9). Le compte est simulé : champs préremplis et inactifs, aucun e-mail saisi, envoyé ni conservé.
2. **Séance 1.** « Aujourd'hui · lundi », barre d'étapes « Deviner ○ · Répondre ● », bandeau « Tu as rejoint Amis. », puis « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » (texte de `produit.md` §5 pour un cercle d'au moins trois membres ; l'écran 1.12 porte la variante des cercles de deux). L'écran « En attendant » affiche « Nouveau texte dans … » (variante des écrans 1.13 et 5.10) : rien ne sera révélé à la séance 2.
3. **Séance 2.** Pas de message de 18h : la séance s'ouvre sur « Aujourd'hui · mardi », étape Deviner (comme l'écran 2.1). « En attendant » affiche « Révélation dans … ».
4. **Séance 15.** Pas de message de 18h. Révélation du texte 13 (attributions, vote, auteurs). La carte de fin 2.7f est remplacée, dans le cadre, par « L'essai est fini. Deux questions, puis le dévoilement. » Fiche du texte 14 : vote et auteurs, avec « Ce texte n'a pas été deviné : l'essai s'arrête avant. »
5. **Élision.** Agathe et Odile commencent par une voyelle : « Défi d'Agathe », « Tu as trouvé 2 réponses d'Agathe sur 3 », « Les réponses d'Odile ». Tout gabarit « de {prénom} » sait écrire « d' ».

## 8. Le cadre de l'essai, hors du téléphone

### 8.1 Règle

Tout ce qui est en « vous » vit hors du téléphone : fond neutre, sans ronds de serviette ni typographie de La Tablée. Cela vaut pour la barre de l'essai, la fiche « Qui est qui », le carnet, la clôture, le dévoilement et l'export.

### 8.2 Barre et fiche « Qui est qui »

- Barre permanente : « Jour 3 sur 14 · mercredi » (« Entrée » à la séance 0, « Clôture » à la séance 15), un bouton « Qui est qui ? », le bouton « Jour suivant » en fin de séance.
- Une fois, à la séance 1 : « Dans l'essai, pas besoin d'attendre 18h : passez au jour suivant quand vous voulez. » Le compte à rebours reste affiché dans le téléphone : c'est l'écran testé.
- La fiche s'ouvre d'elle-même une fois, au début de la séance 0, avant le message d'Agathe ; ensuite, par le bouton seulement, jamais depuis Le Cercle. Ouverte depuis Le Cercle, elle passerait pour une fonction du produit, qui ne montre jamais l'âge, le métier ou la ville d'un proche.
- En-tête : « Qui est qui · fiche d'essai. Hors application. Dans le vrai jeu, il n'y a pas de fiche : vos proches, vous les connaissez déjà. Ces quatre personnes sont inventées. »
- Une carte par personne, dans l'ordre des visages. Exemple : « Agathe, 46 ans · sage-femme, Rennes. Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. Joue d'habitude vers 7h40. C'est elle qui vous invite. »

### 8.3 Carnet de bilan (chaque séance)

Sous le téléphone, après « En attendant », avant le bouton « Jour suivant » : un seul écran, une touche par question, environ 10 secondes. Les questions ne bloquent pas le passage au jour suivant.

1. Seulement s'il y a eu au moins un « Ça alors ! » à la révélation : « Vos erreurs à la révélation : » J'aurais pu trouver · Je ne pouvais pas trouver · Les deux (ce dernier choix seulement s'il y a eu au moins deux erreurs).
2. « « {titre du texte du jour} » et ses quatre raisons : » Compris du premier coup · Compris en relisant · Pas tout compris. À la séance 0 : « Les trois textes et leurs raisons : ».
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

- Durées de la séance, de Deviner et de Répondre ; nombre de « Relire » et de « Passer ».
- Sur les cartes du porteur : attributions justes du jour ; raison cachée tentée, puis trouvée ; cartes identiques remplacées.
- Titres reçus par le porteur.
- Agrégats pour le contrôle 10 (§9), tous sur les personnages : justesse des personnages, globale et sur les cartes du porteur ; part de réponses atypiques parmi les cartes du porteur ; nombre de raisons « aucune » chez les personnages ; nombre de départages par tirage ; titulaires de chaque titre.
- Jamais : une position ou une raison du porteur, ni un nombre qui permettrait de les retrouver.

### 8.5 Fin d'essai (séance 15, avant le dévoilement)

1. F2, posée d'abord pour ne pas être colorée par l'effort de la grille : « Au fil des deux semaines, deviner était : » De plus en plus amusant · Toujours aussi amusant · De moins en moins amusant · Jamais amusant.
2. F1 : « Où placez-vous chacun ? D'après ces deux semaines. Même si vous hésitez, choisissez. » Un bloc par personne (Agathe, Nassim, Odile, Valentin) ; dans chaque bloc, quatre lignes S, P, T, L avec les étiquettes du curseur aux deux bouts et trois ronds entre elles (« Sécurité ○ ○ ○ Liberté individuelle »), le rond du milieu étiqueté « Au milieu » une fois en tête de bloc. Seize touches, environ une minute. Au hasard, environ 5 cases justes sur 16. Corrigé : `a-ne-pas-ouvrir/profils.md`.

### 8.6 Dévoilement

- D'abord ce qui se lit : profils et fermeté, réponses atypiques texte par texte, absences, corrigé de F1 face aux choix du porteur.
- Ensuite, une partie repliée « Pour le contrôle » : graine, fichier scellé, et « Empreinte de ce fichier : {…}. Elle doit être identique à celle publiée le {date} dans la conversation. » La page affiche l'empreinte, mais n'affirme pas elle-même qu'elle correspond.

### 8.7 Export

Un seul bouton, « Copier mon carnet » (D-016) : carnet, mesures et agrégats du §8.4, F1, F2. Jamais les positions ni les raisons du porteur. Aucun autre export.

### 8.8 Ce que la page garde

Les réponses du porteur restent dans son navigateur (stockage local). La page n'envoie rien, nulle part (D-016).

## 9. Ce qui est contrôlé

Les recalculs sont faits par un programme écrit à part, à partir de cette spécification seule, sans lire le code de la page. Le Vérificateur relit les résultats et les écarts.

**Avant la séance 0.** L'empreinte du fichier scellé est publiée dans la conversation, avec la date et l'heure.

**Partie témoin, avant de donner la page au porteur.** Elle remplace les contrôles qui auraient demandé les réponses du porteur. L'équipe joue les 16 séances avec un joueur témoin dont les réponses sont inventées et consignées. La page produit la trace complète de cette partie ; le programme indépendant la recalcule.

1. Empreinte : SHA-256 du fichier scellé (JSON canonique) égal à l'empreinte publiée ; données embarquées identiques.
2. Profils : conformes au §1 et aux contraintes de `a-ne-pas-ouvrir/profils.md` ; aucune étiquette politique.
3. Réponses : les 64 réponses (12 d'entrée, 52 quotidiennes) recalculées par 2.1 à 2.3 ; réponses atypiques conformes au nombre, aux contraintes et à la procédure.
4. Absences : celles prévues ; un absent ne répond pas et ne devine pas.
5. Code de la page : réponses des personnages lues dans les données scellées ; les réponses des personnages ne dépendent en rien de celles du porteur ; la sélection n'utilise pas les profils cachés ; la page n'envoie rien hors du navigateur ; le compte est simulé.
6. Partie témoin : sélections et carte à raison cachée reproduites.
7. Partie témoin : devinettes des personnages reproduites.
8. Partie témoin : points, titres et badges reproduits.
9. Partie témoin : portrait et phrases reproduits.

**Après l'essai, sur le carnet du porteur.**

10. Chiffres à rapporter : justesse du porteur en semaines 1 et 2 (repère indicatif 35 à 65 % en semaine 2, au hasard 25 % ; pas un critère de décision, D-008) ; agrégats du §8.4.
11. Lignes rouges, sur la partie témoin et le code : jamais la réponse du porteur à côté d'une autre, aucun taux d'accord, aucun classement, jamais « n'a pas joué ».

## Annexe A : ce que Contenu fournit

19 textes : 17 retenus (E1 à E3, puis 1 à 14) et 2 de réserve.

Pour chaque texte : titre et trois lignes ; vote ; auteur et groupe ; lien du scrutin et sources ; tension (S, P, T ou L) et sens s ; quatre considérations dans l'ordre d'affichage, chacune avec texte, côté, pôle (0, 1 ou aucun), député et groupe.

Contraintes :
- Vrais textes examinés à l'Assemblée et vrais arguments de députés, jamais inventés.
- Quatre considérations issues de quatre groupes différents (§8).
- Au moins une « pour » et une « contre » (deux et deux recommandé) ; au moins une sur chaque pôle ; au plus une hors tension.
- Textes d'entrée : clivants (`docs/onboarding.md`), un par tension, sur S, P et L.
- Textes quotidiens : S 4, P 3, T 4, L 3 ; jamais la même tension deux jours de suite ; chaque tension au moins une fois dans les textes 1 à 6 et dans les textes 7 à 13 ; pour chaque tension, au moins un texte de chaque sens.
- Tradition/Changement : aucun texte de mœurs ou de religion qui suive une ligne de parti.

## Annexe B : le fichier scellé

- Contenu : version et graine ; les 17 textes retenus (les réserves ne sont pas scellées) ; les 4 fiches (heure de jeu, profil) ; l'inviteuse ; les absences ; les réponses atypiques (avec le côté tiré quand la réponse type était neutre) ; les 64 réponses calculées.
- Format : JSON canonique (UTF-8, clés triées, sans espaces) ; empreinte SHA-256 en hexadécimal ; écrit par un agent distinct de celui qui écrit la page, avant la séance 0 ; embarqué dans la page en base64.
- Calculé en direct, jamais scellé (dépend du porteur) : sélections, devinettes des personnages, points, titres, portrait.
- Limite à dire au porteur : le fichier embarqué se décode. Comme pour `a-ne-pas-ouvrir/`, l'essai repose sur sa bonne foi.

## Décisions touchées, conventions et constats

**Décisions modifiées : aucune.** La première version prévoyait un second export, contenant les positions et les raisons du porteur, pour des contrôles faits après l'essai. Cohérence l'a jugé contraire à D-016 (un seul bouton, le carnet ; les réponses restent dans le navigateur). UX en proposait un libellé plus clair, « Copier aussi mes réponses, pour le contrôle ». L'orchestrateur a suivi Cohérence : l'export est supprimé, et les contrôles concernés passent par une partie témoin (§9).

**Conventions propres à l'essai :**
- quatre tensions seulement ;
- semaine 1 incomplète (révélations 1 à 5, réponses 1 à 6) ; texte 13 hors semaine ; texte 14 dévoilé sans attributions ;
- Le Fidèle en semaine 1, sur six textes, avec le libellé « ont répondu chaque jour » (la règle 12 et l'écran 3.3c disent « les sept jours ») ; il revient d'office au porteur s'il joue chaque séance ;
- départage final des titres par tirage ;
- personnages qui ne passent jamais ;
- pas de message de 18h aux séances 2 et 15 ; « Nouveau texte dans … » à la séance 1 (la variante que D-011 liait aux cercles de moins de trois membres sert ici pour un jour sans révélation) ;
- compte simulé ;
- fiche « Qui est qui » et cadre de l'essai hors du téléphone ;
- textes nouveaux à l'écran, que les maquettes ne dessinaient pas : la ligne « Sa raison : … » (§4.6), la carte « aucune des quatre raisons » (§4.5), six phrases du portrait (§5.6, §5.7), les pôles de Local/National (§5.5). Ils seront listés au porteur à la livraison de la page.

**Interprétations à confirmer :**
- « raison cachée trouvée » = personne et raison justes ;
- Le Sans-Faute : du lundi au dimanche, raison cachée non exigée, chaque révélation avec au moins une carte (C-014) ;
- Le Devin : au moins 1 point ;
- Le Mystère : erreurs sur ses propres réponses rapportées aux tentatives, passes exclues, au moins 6 tentatives ;
- surprise de la semaine : passes exclues, au moins 4 attributions ;
- Le Pas de Côté : penchant clair à |c − 0,5| ≥ 0,2 ;
- « inattendue de la part de son auteur » lue, tant que le curseur est flou, comme un mélange avec la rareté du jour (§4.2, C-009).

**Manques du produit, ouverts dans `docs/decisions.md` :** C-007 (phrase du jour hors arbitrage net), C-008 (phrase de la semaine sans curseur net), C-009 (réponses « inattendues » tant que les curseurs sont flous), C-010 (deux réponses identiques), C-011 (carte à raison cachée mal devinée), C-012 (message de 18h un jour sans révélation), C-013 (égalités et minimums des titres), C-014 (Sans-Faute), C-015 (libellés courts des pôles). Deux points relevés dans la première version ne sont pas des manques :
- les curseurs des autres limités aux réponses déjà révélées découlent de D-010 (lecture A) ;
- Le Fidèle dans une semaine incomplète est tranché par la lettre de la règle 12 (« les sept jours ») ; c'est l'essai qui s'en écarte, par convention.

## Limites et doutes (Game design, Cohérence, UX)

- Le Sans-Faute est presque inatteignable : pour le porteur, 20 attributions justes de suite en semaine 2 (six révélations de 3 cartes et une de 2).
- Quatorze jours ne montrent ni le Pas de Côté, ni les curseurs nets, ni les tempéraments ; c'est voulu.
- Risque à long terme (règles 8 et 19 ensemble) : des joueurs pourraient apprendre à « lire à l'envers » ; à surveiller en bêta.
- Titres biaisés : les personnages gagneront probablement Le Devin ; le porteur sera probablement Le Mystère en semaine 1.
- Les personnages devinent mécaniquement (le côté, pas l'intensité) ; les justesses sont des hypothèses.
- Des profils figés risquent d'être « résolus » dès la deuxième semaine ; F2 le mesure.
- Tradition/Changement garde un risque partisan ; le choix des textes est la seule protection.
- Le porteur n'est pas un lecteur neuf (D-015) : la clarté des textes et des phrases ne sera vraiment vérifiée qu'en bêta. Le porteur veut aussi que le jeu marche, et aucun libellé ne corrige ce biais ; les mesures automatiques font contrepoids.
- F1 n'a pas de « Je ne sais pas » : le doute se reporte sur « Au milieu », ce qui fausse un peu la justesse sur les profils proches du centre. C'est le prix d'une comparaison au hasard simple.
- Rien ici ne dit ce que ressentent de vrais proches (D-015).
