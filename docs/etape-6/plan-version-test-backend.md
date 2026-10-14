*Plan de travail de Back-end, 14 octobre 2026, conservé tel quel ; la synthèse relue est `plan-version-test.md`.*

# Plan de construction côté serveur : la version de test (D-056 à D-059)

*Back-end, 14 octobre 2026. Lu : `CLAUDE.md`, D-001 à D-059, `docs/etape-6/contenu-test.md`, `regles.md`, `donnees.md`, la partie 4 du plan, `docs/plateforme.md`, le code de `test-18h/` et celui de `docs/essai/a-ne-pas-ouvrir-2/outillage/page/` (code seulement, sans `textes.js`). Ce qui n'est tranché par aucune décision est marqué « (proposé) ». Je n'ai modifié aucun fichier.*

## En bref

- Le serveur du test réunit trois choses. D'abord les briques du test de 18h, dont la moitié est reprise telle quelle. Ensuite un moteur de règles porté de l'essai 2, réduit au périmètre de D-058. Enfin un modèle de données d'une douzaine de tables.
- Jusqu'au jalon 7, tout se construit et se prouve en local, sans Scalingo ni domaine. L'essai de 30 jours de Scalingo n'est donc ouvert qu'au jalon 7.
- **Durée : 18 à 29 jours de travail d'agents**, soit 15 à 24 jours sur le chemin critique, parce que le moteur avance en parallèle. Au calendrier, cela fait **4 à 7 semaines**, avec vos feux verts de la veille et trois soirs de test. Confiance moyenne-basse.
- **Coût** : 0 € jusqu'au jalon 7. Ensuite, environ 26 € TTC par mois après les 30 jours d'essai, environ 6 € pour le domaine la première année, et 0 € d'e-mails. Cela reste dans la fourchette de D-057.

## 1. Ce qu'on reprend

**Du test de 18h (`test-18h/`)**

| Sort | Fichiers | Pourquoi |
|---|---|---|
| **Tel quel** | `horloge.ts` ; `garde-horaires.ts` et son outil ; `crypto.ts` ; `push/chiffrement.ts`, `envoyeur.ts`, `services.ts` ; `chiffrementBase` de `base.ts` ; le contrôle du code ; la vérification GitHub ; `Procfile`, Node 22 sans fabrication, `pg`, `oauth4webapi`, pas de cadre web ; leurs tests sans base et le test du journal de PostgreSQL | Ces fichiers sont déjà écrits pour être repris, et testés (82 tests). |
| **Adapter** | `journal.ts` | Les listes fermées s'allongent (routes et événements du jeu). |
| | `planificateur.ts` | On passe du calendrier `SOIRS` à un envoi chaque jour, vers tous les abonnements. Le verrou devient « un envoi par jour et par abonnement ». Les textes deviennent ceux de D-014 (forme du dimanche, formes E1). |
| | `connexion.ts` | Il faut créer le compte, le retrouver, et refuser un compte Google d'organisation (P-41). |
| | `mesure.ts`, `public/sw.js` | La mesure « message reçu » reste. Un toucher sur le message ouvre la révélation. |
| | `serveur.ts` | On garde les en-têtes de sécurité, les cookies `__Host-`, le contrôle d'origine et « rien dans les adresses ». Le limiteur devient propre à chaque session, comme le prévoit `LISEZMOI.md`. |
| | `config.ts` | Nouveaux réglages. Ceux qui sont dangereux (horloge accélérée, connexion d'essai) sont refusés en ligne, comme `IGNORER_HORAIRES`. |
| | `/preparer` | Il fabrique les nouveaux secrets dans votre navigateur. |
| **Jetable** | `pages.ts`, `depot.ts`, `public/` sauf `sw.js`, la page de résultats | Le principe de `effacer.ts` (vider, puis vérifier que c'est vide) sert à « Tout effacer ». |

**Du moteur de l'essai 2 (`moteur.js`, `noyau.js`)**

- **À porter en TypeScript, avec ses tests** :
  - le tirage `t(clé)` (le même résultat, quel que soit qui le déclenche) ;
  - `identiques`, `estJuste`, `redistribuer` (le jumeau, D-024), `verdict` ;
  - les points de `calculerRevelation` ;
  - `avisCercle` (seuil de 3, mention du milieu) ;
  - `classer` et `phraseDuJour` ;
  - Le Devin et Le Mystère de `calculerTitres` ;
  - la table des caractères qui se ressemblent, pour les pseudos (E7).
- **À réécrire, pas à copier** :
  - le choix des cartes : au hasard, sans deux cartes identiques (contenu-test, R4 gardée) ;
  - la carte « qui et pourquoi » : l'essai la prend par le classement, la règle 9 validée (D-052) la tire au sort parmi les cartes servies hors « aucune », et la met en dernier ;
  - **Le Fidèle** : l'essai admettait un membre arrivé en cours de semaine, la règle 12 validée l'exclut ;
  - `phraseDuJour`, qui ne connaît que quatre tensions : il en faut huit, avec les mots de D-053.
- **Abandonné pour le test** : tout ce qui suppose le fichier scellé et des personnages simulés (`histoire`, `calculer`, `devinerPersonnage`), et le portrait, les tempéraments, le Pas de Côté et la phrase de la semaine (D-058). Les fractions exactes deviennent inutiles : la part d'erreurs du Mystère se compare par produits croisés d'entiers.

## 2. Le modèle de données minimal

| Table | Ce qu'elle garde |
|---|---|
| `texte`, `calendrier` | Le contenu public : résumé, tension, sens, quatre raisons (pôle, député, groupe), vote (résultat, date, étape), auteur, erratum, empreinte du contenu. Le calendrier dit, pour chaque jour, quel texte s'ouvre ; les trois textes d'entrée sont communs à tous. |
| `joueur` | Un identifiant tiré au hasard, le pseudo et sa forme de comparaison, le rond, l'état « provisoire » ou « compte ». |
| `identite` | La voie (Apple, Google ou e-mail) et une **empreinte avec clé** (HMAC) de l'identifiant ou de l'adresse. Seul le rôle « comptes » la lit (P-01). |
| `consentement` | La version et l'empreinte de la carte, la date, « 15 ans et plus ». **La base refuse une réponse sans lui** (P-34). |
| `cercle`, `membre` | Unicité sur le joueur : un seul cercle par personne (D-058). |
| `invitation` | L'empreinte du jeton, l'expiration, le joueur lié, l'accord de l'invitant (P-35), le score d'entrée. |
| `reponse` | Position et raison **chiffrées** par le programme (P-02), une par texte. |
| `manche` | Les cartes (numéro tiré au hasard, auteur, cachée ou non), les désignations, les verdicts, « validée le ». |
| `semaine_cercle` | Les compteurs par membre (points, raisons trouvées, tentatives, erreurs, textes répondus) et les titres figés. |
| `abonnement`, `envoi` | Comme dans le test de 18h. |
| `compteur` | Des gestes sans personne, par exemple les liens arrêtés sur la page « seulement sur iPhone ». |
| `effacement` | Les identifiants effacés, pour rejouer les effacements après une restauration (P-32). |

**Le cloisonnement des cercles est imposé par la base (P-25).** Chaque table du jeu a une règle de base de données qui ne montre une ligne qu'aux membres du cercle (« sécurité au niveau des lignes » de PostgreSQL). Chaque demande déclare d'abord le joueur dans sa transaction. Si cette déclaration est oubliée, la base ne renvoie rien. Les rôles sont distincts :
- `jeu`, qui n'est pas propriétaire des tables et subit donc ces règles ;
- `comptes`, qui lit seulement `identite` ;
- `envoi`, qui lit seulement les abonnements ;
- `menage`, qui efface ce qui est échu ;
- `mesures`, qui ne lit que des vues de totaux.

À vérifier au jalon 1 : que Scalingo permet de créer des rôles (de mémoire, oui). Sinon, repli : les règles sont imposées au rôle propriétaire lui-même (`FORCE ROW LEVEL SECURITY`).

**Les journaux de PostgreSQL** (P-07, condition 6 de Juridique). Une contrainte qui échoue y recopie la ligne fautive, et Scalingo garde ce journal un an. Donc :
- toutes les écritures passent par `ON CONFLICT` ;
- les valeurs sont vérifiées par le programme avant la base ;
- le test du journal de la base est étendu au jeu.

**Ce qui n'est jamais gardé** :
- l'adresse e-mail, ni en clair ni chiffrée : seule son empreinte reste. Le test n'envoie aucun e-mail en dehors du code, donc il n'en a pas besoin. C'est plus strict que P-01 et P-02 ;
- le nom, la photo, la date de naissance ;
- l'adresse internet, le navigateur, l'heure du téléphone ;
- les jetons d'Apple et de Google ;
- le détail des devinettes d'entrée (seul le score reste) ;
- la durée de l'écran de la raison (hors des mesures du test).

**L'effacement est réel.** « Tout effacer » tient en une transaction :
- tout ce qui porte l'identifiant du joueur part ;
- ses cartes non révélées sortent des manches, et une carte où un proche avait posé son visage redevient vide (règle 4) ;
- un titre qu'il détenait disparaît.

Ensuite, une recherche du traceur vérifie que plus rien ne reste. Les sauvegardes de Scalingo disparaissent en quatre semaines environ. N14 promet « pour de bon, tout de suite » : UX doit y ajouter ce délai (P-33).

## 3. L'horloge, la connexion, l'invitation, les textes

**L'horloge.** Le texte du jour d s'ouvre à 18h le jour d et se ferme à 18h le jour d+1. Il se devine jusqu'à 18h le jour d+2, et se révèle à ce moment-là. **Rien ne se calcule à 18h pile** (D-043) :
- chaque carte est jugée au moment du geste, et les compteurs de la semaine sont mis à jour dans la même transaction ;
- l'avis du cercle porte sur des réponses closes depuis 24 heures : il est préparé la veille ;
- les cartes sont tirées à la première ouverture de Deviner après 18h. Le tirage donne le même résultat quel que soit qui le déclenche, et il est écrit une seule fois ;
- le dimanche, les totaux sont déjà définitifs à 18h. Il ne reste qu'à départager, sur dix nombres au plus, à la première lecture, écrit une fois ;
- à 18h00 elle-même, il ne se passe que deux choses : chaque lecture compare l'heure à l'heure d'ouverture, et le message part (verrou, rattrapage jusqu'à 18h30).

Les prochains changements d'heure tombent le 25 octobre 2026 et le 28 mars 2027 ; les tests couvrent les deux. Sur la version d'aperçu, une horloge accélérée permet de jouer une semaine en une heure (plan, travail 8).

**La connexion, à trois voies.**
- **Apple et Google** : on reprend `connexion.ts`. Les identifiants survivront à un changement d'adresse : chez Google, ils sont propres au compte ; chez Apple, à l'équipe de développeur (de mémoire). Au passage sur elenchos.fr, les comptes restent. Seuls l'icône, l'abonnement au message et la session sont à refaire.
- **L'e-mail** : un code à six chiffres. Il vaut **15 minutes** et une seule fois, avec 5 essais au plus et un nombre de codes limité par adresse (P-41 et la carte des données ; N7 disait « 10 minutes, à fixer par Back-end »). Le code part par un service d'envoi joint par son interface web.
- **Le prestataire : l'envoi d'e-mails de Scaleway** (groupe français Iliad, choix de `plateforme.md`). Il est gratuit sous 300 e-mails par mois, puis coûte 0,25 € les 1 000 (vérifié le 11 octobre) : 0 € pour le test.
- **Il exige un domaine vérifié** par deux entrées DNS, SPF et DKIM (de mémoire, comme tout service sérieux : un e-mail envoyé « depuis » une adresse Gmail par un tiers est rejeté). Il faut aussi un compte Scaleway à votre nom, qui demande probablement une carte (de mémoire).
- **Sans domaine** : la voie e-mail est construite et testée contre un faux service. Elle reste coupée tant que son réglage est absent : le bouton n'apparaît pas. Elle s'allume le jour où le domaine existe. J'écarte l'envoi depuis votre boîte personnelle : votre adresse serait exposée, il y a des plafonds, et les codes risquent de finir en indésirables.

**L'invitation** (P-29).
- Le jeton est tiré au hasard et placé après le « # » ; la base n'en garde que l'empreinte. Il expire au bout de 7 jours et se lie à l'invité à sa première réponse.
- La page hors iPhone ne consomme pas le lien. La page « ouvre ce lien dans Safari » passe avant le premier texte : aucune réponse ne peut être enregistrée hors de Safari, ce qui règle le cas du navigateur d'une messagerie.
- L'invité est un joueur provisoire : accord, puis réponses, puis compte. Sans compte, il est effacé au bout de 7 jours.
- L'annonce d'arrivée s'affiche dans le jeu à la prochaine ouverture, et part aussi en message si le créateur est déjà abonné. Il ne l'est souvent pas encore : il invite avant d'ajouter l'icône (contenu-test, partie 2).

**Les textes, sans accès à la base (D-048).**
- Contenu écrit les 34 textes en session, dans un fichier du dépôt. Son format est arrêté au jalon 0.
- Un test vérifie ce fichier : 2 raisons de chaque côté, une tension parmi les huit, un vote daté avec son étape, trois textes d'entrée de tensions différentes dont au moins un rejeté, un à deux tiers de rejetés sur les 28 (D-028).
- Le serveur l'importe au démarrage. L'import peut être relancé sans rien changer (il compare les empreintes). Un texte déjà ouvert ne change qu'avec un erratum.
- La date du premier jour est un réglage que vous saisissez.
- Le chemin va dans un seul sens, du dépôt vers le serveur ; aucun agent ne touche la base.
- Limite : le dépôt est public, donc les textes et votes à venir y sont lisibles. L'enjeu est faible, puisque le vote est public et ne se devine pas. Repli possible : un fichier chiffré (0,5 jour).

## 4. Les jalons

« Jour d'agents » : une journée de session, relectures par Cohérence et le Vérificateur comprises.

| # | Ce qui est construit | La preuve (tests) | Vous | Durée |
|---|---|---|---|---|
| 0 | Contrat d'interface avec Front-end (routes, formes, liste fermée des champs par écran, P-27), schéma, format des textes avec Contenu | Types partagés, exemples de réponses du serveur, relecture | Rien | 0,5 à 1,5 |
| 1 | Socle `jeu/` : migrations, rôles, règles de cloisonnement, carte des données, journal, contrôle, vérification GitHub | Une version privée de ses filtres ne reçoit rien d'un autre cercle ; la base est égale à sa carte ; le traceur est absent des journaux, ceux de la base compris | Un point d'étape | 2 à 3 |
| 2 | Textes et horloge : import, calendrier, ouverture et fermeture, dimanche, semaine | Fichier validé ; deux changements d'heure ; 17:59:59 contre 18:00:00 | Rien ; ne lisez pas les textes si vous jouez | 1,5 à 2,5 |
| 3 | Moteur de règles (pur, sans base) | Les journées J1, J2, J3, J5, J6 et J7 de `regles.md` rejouées ; comparaison avec `moteur.js` sur des milliers de manches tirées au hasard, pour les fonctions communes | Rien | 2 à 4, **en parallèle des jalons 1 et 2** |
| 4 | Comptes et entrée : accord, joueur provisoire, trois voies, pseudo, cercle, invitation, défi, premier tour du créateur, annonce, « Tout effacer » | P-29, P-34, P-35, P-38, P-41 ; traceur après effacement ; faux Apple, faux Google, faux service d'e-mails | Rien (tout en local) | 4 à 6 |
| 5 | La journée : Répondre et la phrase du jour, Deviner (brouillon, Valider, passer, « qui et pourquoi »), révélation, titres du dimanche, barre, bandeau sous trois membres | P-26 ; P-27 ; réponses inversées (ce qu'un proche reçoit avant 18h ne change pas d'un octet) ; calculs relancés sans écart ; deux onglets en même temps | Rien | 3 à 5 |
| 6 | Message de 18h, mesures, ménage | Envoi unique ; abonnements expirés retirés ; rapport de totaux avec seuils (P-21) ; ménage jamais entre 17h30 et 18h30 | Vous approuvez la forme du rapport | 1,5 à 2,5 |
| 7 | Mise en ligne de l'aperçu, puis test de 18h | Message avant 18h05 trois soirs ; connexion et session tenues depuis l'icône | Domaine ; ouverture de Scalingo, Google, Apple, Scaleway (environ 3 h) ; feu vert ; une semaine jouée en une heure avec des proches inventés ; trois soirs réels | 1 à 2, plus 3 soirs |
| 8 | Vérification finale, base supprimée puis recréée, ouverture aux joueurs | Passe complète du traceur, relevé du réseau, Cohérence, Vérificateur | Feu vert ; envoi du message N17 | 1,5 à 2,5 |

**Ce que Front-end fait en parallèle.** Le contrat s'écrit ensemble au jalon 0. Front-end construit ensuite les écrans sur des réponses d'exemple pendant les jalons 1 à 3. On intègre l'entrée et le compte au jalon 4, la journée au jalon 5, et on teste ensemble au jalon 7.

**Repère pour juger l'estimation.** Le code du test de 18h a été écrit et relu en une à deux journées (12 octobre). J'estime qu'il fait environ un dixième du serveur du jeu ; c'est une estimation, pas une mesure.

## 5. Ce qui bloque sans le domaine (D-059)

**Rien ne bloque des jalons 0 à 6.** Au jalon 7, trois choses bloquent :
1. **la voie e-mail réelle**, qui demande un domaine vérifié chez Scaleway ;
2. **l'aperçu et le test de 18h sur l'adresse définitive**. Sur l'adresse gratuite de Scalingo, c'est probablement faisable (Apple et Google l'acceptent sans doute, à vérifier), mais l'icône, l'abonnement et les réglages Apple et Google seraient à refaire au passage sur elenchos.fr ;
3. **la vérification de marque chez Google**, facultative, qui demande des pages sur le domaine.

**La question vous revient au point d'étape de fin du jalon 6**, avant d'ouvrir Scalingo. Vous pouvez y répondre dès maintenant. QCM proposé :

**Le domaine elenchos.fr, pour l'aperçu et les premiers joueurs ?**
- **L'acheter au début du jalon 7 (Recommandé)** : environ 6 € la première année. La voie e-mail fonctionne, et l'icône, l'abonnement et le test de 18h sont faits une fois pour toutes.
- **Aperçu sur l'adresse gratuite, domaine juste avant les premiers joueurs** : vous réinstallez votre icône une fois ; le test de 18h est fait deux fois en partie.
- **Pas de domaine pendant le test** : la voie e-mail est retirée, ce qui modifie D-057 point 3. Apple suffit techniquement, puisque tout iPhone a un compte Apple. Les joueurs réinstalleront l'icône à la mise à niveau.

## 6. Risques, et ce que je simplifierais encore

**Les risques principaux**
1. **Le comportement de l'iPhone n'est connu qu'au jalon 7** : message, reconnexion dans l'icône, sessions. Cela peut ajouter 2 à 5 jours. Parade possible : un aperçu réduit sur iPhone juste après le jalon 4, mais ce serait revenir sur l'ordre choisi par D-059.
2. **Les rôles chez Scalingo** ne sont pas confirmés. Le repli existe ; il protège un peu moins.
3. **Les règles fines** (jumeaux, départs, Fidèle, égalités) sont des sources de bugs. Parade : les journées de `regles.md` et la comparaison avec `moteur.js`.
4. **Perdre la clé de chiffrement, c'est perdre les réponses.** Vous en gardez une copie hors ligne.
5. **Vous êtes seul en exploitation**, sans alerte (D-057), avec les fenêtres d'installation (D-043) et le feu vert de la veille.
6. **Avec 15 à 30 joueurs**, beaucoup de totaux tomberont sous le seuil et s'afficheront « — ».

**Ce que je simplifierais** (à vous signaler, au titre de D-056)
- Pas de copie des sauvegardes chez Scaleway (P-13) : les sauvegardes de Scalingo suffisent pour le test.
- Une seule application Scalingo : la phase d'aperçu, remplie de données inventées, est suivie d'une base supprimée puis recréée. Pas d'aperçu permanent (P-19 et P-20, proposés).
- **Faire le test de 18h sur le jeu lui-même au jalon 7**, plutôt qu'une page nue à part : un compte et une application de moins, et une seule mise en ligne. QCM proposé :
  - **Sur le jeu, au jalon 7 (Recommandé)** : une seule installation, et l'on teste le vrai message.
  - **Avec `test-18h/` d'abord** : le test reste isolé, mais l'essai de Scalingo n'autorise qu'une application, à supprimer avant le jeu.
- Je ne retire pas le chiffrement des réponses (P-02). Il coûte environ un jour et protège une sauvegarde volée. Le retirer reste possible.

## Décisions antérieures touchées

- **D-035 et P-38** (la suppression du compte coupe le lien) : le lien est coupé de notre côté seulement. Le révoquer chez Apple et Google obligerait à garder leurs jetons. N14 dira au joueur comment retirer Elenchos de ses réglages Apple ou Google.
- **P-01 et P-02** : l'adresse e-mail n'est plus gardée du tout, seulement son empreinte. N6 doit le dire (« une empreinte de ton adresse »).
- **N7** : le code vaut 15 minutes, pas 10.
- **N14** : y ajouter le délai des sauvegardes (P-33).
- **D-054** (le test de 18h sur une page nue) **et l'ordre de D-059** : la fusion avec le jeu est proposée, voir le QCM ci-dessus.
- **P-13, P-19, P-20** : allégés pour le test.
- **D-057 point 2** : à reposer, comme le prévoit D-059.
- **D-057 point 3** : seulement si l'option « pas de domaine » est choisie.

## Limites et doutes

- **De mémoire** : la création de rôles chez Scalingo ; l'exigence de domaine et la carte chez Scaleway ; l'adresse `scalingo.io` acceptée par Apple et Google pour leur connexion ; les identifiants Apple propres à l'équipe de développeur.
- L'estimation est de confiance moyenne-basse. Le code ne sera relu que par des modèles (D-043). Rien n'est relu par un avocat (D-056).
- Le moteur porté n'est comparé à `moteur.js` que sur les fonctions communes. Le choix des cartes du test est neuf, et seuls ses propres tests le prouvent.

**À vérifier avec de vraies personnes** :
- la reconnexion dans l'icône, et la voie choisie (Apple, Google ou e-mail) ;
- l'annonce d'arrivée lue à l'écran plutôt que reçue en message ;
- le lien ouvert depuis une messagerie ;
- « Tout effacer » compris comme définitif malgré le délai des sauvegardes ;
- la tenue du message de 18h sur des iPhone plus anciens que le vôtre.