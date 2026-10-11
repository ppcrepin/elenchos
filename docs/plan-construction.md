# Plan de construction : de l'essai au lancement

*Synthèse de l'orchestrateur, 5 octobre 2026, à partir des plans de Back-end, Front-end, Contenu, Juridique et Game design (avec UX). Relue par Cohérence puis par le Vérificateur (« OK avec corrections », appliquées). Elle complète `docs/feuille-de-route.md`. Les durées ne sont données que lorsqu'un spécialiste peut les justifier. Les points de droit viennent de l'agent Juridique : il n'est pas avocat, et il a vérifié une partie des faits dans des sources secondaires ; un avocat relira avant la bêta, puis avant l'ouverture (D-044).*

*Mis à jour le 11 octobre 2026, à la clôture de l'étape 5, par Back-end (avec Front-end) : vos dix choix de fabrication (D-042 à D-045) remplacent la description des options ; la partie 4 suit la branche que vous avez choisie, des agents seuls (D-043) ; les coûts suivent vos choix, dépense par dépense (D-042) ; une première fourchette de durée de construction est donnée, avec ses hypothèses. Ce plan ne décide rien de lui-même : ce qui n'est pas dans une décision est marqué « (proposé) ». Le code ne commence qu'avec votre accord explicite (D-001). Relecture : Cohérence (compatible avec réserves, corrigées), puis le Vérificateur (OK avec corrections mineures, appliquées).*

*Le 11 octobre 2026, après les trois travaux sur papier de l'étape 6 : leur état (faits : D-052, D-053) ; le « Fini quand » du travail 2, réécrit selon D-053 (point 1) ; la mesure du camp par des volontaires et les trois comptes de mi-bêta, ajoutés à la bêta (partie 5) ; ce que lisent les agents (travail 12, D-052, point 3). Relecture : Cohérence (compatible avec réserves, corrigées), puis le Vérificateur (OK avec corrections mineures, appliquées).*

## 1. Où on en est

**Étapes 1 à 3 : faites.** Le produit est défini (`docs/produit.md`, D-010), dessiné (D-011) et habillé (univers La Tablée D-012, nom de travail Elenchos D-013, maquettes finales D-014). Reste la fin de l'étape 3 : la vérification du nom par un conseil en propriété industrielle (D-013, D-043), Le logo est fait et validé (D-049, D-050 ; fichiers dans `docs/identite/logo/`).

**Étape 4 : faite.** Deux essais joués par vous seul, avec quatre personnages simulés, sur votre iPhone, depuis une icône de l'écran d'accueil (D-015 à D-019, D-031 à D-033). Bilans écrits, règles tranchées (D-022 à D-030, D-038 à D-040), produit mis à jour (D-041).
- Ce que les essais ont prouvé : des agents savent construire l'interface au niveau demandé ; les deux pages ont tenu sur votre iPhone sans incident technique.
- Ce qu'ils n'ont pas prouvé : un serveur, de vrais comptes, la connexion Apple ou Google, le message de 18h, la sécurité des données, les boutiques. Rien ne quittait votre iPhone.
- Le plaisir de deviner de vrais proches se jugera en bêta (D-039).

**Étape 5 : faite (D-042 à D-046).** Les dix choix de fabrication sont tranchés, en quatorze QCM (à partir de `docs/etape-5-choix.md`). Les documents qui en dépendent sont mis à jour et validés (D-046) : `docs/produit.md`, `docs/onboarding.md` (le compte, D-035), ce plan et la feuille de route.

**Étape 6 : en cours** depuis le 11 octobre 2026, avec votre accord (D-051). Les trois travaux sur papier sont faits : les règles et les exigences de protection des données (D-052), les quatre tensions jamais essayées (D-053 ; le texte d'épreuve SO2 est en cours de remplacement). Le suivant est le travail 4, le test du message de 18h, premier code de l'étape.

## 2. Avant l'étape 6 : ce qui la conditionne

**Votre accord explicite pour commencer (D-001).** Aucune ligne de code avant, même pour un test jetable (D-005).

**Trois démarches à votre nom** (vous portez le service en nom propre, D-042). Chacune vous sera présentée avec son montant avant d'être engagée (D-042, dépense par dépense) :
- **La vérification du nom par un conseil en propriété industrielle, dès maintenant** (D-013, D-043). Elle débloque le logo, le texte qui explique le nom (D-040) et l'adresse web définitive, qui doit être figée avant la bêta. Quelques centaines d'euros (estimation).
- **Le compte développeur Apple, au début de l'étape 6** (D-035, D-042). Il faut l'avoir avant le test du message de 18h (travail 4), qui essaie la connexion Apple. Environ 99 € par an (sources de 2020-2021, à revérifier).
- **Le devis d'un avocat spécialisé en données personnelles** (D-044 ; vous l'avez pris en charge, D-047). Sa première relecture se fait avant la bêta.

Ces démarches ne bloquent pas toutes la même chose : sans compte Apple, le premier test ne peut pas se faire ; sans vérification du nom, ni le logo ni l'adresse définitive ; sans avocat, pas de bêta.

## 3. Étape 5 : les dix choix tranchés

Vous les avez tranchés le 11 octobre 2026. Le détail des options, des faits (vérifiés, de mémoire ou estimés) et des limites qui vous ont été dites est dans `docs/etape-5-choix.md`.

1. **Qui porte le service : vous, en nom propre** (D-042). Comptes, contrats, marque, adresse et responsabilité éditoriale sont à votre nom. L'App Store demandera probablement une structure : cette question vous reviendra avant le chantier des boutiques (D-043).
2. **Lien ou application : le lien d'abord, puis les deux boutiques avant l'ouverture au public** (D-043). D-005 est repris tel quel, sa suspension (D-009) est levée. Le compte Apple sert dès les premiers joueurs, pour la connexion Apple sur le web.
3. **Qui code : des agents seuls.** Vous validez en jouant, et vous êtes le seul recours humain, y compris le soir (D-043). Ce que ce choix impose : partie 4.
4. **La production des textes** (D-044) :
   - tout automatique, avec une mention visible qui dit que les textes sont rédigés avec une IA, et une procédure de correction rodée dès la bêta ; vous êtes le responsable éditorial ;
   - un seul fournisseur de modèles, avec des modèles différents pour écrire et pour vérifier : modifie le §8 de votre document ;
   - l'égalité entre groupes, avec une marge : sur douze semaines glissantes, chaque groupe fournit entre deux tiers et quatre tiers de la part égale des raisons. Cette règle passe avant l'équilibre entre adoptés et rejetés (D-028).
5. **Où vivent les données : chez des prestataires européens seulement**, par leur siège et leur contrôle, pas seulement par leurs serveurs (D-043). Restent hors d'Europe, inévitablement, la connexion par Apple ou Google et l'acheminement des messages de 18h. Aucune donnée de joueur n'est jamais envoyée à un fournisseur d'IA.
6. **L'engagement « ni vente, ni exploitation, ni publicité » : confirmé**, dans les conditions d'utilisation et la politique de confidentialité, avec une liste fermée des usages permis (D-042 ; détail dans `docs/produit.md`, section 6).
7. **Les durées** (D-045) :
   - un compte qui n'ouvre pas le jeu pendant 12 mois est effacé, après un e-mail envoyé 30 jours avant. C'est le seul message qui parle d'une absence : une exception à « aucune relance » (D-010, point 3) et à D-029 ;
   - les titres de qui quitte un cercle ou efface tout restent sous « un ancien membre ». À l'effacement d'un compte inactif, un visage disparaît du Cercle sans message (D-010, point 3, « rien de visible »).
   - Les autres durées sont des propositions de Juridique, à caler dans l'analyse d'impact.
8. **Avocat et délégué à la protection des données : deux relectures**, avant la bêta et avant l'ouverture ; un délégué nommé avant l'ouverture ; avant la bêta, une décision écrite dit pourquoi il n'est pas encore obligatoire ; vous ne pouvez pas être votre propre délégué (D-044).
9. **Modèle économique et budget** (D-042) :
   - le jeu est gratuit ; vous le financez jusqu'à l'ouverture ; à l'ouverture, une contribution libre, sans aucun avantage dans le jeu, sous les cinq règles de l'argent. Cela ferme le point ouvert §11.3 ;
   - le budget s'engage dépense par dépense : voir la partie 6.
10. **Marque et adresse : le nom est vérifié dès maintenant, la marque est déposée après la bêta** (D-043). L'adresse et l'icône sont figées avant la bêta.

## 4. Étape 6 : construire, avec votre accord

**La branche suivie : des agents seuls (D-043).** Les autres branches que décrivait ce plan (application dès la bêta, prestataire) ne sont plus suivies.
- **Tout se prouve par des tests automatiques**, comme aux essais. Le circuit habituel (Cohérence, puis le Vérificateur) s'applique au code. Vous validez en jouant sur un lien d'aperçu.
- **Vous êtes le seul recours humain**, le soir et le dimanche compris.
- **« Rien ne se calcule à 18h pile » est une exigence**, et non plus une proposition :
  - la révélation est préparée d'avance, et seulement rendue visible à l'heure ;
  - aucune mise en ligne de 15h à 19h, ni le dimanche ;
  - une alerte part à 18h02 si les messages ne sont pas partis, et un seul geste relance l'envoi.
  - Si l'exigence est tenue, une panne de 18h se réduit à trois cas : l'hébergeur est en panne (on attend), une mise en ligne est fautive (la règle des horaires l'évite, et on revient à la version précédente), l'envoi a échoué (on relance) (Back-end).
- **Une procédure d'incident d'une page, que vous pouvez jouer seul**, est écrite avant la bêta (D-043).
- **Un code « ordinaire »**, pour qu'un humain puisse le reprendre un jour (D-043) : un seul langage, une base de données courante, des tests partout (proposé).
- **Limite, dite au moment du choix** : le code qui garde des opinions n'est relu que par des modèles, qui partagent une partie de leurs angles morts.

Les trois premiers travaux se font sur papier. Le test du message de 18h est le premier code de l'étape.

**1. Préparer les règles.**
- Chaque règle du jeu reçoit un chiffre et un exemple joué. Les règles laissées à l'étape 6 sont fermées ici (`docs/produit.md`, « Ce que ces décisions laissent à régler »).
- Les réglages sont calés sur des cercles simulés (3, 5 et 10 membres, sur douze semaines).
- Une dizaine de journées sont jouées à la main ; le code devra les reproduire.
- Fini quand : aucune règle n'est sans cas chiffré.
- Vous : vous voyez « ce que vit un cercle type en trois mois ».
- **État : fait** (`docs/etape-6/regles.md`, validé par D-052, point 1 ; reporté dans `docs/produit.md`). Dix-neuf des vingt points laissés à l'étape 6 sont fermés ; les voix sous le vote restent ouvertes (E4). Les réglages reposent sur des joueurs simulés et se recalent à mi-bêta.

**2. Les quatre tensions jamais essayées** (Égalité/Mérite, Solidarité/Responsabilité, État/Marché, Souveraineté/Ouverture : noms de code internes ; à l'écran, les valeurs des deux dernières s'appellent « l'État » et « le privé », « l'indépendance » et « l'ouverture », D-053, point 3).
- On produit leurs libellés et leurs phrases, et deux textes d'épreuve pour chacune.
- Fini quand (réécrit par D-053, point 1, qui modifie la version validée avec D-046, « un modèle ne devine pas le camp de l'auteur ») : les deux classements concordent ; nos textes ne font pas deviner le camp de l'auteur mieux que l'intitulé officiel seul, ce qui se mesure en bêta auprès de volontaires hors du jeu, qui ignorent le vote (pas des données de joueurs ; partie 5) ; et le lot servi mélange les auteurs. Raison : un modèle trouve le camp 8 fois sur 8 avec nos textes comme avec le seul intitulé, de mémoire ou par la mesure.
- Vous : vous lisez les huit textes.
- **État : fait** (`docs/etape-6/tensions.md`, D-053). Les mots des valeurs sont confirmés, deux changent (D-053, point 3) ; jamais un texte qui vise une nationalité (D-053, point 2) : le texte d'épreuve SO2, qui en visait une, est en cours de remplacement (Contenu). Reste pour la bêta : la mesure du camp par des volontaires.

**3. Exigences de protection des données**, remises avant d'écrire le code.
- L'e-mail est séparé des réponses.
- Rien de personnel dans les messages ni dans les journaux techniques, à une exception près : l'annonce d'arrivée faite au créateur d'un cercle cite un prénom, et son texte est à revoir avec Juridique (`docs/etape-5-choix.md`, choix 5).
- Aucun outil de mesure extérieur.
- Tous les prestataires qui touchent aux joueurs sont européens (D-043).
- Aucune donnée de joueur ne part vers un fournisseur d'IA : la chaîne des textes n'a aucun accès à la base des joueurs (D-043 ; la séparation, proposé).
- Chaque usage des données correspond à un usage de la liste fermée (D-042).
- Les durées de conservation sont tenues, dont l'effacement à 12 mois (D-045).
- Le consentement est prouvé, et l'effacement est réel.
- Fini quand : chaque exigence a son test automatique.
- Vous : vous lisez « qui voit quoi ».
- **État : fait sur papier** (`docs/etape-6/donnees.md` ; vos deux réponses, D-052, points 2 et 3). Chaque exigence a son test décrit ; chaque test sera construit au travail que le document indique.

**4. Test du message de 18h** : une page nue, cinq téléphones, trois soirs (D-005).
- Sur les mêmes téléphones, il vérifie aussi la connexion Google ou Apple depuis l'icône, et la reconnexion après l'ajout de l'icône (Front-end, `docs/etape-5-choix.md`). S'ils échouent, la question vous reviendra, comme D-035 le prévoit.
- Il faut avant lui le compte développeur Apple, à votre nom (déjà ouvert, D-047 ; partie 2).
- Les cinq téléphones : l'équipe n'en a aucun. Votre iPhone, un Android d'essai si vous l'achetez (proposé, partie 6), et trois autres, prêtés ou loués, à réunir au début de l'étape (proposé).
- Fini quand : le message arrive vers 18h sur les cinq téléphones, trois soirs de suite, et la connexion tient depuis l'icône.
- Vous : vous le recevez sur votre téléphone, et vous vous connectez depuis l'icône.

**5. Socle et données.**
- Hébergement et sauvegardes chiffrées, chez des prestataires européens (D-043). Leurs noms se choisissent ici. Ceux cités à l'étape 5 (Scalingo, Clever Cloud, Scaleway, OVHcloud, Brevo) sont des exemples donnés de mémoire.
- Le cloisonnement des cercles est imposé par la base elle-même.
- Fini quand : une restauration complète réussit, et les lignes rouges passent en tests automatiques.
- Vous : les comptes (hébergeur, domaine, e-mail) sont à votre nom (D-042).

**6. Horloge du jeu** : 18h, dimanche, pause, remise à zéro du lundi, changements d'heure, et le compteur des 12 mois sans ouverture, que toute ouverture du jeu remet à zéro (D-045).
- Elle tient l'exigence « rien ne se calcule à 18h pile » (D-043). Comment (proposé, Back-end) : chaque devinette est jugée au moment où elle est faite ; l'avis du cercle porte sur des réponses closes la veille ; seuls les titres du dimanche se calculent à 18h, en quelques secondes, et ce calcul peut être relancé sans risque. Cela ferait une exception à l'exigence de D-043. Back-end cherchera d'abord un calcul anticipé, par exemple des totaux tenus à jour à chaque devinette et seulement rendus visibles à 18h ; vous ne serez sollicité que s'il n'en existe pas (proposé).
- Fini quand : tout calcul rejoué donne le même résultat, et la révélation de 18h ne dépend d'aucun calcul lancé à 18h.

**7. Les écrans** : les 51 écrans validés, le catalogue des éléments graphiques, le jeu du jour, la révélation, l'entrée et l'invitation, Le Cercle et Moi.
- Les maquettes touchées par les décisions sont reprises (`docs/produit.md`, annexe), dont les trois voies du compte (1.8, 5.7, 5.14 ; D-035).
- Quelques écrans jamais dessinés sont dessinés à leur tour : réglages (avec la durée de 12 mois, D-045), code reçu par e-mail, réveil d'un cercle, quitter un cercle, la vraie page « Qui, durée, droits », l'emplacement de la mention IA (D-044).
- Fini quand :
  - chaque écran est posé à côté de sa maquette ;
  - la boucle quotidienne dure environ 90 secondes ;
  - rien de la révélation n'arrive dans le téléphone avant 18h.
- Vous : vous validez les nouveaux écrans, comme en D-011 et D-014, puis vous jouez sur un lien d'aperçu.

**8. Moteur de calcul** : cartes, points, titres, badges, portrait, phrases ; « un ancien membre » dans l'historique des titres (D-045).
- Fini quand : il donne les mêmes résultats que le programme de contrôle de l'essai, plus des cas à plusieurs cercles.
- Vous : vous jouez une semaine en une heure, avec une horloge accélérée.

**9. Comptes, invitation, messages de 18h.**
- Trois voies pour le compte : Apple, Google, ou l'e-mail avec son code (D-035). Avec des prestataires européens, la connexion n'est pas fournie toute faite : quelques jours de travail en plus (Back-end, estimation).
- Le compte et la demande du message de 18h viennent après la première révélation (condition 1 de D-005, repris par D-043).
- Sur iPhone, l'ordre entre la création du compte et l'ajout de l'icône, pour éviter une seconde connexion, se règle ici avec UX (proposé, Front-end).
- L'e-mail envoyé 30 jours avant l'effacement d'un compte inactif : texte écrit par UX, relu par l'avocat (D-045).
- Fini quand : on passe du lien au compte en moins de trois minutes.
- Vous : vous vous invitez depuis un Android d'essai, si vous en achetez un (proposé).

**10. Chaîne des textes.**
- On construit le relevé quotidien de l'open data, la sélection et le calendrier, la rédaction, la vérification, le registre public.
- Elle est automatique, chez un seul fournisseur de modèles, avec des modèles différents pour écrire et pour vérifier (D-044). Elle ne lit que les données publiques de l'Assemblée (D-043).
- La procédure de correction (erratum daté au registre, texte remplacé) est construite ici, pour être rodée dès la bêta (D-044).
- La règle d'égalité entre groupes (D-044) est vérifiée sur le stock réel des votes. Si elle ne tient pas, la question vous reviendra.
- La règle « une forme n'annonce jamais le vote » (D-041) est appliquée comme Contenu l'a décrite (`docs/etape-5-choix.md`). Le modèle qui parie sur le vote tourne chez le même fournisseur : Contenu dira si ce contrôle garde un sens (D-044).
- Puis une marche à blanc : la chaîne tourne chaque jour sans rien publier, et remplit l'avance de quatre semaines de textes, plus une réserve (Contenu).
- Fini quand : toutes les erreurs plantées exprès dans un jeu de textes d'épreuve sont trouvées, ou chaque oubli est expliqué.
- Vous : vous validez la page « Méthode ».

**11. Juridique.**
- La carte des données.
- L'analyse d'impact, c'est-à-dire l'étude des risques que la loi impose ici, avec les durées de conservation (D-045 ; les autres, propositions de Juridique).
- La carte de consentement, la confidentialité et les conditions d'utilisation (avec l'engagement et la liste fermée des usages, D-042), les mentions légales.
- Les contrats avec les prestataires européens.
- La décision écrite qui dit pourquoi un délégué à la protection des données n'est pas encore obligatoire (D-044).
- Les procédures (effacement ; fuite de données à signaler sous 72 h ; correction d'un texte).
- La première relecture de l'avocat, sur la liste de D-044 (dont la mention IA), avec son devis présenté avant (D-042).
- Fini quand : l'avocat a relu, et chaque procédure a été jouée une fois à blanc.
- Vous : vous signez l'analyse d'impact.

**12. Mesures et exploitation.**
- On mesure ce que les joueurs font, jamais ce qu'ils pensent, sauf deux exceptions, en totaux : la part de « aucune » (D-027) et les trois comptes de mi-bêta (D-052, point 2).
- Les agents lisent la part de « aucune » et les totaux des mesures de la bêta, dans un rapport que vous leur donnez, jamais par un accès ; aucun journal ne leur va (D-052, point 3 ; `docs/etape-6/donnees.md`, P-21).
- Une alerte part à 18h02 si les messages ne sont pas partis ; un seul geste relance l'envoi (D-043). La sonde qui vérifie est chez un second prestataire, et l'alerte part aussi si le site ne répond pas (proposé, Back-end).
- La procédure d'incident d'une page (D-043) dit, pour chacun des trois cas de panne, quoi regarder et quoi toucher, sans avoir à ouvrir une session d'agents (proposé).
- Fini quand : une alerte d'essai est reçue, et vous avez joué la procédure une fois à blanc.
- Vous : vous recevez les alertes ; vous êtes la permanence (D-043).

**13. Vérification finale.**
- Toutes les phrases affichées sont comparées aux textes validés.
- Les lignes rouges sont vérifiées écran par écran, ainsi que l'accessibilité et la présence de la mention IA (D-044).
- Vous : vous jouez une journée.

**14. Boutiques**, avant l'ouverture au public (D-043). Le calendrier exact, dont le test fermé de Google, est à fixer (proposé).
- La question de la structure vous revient avant ce chantier (D-042, D-043) : en nom propre, l'App Store est probablement fermé (règle 5.1.1 (ix) d'Apple).
- Fiches de confidentialité, suppression du compte dans l'application, marge pour un refus d'Apple.
- Chez Google, un compte personnel doit faire tester l'application par 12 personnes pendant 14 jours avant de la publier (vérifié, `docs/etape-5-choix.md`).
- Vous : vous ouvrez le compte Google.

## 5. Étape 7 : bêta, puis lancement

**Avant la bêta (bloquant).**
- La construction et la vérification finale sont terminées.
- Des textes sont prêts d'avance pour toute la bêta, y compris la réserve des trois textes d'entrée : 56 à 84 textes (Contenu).
- L'analyse d'impact existe, au moins en version bêta.
- L'avocat a fait sa première relecture (D-044) : la carte de consentement, « Qui, durée, droits », les conditions d'utilisation avec l'engagement (D-042), l'analyse d'impact en version bêta, les contrats des prestataires, les points de D-024, D-025, D-027, D-035 et D-052 (trois comptes de mi-bêta, totaux lus par les agents, Pas de Côté annoncé au cercle), et la mention IA.
- Une décision écrite dit pourquoi un délégué n'est pas encore obligatoire (D-044).
- La mention IA est en place, et la procédure de correction des textes est prête (D-044).
- La procédure d'incident d'une page est écrite, et vous l'avez jouée à blanc (D-043).
- Les testeurs ont 15 ans ou plus, et savent ce que deviendront leurs données, dont l'effacement après 12 mois sans ouvrir le jeu (D-045).
- L'adresse et l'icône sont définitives, donc le nom est vérifié et le logo est fait.

Votre document (§11.4) tolérait de reporter le juridique pour « un prototype entre amis ». La bêta n'en est pas un : de vraies opinions seront sur un serveur (Juridique, Back-end).

**La bêta proposée.**
- Taille et durée : 8 à 12 cercles réels, soit 40 à 80 personnes, pendant 8 semaines au moins, 12 de préférence. Les tempéraments se calculent sur deux mois, et les premiers curseurs nets arrivent vers trois mois.
- Recrutement en deux temps : vous recrutez 4 à 6 créateurs, qui invitent eux-mêmes leurs proches. C'est l'invitation qu'on teste.
- Un mélange voulu :
  - des cercles de 3 à 10 membres ;
  - des joueurs présents dans plusieurs cercles ;
  - des jeunes de 15 à 25 ans ;
  - des familles de plusieurs générations ;
  - environ la moitié des joueurs sur iPhone.
- Ce qu'on mesure :
  - l'entrée : les invités finissent-ils les trois textes, puis créent-ils leur compte, et par quelle voie (D-041) ?
  - le rendez-vous : combien répondent cinq jours sur sept ? combien ouvrent le jeu dans l'heure qui suit 18h ?
  - les critères de D-005 sur l'ajout de l'icône, puisque le lien est retenu (D-043) ;
  - la part des codes par e-mail qui n'arrivent pas, ou arrivent dans les indésirables (Back-end) ;
  - les textes corrigés après publication (D-044) ;
  - la durée de vie des cercles ;
  - le plaisir de deviner, et les autres mesures de `docs/produit.md` §8 ;
  - les trois comptes de mi-bêta, en totaux, pour le réglage : Pas de Côté par mois, tempéraments en cours, part des joueurs avec au moins un curseur net à 40, 60 et 80 réponses (D-052, point 2 ; `docs/produit.md` §8).
- La mesure du camp, à part du jeu : des lecteurs volontaires, recrutés hors du jeu et qui ignorent le vote, devinent-ils le camp de l'auteur mieux avec nos textes qu'avec l'intitulé officiel seul ? Ce ne sont pas des données de joueurs (D-053, point 1 ; travail 2).
- Deux questionnaires courts, en QCM et sans texte libre (une opinion pourrait s'y glisser). Ils portent sur :
  - la clarté des textes ;
  - la carte de consentement ;
  - l'univers et le nom ;
  - « le jeu t'a-t-il rangé dans un camp ? » ;
  - « une révélation t'a-t-elle mis mal à l'aise avec un proche ? ».
- Un seul lot de réglages, à mi-parcours, appuyé sur les trois comptes (D-052, point 2).

**Avant l'ouverture au public (bloquant).**
- Aucune ligne rouge franchie.
- Les huit tensions en circulation.
- Le registre public de méthode en ligne (§8 de votre document), avec les corrections datées (D-044).
- L'égalité entre groupes conforme à la règle de D-044.
- Un test de charge du pic de 18h.
- Un audit de sécurité extérieur.
- La seconde relecture par l'avocat, complète, période électorale comprise, et l'analyse d'impact finale (D-044).
- Le délégué à la protection des données nommé (D-044).
- Les mentions légales et les conditions d'utilisation en ligne.
- La marque déposée (D-043).
- La contribution libre et les cinq règles de l'argent, avec la liste publique des organisations qui financent le jeu (D-042).
- Les deux boutiques conformes, après la question de la structure (D-043).

Des repères chiffrés vous seront proposés en QCM avant la bêta. Ils éclaireront votre décision sans la prendre (esprit de D-008). Attention au calendrier : si le jeu est ouvert pendant la présidentielle (avril-mai 2027, dates à confirmer), la loi impose une règle de publication pour la veille et le jour du vote.

## 6. Coûts et durées

### Les coûts, selon vos choix

Le budget s'engage dépense par dépense (D-042) : chaque dépense vous est présentée au moment où elle se présente, avec son montant estimé et ce qui en dépend. Cette partie est désormais la vue d'ensemble des coûts, tenue à jour (D-042, point 4, qui nommait le tableau de `docs/etape-5-choix.md` ; cette partie le remplace, consigné par D-046), pour limiter le risque de s'arrêter à mi-chemin ; elle remplace, comme vue d'ensemble, le tableau de `docs/etape-5-choix.md`.

Tous les montants sont des estimations de l'équipe, sauf mention contraire ; aucun n'est un devis. Ils reprennent le tableau de `docs/etape-5-choix.md` (« Ce que ça coûte »), recalculé selon vos réponses.

**Jusqu'à la fin de la bêta, environ 3 000 à 9 000 €**, dans l'ordre où les dépenses se présentent :

| Dépense | Quand | Montant | Ce qui en dépend |
|---|---|---|---|
| Recherche du nom par un conseil en propriété industrielle | Maintenant | Quelques centaines d'euros ; 300 à 800 € (lecture de Back-end : la ligne de l'étape 5, sans le dépôt de la marque) | Le logo, le texte de D-040, l'adresse définitive |
| Logo, fait par l'équipe (D-047) | Fait (D-050) | Aucun frais (pas de graphiste, D-047) | L'icône définitive, figée avant la bêta |
| Compte développeur Apple | Début de l'étape 6 | 99 € par an (sources de 2020-2021, à revérifier) | La connexion Apple, le premier test (travail 4) |
| Un téléphone Android d'essai, si vous l'achetez (proposé ; votre iPhone sert déjà) | Début de l'étape 6 | 100 à 200 € | Le test du message de 18h, les écrans sur Android |
| Hébergement, e-mails et sonde de 18h02, sur six mois | Dès le socle (travail 5) | 200 à 600 € | Tout le jeu |
| Deux ou trois adresses web | Après la vérification du nom, avant la bêta | 50 à 150 € par an | L'icône et l'abonnement au message, liés à l'adresse |
| Chaîne des textes : 56 à 84 textes d'avance, puis un par jour de bêta, environ 150 en tout | Travail 10, puis la bêta | 300 à 2 300 € (prix des modèles non vérifiés) | Les textes de la bêta |
| Avocat, première relecture | Fin du travail 11, avant la bêta | 2 000 à 5 000 € (« quelques milliers » selon Juridique ; fourchette : lecture de l'orchestrateur) | La bêta (bloquant) |
| **Total** | | **environ 3 000 à 9 000 €** | |

Vérification : la somme des lignes donne 3 049 à 9 149 €. Par rapport aux 7 000 à 21 000 € des options recommandées, vos choix retirent :
- la création d'une société et sa comptabilité (en nom propre, D-042) ;
- le développeur qui relisait le code sensible (agents seuls, D-043) ;
- le relecteur des textes (tout automatique, D-044) ;
- le dépôt de la marque française, reporté après la bêta (D-043).

Ce total ne compte pas :
- votre abonnement Claude pour les agents, que l'équipe ne connaît pas ; avec des agents seuls, c'est lui qui paie la construction et l'entretien ;
- votre temps ;
- le prêt ou la location des téléphones du test de 18h (travail 4), non chiffré.

Les six mois d'hébergement sont une hypothèse de calcul, pas une estimation de durée : si la construction dure plus, quelques dizaines d'euros par mois s'ajoutent.

**Pour l'ouverture, environ 8 400 à 21 500 €** (lecture de Back-end, à partir des lignes de l'étape 5) :
- l'audit de sécurité : 3 000 à 10 000 € ;
- la seconde relecture par l'avocat : 2 000 à 5 000 € ;
- le délégué à la protection des données : quelques milliers d'euros par an (2 000 à 5 000 €, même lecture) ;
- la marque française, 270 €, puis européenne, 1 050 € (vérifié, sources secondaires). Déposée dans les six mois qui suivent la française, l'européenne garde sa date (de mémoire) ;
- le compte Google : 25 $ une fois ;
- le test de charge du pic de 18h : quelques dizaines d'euros.

S'y ajouteraient, selon la réponse à la question de la structure (D-043) : une société coûte environ 200 à 250 € à créer (vérifié, sources secondaires), puis 600 à 1 500 € de comptabilité par an. Et sur la contribution libre payée dans une application, Apple ou Google prennent une commission, de l'ordre de 15 % pour un petit éditeur (de mémoire).

**Ensuite, chaque mois :**
- la chaîne des textes : environ 100 à 700 € ;
- l'hébergement, les e-mails et la sonde : 60 à 190 € pour 1 000 joueurs, 150 à 400 € pour 10 000 ;
- le compte Apple, 99 € par an, et le délégué, quelques milliers d'euros par an ;
- l'entretien : deux à quatre jours de travail par mois (estimation de Back-end : mises à jour de sécurité, changements d'iOS, règles des boutiques, format des données de l'Assemblée). Avec des agents seuls, il ne fait pas de facture, mais il prend des sessions d'agents et votre temps de validation.

### Les durées

**Délais justifiés :**
- le test du message de 18h prend environ une semaine ;
- la bêta dure 8 à 12 semaines ;
- si une consultation de la CNIL est nécessaire, elle prend 8 semaines, prolongeables ;
- avant la publication sur Google Play, un compte personnel impose un test fermé de 14 jours avec 12 personnes (vérifié) ; un compte au nom d'une société demande un numéro d'entreprise qui peut prendre jusqu'à 30 jours.

**La construction (étape 6), jusqu'à l'entrée en bêta, boutiques exclues : environ 3 à 6 mois.** Cette fourchette ne compte ni le travail 14 (boutiques) ni la bêta ; elle compte la chaîne des textes, avec sa marche à blanc, et la première relecture de l'avocat (hypothèses ci-dessous). Ordre de grandeur donné par Back-end et Front-end, à faible confiance. Ce n'est ni un engagement ni une date, et ce n'est pas une date de sortie : la bêta, la question de la structure et les boutiques s'ajoutent, et ne sont pas estimables (plus bas).
- Pourquoi on peut l'estimer maintenant : vos choix ont retenu le chemin le plus court avant la bêta sur les trois points qui l'empêchaient (le lien d'abord, des agents seuls, des textes tout automatiques).
- Sur quoi elle repose :
  - les essais : des agents ont construit et contrôlé chacune des deux pages ; la préparation du second essai était annoncée à « au moins sept à huit jours avant le premier jour » (D-033) ;
  - les trois travaux sur papier et le test du message de 18h en parallèle : deux à trois semaines ;
  - le serveur, les comptes, le moteur et les écrans : la plus grosse part, jamais faite par l'équipe ;
  - la chaîne des textes, menée en même temps, avec sa marche à blanc ;
  - la relecture de l'avocat, rendue dans le mois qui suit la remise des documents (hypothèse).
- Hypothèses :
  - vous validez un livrable en quelques jours, et des sessions d'agents sont ouvertes régulièrement (un agent ne travaille que si une session est ouverte, D-036) ;
  - le test du message de 18h et la connexion depuis l'icône réussissent du premier coup ;
  - aucune consultation de la CNIL n'est nécessaire ;
  - l'égalité entre groupes tient sur le stock réel ;
  - vos propres démarches (compte Apple, conseil, devis d'avocat) sont faites au début de l'étape : elles sont sur le chemin critique.
- Ce qui l'allongerait : une consultation de la CNIL (8 semaines au moins) ; une question qui vous revient (connexion depuis l'icône, égalité entre groupes) ; un avocat qui demande de refaire la carte de consentement ; une chaîne des textes qui ne passe pas son banc d'essai. La borne basse suppose que toutes les hypothèses tiennent en même temps ; qu'une seule tombe, et on est vers la borne haute ou au-delà.
- Pourquoi la confiance est faible : l'équipe n'a jamais construit de serveur ni de vraie connexion, et les estimations des agents se sont déjà écartées du réel (la page du second essai pesait 700 Ko au lieu des 340 à 550 Ko annoncés).
- L'équipe recalera cette fourchette après les trois travaux sur papier et le test du message de 18h, quand un premier morceau de serveur existera.

**De la fin de la bêta à l'ouverture : pas encore estimable.** Cette durée dépend de la réponse à la question de la structure (D-043), de la revue d'Apple, dont un refus est possible, et de l'audit de sécurité.

## 7. Points d'attention

**Ce que vos choix concentrent sur vous.** Ce sont les choix que vous avez faits ; ce qui suit dit seulement ce qu'ils vous demanderont, pour que rien ne vous surprenne.
- **Le soir.** Vous êtes le seul recours humain, le dimanche compris (D-043). L'exigence « rien ne se calcule à 18h pile » et la procédure d'une page rendent la permanence légère, sans la supprimer. Les jours où vous n'êtes pas joignable vers 18h, un message peut partir en retard.
- **Les vrais téléphones.** Des agents ne peuvent pas tenir un téléphone ni écouter le lecteur d'écran d'un iPhone (VoiceOver). Les essais sur appareil reposent sur vous et, si vous l'achetez (proposé), sur un Android d'essai : le premier test, le petit écran, le très grand texte, VoiceOver (Front-end).
- **La responsabilité.** En nom propre, vous êtes responsable des données et des textes publiés (D-042, D-044), sur vos biens personnels. Une erreur d'un texte automatique peut viser un député nommé à 18h : la procédure de correction doit être rodée dès la bêta.
- **La relecture.** Le code qui garde des opinions et les textes ne sont relus que par des modèles, ceux des textes chez un seul fournisseur (D-043, D-044).
- **Le changement de structure.** Si une structure est créée avant les boutiques, elle devient responsable des données à votre place : il faudrait prévenir chaque joueur et probablement redemander son accord (à confirmer par l'avocat, D-042).
- **Le budget, dépense par dépense.** Il reste souple, mais il n'y a pas d'enveloppe : la vue d'ensemble de la partie 6 est mise à jour à chaque dépense.

**Les autres points.**
- **Le message de 18h sur iPhone.** Le lien étant retenu, la bêta mesure le geste d'ajout de l'icône avec les critères de D-005, avant le passage aux boutiques.
- **Les quatre tensions jamais essayées** sont les plus proches du clivage gauche-droite. Elles ont été éprouvées sur papier (travail 2, D-053) ; la bêta dira si nos textes trahissent le camp (mesure par des volontaires) et comment se lisent « l'indépendance » (au sens personnel ou territorial) et « le privé » (sur un texte d'école) (D-053).
- **Le nom et l'icône.** Le nom circule sans protection pendant la bêta, puisque la marque est déposée après (D-043), alors que l'adresse et l'icône sont figées avant elle. Si le nom échoue, chaque joueur devra réinstaller l'icône (Front-end).
- **Les liens ouverts dans une messagerie.** Certaines messageries ouvrent les liens dans leur propre navigateur. Un invité qui choisit « Plus tard » à l'écran du code peut alors perdre sa partie en rouvrant le jeu dans Safari. À voir avec UX avant le travail 9 (Front-end).
- **Le calendrier électoral.** Selon la durée réelle de la construction, la bêta pourrait se tenir pendant la campagne présidentielle de 2027. Juridique dira avant la bêta si cela change quelque chose pour une bêta fermée (proposé).
- **Décisions déjà validées que l'équipe pourrait vous demander de rouvrir**, après la bêta (rien ne change aujourd'hui) :
  - D-006 :
    - l'inscription à partir de quinze ans, sur simple déclaration : une loi en cours de réécriture pourrait ne plus s'en contenter (Juridique) ;
    - le cercle lancé à trois, si les cercles de trois s'avèrent trop maigres (Game design) ;
  - la règle 18 et le §5 : trois mois pour les premiers curseurs nets, un seuil à recaler (Game design) ;
  - la règle 14, Le Sans-Faute : presque impossible tel qu'il est écrit (Game design) ;
  - « Tout effacer », si la loi oblige à garder certaines données d'identification (question pour l'avocat, Juridique).
- **Les règles restées ouvertes** sont listées dans `docs/produit.md` (« Ce que ces décisions laissent à régler ») ; le travail 1 en a fermé dix-neuf sur vingt (D-052) ; restent les voix sous le vote (E4).

Les plans détaillés de chaque spécialiste sont gardés par l'orchestrateur, et repris au début de l'étape 6.
