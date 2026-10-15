*Plan de travail de Back-end et Front-end, 15 octobre 2026, conservé tel quel ; la synthèse relue est `plan-jeu-entier.md`.*

# Back-end et Front-end : le jeu entier sur iPhone, testé par TestFlight (15 octobre 2026)

Nous avons lu `backend.md`, `frontend.md`, `CLAUDE.md`, D-042 à D-062, `produit.md`, `regles.md` (titres et journées), `donnees.md` (titres), `plateforme.md` (annexe A), les trois plans de la version de test, `jeu/CONTRAT.md`, `jeu/DECISIONS-TECHNIQUES.md` et `jeu/src/contrat.ts` (textes des messages). Nous avons aussi regardé le code de `test-18h/` et les fonctions de `moteur.js` (essai 2). Nous avons fait des recherches sur le web. Aucun fichier n'a été modifié et `/x.js` n'a pas été touché.

**Comment lire les faits** : « vérifié » veut dire lu sur une page officielle aujourd'hui. « Sources tierces » veut dire lu sur un autre site que celui de l'entreprise. « De mémoire » veut dire non revérifié. Les sources sont à la fin.

---

## 1. Le plan en une page (pour le porteur)

**Le but.** On construit tout le jeu validé et on le met dans une vraie application iPhone. Vos amis l'installent par TestFlight, l'application d'Apple qui sert à essayer une version de test. Ils jouent au moins deux mois. Ensuite vient la deuxième version, publique.

| # | Étape | Ce qui se construit | Ce que vous voyez ou faites | Durée |
|---|---|---|---|---|
| 1 | **Les fondations, et la preuve qu'Apple suit** | Plusieurs pièces : <br>– le serveur, c'est-à-dire l'ordinateur loué chez Scalingo qui garde les règles et les réponses ; <br>– la base de données et l'horloge de 18h ; <br>– toutes les règles du jeu, portrait compris, reprises du second essai ; <br>– une première application presque vide, fabriquée sans Mac, qui arrive sur votre iPhone et reçoit le message de 18h. | Environ 2 heures, avec un pas-à-pas : <br>– trois réglages dans votre compte Apple (le nom de l'application, la clé des messages, la clé de fabrication) ; <br>– l'ouverture de Scalingo, avec votre carte (D-055) ; <br>– trois soirs de suite, vous vérifiez que le message arrive avant 18h05. | 2 à 3 semaines |
| 2 | **L'entrée et la journée** | Le défi des trois textes, la carte de consentement et le compte (Apple, Google, e-mail). Puis jusqu'à trois cercles, l'invitation, Deviner, Répondre, la révélation de 18h et les titres du dimanche. | Vous jouez sur votre iPhone avec des proches inventés, une vingtaine de minutes à chaque point d'étape. | 3 à 4 semaines |
| 3 | **Le long terme** | Le portrait et ses curseurs, l'écran d'un proche, les tempéraments, les badges rares, les titres passés et la phrase du dimanche. Aussi la pause et le sommeil d'un cercle, quitter un cercle, et un texte corrigé après coup. | Vous parcourez sur votre iPhone un cercle inventé « vieux de trois mois ». | 2 à 3 semaines |
| 4 | **Finitions et vérification** | La lisibilité (texte agrandi, lecture à voix haute), la vitesse et une vérification complète. La page « Qui, durée, droits » mise en ligne, car Apple la demande. Le domaine elenchos.fr, qui allume aussi la connexion par e-mail. Enfin, la base vidée de tout ce qui était inventé. | Vous achetez le domaine (environ 6 €, avec un pas-à-pas), vous réglez votre nom et votre contact, et vous donnez votre feu vert. | 1 à 2 semaines |
| 5 | **Apple relit, vos amis arrivent** | L'envoi à Apple pour sa relecture des versions de test, et vos messages d'invitation. | Vous remplissez le formulaire d'Apple avec nos textes. Quand Apple a donné son accord, vous envoyez à vos premiers créateurs de cercle le lien TestFlight et leur lien de créateur. | 1 à 2 semaines |
| 6 | **Le test** | Les corrections, jamais de 15h à 19h ni le dimanche. Une nouvelle version au moins tous les 90 jours, car Apple les fait expirer. | Chaque soir, vous vérifiez que le message est parti. Un point à mi-test. À la fin, tout est effacé (D-061), puis vient le bilan, puis la deuxième version. | 8 semaines au moins |

**En parallèle des étapes 1 à 4**, Contenu écrit et vérifie environ 70 textes : de quoi couvrir deux mois et demi de jeu, plus une réserve. La version de test réduite en prévoyait 34.

**Jusqu'aux premiers amis : 10 à 14 semaines**, soit entre fin décembre 2026 et fin janvier 2027.
- Notre confiance est moyenne à basse, et ce n'est pas un engagement.
- La fourchette compte vos feux verts, l'attente d'Apple et les fêtes.
- On vous a annoncé 2 à 3 mois : notre fourchette commence au haut de cette annonce et peut aller un mois au-delà.

**Ce que ça coûte**

*Ponctuel :*
- le domaine : environ 6 € la première année ;
- le compte Apple : déjà payé (renouvellement annuel d'environ 99 €, de mémoire) ;
- un Mac : 0 €, vous n'en avez pas besoin (partie 2).

*Mensuel :*
- Scalingo : environ 26 € TTC par mois, après 30 jours gratuits ;
- 0 € pour le reste : TestFlight, les messages de 18h, les e-mails (gratuits sous 300 par mois) et la fabrication de l'application.

*Total d'ici la fin du test (environ cinq mois et demi) :*
- **environ 110 €** si vous voyez le jeu sur votre iPhone dès l'étape 1 (recommandé, question 1) ;
- **environ 60 €** si l'on attend l'étape 4.

La deuxième version publique aura ses propres coûts : la mise à niveau de D-056 (structure, avocat, hébergement plus solide). Ils vous seront présentés le moment venu (D-042).

**Deux choix vous reviennent** (partie 4). Tout le reste, l'équipe le tranche et vous le dit en une ligne.

---

## 2. Ce qui change techniquement avec une application iPhone

### 2.1 L'emballage : Capacitor, avec l'interface dans l'application

- **A. Capacitor (Recommandé).** C'est un outil libre, pas un prestataire. Il met nos écrans web dans une application. Il ajoute quelques petits morceaux écrits en Swift, le langage d'Apple : le message, la connexion Apple, le trousseau.
  - L'interface déjà prévue reste telle quelle : des modules JavaScript sans étape de fabrication, et des tests dans Chromium et WebKit.
  - Un humain pourra encore reprendre le code (D-043).
- B. Une application réécrite en Swift : plus fine, mais tous les écrans sont à refaire, par des agents qui n'ont ni Mac ni simulateur d'iPhone pour voir ce qu'ils écrivent.
- C. React Native avec Expo : les écrans sont à réécrire, et la fabrication passe commodément chez Expo, une société américaine qui voit le code. Rien de gagné sur A.

**Décision de l'équipe : l'interface est embarquée dans l'application, et non chargée depuis le serveur.**
- Pourquoi : Apple refuse les applications qui ne sont qu'un site emballé (règle 4.2, qui comptera pour la deuxième version), et la coquille s'ouvre même sans réseau.
- Le prix : chaque correction d'écran demande une nouvelle version de l'application. La fabrication est automatique et prend environ une heure.
- Le numéro de version reste « 1.0 » pendant tout le test, et seules les fabrications successives changent. Apple ne relit en entier que la première fabrication d'une version ; les suivantes n'ont souvent pas besoin de relecture (vérifié).

### 2.2 Le message de 18h

- **Il passe par le service de notifications d'Apple, sans intermédiaire.**
  - Le serveur s'adresse directement à Apple, signé par une clé `.p8` que vous créez dans votre compte Apple. Elle est réglée chez Scalingo, jamais dans le dépôt, et vous en gardez une copie hors ligne.
  - Node fait cela seul, avec `http2` et `crypto`, sans bibliothèque de plus.
  - Les versions TestFlight utilisent le service de production d'Apple, pas son service d'essai (de mémoire, à régler dès l'étape 1).
- **Dans le téléphone**, le module de notifications de Capacitor donne directement l'adresse d'envoi d'Apple, sans Firebase (relevé dans la documentation de Capacitor).
  - L'accord est demandé au même moment qu'avant : au compte à rebours, après la révélation du défi, jamais avant, et seulement après un toucher.
  - UX réécrit N10 ; la variante « iPhone trop ancien » disparaît.
- **Ce qu'on reprend de `test-18h/`** :
  - **tel quel** : `horloge.ts`, `garde-horaires.ts`, `crypto.ts`, `journal.ts` et le chiffrement de `base.ts` ;
  - **adapté** : `planificateur.ts` (un envoi par jour, verrou par abonnement, rattrapage jusqu'à 18h30) et `config.ts` ;
  - **remplacé** : `push/chiffrement.ts`, `envoyeur.ts` et `services.ts`, propres au message web, par un envoyeur vers Apple d'environ 150 lignes ;
  - **retiré** : `sw.js` et la logique de `app.js` (`depuisIcone`, `messagesPossibles`).
  - Une adresse d'envoi refusée par Apple (appareil désinstallé) est retirée.
- **La mesure « message reçu »** (`produit.md` §8, validée) est gardée.
  - Une petite extension de l'application, en Swift, signale la réception avec le seul numéro d'envoi tiré au hasard, comme `/api/recu` aujourd'hui. Coût : environ un jour.
  - Si elle résiste, on mesure seulement « ouvert depuis le message », et on vous le dit.
- **Apple peut lire le texte du message dans une application**, contrairement au web (`plateforme.md`, annexe A).
  - Les six textes de 18h ne contiennent rien de personnel.
  - L'annonce d'arrivée contient un pseudo (« {pseudo} a relevé ton défi. »), sans aucune opinion. C'est couvert par D-043 (l'acheminement par Apple est accepté) ; Juridique relit ce texte, comme c'était déjà prévu.
- **Le test de 18h se fait sur le jeu lui-même** (D-060, point 3) :
  - trois soirs à l'étape 1, sur la première version de l'application ;
  - un soir de contrôle à l'étape 4, sur le jeu complet ;
  - même critère : le message arrive avant 18h05.
- **Les heures de mise en ligne valent aussi pour l'application** (D-043, D-054). Les testeurs reçoivent les mises à jour d'eux-mêmes : une version qui arriverait à 17h55 présente le même risque qu'une mise en ligne du serveur. Donc :
  - aucune nouvelle version n'est proposée aux testeurs de 15h à 19h ni le dimanche ;
  - l'application ne se fabrique que depuis la branche `mise-en-ligne`, après votre feu vert de la veille.

### 2.3 La connexion dans une application

- **Apple, en natif** : la feuille d'Apple, avec Face ID.
  - Le serveur vérifie le jeton signé par Apple, qui doit viser notre application.
  - Ni identifiant de service web, ni domaine ne sont nécessaires.
  - On ne demande que l'identifiant (D-061).
- **Google** : Google interdit sa connexion dans une page web intégrée à une application.
  - On ouvre la feuille de navigateur du système (ASWebAuthenticationSession) sur le parcours déjà écrit dans `connexion.ts` (`oauth4webapi`).
  - Le retour vers l'application porte un code à usage unique, placé après le « # », valable une minute.
  - Aucune bibliothèque de Google n'est mise dans l'application.
  - Chez Google, l'écran d'accord est publié « en production » avec la seule demande d'identifiant. Sinon, Google limite la connexion aux comptes listés à la main ; la publication sans vérification vaut pour cette seule demande (de mémoire).
- **E-mail** : inchangé (Scaleway), allumé à l'étape 4 avec le domaine.
- **La session.**
  - Dans l'application, la page et le serveur n'ont pas la même adresse, et iOS bloque les cookies dans ce cas (de mémoire).
  - La session devient donc un jeton gardé dans le trousseau de l'iPhone et envoyé dans un en-tête.
  - P-11 tient : le téléphone ne garde que ce jeton.
  - Le serveur n'accepte plus que l'adresse de l'application. Le contrôle d'origine et les cookies `__Host-` sont remplacés.
  - Les routes du contrat ne changent pas.
- **Les règles d'Apple** :
  - effacer son compte dans l'application (règle 5.1.1 (v)) : c'est « Tout effacer » ;
  - Google proposé, donc une connexion qui protège la vie privée aussi (règle 4.8) : c'est Apple ;
  - **à la deuxième version**, Apple demande de révoquer la connexion Apple quand un compte est effacé (de mémoire). On demandera alors au joueur de se reconnecter au moment d'effacer, pour révoquer sans garder de jeton. L'allègement de D-061 reste valable pour le test.

### 2.4 Ce qui disparaît

**Les écrans et mécanismes de l'icône :**
- le guide d'ajout de l'icône (N8), « Encore un geste » (N9), le bandeau dans Safari (N11) et « ouvre dans Safari » (N3) ;
- le code de passage (`CONTRAT.md`, partie 4 ; `/api/passage` et `/api/passage/echanger`).

**Les mesures liées à l'icône :**
- le geste `ouverture_icone` et le compteur `hors_safari` ;
- le critère de D-005 (« deux iPhone sur trois installent l'icône ») et la mesure du geste d'ajout.

**Le reste :**
- le service de réception, le chiffrement du message web, le manifeste et les icônes web ;
- la mise à jour forcée de l'icône. Elle est remplacée par une « version minimale » annoncée par le serveur ; en dessous, un écran « Mets à jour Elenchos dans TestFlight » (mots : UX) ;
- le plancher d'iOS 16.4. Le plancher devient celui de Capacitor (iOS 15 environ, de mémoire, à confirmer), ce qui ouvre le jeu à plus d'iPhone.

**Ce qui reste en web, sur elenchos.fr :**
- le lien d'invitation ouvre l'application si elle est installée (un fichier posé sur le domaine fait le lien) ;
- sinon, une page dit : « 1. Installe TestFlight. 2. Installe Elenchos (lien public). 3. Reviens toucher ce lien. » (mots : UX) ;
- N2 (Android, ordinateur, iPad) reste, et N1 devient la page publique qui porte « Qui, durée, droits ».

**Pour l'entrée (D-006)**, le premier écran du jeu reste un texte, mais l'installation passe avant, soit trois gestes de plus.

### 2.5 Fabriquer l'application, et la question du Mac

- **Xcode Cloud : écarté.**
  - 25 heures par mois sont bien incluses dans le compte Apple (vérifié).
  - Mais sa mise en route se fait dans Xcode, donc sur un Mac (vérifié).
- **Retenu : les machines macOS de GitHub.**
  - Elles sont gratuites pour un dépôt public (vérifié).
  - Elles fabriquent l'application, la signent automatiquement et l'envoient à TestFlight, avec une clé d'accès d'App Store Connect (une seconde clé `.p8`, que vous créez une fois).
  - Comptez environ 15 à 20 minutes par fabrication.
  - Si le dépôt devient privé, la part gratuite du mois couvre une dizaine de fabrications (règle de calcul relevée sur des sources tierces).
- **À vérifier au tout début de l'étape 1 : l'accès à cette clé pour un compte individuel.**
  - Vous demandez l'accès vous-même, comme titulaire du compte.
  - Des forums parlent de comptes individuels refusés autrefois, et d'une erreur sur un compte neuf en 2026.
  - Premier repli : une clé personnelle, plus limitée, et le certificat de signature créé une fois depuis le site d'Apple. La demande de certificat se fabrique sans Mac.
  - Dernier recours : louer un Mac en ligne pour une journée (Scaleway en propose, quelques euros, de mémoire).
- **Vous n'avez pas besoin de Mac.**
  - Dit franchement : sans Mac, un défaut qui n'apparaît que sur un vrai iPhone est plus long à comprendre, car l'inspecteur de Safari demande un Mac.
  - Parade : l'application signale ses erreurs au serveur, sans aucun contenu de joueur. Si l'on reste bloqué, on loue un Mac pour la journée.
- **Nos tests** :
  - l'interface dans Chromium et WebKit, comme prévu ;
  - l'application lancée dans le simulateur d'iPhone des machines de GitHub, avec des captures ;
  - le message et les vraies connexions : votre iPhone seulement.

### 2.6 Le domaine

- **D-060, point 2 tient** : le domaine est acheté avant les joueurs, à l'étape 4.
- **Il sert à trois choses** :
  - la page de confidentialité. Le champ existe pour les testeurs externes (sources tierces) ; nous le traitons comme obligatoire ;
  - les liens d'invitation qui ouvrent l'application ;
  - la voie e-mail.
- **Il ne sert pas** pour fabriquer l'application, envoyer le message, se connecter avec Apple, ni pour vos propres essais. Avant le domaine, les invitations s'essaient sur l'adresse gratuite de Scalingo.
- **Changer d'adresse plus tard** ne demande qu'une nouvelle version de l'application, sans rien réinstaller : c'était le gros défaut de l'icône.
- **Le relecteur d'Apple** entre avec un lien de créateur donné dans les notes de relecture. Son compte est effacé ensuite.

---

## 3. Ce qui se garde

- **`jeu/CONTRAT.md` et `jeu/src/contrat.ts`.**
  - **Gardé** : les règles 1.1 à 1.7 (le serveur calcule, liste fermée, rien dans les adresses, rien avant 18h, les lectures ne changent rien), l'heure du serveur (partie 3), les erreurs et presque toutes les routes.
  - **Adapté** : la connexion par en-tête, l'abonnement au message d'Apple, la version minimale, et la suppression de la partie 4 et du geste de l'icône.
  - **Ajouté** : ce que D-058 avait retiré (plusieurs cercles, portrait, écran d'un proche, titres passés, tempéraments, badges, pause et sommeil, quitter un cercle).
  - Coût : environ 1,5 à 2 jours.
- **`jeu/DECISIONS-TECHNIQUES.md`.**
  - **Gardé** : la pile (Node 22, TypeScript lu tel quel, `pg`, `oauth4webapi`) ; l'interface sans cadriciel, toujours valable dans Capacitor puisque les fichiers y sont copiés tels quels ; les rôles de base et leur repli ; les empreintes avec clé ; le chiffrement des réponses ; le joueur provisoire (option B) ; les tests en quatre groupes et le contrôle.
  - **Changé** : 1.3 (plus de manifeste), 1.8 (sessions par jeton) et 1.10 (version minimale au lieu du cache).
- **`jeu/textes/FORMAT.md`** : gardé ; le lot passe à environ 70 textes.
- **Les textes d'écran validés** et l'annexe N1 à N18, sauf N3, N8, N9 et N11. N10 est à réécrire.
- **Les règles** : `produit.md` et `regles.md`. Les dix journées jouées à la main deviennent des tests.
- **Le moteur de l'essai 2 sert maintenant presque en entier.**
  - Il contient déjà `curseur`, `pasDeCote`, `calculerTemperaments`, `phraseSemaine`, `calculerManche` (les réponses inattendues, R3) et `calculerTitres`.
  - La version de test les abandonnait ; le jeu entier les porte en TypeScript.
  - Il sert aussi de référence : on compare les deux moteurs sur des milliers de manches tirées au hasard.
- **De l'essai 2** : `style.css` (La Tablée), les polices, les petits blocs d'`interface.js` et les outils de test dans le navigateur.
- **De `test-18h/`** : voir 2.2.
- **De `donnees.md`** : les exigences P-xx et les quatre outils de test (traceur, réponses inversées, horloge simulée, relevé du réseau).
- **Les décisions D-059 à D-061** : domaine avant les joueurs, test de 18h sur le jeu, carte corrigée, tout effacé à la fin, pas de mention d'avocat.

---

## 4. Ce qui revient au porteur, et ce que l'équipe tranche

### Question 1 : quand voir le jeu sur votre iPhone ?
*D'où elle vient : D-060, point 1 (« rien n'est payé avant la phase 6 »). Elle engage de l'argent.*
- **Dès l'étape 1, dans environ 3 semaines (Recommandé).** On prouve tôt le plus gros inconnu : la chaîne d'Apple (fabriquer sans Mac, le message de 18h, la connexion). Il en coûte environ 50 € d'hébergement de plus sur toute la durée. Modifie D-060, point 1.
- **À l'étape 4 seulement**, comme le dit D-060. Vous économisez environ 50 €, mais un blocage chez Apple découvert si tard peut ajouter 1 à 3 semaines.

### Question 2 : si Apple refuse sa relecture pour les testeurs externes, que fait-on ?
*D'où elle vient : D-062, point 2 et D-042. La règle 5.1.1 (ix) d'Apple demande une société pour une application qui garde des données sensibles. Elle engage de l'argent ou une décision validée.*
- **Repli sur les testeurs internes (Recommandé).**
  - 0 € et aucune relecture : Apple n'examine pas ce mode.
  - Chaque ami reçoit une invitation à votre compte Apple de développeur, avec un accès limité à Elenchos.
  - Au plus 50 personnes, plafond d'Apple pour un compte individuel (vérifié).
  - C'est vous qui ajoutez chaque nouveau joueur : un ami ne peut plus faire entrer seul un proche.
- **Créer une société, puis l'inscrire chez Apple.** Plusieurs centaines d'euros, une nouvelle cotisation Apple (environ 99 €) et plusieurs semaines de délai. Modifie D-042 (en nom propre).
- **Revenir au lien et à l'icône** (D-057, point 1). 0 €, mais on refait ce que D-062 a remplacé.

### Ce que l'équipe tranche (D-009, D-062 point 5)

- **L'emballage** : Capacitor, avec l'interface embarquée dans l'application.
- **La fabrication** : sur les machines macOS de GitHub. Ni Xcode Cloud, ni Mac acheté ou loué.
- **Les testeurs** : vous êtes testeur interne dès l'étape 1, sans relecture. Vos amis sont testeurs externes, par un lien public, après la relecture d'Apple.
- **Le message de 18h** : par Apple, sans intermédiaire, avec une petite extension qui garde la mesure « message reçu ».
- **La connexion** : Apple en natif, Google par la feuille du système, e-mail inchangé.
- **La session** : un jeton dans le trousseau de l'iPhone, au lieu d'un cookie.
- **Les heures** : aucune nouvelle version de l'application proposée de 15h à 19h ni le dimanche, et seulement depuis `mise-en-ligne`, après votre feu vert.
- **La version** : le numéro « 1.0 » reste pendant tout le test, pour limiter les relectures d'Apple.
- **La révélation rouverte** reprend là où on l'avait laissée (E3 rétabli). L'allègement de D-060 tombe avec le jeu entier.
- **L'effacement après 12 mois sans ouvrir le jeu**, et l'e-mail 30 jours avant (D-045) : non construits pour le test. Ils ne peuvent pas se produire en deux mois, puisque tout est effacé à la fin (D-061). Ils reviennent à la deuxième version : c'est ce que le nouveau cap rend sans objet (D-062, point 4).
- **Restent allégés pour le test** : pas de copie des sauvegardes ailleurs, une seule application chez Scalingo (D-060).
- **Les textes** sont écrits en session, comme aux essais (D-057). La chaîne automatique (D-044) attend la deuxième version. À confirmer par Contenu.

---

## 5. Les risques, dits franchement

1. **Apple.**
   - La relecture des testeurs externes peut refuser l'application, au nom de la règle 5.1.1 (ix) (compte individuel, données sensibles) ou de la règle 4.2. Le repli est dans la question 2.
   - La relecture prend en général un à deux jours (de mémoire), davantage si Apple demande des corrections.
   - L'accès à la clé de fabrication pour un compte individuel n'est pas garanti (2.5). Un repli existe.
2. **La durée : 10 à 14 semaines, avec une confiance moyenne à basse.** Ce qui peut faire glisser :
   - les comptes et les clés Apple ;
   - les règles fines (plusieurs cercles, jumeaux, départs, portrait) ;
   - les limites d'utilisation des sessions et les fêtes ;
   - et surtout environ 70 textes. D'octobre à décembre, l'Assemblée vote surtout les budgets : il faudra remonter 12 à 18 mois. L'égalité entre groupes (D-044) n'a jamais été tenue sur un lot entier.
3. **L'iPhone et TestFlight.**
   - Un invité fait trois gestes de plus : installer TestFlight, installer Elenchos, revenir au lien. Une partie des proches, souvent les plus âgés, s'arrêtera là. Le test mesurera donc mal l'entrée du jeu final.
   - Les versions expirent au bout de 90 jours.
   - Le lien public peut circuler, mais personne ne joue sans invitation.
   - Les proches sur Android restent exclus (D-054).
   - Aucun vrai iPhone n'entre dans nos tests, sauf le vôtre.
4. **Vous êtes seul le soir, sans alerte (D-057)**, pendant plus de deux mois.
5. **Des données passent par Apple.** Les captures d'écran envoyées par TestFlight comme remarques peuvent montrer des réponses ; elles partent chez Apple et chez vous. On demandera aux testeurs de ne pas les utiliser pour ça. À relire par Juridique.
6. **Le reste.**
   - Seuls des modèles relisent le code (D-043) ; aucun avocat ne le voit (D-056).
   - Le nom n'est pas vérifié (D-056). TestFlight et la feuille de connexion d'Apple affichent votre nom de développeur, ce qui reste cohérent avec D-061.

**Les deux cas de TestFlight, pour un compte individuel** (Juridique vérifie en parallèle) :

| | **Testeurs internes** | **Testeurs externes** |
|---|---|---|
| Relecture d'Apple | Aucune | La première version de chaque numéro est relue en entier, les suivantes souvent pas (vérifié) |
| Combien | 100 par groupe chez Apple, mais 50 personnes au plus pour un compte individuel (vérifié) | Jusqu'à 10 000, par e-mail ou lien public (vérifié) |
| Ce que fait le testeur | Il accepte une invitation à votre compte App Store Connect, avec un rôle limité à l'application. Ce qu'il y voit (remarques des autres ?) est à vérifier | Il installe TestFlight et touche le lien |
| Ce qu'il faut fournir | Rien | Une description de la version (obligatoire, vérifié), un e-mail de contact, une page de confidentialité (sources tierces), un accès pour le relecteur |
| Qui ajoute un nouveau proche | Vous, à chaque fois | Personne : le lien suffit |
| Durée de vie d'une version | 90 jours (vérifié) | 90 jours |

---

## Décisions antérieures touchées

- **D-060, point 1** : modifié si la question 1 reçoit la réponse recommandée.
- **D-060, point 2** : tenu. Précision : la page de confidentialité doit être en ligne avant la relecture d'Apple.
- **D-060, point 3** : tenu (le test de 18h se fait sur l'application du jeu).
- **D-042** : touché seulement par l'option « société » de la question 2.
- **D-043 et D-054 (heures de mise en ligne, branche `mise-en-ligne`)** : étendus aux versions de l'application, sans règle nouvelle pour vous.
- **D-005, D-057 point 1 et `onboarding.md`** :
  - l'étape d'ajout de l'icône disparaît ;
  - l'accord pour le message garde son moment ;
  - D-006 : l'installation précède le premier texte.
- **`produit.md` §8** :
  - la mesure du geste d'ajout tombe ;
  - « message reçu » est gardée grâce à l'extension.
- **D-035** : les trois voies sont gardées. Pour la deuxième version, Apple demandera de révoquer sa connexion à l'effacement ; l'allègement de D-061 vaut pour le test.
- **P-11** : jeton dans le trousseau au lieu d'un cookie. Même exigence tenue.
- **`plateforme.md`, annexe A** : la location d'un Mac n'est plus prévue ; Xcode Cloud est écarté.
- **`CONTRAT.md`, partie 4, et N3, N8, N9, N11** : sans objet. N10 est à réécrire par UX.
- **Allègements de D-060** : E3 rétabli ; P-13, P-19 et P-20 restent allégés.
- **D-045, point 1** : non construit pour le test, car sans objet avec D-061, point 2.

## Limites et doutes

- **De mémoire, à vérifier à l'étape 1** :
  - le plancher d'iOS de la version actuelle de Capacitor ;
  - le service de notifications de production pour TestFlight ;
  - le blocage des cookies dans l'application ;
  - la publication de l'écran d'accord de Google sans vérification ;
  - la révocation de la connexion Apple exigée à l'effacement ;
  - les droits d'un testeur interne dans App Store Connect ;
  - le caractère obligatoire de la page de confidentialité pour les testeurs externes (sources tierces seulement).
- **Durées** : estimations, sans mesure sur ce type de travail. Ce sont les premiers éléments natifs du projet.
- **À observer avec de vraies personnes** :
  - combien d'invités vont au bout des trois gestes de TestFlight ;
  - si le lien d'invitation ouvre bien l'application depuis une messagerie ;
  - si le message arrive sur des iPhone plus anciens que le vôtre ;
  - si la feuille de connexion de Google est comprise ;
  - si le portrait et les tempéraments se lisent sur deux mois seulement (le portrait demande environ huit semaines, D-062).

## Sources (consultées le 15 octobre 2026 ; pages = données)

- Apple, [ajouter des testeurs internes](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers) ; [inviter des testeurs externes](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers) ; [informations de test](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information) ; [ajouter des utilisateurs (50 pour un compte individuel)](https://developer.apple.com/help/app-store-connect/manage-your-team/add-and-edit-users) ; [rôles](https://developer.apple.com/help/app-store-connect/reference/account-management/role-permissions) ; [Xcode Cloud, démarrage](https://developer.apple.com/xcode-cloud/get-started) ; [clés de l'API App Store Connect](https://developer.apple.com/tutorials/data/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api.md) ; [forum, accès à l'API pour un compte individuel](https://developer.apple.com/forums/thread/110532) ; [forum, erreur sur un compte individuel en 2026](https://developer.apple.com/forums/thread/844455).
- GitHub, [facturation des Actions (gratuit pour un dépôt public)](https://docs.github.com/en/billing/concepts/product-billing/github-actions) ; [changement de prix de 2026](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/) ; sources tierces sur le coefficient macOS : [Bitrise](https://bitrise.io/blog/post/best-github-actions-runners-in-2026-and-hidden-pricing-traps-to-avoid), [cicdpipelinecost](https://cicdpipelinecost.com/github-actions-pricing).
- Capacitor, [notifications](https://next.capacitorjs.com/docs/apis/push-notifications) ; [Airship, notifications avec Capacitor](https://www.airship.com/docs/developer/sdk-integration/capacitor/push-notifications/getting-started/).
- Sources tierces sur les informations de test de TestFlight : [Appcircle](https://docs.appcircle.io/publish-to-stores-module/publish-information/testflight-beta-information), [aso.dev](https://aso.dev/developer/beta-information).