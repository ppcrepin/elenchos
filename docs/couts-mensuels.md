# Les coûts mensuels après l'ouverture, vérifiés

*12 octobre 2026. Votre question : pourquoi les coûts mensuels après l'ouverture sont-ils si élevés (environ 340 à 1 330 € par mois pour 1 000 joueurs, `docs/reste-a-faire.md`, partie 5) ? Deux postes faisaient l'essentiel, tous deux des estimations jamais vérifiées. Vous avez demandé de les vérifier tous les deux. Cette vérification ne change aucune de vos décisions. Ce document rassemble les deux vérifications : Contenu avec Back-end pour les textes, Juridique pour le délégué. Il ne décide rien.*

## En bref

- **Les textes coûtent beaucoup moins que prévu** : environ **35 à 85 € par mois** selon le montage (36 € en lots, 83 € si Sonnet 5.5 vérifie, environ 150 € si la vérification de fidélité reste sur Fable 5.1 comme aux essais ; 13 à 250 € selon la longueur des débats et le raisonnement), au lieu de 100 à 700 €. Calculé sur un vrai débat de l'Assemblée (tailles mesurées), avec les prix donnés à l'équipe le 12 octobre 2026 (non revérifiés sur le site du fournisseur). Le raisonnement des modèles, qui fait plus de la moitié du coût, est estimé.
- **Le délégué à la protection des données coûte plus que prévu** : environ **500 à 900 € par mois TTC** (420 à 750 € HT, soit 5 000 à 9 000 € HT par an), au lieu de 170 à 420 € (ni HT ni TTC n'était précisé). C'est lui qui pèse maintenant le plus.
- **Au total, pour 1 000 joueurs : environ 610 à 1 190 € par mois**, au lieu de 340 à 1 330 € : le bas monte, le haut baisse ; ce qui compose le total change entièrement.
- **Sans le délégué, il resterait environ 110 à 290 € par mois.** La loi ne l'impose pas pendant la bêta (quasi certain) ; à 1 000 joueurs, c'est incertain ; à 10 000, probable. Vous avez décidé de le nommer avant l'ouverture (D-044) : ce document ne remet pas cette décision en cause, il vous en donne le prix réel.

## 1. Les textes : environ 35 à 150 € par mois, selon le montage

**Comment c'est mesuré.** Contenu a pris un vrai débat (la séance du 30 octobre 2025, environ 57 000 tokens pour la partie utile ; un token vaut environ trois lettres et demie (hypothèse)) et a compté ce que chaque étape de la chaîne lit et écrit : choix du texte, lecture du débat, rédaction de la fiche, vérification de la fidélité, contrôles de symétrie, annotation à l'aveugle, devin du vote, et une correction par texte (aux essais, aucun lot n'est sorti sans correction). Les prix sont ceux communiqués à l'équipe le 12 octobre 2026 ; le dollar est compté à 0,89 €.

| Montage | Par texte | Par mois (30 textes) |
|---|---|---|
| Un modèle écrit (Opus 5.5), un autre moins cher vérifie (Sonnet 5.5) (D-044, choix 4b). Ce n'est pas le montage des essais : aux essais, la vérification de fidélité tournait sur Fable 5.1 (D-036) | environ 2,65 € | **environ 80 €** |
| Le même, en traitement non urgent (moitié prix), les textes étant prêts quatre semaines d'avance | environ 1,20 à 1,40 € | **environ 35 à 45 €** |
| Le même, avec la vérification de fidélité sur Fable 5.1, comme D-036 la fixe aux essais | environ 4,90 € | **environ 150 €** |

**La fourchette réelle va de 13 à 250 € par mois** selon la longueur des débats et la quantité de raisonnement des modèles, qui fait plus de la moitié du coût et ne se mesure qu'en faisant tourner la chaîne. Le chiffre sera confirmé pendant la marche à blanc du travail 10.

**D'où venait l'ancien chiffre** : d'une estimation de mémoire (« 2 à 15 € par texte »), jamais calculée, qui supposait en plus environ 40 % de textes refaits sans le dire, et qui ignorait le traitement à moitié prix.

**Un piège à éviter** : faire tourner la chaîne comme une conversation d'agent à plusieurs tours (comme aux essais) multiplierait le coût par trois ; l'équipe propose donc une chaîne faite d'appels simples (proposé).

**Un choix à faire, plus tard** : garder la vérification de fidélité sur Fable 5.1, comme aux essais (D-036), ferait passer le coût de 83 à environ 150 € par mois. Ce document ne tranche pas entre les deux montages : la question vous reviendra au travail 10, avec les chiffres mesurés.

**Pour la bêta** : les 150 textes jusqu'à la fin de la bêta coûteraient environ 400 € (175 à 210 € en traitement non urgent), au lieu des 300 à 2 300 € annoncés.

Mesuré : les tailles des textes, des consignes et des fiches. Relevé : les prix et le taux de change. Estimé : le raisonnement, les candidats écartés, le taux de reprise, la part du cache, un token = 3,5 lettres.

## 2. Le délégué : environ 500 à 900 € par mois

**Ce que coûte le marché** (tarifs publics relevés par Juridique le 12 octobre 2026, sur des sites de vendeurs, pages non ouvertes, à confirmer par devis) :
- le forfait d'entrée d'un vendeur relevé (189 € HT par mois) **exclut les données sensibles** ; les autres offres d'entrée ne disent pas leur périmètre ;
- selon les offres relevées, un délégué extérieur qui accepte ces données coûte **420 € HT par mois** (registre, demandes ; désignation et contrôle de la CNIL non garantis) à **750 € HT** (délégation complète) ; fourchette retenue par Juridique : estimation, 500 à 900 € TTC si vous ne récupérez pas la TVA (en nom propre, à confirmer par un comptable) ;
- la formule la moins chère qui reste défendable : un indépendant payé à la journée, 4 à 5 jours par an, **environ 2 500 à 3 500 € HT par an**, soit 210 à 290 € HT par mois, ou 250 à 350 € TTC par mois (si la TVA n'est pas récupérable), avec une marge mince en cas d'incident. Attention : Juridique estime le besoin à 6 à 10 jours la première année (3 600 à 9 000 € HT), puis 4 à 7 jours par an. Cette formule vaut donc à partir de la deuxième année, ou sans imprévu.

**D'où venait l'ancien chiffre** : une lecture de l'équipe, non sourcée, dont le bas correspondait aux forfaits qui excluent les données sensibles.

**Quand la loi l'impose** : pas d'obligation pendant la bêta (quasi certain) ; à 1 000 joueurs, c'est incertain, plutôt non ; à 10 000 joueurs, probable. Aucun texte ne chiffre la « grande échelle ». Juridique propose d'ajouter à la relecture d'avocat d'avant la bêta la qualification de la grande échelle d'Elenchos ; D-044 prévoit déjà la décision écrite. Cet avis de Juridique n'est pas celui d'un avocat.

## 3. Le nouveau total, pour 1 000 joueurs

| Poste | Avant | Vérifié |
|---|---|---|
| Textes | 100 à 700 € | **35 à 85 €** si Sonnet 5.5 vérifie ; environ 150 € sur Fable 5.1 (13 à 250 € selon les débats et le raisonnement) |
| Délégué | 170 à 420 € | **500 à 900 €** (250 à 350 € TTC avec un indépendant à la journée, à partir de la deuxième année) |
| Hébergement, e-mails, surveillance | 60 à 190 € | 60 à 190 € (inchangé) |
| Compte Apple et adresses web | 12 à 21 € | 12 à 21 € (inchangé) |
| **Total par mois** | **340 à 1 330 €** | **environ 610 à 1 190 €** ; **360 à 640 €** avec un délégué à la journée (TTC ; 320 à 580 € en HT ; à partir de la deuxième année) |
| *Note* | | *Avec la vérification de fidélité sur Fable 5.1 (D-036), les textes passent à environ 150 € par mois et le total à environ 720 à 1 260 € (TTC)* |

**Ce qui reste incertain** : le raisonnement des modèles (mesuré au travail 10), les prix réels du délégué (seuls deux ou trois devis sur le même cahier des charges les donneront), la TVA, le taux du dollar. **Ce qui n'est pas compté**, comme avant : votre abonnement Claude, votre temps.

Ces nouveaux chiffres changent aussi les totaux de `docs/plan-construction.md` partie 6 et `docs/reste-a-faire.md` partie 5 : le délégué (déjà dans le total d'ouverture, à ne pas compter deux fois) et les 150 textes (total de la bêta). Chaque dépense vous sera présentée avec son montant avant d'être engagée (D-042). La chaîne des textes se paie en dollars à l'API, hors de votre abonnement Claude.

*Si ces chiffres vous conviennent, l'équipe reporte les lignes concernées dans `docs/plan-construction.md` (partie 6) et `docs/reste-a-faire.md` (partie 5).*
