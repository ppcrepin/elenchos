# Spécification de la simulation : essai solo (étape 4)

*Rédigée par Game design le 4 octobre 2026, pour l'essai décidé en D-015 et D-016 (page jouable, quatre personnages inventés, une journée de jeu par séance, 14 jours). Spécification de travail, pas un texte pour le porteur. Personnages, vies et exemples fictifs. **Les profils cachés et le corrigé de fin d'essai sont dans `a-ne-pas-ouvrir/`**, pour ne pas fausser l'essai. Pas encore relue par Cohérence ni le Vérificateur.*

Sources : D-010, D-011, D-015, D-016 ; `docs/produit.md`, règles 1 à 19 ; `docs/projet.md` §4 et §5 ; tableau `S` de `docs/maquettes/maquettes-finales.html`.

## 0. Cadre commun

### Les quatre tensions de l'essai

| Code | Pôle 0 | Pôle 1 | Index T8 |
|---|---|---|---|
| S | Sécurité | Liberté individuelle | 0 |
| P | Précaution | Innovation | 3 |
| T | Tradition | Changement | 4 |
| L | Local | National | 7 |

- Écartées pour l'essai : Égalité/Mérite, Solidarité/Responsabilité et État/Marché (qui suivent directement le clivage gauche-droite) ; Souveraineté/Ouverture (immigration, Europe).
- Tradition/Changement est gardée à une condition pour Contenu : aucun texte de mœurs ou de religion qui suive une ligne de parti.
- Les quatre tensions écartées restent affichées dans Moi, floues et immobiles.

### Calendrier (lecture A de C-006, D-010)

| Séance | Jour | Révélation (texte) | Deviner (texte) | Répondre (texte) | En plus |
|---|---|---|---|---|---|
| 0 | entrée | — | « Et Agathe ? » sur E1, E2, E3 | E1, E2, E3 | compte, entrée dans le cercle |
| 1 | lundi | — | « Rien à deviner pour l'instant. Réponds : à 18h, ton cercle pourra te deviner. » | 1 | — |
| 2 | mardi | — (pas de message de 18h) | 1 | 2 | — |
| k = 3 à 14 | … | k−2 | k−1 | k | — |
| 7 | dimanche | 5 | 6 | 7 | badge rare éventuel, puis titres de la semaine 1 |
| 14 | dimanche | 12 | 13 | 14 | badge rare éventuel, puis titres de la semaine 2 |
| 15 | clôture | 13 | — | — | fiche du texte 14 (vote et auteurs, sans attributions), questions de fin, dévoilement, export |

- Séances 3 à 14 : ouvertes par le message de 18h validé (version du dimanche aux séances 7 et 14, D-014).
- Semaine 1 = séances 1 à 7 (révélations : textes 1 à 5 ; réponses : textes 1 à 6). Semaine 2 = séances 8 à 14 (révélations : 6 à 12 ; réponses : 7 à 13). Les points repartent de zéro à la séance 8.

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

Fiches visibles par le porteur (fiche d'essai, hors produit, ouverte depuis Le Cercle) :

| Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu |
|---|---|---|---|---|---|
| Agathe | 46 | sage-femme | Rennes | Travaille de nuit une semaine sur deux ; le reste du temps, elle chante dans une chorale de quartier. | 7h40 |
| Nassim | 33 | électricien à son compte | Clermont-Ferrand | Refait des cuisines toute la semaine ; le samedi, il restaure de vieilles motos avec son père. | 12h45 |
| Odile | 69 | pharmacienne retraitée | Ribérac (Dordogne) | A tenu la pharmacie de son bourg pendant trente-cinq ans ; à 68 ans, elle s'est mise au paddle. | 9h10 |
| Valentin | 24 | développeur dans une jeune entreprise | Lyon | Écrit des applications pour téléphone ; le week-end, il court en montagne. | 23h20 |

Profils cachés (position de 0 à 1 et fermeté sur chaque tension) : voir `a-ne-pas-ouvrir/profils.md`. Contraintes tenues : deux proches, une tranchée, des valeurs que la vie ne laisse pas deviner, aucun bloc calqué sur un parti, chaque tension partage le cercle.

## 2. Comment un personnage répond

Contenu fournit pour chaque texte (annexe A) : la tension t ; le sens s (le pôle que sert « favorable ») ; quatre considérations dans l'ordre d'affichage, chacune avec un côté (pour ou contre) et un pôle (0, 1 ou aucun).

### 2.1 Position type

1. a = p si s = 1, sinon a = 1 − p.
2. k = (a − 0,5) × m, avec m = 0,6 (fermeté faible), 1,0 (moyenne), 1,6 (forte).
3. |k| < 0,10 → Neutre ; 0,10 ≤ |k| < 0,30 → Favorable si k > 0, Défavorable sinon ; |k| ≥ 0,30 → Très favorable ou Très défavorable selon le signe.

### 2.2 Raison

- Ensemble E : position favorable → considérations « pour » ; défavorable → « contre » ; neutre → les quatre.
- Pôle visé : position non neutre → le pôle que sert la position (s si favorable, 1 − s si défavorable) ; neutre → 1 si p > 0,5, sinon 0.

| Cas | 1er choix | 2e choix | 3e choix | En dernier |
|---|---|---|---|---|
| Fermeté faible, non neutre | hors tension | du pôle visé | le reste de E | « aucune » |
| Fermeté moyenne ou forte, non neutre | du pôle visé | hors tension | le reste de E | « aucune » |
| Neutre, fermeté faible | hors tension | — | — | « aucune » |
| Neutre, fermeté moyenne ou forte | du pôle visé | hors tension | — | « aucune » |

E vide → « aucune ». Premier niveau non vide ; plusieurs candidates → départage par t("raison|prénom|texte|id").

### 2.3 Écarts au profil (réponses atypiques)

- Exactement 3 par personnage, sur les textes 1 à 13 ; aucun sur l'entrée ni sur le texte 14 (12 écarts sur 48 réponses devinables, 25 %).
- Forme : côté opposé à la réponse type, au niveau simple ; si la réponse type est neutre : Favorable si t("cote-ecart|prénom|texte") < 0,5, sinon Défavorable ; raison selon 2.2 avec le nouveau côté.
- Contraintes : (a) jamais un jour d'absence ; (b) jamais deux textes consécutifs pour un même personnage ; (c) au plus deux personnages en écart sur un même texte ; (d) au moins un écart dans 1 à 6 et un dans 7 à 13.
- Procédure : personnages dans l'ordre Agathe, Nassim, Odile, Valentin ; textes 1 à 13 classés par t("ecart|prénom|n") ; on retient, en respectant (a) à (c) : le premier valable entre 1 et 6, le premier valable entre 7 et 13, puis le premier valable restant.

### 2.4 Absences

| Personnage | Textes sans réponse |
|---|---|
| Agathe | aucun |
| Nassim | 3 et 10 |
| Odile | 10 |
| Valentin | 5 |

Une absence le jour n : pas de réponse au texte n, aucune devinette à la séance n. Deviner propose toujours les quatre visages, absents compris (D-011) ; rien n'indique qui est absent ; aucune pause (il faut sept jours sans réponse).

### 2.5 Entrée

Les personnages répondent à E1, E2, E3 avec 2.1 et 2.2, sans écart. Le porteur ne voit que les réponses d'Agathe (« Et Agathe ? », puis révélation immédiate) ; une devinette est juste si elle trouve le bon côté (D-011) ; bilan « 2 sur 3 » ou compte des surprises à 0 ou 1 (D-006). Textes d'entrée recommandés sur S, P et L.

### 2.6 « Déjà joué aujourd'hui »

Journée de 18h à 18h ; m(h) = (h − 18 + 24) mod 24. Un personnage s'affiche s'il a répondu au texte du jour et si m(son heure de jeu) ≤ m(heure réelle du porteur). On ne dit jamais qui n'a pas joué.

## 3. Comment un personnage devine

1. À chaque séance k de 2 à 14, chaque personnage présent joue une manche sur le texte k−1 ; cartes choisies comme au §4 avec lui pour devineur ; candidats : les quatre autres membres, porteur et absents compris.
2. Côté attendu d'un candidat X vu par g (aligné sur le sens du texte) : +1, 0 ou −1.
   - X personnage : a = p de X aligné ; +1 si a ≥ 0,6 ; −1 si a ≤ 0,4 ; sinon 0.
   - X porteur : g n'utilise que les réponses du porteur qu'il a eues dans ses propres cartes, déjà révélées (textes ≤ k−2), sur la même tension ; c = (2 + Σ w·π) / (4 + Σ w) (poids et pôles du §5.1) ; Σ w = 0 → « inconnu » ; sinon mêmes seuils.
3. Score d'une carte de côté c pour X : 2 si égal au côté attendu ; 1 si l'un vaut 0 ou si X est « inconnu » ; 0 si opposés.
4. Attribution : toutes les affectations une carte = une personne, total maximal ; égalité → candidats mélangés par t("devine|g|k|candidat"), premier maximum dans l'ordre lexicographique. Les personnages ne passent jamais.
5. Raison cachée : parmi les considérations du côté de la carte (les quatre si neutre), la première dans l'ordre d'affichage dont le pôle correspond au côté attendu du candidat choisi (+1 → s ; −1 → 1 − s) ; candidat attendu à 0 ou « inconnu » → la première hors tension, sinon la première ; rien de possible → « aucune ».
6. Justesse attendue (hypothèse) : 60 à 70 % sur les cartes des personnages ; 30 à 50 % sur celles du porteur, en hausse.

## 4. Les trois réponses à deviner (règle 8)

### 4.1 Réponses possibles
Pour le devineur g à la séance k : les réponses au texte k−1 des membres autres que g qui ont répondu.

### 4.2 Score de surprise (calculé à partir des seules réponses, jamais des profils cachés)

| Grandeur | Définition |
|---|---|
| x | position sur l'axe : v si s = 1, 1 − v si s = 0 |
| Curseur de l'auteur | centre c et largeur w (§5), sur ses réponses d'entrée et les textes ≤ k−2 |
| q | (0,95 − w) / 0,70 : 0 au départ, 1 quand le curseur est net |
| Écart | \|x − c\| |
| Rareté | \|x − médiane des x de toutes les réponses au texte k−1, porteur compris\| |
| Surprise | q × écart + (1 − q) × rareté |

Au départ, q ≈ 0 : on sert les réponses les plus singulières du jour ; à mesure que les curseurs se resserrent, les réponses inattendues de la part de leur auteur.

### 4.3 Choix
- Trois réponses possibles ou moins : toutes.
- Sinon : les deux plus fortes surprises (départage t("surprise|g|k|auteur")), plus une au hasard parmi les autres (t("hasard|g|k|auteur")).
- Cartes identiques (même niveau, même raison) : jamais ensemble ; on remplace la moins bien classée par la suivante ; si impossible, les deux attributions comptent justes.

### 4.4 Carte à raison cachée
Trois cartes : la carte tirée au hasard, si sa raison n'est pas « aucune » ; sinon la moins surprenante dont la raison n'est pas « aucune » ; sinon la carte tirée au hasard malgré tout. Deux cartes : la moins surprenante, même exception. Une carte : celle-là.

### 4.5 Affichage
Ordre des cartes : t("ordre|g|k|auteur"), jamais par surprise. Visages : Agathe, Nassim, Odile, Valentin, toujours dans cet ordre. Jamais montrés : le score de surprise, une étiquette « inattendue », qui est absent.

### 4.6 Révélation de la carte à raison cachée
Verdicts validés inchangés. Ajout à confirmer par UX : si la personne ou la raison est fausse, afficher aussi « Sa raison : « … ». ».

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
Centre c = (2 + Σ w·π) / (4 + Σ w) ; largeur = max(0,95 − 0,07 × Σ w ; 0,25) ; net dès Σ w ≥ 10.

### 5.3 Dessin
Flou : zone de largeur w centrée sur c. Net : un point à c. Ordre dans Moi : nets, puis flous du plus étroit au plus large ; à égalité S, P, T, L, puis les tensions écartées.

### 5.4 Ce qui est compté
- Portrait du porteur dans Moi : toute réponse dès qu'elle est donnée, entrée comprise (règle 15).
- Curseurs des autres vus par le porteur : seulement l'entrée et les textes ≤ k−2 (sinon un curseur qui bouge trahirait une réponse avant qu'on la devine).
- Le Cercle : aucune initiale sur les barres (personne n'est net) ; « Encore flou : » suivi de tous les membres.
- Tempéraments : non calculés, non affichés (il faut deux mois).
- Dans l'essai, aucun curseur ne devient net ; c'est voulu.

### 5.5 Phrase du jour (juste après chaque réponse quotidienne, jamais à l'entrée)

| Tension | Pôle 0 | Pôle 1 |
|---|---|---|
| S | la sécurité | la liberté |
| P | la précaution | l'innovation |
| T | la tradition | le changement |
| L | la décision locale | la règle nationale |

| Cas | Phrase |
|---|---|
| Arbitrage net | « Aujourd'hui, tu as fait passer {pôle gagnant} avant {pôle perdant}. » |
| Penchant | « Aujourd'hui, tu as penché vers {pôle}. » |
| Tiraillé | « Aujourd'hui, tu as donné du poids à {pôle 0} comme à {pôle 1}. » |
| Neutre | « Aujourd'hui, tu as tenu la balance égale entre {pôle 0} et {pôle 1}. » |

### 5.6 Phrase de la semaine (séances 7 et 14)
- Tension nette : la plus éloignée de 0,5 ; « Entre {…} et {…}, tu choisis le plus souvent {…}. »
- Sinon, tension au plus fort poids d'arbitrage de la semaine (à égalité S, P, T, L) : au moins 2 arbitrages et un pôle l'emporte → « Cette semaine, entre {…} et {…}, tu as le plus souvent choisi {…}. » ; égalité → « Cette semaine, entre {…} et {…}, tu n'as penché d'aucun côté. » ; moins de 2 → « Cette semaine, tes réponses n'ont pas encore tranché. Chaque réponse précise ton portrait. »
- Le curseur flou de cette tension s'affiche dessous.

## 6. Titres et badges

1. Points : un par carte attribuée à son auteur ; raison cachée trouvée = personne et raison justes ; une carte compte dans la semaine où elle est révélée.
2. Le Devin : le plus de points (au moins 1) ; égalité → le plus de raisons cachées trouvées ; puis t("devin|semaine|prénom").
3. Le Mystère : pour X, tentatives = attributions des autres sur les cartes de X révélées dans la semaine, passes exclues ; erreurs = celles qui n'ont pas désigné X ; au moins 6 tentatives ; plus forte proportion ; égalité → le plus d'erreurs, puis t("mystere|semaine|prénom").
4. Le Fidèle : tous ceux qui ont répondu à toutes les réponses de la semaine (textes 1 à 6, puis 7 à 13) ; en semaine 1, libellé « ont répondu chaque jour » (à confirmer par UX).
5. Surprise de la semaine : parmi les textes révélés dans la semaine, plus forte proportion d'attributions fausses (au moins 4) ; égalité → le plus d'erreurs, puis t("surprise-semaine|semaine|n").
6. Le Sans-Faute : semaine 2 seulement ; chacune des 7 révélations avec au moins une carte, aucune passe, toutes les attributions justes ; raison cachée non exigée ; annoncé à la séance 14, avant les titres.
7. Le Pas de Côté : curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ; ne se déclenchera pas dans l'essai.
8. Séquence du dimanche : révélation habituelle ; badge rare éventuel ; Le Devin ; Le Mystère ; Le Fidèle ; surprise de la semaine ; phrase de la semaine ; fin. Jamais de total, de proportion ni de rang.

## 7. Carnet de bilan

Chaque séance (vouvoiement, après « En attendant ») :
1. (dès la séance 3) « Vos erreurs à la révélation de ce soir : » J'aurais pu trouver · Impossible à deviner · Aucune erreur.
2. « Le texte du jour et ses raisons : » Compris d'une lecture · Relu · Pas compris.
3. « Le moment fort de cette séance : » Deviner · La révélation · Donner mon avis · Aucun (ajouts à confirmer par UX : « Ma phrase du jour », « Les titres » aux séances 7 et 14 ; ne proposer que les moments vécus).

Mesures automatiques (rien de politique) : durées de la séance, de Deviner et de Répondre ; nombre de « Relire » et de « Passer » ; attributions justes du jour ; raison cachée tentée puis trouvée ; titres reçus.

Fin d'essai (séance 15, avant le dévoilement) :
- F1 « Placez chacun sur les quatre tensions » : grille 4 × 4, trois choix par case ({pôle 0} · Au milieu · {pôle 1}) ; corrigé dans `a-ne-pas-ouvrir/profils.md` ; au hasard, environ 5 cases justes sur 16.
- F2 « Sur ces deux semaines, deviner est devenu : » Plus amusant · Aussi amusant · Moins amusant · Jamais amusant.

Dévoilement : profils et fermeté, écarts texte par texte, absences, graine, fichier scellé et empreinte.

Export : « Copier mon carnet » (carnet, mesures, F1, F2 ; jamais les positions ni les raisons du porteur, D-016) ; « Copier le journal de contrôle », séparé et facultatif (contient ses positions et raisons), pour les contrôles 6 à 9 du §8.

## 8. Ce que le Vérificateur contrôle

Avant la séance 0 : l'empreinte est publiée dans la conversation, avec la date et l'heure.

Sans le journal du porteur :
1. Empreinte : SHA-256 du fichier scellé (JSON canonique) égal à l'empreinte publiée ; données embarquées identiques.
2. Profils : conformes au §1 (prénoms, aucune étiquette politique, paire de proches, tranchée, vie trompeuse, inviteuse).
3. Réponses : les 64 réponses (12 d'entrée, 52 quotidiennes) recalculées par 2.1 à 2.3 ; écarts : 3 par personnage, contraintes (a) à (d), procédure reproduite.
4. Absences : les 4 prévues ; un absent ne répond pas et ne devine pas.
5. Code de la page : réponses des personnages lues dans les données scellées ; rien ne dépend des réponses du porteur ; la sélection n'utilise pas les profils cachés.

Avec le journal de contrôle (si le porteur le transmet) : 6. sélections et raison cachée reproduites ; 7. devinettes des personnages reproduites ; 8. points, titres et badges reproduits ; 9. portrait et phrases du porteur reproduits.

Toujours : 10. chiffres à rapporter (justesse du porteur en semaines 1 et 2, repère 35 à 65 % en semaine 2, au hasard 25 % ; justesse des personnages ; part d'écarts parmi les cartes ; remplacements de cartes identiques ; nombre de « aucune » ; départages ; titulaires) ; 11. lignes rouges sur ce qui a été affiché (jamais la réponse du porteur à côté d'une autre, aucun taux d'accord, aucun classement, jamais « n'a pas joué »).

## Annexe A : ce que Contenu fournit (17 textes : E1 à E3, puis 1 à 14, plus 2 de réserve)

Pour chaque texte : titre et trois lignes ; vote ; auteur et groupe ; lien du scrutin et sources ; tension (S, P, T ou L) et sens s ; quatre considérations dans l'ordre d'affichage, chacune avec texte, côté, pôle (0, 1 ou aucun), député et groupe.

Contraintes : au moins une « pour » et une « contre » (deux et deux recommandé) ; au moins une sur chaque pôle ; au plus une hors tension.

Répartition : entrée E1, E2, E3 sur S, P, L ; quotidiens S 4, P 3, T 4, L 3 ; jamais la même tension deux jours de suite ; chaque tension au moins une fois dans 1 à 7 et dans 8 à 14 ; pour chaque tension, au moins un texte de chaque sens.

## Annexe B : le fichier scellé

Contenu : version et graine ; les 17 textes ; les 4 fiches (heure de jeu, profil) ; l'inviteuse ; les absences ; les écarts (avec le côté tiré quand la réponse type était neutre) ; les 64 réponses calculées. JSON canonique (UTF-8, clés triées, sans espaces) ; empreinte SHA-256 en hexadécimal ; écrit par un agent distinct avant la séance 0 (D-015) ; embarqué dans la page en base64.

Calculé en direct, jamais scellé (dépend du porteur) : sélections, devinettes des personnages, points, titres, portrait.

## Décisions touchées, conventions et constats

Aucune décision modifiée. Conventions propres à l'essai : 4 tensions seulement ; semaine 1 incomplète ; départage final par tirage ; personnages qui ne passent jamais ; Le Fidèle revient d'office au porteur s'il répond chaque séance ; fiche « Qui est qui » hors produit ; texte 14 dévoilé sans attributions.

Interprétations à confirmer : « raison cachée trouvée » = personne et raison ; Sans-Faute du lundi au dimanche ; Mystère = erreurs sur ses propres réponses rapportées aux tentatives, passes exclues, minimum 6.

Manques du produit révélés (à ouvrir comme constats) : phrase du dimanche quand aucun curseur n'est net (règle 18) ; curseurs des autres limités aux réponses déjà révélées (règle 19) ; deux cartes identiques (règle 8) ; afficher la vraie raison quand la devinette est fausse (écran 2.7b) ; message de 18h un jour sans révélation, et Le Fidèle dans une semaine incomplète ; départage final du Devin et du Mystère (le §4 dit « un seul titulaire ») ; libellé des pôles de Local/National dans les phrases.

## Limites et doutes (Game design)

- Le Sans-Faute est presque inatteignable (21 attributions justes de suite).
- Quatorze jours ne montrent ni le Pas de Côté, ni les curseurs nets, ni les tempéraments ; c'est voulu.
- Risque à long terme (règles 8 et 19 ensemble) : des joueurs pourraient apprendre à « lire à l'envers » ; à surveiller en bêta.
- Titres biaisés : les personnages gagneront probablement Le Devin ; le porteur sera probablement Le Mystère en semaine 1.
- Les personnages devinent mécaniquement (le côté, pas l'intensité) ; les justesses sont des hypothèses.
- Des profils figés risquent d'être « résolus » dès la deuxième semaine ; F2 le mesure.
- Tradition/Changement garde un risque partisan ; le choix des textes est la seule protection.
- Rien ici ne dit ce que ressentent de vrais proches (D-015).
