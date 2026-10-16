# Voir le jeu sur votre iPhone dès l'étape 1 : votre pas-à-pas

*État, 16 octobre 2026 : relu par le Vérificateur (OK avec corrections mineures, appliquées). Ce guide ne sert que si vous choisissez, au point d'étape, de voir le jeu sur votre iPhone dès l'étape 1 (plan, `plan-jeu-entier.md`, « La question qui vous revient »). Il vous est remis avec cette question : n'ouvrez pas Scalingo avant d'y avoir répondu.*

*UX, avec Back-end. Écrans d'Apple et de GitHub d'après leurs pages d'aide (relevé de Front-end, 16 octobre 2026) ; écrans de Scalingo d'après sa documentation (relue le 16 octobre 2026, deux fois : la seconde pour le redémarrage, règle 3) et le pas-à-pas du test de 18h. Ce qui n'a pas pu être vérifié est marqué ▲.*

**En tout : environ 2 h 30 de gestes, en cinq fois, sur une à deux semaines** (le plan annonçait environ 2 heures ; le détail des gestes ajoute une demi-heure), plus l'attente d'une réponse d'Apple (durée inconnue, 1.9). Ensuite, trois soirs de 2 minutes.

**Ce que ça coûte.** Rien pendant 30 jours. Ensuite, environ 26 € TTC par mois chez Scalingo, l'hébergeur, si vous continuez : la question vous sera posée une semaine avant (D-055, D-063). Tout le reste de ces gestes est gratuit, à une exception déjà engagée : votre compte Apple, qui se renouvelle chaque année pour environ 99 € (1.7). Plus tard, le domaine elenchos.fr (environ 6 €, étape 4) vous sera présenté avec son prix avant tout achat (D-063).

**Sommaire et déroulé**

| Quand | Vous faites | Durée |
|---|---|---|
| Jour 1 | 1. Votre compte Apple (sauf 1.11) | 35 min |
| Dès qu'Apple a donné son accord (1.9) | 1.11, puis 2. GitHub | 15 min |
| Quand l'équipe vous écrit « le serveur est prêt » | 3. Scalingo, puis 4. Ce que vous nous écrivez | 1 h |
| La veille de la mise en ligne | Votre feu vert écrit (4) | 1 min |
| Le jour J, un matin de semaine | 5.1 à 5.4 : mise en ligne, les trois clés du serveur, Elenchos sur votre iPhone | 45 min |
| Les trois soirs suivants | 5.5 : le message est-il arrivé ? | 2 min par soir |

En cas de souci : partie 6.

**Trois règles, pour tout ce qui suit.**
1. **Vous ne nous envoyez jamais un secret** : ni clé, ni mot de passe, ni code, ni capture d'écran qui en montre un (D-048). Vous les tapez vous-même chez Apple, GitHub et Scalingo, et vous les gardez dans votre gestionnaire de mots de passe (l'app Mots de passe de l'iPhone convient).
2. **Ce que vous pouvez nous écrire** se limite à la partie 4, aux lignes du soir (5.5) et à ce que la partie 6 vous demande.
3. **Rien ne se met en ligne de 15h à 19h ni le dimanche** (D-043). Une fois le serveur en ligne, un réglage changé chez Scalingo ne compte qu'au démarrage suivant du serveur : après un changement, c'est vous qui redémarrez l'application (5.2). Ce redémarrage compte comme une mise en ligne. Changer un réglage et redémarrer se font donc aux mêmes heures : avant 15h ou après 19h, jamais le dimanche. L'application pour votre iPhone, elle, se fabrique **le matin** : l'équipe la lance avant 14h (sa règle, une heure de marge), pour qu'Apple ait fini de la traiter avant 15h.

**Cinq mots, une fois pour toutes.**
- **Clé** : un fichier, ou une ligne de lettres, qui ouvre un accès, comme un mot de passe.
- **Identifiant (ID)** : un nom fixe comme `io.github.ppcrepin.elenchos`, ou un code de 10 signes qu'Apple affiche (Team ID, Key ID).
- **Réglage** : une ligne `NOM=valeur` rangée chez Scalingo, que le serveur lit en démarrant. Scalingo dit « variable d'environnement ».
- **Fabrication** : le passage qui transforme le code en application installable. Elle tourne sur les machines de GitHub, puis Apple la traite.
- **Mise en ligne** : installer une nouvelle version du serveur chez Scalingo.

> **Écrans de mémoire (▲).** Un ▲ marque un écran ou un menu que nous n'avons pas pu voir : nous le décrivons de mémoire. Si l'écran dit autre chose, suivez l'écran s'il est clair ; sinon, arrêtez-vous et écrivez-nous. Les écrans d'Apple sont nommés ici en anglais ; si votre compte est en français, les mots changent, les places restent ▲.

**À avoir sous la main** : un ordinateur (Mac ou PC) pour les parties 1 à 3 ; votre iPhone, en iOS 15 ou plus récent ; vos accès à Apple et à GitHub ; votre carte bancaire (partie 3).

---

## 1. Votre compte Apple (environ 40 minutes, 0 €)

Deux sites : `https://developer.apple.com/account` (rubrique **Certificates, Identifiers & Profiles**) et `https://appstoreconnect.apple.com`. Tout y est gratuit : votre compte développeur est déjà payé.

### 1.1 Accepter les accords en attente (2 min, 0 €)
Sur App Store Connect, menu **Business** (ou « Accords ») ▲ : si un accord du programme développeur attend, acceptez-le. Sans lui, Apple refuse la fiche de l'application (1.8). L'accord des applications payantes est inutile.

### 1.2 L'identifiant de l'application (5 min, 0 €)
1. developer.apple.com/account › **Certificates, Identifiers & Profiles** › **Identifiers**, bouton **+**.
2. **App IDs**, **Continue** ; type **App**, **Continue**.
3. **Description** : `Elenchos`. **Bundle ID** : **Explicit**, `io.github.ppcrepin.elenchos`.
4. Dans **Capabilities**, cochez **Push Notifications** et **Sign In with Apple** (gardez « Enable as a primary App ID »). Rien d'autre.
5. **Continue**, puis **Register**. Vous voyez « Elenchos » dans la liste.

> **Tapez l'identifiant exactement.** Il ne pourra plus changer une fois la première version envoyée à Apple.

### 1.3 L'identifiant de l'extension (3 min, 0 €)
L'extension est le petit morceau de l'application qui signale l'arrivée du message de 18h. Même chemin, **+**, **App IDs**, **App** :
- **Description** : `Elenchos reception` (sans accent, par prudence : Apple refuse certains caractères) ;
- **Bundle ID** : **Explicit**, `io.github.ppcrepin.elenchos.reception` ;
- **aucune** case cochée ; **Continue**, **Register**.

### 1.4 La clé des messages (5 min, 0 €)
1. **Keys**, bouton **+**. **Key Name** : `Elenchos messages`.
2. Cochez **Apple Push Notification service (APNs)**, puis **Configure** : environnement **Production**, type **Team Scoped**. **Save**.
3. **Continue**, **Register**. Apple affiche la clé, avec le bouton **Download** : touchez-le. Un fichier `AuthKey_…p8` arrive dans vos Téléchargements.
4. Notez le **Key ID** affiché (10 signes).
5. Dans votre gestionnaire, créez une fiche « Elenchos messages » : le Key ID, et le contenu du fichier collé dans les notes (ouvrez-le avec TextEdit ou le Bloc-notes, **Tout sélectionner**, copier). Gardez le fichier jusqu'au premier soir réussi (5.5).

> **Apple ne donne ce fichier qu'une fois.** S'il est perdu, on révoque la clé et on en crée une autre, gratuitement (partie 6).

### 1.5 La clé de connexion (5 min, 0 €)
Elle sert au serveur pour retirer Elenchos du compte Apple d'un joueur qui fait « Tout effacer ». Elle ne servira qu'à l'étape 2 ; nous la créons maintenant pour ne pas vous faire revenir chez Apple.
1. **Keys**, **+**. **Key Name** : `Elenchos connexion`.
2. Cochez **Sign in with Apple**, puis **Configure** : **Primary App ID** = `Elenchos (io.github.ppcrepin.elenchos)`. **Save**.
3. **Continue**, **Register**, **Download**. Notez le **Key ID**. Vous voyez maintenant deux clés dans **Keys**.
4. Rangez-la comme en 1.4, dans une fiche « Elenchos connexion ».

### 1.6 Votre numéro d'équipe (1 min, 0 €)
developer.apple.com/account › **Membership details** : le **Team ID** (10 signes). Notez-le.

### 1.7 La date de renouvellement de votre compte Apple (1 min, 0 € aujourd'hui)
Même page, **Membership details** : la date d'expiration ou de renouvellement de votre adhésion ▲. Notez-la, et si le renouvellement est automatique. Il coûte environ 99 € par an, à cette date. Vous nous l'écrirez (partie 4) : l'équipe vous le rappellera une semaine avant, avec le choix de continuer ou d'arrêter (D-063).

### 1.8 La fiche de l'application (5 min, 0 €)
App Store Connect › **Apps**, bouton **+**, **New App** :
- **Platforms** : iOS ;
- **Name** : `Elenchos`. Si Apple répond que le nom est pris, essayez `Elenchos – le jeu` : le nom pourra encore changer ;
- **Primary Language** : French (France) ;
- **Bundle ID** : choisissez `Elenchos - io.github.ppcrepin.elenchos` dans la liste ;
- **SKU** : `elenchos-1` (une référence interne, jamais montrée) ;
- **User Access** : **Full Access** ; **Create**. La page de l'application s'ouvre.

Dans TestFlight, vos testeurs verront votre nom comme éditeur : le compte est à votre nom (D-042).

### 1.9 Demander l'accès à la clé de fabrication (2 min puis attente, 0 €)
App Store Connect › **Users and Access**, onglet **Integrations**, **App Store Connect API**, bouton **Request Access**. Cochez l'accord, **Submit**. Apple répond plus tard, par e-mail ou sur cette même page ▲.

> **Le risque chez Apple.** Apple étudie chaque demande au cas par cas, sans délai connu. S'il refuse ou tarde trop, l'équipe passe à la « signature à la main » : une dizaine de gestes de plus chez Apple et chez GitHub, gratuits (dont, probablement, un mot de passe d'application à ranger dans le coffre GitHub, pour l'envoi à Apple sans clé de fabrication), qu'elle vous écrira alors ; en dernier recours, un Mac loué une journée, présenté d'abord avec son prix (D-063). Même avec l'accès, personne ne sait d'avance si la fabrication sans Mac passera du premier coup : c'est ce que l'étape 1 vérifie.

### 1.10 Le groupe de testeurs (3 min, 0 €)
App Store Connect › **Apps** › Elenchos, onglet **TestFlight**, **Internal Testing**, bouton **+** :
1. Nom du groupe : `Porteur`. Cochez **Enable automatic distribution**. **Create**.
2. **Invite Testers** : cochez-vous, **Add**. Votre nom apparaît dans le groupe.

Vous êtes ainsi testeur « interne » : Apple ne relit pas l'application avant de vous l'ouvrir. Vos amis viendront plus tard, après une relecture d'Apple (plan, étape 2).

### 1.11 La clé de fabrication, dès qu'Apple a donné son accord (5 min, 0 €)
1. **Users and Access** › **Integrations** › **App Store Connect API**, onglet **Team Keys**, **Generate API Key** (ou **+**).
2. **Name** : `GitHub fabrication`. **Access** : **Admin**. **Generate**.
3. **Download API Key** (une seule fois) : un fichier `AuthKey_…p8`.
4. Notez le **Key ID** de la clé, et l'**Issuer ID**, affiché au-dessus de la liste (une longue suite avec des tirets).
5. Enchaînez avec la partie 2. Une fois les secrets rangés chez GitHub, supprimez ce fichier et videz la corbeille : si un jour il en faut un autre, on en crée un.

> **C'est une clé puissante** : elle peut tout faire dans votre App Store Connect. Elle ne vivra que dans le coffre de GitHub (partie 2) et se révoque d'un clic, sur cette même page.

---

## 2. GitHub (environ 10 minutes, 0 €)

Vous créez un coffre à secrets (GitHub dit « environment ») que seule la fabrication de l'application peut ouvrir, et seulement depuis la branche `mise-en-ligne`. Gratuit tant que le dépôt reste public.

1. `https://github.com/ppcrepin/elenchos`, onglet **Settings**, puis **Environments** dans la colonne de gauche, **New environment**.
2. Nom : `testflight` (exactement). **Configure environment**.
3. **Deployment branches and tags** : choisissez **Selected branches and tags**, puis **Add deployment branch or tag rule** : type **Branch**, motif `mise-en-ligne`, **Add rule**. Cette branche n'existe pas encore : c'est normal.
4. Ne cochez pas **Required reviewers**.
5. **Environment secrets**, **Add environment secret**, quatre fois :

| Nom (exactement) | Valeur |
|---|---|
| `ASC_CLE_ID` | le Key ID de la clé de fabrication (1.11) |
| `ASC_EMETTEUR_ID` | l'Issuer ID (1.11) |
| `ASC_CLE_P8` | tout le contenu du fichier de 1.11, ouvert avec TextEdit ou le Bloc-notes, lignes « BEGIN » et « END » comprises, tel quel |
| `APPLE_ID_EQUIPE` | le Team ID (1.6) |

Vous voyez les quatre noms ; GitHub ne remontre jamais les valeurs. Pour en corriger une, on la remplace (**Update**). Les clés de 1.4 et 1.5 ne vont **pas** chez GitHub.

---

## 3. Scalingo (environ 1 heure ; 0 € pendant 30 jours, puis environ 26 € TTC par mois)

**Quand :** quand l'équipe vous écrit que le serveur est prêt à être installé. L'essai gratuit commence le jour de l'ouverture du compte : autant ne pas en perdre de jours.

> **La carte (D-055).** Scalingo demande une carte pour ouvrir l'essai de 30 jours. Rien n'est prélevé pendant l'essai ; Scalingo vous écrit 3 jours et 1 jour avant la fin. À la fin, **la facturation commence d'elle-même** si l'application ou la base existent encore : environ 26 € TTC par mois (le serveur et la base, dans leur plus petite taille). Deux garde-fous : **notez la date de fin d'essai** le jour de l'ouverture ; l'équipe vous présente la suite, continuer ou tout supprimer, **au plus tard une semaine avant**.
>
> **Ne touchez jamais le bouton « Stop free trial »** : il lance la facturation tout de suite.
>
> **Déjà un compte Scalingo ?** N'en créez pas un second, et écrivez-nous d'abord sa date d'ouverture : l'essai court depuis ce jour-là, et s'il est fini, créer l'application coûterait tout de suite.

> **Prudence (bulletin de sécurité de Scalingo du 12 août 2026).** Un mot de passe propre à Scalingo. Ne suivez jamais le lien d'un e-mail « Scalingo » : ouvrez `https://dashboard.scalingo.com` à la main. Aucun nom d'application ou de base ne contient un prénom.

### 3.1 Créer le compte (10 min ; 0 €, la carte est enregistrée, rien n'est prélevé)
1. `https://auth.scalingo.com/users/sign_up`, choisissez **Personal**.
2. Votre adresse e-mail, un mot de passe fort, propre à Scalingo, rangé dans votre gestionnaire.
3. **Avant de toucher le bouton**, faites une capture de cet écran, où vous acceptez les conditions de Scalingo : gardez-la chez vous, c'est votre preuve. Puis **Sign up with email**.
4. Si l'écran vous laisse entrer dans le tableau de bord avant la carte, faites d'abord 3.2, puis revenez ici ▲.
5. **Billing**, onglet **Billing profile**, **Add billing informations** : **Individual**, à votre nom ; **Save these billing informations** ; puis ajoutez la carte. C'est ce qui démarre l'essai.
6. **Notez la date de fin d'essai : la date du jour, plus 30 jours.**

### 3.2 La double vérification (5 min, 0 €)
1. Menu de votre compte, **User Settings** › **Authentication**.
2. Bloc **Two-factor Authentication (2FA)**, **Enable**.
3. Scannez le code avec une application de codes (l'app Mots de passe de l'iPhone sait le faire), tapez le code à six chiffres, **Validate**.
4. **Copiez les codes de secours** dans votre gestionnaire. Ne sautez pas ce point. **Confirm**.

### 3.3 Relier Scalingo à GitHub (2 min, 0 €)
`https://dashboard.scalingo.com/account/integrations`, catégorie **GitHub**, **Connect**. GitHub demande votre autorisation : acceptez. La catégorie GitHub se dit alors reliée.

### 3.4 Créer l'application (5 min ; gratuite pendant l'essai, puis dans les 26 €)
1. Tableau de bord, **Create an application +**.
2. Nom : `elenchos` (pris ? `elenchos-jeu`). Région : **osc-fr1** (« Paris - Outscale »). Projet : celui proposé. Ne cochez pas « Health data hosting ». **Create app**.
3. **Deployment method** ▲ : **n'installez rien aujourd'hui**. Passez cet écran si vous le pouvez. S'il impose un dépôt et une branche : `main` ne doit jamais être choisie, et `mise-en-ligne` n'existe pas encore ; arrêtez-vous et écrivez-nous.

Votre serveur aura pour adresse `https://elenchos.osc-fr1.scalingo.io` (avec le nom choisi).

### 3.5 La base de données (10 min ; gratuite pendant l'essai, puis dans les 26 €)
1. Dans l'application, onglet **Resources**, bloc **Addons**, **Add an addon**.
2. **PostgreSQL**, **Go to plan selection**, le plus petit plan (« Starter 512M » ▲ ; l'essai n'autorise que lui). **Finish**.
3. Dans le tableau de bord de la base : **Settings** › **Internet Access**, bloc **Force TLS connections**, **Enable** (la connexion à la base est toujours chiffrée).

Laissez les sauvegardes programmées comme elles sont : elles protègent le jeu. **Ne faites jamais de sauvegarde manuelle** : elle survivrait un mois à l'effacement de la base. L'addon PostgreSQL apparaît dans **Resources**.

### 3.6 Deux réglages de l'application (3 min, 0 €)
1. **Settings** › **Public Routing**, bloc **Force HTTPS** : activez.
2. N'activez pas les **journaux du routeur** (désactivés par défaut) : ils noteraient chaque visite, gardée un an. Ne changez pas non plus le nombre ni la taille des conteneurs : le montant de 26 € suppose un seul conteneur, de taille par défaut ▲.

### 3.7 Les réglages (15 min, 0 €)
Onglet **Environment** de l'application. Ajoutez ces lignes, une par une (le nom avant le « = », la valeur après) ou en bloc ▲. Tant que rien n'est installé, l'heure n'a pas d'importance.

**Pas secrets** (remplacez `elenchos` si vous avez pris un autre nom) :
```
ADRESSE_PUBLIQUE=https://elenchos.osc-fr1.scalingo.io
PROJECT_DIR=jeu
APPLE_ID_APPLICATION=io.github.ppcrepin.elenchos
FABRICATION_MINIMALE=0
FIN_DU_TEST=2027-03-31
COMPTE_PORTEUR=…votre pseudo
```
- `FIN_DU_TEST` est provisoire (proposé) : l'équipe vous donnera la vraie date avant l'arrivée de vos amis.
- `COMPTE_PORTEUR` : votre pseudo dans le jeu (1 à 24 signes ; ni @, ni /, ni « : », ni < ou > ; pas d'espace au début ni à la fin). Il ouvre votre compte à votre première connexion, sans le défi d'entrée qui n'existe pas encore ; vous le retirerez juste après (5.4). Ce réglage a été décidé par l'équipe (D-068), pas par vous, et vous pouvez le refuser : votre compte et les trois soirs passent alors à l'étape 4.

**Apple** (tirés de votre gestionnaire, partie 1) :
```
APPLE_ID_EQUIPE=…le Team ID (1.6)
APPLE_ID_CLE_MESSAGES=…le Key ID de la clé des messages (1.4)
APPLE_CLE_MESSAGES=…le contenu du fichier de 1.4, sur une seule ligne
APPLE_ID_CLE_CONNEXION=…le Key ID de la clé de connexion (1.5)
APPLE_CLE_CONNEXION=…le contenu du fichier de 1.5, sur une seule ligne
```
**Mettre un fichier .p8 sur une seule ligne** (Scalingo gère mal les valeurs sur plusieurs lignes) : ouvrez le fichier avec TextEdit ou le Bloc-notes ; cliquez au tout début de la deuxième ligne et appuyez une fois sur la touche d'effacement : elle remonte au bout de la première. Recommencez jusqu'à ce que tout tienne sur une ligne (cinq fois environ), sans rien retirer d'autre. **Tout sélectionner**, copiez, collez comme valeur. Fermez **sans enregistrer**. Après le premier soir réussi (5.5), supprimez les deux fichiers des Téléchargements : leur copie reste dans votre gestionnaire.

**Les trois clés du serveur** (`SECRET_SESSION`, `CLE_REPONSES`, `CLE_IDENTITES`) : ne les ajoutez pas maintenant. Elles viennent juste après la mise en ligne (5.2) : tant qu'elles manquent toutes les trois, le serveur ne fait rien d'autre que servir une page qui les crée au hasard dans votre navigateur.

N'ajoutez rien d'autre. Ne touchez pas à `SCALINGO_POSTGRESQL_URL`, posé par Scalingo avec la base, et ne la copiez nulle part. Les réglages de Google viendront à l'étape 2.

---

## 4. Ce que vous nous écrivez (2 minutes)

Aucun de ces messages ne contient de secret.

**À la fin de la partie 3**, dans la conversation :
> Application Scalingo : elenchos. Fin de l'essai Scalingo : [date]. Renouvellement Apple : [date], automatique [oui/non].

L'équipe en tire l'adresse du serveur, que l'application doit connaître, et vous préviendra une semaine avant chacune des deux dates.

**La veille de la mise en ligne**, quand l'équipe vous dit que tout est relu (D-054) :
> Feu vert : mise en ligne demain, [jour et date], le matin.

Un jour de semaine, pas un dimanche. **Le lendemain matin, écrivez « allez-y »** : sans conversation ouverte, rien ne part. Chaque nouvelle version, y compris un correctif après un échec, demande un nouveau feu vert la veille (D-054).

---

## 5. La mise en ligne, puis les trois soirs

### 5.1 Brancher la branche (le jour J, 15 min, 0 €)
Dès que l'équipe vous écrit qu'elle a poussé le code sur `mise-en-ligne` :
1. Application `elenchos`, onglet **Deploy** › **Configuration** : dépôt `ppcrepin/elenchos`, branche **`mise-en-ligne`**, **Automatic deployments** activé. Si un réglage « Review apps » (ou « Deploy review apps ») est proposé ▲, laissez-le **désactivé** : il créerait d'autres applications, facturées, à partir de code que personne n'a relu.
2. Si rien ne démarre dans les dix minutes, écrivez-le-nous d'abord. Ensuite seulement : **Manual deployment**, branche `mise-en-ligne`.
3. Attendez la fin (quelques minutes). Si l'installation échoue, copiez-nous son message d'erreur, rien d'autre. De 15h à 19h et le dimanche, elle devrait échouer exprès ▲ (« Horaires : aucune installation de 15h à 19h ni le dimanche ») : c'est voulu.

Enchaînez aussitôt avec 5.2.

### 5.2 Les trois clés du serveur (juste après 5.1, 10 min, 0 €)
Le serveur vient de démarrer sans ses trois clés : il ne fait rien d'autre que servir une page qui les crée au hasard **dans votre navigateur**. Elle n'envoie rien, ni à nous ni ailleurs, et ne garde rien. Faites ceci le matin, avant 13h : le redémarrage du geste 5 compte comme une mise en ligne (règle 3), et l'équipe lance ensuite la fabrication de l'application, qui doit partir avant 14h.
1. Sur votre ordinateur, ouvrez `https://elenchos.osc-fr1.scalingo.io/preparer` (avec le nom choisi en 3.4). La page « Préparer le serveur » s'affiche.
2. Touchez **Créer les trois clés**, puis **Copier les trois lignes**.
3. Collez-les dans une nouvelle fiche de votre gestionnaire de mots de passe, « Elenchos serveur ».
4. Chez Scalingo, onglet **Environment** : ajoutez les trois lignes, en bloc ou une par une (le nom avant le « = », la valeur après) ▲. Enregistrez.
5. Redémarrez l'application : bouton **Restart** de l'application ▲. Le serveur ne lit ses réglages qu'en démarrant : enregistrer ne suffit pas (la documentation de Scalingo demande ce redémarrage après l'ajout d'un réglage). Si Scalingo vous propose lui-même de redémarrer, acceptez : cela revient au même.
6. Deux minutes plus tard, chez Scalingo, onglet **Logs** de l'application ▲ : la dernière ligne qui contient « demarrage » doit contenir **« pret »**. C'est le signe que le serveur a démarré avec ses clés. Une ligne « reglages incomplets » qui ne nomme que `GOOGLE_ID_CLIENT` et `GOOGLE_SECRET_CLIENT` est normale à cette étape. Allez à la partie 6 si la ligne « demarrage » dit « reglages incomplets » ou « pas de base », si une ligne dit « cles changees », ou si rien ne vient au bout de dix minutes ; et ne créez pas d'autres clés. Rechargée, la page « Préparer le serveur » ne doit plus s'afficher ; mais une page vide ou d'erreur ne prouve rien à elle seule.

Ne rechargez pas la page avant d'avoir tout collé : elle créerait d'autres clés.

> **`CLE_REPONSES` et `CLE_IDENTITES` ne changent jamais pendant le test.** Sans elles, les réponses deviennent illisibles et les comptes introuvables. Gardez-en la copie. Si un jour la page « Préparer le serveur » s'affiche de nouveau, ne créez pas de nouvelles clés : écrivez-nous. Le serveur s'en protège aussi : il retient une empreinte de ces deux clés à son premier démarrage (une empreinte ne permet pas de retrouver la clé), et refuse de démarrer avec d'autres. Rien n'est alors perdu : il suffit de remettre les clés de votre fiche (partie 6).

L'équipe fabrique ensuite l'application ; vous n'avez rien à faire. Elle vous écrit quand Apple l'a traitée (comptez une à deux heures).

### 5.3 Elenchos sur votre iPhone (15 min, 0 €)
1. App Store : installez **TestFlight**, l'application gratuite d'Apple (vous pouvez le faire avant).
2. Un e-mail d'Apple arrive à l'adresse de votre compte Apple. Ouvrez-le sur l'iPhone : **View in TestFlight**, puis **Accepter** et **Installer** ▲. Il se peut aussi qu'Elenchos apparaisse directement dans TestFlight ▲ : touchez **Installer**.
3. Ouvrez Elenchos : **Se connecter avec Apple**, confirmez (Face ID ou code). L'écran dit « La connexion a marché ».
4. Touchez **Recevoir le message de 18h**, puis **Autoriser** dans la fenêtre de l'iPhone. L'écran dit « C'est fait. À 18h. »

### 5.4 Retirer `COMPTE_PORTEUR` (2 min, 0 €)
Chez Scalingo, onglet **Environment**, supprimez la ligne `COMPTE_PORTEUR` ▲. Inutile de redémarrer : votre compte existe, ce réglage n'a déjà plus d'effet, et il quittera le serveur au prochain redémarrage. Faites-le quand même aux heures permises (avant 15h, ou après 19h, jamais un dimanche), au cas où Scalingo redémarrerait de lui-même.

### 5.5 Les trois soirs (2 minutes vers 18h05, 0 €)
Pendant trois soirs de suite, à partir du jour J si vous avez fini 5.3 avant 18h :
1. Vers 18h05, regardez l'écran verrouillé, ou le centre de notifications (glissez depuis le haut de l'écran). Le message attendu : **« Elenchos — 18h. La question d'aujourd'hui t'attend. »** L'application n'a pas encore de question à montrer : c'est normal à cette étape.
2. L'iPhone indique quand il est arrivé (« il y a 5 min », ou l'heure) ▲.
3. Écrivez une ligne dans la conversation, par exemple :
   > Soir 1 : arrivé à 18h00.
   >
   > Soir 2 : rien à 18h05, iPhone allumé, avec du réseau.

Si une Concentration (Ne pas déranger, Sommeil…) ou un Résumé programmé était actif vers 18h, ajoutez-le à la ligne : ils peuvent retenir l'affichage. Un soir où l'iPhone était éteint ne compte pas : on en ajoute un.

Après le troisième soir, l'équipe vous fait le point d'étape.

---

## 6. En cas de souci

**D'abord, rien d'urgent.** Arrêtez-vous là où vous êtes et écrivez-nous dans cette conversation, en une ligne : le numéro du geste (par exemple « 3.4 ») et les mots exacts de l'écran, sans secret. Une capture d'écran est bienvenue si elle ne montre aucun secret.

| Ce qui arrive | Ce que vous faites |
|---|---|
| Apple refuse l'accès, ou ne répond pas au bout d'une semaine (1.9) | Écrivez-le-nous : l'équipe passe à la signature à la main et vous écrit les gestes (encadré de 1.9). |
| Le nom est pris chez Apple (1.8) ou chez Scalingo (3.4) | Prenez le nom proposé à côté, et dites-nous celui de Scalingo (partie 4). |
| L'installation échoue chez Scalingo (5.1) | Copiez-nous son message d'erreur, rien d'autre. |
| La page « Préparer le serveur » ne s'affiche pas, ou le navigateur tourne sans fin (5.2, geste 1) | N'ajoutez aucun réglage. Écrivez-nous les mots exacts de l'écran et l'état de l'application dans le tableau de bord de Scalingo ▲. |
| Le serveur ne démarre pas (Scalingo le signale, ou Elenchos dit « Elenchos ne répond pas pour l'instant ») | Onglet **Logs** de l'application : sur la ligne qui contient « reglages incomplets », copiez-nous seulement les noms en majuscules. Les noms qui commencent par `GOOGLE_` y figurent toujours à cette étape : c'est normal. L'équipe peut vous demander d'ajouter une ligne, par exemple `MODE_ROLES=repli` : ce n'est pas un secret. |
| Le serveur ne démarre pas, et l'onglet **Logs** montre une ligne qui contient « cles changees » | Une des clés du serveur n'est plus celle du premier démarrage : le serveur refuse de démarrer pour ne rien perdre. Ne créez pas de nouvelles clés. Onglet **Environment**, remettez les trois lignes de votre fiche « Elenchos serveur », puis redémarrez (5.2, geste 5), aux heures permises. Écrivez-nous le nom en majuscules qui suit « manquants » sur cette ligne, sans aucune valeur. |
| Elenchos dit « Aucun compte Elenchos n'est lié à ce compte Apple » (5.3) | `COMPTE_PORTEUR` manque ou est mal écrit. Écrivez-le-nous ; ne réessayez pas en boucle. |
| Pas de message à 18h05 (5.5) | Vérifiez : iPhone allumé, réseau, **Réglages › Notifications › Elenchos** autorisé. Regardez si l'application est en marche dans le tableau de bord de Scalingo ▲. Envoyez votre ligne du soir. **Ne redémarrez rien** : il est entre 15h et 19h. Le soir manqué est ajouté. |
| Une clé ou un fichier .p8 est perdu | Pas grave : on révoque la clé (même page que sa création, **Revoke**), on en crée une autre, gratuitement, et vous la ressaisissez là où vivait l'ancienne (GitHub ou Scalingo). |
| Une clé a été montrée (envoyée, capturée, collée au mauvais endroit) | Même chose, tout de suite. Écrivez-nous « une clé a été exposée », sans sa valeur. |
| Un e-mail « Apple », « GitHub » ou « Scalingo » vous demande d'agir | Ne cliquez pas. Ouvrez le site à la main. |

À cette étape seulement, nous vous demandons parfois un extrait du journal du serveur (onglet **Logs**) : aucun joueur n'existe encore, et le journal ne contient que des mots d'une liste fermée. Avec de vrais joueurs, aucun extrait de journal ne nous sera demandé (D-052, point 3).

**Ce que vous ne faites jamais :**
- nous envoyer une clé, un mot de passe, un code, le contenu d'un fichier .p8, ni une capture de l'onglet **Environment** de Scalingo, des secrets de GitHub ou d'un fichier .p8 ouvert ;
- toucher **Stop free trial** chez Scalingo ;
- faire une sauvegarde manuelle de la base ;
- choisir la branche `main` chez Scalingo ;
- changer `CLE_REPONSES` ou `CLE_IDENTITES` ;
- changer un réglage ou redémarrer le serveur de 15h à 19h ou le dimanche ;
- sans nous en parler : rendre le dépôt GitHub privé (la fabrication deviendrait payante), supprimer l'application ou la base chez Scalingo (le jeu perdrait ses données).

---

## Ce qui n'est pas encore sûr

- **L'installation chez Scalingo** : qu'elle refuse bien de partir de 15h à 19h et le dimanche (repris du test de 18h, non revérifié).
- **Ce qui est déjà prouvé** : la fabrication pour le simulateur, sans signature, a réussi sur GitHub le 16 octobre 2026 (« App - simulateur », exécution n° 1) : le Swift compile et l'application s'ouvre. Ce qui reste à prouver, c'est la signature et l'envoi à Apple.
- **Chez Apple** : l'accord pour la clé de fabrication (1.9) ; le rôle **Admin** de cette clé, nécessaire d'après des développeurs, pas d'après Apple ; la fabrication sans Mac du premier coup.
- **Les écrans marqués ▲.**
- **Le redémarrage chez Scalingo** (règle 3, 5.2) : sa documentation dit que les réglages sont donnés au serveur quand il démarre, et demande de redémarrer l'application après l'ajout d'un réglage (pages « Environment Variables », mise à jour le 20 mars 2026, et « Access Your Database », le 9 février 2026, relues le 16 octobre 2026). Elle ne dit pas si son tableau de bord propose ou fait lui-même ce redémarrage. D'où le redémarrage à la main, sans risque s'il était déjà fait.
- **Le serveur, page des trois clés comprise (5.2), n'a encore jamais tourné chez Scalingo, ni écrit au vrai service d'Apple** : il a passé ses tests sur les machines de l'équipe. C'est précisément ce que les trois soirs vérifient.
