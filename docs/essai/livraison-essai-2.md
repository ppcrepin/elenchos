**Point d'étape 5 : le second essai est en ligne.** Vous pouvez commencer quand vous voulez.

**Ce qui est prêt**
- La page du second essai a remplacé celle du premier, à la même adresse : l'icône « Essai » de votre écran d'accueil, ou https://ppcrepin.github.io/elenchos/essai/.
- La page servie est bien celle qui a été contrôlée : la preuve de publication sur GitHub l'a vérifiée octet pour octet, plus de dix minutes après la mise en ligne.
- Le fichier scellé est celui dont l'empreinte a été publiée ici même et sur GitHub le 10 octobre à 22h24, heure de Paris (`587d bac7 …`, commit `f1cf414` sur `main`). Le dévoilement, à la fin, pourra vous la montrer pour comparaison.

**Pour commencer**
1. Ouvrez l'essai depuis l'icône « Essai ». Si votre iPhone garde encore votre partie du premier essai, la page vous propose d'abord de l'effacer : votre carnet du premier essai, déjà dans cette conversation, n'est pas touché. Sans cet effacement, l'essai ne commence pas.
2. Lisez le premier message (vos réponses restent dans votre iPhone), puis la page d'arrivée : elle donne le programme.
3. Le parcours est celui que vous avez validé (D-033) : trois jours en nouveau venu, avec le défi de Valentin, puis deux sauts jusqu'au premier, puis au second dimanche. Comptez vingt à vingt-cinq minutes en tout, en une ou plusieurs fois.
4. Au jour 7, puis à la fin : copiez votre carnet et collez-le dans cette conversation (D-017). Le dévoilement s'ouvre ensuite ; vous pourrez alors ouvrir le dossier « a-ne-pas-ouvrir-2 ». Dans la conversation, parlez du jeu, jamais de vos réponses ni de ce que le jeu en dit.

**Ce qu'il faut savoir avant de jouer**
- **Tradition ou Changement** : vous n'y répondrez qu'à trois textes. Nous avions écrit « quatre ou cinq réponses par tension » (`retours-du-8-octobre.md`) : c'est vrai pour les trois autres tensions, pas pour celle-ci, faute de textes assez nombreux dans les débats.
- **L'écran du compte est simulé, et deux formes ne sont pas dessinées.** Les trois boutons (Apple, Google, e-mail) et la page du saut sont en version texte, sans le dessin de la Direction artistique. Les boutons ne se connectent à rien : touchez celui que vous choisiriez pour de vrai.
- **La page pèse environ 700 Ko**, plus que les 340 à 550 Ko estimés. Sur un ordinateur dont on a ralenti le processeur quatre fois pour imiter un téléphone, elle démarre en 0,6 à 0,9 seconde sous Chromium (limite fixée : 2 secondes). Chaque geste répond en moins d'un dixième de seconde, sous Chromium ralenti comme sous WebKit, le moteur de Safari. Rien n'a été mesuré sur un vrai iPhone.
- **Les textes nouveaux à l'écran** sont listés dans l'annexe C de `docs/essai/simulation-2.md`. Attention : son point 11.7 donne les phrases possibles du vote ; si vous voulez découvrir les cas en jouant, sautez-le. Rien n'oblige à lire l'annexe.

**Ce qui a été vérifié avant la publication**
- La même histoire du cercle, au caractère près, dans trois programmes (la page, le contrôle, le scellement). La règle veut qu'ils aient été écrits sans voir le code l'un de l'autre, mais nous n'avons aucun moyen de le vérifier. Les 15 chiffres de référence sont les mêmes dans le contrôle et le scellement.
- 21 joueurs témoins, 200 parties au hasard et 37 parties jouées à l'écran : la page et le contrôle donnent chaque fois la même partie.
- Deux carnets de référence et quatre cas chiffrés ont été refaits à la main par une instance de Game design qui n'a lu ni le code de la page, ni celui du contrôle, ni celui du scellement. Les carnets concordent avec la page et le contrôle (durées, dates, heures et version mises à part), à une ligne près, tranchée selon une règle déjà écrite ; les lignes qui dépendent d'un tirage ou des curseurs courants des personnages n'ont pas pu être refaites à la main. Trois des quatre cas chiffrés concordent avec le fichier scellé ; le quatrième n'a pas été rapproché d'une trace.
- Les lignes rouges, les textes affichés, la mémoire, « Tout effacer », les durées, la mise en page aux formats d'un iPhone 15, d'un iPhone SE et d'un iPad, simulés, en clair et en sombre.
- Un vrai défaut de la page, corrigé : pendant un chargement lent, l'écran de secours pouvait apparaître trop tôt. Deux fausses alertes de nos outils, pas de la page, corrigées aussi : sous WebKit, une sonde échouait à cause de l'horloge de l'outil de mesure ; le programme de contrôle signalait à tort un pseudo de deux lettres retrouvé à l'intérieur de mots du carnet.

**Limites, dites franchement**
- Les programmes ne vérifient pas le fond des fiches (exactitude des résumés et des raisons) : il a été vérifié par une relecture de fidélité aux débats et par des annotations à l'aveugle, faites par des modèles différents de celui qui a écrit les fiches (D-036). Cela donne un second regard, pas un regard indépendant.
- Deux situations n'ont été produites par aucun des 21 joueurs témoins ni des 92 stratégies essayées : un personnage qui décroche Le Sans-Faute pendant vos deux semaines, et un tempérament qui change au premier ou au second dimanche. Nous ne savons pas si elles sont impossibles ; si elles arrivent, rien n'a prouvé qu'elles fonctionnent.
- Le réglage (la part des réponses que les personnages donnent exprès contre leur profil, et la vitesse de votre portrait) a été vérifié en simulant 200 parties, par le seul programme de scellement, sans second calcul ; il n'a rien changé aux valeurs prévues.

Bon essai. Je reste disponible ici pendant que vous jouez, sans rien voir de votre partie.
