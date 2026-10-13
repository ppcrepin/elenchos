# Le test du message de 18h : préparation

*État, 13 octobre 2026 : **mis à jour pour D-057, en relecture.** D-057 (point 4) modifie D-054 (points 1 et 3) : le test se fait **sur votre seul iPhone (T1)** ; plus de prêteurs, de note aux prêteurs, de séance d'installation ni de liste « qui a quel téléphone ». D-057 (point 2 et précision du même jour) : le domaine **elenchos.fr** est acheté avant la mise en ligne ; il remplace l'adresse de Scalingo pour la page, Apple et Google, et D-057 (point 2) précise D-054 (point 2, « on vous redemande avant d'acheter un domaine ») : le domaine est maintenant voulu. La connexion par e-mail n'est pas dans ce test (plan, travail 4 : seuls Google et Apple y sont essayés) ; D-057 (point 3) la garde pour la version de test du jeu. Ce que cette mise à jour ajoute sans décision de votre part est marqué « (proposé) » quand c'est un choix de l'équipe, « (application de D-057) » quand c'est la seule conséquence directe.*

*Étape 6, travail 4 de `docs/plan-construction.md` (partie 4). Back-end et Front-end, 12 octobre 2026. Validé en entier par D-054 (« Je valide tout ») ; mis à jour le même jour pour l'iPhone seulement (D-054, point 3), relu par Cohérence puis par le Vérificateur ; mis à jour le 13 octobre pour D-057. Avis de Juridique du 12 octobre intégré ; ce qui en tombe sans prêteur est dit en partie 5.*

**Comment lire les faits.**
- **Vérifié** : lu sur la page officielle du prestataire, soit ouverte directement, soit telle que la restitue un moteur de recherche (l'ouverture directe de plusieurs sites est bloquée depuis l'environnement). Les sources, la date et la manière dont chacune a été lue sont en fin de document.
- **Relevé** : lu sur un site qui n'est pas celui du prestataire (presse, comparatif, forum).
- **De mémoire** : ce que savent les agents, à confirmer.
- **Estimation** : l'avis chiffré de l'équipe, pas un devis.

---

## En bref

**Le test.** Page nue en icône sur votre iPhone : le message arrive-t-il vers 18h trois soirs de suite, et la connexion Google et Apple tient-elle depuis l'icône ? Premier code : tout le jeu en dépend. Sinon, question pour vous (D-035).

**Fini quand** (application de D-057) : sur votre iPhone, depuis l'icône, le message de 18h est reçu avant 18h05 trois soirs de suite ; les connexions Google et Apple réussissent depuis l'icône et la session tient jusqu'au soir 3 ; puis l'effacement est fait et vérifié. Les iPhone plus anciens ne seront connus qu'avec les vrais joueurs, à qui l'on demandera leur version d'iOS (D-057, point 4).

**Vous faites**, à votre nom, sans mot de passe confié (D-048), environ 3 h 30 en tout : acheter elenchos.fr et le brancher ; ouvrir Scalingo, régler Google et Apple ; donner par écrit, la veille, votre feu vert pour la mise en ligne (D-054) ; installer votre iPhone ; deux minutes par soir ; l'effacement.

**Dépenses : environ 6 € TTC**, le domaine elenchos.fr la première année (relevé ; environ 9,35 € TTC par an ensuite), présenté ici avant l'achat (D-042, D-057). Scalingo 0 € (essai ; carte demandée, facturation automatique si rien n'est supprimé avant le 30e jour, D-055). Aucun téléphone acheté. **Durée : six jours** à partir du jour 0, le jour où vous achetez le domaine (au plus tôt le mardi 13 octobre). Avant la mise en ligne, l'équipe fait relire le code ; deux choses peuvent faire glisser les dates : votre feu vert écrit de la veille, et la disponibilité d'elenchos.fr (partie 7).

**Toujours en place (D-054, point 1)** : la branche `mise-en-ligne`, jamais de 15h à 19h ni le dimanche (détail en partie 3) ; l'effacement le lendemain du soir 3, vérifié (partie 5).

---

## 1. Le test, soir par soir

### Ce que voit votre iPhone

La page du test n'est pas le jeu. Elle tient sur un écran et dit seulement trois choses :
- si elle est ouverte depuis l'icône ;
- si les messages sont autorisés ;
- si l'on est connecté, et par qui (Apple ou Google), sans jamais afficher l'adresse e-mail.

On y trouve trois boutons : « Continuer avec Google », « Recevoir le message de 18h » et « Continuer avec Apple ». Ses textes sont écrits par Front-end et relus mot à mot par UX (12 octobre 2026). Le message lui-même est neutre : « Test, soir 1 sur 3 » (puis 2, puis 3). Ce n'est pas un texte du jeu (D-014). La page ne montre aucun texte de l'Assemblée et ne recueille aucun avis (condition 1 de Juridique, partie 5).

La page vit à l'adresse **`test18h.elenchos.fr`** (proposé), pas à `elenchos.fr` : elle est jetable, et son icône, ses réglages et son abonnement ne doivent pas occuper l'adresse du jeu. Une telle adresse se branche à Scalingo par une entrée simple (CNAME) ; l'adresse nue `elenchos.fr` demande une entrée « ALIAS » ou « ANAME » que le registraire doit accepter, sinon des entrées « A » que Scalingo déconseille (partie 3). Que OVHcloud n'accepte pas l'entrée « ALIAS » ou « ANAME » est de mémoire, à vérifier : son site n'a pas pu être ouvert.

### Le calendrier du test

**Jour de mise en ligne, « soir 0 » (répétition).** Sur votre iPhone, dans l'ordre :
1. ouvrir le lien dans Safari ;
2. s'y connecter avec Google, avec votre compte (proposé : sans prêteur, plus besoin d'un compte de test), comme le ferait un invité après sa première révélation (D-005, condition 1) ;
3. ajouter la page à l'écran d'accueil, l'ouvrir depuis l'icône, et s'y reconnecter si elle le demande ;
4. toucher « Recevoir le message de 18h », taper le code d'essai T1, que vous seul détenez, puis accepter. Sans code, la page refuse l'abonnement. La page porte une demande de non-référencement, comme celle de l'essai (D-019) ;
5. se connecter avec Apple, depuis l'icône, avec votre compte Apple ;
6. envoyer un message d'essai immédiat depuis votre page de résultats, pour vérifier tout de suite.

Environ quinze minutes. À 18h, un premier envoi sert de répétition : il ne compte pas.

**Soir 1.** À 18h00, le serveur envoie le message à votre iPhone.

**Soir 2.** Vous n'avez pas rouvert l'icône depuis la veille : c'est exprès. On vérifie que l'abonnement tient sans qu'on ouvre l'icône (`docs/plateforme.md`, limite 4). La page est faite pour qu'un toucher sur le message n'ouvre rien d'elle-même ; mais iOS peut ouvrir l'icône de lui-même au toucher, et la seconde forme l'ouvre toujours : on lit donc le message sans appuyer dessus.

**Soir 3.** Même règle. En plus, vous éteignez puis rallumez l'iPhone avant 18h, comme il arrive dans la vraie vie ; après 18h, ce redémarrage fausserait la mesure. Après le message, on ouvre enfin l'icône : est-on toujours connecté, trois jours plus tard ?

Entre deux soirs, vous vous servez de votre iPhone comme d'habitude. On ne touche à aucun réglage de batterie ni de concentration : on veut savoir ce qui arrive dans des conditions ordinaires. On note seulement ces réglages à l'installation (liste de contrôle).

### Ce qu'on mesure

Pour chaque soir, la page de résultats, que vous seul ouvrez, montre les trois premières choses ; la quatrième, c'est vous qui la notez :
1. **L'heure d'envoi** par notre serveur, et la réponse du service d'acheminement d'Apple, le seul attendu sur iPhone (D-054).
2. **L'heure de réception** : à l'arrivée du message, le téléphone le dit au serveur, qui note l'heure. On ne garde pas l'heure du téléphone lui-même : la précision gagnée (quelques secondes) ne change rien pour un rendez-vous « vers 18h ».
3. **L'écart à 18h00**, en secondes.
4. **« Vu »** : avez-vous vu le message à l'écran ? En trois cases : « à l'heure (avant 18h05) », « plus tard » ou « rien vu » (iPhone éteint : la case reste vide, le soir ne compte pas). Recevoir et voir sont deux choses différentes : un iPhone réglé en « Résumé programmé » reçoit le message à 18h, mais ne le montre qu'à l'heure du résumé.

Exemple de ligne : « T1 · iPhone · iOS 26 · soir 2 · envoyé 18:00:01 · accepté · reçu 18:00:09 · écart 9 s · vu : à l'heure ». Le « vu » n'entre pas dans la base.

Aucun autre champ n'est gardé dans la base. En particulier, jamais l'heure à laquelle on ouvre l'icône.

On relève aussi le nom du service d'acheminement, jamais l'adresse d'un abonnement. Sur iPhone, on attend celui d'Apple (de mémoire) ; un autre serait refusé par le serveur et signalé (P-12, `docs/etape-6/donnees.md`).

### Ce qui fait réussir ou échouer

- **À l'heure** : reçu avant 18h02. C'est l'heure de l'alerte prévue en exploitation (D-043 ; suspendue pour la version de test, D-057).
- **Acceptable** : reçu avant 18h05.
- **En retard** : reçu entre 18h05 et 18h30.
- **Manqué** : rien à 18h30.

**Le message réussit** si les trois réceptions (votre iPhone, trois soirs) sont à l'heure ou acceptables (application de D-057).

**La connexion réussit** si, sur votre iPhone, pour Google puis pour Apple, trois choses tiennent :
- **depuis l'icône** : on touche « Continuer avec… », on passe chez Google ou Apple, et on revient dans l'icône, connecté ;
- **après l'ajout de l'icône** : connecté d'abord dans Safari, on ouvre l'icône. On s'attend à y être déconnecté : l'icône a sa propre mémoire, séparée de Safari (relevé, témoignages de développeurs). La reconnexion depuis l'icône doit réussir et retrouver le même compte, pas en créer un second ;
- **dans la durée** : au soir 3, l'icône rouverte montre qu'on est toujours connecté.

**Deux échecs déjà connus ailleurs**, que le test cherche exprès :
- Google refuse parfois les connexions qui viennent d'une icône d'iPhone. Il les prend pour une fenêtre intégrée à une application (message « disallowed_useragent ») : des développeurs l'ont signalé (relevé, forums ; reports anciens, situation actuelle inconnue) ;
- le passage chez Apple ou Google peut ramener dans Safari au lieu de l'icône.

### Ce qu'on fait en cas d'échec

- **L'iPhone était éteint, en mode avion ou sans réseau** : le soir ne compte pas. On ajoute un soir.
- **L'envoi est parti en retard ou a échoué chez nous** : on corrige, avant 15h et jamais le dimanche (D-043), après un nouveau feu vert écrit de votre part la veille (D-054), et on ajoute un soir. C'est une panne de notre côté, pas un échec du canal.
- **L'iPhone allumé ne reçoit pas ou reçoit en retard**, par exemple à cause d'un réglage, comme le mode Économie d'énergie. On note le réglage en cause. Le soir suivant, on le corrige, pour vérifier que c'est bien lui. Si la cause se règle par un réglage, c'est un fait pour les vrais joueurs (un guide de réglage, à écrire par UX), pas un échec du test. Si elle ne se règle pas, c'est un échec.
- **Un échec qui ne s'explique pas**, par exemple plus rien après le soir 1 : on arrête. Le constat vous est présenté, avec des options en QCM, comme D-035 le prévoit. Le repli prévu par D-057 (point 1), TestFlight, serait alors reposé.
- **La connexion échoue depuis l'icône.** On essaie d'abord, sans rien vous demander, une autre manière d'ouvrir Apple ou Google dans l'icône. Si aucune ne marche, la question vous revient (D-035). Les options seront alors, par exemple : se connecter avant d'ajouter l'icône, puis entrer dans l'icône avec un code à six chiffres ; ou s'appuyer sur l'e-mail.

---

## 2. Le téléphone : votre iPhone (D-057)

Le test se fait sur votre seul iPhone, **T1** (D-057, point 4, qui modifie D-054, points 1 et 3). Aucun prêt, aucun achat. La seule condition : iOS 16.4 ou plus récent, la première version qui accepte les messages depuis une icône (vérifié, Apple). Votre version se lit dans Réglages › Général › Informations.

**Ce que le test ne dit plus** (application de D-057) : comment se comportent les autres versions d'iOS (16.4 à 16.7, 17, 18, 26) et les réglages d'autres personnes. Ce sera connu avec les vrais joueurs, à qui l'on demande leur version d'iOS (D-057, point 4).

Votre iPhone est testé page installée : sur iPhone, c'est la seule façon de recevoir le message (vérifié, Apple). L'icône des essais (D-019) n'est pas touchée : l'adresse est différente.

Le programme garde la place de cinq téléphones (T1 à T5) et attend cinq codes : seul T1 sert (partie 6, « Le code »).

### Ce qu'il faut savoir de l'iPhone

- Une page installée sur l'écran d'accueil peut recevoir un message **depuis iOS 16.4**. Dans Safari sans l'icône, jamais (vérifié, Apple).
- L'autorisation doit être demandée après un toucher sur un bouton : c'est le rôle de « Recevoir le message de 18h » (vérifié, Apple).
- Chaque message reçu doit s'afficher. Sinon, Safari retire l'autorisation (vérifié, Apple). La page du test affiche donc toujours le message.
- Aucun abonnement développeur Apple n'est nécessaire pour envoyer ces messages (vérifié, Apple). Votre compte développeur ne sert qu'à la connexion Apple.
- **Depuis iOS 18.4**, Apple propose une seconde forme de message, qui s'affiche même si le code de la page ne tourne pas (vérifié, WebKit). `docs/plateforme.md` (limite 4) attend du test le choix entre les deux formes :
  - la forme classique, les trois soirs : c'est elle qui permet de mesurer la réception ;
  - la seconde forme, essayée en plus au soir 3, si votre iPhone est en iOS 18.4 ou plus récent, dix minutes après l'autre (18h10), pour ne pas brouiller la mesure. On y vérifie aussi que le contenu reste chiffré (P-06, `donnees.md`).

  Un point pèse sur le choix : la version de test doit mesurer « message de 18h reçu » (`docs/produit.md`, section 8). Or, dans la seconde forme, le téléphone ne prévient le serveur que si Apple réveille le code de la page. Apple le prévoit avec une option, mais nous n'avons pas pu vérifier qu'elle est livrée (relevé, présentation d'Apple de juin 2025).

**Android : écarté par D-054.**

---

## 3. Ce que vous faites vous-même, dans l'ordre

Tout est à votre nom (D-042). Le pas-à-pas (`docs/etape-6/test-18h-pas-a-pas.md`) décrit chaque démarche écran par écran, avec les valeurs exactes à saisir. Vous ne nous transmettez jamais un mot de passe, une clé ni un code secret (D-048).

**Comment l'équipe met le test en ligne sans vos mots de passe.**
1. Les agents écrivent le code et le déposent sur GitHub, dans votre dépôt public : le code ne contient aucun secret ni aucune donnée.
2. Vous liez une fois Scalingo à ce dépôt, sur la seule branche `mise-en-ligne`, jamais `main` (D-054, point 1). Scalingo installe alors lui-même chaque nouvelle version, après que les tests automatiques sont passés : il attend le succès de la vérification sur GitHub (`.github/workflows/test-18h.yml`), et sa propre fabrication relance la garde des horaires et les tests sans base (vérifié, documentation de Scalingo).
3. Les secrets (clé Apple, code secret Google, votre code d'accès à la page de résultats, les codes d'essai, et la clé qui signe nos envois vers Apple, créée par vous d'un geste) sont saisis par vous, dans les réglages de l'application chez Scalingo. Ils n'apparaissent nulle part ailleurs ; une recherche automatique de secrets dans le dépôt le vérifie (P-16).
4. Les agents n'ont aucun accès à OVHcloud, à Scalingo, à Apple ni à Google, et n'ouvrent pas la page du test en ligne.
5. Si une installation échoue, vous nous copiez le message d'erreur de la **fabrication** chez Scalingo (pas un journal de l'application en marche).
6. **En cas de panne pendant le test**, c'est vous qui regardez, comme D-048 le prévoit. Les agents ne reçoivent qu'un relevé du type « soir 2 : reçu à 18h01 » ou « non reçu ». Jamais les journaux de l'application en marche (D-052, point 3).
7. À la fin, vous nous copiez le tableau des résultats, avec le « vu » en trois cases. Seul un bilan chiffré entre dans le dépôt public (comme D-017).

**La règle des horaires, dès le test.** Scalingo installe depuis la branche `mise-en-ligne`, qui ne reçoit que des versions déjà sur `main`. Les agents n'y poussent jamais de 15h à 19h ni le dimanche (D-043), et seulement après votre feu vert écrit, donné par message la veille (D-054, point 1 ; inscrit dans `CLAUDE.md`). En plus, les tests automatiques échouent volontairement dans ces créneaux : Scalingo refuse alors d'installer. Il en va de même pour chaque correction. Changer un réglage chez Scalingo (la variable `SOIRS`, par exemple) redémarre l'application : c'est une mise en ligne au sens de D-043, jamais de 15h à 19h ni le dimanche.

| # | Démarche | Pourquoi | Temps | Argent | Ce que l'équipe prépare |
|---|---|---|---|---|---|
| 1 | **Acheter elenchos.fr** (proposé : chez OVHcloud), avant d'ouvrir Scalingo ; double authentification et renouvellement automatique (proposé) ; une entrée dans la zone DNS pour `test18h.elenchos.fr` | D-057, point 2 : une adresse à vous, pour que l'icône et l'abonnement survivent à la mise à niveau. Avant Scalingo : si le nom est pris, vous le savez avant que l'essai ne coure | 30 min | Environ 6 € TTC la première année, puis environ 9,35 € TTC par an (relevé, partie 4) | Le pas-à-pas, l'entrée DNS exacte |
| 2 | **Scalingo** : créer le compte (double vérification, P-16), créer l'application du test (région Paris) et sa base d'essai, **brancher `test18h.elenchos.fr`** (certificat automatique), couper les sauvegardes programmées de la base, lier le dépôt GitHub. La carte est donnée, avec deux garde-fous (D-055) | L'hébergeur choisi (D-048, D-057) ; l'essai gratuit commence à l'ouverture | 1 h | 0 € pendant 30 jours ; une carte est demandée | Le pas-à-pas, le nom de la branche, les réglages |
| 3 | **Google** : dans la console Google Cloud, avec votre compte, créer un projet, l'écran d'accord en mode « Test » avec votre seule adresse, l'identifiant « application Web » avec l'adresse de retour sur `test18h.elenchos.fr`, saisir son code secret chez Scalingo | La connexion Google (D-035, D-057) | 25 min | 0 € (de mémoire) | Le pas-à-pas, l'adresse de retour exacte |
| 4 | **Apple** : dans votre compte développeur, créer l'identifiant d'application (« Se connecter avec Apple » coché), l'identifiant de service avec le domaine `test18h.elenchos.fr` et l'adresse de retour, la clé privée (téléchargeable une seule fois) ; saisir chez Scalingo la clé, son numéro, votre numéro d'équipe et l'identifiant de service | La connexion Apple (D-035) ; votre compte est déjà ouvert (D-047) | 40 min | 0 € de plus | Le pas-à-pas, les valeurs à saisir |
| 5 | Votre feu vert écrit la veille ; puis la mise en ligne, vos codes, l'installation de votre iPhone et le message d'essai | Mettre le test en route | 35 min | 0 € | La page de préparation des codes, la liste de contrôle |
| 6 | Chaque soir, vers 18h10 : regarder la page de résultats, noter le « vu » | Le relevé | 2 min par soir | 0 € | La page de résultats |
| 7 | À la fin : « Tout effacer », supprimer l'application chez Scalingo, **retirer l'entrée DNS du test**, retirer les accès Google et Apple, nous copier le tableau | P-43 ; l'effacement réel (D-057, point 5) ; la place de l'unique application de l'essai, libérée pour le jeu | 20 min | 0 € | Le pas-à-pas d'effacement |

Environ **trois heures et demie** en tout, soirs et effacement compris.

Dans le pas-à-pas, les démarches 1 à 4 sont les parties 1 à 4 ; la démarche 5 est la partie 6, la démarche 6 la partie 7, la démarche 7 la partie 9 (la partie 5 est le feu vert, la partie 8 la panne).

**Ce que disent aujourd'hui OVHcloud, Scalingo, Apple et Google** (13 octobre 2026).

- **elenchos.fr est-il libre ?** Inconnu. Le service public de l'Afnic qui répond « libre ou pris » n'a pas pu être joint depuis l'environnement de l'équipe ; un moteur de recherche ne trouve aucun site à cette adresse, ce qui ne prouve rien. On le saura à l'achat (D-057). S'il est pris, rien d'autre n'est acheté et la question vous revient.
- **Le prix d'un .fr pour un particulier** (relevé, comparatifs de juillet à octobre 2026 ; les sites d'OVHcloud, de Gandi et d'Infomaniak n'ont pas pu être ouverts) : OVHcloud, environ 4,99 € HT la première année, 7,79 € HT par an ensuite (environ 9,35 € TTC) ; Infomaniak, du même ordre ; Gandi, renouvellement relevé nettement plus cher (chiffres peu fiables). **Recommandé (proposé) : OVHcloud**, français, zone DNS comprise, cité par la documentation de Scalingo. Le chiffre « environ 10 € par an » de D-057 tient.
- **Brancher le domaine chez Scalingo** (vérifié, documentation de Scalingo, pages modifiées en 2026) :
  - pour une adresse comme `test18h.elenchos.fr`, une entrée **CNAME** dans la zone DNS, qui vise `elenchos-test-18h.osc-fr1.scalingo.io.` (avec le point final), puis le domaine ajouté à l'application (**Settings › Public Routing › Custom Domains**) ;
  - pour l'adresse nue `elenchos.fr`, il faut un registraire qui accepte une entrée « ALIAS » ou « ANAME » ; sinon, des entrées « A » vers les adresses de Scalingo, **que Scalingo déconseille** (elles peuvent changer, préavis de 30 jours). D'où `test18h.elenchos.fr` pour le test ; pour le jeu, le choix de l'adresse est à faire avec sa construction (partie 8) ;
  - le **certificat** (le cadenas du https) est demandé à Let's Encrypt par Scalingo, de lui-même et sans frais, dès que l'entrée DNS est visible ; Scalingo la regarde toutes les minutes. Il vaut 45 jours depuis juin 2026 et se renouvelle seul ;
  - **délais** : celui de l'activation du domaine et de la diffusion de l'entrée DNS, de quelques minutes à quelques heures (estimation ; la documentation dit seulement que la diffusion « peut prendre du temps ») ;
  - un **domaine principal** peut être désigné : l'adresse en `scalingo.io` y renvoie alors d'elle-même ;
  - l'essai gratuit n'autorise **qu'une application** (documentation modifiée le 1er octobre 2026) : celle du test doit être supprimée avant que la construction du jeu en crée une.
- **Apple accepte-t-il un domaine à vous ?** Oui. La page d'aide d'Apple (relue le 13 octobre 2026) demande un « identifiant de service » rattaché à un identifiant d'application, avec au moins un domaine, et dix adresses au plus pour un compte individuel. Elle dit : « You don't need to upload a file on your server » : **aucun fichier de vérification n'est exigé** (vérifié). Elle décrit maintenant un seul champ, « Website URLs », pour domaines et adresses de retour ensemble ; l'écran peut encore en montrer deux (à vérifier sur l'écran). Réserve, inchangée depuis le 12 octobre : la documentation d'Apple pour les développeurs dit toujours qu'il faut « enregistrer et vérifier » les domaines, et qu'il faut « une app existante dans l'App Store » ; de mémoire, un identifiant d'application suffit, sans app publiée. On le saura en cinq minutes, à la démarche 4. Les adresses de retour doivent être complètes (« https », adresse, chemin) (vérifié).
- **Le mode « Test » de Google suffit-il pour votre seul iPhone ?** **Oui.** En mode « Test », seuls les comptes Google ajoutés à la liste peuvent se connecter, cent au plus (relevé par moteur sur l'aide de Google) ; on n'y met que le vôtre. Un écran « application non validée par Google » peut s'afficher ; il suffit de continuer (de mémoire). Google exige une adresse de retour en « https » sur une extension publique (vérifié le 12 octobre) : `elenchos.fr` convient, et le doute sur `scalingo.io` tombe.
- **Et pour de vrais joueurs ?** Le mode « Test » ne convient pas : liste tenue à la main, cent comptes au plus, et l'écran « application non validée ». Il faudra **publier** l'application (état « En production ») : elle s'ouvre alors à tout compte Google. Le jeu ne demande que l'identifiant et l'adresse e-mail (champs « openid » et « email »), que Google classe parmi les demandes ordinaires : **aucun examen par Google n'est exigé** pour elles (relevé, aide de Google et blog des développeurs de Google, par moteur). Sans autre démarche, l'écran de Google montre **le domaine, « elenchos.fr »**, au lieu du nom et du logo du jeu. Pour y voir le nom et le logo, une **vérification de la marque**, facultative, prend deux à trois jours ouvrés ; elle demande une page d'accueil et une page de confidentialité sur elenchos.fr, cohérentes avec le nom déclaré, et la preuve que le domaine est à vous (une entrée DNS de plus) (relevé). Le choix vous sera présenté avec la construction (travail 9).
- **Apple, pour de vrais joueurs, avec l'e-mail** (D-057, point 3 ; hors de ce test) : pour écrire aux joueurs qui masquent leur adresse chez Apple, le domaine d'envoi des e-mails devra être déclaré à Apple et authentifié (SPF ou DKIM, deux entrées DNS) (vérifié, documentation d'Apple). À prévoir avec le service d'envoi d'e-mails.

---

## 4. Les dépenses, une par une (D-042)

| Dépense | Montant TTC | Statut, source, date | Quand | Ce qui en dépend | Si vous dites non |
|---|---|---|---|---|---|
| **Domaine elenchos.fr** | **Environ 6 €** la première année, puis **environ 9,35 €** par an | Relevé le 13 octobre 2026 (comparatifs ; prix OVHcloud 4,99 € HT puis 7,79 € HT). Voulu par D-057 (point 2) ; montant présenté ici avant l'achat. C'est l'écran de paiement qui fait foi : au-delà de 15 € TTC pour un an, on vous le redemande (proposé) | Démarche 1, J0 | Tout le test, puis l'adresse du jeu | Pas de test : la question vous revient |
| Options du registraire (hébergement, e-mail, « DNS Anycast ») | **0 €** : toutes refusées | Proposé | — | — | — |
| **Hébergement Scalingo pendant le test** | **0 €** | Vérifié (documentation de Scalingo, modifiée le 1er octobre 2026, relue le 13 octobre) : essai de 30 jours, une application de 5 conteneurs au plus et une base dans sa plus petite formule ; carte demandée | Démarche 2 | Tout le test | Pas de test : la question vous revient |
| Certificat https du domaine | 0 € | Vérifié (Let's Encrypt, par Scalingo) | Démarche 2 | Le cadenas, les messages, Apple et Google | — |
| Suite de l'hébergement, après les 30 jours | Environ 26 € par mois (vérifié le 11 octobre, `docs/plateforme.md`) | Hors test : présentée avec son montant au plus tard une semaine avant la fin de l'essai (D-055) | Environ 30 jours après l'ouverture du compte | La construction | À la fin de l'essai, la facturation commence d'elle-même si une application ou une base existent encore |
| Téléphones | **0 €** | Votre iPhone seul (D-057, point 4) | — | — | — |
| Compte développeur Apple | 0 € de plus | Déjà ouvert (D-047) | — | La connexion Apple | — |
| Console Google | 0 € | De mémoire | Démarche 3 | La connexion Google | — |
| **Total du test** | **Environ 6 €** (le domaine, qui sert ensuite au jeu), si l'application et la base sont supprimées avant le 30e jour de l'essai | | | | |

Par rapport à ce que D-054 avait validé : le prêt de quatre iPhone et l'iPhone reconditionné de secours disparaissent (D-057, point 4) ; le domaine n'est plus éventuel, il est acheté d'office (D-057, point 2).

**Un point d'horloge à connaître.** L'essai de Scalingo court dès l'ouverture du compte (J1). Le test en prend environ six jours. Le passage au payant commence seul à la fin de l'essai si une application ou une base existe encore. Vous notez la date de fin d'essai le jour de l'ouverture du compte ; l'équipe vous présente la suite, avec son montant, au plus tard une semaine avant (D-055). Le bouton « Stop free trial » lance la facturation tout de suite : on n'y touche jamais.

---

## 5. Ce qui est gardé, et effacé

On applique P-43 et P-10 (`docs/etape-6/donnees.md`) : la page du test ne garde que ce qu'elle teste. Sans prêteur, la base ne contient que des données de votre propre iPhone.

| Ce qui est gardé | Pourquoi | Où | Jusqu'à quand |
|---|---|---|---|
| L'abonnement de votre iPhone au message : l'adresse technique où le service d'Apple le joint, et ses clés de chiffrement | Envoyer le message | Base du test, chez Scalingo | Fin du test |
| L'étiquette du téléphone : « T1 » et sa version d'iOS | Lire les résultats | Idem | Fin du test |
| Les heures : envoi, réponse du service d'Apple, réception notée par le serveur | La mesure | Idem | Fin du test ; ensuite, votre copie du tableau, et le bilan chiffré dans le dépôt (le 20 novembre de D-054, point 1, est sans objet : voir plus bas, à confirmer) |
| La connexion : l'identifiant renvoyé par Apple ou Google, sous forme d'empreinte, et « adresse e-mail reçue : oui ou non » | Vérifier qu'on retrouve le même compte en se reconnectant | Idem | Fin du test |

**Ce qui n'est jamais gardé** : aucune réponse, aucun pseudo, aucun nom, aucune adresse e-mail.
- L'adresse renvoyée par Apple ou Google est lue, notée « reçue », puis jetée. On la demande pourtant, comme le fera le jeu (D-035, P-03) : c'est la seule façon d'essayer les vrais écrans d'accord.
- Notre programme n'écrit rien de personnel dans ses journaux (P-07), et aucune adresse de page ne porte un abonnement (P-08).
- Les journaux de Scalingo peuvent noter l'adresse internet de qui se connecte : journaux du routeur, désactivés par défaut et laissés désactivés ; « métadonnées de connexion », dont le contenu n'est pas décrit. Sa documentation dit que tous ses journaux sont gardés un an, par obligation légale (vérifié, 12 octobre 2026). Pour ce test, il ne s'agit que de vos propres connexions.

**Rien d'Apple ni de Google n'est chargé avant le toucher (P-10).** Les boutons sont de simples liens, sans aucun programme d'Apple ni de Google dans la page. Le bouton « Continuer avec Apple » n'est montré qu'après l'abonnement du téléphone 1, et le serveur refuse la connexion Apple ailleurs. Cette règle visait les iPhone des prêteurs ; elle reste dans le code, sans gêne pour vous.

**Les cookies** restent protégés comme avant (préfixe `__Host-` : liés à la seule adresse `test18h.elenchos.fr`). La précaution avait été prise pour l'adresse partagée `scalingo.io` ; elle vaut aussi sur un domaine à nous.

**L'effacement, le lendemain du soir 3** (ou du dernier soir ajouté), pour lire d'abord les heures du soir 3. D-057 (point 5) garde l'effacement réel, et D-055 demande que l'essai ne laisse ni application ni base. L'effacement n'est pas une mise en ligne : la garde des horaires ne le bloque pas. Ne le faites pourtant pas entre 18h00 et 18h30 si un soir est en cours (un soir ajouté, par exemple). Dans l'ordre, le même que dans le pas-à-pas (partie 9) :
1. Vous copiez le tableau de résultats (voir « Votre copie du tableau », plus bas).
2. Sur votre iPhone : déconnexion, puis l'icône supprimée, ce qui coupe aussi les messages (de mémoire).
3. Vous touchez « Tout effacer » sur la page de résultats. Le programme vide la base, puis vérifie qu'elle est vide (test de P-43).
4. Vous supprimez chez Scalingo l'application du test et sa base : la base est **supprimée**, pas seulement vidée, car sa copie continue des changements (7 jours) ne part qu'avec elle. Les sauvegardes programmées survivent à la suppression de la base, jusqu'à quatre semaines sur le plus petit plan : on les coupe donc avant de mettre des données, et on ne fait jamais de sauvegarde manuelle (gardée un mois après la suppression). Puis vous vérifiez la page de facturation : plus aucune application ni base. Le tout avant le 30e jour de l'essai.
5. **Vous retirez l'entrée DNS `test18h`** chez OVHcloud. Une entrée qui vise une application supprimée peut être reprise par quiconque crée chez Scalingo une application du même nom, et servirait alors sa page à `test18h.elenchos.fr` (reprise d'adresse, risque connu). Le domaine elenchos.fr est gardé : il sert au jeu.
6. Vous retirez l'accès du test dans votre compte Google, et le lien dans « Se connecter avec Apple » sur votre iPhone ; puis l'adresse du test du projet Google et de l'identifiant de service Apple. Le projet Google reste, ainsi que le compte développeur et la clé ; les identifiants Apple du jeu seront créés au travail 9 (ceux du test, `io.github.ppcrepin.test18h`, ne sont pas repris).
7. Vous écrivez une ligne datée, « effacé le …, vérifié ».

**Votre copie du tableau** ne concerne que votre iPhone : la date du 20 novembre 2026, fixée pour les données des prêteurs (D-054, point 1), n'a plus d'objet (application de D-057, à confirmer). Seul le bilan chiffré entre dans le dépôt. Les lignes copiées dans la conversation des agents portent sur votre propre téléphone ; vous les donnez vous-même, comme un rapport (D-048 et D-052, point 3, respectés : aucun accès des agents).

### L'avis de Juridique, après D-057

*Juridique, avis interne du 12 octobre 2026, écrit pour un test avec quatre prêteurs. Juridique n'est pas avocat. Ce qui suit dit ce qui en reste sans prêteur : c'est une lecture de Back-end, **à faire confirmer par Juridique** à la relecture.*

La base ne contient plus que des données de votre iPhone, dont vous êtes à la fois le responsable et la personne concernée. Le cadre de l'avis (intérêt légitime, information, droits des prêteurs) n'a plus d'objet pour ce test ; il reviendra, autrement, avec les vrais joueurs (D-057, point 5 : accord explicite à l'entrée).

**Les six conditions bloquantes de l'avis, une par une :**
1. **Aucun contenu politique** sur la page ni dans le message : **gardée** (elle ne coûte rien ; message « Test, soir n sur 3 »).
2. **La note remise avant l'installation** : **tombe**, sans prêteur (D-057, point 4).
3. **Des comptes de test seulement sur les téléphones prêtés** : **tombe** ; vous vous connectez avec vos propres comptes Google et Apple (proposé).
4. **Le contrat de sous-traitance de Scalingo, vérifié avant la première donnée** : **n'est plus bloquant pour ce test** (proposé), puisque seules vos données y entrent ; la capture d'écran des conditions acceptées à l'inscription reste faite (pas-à-pas, 2.1) ; la condition **redevient bloquante avant le premier vrai joueur** (proposé). Les questions écrites à Scalingo (journaux, sauvegardes, sous-traitants), qui servaient la note, sont reportées à la mise à niveau (proposé).
5. **L'effacement fait et vérifié** (sauvegardes programmées coupées avant toute donnée, aucune sauvegarde manuelle, base supprimée, facturation vérifiée) : **gardée**, au titre de l'effacement réel (D-057, point 5) et de D-055.
6. **Rien de nous dans ce que Scalingo garde un an** (journaux du routeur coupés ; journal fermé, sans abonnement, identifiant, empreinte, adresse internet ni couple « téléphone + heure » ; aucune erreur de la base qui recopie une valeur) : **gardée** ; elle est déjà dans le code et prouvée par `test-18h/tests/journal-base/`, et elle préfigure ce que le jeu devra tenir.

**Le bulletin de sécurité de Scalingo (12 août 2026).** Scalingo a signalé une fuite de son entrepôt interne d'analyses, par une faille de l'outil Metabase : environ 90 000 personnes touchées (identité et coordonnées, informations de compte, facturation limitée, noms d'applications et de variables, sans leurs valeurs), CNIL avertie le 11 août. Selon Scalingo, aucune trace d'accès aux applications ni aux bases de ses clients (vérifié dans le dépôt de sa documentation, bulletin SSB-2026-004 ; parole de Scalingo, non confirmée de l'extérieur). Avis de Juridique : ce n'est pas une raison de revoir D-048. Ce qu'il change : la double vérification dès la création du compte ; un mot de passe propre à Scalingo ; ne jamais suivre le lien d'un e-mail « Scalingo » ; aucun nom d'application, de base ou de variable qui contienne un prénom ou une information sur une personne. Les mêmes précautions valent pour le compte OVHcloud, qui tient le domaine (proposé).

---

## 6. Ce que l'équipe construit

Trois morceaux, plus une page de résultats (le code est écrit : `test-18h/`).

1. **La page.** Elle s'installe sur l'écran d'accueil, demande l'autorisation des messages après un toucher, reçoit le message et prévient le serveur de sa réception. Elle offre « Continuer avec Google » et « Continuer avec Apple ».
2. **Le service qui envoie à 18h.** Un petit programme tourne en permanence chez Scalingo et tient l'horloge, à l'heure de Paris, changements d'heure compris (vérifiés par un test automatique sur une horloge simulée). À 18h, il envoie le message, chiffré (P-06), en « urgence haute ». S'il redémarre à 18h00 et 30 secondes, il voit que l'envoi n'a pas eu lieu et le fait ; il est conçu pour ne jamais envoyer deux fois, et un test automatique le vérifie.
3. **La mesure.** Les heures, la page de résultats, réservée à vous par votre code d'accès, les codes d'essai, le bouton d'essai immédiat et « Tout effacer ».

**Le code, après D-057.** Il n'a pas besoin d'être réécrit : il prévoit cinq téléphones, et un seul servira. Deux réglages suffisent : l'adresse publique (`ADRESSE_PUBLIQUE=https://test18h.elenchos.fr`) et le calendrier (`SOIRS`, chaque soir pour T1 seulement). Les pages de documentation du code (`test-18h/LISEZMOI.md`) sont mises à jour en partie avec lui (le reste suit la relecture). Fait dans le code, en relecture (proposé) : le programme exige `ADRESSE_PUBLIQUE` en ligne, au lieu de prendre d'office l'adresse en `scalingo.io` ; un oubli est signalé par son nom sur la page de résultats, au lieu de faire échouer Google et Apple sans explication. Toute retouche du code repasse par le circuit avant votre feu vert.

**Jetable** : la page elle-même et ses textes, la page de résultats, l'application et la base du test chez Scalingo, l'entrée DNS `test18h`.

**Repris pour le vrai jeu** (proposé) :
- l'envoi du message, avec son chiffrement et la gestion des abonnements expirés ;
- l'horloge de 18h ;
- la réception dans le téléphone ;
- la mesure « message de 18h reçu » (`docs/produit.md`, section 8) ;
- la connexion Apple et Google, avec la bibliothèque prévue (`docs/plateforme.md`, annexe C) ;
- la chaîne de mise en ligne GitHub → Scalingo, avec la règle des horaires ;
- le domaine elenchos.fr et sa zone DNS ;
- les tests de P-05, P-06, P-10 et P-43.

**Le circuit s'applique au code** (plan, partie 4) : tests automatiques, puis Cohérence, puis le Vérificateur, avant la mise en ligne.

---

## 7. Calendrier

Le calendrier ci-dessous est celui du **plus tôt possible**, pas une date promise. Le jour 0 est le jour où vous achetez elenchos.fr ; au plus tôt aujourd'hui, mardi 13 octobre 2026. Deux choses peuvent faire glisser la suite : la mise en ligne (J2) attend que le code ait passé le circuit complet et votre feu vert écrit, donné la veille (D-054, point 1) ; et si elenchos.fr n'est pas libre, tout s'arrête jusqu'à votre réponse.

| Jour | Vous | L'équipe |
|---|---|---|
| J0 (au plus tôt le mardi 13) | Démarche 1 : achat d'elenchos.fr, entrée DNS (30 min) | Relecture de cette mise à jour et du code |
| J1 (au plus tôt le mercredi 14) | Démarches 2, 3 et 4 (environ 2 h), dont le branchement du domaine ; votre feu vert écrit pour le lendemain | Le code doit être relu avant votre feu vert |
| J2 (au plus tôt le jeudi 15) | Avant 15h : mise en ligne, codes, installation de votre iPhone, message d'essai ; à 18h, soir 0 (répétition) | Mise en ligne avant 15h |
| J3 (au plus tôt le vendredi 16) | Soir 1 | Correction éventuelle avant 15h |
| J4 (au plus tôt le samedi 17) | Soir 2 | Correction éventuelle avant 15h |
| J5 (au plus tôt le dimanche 18) | Soir 3 (un redémarrage avant 18h ; à 18h10, la seconde forme) | Aucune mise en ligne (D-043) |
| J6 (au plus tôt le lundi 19) | Effacement ; vous nous copiez le tableau | Bilan, par le circuit habituel |

Le soir 1 tombe un vendredi : un défaut vu à la répétition du jeudi peut être corrigé le vendredi avant 15h (feu vert écrit le jeudi soir). Un défaut vu le samedi soir attend le lundi, et un soir est ajouté.

**Six jours si tout passe, sept avec un soir ajouté, comptés depuis le jour 0.** Au plus tôt, tout se tient avant le changement d'heure du dimanche 25 octobre ; ce changement est couvert par un test automatique, pas par un vrai soir.

Le soir 0 ne peut avoir lieu qu'une fois la page en ligne. Aucune mise en ligne le dimanche ni de 15h à 19h (D-043).

---

## 8. Limites et doutes

**Ce que le test ne prouve pas.**
- **Un iPhone, trois soirs.** Le test dit si le canal marche sur votre iPhone, pas sur les autres versions d'iOS, ni à quelle fréquence il échoue chez des joueurs. On le saura avec les vrais joueurs, en leur demandant leur version d'iOS (D-057, point 4), par la mesure « message de 18h reçu » (`docs/produit.md`, section 8).
- **Trois jours sans ouvrir l'icône, pas trois semaines.** Si un iPhone retire un abonnement après des semaines sans ouverture, nous ne le verrons qu'avec les joueurs. Un joueur en pause (D-029) en serait le premier touché.
- **Ce qui n'est pas couvert** : les iPhone en iOS 16.4 à 25 si le vôtre est plus récent ; les réglages d'autres personnes ; l'iPad ; les autres navigateurs de l'iPhone ; un iPhone d'avant iOS 16.4, qui ne reçoit pas les messages.
- **La forme de message d'iOS 18.4** n'est essayée qu'un soir.
- **Le geste d'ajout de l'icône par un inconnu**, sans vous à côté, n'est pas essayé : c'est un critère de la version de test (D-005).
- **La connexion par e-mail** (D-035) n'est pas dans ce test (plan, travail 4 : seuls Google et Apple y sont essayés) ; D-057 (point 3) la garde pour la version de test du jeu, où elle viendra.
- **La connexion Google en mode « Test »** n'est pas celle des joueurs : en production, l'écran de Google sera différent (le domaine au lieu de « application non validée »). Le geste depuis l'icône, lui, est le même.

**Ce qui reste incertain avant de commencer.**
- **La disponibilité d'elenchos.fr** : inconnue, levée à l'achat.
- **L'adresse du jeu lui-même** : `elenchos.fr` nu, ou une adresse comme `www.elenchos.fr`. Chez OVHcloud, l'adresse nue se brancherait à Scalingo par des entrées que Scalingo déconseille, si OVHcloud n'accepte pas « ALIAS » ou « ANAME » (de mémoire, à vérifier ; son site n'a pas pu être ouvert ; partie 3). Ce choix fixe l'adresse des icônes des joueurs pour toujours : il doit être fait avant le premier joueur, avec la construction (proposé : l'équipe le prépare et vous le présente à ce moment-là).
- **Apple** : sa documentation se contredit toujours (« vérifier » les domaines, « app existante dans l'App Store ») ; le doute se lève en cinq minutes, à la démarche 4.
- **Scalingo** : le temps réel avant le certificat ; le contenu de ses « métadonnées de connexion » et les réglages de journal de ses bases ne sont pas connus. L'essai demande une carte : la facturation part seule au 30e jour si rien n'est supprimé.
- **Google et une icône d'iPhone** : des refus ont été signalés par le passé (relevé, forums anciens). C'est le risque le plus probable d'échec de la connexion, et la raison d'être de cette partie du test.
- **L'heure de réception**, notée par le serveur, est juste à quelques secondes près (estimation). C'est assez pour un rendez-vous « vers 18h ».

**Des agents ne tiennent pas de téléphone** (plan, partie 7) : tout le relevé sur appareil repose sur vous. Une fausse manœuvre (icône ouverte entre deux soirs, téléphone éteint) se corrige en ajoutant un soir, pas en réinterprétant.

**À mesurer avec les vrais joueurs** :
- la part des joueurs qui reçoivent le message chaque soir, par version d'iOS ;
- les réglages à expliquer (Concentration, Résumé programmé, mode Économie d'énergie) ;
- la connexion depuis l'icône chez des personnes qui ne sont pas guidées.

---

## Décisions antérieures touchées

**Mise à jour du 13 octobre 2026, pour D-057** :
- **D-054, points 1 et 3, modifiés par D-057 (point 4)** : un seul iPhone, le vôtre ; plus de prêteurs, de note aux prêteurs (retirée de ce document), de séance d'installation, de liste « qui a quel téléphone », de versions d'iOS cherchées. La branche `mise-en-ligne` et le feu vert de la veille (point 1) restent.
- **D-054, point 2** (« on vous redemande avant d'acheter un domaine ») : précisé par D-057 (point 2 et précision du même jour), qui veut elenchos.fr acheté avant la mise en ligne ; le montant est présenté ici (D-042).
- **D-054, point 1, la date du 20 novembre 2026** pour le tableau et la liste des prêteurs : sans objet sans prêteur (application de D-057, **à confirmer**).
- **Avis de Juridique du 12 octobre**, conditions 2 et 3 : tombent ; condition 4 : non bloquante pour ce test, bloquante avant le premier joueur (**proposé, à confirmer par Juridique**) ; conditions 1, 5 et 6 : gardées.
- **Plan de construction, travail 4, « Fini quand »** (« le message arrive vers 18h sur les cinq téléphones, trois soirs de suite, et la connexion tient depuis l'icône ») : modifié par D-057 (point 4) ; nouvelle formulation dans l'« En bref » ; `docs/plan-construction.md` : le « Fini quand » est mis à jour, le reste du travail 4 aussi (lu avec D-057).
- **P-43** (`docs/etape-6/donnees.md`), précision validée par D-054 « jamais le compte d'un prêteur ; Apple seulement sur votre iPhone » : sans prêteur, vos propres comptes Google et Apple servent (proposé). Le reste de P-43 tient.
- **P-12** : inchangé (un seul service d'acheminement, celui d'Apple).
- **D-043, point 2** (alerte de 18h02) : suspendue pour la version de test par D-057 ; ce test garde « à l'heure : avant 18h02 » comme simple mesure.

**Toujours appliqués** : D-005 (modifié par D-054 puis D-057) ; D-035 (connexion essayée, question qui revient en cas d'échec) ; D-042 (dépense par dépense) ; D-043 (horaires, prestataires européens : OVHcloud et Scalingo sont français) ; D-047 (compte Apple) ; D-048 (vos comptes, vos mots de passe, aucune donnée pour les agents) ; D-052, point 3 (aucun journal aux agents) ; D-055 (carte, garde-fous) ; P-10 et P-43 de `docs/etape-6/donnees.md`.

**Précisions des 12 octobre, toujours valables** : le message d'erreur de **fabrication** chez Scalingo peut nous être copié (D-052, point 3, et P-21, précisés par D-054) ; un changement de réglage chez Scalingo compte comme une mise en ligne (D-043, point 2) ; le choix entre les deux formes de message (`docs/plateforme.md`, limite 4) sera tranché au bilan du test ; le message « Test, soir n sur 3 » n'est pas un message du jeu (D-014) ; l'adresse e-mail renvoyée par Apple ou Google n'est pas gardée, l'identifiant ne l'est que sous forme d'empreinte (plus strict que P-43).

---

## Sources

*« Ouverte » : page lue directement. « Moteur » : page restituée par un moteur de recherche, sans ouverture. « Dépôt » : lue dans le dépôt public de la documentation de Scalingo (`Scalingo/documentation`, à jour au 9 octobre 2026). Le 13 octobre 2026, les sites de l'Afnic, d'OVHcloud, de Gandi, d'Infomaniak et l'aide de Google n'ont pas pu être ouverts depuis l'environnement de l'équipe.*

**Consultées le 13 octobre 2026 (D-057)**
- Scalingo, [Custom Domain Name](https://doc.scalingo.com/platform/networking/public/domains/custom) (dépôt, page modifiée le 4 mars 2026) : CNAME pour une sous-adresse, ALIAS ou ANAME pour l'adresse nue, entrées A déconseillées, ajout dans Public Routing, domaine principal.
- Scalingo, [Default TLS Certificate](https://doc.scalingo.com/platform/networking/public/cert/default) (dépôt, modifiée le 15 janvier 2026) et note du 1er juin 2026 sur la durée des certificats (dépôt) : Let's Encrypt automatique, DNS regardé toutes les minutes, 45 jours.
- Scalingo, [Forcing HTTPS](https://doc.scalingo.com/platform/networking/public/cert/force-https) (dépôt) ; [Free Trial](https://doc.scalingo.com/platform/getting-started/free-trial) (dépôt, modifiée le 1er octobre 2026) : une application, cinq conteneurs, une base, e-mails 3 jours et 1 jour avant la fin, facturation automatique.
- Apple, [Configure Sign in with Apple for the web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web) (ouverte) : un champ « Website URLs », dix adresses pour un compte individuel, aucun fichier à déposer.
- Apple, [Configuring your environment for Sign in with Apple](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple) (ouverte, version JSON) : « register and verify », « existing app in the App Store », adresses de retour complètes, relais d'e-mails privé (SPF, DKIM).
- Google, [Manage App Audience](https://support.google.com/cloud/answer/15549945) et [When is verification not needed](https://support.google.com/cloud/answer/13464323) (moteur) : « En production » ouvert à tout compte, cent comptes en mode « Test ».
- Google, [Get smart about preparing your app for OAuth verification](https://developers.googleblog.com/get-smart-about-preparing-your-app-for-oauth-verification/) (moteur) et [Manage OAuth App Branding](https://support.google.com/cloud/answer/15549049) (moteur) : vérification de la marque facultative pour les demandes ordinaires, deux à trois jours ouvrés, sinon le domaine affiché.
- [Forum des développeurs Google, vérification de la marque](https://discuss.google.dev/t/brand-verification-the-consent-screen-shows-our-domain-not-the-configured-app-name-is-that-the-string-compared-against-the-home-page/388051) (relevé) : refus si le nom diffère de la page d'accueil.
- Prix du .fr : [La Fabrique du Net, 2026](https://www.lafabriquedunet.fr/logiciels/tendances/quel-est-le-prix-dun-nom-de-domaine) et [Isotech Solutions, guide OVH 2026](https://www.isotechsolutions.com/web/nom-de-domaine-chez-ovh-guide-complet-2026-achat-tarifs-dns/) (relevé, moteur) : OVHcloud 4,99 € HT puis 7,79 € HT ; [domainoffer.net, Infomaniak](https://domainoffer.net/tld/fr/infomaniak) (relevé, moteur, mai 2026) ; [whtop.com, Gandi](https://www.whtop.com/fr/amp/plans/gandi.net/108931) (relevé, moteur, non daté, peu fiable).
- Disponibilité d'elenchos.fr : service RDAP de l'Afnic (`rdap.nic.fr`) injoignable ; recherche par moteur sans résultat pour ce site.

**Consultées le 12 octobre 2026**
- Apple, [Envoyer des messages web dans les apps web et les navigateurs](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) (ouverte) : iOS 16.4, toucher obligatoire, message toujours affiché, pas d'abonnement développeur, urgence « haute », adresses `*.push.apple.com`.
- WebKit, [Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/) (moteur) : la seconde forme, iOS 18.4, icônes de l'écran d'accueil.
- Apple, [WWDC 2025, session 235](https://developer.apple.com/videos/play/wwdc2025/235/) (moteur) : l'option qui réveille le code de la page.
- Google, [règles des adresses de retour](https://developers.google.com/identity/protocols/oauth2/web-server) (moteur) : « https », extension publique.
- Connexion Google depuis une icône d'iPhone : [Auth0 Community](https://community.auth0.com/t/getting-google-disallowed-useragent-with-web-app-added-to-ios-homescreen/6705) (relevé, ancien).
- Mémoire séparée entre Safari et l'icône : [Netguru](https://www.netguru.com/blog/how-to-share-session-cookie-or-state-between-pwa-in-standalone-mode-and-safari-on-ios) (relevé).
- Scalingo : [essai gratuit de 30 jours](https://scalingo.com/blog/30-days-to-explore-scalingo-free-trial-details), [fin de l'essai](https://scalingo.com/blog/upcoming-changes-in-our-pricing-policy), [contrat de sous-traitance](https://scalingo.com/data-processing-agreement) (moteur) ; dépôt de la documentation : journaux, politique de sauvegarde, bulletin SSB-2026-004, `PROJECT_DIR`, `Procfile`, Node.js ; [mise en ligne depuis GitHub](https://doc.scalingo.com/platform/deployment/deploy-with-github) (moteur).

*Les sources sur les prêteurs, la location de téléphones, les parts de marché et Android, citées par les versions précédentes, ne servent plus ; elles restent dans l'historique du dépôt.*
