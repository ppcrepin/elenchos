# Programme de contrôle (C) du second essai : points de spécification lus d'une certaine façon

Auteur : rôle « auteur du programme de contrôle ». Jalon 1 (contrôle 1, histoire, validité du journal), 10 octobre 2026. Sources : `docs/essai/simulation-2.md` (commit `bd09827`), `a-ne-pas-ouvrir-2/schema.md`, `a-ne-pas-ouvrir-2/regles-de-calcul-2.md` (appelé « fichier caché »), et, pour ce qu'ils ne changent pas, `simulation.md`, `a-ne-pas-ouvrir/schema.md` (« S1 ») et `a-ne-pas-ouvrir/regles-de-calcul.md`.

Chaque point donne la citation, l'écart ou le manque, la lecture que C applique en attendant, et le remplacement proposé.

**Réponses de l'orchestrateur (10 octobre 2026, après le jalon 1).** Q-F1 tranché autrement que ma proposition : i = rang dans la liste « Cases {tension} » du fichier caché, point 14 (commit `3d8aabf`) ; C vérifie maintenant les en-têtes sur cette règle (contrôle 1, étape 8). Q-R1 et Q-R2 : écrits au fichier caché (points 3 et 2 bis), même lecture que C. Q-F2 : séparateurs proposés retenus. Q-G1 : comparaison après remplacement de U+2019 par U+0027, appliquée. Q-J1 : proposition retenue (version 16.0.0, ordre ci-dessous) ; **l'orchestrateur la fait confirmer par UX et Front-end**.

| Point | Sujet | À trancher par | Effet dans C |
|---|---|---|---|
| Q-F1 | `i` de t("ordre-texte\|tension\|i") | — | **tranché** (fichier caché, point 14) ; vérifié |
| Q-F2 | séparateurs après le groupe de l'auteur | — | **tranché** ; appliqué |
| Q-G1 | libellé d'organe avec apostrophe courbe | — | **tranché** ; appliqué |
| Q-G2 | commissions : comparaison à `amo` ? | Back-end | information seulement |
| Q-J1 | squelette du pseudo | UX, Front-end (confirmation) | lecture retenue par l'orchestrateur |
| Q-J2 | `hesite` vide | UX, Back-end | `[]` refusé |
| Q-J3 | jour de reprise sans ouverture : `etapes` et `abandon` | Back-end, Front-end | objet à faux, booléen |
| Q-H1 | `arrivee.curseurs` de la trace de l'histoire | Back-end | comme le résumé (P, C et S concordent sur le candidat 1) |
| Q-R1, Q-R2 | règles cachées | — | **tranchés** (fichier caché) |
| Q-B1 | forme de la liste des textes en présentation B | orchestrateur | numéros de scrutin |
| Q-T1 à Q-T11 | trace de partie, version 4 (jalon 2) | Back-end, Front-end | lectures ci-dessous |
| Q-K1 à Q-K10 | carnet du second essai (jalon 2) | UX, Back-end | lectures ci-dessous |
| Q-P1, Q-P2 | phrases attendues, version 2 (jalon 2) | UX, Back-end | lectures ci-dessous |

## Fiches (partie 5.1, étape 8)

### Q-F1. Le `i` du tirage des cases
- **Citation.** Fichier caché, point 14 : « Tirage des cases restantes dans chaque tension : t("ordre-texte|tension|i") » ; schéma, 5.1, étape 8 : « L'orchestrateur le calcule avant le contrôle […] puis écrit le vrai T{n} dans chaque en-tête. »
- **Manque.** `i` n'est défini nulle part : rang de la case dans la liste du point 14 (« Cases S : 795, 7922, 2190, 8167 », i = 1 à 4) ou numéro de scrutin ? Ni la façon de remplir les rangs libres (ordre du calendrier ?), ni la « contrainte de sens » citée par l'annexe A ne sont écrites. Deux calculs indépendants (orchestrateur, C) pourraient donc diverger, et C ne peut pas vérifier les en-têtes.
- **Lecture de C au jalon 1.** Aucune vérification des rangs ; i = numéro de scrutin pour le fichier de test.
- **Tranché (commit `3d8aabf`)** : i = rang dans la liste « Cases {tension} ». C vérifie chaque en-tête T{n} des fiches sur cette règle (`rangs_attendus`, contrôle 1, étape 8), avec les tensions T1 à T13 lues dans le fichier.
- **Proposition (fichier caché, point 14, dernière puce)** : remplacer « **Tirage** des cases restantes dans chaque tension : t("ordre-texte|tension|i"). » par « **Tirage** des cases restantes dans chaque tension : les cases de la tension sont triées par t("ordre-texte|{tension}|{n}") croissant, n étant le numéro de scrutin écrit en décimal ; la k-ième case du tri prend le k-ième rang libre de la tension dans l'ordre du calendrier. Le programme de contrôle refait ce tirage et compare les en-têtes. » Si la « contrainte de sens » s'applique, l'écrire au même endroit, sinon la retirer de l'annexe A.

### Q-F2. Ce qui suit le groupe de l'auteur (tranché : séparateurs retenus)
- **Citation.** S1, 4.1, étape 8 : {groupe} est « suivi de ` au dépôt (`, de ` ; ` ou de `. ` ». Schéma 2, 5.1, étape 8 : « Un groupe est suivi de « au dépôt » sans virgule » ; « le lecteur v2 admet aussi un point en fin de ligne ».
- **Écart.** Les fiches écrivent « Renaissance au dépôt ; proposition de loi… », « Nicolas Thierry, député, Écologiste - NUPES au dépôt. » : avec les seuls séparateurs de S1, le groupe lu serait « Renaissance au dépôt ».
- **Lecture de C** (`ec/sources.py`, `RE_AUTEUR_ELU`) : le groupe est la plus courte suite suivie de ` au dépôt (`, ` au dépôt ;`, ` au dépôt.`, ` ; `, `. ` ou d'un point final.
- **Proposition (schéma 2, 5.1, étape 8, puce « Groupes »)** : ajouter « Séparateurs admis après {groupe} : ` au dépôt (`, ` au dépôt ;`, ` au dépôt.`, ` ; `, `. `, ou un point en fin de ligne ; {groupe} est la plus courte suite suivie de l'un d'eux. »

## Groupes et commissions (parties 2.10 et 2.10 bis)

### Q-G1. Apostrophe courbe dans un libellé officiel (tranché : remplacement appliqué)
- **Citation.** Partie 2.10 : « il vérifie que `groupe` est égal au `libelle` de l'organe, en NFC, à l'identique » ; même partie, caractères permis : « l'apostrophe droite U+0027 » ; S1, étape 7 : pas de U+2019.
- **Écart.** Certains organes ont une apostrophe courbe dans `libelle` : PO800496, « Socialistes et apparentés (membre de l’intergroupe NUPES) » (copie locale `contenu-an16/amo/json/organe/PO800496.json`). Un député de ce groupe avant le 19 octobre 2023 ne pourrait passer ni l'égalité, ni la typographie simple. Le lot actuel ne l'emploie pas (3370 prend PO830170 pour une séance de 2024).
- **Lecture de C.** Égalité stricte : le cas échouerait.
- **Proposition (partie 2.10, « Règles d'ensemble », deuxième puce)** : « il vérifie que `groupe` est égal au `libelle` de l'organe, en NFC, après remplacement de chaque U+2019 par U+0027 (typographie simple), et à l'identique pour tout le reste ».

### Q-G2. Commissions : faut-il comparer à `amo` ?
- **Citation.** Partie 2.10 bis : pour une forme courte, « le contrôle ne vérifie que la forme ». Rien n'est dit pour les autres lignes.
- **Lecture de C.** Forme vérifiée pour toutes les lignes ; pour une ligne qui n'est pas une forme courte, C écrit au rapport, sans échec, si `libelle` égale le `libelle` de l'organe dont la majuscule initiale est mise en minuscule.
- **Proposition** : ajouter à la partie 2.10 bis « Pour les autres lignes, `libelle` est égal au `libelle` de l'organe dans `amo`, première lettre en minuscule ; le contrôle 1 le vérifie comme pour les groupes. »

## Journal (partie 4.4)

### Q-J1. Squelette du pseudo (lecture retenue par l'orchestrateur, à confirmer par UX et Front-end)
- **Citation.** §7.19 : sans majuscules, sans accents (NFD, signes retirés), lettres d'autres alphabets ramenées « à la lettre imitée » (UTS #39) ; §8.8 : table réduite « aux caractères qui se ramènent à une seule lettre latine de base », tirée de `confusables.txt` (« version et SHA-256 notés ») ; schéma 4.4, règle 6 : C construit sa propre table.
- **Manques.** (1) L'ordre des opérations change le résultat : `confusables.txt` ramène « I » (U+0049) à « l » (U+006C). Si la table passe avant les minuscules, « VALENTIN » donne « valentln » et n'est pas refusé. (2) La version n'est pas fixée : la page et C peuvent prendre deux versions différentes ; le site unicode.org est fermé dans l'environnement, C a pris la 16.0.0 du dépôt `unicode-org/unicodetools` (SHA-256 `95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611`, 1 292 caractères gardés), et la base Unicode de Python est la 14.0.0 (pour NFD).
- **Lecture de C** (`ec/journal.py`, `forme_comparee`) : minuscules (`str.lower`), NFD sans signes (catégorie Mn), chaque caractère remplacé par sa lettre latine s'il est dans la table, puis de nouveau minuscules et NFD sans signes ; même opération sur le prénom ; refus si égalité. Un pseudo d'un caractère dont la forme est a, n, o ou v est refusé.
- **Proposition (§8.8, puce « Refus du pseudo »)** : « Forme comparée : minuscules (correspondance par défaut), décomposition NFD sans les signes de catégorie Mn, chaque caractère de la table remplacé par sa lettre, puis de nouveau minuscules et NFD sans signes ; la même opération est appliquée au prénom. Table : `confusables.txt` version 16.0.0 (SHA-256 noté ci-dessus), lignes dont la source est un seul caractère et la cible une seule lettre de A à Z ou de a à z. »

### Q-J2. `hesite` vide
- **Citation.** Partie 4.4, règle 10 : « `hesite` contient des codes distincts, dans l'ordre de la liste ; `nulle_part` est seul. » Partie 4.3.3 : « Chaque clé vaut `null` si la question n'a pas été posée ou n'a pas eu de réponse. »
- **Lecture de C.** `[]` est refusé : sans réponse, la clé vaut `null`.
- **Proposition** : ajouter à la règle 10 « `hesite` n'est jamais un tableau vide. »

### Q-J3. Jour de reprise atteint sans ouverture
- **Citation.** Règle 4 : le jour de reprise est atteint sans ouverture après un arrêt « après la dernière réponse d'un rattrapage et avant « Aller au dimanche » » ; règle 12 : `etapes` non nulles « exactement aux jours joués » ; 4.3.3 : `abandon` « jours joués ».
- **Manque.** Ce que valent `etapes` et `abandon` ce jour-là.
- **Lecture de C.** `etapes` = `{"deviner": false, "entree": null, "repondre": false}`, `abandon` = `false`, `versions` = `null`.
- **Proposition** : l'écrire sous la règle 4.

## L'histoire (parties 3 et 4.2)

### Q-H1. `arrivee.curseurs` de la trace de l'histoire
- **Citation.** Partie 4.2 : « `curseurs` : par personnage, puis par tension, `{"c", "l", "net", "somme_w"}` ». Partie 3.2 (résumé) : « calculés sur l'entrée et sur H1 à H90 ».
- **Lecture de C.** Les mêmes textes que le résumé (entrée et H1 à H90, sans T0, répondu au jour 0).
- **Proposition (partie 4.2, `arrivee`)** : « `curseurs` : les curseurs du résumé (entrée et H1 à H90, poids normaux), avec `l` et `net` en plus. »

## Réponses des personnages (fichier caché, point 3 ; pour le jalon suivant, déjà appliqué au fichier de test)

### Q-R1. Règle (b) après une absence
- **Citation.** 2.3 : « (b) sa réponse au texte précédent de la même période n'est pas atypique ».
- **Lecture de C.** Absent au texte précédent : il n'a pas de réponse, donc pas de réponse atypique, et (b) est remplie.

### Q-R2. Écriture de `c` dans « histoire-inattendu|Hi|c »
- **Citation.** Point 2 bis : « chaque côté c reçoit un inattendu croisé si t("histoire-inattendu|Hi|c") < 1/2 ».
- **Lecture de C.** `c` s'écrit « pour » ou « contre » (exemple : « histoire-inattendu|H7|contre »). À confirmer, puisque le contrôle 1 compare les raisons de l'histoire à ce calcul.

## Paramètres

### Q-B1. Liste des textes en présentation B
- **Citation.** Partie 5.1, étape 8 : « dont la liste est passée en paramètre par l'orchestrateur ».
- **Lecture de C.** Numéros de scrutin (`--textes-b 7922,8167,6770,5359`, fichier caché, point 14), rapprochés des fiches par leur en-tête. Sans la liste, l'étape 8 le dit et le contrôle 1 reste partiel.

## Jalon 2 : trace de partie, version 4 (schéma 2, partie 4.3)

Ces lectures sont celles de `ec/rejeu.py`. Elles seront éprouvées par la comparaison aux traces de la page ; chaque différence qui en vient sera tranchée ici, avec la citation.

- **Q-T1. `entree` (4.3.2, « jour 1, dès que 1.2 a été affiché »).** Lu dans `etapes.entree` en mode `interface` ; en mode `moteur`, où `etapes` vaut `null`, toujours présent au jour 1. Proposition : écrire « en mode `moteur`, toujours ».
- **Q-T2. `cercle.titres.<membre>` (4.3.7).** Une clé par membre, porteur compris, tableau vide sans titre ; du jour 1 au jour 6, les titres de la semaine 13 (résumé de l'histoire). Proposition : « une clé par membre, tableau éventuellement vide ».
- **Q-T3. `message.titres` (4.3.2, « au moins un titulaire »).** Vrai si Le Sans-Faute, Le Devin, Le Mystère ou Le Fidèle a un titulaire ; la surprise de la semaine n'est pas un titre (§7.17 : « les titres de la semaine »).
- **Q-T4. `mesures.revelation_verdicts`.** `null` quand le porteur n'a pas de manche révélée ce jour-là (manche jamais ouverte, révélation au vote) ; le tableau vide de S1 reste réservé à une manche ouverte sans carte (5.12, impossible ici).
- **Q-T5. Jour de reprise atteint sans ouverture (arrêt, règle 4 du journal).** `mesures` vaut `null` (pas d'ouverture, donc ni durée ni jours écoulés) ; `revelation`, `dimanche`, `portrait`, `cercle` suivent le calendrier (S1, partie 3.3).
- **Q-T6. `phrase_semaine.reference` et `devenues`.** Tableaux de tensions dans l'ordre S, P, T, L. Au jour 7, `reference` est l'état après l'entrée seule (toujours vide : trois réponses au plus, une par tension, Σ ≤ facteur ≤ 4 < 10).
- **Q-T7. Dimanche abandonné avant les titres.** La trace calcule quand même `dimanche` (titres et phrase) : le texte de §0 (« la phrase de la semaine … est perdue ») vise l'écran et le carnet ; la référence du jour 14 reste la lecture du jour 7.
- **Q-T8. `portrait.barre.n`.** Réponses validées du porteur, entrée comprise, jusqu'à la fin du jour (rattrapage compris) ; `longueur` « 1 » dès que `pleine`, sinon n/16 réduite.
- **Q-T9. `avis_cercle`.** `comptes` du niveau 1 au niveau 5 ; `milieu` en niveaux croissants, un seul si les deux réponses centrales sont égales ; calculé pour tout texte T révélé, lu ou non, porteur compris s'il a répondu.
- **Q-T10. `sauts[].mesures.durees_textes`.** Exactement `textes_atteints` entiers en mode `interface`.
- **Q-T11. `surprises_proches`.** Cartes du porteur déjà révélées, désignées à un membre dont la réponse diffère (jamais un jumeau, une passe ou une carte vide), regroupées par `auteur_compte`, la plus récente d'abord.

## Jalon 2 : carnet du second essai (simulation-2, §8.12)

- **Q-K1. Jours 4 et 8 sans « Jours écoulés ».** Citation : « Aux jours 4 et 8 : Ouverture, Version, Durée, Révélation, Raison cachée, Ouvert. » C suit la liste à la lettre. C'est probablement un oubli (les jours 4 et 8 ont une ouverture) ; proposition : « Aux jours 4 et 8 : Ouverture, Jours écoulés, Version, Durée, Révélation, Raison cachée, Ouvert. »
- **Q-K2. « Boutons touchés ».** Aux jours joués seulement, l'entrée finie, même à 0 (Deviner existe chaque jour joué, jour 1 compris) ; jamais aux jours 4 et 8, ni à la clôture. Proposition : l'écrire dans les règles de présence.
- **Q-K3. « Révélation ».** Seulement quand une manche du porteur est révélée ce jour-là (jours 2, 3, 4, 8, 15 si la manche a été ouverte). Libellés des verdicts nouveaux (§8.4) : « juste par la même réponse » et « juste par la même réponse avec la raison ».
- **Q-K4. Bloc « Clôture ».** « garde les lignes du premier essai » : Clôture, Ouverture, Jours écoulés, Version, Durée (sans « dont »), Révélation (et Raison cachée).
- **Q-K5. « Durée » du jour 1.** « Durée : {D}, dont {D} pour l’entrée, {D} pour deviner et {D} pour répondre. », une durée absente disparaissant (virgules, puis « et » avant la dernière).
- **Q-K6. Bloc « Semaine ».** Présent dès que son dimanche est atteint (les titres sont tombés), même si ce jour n'a pas d'ouverture (Q-T5) ; ses questions viennent des coups du dimanche, « pas de réponse » sinon.
- **Q-K7. Copie pendant un saut.** Le fichier des durées (4.4) ne donne aux copies que les quatre durées d'un jour : le bloc de saut d'une copie prend les durées du saut final, limitées aux textes atteints dans la copie. Proposition : ajouter `sauts` (mêmes clés que `sauts[i]`) aux copies du fichier des durées.
- **Q-K8. Arrêt.** « Questions de fin » ne porte que F2 (« Jusqu’ici, deviner était : … »), dès un arrêt au jour 3 ou après (§8.10) ; absent avant.
- **Q-K9. {titulaires}.** « A », « A et B », « A, B et C », « vous » pour le porteur (premier essai).
- **Q-K10. F2 à la clôture.** « Au fil de l’essai » (gabarit du second essai ; le premier écrivait « Au fil des deux semaines »).

## Jalon 2 : phrases attendues, version 2 (schéma 2, partie 5.4)

- **Q-P1. Écrans par texte.** E1 à E3 : 1.6 et 5.4 (5.3 les liste, E6) ; T0 : 2.7d et 2.7e seulement (UX-2 ouvert : T0 dans l'Historique ?) ; T1 à T13 : 2.7d, 2.7e, 5.4 ; T14 : 5.4 seulement. Non-inscrit : « {nom}, {député | députée} sans groupe » sur tous les écrans, 5.4 compris. Résolution en 1.6 : « L’Assemblée : texte {adopté | rejeté} le {date}. C’était une résolution, … », par analogie avec 2.7d et 5.4.
- **Q-P2. `interdites_avant_revelation`.** La date, la phrase d'étape, la phrase {suite}, le gros titre, les « Proposé par … » et les noms ; la phrase {objet} n'y est pas (elle ne dit rien du résultat).

