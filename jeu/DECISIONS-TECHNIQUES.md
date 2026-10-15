# Les choix techniques de la phase 0 (version de test)

*Phase 0 de la construction (D-060). Back-end et Front-end, ensemble, 15 octobre 2026. Ce document arrête les choix techniques que D-048 laisse à l'équipe, pour la seule version de test (D-056). Il ne décide rien de ce qui revient au porteur. La question de la phase 0, où garder les trois réponses d'entrée d'un invité avant son compte, est tranchée par l'équipe (partie 3). Relu par Cohérence et le Vérificateur ; leurs corrections et les arbitrages de l'orchestrateur sont appliqués (15 octobre 2026). Le contrat est dans `jeu/CONTRAT.md`, ses types dans `jeu/src/contrat.ts`, le format des textes dans `jeu/textes/FORMAT.md`.*

## En bref

- **Rien de neuf à installer** : Node 22, TypeScript lu tel quel, PostgreSQL, deux bibliothèques (`pg`, `oauth4webapi`). C'est la pile du test de 18h, déjà relue et testée (82 tests).
- **Sans cadriciel, une seule page.** L'interface est faite de modules JavaScript que Safari lit tels quels, typés par des commentaires. Il n'y a rien à fabriquer, donc rien qui puisse casser chez Scalingo, et un humain peut tout relire sans outil (D-043).
- **Le cloisonnement des cercles est tenu par la base elle-même**, avec des rôles séparés. Si Scalingo ne permet pas de créer des rôles, un repli existe ; il protège moins, et nous disons de combien (partie 1.6).
- **On reprend beaucoup.** Du test de 18h : l'horloge, la connexion, l'envoi du message, la sécurité des pages. Du second essai : les styles, les polices, une partie des écrans, une partie du moteur de règles (partie 2).
- **Les réponses d'entrée de l'invité : tranché par l'équipe, un joueur provisoire en base dès l'accord, effacé à 7 jours** (option B), avec deux conditions prises à Juridique : un lien « Effacer mes réponses » sur l'écran du compte, et la phrase des 7 jours dans « Qui, durée, droits ». Juridique préférait garder les réponses dans le téléphone ; l'équipe retient le joueur provisoire, pour la solidité, avec un lien d'effacement avant le compte (partie 3).

## 1. Les choix arrêtés

### 1.1 La pile

| Élément | Choix | Pourquoi |
|---|---|---|
| Serveur | Node 22 (22.22.0, comme le test de 18h), un seul processus, le module `node:http`, sans cadre web | Déjà en place et testé ; rien à apprendre pour un humain qui reprendrait le code |
| Langage du serveur | TypeScript exécuté tel quel par Node, qui efface les types (`erasableSyntaxOnly`) : ni fabrication, ni fichier produit | Ce qui est lu est ce qui tourne |
| Base | PostgreSQL de Scalingo (D-048), via `pg` | Choix déjà fait ; les règles de cloisonnement par ligne existent dans PostgreSQL |
| Connexion Apple et Google | `oauth4webapi`, flux repris de `test-18h/src/connexion.ts` | Bibliothèque certifiée OpenID, sans dépendance ; déjà relue |
| E-mails du code | L'envoi d'e-mails de Scaleway, par son interface web, coupé tant qu'il n'y a pas de domaine (D-060, point 2) | Prestataire français (D-043), 0 € pour le test |
| Interface | Modules JavaScript, `// @ts-check`, types en JSDoc vérifiés par `tsc` | Partie 1.2 |
| Outils de développement | `typescript`, `@types/node`, `@types/pg`, `playwright-core` | Ceux du test de 18h |

`jeu/` aura son propre `package.json`, de type module, et son `Procfile` ; Scalingo installera ce dossier (réglage `PROJECT_DIR=jeu`, comme `test-18h`). Les fichiers repris de `test-18h/` sont **copiés** dans `jeu/`, avec en tête leur origine. `test-18h/` reste intact, comme source de briques (D-060, point 3), et pourra être retiré sans rien casser.

### 1.2 L'interface sans cadriciel

Les quatre options de Front-end (`plan-version-test-frontend.md`, 1.2) :

| Option | En une ligne |
|---|---|
| **A. Sans cadriciel ni fabrication (retenue)** | Des modules que Safari 16.4 lit tels quels, typés par JSDoc et vérifiés par `tsc`. Le code de l'essai se reprend, sans dépendance de plus, sans étape de fabrication chez Scalingo. |
| B. Preact et htm, copiés dans le dépôt | Des composants plus déclaratifs, mais une dépendance à suivre, pour un gain faible sur une soixantaine d'écrans simples. |
| C. Svelte ou React, avec Vite | Plus d'outils, plus de dépendances, une fabrication chez Scalingo. Rien ne le justifie pour un test. |
| D. Pages faites par le serveur | Très robuste, mais chaque geste recharge la page dans l'icône. La révélation, une chose à la fois, devient laborieuse. |

Le principe de l'essai est gardé : à chaque changement, l'écran entier est redessiné à partir de l'état, avec `createElement` et `textContent`, jamais `innerHTML`.

### 1.3 Une seule page

- `GET /` sert la page ; tout le reste passe par les échanges du contrat.
- L'adresse ne change que pour porter un jeton après le « # » (lien, code de passage). La page le lit, puis l'efface de la barre d'adresse.
- L'interface tient en quelques modules (noms proposés) :
  - `client.js` : les échanges, l'enveloppe, la version, les erreurs ;
  - `ecran.js` : une fonction pure qui, de `Etat`, du contexte de l'appareil et du « # », tire l'écran à montrer (`CONTRAT.md`, 2.1). Elle se teste sans navigateur ;
  - `textes.js` : tous les mots fixes, avec la marque `A_ECRIRE` ;
  - les écrans, par lot (`plan-version-test-frontend.md`, 1.3) ;
  - `sw.js` : la réception du message, et la mise en cache des seuls fichiers de l'interface ;
  - le manifeste, sans adresse de départ (pour le code de passage, `CONTRAT.md`, partie 4).

### 1.4 Le serveur calcule, l'interface montre

C'est la règle 1.1 du contrat. Deux conséquences techniques :
- **Le moteur de règles est une bibliothèque pure côté serveur** : pas de base, pas d'horloge, pas de hasard caché. Le tirage passe par une fonction `t(clé)` qui donne le même résultat quel que soit qui la déclenche, avec un secret du serveur pour graine. Ainsi, les numéros des cartes ne se calculent pas d'avance (P-26). Le moteur se teste seul, sur les journées chiffrées de `regles.md`.
- **Les phrases qui dépendent des données** (phrase du jour, lignes du vote, auteurs, avis du cercle, message de 18h, annonce d'arrivée, dates écrites) sont faites dans un seul module du serveur, avec la typographie de l'essai (`typographier`). Les mots fixes restent dans `textes.js`.

### 1.5 La base

Une douzaine de tables (`plan-version-test-backend.md`, partie 2), plus une table des sessions (1.8). Trois règles, reprises du test de 18h pour tenir P-07 (Scalingo garde un an les journaux de la base) :
- toutes les écritures passent par `ON CONFLICT` : une contrainte qui échoue recopierait la ligne fautive dans le journal de la base ;
- les valeurs sont vérifiées par le programme avant d'arriver à la base ;
- le test du journal de PostgreSQL est étendu au jeu.

Les migrations sont des fichiers SQL numérotés, joués au démarrage sous le rôle propriétaire, et seulement par lui.

### 1.6 Les rôles de base, et le repli

**Le principe (P-25).** Chaque demande du téléphone ouvre une transaction et y déclare d'abord qui la fait : `SET LOCAL elenchos.joueur = '…'`. Chaque table du jeu porte une règle de cloisonnement par ligne (la « sécurité au niveau des lignes » de PostgreSQL) qui ne montre une ligne qu'aux membres de son cercle. **Si la déclaration est oubliée, la règle ne voit personne et la base ne rend rien.** Le joueur provisoire du défi est déclaré de la même façon ; une règle à part lui laisse lire les seules réponses d'entrée de son invitant, et seulement par l'invitation liée à lui (P-29).

**Les rôles** (comptes de connexion à la base, chacun avec ses droits) :

| Rôle | Ce qu'il peut | Exigence tenue par la base |
|---|---|---|
| `proprietaire` | créer les tables ; joué seulement par les migrations | — |
| `jeu` | lire et écrire les tables du jeu, soumis aux règles de cloisonnement ; écrire, sans les lire, dans les tables de totaux, où il dépose la justesse et la part des Mystère déjà totalisées ; aucun droit sur les identités | P-25, P-01, P-22 |
| `comptes` | lire et écrire les seules empreintes d'identité | P-01 |
| `envoi` | lire les abonnements, écrire les envois | P-22 |
| `menage` | effacer ce qui est échu (joueurs provisoires à 7 jours, scores d'entrée, codes, codes de passage, sessions) | P-31 |
| `mesures` | lire des vues de totaux, jamais une réponse | P-22, P-23 |

**À vérifier : Scalingo permet-il de créer des rôles ?** De mémoire, oui (Back-end), mais ce n'est pas vérifié. Le compte Scalingo ne s'ouvre qu'en phase 6 (D-060, point 1). En phase 1, on le cherche dans la documentation de Scalingo ; le code est écrit pour fonctionner dans les deux cas, avec un seul réglage.

**Le repli, si les rôles sont impossibles.** Tous les modules se connectent sous le rôle propriétaire, et chaque table reçoit `FORCE ROW LEVEL SECURITY` : les règles de cloisonnement s'appliquent aussi au propriétaire. Ce qui tient encore : le cloisonnement des cercles (P-25) ; une demande sans déclaration ne rend toujours rien. **Ce qui est perdu, dit franchement** : la séparation des identités (P-01) et des totaux (P-22, P-23) n'est plus tenue par la base, seulement par le code. Un test vérifie alors que seul le module des comptes touche à la table des identités ; mais un défaut du module du jeu pourrait la lire. Et le propriétaire peut lever les règles d'une commande : la protection vaut contre l'oubli, pas contre un code fautif.

### 1.7 Secrets, empreintes, chiffrement

- **Un secret de session** (`SECRET_SESSION`, 32 octets, saisi par le porteur chez Scalingo, jamais dans le dépôt) ; on en tire des clés distinctes : cookies, empreintes, tirage. C'est le module `crypto.ts` du test de 18h.
- **Des empreintes avec clé (HMAC)**, jamais la valeur : identifiant Apple ou Google, adresse e-mail, jetons de lien, codes à six chiffres, codes de passage.
- **L'adresse e-mail n'est jamais gardée**, ni en clair ni chiffrée ; seule son empreinte reste (`plan-version-test.md`, partie 1 ; plus strict que P-01 et P-02).
- **Les réponses sont chiffrées** par le programme avant la base (P-02), avec une clé réglée chez Scalingo, dont le porteur garde une copie hors ligne. Gardé, et retirable sur sa demande (D-060, signalé).

### 1.8 Les sessions

Une session est un numéro tiré au hasard, dans un cookie `__Host-session`. La base n'en garde que l'empreinte, avec le joueur et une échéance. Une table plutôt qu'un cookie seulement scellé, parce que P-41 demande que la session s'arrête à la déconnexion : sans table, un cookie copié resterait valable jusqu'à son terme. Chaque appareil a la sienne : se déconnecter dans Safari ne déconnecte pas l'icône. Durée proposée, alignée sur Juridique : l'échéance est prolongée à chaque ouverture, **jamais au-delà de la fin du test**. « Tout effacer » les supprime toutes (P-38). C'est une ligne à ajouter à la carte des données (`donnees.md`, partie 4), qui citait déjà « les sessions » parmi ce que « Tout effacer » efface ; à signaler au porteur. Ce que deviennent les comptes à la fin du test attend sa réponse (durées de garde, QCM en cours).

### 1.9 L'horloge, et le développement local

- **Une seule horloge** pour tout le serveur (`horloge.ts`, repris tel quel) : heure de Paris, changements d'heure compris, réglable par les tests.
- **L'horloge accélérée et la connexion d'essai par code n'existent qu'en local** (`CONTRAT.md`, partie 5). Le serveur refuse de démarrer si leurs réglages sont présents chez Scalingo ou sur GitHub, avec les marqueurs de `garde-horaires.ts`.
- **La garde des horaires de mise en ligne** (D-043, D-054) est reprise telle quelle : aucune installation de 15h à 19h ni le dimanche.

### 1.10 La version et le cache

Le serveur annonce sa version (`SOURCE_VERSION`, posée par Scalingo ; « local » sur nos machines) dans chaque réponse. Le service de réception garde les fichiers de l'interface sous cette version. Si la version reçue diffère, l'interface se recharge. Sans cela, une icône peut garder l'ancien code des jours après une mise en ligne.

### 1.11 Les tests et le contrôle

- **`node --test`**, en quatre groupes, comme le test de 18h : sans base (aussi joués chez Scalingo à l'installation), avec base, navigateur (un vrai Chromium), journal de PostgreSQL.
- **Les quatre outils de `donnees.md`** (partie 2) : le traceur, les réponses inversées, l'horloge simulée, le relevé du réseau.
- **Une passe WebKit** sur une machine macOS de GitHub, reprise de l'essai 2 : ce n'est pas Safari sur iPhone, mais le même moteur.
- **`npm run controle`** : les types du serveur, les types de l'interface (JSDoc), la recherche de secrets, l'absence de `A_ECRIRE`, les contrôles du fichier des textes (`FORMAT.md`, partie 7), la garde des horaires. Il tourne avant toute mise en ligne ; Scalingo attend son feu vert sur GitHub.

### 1.12 L'arborescence

```
jeu/
  CONTRAT.md, DECISIONS-TECHNIQUES.md     phase 0
  package.json, Procfile, tsconfig*.json  phase 1
  src/                                    serveur (TypeScript) ; contrat.ts dès la phase 0
  migrations/                             SQL numérotés
  public/                                 interface (JavaScript, JSDoc), polices, icônes, sw.js
  textes/                                 FORMAT.md, exemple.json, puis le lot de Contenu
  outils/                                 contrôle, garde des horaires, liens de créateur, proches simulés
  tests/                                  sans-base/, avec-base/, navigateur/, journal-base/
```

## 2. Ce qui est repris

### 2.1 Du test de 18h (`test-18h/`)

Tableau de Back-end (`plan-version-test-backend.md`, partie 1), complété par Front-end :

| Sort | Fichiers | Ce qui change |
|---|---|---|
| Tel quel | `horloge.ts`, `garde-horaires.ts` et son outil, `crypto.ts`, `push/chiffrement.ts`, `push/envoyeur.ts`, `push/services.ts`, le chiffrement de `base.ts`, le contrôle du code, la vérification GitHub, le `Procfile`, leurs tests sans base et le test du journal de PostgreSQL | rien |
| Adapté | `journal.ts` | listes fermées des routes et des événements du jeu (celles du contrat) |
| | `planificateur.ts` | un envoi par jour vers tous les abonnements ; verrou « un envoi par jour et par abonnement » ; les six textes de `MESSAGES_18H` ; l'annonce d'arrivée |
| | `connexion.ts` | créer le compte, le retrouver, refuser un compte Google d'organisation (P-41) ; porter le joueur provisoire dans la transaction |
| | `mesure.ts`, `public/sw.js` | la mesure « message reçu » reste ; un toucher ouvre la page, qui mène à la révélation |
| | `serveur.ts` | en-têtes, cookies `__Host-`, contrôle d'origine et « rien dans les adresses » gardés ; limiteur par session |
| | `config.ts` | nouveaux réglages ; les réglages dangereux refusés en ligne |
| | `public/app.js` (logique seulement) | `depuisIcone()`, `messagesPossibles()`, la demande d'autorisation lancée par le toucher, l'attente du service de réception limitée à 5 secondes |
| | `tests/navigateur/` | les vrais formulaires dans Chromium |
| Non repris | `pages.ts`, `depot.ts`, la page de résultats, `/preparer` tel quel, le reste de `public/` | le principe de `effacer.ts` (vider, puis vérifier que c'est vide) sert à « Tout effacer » |

### 2.2 Du second essai (`docs/essai/a-ne-pas-ouvrir-2/outillage/page/`, le code seulement)

| Sort | Ce qui est repris | Ce qui change |
|---|---|---|
| Gardé | `style.css`, partie « Téléphone : La Tablée » (environ 200 lignes sur 362) ; les polices réduites Alegreya et Alegreya Sans, avec leurs licences | l'écran occupe tout l'iPhone ; le cadre de l'essai est retiré ; l'avis du cercle devient une barre en cinq parts, d'une seule teinte |
| Gardé | le haut d'`interface.js` : les outils de page et les petits blocs (bandeaux, boutons, positions, raisons, visages, feuille, onglets) | ils lisent une réponse du serveur au lieu du socle, du moteur et du calendrier |
| Adapté | les écrans de l'entrée, Deviner, Répondre, la raison, En attendant, la révélation, l'avis du cercle (35 à 40 % d'`interface.js`) | la carte se montre d'un coup, sans retournement, sans total de points |
| Adapté | `textes.js` : les mots validés des écrans | N1 à N16, N18 et les mots d'UX de la phase 0 (`CONTRAT.md`, partie 11) ajoutés ; le cadre et la table des valeurs retirés. **L'agent qui le reprend vérifie d'abord qu'il ne contient aucun texte du lot de l'essai** (nous ne l'avons pas ouvert en phase 0) |
| Extrait | de `noyau.js` : `typographier`, `dePrenom`, `quePrenom`, `listeEt` ; la table des caractères qui se ressemblent (E7) | — |
| Porté en TypeScript, côté serveur | de `moteur.js` : le tirage `t(clé)` ; `identiques`, `estJuste`, `redistribuer` (le jumeau, D-024), `verdict` ; les points ; `avisCercle` ; `classer` ; Le Devin et Le Mystère | comparés au moteur de l'essai sur des milliers de manches tirées au hasard, pour les fonctions communes |
| Réécrit | le choix des cartes (au hasard, sans deux identiques, R4) ; la carte « qui et pourquoi » (tirée au sort, en dernier : règle 9, D-038) ; Le Fidèle (sans le nouveau venu de la semaine : règle 12) ; `phraseDuJour` (huit tensions, mots de D-053) | prouvés par les journées de `regles.md` |
| Repris | `harnais/navigateur.js` (appareil « iPhone 15 », mode app imposé, horloge, sombre, animations réduites) ; `harnais/passe-webkit.js` ; la détection du contexte de la page-test (`docs/essai/page-test-icone/source.html`) | — |
| Non repris | le socle, les sauts, le rattrapage, le carnet, le cadre, le dévoilement, le témoin, tout ce qui suppose le fichier scellé et des personnages simulés ; le portrait, les tempéraments, Le Pas de Côté, la phrase de la semaine (après le test, D-058) | — |

## 3. Les trois réponses d'entrée de l'invité : tranché par l'équipe (option B)

### 3.1 La question

Marie ouvre le lien de Thomas, accepte la carte, répond à trois textes et devine Thomas sur chacun. Puis elle crée son compte, ou s'en va. Entre la carte et le compte, ses trois réponses (position et raison) existent. Où ? La question vaut aussi pour le créateur, qui répond à ses trois textes avant son compte. `plan-version-test.md` (partie 4) la renvoie à l'équipe et à Juridique : ce n'est pas un choix pour le porteur. Ce qui suit est le compte rendu de l'examen et de la décision.

### 3.2 Les deux options

**Option A, de Front-end : les garder dans l'onglet jusqu'au compte.** Les réponses restent dans la mémoire de l'onglet (`sessionStorage`), qui survit au passage par Apple ou Google dans le même onglet. Elles partent d'un coup à la création du compte. But : la base ne garde rien d'un invité qui s'arrête en route.

**Option B, de Back-end : un joueur provisoire en base dès l'accord.** L'accord crée un joueur sans identité, avec un cookie `__Host-provisoire`. Chaque réponse est enregistrée, chiffrée (P-02). À la création du compte, ce joueur devient le compte, en une transaction. Sans compte, il est effacé au bout de 7 jours, et tout de suite si la personne se connecte à un compte qui existe déjà (N12).

**Ce que l'examen de l'option A a montré.** Pour tenir P-29 et P-34, le serveur doit de toute façon enregistrer des choses avant le compte, même dans l'option A :
- **l'accord** : P-34 veut un accord enregistré avant toute réponse. Or le serveur traite déjà la réponse à chaque texte : il en lit la raison pour montrer « Ta raison, … , était l'argument de … » (1.6), et il juge le pari. Traiter une opinion, même sans la garder, demande l'accord avant (RGPD, art. 9.2.a) ;
- **la liaison du lien** : P-29 veut un lien qui ne sert qu'une fois. S'il ne se liait qu'à la création du compte, un lien transféré montrerait les réponses de Thomas à plusieurs personnes pendant 7 jours. Il faut donc le lier dès la première réponse, à quelque chose qui reste côté serveur.

L'option A garde donc un accord et une liaison en base. Elle ne gagne que **les trois réponses d'une personne qui s'arrête avant le compte, pendant 7 jours au plus.**

### 3.3 Leurs effets

| | Option A : dans l'onglet | Option B : joueur provisoire (recommandée) |
|---|---|---|
| **P-29** (une seule personne, une fois) | Tenu, à condition de lier le lien à un jeton d'onglet enregistré en base à la première réponse | Tenu tel quel : la première réponse enregistrée lie le lien au joueur provisoire |
| **P-34** (accord enregistré avant toute réponse) | Le test de P-34 tient si l'accord est inséré en premier, dans la transaction qui crée le compte (condition 4 de Juridique) ; mais l'heure du toucher serait déclarée par le téléphone, preuve plus faible que l'heure du serveur. Seule la phrase « l'accord … suit l'invité » perd son objet | Tenu tel quel : la base refuse une réponse sans accord (clé étrangère) ; l'accord suit l'invité jusqu'à son compte, avec sa date d'origine, comme P-34 le propose |
| **P-35** (accord de l'invitant, avec l'invitation) | Inchangé | Inchangé |
| **D-006** (trois textes avant tout compte ; lien personnel à usage unique) | Tenu | Tenu : le joueur provisoire n'a ni identité, ni pseudo avant 1.8, ni adresse ; ce n'est pas un compte |
| **Minimisation** (RGPD, art. 5.1.c) | Meilleure : rien des réponses de qui s'arrête | Les réponses de qui s'arrête restent 7 jours au plus, chiffrées, lisibles de personne. Durée déjà inscrite sur la carte des données (`donnees.md`, partie 4 : « Réponses d'un invité qui ne crée pas de compte, 7 jours au plus », proposé par Juridique) et prévue dans « Qui, durée, droits » (`onboarding.md`) |
| **P-11** (le téléphone ne garde rien) | Le téléphone garde ses propres opinions plusieurs minutes, au-delà de « le temps de l'envoyer » | Rien dans le téléphone, sauf le cookie |
| **Solidité** | Fragile : pour lire le code reçu par e-mail, on quitte Safari pour Mail. Si l'iPhone manque de mémoire, il recharge l'onglet au retour, et la reprise de `sessionStorage` dans ce cas n'est pas garantie. Le défi serait alors perdu, et avec lui l'annonce à Thomas | Solide : la reprise se fait depuis la base, dans le même navigateur, pendant 7 jours |
| **Ce que le serveur peut prouver** | Les réponses arrivent après les révélations, envoyées par l'onglet : le serveur ne peut pas vérifier qu'elles ont été données avant de voir celles de Thomas | Chaque réponse est enregistrée avant la réponse de Thomas, dans le même échange que le pari (`CONTRAT.md`, 2.4) |
| **Code** | Deux chemins pour enregistrer une réponse (pendant le défi, puis en lot) | Un seul chemin, le même que pour le texte du jour |
| **Décisions touchées** | Une phrase de P-34 et P-29 (« à sa première réponse » deviendrait « à sa première devinette »), P-11, la ligne « 7 jours » de la carte des données, `onboarding.md` (proposés) ; et, dans la variante de Juridique (le serveur ne reçoit que les devinettes), une exception à la liste fermée (P-27), pour envoyer au téléphone les auteurs des quatre raisons | Aucune |

### 3.4 La décision de l'équipe : l'option B, avec deux conditions prises à Juridique

**Les positions.** Back-end et Front-end recommandaient l'option B (Front-end s'y est rangé à l'examen). Juridique recommandait l'option A : rien des réponses de qui s'arrête dans la base, ni dans les sauvegardes (près de cinq semaines en tout sous B), et « fermer l'onglet suffit » pour effacer. Cohérence relève que les sources déjà écrites supposent B (règle 2 de `regles.md`, `onboarding.md`, carte des données) ; le Vérificateur recommande B, en reprenant à Juridique ce qui ne coûte rien.

**La décision, telle qu'elle sera dite au porteur** : « Juridique préférait garder les réponses dans le téléphone ; l'équipe retient le joueur provisoire, pour la solidité, avec un lien d'effacement avant le compte. » Raison en une ligne : B tient P-29 et P-34 tels qu'ils sont écrits, à l'heure du serveur, sans écran de rattrapage ni second chemin d'enregistrement ; sa donnée en plus est bornée (7 jours), chiffrée, déjà sur la carte des données, et effaçable d'un toucher. C'est ce que demande D-056 (le plus simple), sans rien retirer à D-057 point 5 (accord explicite, effacement réel).

**Les conditions** :
1. **Rien avant l'accord.** Ouvrir le lien n'enregistre rien et ne pose aucun cookie (`CONTRAT.md`, 2.2).
2. **Le joueur provisoire ne garde que** : l'accord, les trois réponses chiffrées, la liaison du lien, le score du pari, et le pseudo dès qu'il est choisi à l'écran du compte (1.8 ; `CONTRAT.md`, 2.5). Ni identité, ni adresse, ni rien de l'appareil.
3. **Effacé au bout de 7 jours** par le ménage quotidien. **Effacé tout de suite** si la personne se connecte à un compte existant (N12). Personne n'en est averti, ni l'invitant, ni le cercle.
4. **Personne ne le voit** : il n'est membre d'aucun cercle, et la base le garantit par ses règles de cloisonnement (partie 1.6).
5. **« Qui, durée, droits » le dit** (condition prise à Juridique) : « Si tu t'arrêtes avant de créer ton compte, tes réponses sont effacées au bout de 7 jours. » (phrase d'UX, pour l'option B).
6. **Un lien « Effacer mes réponses » sur l'écran du compte (1.8)** (condition prise à Juridique) : il appelle `POST /api/tout-effacer`, accepté en session provisoire ; aucune route nouvelle. Le droit d'effacement existe ainsi avant le compte (RGPD, art. 12.2). Mots du lien et de sa confirmation : UX.

## 4. Ce que ces choix touchent (au titre de D-056)

- **Une décision du porteur est allégée pour le test, et n'avait pas été signalée avec D-060** : D-035 (règle 5 des six règles de Juridique, « la suppression du compte coupe le lien ») et P-38. « Tout effacer » coupe le lien avec Apple ou Google de notre côté seulement ; le révoquer chez eux obligerait à garder leurs jetons. N14 dit au joueur comment retirer Elenchos chez Apple ou Google (`CONTRAT.md`, 2.12). À ajouter à la liste des allègements signalés au porteur (D-056).
- **D-035 et P-03, précisés** : l'identifiant seul est demandé à Apple et à Google (moins que le plafond de D-035, avis de Juridique).
- Les autres décisions touchées par le contrat (D-011 pour le canal du message d'arrivée, D-006 pour le score d'entrée, D-045 point 2) sont listées dans `CONTRAT.md`, partie 8. La carte de consentement (N5) et les durées de garde du test sont en attente du porteur.
- **P-20 (proposé)** : la connexion d'essai devient locale seulement, faute d'aperçu en ligne avant la phase 6 (D-060, point 1).
- **La carte des données** (`donnees.md`, partie 4) reçoit une ligne : les sessions (empreinte, joueur, échéance ; prolongée à chaque ouverture, jamais au-delà de la fin du test, proposé). À signaler au porteur. Avec l'option B, aucune autre ligne ne change.
- **P-02** (chiffrement des réponses) : gardé, retirable, déjà signalé au porteur avec D-060.
- **P-13, P-19, P-20** : allégés pour le test, déjà signalés au porteur avec D-060.
- **Le repli des rôles** (partie 1.6), s'il est nécessaire, affaiblit P-01, P-22 et P-23 : la séparation n'y serait plus tenue que par le code. Il faudrait alors le signaler au porteur.

## 5. Limites et doutes

- **De mémoire, à vérifier** : la création de rôles chez Scalingo ; la reprise de `sessionStorage` après un rechargement de l'onglet par iOS (c'était l'un des arguments de la partie 3, dit comme un doute, pas comme un fait mesuré) ; la marque de domaine de Google sans la demande de l'e-mail (`CONTRAT.md`, partie 10) ; l'adresse de départ d'une icône sans adresse dans le manifeste (`CONTRAT.md`, partie 4).
- **Aucun vrai iPhone avant la phase 6** (D-060, point 1). Le moteur WebKit sur macOS n'est pas Safari sur iPhone.
- **Seuls des modèles relisent ce code**, qui gardera des opinions (D-043, point 2) ; aucun avocat (D-056).
- **À observer avec de vraies personnes** : combien d'invités s'arrêtent entre le défi et le compte (ce que l'option B garde 7 jours) ; combien touchent « Effacer mes réponses » ; combien reviennent finir leur compte plus tard ; si l'aller-retour vers Mail pour le code fait perdre des défis.
