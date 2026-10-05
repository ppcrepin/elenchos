# Plan de construction : de l'essai au lancement

*Synthèse de l'orchestrateur, 5 octobre 2026, à partir des plans de Back-end, Front-end, Contenu, Juridique et Game design (avec UX). Relue par Cohérence puis par le Vérificateur (« OK avec corrections », appliquées). Elle complète `docs/feuille-de-route.md` sans rien décider : les choix de l'étape 5 vous seront posés en QCM à ce moment-là (D-009), et le code ne commence qu'avec votre accord explicite (D-001). Les durées ne sont données que lorsqu'un spécialiste peut les justifier. Les points de droit viennent de l'agent Juridique : il n'est pas avocat, et il a vérifié une partie des faits dans des sources secondaires ; un avocat relira tout avant la bêta ou avant l'ouverture (choix 8 de l'étape 5).*

## 1. Où on en est

**Étapes 1 à 3 : faites.** Le produit est défini (`docs/produit.md`, D-010), dessiné (D-011) et habillé (univers La Tablée D-012, nom de travail Elenchos D-013, maquettes finales D-014). Il reste la fin de l'étape 3 : vérifier que le nom est libre, puis faire le logo.

**Étape 4, l'essai : en cours.** Vous jouerez seul, avec quatre personnages simulés, sur votre iPhone ou votre iPad (D-015 à D-017, D-019).

Fait :
- les règles de la simulation, écrites, vérifiées et figées ;
- 17 vrais textes de l'Assemblée et 68 vrais arguments de députés : choisis, rédigés, vérifiés par un second modèle, puis corrigés ;
- le classement des arguments, fait deux fois à l'aveugle : après correction, 67 arguments sur 68 classés pareil ;
- le vote de chaque texte, relevé deux fois.

En cours :
- la dernière relecture du lot de textes, avec l'affichage du vote, désormais daté, et quatre points d'affichage (un cas d'auteur que le gabarit ne prévoyait pas, le nom des groupes, l'écriture des nombres et des apostrophes) ;
- la page-test de l'icône : votre première ouverture a réussi.

Changé en route : le test de mémoire a montré que, sur iPhone, une page ouverte dans claude.ai perd tout quand l'application se ferme. L'essai se jouera donc depuis une icône de votre écran d'accueil (D-019).

## 2. Les prochaines étapes, jusqu'à la fin de l'essai

1. **Page-test de l'icône.** Vous rouvrez l'icône une minute après l'avoir fermée, puis une dernière fois demain. Entre les deux, l'équipe publie une version 2 ; vous n'avez rien à faire.
2. **Fin de la préparation.** Dernière relecture du lot de textes ; mise à jour de la simulation pour l'icône et pour l'affichage (circuit complet).
3. **Scellement.** Un agent distinct écrit le fichier qui fige à l'avance toutes les réponses des personnages ; la difficulté est réglée une fois pour toutes sur 200 parties simulées. Son empreinte est publiée dans la conversation et sur `main` avant votre première séance : vous pourrez vérifier à la fin que rien n'a bougé.
4. **La page de l'essai.** Elle est construite, puis contrôlée par un programme écrit à part, sur trois parties jouées par des joueurs fictifs écrits pour couvrir des cas précis, et sur 200 parties jouées au hasard (contrôles 1 à 14 de la simulation).
5. **Livraison.** L'équipe vous donne le lien et une courte liste de ce qu'il faut savoir.
6. **Vous jouez.** 16 séances (l'entrée, 14 jours de jeu, la clôture), à votre rythme (D-016). Pendant l'essai, vous n'avez rien à envoyer. À la fin, ou si vous l'arrêtez avant, vous copiez votre carnet dans la conversation.
7. **Bilan de l'essai.** Le bilan croise les chiffres de votre carnet et ce que vous avez ressenti : le plaisir de deviner au fil des jours, la difficulté, la durée d'une journée de jeu, la clarté des textes. Puis les règles restées ouvertes vous sont soumises en QCM : les constats C-007 à C-016 (manques du produit relevés en préparant l'essai), C-017 à C-021 (relevés depuis) et les conventions prises pour l'essai. Le produit est corrigé. C'est la fin de l'étape 4.

## 3. Étape 5 : les choix de fabrication

Vous les trancherez après le bilan, en QCM, chacun avec ses options et ce qui fait pencher. Ils sont rangés selon les dépendances les plus fortes. Exception : le premier dépend aussi du neuvième, le modèle économique (Juridique).

**1. Qui porte le service.**
- Options : une société, une association, ou vous en nom propre (pour le web seulement).
- Ce qui fait pencher : Apple demande une personne morale pour une app qui garde des données sensibles. En nom propre, la responsabilité est personnelle.

**2. Lien ou application** (D-005, suspendu).
- Options : le lien d'abord, puis les deux boutiques ; l'application tout de suite ; le lien seul.
- Ce qui fait pencher : sur iPhone, le message de 18h n'arrive par le lien qu'après l'ajout d'une icône. Si le lien est retenu, la bêta mesurera ce geste. Autre contrainte : l'invitée ouvre un lien et voit le premier texte tout de suite, sans compte (D-006). Une installation préalable casserait ce parcours (Front-end, Game design). Enfin, Apple peut refuser une application qui n'est qu'un site mis dans une boîte : la version des boutiques devra apporter un vrai plus, le message de 18h (Front-end, à revérifier à l'étape 5).

**3. Qui code.**
- Options : des agents Claude, que vous validez en jouant sur un lien d'aperçu ; un prestataire ; ou des agents, plus un développeur qui relit le code et assure la permanence du soir.
- Ce qui fait pencher : le budget, qui entretiendra le code dans deux ans, et surtout qui répare un dimanche à 18h05 si la révélation n'est pas partie.

**4. Production des textes.**
- Options :
  - tout automatique ;
  - validation humaine de chaque texte ;
  - relecture d'un échantillon.
- À fixer aussi : les fournisseurs de modèles, l'avance de textes, la règle d'équilibre entre groupes, le contenu du registre public.
- Ce qui fait pencher :
  - aucun lot de l'essai n'a passé sa première vérification sans correction ;
  - depuis le 2 août 2026, un texte d'intérêt général écrit par une IA doit le dire, sauf vraie relecture humaine (règlement européen sur l'IA, dit AI Act, art. 50.4 ; l'avocat devra confirmer que cet article s'applique à un jeu).
- Attention : la validation humaine, la relecture d'un échantillon ou un seul fournisseur de modèles modifieraient le §8 de votre document (« production entièrement automatisée », vérification chez un autre fournisseur), que vous aviez choisi.

**5. Où vivent les données.**
- Options : des prestataires européens seulement, ou américains installés en Europe.
- Ce qui fait pencher : des opinions politiques rattachées à une adresse e-mail ; le cadre d'échange de données entre l'Union européenne et les États-Unis est contesté devant la Cour de justice.

**6. L'engagement « ni vente, ni exploitation, ni publicité ».**
- D'abord le confirmer : votre document le recommande (§9) ; `produit.md` §6 le laisse à confirmer à cette étape.
- Puis choisir sa force : conditions d'utilisation, statuts, clause en cas de rachat.
- Ce qui fait pencher : seuls le contrat et les statuts permettent de vous le faire respecter en justice.

**7. Durées de conservation.**
- Options : un compte inactif est effacé sans prévenir, au bout d'une durée annoncée dès le départ, ou bien après un e-mail ; les titres d'un membre parti restent sous son pseudo, ou sous « un ancien membre » (ce qui préciserait la règle 4 de `produit.md`).
- Ce qui fait pencher : un e-mail d'avertissement toucherait « aucune relance » (D-010) ; le droit à l'effacement penche pour « un ancien membre ».

**8. Avocat et délégué à la protection des données.**
- Options : une relecture par l'avocat avant la bêta et une autre avant l'ouverture, ou une seule avant l'ouverture. Le délégué à la protection des données (la personne qui veille au respect de la loi sur les données) : obligatoire ou non selon la taille du service, à faire trancher par l'avocat.
- Ce qui fait pencher : dès la bêta, de vraies opinions sont gardées sur un serveur.

**9. Modèle économique et budget.**
- Options : un jeu gratuit financé hors du jeu, une contribution sans avantage, ou un supplément autour du portrait.
- Ce qui fait pencher : rien de payant ne doit toucher les points ni le rendez-vous, ni l'absence de publicité (recommandation du §9, à confirmer au choix 6).

**10. Marque et adresse.**
- Le dépôt de la marque, dans trois catégories (applications, jeux, logiciel en ligne), se fait après la bêta et avant l'ouverture (Juridique).
- L'adresse web définitive : l'adresse et l'icône ne peuvent plus changer une fois les joueurs installés.
- La vérification du nom et le logo restent la fin de l'étape 3 (D-013).

## 4. Étape 6 : construire, avec votre accord

Les trois premiers travaux se font sur papier. Le test du message de 18h est le premier code de l'étape.

**1. Préparer les règles.**
- Chaque règle du jeu reçoit un chiffre et un exemple joué.
- Les réglages sont calés sur des cercles simulés (3, 5 et 10 membres, sur douze semaines).
- Une dizaine de journées sont jouées à la main ; le code devra les reproduire.
- Fini quand : aucune règle n'est sans cas chiffré.
- Vous : vous voyez « ce que vit un cercle type en trois mois ».

**2. Les quatre tensions jamais essayées** (Égalité/Mérite, Solidarité/Responsabilité, État/Marché, Souveraineté/Ouverture).
- On produit leurs libellés et leurs phrases, et deux textes d'épreuve pour chacune.
- Fini quand : les deux classements concordent, et un modèle ne devine pas le camp de l'auteur.
- Vous : vous lisez les huit textes.

**3. Exigences de protection des données**, remises avant d'écrire le code.
- L'e-mail est séparé des réponses.
- Rien de personnel dans les messages ni dans les journaux techniques.
- Aucun outil de mesure extérieur.
- Le consentement est prouvé, et l'effacement est réel.
- Fini quand : chaque exigence a son test automatique.
- Vous : vous lisez « qui voit quoi ».

**4. Test du message de 18h** : une page nue, cinq téléphones, trois soirs (D-005).
- Fini quand : le message arrive vers 18h sur les cinq téléphones, trois soirs de suite.
- Vous : vous le recevez sur votre téléphone.

**5. Socle et données.**
- Hébergement et sauvegardes chiffrées.
- Le cloisonnement des cercles est imposé par la base elle-même.
- Fini quand : une restauration complète réussit, et les lignes rouges passent en tests automatiques.
- Vous : les comptes (hébergeur, domaine, e-mail) sont à votre nom.

**6. Horloge du jeu** : 18h, dimanche, pause, remise à zéro du lundi, changements d'heure.
- Fini quand : tout calcul rejoué donne le même résultat.

**7. Les écrans** : les 51 écrans validés, le catalogue des éléments graphiques, le jeu du jour, la révélation, l'entrée et l'invitation, Le Cercle et Moi.
- Quelques écrans jamais dessinés (réglages, code reçu par e-mail, réveil d'un cercle, quitter un cercle, la vraie page « Qui, durée, droits ») sont dessinés à leur tour.
- Fini quand :
  - chaque écran est posé à côté de sa maquette ;
  - la boucle quotidienne dure environ 90 secondes ;
  - rien de la révélation n'arrive dans le téléphone avant 18h.
- Vous : vous validez les nouveaux écrans, comme en D-011 et D-014, puis vous jouez sur un lien d'aperçu.

**8. Moteur de calcul** : cartes, points, titres, badges, portrait, phrases.
- Fini quand : il donne les mêmes résultats que le programme de contrôle de l'essai, plus des cas à plusieurs cercles.
- Vous : vous jouez une semaine en une heure, avec une horloge accélérée.

**9. Comptes, invitation, messages de 18h.**
- Fini quand :
  - on passe du lien au compte en moins de trois minutes ;
  - la demande du message vient après la première révélation (condition 1 de D-005, suspendu ; Game design la garde dans les deux branches).
- Vous : vous vous invitez depuis un second téléphone.

**10. Chaîne des textes.**
- On construit le relevé quotidien de l'open data, la sélection et le calendrier, la rédaction, la vérification, la règle d'erratum et le registre public.
- Puis une marche à blanc : la chaîne tourne chaque jour sans rien publier, et remplit l'avance.
- Fini quand : toutes les erreurs plantées exprès dans un jeu de textes d'épreuve sont trouvées, ou chaque oubli est expliqué.
- Vous : vous validez la page « Méthode ».

**11. Juridique.**
- La carte des données.
- L'analyse d'impact, c'est-à-dire l'étude des risques que la loi impose ici.
- La carte de consentement, la confidentialité, les conditions d'utilisation, les mentions légales.
- Les contrats avec les prestataires.
- Les procédures (effacement ; fuite de données à signaler sous 72 h).
- Fini quand : l'avocat a relu, et chaque procédure a été jouée une fois à blanc.
- Vous : vous signez l'analyse d'impact.

**12. Mesures et exploitation.**
- On mesure ce que les joueurs font, jamais ce qu'ils pensent.
- Une alerte part si la révélation n'est pas faite à 18h01.
- Fini quand : une alerte d'essai est reçue.
- Vous : vous recevez les alertes, ou à défaut la personne de permanence.

**13. Vérification finale.**
- Toutes les phrases affichées sont comparées aux textes validés.
- Les lignes rouges sont vérifiées écran par écran, ainsi que l'accessibilité.
- Vous : vous jouez une journée.

**14. Boutiques**, si vous les retenez : fiches de confidentialité, suppression du compte dans l'app, marge pour un refus d'Apple. Vous ouvrez les comptes Apple et Google.

**Les branches :**
- Si l'application est choisie d'emblée :
  - le test du message de 18h se fait avec les versions de test des boutiques (Back-end) ;
  - l'invitation doit quand même s'ouvrir sans installation (D-006) : il y a alors deux versions à construire.
- Si un prestataire code, ce plan devient son cahier des charges, et l'équipe relit son travail.
- Si ce sont des agents qui codent, tout se prouve par des tests automatiques, et il faut prévoir un recours humain pour les incidents du soir.

## 5. Étape 7 : bêta, puis lancement

**Avant la bêta (bloquant).**
- La construction et la vérification finale sont terminées.
- Des textes sont prêts d'avance pour toute la bêta, y compris la réserve des trois textes d'entrée.
- L'analyse d'impact existe, au moins en version bêta.
- Les testeurs ont 15 ans ou plus, et savent ce que deviendront leurs données.
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
  - l'entrée : les invités finissent-ils les trois textes, puis créent-ils leur compte ?
  - le rendez-vous : combien répondent cinq jours sur sept ? combien ouvrent le jeu dans l'heure qui suit 18h ?
  - si le lien est retenu, les critères de D-005 sur l'ajout de l'icône ;
  - la durée de vie des cercles ;
  - le plaisir de deviner.
- Deux questionnaires courts, en QCM et sans texte libre (une opinion pourrait s'y glisser). Ils portent sur :
  - la clarté des textes ;
  - la carte de consentement ;
  - l'univers et le nom ;
  - « le jeu t'a-t-il rangé dans un camp ? » ;
  - « une révélation t'a-t-elle mis mal à l'aise avec un proche ? ».
- Un seul lot de réglages, à mi-parcours.

**Avant l'ouverture au public (bloquant).**
- Aucune ligne rouge franchie.
- Les huit tensions en circulation.
- Le registre public de méthode en ligne (§8 de votre document).
- L'équilibre entre groupes conforme à la règle choisie à l'étape 5.
- Un test de charge du pic de 18h.
- Un audit de sécurité extérieur.
- Une relecture complète par l'avocat, et l'analyse d'impact finale.
- Les mentions légales et les conditions d'utilisation en ligne.
- Une décision écrite sur le délégué à la protection des données.
- La marque déposée.
- La mention IA ou la relecture humaine en place.
- Les boutiques conformes, si vous les retenez.

Des repères chiffrés vous seront proposés en QCM avant la bêta. Ils éclaireront votre décision sans la prendre (esprit de D-008). Attention au calendrier : si le jeu est ouvert pendant la présidentielle (avril-mai 2027, dates à confirmer), la loi impose une règle de publication pour la veille et le jour du vote.

## 6. Durées et coûts

- **Construction : non estimable aujourd'hui.** Il faut savoir qui code, choisir entre lien et application, et fermer les règles restées ouvertes.
- **Délais justifiés :**
  - le test du message de 18h prend environ une semaine ;
  - la bêta dure 8 à 12 semaines ;
  - si les boutiques sont retenues et que le compte Google est au nom d'une société, le numéro d'entreprise qu'il exige prend jusqu'à 30 jours (un compte personnel impose à la place un test fermé de 14 jours) ;
  - si une consultation de la CNIL est nécessaire, elle prend 8 semaines, prolongeables.
- **Coûts, en ordres de grandeur non vérifiés en ligne :**
  - pendant la bêta : hébergement de 20 à 60 € par mois, e-mails de 0 à 20 € par mois, domaine d'environ 15 € par an ;
  - à 10 000 joueurs : 100 à 300 € par mois ;
  - boutiques : Apple environ 99 € par an, Google 25 $ une fois ;
  - audit de sécurité : quelques milliers d'euros ;
  - marque : 190 € à l'INPI, plus 40 € par classe supplémentaire, puis environ 850 € pour l'Union européenne ;
  - un iPhone et un Android d'entrée de gamme pour les tests, ou un service de téléphones à distance (l'équipe n'en a aucun) ;
  - avocat : non chiffré.
- **Le gros poste :** le temps de qui code, et la permanence du soir.

## 7. Points d'attention et désaccords

- **Le message de 18h sur iPhone.** Si le lien d'abord est retenu, Front-end, Back-end et Game design s'accordent pour mesurer en bêta le geste d'ajout de l'icône, avant de passer aux boutiques.
- **Les chiffres sur les choix des joueurs.** Le §8 de votre document prévoit un « taux de choix par option », alors que `produit.md` §8 ne mesure que ce que les joueurs font. Les positions :
  - Back-end ne prévoit pas ce calcul par défaut ;
  - Contenu propose des chiffres internes, regroupés par texte, jamais publiés, après l'avis de Juridique ;
  - Juridique : internes seulement, jamais publics, même dans le registre de méthode ; en campagne, un chiffre public pourrait passer pour un sondage.
  - C'est le constat C-021, à trancher.
- **La permanence.** Avec un porteur seul et des agents, personne n'est sûr d'être disponible à 18h : c'est le premier risque d'exploitation.
- **Les quatre tensions jamais essayées** sont les plus proches du clivage gauche-droite. Elles seront éprouvées avant la bêta (travail 2).
- **Le nom et l'icône.** Le nom sera testé en bêta, mais l'icône doit être définitive avant. Si le nom échoue, chaque joueur devra réinstaller l'icône (Front-end).
- **Les liens ouverts dans une messagerie.** Certaines messageries ouvrent les liens dans leur propre navigateur. Un invité qui choisit « Plus tard » à l'écran du code peut alors perdre sa partie en rouvrant le jeu dans Safari. À voir avec UX avant le travail 9 (Front-end).
- **Décisions déjà validées que l'équipe pourrait vous demander de rouvrir**, après le bilan ou la bêta (rien ne change aujourd'hui) :
  - D-006 :
    - l'inscription à partir de quinze ans, sur simple déclaration : une loi en cours de réécriture pourrait ne plus s'en contenter (Juridique) ;
    - le cercle lancé à trois, si les cercles de trois s'avèrent trop maigres (Game design) ;
  - la règle 18 et le §5 : trois mois pour les premiers curseurs nets, un seuil à recaler (Game design) ;
  - la règle 14, Le Sans-Faute : presque impossible tel qu'il est écrit (Game design) ;
  - la règle 4 : les titres d'un membre parti, selon l'avocat (Juridique) ;
  - « Tout effacer », si la loi oblige à garder certaines données d'identification (question pour l'avocat, Juridique).
- **Les règles à fermer au bilan** : constats C-007 à C-021 (`docs/decisions.md`).

Les plans détaillés de chaque spécialiste sont gardés par l'orchestrateur, et repris au début des étapes 5 et 6.
