# Les choix techniques (le jeu entier, application iPhone)

*Étape 1, travail A (D-064). Back-end et Front-end, ensemble, 16 octobre 2026. Ce document arrête les choix techniques que D-048 et D-062 (point 5) laissent à l'équipe, pour le jeu entier dans une application iPhone testée par TestFlight. Il remplace la version de la phase 0 (D-060, 15 octobre 2026). Il garde ce qui tient, et dit ce qui change, à partir du plan de D-064 (`docs/etape-6/plan-jeu-entier.md`, et le détail de `plan-jeu-entier-equipe.md`, partie 2). Il ne décide rien de ce qui revient au porteur, et n'engage aucune dépense (D-063). Le contrat est dans `jeu/CONTRAT.md`, ses types dans `jeu/src/contrat.ts`, le format des textes dans `jeu/textes/FORMAT.md`. Mis à jour le même jour avec le serveur (travail D) et la coquille iOS (travail E) : ce qui est fait, ce qui est vérifié et ce qui reste à prouver (partie 5), la liste des réglages (1.17). À relire par Cohérence puis par le Vérificateur.*

## En bref

- **La pile du serveur ne change pas** : Node 22, TypeScript lu tel quel, PostgreSQL, deux bibliothèques (`pg`, `oauth4webapi`). Le message de 18h part vers Apple avec les seuls modules de Node.
- **L'interface non plus** : des modules JavaScript sans cadriciel, typés par des commentaires. Ils sont maintenant **embarqués dans une application Capacitor**, au lieu d'être servis par le serveur. Quelques petits morceaux en Swift font ce que le web ne peut pas faire : le trousseau, la connexion Apple, la feuille de Google, le message de 18h, la réception du message.
- **Ce qui change** :
  - les sessions sont des jetons rangés dans le trousseau (1.8) ;
  - le message de 18h passe par Apple directement (1.13) ;
  - la connexion Apple est native, celle de Google passe par la feuille du système (1.14) ;
  - la version minimale remplace le rechargement de l'icône (1.10) ;
  - l'application se fabrique sur les machines macOS de GitHub, sans Mac (1.15).
- **Le moteur du second essai sert maintenant presque en entier** : portrait, Pas de Côté, tempéraments, phrase de la semaine, cartes les plus inattendues, titres (2.2).
- **Les trois réponses d'entrée de l'invité** : l'option B (un joueur provisoire en base) tient, avec un jeton au lieu d'un cookie (partie 3).
- **Le cloisonnement des cercles reste tenu par la base elle-même**, avec des rôles séparés, et le même repli si l'hébergeur ne permet pas de créer des rôles (1.6).
- **L'identifiant de l'application est `io.github.ppcrepin.elenchos`** : il ne pourra plus changer après le premier envoi à Apple (1.7).

## 1. Les choix arrêtés

### 1.1 La pile

| Élément | Choix | Pourquoi |
|---|---|---|
| Serveur | Node 22 (22.22.0), un seul processus, le module `node:http`, sans cadre web | Déjà en place et testé ; rien à apprendre pour un humain qui reprendrait le code (D-043) |
| Langage du serveur | TypeScript exécuté tel quel par Node, qui efface les types (`erasableSyntaxOnly`) : ni fabrication, ni fichier produit | Ce qui est lu est ce qui tourne |
| Base | PostgreSQL de Scalingo (D-048), via `pg` | Choix déjà fait ; les règles de cloisonnement par ligne existent dans PostgreSQL |
| Connexion Google | `oauth4webapi`, flux repris de `test-18h/src/connexion.ts`, retour par formulaire | Bibliothèque certifiée OpenID, sans dépendance ; déjà relue |
| Connexion Apple | Vérification du jeton signé par Apple avec `node:crypto` seul (`src/serveur/apple.ts`, étape 1) ; `oauth4webapi` reste pour Google | Natif dans l'application : ni identifiant de service web, ni domaine ; la feuille rend le jeton signé, sans échange de code |
| Message de 18h | `node:http2` et `node:crypto` vers le service d'Apple (APNs), sans bibliothèque | Environ 150 lignes, à la place des trois modules du message web |
| E-mails du code | L'envoi d'e-mails de Scaleway, coupé tant qu'il n'y a pas de domaine (D-060, point 2) | Prestataire français (D-043), 0 € pour le test |
| Interface | Modules JavaScript, `// @ts-check`, types en JSDoc vérifiés par `tsc` | Partie 1.2 |
| Emballage | Capacitor 8.5.3 (CLI, core, ios), @capacitor/push-notifications 8.1.3 et @capacitor/app 8.1.2 (le cycle de vie : liens reçus, retour au premier plan), épinglés, en devDependencies : rien de cela ne tourne sur le serveur ; Swift Package Manager, sans CocoaPods | Partie 1.3 ; le plan, 2.1 |
| Morceaux natifs | Un petit module Swift à nous, et une extension Swift de réception du message | Ce que le web ne fait pas ; pas de module tiers de plus |
| Outils de développement | `typescript`, `@types/node`, `@types/pg`, et Capacitor (ci-dessus) ; `playwright-core` viendra avec les tests dans un navigateur (1.11) | Ceux du test de 18h, plus Capacitor |

`jeu/` a son propre `package.json`, de type module, et son `Procfile` (`web: node src/serveur/principal.ts`) ; Scalingo installe ce dossier (`PROJECT_DIR=jeu`). À l'installation, le script `build` joue la garde des horaires puis les tests sans base (`tests/socle/*-sans-base.test.ts`) : de 15h à 19h et le dimanche, l'installation échoue (D-043, D-054). Au démarrage, le serveur joue les migrations et prépare les rôles lui-même (`principal.ts`). Les versions sont épinglées exactement, comme aujourd'hui. Les fichiers repris de `test-18h/` sont copiés dans `jeu/`, avec en tête leur origine ; `test-18h/` reste intact (D-060, point 3).

Capacitor est entré à l'étape 1 (travail E) à sa dernière version stable : 8.5.3, publiée le 7 octobre 2026 ; la 9 n'existe qu'en préversion (registre npm, 16 octobre 2026). `@capacitor/core` n'est pas chargé dans la page : `cap sync` en recopie seulement `cordova.js` (1.3). Le `Package.swift` committé (`ios/App/CapApp-SPM/`) épingle `capacitor-swift-pm` 8.5.3 exactement. Monter de version demande `npx cap sync ios` puis un nouveau commit ; les deux workflows de l'application refusent tout écart entre le projet du dépôt et ce que donne `cap sync`.

### 1.2 L'interface sans cadriciel

Le choix de la phase 0 tient : **des modules que WebKit lit tels quels**, sans étape de fabrication, typés par JSDoc et vérifiés par `tsc`. Capacitor copie ces fichiers tels quels dans l'application, ce qui garde l'avantage principal : ce qui est relu est ce qui tourne.

| Option | En une ligne |
|---|---|
| **A. Sans cadriciel ni fabrication (retenue)** | Le code de l'essai se reprend, sans dépendance de plus. |
| B. Preact et htm, copiés dans le dépôt | Plus déclaratif, mais une dépendance à suivre, pour un gain faible sur une soixantaine d'écrans simples. |
| C. Svelte ou React, avec Vite | Plus d'outils, une fabrication de plus. Rien ne le justifie. |
| D. Une application réécrite en Swift | Tous les écrans à refaire, par des agents sans Mac ni simulateur pour voir ce qu'ils écrivent (plan, 2.1). |

Le principe de l'essai est gardé : à chaque changement, l'écran entier est redessiné à partir de l'état, avec `createElement` et `textContent`, jamais `innerHTML`.

### 1.3 La coquille embarquée, et les pages web du serveur

**Décision de l'équipe (plan, 2.1) : l'interface est embarquée dans l'application, et non chargée depuis le serveur.**
- Pourquoi : Apple refuse les applications qui ne sont qu'un site emballé (règle 4.2, qui comptera pour la deuxième version), et la coquille s'ouvre même sans réseau.
- Le prix : chaque correction d'écran demande une nouvelle fabrication. Elle est automatique et prend environ une heure, envoi compris.

**L'application** (`jeu/public/`, fait à l'étape 1, travail E, pour la première application presque vide : l'accueil, la connexion avec Apple, le message de 18h, la mise à jour requise, l'iPad et le Mac, l'absence de réseau) :
- `app.js` : le démarrage, le choix de l'écran, la connexion avec Apple ; l'accord d'iOS pour le message, demandé seulement après un toucher ; le jeton d'appareil envoyé au serveur, et renvoyé à chaque ouverture si l'accord est déjà donné ;
- `client.js` : les échanges, l'enveloppe, les trois en-têtes, la version minimale (il garde la dernière `fabricationMinimale` reçue), les erreurs. Délai de 15 secondes, aucun cookie, redirections refusées ; le jeton est effacé du trousseau sur `non_connecte` ;
- `ecran.js` : une fonction pure qui, de `Etat`, de l'adresse reçue et de l'appareil, tire l'écran à montrer (`CONTRAT.md`, 2.1). Elle se teste sans navigateur. À l'étape 1, elle couvre le haut du tableau (appareil, version minimale, réseau, dehors ou connecté) ; le reste vient à l'étape 2 ;
- `ecrans.js` : le dessin des écrans ;
- `natif.js` : la seule porte vers iOS (trousseau, feuilles de connexion, message, appareil, numéro de fabrication). Elle parle au pont que l'application injecte dans la page (`Capacitor.nativePromise`, `Capacitor.addListener`), sans @capacitor/core dans la page ; le vérificateur de connexion est tiré par iOS. Dans Chromium, pendant les tests, un faux pont de même forme, posé avant la page, la sert (outil de test à écrire) ;
- `textes.js` : tous les mots fixes, avec la marque `A_ECRIRE` pour ceux qui manquent ; ceux de l'étape 1 sont écrits, et aucune marque ne reste au 16 octobre 2026 ;
- `secours.js` : la vue de secours, si `app.js` n'a pas démarré au bout de 4 secondes ;
- `index.html`, avec sa règle stricte de chargement : seule l'adresse du serveur est permise pour les échanges (1.11) ;
- les écrans du jeu, par lot, à partir de l'étape 2.

**Les morceaux Swift** (`jeu/ios/App/App/`), un seul module à nous, `ElenchosNatif.swift`, inscrit par `ElenchosBridgeViewController.swift` :
- le trousseau : lire, écrire, effacer le jeton de session (base64url, 16 à 128 caractères ; autre chose est refusé). L'élément n'est lisible qu'après le premier déverrouillage depuis le démarrage, et n'est jamais copié vers un autre appareil (« ThisDeviceOnly ») ;
- le vérificateur d'une connexion : 32 octets tirés au hasard par iOS, et leur défi (`CONTRAT.md`, 2.5) ;
- la feuille d'Apple : demander un jeton signé avec le nonce du serveur, passé tel quel, sans nom ni adresse (D-061) ; à « Tout effacer », demander un code d'autorisation (étape 2, place marquée) ;
- la feuille du système (ASWebAuthenticationSession) : ouvrir une adresse, rendre l'adresse de retour `elenchos://…` (étape 2, place marquée) ;
- l'appareil : iPhone, iPad ou Mac (lu aussi par le modèle de l'appareil : une application pour iPhone ouverte sur un iPad s'y croit sur un iPhone) ; le numéro de fabrication.

Le message de 18h passe par le module officiel de Capacitor (accord d'iOS, jeton d'appareil, toucher sur un message). Les liens universels et le retour au premier plan passent par le module officiel du cycle de vie.

**L'extension de réception** (Notification Service Extension, `jeu/ios/App/Reception/`, faite à l'étape 1) : à chaque message, elle envoie `POST /api/recu { envoi }`, sans session, sans cookie, 20 secondes au plus, puis laisse le message s'afficher tel quel. Elle n'envoie rien si `envoi` n'est pas un texte base64url de 64 caractères au plus, ni vers une adresse qui n'est pas en https (sauf `http://localhost` dans le simulateur). C'est la mesure « message reçu » (plan, 2.2). Elle ne se prouve à l'œuvre que sur l'iPhone.

**Les réglages de la coquille** (`capacitor.config.json`, `Info.plist`, projet Xcode) :
- l'identifiant `io.github.ppcrepin.elenchos`, et `io.github.ppcrepin.elenchos.reception` pour l'extension (1.7) ;
- iPhone seulement (`TARGETED_DEVICE_FAMILY = 1`, D-054), iOS 15 au moins (le plancher de Capacitor 8, vérifié), en français, en portrait seulement ;
- journaux de Capacitor coupés, inspection de la page désactivée, modules HTTP et cookies de Capacitor coupés ;
- `ITSAppUsesNonExemptEncryption` à faux : Apple ne repose pas la question du chiffrement à chaque envoi ;
- écran de lancement réduit à une couleur ;
- l'icône, rendue telle quelle depuis `docs/identite/logo/svg/elenchos-icone-jour.svg` : provisoire, à confirmer par la Direction artistique (D-050).

**Les pages web, servies par le serveur** (`CONTRAT.md`, 2.14) : la page publique, la page de confidentialité, la page d'invitation, le fichier d'association avec l'application, le retour de Google. Ce sont des pages fixes, en HTML écrit à la main, avec un seul petit script pour la page d'invitation (reconnaître l'appareil, compter). Pas de cookie, rien chargé d'ailleurs.

### 1.4 Le serveur calcule, l'application montre

C'est la règle 1.1 du contrat. Trois conséquences techniques :
- **Le moteur de règles est une bibliothèque pure côté serveur** (`src/regles/`) : pas de base, pas d'horloge, pas de hasard caché. Le tirage passe par une fonction `t(clé)` qui donne le même résultat quel que soit qui la déclenche, avec un secret du serveur pour graine. Les numéros des cartes ne se calculent donc pas d'avance (P-26). Le moteur se teste seul, sur les dix journées chiffrées de `regles.md`, qui deviennent des tests.
- **Le moteur porte tout le jeu** : cartes (R3, R4), verdicts et jumeaux, points, avis du cercle, titres, surprise de la semaine, curseurs, Pas de Côté, Sans-Faute, tempéraments, phrases du jour et de la semaine, barre, R8, pause et sommeil, départs (règle 4), texte corrigé (règle 20).
- **Deux portraits par joueur, d'une même fonction** : le portrait entier (Moi, la phrase de la semaine, Le Pas de Côté), et le portrait vu par le cercle, calculé sur les seules réponses révélées (règle 19, P-27 a). Ce second calcul sert aussi au choix des cartes (R3) et aux tempéraments vus par le cercle (`CONTRAT.md`, partie 8). Un test vérifie, réponses inversées, que le second ne dépend d'aucune réponse pas encore révélée.

Les phrases qui dépendent des données sont faites dans un seul module du serveur, avec la typographie de l'essai (`typographier`). Les mots fixes restent dans `textes.js`.

### 1.5 La base

38 tables, chacune sur la carte des données du code (`src/base/carte.ts`), qu'un test compare à la base réelle, colonne par colonne. Parmi elles : joueurs, empreintes d'identité, accords, sessions, abonnements, cercles, membres (ordre et date d'arrivée, rond), liens, réponses (chiffrées), manches, cartes (le brouillon de Deviner est la carte avant Valider ; le « pourquoi » chiffré lui aussi ; la marque « vidée par un départ »), éveil des cercles, comptes de la semaine, titres et badges, tempéraments, lecture du dimanche (une ligne par joueur), étape vue de la révélation, textes importés, connexions en cours, codes de retour, refus des mesures, totaux des mesures et leur verrou des joueurs distincts, journal des effacements, tâche du jour du ménage (migration 0004, étape 1, travail D), témoin des clés (migration 0005, 1.7), mémoire des migrations. Ce qui change depuis la phase 0 :
- **Au départ d'un cercle, la ligne du membre part** (P-37) : ses réponses quittent le cercle d'elles-mêmes. Aucune « date de départ » n'est gardée ; un titre dont le titulaire est vide est celui d'« un ancien membre » (D-045, point 2).
- **Aucune révélation n'est préparée en table** : la révélation se calcule à la lecture, avis du cercle compris (`CONTRAT.md`, partie 3) ; seule l'étape vue est gardée.
- **La marque « démonstration »** des cercles viendra avec le cercle de démonstration (1.16), par une migration nouvelle : elle n'est pas encore dans le schéma.
- **Ce que fait un départ est fait par la base**, dans la transaction du départ (déclencheur `membre_avant_depart`) : cartes vidées avant 18h, « jumeau » devenu « juste » après 18h (D-067), Pas de Côté effacé (D-066, point 1), « déjà vu » du cercle effacé, lien d'entrée qui ne désigne plus le partant. Un lien lié ne fait plus rien lire 7 jours après sa liaison (P-25).
- **Les totaux, après D-066** : le refus des mesures est gardé, et les fonctions des totaux l'excluent (point 3) ; le seuil compte des joueurs distincts, et une période close ne reçoit plus rien (point 4) ; « déjà vu » ne garde pas d'heure, et les gestes qui servaient une mesure (révélation ouverte le soir même, message reçu, Le Cercle regardé pendant Deviner) se comptent au moment du geste, en totaux par jour (point 4). Pendant le test, la part de « aucune » et les trois comptes de mi-bêta ne sont pas écrits : un réglage du serveur, figé (`src/base/totaux.ts` ; point 2).
- **Le ménage quotidien existe et tourne** (`src/base/menage.ts`, testé) : il tient chaque durée de la carte (P-31). Le planificateur l'appelle chaque jour à 4h, heure de Paris (proposé), ou dès que possible jusqu'à 17h30, jamais de 17h30 à 18h30 ; une ligne de `tache_du_jour` (migration 0004), prise au début de sa transaction, le fait tourner une fois par jour, jamais deux fois en même temps, même avec deux serveurs (étape 1, travail D ; Juridique, bloquant avant la première vraie invitation : tenu).
- **Sans heure, là où une heure ne sert à rien** : la validation d'une manche est un booléen (`manche.validee`) et non plus une heure, comme « vu » (Cohérence, 16 octobre 2026 : aucune règle ne lit cette heure, `src/regles/manche.ts`). Les comptes d'attributions par texte partent au lundi 18h qui suit leur semaine (Juridique, retenu par l'équipe).

Trois règles, reprises du test de 18h pour tenir P-07 (Scalingo garde un an les journaux de la base) :
- toutes les écritures passent par `ON CONFLICT` : une contrainte qui échoue recopierait la ligne fautive dans le journal de la base ;
- les valeurs sont vérifiées par le programme avant d'arriver à la base ;
- le test du journal de PostgreSQL est étendu au jeu.

Les migrations sont des fichiers SQL numérotés (`src/base/migrations/`), joués au démarrage sous le rôle propriétaire, et seulement par lui. Une migration jouée ne se modifie plus ; tant qu'aucune base réelle n'existe, 0001 à 0005 peuvent encore être réécrites (`src/base/LISEZMOI.md`).

### 1.6 Les rôles de base, et le repli

**Le principe (P-25).** Chaque demande ouvre une transaction et y déclare d'abord qui la fait : `SET LOCAL elenchos.joueur = '…'`. Chaque table du jeu porte une règle de cloisonnement par ligne, qui ne montre une ligne qu'aux membres de son cercle. **Si la déclaration est oubliée, la règle ne voit personne et la base ne rend rien.**
- Avec plusieurs cercles, la règle lit les appartenances : un joueur voit les lignes de chacun de ses cercles, jamais celles d'un cercle où il n'est pas. R8 est le seul calcul qui regarde deux cercles à la fois, ceux du joueur qui devine (P-28).
- Le joueur provisoire du défi est déclaré de la même façon. Une règle à part lui laisse lire les seules réponses d'entrée de son invitant, et seulement par l'invitation liée à lui (P-29).

**Les rôles** :

| Rôle | Ce qu'il peut | Exigence tenue par la base |
|---|---|---|
| `proprietaire` | créer les tables ; joué seulement par les migrations | — |
| `jeu` | lire et écrire les tables du jeu, soumis aux règles de cloisonnement ; écrire, sans les lire, dans les tables de totaux ; aucun droit sur les identités | P-25, P-01, P-22 |
| `comptes` | lire et écrire les seules empreintes d'identité | P-01 |
| `envoi` | lire les abonnements actifs, écrire les envois | P-22 |
| `menage` | « Tout effacer », et effacer chaque jour ce qui est échu (`src/base/menage.ts`) : joueurs provisoires à 7 jours (avec leur ligne au journal des effacements), liens échus, scores d'entrée, codes e-mail, connexions en cours, codes de retour, sessions, « déjà vu » et reprise de la révélation, note « écran Répondre affiché », comptes au-delà de la semaine précédente, envois de plus de 7 jours, verrous des totaux d'une période close | P-31, P-33 |
| `mesures` | lire des vues de totaux, jamais une réponse | P-22, P-23 |

**Scalingo permet-il de créer des rôles ?** De mémoire, oui, mais ce n'est toujours pas vérifié : cela se prouve à l'ouverture de Scalingo (partie 5). Le code est écrit pour fonctionner dans les deux cas, avec un seul réglage (`MODE_ROLES=repli`).

**Le repli, si les rôles sont impossibles.** Tous les modules se connectent sous le rôle propriétaire, et chaque table reçoit `FORCE ROW LEVEL SECURITY` : les règles de cloisonnement s'appliquent aussi au propriétaire. Chaque connexion déclare son module à l'ouverture (`elenchos.module`), et les mêmes règles par ligne regardent ce module. Ce qui tient encore, contre l'oubli : le cloisonnement des cercles (P-25) **et** la séparation des modules (P-01, P-22, P-23), testés dans les deux modes. **Ce qui est perdu, dit franchement** : les droits par colonne (le jeu pourrait écrire par erreur une colonne que la règle de sa ligne lui laisse) ; et la protection contre un code fautif, qui changerait lui-même son module déclaré ou lèverait les règles d'une commande. Si le propriétaire échappe aux règles (superutilisateur), l'installation refuse le repli. Il faudrait alors le signaler au porteur. Le détail : `src/base/LISEZMOI.md`.

### 1.7 Secrets, clés, empreintes, chiffrement

- **Un secret de session** (`SECRET_SESSION`, 32 octets, saisi par le porteur chez Scalingo, jamais dans le dépôt). On en tire des clés distinctes : empreintes des jetons et des codes, tirage. C'est le module `crypto.ts` du test de 18h. Le changer déconnecte tout le monde, sans perdre aucun compte.
- **Une clé des identités** (`CLE_IDENTITES`, 32 octets, saisie chez Scalingo, gardée hors ligne par le porteur comme `CLE_REPONSES`). Les empreintes d'identité (identifiant Apple ou Google, adresse e-mail) en dérivent, et d'elle seule : c'est elle qui retrouve un compte. **Elle ne se change jamais pendant le test** : la changer rendrait tous les comptes introuvables. Sans elle, le serveur refuse de démarrer ; les trois clés doivent être distinctes (`config.ts`).
- **Un témoin des deux clés qui ne changent jamais** (`CLE_REPONSES`, `CLE_IDENTITES` ; migration 0005, `src/base/temoin.ts`, 16 octobre 2026) : au premier démarrage normal, le serveur range en base une empreinte de chacune, tirée par une fonction à sens unique (HKDF-SHA-256, avec une étiquette propre au témoin), qui ne permet pas de retrouver la clé. À chaque démarrage suivant, il les recalcule ; si l'une ne correspond plus, il refuse de démarrer, et le journal dit seulement `cles changees` avec le nom de la clé, jamais une valeur. Des clés retirées par erreur au mauvais moment, puis tirées de nouveau sur `/preparer`, ne rendent donc jamais les réponses illisibles ni les comptes introuvables en silence. Seul le propriétaire le lit, au démarrage ; aucun module n'y a de droit. `SECRET_SESSION` n'en a pas : le changer est sans perte, et c'est le geste à faire s'il fuit. Limite : changer exprès l'une des deux clés (après une fuite) demanderait de rechiffrer les réponses et de refaire le témoin, avec un outil qui n'existe pas encore.
- **Des empreintes avec clé (HMAC)**, jamais la valeur : identifiant Apple ou Google, adresse e-mail, jetons de session, jetons de lien, codes à six chiffres, codes de retour de Google, vérificateurs de connexion.
- **L'adresse e-mail n'est jamais gardée**, ni en clair ni chiffrée ; seule son empreinte reste.
- **Les réponses sont chiffrées** par le programme avant la base (P-02), avec une clé réglée chez Scalingo (`CLE_REPONSES`), dont le porteur garde une copie hors ligne. Le « pourquoi » posé sur la carte « qui et pourquoi » l'est aussi, avec la même clé : avec le verdict « juste et raison », il dirait sinon en clair la raison de l'auteur. Ce qui reste en clair et dit quelque chose des réponses (verdicts, Pas de Côté, tempéraments…) est listé en tête de `src/base/carte.ts`.
- **Les clés d'Apple**, créées par le porteur dans son compte Apple, réglées chez Scalingo ou dans les secrets de GitHub, jamais dans le dépôt, avec une copie hors ligne chez lui :
  - la clé des messages (`.p8`) : `APPLE_CLE_MESSAGES` et son identifiant `APPLE_ID_CLE_MESSAGES`, avec l'identifiant d'équipe `APPLE_ID_EQUIPE`. Elle est créée pour le service de production et pour toute l'équipe (« Team Scoped ») : depuis 2025, une clé des messages ne vaut que pour un service d'Apple, production ou essai (1.13) ;
  - la clé « Se connecter avec Apple », pour révoquer à l'effacement (étape 2) : `APPLE_CLE_CONNEXION` et `APPLE_ID_CLE_CONNEXION`. Il faut une clé qui porte le service « Sign in with Apple », associée à l'identifiant principal de l'application (vérifié, aide d'Apple, 16 octobre 2026). **Deux clés séparées, recommandées** : qu'une même clé puisse encore porter les messages et la connexion, depuis le nouveau réglage des clés des messages, n'est pas vérifié. Le serveur accepterait la même clé collée deux fois ;
  - la clé d'accès à App Store Connect, pour la fabrication (1.15) : une clé d'équipe, rôle Admin, dans les secrets de GitHub seulement. Les clés des messages et de la connexion ne vont pas chez GitHub.
- **L'identifiant de l'application** (`APPLE_ID_APPLICATION`) n'est pas un secret, mais un réglage aussi, jamais écrit dans le code du serveur : c'est l'audience du jeton de connexion et le sujet des messages (`apns-topic`). La connexion Apple n'a besoin que de lui (et des clés publiques d'Apple).
  - **Retenu : `io.github.ppcrepin.elenchos`** (étape 1, travail E ; même convention que le test de 18h, `io.github.ppcrepin.test18h`), et `io.github.ppcrepin.elenchos.reception` pour l'extension. Il ne dépend ni du domaine elenchos.fr ni d'un prestataire, et il est pris dans un espace qui est déjà celui du porteur (son adresse GitHub Pages) : Apple ne le vérifie pas, mais aucun autre développeur n'a de raison de l'avoir pris. Il contient son nom d'utilisateur GitHub, déjà public par le dépôt ; les joueurs ne le voient pas. Si le jeu change de nom, l'identifiant reste.
  - **Il ne pourra plus changer après le premier envoi à Apple.** D'ici là, il est écrit à quatre endroits : `capacitor.config.json`, `ios/App/App.xcodeproj/project.pbxproj`, les deux workflows de l'application ; et réglé chez Scalingo (`APPLE_ID_APPLICATION`).
- **Chaque réglage d'Apple manquant coupe sa seule fonction**, et il est signalé par son nom au démarrage (`config.ts`) : sans l'identifiant de l'application, ni connexion ni message ; sans la clé des messages ou l'équipe, pas de message (`Etat.message.disponible` faux) ; sans la clé de connexion, pas de révocation.

### 1.8 Les sessions

- **Une session est un jeton** de 32 octets tirés au hasard. L'application le range dans le trousseau et l'envoie dans l'en-tête `Authorization: Bearer …`. La base n'en garde que l'empreinte, avec le joueur, l'appareil (un numéro sans lien avec l'iPhone) et une échéance.
- **Pourquoi plus de cookie** : dans l'application, la page (`capacitor://localhost`) et le serveur n'ont pas la même adresse, et iOS y bloque les cookies d'un autre site, par défaut depuis iOS 14 (vérifié le 16 octobre 2026 : documentation de Capacitor 8 ; partie 5). Un jeton dans un en-tête marche partout, et supprime d'un coup le risque qu'une page d'un autre site agisse au nom du joueur.
- **Le format** : le serveur tire 32 octets, écrits en base64url (43 caractères). L'application n'accepte dans le trousseau qu'un jeton base64url de 16 à 128 caractères.
- **Limite d'iOS, dite franchement (P-11)** : le trousseau survit à la désinstallation de l'application. Une réinstallation retrouve donc sa session, jusqu'à son échéance, à « Tout effacer » ou à la fin du test.
- **Une table plutôt qu'un jeton seulement scellé**, parce que P-41 demande que la session s'arrête à la déconnexion : sans table, un jeton copié resterait valable jusqu'à son terme.
- **Chaque appareil a la sienne**, et l'abonnement au message est lié à elle. Une session de compte vaut 30 jours ; l'échéance est prolongée à chaque ouverture (`GET /api/etat`), au plus une fois par jour pour qu'une lecture rejouée ne change rien, **jamais au-delà de la fin du test**, minuit, heure de Paris, à la fin du jour `FIN_DU_TEST` (D-061, point 2) : en ligne, le serveur refuse de démarrer sans `FIN_DU_TEST`. « Tout effacer » les supprime toutes (P-38).
- **Le joueur provisoire** a son propre jeton, rendu par l'accord, 7 jours au plus. À la connexion, le jeton du compte le remplace dans le trousseau.
- **CORS**, puisque la page et le serveur n'ont pas la même adresse. Le serveur répond aux demandes préalables du navigateur intégré pour la seule origine `capacitor://localhost`, les méthodes `GET` et `POST`, et les en-têtes `Authorization`, `Content-Type` et `Elenchos-Fabrication` (gardées 10 minutes par WebKit). Pas d'identifiants de navigateur : il n'y a pas de cookie. Une demande `/api/` sans origine n'est acceptée que sur `POST /api/recu` (`CONTRAT.md`, 1.7).

### 1.9 L'horloge, et le développement local

- **Une seule horloge** pour tout le serveur (`horloge.ts`, repris du test de 18h), réglable par les tests, et **une seule source pour l'heure de Paris** : le moteur (`src/regles/heure.ts`), que l'horloge appelle pour le jour de jeu, les changements d'heure et le jour de la semaine (0 = lundi). Le jour de jeu porte le nom du jour où il finit (`regles.md`, section 2).
- **La base juge aussi « avant ou après 18h »** pour les réponses du jour et les départs : l'heure déclarée par le serveur dans chaque transaction, sinon la sienne (`instant_du_jeu`, `fin_du_jour_de_jeu`, migration 0002). Un test compare chaque 18h de 2026 à 2028 entre la base et le moteur.
- **L'horloge accélérée et la connexion d'essai par code n'existent qu'en local** (`CONTRAT.md`, partie 5). Le serveur refuse de démarrer si leurs réglages sont présents chez Scalingo ou sur GitHub.
- **La garde des horaires de mise en ligne** (D-043, D-054) est reprise telle quelle, et étendue à la fabrication de l'application (1.15).
- **En local**, l'interface tourne dans Chromium, servie par un petit serveur de fichiers de développement, avec un faux pont de Capacitor (1.3). C'est ainsi que se font les tests de bout en bout et les captures.

### 1.10 La version minimale

- L'application envoie son **numéro de fabrication** dans l'en-tête `Elenchos-Fabrication`. Le serveur annonce `fabricationMinimale` dans chaque enveloppe, et répond `mise_a_jour_requise` en dessous (`CONTRAT.md`, 1.7).
- Le numéro minimal est un réglage du serveur. Il ne monte que quand le contrat change d'une façon que l'ancienne fabrication ne comprend pas. Ajouter un champ que l'ancienne fabrication ignore ne le fait pas monter.
- Le numéro de version reste « 1.0 » pendant tout le test : Apple ne relit en entier que la première fabrication d'une version (plan, 2.1, vérifié).
- Le numéro de fabrication est `github.run_number` de `app-testflight.yml`, qui ne fait que monter. Relancer une exécution (« Re-run ») garderait son numéro, qu'Apple refuserait : on lance toujours une nouvelle exécution. Le projet iOS du dépôt porte 1, que garde la fabrication du simulateur.
- **Les fabrications expirent au bout de 90 jours** dans TestFlight : une nouvelle fabrication part donc au moins tous les deux mois, même sans correction.

### 1.11 Les tests et le contrôle

- **`node --test`**, en quatre groupes, comme le test de 18h : sans base (aussi joués chez Scalingo à l'installation), avec base, navigateur (un vrai Chromium), journal de PostgreSQL.
- **Les quatre outils de `donnees.md`** (partie 2) : le traceur, les réponses inversées, l'horloge simulée, le relevé du réseau.
- **Les dix journées de `regles.md`** : le moteur doit retrouver exactement leurs résultats.
- **Le moteur de l'essai 2 sert de référence** : on compare les deux moteurs sur des milliers de manches tirées au hasard, pour les fonctions communes (2.2).
- **Une passe WebKit** sur une machine macOS de GitHub, reprise de l'essai 2.
- **L'application dans le simulateur d'iPhone** des machines de GitHub (`.github/workflows/app-simulateur.yml`, lancé à la main, sans aucun secret) : fabriquée sans signature, elle s'ouvre contre un faux serveur local sans aucune donnée, et fait deux captures (l'accueil, puis l'écran de mise à jour), gardées 3 jours. Le journal dit « juste » ou « ÉCART » : l'application a-t-elle joint le serveur, avec l'en-tête `Elenchos-Fabrication` ? C'est la preuve que le Swift compile. Le message, les vraies connexions, le trousseau, l'extension à l'œuvre et les liens universels ne se prouvent que sur l'iPhone du porteur.
- **`npm run controle`** (`outils/controle.ts`) : les types de tous les `tsconfig*.json` (le serveur, et l'interface par `tsconfig.interface.json` : le JSDoc de `public/` contre `contrat.ts`, bibliothèques limitées à ES2020 et au DOM pour iOS 15 ; le script de la page `/preparer`, dans `pages/`, aussi) ; la recherche de secrets dans les fichiers et tout l'historique ; les règles de la maison (journaux, adresses e-mail, mesure extérieure, noms de modèles, versions exactes) ; l'adresse du serveur fixée dans l'application : `public/index.html` porte la marque `__ELENCHOS_SERVEUR__` exactement deux fois, aucune adresse `http(s)://` n'est écrite en dur dans `public/` (sauf `localhost`), et `ios/adresse-serveur.txt` est vide ou porte une seule ligne `https://hôte`. Ce que `cap sync` fabrique et que git ignore n'est pas lu. Il est lancé avant toute mise en ligne du serveur, et la fabrication pour TestFlight le rejoue.
  - **Il ne refuse pas `A_ECRIRE`** : il bloquerait aussi la mise en ligne du serveur. C'est `app-testflight.yml` qui refuse une fabrication dont un texte porte encore la marque, avant de fabriquer puis dans l'IPA ; celle du simulateur l'accepte, pour qu'on voie les écrans avant les mots (`CONTRAT.md`, 1.6).
  - **La garde des horaires n'y est pas** : elle tourne à l'installation chez Scalingo (script `build`, 1.1) et dans `app-testflight.yml` (1.15).
  - **Les contrôles du fichier des textes** (`FORMAT.md`, partie 7) s'y ajouteront avec le lot de Contenu.

### 1.12 L'arborescence

```
jeu/
  CONTRAT.md, DECISIONS-TECHNIQUES.md     ce travail
  package.json, Procfile, tsconfig.json   étape 1
  tsconfig.interface.json                 les types de l'interface (public/), vérifiés contre contrat.ts
  capacitor.config.json                   la coquille (dossier de l'interface : public/)
  ios/                                    le projet iOS que Capacitor fabrique, avec nos morceaux Swift (App/App/),
                                          l'extension (App/Reception/), fixer-adresse.sh, et adresse-serveur.txt
                                          (l'adresse visée par la fabrication pour TestFlight)
  src/                                    serveur (TypeScript) ; contrat.ts ; regles/, le moteur ; serveur/ ; base/
  src/base/migrations/                    SQL numérotés
  public/                                 l'interface embarquée (JavaScript, JSDoc), styles ; polices : étape 2
  pages/                                  les pages web du serveur : /preparer, la page du mode préparation (1.17) ;
                                          N1, confidentialité et invitation : étape 2
  textes/                                 FORMAT.md, exemple.json, puis le lot de Contenu
  outils/                                 contrôle, garde des horaires, migrations, table des lettres qui imitent les
                                          nôtres ; plus tard : liens de créateur et de relecture, cercle de
                                          démonstration, proches simulés
  tests/                                  regles/ (le moteur), socle/ (serveur sans base, et base : exigent un
                                          PostgreSQL jetable) ; plus tard : navigateur/, journal-base/
.github/workflows/app-simulateur.yml, app-testflight.yml   la fabrication de l'application (1.11, 1.15)
```

### 1.13 Le message de 18h, par Apple

- **Le serveur s'adresse directement au service d'Apple** (APNs), en HTTP/2, avec un jeton signé par la clé `.p8` du porteur (ES256). Le jeton se renouvelle environ toutes les 40 minutes : Apple refuse un jeton de plus d'une heure, et un renouvellement trop fréquent.
- **Le service de production** (`api.push.apple.com`), que les fabrications TestFlight utilisent (vérifié le 16 octobre 2026 : Apple, « APS Environment Entitlement » ; partie 5). Le projet iOS porte `development`, Xcode écrit `production` à l'export, et `app-testflight.yml` le vérifie dans l'IPA avant tout envoi. La clé des messages est donc créée pour le seul service de production (1.7). Le réglage `APPLE_SERVICE_MESSAGES=essai` reste dans le code, mais ne sert pas avec TestFlight, et il demanderait une clé créée pour le service d'essai. En local, aucun message ne part.
- **Ce qu'on reprend de `test-18h/`** : le planificateur, adapté. Un envoi par jour vers chaque abonnement actif, un verrou « un envoi par jour et par abonnement », un rattrapage jusqu'à 18h30, et le texte choisi parmi les six de `MESSAGES_18H` (E1). À l'étape 1, sans jeu, le texte est « 18h. La question d'aujourd'hui t'attend. » (`rienNAttendEncore`, que l'étape 2 remplace).
- **Fait à l'étape 1 (travail D)** : `src/serveur/apns.ts` (HTTP/2, `node:http2` ; le jeton ES256 refait au bout de 40 minutes ; durée de vie du message 30 minutes ; priorité immédiate), `src/serveur/planificateur.ts` (le message et le ménage), `src/serveur/routes.ts` (`POST /api/abonnement`, `POST /api/recu`). Deux abonnements au même jeton d'appareil ne font partir qu'un message. « Message envoyé » se compte quand Apple accepte (D-066, point 4).
- **Le contenu** est `MessageApns` (`contrat.ts`) : un titre, un texte, `mutable-content` à 1 (sans lui, iOS ne lance pas l'extension, qui ne signale rien), et le numéro d'envoi tiré au hasard (un UUID ; l'extension accepte un texte base64url de 64 caractères au plus). **Apple peut le lire** : il ne contient rien de personnel, sauf le pseudo de l'annonce d'arrivée (P-05 ; `CONTRAT.md`, 2.13).
- **Un abonnement refusé par Apple** (application désinstallée, jeton périmé : 410) est retiré. Un 400 « BadDeviceToken » ne retire rien : il viendrait aussi d'un service d'Apple mal réglé (production contre essai), et effacerait alors tous les abonnements.
- **Couper le message** dans les Réglages (D-029) arrête l'envoi pour tous les appareils du joueur.

### 1.14 La connexion

- **Apple, en natif** : la feuille d'Apple rend un jeton signé. Le serveur vérifie la signature avec les clés publiques d'Apple, l'émetteur, l'application visée, l'échéance, le nonce qu'il a lui-même donné, et le vérificateur (`CONTRAT.md`, 2.5). On ne demande que l'identifiant (D-061).
- **Google, par la feuille du système** : Google interdit sa connexion dans une page intégrée à une application. La feuille ouvre le parcours déjà écrit dans `connexion.ts`, avec un retour par formulaire (`response_mode=form_post`), un code de retour d'une minute après « # », et le vérificateur. Aucune bibliothèque de Google dans l'application. Chez Google, l'écran d'accord est publié « en production » avec la seule demande d'identifiant (de mémoire, plan 2.3).
- **Le vérificateur** : l'application (le module Swift, 1.3) tire 32 octets, envoie leur empreinte au début, et les octets eux-mêmes à la fin. Un jeton d'Apple ou un code de retour volé ne sert donc à rien sans la mémoire de l'application qui a commencé. Le calcul exact est celui de PKCE « S256 » : vérificateur en base64url (43 caractères), défi = base64url(SHA-256(ces 43 caractères)) (`CONTRAT.md`, 2.5).
- **Fait à l'étape 1 (travail D)** : `src/serveur/apple.ts` (le jeton : RS256 avec les clés publiques d'Apple, gardées en mémoire et relues au plus une fois par minute pour une clé inconnue ; émetteur, audience, échéance ; nonce et identifiant présents), `src/serveur/connexion.ts` (le nonce donné, la connexion consommée une fois, le vérificateur, le compte retrouvé ou celui d'un créateur créé ; l'identité gardée en empreinte avec `CLE_IDENTITES`), `src/serveur/sessions.ts`. Le compte d'un invité, la fusion d'un joueur provisoire dans un compte retrouvé, Google et la révocation viennent à l'étape 2 (`CONTRAT.md`, partie 9).
- **Le compte du porteur à l'étape 1** (D-068 : arbitrage de l'équipe, à dire au porteur, renversable ; `CONTRAT.md`, 2.5) : le contrat ne crée un compte qu'au bout du défi, qui vient à l'étape 2. Le réglage `COMPTE_PORTEUR` (un pseudo) laisse la première connexion Apple ouvrir le compte du porteur, tant qu'aucun compte n'existe dans la base, et seulement alors ; il est retiré de Scalingo après usage. Il touche la lettre de D-006 pour ce seul compte. Avant les amis, ce compte est effacé ou gardé comme compte de joueur du porteur : choix de l'équipe à l'étape 4, dit au porteur (D-068). Le tout sous réserve de la réponse du porteur à la question de D-064 : si elle est « à l'étape 4 », le compte du porteur, `COMPTE_PORTEUR` et les trois soirs de vérification passent à l'étape 4.
- **E-mail** : inchangé (Scaleway), allumé à l'étape 4 avec le domaine.
- **La révocation chez Apple à « Tout effacer »** (arbitrage de l'équipe, plan de D-064 ; un jour de travail) :
  - la feuille d'Apple, montrée à la confirmation, rend un code d'autorisation neuf ;
  - le serveur efface d'abord tout, en une transaction ;
  - puis il échange le code chez Apple, avec un secret signé par la clé « Se connecter avec Apple », demande la révocation du jeton obtenu, et ne garde rien.

  Un échec chez Apple ne bloque jamais l'effacement : `revoque` vaut faux, et N14 dit comment le retirer soi-même.
- **Google** : coupé de notre côté seulement, comme D-061 l'avait arrêté. Le révoquer chez Google demanderait de garder son jeton, ou de faire repasser le joueur par Google.
- **Les règles d'Apple** : effacer son compte dans l'application (5.1.1 (v)), c'est « Tout effacer » ; Google étant proposé, une connexion qui protège la vie privée doit l'être aussi (4.8), c'est Apple.

### 1.15 Fabriquer et distribuer l'application

- **Sur les machines macOS de GitHub**, gratuites pour un dépôt public (vérifié, plan 2.5 ; documentation de GitHub, 16 octobre 2026), par `.github/workflows/app-testflight.yml`, lancé à la main :
  - machine `macos-26`, Xcode 26.6 choisi explicitement : depuis le 28 avril 2026, Apple n'accepte un envoi que fait avec Xcode 26 et le SDK d'iOS 26 (vérifié, partie 5) ;
  - Capacitor recopie l'interface (`cap sync ios`, qui ne doit rien changer au projet du dépôt), Xcode archive, puis l'export pour l'App Store signe avec les certificats gérés par Apple, par la clé d'API d'App Store Connect : une **clé d'équipe, rôle Admin**, car les clés individuelles n'ont pas les fonctions « Provisioning » (certificats et profils) (vérifié ; le rôle Admin, lui, ne vient que du forum d'Apple) ;
  - les secrets sont dans l'**environnement GitHub `testflight`**, réservé à la branche `mise-en-ligne` (1.17). La clé est écrite sur la machine avec des droits restreints, puis effacée, même en cas d'échec ; le journal ne montre que des verdicts ;
  - **trois façons de signer l'archive** avant l'export, au choix du lancement (`signature_archive` : `sans`, par défaut, `ponctuelle` ou `automatique`). Sans Mac, on ne sait pas d'avance laquelle passe : le premier passage le dira ;
  - **l'IPA est vérifiée avant tout envoi** : identifiants, numéros de fabrication et de version, messages en `production`, connexion Apple, aucun droit de débogage, adresse du serveur au bon endroit, aucun texte marqué `A_ECRIRE`. Un écart, et rien ne part ;
  - **un passage à blanc d'abord** : `envoyer` est décoché par défaut ; tout est fabriqué et vérifié, rien n'est envoyé ;
  - environ 15 à 20 minutes, puis le traitement d'Apple.
- **Seulement depuis la branche `mise-en-ligne`**, après le feu vert écrit du porteur la veille (D-054). Pour être lançables, les deux workflows doivent être sur `main` (sinon GitHub ne les montre pas), et sur `mise-en-ligne` pour la fabrication TestFlight.
- **Jamais de 15h à 19h, ni le dimanche** (D-043, D-054) : une fabrication proposée aux testeurs à 17h55 présente le même risque qu'une mise en ligne du serveur.
  - La fabrication refuse de démarrer à partir de 14h et le dimanche (tâche « garde », sur Linux, avant toute machine macOS ; proposé : une heure de marge pour le traitement d'Apple). Juste avant l'envoi, elle refuse encore à partir de 15h.
  - **Ce qui n'est tenu qu'à l'envoi, dit franchement** : la règle « ajoutée aux testeurs avant 15h, sinon le lendemain matin » ne se tient qu'au moment où la fabrication part. Si le groupe des testeurs reçoit les fabrications automatiquement, Apple propose la fabrication dès qu'il l'a traitée, ce qui peut tomber après 15h. Sans risque à l'étape 1, où le porteur est le seul testeur ; à régler avant les amis (étape 5).
- **L'accès à l'API d'App Store Connect** se demande par le titulaire du compte, et Apple l'étudie au cas par cas, sans délai connu ; rien n'exclut un compte individuel (vérifié, aide d'Apple, 16 octobre 2026 ; partie 5). Premier repli : signature à la main (certificat de distribution et profils créés sur le site d'Apple, environ dix gestes de plus pour le porteur, gratuits) ; une clé individuelle ne peut pas signer automatiquement. Ce repli demanderait de changer le workflow. Dernier recours, présenté au porteur avec son montant avant toute dépense (D-063) : un Mac loué pour une journée.
- **Les testeurs** : le porteur, testeur interne, sans relecture, dès l'étape 1 **sous réserve de la réponse du porteur à la question de D-064** ; si elle est « à l'étape 4 », le compte du porteur, `COMPTE_PORTEUR` et les trois soirs de vérification passent à l'étape 4 (D-068). Ses amis, testeurs externes, par le lien public, après la relecture d'Apple (plan de D-064).

### 1.16 Le cercle de démonstration, pour le relecteur d'Apple

- **Un outil du serveur**, geste du porteur, fabrique le lien de relecture : plusieurs usages, 30 jours. **Chaque ouverture du lien crée un cercle de démonstration neuf**, marqué « démonstration », aux quatre membres inventés, sans compte ni identité, avec leurs réponses d'entrée inventées : deux relecteurs ne partagent jamais un cercle (`donnees.md`, P-19 a ; arbitrage de l'équipe du 16 octobre 2026, qui retient cette version, plus sûre, au lieu d'un seul cercle partagé). Le cercle naît à la première réponse enregistrée, puisqu'ouvrir un lien n'écrit rien (P-29). C'est une **exception à D-006 (arbitrage 3, lien à usage unique) et à P-29**, arbitrée par l'équipe et bornée aux cercles inventés (D-065, point 3).
- **Un module du serveur** fait répondre ces membres chaque jour, avant 17h, par un tirage fixe sur les positions et les raisons du texte du jour. Il ne voit que les cercles marqués ; la marque ne se pose que par l'outil et par ce lien.
- **Les mesures** excluent les cercles marqués.
- **Après la relecture**, l'outil efface le compte du relecteur comme « Tout effacer ».
- Il mêle des données inventées à la base réelle : c'est une exception écrite au principe de P-19 (une base est « inventée » ou « réelle » ; P-19 et P-20, allégés pour le test avec D-060), bornée à ces cercles (`CONTRAT.md`, partie 8) ; `donnees.md` l'écrit désormais (P-19 a).

### 1.17 Les réglages, en une seule liste (noms seulement)

*D'après le serveur (travail D) et la coquille (travail E), 16 octobre 2026. Les valeurs sont saisies par le porteur, jamais écrites dans le dépôt, sauf l'adresse du serveur et l'identifiant de l'application, qui ne sont pas des secrets.*

**Chez Scalingo** (l'application du jeu ; chaque réglage manquant est signalé par son nom au démarrage, `config.ts`) :
- **indispensables** : `ADRESSE_PUBLIQUE`, `SECRET_SESSION`, `CLE_REPONSES`, `CLE_IDENTITES` (les trois clés distinctes ; `CLE_IDENTITES` ne change jamais pendant le test, 1.7), `FIN_DU_TEST`, `PROJECT_DIR=jeu` ;
- **le mode préparation**, pour que le porteur puisse tirer les trois clés : si elles manquent **toutes les trois** et que rien d'autre n'empêche de démarrer, le serveur démarre quand même, sans toucher à la base, sans planificateur ni ménage, et ne sert que la page `/preparer` (`pages/`), qui les tire dans le navigateur du porteur et n'envoie rien ; tout le reste répond 503, et le journal dit seulement « mode preparation ». Une ou deux clés seulement, une clé illisible ou deux clés égales : le serveur refuse de démarrer, comme avant (`config.ts`, `preparation.ts` ; `CONTRAT.md`, 2.17). Une fois le serveur parti avec ses clés, le témoin des clés (1.7) refuse tout démarrage avec une autre `CLE_REPONSES` ou une autre `CLE_IDENTITES` ;
- **posés par Scalingo lui-même**, que le serveur lit sans qu'on les règle : `SCALINGO_POSTGRESQL_URL`, `CONTAINER` (il dit au serveur qu'il est en ligne), `PORT`, `SOURCE_VERSION` ;
- **la connexion Apple et le message de 18h** : `APPLE_ID_APPLICATION` (`io.github.ppcrepin.elenchos`), `APPLE_ID_EQUIPE`, `APPLE_ID_CLE_MESSAGES`, `APPLE_CLE_MESSAGES` ;
- **la version minimale** : `FABRICATION_MINIMALE` (absent : signalé, et toute fabrication est acceptée) ;
- **l'étape 1 seulement** : `COMPTE_PORTEUR` (D-068), retiré après la première connexion du porteur ;
- **l'étape 2** : `APPLE_ID_CLE_CONNEXION`, `APPLE_CLE_CONNEXION` (une seconde clé, recommandée, 1.7) ; `GOOGLE_ID_CLIENT`, `GOOGLE_SECRET_CLIENT` ; les trois blancs de N6 (`GET /api/droits`), dont les noms se fixent avec leur route ;
- **seulement s'il le faut** : `MODE_ROLES=repli` (si les rôles sont impossibles, 1.6) ; `APPLE_SERVICE_MESSAGES` (jamais avec TestFlight, 1.13) ;
- **jamais en ligne** (le serveur refuse alors de démarrer, `CONTRAT.md`, partie 5) : `IGNORER_HORAIRES`, `HORLOGE_VITESSE`, `HORLOGE_DEPART`, `CODES_ESSAI_LOCAUX`.

**Chez GitHub** :
- **l'environnement `testflight`**, réservé à la branche `mise-en-ligne`, avec quatre secrets, lus par `app-testflight.yml` seulement : `ASC_CLE_ID`, `ASC_EMETTEUR_ID`, `ASC_CLE_P8` (la clé d'App Store Connect, 1.15), et `APPLE_ID_EQUIPE`, le même nom et la même valeur que chez Scalingo ;
- `app-simulateur.yml` n'a besoin d'aucun secret.

**Dans le dépôt, pas un secret** : `jeu/ios/adresse-serveur.txt`, l'adresse que vise l'application fabriquée pour TestFlight. Une seule ligne `https://hôte`, en pratique la même que `ADRESSE_PUBLIQUE`. Vide tant que l'adresse gratuite de Scalingo n'est pas connue : la fabrication pour TestFlight refuse alors de partir. Le workflow la passe à Xcode (réglage de fabrication `ELENCHOS_SERVEUR`) ; `ios/App/fixer-adresse.sh` la recopie dans la page embarquée, l'extension la lit dans son `Info.plist`, et le workflow vérifie dans l'IPA qu'elle est la même aux deux endroits. Passer au domaine : changer cette ligne, puis refaire une fabrication.

## 2. Ce qui est repris

### 2.1 Du test de 18h (`test-18h/`)

D'après le plan (2.2), complété :

| Sort | Fichiers | Ce qui change |
|---|---|---|
| Tel quel | `garde-horaires.ts` et son outil, `crypto.ts`, `journal.ts` (avec les listes fermées des routes du contrat), le chiffrement de `base.ts`, le contrôle du code, la vérification GitHub, le `Procfile`, leurs tests sans base et le test du journal de PostgreSQL | les listes de `journal.ts`, vérifiées contre le contrat à la compilation ; dans `crypto.ts`, le « pourquoi » chiffré et la clé des identités |
| Adapté | `horloge.ts` | l'heure de Paris vient du moteur (`src/regles/heure.ts`), seule source ; le jour de jeu porte le nom du jour où il finit |
| Adapté (fait, étape 1) | `planificateur.ts` | un envoi par jour vers chaque abonnement actif, verrou par abonnement, rattrapage jusqu'à 18h30 ; les six textes de `MESSAGES_18H` choisis selon ce qui attend chaque joueur ; et le ménage quotidien. L'annonce d'arrivée vient avec le compte d'un invité (étape 2) |
| Adapté (en partie, étape 1) | `connexion.ts` | Apple natif (fait : `apple.ts`, `connexion.ts`) ; créer ou retrouver le compte (fait pour la reconnexion depuis N1, l'ancien « J'ai déjà un compte », et le créateur ; l'invité et la fusion à l'étape 2) ; Google par la feuille du système, avec retour par formulaire et code de retour, et le refus d'un compte Google d'organisation (P-41) : étape 2 |
| Adapté (fait, étape 1) | `serveur.ts`, `principal.ts` | jetons au lieu des cookies (`sessions.ts`), CORS limité à l'application, version minimale, limiteur par session ; en-têtes de sécurité et « rien dans les adresses » gardés ; routeur typé contre `Routes` (`routeur.ts`) |
| Adapté (fait, étape 1) | `config.ts` | nouveaux réglages (clés d'Apple séparées par fonction, version minimale, compte du porteur) ; les réglages dangereux refusés en ligne |
| Adapté (fait, étape 1) | `mesure.ts` | devenu `mesures.ts` : « le soir même », de 18h à minuit, heure de Paris, le jour de la révélation (confirmé par Game design, au titre de D-062 point 5, renversable) ; la mesure « message reçu » est comptée par `POST /api/recu` (`routes.ts`) |
| Remplacé (fait, étape 1) | `push/chiffrement.ts`, `push/envoyeur.ts`, `push/services.ts` | un envoyeur vers Apple d'environ 150 lignes (`apns.ts`, 1.13) |
| Retiré | `public/sw.js`, la logique de `public/app.js` (`depuisIcone`, `messagesPossibles`) | sans objet dans une application |
| Adapté (fait, étape 1) | `public/preparer.html`, `public/preparer.js` | devenus `pages/preparer.*`, servis par `src/serveur/preparation.ts` en mode préparation seulement : les trois clés du serveur, rien d'autre (1.17) |
| Non repris | `pages.ts`, `depot.ts`, la page de résultats | le principe de `effacer.ts` (vider, puis vérifier que c'est vide) sert à « Tout effacer » |

### 2.2 Du second essai (`docs/essai/a-ne-pas-ouvrir-2/outillage/page/`, le code seulement)

| Sort | Ce qui est repris | Ce qui change |
|---|---|---|
| Gardé | `style.css`, partie « Téléphone : La Tablée » ; les polices réduites Alegreya et Alegreya Sans, avec leurs licences | l'écran occupe tout l'iPhone, zones sûres comprises ; le cadre de l'essai est retiré ; l'avis du cercle devient une barre en cinq parts, d'une seule teinte |
| Gardé | le haut d'`interface.js` : les outils de page et les petits blocs (bandeaux, boutons, positions, raisons, visages, curseurs, feuille, onglets) | ils lisent une réponse du serveur au lieu du socle, du moteur et du calendrier |
| Adapté | les écrans de l'entrée, Deviner, Répondre, En attendant, la révélation, les titres, Moi, Le Cercle, l'écran d'un proche | la révélation suit les étapes rendues par le serveur |
| Adapté | `textes.js` : les mots validés des écrans | les mots de N1 à N18 et de la phase 0 ajoutés ; ceux de l'icône retirés. **L'agent qui le reprend vérifie d'abord qu'il ne contient aucun texte du lot de l'essai** |
| Extrait | de `noyau.js` : `typographier`, `dePrenom`, `quePrenom`, `listeEt` ; `squelette` (E7) | `noyau.js` n'a pas de table des caractères qui se ressemblent (« {} en attendant ») : elle est tirée de `confusables.txt` d'Unicode, comme il le prévoyait, par `outils/confusables.ts` (`src/regles/confusables.ts`) |
| Porté en TypeScript, côté serveur | de `moteur.js` : le tirage `t(clé)` ; `identiques`, `estJuste`, `redistribuer`, `verdict` ; les points ; `avisCercle` ; `classer` ; `calculerManche` (les réponses inattendues, R3) ; `curseur` ; `pasDeCote` ; `calculerTemperaments` ; `phraseSemaine` ; `calculerTitres` (Le Devin, Le Mystère, Le Sans-Faute, la surprise) | aux seuils de `regles.md` (validés par D-052), qui ne sont pas toujours ceux de l'essai ; comparés au moteur de l'essai sur des milliers de manches |
| Réécrit | la carte « qui et pourquoi » (règle 9, D-038) ; Le Fidèle (règle 12) ; `phraseDuJour` (huit tensions, mots de D-053) ; R8 ; pause et sommeil ; départs (règle 4) ; la règle 20 | prouvés par les dix journées de `regles.md` |
| Repris | `harnais/navigateur.js` (appareil « iPhone 15 », horloge, sombre, animations réduites) ; `harnais/passe-webkit.js` | le mode « app » de Safari n'a plus d'objet |
| Non repris | le socle, les sauts, le rattrapage, le carnet, le cadre, le dévoilement, le témoin, tout ce qui suppose le fichier scellé et des personnages simulés ; la détection de la page-test de l'icône | — |

## 3. Les trois réponses d'entrée de l'invité : l'option B tient

### 3.1 La question, et la décision de la phase 0

Marie ouvre le lien de Thomas, accepte la carte, répond à trois textes et devine Thomas sur chacun. Puis elle crée son compte, ou s'en va. Entre la carte et le compte, ses trois réponses existent. Où ?

La phase 0 a tranché pour **l'option B : un joueur provisoire en base dès l'accord, effacé au bout de 7 jours**. Juridique préférait l'option A, garder les réponses dans le téléphone jusqu'au compte. L'équipe a retenu B pour la solidité, avec un lien d'effacement avant le compte. Le raisonnement complet est dans l'historique de ce fichier (version du 15 octobre 2026) ; en voici l'essentiel :
- pour tenir P-29 (le lien ne sert qu'une fois) et P-34 (accord enregistré avant toute réponse), le serveur doit de toute façon enregistrer l'accord et la liaison du lien avant le compte, même dans l'option A ;
- l'option A ne gagne donc que les trois réponses d'une personne qui s'arrête avant le compte, 7 jours au plus ;
- B tient P-29 et P-34 tels qu'ils sont écrits, à l'heure du serveur, avec un seul chemin d'enregistrement.

### 3.2 Ce que l'application change

- **Le cookie `__Host-provisoire` devient un jeton provisoire**, rendu par l'accord et rangé dans le trousseau, 7 jours au plus. Le reste de l'option B ne change pas.
- **L'argument de solidité de B se renforce** : dans l'application, iOS peut fermer l'application en arrière-plan pendant le passage par Mail ou par la feuille de Google. Une option A garderait les réponses dans la mémoire de l'application, et les perdrait.
- **Un cas nouveau : le joueur inscrit qui relève un défi** (règle 15). Il n'a pas de joueur provisoire : ses réponses nouvelles s'enregistrent sur son compte, et le lien se lie à lui (`CONTRAT.md`, 2.4).
- **Un compte retrouvé depuis un défi** (réinstallation) : le joueur provisoire se fond dans le compte, et la réponse la plus ancienne reste définitive (`CONTRAT.md`, 2.5).

### 3.3 Les conditions, inchangées

1. **Rien avant l'accord.** Ouvrir le lien n'enregistre rien.
2. **Le joueur provisoire ne garde que** l'accord, les trois réponses chiffrées, la liaison du lien, le score du pari, et le pseudo dès qu'il est choisi. Ni identité, ni adresse, ni rien de l'appareil.
3. **Effacé au bout de 7 jours** par le ménage quotidien, ou tout de suite s'il se fond dans un compte. Personne n'en est averti.
4. **Personne ne le voit** : il n'est membre d'aucun cercle (1.6).
5. **« Qui, durée, droits » le dit** : « Si tu t'arrêtes avant de créer ton compte, tes réponses sont effacées au bout de 7 jours. »
6. **« Effacer mes réponses »** sur l'écran du compte (1.8) et sur N15 : `POST /api/tout-effacer`, accepté en session provisoire.

## 4. Ce que ces choix touchent

- **D-062 et le plan de D-064** : appliqués. Capacitor, l'interface embarquée, la fabrication sur GitHub, le message par Apple, la connexion native, les jetons sont les choix de l'équipe annoncés dans le plan (« Ce que l'équipe tranche »).
- **D-061, arbitrage d'équipe « Tout effacer coupe le lien de notre côté seulement »** : il tombe pour Apple, qui est révoqué (1.14), comme le plan l'a annoncé ; il reste pour Google. D-035 (règle 5) et P-38 sont en partie rétablis. À dire en une ligne au point d'étape (`CONTRAT.md`, partie 8).
- **P-11, P-41** : jeton au lieu de cookie, même exigence tenue. **P-06** : sans objet dans une application (Apple lit le message) ; P-05 tient.
- **P-19** : une exception écrite pour le cercle de démonstration (1.16).
- **`plateforme.md`, annexe A** : la location d'un Mac n'est plus prévue ; Xcode Cloud est écarté (plan).
- **La carte des données** (`donnees.md`, partie 4) : à mettre à jour par Back-end avec Juridique. En attendant, la carte du code (`src/base/carte.ts`) fait foi : chaque table et chaque colonne réelles y figurent, avec leur usage et leur durée.
  - Les sessions sont des jetons ; `donnees.md` a désormais sa ligne « session ».
  - S'ajoutent : l'abonnement par appareil, la connexion en cours (10 minutes), le code de retour (une minute), la note « écran Répondre affiché » (jusqu'à la fermeture du texte), l'étape vue de la révélation (jusqu'au 18h suivant).
  - S'ajoutent aussi, nés avec le schéma : l'éveil du cercle par jour, les comptes de la semaine par membre, les comptes d'attributions par texte et par cercle, les manches, les cartes (le « pourquoi » chiffré, la marque « vidée par un départ »), « vu » (sans heure), le message coupé, le refus des mesures, les envois, les compteurs et totaux des mesures, et le verrou des joueurs distincts ; sur le joueur, la forme de comparaison du pseudo et la date de création ; sur le membre, le créateur et la date d'arrivée ; et les tables publiques sans donnée de joueur (textes, calendrier, versions de la carte de consentement).
  - Gardés alors que `donnees.md` dit « recalculé » : les tempéraments en cours (la marge des 4/5 demande de savoir depuis quand on en tient un) et les tensions nettes du dimanche précédent (« devenue nette », règle 18).
  - Les dérivés en clair acceptés (verdicts, « qui et pourquoi », Pas de Côté, tempéraments, tensions nettes, comptes) sont listés en tête de `src/base/carte.ts`, comme dans `donnees.md` (partie 4), d'après l'avis de Juridique du 16 octobre 2026.
  - L'histogramme de la durée de la raison existe déjà dans `donnees.md` ; le cercle de démonstration n'est pas encore dans le schéma (1.16).
  - **L'adresse e-mail n'est jamais gardée** (1.7) : l'effacement après 12 mois d'inactivité, prévenu par un e-mail 30 jours avant (D-045, point 1 ; P-30), ne peut donc pas se faire tel quel pour un compte e-mail. Sans objet pendant le test (tout est effacé à la fin, D-061, point 2) ; à régler avant la version publique.
  - Ce sont des précisions, sans décision touchée. Les usages et durées à revoir avec Juridique sont listés avec la carte.
- **P-02** (chiffrement des réponses) : gardé, retirable, déjà signalé avec D-060. **P-13, P-19, P-20** : allégés pour le test, déjà signalés avec D-060.
- **Le repli des rôles** (1.6), s'il est nécessaire, affaiblit P-01, P-22 et P-23 : il faudrait alors le dire au porteur.
- **D-066** (quatre arbitrages de l'équipe sur avis de Juridique) : appliqués dans la base et `totaux.ts` (1.5) ; le détail est dans `CONTRAT.md`, partie 8.
- **D-068** (le compte du porteur ouvert sans défi à l'étape 1, `COMPTE_PORTEUR`) : appliqué par le serveur (1.14) ; touche la lettre de D-006 pour ce seul compte.
- **D-054** (l'iPhone seulement) : tenu par la coquille (`TARGETED_DEVICE_FAMILY = 1`, N2 sur un iPad ou un Mac, 1.3) ; le risque de la règle 2.4.1 d'Apple est en partie 5. **D-043 et D-054** (heures et branche) : tenus par `app-testflight.yml` (1.15), avec la limite dite en 1.15.
- **D-050** : l'icône de l'application est l'icône « jour » du logo, provisoire, à confirmer par la Direction artistique (1.3).

## 5. Limites et doutes

- **De mémoire, à vérifier au début de l'étape 1.** Vérifié le 16 octobre 2026 par la coquille (travail E), dans les documentations d'Apple, de Capacitor et de GitHub, lues comme des données ; les lignes rayées sont closes, et ce qui reste à prouver est dit à chaque ligne :
  - la création de rôles chez Scalingo : **reste à prouver chez Scalingo** (1.6) ;
  - ~~le plancher d'iOS de Capacitor~~ : **iOS 15**, avec Xcode 26 et Node 22 au moins (documentation de Capacitor 8, dépôt `ionic-team/capacitor-docs` : « iOS 15+ is supported. Xcode 26.0+ is required » ; `Package.swift` des paquets, `.iOS(.v15)`). Confiance haute ;
  - ~~le service de production d'Apple pour TestFlight~~ : **production** (Apple, « APS Environment Entitlement » : les versions de test et leurs testeurs utilisent la production ; « Establishing a token-based connection to APNs »). Fait nouveau : depuis 2025, une clé des messages ne vaut que pour un service (production ou essai) et pour l'équipe ou un seul sujet. Confiance haute ; **la livraison elle-même reste à prouver sur l'iPhone** ;
  - ~~le blocage des cookies dans l'application~~ : **oui, par défaut depuis iOS 14** (documentation de Capacitor 8 : « As of iOS 14, you cannot use 3rd party cookies by default » ; article de WebKit de 2020 sur le blocage complet des cookies tiers). Confiance moyenne à haute ; sans conséquence, puisque l'application n'a pas de cookie ;
  - le « # » transmis par un lien universel : **très probablement** (Apple, « Supporting associated domains », « Supporting universal links in your app », « applinks components » : le fichier d'association sait filtrer sur le fragment, et l'adresse rendue est celle que l'utilisateur ouvre ; Apple ne l'écrit pas mot pour mot). Confiance moyenne à haute ; **reste à prouver sur l'iPhone, à l'étape 2** ;
  - le retour de Google par formulaire dans la feuille du système : **non vérifié** (étape 2) ;
  - ~~la clé « Se connecter avec Apple » nécessaire à la révocation~~ : **oui**, une clé qui porte ce service, associée à l'identifiant principal de l'application, deux au plus par identifiant (Apple, « Create a private key », « Create a Sign in with Apple private key », « Token revocation », « Creating a client secret »). Confiance haute. Qu'une même clé porte encore aussi les messages n'est pas vérifié (confiance basse) : deux clés (1.7) ;
  - l'accès à la clé d'App Store Connect pour un compte individuel : **en partie vérifié** (Apple, aide « App Store Connect API », « Creating API Keys », « Cloud-managed certificates ») : le titulaire demande l'accès, Apple l'étudie au cas par cas, sans délai connu ; rien n'exclut un compte individuel ; une clé d'équipe est nécessaire, les clés individuelles n'ayant pas les fonctions « Provisioning ». Le rôle Admin, et les échecs possibles de la signature sur une machine neuve ou de l'envoi par clé d'API, ne viennent que du forum d'Apple. Confiance moyenne ; **le premier passage sur GitHub le dira** (1.15).
- **Vérifié aussi, le 16 octobre 2026** :
  - Capacitor 8.5.3 est la dernière version stable (registre npm ; publiée le 7 octobre 2026) ; `cap add ios` et `cap sync ios` marchent sous Linux, avec Swift Package Manager, par défaut depuis Capacitor 8 (essai fait ; documentation de Capacitor 8). La compilation, elle, se prouve au premier passage ;
  - depuis le 28 avril 2026, Apple exige Xcode 26 et le SDK d'iOS 26 pour tout envoi ; depuis le 9 septembre 2026, une cible iOS 13 au moins (Apple, « Upcoming Requirements ») ; l'image GitHub `macos-26` porte Xcode 26.6 par défaut (`actions/runner-images`, image du 7 septembre 2026) ;
  - GitHub Actions est gratuit pour un dépôt public sur les machines standard ; les environnements, leurs règles de branche et leurs secrets y sont disponibles (dépôt `github/docs`). Si le dépôt devenait privé, les minutes macOS deviendraient payantes (D-063).
- **Reste à prouver au premier passage sur GitHub** (`app-simulateur.yml`, puis `app-testflight.yml` à blanc) : que le Swift compile (aucun compilateur Swift sur nos machines) ; que l'application s'ouvre dans le simulateur et joint `http://localhost` depuis `capacitor://` (WebKit pourrait bloquer ce mélange) ; laquelle des trois signatures passe ; que l'export par Apple garde les droits (messages, connexion) ; que l'envoi avec la clé d'API fonctionne.
- **Reste à prouver sur l'iPhone du porteur** : la feuille d'Apple et le vrai jeton d'Apple, avec son audience ; le trousseau ; le jeton d'appareil ; l'acceptation par Apple du jeton ES256 signé par la clé `.p8` ; la livraison du message à 18h ; l'extension qui signale la réception ; le retrait sur 410 après une désinstallation.
- **Reste à prouver chez Scalingo** : la création des rôles (sinon `MODE_ROLES=repli`, 1.6) ; que la plus petite base accepte 9 connexions, sans PgBouncer intercalé ; que l'en-tête `X-Forwarded-Proto` arrive ; que le script `build` est lancé à l'installation (repris de `test-18h`, non revérifié) ; que le planificateur se réveille à l'heure dans un conteneur ; que la première installation, en mode préparation, est acceptée (d'après sa documentation, Scalingo n'attend qu'une connexion acceptée sur le port, pas une réponse 200) et que son routeur rend la page et les 503 tels quels.
- **L'iPhone seulement (D-054) face aux règles d'Apple** : la règle 2.4.1 attend qu'une application pour iPhone fonctionne aussi sur un iPad ; sur un iPad, la nôtre montre N2. À voir à la relecture d'Apple, à l'étape 2.
- **Sans Mac, un défaut qui n'apparaît que sur un vrai iPhone est plus long à comprendre** : l'inspecteur de Safari demande un Mac. Parade : l'application signale ses erreurs au serveur, sans aucun contenu de joueur (une route à ajouter au contrat si le besoin se confirme : elle n'existe pas encore) ; si l'on reste bloqué, un Mac loué une journée, présenté d'abord au porteur avec son montant (D-063).
- **Les premiers morceaux natifs du projet** : nos durées sont des estimations, sans mesure sur ce type de travail.
- **Seuls des modèles relisent ce code**, qui gardera des opinions (D-043, point 2) ; aucun avocat (D-056).
- **À observer avec de vraies personnes** : combien d'invités vont au bout des gestes de TestFlight ; si le message arrive sur des iPhone plus anciens que celui du porteur ; si la feuille de Google est comprise ; combien d'invités s'arrêtent entre le défi et le compte (ce que l'option B garde 7 jours).
