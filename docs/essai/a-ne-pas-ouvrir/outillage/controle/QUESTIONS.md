# Programme de contrôle (C) : points de spécification lus d'une certaine façon

Auteur : Back-end, rôle « auteur du programme de contrôle ». Chaque point donne la section, la citation, la lecture retenue et ce que fait C en attendant. Aucun ne bloque le scellement.

**État au 6 octobre 2026** (réponses des commits 2c66a93, 1df9aa5 et 1e631f2, en attente de la relecture Cohérence et Vérificateur).

| Point | État | Effet dans C |
|---|---|---|
| Q6 | répondu : il faut au moins 1 erreur (Le Mystère) et au moins 1 attribution fausse (surprise) ; sinon pas de titulaire (§6, points 3, 5 et 9) | appliqué |
| Q7 et Q8 | répondus : curseur net impossible ; tout programme qui en rencontre un s'arrête (§5.4) | C s'arrête dès qu'un curseur atteint Σ w ≥ 10 (`portrait.curseur`) |
| Q10 | répondu : arrêt plutôt que repli | un auteur désigné sur deux cartes d'un même groupe arrête le rejeu (journal invalide) |
| Q11 et Q18 | lectures confirmées (§8.3, §8.12) | inchangé |
| Q13 | confirmation demandée à Front-end | lecture gardée |
| Q16 | répondu : pas de copie en cours d'essai à la clôture (schéma, partie 3.12, règle 14 : `k` ≤ 14) | règle 14, schéma de la trace et gabarit du carnet |
| Q17 | répondu : la règle est retirée | sans effet |
| Q1 à Q5, Q9, Q12, Q14, Q15, Q19 | lectures sans effet sur le lot | inchangé |

## Jalon 1 (scellement)

### Q1. Jour du scellement passé au contrôle 1
- **Source.** Schéma, partie 4.1, étape 4 : « au plus tard le jour du scellement. Ce jour n'est pas dans le fichier : le programme de contrôle le reçoit en paramètre, recopié du rapport de scellement ».
- **Lecture.** Paramètre obligatoire `--date-scellement`. Sur le candidat, j'ai passé le 2026-10-06 (jour du contrôle), faute de rapport de scellement.
- **À refaire** avec le jour écrit au rapport de scellement, au moment du scellement.

### Q2. Graine vérifiée hors des huit étapes (ajout de C)
- **Source.** Simulation, §0 : la graine est « les 16 premiers chiffres hexadécimaux de SHA-256("elenchos-essai|graine|" + E) […] ce qui donne 23e3ee6ccdc3fb38 ». Aucune étape de la partie 4.1 ne la recalcule.
- **Lecture.** C la recalcule et compte une différence comme un défaut, rapporté à part (« Hors étapes »), sans changer l'ordre des huit étapes.
- **Effet sur le candidat.** Identique.

### Q3. « Mêmes sources » : comparaison avec le rapport de scellement
- **Source.** Schéma, partie 4.1, étape 8, « Mêmes sources » : « Si un même fichier a deux empreintes différentes : échec ».
- **Problème.** L'auteur de C ne lit pas le rapport de l'agent qui scelle (brief, indépendance).
- **Lecture.** C écrit le SHA-256 des huit sources lues (et, pour information, de `regles-de-calcul.md` et de `devoilement.md`, qu'il applique sans les lire). L'option `--empreintes-scellement` reçoit un JSON `{nom de fichier : SHA-256}` recopié du rapport de scellement par l'orchestrateur ; C compare alors et échoue sur toute différence. Sans elle, le rapport dit « non comparé ».

### Q4. Cases vues : auteur d'origine
- **Source.** Fichier caché, §9 bis, « cases vues » : « le nombre de ses cartes sur un texte de cette tension ».
- **Lecture.** Compté par auteur d'origine. C'est le même nombre que par auteur après redistribution : la redistribution permute les auteurs à l'intérieur d'un groupe de cartes identiques, sans en changer le nombre, et le contenu de la carte est le même. Le chiffre est donc constant, comme le §9 bis l'exige.

### Q5. Côté attendu du joueur vu par un personnage : « qu'il a eues dans ses propres cartes »
- **Source.** Fichier caché, §3, point 2.
- **Lecture.** La réponse du joueur au texte m compte si le joueur figure dans `places` de la manche de g à la séance m + 1 (auteur d'origine). Lire par `auteur_compte` donne le même ensemble de réponses (point Q4).

### Q6. Le Mystère avec zéro erreur **[à trancher, sans effet mesuré]**
- **Source.** Simulation, §6, point 3 : « au moins 6 tentatives ; plus forte proportion d'erreurs ». Le Devin exige « au moins 1 » point ; Le Mystère n'exige aucune erreur.
- **Lecture (à la lettre).** Un membre à 6 tentatives et 0 erreur peut être Le Mystère si personne n'a mieux. C le calcule ainsi.
- **Mesure.** Jamais arrivé sur les 400 dimanches du réglage. À ranger avec C-013.

### Q7. Le Pas de Côté
- **Source.** Simulation, §6, point 7 : « curseur net (Σ w ≥ 10), penchant clair (|c − 0,5| ≥ 0,2), réponse vers le pôle opposé ». Ne sont fixés ni les membres concernés, ni la réponse regardée (celle de la semaine ? du dimanche ?).
- **Lecture.** Aucun curseur n'atteint Σ w = 10 dans l'essai (au plus 6 réponses sur une tension) : C rend un tableau vide et s'arrête avec une erreur explicite si un curseur l'atteignait, plutôt que de deviner la règle.

### Q8. Phrase de la semaine, cas « nette »
- **Source.** Simulation, §5.7, première ligne du tableau.
- **Lecture.** Le pôle nommé est celui du côté de c ; si c = 1/2 exactement, rien n'est fixé. Le cas ne peut pas arriver dans l'essai (aucun curseur net) ; C s'arrête s'il arrivait.

### Q9. Réglage : ce que C rapporte au-delà des deux décisions
- **Source.** Fichier caché, §9 bis, « Ce qu'on relève ».
- **Lecture.** « Justesse des personnages entre eux » : par semaine et sur les textes 1 à 13. « Fréquences des cartes identiques » : remplacements, et manches et cartes servies ensemble, comptés séparément. Le texte 13 est donné à part (hors semaine).

### Q10. Redistribution : un auteur désigné sur deux cartes d'un même groupe
- **Source.** Fichier caché, §4.3, étape 4.
- **Lecture.** Impossible avec un journal valide (règle 7 de la partie 3.12) et avec l'affectation des personnages (une personne par carte). Si cela arrivait, C prendrait la première carte dans l'ordre d'affichage. Sans effet.

## Jalon 2 (rejeu, comparaisons, carnet, phrases, journal)

Spécification lue au commit 3553b2e et suivants (carnet du jour ouvert aussi sur une journée pas finie ; « Oui, continuer » ; moments vécus selon `etapes`).

### Q11. Question 3 du carnet à la séance 0
- **Source.** Simulation, §8.3, « Moments vécus » : la règle des écrans affichés est écrite « aux séances 1 à 14 ».
- **Lecture.** À la séance 0, les quatre choix du tableau sont proposés : le carnet de l'entrée ne s'ouvre qu'après 1.9, donc après les trois textes, leurs paris et leurs révélations.

### Q12. Règle 10 en mode `moteur`
- **Source.** Schéma, partie 3.12, règle 10 : « q2 seulement si `etapes.repondre` est vrai » ; q3 « l'un des choix proposés » (selon `etapes`). En mode `moteur`, `etapes` vaut `null`.
- **Lecture.** En mode `moteur`, C ne peut pas tenir ces deux points : il accepte q2 aux séances 1 à 14 et q3 dans le tableau du §8.3 sans le filtre des écrans. Le carnet n'existe pas en mode `moteur` : sans effet sur la trace.

### Q13. Pseudo : ce que C vérifie au-delà de la longueur
- **Source.** Schéma, partie 3.12, règle 6 : « sa longueur suit la règle d'UX (§7.2) » ; §7.2 décrit aussi la mise en forme à la saisie et le refus d'un prénom de personnage.
- **Lecture.** C refuse aussi un pseudo :
  - qui n'est pas en NFC, ou qui contient un caractère Cc ou Cf ;
  - qui contient un blanc autre que U+0020, une espace double ou une espace au bord ;
  - qui est un prénom de personnage, capitales non comptées.
  
  La page ne peut garder aucun de ces pseudos. Le pseudo des témoins (« Témoin-b-4821-k ») passe. **À confirmer par Front-end** (règle 6 : « Front-end confirme ces règles »).

### Q14. Règle 14 appliquée aux copies
- **Lecture.** En plus de la liste de la règle 14, C applique aux `coups` d'une copie :
  - les règles 7 et 10 ;
  - à la séance 0, la comparaison des `reponse`, `pari` et `pseudo` non nuls à l'état final.
  
  Les réponses au carnet du jour ne sont pas comparées à l'état final, comme le dit la règle.

### Q15. Durée attendue absente du fichier des durées
- **Source.** Schéma, partie 4.2, point 2 : « Une durée présente là où elle n'est pas attendue, ou absente là où elle l'est, est un défaut, listé avec son chemin ».
- **Lecture.**
  - Une durée attendue mais absente : C la liste comme défaut et écrit 0 dans sa trace, pour que la comparaison montre aussi l'écart.
  - Une durée présente mais non attendue : C la liste comme défaut et écrit `null`.

### Q16. Copie en cours d'essai à la clôture **[à trancher par UX, sans effet sur les parties témoins prévues]**
- **Source.** Simulation, §8.12 : « Essai en cours : carnet copié au jour {k}. » ; « séance k s'écrit jour k ». La séance 15 s'appelle « Clôture » dans la barre.
- **Problème.** Si « Tout effacer » (Moi › Réglages) est atteignable pendant la séance 15, avant l'export final, la ligne serait « … au jour 15. ».
- **Ce que fait C.** Il l'écrit ainsi.

### Q17. « Accords : « 1 juste », « 2 justes » » dans les règles du §8.12
- **Source.** Simulation, §8.12, « Règles ».
- **Constat.** Aucune ligne du gabarit n'écrit un nombre de justes. « juste », dans la ligne « Révélation », est un verdict.
- **Lecture.** Règle sans objet, probablement un reste d'une version antérieure. C ne s'en sert pas.

### Q18. Chiffres « Sur tout l'essai » d'une copie en cours d'essai
- **Source.** Simulation, §8.12 : « vient ensuite « Sur tout l'essai » (mêmes règles qu'à l'arrêt) ».
- **Lecture.** Les chiffres sont calculés comme si la partie s'arrêtait à la séance de la copie :
  - les textes révélés sont ceux de numéro ≤ k − 2 ;
  - les dimanches comptés sont ceux des séances ≤ k ;
  - le seuil de 5 réponses porte sur ces textes révélés.

### Q19. Contrôle 12 : sur quoi porte la commande `variantes`
- **Source.** Schéma, partie 4.3 ; simulation, §9, contrôle 12.
- **Lecture.** La commande prend des traces, de la page ou de C. Sur toutes, elle vérifie :
  - le gabarit et l'absence du pseudo, sur chaque carnet et chaque copie ;
  - séance par séance, que les blocs de séance et le bloc « Questions de fin » sont identiques, durées masquées ;
  - que les `mesures`, valeur des durées masquée, sont identiques ;
  - les mêmes points pour chaque copie.
  
  « Titres de la semaine » et « Sur tout l'essai » sont exclus de la comparaison.
