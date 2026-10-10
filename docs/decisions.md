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

### Points ouverts du §11 — toujours ouverts

(1) Web ou application : **tranché, D-005** · (2) Onboarding : **tranché, D-006** (`docs/onboarding.md`) · (3) Modèle économique · (4) Juridique · (5) Mortalité du cercle : **tranché, D-010** · (6) Plafond d'attributions : **tranché, D-010** · (7) Surcouche 2027 · (8) Étapes suivantes (la partie technique « iOS puis Android » est remplacée par D-005). Les autres restent ouverts.
