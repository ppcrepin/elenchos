# Plan de construction : de l'essai au lancement

*Synthèse de l'orchestrateur, 5 octobre 2026, à partir des plans de Back-end, Front-end, Contenu, Juridique et Game design (avec UX). Complète `docs/feuille-de-route.md`, sans rien décider : les choix de l'étape 5 vous seront posés en QCM à ce moment-là (D-009), et le code ne commence qu'avec votre accord explicite (D-001). Les durées ne sont données que lorsqu'un spécialiste peut les justifier.*

## 1. Où on en est

**Étapes 1 à 3 : faites.** Le produit est défini (`docs/produit.md`, D-010), dessiné (D-011) et habillé (univers La Tablée D-012, nom de travail Elenchos D-013, maquettes finales D-014). Le logo attend la vérification du nom.

**Étape 4, l'essai : en cours.** Vous jouerez seul, avec quatre personnages simulés, sur votre iPhone (D-015 à D-017, D-019).
- Fait :
  - les règles de la simulation, écrites et vérifiées, puis figées ;
  - 17 vrais textes de l'Assemblée et 68 vrais arguments de députés, choisis, rédigés, vérifiés par un second modèle, puis corrigés ;
  - le classement des arguments (« tension », « pôle »), fait deux fois à l'aveugle : 67 arguments classés pareil sur 68 ;
  - le vote de chaque texte, relevé deux fois ;
  - l'affichage du vote, désormais daté.
- En cours :
  - la dernière relecture du lot de textes ;
  - quatre points d'affichage (un auteur sénateur, le nom des groupes, les nombres, l'élision) ;
  - la page-test de l'icône, en vérification finale.
- Changé en route : le test de mémoire a montré que claude.ai oublie tout sur iPhone. L'essai se jouera donc depuis une icône de votre écran d'accueil (D-019).

## 2. Les prochaines étapes, jusqu'à la fin de l'essai

1. **Page-test de l'icône.** L'équipe la publie sur GitHub. Vous l'ajoutez à votre écran d'accueil, puis vous l'ouvrez trois fois : tout de suite, une minute après l'avoir fermée, et le lendemain. Vous collez chaque résultat dans la conversation.
2. **Fin de la préparation.** Dernière relecture du lot de textes ; mise à jour de la simulation pour l'icône et l'affichage (circuit complet).
3. **Scellement.** Un agent distinct écrit le fichier qui fige à l'avance toutes les réponses des personnages, puis il est réglé sur 200 parties d'essai. Son empreinte est publiée dans la conversation et sur `main`, avant votre première séance : vous pourrez vérifier à la fin que rien n'a bougé.
4. **La page de l'essai.** Elle est construite, puis contrôlée par un programme écrit à part, sur des parties jouées par des joueurs témoins et 200 parties au hasard (contrôles 1 à 14 de la simulation).
5. **Livraison.** L'équipe vous donne le lien et une courte liste de ce qu'il faut savoir.
6. **Vous jouez.** 15 séances (l'entrée, 14 jours, la clôture), à votre rythme, idéalement une par jour. Après chaque séance, vous copiez le carnet dans la conversation.
7. **Bilan de l'essai.** Les chiffres, ce que vous avez ressenti, et les règles restées ouvertes (constats C-007 à C-016, plus ceux relevés depuis en préparant l'essai et ce plan : C-017 à C-021) vous sont soumis en QCM. Le produit est corrigé. C'est la fin de l'étape 4.

## 3. Étape 5 : les choix de fabrication

Vous les trancherez après le bilan, en QCM, chacun avec ses options et ce qui fait pencher. Ils sont listés ici dans l'ordre où l'un dépend de l'autre.

| # | Choix | Options étudiées | Ce qui fait pencher |
|---|---|---|---|
| 1 | Qui porte le service | Une société, une association, ou vous en nom propre (pour le web seulement) | Apple demande une personne morale pour une app qui garde des données sensibles. En nom propre, la responsabilité est personnelle. |
| 2 | Lien ou application (D-005, suspendu) | Le lien d'abord, puis les deux boutiques ; l'application tout de suite ; le lien seul | Sur iPhone, le message de 18h n'arrive par le lien qu'après l'ajout d'une icône. L'invitée doit pouvoir jouer sans rien installer (D-006). La bêta mesurera ce geste. |
| 3 | Qui code | Des agents Claude, vous validant sur un lien d'aperçu ; un prestataire ; des agents, plus un développeur qui relit et assure la permanence | Le budget, qui entretiendra le code dans deux ans, et surtout qui répare un dimanche à 18h05 si la révélation n'est pas partie |
| 4 | Production des textes | Tout automatique ; validation humaine de chaque texte ; relecture d'un échantillon. Fournisseurs de modèles, avance de textes, règle d'équilibre entre groupes, contenu du registre public | Aucun lot de l'essai n'a passé sa première vérification sans correction. Depuis le 2 août 2026, un texte d'intérêt général écrit par une IA doit le dire, sauf vraie relecture humaine (AI Act, art. 50.4). |
| 5 | Où vivent les données | Prestataires européens seulement, ou américains installés en Europe | Des opinions politiques rattachées à une adresse e-mail. Le cadre d'échange UE–États-Unis est contesté devant la Cour de justice. |
| 6 | Force de l'engagement « ni vente, ni exploitation, ni publicité » | Conditions d'utilisation, statuts, clause en cas de rachat | Seuls le contrat et les statuts le rendent opposable |
| 7 | Durées de conservation | Effacement d'un compte inactif annoncé dès le départ, ou e-mail avant ; titres d'un membre parti gardés sous son pseudo ou sous « un ancien membre » | « Aucune relance » (D-010) ; droit à l'effacement |
| 8 | Avocat et délégué à la protection des données | Avocat avant la bêta et avant l'ouverture, ou avant l'ouverture seulement | Dès la bêta, de vraies opinions sont gardées sur un serveur |
| 9 | Modèle économique et budget | Gratuit financé hors du jeu, contribution sans avantage, supplément autour du portrait | Rien de payant ne doit toucher les points, le rendez-vous ni l'absence de publicité (§9) |
| 10 | Nom et adresse | Recherche d'antériorité, logo, dépôt de la marque, adresse web définitive | L'adresse et l'icône ne peuvent plus changer une fois les joueurs installés |

## 4. Étape 6 : construire, avec votre accord

L'ordre ci-dessous vaut quel que soit le choix « lien ou application » ; les branches sont indiquées.

| # | Travail | Fini quand | Ce que vous faites |
|---|---|---|---|
| 1 | **Préparer les règles** : chaque règle du jeu avec un chiffre et un exemple joué ; réglages calés sur des cercles simulés (3, 5, 10 membres ; douze semaines) ; une dizaine de journées jouées à la main, que le code devra reproduire | Aucune règle sans cas chiffré | Vous voyez « ce que vit un cercle type en trois mois » |
| 2 | **Les quatre tensions jamais essayées** (Égalité/Mérite, Solidarité/Responsabilité, État/Marché, Souveraineté/Ouverture) : libellés, phrases, deux textes d'épreuve chacune | Les deux classements concordent ; un modèle ne devine pas le camp de l'auteur | Vous lisez les huit textes |
| 3 | **Exigences de protection des données**, remises avant d'écrire le code : e-mail séparé des réponses, rien de personnel dans les messages ni dans les journaux techniques, aucun outil de mesure extérieur, preuve du consentement, effacement réel | Chaque exigence a son test automatique | Vous lisez « qui voit quoi » |
| 4 | **Test du message de 18h** : une page nue, cinq téléphones, trois soirs (D-005) | Le message arrive vers 18h sur les cinq téléphones, trois soirs de suite | Vous le recevez sur votre téléphone |
| 5 | **Socle et données** : hébergement, sauvegardes chiffrées, cloisonnement des cercles imposé par la base elle-même | Une restauration complète réussie ; les lignes rouges passent en tests automatiques | Les comptes (hébergeur, domaine, e-mail) sont à votre nom |
| 6 | **Horloge du jeu** : 18h, dimanche, pause, remise à zéro du lundi, changements d'heure | Tout calcul rejoué donne le même résultat | Rien |
| 7 | **Les écrans** : les 51 écrans validés, le système de design, le jeu du jour, la révélation, l'entrée et l'invitation, Le Cercle et Moi | Chaque écran à côté de sa maquette ; boucle quotidienne d'environ 90 secondes ; rien de la révélation n'arrive avant 18h | Vous jouez sur un lien d'aperçu |
| 8 | **Moteur de calcul** (cartes, points, titres, badges, portrait, phrases) | Mêmes résultats que le programme de contrôle de l'essai, plus des cas à plusieurs cercles | Vous jouez une semaine en une heure, horloge accélérée |
| 9 | **Comptes, invitation, messages de 18h** | Du lien au compte en moins de trois minutes ; la demande du message vient après la première révélation | Vous vous invitez depuis un second téléphone |
| 10 | **Chaîne des textes** : relevé quotidien de l'open data, sélection et calendrier, rédaction, vérification, règle d'erratum, registre public, puis une marche à blanc qui remplit l'avance | Toutes les erreurs plantées exprès dans un banc d'essai sont trouvées | Vous validez la page « Méthode » |
| 11 | **Juridique** : carte des données, analyse d'impact (obligatoire ici), carte de consentement, confidentialité, conditions d'utilisation, mentions légales, contrats avec les prestataires, procédures (effacement, fuite de données sous 72 h) | Relu par l'avocat ; chaque procédure jouée une fois à blanc | Vous signez l'analyse d'impact |
| 12 | **Mesures et exploitation** : ce que les joueurs font, jamais ce qu'ils pensent ; alertes si la révélation n'est pas partie à 18h01 | Une alerte d'essai reçue | Vous recevez les alertes, sinon la personne de permanence |
| 13 | **Recette** : toutes les phrases affichées comparées aux textes validés ; lignes rouges écran par écran ; accessibilité | Tout passe | Vous jouez une journée |
| 14 | **Boutiques**, si vous les retenez | Fiches de confidentialité, suppression du compte dans l'app, marge pour un refus d'Apple | Vous ouvrez les comptes Apple et Google |

Branches :
- Si l'application est choisie d'emblée, l'invitation doit quand même marcher sans installation (D-006) : il y a alors deux versions à construire.
- Si un prestataire code, ce plan devient son cahier des charges, et l'équipe relit son travail.
- Si ce sont des agents qui codent, tout se prouve par des tests automatiques, et il faut prévoir un recours humain pour les incidents du soir.

## 5. Étape 7 : bêta, puis lancement

**Avant la bêta (bloquant) :**
- construction et recette terminées ;
- des textes prêts d'avance pour toute la bêta ;
- l'analyse d'impact, au moins en version bêta ;
- des testeurs de 15 ans et plus, prévenus de ce que deviendront leurs données ;
- l'adresse et l'icône définitives, donc le nom vérifié et le logo fait.

**La bêta proposée :**
- 8 à 12 cercles réels, soit 40 à 80 personnes, pendant 8 semaines au moins, 12 de préférence (les tempéraments se calculent sur deux mois ; les premiers curseurs nets vers trois mois).
- Recrutement en deux temps : vous recrutez 4 à 6 créateurs, qui invitent eux-mêmes leurs proches. C'est l'invitation qu'on teste.
- Un mélange voulu : cercles de 3 à 10 membres, joueurs dans plusieurs cercles, jeunes de 15 à 25 ans, familles de plusieurs générations, environ la moitié sur iPhone.
- On mesure :
  - l'entrée (invités qui finissent les trois textes, puis créent leur compte) ;
  - le rendez-vous (réponses cinq jours sur sept ; ouvertures dans l'heure qui suit 18h) ;
  - les critères de D-005 sur l'ajout de l'icône ;
  - la durée de vie des cercles ;
  - le plaisir de deviner.
- Deux questionnaires courts, en QCM : textes compris, carte de consentement, univers, nom, « le jeu t'a-t-il rangé dans un camp ? ».
- Un seul lot de réglages, à mi-parcours.

**Avant l'ouverture au public (bloquant) :**
- aucune ligne rouge franchie ;
- test de charge du pic de 18h ;
- audit de sécurité extérieur ;
- relecture complète par l'avocat ;
- analyse d'impact finale ;
- mentions légales et conditions d'utilisation en ligne ;
- décision écrite sur le délégué à la protection des données ;
- marque déposée ;
- mention IA ou relecture humaine en place ;
- boutiques conformes, si vous les retenez.

Des repères chiffrés, à confirmer avant la bêta, éclaireront votre décision sans la prendre (esprit de D-008). Ils sont détaillés dans le plan de Game design. Attention au calendrier : la présidentielle d'avril-mai 2027 impose une règle de publication pour la veille et le jour du vote.

## 6. Durées et coûts

- **Construction : non estimable aujourd'hui.** Il faut savoir qui code, choisir entre lien et application, et fermer les règles restées ouvertes.
- **Délais justifiés :**
  - test du message de 18h, environ une semaine ;
  - bêta, 8 à 12 semaines ;
  - numéro d'entreprise exigé par Google (D-U-N-S), jusqu'à 30 jours ;
  - consultation de la CNIL, si elle est nécessaire, 8 semaines, prolongeables.
- **Coûts, en ordres de grandeur non vérifiés en ligne :**
  - pendant la bêta : hébergement de 20 à 60 € par mois, e-mails de 0 à 20 € par mois, domaine d'environ 15 € par an ;
  - à 10 000 joueurs : 100 à 300 € par mois ;
  - boutiques : Apple environ 99 € par an, Google 25 $ une fois ;
  - audit de sécurité : quelques milliers d'euros ;
  - marque : 190 € à l'INPI, plus 40 € par classe, puis environ 850 € pour l'Union européenne ;
  - avocat : non chiffré.
- **Le gros poste :** le temps de qui code, et la permanence du soir.

## 7. Points d'attention et désaccords

- **Le message de 18h sur iPhone.** En version lien, il ne vient qu'après l'ajout d'une icône à l'écran d'accueil. Front-end, Back-end et Game design s'accordent pour le mesurer en bêta avant de choisir les boutiques.
- **Les chiffres sur les choix des joueurs.** Le §8 de `projet.md` prévoit un « taux de choix par option », alors que `produit.md` §8 ne mesure que ce que les joueurs font. Back-end : pas de calcul par défaut. Contenu : des chiffres internes, regroupés par texte, jamais publiés. Juridique : internes seulement, et jamais publics (en campagne, ils pourraient passer pour un sondage). Constat C-021, à trancher.
- **La permanence.** Avec un porteur seul et des agents, personne n'est sûr d'être disponible à 18h : c'est le premier risque d'exploitation.
- **Les quatre tensions jamais essayées** sont les plus proches du clivage gauche-droite. Elles seront éprouvées avant la bêta (travail 2).
- **Les règles à fermer au bilan** : C-007 à C-016, et les cinq constats nouveaux, C-017 à C-021 (`docs/decisions.md`).

Plans détaillés de chaque spécialiste : conservés par l'orchestrateur, et repris au début des étapes 5 et 6.
