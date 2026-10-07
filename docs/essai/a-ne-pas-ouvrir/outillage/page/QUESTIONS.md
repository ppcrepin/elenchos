# Questions de Front-end sur la spécification (page de l'essai)

Écrites le 6 octobre 2026. Pour chaque point : section, citation, ma lecture, ce que j'ai fait en attendant. Rien n'est tranché en silence : chaque point repasse par le circuit.

## État des réponses

| Question | Réponse (spécification) | Dans la page |
|---|---|---|
| Q-F1 espace fine insécable | §8.8 (commit `2c66a93`) : choix confirmé par la Direction artistique, chasses face par face, vérification, ligne de licence | `reduire.py` vérifie U+202F (présence, sans contour, chasse attendue) et s'arrête sinon ; ligne de licence à poser au lot 7 |
| Q-F2 règles 4 et 5 du §7.8 | §7.8 (`2c66a93`) : par la forme ; suites qui se chevauchent jugées sur la chaîne de départ | `noyau.typographier` réécrit position par position ; tests ajoutés |
| Q-F3 Mystère et surprise sans erreur | §6, points 3, 5 et 9 (`1df9aa5`) : au moins 1 erreur | appliqué au moteur |
| Q-F4 curseur net | §5.4, §5.7, §6 point 7 (`1df9aa5`) : impossible ; un programme qui en voit un s'arrête | le moteur s'arrête aussi pour la phrase « nette » (lecture « portrait d'avant » retirée) |
| Q-F5 verdicts du carnet | §8.12 (`2c66a93`) : un verdict par carte | déjà ainsi |
| Q-F6 « 1 juste » | §8.12 : retirée | rien à faire |
| Q-F7 pseudo | réponse de Front-end ci-dessous, transmise | appliquée dans la page (lot 4) |
| Q-F8 pseudo, questions d'UX | réponse de Front-end ci-dessous (§7.2, commit `841b8bc`) | vérifié dans Chromium |
| Q-F9 titre de l'export | §8.7 (`b04eb73`) : « Votre carnet à copier », titre non copié | appliqué |
| Q-F10 état illisible | §8.11 (`b04eb73`) : arrêt 1, repère M1, sans « Rien n'est effacé », rien réécrit, pas d'entrée | appliqué (forme de l'état vérifiée au chargement) |
| Q-F11 retour de la copie | §8.9 (`b04eb73`) : « Fermer » rend la confirmation ; relance : l'écran d'où elle a été ouverte | déjà ainsi |
| Q-F12 après « Tout effacer » | §8.9 (`b04eb73`) : vue seule, le titre seul, aucun bouton ni pied, lecteur d'écran sur le titre | appliqué (titre focalisé) |
| Q-F13 « Pour le contrôle » | §8.6 (`b04eb73`) : l'empreinte d'abord, « Empreinte du fichier scellé : », puis « Graine : », « Fichier scellé : » | appliqué |
| Q-F14 bouton de 1.6 au texte 3 | §7.1 (`b04eb73`) : « Suivant » | déjà ainsi |
| Dévoilement, titre de la page | `devoilement.md` (`b04eb73`) : « Le dévoilement » | déjà ainsi |
| Q-F15 croix en planche | §8.1 « Planche » (`0843fc7`) : 18 px sous le contour, 16 px de son bord droit, comme la croix des maquettes | appliqué |
| Q-F16 boutons empilés | §8.1 « Bande » (`0843fc7`) : côte à côte à la largeur du libellé, à droite ; sinon tous empilés, toute la largeur, libellé centré | appliqué |

Ajouts appliqués en même temps : une copie en cours d'essai n'a lieu que de l'entrée au jour 14 (règle 14 de la partie 3.12) ; « Sur tout l'essai » d'une copie est calculé comme un arrêt à sa séance (déjà ainsi) ; à la séance 0, questions 2 et 3 toujours proposées (déjà ainsi).

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

## Q-F7 — Ce que la page garde du pseudo (schema.md, partie 3.12, règle 6 ; §7.2)

Demande de l'orchestrateur (6 octobre 2026) : confirmer la lecture du programme de contrôle, qui refuse un pseudo (1) pas en NFC, ou avec un caractère Cc ou Cf ; (2) avec un blanc autre que U+0020, une espace double ou une espace au bord ; (3) égal à un prénom de personnage, capitales non comptées.

**Réponse : confirmée, avec quatre précisions, dont une correction de l'ordre du §7.2 (à faire passer par UX).**

1. **NFC, en dernier aussi (correction).** Le §7.2 met la forme NFC en premier, puis retire Cc et Cf. Or retirer un Cf peut rapprocher une lettre et un accent combinant : « e », U+200B, U+0301 est en NFC ; sans U+200B, « e » + U+0301 ne l'est plus (vérifié dans Node). La page applique donc NFC au début **et à la fin** de la mise en forme ; ce qu'elle garde est toujours en NFC. La lecture (1) du programme de contrôle est juste pour ce que la page garde. Proposition pour UX : écrire « forme NFC, en dernier » au §7.2.
2. **« Blanc » = propriété Unicode White_Space.** Après le retrait de Cc et Cf, l'ensemble est le même en JavaScript (`\s`) et en Python (`str.isspace()`) : U+0020, U+00A0, U+1680, U+2000 à U+200A, U+2028, U+2029, U+202F, U+205F, U+3000 (19 points de code, vérifié des deux côtés). Ce que la page garde ne contient aucun d'eux sauf U+0020, ni espace double, ni espace au bord. Lecture (2) confirmée : en Python, aucun `c` avec `c.isspace() and c != " "`.
3. **« Capitales non comptées » = minuscules par la correspondance Unicode par défaut.** La page compare `pseudo.toLowerCase()` à « agathe », « nassim », « odile », « valentin ». Le programme de contrôle doit employer `str.lower()`, **pas `str.casefold()`** : « Naſſim » (s long) reste « naſſim » avec les deux premiers et devient « nassim » avec `casefold`, que la page accepterait et que le contrôle refuserait. Lecture (3) confirmée avec cette méthode.
4. **Longueur et vide.** La règle 6 dit aussi « non vide » et « sa longueur suit la règle d'UX » : le contrôle refuse un pseudo vide ou de plus de 20 points de code (`len()` en Python compte des points de code). La page compte elle-même les points de code : l'attribut `maxlength` d'un champ compte des unités UTF-16 (un emoji en vaut deux) et n'est pas employé.

En plus, à soumettre à UX : la page retire aussi les **substituts isolés** (catégorie Cs), qu'un collage peut apporter en théorie ; sans cela, l'état ne se coderait pas en UTF-8. Le contrôle peut refuser un Cs.

« Témoin-b-4821-k » passe : NFC, ni Cc ni Cf, aucun blanc, 15 points de code, pas un prénom. Limite connue : la page suit les tables Unicode de Safari (Unicode 15 ou plus), le programme de contrôle celles de Python 3.11 (Unicode 14) ; un caractère classé Cf seulement depuis Unicode 15 serait retiré par la page et inconnu du contrôle, sans écart sur ce que la page garde.

## Q-F8 — Saisie du pseudo : deux questions d'UX (§7.2, commit `841b8bc`)

**1. La page réécrit-elle le champ à chaque frappe ?** Non. Le champ garde exactement ce qui est tapé ; « Jean Paul » se tape normalement. La mise en forme du §7.2 sert à deux moments, sans toucher au champ : à chaque frappe, pour juger si « Recevoir mon code » est actif et quelle note la bande affiche ; au toucher de « Recevoir mon code », pour écrire le pseudo gardé. Vérifié dans Chromium, frappe caractère par caractère : « Jean Paul » → « Jean Paul » ; « ␣␣Jean␣␣␣Paul␣␣ » → « Jean Paul » ; « e », U+200B, U+0301, « té » → « été » (en NFC) ; 26 lettres tapées → les 20 premières.

Seule exception, la limite : une frappe (ou un collage) qui porterait la mise en forme au-delà de 20 points de code est refusée, et le champ revient à sa valeur d'avant ce geste. Un collage trop long est donc refusé en entier, pas tronqué.

**2. Les 20 points de code sont-ils comptés après la forme NFC finale ?** Oui : la page compte les points de code du résultat complet de la mise en forme (retraits, blancs, espaces, puis NFC en dernier), le même texte que celui qu'elle garde. L'attribut `maxlength`, qui compte des unités UTF-16, n'est pas employé.

## Q-F9 — Titre de la page de l'export (§8.7, §8.1 « Page du cadre »)

- **Tranchée par UX (`b04eb73`, §8.7).** Titre « Votre carnet à copier », dans les trois cas ; le titre n'est pas copié. Appliqué.

- **Citation.** §8.1 : « Titre en tête, en 17 px, 600 ; sans titre propre (message de la séance 0, §8.2), la première phrase, en gras, en tient lieu ». §8.7 ne donne pas de titre à la page où s'affiche le carnet à copier.
- **Lecture provisoire.** Pas de titre ajouté : la page commence par le bloc du carnet, dont la première ligne est « Carnet de l’essai Elenchos » ; le lecteur d'écran se place sur ce bloc. À confirmer par UX (ou un titre à écrire).

## Q-F10 — État gardé illisible (§8.8, §8.11)

- **Tranchée par UX (`b04eb73`, §8.11).** Arrêt 1 avec le repère M1, sans « Rien n'est effacé » ; la page ne réécrit ni n'efface la partie et ne commence pas l'entrée. Appliqué ; la page vérifie aussi la forme de l'état (séances numérotées, coups, vue) avant de le prendre.

- **Constat.** Le §8.11 prévoit trois arrêts : vérification ratée (repère V1 à V5), stockage absent, page ouverte deux fois. Rien ne dit quoi montrer si la clé de la partie existe mais ne se lit pas (JSON abîmé, format inconnu).
- **Lecture provisoire.** Arrêt 1 avec le repère « V4 » (lecture des données au chargement), sans rien effacer. À confirmer par UX : un repère propre (par exemple « M1 ») serait plus juste pour l'équipe.

## Q-F11 — Retour depuis l'export ouvert par « Copier mon carnet d'abord » (§8.7, §8.9)

- **Tranchée par UX (`b04eb73`, §8.9).** « Fermer » rend la confirmation intacte ; relancée, la page revient là d'où la confirmation a été ouverte. Déjà ainsi.

- **Citation.** §8.7 : « Dans tous les cas, le texte copié s'affiche en entier avant la copie ». §8.9 : la confirmation de « Tout effacer » propose « Copier mon carnet d'abord » (« le même export »). Le chemin de retour vers la confirmation, une fois le carnet copié, n'est pas écrit.
- **Lecture provisoire.** « Copier mon carnet d'abord » ouvre la page de l'export (carnet affiché, figé à ce toucher, ce qui fait l'instant de la copie au sens de la partie 3.2) ; dans la bande, « Copier mon carnet » puis « Fermer » (libellé déjà validé pour le cadre), qui ramène à la confirmation. À confirmer par UX.

## Q-F12 — Après « Tout effacer » (§8.9)

- **Tranchée par UX (`b04eb73`, §8.9).** Vue seule, titre « La page a tout effacé. », rien d'autre ; lecteur d'écran sur le titre ; à la prochaine ouverture, l'entrée. Appliqué (titre focalisé).

- **Citation.** « Après : « La page a tout effacé. » » et « La page revient à l'entrée, comme à une première visite. »
- **Lecture provisoire.** La page affiche « La page a tout effacé. » seule (sans barre, bande ni bouton) et n'écrit plus rien ; à la prochaine ouverture, elle repart de l'entrée. À confirmer par UX (une action pour recommencer tout de suite n'est pas prévue, et serait contraire à l'esprit du §8.9).

## Q-F13 — Intitulés de la graine et du fichier scellé au dévoilement (§8.6)

- **Tranchée par UX (`b04eb73`, §8.6).** L'empreinte d'abord (« Empreinte du fichier scellé : », puis « Comparez-la… »), ensuite « Graine : » et « Fichier scellé : ». Appliqué.

- **Citation.** « une partie repliée « Pour le contrôle » : graine, fichier scellé, et : « Empreinte de ce fichier : » … »
- **Lecture provisoire.** « Graine : » et « Fichier scellé : », sur le modèle d'« Empreinte de ce fichier : ». À confirmer par UX.

## Q-F14 (ancienne Q-F8) — Bouton de 1.6 après le troisième texte d'entrée (§7.2 ; maquette 1.6)

- **Tranchée par UX (`b04eb73`, §7.1).** « Suivant » après le texte 3. Déjà ainsi.

- **Citation.** Maquette 1.6 (texte 1) : bouton « Texte suivant », vers le texte 2. Note : « Textes 2 et 3 : même chemin … La maquette passe directement au bilan (1.7). » Le bouton de la révélation immédiate du texte 3, qui mène au bilan, n'est dessiné nulle part.
- **Lecture provisoire.** « Texte suivant » aux textes 1 et 2 ; « Suivant » au texte 3 (libellé validé ailleurs, qui ne promet pas un autre texte). À confirmer par UX.

## Q-F15 — Place de la croix des révélations en planche (§8.1, « Planche », commit `67f8ba9`)

- **Tranchée par la Direction artistique (`0843fc7`, §8.1).** Lecture provisoire confirmée. Appliqué.

- **Citation.** « bord intérieur de 10 px en haut et en bas, 8 px sur les côtés […] L'écran commence au bord intérieur. […] La zone de toucher de la croix des révélations se place comme en disposition compacte : 44 × 44 px, coin à 8 px du haut et du bord droit de l'écran. […] centre des points à la même hauteur que le centre de la croix, 30 px sous le haut de l'écran. L'écran commençant au bord intérieur de 10 px, le décalage n'est pas celui de la disposition compacte. »
- **Constat.** Jusqu'ici, en planche, la zone de la croix était à 8 px du contour (en haut et à droite), donc dans le bord intérieur, pas à 8 px de l'écran. Aucune capture de planche n'avait été jugée.
- **Lecture provisoire.** L'écran commence après le bord intérieur ; la zone de la croix est donc à 18 px du contour en haut (10 + 8) et à 16 px à droite (8 + 8), comme le « 16 px » de la croix des maquettes finales ; le centre des points est à 40 px du contour (30 px sous le haut de l'écran). En disposition compacte, rien ne change : zone à 8 px du contour, centre des points à 30 px. Une seule variable par valeur dans la feuille de style (`--croix-haut`, `--croix-droite`) : l'autre lecture (8 px du contour, centre à 30 px) se règle en deux nombres, et la règle des points suit d'elle-même.

## Q-F16 — Boutons de la bande empilés : quelle largeur ? (§8.1, « Rangée d'action »)

- **Tranchée par la Direction artistique (`0843fc7`, §8.1).** Lecture provisoire confirmée. Appliqué.

- **Citation.** « côte à côte si elles tiennent, sinon l'une sous l'autre, 8 px entre elles, dans l'ordre du texte ; la bande grandit d'autant. » La largeur des boutons empilés n'est pas dite ; seul « Jour suivant », seul sur sa rangée, a « la largeur de son libellé », à droite.
- **Lecture provisoire.** Empilés, les boutons prennent toute la largeur de la bande (libellé centré) : à la largeur de leur libellé, alignés à droite, trois boutons de longueurs différentes feraient un bord gauche en escalier. Côte à côte, rien ne change (largeur du libellé, à droite). La règle vaut pour toutes les rangées de plusieurs actions (confirmation de « Jour suivant » comprise).

## Constats des lots 4 à 8 (pas des questions ; à faire passer par le circuit si besoin)

- **C-F1 — Arrêt brutal et écriture sur le disque (§8.8 ; §9, contrôle 14 i).** La page écrit tout son état à chaque coup et à chaque toucher compté, en une seule écriture (jamais à moitié). Mais le navigateur ne met pas chaque écriture sur le disque tout de suite : Chromium les y met par lots, au plus tard environ 5 secondes après (mesuré : une coupure 4 s après une série de coups perd la série ; 11 s après, rien ne manque). Conséquence : après un arrêt brutal, la page reprend à un état gardé complet, mais qui peut dater de quelques secondes, donc d'avant les derniers coups s'ils ont été joués très vite. La phrase du §8.8 « seul manque le temps écoulé depuis la dernière écriture » est juste pour une écriture faite au moins 5 secondes avant la coupure (cas 4 du contrôle 14 i, vérifié) ; le cas 5 (coupure moins d'une seconde après un coup) est vérifié après 11 secondes sans geste : la page reprend à l'étape du coup. Dans WebKit, l'écriture sur le disque se fait aussi en différé (de l'ordre d'une seconde, d'après le code de WebKit, non mesuré ici). Aucun réglage de la page n'y peut rien ; à dire dans la livraison, sans changer la spécification : un coup perdu se rejoue, jamais à moitié.
- **C-F2 — Image de la même adresse (§8.8 ; contrôle 14 f).** Le contrôle 14 f demande qu'une image « hors data: » demandée par l'outil depuis la page soit refusée. La politique du §8.8 autorise `img-src 'self'` (l'image de l'icône) : une image demandée à l'adresse de la page elle-même passe, comme le §8.8 le dit. Le harnais vérifie donc le refus d'une image d'une autre adresse, et note le cas de la même adresse ; que la page n'en crée aucune est vérifié par le contrôle 5. Lecture à confirmer par Cohérence (aucun changement de la page).
- **C-F3 — Rendu des polices dans Chromium sous Linux.** Avec le réglage par défaut, Chromium arrondit les chasses au pixel (hinting) : mots serrés, lettres inégales, coupures de ligne différentes de celles d'iOS. Le harnais lance Chromium sans hinting (`--font-render-hinting=none`), rendu géométrique comme sur l'iPhone ; c'est un réglage du navigateur, rien n'est ajouté à la page. Les polices elles-mêmes ne sont pas en cause (même rendu que les fichiers d'origine).

## Notes de mise en œuvre (pas des questions, pour transparence)

- **Trois exemples de FIPS 180-4 (§0, V1).** FIPS 180-4 ne contient pas d'exemples chiffrés ; les trois exemples classiques de SHA-256 sont ceux de FIPS 180-2, annexe B (« abc », le message de 448 bits, un million de « a »), repris dans les exemples du NIST. Ce sont eux que la page vérifie.
- **Hinting retiré des polices.** La spécification fixe les fonctions OpenType (« par défaut de l'outil plus tnum ») ; elle ne dit rien du hinting, que Safari sur iOS ignore. Je l'ai retiré (pages plus légères). Les faces gardent kern, liga, tnum, frac, locl et les autres fonctions par défaut de fontTools 4.66.1. Chiffres : les chiffres par défaut d'Alegreya sont elzéviriens, comme dans les maquettes (qui n'ajoutent que `tabular-nums`) ; la comparaison à l'œil avec les maquettes se fera au lot 4.
- **Signes absents des polices** : ▾ ● ○ ◎ ✓ (et ⚙) ne sont dans aucune face ; ils viendront des polices du système, comme le prévoit le §8.8. ← est présent.
- **Le moteur accepte `coups.deviner` à `null`** pour la séance en cours : c'est ainsi que la page demande les cartes à servir avant le premier geste. La trace et le journal n'ont jamais cette valeur aux séances 2 à 14 (règle de validité 7).
