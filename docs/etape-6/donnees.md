# Protection des données : les exigences avant le code

*Étape 6, travail 3 de `docs/plan-construction.md` (partie 4). Back-end, avec le regard de Juridique, 11 octobre 2026. Juridique n'est pas avocat : les points de droit sont à confirmer par l'avocat (D-044). Aucune donnée réelle de joueur n'existe ni n'a servi (D-048) : les exemples sont inventés. Ce document ne décide rien de lui-même : ce qui n'est écrit dans aucune décision est marqué « (proposé) ».*

**Comment lire les faits.** « De mémoire » : ce que savent les agents, à vérifier. « À vérifier » : un fait à établir avant de s'en servir. Le reste découle de vos décisions ou de documents déjà validés, cités à chaque fois.

---

## En bref

**Ce qui a été fait.** Chaque exigence du plan (travail 3), celles de vos décisions D-042, D-043, D-045 et D-048, et les quatre règles de la limite 3 de `docs/plateforme.md` sont écrites ici comme des règles vérifiables : **43 exigences** (partie 3). Pour chacune, le test automatique qui la prouvera dans le code est décrit, avec le travail où il sera construit. Quatre outils de test servent partout (partie 2). Ce qu'aucun programme ne peut prouver, par exemple qu'un prestataire est vraiment européen, est dit franchement et confié à un contrôle humain (partie 3, fin).

**Ce que vous regardez : « qui voit quoi » (partie 1).** Un tableau : pour chaque donnée d'un joueur, qui la voit. Trois choses à retenir :
- **les réponses ne sont vues que du cercle**, selon les règles du jeu. Personne de l'équipe ne les lit : ni vous, ni les agents ;
- **vous détenez les clés de la version en ligne** : techniquement, vous pourriez tout lire. L'engagement est de ne pas le faire, et aucun écran ne vous montre une réponse. Scalingo, comme tout hébergeur, garde tout, sans s'en servir ;
- **sur la version d'aperçu, où vous validez en jouant, l'équipe voit ce que vous saisissez.** Vos vraies opinions n'ont rien à y faire : une bande le rappellera sur chaque écran, et une connexion d'essai vous évitera d'y mettre votre compte Apple (proposé, P-20).

**Ce qui vous revient : une question, à la fin.** Les agents peuvent-ils lire des totaux et des journaux techniques qui ne contiennent aucune donnée de joueur ? D-027 nommait Contenu parmi les lecteurs de la part de « aucune » ; `docs/plateforme.md` (limite 3) vous en a fait le seul lecteur en attendant l'avis de Juridique. Cet avis est : oui, sous conditions. Mais la réponse fixe la frontière d'une garantie que vous donnez aux joueurs (« aucune donnée de joueur vers un fournisseur d'IA », D-043) : elle vous revient.

**À part** : les points pour l'avocat (partie 5) et ceux de l'analyse d'impact (partie 6). Aucune décision n'est modifiée ; les précisions sont listées en partie 7.

---

## 1. Qui voit quoi

L'exemple suit Marie, membre d'un cercle avec Thomas, Paul et Hugo.

**Comment lire les cases.** « oui » : voit la donnée elle-même. « non » : ne la voit jamais. « total » : seulement noyée dans un chiffre d'ensemble, jamais à son nom. « Q » : selon votre réponse à la question de la fin. Les numéros renvoient aux notes sous le tableau.

| Donnée de Marie | Marie | Son cercle | Vous | Les agents | Scalingo | Apple et Google | Le fournisseur d'IA |
|---|---|---|---|---|---|---|---|
| Son adresse e-mail | oui | non | non (1) | non | oui (2) | s'ils sont sa voie de compte (3) | non |
| Son pseudo et son rond | oui | oui | non (1) | non | oui (2) | non (4) | non |
| Sa voie de compte (Apple, Google ou e-mail) | oui | non | total | total, Q | oui (2) | la leur | total, Q |
| Sa réponse du jour : position et raison | oui | le lendemain sans son nom, à 18h en partie avec (5) | non (1) | non | oui (2) | non | non |
| Ses devinettes et ses points | oui | ses titres seulement (6) | total | total, Q | oui (2) | non | total, Q |
| Son portrait : curseurs et tempéraments | oui | oui | non (1) | non | oui (2) | non | non |
| Sa barre « Ton portrait se dessine » | oui | non | non | non | oui (2) | non | non |
| Si elle a joué aujourd'hui | oui | oui (7) | total | total, Q | oui (2) | non | total, Q |
| Son accord (la carte de consentement) | oui | non | sur demande d'une autorité (8) | non | oui (2) | non | non |
| Ses gestes : ouvertures, durées, écrans ouverts | sur demande (9) | non | total | total, Q | oui (2) | non | total, Q |
| Si sa raison était « aucune » | oui | comme sa réponse | total par texte (10) | Contenu, total, Q | oui (2) | non | total, Q |
| Son adresse internet, le modèle de son téléphone | non | non | non | non | oui (11) | à la connexion par eux, et pour le message de 18h | non |
| Les journaux de notre programme (rien d'elle dedans, P-07) | non | non | oui | en cas d'incident, Q | oui | non | Q |

**Les agents et le fournisseur d'IA vont ensemble.** Les agents travaillent chez un fournisseur américain d'IA : tout ce qu'ils voient, il le voit. La chaîne qui écrit les textes tourne chez le même fournisseur, mais ne lit que les données publiques de l'Assemblée (D-043, D-044).

**Les notes.**
1. Vous détenez les clés de la version en ligne : techniquement, vous pourriez tout lire. L'engagement : aucun écran d'administration ne montre une réponse, un pseudo ni une adresse (P-42) ; vous n'ouvrez la base que pour une restauration ou un incident (D-048), et chaque ouverture laisse une trace. Comme joueur, vous voyez vos propres cercles, comme tout membre.
2. Scalingo garde tout, comme tout hébergeur, et ne s'en sert pas : un contrat le lui interdit (RGPD, art. 28), et c'est une société française (D-043, D-048). Le chiffrement de l'adresse et des réponses (P-02) protège les copies, par exemple une sauvegarde volée ; il ne protège pas contre l'hébergeur lui-même, qui garde aussi la clé.
3. Si Marie se connecte par Apple ou Google, ils connaissent déjà son adresse. Ils apprennent qu'elle a un compte Elenchos et quand elle s'y connecte, jamais ses réponses ni son cercle (`docs/onboarding.md`). Si elle masque son adresse chez Apple, nos e-mails passent par un relais d'Apple (`docs/plateforme.md`, limite 5).
4. L'annonce d'arrivée faite à Thomas cite le pseudo de Marie (« Marie a trouvé 2 de tes 3 réponses. … »). Sur le web, le contenu d'une notification est chiffré jusqu'au téléphone : Apple et Google l'acheminent sans pouvoir le lire (de mémoire, norme du web ; à vérifier au travail 4). Dans les applications des boutiques, ce n'est plus vrai : à revoir au travail 14 (P-06).
5. Le lendemain, pendant Deviner, ses proches voient sa réponse sur une carte, sans son nom. À 18h, un proche apprend qu'elle était de Marie si la carte lui était servie, ou s'il l'a désignée comme jumelle (D-024) ; l'avis du cercle compte sa position dans la répartition (D-025). Ses autres réponses, le cercle ne les voit jamais (maquette 2.7c), sauf ce que la répartition laisse déduire dans un petit cercle (D-025).
6. Le cercle voit ses titres. Thomas, qui l'a invitée, voit son score d'entrée (« 2 de tes 3 réponses »). Personne ne voit ses devinettes une à une.
7. « Hugo et Inès ont déjà joué » (écran 2.5). Personne ne voit qu'elle est en pause (D-010, D-011), mais le total de l'avis du cercle peut laisser voir qu'un membre n'a pas répondu (D-025).
8. La preuve de son accord sert seulement à montrer, si la CNIL ou un juge le demande, qu'elle l'a donné. Elle figure dans son export (P-36).
9. Ses gestes servent aux mesures de `docs/produit.md` (section 8). Ils sont gardés sous un identifiant sans nom, 13 mois au plus, puis seulement en totaux (proposé par Juridique, D-045, dernier alinéa). Marie peut les obtenir (droit d'accès).
10. La part de « aucune » de chaque texte, sur tous les joueurs à la fois, au-dessus de 30 réponses, jamais par cercle ni par personne, jamais publiée (D-027).
11. Les journaux de Scalingo notent l'adresse internet de chaque visite, comme ceux de tout hébergeur. Les nôtres ne la notent pas (P-07).

**Les autres, en une ligne chacun.**
- **Scaleway** (groupe français) envoie nos e-mails : il voit l'adresse et le contenu (le code, l'e-mail d'avant effacement), jamais une réponse. Il garde aussi une copie de nos sauvegardes, chiffrée par nous : il ne peut pas la lire (P-13).
- **La sonde de 18h02** voit seulement si le site répond et si les messages sont partis.
- **GitHub** garde le code, sans aucune donnée de joueur ni mot de passe (P-17).
- **La messagerie** par laquelle Thomas invite Marie (WhatsApp, iMessage…) voit le texte de l'invitation et le lien, jamais une réponse ; l'aperçu du lien ne montre rien (P-29).
- **Le fournisseur de la boîte mail** de Marie (Gmail, Orange…) voit qu'un e-mail d'Elenchos est arrivé, et le code qu'il contient.
- **Marie, avant d'entrer dans le cercle**, voit les trois réponses d'entrée de Thomas, par son lien personnel : c'est la seule exception à « rien ne sort du cercle » (D-006).

### Une réponse, du mardi au jeudi

Mardi, Marie répond « Défavorable · Ça coûte trop cher ».
- **Mardi.** Son téléphone l'envoie ; le serveur, chez Scalingo, la garde chiffrée. Personne d'autre ne la voit. Sa phrase du jour s'affiche pour elle seule.
- **De mardi 18h à mercredi 18h**, pendant Deviner, Paul voit une carte « Défavorable · Ça coûte trop cher », sans nom. Son téléphone ne reçoit rien qui dise qu'elle est de Marie, pas même un code caché qu'un curieux pourrait lire (P-26).
- **Mercredi, 18h.** Paul apprend que c'était Marie. Le graphique de l'avis du cercle compte un « défavorable ». Apple et Google acheminent le message de 18h, chiffré, qui ne dit rien de Marie.
- **Jeudi.** La réponse entre dans un seul total qui sorte du cercle : la part de « aucune » du texte, sur tous les joueurs. Comme sa raison n'est pas « aucune », elle n'y compte que dans le nombre de réponses. Vous lisez ce total (et Contenu, si vous répondez oui à la question).
- **Si Marie efface tout.** Sa réponse disparaît tout de suite de la base, et des sauvegardes à la fin de leur rotation, 30 jours pour la copie chez Scaleway (proposé, P-32). Ses titres restent dans l'histoire du cercle, sous « un ancien membre » (D-045).

### Ce que l'équipe voit de vous

- **Dans la version en ligne**, vous êtes un joueur comme un autre : les agents ne voient ni vos réponses, ni votre adresse, ni votre cercle (D-048, limite 3).
- **Dans la version d'aperçu**, les agents voient tout ce que vous saisissez, puisqu'ils y cherchent les défauts. Proposé (P-20) : une bande sur chaque écran, « Version d'aperçu : l'équipe voit ce que tu saisis ici. » ; une connexion d'essai, pour ne pas y mettre votre compte Apple ; une remise à zéro chaque semaine. Répondez-y comme vous voulez, sans y mettre vos opinions.
- **Au test du message de 18h** (travail 4), les téléphones prêtés ne laissent que leur abonnement au message, effacé à la fin (P-43).

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

**P-01. L'adresse e-mail est rangée à part des réponses.** *Plan, travail 3.*
L'adresse vit dans une table à part ; les réponses ne connaissent qu'un identifiant tiré au hasard. Le jeu se connecte sous un rôle qui ne peut pas lire cette table ; seul le module des comptes le peut (connexion, e-mail d'avant effacement). À la connexion, on retrouve le compte par une empreinte de l'adresse, jamais par l'adresse en clair.
Exemple : une extraction de la table des réponses montre « joueur 8f3c… : défavorable », et rien qui mène à l'adresse de Marie.
*Test.* Sous le rôle du jeu, toute lecture de la table des adresses est refusée par la base. Traceur : dans une copie complète de la base d'essai, l'adresse du traceur n'apparaît pas en clair. Le code du jeu n'appelle le module des comptes que pour obtenir un identifiant (vérification automatique des dépendances entre modules). *Travail 5.*

**P-02. Les adresses et les réponses sont chiffrées dans la base, avec une clé gardée hors de la base.** *Proposé (Back-end) ; RGPD, art. 32.*
La position et la raison de chaque réponse, et l'adresse e-mail, sont chiffrées par notre programme avant d'entrer dans la base. La clé est un réglage de Scalingo, jamais dans la base, les sauvegardes ou le dépôt ; vous en gardez une copie hors ligne. Une sauvegarde ou une extraction volée ne dit donc rien de ce que pensent les joueurs.
*Test.* Dans une copie de la base d'essai, aucune position ni raison n'est lisible ; deux réponses identiques donnent deux suites chiffrées différentes ; sans clé, le serveur refuse de démarrer, au lieu de tourner à moitié. *Travail 5.*

**P-03. Le jeu ne demande que ce qui sert.** *D-035, D-006, `docs/onboarding.md` (règle 2 du compte).*
À Apple ou Google, le jeu ne demande qu'un identifiant et l'adresse e-mail : jamais le nom, ni la photo. Aucune date de naissance : « 15 ans et plus » est une déclaration sur la carte de consentement. Le pseudo n'est jamais prérempli avec le nom donné par Apple ou Google.
*Test.* La demande envoyée à Apple et à Google ne contient que les autorisations « identifiant » et « e-mail » (lecture de la demande produite). La base n'a aucun champ nom, photo ni date de naissance (comparaison avec la carte des données). Après un retour simulé d'Apple qui fournit un nom, le champ pseudo est vide. *Travail 9.*

**P-04. Chaque donnée gardée figure sur la carte des données, avec un usage de la liste fermée.** *D-042, point 2 ; plan, travail 11 (carte des données).*
Les usages permis sont quatre : faire tourner le jeu ; compter la part de « aucune » (D-027) ; les mesures sur les gestes ; la sécurité. Un champ sans ligne sur la carte n'a pas le droit d'exister.
*Test.* À chaque changement de code, un programme compare les tables réelles de la base d'essai à la carte : tout champ absent de la carte, ou sans usage, fait échouer la vérification. *Travail 5, puis à chaque changement.*

### B. Rien de personnel qui sorte

**P-05. Les messages ne contiennent rien de personnel, à une exception près.** *Plan, travail 3 ; D-043.*
Le message de 18h, sous ses formes (E1), ne cite personne et ne dit rien d'une réponse. Les e-mails (le code, l'avertissement avant effacement) ne citent ni le pseudo, ni le cercle, ni une réponse, ni ce qui a été manqué (D-045). Seule exception : l'annonce d'arrivée faite au créateur d'un cercle cite le pseudo de qui arrive (D-006, D-011). La liste des messages est fermée : un message nouveau ne part pas sans son test.
*Test.* Traceur : chaque modèle de message est rendu dans chacune de ses formes avec les valeurs du traceur ; aucune n'y apparaît, sauf le code dans l'e-mail du code et le pseudo de qui arrive dans l'annonce d'arrivée. Un modèle sans test fait échouer la vérification. *Travaux 4 et 9.*

**P-06. Sur le web, le contenu d'une notification est chiffré jusqu'au téléphone.** *Proposé ; condition de l'exception de P-05.*
Le serveur refuse d'envoyer une notification dont le contenu ne serait pas chiffré pour le seul téléphone destinataire. C'est ce qui permet de garder le texte validé de l'annonce d'arrivée (D-011, D-014) : Apple et Google l'acheminent sans le lire. Au passage aux boutiques (travail 14), ce n'est plus vrai d'emblée : soit on chiffre nous-mêmes le contenu dans l'application, soit l'annonce perd le pseudo dans la notification et le garde à l'écran. Le choix se fera à ce moment-là.
*Test.* Le module d'envoi, appelé sans chiffrement, refuse. Un faux service d'acheminement reçoit les envois d'une partie simulée : le traceur n'y apparaît jamais en clair. Au travail 4, sur de vrais iPhone, on vérifie que la forme de notification retenue garde ce chiffrement (de mémoire pour la forme récente d'Apple). *Travail 4.*

**P-07. Les journaux de notre programme ne contiennent aucune donnée de joueur.** *Plan, travail 3 ; D-048.*
Une ligne de journal dit seulement : l'heure, la route sous forme de modèle (« envoi d'une réponse », jamais un identifiant), le résultat, la durée, le type d'erreur, un numéro de requête tiré au hasard. Jamais d'adresse internet, d'identifiant de joueur ou de cercle, de pseudo, d'adresse e-mail, de réponse, ni le contenu d'une demande. Les erreurs remontées par le téléphone suivent la même règle, vers notre serveur seulement.
*Test.* Traceur sur une semaine simulée complète, erreurs provoquées comprises (une saisie invalide qui contient le traceur, une base coupée, un délai dépassé) : le traceur n'apparaît dans aucun journal. Réponses inversées : les journaux des deux parties sont identiques. Aucun identifiant de la forme de ceux de la base n'apparaît dans les journaux (recherche par motif). *Travail 5.*

**P-08. Les adresses des pages ne portent aucune donnée.** *Proposé.*
Ce que le téléphone demande au serveur ne met dans l'adresse ni identifiant, ni pseudo, ni réponse : tout passe dans le corps de la demande. Raison : les journaux de Scalingo notent l'adresse demandée à côté de l'adresse internet, et le téléphone garde un historique. Le lien d'invitation porte son jeton après le signe « # » : cette partie d'une adresse n'est jamais envoyée au serveur ni aux robots qui fabriquent les aperçus.
*Test.* Pendant une partie simulée, chaque ligne de demande reçue par le serveur est relevée : ni traceur, ni identifiant, ni jeton. *Travail 5.*

**P-09. Aucun outil de mesure, d'erreurs ou de publicité extérieur ; aucune ressource chargée ailleurs.** *Plan, travail 3 ; D-042 ; `docs/plateforme.md`, annexe A.*
Les polices, les images et le code sont servis par le jeu lui-même. Les mesures et les erreurs passent par notre serveur.
*Test.* Relevé du réseau sur tous les écrans : le téléphone ne contacte que l'adresse du jeu, plus Apple ou Google sur l'écran du compte après le toucher (P-10). La page déclare au navigateur qu'elle refuse tout chargement venu d'ailleurs (en-tête de sécurité vérifié par le test). La liste des bibliothèques du projet ne contient aucun outil de mesure connu (liste d'exclusion). *Travail 7.*

**P-10. Rien d'Apple ni de Google n'est chargé avant le toucher.** *`docs/onboarding.md`, règle 3 du compte ; D-035.*
*Test.* Relevé du réseau : avant le toucher sur « Continuer avec Apple » ou « Continuer avec Google », aucune demande vers Apple ni Google ; après le toucher, seulement vers celui qui a été choisi. *Travail 9.*

**P-11. Le téléphone ne garde rien des autres.** *Proposé.*
La mémoire du téléphone garde la session, les réglages d'affichage et, le temps de l'envoyer, une réponse pas encore partie. Elle ne garde jamais, au-delà de l'écran affiché, une réponse d'un proche, un pseudo d'un autre cercle ou une révélation. Un proche qui fouillerait la mémoire du téléphone n'y trouverait pas ce que l'écran ne montre plus.
*Test.* Après une partie simulée complète, on lit toute la mémoire du navigateur (stockage local, base du navigateur, cache) : aucun traceur d'un autre membre, aucune donnée de révélation. *Travail 7.*

### C. Les prestataires

**P-12. Tout prestataire qui touche aux joueurs est européen, par son siège et son contrôle ; deux exceptions seulement.** *D-043, point 3 ; D-048 ; `docs/plateforme.md`, limite 1.*
Un registre des prestataires, dans le dépôt, dit pour chacun : siège, contrôle, lieu des machines, sous-traitants qui détiennent des données, date du contrat de sous-traitance (RGPD, art. 28), date de la dernière vérification. Les seules exceptions hors d'Europe sont la connexion par Apple ou Google et l'acheminement des messages par Apple ou Google (D-043).
*Test.* Le serveur ne peut joindre que les adresses du registre (liste fermée appliquée à ses sorties) ; le relevé du réseau du serveur le vérifie sur une partie simulée. Un programme vérifie que le registre ne contient, hors d'Europe, que les deux exceptions. **Ce qu'aucun test ne prouve** : que le siège, le contrôle et les sous-traitants sont bien ceux du registre. C'est un contrôle humain, avant de signer, puis une fois par an (proposé), et l'avocat relit les contrats (D-044). *Travail 5.*

**P-13. La copie des sauvegardes chez Scaleway est chiffrée par nous avant de partir.** *`docs/plateforme.md`, annexe A (copie chez Scaleway, proposé).*
Scaleway garde une copie qu'il ne peut pas lire : la clé reste chez nous.
*Test.* Le fichier envoyé ne contient aucun traceur en clair ; restauré avec la clé, il redonne la base ; sans la clé, il est illisible. *Travail 5.*

### D. L'IA et les agents

**P-14. La chaîne des textes n'a aucun accès aux données des joueurs.** *Plan, travail 3 ; D-043, point 3 ; D-044, point 2 ; la séparation, proposé.*
La chaîne tourne à part : sa propre application et sa propre base, qui ne contient que des données publiques de l'Assemblée. Elle ne possède aucun mot de passe de la base des joueurs. Le seul passage va dans un sens : la chaîne livre des textes au jeu ; le jeu ne lui renvoie rien. Le registre public de méthode est produit par la chaîne, donc sans aucun chiffre sur les joueurs (§9, D-027).
*Test.* Les réglages de l'application de la chaîne ne contiennent aucune adresse ni aucun mot de passe de la base des joueurs (inventaire automatique). Une tentative de connexion de la chaîne à cette base échoue. Le code de la chaîne n'utilise aucun module du jeu. Le point d'entrée du jeu qui reçoit les textes n'accepte qu'une livraison de texte et ne renvoie rien d'autre qu'un accusé de réception. *Travail 10.*

**P-15. Le jeu n'appelle aucun fournisseur d'IA.** *D-043, point 3.*
*Test.* La liste fermée des sorties du serveur (P-12) ne contient aucun fournisseur d'IA ; la liste des bibliothèques du jeu ne contient aucune bibliothèque d'IA. *Travail 5.*

**P-16. Les agents n'accèdent jamais à la base réelle ni aux journaux de la version en ligne.** *D-048 ; `docs/plateforme.md`, limite 3.*
Les mots de passe de la version en ligne n'existent que dans les réglages de Scalingo, saisis par vous. Ils ne sont ni dans le dépôt, ni dans les outils de vérification automatique, ni dans une session d'agents. Les comptes Scalingo, Scaleway, GitHub, du domaine et d'Apple sont à votre nom, avec une double vérification à la connexion (proposé ; contrôle humain).
*Test.* À chaque changement, une recherche de secrets parcourt tout l'historique du dépôt. L'inventaire des réglages des outils de vérification ne contient aucun nom de réglage de la version en ligne. *Travail 5.*

**P-17. Le dépôt ne contient aucune donnée de joueur.** *D-048 ; `docs/plateforme.md`, annexe F.*
Le dépôt public ne garde que du code, des documents et des données inventées. Proposé : le code de la version en ligne reste public, comme aujourd'hui. Il ne contient ni secret ni donnée ; sa publication montre que les promesses sont tenues ; la sécurité ne repose pas sur son secret (P-26 la prouve par des tests).
*Test.* Recherche de secrets (P-16) ; toute adresse e-mail présente dans le dépôt est au domaine réservé `exemple.invalid`. *Travail 5.*

**P-18. La restauration se répète sur des données inventées ; avec de vraies données, c'est votre geste seul.** *`docs/plateforme.md`, limite 3 ; plan, travail 5.*
*Test.* Chaque semaine, une restauration complète d'une base inventée tourne seule : elle redonne les mêmes comptes et le même traceur. Le programme de restauration vers la version en ligne demande une confirmation tapée par une personne et des mots de passe que les outils automatiques n'ont pas (P-16) ; lancé sans eux, il s'arrête. Le travail 5 vérifie en plus que vous réussissez ce geste seul (`docs/plateforme.md`). *Travail 5.*

**P-19. La version d'aperçu ne reçoit jamais de vraie donnée.** *`docs/plateforme.md`, limite 3.*
Chaque base porte, dès sa création, une marque : « inventée » ou « réelle ». L'aperçu ne démarre que sur une base marquée « inventée » ; le programme de restauration refuse de verser une sauvegarde « réelle » dans une base « inventée ». Les données de l'aperçu viennent d'un générateur : pseudos inventés, adresses au domaine réservé.
*Test.* Démarrage de l'aperçu sur une base « réelle » simulée : refusé. Restauration croisée : refusée. Inventaire de la base d'aperçu : aucune adresse hors du domaine réservé. *Travail 5.*

**P-20. Ce que vous saisissez sur l'aperçu est visible de l'équipe, et l'écran le dit.** *`docs/plateforme.md`, limite 3 (vos réponses sont des données de joueur) ; proposé.*
Une bande sur chaque écran de l'aperçu : « Version d'aperçu : l'équipe voit ce que tu saisis ici. » Une connexion d'essai, sans Apple ni Google, existe sur l'aperçu seulement ; les vraies connexions s'y essaient avec des comptes créés pour le test. L'aperçu est remis à zéro chaque semaine.
*Test.* Relevé de tous les écrans de l'aperçu : la bande est présente. La connexion d'essai répond sur l'aperçu et est refusée dans la configuration de la version en ligne. *Travail 7.*

**P-21. Ce que les agents peuvent lire de la version en ligne : seulement des totaux et des journaux sans donnée de joueur, si vous le décidez.** *Question de la fin ; D-027 ; D-048 ; `docs/plateforme.md`, limite 3.*
Si vous répondez oui : un rapport est produit dans la version en ligne. Il ne contient que des totaux au-dessus des seuils (30 réponses pour la part de « aucune », D-027 ; groupes de 10 joueurs au moins pour les gestes, proposé) et, en cas d'incident, des extraits de nos journaux (P-07). Vous le lisez, puis vous le donnez ; les agents n'ont jamais d'accès direct. Jamais les journaux de Scalingo, qui contiennent des adresses internet. Si vous répondez non : vous êtes le seul lecteur, et ce rapport reste à vous.
*Test.* Sur une base inventée, chaque chiffre du rapport porte sur un groupe au-dessus du seuil, ou est remplacé par « — » ; le traceur n'y apparaît pas ; réponses inversées : le rapport est identique, sauf la part de « aucune », qui dépend des raisons par nature. *Travail 12.*

### E. Les usages permis

**P-22. Quatre usages, quatre rôles de base de données.** *D-042, point 2.*
Le jeu, les comptes, les mesures et la sécurité se connectent chacun sous leur rôle. Chaque rôle ne peut lire que les champs de son usage sur la carte des données.
*Test.* Un programme lit les droits réels de chaque rôle dans la base d'essai et les compare à la carte : un droit en trop fait échouer la vérification. *Travail 5.*

**P-23. Les réponses ne servent qu'à jouer et à compter la part de « aucune ».** *D-027 ; D-042, point 2.*
Le rôle des mesures ne lit pas les réponses. Il ne lit qu'une vue, c'est-à-dire une fenêtre préparée par la base, qui donne pour chaque texte deux nombres : réponses et « aucune ». La vue ne répond qu'après la révélation du texte et au-dessus de 30 réponses (seuil à fixer dans l'analyse d'impact, D-027). Le compte est fait une fois, puis figé : il ne bouge plus si un joueur efface ses réponses ensuite, pour qu'on ne puisse pas retrouver une raison par différence entre deux comptes. Aucune ligne par cercle ni par personne n'existe.
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

**P-28. Aucun calcul ne réunit plusieurs cercles, sauf la part de « aucune », interne.** *§9 ; D-025 ; D-027 ; règle 3 (R8).*
L'avis du cercle se calcule cercle par cercle. Le seul croisement permis entre cercles est celui de la règle 3 : une personne n'est proposée qu'une fois par jour.
*Test.* Un joueur présent dans deux cercles : chaque graphique de l'avis du cercle ne compte que les réponses de son cercle. Droits des rôles : seul le rôle des mesures lit au-delà d'un cercle, et seulement par la vue de P-23. *Travaux 5 et 8.*

**P-29. L'invitation ne montre les réponses d'entrée de Thomas qu'à une personne, une fois.** *D-006 ; `docs/onboarding.md`.*
Le jeton du lien est tiré au hasard, gardé seulement sous forme d'empreinte, placé après le « # » (P-08). Ouvrir le lien montre le premier texte, rien de Thomas. Le lien est lié à Marie à sa première réponse enregistrée ; ensuite, ouvert ailleurs, il dit qu'il a déjà servi. Il expire au bout de 7 jours (proposé, à confirmer par UX). Les réponses de Thomas n'arrivent qu'une à une, après la devinette de Marie sur chaque texte. Le consentement de Thomas à les envoyer est enregistré avec l'invitation (P-35).
*Test.* Des ouvertures sans la partie après le « # » (robots d'aperçu) ne reçoivent aucune donnée de Thomas et laissent le lien intact. La première réponse lie le lien ; un autre appareil est refusé ; après 7 jours, le lien est refusé. La réponse de Thomas sur un texte n'est jamais envoyée avant la devinette correspondante. *Travail 9.*

### G. Les durées

**P-30. Un compte qui n'ouvre pas le jeu pendant 12 mois est effacé ; un seul e-mail, 30 jours avant.** *D-045, point 1.*
Précisions proposées :
- « ouvrir le jeu », c'est afficher un écran du jeu à un joueur connecté. Recevoir le message de 18h ne compte pas ; un rafraîchissement en arrière-plan non plus ;
- 12 mois se comptent de date à date, à l'heure de Paris ; un compte ouvert pour la dernière fois le 29 février est effacé le 28 février suivant, à la même heure ;
- l'e-mail part 30 jours avant, une fois par période d'inactivité ; une ouverture remet le compteur à zéro, et une nouvelle période peut donner un nouvel e-mail ;
- l'effacement a lieu même si l'e-mail n'a pas pu partir ; il se fait comme « Tout effacer » (P-38), sans aucun message au cercle (D-045).
*Test.* Horloge simulée, J étant le jour de l'effacement : à J − 31, rien ; à J − 30, un e-mail ; de J − 29 à J − 1, aucun second e-mail ; une ouverture à J − 20 remet tout à zéro ; sans ouverture, effacement le jour J, aucun message au cercle, visage absent du Cercle. Un compte en pause qui reçoit chaque soir le message de 18h (D-029) est quand même effacé au bout de 12 mois. Cas du 29 février. *Travail 6.*

**P-31. Chaque durée de la carte des données est tenue, par un effacement quotidien.** *D-045, dernier alinéa ; durées proposées par Juridique (`docs/etape-5-choix.md`).*
Un programme d'effacement passe chaque jour. Il peut être relancé sans risque : une seconde passe ne change rien. Il ne tourne jamais entre 17 h 30 et 18 h 30 (proposé), pour ne pas charger le serveur à l'heure du rendez-vous.
*Test.* Pour chaque ligne de la carte (partie 4) : une donnée créée, puis l'horloge avancée jusqu'à la veille de son terme, la donnée est là ; au lendemain de son terme, elle n'y est plus ; une seconde passe ne change rien. *Travail 6.*

**P-32. Un effacement atteint aussi les sauvegardes.** *Plan, travail 3 (« l'effacement est réel ») ; `docs/plateforme.md`, annexe A.*
Un compte effacé disparaît des sauvegardes à la fin de leur rotation : 30 jours pour la copie chez Scaleway (proposé), durée de Scalingo à vérifier. Si une sauvegarde est restaurée, les effacements faits depuis sont rejoués : un journal des effacements garde pour cela les identifiants tirés au hasard des comptes effacés, sans adresse ni pseudo, jusqu'à la fin de la plus longue rotation, plus 5 jours (proposé).
*Test.* Sur une base inventée : sauvegarde, effacement d'un compte, restauration de la sauvegarde, rejeu du journal : le compte et son traceur ont disparu. Le journal est vidé après son terme (horloge simulée). *Travail 5.*

**P-33. L'effacement est tout de suite effectif dans la base.** *Plan, travail 3.*
« Tout effacer » agit en quelques minutes dans la base ; seules les sauvegardes suivent le délai de P-32, et « Qui, durée, droits » le dit.
*Test.* Fait partie du test de P-38 : le traceur a disparu de la base au plus tard à la passe suivante, sans attendre le lendemain. *Travail 5.*

### H. Le consentement prouvé

**P-34. Aucune réponse n'est enregistrée sans un accord enregistré avant elle.** *Plan, travail 3 ; RGPD, art. 7.1 et 9.2.a ; `docs/onboarding.md`, étape 3.*
L'accord garde : la version de la carte, une empreinte de son texte exact, la date et l'heure, et la déclaration « 15 ans et plus ». C'est la base elle-même qui refuse une réponse sans accord. L'accord d'un invité qui n'a pas encore de compte suit l'invité : il passe à son compte à la création. Si la carte change de façon importante, une version marquée « nouvel accord » bloque la réponse suivante jusqu'au nouvel accord (proposé). Refuser n'enregistre rien.
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
Partent : le compte, l'adresse, le lien avec Apple ou Google (révoqué chez eux quand ils le permettent), les réponses, les devinettes, le portrait, la barre, les abonnements au message, les gestes gardés sous son identifiant, les sessions. Restent : ses titres passés, sous « un ancien membre », et les totaux déjà anonymes (P-23). Aucun message au cercle.
*Test.* Traceur : après l'effacement, recherche dans toute la base d'essai : seules restent les mentions « un ancien membre ». Un faux Apple et un faux Google enregistrent la demande de révocation. Aucun message n'est mis en file pour le cercle. L'ancienne session est refusée. *Travaux 5 et 9.*

### J. Les mesures

**P-39. On mesure des gestes, jamais des avis.** *`docs/produit.md`, section 8 ; règle de Juridique des essais.*
Un geste gardé ne porte ni position, ni raison, ni tension, ni texte. Règle des essais, reprise : un chiffre qui changerait si le joueur avait répondu autrement n'est jamais gardé (seule exception : la part de « aucune », P-23).
*Test.* Réponses inversées : la réserve des gestes est identique octet pour octet. Le format d'un geste n'a aucun champ de position, de raison, de tension ni de texte (comparaison avec la carte). *Travail 12.*

**P-40. La durée de l'écran de la raison est comptée sur tous les joueurs, jamais par personne, par jour ni par texte.** *`docs/produit.md`, section 8 (condition de Juridique : jamais croisée avec la tension).*
Un jour, tous les joueurs répondent au même texte, qui touche une seule tension : une durée gardée par jour serait donc croisée avec la tension. Elle s'additionne dans un relevé par semaine, sans identifiant ni texte.
*Test.* Le relevé n'a ni champ de joueur, ni de texte, ni de jour ; réponses inversées : identique. *Travail 12.*

### K. La sécurité de base

**P-41. Connexion chiffrée, sessions sûres, code par e-mail protégé.** *RGPD, art. 32 ; durée du code proposée par Juridique.*
Le jeu ne répond qu'en connexion chiffrée. La session n'est lisible que par le jeu, et s'arrête à la déconnexion et à l'effacement. Le code à six chiffres vaut 15 minutes, une seule fois, avec 5 essais au plus ; le nombre de codes demandés pour une même adresse est limité. Un compte Google d'employeur ou de lycée est refusé, l'e-mail restant proposé (`docs/onboarding.md`, règle 4). Les bibliothèques du projet sont vérifiées contre les failles connues à chaque changement.
*Test.* En-têtes de sécurité vérifiés sur chaque page. Sixième essai d'un code : refusé ; code de 16 minutes : refusé ; code déjà servi : refusé. Faux jeton Google portant la marque d'un domaine d'organisation : refusé, avec la voie e-mail proposée. Vérification des failles connues dans la liste des bibliothèques. *Travaux 5 et 9.*

**P-42. Aucun écran d'administration ne montre une réponse, un pseudo ni une adresse ; ouvrir la base réelle laisse une trace.** *D-048 (en cas d'incident, c'est vous qui regardez) ; proposé.*
Vos écrans à vous : le stock de textes, les alertes, les totaux de P-21 et P-23. Pour un incident ou une restauration, vous ouvrez la base par un programme qui note d'abord la date, la durée et la raison donnée, dans la trace des ouvertures (partie 4).
*Test.* Chaque réponse des écrans d'administration est comparée à une liste fermée de champs : aucun champ de réponse, de pseudo ni d'adresse. Le programme d'ouverture écrit sa ligne avant d'ouvrir ; s'il ne peut pas l'écrire, il s'arrête. *Travaux 5 et 12.*

### L. Le premier code : le test du message de 18h

**P-43. Le test du message de 18h ne garde que ce qu'il teste.** *Plan, travail 4 ; D-005.*
La page nue du test n'enregistre que les abonnements au message et l'heure de réception ; aucune réponse, aucun pseudo. Les téléphones prêtés n'y laissent aucune donnée de leurs propriétaires : connexion avec vos comptes ou des comptes créés pour le test. Une note d'une page leur dit ce qui est gardé et quand c'est effacé (proposé). Tout est effacé à la fin des trois soirs.
*Test.* La base du test n'a que les champs prévus (comparaison avec sa carte). Le programme d'effacement de fin de test est joué, puis la base est vérifiée vide. *Travail 4.*

### Ce qu'aucun test ne prouve

Dit franchement : les tests prouvent qu'aucun chemin technique n'existe dans le code. Ils ne prouvent pas ce qui dépend de personnes ou de contrats. Ces points relèvent d'un contrôle humain, noté au registre des prestataires ou dans la procédure d'incident :
- que les prestataires sont bien européens, avec leurs sous-traitants (P-12) : vérifié avant de signer, puis une fois par an (proposé), contrats relus par l'avocat (D-044) ;
- que vous ne lisez pas les réponses (note 1) : aucun écran ne les montre, et l'ouverture de la base laisse une trace ; mais vous détenez les clés, et une trace écrite par vos propres outils peut être contournée par vous ;
- que Scalingo ne lit pas ce qu'il garde (note 2) : c'est son contrat ;
- la double vérification des comptes à votre nom (P-16) ;
- les procédures : fuite de données à signaler à la CNIL sous 72 heures, et aux joueurs vu la sensibilité (RGPD, art. 33 et 34), demandes d'accès et d'effacement par e-mail. Elles se jouent une fois à blanc (plan, travail 11).

---

## 4. La carte des données : où, combien de temps

Première version, à compléter au travail 5 avec le modèle de données, puis à reprendre dans l'analyse d'impact. Usages (D-042) : 1 faire tourner le jeu ; 2 la part de « aucune » ; 3 les mesures sur les gestes ; 4 la sécurité.

| Donnée | Usage | Où | Combien de temps | D'où vient la durée |
|---|---|---|---|---|
| Adresse e-mail, chiffrée | 1 | Scalingo ; copie chiffrée chez Scaleway ; envois par Scaleway | Tant que le compte existe | D-045 : effacé après 12 mois sans ouvrir le jeu |
| Lien avec Apple ou Google | 1 | Scalingo | Tant que le compte existe ; coupé à l'effacement | `docs/onboarding.md`, règle 5 |
| Pseudo, rond, nom du cercle | 1 | Scalingo | Tant que le compte, ou le cercle, existe | Proposé |
| Réponses, devinettes, points | 1 | Scalingo, réponses chiffrées | Tant que le compte existe ; au départ d'un cercle, elles quittent ce cercle | Juridique, proposé |
| Portrait, barre, tempéraments | 1 | Recalculés depuis les réponses | Comme les réponses | Juridique, proposé |
| Titres passés | 1 | Scalingo | Tant que le cercle existe, sous « un ancien membre » après un départ ; un cercle sans membre est effacé avec son histoire | D-045, point 2 ; cercle vide : proposé |
| Réponses d'un invité qui ne crée pas de compte | 1 | Scalingo | 7 jours au plus | Juridique, proposé |
| Lien d'invitation (empreinte) | 1 | Scalingo | Jusqu'à son usage, 7 jours au plus | Proposé, à confirmer par UX |
| Code à six chiffres | 1 | Scalingo | 15 minutes | Juridique, proposé |
| Abonnement au message de 18h | 1 | Scalingo | Jusqu'au retrait, à l'effacement, ou au refus du service d'acheminement | Proposé |
| Preuve de l'accord | 1 | Scalingo | Tant que le compte existe ; après, question pour l'avocat | Juridique, proposé |
| Gestes, sous un identifiant sans nom | 3 | Scalingo | 13 mois au plus, puis seulement en totaux | Juridique, proposé |
| Totaux des gestes | 3 | Scalingo | Sans limite : anonymes | Proposé |
| Comptes de la part de « aucune » | 2 | Scalingo | Sans limite : anonymes | Juridique, proposé |
| Journaux de notre programme, sans donnée de joueur | 4 | Scalingo | 6 mois | Juridique, proposé (repère de la CNIL, de mémoire) |
| Journaux de Scalingo, avec l'adresse internet | 4 | Scalingo | Durée de Scalingo, à connaître avant de signer | À vérifier |
| Trace des ouvertures de la base réelle | 4 | Scalingo | 1 an | Proposé (repère de la CNIL : 6 mois à 1 an, de mémoire) |
| Sauvegardes de Scalingo | 4 | Scalingo | Durée de leur rotation | À vérifier (`docs/plateforme.md`) |
| Copie chiffrée des sauvegardes | 4 | Scaleway | 30 jours | `docs/plateforme.md`, proposé |
| Journal des effacements, identifiants seuls | 4 | Scalingo | Plus longue rotation des sauvegardes, plus 5 jours | Proposé (P-32) |
| Version d'aperçu | — | Scalingo | Aucune donnée réelle ; remise à zéro chaque semaine | Proposé (P-19, P-20) |
| Test du message de 18h | 1 | Scalingo | Effacé à la fin des trois soirs | Proposé (P-43) |

---

## 5. Pour l'avocat

À ajouter à sa première relecture, avant la bêta (liste de D-044). Ce sont des questions, pas des réponses.

1. **Les bases légales.** Accord explicite pour les opinions (art. 9.2.a, carte de consentement) ; exécution du contrat pour le compte ; quelle base pour les mesures sur les gestes ? Le simple fait de jouer à un jeu politique dit-il déjà quelque chose de sensible, que la carte doit couvrir ?
2. **Les totaux et les journaux donnés aux agents** (question de la fin). Des totaux au-dessus de seuils, et des journaux sans identifiant ni adresse internet, sont-ils des données anonymes, donc hors du RGPD, au sens de son considérant 26 et des critères du G29 (avis 05/2014) ? La Cour de justice de l'Union a jugé, de mémoire en septembre 2025 (affaire C-413/23 P), qu'une donnée pseudonymisée peut ne pas être personnelle pour un destinataire qui n'a aucun moyen raisonnable de retrouver la personne. Cela couvre-t-il un fournisseur d'IA américain ?
3. **La preuve de l'accord après l'effacement** : la garder, sous quelle forme, combien de temps (art. 7.1 contre art. 17) ?
4. **Le journal des effacements** (P-32) : garder les identifiants de comptes effacés pendant la plus longue rotation des sauvegardes, plus 5 jours,, pour que l'effacement survive à une restauration, est-ce admis ?
5. **Les durées proposées** de la partie 4, toutes, et la durée des réponses tant que le compte existe.
6. **Les contrats** avec Scalingo et Scaleway (art. 28), leurs sous-traitants, et la lecture « siège et contrôle » de D-043 appliquée aux sous-traitants (`docs/plateforme.md`, limite 1).
7. **L'annonce d'arrivée** qui cite un pseudo : admise telle quelle sur le web, puisque chiffrée jusqu'au téléphone ? Que faire dans les applications des boutiques (P-06) ?
8. **Le relais d'Apple** pour l'e-mail d'avant effacement, et Apple et Google comme responsables distincts pour leur service de connexion : ce que « Qui, durée, droits » doit en dire.
9. **Le statut d'hébergeur** (pseudos et noms de cercle) : une obligation de garder des données d'identification, de mémoire issue d'un décret d'octobre 2021, limiterait-elle « Tout effacer » ? (Déjà noté au plan, partie 7.)
10. **L'export** (P-36) : ce qu'il doit contenir (art. 15 et 20), et si les devinettes que d'autres ont faites sur Marie sont aussi ses données.
11. **Le registre des traitements** (art. 30) : obligatoire ici malgré la petite taille, puisque des données sensibles sont traitées (de mémoire). La carte des données en est la base.
12. **Les mineurs de 15 à 17 ans** : la déclaration suffit-elle encore, la loi étant en cours de réécriture (plan, partie 7) ?
13. **Les députés** sont aussi des personnes concernées : leurs noms et leurs arguments, rendus publics par eux (art. 9.2.e), sont révélés à 18h et gardés au registre public. Quelles obligations envers eux (information, rectification d'une citation mal rendue) ?

---

## 6. Pour l'analyse d'impact

Les risques à y décrire, avec la parade déjà prévue. L'analyse est obligatoire ici (données sensibles, profilage, joueurs de 15 à 17 ans ; plan, travail 11).

1. **Le portrait vu par le cercle** (règle 19) : des curseurs sur huit tensions sont un profil politique, montré à des personnes qui connaissent le joueur. Parade : seulement le cercle, aucun chiffre d'accord, la barre pour soi seul (D-026).
2. **La répartition de l'avis du cercle** (D-025) : dans un petit cercle, elle se lit nom par nom. Parade : seuil minimal à fixer avant la bêta ; justification de la minimisation (art. 5.1.c et 25), déjà demandée par D-025.
3. **La révélation entre proches** : un avis découvert à 18h peut froisser une famille. Parade : aucune mise en scène du désaccord, sauf D-025 ; question du questionnaire de bêta (« une révélation t'a-t-elle mis mal à l'aise ? »).
4. **Un adolescent dans un cercle familial** : pression pour répondre comme ses parents, ou peur d'être deviné. Parade : à concevoir ; c'est une question éthique autant que juridique (D-025 le demande déjà).
5. **Les captures d'écran** font sortir des réponses du cercle. Aucune parade technique : la politique de confidentialité le dit.
6. **Le téléphone partagé ou prêté, l'adresse e-mail partagée** en famille : un proche peut ouvrir le jeu d'un autre, ou recevoir son code. Parade partielle : P-11 ; le reste est à observer en bêta.
7. **L'hébergeur garde la clé** (note 2) : le chiffrement protège les copies, pas contre Scalingo. Parade : contrat, prestataire français.
8. **Vous, seul administrateur, en nom propre** : vous pouvez tout lire, et la perte de la clé perdrait les données. Parade : aucun écran ne montre une réponse ; trace des ouvertures ; copie de la clé hors ligne (P-02).
9. **Le fournisseur d'IA** voit le code, et peut-être des totaux (question de la fin) ; le code qui garde des opinions n'est relu que par des modèles (D-043). Parade : P-14 à P-21 ; audit de sécurité avant l'ouverture (plan, partie 5).
10. **Retrouver quelqu'un par les totaux** : par différence entre deux comptes, ou dans un petit groupe de la bêta (40 à 80 joueurs). Parade : seuils, compte figé (P-23), gestes sans avis (P-39, P-40).
11. **La durée des réponses** : tant que le compte existe, sans limite pour un joueur actif. Est-ce nécessaire au portrait, ou faut-il une limite ?
12. **La période électorale** : une fuite pendant une campagne aurait un poids particulier. Parade : P-02, P-13, procédure de fuite (art. 33 et 34).
13. **Le changement de structure** (D-042, D-043) : un nouveau responsable des données, et probablement un nouvel accord à demander à chaque joueur.
14. **Les erreurs de texte** qui visent un député nommé à 18h (D-044). Parade : procédure de correction, erratum daté.

---

## 7. Décisions antérieures touchées

**Aucune décision n'est modifiée.** Ce document applique D-006, D-024 à D-027, D-035, D-042, D-043, D-045 et D-048. Précisions, toutes signalées :
- **D-027 et `docs/plateforme.md`, limite 3** : D-027 nomme Contenu lecteur de la part de « aucune » ; la limite 3 vous en avait fait le seul lecteur, en attendant l'avis de Juridique. L'avis est donné (P-21), et la question de la fin tranche. La réponse recommandée garde D-027 tel quel ; « Non, vous seul » modifierait D-027.
- **D-043, point 3, et D-048** : « donnée de joueur » est lue comme toute donnée qui se rapporte à un joueur, même sous un identifiant tiré au hasard. Un total au-dessus d'un seuil, et un journal sans identifiant ni adresse internet, n'en sont pas (lecture de Juridique, à confirmer par l'avocat, partie 5, point 2). Rien n'est changé tant que vous n'avez pas répondu.
- **`docs/produit.md`, section 8 (D-041)** : la durée de l'écran de la raison n'est gardée ni par jour ni par texte (P-40). C'est l'application de la condition de Juridique (« jamais croisée avec la tension »), puisqu'un jour n'a qu'un texte et une tension.
- **D-006 et `docs/onboarding.md`** : le lien d'invitation « expire » ; durée proposée, 7 jours ; il est lié à l'invitée à sa première réponse (P-29), à confirmer par UX.
- **D-011 et D-014 (l'annonce d'arrivée)** : le texte validé peut rester dans la notification sur le web, puisque son contenu est chiffré jusqu'au téléphone (P-06). C'est la revue que demandait le plan (travail 3). La question reviendra au passage aux boutiques (travail 14).
- **D-045, point 1** : « ouvrir le jeu » et « 12 mois » sont précisés (P-30), sans rien changer à la règle.
- **`docs/plateforme.md`, annexe F** : le code reste public (P-17, proposé), comme le prévoyait cette annexe : « à voir avec Juridique et Back-end, sans question à vous ».

---

## 8. Limites et doutes

- **Juridique n'est pas avocat.** Les points de droit sont à confirmer (partie 5). Plusieurs faits sont de mémoire : le chiffrement de la forme récente des notifications d'Apple, l'arrêt de la Cour de justice cité, le décret sur les données d'identification, les repères de la CNIL.
- **À vérifier avant de signer** : la durée des journaux et des sauvegardes de Scalingo, et si Scalingo garde une trace des ouvertures de la base (sinon, cette trace est la nôtre, contournable par vous).
- **Les tests prouvent l'absence de chemins dans le code, pas l'honnêteté des personnes** : ni la vôtre, ni celle des prestataires. C'est la limite de toute protection des données ; elle se compense par les contrats, la trace des accès et l'audit de sécurité avant l'ouverture.
- **Les seuils (30, 10) sont des conventions**, pas des garanties mathématiques. Dans une bêta de 40 à 80 joueurs, certains groupes seront petits : des chiffres seront remplacés par « — ».
- **Le chiffrement des réponses** (P-02) rend la base plus sûre, mais un peu plus lente à interroger et plus délicate à réparer. À notre taille, l'écart est négligeable (estimation).
- **Ce document décrit les tests ; il ne les écrit pas.** Le « fini quand » du plan (« chaque exigence a son test automatique ») sera atteint quand chacun de ces tests existera dans le code, aux travaux indiqués. Les 43 exigences ont un test automatique décrit ; celui de P-24 (l'argent) ne sera construit qu'avant l'ouverture ; P-12 et P-16 ont en plus une part humaine, listée en fin de partie 3.

**À tester avec de vraies personnes, en bêta :**
- la version pour les joueurs de « qui voit quoi » (dans « Qui, durée, droits ») : est-elle lue, comprise, rassurante ou inquiétante ?
- les familles : téléphones prêtés, adresses partagées, captures d'écran ;
- les aperçus de notification sur l'écran verrouillé, chez Thomas ;
- les adolescents dans un cercle familial ;
- les demandes d'effacement et d'export, traitées de bout en bout au moins une fois (plan, partie 5).

---

## La question

**Agents**
Les agents, donc le fournisseur d'IA chez qui ils travaillent, peuvent-ils lire des totaux et des journaux techniques qui ne contiennent aucune donnée de joueur ? Conditions de la première option (P-21) : un rapport que vous leur donnez, jamais un accès ; des totaux au-dessus des seuils ; nos journaux seulement, jamais ceux de Scalingo ; la règle écrite dans « Qui, durée, droits ».
- **Oui, sous conditions (Recommandé)** : D-027 nomme déjà Contenu, et sans cela vous lisez seul les mesures de la bêta et chaque incident.
- **Totaux seulement** : Contenu lit les totaux ; les journaux restent à vous seul, même en cas d'incident.
- **Non, vous seul** : la garantie la plus simple à dire aux joueurs, mais elle modifie D-027 et fait de vous le seul lecteur.
