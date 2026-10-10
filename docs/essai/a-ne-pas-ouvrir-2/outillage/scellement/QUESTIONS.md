# Points de la spécification relevés par l'agent qui scelle

*6 octobre 2026, sur la spécification du commit `6ec7b42`. À faire passer par le circuit ; rien n'est tranché en silence dans `sceller.py`.*

## 1. Guillemet devant un « ? » ou un « ! » final (schéma, partie 4.1, étape 5)

- **Citation.** « Le `texte` de chaque considération finit par « . », « ? » ou « ! », et n'a pas de guillemets à ses bords : ni son premier caractère, ni celui qui précède sa ponctuation finale n'est l'un des caractères « (U+00AB), » (U+00BB), " (U+0022), “ (U+201C), ” (U+201D), ‹ (U+2039) ou › (U+203A). »
- **Écart.** En typographie simple (étape 7), « ? » et « ! » sont toujours précédés d'une espace U+0020. Pour une raison qui finit par « ? » ou « ! », le caractère qui précède la ponctuation finale est donc toujours cette espace : un guillemet placé juste avant (« … partout › ? ») passe l'étape 5. Essayé sur une copie modifiée du candidat : non détecté.
- **Effet sur le lot.** Aucun : les 68 raisons scellées finissent toutes par « . ».
- **Lecture proposée.** « ni celui qui précède sa ponctuation finale, après avoir retiré l'espace U+0020 qui précède un « ? » ou un « ! » ».
- **En attendant.** `sceller.py` applique la règle à la lettre, comme le programme de contrôle doit le faire.
