# Règles de calcul du second essai (fichier caché)

**À ranger dans `docs/essai/a-ne-pas-ouvrir-2/` au scellement ; ne pas montrer au porteur avant la fin de l'essai.**

*Source : Game design, bloc caché C de ses sections finales du 9 octobre 2026, recopié tel quel. Fichier destiné à `a-ne-pas-ouvrir-2/regles-de-calcul-2.md`.*

**En-tête.** Ce fichier complète `simulation-2.md`, dont il garde la numérotation. Pour tout ce qu'il ne dit pas, les règles de `a-ne-pas-ouvrir/regles-de-calcul.md` s'appliquent. Toutes les grandeurs sont exactes.

**1. Notations.**
- j : jour. Textes : E1–E3, H1–H90 (Hi répondu le jour i − 91), T0–T14 (Tn répondu le jour n) ; dans les clés, n = « 0 » à « 14 ».
- Semaines : 1 à 15 (§0).
- « Sa valeur » d'un personnage sur une tension : π_p = 1 si p > 1/2, sinon 0. Aucun profil n'est à 1/2.
- Période d'histoire : H1–H90. Période d'essai : T0–T14.

**2. Profils.** Le tableau des positions, des fermetés et des contraintes de `profils.md` est recopié tel quel. Ses parties « Réponses atypiques » et « Absences » sont remplacées par ce fichier. Le corrigé de F1 ne sert plus.

**2 bis. Textes de l'histoire** (indépendants du lot, sauf H86 : candidat en deux temps possible)
- **Tension.** Ordre (S, P, T, L) ; le texte du jour j (−90 à −1) a l'indice (j + 6) mod 4.
  - H86 (j = −5) et H90 (j = −1) sont donc des textes P. P est la tension de H86.
  - Deux jours de suite n'ont jamais la même tension, et le jour −1 n'a pas celle de T0 (S).
  - Comptes : S 23, P 23, T 22, L 22.
- **Sens.** Il alterne d'une occurrence à l'autre de chaque tension. La première occurrence de S, T et L a le sens 1. Pour P, l'alternance est calée pour que H86 ait le sens 0.
- **Raisons** : quatre, numérotées 1 = « pour » attendue, 2 = second « pour », 3 = « contre » attendue, 4 = second « contre ».
  - Sans inattendu si t("histoire-raisons|Hi") < 1/2 : la raison 2 a le pôle s, la raison 4 le pôle 1 − s.
  - Sinon, chaque côté c reçoit un inattendu croisé si t("histoire-inattendu|Hi|c") < 1/2 (pôle d'en face), sinon un inattendu pratique (pôle aucun).
  - Les proportions (1/2 et 1/2) sont fixées d'avance, pour le candidat en deux temps. Elles s'appuient sur le premier relevé de Contenu (3 ou 4 paires sur 10 débats lus) ; le lot servi en aura probablement plus, puisqu'il est choisi.
- **Ordre d'affichage** : t("ordre-raisons|Hi|k").

**3. Comment un personnage répond**
- **2.1 Position type** : inchangée.
- **2.2 bis Raison (D-034).** E = les raisons de son côté (les quatre si sa position est neutre).

| Cas | 1er choix | 2e | 3e | En dernier |
|---|---|---|---|---|
| Non neutre, fermeté moyenne ou forte | de sa valeur | hors tension | de l'autre valeur | « aucune » |
| Non neutre, fermeté faible | hors tension | de sa valeur | de l'autre valeur | « aucune » |
| Neutre, fermeté faible | hors tension | — | — | « aucune » |
| Neutre, fermeté moyenne ou forte | de sa valeur | hors tension | — | « aucune » |

  - On prend le premier niveau non vide ; départage par t("raison|prénom|texte|id").
  - **Pour une réponse type, c'est exactement la règle du premier essai** : sa valeur est le pôle que sert la position.
  - **Seul changement, la réponse atypique.** Le personnage change de position, pas de valeur. La table s'applique telle quelle, avec sa valeur π_p. Quand le nouveau côté sert l'autre valeur (toujours le cas si sa réponse type n'est pas neutre), la table donne :
    - sur le nouveau côté, il prend d'abord l'inattendu croisé (réponse tiraillée, w = 0) ;
    - sinon la raison hors tension (penchant, w = 1/2) ;
    - sinon l'attendue du nouveau côté : arbitrage net contre son profil, seul cas qui peut faire un Pas de Côté ;
    - la fermeté ne change rien à cet ordre : un côté n'a jamais deux inattendus (D-034), donc le croisé et la raison hors tension ne se disputent jamais la place ;
    - quand sa réponse type est neutre et que le côté tiré sert sa valeur, la table donne l'attendue (fermeté moyenne ou forte), ou d'abord la raison hors tension (fermeté faible) : une réponse de sa valeur.
  - **Effet voulu (D-034, « la raison aide à reconnaître chacun »)** : une carte atypique porte souvent la valeur de son auteur. Les Pas de Côté des personnages restent rares : ils ne viennent que des textes sans inattendu.
- **2.3 Réponses atypiques**, avec α = 1/4 par défaut (réglage : 1/6, 1/4 ou 1/3).
  - Textes dans l'ordre du calendrier ; pour chacun, personnages dans l'ordre Agathe, Nassim, Odile, Valentin.
  - Une réponse est atypique si :
    - (a) le personnage est présent ;
    - (b) sa réponse au texte précédent de la même période n'est pas atypique ;
    - (c) moins de deux personnages sont déjà atypiques sur ce texte ;
    - et t(clé) < α, avec la clé « ecart|r|prénom|Hi » pour l'histoire, « ecart|prénom|n » pour l'essai.
  - Jamais sur E1–E3 ni sur T14.
  - Part réelle : à cause de (b), environ une réponse sur 1/α + 1 est atypique (α/(1 + α) : 1/7, 1/5 ou 1/4 selon le cran), un peu moins avec (c). Le dévoilement dit ce chiffre, jamais α.
  - Forme : le côté opposé à la réponse type, au niveau simple. Si la réponse type est neutre : Favorable si t("cote-ecart|[r|]prénom|texte") < 1/2, sinon Défavorable.
  - **H86** : les deux premiers personnages présents, dans l'ordre de t("ecart-hstar|r|prénom"), sont atypiques, sans tenir compte de α ni de (b). Les autres ne le sont pas.
- **2.4 Absences.** Textes dans l'ordre ; pour chacun, personnages dans le même ordre. Un personnage est absent si :
  - aucun autre n'est déjà absent sur ce texte ;
  - il n'a été absent à aucun de ses six textes précédents de la même période ;
  - et t("absence|[r|]prénom|texte") < 1/14.
  
  Jamais sur E1–E3 ni sur T14. Une absence le jour j : pas de réponse au texte du jour j, ni de manche ce jour-là. Elles sont tirées avant les réponses atypiques.
- **2.5 Entrée** : les quatre personnages répondent à E1–E3 avant le jour −90, par 2.1 et 2.2 bis, sans écart. Ces réponses comptent dans leur portrait. Les cartes d'entrée du porteur sont celles de Valentin.

**4. Comment un personnage devine** : règle 3 du premier essai, avec trois changements.
- Chaque personnage présent joue, chaque jour j de −89 à 14, une manche sur le texte répondu la veille. Candidats : les autres membres qui l'étaient le jour j − 1. Le porteur l'est donc à partir des manches du jour 2.
- 3.2 : le côté attendu du porteur se calcule sur les cartes vues, **avec ses poids normaux**. C'est la connaissance mécanique des personnages, pas son portrait affiché.
- Clés t("devine|g|j|candidat"). Les justesses citées au premier essai (point 6) sont à remesurer.

**5. Choix des cartes** (4.1 à 4.4)
- **4.2 (R3).** Le curseur de l'auteur, vu par le devineur au jour j, compte son entrée et ses textes répondus jusqu'au jour j − 2, avec ses propres poids (triples pour le porteur).
  - S'il est net : surprise = |x − c|.
  - Sinon : surprise = rareté (définition du premier essai : médiane des réponses possibles, devineur exclu).
  - q est retiré.
- **4.3** : inchangé ; la justesse suit D-024 ; la redistribution est celle du premier essai.
- **4.4** : inchangé.
- **À quatre membres** (histoire, et manches des personnages au jour 1) : il y a au plus trois réponses possibles ; les étapes 2 et 3 de 4.3 les servent toutes, dans l'ordre de l'étape 1, sans remplacement. Ce n'est pas une règle de plus : la règle générale donne ce résultat.
- **Constat** : dans l'ordre retenu, le curseur du porteur ne peut être net dans une manche de personnage que pour sa carte de T12 (S), devinée le jour 13, après E1, T3, T6 et T9 ; dans l'ordre R2, seulement pour sa carte de T11 (L). Ailleurs, ses cartes se servent à la rareté.

**6. Portrait du porteur** : W = 3w partout où son portrait est calculé (Moi, Le Cercle, écran d'un proche, phrase nette, Pas de Côté, R3 sur ses cartes), jamais en 3.2. Facteur lu dans le fichier scellé, valeurs permises 2, 3 ou 4.

**7. Tempéraments.** Les définitions publiques (§6), plus deux précisions :
- « Seul de son côté » et « seul au milieu » se jugent sur toutes les réponses des autres membres au texte, porteur compris dès qu'il est membre.
- Le résultat est calculé aux jours 0, 7 et 14.

Attendu à l'arrivée (critère c2) :

| Personnage | Tempéraments attendus | Estimation |
|---|---|---|
| Odile | L'Original, Le Tranché | environ 0,37 de réponses seule de son côté ; environ 0,8 de « Très » |
| Valentin | Le Pont | environ 0,25 des textes partagés |
| Agathe, Nassim | aucun | environ 0,05 |
| Personne | Le Mesuré | environ 0,2 de « Neutre » au plus, pour 1/3 exigé |

**8. Pas de Côté** : la définition publique. Le curseur « juste avant » compte toutes les réponses antérieures dans l'ordre du calendrier, révélées ou non. À la révélation, elles le sont toutes.

**9. Titres** : comme au §6 du premier essai, pour chaque semaine de 1 à 15.
- Clés t("devin|w|prénom"), t("mystere|w|prénom"), t("surprise-semaine|w|n").
- La semaine 1 compte six textes répondus.
- Surprise : seuls les textes qui ont un titre peuvent l'être. En semaines 1 à 12, il n'y en a donc pas ; elle n'est montrée nulle part.

**10. Calibrage de l'histoire.** Pour r = 1, 2, … jusqu'à 200, on calcule l'histoire, puis l'état au jour 1 (curseurs vus : entrée et H1 à H90). On retient le premier r qui remplit tous les critères :
- (c1) curseurs nets exactement : Agathe S, P, L ; Nassim S, P, L ; Odile S, P, T, L ; Valentin P, T, L ;
- (c2) tempéraments au jour 0 : exactement ceux du tableau du point 7 ;
- (c3) H86 est la surprise de la semaine 13 par le calcul ordinaire, tous les textes révélés cette semaine-là étant candidats, départages compris ;
- (c4) Le Devin a au moins trois titulaires différents sur les semaines 1 à 13, Le Mystère aussi ; au moins six de ces semaines ont trois Fidèles ou moins ;
- (c5) chaque curseur net à l'arrivée est du côté de son profil et penche clairement (|c − 1/2| ≥ 1/5).

Au-delà de r = 200 : défaut, renvoyé à GD. Les raisons de l'échec de chaque r précédent vont au rapport. Le calibrage est refait au candidat final (vrais E1 à E3).

**11. Réglage (§9 bis)** : 200 parties, graine de réglage = 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai-2|reglage|" + graine).
- **Le joueur simulé.**
  - Profil tiré comme au premier essai.
  - Il répond à E1–E3 et à T1–T14, sans abandonner. Ses réponses atypiques suivent α, avec (b) seulement.
  - À l'entrée, il parie le côté de sa propre réponse.
  - Il devine aux manches T0, T1, T2, T6 et T13.
  - Le côté attendu d'un personnage vient du centre de son curseur vu (≥ 3/5, ≤ 2/5, entre les deux) ; il tente toujours la raison cachée (règle 3.5) ; jumeaux comptés.
- **Réglage de α**, une fois : justesse du joueur simulé sur ses quinze cartes, cumulée sur les 200 parties. Strictement au-dessus de 7/10 : α monte d'un cran. Strictement sous 7/20 : α baisse d'un cran. Ce sont les seuils du premier essai ; ma v2 écrivait 2/5.
- **Seuils stricts** : comme au premier essai, sur les cartes du joueur simulé en semaine 15.
- **Facteur** : moyenne des curseurs nets au jour 14, chez les joueurs simulés dont la réponse type n'est neutre sur aucune tension.
  - De 1 à 3 inclus : facteur 3.
  - Moins de 1 : facteur 4.
  - Plus de 3 : facteur 2.
  - Estimation : environ 1,8.
- **Ordre des opérations** : candidat (α = 1/4, facteur 3, calibrage), puis réglage. Si un paramètre change, le candidat est refait et recalibré, sans rejouer le réglage.

**12. Parties témoins.** On ajoute à la liste du premier essai les parties de `spec2-game-design-v2.md` D, plus les cas suivants :
- **tranché** : il prend toujours l'attendue ; phrase nette au jour 14 ;
- **nuancé** : il prend l'inattendu une fois par tension ; aucun curseur net, barre pleine à 16 sans curseur net ;
- **au centre** : il répond toujours Neutre ;
- un abandon au jour 7 avant les titres ;
- « Annuler » au saut ;
- un arrêt pendant un saut ;
- un tempérament qui change au jour 7 ou 14, si c'est possible ;
- Le Fidèle du porteur en semaine 14, sur six textes ;
- un Pas de Côté d'un personnage sur une révélation lue, s'il existe dans le lot ;
- la barre pleine par le premier curseur net.

Partie témoin ajoutée : un Pas de Côté du porteur sur T12 (S), révélé au vote le jour 14. Dans l'ordre R2, il est listé comme impossible.

**13. Chiffres constants** : ceux du §9 public, plus la part de réponses atypiques parmi ses cartes, les remplacements et cartes identiques, les départages, et les impossibilités.

**14. Annexe A cachée (ordre, sens, lot)** *(mise à jour du 9 octobre 2026, composition du lot)*
- **Ordre retenu.** Le stock, 16e législature comprise, ne donne que trois textes T : le repli à trois textes T devient l'ordre retenu. L'ordre à quatre textes T et l'ancien repli (cinquième réponse sur L) sont abandonnés : L n'a pas six textes qui passent les conventions.
  - Entrée : E1 S, E2 P, E3 T, dans cet ordre.
  - T0 à T14 : S L P S L T S | P L S P L S T | P.
  - Réponses du porteur avant le second dimanche : S 5 (E1, T3, T6, T9, T12), P 4 (E2, T2, T7, T10), T 3 (E3, T5, T13), L 4 (T1, T4, T8, T11). Au jour 7, au plus trois par tension.
  - Manches du porteur : S (T0), L (T1), P (T2), S (T6), T (T13).
  - Lot : S 6 (T0 compris), P 5 (T14 compris), T 3, L 4. Jamais deux jours de suite sur la même tension ; T0 n'a pas la tension de H90.
  - Au jour 14, T ne peut pas être net ; S, à cinq réponses, le devient plus facilement que P et L (à dire au dévoilement).
  - Pas de Côté du porteur : possible sur S seulement, à la révélation de T12 (jour 14, au vote, lue), si son curseur S est net après T9 et que sa réponse à T12 va nettement contre lui.
  - À dire au porteur à la livraison : « quatre ou cinq réponses par tension » ne vaut pas pour Tradition/Changement (trois).
- **Ordre R2** (un texte S tombe sans remplaçant dans S) : S L P S L T S | L P L S L P T | P. Porteur : S 4 (E1, T3, T6, T10), P 4 (E2, T2, T8, T12), T 3, L 5 (T1, T4, T7, T9, T11). Lot : S 5, P 5, T 3, L 5. Manches inchangées. Pas de Côté du porteur impossible.
- **Ordre R3** (aucun tirage de calibrage ne passe avec cette entrée) : entrée S, P, L (E3 = 3370) ; T0 à T14 : S T P S L T S | P L S P L S T | P.
- **Sens (E9).** Dans chaque tension, les réponses du porteur avant le second dimanche couvrent les deux sens, à un texte près. T0 reçoit un texte S du sens majoritaire de S ; T14 un texte P, choisi (P est à égalité). C'est une cible : si le stock ne la permet pas, on la relâche avant les règles de D-028. Elle limite le biais d'approbation noté au premier essai.
- **Rôles choisis, cases tirées.** E1 = 1161, E2 = 7386, E3 = 3708, T0 = 1262, T14 = 5359. Cases S : 795, 7922, 2190, 8167. Cases P : 840, 2139, 6770. Cases T : 2758, 3449. Cases L : 3370, 707, 2484, 989. Réserve : 5242 (T, rejetée), la seule.
  - *Mise à jour du 10 octobre 2026.* 8279 est écarté par la règle A.5 : l'ensemble du projet de loi reprend une mesure jouée au premier essai (le délit d'organisation de rave-party et la pénalisation de la participation, texte E1, scrutin 6124). La réserve 8167 (S) entre dans sa case. Il ne reste qu'une réserve, 5242, à la fois T et rejetée.
- **Mélange.** 10 rejetés sur 18 (S 3, P 3, T 2, L 2), dont 2 à l'entrée, dans les bornes de D-028 (8167, rejeté, remplace 8279, adopté : VTANR5L17V8279.json, sort « adopté », 15 juillet 2026, relevé par l'orchestrateur). La cible 7 n'est pas atteignable (le stock manque d'adoptés) ; aucune relâche de A.3.
- **Amendements de suppression.** On sert le scrutin de l'amendement, jamais un autre. Suppression adoptée : l'article visé est servi, rejeté (présentation A). Suppression rejetée : l'amendement est servi, rejeté (présentation B), avec un titre sans seconde négation. Ici : 2758 en A ; 7922, 8167, 6770 et 5359 en B.
  - *Mise à jour du 10 octobre 2026 (conventions d'essai, `simulation-2.md`, A.7, points 13 et 14).* En présentation B, les lignes 1 et 2 disent ce que ferait l'article, au conditionnel ; la ligne 3 est la phrase fixe, identique pour tout le lot : « Cet amendement supprimerait tout l'article qui prévoit ces mesures. » Le contrôle 1 vérifie l'égalité exacte sur la liste des textes B, passée en paramètre (schéma, partie 5.1, étape 8). La règle 1.1 du lot de Game design (ligne 2 = le retrait) est retirée.
  - Tout titre qui retire quelque chose commence par « Supprimer », présentation B comprise et 2190 compris (« Supprimer les zones à faibles émissions ») ; les titres B gardent 60 caractères au plus et une seule négation. Raison : les titres en « Retirer… » étaient tous rejetés (0 adopté sur 4) ; avec un seul verbe, 1 adopté sur 5, le verbe ne prédit plus le résultat.
- **Tirage** des cases restantes dans chaque tension : t("ordre-texte|tension|i").

**15. Limites propres.**
- Les atypiques « de même valeur » rendent les cartes d'écart plus lisibles par leur raison. La justesse montera sur ces cartes ; c'est voulu, et à lire comme tel.
- Le porteur a lu, peut-être, les règles du premier essai ; la règle 2.2 bis est nouvelle.
- Les profils sont connus depuis le premier dévoilement : sa justesse est une borne haute.
- Quinze cartes : tout chiffre de justesse est fragile.
- Quatre textes sont servis en présentation B (7922, 8167, 6770, 5359), dont trois répondus avant le second dimanche (double négation possible, limitée par la phrase fixe de la ligne 3) ; la lecture du carnet le dira. *(Mise à jour du 10 octobre 2026 : « trois » avant l'entrée de 8167.)*

## 16. Passages déplacés de `simulation-2.md` (arbitrage de l'orchestrateur, 9 octobre 2026)

*Recopiés mot pour mot. À leur place, `simulation-2.md` garde une ligne de renvoi neutre.*

**« Limites et doutes », Game design, premier point**

- **Une hiérarchie très sévère.** Avec le facteur 3, une seule réponse neutre ou tiraillée sur une tension à quatre réponses (P, L) l'empêche d'être nette au second dimanche (sur S, qui en a cinq, il en faut deux ; T, à trois, ne peut pas l'être) (une réponse « aucune » ou hors tension, un penchant, le permet encore : trois arbitrages nets et un penchant font Σ = 10,5). C'est fidèle au jeu (environ 0,41 contre 0,32 de chance par tension), mais le porteur, qui a demandé de la nuance (D-034), peut n'avoir aucun curseur net. Ce serait l'objection de D-026 vécue, et un vrai renseignement pour recaler le seuil à l'étape 6. À ne pas lui dire avant de jouer, pour ne pas orienter ses choix de raisons. À dire au dévoilement.

**« Limites et doutes », Game design, point « Les seuils des tempéraments », après la première phrase**

Une marge étroite pour L'Original d'Odile (environ 0,37 contre 0,3) explique qu'il soit dans le calibrage. Ses changements aux jours 7 et 14 dépendent en partie des réponses du porteur, ce qui reste dans le jeu.

**§6, point 7 (Le Pas de Côté), fin du dernier sous-point**

Dans l'ordre retenu, il est possible sur S seulement : sa cinquième réponse S (T12) est révélée au vote le jour 14, et lue. Dans l'ordre R2, il est impossible.

**Annexe A, A.6 (Contenu), sous « Le reste de la fiche va dans `a-ne-pas-ouvrir-2/textes/` : »**

  - tension P, sens 0 (être favorable sert la précaution) ;
  - vote : texte entier adopté le 4 juin 2026, le Sénat devait encore voter (`navette`) ;
  - scrutin 7313, dossier DLR5L17N51775.

### Ajouts après la relecture de Cohérence (passages déplacés)

- Un cercle unanimement neutre est impossible : aucune tension n'a trois profils neutres, Odile n'est jamais neutre, et une réponse atypique n'est jamais neutre (2.3).
- Rejetés du lot retenu : S 3, P 3, T 2, L 2 (10 sur 18). *(Mise à jour du 10 octobre 2026 : S 2 et 9 sur 18 avant que 8167, rejeté, remplace 8279, adopté ; point 14.)*

**§8.6, point 2, deuxième puce** (texte d'origine) :

   - « Environ une réponse sur {cinq} était donnée exprès contre le profil. Dans ces réponses, chacun gardait sa valeur quand une raison le permettait : il changeait de position, pas de valeur. » (règle cachée de D-034). [Game design, 10 octobre 2026 : « {quatre} » corrigé en « {cinq} », le mot de 1/α + 1 (point 3, 2.3).]

**« Limites et doutes », Game design, point « La règle « même valeur » »** (texte d'origine) :

- **La règle « même valeur »** des atypiques est un pari de design. Elle rend la raison utile pour deviner, mais seuls de vrais proches diront si les gens font cela.

**§1, Valentin** (texte d'origine) :

- **Valentin invite le porteur** (D-033). C'est le moins deviné du premier essai (0 sur 10, bilan). Ses réponses aux trois textes d'entrée suivent son profil, sans écart.

**« Curseurs nets »** (texte d'origine) :

- **Curseurs nets.** Ils existent maintenant pour les personnages dès l'arrivée, et pour le porteur au plus tôt le jour 10.

**Annexe A, A.3, répartition des rejetés** (texte d'origine) :

- Entre 6 et 12 rejetés sur les 18, cible 7 : environ 2 S, 2 P, 2 L et 1 T, selon le stock. Au moins un rejeté parmi E1 à E3.
- Entrée : E1, E2, E3 sur S, P et T, dans cet ordre (mise à jour du 9 octobre 2026 ; d'abord S, P et L).
