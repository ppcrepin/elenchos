# La version minimale : combien, et ce qu'elle fait risquer

*12 octobre 2026. Votre demande : « Optimiser vraiment tous les coûts pour la première version qui sera publiée. Ça donnerait quoi, si je supprime tout conseil ? Si je ne passe pas par l'hébergeur européen, mais par un autre moins cher ? » Ce document rassemble deux études. La première, de Back-end avec Front-end, porte sur l'hébergement, les textes et les petits postes. La seconde, de Juridique, porte sur ce que la loi impose et sur ce qu'on risque. Il ne décide rien : les choix qui vous reviennent vous sont posés à part. Juridique n'est pas avocat. État : en relecture (Cohérence, fait ; Vérificateur, à venir).*

## Vos deux questions, en deux réponses

- **Un hébergeur hors d'Europe fait gagner 20 à 35 € par mois** pour 1 000 joueurs, soit 250 à 400 € par an. En contrepartie, il faut prévenir les joueurs, et l'avocat a du travail en plus. Ce qui fait vraiment baisser la facture d'hébergement, c'est un serveur loué « nu » : une machine vide, que l'équipe configure et qu'il faut entretenir soi-même. Il existe en Europe. Mais l'entretien retomberait sur vous. **Urgent** : si l'hébergeur doit changer, il faut le décider avant le test du message de 18h, qui ouvre le compte Scalingo (au plus tôt le 13 octobre, D-054, D-055).
- **Sans aucun conseil** (ni conseil pour le nom, ni avocat, ni test de sécurité, ni délégué), le départ coûterait environ 700 à 1 000 €, puis environ 85 € par mois (calcul fait pour ce document). Ce n'est pas défendable : sans avocat, le recueil de l'accord des joueurs n'est vérifié par personne. Le plan l'interdit d'ailleurs (« sans avocat, pas de bêta », plan, partie 5).

## En bref

- **La version « minimal défendable »** réduit au plus juste sans retirer de protection que Juridique et Back-end jugent indispensable. Les risques qui restent sont listés à la partie 2. Elle divise la dépense de départ par trois ou quatre. Elle divise le coût mensuel par sept à quinze, tant que le jeu n'a pas atteint le nombre de joueurs qui impose le délégué. Au-delà de ce seuil, elle ne le divise plus que par deux ou trois environ.
- **Au départ, trois postes font l'essentiel de l'économie** :
  - le délégué à la protection des données, nommé seulement à partir d'un seuil de joueurs écrit à l'avance ;
  - une relecture d'avocat ciblée, au lieu de deux complètes ;
  - un test de sécurité ciblé, au lieu d'un audit complet.

  **Chaque mois, c'est le délégué seul qui fait l'économie.**
- **Une seule obligation ne se réduit pas : l'analyse d'impact.** C'est l'étude écrite des risques que le jeu fait courir aux joueurs. Elle est exigée parce que le jeu garde des opinions politiques. Elle ne coûte que du temps, avec le modèle gratuit de la CNIL, l'autorité française de protection des données.
- **On ne peut pas supprimer trois choses sans danger réel** :
  - une relecture d'avocat avant la bêta : si l'accord des joueurs est mal recueilli, tout le traitement des données devient illégal ;
  - un test de sécurité fait par un humain ;
  - la vérification de fidélité de chaque texte, par un modèle capable, sur le débat entier : elle protège le député nommé à 18h.

La colonne « minimal extrême » va jusqu'au bout de la logique. Elle supprime tout ce qui peut l'être, App Store compris. Elle est là pour mesurer, pas pour être choisie : Back-end et Juridique la jugent indéfendable sur plusieurs points.

## 1. Le tableau, pour 1 000 joueurs

Les montants sont arrondis :
- le délégué est compté TTC ;
- l'hébergement, les textes et Apple sont comptés aux prix affichés par les fournisseurs ;
- l'avocat, l'audit et la marque sont repris du plan, sans savoir s'ils sont HT ou TTC ;
- le test d'intrusion est compté HT : il ferait 1 800 à 3 600 € TTC.

La colonne « Actuel » reprend `docs/reste-a-faire.md` (partie 5), avec les textes et le délégué recalculés dans `docs/couts-mensuels.md`.

**Dépenses de départ, jusqu'à l'ouverture**

| Poste | Actuel | Minimal défendable | Minimal extrême |
|---|---|---|---|
| Recherche sur le nom | Conseil, 300 à 800 € | Vous la faites vous-même dans les bases de marques publiques (2 à 3 heures). Un conseil seulement si un nom proche sort. **0 à 800 €**, mais aucune économie si le conseil est déjà engagé (D-050) | Rien : 0 € |
| Marque | Française, puis européenne : 1 320 € | Française seule, 2 classes, avant la bêta : 230 € | Rien : 0 € |
| Avocat | Deux relectures, 4 000 à 10 000 € | Une relecture ciblée avant la bêta, plus 1 à 2 heures avant l'ouverture : 2 300 à 4 900 € | Rien : 0 € |
| Sécurité | Audit complet, 3 000 à 10 000 € | Test d'intrusion ciblé : un spécialiste essaie de forcer le jeu pendant 2 à 3 jours. 1 500 à 3 000 € HT | Outils automatiques seuls : 0 € |
| Délégué, première année | 6 000 à 10 800 € | 0 € jusqu'au seuil écrit | 0 € |
| Textes de la bêta (150) | 400 à 735 € | 125 à 290 € | 36 € (montage jugé indéfendable par Back-end) |
| Structure (société ou association), si vous en créez une (à trancher avant l'App Store, D-042, D-043) | 200 à 250 € | 200 à 250 € | 0 € (pas d'App Store) |
| Le reste : hébergement jusqu'à la fin de la bêta, adresses web, test de charge | 250 à 800 € | 140 à 250 € | 30 à 55 € |
| **Total de départ** | **environ 15 500 à 34 700 €** | **environ 4 500 à 9 700 €** | **environ 70 à 90 €** |

Comment se calcule la ligne « Le reste » (calcul fait pour ce document) :
- **Minimal défendable** : la construction coûte environ 9 € par mois, pendant trois à quatre mois. La bêta coûte environ 50 € par mois, pendant deux à trois mois. S'y ajoutent une adresse en .fr (10 à 15 € par an) et le test de charge (0 à 50 €).
- **Minimal extrême** : un seul serveur nu, à 5 à 9 € par mois, pendant six mois.

Le compte Apple (99 € par an, déjà payé) n'est compté dans aucune colonne de départ.

**Chaque mois, après l'ouverture**

| Poste | Actuel | Minimal défendable | Minimal extrême |
|---|---|---|---|
| Textes | 35 à 150 € | 27 € ; 60 € si Fable 5.1, le modèle le plus capable, vérifie la fidélité | 8 € (jugé indéfendable par Back-end) |
| Hébergement | 60 à 190 € (e-mails et surveillance compris) | 50 € (Scalingo au plus juste) ; ou 10 à 16 € (serveur nu européen, voir partie 2) | 5 à 9 € (un seul serveur nu) |
| Délégué | 500 à 900 € | 0 € jusqu'au seuil. Ensuite, la première année : environ 360 à 900 €. Les années suivantes : 250 à 350 € (un indépendant payé à la journée) | 0 € |
| Compte Apple et adresses web (plus, dans les deux colonnes de droite, les e-mails et la surveillance) | 12 à 21 € | environ 9 € | environ 8 € |
| **Total par mois** | **610 à 1 260 €** | **environ 85 €** (120 € avec Fable 5.1 ; 50 € avec un serveur nu). **Une fois le seuil du délégué passé : environ 445 à 985 € la première année, 335 à 435 € ensuite** | **environ 20 à 25 €** |

Le délégué de la première année est déjà compté dans les dépenses de départ, dans la colonne « Actuel » : ne l'additionnez pas deux fois.

Ce qui n'est compté dans aucune colonne :
- la comptabilité de la structure, si vous en créez une (600 à 1 500 € par an) ;
- votre abonnement Claude ;
- votre temps.

**Ce qui est incertain dans ces chiffres** :
- **Les 27 € des textes sont une estimation.** Le raisonnement des modèles en représente plus de la moitié. Il ne sera mesuré qu'au travail 10, celui de la chaîne des textes : selon les débats, la fourchette réelle va de 13 à 250 € par mois.
- **Le plus petit modèle n'a jamais été essayé sur nos contrôles.**
- **Les prix de l'avocat, de l'audit, du test d'intrusion et du délégué sont des estimations** : seuls des devis les donneront.

## 2. Ce que chaque économie fait risquer

**Le nom, sans conseil.** Une recherche faite par vous trouve les noms identiques. Elle ne trouve pas les noms proches qui créent une confusion : seul un conseil sait juger la revue savante *Elenchos* (D-047). Le risque :
- une mise en demeure, puis un procès en contrefaçon ;
- un changement de nom, et des dommages-intérêts ;
- chaque joueur devrait réinstaller l'icône ;
- Apple peut retirer l'application sur plainte.

**La marque en France seule.** Elle ne protège pas le nom à l'étranger. Cela n'a pas de conséquence tant que le jeu ne parle que de l'Assemblée nationale.

**Une seule relecture d'avocat.** Un point nouveau entre la bêta et l'ouverture peut lui échapper, si l'équipe ne le lui signale pas. **Sans aucun avocat**, le risque est bien plus grave. Le seul fondement légal possible pour garder des opinions politiques est l'accord explicite du joueur. Si cet accord est mal recueilli, la CNIL peut ordonner d'arrêter le jeu et d'effacer toutes les réponses.

**Le délégué au seuil.** Pendant la bêta, la loi ne l'impose quasi certainement pas. À 1 000 joueurs, c'est incertain. À 10 000 joueurs, c'est probable. Une décision écrite et datée, déjà prévue par D-044, fixerait le seuil, revu chaque trimestre. Juridique propose 2 000 comptes actifs, sans fondement chiffré dans les textes : c'est l'avocat qui le fixera. Si la CNIL juge le seuil atteint plus tôt, il y a manquement, et la décision écrite montre votre bonne foi. Pour un particulier, la sanction la plus probable est une mise en demeure, puis jusqu'à 20 000 € d'amende et 100 € par jour de retard (procédure simplifiée de la CNIL, lue par un moteur de recherche).

**Le test de sécurité ciblé.** Il examine les trois points critiques :
- le cloisonnement des cercles : personne ne voit les réponses d'un autre cercle ;
- la connexion ;
- l'effacement réel des données.

Le reste du code n'est vu par aucun humain. **Sans aucun test humain**, après une fuite d'opinions, il serait difficile de soutenir que la sécurité était « appropriée », comme la loi l'exige.

**Les textes moins chers.** Deux économies sont possibles :
- un traitement non urgent : les textes sont prêts quatre semaines d'avance, donc le fournisseur les facture moitié prix, sans effet sur la qualité ;
- les contrôles de forme confiés au plus petit modèle : la symétrie, l'annotation à l'aveugle et le devin du vote.

La seconde laisse passer davantage de biais d'écriture et de tournures qui annoncent le vote. C'est un risque pour la neutralité, à mesurer avant de l'adopter. La fidélité reste vérifiée sur le débat entier. **Confier la fidélité au plus petit modèle** (colonne extrême) est jugé indéfendable par Back-end : une erreur peut viser un député nommé.

**Le serveur nu** fait économiser environ 35 € par mois. Mais :
- **Les prix sont incertains.** Les prix de 10 et 16 € ont été relevés par un moteur de recherche. Des tiers signalent l'offre de Hetzner comme indisponible. L'offre de repli coûte environ 53 € pour deux machines, soit autant que Scalingo. La sauvegarde incluse chez OVH reste à confirmer.
- **L'entretien retombe sur vous.** Les mises à jour de sécurité, les sauvegardes et les pannes d'une machine qui garde des opinions vous reviennent. Comptez une à deux heures par mois, et parfois un incident à régler en ligne de commande, un soir à 18h. Ce serait une à deux semaines de travail d'agents en plus au départ.
- **Un seul serveur, c'est un seul point de panne.**
- **Les agents ne doivent jamais lire les données.** Ils écrivent les scripts ; vous seul les lancez, et vous ne leur recopiez jamais une sortie qui contient des données.

**Un hébergeur hors d'Europe** fait économiser 20 à 35 € par mois. Mais :
- **Le cadre juridique reste attaquable.** Ce cadre autorise l'envoi de données vers les États-Unis. Le Tribunal de l'Union européenne l'a validé le 3 septembre 2025, mais un recours est pendant devant la Cour de justice, sans date connue.
- **Il faudrait le dire aux joueurs.** Le message serait : « tes réponses sont gardées par une société américaine ». La bêta tombera peut-être pendant la présidentielle (avril-mai 2027, dates à confirmer).
- **L'avocat aurait du travail en plus.**

L'offre gratuite de Supabase est écartée : elle ne fait aucune sauvegarde, donc un seul incident et tout est perdu.

**L'adresse web.** Une seule adresse en .fr suffit. Mais l'adresse en .com reste alors libre pour quelqu'un d'autre. Utiliser l'adresse fournie par l'hébergeur (colonne extrême) est à écarter. L'icône et l'abonnement au message de 18h sont liés à l'adresse : en changer après la bêta les ferait perdre à tous les joueurs.

## 3. Ce qui reste à votre charge dans tous les cas

En nom propre (D-042), vous êtes le responsable des données, et vous en répondez sur vos biens personnels : amendes, et réparation due à chaque joueur lésé. Restent à votre charge, quelle que soit la colonne :
- l'analyse d'impact, que vous signez ;
- le registre des traitements, c'est-à-dire la liste écrite de ce que le jeu fait des données ;
- la réponse aux demandes des joueurs, sous un mois ;
- la déclaration d'une fuite à la CNIL, sous 72 heures ;
- les contrats avec les prestataires ;
- la responsabilité éditoriale des textes (D-044).

## 4. Les décisions que ces économies modifieraient

**Minimal défendable, avec Scalingo :**
- **D-043 (point 4) et D-047.** La vérification du nom, si vous la faites vous-même. La marque déposée avant la bêta, en France seule : vous aviez écarté le dépôt avant la bêta (D-043, point 4), et Juridique le repropose. Abandonner la marque européenne change aussi le plan (partie 6).
- **D-044 (point 4).** Une relecture d'avocat ciblée avant la bêta, puis une heure ou deux avant l'ouverture. D-044 avait écarté « une seule relecture avant l'ouverture » : la proposition est voisine, mais différente. Le délégué serait nommé au seuil écrit, au lieu d'avant l'ouverture.
- **Le plan, partie 5 (validé par D-046).** Un test de sécurité ciblé, au lieu d'un audit complet.
- **Le montage des textes** se choisira au travail 10, comme prévu (`docs/couts-mensuels.md`). Le montage le moins cher s'écarte de deux décisions :
  - D-036, qui fixe la vérification de fidélité sur Fable 5.1 et l'annotation sur Sonnet 5.5, pendant les essais ;
  - D-018, qui réserve le plus petit modèle aux tâches mécaniques.
- **Rien d'autre.** D-048, le choix de Scalingo, reste intacte.

**Si l'on prend un serveur nu européen :** cela modifie **D-048**, le choix de l'hébergeur. Deux points de D-043 seraient aussi mis sous tension :
- le point 2 : vous êtes le seul recours, y compris le soir ;
- le point 3 : aucune donnée de joueur ne va chez un fournisseur d'IA.

**Si l'on prend un hébergeur hors d'Europe :** cela modifie **D-043 (point 3)**, qui impose des prestataires européens, et **D-048**.

**Le minimal extrême toucherait en plus :**
- D-044 (point 4) et la règle « sans avocat, pas de bêta » : il n'y a ni avocat, ni délégué, ni audit ;
- les décisions que l'avocat devait relire : D-006, D-025, D-027, D-035, D-052 ;
- D-005, D-043 (point 1) et D-054 : pas d'App Store ;
- D-043 (point 4) : pas de marque ;
- D-044 (point 2), si tout était confié au même petit modèle : il écrirait et vérifierait lui-même.

*Sources : les rapports de Back-end et de Juridique du 12 octobre 2026. Les prix des hébergeurs, de l'INPI et des prestataires ont été relevés par un moteur de recherche : les sites étaient bloqués depuis notre environnement. Ceux du fournisseur d'IA ont été lus sur sa page officielle. L'avocat, l'audit, le test d'intrusion et le délégué sont des estimations. Chaque montant sera relu avant la dépense (D-042).*
