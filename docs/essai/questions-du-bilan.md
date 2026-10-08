# Questions du bilan

*Étape 4, après le bilan de l'essai (`docs/essai/bilan.md`). Ce dossier rassemble ce qui reste à trancher pour corriger le produit : les constats C-007 à C-027 (`docs/decisions.md`), les conventions et « interprétations à confirmer » de l'essai (`docs/essai/simulation.md`), vos trois pistes, et vos deux messages après la remise du bilan. Fiches écrites par Game design (règles du jeu), UX (écrans et parcours), Contenu (textes et vote), Juridique (données) et Back-end (faisabilité) ; assemblage et arbitrage des détails par l'orchestrateur ; relu par Cohérence (compatible avec réserves, levées) et par le Vérificateur (OK avec corrections, appliquées). Rien n'est décidé tant que vous n'avez pas répondu ; chaque réponse sera inscrite au journal des décisions. La décision de continuer, d'ajuster ou d'arrêter (D-008) vient après, à part. Prénoms et exemples fictifs.*

## Comment ça se passe

- **Huit questions de fond**, en deux envois de quatre, les plus importantes d'abord. Chacune dit d'où elle vient, ce qu'elle change et ce qu'elle touche de ce que vous avez déjà validé. L'option recommandée est en premier ; quand les spécialistes ne sont pas d'accord, chaque position est nommée.
- **Puis une seule question pour les règles de détail** (troisième envoi) : vingt-trois règles qui complètent le produit sans changer le jeu. L'équipe les a tranchées ; vous les validez d'un geste, ou vous en écartez certaines. Elles sont listées plus bas ; elles s'ajusteront à vos réponses de fond.
- Si vous choisissez de redessiner la journée (question 1), les règles d'écran se dessineront dans la même passe, et vous validerez les maquettes comme en D-014.

## Premier envoi : le cœur du jeu

### Question 1 · La journée, de Deviner à Répondre (point 24)

**D'où ça vient.** Après le bilan, vous avez écrit que l'écran Deviner n'est « pas forcément très clair », que votre avis (Répondre) se sépare mal de ce que vous devinez des autres (Deviner), et qu'il manque de la « fluidité ». La feuille de route prévoit des corrections à l'étape 4 : faut-il reprendre maintenant le parcours d'une journée, et jusqu'où ?

**Ce qui, dans les écrans validés, peut produire cette confusion** (lecture d'UX) :
- trois textes en une séance : la révélation porte sur l'un, la devinette sur un deuxième, la réponse sur un troisième ;
- les mots annoncent un autre écran que celui qui suit : « Et maintenant, la question d'aujourd'hui. » mène à Deviner, qui porte sur le texte d'hier ;
- Deviner ne montre du texte que son titre, en petit, et la règle « une réponse par proche » n'est jamais dite ;
- Répondre et Deviner se ressemblent : mêmes cartes, mêmes quatre raisons, rien ne marque « ici, c'est toi » ou « ici, ce sont eux » ;
- l'entrée apprend l'ordre inverse (répondre, puis deviner sur le même texte).

**Options.**
1. **Redessiner la journée, sans changer l'ordre (Recommandé)** : l'équipe redessine la journée et l'entrée sans toucher aux règles ; chaque écran dit de qui et de quel texte il parle ; vous validez les maquettes. *Game design ajoute deux règles d'écran pour cette passe :* deviner d'abord qui, puis pourquoi (la raison cachée n'apparaît qu'une fois le visage posé) ; écrire les cartes à la troisième personne. *Pourquoi (UX) :* votre retour vise le cœur du jeu et vient du lecteur le plus indulgent, l'auteur ; les causes repérées tiennent d'abord aux mots et à la mise en page ; redessiner coûte peu sur papier, beaucoup une fois construit.
2. **Redessiner, et répondre d'abord** : même travail, mais la journée commence par Répondre (ton avis), puis Deviner. *Game design le juge défendable :* ta réponse fait le jeu de tes proches demain, et « Donner mon avis » a été votre moment préféré 9 fois sur 15 ; *contre :* l'ordre actuel garde « les autres » d'un bloc (révélation, puis Deviner) avant « toi ».
3. **Corriger quelques phrases** : la règle de Deviner est dite, « Jouer » et le titre du texte d'hier sont corrigés ; le reste ne bouge pas.
4. **Attendre la bêta** : rien ne change avant que de vrais joueurs aient joué.

*Écarté par l'orchestrateur :* l'option d'UX « Revoir aussi les règles », qui rouvrait aussi le nombre de textes vus par séance (trois). Ce nombre découle de la lecture A (D-010, C-006), tranchée ; UX y voyait pourtant une cause de fond que les écrans atténuent sans la supprimer.

**Ce que ça touche.** Options 1 et 2 : les maquettes de la journée et de l'entrée (D-011, D-014), dont deux phrases validées (« À qui sont ces réponses ? », « Et maintenant, la question d'aujourd'hui. ») ; l'option 2 change aussi `projet.md` §2 (« deux écrans successifs », Deviner puis Répondre). Option 3 : quelques phrases de D-014. Option 4 : rien.


### Question 2 · Le nouveau venu (point 4, avec C-009)

**D'où ça vient.** C'est la question principale du bilan (8.1 a) : sans image préalable des personnes, vous avez deviné au niveau du hasard. Vous pensez qu'avec de vrais proches, cette image existe ; mais elle manque à qui arrive dans un cercle (exemple fictif : Marie rejoint la famille de son compagnon et ne sait rien des avis de sa belle-sœur Inès).

**Options.**
1. **Faire connaissance à l'entrée (Recommandé)** : quand Marie rejoint un cercle déjà lancé, elle devine aussi, après son compte, ses nouveaux proches (trois au plus), chacun sur l'un des textes d'entrée que tous ont joués, avec la révélation immédiate habituelle. Environ 15 secondes par personne, une seule fois, sans jamais bloquer. *Pourquoi (Game design) :* c'est le seul départ à froid certain du produit, et c'est le geste qui a donné, dans l'essai, la seule image utile (Agathe, devinée à l'entrée : 4 cartes justes sur 9, contre 2 sur 29 pour les trois autres ; un indice, pas une preuve). Rien ne s'ajoute à l'écran Deviner.
2. **Faire connaissance, dans les deux sens** : en plus, chaque membre peut deviner les réponses d'entrée de la nouvelle venue (proposé dans Aujourd'hui, sans message). *UX préfère ce sens-là :* l'écran existe déjà (1.11, D-006), et Deviner reste une devinette, pas une lecture de fiche. Il demande un geste de plus à tout le cercle.
3. **Un rappel dans Deviner** : en touchant un visage, ce que ses révélations passées t'ont appris de ce proche, sans chiffre et rien du texte en cours. *Risque (Game design) :* la devinette devient une lecture de fiche, et l'écran s'alourdit.
4. **Rien de plus** : on compte sur ce que les proches savent les uns des autres ; si la bêta montre que les nouveaux venus devinent au hasard pendant des semaines, la question revient.

**Ce que ça touche.** Options 1 et 2 : D-006 et `docs/onboarding.md` (une étape de plus) ; un écran voisin de 1.5 et 1.6 (D-014). Juridique doit confirmer un point : les réponses d'entrée d'anciens membres sont montrées à un membre arrivé après eux (cela reste dans le cercle, comme le promet la carte de consentement). Option 3 : l'écran 2.1 (D-011, D-014). Option 4 : rien.

### Question 3 · Quand deux proches ont donné la même réponse (point 2, votre deuxième piste, avec C-010)

**D'où ça vient.** Vous avez trouvé étrange de ne pas pouvoir poser plusieurs visages sur une carte, ni le même visage sur deux cartes. La règle validée : chaque carte est la réponse d'une seule personne, et chacun ne répond qu'une fois par jour (`projet.md` §2, règle 8, D-006). Mais votre intuition est juste sur un point : dans l'essai, 6 manches sur 13 avaient une carte dont la réponse exacte avait aussi été donnée par un autre personnage.

**Exemple.** Hugo et Paul ont tous deux répondu « Favorable · « Ça protège l'emploi. » ». Seule la carte de Hugo est servie à Marie ; elle y pose Paul. Aujourd'hui, c'est compté faux.

**Options.**
1. **Le jumeau compte juste (Recommandé)** : le geste ne change pas (une carte, un visage, chaque visage une fois), mais désigner un proche qui a donné exactement la même réponse compte juste, et la révélation ajoute « Paul avait répondu la même chose. ». L'écran dit la règle. *Pourquoi (Game design) :* une bonne lecture n'est plus comptée comme une erreur, et la déduction par élimination reste. *Réserve (UX, Juridique) :* Marie apprend la réponse de Paul, dont la carte ne lui était pas servie (ce que la maquette 2.7c exclut aujourd'hui) ; seulement si elle l'a désigné, mais cela doit être dit au joueur.
2. **La règle actuelle, dite à l'écran** : une ligne dit « chaque réponse vient d'un proche différent » ; désigner le jumeau reste faux. *UX y est favorable*, avec ces mots à l'écran : « Hier, qui a dit quoi ? », puis « Une réponse par proche. ».
3. **Plusieurs visages par carte** (votre idée) : on pose autant de visages qu'on veut. Il faut alors une règle de compte, sinon tout cocher fait gagner ; et une pénalité serait le score punitif écarté (`projet.md` §10).

Le même visage sur deux cartes reste exclu dans toutes les options : chacun ne répond qu'une fois par jour, donc il serait faux sur l'une des deux. La quatrième piste du bilan (servir des réponses plutôt que des personnes) est écartée par Game design et UX : c'est un autre écran et un autre jeu, à concevoir entièrement.

**Ce que ça touche.** Option 1 : règles 8, 11 et 12 (ce qu'est une bonne attribution, D-010) ; les écrans 2.1 et 2.7a à 2.7c, dont le « jamais » de 2.7c (D-014) ; clôt C-010. Option 2 : l'écran 2.1 (D-014). Option 3 : `projet.md` §2 et §10, règles 8, 11 et 12, D-006 point 2 ; Le Mystère et « Ses surprises » à redéfinir.

### Question 4 · L'avis du cercle à la révélation (point 1, votre première piste)

**D'où ça vient.** Vous aimeriez voir, à 18h, ce que le cercle a pensé, tous ensemble, du texte, par exemple « en mode jugement majoritaire ». Aujourd'hui, la révélation ne montre que les réponses qu'on a devinées, puis le vote de l'Assemblée et les auteurs (règle 10, ordre de D-011).

**Options.**
1. **Une ligne : le vote du cercle (Recommandé)** : sur la carte du vote, sous « Texte rejeté. », une ligne : « Ton cercle, lui, l'aurait adopté. » (ou « rejeté », ou « était partagé »). *Plutôt que la mention du milieu de votre exemple (jugement majoritaire) :* un mot de vote répond à « Texte adopté. » et en dit moins sur chacun (Game design) ; UX écrirait plutôt une position (« Et ton cercle ? Favorable. ») ; Juridique accepte les deux formes. *C'est l'option la plus proche du §9 (« aucune mise en scène du désaccord ») ; UX préfère l'option 2.* Ni chiffre, ni nom, ni ta réponse à côté ; à partir de trois réponses. *Pourquoi (Game design) :* c'est votre piste sous la forme qui ne nomme personne ; elle oppose le cercle à l'Assemblée, pas un proche à un autre, et donne enfin du suspense au temps du vote (question 7).
2. **Non, comme aujourd'hui** : on ne voit que les réponses qu'on a devinées. *UX penche pour cette option :* à cinq membres, Marie connaît quatre réponses (ses trois cartes et la sienne) : la ligne lui dit souvent le côté de la cinquième ; il faudrait six réponses pour ne désigner personne, et la plupart des cercles ne la verraient jamais ; son absence un soir dirait que certains n'ont pas répondu (D-010, point 3). *Game design ajoute, contre sa propre option :* à trois ou quatre, la ligne n'apprend rien, mais rappelle chaque soir qui est dans la minorité. *Désaccord sur le seuil :* trois réponses (Game design, Juridique) ou six (UX).
3. **La répartition en petit graphique** (votre proposition) : le nombre de réponses à chaque position. *UX, Juridique et Back-end l'écartent ; Game design en liste les risques :* dans un petit cercle, elle se lit nom par nom (« tu es le seul défavorable »), son total dit qui n'a pas joué, et la maquette 2.7d l'exclut en toutes lettres (« Le décompte des positions dans le cercle »).

**Avis de Juridique.** Ce sont des opinions politiques (article 9 du RGPD) ; « non » et une ligne sans chiffre sont toutes deux défendables, la répartition est à écarter. Si la ligne est retenue : la dire au joueur avant sa première réponse (« à cinq ou plus, ton cercle peut en deviner une partie de ta réponse »), et l'inscrire dans l'analyse d'impact (cas d'un adolescent dans un cercle familial).

**Ce que ça touche.** Option 1 : règle 10 et carte 2.7d (D-010, D-014 ; un mot n'est pas un décompte, mais s'en approche) et, à cinq membres et plus, le « jamais » de 2.7c (« Les réponses que Marie n'avait pas à deviner »), relevé par Juridique ; à confronter au §9 (« aucune mise en scène du désaccord ») ; le texte d'information (D-006). Option 3 : en plus, D-010 point 3 (rien de visible quand un proche décroche) et les « jamais » de 5.4 et 3.3d.

## Second envoi : le portrait, les chiffres, le vote de l'Assemblée, la pause

La question 7 et la règle E11 touchent la production des textes, que le bilan (8.1 d) et le plan de construction (étape 5, choix 4) renvoyaient à l'étape 5. Elles sont posées dès maintenant parce que la question 4 et les règles E4 et E11 en dépendent ; vous pouvez les renvoyer à l'étape 5.

### Question 5 · Voir son portrait avancer (point 3, votre troisième piste, avec C-008)

**D'où ça vient.** Découvrir ses valeurs vous paraît « très stimulant », mais rien ne marque le chemin avant les premiers curseurs nets, vers trois mois (règle 18). Vous proposiez une barre, « reste trois jours avant la première révélation ». Pendant ces semaines, la phrase du dimanche n'a rien de net à dire (C-008).

**Options.**
1. **Des étapes nommées (Recommandé)** : dans Moi, chaque curseur porte un mot qui avance et ne recule jamais (« esquissé », « se dessine », « se précise », « net ») ; le dimanche, ta phrase annonce l'étape franchie. Sans chiffre ni date, invisible pour le cercle. *Un désaccord reste sur ce qui fait avancer une étape :* Game design, le curseur lui-même, donc le poids des réponses (une réponse « Neutre » n'avance pas) ; UX, le nombre de réponses, parce que « Neutre est une réponse comme une autre » (`projet.md` §2). L'option telle qu'écrite suit Game design. *Pourquoi (Game design) :* c'est le seul repère qui dise vrai ; avec huit curseurs, une étape tomberait presque chaque semaine (estimation de Game design, à caler à l'étape 6) ; rien ne pousse à revenir par peur de perdre.
2. **Une barre comptée en réponses** : elle avance à chaque réponse, sans date. *C'était la position d'UX au bilan (8.2, piste 3) ; dans sa fiche finale, UX écarte la barre :* les « jamais » de 1.7, 4.1 et 5.11 excluent tout chiffre sur le portrait. *Game design objecte aussi :* la barre promet une découverte qui peut ne pas venir à qui répond souvent au centre.
3. **Rien de plus** : le flou qui se resserre et les phrases suffisent (le dimanche dit ton choix le plus marqué de la semaine, règle R2 plus bas).
4. **Un compte à rebours en jours** (votre idée) : *à écarter selon Game design et UX :* le portrait avance avec les réponses, pas avec les jours ; un jour manqué repousserait l'échéance, comme une série cassée, ce que le jeu refuse.

**Ce que ça touche.** Option 1 : `projet.md` §5 (un repère s'ajoute au rythme de dévoilement), règle 18, écrans 4.1, 5.11 et 3.3e (D-014) ; leurs « jamais » (aucun chiffre sur le portrait) sont tenus. Option 2 : en plus, ces « jamais » de 1.7, 4.1 et 5.11. Option 4 : en plus, `projet.md` §2 et §10 et, s'il passait par un message, le message unique du §2 et « aucune relance » (D-010). Le seuil des trois mois ne change pas ; son réglage fin se fait à l'étape 6.

### Question 6 · Des chiffres internes sur ce que répondent les joueurs (point 16, C-021)

**D'où ça vient.** Votre document prévoit de suivre « le taux de choix par option » et le taux de « aucune », pour repérer un texte mal écrit (`projet.md` §8). Le produit validé ne mesure que ce que les joueurs font, « jamais sur ce qu'ils pensent » (`produit.md` §8, D-010). Il faut choisir avant d'écrire la page « Qui, durée, droits ». Dans tous les cas, rien n'est jamais publié, même au registre (ligne rouge du §9 ; en campagne, un chiffre public pourrait passer pour un sondage).

**Options.**
1. **Seulement la part de « aucune » (Recommandé)** : pour chaque texte, l'équipe compte combien ont répondu « aucune des quatre raisons » : le signe que les arguments tombent à côté. Rien sur les positions ni sur les raisons choisies. Comptée après la révélation, sur tous les joueurs à la fois, jamais par cercle, au-dessus d'un seuil minimal de réponses (Juridique : par exemple, rien sous 30). *Pourquoi (arbitrage de l'orchestrateur) :* aucun des trois spécialistes ne l'a recommandée en premier, mais tous trois l'acceptent. Juridique recommandait de compter aussi les positions et les raisons ; Back-end, aucun chiffre ; Contenu, « aucune » plus le poids des raisons. Compter les positions est écarté : Contenu et Back-end y voient un sondage par texte (§9, §10). La part de « aucune » ne dit rien de l'avis des joueurs ni d'un parti.
2. **Aussi le poids des raisons** : en plus, la part de chaque raison, pour vérifier que la réécriture n'affaiblit pas les arguments d'un groupe. *Juridique* l'accepte avec des garde-fous écrits (comptes par texte, seuils, lecteurs limités, un seul usage) ; *Contenu* le propose sous forme cumulée, par groupe d'origine des arguments. *Back-end s'y oppose :* chaque raison porte un député et son groupe ; croisés, ces chiffres donneraient la part des joueurs qui choisissent les arguments de tel groupe, le chiffre qu'on viendrait réclamer en campagne.
3. **Aucun chiffre** (recommandé par Back-end) : la qualité des textes n'est vérifiée qu'avant publication (et, en bêta, par le questionnaire sur la clarté). C'est la seule garantie qui ne demande aucune surveillance.

**Ce que ça touche.** Options 1 et 2 : une exception à `produit.md` §8 (D-010), limitée à la qualité des textes ; une phrase dans « Qui, durée, droits » (D-006 ; l'avocat dira s'il faut un accord séparé) ; `projet.md` §8 restreint. Option 3 : `projet.md` §8, dont les deux taux sont retirés.

### Question 7 · Adoptés, rejetés : le mélange des textes (point 6)

**D'où ça vient.** Dans l'essai, tous les textes votés ont été adoptés : le temps du vote (« Et l'Assemblée ? », D-011) n'a jamais surpris. Contenu a compté les scrutins publics des deux dernières années (recompte indépendant identique, sur la même copie des données) : 207 votes sur 212 sur un texte entier sont des adoptions ; 3 amendements sur 4 sont rejetés ; il n'y a qu'une centaine de votes par an sur un texte entier, donc le jeu servira surtout des amendements et des articles. Sans règle, le mélange dépendra du type de vote, pas du jeu.

**Options.**
1. **Au moins un tiers de chaque (Recommandé)** : sur quatre semaines, chaque résultat représente entre un tiers et deux tiers des textes, dans un ordre tiré au hasard ; « Texte rejeté. » tombe deux à cinq fois par semaine. *Pourquoi (Contenu) :* le vote garde son incertitude (« l'issue du vote ne doit pas se deviner », `projet.md` §8), et la règle se publie. Elle passe après l'équilibre entre groupes.
2. **Le rejet, rare** : environ un texte sur cinq ; un rejet devient un petit événement.
3. **Aucune règle sur le résultat** : *UX penche pour cette option :* ne pas choisir un texte pour son résultat, pour ne pas donner une image fausse de l'Assemblée ; la variété viendra des amendements. *Contenu répond :* sans règle, certaines semaines seraient presque toutes « rejeté ».

Si la question 4 retient la ligne « Ton cercle l'aurait adopté », le vote prend du relief même quand l'Assemblée adopte (Game design) : cette question devient moins pressante.

**Ce que ça touche.** Options 1 et 2 supposent la règle E11 (textes déjà votés). Elles ajoutent une règle de choix au §8 et au registre de méthode ; aucune décision n'est modifiée ; la règle d'application de Contenu « au moins un texte rejeté parmi les trois textes d'entrée » précise D-006.

### Question 8 · Le message de 18h quand on est en pause (relevé par UX et Game design, hors des constats)

**D'où ça vient.** Après sept jours sans répondre, on est mis en pause, sans que le cercle le sache (règle 5 ; D-010 : « aucune relance »). Rien ne dit si le message de 18h continue d'arriver. Une semaine de vacances suffit pour être en pause : le cas sera fréquent, et il touche le seul message du jeu (`projet.md` §2).

**Options.**
1. **Le message continue (Recommandé)** : en pause, tu reçois le même message que tout le cercle, qui ne dit rien de ton absence ; tu peux le couper dans Réglages. *Pourquoi (arbitrage de l'orchestrateur, qui suit UX, fiche du premier tour, et l'avis du Vérificateur) :* le message reste vrai, puisqu'en pause on peut toujours deviner et répondre ; le couper ferait de la pause une sanction invisible et rendrait le retour plus difficile.
2. **Le message s'arrête** : après sept jours sans réponse, le message de 18h cesse ; il reprend avec ta réponse suivante. *Pourquoi (Game design, fiche du premier tour) :* un message quotidien envoyé à qui ne joue plus devient une relance, ce que D-010 écarte.

**Ce que ça touche.** Option 1 : rien ; précise D-010 (« aucune relance » vise ce qui parle de l'absence). Option 2 : l'interprétation de D-010, point 3, et le « un seul message quotidien » du §2, qui ne vaudrait plus pour les joueurs en pause.

## Troisième envoi : les règles de détail, validées d'un geste

Vingt-trois règles qui complètent le produit là où il était muet. Aucune ne change la promesse ni une règle du jeu validée, sauf mention « touche ». L'équipe les a tranchées ; quand deux spécialistes n'étaient pas d'accord, le choix et la position écartée sont dits. La question sera : « On applique ces règles ? » (toutes ; toutes sauf celles dont vous donnez le numéro, R… ou E… ; ou on en parle d'abord).

### Règles du jeu (Game design, avec Back-end et UX)

- **R1 · Phrase du jour sans valeur passée avant l'autre (C-007).** On garde les trois phrases de l'essai : « tu as penché vers la liberté » (raison hors sujet ou « aucune ») ; « tu as donné du poids à la sécurité comme à la liberté » (raison de l'autre côté) ; « tu n'as penché ni vers la sécurité ni vers la liberté » (réponse neutre). Complète la règle 18.
- **R2 · Phrase du dimanche sans curseur net (C-008).** Dans l'ordre : une tension devenue nette (phrase validée) ; sinon une étape franchie (si la question 5 retient les étapes) ; sinon ton choix le plus marqué de la semaine (« Cette semaine, entre sécurité et liberté, tu as le plus souvent choisi la liberté. », ou, à égalité, « tu as penché autant d'un côté que de l'autre ») ; sinon « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. ». *Touche* l'exemple de la maquette 3.3e (un curseur net un mois après l'entrée), à corriger.
- **R3 · Réponses « inattendues » tant que le profil est flou (C-009).** Tant que le curseur d'un auteur est flou, « inattendue » se lit « qui se distingue des autres réponses du jour » ; ensuite, « qui s'écarte de son curseur ». La réponse de celui qui devine n'entre jamais dans le calcul. Précise la règle 8.
- **R4 · Deux réponses identiques (C-010).** On évite de les servir le même jour quand une autre réponse peut prendre la place ; servies ensemble, l'un ou l'autre auteur est juste sur chacune. S'ajuste à la question 3.
- **R5 · Raison cachée mal devinée (C-011).** Les verdicts validés ne changent pas ; « Sa raison : « … » » s'ajoute en dernière ligne, sauf quand personne et raison sont justes. Bonne personne, mauvaise raison : « Tu connais ton monde. » et le point. « Raison cachée trouvée » veut dire personne et raison justes ; elle ne sert qu'au départage du Devin.
- **R6 · Égalités et minimums des titres (C-013).** Le Devin : au moins un point ; à égalité, le plus de raisons cachées trouvées, puis le sort (jamais montré). Le Mystère : la plus forte part d'erreurs du cercle sur ses cartes, passes exclues, au moins six tentatives et une erreur ; à égalité, le plus d'erreurs, puis le sort. La surprise de la semaine : passes exclues, au moins quatre attributions dont une fausse ; à égalité, le plus d'erreurs, puis le sort. Un titre sans titulaire n'apparaît pas (jamais « Le Mystère : personne »). Le Fidèle : ceux qui ont répondu les sept jours.
- **R7 · Le Sans-Faute (C-014, C-024).** On garde la règle validée (sept jours sans erreur ni passe). La raison cachée n'est pas exigée ; un jour sans carte ne compte ni pour ni contre, avec au moins cinq jours de cartes dans la semaine. Après son annonce, il vit comme un titre (sous le visage la semaine suivante, dans Mes titres, dans les titres passés), sans total (*touche* les écrans 4.2, 5.2 et 5.5 : une ligne de plus, D-014). S'il n'est jamais tombé à mi-bêta, l'équipe vous proposera de le rendre atteignable. *Réserve d'UX :* « sans rien passer » est le seul endroit où passer coûte quelque chose.
- **R8 · Un proche dans deux de mes cercles (C-018).** Sa réponse ne t'est servie qu'une fois par jour, dans le cercle où son absence viderait la manche ; sinon, un tirage invisible décide ; dans l'autre manche, son visage n'est pas proposé (sa carte est ailleurs). *Désaccord :* Game design proposait la première manche dans l'ordre des cercles ; retenu Back-end (là où son absence viderait la manche, sinon tirage), pour qu'un cercle ne soit pas toujours favorisé ; le visage non proposé dans l'autre manche vient de Game design. *Touche* D-011 (tous les membres proposés), par cette seule exception.
- **R9 · Tempéraments par cercle ou pour la personne (C-019).** L'Original et Le Pont se calculent dans chaque cercle et s'écrivent avec son nom (« Le Pont (Famille) ») ; Le Mesuré et Le Tranché valent pour toute la personne. Moi les montre tous (*touche* l'écran 4.1, au singulier aujourd'hui) ; sous un visage, ceux de ce cercle. Game design, UX, Back-end et Juridique sont d'accord (rien ne passe d'un cercle à l'autre).
- **R10 · 18h, et ce qui est en cours à 18h (C-020, bilan 8.1 e).** 
  - une seule heure pour tous, 18h à Paris, donnée par le jeu et non par le téléphone ;
  - à 18h, la manche se ferme telle qu'elle est : un visage posé compte, une carte vide est passée (la convention de l'essai, qui oubliait tout, n'est pas reprise) ;
  - une réponse au texte commencée avant 18h est acceptée pendant quelques minutes : elle compte pour ton portrait et Le Fidèle, mais tes proches ne la devineront pas ;
  - Game design, Back-end et UX sont d'accord sur le principe. Deux points restent : « Valider » (UX : il ne fige plus rien et devient un « Suivant », ce qui touche D-014 ; Game design : il fige la manche plus tôt), renvoyé à la question 1 ; une manche jamais ouverte (UX : pas de cartes, la révélation commence au vote), à confirmer par Game design.
- **R11 · Le Pas de Côté (C-026).** Il tombe sur une réponse qui fait nettement passer une valeur avant l'autre, à l'opposé de ton curseur tel qu'il était juste avant, ce curseur étant net et penchant clairement (seuil à caler à l'étape 6) ; pour tout membre, sur les textes du jour ; annoncé à la révélation de ce texte. Précise la règle 14.
- **R12 · Les onze « interprétations à confirmer » de l'essai** sont reprises, sauf celles que R4, R7, R10 et R11 ajustent (R11 fait du seuil de l'essai un point de départ).

### Écrans, textes et choix des textes (UX, avec Contenu, Back-end et Juridique)

- **E1 · Le message de 18h un soir sans révélation (C-012).** Il n'annonce que ce qui attend vraiment :
  - la forme validée s'il y a des cartes ;
  - « 18h. Le vote de l'Assemblée t'attend, et la question d'aujourd'hui. » s'il n'y a que le vote ;
  - « 18h. La question d'aujourd'hui t'attend. » sinon ;
  - les titres du dimanche seulement s'il y en a.

  Le vote et les auteurs d'un texte auquel on a répondu tombent toujours à 18h, même sans cartes. *Touche* les notes des maquettes 1.13 et 5.10 (« rien à révéler à 18h »), qui contredisaient `docs/onboarding.md` (les notes des maquettes sont les plus récentes, D-014 ; on retient ici la lecture de l'onboarding et de la règle 10, sur l'avis concordant de Game design et d'UX : c'est un choix, que vous validez avec ce bloc) ; `produit.md` §5 (« le même pour tout le cercle » devient « le même pour tous ceux qui ont la même chose à découvrir ») ; D-011 (« Nouveau texte dans … » vaut pour tout soir sans révélation).
- **E2 · Les libellés des valeurs dans les phrases (C-015).** Un libellé par valeur, toujours le même : la sécurité, la liberté ; l'égalité, le mérite ; la solidarité collective, la responsabilité individuelle ; la précaution, l'innovation ; la tradition, le changement ; la souveraineté, l'ouverture ; l'État, le marché ; la décision locale, la décision nationale. Les quatre tensions jamais essayées se confirment avec leurs textes d'épreuve à l'étape 6, avec les critères de Contenu (aucune valeur qui sonne comme une qualité face à un défaut, ni comme le mot d'un camp ; aucun mot partagé entre deux tensions). Contenu signale que « l'État » interdirait le mot dans les raisons de cette tension : la règle des textes se lira « jamais le libellé employé comme valeur ».
- **E3 · Rouvrir une révélation (C-016).** Après 18h, la première ouverture du jeu commence par la révélation. Refermée, elle se rouvre jusqu'au 18h suivant par une ligne en haut d'Aujourd'hui, là où on l'avait laissée. Son propre visage, dans Le Cercle, ouvre son portrait.
- **E4 · Le vote daté (C-017).** Sous « Texte adopté. » ou « Texte rejeté. », une ligne au passé avec la date et l'étape (« Le 9 octobre 2024. Le Sénat devait encore voter. »), jamais avant 18h, comme dans l'essai ; le jeu garde les faits et en tire la phrase. *Touche* les écrans 2.7d, 1.6 et 5.4 (une ligne de plus, D-014), sans changer un mot validé. *Reste ouvert, pour l'étape 6 :* Contenu propose d'y ajouter les voix (un vote serré se verrait) ; UX préfère n'afficher aucun décompte, et dire au besoin « de justesse ». Back-end rappelle que « de justesse » suppose aussi un décompte et un seuil, et qu'un décompte n'existe que pour un scrutin public.
- **E5 · L'auteur et son groupe (C-022).** Mandat et groupe au moment de l'acte (le dépôt ; la séance de l'extrait) ; le groupe en toutes lettres, sous son nom officiel (« Les Démocrates » plutôt que « Dem »), pris dans une liste fermée ; « sénateur » ou « sénatrice » quand c'est le cas ; « Proposé par le Gouvernement. » ; les cas du député non inscrit et de l'amendement de commission sont prévus. *Nuance de Contenu :* le sigle officiel là où la place manque.
- **E6 · Les textes d'entrée dans l'Historique (C-023).** Ils y entrent, à leur place, sous « Pour commencer · {date} ».
- **E7 · Deux membres au même pseudo (C-025).** Dans un cercle, deux membres n'ont jamais le même pseudo (comparé sans majuscules ni accents, ni lettres d'autres alphabets qui imitent les nôtres), ni le même rond (deux lettres si besoin). *Touche* `projet.md` §3 (« pseudo libre » : libre, mais unique dans chaque cercle) et les maquettes 1.15, 4.2 et 5.9 (un rond peut porter deux lettres, D-014). UX et Juridique sont d'accord.
- **E8 · Les deux-points en série (C-027).** Un titre de texte n'a jamais de deux-points (règle de rédaction proposée par UX ; Contenu, non consulté, doit confirmer qu'elle est tenable sur de vrais titres) ; les écrans ne changent pas.
- **E9 · Le sens des textes (Contenu).** Pour chaque tension, autant de textes où être favorable sert une valeur que l'autre, sur huit semaines. Sinon, un joueur qui approuve souvent verrait son portrait pencher sans l'avoir choisi (bilan, section 7).
- **E10 · Ce que l'essai a ajouté aux maquettes, repris pour le produit.** La typographie à l'affichage ; le bilan d'entrée à 0 ou 1 sur 3 (« … a réussi à te surprendre deux fois. ») ; les membres rangés par ordre d'arrivée, Le Cercle compris ; un titre par ligne sous un visage ; la carte de révélation qu'on retourne d'un toucher ; des lignes d'au moins 44 px ; « Ses surprises » avec la raison toujours écrite ; « Déjà joué aujourd'hui » qui disparaît quand personne n'a joué ; les mots de « aucune » ; les états vides et cas que les maquettes ne dessinaient pas. *Touche* les maquettes 4.2 (ordre des visages, titres), 4.3 (raison toujours écrite) et 1.7 (à 0 ou 1 sur 3, la phrase des surprises remplace le grand nombre) (D-014). Le reste du cadre de l'essai (« Jour suivant », fiche « Qui est qui », carnet…) n'est pas repris.
- **E11 · Seulement des textes déjà votés (relevé par Back-end et Contenu).** Un texte n'est servi qu'une fois son vote acquis : le vote est toujours connu à 18h, rien ne fuit pendant qu'on devine (D-010, lecture A), et le mélange de la question 7 devient possible. Le prix : un texte voté la semaine précédente plutôt que le jour même. *Touche* `projet.md` §8 : le « direct » est restreint aux textes déjà votés (Back-end : cela modifie le §8 ; Contenu : cela le précise).

### Une correction sans question

`docs/produit.md` écrit encore « Le Mesuré, souvent au centre (nom proposé) » (règle 13) et « à confirmer » (§9), alors que D-010 l'a validé : corrigé lors de la mise à jour du produit.

## Ce qui est renvoyé à plus tard

- **Un joueur déjà inscrit qui rejoint un autre cercle** rejoue-t-il trois textes d'entrée ? (UX) À régler avec l'entrée, si la question 1 la fait redessiner.
- **Les voix sous le vote** (E4) : à l'étape 6, avec un lecteur neuf.
- **Un test de lecture de la journée par trois à cinq personnes qui ne connaissent pas le projet** (UX et Game design : il en dirait plus que nos avis) : à poser avec la décision de continuer, d'ajuster ou d'arrêter (D-008).

## Ce que ces choix ne peuvent pas dire

Tout ce qui précède repose sur un seul essai, joué par l'auteur du projet face à des personnages inventés. Les questions 2, 3, 4 et 5 parient sur ce que vivront de vrais proches : la bêta mesurera ce qu'ils font (justesse des nouveaux venus, cartes passées, ouverture de Moi), jamais ce qu'ils pensent.
