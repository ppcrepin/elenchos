# La plateforme du jeu

*Référence de la plateforme retenue (D-048). Back-end, avec Front-end, 11 octobre 2026, révisé après la relecture de Cohérence et votre décision. Il répond à votre question « sur quelle plateforme, Supabase ou autre » (D-047). Aucune ligne de code avant votre accord pour l'étape 6 (D-001).*

*État, 12 octobre 2026 : D-048 inchangé. Mis à jour pour D-054 (point 3), qui modifie D-005 : le jeu se joue sur iPhone seulement, et l'application ira sur l'App Store seul, sans Google Play. Ce qui parlait d'Android et de Google Play est retiré ou corrigé : la limite 4, l'acheminement des messages, le passage à l'App Store et ses messages, ce qui sort d'Europe, le compte Google, l'annexe C. Le reste ne change pas. Report de D-054 relu par Cohérence (compatible avec réserves, corrigées), puis par le Vérificateur (OK avec corrections, appliquées).*

*État, 12 octobre 2026 (avis de Juridique sur Scalingo : quatre constats vérifiés ce jour dans le dépôt public de la documentation de Scalingo, lu par un outil qui résume ; rapport de Cohérence, lignes A3 et C2) : D-048 inchangé, mais des faits sont corrigés, comme D-046 l'a fait pour D-006. (1) L'essai de 30 jours demande une carte bancaire, et la facturation démarre seule ensuite (partie 1, partie 4, annexe B, sources). (2) Les durées des sauvegardes de Scalingo sont connues (annexe A). (3) Ses journaux sont gardés un an, hors de notre main, et le bulletin de sécurité du 12 août 2026 est relevé (annexe E). Le choix de Scalingo tient (avis de Juridique). La question de la carte est posée au porteur (D-0xx, à remplir par l'orchestrateur).*

**Comment lire les faits.**
- **Vérifié** : lu le 11 octobre 2026 sur une page officielle, telle que la restitue un moteur de recherche (l'ouverture directe des sites était bloquée), sauf deux pages ouvertes par l'orchestrateur, signalées dans les sources. Sources en fin de document.
- **Relevé (source tierce)** : lu sur un site qui n'est pas celui de l'entreprise concernée.
- **De mémoire** : ce que savent les agents, à confirmer.
- **Estimation** : l'avis chiffré de l'équipe, pas un devis.

---

## 1. En bref

**La décision.** Le jeu tourne chez **Scalingo**, un hébergeur français « clé en main » : on lui confie notre programme, il entretient lui-même les machines et la base de données. Siège à Strasbourg, machines à Paris chez une filiale de Dassault Systèmes (vérifié). Les e-mails partent par Scaleway (groupe français Iliad), la connexion est écrite dans notre propre code, et notre serveur envoie lui-même le message de 18h.

**Un exemple.** Marie touche l'icône d'Elenchos sur son iPhone. Le jeu, chez Scalingo, lit ses cercles dans la base de données. Elle est reconnue par son compte Apple. Paul, lui, s'est inscrit par e-mail : son code à six chiffres est parti par Scaleway. À 18h, notre serveur leur envoie le message.

**Ce que vous aurez à faire.**
- Ouvrir à votre nom (D-042) trois comptes : Scalingo, Scaleway et la sonde, un service extérieur qui vérifie à 18h02 que les messages sont partis ; plus tard, pour l'App Store, la location d'un Mac (annexe A). Le nom de domaine s'achète après la vérification du nom (D-043, D-047). Votre compte Apple est ouvert (D-047).
- Valider en jouant. Le code des agents part seul vers la **version d'aperçu**, une fois les tests passés. Il n'entre dans la **version en ligne**, celle des joueurs, qu'après votre validation, et jamais de 15h à 19h ni le dimanche (D-043).
- En cas d'incident, regarder vous-même la version en ligne, avec la procédure d'une page (D-043). Vous seul en détenez les mots de passe (proposé).

**Ce que vous paierez** (TVA comprise, détail en annexe B) :
- **construction** : rien de facturé les 30 premiers jours (essai de Scalingo, carte bancaire demandée à l'ouverture : partie 4), puis environ 26 € par mois si une application ou une base existe encore ;
- **bêta** : 41 € par mois au minimum (version en ligne seule), jusqu'à environ 76 € avec la version d'aperçu, plus la sonde (gratuite, ou environ 25 $ par mois, relevé) ;
- **10 000 joueurs** : 150 à 300 € par mois (estimation).

C'est du même ordre que la ligne « hébergement, e-mails et sonde » du plan (partie 6), mais cela commence plus tôt, au test du message de 18h (travail 4). Chaque dépense vous sera présentée au moment venu (D-042).

**Si un soir ça tombe.** À 18h02, la sonde vous alerte. La révélation, préparée d'avance, s'affiche à 18h dans le jeu même si le message tarde (travail 6, horloge du jeu). Il reste les trois cas du plan (partie 4), et un quatrième :
- **Scalingo est en panne** : on attend, rien n'est perdu.
- **Une mise en ligne est fautive** : les mises en ligne sont interdites de 15h à 19h et le dimanche ; un geste revient à la version précédente, et le travail 5 (socle et données) vérifiera que vous pouvez le faire seul.
- **L'envoi a échoué** : un seul geste le relance, conçu pour ne pas envoyer deux fois.
- **La base est perdue ou abîmée** : on la restaure depuis une sauvegarde. Avec de vraies données, c'est un geste à vous seul (limite 3). La procédure d'une page le couvre ; le travail 5 vérifiera que vous le réussissez seul.

Si vous n'êtes pas joignable, le message peut ne partir qu'à votre retour.

---

## 2. La comparaison

Par mois, TVA comprise, version d'aperçu comprise sauf mention.

| | **Scalingo (retenu)** | **Supabase hébergé** | **Supabase installé par nous** |
|---|---|---|---|
| Qui | Société française ; machines chez Dassault Systèmes, Paris | Société américaine ; machines chez Amazon | Logiciel libre, chez un hébergeur européen |
| Construction | 0 € le premier mois (carte demandée), puis environ 26 € | Gratuit, mis en sommeil après une semaine sans activité | Non estimé |
| Bêta | 41 € (version en ligne seule) à 76 €, plus la sonde | 25 $ (environ 22 €), hors version d'aperçu | 40 à 100 € (estimation) |
| 10 000 joueurs | 150 à 300 € (estimation) | Non estimé | 70 à 180 € (estimation) |
| Entretien en plus du vôtre | Le plus faible : Scalingo tient machines et base | Faible | Lourd : une douzaine de logiciels |
| Déménager | Facile | Possible, mais pénible | Facile |
| Compatible avec D-043 | Oui, sous réserve des sous-traitants de Scalingo et de Scaleway (à vérifier avant de signer) | **Non** | Oui, au prix de l'entretien |

---

## 3. Supabase, en un paragraphe

Supabase est un « tout-en-un » très apprécié : base de données, connexion par Apple, Google ou e-mail, cloisonnement des cercles, prêts à l'emploi. Hébergé par Supabase, c'était le plus simple et le moins cher pour commencer : 25 $ par mois en formule Pro, ou une formule gratuite, mise en sommeil après une semaine sans activité (vérifié). Mais c'est une société américaine, à San Francisco (relevé), dont les bases européennes tournent chez Amazon (vérifié) : exactement l'option « sociétés américaines avec serveurs en Europe » que D-043 écarte. Installé par nous chez un hébergeur européen, il respecte D-043, mais il faut tenir à jour une douzaine de logiciels, sans les sauvegardes « à un instant précis » (vérifié). Avec des agents seuls et vous comme seul recours le soir, c'est le plus mauvais pari. Ses bonnes idées ne lui appartiennent pas : Scalingo offre la même base de données, et la connexion s'écrit avec une bibliothèque libre.

---

## 4. Ce que vous avez décidé (D-048)

- **Le jeu est construit chez Scalingo.** Non retenus : Supabase hébergé, qui aurait modifié D-043 ; Supabase installé chez un hébergeur européen, pour son entretien. **D-043 tient.**
- **Laissés à l'équipe** (D-009) : le repli éventuel, Clever Cloud, et les briques techniques (annexe C).
- **Le premier compte Scalingo** s'ouvre pour le test du message de 18h, après votre accord pour l'étape 6. Il commence par l'**essai de 30 jours, avec une carte bancaire demandée à l'ouverture** : une application, une base en formule d'essai. Rien n'est facturé pendant l'essai ; à la fin, **la facturation démarre seule si une application ou une base existe encore**, car Scalingo ne les supprime pas. Pour ne rien payer, il faut tout supprimer avant le 30e jour ; le bouton « Stop free trial » lance la facturation tout de suite. Le passage au payant vous sera présenté avec son montant (D-042), une semaine avant la fin de l'essai au plus tard (proposé par Juridique). *Correction du 12 octobre 2026, sur avis de Juridique (documentation de Scalingo, page de l'essai modifiée le 1er octobre 2026, vérifiée) : nous avions écrit le 11 octobre « sans carte bancaire », et « sans moyen de paiement, l'application est arrêtée puis effacée 30 jours plus tard ». Ces deux phrases sont fausses. La page des prix et le blog de Scalingo, plus anciens, disent encore « sans carte » : l'écran d'ouverture tranchera. C'est un fait corrigé, comme D-046 l'a fait pour D-006, non un changement de décision. La question de la carte est posée au porteur (D-0xx, à remplir par l'orchestrateur).*
- **En bêta, la base est prise « avec secours »** : une seconde copie prend le relais en quelques secondes si la première tombe. Scalingo s'engage alors sur 99,96 % de disponibilité, contre 98 % pour la base simple, soit jusqu'à 14 heures d'arrêt admises par mois (vérifié) : trop pour un rendez-vous quotidien.

---

## 5. Limites

1. **Les sous-traitants.** Notre lecture de D-043 : un prestataire européen qui confie les données des joueurs à une société non européenne ne respecte pas « siège et contrôle ». C'est ce qui écarte Brevo (annexe D). À vérifier avant de signer : les sous-traitants de Scalingo, introuvables en ligne, et son actionnariat actuel ; ceux de Scaleway pour les e-mails, qui dit tout traiter en Europe mais admet de rares partenaires américains ou canadiens (vérifié) ; le pays de la sonde, qui ne reçoit pourtant aucune donnée de joueur. L'avocat relit les contrats avant la bêta (D-044).
2. **Les faits viennent d'un moteur de recherche**, sans ouvrir les sites. Les prix peuvent avoir changé : avant chaque dépense, le montant vous sera présenté depuis la page officielle (D-042).
3. **Les agents ne voient jamais la base réelle**, ni des journaux qui contiendraient une donnée de joueur : ils travaillent chez un fournisseur américain d'IA, et D-043 interdit d'y envoyer une donnée de joueur. Précision de D-043, point 3 (consignée par D-048), à faire relire par Juridique. Quatre règles en découlent :
   - **les totaux anonymes** de la bêta (part de « aucune », D-027 ; mesures sur les gestes) : un agent peut-il les lire, au-dessus d'un seuil ? À trancher avec Juridique ; d'ici là, vous êtes leur seul lecteur ;
   - **la restauration** se répète sur des données inventées ; avec de vraies données, c'est un geste à vous seul ;
   - **la version d'aperçu** n'est jamais remplie avec une copie de la base réelle ;
   - **vos propres réponses** dans la version en ligne sont des données de joueur : elles ne se montrent pas aux agents.

   Le prix : un défaut qui n'apparaît qu'avec les vraies données sera plus long à comprendre.
4. **Le test du message de 18h** (travail 4 ; D-005 ; sur cinq iPhone, D-054) dira si le message arrive sur iPhone depuis l'icône, quelle forme de notification garder, si l'abonnement tient après des jours sans ouvrir l'icône, et si la connexion Apple ou Google tient depuis l'icône (D-035).
5. **L'adresse masquée d'Apple.** Un joueur qui masque son adresse reçoit nos e-mails par un relais d'Apple : l'avertissement avant effacement (D-045) passera par Apple (de mémoire). À dire dans « Qui, durée, droits ».
6. **Les coûts.** À 10 000 joueurs, on suppose que la moitié ouvrent le jeu dans les cinq minutes après 18h. La location d'un Mac pour fabriquer la version iPhone (annexe A) est une dépense nouvelle, à ajouter au plan (partie 6), non chiffrée.

---

## Décisions antérieures touchées

Aucune n'est modifiée par ce document ; il applique D-005 (modifié depuis par D-054 : l'iPhone seulement, l'App Store seul), D-027, D-035, D-042, D-043, D-045, D-047, D-048 et D-054. Cinq précisions :
- **D-043, point 3, étendu aux agents qui codent**, avec les quatre règles de la limite 3 (consigné par D-048 ; à relire par Juridique) ;
- **D-043, « siège et contrôle »**, lu comme couvrant les sous-traitants qui détiennent les données (limite 1) ;
- **D-027 (part de « aucune »)** nomme Contenu comme lecteur ; en attendant l'avis de Juridique, vous en êtes le seul lecteur (limite 3) ;
- **le plan, partie 6** : l'hébergement commence au travail 4, non au travail 5 ;
- **le plan, travail 5** : l'hébergeur est choisi par D-048 ; les noms cités de mémoire à l'étape 5 sont vérifiés, et Brevo est écarté.

---

# Annexes

## A. Les briques, une par une

**Où tourne le jeu.** Deux morceaux. Dans le téléphone, une application web installable : une page qu'on ajoute à l'écran d'accueil et qui s'ouvre comme une application. C'est la forme des deux essais, qui a tenu sur votre iPhone (D-019). Sur un serveur Scalingo, le programme qui garde les règles et juge les devinettes. Deux versions : la version en ligne, celle des joueurs, et la version d'aperçu, où vous validez en jouant (plan, partie 4). Côté téléphone (Front-end) : les polices Alegreya sont servies par le jeu lui-même, pas par Google Fonts, et aucun outil de mesure extérieur n'est chargé (plan, travail 3).

**Où sont gardées les données.** Une base de données PostgreSQL, la plus courante pour ce type de service, gérée par Scalingo. Elle garde les comptes, les cercles, les réponses et les titres.
- **Le cloisonnement des cercles est imposé par la base elle-même** (plan, travail 5). La base refuse de montrer une réponse à qui n'est pas du cercle, même si une requête oublie son filtre, à condition que le programme lui transmette la bonne identité (de mémoire, fonction standard de PostgreSQL).
- **Les sauvegardes.** Scalingo sauvegarde chaque jour (vérifié). Sur le plus petit plan, les sauvegardes programmées sont gardées 7 jours, plus une par semaine pendant 4 semaines ; le retour à n'importe quel instant des sept derniers jours existe aussi sur ce plan, grâce à une copie continue des changements (vérifié le 12 octobre 2026, avis de Juridique, qui corrige un « de mémoire » du 11 octobre : nous le disions réservé à la base avec secours). Les durées des autres formules, dont celle de la bêta, ne sont pas relues : à confirmer avant de compter dessus. En plus, une copie chiffrée part chaque nuit chez Scaleway (proposé) : même une perte totale chez Scalingo ne coûterait au plus qu'une journée de réponses.
- **Leur durée de conservation.** Un compte effacé doit disparaître aussi des sauvegardes (plan, travail 3 : « l'effacement est réel »). La copie chez Scaleway serait gardée 30 jours (proposé, à confirmer). Chez Scalingo, plus petit plan (vérifié le 12 octobre 2026, avis de Juridique) : après la suppression de la base, les sauvegardes programmées « expirent progressivement » et survivent jusqu'à quatre semaines ; les sauvegardes manuelles restent un mois ; la copie continue de 7 jours part avec la base. Conséquences : vider une base ne suffit pas à l'effacer, il faut la supprimer ; une sauvegarde manuelle de données réelles survivrait un mois à la base, à écarter ou à compter dans la durée (à caler avec Juridique). Les durées sont à caler dans l'analyse d'impact (D-045, dernier alinéa ; `docs/etape-6/donnees.md`, P-32).
- **On peut déménager.** Une base PostgreSQL s'exporte et se réinstalle ailleurs, chez Clever Cloud ou Scaleway, en quelques jours de travail (estimation).

**Comment on se connecte.** Les trois voies de D-035 : Apple, Google, ou l'e-mail avec un code à six chiffres. La connexion est écrite dans notre propre programme, avec une bibliothèque libre et courante ; Better Auth, par exemple, gère le code par e-mail, Apple et Google (vérifié). Les comptes restent dans notre base, en Europe. Apple et Google ne voient que le moment de la connexion (D-043). Les services de connexion tout faits (Auth0, Clerk, Firebase, Supabase) sont écartés : ce sont des sociétés américaines (de mémoire). C'est le surcoût de « quelques jours de travail » déjà annoncé (plan, travail 9).

**Comment part le message de 18h.**
- Sur le web, notre serveur confie le message au service d'acheminement du téléphone : celui d'Apple, puisque le jeu se joue sur iPhone seulement (D-054). C'est inévitable, et accepté (D-043). Le contenu d'une notification web est chiffré jusqu'au téléphone : Apple ne peut pas le lire (de mémoire, norme du web). L'envoi est gratuit (de mémoire).
- Pas de service d'envoi intermédiaire comme OneSignal ou Firebase, qui verrait passer la liste des joueurs.
- La révélation est préparée d'avance et seulement rendue visible à 18h ; la manière se fixe au travail 6. À 18h, un petit programme qui tourne en permanence et tient l'horloge envoie les messages, en une à deux minutes pour 10 000 joueurs (estimation). Pour les titres du dimanche, que le plan calcule aujourd'hui à 18h, l'exigence « rien ne se calcule à 18h pile » (D-043) reste à prouver (travail 6).
- On n'utilise pas l'outil d'horaires de Scalingo : il ne descend pas sous dix minutes d'intervalle et peut, rarement, sauter une exécution (vérifié).
- **La sonde**, chez un autre prestataire, vérifie à 18h02 que les messages sont partis et que le site répond ; sinon, elle vous prévient (plan, travail 12). Exemple : Hyperping, présenté comme français (relevé, source tierce). Elle ne reçoit aucune donnée de joueur.
- Sur iPhone, depuis iOS 18.4, Apple propose une forme de notification web plus robuste, réservée aux icônes de l'écran d'accueil (vérifié). Le test du travail 4 dira laquelle des deux formes on garde.

**Les e-mails** (le code, l'avertissement avant effacement) : l'envoi d'e-mails de Scaleway, gratuit jusqu'à 300 e-mails par mois, puis 0,25 € les 1 000 (vérifié). Pendant la bêta, zéro ou quelques centimes.

**Le passage à l'App Store** (D-005, D-043 ; l'App Store seul, sans Google Play, D-054). Le même code, « emballé » dans une application pour l'App Store.
- L'emballage : Capacitor, un outil libre et courant (de mémoire). Ce n'est pas un prestataire : aucune donnée ne passe par ses auteurs.
- Le serveur, la base et les comptes ne changent pas.
- **Les messages, eux, changent de régime.** Dans une application, le message passe par le service d'Apple, qui peut en lire le texte, contrairement au web (de mémoire). Capacitor utilise directement le service d'Apple, sans Firebase (relevé, forum Ionic). Le message ne cite aucun nom, sauf l'annonce d'arrivée faite au créateur d'un cercle (plan, travail 3), dont le texte est à revoir avec Juridique. Chiffrer nous-mêmes le texte dans l'application reste possible (de mémoire), à examiner au travail 14.
- La fabrication de la version iPhone demande un Mac. On loue une machine en ligne le temps de la fabrication (de mémoire). Elle voit le code, jamais une donnée de joueur.
- Ne dépend pas de la plateforme : la question de la structure avant l'App Store (D-042, D-043). Le test fermé de 14 jours chez Google tombe avec Google Play (D-054).

**Ce qui sort d'Europe.**
- Touchant aux joueurs, et accepté par D-043 : la connexion par Apple ou Google ; l'acheminement des messages de 18h, par Apple seul depuis D-054 (illisible sur le web, lisible dans l'application, ci-dessus).
- Sans toucher aux joueurs : le code, sur GitHub (société américaine), sans aucune donnée de joueur ni mot de passe ; l'avocat le verra dans la liste des prestataires (D-044). Les sessions des agents, chez un fournisseur américain d'IA, sans aucune donnée de joueur (partie 5, limite 3).

## B. Les coûts, poste par poste

Prix Scalingo vérifiés, hors taxes (HT), par mois : serveur de 512 Mo, 14,40 € ; base simple de 512 Mo, 7,20 € ; base avec secours de 512 Mo, 20 € ; base avec secours de 1 Go, 40 €. Petit serveur de 256 Mo : 0,01 € de l'heure, soit 7,20 € par mois (relevé, source tierce). TVA : 20 %.

**Construction** (pas de joueurs : une seule version, celle d'aperçu ; l'horloge tourne dans le même serveur, proposé) :
- les 30 premiers jours : 0 € pendant l'essai, mais carte bancaire demandée et facturation automatique ensuite si une application ou une base existe encore (vérifié le 12 octobre 2026, avis de Juridique ; le 11 octobre, nous écrivions « essai gratuit » sans cette condition) ;
- ensuite : serveur 14,40 + base simple 7,20 = 21,60 € HT, soit **25,92 € TTC, environ 26 €**.

**Bêta** (version en ligne avec base de secours, plus la version d'aperçu) :

| Poste | HT par mois | Statut |
|---|---|---|
| Serveur du jeu, 512 Mo | 14,40 € | Vérifié |
| Base avec secours, 512 Mo | 20,00 € | Vérifié |
| **Minimum : version en ligne, horloge dans le même serveur** | **34,40 € HT, soit 41,28 € TTC** | |
| Horloge dans un petit serveur à part, 256 Mo (plus sûr) | 7,20 € | Relevé (source tierce) |
| Version d'aperçu : serveur 512 Mo et base simple | 21,60 € | Vérifié |
| **Haut de fourchette** | **63,20 € HT, soit 75,84 € TTC** | |
| E-mails Scaleway | 0 € sous 300 par mois | Vérifié |
| Copie nocturne des sauvegardes chez Scaleway | Moins de 1 € | Estimation |
| Sonde | Gratuite, ou environ 25 $ par mois selon la formule | Relevé (sources tierces discordantes) |

Si la base de 512 Mo ne suffit pas en bêta, la base avec secours de 1 Go ajoute 20 € HT, soit 24 € TTC.

**À 10 000 joueurs : 150 à 300 € par mois** (estimation : plusieurs serveurs pour le pic de 18h, une base plus grande). Le plan dit 150 à 400 € (partie 6).

**Concordance avec le plan (partie 6).** Le plan compte 200 à 600 € sur six mois, soit 33 à 100 € par mois, « dès le socle (travail 5) ». Nos montants sont du même ordre : 26 € par mois en construction, 41 à 76 € en bêta, plus la sonde. Deux écarts : l'hébergement commence au travail 4, avec un premier mois sans facture (essai, carte demandée) ; si la construction dure plus de six mois, environ 26 € par mois s'ajoutent, ce que le plan prévoit (« quelques dizaines d'euros par mois »). La location d'un Mac est à ajouter, non chiffrée.

**Autres prix.**
- Supabase : formule Pro à 25 $ par mois ; formule gratuite mise en sommeil après une semaine sans activité (vérifié).
- Clever Cloud : plus petit serveur 6 € par mois, puis 16 € (grille officielle de 2023 ; actualité non vérifiée).
- Scaleway : plus petite base gérée environ 11 € HT par mois (calcul de l'équipe sur le tarif horaire vérifié) ; serveurs à la demande facturés à la seconde, avec une part gratuite chaque mois (vérifié).
- Compte développeur Apple : environ 99 € par an (de mémoire ; déjà ouvert, D-047). Compte Google Play : plus prévu (D-054).

## C. Ce que l'équipe décide sans vous (D-009)

- **Le langage** : TypeScript partout, serveur et téléphone. Le moteur de calcul des essais, écrit en JavaScript, peut servir de référence.
- **L'interface** : React, en application web installable.
- **La base** : PostgreSQL, avec le cloisonnement des cercles imposé par la base.
- **La connexion** : une bibliothèque libre, par exemple Better Auth.
- **L'emballage pour l'App Store** : Capacitor.
- **Les tests automatiques** : partout.
- **Le repli** : Clever Cloud, si Scalingo venait à manquer (D-048).

C'est un outillage parmi les plus courants : un développeur pourra le reprendre (D-043).

## D. Les autres options examinées

**Un cloud européen « en briques »** (tout chez Scaleway ou OVHcloud : serveurs, base gérée, e-mails, stockage). Prix à l'unité bas (vérifié pour Scaleway). Mais il faut assembler et régler soi-même ce que Scalingo fournit d'un bloc : le réseau, les droits d'accès, la mise en ligne, les versions de la base. Cela fait un ou deux jours d'entretien de plus par mois (estimation). En bêta, il ne coûte pas moins (50 à 110 €, estimation) ; à 10 000 joueurs, l'écart est de 0 à 20 € par mois (150 à 280 €, estimation). Il ne vaut l'entretien en plus que si le jeu devenait très gros.

**Clever Cloud**, le repli. Société française, à Nantes. Il possède ses machines à Paris et publie la liste de ses sous-traitants (vérifié). Scalingo l'emporte de peu : sa base avec secours est décrite clairement (vérifié), et ses machines sont chez 3DS Outscale, hébergeur qui détient, de mémoire, la qualification SecNumCloud pour certaines offres (label de sécurité de l'Agence nationale de la sécurité des systèmes d'information) ; les formules retenues ici n'en relèvent probablement pas, à confirmer. C'est un signe de sérieux de l'hébergeur, pas une garantie pour le jeu. Les deux fonctionnent de la même façon ; passer de l'un à l'autre prend quelques jours (estimation). L'icône des joueurs et leur abonnement au message sont liés à l'adresse du jeu, pas à l'hébergeur : tant que le nom de domaine reste à votre nom, un déménagement ne se voit pas (de mémoire).

**Nhost**, suédois, mais qui loge son service chez Amazon (relevé, source tierce) : écarté par notre lecture de D-043 (partie 5, limite 1).

**Eurobase**, hébergé chez Scaleway, serait compatible sur le papier. Mais c'est un service très jeune, présenté par son seul fondateur (relevé, source tierce) : trop fragile pour garder des opinions.

**Supabase installé par nous : le détail.** Supabase le dit lui-même : on devient responsable du serveur, des mises à jour, de la base, des sauvegardes, de leur restauration et de la surveillance (vérifié). Les douze logiciels changent parfois de façon incompatible d'une version à l'autre (relevé, source tierce). Une panne du serveur à 18h serait la nôtre, en plus de celles d'un hébergeur qu'on attend. L'économie : aucune en bêta, environ 80 à 120 € par mois à 10 000 joueurs (estimation), contre deux à quatre jours d'entretien de plus par mois (estimation). Le gain de temps de construction, « une à deux semaines », était estimé à l'étape 5 pour toute l'option « sociétés américaines avec serveurs en Europe », pas pour Supabase en particulier.

**Brevo**, cité à l'étape 5 pour les e-mails. Écarté parce qu'une partie de ses données et de ses sauvegardes est chez Google Cloud, en Belgique (vérifié, aide de Brevo) : un sous-traitant américain, ce que notre lecture de D-043 exclut. Point secondaire : depuis décembre 2025, General Atlantic (américain) est entré à son capital ; un contrôle n'est pas établi, les sources divergent sur sa part (relevé, sources tierces).

## E. Les faits sur les prestataires

| Prestataire | Siège, contrôle | Où sont les machines | Statut |
|---|---|---|---|
| Scalingo | Strasbourg ; fondée en 2015 ; fonds levés auprès d'investisseurs français, dont Bpifrance ; aucun rachat trouvé | 3DS Outscale (Dassault Systèmes), Paris | Machines : vérifié. Capital : relevé (article ancien) ; actionnariat actuel et sous-traitants non trouvés |
| Clever Cloud | Nantes ; fondée en 2010 | Ses propres machines à Paris ; sous-traitants publiés (2026) | Vérifié ; actionnariat actuel non vérifié |
| Scaleway | Filiale majoritaire du groupe français Iliad | Ses centres en France ; e-mails traités en Europe, rares partenaires américains ou canadiens possibles | Filiale : relevé (source tierce). E-mails : vérifié |
| OVHcloud | Cotée à Paris ; famille Klaba majoritaire (environ 81 %, octobre 2025) | Ses centres | Relevé (sources tierces) |
| Brevo | Paris ; General Atlantic et Oakley au capital depuis décembre 2025, part discutée | En partie chez Google Cloud (Belgique), sauvegardes comprises | Machines : vérifié. Capital : relevé. **Écarté** |
| Supabase | San Francisco | Amazon Web Services | Siège : relevé. Machines : vérifié. **Non retenu** (D-048) |
| Nhost | Stockholm | Amazon Web Services | Relevé (source tierce). **Écarté** |
| Hyperping (sonde) | France | Non trouvé | Relevé (annuaire tiers) |

**Fonctionnement vérifié.**
- Base simple de Scalingo : 98 % de disponibilité. Base avec secours : 99,96 %, relais en 2 à 5 secondes.
- Outil d'horaires de Scalingo : intervalle d'au moins dix minutes ; il « peut, rarement, manquer une exécution ».
- Mise en ligne depuis GitHub et retour à une version précédente du code : prévus par Scalingo.
- Notification web sur iPhone : seulement depuis une icône de l'écran d'accueil (vérifié le 4 octobre, D-005) ; forme plus robuste depuis iOS 18.4.
- Journaux (vérifié le 12 octobre 2026, page des journaux de la documentation de Scalingo, avis de Juridique) : Scalingo garde tous ses journaux un an, par obligation légale selon lui, y compris une trace des connexions dont la documentation ne décrit pas le contenu (hypothèse de Juridique, non vérifiée : l'adresse internet et l'heure). Ni vous ni les agents ne pouvez l'effacer, et la documentation n'indique pas comment supprimer les journaux. Conséquence pour la bêta : `docs/etape-6/donnees.md`, P-07.
- **Incident de sécurité chez Scalingo.** *Vérifié* (bulletin SSB-2026-004 du 12 août 2026, lu le 12 octobre 2026 dans le dépôt de la documentation de Scalingo, avis de Juridique) : une faille critique de Metabase, outil d'analyse interne de Scalingo, a exposé à partir du 8 août des données de la relation client d'environ 90 000 personnes (identité, coordonnées, compte, facturation limitée, noms des applications et des bases), CNIL avertie le 11 août, clients informés le 12. *Rapporté, non vérifié* : « aucune trace d'accès aux applications ni aux bases des clients » est la seule parole de Scalingo, et la presse parle d'une exploitation de la même faille jusque dans des administrations. Le choix de Scalingo tient (avis de Juridique : l'incident touche la relation client, non l'hébergement ; D-048 et D-043 intacts).

## F. Autres limites

- **Le dépôt GitHub est public aujourd'hui.** Le code de la version en ligne doit-il y rester ? À voir avec Juridique et Back-end, sans question à vous à ce stade (D-009).
- **Une structure future** (D-042, D-043) : les contrats à votre nom (Scalingo, Scaleway, domaine) devraient lui être transférés. Leur transférabilité est à vérifier.
- **La tenue d'un petit hébergeur français un soir de pic.** Des incidents arrivent chez tous. Le test de charge avant l'ouverture et la bêta le diront (plan, partie 5).

---

## Sources consultées le 11 octobre 2026

*Résultats d'un moteur de recherche. Les pages n'ont pas pu être ouvertes directement.*

- Scalingo : [tarifs](https://scalingo.com/pricing) (essai gratuit, prix) ; [PostgreSQL géré](https://scalingo.com/databases/postgresql) ; [disponibilité de PostgreSQL](https://doc.scalingo.com/databases/postgresql/about/ha) ; [politique de sauvegarde](https://doc.scalingo.com/databases/backup-policies) ; [régions](https://doc.scalingo.com/platform/internals/regions) ; [hébergement chez 3DS Outscale](https://scalingo.com/blog/new-osc-fr1-region) ; [SecNumCloud](https://scalingo.com/qualification-secnumcloud) ; [outil d'horaires](https://doc.scalingo.com/platform/app/task-scheduling/scalingo-scheduler) ; [programme d'horloge](https://doc.scalingo.com/platform/app/task-scheduling/custom-clock-processes) ; [mise en ligne depuis GitHub](https://doc.scalingo.com/platform/deployment/deploy-with-github) ; [retour en arrière](https://doc.scalingo.com/platform/app/rollback) ; [accord de traitement des données](https://roadmap.scalingo.com/data-processing-agreement) ; blog de Scalingo (fin de l’essai gratuit, vérifié par l’orchestrateur ; **mis en défaut le 12 octobre 2026** : la documentation de l’essai, modifiée le 1er octobre, demande une carte) ; [levée de fonds, Le Monde Informatique](https://www.lemondeinformatique.fr/actualites/lire-paas-le-strasbourgeois-scalingo-leve-3-5-meteuro-94261.html) ; [prix du serveur de 256 Mo, FitGap](https://us.fitgap.com/products/009392/scalingo).
- Clever Cloud : [sous-traitants, 2026](https://cdn.clever-cloud.com/uploads/2026/09/sous-traitants-ulterieurs-de-clever-cloud.pdf) ; [nouveautés T4 2025](https://www.clever.cloud/blog/features/2025/12/05/whats-new-on-clever-cloud-q4-2025) ; [grille tarifaire 2023](https://assets.clever-cloud.com/documents/cc-pricing-update062023.pdf) ; [comparatif Heroku](https://www.clever.cloud/clever-cloud-vs-heroku/) ; [fiche société](https://www.manageo.fr/entreprises/524172699.html).
- Scaleway : [tarifs des e-mails](https://scaleway.com/en/pricing/managed-services) ; [envoi d'e-mails](https://www.scaleway.com/fr/transactional-email-tem/) ; [questions fréquentes sur les e-mails](https://www.scaleway.com/en/docs/transactional-email/faq/) ; [sous-traitants](https://scaleway.com/en/subprocessorlist) ; [bases gérées](https://www.scaleway.com/en/pricing/managed-databases-pricing/) ; [serveurs à la demande](https://www.scaleway.com/en/pricing/serverless/) ; [filiale d'Iliad](https://en.wikipedia.com/wiki/Online_SAS).
- OVHcloud : [participation de la famille Klaba](https://next.ink/205353/ovhcloud-octave-klaba-reprend-encore-la-direction-revenus-en-hausse-gadin-en-bourse/) ; [cession de décembre 2025](https://www.globenewswire.com/news-release/2025/12/05/3200887/0/en/OVHcloud-Sale-of-shares-by-Deep-Code-SAS.html).
- Brevo : [lieu de stockage des données](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location) ; [levée de décembre 2025, CFNews](https://www.cfnews.net/Acces-libre/Brevo-convertit-un-LBO-bis-550697) ; [French Tech Journal](https://www.frenchtechjournal.com/brevos-eu500m-deal-delivers-historic-liquidity-event-for-french-tech/).
- Supabase : [tarifs](https://supabase.com/pricing) (formule Pro, mise en sommeil de la formule gratuite ; vérifié par l’orchestrateur) ; [régions](https://supabase.com/docs/guides/platform/regions) ; [RGPD](https://supabase.com/docs/guides/security/gdpr-compliance) ; [auto-hébergement](https://supabase.com/docs/guides/self-hosting.md) ; [mise à jour en auto-hébergement, WZ-IT](https://wz-it.com/en/knowledge/supabase/update-self-hosted/) ; [siège, Sacra](https://sacra.com/c/supabase/).
- Nhost et Eurobase : [European Purpose, Nhost](https://europeanpurpose.com/tool/nhost) ; [Eurobase, comparatif](https://eurobase.app/blog/managed-eu-alternatives-to-supabase-2026) ; [Eurobase, Indie Hackers](https://www.indiehackers.com/STGim).
- Notifications web sur iPhone : [WebKit, Declarative Web Push](https://webkit.org/?p=16535).
- Connexion : [Better Auth, code par e-mail](https://better-auth.com/docs/plugins/email-otp.md).
- Emballage : [forum Ionic, notifications Capacitor](https://forum.ionicframework.com/t/capacitor-push-notifications/239316).
- Sonde : [annuaire des services européens de surveillance](https://european-alternatives.eu/category/uptime-monitoring-services) ; [prix d'Hyperping, Toolradar](https://toolradar.com/tools/hyperping/pricing).
