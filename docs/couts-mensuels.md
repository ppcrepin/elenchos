# Les coûts mensuels après l'ouverture, vérifiés

*12 octobre 2026. Votre question : pourquoi les coûts mensuels après l'ouverture sont-ils si élevés (environ 340 à 1 330 € par mois pour 1 000 joueurs, `docs/reste-a-faire.md`, partie 5) ? Deux postes faisaient l'essentiel, tous deux des estimations jamais vérifiées. Vous avez demandé de les vérifier tous les deux, sans rien changer à vos décisions. Ce document rassemble les deux vérifications : Contenu avec Back-end pour les textes, Juridique pour le délégué. Il ne décide rien.*

## En bref

- **Les textes coûtent beaucoup moins que prévu** : environ **40 à 80 € par mois**, au lieu de 100 à 700 €. Mesuré sur un vrai débat de l'Assemblée, avec les prix officiels du fournisseur.
- **Le délégué à la protection des données coûte plus que prévu** : environ **500 à 900 € par mois** (5 000 à 9 000 € HT par an), au lieu de 170 à 420 €. C'est lui qui pèse maintenant le plus.
- **Au total, pour 1 000 joueurs : environ 610 à 1 190 € par mois**, au lieu de 340 à 1 330 €. Le total bouge peu ; ce qui le compose change entièrement.
- **Sans le délégué, il resterait environ 110 à 290 € par mois.** La loi ne l'impose pas pendant la bêta ; à 1 000 joueurs, c'est incertain ; à 10 000, probable. Vous avez décidé de le nommer avant l'ouverture (D-044) : ce document ne remet pas cette décision en cause, il vous en donne le prix réel.

## 1. Les textes : environ 40 à 80 € par mois

**Comment c'est mesuré.** Contenu a pris un vrai débat (la séance du 30 octobre 2025, environ 57 000 tokens pour la partie utile ; un token vaut environ trois lettres et demie) et a compté ce que chaque étape de la chaîne lit et écrit : choix du texte, lecture du débat, rédaction de la fiche, vérification de la fidélité, contrôles de symétrie, annotation à l'aveugle, devin du vote, et une correction par texte (aux essais, aucun lot n'est sorti sans correction). Les prix sont ceux du fournisseur, relevés le 12 octobre 2026 ; le dollar est compté à 0,89 €.

| Montage | Par texte | Par mois (30 textes) |
|---|---|---|
| Le montage des essais : un modèle écrit, un autre vérifie (D-044) | environ 2,65 € | **environ 80 €** |
| Le même, en traitement non urgent (moitié prix), les textes étant prêts quatre semaines d'avance | environ 1,20 à 1,40 € | **environ 35 à 45 €** |

**La fourchette réelle va de 13 à 250 € par mois** selon la longueur des débats et la quantité de raisonnement des modèles, qui fait plus de la moitié du coût et ne se mesure qu'en faisant tourner la chaîne. Le chiffre sera confirmé pendant la marche à blanc du travail 10.

**D'où venait l'ancien chiffre** : d'une estimation de mémoire (« 2 à 15 € par texte »), jamais calculée, qui supposait en plus environ 40 % de textes refaits sans le dire, et qui ignorait le traitement à moitié prix.

**Deux pièges à éviter, que l'équipe retient pour la construction** : faire tourner la chaîne comme une conversation d'agent à plusieurs tours (comme aux essais) multiplierait le coût par trois ; la faire vérifier par le modèle le plus puissant le doublerait. La chaîne de production sera faite d'appels simples.

**Pour la bêta** : les 150 textes jusqu'à la fin de la bêta coûteraient environ 400 € (175 à 210 € en traitement non urgent), au lieu des 300 à 2 300 € annoncés.

## 2. Le délégué : environ 500 à 900 € par mois

**Ce que coûte le marché** (tarifs publics relevés par Juridique le 12 octobre 2026, sur des sites de vendeurs, pages non ouvertes, à confirmer par devis) :
- les forfaits d'entrée, vers 190 € HT par mois, **excluent les données sensibles** : or les opinions politiques sont le cœur du jeu ;
- un délégué extérieur qui les accepte, avec le registre, les demandes des joueurs et les échanges avec la CNIL : **420 à 750 € HT par mois**, soit 500 à 900 € TTC si vous ne récupérez pas la TVA (en nom propre, à confirmer par votre comptable) ;
- la formule la moins chère qui reste défendable : un indépendant payé à la journée, 4 à 5 jours par an, **environ 2 500 à 3 500 € HT par an** (250 à 350 € par mois), avec une marge mince en cas d'incident.

**D'où venait l'ancien chiffre** : une lecture de l'équipe, non sourcée, dont le bas correspondait aux forfaits qui excluent les données sensibles.

**Quand la loi l'impose** : jamais pendant la bêta (quasi certain) ; à 1 000 joueurs, c'est incertain, plutôt non ; à 10 000 joueurs, probable. Aucun texte ne chiffre la « grande échelle » : l'avocat le qualifiera avant la bêta, avec la décision écrite déjà prévue (D-044).

## 3. Le nouveau total, pour 1 000 joueurs

| Poste | Avant | Vérifié |
|---|---|---|
| Textes | 100 à 700 € | **40 à 80 €** (13 à 250 € au pire) |
| Délégué | 170 à 420 € | **500 à 900 €** (250 à 350 € avec un indépendant à la journée) |
| Hébergement, e-mails, surveillance | 60 à 190 € | 60 à 190 € (inchangé) |
| Compte Apple et adresses web | 12 à 21 € | 12 à 21 € (inchangé) |
| **Total par mois** | **340 à 1 330 €** | **environ 610 à 1 190 €** ; **360 à 640 €** avec un délégué à la journée |

**Ce qui reste incertain** : le raisonnement des modèles (mesuré au travail 10), les prix réels du délégué (seuls deux ou trois devis sur le même cahier des charges les donneront), la TVA, le taux du dollar. **Ce qui n'est pas compté**, comme avant : votre abonnement Claude, votre temps.

*Si ces chiffres vous conviennent, l'équipe reporte les lignes concernées dans `docs/plan-construction.md` (partie 6) et `docs/reste-a-faire.md` (partie 5).*
