# Programme de contrôle (C) du second essai : points de spécification lus d'une certaine façon

Auteur : rôle « auteur du programme de contrôle ». Jalon 1 (contrôle 1, histoire, validité du journal), 10 octobre 2026. Sources : `docs/essai/simulation-2.md` (commit `bd09827`), `a-ne-pas-ouvrir-2/schema.md`, `a-ne-pas-ouvrir-2/regles-de-calcul-2.md` (appelé « fichier caché »), et, pour ce qu'ils ne changent pas, `simulation.md`, `a-ne-pas-ouvrir/schema.md` (« S1 ») et `a-ne-pas-ouvrir/regles-de-calcul.md`.

Chaque point donne la citation, l'écart ou le manque, la lecture que C applique en attendant, et le remplacement proposé. Aucun ne bloque le jalon 1 ; Q-F1, Q-F2, Q-G1 et Q-J1 sont à trancher avant le candidat 1.

| Point | Sujet | À trancher par | Effet dans C |
|---|---|---|---|
| Q-F1 | `i` de t("ordre-texte\|tension\|i") | Game design, orchestrateur | non vérifié par C (lecture de test seulement) |
| Q-F2 | séparateurs après le groupe de l'auteur (« au dépôt ; ») | Back-end, Contenu | lecture élargie appliquée |
| Q-G1 | libellé d'organe avec apostrophe courbe | Back-end, Contenu | comparaison stricte (échec si le cas se présente) |
| Q-G2 | commissions : comparaison à `amo` ? | Back-end | information seulement |
| Q-J1 | squelette du pseudo : ordre des opérations, version de `confusables.txt` | UX, Front-end | lecture ci-dessous |
| Q-J2 | `hesite` vide | UX, Back-end | `[]` refusé |
| Q-J3 | jour de reprise sans ouverture : `etapes` et `abandon` | Back-end, Front-end | objet à faux, booléen |
| Q-H1 | `arrivee.curseurs` de la trace de l'histoire | Back-end | comme le résumé |
| Q-R1 | règle (b) des réponses atypiques après une absence | Game design | absence = pas atypique |
| Q-R2 | écriture de `c` dans « histoire-inattendu\|Hi\|c » | Game design | « pour », « contre » |
| Q-B1 | forme de la liste des textes en présentation B | orchestrateur | numéros de scrutin |

## Fiches (partie 5.1, étape 8)

### Q-F1. Le `i` du tirage des cases
- **Citation.** Fichier caché, point 14 : « Tirage des cases restantes dans chaque tension : t("ordre-texte|tension|i") » ; schéma, 5.1, étape 8 : « L'orchestrateur le calcule avant le contrôle […] puis écrit le vrai T{n} dans chaque en-tête. »
- **Manque.** `i` n'est défini nulle part : rang de la case dans la liste du point 14 (« Cases S : 795, 7922, 2190, 8167 », i = 1 à 4) ou numéro de scrutin ? Ni la façon de remplir les rangs libres (ordre du calendrier ?), ni la « contrainte de sens » citée par l'annexe A ne sont écrites. Deux calculs indépendants (orchestrateur, C) pourraient donc diverger, et C ne peut pas vérifier les en-têtes.
- **Lecture de C.** Aucune vérification des rangs au jalon 1 (le schéma ne la demande pas). Pour le fichier de test seulement : i = numéro de scrutin, cases triées par t croissant, rangs libres de la tension pris dans l'ordre du calendrier.
- **Proposition (fichier caché, point 14, dernière puce)** : remplacer « **Tirage** des cases restantes dans chaque tension : t("ordre-texte|tension|i"). » par « **Tirage** des cases restantes dans chaque tension : les cases de la tension sont triées par t("ordre-texte|{tension}|{n}") croissant, n étant le numéro de scrutin écrit en décimal ; la k-ième case du tri prend le k-ième rang libre de la tension dans l'ordre du calendrier. Le programme de contrôle refait ce tirage et compare les en-têtes. » Si la « contrainte de sens » s'applique, l'écrire au même endroit, sinon la retirer de l'annexe A.

### Q-F2. Ce qui suit le groupe de l'auteur
- **Citation.** S1, 4.1, étape 8 : {groupe} est « suivi de ` au dépôt (`, de ` ; ` ou de `. ` ». Schéma 2, 5.1, étape 8 : « Un groupe est suivi de « au dépôt » sans virgule » ; « le lecteur v2 admet aussi un point en fin de ligne ».
- **Écart.** Les fiches écrivent « Renaissance au dépôt ; proposition de loi… », « Nicolas Thierry, député, Écologiste - NUPES au dépôt. » : avec les seuls séparateurs de S1, le groupe lu serait « Renaissance au dépôt ».
- **Lecture de C** (`ec/sources.py`, `RE_AUTEUR_ELU`) : le groupe est la plus courte suite suivie de ` au dépôt (`, ` au dépôt ;`, ` au dépôt.`, ` ; `, `. ` ou d'un point final.
- **Proposition (schéma 2, 5.1, étape 8, puce « Groupes »)** : ajouter « Séparateurs admis après {groupe} : ` au dépôt (`, ` au dépôt ;`, ` au dépôt.`, ` ; `, `. `, ou un point en fin de ligne ; {groupe} est la plus courte suite suivie de l'un d'eux. »

## Groupes et commissions (parties 2.10 et 2.10 bis)

### Q-G1. Apostrophe courbe dans un libellé officiel
- **Citation.** Partie 2.10 : « il vérifie que `groupe` est égal au `libelle` de l'organe, en NFC, à l'identique » ; même partie, caractères permis : « l'apostrophe droite U+0027 » ; S1, étape 7 : pas de U+2019.
- **Écart.** Certains organes ont une apostrophe courbe dans `libelle` : PO800496, « Socialistes et apparentés (membre de l’intergroupe NUPES) » (copie locale `contenu-an16/amo/json/organe/PO800496.json`). Un député de ce groupe avant le 19 octobre 2023 ne pourrait passer ni l'égalité, ni la typographie simple. Le lot actuel ne l'emploie pas (3370 prend PO830170 pour une séance de 2024).
- **Lecture de C.** Égalité stricte : le cas échouerait.
- **Proposition (partie 2.10, « Règles d'ensemble », deuxième puce)** : « il vérifie que `groupe` est égal au `libelle` de l'organe, en NFC, après remplacement de chaque U+2019 par U+0027 (typographie simple), et à l'identique pour tout le reste ».

### Q-G2. Commissions : faut-il comparer à `amo` ?
- **Citation.** Partie 2.10 bis : pour une forme courte, « le contrôle ne vérifie que la forme ». Rien n'est dit pour les autres lignes.
- **Lecture de C.** Forme vérifiée pour toutes les lignes ; pour une ligne qui n'est pas une forme courte, C écrit au rapport, sans échec, si `libelle` égale le `libelle` de l'organe dont la majuscule initiale est mise en minuscule.
- **Proposition** : ajouter à la partie 2.10 bis « Pour les autres lignes, `libelle` est égal au `libelle` de l'organe dans `amo`, première lettre en minuscule ; le contrôle 1 le vérifie comme pour les groupes. »

## Journal (partie 4.4)

### Q-J1. Squelette du pseudo
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
