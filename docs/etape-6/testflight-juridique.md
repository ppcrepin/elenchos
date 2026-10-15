*Avis de Juridique, 15 octobre 2026, conservé tel quel (Juridique n'est pas avocat).*

**Réponse de Juridique : TestFlight en compte individuel (brief du 15 octobre 2026)**

Ce qui suit n'est pas un conseil juridique définitif. J'ai lu `juridique.md`, `CLAUDE.md`, les entrées D-042 à D-062 et les textes N5 et N6 de `docs/etape-6/contenu-test.md`. Aucun fichier n'a été modifié.

Comment lire les sources : « vérifié » veut dire lu sur une page Apple le 15 octobre 2026. « Moteur » veut dire relevé par un moteur de recherche, sur des sites qui ne sont pas d'Apple. « Mémoire » veut dire non revérifié.

## 1. Réponse au brief

### 1.1 Testeurs internes : possible techniquement, mais le contrat Apple ne le prévoit pas pour des amis

- **Un compte individuel peut ajouter des personnes (vérifié).** La page « Add and edit users » dit : un compte individuel peut donner accès à App Store Connect à « up to 50 additional users ». Ces personnes n'ont accès qu'à App Store Connect.
- **Chaque testeur interne doit avoir un rôle dans le compte (vérifié, page TestFlight).** Rôles possibles : Account Holder, Admin, App Manager, Developer ou Marketing. On peut avoir jusqu'à 100 testeurs internes, et chaque version reste disponible 90 jours.
- **Pas de relecture par Apple.** Le contrat Apple (article 6.5, vérifié) n'exige une relecture que pour les testeurs « outside of Your company or organization ». Le reste est de mémoire.
- **Le blocage est dans le contrat que le porteur a signé (Program License Agreement, article 7.4(1), vérifié).** Les testeurs internes doivent être des personnes « who are members of Your company or organization ». Ils testent « solely for their internal use ». À mon avis, des amis d'un particulier ne sont pas visés. Apple peut arrêter la distribution « at any time in its sole discretion ».
- **Deux défauts pratiques.** Chaque ami reçoit un accès au compte du porteur. Avec le rôle Marketing, il peut sans doute modifier la fiche de l'application ; le tableau des droits n'a pas pu être lu, c'est donc une hypothèse. Et l'entrée est lourde : invitation App Store Connect, puis TestFlight.
- **Cette voie ne règle rien pour plus tard.** La version publique passera de toute façon par la règle 5.1.1 (ix).

### 1.2 Testeurs externes : la voie prévue pour des amis, mais avec une relecture par Apple

- **Ce qu'Apple permet (vérifié).** Jusqu'à 10 000 testeurs par application, invités par e-mail ou par lien public. Une version reste testable 90 jours.
- **La relecture.** La première version envoyée à un groupe passe en relecture complète, « to make sure it follows the App Review Guidelines » (vérifié). Les versions suivantes « may not » en avoir besoin. Un changement important doit être signalé et relu (article 6.5).
- **La règle 5.1.1 (ix) s'applique donc en principe.** La règle 2.2 (vérifié) dit qu'une application en TestFlight « should comply with the App Review Guidelines ». La règle 5.1.1 (ix) (vérifié) vise les applications « that require sensitive user information ». Elles « should be submitted by a legal entity […] and not by an individual developer ».
- **Apple range lui-même l'opinion politique dans les données sensibles (vérifié).** Sa fiche « App Privacy » la classe dans « Sensitive Info ». Cela renforce la lecture défavorable.
- **Personne ne peut prédire le verdict sans soumettre.** La relecture des versions de test semble plus légère en pratique (de mémoire), mais aucun texte ne le dit.

### 1.3 Ce qu'Apple demande déjà pour les testeurs externes

| Exigence | Source | Ce que cela demande |
|---|---|---|
| Description de la version de test et e-mail pour les retours | vérifié | Deux champs à remplir. |
| Compte de démonstration pour le relecteur | règle 2.1 et page « App Review information », vérifié | Un compte qui « must not expire ». |
| Politique de confidentialité en ligne | règle 5.1.1 (i), vérifié : lien obligatoire dans la fiche App Store Connect **et** dans l'application ; champ obligatoire pour les testeurs externes (moteur) | Une adresse web publique. Aucune règle d'Apple n'impose un domaine (de mémoire). |
| Fiche « App Privacy » | vérifié : exigée « to submit […] to the App Store » | Pas exigée pour TestFlight (de mémoire). À préparer quand même : « Sensitive Info, political opinion », liée à la personne, pour faire tourner le jeu. |
| Suppression du compte dans l'application | règle 5.1.1 (v), vérifié | « Tout effacer » convient. La page d'Apple ajoute que les applications avec connexion Apple « should use » le service d'Apple pour couper le lien (révoquer les jetons). |
| Connexion Apple si Google est proposé | règle 4.8, vérifié | Il faut une option équivalente qui protège la vie privée. Sign in with Apple suffit. Elle est déjà prévue (D-057, point 3). |
| Accord des personnes invitées | article 7.4(2) du contrat Apple, vérifié | Le porteur répond des invitations. Il garantit avoir une base légale pour les e-mails qu'il donne à Apple. Apple ne s'en sert que pour les invitations. |
| Contrôle à l'export (chiffrement) | vérifié | Une question à remplir dans App Store Connect. |

Pour la politique de confidentialité, je recommande de publier N6 à l'adresse `elenchos.fr/confidentialite`. Le domaine est acheté avant les joueurs (D-060, point 2).

**Le compte de démonstration.** Je recommande un cercle fictif, avec des membres et des réponses inventés. Le relecteur d'Apple ne doit jamais entrer dans un cercle réel : il verrait les opinions des amis. Pour la voie e-mail, il faut aussi un code fixe réservé à ce compte. C'est à Back-end de le prévoir.

### 1.4 Ce qu'Apple voit et montre pendant le test, absent des textes actuels

1. **Le bouton de retour de TestFlight envoie des captures d'écran au porteur, via les serveurs d'Apple.** Une capture de la révélation contient les réponses du cercle.
   - Solution : demander, dans les consignes « What to Test » et dans N6, de ne jamais envoyer de capture qui montre des réponses.
   - Effacer ces retours à la fin du test.
   - Vérifier si on peut couper ce bouton pour un groupe : je ne l'ai pas vérifié.
2. **App Store Connect montre au porteur, testeur par testeur, l'installation, le nombre d'ouvertures et les plantages** (de mémoire). Ce sont des gestes rattachés à un nom. Or N6 dit « sous un numéro sans nom », et D-052 dit « jamais par personne ». Solution :
   - le dire dans N6 ;
   - le porteur s'engage à ne s'en servir que pour réparer le jeu, ce que l'article 7.4(3) du contrat Apple impose déjà ;
   - il ne les montre jamais aux agents.
3. **Une autre application de Google pour la connexion (Google Sign-In, de mémoire).** C'est à Back-end de le confirmer. Si c'est le cas, une phrase s'ajoute dans N6.

### 1.5 Conclusion franche

**Oui, le porteur peut essayer en compte individuel, par la voie des testeurs externes invités par e-mail.** C'est la seule voie conforme au contrat pour 20 à 30 amis. Elle ne coûte rien.

Je déconseille le lien public : il peut circuler hors du cercle d'amis.

**Le risque d'un refus pour la règle 5.1.1 (ix) est réel, et non chiffrable.**

- Pour le savoir tôt, je recommande d'envoyer en relecture une version représentative du jeu, avec la carte et « Tout effacer », dès qu'elle existe. Il ne faut pas attendre la fin de la construction.
- Un refus en relecture de test n'est pas public (de mémoire).
- En parallèle, une question écrite au support développeur d'Apple est gratuite. La réponse sera sans doute prudente.

**En cas de refus, il faut une structure** (D-042 et D-043). La question revient alors au porteur, car elle engage de l'argent.

- Une association ou une SASU, puis un compte développeur « organisation » avec un numéro D-U-N-S, gratuit.
- Délai probable : 2 à 6 semaines en tout (de mémoire, non vérifié).
- L'application peut être transférée d'un compte à l'autre (de mémoire).

Le transfert est simplifié par D-061 : tout est effacé à la fin du test, donc aucune donnée de joueur ne change de responsable.

À surveiller pour la version publique, sans effet sur TestFlight : le statut de « commerçant » demandé par Apple dans l'Union européenne (règlement sur les services numériques, DSA). Pour un particulier qui se déclare commerçant, il peut rendre son adresse publique sur la fiche du jeu (de mémoire).

**QCM au porteur, à poser maintenant ou au plus tard après la réponse d'Apple :** comment faire entrer les amis dans le test ?

- **Testeurs externes par e-mail, en compte individuel, relecture demandée tôt (Recommandé).** C'est la voie prévue par le contrat, sans frais. Un refus éventuel arrive avant les amis.
- **Testeurs internes (amis ajoutés au compte).** Pas de relecture, mais c'est contraire à la lettre de l'article 7.4(1). Les amis ont accès au compte, et Apple peut tout arrêter.
- **Créer une structure tout de suite.** Le risque de la règle 5.1.1 (ix) disparaît, mais il y a un coût et un délai, et cela modifie D-042, point 1.

### 1.6 Ce qui change dans les textes déjà relus

**N5 (la carte) : rien.** « Version de test, tenue par [Prénom Nom] » concorde avec le nom de développeur qu'affiche TestFlight.

**N6 (« Qui, durée, droits ») : trois ajouts et une précision.**

- **« Où, et chez qui ».** Ajouter : « Le jeu s'installe avec TestFlight, l'outil de test d'Apple. Apple sait que tu testes Elenchos. Il montre à [Prénom], pour chaque testeur, l'installation, les ouvertures et les plantages. Jamais tes réponses. Ce que tu envoies avec le bouton de retour de TestFlight passe par Apple : n'y mets pas de capture qui montre des réponses. »
- **« Ce qu'on compte ».** Corriger « sous un numéro sans nom » pour la part qui vient d'Apple.
- **« Combien de temps ».** Ajouter : « Les retours envoyés par TestFlight sont effacés à la fin du test. »
- **Publication.** Le même texte doit être publié à une adresse web, comme politique de confidentialité.

**Un texte nouveau : le message du porteur avant l'invitation** (information due au titre de l'article 14 du RGPD). Proposition : « Je peux donner ton adresse e-mail à Apple pour t'inviter au test d'Elenchos ? Apple ne s'en sert que pour l'invitation. » Sans « oui », pas d'invitation.

**D-061 :**

- les points 2 et 3 tiennent ;
- l'arbitrage d'équipe « Tout effacer coupe le lien avec Apple de notre côté seulement » est à revoir. Je recommande de couper aussi le lien chez Apple, comme le demande sa page sur la suppression de compte. Cela ne coûte rien au porteur.

**Textes devenus sans objet avec TestFlight :** N2, N3 et N8 (Safari, icône sur l'écran d'accueil). N1 est à adapter. C'est le domaine d'UX.

## 2. Décisions antérieures touchées

- **D-062, point 2 :** précisé. La voie interne ne convient pas à des amis. Il reste la voie externe, avec relecture.
- **D-042, point 1, et D-043, point 1 :** la question de la structure peut revenir avant le test, si Apple refuse.
- **D-043, point 3 :** Apple s'ajoute comme intermédiaire hors d'Europe, inévitable (distribution, retours de test).
- **D-052 (conditions « jamais par personne ») et texte N6 :** les compteurs de TestFlight par testeur sont à encadrer.
- **D-061 :** arbitrage d'équipe sur la connexion Apple, à revoir, ce qui rétablit en partie D-035, règle 5. Texte N6 à compléter.
- **D-056 :** inchangé. Le jeu reste en nom propre tant qu'Apple l'accepte.

## 3. Limites et doutes

- **Le verdict de la relecture d'Apple n'est pas prévisible.** Ma lecture de « members of Your organization » est une interprétation. Seul Apple ou un avocat peut la trancher.
- **Faits non vérifiés sur une page Apple :**
  - politique de confidentialité exigée pour TestFlight (moteur) ;
  - fiche « App Privacy » non exigée pour TestFlight (de mémoire) ;
  - compteurs par testeur (de mémoire) ;
  - possibilité de couper le bouton de retour (non vérifiée) ;
  - délais de création d'une structure (de mémoire).
- **Le tableau des droits du rôle Marketing n'a pas pu être lu.**
- **À tester avec de vraies personnes :**
  - les amis réussissent-ils l'installation en deux temps (TestFlight, puis le jeu) ?
  - envoient-ils des captures de la révélation par TestFlight ?
  - comprennent-ils qu'Apple voit leurs ouvertures du jeu ?

## Sources (consultées le 15 octobre 2026)

- [TestFlight](https://developer.apple.com/testflight/)
- [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers)
- [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers)
- [Overview of TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/overview-of-testflight/)
- [Add and edit users](https://developer.apple.com/help/app-store-connect/manage-your-team/add-and-edit-users)
- [Role permissions](https://developer.apple.com/help/app-store-connect/reference/role-permissions)
- [Program License Agreement](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/) (articles 1.2, 6.5, 7.4)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (règles 2.1, 2.2, 4.8, 5.1.1)
- [App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Offering account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [App Review information](https://developer.apple.com/help/app-store-connect/reference/app-review-information)
- Relevés par moteur : [SpotMe](https://support.spotme.com/hc/en-us/articles/1500006359041-iOS-app-beta-testing), [codegenes](https://www.codegenes.net/blog/testflight-complete-test-information-is-required-to-submit-a-build-for-external-testing/)