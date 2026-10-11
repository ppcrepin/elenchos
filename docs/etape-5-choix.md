# Étape 5 : les choix de fabrication

*État au 11 octobre 2026. Préparé par Juridique, Back-end, Front-end, Contenu et Game design, puis assemblé par l'orchestrateur. Ce document complète la partie 3 de `docs/plan-construction.md`, qui décrivait ces choix le 5 octobre.*

**Ce que vous allez trancher.** Ce sont les dix choix du plan. Certains se décident en plusieurs questions : le choix 4 en trois, les choix 7 et 9 en deux chacun. Cela fait **quatorze QCM, en quatre séries**, chaque série se lisant après la précédente :

1. **Les fondations** : qui porte le service, l'engagement, qui paie, comment engager le budget.
2. **La fabrication** : lien ou application, qui code, où vivent les données, la marque et l'adresse.
3. **Les textes et le droit** : la validation des textes, les fournisseurs d'IA, la place des groupes de députés, l'avocat.
4. **Les durées** : les comptes inactifs, le nom de qui part.

Rien de ce document ne lance la construction. Le code commence à l'étape 6, avec votre accord explicite (D-001).

**Comment lire les faits.**
- **Vérifié** : consulté en ligne le 11 octobre 2026, la source est donnée à la fin. « Sources secondaires » veut dire que la source officielle n'a pas pu être ouverte et qu'on s'appuie sur des articles qui la citent.
- **De mémoire** : ce que savent les agents, à confirmer.
- **Estimation** : l'avis chiffré de l'équipe, pas un devis.

---

## En bref : les quatorze questions et ce que l'équipe recommande

| Série | Question | Recommandation | En une ligne |
|---|---|---|---|
| 1 | Qui porte le service (choix 1) | **Une société que vous créez seul (SASU)** | Apple et Google l'acceptent, votre responsabilité est limitée, tous les modèles économiques restent possibles. |
| 1 | L'engagement « ni vente, ni exploitation, ni publicité » (choix 6) | **Oui, écrit partout** | Dans les conditions, les statuts et une clause qui suit les données si Elenchos est racheté. |
| 1 | Qui paie le jeu (choix 9a) | **Gratuit, une contribution libre à l'ouverture** | Un jeu entier pour tous. Vous financez jusqu'à l'ouverture, puis on peut donner, sans rien recevoir dans le jeu. |
| 1 | Comment engager le budget (choix 9b) | **Par tranches, à chaque jalon** | Vous ne payez l'ouverture qu'après avoir vu de vrais cercles jouer. |
| 2 | Lien ou application (choix 2) | **Le lien d'abord, puis les deux boutiques** | C'est D-005 tel quel. On joue sans rien installer pendant la bêta, l'App Store arrive avant l'ouverture. |
| 2 | Qui code (choix 3) | **Des agents et un développeur** | Les agents construisent, comme aux essais. Une personne relit le code sensible, tient de vrais téléphones et répare le soir. |
| 2 | Où vivent les données (choix 5) | **Chez des prestataires européens seulement** | Même coût à notre taille. Aucune loi étrangère n'atteint les opinions. |
| 2 | Marque et adresse (choix 10) | **Vérifier le nom maintenant (dans tous les cas), déposer la marque avant la bêta** | Le nom circule dès la bêta, avec une adresse déjà figée : il doit être protégé avant. |
| 3 | Qui valide les textes (choix 4a) | **Un relecteur extérieur valide chaque texte** | Aucun lot des essais n'est passé sans correction. Extérieur, pour que vous gardiez la surprise du jeu. |
| 3 | Chez combien de fournisseurs d'IA (choix 4b) | **Deux fournisseurs différents** | Celui qui vérifie ne partage pas les angles morts de celui qui écrit. C'est votre §8. |
| 3 | La place des groupes de députés (choix 4c) | **L'égalité, avec une marge** | Chaque groupe est entendu autant. La règle la plus simple à défendre, en campagne aussi. |
| 3 | Avocat et délégué à la protection des données (choix 8) | **Deux relectures, délégué nommé avant l'ouverture** | L'avocat relit ce que signent les testeurs avant la bêta, puis tout avant l'ouverture. |
| 4 | Les comptes inactifs (choix 7a) | **Effacés après 12 mois, sans message** | La durée est annoncée dès l'inscription. Aucun message sur l'absence (D-029) ; un visage disparaît du Cercle, ce qui touche D-010. |
| 4 | Le nom de qui part (choix 7b) | **« Un ancien membre »** | Une seule règle, conforme au droit à l'effacement. Le cercle garde ses titres, pas le nom. |

**Ce que coûtent les recommandations, jusqu'à la fin de la bêta** (estimation, détail plus bas) : environ **7 000 à 21 000 €**. Ce total ne compte ni votre abonnement Claude pour les agents, ni votre temps. Ensuite, l'ouverture coûte environ 8 000 à 21 000 € de plus, puis, chaque mois, un développeur et un relecteur.

**Ce qui n'est toujours pas connu : la date de sortie.** La durée de la construction dépend de vos réponses. Une fois les quatorze questions tranchées, l'équipe dira si elle peut proposer une fourchette.

---

## Ce qui a changé depuis le 5 octobre, pour tous les choix

- **Le compte développeur Apple sert dès l'étape 6, même sans App Store.** Vous avez retenu la connexion par Apple dès les premiers joueurs (D-035). Or elle exige un compte développeur Apple, même pour un site. Les agents le disaient de mémoire ; l'orchestrateur l'a confirmé dans des guides d'intégration d'autres éditeurs, pas sur une page d'Apple. Ce compte se prend au nom de qui porte le service. **Le choix 1 doit donc être fait avant le début de la construction**, et non plus avant les boutiques.
- **On construira avant de savoir si le cœur du jeu plaît** (D-039). Le plaisir de deviner de vrais proches ne se jugera qu'en bêta. Cela pousse vers les options réversibles et vers une dépense par tranches.
- **Les textes demandent plus de travail que prévu.** Aucun des huit lots des deux essais n'est sorti de sa première vérification sans correction. Et personne, aux essais, n'a relu les textes finaux contre les sources, à part d'autres modèles d'IA.
- **Le règlement européen sur l'IA s'applique depuis le 2 août 2026** (article 50.4, vérifié, sources secondaires). Un texte écrit par une IA pour informer le public sur un sujet d'intérêt général doit le dire. Il n'a pas à le dire s'il a été vraiment relu par une personne, qui en porte la responsabilité. Que l'article vise un jeu reste à confirmer par l'avocat.
- **Les essais ont prouvé la construction de l'interface par des agents**, sur deux pages complètes, jouées sur votre iPhone sans incident technique. Ils n'ont rien prouvé du reste : serveur, comptes réels, message de 18h, sécurité, boutiques.

---

## Série 1 : les fondations

### Choix 1. Qui porte le service

**La question.** Qui sera, en droit, « Elenchos » ? C'est la personne qui signe avec les joueurs, avec Apple, Google et les prestataires, qui garde les opinions politiques et qui répond devant la CNIL. Exemple : si un joueur demande l'effacement de ses réponses et qu'il n'est pas fait, c'est elle qui est sanctionnée.

**Les options.**
1. **Une société que vous pouvez créer seul, une SASU (recommandé).**
   - Elle donne : une structure acceptée par Apple et Google. Votre responsabilité est limitée à votre apport. Tous les modèles économiques du choix 9 restent possibles.
   - Elle coûte : environ 200 à 250 € de création (vérifié, sources secondaires qui divergent un peu), puis une comptabilité de 600 à 1 500 € par an (estimation).
   - Elle oblige : à obtenir un numéro d'entreprise international (D-U-N-S), gratuit, qui peut prendre jusqu'à 30 jours. Apple et Google le demandent pour un compte d'organisation.
   - À savoir : vous pouvez modifier seul les statuts d'une SASU. Ce qu'ils promettent ne vous lie donc que si c'est aussi écrit dans les conditions d'utilisation (choix 6).
2. **Une association.**
   - Elle donne : l'engagement peut être inscrit dans son objet, et personne ne peut la racheter. Apple peut la dispenser de l'abonnement annuel si elle est reconnue sans but lucratif et ne vend rien dans l'application (vérifié, page d'Apple).
   - Elle coûte : il faut au moins deux fondateurs (de mémoire).
   - Elle rend plus difficile : de vendre quoi que ce soit (choix 9).
3. **Vous, en nom propre.**
   - Elle donne : rien à créer, aucun frais.
   - Elle coûte : l'App Store est probablement fermé. Apple demande qu'une application « qui demande des informations sensibles » soit soumise par une personne morale, pas par un particulier (règle 5.1.1 (ix), vérifié ; Apple ne dit pas si les opinions politiques en font partie). Vous répondez sur vos biens personnels : les sanctions du règlement sur les données vont jusqu'à 20 M€ (art. 83). Chez Google, un compte personnel doit faire tester l'application par 12 personnes pendant 14 jours avant de la publier (vérifié).
   - Elle oblige ensuite : passer plus tard à une société change le responsable des données. Il faudrait prévenir chaque joueur, et probablement redemander son accord (à confirmer par l'avocat).

**Ce qui fait pencher.** La bêta n'est pas un « prototype entre amis » : de vraies opinions seront gardées sur un serveur. La structure qui porte le service doit donc exister avant la bêta, et en pratique avant l'étape 6, à cause du compte Apple.

**Lien avec le choix 9.** Si le jeu reste gratuit et vit de dons, et si vous avez un cofondateur, l'association devient une bonne option (Juridique). La SASU reste recommandée parce qu'elle laisse tout ouvert et peut être créée seul.

**Dépend de.** Il se tranche avec le choix 9 et avant les choix 5, 6, 8 et 10 : c'est la structure choisie qui signe les contrats, porte l'engagement, consulte l'avocat et dépose la marque. Une première heure avec l'avocat peut aider à rédiger les statuts.

**Décisions touchées.** Aucune, quelle que soit l'option. En nom propre, l'App Store devient improbable, ce qui pèse sur le choix 2.

---

### Choix 6. L'engagement « ni vente, ni exploitation, ni publicité »

**La question.** Confirmez-vous cette promesse, et sous quelle forme, pour que les joueurs puissent l'exiger ? Exemple : dans trois ans, Elenchos est racheté, et le repreneur veut vendre des « profils politiques » à une agence de campagne.

**Les options.**
1. **Oui, écrit partout (recommandé).** L'engagement figure à quatre endroits.
   - Dans les conditions d'utilisation et la politique de confidentialité.
   - Dans les statuts (choix 1).
   - Dans une **clause de rachat**. Si Elenchos change de mains, les réponses ne suivent que si le repreneur reprend l'engagement mot pour mot. Chaque joueur est prévenu au moins 30 jours avant et peut tout effacer. Sinon, tout est effacé. Même règle en cas de faillite. C'est la seule exception à « ni vente » : les réponses ne passent à un tiers qu'à cette condition.
   - Avec une **liste fermée des usages permis** : faire tourner le jeu, compter la part de « aucune » (D-027), les mesures sur les gestes (`produit.md` §8), la sécurité. Tout le reste est exclu : vente, location, partage même en chiffres globaux (partis, instituts de sondage, chercheurs), publicité ciblée, entraînement d'une IA sur les réponses, publicité et contenus sponsorisés.
   - Coût : une clause à faire rédiger par l'avocat.
2. **Oui, dans les conditions d'utilisation seulement.** Chaque joueur peut l'invoquer. Mais une mise à jour des conditions peut l'affaiblir, et rien ne lie un repreneur au-delà de la loi.
3. **Oui, et devenir une société à mission.** C'est la forme la plus forte : un organisme extérieur vérifie que la mission est tenue. Ce contrôle est payant, plusieurs milliers d'euros (estimation), et il suppose une société.
4. **Non, laisser la porte ouverte.** La publicité reste possible : le choix 9 vous serait alors reposé, avec la publicité parmi les options. La phrase « elles ne sont jamais vendues », déjà sur la carte de consentement (D-006), reste dans tous les cas.

**Ce qui fait pencher.**
- Le règlement sur les données interdit déjà beaucoup. Un accord donné pour un usage ne vaut pas pour un autre.
- Le vrai danger est la revente des données comme un bien, lors d'un rachat ou d'une faillite. Seule une clause écrite d'avance l'empêche nettement.
- Une promesse publique non tenue serait aussi une pratique commerciale trompeuse (de mémoire).
- Sans publicité, le jeu reste à l'abri du règlement européen sur la publicité politique (de mémoire).
- Le précédent de Wordle, gratuit puis racheté par le New York Times début 2022, rappelle qu'un jeu quotidien peut changer de mains (de mémoire).

**Dépend de.** Du choix 1, pour les statuts. Il se tranche avant le choix 9, qui suppose l'engagement confirmé.

**Décisions touchées.** Les trois « Oui » confirment la recommandation du §9 de votre document et ferment le « à confirmer » de `produit.md` §6. D-027 devient le seul usage interne des opinions, nommé dans la liste. Avec « Non », le §9 reste une recommandation ouverte. D-006 tient dans tous les cas.

---

### Choix 9a. Qui paie le jeu

**La question.** Qui paie Elenchos : vous seul, des joueurs qui le veulent bien, ou des joueurs qui achètent un supplément ? Exemple : Marie joue chaque soir depuis six mois. Lui propose-t-on de donner quelques euros par mois sans rien recevoir dans le jeu, ou de payer un portrait plus détaillé ?

**Les options.**
1. **Gratuit : vous financez jusqu'à l'ouverture, puis une contribution libre, sans aucun avantage dans le jeu (recommandé).**
   - Elle donne : un jeu entier pour tous. La bêta mesure le jeu, pas l'envie de payer. Une recette devient possible ensuite, sans rien changer au jeu.
   - Elle coûte : vous payez seul la construction et la bêta. À l'ouverture, il faut un moyen de paiement. Dans une application, il passe par Apple ou Google, qui prennent une commission, de l'ordre de 15 % pour un petit éditeur (de mémoire).
   - Elle oblige : à suivre les règles de l'argent ci-dessous, et à publier d'où vient l'argent au registre public.
2. **Gratuit, financé hors du jeu seulement** : par vous, et le cas échéant par des financeurs extérieurs. On ne demande jamais rien aux joueurs. C'est le plus simple. Mais tout repose sur vous ou sur des financeurs, et un gros financeur extérieur fragilise l'image de neutralité. On pourra passer à l'option 1 plus tard.
3. **Un supplément payant autour du portrait**, par exemple un portrait plus détaillé. C'est la seule recette liée au jeu. Mais elle coupe en deux la découverte des premiers curseurs nets, vers trois mois (la barre « Ton portrait se dessine », D-038). Et vendre à quelqu'un une analyse de ses propres opinions politiques frôle « ni exploitation ».

**Écartés** : la publicité, si vous confirmez l'engagement au choix 6 (sinon, ce choix vous sera reposé avec elle) ; payer pour jouer ou pour créer un cercle, qui casse l'invitation gratuite (D-006) ; vendre des chiffres sur ce que pensent les joueurs (§9).

**Ce qui fait pencher.**
- **Franchement, aucun modèle compatible avec le §9 ne promet de faire vivre une équipe.** Estimation de Game design : à 10 000 joueurs, si 1 à 2 % donnent 2 à 3 € par mois, la recette serait de 200 à 600 € par mois avant commission. C'est l'ordre de grandeur de l'hébergement. Cela ne paie ni le développeur, ni le relecteur des textes, ni l'avocat.
- Demander de l'argent aux 40 à 80 joueurs de la bêta rapporterait presque rien et fausserait la mesure du rendez-vous.

**Les règles de l'argent** (proposées par Game design, qui en écrivait douze ; l'orchestrateur les a regroupées en cinq, sans en retirer). **Répondre au choix 9a vaut validation de ces règles**, qui entreront dans `produit.md` §6. Les règles 2 à 4 ne servent que si des joueurs paient (option 1). L'option 3 obligerait à réécrire la règle 1 sur le portrait :
1. Ne deviennent jamais payants : jouer, entrer, inviter ; rien qui aide à deviner ou à gagner (indice, seconde chance, passe en plus, titre) ; le rendez-vous de 18h et le rattrapage d'un jour manqué ; le portrait (ni l'accélérer, ni le débloquer) ; ce qu'on voit d'un proche ; un quatrième cercle ; ses propres données (voir, emporter, effacer). Ce qui est gratuit à l'ouverture le reste.
2. Personne dans le cercle ne sait qui paie : ni badge, ni couleur, ni mention. Exemple : si le rond de serviette de Paul avait un liseré doré parce qu'il donne, Inès, qui n'a pas de revenu, le verrait à chaque révélation.
3. On ne demande jamais d'argent dans le message de 18h, sous forme de relance, pendant les 90 secondes de la journée, ni juste après une réussite.
4. Ce qu'on sait de qui paie ne se croise jamais avec ce que la personne a répondu.
5. On n'accepte aucun argent d'un parti, d'un candidat, d'un élu, d'un groupe parlementaire ou d'une organisation dont le métier est d'influencer la loi. Aucun financeur n'a de droit de regard sur les textes. La liste des organisations qui financent le jeu est publique ; un joueur qui donne n'y figure jamais.

**Dépend de.** Il se tranche avec les choix 1 et 6. Le choix 2 fixe le canal de paiement, sans devoir être tranché avant.

**Décisions touchées.** Options 1 et 2 : aucune décision modifiée ; elles ferment le point ouvert §11.3. Option 3 : touche le §5, D-026 et D-038 (le portrait aurait une part payante).

---

### Choix 9b. Comment engager le budget

**La question.** Comment voulez-vous engager votre argent d'ici l'ouverture ? Le montant n'est pas demandé ici : il dépend des choix 3, 4 et 8. Les ordres de grandeur sont plus bas, dans « Ce que ça coûte ».

**Les options.**
1. **Par tranches, à chaque jalon (recommandé).** Une première tranche couvre la construction et la bêta. La seconde, celle de l'ouverture, se décide au bilan de la bêta, sans seuil fixé d'avance (D-008). Vous ne payez l'ouverture qu'après avoir vu de vrais cercles jouer. En revanche, la seconde tranche n'est pas acquise, ce qui peut retarder l'ouverture.
2. **Une enveloppe fixée maintenant.** Plus de visibilité, mais vous engagez l'ouverture avant la preuve, avec des montants encore incertains.
3. **Dépense par dépense.** Souple, mais sans vue d'ensemble, avec le risque de s'arrêter à mi-chemin.

**Ce qui fait pencher.** La seconde tranche contient les plus gros montants connus (audit de sécurité, relecture complète par l'avocat, développeur au mois). Elle ne sert que si la bêta convainc.

**Décisions touchées.** Aucune.

---

## Série 2 : la fabrication

### Choix 2. Lien ou application

**La question.** Comment le jeu arrive-t-il sur le téléphone, et par où passe le message de 18h ? Exemple : Marie, sur iPhone, a joué ses trois premiers textes par le lien de Thomas. Pour recevoir le message de 18h, elle doit :
- **avec le lien** : Partager, « Sur l'écran d'accueil », Ajouter, ouvrir l'icône, se reconnecter, accepter les messages ;
- **avec l'application** : Télécharger, Obtenir, ouvrir, se reconnecter, accepter.

Dans les deux cas, cela fait cinq ou six gestes. La différence est que le premier geste du lien est inconnu de la plupart des gens.

**Les options.**
1. **Le lien d'abord, puis les deux boutiques avant l'ouverture au public (recommandé ; c'est D-005 tel quel).**
   - Elle donne : la bêta se joue sans rien installer, comme l'invitation (D-006). Un seul code : le même site, emballé ensuite en application pour l'App Store et Google Play. Une correction se publie le jour même, sans attendre la revue d'Apple.
   - Elle coûte : pendant la bêta, un joueur iPhone qui n'a pas ajouté l'icône ne reçoit pas le message de 18h. La bêta mesurera ce geste, avec les critères déjà fixés par D-005. Avant l'ouverture, il faut un chantier boutiques (emballage, fiches, revue, marge pour un refus) et le compte Google (25 $ une fois, vérifié, sources secondaires).
   - Elle ne rend rien impossible.
2. **L'application dès la bêta, l'invitation restant un lien.**
   - Elle donne : un message de 18h sûr sur iPhone dès la bêta, et une connexion Apple et Google plus fiable.
   - Elle coûte : avant la sortie publique, les testeurs iPhone doivent d'abord installer TestFlight, l'outil d'essai d'Apple, et la première version passe une revue d'Apple (de mémoire selon Front-end ; confirmé par l'orchestrateur sur une page d'Apple). Pour une grand-mère d'un cercle familial, c'est un obstacle que le jeu final n'aura pas : cela fausse justement le test de l'invitation. Les comptes des boutiques et la structure (choix 1) doivent exister dès la première semaine de construction.
   - Elle oblige : à compiler pour iPhone dès le début, et à faire passer chaque correction par la revue d'Apple. Il faut aussi que l'invitation de Marie survive à l'installation, pour qu'elle arrive dans le bon cercle. L'outil gratuit de Google qui le faisait a fermé le 25 août 2025 (de mémoire selon Back-end ; confirmé par l'orchestrateur, sources secondaires) : il faudrait en écrire un, ou prendre un service américain, ce qui touche le choix 5.
3. **Le lien seul, sans boutiques prévues.**
   - Elle donne : le moins cher et le plus simple.
   - Elle coûte : sur iPhone, le message de 18h dépendra toujours de l'icône, et le jeu est absent de l'App Store. Le jeu dépend aussi du bon vouloir d'Apple sur les icônes web : en 2024, Apple avait annoncé les retirer en Europe, avant de revenir en arrière (de mémoire).
   - Les boutiques restent possibles plus tard.

Écartée : l'application seule, sans lien. L'invitée devrait installer avant de jouer, ce qui contredit D-006.

**Ce qui fait pencher.**
- Sur iPhone, un site ne peut envoyer de message qu'une fois ajouté à l'écran d'accueil (vérifié le 4 octobre, D-005). Sur Android, le navigateur suffit (de mémoire).
- Les messages sont gratuits dans tous les cas, et le serveur est le même (Back-end).
- Apple peut refuser une application qui n'est qu'un site dans une boîte (règle 4.2, vérifié). Le message de 18h et la connexion Apple native sont un vrai plus, sans garantie.
- **Désaccord, tranché.** Back-end écrit que l'option 2 fait « deux versions à construire ». Front-end écrit, de son côté, que c'est le même code, emballé plus tôt. L'orchestrateur retient les deux points : **un seul code**, mais deux chemins à tenir dès la bêta (le lien pour l'invitation, l'application ensuite) et deux façons d'envoyer le message de 18h.

**Dépend de.** Le choix 1 doit être tranché avant l'option 2 et avant le chantier boutiques de l'option 1. L'option 2 touche aussi le choix 5, par l'outil qui suit l'invitation. Le choix 10 se tranche en même temps : l'icône et l'abonnement au message sont liés à l'adresse, qui ne pourra plus changer après la bêta.

**Décisions touchées.**
- Option 1 : reprend D-005 tel quel et lève sa suspension (D-009).
- Option 2 : modifie D-005 (la phase « web seul » disparaît). D-006 tient, puisque l'invitation reste un lien.
- Option 3 : modifie D-005 (plus de boutiques) et le §11.8 tel que D-005 l'avait réécrit. Le §2 (« un message à 18h ») n'est plus tenu pour les iPhone sans icône.

---

### Choix 3. Qui code

**La question.** Qui écrit le code, qui l'entretient dans deux ans, et quelle personne répare si, un dimanche à 18h05, le message n'est pas parti ?

**Les options.**
1. **Des agents, plus un développeur indépendant à temps très partiel (recommandé).**
   - Elle donne : les agents écrivent et prouvent le code, comme aux essais. Le développeur fait ce que des agents ne peuvent pas faire. Avant la bêta, il relit le code qui touche aux données : la connexion, le cloisonnement des cercles, l'effacement, rien de visible avant 18h. Il essaie le jeu sur ses propres téléphones. Il gère les boutiques. Le soir, il sert de secours.
   - Elle coûte : 2 000 à 7 000 € de relecture avant la bêta, puis 800 à 2 800 € par mois une fois le jeu ouvert (estimations ; sur la base de 400 à 700 € par jour, de mémoire). Personne ne sait encore si un indépendant acceptera un secours chaque soir, ni à quel prix.
   - Elle oblige : à écrire un code « ordinaire », qu'une personne peut reprendre.
2. **Des agents seuls**, que vous validez en jouant.
   - Elle donne : le moins cher et le plus rapide.
   - Elle coûte : vous êtes le seul recours humain, y compris un dimanche à 18h05. Le code qui garde des opinions n'est relu que par des modèles, qui partagent une partie de leurs angles morts. Un agent ne travaille que si une session est ouverte, et une limite d'utilisation peut tomber à 17h50, comme le 10 octobre (D-036).
3. **Un prestataire, agence ou indépendant, qui construit et entretient.**
   - Elle donne : un responsable unique, par contrat, rodé aux boutiques.
   - Elle coûte : 50 000 à 150 000 € pour construire (estimation très large, sans devis), avant de savoir si le jeu plaît. Les échanges sont plus lents, et la méthode de preuve des essais est à lui imposer par contrat.

**Ce qui fait pencher.**
- **Ce que les essais prouvent.** Des agents savent construire l'interface au niveau demandé. Ils l'ont fait deux fois, contrôlés par des programmes écrits séparément (sans moyen de vérifier qu'ils l'ont été sans se voir), et la page du premier essai a tenu seize séances sur votre iPhone sans correctif.
- **Ce qui joue contre** (Front-end). Une limite d'utilisation a coupé quatre tâches d'un coup le 10 octobre (D-036). Des agents ont enfreint une règle de discrétion sur le lot caché (D-037). Leurs estimations se sont écartées du réel : la page pesait 700 Ko au lieu des 340 à 550 Ko annoncés. Et la connexion Apple et Google n'a jamais été faite : les boutons étaient dessinés.
- **Ce que des agents ne peuvent pas faire, quelle que soit leur qualité.** Tenir un vrai téléphone. Écouter le lecteur d'écran d'un iPhone. Compiler pour iPhone sans Mac. Signer un contrat. Être là d'eux-mêmes à 18h05.
- **La permanence du soir peut être légère.** Back-end propose de tout préparer avant 18h : la révélation est déjà en base et ne devient visible qu'à l'heure. Une panne de 18h se réduit alors à trois cas : une panne de l'hébergeur, une mise en ligne fautive (aucune mise en ligne de 15h à 19h ni le dimanche), ou un envoi de messages raté (alerte à 18h02, bouton de relance). Ce principe est à confirmer à l'étape 6. Front-end ajoute que la panne d'écran la plus probable vient d'un téléphone ou d'une version d'iOS que personne n'a essayés. Une personne qui a deux téléphones en main la voit avant les joueurs.

**Dépend de.** Du choix 9 : sans budget, il ne reste que l'option 2. Du choix 2 : l'application tôt fait pencher vers un humain. Du choix 1 : c'est la structure choisie qui signe avec le développeur.

**Décisions touchées.** Aucune, quelle que soit l'option. Avec l'option 2, le « recours humain pour les soirs » que le plan demandait (partie 4), c'est vous.

---

### Choix 5. Où vivent les données

**La question.** Chez quelles entreprises gardez-vous les comptes, les adresses e-mail et les réponses des joueurs ? Exemple : l'e-mail qui porte le code à six chiffres de Marie part-il par un service français ou américain ?

**Les options.**
1. **Des prestataires européens seulement (recommandé).** Cela vise le siège de l'entreprise, pas seulement l'emplacement de ses serveurs.
   - Elle donne : un hébergeur français « clé en main », des sauvegardes chez un second prestataire européen, un service d'e-mail européen, les polices servies par le jeu lui-même. Aucun outil américain de suivi ni de mesure. Les noms (par exemple Scalingo, Clever Cloud, Scaleway, OVHcloud, Brevo) sont de mémoire, à choisir à l'étape 6. Aucune loi étrangère ne peut atteindre les opinions, et l'engagement public tient en une phrase : « Tout est chez des prestataires européens ; seuls Apple et Google voient la connexion et l'acheminement des messages, jamais une réponse. »
   - Elle coûte : à peu près le même prix à notre taille, et quelques jours de travail en plus pour construire la connexion.
2. **Mixte : les réponses et les comptes en Europe, le reste libre** (e-mail, suivi des erreurs). C'est un peu plus simple. Mais le service américain qui envoie le code par e-mail apprend déjà qui joue à un jeu politique, et l'engagement du choix 6 devra nommer ces exceptions.
3. **Des prestataires américains, serveurs en Europe.** C'est le plus rapide à monter, une à deux semaines gagnées (estimation), et c'est légal aujourd'hui. Mais une loi américaine permet aux autorités des États-Unis d'exiger les données, même stockées en Europe (de mémoire). Et le cadre qui autorise ces échanges est contesté devant la Cour de justice de l'Union, sans date d'arrêt connue (vérifié, sources secondaires) : s'il tombe, il faut déménager dans l'urgence.

**Ce qui reste hors d'Europe dans tous les cas.** La connexion par Apple ou Google (D-035), et l'acheminement des messages de 18h. Ce message existe en quelques formes selon ce qui attend le joueur (E1) et ne cite aucun nom. Seule exception : l'annonce envoyée au créateur d'un cercle de moins de trois membres, à chaque arrivée (« Marie a trouvé 2 de tes 3 réponses », D-006), dont le texte est à revoir avec Juridique. Dans une application Android, Google peut lire le texte des messages (Back-end, de mémoire).

**Une garantie à écrire quelle que soit l'option.** Aucune donnée de joueur n'est jamais envoyée à un fournisseur d'IA. La chaîne des textes ne lit que les données publiques de l'Assemblée.

**Dépend de.** Du choix 1 : c'est la structure choisie qui signe les contrats. Du choix 6, pour la formule de l'engagement. L'avocat (choix 8) valide la liste des prestataires.

**Décisions touchées.** Aucune.

---

### Choix 10. La marque et l'adresse définitive

**La question.** Quand vérifier que le nom « Elenchos » est libre, le déposer comme marque et réserver l'adresse web définitive ? Exemple : un autre éditeur dépose « Elenchos » pour des applications pendant votre bêta. Il faudrait changer de nom, d'adresse et d'icône, et chaque joueur devrait refaire son icône.

**Où en est la vérification.** Juridique n'a trouvé, le 11 octobre, aucune application, aucun jeu ni aucune marque commerciale nommés « Elenchos ». Il a trouvé une revue savante, *Elenchos: Journal of Studies on Ancient Thought* (De Gruyter Brill, fondée en 1980), qui pourrait avoir un droit sur ce nom pour des publications. Les bases officielles des marques (INPI, EUIPO) n'ont pas pu être interrogées depuis l'environnement. **La vérification prévue par D-013 n'est donc pas faite.** Elle demande un conseil en propriété industrielle, pour quelques centaines d'euros (estimation).

**Les options.**
1. **Déposer avant la bêta (recommandé).** Le conseil fait la recherche tout de suite. Dès son feu vert, vous réservez les adresses (.fr, .com, peut-être .app ; 10 à 60 € par an chacune, estimation), et vous déposez la marque française au nom de la structure choisie, dans trois catégories (applications, jeux, logiciel en ligne) : 270 € (vérifié, sources secondaires). Dans les six mois, la marque européenne peut être déposée en gardant la date du dépôt français (de mémoire) : 1 050 € pour trois catégories (vérifié, sources secondaires).
2. **Déposer après la bêta**, comme le plan le proposait le 5 octobre. 270 € économisés si le nom ne tient pas, mais le nom circule pendant toute la bêta sans protection, alors que l'adresse est déjà figée.
3. **France et Europe avant la bêta.** Tout est protégé tout de suite, mais environ 1 320 € sont engagés avant de savoir si le nom tient.

Dans les trois options, la recherche par un conseil se fait maintenant (D-013) ; seuls le dépôt et sa date changent.

**Attention au délai européen.** Les six mois pour déposer la marque européenne à la date française courent dès le dépôt français. Avec l'option 1 et un budget par tranches (choix 9b), le dépôt européen devra donc être décidé dans ces six mois, peut-être avant le bilan de la bêta. Sinon, cette date est perdue, sans que la marque le soit.

**Ce qui fait pencher.** En France, le premier qui dépose une marque obtient le droit, même s'il ne l'a jamais utilisée. Et le plan fige déjà l'adresse et l'icône avant la bêta : le nom est donc figé, de fait, dès ce moment-là.

**Dépend de.** Du choix 1 : la marque et l'adresse sont au nom de la structure choisie. Du choix 2, pour les noms dans les boutiques. Il vient avant le logo et avant le texte qui explique le nom (D-040).

**Décisions touchées.** Les options 1 et 3 exécutent D-013 et débloquent D-040. Elles modifient le plan de construction (partie 3, point 10, « dépôt après la bêta »), qui était une proposition de l'équipe, pas une décision. L'option 2 : aucune.

---

## Série 3 : les textes et le droit

### Choix 4a. Qui valide chaque texte avant sa publication

**La question.** Chaque jour, une chaîne d'IA tire un vrai vote de l'Assemblée, le résume en trois lignes, choisit quatre raisons de députés et les fait vérifier. Avant qu'un texte parte aux joueurs, qui donne le feu vert ? Exemple : le texte de mardi met dans la bouche d'une députée, nommée à 18h, une phrase qu'elle n'a pas dite. Faut-il qu'une personne l'ait lu avant ?

**Les options.**
1. **Un relecteur extérieur valide chaque texte (recommandé).** La chaîne prépare et vérifie. Une personne extérieure au projet, par exemple un journaliste ou un documentaliste parlementaire, lit chaque texte avec ses sources à côté, puis accepte ou renvoie. Elle travaille par lot chaque semaine, quatre semaines à l'avance.
   - Elle donne : l'erreur est arrêtée avant de partir. La mention « écrit par une IA » n'est probablement plus nécessaire (à confirmer par l'avocat). Et vous gardez la surprise du jeu.
   - Elle coûte : environ 10 minutes par texte, soit 1 à 2 heures par semaine (estimation). Payé, cela ferait 200 à 500 € par mois (non vérifié).
   - Garde-fou : le relecteur voit le dossier sans noms ni groupes. Il ne choisit pas les textes, la sélection reste mécanique, et toute retouche repasse par les vérificateurs. Il s'engage par écrit à ne rien dire des textes à venir.
2. **Vous validez chaque texte.** Même garde-fou, sans frais. Mais vous connaîtrez le sujet et le vote quatre semaines avant de jouer : vos propres parties perdent leur suspense. Vous aviez jugé sans gravité les sujets du lot caché cités par erreur, parce que vous n'aviez pas lu les textes (D-037) ; ici, vous les liriez tous.
3. **Tout automatique, avec une mention IA.** C'est votre §8 tel quel, sans temps humain. Mais une erreur peut sortir, et un député nommé à 18h peut la contester. Il faut une mention visible, à placer avec UX et à faire valider par l'avocat, et une procédure de correction rodée dès la bêta.
4. **Automatique, avec un échantillon relu.** La qualité est mesurée à peu de frais. Mais l'erreur sort d'abord et se mesure ensuite, et les textes non relus portent probablement la mention IA.

**Ce qui fait pencher.**
- Huit lots sur huit ont dû être corrigés aux essais, et on ne sait pas combien d'erreurs la chaîne laisse passer : personne n'a relu les textes finaux contre les sources.
- Les auteurs des raisons sont nommés à 18h. Une phrase mal rendue vise donc une personne réelle.
- L'exception du règlement sur l'IA demande une vraie relecture et une personne responsable (sources secondaires).
- La bêta permettra de mesurer la part des textes renvoyés par le relecteur, et de décider ensuite de garder ou d'alléger cette relecture.

**Arbitrage de l'orchestrateur.** Contenu recommandait « un humain valide chaque texte », sans dire qui, et signalait que si c'est vous, vos parties perdent leur suspense. L'orchestrateur a séparé ces deux cas en deux options et recommande la personne extérieure. Le coût de 200 à 500 € par mois est une estimation non vérifiée de Contenu.

**Dépend de.** Du choix 1 : la structure choisie est le responsable éditorial. Du choix 8 : l'avocat confirme la portée du règlement sur l'IA. Du choix 9 : le budget du relecteur.

**Décisions touchées.** Options 1 et 2 : modifient le §8 (« production entièrement automatisée »). Option 3 : aucune. Option 4 : aucune si l'échantillon est relu après publication, une modification partielle du §8 s'il est relu avant.

---

### Choix 4b. Chez combien de fournisseurs d'IA

**La question.** Les textes sont écrits puis vérifiés par des IA. Chez combien de fournisseurs ?

**Les options.**
1. **Deux fournisseurs différents (recommandé).** L'un écrit, l'autre vérifie. Celui qui vérifie ne partage pas les angles morts de celui qui écrit, même si cela ne les supprime pas. C'est votre §8. Les noms se choisiront à l'étape 6, sur un banc d'essai : la chaîne devra trouver des erreurs plantées exprès.
2. **Deux, dont un européen imposé d'avance**, par exemple Mistral. C'est cohérent avec le choix 5, mais cela impose un fournisseur avant de savoir s'il vérifie bien.
3. **Un seul fournisseur**, avec des modèles différents, comme aux essais. C'est le plus simple, mais le même fournisseur produit et juge.

**Ce qui fait pencher.**
- Aux deux essais, tout tournait chez un seul fournisseur : la vérification chez un autre fournisseur, prévue au §8, n'a jamais été essayée.
- La chaîne ne touche que des données publiques de l'Assemblée. Le lieu des données (choix 5) n'oblige donc pas ce choix en droit.
- Coût de la chaîne : environ 2 à 15 € par texte, soit 1 000 à 8 000 € par an (estimation, prix non vérifiés).

**Décisions touchées.** Options 1 et 2 : aucune. Option 3 : modifie le §8 (« vérificateurs sur un autre fournisseur de modèle »).

---

### Choix 4c. La place de chaque groupe de députés

**La question.** Chaque texte montre quatre raisons de quatre groupes différents (§8). Sur la durée, quelle part donner à chaque groupe ? Il y a aujourd'hui onze groupes, de tailles très différentes (de mémoire).

**Les options.**
1. **L'égalité, avec une marge (recommandé).** Sur douze semaines glissantes, chaque groupe fournit entre 6 et 12 % des raisons environ. Chaque groupe est entendu autant : le but est la diversité des raisons, pas le reflet des sièges. Un petit groupe pèse autant qu'un grand.
2. **Selon les sièges.** Le jeu reflète l'Assemblée, mais le plus grand groupe parle le plus souvent, et un petit groupe n'apparaît qu'environ tous les huit jours.
3. **Un minimum par groupe, rien au-dessus.** C'est le plus facile à remplir, mais les grands groupes peuvent dominer.

**Ce qui fait pencher.**
- Contre chaque option, on trouve une accusation de parti pris. Seule l'égalité se défend en une phrase.
- Le repère français le plus proche est la règle des temps de parole de l'Arcom (de mémoire). À la fin d'une campagne présidentielle, elle passe à l'égalité stricte. Si le jeu est ouvert au printemps 2027, l'égalité sera la norme du moment.
- Dans tous les cas, la règle ne range jamais un groupe à gauche ou à droite : ce classement serait lui-même une prise de position.
- La faisabilité reste à prouver sur le stock réel des votes, à l'étape 6.

**Décisions touchées.** Aucune. La règle complète le §8 (suivi par groupe) et passe avant l'équilibre entre adoptés et rejetés (D-028).

---

### Choix 8. L'avocat et le délégué à la protection des données

**La question.** Quand l'avocat relit-il les textes juridiques, et quand nommer un délégué à la protection des données ? Le délégué est la personne, interne ou extérieure, qui veille au respect de la loi sur les données et répond à la CNIL.

**Les options.**
1. **Deux relectures, délégué nommé avant l'ouverture (recommandé).**
   - Avant la bêta, l'avocat relit ce que signent les testeurs : la carte de consentement, « Qui, durée, droits », les conditions d'utilisation, l'analyse d'impact (l'étude des risques que la loi impose) en version bêta, les contrats des prestataires, et les questions déjà notées (D-024, D-025, D-027, D-035).
   - Avant l'ouverture, il relit tout, en ajoutant le règlement sur l'IA et la période électorale.
   - Avant la bêta, une décision écrite explique pourquoi un délégué n'est pas encore obligatoire. Un délégué extérieur est nommé avant l'ouverture.
   - Coût : quelques milliers d'euros par relecture (estimation, sans devis).
2. **Deux relectures, délégué nommé dès la bêta.** C'est le plus sûr, car le délégué aide à écrire l'analyse d'impact. Mais c'est un abonnement de quelques milliers d'euros par an dès la bêta (estimation).
3. **Une seule relecture, avant l'ouverture.** C'est moins cher. Mais la bêta garde de vraies opinions sur des textes jamais relus. Et si l'avocat exige un accord séparé pour compter la part de « aucune » (D-027), il faudra redemander leur accord à tous les testeurs.

**Ce qui fait pencher.**
- Le délégué devient obligatoire quand on traite « à grande échelle » des données sensibles, ou qu'on suit les personnes de façon régulière (art. 37). Le portrait, calculé chaque jour, en est un exemple. La loi ne chiffre pas la « grande échelle » : 40 à 80 testeurs n'en sont pas, des milliers de joueurs probablement si (de mémoire).
- Vous ne pouvez pas être votre propre délégué : celui qui décide des usages des données ne peut pas aussi contrôler ces usages (de mémoire).
- L'analyse d'impact est obligatoire dans tous les cas : données sensibles, portrait, joueurs de 15 à 17 ans. Si un risque élevé subsiste après elle, il faut consulter la CNIL : 8 semaines, prolongeables (de mémoire).

**Dépend de.** Du choix 1 : c'est la structure choisie qui consulte et qui paie. Du choix 9, pour le budget, et du choix 4 pour le règlement sur l'IA.

**Décisions touchées.** Les options 1 et 2 exécutent D-025, D-027 et D-035, qui demandent l'avis de l'avocat avant la bêta ; D-006 prévoyait déjà une relecture avant le lancement public. L'option 3 contredit D-025 (avocat et analyse d'impact avant la bêta), probablement D-035, et le plan (partie 5).

---

## Série 4 : les durées

### Choix 7a. Les comptes inactifs

**La question.** Combien de temps garde-t-on les données de quelqu'un qui ne joue plus ? Exemple : Paul n'ouvre plus le jeu depuis l'été. En quel mois son compte disparaît-il ?

**Les options.**
1. **Effacé après 12 mois sans ouvrir le jeu, sans prévenir (recommandé).** La durée est annoncée dès « Qui, durée, droits » et rappelée dans les Réglages : « Si tu n'ouvres pas le jeu pendant 12 mois, ton compte et tes réponses sont effacés. » Toute ouverture du jeu remet le compteur à zéro. Pour le cercle, c'est un départ sans message (règle 4).
2. **Effacé après 24 mois.** Plus de temps pour qui revient, mais plus difficile à justifier pour des opinions politiques : on ne garde pas des données plus longtemps que nécessaire.
3. **12 mois, avec un e-mail 30 jours avant.** Personne ne perd son portrait par surprise. Mais c'est un message sur l'absence : une exception à « aucune relance » (D-010) et à D-029.

**Ce qui fait pencher.** Aucun texte ne fixe une durée pour un jeu. Douze mois couvrent largement une pause ou un cercle endormi. Un compte effacé fait disparaître un visage du Cercle : ce n'est pas un message, mais c'est visible.

**Décisions touchées.** Options 1 et 2 : touchent D-010 (point 3, « quand un proche décroche, rien de visible ») : au bout de 12 ou 24 mois, un visage disparaît du Cercle. Aucun message n'est envoyé : D-029 tient. Option 3 : touche aussi D-010 de la même façon, et fait une exception à « aucune relance » (D-010, point 3) et à D-029.

---

### Choix 7b. Le nom de qui part

**La question.** Quand quelqu'un quitte un cercle ou efface tout, sous quel nom restent ses titres passés ? Exemple : « Le Mystère, semaine 12 » reste-t-il affiché « Paul » dans l'historique du cercle ?

**Les options.**
1. **« Un ancien membre », dès qu'on quitte un cercle ou qu'on efface tout (recommandé).** Une seule règle, conforme au droit à l'effacement sans que personne ait rien à demander. Le cercle garde l'histoire de ses titres, pas le nom.
2. **Le pseudo reste si on quitte un cercle, « un ancien membre » si on efface tout.** Le cercle garde plus de mémoire, mais il y a deux règles à expliquer au moment du départ.
3. **Le pseudo reste toujours.** Déconseillé : une demande d'effacement l'emporterait de toute façon (art. 17).

**Décisions touchées.** Options 1 et 2 : précisent la règle 4 (D-010) et le §3 (« scores et titres figés »). Option 3 : aucune, mais elle cède sur simple demande.

---

## Ce qui sera réglé sans vous poser de question

Ces points découlent de vos réponses ou relèvent du métier des spécialistes. Ils sont écrits ici pour que rien ne se décide dans votre dos.

**Les autres durées de conservation** (Juridique, à valider par l'avocat) :

| Donnée | Durée proposée |
|---|---|
| Réponses et portrait | Tant que le compte existe ; effacés par « Tout effacer ». Au départ d'un cercle, les réponses quittent ce cercle (règle 4). |
| Réponses d'un invité qui ne crée pas de compte | 7 jours au plus |
| Code à six chiffres envoyé par e-mail | Quelques minutes (estimation : 15) |
| Journaux techniques, sans réponse ni pseudo | 6 mois (repère de la CNIL, de mémoire) |
| Sauvegardes | Un effacement y disparaît à la fin de leur rotation (30 jours, à confirmer) |
| Mesures sur les gestes | Rendues anonymes au plus tard 13 mois après leur collecte (repère de la CNIL, de mémoire) |
| Comptes de la part de « aucune » (D-027) | Sans limite : ce ne sont que des totaux anonymes |
| Preuve du consentement | Tant que le compte existe ; après, question pour l'avocat |

**La durée passée sur l'écran de la raison** (`produit.md` §8). Juridique la range parmi les mesures sur les gestes, à trois conditions : elle est comptée sur tous les joueurs, jamais par personne, et jamais croisée avec la position, la raison choisie ou la tension. Croisée, elle pourrait trahir une hésitation politique.

**La production des textes** (Contenu) :
- **Quatre semaines de textes validés d'avance**, plus une réserve de remplacement. Une panne de la chaîne n'a donc jamais à être réparée à 18h05. Avant la bêta, il faut 56 à 84 textes : ce sera la première vraie épreuve de la chaîne.
- **La règle « une forme n'annonce jamais le vote »** (D-041). Un programme compte les formes de chaque lot : le premier mot du titre, le type d'objet (« amendement », « article »), la négation, les tournures répétées. Dès qu'une forme revient trois fois en quatre semaines, elle doit couvrir des textes adoptés et des textes rejetés. Sinon, on réécrit la forme, ou on déplace le texte dans le calendrier, sans jamais changer un fait. Un modèle d'un autre fournisseur parie aussi sur le vote sans le connaître. S'il fait nettement mieux que le hasard, on cherche la forme qui le trahit.
- **Le registre public, hors du jeu.** Pour chaque texte, à partir du 18h de sa révélation, celui où le vote et les auteurs tombent dans le jeu (D-010), jamais avant : le lien du scrutin, les extraits sourcés des quatre raisons, les corrections datées. Il publie aussi la méthode et des chiffres sur le contenu seulement : la répartition par groupe, la part d'adoptés et de rejetés. Jamais un chiffre sur les joueurs, jamais un texte à venir.

**Le premier test de l'étape 6** (Front-end). Le test du message de 18h, sur de vrais téléphones, vérifiera aussi la connexion Google ou Apple depuis l'icône et la reconnexion après l'ajout de l'icône. S'ils échouent, la question vous reviendra, comme D-035 le prévoit.

**Une correction à faire dans `docs/onboarding.md`**, lors de sa mise à jour pour D-035. Il dit que la connexion Apple devient obligatoire sur l'App Store. La règle actuelle d'Apple (4.8, vérifiée) demande seulement une option de connexion équivalente, qui protège la vie privée. Cela ne change rien sur le fond : vous avez retenu Apple de toute façon.

---

## Ce que ça coûte, en ordres de grandeur

Tous ces montants sont des estimations de l'équipe, sauf mention contraire. Aucun n'est un devis. Les lignes marquées « lecture de l'orchestrateur » sont des chiffres que les spécialistes n'avaient pas donnés tels quels.

**Jusqu'à la fin de la bêta, avec les options recommandées** (somme faite par l'orchestrateur) :

| Poste | Montant |
|---|---|
| Création de la SASU et première année de comptabilité | 800 à 1 750 € |
| Compte développeur Apple | 99 € par an (sources de 2020-2021, à revérifier) |
| Hébergement, e-mails et sonde de 18h, sur environ six mois | 200 à 600 € |
| Un téléphone Android de test (votre iPhone sert déjà) | 100 à 200 € |
| Deux ou trois adresses web (lecture de l'orchestrateur) | 50 à 150 € par an |
| Recherche du nom par un conseil, puis marque française | 600 à 1 100 € |
| Avocat, relecture avant la bêta (« quelques milliers d'euros » selon Juridique ; fourchette : lecture de l'orchestrateur) | 2 000 à 5 000 € |
| Développeur, relecture du code sensible avant la bêta | 2 000 à 7 000 € |
| Chaîne des textes : 56 à 84 textes d'avance, puis un par jour de bêta, soit environ 150 (lecture de l'orchestrateur) | 300 à 2 300 € |
| Relecteur extérieur des textes, quatre à cinq mois (lecture de l'orchestrateur) | 800 à 2 500 € |
| **Total** | **environ 7 000 à 21 000 €** |

Ce total ne compte pas :
- votre abonnement Claude pour les agents, que l'équipe ne connaît pas ;
- le secours du soir par le développeur pendant la bêta, dont le prix est inconnu (s'il était payé comme après l'ouverture, 800 à 2 800 € par mois, il ajouterait 1 600 à 8 400 € pour 8 à 12 semaines) ;
- la rédaction des statuts et de la clause de rachat (choix 1 et 6), non chiffrée.

**Pour l'ouverture** (seconde tranche), environ **8 000 à 21 000 €** :
- l'audit de sécurité : 3 000 à 10 000 € ;
- la relecture complète par l'avocat : quelques milliers d'euros (2 000 à 5 000 €, lecture de l'orchestrateur) ;
- le délégué à la protection des données : quelques milliers d'euros par an (même lecture) ;
- la marque européenne : 1 050 €, à décider peut-être plus tôt (voir le choix 10) ;
- le compte Google : 25 $ ;
- le test de charge du pic de 18h : quelques dizaines d'euros.

**Ensuite, chaque mois** :
- le développeur : 800 à 2 800 € ;
- le relecteur des textes : 200 à 500 € ;
- la chaîne des textes : environ 100 à 700 € ;
- l'hébergement, les e-mails et la sonde : 60 à 190 € pour 1 000 joueurs, 150 à 400 € pour 10 000.

**Avec d'autres options** : un prestataire (choix 3) coûterait 50 000 à 150 000 € pour construire. Les agents seuls retirent le développeur, mais aussi la seule relecture humaine du code. Si vous validez vous-même les textes (choix 4a), le relecteur disparaît, mais vous perdez la surprise.

---

## Désaccords et arbitrages

- **Choix 2, option « application dès la bêta ».** Back-end parle de deux versions à construire. Front-end écrit, de son côté, que c'est un seul code, emballé plus tôt. L'orchestrateur retient : un seul code, deux chemins à tenir.
- **Choix 4a.** Contenu recommandait une validation humaine, sans dire qui. L'orchestrateur a séparé « un relecteur extérieur » et « vous » en deux options, et recommande le premier pour que vous gardiez la surprise. Les options de Contenu ont donc été renumérotées.
- **Choix 5, ordre des options.** Back-end et Juridique proposaient les mêmes trois options, dans un ordre différent. L'orchestrateur les range de la plus protectrice à la moins protectrice.
- **Choix 5, le message de 18h.** Juridique écrit que le message est le même pour tous. Back-end écrit qu'il a plusieurs formes selon ce qui attend le joueur, ce que dit E1. L'orchestrateur suit Back-end et ajoute l'annonce d'arrivée de D-006, qui cite un prénom.
- **Choix 1 et 9a.** Juridique note que l'association devient la meilleure forme si le jeu reste gratuit, vit de dons et a deux fondateurs. La recommandation de Game design (gratuit, puis une contribution libre) remplit les deux premières conditions. Lecture de l'orchestrateur : sans cofondateur, la SASU reste recommandée ; si vous en avez un, l'association mérite d'être regardée.
- **Choix 9a, règles de l'argent.** Game design en écrivait douze ; l'orchestrateur les a regroupées en cinq, sans en retirer.
- **Choix 10 et budget.** Le plan du 5 octobre mettait la marque dans la tranche d'ouverture. Si vous suivez la recommandation du choix 10, la marque française passe dans la première tranche, et la marque européenne doit être décidée dans les six mois qui suivent.
- **Faits confirmés par l'orchestrateur.** Trois points que les agents donnaient de mémoire ont été confirmés en ligne par l'orchestrateur : le compte Apple pour la connexion sur un site (guides d'autres éditeurs), la revue de la première version TestFlight (page d'Apple), la fermeture de l'outil de liens de Google (sources secondaires). Le texte le dit à chaque endroit.

---

## Limites, dites franchement

- **Personne dans l'équipe n'est avocat.** Plusieurs points de droit sont de mémoire ou tirés de sources secondaires : le règlement sur l'IA, le délégué, les durées, la clause de rachat. L'avocat les confirmera (choix 8).
- **Les sites officiels n'ont pas tous pu être ouverts** depuis l'environnement : le texte officiel européen, les bases de marques, les registres d'adresses web. D'où la mention « sources secondaires ».
- **Plusieurs inconnues ne se lèveront qu'en bêta** : la part des joueurs iPhone qui ajoutent l'icône, la part des codes par e-mail qui n'arrivent pas, la part des textes renvoyés par le relecteur, et si une mention IA, au cas où vous la retenez, entame la confiance.
- **La faisabilité de l'égalité entre groupes** et le principe « rien ne se calcule à 18h pile » sont des conceptions, pas des preuves. L'étape 6 les vérifiera.
- **Apple ne publie pas sa pratique** sur les « informations sensibles » de sa règle 5.1.1 (ix). Un refus reste possible, quelle que soit la structure.
- **La date de sortie reste inconnue.** Elle ne pourra s'estimer qu'avec vos réponses aux choix 2, 3 et 4a.

---

## Sources consultées le 11 octobre 2026

- Apple, [règles de revue de l'App Store](https://developer.apple.com/app-store/review/guidelines/) (règles 4.2, 4.8, 5.1.1) ; [dispense de l'abonnement développeur](https://developer.apple.com/support/membership-fee-waiver/) ; [revue des versions de test TestFlight](https://developer.apple.com/help/glossary/testflight-app-review/).
- Prix du compte Apple en France : [iPhoneSoft, 2021](https://iphonesoft.fr/2021/04/09/app-apple-developer-payer-compte-developpeur-france) ; [Consomac, 2020](https://consomac.fr/news-11920-apple-peut-maintenant-offrir-son-programme-developpeur.html).
- Connexion Apple sur un site, compte développeur requis (sources secondaires) : [Serverpod](https://docs.serverpod.dev/3.2.0/concepts/authentication/providers/apple/setup) ; [Akamai](https://techdocs.akamai.com/identity-cloud/docs/the-sign-in-with-apple-social-login-configuration-guide).
- Google Play : [test fermé pour les comptes personnels](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB) ; [Android Authority](https://androidauthority.com/google-play-app-testing-requirement-3510580).
- Fermeture de l'outil de liens de Google pour les applications (Firebase Dynamic Links, 25 août 2025), qui pèse sur l'option « application dès la bêta » (sources secondaires) : [Notificare](https://notificare.com/blog/2023/09/11/firebase-dynamic-links-is-shutting-down/).
- Marques : [INPI, barème au 2 juillet 2026](https://www.inpi.fr/inpi-block/download-document?id=20516) ; [Keobiz](https://www.keobiz.fr/le-mag/deposer-une-marque-prix) ; [Finnegan, tarifs EUIPO](https://www.finnegan.com/en/insights/blogs/incontestable/major-changes-in-european-trademark-practice-coming-march-23-2016.html) ; [revue *Elenchos*, De Gruyter Brill](https://www.degruyterbrill.com/journal/key/elen/html).
- Création d'une SASU : [Swim](https://www.swim.legal/blog/cout-creation-sasu) ; [LegalPlace](https://legalplace.fr/guides/cout-creation-sasu).
- Règlement européen sur l'IA, article 50 (sources secondaires) : [Commission européenne, lignes directrices](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems) ; [Stephenson Harwood](https://www.stephensonharwood.com/post/102nfqh/eu-ai-act-update-european-commission-adopts-guidelines-on-article-50-transparency-obligations/) ; [Pearl Cohen](https://www.pearlcohen.com/european-commission-publishes-final-guidelines-on-ai-transparency-obligations/) ; [Mayer Brown, juillet 2026](https://www.mayerbrown.com/en/insights/publications/2026/07/eu-ai-act-news-digital-omnibus-on-ai-new-guidance-on-risk-classification-gpai-and-transparency-obligations) ; [iubenda](https://www.iubenda.com/en/blog/ai-omnibus-adopted-august-2-obligations-july-2026/).
- Cadre d'échange de données Europe – États-Unis (sources secondaires) : [WilmerHale, 1er décembre 2025](https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework) ; [ieu-monitoring, 28 juin 2026](https://ieu-monitoring.com/editorial/microsoft-backs-eu-commission-in-eu-court-case-on-transatlantic-data-flows-and-privacy/1244467/).
