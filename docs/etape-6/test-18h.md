# Le test du message de 18h : préparation

*Étape 6, travail 4 de `docs/plan-construction.md` (partie 4). Back-end et Front-end, 12 octobre 2026. Document de préparation : aucune ligne de code n'est écrite avant votre accord sur ce document (D-001, D-051). Ce qui n'est écrit dans aucune décision est marqué « (proposé) ».*

**Comment lire les faits.**
- **Vérifié** : lu le 12 octobre 2026 sur la page officielle du prestataire, soit ouverte directement, soit telle que la restitue un moteur de recherche (l'ouverture directe de plusieurs sites est bloquée depuis l'environnement). Les sources, et la manière dont chacune a été lue, sont en fin de document.
- **Relevé** : lu sur un site qui n'est pas celui du prestataire (presse, revendeur, forum).
- **De mémoire** : ce que savent les agents, à confirmer.
- **Estimation** : l'avis chiffré de l'équipe, pas un devis.

---

## En bref

**Ce que le test vérifie.** Une page nue, en icône sur cinq téléphones, reçoit-elle le message vers 18h, trois soirs de suite ? La connexion Google ou Apple marche-t-elle depuis l'icône ? Premier code : tout le jeu repose sur ce rendez-vous. En cas d'échec, la question vous revient (D-035).

**Ce que vous faites**, à votre nom, sans nous confier de mot de passe (D-048), environ quatre heures et demie : ouvrir l'essai de Scalingo, régler les connexions Google et Apple (nos pas-à-pas), trouver trois prêteurs, installer, puis deux minutes chaque soir.

**Les dépenses** :
- Scalingo, 0 € (essai gratuit) ;
- Android d'essai, 130 à 150 € (proposé) ;
- prêts, 0 € ;
- domaine, environ 10 €, en cas de refus.

**Total : 130 à 160 € recommandé (0 € sans Android).**

**Durée** : huit à dix jours.

**Ce que vous validez en plus** : une copie du projet réservée à la mise en ligne, qui ne reçoit que ce qui est déjà validé (partie 3).

**Android**
Acheter un Android d'essai ?
- **Galaxy A07, environ 140 € (Recommandé)** : un Android français sur deux est un Samsung.
- **Galaxy A17, environ 200 €** : plus durable, inutile ici.
- **Non, emprunter seulement** : un quatrième prêteur, aucun Android pour les travaux 7 et 9.

**Domaine**
Si Apple ou Google refuse l'adresse Scalingo ?
- **Domaine neutre, environ 10 € (Recommandé)** : reprise le jour même.
- **Me redemander d'abord** : quelques jours perdus.
- **Tester sans Apple ni Google** : le plan exige la connexion.

---

## 1. Le test, soir par soir

### Ce que voit chaque téléphone

La page du test n'est pas le jeu. Elle tient sur un écran et dit seulement trois choses :
- si elle est ouverte depuis l'icône ;
- si les messages sont autorisés ;
- si l'on est connecté, et par qui (Apple ou Google), sans jamais afficher l'adresse e-mail.

On y trouve trois boutons : « Recevoir le message de 18h », « Continuer avec Apple » et « Continuer avec Google ». Ses textes sont écrits par UX (proposé). Le message lui-même est neutre, sur les cinq téléphones : « Test, soir 1 sur 3 » (puis 2, puis 3), comme le demande Juridique dans son avis du 12 octobre 2026. Ce n'est pas un texte du jeu (D-014) : un texte qui ressemble au jeu pourrait inquiéter ou intriguer l'entourage d'un prêteur, sur l'écran verrouillé. La page ne montre aucun texte de l'Assemblée et ne recueille aucun avis : c'est une condition bloquante de Juridique (partie 5).

### Le calendrier du test

**Jour d'installation, « soir 0 » (répétition).** Sur chaque téléphone, avec son propriétaire, vous faites dans l'ordre :
1. ouvrir le lien dans le navigateur (Safari sur iPhone, Chrome sur Android) ;
2. s'y connecter avec Google, comme le ferait un invité après sa première révélation (D-005, condition 1). C'est vous qui tapez, avec le compte Google créé pour le test, jamais celui du prêteur ;
3. ajouter la page à l'écran d'accueil, l'ouvrir depuis l'icône, et s'y reconnecter si elle le demande ;
4. toucher « Recevoir le message de 18h », taper le code d'essai de ce téléphone, puis accepter. Il y a cinq codes, un par téléphone (T1 à T5), que vous seul détenez. Sans code, la page refuse l'abonnement, et elle n'en accepte jamais plus de cinq. La page porte une demande de non-référencement, comme celle de l'essai (D-019). Un inconnu qui trouverait l'adresse ne peut donc pas s'abonner (proposé par Juridique, retenu par l'équipe) ;
5. envoyer un message d'essai immédiat depuis votre page de résultats, pour vérifier tout de suite.

Sur votre seul iPhone (T1), la connexion Apple s'essaie ensuite, directement depuis l'icône, avec votre propre compte Apple. Environ quinze minutes par téléphone. À 18h, un premier envoi sert de répétition : il ne compte pas.

**Soir 1.** À 18h00, le serveur envoie le message aux cinq téléphones.

**Soir 2.** Personne n'a rouvert l'icône depuis la veille : c'est exprès. On vérifie que l'abonnement tient sans qu'on ouvre l'icône (`docs/plateforme.md`, limite 4).

**Soir 3.** Même règle. En plus, chacun éteint puis rallume son téléphone avant 18h (proposé), comme il arrive dans la vraie vie ; après 18h, ce redémarrage fausserait la mesure. Après le message, on ouvre enfin l'icône : est-on toujours connecté, trois jours plus tard ?

Entre deux soirs, chacun se sert de son téléphone comme d'habitude. On ne touche à aucun réglage de batterie ni de concentration : on veut savoir ce qui arrive dans des conditions ordinaires. On note seulement ces réglages à l'installation (liste de contrôle, proposé).

### Ce qu'on mesure

Pour chaque téléphone et chaque soir, la page de résultats, que vous seul ouvrez, montre les trois premières choses ; la quatrième vous arrive par SMS :
1. **L'heure d'envoi** par notre serveur, et la réponse du service d'acheminement : celui d'Apple pour un iPhone, celui de Google pour Chrome.
2. **L'heure de réception** : à l'arrivée du message, le téléphone le dit au serveur, qui note l'heure. On ne garde pas l'heure du téléphone lui-même : ce serait un champ de plus, et la précision gagnée (quelques secondes) ne change rien pour un rendez-vous « vers 18h ».
3. **L'écart à 18h00**, en secondes.
4. **« Vu »** : le prêteur vous envoie un SMS chaque soir (« vu à 18h01 », ou « rien vu »). Vous le reportez le soir même, en trois cases seulement : « à l'heure (avant 18h05) », « plus tard » ou « rien vu », jamais à la minute (avis de Juridique) : l'heure exacte où quelqu'un regarde son téléphone est un renseignement sur sa vie. Recevoir et voir sont deux choses différentes : un iPhone réglé en « Résumé programmé » reçoit le message à 18h, mais ne le montre qu'à l'heure du résumé.

Exemple de ligne : « T4 · Xiaomi · Android 14 · soir 2 · envoyé 18:00:01 · accepté · reçu 18:00:09 · écart 9 s · vu : plus tard (SMS) ». Le « vu » vient du SMS et n'entre pas dans la base.

Aucun autre champ n'est gardé dans la base. En particulier, jamais l'heure à laquelle un prêteur ouvre l'icône : ce serait un renseignement sur sa vie (avis de Juridique, retenu).

On relève aussi le nom du service d'acheminement de chaque téléphone (Apple, Google, d'autres s'il y en a), jamais l'adresse d'un abonnement. C'est la liste que `docs/etape-6/donnees.md` (P-12) demandait de vérifier à ce travail.

### Ce qui fait réussir ou échouer (proposé)

- **À l'heure** : reçu avant 18h02. C'est l'heure de l'alerte prévue en exploitation (D-043).
- **Acceptable** : reçu avant 18h05.
- **En retard** : reçu entre 18h05 et 18h30.
- **Manqué** : rien à 18h30.

**Le message réussit** si les quinze réceptions (cinq téléphones, trois soirs) sont à l'heure ou acceptables.

**La connexion réussit** si, sur chaque téléphone où elle est essayée (partie 2), trois choses tiennent :
- **depuis l'icône** : on touche « Continuer avec… », on passe chez Apple ou Google, et on revient dans l'icône, connecté ;
- **après l'ajout de l'icône** : connecté d'abord dans le navigateur, on ouvre l'icône. Sur iPhone, on s'attend à y être déconnecté : l'icône a sa propre mémoire, séparée de Safari (relevé, témoignages de développeurs). La reconnexion depuis l'icône doit réussir et retrouver le même compte, pas en créer un second ;
- **dans la durée** : au soir 3, l'icône rouverte montre qu'on est toujours connecté.

**Deux échecs déjà connus ailleurs**, que le test cherche exprès :
- Google refuse parfois les connexions qui viennent d'une icône d'iPhone. Il les prend pour une fenêtre intégrée à une application (message « disallowed_useragent ») : des développeurs l'ont signalé (relevé, forums ; reports anciens, situation actuelle inconnue) ;
- le passage chez Apple ou Google peut ramener dans Safari au lieu de l'icône.

### Ce qu'on fait en cas d'échec (proposé)

- **Le téléphone était éteint, en mode avion ou sans réseau** (le prêteur le dit) : le soir ne compte pas. On ajoute un soir pour ce téléphone.
- **L'envoi est parti en retard ou a échoué chez nous** : on corrige, avant 15h et jamais le dimanche (D-043), et on ajoute un soir. C'est une panne de notre côté, pas un échec du canal.
- **Un téléphone allumé ne reçoit pas ou reçoit en retard**, par exemple un Android dont le système a « endormi » Chrome. On note le réglage en cause. Le soir suivant, on le corrige sur ce seul téléphone, pour vérifier que c'est bien lui. Si la cause se règle par un réglage, c'est un fait pour la bêta (un guide de réglage par marque, à écrire par UX), pas un échec du test. Si elle ne se règle pas, c'est un échec.
- **Un échec qui ne s'explique pas**, ou qui touche tous les iPhone, par exemple plus rien après le soir 1 : on arrête. Le constat vous est présenté, avec des options en QCM, comme D-035 le prévoit.
- **La connexion échoue depuis l'icône.** On essaie d'abord, sans rien vous demander, une autre manière d'ouvrir Apple ou Google dans l'icône. Si aucune ne marche, la question vous revient (D-035). Les options seront alors, par exemple : se connecter avant d'ajouter l'icône, puis entrer dans l'icône avec un code à six chiffres ; ou garder seulement l'e-mail sur iPhone.

---

## 2. Les cinq téléphones

### Le mélange proposé : deux iPhone, trois Android

| | Téléphone | Système | Pourquoi lui | Connexion essayée |
|---|---|---|---|---|
| T1 | **Votre iPhone** | iOS 16.4 au moins | Le cas le plus incertain : message seulement depuis l'icône, connexion depuis l'icône | Google (compte de test), puis Apple (votre compte) |
| T2 | **Un iPhone prêté**, de préférence sur une version d'iOS plus ancienne que la vôtre (16.4 au moins) | iOS 16.4 au moins | Une seconde version d'iOS, et les réglages de quelqu'un d'autre | Google seulement, compte de test ; **jamais Apple** (plus bas) |
| T3 | **L'Android d'essai** (Samsung, si vous l'achetez ; question « Android ») | Android 10 au moins | Samsung est la première marque Android en France ; ses réglages « applications en veille » coupent les notifications | Google, compte de test |
| T4 | **Un Xiaomi, Redmi ou POCO prêté** | Android 10 au moins | Deuxième marque Android en France, connue pour couper les applications en arrière-plan | Google, avec le compte de test |
| T5 | **Un autre Android prêté**, d'une autre marque (Google Pixel, Motorola, Oppo, OnePlus…), ancien si possible | Android 10 au moins | Un Android sans les couches de Samsung ni de Xiaomi, ou un ancien | Google, avec le compte de test |

Pourquoi ce mélange :
- **Le partage en France** (relevé, StatCounter, août 2026) : Apple environ 36 %, Samsung environ 32 %, Xiaomi environ 12 %. Avec T1, T3 et T4, on couvre environ quatre téléphones sur cinq.
- **Deux iPhone, pas plus.** Sur iPhone, le risque vient d'Apple, le même pour tous ; deux versions d'iOS suffisent à le voir. Sur votre iPhone, l'icône des essais (D-019) n'est pas touchée : l'adresse est différente.
- **Trois Android.** Sur Android, le risque vient de chaque marque, qui ajoute ses propres économies de batterie.

### Les versions minimales, et ce qui change selon les marques

**iPhone.**
- Une page installée sur l'écran d'accueil peut recevoir un message **depuis iOS 16.4**. Dans Safari sans l'icône, jamais (vérifié, Apple). Votre version se lit dans Réglages › Général › Informations.
- L'autorisation doit être demandée après un toucher sur un bouton : c'est le rôle de « Recevoir le message de 18h » (vérifié, Apple).
- Chaque message reçu doit s'afficher. Sinon, Safari retire l'autorisation (vérifié, Apple). La page du test affiche donc toujours le message.
- Aucun abonnement développeur Apple n'est nécessaire pour envoyer ces messages (vérifié, Apple). Votre compte développeur ne sert qu'à la connexion Apple.
- **Depuis iOS 18.4**, Apple propose une seconde forme de message, qui s'affiche même si le code de la page ne tourne pas (vérifié, WebKit). `docs/plateforme.md` (limite 4) attend du test le choix entre les deux formes. Proposé :
  - la forme classique sur les cinq téléphones, les trois soirs : c'est elle qui permet de mesurer la réception ;
  - la seconde forme, essayée en plus sur votre iPhone au soir 3, s'il est en iOS 18.4 ou plus récent. On y vérifie aussi que le contenu reste chiffré (P-06, `donnees.md`).

  Un point pèse sur le choix : la bêta doit mesurer « message de 18h reçu » (`docs/produit.md`, section 8). Or, dans la seconde forme, le téléphone ne prévient le serveur que si Apple réveille le code de la page. Apple le prévoit avec une option, mais nous n'avons pas pu vérifier qu'elle est livrée (relevé, présentation d'Apple de juin 2025).

**Android.**
- **Android 10 au moins** : depuis la version 139 (août 2025), Chrome ne se met plus à jour en dessous (relevé, presse citant l'aide de Google).
- On utilise **Chrome** sur les trois Android (proposé). Sur un Samsung, le navigateur par défaut est souvent Samsung Internet : on installe la page depuis Chrome. Samsung Internet et Firefox ne sont pas couverts par ce test (limite).
- **Depuis Android 13**, le téléphone demande en plus l'autorisation d'afficher les notifications de Chrome lui-même (vérifié, Android).
- **Le mode veille d'Android** laisse passer un message envoyé en « priorité haute », réservé aux messages qui s'affichent (vérifié, Android). C'est ce qu'on envoie. Un message web en urgence « haute » prend ce chemin (de mémoire).
- **Samsung** : une application « en veille prolongée » ne reçoit plus ses notifications ; on le voit dans Paramètres › Notifications (vérifié, aide de Samsung). Le test dit si Chrome y tombe en trois jours d'usage normal.
- **Xiaomi** : les réglages « Économiseur de batterie » de l'application (choisir « Aucune restriction ») et « Démarrage automatique » sont souvent cités comme causes de messages perdus (relevé, sources tierces ; noms variables selon les versions).
- **Huawei récents** (depuis 2019 environ) : sans les services de Google, Chrome n'y reçoit pas de message (de mémoire). À ne pas prendre pour T5.

### Les prêteurs : qui, comment, ce qu'ils font (proposé)

- **Qui** : trois de vos proches, majeurs, et dont le téléphone n'est qu'à eux, jamais partagé en famille (proposé par Juridique, retenu par l'équipe). Ils gardent leur téléphone. Le « prêt », c'est l'usage de leur téléphone pendant trois soirs : rien ne change de mains. La location ne convient pas : les offres trouvées sont au mois, avec engagement (relevé). Si un prêteur manque, un téléphone reconditionné, revendu après, vous serait présenté avec son prix (estimation : 150 à 250 €, non vérifié). Il serait remis à zéro avant la revente (liste de contrôle).
- **Ce qu'ils reçoivent** : la note de Juridique (partie 5), remise avant qu'on touche à leur téléphone. C'est une condition bloquante.
- **Ce qu'ils font** :
  1. une installation d'environ quinze minutes avec vous, en personne de préférence ;
  2. ne pas ouvrir l'icône avant le message du soir 3, et éteindre puis rallumer le téléphone une fois ce jour-là, avant 18h ;
  3. vers 18h, garder le téléphone allumé et connecté, comme d'habitude ;
  4. chaque soir, un SMS : « vu à 18h… », « rien vu » ou « éteint » ; au soir 3, ouvrir l'icône et dire si elle montre « connecté » ;
  5. à la fin, supprimer l'icône.
- **Ce qu'ils ne font pas** : se connecter avec leur propre compte Apple ou Google. Sur leurs téléphones, c'est vous qui vous connectez, avec le compte Google créé pour le test. Le projet Google en mode « Test » ne liste que ce compte : Google refuse lui-même tout autre compte.
- **Pourquoi jamais Apple sur T2.** Sur l'iPhone d'un prêteur, Safari propose d'office le compte Apple du téléphone, donc le sien (de mémoire) ; un seul toucher le relierait au jeu. La connexion Apple ne s'essaie donc que sur votre iPhone (T1), avec votre compte (avis de Juridique, retenu). Si un toucher l'a fait quand même, on efface sa ligne tout de suite, et le prêteur retire le lien dans les réglages de son compte Apple.

---

## 3. Ce que vous faites vous-même, dans l'ordre

Tout est à votre nom (D-042). L'équipe vous donne, pour chaque démarche, un pas-à-pas écran par écran avec les valeurs exactes à saisir (proposé). Vous ne nous transmettez jamais un mot de passe, une clé ni un code secret (D-048).

**Comment l'équipe met le test en ligne sans vos mots de passe.**
1. Les agents écrivent le code et le déposent sur GitHub, dans votre dépôt public : le code ne contient aucun secret ni aucune donnée.
2. Vous liez une fois Scalingo à ce dépôt. Scalingo installe alors lui-même chaque nouvelle version, après que les tests automatiques sont passés : Scalingo attend leur résultat avant d'installer (vérifié, Scalingo).
3. Les secrets (clé Apple, code secret Google, votre code d'accès à la page de résultats) sont saisis par vous, dans les réglages de l'application chez Scalingo. Ils n'apparaissent nulle part ailleurs ; une recherche automatique de secrets dans le dépôt le vérifie (P-16).
4. Les agents n'ont aucun accès à Scalingo, ni à Apple, ni à Google, et n'ouvrent pas la page du test en ligne.
5. Si une installation échoue, vous nous copiez le message d'erreur de la **fabrication** chez Scalingo (pas un journal de l'application en marche) : il ne contient aucune donnée de prêteur.
6. **En cas de panne pendant le test** (un message qui ne part pas, une page qui ne répond pas), c'est vous qui regardez, comme D-048 le prévoit. Les agents ne reçoivent qu'un relevé du type « téléphone 4 : reçu à 18h01 » ou « non reçu », sans adresse ni abonnement. Jamais les journaux de l'application en marche (D-052, point 3 ; avis de Juridique, retenu).
7. À la fin, vous nous copiez le tableau des résultats, sous la même forme, avec le « vu » en trois cases. Le tableau reste dans la conversation (partie 5) ; seul un bilan chiffré, sans heures par téléphone, entre dans le dépôt public (comme D-017) (proposé).

**La règle des horaires, répétée dès le test (proposé).** Scalingo installe depuis une branche réservée, qui ne reçoit que des versions déjà sur `main`. Les agents n'y poussent jamais de 15h à 19h ni le dimanche (D-043). En plus, les tests automatiques échouent volontairement dans ces créneaux : Scalingo refuse alors d'installer. Sans cette branche, chaque mise à jour de la documentation, poussée sur `main`, réinstallerait le test, même à 17h. En mots simples : une copie du projet réservée à la mise en ligne, qui ne reçoit que ce qui est déjà validé. C'est un ajout à la règle de poussée de `CLAUDE.md`, de même nature que la branche `gh-pages` (D-019) : vous l'acceptez en validant ce document (partie « Décisions antérieures touchées »).

Le test est traité comme la version en ligne (`docs/plateforme.md`, §1) : les agents ne poussent sur cette branche qu'après votre feu vert écrit, donné par message, la veille (proposé).

| # | Démarche | Pourquoi | Temps | Argent | Ce que l'équipe prépare |
|---|---|---|---|---|---|
| 1 | Trouver trois prêteurs (partie 2) et leur envoyer la note | Les cinq téléphones | 30 min de messages | 0 € | La liste des modèles qui conviennent, la note (Juridique) |
| 2 | Commander l'Android d'essai, si vous dites oui | T3, puis travaux 7 et 9 | 10 min ; livraison sous 1 à 3 jours (estimation) | Question « Android » | Le modèle exact |
| 3 | **Scalingo** : créer le compte avec la double vérification de connexion (P-16), accepter le contrat de sous-traitance des données et vérifier qu'il couvre l'essai gratuit, créer l'application du test (région Paris) et sa base d'essai, lier le dépôt GitHub, saisir votre code d'accès aux résultats et les cinq codes d'essai. Demander à Scalingo combien de temps il garde ses journaux et ses sauvegardes après suppression : ce chiffre va dans la note aux prêteurs. Lui demander aussi la liste de ses sous-traitants (`docs/plateforme.md`, limite 1 ; P-12) : elle va au registre des prestataires | L'hébergeur choisi (D-048) ; l'essai gratuit commence à l'ouverture | 45 min, plus la réponse de Scalingo | 0 € pendant 30 jours (vérifié) | Le pas-à-pas, la question écrite pour Scalingo, le nom de la branche, l'adresse de la page (du type `elenchos-test-18h.osc-fr1.scalingo.io`) |
| 4 | **Google** : dans la console Google Cloud, créer un projet, l'écran d'accord en mode « Test », n'y ajouter que le compte de test, créer l'identifiant « application Web » avec l'adresse de retour donnée, saisir son code secret chez Scalingo ; créer un compte Google de test (Google peut demander un numéro de téléphone, de mémoire) | La connexion Google (D-035) | 40 min, compte de test compris | 0 € (de mémoire : aucun moyen de paiement demandé pour la connexion) | Le pas-à-pas, l'adresse de retour exacte |
| 5 | **Apple** : dans votre compte développeur, créer l'identifiant d'application (avec « Se connecter avec Apple » coché), l'identifiant de service avec le domaine et l'adresse de retour, la clé privée (téléchargeable une seule fois) ; saisir chez Scalingo la clé, son numéro, votre numéro d'équipe et l'identifiant de service | La connexion Apple (D-035) ; votre compte est déjà ouvert (D-047) | 40 min | 0 € de plus | Le pas-à-pas, les valeurs à saisir |
| 6 | Remettre la note à chaque prêteur, puis la séance d'installation (partie 1, soir 0) | Mettre les cinq téléphones en route | Environ 1 h 15, déplacements non comptés | 0 € | La liste de contrôle, une page d'aide à l'installation (textes d'UX) |
| 7 | Chaque soir, vers 18h10 : regarder la page de résultats, lire les SMS | Le relevé | 2 min par soir | 0 € | La page de résultats |
| 8 | À la fin : « Tout effacer », supprimer l'application chez Scalingo, retirer les accès (partie 5), nous copier le tableau | P-43 | 20 min | 0 € | Le pas-à-pas d'effacement |

Environ **deux heures trois quarts** de démarches, plus la séance d'installation, les soirs et l'effacement : environ **quatre heures et demie** en tout.

**Ce que disent aujourd'hui Apple et Google** (vérifié le 12 octobre 2026, sauf mention).

- **Apple accepte-t-il une adresse `*.scalingo.io` ?**
  - La page d'aide d'Apple demande, pour la connexion sur le web, un « identifiant de service » rattaché à un identifiant d'application. On y déclare au moins un domaine et les adresses de retour, dix au plus pour un compte individuel. Elle précise : « Vous n'avez pas besoin de déposer un fichier sur votre serveur pour enregistrer les domaines » (vérifié). Rien n'exige donc un domaine à soi, et rien n'interdit une adresse d'hébergeur.
  - Deux réserves, franchement. La documentation d'Apple pour les développeurs dit encore qu'il faut « enregistrer et vérifier » les domaines, et « une app existante dans l'App Store » (vérifié) : elle contredit sa page d'aide sur ces deux points. Nous n'avons trouvé aucun témoignage pour ou contre `scalingo.io` en particulier.
  - De mémoire, un identifiant d'application suffit, sans app publiée.
  - **Réponse : probablement oui, non vérifié en pratique.** On le saura en cinq minutes, à la démarche 5. Sinon : question « Domaine ».
- **Le mode « Test » de la console Google suffit-il pour cinq téléphones ?**
  - **Oui.** En mode « Test », seuls les comptes Google ajoutés à la liste peuvent se connecter, cent au plus, et leur accord expire sept jours après qu'ils l'ont donné (vérifié). La limite porte sur les comptes, pas sur les téléphones : un seul compte, celui du test, sert sur les cinq ; le test dure trois soirs. Ce mode protège aussi les prêteurs : Google refuse tout compte qui n'est pas sur la liste.
  - Un écran « application non validée par Google » peut s'afficher ; il suffit de continuer (de mémoire).
  - Google exige que l'adresse de retour soit en « https » et sur une extension publique (vérifié). Pour l'ouverture au public, il faut en plus prouver que le domaine est à soi (relevé, source tierce). Ce sera la vraie adresse du jeu, achetée après la vérification du nom (D-043, D-047).
  - `scalingo.io` n'est pas sur la liste publique des extensions partagées (vérifié). Google le traite donc comme un domaine ordinaire, qui n'est pas à vous. En mode « Test », nous pensons que cela passe (non vérifié). Sinon : question « Domaine ».

---

## 4. Les dépenses, une par une (D-042)

| Dépense | Montant TTC | Statut, source, date | Quand | Ce qui en dépend | Si vous dites non |
|---|---|---|---|---|---|
| **Hébergement Scalingo pendant le test** | **0 €** | Vérifié le 12 octobre 2026 (Scalingo) : essai de 30 jours sans carte bancaire. Il comprend une application de 5 conteneurs au plus et une base de données dans sa plus petite formule | Démarche 3 | Tout le test | Pas de test : la question vous revient |
| Suite de l'hébergement, après les 30 jours | Environ 26 € par mois (vérifié le 11 octobre, `docs/plateforme.md`) | Hors test : présentée au moment venu (D-042) | Environ 30 jours après l'ouverture du compte | La construction (travail 5) | Sans moyen de paiement, l'application est arrêtée, puis ses données effacées 30 jours plus tard (vérifié) |
| **Android d'essai** (proposé) | **130 à 150 €** pour un Galaxy A07 de 128 Go ; environ 170 à 200 € pour un Galaxy A17 | Relevé chez des revendeurs, octobre 2026 (Powerplanet ; Phonandroid, 4 août 2026 : A17 conseillé à 199 €). La boutique de Samsung n'a pas pu être lue | Démarche 2, dès votre accord | T3, puis les écrans sur Android (travail 7) et votre invitation depuis un Android (travail 9) | Un quatrième prêteur (un Android) ; pas d'Android à vous pour la suite |
| **Prêt de trois téléphones** | **0 €** | Proposé | Démarche 1 | T2, T4, T5 | Sans prêteur : un reconditionné, présenté avec son prix |
| Location de téléphones | Écartée | Relevé : offres au mois, avec engagement | — | — | — |
| **Nom de domaine** | **0 €** a priori ; **environ 10 €** par an si Apple ou Google refuse l'adresse de Scalingo | Estimation, non vérifiée. Un domaine neutre, sans le nom du jeu, chez un bureau d'enregistrement européen (D-043) | Seulement si un refus survient | La connexion Apple ou Google | Question « Domaine » |
| Compte développeur Apple | 0 € de plus | Déjà ouvert (D-047) | — | La connexion Apple | — |
| Console Google | 0 € | De mémoire | Démarche 4 | La connexion Google | — |
| **Total du test** | 0 € sans Android ; 130 à 150 € avec le Galaxy A07 ; **160 €** si Apple ou Google refuse l'adresse de Scalingo ; jusqu'à 210 € avec le Galaxy A17 et le domaine. Hors total : un téléphone reconditionné (150 à 250 €) si un prêteur manque, présenté avec son prix le moment venu. | | | | |

Par rapport au plan (partie 6) :
- la ligne « Android, 100 à 200 € » est tenue ;
- l'hébergement commence au travail 4, non au travail 5 comme la ligne du plan (partie 6) le disait ; gratuit, comme `docs/plateforme.md` le disait ;
- le prêt des téléphones, « non chiffré » dans le plan, coûte 0 € ;
- le domaine neutre (environ 10 €), s'il est acheté, **s'ajoute** à la ligne « adresses web » du plan, qui vise les adresses définitives.

**Un point d'horloge à connaître.** L'essai de Scalingo court dès l'ouverture du compte. Le test en prend environ dix jours. Il en restera une vingtaine pour commencer le socle (travail 5). Le passage au payant vous sera présenté à ce moment-là.

---

## 5. Ce qui est gardé, et effacé

On applique P-43 et P-10 (`docs/etape-6/donnees.md`) : la page du test ne garde que ce qu'elle teste.

| Ce qui est gardé | Pourquoi | Où | Jusqu'à quand |
|---|---|---|---|
| L'abonnement au message de chaque téléphone : l'adresse technique où son service d'acheminement le joint, et ses clés de chiffrement | Envoyer le message | Base du test, chez Scalingo | Fin du test |
| L'étiquette du téléphone : son numéro, sa marque et la version de son système (« T4 · Xiaomi · Android 14 »), jamais un nom | Lire les résultats par marque et par version | Idem | Fin du test |
| Les heures : envoi, réponse du service d'acheminement, réception notée par le serveur | La mesure | Idem | Fin du test. Puis le tableau par téléphone numéroté (marque, système, heures, « vu » en trois cases), sans adresse ni nom, jusqu'au [20 novembre 2026], pour le bilan, puis effacé. Seul reste le bilan chiffré, sans heure par téléphone. |
| La connexion : l'identifiant renvoyé par Apple ou Google, gardé sous forme d'empreinte, et « adresse e-mail reçue : oui ou non » | Vérifier qu'on retrouve le même compte en se reconnectant | Idem | Fin du test |

**Ce qui n'est jamais gardé** : aucune réponse, aucun pseudo, aucun nom, aucune adresse e-mail.
- L'adresse renvoyée par Apple ou Google est lue, notée « reçue », puis jetée (proposé). C'est plus strict que P-43, qui permettait de la garder le temps de l'essai : une précision, pas un changement.
- On demande pourtant l'adresse à Apple et à Google, comme le fera le jeu (D-035, P-03) : c'est la seule façon d'essayer les vrais écrans d'accord.
- Notre programme n'écrit rien de personnel dans ses journaux (P-07).
- Les journaux de Scalingo notent l'adresse internet de chaque téléphone qui se connecte : leur durée est à connaître avant de remettre la note (`docs/etape-6/donnees.md`, partie 4).
- Aucune ligne de notre journal ne contient un abonnement (P-07), et aucune adresse de page n'en porte (P-08).

**Rien d'Apple ni de Google n'est chargé avant le toucher (P-10).** Les boutons sont de simples liens, sans aucun programme d'Apple ni de Google dans la page. Le relevé du réseau le vérifie automatiquement avant la mise en ligne.

**Une précaution liée à l'adresse de Scalingo (proposé).** L'adresse `scalingo.io` est partagée avec les sites des autres clients de Scalingo. La page protège sa connexion pour qu'aucun de ces sites ne puisse y toucher (réglage standard des navigateurs).

**L'effacement, le lendemain du soir 3** (ou du dernier soir ajouté), pour lire d'abord les heures du soir 3. Dans l'ordre :
1. Vous touchez « Tout effacer » sur la page de résultats. Le programme vide la base, puis vérifie qu'elle est vide (test de P-43).
2. Vous supprimez chez Scalingo l'application du test et sa base, pas seulement leurs lignes. Le sort des sauvegardes de la base d'essai est à connaître avant de commencer (démarche 3) ; de mémoire, elles partent avec elle.
3. Sur les téléphones prêtés, on se déconnecte, puis le prêteur supprime l'icône, ce qui coupe aussi les messages (de mémoire).
4. Vous retirez l'accès du test dans le compte Google de test, puis vous supprimez ce compte. Sur votre iPhone, vous retirez le lien dans « Se connecter avec Apple ».
5. Vous retirez l'adresse du test du projet Google et de l'identifiant de service Apple. Les deux restent pour la suite : la connexion du jeu (travail 9) les reprendra (proposé).
6. Vous écrivez une ligne datée, « effacé le …, vérifié », et vous le confirmez à chaque prêteur, comme la note le promet, et vous supprimez les messages du test dans vos SMS (ci-dessous).
7. Le [20 novembre 2026] (proposé) : vous effacez votre copie du tableau, et vous l'écrivez sur la même ligne datée.

**Les SMS des prêteurs (proposé, avis de Juridique).** Ce sont des données des prêteurs, que vous traitez pour le test. Trois précautions :
- des SMS individuels, jamais un groupe : un groupe ferait connaître les prêteurs entre eux, avec leurs numéros, et un groupe WhatsApp ajouterait un prestataire américain ;
- le soir même, vous reportez le « vu » dans le tableau, en trois cases ;
- le 21 octobre, vous effacez seulement les messages du test, pas le reste de votre conversation avec chaque proche, qui relève de votre vie privée. Une ancienne sauvegarde de votre téléphone peut encore en garder une copie : risque accepté, vu le contenu.

**La copie dans la conversation des agents, franchement.** Les agents ne reçoivent que des lignes sans nom, avec le « vu » en trois cases (partie 3, points 6 et 7). Pour eux et pour le fournisseur d'IA, ces lignes ne se relient à personne : aucun d'eux ne sait qui a quel téléphone. Mais elles restent dans l'historique de travail après le 20 novembre. C'est accepté, selon l'avis de Juridique.

Un prêteur qui se retire en cours de test : on efface sa ligne le jour même. Le test n'atteint alors plus « cinq téléphones, trois soirs », et vous décidez s'il faut reprendre (avis de Juridique).

### La note pour les prêteurs

Rédigée par Juridique, puis relue par lui avec les additions de Back-end et Front-end (avis du 12 octobre 2026). Le texte ci-dessous est sa version définitive, reprise mot pour mot. Elle vouvoie, parce qu'une même note sert à plusieurs lecteurs ; vous pouvez tutoyer dans le message qui l'accompagne. Vos téléphones n'ont pas besoin de note.

> **Test du message de 18h**
>
> Je prépare seul, en mon nom propre, un jeu : Elenchos.
>
> **Installé.** Une page de test en icône, sans jeu ni question. Trois soirs, vers 18h, un message « Test, soir 1 sur 3 ».
>
> **À faire.** Ne pas ouvrir l'icône avant le soir 3. Chaque soir, un SMS : « vu à 18h… », « rien vu » ou « éteint ». Le jour 3, éteindre et rallumer avant 18h ; après le message, ouvrir l'icône et me dire si elle affiche « connecté ».
>
> **Gardé.** L'adresse technique du téléphone et l'heure de réception, sous « téléphone [n] », avec sa marque et la version de son système, jamais votre nom. J'essaie la connexion Google avec un compte créé pour le test, jamais le vôtre.
>
> **Où.** Chez Scalingo, hébergeur, en France. Le message passe, chiffré, par Apple ou Google.
>
> **Jusqu'à quand.** Le [21 octobre 2026], j'efface tout, SMS compris, et vous le confirme ; les journaux techniques de l'hébergeur suivent sous [N] jours. Seul le tableau des heures, sans nom, reste jusqu'au [20 novembre 2026], pour le bilan.
>
> **Retirer (à la fin).** Appui long sur l'icône, puis Supprimer (ou Désinstaller) : les messages s'arrêtent aussi. Couper seulement les messages : Réglages, Notifications, « [Test 18h] ».
>
> **Vos droits.** Ce test repose sur mon intérêt à préparer le jeu. Vous pouvez arrêter, ou tout faire effacer : [prénom, téléphone, e-mail]. Recours : la CNIL (cnil.fr).

Restent à remplir :
- [n], par téléphone ;
- [N], la durée des journaux de Scalingo (démarche 3). Sans ce chiffre, la note ne peut pas être remise : c'est une condition bloquante ;
- vos coordonnées.

Les dates entre crochets suivent le calendrier proposé de la partie 7 (effacement le mercredi 21 octobre 2026, tableau gardé jusqu'au 20 novembre 2026) : elles bougent avec votre accord. [Test 18h] est le nom proposé de l'icône. Sur iPhone, le chemin « Réglages, Notifications » est celui que décrit Apple ; sur Android, il passe par les réglages de Chrome (de mémoire). Juridique et Front-end vérifient les mots exacts sur chaque téléphone.

### L'avis de Juridique : ce qui bloque, ce qui ne bloque pas

*Juridique, avis interne du 12 octobre 2026. Juridique n'est pas avocat.*

**Le cadre.**
- Le RGPD s'applique, mais en petit : l'abonnement d'un téléphone dont on connaît le prêteur, l'heure de réception, l'identifiant de connexion et les adresses internet des journaux de Scalingo sont des données personnelles.
- Le responsable est vous, en nom propre (D-042).
- Juridique recommande l'intérêt légitime (RGPD, art. 6.1.f), avec droit d'opposition : s'opposer revient à supprimer l'icône. Le consentement obligerait à garder une preuve, sans mieux protéger le prêteur. L'équipe retient cette recommandation (proposé par Juridique, retenu par l'équipe), sans question à vous (D-009).
- Ce que la page garde dans le téléphone (abonnement, session) est strictement nécessaire : pas de bandeau.

**Les cinq conditions bloquantes** (proposé par Juridique, retenu par l'équipe), sans lesquelles le test ne commence pas :
1. **Aucun contenu politique** sur la page ni dans le message. Sinon, les opinions deviennent des données sensibles (RGPD, art. 9), et tout change.
2. **La note remise avant l'installation**, à chaque prêteur, sur papier ou par message.
3. **Des comptes de test seulement** sur les téléphones prêtés : jamais le compte Google ni Apple d'un prêteur.
4. **Le contrat de sous-traitance de Scalingo en place** (RGPD, art. 28), et vérifié comme couvrant l'essai gratuit avant de mettre une donnée dans la base. Juridique l'a trouvé publié, par une recherche, sans pouvoir ouvrir la page.
5. **L'effacement fait et vérifié** le lendemain du soir 3, et la durée des journaux de Scalingo connue avant de remettre la note.

**Les risques, et leurs parades**, en bref :
- un prêteur se connecte avec son compte Google : mode « Test » de Google avec le seul compte de test ; c'est vous qui tapez ;
- Safari propose le compte Apple d'un prêteur : jamais de connexion Apple sur T2 ;
- le compte de test reste sur un téléphone prêté : déconnexion, icône supprimée, compte supprimé ; le mot de passe n'est jamais donné ;
- un prêteur mineur, ou un téléphone partagé en famille : prêteurs majeurs, téléphone à eux seuls ;
- un message qui ressemble au jeu inquiète l'entourage : « Test, soir n sur 3 » ;
- le test garde plus que prévu (heure d'ouverture, adresse internet en base) : les champs sont fixés par la carte de la base (P-43), et la marque et la version sont dites dans la note ;
- une panne pousse à montrer des journaux aux agents : vous regardez ; les agents ne reçoivent qu'un relevé sans adresse (D-048) ;
- un inconnu s'abonne : un code d'essai par téléphone, cinq abonnements au plus ;
- un prêteur se retire : sa ligne est effacée le jour même, et vous décidez s'il faut reprendre.

**Ce que Juridique juge non bloquant.**
- **Le registre des traitements** : probablement pas obligatoire pour un test occasionnel, sans donnée sensible. Juridique recommande quand même une ligne dans le futur registre du jeu : cinq minutes, et elle prouve le sérieux. L'équipe la rédige (proposé).
- **L'analyse d'impact** : non requise pour ce test.
- **L'avocat** : non pour ce test ; sa première relecture reste avant la bêta (D-044). Une question à lui poser alors : le statut des services d'acheminement des messages.
- **Le délégué à la protection des données** : sans objet.

---

## 6. Ce que l'équipe construira ensuite

Trois morceaux, plus une page de résultats.

1. **La page.** Elle s'installe sur l'écran d'accueil, demande l'autorisation des messages après un toucher, reçoit le message et prévient le serveur de sa réception. Elle offre « Continuer avec Apple » et « Continuer avec Google ».
2. **Le service qui envoie à 18h.** Un petit programme tourne en permanence chez Scalingo et tient l'horloge, à l'heure de Paris, changements d'heure compris (vérifiés par un test automatique sur une horloge simulée). À 18h, il envoie le message, chiffré pour chaque téléphone (P-06), en « urgence haute ». S'il redémarre à 18h00 et 30 secondes, il voit que l'envoi n'a pas eu lieu et le fait, sans jamais envoyer deux fois.
3. **La mesure.** Les heures, la page de résultats, réservée à vous par votre code d'accès, les cinq codes d'essai, le bouton d'essai immédiat et « Tout effacer ».

**Jetable** : la page elle-même et ses textes, la page de résultats, l'application et la base du test chez Scalingo.

**Repris pour le vrai jeu** (proposé) :
- l'envoi du message, avec son chiffrement et la gestion des abonnements expirés ;
- l'horloge de 18h ;
- la réception dans le téléphone ;
- la mesure « message de 18h reçu », que la bêta demande (`docs/produit.md`, section 8) ;
- la connexion Apple et Google, avec la bibliothèque prévue (`docs/plateforme.md`, annexe C) ;
- la chaîne de mise en ligne GitHub → Scalingo, avec la règle des horaires ;
- les tests de P-05, P-06, P-10 et P-43.

**Le circuit s'applique au code** (plan, partie 4) : tests automatiques, puis Cohérence, puis le Vérificateur, avant la mise en ligne.

---

## 7. Calendrier

Exemple, si vous donnez votre accord le mardi 13 octobre 2026 (proposé) :

| Jour | Vous | L'équipe |
|---|---|---|
| J0, mardi 13 | Accord ; réponses aux deux questions | Pas-à-pas des démarches 3 à 5 |
| J1, mercredi 14 | Démarches 3, 4 et 5 (environ 2 h), dont la question à Scalingo sur ses journaux ; commande de l'Android ; appel des prêteurs | Construction de la page, du service et de la mesure |
| J2–J3, jeudi 15 et vendredi 16 | Envoi de la note aux prêteurs, dès que Scalingo a donné la durée de ses journaux ; un refus d'adresse éventuel (question « Domaine ») | Tests, Cohérence, Vérificateur ; mise en ligne avant 15h le vendredi ; vous installez T1 et le vérifiez par un message d'essai |
| J4, samedi 17 | Séance d'installation ; à 18h, soir 0 (répétition) | Correction éventuelle avant 15h |
| J5, dimanche 18 | Soir 1 | Aucune mise en ligne (D-043) |
| J6, lundi 19 | Soir 2 | Correction éventuelle avant 15h |
| J7, mardi 20 | Soir 3 (chacun : un redémarrage avant 18h) | — |
| J8, mercredi 21 | Effacement ; vous nous copiez le tableau | Bilan, par le circuit habituel |
| Vendredi 20 novembre | Effacement de votre copie du tableau (proposé) | — |

**Huit jours si tout passe, dix avec un soir ajouté.** Le plan disait « environ une semaine ». Tout se tient avant le changement d'heure du dimanche 25 octobre. Ce changement est couvert par un test automatique, pas par un vrai soir.

---

## 8. Limites et doutes

**Ce que le test ne prouve pas.**
- **Cinq téléphones, trois soirs.** Le test dit si le canal marche, pas à quelle fréquence il échoue sur des milliers de téléphones. La bêta le mesurera (« message de 18h reçu », `docs/produit.md`, section 8).
- **Trois jours sans ouvrir l'icône, pas trois semaines.** Si un iPhone retire un abonnement après des semaines sans ouverture, nous ne le verrons qu'en bêta. Un joueur en pause (D-029) en serait le premier touché.
- **Les marques non couvertes** : Samsung Internet, Firefox, les Huawei récents, les tablettes.
- **La forme de message d'iOS 18.4** n'est essayée qu'un soir, sur un seul iPhone.
- **Le geste d'ajout de l'icône par un inconnu**, sans vous à côté, n'est pas essayé : c'est un critère de la bêta (D-005).
- **La notification dans le navigateur, sans icône, sur Android** (le canal que D-005 prévoit pour Android) n'est pas essayée : les trois Android sont testés page installée.
- **La connexion par e-mail avec un code** (D-035) n'est pas dans ce test : elle viendra avec les e-mails (travail 9).
- **La connexion Apple** n'est essayée que sur un iPhone, le vôtre, et pas sur Android. La connexion Google ne l'est qu'avec un compte de test : un compte réel, plus ancien et plus chargé, pourrait se comporter autrement (doute faible).

**Ce qui reste incertain avant de commencer.**
- **Apple et l'adresse de Scalingo** : la documentation d'Apple se contredit (partie 3). Le doute se lève en cinq minutes, à la démarche 5.
- **Scalingo** : on ne sait pas encore si son contrat de sous-traitance couvre l'essai gratuit, ni combien de temps il garde ses journaux et ses sauvegardes. Ce sont deux conditions bloquantes de Juridique (partie 5) ; si Scalingo tarde à répondre, le test glisse d'autant.
- **Google et une icône d'iPhone** : des refus ont été signalés par le passé (relevé, forums anciens). C'est le risque le plus probable d'échec de la connexion, et la raison d'être de cette partie du test.
- **Les prix** du Galaxy viennent de revendeurs, pas de Samsung.
- **L'heure de réception**, notée par le serveur, est juste à quelques secondes près (estimation). C'est assez pour un rendez-vous « vers 18h ».

**Des agents ne tiennent pas de téléphone** (plan, partie 7) : tout le relevé sur appareil repose sur vous et vos prêteurs. Une fausse manœuvre (icône ouverte entre deux soirs, téléphone éteint) se corrige en ajoutant un soir, pas en réinterprétant.

**À tester avec de vraies personnes, en bêta** :
- la part des joueurs qui reçoivent le message chaque soir, par marque ;
- les réglages de batterie à expliquer, par marque ;
- la connexion depuis l'icône chez des personnes qui ne sont pas guidées.

---

## Décisions antérieures touchées

**Aucune n'est modifiée.** Ce document applique :
- D-005 : page nue, cinq téléphones, trois soirs ;
- D-035 : la connexion essayée, et la question qui revient en cas d'échec ;
- D-042 : dépense par dépense ;
- D-043 : la règle des horaires, Scalingo européen, les seules sorties d'Europe permises ;
- D-047 : le compte Apple ;
- D-048 : vos comptes, vos mots de passe, aucune donnée pour les agents ;
- D-052, point 3 : aucun journal aux agents ;
- P-10 et P-43 de `docs/etape-6/donnees.md`.

Précisions, signalées :
- **P-43, précisions proposées par Juridique**, toutes retenues **(proposé : elles ne valent qu'avec votre accord sur ce document)** :
  - « vos comptes ou des comptes créés pour le test » devient « jamais le compte d'un prêteur ; Apple seulement sur votre iPhone, ou avec un compte Apple de test » ;
  - « effacé à la fin des trois soirs » devient « effacé le lendemain du troisième soir, et vérifié » ;
  - les champs gardés sont fixés : jamais l'heure d'ouverture ; la marque et la version du système, demandées par Back-end et Front-end et dites dans la note (condition de Juridique) ;
  - l'abonnement n'est accepté qu'avec un code d'essai, cinq au plus.
- **P-43 et la ligne « Test du message de 18h » de la carte des données** (`docs/etape-6/donnees.md`, partie 4) disent « effacé à la fin des trois soirs ». Le tableau d'heures par téléphone, sans adresse ni nom, gardé jusqu'au 20 novembre 2026 pour le bilan, en est une exception (avis de Juridique). Elle sera écrite dans les deux si vous validez ce document.
- **P-43, précision de Back-end et Front-end** : l'adresse e-mail renvoyée par Apple ou Google n'est pas gardée du tout, et l'identifiant ne l'est que sous forme d'empreinte. C'est plus strict que P-43.
- **D-035** : ne demander que l'identifiant et l'adresse, dès le test.
- **D-048** : appliqué au test. En cas de panne, vous regardez ; les agents ne reçoivent qu'un relevé sans adresse.
- **Plan, travail 4, « prêtés ou loués »** : la location est écartée (proposé), faute d'offre à la semaine.
- **Plan, partie 6** : le prêt des téléphones, « non chiffré », coûte 0 €. La ligne Android est tenue.
- **`docs/plateforme.md`, limite 4** : le choix entre les deux formes de message sur iPhone est proposé ici (partie 2). Il sera tranché au bilan du test, sans question à vous, sauf si le test contredit le besoin de mesurer la réception.
- **`docs/etape-6/donnees.md`, P-12** : la liste des services d'acheminement est relevée pendant le test.
- **`CLAUDE.md`, règle de poussée** : une branche de mise en ligne s'ajoute (partie 3). Elle ne reçoit que des versions déjà sur `main`, n'est jamais fusionnée ailleurs et ne réécrit rien. C'est un ajout à la règle, de même nature que la branche `gh-pages` (D-019). Il vous revient : en validant ce document, vous l'acceptez, et nous l'inscrivons dans `docs/decisions.md` et `CLAUDE.md`.
- **D-014** : le message du test, « Test, soir n sur 3 », n'est pas un message du jeu. Les textes validés ne sont ni employés ni changés.

---

## Sources consultées le 12 octobre 2026

*« Ouverte » : page lue directement. « Moteur » : page officielle restituée par un moteur de recherche, sans ouverture. Les sites de Scalingo, de Google (aide et documentation), de Samsung, de WebKit et de StatCounter n'ont pas pu être ouverts depuis l'environnement.*

**Apple**
- [Envoyer des messages web dans les apps web et les navigateurs](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) (ouverte) : iOS 16.4, toucher obligatoire, message toujours affiché, pas d'abonnement développeur, urgence « haute », adresses `*.push.apple.com`.
- [Configurer « Se connecter avec Apple » pour le web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web) (ouverte) : identifiant de service, dix adresses pour un compte individuel, aucun fichier à déposer.
- [Préparer son environnement pour « Se connecter avec Apple »](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple) (ouverte) : « enregistrer et vérifier » les domaines, « app existante dans l'App Store » (la contradiction).
- WebKit, [Meet Declarative Web Push](https://webkit.org/blog/16535/meet-declarative-web-push/) (moteur) : la seconde forme, iOS 18.4, icônes de l'écran d'accueil.
- Apple, [WWDC 2025, session 235](https://developer.apple.com/videos/play/wwdc2025/235/) (moteur) : l'option qui réveille le code de la page.

**Google et Android**
- Google, aide de la console : [mode « Test » et comptes de test](https://support.google.com/cloud/answer/15549945) (moteur) : cent comptes, accord valable sept jours.
- Google, [règles des adresses de retour](https://developers.google.com/identity/protocols/oauth2/web-server) (moteur) : « https », extension publique.
- Android, [autorisation des notifications](https://developer.android.com/develop/ui/views/notifications/notification-permission) (ouverte) : Android 13.
- Android, [Doze et App Standby](https://developer.android.com/training/monitoring-device-state/doze-standby) (ouverte) : priorité haute en veille.
- Chrome et Android 10 : [9to5Google, 26 juin 2025](https://9to5google.com/2025/06/26/google-chrome-android-versions-no-longer-supported-2025/) (relevé, citant l'aide de Google).
- Connexion Google depuis une icône d'iPhone : [Auth0 Community](https://community.auth0.com/t/getting-google-disallowed-useragent-with-web-app-added-to-ios-homescreen/6705) (relevé, ancien).
- Mémoire séparée entre Safari et l'icône : [Netguru](https://www.netguru.com/blog/how-to-share-session-cookie-or-state-between-pwa-in-standalone-mode-and-safari-on-ios) (relevé).
- Domaine vérifié pour l'ouverture : [Serverpod, dépannage Google](https://docs.serverpod.dev/next/concepts/authentication/providers/google/troubleshooting.md) (relevé).
- [Liste publique des extensions](https://raw.githubusercontent.com/publicsuffix/list/main/public_suffix_list.dat) (ouverte) : `scalingo.io` absent.

**Constructeurs**
- Samsung, [Notifications absentes sur un Galaxy](https://www.samsung.com/uk/support/mobile-devices/what-to-do-if-notifications-are-not-showing-or-there-is-no-sound-on-your-samsung-galaxy-device/) (moteur) : « veille prolongée ».
- Xiaomi : [Dr.Fone](https://drfone.wondershare.com/android-xiaomi/fix-whatsapp-telegram-notifications-delayed-xiaomi.html) et [SportsTrackLive](https://docs.sportstracklive.com/android-battery-saving/xiaomi) (relevés, aucune page officielle trouvée).
- Prix : [Powerplanet, Galaxy A07](https://www.powerplanetonline.com/fr/samsung-galaxy-a07-4g-4go-128go-vert) (relevé) ; [Phonandroid, Galaxy A17, 4 août 2026](https://www.phonandroid.com/galaxy-a17-promo-moins-135-il-a-smartphone-bien-plus-cher.html) (relevé).
- Parts de marché : [StatCounter, France](https://gs.statcounter.com/vendor-market-share/mobile/france) (relevé, moteur).
- Location : [Phonandroid, comparatif](https://www.phonandroid.com/?p=2093485) (relevé).

**Scalingo**
- [Essai gratuit de 30 jours](https://scalingo.com/blog/30-days-to-explore-scalingo-free-trial-details) et [hébergement Node.js](https://scalingo.com/runtimes/nodejs-hosting) (moteur) : sans carte, cinq conteneurs, une base dans sa plus petite formule.
- [Fin de l'essai](https://scalingo.com/blog/upcoming-changes-in-our-pricing-policy) (moteur).
- [Contrat de sous-traitance des données](https://scalingo.com/data-processing-agreement) (moteur, cité par Juridique ; page non ouverte).
- [Mise en ligne depuis GitHub](https://doc.scalingo.com/platform/deployment/deploy-with-github) et [intégration GitHub](https://doc.scalingo.com/platform/app/scm-integration) (moteur) : installation automatique, attente des tests.
