# Le contrat entre le serveur et l'application (le jeu entier)

*Étape 1, travail A (D-064). Back-end et Front-end, ensemble, 16 octobre 2026. Ce document remplace la version de test de la phase 0 (D-060, 15 octobre 2026) : le cap est désormais le jeu entier, dans une application iPhone faite avec Capacitor, l'interface embarquée dans l'application, et testée par TestFlight (D-062). Les types exacts sont dans `jeu/src/contrat.ts` : en cas d'écart entre ce texte et les types, les types font foi, et l'écart est une faute à corriger ici. Le format des textes est dans `jeu/textes/FORMAT.md` ; les choix techniques, dans `jeu/DECISIONS-TECHNIQUES.md`. Les règles suivies sont celles de `docs/produit.md` et de `docs/etape-6/regles.md` ; ce que D-061 et D-063 décident reste. Tout ce document est proposé : il ne décide rien de ce que le porteur a tranché, et dit ce qu'il touche (partie 8). À relire par Cohérence puis par le Vérificateur ; les phrases de N6 et le message d'arrivée, aussi par Juridique.*

## En bref

- **Une application, et des échanges JSON.** L'interface vit dans l'application ; le serveur ne sert que des données. 51 routes sous `/api/` (dont `POST /api/recu`, réservée à l'extension qui signale la réception du message), deux routes `/dev/` qui n'existent qu'en développement local, et cinq navigations web (la page publique, la page de confidentialité, la page d'invitation, le fichier d'association avec l'application, le retour de Google). L'index écran par écran est en partie 7.
- **Le jeu entier est dans le contrat** : jusqu'à trois cercles par personne, le portrait et ses curseurs, l'écran d'un proche, les titres passés et « un ancien membre », les tempéraments, les badges rares, la surprise et la phrase de la semaine, la pause et le sommeil d'un cercle, quitter un cercle, le texte corrigé, les cartes les plus inattendues, la réponse en retard jusqu'à 18h10, la révélation rouverte là où on l'avait laissée.
- **Les règles du contrat ne changent pas** (partie 1) : le serveur calcule, l'application montre ; liste fermée (P-27) ; rien dans les adresses (P-08) ; rien avant 18h (P-26) ; les lectures ne changent rien. Une règle s'y ajoute, déjà écrite dans la règle 19 : ce qu'on reçoit d'un autre membre se calcule d'après ses seules réponses déjà révélées.
- **Ce qui change avec l'application** (partie 4) :
  - la session est un jeton gardé dans le trousseau de l'iPhone et envoyé dans un en-tête : plus de cookies ;
  - le message de 18h passe par Apple, sans intermédiaire : l'application envoie son jeton d'appareil ;
  - le serveur annonce une version minimale de l'application ; en dessous, un écran demande la mise à jour dans TestFlight ;
  - la connexion Apple est native ; celle de Google passe par la feuille du système, qui rend à l'application un code d'une minute placé après « # » ;
  - le code de passage vers l'icône et les gestes liés à l'icône disparaissent ;
  - une page web d'invitation, sur le domaine, ouvre l'application si elle est installée, et explique TestFlight sinon.
- **« Tout effacer » révoque aussi la connexion chez Apple** (arbitrage de l'équipe, `docs/etape-6/plan-jeu-entier.md`, « Ce que l'équipe a tranché seule ») : une feuille d'Apple se montre à la confirmation ; l'effacement se fait même si elle est fermée. Pour Google, l'allègement de D-061 reste.
- **Le relecteur d'Apple entre dans un cercle inventé**, par un lien de relecture, jamais dans un vrai cercle (2.16).
- **Décisions touchées, à dire au porteur** (partie 8) : il applique D-062, le plan sur lequel D-064 lance l'étape 1 (`docs/etape-6/plan-jeu-entier.md`) et les arbitrages de l'équipe de D-065 : un proche partagé sans réponse proposé dans une seule manche (troisième exception à D-011), un seul trio d'entrée pendant le test (suspension de `onboarding.md` et de la règle 15), un lien de relecture réutilisable pour Apple (exception à D-006 et à P-29), l'avis du cercle compté sur les membres présents à la fermeture du texte (règle 10 précisée). Sept lectures, tranchées par Game design ou par l'équipe. Et les quatre arbitrages de D-066 sur les données du test : Le Pas de Côté effacé au départ, la part de « aucune » et les trois comptes de mi-bêta non calculés, le refus des mesures, des mesures comptées au geste sur des joueurs distincts. Et D-067 : au départ d'un proche après 18h, le point reste, un « jumeau » devient « juste » et la révélation ne nomme plus le partant (partie 8).

## 1. Les règles du contrat

### 1.1 Le serveur calcule, l'application montre

Le serveur rend des données déjà calculées. Par exemple :
- **Marie a trouvé une réponse de Thomas sur trois.** L'application ne compare pas « 1 » à un seuil : le serveur envoie `forme: 'surprises'`, et l'application affiche « Thomas a réussi à te surprendre deux fois. » (E10).
- **Deux cartes identiques sont servies ensemble (R4).** L'application ne réattribue rien : chaque `CarteRevelee` arrive avec son `auteur` déjà réattribué et son verdict.
- **Marie est dans deux cercles.** L'application ne choisit ni l'ordre des manches, ni le proche servi une seule fois (R8) : `GET /api/aujourdhui` rend la manche à jouer, son cercle, son rang (« Amis · 2 sur 2 »).
- **À 18h, la révélation.** L'application ne range pas les étapes : le serveur rend `Revelation.etapes` dans l'ordre de D-011 et de la règle 10, cercle par cercle, puis les badges et, le dimanche, les titres.
- **Le portrait.** L'application ne calcule ni centre, ni largeur, ni netteté, ni l'ordre des curseurs (règle 19) : elle dessine `CurseurAffiche`.

Ce que fait l'application, et seulement cela :
- choisir l'écran à partir de `Etat`, de l'adresse reçue (un lien d'invitation, un retour de connexion) et de l'appareil (un iPad), partie 2.1 ;
- afficher, avec ses mots fixes ;
- l'arithmétique d'affichage : le compte à rebours, la largeur des cinq parts de l'avis du cercle à partir des comptes, le cran de la barre, la place d'un curseur à partir de ses millièmes ;
- garder en mémoire, le temps d'un écran, une position choisie mais pas encore envoyée ; et le vérificateur d'une connexion en cours (2.5).

### 1.2 Liste fermée (P-27)

Chaque type de `contrat.ts` contient les champs que l'écran montre, rien d'autre. Ce que le téléphone reçoit au sujet d'un autre membre se limite à la liste de P-27 :
- pseudo et rond ;
- curseurs et tempéraments, d'après ses seules réponses révélées (P-27 a) ;
- titres et badges ;
- « déjà joué » ;
- cartes révélées selon les règles ;
- ses surprises, sur l'écran d'un proche.

Jamais : l'adresse, la voie de connexion, la barre du portrait (D-026), la pause (D-010, D-011), ses autres cercles. Un membre en pause et un membre actif qui n'a pas répondu produisent, pour les autres, des réponses identiques.

À l'étape 1, un test compare chaque réponse du serveur à la liste des clés de son type : une clé en trop fait échouer le test. Deux autres tests le complètent (`docs/etape-6/donnees.md`, partie 2) :
- les **réponses inversées** : ce qu'un proche reçoit avant 18h est identique octet pour octet, quels que soient mes avis. Les curseurs voyagent en millièmes entiers pour que ce test reste exact ;
- le **traceur** : aucune valeur marquée d'un autre cercle n'apparaît jamais.

### 1.3 Rien dans les adresses (P-08)

- Ni identifiant, ni pseudo, ni réponse, ni jeton dans le chemin ou après le « ? » d'une adresse, qu'elle vise une route `/api/` ou une page web.
- **Les jetons voyagent dans un en-tête, dans le corps d'une demande, ou après un « # ».** Le jeton de session va dans l'en-tête `Authorization`. Les jetons de lien (invitation, créateur, relecture) et le code de retour de Google vont après le « # » : ce qui suit le « # » n'est jamais envoyé à un serveur, ni aux robots qui fabriquent les aperçus de lien. L'application le lit dans l'adresse que lui passe iOS, puis l'envoie dans le corps d'une demande.
- **Une lecture qui a besoin d'un paramètre se fait par `POST`** : la fiche d'un texte, l'ouverture d'un lien, un cercle, un proche. Elle ne change rien pour autant (1.5).

### 1.4 Rien avant 18h (P-26), et seulement le révélé pour les autres (P-27 a)

- Avant la révélation d'un texte, aucune réponse du serveur ne porte son vote, son auteur, l'auteur d'une carte, le député derrière une raison ou l'avis du cercle, même sous une forme cachée.
- Les numéros des cartes sont tirés au hasard pour chaque joueur, chaque cercle et chaque jour.
- Avant la révélation, `POST /api/fiche` ne rend que le texte et ta réponse.
- **Ce qu'on reçoit d'un autre membre se calcule d'après son entrée et ses seules réponses déjà révélées** : ses curseurs (règle 19, lecture A), ses tempéraments (lecture confirmée par Game design, partie 8), ses surprises. Sinon, un curseur qui bouge ou un tempérament qui apparaît avant 18h trahirait la réponse du jour. Le choix des cartes les plus inattendues (règle 8, R3) suit la même règle : il utilise le curseur tel que le joueur qui devine peut le voir.
- Le Pas de Côté s'annonce à la révélation du texte, jamais avant (règle 14).
- **La base le tient aussi pour les réponses du jour.** Un proche ne lit la réponse d'un autre au texte du jour qu'après la fermeture de ce texte, à 18h : avant, la base ne la rend pas, même à une requête sans filtre. « Déjà joué » passe par une fonction de la base qui ne rend que des identifiants de membres (`cloison_ont_repondu`, migration 0002). Le reste de P-26 et P-27 (ce que le serveur envoie au téléphone, les manches des autres devineurs) est tenu par le serveur et ses tests.

### 1.5 Les lectures ne changent rien

Un `GET` ne modifie jamais la base. Une lecture par `POST` (1.3) non plus. Tout ce qui écrit passe par un `POST` qui le dit. Par exemple :
- « j'ai vu la révélation » (`POST /api/vu`) ;
- « j'en suis à cette étape de la révélation » (`POST /api/revelation/etape`) ;
- « l'écran Deviner s'est affiché » (`POST /api/deviner/ouvrir`, qui compte pour R10) ;
- « l'écran Répondre s'est affiché » (`POST /api/repondre/ouvrir`, qui ouvre le droit à la réponse en retard, R10).

Raison : une lecture peut être rejouée par l'application qui revient au premier plan, par un renvoi après une coupure ou par un test. À l'étape 1, un test rejoue toutes les lectures et vérifie que la base n'a pas bougé.

### 1.6 Où vivent les mots

- **Les mots fixes vivent dans l'application, dans un seul fichier de textes.** Ce sont les boutons, les titres d'écran, les verdicts (« Ça alors ! »), les noms des positions, des titres, des badges et des tempéraments, N1 à N18, et les mots de la partie 11. Ce qui manque porte la marque `A_ECRIRE`, et un test refuse toute fabrication de l'application qui en contient encore une (repris de l'essai 2). Changer un mot fixe demande une nouvelle fabrication.
- **Les phrases qui dépendent des données sont faites par le serveur**, déjà typographiées. Ce sont :
  - la phrase du jour et la phrase de la semaine ;
  - les lignes du vote, « Proposé par … », « Ta raison, « … », était l'argument de … » ;
  - la ligne de l'avis du cercle ;
  - l'annonce d'arrivée (à l'écran avec le score, en message sans le score : 2.13) et le message de 18h ;
  - les dates écrites (« révélé jeudi », « Semaine du 26 mai »).

  Une seule source évite deux versions d'une même phrase, et le serveur peut corriger une phrase sans nouvelle fabrication.
- **Deux textes que le joueur accepte sont servis par le serveur avec leur version** : la carte de consentement (`GET /api/accord`) et la phrase de l'invitant (`POST /api/inviter/voir`). Ainsi, l'empreinte enregistrée est celle du texte réellement lu (P-34, P-35).
- **« Qui, durée, droits » (N6)** est un texte fixe de l'application, avec trois blancs servis par `GET /api/droits`. Le même texte est publié par le serveur à `/confidentialite` (2.14), avec les mêmes blancs.

### 1.7 La forme des échanges

- **JSON en UTF-8.** Un `POST` porte `Content-Type: application/json` ; son corps fait 16 Kio au plus. Un champ manquant, en trop ou hors liste donne `requete_invalide`.
- **Toute réponse est une enveloppe** `Reponse<T>` : `ok`, `fabricationMinimale`, `horloge`, puis `donnees` ou `erreur`. Statut 200 si `ok`, sinon celui de la partie 6. Seule exception : `POST /api/recu`, envoyée par l'extension, répond 204 sans corps.
- **`Cache-Control: no-store`** sur toute réponse `/api/`.
- **Trois en-têtes envoyés par l'application** à chaque demande :
  - `Authorization: Bearer {jeton}` s'il y a une session (provisoire ou compte) ;
  - `Elenchos-Fabrication: {numéro}`, le numéro de fabrication de l'application ;
  - `Content-Type` sur un `POST`.
- **La session** (partie 4 ; `DECISIONS-TECHNIQUES.md`, 1.8) :
  - c'est un jeton tiré au hasard, rangé dans le trousseau de l'iPhone. La base n'en garde que l'empreinte avec clé, un par appareil ;
  - elle est prolongée à chaque ouverture, jamais au-delà de la fin du test (D-061, point 2) ;
  - elle est révoquée à la déconnexion et à l'effacement (P-38, P-41).

  Le joueur provisoire du défi a son propre jeton, rendu par `POST /api/accord`, valable 7 jours au plus. Une connexion réussie rend le jeton du compte, qui le remplace dans le trousseau.
- **Plus de cookies, plus de contrôle d'origine par cookie.** Sans cookie, une page d'un autre site ne peut pas agir au nom du joueur : la session n'est envoyée que par l'application. Le serveur répond aux demandes de l'application (origine `capacitor://localhost`, CORS limité à cette origine, aux méthodes `GET` et `POST` et aux trois en-têtes) et à celles de ses propres pages. Une demande d'un navigateur venue d'ailleurs reçoit `origine_refusee`. `POST /api/recu`, envoyée par l'extension sans origine, est la seule route qui accepte une demande sans origine.
- **La version minimale.** Chaque enveloppe porte `fabricationMinimale`. Si le numéro de l'application est plus petit :
  - le serveur répond `mise_a_jour_requise` (426) à toute demande dont l'en-tête porte un numéro trop petit, sauf `GET /api/etat`, par laquelle l'application apprend le numéro minimal. Les demandes sans cet en-tête (nos pages web, l'extension) ne sont pas concernées : la version minimale est une question de compatibilité, pas de sécurité ;
  - l'application montre l'écran « Mets à jour Elenchos dans TestFlight » (mots d'UX, `A_ECRIRE`), sans rien perdre : un choix pas encore validé reste dans sa mémoire.

  Le numéro minimal ne monte que quand le contrat change d'une façon que l'ancienne fabrication ne comprend pas. Il se monte comme une mise en ligne : jamais de 15h à 19h ni le dimanche (D-043, D-054).
- **Rien d'autre dans le téléphone** (P-11) : le trousseau garde le seul jeton de session. Ni `localStorage`, ni base locale, ni cache de réponses. Les fichiers de l'interface sont dans l'application elle-même. Seules exceptions, dans la mémoire du script et le temps d'un écran :
  - une position choisie mais pas encore envoyée ;
  - l'adresse tapée pour le code e-mail (2.5) ;
  - le vérificateur d'une connexion en cours (2.5).
- **Limiteur** propre à chaque session, et un compteur commun pour les routes sans session (repris du test de 18h). Ses fenêtres durent un quart d'heure au plus, pour que le message fixe « réessaie dans un quart d'heure » soit vrai (partie 6).
- **Sans réseau (N18)** : l'application s'ouvre même sans réseau, puisque l'interface est embarquée. Elle montre alors l'écran entier de N18.
  - Un geste parti sans réponse est renvoyé tel quel, une fois, quand le réseau revient.
  - Le renvoi ne peut pas créer de doublon : si le premier envoi était arrivé, le serveur répond `deja_repondu` ou `deja_validee`, ou rend le même `Aujourdhui` (poser deux fois le même visage ne change rien), et l'application relit l'état.
- **En-têtes de sécurité** sur toute réponse : `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. Les pages web et la page embarquée portent une règle stricte de chargement (CSP) : aucun script, aucune police, aucune image venus d'ailleurs (P-09, P-10). Celle de l'application n'autorise les échanges qu'avec l'adresse du serveur.

## 2. Les échanges, moment par moment

*Pour chaque échange : les écrans servis, la route, ce que l'application envoie, ce qu'elle reçoit dans `donnees`, les erreurs propres à la route. Les erreurs communes (`requete_invalide`, `origine_refusee`, `mise_a_jour_requise`, `trop_de_demandes`, `erreur_serveur`) valent partout. Les types sont ceux de `contrat.ts`.*

### 2.1 Au démarrage : `GET /api/etat`

- **Envoyé** : rien. **Reçu** : `Etat`. **Erreurs** : aucune.
- Appelé à chaque ouverture, au retour au premier plan, à la fin d'un compte à rebours, après une erreur `non_connecte`, et quand iOS passe une adresse à l'application (lien d'invitation).

L'application en tire l'écran, dans cet ordre de priorité :

| Contexte, puis `Etat` | Écran | Échange suivant |
|---|---|---|
| L'application s'ouvre sur un iPad ou un Mac (avant tout appel) | N2, variante application | `POST /api/compteur` (`ipad`) ; rien d'autre |
| Numéro de fabrication sous `fabricationMinimale` | Mise à jour requise | `GET /api/etat` au retour au premier plan |
| Aucune réponse : pas de réseau, ou le serveur ne répond pas | N18 : écran entier si rien n'est encore chargé, sinon bandeau ; ligne « Pas encore envoyé » sous un geste qui n'est pas parti | `GET /api/etat` dès que le réseau revient |
| Une adresse avec `#lien=…` vient d'arriver (lien universel) | 1.2 (N16 pour un créateur), ou l'issue du lien | `POST /api/lien` |
| `accordAJour` faux | la carte de consentement, avant la prochaine réponse | `GET /api/accord` |
| `dehors`, sans lien | N1, variante application | « J'ai déjà un compte » : `GET /api/compte` |
| `entree` | 1.2 ou 1.4 du texte suivant | `GET /api/entree` |
| `entree_finie` | 1.7 (N16 pour un créateur), puis 1.8 ; N15 à la place de 1.8 si `EcranCompte.cercleComplet` | `GET /api/entree/bilan`, `GET /api/compte` |
| `nommer_cercle` | 5.1 (variante si `premierCercle` est faux) | `POST /api/cercle` |
| `jeu` et `revelationAOuvrir` | la révélation, à sa reprise | `GET /api/revelation` |
| `jeu` et `annonces` non vide | le bandeau d'arrivée (1.10) ; si `aDeviner`, 1.11 | `GET /api/miroir` |
| `jeu` | Aujourd'hui ; avec `defi`, la ligne « Défi de {pseudo} à finir › » (`A_ECRIRE`) | `GET /api/aujourdhui` ; la ligne mène à `GET /api/entree`, ou à 1.7 puis `GET /api/rejoindre` si `defi.faits` vaut 3 |
| Le script de l'application ne démarre pas | la vue de secours | aucun |

L'appareil n'est pas une règle du jeu : l'application lit seulement si elle tourne sur un iPad ou un Mac (D-054 ; `produit.md` §5, l'iPad n'est pas admis, proposé). Le serveur ne lit pas l'appareil (P-07).

### 2.2 Le lien : la page d'invitation, puis `POST /api/lien`

- **L'adresse d'un lien** : `https://elenchos.fr/invitation#lien={jeton}`, pour une invitation, un lien de créateur ou un lien de relecture. Avant le domaine (D-060, point 2), la même chose sur l'adresse gratuite de l'hébergeur.
- **Si l'application est installée**, iOS l'ouvre directement sur cette adresse : c'est un « lien universel », déclaré par le fichier d'association (2.14). L'application lit le jeton après « # », puis appelle `POST /api/lien`.
- **Sinon, Safari ouvre la page d'invitation** (2.14) :
  - sur un iPhone, elle dit comment entrer : installer TestFlight, installer Elenchos, revenir toucher le lien (mots d'UX) ;
  - ailleurs, elle montre N2.

  Elle ne lit pas le jeton et ne l'envoie nulle part : le lien n'est ni consommé, ni lié. Elle envoie seulement `POST /api/compteur`, sans session et sans rien de la personne.
- **`POST /api/lien`**. **Écrans** : 1.2, N16, 5.14 et N13, N12, N15, et le défi d'un joueur inscrit (2.4).
  - **Envoyé** : `{ jeton }`. **Reçu** : `LienOuvert`.
  - Les issues attendues sont des données, pas des erreurs : `ouvert`, `expire`, `deja_servi`, `inconnu`, `complet`, `deja_membre`, `trois_cercles`, `entree_en_cours`.
  - `complet` porte le pseudo de l'invitant, pour « Tu peux le dire à {pseudo}. » (N15).
- **Ouvrir un lien n'enregistre rien et ne le consomme pas** (P-29). Le lien se lie au joueur à sa première réponse enregistrée (2.4) : au joueur provisoire, ou au compte d'un joueur inscrit. Rien de l'invitant ne vient avec, sauf son visage (pseudo et rond), qu'affiche le bandeau « Défi de Thomas ».
- **Avec une session de compte** (règle 15), `ouvert` porte `dejaInscrit: true` et, si le joueur avait déjà répondu au premier texte, sa réponse `reprise`. S'il a déjà trois cercles, l'issue est `trois_cercles` ; s'il est déjà membre de ce cercle, `deja_membre` (N12, réécrit).
- **Le lien de créateur** est un lien du même type, sans invitant. Le porteur le fabrique avec un outil du serveur, un par créateur, à usage unique, valable 7 jours, et le colle dans son message (N17). C'est un geste du porteur, à mettre dans son pas-à-pas. L'outil n'est pas un écran : il ne montre ni réponse, ni pseudo, ni adresse (P-42).

### 2.3 La carte de consentement : `GET /api/accord`, `POST /api/accord`

- **Écrans** : 1.3 (N5) ; plus tard, la même carte si `Etat.accordAJour` est faux.
- `GET` : **reçu** `CarteAccord` (version, empreinte, titre, paragraphes). « J'accepte » et « Qui, durée, droits » sont des mots de l'application.
- `POST` : **envoyé** `EnvoiAccord` (version, empreinte, `quinzeAnsEtPlus: true`, jeton du lien) ; **reçu** `AccordEnregistre`.
  - Pour un premier accord, `jeton` est la session provisoire, que l'application range dans le trousseau.
  - Pour le nouvel accord d'un compte, `jeton` vaut null.
  - **Erreurs** : `accord_perime` (la carte a changé entre-temps : on la redemande), `lien_expire`, `lien_deja_servi`, `etape_incorrecte`.
- **Option B, tranchée par l'équipe** (`DECISIONS-TECHNIQUES.md`, partie 3). L'accord crée le joueur provisoire. Il enregistre la version, l'empreinte du texte exact, l'heure du serveur et « 15 ans et plus » (P-34). Refuser la carte n'envoie rien : rien n'est enregistré nulle part, et le lien n'est pas consommé.
- **Un joueur inscrit qui relève un défi** (règle 15) ne revoit pas la carte : son accord suit son compte.
- **Carte décidée par D-061 (point 1)** : texte de N5 (`docs/etape-6/contenu-test.md`, annexe), composé avec `Droits.responsable`. Un changement de ce réglage change la version de la carte.

### 2.4 Le défi des trois textes : `GET /api/entree`, `POST /api/entree/repondre`, `GET /api/entree/bilan`

- **Écrans** : 1.2, 1.4, 1.5, 1.6, 1.7 ; N16 pour le créateur.
- `GET /api/entree` : **reçu** `Entree` (le texte suivant, son rang, le mode, l'invitant, et `reprise`) ou `{ etat: 'finie' }`. **Erreurs** : `non_connecte`, `etape_incorrecte`.
- `POST /api/entree/repondre` : **envoyé** `{ texte, reponse, pari }`, en un seul échange, au toucher sur « Voir sa réponse » (1.5) ; pour le créateur, `pari: null`, au toucher sur « Valider » (1.4). **Reçu** `RevelationEntree` : le verdict du pari (jugé sur le côté, D-011), la réponse de l'invitant, le vote, l'auteur du texte, l'auteur de ta raison. **Erreurs** : `non_connecte`, `accord_requis`, `deja_repondu`, `etape_incorrecte`, `lien_expire`, `lien_deja_servi`.
  - La réponse de l'invitant n'existe que dans la réponse à ce `POST`, donc jamais avant le pari (P-29).
  - La première réponse enregistrée lie le lien à ce joueur ; un autre appareil reçoit ensuite `deja_servi` (P-29).
  - Entre 1.4 et 1.5, rien n'est envoyé : l'application empêche de revenir en arrière après « Valider ». Le serveur reçoit la réponse et le pari ensemble, ce qui rend l'ordre « pari, puis réponse de Thomas » impossible à contourner.
- **Un joueur inscrit qui rejoint un autre cercle** (règle 15) relève le même défi.
  - S'il avait déjà répondu à un texte, `Entree.reprise` porte sa réponse. L'écran la montre au lieu de la demander (mots d'UX, `A_ECRIRE`), puis passe à « Et {pseudo} ? ». Il envoie `reponse: null` : sa réponse est reprise, sans compter deux fois.
  - Sa barre n'avance que des réponses nouvelles.
  - Le défi vit à côté du jeu : ses cercles restent ouverts pendant ce temps (`Etat.defi`).
- `GET /api/entree/bilan` : **reçu** `BilanEntree`.
  - Pour l'invité, la forme (score ou surprises) et les deux nombres (E10).
  - Pour tous, les curseurs que l'entrée a touchés, encore flous, et la barre déjà avancée (1.7 ; « esquisse » du créateur, `onboarding.md`).
  - « Non conservé » (D-006) : le bilan ne se montre qu'à la fin du défi. Seul le score reste en base, pour l'annonce à l'invitant. Il s'efface dès que l'invitant a vu l'annonce (`POST /api/vu { objet: 'annonces' }`), au plus tard 7 jours après la création du compte. Sans compte, il part avec le joueur provisoire.

### 2.5 Le compte et la connexion

**Écrans** : 1.8 (N7), 1.9, « J'ai déjà un compte » (N1, N13), N15, l'écran Rejoindre.

- `GET /api/compte` : **reçu** `EcranCompte`. `but: 'creation'` à la fin du défi ; `'connexion'` sans session. Le texte « Pourquoi Elenchos ? » ne s'affiche qu'avec `creation` (D-049).
  - **`cercleComplet`** (N15, second moment) : le cercle de l'invitant s'est rempli pendant l'entrée. N15 prend la place de l'écran du compte, après le bilan, avec « Tes réponses sont effacées dans 7 jours. » Le cercle peut encore se remplir avant la connexion : le refus `cercle_complet` reste.
  - **« Effacer mes réponses »** : un lien discret sur l'écran du compte (1.8), en `creation` seulement, et sur N15. Il appelle `POST /api/tout-effacer`, accepté en session provisoire (2.12). Condition prise à Juridique avec l'option B : le droit d'effacement existe avant le compte.
- `POST /api/compte/pseudo` : **envoyé** `{ pseudo }` ; **reçu** `{ accepte: true }`. Le pseudo est gardé sur le joueur provisoire, puis la voie est choisie. **Erreurs** : `pseudo_pris` (E7, comparé dans le cercle de l'invitant), `pseudo_invalide`, `etape_incorrecte`, `non_connecte`.

**Apple, en natif** (la feuille d'Apple, avec Face ID) :
1. L'application tire au hasard un vérificateur de 32 octets, gardé dans sa seule mémoire. Elle appelle `POST /api/connexion/debut { voie: 'apple', but, defi }`, où `defi` est l'empreinte SHA-256 du vérificateur. **Reçu** : `{ nonce }`. Le serveur garde la connexion en cours 10 minutes : le nonce, le défi, le but, le joueur provisoire de la session s'il y en a un.
2. L'application ouvre la feuille d'Apple sans demander ni nom ni adresse (D-061, P-03), avec ce nonce.
3. Elle envoie `POST /api/connexion/apple { jetonIdentite, verificateur }`. **Reçu** : `ResultatConnexion`.

   Le serveur vérifie :
   - la signature d'Apple, l'émetteur, l'application visée et l'échéance ;
   - le nonce de la connexion en cours ;
   - que l'empreinte du vérificateur égale le défi.

   Puis il consomme la connexion, et crée ou retrouve le compte. **Erreurs** : `connexion_expiree`, `etape_incorrecte`.
4. Si le joueur ferme la feuille, rien n'est envoyé : il reste sur 1.8.

**Google, par la feuille du système** (ASWebAuthenticationSession ; Google refuse sa connexion dans une page intégrée à une application) :
1. `POST /api/connexion/debut { voie: 'google', but, defi }`. **Reçu** : `{ adresse, schemaRetour }`. Le serveur garde la connexion en cours 10 minutes : l'état, le nonce et le vérificateur de Google (PKCE), le défi, le but, le joueur provisoire.
2. L'application ouvre la feuille du système sur `adresse`. Google n'y demande que l'identifiant (P-03).
3. Google revient par un formulaire, dans la feuille : `POST /connexion/google/retour` (`response_mode=form_post` ; le code de Google n'apparaît jamais dans une adresse, P-08). Le serveur :
   - vérifie l'état, échange le code, vérifie le jeton d'identité ;
   - refuse un compte Google d'organisation (P-41) ;
   - crée ou retrouve le compte ;
   - range le résultat, ou le refus, sous un **code de retour** : 32 octets tirés au hasard, empreinte seulement, **valable une minute, une seule fois** ;
   - répond par une redirection vers `elenchos://connexion#code={code}`.
4. La feuille se ferme et rend cette adresse à l'application, qui lit le code après « # » et appelle `POST /api/connexion/echanger { code, verificateur }`. **Reçu** : `ResultatConnexion`. **Erreurs** : `connexion_expiree`, `etape_incorrecte`.
5. Si le joueur ferme la feuille, rien n'est envoyé. S'il refuse chez Google, le résultat est `refus_fournisseur`, par le même chemin.

Le vérificateur lie la fin de la connexion à l'application qui l'a commencée : un code de retour intercepté ne vaut rien sans lui. Rien de Google ni d'Apple n'est chargé dans l'application avant le toucher (P-10).

**L'e-mail** (inchangé ; allumé à l'étape 4, avec le domaine) :
- `POST /api/compte/email` : **envoyé** `{ adresse }` ; **reçu** `{ minutes: 15 }` (P-41). L'écran du code affiche « Code envoyé à {adresse} », l'adresse étant gardée dans la mémoire du script seulement (P-11). Si iOS a fermé l'application pendant le passage par Mail, l'écran dit « Code envoyé », sans l'adresse. **Erreurs** : `adresse_invalide`, `trop_de_codes`, `indisponible` (pas de domaine : le bouton n'apparaît pas, `voies.email` faux), `etape_incorrecte`.
- `POST /api/compte/code` : **envoyé** `{ code }` ; **reçu** `ResultatConnexion`. **Erreurs** : `code_faux`, `code_expire`, `trop_essais`, `etape_incorrecte`.
- **Personne ne peut savoir si une adresse a un compte.** En mode `connexion`, une adresse inconnue reçoit la même réponse ; aucun e-mail ne part, et tout code est faux. Savoir qu'une adresse joue à un jeu politique serait déjà une donnée sensible.

**Le résultat.** `ResultatConnexion` porte le jeton du compte, que l'application range dans le trousseau, ou un refus dit une seule fois : `refus_fournisseur`, `compte_organisation`, `compte_inconnu`, `cercle_complet`, `pseudo_pris`, `connexion_echouee`.

**La création du compte se fait en une transaction** :
- l'empreinte de l'identifiant ou de l'adresse (jamais l'adresse elle-même) ;
- le pseudo ;
- l'accord, gardé avec sa date d'origine (P-34) ;
- les réponses d'entrée ;
- le lien consommé ;
- l'entrée dans le cercle, pour l'invité.

Le serveur vérifie au même moment le cercle complet (N15) et le pseudo (E7). Puis l'annonce d'arrivée part vers l'invitant (2.7).

**Un compte qui existe déjà et se reconnecte depuis un défi** (par exemple après avoir réinstallé l'application) : le joueur provisoire se fond dans le compte (proposé).
- Ses réponses aux textes que le compte n'avait pas encore donnés sont gardées. Les autres sont écartées : la réponse du compte, plus ancienne, reste définitive (règle 7).
- Le défi devient le défi en cours du compte (`Etat.defi`), qui le finit par l'écran Rejoindre.

**L'écran Rejoindre** (règle 15) : `GET /api/rejoindre` → `EcranRejoindre`, puis `POST /api/rejoindre { pseudo }` → `{ cercle }`.
- `pseudo` vaut null pour garder le sien. S'il est pris dans ce cercle (`pseudoPris`), le joueur en choisit un autre, qui vaut pour tous ses cercles (P-03 a).
- `obstacle` dit ce qui l'empêche d'entrer : cercle complet (N15), trois cercles, déjà membre. Mots : UX.
- **Erreurs** : `pseudo_pris`, `pseudo_invalide`, `cercle_complet`, `trois_cercles`, `lien_expire`, `etape_incorrecte`, `non_connecte`.
- Rejoindre fait partir l'annonce d'arrivée, comme une création de compte.

### 2.6 Les cercles : créer, voir, changer, quitter, inviter

- **Écrans** : 5.1, 5.6, 4.2 (avec 1.15, 5.9, 5.13), 5.5, 5.7 (Quitter), 1.14.
- `GET /api/cercles` → `MesCercles` : tes cercles dans l'ordre d'entrée, et `peutCreer` (faux à trois cercles : « + Créer un cercle » est grisé, 5.6).
- `POST /api/cercle { nom }` → `{ cercle }`. Il crée le premier cercle à la fin de l'entrée du créateur (`nommer_cercle`), ou un autre cercle depuis 5.6. **Erreurs** : `nom_invalide`, `trois_cercles`, `etape_incorrecte`, `non_connecte`.
  - Les trois textes d'entrée du nouveau cercle sont ceux de l'entrée de son créateur (lecture confirmée par Game design) : ses trois réponses existent déjà, et ce sont elles que ses invités devineront (D-006). Pendant le test, un seul trio d'entrée sert à tous les cercles (D-065, point 2 ; `FORMAT.md`, partie 3) : c'est le même pour tous.
- `POST /api/cercle/voir { cercle }` → `Cercle` (4.2) :
  - les membres par ordre d'arrivée ;
  - sous chaque visage, ses distinctions dans l'ordre que donne le serveur : titres de la semaine, badges jusqu'aux titres suivants, puis tempéraments (R9, règle 13) ;
  - la surprise de la semaine ;
  - les huit barres « Où chacun se place », avec les initiales des curseurs nets et « Encore flou : … » ;
  - `lance`, `complet`, le bandeau, et `titresPasses`.

  « Vous êtes trois : le cercle est lancé. » ne revient pas après `POST /api/vu { objet: 'cercle_lance', cercle }`. Le bandeau `cercle_incomplet` dit les mêmes mots au départ (5.13) et en sommeil (5.9) : on ne dit jamais qui a arrêté. **Erreurs** : `introuvable` (un cercle qui n'est pas le sien répond comme un cercle qui n'existe pas), `non_connecte`.
- `POST /api/cercle/titres { cercle }` → `TitresPasses` (5.5) : semaine par semaine, chaque titre et badge avec ses titulaires présents et le nombre d'anciens membres qui l'avaient (« un ancien membre », D-045 point 2 ; deux anciens membres ne se distinguent pas, règle 4). Sans total (R7).
- `POST /api/cercle/quitter { cercle, confirmation: 'quitter' }` → `{ quitte: true }`. C'est un départ (règle 4), distinct de « Tout effacer » :
  - ses réponses quittent ce cercle seulement (P-37) : sa carte pas encore révélée disparaît de la manche ; une carte où son visage était posé redevient vide, marquée « vidée par un départ » si la manche n'est pas encore révélée ; l'avis du cercle, calculé à chaque lecture, ne compte plus ses réponses (3) ;
  - son visage disparaît, sans message au cercle ;
  - ses titres passés restent sous « un ancien membre », sauf Le Pas de Côté, effacé (D-066, point 1) ; un titre de la semaine qu'il détenait n'est pas redonné ;
  - le lien qui l'avait fait entrer reste servi, mais ne le désigne plus et perd son score : il ne lit plus rien de ce cercle par lui (Juridique, P-25). Ce qu'il y avait « déjà vu » s'efface ;
  - il garde son compte, son portrait et ses autres cercles. S'il n'en a plus, son parcours passe à `nommer_cercle` avec `premierCercle: false` ;
  - un cercle dont le dernier membre part est effacé avec son histoire (carte des données, proposé).

  Confirmation : les mots de la maquette 5.7, « Tes réponses quittent ce cercle. Tes titres passés y restent. », sont à reprendre par UX pour dire « sous « un ancien membre » » (`produit.md`, annexe, D-045).
- `POST /api/inviter/voir { cercle }` → `EcranInviter` : le cercle, la phrase de l'invitant avec sa version (P-35), le nombre de liens envoyés, `lance`, `complet`.
- `POST /api/inviter { cercle, accordVersion }` → `{ lien }`, l'adresse complète de la page d'invitation, avec le jeton après « # ». Aucun lien sans la ligne d'accord de l'invitant (P-35). **Erreurs** : `accord_perime`, `cercle_complet`, `introuvable`, `non_connecte`.
- Le message d'invitation (« Tu crois me connaître ? … ») est un mot fixe. L'application ouvre la feuille de partage de l'iPhone avec le message et le lien ; jamais d'accès aux contacts.

### 2.7 L'annonce d'arrivée et le miroir : `Etat.annonces`, `GET /api/miroir`, `POST /api/miroir/parier`

- **Écrans** : 1.10, 1.11 (1.5 à 1.7 en miroir).
- **L'annonce** part à l'entrée d'un invité dans un cercle de moins de trois membres (D-006), par création de compte ou par l'écran Rejoindre. Elle arrive de deux façons :
  - par un message, si l'invitant a accepté le message de 18h : un texte fixe, **sans le score**, de `MESSAGES_ARRIVEE` (2.13) ;
  - et toujours dans `Etat.annonces`, avec son cercle, à l'écran, avec le score (texte de D-011, `AnnonceArrivee.texte`), jusqu'à `POST /api/vu { objet: 'annonces' }`, qui efface aussi le score en base (2.4).
- `GET /api/miroir` → `Miroir` : le cercle, un texte à deviner (son titre seulement, 1.11) ou le bilan. Le créateur devine son premier invité quand ils sont deux (D-006, D-011) ; « dans chaque cercle qu'il crée » étend D-006 aux cercles qu'un joueur inscrit crée ensuite (proposé). **Erreurs** : `rien_a_deviner`, `non_connecte`.
- `POST /api/miroir/parier { cercle, texte, pari }` → `MiroirRevele` : le verdict et la réponse de l'invité, sans le vote ni les auteurs, que le créateur connaît déjà. **Erreurs** : `rien_a_deviner`, `introuvable`, `etape_incorrecte`, `non_connecte`.

### 2.8 La journée : `GET /api/aujourdhui` et ses gestes

- **Écrans** : 1.12, 1.13, 2.1, 2.2, 2.3, 2.4, 2.5, 5.8, 5.10, 5.12, 5.13.
- `GET /api/aujourdhui` → `Aujourdhui`. Le serveur choisit l'étape : Deviner, Répondre ou En attendant. Il donne aussi :
  - le repère de la journée (D-038), avec la seconde ligne qui nomme les cercles quand il y en a plusieurs (« Famille ✓ · Amis »), et `rien` pour une manche vidée par R8 (« Rien à deviner dans {nom} aujourd'hui ») ;
  - le bandeau « Il faut trois joueurs pour deviner. », quand aucun de ses cercles n'a trois membres actifs ;
  - le bandeau « Tu as rejoint {nom}. », une fois ;
  - la ligne de la révélation (E3) : `finir` (« Finir la révélation › », elle reprend là où on l'avait laissée, 2.9), `revoir` (« Revoir la révélation › », lue jusqu'à la fin) ou null.

**Deviner** (2.1, 2.2, 5.8) :
- **Une manche par cercle**, jouées à la suite dans l'ordre d'entrée dans les cercles (règle 3). L'étape porte le cercle, le rang et le total (« Amis · 2 sur 2 »).
- Un cercle endormi n'a pas de manche (règle 5). Une manche vidée par R8 est sautée.
- Un proche présent dans deux de tes cercles n'est servi, et proposé, qu'une fois par jour (R8), qu'il ait répondu ou non : sinon son visage, proposé deux fois, dirait qu'il n'a pas répondu (D-011). S'il n'a pas de réponse servie (pas de réponse, ou réponse en retard), un tirage invisible choisit la manche où il est proposé, parmi tes manches qui ont des cartes (lecture A2 de Game design ; troisième exception à D-011, fidèle à son but, D-065 point 1). Un membre arrivé après la fermeture du texte n'est pas proposé (règle 8).
- Quand l'étape est `deviner` avec `ouverte: false`, l'application appelle `POST /api/deviner/ouvrir { cercle }` au moment où elle montre l'écran. C'est ce geste qui fait exister la manche (R10 : une manche dont l'écran ne s'est jamais affiché n'a pas de cartes). Le serveur tire alors les cartes, une seule fois, avec un tirage qui donne le même résultat quel que soit le moment.
- **Le choix des cartes suit la règle 8.** Dès quatre réponses possibles, deux viennent parmi les plus inattendues de la part de leur auteur, et une au hasard (R3). Deux réponses identiques ne sont pas servies ensemble si une autre peut prendre la place (R4). La carte « qui et pourquoi » vient en dernier (règle 9). Rien à l'écran ne dit laquelle était inattendue.
- `POST /api/deviner/poser` (`{ carte, visage }`, `visage: null` pour retirer), `POST /api/deviner/pourquoi` (`{ carte, raison }`), `POST /api/deviner/passer` (`{ carte }`), `POST /api/deviner/valider` (`{ cercle }`) : chacun rend le nouvel `Aujourdhui`.
  - Le numéro de carte suffit à désigner la manche.
  - Le brouillon est gardé à chaque geste (règle 9). Changer de visage garde le « pourquoi » ; retirer le visage ou passer l'efface : c'est le serveur qui l'applique.
  - « Valider » fige la manche et passe à la suivante, ou à Répondre.
- **Erreurs** : `manche_fermee` (18h est passé : l'application redemande `GET /api/etat`), `deja_validee`, `carte_inconnue`, `visage_non_propose`, `visage_deja_pose`, `pourquoi_sans_visage`, `introuvable`, `non_connecte`.

**Répondre** (2.3, 2.4, 1.12, 5.12) :
- En montrant 2.3, l'application appelle `POST /api/repondre/ouvrir { texte }`, une fois par texte. Le serveur note que l'écran Répondre s'est affiché, et l'heure, rien d'autre : c'est la condition de la réponse en retard (R10, règle 6).
- `POST /api/repondre` : **envoyé** `{ texte, position, raison }`, au toucher sur « Valider » ; **reçu** `ReponseFaite`.
  - À l'heure, `aujourdhui` est à l'étape En attendant, avec la phrase du jour.
  - **En retard**, entre 18h00 et 18h10, si l'écran Répondre de ce texte s'était affiché avant 18h00, la réponse est acceptée. `enRetard` porte sa phrase du jour, montrée une fois, avec « Continuer » vers la révélation (mots d'UX, `A_ECRIRE`). Elle compte pour le portrait, la barre, Le Fidèle et l'avis du cercle, mais n'est jamais servie à deviner (règle 6).
  - Chaque réponse acceptée en retard, et chaque refus après 18h, est compté par le serveur, sans personne (`SORTES_COMPTEUR_SERVEUR`).
- **Erreurs** : `accord_requis`, `texte_ferme` (après 18h10, ou dès 18h00 si l'écran Répondre ne s'était pas affiché avant), `deja_repondu`, `etape_incorrecte`, `non_connecte`.
  - Sur `texte_ferme`, l'écran dit « Ce texte s'est fermé à 18h. Ta réponse n'a pas été prise. » avec « Continuer », qui mène à la révélation.
  - Sur `manche_fermee`, « La manche s'est fermée à 18h, telle qu'elle était. »
- Ta réponse du jour vaut pour tous tes cercles (règle 3).

**En attendant** (2.5, 1.13, 5.10) :
- la phrase du jour ;
- la sorte de compte à rebours (« Révélation dans … » ou « Nouveau texte dans … », E1) ;
- qui a déjà joué, cercle par cercle, rien d'autre : jamais qui n'a pas joué ;
- le bloc N10 du message de 18h, selon l'accord d'iOS, lu dans le téléphone et non sur le serveur.

### 2.9 La révélation de 18h : `GET /api/revelation`, `POST /api/revelation/etape`, `POST /api/vu`, `POST /api/fiche`

- **Écrans** : 2.7a à 2.7f, 3.2, 3.3a à 3.3e, 5.4.
- `GET /api/revelation` → `Revelation`, valable du 18h au 18h suivant : le texte révélé, les étapes dans l'ordre, et `reprise`. **Erreurs** : `rien_a_reveler`, `non_connecte`.
- **Les étapes, dans l'ordre de D-011 et de la règle 10**, calculé par le serveur :
  1. **les attributions, cercle par cercle**, dans l'ordre d'entrée (2.7a à 2.7c). La dernière carte d'un cercle porte tes points du jour et de la semaine dans ce cercle (« 1 point aujourd'hui · 4 cette semaine », 2.7c ; tes points seulement). Une manche jamais ouverte n'a pas d'étape : la révélation commence au vote (R10, E1) ;
  2. **le vote**, et l'avis de chaque cercle qui a au moins trois réponses, un graphique par cercle, jamais additionnés (2.7d ; D-025, règle 10) ;
  3. **les auteurs** (2.7e) ;
  4. **les badges rares**, cercle par cercle (3.2) : Le Pas de Côté à la révélation du texte (règle 14) ; Le Sans-Faute le dimanche, avant les titres ;
  5. **le dimanche, pour chaque cercle éveillé** : Le Devin, Le Mystère, Le Fidèle (3.3a à 3.3c ; un titre sans titulaire n'a pas d'étape, R6), puis la surprise de la semaine (3.3d) ;
  6. **le dimanche, ta phrase de la semaine**, avec ton curseur sur sa tension (3.3e ; pas d'étape les dimanches sans phrase, règle 18) ;
  7. la fin (2.7f), qui est un écran de l'application : « Jouer » et « Le texte et ses sources ».
- **La carte s'ouvre fermée et se retourne d'un toucher** (E10, maquettes) : c'est l'application qui l'anime, sur des données déjà complètes. Le temps de la révélation, la palette du soir.
- **Reprendre là où on l'avait laissée (E3).**
  - À chaque étape affichée, l'application envoie `POST /api/revelation/etape { etape }` (l'`id` de l'étape), et `'fin'` à l'écran 2.7f.
  - `reprise` rend la dernière étape vue. « Finir la révélation › » y reprend ; « Revoir la révélation › » reprend au début.
  - Les `id` sont opaques et stables du 18h au 18h suivant. Si l'étape a disparu (un départ, règle 4), le serveur donne la suivante.
- `POST /api/vu { objet: 'revelation', cercle: null }`, à l'ouverture : la première ouverture après 18h ne commence plus par la révélation. « Déjà vu » ne garde pas d'heure, et part au 18h suivant. Au même moment, le serveur ajoute 1 aux compteurs du jour `revelation_ouverte` et, si c'est le soir même, `revelation_ouverte_le_soir` : la mesure « révélation ouverte le soir même » est un total par jour, sans personne (D-066, point 4 ; « le soir » est à définir par Game design, partie 9).
- `POST /api/fiche { texte }` → `Fiche` (5.4) :
  - avant la révélation, le texte et ta réponse seulement, avec « Le vote et les auteurs : … à 18h », sans lien officiel ;
  - après, le vote, l'auteur, les quatre raisons et leurs députés, le lien du scrutin, et la ligne d'erratum s'il y en a une (règle 20 ; jamais pour une erreur d'étiquette, qui ne se montre pas) ;
  - un texte révélé s'ouvre depuis une révélation, l'historique, la surprise de la semaine ou l'écran d'un proche.

  **Erreurs** : `pas_encore_revele` (un texte ni révélé, ni servi au joueur), `introuvable`, `non_connecte`.

### 2.10 Le Cercle, l'écran d'un proche, les titres passés

- **Écrans** : 4.2, 4.3, 5.5, 1.15, 5.9, 5.13 (pour 4.2 et 5.5, voir 2.6).
- `POST /api/proche { cercle, membre }` → `Proche` (4.3) :
  - le visage et ses distinctions ;
  - les huit paires de curseurs, toi et lui superposés : d'abord les tensions où vous êtes nets tous les deux, puis les autres, dans l'ordre fixe. Ton curseur est ton portrait entier ; le sien, d'après ses réponses révélées (règle 19) ;
  - ses surprises, de la plus récente à la plus ancienne, avec « Tu pensais à {pseudo} », ou « un ancien membre » si la personne désignée a quitté le cercle (mots d'UX). L'écran en montre deux, puis « Voir tout ».

  Jamais un chiffre d'accord, un tri par écart, un nombre de surprises (D-010, question 2 ; maquette 4.3). **Erreurs** : `introuvable`, `non_connecte`.
- **Toucher son propre visage** ouvre son portrait, dans Moi (E3).
- **« Famille ▾ »** ouvre 5.6 (`GET /api/cercles`).

### 2.11 Moi : le portrait, les titres, l'historique

- **Écrans** : 4.1, 5.11, 5.2, 5.3.
- `GET /api/moi` → `Moi` (4.1, 5.11) :
  - ton pseudo ;
  - tes huit curseurs dans l'ordre de la règle 19 (nets d'abord, puis flous) ;
  - tous tes tempéraments, avec le nom du cercle pour L'Original et Le Pont (R9) ;
  - la barre (60 crans, visible de toi seul, D-026) ;
  - la ligne qui convient : celle de 5.11 tant que la barre n'est pas pleine et qu'aucun curseur n'est net ; « Ta barre est pleine. Ton portrait, lui, continue. » une fois, puis `POST /api/vu { objet: 'barre_pleine' }` ; « Tes curseurs se précisent à chaque réponse, chacun à son rythme. » ensuite, tant qu'aucun curseur n'est net (règle 18).
- `GET /api/moi/titres` → `MesTitres` (5.2) : tes tempéraments en tête, puis tes titres et badges, semaine par semaine, avec leur cercle. Sans total (R7).
- `GET /api/moi/historique` → `Historique` (5.3) :
  - tes réponses avec leur phrase du jour ;
  - les textes d'entrée sous « Pour commencer · {date} » (E6) ;
  - « Texte corrigé après ta réponse. » sous une réponse dont le texte est sorti des portraits (`corrige`, règle 20).

### 2.12 Réglages, droits, effacement : `GET /api/reglages`, `POST /api/message`, `GET /api/droits`, `POST /api/tout-effacer`, `POST /api/deconnexion`

- **Écrans** : 5.7, N6, N14, N15.
- `GET /api/reglages` → `Reglages` :
  - ton pseudo et ta voie (« Connecté avec Apple », mots d'UX). Jamais l'adresse e-mail : elle n'est pas gardée ;
  - tes cercles, chacun avec « Quitter » (2.6) ;
  - le message de 18h, de notre côté.
- `POST /api/message { actif }` : couper ou rallumer le message de 18h pour tous ses appareils (D-029). Si iOS a refusé l'accord, l'interrupteur renvoie aux Réglages de l'iPhone (mots de N10).
- `GET /api/droits` → `Droits` : les blancs de « Qui, durée, droits » (N6), `responsable`, `prenom` et `contact`, réglés par le porteur chez l'hébergeur, jamais écrits dans le dépôt. **Erreur** : `indisponible` tant qu'ils ne sont pas réglés ; un test refuse alors la mise en ligne. N6 est à compléter par Juridique pour l'application et TestFlight (partie 9).
- `POST /api/tout-effacer` : **envoyé** `EnvoiToutEffacer` ; **reçu** `ToutEfface` (`efface`, `voie`, `revoque`).
  - **La feuille d'Apple, pour un compte Apple.** Au toucher sur « Tout effacer » (N14), l'application ouvre la feuille d'Apple (Face ID). Elle envoie le code d'autorisation qu'elle rend, ou `apple: null` si le joueur l'a fermée.
  - **L'effacement d'abord**, en une transaction (P-33, P-38), immédiat et réel dans la base ; aucun message au cercle (D-045). Partent aussi ses abonnements au message et toutes ses sessions.
  - **La révocation ensuite** : le serveur échange le code chez Apple, demande la révocation, puis ne garde rien. Si Apple ne répond pas, ou sans code, `revoque` est faux, et N14 dit comment retirer Elenchos soi-même. Un échec chez Apple ne bloque jamais l'effacement.
  - **Pour Google**, le lien est coupé de notre côté seulement, comme D-061 l'avait arrêté pour le test : N14 dit comment le retirer chez Google.
  - **La règle 4 s'applique aux manches du jour** (J10) dans chacun de ses cercles :
    - une carte de l'effacé déjà servie mais pas encore révélée disparaît de la manche (elle ne compte ni juste ni fausse) ;
    - une carte où son visage était posé redevient vide, manche validée ou non, sans que la manche se rouvre ;
    - un titre de la semaine qu'il détenait disparaît avec son visage, et reste sous « un ancien membre » dans les titres passés, sauf Le Pas de Côté, effacé (D-066, point 1).
  - **L'avis du cercle ne compte plus ses réponses** : il n'est jamais gardé, il se calcule à chaque lecture sur les membres présents (règle 10, partie 3).
  - **Accepté en session provisoire** (« Effacer mes réponses », 2.5) : le joueur provisoire, ses réponses et son score sont effacés comme ceux d'un compte (P-38) ; le lien reste servi, pour qu'il ne s'ouvre pas à un autre (P-29).
  - L'application efface ensuite le jeton du trousseau.
- `POST /api/deconnexion` → `{ deconnecte: true }` : la session de cet appareil et son abonnement au message sont révoqués ; l'application efface le jeton du trousseau.
- **Refuser qu'on compte ses gestes** (droit d'opposition, promis par « Qui, durée, droits » ; D-066, point 3) : la base garde le refus (`mesures_refusees`, une ligne tant qu'il dure) et n'ajoute plus rien aux totaux pour ce joueur, quel que soit le module qui écrit (migration 0003 ; testé). Ce qui était déjà compté reste : un total anonyme ne se décompte pas (P-23). La route qui pose et retire le refus, et ses mots dans les Réglages, sont à écrire avec UX à l'étape 2 (partie 9).

### 2.13 Le message de 18h : `POST /api/abonnement`, le contenu, `POST /api/recu`

- **Écrans** : N10, 2.6, 3.1, 1.10.
- **L'accord d'iOS se demande au même moment qu'avant** : au compte à rebours (1.13, 2.5), après la révélation du défi, jamais avant, et seulement après un toucher sur « Recevoir le message de 18h » (N10). iOS donne alors un jeton d'appareil.
- `POST /api/abonnement { jeton }` → `{ abonne: true }`. L'abonnement est lié à la session de cet appareil. **Erreurs** : `abonnement_invalide`, `indisponible`, `non_connecte`. Le refus d'iOS se voit dans le téléphone : aucun échange. La variante « iPhone trop ancien » de N10 disparaît : tout iPhone qui installe l'application reçoit les messages.
- **Le contenu d'un message** est `MessageApns`, envoyé à Apple sans intermédiaire, signé par la clé du porteur (`DECISIONS-TECHNIQUES.md`, 1.13).
  - **Le message de 18h** prend un des six textes de `MESSAGES_18H` (E1, D-014). La forme dit ce qui attend vraiment, tous cercles confondus : des cartes dans un de ses cercles, sinon le vote d'un texte auquel il a répondu, sinon la question du jour. Le dimanche, s'il y a des titres dans un de ses cercles, il ajoute « Ce soir, aussi : les titres de la semaine. ». Liste fermée : un texte nouveau ne part pas sans son test (P-05).
  - **L'annonce d'arrivée** prend un des deux textes de `MESSAGES_ARRIVEE`, sans le score. Le texte avec le score (D-011) reste à l'écran.
  - **Apple peut lire le contenu d'un message** dans une application, contrairement au message web (P-06 ne s'applique plus). Les six textes de 18h ne disent rien de personnel. L'annonce d'arrivée porte un pseudo, sans aucune opinion : c'est l'exception de P-05, couverte par D-043. **À relire par Juridique.**
  - **Un toucher ouvre l'application**, qui demande `GET /api/etat` ; `revelationAOuvrir` y mène à la révélation.
- **En pause, le message continue** (D-029), sans rien dire de l'absence. Coupé dans les Réglages, il ne part plus (2.12).
- **Un jeton refusé par Apple** (application désinstallée) est retiré.
- **`POST /api/recu`** : envoyée par l'extension de l'application à la réception du message, sans session, avec le seul numéro d'envoi tiré au hasard ; réponse 204. L'heure de réception est celle du serveur. C'est la mesure « message reçu » (`produit.md` §8) : à l'envoi puis à la réception, le serveur ajoute 1 aux compteurs du jour `message_envoye` et `message_recu`, au nom du joueur de l'abonnement (pour exclure un refus). Les envois ne sont gardés en détail que 7 jours, puis seulement ces totaux (D-066, point 4). Si l'extension n'aboutit pas, on mesure seulement « ouvert depuis le message », par un geste ajouté alors au contrat, et on le dit au porteur.

### 2.14 Les pages web et les navigations

Toutes sur le domaine, ou sur l'adresse gratuite de l'hébergeur avant lui. Toutes sans cookie, sans rien chargé d'ailleurs (P-09), avec `Referrer-Policy: no-referrer`.

| Navigation | Ce qu'elle fait |
|---|---|
| `GET /` | N1, page publique : ce qu'est le jeu, « Pendant le test, on entre seulement par invitation. », le lien vers « Qui, durée, droits » |
| `GET /confidentialite` | « Qui, durée, droits » (N6), publié comme politique de confidentialité, que demande Apple ; mêmes blancs que `GET /api/droits` |
| `GET /invitation` | La page d'invitation (2.2) : sur iPhone, les trois gestes de TestFlight ; ailleurs, N2. Balises d'aperçu fixes, sans pseudo (1.1). `POST /api/compteur` ; jamais le jeton |
| `GET /.well-known/apple-app-site-association` | Le fichier d'association : il dit à iOS que `/invitation` s'ouvre dans l'application Elenchos |
| `POST /connexion/google/retour` | Le retour de Google, dans la feuille du système (2.5) ; répond par une redirection vers `elenchos://connexion#code=…` |

### 2.15 Les mesures

Les mesures portent sur des gestes, jamais sur ce que les joueurs répondent (D-041, P-39). Ce sont des totaux, que le porteur lit seul (D-052, P-21). Trois règles de D-066 :
- **compter au moment du geste**, en totaux par jour sans personne, plutôt que garder sous le joueur une colonne qui ne sert qu'à une mesure (point 4 ; `SORTES_COMPTEUR_SERVEUR`) ;
- **des joueurs distincts** : le seuil d'un total des mesures compte les joueurs qui y ont apporté, pas les apports ; un joueur qui apporte trente fois compte pour un (point 4 ; tenu par la base, migration 0003) ;
- **le refus** : un joueur qui a refusé qu'on compte ses gestes n'entre dans aucun total (point 3 ; 2.12).

- **Envoyées par l'application**, listes fermées, sans position, ni raison, ni tension :
  - `POST /api/geste { geste: 'cercle_pendant_deviner' }`, quand Le Cercle ou l'écran d'un proche s'ouvre pendant une manche pas encore validée (« Qui regarde Le Cercle pour deviner », `produit.md` §8). Le serveur vérifie qu'une manche est bien ouverte, et ajoute 1 au compteur du jour `cercle_pendant_deviner`, une fois par manche (le verrou `manche.cercle_regarde`) ;
  - `POST /api/duree-raison { secondes }`, à la validation de 2.4. Rangée aussitôt dans l'histogramme de la semaine, jamais sous l'identifiant du joueur, ni par texte (P-40) ;
  - `POST /api/compteur { sorte }`, sans session, depuis la page d'invitation ou l'application sur un iPad : `android`, `ordinateur`, `ipad`, `iphone_sans_application`. Ce dernier dit combien d'invités arrivent sans l'application, pour savoir combien vont au bout des gestes de TestFlight.
- **Tirées de la base par le serveur**, sans geste de plus. Celles marquées « proposé » viennent de `contenu-test.md` (partie 5, « Ce que le test mesure »), dont le périmètre est remplacé par D-062 : ce sont des mesures sur des gestes (usage 3), à ajouter à `produit.md` (section 8) ; les autres y sont déjà.
  - le retour à 7, 14 et 21 jours (proposé), et la part qui répond au moins cinq jours sur sept ;
  - les manches où un visage est posé (proposé), et la justesse comparée au hasard ;
  - le message reçu (compteurs du jour), et « a joué avant 18h le lendemain » (à tirer des envois avant leur effacement, à 7 jours) ;
  - la révélation ouverte le soir même (proposé ; compteurs du jour) ;
  - les invitations envoyées, et les cercles qui atteignent trois membres, en 7 jours (le délai est proposé) ;
  - l'entrée finie puis le compte créé, et la voie choisie ;
  - la première séance d'un invité, du lien au compte ;
  - la part des Mystère qui vont à un nouveau venu, les cercles encore actifs à deux mois ;
  - la part de « aucune » et les trois comptes de mi-bêta : **pas calculés pendant le test** (D-066, point 2 : avec 20 à 30 joueurs, le seuil de 30 n'est jamais atteint ; suspend D-027 et D-052, point 2, pour le test). Le serveur n'écrit ni `compte_aucune` ni ces sortes de `total_mesure` : un réglage du serveur, figé à faux (`COMPTES_DE_REGLAGE`, `src/base/totaux.ts`).
- **Comptées par le serveur**, au moment du geste, sans rien garder de la personne (`SORTES_COMPTEUR_SERVEUR`) : les réponses refusées après 18h et celles acceptées en retard ; la révélation ouverte, et ouverte le soir même ; Le Cercle regardé pendant Deviner ; le message envoyé, et reçu.
- Le rapport des totaux est un outil du porteur, hors de ce contrat (P-21).
- **Disparaissent** avec l'icône : le geste `ouverture_icone`, le compteur `hors_safari` et la mesure du geste d'ajout (`produit.md` §8).

### 2.16 Le relecteur d'Apple : un cercle inventé

Apple relit l'application avant les testeurs extérieurs, et demande un accès qui ne s'arrête pas (règle 2.1). Le relecteur ne doit jamais entrer dans un vrai cercle : il y verrait les opinions des amis du porteur (Juridique).

- **Le cercle de démonstration** est créé par un outil du serveur, geste du porteur. Il compte quatre membres inventés, sans compte, aux pseudos inventés. Leurs réponses d'entrée sont inventées.
- Chaque jour, un module du serveur fait répondre ces quatre membres au texte du jour, par un tirage fixe, et seulement dans ce cercle. Ce module ne touche que les cercles marqués « démonstration ». La marque ne se pose que par l'outil, jamais par une route.
- **Le lien de relecture** est une invitation venue d'un de ces membres inventés. Il sert plusieurs fois (plusieurs relecteurs, plusieurs relectures) et vaut 30 jours, dans ce seul cercle. C'est une **exception à D-006 (arbitrage 3 : un lien à usage unique, le lien réutilisable écarté) et à P-29 (une personne, une fois)**, arbitrée par l'équipe et bornée : il n'ouvre que le cercle de démonstration, aux membres et réponses inventés ; aucune donnée réelle n'en sort (D-065, point 3).
- Le relecteur suit le vrai parcours : carte, trois textes, défi, compte avec Apple, journée. Il n'a besoin ni de code fixe ni d'e-mail : la voie Apple n'attend pas le domaine.
- **Après la relecture**, le porteur efface son compte avec l'outil (ou le relecteur touche « Tout effacer »). Le cercle de démonstration n'entre dans aucune mesure.
- Ce qu'il faut écrire dans le formulaire d'Apple (notes de relecture, « What to Test ») : l'équipe le prépare à la fin de l'étape 2. Les consignes aux testeurs y demandent de ne jamais envoyer de capture qui montre des réponses (`testflight-juridique.md`, 1.4).

## 3. Avant et après 18h : l'heure du serveur

**Le jour de jeu** va de 18h à 18h, heure de Paris. Il porte le nom du jour où il finit : le « jour de jeu du jeudi » commence le mercredi à 18h et finit le jeudi à 18h (`regles.md`, section 2). Pendant ce jour de jeu, on devine les réponses au texte du mercredi et on répond au texte du jeudi. Le moteur numérote les jours de la même façon (`Jour`, `src/regles/types.ts` et `heure.ts`). Pour le texte du jour de jeu d, par exemple le texte du jeudi :
- il s'ouvre à 18h le jour civil d − 1 (mercredi) et se ferme à 18h le jour d (jeudi), ou à 18h10 pour une réponse en retard (R10) ;
- il se devine pendant le jour de jeu d + 1 et se révèle à sa fin, à 18h le jour d + 1 (vendredi ; lecture A, D-010).

Autrement dit, le texte qui s'ouvre à 18h le jour civil d est le texte du jour de jeu d + 1. L'historique écrit ce nom, comme la maquette validée 5.3 : « Jeudi 3 avril · … » puis « révélé vendredi à 18h ».

Ce qu'on voit « avant 18h » ou « après 18h » n'est donc qu'une question de jour de jeu, que seul le serveur connaît.

**Ce que reçoit l'application.** Chaque réponse porte `horloge` : l'heure du serveur (`instant`), le prochain 18h (`bascule`) et la `vitesse` (1 en ligne).

**Le compte à rebours.** L'application calcule le temps restant ainsi : `(bascule − instant) / vitesse`, moins le temps écoulé depuis la réception de la réponse, mesuré par l'horloge monotone (`performance.now()`). Elle ne lit jamais l'heure du téléphone pour le jeu (R10) : un téléphone mal réglé ou à l'étranger voit le même 18h que les autres.

**À zéro, l'application redemande.** Quand le compte à rebours arrive à zéro, et chaque fois qu'elle revient au premier plan, l'application appelle `GET /api/etat`. Elle ne change jamais d'elle-même ce qu'elle montre : c'est la nouvelle réponse qui dit que la révélation est là.

**Une demande à cheval sur 18h.** Le serveur juge l'heure à l'arrivée de la demande. Les tests rejouent 17:59:59 contre 18:00:00, puis 18:09:59 contre 18:10:00 (`regles.md`, journée J5).
- Un geste de Deviner reçu à 18:00:00 reçoit `manche_fermee` ; la manche se ferme telle qu'elle est, le brouillon compte (règle 10).
- Une réponse reçue à 18:00:00 est acceptée si l'écran Répondre de ce texte s'était affiché avant 18:00:00, jusqu'à 18:09:59 ; sinon, `texte_ferme`.

**Rien ne se calcule à 18h pile** (D-043). À 18h, le serveur ne fait que comparer l'heure et envoyer le message.
- **Les cartes** : chaque carte est jugée au moment du geste. Les cartes se tirent à l'ouverture de Deviner, parmi les réponses enregistrées avant 18h00 : une réponse en retard n'est jamais servie (règle 6).
- **L'avis du cercle n'est jamais gardé en base** : le serveur le calcule à chaque lecture de la révélation. Il part des réponses déchiffrées des membres actuels du cercle qui en étaient déjà membres à la fermeture du texte, à 18h00, réponses en retard comprises (règle 10). C'est le critère de la règle 8 pour les cartes et les visages : un texte se répond, se devine et se révèle entre les mêmes personnes. Un membre arrivé après la fermeture n'y entre donc pas, même s'il a répondu au texte dans un autre de ses cercles. Exemple : Hugo répond au texte dans « Famille », puis entre dans « Amis » avant la révélation ; sa réponse compte dans l'avis de « Famille », pas dans celui d'« Amis ». De même, un membre parti puis revenu entre comme un nouveau membre (règle 4) : ses réponses d'avant ne reviennent pas. Une arrivée ne change donc jamais l'avis d'un texte déjà fermé ; seul un départ peut encore le changer (règle 4). Arbitrage de l'équipe (D-062, point 5), qui précise « les membres actuels » de la règle 10. Dix réponses au plus : le calcul est immédiat, et il n'existe aucune donnée dérivée de plus à protéger ni à recalculer. Tests à écrire : le cas de Hugo ; un membre parti puis revenu avant la révélation.
- **La pause** se juge à 18h, sur les 7 derniers textes ; une réponse, même en retard, en sort. **Le sommeil** se juge à 18h, sur les membres hors pause ; le cercle se réveille au 18h suivant (règle 5).
- **Les titres, la surprise et les badges du dimanche** se calculent à la première lecture après 18h, avec un départage gardé (R6). **Les tempéraments** se calculent le dimanche, sur les réponses déjà révélées (lecture confirmée par Game design, partie 8). **Le Pas de Côté** se juge sur le curseur tel qu'il était juste avant la réponse, et s'annonce à la révélation de ce texte (règle 14).

**Un départ ou un effacement avant 18h** retire la carte du partant des manches ouvertes ou validées (elle ne compte ni juste ni fausse) et vide la carte où son visage était posé, avec la marque « vidée par un départ », qui ne compte pas contre Le Sans-Faute (règle 4, J10). C'est la base qui vide ces cartes, dans la transaction du départ, pas à 18h, « pourquoi » et verdict compris (`carte.videe_par_depart`, déclencheur `membre_avant_depart`, migration 0002 ; testé avant et après 18h). Ses réponses sortent d'elles-mêmes de l'avis du cercle, calculé à la lecture. Test à écrire à l'étape 2 : le traceur d'un joueur parti à 17h n'apparaît dans aucune révélation de ce cercle à 18h.

**Un départ après 18h** ne rouvre rien (D-067) : la carte d'une manche close où son visage était posé garde son verdict, écrit au geste, et son point ; elle ne perd que le visage. Un « jumeau » y devient « juste » (et « jumeau et raison », « juste et raison ») : la règle 11 les compte pareil partout, et sous un visage vide il dirait qu'un ancien membre avait donné la même réponse que l'auteur. C'est la base qui le fait, dans la transaction du départ (`membre_avant_depart` ; testé). Le hasard de la manche reste celui calculé avant le départ. **À la révélation et à « Revoir la révélation », cette carte ne montre plus le pari** : ni pseudo, ni « un ancien membre », ni « … avait répondu la même chose. » ; seulement son verdict et « C'était {auteur}. » (D-067 ; à tenir par le serveur à l'étape 2). Dans les deux cas, avant ou après 18h, ses badges Le Pas de Côté s'effacent (D-066, point 1), ce qu'il avait « déjà vu » dans ce cercle aussi, et le lien qui l'y avait fait entrer ne le désigne plus (2.6).

**Un texte corrigé** (règle 20) : le retrait des portraits, ou le recalcul d'une étiquette, se fait hors de 15h–19h et jamais le dimanche, comme une mise en ligne. Il peut être relancé sans changer le résultat.

**Les changements d'heure** ne regardent que le serveur. Une seule source les calcule : le moteur (`src/regles/heure.ts`, règle européenne), que l'horloge du serveur appelle (`src/serveur/horloge.ts`). La base place 18h avec la même convention (`fin_du_jour_de_jeu`, migration 0002). Les tests couvrent le 25 octobre 2026 et le 28 mars 2027, et comparent chaque heure de 2026 à 2028 à la base de fuseaux de Node, et chaque 18h de ces trois ans à celui de la base.

## 4. L'application : session, connexion, version (Front-end et Back-end)

*Cette partie remplace « Le code de passage vers l'icône » de la version de test : il n'y a plus d'icône à relier à Safari, et le code de passage disparaît avec elle.*

**La coquille.** L'application est une coquille Capacitor qui contient l'interface : les mêmes modules JavaScript, sans cadriciel, lus tels quels (`DECISIONS-TECHNIQUES.md`, 1.2). Elle ne charge rien depuis le serveur, sinon des données JSON. Elle s'ouvre même sans réseau. Quelques petits morceaux écrits en Swift font ce que le web ne peut pas faire :
- le trousseau ;
- la feuille d'Apple ;
- la feuille du système pour Google ;
- le message de 18h ;
- l'extension qui signale la réception ;
- la lecture du numéro de fabrication et du type d'appareil.

**Pourquoi un jeton et non un cookie.** Dans l'application, la page et le serveur n'ont pas la même adresse. iOS y bloque les cookies d'un autre site (de mémoire, à vérifier à l'étape 1). Un jeton dans le trousseau tient P-11 (le téléphone ne garde que lui) et P-41 (il s'arrête à la déconnexion, puisque la base le connaît). Le trousseau n'est lisible que par l'application, et pas par la page d'un autre site.

**Les adresses reçues par l'application.** Deux seulement :
- le lien universel `https://…/invitation#lien=…` ;
- le retour de Google `elenchos://connexion#code=…`, que la feuille du système rend à la seule application qui l'a ouverte.

Toute autre adresse est ignorée. L'application ne garde ni l'une ni l'autre.

**La version.** Le numéro de version reste « 1.0 » pendant tout le test ; seul le numéro de fabrication monte, à chaque fabrication. Le serveur le lit dans `Elenchos-Fabrication` et annonce `fabricationMinimale` (1.7). Une fabrication n'est proposée aux testeurs ni de 15h à 19h, ni le dimanche, et ne se fait que depuis la branche `mise-en-ligne`, après le feu vert du porteur la veille (D-043, D-054 ; `DECISIONS-TECHNIQUES.md`, 1.15).

**Ce qui disparaît avec l'icône** (plan de D-064, `docs/etape-6/plan-jeu-entier.md`) :
- le code de passage, `POST /api/passage` et `POST /api/passage/echanger`, et l'erreur `passage_refuse` ;
- les écrans N3, N8, N9 et N11 ;
- le geste `ouverture_icone` et le compteur `hors_safari` ;
- le manifeste, le service de réception web et le chiffrement du message web ;
- le rechargement sur changement de `version`, remplacé par la version minimale ;
- le plancher d'iOS 16.4, remplacé par celui de Capacitor (iOS 15 environ, de mémoire, à confirmer à l'étape 1).

## 5. Le développement local : connexion d'essai, horloge accélérée, proches simulés

**Le principe** : deux réglages dangereux, qui n'existent qu'en local, refusés en ligne de trois façons, comme `IGNORER_HORAIRES` du test de 18h :
1. le serveur **refuse de démarrer** si l'un d'eux est présent dans un environnement protégé (hébergeur, GitHub : les marqueurs de `garde-horaires.ts`) ;
2. les routes `/dev/` ne sont **montées qu'en local** ; en ligne, elles répondent `introuvable`, comme une adresse qui n'existe pas ;
3. un **test** le vérifie dans la configuration en ligne.

**La connexion d'essai par code** (`POST /dev/connexion { code }`) rend le jeton d'un joueur inventé de la base locale. Elle sert aux tests de bout en bout (quatre joueurs dans Chromium, la page embarquée servie en local) et aux captures. Le porteur se connecte avec ses propres comptes (D-059, point 1).

**L'horloge accélérée** (`POST /dev/horloge`). À la vitesse 168, une semaine de jeu passe en une heure. `POST /dev/horloge` saute à `bascule`, à `dix_secondes_avant` ou au prochain `dimanche_bascule`. En local, aucun message ne part vers Apple. Le serveur déclare l'heure de son horloge à la base dans chaque transaction (`elenchos.instant`) : « rien avant 18h » et les départs, que la base juge aussi, suivent l'horloge accélérée.

**L'adresse du serveur dans l'application** est fixée à la fabrication. Une fabrication pour TestFlight ne connaît que l'adresse en ligne ; un test refuse une fabrication qui viserait une autre adresse.

**Les proches simulés** : un outil remplit la base locale de joueurs inventés (adresses au domaine réservé `exemple.invalid`) qui répondent et devinent, pour jouer seul trois mois accélérés (étape 3, « un cercle vieux de trois mois »). Il refuse de tourner en ligne (P-19). Le module du cercle de démonstration (2.16) est un autre module, limité aux cercles marqués « démonstration ».

## 6. Les erreurs

| Code | Statut | Quand | Ce que fait l'application |
|---|---|---|---|
| `requete_invalide` | 400 | corps illisible, champ en trop, valeur hors liste | message neutre « Ça n'a pas marché » ; c'est un défaut du code |
| `non_connecte` | 401 | route qui demande une session ; jeton absent, inconnu ou échu | efface le jeton du trousseau s'il est refusé, puis `GET /api/etat` et l'écran qui convient |
| `origine_refusee` | 403 | demande d'un navigateur venue d'ailleurs | message neutre |
| `introuvable` | 404 | route inconnue ; route `/dev/` en ligne ; cercle, membre ou texte que le joueur ne connaît pas | message neutre |
| `mise_a_jour_requise` | 426 | fabrication sous `fabricationMinimale` | l'écran de mise à jour |
| `etape_incorrecte`, `accord_perime` | 409 | la demande ne correspond plus à l'étape du joueur (deux appareils, retour arrière) | `GET /api/etat`, puis l'écran qui convient |
| `accord_requis` | 409 | réponse sans accord, ou nouvelle version de la carte | la carte (`GET /api/accord`) |
| `texte_ferme`, `manche_fermee` | 409 | 18h (ou 18h10) est passé | le refus après 18h (2.8), puis « Continuer » : `GET /api/etat` |
| `rien_a_reveler`, `rien_a_deviner` | 409 | il n'y a rien | `GET /api/etat` |
| `pas_encore_revele` | 409 | fiche d'un texte ni révélé ni servi | message neutre |
| `deja_repondu`, `deja_validee` | 409 | geste déjà fait (deux appareils, renvoi) | `GET /api/aujourdhui` |
| `carte_inconnue`, `visage_non_propose`, `visage_deja_pose`, `pourquoi_sans_visage` | 409 | geste impossible sur la manche | `GET /api/aujourdhui` ; l'écran ne doit pas permettre ces gestes |
| `lien_expire`, `lien_deja_servi` | 410 | pendant le défi | N13 ou 5.14 |
| `connexion_expiree` | 410 | connexion commencée il y a plus de 10 minutes, ou code de retour de plus d'une minute | retour à 1.8, sans message d'erreur (mots d'UX, `A_ECRIRE`) |
| `cercle_complet`, `trois_cercles` | 409 | invitation à dix membres ; quatrième cercle | N15 ; écran Rejoindre ou 5.6 |
| `pseudo_pris`, `pseudo_invalide`, `nom_invalide`, `adresse_invalide`, `code_faux`, `code_expire`, `abonnement_invalide` | 422 | saisie refusée | message sous le champ (mots : UX ; N7 pour le pseudo ; `code_faux`, « Ce n'est pas le bon code. Vérifie les six chiffres. » ; `code_expire`, « Ce code a expiré. Demande un nouveau code. ») |
| `trop_essais`, `trop_de_codes`, `trop_de_demandes` | 429 | limiteur | message fixe, sans durée variable : `trop_essais`, « Trop d'essais. Demande un nouveau code. » ; `trop_de_codes`, « Trop de codes demandés pour cette adresse. Réessaie dans un quart d'heure. » ; `trop_de_demandes`, message générique (`A_ECRIRE`, UX) |
| `erreur_serveur` | 500 | défaut du serveur | message neutre ; rien de personnel dans le journal (P-07) |
| `indisponible` | 503 | fonction coupée faute de réglage | le bouton de la voie e-mail n'apparaît pas ; le bloc N10 non plus (`Etat.message.disponible`) |

Le corps d'une erreur ne contient que son code : jamais de message, de valeur reçue, ni de trace (P-07).

## 7. Index : chaque écran et son échange

*Les 51 écrans validés (maquettes finales, D-014), tous dans le jeu entier, puis les écrans et textes nouveaux : N1 à N18 (`docs/etape-6/contenu-test.md`, annexe, D-061), les mots d'UX de la phase 0 et ceux que l'application demande. Aucun écran validé n'est retiré.*

**Les 51 écrans validés**

| Écran | Échange | Type reçu |
|---|---|---|
| 1.1 Le message de Thomas | aucun : Thomas l'envoie lui-même par la feuille de partage ; l'aperçu du lien vient des balises fixes de `GET /invitation`, sans pseudo | — |
| 1.2 Premier texte : la position | `POST /api/lien` (texte 1), `GET /api/entree` (textes 2, 3) ; réponse reprise pour un joueur inscrit | `LienOuvert`, `Entree` |
| 1.3 Carte de consentement | `GET /api/accord`, `POST /api/accord` | `CarteAccord`, `AccordEnregistre` |
| 1.4 Premier texte : la raison | les raisons viennent avec le texte ; rien n'est envoyé | `TexteARepondre` |
| 1.5 « Et Thomas ? » | `POST /api/entree/repondre` (réponse et pari) | — |
| 1.6 Révélation immédiate | réponse du même `POST` | `RevelationEntree` |
| 1.7 Bilan d'entrée | `GET /api/entree/bilan` (score ou surprises, curseurs, barre) | `BilanEntree` |
| 1.8 Compte : pseudo et voie | `GET /api/compte`, `POST /api/compte/pseudo`, `POST /api/connexion/debut`, `/apple`, `/echanger` ; « Effacer mes réponses » : `POST /api/tout-effacer` | `EcranCompte`, `DebutConnexion`, `ResultatConnexion` |
| 1.9 Compte : le code | `POST /api/compte/email`, `POST /api/compte/code` | `ResultatConnexion` |
| 1.10 Ce que reçoit Thomas | message d'arrivée sans score ; `Etat.annonces` avec score ; `POST /api/vu` (`annonces`) | `MessageApns`, `AnnonceArrivee` |
| 1.11 Thomas devine Marie | `GET /api/miroir`, `POST /api/miroir/parier` | `Miroir`, `MiroirRevele` |
| 1.12 Aujourd'hui : rien à deviner | `GET /api/aujourdhui` (`repondre`, `rienADeviner`) ; `POST /api/vu` (`arrivee`) | `Aujourdhui` |
| 1.13 En attendant (cercle incomplet) | `GET /api/aujourdhui` (`en_attendant`, bandeau) ; bloc N10 | `Aujourdhui` |
| 1.14 Inviter | `POST /api/inviter/voir`, `POST /api/inviter` ; feuille de partage | `EcranInviter`, `LienCree` |
| 1.15 Le Cercle, le soir : Hugo arrive | `POST /api/cercle/voir` (bandeau `cercle_lance`) ; `POST /api/vu` (`cercle_lance`) | `Cercle` |
| 2.1 Aujourd'hui : Deviner | `GET /api/aujourdhui` ; `POST /api/deviner/ouvrir`, `/poser`, `/passer`, `/valider` | `Aujourdhui` |
| 2.2 Feuille « Devine aussi pourquoi » | `raisonsHier` ; `POST /api/deviner/pourquoi` | `Aujourdhui` |
| 2.3 Répondre : la position | `GET /api/aujourdhui` (`repondre`) ; `POST /api/repondre/ouvrir` | `Aujourdhui` |
| 2.4 Répondre : la raison | `POST /api/repondre` ; `POST /api/duree-raison` | `ReponseFaite` |
| 2.5 En attendant 18h | `GET /api/aujourdhui` (`en_attendant`) ; « Voir mon portrait » → 4.1 ; bloc N10 | `Aujourdhui` |
| 2.6 Le message de 18h | message de 18h ; `POST /api/recu` (extension) | `MessageApns` |
| 2.7a à 2.7c Attributions | `GET /api/revelation` (étapes `attribution`, points sur la dernière) ; `POST /api/revelation/etape` | `Revelation` |
| 2.7d Le vote | étape `vote`, avec l'avis de chaque cercle | `Revelation` |
| 2.7e Les auteurs | étape `auteurs` | `Revelation` |
| 2.7f Fin | `POST /api/revelation/etape` (`fin`) ; « Le texte et ses sources » : `POST /api/fiche` | — |
| 3.1 Le message de 18h du dimanche | message de 18h, forme du dimanche | `MessageApns` |
| 3.2 Badge rare | étape `badge` | `Revelation` |
| 3.3a Le Devin | étape `titre` | `Revelation` |
| 3.3b Le Mystère | étape `titre` | `Revelation` |
| 3.3c Le Fidèle | étape `titre` | `Revelation` |
| 3.3d La surprise de la semaine | étape `surprise_semaine` ; « Voir le texte » : `POST /api/fiche` | `Revelation`, `Fiche` |
| 3.3e Ta phrase de la semaine | étape `phrase_semaine` | `Revelation` |
| 4.1 Moi : mon portrait | `GET /api/moi` | `Moi` |
| 4.2 Le Cercle | `POST /api/cercle/voir` ; « Famille ▾ » : `GET /api/cercles` ; `POST /api/geste` | `Cercle`, `MesCercles` |
| 4.3 L'écran d'un proche | `POST /api/proche` ; `POST /api/geste` | `Proche` |
| 5.1 Nommer le cercle | `POST /api/cercle` (premier cercle, ou depuis 5.6) | `{ cercle }` |
| 5.2 Moi : mes titres | `GET /api/moi/titres` | `MesTitres` |
| 5.3 Moi : historique | `GET /api/moi/historique` | `Historique` |
| 5.4 Fiche d'un texte | `POST /api/fiche` | `Fiche` |
| 5.5 Le Cercle : titres passés | `POST /api/cercle/titres` | `TitresPasses` |
| 5.6 Changer de cercle | `GET /api/cercles` ; « + Créer un cercle » → 5.1 | `MesCercles` |
| 5.7 Réglages | `GET /api/reglages`, `POST /api/message`, `GET /api/droits`, `POST /api/cercle/quitter`, `POST /api/tout-effacer`, `POST /api/deconnexion` | `Reglages`, `Droits`, `ToutEfface` |
| 5.8 Deviner avec deux cercles | `GET /api/aujourdhui` (manche avec cercle, rang, total ; `Repere.cercles`) | `Aujourdhui` |
| 5.9 Le Cercle, quand il dort | `POST /api/cercle/voir` (bandeau `cercle_incomplet`) | `Cercle` |
| 5.10 Aujourd'hui, quand le cercle dort | `GET /api/aujourdhui` (bandeau, « Nouveau texte dans … ») | `Aujourdhui` |
| 5.11 Portrait pas encore formé | `GET /api/moi` (`ligne: 'pas_encore_forme'`) | `Moi` |
| 5.12 Personne n'a répondu hier | `GET /api/aujourdhui` (`rienADeviner: 'aujourd_hui'`, repère `rien`) | `Aujourdhui` |
| 5.13 Cercle incomplet au départ | bandeau de `Aujourdhui` et de `Cercle` | — |
| 5.14 Lien déjà utilisé | `POST /api/lien` (`deja_servi`) | `LienOuvert` |

**Les écrans et textes nouveaux** (sort pour le jeu entier dans l'application)

| Écran | Sort | Échange | Type reçu |
|---|---|---|---|
| N1 Sans invitation | gardé, en deux variantes (UX) : la page publique `GET /`, et l'application ouverte sans session ni lien, qui dit aussi de toucher à nouveau le lien reçu | `GET /api/etat` (`dehors`) ; « J'ai déjà un compte » : `GET /api/compte` | `Etat`, `EcranCompte` |
| N2 Hors iPhone | gardé : page d'invitation sur Android, ordinateur, iPad ; variante dans l'application ouverte sur un iPad ou un Mac | `POST /api/compteur` | — |
| N3 Hors Safari | **retiré** | — | — |
| N4 Mention IA | gardé | mot fixe, sous chaque texte et sur la fiche | — |
| N5 Carte, version de test | gardé (D-061) | `GET /api/accord` | `CarteAccord` |
| N6 « Qui, durée, droits » | gardé, à compléter par Juridique (partie 9) ; dans l'application et à `/confidentialite` | ses blancs : `GET /api/droits` | `Droits` |
| N7 Compte | gardé ; « Continuer avec Apple » ouvre la feuille d'Apple, « Continuer avec Google » la feuille du système | comme 1.8 | `EcranCompte` |
| N8 Bloc et guide de l'icône | **retiré** | — | — |
| N9 Première ouverture de l'icône | **retiré** | — | — |
| N10 Le message de 18h | réécrit par UX : sans la variante « iPhone trop ancien » | `Etat.message.disponible` ; `POST /api/abonnement` | — |
| N11 Bandeau dans Safari | **retiré** | — | — |
| N12 Déjà dans un cercle | réécrit par UX : déjà membre de ce cercle ; trois cercles | `LienOuvert` (`deja_membre`, `trois_cercles`), `EcranRejoindre.obstacle` | `LienOuvert`, `EcranRejoindre` |
| N13 Lien qui ne marche plus | gardé (avec {pseudo}) ; variante sans invitant pour un lien de créateur (`A_ECRIRE`) | `LienOuvert` (`expire`, `deja_servi`, `inconnu`) | `LienOuvert` |
| N14 Tout effacer | réécrit par UX : la feuille d'Apple à la confirmation ; le texte d'après selon `voie` et `revoque` | `POST /api/tout-effacer` | `ToutEfface` |
| N15 Cercle complet | gardé, deux moments | `LienOuvert` (`complet`), `EcranCompte.cercleComplet`, `EcranRejoindre.obstacle` | `LienOuvert`, `EcranCompte` |
| N16 Entrée du créateur | gardé | `LienOuvert`, `Entree` (`createur`), `BilanEntree` | — |
| N17 Message du porteur au créateur | réécrit par UX : le lien public TestFlight, puis le lien de créateur ; plus « Ouvre ce lien dans Safari » | aucun | — |
| N18 Pas de réseau | gardé ; l'écran entier sert aussi quand l'application s'ouvre sans réseau | aucun : renvoi du geste au retour du réseau (1.7) | — |
| Vue de secours | gardé | aucun | — |
| Refus après 18h | gardé ; vaut après 18h10, ou dès 18h si Répondre ne s'était pas affiché | `texte_ferme`, `manche_fermee` | — |
| Ligne de l'écran Inviter | gardé | mot fixe | — |
| Mise à jour requise | **nouveau** (`A_ECRIRE`) : « Mets à jour Elenchos dans TestFlight » | `fabricationMinimale`, `mise_a_jour_requise` | — |
| Page d'invitation, sans l'application | **nouveau** (`A_ECRIRE`) : installer TestFlight, installer Elenchos, revenir toucher le lien | `GET /invitation` ; `POST /api/compteur` (`iphone_sans_application`) | — |
| Défi d'un joueur inscrit | **nouveau** (`A_ECRIRE`) : la réponse reprise ; la ligne « Défi de {pseudo} à finir › » | `Entree.reprise`, `Etat.defi` | `Entree`, `Etat` |
| Rejoindre un cercle | **nouveau** (`A_ECRIRE`) : garder ou changer son pseudo (règle 15), obstacles | `GET /api/rejoindre`, `POST /api/rejoindre` | `EcranRejoindre` |
| Quitter un cercle | **nouveau** (mots de 5.7 à reprendre) ; 5.1 quand il ne reste aucun cercle | `POST /api/cercle/quitter` | — |
| Réponse en retard acceptée | **nouveau** (`A_ECRIRE`) : la phrase du jour, puis « Continuer » vers la révélation | `ReponseFaite.enRetard` | `ReponseFaite` |
| « Rien à deviner dans {nom} aujourd'hui » | **nouveau** (mots de la maquette 5.8) | `Repere.cercles` (`rien`) | `Aujourdhui` |
| Un ancien membre, sur l'écran d'un proche | **nouveau** (`A_ECRIRE`) : « Tu pensais à un ancien membre » | `SurpriseProche.tuPensais` null | `Proche` |
| Connexion expirée | **nouveau** (`A_ECRIRE`) | `connexion_expiree` | — |

## 8. Ce que ce contrat touche

**Ce qu'il applique, sans rien décider** :
- **D-062, point 1** : le jeu entier. Reviennent donc, tels que validés, les éléments que D-058 avait mis de côté :
  - jusqu'à trois cercles (règles 3 et 15, R8) ;
  - la pause et le sommeil (règle 5, D-029) ;
  - « Quitter un cercle », distinct de « Tout effacer » (règle 4, P-37) ;
  - la surprise de la semaine, les tempéraments, les badges rares, les titres passés et « un ancien membre » (règles 12 à 14, D-045 point 2) ;
  - le portrait et la phrase du dimanche (règles 16 à 19, R2) ;
  - les cartes les plus inattendues (R3) et le retard jusqu'à 18h10 (R10) ;
  - l'écran d'un proche (D-010, question 2) ;
  - le texte corrigé (règle 20).

  L'allègement d'E3 signalé avec D-060 tombe : la révélation reprend là où on l'avait laissée. « Un ancien membre » (D-045, point 2) revient : dans les titres passés, sur l'écran d'un proche, et dans les mots de N14 et de « Quitter ».
- **D-062, point 2, et le plan de D-064** : l'application et TestFlight remplacent le lien et l'icône (D-057 point 1, D-005). Disparaissent donc la partie 4 de la version de test (code de passage), N3, N8, N9, N11, le geste et le compteur de l'icône, et la mesure du geste d'ajout (`produit.md` §8). Le critère de D-005 tombe avec l'icône (plan). La mesure « message reçu » est gardée.
- **D-061 et D-063 restent** : la carte (N5), tout effacé à la fin du test, pas de mention d'avocat ; aucune route ni aucun réglage de ce contrat n'engage de dépense.

**Un arbitrage de l'équipe déjà dit au porteur avec le plan** (`plan-jeu-entier.md`, « Ce que l'équipe a tranché seule ») : **« Tout effacer » révoque la connexion chez Apple** (2.12). Il rétablit en partie D-035, règle 5, et P-38, que l'arbitrage de D-061 allégeait. Pour Google, l'allègement de D-061 reste (le lien coupé de notre côté seulement) : la révocation chez Google demanderait de garder un jeton de Google, ou de faire repasser le joueur par Google. À dire en une ligne au point d'étape. D-064 ne cite pas cet arbitrage ; il était dans le plan validé.

**Sept lectures, tranchées à l'étape 1** (par Game design, ou par l'équipe au titre de D-062 point 5), à dire au porteur ; les quatre qui touchent la lettre d'une décision validée sont consignées dans D-065, renversables :
1. **Les tempéraments vus par le cercle se calculent sur les réponses déjà révélées** (1.4, 3). La règle 13 les calcule le dimanche « sur les 56 derniers jours de jeu ». Lue à la lettre, la fenêtre compterait la réponse au texte du dimanche, qui ne se révèle que le lundi. Un tempérament gagné ou perdu le dimanche à 18h pourrait alors trahir cette réponse (même raison que la lecture A, règle 19, P-27 a). La fenêtre s'arrête au dernier texte révélé. Aucun seuil ne change. **Confirmée par Game design.**
2. **Un seul trio de textes d'entrée pour tous les cercles, pendant le test** (`FORMAT.md`, partie 3). C'est une **suspension, pour le test, de `onboarding.md` et de la règle 15** (trois textes fixés par cercle), retenue par Game design et arbitrée par l'équipe (D-065, point 2) ; `contenu-test.md` (partie 8) la rangeait déjà parmi les décisions touchées. Avec elle, les textes d'entrée d'un second cercle sont ceux de son créateur (2.6), et un joueur inscrit qui rejoint un autre cercle n'a rien à redonner : ses trois réponses sont reprises (règle 15). Prix : sa barre n'avance pas pendant ce défi, et l'exemple de la règle 15 (une réponse reprise sur trois) ne peut pas se produire. **À rétablir pour la version publique** (quelques trios en rotation ; le format les porte déjà).
3. **Les textes d'entrée d'un cercle créé par un joueur déjà inscrit** sont ceux de sa propre entrée (2.6). Aucune règle ne le disait. La maquette 5.6 mène de « + Créer un cercle » directement à 5.1, sans nouveau défi. **Confirmée par Game design.**
4. **La ligne de 5.11** (« … Il faut environ trois mois pour les premiers curseurs nets. ») ne s'affiche que si aucun curseur n'est net (2.11). Elle serait fausse chez qui a déjà un curseur net avant 60 réponses, comme la phrase de la règle 18 que D-052 a précisée pour le même motif. Le point ouvert de la version de test sur 5.11 (couper la seconde phrase) tombe : le jeu entier montre les curseurs. **Confirmée par Game design** (UX garde les mots).
5. **Le cercle de démonstration** (2.16) fait répondre des membres inventés, en ligne, dans ce seul cercle. Il mêle des données inventées à la base réelle : c'est une exception écrite au principe de P-19 (une base est « inventée » ou « réelle » ; P-19 et P-20 sont allégés pour le test, signalé avec D-060), bornée par la marque « démonstration ». Une ligne P-19 a est à ajouter à `donnees.md`. Son **lien de relecture**, réutilisable 30 jours, est une **exception à D-006 (arbitrage 3) et à P-29** (D-065, point 3 ; 2.16).
6. **Un proche partagé sans réponse n'est proposé que dans une seule de mes manches du jour** (2.8 ; lecture A2 de Game design, R8). C'est la **troisième exception à D-011** (« tous les autres membres sont proposés »), fidèle à son but : ne jamais montrer qui n'a pas répondu (D-065, point 1, reportée dans `produit.md` et `regles.md`, règle 3).
7. **L'avis du cercle ne compte que les membres déjà présents à la fermeture du texte** (partie 3), comme la règle 8 pour les cartes et les visages. Back-end proposait « arrivés avant la révélation » ; Game design a retenu la variante du Vérificateur : un membre arrivé entre la fermeture et la révélation n'a pu ni répondre dans ce cercle ni être deviné, et sa réponse, donnée quand ce cercle n'était pas son public, ne doit pas y entrer (cas de Hugo, partie 3). Précise « les membres actuels » de la règle 10 (D-052). **Tranché : D-065, point 4**, reporté dans `regles.md`, règle 10.

**Quatre arbitrages de l'équipe sur les données du test, sur avis de Juridique** (D-066, renversables), appliqués dans la base :
1. **Le Pas de Côté est effacé** quand son titulaire quitte le cercle ou efface tout, au lieu de rester sous « un ancien membre » (modifie, pour ce seul badge, D-045 point 2 et la règle 14) : 2.6, 2.12, partie 3.
2. **La part de « aucune » et les trois comptes de mi-bêta ne sont pas calculés pendant le test** (suspend D-027 et D-052, point 2) : 2.15.
3. **Le refus des mesures** est gardé par la base, et les totaux l'excluent : 2.12, 2.15.
4. **Les mesures se comptent au moment du geste**, sans heure gardée sous la personne ; les envois ne sont gardés en détail que 7 jours ; les seuils comptent des joueurs distincts : 2.9, 2.13, 2.15.

**Un arbitrage de l'équipe, lecture de Game design sur une proposition de Juridique et de Back-end** (D-067, renversable) : quand un membre part après 18h, une carte close où son visage était posé garde son verdict et son point, un « jumeau » y devient « juste », et la révélation ne montre plus le pari (partie 3). Touche la lettre de D-024 (« la révélation le dit ») pour ce seul cas.

Et deux précisions de Juridique, sans décision touchée : le lien d'invitation ne fait lire l'invité que 7 jours après sa liaison et ne le désigne plus après son départ (P-25, P-29 ; 2.6) ; la lecture du dimanche n'est gardée qu'en une ligne par joueur (règle 18).

**Ce qui précise une proposition, sans toucher une décision du porteur** :
- **P-11, P-41** : la session est un jeton dans le trousseau, révoqué à la déconnexion. Même exigence tenue.
- **P-08** : les jetons de lien et le code de retour de Google suivent la règle du « # » ; le code de Google revient par formulaire (2.5).
- **P-06** ne s'applique plus : Apple peut lire le contenu d'un message (2.13). P-05 tient : rien de personnel, sauf le pseudo de l'annonce d'arrivée, à relire par Juridique.
- **P-29** : le lien se lie au joueur, provisoire ou inscrit, à sa première réponse enregistrée.
- **P-37** : quitter un cercle suit la règle 4 dans ce cercle seulement.
- **P-40** : la durée de l'écran de la raison va droit dans un histogramme de la semaine.
- **D-045, point 1, et P-30** (effacement après 12 mois, e-mail 30 jours avant ; compte devenu inaccessible) : non construits pour le test, car sans objet : tout est effacé à la fin (D-061, point 2 ; plan). Ils reviennent à la deuxième version.
- **Le lien de créateur et le lien de relecture** sont des éléments nouveaux, fabriqués par le porteur avec un outil du serveur (P-42 : l'outil ne montre rien). Ce sont des gestes de son pas-à-pas.
- **Un compte retrouvé depuis un défi** se fond avec le joueur provisoire (2.5) ; la réponse la plus ancienne reste définitive (règle 7).
- **Les sessions** : une ligne « session (jeton gardé dans le trousseau, empreinte seulement en base) » est **à ajouter** à la carte des données (`donnees.md`, partie 4), qui n'en a pas encore. S'y ajoutent l'abonnement par appareil, la connexion en cours (10 minutes), le code de retour (une minute) et la note « écran Répondre affiché » (jusqu'à la fermeture du texte). La carte du code (`jeu/src/base/carte.ts`) fait foi en attendant ; Back-end et Juridique reportent ses lignes dans `donnees.md`.
- **`TENSIONS`** : la forme courte de l'essai (« local et national ») est remplacée par le libellé unique de E2 sans article (« décision locale et décision nationale »). C'est la lettre de `regles.md` (J9) et de E2 ; l'écart avait été relevé par le moteur de règles.

## 9. Points ouverts

1. **À vérifier au tout début de l'étape 1** (de mémoire) :
   - un lien universel passe-t-il le « # » à l'application ?
   - Google accepte-t-il le retour par formulaire dans la feuille du système ?
   - iOS bloque-t-il les cookies dans l'application (ce qui justifie le jeton, sans le rendre nécessaire) ?
   - le plancher d'iOS de Capacitor ;
   - le service de production d'Apple pour TestFlight ;
   - la révocation chez Apple demande-t-elle une clé « Se connecter avec Apple » (la même que celle des messages, ou une seconde) ?
2. **Un réglage de plus pour le porteur, sans frais** : la clé qui permet de révoquer la connexion chez Apple, si elle n'est pas celle des messages. Elle entre dans le pas-à-pas de l'étape 1.
3. **Les mots encore à écrire par UX** (`A_ECRIRE`) :
   - la mise à jour requise et la page d'invitation sans l'application ;
   - N1 dans l'application ; N10 sans sa variante ; N12 ; N14 avec la feuille d'Apple ; N17 ;
   - le défi d'un joueur inscrit, l'écran Rejoindre et la ligne « Défi … à finir » ;
   - quitter un cercle (5.7, avec « un ancien membre »), et 5.1 sans cercle ;
   - la réponse en retard acceptée ;
   - « un ancien membre » sur l'écran d'un proche et dans les titres passés ;
   - la connexion expirée, `compte_inconnu`, `connexion_echouee`, `trop_de_demandes` ;
   - « Connecté avec Apple » dans les Réglages ;
   - N13 sans invitant ; « Effacer mes réponses » et sa confirmation.
4. **N6 à compléter par Juridique** : les ajouts de `testflight-juridique.md` (1.6), la révocation chez Apple, l'iPad, la voie Google par la feuille du système, et la publication à `/confidentialite`. Juridique relit aussi `MESSAGES_ARRIVEE`, désormais lisible par Apple.
5. **Les sept lectures de la partie 8** sont tranchées ; reste à les dire au porteur au point d'étape (D-065), avec les quatre arbitrages de D-066 et celui de D-067.
6. **Les durées proposées** : connexion en cours 10 minutes ; code de retour une minute ; code e-mail 15 minutes, sa ligne gardée 24 heures ; lien de créateur 7 jours ; lien de relecture 30 jours ; joueur provisoire 7 jours ; lien lié lisible par l'invité 7 jours ; score d'entrée effacé à la lecture de l'annonce, 7 jours au plus après la liaison ; envois 7 jours ; comptes de la semaine et par texte, la semaine en cours et la précédente ; sessions jamais au-delà de la fin du test. Toutes sont tenues par le ménage quotidien (`src/base/menage.ts`, P-31), écrit et testé ; reste à le brancher sur le planificateur (étape 2), avant la première vraie invitation.
7. **La feuille de Google, partagée ou privée** : partagée, elle reprend la session Google de Safari mais iOS demande d'abord un accord ; privée, il faut retaper son mot de passe Google. À trancher par UX et Front-end à l'étape 2.
8. **`GET /api/droits`** : les trois blancs de N6 sont des réglages du serveur, pour ne pas les écrire dans le dépôt public. À confirmer par Juridique.
9. **Le jour écrit entre 18h et minuit.** L'en-tête « Aujourd'hui · … » donne le jour civil (`Aujourdhui.jour`) : le mercredi à 20h, « mercredi ». Le texte auquel on répond ce soir-là est pourtant celui du jeudi (partie 3), et l'historique l'écrira « Jeudi 3 avril » (maquette 5.3). À confirmer par UX à l'étape 2 ; le serveur suivra ce choix.
10. **Trois points nés de la relecture de Juridique (D-066, D-067)** :
   - **à définir par Game design** : le « soir même » du compteur `revelation_ouverte_le_soir` (2.9). Le « jumeau » changé en « juste » est tranché (D-067) ;
   - **à écrire avec UX à l'étape 2** : la route qui pose et retire le refus des mesures, et ses mots dans les Réglages (2.12) ;
   - « a joué avant 18h le lendemain » se tire des envois, qui ne vivent que 7 jours : le calcul doit se faire dans ce délai (2.15).

## 10. Limites et doutes

- **Ce contrat n'a été essayé par aucun écran.** L'étape 1 le mettra à l'épreuve : des champs manqueront sans doute, et chaque ajout repassera par la liste fermée.
- **Aucun vrai iPhone n'entre dans nos tests, sauf celui du porteur.** Les liens universels, les deux feuilles de connexion, le trousseau et l'extension de réception ne se prouvent que sur un iPhone.
- **Le vérificateur de connexion** protège contre un code intercepté, pas contre un iPhone déjà compromis. C'est la limite ordinaire d'une application.
- **Le dépôt est public** : les identifiants des textes, les textes et leurs votes à venir y sont lisibles. Un joueur curieux peut y chercher le vote d'un texte avant 18h. Limite déjà dite au porteur.
- **La révélation par étapes** donne au serveur l'ordre et la reprise. Si une étape disparaît pendant qu'on la lit (un départ), l'écran ouvert la garde jusqu'à « Suivant » ; à la reprise suivante, elle n'est plus là.
- **Le cercle de démonstration** vit dans la même base que les vrais cercles. Le cloisonnement (P-25) le sépare comme n'importe quel cercle ; sa marque l'écarte des mesures.
- **À observer avec de vraies personnes** :
  - combien d'invités vont au bout des gestes de TestFlight (`iphone_sans_application` contre liens ouverts dans l'application) ;
  - si le lien ouvre bien l'application depuis une messagerie ;
  - si la feuille de Google est comprise ;
  - si la feuille d'Apple à « Tout effacer » rassure ou inquiète ;
  - si la réponse reprise d'un joueur qui rejoint un second cercle se comprend ;
  - si la reprise de la révélation au bon endroit est remarquée.

## 11. Annexe : les mots fixes écrits par UX en phase 0, gardés

*Recopiés de la livraison d'UX (15 octobre 2026), pour que les étapes suivantes les trouvent dans le dépôt ; ils iront dans `textes.js`. « / » sépare deux éléments ; {pseudo} est une variable. N5, N6 et N14 n'y sont pas : la carte est tranchée par D-061 (son texte est dans `docs/etape-6/contenu-test.md`), N6 et N14 sont à compléter (partie 9). Les mots encore à écrire sont listés en partie 9.*

- **N18, pas de réseau** :
  - l'application s'ouvre sans réseau, rien n'est chargé (écran entier, sans barre d'onglets) : « Pas de connexion » / « Elenchos a besoin d'internet pour afficher le jeu. Il s'affichera dès que la connexion revient. » / « Réessayer » ;
  - le réseau se coupe pendant la partie (bandeau en haut, tant que dure la coupure) : « Pas de connexion. Elenchos réessaie tout seul. » ;
  - un geste n'est pas parti (sous le bouton ; le choix reste affiché et ne peut plus changer) : « Pas encore envoyé : pas de connexion. Garde Elenchos ouvert, ça partira dès que le réseau revient. » ;
  - le réseau est là, mais le jeu ne répond pas (même bandeau) : « Elenchos ne répond pas pour l'instant. Réessaie dans quelques minutes. »
  - Le premier bandeau quand le téléphone sait qu'il n'a pas de réseau, le second pour tous les autres échecs. Encre sur fond lin, sans rouge (D-012) ; lu par VoiceOver dès qu'il apparaît ; il ne cache jamais le bouton principal.
- **Vue de secours** : « Elenchos n'a pas pu démarrer. » / « Ce n'est pas une erreur de ta part. Ferme Elenchos, puis rouvre-le. Si ça recommence, préviens la personne qui t'a envoyé le lien. »
- **Ligne de l'écran Inviter** (1.14 et 4.2, sous le bouton d'envoi) : « Elenchos se joue seulement sur iPhone : invite des proches qui en ont un. »
- **N15, cercle complet** :
  - premier moment, le lien s'ouvre sur un cercle déjà à dix : « Ce cercle est complet » / « Un cercle compte dix membres au plus : tu ne peux pas y entrer. » / « Tu peux le dire à {pseudo}. » ;
  - second moment, le cercle s'est rempli pendant l'entrée : « Ce cercle est complet » / « Le cercle de {pseudo} s'est rempli pendant que tu jouais. Dix membres, c'est le maximum : tu ne peux pas y entrer. » / « Tes réponses sont effacées dans 7 jours. » (pour un joueur provisoire seulement ; un joueur inscrit garde ses réponses).
- **Refus après 18h** : Répondre ou raison (`texte_ferme`) : « Ce texte s'est fermé à 18h. Ta réponse n'a pas été prise. » / « Continuer », vers la révélation ; Deviner (`manche_fermee`) : « La manche s'est fermée à 18h, telle qu'elle était. » / « Continuer ».
- **Texte corrigé** : sur la fiche, la ligne d'erratum faite par le serveur, « Corrigé le {date} : {ce qui a changé}. » (exemple : « Corrigé le 12 novembre : le vote a eu lieu le 3 juin, pas le 3 mai. ») ; dans l'Historique, sous la phrase du jour, si `corrige` : « Texte corrigé après ta réponse. »
- **Message d'arrivée** : `MESSAGES_ARRIVEE` (2.13), titre « Elenchos » ; à relire par Juridique.
- **La ligne de la révélation** (`revoirRevelation`) : « Finir la révélation › » / « Revoir la révélation › ».
- **Écran du code (1.9)** : e-mail, objet « Ton code Elenchos : 482913 », corps « Ton code : 482913. Il est valable 15 minutes, une seule fois. Tu n'as rien demandé ? Ignore ce message. » ; à l'écran, « Code envoyé à {adresse} » (ou « Code envoyé » si l'application a été fermée entre-temps), les messages d'erreur de la partie 6, « Nouveau code envoyé. » après « Renvoyer le code », et « Rien reçu ? Regarde dans les indésirables. » sous ce bouton.
- **N13** : {prénom} devient {pseudo} ; le jeu ne connaît que le pseudo.
- **Retiré** : « La mise à jour forcée : aucun texte » (phase 0). Elle devient l'écran « Mise à jour requise », qui a des mots (partie 9).
