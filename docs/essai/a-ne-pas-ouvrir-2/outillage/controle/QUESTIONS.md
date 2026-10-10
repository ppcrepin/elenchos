# Programme de contrôle (C) du second essai : points de spécification lus d'une certaine façon

Auteur : rôle « auteur du programme de contrôle ». Jalon 1 (contrôle 1, histoire, validité du journal), 10 octobre 2026. Sources : `docs/essai/simulation-2.md` (commit `bd09827`), `a-ne-pas-ouvrir-2/schema.md`, `a-ne-pas-ouvrir-2/regles-de-calcul-2.md` (appelé « fichier caché »), et, pour ce qu'ils ne changent pas, `simulation.md`, `a-ne-pas-ouvrir/schema.md` (« S1 ») et `a-ne-pas-ouvrir/regles-de-calcul.md`.

Chaque point donne la citation, l'écart ou le manque, la lecture que C applique en attendant, et le remplacement proposé.

**Réponses de l'orchestrateur (10 octobre 2026, après le jalon 1).** Q-F1 tranché autrement que ma proposition : i = rang dans la liste « Cases {tension} » du fichier caché, point 14 (commit `3d8aabf`) ; C vérifie maintenant les en-têtes sur cette règle (contrôle 1, étape 8). Q-R1 et Q-R2 : écrits au fichier caché (points 3 et 2 bis), même lecture que C. Q-F2 : séparateurs proposés retenus. Q-G1 : comparaison après remplacement de U+2019 par U+0027, appliquée. Q-J1 : proposition retenue (version 16.0.0, ordre ci-dessous) ; **l'orchestrateur la fait confirmer par UX et Front-end**.

| Point | Sujet | À trancher par | Effet dans C |
|---|---|---|---|
| Q-F1 | `i` de t("ordre-texte\|tension\|i") | — | **tranché** (fichier caché, point 14) ; vérifié |
| Q-F2 | séparateurs après le groupe de l'auteur | — | **tranché** ; appliqué |
| Q-G1 | libellé d'organe avec apostrophe courbe | — | **tranché** ; appliqué |
| Q-G2 | commissions : comparaison à `amo` ? | — | **tranché** ; appliqué (écart bloquant, repli « forme seule » dit au rapport) ; testé |
| Q-J1 | squelette du pseudo | — | **confirmé** (UX) ; appliqué |
| Q-J2 | `hesite` vide | — | **confirmé** ; `[]` refusé |
| Q-J3 | jour de reprise sans ouverture | — | **tranché** (schéma 4.4, règle 4) ; état exact vérifié ; testé |
| Q-H1 | `arrivee.curseurs` de la trace de l'histoire | — | **confirmé** ; égal à `jours.1.curseurs_vus` (testé) |
| Q-R1, Q-R2 | règles cachées | — | **tranchés** (fichier caché) |
| Q-B1 | forme de la liste des textes en présentation B | — | **tranché** : numéros de scrutin, garde « exactement une fiche de texte joué », clé au rapport ; testé |
| Q-T1 à Q-T11 | trace de partie, version 4 (jalon 2) | — | **confirmés** ; appliqués |
| Q-K1 à Q-K10 | carnet du second essai (jalon 2) | — | **confirmés** ou corrigés ; appliqués (Q-K7 : `copies[i].sauts`) |
| Q-P1, Q-P2 | phrases attendues, version 2 (jalon 2) | — | **confirmés** |
| Q-D1 à Q-D3 | dévoilement (jalon 3) | UX | lectures ci-dessous |

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
- **Réponse (10 octobre 2026, Back-end)** : il faut un vrai contrôle, pas une simple information : la phrase « Proposé par la {libelle}. » s'affiche au porteur, donc une faute de copie irait jusqu'à l'écran. Un écart de libellé fait échouer le contrôle 1 ; repli, la forme seule, dite au rapport. Voir `schema.md`, 2.10 bis (« Fidélité à la source ») et 7.2, point 2.

## Journal (partie 4.4)

### Q-J1. Squelette du pseudo (lecture retenue par l'orchestrateur, à confirmer par UX et Front-end)
- **Citation.** §7.19 : sans majuscules, sans accents (NFD, signes retirés), lettres d'autres alphabets ramenées « à la lettre imitée » (UTS #39) ; §8.8 : table réduite « aux caractères qui se ramènent à une seule lettre latine de base », tirée de `confusables.txt` (« version et SHA-256 notés ») ; schéma 4.4, règle 6 : C construit sa propre table.
- **Manques.** (1) L'ordre des opérations change le résultat : `confusables.txt` ramène « I » (U+0049) à « l » (U+006C). Si la table passe avant les minuscules, « VALENTIN » donne « valentln » et n'est pas refusé. (2) La version n'est pas fixée : la page et C peuvent prendre deux versions différentes ; le site unicode.org est fermé dans l'environnement, C a pris la 16.0.0 du dépôt `unicode-org/unicodetools` (SHA-256 `95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611`, 1 292 caractères gardés), et la base Unicode de Python est la 14.0.0 (pour NFD).
- **Lecture de C** (`ec/journal.py`, `forme_comparee`) : minuscules (`str.lower`), NFD sans signes (catégorie Mn), chaque caractère remplacé par sa lettre latine s'il est dans la table, puis de nouveau minuscules et NFD sans signes ; même opération sur le prénom ; refus si égalité. Un pseudo d'un caractère dont la forme est a, n, o ou v est refusé.
- **Proposition (§8.8, puce « Refus du pseudo »)** : « Forme comparée : minuscules (correspondance par défaut), décomposition NFD sans les signes de catégorie Mn, chaque caractère de la table remplacé par sa lettre, puis de nouveau minuscules et NFD sans signes ; la même opération est appliquée au prénom. Table : `confusables.txt` version 16.0.0 (SHA-256 noté ci-dessus), lignes dont la source est un seul caractère et la cible une seule lettre de A à Z ou de a à z. »
- **Réponse (10 octobre 2026, UX)** : lecture et remplacement confirmés : les minuscules d'abord, puis la table, puis les minuscules de nouveau (« VALENTIN », « 0dile » sont attrapés). Limite assumée : un I majuscule au milieu d'un mot (« VaIentin ») n'est pas refusé ; sans enjeu pour l'essai, à revoir à l'étape 6 avec E7. Voir `simulation-2.md`, §8.8, « Refus du pseudo », où la version 16.0.0 et son SHA-256 sont écrits.

### Q-J2. `hesite` vide
- **Citation.** Partie 4.4, règle 10 : « `hesite` contient des codes distincts, dans l'ordre de la liste ; `nulle_part` est seul. » Partie 4.3.3 : « Chaque clé vaut `null` si la question n'a pas été posée ou n'a pas eu de réponse. »
- **Lecture de C.** `[]` est refusé : sans réponse, la clé vaut `null`.
- **Proposition** : ajouter à la règle 10 « `hesite` n'est jamais un tableau vide. »
- **Réponse (10 octobre 2026, Back-end)** : `[]` refusé, confirmé : P le refuse déjà et les écrans de B écrivent `null` quand plus rien n'est coché. Voir `schema.md`, 4.4, règle 10.

### Q-J3. Jour de reprise atteint sans ouverture
- **Citation.** Règle 4 : le jour de reprise est atteint sans ouverture après un arrêt « après la dernière réponse d'un rattrapage et avant « Aller au dimanche » » ; règle 12 : `etapes` non nulles « exactement aux jours joués » ; 4.3.3 : `abandon` « jours joués ».
- **Manque.** Ce que valent `etapes` et `abandon` ce jour-là.
- **Lecture de C.** `etapes` = `{"deviner": false, "entree": null, "repondre": false}`, `abandon` = `false`, `versions` = `null`.
- **Proposition** : l'écrire sous la règle 4.
- **Réponse (10 octobre 2026, Back-end)** : lecture confirmée (`nouveauJour` donne exactement cet état), avec les valeurs de tous les champs écrites sous la règle 4 de `schema.md`, 4.4. Reste à changer dans la page : `compter` ne doit pas accepter `rouvrir` pendant un saut en cours (à faire par A).

## L'histoire (parties 3 et 4.2)

### Q-H1. `arrivee.curseurs` de la trace de l'histoire
- **Citation.** Partie 4.2 : « `curseurs` : par personnage, puis par tension, `{"c", "l", "net", "somme_w"}` ». Partie 3.2 (résumé) : « calculés sur l'entrée et sur H1 à H90 ».
- **Lecture de C.** Les mêmes textes que le résumé (entrée et H1 à H90, sans T0, répondu au jour 0).
- **Proposition (partie 4.2, `arrivee`)** : « `curseurs` : les curseurs du résumé (entrée et H1 à H90, poids normaux), avec `l` et `net` en plus. »
- **Réponse (10 octobre 2026, Game design)** : lecture confirmée : les curseurs à l'arrivée comptent l'entrée et H1 à H90 (H90 est répondu au jour −1, T0 n'en fait pas partie). Ils sont égaux à `jours.1.curseurs_vus` de toute trace de partie, ce qui fournit une vérification croisée. Voir `schema.md`, 4.2, `arrivee`.

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
- **Réponse (10 octobre 2026, Back-end)** : numéros de scrutin confirmés, avec une garde : le contrôle refuse un numéro qui ne désigne pas exactement une fiche de texte joué (un numéro n'est unique que dans une législature) et écrit au rapport la clé de chacun. Voir `schema.md`, 5.1, étape 8, puce « Lignes ».

## Jalon 2 : trace de partie, version 4 (schéma 2, partie 4.3)

Ces lectures sont celles de `ec/rejeu.py`. Elles seront éprouvées par la comparaison aux traces de la page ; chaque différence qui en vient sera tranchée ici, avec la citation.

- **Q-T1. `entree` (4.3.2, « jour 1, dès que 1.2 a été affiché »).** Lu dans `etapes.entree` en mode `interface` ; en mode `moteur`, où `etapes` vaut `null`, toujours présent au jour 1. Proposition : écrire « en mode `moteur`, toujours ».
  - **Réponse (10 octobre 2026, Back-end)** : confirmé : en mode `moteur`, `entree` est toujours présent au jour 1. Voir `schema.md`, 4.3.2, ligne `entree`.
- **Q-T2. `cercle.titres.<membre>` (4.3.7).** Une clé par membre, porteur compris, tableau vide sans titre ; du jour 1 au jour 6, les titres de la semaine 13 (résumé de l'histoire). Proposition : « une clé par membre, tableau éventuellement vide ».
  - **Réponse (10 octobre 2026, Game design)** : confirmé : du jour 1 au jour 6, ce sont les titres de la semaine 13 ; le porteur n'en avait pas, sa clé vaut `[]`.
  - **Réponse (10 octobre 2026, Back-end)** : confirmé par la lecture du code (`cercle.titres[m]`, une clé par membre, ordre `sans_faute`, `devin`, `mystere`, `fidele`). Les deux réponses sont fusionnées en une seule formulation dans `schema.md`, 4.3.7, `titres.<membre>`.
- **Q-T3. `message.titres` (4.3.2, « au moins un titulaire »).** Vrai si Le Sans-Faute, Le Devin, Le Mystère ou Le Fidèle a un titulaire ; la surprise de la semaine n'est pas un titre (§7.17 : « les titres de la semaine »).
  - **Réponse (10 octobre 2026, Game design)** : confirmé : Le Sans-Faute compte (il vit comme un titre, R7) ; la surprise ne compte pas (elle nomme un texte, pas une personne). Le Fidèle ayant presque toujours un titulaire, le booléen est presque toujours vrai ; seules les parties témoins éprouvent le cas « aucun titulaire ».
  - **Réponse (10 octobre 2026, Back-end)** : confirmé par la lecture du code (`aUnTitulaire` ne regarde que les quatre titres). Les deux réponses sont fusionnées dans `schema.md`, 4.3.2, ligne `message`.
- **Q-T4. `mesures.revelation_verdicts`.** `null` quand le porteur n'a pas de manche révélée ce jour-là (manche jamais ouverte, révélation au vote) ; le tableau vide de S1 reste réservé à une manche ouverte sans carte (5.12, impossible ici).
  - **Réponse (10 octobre 2026, orchestrateur)** : confirmée : c'est la forme de la page, et Game design n'y voit aucune objection de jeu ; la concordance P contre C la vérifie.
- **Q-T5. Jour de reprise atteint sans ouverture (arrêt, règle 4 du journal).** `mesures` vaut `null` (pas d'ouverture, donc ni durée ni jours écoulés) ; `revelation`, `dimanche`, `portrait`, `cercle` suivent le calendrier (S1, partie 3.3).
  - **Réponse (10 octobre 2026, orchestrateur)** : confirmée (Game design : la bonne règle, les titres tombent sans le porteur ; Back-end, Q-J3 : schéma 4.4, règle 4).
- **Q-T6. `phrase_semaine.reference` et `devenues`.** Tableaux de tensions dans l'ordre S, P, T, L. Au jour 7, `reference` est l'état après l'entrée seule (toujours vide : trois réponses au plus, une par tension, Σ ≤ facteur ≤ 4 < 10).
  - **Réponse (10 octobre 2026, Game design)** : confirmé : ordre S, P, T, L ; au jour 7, la référence est vide par construction (au plus une réponse par tension à l'entrée, donc Σ ≤ facteur ≤ 4 < 10). Aucun changement de texte.
- **Q-T7. Dimanche abandonné avant les titres.** La trace calcule quand même `dimanche` (titres et phrase) : le texte de §0 (« la phrase de la semaine … est perdue ») vise l'écran et le carnet ; la référence du jour 14 reste la lecture du jour 7.
  - **Réponse (10 octobre 2026, Game design)** : confirmé : la phrase « perdue » vise l'écran et le carnet ; le calcul reste un état pur, donc la référence du jour 14 est la lecture du jour 7, même non vue. Voir `schema.md`, 4.3.8, `reference`.
- **Q-T8. `portrait.barre.n`.** Réponses validées du porteur, entrée comprise, jusqu'à la fin du jour (rattrapage compris) ; `longueur` « 1 » dès que `pleine`, sinon n/16 réduite.
  - **Réponse (10 octobre 2026, Game design)** : confirmé : ce sont les réponses validées (une position et sa raison), rattrapage compris, au jour du texte ; `n` vaut 17 au jour 14 dans une partie complète. Voir `schema.md`, 4.3.6, `barre`.
- **Q-T9. `avis_cercle`.** `comptes` du niveau 1 au niveau 5 ; `milieu` en niveaux croissants, un seul si les deux réponses centrales sont égales ; calculé pour tout texte T révélé, lu ou non, porteur compris s'il a répondu.
  - **Réponse (10 octobre 2026, Game design)** : confirmé : c'est le calcul du §7.14 tel quel ; la réponse du porteur compte s'il a répondu, même au rattrapage. Chaque texte ayant au moins trois réponses de personnages (schéma 2.7), `avis_cercle` n'est jamais `null` sur T0 à T13. Aucun changement de texte.
- **Q-T10. `sauts[].mesures.durees_textes`.** Exactement `textes_atteints` entiers en mode `interface`.
  - **Réponse (10 octobre 2026, orchestrateur)** : confirmée : c'est la forme de la page (Back-end, Q-K7 : schéma 4.4) ; la concordance P contre C la vérifie.
- **Q-T11. `surprises_proches`.** Cartes du porteur déjà révélées, désignées à un membre dont la réponse diffère (jamais un jumeau, une passe ou une carte vide), regroupées par `auteur_compte`, la plus récente d'abord.
  - **Réponse (10 octobre 2026, Game design)** : confirmé, avec deux précisions : un membre qui n'a pas répondu à ce texte compte comme une réponse différente ; les cartes vont de la plus récente à la plus ancienne. Voir `schema.md`, 4.3.2, ligne `surprises_proches`.

## Jalon 2 : carnet du second essai (simulation-2, §8.12)

- **Q-K1. Jours 4 et 8 sans « Jours écoulés ».** Citation : « Aux jours 4 et 8 : Ouverture, Version, Durée, Révélation, Raison cachée, Ouvert. » C suit la liste à la lettre. C'est probablement un oubli (les jours 4 et 8 ont une ouverture) ; proposition : « Aux jours 4 et 8 : Ouverture, Jours écoulés, Version, Durée, Révélation, Raison cachée, Ouvert. »
  - **Réponse (10 octobre 2026, UX)** : proposition retenue : « Aux jours 4 et 8 : Ouverture, Jours écoulés, Version, Durée, Révélation, Raison cachée, Ouvert. » (« Révélation rouverte » n'y est pas, avec raison : la croix y est inactive). Voir `simulation-2.md`, §8.12, règles de présence.
- **Q-K2. « Boutons touchés ».** Aux jours joués seulement, l'entrée finie, même à 0 (Deviner existe chaque jour joué, jour 1 compris) ; jamais aux jours 4 et 8, ni à la clôture. Proposition : l'écrire dans les règles de présence.
  - **Réponse (10 octobre 2026, UX)** : lecture de C retenue, avec une correction sur le jour 1 : « Boutons touchés : Relire, Passer » aux jours 1 (une fois l'entrée finie), 2, 3, 7 et 14, même à 0, que Deviner ait été affiché ou non ; jamais aux jours 4 et 8, ni à la clôture. Pour A et B, la condition est `deviner_porteur` et l'entrée finie, non `deviner_porteur` seul. Voir `simulation-2.md`, §8.12, règles de présence.
- **Q-K3. « Révélation ».** Seulement quand une manche du porteur est révélée ce jour-là (jours 2, 3, 4, 8, 15 si la manche a été ouverte). Libellés des verdicts nouveaux (§8.4) : « juste par la même réponse » et « juste par la même réponse avec la raison ».
  - **Réponse (10 octobre 2026, UX)** : confirmé : la ligne « Révélation » n'apparaît que le jour où une manche ouverte du porteur est révélée (jours 2, 3, 4, 8 et 15), lue ou non, jamais aux jours 7 et 14. Les libellés des verdicts sont écrits dans `simulation-2.md`, §8.12.
- **Q-K4. Bloc « Clôture ».** « garde les lignes du premier essai » : Clôture, Ouverture, Jours écoulés, Version, Durée (sans « dont »), Révélation (et Raison cachée).
  - **Réponse (10 octobre 2026, UX)** : confirmé, aucun changement de texte (`simulation-2.md`, §8.12).
- **Q-K5. « Durée » du jour 1.** « Durée : {D}, dont {D} pour l’entrée, {D} pour deviner et {D} pour répondre. », une durée absente disparaissant (virgules, puis « et » avant la dernière).
  - **Réponse (10 octobre 2026, UX)** : confirmé : une durée absente disparaît, avec des virgules entre les éléments et « et » avant le dernier. Aucun changement de texte (`simulation-2.md`, §8.12).
- **Q-K6. Bloc « Semaine ».** Présent dès que son dimanche est atteint (les titres sont tombés), même si ce jour n'a pas d'ouverture (Q-T5) ; ses questions viennent des coups du dimanche, « pas de réponse » sinon.
  - **Réponse (10 octobre 2026, UX)** : confirmé : le bloc « Semaine » existe dès que les titres sont tombés ; les questions du dimanche jamais posées s'écrivent « pas de réponse ». Aucun changement de texte (`simulation-2.md`, §8.12).
- **Q-K7. Copie pendant un saut.** Le fichier des durées (4.4) ne donne aux copies que les quatre durées d'un jour : le bloc de saut d'une copie prend les durées du saut final, limitées aux textes atteints dans la copie. Proposition : ajouter `sauts` (mêmes clés que `sauts[i]`) aux copies du fichier des durées.
  - **Réponse (10 octobre 2026, UX)** : une copie montre l'état au moment où elle est faite, jamais l'état final : durée, « Pour répondre » et « Annuler {n} fois » s'arrêtent à la copie. Proposition de C appuyée : `sauts` dans les copies.
  - **Réponse (10 octobre 2026, Back-end)** : lecture de C corrigée, proposition retenue : pour un saut pas fini, `duree_saut` et la durée du dernier texte atteint continuent de courir après la copie, donc C ne pourrait pas refaire le texte à l'identique. Voir `schema.md`, 4.4 (fichier des durées, `copies[i]`) et partie 6 (Historique). À vérifier par l'orchestrateur : aucun fichier de durées avec copie n'a déjà été échangé.
- **Q-K8. Arrêt.** « Questions de fin » ne porte que F2 (« Jusqu’ici, deviner était : … »), dès un arrêt au jour 3 ou après (§8.10) ; absent avant.
  - **Réponse (10 octobre 2026, UX)** : confirmé : seule F2 apparaît, avec « Jusqu'ici », pour un arrêt au jour 3 ou après, rattrapages compris. Aucun changement de texte (`simulation-2.md`, §8.12).
- **Q-K9. {titulaires}.** « A », « A et B », « A, B et C », « vous » pour le porteur (premier essai).
  - **Réponse (10 octobre 2026, UX)** : confirmé, par exemple « Le Fidèle : Agathe, Nassim, Odile, Valentin et vous. ». Aucun changement de texte.
- **Q-K10. F2 à la clôture.** « Au fil de l’essai » (gabarit du second essai ; le premier écrivait « Au fil des deux semaines »).
  - **Réponse (10 octobre 2026, UX)** : confirmé : « Au fil de l'essai » à la clôture, « Jusqu'ici » à l'arrêt. Aucun changement de texte.

## Jalon 2 : phrases attendues, version 2 (schéma 2, partie 5.4)

- **Q-P1. Écrans par texte.** E1 à E3 : 1.6 et 5.4 (5.3 les liste, E6) ; T0 : 2.7d et 2.7e seulement (UX-2 ouvert : T0 dans l'Historique ?) ; T1 à T13 : 2.7d, 2.7e, 5.4 ; T14 : 5.4 seulement. Non-inscrit : « {nom}, {député | députée} sans groupe » sur tous les écrans, 5.4 compris. Résolution en 1.6 : « L’Assemblée : texte {adopté | rejeté} le {date}. C’était une résolution, … », par analogie avec 2.7d et 5.4.
  - **Réponse (10 octobre 2026, UX)** : confirmé, avec la forme du député non inscrit et la résolution en 1.6 : ajout au §7.10, puce « Résolution » (`simulation-2.md`). Sur les écrans de chaque texte, UX note que T3, T4 et T7 à T11 ne s'affichent qu'en 5.4 (leurs révélations ne sont jamais lues), T14 en 5.4 seulement, T0 en 2.7d et 2.7e seulement (UX-2 clos) ; cette précision ne s'applique que si la liste dit où une phrase doit apparaître, pas seulement où elle est permise.
- **Q-P2. `interdites_avant_revelation`.** La date, la phrase d'étape, la phrase {suite}, le gros titre, les « Proposé par … » et les noms ; la phrase {objet} n'y est pas (elle ne dit rien du résultat).


## Jalon 3 : spécification tranchée le 10 octobre 2026

Appliqué dans C : Q-G2 (écart de libellé bloquant, étape 8 du contrôle 1), Q-B1 (garde et clé au rapport), Q-J3 (règle 4 : état exact du jour de reprise sans ouverture), règle 9 (aux jours 4 et 8, `ouvert.cercle`, `ouvert.moi`, `ouvert.proche` à 0), Q-K7 (`copies[i].sauts` du fichier des durées, défaut s'il manque), « Jours écoulés » aux jours 4 et 8 (Q-K1), `message.titres`, `titres.<membre>`, `agregats`, `surprises_proches`, `reference`, `barre.n`, `arrivee.curseurs` ; chiffres constants (fichier caché, point 13, commande `constantes`) ; phrases du dévoilement (`devoilement.md`, commande `devoilement`). Arbitrage de l'orchestrateur appliqué : tempéraments du dévoilement = calcul du jour 14, même après un arrêt, réponses non données = absentes ; « , entrée comprise » retiré (commit `36d5afb`).

- **Q-D1. Titre du panneau 7.** Citation : « **1. Ouverture** (sans titre) » puis « **7. Fin** », sans « (sans titre) ». Écart : seul le panneau 1 est dit sans titre ; « Fin » peut se lire comme un titre affiché ou comme une étiquette de rédaction. Lecture de C : pas de titre (`"titre": null`), comme le panneau 1 : « Fin » nomme le panneau dans le document, la page n'écrit pas « Fin » au-dessus d'une phrase de clôture. Remplacement proposé : « **7. Fin** (sans titre) ».
- **Q-D2. {date}, {heure} et {fichier} du panneau 6.** Citation : « … publiée dans la conversation le {date} à {heure} … » ; « Fichier scellé : » {fichier}. Manque : ni la source ni le format (« 2 novembre 2026 », « 18 h 05 » ?) ne sont écrits. Lecture de C : trois paramètres (`--date-publication`, `--heure-publication`, `--nom-fichier`), écrits tels que fournis ; la phrase passe par les règles 1 à 6 du §7.8, le nom du fichier non. Sans paramètre, C laisse le gabarit « {date} » et le contrôle 11 ne peut pas conclure sur ces deux blocs. Remplacement proposé : dire où la page les lit (constantes de la page publiée ?) et leur format.
- **Q-D3. Forme des blocs.** Le document ne dit pas comment découper un panneau. Lecture de C : un bloc par paragraphe « … » du gabarit ; au panneau 6, chaque libellé et chaque valeur sont des blocs distincts (9 blocs) ; au panneau 5, chaque ligne de la liste est un bloc, et les deux phrases « Son profil donnait Neutre. » et « Vous l'aviez à deviner le jour {n+1}. » sont un seul bloc, séparées par une espace (« sur une même ligne »). La comparaison du contrôle 11 peut se faire sur le texte joint si la page découpe autrement.

Constat sur la page (pas une question de spécification) : le journal témoin de `outillage/page/tests/trace-partie.js --temoin` (candidat 1) a `jours.4.coups.ouvert.moi` = 1 et `jours.8.coups.ouvert.moi` = 1. C le refuse (schéma 4.4, règle 9 : « Aux jours 4 et 8, `ouvert.cercle`, `ouvert.moi` et `ouvert.proche` valent 0 »). Après remise de ces deux valeurs à 0, P et C ne diffèrent que sur ces quatre chemins (`coups` et `mesures`).

---

*Réponses de l'orchestrateur (10 octobre 2026) à Q-D1 à Q-D3* : les trois lectures de C sont retenues et écrites dans `devoilement.md` (« **7. Fin** (sans titre) » ; règles de {date}, {heure}, {empreinte}, {graine}, {fichier}, d'après les entrées de construction de la page ; règle des blocs).
