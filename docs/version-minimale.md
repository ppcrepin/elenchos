# La version minimale : combien, et ce qu'elle fait risquer

*12 octobre 2026. Votre demande : « Optimiser vraiment tous les coûts pour la première version qui sera publiée. Ça donnerait quoi, si je supprime tout conseil ? Si je ne passe pas par l'hébergeur européen, mais par un autre moins cher ? » Ce document rassemble deux études : Back-end avec Front-end (hébergement, textes, petits postes) et Juridique (ce que la loi impose, ce qu'on risque). Il ne décide rien : les rares choix qui vous reviennent sont posés à la fin. Juridique n'est pas avocat. État : en relecture (Cohérence, puis Vérificateur).*

## En bref

- **On peut diviser la dépense de départ par deux ou trois, et le coût mensuel par cinq à dix, sans prendre de risque déraisonnable.** C'est la colonne « minimal défendable » ci-dessous.
- **Ce qui fait vraiment l'économie, ce sont trois postes juridiques** : le délégué reporté jusqu'à un seuil de joueurs écrit à l'avance, une seule relecture d'avocat ciblée au lieu de deux, un test de sécurité ciblé au lieu d'un audit complet.
- **Quitter l'hébergeur européen ne fait presque rien gagner** : 20 à 35 € par mois à 1 000 joueurs, et du travail d'avocat en plus. Si l'on veut économiser sur l'hébergement, c'est un serveur loué « nu » qui le fait (européen de surcroît), pas le pays ; mais l'entretien de la machine retomberait alors sur vous.
- **Une seule chose est obligatoire et impossible à réduire** : l'analyse d'impact. Elle ne coûte que du temps (outil gratuit de la CNIL).
- **Ce qu'on ne peut pas supprimer sans danger réel** : toute relecture d'avocat (un consentement mal recueilli rend tout illicite), toute vérification humaine de la sécurité, et la vérification de fidélité des textes (elle protège un député nommé à 18h).

## 1. Le tableau, pour 1 000 joueurs

Montants TTC, arrondis. « Actuel » reprend `docs/reste-a-faire.md` et `docs/couts-mensuels.md`.

**Dépenses de départ, jusqu'à l'ouverture**

| Poste | Actuel | Minimal défendable | Minimal extrême |
|---|---|---|---|
| Recherche sur le nom | Conseil, 300 à 800 € | Vous la faites vous-même dans les bases publiques (2 à 3 h) ; un conseil seulement si un nom proche sort : 0 à 800 € | Rien : 0 € |
| Marque | Française puis européenne, 1 320 € | Française seule, 2 classes, avant la bêta : 230 € | Rien : 0 € |
| Avocat | Deux relectures, 4 000 à 10 000 € | Une relecture ciblée avant la bêta, plus 1 à 2 h avant l'ouverture : 2 300 à 4 900 € | Rien : 0 € |
| Sécurité | Audit complet, 3 000 à 10 000 € | Test d'intrusion ciblé, 2 à 3 jours : 1 500 à 3 000 € | Outils automatiques seuls : 0 € |
| Délégué, première année | 6 000 à 10 800 € | 0 € jusqu'au seuil écrit | 0 € |
| Textes de la bêta (150) | 400 à 735 € | 125 à 290 € | 36 € |
| Structure pour l'App Store | 200 à 250 € | 200 à 250 € | 0 € (pas d'App Store) |
| Le reste (hébergement en construction, adresses, test de charge) | 250 à 800 € | 70 à 150 € | 0 à 50 € |
| **Total de départ** | **environ 15 500 à 34 900 €** | **environ 4 400 à 9 600 €** | **environ 50 à 100 €** |

**Chaque mois, après l'ouverture**

| Poste | Actuel | Minimal défendable | Minimal extrême |
|---|---|---|---|
| Textes | 35 à 150 € | 27 € (60 € si Fable 5.1 vérifie la fidélité) | 8 € |
| Hébergement | 60 à 190 € | 50 € (Scalingo au plus juste) ; ou 10 à 16 € (serveur nu européen) | 5 à 9 € |
| Délégué | 500 à 900 € | 0 € jusqu'au seuil ; ensuite 250 à 350 € (indépendant à la journée, à partir de la deuxième année) | 0 € |
| Apple, adresse, surveillance, e-mails | 12 à 21 € | environ 9 € | environ 8 € |
| **Total par mois** | **610 à 1 260 €** | **environ 85 €** (50 € avec un serveur nu) ; **335 à 435 €** une fois le seuil du délégué passé | **environ 20 à 25 €** |

Non comptés partout : la comptabilité de la structure (600 à 1 500 € par an), votre abonnement Claude, votre temps.

## 2. Ce que chaque économie fait risquer

- **Le nom fait vous-même** : les bases trouvent les noms identiques, pas les noms proches qui créent une confusion. Risque : une mise en demeure après le lancement, un changement de nom. Si le conseil est déjà engagé (« en cours », D-050), l'économie est nulle.
- **La marque en France seule** : aucune protection à l'étranger, sans conséquence tant que le jeu ne parle que de l'Assemblée nationale.
- **Une seule relecture d'avocat** : un point nouveau entre la bêta et l'ouverture peut lui échapper si l'équipe ne le lui signale pas. **Sans aucun avocat** : le consentement aux opinions politiques est la seule base légale possible ; s'il est mal recueilli, la CNIL peut ordonner d'arrêter le jeu et d'effacer toutes les réponses.
- **Le délégué au seuil** : la loi ne l'impose pas pendant la bêta ; à 1 000 joueurs, c'est incertain ; à 10 000, probable. Une décision écrite et datée (déjà prévue par D-044) fixerait le seuil, par exemple 2 000 comptes actifs (proposition de Juridique, à faire fixer par l'avocat). Si la CNIL juge la « grande échelle » atteinte plus tôt, il y a manquement ; la décision écrite montre la bonne foi.
- **Le test de sécurité ciblé** : il regarde les trois points critiques (le cloisonnement des cercles, la connexion, l'effacement) ; le reste du code n'est vu par aucun humain. **Sans aucun test humain** : après une fuite d'opinions, il serait difficile de soutenir que la sécurité était « appropriée ».
- **Les textes moins chers** : traitement non urgent (moitié prix, sans effet sur la qualité) et contrôles de forme confiés au plus petit modèle, mais la fidélité toujours vérifiée sur le débat entier. **Confier la fidélité au plus petit modèle** (extrême) : jugé indéfendable par Back-end, une erreur peut viser un député nommé.
- **Le serveur nu** (environ 35 € de moins par mois) : les mises à jour de sécurité, les sauvegardes et les pannes d'une machine qui garde des opinions retombent sur vous, en ligne de commande, parfois un soir à 18h ; et un seul serveur, c'est un seul point de panne. Il touche D-048.
- **Un hébergeur hors d'Europe** : 20 à 35 € de moins par mois ; le cadre qui autorise ces transferts vers les États-Unis est contesté devant la Cour de justice de l'Union européenne ; il faudrait l'annoncer aux joueurs (« tes réponses sont gardées par une société américaine »), en pleine présidentielle ; et du travail d'avocat en plus. Il touche D-043 et D-048.

## 3. Ce qui reste à votre charge dans tous les cas

En nom propre (D-042), vous êtes le responsable des données : l'analyse d'impact que vous signez, le registre des traitements, la réponse aux demandes des joueurs sous un mois, une fuite déclarée à la CNIL sous 72 heures, les contrats des prestataires, et la responsabilité éditoriale des textes (D-044).

## 4. Les décisions que la version minimale défendable modifierait

- **D-043 (point 4) et D-047** : la vérification du nom par un conseil, si vous la faites vous-même ; la marque déposée avant la bêta, en France seule.
- **D-044 (point 4)** : une relecture d'avocat ciblée au lieu de deux ; le délégué nommé au seuil écrit au lieu d'avant l'ouverture.
- **Le plan, partie 5 (validé par D-046)** : un test de sécurité ciblé au lieu d'un audit complet.
- **Rien d'autre**, si l'on garde Scalingo au plus juste (D-048 intact). Le montage des textes se choisit au travail 10.

*Sources : les rapports de Back-end et de Juridique du 12 octobre 2026. Les prix des hébergeurs et des prestataires sont relevés par moteur de recherche (les sites étaient bloqués depuis l'environnement), ceux du fournisseur d'IA lus sur sa page officielle ; chaque montant sera relu avant la dépense (D-042).*
