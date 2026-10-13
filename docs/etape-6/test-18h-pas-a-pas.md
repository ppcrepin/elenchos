# Le test du message de 18h : vos pas-à-pas

*État, 13 octobre 2026 : **mis à jour pour D-057, en relecture.** Un seul iPhone, le vôtre (T1) ; plus de prêteurs, de note aux prêteurs ni de séance d'installation ; le domaine elenchos.fr, acheté avant la mise en ligne ; connexion Apple et Google depuis l'icône (l'e-mail n'est pas dans ce test : plan, travail 4). Ce que la mise à jour ajoute sans décision de votre part est marqué « (proposé) ».*

*Étape 6, travail 4. Back-end et Front-end, 12 octobre 2026 ; corrigé le même jour après les relectures (revue du code, Cohérence, Juridique, UX) ; mis à jour le 13 octobre (D-057). Accompagne `docs/etape-6/test-18h.md` et suit ses démarches dans l'ordre. Écrans vérifiés dans la documentation de Scalingo (lue dans son dépôt public, à jour au 9 octobre 2026 ; pages sur les domaines relues le 13 octobre) et dans l'aide d'Apple pour les développeurs (relue le 13 octobre). La console Google et le site d'OVHcloud n'ont pas pu être ouverts depuis l'environnement de l'équipe : leurs écrans sont décrits de mémoire et d'après des guides récents. Tout ce qui n'a pas pu être vérifié est marqué ▲ (voir l'encadré plus bas).*

**Trois règles, pour tout ce qui suit.**
1. **Vous ne nous envoyez jamais un mot de passe, une clé ni un code** (D-048). Vous les tapez vous-même chez OVHcloud, Scalingo, Google ou Apple, et vous les gardez dans un gestionnaire de mots de passe (le trousseau de votre iPhone convient).
2. **Ce que vous pouvez nous copier** : un message d'erreur de **fabrication** chez Scalingo, et les lignes du tableau de résultats. Jamais un journal de l'application en marche.
3. **Les adresses de ce document** supposent que l'application s'appelle `elenchos-test-18h` et que la page du test vit à l'adresse `test18h.elenchos.fr` (proposé : une adresse à part, pour que rien du test ne reste à l'adresse du jeu ; raison en 1.4). Si le nom `elenchos-test-18h` est pris chez Scalingo, choisissez-en un autre, remplacez-le partout (y compris dans l'entrée de 1.4), et dites-nous lequel (ce n'est pas un secret).

**Quatre mots, une fois pour toutes** (ils reviennent en 1.4 et 2.6).
- **Zone DNS** : le carnet d'adresses de votre domaine, tenu par OVHcloud. Chaque ligne (une « entrée ») dit où mène un nom comme `test18h.elenchos.fr`.
- **CNAME** : un type d'entrée qui dit « ce nom est un autre nom pour celui-là » ; ici, `test18h.elenchos.fr` devient un autre nom pour l'adresse de votre application chez Scalingo.
- **TTL (durée de vie)** : le temps pendant lequel les ordinateurs gardent une entrée en mémoire avant de la relire ; vous gardez la valeur proposée.
- **« Pending DNS »** : l'état affiché par Scalingo tant qu'il ne voit pas encore votre entrée. Ce n'est pas une erreur ; il regarde toutes les minutes.

> **Écrans de mémoire (▲).** Un ▲ dans le texte marque un écran ou un menu que nous n'avons pas pu voir : nous le décrivons de mémoire ou d'après des guides récents. Si l'écran dit autre chose, suivez l'écran et dites-le-nous en une ligne. Où ils se trouvent :
> - **OVHcloud** : la recherche et le panier (1.1), la double authentification et le renouvellement (1.2), le chemin vers la zone DNS (1.4) ;
> - **Scalingo** : l'écran juste après l'inscription (2.1), le nom du plus petit plan PostgreSQL (2.7), l'emplacement du réglage des journaux (2.8), l'édition des variables en bloc (2.9 et 6.2), la suppression de la base (9) ;
> - **Google** : les noms des menus de la console (3.2), l'écran « Google n'a pas validé cette application » (6.4), le retrait de l'accès (9) ;
> - **Apple** : un champ ou deux pour le domaine (4.2), le retrait « Ne plus utiliser » (9) ;
> - **iPhone** : le bouton Partager sur iOS 26 (6.4), le geste qui supprime l'icône (9).

| Quand (au plus tôt) | Vous faites | Partie (démarche) |
|---|---|---|
| J0, mardi 13 | Acheter elenchos.fr et préparer son branchement : environ 30 minutes | 1 |
| J1, mercredi 14 | Scalingo (branchement du domaine compris), Google, Apple : environ 2 h ; puis votre feu vert écrit pour le lendemain | 2, 3, 4, 5 |
| J2, jeudi 15 | Avant 15h : la mise en ligne, vos codes, votre iPhone ; à 18h, la répétition | 6 (démarche 5) |
| J3 à J5, vendredi 16 à dimanche 18 | Les deux minutes du soir (soirs 1, 2, 3) | 7 (démarche 6) |
| J6, lundi 19 | L'effacement | 9 (démarche 7) |

Les parties de ce document sont numérotées de 1 à 9 ; les « démarches » du tableau de `test-18h.md` sont au nombre de sept. Les démarches 1 à 4 sont les parties 1 à 4 ; la démarche 5 est la partie 6, la démarche 6 la partie 7, la démarche 7 la partie 9. La partie 5 (le feu vert) et la partie 8 (la panne) ne sont pas des démarches.

---

## 1. Démarche 1 — Acheter elenchos.fr et préparer son branchement (J0, environ 30 minutes)

**Pourquoi d'abord.** Le domaine est voulu par D-057 (point 2) : l'icône et l'abonnement au message de 18h sont attachés à une adresse ; avec une adresse à vous, ils survivront à la mise à niveau. On l'achète **avant** d'ouvrir Scalingo : si elenchos.fr n'est pas libre, vous le savez avant que l'essai de 30 jours ne commence à courir, et la question vous revient (D-057, « sa disponibilité se vérifie à l'achat »).

**Où (proposé) : OVHcloud**, registraire français, pour trois raisons : le .fr y est parmi les moins chers au renouvellement, la gestion des adresses (la « zone DNS ») est comprise sans supplément, et la documentation de Scalingo le cite parmi les registraires (vérifié le 13 octobre 2026). Gandi est cité aussi, mais son renouvellement du .fr est relevé nettement plus cher.

**Le prix, présenté avant l'achat (D-042, D-057).** Relevé le 13 octobre 2026 sur des comparatifs récents (le site d'OVHcloud n'a pas pu être ouvert) : **environ 6 € TTC la première année** (4,99 € HT), puis **environ 9,35 € TTC par an** au renouvellement (7,79 € HT). C'est l'écran de paiement qui fait foi. **Si le total dépasse 15 € TTC pour un an, arrêtez-vous et dites-le-nous** (proposé).

### 1.1 Vérifier que le nom est libre, et l'acheter
1. Ouvrez `https://www.ovhcloud.com/fr/domains/` et tapez `elenchos.fr` dans le champ de recherche ▲.
2. **Si elenchos.fr est déjà pris** : n'achetez rien d'autre, arrêtez-vous et dites-le-nous. La question vous revient avant tout autre achat.
3. S'il est libre : ajoutez-le au panier, **pour un an**. **Refusez toutes les options payantes** proposées (hébergement, adresses e-mail, « DNS Anycast »…). Gardez la zone DNS d'OVHcloud, gratuite ▲.
4. Créez votre compte OVHcloud, **en tant que particulier**, à votre nom (D-042) ; mot de passe fort, propre à OVHcloud, rangé dans votre gestionnaire. Le titulaire du domaine, c'est vous. Pour un particulier, le registre du .fr (l'Afnic) ne publie pas vos coordonnées dans l'annuaire public des domaines (de mémoire).
5. Payez. Notez le prix réellement payé (une ligne, pour le tableau des dépenses).

### 1.2 Protéger le compte (5 minutes, proposé)
Qui contrôle le domaine contrôle l'adresse où les icônes des joueurs iront chercher le jeu. Deux réglages gratuits (proposé : D-056 veut un test simple, D-057 point 5 garde les protections qui ne coûtent rien), dans votre compte OVHcloud :
1. **La double authentification** (menu de votre compte, « Sécurité » ▲) : une application d'authentification, comme pour Scalingo en 2.2. Rangez les codes de secours.
2. **Le renouvellement automatique** du domaine : **activé** ▲. Un domaine qui expire, ce sont des icônes qui ne mènent plus nulle part.

Même prudence que pour Scalingo : ne suivez jamais le lien d'un e-mail « OVHcloud » ou « Afnic » qui vous demande d'agir sur le domaine ; ouvrez votre compte à la main.

### 1.3 Attendre l'activation
Le domaine peut mettre de quelques minutes à quelques heures à devenir actif (de mémoire). Un e-mail d'OVHcloud le confirme. Vous pouvez faire 1.4 sans attendre.

### 1.4 Préparer le branchement : une entrée dans la zone DNS
**Pourquoi `test18h.elenchos.fr` et pas `elenchos.fr` (proposé).** La page du test est jetable. Si elle vivait à `elenchos.fr`, son icône, ses réglages et son abonnement occuperaient l'adresse du jeu. À une adresse à part, rien ne se mélange. En plus, une adresse comme `test18h.elenchos.fr` se branche à Scalingo par une seule entrée simple (CNAME). L'adresse nue `elenchos.fr` demande une entrée « ALIAS » ou « ANAME » que le registraire doit accepter, sinon des entrées « A » que Scalingo déconseille (documentation de Scalingo, vérifiée le 13 octobre 2026). Que OVHcloud n'accepte pas l'entrée « ALIAS » ou « ANAME » est de mémoire, à vérifier : son site n'a pas pu être ouvert. L'adresse du jeu lui-même sera choisie avec sa construction.

1. Dans votre compte OVHcloud : **Web Cloud › Noms de domaine › elenchos.fr › Zone DNS** ▲.
2. **Ajouter une entrée**, type **CNAME**.
3. **Sous-domaine** : `test18h`. **Cible** : `elenchos-test-18h.osc-fr1.scalingo.io.` — **avec le point final** (Scalingo y insiste). Durée de vie (TTL) : celle proposée.
4. **Suivant**, **Valider**. Ne touchez à aucune autre entrée de la zone.

L'entrée peut être créée avant que l'application existe chez Scalingo : elle attendra. La suite du branchement se fait chez Scalingo, en 2.6.

---

## 2. Démarche 2 — Scalingo (J1, environ 1 heure)

**Vous donnez votre carte, avec deux garde-fous (D-055) : notez la date de fin d'essai le jour de l'ouverture ; l'équipe vous présente la suite au plus tard une semaine avant.**

> **Ce qu'il faut savoir de la carte** (documentation de Scalingo, relue le 13 octobre 2026). Scalingo demande une carte de paiement pour commencer l'essai gratuit. Rien n'est prélevé pendant les 30 jours. Scalingo vous écrit 3 jours et 1 jour avant la fin. À la fin de l'essai, **la facturation commence d'elle-même** si l'application ou la base existent encore : Scalingo ne les supprime pas. Quatre garde-fous :
> - la double vérification **avant** la carte, si l'écran le permet (2.2 avant la fin de 2.1) ;
> - le jour de l'ouverture du compte, **notez la date de fin d'essai** (30 jours plus tard) ;
> - l'équipe vous présente la suite, avec son montant, **au plus tard une semaine avant** cette date ; l'effacement (partie 9) supprime l'application et la base du test bien avant ;
> - **ne touchez jamais le bouton « Stop free trial »** : il lance la facturation tout de suite.
>
> L'essai n'autorise **qu'une application** (vérifié). Supprimer celle du test à la fin libère la place pour la construction du jeu.

> **Prudence, après le bulletin de sécurité de Scalingo du 12 août 2026** (`test-18h.md`, partie 5) : un mot de passe propre à Scalingo ; ne suivez jamais le lien d'un e-mail « Scalingo », ouvrez le tableau de bord à la main (`https://dashboard.scalingo.com`) ; aucun nom d'application, de base ou de variable ne contient un prénom ou une information sur une personne.

Ce jour-là, vous préparez tout chez Scalingo **sauf** la mise en ligne, qui attend le code relu et votre feu vert (parties 5 et 6).

### 2.1 Créer le compte
1. Ouvrez `https://auth.scalingo.com/users/sign_up`.
2. Choisissez **Personal**.
3. Tapez votre adresse e-mail, puis un mot de passe fort, propre à Scalingo (rangez-le dans votre gestionnaire).
4. **Avant de toucher le bouton, faites une capture d'écran de cet écran, où vous acceptez les conditions de Scalingo** (votre preuve pour 2.3 ; rangez-la chez vous). Puis touchez **Sign up with email**. (L'autre bouton, « Sign up with GitHub », marche aussi ; l'e-mail garde les deux comptes séparés.)
5. **Si l'écran vous laisse entrer dans le tableau de bord avant la carte, faites d'abord 2.2** (double vérification), puis revenez ici. Sinon, continuez et faites 2.2 tout de suite après ▲.
6. Remplissez votre **profil de facturation** (à votre nom, D-042) et ajoutez la carte : c'est ce qui démarre l'essai. **Notez la date de fin d'essai.**

### 2.2 La double vérification (P-16)
1. Dans le tableau de bord, menu de votre compte, sous-menu **User Settings › Authentication**.
2. Bloc **Two-factor Authentication (2FA)** : **Enable**.
3. Scannez le code avec une application d'authentification (celle de votre gestionnaire de mots de passe, par exemple), tapez le code à six chiffres, **Validate**.
4. **Copiez les codes de secours** dans votre gestionnaire. Ne sautez pas ce point. Puis **Confirm**.

### 2.3 Le contrat de sous-traitance (RGPD, art. 28)
Gardez la capture faite en 2.1 (étape 4) : c'est la preuve que vous avez accepté les conditions de Scalingo, dont le contrat de sous-traitance fait partie (page de Scalingo vue par moteur). **Pour ce test, elle ne bloque plus rien** (proposé, à confirmer par Juridique) : la base ne contiendra que des données de votre propre téléphone. Juridique en avait fait une condition bloquante pour les données des prêteurs ; elle redevient bloquante avant le premier vrai joueur (proposé).

### 2.4 Lier Scalingo à GitHub (sans rien installer)
1. Ouvrez `https://dashboard.scalingo.com/account/integrations`.
2. Catégorie **GitHub** : **Connect**. GitHub vous demande d'autoriser Scalingo : acceptez.

### 2.5 Créer l'application
1. Tableau de bord : **Create an application +**.
2. **Basic information** : nom `elenchos-test-18h` ; région **osc-fr1** (« Paris - Outscale ») ; projet : celui proposé. Ne cochez pas la case « Health data hosting ».
3. **Create app**.
4. **Deployment method** : la documentation dit qu'on choisit ici le dépôt. **Ne lancez aucune installation aujourd'hui** : rien ne s'installe jamais depuis `main` (D-054, point 1). Si l'écran permet de passer cette étape, passez-la. Si l'écran impose un dépôt et une branche, choisissez le dépôt, laissez **Automatic deployments** désactivé, ne lancez aucun déploiement manuel. Ouvrez ensuite l'onglet **Deploy** : aucun déploiement ne doit y apparaître. S'il y en a un, dites-le-nous tout de suite.

### 2.6 Brancher elenchos.fr à l'application (10 minutes, puis une attente)
Suite de 1.4. Vérifié dans la documentation de Scalingo le 13 octobre 2026.
1. Dans l'application : onglet **Settings**, sous-menu **Public Routing**, bloc **Custom Domains**, **Add a domain**.
2. **Name** : `test18h.elenchos.fr`. **Add**.
3. Scalingo demande alors lui-même un certificat (le cadenas du https) à Let's Encrypt, gratuitement. L'état s'affiche à côté du domaine : **Pending DNS** (Scalingo attend que l'entrée de 1.4 soit visible ; il regarde toutes les minutes), puis **Creating**, puis **In use**. Comptez de quelques minutes à quelques heures, selon l'activation du domaine (estimation). Le certificat se renouvelle seul ; vous n'avez rien d'autre à faire.
4. Touchez l'**étoile** à côté de `test18h.elenchos.fr`, puis **Apply** : c'est le **domaine principal**. L'ancienne adresse en `scalingo.io` renverra désormais vers lui.
5. Onglet **Environment** : ajoutez la variable (pas secrète)
   ```
   ADRESSE_PUBLIQUE=https://test18h.elenchos.fr
   ```
   **Ne l'oubliez pas** : sans elle, la page de résultats l'affiche comme réglage manquant, et la connexion Google et Apple échoue.

Si l'état reste « Pending DNS » le lendemain matin, vérifiez l'entrée de 1.4 (le point final, le nom de l'application) ; sinon, dites-le-nous.

### 2.7 La base de données
1. Dans l'application : onglet **Resources**, bloc **Addons**, **Add an addon**.
2. **PostgreSQL**, puis **Go to plan selection**.
3. Le plus petit plan proposé (l'essai n'en autorise qu'un, le plus petit ; son nom exact ▲ : « Starter 512M » de mémoire). **Finish**.

Deux réglages de la base, dans son propre tableau de bord (depuis l'addon PostgreSQL, lien vers le tableau de bord de la base) :

4. **Pas de sauvegardes programmées.** Onglet **Backups › Logical backups**, bloc **Backup schedule**, **Schedule**, **décochez** « I want to enable scheduled backups », **Update**. Si cette option n'existe pas sur le plan de l'essai, continuez et dites-le-nous. Pourquoi : la documentation de Scalingo dit qu'une base supprimée **garde ses sauvegardes programmées** jusqu'à leur expiration (jusqu'à quatre semaines sur le plus petit plan). Sans elles, l'effacement est réel (D-057, point 5). Le prix : si la base se perdait pendant le test, on recommencerait l'installation (environ une demi-heure).
   **Ne faites jamais de sauvegarde manuelle** (bouton de sauvegarde à la demande) : elle survivrait un mois à la suppression de la base.
5. **Connexion chiffrée obligatoire (proposé).** Onglet **Settings › Internet Access**, bloc **Force TLS connections**, **Enable**. Le programme du test se connecte toujours de façon chiffrée.

### 2.8 Deux réglages de l'application
1. Onglet **Settings › Public Routing**, bloc **Force HTTPS** : activez (proposé ; le programme renvoie aussi vers https).
2. **Journaux du routeur** : vérifiez qu'ils sont **désactivés** (c'est le réglage par défaut ; ils noteraient l'adresse internet de chaque visite, gardée un an). Ne les activez pas (emplacement du réglage ▲).

### 2.9 Les autres réglages (variables d'environnement)
Onglet **Environment**. Ajoutez ces deux variables, en plus de `ADRESSE_PUBLIQUE` (bouton d'ajout, ou édition en bloc ▲). Elles ne sont pas secrètes.

```
PROJECT_DIR=test-18h
SOIRS=2026-10-15=0@1;2026-10-16=1@1;2026-10-17=2@1;2026-10-18=3@1
```

- `PROJECT_DIR` dit à Scalingo d'installer le seul dossier `test-18h` du dépôt.
- `SOIRS` est le calendrier des messages de 18h. Chaque morceau est « date = numéro du soir @ téléphone » : 0 pour la répétition, 1, 2 et 3 pour les trois soirs ; `@1`, c'est votre iPhone (T1). **Si le calendrier glisse**, décalez les dates ; pour **ajouter un soir**, ajoutez par exemple `;2026-10-20=4@1`. Un changement de cette variable redémarre l'application : c'est une mise en ligne au sens de D-043. **Ne la changez jamais de 15h à 19h ni un dimanche.**
- `SCALINGO_POSTGRESQL_URL` a été ajoutée par Scalingo avec la base : n'y touchez pas, ne la copiez nulle part.

Les variables de Google et d'Apple s'ajoutent aux parties 3 et 4 ; les codes, à la partie 6.

Les questions écrites à Scalingo (journaux, sauvegardes, sous-traitants) ne sont pas posées pour ce test, qui n'a plus de prêteurs : elles le seront à la mise à niveau (proposé).

---

## 3. Démarche 3 — Google (J1, environ 25 minutes)

**Avec votre propre compte Google (proposé).** Sans prêteur, plus besoin d'un compte Google de test : c'est vous, sur votre iPhone, avec votre compte. Le test ne garde de lui qu'une empreinte de l'identifiant, jamais l'adresse.

### 3.1 Le projet
1. Avec votre compte Google, ouvrez `https://console.cloud.google.com/`. Acceptez les conditions si c'est la première fois.
2. En haut, sélecteur de projet, **Nouveau projet**. Nom : `elenchos`. **Créer**. Sélectionnez-le.

### 3.2 L'écran d'accord, en mode « Test »
Menu ☰ › **Google Auth Platform** (parfois « API et services › Écran de consentement OAuth » ▲), puis **Commencer** :
1. **Informations sur l'application** : nom `Elenchos (test)` ; adresse d'assistance : la vôtre.
2. **Audience** : **Externe**.
3. **Coordonnées** : votre adresse. Acceptez la règle des données utilisateur. **Créer**.
4. Menu **Audience** : l'état de publication doit être **Test** (« Testing »). Ne touchez pas à « Publier » : c'est pour les vrais joueurs (encadré ci-dessous).
5. Toujours dans **Audience**, **Utilisateurs tests › Add users** : **votre adresse Gmail**, et elle seule. **Enregistrer**.
6. Menu **Accès aux données** (« Data Access ») : n'ajoutez aucun champ d'application. L'identifiant et l'adresse e-mail sont demandés par la page elle-même, sans rien régler ici.
7. Menu **Marque** (« Branding »), **Domaines autorisés** : si la console le demande, ajoutez `elenchos.fr` (▲ ; souvent, elle l'ajoute d'elle-même à l'étape 3.3).

### 3.3 L'identifiant « application Web »
1. Menu **Clients**, **Créer un client**.
2. Type d'application : **Application Web**. Nom : `test-18h`.
3. **Origines JavaScript autorisées** : rien.
4. **URI de redirection autorisés** › **Ajouter un URI** : collez exactement
   `https://test18h.elenchos.fr/connexion/google/retour`
5. **Créer**. Une fenêtre montre l'**ID client** et le **code secret du client**. **Le code secret ne sera plus montré une fois la fenêtre fermée** (Google, depuis juin 2025) : gardez la fenêtre ouverte et passez à 3.4, ou téléchargez le fichier JSON proposé et rangez-le dans votre gestionnaire.

Si la console refuse cette adresse, arrêtez-vous et dites-le-nous.

### 3.4 Les deux réglages chez Scalingo
Onglet **Environment** de l'application, deux variables. Enregistrer une variable redémarre l'application : c'est une mise en ligne au sens de D-043, donc pas de 15h à 19h ni un dimanche (sans effet tant que rien n'est installé, mais utile si le calendrier glisse).
```
GOOGLE_ID_CLIENT=…l'ID client, qui finit par .apps.googleusercontent.com
GOOGLE_SECRET_CLIENT=…le code secret du client
```
Fermez ensuite la fenêtre de Google.

> **Pour les vrais joueurs, plus tard (rien à faire aujourd'hui).** Le mode « Test » ne laisse entrer que les comptes inscrits à la main (cent au plus) et affiche « Google n'a pas validé cette application » : il convient pour vous seul, pas pour des joueurs. Pour eux, on touchera **Publier l'application** (état « En production »). Le jeu ne demande que l'identifiant et l'adresse e-mail, qui ne demandent pas d'examen par Google (relevé, aide de Google et blog des développeurs de Google, 13 octobre 2026). Sans autre démarche, l'écran de Google montrera **« elenchos.fr »** au lieu du nom et du logo du jeu. Pour y voir le nom et le logo, une vérification de la marque, facultative, prend deux à trois jours ouvrés ; elle demande une page d'accueil et une page de confidentialité sur elenchos.fr, et la preuve que le domaine est à vous (une entrée de plus dans la zone DNS) (relevé). Le choix vous sera présenté avec la construction.

---

## 4. Démarche 4 — Apple (J1, environ 40 minutes)

Dans votre compte développeur : `https://developer.apple.com/account`, puis **Certificates, Identifiers & Profiles**. Vérifié dans l'aide d'Apple le 13 octobre 2026, sauf mention.

Les identifiants ci-dessous servent au test seulement. Ceux du jeu seront créés plus tard, au travail 9.

### 4.1 L'identifiant d'application (App ID)
1. **Identifiers** dans la barre de gauche, puis le bouton **+** en haut à gauche.
2. **App IDs**, **Continue** ; type **App**, **Continue**.
3. **Description** : `Test 18h`. **Bundle ID** : **Explicit**, `io.github.ppcrepin.test18h` (un nom qui vous appartient déjà, celui de votre page GitHub ; il ne sert qu'au test).
4. Dans la liste **Capabilities**, cochez **Sign In with Apple**.
5. **Continue**, vérifiez, **Register**.

### 4.2 L'identifiant de service (Services ID)
1. **Identifiers**, **+**, **Services IDs**, **Continue**.
2. **Description** : `Test 18h` (de mémoire, c'est ce nom qu'Apple montre sur son écran de connexion). **Identifier** : `io.github.ppcrepin.test18h.web`.
3. **Continue**, **Register**.
4. Dans la liste, touchez ce Services ID. Cochez **Sign In with Apple**, puis **Configure** :
   - **Primary App ID** : `Test 18h` (créé en 4.1) ;
   - le domaine : `test18h.elenchos.fr`
   - l'adresse de retour : `https://test18h.elenchos.fr/connexion/apple/retour`
   - **Done**, puis **Continue**, puis **Save**.

   **Un ou deux champs** ▲ : l'aide d'Apple décrit maintenant un seul champ, **Website URLs**, où l'on met domaines et adresses de retour à la suite, séparés par des virgules ; l'écran peut encore en montrer deux, **Domains and Subdomains** et **Return URLs**. Si vous voyez un seul champ, collez : `test18h.elenchos.fr,https://test18h.elenchos.fr/connexion/apple/retour`. Si vous en voyez deux, une valeur dans chacun.

**Aucun fichier à déposer sur le serveur** : l'aide d'Apple le dit (« You don't need to upload a file on your server »), vérifié le 13 octobre 2026. Avec un domaine à vous, le doute sur l'adresse de Scalingo est levé. Si l'écran refuse quand même le domaine, arrêtez-vous et dites-le-nous.

### 4.3 La clé privée
1. **Keys** dans la barre de gauche, **+**.
2. **Key Name** : `Test 18h`. Cochez **Sign in with Apple**, puis **Configure** à côté : **Primary App ID** `Test 18h`, **Save**.
3. **Continue**, **Register**.
4. **Download** : un fichier `AuthKey_XXXXXXXXXX.p8` arrive dans vos Téléchargements. **Apple ne le donne qu'une fois.** Rangez-le dans votre gestionnaire de mots de passe (pièce jointe), puis supprimez-le des Téléchargements après l'étape 4.5.
5. Notez le **Key ID** affiché (10 caractères).

### 4.4 Votre numéro d'équipe
En haut à droite de la page du compte, ou **Membership details** : le **Team ID** (10 caractères).

### 4.5 Les quatre réglages chez Scalingo
Onglet **Environment**. Même rappel qu'en 3.4 : enregistrer redémarre l'application, donc pas de 15h à 19h ni un dimanche.
```
APPLE_ID_SERVICE=io.github.ppcrepin.test18h.web
APPLE_ID_EQUIPE=…le Team ID
APPLE_ID_CLE=…le Key ID
APPLE_CLE_PRIVEE=…le contenu du fichier .p8
```
Pour le contenu du fichier .p8 : ouvrez-le avec TextEdit (ou le Bloc-notes), **Tout sélectionner**, copiez, collez comme valeur, **lignes « BEGIN » et « END » comprises**. Si Scalingo coupe les retours à la ligne, ce n'est pas grave : le programme les reconstruit. Si le champ refuse le collage, attendez la partie 6 : la page `/preparer` met la clé sur une seule ligne.

---

## 5. Le feu vert, la veille (J1)

Les agents ne mettent rien en ligne sans votre accord écrit, donné **la veille** (D-054). Le jour J1, quand l'équipe vous dit que le code a passé sa relecture (Cohérence, puis le Vérificateur), écrivez simplement dans la conversation :

> Feu vert : mise en ligne du test demain, jeudi 15 octobre, avant 15h.

Le lendemain matin, l'équipe pousse le code relu sur la branche `mise-en-ligne`, avant 15h, et vous prévient. Rien ne part de 15h à 19h ni le dimanche : la fabrication chez Scalingo elle-même échoue exprès dans ces créneaux (garde des horaires).

Il en va de même pour chaque correction ensuite : l'équipe ne pousse rien sur `mise-en-ligne` sans un nouveau message de vous, écrit la veille : « Feu vert : mise en ligne de la correction demain, [jour], avant 15h. » Une correction qu'un défaut oblige à pousser le dimanche ou entre 15h et 19h n'est pas faite ; elle attend.

---

## 6. La mise en ligne, vos codes et votre iPhone (démarche 5 ; J2, avant 15h, puis 18h)

### 6.1 Brancher la branche et installer (dès que l'équipe a poussé)
1. Application `elenchos-test-18h`, onglet **Deploy › Configuration**.
2. Dépôt `ppcrepin/elenchos` ; branche **`mise-en-ligne`** ; **Automatic deployments** : activé.
3. Si rien ne démarre seul dans les dix minutes : dites-le-nous d'abord (nous voyons si la vérification GitHub est passée). Ensuite seulement : sous-menu **Manual deployment**, branche `mise-en-ligne`, lancez.
4. Attendez la fin (quelques minutes). **Si la fabrication échoue**, copiez-nous son message d'erreur (la fenêtre de fabrication du déploiement en échec), rien d'autre.

**Pas avant 15h ? Pas un dimanche ?** Si vous faites ceci entre 15h et 19h ou un dimanche, la fabrication échoue avec le message « Horaires : aucune installation de 15h à 19h ni le dimanche » : c'est voulu. Recommencez avant 15h ou après 19h, un autre jour que le dimanche.

### 6.2 Fabriquer vos codes et la clé des messages (5 minutes)
**Enregistrer ces réglages (étape 4) redémarre l'application : c'est une mise en ligne au sens de D-043. Ne le faites pas de 15h à 19h ni un dimanche. S'il est plus de 14h30, attendez 19h.**

1. Sur votre ordinateur, ouvrez `https://test18h.elenchos.fr/preparer`. Le cadenas doit être fermé ; sinon, le certificat n'est pas encore prêt (2.6, étape 3) : attendez « In use ».
2. Touchez **Fabriquer les codes**. La page tire au hasard, **dans votre navigateur**, **cinq lignes de réglages** : (1) le secret de session, (2) la liste des codes d'essai (une seule ligne, qui contient les cinq codes T1 à T5), (3) **votre code d'accès** aux résultats, (4) la clé publique et (5) la clé privée des messages. Rien n'est envoyé au serveur. Le programme attend toujours cinq codes ; **seul T1 servira**.
3. Plus bas, la page liste les cinq codes et votre code d'accès : **copiez au moins T1 et votre code d'accès dans votre gestionnaire de mots de passe**.
4. **Copier ces lignes**, puis, chez Scalingo, onglet **Environment**, édition en bloc : collez ces cinq lignes (une par réglage) à la suite des autres (▲ ; sinon, ajoutez-les une par une : le nom avant le « = », la valeur après). Enregistrez : l'application redémarre.
5. Si la clé Apple n'a pas pu être collée en 4.5 : section 2 de la même page, choisissez le fichier .p8, copiez la ligne obtenue, ajoutez-la de la même façon.
6. Fermez la page. Ne la rechargez pas avant d'avoir tout collé : chaque chargement tire d'autres valeurs.

Ne nous envoyez jamais ces valeurs. Si l'une d'elles fuit, recommencez 6.2 (l'abonnement de votre iPhone serait à refaire).

### 6.3 Vérifier
1. Sur votre ordinateur, ouvrez `https://test18h.elenchos.fr/resultats`, tapez votre code d'accès, **Entrer**.
2. Section **Réglages** : « Tous les réglages sont en place. » Sinon, la page donne le **nom** des réglages manquants : corrigez-les (et dites-nous le nom si vous ne trouvez pas).
3. Section **Calendrier des envois** : les dates de `SOIRS`, avec « (aujourd'hui) » sur le bon jour, chacune pour T1.
4. Tapez l'ancienne adresse, `elenchos-test-18h.osc-fr1.scalingo.io` : vous devez arriver sur `test18h.elenchos.fr` (2.6, étape 4).

### 6.4 Votre iPhone (T1), environ 15 minutes
Gardez la page de résultats ouverte **sur votre ordinateur** : sur l'iPhone, vous ne toucherez que Safari puis l'icône du test.

1. **Noter, sans rien changer** (liste de contrôle) : la version d'iOS (**Réglages › Général › Informations**) ; si une **Concentration** est programmée (**Réglages › Concentration**) ; si le **Résumé programmé** est actif (**Réglages › Notifications › Résumé programmé**) ; si le **mode Économie d'énergie** est actif (**Réglages › Batterie**). Vous notez « oui/non », pour vous.
2. **Safari** : tapez `test18h.elenchos.fr` dans la barre d'adresse. La page « Test du message de 18h » s'ouvre.
3. **Continuer avec Google**, avec votre compte Google. Si Google affiche « Google n'a pas validé cette application », touchez **Continuer** ▲. **Si Google affiche une erreur** (par exemple « disallowed_useragent »), notez-la mot pour mot : c'est un résultat du test.
4. De retour sur la page : « Connexion : connecté avec Google ».
5. **Ajouter à l'écran d'accueil** : bouton **Partager** (le carré avec une flèche vers le haut ; sur iOS 26, il peut se trouver dans le menu **⋯** ▲), puis **Sur l'écran d'accueil**. Le nom proposé est « Test 18h » : gardez-le. Sur iOS 26, si un réglage « Ouvrir comme app web » apparaît, laissez-le **activé**. **Ajouter**.
6. **Ouvrez l'icône** « Test 18h ». La page dit « Ouverte depuis l'icône : oui ». La connexion dit probablement « aucune » : l'icône a sa propre mémoire. Touchez **Continuer avec Google** et refaites 3. **Notez** : êtes-vous revenu dans l'icône, ou dans Safari ? La page dit-elle « connecté avec Google » ? Si une page dit « La connexion a expiré, ou elle s'est terminée dans Safari au lieu de l'icône », notez-le : c'est l'échec que le test cherche exprès.
7. **Recevoir le message de 18h**. Tapez le **code T1**, **Valider**. La page dit « C'est le téléphone 1. Touche « Autoriser les messages », puis « Autoriser ». »
8. **Autoriser les messages**, puis **Autoriser** dans la fenêtre de l'iPhone. La page dit « C'est fait ». En haut : « Messages de 18h : autorisés ».
9. **La connexion Apple**, toujours depuis l'icône (le bouton n'apparaît qu'après l'abonnement) : **Continuer avec Apple**, avec votre compte Apple. Apple peut proposer de partager ou de masquer votre adresse : les deux conviennent, elle n'est jamais gardée. Notez si vous revenez dans l'icône, « connecté avec Apple ». La section **Connexions** de la page de résultats montre alors deux comptes : un Google, un Apple.
10. Sur l'ordinateur, page de résultats : ligne T1, **Message d'essai**. Dans la minute, l'iPhone affiche « Test, message d'essai ». **Ne le touchez pas** : lisez-le, c'est tout. Rechargez la page de résultats : la ligne dit « accepté » et une heure de réception.
11. Ligne T1 : tapez la version d'iOS (forme `iOS 18.6`), **Noter**.
12. **Fermez l'icône** (balayez vers le haut). À partir de maintenant : **ne plus ouvrir l'icône ni toucher les messages du test avant le soir 3**.

**À 18h00 ce jour-là**, votre iPhone reçoit « Test, répétition » : c'est la répétition, elle ne compte pas. Regardez la ligne dans le tableau vers 18h05.

---

## 7. Les deux minutes du soir (démarche 6 ; J3 à J5, vers 18h10)

1. Sur votre ordinateur, ouvrez la page de résultats (votre code d'accès vous est redemandé toutes les douze heures). Pas l'icône.
2. La ligne du soir : **Réponse du service** « accepté », une heure **Reçu**, l'**Écart** en secondes et un **Résultat** (à l'heure avant 18h02, acceptable avant 18h05, en retard jusqu'à 18h30, manqué au-delà).
3. **Le « vu »** : avez-vous vu le message sur l'écran de l'iPhone ? Recevoir et voir sont deux choses différentes (un « Résumé programmé » retient l'affichage). Collez la ligne « À copier » dans votre note personnelle et remplacez « ___ » par l'une de trois mentions : « à l'heure » (vu avant 18h05), « plus tard », « rien vu ». Si l'iPhone était éteint, laissez vide : le soir ne compte pas.
4. **Si la ligne est mauvaise** (« refusé », « manqué », « envoi interrompu », rien à 18h05) : regardez vous-même, sans nous envoyer de journal (D-048) ; l'iPhone était-il allumé, avec du réseau ? Envoyez-nous seulement une ligne du type « soir 2 : non reçu, iPhone allumé, Concentration active ». L'équipe applique les règles de `test-18h.md`, partie 1 (« Ce qu'on fait en cas d'échec »).

**Le soir 3 (J5, dimanche)** : éteignez puis rallumez votre iPhone **avant 18h**. À 18h10, il reçoit en plus « Test, soir 3 sur 3 (seconde forme) » (s'il est en iOS 18.4 ou plus récent) : sa ligne apparaît avec « seconde forme ». Après ce message, **ouvrez enfin l'icône** et notez si elle affiche « Connexion : connecté avec Apple » (la dernière connexion faite en 6.4), puis fermez-la.

**Ajouter un soir** : modifiez `SOIRS` chez Scalingo (partie 2.9), jamais de 15h à 19h ni un dimanche ; l'effacement glisse d'autant.

---

## 8. En cas de panne

- **Une page ne répond pas, un message ne part pas** : c'est vous qui regardez (D-048), dans le tableau de bord de Scalingo (état de l'application, redémarrage). Ne nous copiez pas les journaux de l'application en marche.
- **Une installation échoue** : copiez-nous le message d'erreur de la fabrication.
- **La page ne s'ouvre pas à `test18h.elenchos.fr`, ou sans cadenas** : regardez l'état du certificat (2.6, étape 3) et l'entrée de la zone DNS (1.4).
- **Aucune correction n'est mise en ligne de 15h à 19h ni le dimanche** : une panne le dimanche attend le lundi matin, et le soir manqué est ajouté (partie 7).

---

## 9. L'effacement (démarche 7 ; J6, environ 20 minutes)

L'effacement n'est pas une mise en ligne : la garde des horaires ne le bloque pas. Ne le faites pourtant pas entre 18h00 et 18h30 si un soir est en cours (un soir ajouté, par exemple).

Dans cet ordre :

1. **Copier le tableau.** Page de résultats, zone **À copier pour l'équipe**, **Copier**. Complétez les « vu » depuis votre note. Collez le tout dans la conversation : seulement ces lignes.
2. **Votre iPhone** : ouvrez l'icône, **Se déconnecter** ; puis appui long sur l'icône. Il faut le geste qui **supprime** l'icône, pas celui qui la retire seulement de l'écran d'accueil (▲ selon la version d'iOS) :
   - si le menu propose **Supprimer l'app** (ou **Supprimer le signet**), choisissez-le, puis confirmez **Supprimer** ;
   - s'il ne propose que **Supprimer de l'écran d'accueil**, ou si une fenêtre propose les deux, prenez celui qui **supprime** ; vérifiez ensuite que « Test 18h » n'apparaît plus dans la Bibliothèque d'apps (balayer l'écran d'accueil jusqu'au bout, à droite) et, s'il y est encore, supprimez-le de là.
   Quoi qu'il arrive, aucun message ne peut plus arriver une fois l'application et la base supprimées chez Scalingo (étape 4).
3. **Tout effacer.** Page de résultats, section **Tout effacer** : tapez `EFFACER`, touchez **Tout effacer**. La page doit dire **« Base vide : vérifié »**, avec zéro ligne partout. Sinon, ne supprimez rien et dites-le-nous.
4. **Supprimer chez Scalingo.** « Tout effacer » a vidé la base ; il faut maintenant la **supprimer** : sa copie continue des changements (7 jours) ne part qu'avec elle.
   - Application `elenchos-test-18h`, onglet **Resources**, bloc **Addons**, l'addon PostgreSQL : supprimez-le ▲.
   - Puis onglet **Settings**, **Delete app**, remplissez la confirmation, confirmez. Le domaine `test18h.elenchos.fr` part avec elle.
   - Ouvrez la page **Billing** (et la liste de vos applications) : **plus aucune application ni base**. S'il en reste une, supprimez-la et dites-le-nous.
   - **Faites-le avant le 30e jour de l'essai** : sinon, la facturation commence. La place de l'unique application de l'essai est alors libre pour la construction du jeu.
   - La trace des connexions gardée par Scalingo reste un an, par obligation légale ; ni vous ni l'équipe ne pouvez l'effacer.
5. **Retirer l'entrée de la zone DNS (à ne pas oublier).** Compte OVHcloud, **Zone DNS** d'elenchos.fr : supprimez l'entrée CNAME `test18h`. Pourquoi : une entrée qui pointe vers une application supprimée peut être reprise par quiconque crée chez Scalingo une application du même nom ; il pourrait alors servir sa page à `test18h.elenchos.fr`. **Gardez le domaine elenchos.fr** : il sert au jeu.
6. **Google.** Avec votre compte : `https://myaccount.google.com`, **Sécurité**, **Vos connexions à des applications et services tiers**, `Elenchos (test)`, **Supprimer l'accès** ▲. Puis console Google, **Clients**, `test-18h` : retirez l'URI de redirection, enregistrez. Gardez le projet (il resservira, proposé).
7. **Apple.** Sur votre iPhone : **Réglages › [votre nom] › Connexion et sécurité › Se connecter avec Apple**, `Test 18h`, **Ne plus utiliser** ▲. Dans le compte développeur, **Identifiers**, Services ID `io.github.ppcrepin.test18h.web`, **Sign In with Apple › Configure** : retirez le domaine et l'adresse de retour, **Done**, **Continue**, **Save**. Les identifiants du test ne resserviront pas ; ceux du jeu seront créés au travail 9. Gardez le fichier .p8 dans votre gestionnaire.
8. **La ligne datée.** Écrivez, chez vous : « Test du message de 18h : effacé le [date], vérifié. »

---

## Ce qui n'a pas pu être vérifié

- **La disponibilité d'elenchos.fr** : le service public de l'Afnic qui répond « libre ou pris » n'a pas pu être joint depuis l'environnement de l'équipe ; un moteur de recherche ne trouve aucun site à cette adresse, ce qui ne prouve rien. On le saura en 1.1.
- **Le prix et les écrans d'OVHcloud** : son site n'a pas pu être ouvert ; prix relevés sur des comparatifs récents, menus de mémoire.
- **Les écrans de la console Google** : le site n'a pas pu être ouvert ; noms des menus de mémoire et d'après des guides récents.
- **L'écran d'Apple pour le domaine** : un champ ou deux (4.2).
- **Chez Scalingo** : le nom exact du plus petit plan PostgreSQL, l'édition des variables en bloc, l'écran « Deployment method » à la création de l'application, l'emplacement du réglage des journaux du routeur, et le temps réel avant le certificat (« In use »).
- **Les gestes d'iOS 26** (bouton Partager, « Ouvrir comme app web »), le geste qui **supprime** l'icône selon la version d'iOS, et les chemins exacts des Réglages pour « Se connecter avec Apple ».
- **La carte** : la documentation de Scalingo la demande ; c'est l'écran qui tranchera.
- **Le code n'a jamais tourné chez Scalingo, ni vers le vrai service d'Apple, ni avec les vrais Google et Apple** : il a passé ses tests automatiques contre des imitations fidèles. C'est la raison d'être du message d'essai de J2.
