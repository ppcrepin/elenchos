# Questions de Front-end sur la spécification (page de l'essai, lots 1 à 3)

Écrites le 6 octobre 2026, sur la spécification au commit `3553b2e`. Pour chaque point : section, citation, ma lecture, ce que j'ai fait en attendant. Rien n'est tranché en silence : chaque point repasse par le circuit. Classés du plus important au moins important.

## Q-F1 — L'espace fine insécable manque dans les polices (§8.8, « Caractères » ; §7.8, règles 2 et 6)

- **Citation.** §8.8 : « Caractères : latin de base, latin-1, latin étendu A, ponctuation française (dont l'espace fine insécable) ». §7.8 place U+202F avant « ? », « ! », « ; », « % » et entre les tranches d'un nombre.
- **Constat.** Aucune des cinq polices sources (`google/fonts`, commit `7085eb8…`) n'a U+202F. Sans rien faire, chaque U+202F de la page viendrait d'une police du système, choisie par Safari : chasse imprévisible, et, sur certaines lignes, un interligne qui peut changer (la police de secours entre dans la hauteur de ligne).
- **Second constat.** Dans Alegreya Sans gras (et seulement elle), les espaces typographiques U+2007 à U+200A sont anormalement larges : l'espace fine U+2009 fait 317 unités, plus que l'espace ordinaire (151). Dans les cinq autres faces, l'espace fine fait 0,62 à 0,77 de l'espace ordinaire.
- **Ce que j'ai fait.** `polices/reduire.py` ajoute à chaque face un glyphe vide « uni202F » relié à U+202F (modification permise par l'OFL ; aucun nom réservé), de la chasse de l'espace fine de la face, sauf si elle n'est pas plus étroite que l'espace ordinaire ; alors, deux tiers de l'espace ordinaire. Chasses obtenues, en millièmes de cadratin : Alegreya gras 116 ; Alegreya italique 500, 124 ; Alegreya italique gras 116 ; Alegreya Sans 103 ; **Alegreya Sans gras 101** (règle des deux tiers) ; Alegreya Sans italique 105. Vérifié dans Chromium (mesure de la chasse).
- **À confirmer par la Direction artistique** : la chasse (en particulier la règle des deux tiers pour Alegreya Sans gras), ou une autre valeur.

## Q-F2 — Règles 4 et 5 du §7.8 : partout, ou seulement au compte à rebours et à la date du vote ?

- **Citation.** §7.8 : « 4. dans un compte à rebours « {h} h {mm} », les deux espaces deviennent U+00A0 ; 5. dans une date « {j} {mois} {aaaa} » (§7.9), les deux espaces deviennent U+00A0 ». Et : « la page et le programme de contrôle appliquent à chaque chaîne, avant d'y insérer le pseudo, ces règles dans cet ordre ».
- **Ambiguïté.** Appliquées « à chaque chaîne », ces deux règles se reconnaissent à leur forme ; mais leur texte vise un compte à rebours et la date du vote. Une ligne de texte scellée qui contiendrait « le 1er janvier 2027 » ou « ouvert 24 h 24 » serait traitée différemment selon la lecture (seule la seconde espace de la date dépend de la règle 5 : la première relève déjà de la règle 6 après un chiffre, mais pas après « 1er »).
- **Ma lecture, appliquée** : par la forme, dans toute chaîne (`typographier`, noyau) : un nombre, « h », deux chiffres ; « 1er » ou un jour de 1 à 31, un mois de la table, quatre chiffres. C'est la lecture typographiquement juste, et elle ne demande à la page aucune connaissance du contexte.
- **Effet aujourd'hui** : nul. Aucune chaîne du fichier candidat (`59db7484…`) ne contient l'une de ces formes (vérifié). Mais le programme de contrôle doit faire la même lecture, sinon un texte futur différerait au contrôle 11.

## Q-F3 — Le Mystère et la surprise de la semaine sans aucune erreur (§6, points 3, 5 et 9)

- **Citation.** Point 3 : « au moins 6 tentatives ; plus forte proportion d'erreurs ». Point 9 : titre sans titulaire quand « personne n'a 6 tentatives » (Mystère) ou « aucun texte n'a 4 attributions » (surprise).
- **Lecture littérale, appliquée** : un membre avec 0 erreur sur 6 tentatives peut recevoir Le Mystère si personne ne fait plus ; un texte sans aucune erreur peut être « le texte qui a le plus trompé le cercle ». Le point 9 n'en fait pas un cas sans titulaire.
- **À confirmer par Game design** (cas improbable dans l'essai, mais un titre « Le Mystère » donné à quelqu'un que tout le monde a trouvé se lirait mal).

## Q-F4 — Le Pas de Côté et la phrase « nette » de la semaine : règles incomplètes, mais impossibles dans l'essai (§6, point 7 ; §5.7)

- **Citation.** §6, point 7 : « curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ». §5.7 : « Une tension nette (la plus éloignée de 0,5) ».
- **Manque.** Ni quel curseur (avant ou après la réponse), ni quelles réponses (celles de la semaine ?), ni quels membres ; pour la phrase, ni à quel moment on lit le portrait.
- **Ce que j'ai fait.** Aucun curseur ne peut devenir net dans l'essai (au plus 6 réponses par tension, Σ w ≤ 6 ; règles §4.2). Le moteur rend `pas_de_cote` vide et vérifie qu'aucun curseur n'est net ; s'il l'était, il s'arrêterait au lieu de deviner une règle. Pour la phrase « nette », il lit le portrait d'avant la réponse du jour (textes jusqu'à k − 1). Aucune décision n'est nécessaire pour l'essai ; pour le produit, la règle reste à écrire.

## Q-F5 — Gabarit du carnet : trois verdicts dessinés, une à trois cartes possibles (§8.12)

- **Citation.** Gabarit : « [Révélation : {verdict}, {verdict}, {verdict}.[ Raison cachée : …]] » ; texte : « {verdict} : … dans l'ordre d'affichage des cartes de la manche révélée ce jour-là ».
- **Lecture, appliquée** : un verdict par carte, donc un ou deux verdicts pour les manches d'une ou deux cartes (elles existent : 72 et 768 manches dans mes 200 parties au hasard). À vérifier que le programme de contrôle lit de même ; aucune décision attendue.

## Q-F6 — « 1 juste », « 2 justes » (§8.12, « Règles »)

- **Citation.** « Accords : « 1 juste », « 2 justes » ; « fois » invariable. »
- **Constat.** Aucune ligne du gabarit n'écrit un nombre suivi de « juste » : les comptes s'écrivent « x fois sur y ». La règle semble rester d'une version antérieure. Rien à faire pour la page ; à retirer ou à expliquer par UX à la prochaine passe.

## Notes de mise en œuvre (pas des questions, pour transparence)

- **Trois exemples de FIPS 180-4 (§0, V1).** FIPS 180-4 ne contient pas d'exemples chiffrés ; les trois exemples classiques de SHA-256 sont ceux de FIPS 180-2, annexe B (« abc », le message de 448 bits, un million de « a »), repris dans les exemples du NIST. Ce sont eux que la page vérifie.
- **Hinting retiré des polices.** La spécification fixe les fonctions OpenType (« par défaut de l'outil plus tnum ») ; elle ne dit rien du hinting, que Safari sur iOS ignore. Je l'ai retiré (pages plus légères). Les faces gardent kern, liga, tnum, frac, locl et les autres fonctions par défaut de fontTools 4.66.1. Chiffres : les chiffres par défaut d'Alegreya sont elzéviriens, comme dans les maquettes (qui n'ajoutent que `tabular-nums`) ; la comparaison à l'œil avec les maquettes se fera au lot 4.
- **Signes absents des polices** : ▾ ● ○ ◎ ✓ (et ⚙) ne sont dans aucune face ; ils viendront des polices du système, comme le prévoit le §8.8. ← est présent.
- **Le moteur accepte `coups.deviner` à `null`** pour la séance en cours : c'est ainsi que la page demande les cartes à servir avant le premier geste. La trace et le journal n'ont jamais cette valeur aux séances 2 à 14 (règle de validité 7).
