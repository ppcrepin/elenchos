# Le plan de construction de la version de test

*14 octobre 2026. Application de D-056 à D-059 : on construit le jeu d'abord, puis on teste le message de 18h. Ce plan assemble les plans de Back-end (le serveur et les données) et de Front-end (l'interface). Leurs plans complets restent dans les fichiers de travail de l'équipe. Ce document ne décide rien : trois choix vous reviennent, à la fin. État : en relecture (Cohérence, puis Vérificateur).*

## En bref

- **Durée : environ 4 à 7 semaines de calendrier** avant les premiers joueurs. Back-end et Front-end arrivent chacun à cette estimation, en comptant vos points d'étape, vos feux verts de la veille et trois soirs de test. Leur confiance est moyenne à basse : c'est le premier code avec un vrai serveur, de vraies connexions et un vrai iPhone. Ce n'est ni un engagement ni une date de sortie.
- **Coût : 0 € tant que tout se construit sur nos machines.** Ensuite, environ 26 € TTC par mois chez Scalingo, après les 30 jours d'essai, et environ 6 € pour le domaine la première année. Les e-mails coûtent 0 €. C'est dans la fourchette de D-057.
- **On reprend beaucoup.**
  - Du test de 18h : la moitié du serveur, dont la sécurité, l'envoi du message et la garde des horaires.
  - Du second essai : les écrans, leurs mots et le moteur de règles. Ils sont adaptés au périmètre de D-058.
- **Le plus gros inconnu reste l'iPhone** : la reconnexion dans l'icône et le message de 18h. On ne le saura qu'en l'essayant sur votre téléphone. Selon le choix 1, ce sera à mi-chemin ou à la fin.

## 1. Comment c'est construit, en mots simples

- **Le serveur** reprend les briques du test de 18h :
  - la connexion Apple et Google ;
  - l'envoi chiffré du message ;
  - les protections des cookies et des adresses ;
  - la garde qui refuse toute installation de 15h à 19h et le dimanche ;
  - le contrôle automatique du code.
- **On y ajoute** :
  - le moteur de règles du second essai, réécrit et réduit au périmètre de D-058 ;
  - une base d'une douzaine de tables.
- **Le cloisonnement des cercles est imposé par la base elle-même** : une demande qui oublierait de dire qui la fait ne reçoit rien. Les réponses sont chiffrées.
- **L'adresse e-mail n'est jamais gardée**, même chiffrée : il n'en reste qu'une empreinte. L'effacement est réel, et il est vérifié par une recherche après coup.
- **L'interface** ne demande rien d'autre au téléphone qu'un navigateur : pas d'outil de fabrication ni de bibliothèque extérieure, comme le test de 18h. Un humain peut la relire sans outil (D-043). Elle ne calcule aucune règle : le serveur lui envoie tout, déjà prêt.
- **Rien ne se calcule à 18h pile** (D-043). Chaque carte est jugée au moment où le joueur la pose. L'avis du cercle est préparé la veille. À 18h, le serveur ne fait que montrer ce qui était prêt et envoyer le message.
- **Les textes** : Contenu écrit les 34 textes en session, dans un fichier du dépôt. Un test vérifie leur forme : deux raisons de chaque côté, un vote daté, les textes d'entrée. Le serveur les importe ; aucun agent ne touche la base (D-048). **Limite** : le dépôt est public, donc les textes à venir y sont lisibles. L'enjeu est faible, mais un fichier chiffré reste possible (une demi-journée).

## 2. Les étapes

*« Jour » : une journée de session d'agents, relectures comprises. Les durées sont des estimations.*

| # | Ce qui est construit | Comment on le prouve | Vous | Durée |
|---|---|---|---|---|
| 0 | Le contrat entre le serveur et l'interface ; le format des textes, avec Contenu | Exemples de réponses, relecture | Rien | 1 à 1,5 j |
| 1 | En parallèle : le socle du serveur, les textes et l'horloge, le moteur de règles ; et tous les écrans, sur des données d'exemple | Un joueur d'un cercle ne reçoit rien d'un autre ; les journées chiffrées de `regles.md` rejouées ; chaque écran testé en taille iPhone (clair, sombre, soir, texte agrandi), sans débordement | Une planche de captures des écrans, à relire | 5 à 9 j |
| 2 | Les comptes et l'entrée : la carte de consentement, le défi, le compte (Apple, Google, e-mail, avec de faux services), le cercle, l'invitation, « Tout effacer » | Quatre joueurs simulés jouent l'entrée de bout en bout ; plus rien ne reste après un effacement | **Choix 1** : peut-être jouer l'entrée sur votre iPhone | 4 à 6 j |
| 3 | La journée : Deviner, Répondre, la révélation, les titres du dimanche, la barre | Une semaine jouée en une heure, horloge accélérée ; calculs relancés sans écart | Idem | 3 à 5 j |
| 4 | Le message de 18h, l'icône et son guide, les mesures, le ménage | Envoi unique ; mesures sans aucun contenu ; rien ne se fait entre 17h30 et 18h30 | Vous approuvez la forme du rapport de totaux | 2 à 3 j |
| 5 | Les contrôles : vitesse, lecture vocale, passe sur le moteur de Safari | Un rapport d'une ligne | Rien | en parallèle |
| 6 | La mise en ligne sur votre iPhone, puis le test de 18h | Message avant 18h05 trois soirs ; connexion tenue depuis l'icône | **Choix 2 et 3** ; ouverture des comptes (environ 3 h, avec pas-à-pas) ; feu vert ; trois soirs | 1 à 2 j + 3 soirs |
| 7 | Retouches après vos essais, vérification finale, base vidée puis recréée, ouverture | Passe complète, Cohérence, Vérificateur | Feu vert ; vous envoyez le message aux premiers créateurs | 3 à 5 j |

**Ce qui peut faire glisser** :
- la reconnexion dans l'icône, si elle échoue : 2 à 5 jours de plus, ou TestFlight revient (D-057, point 1) ;
- les règles fines (jumeaux, départs, égalités), sources classiques d'erreurs ;
- les limites d'utilisation des sessions ;
- l'attente de vos décisions.

## 3. Ce que l'équipe simplifie encore pour le test

Conformément à D-056, chaque point vous est signalé. Ils reviennent tous à la mise à niveau.

- **Révélation rouverte** (E3) : elle reprend au début, et non là où on l'avait laissée (Front-end).
- **Sauvegardes** : pas de copie chez un second hébergeur (P-13) ; celles de Scalingo suffisent pour le test (Back-end).
- **Une seule application chez Scalingo** : on la remplit de données inventées pour l'aperçu, puis on supprime et on recrée la base avant le premier vrai joueur. Il n'y a pas de version d'aperçu permanente (P-19, P-20 ; Back-end).
- **« Tout effacer »** coupe le lien avec Apple ou Google de notre côté seulement. Le joueur peut retirer Elenchos de ses réglages Apple ou Google ; l'écran le lui dira (D-035, P-38 ; Back-end).
- **Le code reçu par e-mail** vaut 15 minutes, et non 10 (N7). L'écran « Tout effacer » dira que les sauvegardes disparaissent en quatre semaines environ (P-33). L'écran « Qui, durée, droits » dira qu'on ne garde qu'une empreinte de l'adresse e-mail (Back-end).

## 4. Ce que les deux plans ne disent pas pareil

**Quand vous jouez sur votre iPhone.**
- **Front-end** voudrait une version d'aperçu chez Scalingo dès l'étape 2. Vous joueriez l'entrée et la journée sur votre iPhone avant la fin, avec une connexion par code d'essai, et vous corrigeriez tôt.
- **Back-end** construit tout sur nos machines jusqu'à l'étape 6, pour n'ouvrir l'essai de 30 jours de Scalingo qu'à ce moment-là. Il note lui-même que le comportement de l'iPhone n'est alors connu qu'à la fin.

C'est le choix 1.

## Choix qui vous reviennent

1. **Quand jouer sur votre iPhone**
   - À l'étape 2 (Front-end) : vous voyez et corrigez tôt. L'essai gratuit de Scalingo démarre alors plus tôt, ce qui fait environ 26 € par mois de plus pendant la construction (la suite vous sera présentée une semaine avant la fin de l'essai, D-055).
   - À l'étape 6 (Back-end) : rien n'est payé avant, mais vous ne voyez que des captures jusque-là.
2. **Le domaine elenchos.fr, reposé comme prévu par D-059**
   - L'acheter au début de l'étape 6 : environ 6 € la première année. L'e-mail fonctionne, et l'icône et le message sont installés une fois pour toutes.
   - D'abord l'adresse gratuite, puis le domaine juste avant les premiers joueurs : vous réinstallez votre icône une fois.
   - Pas de domaine pendant le test : la connexion par e-mail est retirée, ce qui modifie D-057, point 3. Les joueurs réinstalleront l'icône à la mise à niveau.
3. **Le test du message de 18h**
   - Sur le jeu lui-même, à l'étape 6 (Back-end) : une seule installation, et on teste le vrai message.
   - Avec la page nue du test de 18h d'abord : le test reste isolé, mais l'essai de Scalingo n'autorise qu'une application, qu'il faudra supprimer avant le jeu.
