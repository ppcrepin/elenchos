*Note de l'orchestrateur (10 octobre 2026), après comparaison avec la page et le contrôle (`outillage/page/temoins/a-interface/comparaison-reference.txt`) : une seule ligne diffère. La référence écrit « Révélation : aucune carte. » aux jours 7 et 14 (point (E) 2). Arbitrage : la ligne est absente ces jours-là, comme le font la page et le contrôle : UX l'a tranché en Q-K3 (`controle/QUESTIONS.md` : la ligne n'apparaît que le jour où une manche ouverte du porteur est révélée, jours 2, 3, 4, 8 et 15, jamais aux jours 7 et 14). Tout le reste des carnets (B) et (C) concorde, durées, dates, heures et version masquées.*

# Carnets de référence et cas chiffrés du second essai — instance Game design (vérification)

Sources lues : ma définition, `docs/decisions.md` (D-018, D-024, D-033 à D-037), `docs/essai/simulation-2.md` (§0, §1, §4 à §6, §7.1 à §7.18, §8.1 à §8.5, §8.12, §9, annexe A GD, conventions), `a-ne-pas-ouvrir-2/schema.md` (parties 1 à 5), `a-ne-pas-ouvrir-2/regles-de-calcul-2.md`, `a-ne-pas-ouvrir-2/devoilement.md`, `docs/essai/simulation.md` (§0, §4 à §6, §7.2 à §7.4, §8.3, §8.4, §8.7, §8.12), `a-ne-pas-ouvrir/regles-de-calcul.md`, et le fichier scellé `outillage/scellement/final/fichier-scelle-candidat-final.json` (lu par extraits : profils, réglage, absences, réponses atypiques, les 108 réponses, les 90 textes abstraits, tension et sens des 18 textes, pôles des raisons de E1 à E3). Rien d'autre sous `outillage/`, rien du scratchpad.

**Une limite à lire d'abord.** Je n'ai ni Bash ni aucun moyen de calculer SHA-256 : les tirages t(…) (ordre d'affichage des cartes, rangs des candidats, place 3 « au hasard », départages) me sont inaccessibles. Et 91 jours de curseurs courants ne se refont pas à la main (c'est le principe même du brief). J'ai donc calculé tout ce qui ne dépend ni d'un tirage ni des curseurs courants des personnages, et j'ai marqué `{…}` chaque valeur qui en dépend, avec la règle qui la fixe et, quand c'est possible, l'ensemble des valeurs admissibles. Le carnet (r) est entièrement déterminé ; dans le carnet (a), seules les lignes Sans-Faute, Devin, Mystère des deux semaines et les trois lignes « Sur tout l'essai » restent à lire dans la trace.

Fichier scellé, repères : `statut` final, `version` 5, `graine` 50d5971698eeaf54, `histoire.tirage` r = 1, `reglage` = {alpha 1/4, barre 16, facteur 3, seuils_stricts false}. Profils (position/100, fermeté) : Agathe S 65 moy, P 68 moy, T 58 faible, L 25 moy ; Nassim S 82 moy, P 66 moy, T 55 moy, L 75 moy ; Odile S 10 forte, P 12 forte, T 85 forte, L 15 forte ; Valentin S 45 faible, P 25 moy, T 30 moy, L 70 faible. Absences : Agathe H39, H74, T5 ; Nassim H9, H24, H32, H47, H62, H84 ; Odile H45, T1, T9 ; Valentin H3, H11, H28, H44, H53, H60, H70, T3. J'ai vérifié sur une vingtaine de réponses que la règle 2.1 et la liste `reponses_atypiques` redonnent exactement les niveaux scellés (par exemple T0 Nassim 4 au lieu de 1, listé atypique ; H86 Agathe et Valentin, les deux imposés).

---

## (A) Les coups de la partie témoin (a)

Définition reprise du premier essai (§9 bis de `regles-de-calcul.md`), adaptée au second (point 12 du fichier caché ne la redéfinit pas ; il ajoute « au centre : toujours Neutre », qui la recouvre). Ce que j'ai dû fixer est en italique.

| Jour | Coups |
|---|---|
| 1 | Pages du cadre, « Commencer ». E1, E2, E3 : **Neutre · Aucune de ces raisons** ; pari **Neutre** sur Valentin aux trois textes. Verdicts 1.6 : E1 « Tu connais ton monde. » (Valentin E1 = Neutre, raison 3), E2 « Ça alors ! » (Valentin = Défavorable, raison 3), E3 « Ça alors ! » (Défavorable, raison 4). 1.7 : « Valentin a réussi à te surprendre deux fois. » ; trois curseurs flous à 1/2, largeur 19/20. *Pseudo « Témoin A » ; compte : « Recevoir un code par e-mail », 1.8b, 1.9, « Valider ».* Deviner T0 : 3 cartes, **Passer** sur chacune, « Valider », aucune raison cachée tentée, Relire 0. Répondre T1 : Neutre · aucune. *Rien d'ouvert (Cercle, proche, Moi, Qui est qui : 0). Carnet : « Aucun ».* |
| 2 | Message (1re forme). Révélation T0 lue jusqu'au bout, fermée, jamais rouverte. Deviner T1 : Passer ×3, Valider. Répondre T2 : Neutre · aucune. Carnet : Aucun. |
| 3 | Idem : révélation T1 ; Deviner T2 : Passer ×3 ; Répondre T3 Neutre · aucune ; Aucun. |
| 4 | Message ; révélation T2 lue ; 2.7f « Jouer » → page du saut ; **« Avancer au dimanche »** sans « Annuler » ; rattrapage T4, T5, T6 : Neutre · aucune ; « Aller au dimanche ». |
| 7 | Message 2e forme avec « Ce soir, aussi : les titres de la semaine. » (Le Fidèle a des titulaires, certain). 2.7d (T5 au vote), 2.7e, 3.2 si badge d'un personnage, 3.3a–d, 3.3e. Deviner T6 : Passer ×3 ; Répondre T7 Neutre · aucune. *Carnet : Aucun ; saut clair : « Oui » ; hésité : « Nulle part » ; moment de la semaine : « Aucun ». « Copier mon carnet » puis « Aller au jour suivant ».* |
| 8 | Message ; révélation T6 lue ; saut 2 confirmé sans Annuler ; T8 à T13 : Neutre · aucune ; « Aller au dimanche ». |
| 14 | Message 2e forme + titres (Le Fidèle, certain). T12 au vote, titres, 3.3e. Deviner T13 : Passer ×3 ; Répondre T14 Neutre · aucune. *Carnet : Aucun ; Nulle part ; Aucun.* |
| 15 | Révélation T13 (3 cartes passées, « 0 point aujourd'hui »), fiche T14, *questions de fin : Toujours aussi amusant · Rien de précis · Je ne l'ai pas lue · Je ne le lisais pas · Pas plus nuancées qu'au premier essai · Je ne l'ai pas regardé · Je ne l'ai pas remarquée · Sans suspense*, Copier mon carnet, dévoilement, Tout effacer. |

Ce que la page doit montrer pour ces coups, vérifiable sans tirage :
- **Cartes servies** : toujours 3 par manche du porteur (T0 : 4 réponses ; T1 : 3, dont Nassim 4/3 et Valentin 4/3 identiques, servies ensemble ; T2 : 4 ; T6 : 4, dont Agathe 4/3 et Nassim 4/3 identiques ; T13 : 4). Donc « Passer 3 fois » à chaque manche et trois verdicts « passé » à chaque révélation lue avec cartes.
- **Phrase du jour**, chaque réponse : « Aujourd'hui, tu n'as penché ni vers {pôle 0} ni vers {pôle 1}. »
- **Phrase de la semaine** (jours 7 et 14) : « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » (aucune réponse de poids > 0 ; la forme nette est impossible : Σ = 0).
- **Barre** : 3/16 après l'entrée, +1 par réponse ; 16/16 à T13 (pendant le second saut) ; 17 réponses à la fin, barre pleine ; jamais aucun curseur net.
- **Avis du cercle** (règle de la médiane, §7.14 ; réponse du porteur comptée dès T1) : T0 (2, 3, 4, 5) → pair, 3 et 4 marqués, « était partagé » ; T1 (2, 3, 4, 4) → 3 et 4, partagé ; T2 (2, 3, 4, 4, 5) → 4, « l'aurait adopté » ; T5 (1, 3, 3, 4) → 3 seul, partagé ; T6 (3, 3, 4, 4, 5) → 4, adopté ; T12 (1, 3, 3, 4, 5) → 3, partagé ; T13 (2, 3, 3, 3, 5) → 3, partagé.
- **Le Fidèle** : semaine 14, Nassim et vous (Agathe absente T5, Odile T1, Valentin T3) ; semaine 15, Agathe, Nassim, Valentin et vous (Odile absente T9).
- Pour les personnages, le porteur est « inconnu » toute la partie (règle 3.2 : ses cartes Neutre pèsent 0) : chacune de ses cartes vaut 1 point de score pour tout devineur.

---

## (B) Carnet (r) — jusqu'à l'ouverture du premier dimanche

Ces blocs sont figés dès que le jour 7 s'ouvre et ne dépendent d'aucun tirage : ils doivent être identiques, octet pour octet (durées masquées), dans toute copie du carnet de la partie (a), y compris la copie du jour 7 (« Essai en cours : carnet copié au jour 7. ») et le carnet final. `{date}`, `{h}`, `{version}` : valeurs du harnais ; « Jours écoulés … : 0 » suppose une partie jouée le même jour.

```
Carnet du second essai Elenchos
Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, ni votre portrait, ni votre pseudo, ni l’avis du cercle.
Les titres et les chiffres « Sur tout l’essai » dépendent en partie de vos avis, mais seulement en cumul, jamais texte par texte.
Essai en cours : carnet copié au jour 7.

Jour 1 · lundi
Ouverture : {date}, entre {h}h00 et {h}h59.
Version de la page : {version}.
Durée : {D}, dont {D} pour l’entrée, {D} pour deviner et {D} pour répondre.
Entrée : paris sur Valentin juste, faux, faux.
Compte : Recevoir un code par e-mail, puis Valider.
Boutons touchés : Relire 0 fois, Passer 3 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
Pendant Deviner : Le Cercle 0 fois, écran d’un proche 0 fois.
Journée abandonnée : non.
Votre moment préféré : Aucun.

Jour 2 · mardi
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}, dont {D} pour deviner et {D} pour répondre.
Boutons touchés : Relire 0 fois, Passer 3 fois.
Révélation : passé, passé, passé. Raison cachée : pas tentée.
Révélation rouverte : 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
Pendant Deviner : Le Cercle 0 fois, écran d’un proche 0 fois.
Journée abandonnée : non.
Votre moment préféré : Aucun.

Jour 3 · mercredi
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}, dont {D} pour deviner et {D} pour répondre.
Boutons touchés : Relire 0 fois, Passer 3 fois.
Révélation : passé, passé, passé. Raison cachée : pas tentée.
Révélation rouverte : 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
Pendant Deviner : Le Cercle 0 fois, écran d’un proche 0 fois.
Journée abandonnée : non.
Votre moment préféré : Aucun.

Jour 4 · jeudi
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}.
Révélation : passé, passé, passé. Raison cachée : pas tentée.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.

Premier saut · jeudi à samedi
Durée : {D}, dont {D} sur la page du saut.
Pour répondre : {D}, {D}, {D}.
Boutons touchés : Annuler 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
```

(La copie du jour 7 continue par le bloc « Jour 7 · dimanche », « Semaine 1 » et « Sur tout l’essai » du carnet (a) ci-dessous, sans « Questions de fin », puis une ligne vide et « Fin du carnet ».)

---

## (C) Carnet (a) — la clôture

En-tête et blocs Jour 1 à Premier saut : ceux de (B), avec la ligne d'état « Essai mené jusqu’à la clôture. » à la place de « Essai en cours… ». Suite :

```
Jour 7 · dimanche
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}, dont {D} pour deviner et {D} pour répondre.
Boutons touchés : Relire 0 fois, Passer 3 fois.
Révélation : aucune carte.
Révélation rouverte : 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
Pendant Deviner : Le Cercle 0 fois, écran d’un proche 0 fois.
Journée abandonnée : non.
Votre moment préféré : Aucun.

Semaine 1
Le Sans-Faute : {T1}.
Le Devin : {T2}.
Le Mystère : {T3}.
Le Fidèle : Nassim et vous.
Ce que le jeu a fait pendant le saut, c’était clair : Oui.
Où vous avez hésité cette semaine : Nulle part.
Cette semaine, votre moment préféré : Aucun.

Jour 8 · lundi
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}.
Révélation : passé, passé, passé. Raison cachée : pas tentée.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.

Second saut · lundi à samedi
Durée : {D}, dont {D} sur la page du saut.
Pour répondre : {D}, {D}, {D}, {D}, {D}, {D}.
Boutons touchés : Annuler 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.

Jour 14 · dimanche
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}, dont {D} pour deviner et {D} pour répondre.
Boutons touchés : Relire 0 fois, Passer 3 fois.
Révélation : aucune carte.
Révélation rouverte : 0 fois.
Ouvert : Le Cercle 0 fois, écran d’un proche 0 fois, Moi 0 fois, fiche « Qui est qui » 0 fois.
Pendant Deviner : Le Cercle 0 fois, écran d’un proche 0 fois.
Journée abandonnée : non.
Votre moment préféré : Aucun.

Semaine 2
Le Sans-Faute : {T4}.
Le Devin : {T5}.
Le Mystère : {T6}.
Le Fidèle : Agathe, Nassim, Valentin et vous.
Où vous avez hésité cette semaine : Nulle part.
Cette semaine, votre moment préféré : Aucun.

Clôture
Ouverture : {date}, entre {h}h00 et {h}h59.
Jours écoulés depuis l’ouverture précédente : 0.
Version de la page : {version}.
Durée : {D}.
Révélation : passé, passé, passé. Raison cachée : pas tentée.

Sur tout l’essai
Quand un personnage devinait la réponse d’un autre personnage, il a trouvé son auteur : {x1} fois sur {y1}.
Quand un personnage devinait l’une de vos réponses, il a trouvé que c’était vous : {x2} fois sur {y2}.
Titres attribués par tirage au sort, faute de départage : {n}.

Questions de fin
Au fil de l’essai, deviner était : Toujours aussi amusant.
Ce qui vous a le plus servi pour deviner : Rien de précis.
La règle écrite dans Deviner vous a paru : Je ne l’ai pas lue.
L’avis du cercle, à la révélation : Je ne le lisais pas.
Les quatre raisons, au moment de répondre : Pas plus nuancées qu’au premier essai.
Votre portrait, au second dimanche : Je ne l’ai pas regardé.
La barre du portrait : Je ne l’ai pas remarquée.
Avec des textes rejetés, « Et l’Assemblée ? » était : Sans suspense.

Fin du carnet
```

Contraintes sur les valeurs à lire dans la trace : {T1}, {T4} : un sous-ensemble de {Agathe, Nassim, Odile, Valentin} ou « pas attribué », jamais « vous » (cartes du porteur révélées 3 jours puis 1 jour, R7). {T2}, {T5} : un personnage, jamais « vous » (0 point) ; « pas attribué » seulement si aucun personnage ne marque, ce que les forçages ci-dessous rendent très improbable. {T3}, {T6} : un membre, « vous » possible (ses cartes Neutre · aucune ont un jumeau seulement là où un personnage a répondu Neutre · aucune, par exemple Valentin à T12), ou « pas attribué ». {y2} : nombre de cartes du porteur servies aux personnages sur T1 à T13 (dépend du classement par surprise et de t("hasard|…")). {n} : de 0 à 6. Le seuil de 5 textes répondus parmi les révélés est atteint dès le jour 7 (T1 à T5) : ces lignes portent des chiffres, pas « pas de chiffre ».

---

## (D) Les quatre cas chiffrés

### D1. La semaine d'histoire qui précède l'arrivée (semaine 13, jours −6 à 0)

Textes révélés dans la semaine : répondus des jours −8 à −2, soit H83 à H89 ; réponses comptées (Le Fidèle) : H84 à H90. Absence dans la période : Nassim à H84 (jour −7) : pas de réponse à H84, pas de manche le jour −7 (sur H83). À quatre membres, chaque devineur reçoit **toutes** les réponses des trois autres (point 5 du fichier caché) : les cartes ne dépendent d'aucun tirage ; seuls l'ordre d'affichage et les rangs en dépendent.

Côtés attendus (règle 3.2, a = p si s = 1, sinon 1 − p ; +1 si a ≥ 3/5, −1 si a ≤ 2/5) :

| Tension, sens | Agathe | Nassim | Odile | Valentin |
|---|---|---|---|---|
| S, 1 / S, 0 | +1 / −1 | +1 / −1 | −1 / +1 | 0 / 0 |
| P, 1 / P, 0 | +1 / −1 | +1 / −1 | −1 / +1 | −1 / +1 |
| T, 1 / T, 0 | 0 / 0 | 0 / 0 | +1 / −1 | −1 / +1 |
| L, 1 / L, 0 | −1 / +1 | +1 / −1 | −1 / +1 | +1 / −1 |

Réponses (niveau/raison, côté σ) et atypiques (★) :

| Texte | Tension, s | Agathe | Nassim | Odile | Valentin |
|---|---|---|---|---|---|
| H83 | T, 1 | 3/aucune (0) | 3/1 (0) | 5/4 (+1) | 2/2 (−1) |
| H84 | L, 1 | 2/4 (−1) | absent | 1/1 (−1) | 4/3 (+1) |
| H85 | S, 0 | 2/4 (−1) | 1/4 (−1) | 5/2 (+1) | 4/3 (+1) ★ |
| H86 | P, 0 | 4/3 (+1) ★ | 2/1 (−1) | 5/2 (+1) | 2/4 (−1) ★ |
| H87 | T, 0 | 3/4 (0) | 3/2 (0) | 1/3 (−1) | 4/1 (+1) |
| H88 | L, 0 | 2/2 (−1) ★ | 4/3 (+1) ★ | 5/4 (+1) | 2/2 (−1) |
| H89 | S, 1 | 4/2 (+1) | 5/2 (+1) | 1/4 (−1) | 3/aucune (0) |

Score d'une carte : 2 si σ = côté attendu du candidat, 1 si l'un des deux vaut 0, sinon 0 ; affectation de total maximal ; égalité → plus petite suite de rangs dans l'ordre d'affichage (deux tirages). Résultat manche par manche (justes au sens de D-024) :

- **H83** (devineurs Agathe, Odile, Valentin). Agathe : chaque carte a un seul 2 (Nassim 2 sur la carte 0, Odile sur +1, Valentin sur −1) → identité unique, **3 justes**. Odile et Valentin : la carte de Valentin ou d'Odile est unique, mais les cartes d'Agathe (3/aucune) et de Nassim (3/1), toutes deux σ 0 face à deux candidats attendus 0, font une égalité à 6 → **3 ou 1 justes** chacun, selon les tirages.
- **H84** (tous). Agathe (cartes Odile −1, Valentin +1 ; candidats Nassim +1, Odile −1, Valentin +1) : Odile forcée, carte de Valentin disputée Nassim/Valentin → 2 ou 1. Nassim : Valentin forcé ; Agathe/Odile (toutes deux −1) permutables → 3 ou 1. Odile : Agathe forcée ; Nassim/Valentin sur la carte de Valentin → 2 ou 1. Valentin (cartes Agathe −1, Odile −1 ; candidats Agathe −1, Nassim +1, Odile −1) : permutation libre → 2 ou 0.
- **H85** (tous). Agathe : Nassim forcé (seul 2) ; Odile (+1) et Valentin (0) se disputent les cartes d'Odile et de Valentin, total 5 des deux côtés → 3 ou 1. Nassim : même structure → 3 ou 1. Odile (candidats Agathe −1, Nassim −1, Valentin 0) : Valentin → carte de Valentin **forcée** (1 > 0 ; elle trouve donc la réponse atypique), Agathe/Nassim permutables → 3 ou 1. Valentin : Odile forcée, Agathe/Nassim permutables → 3 ou 1.
- **H86** (tous ; les deux atypiques imposés). Agathe (cartes Nassim −1, Odile +1, Valentin −1 ; candidats Nassim −1, Odile +1, Valentin +1) : quatre affectations à 4 → 3, 1, 1 ou 0 justes. Nassim (cartes Agathe +1, Odile +1, Valentin −1 ; candidats Agathe −1, Odile +1, Valentin +1) : Agathe → carte de Valentin **forcée et fausse** ; Odile/Valentin permutables sur les cartes d'Agathe et d'Odile → 1 ou 0 juste, **au moins 2 erreurs**. Odile (candidats Agathe −1, Nassim −1, Valentin +1) : Valentin → carte d'Agathe forcée et fausse ; Agathe/Nassim permutables → 1 ou 0, **au moins 2 erreurs**. Valentin (candidats Agathe −1, Nassim −1, Odile +1) : quatre affectations à 4 → 2, 1, 1 ou 0 justes, **au moins 1 erreur**. Sur 12 attributions, entre 5 et 12 erreurs.
- **H87** (tous). Agathe et Nassim : identité unique → **3 justes** chacun. Odile et Valentin : Agathe/Nassim (3/4 et 3/2) permutables → 3 ou 1.
- **H88** (tous ; cartes d'Agathe et de Valentin **identiques**, 2/2). Agathe (cartes Nassim +1, Odile +1, Valentin −1 ; candidats Nassim −1, Odile +1, Valentin −1) : quatre affectations à 4 → 2, 1, 1 ou 0 justes, au moins 1 erreur. Nassim (cartes Agathe −1, Odile +1, Valentin −1 ; candidats Agathe +1, Odile +1, Valentin −1) : Valentin prend l'une des deux cartes 2/2, Agathe ou Odile la carte d'Odile ; désigner Agathe ou Valentin sur l'une des deux cartes 2/2 est juste (jumeau, D-024, et redistribution) → 3 ou 1. Odile (candidats Agathe +1, Nassim −1, Valentin −1) : Agathe → carte de Nassim forcée et fausse ; Nassim et Valentin sur les deux cartes 2/2 : Valentin juste, Nassim faux → **exactement 1 juste, 2 erreurs**. Valentin (candidats Agathe +1, Nassim −1, Odile +1) : Nassim → carte d'Agathe forcée et fausse ; Agathe/Odile permutables sur les cartes de Nassim et d'Odile → 1 ou 0.
- **H89** (tous). Agathe et Nassim : identité unique → **3 justes**. Odile et Valentin : Valentin forcé (seul 2 sur la carte 0), Agathe/Nassim (4/2 et 5/2) permutables → 3 ou 1.

Ce qui en découle sans tirage :
- **Le Fidèle (semaine 13) : Agathe, Odile et Valentin** (Nassim absent à H84). C'est l'une des semaines « à trois Fidèles ou moins » du critère c4.
- **Le Sans-Faute : pas attribué.** Chaque devineur fait au moins une erreur dans la semaine : Agathe à H88, Nassim et Odile à H86 (deux chacun), Valentin à H86.
- **Surprise de la semaine : H86**, par la règle de l'essai (point 9 : seul texte titré ; 12 attributions ≥ 4, au moins 5 erreurs ≥ 1). C'est l'encadré « Surprise de la semaine » des jours 1 à 6. Le critère c3 (H86 l'emporterait aussi contre les textes non titrés) n'est pas vérifiable à la main : H88 a aussi au moins 5 erreurs sur 12, et la départition dépend des tirages ; le calibrage (r = 1) l'affirme, je ne peux que le noter.
- **Points de la semaine** (Le Devin) : Agathe entre 11 et 19 ; Nassim entre 9 et 16 (six manches) ; Odile entre 6 et 16 ; Valentin entre 4 et 17. **Le Devin et Le Mystère** (tentatives : Agathe 20, Nassim 18, Odile 20, Valentin 20) restent à lire dans la trace. Les tirages qui les fixent : t("ordre|g|j|auteur") et t("devine|g|j|candidat") pour j = −7 (Odile, Valentin), −6, −5, −4, −2 (les quatre), −3 et −1 (Odile, Valentin) ; et, pour le départage du Devin par les raisons cachées, le classement par surprise de chaque manche (curseurs courants).
- Affichage à l'arrivée, sous les visages : titres de la semaine 13 ci-dessus ; tempéraments : Odile « L'Original », « Le Tranché » (D3), Valentin « Le Pont » (critère c2 du fichier, non recalculé), rien pour Agathe et Nassim.

### D2. Un curseur de personnage à l'arrivée : Odile, Tradition/Changement

Textes T de l'histoire : jours j ≡ 0 (mod 4), soit H3, H7, …, H87 (22 textes ; sens 1 à H3 puis alterné : H3, H11, H19, … sens 1 ; H7, H15, … sens 0), plus E3 (T, sens 1). Odile n'y est jamais absente (H45 est un texte S). Sa réponse type : Très favorable si s = 1, Très défavorable si s = 0 ; dans les deux cas le pôle servi est π = 1 (Changement), et la raison « de sa valeur » a le pôle 1 : poids w = 1 vers 1. Lecture des 23 réponses (niveau/raison → pôle de la raison lu dans `histoire.textes.Hi.raisons[rang]`) :

| Texte (s) | Réponse | Pôle de la raison | w | Vers |
|---|---|---|---|---|
| E3 (1) | 5/3 | 1 (pour, attendue) | 1 | 1 |
| H3 (1) | 5/3 | 1 | 1 | 1 |
| H7 (0) ★ | 4/2 | 0 (pour, attendue ; le côté « pour » de H7 n'a ni croisé ni pratique) | 1 | **0** |
| H11 (1) | 5/2 | 1 | 1 | 1 |
| H15 (0) | 1/3 | 1 (contre) | 1 | 1 |
| H19 (1) ★ | 2/3 | aucun (contre, pratique) | 1/2 | 0 |
| H23 (0) | 1/2 | 1 | 1 | 1 |
| H27 (1) ★ | 2/3 | aucun (contre, pratique) | 1/2 | 0 |
| H31 (0) ★ | 4/3 | 0 (pour, attendue ; pas d'inattendu sur « pour ») | 1 | **0** |
| H35, H43, H51, H59, H67, H75, H83 (1) | 5/3, 5/4, 5/3, 5/2, 5/1, 5/4, 5/4 | 1 | 1 chacune | 1 |
| H39, H47, H55, H63, H71, H79, H87 (0) | 1/4, 1/3, 1/4, 1/1, 1/2, 1/2, 1/3 | 1 | 1 chacune | 1 |

Les quatre ★ sont bien dans `reponses_atypiques.Odile` (H7, H19, H27, H31), et la règle 2.2 bis les explique : à H19 et H27 le côté « contre » offre un argument pratique (tiraillée vers rien, penchant w = 1/2) ; à H7 et H31 le côté « pour » n'offre que des arguments attendus : arbitrage net contre son profil (le seul cas qui peut faire un Pas de Côté ; ici impossible, Σw valait 2 avant H7 et 7 avant H31, sous le seuil de 10).

Σw = 19 × 1 + 1 + 1 + 1/2 + 1/2 = **22** ; Σw·π = 19 × 1 + 0 = **19**.
Centre c = (2 + 19) / (4 + 22) = **21/26** (≈ 0,808, vers Changement). Largeur ℓ = max(19/20 − 7/100 × 22 ; 1/4) = max(−59/100 ; 1/4) = **1/4**. Net (22 ≥ 10) ; |c − 1/2| = 8/26 = 4/13 ≥ 1/5 et du côté du profil (p = 85/100) : critères c1 et c5 tenus pour cette tension. C'est le curseur que le porteur voit au jour 1 (entrée et textes ≤ jour −1), et le curseur « juste avant » pour un éventuel Pas de Côté d'Odile sur un texte T de l'essai. Dans le résumé V6 : `"Odile":{"T":{"c":"21/26","somme_w":"22"}}`.

### D3. Un tempérament sur deux mois glissants : Odile au jour 0

Fenêtre : textes révélés des jours −55 à 0, donc répondus des jours −57 à −2 : **H34 à H89** (56 textes), entrée exclue. Chaque texte a au moins trois réponses (au plus une absence). Odile est membre depuis 90 jours ≥ 56 ; elle a répondu à 55 de ces textes (absente à H45) ≥ 20.

- **Le Tranché** : « Très » sur 48 réponses sur 55. Les 7 autres sont ses atypiques de la fenêtre (niveau simple) : H36 (4), H38 (2), H46 (2), H58 (4), H72 (2), H77 (2), H81 (4). 48/55 ≥ 1/2 : **oui**.
- **L'Original** (seule de son côté, aucun autre membre répondant du même côté) : 25 textes sur 55 : H35, H37, H39, H41, H42, H47, H49, H52, H53, H54, H55, H59, H61, H63, H65, H69, H71, H73, H75, H76, H78, H79, H83, H87, H89. Les 30 autres ont au moins un membre de son côté (par exemple H34 : Valentin 2 avec Odile 1 ; H40 : Agathe 4 avec Odile 5 ; H88 : Nassim 4 avec Odile 5). 25/55 = 5/11 ≥ 3/10 : **oui**.
- **Le Mesuré** : 0 Neutre sur 55 : non. **Le Pont** : jamais « seule au milieu » : non.

Résultat au jour 0 : « L'Original », « Le Tranché », dans cet ordre, conforme au critère c2. Le résumé V6 porte `"Odile":["original","tranche"]`. Remarque : la marge de L'Original est plus large que l'estimation du fichier caché (5/11 contre environ 0,37) ; Le Tranché aussi (48/55 contre environ 0,8).

### D4. Le curseur accéléré du porteur de la partie (a) au second dimanche

Réponses comptées à l'ouverture du jour 14 : E1, E2, E3, T1 à T13 (16), toutes Neutre · aucune : w = 0, donc W = 3w = 0 pour chacune. Sur les quatre tensions : Σ W = 0, Σ W·π = 0 ; c = (2 + 0)/(4 + 0) = **1/2** ; ℓ = max(19/20 − 0 ; 1/4) = **19/20** ; flou. Ordre dans Moi (§5.3) : aucun net ; flous du plus étroit au plus large, tous égaux → S, P, T, L, puis les quatre tensions écartées. Phrase de la semaine : « encore flou » (D-030, R2). Barre : n = 16 ≥ 16 → pleine depuis T13, sans curseur net : c'est le témoin « barre pleine à 16 sans curseur net » (cas « au centre » du point 12), et l'objection de D-026 vécue. Le Pas de Côté est impossible (aucun curseur net). Dans Le Cercle, le porteur figure dans « Encore flou : » sur les huit barres. Le facteur 3 ne change rien ici : il multiplie des zéros.

Pour situer l'effet du facteur (pas une partie témoin définie, un contraste) : un joueur qui ferait cinq arbitrages nets du même côté sur S (E1, T3, T6, T9, T12) aurait Σ W = 15 et c = 17/19 ou 2/19, ℓ = 1/4 ; son curseur S devient net à la quatrième réponse (T9, Σ W = 12), pendant le second saut, et la barre se remplit alors à n = 12 : c'est le témoin « barre pleine par le premier curseur net ».

---

## (E) Points de la spécification que j'ai dû interpréter

1. **Partie (a) et le texte 10.** Le premier essai laissait T10 sans réponse ; au second, T10 est au rattrapage, où une réponse est exigée (§7.4). Je fais répondre Neutre · aucune, comme ailleurs. Le cas « texte sans réponse » n'existe plus que par « Abandonner cette journée », couvert par le témoin « abandon au jour 7 » du point 12.
2. **« Révélation : aucune carte. » aux jours 7 et 14.** `simulation.md` §8.12 dit que la ligne existe à tout jour qui a une révélation, et écrit « aucune carte » pour une manche vide ; R10 dit qu'une manche jamais ouverte n'a pas de cartes. Je retiens « aucune carte », sans « Raison cachée ». Lecture concurrente : ligne absente. Le contrôle 12 doit trancher avec l'auteur du format (UX).
3. **Frontière du carnet (r).** « Jusqu'à l'ouverture du premier dimanche » : je le lis comme « tout ce qui ne dépend ni des titres ni d'un tirage », donc les blocs Jour 1 à Premier saut, identiques dans toute copie. Aucune copie n'est possible à cet instant précis ; l'en-tête donné est celui de la copie du jour 7.
4. **Coups non définis par (a)** : compte par e-mail puis Valider ; pseudo « Témoin A » ; aucune ouverture d'écran ; « Aucun », « Oui », « Nulle part » au carnet ; les huit réponses de fin listées en (A). Toute autre fixation change seulement ces lignes du carnet.
5. **Dates, heures, version** : hors de ma portée, placées entre accolades comme les durées ; « Jours écoulés : 0 » suppose une partie jouée le même jour.
6. **Le Fidèle de la semaine 14** compte T0 à T6 pour les personnages et T1 à T6 pour le porteur (§6, point 4) : Nassim est le seul personnage sans absence sur T0 à T6.
7. **Surprise de la semaine 13** : par la règle de l'essai (point 9), H86 est certain ; le critère c3 est une affirmation du calibrage que je ne peux pas recalculer.
8. **Le curseur « vu à l'arrivée »** (D2) = entrée + H1 à H90, poids normaux ; c'est aussi le point de départ du Pas de Côté de T0 (schéma, partie 3.2).
9. **Numérotation des semaines dans le carnet** : « Semaine 1 » et « Semaine 2 » (format d'UX), alors que le téléphone affiche 14 et 15 (§0, arbitrage de l'orchestrateur).
10. **Jours 4 et 8** : « Durée : {D}. » sans « dont » (l'écran Répondre du rattrapage appartient au bloc de saut) ; ni « Boutons touchés », ni « Révélation rouverte », ni « Journée abandonnée », ni moment préféré ; « Ouvert » présent (§8.12, règle des jours 4 et 8).

---

**Décisions antérieures touchées** : aucune. Les carnets appliquent D-024 (jumeau), D-026 et D-033 (barre, facteur), D-035 (ligne « Compte »), D-037 (textes désignés par leur clé ; le carnet n'exige aucun titre).

**Limites et doutes.**
- Les lignes {T1} à {T6}, {x1}/{y1}, {x2}/{y2}, {n} et Le Devin / Le Mystère de la semaine 13 ne sont pas calculables sans SHA-256 ni sans les curseurs courants des personnages. Si l'orchestrateur me fournit, par un script trivial, les valeurs t("ordre|…") et t("devine|…") des manches listées en D1, les titres de la semaine 13 se terminent à la main en une passe ; pour les semaines 14 et 15, il faudrait en plus les curseurs des personnages aux jours 1 à 14 (résumé V6 plus T0 à T12), que le brief m'interdit de lire dans `resume-histoire.json`.
- Les deux carnets reposent sur ma lecture du format §8.12 ; les points 2 et 3 de (E) sont ceux où un écart octet pour octet avec la page serait le plus probablement un désaccord d'interprétation plutôt qu'un défaut.
- D2 et D3 sont des vérifications indépendantes de deux des critères c1, c2 et c5 (une tension, un personnage) : elles confirment le fichier sur ces points, pas sur les autres.
- Rien ici n'a été vu par de vraies personnes : la partie (a) est un témoin mécanique, utile pour le contrôle, muet sur le plaisir de deviner.