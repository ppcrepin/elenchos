# La construction de la version de test

*14 octobre 2026. Application de D-056 à D-059 : on construit le jeu d'abord, puis on teste le message de 18h. Ce document assemble trois plans : celui de Back-end (le serveur et les données), celui de Front-end (l'interface) et celui de Contenu (les textes). Les deux premiers sont conservés en entier à côté de ce document : `plan-version-test-backend.md` et `plan-version-test-frontend.md`. Ce document ne décide rien : trois choix vous reviennent, à la fin. Il a été relu par Cohérence (compatible avec réserves) et par le Vérificateur (OK avec corrections) ; leurs corrections sont appliquées.*

*Pour ne pas confondre : ce document ne concerne que la **version de test** (D-056). Les « 3 à 6 mois » de D-046 visaient le jeu complet. La version de test était estimée à 4 à 8 semaines par D-057 ; les spécialistes donnent ici 4 à 7 semaines.*

## En bref

- **Durée : environ 4 à 7 semaines de calendrier avant les premiers joueurs du test.** Back-end et Front-end arrivent chacun à cette estimation. Elle compte vos points d'étape, vos feux verts de la veille et trois soirs de test du message. Leur confiance est moyenne à basse : c'est le premier code avec un vrai serveur, de vraies connexions et un vrai iPhone. Ce n'est ni un engagement ni une date de sortie. En ordre de grandeur, cela place les premiers joueurs entre mi-novembre et début décembre.
- **Coût** :
  - 0 € tant que tout se construit sur nos machines ;
  - chez Scalingo, l'essai est gratuit 30 jours, puis coûte environ 26 € TTC par mois ;
  - le domaine coûte environ 6 € la première année (relevé du 13 octobre ; D-057 disait environ 10 €) ;
  - les e-mails, 0 € ;
  - le compte développeur Apple est déjà payé (D-047).

  **Au total, pour la construction et un test d'environ cinq semaines** (durée proposée, D-058) : de l'ordre de 60 à 90 €, selon le choix 1. C'est un calcul de l'orchestrateur et du Vérificateur.
- **On reprend beaucoup de ce qui existe.**
  - Du test de 18h : la moitié de ses briques, dont la sécurité, l'envoi du message et la garde des horaires. Ce code ne représente qu'environ un dixième du serveur du jeu (estimation de Back-end).
  - Du second essai : les écrans, leurs mots et le moteur de règles, adaptés au contenu de D-058.
- **Le message de 18h et les vraies connexions (Apple, Google, e-mail) ne s'essaient qu'à la fin** (D-059). Le choix 1 ne change que le moment où vous voyez et touchez le jeu sur votre iPhone.

## 1. Comment c'est construit, en mots simples

**Le serveur**
- Il reprend les briques du test de 18h :
  - la connexion Apple et Google ;
  - l'envoi chiffré du message ;
  - les protections des cookies et des adresses web ;
  - la garde qui refuse toute installation de 15h à 19h et le dimanche ;
  - le contrôle automatique du code.
- On y ajoute le moteur de règles du second essai, réécrit et réduit au contenu de D-058, et une base d'une douzaine de tables.

**Le cloisonnement des cercles est imposé par la base elle-même** : une demande qui oublierait de dire qui la fait ne reçoit rien. Il reste à confirmer, en phase 1, que Scalingo permet plusieurs rôles dans la base. Sinon, un repli existe, un peu moins protecteur.

**Les réponses sont chiffrées** (proposé par Back-end, environ un jour de travail). Le chiffrement protège une sauvegarde volée. Vous pouvez demander à le retirer. Si la clé est perdue, les réponses le sont aussi : vous en garderez une copie hors ligne.

**L'adresse e-mail n'est pas gardée pendant le test**, même chiffrée : il n'en reste qu'une empreinte. C'est plus strict que ce que prévoit `donnees.md` (P-01, P-02). À la mise à niveau, il faudra la garder, pour prévenir un compte inactif 30 jours avant son effacement (D-045).

**L'effacement est réel.** Il est vérifié par une recherche après coup. Les sauvegardes de Scalingo disparaissent, elles, en quatre semaines environ.

**L'interface** ne demande au téléphone qu'un navigateur : pas d'outil de fabrication ni de bibliothèque extérieure, comme le test de 18h. Un humain peut la reprendre (D-043). Elle ne calcule aucune règle : le serveur lui envoie tout, déjà prêt.

**Rien de lourd ne se calcule à 18h pile** (D-043).
- Chaque carte est jugée au moment où le joueur la pose. Le verdict reste caché jusqu'à 18h.
- L'avis du cercle est préparé la veille.
- Après 18h, il ne reste que de petits calculs, faits une seule fois à la première ouverture : le tirage des cartes du jour, et le départage du dimanche.
- À 18h même, le serveur ne fait que montrer ce qui était prêt et envoyer le message.

**Le plus gros inconnu : se reconnecter dans l'icône.** Sur iPhone, l'icône a sa propre mémoire, séparée de Safari. Front-end prévoit ceci : juste avant le guide d'ajout, la page prend une adresse qui porte un code à usage unique. L'icône s'ouvre sur cette adresse, et le serveur échange le code contre une connexion. C'est une hypothèse de Front-end. Elle sera vérifiée sur votre iPhone, et relue par Juridique et Back-end, car un code dans une adresse peut se retrouver dans les journaux de l'hébergeur. Si elle échoue :
1. un écran « Encore un geste » demande de se reconnecter une fois ;
2. sinon, la question de TestFlight, l'outil d'Apple pour distribuer une application de test, reviendra (D-035).

**Les textes.** Contenu écrit et vérifie les 34 textes (proposé, D-058) en session, comme aux essais. Il respecte l'équilibre entre textes adoptés et rejetés (D-028) et les huit tensions. Un test vérifie la forme du fichier. Le serveur importe ce fichier ; aucun agent ne touche la base (D-048). **Limite** : le dépôt est public, donc les textes à venir y sont lisibles. L'enjeu est faible ; un fichier chiffré reste possible, pour une demi-journée de travail.

## 2. Les phases

*« Jour » : une journée de session d'agents, relectures comprises. Les durées sont des estimations.*

| Phase | Ce qui est construit | Comment on le prouve | Vous | Durée |
|---|---|---|---|---|
| 0 | Le contrat entre le serveur et l'interface ; le format des textes, avec Contenu. Juridique relit la carte de consentement, « Qui, durée, droits » et le code à usage unique ; UX écrit les textes manquants (bandeau hors réseau, page de refus Android) | Exemples de réponses, relecture | Rien | 1 à 1,5 j |
| 1 | En parallèle : le socle du serveur, les textes et l'horloge, le moteur de règles (relu par Game design) ; tous les écrans, sur des données d'exemple | Un joueur d'un cercle ne reçoit rien d'un autre ; les journées chiffrées de `regles.md` sont rejouées ; chaque écran est testé en taille iPhone (clair, sombre, soir), sans débordement | Une planche de captures des écrans, à relire | 4 à 6 j |
| T | Les 34 textes, écrits et vérifiés par Contenu | Voir la note sous le tableau | Ne pas les lire si vous jouez | Voir la note, en parallèle des phases 1 à 4 |
| 2 | Les comptes et l'entrée : la carte de consentement, le défi, le compte (Apple, Google, e-mail, avec de faux services), le cercle, l'invitation, « Tout effacer » | Quatre joueurs simulés jouent l'entrée de bout en bout ; plus rien ne reste après un effacement | Selon le choix 1 : jouer l'entrée sur votre iPhone | 4 à 6 j |
| 3 | La journée : Deviner, Répondre, la révélation, les titres du dimanche, la barre | Une semaine jouée en une heure, horloge accélérée ; calculs relancés sans écart | Selon le choix 1 : jouer une semaine en accéléré | 3 à 5 j |
| 4 | Le message de 18h, l'icône et son guide, le code à usage unique, les mesures, le ménage | Envoi unique ; mesures sans aucun contenu ; rien ne se fait entre 17h30 et 18h30 | Vous approuvez la forme du rapport de totaux ; selon le choix 1, vous ajoutez l'icône | 2 à 3 j |
| 5 | Les contrôles : vitesse, texte agrandi, lecture vocale, passe sur le moteur de Safari | Un rapport d'une ligne | Rien | en parallèle |
| 6 | La mise en ligne, puis vos essais sur votre iPhone et le test du message de 18h | Message avant 18h05 trois soirs ; connexion tenue depuis l'icône | Choix 2 et 3 ; vous ouvrez les comptes (environ 3 h, avec un pas-à-pas) et notez la date de fin d'essai de Scalingo (D-055) ; feu vert ; trois soirs | 1 à 2 j, plus 3 soirs |
| 7 | Les retouches après vos essais, la vérification finale, la base vidée puis recréée, l'arrivée des premiers joueurs | Passe complète, Cohérence, Vérificateur | Feu vert ; vous saisissez la date du premier jour ; vous envoyez le message aux premiers créateurs | 3 à 5 j |

**Note sur les textes (Contenu)** : [estimation de Contenu, à compléter].

**La relecture du code.** Chaque phase se termine par une relecture :
- par Cohérence, contre les décisions et `donnees.md` ;
- puis par le Vérificateur, sur un autre modèle, avant d'aller sur `main`.

Seuls des modèles relisent ce code, qui garde des opinions (D-043). Rien ne part sur la branche `mise-en-ligne` sans votre feu vert écrit, donné la veille (D-054).

**Ce qui peut faire glisser** :
- la reconnexion dans l'icône, si elle échoue : 2 à 5 jours de plus, ou la question de TestFlight (D-035) ;
- les règles fines (jumeaux, départs, égalités), sources classiques d'erreurs ;
- les limites d'utilisation des sessions ;
- l'attente de vos décisions.

## 3. Ce que l'équipe simplifie ou précise pour le test

**Allègements** : ils reviennent à la mise à niveau (D-056).
- **La révélation rouverte** reprend au début si l'application a été fermée, au lieu de reprendre là où on l'avait laissée (règle E3, D-030 ; Front-end).
- **Les sauvegardes** : pas de copie chez un second hébergeur. Celles de Scalingo suffisent pour le test (proposé par Back-end ; exigence P-13 de `donnees.md`).
- **Une seule application chez Scalingo**, remplie de données inventées pour l'aperçu. On supprime et on recrée la base avant le premier vrai joueur. Il n'y a pas de version d'aperçu permanente (proposé par Back-end ; P-19 et P-20).
- **« Tout effacer »** coupe le lien avec Apple ou Google de notre côté seulement. Le joueur peut retirer Elenchos de ses réglages Apple ou Google ; l'écran le lui dira (D-035, P-38 ; Back-end).

**Précisions** : ce ne sont pas des allègements.
- **Le code reçu par e-mail** vaut 15 minutes (proposé par Back-end ; UX avait écrit 10, « à fixer par Back-end »).
- **L'écran « Tout effacer »** dira que les sauvegardes disparaissent en quatre semaines environ.
- **L'écran « Qui, durée, droits »** dira qu'on ne garde qu'une empreinte de l'adresse e-mail, et que le service d'envoi de Scaleway voit l'adresse et le code.

## 4. Ce que les plans ne disent pas pareil

**1. Quand vous jouez sur votre iPhone.**
- **Front-end** propose une version d'aperçu chez Scalingo dès la phase 2. Vous y entreriez avec un code d'essai, et vous joueriez l'entrée puis la journée sur votre iPhone avant la fin.
- **Back-end** construit tout sur nos machines jusqu'à la phase 6, pour n'ouvrir l'essai de Scalingo qu'à ce moment-là. Il y voyait un retour sur l'ordre choisi par D-059.

**Lecture de l'orchestrateur** : D-059 porte sur le test du message de 18h. Un aperçu sans message ne la modifie pas, puisque le message y reste inactif. C'est le choix 1.

**2. Les trois réponses d'entrée de l'invité.**
- **Front-end** les garderait dans le téléphone jusqu'à la création du compte : la base ne garde rien d'un invité qui s'arrête en route.
- **Back-end** enregistre un joueur provisoire dès l'accord, effacé après 7 jours.

L'équipe tranche en phase 0, avec Juridique : ce n'est pas un choix pour vous.

## 5. Limites

- **Aucun vrai iPhone dans nos tests.** Le moteur de Safari qu'on fait tourner sur un ordinateur n'est pas Safari sur iPhone. Seul votre iPhone le dira, et les autres versions d'iOS seulement avec les joueurs.
- **Personne ne surveille le soir à votre place.** Vous êtes seul, sans alerte (D-057) : vous vérifiez vous-même chaque soir que le message est parti.
- **Avec 15 à 30 joueurs**, beaucoup de totaux du rapport seront « — », sous les seuils.
- **Le critère de l'icône.** Si moins de deux iPhone sur trois installent l'icône, c'est le critère de D-005, et TestFlight revient (D-057, point 1).
- **Trois points ne sont connus que de mémoire** (Back-end), à vérifier :
  - les rôles dans la base de Scalingo ;
  - ce qu'exige Scaleway (un domaine, et probablement une carte) ;
  - si Apple et Google acceptent l'adresse gratuite de Scalingo pour la connexion.
- **À observer avec de vraies personnes** :
  - le guide d'ajout de l'icône est-il suivi sans aide ?
  - la reconnexion dans l'icône tient-elle ?
  - le lien ouvert depuis une messagerie fonctionne-t-il ?
  - « Tout effacer » est-il compris malgré le délai des sauvegardes ?
  - le message de 18h arrive-t-il sur des iPhone plus anciens que le vôtre ?

## Les trois choix

1. **Quand jouer sur votre iPhone**
   - **Dès la phase 2 (Recommandé : Vérificateur, Front-end).** Vous voyez tôt le plus gros inconnu, la reconnexion dans l'icône, et vous corrigez tôt. L'essai de Scalingo démarre plus tôt : il en coûte entre 0 et environ 50 € de plus, selon la durée réelle. Vous y jouez avec des réponses inventées, que l'équipe peut voir, et sans lire les textes du test. L'icône installée sera à refaire à l'arrivée du domaine, sauf si le domaine est acheté à ce moment (choix 2).
   - **À la phase 6 (Back-end).** Rien n'est payé avant, mais vous ne voyez que des captures jusque-là. Si la reconnexion dans l'icône échoue, on ne l'apprend qu'à la fin : 2 à 5 jours de plus, ou TestFlight.
2. **Le domaine elenchos.fr** (D-057, point 2, reposé comme prévu par D-059)
   - **L'acheter à l'ouverture de Scalingo, en phase 2 ou 6 selon le choix 1 (Recommandé : Back-end, Vérificateur).** Environ 6 € la première année ; son nom et son prix vous sont présentés avant l'achat (D-042). L'e-mail fonctionne (un compte Scaleway à ouvrir, une carte probablement demandée). L'icône, le message et les réglages Apple et Google sont installés une fois pour toutes.
   - **D'abord l'adresse gratuite, puis le domaine juste avant les premiers joueurs.** Vous réinstallez votre icône une fois, et le test de 18h est refait en partie. Apple ou Google peuvent refuser l'adresse gratuite ; on vous redemanderait alors (D-054, point 2).
   - **Pas de domaine pendant le test.** 0 €, et Apple suffit techniquement, puisque tout iPhone a un compte Apple. Mais la connexion par e-mail est retirée, ce qui modifie D-057, points 2 et 3. Tous les joueurs réinstalleront l'icône à la mise à niveau, et Apple ou Google peuvent refuser l'adresse gratuite.
3. **Le test du message de 18h**
   - **Sur le jeu lui-même, en phase 6 (Recommandé : Back-end, Vérificateur).** Une seule installation, et on teste le vrai message. Cela modifie D-054, point 1 (le test sur une page nue), devenu sans objet depuis que le jeu se construit d'abord (D-059). Le sous-domaine `test18h` et le seuil de 15 € (D-059, proposés) tombent aussi.
   - **Avec la page nue d'abord.** Le test reste isolé, et son pas-à-pas est prêt. Mais l'essai de Scalingo n'autorise qu'une application (vérifié, pas-à-pas du test de 18h) : il faudra la supprimer avant le jeu et refaire les réglages Apple et Google. Cette option est incompatible avec un aperçu dès la phase 2.
