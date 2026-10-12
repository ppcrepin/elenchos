# Le test du message de 18h : vos pas-à-pas

*Étape 6, travail 4. Back-end et Front-end, 12 octobre 2026. Accompagne `docs/etape-6/test-18h.md` (validé, D-054) et suit ses démarches dans l'ordre. Écrans vérifiés le 12 octobre 2026 dans la documentation de Scalingo (lue dans son dépôt public, à jour au 9 octobre) et dans l'aide d'Apple pour les développeurs. La console Google n'a pas pu être ouverte depuis l'environnement de l'équipe : ses écrans sont décrits de mémoire et d'après des guides récents. Tout ce qui n'a pas pu être vérifié est marqué **« à vérifier sur l'écran »** : si l'écran dit autre chose, suivez l'écran et dites-le-nous en une ligne.*

**Trois règles, pour tout ce qui suit.**
1. **Vous ne nous envoyez jamais un mot de passe, une clé ni un code** (D-048). Vous les tapez vous-même chez Scalingo, Google ou Apple, et vous les gardez dans un gestionnaire de mots de passe (le trousseau de votre iPhone convient).
2. **Ce que vous pouvez nous copier** : un message d'erreur de **fabrication** chez Scalingo, et les lignes du tableau de résultats (sans nom). Jamais un journal de l'application en marche.
3. **Les adresses de ce document** supposent que l'application s'appelle `elenchos-test-18h`. Si ce nom est pris, choisissez-en un autre, remplacez-le partout, et dites-nous lequel (ce n'est pas un secret).

| Quand (au plus tôt) | Vous faites | Partie |
|---|---|---|
| J0, mardi 13 | Chercher les quatre prêteurs | 1 |
| J1, mercredi 14 | Scalingo (première moitié), Google, Apple : environ 2 h | 2, 3, 4 |
| J2, jeudi 15 | Votre feu vert écrit pour le lendemain ; la note aux prêteurs, dès que Scalingo a répondu | 5 |
| J3, vendredi 16 | Avant 15h : la mise en ligne, vos codes, votre iPhone (T1) ; à 18h, un premier message | 6 |
| J4, samedi 17 | La séance d'installation ; à 18h, la répétition | 7 |
| J5 à J7, dimanche 18 à mardi 20 | Les deux minutes du soir | 8 |
| J8, mercredi 21 | L'effacement | 10 |

---

## 1. Démarche 1 — Trouver quatre prêteurs (J0, environ 40 minutes de messages)

Il vous faut quatre proches, **majeurs**, avec un iPhone **qui n'est qu'à eux** (pas partagé en famille). Ils gardent leur téléphone ; vous l'utilisez avec eux une quinzaine de minutes, puis eux seuls pendant trois soirs.

**Les versions d'iOS cherchées** (`test-18h.md`, partie 2). Chacun lit la sienne dans **Réglages › Général › Informations › Version d'iOS**.

| Téléphone | Version cherchée | Exemple de modèle |
|---|---|---|
| T1 | le vôtre, tel qu'il est | — |
| T2 | iOS 16.4 à 16.7 (la plus ancienne qui reçoit les messages) | un iPhone 8 ou X (de mémoire) |
| T3 | iOS 17 ou 18 | un iPhone XS ou XR (de mémoire) |
| T4 | iOS 26 | — |
| T5 | la dernière version publiée par Apple | — |

Si une version manque, prenez la plus proche ; le plus important est T2, et des versions différentes d'un téléphone à l'autre. **Sous 16.4, le téléphone ne convient pas** : il ne peut pas recevoir le message.

**Message type à vos proches** (à tutoyer ou vouvoyer selon vous) :
> Je teste en ce moment un petit service sur iPhone. Pourrais-tu me prêter ton iPhone un quart d'heure samedi, puis le garder comme d'habitude trois soirs ? Il recevrait vers 18h un message « Test, soir 1 sur 3 ». Rien sur ton compte, rien de ta vie : je t'envoie une note d'une page qui explique tout avant. Pour savoir si ton iPhone convient : Réglages › Général › Informations, la ligne « Version d'iOS ». Tu me dis le chiffre ?

**Ce que vous notez, chez vous seulement** (jamais dans la conversation ni dans le dépôt) : qui a quel téléphone (T2 à T5). Vous effacerez cette liste le 20 novembre.

**La note aux prêteurs** (`test-18h.md`, partie 5) ne part qu'à J2, une fois la réponse de Scalingo reçue (partie 2, étape 2.9).

---

## 2. Démarche 2 — Scalingo, première moitié (J1, environ 45 minutes)

> **À lire avant (nouveau, lu le 12 octobre 2026 dans la documentation de Scalingo).** Scalingo demande désormais **une carte de paiement pour commencer l'essai gratuit**. Rien n'est prélevé pendant les 30 jours. Mais **à la fin de l'essai, la facturation commence d'elle-même** si l'application ou la base existent encore : Scalingo ne les supprime pas. L'effacement de la partie 10 les supprime ; faites-le avant le 30e jour. `test-18h.md` disait « sans carte » et « application arrêtée sans moyen de paiement » : c'était vrai à la lecture précédente, plus maintenant. Si vous ne voulez pas donner de carte, arrêtez-vous ici et dites-le-nous.

Ce jour-là, vous préparez tout chez Scalingo **sauf** la mise en ligne, qui attend le code relu et votre feu vert (partie 6).

### 2.1 Créer le compte
1. Ouvrez `https://auth.scalingo.com/users/sign_up`.
2. Choisissez **Personal**.
3. Tapez votre adresse e-mail, puis un mot de passe fort (rangez-le dans votre gestionnaire).
4. Touchez **Sign up with email**. (L'autre bouton, « Sign up with GitHub », marche aussi ; l'e-mail garde les deux comptes séparés.)
5. Remplissez votre **profil de facturation** (à votre nom, D-042) et ajoutez la carte : c'est ce qui démarre l'essai.

### 2.2 La double vérification (P-16)
1. Dans le tableau de bord, menu de votre compte, sous-menu **User Settings › Authentication**.
2. Bloc **Two-factor Authentication (2FA)** : **Enable**.
3. Scannez le code avec une application d'authentification (celle de votre gestionnaire de mots de passe, par exemple), tapez le code à six chiffres, **Validate**.
4. **Copiez les codes de secours** dans votre gestionnaire. Ne sautez pas ce point. Puis **Confirm**.

### 2.3 Le contrat de sous-traitance (RGPD, art. 28 ; condition bloquante de Juridique)
Cherchez dans votre compte une page **Data Processing Agreement** (ou « DPA », « contrat de sous-traitance ») et acceptez-la. **À vérifier sur l'écran** : nous n'avons pas trouvé où elle se trouve dans le tableau de bord. Si vous ne la trouvez pas, la question 4 de l'étape 2.9 la demande.

### 2.4 Lier Scalingo à GitHub (sans rien installer)
1. Ouvrez `https://dashboard.scalingo.com/account/integrations`.
2. Catégorie **GitHub** : **Connect**. GitHub vous demande d'autoriser Scalingo : acceptez.

### 2.5 Créer l'application
1. Tableau de bord : **Create an application +**.
2. **Basic information** : nom `elenchos-test-18h` ; région **osc-fr1** (« Paris - Outscale ») ; projet : celui proposé. Ne cochez pas la case « Health data hosting ».
3. **Create app**.
4. **Deployment method** : la documentation dit qu'on choisit ici le dépôt. **Ne lancez aucune installation aujourd'hui.** Si l'écran permet de passer cette étape, passez-la ; sinon, choisissez GitHub, le dépôt `ppcrepin/elenchos`, et **ne choisissez pas de branche, ou laissez l'installation automatique désactivée** (à vérifier sur l'écran). La branche `mise-en-ligne` n'existera qu'à J3 ; si quelque chose s'installe depuis `main` par erreur, dites-le-nous.

Votre adresse sera : `https://elenchos-test-18h.osc-fr1.scalingo.io`.

### 2.6 La base de données
1. Dans l'application : onglet **Resources**, bloc **Addons**, **Add an addon**.
2. **PostgreSQL**, puis **Go to plan selection**.
3. Le plus petit plan proposé (l'essai n'en autorise qu'un, le plus petit ; son nom exact est à vérifier sur l'écran, « Starter 512M » de mémoire). **Finish**.

Deux réglages de la base, dans son propre tableau de bord (depuis l'addon PostgreSQL, lien vers le tableau de bord de la base) :
4. **Pas de sauvegardes programmées (proposé).** Onglet **Backups › Logical backups**, bloc **Backup schedule**, **Schedule**, **décochez** « I want to enable scheduled backups », **Update**. Pourquoi : la documentation de Scalingo dit qu'une base supprimée **garde ses sauvegardes programmées** jusqu'à leur expiration (jusqu'à quatre semaines sur le plus petit plan). Sans elles, aucune copie des données des prêteurs ne survit à l'effacement. Le prix : si la base se perdait pendant le test, on recommencerait l'installation (environ une heure).
5. **Connexion chiffrée obligatoire.** Onglet **Settings › Internet Access**, bloc **Force TLS connections**, **Enable**. Le programme du test se connecte toujours de façon chiffrée.

### 2.7 Deux réglages de l'application
1. Onglet **Settings › Public Routing**, bloc **Force HTTPS** : activez.
2. **Journaux du routeur** : laissez-les **désactivés** (c'est le réglage par défaut ; ils noteraient l'adresse internet de chaque téléphone). Ne les activez pas.

### 2.8 Les premiers réglages (variables d'environnement)
Onglet **Environment**. Ajoutez ces deux variables (bouton d'ajout, ou édition en bloc : à vérifier sur l'écran). Elles ne sont pas secrètes.

```
PROJECT_DIR=test-18h
SOIRS=2026-10-16=0@1;2026-10-17=0;2026-10-18=1;2026-10-19=2;2026-10-20=3
```

- `PROJECT_DIR` dit à Scalingo d'installer le seul dossier `test-18h` du dépôt.
- `SOIRS` est le calendrier des messages de 18h. Chaque morceau est « date = numéro du soir » : 0 pour la répétition (et `@1` : votre iPhone seulement, le vendredi), 1, 2 et 3 pour les trois soirs. **Si le calendrier glisse**, décalez les dates ; pour **ajouter un soir** à un seul téléphone, ajoutez par exemple `;2026-10-21=4@3` (un soir ajouté, pour T3 seulement). Un changement de cette variable redémarre l'application : **ne la changez jamais entre 17h45 et 18h35**.
- `SCALINGO_POSTGRESQL_URL` a été ajoutée par Scalingo avec la base : n'y touchez pas, ne la copiez nulle part.

Les variables de Google et d'Apple s'ajoutent aux parties 3 et 4 ; les codes, à la partie 6.

### 2.9 Les questions écrites à Scalingo
Depuis le tableau de bord, ouvrez l'aide de Scalingo (bulle de discussion ou formulaire de contact : à vérifier sur l'écran) et envoyez ce texte :

> Bonjour, je teste un service sur votre essai gratuit (application elenchos-test-18h, région osc-fr1). J'ai besoin de quatre réponses écrites pour informer les personnes concernées (RGPD) :
> 1. Journaux : votre documentation indique que tous les journaux sont gardés un an. Est-ce vrai pour les journaux de l'application, ceux du routeur (que je n'active pas) et les « métadonnées de connexion » ? Contiennent-ils l'adresse IP des visiteurs ? Restent-ils un an après la suppression de l'application ?
> 2. Sauvegardes : si je désactive les sauvegardes programmées de ma base avant d'y mettre des données, reste-t-il une copie de ses données après la suppression de la base (sauvegardes continues, ou autre) ?
> 3. Sous-traitants : la liste de vos sous-traitants qui peuvent accéder aux données de mes applications, avec leur pays.
> 4. Le contrat de sous-traitance (DPA) s'applique-t-il pendant l'essai gratuit, et où l'accepter dans mon compte ?
> Merci.

**Quand Scalingo répond**, copiez-nous seulement les chiffres et les noms (durées, liste des sous-traitants), pas l'échange entier. **Ce que l'équipe sait déjà, franchement** : la documentation de Scalingo dit « tous les journaux sont gardés un an » (obligation légale française). Le [N] de la note aux prêteurs serait donc d'environ 365 jours, et non de quelques jours. L'équipe vérifie avec Juridique si la note doit changer **avant** que vous la remettiez : attendez son retour.

---

## 3. Démarche 3 — Google (J1, environ 40 minutes)

### 3.1 Le compte Google de test
1. Dans une fenêtre privée de votre navigateur, ouvrez `https://accounts.google.com/signup`.
2. **Pour mon usage personnel**. Prénom et nom : un nom de test, par exemple « Test Dixhuit » (jamais celui d'un proche).
3. Date de naissance : la vôtre convient (le compte doit être celui d'un adulte). Adresse Gmail : ce que Google propose ou une adresse à vous.
4. Mot de passe fort, rangé dans votre gestionnaire. Google peut demander un numéro de téléphone : le vôtre (de mémoire).
5. Notez l'adresse du compte de test : vous en aurez besoin en 3.3.

### 3.2 Le projet
1. Avec **votre** compte Google (pas celui de test), ouvrez `https://console.cloud.google.com/`. Acceptez les conditions si c'est la première fois.
2. En haut, sélecteur de projet, **Nouveau projet**. Nom : `elenchos`. **Créer**. Sélectionnez-le.

### 3.3 L'écran d'accord, en mode « Test »
Menu ☰ › **Google Auth Platform** (parfois « API et services › Écran de consentement OAuth » ; à vérifier sur l'écran), puis **Commencer** :
1. **Informations sur l'application** : nom `Elenchos (test)` ; adresse d'assistance : la vôtre.
2. **Audience** : **Externe**.
3. **Coordonnées** : votre adresse. Acceptez la règle des données utilisateur. **Créer**.
4. Menu **Audience** : l'état de publication doit être **Test** (« Testing »). Ne touchez pas à « Publier ».
5. Toujours dans **Audience**, **Utilisateurs tests › Add users** : l'adresse du compte de test, et elle seule. **Enregistrer**.
6. Menu **Accès aux données** (« Data Access ») : n'ajoutez aucun champ d'application. L'identifiant et l'adresse e-mail sont demandés par la page elle-même, sans rien régler ici.

### 3.4 L'identifiant « application Web »
1. Menu **Clients**, **Créer un client**.
2. Type d'application : **Application Web**. Nom : `test-18h`.
3. **Origines JavaScript autorisées** : rien.
4. **URI de redirection autorisés** › **Ajouter un URI** : collez exactement
   `https://elenchos-test-18h.osc-fr1.scalingo.io/connexion/google/retour`
5. **Créer**. Une fenêtre montre l'**ID client** et le **code secret du client**. **Le code secret ne sera plus montré une fois la fenêtre fermée** (Google, depuis juin 2025) : gardez la fenêtre ouverte et passez à 3.5, ou téléchargez le fichier JSON proposé et rangez-le dans votre gestionnaire.

### 3.5 Les deux réglages chez Scalingo
Onglet **Environment** de l'application, deux variables :
```
GOOGLE_ID_CLIENT=…l'ID client, qui finit par .apps.googleusercontent.com
GOOGLE_SECRET_CLIENT=…le code secret du client
```
Fermez ensuite la fenêtre de Google.

---

## 4. Démarche 4 — Apple (J1, environ 40 minutes)

Dans votre compte développeur : `https://developer.apple.com/account`, puis **Certificates, Identifiers & Profiles**. Vérifié dans l'aide d'Apple le 12 octobre 2026, sauf mention.

Les noms proposés ci-dessous resserviront à la connexion du jeu (travail 9) : **gardez-les ensuite** (proposé).

### 4.1 L'identifiant d'application (App ID)
1. **Identifiers** dans la barre de gauche, puis le bouton **+** en haut à gauche.
2. **App IDs**, **Continue** ; type **App**, **Continue**.
3. **Description** : `Elenchos`. **Bundle ID** : **Explicit**, `io.github.ppcrepin.elenchos` (proposé : un nom qui vous appartient déjà, celui de votre page GitHub ; il ne peut plus être changé ensuite).
4. Dans la liste **Capabilities**, cochez **Sign In with Apple**.
5. **Continue**, vérifiez, **Register**.

### 4.2 L'identifiant de service (Services ID)
1. **Identifiers**, **+**, **Services IDs**, **Continue**.
2. **Description** : `Elenchos (test)` (de mémoire, c'est ce nom qu'Apple montre sur son écran de connexion). **Identifier** : `io.github.ppcrepin.elenchos.web`.
3. **Continue**, **Register**.
4. Dans la liste, touchez ce Services ID. Cochez **Sign In with Apple**, puis **Configure** :
   - **Primary App ID** : `Elenchos` (créé en 4.1) ;
   - **Domains and Subdomains** : `elenchos-test-18h.osc-fr1.scalingo.io`
   - **Return URLs** : `https://elenchos-test-18h.osc-fr1.scalingo.io/connexion/apple/retour`
   - **Done**, puis **Continue**, puis **Save**.

**Le moment de vérité.** Apple n'exige aucun fichier sur le serveur (aide d'Apple). Si l'écran **refuse le domaine `scalingo.io`**, arrêtez-vous et dites-le-nous : la question du domaine vous revient avant tout achat (D-054, point 2).

### 4.3 La clé privée
1. **Keys** dans la barre de gauche, **+**.
2. **Key Name** : `Elenchos test 18h`. Cochez **Sign in with Apple**, puis **Configure** à côté : **Primary App ID** `Elenchos`, **Save**.
3. **Continue**, **Register**.
4. **Download** : un fichier `AuthKey_XXXXXXXXXX.p8` arrive dans vos Téléchargements. **Apple ne le donne qu'une fois.** Rangez-le dans votre gestionnaire de mots de passe (pièce jointe), puis supprimez-le des Téléchargements après l'étape 4.5.
5. Notez le **Key ID** affiché (10 caractères).

### 4.4 Votre numéro d'équipe
En haut à droite de la page du compte, ou **Membership details** : le **Team ID** (10 caractères).

### 4.5 Les quatre réglages chez Scalingo
Onglet **Environment** :
```
APPLE_ID_SERVICE=io.github.ppcrepin.elenchos.web
APPLE_ID_EQUIPE=…le Team ID
APPLE_ID_CLE=…le Key ID
APPLE_CLE_PRIVEE=…le contenu du fichier .p8
```
Pour le contenu du fichier .p8 : ouvrez-le avec TextEdit (ou le Bloc-notes), **Tout sélectionner**, copiez, collez comme valeur, **lignes « BEGIN » et « END » comprises**. Si Scalingo coupe les retours à la ligne, ce n'est pas grave : le programme les reconstruit. Si le champ refuse le collage, attendez la partie 6 : la page `/preparer` met la clé sur une seule ligne.

---

## 5. Le feu vert, la veille (J2)

Les agents ne mettent rien en ligne sans votre accord écrit, donné **la veille** (D-054). Le jour J2, quand l'équipe vous dit que le code a passé sa relecture (Cohérence, puis le Vérificateur), écrivez simplement dans la conversation :

> Feu vert : mise en ligne du test demain, vendredi 16 octobre, avant 15h.

Le lendemain matin, l'équipe pousse le code relu sur la branche `mise-en-ligne`, avant 15h, et vous prévient. Rien ne part de 15h à 19h ni le dimanche : la fabrication chez Scalingo elle-même échoue exprès dans ces créneaux (garde des horaires).

**La note aux prêteurs** part aussi ce jour-là, à condition que Scalingo ait répondu et que l'équipe vous ait rendu la note avec le bon [N] (partie 2.9). Remplissez [n] (le numéro du téléphone de chacun), les dates et vos coordonnées.

---

## 6. La mise en ligne, vos codes et votre iPhone (J3, avant 15h, puis 18h)

### 6.1 Brancher la branche et installer (dès que l'équipe a poussé)
1. Application `elenchos-test-18h`, onglet **Deploy › Configuration**.
2. Dépôt `ppcrepin/elenchos` ; branche **`mise-en-ligne`** ; **Automatic deployments** : activé.
3. Si rien ne démarre seul : sous-menu **Manual deployment**, branche `mise-en-ligne`, lancez.
4. Attendez la fin (quelques minutes). **Si la fabrication échoue**, copiez-nous son message d'erreur (la fenêtre de fabrication du déploiement en échec), rien d'autre.

**Pas avant 15h ? Pas un dimanche ?** Si vous faites ceci entre 15h et 19h ou un dimanche, la fabrication échoue avec le message « Horaires : aucune installation de 15h à 19h ni le dimanche » : c'est voulu. Recommencez avant 15h ou après 19h, un autre jour que le dimanche.

### 6.2 Fabriquer vos codes et la clé des messages (5 minutes)
1. Sur votre ordinateur, ouvrez `https://elenchos-test-18h.osc-fr1.scalingo.io/preparer`.
2. Touchez **Fabriquer**. La page tire au hasard, **dans votre navigateur**, cinq lignes : le secret de session, les **cinq codes d'essai** (T1 à T5), **votre code d'accès** aux résultats, et la clé des messages (publique et privée). Rien n'est envoyé au serveur.
3. Plus bas, la page liste les codes T1 à T5 et votre code d'accès : **copiez-les dans votre gestionnaire de mots de passe**, avec leur numéro de téléphone.
4. **Copier ces lignes**, puis, chez Scalingo, onglet **Environment**, édition en bloc : collez les cinq lignes à la suite des autres (à vérifier sur l'écran ; sinon, ajoutez-les une par une : le nom avant le « = », la valeur après). Enregistrez : l'application redémarre.
5. Si la clé Apple n'a pas pu être collée en 4.5 : section 2 de la même page, choisissez le fichier .p8, copiez la ligne obtenue, ajoutez-la de la même façon.
6. Fermez la page. Ne la rechargez pas avant d'avoir tout collé : chaque chargement tire d'autres valeurs.

Ne nous envoyez jamais ces valeurs. Si l'une d'elles fuit, recommencez 6.2 (les abonnements déjà faits seraient à refaire).

### 6.3 Vérifier
1. Ouvrez `https://elenchos-test-18h.osc-fr1.scalingo.io/resultats`, tapez votre code d'accès, **Entrer**.
2. Section **Réglages** : « Tous les réglages sont en place. » Sinon, la page donne le **nom** des réglages manquants : corrigez-les (et dites-nous le nom si vous ne trouvez pas).
3. Section **Calendrier des envois** : les dates de `SOIRS`, avec « (aujourd'hui) » sur le bon jour.

### 6.4 Votre iPhone (T1)
Suivez la fiche de la partie 7 pour votre iPhone, avec le code T1, **puis la connexion Apple** (7.3). Puis, sur la page de résultats : **Message d'essai** sur la ligne T1. À 18h00, votre iPhone reçoit « Test, répétition » : regardez la ligne dans le tableau vers 18h05.

Si l'écran de Google ou d'Apple refuse l'adresse de Scalingo, arrêtez et dites-le-nous : la question du domaine vous revient (D-054, point 2).

---

## 7. Démarche 5 — La séance d'installation (J4, environ 15 minutes par téléphone)

**Avant de toucher au téléphone** : la note a été remise (condition bloquante), le prêteur est majeur, le téléphone n'est qu'à lui.

### 7.1 La fiche, pour chaque téléphone
Ayez sur votre propre iPhone la page de résultats ouverte (partie 6.3), et le mot de passe du compte Google de test dans votre gestionnaire.

1. **Noter, sans rien changer** (liste de contrôle) : la version d'iOS (**Réglages › Général › Informations**) ; si une **Concentration** est programmée (**Réglages › Concentration**) ; si le **Résumé programmé** est actif (**Réglages › Notifications › Résumé programmé**) ; si le **mode Économie d'énergie** est actif (**Réglages › Batterie**). Vous notez « oui/non », jamais les horaires du prêteur.
2. **Safari** : tapez `elenchos-test-18h.osc-fr1.scalingo.io` dans la barre d'adresse. La page « Test du message de 18h » s'ouvre.
3. **Continuer avec Google**. Sur la page de Google, **c'est vous qui tapez**, avec le compte de test, jamais celui du prêteur. Si Google affiche « Google n'a pas validé cette application », touchez **Continuer** (à vérifier sur l'écran). **Si Google affiche une erreur** (par exemple « disallowed_useragent »), notez-la mot pour mot : c'est un résultat du test.
4. De retour sur la page : « Connexion : avec Google ».
5. **Ajouter à l'écran d'accueil** : bouton **Partager** (le carré avec une flèche vers le haut ; sur iOS 26, il peut se trouver dans le menu **⋯**, à vérifier sur l'écran), puis **Sur l'écran d'accueil**. Le nom proposé est « Test 18h » : gardez-le. Sur iOS 26, si un réglage « Ouvrir comme app web » apparaît, laissez-le **activé**. **Ajouter**.
6. **Ouvrez l'icône** « Test 18h ». La page dit « Ouverte depuis l'icône : oui ». La connexion dit probablement « pas connecté » : l'icône a sa propre mémoire. Touchez **Continuer avec Google** et refaites 3. **Notez** : êtes-vous revenu dans l'icône, ou dans Safari ? La page dit-elle « avec Google » ?
7. **Recevoir le message de 18h**. Tapez le **code d'essai de ce téléphone** (T2 pour le téléphone 2, etc.), **Valider le code**. La page dit « Code accepté : téléphone n ».
8. **Autoriser les messages**, puis **Autoriser** dans la fenêtre de l'iPhone. La page dit « C'est fait ». En haut : « Messages : autorisés ».
9. Sur **votre** iPhone, page de résultats : ligne de ce téléphone, **Message d'essai**. Dans la minute, le téléphone du prêteur affiche « Test, message d'essai ». **Ne le touchez pas** : lisez-le, c'est tout. Rechargez la page de résultats : la ligne dit « accepté » et une heure de réception.
10. Sur la page de résultats, ligne de ce téléphone : tapez sa version (forme `iOS 17.6`), **Noter**.
11. **Fermez l'icône** (balayez vers le haut). Rappelez au prêteur : ne plus ouvrir l'icône ni toucher le message avant le soir 3 ; un SMS chaque soir.

### 7.2 Ce qu'on ne fait jamais sur T2 à T5
**Jamais « Continuer avec Apple »** : Safari proposerait le compte Apple du prêteur. Si cela arrive quand même : page de résultats, section **Connexions**, **Effacer** le compte Apple apparu ; le prêteur retire le lien dans **Réglages › [son nom] › Connexion et sécurité › Se connecter avec Apple** (à vérifier sur l'écran).

### 7.3 Seulement sur votre iPhone (T1) : la connexion Apple
Depuis l'icône : **Continuer avec Apple**, avec votre propre compte Apple. Apple peut proposer de partager ou de masquer votre adresse : les deux conviennent, elle n'est jamais gardée. Notez si vous revenez dans l'icône, connecté « avec Apple ». La section **Connexions** de la page de résultats montre alors deux comptes : un Google, un Apple.

**À 18h ce jour-là**, les cinq téléphones reçoivent « Test, répétition » : c'est la répétition, elle ne compte pas.

---

## 8. Démarche 6 — Les deux minutes du soir (J5 à J7, vers 18h10)

1. Ouvrez la page de résultats (votre code d'accès vous est redemandé toutes les douze heures).
2. Pour chaque téléphone, la ligne du soir : **Réponse du service** « accepté », une heure **Reçu**, l'**Écart** en secondes et un **Classement** (à l'heure avant 18h02, acceptable avant 18h05, en retard jusqu'à 18h30, manqué au-delà).
3. Lisez les SMS des prêteurs. Dans la zone **À copier pour l'équipe**, chaque ligne finit par « vu : ___ » : dans **votre** copie, remplacez-le le soir même par « à l'heure (avant 18h05) », « plus tard » ou « rien vu » ; laissez vide pour « éteint » (le soir ne compte pas). Jamais l'heure exacte du SMS.
4. **Si une ligne est mauvaise** (« refusé », « manqué », « envoi interrompu », rien à 18h05) : regardez vous-même, sans nous envoyer de journal ; demandez au prêteur si son téléphone était éteint ou sans réseau. Envoyez-nous seulement une ligne du type « T4 : non reçu, téléphone allumé ». L'équipe applique les règles de `test-18h.md`, partie 1 (« Ce qu'on fait en cas d'échec »).

**Le soir 3 (J7)** : chaque prêteur éteint puis rallume son téléphone **avant 18h**. À 18h10, votre iPhone reçoit en plus « Test, soir 3 sur 3 (seconde forme) » (si votre iPhone est en iOS 18.4 ou plus récent) : sa ligne apparaît avec « seconde forme ». Après le message, chacun **ouvre enfin l'icône** et vous dit si elle affiche « Connexion : avec Google » (« avec Apple » sur le vôtre).

**Ajouter un soir** pour un téléphone : modifiez `SOIRS` chez Scalingo (partie 2.8), jamais entre 17h45 et 18h35.

**Un prêteur se retire** : le jour même, page de résultats, **Effacer sa ligne** ; il supprime l'icône ; dites-nous seulement « T3 retiré ».

---

## 9. En cas de panne

- **Une page ne répond pas, un message ne part pas** : c'est vous qui regardez (D-048), dans le tableau de bord de Scalingo (état de l'application, redémarrage). Ne nous copiez pas les journaux de l'application en marche.
- **Une installation échoue** : copiez-nous le message d'erreur de la fabrication.
- **Aucune correction n'est mise en ligne de 15h à 19h ni le dimanche** : une panne le dimanche attend le lundi matin, et le soir manqué est ajouté (partie 8).

---

## 10. Démarche 7 — L'effacement (J8, environ 20 minutes)

Dans cet ordre :

1. **Copier le tableau.** Page de résultats, zone **À copier pour l'équipe**, **Copier**. Complétez les « vu » depuis votre copie. Collez le tout dans la conversation : seulement ces lignes, sans nom. Gardez votre copie jusqu'au 20 novembre.
2. **Les téléphones prêtés** (avec chaque prêteur, ou en le lui demandant) : ouvrir l'icône, **Se déconnecter** ; puis appui long sur l'icône, **Supprimer l'app** (ou « Supprimer de l'écran d'accueil »), confirmer. Les messages s'arrêtent aussi (de mémoire). Faites de même sur votre iPhone.
3. **Tout effacer.** Page de résultats, section **Tout effacer** : tapez `EFFACER`, touchez **Tout effacer**. La page doit dire **« Base vide : vérifié »**, avec zéro ligne partout. Sinon, ne supprimez rien et dites-le-nous.
4. **Supprimer chez Scalingo.** Application `elenchos-test-18h`, onglet **Settings**, **Delete app**, remplissez la confirmation, confirmez. Vérifiez ensuite, onglet **Resources** d'une autre page ou page **Billing**, qu'aucune base ni application ne reste (à vérifier sur l'écran : la documentation ne dit pas si la base part avec l'application ; si elle reste, supprimez-la depuis son addon). **Faites-le avant le 30e jour de l'essai** : sinon, la facturation commence.
   - Si vous avez désactivé les sauvegardes programmées (2.6), aucune copie de la base ne reste. Sinon, elles expirent d'elles-mêmes en quatre semaines au plus (documentation de Scalingo).
   - Les journaux de Scalingo suivent leur propre durée (réponse à la question 1 de 2.9).
5. **Google.** Connecté avec le **compte de test** : `https://myaccount.google.com`, **Sécurité**, **Vos connexions à des applications et services tiers**, `Elenchos (test)`, **Supprimer l'accès** (à vérifier sur l'écran). Puis **Données et confidentialité**, **Supprimer votre compte Google** (à vérifier sur l'écran). Avec **votre** compte, console Google, **Clients**, `test-18h` : retirez l'URI de redirection, enregistrez. Gardez le projet (il resservira, proposé).
6. **Apple.** Sur votre iPhone : **Réglages › [votre nom] › Connexion et sécurité › Se connecter avec Apple**, `Elenchos (test)`, **Ne plus utiliser** (à vérifier sur l'écran). Dans le compte développeur, **Identifiers**, Services ID `io.github.ppcrepin.elenchos.web`, **Sign In with Apple › Configure** : retirez le domaine et l'adresse de retour, **Done**, **Continue**, **Save**. Gardez les identifiants et le fichier .p8 dans votre gestionnaire (ils resserviront, proposé).
7. **La ligne datée.** Écrivez, chez vous : « Test du message de 18h : effacé le [date], vérifié. » Confirmez-le à chaque prêteur, comme la note le promet. Effacez dans vos SMS les seuls messages du test (pas le reste de vos conversations).
8. **Le 20 novembre 2026** : effacez votre copie du tableau et la liste « qui a quel téléphone », et ajoutez-le sur la même ligne datée.

---

## Ce qui n'a pas pu être vérifié

- **Les écrans de la console Google** : le site n'a pas pu être ouvert depuis l'environnement de l'équipe ; noms des menus de mémoire et d'après des guides récents.
- **Où accepter le contrat de sous-traitance de Scalingo**, le nom exact du plus petit plan PostgreSQL, l'édition des variables en bloc, l'écran « Deployment method » à la création de l'application, et si la base part avec l'application supprimée.
- **Les gestes d'iOS 26** (bouton Partager, « Ouvrir comme app web ») et les chemins exacts des Réglages pour « Se connecter avec Apple ».
- **Apple et l'adresse `scalingo.io`** : on le saura à l'étape 4.2.
- **Le code n'a jamais tourné chez Scalingo, ni vers le vrai service d'Apple, ni avec les vrais Google et Apple** : il a passé ses tests automatiques contre des imitations fidèles. C'est la raison d'être du message d'essai de J3.
