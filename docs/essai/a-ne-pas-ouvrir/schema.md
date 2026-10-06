# Schéma du fichier scellé et format de la trace (essai solo)

*Rédigé par Back-end le 4 octobre 2026, comme le demande le §9 de `docs/essai/simulation.md` (« Avant d'écrire le fichier scellé ») ; mis à jour le 5 octobre 2026 : vote daté (§7.9), puis auteurs, groupes et élision (§7.10, §7.6), nombres (§7.8, règle 6), groupes en toutes lettres ou à plusieurs organes (partie 2.7), élision fixée nom par nom (§7.6, partie 2.8), puis, dans la trace, version de la page, copies du carnet et durées au premier plan (§8.12, §8.4 ; parties 3.2, 3.3, 3.10) ; puis, avant la fabrication, fidélité aux fiches, lecture des sources, journal et écrans affichés, validité du journal, relevés hors de la mémoire, repère du fichier embarqué et phrases attendues du contrôle 11 (parties 3.1, 3.3, 3.12, 4.1, 4.2, 4.5), avec les précisions de Game design sur l'ordre des raisons, `curseur_porteur`, `passer` et quelques clés (parties 2.3, 3.3, 3.6, 3.9, 3.10). Fichier scellé : version 4 du format ; trace et journal : version 3 (partie 5). L'auteur du programme de contrôle le relit avant le scellement. Le document sert ensuite à l'agent qui scelle, à Contenu (parties 2.7 et 2.8), à l'auteur de la page et à l'auteur du programme de contrôle. C'est une spécification de travail, pas un texte pour le porteur.*

*Rangé dans `a-ne-pas-ouvrir/` (choix de l'orchestrateur) : les noms de certains champs laissent entrevoir comment les cartes sont choisies et comment les personnages devinent. Tous les lecteurs de ce document lisent déjà ce dossier. **Exemples** : toutes les valeurs sont inventées, sans lien entre elles ni avec l'essai. Elles ne suivent aucune règle cachée : ne pas s'en servir pour tester un calcul. Les personnages d'exemple portent des prénoms des maquettes (Hugo, Paul, Thomas), qui ne sont pas dans l'essai. Les textes d'exemple sont des gabarits. Exception : les tableaux des parties 2.7 et 2.8 portent les vraies valeurs du lot ; ce ne sont pas des exemples.*

*Renvois : « §n » renvoie à `docs/essai/simulation.md`, sauf mention contraire ; « le fichier caché » désigne `a-ne-pas-ouvrir/regles-de-calcul.md`. « Partie n » renvoie à ce document.*

*Ordre de lecture :*
- *agent qui scelle : parties 1 et 2 ;*
- *Contenu : parties 2.3, 2.7 et 2.8 ;*
- *auteur de la page : parties 1 à 5 ;*
- *auteur du programme de contrôle : partie 6 d'abord, puis tout le reste.*

## En bref

- Il y a deux fichiers JSON principaux, tous deux en forme canonique (RFC 8785) ; ceux qui ne servent qu'au contrôle (journal du harnais, durées, phrases attendues) sont aux parties 3.12 et 4.5 :
  - le **fichier scellé** : il est fixé avant la séance 0 et son empreinte est publiée ;
  - la **trace** : elle consigne tout ce que la version témoin de la page calcule pendant une partie jouée par un joueur inventé.
- Il n'y a aucun nombre à virgule. On n'écrit que des entiers, et des fractions exactes écrites en chaînes « p/q ».
- Chaque trace est écrite deux fois, à partir des mêmes coups : par la version témoin de la page et par le programme de contrôle. On compare les deux octet pour octet, après avoir masqué la valeur des durées réelles. Une seule différence est un défaut.
- La partie du porteur ne produit jamais de trace : sa version de la page n'en a pas (§9, D-016).
- Ne sont pas couverts ici : le format du stockage de la page (§8.8), le relevé des chaînes affichées (contrôle 11) et le texte du carnet (§8.12).

## 1. Règles communes aux deux fichiers

### 1.1 Forme canonique

Les deux fichiers sont du JSON canonique au sens de la RFC 8785. Concrètement :
- UTF-8, sans marque d'ordre d'octets en tête, sans fin de ligne finale ;
- aucun espace ni retour à la ligne hors des chaînes ;
- les clés d'objet sont triées. Toutes les clés sont en ASCII : l'ordre de la RFC est donc celui des octets. Par exemple, « 10 » vient avant « 2 », « E1 » après « 9 », « porteur » après « Valentin » ;
- dans les chaînes, on échappe seulement `"`, `\` et les caractères de contrôle U+0000 à U+001F. Pour ces derniers, on écrit `\b \t \n \f \r`, ou sinon `\u00xx` en minuscules. Tout le reste s'écrit tel quel en UTF-8 : « é », « « », l'espace fine insécable. La barre « / » n'est pas échappée ;
- les nombres sont des entiers seulement : en décimal, sans « + », sans zéro initial, sans exposant, jamais « -0 ». Ils restent compris entre −(2⁵³ − 1) et 2⁵³ − 1 ;
- aucune clé n'apparaît deux fois.

L'essai ajoute trois règles que la RFC n'impose pas :
- toute chaîne est en forme normalisée NFC. Sinon, « é » peut s'écrire de deux façons : l'empreinte change sans que l'affichage change ;
- les chaînes ne contiennent aucun caractère de contrôle. Seule exception : le retour à la ligne (U+000A) dans les textes de carnet, `carnet.texte` (partie 3.10) et `copies[].texte` (partie 3.2) ;
- le schéma est fermé : chaque champ listé ici est présent, et aucun autre n'existe. `null` n'apparaît que là où ce document le permet.

**Mise en œuvre et pièges.**
- En Python, avec ces restrictions, on obtient la forme canonique ainsi : `json.dumps(objet, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)`, puis encodage en UTF-8.
- En JavaScript, ne jamais compter sur l'ordre des clés d'un objet. Les clés « 1 » à « 14 » ressemblent à des nombres : le langage les range d'office avant les autres, dans l'ordre des nombres. Le programme qui met en forme canonique écrit donc lui-même les clés, dans l'ordre des octets.
- En Python, `True` passe aussi pour un entier, et « 1.0 » relu puis réécrit redonne « 1.0 ». Le contrôle des types doit donc exclure les booléens là où un entier est attendu, et refuser tout nombre à virgule.

### 1.2 Types

| Type | Écriture JSON | Exemple |
|---|---|---|
| entier | nombre entier | `37` |
| booléen | `true` ou `false` | |
| chaîne | chaîne en NFC | |
| fraction | chaîne « p/q » irréductible, avec q ≥ 2 ; ou « p » si la valeur est entière. Le signe éventuel est au numérateur. Zéro s'écrit « 0 ». C'est la forme de `str(Fraction)` en Python. | `"3/20"`, `"-1/2"`, `"1"`, `"0"` |
| heure | chaîne « HH:MM », heure locale de Paris, de 00:00 à 23:59 | `"07:05"` |
| instant | chaîne « AAAA-MM-JJTHH:MM±hh:mm » : la RFC 3339 à la minute, avec le décalage horaire de Paris ce jour-là | `"2026-10-25T02:30+01:00"` |
| date | chaîne « AAAA-MM-JJ » : un jour du calendrier, sans heure ni fuseau (la « full-date » de la RFC 3339), mois et jour sur deux chiffres. Elle se lit telle qu'écrite, sans conversion. | `"2025-03-01"` |
| hex16, hex64 | chaîne de 16 ou de 64 chiffres hexadécimaux minuscules | |
| texte | `"E1"`, `"E2"`, `"E3"`, puis `"1"` à `"14"`, écrits comme dans les clés de tirage (§0) | `"7"` |
| personnage | `"Agathe"`, `"Nassim"`, `"Odile"` ou `"Valentin"` | |
| membre | un personnage, ou `"porteur"` | |
| tension | `"S"`, `"P"`, `"T"` ou `"L"` | |
| niveau | entier de 1 (Très défavorable) à 5 (Très favorable) | `4` |
| raison | entier de 1 à 4 (rang d'affichage de la considération), ou la chaîne `"aucune"` | `2`, `"aucune"` |
| côté | entier, dans les termes du texte : 1 favorable, 0 neutre, −1 défavorable | `-1` |

**Pièges du type `date`.**
- En JavaScript, ne jamais lire une `date` avec `new Date("2025-03-01")`. Une date seule y est prise pour minuit en temps universel : sur un appareil réglé à l'ouest de Greenwich, la page afficherait la veille. On découpe la chaîne en trois entiers. Le mois s'écrit avec une table fixe (§7.9), jamais avec `Intl` ni `toLocaleDateString`.
- En Python, vérifier d'abord l'écriture exacte avec `re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", s)`, puis l'existence du jour avec `datetime.date.fromisoformat(s)`. Ne pas employer `\d` : en Python, il accepte aussi les chiffres d'autres écritures. Ne pas employer `fromisoformat` seul : depuis Python 3.11, il accepte aussi « 20250301 ».

### 1.3 Conventions

- « porteur » désigne le joueur de la partie, qu'il s'agisse du porteur ou d'un joueur témoin. C'est l'écriture des clés de tirage (§0).
- Dans tout tableau qui contient plusieurs membres, ils sont rangés ainsi : Agathe, Nassim, Odile, Valentin, porteur.
- Dans tout tableau de textes, l'ordre est : E1, E2, E3, puis 1 à 14 dans l'ordre des nombres.
- Un tableau garde l'ordre défini ici. La forme canonique trie les clés des objets, jamais les tableaux.

## 2. Le fichier scellé (annexe B)

### 2.1 Vue d'ensemble

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | toujours `"elenchos-essai-scelle"` |
| `version` | entier | `4` (partie 5) |
| `graine` | hex16 | la graine du tirage déterministe (§0) |
| `vecteurs_test` | tableau de 3 objets | partie 2.5 |
| `cercle` | objet | `{"nom": "Amis", "inviteuse": "Agathe"}` (§1) |
| `personnages` | objet, une clé par personnage | fiche et profil (partie 2.2) |
| `textes` | objet, 17 clés (E1 à E3, 1 à 14) | partie 2.3. Les textes de réserve ne sont pas scellés. |
| `reponses` | objet, 17 clés | toutes les réponses calculées des personnages (partie 2.4) |
| `absences` | objet, une clé par personnage | partie 2.4 |
| `reponses_atypiques` | objet, une clé par personnage | partie 2.4 |
| `reglage` | objet | partie 2.5 |

### 2.2 Personnages

Chaque entrée `personnages.<prénom>` contient :

| Clé | Type | Contenu |
|---|---|---|
| `age` | entier | |
| `metier` | chaîne | |
| `ville` | chaîne | |
| `ligne_de_vie` | chaîne | |
| `heure_de_jeu` | heure | « 7h40 » s'écrit `"07:40"`. La fiche « Qui est qui » affiche « 7h40 ». |
| `profil` | objet, une clé par tension | `{"position": entier de 0 à 100, "fermete": "faible", "moyenne" ou "forte"}` |

- Les cinq premiers champs reproduisent le tableau du §1, caractère pour caractère (par exemple « Ribérac (Dordogne) »).
- `position` est la position cachée p, écrite en centièmes (37 pour 0,37). Le calcul la lit comme la fraction position/100.
- Le sens de `position` et de `fermete` est au §2.1 du fichier caché. Les valeurs sont dans `a-ne-pas-ouvrir/profils.md`.

### 2.3 Textes

Chaque entrée `textes.<texte>` contient :

| Clé | Type | Contenu |
|---|---|---|
| `titre` | chaîne | tel qu'affiché |
| `lignes` | tableau de 3 chaînes | les trois lignes, dans l'ordre d'affichage |
| `vote` | objet | le vote de l'Assemblée : issue, jour et étape (tableau ci-dessous). Affichage : §7.9. |
| `auteur` | objet | `{"type": "depute", "nom", "feminin", "groupe"}`, `{"type": "senateur", "nom", "feminin", "groupe"}`, ou `{"type": "gouvernement"}` (« Proposé par le Gouvernement. », annexe C, point 9). Mandat et groupe au dépôt du texte (§7.10). |
| `lien_scrutin` | chaîne | adresse https de la page du scrutin sur le site de l'Assemblée |
| `sources` | tableau non vide de chaînes | adresses https des extraits des débats |
| `tension` | tension | |
| `sens` | entier 0 ou 1 | le sens s (§0) |
| `considerations` | tableau de 4 objets | dans l'ordre d'affichage |

L'objet `vote` contient :

| Clé | Type | Contenu |
|---|---|---|
| `date` | date | le jour du vote, tel qu'écrit sur la page du scrutin. C'est la seule source : on n'y corrige rien, même pour un vote tenu après minuit. Pour `"sans_vote_ensemble"`, c'est le jour du vote de l'article. |
| `etape` | `"navette"`, `"definitif"` ou `"aucune"` | la phrase d'étape : « Le Sénat devait encore voter. », « C'était le vote définitif du Parlement. », ou aucune phrase. Conditions de vérité : §7.9. |
| `issue` | `"adopte"`, `"rejete"` ou `"sans_vote_ensemble"` | « Texte adopté. », « Texte rejeté. », « Texte ni adopté ni rejeté. » (§7.9) |

Combinaisons permises (partie 4.1, étape 5) :

| `issue` | `etape` |
|---|---|
| `"adopte"` | `"navette"` ou `"definitif"` |
| `"rejete"` | `"navette"` ou `"aucune"` |
| `"sans_vote_ensemble"` | `"aucune"` |

Chaque considération `considerations[i]` contient :

| Clé | Type | Contenu |
|---|---|---|
| `rang` | entier de 1 à 4 | égal à sa place dans le tableau. C'est l'« id » des clés de tirage et la valeur de `raison`. L'ordre du tableau est tiré au scellement (fichier caché, §2). |
| `texte` | chaîne | l'argument, sans guillemets, avec sa ponctuation finale (« . », « ? » ou « ! »). La page ajoute les guillemets et applique la ponctuation du §4.6. |
| `cote` | `"pour"` ou `"contre"` | |
| `pole` | entier 0 ou 1, ou `"aucun"` | |
| `depute` | objet | `{"nom", "feminin", "groupe", "elision"}` |

Un élu (l'`auteur` de type `"depute"` ou `"senateur"`, ou le `depute` d'une considération) a les trois premiers champs ci-dessous. Le `depute` d'une considération a aussi le quatrième, `elision` ; l'`auteur` ne l'a pas, car « Proposé par {nom} » n'élide jamais. Le champ d'une considération garde son nom, `depute` : un argument vient toujours d'un député, en séance (annexe A de la simulation).

| Clé | Type | Contenu |
|---|---|---|
| `nom` | chaîne | prénom et nom, tels qu'affichés. Son premier caractère est une initiale permise (partie 2.8). |
| `feminin` | booléen | `true` donne « députée » ou « sénatrice », `false` « député » ou « sénateur » (§7.6, §7.10) |
| `groupe` | chaîne | le sigle du groupe (ou son nom en toutes lettres quand l'institution l'imprime ainsi), tel qu'affiché, pris dans la liste fermée de la partie 2.7 : groupe de l'Assemblée pour un député, du Sénat pour un sénateur ; au dépôt pour l'auteur, à la séance de l'extrait pour une considération (§7.10) |
| `elision` | booléen | `depute` d'une considération seulement. `true` : la page écrit « d' » devant le nom (« était l'argument d'… ») ; `false` : « de ». Fixé par la partie 2.8 ; la page ne le déduit jamais de l'initiale. |

- Les adresses sont en https et en ASCII : un caractère spécial s'écrit encodé, sous la forme %xx. Elles ne contiennent pas d'espace.
- Les chaînes affichées sont écrites en typographie simple : apostrophe droite, espaces ordinaires (contrôle 1). Dans un nombre, les tranches de trois chiffres sont séparées par une espace ordinaire (« 30 000 ») ; « % » suit le nombre après une espace ordinaire (« 20 % »). La page applique le §4.6 (guillemets, point final), puis les règles d'affichage du §7.8.
- Les trois champs de `vote` ne s'affichent jamais tels quels : la page en tire les phrases du §7.9. Ils ne relèvent donc pas de la typographie simple (partie 4.1, étape 7).

### 2.4 Réponses, absences, réponses atypiques

- `reponses.<texte>.<personnage>` vaut `{"niveau": niveau, "raison": raison}`.
  - L'objet contient toutes les réponses calculées, réponses atypiques comprises.
  - Un personnage absent à un texte n'a pas de clé sous ce texte. Aux trois textes d'entrée, les quatre personnages ont une clé.
- `absences.<personnage>` est un tableau : les textes quotidiens où ce personnage ne répond pas, dans l'ordre des textes. Le tableau est vide s'il n'y en a aucun. Un absent ne répond pas et ne devine pas ce jour-là (§9, contrôle 4).
- `reponses_atypiques.<personnage>` est un tableau d'objets `{"texte": texte, "cote_tire": 1, -1 ou null}`, dans l'ordre des textes.
  - La réponse elle-même est dans `reponses`. Ce tableau dit seulement lesquelles sont atypiques.
  - `cote_tire` est le côté fixé par tirage, dans le cas prévu au §2.3 du fichier caché. Il vaut `null` dans tous les autres cas.
  - Le nombre de réponses atypiques par personnage est la longueur de ce tableau ; le programme de contrôle le compare à `profils.md`.

### 2.5 Graine, vecteurs de test, réglage

`vecteurs_test` contient trois objets, dans l'ordre du §0 :
1. t("raison|Odile|E2|3") ;
2. t("hasard|Nassim|12|porteur") ;
3. t("surprise-semaine|2|11").

Chaque objet contient :

| Clé | Type | Contenu |
|---|---|---|
| `cle` | chaîne | la clé, par exemple `"raison|Odile|E2|3"` |
| `chaine` | chaîne | la chaîne hachée : graine + « \| » + clé |
| `hex8` | chaîne | les 8 premiers chiffres hexadécimaux (minuscules) de SHA-256(chaîne), calculé sur les octets UTF-8 de la chaîne |
| `n` | entier | N, la valeur de `hex8` (de 0 à 2³² − 1) |

`reglage` vaut `{"seuils_stricts": booléen}`. Ce paramètre est fixé au réglage d'avant scellement ; le §9 bis du fichier caché le définit.

### 2.6 Exemple

Ceci est un extrait, mis en retrait pour la lecture. Le vrai fichier tient sur une seule ligne, sans espace hors des chaînes. L'extrait ne compte qu'un personnage, un texte et un vecteur, et ses sigles ne figurent pas dans la partie 2.7 : il est donc invalide tel quel. Son auteur est un sénateur, pour montrer ce cas. Les valeurs sont inventées (voir l'avertissement en tête).

```json
{
  "absences": {"Hugo": ["4", "11"]},
  "cercle": {"inviteuse": "Agathe", "nom": "Amis"},
  "format": "elenchos-essai-scelle",
  "graine": "0123456789abcdef",
  "personnages": {
    "Hugo": {
      "age": 40,
      "heure_de_jeu": "08:15",
      "ligne_de_vie": "Ligne de vie d'exemple.",
      "metier": "métier d'exemple",
      "profil": {
        "L": {"fermete": "faible", "position": 50},
        "P": {"fermete": "moyenne", "position": 70},
        "S": {"fermete": "forte", "position": 15},
        "T": {"fermete": "moyenne", "position": 40}
      },
      "ville": "Ville d'exemple"
    }
  },
  "reglage": {"seuils_stricts": false},
  "reponses": {
    "8": {
      "Hugo": {"niveau": 4, "raison": 1},
      "Paul": {"niveau": 2, "raison": 2},
      "Thomas": {"niveau": 3, "raison": "aucune"}
    }
  },
  "reponses_atypiques": {"Hugo": [{"cote_tire": null, "texte": "5"}]},
  "textes": {
    "8": {
      "auteur": {"feminin": true, "groupe": "SIGLE-A", "nom": "Prénom Nom A", "type": "senateur"},
      "considerations": [
        {"cote": "pour", "depute": {"elision": false, "feminin": false, "groupe": "SIGLE-B", "nom": "Prénom Nom B"}, "pole": 1, "rang": 1, "texte": "Raison d'exemple n° 1, côté pour."},
        {"cote": "contre", "depute": {"elision": false, "feminin": true, "groupe": "SIGLE-C", "nom": "Prénom Nom C"}, "pole": 0, "rang": 2, "texte": "Raison d'exemple n° 2, côté contre ?"},
        {"cote": "contre", "depute": {"elision": false, "feminin": false, "groupe": "SIGLE-D", "nom": "Prénom Nom D"}, "pole": "aucun", "rang": 3, "texte": "Raison d'exemple n° 3, sans pôle."},
        {"cote": "pour", "depute": {"elision": false, "feminin": true, "groupe": "SIGLE-E", "nom": "Prénom Nom E"}, "pole": 1, "rang": 4, "texte": "Raison d'exemple n° 4, côté pour !"}
      ],
      "lien_scrutin": "https://www.assemblee-nationale.fr/exemple-scrutin",
      "lignes": ["Ligne d'exemple n° 1.", "Ligne d'exemple n° 2.", "Ligne d'exemple n° 3."],
      "sens": 1,
      "sources": ["https://www.assemblee-nationale.fr/exemple-debats"],
      "tension": "P",
      "titre": "Titre d'exemple",
      "vote": {"date": "2025-01-30", "etape": "aucune", "issue": "rejete"}
    }
  },
  "vecteurs_test": [
    {"chaine": "0123456789abcdef|raison|Odile|E2|3", "cle": "raison|Odile|E2|3", "hex8": "1a2b3c4d", "n": 439041101}
  ],
  "version": 4
}
```

Le même vecteur, en forme canonique, tel qu'il figure dans le fichier :

`{"chaine":"0123456789abcdef|raison|Odile|E2|3","cle":"raison|Odile|E2|3","hex8":"1a2b3c4d","n":439041101}`

Ici, `hex8` et `n` sont cohérents entre eux : 1a2b3c4d en hexadécimal vaut 439 041 101. En revanche, 1a2b3c4d n'est pas le vrai début du SHA-256 de cette chaîne.

La paire `vote` du texte 8, en forme canonique, telle qu'elle figure dans le fichier :

`"vote":{"date":"2025-01-30","etape":"aucune","issue":"rejete"}`

Ses clés sont dans l'ordre des octets (partie 1.1) : `date`, `etape`, `issue`. `vote` reste la dernière clé de l'objet du texte, après `titre`.

L'auteur du texte 8, en forme canonique :

`"auteur":{"feminin":true,"groupe":"SIGLE-A","nom":"Prénom Nom A","type":"senateur"}`

`type` vient en dernier : « t » suit « n ».

Le député de la première considération, en forme canonique :

`"depute":{"elision":false,"feminin":false,"groupe":"SIGLE-B","nom":"Prénom Nom B"}`

`elision` vient en premier : « e » précède « f ».

### 2.7 Groupes permis (§7.10)

Chaque `groupe` du fichier scellé est un sigle de ce tableau, et de lui seul, pris dans la bonne chambre (partie 4.1, étape 5). Contenu remplit les lignes avant le scellement, à partir des fiches corrigées. Le second agent de l'annexe A de la simulation les vérifie. La page ne lit pas ce tableau ; le programme de contrôle le lit.

**Règle d'écriture (Contenu).** Le sigle est le libellé abrégé de l'organe dans l'open data (`libelleAbrege`), écrit comme l'institution l'imprime dans ses comptes rendus (nom de l'orateur, « groupe … ») : « GDR-NUPES », jamais « GDR - NUPES ». Jamais le code `libelleAbrev` (« UDDPLR », « SOC-A », « ECOLO », « UMPPO »), ni le préfixe des fichiers `cr-texte`, qui en vient. Dans ce document, « sigle » désigne cette écriture, même quand l'institution écrit le nom en toutes lettres (`Les Républicains`). Moment : au dépôt pour l'auteur, à la séance de l'extrait pour une considération (§7.10). Lignes remplies par Contenu le 5 octobre 2026 ; identifiants recoupés par Back-end dans l'open data local.

| `groupe` | Chambre | Législature | Nom complet | Identifiant | Source du sigle |
|---|---|---|---|---|---|
| `Dem` | Assemblée | 15 | Mouvement Démocrate (MoDem) et Démocrates apparentés | PO774834 | PO774834 (24 septembre 2020 – 21 juin 2022), libelleAbrege « Dem » ; forme imprimée non vérifiée localement ; « MODEM » est le sigle de l'organe précédent, PO730970, fermé le 23 septembre 2020 |
| `Dem` | Assemblée | 16 | Démocrate (MoDem et Indépendants) | PO800484 | PO800484, libelleAbrege « Dem » (libelleAbrev « DEM ») ; « (Dem) », CRSANR5L16S2024O1N059, l. 621 |
| `Écolo-NUPES` | Assemblée | 16 | Écologiste - NUPES | PO800526 | PO800526, libelleAbrege « Ecolo - NUPES » (libelleAbrev « ECOLO ») ; forme imprimée « (Écolo-NUPES) », CRSANR5L16S2023O1N205, l. 57 ; auteur du texte 12 au dépôt |
| `GDR-NUPES` | Assemblée | 16 | Gauche démocrate et républicaine - NUPES | PO800502 | PO800502, libelleAbrege « GDR - NUPES » ; forme imprimée « (GDR-NUPES) », CRSANR5L16S2024O1N059, l. 637 |
| `HOR` | Assemblée | 16 | Horizons et apparentés | PO800514 | PO800514 ; CRSANR5L16S2024O1N059, l. 631 |
| `LFI-NUPES` | Assemblée | 16 | La France insoumise - Nouvelle Union Populaire écologique et sociale | PO800490 | PO800490, libelleAbrege « LFI - NUPES » ; forme imprimée « (LFI-NUPES) », CRSANR5L16S2024O1N059, l. 607 |
| `LR` | Assemblée | 16 | Les Républicains | PO800508 | PO800508 ; CRSANR5L16S2024O1N059, l. 617 |
| `RE` | Assemblée | 16 | Renaissance | PO800538 | PO800538 ; CRSANR5L16S2024O1N059, l. 650 |
| `RN` | Assemblée | 16 | Rassemblement National | PO800520 | PO800520 ; CRSANR5L16S2024O1N059, l. 656 |
| `SOC` | Assemblée | 16 | Socialistes et apparentés (membre de l'intergroupe NUPES), puis, dès le 19 octobre 2023, Socialistes et apparentés | PO800496, PO830170 | PO800496 (jusqu'au 18 octobre 2023) et PO830170 (libelleAbrev « SOC-A », code) ; libelleAbrege « SOC » pour les deux organes ; « (SOC) », CRSANR5L16S2024O1N059, l. 623 |
| `Dem` | Assemblée | 17 | Les Démocrates | PO845454 | PO845454, libelleAbrege « Dem » (libelleAbrev « DEM », code) ; « M. Hubert Ott (Dem) », CRSANR5L17S2025O1N082, l. 142 |
| `DR` | Assemblée | 17 | Droite Républicaine | PO845425 | PO845425 ; « M. Ian Boucard (DR) », CRSANR5L17S2025O1N097, l. 141 |
| `EcoS` | Assemblée | 17 | Écologiste et Social | PO845439 | PO845439, libelleAbrege « EcoS » (libelleAbrev « ECOS », code) ; « Mme Sabrina Sebaihi (EcoS) », CRSANR5L17S2025O1N244, l. 486 |
| `EPR` | Assemblée | 17 | Ensemble pour la République | PO845407 | PO845407 ; « M. Pierre Cazeneuve (EPR) », CRSANR5L17S2026O1N280, l. 251 |
| `GDR` | Assemblée | 17 | Gauche Démocrate et Républicaine | PO845514 | PO845514 ; « Mme Elsa Faucillon (GDR) », CRSANR5L17S2026E1N005, l. 818 |
| `HOR` | Assemblée | 17 | Horizons & Indépendants | PO845470 | PO845470 ; « M. Jean Moulliere (HOR) », CRSANR5L17S2025O1N097, l. 154 |
| `LFI-NFP` | Assemblée | 17 | La France insoumise - Nouveau Front Populaire | PO845413 | PO845413 ; « M. Éric Coquerel (LFI-NFP) », CRSANR5L17S2026O1N280, l. 255 |
| `LIOT` | Assemblée | 17 | Libertés, Indépendants, Outre-mer et Territoires | PO845485 | PO845485 ; « M. Paul Molac (LIOT) », CRSANR5L17S2026O1N195, l. 493 |
| `RN` | Assemblée | 17 | Rassemblement National | PO845401 | PO845401 ; « Mme Alexandra Masson (RN) », CRSANR5L17S2025O1N244, l. 518 |
| `SOC` | Assemblée | 17 | Socialistes et apparentés | PO845419 | PO845419 ; « M. Roger Vicot (SOC) », CRSANR5L17S2025O1N097, l. 137 |
| `UDR` | Assemblée | 17 | Union des droites pour la République | PO872880 | PO872880 depuis le 5 septembre 2025, libelleAbrege « UDR » (libelleAbrev « UDDPLR », code) ; avant : PO847173 « UDR » (12 septembre 2024 – 4 septembre 2025), PO845520 « À Droite », AD (18 juillet – 11 septembre 2024) ; « M. Olivier Fayssat (UDR) », CRSANR5L17S2026O1N280, l. 224 |
| `Les Républicains` | Sénat | — | Les Républicains | PO286005 | PO286005 (codeType GROUPESENAT), libelleAbrege « Les Républicains » (libelleAbrev « UMPPO », code) ; auteur du texte 1 au dépôt |

Colonnes :
- `groupe` : le sigle, entre accents graves, écrit exactement comme dans le fichier scellé et comme à l'écran. Caractères permis : les lettres de A à Z et de a à z ; À Â Ä Ç É È Ê Ë Î Ï Ô Ö Ù Û Ü Ÿ Æ Œ et leurs minuscules ; les chiffres de 0 à 9 ; le trait d'union U+002D ; l'espace U+0020. Le trait d'union est entre deux lettres ou chiffres ; l'espace est entre deux lettres ; ni l'un ni l'autre n'est au début, à la fin ou doublé. Au plus 20 caractères. Pourquoi : une espace entre deux lettres n'est jamais touchée par les règles du §7.8, qui n'agissent qu'après un chiffre ou autour d'un signe ; et 20 caractères tiennent sur une ligne de 320 px. Une ligne ne coupe jamais un sigle à son trait d'union (§7.10) ; un groupe écrit en plusieurs mots peut passer à la ligne à son espace, comme deux mots ordinaires (UX, §7.10).
- Chambre : « Assemblée » ou « Sénat ».
- Législature : « 15 », « 16 » ou « 17 » pour l'Assemblée ; « — » pour le Sénat, qui n'a pas de législature.
- Nom complet : le nom officiel de l'organe à cette date ; s'il y a plusieurs identifiants, un nom par organe, dans le même ordre. Il ne s'affiche jamais.
- Identifiant : l'identifiant de l'organe du groupe dans l'open data de l'Assemblée (« PO » suivi de chiffres) ; les groupes du Sénat en ont un aussi. Un par organe en vigueur à une date où le lot emploie ce sigle (dépôt d'un auteur, séance d'un extrait), dans l'ordre chronologique, séparés par une virgule et une espace. Un groupe qui a changé d'organe sans changer de sigle pendant la législature a donc plusieurs identifiants sur sa ligne : `SOC` en 16e, PO800496 jusqu'au 18 octobre 2023, puis PO830170. Les organes que le lot n'emploie pas (pour `UDR`, ceux d'avant PO872880) vont dans la colonne Source, pas ici.
- Source du sigle : le `libelleAbrege` de l'organe et, quand elle existe, une ligne de compte rendu où l'institution imprime le sigle.

Règles, vérifiées par le programme de contrôle quand il lit le tableau :
- la ligne d'en-tête est exactement celle du tableau ci-dessus ; chaque ligne a six cellules, toutes remplies ;
- `groupe`, Chambre, Législature et Identifiant suivent les écritures ci-dessus. En Python : `LETTRE = "A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ"` ; le sigle passe `re.fullmatch(rf"[{LETTRE}0-9]+(?:-[{LETTRE}0-9]+|(?<=[{LETTRE}]) [{LETTRE}][{LETTRE}0-9]*)*", groupe)` et `len(groupe) <= 20` ; l'identifiant passe `re.fullmatch(r"PO[0-9]+(?:, PO[0-9]+)*", identifiant)` ;
- une ligne par sigle, par chambre et par législature : un sigle qui sert dans deux législatures a deux lignes (par exemple `SOC`, en 16e et en 17e) ;
- un identifiant n'apparaît qu'une fois dans tout le tableau, toutes lignes confondues : un organe n'a qu'un sigle ;
- aucun `groupe` n'est l'un des codes internes relevés par Contenu : `UDDPLR`, `DEM`, `ECOS`, `ECOLO`, `SOC-A`, `UMPPO` (comparaison exacte, casse comprise : `Dem` passe, `DEM` non). Un autre code interne ne se verrait qu'à la vérification humaine (colonne Source) ;
- les lignes sont rangées par chambre (Assemblée, puis Sénat), puis par législature croissante, puis par ordre alphabétique des sigles, sans tenir compte de la casse ni des accents. Cet ordre aide la lecture ; le contrôle n'en dépend pas.

Lecture par le programme : il lit le seul tableau de cette partie, de la ligne qui suit la ligne de séparation (« |---| … ») jusqu'à la première ligne qui ne commence pas par « | ». Chaque ligne est découpée sur « | » ; le premier et le dernier morceau, vides, sont écartés ; il doit rester exactement six cellules (une barre « | » dans une cellule en ferait sept : défaut). Dans chaque cellule, on retire les espaces U+0020 du début et de la fin, et rien d'autre. La cellule `groupe` doit commencer et finir par un accent grave : on retire ces deux accents graves, et eux seuls ; les espaces intérieures restent (`Les Républicains` donne « Les Républicains »). La cellule Identifiant se découpe sur la virgule suivie d'une espace. Chaque cellule lue doit être en NFC, sinon c'est un défaut ; elle est ensuite comparée telle quelle. Le programme se sert des colonnes `groupe`, Chambre, Législature et Identifiant ; les autres servent à la vérification humaine (partie 4.1, après l'étape 7).

### 2.8 Initiales et élision (§7.6)

Seul le gabarit « était l'argument de {nom} » (1.6, 2.7e) place un nom d'élu après « de ». « Proposé par {nom} » et les lignes de 5.4 n'élident jamais. Ce qui suit vaut donc pour les `depute` des considérations ; seule la première liste vaut aussi pour l'auteur.

Deux listes fermées de caractères :
1. **Initiales permises.** Le premier caractère de chaque `nom` (auteur et députés) est une majuscule : de A à Z, ou l'une de À Â Ä Ç É È Ê Ë Î Ï Ô Ö Ù Û Ü Ÿ Æ Œ.
2. **Initiales qui demandent un choix** : A E I O U Y H, et À Â Ä É È Ê Ë Î Ï Ô Ö Ù Û Ü Ÿ Æ Œ.

**Ce que fait la page.** Elle écrit « d' » si le `depute` a `elision` à `true`, « de » s'il l'a à `false` (partie 2.3). Elle ne regarde pas l'initiale et ne compare aucune chaîne. Raison : l'élision suit la prononciation, que la lettre ne donne pas toujours ; « Ian » se dit comme « Yann », et l'on écrit « de Ian », comme devant un h aspiré.

**Valeur de `elision`**, écrite par l'agent qui scelle, vérifiée par le programme de contrôle (partie 4.1, étape 5) :
- `false` si l'initiale du `nom` n'est pas dans la liste 2 ;
- sinon, `true` si la Forme de sa ligne, dans le tableau ci-dessous, est `d'` ; `false` si elle est `de`.

Le tableau contient chaque `depute` dont l'initiale demande un choix, et personne d'autre. Il a une ligne par personne : un orateur cité deux fois n'a qu'une ligne. Colonnes :
- `nom` : entre accents graves, exactement comme dans le fichier scellé.
- Initiale : ce qu'on entend au début du nom : « voyelle » (un Y qui se dit comme dans « Yves » en est une), « h muet », « h aspiré » ou « son y » (un I ou un Y qui se dit comme dans « Yann »).
- Forme : `d'` ou `de`, l'usage retenu devant ce nom (apostrophe droite, typographie simple). Elle s'accorde avec l'Initiale : `d'` pour « voyelle » et « h muet », `de` pour « h aspiré » et « son y ». UX décide de la forme ; Contenu remplit le tableau à partir du lot final. Les lignes sont rangées par ordre alphabétique, sans effet sur le contrôle.

Lecture par le programme : comme en partie 2.7. Le seul tableau de cette partie est celui ci-dessous ; son en-tête est exactement « | `nom` | Initiale | Forme | » ; chaque ligne a trois cellules remplies ; les accents graves de `nom` et de Forme sont retirés (`d'` donne « d' »), les espaces intérieures gardées.

Le programme de contrôle s'en sert deux fois. Au contrôle 1, il vérifie que le tableau correspond au fichier, que Forme et Initiale s'accordent, et que chaque `elision` en découle (partie 4.1, étape 5). Au contrôle 11, il en tire « d' » ou « de » sans refaire de règle. Aucun programme ne peut dire si une Forme est juste : c'est un choix d'usage, relu par UX sur le relevé du contrôle 11.

Lignes relevées le 5 octobre 2026 (relevé d'UX, recoupé par Back-end sur les fiches, puis par Contenu : 17 noms, 18 citations) ; Contenu les met à jour si le lot change :

| `nom` | Initiale | Forme |
|---|---|---|
| `Alexandra Masson` | voyelle | `d'` |
| `Annaïg Le Meur` | voyelle | `d'` |
| `Anne-Sophie Ronceret` | voyelle | `d'` |
| `Arnaud Saint-Martin` | voyelle | `d'` |
| `Aurélie Trouvé` | voyelle | `d'` |
| `Ayda Hadizadeh` | voyelle | `d'` |
| `Édouard Bénard` | voyelle | `d'` |
| `Élisa Martin` | voyelle | `d'` |
| `Elsa Faucillon` | voyelle | `d'` |
| `Emeric Salmon` | voyelle | `d'` |
| `Éric Coquerel` | voyelle | `d'` |
| `Éric Martineau` | voyelle | `d'` |
| `Henri Alfandari` | h muet | `d'` |
| `Hervé Saulignac` | h muet | `d'` |
| `Hubert Ott` | h muet | `d'` |
| `Ian Boucard` | son y | `de` |
| `Olivier Fayssat` | voyelle | `d'` |

Les trois H sont muets, et aucun nom ne commence par un Y. « Ian » se dit comme « Yann » : « de Ian Boucard », comme l'écrit le compte rendu de l'Assemblée (choix d'UX). Annaïg Le Meur et Hervé Saulignac ne sont cités qu'au texte 14, qui n'est jamais révélé en 2.7e (§7.4). Ils restent au tableau, car le contrôle porte sur tout le fichier.

## 3. La trace de la version témoin (§9)

### 3.1 Principe

- **Une trace par partie.** Les trois parties témoins et chaque partie au hasard (§9) ont chacune leur trace : un fichier JSON par partie.
- **Deux auteurs, un seul schéma.**
  - **P** est la version témoin de la page. Son bloc de trace lit deux choses : les résultats du moteur, et ce que l'interface a lu (l'heure) ou affiché (les visages, le carnet). Il les écrit sans rien recalculer. Le moteur doit donc rendre ses grandeurs intermédiaires (x, c, ℓ, q, etc.) dans ses résultats, dans les deux versions de la page ; seul le bloc de trace les écrit, en fractions « p/q ». Un bloc qui recalculerait ces grandeurs ferait comparer deux copies du même calcul.
  - **C** est le programme de contrôle, écrit à part (§9). Il part du fichier scellé et du journal du harnais. Il ne lit jamais le code de la page, ni sa trace, sauf les durées (partie 4.2).
- **Entrées et sorties.**
  - Les entrées sont ce que le harnais joue ou fixe : l'en-tête `partie` ; pour chaque séance, `ouverture`, `versions`, `etapes`, `coups` et l'heure de chaque lecture d'« En attendant » ; pour chaque copie du carnet faite en cours d'essai, `k`, `coups`, `versions` et `etapes` à l'instant de la copie (partie 3.2) ; `arret` et `fin`.
  - Le harnais consigne ces entrées dans son **journal**. Le journal a la forme de la trace, réduite à ces champs (partie 3.12).
  - Tout le reste de la trace est une sortie.
  - Dans la trace de P, les entrées sont ce que la page a lu et gardé. Dans celle de C, ce sont les valeurs du journal. Les comparer prouve qu'aucun coup ne s'est perdu en route.
- **Horloge.** Le harnais fixe l'heure, dans le fuseau Europe/Paris, à deux moments : au premier toucher du joueur dans chaque séance (son « ouverture », §8.4), et avant chaque affichage d'« En attendant ». Il la tient immobile pendant cet affichage. L'heure que lit la page doit être celle qu'il a fixée, à la minute près.
- **Version de la page.** Le harnais choisit la construction qu'il sert à chaque chargement. Il en tient le numéro du programme de construction, qui l'écrit à côté du fichier construit, jamais du code de la page (§9, contrôle 13). Il consigne pour chaque séance la suite `versions` (partie 3.3), et pour chaque copie celle de l'instant de la copie (partie 3.2). La version du porteur et la version témoin d'une même construction portent le même numéro : elles ne diffèrent que par le bloc de trace (contrôle 5).
- **Deux modes.**
  - `interface` : la partie est jouée par l'interface, dans un navigateur sans tête. C'est le cas des parties témoins et d'au moins dix parties au hasard (§9).
  - `moteur` : la partie est rejouée par le moteur seul. C'est le cas des 200 parties au hasard.
  - En mode `moteur`, `carnet`, `versions`, `etapes` et toutes les durées valent `null`, et `copies` est vide. Le harnais donne au moteur les mêmes entrées qu'en mode `interface`, sauf `versions`, `etapes` et les copies, qui ne servent qu'au carnet.
- **Sortie de la trace.** Le harnais la lit dans le navigateur sans tête. La page ne l'envoie jamais (§8.8).
- **Relevés hors de la mémoire.** Deux choses de la trace ne sont pas dans ce que la page garde (§8.8) : les lectures d'« En attendant » (heure et visages) et les copies du carnet. Le bloc témoin les relève au moment où elles ont lieu, chargement par chargement.

  Le harnais demande au bloc témoin les relevés du chargement en cours avant chaque rechargement qu'il provoque (correctif, fermeture de l'app, « Reprendre ici »), et à la fin de la partie.

  La trace de P est celle que rend le bloc témoin au dernier chargement. Dans cette trace, `attente` de chaque séance et `copies` sont remplacés par la suite, dans l'ordre, des relevés de tous les chargements de la partie ; `attente` vaut `null` s'il n'y en a aucun. Le harnais met les relevés bout à bout, sans rien calculer ni modifier d'autre.

  Une partie dont la trace est comparée n'a aucun rechargement que le harnais ne provoque pas : l'arrêt brutal ne sert qu'au contrôle 14 (i).
- **Pseudo des joueurs témoins.** On choisit une chaîne qu'on ne risque pas de trouver par hasard ailleurs, sans espace et qui ne finit pas par un chiffre, par exemple « Témoin-b-4821-k ». Le contrôle 12 vérifie qu'elle n'apparaît pas dans le carnet. Pourquoi pas de chiffre final : le pseudo est inséré après les règles du §7.8. « Témoin-b-4821 décroche… » garderait une espace ordinaire après « 1 », et une ligne finissant par « 4821 » serait un faux défaut au contrôle 11.
- **Taille.** Une trace pèse de l'ordre de 100 à 300 Ko (estimation).

### 3.2 La partie

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-trace"` |
| `version` | entier | `3` |
| `empreinte_scelle` | hex64 | le SHA-256 du fichier scellé utilisé |
| `partie` | objet | écrit par le harnais. `id` : chaîne (`"a"`, `"b"`, `"c"`, `"hasard-001"`…). `mode` : `"interface"` ou `"moteur"`. `graine` : hex16 qui a servi à tirer les coups d'une partie au hasard, ou `null` pour une partie témoin. |
| `seances` | tableau | l'élément d'indice k est la séance k (partie 3.3), de 0 à 15, ou jusqu'à la séance de l'arrêt |
| `arret` | objet ou `null` | les entrées du parcours « Arrêter l'essai » (§8.10), partie 3.4 |
| `fin` | objet ou `null` | les réponses à F2 et à F1 à la clôture (§8.5), partie 3.4 |
| `agregats` | objet | calculés à la fin de la partie (partie 3.10) |
| `carnet` | objet ou `null` | `{"texte": chaîne}` (partie 3.10) |
| `copies` | tableau | copies du carnet faites en cours d'essai, depuis la confirmation de « Tout effacer » (§8.12), dans l'ordre ; vide sinon, et en mode `moteur`. Chaque copie vaut `{"k", "coups", "versions", "etapes", "mesures", "texte"}` : `k`, la séance ; `coups` (partie 3.4), `versions` et `etapes` (partie 3.3), entrées, tels qu'au toucher « Copier mon carnet d'abord » ; `mesures` (partie 3.10), à ce même toucher ; `texte`, le texte copié. P les écrit à ce toucher, d'après ce que la page a gardé à cet instant ; le harnais les relève avant tout rechargement (partie 3.1, « Relevés hors de la mémoire »). Le journal du harnais porte, pour chaque copie, `k`, `coups`, `versions` et `etapes` (partie 3.12). |

### 3.3 La séance

| Clé | Type | Présente quand (sinon `null`) | Contenu |
|---|---|---|---|
| `k` | entier | toujours | numéro de séance |
| `ouverture` | instant | toujours | entrée : l'heure du premier toucher du joueur dans la séance (aux séances 3 à 14, le toucher du message de 18h), pas l'affichage qui suit « Aller au jour suivant » (§8.4) |
| `versions` | tableau d'entiers | toujours en mode `interface` ; `null` en mode `moteur` | entrée : la valeur {version} de la ligne « Version de la page » du carnet (§8.12) : le numéro de version de la page sous lequel la séance a été ouverte (premier toucher, §8.4), puis, chaque fois qu'un toucher compté dans la durée de la séance (§8.4) a lieu sous un autre numéro que le dernier du tableau, ce numéro. Le plus souvent un seul élément, par exemple `[1]`. Une séance affichée par une version mais ouverte sous la suivante n'a que la suivante. |
| `etapes` | objet | séances 1 à 14 en mode `interface` | entrée : `{"deviner": booléen, "repondre": booléen}`. `deviner` : l'écran Deviner (2.1) a été affiché avec au moins une carte pendant la séance (jamais un jour 5.12, §8.12) ; `repondre` : l'écran Répondre (2.3) a été affiché. Le harnais les consigne d'après ce qu'il a vu ; la page, d'après ce qu'elle a affiché. Ils fixent la présence de `duree_deviner` et `duree_repondre` (partie 3.10). `null` aux séances 0 et 15, où ces durées n'existent pas, et en mode `moteur`. |
| `coups` | objet | toujours | entrée (partie 3.4) |
| `entree` | objet | séance 0 | partie 3.5 |
| `revelation` | objet | séances 3 à 15 | partie 3.7 |
| `manches` | objet | séances 2 à 14 | clé = devineur (membre) → manche (partie 3.6). Une clé pour le porteur, qui a toujours une manche, même s'il passe la séance. Une clé pour chaque personnage présent ce jour-là. |
| `phrase_jour` | objet | séances 1 à 14, si le joueur a répondu | partie 3.8 |
| `attente` | objet | quand « En attendant » a été affiché | partie 3.8 |
| `dimanche` | objet | séances 7 et 14 | partie 3.9 |
| `portrait` | objet | toujours | partie 3.8 (état en fin de séance) |
| `curseurs_vus` | objet | toujours | partie 3.8 |
| `surprises_proches` | objet | toujours | partie 3.8 |
| `mesures` | objet | toujours | partie 3.10 |

Une séance atteinte a toujours son entrée (règles de calendrier, §0). À la séance d'un arrêt, `versions`, `etapes`, `coups`, `phrase_jour`, `attente` et `mesures` décrivent ce qui a eu lieu avant l'arrêt ; `ouverture`, `manches`, `revelation`, `dimanche`, `portrait`, `curseurs_vus` et `surprises_proches` suivent le calendrier (un texte est révélé dès que la séance n+2 est atteinte, lu ou non).

### 3.4 Les coups (entrées)

Le champ `seances[k].coups` contient :

| Clé | Type | Présente quand (sinon `null`) | Contenu |
|---|---|---|---|
| `pseudo` | chaîne | séance 0, après l'écran 1.8 | le pseudo tapé |
| `consentement` | booléen | séance 0, une fois la carte 1.3 acceptée | `true` |
| `entree` | objet | séance 0 | clés E1, E2, E3 → `{"reponse": {"niveau", "raison"} ou null, "pari": niveau ou null}`. `pari` est la position devinée pour l'inviteuse. |
| `deviner` | tableau | séances 2 à 14 | une entrée par carte servie, dans l'ordre d'affichage : `{"designe": personnage, "passe" ou null, "raison": raison ou null}` |
| `relire` | entier | toujours | nombre de touchers sur « Relire » |
| `reponse` | objet | séances 1 à 14, si le joueur a répondu | `{"niveau", "raison"}` |
| `carnet` | objet | toujours | `{"q1", "q2", "q3"}`, codes ci-dessous. Chaque valeur vaut `null` si la question n'a pas été posée ou n'a pas reçu de réponse. |

- `designe` :
  - c'est le visage choisi ;
  - il vaut `"passe"` pour une carte marquée « Passée » au moment de « Valider » ;
  - il vaut `null` pour une carte laissée sans attribution quand le joueur passe au jour suivant, et pour toute carte d'une manche non validée, attribuée ou passée (seul « Valider » enregistre la manche, §7.1). Cette carte compte alors comme passée (§8.2).
- `raison`, dans `deviner`, est la raison devinée. Elle ne figure que sur la carte à raison cachée. Elle vaut `null` sur les autres cartes, ou si le joueur ne l'a pas tentée.
- Une position sans raison n'est pas une réponse : `reponse` vaut alors `null` (§8.2).
- Dans une partie jouée par le harnais, une attribution ou une passe n'est jamais défaite. La trace donne l'état final, et le nombre de « Passer » se lit sans ambiguïté.
- Dans une copie (partie 3.2), `coups` donne l'état au toucher de la copie, et non l'état final : toute carte d'une manche pas encore validée y a `designe` à `null` (seul « Valider » enregistre la manche, §7.1), une réponse pas encore validée y vaut `null`, une question du carnet pas encore répondue aussi ; `relire` y compte les touchers faits avant la copie.

Codes des réponses :

| Champ | Codes |
|---|---|
| `q1` | `"aurais_pu"`, `"ne_pouvais_pas"`, `"les_deux"` |
| `q2` | `"premier_coup"`, `"en_relisant"`, `"pas_tout"` |
| `q3` | `"revelation"`, `"titres"`, `"phrase_semaine"`, `"deviner"`, `"donner_avis"`, `"phrase_jour"`, `"aucun"`. Seuls les choix proposés à cette séance sont permis (§8.3). |
| raison d'arrêt | `"pas_amuse"`, `"pas_compris"`, `"pas_le_temps"`, `"vu_assez"`, `"autre"` |
| F2 | `"de_plus_en_plus"`, `"toujours_autant"`, `"de_moins_en_moins"`, `"jamais"` |
| F1 (une case) | `"pole0"`, `"milieu"`, `"pole1"` : le rond de gauche, du milieu ou de droite |

Libellés correspondants, tels qu'écrits sur les boutons et recopiés dans le carnet (§8.12) :

| Code | Libellé |
|---|---|
| `aurais_pu`, `ne_pouvais_pas`, `les_deux` | « J’aurais pu trouver », « Je ne pouvais pas trouver », « Les deux » |
| `premier_coup`, `en_relisant`, `pas_tout` | « Compris du premier coup », « Compris en relisant », « Pas tout compris » |
| `revelation`, `titres`, `phrase_semaine`, `deviner`, `donner_avis`, `phrase_jour`, `aucun` | « La révélation », « Les titres », « Ma phrase de la semaine », « Deviner », « Donner mon avis », « Ma phrase du jour », « Aucun » |
| `pas_amuse`, `pas_compris`, `pas_le_temps`, `vu_assez`, `autre` | « Je ne m’amuse pas », « Je ne comprends pas tout », « Je n’ai pas le temps », « J’ai vu ce que je voulais voir », « Autre raison » |
| `de_plus_en_plus`, `toujours_autant`, `de_moins_en_moins`, `jamais` | « De plus en plus amusant », « Toujours aussi amusant », « De moins en moins amusant », « Jamais amusant » |

Entrées au niveau de la partie :
- `arret` vaut `{"k": entier, "raison": code ou null, "f2": code ou null, "f1": objet ou null}` ;
- `fin` vaut `{"f2": code ou null, "f1": objet ou null}` ;
- un objet F1 a une clé par personnage. Chacune mène à un objet qui a une clé par tension, dont la valeur est un code F1 ou `null` (case laissée vide).

### 3.5 L'entrée (séance 0)

`seances[0].entree` vaut `{"textes": {...}, "justes": entier}`. L'objet `textes` a trois clés, E1, E2 et E3. Chacune vaut `{"inviteuse": {"niveau", "raison"}, "juste": booléen ou null}`.

- `inviteuse` est la réponse d'Agathe, lue dans le fichier scellé.
- `juste` dit si le pari est du même côté que la réponse d'Agathe : défavorable, neutre ou favorable (D-011). Il vaut `null` sans pari.
- `justes` est le nombre de paris justes. Il fait le bilan de l'écran 1.7.

### 3.6 Une manche de Deviner

Le champ `seances[k].manches.<devineur>` décrit la manche jouée à la séance k, sur le texte k−1. Il contient :

| Clé | Type | Contenu |
|---|---|---|
| `texte` | texte | k−1 |
| `possibles` | objet | clé = auteur (membre) → grandeurs ci-dessous. Objet vide si personne d'autre n'a répondu (écran 5.12 pour le porteur). |
| `mediane` | fraction ou `null` | §4.2 du fichier caché ; `null` si `possibles` est vide |
| `classement` | tableau de membres | §4.3 du fichier caché, étape 1 |
| `departages` | entier | nombre de groupes, dans `classement`, d'au moins deux auteurs dont la surprise est exactement égale |
| `remplacements` | tableau | §4.3 du fichier caché, étape 3, dans l'ordre où ils ont lieu : `{"place": 1 à 3, "ecartee": membre, "remplacante": membre}` |
| `places` | tableau de membres | après les remplacements ; l'indice 0 est la place 1 |
| `raison_cachee` | membre ou `null` | l'auteur d'origine de la carte à raison cachée (§4.4 du fichier caché) |
| `ordre` | tableau de membres | l'ordre d'affichage (§4.5) |
| `cartes` | tableau | dans l'ordre d'affichage (tableau ci-dessous) |
| `rangs` | objet ou `null` | pour un devineur personnage : clé = candidat → entier de 1 à 4 (§3, point 4, du fichier caché). `null` pour le porteur. |
| `cotes_attendus` | objet ou `null` | pour un devineur personnage : clé = candidat → côté, ou `"inconnu"` (§3, point 2, du fichier caché). `null` pour le porteur. |
| `curseur_porteur` | objet ou `null` | pour un devineur personnage : `{"somme_w", "c"}`, en fractions (§3, point 2, du fichier caché). `c` est le centre du §5.2, avant tout alignement sur le sens du texte ; l'alignement ne se lit que dans `cotes_attendus.porteur`. Si `somme_w` vaut « 0 », `c` vaut « 1/2 » et le côté attendu est `"inconnu"`. `null` pour le porteur. |
| `total` | entier ou `null` | pour un devineur personnage : §3, point 4, du fichier caché. `null` pour le porteur. |

Chaque entrée `possibles.<auteur>` contient :

| Clé | Type | Contenu |
|---|---|---|
| `niveau`, `raison` | niveau, raison | la réponse de l'auteur à ce texte |
| `somme_w` | fraction | Σ w du curseur de l'auteur, sur la tension du texte |
| `x`, `c`, `l`, `q`, `distance`, `rarete`, `surprise` | fractions | les grandeurs du §4.2 du fichier caché, sous ces noms. `l` est ℓ, la lettre L minuscule. |

Chaque carte `cartes[i]` contient :

| Clé | Type | Contenu |
|---|---|---|
| `auteur` | membre | l'auteur d'origine |
| `auteur_compte` | membre | l'auteur après redistribution des cartes identiques (§4.3 du fichier caché, étape 4). Hors de ce cas, il est égal à `auteur`. |
| `cachee` | booléen | vrai pour la carte à raison cachée |
| `designe` | membre, `"passe"` ou `null` | pour le joueur, recopié de ses coups ; pour un personnage, le candidat qu'il attribue |
| `raison_devinee` | raison ou `null` | sur la carte à raison cachée seulement. `null` sur les autres cartes, ou si elle n'a pas été tentée. |

### 3.7 La révélation

`seances[k].revelation` existe pour k = 3 à 15 ; elle porte sur le texte k−2. Elle vaut `{"texte": texte, "devineurs": {...}}`. L'objet `devineurs` a une clé par membre qui a joué une manche sur ce texte (à la séance k−1). Chaque clé contient :

| Clé | Type | Contenu |
|---|---|---|
| `justes` | tableau de booléens | une valeur par carte, dans l'ordre d'affichage : vrai si `designe` est égal à `auteur_compte` |
| `raison_trouvee` | booléen ou `null` | vrai si la personne et la raison sont justes sur la carte à raison cachée ; `null` s'il n'y a pas de carte |
| `points` | entier | les points du jour (§6, point 1) |
| `points_semaine` | entier ou `null` | le total de la semaine après cette révélation ; `null` pour le texte 13, qui est hors semaine |
| `verdicts` | tableau ou `null` | pour le porteur seulement, un verdict par carte (codes ci-dessous). `null` pour un personnage. |

Codes des verdicts :
- `"juste_et_raison"` : « Tu connais ton monde, et ses raisons. » ;
- `"juste"` : « Tu connais ton monde. » ;
- `"faux"` : « Ça alors ! » ;
- `"passe"` : « Tu avais passé. ».

### 3.8 Phrase du jour, « En attendant », portrait

`phrase_jour` est calculée après la réponse au texte k. Elle contient :

| Clé | Type | Contenu |
|---|---|---|
| `texte` | texte | k |
| `classe` | `"arbitrage"`, `"penchant"`, `"tiraille"` ou `"neutre"` | §5.1 |
| `w` | fraction | `"1"`, `"1/2"` ou `"0"` |
| `pole` | 0, 1 ou `null` | π quand w > 0 ; `null` sinon |
| `phrase` | chaîne | la phrase affichée, exacte (§5.6) |

`attente` vaut `{"lectures": [...]}`, avec une lecture par affichage d'« En attendant », dans l'ordre. Chaque lecture contient :

| Clé | Type | Contenu |
|---|---|---|
| `heure` | heure | l'heure lue (c'est une entrée) |
| `visages` | tableau de personnages | la ligne « Déjà joué aujourd'hui », dans l'ordre des visages. Le tableau est vide quand la ligne disparaît (§7.5). |

On calcule en minutes : r(m) = (m − 1080 + 1440) mod 1440. Un personnage figure dans la ligne s'il a répondu au texte k et si r(son heure de jeu) ≤ r(heure lue).

`portrait` décrit le portrait du joueur en fin de séance :

| Clé | Type | Contenu |
|---|---|---|
| `tensions` | objet, une clé par tension (S, P, T, L) | `{"somme_w", "c", "l", "net"}` : Σ w, c et ℓ en fractions (§5.2), et `net`, un booléen |
| `ordre_moi` | tableau des 4 tensions | l'ordre de l'écran Moi (§5.3) |

`curseurs_vus` donne, pour chaque personnage puis chaque tension, `{"somme_w", "c", "l"}`. Ce sont les curseurs des personnages tels que le joueur peut les voir à cette séance : réponses d'entrée et textes ≤ k−2 (§5.4).

`surprises_proches` donne, pour chaque personnage, un tableau de textes, le plus récent d'abord. Ce sont les lignes de « Ses surprises » (§7.7) après la révélation de la séance.

### 3.9 Le dimanche (séances 7 et 14)

| Clé | Type | Contenu |
|---|---|---|
| `semaine` | entier 1 ou 2 | |
| `sans_faute` | tableau de membres | les titulaires du Sans-Faute (§6, point 6). Vide en semaine 1. |
| `pas_de_cote` | tableau de membres | §6, point 7. On l'attend vide pendant l'essai. |
| `devin` | objet | `titulaire` : membre ou `null`. `points` et `raisons` : clé = membre (les cinq) → entier. `departage` : `"aucun"`, `"raisons"` ou `"tirage"`. |
| `mystere` | objet | `titulaire` : membre ou `null`. `tentatives` et `erreurs` : clé = membre (les cinq) → entier. `departage` : `"aucun"`, `"erreurs"` ou `"tirage"`. |
| `fidele` | objet | `titulaires` : tableau de membres |
| `surprise` | objet | `texte` : texte ou `null`. `attributions` et `erreurs` : clé = texte révélé dans la semaine → entier. `departage` : `"aucun"`, `"erreurs"` ou `"tirage"`. |
| `phrase_semaine` | objet | `poids` : clé = tension (les quatre tensions) → `{"pole0", "pole1", "comptent"}`, où `pole0` et `pole1` sont des fractions et `comptent` un entier. `tension` : tension ou `null`. `cas` : `"nette"`, `"difference"`, `"egalite"` ou `"floue"`. `phrase` : la phrase affichée, exacte (§5.7). |

- `departage` dit comment le titulaire a été désigné. Il vaut `"aucun"` si le titulaire était seul en tête, ou s'il n'y a pas de titulaire.
- Pour Le Devin, `raisons` compte les raisons cachées trouvées.
- Pour Le Mystère, tentatives et erreurs s'entendent au sens du §6, point 3.
- Pour la surprise de la semaine, `attributions` ne compte pas les passes.

### 3.10 Mesures, agrégats, carnet

`mesures` existe à chaque séance (§8.4), et dans chaque copie du carnet, où il donne l'état au toucher de la copie (partie 3.2). Le jour et l'heure d'ouverture sont dans `ouverture`.

| Clé | Type | Contenu |
|---|---|---|
| `jours_ecoules` | entier ou `null` | depuis la séance précédente (partie 6, point 3). `null` à la séance 0. |
| `duree_seance`, `duree_deviner`, `duree_repondre` | entier ou `null` | en secondes entières, tronquées, en ne comptant que le temps où l'app « Essai » est au premier plan (§8.4) ; `duree_seance` de l'ouverture au dernier toucher de la séance, « Aller au jour suivant » ou le toucher qui confirme « Arrêter l'essai » compris (§8.4) ; `duree_deviner` du premier affichage de l'écran Deviner (2.1) au dernier toucher fait pendant qu'il est affiché, « Oui, continuer » de la confirmation compris (§8.4) ; `duree_repondre` de l'affichage de l'écran Répondre à la raison validée ou, à défaut, au dernier toucher « Oui, continuer » de la confirmation (§8.12) ; à l'arrêt et à la clôture, une durée encore ouverte s'arrête comme le dit le §8.12. Dans une copie, la valeur au toucher de la copie (§8.12). Présence, en mode `interface` : `duree_seance` est un entier à chaque séance et dans chaque copie ; `duree_deviner` est un entier si et seulement si `etapes.deviner` est vrai ; `duree_repondre` est un entier si et seulement si `etapes.repondre` est vrai (règle de Game design et UX, §8.12). En mode `moteur`, toutes valent `null`. Leur valeur n'est jamais comparée ; leur présence l'est (partie 4.2). |
| `relire` | entier | les touchers sur « Relire », comptés par la page |
| `passer` | entier | le nombre de cartes de `coups.deviner` dont `designe` vaut `"passe"` ; une carte laissée sans attribution n'y entre pas |
| `revelation_verdicts` | tableau ou `null` | les verdicts de la manche du joueur révélée à cette séance (jouée à la séance précédente), dans l'ordre d'affichage : codes de la partie 3.7 ; `null` s'il n'y a pas de révélation ; tableau vide si la manche était vide (5.12) |
| `revelation_raison_tentee` | booléen ou `null` | sur cette même manche : la raison cachée a-t-elle été tentée ; `null` s'il n'y avait pas de carte à raison cachée |

`agregats` couvre l'ensemble de la partie (§8.4). Chaque chiffre vaut `null` tant que le joueur a répondu à moins de 5 des textes révélés (seuil du §8.4, confirmé par Juridique) ; `justesse_personnages_sur_porteur` vaut aussi `null` si aucune carte du joueur n'a été servie à un personnage.

| Clé | Type | Définition (Game design) |
|---|---|---|
| `justesse_personnages_entre_eux` | objet `{"justes": entier, "total": entier}` ou `null` (comptes bruts, non réduits, pour le carnet) | cartes des manches des personnages dont `auteur_compte` est un personnage, attribuées juste, sur ces mêmes cartes ; manches révélées seulement |
| `justesse_personnages_sur_porteur` | objet `{"justes": entier, "total": entier}` ou `null` | la même chose pour les cartes dont `auteur_compte` est le porteur ; le carnet la donne en comptes bruts (§8.12) |
| `titres_tires_au_sort` | entier ou `null` | nombre de titres (Devin, Mystère, surprise ; semaines 1 et 2) dont `departage` vaut `"tirage"`, de 0 à 6 |

Les chiffres qui ne dépendent que du fichier scellé (réponses atypiques, cartes identiques, raisons « aucune », égalités de classement dans la manche du porteur) ne sont pas dans la trace : ils vont au rapport de scellement (§9).

Un compte dont le total serait nul (aucune carte) vaut `null`.

`carnet.texte` est le texte exact que « Copier mon carnet » a donné à la fin de la partie (clôture ou arrêt), jusqu'à « Fin du carnet » compris. Son format est au §8.12. Sa ligne « Version de la page » vient de `versions`, séance par séance (partie 3.3). Une copie en cours d'essai (`copies[].texte`) suit le même format ; le bloc de sa séance vient des `coups`, `versions` et `mesures` de la copie, et non de ceux de la séance, qui ont pu changer ensuite.

### 3.11 Exemple

Voici six fragments, mis en retrait. Chacun est du JSON valide pris isolément. Les valeurs sont inventées (voir l'avertissement en tête).

Fragment 1. Les coups de la séance 9, `seances[9].coups` :

```json
{
  "carnet": {"q1": "aurais_pu", "q2": "premier_coup", "q3": "deviner"},
  "consentement": null,
  "deviner": [
    {"designe": "Thomas", "raison": null},
    {"designe": "Paul", "raison": 1},
    {"designe": "passe", "raison": null}
  ],
  "entree": null,
  "pseudo": null,
  "relire": 1,
  "reponse": {"niveau": 4, "raison": 2}
}
```

Fragment 2. Les cartes de la même manche, `seances[9].manches.porteur.cartes` :

```json
[
  {"auteur": "Thomas", "auteur_compte": "Thomas", "cachee": false, "designe": "Thomas", "raison_devinee": null},
  {"auteur": "Hugo", "auteur_compte": "Hugo", "cachee": true, "designe": "Paul", "raison_devinee": 1},
  {"auteur": "Paul", "auteur_compte": "Paul", "cachee": false, "designe": "passe", "raison_devinee": null}
]
```

Fragment 3. Sa révélation à la séance suivante, `seances[10].revelation`. Dans une vraie trace, `devineurs` a aussi une clé pour chaque personnage qui a joué sur ce texte.

```json
{
  "devineurs": {
    "porteur": {
      "justes": [true, false, false],
      "points": 1,
      "points_semaine": 3,
      "raison_trouvee": false,
      "verdicts": ["juste", "faux", "passe"]
    }
  },
  "texte": "8"
}
```

Fragment 4. Une entrée de `possibles`, prise dans une autre manche, avec des valeurs sans cohérence voulue :

```json
{"c": "3/5", "distance": "1/3", "l": "22/25", "niveau": 2, "q": "2/7", "raison": "aucune", "rarete": "1/8", "somme_w": "1", "surprise": "5/12", "x": "1/4"}
```

Fragment 5. Un extrait de la séance 9. Seule la tension T du portrait est montrée.

```json
{
  "attente": {"lectures": [{"heure": "09:00", "visages": ["Hugo"]}]},
  "etapes": {"deviner": true, "repondre": true},
  "mesures": {"duree_deviner": 41, "duree_repondre": 37, "duree_seance": 118, "jours_ecoules": 1, "passer": 1, "relire": 1, "revelation_raison_tentee": false, "revelation_verdicts": ["juste", "faux", "passe"]},
  "ouverture": "2026-10-21T08:52+02:00",
  "phrase_jour": {"classe": "penchant", "phrase": "Aujourd’hui, tu as penché vers le changement.", "pole": 1, "texte": "9", "w": "1/2"},
  "portrait": {
    "ordre_moi": ["T", "S", "P", "L"],
    "tensions": {"T": {"c": "8/13", "l": "31/40", "net": false, "somme_w": "5/2"}}
  },
  "versions": [1]
}
```

Fragment 6. Une copie faite à la séance 9, `copies[0]`, pendant Deviner, avant « Valider » et avant tout « Relire ». Comparée aux fragments 1 et 5 (état final de la même séance), elle garde l'état du moment : la manche n'étant pas validée, aucune de ses cartes n'a de `designe` (seul « Valider » enregistre la manche, §7.1). Le texte est abrégé ici ; le vrai est le carnet entier.

```json
{"coups": {"carnet": {"q1": null, "q2": null, "q3": null}, "consentement": null, "deviner": [{"designe": null, "raison": null}, {"designe": null, "raison": null}, {"designe": null, "raison": null}], "entree": null, "pseudo": null, "relire": 0, "reponse": null}, "etapes": {"deviner": true, "repondre": false}, "k": 9, "mesures": {"duree_deviner": 12, "duree_repondre": null, "duree_seance": 40, "jours_ecoules": 1, "passer": 0, "relire": 0, "revelation_raison_tentee": false, "revelation_verdicts": ["juste", "faux", "passe"]}, "texte": "Carnet de l’essai Elenchos\n…\nFin du carnet", "versions": [1]}
```

### 3.12 Le journal du harnais et le fichier des durées

**Le journal.** Il y en a un par partie, en JSON canonique (partie 1.1). Il a la forme de la trace, réduite aux entrées.

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-journal"` |
| `version` | entier | `3`, comme la trace (partie 5) |
| `empreinte_scelle` | hex64 | le SHA-256 du fichier scellé embarqué par la page, pris dans le rapport du programme de construction |
| `partie` | objet | comme dans la trace (partie 3.2) |
| `seances` | tableau | l'élément d'indice k vaut `{"k", "ouverture", "versions", "etapes", "coups", "attente"}`, avec les types et les règles de présence des parties 3.3 et 3.4. `attente` vaut `{"lectures": [{"heure"}, …]}` (une lecture par affichage d'« En attendant », sans `visages`), ou `null` s'il n'y a eu aucun affichage. |
| `copies` | tableau | une entrée `{"k", "coups", "versions", "etapes"}` par copie, dans l'ordre ; vide en mode `moteur` |
| `arret`, `fin` | objet ou `null` | comme dans la trace (partie 3.4) |

Le journal n'a aucune autre clé. Qui l'écrit :
- pour une partie jouée par l'interface, le harnais, au fil du jeu ;
- pour une partie rejouée par le moteur, le harnais, avant de la jouer ;
- pour un carnet de référence, son auteur, à la main.

**Le fichier des durées.** Le programme de contrôle ne lit de la trace de P que ses durées (partie 4.2). Il les reçoit dans un fichier à part :

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-durees"` |
| `version` | entier | `1` |
| `partie` | chaîne | le `partie.id` de la partie |
| `seances` | tableau | par séance, dans l'ordre : `{"k", "duree_seance", "duree_deviner", "duree_repondre"}` |
| `copies` | tableau | par copie, dans l'ordre de `copies` : les mêmes quatre clés |

D'où vient ce fichier :
- pour une partie jouée par l'interface, le programme de contrôle l'extrait lui-même de la trace de P ; sa commande `durees` ne lit que les clés `k` et `duree_*` ;
- pour un carnet de référence, son auteur l'écrit à la main ;
- en mode `moteur`, il n'y en a pas.

**Validité du journal.** Le programme de contrôle vérifie le journal avant de le rejouer. Un journal qui enfreint l'une de ces règles n'est pas rejoué : le rapport donne la règle et le chemin (JSON Pointer). C'est un défaut du harnais, ou de la page qui a permis le geste ; le Vérificateur tranche. Front-end confirme ces règles : il dit si l'interface permet un geste qu'elles refusent.
1. **Forme.** Partie 1.1 et ce tableau ; `version` vaut 3 ; `empreinte_scelle` est le SHA-256 du fichier scellé donné au programme.
2. **Partie.**
   - Partie témoin : `id` est une lettre minuscule et `graine` vaut `null`.
   - Partie au hasard : `id` vaut `hasard-` suivi de trois chiffres, et `graine` est une hex16.
   - En mode `moteur`, `versions` et `etapes` valent `null` et `copies` est vide. En mode `interface`, ils suivent les parties 3.2 et 3.3.
3. **Calendrier.** Les séances vont de 0 à K, sans trou. Exactement l'un de `fin` et `arret` n'est pas `null`. `fin` n'existe que si K = 15 ; sinon, `arret.k` = K.
4. **Ouvertures.** Chaque instant existe à Paris avec ce décalage. Le 25 octobre 2026, 02:30+02:00 et 02:30+01:00 existent tous deux ; une heure locale sautée au passage à l'heure d'été n'existe pas. Aucune ouverture n'est antérieure à la précédente.
5. **Versions.** Ce sont des entiers d'au moins 1, strictement croissants dans une séance. Le premier d'une séance n'est pas inférieur au dernier de la précédente. La page, elle, écrit le numéro qu'elle porte, même s'il est plus ancien que le précédent (une app restée ouverte, un cache) : ce cas ne se produit pas dans les journaux du harnais, qui choisit lui-même la construction servie (Front-end).
6. **Entrée.**
   - `pseudo` est non vide, en NFC, sans caractère de contrôle ; sa longueur suit la règle d'UX (§7.2).
   - E1, E2 et E3 se jouent dans l'ordre : un texte n'a une réponse que si le précédent a sa réponse et son pari.
   - Un pari n'existe qu'avec une réponse.
   - `consentement` vaut `true` dès qu'une réponse existe.
   - `pseudo` n'existe qu'après les trois paris.
   - Toute séance k ≥ 1 suppose `pseudo` non nul : l'entrée ne se quitte que par 1.9 ou par l'arrêt (§8.2).
7. **Deviner** (séances 2 à 14).
   - `deviner` a autant d'éléments que de cartes servies au joueur ce jour-là (partie 3.6).
   - Un personnage y est désigné au plus une fois (écran 2.1 : « une personne par réponse »).
   - `raison` n'est non nulle que sur la carte à raison cachée, et seulement si sa `designe` est un personnage.
   - Si une `designe` vaut `null`, la manche n'a pas été validée : toutes ses `designe` et `raison` valent `null`.
8. **Répondre.** `reponse` n'est non nulle que si la manche du jour est validée ou vide (séance 1, écran 5.12) : Répondre ne s'ouvre qu'après Deviner (§8.2).
9. **Relire.** `relire` vaut 0 hors des séances 2 à 14.
10. **Carnet du jour.**
    - q1, q2 et q3 ne dépendent jamais de `reponse` (§8.3, §8.4) :
      - à la séance 0, ils ne sont non nuls que si `pseudo` est non nul ;
      - aux séances 1 à 14, ils peuvent l'être que la journée soit finie ou non ; q2 seulement si `etapes.repondre` est vrai ;
      - à la séance 15, seule q1 peut l'être.
    - q1 suppose au moins un « Ça alors ! » à la révélation de la séance (à la séance 0 : un pari faux), et `"les_deux"` en suppose au moins deux.
    - q2 n'existe pas à la séance 15.
    - q3 est l'un des choix proposés à cette séance (§8.3 ; règle d'UX sur les « moments vécus »).
11. **Attente.** `attente` n'est non nulle qu'aux séances 1 à 14 dont la journée est finie, puisque 2.5 ne s'affiche qu'alors (§7.1). Elle a alors au moins une lecture.
12. **Étapes** (mode `interface`).
    - `etapes` vaut `null` aux séances 0 et 15.
    - À la séance 1, `deviner` est faux.
    - `deviner` est vrai dès qu'une `designe` est non nulle ; `repondre` est vrai dès que `reponse` est non nulle.
13. **Arrêt et fin.**
    - `arret.f2` et `arret.f1` valent `null` si `arret.k` < 3.
    - Un objet F1 a les quatre personnages, et pour chacun les quatre tensions.
    - `fin.f1` est toujours un objet : la clôture n'a pas « Sauter cette question » (§7.4).
    - Les codes sont ceux de la partie 3.4.
14. **Copies.**
    - `k` va de 0 à K, sans dépasser 14 : une copie en cours d'essai ne peut pas avoir lieu à la clôture (§8.12) ; les copies sont dans l'ordre du jeu.
    - Le harnais ne défait jamais un geste (partie 3.4). Donc chaque `designe`, `raison` ou `reponse` non nulle d'une copie se retrouve, identique, dans les coups de sa séance (une copie faite avant « Valider » n'a que des `null` dans `deviner` : règle 7, fragment 6).
    - `relire` y est au plus égal à celui de la séance.
    - `versions` de la copie est un début de `versions` de la séance.
    - Un `etapes` vrai dans la copie l'est aussi dans la séance.
    - Les réponses au carnet du jour ne sont pas comparées : le joueur peut changer de choix.

## 4. Vérifications et comparaison

### 4.1 Le fichier scellé (contrôle 1)

Le programme de contrôle fait ces vérifications dans l'ordre, avant tout autre calcul. Le premier échec arrête le contrôle (§0).

Une étape dont l'entrée n'existe pas encore est « non faite », jamais « passée », et le rapport le dit étape par étape. C'est le cas de l'étape 1 tant que l'empreinte n'est pas publiée, et de l'étape 2 tant que la page n'est pas construite. Sur le fichier candidat (carnets de référence, réglage du §9 bis du fichier caché), les étapes 3 à 8 et les contrôles 2 à 4 se font donc en entier, et les étapes 1 et 2 restent non faites.

Le contrôle 1 n'est complet que si ses huit étapes sont passées. L'étape 1 se fait après la publication de l'empreinte ; l'étape 2, à chaque construction de la page (§9, « Correctif »).

L'empreinte publiée est donnée au programme telle qu'elle est présentée : 16 groupes de 4 sur 4 lignes (§8.11). Il en retire les espaces U+0020 et les retours à la ligne U+000A, et rien d'autre. Il doit rester 64 chiffres hexadécimaux minuscules.

1. **Empreinte.** Le SHA-256 des octets du fichier est égal à l'empreinte publiée : 64 chiffres hexadécimaux minuscules, présentés comme au §8.11.
2. **Données embarquées.** Le programme de construction écrit le fichier scellé dans le bloc de script sous une seule forme : le repère ASCII `/*elenchos-scelle*/`, aussitôt suivi d'un guillemet droit `"`, puis du base64 des octets du fichier scellé (alphabet standard de la RFC 4648, avec les « = » de fin, sans retour à la ligne), puis d'un second `"`.

   Le programme de contrôle calcule lui-même ce base64. Il vérifie dans les octets du fichier construit de la version du porteur (celui que reçoit la branche `gh-pages`, D-019) que le repère apparaît exactement une fois, et qu'il est suivi exactement de cette suite. Il ne lit rien d'autre du fichier : il ne lit pas le code de la page (partie 3.1).

   Les deux autres vérifications sont ailleurs : que le script décode bien cette chaîne relève du contrôle 5 ; que la page servie soit ce fichier construit relève du §8.8 et du contrôle 14.
3. **Forme.** Le fichier est en UTF-8 strict. Relu puis remis en forme canonique, il redonne exactement les mêmes octets. Ce seul test attrape un espace en trop, une clé en double, des clés mal ordonnées, un échappement inutile et un nombre mal écrit.
4. **Schéma.**
   - Le schéma est fermé (partie 1.1). Types et valeurs sont permis.
   - `format` vaut `"elenchos-essai-scelle"` et `version` vaut `4`.
   - `auteur` a l'une des trois formes de la partie 2.3 : avec `type` égal à `"depute"` ou `"senateur"`, quatre clés ; avec `"gouvernement"`, la seule clé `type`.
   - Chaque `depute` a quatre clés : `elision`, `feminin`, `groupe` et `nom`.
   - Les chaînes sont en NFC. Chaque adresse (`lien_scrutin`, `sources`) passe `re.fullmatch(r"https://www\.assemblee-nationale\.fr(?:/(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*)+", adresse)`, c'est-à-dire :
     - https et l'hôte de l'Assemblée ;
     - de l'ASCII, sans espace ;
     - ni requête ni fragment ;
     - « % » toujours suivi de deux chiffres hexadécimaux.

     Toutes les adresses du lot ont cette forme.
   - Chaque `vote.date` désigne un jour qui existe au calendrier (ni « 2025-02-29 », ni « 2025-04-31 »), au plus tard le jour du scellement. Ce jour n'est pas dans le fichier : le programme de contrôle le reçoit en paramètre, recopié du rapport de scellement (§9).
5. **Cohérence interne.**
   - `textes` et `reponses` ont exactement les 17 clés ; `personnages`, `absences` et `reponses_atypiques` ont exactement les quatre prénoms.
   - Dans chaque texte, `rang` est égal à la place dans le tableau, et les quatre `groupe` sont différents (`projet.md` §8). Les sigles se comparent comme des chaînes : la partie 2.7 ne donne qu'une écriture à chaque groupe.
   - Le `texte` de chaque considération finit par « . », « ? » ou « ! », et n'a pas de guillemets à ses bords : ni son premier caractère, ni celui qui précède sa ponctuation finale (sans compter l'espace U+0020 qui précède « ? » ou « ! ») n'est l'un des caractères « (U+00AB), » (U+00BB), " (U+0022), “ (U+201C), ” (U+201D), ‹ (U+2039) ou › (U+203A).
   - Dans chaque `vote`, `issue` et `etape` forment une combinaison permise (partie 2.3) : `"adopte"` avec `"navette"` ou `"definitif"`, jamais sans étape ; `"rejete"` avec `"navette"` ou `"aucune"` ; `"sans_vote_ensemble"` avec `"aucune"`.
   - Un personnage a une réponse à un texte si et seulement si ce texte n'est pas dans ses absences. Les absences ne portent que sur des textes quotidiens.
   - Chaque réponse atypique désigne un texte quotidien où le personnage a une réponse.
   - Les fiches sont identiques au §1 (lecture : « Lecture des autres sources », plus bas). `cercle` vaut Amis et Agathe.
   - Pour chaque vecteur, `chaine` est égal à `graine` + « | » + `cle`, et `n` est la valeur de `hex8`.
   - **Groupes** (partie 2.7). Le programme lit le tableau et vérifie ses règles. Ensuite :
     - le `groupe` de chaque `auteur` de type `"depute"` et de chaque `depute` figure au tableau avec la chambre « Assemblée » ;
     - le `groupe` d'un `auteur` de type `"senateur"` y figure avec la chambre « Sénat » ;
     - chaque couple (chambre, sigle) du tableau sert au moins une fois dans le fichier.
   - **Initiales et élision** (partie 2.8).
     - Le premier caractère de chaque `nom` est une initiale permise.
     - Les `nom` des `depute` dont l'initiale demande un choix forment exactement l'ensemble des noms du tableau : pas un de plus, pas un de moins (chaînes comparées telles quelles, en NFC).
     - Dans chaque ligne du tableau, Forme et Initiale s'accordent : `d'` avec « voyelle » ou « h muet », `de` avec « h aspiré » ou « son y ».
     - Chaque `elision` est celle que donne la partie 2.8 : `false` si l'initiale du `nom` ne demande pas de choix ; sinon `true` si la Forme de sa ligne est `d'`, `false` si elle est `de`. Un orateur cité deux fois a donc deux fois la même valeur.
6. **Vecteurs de test.** On les recalcule à partir de `graine` ; ils doivent être identiques.
7. **Typographie simple** (§9, contrôle 1).
   - Chaînes concernées, les seules qui s'affichent telles quelles : `cercle.nom` et `cercle.inviteuse` ; dans chaque fiche, `metier`, `ville` et `ligne_de_vie` ; dans chaque texte, `titre`, chaque élément de `lignes`, le `nom` et le `groupe` de l'auteur et de chaque député, et le `texte` de chaque considération.
   - Ces chaînes ne contiennent ni U+2019, ni aucun caractère de la catégorie Unicode Zs autre que U+0020 (U+00A0, U+202F et U+2000 à U+200A compris : certaines polices de l'essai les dessinent trop larges, §8.8). « ? », « ! », « ; », « : », « » » et « % » y sont toujours précédés d'une espace U+0020, et « « » est toujours suivi d'une espace U+0020.
   - Toute espace placée entre deux chiffres appartient à un nombre écrit par tranches : un à trois chiffres, puis une ou plusieurs tranches faites d'une espace et de trois chiffres, sans chiffre juste avant ni juste après. « 30 000 » et « 1 500 000 » passent ; « en 2027 300 communes » et « 12 34 » sont refusés. Raison : la règle 6 du §7.8 reconnaît une tranche à ses trois chiffres ; ce contrôle garantit qu'elle ne colle jamais deux nombres. Un chiffre est un caractère de 0 à 9 : en Python, `[0-9]`, jamais `\d` (partie 1.2).
   - Toutes les autres chaînes ne sont pas concernées : codes, `vote.date`, `heure_de_jeu`, adresses, graine, vecteurs de test. Par exemple, « 07:40 » contient un « : » sans espace, et c'est normal.
8. **Fidélité aux fiches des textes** (§9, contrôle 1). Le programme de contrôle relit lui-même les fiches de `textes/` (S, P, T, L) et `textes/votes.md`, sans rien prendre au programme de scellement, puis compare. Raison : tension, sens et pôles sont annotés deux fois sur les fiches (annexe A de la simulation), mais recopiés une seule fois dans le fichier scellé ; tous les autres contrôles partent de cette copie et ne verraient pas une erreur de recopie.
   - **Lecture des fiches.** Une fiche commence à une ligne `### {texte} · scrutin {n} ({l}e législature)`, où {texte} va de E1 à E3 et de 1 à 14, {n} est un entier et {l} vaut 15, 16 ou 17. Elle finit à la ligne suivante qui commence par `### `, ou à la fin du fichier. Les autres lignes `### ` (réserves) sont ignorées. Chacun des 17 textes a exactement une fiche, dans l'un des quatre fichiers. Dans une fiche, le programme lit les lignes suivantes, chacune exactement une fois, et ignore toutes les autres :
     - `- Titre : {titre}` ;
     - `- Lignes :`, suivie d'exactement trois lignes `  1. {ligne}`, `  2. {ligne}`, `  3. {ligne}` ;
     - `- Auteur : Gouvernement`, suivi de ` (projet de loi).` ou de ` ;`, puis du reste de la ligne ;
     - ou `- Auteur : {nom}, {mandat}, {groupe}`, suivi de ` au dépôt (`, de ` ; ` ou de `. `, puis du reste de la ligne. {nom} ne contient pas de virgule. {mandat} vaut `député`, `députée`, `sénateur` ou `sénatrice`. {groupe} est la plus courte suite de caractères suivie de l'un de ces trois séparateurs : `Les Républicains au dépôt (` donne « Les Républicains » ;
     - `- Lien du scrutin : {adresse}` ;
     - `- Sources :`, suivie d'une ligne `  - {adresse}` par source, jusqu'à la première ligne qui ne commence pas par `  - ` ;
     - `- Tension : {tension} ; sens s = {s}`, où {s} vaut 0 ou 1 ;
     - `- Raisons :`, suivie d'exactement quatre lignes de la forme `  {i}. « {texte} » — {côté} · pôle {pôle} — {nom}, {député ou députée}, {groupe} [vote : …] — extrait : …`. {i} va de 1 à 4 dans cet ordre : c'est le numéro de fiche. {côté} vaut `pour` ou `contre`, et {pôle} vaut `0`, `1` ou `aucun`. {nom} ne contient ni virgule ni crochet. {groupe} s'arrête juste avant ` [vote : `.
   - **Lecture de `votes.md`.** Son seul tableau se lit comme en partie 2.7. Son en-tête est exactement « | Rang | Scrutin | `issue` | `date` | `etape` | Preuve principale | », et chaque ligne a six cellules. Une ligne dont le Rang n'est pas l'un des 17 textes est ignorée. Chacun des 17 a exactement une ligne. La cellule Scrutin s'écrit `{l}e, {n}`.
   - **Échecs.** Une ligne lue qui ne suit pas sa forme, un champ absent ou répété, une fiche absente ou en double : échec. Le programme ne devine jamais une forme ; Contenu garde ces formes (annexe A de la simulation).
   - **Comparaison**, texte par texte. Les chaînes sont comparées telles quelles, en NFC.
     - `titre`, `lignes` (dans l'ordre), `tension`, `sens` et `sources` (dans l'ordre) sont ceux de la fiche.
     - `lien_scrutin` est égal à la ligne « Lien du scrutin », et aussi à `https://www.assemblee-nationale.fr/dyn/{l}/scrutins/{n}`, avec {l} et {n} pris dans le titre de la fiche.
     - `vote` a l'`issue`, la `date` et l'`etape` de la ligne de `votes.md` de ce texte. La cellule Scrutin de cette ligne vaut `{l}e, {n}`.
     - `auteur` vaut `{"type": "gouvernement"}` pour le Gouvernement. Sinon, `type` vaut `"depute"` (député, députée) ou `"senateur"` (sénateur, sénatrice) ; `feminin` est vrai pour « députée » et « sénatrice » ; `nom` et `groupe` sont ceux de la ligne.
     - `considerations` : la raison de numéro i dans la fiche devient la considération du rang que lui donne la règle de l'ordre d'affichage (clé « ordre-raisons|{texte}|{i} », fichier caché, §2). Ses champs `texte`, `cote` et `pole` (`aucun` donne `"aucun"`), puis `nom`, `feminin` (vrai pour « députée ») et `groupe` dans `depute`, sont ceux de la raison. `elision` est contrôlé à l'étape 5.
   - **Mêmes sources.** Le rapport du programme de contrôle donne le SHA-256 de chaque fichier qu'il a lu : les quatre fiches, `votes.md`, `profils.md`, `simulation.md` et ce document. Le rapport de scellement donne ceux qu'a lus l'agent qui scelle. Si un même fichier a deux empreintes différentes : échec, car les deux programmes n'ont pas lu les mêmes sources.

**Lecture des autres sources.** Chaque tableau se lit comme en partie 2.7 : découpage sur « | », espaces U+0020 retirées aux bords, cellules en NFC. Il est repéré par son en-tête exact. Toute cellule qui ne suit pas sa forme est un échec.
- **§1 de `simulation.md`.** En-tête « | Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu | » ; quatre lignes, dans l'ordre Agathe, Nassim, Odile, Valentin.
  - Âge, de la forme `[1-9][0-9]*`, donne l'entier.
  - Heure de jeu, de la forme `{h}h{mm}` (h de 0 à 23, sans zéro initial ; mm sur deux chiffres), donne `"HH:MM"` : « 7h40 » donne `"07:40"`.
  - Métier, Ville et Ligne de vie se comparent telles quelles (étape 5).
- **`profils.md`, section « Profils cachés », son tableau** (en-tête « | | S | P | T | L | »). La cellule `{e},{dd} {fermeté}` donne `position` = 100 × e + dd, au plus 100, et `fermete`. Exemple : `0,65 moyenne`.
- **`profils.md`, section « Réponse type qui en découle », premier tableau.** Cellules `neutre`, `simple, vers {pôle}` ou `très, vers {pôle}`. {pôle} est le premier mot du libellé du pôle au §0 : « Liberté » pour « Liberté individuelle ».
- **Même section, second tableau.** Cellules `+{e},{décimales}` ou `−{e},{décimales}` (signe moins U+2212), lues comme fractions exactes.
- **`profils.md`, section « Absences ».** En-tête « | Personnage | Textes sans réponse | ». `aucun` donne un tableau vide ; sinon, des numéros séparés par « , » ou « et » : `3 et 10` donne `["3", "10"]`.
- **`profils.md`, section « Réponses atypiques ».** La ligne qui commence par `- Exactement {n} par personnage` donne n. Si le rapport de scellement donne aussi ce nombre, les deux sont égaux.
- **`profils.md`, section « Corrigé de la question F1 », son tableau.** Cellules `Au milieu`, ou {pôle} comme plus haut.

**Contrôles 2 à 4** (profils, réponses, absences). Ils suivent le fichier caché, y compris son annexe A. Le programme vérifie ce qui suit.
- **Contrôle 2.**
  - `profil` est égal au tableau des profils cachés.
  - Les tableaux « réponse type » et « d » (sens s = 1), ainsi que le corrigé de F1 (« Au milieu » si |p − 0,5| < 0,1), sont recalculés et égaux.
  - Les contraintes de `profils.md` qui se calculent sont tenues :
    - Agathe et Nassim sont du même côté sur S et sur P, neutres tous deux sur T, opposés sur L ;
    - Odile a la fermeté forte partout, avec |d| ≥ 0,56 ;
    - chaque tension partage le cercle comme indiqué ;
    - personne n'a en réponse type « très, vers Sécurité » avec « très, vers Tradition », ni « très, vers Liberté » avec « très, vers Changement ». C'est la lecture de « forte » : réponse type « très ».
  - « Aucune étiquette politique » ne se vérifie pas par programme : le rapport laisse ce point au Vérificateur.
- **Contrôle 3.**
  - D'abord, la condition d'application de la règle 2.2 : chaque raison « pour » sert le pôle s ou « aucun », et chaque raison « contre » le pôle 1 − s ou « aucun ». Si elle tombe, « du pôle visé » devient ambigu : échec, à soumettre à Game design.
  - Ensuite, chaque réponse de `reponses` est recalculée par les règles 2.1 à 2.5 du fichier caché. Le calcul part du profil (égal à `profils.md`, contrôle 2), des textes du fichier scellé (comparés aux fiches à l'étape 8) et de la graine.
  - Les réponses atypiques sont placées par la procédure de `profils.md`, avec les précisions qui la suivent (« Procédure »). Une étape de cette procédure sans texte valable est un échec.
  - `reponses_atypiques` et `cote_tire` sont égaux à ce calcul.
- **Contrôle 4.** `absences` est égal au tableau des absences.
- **Annexe A du fichier caché.**
  - L'ordre des tensions est « S T P S L T | S P L S T P L | S », et les tensions d'entrée sont S, P et L, dans cet ordre. Cela couvre aussi la répartition, l'alternance et la règle du texte 1.
  - Chaque tension a au moins un texte quotidien de chaque sens.
  - Chaque texte a au moins une raison « pour », une « contre », une par pôle, et au plus une « aucun ».
  - Parmi les textes S de 1 à 13, deux ont une raison « aucun » et deux n'en ont pas. Parmi les textes T, deux en ont une et un n'en a pas.
  - Les réponses « aucune » sont comptées et données (au plus 4 attendues), sans échec : c'est une mesure (« mesuré au §9 bis »).

Chaque écart est donné avec le détail du calcul : a, d, niveau, ensemble E, pôle visé, candidates et leurs t. Le Vérificateur peut ainsi juger sans relancer le programme.

Aucun programme ne vérifie que les trois champs de `vote` sont vrais (le bon jour, la bonne issue, la bonne étape). Cette vérification relève de l'annexe A de la simulation : relevé sur la page du scrutin et le dossier législatif, puis vérification par un second agent. L'étape 8 vérifie seulement que le fichier scellé recopie fidèlement `votes.md` et les fiches ; une erreur dans le relevé lui-même reste hors de portée d'un programme.

De même, aucun programme ne vérifie que le mandat et le groupe sont exacts, ni qu'ils sont pris au bon moment (§7.10) : ni la date du dépôt ni celle de chaque séance ne sont scellées, et un même sigle peut servir dans deux législatures. Cette vérification relève du relevé et de sa vérification par un second agent (annexe A de la simulation), avec les colonnes Législature, Nom complet, Identifiant et Source de la partie 2.7.

La page garde ses vérifications V1 à V5 (§0, §8.11). À l'étape V4, elle vérifie aussi que `format` vaut `"elenchos-essai-scelle"` et que `version` vaut `4`. Elle refuse donc un fichier en version 1, 2 ou 3. Elle ne lit pas les tableaux des parties 2.7 et 2.8 : elle affiche `groupe` tel quel et écrit « d' » ou « de » selon `elision` (partie 2.8).

### 4.2 Les traces

1. P écrit sa trace. Le harnais écrit son journal.
2. C écrit sa trace à partir du fichier scellé, du journal et du fichier des durées, qu'il extrait de la trace de P (partie 3.12). C'est la seule chose qu'il en lit, pour pouvoir écrire les mêmes textes de carnet. Il place chaque durée là où sa présence est attendue (partie 3.10, d'après `etapes`). Une durée présente là où elle n'est pas attendue, ou absente là où elle l'est, est un défaut, listé avec son chemin.
3. Dans les deux traces, toute valeur entière dont la clé commence par `duree_` devient `0`, et `null` reste `null`. La présence d'une durée est ainsi comparée, sa valeur jamais.
4. Les deux traces sont mises en forme canonique (partie 1.1), puis comparées octet pour octet.
5. Si elles sont identiques, le contrôle est passé. Sinon, c'est un défaut. L'outil liste alors chaque différence avec son chemin et les deux valeurs. Le chemin s'écrit en JSON Pointer (RFC 6901), par exemple `/seances/9/manches/porteur/ordre/1`. Le Vérificateur lit cette liste (§9).

Tout le reste est comparé, entrées comprises. Une différence sur `ouverture`, `versions`, `etapes`, `coups`, `attente.lectures[].heure`, `copies[].coups`, `copies[].versions` ou `copies[].etapes` révèle l'un de ces défauts :
- une page qui garde un autre coup que celui qui a été joué ;
- une page qui lit l'heure en temps universel, ou dans le fuseau de la machine de test ;
- une page qui arrondit l'heure au lieu de la tronquer ;
- une page qui écrit un autre numéro de version que celui de la construction servie, ou qui compte une version sous laquelle aucun toucher de la séance n'a eu lieu ;
- une copie qui ne part pas de l'état gardé au moment de son toucher.

**Jamais comparé :** la valeur des durées réelles (`duree_*`), et rien d'autre ; leur présence l'est (étape 3). Aucun autre champ de la trace ne peut légitimement différer entre P et C : il n'y a ni date de production, ni version du harnais ou du programme de contrôle, ni nom de machine. Le numéro de version de la page n'est pas un tel renseignement : le carnet l'écrit, c'est donc une entrée (`versions`), comparée comme les autres. Si l'on veut garder ces renseignements, ils vont dans un fichier à côté de la trace.

Où regarder une différence :

| Partie de la trace | Contrôle du §9 |
|---|---|
| Dans `manches.*` : `possibles`, `mediane`, `classement`, `departages`, `remplacements`, `places`, `raison_cachee`, `ordre`, `cartes[].auteur`, `cartes[].cachee` | 6 |
| Dans les manches des personnages : `rangs`, `cotes_attendus`, `curseur_porteur`, `total`, `cartes[].designe`, `cartes[].raison_devinee` | 7 |
| `entree`, `cartes[].auteur_compte`, `revelation`, `dimanche` (sauf `phrase_semaine`) | 8 |
| `portrait`, `curseurs_vus`, `phrase_jour`, `dimanche.phrase_semaine` | 9 |
| `attente` (jamais « n'a pas joué »), `surprises_proches` | 10 |
| `mesures`, `agregats`, `carnet`, `copies[].mesures`, `copies[].texte` | 12 et 13 |
| `ouverture`, `versions`, `etapes`, `coups`, `attente.lectures[].heure`, `copies[].coups`, `copies[].versions`, `copies[].etapes` | rejeu : coups gardés égaux aux coups joués, heure locale, version servie, écrans affichés, état au moment de la copie |

### 4.3 Le carnet (contrôles 12 et 13)

- **Contrôle 13.** Le harnais rejoue les trois parties témoins sur la version du porteur, avec le même journal, et récupère le carnet copié à la fin ainsi que chaque copie faite en cours d'essai. Il les compare au `carnet.texte` et aux `copies[].texte` de la trace de C pour la même partie. Le journal vaut pour les deux versions d'une même construction, qui portent le même numéro (partie 3.1). Avant la comparaison, chaque durée est remplacée par « ‹durée› » dans les deux textes. Les durées se repèrent par l'expression régulière du §8.12. Les heures, fixées par le harnais, sont comparées. La ligne « Version de la page : {version}. » est comparée elle aussi, jamais masquée : elle prouve que la construction servie porte le numéro que le programme de construction a écrit à côté d'elle.
- **Contrôle 12.**
  - `carnet.texte` ne contient jamais le pseudo (`seances[0].coups.pseudo`).
  - Quatre variantes d'une même partie, rejouées avec la même horloge, les mêmes gestes, les mêmes `versions` et les mêmes `etapes`, seules les réponses du joueur changeant (§9, contrôle 12 : positions opposées ; toutes neutres ; mêmes positions avec d'autres raisons ; un texte laissé sans réponse après l'affichage de Répondre, avec en plus le toucher « Oui, continuer » de la confirmation ; mêmes choix au carnet du jour dans toutes les variantes, toutes les questions qui s'appliquent ayant un choix à la séance de ce texte) : séance par séance, les blocs de séance du carnet (et `seances[k].mesures`, hors la valeur des `duree_*`) sont identiques ; de même pour chaque copie (`copies[].texte` et `copies[].mesures`, hors la valeur des `duree_*`) ; seuls « Titres de la semaine » et « Sur tout l'essai » peuvent différer.
  - Le carnet suit exactement le gabarit du §8.12 : toute ligne qui n'y figure pas est un défaut.

### 4.4 Mettre l'horloge, la version et les copies à l'épreuve

Au moins une partie témoin contient les cas suivants :
- une séance ouverte pendant l'heure jouée deux fois le 25 octobre 2026, avec une lecture à 02:30 à chacun des deux passages. Entre 02:00 et 03:00, l'heure passe une première fois à +02:00, puis une seconde fois à +01:00 ;
- deux lectures à 17:59 et à 18:00, aux bords de la journée de jeu ;
- une ouverture au moins deux jours après la précédente.

Au moins une partie témoin contient aussi :
- une séance où la version change entre deux touchers : le harnais recharge la page sur une version témoin construite avec le numéro suivant (ligne attendue : deux numéros, « n, puis n+1 ») ;
- une séance atteinte sous un numéro, puis ouverte, après rechargement, sous le suivant (ligne attendue : le seul numéro suivant) ;
- une copie du carnet en cours de séance, suivie d'« Annuler », puis, dans la même séance, d'au moins un « Relire », un « Passer », une réponse au carnet et un changement de version : la copie garde l'état d'avant, le carnet final celui d'après.

### 4.5 Les phrases attendues (contrôle 11)

Le programme de contrôle écrit, à partir du fichier scellé seul, un fichier qui donne, pour chaque texte, les chaînes que le relevé du contrôle 11 doit trouver, ou ne jamais trouver.
- Les chaînes y sont sous leur forme affichée : gabarits des §7.9 et §7.10, puis règles 1 à 6 du §7.8, appliquées à la phrase entière.
- Il y a une chaîne par bloc affiché : titre, ligne ou paragraphe, tel que la maquette l'écrit d'un tenant.
- Le fichier est en JSON canonique ; les caractères U+00A0, U+202F et U+2019 y sont écrits tels quels.

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-phrases"` |
| `version` | entier | `1` |
| `empreinte_scelle` | hex64 | |
| `textes` | objet, 17 clés | par texte, l'objet ci-dessous |

| Clé | Type | Contenu |
|---|---|---|
| `vote` | objet | `{"1.6", "2.7d", "5.4"}` : pour chaque écran, le tableau des blocs du vote, ou `null` si l'écran ne montre pas ce texte. 1.6 : textes E1 à E3, un bloc (« L'Assemblée : texte adopté le {date}. {étape} »). 2.7d : textes 1 à 13, trois blocs (« Et l'Assemblée ? », le gros titre, puis la ligne datée ou {article}). 5.4 : textes 1 à 14, un bloc (« Vote : … »). |
| `auteur` | objet | `{"1.6", "2.7e", "5.4"}` : la phrase « Proposé par … » de chaque écran (§7.10), ou `null` |
| `arguments` | tableau de 4 chaînes | pour la considération de rang 1 à 4 : la fin de phrase « était l'argument d'{nom}, {député ou députée}, {groupe}. », ou « … de {nom}, … », selon `elision` (partie 2.8) |
| `interdites_avant_revelation` | tableau de chaînes | ce qui ne doit jamais s'afficher avant la révélation du texte (2.1, « Relire », 5.4 d'avant la révélation ; §7.1, §7.9) : la date du vote sous sa forme affichée, la phrase d'étape s'il y en a une, le gros titre, les phrases « Proposé par … », et le `nom` de l'auteur et de chaque député |

Le relevé du contrôle 11 se compare à ce fichier de trois façons :
- pris bloc par bloc, il contient chaque chaîne de `vote` et d'`auteur` de l'écran, telle quelle ;
- chaque phrase « Ta raison, … » d'un texte (1.6, 2.7e) finit par la chaîne d'`arguments` du rang de cette raison ;
- aucune chaîne de `interdites_avant_revelation` n'y apparaît avant la révélation du texte.

Exemple inventé, un texte quotidien en première lecture : 2.7d vaut `["Et l’Assemblée ?", "Texte adopté.", "Le 9 octobre 2024. Le Sénat devait encore voter."]`. L'espace avant « ? » y est U+202F ; les deux espaces de la date sont U+00A0.

## 5. Changer le format

- Chaque fichier a son propre numéro de version : le fichier scellé est en version 4 ; la trace, et le journal du harnais qui en a la forme, sont en version 3 ; le fichier des durées (partie 3.12) et celui des phrases attendues (partie 4.5) sont en version 1.
- Tout changement de champ, de type ou de sens d'un fichier fait passer ce fichier, et lui seul, à la version suivante. On met alors ce document à jour, et l'auteur du programme de contrôle le relit.
- Les lignes des tableaux des parties 2.7 et 2.8, et les règles d'écriture de ces tableaux, que seul le programme de contrôle lit, ne sont pas le format : les changer ne change aucune version, tant que les champs du fichier scellé gardent leur type et leur sens. L'auteur du programme de contrôle relit tout changement de ces règles. Lignes et règles sont arrêtées avant le scellement. Le rapport de scellement donne le commit de ce document que le programme de contrôle a lu ; après l'essai, le Vérificateur rejoue le contrôle 1 avec ce même commit.
- La forme des lignes des fiches et de `votes.md` (partie 4.1, étape 8), et celle des tableaux du §1 et de `profils.md` (partie 4.1, « Lecture des autres sources »), ne sont pas le format non plus. Leur contenu peut changer avant le scellement. Leur forme ne change pas sans que l'auteur du programme de contrôle la relise.
- La page refuse un fichier scellé dont le format ou la version est inattendu (étape V4). C refuse un fichier scellé, une trace ou un journal de version inattendue.
- Historique :
  - fichier scellé, version 1 (4 octobre 2026) : `vote` était une chaîne, `"adopte"` ou `"rejete"` ;
  - fichier scellé, version 2 (5 octobre 2026) : `vote` devient un objet daté (partie 2.3, §7.9). La trace ne contient pas le vote : elle reste en version 1 ;
  - fichier scellé, version 3 (5 octobre 2026) : `auteur.type` admet `"senateur"` ; `groupe` devient un sigle de la liste fermée de la partie 2.7, pris au dépôt pour l'auteur et à la séance de l'extrait pour une considération (§7.10) ; nouveaux contrôles en partie 4.1 (groupes, initiales et élision, nombres). La trace ne contient ni auteur, ni groupe, ni nom d'élu, ni nombre écrit par tranches : elle reste en version 1 ;
  - fichier scellé, version 4 (5 octobre 2026) : le `depute` d'une considération reçoit le champ `elision` (partie 2.3) ; la page ne regarde plus l'initiale, elle lit ce champ (partie 2.8, §7.6). La trace ne contient aucun nom d'élu : elle reste en version 1 ;
  - trace et journal, version 2 (5 octobre 2026) : chaque séance reçoit l'entrée `versions` (partie 3.3), que le carnet écrit dans sa ligne « Version de la page » (§8.12) ; chaque copie du carnet porte les coups, les versions et les mesures de l'instant de la copie (partie 3.2), pour que C recalcule le bloc copié ; le journal porte ces mêmes entrées ; `duree_*` ne compte plus que le temps où l'app est au premier plan (§8.4). Le fichier scellé ne change pas : il reste en version 4.
  - trace et journal, version 3 (5 octobre 2026) : chaque séance et chaque copie reçoivent l'entrée `etapes` (partie 3.3), qui fixe la présence des durées de Deviner et de Répondre ; la comparaison masque la valeur des durées, plus leur présence (partie 4.2) ; le journal a sa clé `format` et la forme de la partie 3.12. Le fichier scellé reste en version 4.
- Un fichier déjà scellé en version 1, 2 ou 3 doit être scellé de nouveau en version 4 : nouvelle empreinte datée, et tous les contrôles rejoués (§9, « Correctif »). Ce n'est possible qu'avant la séance 0. (Au 5 octobre 2026, aucun fichier n'est encore scellé.)
- Après la séance 0, le fichier scellé ne change plus (§9, « Correctif »), et son format non plus. Un correctif de la page peut changer la trace : on refait alors les contrôles (§9).

## 6. Points fixés depuis la version 1 de ce document

1. **Format du carnet** : §8.12 de la simulation (UX). Contraintes respectées : U+000A seulement, pas de tabulation, « Fin du carnet » sans retour final, durées repérables par une expression régulière, pas de pseudo, uniquement des comptes bruts (aucun arrondi).
2. **Mesures globales** : §8.4 (Game design) et partie 3.10. Trois chiffres restent dans la trace ; les autres, constants pour un fichier donné, vont au rapport de scellement.
3. **`jours_ecoules`** : différence entre les dates locales (heure de Paris) de deux ouvertures successives ; l'ouverture est le premier toucher du joueur dans la séance.
4. **Typographie** : §7.8 (UX). Le fichier scellé reste en typographie simple ; la page et C appliquent les mêmes règles à l'affichage ; la trace enregistre les phrases sous leur forme affichée.
5. **Plusieurs sources** : §7.1, écran 5.4 (UX).
6. **Vote de l'Assemblée** : §7.9 de la simulation (UX). `vote` devient un objet `{"date", "etape", "issue"}` (partie 2.3), contrôlé en partie 4.1, étapes 4 et 5. Le fichier scellé passe en version 2 ; la trace reste en version 1 (partie 5).
7. **Typographie simple du fichier scellé** : la liste des chaînes concernées est fixée en partie 4.1, étape 7.
8. **Auteurs, groupes, élision** : §7.10 et §7.6 (UX). `auteur.type` admet `"senateur"` ; `groupe` est un sigle de la liste fermée (partie 2.7) ; initiales et élision en partie 2.8. Contrôlés en partie 4.1, étapes 4 et 5. Le fichier scellé passe en version 3 ; la trace reste en version 1 (partie 5).
9. **Nombres** : §7.8, règle 6 (UX). Le fichier scellé reste en typographie simple : « 30 000 » et « 20 % » s'écrivent avec une espace U+0020, contrôlée en partie 4.1, étape 7. La page et le programme de contrôle appliquent la règle à l'affichage, sur la phrase entière, avant d'insérer le pseudo. Rien ne change dans la trace : les phrases qu'elle enregistre n'ont pas de chiffre (§5.6, §5.7), et le carnet n'applique que la règle 1 du §7.8.
10. **Pseudo des joueurs témoins** : il ne finit pas par un chiffre (partie 3.1).
11. **Groupes** : §7.10 (UX) et partie 2.7. La colonne `groupe` admet une espace entre deux lettres (groupe écrit en toutes lettres par l'institution) ; une ligne peut porter plusieurs identifiants quand le groupe a changé d'organe sans changer de sigle. Le groupe ne se coupe jamais à son trait d'union ; à son espace, il peut passer à la ligne comme deux mots ordinaires (UX, §7.10). Les champs du fichier scellé gardent leur type et leur sens : pas de nouvelle version (partie 5).
12. **Élision nom par nom** : §7.6 (UX). Le `depute` d'une considération porte `elision` (partie 2.3), fixé par le tableau de la partie 2.8 et contrôlé en partie 4.1, étapes 4 et 5 ; la page ne regarde plus l'initiale. Le fichier scellé passe en version 4 ; la trace reste en version 1 (partie 5).
13. **Version de la page et copies du carnet** : §8.12. Chaque séance de la trace porte l'entrée `versions` (partie 3.3) ; chaque copie du carnet porte les coups, les versions et les mesures de l'instant de la copie (partie 3.2). Le harnais les consigne dans son journal ; C écrit à partir d'eux la ligne « Version de la page » et le bloc copié. Mis à l'épreuve en partie 4.4.
14. **Durées au premier plan** : §8.4 (Game design). `duree_*` ne compte que le temps où l'app est au premier plan, jusqu'à « Aller au jour suivant » compris (partie 3.10) ; la valeur des durées n'est jamais comparée (leur présence l'est, point 18). Avec le point 13, la trace et le journal passent en version 2 ; le fichier scellé reste en version 4 (partie 5).
15. **Fidélité aux fiches** (relecture de C, A2) : partie 4.1, étape 8 ; formes des lignes lues ; SHA-256 des sources comparés à ceux du rapport de scellement.
16. **Ordre du contrôle 1** (relecture de C, A5) : une étape sans son entrée est « non faite » ; cas du fichier candidat ; écriture de l'empreinte publiée.
17. **Lecture des sources et contrôles 2 à 4** (relecture de C, A6) : partie 4.1 ; adresses de l'Assemblée seulement ; guillemets aux bords.
18. **Journal, écrans affichés, fichier des durées** (relecture de C, B1, B6) : partie 3.12 ; `etapes` (partie 3.3) fixe la présence des durées, qui est comparée (partie 4.2). La trace et le journal passent en version 3.
19. **`curseur_porteur.c`** (relecture de C, B4) : valeur brute (partie 3.6).
20. **Validité du journal** (relecture de C, B9) : partie 3.12.
21. **Repère du fichier embarqué** (relecture de C, B10) : partie 4.1, étape 2.
22. **Phrases attendues** (relecture de C, B11) : partie 4.5.
23. **Relevés hors de la mémoire** (plan de la page de Front-end, point 14) : partie 3.1.
24. **Ordre d'affichage des raisons** (relecture de C, A1, Game design) : tiré au scellement par la clé « ordre-raisons|{texte}|{i} » (fichier caché, §2) ; `rang` en découle (partie 2.3), et l'étape 8 de la partie 4.1 le refait.
25. **`passer`** (relecture de C, B5, Game design, UX et Back-end) : nombre de cartes passées dans la manche validée, lu dans `coups.deviner` (partie 3.10, §8.4).
26. **Clés et calendrier** (relecture de C, B7, B13, Game design) : clés de `mystere` et de `phrase_semaine.poids` (partie 3.9) ; `surprises_proches` suit le calendrier à la séance d'un arrêt (partie 3.3).
