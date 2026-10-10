# Points relevés par l'agent qui scelle (second essai)

*10 octobre 2026, candidat 1, sur la spécification au commit `bd09827` (simulation-2.md, regles-de-calcul-2.md, schema.md) et sur les fiches du lot de ce jour. À faire passer par le circuit ; rien n'est tranché en silence dans `sceller.py` : chaque lecture retenue est écrite ici et appliquée telle quelle. Le premier essai garde sa propre liste (`a-ne-pas-ouvrir/outillage/scellement/QUESTIONS.md`), non modifiée.*

Les points 1 à 4 touchent des tirages : la page (P) et le contrôle (C) doivent avoir la même lecture, sinon les trois traces de l'histoire divergeront. Les points 5 à 8 touchent la forme des fiches. Les points 9 à 13 sont des lectures du schéma à confirmer, sans écart apparent.

## 1. Le tirage des cases : que vaut i ? (fichier caché, point 14)

- **Citation.** « **Tirage** des cases restantes dans chaque tension : t("ordre-texte|tension|i"). »
- **Écart.** i n'est défini nulle part (ni au point 14, ni au schéma 5.1, ni dans les fiches), et rien ne dit comment le résultat du tirage place les textes dans les cases.
- **Lecture retenue (par analogie avec « ordre-raisons|X|i », où i est le numéro dans la fiche).** i = rang du texte dans la liste « Cases {tension} : … » du point 14 (1, 2, …) ; la liste est mélangée au sens du §0 (tri par t croissant) ; le premier texte va à la première case de la tension dans l'ordre du calendrier.
- **Résultat (graine provisoire 6479a9e7d2792f2a).** T1 = 707, T2 = 840, T3 = 8167, T4 = 989, T5 = 3449, T6 = 2190, T7 = 6770, T8 = 3370, T9 = 7922, T10 = 2139, T11 = 2484, T12 = 795, T13 = 2758. L'autre lecture (i = numéro de scrutin) donne un autre ordre sur 7 cases (T1 = 3370, T3 = 2190, T4 = 707, T6 = 795, T8 = 2484, T11 = 989, T12 = 8167). Ces rangs changeront avec la graine du candidat final.
- **Remplacement proposé**, point 14 : « **Tirage** des cases restantes dans chaque tension : les textes de la liste « Cases {tension} » ci-dessus, numérotés i = 1, 2, … dans l'ordre de cette liste, sont mélangés au sens du §0, c'est-à-dire triés par t("ordre-texte|tension|i") croissant ; le premier va à la première case de la tension dans l'ordre du calendrier (T1 à T13), le deuxième à la suivante, et ainsi de suite. »
- **Effet sur l'histoire :** aucun (elle ne lit que E1 à E3 et T0, fixés). L'effet porte sur le fichier et les en-têtes des fiches.

## 2. La clé « histoire-inattendu » : comment s'écrit c ? (point 2 bis)

- **Citation.** « chaque côté c reçoit un inattendu croisé si t("histoire-inattendu|Hi|c") < 1/2 »
- **Écart.** L'écriture de c dans la clé n'est pas donnée.
- **Lecture retenue.** « pour » ou « contre », comme le champ `cote` (exemple : `histoire-inattendu|H7|contre`).
- **Remplacement proposé** : « … si t("histoire-inattendu|Hi|c") < 1/2, où c s'écrit `pour` ou `contre` (pôle d'en face) … »

## 3. Réponse atypique, condition (b), quand le personnage était absent au texte précédent (point 3, 2.3)

- **Citation.** « (b) sa réponse au texte précédent de la même période n'est pas atypique »
- **Écart.** Le cas d'un personnage absent au texte précédent n'est pas dit : « texte précédent » (le texte du jour d'avant) ou « sa réponse précédente » (son dernier texte répondu) ?
- **Lecture retenue.** Le texte qui précède immédiatement dans la période ; absent à ce texte, il n'y a pas de réponse atypique, la condition est remplie. H1 et T0 n'ont pas de texte précédent (la période d'essai ne remonte pas à H90).
- **Remplacement proposé** : « (b) il n'a pas fait de réponse atypique au texte qui précède immédiatement, dans la même période (condition remplie s'il y était absent ; H1 et T0 n'ont pas de texte précédent) ; »

## 4. Absences : « ses six textes précédents » en début de période (point 3, 2.4)

- **Citation.** « il n'a été absent à aucun de ses six textes précédents de la même période »
- **Lecture retenue.** Les textes de la période qui précèdent, au plus six (moins au début : H1 à H6, T0 à T5). T0 compte pour la période d'essai ; T14 ne reçoit jamais d'absence.
- **Remplacement proposé** (précision seulement) : « … à aucun des textes de la même période qui précèdent celui-ci, au plus six (moins en début de période) ; »

## 5. Ligne « Objet du vote » suivie d'une parenthèse (fiches ; schéma 5.1, étape 8)

- **Citation.** Schéma 5.1 : « **Nouvelle ligne** : `- Objet du vote : {texte | article | amendement | motion | resolution}`. »
- **Écart.** Cinq fiches ajoutent une parenthèse : 7386 (« article (article 1er, amendé, article central) »), 840 (« resolution (proposition de résolution, …) »), 2139 (« article (article 15, examen prioritaire, …) »), 6770 (« amendement (no 237 et identiques …) »), 5359 (« amendement (no 1 et identiques …) »). `sceller.py` lit le premier mot et note l'écart ; un lecteur strict refusera la ligne.
- **Remplacement proposé**, dans chacune : « - Objet du vote : article » (7386, 2139), « - Objet du vote : resolution » (840), « - Objet du vote : amendement » (6770, 5359), la parenthèse passant dans les Doutes de la fiche.

## 6. Fiche légère H86 : « Titre affiché », « (60 car.) » et commentaire après le sens

- **Citation.** Schéma 5.1 : « **H86** : seules les lignes `Titre` et `Tension` sont lues » ; forme de la ligne Tension : « - Tension : P ; sens s = 0 ».
- **Écart.** P-precaution-innovation.md écrit « - Titre affiché : Vaisselle en plastique interdite dans les cantines d'enfants (60 car.) » et « - Tension : P ; sens s = 0 (être favorable sert la précaution) ».
- **Remplacement proposé** : « - Titre : Vaisselle en plastique interdite dans les cantines d'enfants » et « - Tension : P ; sens s = 0 », le décompte et le commentaire passant dans les Doutes.

## 7. En-têtes provisoires et marques « (nouvelle, à annoter) »

- En-têtes « Case S (rang tiré au scellement) », « Case P », « T{case} », « T? » : à remplacer par le rang tiré (point 1 ; schéma 5.1, étape 8, « un en-tête provisoire ne passe pas »). Avec la graine provisoire : « ### T1 · scrutin 707 (16e législature) », « ### T2 · scrutin 840 (16e législature) », « ### T3 · scrutin 8167 (17e législature) », « ### T4 · scrutin 989 (17e législature) », « ### T5 · scrutin 3449 (16e législature) », « ### T6 · scrutin 2190 (17e législature) », « ### T7 · scrutin 6770 (17e législature) », « ### T8 · scrutin 3370 (16e législature) », « ### T9 · scrutin 7922 (17e législature) », « ### T10 · scrutin 2139 (17e législature) », « ### T11 · scrutin 2484 (16e législature) », « ### T12 · scrutin 795 (17e législature) », « ### T13 · scrutin 2758 (16e législature) ». **À recalculer avec la graine du candidat final** : ne pas les écrire avant.
- Les mentions « (rang tiré au scellement) » et les lignes en italique sous « T{case} » passent dans les Doutes (schéma : « Rien après la parenthèse »).
- Marques « (nouvelle, à annoter) » : entre la raison et son côté (840 r2 et r3, 2139 r1, 6770 r3) ou en fin de ligne après l'extrait (7922 r4, 2190 r4). `sceller.py` retire la première forme et ignore la seconde ; elles doivent disparaître après l'annotation, avant le candidat final.

## 8. Tableaux 2.10, 2.10 bis et 2.11 pas encore remplis

- **Citation.** Schéma 2.11 : « Le tableau est vidé, puis rempli de nouveau par Contenu sur le lot final » ; 2.10 et 2.10 bis : « Lignes : à remplir par Contenu ».
- **Effet sur le candidat 1.** Les `elision` sont **provisoires** : tableau du premier essai quand il contient le nom (Elsa Faucillon, Élisa Martin, Édouard Bénard, Hervé Saulignac), sinon « d' » devant une voyelle ou un H, « de » devant un Y (Yannick Monnet). Noms concernés : Alexandra Martin (auteur, sans élision), Alma Dufour, Amélia Lakrafi, Anne Stambach-Terrenoir, Aude Luquet, Emmanuel Maquet, Hervé de Lépinau (H muet supposé), Isabelle Périgault, Olga Givernet, Yannick Monnet. Les groupes et commissions ne sont vérifiés que sur leur forme (règles d'écriture de 2.10 et 2.10 bis), pas sur les tableaux ni sur `amo`.
- **Demande.** Les trois tableaux avant le candidat final ; `sceller.py` lira alors 2.11 au lieu de la règle provisoire.

## 9. Semaine 13 : le `departage` de la surprise dans la trace (schéma 4.2, après bd09827)

- **Lecture retenue.** `semaines[12].surprise` suit le point 9 (seul H86 candidat) : `texte` = « H86 », `departage` = « aucun » ; `attributions` et `erreurs` portent les sept textes révélés. Le départage du calcul c3 (tous candidats) n'est écrit qu'au rapport. Sur le candidat 1, c3 donne aussi « aucun » : pas de différence.
- **Réponse (10 octobre 2026, Back-end)** : confirmé : c'est la lecture de la page (INTERFACE.md, §8 bis), et les traces de l'histoire de P, de C et de S concordent octet pour octet sur le candidat 1. `texte` et `departage` suivent la règle de la surprise du fichier caché (point 9), sur les seuls textes candidats ; le départage du critère c3 n'est écrit qu'aux rapports. Voir `schema.md`, 4.2, cellule de `semaines`.

## 10. Lectures du schéma, à confirmer à P et à C (sans écart apparent)

- **Pas de Côté dans l'histoire** (révélation des jours −88 à 0) : tous les personnages qui ont répondu au texte révélé, devineurs ou non ; curseur « juste avant » = entrée et textes antérieurs dans l'ordre du calendrier.
- **`verdicts`** des personnages : `null` (S1, 3.7, « pour le porteur seulement »), aussi dans l'histoire.
- **Côté attendu d'un candidat absent** : calculé comme pour un présent, sur son profil caché (premier essai, règle 3.1 : « porteur et absents compris »).
- **Le Mystère** : les cartes de X sont celles dont `auteur_compte` est X (§4, « cet auteur ne sert qu'à … au Mystère »).
- **Le Sans-Faute** : un jour « avec cartes » est un jour de révélation où le membre a au moins une carte révélée.
- **Absence et réponse atypique sur T0** : permises (le fichier caché n'exclut que E1 à E3 et T14). Sur le candidat 1, aucune absence sur T0.
- **Réponse (10 octobre 2026, Game design)** : les six lectures sont confirmées, sans changement de texte : Pas de Côté sur tout personnage qui a répondu au texte révélé (un absent n'en a pas) ; `verdicts` à `null` pour les personnages ; côté attendu d'un absent calculé comme pour un présent (le jeu ne montre jamais « n'a pas joué », règle 3.1 du premier essai) ; cartes de X = celles dont `auteur_compte` vaut X ; Sans-Faute, un jour « avec cartes » est un jour de révélation où le membre a au moins une carte révélée ; absence et réponse atypique permises sur T0, c'est voulu.

## 11. Graine provisoire : le commit a bougé pendant le travail

- Le brief dit « le commit courant de `simulation-2.md` ». Il était `585c4c3` au début du travail, `bd09827` après les précisions de l'orchestrateur. `sceller.py` prend le dernier commit qui touche `simulation-2.md` au moment où il tourne (et refuse une copie modifiée non commitée) ; `--commit E` le fixe. Candidat 1 : `bd098271689e1cf2c4492ec5ebc1add1e1453d76`, graine `6479a9e7d2792f2a`.

## 12. Chiffre constant sans définition : « la justesse au hasard avec D-024 »

- **Citation.** §9 de simulation-2.md : « la justesse au hasard avec D-024, sur ses quinze cartes ».
- **Écart.** Le modèle du hasard n'est pas dit (chaque carte attribuée au hasard parmi les quatre personnages, sans remise ? avec passes ?). Non calculé au candidat 1.
- **Lecture proposée.** Espérance du nombre de cartes justes quand, dans chaque manche, les cartes reçoivent une affectation tirée uniformément parmi les affectations sans répétition des personnages candidats (sans passe), une carte comptant juste si le personnage désigné a donné exactement sa réponse (D-024). À confirmer par Game design avant le candidat final.
- **Réponse (10 octobre 2026, Game design)** : lecture corrigée : le modèle (affectation sans répétition, tirée uniformément, sans passe) est juste, mais l'espérance se calcule sans énumération, par h = (candidats ayant donné la même réponse) / (nombre de candidats) pour chaque carte. La loi complète du nombre de cartes justes s'ajoute, parce qu'une moyenne seule ne suffit pas à juger un résultat sur 15 cartes. Voir `regles-de-calcul-2.md`, point 13, ligne 7. Le bilan doit dire que le modèle ne passe jamais, alors qu'un vrai joueur passe.

## 13. Ligne Auteur sans « au dépôt » (fiches S)

- Les fiches S écrivent « - Auteur : Michaël Taverne, député, Rassemblement National ; premier signataire … » ; les fiches P, T et L écrivent « … {groupe} au dépôt … ». Le schéma 5.1 lit le groupe « jusqu'au séparateur » et dit qu'« un groupe est suivi de « au dépôt » sans virgule ». Les deux formes se lisent sans ambiguïté ; à confirmer que la première est admise, sinon ajouter « au dépôt » dans les six fiches S.

---

*Mise à jour du 10 octobre 2026 (S), après la spécification de construction (point 13 du fichier caché réécrit, tableaux 2.10 à 2.11 remplis).*

- **Points 5, 6 et 8 : levés par les fiches et le schéma du jour.** Les lignes « Objet du vote » ne portent plus que le mot, la fiche H86 a « - Titre : » et une ligne Tension nue, les marques « (nouvelle, à annoter) » sont parties. `sceller.py` lit maintenant 2.11 pour l'élision : mêmes valeurs que la règle provisoire, mêmes octets. Il vérifie les règles d'ensemble de 2.10 et 2.10 bis, sans `amo`, qui revient au contrôle 1. **Reste du point 7 :** les en-têtes provisoires (« Case S », « Case P », « T{case} », « T? »), à écrire après le tirage de la graine finale.

## 14. Point 13, ligne 15 (c) : la liste entre parenthèses omet T1 et T2

- **Citation.** « Ce sont les textes dont la révélation est lue dans une partie menée à la clôture (T5, T6, T12, T13), d'une tension où le porteur a, avant eux, au moins ⌈10 / facteur⌉ réponses ».
- **Écart.** Les révélations de T1 (jour 3) et de T2 (jour 4) sont lues aussi (calendrier, `revelation_porteur` = `lue`). Le résultat ne change pas : avant T1, aucune réponse L ; avant T2, une réponse P. Seul T12 passe le seuil de 4.
- **Lecture retenue.** La règle, pas la parenthèse. `sceller.py` écrit la liste T1, T2, T5, T6, T12, T13.
- **Remplacement proposé** : « (T1, T2, T5, T6, T12, T13) ».

## 15. Réglage (point 11) : trois lectures, à confirmer avant le candidat final

- **(a) « curseurs nets au jour 14 ».** Lecture retenue : le portrait en fin de jour 14, T14 compris (17 réponses, facteur appliqué). C'est l'état du `portrait` d'un jour (S1, 3.3 : « état en fin de séance »). L'autre lecture, à l'ouverture du dimanche (16 réponses, celle de la phrase de la semaine), peut donner une autre moyenne. Remplacement proposé : « moyenne des curseurs nets du portrait en fin de jour 14 (T14 compris) ».
- **(b) Ce que les personnages savent du joueur simulé (règle 3.2).** Ce sont les cartes dont il est l'**auteur d'origine** dans leurs manches déjà révélées : les cartes identiques redistribuées portent la même réponse, donc la lecture ne change rien. En revanche, la justesse des personnages sur ses cartes (seuils stricts) se compte, comme au premier essai, sur les cartes dont `auteur_compte` est le joueur simulé.
- **(c) Justesse du joueur simulé.** Elle se compte sur ses quinze cartes, T13 compris (point 11 : « sur ses quinze cartes »), jumeaux comptés justes. Le rapport donne aussi le détail : semaine 14, semaine 15, T13.
- **(d) Qui le joue.** Au premier essai, c'était le programme de contrôle. Il est maintenant prêt dans `sceller.py` (`--reglage 200`), refusé sur un candidat provisoire. À dire s'il doit aussi être joué par C : le point 11 ne le dit pas.
- **(e) Bord des crans.** Si α vaut déjà 1/3 et que la justesse dépasse 7/10, ou s'il vaut 1/6 et qu'elle est sous 7/20, le programme garde le cran extrême et le rapport le dit. Le fichier caché ne prévoit pas ce cas.

## 16. Candidat 1 relancé : la trace change d'un seul champ

- Relancé avec `--commit bd09827`. Le résumé est identique (`1dd912ed…0fcc`), et r = 16 ne change pas.
- La trace a un autre SHA-256 (`e1d6d9b1…2a1a`), mais son seul écart est `empreinte_scelle`. En remettant l'ancienne empreinte du fichier (`f3b8819e…87c3`) à sa place, on retrouve exactement `2efde8ab…4c2c`.
- Le fichier scellé a changé (`bf6e1568…eb7e`) parce que les fiches ont changé depuis le premier passage : titres et lignes revus par UX, marques retirées. Les tensions, sens et pôles de E1 à E3 et de T0, seuls à entrer dans l'histoire, n'ont pas bougé.
- **Conséquence pour la comparaison à trois.** Les traces de P et de C sur l'ancien fichier gardent l'ancienne `empreinte_scelle`. Pour comparer à nouveau octet pour octet, les trois auteurs doivent écrire la trace sur le même fichier, `bf6e1568…`.

---

*Réponses de l'orchestrateur (10 octobre 2026).*

- **14.** Remplacement appliqué au fichier caché, point 13, ligne 15 (c) : « (T1, T2, T5, T6, T12, T13) ».
- **15 a.** Lecture retenue ; fichier caché, point 11, « Facteur » : « moyenne des curseurs nets du portrait en fin de jour 14 (T14 compris) ».
- **15 b, c.** Lectures retenues telles quelles.
- **15 d.** Le réglage est joué par S seul (`--reglage 200`), au candidat final. Ce n'est pas un chiffre du fichier : ses valeurs (α, seuils, facteur) sont écrites au fichier scellé, que le contrôle vérifie. Le contrôle ne le rejoue pas ; le rapport de scellement le dit.
- **15 e.** Lecture retenue : le cran extrême est gardé et le rapport le signale.
- **16.** Les trois traces de l'histoire seront refaites sur le même fichier (`bf6e1568…eb7e`) pour la comparaison à trois, puis sur le fichier final.
