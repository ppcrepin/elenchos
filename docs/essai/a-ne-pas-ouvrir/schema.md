# Schéma du fichier scellé et format de la trace (essai solo)

*Rédigé par Back-end le 4 octobre 2026, comme le demande le §9 de `docs/essai/simulation.md` (« Avant d'écrire le fichier scellé »). Version 1 du format. L'auteur du programme de contrôle le relit avant le scellement. Le document sert ensuite à l'agent qui scelle, à l'auteur de la page et à l'auteur du programme de contrôle. C'est une spécification de travail, pas un texte pour le porteur.*

*Rangé dans `a-ne-pas-ouvrir/` (choix de l'orchestrateur) : les noms de certains champs laissent entrevoir comment les cartes sont choisies et comment les personnages devinent. Tous les lecteurs de ce document lisent déjà ce dossier. **Exemples** : toutes les valeurs sont inventées, sans lien entre elles ni avec l'essai. Elles ne suivent aucune règle cachée : ne pas s'en servir pour tester un calcul. Les personnages d'exemple portent des prénoms des maquettes (Hugo, Paul, Thomas), qui ne sont pas dans l'essai. Les textes d'exemple sont des gabarits.*

*Renvois : « §n » renvoie à `docs/essai/simulation.md`, sauf mention contraire ; « le fichier caché » désigne `a-ne-pas-ouvrir/regles-de-calcul.md`. « Partie n » renvoie à ce document.*

*Ordre de lecture :*
- *agent qui scelle : parties 1 et 2 ;*
- *auteur de la page : parties 1 à 5 ;*
- *auteur du programme de contrôle : partie 6 d'abord, puis tout le reste.*

## En bref

- Il y a deux fichiers JSON, tous deux en forme canonique (RFC 8785) :
  - le **fichier scellé** : il est fixé avant la séance 0 et son empreinte est publiée ;
  - la **trace** : elle consigne tout ce que la version témoin de la page calcule pendant une partie jouée par un joueur inventé.
- Il n'y a aucun nombre à virgule. On n'écrit que des entiers, et des fractions exactes écrites en chaînes « p/q ».
- Chaque trace est écrite deux fois, à partir des mêmes coups : par la version témoin de la page et par le programme de contrôle. On compare les deux octet pour octet, après avoir effacé les durées réelles. Une seule différence est un défaut.
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
- les chaînes ne contiennent aucun caractère de contrôle. Seule exception : le retour à la ligne (U+000A) dans le texte du carnet (partie 3.10) ;
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
| hex16, hex64 | chaîne de 16 ou de 64 chiffres hexadécimaux minuscules | |
| texte | `"E1"`, `"E2"`, `"E3"`, puis `"1"` à `"14"`, écrits comme dans les clés de tirage (§0) | `"7"` |
| personnage | `"Agathe"`, `"Nassim"`, `"Odile"` ou `"Valentin"` | |
| membre | un personnage, ou `"porteur"` | |
| tension | `"S"`, `"P"`, `"T"` ou `"L"` | |
| niveau | entier de 1 (Très défavorable) à 5 (Très favorable) | `4` |
| raison | entier de 1 à 4 (rang d'affichage de la considération), ou la chaîne `"aucune"` | `2`, `"aucune"` |
| côté | entier, dans les termes du texte : 1 favorable, 0 neutre, −1 défavorable | `-1` |

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
| `version` | entier | `1` (partie 5) |
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
| `vote` | `"adopte"` ou `"rejete"` | l'issue du scrutin (« Texte adopté. », « Texte rejeté. ») |
| `auteur` | objet | `{"type": "depute", "nom", "feminin", "groupe"}`, ou `{"type": "gouvernement"}` (« Proposé par le Gouvernement. », annexe C, point 9) |
| `lien_scrutin` | chaîne | adresse https de la page du scrutin sur le site de l'Assemblée |
| `sources` | tableau non vide de chaînes | adresses https des extraits des débats |
| `tension` | tension | |
| `sens` | entier 0 ou 1 | le sens s (§0) |
| `considerations` | tableau de 4 objets | dans l'ordre d'affichage |

Chaque considération `considerations[i]` contient :

| Clé | Type | Contenu |
|---|---|---|
| `rang` | entier de 1 à 4 | égal à sa place dans le tableau. C'est l'« id » des clés de tirage et la valeur de `raison`. |
| `texte` | chaîne | l'argument, sans guillemets, avec sa ponctuation finale (« . », « ? » ou « ! »). La page ajoute les guillemets et applique la ponctuation du §4.6. |
| `cote` | `"pour"` ou `"contre"` | |
| `pole` | entier 0 ou 1, ou `"aucun"` | |
| `depute` | objet | `{"nom", "feminin", "groupe"}` |

Un député (l'`auteur` de type `"depute"`, ou le `depute` d'une considération) a trois champs :

| Clé | Type | Contenu |
|---|---|---|
| `nom` | chaîne | prénom et nom, tels qu'affichés |
| `feminin` | booléen | `true` donne « députée », `false` donne « député » (§7.6) |
| `groupe` | chaîne | le nom du groupe, tel qu'affiché |

- Les adresses sont en https et en ASCII : un caractère spécial s'écrit encodé, sous la forme %xx. Elles ne contiennent pas d'espace.
- Les chaînes affichées sont écrites en typographie simple : apostrophe droite, espaces ordinaires (contrôle 1). La page applique le §4.6 (guillemets, point final), puis les règles d'affichage du §7.8.

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

Ceci est un extrait, mis en retrait pour la lecture. Le vrai fichier tient sur une seule ligne, sans espace hors des chaînes. L'extrait ne compte qu'un personnage, un texte et un vecteur : il est donc invalide tel quel. Les valeurs sont inventées (voir l'avertissement en tête).

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
      "auteur": {"feminin": true, "groupe": "[Groupe A]", "nom": "Prénom Nom A", "type": "depute"},
      "considerations": [
        {"cote": "pour", "depute": {"feminin": false, "groupe": "[Groupe B]", "nom": "Prénom Nom B"}, "pole": 1, "rang": 1, "texte": "Raison d'exemple n° 1, côté pour."},
        {"cote": "contre", "depute": {"feminin": true, "groupe": "[Groupe C]", "nom": "Prénom Nom C"}, "pole": 0, "rang": 2, "texte": "Raison d'exemple n° 2, côté contre ?"},
        {"cote": "contre", "depute": {"feminin": false, "groupe": "[Groupe D]", "nom": "Prénom Nom D"}, "pole": "aucun", "rang": 3, "texte": "Raison d'exemple n° 3, sans pôle."},
        {"cote": "pour", "depute": {"feminin": true, "groupe": "[Groupe E]", "nom": "Prénom Nom E"}, "pole": 1, "rang": 4, "texte": "Raison d'exemple n° 4, côté pour !"}
      ],
      "lien_scrutin": "https://www.assemblee-nationale.fr/exemple-scrutin",
      "lignes": ["Ligne d'exemple n° 1.", "Ligne d'exemple n° 2.", "Ligne d'exemple n° 3."],
      "sens": 1,
      "sources": ["https://www.assemblee-nationale.fr/exemple-debats"],
      "tension": "P",
      "titre": "Titre d'exemple",
      "vote": "rejete"
    }
  },
  "vecteurs_test": [
    {"chaine": "0123456789abcdef|raison|Odile|E2|3", "cle": "raison|Odile|E2|3", "hex8": "1a2b3c4d", "n": 439041101}
  ],
  "version": 1
}
```

Le même vecteur, en forme canonique, tel qu'il figure dans le fichier :

`{"chaine":"0123456789abcdef|raison|Odile|E2|3","cle":"raison|Odile|E2|3","hex8":"1a2b3c4d","n":439041101}`

Ici, `hex8` et `n` sont cohérents entre eux : 1a2b3c4d en hexadécimal vaut 439 041 101. En revanche, 1a2b3c4d n'est pas le vrai début du SHA-256 de cette chaîne.

## 3. La trace de la version témoin (§9)

### 3.1 Principe

- **Une trace par partie.** Les trois parties témoins et chaque partie au hasard (§9) ont chacune leur trace : un fichier JSON par partie.
- **Deux auteurs, un seul schéma.**
  - **P** est la version témoin de la page. Son bloc de trace lit deux choses : les résultats du moteur, et ce que l'interface a lu (l'heure) ou affiché (les visages, le carnet). Il les écrit sans rien recalculer. Le moteur doit donc rendre ses grandeurs intermédiaires (x, c, ℓ, q, etc.) dans ses résultats, dans les deux versions de la page ; seul le bloc de trace les écrit, en fractions « p/q ». Un bloc qui recalculerait ces grandeurs ferait comparer deux copies du même calcul.
  - **C** est le programme de contrôle, écrit à part (§9). Il part du fichier scellé et du journal du harnais. Il ne lit jamais le code de la page, ni sa trace, sauf les durées (partie 4.2).
- **Entrées et sorties.**
  - Les entrées sont ce que le harnais joue ou fixe : l'en-tête `partie` ; pour chaque séance, `ouverture`, `coups` et l'heure de chaque lecture d'« En attendant » ; `arret` et `fin`.
  - Le harnais consigne ces entrées dans son **journal**. Le journal a la forme de la trace, réduite à ces champs.
  - Tout le reste de la trace est une sortie.
  - Dans la trace de P, les entrées sont ce que la page a lu et gardé. Dans celle de C, ce sont les valeurs du journal. Les comparer prouve qu'aucun coup ne s'est perdu en route.
- **Horloge.** Le harnais fixe l'heure, dans le fuseau Europe/Paris, à deux moments : au premier toucher du joueur dans chaque séance (son « ouverture », §8.4), et avant chaque affichage d'« En attendant ». Il la tient immobile pendant cet affichage. L'heure que lit la page doit être celle qu'il a fixée, à la minute près.
- **Deux modes.**
  - `interface` : la partie est jouée par l'interface, dans un navigateur sans tête. C'est le cas des parties témoins et d'au moins dix parties au hasard (§9).
  - `moteur` : la partie est rejouée par le moteur seul. C'est le cas des 200 parties au hasard.
  - En mode `moteur`, `carnet` et toutes les durées valent `null`. Le harnais donne au moteur les mêmes entrées qu'en mode `interface`.
- **Sortie de la trace.** Le harnais la lit dans le navigateur sans tête. La page ne l'envoie jamais (§8.8).
- **Pseudo des joueurs témoins.** On choisit une chaîne qu'on ne risque pas de trouver par hasard ailleurs, par exemple « Témoin-b-4821 ». Le contrôle 12 vérifie qu'elle n'apparaît pas dans le carnet.
- **Taille.** Une trace pèse de l'ordre de 100 à 300 Ko (estimation).

### 3.2 La partie

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-trace"` |
| `version` | entier | `1` |
| `empreinte_scelle` | hex64 | le SHA-256 du fichier scellé utilisé |
| `partie` | objet | écrit par le harnais. `id` : chaîne (`"a"`, `"b"`, `"c"`, `"hasard-001"`…). `mode` : `"interface"` ou `"moteur"`. `graine` : hex16 qui a servi à tirer les coups d'une partie au hasard, ou `null` pour une partie témoin. |
| `seances` | tableau | l'élément d'indice k est la séance k (partie 3.3), de 0 à 15, ou jusqu'à la séance de l'arrêt |
| `arret` | objet ou `null` | les entrées du parcours « Arrêter l'essai » (§8.10), partie 3.4 |
| `fin` | objet ou `null` | les réponses à F2 et à F1 à la clôture (§8.5), partie 3.4 |
| `agregats` | objet | calculés à la fin de la partie (partie 3.10) |
| `carnet` | objet ou `null` | `{"texte": chaîne}` (partie 3.10) |
| `copies` | tableau | copies du carnet faites en cours d'essai, depuis la confirmation de « Tout effacer » : `{"k": entier, "texte": chaîne}`, dans l'ordre ; vide sinon. Le journal du harnais porte l'entrée correspondante `copie` (numéro de séance). |

### 3.3 La séance

| Clé | Type | Présente quand (sinon `null`) | Contenu |
|---|---|---|---|
| `k` | entier | toujours | numéro de séance |
| `ouverture` | instant | toujours | entrée : l'heure du premier toucher du joueur dans la séance (aux séances 3 à 14, le toucher du message de 18h), pas l'affichage qui suit « Jour suivant » (§8.4) |
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

Une séance atteinte a toujours son entrée (règles de calendrier, §0). À la séance d'un arrêt, `coups`, `phrase_jour`, `attente` et `mesures` décrivent ce qui a eu lieu avant l'arrêt ; `ouverture`, `manches`, `revelation`, `dimanche`, `portrait` et `curseurs_vus` suivent le calendrier (un texte est révélé dès que la séance n+2 est atteinte, lu ou non).

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
  - il vaut `"passe"` après un toucher sur « Passer » ;
  - il vaut `null` pour une carte laissée sans attribution quand le joueur passe au jour suivant. Cette carte compte alors comme passée (§8.2).
- `raison`, dans `deviner`, est la raison devinée. Elle ne figure que sur la carte à raison cachée. Elle vaut `null` sur les autres cartes, ou si le joueur ne l'a pas tentée.
- Une position sans raison n'est pas une réponse : `reponse` vaut alors `null` (§8.2).
- Dans une partie jouée par le harnais, une attribution ou une passe n'est jamais défaite. La trace donne l'état final, et le nombre de « Passer » se lit sans ambiguïté.

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
| `curseur_porteur` | objet ou `null` | pour un devineur personnage : `{"somme_w", "c"}`, en fractions (§3, point 2, du fichier caché). `null` pour le porteur. |
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
| `mystere` | objet | `titulaire` : membre ou `null`. `tentatives` et `erreurs` : clé = membre → entier. `departage` : `"aucun"`, `"erreurs"` ou `"tirage"`. |
| `fidele` | objet | `titulaires` : tableau de membres |
| `surprise` | objet | `texte` : texte ou `null`. `attributions` et `erreurs` : clé = texte révélé dans la semaine → entier. `departage` : `"aucun"`, `"erreurs"` ou `"tirage"`. |
| `phrase_semaine` | objet | `poids` : clé = tension → `{"pole0", "pole1", "comptent"}`, où `pole0` et `pole1` sont des fractions et `comptent` un entier. `tension` : tension ou `null`. `cas` : `"nette"`, `"difference"`, `"egalite"` ou `"floue"`. `phrase` : la phrase affichée, exacte (§5.7). |

- `departage` dit comment le titulaire a été désigné. Il vaut `"aucun"` si le titulaire était seul en tête, ou s'il n'y a pas de titulaire.
- Pour Le Devin, `raisons` compte les raisons cachées trouvées.
- Pour Le Mystère, tentatives et erreurs s'entendent au sens du §6, point 3.
- Pour la surprise de la semaine, `attributions` ne compte pas les passes.

### 3.10 Mesures, agrégats, carnet

`mesures` existe à chaque séance (§8.4). Le jour et l'heure d'ouverture sont dans `ouverture`.

| Clé | Type | Contenu |
|---|---|---|
| `jours_ecoules` | entier ou `null` | depuis la séance précédente (partie 6, point 3). `null` à la séance 0. |
| `duree_seance`, `duree_deviner`, `duree_repondre` | entier ou `null` | en secondes entières, tronquées. `null` si l'étape n'a pas eu lieu, et en mode `moteur`. Ces durées ne sont jamais comparées. |
| `relire` | entier | les touchers sur « Relire », comptés par la page |
| `passer` | entier | les cartes passées par un toucher sur « Passer » |
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

`carnet.texte` est le texte exact que « Copier mon carnet » a donné à la fin de la partie (clôture ou arrêt), jusqu'à « Fin du carnet » compris. Son format est au §8.12.

### 3.11 Exemple

Voici cinq fragments, mis en retrait. Chacun est du JSON valide pris isolément. Les valeurs sont inventées (voir l'avertissement en tête).

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
  "mesures": {"duree_deviner": 41, "duree_repondre": 37, "duree_seance": 118, "jours_ecoules": 1, "passer": 1, "relire": 1, "revelation_raison_tentee": false, "revelation_verdicts": ["juste", "faux", "passe"]},
  "ouverture": "2026-10-21T08:52+02:00",
  "phrase_jour": {"classe": "penchant", "phrase": "Aujourd’hui, tu as penché vers le changement.", "pole": 1, "texte": "9", "w": "1/2"},
  "portrait": {
    "ordre_moi": ["T", "S", "P", "L"],
    "tensions": {"T": {"c": "8/13", "l": "31/40", "net": false, "somme_w": "5/2"}}
  }
}
```

## 4. Vérifications et comparaison

### 4.1 Le fichier scellé (contrôle 1)

Le programme de contrôle fait ces vérifications dans l'ordre, avant tout autre calcul. Le premier échec arrête le contrôle (§0).

1. **Empreinte.** Le SHA-256 des octets du fichier est égal à l'empreinte publiée : 64 chiffres hexadécimaux minuscules, présentés comme au §8.11.
2. **Données embarquées.** On décode le base64 de la page : alphabet standard de la RFC 4648, avec les « = » de fin, sans retour à la ligne. On doit retrouver exactement ces octets.
3. **Forme.** Le fichier est en UTF-8 strict. Relu puis remis en forme canonique, il redonne exactement les mêmes octets. Ce seul test attrape un espace en trop, une clé en double, des clés mal ordonnées, un échappement inutile et un nombre mal écrit.
4. **Schéma.** Le schéma est fermé (partie 1.1). Types et valeurs sont permis. Les chaînes sont en NFC, les adresses en https et en ASCII.
5. **Cohérence interne.**
   - `textes` et `reponses` ont exactement les 17 clés ; `personnages`, `absences` et `reponses_atypiques` ont exactement les quatre prénoms.
   - Dans chaque texte, `rang` est égal à la place dans le tableau, et les quatre `groupe` sont différents (`projet.md` §8).
   - Le `texte` de chaque considération finit par « . », « ? » ou « ! », et n'a pas de guillemets à ses bords.
   - Un personnage a une réponse à un texte si et seulement si ce texte n'est pas dans ses absences. Les absences ne portent que sur des textes quotidiens.
   - Chaque réponse atypique désigne un texte quotidien où le personnage a une réponse.
   - Les fiches sont identiques au §1. `cercle` vaut Amis et Agathe.
   - Pour chaque vecteur, `chaine` est égal à `graine` + « | » + `cle`, et `n` est la valeur de `hex8`.
6. **Vecteurs de test.** On les recalcule à partir de `graine` ; ils doivent être identiques.

Ensuite viennent les contrôles 2 à 4 (profils, réponses, absences). Ils suivent le fichier caché, y compris son annexe A.

La page garde ses vérifications V1 à V5 (§0, §8.11). À l'étape V4, elle vérifie aussi que `format` et `version` ont la valeur attendue.

### 4.2 Les traces

1. P écrit sa trace. Le harnais écrit son journal.
2. C écrit sa trace à partir du fichier scellé et du journal. Il ne prend qu'une chose dans la trace de P : les durées, pour pouvoir écrire le même carnet.
3. Dans les deux traces, toute valeur dont la clé commence par `duree_` devient `null`.
4. Les deux traces sont mises en forme canonique (partie 1.1), puis comparées octet pour octet.
5. Si elles sont identiques, le contrôle est passé. Sinon, c'est un défaut. L'outil liste alors chaque différence avec son chemin et les deux valeurs. Le chemin s'écrit en JSON Pointer (RFC 6901), par exemple `/seances/9/manches/porteur/ordre/1`. Le Vérificateur lit cette liste (§9).

Tout le reste est comparé, entrées comprises. Une différence sur `ouverture`, `coups` ou `attente.lectures[].heure` révèle l'un de ces défauts :
- une page qui garde un autre coup que celui qui a été joué ;
- une page qui lit l'heure en temps universel, ou dans le fuseau de la machine de test ;
- une page qui arrondit l'heure au lieu de la tronquer.

**Jamais comparé :** les durées réelles (`duree_*`), et rien d'autre. Aucun autre champ de la trace ne peut légitimement différer entre P et C : il n'y a ni date de production, ni version de programme, ni nom de machine. Si l'on veut garder ces renseignements, ils vont dans un fichier à côté de la trace.

Où regarder une différence :

| Partie de la trace | Contrôle du §9 |
|---|---|
| Dans `manches.*` : `possibles`, `mediane`, `classement`, `departages`, `remplacements`, `places`, `raison_cachee`, `ordre`, `cartes[].auteur`, `cartes[].cachee` | 6 |
| Dans les manches des personnages : `rangs`, `cotes_attendus`, `curseur_porteur`, `total`, `cartes[].designe`, `cartes[].raison_devinee` | 7 |
| `entree`, `cartes[].auteur_compte`, `revelation`, `dimanche` (sauf `phrase_semaine`) | 8 |
| `portrait`, `curseurs_vus`, `phrase_jour`, `dimanche.phrase_semaine` | 9 |
| `attente` (jamais « n'a pas joué »), `surprises_proches` | 10 |
| `mesures`, `agregats`, `carnet` | 12 et 13 |
| `ouverture`, `coups`, `attente.lectures[].heure` | rejeu : coups gardés égaux aux coups joués, heure locale |

### 4.3 Le carnet (contrôles 12 et 13)

- **Contrôle 13.** Le harnais rejoue les trois parties témoins sur la version du porteur, avec le même journal, et récupère le carnet copié. Il le compare au `carnet.texte` de la trace de C pour la même partie. Avant la comparaison, chaque durée est remplacée par « ‹durée› » dans les deux textes. Les durées se repèrent par l'expression régulière du §8.12. Les heures, fixées par le harnais, sont comparées.
- **Contrôle 12.**
  - `carnet.texte` ne contient jamais le pseudo (`seances[0].coups.pseudo`).
  - Trois variantes d'une même partie, rejouées avec la même horloge et les mêmes gestes, seules les réponses du joueur changeant (§9, contrôle 12) : séance par séance, les blocs de séance du carnet (et `seances[k].mesures`, hors `duree_*`) sont identiques ; seuls « Titres de la semaine » et « Sur tout l'essai » peuvent différer.
  - Le carnet suit exactement le gabarit du §8.12 : toute ligne qui n'y figure pas est un défaut.

### 4.4 Mettre l'horloge à l'épreuve

Au moins une partie témoin contient les cas suivants :
- une séance ouverte pendant l'heure jouée deux fois le 25 octobre 2026, avec une lecture à 02:30 à chacun des deux passages. Entre 02:00 et 03:00, l'heure passe une première fois à +02:00, puis une seconde fois à +01:00 ;
- deux lectures à 17:59 et à 18:00, aux bords de la journée de jeu ;
- une ouverture au moins deux jours après la précédente.

## 5. Changer le format

- `version` vaut 1 dans les deux fichiers. Tout changement de champ, de type ou de sens fait passer à la version 2. On met alors ce document à jour, et l'auteur du programme de contrôle le relit.
- La page refuse un fichier scellé dont le format ou la version est inattendu (étape V4). C refuse une trace ou un journal de version inattendue.
- Après la séance 0, le fichier scellé ne change plus (§9, « Correctif »), et son format non plus. Un correctif de la page peut changer la trace : on refait alors les contrôles (§9).

## 6. Points fixés depuis la version 1 de ce document

1. **Format du carnet** : §8.12 de la simulation (UX). Contraintes respectées : U+000A seulement, pas de tabulation, « Fin du carnet » sans retour final, durées repérables par une expression régulière, pas de pseudo, uniquement des comptes bruts (aucun arrondi).
2. **Mesures globales** : §8.4 (Game design) et partie 3.10. Trois chiffres restent dans la trace ; les autres, constants pour un fichier donné, vont au rapport de scellement.
3. **`jours_ecoules`** : différence entre les dates locales (heure de Paris) de deux ouvertures successives ; l'ouverture est le premier toucher du joueur dans la séance.
4. **Typographie** : §7.8 (UX). Le fichier scellé reste en typographie simple ; la page et C appliquent les mêmes règles à l'affichage ; la trace enregistre les phrases sous leur forme affichée.
5. **Plusieurs sources** : §7.1, écran 5.4 (UX).
