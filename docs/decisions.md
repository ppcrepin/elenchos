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

### C-001 — Le « pourquoi » reste cadré · Constaté

Le « pourquoi » passe uniquement par ce qui est validé : choix d'une considération parmi 4 arguments réels de députés (§2), réponse à considération masquée (§2), révélation de l'auteur de l'argument à 18h (§2). La question quotidienne « d'où vient ta conviction » reste écartée (§10). Toute proposition de « pourquoi » plus profond rouvrirait le §10 et devrait être tranchée explicitement par le porteur.

### C-002 à C-005 — Incohérences relevées dans `docs/projet.md` · Constaté, non tranché

À soumettre au porteur après validation de la vision, en QCM, une par une, avec leur origine.

- **C-002 — Taille minimale du cercle.** §3 : 3 à 10 membres. §2 : 3 réponses d'autres membres à attribuer, jamais la sienne. Un cercle de 3 n'a que 2 « autres ». À 4, la dernière attribution se déduit par élimination si chaque personne n'est proposée qu'une fois.
- **C-003 — Palmarès et statistiques contre lignes rouges.** §4 (palmarès), §6 (statistiques, « taux de lecture » d'une personne) et §8 (statistiques publiques) face au §9 : aucun classement permanent, aucun chiffre public sur ce que pensent les joueurs, aucun taux d'accord entre deux personnes. À qualifier terme par terme.
- **C-004 — Onboarding v2 et « rien ne sort du cercle ».** §7 : l'invitée voit les réponses du créateur avant d'être membre du cercle. Tension avec le §9.
- **C-005 — « Aucune de ces raisons ».** §8 prévoit un taux de « aucune de ces raisons » dans le suivi statistique ; l'écran 2 (§2) ne propose que 4 considérations, sans cette option.

### C-006 — Chronologie de la révélation de 18h · Constaté, non tranché

Le §2 liste en une seule « révélation commune à 18h » quatre éléments (attributions justes/fausses, résultat du vote à l'Assemblée, auteur du texte, auteur de l'argument choisi) sans dire sur quel texte porte chacun. Un texte ouvert à 18h le jour J est déposé jusqu'à 18h J+1 et deviné de 18h J+1 à 18h J+2 ; ses attributions ne peuvent donc être révélées qu'à 18h J+2. Deux lectures pour le vote, l'auteur du texte et l'auteur de l'argument :
- **(A)** révélés à 18h J+2 avec les attributions, tout sur le même texte ; rien n'est connu pendant qu'on devine (appui : §1, mot « commune ») ;
- **(B)** révélés à 18h J+1 à la clôture des dépôts, les attributions 24h plus tard ; le vote et le groupe des arguments sont déjà connus pendant qu'on devine (appui : §7 « révélation solo chaque soir », §8 « avant 18h, seul le lien »).

L'explication de la vision suit (A). Avis du game design : (A), nettement ; sous (B), l'auteur du texte et son groupe sont connus pendant qu'on devine, donc on devine par camp au lieu de deviner la personne, et le rendez-vous de 18h s'étale sur deux soirs. À trancher par le porteur à l'étape des règles. Si (B) est retenu, une phrase de la vision est à ajuster.

### Points ouverts du §11 — toujours ouverts

(1) Web ou application · (2) Validation de l'onboarding v2 · (3) Modèle économique · (4) Juridique · (5) Mortalité du cercle · (6) Plafond d'attributions · (7) Surcouche 2027 · (8) Étapes suivantes. Aucun n'est tranché à ce jour.
