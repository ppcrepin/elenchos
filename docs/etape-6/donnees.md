# Protection des données : les exigences avant le code

*Mis à jour le 16 octobre 2026 pour le jeu entier (D-062 à D-066), d'après la relecture du schéma par Juridique.*

*Étape 6, travail 3 de `docs/plan-construction.md` (partie 4). Back-end, avec le regard de Juridique, 11 octobre 2026. Juridique n'est pas avocat : les points de droit sont à confirmer par l'avocat (D-044). Aucune donnée réelle de joueur n'existe ni n'a servi (D-048) : les exemples sont inventés. Ce document ne décide rien de lui-même : ce qui n'est écrit dans aucune décision est marqué « (proposé) ».*

*État, 11 octobre 2026 : le porteur a répondu à « La question » et à la question « Mesures » de `docs/etape-6/regles.md` (D-052). Les agents peuvent lire, outre la part de « aucune », les totaux des mesures de la bêta, par groupes au-dessus des seuils, dans un rapport que vous leur donnez, jamais par un accès ; aucun journal ne leur va (D-052, point 3). Les trois comptes de mi-bêta sont décidés (D-052, point 2) : P-22 a et P-39 a valent sans condition, et l'usage 5 de la carte des données existe. Les passages touchés sont mis à jour (En bref, partie 1, P-04, P-21, P-22 a, P-23, P-28, P-39 a, parties 4 à 8, « La question ») ; le reste ne change pas.*

*État, 12 octobre 2026 (D-054) : le jeu se joue sur iPhone seulement (D-054, point 3). Le message de 18h ne passe donc plus que par le service d'Apple ; Google ne reste hors d'Europe que pour la connexion. P-06, P-12, le tableau et la note 2 de la partie 1, la partie 5 (point 7) et la partie 7 sont mis à jour. Le test du message de 18h est validé (D-054, point 1) : P-43, sa ligne de la carte des données (partie 4) et P-21 reçoivent les précisions de `docs/etape-6/test-18h.md`. Le reste ne change pas. Report de D-054 relu par Cohérence (compatible avec réserves, corrigées), puis par le Vérificateur (OK avec corrections, appliquées).*

*État, 12 octobre 2026 (avis de Juridique sur Scalingo, quatre constats vérifiés ce jour dans la documentation de Scalingo ; rapport de Cohérence, lignes B3 et C2) : des faits connus remplacent des « à vérifier ». Scalingo garde tous ses journaux un an, hors de notre main : P-07 porte donc la promesse d'effacement pour la bêta (vigilance ajoutée à P-07, trois questions pour l'avocat en partie 5, un risque en partie 6). Les durées de ses sauvegardes sont connues pour le plus petit plan (P-32, la carte des données). Le bulletin de sécurité du 12 août 2026 est relevé (partie 8). P-08, P-43, la carte des données et les parties 7 et 8 suivent. P-12 vérifié : Apple est bien le seul service d'acheminement, rien à changer. Le reste ne change pas.*

**Comment lire les faits.** « De mémoire » : ce que savent les agents, à vérifier. « À vérifier » : un fait à établir avant de s'en servir. Le reste découle de vos décisions ou de documents déjà validés, cités à chaque fois. Les moyens techniques de la partie 3 (rôles de base de données, empreintes, vues, chiffrement, numéros tirés au hasard) sont des propositions de Back-end, sauf ceux qu'une décision impose ; les règles qui ont une conséquence visible pour un joueur ou pour vous sont, en plus, marquées « (proposé) » une à une.

---

## En bref

**Ce qui a été fait.** Chaque exigence du plan (travail 3), celles de vos décisions D-042, D-043, D-045 et D-048, et les quatre règles de la limite 3 de `docs/plateforme.md` sont écrites ici comme des règles vérifiables : **43 exigences** (partie 3), plus sept sous-points : cinq tirés des règles de Game design (`docs/etape-6/regles.md`) : P-03 a, P-04 a, P-22 a, P-27 a et P-39 a ; deux ajoutés d'après la relecture de Juridique du 16 octobre 2026 : P-19 a et P-39 b. P-22 a et P-39 a valent sans condition depuis que vous avez ajouté les trois comptes de mi-bêta (D-052, point 2). Pour chacune, le test automatique qui la prouvera dans le code est décrit, avec le travail où il sera construit. Quatre outils de test servent partout (partie 2). Ce qu'aucun programme ne peut prouver, par exemple qu'un prestataire est vraiment européen, est dit franchement et confié à un contrôle humain (partie 3, fin).

**Ce que vous regardez : « qui voit quoi » (partie 1).** Un tableau : pour chaque donnée d'un joueur, qui la voit. Trois choses à retenir :
- **les réponses ne sont vues que du cercle**, selon les règles du jeu. Aucun écran ne les montre à l'équipe : ni à vous, ni aux agents ;
- **vous détenez les clés de la version en ligne** : techniquement, vous pourriez tout lire. L'engagement est de ne pas le faire, et aucun écran d'administration ne vous montre une réponse. Scalingo, comme tout hébergeur, garde tout ; un contrat doit lui interdire de s'en servir (à vérifier avant de signer) ;
- **sur la version d'aperçu, où vous validez en jouant, l'équipe voit ce que vous saisissez.** Vos vraies opinions n'ont rien à y faire : une bande le rappellera sur chaque écran, et une connexion d'essai vous évitera d'y mettre votre compte Apple (proposé, P-20).

**Ce qui vous revenait : une question, à la fin, répondue (D-052, point 3).** Que peuvent lire les agents, parmi des chiffres et des journaux de la version en ligne que nous jugeons ne contenir aucune donnée de joueur (à confirmer par l'avocat) ? Vous avez retenu la deuxième des quatre options, « Aussi les totaux des mesures » : outre la part de « aucune », les totaux des mesures de la bêta (gestes, justesse, Mystère, trois comptes de mi-bêta), par groupes au-dessus des seuils, dans un rapport que vous leur donnez, jamais par un accès ; aucun journal. Nous recommandions la première (la part de « aucune » seulement). La réponse fixe la frontière d'une garantie que vous donnez aux joueurs (« aucune donnée de joueur vers un fournisseur d'IA », D-043).

**À part** : les points pour l'avocat (partie 5) et ceux de l'analyse d'impact (partie 6). Aucune décision n'est modifiée sans le dire : la partie 7 liste ce que vos réponses touchent (D-027, D-042), ce qu'il propose et qui touche une décision (D-045 et D-010 pour l'e-mail d'avant effacement), et ce qu'il précise (dont D-043 pour l'acheminement des messages).

---

## 1. Qui voit quoi

*Cette partie se lit seule ; les règles qui la prouvent sont en partie 3.*

**Les mots.**
- **Scalingo** : l'hébergeur français où tourne le jeu (D-048). Il garde la base de données : tout ce que le jeu enregistre.
- **Scaleway** : le service français qui envoie nos e-mails et garde une copie de secours de la base (choix de l'équipe, `docs/plateforme.md` ; D-048 ne décide que Scalingo ; à confirmer au travail 5).
- **Les agents** : les assistants d'IA qui construisent le jeu. Ils travaillent chez un fournisseur américain d'IA, qui voit tout ce qu'ils voient.
- **Le téléphone** : le jeu ne demande jamais de numéro de téléphone.
- **Chiffré** : illisible sans la clé. **Un total** : un chiffre sur beaucoup de joueurs, jamais rattaché à un nom.
- **La version d'aperçu** : une copie du jeu, remplie de données inventées, où vous validez en jouant.

**Le tableau** suit Marie, membre d'un cercle avec Thomas, Paul et Hugo. « aucun écran » : pourrait techniquement la lire, mais aucun écran ne la montre. « total » : seulement dans un total. « rapport » : seulement dans un total, au-dessus des seuils, dans un rapport que vous leur donnez, jamais par un accès (D-052, point 3). « — » : sans objet. Les chiffres renvoient aux notes.

| Ce que le jeu garde de Marie | Marie | Son cercle | Vous (1) | Les agents | Scalingo (7) | Apple et Google (8) | Le fournisseur d'IA |
|---|---|---|---|---|---|---|---|
| Son adresse e-mail | oui | non | aucun écran | non | une empreinte seulement (l'adresse n'est jamais gardée) | si elle se connecte par eux ; Apple aussi, si elle est invitée par e-mail à TestFlight (8) | non |
| Son pseudo | oui | oui | aucun écran | non | oui | non (2) | non |
| Sa réponse : position et raison | oui | en partie (3) | aucun écran | non | oui | non | non |
| Son portrait, ses tempéraments, ses titres | oui | oui | aucun écran ; total (9) | rapport (9) | oui | non | rapport (9) |
| Sa barre « Ton portrait se dessine » | oui | non | aucun écran | non | oui | non | non |
| Ses devinettes et ses points | oui | non (4) | total | rapport | oui | non | rapport |
| Ses gestes : ouvertures, durées, a joué ou non | oui | « a déjà joué » (5) | total ; testeur par testeur, ce que montre TestFlight (8) | rapport | oui | Apple, par TestFlight : installation, ouvertures, plantages (8) | rapport |
| Si sa raison était « aucune » | oui | en partie (3) | total (6) | rapport (6) | oui | non | rapport (6) |
| Son adresse internet, et l'adresse technique où son téléphone reçoit le message de 18h | — | non | non | non | oui | Apple : pour la connexion et le message de 18h ; Google : pour la connexion seulement (D-054) | non |
| Les journaux techniques du jeu, sans rien d'elle | — | non | oui | non | oui | non | non |

**Les notes.**
1. Vous détenez les clés : techniquement, vous pourriez tout lire. L'engagement (proposé) : aucun écran d'administration ne vous montre une réponse, un pseudo ni une adresse ; vous n'ouvrez la base que pour une restauration ou un incident (D-048), et chaque ouverture laisse une trace.
2. Exception : l'annonce faite au créateur d'un cercle à chaque arrivée cite le pseudo de qui arrive. Sur le web, Apple l'achemine chiffrée, sans la lire (de mémoire, à vérifier au test de 18h) ; le jeu se jouant sur iPhone seulement, Apple est le seul service d'acheminement (D-054).
3. Le lendemain, pendant Deviner, ses proches voient sa réponse sur une carte, sans nom. À 18h, chacun apprend qu'elle était de Marie si la carte lui était servie, ou s'il a désigné Marie sur une carte d'un proche qui avait répondu exactement la même chose (D-024). Le graphique de l'avis du cercle compte sa position chaque jour, presque nom par nom dans un petit cercle (D-025). Sa raison, elle, reste cachée hors de ces deux cas.
4. Le cercle voit les titres que valent ses devinettes, jamais les devinettes une à une. Thomas, qui l'a invitée, voit son score d'entrée.
5. Jamais qu'un membre est en pause (D-010, D-011) ; mais le total de l'avis du cercle peut laisser voir qu'un membre n'a pas répondu (D-025).
6. La part de « aucune » de chaque texte, sur tous les joueurs, au-dessus de 30 réponses, jamais par cercle ni par personne, jamais publiée : vous la lisez, et les agents la reçoivent dans le rapport que vous leur donnez (D-027, élargi par D-052, point 3 : il disait « le porteur et Contenu »).
7. Un contrat doit interdire à Scalingo de se servir de ce qu'il garde (RGPD, art. 28 ; à vérifier avant de signer). Le chiffrement protège les copies, par exemple une sauvegarde volée, pas contre l'hébergeur, qui garde aussi la clé.
8. Apple et Google apprennent, si Marie se connecte par eux, qu'elle a un compte Elenchos et quand elle s'y connecte ; jamais ses réponses ni son cercle. Pour le test, Apple apprend aussi, par TestFlight, que Marie teste Elenchos (et son adresse, si le porteur l'invite par e-mail) ; il montre au porteur, testeur par testeur, l'installation, les ouvertures et les plantages ; les retours que Marie envoie par le bouton de TestFlight passent aussi par Apple (`docs/etape-6/testflight-juridique.md`, 1.4). Le porteur ne s'en sert que pour réparer le jeu et ne les montre jamais aux agents (proposé).
9. Les trois comptes de mi-bêta (Pas de Côté par mois, tempéraments en cours, curseurs nets à 40, 60 et 80 réponses) : sur tous les joueurs, au-dessus de 30 joueurs par groupe compté, jamais par cercle ni par personne, jamais publiés (D-052, point 2 ; P-22 a, P-39 a).

**Les autres.** Scaleway voit l'adresse et le contenu de nos e-mails (le code ; aucun e-mail d'avertissement avant effacement n'est prévu en attendant la décision de la version publique, P-05 et P-30), jamais une réponse ; pendant le test, il ne garde aucune copie de la base (P-13). La boîte mail de Marie (Gmail, Orange…) voit qu'un e-mail d'Elenchos est arrivé. La messagerie par laquelle Thomas invite Marie voit l'invitation, jamais une réponse. La sonde qui vérifie à 18h02 que les messages sont partis, et GitHub, qui garde le code, ne voient aucune donnée de joueur. Enfin, Marie, avant d'entrer, voit les trois réponses d'entrée de Thomas, par son lien personnel : la seule exception à « rien ne sort du cercle » (D-006).

**Une réponse, du mardi au jeudi.** Mardi, Marie répond « Défavorable · Ça coûte trop cher » ; la réponse part chez Scalingo, chiffrée.
- **De mardi 18h à mercredi 18h**, Paul la voit sur une carte, sans nom. Son téléphone ne reçoit rien qui la relie à Marie, pas même un code caché.
- **Mercredi 18h**, Paul apprend que c'était Marie ; le graphique du cercle compte un « défavorable ».
- **Jeudi**, elle compte dans un seul total, la part de « aucune » du texte, lue par vous, et par les agents dans le rapport que vous leur donnez (D-027 ; D-052, point 3). Elle sert aussi au calcul des trois comptes de mi-bêta, qui n'en gardent que des totaux (D-052, point 2).
- **Si Marie efface tout**, sa réponse disparaît tout de suite de la base, et des copies de secours en un mois environ (quatre semaines chez Scalingo, vérifié le 12 octobre 2026 ; 30 jours chez Scaleway, proposé). Ses titres restent sous « un ancien membre » (D-045).

**Ce que l'équipe voit de vous.** Dans la version en ligne, rien : vous êtes un joueur comme un autre (D-048). Dans la version d'aperçu, les agents voient tout ce que vous saisissez : une bande le rappellera, et une connexion d'essai vous évitera d'y mettre votre compte Apple (proposé). N'y mettez pas vos vraies opinions.

---

## 2. Quatre outils de test, communs à toutes les exigences

Ces outils sont la façon de prouver par programme qu'une donnée ne va pas là où elle ne doit pas aller. Ils reprennent ce qui a marché aux essais.

- **Le traceur.** On joue une partie simulée en remplissant chaque champ d'une valeur unique et reconnaissable : le pseudo « Traceur-pseudo-7Q2 », l'adresse « traceur-7q2@exemple.invalid », une raison marquée, un nom de cercle marqué, et ainsi de suite. Puis on cherche ces valeurs partout où rien de personnel ne doit aller : journaux, messages, e-mails, adresses des pages demandées, mémoire du téléphone, rapports de mesure, copies de base. Une seule trouvaille fait échouer le test. Le domaine `exemple.invalid` est réservé : aucun e-mail ne peut y partir.
- **Les réponses inversées.** On joue la même semaine deux fois, avec les mêmes gestes, mais des avis contraires : défavorable au lieu de favorable, une autre raison, neutre partout. Tout ce qui ne doit pas dépendre des avis (journaux, mesures sur les gestes, messages, ce que voit un proche avant 18h) doit rester identique octet pour octet, une fois les heures et les numéros tirés au hasard masqués. C'est le contrôle 12 des essais, repris (`docs/essai/simulation-2.md`).
- **L'horloge simulée.** Le serveur lit l'heure d'une seule horloge, qu'un test peut régler : 17 h 59 min 59 s, puis 18 h ; la veille du jour où part l'e-mail d'avant effacement, puis ce jour-là. Elle vient du travail 6 (horloge du jeu).
- **Le relevé du réseau.** Un navigateur automatique joue tous les écrans et note chaque adresse que le téléphone contacte ; un relevé semblable note chaque adresse que le serveur contacte. Toute adresse hors d'une liste fermée fait échouer le test.

Deux mots employés plus bas :
- **un rôle de base de données** est un compte de connexion à la base, avec des droits précis. Le jeu, les comptes et les mesures s'y connectent chacun sous un rôle différent ; la base refuse d'elle-même ce que le rôle n'a pas le droit de lire ;
- **la carte des données** est la liste de chaque donnée gardée, avec son usage, qui la voit, où elle est et combien de temps (partie 4).

---

## 3. Les exigences

Chaque exigence dit d'où elle vient, ce qu'elle demande, et comment un test automatique la prouve. « Travail n » renvoie au plan (partie 4), où le test sera construit.

### A. Ce qui est gardé, et comment

**P-01. L'adresse e-mail n'est jamais gardée ; seule en reste une empreinte, rangée à part des réponses.** *Plan, travail 3 ; `jeu/DECISIONS-TECHNIQUES.md`, 1.7 ; avis de Juridique du 16 octobre 2026.*
L'adresse n'est jamais écrite dans la base : elle ne passe que le temps d'envoyer le code (par Scaleway), et seule en reste une empreinte, calculée avec une clé à part (`CLE_IDENTITES`). Il en va de même pour l'identifiant donné par Apple ou Google. L'empreinte vit dans une table à part ; les réponses ne connaissent qu'un identifiant tiré au hasard. Le jeu se connecte sous un rôle qui ne peut pas lire cette table ; seul le module des comptes le peut (connexion). À la connexion, on retrouve le compte par l'empreinte, jamais par l'adresse. L'e-mail d'avant effacement (D-045, point 1) n'est donc plus faisable tel quel : voir P-30.
Exemple : une extraction de la table des réponses montre « joueur 8f3c… : défavorable », et rien qui mène à Marie.
*Test.* Sous le rôle du jeu, toute lecture de la table des empreintes est refusée par la base. Traceur : dans une copie complète de la base d'essai, l'adresse du traceur n'apparaît nulle part. Le code du jeu n'appelle le module des comptes que pour obtenir un identifiant (vérification automatique des dépendances entre modules). *Travail 5.*

**P-02. Les réponses et le « pourquoi » sont chiffrés dans la base, avec des clés gardées hors de la base.** *Proposé (Back-end) ; RGPD, art. 32 ; avis de Juridique du 16 octobre 2026.*
La position et la raison de chaque réponse, et le « pourquoi » de la carte « qui et pourquoi », sont chiffrés par notre programme avant d'entrer dans la base, à longueur fixe, chaque valeur chiffrée étant liée à sa ligne. Aucune adresse n'est gardée (P-01). Le serveur exige trois clés distinctes pour démarrer ; ce sont des réglages de Scalingo, jamais dans la base, les sauvegardes ou le dépôt ; vous en gardez une copie hors ligne. Une sauvegarde ou une extraction volée ne dit donc rien de ce que pensent les joueurs, tant que la clé n'est pas prise avec elle. `CLE_IDENTITES` ne change jamais pendant le test : si elle fuit avec une copie de la base, on pourrait tester des adresses connues et savoir qui joue. Si une clé fuit, la procédure est une demi-page « si les données fuient » (CNIL sous 72 heures, prévenir les joueurs, changer les clés), à vous remettre avant les amis (D-066, rappel de Juridique). Les données dérivées des réponses qui restent en clair, et pourquoi, sont listées sur la carte (partie 4, « Données en clair dérivées des réponses »).
*Test.* Dans une copie de la base d'essai, aucune position ni raison n'est lisible ; deux réponses identiques donnent deux suites chiffrées différentes ; une valeur chiffrée recopiée sur une autre ligne ne se déchiffre pas ; sans l'une des trois clés, ou si deux clés sont identiques, le serveur refuse de démarrer, au lieu de tourner à moitié. *Travail 5.*

**P-03. Le jeu ne demande que ce qui sert.** *D-035, D-006, `docs/onboarding.md` (règle 2 du compte).*
À Apple ou Google, le jeu ne demande que l'identifiant : ni l'adresse e-mail, ni le nom, ni la photo (D-061 ; moins que le plafond de D-035). Aucune date de naissance : « 15 ans et plus » est une déclaration sur la carte de consentement. Le pseudo n'est jamais prérempli avec le nom donné par Apple ou Google.
*Test.* La demande envoyée à Apple et à Google ne contient que l'autorisation « identifiant », et rien d'autre (lecture de la demande produite). La base n'a aucun champ nom, photo ni date de naissance (comparaison avec la carte des données). Après un retour simulé d'Apple qui fournit un nom, le champ pseudo est vide. *Travail 9.*

**P-03 a. Un seul pseudo par compte.** *Règle 15 de `docs/etape-6/regles.md` (proposé).*
Le pseudo reste un seul champ du compte, le même dans tous ses cercles. Si un joueur qui rejoint un autre cercle doit en changer (pseudo déjà pris), le nouveau vaut partout. Un pseudo propre à chaque cercle créerait une donnée de plus : il n'est pas proposé. P-27 n'a rien à changer.
*Test.* La base n'a qu'un champ pseudo, rattaché au compte, aucun rattaché à un cercle (comparaison avec la carte des données). *Travail 9.*

**P-04. Chaque donnée gardée figure sur la carte des données, avec un usage de la liste fermée.** *D-042, point 2 ; plan, travail 11 (carte des données).*
Les usages permis sont cinq : faire tourner le jeu ; compter la part de « aucune » (D-027) ; les mesures sur les gestes ; la sécurité ; régler les seuils du jeu, par les trois comptes de mi-bêta (D-052, point 2 ; P-22 a). Un champ sans ligne sur la carte n'a pas le droit d'exister.
*Test.* À chaque changement de code, un programme compare les tables réelles de la base d'essai à la carte : tout champ absent de la carte, ou sans usage, fait échouer la vérification. *Travail 5, puis à chaque changement.*

**P-04 a. Un texte corrigé après coup peut sortir des portraits.** *Règle 20 de `docs/etape-6/regles.md` (proposé, confirmée par Contenu et Back-end) ; D-044, point 1.*
Chaque réponse garde le texte auquel elle répond. Le texte porte un champ « retiré des portraits le … », inscrit sur la carte des données (partie 4). Quand il est rempli, le recalcul rejoue toutes les réponses sans celles de ce texte, y compris une réponse arrivée après le retrait, même en retard (règle 6). Le recalcul peut être relancé sans changer le résultat. Il s'applique hors de 15h–19h et jamais le dimanche, comme une mise en ligne, pour ne croiser ni les titres du dimanche ni la révélation préparée d'avance. Une étiquette fausse (le lien entre une raison et une valeur, jamais montré au joueur) se corrige par un recalcul avec la bonne étiquette, sans retrait. Le reste ne bouge pas : les réponses restent dans l'Historique, et les cartes, les points, les titres, Le Fidèle, l'avis du cercle et la barre tiennent. L'avis de retrait ou de correction passe dans le sens chaîne → jeu, par le point d'entrée des textes (P-14) : la chaîne ne touche jamais la base des joueurs, et D-043 tient.
*Test.* Sur une base inventée, on retire un texte des portraits : chaque curseur est égal à celui qu'on obtient en rejouant toutes les réponses sauf celles de ce texte ; une réponse en retard arrivée après le retrait n'y compte pas ; une seconde passe ne change rien ; les points, les titres et la barre sont inchangés ; les réponses sont toujours dans l'Historique. Horloge simulée : un retrait demandé à 16h ou un dimanche attend la première heure permise. Une étiquette corrigée donne les curseurs qu'on obtient en rejouant tout avec la bonne étiquette, sans champ de retrait rempli. L'avis arrive par le point d'entrée des textes, qui ne renvoie rien d'autre qu'un accusé de réception. *Travail 8.*

### B. Rien de personnel qui sorte

**P-05. Les messages ne contiennent rien de personnel, à une exception près.** *Plan, travail 3 ; D-043.*
Le message de 18h, sous ses formes (E1), ne cite personne et ne dit rien d'une réponse. L'e-mail du code ne cite ni le pseudo, ni le cercle, ni une réponse. L'e-mail d'avertissement avant effacement est retiré de la liste des messages, en attendant la décision de la version publique (P-30). Seule exception : l'annonce d'arrivée faite au créateur d'un cercle cite le pseudo de qui arrive (D-006, D-011 ; le plan et `docs/produit.md` disent « prénom » : c'est le pseudo, E7, une précision), sans le score (D-061 ; le score reste à l'écran). Apple peut lire le contenu d'un message dans l'application (`jeu/CONTRAT.md`, 2.13) : c'est pourquoi rien de personnel n'y figure, hors ce pseudo. La liste des messages est fermée : un message nouveau ne part pas sans son test.
*Test.* Traceur : chaque modèle de message est rendu dans chacune de ses formes avec les valeurs du traceur ; aucune n'y apparaît, sauf le code dans l'e-mail du code et le pseudo de qui arrive dans l'annonce d'arrivée, où le score n'apparaît jamais. Un modèle sans test fait échouer la vérification. *Travaux 4 et 9.*

**P-06. Sur le web, le contenu d'une notification est chiffré jusqu'au téléphone.** *Proposé ; condition de l'exception de P-05.*
*Sans objet dans l'application de l'App Store (`jeu/CONTRAT.md`, 2.13) : Apple peut y lire le contenu d'un message, contrairement au message web ; P-05 tient. Le texte ci-dessous valait pour le web et est gardé comme trace. La question 7 (partie 5) est posée à l'avocat à la version publique.*
Le serveur refuse d'envoyer une notification dont le contenu ne serait pas chiffré pour le seul téléphone destinataire. C'est ce qui permet de garder le texte validé de l'annonce d'arrivée (D-011, D-014) : Apple, seul service d'acheminement sur iPhone (D-054), l'achemine sans le lire. Au passage à l'App Store (travail 14 ; l'App Store seul, D-054), ce n'est plus vrai d'emblée : soit on chiffre nous-mêmes le contenu dans l'application, soit l'annonce perd le pseudo dans la notification et le garde à l'écran. Le choix se fera à ce moment-là.
*Test.* Le module d'envoi, appelé sans chiffrement, refuse. Un faux service d'acheminement reçoit les envois d'une partie simulée : le traceur n'y apparaît jamais en clair. Au travail 4, sur de vrais iPhone, on vérifie que la forme de notification retenue garde ce chiffrement (de mémoire pour la forme récente d'Apple). *Travail 4.*

**P-07. Les journaux de notre programme ne contiennent aucune donnée de joueur.** *Plan, travail 3 ; D-048.*
Une ligne de journal dit seulement : l'heure, la route sous forme de modèle (« envoi d'une réponse », jamais un identifiant), le résultat, la durée, le type d'erreur, un numéro de requête tiré au hasard. Jamais d'adresse internet, d'identifiant de joueur ou de cercle, de pseudo, d'adresse e-mail, de réponse, ni le contenu d'une demande. Les erreurs remontées par le téléphone suivent la même règle, vers notre serveur seulement.
*Test.* Traceur sur une semaine simulée complète, erreurs provoquées comprises (une saisie invalide qui contient le traceur, une base coupée, un délai dépassé) : le traceur n'apparaît dans aucun journal. Réponses inversées : les journaux des deux parties sont identiques. Aucun identifiant de la forme de ceux de la base n'apparaît dans les journaux (recherche par motif). *Travail 5.*
*Vigilance pour la bêta (avis de Juridique, 12 octobre 2026 ; documentation de Scalingo).* Scalingo garde tous les journaux un an, par obligation légale selon lui, y compris une trace des connexions dont le contenu n'est pas décrit (probablement l'adresse internet et l'heure, hypothèse de Juridique). Ni vous ni les agents ne pouvez l'effacer, et la documentation n'indique pas comment. Tout ce qui entre dans un journal chez Scalingo y reste donc un an, hors d'atteinte de « Tout effacer » : **P-07 est la garantie qui rend vraie la promesse d'effacement (D-045)**. Un journal qui contiendrait une réponse deviendrait une donnée sensible (art. 9) impossible à effacer. Deux précisions proposées, tirées du test du message de 18h : les journaux de la base comptent comme les nôtres (jamais une erreur de la base qui recopie une valeur personnelle : une contrainte « valeur unique » sur l'adresse d'abonnement, par exemple, l'écrirait dans son journal au premier doublon) ; les journaux du routeur de Scalingo, désactivés par défaut, restent désactivés. Le test ajoute ces cas : on provoque ces erreurs sur une base locale sans donnée réelle (D-048) et on lit les journaux locaux.

**P-08. Les adresses des pages ne portent aucune donnée.** *Proposé.*
Ce que le téléphone demande au serveur ne met dans l'adresse ni identifiant, ni pseudo, ni réponse : tout passe dans le corps de la demande. Raison : si les journaux du routeur de Scalingo étaient activés, ils noteraient l'adresse demandée à côté de l'adresse internet (désactivés par défaut, 12 octobre 2026 ; le contenu de sa trace des connexions n'est pas décrit : voir P-07), et le téléphone garde un historique. Le lien d'invitation porte son jeton après le signe « # » : cette partie d'une adresse n'est jamais envoyée au serveur ni aux robots qui fabriquent les aperçus.
*Test.* Pendant une partie simulée, chaque ligne de demande reçue par le serveur est relevée : ni traceur, ni identifiant, ni jeton. *Travail 5.*

**P-09. Aucun outil de mesure, d'erreurs ou de publicité extérieur ; aucune ressource chargée ailleurs.** *Plan, travail 3 ; D-042 ; `docs/plateforme.md`, annexe A.*
Les polices, les images et le code sont servis par le jeu lui-même. Les mesures et les erreurs passent par notre serveur.
*Test.* Relevé du réseau sur tous les écrans : le téléphone ne contacte que l'adresse du jeu, plus Apple ou Google sur l'écran du compte après le toucher (P-10), et le service d'acheminement des messages que le navigateur contacte lui-même quand le joueur accepte le message de 18h. La page déclare au navigateur qu'elle refuse tout chargement venu d'ailleurs (en-tête de sécurité vérifié par le test). La liste des bibliothèques du projet ne contient aucun outil de mesure connu (liste d'exclusion). *Travail 7.*

**P-10. Rien d'Apple ni de Google n'est chargé avant le toucher.** *`docs/onboarding.md`, règle 3 du compte ; D-035.*
*Test.* Relevé du réseau : avant le toucher sur « Continuer avec Apple » ou « Continuer avec Google », aucune demande vers Apple ni Google ; après le toucher, seulement vers celui qui a été choisi. *Travail 9.*

**P-11. Le téléphone ne garde rien des autres.** *Proposé.*
La mémoire du téléphone garde la session, les réglages d'affichage et, le temps de l'envoyer, une réponse pas encore partie. Elle ne garde jamais, au-delà de l'écran affiché, une réponse d'un proche, un pseudo d'un autre cercle ou une révélation. Un proche qui fouillerait la mémoire du téléphone n'y trouverait pas ce que l'écran ne montre plus.
*Test.* Après une partie simulée complète, on lit toute la mémoire du navigateur (stockage local, base du navigateur, cache) : aucun traceur d'un autre membre, aucune donnée de révélation. *Travail 7.*

### C. Les prestataires

**P-12. Tout prestataire qui touche aux joueurs est européen, par son siège et son contrôle ; deux exceptions de D-043, et pour le test la distribution par Apple.** *D-043, point 3 ; D-048 ; D-062, point 2 ; `docs/plateforme.md`, limite 1 ; `docs/etape-6/testflight-juridique.md`, partie 2 (avis de Juridique du 15 octobre 2026).*
Un registre des prestataires, dans le dépôt, dit pour chacun : siège, contrôle, lieu des machines, sous-traitants qui détiennent des données, date du contrat de sous-traitance (RGPD, art. 28), date de la dernière vérification. Les exceptions hors d'Europe sont celles de D-043 : la connexion par Apple ou Google, et l'acheminement des messages de 18h par le service propre au téléphone. Le jeu se jouant sur iPhone seulement (D-054), ce service est celui d'Apple, quel que soit le navigateur de l'iPhone (de mémoire, à confirmer au travail 4) ; ceux de Google, de Mozilla (Firefox) et de Microsoft (Edge), cités avant D-054, sortent de la liste. **S'y ajoute, pour le test, la distribution par Apple** (D-062, point 2) : TestFlight, les testeurs, leurs installations, leurs ouvertures et leurs plantages testeur par testeur, et les retours envoyés par le bouton de TestFlight (proposé ; précise D-043, point 3). Apple est inévitable ici, et ces compteurs par testeur sont encadrés par P-21. Le registre note aussi la durée du journal d'envoi des e-mails de Scaleway, à vérifier avant d'allumer la voie e-mail (carte des données, partie 4).
*Test.* Le serveur ne peut joindre que les adresses du registre (liste fermée appliquée à ses sorties) ; le relevé du réseau du serveur le vérifie sur une partie simulée. Un programme vérifie que le registre ne contient, hors d'Europe, que ces trois sortes d'exceptions. **Ce qu'aucun test ne prouve** : que le siège, le contrôle et les sous-traitants sont bien ceux du registre. C'est un contrôle humain, avant de signer, puis une fois par an (proposé), et l'avocat relit les contrats (D-044). *Travail 5.*

**P-13. La copie des sauvegardes chez Scaleway est chiffrée par nous avant de partir.** *`docs/plateforme.md`, annexe A (copie chez Scaleway, proposé).*
*Pas pendant le test (D-060 : pas de copie des sauvegardes). Valable pour la version publique.*
Scaleway garde une copie qu'il ne peut pas lire : la clé reste chez nous.
*Test.* Le fichier envoyé ne contient aucun traceur en clair ; restauré avec la clé, il redonne la base ; sans la clé, il est illisible. *Travail 5.*

### D. L'IA et les agents

**P-14. La chaîne des textes n'a aucun accès aux données des joueurs.** *Plan, travail 3 ; D-043, point 3 ; D-044, point 2 ; la séparation, proposé.*
La chaîne tourne à part : sa propre application et sa propre base, qui ne contient que des données publiques de l'Assemblée. Elle ne possède aucun mot de passe de la base des joueurs. Le seul passage va dans un sens : la chaîne livre des textes au jeu ; le jeu ne lui renvoie rien. Le registre public de méthode est produit par la chaîne, donc sans aucun chiffre sur les joueurs (§9, D-027).
*Test.* Les réglages de l'application de la chaîne ne contiennent aucune adresse ni aucun mot de passe de la base des joueurs (inventaire automatique). Une tentative de connexion de la chaîne à cette base échoue. Le code de la chaîne n'utilise aucun module du jeu. Le point d'entrée du jeu qui reçoit les textes n'accepte qu'une livraison de texte ou un avis de correction (retrait des portraits ou étiquette corrigée, P-04 a), et ne renvoie rien d'autre qu'un accusé de réception. *Travail 10.*

**P-15. Le jeu n'appelle aucun fournisseur d'IA.** *D-043, point 3.*
*Test.* La liste fermée des sorties du serveur (P-12) ne contient aucun fournisseur d'IA ; la liste des bibliothèques du jeu ne contient aucune bibliothèque d'IA. *Travail 5.*

**P-16. Les agents n'accèdent jamais à la base réelle ni aux journaux de la version en ligne.** *D-048 ; `docs/plateforme.md`, limite 3.*
Les mots de passe de la version en ligne n'existent que dans les réglages de Scalingo, saisis par vous. Ils ne sont ni dans le dépôt, ni dans les outils de vérification automatique, ni dans une session d'agents. Les comptes Scalingo, Scaleway, GitHub, du domaine et d'Apple sont à votre nom, avec une double vérification à la connexion (proposé ; contrôle humain).
*Test.* À chaque changement, une recherche de secrets parcourt tout l'historique du dépôt. L'inventaire des réglages des outils de vérification ne contient aucun nom de réglage de la version en ligne. *Travail 5.*

**P-17. Le dépôt ne contient aucune donnée de joueur.** *D-048 ; `docs/plateforme.md`, annexe F.*
Le dépôt public ne garde que du code, des documents et des données inventées. Proposé, en réponse à la question de l'annexe F de `docs/plateforme.md` : le code de la version en ligne peut rester dans le dépôt public. Il ne contient ni secret ni donnée ; sa publication montre que les promesses sont tenues ; la sécurité ne repose pas sur son secret (P-26 la prouve par des tests).
*Test.* Recherche de secrets (P-16) ; toute adresse e-mail présente dans le dépôt est au domaine réservé `exemple.invalid`. *Travail 5.*

**P-18. La restauration se répète sur des données inventées ; avec de vraies données, c'est votre geste seul.** *`docs/plateforme.md`, limite 3 ; plan, travail 5.*
*Test.* Chaque semaine, une restauration complète d'une base inventée tourne seule : elle redonne les mêmes comptes et le même traceur. Le programme de restauration vers la version en ligne demande une confirmation tapée par une personne et des mots de passe que les outils automatiques n'ont pas (P-16) ; lancé sans eux, il s'arrête. Le travail 5 vérifie en plus que vous réussissez ce geste seul (`docs/plateforme.md`). *Travail 5.*

**P-19. La version d'aperçu ne reçoit jamais de vraie donnée.** *`docs/plateforme.md`, limite 3.*
*Pas pendant le test (D-060 : une seule application Scalingo, pas de version d'aperçu). Le porteur joue sur la vraie base : ses réponses sont des données de joueur, et aucun agent ne les voit. Une exception écrite, bornée, existe pour le relecteur d'Apple : P-19 a. Valable pour la version publique.*
Chaque base porte, dès sa création, une marque : « inventée » ou « réelle ». L'aperçu ne démarre que sur une base marquée « inventée » ; le programme de restauration refuse de verser une sauvegarde « réelle » dans une base « inventée ». Les données de l'aperçu viennent d'un générateur : pseudos inventés, adresses au domaine réservé.
*Test.* Démarrage de l'aperçu sur une base « réelle » simulée : refusé. Restauration croisée : refusée. Inventaire de la base d'aperçu : aucune adresse hors du domaine réservé. *Travail 5.*

**P-20. Ce que vous saisissez sur l'aperçu est visible de l'équipe, et l'écran le dit.** *`docs/plateforme.md`, limite 3 (vos réponses sont des données de joueur) ; proposé.*
Une bande sur chaque écran de l'aperçu : « Version d'aperçu : l'équipe voit ce que tu saisis ici. » (texte d'écran écrit par Back-end, à faire relire par UX au travail 7 avec les autres écrans jamais dessinés). Une connexion d'essai, sans Apple ni Google, existe sur l'aperçu seulement ; les vraies connexions s'y essaient avec des comptes créés pour le test. L'aperçu est remis à zéro chaque semaine. Il ne contient que des données inventées ou d'essai : ce ne sont pas des données de joueur, et la garantie de D-043 n'est pas en jeu, à condition que vous n'y mettiez pas vos vraies opinions.
*Test.* Relevé de tous les écrans de l'aperçu : la bande est présente. La connexion d'essai répond sur l'aperçu et est refusée dans la configuration de la version en ligne. *Travail 7.*

**P-21. Les agents lisent la part de « aucune » et les totaux des mesures de la bêta, dans un rapport que vous leur donnez ; jamais un accès, jamais un journal.** *D-052, point 3 (qui élargit D-027) ; D-043, point 3 ; D-048 ; `docs/plateforme.md`, limite 3 ; précisé par D-054, point 1.*
Ce que les agents peuvent lire de la version en ligne (votre réponse à « La question », deuxième option) :
- la part de « aucune », texte par texte, au-dessus de 30 réponses (D-027) ;
- les totaux des mesures de la bêta : gestes, justesse, part des Mystère, et les trois comptes de mi-bêta (P-22 a), par groupes au-dessus des seuils : 10 joueurs au moins pour les gestes, la justesse et les Mystère (proposé), 30 pour les trois comptes (D-052, point 2) ;
- rien d'autre : aucun extrait de journal, ni des nôtres (P-07) ni de ceux de Scalingo. En cas d'incident, c'est vous qui regardez (D-048 intact). Seule précision (D-054, point 1) : quand une installation échoue, vous pouvez nous copier le message d'erreur de la **fabrication** chez Scalingo, qui ne contient aucune donnée ; jamais un journal de l'application en marche (`docs/etape-6/test-18h.md`, partie 3, point 5).

Un rapport est produit dans la version en ligne ; vous le lisez, puis vous le donnez ; les agents n'ont jamais d'accès direct. Ces totaux sont jugés sans donnée de joueur, à confirmer par l'avocat (partie 5, point 2). La règle est écrite dans « Qui, durée, droits ». La procédure d'incident reste jouable sans ouvrir de session d'agents (plan, travail 12).
*Test.* Sur une base inventée, chaque chiffre du rapport porte sur un groupe au-dessus de son seuil, ou est remplacé par « — » ; le traceur n'y apparaît pas ; le rapport ne contient que les rubriques permises (part de « aucune », totaux des mesures, trois comptes), aucune ligne de journal. Réponses inversées : le rapport est identique, sauf la part de « aucune », les totaux de justesse et de Mystère et les trois comptes, qui dépendent des réponses par nature (P-39, P-39 a). *Travail 12.*

**P-22. Cinq usages, quatre rôles de base de données.** *D-042, point 2.*
Le jeu, les comptes, les mesures et la sécurité se connectent chacun sous leur rôle. Chaque rôle ne peut lire que les champs de son usage sur la carte des données. Les mesures validées qui dépendent des réponses de tous, la justesse et la part des Mystère (`docs/produit.md`, section 8 ; D-041), sont calculées par le rôle du jeu, qui lit déjà les réponses pour jouer ; il les enregistre déjà totalisées, au-dessus du seuil, là où le rôle des mesures les lit. Le cinquième usage (les trois comptes, P-22 a) est lu sous le rôle des mesures.
*Test.* Un programme lit les droits réels de chaque rôle dans la base d'essai et les compare à la carte : un droit en trop fait échouer la vérification. *Travail 5.*

**P-22 a. Trois comptes pour le réglage de mi-bêta.** *D-052, point 2 ; `docs/etape-6/regles.md`, section 5 et question 2 ; seconde exception à la liste fermée (D-042, point 2) et à D-027.*
Le rôle du jeu calcule trois comptes et les enregistre déjà totalisés, là où le rôle des mesures les lit : le nombre de Pas de Côté annoncés, par mois ; le nombre de tempéraments en cours, pour chacun des quatre, rapporté au nombre de joueurs qui peuvent en avoir ; la part des joueurs qui ont au moins un curseur net à 40, 60 et 80 réponses. Le rôle des mesures ne lit toujours ni les réponses, ni les curseurs. Vous les lisez, et les agents aussi, dans le rapport que vous leur donnez (P-21 ; D-052, point 3).

**P-23. Les réponses ne servent qu'à jouer, à compter la part de « aucune » et aux trois comptes de mi-bêta (P-22 a).** *D-027 ; D-042, point 2 ; D-052, point 2.*
Le rôle des mesures ne lit pas les réponses. Il ne lit qu'une vue, c'est-à-dire une fenêtre préparée par la base, qui donne pour chaque texte deux nombres : réponses et « aucune ». La vue ne répond qu'après la révélation du texte et au-dessus de 30 réponses (seuil à fixer dans l'analyse d'impact, D-027). Le compte est fait une fois, puis figé (proposé) : il ne bouge plus si un joueur efface ses réponses ensuite, pour qu'on ne puisse pas retrouver une raison par différence entre deux comptes. Aucune ligne par cercle ni par personne n'existe.
*Test.* Sous le rôle des mesures, la lecture de la table des réponses est refusée. Avec l'horloge simulée, la vue ne donne rien avant la révélation, rien sous 30 réponses, et le même chiffre avant et après l'effacement d'un joueur. La table des comptes n'a que trois colonnes : texte, réponses, « aucune ». *Travail 12.*

**P-24. L'argent ne se croise jamais avec les réponses.** *D-042, point 3, règles 2 et 4. À construire avant l'ouverture, pas avant la bêta (rien n'est demandé aux joueurs de la bêta).*
Ce qu'on sait de qui donne est gardé à part, sous un rôle qui ne lit ni les réponses ni le cercle ; rien de ce qui est montré au cercle ne dépend de qui donne.
*Test, à l'ouverture.* Droits des rôles (P-22) ; réponses inversées et donneur ou non : ce que voit le cercle est identique. *Avant l'ouverture.*

### F. Ce que voit le cercle

Ces exigences prolongent les lignes rouges (§9) et les règles de visibilité déjà décidées. Elles sont prouvées aux travaux 5 et 7 ; elles figurent ici parce qu'elles font le tableau « qui voit quoi ».

**P-25. Le cloisonnement des cercles est imposé par la base elle-même.** *Plan, travail 5 ; §9.*
La base ne montre une ligne d'un cercle qu'à un membre de ce cercle, même si une demande oublie son filtre (fonction standard de PostgreSQL, de mémoire). Le programme ne se connecte jamais sous le rôle propriétaire des tables, qui échapperait à cette règle.
*Test.* Pour chaque demande possible, un membre du cercle A ne reçoit rien du cercle B. Une version volontairement fautive du programme, privée de ses filtres, ne reçoit toujours rien : c'est la base qui refuse. *Travail 5.*

**P-26. Rien de la révélation n'arrive dans le téléphone avant 18h.** *D-010 (lecture A de C-006) ; plan, travail 7.*
Avant 18h, aucune réponse envoyée au téléphone ne contient le vote, un auteur, l'auteur d'une carte ou l'avis du cercle, même sous une forme cachée. Une carte de Deviner porte un numéro tiré au hasard pour chaque joueur et chaque jour, jamais un numéro qui permettrait de la relier à un membre.
*Test.* Horloge simulée à 17 h 59 min 59 s : pour chaque joueur et chaque demande, la réponse ne contient aucun traceur de la révélation ; à 18 h, elle les contient. Les numéros des cartes diffèrent d'un joueur à l'autre et d'un jour à l'autre, et ne correspondent à aucun identifiant de membre. *Travail 7.*

**P-27. Un membre ne voit d'un autre que ce que les règles montrent.** *D-010, D-011, D-024, D-025, D-026 ; règle 19.*
Ce que le téléphone reçoit au sujet d'un autre membre suit une liste fermée : pseudo, rond, curseurs, tempéraments, titres, « déjà joué », cartes révélées selon les règles, ses surprises. Jamais : l'adresse, la voie de compte, la barre du portrait (D-026), la pause (D-010, D-011), ses autres cercles.
*Test.* Chaque réponse du serveur au sujet d'un autre membre est comparée à la liste fermée : un champ en trop fait échouer le test. Un membre en pause et un membre actif qui n'a pas répondu ce jour-là produisent, pour les autres, des réponses identiques. Réponses inversées : ce qu'un proche reçoit avant 18h est identique. *Travail 7.*

**P-27 a. Le cercle voit les curseurs d'après les seules réponses révélées.** *Règle 19 de `docs/etape-6/regles.md` (lecture A, proposé ; conséquence de D-010).*
Un curseur envoyé à un autre membre se calcule d'après l'entrée et les réponses déjà révélées, jamais d'après une réponse pas encore devinée : sinon, un curseur qui bouge avant 18h trahirait la réponse du jour. Le joueur, dans Moi, voit tout son portrait.
*Test.* Horloge simulée : avant 18h, le curseur de Marie reçu par Paul est identique, octet pour octet, que Marie ait répondu favorable, défavorable ou pas encore répondu au texte du jour ; à 18h, il change selon la réponse révélée. *Travail 8.*

**P-28. Aucun calcul ne réunit plusieurs cercles, sauf des totaux internes : la part de « aucune » (D-027), les mesures validées (D-041, P-39) et les trois comptes de mi-bêta (D-052, point 2).** *§9 ; D-025 ; D-027 ; D-052, point 2 ; règle 3 (R8).*
L'avis du cercle se calcule cercle par cercle. Le seul croisement permis entre cercles est celui de la règle 3 : une personne n'est proposée qu'une fois par jour.
*Test.* Un joueur présent dans deux cercles : chaque graphique de l'avis du cercle ne compte que les réponses de son cercle. Droits des rôles : seul le rôle des mesures lit au-delà d'un cercle, et seulement des totaux (la vue de P-23, les dépôts de P-22 et P-22 a). *Travaux 5 et 8.*

**P-29. L'invitation ne montre les réponses d'entrée de Thomas qu'à une personne, une fois.** *D-006 ; `docs/onboarding.md`.*
Le jeton du lien est tiré au hasard, gardé seulement sous forme d'empreinte, placé après le « # » (P-08). Ouvrir le lien montre le premier texte, rien de Thomas. Le lien est lié à Marie à sa première réponse enregistrée (proposé) ; ensuite, ouvert ailleurs, il dit qu'il a déjà servi. Cas déjà relevé par le plan (partie 7) : Marie ouvre le lien dans le navigateur de sa messagerie, répond, puis rouvre le jeu dans Safari, et tomberait sur « déjà servi ». La parade se règle avec UX avant le travail 9. Il expire au bout de 7 jours (proposé, à confirmer par UX). Les réponses de Thomas n'arrivent qu'une à une, après la devinette de Marie sur chaque texte. Le consentement de Thomas à les envoyer est enregistré avec l'invitation (P-35).
*Test.* Des ouvertures sans la partie après le « # » (robots d'aperçu) ne reçoivent aucune donnée de Thomas et laissent le lien intact. La première réponse lie le lien ; un autre appareil est refusé ; après 7 jours, le lien est refusé. La réponse de Thomas sur un texte n'est jamais envoyée avant la devinette correspondante. Le cas de la messagerie suit la parade retenue avec UX. *Travail 9.*

### G. Les durées

**P-30. Un compte qui n'ouvre pas le jeu pendant 12 mois est effacé, après un e-mail 30 jours avant ; un compte devenu inaccessible l'est plus tôt.** *D-045, point 1 ; `docs/onboarding.md`, règle 5 du compte.*
Précisions proposées, qui ne changent pas la règle :
- « ouvrir le jeu », c'est afficher un écran du jeu à un joueur connecté. Recevoir le message de 18h ne compte pas ; un rafraîchissement en arrière-plan non plus ;
- 12 mois se comptent de date à date, à l'heure de Paris ; un compte ouvert pour la dernière fois le 29 février arrive à échéance le 28 février suivant ; l'effacement a lieu à la première passe qui suit l'échéance (P-31).

Précisions proposées qui touchent une décision (partie 7 ; soumises à l'avocat, partie 5) :
- si l'e-mail n'a pas pu partir (adresse refusée, relais d'Apple coupé), l'effacement a lieu quand même. D-045 dit « après un e-mail envoyé » ; sans cette précision, un compte dont l'adresse ne marche plus ne serait jamais effacé ;
- une ouverture remet le compteur à zéro ; si le joueur redevient inactif, cette nouvelle période donne un nouvel e-mail. D-045 et la règle 5 disent « une seule fois » : nous le lisons « une fois par période d'inactivité », comme Game design (`docs/etape-6/regles.md`), ce qui élargit l'exception à « aucune relance » (D-010, point 3 ; D-029). Game design la reprend (`regles.md`, règle 5), validée avec D-052 point 1 ; elle reste soumise à l'avocat.

**Le compte devenu inaccessible** (proposé ; `docs/onboarding.md`, règle 5 du compte, qui renvoie le délai à l'analyse d'impact) : un compte dont la seule voie de connexion, Apple ou Google, a été coupée de leur côté (le joueur a supprimé son compte chez eux, ou retiré l'accès à Elenchos), sans adresse e-mail qui marche. Apple et Google préviennent le serveur de ces événements (de mémoire, à vérifier au travail 9). Le compte est effacé 30 jours après (proposé), sauf reconnexion entre-temps.

Dans tous les cas, l'effacement se fait comme « Tout effacer » (P-38), sans aucun message au cercle (D-045).
*Test.* Horloge simulée, J étant le jour de l'échéance : à J − 31, rien ; à J − 30, un e-mail ; de J − 29 à J − 1, aucun second e-mail ; une ouverture à J − 20 remet tout à zéro, et une nouvelle période donne un nouvel e-mail ; sans ouverture, effacement à la première passe après l'échéance, aucun message au cercle, visage absent du Cercle ; une adresse refusée n'empêche pas l'effacement. Un compte en pause qui reçoit chaque soir le message de 18h (D-029) est quand même effacé. Cas du 29 février. Compte inaccessible : un faux avis d'Apple « accès retiré » ; le compte est là au 29e jour, effacé au 31e ; une reconnexion entre-temps annule. *Travaux 6 et 9.*

**P-31. Chaque durée de la carte des données est tenue, par un effacement quotidien.** *D-045, dernier alinéa ; durées proposées par Juridique (`docs/etape-5-choix.md`).*
Un programme d'effacement passe chaque jour pour les échéances : inactivité, compte inaccessible, durées de la carte. « Tout effacer », lui, agit tout de suite, à la demande (P-33). Le programme peut être relancé sans risque : une seconde passe ne change rien. Il ne tourne jamais entre 17 h 30 et 18 h 30 (proposé), pour ne pas charger le serveur à l'heure du rendez-vous.
*Test.* Pour chaque ligne de la carte (partie 4) : une donnée créée, puis l'horloge avancée jusqu'à la veille de son terme, la donnée est là ; au lendemain de son terme, elle n'y est plus ; une seconde passe ne change rien. *Travail 6.*

**P-32. Un effacement atteint aussi les sauvegardes.** *Plan, travail 3 (« l'effacement est réel ») ; `docs/plateforme.md`, annexe A.*
Un compte effacé disparaît des sauvegardes à la fin de leur rotation : 30 jours pour la copie chez Scaleway (proposé) ; chez Scalingo, plus petit plan, les sauvegardes programmées sont gardées 7 jours plus une par semaine pendant 4 semaines, soit une rotation d'environ quatre semaines (vérifié le 12 octobre 2026, avis de Juridique ; autres formules à confirmer). Après la **suppression de la base**, les sauvegardes programmées survivent jusqu'à quatre semaines, les sauvegardes manuelles un mois, et la copie continue de 7 jours part avec la base : pour effacer une base, il faut la supprimer, non la vider, et une sauvegarde manuelle de données réelles est à écarter ou à compter dans la rotation (proposé). Si une sauvegarde est restaurée, les effacements faits depuis sont rejoués : un journal des effacements garde pour cela les identifiants tirés au hasard des comptes effacés, sans adresse ni pseudo, jusqu'à la fin de la plus longue rotation, plus 5 jours (proposé).
*Test.* Sur une base inventée : sauvegarde, effacement d'un compte, restauration de la sauvegarde, rejeu du journal : le compte et son traceur ont disparu. Le journal est vidé après son terme (horloge simulée). *Travail 5.*

**P-33. L'effacement est tout de suite effectif dans la base.** *Plan, travail 3.*
« Tout effacer » est un effacement immédiat, fait à la demande, sans attendre la passe quotidienne ; seules les sauvegardes suivent le délai de P-32, et « Qui, durée, droits » le dit.
*Test.* Fait partie du test de P-38 : le traceur a disparu de la base dès la fin de la demande. *Travail 5.*

### H. Le consentement prouvé

**P-34. Aucune réponse n'est enregistrée sans un accord enregistré avant elle.** *Plan, travail 3 ; RGPD, art. 7.1 et 9.2.a ; `docs/onboarding.md`, étape 3.*
L'accord garde : la version de la carte, une empreinte de son texte exact, la date et l'heure, et la déclaration « 15 ans et plus ». C'est la base elle-même qui refuse une réponse sans accord. L'accord d'un invité qui n'a pas encore de compte suit l'invité : il passe à son compte à la création (proposé). Si la carte change de façon importante, une version marquée « nouvel accord » bloque la réponse suivante jusqu'au nouvel accord (proposé). Refuser n'enregistre rien.
*Test.* Écrire une réponse sans accord : refusé par la base. Changer la version marquée « nouvel accord » : la réponse suivante est refusée tant que l'accord n'est pas redonné. Un invité qui crée son compte : son accord y est rattaché, avec sa date d'origine. Traceur : après un refus de la carte, aucune ligne n'existe nulle part. *Travaux 5 et 9.*

**P-35. L'accord de Thomas à envoyer ses trois réponses est enregistré avec l'invitation.** *D-006 (« Thomas y consent explicitement en envoyant ») ; `docs/onboarding.md`.*
*Test.* Aucun lien d'invitation ne peut être créé sans la ligne d'accord correspondante (version de la phrase, date). *Travail 9.*

### I. L'effacement et les droits

**P-36. Chaque joueur peut voir et emporter ses données, gratuitement.** *D-042, point 3 (règle 1 de l'argent : « ses propres données : voir, emporter, effacer ») ; RGPD, art. 15 et 20.*
Un fichier lisible : son compte, ses réponses, ses devinettes, ses titres, son portrait, son accord, ses gestes encore gardés sous son identifiant. Jamais les réponses des autres.
*Test.* L'export du joueur A contient tous les traceurs de A et aucun traceur de B, même quand A et B sont dans le même cercle. *Travail 9.*

**P-37. Quitter un cercle retire ses réponses de ce cercle.** *Règle 4 ; D-045, point 2.*
Ses réponses n'apparaissent plus dans ce cercle ; ses titres passés y restent, sous « un ancien membre ». Il garde son compte, son portrait et ses autres cercles.
*Test.* Après le départ, plus aucune demande d'un membre de ce cercle ne renvoie un traceur du partant ; ses titres s'affichent sous « un ancien membre » ; son portrait est inchangé. *Travail 8.*

**P-38. « Tout effacer » efface tout et coupe le lien avec Apple ou Google.** *Plan, travail 3 ; D-045, point 2 ; `docs/onboarding.md`, règle 5 du compte ; RGPD, art. 17.*
Partent : le compte, l'adresse, le lien avec Apple ou Google (révoqué chez eux quand ils le permettent), les réponses, les devinettes, le portrait, la barre, les abonnements au message, les gestes gardés sous son identifiant, les sessions. Restent : ses titres passés, sous « un ancien membre », et les totaux déjà anonymes (P-23) ; et, si l'avocat l'admet, la preuve de son accord (partie 5, point 3) et l'identifiant tiré au hasard du journal des effacements (P-32 ; partie 5, point 4). Aucun message au cercle.
*Test.* Traceur : après l'effacement, recherche dans toute la base d'essai : seules restent les mentions « un ancien membre » et, selon l'avis de l'avocat, la preuve de l'accord et la ligne du journal des effacements, qui ne contiennent ni adresse, ni pseudo, ni réponse. Un faux Apple et un faux Google enregistrent la demande de révocation. Aucun message n'est mis en file pour le cercle. L'ancienne session est refusée. *Travaux 5 et 9.*

### J. Les mesures

**P-39. On mesure des gestes ; un chiffre qui dépend des avis n'est jamais donné texte par texte.** *`docs/produit.md`, section 8 ; D-041 ; règle de Juridique des essais.*
Un geste gardé ne porte ni position, ni raison, ni tension. La durée de l'écran de la raison n'est jamais gardée sous l'identifiant d'un joueur (P-40). Règle des essais, reprise telle quelle : un chiffre qui changerait si le joueur avait répondu autrement n'est jamais donné texte par texte (seule exception : la part de « aucune », D-027, P-23). Les mesures validées qui dépendent des réponses de tous, la justesse (mesure 5, lue contre le hasard de chaque manche) et la part des Mystère allant à un membre arrivé depuis moins de deux semaines (D-041), restent calculables : le rôle du jeu les calcule (P-22), et elles ne sortent qu'en totaux, sur des groupes au-dessus du seuil, jamais texte par texte ni par personne.
*Test.* Réponses inversées : la réserve des gestes est identique octet pour octet ; dans le rapport des mesures, seuls changent les totaux de justesse et de Mystère, qui n'ont aucune ligne par texte ni par personne. Le format d'un geste n'a aucun champ de position, de raison ni de tension (comparaison avec la carte). *Travail 12.*

**P-39 a. Les trois comptes de mi-bêta.** *D-052, point 2 ; `docs/etape-6/regles.md`, section 5 et section 10 (conditions de Juridique) ; conditions calquées sur D-027.*
- Comptés sur tous les joueurs à la fois, jamais par cercle ni par personne, jamais croisés avec une autre donnée ; seuls les comptes sont gardés ; lus pour le réglage seulement, par vous, et par les agents dans votre rapport (P-21) ; jamais publiés.
- **Seuil de 30 joueurs par groupe compté**, et non sur la bêta entière : par exemple, la part des joueurs qui ont un curseur net à 60 réponses ne s'affiche que si au moins 30 joueurs ont atteint 60 réponses.
- **Consentement dès le premier joueur de la bêta** : la carte de consentement ou « Qui, durée, droits » dit que les réponses servent aussi, en totaux, à « régler les seuils du jeu » (phrase proposée dans `docs/onboarding.md`, « Qui, durée, droits »). Sinon, tous les joueurs déjà inscrits devront redonner leur accord, par une version « nouvel accord » de la carte (P-34).
- **Accord séparé, ou réglage « Ne pas compter mes réponses »**, selon l'avis de l'avocat (partie 5, point 19).
- **Analyse d'impact** : leur durée de conservation et la liste de qui les lit, alignée sur P-21 (partie 6, point 15).

*Test.* Chaque table de compte n'a ni colonne de cercle ni colonne de personne ; un groupe de 29 joueurs ne donne rien, un groupe de 30 donne son compte ; aucune liste de joueurs n'est gardée derrière un compte ; le registre public n'en reçoit rien. Sans la version de la carte qui le dit, aucun compte n'est calculé. Si l'avocat retient le réglage, un joueur qui l'a coché n'entre dans aucun compte (on compare les comptes avec et sans lui). *Travail 12.*

**P-40. La durée de l'écran de la raison est comptée sur tous les joueurs, jamais par personne, par jour ni par texte.** *`docs/produit.md`, section 8 (condition de Juridique : jamais croisée avec la tension).*
Un jour, tous les joueurs répondent au même texte, qui touche une seule tension : une durée gardée par jour serait donc croisée avec la tension. Elle se range dans un histogramme par tranches de durée (par exemple de 0 à 2 secondes, de 2 à 5, et ainsi de suite), un par semaine, sans identifiant ni texte ; la durée médiane que demande `docs/produit.md` se lit sur cet histogramme.
*Test.* Le relevé n'a ni champ de joueur, ni de texte, ni de jour ; sur un cas construit, la médiane lue est la bonne ; réponses inversées : identique. *Travail 12.*

### K. La sécurité de base

**P-41. Connexion chiffrée, sessions sûres, code par e-mail protégé.** *RGPD, art. 32 ; durée du code proposée par Juridique.*
Le jeu ne répond qu'en connexion chiffrée. La session n'est lisible que par le jeu, et s'arrête à la déconnexion et à l'effacement. Le code à six chiffres vaut 15 minutes, une seule fois, avec 5 essais au plus ; le nombre de codes demandés pour une même adresse est limité. Un compte Google d'employeur ou de lycée est refusé, l'e-mail restant proposé (`docs/onboarding.md`, règle 4). Les bibliothèques du projet sont vérifiées contre les failles connues à chaque changement.
*Test.* En-têtes de sécurité vérifiés sur chaque page. Sixième essai d'un code : refusé ; code de 16 minutes : refusé ; code déjà servi : refusé. Faux jeton Google portant la marque d'un domaine d'organisation : refusé, avec la voie e-mail proposée. Vérification des failles connues dans la liste des bibliothèques. *Travaux 5 et 9.*

**P-42. Aucun écran d'administration ne montre une réponse, un pseudo ni une adresse ; ouvrir la base réelle laisse une trace.** *D-048 (en cas d'incident, c'est vous qui regardez) ; proposé.*
Vos écrans à vous : le stock de textes, les alertes, les totaux de P-21 et P-23. Pour un incident ou une restauration, vous ouvrez la base par un programme qui note d'abord la date, la durée et la raison donnée, dans la trace des ouvertures (partie 4).
*Test.* Chaque réponse des écrans d'administration est comparée à une liste fermée de champs : aucun champ de réponse, de pseudo ni d'adresse. Le programme d'ouverture écrit sa ligne avant d'ouvrir ; s'il ne peut pas l'écrire, il s'arrête. *Travaux 5 et 12.*

### L. Le premier code : le test du message de 18h

**P-43. Le test du message de 18h ne garde que ce qu'il teste.** *Plan, travail 4 ; D-005 ; précisé par D-054, point 1 (`docs/etape-6/test-18h.md`, partie 5). Lu avec D-057 : un seul iPhone, celui du porteur ; domaine elenchos.fr. Ce qui parle ci-dessous de cinq iPhone, de prêteurs, de leur note et du 20 novembre 2026 est périmé (D-057, point 4) ; le reste tient.*
La page nue du test, sur cinq iPhone (D-054, point 3), n'enregistre que les abonnements au message, l'étiquette de chaque téléphone (son numéro et la version de son système, jamais un nom) et les heures (envoi, réponse du service d'acheminement, réception notée par le serveur) ; aucune réponse, aucun pseudo, jamais l'heure à laquelle un prêteur ouvre l'icône. Un abonnement n'est accepté qu'avec un code d'essai, cinq au plus. Les téléphones prêtés n'y laissent aucune donnée de leurs propriétaires : jamais le compte d'un prêteur ; Apple seulement sur votre iPhone, ou avec un compte Apple de test. Une note d'une page, remise avant l'installation, leur dit ce qui est gardé et quand c'est effacé. La connexion Apple ou Google, essayée sur les mêmes téléphones (plan, travail 4), renvoie un identifiant et une adresse : l'identifiant n'est gardé que sous forme d'empreinte, le temps du test ; l'adresse est lue, notée « reçue », puis jetée. Le relevé du réseau de P-10 s'applique dès ce test. Tout est effacé le lendemain du troisième soir, et vérifié, hors la trace des connexions que Scalingo garde un an et que ni vous ni nous ne pouvons effacer (avis de Juridique, 12 octobre 2026 ; P-07) ; la base du test est supprimée, non seulement vidée, et aucune sauvegarde manuelle n'est faite (même avis ; P-32). Seule exception : un tableau d'heures par téléphone numéroté, sans adresse ni nom, gardé jusqu'au 20 novembre 2026 pour le bilan (hors de la base du test), puis effacé avec la liste « qui a quel téléphone », qui n'est écrite que chez vous.
*Test.* La base du test n'a que les champs prévus (comparaison avec sa carte) ; aucun champ d'adresse e-mail. Sans code d'essai, ou au sixième, l'abonnement est refusé. Le programme d'effacement de fin de test est joué, puis la base est vérifiée vide : ni abonnement, ni identifiant, ni adresse. Relevé du réseau sur la page du test. *Travail 4.*

### Ce qu'aucun test ne prouve

Dit franchement : les tests prouvent qu'aucun chemin technique n'existe dans le code. Ils ne prouvent pas ce qui dépend de personnes ou de contrats. Ces points relèvent d'un contrôle humain, noté au registre des prestataires ou dans la procédure d'incident :
- que les prestataires sont bien européens, avec leurs sous-traitants (P-12) : vérifié avant de signer, puis une fois par an (proposé), contrats relus par l'avocat (D-044) ;
- que vous ne lisez pas les réponses (note 1) : aucun écran ne les montre, et l'ouverture de la base laisse une trace ; mais vous détenez les clés, et une trace écrite par vos propres outils peut être contournée par vous ;
- que Scalingo ne lit pas ce qu'il garde (note 2) : c'est son contrat ;
- la double vérification des comptes à votre nom (P-16) ;
- les procédures : fuite de données à signaler à la CNIL sous 72 heures, et aux joueurs vu la sensibilité (RGPD, art. 33 et 34), demandes d'accès et d'effacement par e-mail. Elles se jouent une fois à blanc (plan, travail 11).

---

## 4. La carte des données : où, combien de temps

Première version, à compléter au travail 5 avec le modèle de données, puis à reprendre dans l'analyse d'impact. Usages (D-042) : 1 faire tourner le jeu ; 2 la part de « aucune » ; 3 les mesures sur les gestes ; 4 la sécurité ; 5 régler les seuils du jeu (D-052, point 2 ; P-22 a).

| Donnée | Usage | Où | Combien de temps | D'où vient la durée |
|---|---|---|---|---|
| Adresse e-mail, chiffrée | 1 | Scalingo ; copie chiffrée chez Scaleway ; envois par Scaleway | Tant que le compte existe | D-045 : effacé après 12 mois sans ouvrir le jeu |
| Lien avec Apple ou Google | 1 | Scalingo | Tant que le compte existe ; coupé à l'effacement | `docs/onboarding.md`, règle 5 |
| Pseudo, rond, nom du cercle | 1 | Scalingo | Tant que le compte, ou le cercle, existe | Proposé |
| Réponses, devinettes, points | 1 | Scalingo, réponses chiffrées | Tant que le compte existe ; au départ d'un cercle, elles quittent ce cercle | Juridique, proposé |
| Portrait, barre, tempéraments | 1 | Recalculés depuis les réponses | Comme les réponses | Juridique, proposé |
| Titres passés | 1 | Scalingo | Tant que le cercle existe, sous « un ancien membre » après un départ ; un cercle sans membre est effacé avec son histoire | D-045, point 2 ; cercle vide : proposé |
| Réponses d'un invité qui ne crée pas de compte | 1 | Scalingo | 7 jours au plus | Juridique, proposé |
| Lien d'invitation (empreinte) | 1 | Scalingo | Jusqu'à son usage, 7 jours au plus | Proposé, à confirmer par UX ; distinct des 7 jours de la ligne précédente |
| Code à six chiffres | 1 | Scalingo | 15 minutes | Juridique, proposé |
| Abonnement au message de 18h | 1 | Scalingo | Jusqu'au retrait, à l'effacement, ou au refus du service d'acheminement | Proposé |
| Preuve de l'accord | 1 | Scalingo | Tant que le compte existe ; après, question pour l'avocat | Juridique, proposé |
| Gestes, sous un identifiant sans nom (jamais la durée de l'écran de la raison) | 3 | Scalingo | 13 mois au plus, puis seulement en totaux | Juridique, proposé |
| Histogramme de la durée de l'écran de la raison, par semaine | 3 | Scalingo | Sans limite : anonyme | Proposé (P-40) |
| Compte devenu inaccessible | 1 | Scalingo | Effacé 30 jours après la coupure chez Apple ou Google | Proposé (P-30) ; délai à fixer dans l'analyse d'impact |
| Totaux des gestes | 3 | Scalingo | Sans limite : anonymes | Proposé |
| Comptes de la part de « aucune » | 2 | Scalingo | Sans limite : anonymes | Juridique, proposé |
| Trois comptes de mi-bêta (Pas de Côté par mois, tempéraments en cours, curseurs nets à 40, 60 et 80 réponses) | 5 | Scalingo | À fixer dans l'analyse d'impact | D-052, point 2 ; durée à fixer (P-22 a, P-39 a) |
| Texte : « retiré des portraits le … » | 1 | Scalingo | Tant que le texte est gardé | Proposé (règle 20 de `docs/etape-6/regles.md`, P-04 a) |
| Journaux de notre programme, sans donnée de joueur | 4 | Scalingo | 1 an chez Scalingo, qui garde tous les journaux un an ; aucune donnée de joueur (P-07) | Documentation de Scalingo, vérifiée le 12 octobre 2026 (obligation légale selon lui) ; remplace les 6 mois proposés (repère de la CNIL, de mémoire), que nous ne pouvons pas appliquer |
| Trace des connexions gardée par Scalingo (contenu non décrit : probablement adresse internet et heure) | 4 | Scalingo | 1 an ; ni vous ni les agents ne pouvez l'effacer | Documentation de Scalingo, vérifiée le 12 octobre 2026 ; contenu : hypothèse de Juridique, à confirmer par écrit (`docs/etape-6/test-18h-pas-a-pas.md`, 2.9) |
| Trace des ouvertures de la base réelle | 4 | Scalingo | 1 an | Proposé (repère de la CNIL : 6 mois à 1 an, de mémoire) |
| Sauvegardes de Scalingo | 4 | Scalingo | Plus petit plan : programmées 7 jours plus une par semaine pendant 4 semaines, et jusqu'à quatre semaines après la suppression de la base ; manuelles, un mois après la suppression ; copie continue de 7 jours, supprimée avec la base | Documentation de Scalingo, vérifiée le 12 octobre 2026 ; autres formules à confirmer (`docs/plateforme.md`, annexe A) |
| Copie chiffrée des sauvegardes | 4 | Scaleway | 30 jours | `docs/plateforme.md`, proposé |
| Journal des effacements, identifiants seuls | 4 | Scalingo | Plus longue rotation des sauvegardes, plus 5 jours | Proposé (P-32) |
| Version d'aperçu | — | Scalingo | Aucune donnée réelle ; remise à zéro chaque semaine | Proposé (P-19, P-20) |
| Test du message de 18h | 1 | Scalingo | Effacé le lendemain du troisième soir, et vérifié, hors la trace des connexions que Scalingo garde un an (ligne ci-dessus) ; seul le tableau d'heures par téléphone numéroté, sans adresse ni nom, est gardé jusqu'au 20 novembre 2026, puis effacé avec la liste « qui a quel téléphone », écrite chez vous seul ; ce tableau est gardé hors de la base (votre copie et la conversation de travail), jamais chez Scalingo | D-054, point 1 (P-43) ; lu avec D-057 : un seul iPhone, celui du porteur ; domaine elenchos.fr |

---

## 5. Pour l'avocat

À ajouter à sa première relecture, avant la bêta (liste de D-044). Ce sont des questions, pas des réponses.

1. **Les bases légales.** Accord explicite pour les opinions (art. 9.2.a, carte de consentement) ; exécution du contrat pour le compte ; quelle base pour les mesures sur les gestes ? Le simple fait de jouer à un jeu politique dit-il déjà quelque chose de sensible, que la carte doit couvrir ?
2. **Les totaux donnés aux agents** (D-052, point 3 ; aucun journal ne leur va). Des totaux au-dessus de seuils sont-ils des données anonymes, donc hors du RGPD, au sens de son considérant 26 et des critères du G29 (avis 05/2014) ? La Cour de justice de l'Union a jugé, de mémoire en septembre 2025 (affaire C-413/23 P), qu'une donnée pseudonymisée peut ne pas être personnelle pour un destinataire qui n'a aucun moyen raisonnable de retrouver la personne. Cela couvre-t-il un fournisseur d'IA américain ?
3. **La preuve de l'accord après l'effacement** : la garder, sous quelle forme, combien de temps (art. 7.1 contre art. 17) ?
4. **Le journal des effacements** (P-32) : garder les identifiants de comptes effacés pendant la plus longue rotation des sauvegardes, plus 5 jours, pour que l'effacement survive à une restauration, est-ce admis ?
5. **Les durées proposées** de la partie 4, toutes, et la durée des réponses tant que le compte existe.
6. **Les contrats** avec Scalingo et Scaleway (art. 28), leurs sous-traitants, et la lecture « siège et contrôle » de D-043 appliquée aux sous-traitants (`docs/plateforme.md`, limite 1).
7. **L'annonce d'arrivée** qui cite un pseudo : admise telle quelle sur le web, puisque chiffrée jusqu'au téléphone ? Que faire dans l'application de l'App Store, seule boutique depuis D-054 (P-06) ?
8. **Le relais d'Apple** pour l'e-mail d'avant effacement, et Apple et Google comme responsables distincts pour leur service de connexion : ce que « Qui, durée, droits » doit en dire.
9. **Le statut d'hébergeur** (pseudos et noms de cercle) : une obligation de garder des données d'identification, de mémoire issue d'un décret d'octobre 2021, limiterait-elle « Tout effacer » ? (Déjà noté au plan, partie 7.)
10. **L'export** (P-36) : ce qu'il doit contenir (art. 15 et 20), et si les devinettes que d'autres ont faites sur Marie sont aussi ses données.
11. **Le registre des traitements** (art. 30) : obligatoire ici malgré la petite taille, puisque des données sensibles sont traitées (de mémoire). La carte des données en est la base.
12. **Les mineurs de 15 à 17 ans** : la déclaration suffit-elle encore, la loi étant en cours de réécriture (plan, partie 7) ?
13. **Les députés** sont aussi des personnes concernées : leurs noms et leurs arguments, rendus publics par eux (art. 9.2.e), sont révélés à 18h et gardés au registre public. Quelles obligations envers eux (information, rectification d'une citation mal rendue) ?
14. **L'e-mail d'avant effacement** (P-30) : effacer un compte inactif même si l'e-mail n'a pas pu partir, alors que D-045 dit « après un e-mail envoyé » ; envoyer un nouvel e-mail à chaque nouvelle période d'inactivité, alors que D-045 dit « une seule fois ».
15. **Le compte devenu inaccessible** (P-30) : sa définition et le délai de 30 jours proposé (`docs/onboarding.md`, règle 5 du compte).
16. **La durée de l'écran de la raison** : la mesure, comptée par semaine en histogramme, sans joueur ni texte (P-40), est à valider avec l'analyse d'impact, comme le demande `docs/produit.md` (section 8 ; D-044, point 4).
17. **Le seuil de l'avis du cercle** (D-025) : 3 réponses, proposé (règle 10 de `docs/etape-6/regles.md`) ; en dessous, ni ligne, ni graphique. D-025 demande que ce seuil passe par l'avocat avant la bêta.
18. **Le Pas de Côté** (règle 14 de `docs/etape-6/regles.md`) : annoncé à tout le cercle, il lui apprend le côté d'une réponse du jour, contraire au penchant net du joueur. Il est à examiner au même rang que la répartition de l'avis du cercle (D-025), et à dire dans « Qui, durée, droits ».
19. **Les trois comptes de mi-bêta**, décidés (D-052, point 2 ; P-22 a, P-39 a) : leur calcul lit des opinions (art. 9) et n'en garde que des totaux. La phrase « régler les seuils du jeu » dans la carte de consentement ou « Qui, durée, droits » suffit-elle, ou faut-il un accord séparé, ou un réglage « Ne pas compter mes réponses » ?
20. **Les journaux de Scalingo** (P-07 ; avis de Juridique, 12 octobre 2026) : Scalingo est-il responsable de ces journaux (trace des connexions, journaux de la base) pour son propre compte, et non notre sous-traitant ?
21. **Les mêmes journaux, dans « Qui, durée, droits »** : comment dire à un joueur qu'une trace des connexions reste un an chez l'hébergeur, hors d'atteinte de « Tout effacer » ?
22. **Le fondement d'un an** pour tous les journaux de Scalingo : est-il solide ? Le CPCE (art. R10-13) vise les opérateurs, la LCEN les données d'identification ; ce n'est pas notre combat, mais c'est à dire juste.

---

## 6. Pour l'analyse d'impact

Les risques à y décrire, avec la parade déjà prévue. L'analyse est obligatoire ici (données sensibles, profilage, joueurs de 15 à 17 ans ; plan, travail 11).

1. **Le portrait vu par le cercle** (règle 19) : des curseurs sur huit tensions sont un profil politique, montré à des personnes qui connaissent le joueur. Parade : seulement le cercle, aucun chiffre d'accord, la barre pour soi seul (D-026).
2. **La répartition de l'avis du cercle** (D-025) : dans un petit cercle, elle se lit nom par nom. Parade : un seuil minimal, proposé à 3 réponses (règle 10 de `docs/etape-6/regles.md`), à valider par l'avocat (partie 5, point 17) ; justification de la minimisation (art. 5.1.c et 25), déjà demandée par D-025.
3. **La révélation entre proches** : un avis découvert à 18h peut froisser une famille. Parade : aucune mise en scène du désaccord, sauf D-025 ; question du questionnaire de bêta (« une révélation t'a-t-elle mis mal à l'aise ? »).
4. **Un adolescent dans un cercle familial** : pression pour répondre comme ses parents, ou peur d'être deviné. Parade : à concevoir ; c'est une question éthique autant que juridique (D-025 le demande déjà).
5. **Les captures d'écran** font sortir des réponses du cercle. Aucune parade technique : la politique de confidentialité le dit.
6. **Le téléphone partagé ou prêté, l'adresse e-mail partagée** en famille : un proche peut ouvrir le jeu d'un autre, ou recevoir son code. Parade partielle : P-11 ; le reste est à observer en bêta.
7. **L'hébergeur garde la clé** (note 2) : le chiffrement protège les copies, pas contre Scalingo. Parade : contrat, prestataire français.
8. **Vous, seul administrateur, en nom propre** : vous pouvez tout lire, et la perte de la clé perdrait les données. Parade : aucun écran ne montre une réponse ; trace des ouvertures ; copie de la clé hors ligne (P-02).
9. **Le fournisseur d'IA** voit le code, et les totaux du rapport que vous donnez aux agents (D-052, point 3 ; P-21) ; le code qui garde des opinions n'est relu que par des modèles (D-043). Parade : P-14 à P-21 ; audit de sécurité avant l'ouverture (plan, partie 5). Mais la bêta gardera de vraies opinions avant cet audit, qui n'est exigé qu'avant l'ouverture.
10. **Retrouver quelqu'un par les totaux** : par différence entre deux comptes, ou dans un petit groupe de la bêta (40 à 80 joueurs). Parade : seuils, compte figé (P-23), gestes sans avis (P-39, P-40).
11. **La durée des réponses** : tant que le compte existe, sans limite pour un joueur actif. Est-ce nécessaire au portrait, ou faut-il une limite ?
12. **La période électorale** : une fuite pendant une campagne aurait un poids particulier. Parade : P-02, P-13, procédure de fuite (art. 33 et 34).
13. **Le changement de structure** (D-042, D-043) : un nouveau responsable des données, et probablement un nouvel accord à demander à chaque joueur.
14. **Les erreurs de texte** qui visent un député nommé à 18h (D-044). Parade : procédure de correction, erratum daté ; retrait des portraits si l'erreur porte sur ce à quoi on a répondu (P-04 a).
15. **Les trois comptes de mi-bêta** (D-052, point 2) : un nouvel usage des opinions, en totaux. À y fixer : leur durée de conservation et la liste de qui les lit, alignée sur P-21 (P-39 a).
16. **Les journaux de l'hébergeur** (avis de Juridique, 12 octobre 2026) : tout ce qui entre dans un journal chez Scalingo y reste un an, hors d'atteinte de l'effacement. Parade : P-07 (journaux sans donnée de joueur, bases comprises). Citer aussi l'incident de sécurité de Scalingo du 12 août 2026 (partie 8) et suivre ses bulletins (proposé : une fois par mois, par l'équipe).

---

## 7. Décisions antérieures touchées

Ce document applique D-006, D-010, D-024 à D-027, D-035, D-041 à D-045, D-048 et D-052. Il ne modifie aucune décision de lui-même. Voici ce qu'il touche ou précise.

**Touchées par vos réponses (D-052) :**
- **D-027** (« lue par le porteur et Contenu seulement ») : élargie par D-052, point 3 ; d'autres agents que Contenu lisent, et d'autres chiffres que la part de « aucune » : les totaux des mesures de la bêta, dans un rapport que vous leur donnez (P-21).
- **D-048** (« en cas d'incident sur la version en ligne, c'est le porteur qui regarde ») : intacte ; aucun journal ne va aux agents.
- **D-043, point 3, et D-048** : la réponse repose sur une lecture de Juridique, à confirmer par l'avocat (partie 5, point 2) : un total au-dessus d'un seuil n'est pas une « donnée de joueur ».
- **D-042, point 2, et D-027** (D-052, point 2 ; P-22 a, P-39 a) : les trois comptes deviennent une seconde exception à la liste fermée des usages (usage 5, « régler les seuils du jeu ») et à « seul usage interne des opinions » (D-027) ; la carte de consentement ou « Qui, durée, droits » doit le dire dès le premier joueur de la bêta.

**Touchées par l'avis de Juridique du 12 octobre 2026 (Scalingo) :**
- **D-045 et P-07** : pour la bêta, les journaux de Scalingo durent un an et ne s'effacent pas ; P-07 porte la promesse d'effacement (à surveiller, pas de décision changée). Questions 20 à 22 de la partie 5.
- **P-32 et la carte des données** : les durées de Scalingo sont connues pour le plus petit plan (vérifié) ; la proposition « les copies de secours partent en un mois environ » tient à peu près (quatre semaines).
- **D-048** : intact ; un fait est corrigé dans `docs/plateforme.md` (l'essai demande une carte), et le bulletin de sécurité n'en change pas le choix.

**Touchées par vos réponses du 12 octobre 2026 (D-054) :**
- **D-005, modifié par D-054, point 3** (l'iPhone seulement, l'App Store seul) : le message de 18h ne passe plus que par Apple (P-06, P-12, partie 1) ; Google ne sort d'Europe que pour la connexion (D-035). D-043 tient : ses deux exceptions restent, l'une plus étroite.
- **P-43 et la carte des données, précisés par D-054, point 1** : comptes de test seulement, codes d'essai, champs fixés, adresse e-mail jetée, effacement le lendemain du troisième soir et vérifié, tableau sans nom gardé jusqu'au 20 novembre 2026 (lu avec D-057 : un seul iPhone, celui du porteur ; domaine elenchos.fr).
- **P-21, précisé par D-054, point 1** : le message d'erreur de la fabrication chez Scalingo, sans donnée, peut être copié aux agents ; D-048 et D-052 (point 3) tiennent.

**Proposées, et qui touchent une décision :**
- **D-045, point 1, D-010 (point 3) et D-029** (P-30) : l'effacement d'un compte inactif a lieu même si l'e-mail n'a pas pu partir, alors que D-045 dit « après un e-mail envoyé » ; un nouvel e-mail part à chaque nouvelle période d'inactivité, alors que D-045 et la règle 5 disent « une seule fois », ce qui élargit l'exception à « aucune relance ». Soumis à l'avocat (partie 5, point 14).
- **`docs/onboarding.md`, règle 5 du compte** (P-30) : le compte devenu inaccessible est défini, avec un délai proposé de 30 jours, à fixer dans l'analyse d'impact.

**Précisions, qui ne changent rien :**
- **D-043, point 3** (P-12) : l'exception pour l'acheminement des messages est reprise mot pour mot, pour le service propre au téléphone ; depuis D-054 (l'iPhone seulement), c'est celui d'Apple, à confirmer au travail 4.
- **`docs/produit.md`, section 8, et D-041** : toutes les mesures validées restent calculables. La justesse et la part des Mystère sont calculées par le rôle du jeu et ne sortent qu'en totaux (P-22, P-39). La durée médiane de l'écran de la raison se lit sur un histogramme par semaine, jamais par jour ni par texte (P-40) : c'est l'application de la condition de Juridique (« jamais croisée avec la tension »), puisqu'un jour n'a qu'un texte et qu'un texte n'a qu'une tension (règles 6 et 16).
- **D-043, point 3, et la version d'aperçu** (P-20) : l'aperçu ne contient que des données inventées ou d'essai ; ce ne sont pas des données de joueur, et la garantie donnée aux joueurs n'est pas touchée, à condition que vous n'y mettiez pas vos vraies opinions.
- **D-006 et `docs/onboarding.md`** (P-29) : le lien « expire » ; 7 jours proposés ; le lien est rattaché à l'invitée à sa première réponse ; à confirmer par UX.
- **D-011 et D-014, l'annonce d'arrivée** (P-06) : le texte validé peut rester dans la notification sur le web, son contenu y étant chiffré jusqu'au téléphone (proposé ; de mémoire, à vérifier au travail 4). C'est la revue que demandait le plan (travail 3). Elle cite le pseudo de qui arrive, que le plan et `docs/produit.md` appellent « prénom » (E7). La question revient au passage à l'App Store (travail 14 ; D-054).
- **D-045, point 1** (P-30) : « ouvrir le jeu » et « 12 mois » sont précisés.
- **D-044, point 1, règle 20 de `docs/etape-6/regles.md`** (P-04 a) : un texte corrigé après coup sort des portraits, par un recalcul relançable, hors de 15h–19h et jamais le dimanche ; l'avis passe de la chaîne au jeu, jamais l'inverse : D-043 tient.
- **D-010, règle 19 (lecture A) et règle 15 (un seul pseudo)** de `docs/etape-6/regles.md` (P-27 a, P-03 a) : propositions de Game design, reprises ici avec leur test.
- **`docs/plateforme.md`, annexe F** (P-17) : en réponse à la question de cette annexe, le code de la version en ligne peut rester public (proposé).

---

## 8. Limites et doutes

- **Juridique n'est pas avocat.** Les points de droit sont à confirmer (partie 5). Plusieurs faits sont de mémoire : le chiffrement de la forme récente des notifications d'Apple, l'arrêt de la Cour de justice cité, le décret sur les données d'identification, les repères de la CNIL.
- **À vérifier avant de signer** : si Scalingo garde une trace des ouvertures de la base réelle (sinon, cette trace est la nôtre, contournable par vous) ; le contenu exact de la trace des connexions qu'il garde un an (partie 4) ; les durées de ses sauvegardes pour les formules de la bêta. Les durées de ses journaux (un an) et de ses sauvegardes du plus petit plan sont vérifiées depuis le 12 octobre 2026 (documentation de Scalingo, avis de Juridique).
- **Incident de sécurité chez Scalingo, 12 août 2026** (bulletin SSB-2026-004). *Vérifié* (lu le 12 octobre dans le dépôt de la documentation de Scalingo) : une faille de son outil d'analyse interne a exposé des données de sa relation client, environ 90 000 personnes, CNIL avertie le 11 août ; *rapporté, non vérifié* : « aucune trace d'accès aux applications ni aux bases des clients » est la seule parole de Scalingo. Le choix de Scalingo tient (avis de Juridique) ; l'incident est à citer dans l'analyse d'impact (partie 6, point 16).
- **Les tests prouvent l'absence de chemins dans le code, pas l'honnêteté des personnes** : ni la vôtre, ni celle des prestataires. C'est la limite de toute protection des données ; elle se compense par les contrats, la trace des accès et l'audit de sécurité avant l'ouverture.
- **Les seuils (30, 10) sont des conventions**, pas des garanties mathématiques. Dans une bêta de 40 à 80 joueurs, certains groupes seront petits : des chiffres seront remplacés par « — ».
- **Le chiffrement des réponses** (P-02) rend la base plus sûre, mais un peu plus lente à interroger et plus délicate à réparer. À notre taille, l'écart est négligeable (estimation).
- **Ce document décrit les tests ; il ne les écrit pas.** Le « fini quand » du plan (« chaque exigence a son test automatique ») sera atteint quand chacun de ces tests existera dans le code, aux travaux indiqués. Les 43 exigences et leurs sept sous-points ont un test automatique décrit ; celui de P-24 (l'argent) ne sera construit qu'avant l'ouverture ; P-12 et P-16 ont en plus une part humaine, listée en fin de partie 3.

**À tester avec de vraies personnes, en bêta :**
- la version pour les joueurs de « qui voit quoi » (dans « Qui, durée, droits ») : est-elle lue, comprise, rassurante ou inquiétante ?
- les familles : téléphones prêtés, adresses partagées, captures d'écran ;
- les aperçus de notification sur l'écran verrouillé, chez Thomas ;
- les adolescents dans un cercle familial ;
- les demandes d'effacement et d'export, traitées de bout en bout au moins une fois (plan, partie 5).

---

## La question

*Répondue par le porteur le 11 octobre 2026 (D-052, point 3) : **« Aussi les totaux des mesures »**. La question est gardée telle qu'elle a été posée.*

**Agents**
Que peuvent lire les agents, donc le fournisseur d'IA chez qui ils travaillent, parmi des chiffres et des journaux de la version en ligne que nous jugeons ne contenir aucune donnée de joueur (à confirmer par l'avocat) ? Deux décisions sont en jeu : D-027 (la part de « aucune » est lue par vous et par Contenu, rien d'autre) et D-048 (en cas d'incident sur la version en ligne, c'est vous qui regardez). Dans tous les cas : un rapport que vous leur donnez, jamais un accès ; des totaux au-dessus des seuils ; la règle écrite dans « Qui, durée, droits » (P-21). Chaque option comprend la précédente, sauf la dernière.
- **Seulement la part de « aucune » (Recommandé)** : D-027 tel qu'il est décidé, seul usage décidé qui demande qu'un agent lise un chiffre ; ni D-027 ni D-048 ne changent. Coût : vous lisez seul les mesures de la bêta et les journaux ; un défaut visible seulement avec de vraies données sera plus long à comprendre.
- **Aussi les totaux des mesures** (retenue, D-052, point 3) : l'équipe lit avec vous le bilan de la bêta (gestes, justesse, Mystère, par groupes de 10 au moins (chiffre de l'option, que D-052 ne reprend pas : « au-dessus des seuils » ; proposé) ; avec D-052, point 2, aussi les trois comptes de mi-bêta, par groupes de 30 au moins). Élargit D-027 (d'autres agents que Contenu, d'autres chiffres) ; D-048 intact.
- **Aussi des extraits de journaux** : en plus, en cas d'incident, des extraits de nos journaux, jamais ceux de Scalingo ; un incident se comprend plus vite. Élargit D-027 et touche D-048 : vous regardez toujours, mais les agents reçoivent une partie de ce que vous regardez.
- **Vous seul** : rien de la version en ligne ne va aux agents. Restreint D-027 : Contenu ne lit plus la part de « aucune », vous repérez seul les textes mal écrits ; D-048 intact.
