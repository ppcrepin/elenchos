# Journal des décisions

Chaque arbitrage du porteur, daté et numéroté. Source de vérité n°1 du projet : une entrée récente l'emporte sur une entrée ancienne et sur `docs/projet.md`. Une décision ne se modifie que par une nouvelle entrée qui cite celle qu'elle remplace. Les agents relisent ce fichier avant tout travail.

Numérotation : **D-nnn** décision du porteur · **C-nnn** constat (incohérence ou fait relevé, pas encore tranché).

---

## 2026-10-04

### D-001 — Règles de travail · Décidé

- Toutes les questions au porteur sont des QCM cliquables, option recommandée en premier avec une ligne de justification.
- Équipe d'agents fixe, définie dans `.claude/agents/` : cohérence, game design, UX, contenu, juridique & éthique, back-end, front-end, vérificateur.
- Rien n'est envoyé au porteur sans passage par le vérificateur. Seuil : chaque livrable ; pas les accusés de réception ni les questions de clarification d'une ligne.
- Le vérificateur tourne sur un modèle différent de la session principale.
- Niveau d'exigence : extrême ; compétence de niveau mondial à tous les niveaux.
- Aucun code applicatif avant l'étape 6 de la méthode (§0) et un accord explicite du porteur.

### D-002 — Promesse · Décidé

La formule du §1 reste telle quelle : « Le jeu ne demande pas ce que tu penses. Il demande qui, dans ton cercle, a pensé ça. » La proposition d'y ajouter « et pourquoi » est refusée. Le « pourquoi » (choix d'une considération parmi 4 arguments réels, §2) et la découverte des valeurs (§5) comptent pour le porteur, mais restent dans le corps de l'explication, pas dans la formule.

### D-003 — Explication de la vision · Décidé (rejet)

Deux versions d'une explication de la cohérence globale du jeu ont été rejetées : exactes mais trop complexes et pas assez claires. Elles n'étaient passées que par un vérificateur de fidélité, pas par game design ni UX. À reprendre via le circuit complet (voir `CLAUDE.md`). Attendu : court, compréhensible en une lecture, ludique. Le porteur tient à ce que l'explication fasse place à la découverte des valeurs (les siennes et celles de ses proches) et au « pourquoi les gens pensent ce qu'ils pensent », sans complexifier.

### D-004 — Vision validée · Décidé

Le texte `docs/vision.md` est validé tel quel. Il est sorti du circuit complet : grille de clarté UX (10 critères), rédaction Game design (v3, v4), fusion, relecture Cohérence (compatible avec réserves, levées) et Vérificateur sur un autre modèle (OK avec corrections mineures, appliquées ; clarté estimée 8/10), confirmation Game design. 261 mots, 3 titres, 1 exemple joué, 1 badge nommé. Il remplace les deux versions rejetées (D-003). Il explique le jeu sans le spécifier : les mécaniques absentes (raison cachée, réponses atypiques, autres titres, tempéraments, rares) restent validées au §2 et au §4. Un test de lecture avec 3 à 5 personnes extérieures est reporté au prototype manuel.

### D-005 — Web ou application (§11.1) · Décidé

**Lien d'abord, application ensuite.** Un seul code, écrit pour le web, emballé ensuite dans une application pour les deux boutiques (App Store, Google Play). Phase 1, les premiers cercles : web seul ; l'invité joue par un lien, sans rien installer. Phase 2, au plus tard avant le lancement public : les deux boutiques en même temps ; l'application est un ajout pour le message de 18h, le web reste jouable. Le §11.8 « iOS puis Android » est remplacé par « web pour tous, puis les deux boutiques en même temps ». Le §2 ne change pas (message unique à 18h) ; son canal est précisé : notification de l'application, avant elle notification du navigateur sur Android et geste d'ajout à l'écran d'accueil guidé sur iPhone.

Conditions posées par UX et Game design, acceptées avec la décision : (1) le compte et le geste d'ajout à l'écran d'accueil sont proposés après la première révélation, jamais avant ; (2) on mesure séparément « message de 18h reçu » et « a joué avant 18h le lendemain ». Critères de passage aux boutiques : les iPhone reviennent moins que les Android au bout d'une semaine, ou moins de deux iPhone sur trois ont fait le geste malgré le guidage (UX) ; après deux semaines, les membres iPhone sans ajout à l'écran d'accueil jouent moins souvent avant 18h que ceux qui reçoivent le message (Game design).

Conséquence sur §7 (non validé) : l'invité joue ses trois textes avant toute création de compte. Le type de compte (Google/Apple ou pseudo + lien e-mail, proposition Juridique), l'écran de consentement avant la première réponse (demande Juridique) et le lien d'invitation (C-004) restent à trancher avec l'onboarding.

Circuit : UX, Game design, Back-end, Front-end, Juridique → synthèse → Cohérence + Vérificateur (deux passes). Fait central revérifié le 4 octobre 2026 : sur iPhone, la notification web exige l'ajout à l'écran d'accueil (depuis iOS 16.4).

**Aucun code avant l'étape 6, même jetable.** Le porteur l'a rappelé : le test technique du message de 18h (page nue, cinq téléphones, trois soirs) sera proposé au début de l'étape 6, pas avant. Ne plus poser de question technique avant cette étape.

### D-006 — Onboarding v3 (§7, §11.2) · Décidé

Le parcours décrit dans `docs/onboarding.md` remplace le §7. Quatre arbitrages du porteur :
1. **Compte** : pseudo + e-mail (code à six chiffres), Google/Apple ajoutés en option en phase 2 (Sign in with Apple alors obligatoire sur l'App Store).
2. **Réponses à deviner et taille du cercle (C-002, clos)** : les réponses des autres, jusqu'à trois, chaque personne une fois ; cercle lancé à trois membres. Précise le §2 (« 3 réponses anonymes ») pour les cercles de trois et quatre.
3. **Exception au §9 « rien ne sort du cercle » (C-004, clos)** : Marie lit les trois réponses d'entrée de Thomas avant d'être membre, par un lien personnel à usage unique qui expire ; Thomas y consent explicitement en envoyant. Lecture : Thomas partage ce qui ne parle que de lui, comme le Portrait de l'année envisagé. Le lien réutilisable est écarté.
4. **Exception au message unique (§2)** : Thomas est prévenu à chaque arrivée tant que le cercle n'a pas trois membres ; ensuite, tout passe par le message de 18h.

Aussi retenus avec le parcours : carte de consentement explicite avant la première réponse (obligation RGPD, sans identité) ; révélation immédiate texte par texte ; la réponse de Marie n'est pas affichée à côté de celle de Thomas ; « 2 sur 3 » non conservé, surprises comptées à 0 ou 1 ; Thomas devine Marie à son tour quand ils sont deux ; quinze ans et plus par déclaration (proposition Juridique) ; parcours parent-enfant en v2. Juridique n'est pas avocat : carte et exception à relire par un avocat avant le lancement public.

Circuit : UX, Game design, Juridique → synthèse → Cohérence (compatible avec réserves, levées) + Vérificateur (OK avec corrections, appliquées).

### D-007 — Le test se fait seul, avec des joueurs simulés · Décidé

Le porteur ne veut pas du prototype manuel sur WhatsApp avec un cercle réel (§11, « prochaine étape immédiate », et phase Prototype de `docs/feuille-de-route.md`). Il veut faire le test seul ; Claude simule les autres joueurs. Modalités (joueurs fictifs ou non, temps réel ou accéléré, garanties d'honnêteté de la simulation, ce que le test peut et ne peut pas montrer) : à concevoir par Game design, UX et Juridique, puis à soumettre au porteur. Limite déjà connue : un test solo ne peut pas montrer que de vrais proches reviennent chaque soir et en parlent ; il teste les règles, la boucle et le plaisir de deviner.

### D-008 — Pas de règle d'arrêt fixée d'avance · Décidé

La décision de continuer, d'ajuster ou d'arrêter se prend au bilan du test, sans règle fixée d'avance (proposition du Vérificateur « deux prototypes ratés, on arrête » refusée).

L'ordre de travail proposé par la feuille de route (règles, test, puis conception avec le design, puis construction ; change le §0) n'est pas encore validé.

### D-009 — Remettre le travail dans l'ordre · Décidé

Le porteur constate qu'on n'a qu'un concept, pas un produit ni un design, et que des choix de fabrication (web ou application) et un test lui ont été soumis trop tôt, sans qu'il se sente réellement consulté. Décision : on suit l'ordre normal de création d'une application, décrit dans `docs/feuille-de-route.md` (définir le produit, dessiner, donner un visage, faire essayer, choix de fabrication, construire, lancer). On ne pose au porteur que les questions de l'étape en cours, regroupées à la fin d'un livrable, et sur le fond.

Conséquences :
- **D-005 (web ou application) est suspendu.** Il sera repris à l'étape 5, quand le produit sera défini et dessiné. Son contenu reste une hypothèse de travail, pas une décision.
- **D-007 (test solo) est suspendu.** La forme du test sera reprise à l'étape 4, sur des maquettes.
- La vision (D-004) et l'onboarding (D-006) restent acquis comme matière de départ ; ils peuvent évoluer aux étapes 1 et 2.
- La feuille de route précédente est remplacée.

### D-010 — Le produit, première version · Décidé

`docs/produit.md` est validé : fonctions, journées, règles, écrans, messages, états vides, mesures, et toutes les propositions qu'il contient (revues sur les maquettes à l'étape 2). Ce qu'il change dans le document de projet (sa section 9) est validé : « aucune » comme cinquième considération (C-005, clos) ; « Répondre » au lieu de « Déposer » ; trois cercles au plus (règle le point ouvert §11.6) ; pause après sept jours sans réponse et cercle endormi sous trois membres actifs ; une seule révélation pour tous ses cercles ; Le Fidèle à plusieurs titulaires ; Sans-Faute sans erreur ni passe ; égalité au Devin départagée par les raisons cachées ; points remis à zéro le lundi ; tempéraments sur deux mois ; « Le Mesuré » ; phrase du jour juste après la réponse, phrase de la semaine le dimanche ; archives jouables reportées ; titres passés sans total ; palmarès limité à ses propres titres ; lien vers le scrutin à 18h seulement.

Quatre questions de fond tranchées :
1. **C-006, clos** : pendant qu'on devine, on ne sait rien ; vote, auteurs et bonnes réponses tombent ensemble à 18h (lecture A).
2. **C-003, clos** : l'écran d'un proche montre les deux portraits superposés et ses surprises, sans aucun chiffre ; ni taux de lecture, ni désaccords côte à côte.
3. **§11.5, clos** : quand un proche décroche, rien de visible ; pause après sept jours, cercle endormi sous trois membres actifs, réveil automatique ; aucune relance.
4. Les changements au document de projet sont validés avec ce document.

### D-011 — Maquettes validées ; le porteur choisit le design · Décidé

Les maquettes en noir et blanc (`docs/maquettes/maquettes.html`, 51 écrans) sont validées, avec les quatre changements listés en fin de page : position choisie dans une liste de cinq rangées ; phrases sans genre (« Marie a trouvé 2 de tes 3 réponses. À ton tour de deviner Marie. », « Thomas a réussi à te surprendre deux fois. », « Et Thomas ? Sa réponse ? ») ; « dès que vous serez trois » et « Nouveau texte dans… » tant que le cercle a moins de trois membres ; ordre de la révélation de 18h : qui avait dit quoi (cercle par cercle), puis le vote, puis les auteurs (règle 3 de `docs/produit.md` alignée sur sa section 5). Précisions de Game design retenues : à l'entrée, une devinette est juste si elle trouve le bon côté (défavorable, neutre, favorable) ; au Deviner, tous les autres membres sont proposés, y compris ceux en pause, pour ne jamais montrer qui a décroché.

Le porteur veut être impliqué dans le choix du design. L'étape 3 se fait donc en trois temps, avec un choix du porteur à chacun : l'univers (trois directions appliquées aux mêmes écrans), le nom, les maquettes finales ; le logo ensuite, avec un graphiste. Un agent Direction artistique rejoint l'équipe (`.claude/agents/direction-artistique.md`).

### D-012 — Univers : La Tablée · Décidé

Le porteur choisit l'univers **La Tablée** (`docs/maquettes/univers.html`), parmi trois proposés par la direction artistique : chaleureux, complice, posé ; « on ouvre le jeu comme on s'assoit à table avec ses proches ». Palette lin grisé, brou de noix, caramel et miel (clair) / brou, noyer, lin et miel (sombre) ; typographie Alegreya (titres) et Alegreya Sans (texte) ; visages en ronds de serviette, curseurs en halo de lampe, révélation de 18h en palette du soir avec un marque-place qui se retourne. Les trois règles communes sont retenues : aucune couleur ne distingue une position d'une autre ; « Surprise » n'est pas une erreur ; une seule teinte, jamais deux qui forment un drapeau.

**Le ton vient avec l'univers**, revalidé phrase par phrase dans les maquettes finales : message de 18h « 18h, la table est mise. Qui avait dit quoi ? … » ; verdicts « Ça alors ! », « Tu connais ton monde. », « Tu connais ton monde, et ses raisons. » ; l'invitation et « Rien à deviner aujourd'hui. » inchangés.

Risques à tester à l'étape 4 : paraître vieillot aux 15-25 ans ; faire « famille traditionnelle » (parade : une table, jamais une famille-type) ; le miel ne doit évoquer aucun parti (à vérifier).

### D-013 — Nom de travail : Elenchos · Décidé

Le porteur retient **Elenchos** comme nom de travail du jeu, de préférence aux quatre propositions (Qui dit quoi, recommandé par la direction artistique ; Devinade ; Entre nous, favori d'UX ; Tu crois ?). Il remplace « [Nom] » dans les maquettes finales. À l'étape 4 : tester la prononciation et l'écriture auprès de vraies personnes (mot grec, peu connu). Avant le logo : le porteur vérifie que le nom est libre (marques INPI et européennes, noms de domaine, boutiques, réseaux), idéalement avec un conseil en propriété industrielle. Recherche rapide faite : deux jeux de société proches du concept existent, « Devin'Emoi » et « Devine-moi ! ».

### D-014 — Maquettes finales validées · Décidé

Les maquettes finales (`docs/maquettes/maquettes-finales.html` : les 51 écrans de D-011 dans l'univers La Tablée, nom Elenchos) sont validées. Ton : « Ça alors ! », « Tu connais ton monde. » et « Tu connais ton monde, et ses raisons. » sont validés ; **« la table est mise » est refusé** : le message de 18h garde sa forme validée, « 18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. » (et le dimanche : « … Ce soir, aussi : les titres de la semaine. »). L'étape 3 est terminée, sauf le logo, qui attend la vérification du nom (D-013) puis un graphiste.

Le porteur demande aussi que tout le travail soit poussé sur `main` sur GitHub, régulièrement : règle inscrite dans `CLAUDE.md` (chaque commit poussé sur la branche de travail et sur `main`).

### D-015 — Étape 4 : essai seul, avec des joueurs simulés · Décidé

Le porteur fait l'essai seul, avec des joueurs simulés (reprend D-007, suspendu par D-009). Conception déjà faite et relue (Game design, UX, Juridique ; Cohérence et Vérificateur) : personnages inventés au profil caché, jamais calqués sur de vrais proches ; réponses simulées écrites et scellées avant chaque coup du porteur (empreinte publiée), contrôlées à la fin par le Vérificateur ; lecture A de C-006 (D-010). Limite assumée : l'essai ne dira rien de ce que d'autres personnes comprennent ou ressentent (univers vieillot ou non, nom prononçable, couleur associée à un parti, clarté sans explication) ; ces risques seront vérifiés en bêta, à l'étape 7. Restent à trancher : le support (conversation ou page jouable), le nombre de personnages, le rythme.

### D-016 — Forme de l'essai · Décidé

Pour l'essai seul (D-015) : **une page jouable aux couleurs de La Tablée**, tirée des maquettes finales (maquette animée, pas l'application) ; **quatre personnages inventés** (un cercle de cinq avec le porteur) ; **une journée de jeu par séance**, à son rythme, sans attente de 18h (deux « dimanches » simulés aux jours 7 et 14 pour les titres). Les réponses politiques du porteur restent dans son navigateur, jamais dans le dépôt (avis Juridique) ; un bouton lui permet de copier son carnet de bilan pour le donner à l'équipe.

### C-001 — Le « pourquoi » reste cadré · Constaté

Le « pourquoi » passe uniquement par ce qui est validé : choix d'une considération parmi 4 arguments réels de députés (§2), réponse à considération masquée (§2), révélation de l'auteur de l'argument à 18h (§2). La question quotidienne « d'où vient ta conviction » reste écartée (§10). Toute proposition de « pourquoi » plus profond rouvrirait le §10 et devrait être tranchée explicitement par le porteur.

### C-002 à C-005 — Incohérences relevées dans `docs/projet.md` · Constaté, non tranché

À soumettre au porteur après validation de la vision, en QCM, une par une, avec leur origine.

- **C-002 — Taille minimale du cercle.** *Clos par D-006.* §3 : 3 à 10 membres. §2 : 3 réponses d'autres membres à attribuer, jamais la sienne. Un cercle de 3 n'a que 2 « autres ». À 4, la dernière attribution se déduit par élimination si chaque personne n'est proposée qu'une fois.
- **C-003 — Palmarès et statistiques contre lignes rouges.** *Clos par D-010.* §4 (palmarès), §6 (statistiques, « taux de lecture » d'une personne) et §8 (statistiques publiques) face au §9 : aucun classement permanent, aucun chiffre public sur ce que pensent les joueurs, aucun taux d'accord entre deux personnes. À qualifier terme par terme.
- **C-004 — Onboarding v2 et « rien ne sort du cercle ».** *Clos par D-006 (exception acceptée, lien personnel à usage unique).* §7 : l'invitée voit les réponses du créateur avant d'être membre du cercle. Tension avec le §9.
- **C-005 — « Aucune de ces raisons ».** *Clos par D-010 (« aucune » ajoutée).* §8 prévoit un taux de « aucune de ces raisons » dans le suivi statistique ; l'écran 2 (§2) ne propose que 4 considérations, sans cette option.

### C-006 — Chronologie de la révélation de 18h · Clos par D-010 (lecture A)

Le §2 liste en une seule « révélation commune à 18h » quatre éléments (attributions justes/fausses, résultat du vote à l'Assemblée, auteur du texte, auteur de l'argument choisi) sans dire sur quel texte porte chacun. Un texte ouvert à 18h le jour J est déposé jusqu'à 18h J+1 et deviné de 18h J+1 à 18h J+2 ; ses attributions ne peuvent donc être révélées qu'à 18h J+2. Deux lectures pour le vote, l'auteur du texte et l'auteur de l'argument :
- **(A)** révélés à 18h J+2 avec les attributions, tout sur le même texte ; rien n'est connu pendant qu'on devine (appui : §1, mot « commune ») ;
- **(B)** révélés à 18h J+1 à la clôture des dépôts, les attributions 24h plus tard ; le vote et le groupe des arguments sont déjà connus pendant qu'on devine (appui : §7 « révélation solo chaque soir », §8 « avant 18h, seul le lien »).

L'explication de la vision suit (A). Avis du game design : (A), nettement ; sous (B), l'auteur du texte et son groupe sont connus pendant qu'on devine, donc on devine par camp au lieu de deviner la personne, et le rendez-vous de 18h s'étale sur deux soirs. À trancher par le porteur à l'étape des règles. Si (B) est retenu, une phrase de la vision est à ajuster.

### C-007 à C-016 — Manques du produit révélés par la préparation de l'essai · Constaté, non tranché

Relevés par Game design, Cohérence et UX en écrivant la simulation de l'essai (`docs/essai/simulation.md`). L'essai les règle par convention, sans rien décider pour le produit ; ils seront soumis au porteur au bilan de l'étape 4.

- **C-007 — Phrase du jour quand la réponse ne fait pas passer une valeur avant l'autre.** `produit.md` (§2, « Ton portrait ») et les écrans 1.13, 2.5 et 5.10 ne donnent que la forme « tu as fait passer X avant Y » ; la règle 18 prévoit la phrase sans en fixer la forme. Rien n'est prévu pour une réponse neutre, une raison hors tension ou « aucune », ni une raison qui sert le pôle opposé à la position.
- **C-008 — Phrase de la semaine sans curseur net.** La règle 18 de `produit.md` dit que la phrase du dimanche porte « sur une tension devenue nette ». Or il faut environ trois mois pour les premiers curseurs nets (règle 18, écran 4.1) : pendant une douzaine de dimanches, l'écran 3.3e n'a rien à dire. La maquette 3.3e elle-même (dimanche 6 avril, un mois après l'entrée de Marie le 4 mars) montre déjà un curseur net.
- **C-009 — Réponses « inattendues » tant que le curseur de l'auteur est flou.** La règle 8 choisit deux réponses « parmi les plus inattendues de la part de leur auteur » (`projet.md` §2 : « où la personne s'écarte de son profil »). Les premiers mois, aucun profil n'est net, et rien ne dit ce qui est inattendu de la part de quelqu'un dont on ne sait encore presque rien.
- **C-010 — Deux réponses identiques à deviner.** Deux membres peuvent donner exactement la même réponse (même position, même raison). La règle 8 ne dit ni s'il faut servir ces deux cartes ensemble, ni comment compter l'attribution.
- **C-011 — Révélation d'une carte à raison cachée mal devinée.** La règle 10 et l'écran 2.7b ne dessinent que le cas où la personne et la raison sont justes. Ne sont fixés ni l'affichage de la vraie raison quand la devinette est fausse, ni le verdict quand la personne est juste et la raison fausse, ou l'inverse.
- **C-012 — Message de 18h un jour sans révélation.** Le §5 prévoit un seul message, le même pour tout le cercle : « La révélation d'hier t'attend, et la question d'aujourd'hui. » Son texte n'est pas fixé pour les jours où il n'y a rien à révéler : lendemain du lancement d'un cercle, cercle à deux ou endormi (écrans 1.13 et 5.10 : « rien à révéler à 18h, seulement un nouveau texte »).
- **C-013 — Égalités et minimums des titres de la semaine.** Le §4 donne un seul titulaire au Devin et au Mystère (D-010 n'a changé que Le Fidèle). La règle 12 ne départage Le Devin que par les raisons cachées et ne départage pas Le Mystère. Elle ne fixe pas non plus de minimum (Mystère sur une seule tentative, Devin à zéro point), ni le sort des passes pour « le texte qui a le plus trompé le cercle ».
- **C-014 — Le Sans-Faute : raison cachée et jours sans carte.** La règle 14 dit « sept jours sans erreur ni passe ». Deux choses ne sont pas fixées : une raison cachée mal devinée, avec la bonne personne, est-elle une erreur ? Un jour sans rien à deviner interrompt-il la série ?
- **C-015 — Libellés courts des pôles dans les phrases.** Les phrases raccourcissent certains pôles (« la liberté » pour Liberté individuelle) et en gardent d'autres en entier (« la solidarité collective », écran 1.13). Aucun libellé n'existe pour Local ↔ National ni pour les autres tensions. La liste est à fixer pour les huit tensions.
- **C-016 — Rouvrir une révélation, toucher son propre visage.** Les maquettes disent que la croix de la révélation ramène à Aujourd'hui (écran 2.7a), mais ni `produit.md` ni les maquettes ne disent comment rouvrir une révélation fermée avant la fin, ni ce que fait un toucher sur son propre visage dans Le Cercle.

### Points ouverts du §11 — toujours ouverts

(1) Web ou application : **tranché, D-005** · (2) Onboarding : **tranché, D-006** (`docs/onboarding.md`) · (3) Modèle économique · (4) Juridique · (5) Mortalité du cercle : **tranché, D-010** · (6) Plafond d'attributions : **tranché, D-010** · (7) Surcouche 2027 · (8) Étapes suivantes (la partie technique « iOS puis Android » est remplacée par D-005). Les autres restent ouverts.
