# Feuille de route

*État au 4 octobre 2026. Assemblée à partir des avis UX, Game design, Contenu, Juridique, Back-end et Front-end, relue par Cohérence et le Vérificateur. Mise à jour à la fin de chaque phase. Les durées et les coûts sont des estimations, pas des engagements.*

## En un coup d'œil

| Phase | Ce qu'on fait | Durée | Quand (au plus tôt) | Statut |
|---|---|---|---|---|
| Fondations | Vision, équipe, web ou application, onboarding | — | — | ✅ fait |
| Règles | Trancher les règles dont le prototype a besoin ; préparer textes et protocole | 2 semaines | mi-octobre 2026 | à faire |
| Prototype | Jouer le jeu à la main sur WhatsApp avec un vrai cercle | 2 semaines de jeu | début novembre | à faire |
| Conception | Bilan ; règles complètes ; design (nom, ton, identité, écrans) ; plan du contenu ; choix juridiques et budget | 4 semaines | fin novembre | à faire |
| Construction | Écrire l'application web, bêta fermée de dix cercles, puis les boutiques | 4 à 5 mois, jusqu'à 7,5 avec la marge | de décembre 2026 au plus tôt (plutôt janvier) à mai-juin 2027 | à faire |
| Lancement | Juridique final, lancement public | 2 à 4 semaines | début de l'été 2027 | à faire |

**Lancement public : au plus tôt début de l'été 2027 ; l'automne 2027 avec la marge ; plus tard s'il faut un second prototype ou consulter la CNIL.** Ce qui ralentit le plus, ce ne sera pas la production mais les décisions et les tests avec de vraies personnes.

**Quand on choisit le design** : en Conception (nom, ton, identité visuelle avec un graphiste, écrans). **Quand on code** : en Construction seulement, avec votre accord explicite. Construction et Lancement forment ensemble l'étape 6 de votre méthode (§0, D-001) : aucun code avant.

## Ce qui change par rapport à votre document

- **L'ordre (§0).** Votre méthode prévoyait écrans, puis règles, puis prototype. Les spécialistes proposent **règles, puis prototype, puis écrans** : les règles décident de ce que montrent les écrans, et un prototype sur WhatsApp n'a pas besoin d'écrans. UX dessine les écrans du jeu quotidien en parallèle (UX les voulait avant le prototype, Game design pendant) ; les onglets Le Cercle et Moi viennent après. Le nom, l'identité et les choix juridiques, que le §0 rangeait dans la construction, passent en Conception. **À valider par vous.**
- **Le prototype (§11)** : 19 textes au lieu de 10. Game design en compte 17 (14 quotidiens et 3 d'entrée), seul chiffre qui couvre quatorze jours ; Contenu en comptait 15, dont 2 de réserve. Retenu : 17 plus 2 de réserve.
- **Le juridique avance (§11.4).** L'analyse d'impact (l'évaluation écrite des risques pour les données, exigée par le RGPD avant de traiter des opinions politiques) et la politique de confidentialité sont nécessaires avant les premiers cercles réels sur le web, pas seulement avant le lancement public (Juridique).
- **La surcouche présidentielle (§11.7)** prévue à partir de février 2027 n'est pas tenable : le lancement public vient après le scrutin (18 avril et 2 mai 2027, d'après la presse). Seule la bêta tombera pendant la campagne. À trancher en Conception : abandonner ou repenser.

## Règles (2 semaines)

**Pourquoi maintenant** : le prototype ne peut pas tourner tant qu'on ne sait pas ce qui est révélé à 18h ni ce que voit le joueur.

**Vous décidez**, en QCM :
1. La chronologie de la révélation (C-006) : tout le même soir, ou le vote et l'auteur un soir plus tôt. Game design recommande « tout le même soir ».
2. « Aucune de ces raisons » comme cinquième choix (C-005). Change le §2, qui prévoit quatre considérations.
3. Le lien vers le scrutin officiel : visible avant 18h (§8) ou seulement à la révélation, car la page du scrutin montre l'auteur et le vote (Contenu). Change le §8.
4. L'âge des textes : Contenu recommande des textes votés il y a moins d'un mois.
5. Le prototype : un cercle ou deux, de six à huit proches chacun ; vous dedans ou dehors. Game design recommande que vous n'en soyez pas membre, sinon les joueurs s'autocensurent ; deux cercles donnent un verdict plus fiable mais doublent votre charge.

**Vous faites** : choisir les proches (majeurs) ; fixer une date qui couvre deux dimanches (les titres tombent le dimanche) ; recueillir leur accord écrit, qui dit que vous lirez toutes les réponses et qu'elles seront effacées à la fin (Juridique).

**L'équipe produit** : les règles v1 sur une page et le protocole que vous déroulerez (Game design) ; les 19 textes (Contenu) ; les messages du prototype (invitation, carte de consentement, message de 18h, révélations) et la grille d'observation (UX).

**Fini quand** : vous pouvez dérouler le protocole seul, et chaque texte a passé ses vérifications.

## Prototype (2 semaines de jeu)

**Ce qu'il doit montrer** (des indices, pas des preuves : six à huit joueurs ne suffisent pas à prouver ; seuils de Game design, à recaler ensuite) :
- **Le rendez-vous tient** : en deuxième semaine, les trois quarts jouent au moins 5 jours sur 7, sans relance.
- **La conversation naît** : le groupe échange spontanément après 18h au moins 4 soirs sur 7.
- **C'est jouable** : 35 à 65 % d'attributions justes, et « j'aurais pu trouver » plutôt que « c'est au hasard ».
- **Sans conflit** : aucun incident, aucun départ, une personne au plus se dit exposée.
- **Titres et portrait parlent** : la moitié cite un titre sans qu'on le demande ; deux sur trois jugent juste leur phrase de portrait.

**Vous faites** : vous jouez la machine. Vous recevez les réponses en privé, envoyez à chacun ce qu'il doit deviner, publiez la révélation à 18h, sans jamais relancer. Comptez 1 à 2 heures par jour. En parallèle, faites lire la vision à 3 à 5 personnes extérieures (D-004).

**À la fin** : rendez-vous, conversation et absence de conflit tenus → on continue. Difficulté, titres ou portrait ratés → on ajuste les règles. Rendez-vous ou conversation ratés → second prototype avant tout code. Conflit → pause, la révélation est à repenser.

**Ce qu'il ne montre pas** : la mortalité du cercle sur des mois (§11.5), le portrait à trois mois, l'entrée par le lien. La bêta le mesurera.

## Conception (4 semaines)

**Vous décidez** :
- **Suite** : continuer, ajuster ou refaire un prototype, au vu du bilan chiffré.
- **Règles** : palmarès, statistiques et écran personne face aux lignes rouges (C-003 ; UX y ajoute les « désaccords passés à plat » du §6) avant de dessiner les onglets Le Cercle et Moi ; « Le Mesuré » (§4) ; plafond d'attributions (§11.6) ; archives en v1 ou plus tard (Game design ; change le §6 si reportées) ; parade à la mortalité du cercle (§11.5) ; surcouche 2027.
- **Design** : nom du produit, ton, identité visuelle.
- **Contenu** : Sénat ou non ; quotas par commission ; ce que publie le registre public (jamais de chiffre sur ce que pensent les joueurs, §9) ; relecture humaine les premiers mois (change « entièrement automatisée », §8).
- **Argent et structure** : l'orientation du modèle économique (§11.3) — gratuit, abonnement, dons et subventions, licence sans données — qui décide du type de structure (association, société). Écartés si vous confirmez la recommandation du §9 : publicité, vente de données même agrégées.
- **Construction** : qui écrit le code (l'équipe d'agents sous votre contrôle, un développeur, ou les deux), et l'enveloppe totale. Les durées en dépendent.
- **Succès** : les quelques chiffres qui diront, en bêta puis après le lancement, si le jeu marche, et comment on trouvera des joueurs après le lancement.

**Vous faites** : choisir un graphiste ; vérifier que le nom est libre (domaine, marque) ; lancer la création de la structure (association gratuite ; société de 300 à 3 000 € ; 2 à 4 semaines) ; demander deux devis d'avocat spécialisé en données personnelles.

**L'équipe produit** : le bilan du prototype ; les règles complètes ; les écrans des trois onglets et tous les textes à l'écran ; le cahier des charges de l'identité visuelle ; le cahier de la chaîne de contenu ; le budget total chiffré.

**Fini quand** : plus aucune question de règle ni d'écran n'est ouverte pour la construction, et le budget est arrêté.

## Construction (4 à 5 mois, jusqu'à 7,5 avec la marge)

**Il faut votre accord explicite pour commencer** (D-001).

**Vous décidez** au départ : l'hébergeur, dans l'Union européenne (Back-end recommande un hébergeur européen plutôt qu'américain en région européenne) ; au nom de qui sont les comptes (vous ou la structure) ; les deux fournisseurs de modèles pour le contenu ; le budget mensuel. Les choix techniques (langage, bibliothèques) restent aux spécialistes.

**Vous faites** : ouvrir les comptes avec double authentification (domaine, hébergeur, envoi d'e-mails, modèles avec un plafond de dépense) ; signer l'analyse d'impact et les contrats avec les prestataires qui traitent les données (vous êtes responsable du traitement) ; recruter dix cercles pour la bêta fermée, soit 30 à 100 personnes ; valider la révélation sur téléphone.

**Jalons** (Back-end et Front-end) :
1. Le message de 18h arrive sur cinq téléphones, trois soirs de suite (D-005).
2. Un cercle de test joue sept jours sur le web sans aide.
3. Un inconnu entre seul par le lien ; quatorze messages de 18h reçus à l'heure.
4. La chaîne publie quatorze textes d'affilée, relecture comprise, avec une semaine d'avance.
5. Bêta fermée : dix cercles invités, pas encore le public ; on mesure qui reçoit le message de 18h et qui joue (critères de D-005) ; suppression de compte vérifiée.
6. L'application est acceptée sur les deux boutiques ; un joueur web et un joueur de l'application jouent dans le même cercle. Les critères de D-005 peuvent avancer ce jalon.

**Avant les premiers cercles réels** : analyse d'impact v1, politique de confidentialité, hébergeur dans l'Union européenne, contrats avec les prestataires, durées de conservation (Juridique).

**Durées** : Back-end compte 4 à 5 mois boutiques comprises, plus 50 % de marge pour un premier projet ; Front-end compte environ 3 mois pour l'interface avec un développeur à plein temps. L'écart dépend de qui code.

## Lancement (2 à 4 semaines)

**Vous décidez** : la date ; la consultation de la CNIL (l'autorité française de protection des données) si l'analyse d'impact laisse un risque, ce qui ajoute 8 à 14 semaines.

**Vous faites** : faire relire par l'avocat les conditions d'utilisation, la carte de consentement et l'exception de D-006 ; pour un compte d'organisation sur les boutiques, obtenir un numéro D-U-N-S (identifiant d'entreprise gratuit exigé par Apple et Google).

**Fini quand** : l'avocat a validé par écrit, et le jeu est ouvert au public.

## Coûts connus à ce jour

Hébergement : 50 à 150 € par mois. Modèles pour le contenu : 1 à 5 € par texte, soit 30 à 150 € par mois. Apple : 99 € par an ; Google : 25 $ une fois. Structure : 0 à 3 000 €. Avocat : quelques milliers d'euros, à confirmer par devis. Graphiste et, le cas échéant, développeur : à chiffrer en Conception.
