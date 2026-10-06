# Questions et lectures de l'auteur des carnets de référence

Ambiguïtés rencontrées en appliquant la spécification à la main (brief commun : « ne la tranchez pas en silence »). Pour chacune : section, citation, ma lecture, ce que j'ai fait.

**Sort des questions (6 octobre 2026).** Q1 à Q11 ont reçu réponse aux commits `2c66a93` et `1df9aa5` : toutes mes lectures sont confirmées et désormais écrites dans la spécification (partie (a) au §9 bis du fichier caché ; identifiants « r » et « a » au §9 ; médiane sans réponse du porteur au §4.2 ; Mystère et surprise de la semaine à au moins 1 erreur, §6). Les carnets sont conformes à ces textes. Les questions restent ci-dessous pour mémoire. Ce qui a changé dans mes carnets par suite de ces réponses : rien dans le carnet 1 ; dans le carnet 2, la ligne « Révélation » de la séance 12 porte deux verdicts (deux cartes), et les titres ont été calculés avec les seuils « au moins 1 erreur » (sans effet sur les titulaires de (a) : tous les membres ont des erreurs).

## Q1 — Partie témoin (a) : raison des réponses « Neutre »

- `regles-de-calcul.md`, §9 bis : « (a) toujours Neutre, passe tout, ne répond pas au texte 10 ». La raison choisie avec « Neutre » n'est pas dite.
- Elle compte : une carte « Neutre · aucune des quatre raisons » du porteur est identique à celle de Valentin aux textes 1 et 4 et à celle d'Agathe au texte 6 (§4.3, étape 3) ; avec une raison numérotée, elle serait identique à d'autres cartes (Nassim aux textes 6 et 11, par exemple).
- Ma lecture : « Neutre » sans adhésion à aucune raison, donc « aucune ». Fait : raison « aucune » à l'entrée et à tous les textes répondus (carnet 2). Si (a) doit porter une raison numérotée, les manches des personnages du carnet 2 changent aux séances 2, 5 et 7.

## Q2 — Partie témoin (a) : les paris de l'entrée

- §9 bis ne dit rien des paris sur Agathe (« passe tout » ne s'applique qu'aux cartes de Deviner ; à l'entrée, « Et Agathe ? Sa réponse ? » exige un pari, schéma 3.12 règle 6).
- Fait : pari « Neutre » (niveau 3) aux trois textes, dans l'esprit de la partie. Agathe est défavorable à E1 et favorable à E2 et E3 : trois paris faux, bilan « Agathe a réussi à te surprendre trois fois. », q1 posée à l'entrée.

## Q3 — Partie témoin (a) : le texte 10 « sans réponse », écrans affichés

- §9 bis : « ne répond pas au texte 10 ». Le journal doit dire si l'écran Répondre a été affiché (`etapes.repondre`), ce qui fixe « dont … pour répondre » et la question 2 (§8.12, §8.3 au commit 3553b2e).
- Fait : la manche est validée (toutes les cartes passées), l'écran Répondre est affiché puis laissé sans réponse ; « Jour suivant » → confirmation « sans répondre ? » → « Oui, continuer » → carnet du jour, q2 et q3 répondues ; `attente` null (2.5 ne s'affiche pas, la journée n'étant pas finie).

## Q4 — Identifiant de partie d'un carnet de référence

- Schéma 3.12, règle 2 : « Partie témoin : `id` est une lettre minuscule et `graine` vaut null. » Les carnets de référence ne sont ni (a), (b), (c), ni des parties au hasard.
- Fait : carnet 1 porte l'identifiant « r » ; carnet 2 porte « a », puisqu'il est la clôture de la partie témoin (a) elle-même (§9 : « le second est la clôture de la partie témoin (a) »). Si le harnais joue (a) avec d'autres gestes que les miens (heures, questions du carnet, F1), les deux journaux « a » différeront : le mien fait foi pour la référence, le sien pour les contrôles ; les grandeurs qui ne dépendent pas de ces gestes (manches, titres, agrégats) doivent être égales.

## Q5 — §3, point 2 : « les réponses du porteur qu'il a eues dans ses propres cartes » et la redistribution

- Après redistribution de cartes identiques (§4.3, étape 4), « la carte du porteur » dans la manche d'un personnage est celle dont `auteur_compte` est le porteur. Les cartes identiques ayant même niveau et même raison, le centre c calculé est le même quelle que soit la carte retenue : pas d'effet sur le calcul, mais à écrire pour lever le doute.

## Q6 — Médiane de §4.2 et devineur personnage

- « des réponses au texte k−1 de tous les membres sauf le devineur (porteur compris quand un personnage devine) » : je lis que le porteur compte seulement s'il a répondu (sinon il n'a pas de réponse). Appliqué ainsi à la séance 11 du carnet 2 (texte 10 sans réponse du porteur : médiane sur la seule autre réponse).

## Q7 — Phrase « Révélation : aucune carte. » et manche d'une carte

- Pas d'ambiguïté : une manche d'une carte écrit « Révélation : {verdict}. Raison cachée : … » (la carte unique est la carte à raison cachée, §4.4 : « 3, sinon 2, sinon 1 »). Noté parce que le gabarit du §8.12 n'écrit que trois {verdict}.

## Q8 — Compte à rebours et heure lue

- Rien à trancher ; je consigne les visages seulement (le compte à rebours n'est pas dans la trace).

## Q9 — « Sur tout l'essai », deuxième ligne, pour la partie (a)

- §8.4 : « pas de chiffre » si aucune carte du porteur n'a été servie à un personnage. Dans (a), des cartes du porteur sont servies (il répond à 12 textes) : la ligne a un chiffre dès que 5 textes révélés ont une réponse, ce qui est le cas à la clôture.

## Q10 — Le Mystère et la surprise de la semaine : qui sont « les autres » et quelles attributions

- §6, points 3 et 5. Lecture : « tentatives » = toutes les attributions non passées des quatre autres membres (porteur compris) sur les cartes dont `auteur_compte` est X ; « erreurs » = celles qui ne désignent pas X. Pour la surprise de la semaine : toutes les attributions non passées, tous devineurs confondus, sur les cartes des manches jouées sur ce texte ; « fausse » = `designe` ≠ `auteur_compte`. Appliqué ainsi.

## Q11 — Points de la semaine (`points_semaine`) à la séance 7

- Le texte 5 est révélé à la séance 7 et compte en semaine 1 ; les titres de la semaine 1 tombent à la même séance, après la révélation (§6, point 8). Lecture : les points du texte 5 comptent pour Le Devin de la semaine 1. Idem texte 12 à la séance 14 pour la semaine 2.

## Q12 — Partie (a) : heures, questions du carnet, F1

- §9 bis ne fixe ni les heures d'ouverture et de lecture, ni les choix au carnet du jour, ni F1 et F2. Le §9 (commit `1df9aa5`) dit que mon journal « a » est rejoué tel quel.
- Fait : une séance par jour à 19h, du dimanche 18 octobre 2026 au lundi 2 novembre 2026 (passage à l'heure d'hiver le 25 octobre, séance 7, +01:00) ; lectures d'« En attendant » à des heures variées pour couvrir les visages (feuille D, partie 9) ; q2 et q3 choisies parmi les choix permis par les écrans affichés, q2 sautée au jour 6 ; F2 « De moins en moins amusant » ; F1 « Au milieu » partout.

## Q13 — Rang d'un candidat absent

- §3, point 1 et 4 : les candidats sont « les quatre autres membres, porteur et absents compris » ; un absent reçoit un rang et peut être désigné. Appliqué : Nassim, sans réponse au texte 3, est candidat (et désigné) dans les manches de la séance 4. Noté parce que la carte d'un absent n'existe pas : la désigner est toujours faux.

## Q14 — Chiffres constants du fichier (rapport de scellement)

- Je n'ai pas lu le rapport de scellement (§9). Mon récapitulatif de `manches-porteur.txt` donne mes propres comptes (38 cartes ; 2 remplacements ; 2 manches à cartes identiques, 5 cartes ; 2 raisons « aucune » affichées, 0 cachée ; 2 cartes cachées déplacées ; 2 égalités de classement ; 10 réponses atypiques servies). S'ils diffèrent du rapport, c'est à régler ligne par ligne, comme pour les carnets.
