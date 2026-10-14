*Plan de travail de Front-end, 14 octobre 2026, conservé tel quel ; la synthèse relue est `plan-version-test.md`.*

# Plan de construction côté interface : version de test (Front-end, 14 octobre 2026)

Sources lues : `frontend.md`, `CLAUDE.md`, D-042 à D-059, `docs/etape-6/contenu-test.md` et le tableau des 51 écrans d'UX (`scratchpad/ux-contenu-test.md`, d'où viennent les totaux 22, 21 et 8), `produit.md` §5 et §6, `onboarding.md`, la liste des écrans de `maquettes-finales.html`, et le code : couche écrans de l'essai 2, `harnais/navigateur.js`, `harnais/passe-webkit.js`, la page-test et `test-18h/` (`public/`, `pages.ts`, `serveur.ts`, tests navigateur, `LISEZMOI.md`). Je n'ai modifié aucun fichier. Je n'ai pas touché à `/x.js`.

## 1. Réponse au brief

### 1.1 Ce qu'on reprend

**Gardé tel quel**
- **`style.css`, la partie « Téléphone : La Tablée »** (environ 200 lignes sur 362) : les couleurs du jour et du soir, les boutons, les options, les visages, les cartes de Deviner, la feuille, la barre du portrait, les zones de toucher de 44 px et `prefers-reduced-motion`.
- **Les polices réduites Alegreya et Alegreya Sans** (`polices/`, avec leurs licences OFL), servies par notre serveur. Rien n'est chargé ailleurs.
- **Le haut d'`interface.js`** : les outils de page (`h`, `ajouter`, `vider`), les petits blocs (`band`, `ttl`, `btn1`, `positions`, `raisons`, `faces`, `dot`, `feuille`, `tabbar`). On garde aussi le principe : à chaque changement, on redessine l'écran entier à partir de l'état. Le rendu passe par `createElement` et `textContent`, jamais par `innerHTML`.
- **`test-18h/public/sw.js`** : la réception, les deux formes de message (avant iOS 18.4 et après) et le signalement « reçu ».
- **`test-18h/public/app.js`, la logique seulement** : `depuisIcone()`, `messagesPossibles()`, la demande d'autorisation lancée directement par le toucher, et l'attente du service de réception limitée à 5 s.
- **La page-test** : la détection du contexte (autre navigateur, iPad qui se présente comme un Mac, page dans un cadre), la copie avec repli, et la vue de secours qui n'apparaît que par le style.
- **Les outils de test** : `harnais/navigateur.js` (appareil « iPhone 15 », mode app imposé, horloge, sombre, animations réduites), le principe de la passe WebKit sur une machine macOS de GitHub, et `tests/navigateur/` du test de 18h, qui soumet les vrais formulaires dans Chromium.

**Adapté**
- **`style.css`** :
  - on retire le contour dessiné du téléphone : l'écran occupe tout l'iPhone, avec les zones sûres ;
  - on retire tout le « cadre » de l'essai (gris froid, frise, bande, carnet) ;
  - l'avis du cercle passe de l'escalier à une barre en cinq parts, d'une seule teinte (`contenu-test.md`, partie 1).
- **`interface.js`** : environ 35 à 40 % des 2 251 lignes se reprennent. Ce sont les écrans de l'entrée (1.2 à 1.9), Deviner, Répondre, la raison, En attendant, la révélation et l'avis du cercle.
  - Ils liront une réponse du serveur au lieu du socle, du moteur et du calendrier.
  - La révélation montre la carte d'un coup, sans retournement, et sans total de points.
  - Tout le reste est abandonné : le socle, les sauts, le rattrapage, le carnet, le cadre, le dévoilement, le témoin.
- **`textes.js`** :
  - on garde les mots validés des écrans du test ;
  - on ajoute N1 à N16 (annexe de `contenu-test.md`) ;
  - on retire les textes du cadre et la table des huit valeurs (le portrait vient après le test, et ses mots sont dépassés par D-053) ;
  - on garde la marque `A_ECRIRE` : un test refuse toute mise en ligne qui en contient encore une.
- **`noyau.js`** : on n'en extrait que la typographie (`typographier`), les élisions (`dePrenom`, `quePrenom`) et `listeEt`.
- **Le manifeste et les icônes** : nom « Elenchos », couleurs de La Tablée, images tirées de `docs/identite/logo/` (D-050).

**À écrire**
- Un petit client du serveur, et une fonction pure qui décide quel écran montrer à partir de ce que dit le serveur.
- Le compte à rebours calé sur l'heure du serveur (R10) : le téléphone ne lit jamais sa propre heure pour 18h.
- Les écrans N1 à N16 et le « jeton de passage » (partie 1.5).
- La mise à jour forcée de l'icône : le serveur annonce sa version, et l'icône se recharge si elle a changé. Sans cela, une icône peut garder un ancien code après une mise en ligne.
- Le service de réception complété : un toucher sur le message ouvre la révélation.
- Les mesures sur les gestes, sans aucun contenu (D-041).
- Les tests.

Le moteur de règles de l'essai (`moteur.js`) n'est pas de l'interface. S'il est porté côté serveur, c'est le travail de Back-end et de Game design.

### 1.2 Le choix technique

| Option | En une ligne |
|---|---|
| **A. Sans cadriciel ni fabrication (Recommandé)** | Des modules JavaScript que Safari 16.4 lit tels quels, typés par des commentaires et vérifiés par `tsc` dans le contrôle, comme `test-18h/public/app.js`. Le code de l'essai se reprend tel quel, sans dépendance de plus et sans étape de fabrication qui pourrait casser chez Scalingo. Un humain le relit sans outil (D-043). |
| B. Preact et htm, copiés dans le dépôt | Des composants plus déclaratifs, mais une dépendance à suivre, pour un gain faible sur une soixantaine d'écrans simples. |
| C. Svelte ou React, avec Vite | Plus d'outils, plus de dépendances, et une fabrication à faire tourner chez Scalingo. Rien ne le justifie pour un test. |
| D. Pages rendues par le serveur | Très robuste, mais chaque geste recharge la page dans l'icône. La révélation, une chose à la fois, devient laborieuse. |

Ce qui accompagne le choix A :
- **Une seule page.** L'adresse ne change pas, sauf pour une invitation, le jeton de passage et la page « hors iPhone ».
- **Rien dans le téléphone**, sauf le cookie de session, posé par le serveur, invisible du script et de longue durée. Une position choisie mais pas encore validée reste en mémoire seulement, comme à l'essai.
- **Une règle de sécurité stricte** (CSP) : aucun script ni aucune police d'ailleurs, ce qui applique la règle 3 de Juridique (« rien d'Apple ni de Google avant le toucher »).
- **Le service de réception met en cache les seuls fichiers de l'interface.** Les données passent toujours par le réseau. Sans réseau, un bandeau le dit ; son texte est `A_ECRIRE`, pour UX.

**Contrat à convenir avec Back-end au jalon 0** : le serveur rend, pour chaque écran, des données déjà calculées (cartes servies, verdicts, avis du cercle, titres, phrase du jour). L'interface ne calcule aucune règle.

Point à trancher avec Back-end et Juridique : les trois réponses d'entrée données avant le compte. Je recommande de les garder dans l'onglet (`sessionStorage`, qui survit au passage par Apple ou Google dans le même onglet) et de les envoyer d'un seul coup à la création du compte. Ainsi, la base ne garde rien d'un invité qui s'arrête en route.

### 1.3 Les écrans, en lots de construction

Il y a 43 écrans validés (22 dedans, 21 allégés) et 16 écrans nouveaux. N17 est le message du porteur, pas un écran.

- **A. Hors jeu et contexte** : N1, N2, N3, N12, N13 (avec 5.14), N15, et la vue de secours.
- **B. Entrée** :
  - 1.1 allégé (un aperçu du lien fixe) ;
  - 1.2 avec N4 et N16 ;
  - 1.3 avec N5, et N6 ;
  - 1.4, 1.5 et 1.6 ;
  - 1.7 allégé, ou le bilan du créateur (N16) ;
  - 1.8 redessiné (N7) avec « Pourquoi Elenchos ? » (D-049) ;
  - 1.9 sans « Plus tard » ;
  - 5.1 et 1.14.
- **C. La journée** :
  - 1.12 ;
  - 1.13 avec le bloc N8 ;
  - 2.1 avec le repère de la journée, et 2.2 ;
  - 2.3, 2.4 et 2.5 (avec N8 ou N11) ;
  - 5.12 ;
  - 5.13, avec le même bandeau pour 5.9 et 5.10.
- **D. 18h et dimanche** :
  - le toucher sur le message 2.6 ouvre la révélation (les mots du message sont envoyés par le serveur) ;
  - 2.7a à 2.7c allégés ;
  - 2.7d avec l'avis du cercle allégé ;
  - 2.7e et 2.7f ;
  - 3.1, et 3.3a à 3.3c sur un seul écran ;
  - 1.10, 1.11 (les écrans 1.5 à 1.7 réutilisés en miroir), 1.15 allégé ;
  - « Revoir la révélation ».
- **E. Icône et message** : le guide N8, N9, N10 et ses trois variantes, N11, plus le manifeste, l'icône et le service de réception.
- **F. Le Cercle et Moi** :
  - 4.2 allégé ;
  - 4.1 et 5.11 allégés (la barre en simple compteur, D-058), avec 5.3 fondu dedans ;
  - 5.4 allégé, 5.7 allégé, N14.

Restent après le test : 3.2, 3.3d, 3.3e, 4.3, 5.2, 5.5, 5.6 et 5.8.

### 1.4 Les jalons

*Unité : le jour de travail d'agent, celle des plans de l'essai 2. Ces plans avaient prévu 5,5 à 7 jours de calendrier pour la page, et ce délai a tenu. Ici, la confiance est moyenne à faible : c'est le premier code avec un vrai serveur, de vraies connexions et un vrai iPhone.*

| # | Ce qui est construit | La preuve | Ce que le porteur voit ou fait | Durée | Avec Back-end |
|---|---|---|---|---|---|
| 0 | Contrat de données écran par écran ; squelette ; styles ; textes ; outils de test | `npm run controle` (types, secrets) ; tests de la typographie et des textes ; la coquille s'ouvre dans Chromium en taille iPhone 15 | Rien (point d'étape) | 1 à 1,5 j | **Ensemble** |
| 1 | Lots A à F sur des données d'exemple : créateur seul, à deux, à trois, à cinq ; avant et après 18h ; dimanche ; personne n'a répondu ; Android ; hors Safari | Pour chaque écran et chaque état, dans Chromium aux tailles iPhone 15 (393 × 852) et iPhone SE (375 × 667), clair, sombre et soir : rien ne déborde sur le côté ; geste principal visible ; zones de toucher ≥ 44 px ; chaque bouton a un nom lu par VoiceOver ; aucun `A_ECRIRE` ; contrôle des lignes rouges sur le texte affiché (aucun « % », aucun classement) ; captures | Une planche de captures, comme les maquettes : il relit les écrans | 4 à 6 j | **En parallèle** (deux instances Front-end possibles après le jalon 0, comme à l'essai 2 : environ 2 jours de calendrier gagnés) |
| 2 | Branché sur le vrai serveur ; connexion d'aperçu par code (comme les codes d'essai du test de 18h) ; proches simulés ; « passer à 18h » réservé à l'aperçu | Un test de bout en bout : quatre joueurs dans Chromium jouent l'entrée, Deviner, Répondre, 18h et le dimanche, horloge pilotée ; aucune requête vers un tiers | **Il joue sur son iPhone, à l'adresse Scalingo** (voir la question en fin de partie), environ 20 minutes | 2 à 3 j | Dépend des points d'accès du serveur |
| 3 | Icône, guide, jeton de passage, N9, N10, mise à jour forcée | Tests du service de réception (repris du test de 18h) ; mode app imposé ; échange du jeton | Il ajoute l'icône et vérifie qu'il est encore connecté dedans. Le bouton du message reste inactif (D-059) | 1,5 à 2,5 j | Dépend de l'envoi des messages (repris du test de 18h) et du jeton |
| 4 | Contrôles | Passe WebKit sur macOS (GitHub) ; vitesse (premier écran en moins d'une seconde avec un processeur ralenti quatre fois ; chaque geste en moins de 100 ms) ; texte agrandi ; VoiceOver lu dans le code | Un rapport d'une ligne | 1,5 à 2 j | En parallèle |
| 5 | Domaine, vraies connexions Apple, Google et e-mail, test du message de 18h | Le pas-à-pas existant, adapté | Il décide du domaine (D-059 à reposer), règle Apple et Google, et vit trois soirs de test | 1 à 2 j, plus 3 soirs | **Ensemble** |
| — | Retouches après ses essais | Tests rejoués | — | 2 à 3 j | — |

**Total Front-end : 13 à 20 jours de travail. En calendrier : environ 4 à 7 semaines**, avec les points d'étape (D-020) et les limites d'utilisation (D-018), sans compter l'attente de la décision sur le domaine. C'est dans la fourchette annoncée par D-057. Le plus gros inconnu porte sur les jalons 3 et 5 : si la reconnexion dans l'icône échoue sur iPhone, comptez 2 à 5 jours de plus, ou la question de TestFlight revient (D-057).

**L'adresse de Scalingo suffit-elle pour un aperçu ?** Oui pour les écrans, l'ajout de l'icône, le mode app et le service de réception. Quatre limites :
1. **Apple et Google** risquent de refuser cette adresse (D-054, point 2). D'où la connexion d'aperçu par code.
2. **L'e-mail du code** demande un domaine vérifié pour l'envoi (D-057). Même solution.
3. **L'icône et l'abonnement** sont liés à l'adresse : on les réinstalle quand le domaine arrive.
4. **Le message de 18h** marcherait techniquement sur cette adresse. Mais D-059 dit que le test attend : je le laisse inactif dans l'aperçu.

Il faut aussi une seule application chez Scalingo, en mode aperçu, avec des données inventées seulement. La base est vidée, et la suppression vérifiée, avant le premier vrai joueur (à confirmer par Back-end).

### 1.5 Les risques, et ce que je simplifierais encore

1. **L'ajout de l'icône.** iOS ne permet pas de le proposer tout seul. Ce qui aide : le guide N8 au bon moment, le bandeau N11 qui revient, et la mesure. Si moins de deux iPhone sur trois installent l'icône, c'est le critère de D-005 ; le repli est TestFlight (D-057).
2. **La reconnexion dans l'icône.** L'icône a sa propre mémoire, séparée de Safari (`test-18h.md`). Je propose un **jeton de passage**, piste d'UX que je juge faisable ; c'est une hypothèse, à vérifier sur l'iPhone du porteur au jalon 3, sans frais.
   - Juste avant le guide, la page remplace son adresse par une adresse qui porte un code à usage unique et de courte durée (durée : Back-end).
   - Le manifeste n'impose pas d'adresse de départ. L'icône s'ouvre donc sur cette adresse, et le serveur échange le code contre une session dans l'icône.
   - Le bouton « Copier le lien » du guide copie toujours l'adresse sans code.
   - Si le jeton échoue : N9.
   - L'icône garde à vie un code déjà utilisé, donc sans valeur. Juridique doit relire le principe d'un code dans une adresse.
3. **Les navigateurs intégrés aux applications.** Messages et SMS ouvrent Safari. Instagram et Facebook se reconnaissent à leur signature. Mais la vue Safari intégrée (Gmail, par exemple) ne se distingue pas de Safari : seul le repli de N8 (« « Sur l'écran d'accueil » n'apparaît pas ? ») la rattrape. La liste reste à vérifier sur de vrais téléphones. **Fait à transmettre à UX** : depuis iOS 16.4, les autres navigateurs peuvent aussi ajouter une page à l'écran d'accueil, d'après mon souvenir du blog WebKit, non revérifié aujourd'hui. N3 (« ça ne marche que depuis Safari ») serait alors trop strict, mais il reste plus simple à expliquer.
4. **Les iOS récents.**
   - Sur iOS 26, le bouton Partager est sous « ⋯ », et l'interrupteur « Ouvrir comme app web » est activé par défaut. N8 couvre les deux cas.
   - Depuis iOS 18.4, une seconde forme de message existe ; `sw.js` la traite déjà.
   - Sous iOS 16.4 : la variante « trop ancien » de N10.
   - Dans l'icône, il n'y a pas de menu de taille du texte. Je recommande de suivre la taille du texte de l'iPhone avec un plafond, à tester. Le zoom aux doigts n'est jamais bloqué.
5. **Une icône qui garde un ancien code** après une mise en ligne : la version annoncée par le serveur et le rechargement forcé.

**Ce que je simplifierais encore :**
- **Pas de mode hors ligne au-delà de la coquille.**
- **La révélation rouverte reprend au début** si l'app a été fermée, au lieu de reprendre « là où on l'avait laissée ». C'est un allégement de E3, à signaler au porteur (D-056).
- **Pendant tout l'aperçu, aucune connexion Apple, Google ou e-mail** : les vraies connexions arrivent toutes ensemble au jalon 5, avec le domaine.

### Question au porteur (à poser par l'orchestrateur, D-042 et D-055)

**Quand ouvrir l'application chez Scalingo pour l'aperçu sur votre iPhone ?**
- **Au jalon 2 (Recommandé)** : vous jouez la boucle sur votre iPhone avant la fin, et vous corrigez tôt. Cela lance les 30 jours d'essai (D-055) : la suite, environ 26 € TTC par mois (D-048), vous sera présentée une semaine avant la fin.
- **Au jalon 5 seulement** : rien n'est payé avant. Mais jusque-là, vous ne voyez que des captures, sans rien jouer.

## 2. Décisions antérieures touchées

- **E3** (révélation reprise là où on l'avait laissée) : allégement proposé pour le test seulement ; à signaler (D-056).
- **D-059** : respectée. Le message de 18h reste inactif dans l'aperçu.
- **D-019** : non touchée. Aucun aperçu sur `gh-pages`.
- **D-055 et D-042** : l'ouverture de Scalingo est une dépense, présentée par la question ci-dessus.
- **Jeton de passage** : choix technique laissé à l'équipe (D-048), sans décision touchée. Il ajoute un code dans une adresse : relecture par Juridique et Back-end.
- **N3** : un fait à revérifier par UX, pas une décision.

## 3. Limites et doutes

- **Aucun vrai iPhone dans nos tests.** Le WebKit de l'outil sous macOS n'est pas Safari sur iOS : ni mode app, ni clavier, ni zones sûres réelles. Seul l'iPhone du porteur le dira, et les autres versions d'iOS seulement avec les joueurs (D-057).
- **Trois hypothèses à vérifier :**
  - l'adresse de départ de l'icône quand le manifeste n'en impose pas (jeton de passage) ;
  - la connexion Apple et Google lancée depuis l'icône ;
  - la liste des navigateurs intégrés qu'on reconnaît.
- **Les durées sont des estimations**, sans mesure faite sur ce type de travail.
- **À observer avec de vraies personnes :**
  - le guide N8 est-il suivi sans aide ;
  - « Encore un geste » (N9) est-il compris ;
  - la première séance tient-elle en 4 à 5 minutes ;
  - comment VoiceOver lit-il la révélation et l'avis du cercle ;
  - le texte agrandi tient-il sur les écrans « sans faire défiler ».

Fichiers utiles :
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/style.css`
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/interface.js`
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/textes.js`
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/noyau.js`
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/harnais/navigateur.js`
- `/home/user/elenchos/docs/essai/a-ne-pas-ouvrir-2/outillage/page/harnais/passe-webkit.js`
- `/home/user/elenchos/docs/essai/page-test-icone/source.html`
- `/home/user/elenchos/test-18h/public/sw.js`
- `/home/user/elenchos/test-18h/public/app.js`
- `/home/user/elenchos/test-18h/tsconfig.page.json`
- `/home/user/elenchos/test-18h/tests/navigateur/formulaires.test.ts`
- `/home/user/elenchos/docs/etape-6/contenu-test.md`
- `/tmp/claude-0/-home-user-elenchos/aab25699-b440-58aa-ae88-65e053f9256b/scratchpad/ux-contenu-test.md`