# Comment on va construire : la plateforme

*Proposition de Back-end, avec Front-end, 11 octobre 2026. Elle répond à votre question : « comment tu vas construire, sur quelle plateforme, Supabase ou autre ». Rien n'est décidé : l'étape 6 n'a pas commencé, et aucune ligne de code ne s'écrit avant votre accord (D-001). Cette proposition applique vos choix de l'étape 5 (D-042 à D-046) sans en modifier aucun.*

**Comment lire les faits.**
- **Vérifié** : trouvé en ligne le 11 octobre 2026, source donnée à la fin. Limite : l'environnement de travail bloquait l'ouverture directe des sites des hébergeurs (Scalingo, Clever Cloud, Scaleway, Supabase). Les faits viennent donc des pages officielles telles que les restitue un moteur de recherche, et parfois de sites tiers, signalés comme tels.
- **De mémoire** : ce que savent les agents, à confirmer.
- **Estimation** : l'avis chiffré de l'équipe, pas un devis.

---

## 1. En bref

**La recommandation.**
1. Le jeu tourne chez un hébergeur français « clé en main » : on lui confie le programme, il entretient les machines et la base de données. On propose Scalingo, à Strasbourg ; Clever Cloud, à Nantes, sert de solution de repli.
2. Le reste se fait avec des briques européennes ou des outils libres, sans service américain intermédiaire : les e-mails chez Scaleway, la connexion écrite dans notre propre code, le message de 18h envoyé directement par notre serveur.
3. Supabase ne convient pas tel quel : c'est une société américaine, qui loge ses bases chez Amazon. On pourrait l'installer nous-mêmes chez un hébergeur européen, mais il faudrait alors entretenir une dizaine de logiciels, ce qui contredit votre besoin d'un entretien minimal.

**Ce que cela veut dire pour vous.**
- **Ce que vous aurez à faire.** Ouvrir quatre comptes à votre nom (D-042) : l'hébergeur, Scaleway, le nom de domaine et la sonde d'alerte. Les agents écrivent le code et le mettent en ligne. Vous seul saisissez les mots de passe de production, et vous seul touchez au jeu réel en cas d'incident, en suivant la procédure d'une page (D-043).
- **Ce que vous paierez** (estimation, TVA comprise) : environ 40 à 110 € par mois pendant la bêta, et 150 à 300 € par mois à 10 000 joueurs. Cela tient dans la ligne « hébergement, e-mails et sonde » du plan (partie 6). Chaque dépense vous sera présentée au moment où elle se présente (D-042). Le premier compte s'ouvre au début de l'étape 6, car le test du message de 18h (travail 4) a besoin d'un petit serveur.
- **Ce qui se passe si un soir ça tombe.** À 18h02, une alerte arrive sur votre téléphone. La révélation, elle, ne dépend pas du message : elle est déjà en base et s'affiche à 18h dans le jeu, même si le message part en retard. Il reste trois cas :
  - l'hébergeur est en panne : on attend, rien n'est perdu ;
  - une mise en ligne est fautive : elle est interdite de 15h à 19h et le dimanche, et un geste revient à la version précédente ;
  - l'envoi a échoué : un bouton le relance, sans risque d'envoyer deux fois.

  Si vous n'êtes pas joignable, le message part en retard, mais aucune donnée n'est perdue.

---

## 2. Les briques, une par une

Pour se représenter le tout, prenons Marie, un jeudi. Elle touche l'icône d'Elenchos sur son iPhone (1), le jeu lit ses cercles dans la base (2), elle est reconnue grâce à son compte Apple (3), elle reçoit le message à 18h (4), et le jour de son inscription, elle avait reçu un code par e-mail (5). Plus tard, elle installera peut-être l'application depuis l'App Store (6).

### (1) Où tourne le jeu

**Ce que c'est.** Deux morceaux. Dans le téléphone, une application web installable : une page qu'on ajoute à l'écran d'accueil et qui s'ouvre comme une application. C'est la forme des deux essais, qui a tenu sur votre iPhone (D-019). Sur un serveur, le programme qui garde les règles, juge les devinettes et prépare la révélation.

**Choix proposé.** Le serveur tourne chez **Scalingo**, un hébergeur « clé en main » : on lui confie le programme, il fournit les machines, les met à jour, les redémarre et en ajoute si la charge monte. Ses machines sont chez 3DS Outscale, la filiale cloud de Dassault Systèmes, à Paris (vérifié). Deux environnements : le jeu réel, et un jeu d'essai où vous validez en jouant (plan, partie 4).

**Côté téléphone (Front-end).** Les polices Alegreya sont servies par le jeu lui-même, pas par Google Fonts. Aucun outil de mesure extérieur n'est chargé (plan, travail 3).

### (2) Où sont gardées les données

**Ce que c'est.** Une base de données PostgreSQL, la plus courante pour ce type de service. Elle garde les comptes, les cercles, les réponses et les titres.

**Choix proposé.** La base PostgreSQL de Scalingo, dans sa **formule avec base de secours**. Une seconde copie tourne en permanence et prend le relais en quelques secondes si la première tombe. Scalingo s'engage sur 99,96 % de disponibilité pour cette formule, contre 98 % pour la formule simple (vérifié). 98 %, c'est jusqu'à environ 14 heures d'arrêt admises par mois : trop pour un rendez-vous quotidien. L'écart de prix est d'environ 13 € HT par mois pour la plus petite taille (vérifié).

**Ce qui l'accompagne.**
- **Le cloisonnement des cercles est imposé par la base elle-même** (plan, travail 5). PostgreSQL sait refuser, ligne par ligne, de montrer une réponse à qui n'est pas du cercle, même si le programme se trompe (de mémoire, fonction standard).
- **Les sauvegardes.** L'hébergeur sauvegarde chaque jour et permet de revenir à n'importe quel moment des sept derniers jours (vérifié pour la formule simple ; à confirmer pour la formule avec secours). En plus, une copie chiffrée part chaque nuit chez un second prestataire européen, Scaleway (proposé). Ainsi, même une perte totale chez l'hébergeur ne perd pas le jeu.
- **On peut déménager.** Une base PostgreSQL s'exporte et se réinstalle ailleurs, chez Clever Cloud ou Scaleway, en quelques jours de travail (estimation).

### (3) Comment on se connecte

**Ce que c'est.** Les trois voies de D-035 : Apple, Google, ou l'e-mail avec un code à six chiffres.

**Choix proposé.** La connexion est **écrite dans notre propre programme**, avec une bibliothèque libre et courante qui gère ces trois voies. Better Auth, par exemple, propose le code par e-mail, Apple et Google (vérifié). Les comptes restent dans notre base, en Europe. Apple et Google ne voient que le moment de la connexion (D-043). On écarte les services de connexion tout faits (Auth0, Clerk, Firebase, Supabase) : ce sont des sociétés américaines (de mémoire). C'est le surcoût de « quelques jours de travail » déjà annoncé (plan, travail 9).

### (4) Comment part le message de 18h

**Ce que c'est.** Une notification. Sur le web, notre serveur la confie au service d'acheminement du téléphone : celui d'Apple pour un iPhone, celui de Google pour un Android sous Chrome. C'est inévitable, et déjà accepté (D-043).

**Choix proposé.**
- **Le serveur envoie lui-même, sans intermédiaire.** Pas de service d'envoi de notifications comme OneSignal ou Firebase, qui verrait passer la liste des joueurs. Le contenu d'une notification web est chiffré jusqu'au téléphone : Apple et Google ne peuvent pas le lire (de mémoire, norme du web). Envoyer ces messages est gratuit (de mémoire).
- **Un petit programme toujours allumé tient l'horloge.** Vers 17h30, il prépare la révélation. À 18h00, il envoie les messages, ce qui prend une à deux minutes pour 10 000 joueurs (estimation). On n'utilise pas l'outil d'horaires de Scalingo : il ne descend pas sous dix minutes d'intervalle et peut, rarement, sauter une exécution (vérifié). C'est l'exigence « rien ne se calcule à 18h pile » (D-043).
- **Une sonde chez un autre prestataire** vérifie à 18h02 que les messages sont partis et que le site répond. Si ce n'est pas le cas, elle vous prévient (plan, travail 12). Exemple : Hyperping, un service français de surveillance (vérifié). La sonde ne reçoit aucune donnée de joueur.
- **Sur iPhone**, depuis iOS 18.4, Apple propose une forme de notification web plus robuste, réservée aux icônes de l'écran d'accueil (vérifié). Le test du travail 4 dira laquelle des deux formes on retient.

### (5) Les e-mails : le code, et l'avertissement avant effacement

**Choix proposé : l'envoi d'e-mails de Scaleway** (filiale du groupe français Iliad, vérifié). Il est gratuit jusqu'à 300 e-mails par mois, puis coûte 0,25 € les 1 000 (vérifié). Pendant la bêta, cela fait zéro euro.

**Pourquoi pas Brevo**, cité à l'étape 5 ? Société française, mais elle dit loger une partie de ses données et ses sauvegardes chez Google Cloud, en Belgique (vérifié, aide de Brevo). Depuis décembre 2025, un fonds américain, General Atlantic, est aussi entré à son capital ; les sources divergent sur la part qu'il contrôle (vérifié). Or D-043 vise le siège et le contrôle, pas seulement le lieu des serveurs : Brevo n'est pas sûr à ce titre.

### (6) Comment on passe ensuite aux boutiques

**Ce que c'est.** Le même code, « emballé » dans une application pour l'App Store et Google Play (D-005, D-043).

**Choix proposé.**
- **L'emballage : Capacitor**, un outil libre et courant (de mémoire). Ce n'est pas un prestataire : aucune donnée ne passe par ses auteurs.
- **Le reste ne change pas.** Le serveur, la base et les comptes restent les mêmes. Les messages passent par les services d'Apple et de Google, appelés directement, comme sur le web : sur iPhone, l'outil d'emballage utilise directement le service d'Apple, sans Firebase (vérifié, forum des auteurs).
- **La fabrication de la version iPhone** demande un Mac. On loue une machine en ligne le temps de la fabrication (de mémoire). Elle voit le code, jamais une donnée de joueur.
- **Ce qui ne dépend pas de la plateforme** : la question de la structure avant l'App Store (D-042, D-043) et le test fermé de 14 jours chez Google (plan, travail 14).

### Ce qui sort d'Europe sans toucher aux joueurs

**Le code.** Il vit sur GitHub, une société américaine, comme tout le dépôt aujourd'hui. Il ne contient aucune donnée de joueur et aucun mot de passe. D-043 vise ce qui touche aux joueurs : le code n'en fait pas partie, mais l'avocat le verra dans la liste des prestataires (D-044).

**Les agents.** Ils écrivent le code dans des sessions Claude, chez un fournisseur américain d'IA. **Conséquence importante : les agents ne voient jamais la base réelle**, ni des journaux qui contiendraient une donnée de joueur. Sinon, une donnée partirait chez un fournisseur d'IA, ce que D-043 interdit.
- Ils travaillent sur des données d'essai.
- La mise en ligne se fait seule, une fois les tests passés.
- En cas d'incident, c'est vous qui regardez le jeu réel, avec la procédure d'une page.
- C'est pour cela que les journaux techniques ne contiennent rien de personnel (plan, travail 3).

---

## 3. Trois options complètes

Tous les montants sont des **estimations** TVA comprise, par mois, environnement d'essai compris. Ils sont calculés à partir des prix vérifiés quand ils existent ; aucun n'est un devis. Les notifications sont gratuites dans les trois options. Les comptes Apple et Google, la chaîne des textes et votre abonnement Claude n'y figurent pas (plan, partie 6).

| | **A. Hébergeur clé en main (recommandé)** | **B. Cloud européen en briques** | **C. Supabase** |
|---|---|---|---|
| Qui | Scalingo (repli : Clever Cloud), e-mails et copie des sauvegardes chez Scaleway | Tout chez Scaleway (ou OVHcloud) | Hébergé : Supabase Inc. (américain). Auto-hébergé : chez un hébergeur européen |
| Bêta | 40 à 110 € | 50 à 110 € | Auto-hébergé : 40 à 100 € |
| 10 000 joueurs | 150 à 300 € | 150 à 280 € | Auto-hébergé : 70 à 180 € |
| Entretien ajouté au vôtre | Le plus faible : l'hébergeur tient machines et base | Moyen : réseau, droits d'accès, versions de la base à régler soi-même | Lourd : une dizaine de logiciels à mettre à jour soi-même |
| Déménager | Facile : base et programme standards | Facile | Hébergé : possible mais pénible. Auto-hébergé : facile |
| Compatible avec D-043 | Oui | Oui | Hébergé : **non**. Auto-hébergé : oui, au prix de l'entretien |

### A. Un hébergeur « clé en main » français (recommandé)

- **Elle donne** : l'hébergeur entretient les machines, le système et la base, avec sa copie de secours. Les agents n'entretiennent que notre programme. La mise en ligne part toute seule de GitHub quand les tests sont passés (vérifié). En cas d'incident, vous avez un tableau de bord et une page d'état publique de l'hébergeur.
- **Elle coûte** : un peu plus cher que les briques à grande taille, de quelques dizaines d'euros par mois (estimation). Le retour à la version précédente se fait en remettant en ligne une ancienne version du code (vérifié). Il faudra préparer ce geste pour qu'il vous soit faisable seul, sans agent : à vérifier au travail 5.
- **Entretien** (estimation) : les deux à quatre jours par mois du plan (partie 6), surtout pour les mises à jour de notre programme, des règles d'Apple et du format des données de l'Assemblée. Rien pour les machines.
- **Dépendance** : faible. Scalingo et Clever Cloud fonctionnent de la même façon ; passer de l'un à l'autre prend quelques jours (estimation). Surtout, l'icône des joueurs et leur abonnement au message sont liés à **l'adresse du jeu**, pas à l'hébergeur. Tant que le nom de domaine reste le même, à votre nom, un déménagement ne se voit pas des joueurs (de mémoire).
- **Pourquoi Scalingo plutôt que Clever Cloud.** Les deux sont des sociétés françaises.
  - Pour Scalingo : sa formule avec base de secours est décrite clairement (vérifié), et ses machines sont chez un hébergeur français qualifié SecNumCloud par l'Agence nationale de la sécurité des systèmes d'information (vérifié).
  - Pour Clever Cloud : il possède son infrastructure à Paris et publie la liste de ses sous-traitants (vérifié).
  - L'écart est faible : l'équipe tranchera au travail 5, après un petit essai, sans vous solliciter, sauf si le prix diffère nettement.

### B. Un cloud européen « en briques »

- **Elle donne** : tout chez un seul fournisseur, Scaleway ou OVHcloud : serveurs à la demande, base gérée, e-mails, stockage des sauvegardes. Les prix à l'unité sont bas (vérifié pour Scaleway).
- **Elle coûte** : il faut assembler et régler soi-même ce que l'option A fournit d'un bloc : le réseau, les droits d'accès, la mise en ligne, les versions de la base. Cela fait plus de réglages qu'un incident peut dérégler, et un ou deux jours d'entretien de plus par mois (estimation).
- **Dépendance** : faible si l'on reste sur des briques standards.
- **Quand la choisir** : si le jeu devenait très gros. À 10 000 joueurs, l'écart de prix avec A reste de l'ordre de quelques dizaines d'euros par mois (estimation), ce qui ne vaut pas l'entretien en plus.

### C. Supabase : la réponse claire

**Ce que c'est.** Un « tout-en-un » très apprécié : une base PostgreSQL, la connexion par Apple, Google ou e-mail, le cloisonnement ligne par ligne et le stockage de fichiers, prêts à l'emploi. C'est le plus rapide à monter (une à deux semaines gagnées, estimation de l'étape 5).

**Hébergé par Supabase : exclu par D-043.**
- Supabase est une société dont le siège est à San Francisco (vérifié, sources tierces).
- Ses bases européennes tournent chez Amazon Web Services, à Francfort ou à Paris (vérifié, documentation de Supabase).
- La société et son hébergeur sont donc tous deux américains. C'est exactement ce que vous avez écarté en choisissant « prestataires européens seulement » (option « américains avec serveurs en Europe », non retenue).

**Les cousins européens hébergés ne passent pas mieux.**
- Nhost est suédois, mais loge son service chez Amazon (vérifié, sources tierces). Notre lecture de D-043 : un prestataire européen qui confie les données à une société américaine ne respecte pas « siège et contrôle ».
- Eurobase, hébergé chez Scaleway, serait compatible sur le papier. Mais c'est un service très jeune, présenté par son seul fondateur (vérifié, sources tierces) : trop fragile pour garder des opinions.

**Installé par nous chez un hébergeur européen : compatible avec D-043, mais déconseillé.**
- Le logiciel est libre, et l'installer chez Scaleway ou OVHcloud respecte vos choix.
- Supabase le dit lui-même : on devient alors responsable du serveur, des mises à jour, de la base, des sauvegardes, de leur restauration et de la surveillance. Les sauvegardes « à un instant précis » ne sont plus fournies (vérifié).
- Cela fait une douzaine de logiciels à tenir à jour ensemble, avec des changements parfois incompatibles d'une version à l'autre (vérifié).
- Avec des agents seuls et vous comme seul recours le soir (D-043), c'est le plus mauvais pari : une panne du serveur à 18h serait la nôtre, plus celle d'un hébergeur qu'on attend.
- L'économie, de l'ordre de 30 à 120 € par mois (estimation), ne compense pas deux à quatre jours d'entretien de plus par mois (estimation).

**Ce qu'on garde de Supabase.** Ses bonnes idées, qui ne lui appartiennent pas : une base PostgreSQL, le cloisonnement ligne par ligne imposé par la base, une connexion par une bibliothèque libre. L'option A les a toutes.

---

## 4. Ce qui fait pencher : les faits

**Nationalité et contrôle des prestataires.**

| Prestataire | Siège, contrôle | Où sont les machines | Statut du fait |
|---|---|---|---|
| Scalingo | Strasbourg ; fondée en 2015 ; fonds levés auprès d'investisseurs français (dont Bpifrance) ; aucun rachat trouvé | 3DS Outscale (Dassault Systèmes), Paris | Vérifié ; liste de ses sous-traitants non trouvée |
| Clever Cloud | Nantes ; fondée en 2010 | Ses propres machines à Paris ; liste des sous-traitants publiée (2026) | Vérifié ; actionnariat actuel non vérifié |
| Scaleway | Filiale majoritaire du groupe français Iliad (Xavier Niel) | Ses centres en France | Vérifié |
| OVHcloud | Cotée à Paris ; famille Klaba majoritaire (environ 81 % du capital, octobre 2025) | Ses centres | Vérifié |
| Brevo | Paris ; depuis décembre 2025, General Atlantic (américain) et Oakley (britannique) au capital, part contestée selon les sources | En partie sur Google Cloud (Belgique), sauvegardes comprises | Vérifié ; **écarté** |
| Supabase | San Francisco | Amazon Web Services | Vérifié (sources tierces pour le siège) ; **exclu** hébergé |
| Nhost | Stockholm | Amazon Web Services | Vérifié (sources tierces) ; **écarté** |
| Hyperping (sonde) | France | Non vérifié | Vérifié (annuaire tiers) |

**Prix.**
- Scalingo : un serveur de 512 Mo coûte 14,40 € HT par mois. Base formule simple de 512 Mo : 7,20 € HT ; avec secours : 20 € HT ; avec secours, 1 Go : 40 € HT (vérifié).
- Clever Cloud : plus petit serveur 6 € par mois, puis 16 € (grille officielle de 2023, reprise par Clever Cloud ; actualité non vérifiée).
- Scaleway : envoi d'e-mails gratuit jusqu'à 300 par mois, puis 0,25 € les 1 000. Plus petite base gérée environ 11 € HT par mois (calcul de l'équipe sur le tarif horaire vérifié). Serveurs à la demande facturés à la seconde, avec une part gratuite chaque mois (vérifié).
- Compte développeur Apple : environ 99 € par an (de mémoire ; aucune source de 2026 trouvée). Compte Google : 25 $ une fois (vérifié à l'étape 5).

**Fonctionnement.**
- Formule simple de Scalingo : 98 % de disponibilité. Formule avec secours : 99,96 %, relais en 2 à 5 secondes (vérifié).
- L'outil d'horaires de Scalingo : intervalle d'au moins dix minutes, et il « peut, rarement, manquer une exécution » (vérifié). D'où le petit programme toujours allumé.
- Notification web sur iPhone : seulement depuis une icône de l'écran d'accueil (vérifié le 4 octobre, D-005). Forme plus robuste depuis iOS 18.4 (vérifié).

---

## 5. La question à vous poser

C'est le seul choix de cette proposition qui engage vraiment le projet. Il fixe l'entretien, ce qui vous retombe dessus un soir de panne, et un contrat à votre nom pour toute la vie du jeu.

- **Titre :** Plateforme
- **Question :** Sur quelle plateforme le jeu est-il construit et hébergé ?
- **Options :**
  1. **Hébergeur clé en main (Recommandé)** : un hébergeur français entretient machines et base ; le moins d'entretien pour vous, et on peut déménager.
  2. **Cloud européen en briques** : un seul fournisseur, un peu moins cher à grande taille, mais plus de réglages à tenir.
  3. **Supabase installé nous-mêmes** : des briques toutes faites, mais une douzaine de logiciels à entretenir, et une panne de serveur un soir serait pour vous.

Supabase hébergé par Supabase n'est pas proposé : il modifierait D-043.

**Ce que l'équipe décide sans vous** (D-009), pour que vous le sachiez :
- **Le langage** : TypeScript partout, serveur et téléphone. Le moteur de calcul des essais était déjà écrit en JavaScript : il peut servir de référence.
- **L'interface** : React, en application web installable.
- **La base** : PostgreSQL, avec le cloisonnement des cercles imposé par la base.
- **La connexion** : une bibliothèque libre, par exemple Better Auth.
- **L'emballage pour les boutiques** : Capacitor.
- **Les tests automatiques** : partout.

C'est l'outillage le plus courant : un développeur pourra le reprendre (D-043).

---

## 6. Limites

**Ce qui n'est pas connu.**
- **Les faits ont été vérifiés à travers un moteur de recherche**, sans ouvrir les sites eux-mêmes, que l'environnement de travail bloquait. Les prix peuvent avoir changé. Avant chaque dépense, le montant vous sera présenté depuis la page officielle (D-042).
- **Les sous-traitants de Scalingo** n'ont pas été trouvés en ligne. Il faut vérifier, avant de signer, qu'aucun ne voit les données des joueurs. L'avocat relit les contrats des prestataires avant la bêta (D-044).
- **L'actionnariat actuel de Clever Cloud** n'est pas vérifié.
- **La tenue d'un petit hébergeur français un soir de pic.** Des incidents arrivent chez tous. Le test de charge avant l'ouverture et la bêta le diront (plan, partie 5).
- **Les montants à 10 000 joueurs** reposent sur une hypothèse de fréquentation : la moitié des joueurs ouvrent le jeu dans les cinq minutes qui suivent 18h.
- **La connexion par Apple et l'adresse masquée.** Un joueur qui masque son adresse avec Apple reçoit nos e-mails par un relais d'Apple : l'avertissement avant effacement (D-045) passera donc par Apple (de mémoire). C'est une conséquence de D-035, à dire dans « Qui, durée, droits ».
- **Les agents ne voient jamais le jeu réel.** C'est une garantie, mais elle a un prix : un défaut qui n'apparaît qu'avec les vraies données sera plus long à comprendre. Vous ferez le lien, avec des journaux sans donnée personnelle.

**Ce que le test du message de 18h vérifiera** (travail 4, cinq téléphones, trois soirs ; D-005) :
- l'arrivée du message vers 18h sur iPhone depuis l'icône, et sur Android ;
- laquelle des deux formes de notification sur iPhone on retient ;
- la tenue de l'abonnement après des jours sans ouvrir l'icône ;
- la connexion Apple ou Google depuis l'icône, et la reconnexion après l'ajout de l'icône (D-035).

Ce test a besoin du compte Apple (plan, partie 2) et d'un premier petit serveur chez l'hébergeur retenu : c'est la première dépense de plateforme.

**Ce que le travail 5 vérifiera** : une restauration complète depuis la copie chez Scaleway, et le retour à la version précédente fait par vous seul, chronométré, sans agent.

**Décisions antérieures touchées : aucune.** La proposition applique D-005, D-035, D-042, D-043 et D-045. Une précision : les noms cités à l'étape 5 « de mémoire » (plan, travail 5) sont maintenant vérifiés, et Brevo est écarté.

---

## Sources consultées le 11 octobre 2026

*Résultats d'un moteur de recherche. Les pages n'ont pas pu être ouvertes directement.*

- Scalingo : [tarifs](https://scalingo.com/pricing) ; [PostgreSQL géré](https://scalingo.com/databases/postgresql) ; [disponibilité de PostgreSQL](https://doc.scalingo.com/databases/postgresql/about/ha) ; [politique de sauvegarde](https://doc.scalingo.com/databases/backup-policies) ; [régions](https://doc.scalingo.com/platform/internals/regions) ; [hébergement chez 3DS Outscale](https://scalingo.com/blog/new-osc-fr1-region) ; [SecNumCloud](https://scalingo.com/qualification-secnumcloud) ; [outil d'horaires](https://doc.scalingo.com/platform/app/task-scheduling/scalingo-scheduler) ; [programme toujours allumé](https://doc.scalingo.com/platform/app/task-scheduling/custom-clock-processes) ; [mise en ligne depuis GitHub](https://doc.scalingo.com/platform/deployment/deploy-with-github) ; [retour en arrière](https://doc.scalingo.com/platform/app/rollback) ; [levée de fonds](https://www.lemondeinformatique.fr/actualites/lire-paas-le-strasbourgeois-scalingo-leve-3-5-meteuro-94261.html).
- Clever Cloud : [sous-traitants, 2026](https://cdn.clever-cloud.com/uploads/2026/09/sous-traitants-ulterieurs-de-clever-cloud.pdf) ; [nouveautés T4 2025](https://www.clever.cloud/blog/features/2025/12/05/whats-new-on-clever-cloud-q4-2025) ; [grille tarifaire 2023](https://assets.clever-cloud.com/documents/cc-pricing-update062023.pdf) ; [comparatif Heroku](https://www.clever.cloud/clever-cloud-vs-heroku/) ; [fiche société](https://www.manageo.fr/entreprises/524172699.html).
- Scaleway : [tarifs des e-mails](https://scaleway.com/en/pricing/managed-services) ; [envoi d'e-mails](https://www.scaleway.com/fr/transactional-email-tem/) ; [bases gérées](https://www.scaleway.com/en/pricing/managed-databases-pricing/) ; [serveurs à la demande](https://www.scaleway.com/en/pricing/serverless/) ; [filiale d'Iliad](https://en.wikipedia.com/wiki/Online_SAS).
- OVHcloud : [participation de la famille Klaba](https://next.ink/205353/ovhcloud-octave-klaba-reprend-encore-la-direction-revenus-en-hausse-gadin-en-bourse/) ; [cession de décembre 2025](https://www.globenewswire.com/news-release/2025/12/05/3200887/0/en/OVHcloud-Sale-of-shares-by-Deep-Code-SAS.html).
- Brevo : [lieu de stockage des données](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location) ; [levée de décembre 2025, CFNews](https://www.cfnews.net/Acces-libre/Brevo-convertit-un-LBO-bis-550697) ; [French Tech Journal](https://www.frenchtechjournal.com/brevos-eu500m-deal-delivers-historic-liquidity-event-for-french-tech/).
- Supabase : [régions](https://supabase.com/docs/guides/platform/regions) ; [RGPD](https://supabase.com/docs/guides/security/gdpr-compliance) ; [auto-hébergement](https://supabase.com/docs/guides/self-hosting.md) ; [mise à jour en auto-hébergement, WZ-IT](https://wz-it.com/en/knowledge/supabase/update-self-hosted/) ; [siège, Sacra](https://sacra.com/c/supabase/).
- Nhost et Eurobase : [European Purpose, Nhost](https://europeanpurpose.com/tool/nhost) ; [Eurobase, comparatif](https://eurobase.app/blog/managed-eu-alternatives-to-supabase-2026) ; [Eurobase, Indie Hackers](https://www.indiehackers.com/STGim).
- Notifications web sur iPhone : [WebKit, Safari 18.4](https://webkit.org/blog/16574/digital-credentials-api/) ; [WebKit, Declarative Web Push](https://webkit.org/?p=16535).
- Connexion : [Better Auth, code par e-mail](https://better-auth.com/docs/plugins/email-otp.md).
- Emballage : [forum Ionic, notifications Capacitor](https://forum.ionicframework.com/t/capacitor-push-notifications/239316).
- Sonde : [annuaire des services européens de surveillance](https://european-alternatives.eu/category/uptime-monitoring-services).
- Compte Apple : [Consomac, 2020](https://consomac.fr/news-11920-apple-peut-maintenant-offrir-son-programme-developpeur.html) (aucune source de 2026 trouvée).
