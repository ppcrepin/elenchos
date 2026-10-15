# Le contrat entre le serveur et l'interface (version de test)

*Phase 0 de la construction (D-060). Back-end et Front-end, ensemble, 15 octobre 2026. Les types exacts sont dans `jeu/src/contrat.ts` : en cas d'écart entre ce texte et les types, ce sont les types qui font foi, et l'écart est une faute à corriger ici. Le format des textes est dans `jeu/textes/FORMAT.md` ; les choix techniques et le point à trancher sur les réponses d'entrée de l'invité, dans `jeu/DECISIONS-TECHNIQUES.md`. Tout ce document est proposé : il ne décide rien de ce que le porteur a tranché, et dit ce qu'il touche (partie 8). À relire par Cohérence et le Vérificateur ; la partie 4 (code de passage) et les parties 2.2 à 2.5 (lien, carte, défi, compte) aussi par Juridique.*

## En bref

- **Une seule page, et des échanges JSON.** 37 routes sous `/api/` (dont `POST /api/recu`, réservée au service de réception du message), deux routes `/dev/` qui n'existent qu'en développement local, et trois navigations (la page, la connexion Apple ou Google, son retour). Chaque écran du test a son échange : l'index est en partie 7.
- **Le serveur calcule, l'interface montre.** Le serveur rend l'étape de la journée, les cartes dans leur ordre, les verdicts, l'avis du cercle, les titres, la phrase du jour, la ligne du vote. L'interface choisit l'écran, l'affiche et fait le compte à rebours. Elle n'applique aucune règle du jeu.
- **Liste fermée (P-27)** : chaque réponse ne contient que ce que l'écran montre. Un champ en trop fait échouer les tests.
- **L'heure vient du serveur** (R10). L'interface ne bascule jamais d'elle-même à 18h : à zéro, elle redemande (partie 3).
- **Le code de passage vers l'icône** est une hypothèse de Front-end, décrite en partie 4 pour Juridique. Le code voyage après le « # » : il n'atteint jamais les journaux du serveur.
- **La connexion d'essai par code et l'horloge accélérée** n'existent qu'en développement local. En ligne, leurs routes n'existent pas et le serveur refuse de démarrer si leurs réglages sont présents (partie 5).
- **Les trois réponses d'entrée de l'invité** : ce contrat suit notre recommandation commune, un joueur provisoire en base dès l'accord, effacé à 7 jours (`DECISIONS-TECHNIQUES.md`, partie 4). Juridique tranche avec l'orchestrateur ; l'autre option changerait les parties 2.3 et 2.4.

## 1. Les règles du contrat

### 1.1 Le serveur calcule, l'interface montre

Le serveur rend des données déjà calculées. Par exemple :
- **Marie a trouvé une réponse de Thomas sur trois.** L'interface ne compare pas « 1 » à un seuil : le serveur envoie `forme: 'surprises'`, et l'interface affiche « Thomas a réussi à te surprendre deux fois. » (E10).
- **Deux cartes identiques sont servies ensemble (R4).** L'interface ne réattribue rien : chaque `CarteRevelee` arrive avec son `auteur` déjà réattribué et son verdict.
- **Avant 18h, Marie a fini Deviner.** L'interface ne décide pas de passer à Répondre : `GET /api/aujourdhui` rend `etape.type: 'repondre'`.

Ce que fait l'interface, et seulement cela :
- choisir l'écran à partir de `Etat` et du contexte de l'appareil (iPhone ou non, Safari ou non, icône ou non), partie 2.1 ;
- afficher, avec ses mots fixes ;
- l'arithmétique d'affichage : le compte à rebours, la largeur des cinq parts de l'avis du cercle à partir des comptes, le cran de la barre ;
- garder en mémoire (jamais dans le téléphone) une position choisie mais pas encore envoyée.

### 1.2 Liste fermée (P-27)

Chaque type de `contrat.ts` contient les champs que l'écran montre, rien d'autre. Ce que le téléphone reçoit au sujet d'un autre membre se limite à : pseudo, rond, « déjà joué », titres de la semaine, cartes révélées selon les règles. Jamais l'adresse, la voie de connexion, la barre du portrait (D-026), ni un autre cercle.

En phase 1, un test compare chaque réponse du serveur à la liste des clés de son type : une clé en trop fait échouer le test. Deux autres tests le complètent (`docs/etape-6/donnees.md`, partie 2) :
- les **réponses inversées** : ce qu'un proche reçoit avant 18h est identique octet pour octet, quels que soient mes avis ;
- le **traceur** : aucune valeur marquée d'un autre cercle n'apparaît jamais.

### 1.3 Rien dans les adresses (P-08)

- Ni identifiant, ni pseudo, ni réponse, ni jeton dans le chemin ou après le « ? » d'une adresse.
- Les jetons (lien d'invitation, lien de créateur, code de passage) voyagent **après le « # »** : le navigateur ne l'envoie jamais au serveur, ni aux robots qui fabriquent les aperçus de lien. La page le lit, l'efface aussitôt de la barre d'adresse, puis l'envoie dans le corps d'une demande.
- Une lecture qui a besoin d'un paramètre se fait par `POST` (la fiche d'un texte, l'ouverture d'un lien).

### 1.4 Rien avant 18h (P-26)

Avant la révélation d'un texte, aucune réponse du serveur ne porte son vote, son auteur, l'auteur d'une carte, le député derrière une raison ou l'avis du cercle, même sous une forme cachée. Les numéros des cartes sont tirés au hasard pour chaque joueur et chaque jour. Avant la révélation, `POST /api/fiche` ne rend que le texte et ta réponse ; un texte jamais servi au joueur est refusé (`pas_encore_revele`).

### 1.5 Les lectures ne changent rien

Un `GET` ne modifie jamais la base. Tout ce qui écrit passe par un `POST`, y compris « j'ai vu la révélation » (`POST /api/vu`) et « l'écran Deviner s'est affiché » (`POST /api/deviner/ouvrir`, qui compte pour R10). Raison : un `GET` peut être rejoué par le navigateur, une icône qui se réveille ou un test. En phase 1, un test rejoue toutes les lectures et vérifie que la base n'a pas bougé.

### 1.6 Où vivent les mots

- **Les mots fixes** (boutons, titres d'écran, verdicts « Ça alors ! », noms des positions et des titres, N1 à N16) vivent dans l'interface, dans un seul fichier de textes, avec la marque `A_ECRIRE` pour ce qui manque. Un test refuse toute mise en ligne qui en contient encore une (repris de l'essai 2).
- **Les phrases qui dépendent des données** sont faites par le serveur, déjà typographiées : la phrase du jour, les lignes du vote, « Proposé par … », « Ta raison, « … », était l'argument de … », la ligne de l'avis du cercle, l'annonce d'arrivée, le message de 18h, les dates écrites (« révélé jeudi »). Le message de 18h part du serveur de toute façon : une seule source évite deux versions d'une même phrase.
- **Deux textes que le joueur accepte** sont servis par le serveur avec leur version : la carte de consentement (`GET /api/accord`) et la phrase de l'invitant (`GET /api/inviter`). Ainsi, l'empreinte enregistrée est celle du texte réellement lu (P-34, P-35).

### 1.7 La forme des échanges

- **JSON en UTF-8.** Un `POST` porte `Content-Type: application/json` ; son corps fait 16 Kio au plus ; un champ manquant, en trop ou hors liste donne `requete_invalide`.
- **Toute réponse est une enveloppe** `Reponse<T>` : `ok`, `version`, `horloge`, puis `donnees` ou `erreur`. Statut 200 si `ok`, sinon celui de la partie 6. Seule exception : `POST /api/recu`, envoyée par le service de réception, répond 204 sans corps (repris du test de 18h).
- **`Cache-Control: no-store`** sur toute réponse `/api/`.
- **Origine** : un `POST` doit venir de la page elle-même (en-tête `Origin`, ou `Sec-Fetch-Site: same-origin`), sinon `origine_refusee` (repris du test de 18h).
- **Cookies**, tous `Secure`, `HttpOnly`, préfixés `__Host-`, jamais lisibles par le script :
  - `__Host-session` : un numéro tiré au hasard, dont la base ne garde que l'empreinte, un par appareil ; 180 jours prolongés à chaque ouverture (proposé) ; supprimé à la déconnexion (P-41) et à l'effacement (P-38) (`DECISIONS-TECHNIQUES.md`, 1.8) ;
  - `__Host-provisoire` : le joueur provisoire du défi, 7 jours au plus ;
  - `__Host-transaction` : la connexion Apple ou Google en cours, 10 minutes, `SameSite=None` parce qu'Apple revient par un formulaire venu d'ailleurs (repris du test de 18h). Elle porte, scellé, le joueur provisoire qui devient un compte.
- **Rien d'autre dans le téléphone** (P-11) : le service de réception garde en cache les seuls fichiers de l'interface ; les données passent toujours par le réseau.
- **Limiteur** propre à chaque session ; un compteur commun pour les routes sans session (repris du test de 18h).
- **Version** : si `version` change, l'interface se recharge. Sans cela, une icône peut garder un ancien code après une mise en ligne.
- **En-têtes de sécurité** et règle stricte de chargement (CSP), repris du test de 18h : aucun script, aucune police, aucune image venus d'ailleurs (P-09, P-10).

## 2. Les échanges, moment par moment

*Pour chaque échange : les écrans servis, la route, ce que l'interface envoie, ce qu'elle reçoit dans `donnees`, les erreurs propres à la route. Les erreurs communes (`requete_invalide`, `origine_refusee`, `trop_de_demandes`, `erreur_serveur`) valent partout. Les types sont ceux de `contrat.ts`.*

### 2.1 Au démarrage : `GET /api/etat`

- **Envoyé** : rien. **Reçu** : `Etat`. **Erreurs** : aucune.
- Appelé à chaque ouverture, au retour au premier plan, à la fin d'un compte à rebours, après une erreur `non_connecte`.

L'interface en tire l'écran, avec le contexte de l'appareil :

| Contexte, puis `Etat` | Écran | Échange suivant |
|---|---|---|
| Android, ordinateur, iPad (avant tout appel) | N2 ; la dernière phrase seulement si l'adresse porte `#lien=` | `POST /api/compteur` ; le lien n'est pas consommé |
| iPhone, hors de Safari et hors de l'icône (avant tout appel) | N3 | `POST /api/compteur` (`hors_safari`) |
| `dehors`, adresse avec `#lien=…` | 1.2 (N16 pour un créateur) | `POST /api/lien` |
| `dehors`, dans l'icône, adresse avec `#passage=…` | aucun : échange du code | `POST /api/passage/echanger`, puis `GET /api/etat` |
| `dehors`, dans l'icône, sans code valable | N9 | `GET /api/compte` |
| `dehors`, dans Safari, sans lien | N1 | « J'ai déjà un compte » : `GET /api/compte` |
| `entree` | 1.2 ou 1.4 du texte suivant | `GET /api/entree` |
| `entree_finie` | 1.7 (N16 pour un créateur), puis 1.8 | `GET /api/entree/bilan`, `GET /api/compte` |
| `nommer_cercle` | 5.1 | `POST /api/cercle` |
| `jeu` et `revelationAOuvrir` | la révélation | `GET /api/revelation` |
| `jeu` et `annonces` non vide | le bandeau d'arrivée (1.10) ; si `aDeviner`, 1.11 | `GET /api/miroir` |
| `jeu` | Aujourd'hui ; N11 en plus hors de l'icône | `GET /api/aujourdhui` |
| `refusConnexion` non nul | l'écran du compte, avec le message du refus | `GET /api/compte` |
| `accordAJour` faux | la carte de consentement avant la prochaine réponse | `GET /api/accord` |

Le contexte de l'appareil n'est pas une règle du jeu : c'est la détection de la page-test de l'essai (iPad qui se présente comme un Mac, page dans un cadre, navigateur intégré reconnu), reprise telle quelle. Le serveur ne lit pas le navigateur (P-07).

### 2.2 Le lien : `POST /api/lien`

- **Écrans** : 1.2 (premier texte), N16 (bandeau du créateur), 5.14 et N13 (lien qui ne marche plus), N12, N15.
- **Envoyé** : `{ jeton }`, lu après `#lien=`. **Reçu** : `LienOuvert`. Les issues attendues sont des données (`etat: 'expire'`, `'deja_servi'`, `'inconnu'`, `'complet'`, `'deja_dans_un_cercle'`, `'entree_en_cours'`), pas des erreurs.
- **Ouvrir un lien n'enregistre rien et ne le consomme pas** (P-29). Le lien se lie au navigateur à la première réponse enregistrée (2.4). Rien de l'invitant ne vient avec, sauf son visage (pseudo et rond), qu'affiche le bandeau « Défi de Thomas ».
- **Le lien de créateur** est un lien du même type, sans invitant. Le porteur le fabrique avec un outil du serveur, un par créateur, à usage unique, valable 7 jours, et le colle dans son message (N17) (proposé ; `contenu-test.md` dit seulement « [lien] »).

### 2.3 La carte de consentement : `GET /api/accord`, `POST /api/accord`

- **Écrans** : 1.3 (N5) ; plus tard, la même carte si `Etat.accordAJour` est faux.
- `GET` : **reçu** `CarteAccord` (version, empreinte, titre, paragraphes). « J'accepte » et « Qui, durée, droits » sont des mots de l'interface.
- `POST` : **envoyé** `EnvoiAccord` (version, empreinte, `quinzeAnsEtPlus: true`, jeton du lien) ; **reçu** `{ enregistre: true }`. **Erreurs** : `accord_perime` (la carte a changé entre-temps : on la redemande), `lien_expire`, `lien_deja_servi`, `etape_incorrecte`.
- **Selon notre recommandation** (`DECISIONS-TECHNIQUES.md`, partie 4), l'accord crée le joueur provisoire et pose `__Host-provisoire`. Il enregistre la version, l'empreinte du texte exact, l'heure du serveur et « 15 ans et plus » (P-34). Refuser la carte n'envoie rien : rien n'est enregistré nulle part.

### 2.4 Le défi des trois textes : `GET /api/entree`, `POST /api/entree/repondre`, `GET /api/entree/bilan`

- **Écrans** : 1.2, 1.4, 1.5, 1.6, 1.7 ; N16 pour le créateur.
- `GET /api/entree` : **reçu** `Entree` (le texte suivant, son rang, le mode, l'invitant) ou `{ etat: 'finie' }`. **Erreurs** : `non_connecte`, `etape_incorrecte`.
- `POST /api/entree/repondre` : **envoyé** `{ texte, position, raison, pari }`, en un seul échange, au toucher sur « Voir sa réponse » (1.5) ; pour le créateur, `pari: null`, au toucher sur « Valider » (1.4). **Reçu** `RevelationEntree` : le verdict du pari (jugé sur le côté, D-011), la réponse de l'invitant, le vote, l'auteur du texte, l'auteur de ta raison. **Erreurs** : `non_connecte`, `accord_requis`, `deja_repondu`, `etape_incorrecte`, `lien_expire`, `lien_deja_servi`.
  - La réponse de l'invitant n'existe que dans la réponse à ce `POST`, donc jamais avant le pari (P-29).
  - La première réponse enregistrée lie le lien à ce joueur provisoire ; un autre navigateur reçoit ensuite `deja_servi` (P-29).
  - Entre 1.4 et 1.5, rien n'est envoyé : l'interface empêche de revenir en arrière après « Valider ». Le serveur reçoit donc la réponse et le pari ensemble, ce qui rend l'ordre « pari, puis réponse de Thomas » impossible à contourner.
- `GET /api/entree/bilan` : **reçu** `BilanEntree` : pour l'invité, la forme (score ou surprises) et les deux nombres (E10) ; pour le créateur, rien d'autre que son mode (N16). « Non conservé » (D-006) : le bilan ne se montre qu'à la fin du défi ; seul le score reste en base, pour l'annonce à l'invitant.

### 2.5 Le compte : `GET /api/compte`, `POST /api/compte/pseudo`, la connexion Apple ou Google, l'e-mail

- **Écrans** : 1.8 (N7), 1.9, N9, « J'ai déjà un compte » (N1, N13), N12, N15.
- `GET /api/compte` : **reçu** `EcranCompte`. `but: 'creation'` à la fin du défi ; `'connexion'` sans session. Le texte « Pourquoi Elenchos ? » ne s'affiche qu'avec `creation` (D-049).
- `POST /api/compte/pseudo` : **envoyé** `{ pseudo }` ; **reçu** `{ accepte: true }`. Le pseudo est gardé sur le joueur provisoire, puis la voie est choisie. **Erreurs** : `pseudo_pris` (E7, comparé dans le cercle de l'invitant), `pseudo_invalide`, `etape_incorrecte`, `non_connecte`.
- **Apple ou Google : trois navigations, pas d'échange JSON** (repris du test de 18h) :
  1. `GET /connexion/apple` ou `GET /connexion/google`, par un lien touché (rien d'Apple ni de Google n'est chargé avant : P-10). Le serveur pose `__Host-transaction` et renvoie vers Apple ou Google, avec l'identifiant et l'adresse e-mail pour seules demandes (P-03).
  2. `POST /connexion/apple/retour` ou `POST /connexion/google/retour` : le retour, par formulaire (le code n'apparaît jamais dans une adresse). Le serveur crée ou retrouve le compte, puis renvoie vers `/`.
  3. `GET /` : la page redemande `GET /api/etat`. Le résultat est là : une session, ou `refusConnexion` (`refus_fournisseur`, `compte_organisation`, `compte_inconnu`, `deja_dans_un_cercle`, `cercle_complet`, `pseudo_pris`, `connexion_echouee`), dit une seule fois.
- **L'e-mail** :
  - `POST /api/compte/email` : **envoyé** `{ adresse }` ; **reçu** `{ minutes: 15 }` (P-41). **Erreurs** : `adresse_invalide`, `trop_de_codes`, `indisponible` (voie coupée tant qu'il n'y a pas de domaine, D-060 ; le bouton n'apparaît alors pas : `voies.email` faux), `etape_incorrecte`.
  - `POST /api/compte/code` : **envoyé** `{ code }` ; **reçu** `ResultatConnexion`, comme au retour d'Apple ou de Google. **Erreurs** : `code_faux`, `code_expire`, `trop_essais`, `etape_incorrecte`.
  - **Personne ne peut savoir si une adresse a un compte.** En mode `connexion`, une adresse inconnue reçoit la même réponse ; aucun e-mail ne part, et tout code est faux. Savoir qu'une adresse joue à un jeu politique serait déjà une donnée sensible. Les mots de l'écran du code en tiennent compte (`A_ECRIRE`, UX : « Si cette adresse a un compte, un code vient de partir. »).
- **La création du compte se fait en une transaction** : empreinte de l'identifiant ou de l'adresse (jamais l'adresse elle-même, `plan-version-test.md`, partie 1), pseudo, accord gardé avec sa date d'origine (P-34), réponses d'entrée gardées, lien consommé, entrée dans le cercle pour l'invité. Le serveur vérifie au même moment le cercle complet (N15), le cercle déjà rejoint (N12) et le pseudo (E7). Puis l'annonce d'arrivée part vers l'invitant (2.7).
- Un compte qui existe déjà et se reconnecte depuis un défi (N12) : le joueur provisoire est effacé sur-le-champ.

### 2.6 Le cercle et l'invitation : `POST /api/cercle`, `GET /api/inviter`, `POST /api/inviter`

- **Écrans** : 5.1, 1.14, N15.
- `POST /api/cercle` : **envoyé** `{ nom }` ; **reçu** `{ cree: true }`. **Erreurs** : `nom_invalide`, `etape_incorrecte`, `non_connecte`.
- `GET /api/inviter` : **reçu** `EcranInviter` : la phrase de l'invitant avec sa version (P-35), le nombre de liens envoyés, `lance`, `complet`.
- `POST /api/inviter` : **envoyé** `{ accordVersion }` ; **reçu** `{ lien }`, l'adresse complète avec le jeton après « # ». Aucun lien sans la ligne d'accord de l'invitant (P-35). **Erreurs** : `accord_perime`, `cercle_complet`, `etape_incorrecte`, `non_connecte`.
- Le message d'invitation (« Tu crois me connaître ? … ») est un mot fixe de l'interface. Elle ouvre la feuille de partage de l'iPhone avec le message et le lien ; jamais d'accès aux contacts.

### 2.7 L'annonce d'arrivée et le miroir : `Etat.annonces`, `GET /api/miroir`, `POST /api/miroir/parier`

- **Écrans** : 1.10, 1.11 (1.5 à 1.7 en miroir).
- **L'annonce** part à la création du compte d'un invité, tant que le cercle a moins de trois membres (D-006). Elle arrive de deux façons : par un message, si l'invitant a accepté le message de 18h (texte fait par le serveur, chiffré jusqu'au téléphone, P-06) ; et toujours dans `Etat.annonces`, jusqu'à `POST /api/vu { objet: 'annonces' }`.
- `GET /api/miroir` : **reçu** `Miroir`, un texte à deviner (son titre seulement, 1.11) ou le bilan. **Erreurs** : `rien_a_deviner` (le créateur ne devine que son premier invité, quand ils sont deux : D-006, D-058), `non_connecte`.
- `POST /api/miroir/parier` : **envoyé** `{ texte, pari }` ; **reçu** `MiroirRevele` : le verdict et la réponse de l'invité, sans le vote ni les auteurs, que le créateur connaît déjà. **Erreurs** : `rien_a_deviner`, `etape_incorrecte`, `non_connecte`.

### 2.8 La journée : `GET /api/aujourdhui` et ses gestes

- **Écrans** : 1.12, 1.13, 2.1, 2.2, 2.3, 2.4, 2.5, 5.10, 5.12, 5.13.
- `GET /api/aujourdhui` : **reçu** `Aujourdhui`. Le serveur choisit l'étape : Deviner, Répondre ou En attendant. Il donne aussi le repère de la journée (D-038), le bandeau « Il faut trois joueurs pour deviner. », le bandeau « Tu as rejoint … » (une fois) et la ligne « Revoir la révélation » (E3).
- **Deviner** (2.1, 2.2) :
  - quand l'étape est `deviner` avec `ouverte: false`, l'interface appelle `POST /api/deviner/ouvrir` au moment où elle montre l'écran. C'est ce geste qui fait exister la manche (R10 : une manche dont l'écran ne s'est jamais affiché n'a pas de cartes). Le serveur tire alors les cartes, une seule fois, avec un tirage qui donne le même résultat quel que soit le moment ;
  - `POST /api/deviner/poser` (`{ carte, visage }`, `visage: null` pour retirer), `POST /api/deviner/pourquoi` (`{ carte, raison }`), `POST /api/deviner/passer` (`{ carte }`), `POST /api/deviner/valider` : chacun rend le nouvel `Aujourdhui`. Le brouillon est gardé à chaque geste (règle 9) ; changer de visage garde le « pourquoi », retirer le visage ou passer l'efface : c'est le serveur qui l'applique ;
  - **erreurs** : `manche_fermee` (18h est passé : l'interface redemande `GET /api/etat`), `deja_validee`, `carte_inconnue`, `visage_non_propose`, `visage_deja_pose`, `pourquoi_sans_visage`, `non_connecte`.
- **Répondre** (2.3, 2.4, 1.12, 5.12) : `POST /api/repondre`, **envoyé** `{ texte, position, raison }`, au toucher sur « Valider » ; **reçu** `Aujourdhui`, à l'étape En attendant, avec la phrase du jour. **Erreurs** : `accord_requis`, `texte_ferme` (18h00 pile ; pas de retard jusqu'à 18h10 pendant le test, `contenu-test.md`), `deja_repondu`, `etape_incorrecte`, `non_connecte`.
- **En attendant** (2.5, 1.13, 5.10) : la phrase du jour, la sorte de compte à rebours (« Révélation dans … » ou « Nouveau texte dans … », E1), qui a déjà joué (rien d'autre : jamais qui n'a pas joué). Le bloc « Le message de 18h » (N8) ou le bandeau N11 s'ajoutent selon le contexte de l'appareil, pas selon le serveur.

### 2.9 La révélation de 18h : `GET /api/revelation`, `POST /api/vu`, `POST /api/fiche`

- **Écrans** : 2.7a à 2.7f, 3.3a à 3.3c (sur un seul écran), 5.4.
- `GET /api/revelation` : **reçu** `Revelation`, valable du 18h au 18h suivant. **Erreurs** : `rien_a_reveler`, `non_connecte`.
  - `texte` : les attributions de la manche, dans son ordre (`null` si la manche ne s'est jamais ouverte : la révélation commence au vote, R10, E1) ; le vote ; l'avis du cercle (`null` sous trois réponses, règle 10) ; l'auteur du texte ; l'auteur de ta raison ;
  - `titres` : le dimanche, Le Devin, Le Mystère et Le Fidèle, chacun seulement s'il a un titulaire (R6).
  - Pas de total de points (`contenu-test.md`) ; la carte se montre d'un coup, sans retournement.
- `POST /api/vu { objet: 'revelation' }` : la première ouverture après 18h ne commence plus par la révélation. Il sert aussi la mesure « révélation ouverte le soir même ». « Revoir la révélation » refait `GET /api/revelation` et reprend au début (allégement de E3 signalé au porteur, D-060).
- `POST /api/fiche` : **envoyé** `{ texte }` ; **reçu** `Fiche`. Avant la révélation, le texte et ta réponse seulement, avec « Le vote et les auteurs : … à 18h », sans lien officiel. Après, le vote, l'auteur, les quatre raisons et leurs députés, le lien du scrutin et l'erratum s'il y en a un. **Erreurs** : `pas_encore_revele` (un texte jamais servi au joueur), `introuvable`, `non_connecte`.

### 2.10 Le message de 18h : `POST /api/abonnement`, `POST /api/recu`, le contenu des messages

- **Écrans** : N10 et ses variantes, 2.6, 3.1, 1.10.
- `POST /api/abonnement` : **envoyé** `{ abonnement }`, depuis l'icône seulement, après le toucher sur « Recevoir le message de 18h » et l'accord d'iOS ; **reçu** `{ abonne: true }`. **Erreurs** : `abonnement_invalide`, `indisponible`, `non_connecte`. Le refus, et l'iPhone trop ancien (avant iOS 16.4), se voient dans le téléphone : aucun échange.
- **Le contenu d'un message** est `MessagePush`, chiffré pour le seul téléphone (P-06) :
  - le message de 18h prend un des six textes de `MESSAGES_18H` (E1, D-014 ; trois formes, et chacune avec « Ce soir, aussi : les titres de la semaine. » le dimanche s'il y a des titres). Liste fermée : un texte nouveau ne part pas sans son test (P-05) ;
  - l'annonce d'arrivée prend le texte de `AnnonceArrivee.texte` ;
  - `navigate` est l'adresse de la page, rien d'autre. Un toucher ouvre l'icône, qui demande `GET /api/etat` ; `revelationAOuvrir` y mène à la révélation.
- `POST /api/recu` : envoyé par le service de réception, sans cookie, avec le seul numéro d'envoi tiré au hasard ; réponse 204. L'heure de réception est celle du serveur (repris du test de 18h).

### 2.11 L'icône : `POST /api/passage`, `POST /api/passage/echanger`, `POST /api/geste`

- **Écrans** : N8 (bloc et guide), N9, N11.
- Le code de passage est décrit en partie 4.
- `POST /api/geste { geste: 'ouverture_icone' }` : envoyé à la première ouverture depuis l'icône ; le serveur ignore les suivantes. C'est la mesure « icône installée » (`contenu-test.md`, partie 5).

### 2.12 Le Cercle, Moi, les Réglages : `GET /api/cercle`, `GET /api/moi`, `GET /api/droits`, `POST /api/tout-effacer`, `POST /api/deconnexion`

- **Écrans** : 4.2, 1.15, 5.9 et 5.13 (fondus), 4.1, 5.11 et 5.3 (fondus), 5.7, N6, N14, N15.
- `GET /api/cercle` : **reçu** `Cercle` : le nom, les membres par ordre d'arrivée, chacun avec ses titres de la semaine, `lance`, `complet`, le bandeau. « Vous êtes trois : le cercle est lancé. » ne revient pas après `POST /api/vu { objet: 'cercle_lance' }`.
- `GET /api/moi` : **reçu** `Moi` : ton visage, la barre « Ton portrait se dessine » (60 crans, visible de toi seul, D-026), tes réponses avec leur phrase du jour, et si tu as des titres passés (pour la phrase de N14). La barre pleine se montre une fois, puis `POST /api/vu { objet: 'barre_pleine' }` (règle 18) ; en quatre semaines de test, elle n'y arrivera pas.
- `GET /api/droits` : **reçu** `Droits`, les deux blancs de « Qui, durée, droits » (N6), réglés par le porteur chez Scalingo, jamais écrits dans le dépôt. **Erreur** : `indisponible` tant qu'ils ne sont pas réglés ; un test refuse alors la mise en ligne.
- `POST /api/tout-effacer` : **envoyé** `{ confirmation: 'tout-effacer' }` ; **reçu** `{ efface: true }`, et les cookies sont effacés. L'effacement est immédiat et réel, en une transaction (P-33, P-38) ; aucun message au cercle (D-045).
- `POST /api/deconnexion` : **reçu** `{ deconnecte: true }` ; le cookie de session est effacé.

### 2.13 Les mesures

- **Envoyées par l'interface**, listes fermées : `POST /api/geste` (`ouverture_icone`) et `POST /api/compteur` (`android`, `ordinateur`, `ipad`, `hors_safari`, sans session, sans rien garder de la personne). Ni position, ni raison, ni tension, ni durée d'écran (P-39, P-40).
- **Tirées de la base par le serveur**, sans geste de plus : le retour à 7, 14 et 21 jours, les manches où un visage est posé, la justesse comparée au hasard, le message reçu, « a joué avant 18h le lendemain », la révélation ouverte le soir même (`POST /api/vu`), les invitations envoyées et les cercles à trois en 7 jours, l'entrée finie puis le compte créé (`contenu-test.md`, partie 5).
- Le rapport des totaux est un outil du porteur, hors de ce contrat (P-21).

## 3. Avant et après 18h : l'heure du serveur

**Le jour de jeu** va de 18h à 18h, heure de Paris. Le texte du jour d s'ouvre à 18h le jour d et se ferme à 18h le jour d+1 ; il se devine jusqu'à 18h le jour d+2, et se révèle à ce moment-là (`plan-version-test-backend.md`, partie 3). Ce qu'on voit « avant 18h » ou « après 18h » n'est donc qu'une question de jour de jeu, que seul le serveur connaît.

**Ce que reçoit l'interface.** Chaque réponse porte `horloge` : l'heure du serveur (`instant`), le prochain 18h (`bascule`) et la `vitesse` (1 en ligne).

**Le compte à rebours.** L'interface calcule le temps restant ainsi : `(bascule − instant) / vitesse`, moins le temps écoulé depuis la réception de la réponse, mesuré par l'horloge monotone du navigateur (`performance.now()`). Elle ne lit jamais l'heure du téléphone pour le jeu (R10) : un téléphone mal réglé ou à l'étranger voit le même 18h que les autres.

**À zéro, l'interface redemande.** Quand le compte à rebours arrive à zéro, et chaque fois que la page revient au premier plan, l'interface appelle `GET /api/etat`. Elle ne change jamais d'elle-même ce qu'elle montre : c'est la nouvelle réponse qui dit que la révélation est là.

**Une demande à cheval sur 18h.** Le serveur juge l'heure à l'arrivée de la demande. Un geste de Deviner reçu à 18:00:00 reçoit `manche_fermee` ; une réponse reçue à 18:00:00 reçoit `texte_ferme`. L'interface redemande alors `GET /api/etat`. La manche se ferme telle qu'elle est : le brouillon compte (règle 10). Les tests rejouent 17:59:59 contre 18:00:00 (`regles.md`, journée J5).

**Rien ne se calcule à 18h pile** (D-043). Chaque carte est jugée au moment du geste ; l'avis du cercle porte sur des réponses closes depuis 24 heures et se prépare la veille ; les cartes se tirent à l'ouverture de Deviner ; le départage du dimanche se fait à la première lecture. À 18h, le serveur ne fait que comparer l'heure et envoyer le message.

**Les changements d'heure** ne regardent que le serveur (`horloge.ts`, repris du test de 18h). Les tests couvrent le 25 octobre 2026 et le 28 mars 2027.

## 4. Le code de passage vers l'icône (hypothèse de Front-end, à relire par Juridique)

**Le problème.** Sur iPhone, l'icône de l'écran d'accueil a sa propre mémoire, séparée de Safari. Un joueur connecté dans Safari arrive dans l'icône sans session. Sans parade, il doit se reconnecter une fois (N9) : un geste de plus au moment le plus fragile du parcours.

**Le mécanisme proposé.**
1. Juste avant d'afficher le guide N8, la page connectée appelle `POST /api/passage` et reçoit `{ code, minutes }`.
2. Elle remplace son adresse, sans recharger, par `/#passage={code}`.
3. Le joueur ajoute l'icône. Le manifeste ne fixe pas d'adresse de départ : l'icône garde l'adresse de la page au moment de l'ajout (hypothèse à vérifier).
4. À la première ouverture de l'icône, la page lit le code, efface aussitôt le « # » de son adresse, et appelle `POST /api/passage/echanger { code }`. Le serveur pose `__Host-session` dans la mémoire de l'icône.
5. Aux ouvertures suivantes, l'icône repart de la même adresse, avec un code déjà servi. La page voit qu'elle a une session et n'envoie rien.
6. Si l'échange échoue (`passage_refuse`) : N9, « Encore un geste ».

**Les propriétés du code** (proposé, Back-end) :
- 32 octets tirés au hasard ; la base n'en garde que l'empreinte avec clé (HMAC) ;
- valable 30 minutes, une seule fois ; un seul code actif par joueur, et un nouveau remplace l'ancien ;
- lié au compte qui l'a demandé ; il ne donne qu'une session de ce compte ;
- **jamais dans un journal du serveur** : il voyage après le « # » (P-08), puis dans le corps d'une demande ;
- « Copier le lien », dans le guide, copie toujours l'adresse sans code.

**Ce qui reste dans le téléphone** : l'adresse de l'icône garde le code, mais un code servi ne vaut plus rien. L'historique de Safari garde aussi l'adresse avec le code, valable au plus 30 minutes s'il n'a pas servi.

**Trois questions pour Juridique.**
1. Un code à usage unique dans l'adresse de l'icône, sans valeur une fois servi : acceptable au regard de P-08 et P-11 ?
2. La durée de 30 minutes : le guide dit « 30 secondes », mais un joueur peut être interrompu. Plus court, N9 revient plus souvent.
3. **Si l'iPhone ne garde pas le « # »** dans l'adresse de l'icône, le seul repli serait un code après le « ? ». Le code arriverait alors dans la ligne de la demande, que les journaux du routeur de Scalingo noteraient s'ils étaient activés, et peut-être la trace des connexions que Scalingo garde un an, dont le contenu n'est pas décrit (P-07, P-08). Nous ne le ferions pas sans une décision : la question reviendrait avec le résultat de l'essai sur l'iPhone du porteur.

**Quand on saura.** Sur l'iPhone du porteur, en phase 6 seulement (D-060, point 1). Si le code échoue, N9 reste, et le plan prévoit 2 à 5 jours de plus ou la question de TestFlight (`plan-version-test.md`, partie 2).

## 5. Le développement local : connexion d'essai, horloge accélérée, proches simulés

**Le principe** : deux réglages dangereux, qui n'existent qu'en local, refusés en ligne de trois façons, comme `IGNORER_HORAIRES` du test de 18h :
1. le serveur **refuse de démarrer** si l'un d'eux est présent dans un environnement protégé (Scalingo, GitHub : les marqueurs de `garde-horaires.ts`) ;
2. les routes `/dev/` ne sont **montées qu'en local** ; en ligne, elles répondent `introuvable`, comme une adresse qui n'existe pas ;
3. un **test** le vérifie dans la configuration en ligne.

**La connexion d'essai par code** (`CODES_ESSAI_LOCAUX`, `POST /dev/connexion { code }`). Chaque code ouvre la session d'un joueur inventé de la base locale. Elle sert aux tests de bout en bout (quatre joueurs dans Chromium) et aux captures de la phase 1. Elle remplace la « connexion d'essai sur l'aperçu » de P-20 (proposé) : il n'y a plus d'aperçu en ligne avant la phase 6 (D-060, point 1). Le porteur, en phase 6, se connecte avec ses propres comptes (D-059, point 1).

**L'horloge accélérée** (`HORLOGE_VITESSE`, `HORLOGE_DEPART`, `POST /dev/horloge`). À la vitesse 168, une semaine de jeu passe en une heure : c'est la preuve de la phase 3 (`plan-version-test.md`). `POST /dev/horloge` saute à `bascule`, à `dix_secondes_avant` ou au prochain `dimanche_bascule`. Le serveur n'a qu'une horloge (`horloge.ts`) ; `Horloge.vitesse` permet à l'interface de garder un compte à rebours juste. En local, aucun message ne part vers Apple.

**Les proches simulés** : un outil remplit la base locale de joueurs inventés (pseudos inventés, adresses au domaine réservé `exemple.invalid`) qui répondent et devinent, pour jouer seul une semaine accélérée. Il refuse de tourner en ligne (P-19).

## 6. Les erreurs

| Code | Statut | Quand | Ce que fait l'interface |
|---|---|---|---|
| `requete_invalide` | 400 | corps illisible, champ en trop, valeur hors liste | message neutre « Ça n'a pas marché » ; c'est un défaut du code |
| `non_connecte` | 401 | route qui demande une session | `GET /api/etat`, puis l'écran qui convient |
| `origine_refusee` | 403 | `POST` venu d'ailleurs | message neutre |
| `introuvable` | 404 | route inconnue ; route `/dev/` en ligne ; texte inconnu de la fiche | message neutre |
| `etape_incorrecte`, `accord_perime` | 409 | la demande ne correspond plus à l'étape du joueur (deux onglets, retour arrière) | `GET /api/etat`, puis l'écran qui convient |
| `accord_requis` | 409 | réponse sans accord, ou nouvelle version de la carte | la carte (`GET /api/accord`) |
| `texte_ferme`, `manche_fermee`, `rien_a_reveler`, `rien_a_deviner` | 409 | 18h est passé, ou il n'y a rien | `GET /api/etat` |
| `pas_encore_revele` | 409 | fiche d'un texte jamais servi au joueur | message neutre |
| `deja_repondu`, `deja_validee` | 409 | geste déjà fait (deux onglets) | `GET /api/aujourdhui` |
| `carte_inconnue`, `visage_non_propose`, `visage_deja_pose`, `pourquoi_sans_visage` | 409 | geste impossible sur la manche | `GET /api/aujourdhui` ; l'écran ne doit pas permettre ces gestes |
| `lien_expire`, `lien_deja_servi` | 410 | pendant le défi | N13 ou 5.14 |
| `passage_refuse` | 410 | code de passage inconnu, expiré ou servi | N9 |
| `cercle_complet` | 409 | invitation demandée à dix membres | N15 |
| `pseudo_pris`, `pseudo_invalide`, `nom_invalide`, `adresse_invalide`, `code_faux`, `code_expire`, `abonnement_invalide` | 422 | saisie refusée | message sous le champ (mots : UX ; N7 pour le pseudo) |
| `trop_essais`, `trop_de_codes`, `trop_de_demandes` | 429 | limiteur | message « réessaie dans un quart d'heure » (mots : UX) |
| `erreur_serveur` | 500 | défaut du serveur | message neutre ; rien de personnel dans le journal (P-07) |
| `indisponible` | 503 | fonction coupée faute de réglage | le bouton de la voie e-mail n'apparaît pas ; pour le message, la variante d'N10 « pas encore prêt » (mots : UX) |

Le corps d'une erreur ne contient que son code : jamais de message, de valeur reçue, ni de trace (P-07).

## 7. Index : chaque écran du test et son échange

*Les 22 écrans « dedans », les 21 « allégés » et N1 à N16 (`contenu-test.md`). N17 est le message du porteur, pas un écran. Les huit écrans « après le test » n'ont pas de route : 3.2, 3.3d, 3.3e, 4.3, 5.2, 5.5, 5.6, 5.8.*

| Écran | Sort | Échange | Type reçu |
|---|---|---|---|
| 1.1 Message de Thomas | allégé | aucun : l'aperçu du lien vient des balises fixes de `GET /`, sans prénom | — |
| 1.2 Premier texte : position | dedans | `POST /api/lien` (texte 1), `GET /api/entree` (textes 2, 3) | `LienOuvert`, `Entree` |
| 1.3 Carte de consentement | dedans | `GET /api/accord`, `POST /api/accord` | `CarteAccord` |
| 1.4 Premier texte : raison | dedans | les raisons viennent avec le texte (1.2) ; rien n'est envoyé | `TexteARepondre` |
| 1.5 « Et Thomas ? » | dedans | `POST /api/entree/repondre` (réponse et pari) | — |
| 1.6 Révélation immédiate | dedans | réponse du même `POST` | `RevelationEntree` |
| 1.7 Bilan d'entrée | allégé | `GET /api/entree/bilan` | `BilanEntree` |
| 1.8 Compte | dedans | `GET /api/compte`, `POST /api/compte/pseudo`, `GET /connexion/{apple,google}` | `EcranCompte` |
| 1.9 Le code | allégé | `POST /api/compte/email`, `POST /api/compte/code` | `ResultatConnexion` |
| 1.10 Ce que reçoit Thomas | allégé | message d'arrivée ; `Etat.annonces` ; `POST /api/vu` | `MessagePush`, `AnnonceArrivee` |
| 1.11 Thomas devine Marie | allégé | `GET /api/miroir`, `POST /api/miroir/parier` | `Miroir`, `MiroirRevele` |
| 1.12 Aujourd'hui : rien à deviner | dedans | `GET /api/aujourdhui` (étape `repondre`, `rienADeviner`) ; `POST /api/vu` (`arrivee`) | `Aujourdhui` |
| 1.13 En attendant (cercle incomplet) | dedans | `GET /api/aujourdhui` (`en_attendant`, bandeau) | `Aujourdhui` |
| 1.14 Inviter | dedans | `GET /api/inviter`, `POST /api/inviter` | `EcranInviter`, `LienCree` |
| 1.15 Le Cercle : Hugo arrive | allégé | `GET /api/cercle` (bandeau `cercle_lance`) ; `POST /api/vu` | `Cercle` |
| 2.1 Deviner | dedans | `GET /api/aujourdhui` ; `POST /api/deviner/ouvrir`, `/poser`, `/passer`, `/valider` | `Aujourdhui` |
| 2.2 Feuille « Devine aussi pourquoi » | dedans | `raisonsHier` ; `POST /api/deviner/pourquoi` | `Aujourdhui` |
| 2.3 Répondre : position | dedans | `GET /api/aujourdhui` (étape `repondre`) | `Aujourdhui` |
| 2.4 Répondre : raison | dedans | `POST /api/repondre` | `Aujourdhui` |
| 2.5 En attendant 18h | dedans | `GET /api/aujourdhui` (`en_attendant`) | `Aujourdhui` |
| 2.6 Le message de 18h | dedans | message de 18h ; `POST /api/recu` | `MessagePush` |
| 2.7a à 2.7c Attributions | allégé | `GET /api/revelation` (`attributions`) | `Revelation` |
| 2.7d Le vote | dedans | `GET /api/revelation` (`vote`, `avisCercle`) | `Revelation` |
| 2.7e Les auteurs | dedans | `GET /api/revelation` (`auteurTexte`, `taRaison`) | `Revelation` |
| 2.7f Fin | dedans | `POST /api/vu` (`revelation`) ; lien vers `POST /api/fiche` | — |
| 3.1 Message du dimanche | allégé | message de 18h, forme du dimanche | `MessagePush` |
| 3.3a à 3.3c Titres | allégé | `GET /api/revelation` (`titres`) | `Revelation` |
| 4.1 Moi : portrait | allégé | `GET /api/moi` (barre, historique) | `Moi` |
| 4.2 Le Cercle | allégé | `GET /api/cercle` | `Cercle` |
| 5.1 Nommer le cercle | dedans | `POST /api/cercle` | — |
| 5.3 Historique | allégé, dans Moi | `GET /api/moi` (`historique`) | `Moi` |
| 5.4 Fiche d'un texte | allégé | `POST /api/fiche` | `Fiche` |
| 5.7 Réglages | allégé | `GET /api/moi` (pseudo), `GET /api/droits`, `POST /api/deconnexion`, `POST /api/tout-effacer` | `Moi`, `Droits` |
| 5.9 Le Cercle, sous trois | allégé, avec 5.13 | `GET /api/cercle` (bandeau `cercle_incomplet`) | `Cercle` |
| 5.10 Aujourd'hui, sous trois | allégé | `GET /api/aujourdhui` (bandeau) | `Aujourdhui` |
| 5.11 Portrait pas encore formé | allégé, c'est 4.1 | `GET /api/moi` | `Moi` |
| 5.12 Personne n'a répondu hier | dedans | `GET /api/aujourdhui` (`rienADeviner: 'aujourd_hui'`, repère `rien`) | `Aujourdhui` |
| 5.13 Cercle incomplet | dedans | bandeau de `Aujourdhui` et de `Cercle` | — |
| 5.14 Lien déjà utilisé | dedans | `POST /api/lien` (`etat: 'deja_servi'`) | `LienOuvert` |
| N1 Sans invitation | nouveau | `GET /api/etat` (`dehors`, sans lien) | `Etat` |
| N2 Hors iPhone | nouveau | aucun avant ; `POST /api/compteur` | — |
| N3 Hors Safari | nouveau | aucun avant ; `POST /api/compteur` (`hors_safari`) | — |
| N4 Mention IA | nouveau | mot fixe de l'interface, sous chaque texte et sur la fiche | — |
| N5 Version de test (carte) | nouveau | `GET /api/accord` | `CarteAccord` |
| N6 « Qui, durée, droits » | nouveau | mots fixes de l'interface ; ses deux blancs : `GET /api/droits` | `Droits` |
| N7 Compte | nouveau | comme 1.8 | `EcranCompte` |
| N8 Bloc et guide de l'icône | nouveau | contexte de l'appareil ; `POST /api/passage` | `CodePassage` |
| N9 Première ouverture de l'icône | nouveau | `POST /api/passage/echanger`, sinon `GET /api/compte` (`connexion`) | `EcranCompte` |
| N10 Le message de 18h | nouveau | `Etat.message.clePublique` ; `POST /api/abonnement` | — |
| N11 Bandeau dans Safari | nouveau | contexte de l'appareil, avec `Etat.session: 'compte'` | — |
| N12 Déjà dans un cercle | nouveau | `LienOuvert` ou `refusConnexion: 'deja_dans_un_cercle'` | — |
| N13 Lien qui ne marche plus | nouveau | `LienOuvert` (`expire`, `deja_servi`, `inconnu`) | `LienOuvert` |
| N14 Tout effacer | nouveau | `GET /api/moi` (`aDesTitres`) ; `POST /api/tout-effacer` | `Moi` |
| N15 Cercle complet | nouveau | `LienOuvert` (`complet`), `Cercle.complet`, `refusConnexion: 'cercle_complet'` | — |
| N16 Entrée du créateur | nouveau | `LienOuvert` et `Entree` (`mode: 'createur'`), `BilanEntree` | — |

## 8. Ce que ce contrat touche (au titre de D-056)

Aucune décision du porteur n'est modifiée. Ce qui précise ou remplace une proposition, ou ajoute un élément, est signalé ici.

- **P-20 (proposé)** : la « connexion d'essai sur l'aperçu » devient une connexion d'essai **en local seulement**. Il n'y a plus d'aperçu en ligne avant la phase 6 (D-060, point 1). La bande « Version d'aperçu » n'a plus d'objet.
- **Le lien de créateur** (2.2) est un élément nouveau : `contenu-test.md` prévoit qu'on n'entre que par invitation (N1) et que le porteur envoie « [lien] » (N17), sans dire d'où vient ce lien. Proposé : un lien à usage unique par créateur, valable 7 jours, fabriqué par le porteur avec un outil du serveur.
- **P-29** : le lien se lie au navigateur à la première réponse enregistrée, comme proposé. La réponse et le pari arrivent en un seul échange (2.4), ce qui rend « pari, puis réponse de Thomas » impossible à contourner.
- **P-34** : l'accord est enregistré avant toute réponse, par le serveur, avec le texte exact servi par le serveur. Avec notre recommandation, il suit l'invité jusqu'à son compte, comme P-34 le propose.
- **P-08** : le code de passage suit la règle du « # ». Un repli après le « ? » toucherait P-08 et reviendrait en question (partie 4).
- **E3** : la révélation rouverte reprend au début, allégement déjà signalé au porteur (D-060).
- **R10** : l'ouverture de la manche passe par un geste explicite (`POST /api/deviner/ouvrir`), pour que « l'écran Deviner s'est affiché » soit un fait et non un effet de lecture.
- **`projet.md` §8** (« ordre des options tiré une fois par texte, identique pour tous ») : précisé par un tirage par empreinte (`FORMAT.md`, partie 4). Ce n'est pas un changement.
- **La connexion par e-mail** ne dit jamais si une adresse a un compte (2.5). C'est une précision de sécurité ; les mots de l'écran du code sont à écrire par UX.

## 9. Points ouverts

1. **Les trois réponses d'entrée de l'invité** : à trancher par Juridique et l'orchestrateur (`DECISIONS-TECHNIQUES.md`, partie 4). Si l'option de Front-end était retenue, les parties 2.3 et 2.4 changeraient : l'accord et la liaison du lien seraient enregistrés sans les réponses, envoyées ensemble à la création du compte.
2. **Le code de passage** : les trois questions de la partie 4 pour Juridique, puis l'essai sur l'iPhone du porteur en phase 6.
3. **Le lien de créateur** : sa forme et sa durée (2.2), à confirmer par l'orchestrateur et UX.
4. **Mots à écrire par UX** (`A_ECRIRE`) : l'écran du code en mode connexion (« Si cette adresse a un compte… ») ; `compte_inconnu` (« J'ai déjà un compte », mais aucun compte trouvé) ; `connexion_echouee` ; la variante « pas encore prêt » du message (N10) ; le message des limiteurs ; la phrase de « Qui, durée, droits » sur les réponses d'un invité qui ne crée pas de compte (7 jours au plus, si notre recommandation est retenue).
5. **Les durées proposées** : code de passage 30 minutes ; lien de créateur 7 jours ; joueur provisoire 7 jours (déjà sur la carte des données, `donnees.md`, partie 4).
6. **`GET /api/droits`** : les deux blancs de N6 (nom du porteur, adresse de contact) sont des réglages du serveur, pour ne pas les écrire dans le dépôt public. À confirmer par Juridique.

## 10. Limites et doutes

- **Ce contrat n'a été essayé par aucun écran.** La phase 1 le mettra à l'épreuve : des champs manqueront sans doute, et chaque ajout repassera par la liste fermée.
- **Hypothèses sur l'iPhone, à vérifier en phase 6 seulement** (D-060, point 1) : l'icône garde-t-elle le « # » de son adresse ; la connexion Apple ou Google lancée depuis l'icône tient-elle ; le contenu chiffré du message passe-t-il dans la forme d'iOS 18.4 (P-06, de mémoire).
- **Le dépôt est public** : les identifiants des textes, les textes et leurs votes à venir y sont lisibles. Un joueur curieux peut y chercher le vote d'un texte avant 18h. Limite déjà dite au porteur (`plan-version-test.md`, partie 1).
- **Le contexte de l'appareil se devine** : la vue Safari intégrée d'une messagerie (Gmail, par exemple) ne se distingue pas de Safari. Seul le repli de N8 la rattrape (`plan-version-test-frontend.md`, 1.5).
- **À observer avec de vraies personnes** : N9 est-il compris si le code de passage échoue ; l'écran du code en mode connexion, qui ne dit pas si l'adresse est connue, déroute-t-il ; un joueur qui garde Safari et l'icône ouverts en même temps voit-il des états contradictoires (deux onglets : `etape_incorrecte`, puis redemande).
