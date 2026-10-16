# Les choix techniques (le jeu entier, application iPhone)

*Étape 1, travail A (D-064). Back-end et Front-end, ensemble, 16 octobre 2026. Ce document arrête les choix techniques que D-048 et D-062 (point 5) laissent à l'équipe, pour le jeu entier dans une application iPhone testée par TestFlight. Il remplace la version de la phase 0 (D-060, 15 octobre 2026). Il garde ce qui tient, et dit ce qui change, à partir du plan de D-064 (`docs/etape-6/plan-jeu-entier.md`, et le détail de `plan-jeu-entier-equipe.md`, partie 2). Il ne décide rien de ce qui revient au porteur, et n'engage aucune dépense (D-063). Le contrat est dans `jeu/CONTRAT.md`, ses types dans `jeu/src/contrat.ts`, le format des textes dans `jeu/textes/FORMAT.md`. À relire par Cohérence puis par le Vérificateur.*

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
| Emballage | Capacitor, outil libre, et deux de ses modules officiels : les notifications et le cycle de vie de l'application (liens reçus, retour au premier plan) | Partie 1.3 ; le plan, 2.1 |
| Morceaux natifs | Un petit module Swift à nous, et une extension Swift de réception du message | Ce que le web ne fait pas ; pas de module tiers de plus |
| Outils de développement | `typescript`, `@types/node`, `@types/pg`, `playwright-core`, la ligne de commande de Capacitor | Ceux du test de 18h, plus Capacitor |

`jeu/` a son propre `package.json`, de type module, et son `Procfile` (`web: node src/serveur/principal.ts`) ; Scalingo installe ce dossier (`PROJECT_DIR=jeu`). À l'installation, le script `build` joue la garde des horaires puis les tests sans base (`tests/socle/*-sans-base.test.ts`) : de 15h à 19h et le dimanche, l'installation échoue (D-043, D-054). Au démarrage, le serveur joue les migrations et prépare les rôles lui-même (`principal.ts`). Les versions sont épinglées exactement, comme aujourd'hui. Capacitor et ses deux modules s'y ajoutent au début de l'étape 1, à la dernière version stable, épinglée. Les fichiers repris de `test-18h/` sont copiés dans `jeu/`, avec en tête leur origine ; `test-18h/` reste intact (D-060, point 3).

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

**L'application** (noms proposés) :
- `client.js` : les échanges, l'enveloppe, les trois en-têtes, la version minimale, les erreurs ;
- `ecran.js` : une fonction pure qui, de `Etat`, de l'adresse reçue et de l'appareil, tire l'écran à montrer (`CONTRAT.md`, 2.1). Elle se teste sans navigateur ;
- `natif.js` : la seule porte vers les morceaux Swift (trousseau, feuilles de connexion, message, appareil, numéro de fabrication). Dans Chromium, pendant les tests, un faux module la remplace ;
- `textes.js` : tous les mots fixes, avec la marque `A_ECRIRE` ;
- les écrans, par lot ;
- `index.html`, avec sa règle stricte de chargement : seule l'adresse du serveur est permise pour les échanges.

**Les morceaux Swift**, un seul module à nous, environ 300 lignes en tout :
- le trousseau : lire, écrire, effacer le jeton de session, accessible seulement quand l'iPhone a été déverrouillé une fois depuis son démarrage ;
- la feuille d'Apple : demander un jeton signé avec un nonce, sans nom ni adresse ; à « Tout effacer », demander un code d'autorisation ;
- la feuille du système (ASWebAuthenticationSession) : ouvrir une adresse, rendre l'adresse de retour `elenchos://…` ;
- l'appareil : iPhone, ou iPad et Mac ; le numéro de fabrication.

Le message de 18h passe par le module officiel de Capacitor (accord d'iOS, jeton d'appareil, toucher sur un message). Les liens universels et le retour au premier plan passent par le module officiel du cycle de vie.

**L'extension de réception** (Notification Service Extension, environ 40 lignes de Swift) : à chaque message, elle envoie `POST /api/recu { envoi }`, sans session, puis laisse le message s'afficher tel quel. C'est la mesure « message reçu » (plan, 2.2). Coût estimé : un jour.

**Les pages web, servies par le serveur** (`CONTRAT.md`, 2.14) : la page publique, la page de confidentialité, la page d'invitation, le fichier d'association avec l'application, le retour de Google. Ce sont des pages fixes, en HTML écrit à la main, avec un seul petit script pour la page d'invitation (reconnaître l'appareil, compter). Pas de cookie, rien chargé d'ailleurs.

### 1.4 Le serveur calcule, l'application montre

C'est la règle 1.1 du contrat. Trois conséquences techniques :
- **Le moteur de règles est une bibliothèque pure côté serveur** (`src/regles/`) : pas de base, pas d'horloge, pas de hasard caché. Le tirage passe par une fonction `t(clé)` qui donne le même résultat quel que soit qui la déclenche, avec un secret du serveur pour graine. Les numéros des cartes ne se calculent donc pas d'avance (P-26). Le moteur se teste seul, sur les dix journées chiffrées de `regles.md`, qui deviennent des tests.
- **Le moteur porte tout le jeu** : cartes (R3, R4), verdicts et jumeaux, points, avis du cercle, titres, surprise de la semaine, curseurs, Pas de Côté, Sans-Faute, tempéraments, phrases du jour et de la semaine, barre, R8, pause et sommeil, départs (règle 4), texte corrigé (règle 20).
- **Deux portraits par joueur, d'une même fonction** : le portrait entier (Moi, la phrase de la semaine, Le Pas de Côté), et le portrait vu par le cercle, calculé sur les seules réponses révélées (règle 19, P-27 a). Ce second calcul sert aussi au choix des cartes (R3) et aux tempéraments vus par le cercle (`CONTRAT.md`, partie 8). Un test vérifie, réponses inversées, que le second ne dépend d'aucune réponse pas encore révélée.

Les phrases qui dépendent des données sont faites dans un seul module du serveur, avec la typographie de l'essai (`typographier`). Les mots fixes restent dans `textes.js`.

### 1.5 La base

37 tables, chacune sur la carte des données du code (`src/base/carte.ts`), qu'un test compare à la base réelle, colonne par colonne. Parmi elles : joueurs, empreintes d'identité, accords, sessions, abonnements, cercles, membres (ordre et date d'arrivée, rond), liens, réponses (chiffrées), manches, cartes (le brouillon de Deviner est la carte avant Valider ; le « pourquoi » chiffré lui aussi ; la marque « vidée par un départ »), éveil des cercles, comptes de la semaine, titres et badges, tempéraments, lecture du dimanche (une ligne par joueur), étape vue de la révélation, textes importés, connexions en cours, codes de retour, refus des mesures, totaux des mesures et leur verrou des joueurs distincts, journal des effacements, tâche du jour du ménage (migration 0004, étape 1, travail D), mémoire des migrations. Ce qui change depuis la phase 0 :
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

Les migrations sont des fichiers SQL numérotés (`src/base/migrations/`), joués au démarrage sous le rôle propriétaire, et seulement par lui. Une migration jouée ne se modifie plus ; tant qu'aucune base réelle n'existe, 0001 à 0004 peuvent encore être réécrites (`src/base/LISEZMOI.md`).

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

**À vérifier au début de l'étape 1 : Scalingo permet-il de créer des rôles ?** De mémoire, oui, mais ce n'est pas vérifié. Le code est écrit pour fonctionner dans les deux cas, avec un seul réglage.

**Le repli, si les rôles sont impossibles.** Tous les modules se connectent sous le rôle propriétaire, et chaque table reçoit `FORCE ROW LEVEL SECURITY` : les règles de cloisonnement s'appliquent aussi au propriétaire. Chaque connexion déclare son module à l'ouverture (`elenchos.module`), et les mêmes règles par ligne regardent ce module. Ce qui tient encore, contre l'oubli : le cloisonnement des cercles (P-25) **et** la séparation des modules (P-01, P-22, P-23), testés dans les deux modes. **Ce qui est perdu, dit franchement** : les droits par colonne (le jeu pourrait écrire par erreur une colonne que la règle de sa ligne lui laisse) ; et la protection contre un code fautif, qui changerait lui-même son module déclaré ou lèverait les règles d'une commande. Si le propriétaire échappe aux règles (superutilisateur), l'installation refuse le repli. Il faudrait alors le signaler au porteur. Le détail : `src/base/LISEZMOI.md`.

### 1.7 Secrets, clés, empreintes, chiffrement

- **Un secret de session** (`SECRET_SESSION`, 32 octets, saisi par le porteur chez Scalingo, jamais dans le dépôt). On en tire des clés distinctes : empreintes des jetons et des codes, tirage. C'est le module `crypto.ts` du test de 18h. Le changer déconnecte tout le monde, sans perdre aucun compte.
- **Une clé des identités** (`CLE_IDENTITES`, 32 octets, saisie chez Scalingo, gardée hors ligne par le porteur comme `CLE_REPONSES`). Les empreintes d'identité (identifiant Apple ou Google, adresse e-mail) en dérivent, et d'elle seule : c'est elle qui retrouve un compte. **Elle ne se change jamais pendant le test** : la changer rendrait tous les comptes introuvables. Sans elle, le serveur refuse de démarrer ; les trois clés doivent être distinctes (`config.ts`).
- **Des empreintes avec clé (HMAC)**, jamais la valeur : identifiant Apple ou Google, adresse e-mail, jetons de session, jetons de lien, codes à six chiffres, codes de retour de Google, vérificateurs de connexion.
- **L'adresse e-mail n'est jamais gardée**, ni en clair ni chiffrée ; seule son empreinte reste.
- **Les réponses sont chiffrées** par le programme avant la base (P-02), avec une clé réglée chez Scalingo (`CLE_REPONSES`), dont le porteur garde une copie hors ligne. Le « pourquoi » posé sur la carte « qui et pourquoi » l'est aussi, avec la même clé : avec le verdict « juste et raison », il dirait sinon en clair la raison de l'auteur. Ce qui reste en clair et dit quelque chose des réponses (verdicts, Pas de Côté, tempéraments…) est listé en tête de `src/base/carte.ts`.
- **Les clés d'Apple**, créées par le porteur dans son compte Apple, réglées chez Scalingo ou dans les secrets de GitHub, jamais dans le dépôt, avec une copie hors ligne chez lui :
  - la clé des messages (`.p8`) : `APPLE_CLE_MESSAGES` et son identifiant `APPLE_ID_CLE_MESSAGES`, avec l'identifiant d'équipe `APPLE_ID_EQUIPE` ; le service d'Apple, production par défaut, ou `APPLE_SERVICE_MESSAGES=essai` ;
  - la clé « Se connecter avec Apple », pour révoquer à l'effacement (étape 2) : `APPLE_CLE_CONNEXION` et `APPLE_ID_CLE_CONNEXION` (la même clé peut servir aux deux, de mémoire, à vérifier : le porteur colle alors la même deux fois) ;
  - la clé d'accès à App Store Connect, pour la fabrication (1.15), dans les secrets de GitHub seulement.
- **L'identifiant de l'application** (`APPLE_ID_APPLICATION`, proposé par Front-end) n'est pas un secret, mais un réglage aussi, jamais écrit dans le code du serveur : c'est l'audience du jeton de connexion et le sujet des messages. La connexion Apple n'a besoin que de lui (et des clés publiques d'Apple).
- **Chaque réglage d'Apple manquant coupe sa seule fonction**, et il est signalé par son nom au démarrage (`config.ts`) : sans l'identifiant de l'application, ni connexion ni message ; sans la clé des messages ou l'équipe, pas de message (`Etat.message.disponible` faux) ; sans la clé de connexion, pas de révocation.

### 1.8 Les sessions

- **Une session est un jeton** de 32 octets tirés au hasard. L'application le range dans le trousseau et l'envoie dans l'en-tête `Authorization: Bearer …`. La base n'en garde que l'empreinte, avec le joueur, l'appareil (un numéro sans lien avec l'iPhone) et une échéance.
- **Pourquoi plus de cookie** : dans l'application, la page (`capacitor://localhost`) et le serveur n'ont pas la même adresse, et iOS y bloque les cookies d'un autre site (de mémoire, plan 2.3). Un jeton dans un en-tête marche partout, et supprime d'un coup le risque qu'une page d'un autre site agisse au nom du joueur.
- **Une table plutôt qu'un jeton seulement scellé**, parce que P-41 demande que la session s'arrête à la déconnexion : sans table, un jeton copié resterait valable jusqu'à son terme.
- **Chaque appareil a la sienne**, et l'abonnement au message est lié à elle. Une session de compte vaut 30 jours ; l'échéance est prolongée à chaque ouverture (`GET /api/etat`), au plus une fois par jour pour qu'une lecture rejouée ne change rien, **jamais au-delà de la fin du test**, minuit, heure de Paris, à la fin du jour `FIN_DU_TEST` (D-061, point 2) : en ligne, le serveur refuse de démarrer sans `FIN_DU_TEST`. « Tout effacer » les supprime toutes (P-38).
- **Le joueur provisoire** a son propre jeton, rendu par l'accord, 7 jours au plus. À la connexion, le jeton du compte le remplace dans le trousseau.
- **CORS**, puisque la page et le serveur n'ont pas la même adresse. Le serveur répond aux demandes préalables du navigateur intégré pour la seule origine `capacitor://localhost`, les méthodes `GET` et `POST`, et les en-têtes `Authorization`, `Content-Type` et `Elenchos-Fabrication` (gardées 10 minutes par WebKit). Pas d'identifiants de navigateur : il n'y a pas de cookie. Une demande `/api/` sans origine n'est acceptée que sur `POST /api/recu` (`CONTRAT.md`, 1.7).

### 1.9 L'horloge, et le développement local

- **Une seule horloge** pour tout le serveur (`horloge.ts`, repris du test de 18h), réglable par les tests, et **une seule source pour l'heure de Paris** : le moteur (`src/regles/heure.ts`), que l'horloge appelle pour le jour de jeu, les changements d'heure et le jour de la semaine (0 = lundi). Le jour de jeu porte le nom du jour où il finit (`regles.md`, section 2).
- **La base juge aussi « avant ou après 18h »** pour les réponses du jour et les départs : l'heure déclarée par le serveur dans chaque transaction, sinon la sienne (`instant_du_jeu`, `fin_du_jour_de_jeu`, migration 0002). Un test compare chaque 18h de 2026 à 2028 entre la base et le moteur.
- **L'horloge accélérée et la connexion d'essai par code n'existent qu'en local** (`CONTRAT.md`, partie 5). Le serveur refuse de démarrer si leurs réglages sont présents chez Scalingo ou sur GitHub.
- **La garde des horaires de mise en ligne** (D-043, D-054) est reprise telle quelle, et étendue à la fabrication de l'application (1.15).
- **En local**, l'interface tourne dans Chromium, servie par un petit serveur de fichiers de développement, avec le faux module natif. C'est ainsi que se font les tests de bout en bout et les captures.

### 1.10 La version minimale

- L'application envoie son **numéro de fabrication** dans l'en-tête `Elenchos-Fabrication`. Le serveur annonce `fabricationMinimale` dans chaque enveloppe, et répond `mise_a_jour_requise` en dessous (`CONTRAT.md`, 1.7).
- Le numéro minimal est un réglage du serveur. Il ne monte que quand le contrat change d'une façon que l'ancienne fabrication ne comprend pas. Ajouter un champ que l'ancienne fabrication ignore ne le fait pas monter.
- Le numéro de version reste « 1.0 » pendant tout le test : Apple ne relit en entier que la première fabrication d'une version (plan, 2.1, vérifié). Le numéro de fabrication est celui de l'exécution sur GitHub, qui ne fait que monter.
- **Les fabrications expirent au bout de 90 jours** dans TestFlight : une nouvelle fabrication part donc au moins tous les deux mois, même sans correction.

### 1.11 Les tests et le contrôle

- **`node --test`**, en quatre groupes, comme le test de 18h : sans base (aussi joués chez Scalingo à l'installation), avec base, navigateur (un vrai Chromium), journal de PostgreSQL.
- **Les quatre outils de `donnees.md`** (partie 2) : le traceur, les réponses inversées, l'horloge simulée, le relevé du réseau.
- **Les dix journées de `regles.md`** : le moteur doit retrouver exactement leurs résultats.
- **Le moteur de l'essai 2 sert de référence** : on compare les deux moteurs sur des milliers de manches tirées au hasard, pour les fonctions communes (2.2).
- **Une passe WebKit** sur une machine macOS de GitHub, reprise de l'essai 2.
- **L'application dans le simulateur d'iPhone** des machines de GitHub : elle s'ouvre, montre ses premiers écrans contre un serveur de test, et fait des captures. Le message, les vraies connexions, le trousseau et les liens universels ne se prouvent que sur l'iPhone du porteur.
- **`npm run controle`** : les types du serveur, les types de l'interface, la recherche de secrets, l'absence de `A_ECRIRE`, les contrôles du fichier des textes (`FORMAT.md`, partie 7), la garde des horaires, l'adresse du serveur fixée dans l'application. Il tourne avant toute mise en ligne et avant toute fabrication.

### 1.12 L'arborescence

```
jeu/
  CONTRAT.md, DECISIONS-TECHNIQUES.md     ce travail
  package.json, Procfile, tsconfig.json   étape 1
  capacitor.config.json                   la coquille (dossier de l'interface : public/)
  ios/                                    le projet iOS que Capacitor fabrique, avec nos morceaux Swift et l'extension
  src/                                    serveur (TypeScript) ; contrat.ts ; regles/, le moteur ; serveur/ ; base/
  src/base/migrations/                    SQL numérotés
  public/                                 l'interface embarquée (JavaScript, JSDoc), polices, styles
  pages/                                  les pages web du serveur (N1, confidentialité, invitation)
  textes/                                 FORMAT.md, exemple.json, puis le lot de Contenu
  outils/                                 contrôle, garde des horaires, migrations, table des lettres qui imitent les
                                          nôtres ; plus tard : liens de créateur et de relecture, cercle de
                                          démonstration, proches simulés
  tests/                                  regles/ (le moteur), socle/ (serveur sans base, et base : exigent un
                                          PostgreSQL jetable) ; plus tard : navigateur/, journal-base/
```

### 1.13 Le message de 18h, par Apple

- **Le serveur s'adresse directement au service d'Apple** (APNs), en HTTP/2, avec un jeton signé par la clé `.p8` du porteur (ES256). Le jeton se renouvelle environ toutes les 40 minutes : Apple refuse un jeton de plus d'une heure, et un renouvellement trop fréquent.
- **Le service de production**, que les fabrications TestFlight utilisent (de mémoire, à vérifier dès l'étape 1). Un réglage (`APPLE_SERVICE_MESSAGES=essai`) passe au service d'essai sans nouvelle fabrication, s'il le faut. En local, aucun message ne part.
- **Ce qu'on reprend de `test-18h/`** : le planificateur, adapté. Un envoi par jour vers chaque abonnement actif, un verrou « un envoi par jour et par abonnement », un rattrapage jusqu'à 18h30, et le texte choisi parmi les six de `MESSAGES_18H` (E1). À l'étape 1, sans jeu, le texte est « 18h. La question d'aujourd'hui t'attend. » (`rienNAttendEncore`, que l'étape 2 remplace).
- **Fait à l'étape 1 (travail D)** : `src/serveur/apns.ts` (HTTP/2, `node:http2` ; le jeton ES256 refait au bout de 40 minutes ; durée de vie du message 30 minutes ; priorité immédiate), `src/serveur/planificateur.ts` (le message et le ménage), `src/serveur/routes.ts` (`POST /api/abonnement`, `POST /api/recu`). Deux abonnements au même jeton d'appareil ne font partir qu'un message. « Message envoyé » se compte quand Apple accepte (D-066, point 4).
- **Le contenu** est `MessageApns` (`contrat.ts`) : un titre, un texte, `mutable-content` pour que l'extension signale la réception, et le numéro d'envoi tiré au hasard. **Apple peut le lire** : il ne contient rien de personnel, sauf le pseudo de l'annonce d'arrivée (P-05 ; `CONTRAT.md`, 2.13).
- **Un abonnement refusé par Apple** (application désinstallée, jeton périmé : 410) est retiré. Un 400 « BadDeviceToken » ne retire rien : il viendrait aussi d'un service d'Apple mal réglé (production contre essai), et effacerait alors tous les abonnements.
- **Couper le message** dans les Réglages (D-029) arrête l'envoi pour tous les appareils du joueur.

### 1.14 La connexion

- **Apple, en natif** : la feuille d'Apple rend un jeton signé. Le serveur vérifie la signature avec les clés publiques d'Apple, l'émetteur, l'application visée, l'échéance, le nonce qu'il a lui-même donné, et le vérificateur (`CONTRAT.md`, 2.5). On ne demande que l'identifiant (D-061).
- **Google, par la feuille du système** : Google interdit sa connexion dans une page intégrée à une application. La feuille ouvre le parcours déjà écrit dans `connexion.ts`, avec un retour par formulaire (`response_mode=form_post`), un code de retour d'une minute après « # », et le vérificateur. Aucune bibliothèque de Google dans l'application. Chez Google, l'écran d'accord est publié « en production » avec la seule demande d'identifiant (de mémoire, plan 2.3).
- **Le vérificateur** : l'application tire 32 octets, envoie leur empreinte au début, et les octets eux-mêmes à la fin. Un jeton d'Apple ou un code de retour volé ne sert donc à rien sans la mémoire de l'application qui a commencé. Le calcul exact est celui de PKCE « S256 » : vérificateur en base64url (43 caractères), défi = base64url(SHA-256(ces 43 caractères)) (`CONTRAT.md`, 2.5).
- **Fait à l'étape 1 (travail D)** : `src/serveur/apple.ts` (le jeton : RS256 avec les clés publiques d'Apple, gardées en mémoire et relues au plus une fois par minute pour une clé inconnue ; émetteur, audience, échéance ; nonce et identifiant présents), `src/serveur/connexion.ts` (le nonce donné, la connexion consommée une fois, le vérificateur, le compte retrouvé ou celui d'un créateur créé ; l'identité gardée en empreinte avec `CLE_IDENTITES`), `src/serveur/sessions.ts`. Le compte d'un invité, la fusion d'un joueur provisoire dans un compte retrouvé, Google et la révocation viennent à l'étape 2 (`CONTRAT.md`, partie 9).
- **Le compte du porteur à l'étape 1** (arbitrage de l'équipe, renversable ; `CONTRAT.md`, 2.5) : le contrat ne crée un compte qu'au bout du défi, qui vient à l'étape 2. Le réglage `COMPTE_PORTEUR` (un pseudo) laisse la première connexion Apple ouvrir le compte du porteur, tant qu'aucun compte n'existe dans la base, et seulement alors. Il touche la lettre de D-006 pour ce seul compte.
- **E-mail** : inchangé (Scaleway), allumé à l'étape 4 avec le domaine.
- **La révocation chez Apple à « Tout effacer »** (arbitrage de l'équipe, plan de D-064 ; un jour de travail) :
  - la feuille d'Apple, montrée à la confirmation, rend un code d'autorisation neuf ;
  - le serveur efface d'abord tout, en une transaction ;
  - puis il échange le code chez Apple, avec un secret signé par la clé « Se connecter avec Apple », demande la révocation du jeton obtenu, et ne garde rien.

  Un échec chez Apple ne bloque jamais l'effacement : `revoque` vaut faux, et N14 dit comment le retirer soi-même.
- **Google** : coupé de notre côté seulement, comme D-061 l'avait arrêté. Le révoquer chez Google demanderait de garder son jeton, ou de faire repasser le joueur par Google.
- **Les règles d'Apple** : effacer son compte dans l'application (5.1.1 (v)), c'est « Tout effacer » ; Google étant proposé, une connexion qui protège la vie privée doit l'être aussi (4.8), c'est Apple.

### 1.15 Fabriquer et distribuer l'application

- **Sur les machines macOS de GitHub**, gratuites pour un dépôt public (vérifié, plan 2.5) : Capacitor recopie l'interface, Xcode fabrique et signe automatiquement avec la clé d'accès d'App Store Connect, puis envoie la fabrication à App Store Connect. Environ 15 à 20 minutes, puis le traitement d'Apple.
- **Seulement depuis la branche `mise-en-ligne`**, après le feu vert écrit du porteur la veille (D-054).
- **Jamais de 15h à 19h, ni le dimanche** (D-043, D-054) : une fabrication proposée aux testeurs à 17h55 présente le même risque qu'une mise en ligne du serveur.
  - La fabrication refuse de démarrer après 14h et le dimanche (proposé : une heure de marge pour le traitement d'Apple).
  - Elle n'est ajoutée au groupe des testeurs qu'avant 15h ; sinon, le lendemain matin.
- **À vérifier au tout début de l'étape 1** : l'accès à la clé d'App Store Connect pour un compte individuel (plan, 2.5). Premier repli : une clé personnelle et un certificat créé depuis le site d'Apple. Dernier recours, présenté au porteur avec son montant avant toute dépense (D-063) : un Mac loué pour une journée.
- **Les testeurs** : le porteur, testeur interne dès l'étape 1, sans relecture ; ses amis, testeurs externes, par le lien public, après la relecture d'Apple (plan de D-064).

### 1.16 Le cercle de démonstration, pour le relecteur d'Apple

- **Un outil du serveur**, geste du porteur, fabrique le lien de relecture : plusieurs usages, 30 jours. **Chaque ouverture du lien crée un cercle de démonstration neuf**, marqué « démonstration », aux quatre membres inventés, sans compte ni identité, avec leurs réponses d'entrée inventées : deux relecteurs ne partagent jamais un cercle (`donnees.md`, P-19 a ; arbitrage de l'équipe du 16 octobre 2026, qui retient cette version, plus sûre, au lieu d'un seul cercle partagé). Le cercle naît à la première réponse enregistrée, puisqu'ouvrir un lien n'écrit rien (P-29). C'est une **exception à D-006 (arbitrage 3, lien à usage unique) et à P-29**, arbitrée par l'équipe et bornée aux cercles inventés (D-065, point 3).
- **Un module du serveur** fait répondre ces membres chaque jour, avant 17h, par un tirage fixe sur les positions et les raisons du texte du jour. Il ne voit que les cercles marqués ; la marque ne se pose que par l'outil et par ce lien.
- **Les mesures** excluent les cercles marqués.
- **Après la relecture**, l'outil efface le compte du relecteur comme « Tout effacer ».
- Il mêle des données inventées à la base réelle : c'est une exception écrite au principe de P-19 (une base est « inventée » ou « réelle » ; P-19 et P-20, allégés pour le test avec D-060), bornée à ces cercles (`CONTRAT.md`, partie 8) ; `donnees.md` l'écrit désormais (P-19 a).

## 2. Ce qui est repris

### 2.1 Du test de 18h (`test-18h/`)

D'après le plan (2.2), complété :

| Sort | Fichiers | Ce qui change |
|---|---|---|
| Tel quel | `garde-horaires.ts` et son outil, `crypto.ts`, `journal.ts` (avec les listes fermées des routes du contrat), le chiffrement de `base.ts`, le contrôle du code, la vérification GitHub, le `Procfile`, leurs tests sans base et le test du journal de PostgreSQL | les listes de `journal.ts`, vérifiées contre le contrat à la compilation ; dans `crypto.ts`, le « pourquoi » chiffré et la clé des identités |
| Adapté | `horloge.ts` | l'heure de Paris vient du moteur (`src/regles/heure.ts`), seule source ; le jour de jeu porte le nom du jour où il finit |
| Adapté (fait, étape 1) | `planificateur.ts` | un envoi par jour vers chaque abonnement actif, verrou par abonnement, rattrapage jusqu'à 18h30 ; les six textes de `MESSAGES_18H` choisis selon ce qui attend chaque joueur ; et le ménage quotidien. L'annonce d'arrivée vient avec le compte d'un invité (étape 2) |
| Adapté (en partie, étape 1) | `connexion.ts` | Apple natif (fait : `apple.ts`, `connexion.ts`) ; créer ou retrouver le compte (fait pour « J'ai déjà un compte » et le créateur ; l'invité et la fusion à l'étape 2) ; Google par la feuille du système, avec retour par formulaire et code de retour, et le refus d'un compte Google d'organisation (P-41) : étape 2 |
| Adapté (fait, étape 1) | `serveur.ts`, `principal.ts` | jetons au lieu des cookies (`sessions.ts`), CORS limité à l'application, version minimale, limiteur par session ; en-têtes de sécurité et « rien dans les adresses » gardés ; routeur typé contre `Routes` (`routeur.ts`) |
| Adapté (fait, étape 1) | `config.ts` | nouveaux réglages (clés d'Apple séparées par fonction, version minimale, compte du porteur) ; les réglages dangereux refusés en ligne |
| Adapté (fait, étape 1) | `mesure.ts` | devenu `mesures.ts` : « le soir même » (proposé) ; la mesure « message reçu » est comptée par `POST /api/recu` (`routes.ts`) |
| Remplacé (fait, étape 1) | `push/chiffrement.ts`, `push/envoyeur.ts`, `push/services.ts` | un envoyeur vers Apple d'environ 150 lignes (`apns.ts`, 1.13) |
| Retiré | `public/sw.js`, la logique de `public/app.js` (`depuisIcone`, `messagesPossibles`) | sans objet dans une application |
| Non repris | `pages.ts`, `depot.ts`, la page de résultats, `/preparer` tel quel | le principe de `effacer.ts` (vider, puis vérifier que c'est vide) sert à « Tout effacer » |

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

## 5. Limites et doutes

- **De mémoire, à vérifier au début de l'étape 1** :
  - la création de rôles chez Scalingo ;
  - le plancher d'iOS de Capacitor ;
  - le service de production d'Apple pour TestFlight ;
  - le blocage des cookies dans l'application ;
  - le « # » transmis par un lien universel ;
  - le retour de Google par formulaire dans la feuille du système ;
  - la clé « Se connecter avec Apple » nécessaire à la révocation ;
  - l'accès à la clé d'App Store Connect pour un compte individuel.
- **Sans Mac, un défaut qui n'apparaît que sur un vrai iPhone est plus long à comprendre** : l'inspecteur de Safari demande un Mac. Parade : l'application signale ses erreurs au serveur, sans aucun contenu de joueur ; si l'on reste bloqué, un Mac loué une journée, présenté d'abord au porteur avec son montant (D-063).
- **Les premiers morceaux natifs du projet** : nos durées sont des estimations, sans mesure sur ce type de travail.
- **Seuls des modèles relisent ce code**, qui gardera des opinions (D-043, point 2) ; aucun avocat (D-056).
- **À observer avec de vraies personnes** : combien d'invités vont au bout des gestes de TestFlight ; si le message arrive sur des iPhone plus anciens que celui du porteur ; si la feuille de Google est comprise ; combien d'invités s'arrêtent entre le défi et le compte (ce que l'option B garde 7 jours).
