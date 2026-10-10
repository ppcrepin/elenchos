# Rapport de scellement du second essai

*Écrit le 10 octobre 2026, avec le fichier scellé, à partir des sorties du programme de scellement (S), du programme de contrôle (C) et des carnets de référence. Il suit la partie 7.3 (« Rapport de scellement ») de `schema.md` et le point 13 de `regles-de-calcul-2.md`, et prend pour modèle `docs/essai/a-ne-pas-ouvrir/rapport-de-scellement.md`. Il dévoile autant que `regles-de-calcul-2.md` : à ne pas ouvrir avant la fin de l'essai. Les textes du lot n'y sont désignés que par leur clé (E1 à E3, T0 à T14, H86), jamais par leur sujet ni leur titre (D-037). Relecture du Vérificateur : à faire avant remise au porteur ; ce rapport n'a pas encore passé le circuit.*

**En bref.** Le fichier `fichier-scelle-candidat-final.json` (72 408 octets, SHA-256 `587dbac7…36db0`) fixe les 18 textes de l'essai, les 90 textes de l'histoire, les 412 réponses des quatre personnages et le réglage (α 1/4, facteur 3, seuils non stricts). Sa graine, `50d5971698eeaf54`, se calcule depuis le commit `83d05a4` de `simulation-2.md` relue ; le tirage des cases a été fait sur cette graine et écrit dans les fiches avant le scellement (§5). Le calibrage de l'histoire remplit les cinq critères dès r = 1 : il n'y a donc aucun r précédent, donc aucune raison d'échec à donner (§2). Le résumé de l'histoire et sa trace sont identiques octet pour octet pour la page, le programme de contrôle et le scellement (§3). Les 15 chiffres constants sont les mêmes pour S et pour C (§7). Les contrôles 2 à 4 sont passés sans défaut ; le contrôle 1 est sans défaut mais partiel : ses étapes 1 et 2 attendent l'empreinte publiée et la page construite (§4, §10). Le réglage de 200 parties, joué par S seul, n'a déclenché aucun changement (§6). Restent à écrire : la date et l'heure de publication de l'empreinte (§1).

## 1. Le fichier scellé

| | |
|---|---|
| Fichier | `docs/essai/a-ne-pas-ouvrir-2/outillage/scellement/final/fichier-scelle-candidat-final.json` (le programme écrit toujours « candidat » dans le nom de ses sorties) |
| Taille | 72 408 octets |
| Empreinte (SHA-256 des octets) | `587dbac7ecbde1c9b9e6d555a1ff162a6c4e42ece2a9fe82cef27f3baed36db0` |
| Format | JSON canonique, `format` « elenchos-essai-scelle », `version` 5, `statut` « final » (`schema.md`, partie 2) |
| Graine | `50d5971698eeaf54` |
| Calibrage | `histoire.tirage` = 1 ; `histoire.resume_sha256` = `d6e090f40d7a9ab4d46736f12959b6131815ddf603b22a71eac94ca2d5c58644` |
| Réglage | α 1/4 ; facteur 3 ; barre 16 ; `seuils_stricts` faux |
| Jour du scellement | 10 octobre 2026 (toutes les dates de vote du fichier sont au plus celle-là) |
| Programme de scellement | `outillage/scellement/sceller.py`, SHA-256 `589aef71642d3e7b0d2f008fef95b031ca53f0c169175b9318ded2b2a29b77dc`, dernier commit `301b6e6` |
| Programme de contrôle | `outillage/controle/controle.py` (et son paquet `ec/`), SHA-256 de `controle.py` `2fb2c5c936201571e4a8b23e9ae0271592ae15ee39ebf5454a3dbf55a754533a` ; arbre du commit `ff35184` |
| Commit du schéma | `83d05a4` (dernier commit de `schema.md` au scellement, SHA-256 `5ee0187c…`) ; modifié ensuite par `8314c1a` (§5, §10) |
| Publication de l'empreinte | `{date et heure de publication}`, commit `{commit de publication}`, poussé sur `main`. L'heure qui fait foi est l'heure de la poussée enregistrée par GitHub, comme au premier essai ; elle précède le remplacement de la page sur `gh-pages` (`simulation-2.md`, « Publication »). |

**Comment il a été produit.** Le programme de scellement a tourné le 10 octobre 2026 sur l'arbre du commit `ff35184`, qui est celui où les rangs T1 à T13 sont écrits dans les en-têtes des fiches (§5). Ses sorties sont rangées dans `outillage/scellement/final/` (commit `8669c12`) : `rapport-candidat-final.txt` (rapport machine de S ; empreintes complètes au §10), `reglage.txt`, `resume-histoire.json`, les traces de l'histoire, `detail-manches-porteur.txt` (non lu pour ce rapport, par consigne) et `fichier-scelle-candidat-final.json`. Le programme de contrôle a ensuite lu ce fichier sans le modifier.

**Le candidat 1 est remplacé.** Un candidat provisoire (`statut` « provisoire », fichier `bf6e1568…eb7e`, 72 280 octets) a été produit plus tôt, avec une graine provisoire `6479a9e7d2792f2a` calculée sur le commit courant de `simulation-2.md` d'alors (`bd09827`), faute de commit relu. Son rapport porte « NE PAS PUBLIER CETTE EMPREINTE ». Il a servi à écrire et à comparer à trois les programmes (`outillage/scellement/candidat-1/`). Aucune de ses valeurs n'entre dans le fichier final : la graine change tous les tirages.

## 2. Calibrage de l'histoire (fichier caché, point 10)

**r retenu : 1.** Le point 10 retient le premier r de 1 à 200 qui remplit les cinq critères ; r = 1 les remplit, donc aucun r précédent n'a échoué et il n'y a aucune raison d'échec à consigner. Le calibrage a été refait par C, de r = 1 à r = 1, avec le même résultat (contrôle 3, §4).

| Critère | Valeur au fichier |
|---|---|
| c1, curseurs nets exactement | Agathe S, P, L ; Nassim S, P, L ; Odile S, P, T, L ; Valentin P, T, L |
| c2, tempéraments au jour 0 | Agathe aucun ; Nassim aucun ; Odile L'Original et Le Tranché ; Valentin Le Pont |
| c3, surprise de la semaine 13, tous les textes révélés candidats | H86, départage « aucun » |
| c4, titulaires et Fidèles | Le Devin : 4 titulaires différents ; Le Mystère : 4 ; semaines à trois Fidèles ou moins : 10 sur 13 (6 exigées) |
| c5, curseurs nets du côté de leur profil et à 1/5 au moins du centre | aucun écart |

**Marge de c3.** Sur les sept textes révélés en semaine 13, H86 a 12 attributions et 10 erreurs ; le suivant, H88, a 12 attributions et 9 erreurs (erreurs des autres : H83 4, H84 5, H85 4, H87 0, H89 0). H86 l'emporte donc d'une erreur, sans départage à tirer. Le critère n'est pas refait à la main par les carnets de référence (§9).

**Pour mémoire, le candidat 1** (graine provisoire) avait retenu r = 16 après quinze échecs : c2 cinq fois, c3 neuf fois, c5 neuf fois (plusieurs critères pouvant échouer pour un même r). Le détail est dans `outillage/scellement/candidat-1/rapport-candidat-1.txt`. Ces échecs ne concernent pas le fichier final, dont la graine est autre. Ils sont rappelés parce qu'ils montrent que r = 1 n'avait rien d'acquis : sur la graine provisoire, les quinze premiers r échouaient.

## 3. L'histoire : résumé et trace

- **Résumé** (`resume-histoire.json`, forme canonique, sans fin de ligne) : 3 582 octets, SHA-256 `d6e090f40d7a9ab4d46736f12959b6131815ddf603b22a71eac94ca2d5c58644`, égal à `histoire.resume_sha256` du fichier. Le résumé recalculé par C (`resume-histoire-C.json`) est identique à celui de S, octet pour octet (comparaison faite pour ce rapport avec `cmp`).
- **Trace de l'histoire** (partie 4.2 du schéma) : 448 519 octets, SHA-256 `ae274a1159f98354772438e64af2dc22e1e89761689fd3fe4743d019e5514900`, 91 jours (−90 à 0) et 13 semaines. Les traces de S, de P (la page) et de C sont identiques octet pour octet (`trace-histoire-S.json`, `-P.json`, `-C.json`, même SHA-256). Chacune porte `empreinte_scelle` = `587dbac7…36db0`. La règle du §9 de `simulation-2.md` veut que les trois soient écrites sans que l'un voie le code de l'autre ; ce rapport ne peut pas le vérifier (§11).
- **État à l'arrivée** (curseurs vus au jour 1, entrée et H1 à H90). Treize curseurs sur seize sont nets (c1) ; les trois autres sont flous : Agathe sur T (Σw 2), Nassim sur T (Σw 4), Valentin sur S (Σw 3). Les valeurs exactes sont dans `resume-histoire.json`.
- **Titres des semaines 1 à 13.** Les 13 semaines ont un Devin et un Mystère. Deux titres sont attribués par tirage (Le Mystère des semaines 3 et 10) ; deux Devins le sont par les raisons cachées (semaines 3 et 8) ; les autres sans départage. Le Sans-Faute n'est attribué à personne. Semaine 13 : Fidèles Agathe, Odile, Valentin ; surprise H86.

## 4. Contrôles du fichier (contrôles 1 à 4)

Programme de contrôle, sur l'arbre du commit `ff35184` (sorties : `controle-1-C.txt`, `controles-2-4-C.txt`, `chiffres-constants-C.txt` et `.json`, dans `outillage/scellement/final/`).

- **Contrôle 1 : étapes 3 à 8 passées, étapes 1 et 2 non faites.**
  - *Étapes passées* : forme (UTF-8 strict, remis en forme canonique, mêmes octets) ; schéma (statut « final », version 5, fermé, dates au plus 2026-10-10) ; cohérence interne (tables, histoire, votes et suites, D-028 avec 10 textes rejetés sur 18 : E2, E3, T4, T5, T6, T8, T9, T10, T12, T14 ; A.4 ; E8 ; D-034 ; groupes deux à deux différents ; réponses et absences ; réponses atypiques ; ordre des tensions retenu) ; vecteurs de test (les trois sont identiques) ; typographie simple (334 chaînes) ; fidélité aux fiches (18 fiches, H86 et `votes.md`).
  - *Étape 8, en détail.* Les en-têtes sont stricts. Les rangs des cases du point 14 sont recalculés par C et égaux à ceux des fiches (§5). Les quatre textes en présentation B sont rapprochés par leur numéro de scrutin. L'ordre d'affichage des raisons est recalculé pour les 18 textes (clé « ordre-raisons|texte|i »). Les genres des raisons (D-034) sont recalculés.
  - *Groupes et commissions.* Les 22 lignes de la partie 2.10 sont comparées au `libelle` de l'organe dans `amo` (22 organes lus, chemin et SHA-256 de chacun dans `controle-1-C.txt`) ; la ligne de la partie 2.10 bis est de forme courte, donc vérifiée sur sa forme seule ; les 14 élisions du tableau 2.11 sont vérifiées.
  - *Étapes 1 et 2 : non faites.* L'empreinte publiée et la page construite n'étaient pas fournies à C. Le contrôle 1 n'est complet qu'après publication de l'empreinte et construction de la page.
  - *« Mêmes sources » (étape 8) : non comparé par le programme* (relevé non fourni). La comparaison a été faite pour ce rapport, à la main, sur les deux listes : les huit fichiers lus par S et par C (les quatre fiches, `votes.md`, `schema.md`, `regles-de-calcul-2.md`, `simulation-2.md`) ont la même empreinte des deux côtés ; l'empreinte du premier fichier scellé et celle de `profils.md`, lues par S et par C, sont aussi les mêmes. `simulation.md` n'est lu que par C ; `schema.md` et `empreinte.md` du premier essai ne sont lus que par S.
  - *Hors des huit étapes* : graine recalculée par C par la dérivation du §0 de `simulation-2.md`, sur E = `83d05a4…` : `50d5971698eeaf54`, identique à celle du fichier.
  - Verdict : aucun défaut trouvé (contrôle 1 partiel).
- **Contrôle 2 (profils) : passé.** Le premier fichier scellé a pour SHA-256 l'empreinte publiée au premier essai (`59db7484…7b64`). Le bloc `personnages` du nouveau fichier est identique octet pour octet à celui du premier (1 522 octets, SHA-256 `1f8aceee…89a0`). Les réponses types sont celles des profils. « Aucune étiquette politique » reste au Vérificateur (aucun programme ne la vérifie).
- **Contrôle 3 (réponses, histoire comprise ; calibrage refait ; résumé) : passé.** 412 réponses recalculées, 74 atypiques (histoire 64, essai 10), α 1/4. Le calibrage refait donne r = 1 avec c1 à c5 remplis. Le résumé recalculé égale `histoire.resume_sha256`.
- **Contrôle 4 (absences, histoire comprise) : passé.** 20 absences recalculées : 16 dans l'histoire, 4 dans l'essai (Agathe à T5, Odile à T1 et T9, Valentin à T3 ; Nassim aucune).
- **Verdict des contrôles 2 à 4 : aucun défaut.**

Hors de portée d'un programme (`schema.md`, partie 4.1) : la vérité des champs du vote (objet, issue, date, étape, suite), l'exactitude du mandat et du groupe des auteurs et de leur moment, la justesse de chaque forme d'élision et des formes courtes de commission, l'absence d'étiquette politique. Ils reposent sur Contenu et sur les relectures du lot.

## 5. Graine

**Ce que Git prouve.** La graine et sa dérivation : les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai-2|graine|" + E), où E = `83d05a44d3a254c39478071b3b86f52481f7a508`, dernier commit de `simulation-2.md` relue par Cohérence et par le Vérificateur. Aucun commit n'a touché `simulation-2.md` depuis : E n'a pas été choisi parmi plusieurs. Résultat : `50d5971698eeaf54`, que chacun peut recalculer ; C l'a fait. Le commit `83d05a4` est antérieur de plus de vingt minutes au commit `ff35184` qui écrit le tirage des cases dans les fiches (dates de commit, que leur auteur choisit ; l'heure de poussée enregistrée par GitHub n'a pas été relevée).

**Tirage des cases** (point 14, écrit dans les fiches au commit `ff35184`, avant le scellement). i est le rang du texte dans la liste « Cases {tension} » ; la liste est mélangée au sens du §0 (tri par t("ordre-texte|tension|i") croissant) ; le premier texte prend la première case de la tension dans l'ordre du calendrier. Cette lecture a été tranchée par l'orchestrateur (`controle/QUESTIONS.md`, Q-F1, commit `3d8aabf`) ; l'autre lecture (i = numéro de scrutin) donnerait un autre ordre sur 8 cases sur 13. Rang tiré, par case : T1 = 2484, T2 = 840, T3 = 2190, T4 = 707, T5 = 2758, T6 = 795, T7 = 2139, T8 = 989, T9 = 7922, T10 = 6770, T11 = 3370, T12 = 8167, T13 = 3449 (numéros de scrutin, rangs des fiches). S et C obtiennent les mêmes rangs, et ils sont égaux aux en-têtes des fiches.

**Ce que l'équipe déclare, sans pouvoir le prouver.** Le préfixe et le choix du commit E ont été écrits en une fois, sans essai d'une autre graine ni d'un autre commit. *(Confirmé par l'orchestrateur, le 10 octobre 2026 : sur E, S a tourné deux fois avant le fichier final, toujours sur la même graine : une fois en statut provisoire, seulement pour lire le tirage des cases et l'écrire dans les fiches (commit `ff35184`), puis une fois en statut final avec le réglage. Aucune autre graine, aucun autre commit E n'a été essayé. C'est une déclaration, pas une preuve.)*

**Avant E.** La graine finale n'existait pas. Entre le candidat 1 (graine provisoire) et E, des modifications ont pu connaître les résultats provisoires, qui dépendent d'une autre graine ; elles n'ont pas pu connaître les résultats finaux.

**Écrit ou changé après E, la graine étant connue.** Commits `78f9d59` à `ff35184`, 10 octobre 2026.
- *Ne touche ni les règles de l'histoire ni celles des réponses :* `simulation-2.md` (aucun commit après E) ; `schema.md` (aucun commit entre `83d05a4` et `8314c1a`, qui est postérieur au scellement) ; `regles-de-calcul-2.md`, dont seuls deux points ont changé entre `83d05a4` et `ff35184` : le point 11 (lecture du facteur : « curseurs nets du portrait en fin de jour 14, T14 compris », QUESTIONS de scellement 15 a) et le point 13 (définitions des chiffres constants 3, 8, et 15 c). Les points 1 à 10, qui règlent l'histoire et les réponses, ne bougent pas.
- *Touche le réglage, dont le résultat pouvait changer le facteur :* la lecture du facteur au point 11. Le résultat ne change pas le facteur (3, §6) ; l'autre lecture (portrait à l'ouverture du dimanche, 16 réponses) n'a pas été calculée.
- *Les fiches et `votes.md` :* seuls changent les 13 en-têtes `T{n}` et la colonne des rangs de `votes.md` (comparaison des commits `83d05a4` et `ff35184`). Le contenu des fiches ne change pas après E.
- *Les programmes* (`sceller.py`, `controle.py` et `ec/`, la page) : ils ont été mis en conformité avec la spécification finale (chiffres constants, réglage, dévoilement). Preuve de fait : C, qui applique la spécification sans lire `sceller.py`, recalcule toutes les réponses et toutes les absences scellées sans écart (contrôles 2 à 4), et les trois traces de l'histoire sont identiques.
- *Depuis le scellement* (commits `8669c12`, `5b31510`, `074b512`, `8314c1a`, `d7de6bd`, `0e4f4c3`) : deux sources de la spécification sont modifiées par `8314c1a`, ce qui explique que leur empreinte actuelle diffère de celle que S et C ont lue (§10) : une cellule du tableau de la trace dans `schema.md` (`mesures` : « s'ils ont une ouverture ») et la définition du joueur « nuancé » au point 12 de `regles-de-calcul-2.md`. Ni l'une ni l'autre n'entre dans le calcul du fichier. S n'a pas été relancé sur ces nouvelles empreintes ; le rapport ne prouve donc pas par une relance que le fichier est inchangé.
- Tout correctif d'avant le jour 1 s'ajoutera à cette liste.

## 6. Réglage sur 200 parties (point 11)

Joué par S seul (`sceller.py --reglage 200`, sur le candidat final). Le programme de contrôle ne le rejoue pas : arbitrage de l'orchestrateur, QUESTIONS de scellement 15 d. Les valeurs réglées (α, seuils, facteur) sont écrites au fichier ; C recalcule les réponses avec l'α du fichier, mais ne vérifie pas que les valeurs choisies sont les bonnes. Graine de réglage g_R = `f8a5378b0426dbc7` (16 premiers chiffres de SHA-256("elenchos-essai-2|reglage|50d5971698eeaf54")). Sortie : `reglage.txt`.

| Mesure | Résultat | Seuil | Décision |
|---|---|---|---|
| Justesse du joueur simulé sur ses quinze cartes, jumeaux comptés justes | 1549/3000 (51,63 %) ; semaine 14 : 878/1800 (48,78 %) ; semaine 15 : 179/600 (29,83 %) ; T13 : 492/600 (82,00 %) | au-dessus de 7/10 : α monte ; sous 7/20 : α baisse | ni l'un ni l'autre : **α reste à 1/4** |
| Justesse des personnages sur les cartes du joueur simulé (`auteur_compte`), semaine 15 | 1769/4255 (41,57 %) ; semaine 14 : 1142/3158 (36,16 %) | au-dessus de 3/5 : seuils stricts | pas au-dessus : **seuils non stricts** |
| Moyenne des curseurs nets du joueur simulé au jour 14 (portrait en fin de jour, T14 compris, facteur 3), joueurs dont aucune réponse type n'est neutre | 73/36 (environ 2,03) sur 72 joueurs ; 327/200 (1,635) sur les 200 | 1 à 3 : facteur 3 ; moins de 1 : 4 ; plus de 3 : 2 | **facteur 3** |

Les comparaisons sont faites en fractions exactes. Aucun paramètre ne change ; le candidat n'est pas refait. Le bord des crans (α déjà extrême) n'est pas en jeu.

**À lire avec prudence.** La justesse de T13 (82 %) est très au-dessus de celle des autres manches ; le rapport machine ne l'explique pas, et ce rapport non plus. Le joueur simulé n'est pas le porteur : il est cohérent, ne se fatigue jamais, ne lit ni l'intensité ni les raisons et ne passe jamais. Ses chiffres sont un repère pour le bilan, pas une prédiction. L'estimation du facteur au point 11 (environ 1,8) est inférieure à la mesure (environ 2,03), toutes deux dans la plage qui donne 3.

## 7. Chiffres constants du fichier

Ils ne dépendent pas des coups du porteur. Ils portent sur ses cinq manches (jours 1, 2, 3, 7 et 14 ; textes T0, T1, T2, T6 et T13) dans une partie menée à la clôture, sauf mention. **Calculés deux fois, sans que l'un voie le code de l'autre : par S (`rapport-candidat-final.txt`) et par C (`chiffres-constants-C.json`, SHA-256 `b5a3ede1075ea9f09586ea0be0b5c9332526d2482c7a9f7e2399aa70037b9ff5`). Les 15 chiffres sont égaux des deux côtés** : comparaison faite pour ce rapport, par programme pour la loi du chiffre 7, les réponses par texte (8) et les titres du chiffre 12, et par lecture pour le reste. Les fractions sont exactes.

| N° | Chiffre | Valeur |
|---|---|---|
| 1 | Cartes servies au porteur | 3 par manche (jours 1, 2, 3, 7, 14), 15 au total |
| 2 | Réponses atypiques parmi ses cartes (auteur d'origine) | 3 sur 15 (1/5) : T0, T2 et T6, toutes de Nassim |
| 3 | Remplacements de cartes identiques | 1 : jour 7, place 2, carte d'Agathe (4, 3) écartée, carte d'Odile (5, 1) mise à sa place |
| 4 | Cartes identiques servies ensemble | 1 manche, 2 cartes (T1, Nassim et Valentin, d'après la référence manuelle) |
| 5 | Égalités de classement (somme des `departages`) | 1 (jour 14) |
| 6 | Jumeaux non servis | 1 couple (carte, personnage), sur 1 carte |
| 7 | Justesse au hasard (D-024), sans passe | voir ci-dessous |
| 8 | Réponses par texte révélé | personnages : T0 4, T1 3, T2 4, T3 3, T4 4, T5 3, T6 4, T7 4, T8 4, T9 3, T10 4, T11 4, T12 4, T13 4 ; plus petit 3. Avec le porteur, T1 à T13 : 4, 5, 4, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5 ; plus petit 4 (seuil de l'avis du cercle : 3) |
| 9 | « Texte rejeté. » parmi E1 à E3 et T0 à T13 | 9 : E2, E3, T4, T5, T6, T8, T9, T10, T12 ; T14 rejeté, à part |
| 10 | Raisons « aucune » | chez les personnages : entrée 0 sur 12, histoire 23 sur 344, essai 2 sur 56 ; parmi les cartes du porteur : 1 affichée, 0 cachée, 1 carte à raison cachée déplacée par le §4.4 |
| 11 | Cercle unanimement neutre, T0 à T14 | 0 |
| 12 | État à l'arrivée | nets : Agathe SPL, Nassim SPL, Odile SPTL, Valentin PTL ; tempéraments : Odile L'Original et Le Tranché, Valentin Le Pont ; titres des 13 semaines et surprise H86 : `resume-histoire.json` |
| 13 | Pas de Côté des personnages (H90, T0 à T13) | aucun |
| 14 | Inattendus du lot, par combinaison (pour/contre) | croisé/croisé 2 ; croisé/pratique 4 ; pratique/croisé 5 ; pratique/pratique 6 ; sans/sans 1 (T14) ; détail texte par texte dans `chiffres-constants-C.json` |
| 15 | Impossibilités | (a) plus petit nombre de réponses de personnages sur T0, T1, T2, T6, T13 : 3 ; (b) Le Sans-Faute du porteur : 3 jours où ses cartes sont révélées en semaine 14, 1 en semaine 15, pour 5 exigés ; (c) Le Pas de Côté du porteur : textes lus de T1, T2, T5, T6, T12, T13 ; seul T12 le permet (4 réponses sur S avant lui, entrée comprise ; 4 exigées avec le facteur 3) |

**Chiffre 7, justesse au hasard.** Pour chaque carte, h = (candidats de la manche ayant donné la même réponse) / (nombre de candidats). Espérance : **9/2 cartes justes sur 15, soit 3/10 par carte** ; hors réponses atypiques, 7/2 sur 12 (7/24 par carte) ; par personnage (auteur d'origine) : Agathe 1/2 sur 2, Nassim 3/2 sur 4, Odile 1 sur 4, Valentin 3/2 sur 5. La loi exacte du nombre de cartes justes est écrite en entier dans les deux sorties. Repères tirés d'elle : 3 cartes justes ou moins avec une probabilité de 629543/1990656 (31,6 %) ; 6 ou plus, 567851/1990656 (28,5 %) ; 8 ou plus, 7111/110592 (6,4 %). Le modèle ne passe jamais, alors qu'un vrai joueur passe : le bilan doit le dire.

## 8. Impossibilités avec ce lot

- **Écran 5.12** (aucune carte à deviner) : impossible. Chaque texte deviné a au moins trois réponses de personnages (chiffre 15 a).
- **Le Sans-Faute du porteur** : impossible (3 puis 1 jours avec cartes révélées, pour 5 exigés).
- **Le Pas de Côté d'un personnage pendant l'essai** : n'arrive pas (chiffre 13).
- **Le Pas de Côté du porteur** : possible sur T12 seulement, et seulement si le porteur a déjà quatre réponses sur S avant lui (entrée comprise).
- **Un cercle unanimement neutre** : n'arrive pas (chiffre 11).
- **« Texte rejeté. »** : apparaît (9 textes sur E1 à E3 et T0 à T13, plus T14).
- **Cas non atteints, sans preuve d'impossibilité** (`outillage/page/temoins/LISEZ-MOI.txt` : 21 témoins et 92 stratégies du porteur essayées) : Le Sans-Faute d'un personnage en semaines 14 et 15 du cercle ; un tempérament qui change au jour 7 ou au jour 14. Ce rapport ne les distingue pas des cas impossibles : si le porteur ou un personnage les produit, rien dans l'essai n'a prouvé qu'ils fonctionnent.

## 9. Ce qui confirme le moteur avant la livraison de la page

- **Partie complète du joueur scripté de la page (`trace-partie.js --temoin`), mode moteur, jours 1 à 15.** Ce n'est pas la partie témoin (a) : celle-ci et les 21 autres témoins du lot 6, P = C chacun, sont dans `outillage/page/temoins/` (`resultats.txt`). La page (journal `journal-temoin-P.json`, 7 910 octets, SHA-256 `5fc0f7e87b70c83af96728bd6007642bd6b3c159a3cdae0c489a4619c245e967`) et le programme de contrôle donnent la même trace, octet pour octet : 126 646 octets, SHA-256 `69cd84646267d848a711cfdd7a7bb8d5377c6248fbce65f22a61dbf74a0c4364` (`trace-partie-temoin-P.json` et `-C.json`). Elle porte `empreinte_scelle` = `587dbac7…36db0` et `resume_histoire` = `d6e090f4…8644`. Cette partie « a » n'est pas la partie « (a) » des carnets de référence, jouée en mode interface avec des réponses toutes neutres : le portrait du jour 14 de la trace n'est pas flou partout, et n'est donc pas celui du cas D4. Les autres témoins de la page (22 témoins, rejeu dans Chromium) relèvent du rapport de la page, hors de ce rapport.
- **Carnets de référence** (`outillage/references/carnets-et-cas-chiffres.md`, commit `5b31510`, la note de l'orchestrateur étant ajoutée ensuite). Écrits à la main par une instance distincte (rôle Game design, modèle de vérification, `simulation-2.md` §9), à partir de la spécification et du fichier candidat final seuls ; elle n'a lu ni `resume-histoire.json` ni le code des programmes, et n'a pas pu calculer de SHA-256. Deux carnets : (r), jusqu'à l'ouverture du premier dimanche, et (a), la clôture. Comparés à la page et au contrôle (note de l'orchestrateur du 10 octobre 2026, `outillage/page/temoins/a-interface/comparaison-reference.txt`), ils concordent, durées, dates, heures et version masquées, sauf une seule ligne : la référence écrit « Révélation : aucune carte. » aux jours 7 et 14, alors que la page et le contrôle omettent la ligne. L'orchestrateur a tranché pour la page et le contrôle, d'après la lecture d'UX (Q-K3 : la ligne n'apparaît que le jour où une manche ouverte du porteur est révélée, jours 2, 3, 4, 8 et 15). **La référence n'a pas été retouchée.** Les lignes dépendant d'un tirage ou des curseurs courants des personnages (titres des semaines 14 et 15, chiffres « Sur tout l'essai ») n'ont pas été calculées à la main et ne sont donc pas recoupées.
- **Quatre cas chiffrés à la main**, comparés au fichier : D1 (semaine 13) donne Fidèles Agathe, Odile, Valentin (Nassim absent à H84), Sans-Faute non attribué, surprise H86 par la règle de l'essai ; D2 (Odile, tension T) donne Σw = 22 et c = 21/26, égaux au résumé ; D3 (Odile sur deux mois glissants) donne L'Original (25 textes sur 55) et Le Tranché (48 sur 55), égaux au résumé ; D4 (curseur accéléré du porteur dans la partie « a » des carnets) n'est pas rapproché ici d'une trace. Ces cas confirment le fichier sur ces points, pas sur les autres : le Devin et le Mystère de la semaine 13, Le Pont de Valentin, et le critère c3 (qui demande les tirages) n'ont pas été refaits à la main.

## 10. Sources lues et empreintes

SHA-256 relevés par S et C au scellement (identiques des deux côtés sur les huit fichiers communs) et recalculés pour ce rapport avec `sha256sum` sur l'arbre du dépôt.

| Source | SHA-256 | Dernier commit | Égal à l'arbre actuel |
|---|---|---|---|
| `docs/essai/simulation-2.md` | `5fde1822fda633ab3dce30cbdae87fff2a4ca141e4f0674c6a94f222b3cceb7e` | `83d05a4` | oui |
| `a-ne-pas-ouvrir-2/regles-de-calcul-2.md` | `ad7c42e0b44abe1f26e7b2cd85c71253230494e018ba11c7edbd684800ad0b51` | `301b6e6` | **non** : `fda0b770…eeef2` depuis `8314c1a` |
| `a-ne-pas-ouvrir-2/schema.md` | `5ee0187c282582fbc55435186ed4b9ed134c866a546b9548ddfdea58b7997dce` | `83d05a4` | **non** : `c41ae728…d66b2b` depuis `8314c1a` |
| `a-ne-pas-ouvrir-2/textes/votes.md` | `af34c5c545c793bb5cb45153b0d8d1055a2e8ad1c3b459faaa874cd3dbec9fb1` | `ff35184` | oui |
| `a-ne-pas-ouvrir-2/textes/S-securite-liberte.md` | `05088aeb95380e6d3d4916e4bdee44bbd3b2c7999fbe3c6d0174a650341de36f` | `ff35184` | oui |
| `a-ne-pas-ouvrir-2/textes/P-precaution-innovation.md` | `d8e138e3801b5dbe27bec4f06574d3ab242dca2dc2e1d692d301376936e306d6` | `ff35184` | oui |
| `a-ne-pas-ouvrir-2/textes/T-tradition-changement.md` | `2bc9882cdc127c107e0399c128625a7802d4bb9f371f4f2e9c421eef7de5c53e` | `ff35184` | oui |
| `a-ne-pas-ouvrir-2/textes/L-local-national.md` | `fb38c3bb212a9ff0ba48816309802e0f371da13cf504a8c3cad2a4b4f182643d` | `ff35184` | oui |
| `docs/essai/a-ne-pas-ouvrir/fichier-scelle.json` (premier essai) | `59db748499fd1ece3d5bf6f8ec4b3fed3badd15eb39cf474cd0e31d3045c7b64` | `067147f` | oui |
| `docs/essai/empreinte.md` | `c781d23397820699c244c685195236d4e0ff8068035f3ce4ac3cf50141c8f429` | `7b4f922` | oui |
| `docs/essai/a-ne-pas-ouvrir/profils.md` | `87867c2968b945a97323ec7a3a2e0a203e9945893ca8165b18a7ae971f2b6f3b` | `cdc9b29` | oui |
| `docs/essai/a-ne-pas-ouvrir/schema.md` (S1) | `4e7315319a1f3b79d648ebb1666e4d636cba3b08bd1023d9ab27099c5c52019b` | `b791f9a` | oui |
| `docs/essai/simulation.md` (lu par C seul) | `82625e27f45b9f484e5d5c14d619b858710354f499e6f8f8aeb4a386fc245f57` | `aaa00d4` | oui |

**Sorties de ce scellement** (`outillage/scellement/final/`, SHA-256 calculés pour ce rapport) :

| Fichier | SHA-256 |
|---|---|
| `fichier-scelle-candidat-final.json` | `587dbac7ecbde1c9b9e6d555a1ff162a6c4e42ece2a9fe82cef27f3baed36db0` |
| `rapport-candidat-final.txt` | `a808d5ac08db73c812b5e78977f3a016f5e94a747c9ab026c6175cd5e2bc9e53` |
| `reglage.txt` | `c2a7c4d26f000ffc92980d7aadbe86c81ae365d524f40c02572eabdf17c85017` |
| `resume-histoire.json` (= `resume-histoire-C.json`) | `d6e090f40d7a9ab4d46736f12959b6131815ddf603b22a71eac94ca2d5c58644` |
| `trace-histoire-S.json` (= `-P.json` = `-C.json`) | `ae274a1159f98354772438e64af2dc22e1e89761689fd3fe4743d019e5514900` |
| `controle-1-C.txt` | `11a3bfc783555e9d592f60efc3daf6e099bf952aa262d18a673ba5b9c06f1ac3` |
| `controles-2-4-C.txt` | `cdbb482d57aef2a9a937b5043aa568bd5c1b5dde9466f75685e52fdad61535ea` |
| `chiffres-constants-C.json` | `b5a3ede1075ea9f09586ea0be0b5c9332526d2482c7a9f7e2399aa70037b9ff5` |
| `chiffres-constants-C.txt` | `efc3243457f686fce627ad8112f62f5c85428e66f854e7c60e5d410ab2838269` |
| `journal-temoin-P.json` | `5fc0f7e87b70c83af96728bd6007642bd6b3c159a3cdae0c489a4619c245e967` |
| `trace-partie-temoin-P.json` (= `-C.json`) | `69cd84646267d848a711cfdd7a7bb8d5377c6248fbce65f22a61dbf74a0c4364` |

## 11. Limites

- **Trois lectures de la même spécification.** S, C et la page lisent les mêmes documents ; les carnets de référence sont d'une autre instance, sur le modèle de vérification (`simulation-2.md` §9, D-018). Une erreur de la spécification elle-même, ou un angle mort commun aux modèles, ne se voit pas (`CLAUDE.md`, « Limites assumées »). Ce rapport ne relève pas quel modèle a écrit S, C et la page.
- **Indépendance des programmes.** La règle (§9 de `simulation-2.md`) est que C est écrit sans lire le code de la page et que S et C calculent les chiffres constants sans voir le code l'un de l'autre. Ce rapport n'a pas de moyen de la vérifier ; il ne relève aucun écart connu. L'instance des carnets de référence a lu le fichier candidat final, par extraits (réponses, profils, absences, textes), donc ses calculs vérifient le fichier contre les règles, pas les programmes contre le fichier. *(À confirmer ou corriger par l'orchestrateur avant relecture.)*
- **Le contrôle 1 n'est pas complet.** Étapes 1 et 2 à faire (empreinte publiée, page construite) ; la comparaison « Mêmes sources » n'a pas été faite par le programme, seulement à la main (§4).
- **Réglage non recoupé.** Joué par S seul ; C ne le rejoue pas. Rien ne confirme les 200 parties par un second calcul. La lecture du facteur (portrait en fin de jour 14) est une lecture retenue par l'orchestrateur ; l'autre lecture n'a pas été calculée.
- **Marge de c3.** H86 devance H88 d'une erreur sur 12 attributions. Le critère a été calculé par S et refait par C, mais pas à la main.
- **Sources modifiées depuis le scellement.** `schema.md` et `regles-de-calcul-2.md` ont changé après le scellement (§5, §10). Les changements ne touchent pas le calcul du fichier : S, relancé par l'orchestrateur sur l'arbre courant (après `0e4f4c3`, `--commit E`, statut final), redonne le même fichier (SHA-256 `587dbac7…6db0`) et le même résumé, octet pour octet.
- **Graine.** Elle dépend d'un commit relu. Que la règle ait été écrite en une fois et qu'aucune autre graine n'ait été essayée est une déclaration de l'équipe (§5), non une preuve.
- **Les copies `amo` de contrôle.** Les 22 fichiers d'organes comparés aux groupes ne sont pas dans le dépôt : leurs chemins sont dans un répertoire de travail de la session, et seuls leurs SHA-256 figurent dans `controle-1-C.txt`. Quelqu'un qui voudrait refaire la comparaison devrait retélécharger les données ouvertes de l'Assemblée et vérifier ces empreintes.
- **La vérité des votes, des auteurs et des arguments** repose sur Contenu et sur ses relectures (relevé des votes fait deux fois, par deux agents), pas sur un programme.
- **Le joueur simulé n'est pas le porteur** (§6). La partie témoin « a » est un témoin mécanique : utile pour le contrôle, muette sur le plaisir de deviner.
- **Cas non atteints** (§8) : Le Sans-Faute d'un personnage en semaines 14 et 15 du cercle, et un tempérament qui change au jour 7 ou au jour 14, n'ont pas été produits par les témoins, sans preuve qu'ils soient impossibles.
- **Sujets entrevus (D-037).** Le porteur a pu entrevoir, pendant la préparation, des sujets ou des résultats de votes du lot, que les points d'étape de l'orchestrateur ont cités par erreur. Il a décidé de garder le lot tel quel. À rappeler au bilan.
