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

### D-017 — Essai : appareil et carnet · Décidé (5 octobre 2026)

Le porteur jouera l'essai sur **un iPhone ou un iPad** : l'équipe vérifie avant de lui donner la page que Safari garde bien l'avancement (une page-test d'abord, voir `docs/essai/simulation.md`, §8.8 et contrôle 14). Son **carnet de bilan reste dans la conversation** : le dépôt, public sur GitHub, ne reçoit que le bilan chiffré qui en est tiré, sans dates ni heures. L'accès aux sites de l'Assemblée nationale (data. et www.assemblee-nationale.fr) est ouvert dans l'environnement.

### D-018 — Modèle des agents · Décidé (5 octobre 2026)

Le porteur laisse l'orchestrateur choisir le modèle de chaque agent. Règle appliquée par l'orchestrateur, qui peut l'ajuster en le disant : ce qui produit (rédaction, conception, correction, fabrication) tourne sur le modèle de la session principale (Claude Opus 5.5) ; ce qui vérifie (Cohérence, Vérificateur, vérifications du contenu, annotations à l'aveugle, relevés faits en double) tourne sur Claude Fable 5.1, le modèle le plus capable, différent à la fois du producteur et de la session principale (D-001 tenu). Un modèle plus petit seulement pour une tâche mécanique, sans jugement. Un agent coupé par une limite d'utilisation est relancé quand elle se lève, jamais remplacé en silence par un modèle moins capable.

### D-019 — Où jouer l'essai : sur iPhone, depuis une icône de l'écran d'accueil · Décidé (5 octobre 2026)

Le test de mémoire a montré que, sur iPhone, une page affichée dans claude.ai perd tout quand l'application se ferme (le moteur d'Apple, commun à tous les navigateurs de l'iPhone, efface la mémoire d'une page affichée dans le cadre d'un autre site). Le porteur choisit, sur l'avis concordant de Front-end et de Juridique : la page de l'essai est publiée sur GitHub Pages depuis son dépôt (`ppcrepin.github.io/elenchos/essai/`), avec une demande de non-référencement ; il l'ajoute une fois à l'écran d'accueil de son iPhone (ou iPad), joue toujours depuis cette icône et ne la supprime pas avant la fin de l'essai.
- D-016 tenu : les réponses restent dans l'appareil, la page n'envoie rien. D-017 précisé : c'est l'icône de l'écran d'accueil (moteur de Safari) qui garde l'avancement.
- Une page-test publiée à la même adresse le vérifie d'abord (première ouverture, une minute après fermeture, le lendemain). Si la mémoire ne tient pas, il restera la même page ouverte sur un ordinateur, ce qui modifierait D-017 (nouvelle question).
- Ce choix vaut accord pour la publication et pour une branche `gh-pages`, poussée à part et jamais fusionnée dans `main` : exception à la règle de poussée de `CLAUDE.md`.
- Le geste d'ajout ne sert qu'à l'essai ; il ne décide rien du choix « lien ou application » pour le jeu (D-005, suspendu).
- Écartés : jouer sur ordinateur dans claude.ai (aurait modifié D-017) ; garder les réponses sur claude.ai (aurait modifié D-016).

### D-020 — Points d'étape pendant la fabrication · Décidé (6 octobre 2026)

Le porteur trouvait que l'orchestrateur déroulait la fabrication sans le prévenir. Il choisit :
- un point d'étape court à chaque jalon franchi (relecture finie, scellement, page finie, vérifications, livraison), et tout de suite si un choix important se présente ;
- pendant un point d'étape, les tâches déjà lancées se terminent ; rien de nouveau ne démarre avant son « on continue ».
- Précise la règle « Tenir le porteur au courant » de `CLAUDE.md` (deux lignes au début de chaque étape, puis n'écrire que pour livrer), qui laissait de longues plages sans nouvelles.
- Écartés : un point toutes les deux heures ; un point à chaque rapport d'agent ; tout arrêter net pendant un point ; continuer sans attendre.

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
- **C-016 — Rouvrir une révélation, toucher son propre visage.** Les maquettes disent que la croix de la révélation ramène à Aujourd'hui (écran 2.7a), mais ni `produit.md` ni les maquettes ne disent comment rouvrir une révélation fermée avant la fin, ni ce que fait un toucher sur son propre visage dans Le Cercle, ni comment ouvrir la révélation sans passer par le message de 18h (l'écran 2.5 ne mène qu'à 2.6).

### C-017 à C-021 — Manques relevés en préparant les textes de l'essai et le plan de construction · Constaté, non tranché (5 octobre 2026)

À soumettre au porteur au bilan de l'étape 4, avec C-007 à C-016.

- **C-017 — Le vote daté dans le produit.** `produit.md` (« le vote », écrans 2.7d et 5.4) ne prévoit ni la date ni l'étape du vote. Or la plupart des textes du jour seront des premières lectures : « Texte adopté. » seul ferait croire à une loi en vigueur. L'essai règle le cas par convention (simulation §7.9 : ligne datée, au passé, avec l'étape) ; pour le produit, Back-end propose de garder le fait de procédure (lecture, chambre, date) et d'en tirer la phrase. Relevé par UX et Back-end.
- **C-018 — Une personne présente dans deux de mes cercles.** Les règles ne disent pas dans quel cercle elle m'est proposée à deviner (une personne n'est proposée qu'une fois par jour). Relevé par Back-end.
- **C-019 — Tempéraments par cercle ou pour toute la personne.** L'Original et Le Pont dépendent du cercle, mais l'écran Moi n'en affiche qu'un. Relevé par Back-end.
- **C-020 — Heure de référence.** Rien ne dit ce que devient une réponse commencée avant 18h et validée après, ni quelle heure vaut pour un joueur qui vit hors de France. Relevé par Front-end.
- **C-021 — Chiffres sur les choix des joueurs.** `projet.md` §8 prévoit un suivi du « taux de choix par option » et du taux de « aucune » pour surveiller les biais du contenu ; `produit.md` §8 (D-010) limite les mesures à ce que les joueurs font, « jamais sur ce qu'ils pensent » ; le §9 interdit tout chiffre public sur ce que pensent les joueurs. Positions : Back-end ne le prévoit pas par défaut ; Contenu propose des chiffres internes, regroupés par texte, jamais publiés ; Juridique : internes seulement, jamais publics, même dans le registre de méthode (en campagne, un chiffre public pourrait être lu comme un sondage) ; Contenu demande l'avis de Juridique (données sensibles).

### C-022 à C-025 — Manques relevés en préparant la fabrication de l'essai · Constaté, non tranché (5 octobre 2026)

À soumettre au porteur au bilan de l'étape 4, avec C-007 à C-021. Pour l'essai, une convention les règle (`docs/essai/simulation.md`, §7.1, §7.2, §7.10) ; pour le produit, rien n'est décidé.

- **C-022 — Mandat et groupe de l'auteur d'un texte.** À quel moment les prendre (dépôt ou vote) et sous quelle forme les écrire (sigle ou nom). L'essai prend le dépôt et le libellé court imprimé par l'institution ; un groupe d'une législature passée peut donc s'afficher. Relevé par UX.
- **C-023 — Les textes d'entrée dans l'Historique.** Les trois textes d'entrée (D-006) n'ont pas de jour ; l'essai ne les met pas dans l'Historique (5.3). Relevé par UX.
- **C-024 — Où vit Le Sans-Faute après son annonce.** Le badge rare n'a pas de place dans les écrans 4.2, 4.3 ni 5.2 ; l'essai ne le montre qu'en 3.2 et dans le carnet. Relevé par UX.
- **C-025 — Deux membres avec le même pseudo.** Rien n'empêche qu'un pseudo soit celui d'un autre membre du cercle ; l'essai refuse seulement les prénoms des quatre personnages. Relevé par UX.

### C-026 — Le Pas de Côté : règle incomplète · Constaté, non tranché (6 octobre 2026)

À soumettre au porteur au bilan de l'étape 4, avec C-007 à C-025. La règle 14 de `produit.md` (« une réponse contre son propre curseur, alors que ce curseur est déjà net ») ne dit ni quel curseur (avant ou après la réponse), ni quelles réponses, ni quels membres sont regardés. Sans effet sur l'essai : aucun curseur ne peut y devenir net (`docs/essai/simulation.md`, §5.4). Relevé par Front-end et Game design en préparant la fabrication.

### D-021 — Questions de ressenti du bilan sans option recommandée · Décidé (8 octobre 2026)

Exception à la règle de D-001 (« option recommandée en premier »), demandée par UX, relue par Cohérence et le Vérificateur. Le porteur accepte que les questions de ressenti et de fait du bilan de l'essai soient posées en QCM sans option recommandée : sur un ressenti, l'équipe n'a pas d'avis à donner, et une recommandation soufflerait la réponse à l'unique répondant. La règle reste entière pour toutes les autres questions, y compris les décisions du bilan. Portée : ce bilan ; pour d'autres questions de ressenti (bêta), la question sera reposée. Les options suivent un ordre neutre fixé d'avance (échelles dans l'ordre naturel ; réponse confortable jamais en tête ; « Rien » ou « Nulle part » en dernier).

### C-027 — Deux-points en série · Constaté, non tranché (7 octobre 2026)

À soumettre au porteur au bilan de l'étape 4, avec C-007 à C-026. Quand le titre d'un texte contient un deux-points, des lignes comme « {titre} : {position} » en alignent deux. Conforme aux maquettes validées (D-014), mais lourd. Relevé par UX en relisant les textes affichés de la page de l'essai (contrôle 11) ; sans effet sur l'essai, qui garde les gabarits validés.

### D-022 — Clarté de la journée : rien ne change avant la bêta · Décidé (8 octobre 2026)

Question 1 de `docs/essai/questions-du-bilan.md` (point 24). Après le bilan, le porteur a jugé l'écran Deviner « pas forcément très clair », et la frontière entre son avis (Répondre) et ce qu'il devine des autres (Deviner) peu « fluide » (`docs/essai/bilan.md`, section 5 et 8.3 c). Options soumises : redessiner la journée et l'entrée sans changer les règles (recommandé par UX) ; redessiner en mettant Répondre d'abord (jugé défendable par Game design) ; corriger quelques phrases ; attendre la bêta. **Décision : attendre la bêta.** Les maquettes de la journée et de l'entrée (D-011, D-014) restent telles quelles ; le retour du porteur reste noté. La clarté de la journée sera observée en bêta, sur ce que font les joueurs (part des nouveaux qui finissent leur premier Deviner, sa durée, cartes passées la première semaine) et par le questionnaire. Ce que le dossier renvoyait à cette question (le mot « Valider », règle R10) passe à l'étape 6. Les petites règles d'écran décidées ailleurs (la ligne qui dit la règle de Deviner, D-024) ne sont pas un redessin.

### D-023 — Le nouveau venu : rien de plus · Décidé (8 octobre 2026)

Question 2 de `docs/essai/questions-du-bilan.md` (point 4, question principale du bilan, 8.1 a). Options soumises : faire deviner au nouveau venu ses nouveaux proches sur un texte d'entrée (recommandé par Game design) ; la même chose dans les deux sens (préféré par UX) ; un rappel de ce qu'on sait d'un proche dans Deviner ; rien de plus. **Décision : rien de plus.** On compte sur ce que les proches savent les uns des autres ; D-006 et `docs/onboarding.md` ne changent pas. En bêta, la justesse des nouveaux venus pendant leurs premières semaines est suivie (mesure interne) ; si elle reste au niveau du hasard, la question reviendra. Le porteur avait dit, après le bilan, qu'avec de vrais proches il aurait eu du plaisir à deviner.

### D-024 — Deux proches avec la même réponse : le jumeau compte juste · Décidé (8 octobre 2026)

Question 3 de `docs/essai/questions-du-bilan.md` (piste 2 du porteur, avec C-010). Options soumises : le jumeau compte juste (recommandé par Game design) ; la règle actuelle, dite à l'écran (UX y était favorable) ; plusieurs visages par carte (idée du porteur). **Décision : le jumeau compte juste.** Le geste ne change pas : une carte, un visage, chaque visage une fois (règle 8, D-006). Désigner sur une carte un proche qui a donné exactement la même réponse (même position, même raison) compte juste, et la révélation le dit (« Paul avait répondu la même chose. »). L'écran Deviner dit la règle (mots : UX). Précise les règles 11 et 12 (D-010) : poser un jumeau n'est ni une erreur ni une surprise (Le Mystère, « Ses surprises »). Modifie, pour ce seul cas, le « jamais » de la maquette 2.7c (D-014 : « Les réponses que Marie n'avait pas à deviner ») : Marie apprend la réponse de Paul seulement si elle l'a désigné ; à dire au joueur dans « Qui, durée, droits » (Juridique). Clôt C-010, avec la règle R4 du dossier pour les cartes identiques servies ensemble (soumise au bloc de détail).

### D-025 — L'avis du cercle à la révélation : la répartition, en graphique de jugement majoritaire · Décidé (8 octobre 2026)

Question 4 de `docs/essai/questions-du-bilan.md` (piste 1 du porteur), puis sa précision. **Décision : à 18h, la révélation montre l'avis du cercle sur le texte révélé**, par la ligne « Ton cercle, lui, l'aurait adopté. » (ou « rejeté », ou « était partagé ») et par un graphique de jugement majoritaire : la part de chaque position dans le cercle, la mention du milieu marquée. Au premier envoi, le porteur a répondu « Le vote du cercle, avec un joli graphique de jugement majoritaire » ; à la précision, entre la mention seule mise en valeur sur l'échelle (recommandée), la répartition complète et la ligne seule, il a choisi la répartition complète, en sachant ce qu'elle touche.

**Ce que cette décision modifie, explicitement :**
- la ligne rouge « Aucune mise en scène du désaccord » (`projet.md` §9), assouplie pour ce graphique : dans un cercle de trois à cinq, une répartition se lit nom par nom (« tu es le seul défavorable ») ;
- D-010, point 3 (« quand un proche décroche, rien de visible ») : le total des réponses peut dire qu'un membre n'a pas répondu ;
- la règle 10 (ce qui tombe à 18h, D-010) ;
- les « jamais » des maquettes 2.7d (« Le décompte des positions dans le cercle ») et, à cinq membres et plus, 2.7c (« Les réponses que Marie n'avait pas à deviner ») (D-014).

**Positions de l'équipe, pour mémoire :** Game design recommandait la ligne seule ; UX préférait ne rien montrer ; Juridique et Back-end écartaient la répartition. Juridique, franchement : aucun texte ne l'interdit, mais l'analyse d'impact devra justifier de montrer plus que la mention (minimisation, RGPD art. 5.1.c et 25) ; c'est un risque à faire lever par l'avocat avant le lancement.

**À faire avant la bêta :** la forme (UX et Direction artistique ; une seule teinte, D-012) ; un seuil minimal de réponses et ce qui s'affiche en dessous (Game design, Juridique ; trois réponses selon Game design et Juridique, six selon UX) ; l'information du joueur avant sa première réponse et l'analyse d'impact, dont le cas d'un adolescent dans un cercle familial (Juridique) ; l'avis de l'avocat. Rien ne sort du cercle : le graphique n'additionne jamais plusieurs cercles (§9, §10).

### D-026 — Voir son portrait avancer : une barre comptée en réponses · Décidé (8 octobre 2026)

Question 5 de `docs/essai/questions-du-bilan.md` (piste 3 du porteur, avec C-008). Options soumises : des étapes nommées sans chiffre (recommandé par Game design) ; une barre comptée en réponses ; rien de plus ; un compte à rebours en jours. **Décision : une barre qui avance à chaque réponse, sans date, qui ne recule jamais**, jusqu'aux premiers curseurs nets. Elle est propre au joueur, comme son portrait : visible par le cercle, elle deviendrait un classement (`projet.md` §9).

**Ce que cette décision modifie :** les « jamais » des maquettes 1.7 (« Un chiffre sur le portrait »), 4.1 (« Un chiffre, un axe gradué ») et 5.11 (« Un chiffre, un pourcentage de remplissage ») (D-014) ; le rythme de dévoilement du portrait (`projet.md` §5) et l'écran du portrait pas encore formé (règle 18, D-010).

**Reste à régler (Game design et UX, étape 6) :** ce que la barre annonce au bout. Game design objecte qu'une barre en réponses promet une découverte qui peut ne pas venir à qui répond souvent au centre (Le Mesuré, règle 13) ; UX et Game design avaient écarté la barre au nom des « jamais » ci-dessus. Le seuil des trois mois ne change pas (son réglage fin se fait à l'étape 6). La phrase du dimanche sans curseur net (C-008) est réglée par la règle R2 du bloc de détail.

### D-027 — Chiffres internes sur les réponses : seulement la part de « aucune » · Décidé (8 octobre 2026)

Question 6 de `docs/essai/questions-du-bilan.md` (C-021). Options soumises : seulement la part de « aucune » (arbitrage de l'orchestrateur : point commun de Juridique, Contenu et Back-end) ; aussi le poids des raisons (Juridique, Contenu ; Back-end contre) ; aucun chiffre (Back-end). **Décision : pour repérer un texte ou des arguments mal écrits, l'équipe compte seulement, texte par texte, la part de réponses « aucune des quatre raisons ».** Rien sur les positions ni sur les raisons choisies.

**Garde-fous (Juridique, Back-end) :** comptée après la révélation du texte, sur tous les joueurs à la fois ; jamais par cercle ni par personne, jamais croisée avec une autre donnée ; rien sous un seuil minimal de réponses (par exemple 30, fixé dans l'analyse d'impact) ; seuls les comptes sont gardés ; lue par le porteur et Contenu seulement ; un seul usage, écrit dans les conditions d'utilisation ; **jamais publiée**, ni au registre de méthode ni ailleurs (§9). Une phrase dans « Qui, durée, droits » (D-006) ; l'avocat dira si un accord séparé est nécessaire.

**Ce que cette décision modifie :** `produit.md` §8 (D-010, mesures « jamais sur ce qu'ils pensent ») reçoit une exception limitée à la qualité des textes ; `projet.md` §8 perd le « taux de choix par option ». Clôt C-021.

### D-028 — Adoptés et rejetés : au moins un tiers de chaque · Décidé (8 octobre 2026)

Question 7 de `docs/essai/questions-du-bilan.md` (bilan 8.1 d, avec les chiffres de Contenu sur deux ans de scrutins publics, recomptés). Options soumises : au moins un tiers de chaque (recommandé par Contenu) ; le rejet rare ; aucune règle (préféré par UX). **Décision : sur quatre semaines glissantes, les textes adoptés et les textes rejetés font chacun entre un tiers et deux tiers des textes servis, dans un ordre tiré au hasard.** La règle passe après l'équilibre entre groupes et les quotas par commission ; elle est publiée au registre de méthode, avec le mélange réellement servi (chiffres sur le contenu, jamais sur les joueurs). Règles d'application de Contenu : une motion de rejet adoptée par les partisans du texte pour un motif de procédure ne compte pas comme un rejet ; au moins un texte rejeté parmi les trois textes d'entrée (précise D-006). Complète `projet.md` §8 ; question posée avant l'étape 5 (choix 4), parce que l'avis du cercle (D-025) en dépend. Elle suppose que seuls des textes déjà votés soient servis (règle E11, soumise au bloc de détail).

### D-029 — Le message de 18h continue pendant une pause · Décidé (8 octobre 2026)

Question 8 de `docs/essai/questions-du-bilan.md` (relevée par UX et Game design, hors des constats). Options soumises : le message continue (arbitrage de l'orchestrateur, qui suit UX et l'avis du Vérificateur) ; le message s'arrête (Game design). **Décision : un joueur en pause (règle 5, sept jours sans réponse) continue de recevoir le message de 18h**, le même que tout le cercle, qui ne dit rien de son absence ; il peut le couper dans Réglages. Précise D-010, point 3 : « aucune relance » vise tout message qui parlerait de l'absence ; le message quotidien n'en est pas un.

### D-030 — Les vingt-trois règles de détail du bilan · Décidé (8 octobre 2026)

Troisième envoi de `docs/essai/questions-du-bilan.md`. **Décision : les règles R1 à R12 et E1 à E11 du dossier s'appliquent au produit**, telles qu'elles y sont écrites, avec deux ajustements dus aux réponses précédentes : R2 (phrase du dimanche) n'annonce pas d'étape franchie, puisque D-026 retient une barre ; le mot « Valider » (R10) est renvoyé à l'étape 6, puisque D-022 garde la journée telle quelle. Les règles qui touchent une décision validée le disaient (« touche ») : R7 (écrans 4.2, 5.2, 5.5), R8 (exception à D-011 : le visage d'un proche servi dans un autre de mes cercles n'est pas proposé), R9 (écran 4.1), E1 (notes des maquettes 1.13 et 5.10, plus récentes que `docs/onboarding.md`, écartées au profit de l'onboarding et de la règle 10 ; `produit.md` §5 ; D-011), E4 (écrans 2.7d, 1.6, 5.4), E7 (`projet.md` §3 : pseudo unique dans chaque cercle ; écrans 1.15, 4.2, 5.9), E10 (écrans 4.2, 4.3, 1.7), E11 (`projet.md` §8 : seulement des textes déjà votés). Les désaccords nommés dans le dossier restent notés là.

**Constats clos :** C-007 (R1), C-008 (R2, avec D-026), C-009 (R3), C-010 (D-024 et R4), C-011 (R5), C-012 (E1), C-013 (R6), C-014 et C-024 (R7), C-015 (E2 ; les libellés des quatre tensions jamais essayées se confirment à l'étape 6), C-016 (E3), C-017 (E4 ; les voix sous le vote restent à trancher à l'étape 6), C-018 (R8), C-019 (R9), C-020 (R10, avec la manche laissée en cours, bilan 8.1 e), C-021 (D-027), C-022 (E5), C-023 (E6), C-025 (E7), C-026 (R11), C-027 (E8). Les « interprétations à confirmer » de l'essai sont reprises (R12), sauf celles que R4, R7, R10 et R11 ajustent.

**Renvoyé à plus tard :** un joueur déjà inscrit qui rejoint un autre cercle rejoue-t-il trois textes d'entrée (étape 6) ; les voix sous le vote (étape 6) ; un test de lecture de la journée par trois à cinq personnes extérieures au projet (à voir avec la décision de continuer, d'ajuster ou d'arrêter, D-008). Correction sans question, à faire avec la mise à jour du produit : `docs/produit.md` écrit encore « Le Mesuré … (nom proposé) » et « à confirmer », alors que D-010 l'a validé.

**Précision (8 octobre 2026, pas une décision du porteur) :** R10 laissait à Game design le soin de confirmer la lecture d'UX sur la manche jamais ouverte. Game design la confirme : une manche dont l'écran Deviner ne s'est jamais affiché n'a pas de cartes, et sa révélation commence au vote. Reporté dans `docs/produit.md`, règle 10.

### D-031 — Après l'essai : ajuster, par un second essai joué seul avec des joueurs simulés · Décidé (8 octobre 2026)

Décision que D-008 réservait au bilan (`docs/essai/decision-fin-essai.md`). Options soumises : ajuster par un essai de plus (recommandé) ; continuer tel quel vers l'étape 5 ; arrêter. Puis, pour la forme : une soirée sur papier avec quelques proches et un test de lecture par des personnes extérieures (recommandé), l'une ou l'autre seule. **Le porteur choisit d'ajuster**, et précise pour la forme : « Je veux uniquement un test sur moi et des utilisateurs virtuels pour l'instant. » (Il n'avait pas compris la seconde question.)

**Décision : l'étape 4 se prolonge par un second essai, joué par le porteur seul, avec des joueurs simulés**, dans la ligne de D-007 et D-015. La soirée avec de vrais proches et le test de lecture par des personnes extérieures ne sont pas retenus pour l'instant ; ils restent possibles plus tard. Ce que ce second essai essaie, et comment, sera proposé au porteur (circuit complet) avant toute fabrication. Limite, dite franchement : avec des joueurs simulés, le plaisir de deviner de vrais proches reste hors de portée de l'essai ; seuls de vrais proches pourront le montrer.

### D-032 — Second essai : une semaine de jeu, à son rythme · Décidé (8 octobre 2026)

Question de `docs/essai/essai-2-proposition.md` : « Comment voulez-vous jouer le second essai ? » Options soumises : deux semaines au rythme du jeu, un jour de jeu par vraie journée, révélation à 18h (recommandé) ; trois semaines au rythme du jeu ; à son rythme, les quatorze jours de jeu enchaînés. **Le porteur répond, hors des options : « Seulement une semaine, rythme instantané pour tester rapidement. »**

**Décision : le second essai dure une semaine de jeu (sept jours de jeu, un dimanche), enchaînés quand il le veut, sans attendre 18h**, comme au premier essai : le rythme de D-016 est tenu. Le cadre commun aux trois formes s'applique tel que la proposition le décrit : les mêmes quatre personnages, leur profil rappelé au début (touche D-015, comme le disait la proposition) ; pas de nouvelle entrée, portrait reparti de zéro ; des textes nouveaux, jamais joués, dont au moins un tiers de rejetés sur le lot (D-028) ; « Jour suivant » refait (actif seulement une fois la journée finie ; sauter un jour passe par un lien à part, qui dit ce qu'on perd) ; carnet : le moment préféré chaque jour, deux questions le dimanche, quelques questions à la fin ; l'avis du cercle dès trois réponses (convention d'essai, rien n'est décidé pour le produit) ; D-016 pour les données, D-017 et D-019 reconduits ; « Tout effacer » la partie du premier essai avant de commencer.

**Limites, dites franchement** (proposition, forme 3 et « Écartés ») : l'essai n'éprouve ni le rendez-vous de 18h, ni la journée vécue jour après jour, ni la barre comme raison de revenir ; une seule semaine, un seul dimanche, et la nouveauté couvre tout ; en une semaine, la barre bouge à peine. Il montre les règles du 8 octobre en jeu, et ce que c'est de deviner des personnages qu'on connaît. Le délai de préparation et le nombre de textes sont fixés par la spécification de l'essai, qui passe par le circuit complet avant toute fabrication.

### D-033 — Second essai accéléré : trois jours joués, deux sauts, portrait accéléré · Décidé (9 octobre 2026)

Après D-032, le porteur a demandé d'aller plus vite : jouer deux ou trois jours « comme si j'arrivais pour la première fois », puis des raccourcis pour voir « ce qui se passe au bout d'une semaine, deux semaines », « par exemple la hiérarchie des valeurs ». Proposition : `docs/essai/retours-du-8-octobre.md`, partie 1 (Game design, avec UX, Front-end, Juridique, Contenu). Question posée : le portrait du porteur au second dimanche. Options soumises : accéléré (recommandé) ; au rythme du jeu ; complété jusqu'à trois mois par des réponses simulées. **Le porteur choisit le portrait accéléré**, et valide par là la forme décrite (la question le disait).

**Décision : le second essai dure deux semaines de jeu, dont trois jours joués, puis deux sauts à des points fixes jusqu'au premier, puis au second dimanche.** Le porteur entre en nouveau venu (l'entrée de D-006, défi de Valentin) dans le cercle « Amis », qui joue depuis trois mois ; pendant les sauts, il répond lui-même, d'affilée, aux textes sautés, sans deviner ; les personnages jouent en arrière-plan. **Son portrait est accéléré** : tiré de ses seules réponses, il avance environ six fois plus vite que dans le jeu, et la page le dit. Remplace D-032 sur la durée, l'entrée (qui revient), le rappel des profils (remplacé par Le Cercle) et le nombre de dimanches (deux) ; le reste de D-032 tient (mêmes personnages, textes nouveaux, rythme sans attente, données dans l'iPhone, « Tout effacer » le premier essai). Touche D-016 (un saut fait plusieurs jours en une séance), D-015 (l'histoire du cercle est scellée d'avance), D-026 dans l'essai seulement (la barre arrive au bout et reste pleine, sans texte ; le produit ne change pas). Rouvre, pour l'essai, le « portrait accéléré » que la proposition du second essai avait écarté. Préparation annoncée : au moins sept à huit jours avant le premier jour.

**Limites, dites franchement** : la hiérarchie repose sur peu de réponses, données en partie d'affilée ; un portrait net en deux semaines peut faire paraître trois mois longs, sans dire si un portrait aussi rapide serait juste pour de vrais joueurs ; rien du rendez-vous de 18h ni du temps vécu.

### D-034 — Les raisons : quatre, plus nuancées · Décidé (9 octobre 2026)

Retour du porteur : quatre raisons, « pas assez nuancé », liées visiblement à favorable ou défavorable ; cinq ou six s'ils tiennent sur un écran. Proposition : `docs/essai/retours-du-8-octobre.md`, partie 2 (Game design, avec UX, Contenu, Front-end). Constats : six raisons ne tiennent pas proprement sur un écran d'iPhone (UX, Front-end, estimations) ; trois vrais arguments de chaque côté sont rares dans les débats (Contenu, comptes recomptés) ; au premier essai, aucune raison ne défendait son côté au nom de l'autre valeur. Options soumises : quatre, plus nuancées (recommandé) ; six, trois de son côté ; rien ne change. **Décision : toujours quatre raisons, deux de chaque côté, mais de chaque côté l'argument attendu et un argument inattendu (au nom de l'autre valeur, ou pratique), quand le débat en offre.** Aucune décision modifiée (projet §2 et règle 7 tiennent) ; changent les conventions de Contenu (choix des raisons, au plus deux hors tension) et la règle de choix des personnages de l'essai. Condition d'UX : un argument inattendu doit se lire tout de suite du bon côté (vérifié par l'annotation à l'aveugle). Règle interne à fixer avec Contenu : un argument inattendu de chaque côté, ou aucun. Ne répond pas à la demande de plus de raisons à l'écran : dit au porteur. Le portrait avance moins vite quand on prend l'argument inattendu ; de combien, inconnu (à recaler à l'étape 6, D-026).

### D-035 — Inscription : Google, Apple ou e-mail · Décidé (9 octobre 2026)

Retour du porteur : s'inscrire « directement via le compte Google ou Apple ». Proposition : `docs/essai/retours-du-8-octobre.md`, partie 3 (UX, Back-end, Juridique). Option non posée, le porteur ayant dit vouloir Google et Apple : l'e-mail seul, Google et Apple plus tard (D-006 tel quel). Options soumises : garder aussi l'e-mail (recommandé) ; Google ou Apple seulement. **Décision : à la création du compte, trois voies au choix, dès les premiers joueurs : Apple, Google, ou l'e-mail avec son code.** Modifie D-006, arbitrage 1 (Google et Apple passent de la phase 2 aux premiers joueurs) ; à reprendre dans `docs/onboarding.md` (étape 5) et sur les maquettes 1.8, 5.7, 5.14 à l'étape 6. Inchangés : le compte après la première révélation, le pseudo libre, la carte de consentement. Le jeu ne demande qu'un identifiant et l'adresse e-mail, jamais le nom ni la photo. Six règles de Juridique à tenir avant la bêta (dont : rien de Google ni d'Apple chargé avant le toucher ; compte Google d'organisation refusé ; suppression du compte qui coupe le lien) ; avocat. Coût : Apple, environ 99 € par an (Back-end, de mémoire) ; démarches du porteur au début de l'étape 6, au nom de qui portera le service (étape 5). À vérifier sur un vrai iPhone à l'étape 6 : la connexion depuis l'icône de l'écran d'accueil ; si elle ne tient pas, la question sera reposée. Dans le second essai, les boutons sont dessinés, sans connexion (D-016).

### D-036 — Économiser les jetons : un modèle à la mesure de chaque tâche · Décidé (10 octobre 2026)

Le porteur, en donnant son « on continue » après un point d'étape (une limite d'utilisation venait de couper quatre tâches) : « peut-être en adaptant les modèles pour ne pas consommer trop de tokens si pas nécessaire ». **Décision : le modèle de chaque agent suit ce que la tâche exige, pas un réglage unique.** Précise D-018, que l'orchestrateur applique ainsi :
- **Restent sur Claude Fable 5.1** : le Vérificateur (dernier rempart avant le porteur) et la vérification indépendante des fiches (fidélité aux débats), où une erreur atteindrait le porteur.
- **Passent sur Claude Sonnet 5.5**, modèle différent de la session principale (D-001 tenu) : Cohérence, les annotations à l'aveugle des raisons réécrites (un seul annotateur, les deux annotateurs du premier passage ayant concordé), le relevé des votes en double.
- **Restent sur Claude Opus 5.5** : la rédaction, la conception et le code de la page et des programmes.
- **Le mécanique** (comptes de caractères, comparaisons, formes) passe par des scripts plutôt que par un agent.
- **Méthode** : un agent coupé est repris là où il s'est arrêté plutôt que relancé à neuf ; briefs courts ; lectures ciblées.
L'orchestrateur le dit à chaque point d'étape où le choix d'un modèle change ce qui est vérifié. Limite assumée : un vérificateur moins capable rate davantage ; la double barrière (Cohérence puis Vérificateur sur Fable) reste en place pour tout livrable.

### D-037 — Lot du second essai gardé malgré des sujets cités en cours de route · Décidé (10 octobre 2026)

Pendant la préparation, des points d'étape de l'orchestrateur ont cité, par erreur, les sujets de plusieurs textes du lot caché et le résultat de certains votes, contre la règle qui les réserve au fichier caché. L'orchestrateur l'a dit franchement et proposé de les remplacer. **Décision du porteur : ne pas réparer, on garde le lot tel quel** (« je n'ai pas lu de toute façon les textes, donc c'est pas grave »). Limite assumée, à rappeler au bilan : le porteur a pu entrevoir des sujets ou des résultats avant de jouer. Règle de travail renforcée : dans les messages au porteur, un texte du lot n'est jamais désigné par son sujet ni par son résultat, seulement par une étiquette neutre (sa tension, son rang dans le calendrier), jusqu'au dévoilement.

### D-038 — Bilan du second essai : étiquette de la barre, repère de la journée, ordre des cartes · Décidé (11 octobre 2026)

Questions 1 à 3 de `docs/essai/bilan-2.md`, nées des trois retours oraux du porteur après le second essai (« une phrase vers tes premiers curseurs nets fait un peu bizarre en français » ; les deux petits points entre Deviner et Répondre « un tout petit peu petit » et « pas très clair » ; dans Deviner, aller « du plus simple au plus compliqué »). Maquette de la Direction artistique : `docs/maquettes/repere-deviner-repondre.html`. **Décisions :**
- **Étiquette de la barre du portrait : « Ton portrait se dessine »** (au lieu de « Vers tes premiers curseurs nets »). Vraie à tout moment, même barre pleine sans curseur net. Précise D-026 : la barre n'annonce aucune arrivée ; ce qu'elle annonce au bout reste à régler à l'étape 6 dans ce cadre. `produit.md` (règle 18, « Mon portrait ») dira cette étiquette. Options non retenues : « Ton portrait prend forme », « Tes réponses dessinent ton portrait », « Vers un premier dévoilement » (idée du porteur, déconseillée par UX : elle promet un événement qui peut ne pas venir et se confond avec la révélation).
- **Repère de la journée : option A, « deux étapes nommées »** : sous l'en-tête, deux moitiés « (1) Deviner — les réponses d'hier » et « (2) Répondre — le texte du jour », avec état en cours, fait, à venir ou rien à deviner, jamais touchable, états par la forme et la graisse (description d'UX, `bilan-2.md` section 1.2). Modifie D-014 sur les écrans 2.1, 2.3, 5.8 et 5.12 (et 2.4, 2.5 selon les mots retenus) ; **exception à D-022** pour ce seul élément, à la demande du porteur. Réserves de la Direction artistique à traiter au dessin : ronds numérotés qui rappellent un paiement en ligne ; redite avec le bandeau de 5.12 (« hier » / « aujourd'hui ») ; mots de l'état « tout fait » à relire par UX.
- **Ordre des cartes dans Deviner : la carte « qui et pourquoi » vient toujours en dernier, et son « pourquoi » se choisit après le visage.** Les deux cartes ordinaires d'abord, dans un ordre tiré au sort ; la carte à raison cachée est tirée au sort parmi les cartes servies (hors raison « aucune »), pour que sa place ne trahisse pas le classement. Une ligne s'ajoute à la règle 9 et à l'écran Deviner de `produit.md` (D-010) ; l'exemple de la maquette 2.1 change (D-014) ; **exception à D-022** limitée à cet ordre, à la demande du porteur. Non retenues : la carte en dernier sans le geste ; rien avant la bêta ; une échelle en trois marches (mécanique nouvelle). Mesure de bêta ajoutée : la part des passes sur la dernière carte.

### D-039 — Bilan du second essai : premier jour du nouveau venu, preuve du plaisir de deviner · Décidé (11 octobre 2026)

Questions 4 et 5 de `docs/essai/bilan-2.md`. **Décisions :**
- **Premier jour du nouveau venu : rien ne change, on mesure en bêta.** Le défaut est connu et dit : le jour de son arrivée, il devine des réponses à un texte qu'il n'a jamais lu (D-006, étape 6 de l'onboarding, inchangée). Les mesures prévues (`produit.md` §8 : part des nouveaux qui finissent leur premier Deviner, sa durée) le suivront. Option recommandée par UX, non retenue : le nouveau venu répond seulement et devine dès le lendemain.
- **Le plaisir de deviner de vrais proches se jugera en bêta (étape 7).** D-031 tient : pas de soirée avec de vrais proches avant la construction. Constat dit franchement : deux essais avec des personnages simulés ont donné la même réponse (justesse au niveau du hasard, « Deviner a été un passage »), et la construction se fera avant de savoir si le cœur de la promesse (D-002) plaît. Option recommandée par Game design, non retenue : une soirée courte sur papier avec quatre à six vrais proches avant la construction.
- **Fin de l'étape 4** : le second essai est joué et son bilan rendu ; restent la mise à jour de `docs/produit.md` (D-038, D-039, mesures de bêta proposées par le bilan, règle de forme du vote à confier à Contenu) et la feuille de route.

### D-040 — Un court texte qui explique le nom et fait entrer dans l'univers · Décidé (11 octobre 2026)

Idée du porteur : après la première devinette, au moment de l'inscription, un court texte qui explique le mot Elenchos (ἔλεγχος, l'examen socratique) et le principe du jeu. **Décision : l'idée est retenue ; son emplacement (l'écran du compte, après la première devinette de l'entrée, D-006, D-035) entre dès maintenant dans `docs/produit.md` ; le texte s'écrit une fois le nom vérifié (fin de l'étape 3, D-013).** Options non retenues : l'écrire tout de suite, ou ne pas l'ajouter. Le texte passera par le circuit complet (UX, Direction artistique, Cohérence, Vérificateur) et respectera la promesse (D-002) et le ton de La Tablée (D-012).

### D-041 — `produit.md` mis à jour après le second essai, propositions comprises · Décidé (11 octobre 2026)

Le porteur valide la mise à jour de `docs/produit.md` qui porte D-038 à D-040 (et aligne la ligne du compte sur D-035), **avec les propositions de l'équipe** tirées du bilan du second essai (`docs/essai/bilan-2.md`, section 12) : six mesures de bêta sur des gestes (justesse lue contre le hasard de chaque manche ; ouvertures du Cercle et de l'écran d'un proche pendant les manches et par les nouveaux venus ; part des Mystère allant à un membre arrivé depuis moins de deux semaines ; voie de compte choisie et abandons sur l'écran du compte ; durée de la première séance d'un invité ; durée médiane de l'écran de la raison, à confirmer par Juridique) et la règle « une forme n'annonce jamais le vote », confiée à Contenu à l'étape 5. Relecture : Cohérence, puis le Vérificateur (OK avec corrections mineures, appliquées). Options non retenues : valider sans les propositions ; relire d'abord. **Fin de l'étape 4** de la feuille de route.

### D-042 — Étape 5, première série : porteur, engagement, financement, budget · Décidé (11 octobre 2026)

Réponses du porteur aux quatre premiers QCM de `docs/etape-5-choix.md` (document relu par Cohérence, puis par le Vérificateur : OK avec corrections, appliquées).

1. **Choix 1 — Qui porte le service : le porteur, en nom propre.** Options non retenues : une SASU (recommandée par Juridique), une association. Conséquences écrites au document, à tenir : l'App Store est probablement fermé à une application en nom propre qui garde des données sensibles (règle 5.1.1 (ix) d'Apple, vérifiée) ; chez Google, un compte personnel doit faire tester l'application par 12 personnes pendant 14 jours avant de la publier ; la responsabilité porte sur les biens personnels ; passer plus tard à une société ou une association change le responsable des données et oblige probablement à redemander l'accord des joueurs (à confirmer par l'avocat). Le compte développeur Apple (D-035) s'ouvre à son nom au début de l'étape 6 ; contrats, marque, adresse et responsabilité éditoriale sont à son nom.
2. **Choix 6 — L'engagement « ni vente, ni exploitation, ni publicité » est confirmé, dans les conditions d'utilisation et la politique de confidentialité.** Options non retenues : écrit partout (avec clause de rachat, recommandée), société à mission, porte ouverte. Le « à confirmer » de `produit.md` §6 et la recommandation du §9 deviennent une décision. La liste fermée des usages permis (faire tourner le jeu, part de « aucune » de D-027, mesures sur les gestes, sécurité) y figure. Limite dite au porteur : une mise à jour des conditions peut affaiblir l'engagement, et rien ne lie un repreneur au-delà de la loi. D-006 (« jamais vendues ») tient.
3. **Choix 9a — Gratuit ; le porteur finance jusqu'à l'ouverture ; à l'ouverture, une contribution libre, sans aucun avantage dans le jeu.** Options non retenues : gratuit financé hors du jeu seulement, supplément payant autour du portrait. **Les cinq règles de l'argent du document sont validées avec cette réponse** (rien de ce qui fait jouer, gagner, deviner ou avancer le portrait ne devient payant ; personne dans le cercle ne sait qui paie ; jamais de demande dans le message de 18h, en relance, pendant la journée ni juste après une réussite ; ce qu'on sait de qui paie ne se croise jamais avec les réponses ; aucun argent d'un parti, d'un candidat, d'un élu, d'un groupe parlementaire ou d'un lobby, liste publique des organisations qui financent, jamais des joueurs). Elles entreront dans `produit.md` §6 à la fin de l'étape 5. Ferme le point ouvert §11.3.
4. **Choix 9b — Le budget s'engage dépense par dépense.** Options non retenues : par tranches (recommandée par Game design), enveloppe fixée maintenant. Conséquence : chaque dépense est présentée au porteur au moment où elle se présente, avec son montant estimé et ce qui en dépend ; l'équipe garde à jour la vue d'ensemble des coûts (`docs/etape-5-choix.md`, « Ce que ça coûte ») pour limiter le risque de s'arrêter à mi-chemin.

### D-043 — Étape 5, deuxième série : lien ou application, qui code, données, marque · Décidé (11 octobre 2026)

Réponses du porteur aux QCM 5 à 8 de `docs/etape-5-choix.md`.

1. **Choix 2 — Le lien d'abord, puis les deux boutiques avant l'ouverture au public : D-005 est repris tel quel et sa suspension (D-009) est levée.** Options non retenues : l'application dès la bêta, le lien seul. Précision due à D-035 : le compte développeur Apple sert dès les premiers joueurs, pour la connexion Apple sur le web. Conséquence de D-042 (en nom propre), dite dans la question : l'App Store demandera probablement une structure avant l'ouverture ; la question de la structure reviendra donc au porteur avant le chantier des boutiques, avec ce qu'elle implique pour l'accord des joueurs (à confirmer par l'avocat).
2. **Choix 3 — Des agents seuls écrivent le code ; le porteur valide en jouant et est le seul recours humain, y compris le soir.** Options non retenues : agents et un développeur (recommandée par Back-end et Front-end), un prestataire. Conséquences, à tenir dès l'étape 6 : le principe « rien ne se calcule à 18h pile » de Back-end (révélation préparée d'avance, rendue visible à l'heure ; aucune mise en ligne de 15h à 19h ni le dimanche ; alerte à 18h02 et relance d'un geste) devient une exigence ; une procédure d'incident d'une page, que le porteur peut jouer seul, est écrite avant la bêta ; le code reste « ordinaire », pour qu'un humain puisse le reprendre un jour. Limite dite au porteur : le code qui garde des opinions n'est relu que par des modèles, qui partagent une partie de leurs angles morts. Le plan de construction (partie 4, « Les branches ») est suivi dans sa branche « agents » : le recours humain des soirs, c'est le porteur.
3. **Choix 5 — Prestataires européens seulement, pour tout ce qui touche aux joueurs** (siège et contrôle de l'entreprise, pas seulement l'emplacement des serveurs). Options non retenues : mixte, américains avec serveurs en Europe. Restent hors d'Europe, inévitablement : la connexion par Apple ou Google (D-035) et l'acheminement des messages de 18h. Garantie retenue avec ce choix : aucune donnée de joueur n'est jamais envoyée à un fournisseur d'IA. Les noms des prestataires se choisissent à l'étape 6.
4. **Choix 10 — Le nom est vérifié dès maintenant par un conseil en propriété industrielle (D-013) ; la marque est déposée après la bêta.** Options non retenues : déposer avant la bêta (recommandée par Juridique), France et Europe avant la bêta. Le plan de construction (partie 3, point 10) est confirmé. Limite dite au porteur : le nom circule sans protection pendant la bêta, alors que l'adresse et l'icône sont figées avant elle. La vérification débloque le logo et le texte de D-040.

### D-044 — Étape 5, troisième série : validation des textes, fournisseurs d'IA, groupes, avocat · Décidé (11 octobre 2026)

Réponses du porteur aux QCM 9 à 12 de `docs/etape-5-choix.md`.

1. **Choix 4a — Production des textes tout automatique, avec une mention IA.** Options non retenues : un relecteur extérieur valide chaque texte (recommandée), le porteur valide chaque texte, automatique avec échantillon relu. Le §8 (« production entièrement automatisée ») tient. Conséquences : une mention visible indique que les textes sont rédigés avec une IA (emplacement à dessiner par UX à l'étape 6, à faire valider par l'avocat au regard de l'art. 50.4 du règlement européen sur l'IA) ; une procédure de correction (erratum daté au registre, texte remplacé) est rodée dès la bêta ; le porteur, en nom propre (D-042), est le responsable éditorial. Limite dite au porteur : aux deux essais, aucun lot n'est sorti de sa première vérification sans correction, et le taux d'erreur qui reste après la chaîne est inconnu ; une erreur peut atteindre un député nommé à 18h.
2. **Choix 4b — Un seul fournisseur de modèles, avec des modèles différents pour écrire et pour vérifier, comme aux essais. Modifie le §8** (« vérificateurs sur un autre fournisseur de modèle »). Options non retenues : deux fournisseurs différents (recommandée), deux dont un européen. Limite dite au porteur : le même fournisseur produit et juge, et ses modèles partagent une partie de leurs angles morts. Le « devin du vote » de la règle de forme (D-041), prévu chez un autre fournisseur, tourne chez le même ; Contenu dira à l'étape 6 si ce contrôle garde un sens. La chaîne ne reçoit jamais de donnée de joueur (D-043).
3. **Choix 4c — L'égalité entre groupes, avec une marge** : sur douze semaines glissantes, chaque groupe fournit entre deux tiers et quatre tiers de la part égale des raisons. Options non retenues : selon les sièges, un minimum par groupe. La règle ne range jamais un groupe à gauche ou à droite ; les députés non inscrits sont admis, au plus un par texte, hors du compte. Elle complète le §8 (suivi par groupe) et passe avant l'équilibre entre adoptés et rejetés (D-028). Sa faisabilité est vérifiée sur le stock réel à l'étape 6.
4. **Choix 8 — Deux relectures par un avocat spécialisé en données personnelles, délégué à la protection des données nommé avant l'ouverture.** Options non retenues : délégué dès la bêta, une seule relecture avant l'ouverture. Avant la bêta, l'avocat relit la carte de consentement, « Qui, durée, droits », les conditions d'utilisation (avec l'engagement de D-042), l'analyse d'impact en version bêta, les contrats des prestataires et les points de D-024, D-025, D-027, D-035, ainsi que la mention IA (4a) ; avant l'ouverture, une relecture complète, période électorale comprise. Avant la bêta, une décision écrite explique pourquoi un délégué n'est pas encore obligatoire ; le porteur ne peut pas être son propre délégué. Avec D-042 (dépense par dépense), chaque relecture est présentée au porteur avec son devis.

### D-045 — Étape 5, quatrième série : comptes inactifs, nom de qui part · Décidé (11 octobre 2026)

Réponses du porteur aux QCM 13 et 14 de `docs/etape-5-choix.md`. Avec D-042 à D-044, les dix choix de fabrication de l'étape 5 sont tranchés.

1. **Choix 7a — Un compte qui n'ouvre pas le jeu pendant 12 mois est effacé, après un e-mail envoyé 30 jours avant.** Options non retenues : effacé après 12 mois sans message (recommandée), après 24 mois. **Exception à D-010 (point 3, « aucune relance ») et à D-029** : c'est le seul message qui parle de l'absence, une fois, 30 jours avant l'effacement. Il dit seulement ce qui va arriver et comment l'éviter (ouvrir le jeu), sans reproche ni rappel de ce qui a été manqué ; son texte sera écrit par UX à l'étape 6 et relu par l'avocat. Touche aussi D-010 (point 3, « rien de visible ») : à l'effacement, un visage disparaît du Cercle, sans aucun message au cercle (départ selon la règle 4). La durée est annoncée dès « Qui, durée, droits » et rappelée dans les Réglages ; toute ouverture du jeu remet le compteur à zéro.
2. **Choix 7b — Quand quelqu'un quitte un cercle ou efface tout, ses titres passés restent dans l'historique du cercle sous « un ancien membre ».** Options non retenues : pseudo sauf effacement, pseudo toujours. Précise la règle 4 (D-010) et le §3 (« scores et titres figés »). Game design relira à l'étape 6 l'effet de 7a et 7b sur le Cercle et l'historique des titres.

Les autres durées de conservation du document (invité sans compte, code par e-mail, journaux, sauvegardes, mesures sur les gestes, part de « aucune », preuve du consentement) sont des propositions de Juridique, à caler dans l'analyse d'impact et à faire valider par l'avocat (D-044).

### D-046 — Documents de clôture de l'étape 5 validés · Décidé (11 octobre 2026)

Le porteur valide la mise à jour de `docs/produit.md`, `docs/onboarding.md`, `docs/plan-construction.md` et `docs/feuille-de-route.md`, qui transcrivent D-042 à D-045, avec les propositions de l'équipe qui y sont marquées « (proposé) ». Rédaction : Game design, UX, Back-end avec Front-end ; relecture : Cohérence (compatible avec réserves, corrigées), puis le Vérificateur (OK avec corrections mineures, appliquées). Option non retenue : relire d'abord. Sont consignés avec cette validation :
- **une correction de fait de D-006, arbitrage 1** : la parenthèse « Sign in with Apple alors obligatoire sur l'App Store » est inexacte ; la règle 4.8 actuelle d'Apple (vérifiée le 11 octobre 2026) demande seulement une option de connexion équivalente qui protège la vie privée. Rien ne change sur le fond : la connexion Apple est retenue dès les premiers joueurs (D-035) ;
- **la vue d'ensemble des coûts** tenue à jour (D-042, point 4) est désormais la partie 6 de `docs/plan-construction.md`, qui remplace le tableau de `docs/etape-5-choix.md` (gardé pour mémoire, aux options recommandées) ;
- **une première durée** : la construction, jusqu'à l'entrée en bêta, boutiques exclues, est un ordre de grandeur de 3 à 6 mois, à faible confiance, ni engagement ni date de sortie, à recaler après les travaux sur papier et le test du message de 18h (plan, partie 6).

**Fin de l'étape 5** de la feuille de route. L'étape 6 (construire) commence avec l'accord explicite du porteur (D-001). Démarches à son nom qui l'accompagnent : la vérification du nom par un conseil en propriété industrielle (D-013, D-043), le compte développeur Apple (D-035, D-042), le devis d'un avocat (D-044).

### D-047 — Logo et histoire du nom tout de suite ; logo final fait par l'équipe · Décidé (11 octobre 2026)

Demande du porteur, avant de construire : créer le logo et « la petite histoire autour d'Elenchos » (D-040), et connaître la plateforme de construction (proposition en cours, Back-end avec Front-end). Il signale aussi qu'il a déjà un compte développeur Apple (démarche de D-046 faite) et considère la question de l'avocat comme réglée de son côté (D-044 inchangé : deux relectures, délégué avant l'ouverture).

1. **Le logo et le texte qui explique le nom se font maintenant ; la vérification du nom par un conseil en propriété industrielle se fait en parallèle.** Options non retenues : la recherche déjà faite suffit ; le conseil d'abord. **Modifie D-013 et D-014** (« avant le logo : le porteur vérifie que le nom est libre » ; « le logo attend la vérification du nom ») **et D-040** (« le texte s'écrit une fois le nom vérifié ») : l'ordre est levé, la vérification reste due (D-043, point 4). Risque dit au porteur : les bases INPI et européennes n'ont pas été consultées par l'équipe, et une revue savante porte le nom *Elenchos* depuis 1980 ; si le conseil trouve un obstacle, logo et texte sont à refaire.
2. **Le logo final est fait par l'équipe (Direction artistique), sans graphiste.** Options non retenues : l'équipe propose et un graphiste finalise (recommandée) ; un graphiste d'emblée. **Modifie D-011 et D-014** (« le logo ensuite, avec un graphiste ») et la feuille de route (étape 3). Limite dite au porteur : un logo typographique propre est à la portée de l'équipe ; un vrai travail de graphiste, non. Le logo suit l'univers La Tablée (D-012) et ses trois règles communes (aucune couleur ne distingue une position ; une seule teinte, jamais deux qui forment un drapeau ; rien qui évoque un parti).

### D-048 — Plateforme : un hébergeur français « clé en main », Scalingo · Décidé (11 octobre 2026)

Question du porteur : « sur quelle plateforme, Supabase ou autre », puis « la plateforme qui coûte le moins cher et qui est la plus simple ». Proposition : `docs/plateforme.md` (Back-end avec Front-end), relue par Cohérence. Après une question de sa part sur la gratuité (Scalingo : essai gratuit de 30 jours sans carte, puis environ 26 € TTC par mois pour le plus petit ensemble, et au moins 41 € TTC par mois en bêta avec une base de secours ; vérifié le 11 octobre 2026), **décision : le jeu est construit chez Scalingo, hébergeur français « clé en main »** ; le repli éventuel (Clever Cloud) et les briques techniques (langage, bibliothèques, connexion écrite dans notre code, envoi direct des messages de 18h, Capacitor pour les boutiques) sont laissés à l'équipe (D-009). Options non retenues : Supabase hébergé par Supabase (le plus simple, environ 22 € par mois en bêta, mais société américaine : aurait modifié D-043) ; Supabase installé chez un hébergeur européen (entretien d'une douzaine de logiciels). **D-043 tient** (prestataires européens seulement). Chaque ouverture de compte reste présentée au porteur avec son montant (D-042). À tenir, relevé par la proposition et sa relecture : les agents n'accèdent jamais à la base réelle ni à des journaux qui contiennent des données de joueurs (précision de D-043, point 3, à faire relire par Juridique) ; en cas d'incident sur la version en ligne, c'est le porteur qui regarde.

### D-049 — Logo : la citation ; texte du nom : A, « Socrate et toi » · Décidé (11 octobre 2026)

Livrables : `docs/maquettes/logo.html` (quatre pistes, Direction artistique) et `docs/histoire-du-nom.md` (trois propositions, UX et Direction artistique), relus par Cohérence puis par le Vérificateur (OK avec corrections mineures, appliquées).

1. **Logo : la piste 2, « La citation »** — les guillemets d'Alegreya autour d'un rond de serviette, et le mot « Elenchos » entre guillemets ; la seule piste qui dessine la promesse (une phrase, et quelqu'un qui l'a dite). Options non retenues : le rond de serviette (recommandée), le marque-place, l'epsilon. Risque dit au porteur, à traiter au dessin final : en petit, la rangée « « ◎ » » peut se lire comme des boutons de lecture (retour, pause, avance) ; elle peut aussi évoquer un média. Le dessin final est fait par l'équipe (D-047) ; le nom reste à vérifier, et le logo serait à refaire si le conseil écartait Elenchos (D-047).
2. **Texte du nom : la proposition A**, à l'écran du compte, à la création du compte seulement :
   « **Pourquoi Elenchos ?** ἔλεγχος — Elenchos, en grec, c'est l'examen de Socrate : questionner pour mettre à l'épreuve ce qu'on croit savoir. Ici, tu mets à l'épreuve ce que tu crois savoir de tes proches. Chaque jour, tu devines. À 18h, le cercle découvre qui avait dit quoi. » (42 mots). Options non retenues : B (le mot seul), C (prononciation et promesse). Exécute D-040. Sa place exacte et les règles d'écran de `docs/histoire-du-nom.md` restent des propositions, à confirmer à l'étape 6 ; à tester en bêta : la compréhension du mot et de Socrate, la lecture par Marie juste après l'entrée, l'effet sur les abandons de l'écran du compte (D-041).

### D-050 — Logo final validé ; une seule paire de guillemets dans le logo complet · Décidé (11 octobre 2026)

Livrable : le dessin final de « La citation » (`docs/maquettes/logo-final.html`, fichiers dans `docs/identite/logo/`, règles dans son `LISEZMOI.md`), par la Direction artistique, relu par Cohérence puis par le Vérificateur (OK avec corrections mineures, appliquées).

1. **Dans le logo complet, une seule paire de guillemets, celle du symbole : « ◎ » Elenchos.** Le mot seul garde ses guillemets : « Elenchos ». Option non retenue : deux paires, « ◎ » « Elenchos ». **Précise D-049** (« le mot « Elenchos » entre guillemets ») pour le seul logo complet.
2. **Le dessin final est validé**, avec le réglage « le rond domine » (rond creux nettement plus grand que les guillemets ; guillemets dans la teinte d'accent, caramel le jour et miel le soir ; rond dans l'encre des visages ; répartition des couleurs inversée par rapport à la piste montrée, ce que la page dit), trois dessins selon la taille et les règles d'usage du `LISEZMOI.md`. Restent des propositions, à confirmer à l'étape 6 : l'icône « jour » par défaut, le mot dans l'en-tête de l'écran 1.2, l'image d'aperçu du lien d'invitation (D-014). À tester en bêta : ce qu'évoque l'icône à 60 et 32 px (boutons de lecture, cible, œil, diffusion en direct), le miel (D-012). Non faits : les formats des boutiques (D-043). Le logo est à refaire si le conseil écarte le nom (D-047).

**L'étape 3 est terminée**, sauf la vérification du nom par un conseil, en cours en parallèle (D-047).

### D-051 — Accord pour commencer l'étape 6 · Décidé (11 octobre 2026)

Le porteur donne l'accord explicite que demandent D-001 et D-046 : **l'étape 6 (construire) commence**, par les trois travaux sur papier du plan de construction (partie 4) : préparer les règles (Game design), les quatre tensions jamais essayées (Contenu avec Game design), les exigences de protection des données (Back-end avec Juridique). Le test du message de 18h, premier code de l'étape, suit. Option non retenue : attendre, par exemple l'avis du conseil sur le nom (qui se fait en parallèle, D-047). Rappels : chaque dépense est présentée avant d'être engagée (D-042) ; agents seuls, le porteur valide en jouant (D-043) ; aucun agent n'accède à des données réelles de joueurs (D-048).

### D-052 — Étape 6, travaux 1 et 3 : règles chiffrées validées, trois comptes de mi-bêta, ce que lisent les agents · Décidé (11 octobre 2026)

Livrables : `docs/etape-6/regles.md` (Game design ; avis d'UX, de Contenu et Back-end, de Juridique) et `docs/etape-6/donnees.md` (Back-end avec Juridique), relus chacun par Cohérence puis par le Vérificateur (OK avec corrections mineures, appliquées).

1. **Règles : tout est validé**, comme les règles de détail du bilan (D-030). Option non retenue : valider sauf l'exception à D-011 ; relire d'abord. Sont ainsi décidés : les réglages chiffrés (curseur net dès 8 réponses pondérées ; barre à 60 réponses, qui disparaît une fois pleine ; Le Pas de Côté ; fenêtres et seuils des tempéraments ; avis du cercle dès 3 réponses ; réponse en retard acceptée jusqu'à 18h10 ; lien d'invitation de 7 jours, à confirmer par UX), 19 des 20 points laissés à l'étape 6 (les voix sous le vote restent ouvertes, E4), et : **D-011 modifié** (un membre arrivé après la fermeture d'un texte n'est pas proposé sur ce texte) ; **D-014 complété** (sous « Valider », qui fige la manche : « Une fois validé, tu ne peux plus changer. ») ; précisions de D-026 et D-038 (barre), de `projet.md` §4 et de la règle 13 (Le Pont texte par texte ; L'Original : son côté réunit au plus un tiers du cercle, donc plus « seul » à la lettre dès six membres), de R2 ; **règle 20 nouvelle** (texte corrigé après coup : retiré des portraits, jamais resservi ; précise D-044, point 1). Tous les réglages reposent sur des joueurs simulés et seront recalés au bilan de mi-bêta. À reporter dans `docs/produit.md`.
2. **Les trois comptes de mi-bêta sont ajoutés aux mesures** : Pas de Côté par mois, tempéraments en cours, part des joueurs avec au moins un curseur net à 40, 60 et 80 réponses. Option non retenue : ne rien ajouter. **Élargit D-042 (point 2, liste fermée des usages : « régler les seuils du jeu ») et D-027** (seul usage interne des opinions). Conditions (Juridique) : totaux seulement, jamais par cercle ni par personne, jamais croisés, seuil de 30 joueurs par groupe compté, jamais publiés ; la carte de consentement ou « Qui, durée, droits » le dit dès le premier joueur de la bêta (D-006) ; accord séparé ou réglage « Ne pas compter mes réponses » selon l'avocat ; inclus dans l'analyse d'impact (D-044).
3. **Les agents peuvent lire, outre la part de « aucune », les totaux des mesures de la bêta** (gestes, justesse, Mystère, trois comptes ci-dessus), par groupes au-dessus des seuils, sous forme d'un rapport donné par le porteur, jamais d'un accès. Options non retenues : la part de « aucune » seulement ; aussi des extraits de journaux ; le porteur seul. **Élargit D-027** (d'autres agents que Contenu, d'autres chiffres) ; D-048 intact (en cas d'incident, c'est le porteur qui regarde ; aucun journal ne va aux agents). Les totaux sont jugés sans donnée de joueur, à confirmer par l'avocat.

### D-053 — Étape 6, travail 2 : les quatre tensions jamais essayées · Décidé (11 octobre 2026)

Livrable : `docs/etape-6/tensions.md` (Contenu, avec Game design), après une vérification indépendante des huit fiches, deux annotations à l'aveugle, un test du camp avec témoin et une réannotation sans écart ; relu par Cohérence puis par le Vérificateur (OK avec corrections mineures, appliquées) ; avis d'UX sur les mots.

1. **Critère du camp : on juge nos seuls mots.** Nos textes ne doivent pas faire deviner le camp de l'auteur mieux que l'intitulé officiel seul ; on le mesure en bêta auprès de volontaires hors du jeu (pas des données de joueurs), et le lot servi mélange les auteurs. Options non retenues : exiger le hasard pur ; écarter les textes révélateurs. **Modifie le « Fini quand » du travail 2** du plan de construction (validé avec D-046 : « un modèle ne devine pas le camp de l'auteur »). Constat qui le motive : un modèle trouve le camp 8 fois sur 8 avec nos textes comme avec le seul intitulé, de mémoire ou par la mesure.
2. **Jamais un texte qui vise une nationalité.** L'immigration reste dans la tension Souveraineté/Ouverture, mais seulement par des règles générales. Options non retenues : oui, en décrivant la règle (recommandée) ; aucun texte d'immigration. **Précise `projet.md` §8** (sélection des textes), sur le modèle de la laïcité écartée au §5. Le texte d'épreuve SO2 est remplacé.
3. **Deux mots des valeurs changent : « l'indépendance » remplace « la souveraineté », « le privé » remplace « le marché »**, dans les phrases et sur les curseurs (un seul libellé par valeur). Options non retenues : « l'indépendance » seulement ; garder les mots actuels. **Modifie E2 (D-030), la règle 16 de `docs/produit.md`, `projet.md` §5 (tensions 6 et 7) et les maquettes validées (D-014).** « L'ouverture » reste (aucun mot juste trouvé). À tester en bêta : « l'indépendance » au sens personnel ou territorial, « le privé » sur un texte d'école.

### D-054 — Étape 6, travail 4 : le test du message de 18h préparé ; l'iPhone seulement · Décidé (12 octobre 2026)

Livrable : `docs/etape-6/test-18h.md` (Back-end et Front-end, avec l'avis de Juridique), relu par Cohérence (compatible avec réserves, corrigées) puis par le Vérificateur (OK avec corrections mineures, appliquées).

1. **La préparation du test est validée en entier** (« Je valide tout »), et avec elle :
   - **une copie du code réservée à la mise en ligne** : une branche `mise-en-ligne`, d'où Scalingo installe. Elle ne reçoit que des versions déjà sur `main`, jamais de 15h à 19h ni le dimanche (D-043), n'est jamais fusionnée ailleurs et ne réécrit rien ; les agents n'y poussent qu'après le feu vert écrit du porteur, la veille. **Ajout à la règle de poussée de `CLAUDE.md`**, de même nature que `gh-pages` (D-019), inscrit dans `CLAUDE.md` avec cette entrée ;
   - **la note d'une page aux prêteurs** (Juridique), remise avant l'installation ; prêteurs majeurs, téléphone à eux seuls ; comptes de test seulement, jamais le compte d'un prêteur ;
   - **l'effacement** le lendemain du troisième soir, vérifié ; seul un tableau d'heures par téléphone numéroté, sans nom, est gardé jusqu'au 20 novembre 2026, puis effacé avec la liste « qui a quel téléphone », qui n'est écrite que chez le porteur. **Précise P-43 et la carte des données** de `docs/etape-6/donnees.md` (proposés) ; **précise P-21** pour le seul message d'erreur de fabrication chez Scalingo, sans donnée.
2. **Si Apple ou Google refuse l'adresse de test de Scalingo : on redemande au porteur avant d'acheter un nom de domaine** (« Me redemander d'abord »). Options non retenues : domaine neutre d'environ 10 € acheté d'office (recommandée) ; tester sans Apple ni Google.
3. **L'iPhone seulement.** À la question de l'Android d'essai, le porteur a demandé pourquoi tester Android s'il veut que l'application tourne sur iPhone ; informé que deux téléphones sur trois en France sont des Android et qu'un proche sur Android ne recevrait pas le message de 18h, il a choisi « iPhone seulement ». Options non retenues : acheter un Galaxy A07 (recommandée) ; emprunter un Android seulement. **Modifie D-005** (« les deux boutiques en même temps » devient l'App Store seul ; les critères de passage aux boutiques qui comparent iPhone et Android tombent) et **le §11.8 de `projet.md`** (déjà remplacé par D-005). Conséquences : le test se fait sur cinq iPhone ; aucun Android acheté ; pas de compte Google Play. **Précisé le même jour, sur question : un proche sur Android ne peut pas jouer** ; la page lui dit que le jeu est réservé à l'iPhone. Option non retenue : il joue dans son navigateur, sans garantie (recommandée). Le porteur a été informé que deux téléphones sur trois en France sont des Android, donc que la plupart des cercles compteront des proches exclus. Restent à régler par l'équipe, marqués « proposé » : l'iPad, les ordinateurs, et les mots de la page de refus (UX).

### D-055 — L'essai de Scalingo demande une carte : carte donnée, avec deux garde-fous · Décidé (12 octobre 2026)

Fait nouveau, relevé en écrivant le code du test (documentation de Scalingo modifiée le 1er octobre 2026, vérifiée par Juridique le 12 octobre) : l'essai gratuit de 30 jours demande désormais un moyen de paiement ; à la fin, la facturation démarre d'elle-même si une application ou une base existe encore, et le bouton « Stop free trial » la lance tout de suite. **Corrige un fait de D-048** (« essai de 30 jours sans carte »), sur le modèle de D-046 pour D-006 ; le choix de Scalingo tient. Avec ce fait, le porteur a été informé du bulletin de sécurité de Scalingo du 12 août 2026 (avis de Juridique : le choix tient ; double vérification dès l'ouverture du compte, jamais de lien d'un e-mail « Scalingo ») et des journaux gardés un an par l'hébergeur.

**Le porteur donne sa carte, avec deux garde-fous** : il note la date de fin d'essai le jour de l'ouverture du compte ; l'équipe lui présente la suite, avec son montant, au plus tard une semaine avant cette date (continuer ou tout supprimer). Le test supprime son application et sa base avant le 30e jour : 0 € si les dates tiennent. **Précise D-042** (une dépense qui s'engagerait seule est présentée avant). Options non retenues : une carte virtuelle à plafond ; pas de carte (repli vers Clever Cloud).

### D-056 — Priorité absolue : une version de test, la moins chère et la plus simple, sur iPhone, avec de vrais joueurs · Décidé (13 octobre 2026)

Après la lecture de `docs/version-minimale.md`, le porteur, mot pour mot (dicté) : « Je ne veux aucun frais d'avocat. […] Je veux un truc qui fonctionne, peu importe s'il y a des risques. […] d'abord un truc qui fonctionne pour prouver que ça fonctionne avec des utilisateurs réels. Et ensuite, je mettrai tout à niveau en termes de sécurité, d'hébergement, etc. […] mon but, c'est de faire l'application la moins chère possible pour pouvoir la tester. […] disponible sur iPhone […] la manière la plus simple d'y accéder. […] s'il y a des choses que j'ai dites avant qui sont contraires à ça, oubliez-les. »

**Décision : le prochain but est une version de test, au coût et à la difficulté technique les plus bas, jouable sur iPhone par de vrais joueurs.** La mise à niveau (sécurité, hébergement, juridique) vient après ce test et avant toute ouverture au public. Le porteur accepte les risques ; il en a été informé (`docs/version-minimale.md`, parties 2 et 3, dont sa responsabilité en nom propre, D-042).

**Pour la version de test, suspend** (ces décisions reprennent effet à la mise à niveau, avant l'ouverture au public) :
- D-044, point 4 (relectures d'avocat, délégué nommé avant l'ouverture), et la règle du plan « sans avocat, pas de bêta » ;
- D-043, point 4, D-047 et D-050 (vérification du nom par un conseil, marque) ;
- le plan, partie 5 (liste « Avant la bêta » : avocat, analyse d'impact, décision écrite sur le délégué, audit) et les travaux 11 (Juridique) et 14 (App Store) ;
- toute autre décision antérieure qui ajoute un coût ou une difficulté technique à la version de test, dès que l'équipe la signale au porteur.

**Ne change pas** : le jeu lui-même (`docs/produit.md`) et les lignes rouges du §9. Choix de l'orchestrateur, à confirmer par le porteur : les protections qui ne coûtent rien restent en place (accord explicite du joueur à l'entrée, cloisonnement des cercles, effacement réel, aucune mesure extérieure, aucune donnée de joueur vers un fournisseur d'IA). Restent aussi les règles de travail (circuit, branche `mise-en-ligne` et feu vert de la veille, D-054) et la carte avec ses garde-fous (D-055). Les choix concrets (accès, hébergement, contenu du test, test de 18h) sont posés au porteur en QCM et consignés à part.

### D-057 — La version de test : accès, hébergement, connexion, test de 18h, protections · Décidé (13 octobre 2026)

Plan des prochaines étapes présenté dans le chat (relu par Cohérence, compatible avec réserves, et par le Vérificateur, OK avec corrections, appliquées), quatre QCM. Application de D-056.

1. **Accès : un lien, puis une icône** sur l'écran d'accueil de l'iPhone (D-005, inchangé). Repli si le message de 18h ne passe pas : TestFlight, à reposer alors.
2. **Hébergement : Scalingo, la plus petite formule, plus un nom de domaine** (environ 10 € par an) acheté avant la mise en ligne, pour que l'icône et l'abonnement au message de 18h survivent à la mise à niveau. Précise D-054, point 2 (le domaine est maintenant voulu ; son nom et son montant restent présentés avant l'achat, D-042). D-048 et D-055 inchangées. Options non retenues : Scalingo avec son adresse gratuite ; un hébergeur moins cher ailleurs.
3. **Connexion : les trois voies, Apple, Google et e-mail** (D-035 maintenue pour le test). Conséquence dite au porteur : deux réglages de plus pour lui (Google, et un service d'envoi d'e-mails avec le domaine vérifié). Options non retenues : Apple seulement (recommandée) ; un pseudo sans compte.
4. **Test du message de 18h : sur l'iPhone du porteur seul**, pendant la construction. **Modifie D-054, points 1 et 3** (cinq iPhone, prêteurs, note aux prêteurs, séance d'installation) et le « Fini quand » du travail 4 du plan. Les iPhone plus anciens ne seront connus qu'avec les vrais joueurs, à qui l'on demande leur version d'iOS. Option non retenue : cinq iPhone comme prévu.
5. **Les protections qui ne coûtent rien sont gardées** (confirme le choix de l'orchestrateur laissé ouvert par D-056) : accord explicite à l'entrée, cloisonnement des cercles, effacement réel, aucun outil de mesure extérieur, aucune donnée de joueur vers une IA, ni vente ni publicité, mention « textes rédigés avec une IA » (D-044), et une phrase « version de test, tout peut être effacé à la fin ». Option non retenue : les retirer aussi.

**Précision du même jour (QCM)** : le domaine sera **elenchos.fr** (option non retenue : un nom neutre). Le nom n'est pas vérifié (D-056) : si le jeu change un jour de nom, les joueurs réinstalleront l'icône, risque accepté. Sa disponibilité se vérifie à l'achat. Le porteur a dit « on continue » : mise à jour du pas-à-pas du test de 18h et page du contenu du test, en parallèle.

Rappelé au porteur avec ce plan, sans QCM (conséquences de D-056) : le test ne contient que le cœur du jeu, fixé par une page courte de Game design et UX ; les textes sont écrits en session par les agents, la chaîne automatique (travail 10, D-044 point 1) attend la mise à niveau ; l'alerte de 18h02 et la procédure d'incident (D-043, point 2) sont suspendues pour le test, le porteur vérifiant lui-même la réception chaque soir ; pas de mise en ligne de 15h à 19h ni le dimanche (inchangé). Coût estimé par l'orchestrateur : environ 26 à 80 € d'hébergement, plus le domaine ; durée estimée : 4 à 8 semaines de construction avant les premiers joueurs, non chiffrée par Back-end et Front-end, ni engagement ni date de sortie.

### D-058 — Le contenu de la version de test · Décidé (13 octobre 2026)

Proposition : `docs/etape-6/contenu-test.md` (Game design et UX, assemblés par l'orchestrateur ; relu par Cohérence, compatible avec réserves, et par le Vérificateur, OK avec corrections, appliquées). Le test garde la journée (Deviner, Répondre, révélation de 18h), la semaine (trois titres du dimanche) et l'entrée (défi des trois textes) ; le long terme (portrait, tempéraments, badges rares) vient après le test ; un seul cercle par personne. Les décisions mises de côté pour le test sont listées dans la partie 8 du document, au titre de D-056. Quatre QCM :

1. **La carte « qui et pourquoi » est dans le test** (règle 9, R5, D-038 inchangés ; égalité au Devin départagée par les raisons cachées, D-010). Option recommandée non retenue : après le test (Vérificateur, Game design).
2. **La barre « Ton portrait se dessine » est dans le test**, en simple compteur (D-026, D-038 inchangés ; la carte de consentement garde « ton portrait se dessine »). Option recommandée non retenue : après le test (Vérificateur, Game design).
3. **Le créateur devine son premier invité** (D-006, D-011 inchangés). Option non retenue : après le test (Game design).
4. **L'âge minimum reste 15 ans et plus** pendant le test (D-006 inchangé). Option recommandée non retenue : 18 ans et plus (UX, Vérificateur).

Restent des propositions, sans décision du porteur : la durée du test (quatre semaines après le lancement du dernier cercle, 34 textes, Game design), la mention IA reformulée (« Résumé et raisons rédigés avec une IA, d'après le texte et les débats. », UX ; reformule D-057 point 5, sauf avis contraire), les textes des écrans nouveaux (annexe, à relire par Juridique pour la carte et « Qui, durée, droits »).

### D-059 — Test du message de 18h : vos comptes, domaine pas maintenant · Décidé (13 octobre 2026)

Pas-à-pas du test de 18h mis à jour pour D-057 (Back-end ; relu par Cohérence, compatible avec réserves, puis par le Vérificateur, OK avec corrections mineures ; corrections appliquées ; 82/82 tests). Deux QCM :

1. **Le porteur se connecte avec ses propres comptes Google et Apple** sur son iPhone (le test ne garde qu'une empreinte de l'identifiant ; le tableau d'heures, qui ne parle que de lui, reste chez lui sans date limite : le 20 novembre de D-054 point 1 tombe). **Modifie D-054 point 1 et P-43** (« comptes de test seulement »). Option non retenue : des comptes créés exprès.
2. **Le domaine elenchos.fr n'est pas acheté maintenant.** Le test du message de 18h attend ; **D-057 point 2 (domaine acheté avant la mise en ligne) est à reposer** au porteur, avec la suite. Options non retenues : OVHcloud (recommandée), un autre registraire.

**Précision du même jour (QCM)** : **on construit le jeu d'abord** ; le test du message de 18h attend que le jeu soit prêt et que le domaine soit décidé. Conséquence dite au porteur : on ne saura qu'à la fin si le message de 18h arrive bien sur iPhone. Options non retenues : le test tout de suite sur l'adresse gratuite de Scalingo (recommandée) ; pause.

Restent « proposé », laissés à l'équipe : le sous-domaine `test18h.elenchos.fr`, le seuil de 15 €, la condition 4 de Juridique non bloquante pour ce test (à confirmer par Juridique).

### D-060 — La construction de la version de test : lancée · Décidé (15 octobre 2026)

Proposition : `docs/etape-6/plan-version-test.md` (Back-end, Front-end, Contenu, assemblés par l'orchestrateur ; relu par Cohérence, compatible avec réserves, et par le Vérificateur, OK avec corrections, appliquées ; plans complets conservés à côté). Quatre QCM :

1. **Le porteur joue sur son iPhone à la phase 6 seulement** : tout se construit sur les machines de l'équipe jusque-là ; il voit des captures (phase 1). Rien n'est payé avant. Option recommandée non retenue : un aperçu dès la phase 2 (Vérificateur, Front-end).
2. **Le domaine elenchos.fr est acheté juste avant les premiers joueurs** (précise D-057 point 2 et D-059). La phase 6 se fait sur l'adresse gratuite de Scalingo ; le porteur réinstallera son icône une fois. Si Apple ou Google refusent cette adresse, la question revient (D-054, point 2). Conséquence : la voie e-mail ne s'essaie qu'à l'arrivée du domaine. Option recommandée non retenue : l'acheter à l'ouverture de Scalingo ; autre option non retenue : pas de domaine pendant le test.
3. **Le test du message de 18h se fait sur le jeu lui-même, en phase 6.** **Modifie D-054, point 1** (test sur une page nue) ; le sous-domaine `test18h` et le seuil de 15 € (D-059, proposés) tombent ; `test-18h/` reste comme source de briques reprises. Option non retenue : la page nue d'abord.
4. **On lance** la phase 0 (contrat entre serveur et interface, format des textes, relectures de Juridique, textes manquants d'UX) et l'écriture des 34 textes par Contenu, en parallèle. Point d'étape à chaque phase (D-020). Option non retenue : pause.

Signalés au porteur dans le plan, au titre de D-056, sans QCM : révélation rouverte reprise au début (E3), pas de copie des sauvegardes (P-13), une seule application Scalingo (P-19, P-20), plafond de 6 textes par commission au lieu des quotas (§8), chiffrement des réponses gardé (P-02, retirable).

### D-061 — Phase 0 : la carte de consentement, la durée du test, la mention · Décidé (15 octobre 2026)

Phase 0 de la construction (D-060) : contrat entre le serveur et l'interface, format des textes et décisions techniques (`jeu/`, Back-end et Front-end), relecture de Juridique, textes manquants d'UX ; relus par Cohérence (compatible avec réserves) et par le Vérificateur (OK avec corrections) ; corrections appliquées. Trois QCM :

1. **La carte de consentement corrigée par Juridique** : le nom du porteur en bas (« Version de test, tenue par [Prénom Nom]. Tout peut être effacé à la fin. »), le risque dit (« le lendemain, ton cercle essaie de deviner qui a répondu quoi. À 18h, il découvre lesquelles étaient de toi »), les trois premières réponses envoyées aux invités, un bouton « J'ai 15 ans ou plus, j'accepte » et un bouton « Non merci ». **Modifie le texte validé de la carte** (D-006, `onboarding.md` étape 3 ; maquette 1.3, D-014 ; ligne de D-058). Options non retenues : la même sans le nom ; la carte validée telle quelle.
2. **À la fin du test, tout est effacé** : les données des joueurs sont gardées tant que le compte existe, et au plus jusqu'à la fin du test ; les joueurs repartent de zéro à la mise à niveau. Précise D-057 point 5 (« tout peut être effacé à la fin » devient une durée). Options non retenues : chacun choisit de garder son compte (recommandée) ; rien de plus promis.
3. **Pas de phrase disant qu'aucun avocat ni expert en sécurité n'a vérifié cette version.** Option recommandée non retenue : une phrase dans « Qui, durée, droits » (Juridique, Vérificateur).

Arbitrages de l'équipe, dits au porteur sans QCM (D-009) : les trois réponses d'entrée d'un invité sont gardées sur le serveur dès l'accord, effacées au bout de 7 jours s'il ne crée pas de compte, avec un lien « Effacer mes réponses » avant le compte (Back-end et Front-end ; Juridique préférait les garder dans le téléphone) ; le code de passage vers l'icône vaut 10 minutes (Juridique) ; Apple et Google ne fournissent que l'identifiant (moins que le plafond de D-035) ; le message d'arrivée, sur l'écran verrouillé, ne montre pas le score (UX) ; « Tout effacer » coupe le lien avec Apple ou Google de notre côté seulement (allègement de D-035 règle 5 et P-38, au titre de D-056).

### Points ouverts du §11 — toujours ouverts

(1) Web ou application : **tranché, D-005** · (2) Onboarding : **tranché, D-006** (`docs/onboarding.md`) · (3) Modèle économique : **tranché, D-042** (gratuit, contribution libre à l'ouverture) · (4) Juridique · (5) Mortalité du cercle : **tranché, D-010** · (6) Plafond d'attributions : **tranché, D-010** · (7) Surcouche 2027 · (8) Étapes suivantes (la partie technique « iOS puis Android » est remplacée par D-005). Les autres restent ouverts.
