Sources lues : `.claude/agents/backend.md`, `CLAUDE.md`, `docs/decisions.md` (D-015 à D-035), `docs/essai/simulation-2.md` en entier, `docs/essai/a-ne-pas-ouvrir/schema.md` en entier, `docs/essai/a-ne-pas-ouvrir/regles-de-calcul.md`, `docs/essai/a-ne-pas-ouvrir-2/regles-de-calcul-2.md`, ainsi que les §0, §5 à §7.10 de `docs/essai/simulation.md`. Rien de ce qui suit n'est destiné au porteur.

---

# Schéma du fichier scellé et format des traces (second essai)

*Rédigé par Back-end le 9 octobre 2026, comme le demandent le §9 (« Avant d'écrire la page ») et l'annexe B de `docs/essai/simulation-2.md`. Ce document est un **écart** au schéma du premier essai (`docs/essai/a-ne-pas-ouvrir/schema.md`, appelé ici « S1 ») : **tout ce qui n'est pas dit ici reste comme dans S1**, numéros de règles compris. Versions : fichier scellé 5 ; trace de partie et journal 4 ; trace de l'histoire 1 (nouvelle) ; résumé de l'histoire 1 (nouveau) ; fichier des durées 2 ; phrases attendues 2. L'auteur du programme de contrôle relit ce document avant le lot 1. Le document sert aussi à l'agent qui scelle, à Contenu (parties 2.5, 2.10, 2.11, 5.1 étape 8), à l'auteur de la page et à l'instance Game design qui écrit les carnets de référence.*

*Rangé dans `a-ne-pas-ouvrir-2/` : les noms des champs dévoilent comment les personnages répondent et devinent (absences, réponses atypiques, rangs, α).*

*Renvois : « §n » renvoie à `simulation-2.md` ; « le fichier caché, point n » à `a-ne-pas-ouvrir-2/regles-de-calcul-2.md` ; « S1, partie n » au schéma du premier essai ; « partie n » à ce document.*

*Exemples : toutes les valeurs sont inventées, sans lien avec le lot ni avec les règles cachées. Ne pas s'en servir pour tester un calcul. Exceptions : les tables des parties 2.4 (calendrier, semaines) et 2.3 (membres). Ce sont les vraies valeurs, et le contrôle les exige.*

*Ordre de lecture :*
- *agent qui scelle : parties 1, 2, 3, 6 et 7.3 ;*
- *Contenu : parties 2.5, 2.10, 2.11 et 5.1 (étape 8) ;*
- *auteur de la page : tout ;*
- *auteur du programme de contrôle : parties 5 et 7.2 d'abord, puis tout le reste.*

## En bref

- **Mêmes principes qu'au premier essai** : JSON canonique (RFC 8785 et les trois règles de S1, partie 1.1), entiers et fractions exactes « p/q » seulement, embarquement en base64 derrière le repère `/*elenchos-scelle*/`. Les traces sont comparées octet pour octet, après masquage de la valeur des durées.
- **Le fichier scellé, version 5**, ajoute :
  - le calendrier en table (15 jours, deux sauts) et les 15 semaines ;
  - les membres avec leur jour d'entrée, et l'invitant (Valentin) ;
  - l'histoire : 90 textes abstraits H1 à H90, la fiche légère de H86, le numéro de tirage r, l'empreinte du résumé ;
  - 18 textes joués, avec l'objet du vote, les auteurs « commission » et « sans groupe », et les groupes en toutes lettres ;
  - le réglage : α, facteur, longueur de la barre, seuils stricts ;
  - le statut (« provisoire » ou « final »).
- **Le résumé de l'histoire est l'état à l'arrivée, en entier** (partie 3). C'est un objet JSON canonique, entièrement en ASCII. La page le calcule, le met en forme canonique, le hache en SHA-256 et compare le résultat à `histoire.resume_sha256` : c'est la vérification V6. Le résumé contient tout ce que la page reprend de l'histoire après l'arrivée, et rien d'autre. Un écart sur l'iPhone ne peut donc pas passer inaperçu.
- **Deux traces au lieu d'une** :
  - la **trace de l'histoire** (jours −90 à 0), écrite une fois par fichier scellé par trois auteurs (page témoin, contrôle, scellement) et comparée entre les trois ;
  - la **trace de partie** (jours 1 à 15), écrite pour chaque partie par la page témoin et par le contrôle, avec les sauts et le rattrapage.
- **La partie du porteur ne produit toujours aucune trace** (D-016).

## 1. Règles communes (écarts à S1, partie 1)

### 1.1 Forme canonique

Inchangée (S1, partie 1.1). Deux pièges de plus :
- **Clés-nombres.** Les clés « 0 » à « 15 » ressemblent à des index de tableau. En JavaScript, l'objet les range d'office avant les autres clés. Les clés « -1 » à « -90 », elles, gardent l'ordre d'insertion. Le canonicaliseur écrit donc lui-même toutes les clés, dans l'ordre des octets : « -1 », « -10 », … , « -9 », « -90 », « 0 ». C'est déjà la règle de S1.
- **Modulo des jours négatifs.** Les règles écrivent (j + 6) mod 4 et (j − 1) mod 7 au sens mathématique, avec un résultat positif. En JavaScript, `%` garde le signe : on écrit `((x % m) + m) % m`. En Python, `%` est déjà correct.

### 1.2 Types (changements et ajouts)

| Type | Écriture JSON | Contenu |
|---|---|---|
| texte | chaîne | `"E1"`, `"E2"`, `"E3"` ; `"H1"` à `"H90"` ; `"0"` à `"14"` pour T0 à T14. C'est l'écriture des clés de tirage (fichier caché, point 1). |
| jour | entier | de −90 à 15. Comme clé d'objet : écriture décimale, signe « - » (U+002D) devant un jour négatif, sans zéro initial ; le jour 0 s'écrit « 0 », jamais « -0 ». |
| tempérament | chaîne | `"original"`, `"pont"`, `"mesure"`, `"tranche"` |
| titre | chaîne | `"sans_faute"`, `"devin"`, `"mystere"`, `"fidele"` |
| objet du vote | chaîne | `"texte"`, `"article"`, `"amendement"`, `"motion"`, `"resolution"` |
| suite du texte | chaîne ou `null` | `null`, `"texte_tombe"`, `"texte_retire"` (partie 2.5) |

Les types fraction, heure, instant, date, hex16, hex64, personnage, membre, tension, niveau, raison et côté sont inchangés.

### 1.3 Conventions

- **Ordre des membres** dans un tableau : Agathe, Nassim, Odile, Valentin, porteur (inchangé).
- **Ordre des textes** dans un tableau : l'ordre du calendrier, c'est-à-dire E1, E2, E3, H1 … H90, 0 … 14.
- **Tensions** : les objets indexés par tension ne portent que les quatre tensions de l'essai, S, P, T et L. Les quatre tensions écartées ne sont jamais écrites.

## 2. Le fichier scellé, version 5

### 2.1 Vue d'ensemble

Le schéma est fermé : exactement ces clés, et aucune autre.

| Clé | Type | Contenu |
|---|---|---|
| `absences` | objet, une clé par personnage | partie 2.7 |
| `calendrier` | tableau de 15 objets | partie 2.4 |
| `cercle` | objet | partie 2.3 |
| `format` | chaîne | `"elenchos-essai-scelle"` (inchangé) |
| `graine` | hex16 | §0 : préfixe « elenchos-essai-2\|graine\| » |
| `histoire` | objet | partie 2.6 |
| `personnages` | objet | partie 2.2 |
| `reglage` | objet | partie 2.8 |
| `reponses` | objet, 108 clés | partie 2.7 |
| `reponses_atypiques` | objet, une clé par personnage | partie 2.7 |
| `semaines` | tableau de 15 objets | partie 2.4 |
| `statut` | `"provisoire"` ou `"final"` | partie 2.9 |
| `textes` | objet, 18 clés (E1 à E3, 0 à 14) | partie 2.5. Réserves non scellées. |
| `vecteurs_test` | tableau de 3 objets | partie 2.8 |
| `version` | entier | `5` |

### 2.2 Personnages

- L'objet `personnages` est **identique, octet pour octet**, au sous-objet `personnages` du fichier scellé du premier essai, une fois mis en forme canonique. C'est le contrôle 2 (« les mêmes personnages », D-032, D-033).
- Champs et sens : S1, partie 2.2.

### 2.3 Cercle

`cercle` vaut exactement :

`{"invitant":"Valentin","membres":[{"depuis":-90,"membre":"Agathe"},{"depuis":-90,"membre":"Nassim"},{"depuis":-90,"membre":"Odile"},{"depuis":-90,"membre":"Valentin"},{"depuis":1,"membre":"porteur"}],"nom":"Amis"}`

- **`invitant`** remplace `inviteuse` (S1). C'est le personnage dont le porteur devine les réponses d'entrée (« Défi de Valentin », fichier caché, point 3, 2.5). Le nom de la clé ne s'affiche jamais.
- **`membres`** : l'ordre des visages, et le premier jour où chacun est membre. `depuis` sert à trois choses :
  - les candidats d'une manche : un membre n'est pas proposé pour un texte répondu avant son entrée (§4) ;
  - Le Fidèle du nouveau venu (§6, point 4) ;
  - l'ancienneté des tempéraments (§6, point 8).

### 2.4 Calendrier et semaines

**`calendrier`** : un objet par jour, de 1 à 15, dans l'ordre. L'élément d'indice i est le jour i + 1.

| Clé | Type | Contenu |
|---|---|---|
| `jour` | jour | 1 à 15 |
| `nom_jour` | chaîne | « lundi » … « dimanche », tel qu'affiché (« Jour 7 · dimanche », « Aujourd'hui · jeudi ») |
| `type` | chaîne | `"joue"`, `"joue_puis_saut"`, `"saute"` ou `"cloture"` |
| `saut` | entier 1 ou 2, ou `null` | le saut auquel appartient le jour |
| `revele` | texte ou `null` | le texte révélé au cercle ce jour-là (répondu au jour j − 2) |
| `revelation_porteur` | `"aucune"`, `"lue"` ou `"jamais_lue"` | ce que le porteur vit de cette révélation (§0, E3). Avec ou sans cartes : cela dépend du journal (R10). |
| `manche` | texte ou `null` | le texte que les personnages devinent ce jour-là (répondu au jour j − 1) |
| `deviner_porteur` | booléen | le porteur peut ouvrir Deviner ce jour-là |
| `repondu` | texte ou `null` | le texte répondu ce jour-là, au rattrapage compris. Au jour 1, l'entrée E1 à E3 vient en plus, avant la manche de T0. |

Valeurs exigées, tirées du §0 :

| jour | nom_jour | type | saut | revele | revelation_porteur | manche | deviner_porteur | repondu |
|---|---|---|---|---|---|---|---|---|
| 1 | lundi | joue | null | H90 | aucune | 0 | true | 1 |
| 2 | mardi | joue | null | 0 | lue | 1 | true | 2 |
| 3 | mercredi | joue | null | 1 | lue | 2 | true | 3 |
| 4 | jeudi | joue_puis_saut | 1 | 2 | lue | 3 | false | 4 |
| 5 | vendredi | saute | 1 | 3 | jamais_lue | 4 | false | 5 |
| 6 | samedi | saute | 1 | 4 | jamais_lue | 5 | false | 6 |
| 7 | dimanche | joue | null | 5 | lue | 6 | true | 7 |
| 8 | lundi | joue_puis_saut | 2 | 6 | lue | 7 | false | 8 |
| 9 | mardi | saute | 2 | 7 | jamais_lue | 8 | false | 9 |
| 10 | mercredi | saute | 2 | 8 | jamais_lue | 9 | false | 10 |
| 11 | jeudi | saute | 2 | 9 | jamais_lue | 10 | false | 11 |
| 12 | vendredi | saute | 2 | 10 | jamais_lue | 11 | false | 12 |
| 13 | samedi | saute | 2 | 11 | jamais_lue | 12 | false | 13 |
| 14 | dimanche | joue | null | 12 | lue | 13 | true | 14 |
| 15 | lundi | cloture | null | 13 | lue | null | false | null |

Ce qui se lit dans cette table, sans rien d'écrit en dur :
- **Point de saut** : un jour de type `joue_puis_saut`. **Reprise** : le premier jour suivant de type `joue`.
- **Au jour 1, H90 est révélé au cercle**, mais le porteur n'en voit rien : il n'avait pas de manche sur H90. Cette révélation compte dans la semaine 14 (§0).

**`semaines`** : un objet par semaine, de 1 à 15, dans l'ordre : `{"dernier_jour", "numero", "premier_jour"}`.

| numero | premier_jour | dernier_jour |
|---|---|---|
| 1 | −90 | −84 |
| 2 | −83 | −77 |
| 3 | −76 | −70 |
| 4 | −69 | −63 |
| 5 | −62 | −56 |
| 6 | −55 | −49 |
| 7 | −48 | −42 |
| 8 | −41 | −35 |
| 9 | −34 | −28 |
| 10 | −27 | −21 |
| 11 | −20 | −14 |
| 12 | −13 | −7 |
| 13 | −6 | 0 |
| 14 | 1 | 7 |
| 15 | 8 | 14 |

Ce qu'une semaine compte (§0, fichier caché, point 9) :
- **Révélations** : les textes révélés pendant ses jours, c'est-à-dire répondus du jour `premier_jour − 2` au jour `dernier_jour − 2`. Exemples : semaine 1, H1 à H5 ; semaine 14, H90 et T0 à T5.
- **Réponses** : les textes répondus du jour `premier_jour − 1` au jour `dernier_jour − 1`. Exemples : semaine 1, H1 à H6 (six textes, point 9) ; semaine 14, T0 à T6.
- **Titres** : ils tombent le jour `dernier_jour`, un dimanche.
- Le jour 15 n'appartient à aucune semaine : la révélation de T13 n'est comptée dans aucune. Sa réponse (jour 13) compte en semaine 15 (Le Fidèle, phrase de la semaine). La réponse à T14 (jour 14) n'est comptée dans aucune semaine.

Le jour où un texte H est répondu est lu dans `histoire.textes.Hi.jour` (partie 2.6). Celui d'un texte T, dans `calendrier[].repondu`.

### 2.5 Textes joués (écarts à S1, partie 2.3)

`textes` a 18 clés : E1, E2, E3 et « 0 » à « 14 ». Chaque fiche garde les champs de S1 : `titre`, `lignes`, `vote`, `auteur`, `lien_scrutin`, `sources`, `tension`, `sens` et `considerations`. Les écarts sont les suivants.

**`titre`**
- 60 points de code au plus, en NFC.
- Sans « : » (E8).

**`vote`** : cinq clés, `{"date", "etape", "issue", "objet", "suite"}`.

| Clé | Valeurs | Sens |
|---|---|---|
| `objet` | `"texte"`, `"article"`, `"amendement"`, `"motion"`, `"resolution"` | ce sur quoi porte le scrutin (E4 ; §7.10). `"motion"` désigne une motion de rejet adoptée : le texte est rejeté avant l'examen de ses articles. `"resolution"` désigne une proposition de résolution (article 34-1 de la Constitution) : un texte qui invite le Gouvernement à agir, sans l'y obliger. |
| `issue` | `"adopte"`, `"rejete"` | le sort de l'objet ; pour `"motion"`, celui du texte. `"sans_vote_ensemble"` (S1) disparaît : un article voté seul s'écrit `objet: "article"`. |
| `etape` | `"navette"`, `"definitif"`, `"aucune"` | la phrase d'étape, comme dans S1 (§7.10 pour les mots). Elle dit seulement la navette. |
| `date` | date | inchangé |
| `suite` | `null`, `"texte_tombe"`, `"texte_retire"` | un fait du jour même du scrutin qui change le sort du texte entier (§7.10) : `"texte_tombe"`, le rejet de cet article a fait tomber tout le texte ; `"texte_retire"`, le texte entier a été retiré le jour même. `null` dans tous les autres cas. Relevé deux fois, avec sa preuve, dans `votes.md` (partie 5.1, étape 8). |

Combinaisons permises (contrôle 1, étape 5) :

| `objet` | `issue` | `etape` |
|---|---|---|
| `"texte"` | `"adopte"` | `"navette"` ou `"definitif"` |
| `"texte"` | `"rejete"` | `"navette"` ou `"aucune"` |
| `"article"`, `"amendement"` | `"adopte"` | `"navette"` ou `"aucune"` (jamais `"definitif"`, arbitrage du §7.10) |
| `"article"`, `"amendement"` | `"rejete"` | `"aucune"` |
| `"motion"` | `"rejete"` | `"aucune"` (§7.10 n'affiche aucune phrase d'étape) |
| `"resolution"` | `"adopte"` ou `"rejete"` | `"aucune"` (une résolution n'a pas de suite) |

Le gros titre d'une résolution reste « Texte adopté. » ou « Texte rejeté. » (D-014).

Combinaisons permises pour `suite` (contrôle 1, étape 5) :

| `suite` | `objet` | `issue` |
|---|---|---|
| `"texte_tombe"` | `"article"` seulement | `"rejete"` seulement |
| `"texte_retire"` | `"article"` ou `"amendement"` | `"adopte"` ou `"rejete"` |
| `null` | tous | toutes |

**`auteur`** : quatre formes.

| Forme | Clés | Affichage (§7.11, mots d'UX) |
|---|---|---|
| `{"type": "depute", "nom", "feminin", "groupe"}` | 4 | `groupe` : chaîne de la partie 2.10, ou `null` pour un député non inscrit (« {nom}, {député \| députée} sans groupe ») |
| `{"type": "senateur", "nom", "feminin", "groupe"}` | 4 | `groupe` : chaîne de la partie 2.10, jamais `null` |
| `{"type": "gouvernement"}` | 1 | « Proposé par le Gouvernement. » |
| `{"type": "commission", "libelle"}` | 2 | « Proposé par la {libelle}. » ; `libelle` est pris dans la partie 2.10 bis |

Pour un amendement, l'auteur est le premier signataire, avec son mandat et son groupe au dépôt (A.7, point 4). Pour un texte déposé par plusieurs personnes, l'auteur est la première personne nommée dans le texte déposé (§7.11) : `auteur` reste un seul objet.

**`considerations[i].depute`** : `{"elision", "feminin", "groupe", "nom"}`, comme dans S1. `groupe` est une chaîne de la partie 2.10, ou `null` pour un non-inscrit (« sans groupe », §7.11).

**Groupes** : toujours **en toutes lettres** (E5, D-030), jamais de sigle (arbitrage du §7.11). La forme est celle de la partie 2.10.

**Genre d'une raison (D-034)** : ce n'est pas un champ, il se calcule. On note π_c le pôle que sert le côté : s pour « pour », 1 − s pour « contre ». Une raison est alors :
- *attendue* si `pole` = π_c ;
- *inattendue croisée* si `pole` = 1 − π_c ;
- *inattendue pratique* si `pole` = `"aucun"`.

Contenu le dit (A.7, point 5) et le fichier caché, point 3, règle 2.2 bis, ne lit rien d'autre que le côté, le pôle et le sens. Ajouter un champ créerait une seconde source de vérité à tenir d'accord avec la première.

**Contrôles propres à D-034, par texte** (contrôle 1, étape 5 ; A.7, points 5 à 7) :
- chaque côté a deux raisons, dont au moins une attendue ;
- le nombre d'inattendues est le même des deux côtés, 0 ou 1 ;
- « aucun » n'apparaît que sur une inattendue, une fois par côté au plus.

### 2.6 Histoire

`histoire` contient trois clés.

| Clé | Type | Contenu |
|---|---|---|
| `resume_sha256` | hex64 | SHA-256 du résumé canonique de l'état à l'arrivée (partie 3). Seule l'empreinte est scellée ; la page ne s'en sert que pour V6. |
| `textes` | objet, 90 clés, de H1 à H90 | les textes abstraits (tableau ci-dessous) |
| `tirage` | entier, de 1 à 200 | le numéro r retenu au calibrage (fichier caché, point 10) |

Chaque `histoire.textes.Hi` contient :

| Clé | Type | Contenu |
|---|---|---|
| `jour` | jour | i − 91 |
| `tension` | tension | fichier caché, point 2 bis : indice (jour + 6) mod 4 dans l'ordre S, P, T, L |
| `sens` | 0 ou 1 | fichier caché, point 2 bis |
| `raisons` | tableau de 4 objets, dans l'ordre d'affichage | `{"cote": "pour" ou "contre", "pole": 0, 1 ou "aucun", "rang": 1 à 4}`. Le `rang` est égal à la place dans le tableau : c'est la valeur de `raison` dans les réponses. Ordre, côté et pôle : fichier caché, point 2 bis (clés « histoire-raisons », « histoire-inattendu », « ordre-raisons »). Aucun mot, aucun auteur. |
| `fiche` | objet ou `null` | `null` partout, sauf pour H86 : `{"titre": chaîne, "vote": objet vote de la partie 2.5}` |

- La fiche légère de H86 ne porte que ce que listent A.6 et l'annexe B : le titre affiché, puis le vote, relevé deux fois. Sa tension et son sens sont ceux de l'objet, qui doivent valoir P et 0 et égaler la fiche de Contenu (contrôle 1, étape 8).
- Le titre de H86 suit les règles des titres (60 points de code, sans « : »). Il est concerné par la typographie simple.
- **Les textes de l'histoire ne dépendent pas de r** (fichier caché, point 2 bis). Seuls les réponses atypiques et les absences de l'histoire en dépendent.

### 2.7 Réponses, absences, réponses atypiques

Mêmes formes que S1, partie 2.4, étendues à tous les textes.
- **`reponses`** : 108 clés, E1 à E3, H1 à H90, 0 à 14. Sous chaque clé, une entrée par personnage présent : `{"niveau", "raison"}`. Aux trois textes d'entrée, les quatre personnages ont une clé.
- **`absences.<personnage>`** : les textes, H ou T, où il ne répond pas, dans l'ordre du calendrier. Absent au texte du jour j, il ne joue pas non plus la manche du jour j (fichier caché, point 3, 2.4). Dans ce document, « présent » au jour j veut dire « pas absent au texte répondu ce jour-là ».
- **`reponses_atypiques.<personnage>`** : des objets `{"cote_tire", "texte"}`, dans l'ordre du calendrier.
  - `cote_tire` n'est non nul que si la réponse type était neutre (fichier caché, point 3, 2.3).
  - Les deux réponses atypiques imposées sur H86 y figurent comme les autres. Leur motif ne s'écrit pas : le contrôle le recalcule.
- **Ce qui se contrôle** (point 3, 2.3 et 2.4) :
  - jamais d'absence ni de réponse atypique sur E1 à E3, ni sur T14 ;
  - au plus une absence par texte ;
  - chaque texte a au moins trois réponses de personnages.

### 2.8 Graine, vecteurs de test, réglage

- **Graine** : les 16 premiers chiffres hexadécimaux de SHA-256(« elenchos-essai-2|graine| » + E), où E est l'empreinte, en 40 chiffres hexadécimaux, du commit de `simulation-2.md` relue (§0).
- **`vecteurs_test`**, dans cet ordre (§0) :
  1. t("raison|Odile|E2|3") ;
  2. t("hasard|Nassim|13|porteur") ;
  3. t("ecart-hstar|1|Valentin").

  Chaque objet a la forme de S1, partie 2.5.
- **`reglage`** vaut `{"alpha", "barre", "facteur", "seuils_stricts"}`.

| Clé | Type | Valeurs permises | Qui s'en sert |
|---|---|---|---|
| `alpha` | fraction | `"1/6"`, `"1/4"` (par défaut), `"1/3"` | scellement et contrôle (réponses atypiques) ; la page, pour le texte du dévoilement (« une réponse sur {cinq} » : le mot du nombre 1/α + 1, soit sept, cinq ou quatre ; fichier caché, point 3, 2.3) |
| `barre` | entier | `16` seulement | la page (§5.8) |
| `facteur` | entier | `2`, `3` (par défaut) ou `4` | la page et le contrôle (§5.9) |
| `seuils_stricts` | booléen | | la page et le contrôle (côté attendu du porteur, comme au premier essai) |

- **Ce qui reste hors du fichier** : les seuils des tempéraments, du Pas de Côté et de la netteté. Chaque programme les tient de la spécification (annexe B).

### 2.9 Statut et candidat en deux temps

- **`statut`** vaut :
  - `"provisoire"` pour le candidat 1, qui a des textes de travail (« Lots et délai ») ;
  - `"final"` pour le candidat final et pour le fichier scellé.
- **Le code de la page ne lit pas ce champ.** C'est le programme de construction qui refuse d'embarquer un fichier `"provisoire"` dans la version du porteur. Les deux versions restent identiques hors du bloc de trace (contrôle 5).
- Le contrôle 1 exige `"final"` sur le fichier publié (partie 5.1, étape 4).

### 2.10 Groupes permis (remplace S1, partie 2.7)

Table remplie par Contenu à partir des fiches corrigées, vérifiée par le second agent de l'annexe A. La page ne lit pas ce tableau ; le programme de contrôle le lit, selon les règles de lecture de S1, partie 2.7.

En-tête exact :

| `groupe` | Chambre | Législature | Identifiant | Source |
|---|---|---|---|---|
| `Démocrate (MoDem et Indépendants)` | Assemblée | 16 | PO800484 | libelle de PO800484 ; « Mme Géraldine Bannier (DEM) », CRSANR5L16S2024O1N018, l. 235 (DEM : code, pas le nom) |
| `Écologiste - NUPES` | Assemblée | 16 | PO800526 | libelle de PO800526 ; « M. Charles Fournier (ECOLO) », CRSANR5L16S2023E1N027, l. 704 (ECOLO : code, pas le nom) ; auteur de 840 (Nicolas Thierry) au dépôt |
| `Gauche démocrate et républicaine - NUPES` | Assemblée | 16 | PO800502 | libelle de PO800502 ; « M. Édouard Bénard (GDR-NUPES) », CRSANR5L16S2024O1N123, l. 717 |
| `Horizons et apparentés` | Assemblée | 16 | PO800514 | libelle de PO800514 ; « M. Jérémie Patrier-Leitus (HOR) », CRSANR5L16S2024O1N018, l. 35 |
| `La France insoumise - Nouvelle Union Populaire écologique et sociale` | Assemblée | 16 | PO800490 | libelle de PO800490 ; « Mme Clémence Guetté (LFI-NUPES) », CRSANR5L16S2023O1N090, l. 554 ; auteur de 707 (Maxime Laisney) au dépôt |
| `Les Républicains` | Assemblée | 16 | PO800508 | libelle de PO800508 ; « M. Thibault Bazin (LR) », CRSANR5L16S2024O1N123, l. 825 |
| `Libertés, Indépendants, Outre-mer et Territoires` | Assemblée | 16 | PO800532 | libelle de PO800532 ; « M. Michel Castellani (LIOT) », CRSANR5L16S2023O1N119, l. 409 |
| `Rassemblement National` | Assemblée | 16 | PO800520 | libelle de PO800520 ; « M. Pierre Meurin (RN) », CRSANR5L16S2024O1N123, l. 957 |
| `Renaissance` | Assemblée | 16 | PO800538 | libelle de PO800538 ; « Mme Barbara Pompili (RE) », CRSANR5L16S2023O1N090, l. 733 ; auteur de 3370 (David Valence) au dépôt |
| `Socialistes et apparentés` | Assemblée | 16 | PO830170 | libelle de PO830170 ; « M. Stéphane Delautrette (SOC-A) », CRSANR5L16S2024O1N123, l. 711 (SOC-A : code, pas le nom) ; organe ouvert le 19 octobre 2023, en vigueur le 14 février 2024 |
| `Droite Républicaine` | Assemblée | 17 | PO845425 | libelle de PO845425 ; « M. Nicolas Ray (DR) », CRSANR5L17S2025O1N160, l. 974 |
| `Écologiste et Social` | Assemblée | 17 | PO845439 | libelle de PO845439 ; « Mme Sandra Regol (ECOS) », CRSANR5L17S2025O1N143, l. 899 (ECOS : code, pas le nom) |
| `Ensemble pour la République` | Assemblée | 17 | PO845407 | libelle de PO845407 ; « M. Sébastien Huyghe (EPR) », CRSANR5L17S2025O1N143, l. 887 |
| `Gauche Démocrate et Républicaine` | Assemblée | 17 | PO845514 | libelle de PO845514 ; « Mme Elsa Faucillon (GDR) », CRSANR5L17S2026E1N002, l. 86 |
| `Horizons & Indépendants` | Assemblée | 17 | PO845470 | libelle de PO845470 ; « M. Laurent Marcangeli (HOR) », CRSANR5L17S2026E1N002, l. 119 |
| `La France insoumise - Nouveau Front Populaire` | Assemblée | 17 | PO845413 | libelle de PO845413 ; « Mme Gabrielle Cathala (LFI-NFP) », CRSANR5L17S2025O1N143, l. 877 |
| `Les Démocrates` | Assemblée | 17 | PO845454 | libelle de PO845454 ; « M. Marc Fesneau (DEM) », CRSANR5L17S2025O1N129, l. 205 (DEM : code, pas le nom) |
| `Libertés, Indépendants, Outre-mer et Territoires` | Assemblée | 17 | PO845485 | libelle de PO845485 ; « M. Charles de Courson (LIOT) », CRSANR5L17S2026O1N048, l. 570 |
| `Rassemblement National` | Assemblée | 17 | PO845401 | libelle de PO845401 ; « M. Michaël Taverne (RN) », CRSANR5L17S2025O1N143, l. 885 |
| `Socialistes et apparentés` | Assemblée | 17 | PO845419 | libelle de PO845419 ; « M. Hervé Saulignac (SOC) », CRSANR5L17S2025O1N160, l. 409 |
| `Union des droites pour la République` | Assemblée | 17 | PO872880 | libelle de PO872880 ; « M. Matthieu Bloch (UDDPLR) », CRSANR5L17S2026O1N268, l. 459 (UDDPLR : code, pas le nom) ; organe ouvert le 5 septembre 2025, en vigueur le 11 juin 2026 |
| `Rassemblement des démocrates, progressistes et indépendants` | Sénat | — | PO732421 | libelle de PO732421 ; auteur de E2 (Georges Patient) au dépôt, 3 décembre 2025 ; organe du Sénat (codeType GROUPESENAT), en vigueur depuis le 28 juin 2017 ; libelleAbrege « RDPI », libelleAbrev « LREMP » (codes, pas le nom) |

- **`groupe`** : le nom officiel en toutes lettres, avec la casse de l'institution (`libelle` de l'organe dans l'open data), entre accents graves. Par exemple `Écologiste et Social` ou `Libertés, Indépendants, Outre-mer et Territoires`.
- **Chambre, Législature, Identifiant, Source** : comme dans S1. La Source donne le `libelle` de l'organe et une ligne de compte rendu quand elle existe.

**Règle du moment** (§7.11 ; A.7, point 2) : fait foi le `libelle` de l'organe dont l'élu était membre à la date retenue, le dépôt pour l'auteur, la séance pour une raison. Si ce libellé n'est qu'un sigle, l'élu n'est pas retenu : pour une raison, on prend un autre orateur ; pour l'auteur, le texte passe en réserve. On ne prend jamais le libellé d'un autre organe, même successeur et même s'il désigne le même groupe : dire que deux organes sont « le même groupe » demanderait un jugement, et la règle doit rester mécanique (identifiant et date).

**Règles d'écriture du `groupe`** (vérifiées par le contrôle) :
- caractères permis : les lettres de S1, les chiffres de 0 à 9, l'espace U+0020, le trait d'union U+002D, la virgule, « & », l'apostrophe droite U+0027 et les parenthèses ;
- pas d'espace au bord, ni d'espace double ;
- chaque virgule est suivie d'une espace et précédée d'une lettre ;
- un trait d'union est soit entre deux lettres ou chiffres (« Outre-mer »), soit entre deux espaces (« La France insoumise - Nouveau Front Populaire ») ;
- les parenthèses sont équilibrées ;
- 70 points de code au plus (60 jusqu'au 10 octobre 2026 : la limite est un garde-fou contre une erreur de copie, pas une règle d'affichage, et elle ne doit pas guider le choix des orateurs ; le libellé officiel reste entier, jamais abrégé).

**Règles d'ensemble** :
- une ligne par nom, chambre et législature ;
- un identifiant n'apparaît qu'une fois dans le tableau ;
- chaque couple (chambre, nom) du tableau sert au moins une fois dans le fichier ;
- un nom n'est jamais un sigle ni un code interne. Le contrôle 1 le vérifie sur la source, et non plus par une seule liste de codes :
  - pour chaque Identifiant, il lit le fichier de l'organe dans les données ouvertes (`amo`), et note au rapport son chemin et son SHA-256 ;
  - il vérifie que `groupe` est égal au `libelle` de l'organe, en NFC, à l'identique ;
  - il refuse un `libelle` égal au `libelleAbrege` ou au `libelleAbrev` du même organe (un organe dont le libellé n'est qu'un sigle ne fournit donc aucun groupe) ;
  - **repli**, si la copie locale d'`amo` n'est pas utilisable : la liste des codes interdits de S1, plus `LREMP`, `RDPI` et `UDR`, plus tous les `libelleAbrege` des organes du lot ; un `groupe` égal à l'un de ces codes est refusé ;
  - un nom officiel qui contient un sigle dans son libellé (par exemple « Écologiste - NUPES ») passe : la règle vise un sigle à la place du nom, pas un sigle qui fait partie du nom officiel.

**Lignes** remplies par Contenu le 10 octobre 2026 sur le lot final (22 lignes : 10 en 16e législature, 11 en 17e, 1 au Sénat), dans le tableau ci-dessus. Chaque `libelle` et chaque identifiant ont été relus dans la copie locale d'`amo`, et l'organe est celui dont l'élu était membre à la date de la règle du moment. La réserve T (scrutin 5242) n'ajoute aucune ligne.

### 2.10 bis Commissions permises (nouveau)

En-tête exact :

| `libelle` | Identifiant | Source |
|---|---|---|
| `commission spéciale sur la simplification de la vie économique` | PO849474 | Commission spéciale chargée d’examiner le projet de loi de simplification de la vie économique (94 points de code une fois la première lettre en minuscule, donc forme courte) ; forme courte rédigée par Contenu, relue par UX |

- **`libelle`** : le libellé court, entre accents graves, avec une minuscule au début et commençant par « commission ». Par exemple `commission des affaires sociales`.
- Caractères : ceux de la partie 2.10, sans « & » ni parenthèses. 80 points de code au plus.
- **Forme courte d'une commission spéciale.** Si le libellé officiel, une fois mis en minuscule au début, dépasse 80 points de code, le `libelle` s'écrit « commission spéciale sur {intitulé court du projet} ». La colonne Source donne alors le libellé officiel de l'organe, suivi de « forme courte rédigée par Contenu, relue par UX ». Pour une telle ligne, le contrôle ne vérifie que la forme (règles ci-dessus) ; la fidélité de la forme courte relève des deux relectures. (Arbitrage de l'orchestrateur, 10 octobre 2026 : pour l'article ajouté en commission spéciale, la commission plutôt que le premier signataire de l'amendement de commission, introuvable dans les données locales ; Game design préférait le signataire.)
- Chaque `auteur.libelle` du fichier figure au tableau, et chaque ligne sert au moins une fois.

**Lignes** remplies par Contenu le 10 octobre 2026 sur le lot final (1 ligne, pour le texte 2190), dans le tableau ci-dessus.

### 2.11 Initiales et élision

S1, partie 2.8, s'applique tel quel aux `depute` des considérations. Le tableau est vidé, puis rempli de nouveau par Contenu sur le lot final, et relu par UX. L'en-tête et les règles de lecture sont inchangés.

Lignes remplies par Contenu le 10 octobre 2026 sur le lot final (14 noms, 15 citations ; Anne Stambach-Terrenoir est citée deux fois, aux textes 6770 et 3708). Les auteurs ne figurent pas au tableau : seul un `depute` de considération peut suivre « de ». Les deux « H » sont muets, et « Yannick » se dit avec le son y (« de Yannick Monnet »).

| `nom` | Initiale | Forme |
|---|---|---|
| `Alexandra Martin` | voyelle | `d'` |
| `Alma Dufour` | voyelle | `d'` |
| `Amélia Lakrafi` | voyelle | `d'` |
| `Anne Stambach-Terrenoir` | voyelle | `d'` |
| `Aude Luquet` | voyelle | `d'` |
| `Édouard Bénard` | voyelle | `d'` |
| `Élisa Martin` | voyelle | `d'` |
| `Elsa Faucillon` | voyelle | `d'` |
| `Emmanuel Maquet` | voyelle | `d'` |
| `Hervé de Lépinau` | h muet | `d'` |
| `Hervé Saulignac` | h muet | `d'` |
| `Isabelle Périgault` | voyelle | `d'` |
| `Olga Givernet` | voyelle | `d'` |
| `Yannick Monnet` | son y | `de` |

### 2.12 Exemples (valeurs inventées, sauf le calendrier)

Un jour du calendrier, en forme canonique :

`{"deviner_porteur":false,"jour":4,"manche":"3","nom_jour":"jeudi","repondu":"4","revelation_porteur":"lue","revele":"2","saut":1,"type":"joue_puis_saut"}`

Un texte de l'histoire. Les valeurs sont inventées. Ce texte a une inattendue pratique de chaque côté :

`"H7":{"fiche":null,"jour":-84,"raisons":[{"cote":"contre","pole":0,"rang":1},{"cote":"pour","pole":"aucun","rang":2},{"cote":"pour","pole":1,"rang":3},{"cote":"contre","pole":"aucun","rang":4}],"sens":1,"tension":"T"}`

Un vote d'amendement rejeté, un vote d'article rejeté qui a fait tomber le texte entier, puis un auteur commission, puis un auteur non inscrit :

`"vote":{"date":"2025-02-13","etape":"aucune","issue":"rejete","objet":"amendement","suite":null}`

`"vote":{"date":"2025-03-20","etape":"aucune","issue":"rejete","objet":"article","suite":"texte_tombe"}`

`"auteur":{"libelle":"commission des affaires sociales","type":"commission"}`

`"auteur":{"feminin":true,"groupe":null,"nom":"Prénom Nom","type":"depute"}`

Le réglage par défaut :

`"reglage":{"alpha":"1/4","barre":16,"facteur":3,"seuils_stricts":false}`

## 3. Le résumé de l'histoire (V6)

### 3.1 La coupure

- **`histoire(scellé, calendrier)` couvre les jours −90 à 0 inclus.** Elle calcule :
  - les manches jouées ces jours-là, celle du jour 0 sur H90 comprise ;
  - les révélations de ces jours-là (H1 à H89) ;
  - les titres des semaines 1 à 13 ;
  - les tempéraments du jour 0.
- **`calculer(scellé, état, journal)` couvre les jours 1 à 15.** Elle commence par la révélation de H90 au jour 1, qui compte en semaine 14. Pour cette révélation, elle lit la manche du jour 0 dans l'état.
- Cela précise la « règle de la coupure » du §8.8 (« tout texte révélé après l'arrivée passe par le calcul de chaque geste »). La manche sur H90 se joue à quatre, sans le porteur. Elle ne dépend donc pas de lui, mais sa révélation entre dans la semaine 14 (partie 8, point GD-1).

### 3.2 Contenu : l'état à l'arrivée, en entier

Le résumé contient **tout ce que `calculer` reprend de l'histoire**. Les réponses scellées n'y sont pas : `calculer` les relit directement dans le fichier.

```
{
  "curseurs": {
    "<personnage>": {"<tension>": {"c": fraction, "somme_w": fraction}, …}
  },
  "format": "elenchos-essai-resume-histoire",
  "manche_jour_0": {
    "devineurs": {"<personnage>": [carte, …]},
    "texte": "H90"
  },
  "temperaments": {"<personnage>": [tempérament, …]},
  "tirage": entier,
  "titres": [semaine, …],
  "version": 1
}
```

- **`curseurs`** :
  - quatre personnages, quatre tensions ;
  - calculés sur l'entrée et sur H1 à H90, avec les poids normaux (§5.1, §5.2) ;
  - c'est à la fois le curseur vu par le porteur au jour 1 (textes répondus jusqu'au jour −1) et le point de départ du curseur « juste avant » du Pas de Côté de T0 ;
  - pour Le Pas de Côté sur H90 (révélé au jour 1, dans `calculer`), le curseur « juste avant » s'obtient en retirant de ces sommes la réponse à H90, lue dans le fichier. Si cette réponse est un arbitrage net (w = 1, pôle π), le curseur d'avant H90 a Σw = somme_w − 1 et Σw·π = c·(4 + somme_w) − 2 − π. Sinon, ou si le personnage était absent à H90, il n'y a pas de Pas de Côté (§6, point 7 : il faut un arbitrage net). Le résumé ne change pas ;
  - `c` vaut (2 + Σ w·π) / (4 + Σ w).
- **`manche_jour_0`** :
  - une clé par personnage présent au jour 0 ;
  - ses cartes dans l'ordre d'affichage, sous la forme `{"auteur", "auteur_compte", "cachee", "designe", "raison_devinee"}` (partie 4.3.4).
- **`temperaments`** : une clé par personnage. Un tableau, éventuellement vide, dans l'ordre d'affichage (L'Original, Le Pont, Le Mesuré, Le Tranché), calculé au jour 0 (§6, point 8).
- **`titres`** : 13 objets, des semaines 1 à 13, dans l'ordre. Chacun vaut `{"devin": personnage ou null, "fidele": [personnages], "mystere": personnage ou null, "sans_faute": [personnages], "semaine": 1 à 13, "surprise": texte ou null}`. La surprise suit le fichier caché, point 9 : seuls les textes qui ont un titre sont candidats. Elle vaut donc `null` des semaines 1 à 12, et « H86 » en semaine 13 sur le fichier retenu (critère c3).

### 3.3 Encodage et empreinte

- **Forme canonique** : S1, partie 1.1. Toutes les chaînes du résumé sont en ASCII ; le résumé ne dépend donc d'aucune normalisation Unicode.
- **Fractions** : forme « p/q » irréductible, ou « p » si la valeur est entière. Le signe est au numérateur.
- **Ordre** : les clés suivent l'ordre des octets. Les tableaux suivent l'ordre défini ci-dessus : membres, semaines croissantes, cartes dans l'ordre d'affichage, tempéraments dans l'ordre d'affichage.
- **Empreinte** : SHA-256 des octets UTF-8 du résumé canonique, en 64 chiffres hexadécimaux minuscules.

### 3.4 Qui le calcule, où il va

- **Le scellement** écrit le résumé :
  - en entier, dans le fichier `resume-histoire.json` joint au rapport de scellement (forme canonique, sans fin de ligne) ;
  - en empreinte, dans `histoire.resume_sha256`.
- **Le programme de contrôle** recalcule le résumé à partir du fichier scellé. Il le compare octet pour octet au fichier du scellement, puis son empreinte à celle du fichier scellé.
- **La page** suit cet ordre au chargement :
  1. V1 à V5 ;
  2. `histoire()` ;
  3. mise en forme canonique du résumé, avec le canonicaliseur qui existe déjà ;
  4. SHA-256 ;
  5. **V6** : comparaison à `histoire.resume_sha256`. Un écart, ou une erreur pendant `histoire()`, arrête la page : arrêt 1 du §8.11 de `simulation.md`, repère V6 (à confirmer par UX) ;
  6. premier écran.
- **La version témoin** écrit aussi le résumé dans la trace de l'histoire (partie 4.2).
- **Pas de circularité** : le résumé ne contient aucune empreinte ; il se calcule sans `resume_sha256`.

Exemple tronqué, valeurs inventées :

`{"curseurs":{"Agathe":{"L":{"c":"7/10","somme_w":"21/2"}}},"format":"elenchos-essai-resume-histoire","manche_jour_0":{"devineurs":{"Agathe":[{"auteur":"Nassim","auteur_compte":"Nassim","cachee":false,"designe":"Odile","raison_devinee":null}]},"texte":"H90"},"temperaments":{"Agathe":[]},"tirage":3,"titres":[{"devin":"Odile","fidele":["Agathe","Nassim"],"mystere":null,"sans_faute":[],"semaine":1,"surprise":null}],"version":1}`

## 4. Les traces

### 4.1 Principe (écarts à S1, partie 3.1)

**Deux traces.**
- **La trace de l'histoire** (`elenchos-essai-trace-histoire`) : une par fichier scellé. Elle a trois auteurs :
  - P, la version témoin, par un point d'entrée du harnais qui appelle `histoire()` ;
  - C, le programme de contrôle ;
  - S, le programme de scellement.

  Les trois sont comparées deux à deux, octet pour octet, sans aucun masquage, puisqu'elles ne contiennent pas de durée.
- **La trace de partie** (`elenchos-essai-trace`) : une par partie témoin ou au hasard, écrite par P et par C, puis comparée comme dans S1, partie 4.2.

**Inchangé** : les modes `interface` et `moteur`, l'horloge fixée par le harnais, les versions de la page, les relevés hors de la mémoire et le pseudo des témoins (S1, partie 3.1).

**Taille, estimation non mesurée** :
- trace de l'histoire : 0,4 à 1 Mo ;
- trace de partie : 80 à 200 Ko.

### 4.2 La trace de l'histoire, version 1

| Clé | Type | Contenu |
|---|---|---|
| `format` | chaîne | `"elenchos-essai-trace-histoire"` |
| `version` | entier | `1` |
| `empreinte_scelle` | hex64 | SHA-256 du fichier scellé |
| `jours` | objet, clés « -90 » à « 0 » | une entrée par jour (ci-dessous) |
| `semaines` | tableau de 13 objets | les titres des semaines 1 à 13, avec leurs décomptes : la forme de S1, partie 3.9, sans `phrase_semaine` ni `pas_de_cote` ; `sans_faute` suit R7 (§6, point 6), chaque semaine. Dans `surprise`, `attributions` et `erreurs` portent tous les textes révélés dans la semaine, titrés ou non, pour que le contrôle vérifie le critère c3. Les clés `points`, `raisons`, `tentatives` et `erreurs` portent les quatre personnages. |
| `arrivee` | objet | `{"curseurs", "resume", "resume_sha256", "temperaments"}` |

**`jours.<j>`** vaut `{"manches", "repondu", "revelation"}`.
- **`repondu`** : le texte répondu ce jour-là (« 0 » au jour 0).
- **`manches`** : une clé par personnage présent qui joue une manche ce jour-là, sur le texte du jour j − 1. Au jour −90, l'objet est vide. Le contenu de chaque manche est décrit en partie 4.3.4.
- **`revelation`** : `null` aux jours −90 et −89. Sinon, `{"devineurs", "pas_de_cote", "texte"}` (partie 4.3.5), sans `avis_cercle` : un texte abstrait n'a pas de vote.

**`arrivee`** :
- **`curseurs`** : par personnage, puis par tension, `{"c", "l", "net", "somme_w"}`.
- **`temperaments`** : par personnage, le détail du jour 0 (partie 4.3.8).
- **`resume`** : l'objet de la partie 3.
- **`resume_sha256`** : son empreinte.

### 4.3 La trace de partie, version 4

#### 4.3.1 La partie

| Clé | Contenu |
|---|---|
| `format`, `version` | `"elenchos-essai-trace"`, `4` |
| `empreinte_scelle` | inchangé |
| `resume_histoire` | hex64 : l'empreinte que l'auteur de la trace a calculée lui-même (V6 pour P) |
| `partie` | inchangé |
| `jours` | objet, une clé par jour atteint, de « 1 » à « K » (partie 4.3.2) |
| `sauts` | tableau, 0 à 2 éléments, un par saut confirmé, dans l'ordre (partie 4.3.9) |
| `arret`, `fin` | partie 4.3.3 |
| `agregats` | partie 4.3.10 |
| `carnet`, `copies` | partie 4.3.11 |

#### 4.3.2 Un jour

Dans ce tableau, « joué » désigne les jours de type `joue`, « point de saut » ceux de type `joue_puis_saut` et « sauté » ceux de type `saute`.

| Clé | Présente quand (sinon `null`) | Contenu |
|---|---|---|
| `ouverture` | jours joués, points de saut, clôture (jamais un jour sauté) | entrée : premier toucher du jour, quel qu'il soit. Au jour 1, c'est le premier toucher de la partie, pages du cadre comprises. |
| `versions` | avec `ouverture`, en mode `interface` | comme dans S1. Au jour 4 ou 8, les touchers comptés vont jusqu'au toucher qui confirme le saut. |
| `etapes` | jours joués, en mode `interface` | entrée : `{"deviner", "entree", "repondre"}`. `deviner` et `repondre` sont des booléens ; `entree` (l'écran 1.2 a été affiché) est un booléen au jour 1 et vaut `null` les autres jours. |
| `coups` | toujours | partie 4.3.3 |
| `entree` | jour 1, dès que 1.2 a été affiché | `{"justes", "textes"}`. Chaque texte E vaut `{"invitant": {"niveau", "raison"}, "juste": booléen ou null}`. Le pari est juste s'il est du bon côté (D-011). |
| `manches` | jours 1 à 14 | par devineur. Chaque personnage présent joue. Le porteur n'a une clé que si sa manche a été ouverte, c'est-à-dire si `coups.deviner` n'est pas nul. |
| `revelation` | jours 1 à 15 | partie 4.3.5 |
| `message` | jours joués sauf le jour 1, et points de saut | `{"forme": "cartes", "vote" ou "question", "titres": booléen}` (E1, §0). `titres` n'est vrai que le dimanche, s'il y a au moins un titulaire. |
| `phrase_jour` | chaque jour où le porteur a répondu, rattrapage compris | comme dans S1, partie 3.8 |
| `attente` | jours joués dont la journée est finie | comme dans S1. Le 2.5 réduit du rattrapage ne lit pas l'heure. |
| `dimanche` | jours 7 et 14 | partie 4.3.8 |
| `portrait` | toujours | partie 4.3.6 |
| `curseurs_vus` | toujours | par personnage et par tension, `{"c", "l", "net", "somme_w"}` : entrée et textes répondus jusqu'au jour j − 2, poids normaux |
| `cercle` | toujours | partie 4.3.7 |
| `surprises_proches` | toujours | comme dans S1. Un jumeau désigné n'y entre pas (D-024), ni une passe, ni un texte d'entrée. |
| `mesures` | jours joués, points de saut, clôture | partie 4.3.10 |

À la clé d'un arrêt, les règles de S1, partie 3.3, s'appliquent.

#### 4.3.3 Les coups (entrées)

| Clé | Présente quand | Contenu |
|---|---|---|
| `pseudo` | jour 1, écrit avec `compte`, dans la même écriture, à la fin du compte (partie 4.4, règle 6) | inchangé |
| `consentement` | jour 1, après 1.3 | `true` |
| `entree` | jour 1 | E1, E2, E3, chacun `{"pari", "reponse"}` (S1) |
| `compte` | jour 1, à la fin du compte | `"apple"`, `"google"`, `"email_valider"`, `"email_plus_tard"` (D-035 ; ligne « Compte » du §8.12) |
| `deviner` | jours où `deviner_porteur` est vrai et où l'écran Deviner s'est affiché | `{"cartes": [{"designe", "raison"}, …], "validee": booléen}`. Sinon `null` : la manche n'a jamais été ouverte et n'a pas de cartes (R10). |
| `abandon` | jours joués | booléen : le lien « Abandonner cette journée » a été confirmé par « Aller au jour suivant » |
| `annuler_saut` | jours 4 et 8 | entier : nombre de touchers « Annuler » sur la page du saut |
| `relire` | toujours | entier |
| `rouvrir` | toujours | entier : « Reprendre » ou « Revoir la révélation » (E3) |
| `ouvert` | toujours | `{"cercle", "moi", "proche", "qui_est_qui"}`, quatre entiers. Les ouvertures faites pendant un saut confirmé vont dans `sauts[].coups`. |
| `pendant_deviner` | quand `deviner` n'est pas nul | `{"cercle", "proche"}`, deux entiers (mesure de D-023) |
| `reponse` | quand le porteur a répondu au texte `repondu` du jour, au rattrapage compris | `{"niveau", "raison"}` |
| `carnet` | toujours | `{"hesite", "moment", "moment_semaine", "saut_clair"}` (codes ci-dessous). Chaque clé vaut `null` si la question n'a pas été posée ou n'a pas eu de réponse. |

**Visages posés (R10, §0).**
- `cartes[i].designe` est la dernière valeur posée sur la carte : un membre, `"passe"`, ou `null` si la carte est restée vide.
- Au premier affichage de Deviner, la page écrit l'objet en une seule écriture : une carte `{"designe": null, "raison": null}` par carte servie, et `validee` à `false`. Ensuite, chaque geste est une seule écriture : poser un visage déjà posé ailleurs vide sa carte d'origine ; `raison` revient à `null` dès que `designe` n'est plus un personnage.
- `validee` dit si « Valider » a été touché.
- Une manche non validée compte comme le dit le §0 : un visage posé compte, une passe posée compte comme une passe, une carte vide compte comme passée.
- `mesures.passer` ne compte que les `"passe"` posées.

**Codes du carnet** (libellés : §8.3, §8.5).

| Champ | Codes, dans l'ordre d'affichage |
|---|---|
| `moment`, jour 1 | `defi`, `deviner`, `donner_avis`, `phrase_jour`, `aucun` |
| `moment`, jours 2 et 3 | `revelation`, `deviner`, `donner_avis`, `phrase_jour`, `aucun` |
| `moment`, jours 7 et 14 | `revelation`, `titres`, `phrase_semaine`, `deviner`, `donner_avis`, `phrase_jour`, `aucun` |
| `saut_clair` (jour 7) | `non`, `en_partie`, `oui` |
| `hesite` (tableau, jours 7 et 14) | `deviner`, `repondre`, `revelation`, `avis_cercle`, `titres`, `cercle`, `portrait`, `saut`, `ailleurs`, `nulle_part` |
| `moment_semaine` | `revelation`, `avis_cercle`, `titres`, `phrase_semaine`, `deviner`, `donner_avis`, `phrase_jour`, `cercle`, `portrait`, `aucun` |
| F2 | inchangés |
| `servi` | `souvenir`, `defi`, `revelations`, `cercle`, `rien` |
| `regle` | `pas_claire`, `claire_etrange`, `claire`, `pas_lue` |
| `avis` | `sans_apprendre`, `apprenait`, `pas_lu` |
| `raisons` | `pas_plus`, `un_peu`, `nettement` |
| `portrait` | `ressemblait_pas`, `un_peu`, `ressemblait`, `pas_regarde` |
| `barre` | `pas_remarquee`, `sans_savoir`, `comprise` |
| `suspense` | `sans`, `un_peu`, `vrai` |
| raison d'arrêt | inchangés |

- `arret` vaut `{"f2", "jour", "raison"}`. Le carnet déduit du journal « pendant l'entrée » (`compte` nul au jour 1) ou « pendant le {premier | second} saut » (`arret.jour` est un jour de ce saut confirmé, ou son jour de reprise sans ouverture, règle 4).
- `fin` vaut `{"avis", "barre", "f2", "portrait", "raisons", "regle", "servi", "suspense"}`.
- F1 disparaît (§8.5).

#### 4.3.4 Une manche (écarts à S1, partie 3.6)

- **`texte`** : le texte du jour j − 1.
- **Nouveau, `candidats`** : un tableau de membres. Ce sont les membres proposés, dans l'ordre des visages. Au jour 1, une manche de personnage ne propose pas le porteur (§4).
- **`possibles.<auteur>`** vaut `{"c", "distance", "l", "net", "niveau", "raison", "rarete", "somme_w", "surprise", "x"}`.
  - `q` est retiré.
  - `net` est un booléen.
  - `surprise` vaut `distance` si `net` est vrai, sinon `rarete` (R3, fichier caché, point 5).
  - `somme_w`, `c` et `l` décrivent le curseur de l'auteur vu par le devineur : entrée et textes répondus jusqu'au jour j − 2, avec les poids propres de l'auteur, facteur compris pour le porteur.
- **`curseur_porteur`** : vu par un personnage, avec les poids normaux du porteur (fichier caché, point 4).
- **Inchangés** : `mediane`, `classement`, `departages`, `remplacements`, `places`, `raison_cachee`, `ordre`, `cartes`, `total`.
- **`rangs` et `cotes_attendus`** : forme de S1, avec une clé par candidat et pour eux seuls. Les rangs vont de 1 au nombre de candidats : 3 dans l'histoire et dans les manches des personnages au jour 1, 4 ensuite (fichier caché, point 4). `curseur_porteur` vaut `null` quand le porteur n'est pas candidat.
- **À quatre membres** (histoire, jour 0, et manches des personnages au jour 1) : toutes les réponses possibles sont servies, dans l'ordre de l'étape 1. `remplacements` est alors vide.

#### 4.3.5 Une révélation

`revelation` vaut `{"avis_cercle", "devineurs", "pas_de_cote", "texte"}`. `avis_cercle` est absent de la trace de l'histoire.

**`devineurs.<membre>`** : la forme de S1, partie 3.7, avec `jumeaux` en plus.
- `justes[i]` : le membre désigné a donné exactement la réponse de la carte, même niveau et même raison, « aucune » comprise (D-024).
- `jumeaux[i]` : `justes[i]` est vrai et le membre désigné n'est pas `auteur_compte`.
- `raison_trouvee` : la personne est juste et la raison aussi (R5).
- Codes des verdicts : `"juste_et_raison"`, `"juste"`, `"jumeau_et_raison"`, `"jumeau"`, `"faux"`, `"passe"`.
- `points_semaine` vaut `null` au jour 15.

**`pas_de_cote`** : les membres qui obtiennent Le Pas de Côté sur le texte révélé (§6, point 7), dans l'ordre des membres. Un tableau vide sinon. Jamais sur l'entrée.

**`avis_cercle`** : `null` sous trois réponses, et pour H90 (jour 1), texte abstrait sans vote. Il est calculé pour chaque texte T révélé, que la révélation soit lue ou non.
- Forme : `{"comptes": [5 entiers, du niveau 1 au niveau 5], "ligne": "adopte", "rejete" ou "partage", "milieu": [1 ou 2 niveaux croissants]}`.
- Calcul : §7.14. La réponse du porteur compte s'il a répondu.
- Il n'existe que dans les traces témoins, jamais dans le carnet.

#### 4.3.6 Le portrait du porteur et la barre

**`portrait`** vaut `{"barre", "ordre_moi", "tensions"}`.
- **`tensions.<t>`** vaut `{"c", "l", "net", "somme_w"}`, où `somme_w` = Σ facteur·w (§5.9).
- **`ordre_moi`** : l'ordre du §5.3 du second essai, sur les quatre tensions de l'essai.
- **`barre`** vaut `{"longueur", "n", "pleine"}` :
  - `n` : le nombre de réponses validées du porteur, entrée comprise ;
  - `pleine` : `n` ≥ `reglage.barre`, ou au moins un curseur du porteur est net. Une fois vrai, il le reste ;
  - `longueur` : la fraction « 1 » si `pleine`, sinon `n / barre`.

#### 4.3.7 Le Cercle affiché

**`cercle`** vaut `{"surprise", "temperaments", "titres"}`.
- **`titres.<membre>`** : les titres de la dernière semaine dont le dimanche est atteint, dans l'ordre Le Sans-Faute, Le Devin, Le Mystère, Le Fidèle.
- **`temperaments.<personnage>`** : ceux du dernier calcul (jour 0, 7 ou 14).
- **`surprise`** : le texte de la surprise de cette même semaine, ou `null`. Du jour 1 au jour 6, c'est « H86 ».

#### 4.3.8 Le dimanche (jours 7 et 14)

Forme de S1, partie 3.9, avec ces écarts :
- `semaine` vaut 14 ou 15 ;
- `pas_de_cote` est retiré (il est à la révélation) ;
- `sans_faute` suit R7 (§6, point 6) ;
- Le Mystère et la surprise comptent un jumeau comme juste.

**`phrase_semaine`** vaut `{"cas", "devenues", "lecture", "phrase", "poids", "reference", "tension"}`.
- `lecture` : les quatre tensions du porteur à l'ouverture du dimanche, avant la réponse du dimanche, au format `{"c", "net", "somme_w"}`.
- `reference` : les tensions nettes à la lecture précédente. Au jour 7, c'est l'état après l'entrée.
- `devenues` : les tensions nettes à la lecture, absentes de `reference`, dont le centre ne vaut pas exactement 1/2.
- `cas` vaut `"nette"`, `"difference"`, `"egalite"` ou `"floue"`.
- `poids` : comme dans S1, sur les réponses de la semaine, avec les poids normaux w, sans le facteur. Le facteur multiplie tous les poids d'une semaine : il ne change ni la tension retenue, ni le cas, ni la phrase.

**`temperaments`** : par personnage, `{"neutres", "reponses", "seul_cote", "seul_milieu", "temperaments", "textes_partages", "tres"}`, des entiers et un tableau.
- Le porteur n'y figure jamais : il n'a pas 56 jours d'ancienneté.
- Les définitions sont celles du §6, point 8, et du fichier caché, point 7. Au dimanche d, pour un personnage p :
  - fenêtre : les textes révélés du jour d − 55 au jour d, hors E1 à E3, qui ont au moins trois réponses de membres, celle de p comprise, et auxquels p a répondu ;
  - `reponses` : le nombre de ces textes ;
  - `neutres` : ceux où p a répondu Neutre ; `tres` : ceux où il a répondu Très défavorable ou Très favorable ;
  - `seul_cote` : ceux où p est favorable (4, 5) ou défavorable (1, 2) et où aucun autre membre qui a répondu n'est de ce côté ;
  - `textes_partages` : ceux où les réponses des autres membres comptent au moins une favorable et au moins une défavorable ;
  - `seul_milieu` : parmi `textes_partages`, ceux où p est le seul à avoir répondu Neutre ;
  - « autres membres » : tous ceux qui ont répondu au texte, porteur compris ;
  - conditions : d − `depuis` ≥ 56 et `reponses` ≥ 20 ; sinon `temperaments` est vide, et les décomptes sont écrits quand même ;
  - L'Original : `seul_cote`/`reponses` ≥ 3/10. Le Pont : `textes_partages` ≥ 6 et `seul_milieu`/`textes_partages` ≥ 1/8. Le Mesuré : `neutres`/`reponses` ≥ 1/3. Le Tranché : `tres`/`reponses` ≥ 1/2. En fractions exactes, seuils compris.

#### 4.3.9 Les sauts

**`sauts[i]`** vaut `{"coups", "depart", "mesures", "numero", "textes_atteints"}`.

| Clé | Contenu |
|---|---|
| `numero` | 1 ou 2 |
| `depart` | entrée : l'instant du toucher « Avancer au dimanche » qui confirme le saut. C'est la seule heure lue pendant un saut (§8.8). |
| `textes_atteints` | entrée : le nombre de textes du rattrapage dont l'écran de position s'est affiché, de 1 à 3 ou de 1 à 6 |
| `coups` | entrée : `{"ouvert": {"cercle", "moi", "proche", "qui_est_qui"}}`, les ouvertures faites pendant le saut |
| `mesures` | `{"duree_page", "duree_saut", "durees_textes", "ouvert"}`. `durees_textes` est un tableau d'entiers, un par texte atteint, ou `null` en mode `moteur`. |

- Les réponses du rattrapage sont dans `jours.<j>.coups.reponse`, au jour de leur texte : T4 au jour 4, T5 au jour 5, et ainsi de suite.
- Un jour sauté a `ouverture`, `versions`, `etapes` et `mesures` à `null`. Ses compteurs valent 0.

#### 4.3.10 Mesures et agrégats

**`mesures`** d'un jour vaut `{"abandon", "compte", "duree_deviner", "duree_entree", "duree_repondre", "duree_seance", "entree_verdicts", "jours_ecoules", "ouvert", "passer", "pendant_deviner", "relire", "revelation_raison_tentee", "revelation_rouverte", "revelation_verdicts"}`. Écarts à S1, partie 3.10 :
- `jours_ecoules` : depuis l'ouverture non nulle précédente.
- `duree_entree` : jour 1 seulement, de 1.2 jusqu'au bouton du compte (§8.12). Présente si et seulement si `etapes.entree` est vrai.
- `entree_verdicts` : jour 1, un code `"juste"` ou `"faux"` par pari fait.
- `compte` : recopié de `coups.compte`.
- `abandon` : jours joués seulement.
- `revelation_rouverte` : jours 2, 3, 7 et 14, même à 0.
- `pendant_deviner` : quand Deviner s'est affiché.
- Aux jours 4 et 8, les durées s'arrêtent à l'ouverture de la page du saut confirmée ; `sauts[].mesures.duree_saut` va de cette ouverture au toucher « Aller au dimanche », et `duree_page` de cette ouverture au toucher qui confirme (§8.12). Les touchers de `versions` vont jusqu'au toucher qui confirme.

**`agregats`** : les trois lignes de S1, calculées sur les manches des jours 1 à 15. Une attribution à un jumeau compte juste. On garde le seuil « pas de chiffre sous cinq textes répondus parmi les textes révélés ». `titres_tires_au_sort` va de 0 à 6 (semaines 14 et 15).

#### 4.3.11 Carnet et copies

- **`carnet.texte`** : le gabarit du §8.12 du second essai.
- **`copies[i]`** vaut `{"coups", "etapes", "jour", "mesures", "sauts", "texte", "versions"}`, l'état au toucher de la copie. `sauts` reprend l'état des sauts à cet instant : coups et textes atteints. La copie du jour 7 et celles faites depuis « Tout effacer » suivent la même forme.

### 4.4 Journal, durées, validité

**Le journal, version 4.** Clés :
- `format`, `version` ;
- `empreinte_scelle` ;
- `partie` ;
- `jours` : par jour atteint, `{"attente", "coups", "etapes", "ouverture", "versions"}` ;
- `sauts` : par saut confirmé, `{"coups", "depart", "numero", "textes_atteints"}` ;
- `copies` : par copie, `{"coups", "etapes", "jour", "sauts", "versions"}` ;
- `arret`, `fin`.

Aucune autre clé.

**Le fichier des durées, version 2.**
- `jours.<j>` vaut `{"duree_deviner", "duree_entree", "duree_repondre", "duree_seance"}`.
- `sauts[i]` vaut `{"duree_page", "duree_saut", "durees_textes", "numero"}`.
- `copies` : les quatre clés d'un jour.

**Masquage** (S1, partie 4.2, étape 3, étendue) : toute valeur entière dont la clé commence par `duree`, et chaque élément entier d'un tableau dont la clé commence par `duree`, devient 0. La présence est comparée, la valeur jamais.

**Validité du journal.** Les règles de S1, partie 3.12, s'appliquent, réécrites pour la table du calendrier. Un échec fait refuser le journal, avec la règle et le chemin JSON Pointer.

1. **Forme** : `version` vaut 4 ; l'empreinte est celle du fichier donné au programme.
2. **Partie** : inchangé. Le journal que la page tire de son propre état, qui n'est jamais comparé, porte `id` = `"porteur"`, `graine` = `null` et le mode `interface`.
3. **Jours atteints.**
   - Les clés vont de « 1 » à « K », sans trou, avec K ≤ 15.
   - `fin` n'est non nul que si K = 15 ; sinon `arret.jour` = K ≤ 14.
   - Le jour j + 1 n'existe que si :
     - jour j joué : `reponse` n'est pas nul ou `abandon` est vrai (au jour 1, l'abandon suppose `compte` non nul) ;
     - jour j point de saut : le saut de ce jour existe et `reponse` du jour j n'est pas nul ;
     - jour j sauté : `reponse` du jour j n'est pas nul.
4. **Ouvertures.**
   - Elles ne sont non nulles qu'aux jours joués, aux points de saut et à la clôture, et elles y sont toujours non nulles, sauf dans un cas : un arrêt après la dernière réponse d'un rattrapage et avant « Aller au dimanche ». Le jour de reprise est alors atteint (§0) mais n'a pas d'ouverture, puisque les touchers d'un saut confirmé et pas fini comptent au saut.
   - Elles ne décroissent jamais. Règles du changement d'heure : S1, partie 3.12, règle 4.
   - `sauts[i].depart` se situe entre l'ouverture de son point de saut et celle du jour de reprise, s'il est atteint.
5. **Versions** : non nulles exactement là où `ouverture` l'est, en mode `interface`. Règles de S1.
6. **Entrée (jour 1).**
   - Pseudo : forme de S1 (NFC, catégories, 1 à 20 points de code). Il est refusé par le squelette du §7.19 et de E7, comme le fait la page. Le programme de contrôle construit **sa propre** table réduite à partir de `confusables.txt`, dans la version et avec le SHA-256 notés au rapport.
   - Un pseudo d'un seul caractère dont le squelette est A, N, O ou V est refusé.
   - E1, E2, E3 se jouent dans l'ordre. Un pari suppose une réponse.
   - `consentement` vaut vrai dès qu'une réponse existe.
   - `pseudo` et `compte` sont nuls ou non nuls ensemble, et seulement après les trois paris.
   - `deviner` et `reponse` du jour 1 supposent `compte` non nul.
7. **Deviner.**
   - `deviner` vaut `null` les jours où `deviner_porteur` est faux.
   - Sinon, si l'objet existe :
     - `cartes` a autant d'éléments que de cartes servies (calcul propre du contrôle) ;
     - un personnage est désigné au plus une fois ;
     - `raison` n'est non nulle que sur la carte à raison cachée dont `designe` est un personnage ;
     - `validee` vrai suppose toutes les `designe` non nulles ;
     - `validee` faux n'est permis qu'au jour d'un abandon ou d'un arrêt.
8. **Répondre.**
   - Un jour joué, `reponse` non nulle suppose `deviner` non nul et validé.
   - Un point de saut : `reponse` non nulle suppose le saut confirmé.
   - `abandon` vrai suppose `reponse` nulle.
   - Au jour 15, `reponse` est nulle.
9. **Compteurs.**
   - `relire` supérieur à 0 suppose `deviner` non nul ; `pendant_deviner` est non nul exactement quand `deviner` l'est.
   - `rouvrir` n'est non nul qu'aux jours 2, 3, 7 et 14.
   - `annuler_saut` n'existe qu'aux jours 4 et 8.
   - Aux jours sautés, `relire`, `rouvrir` et les quatre entiers de `ouvert` valent 0 ; `annuler_saut`, `abandon` et `pendant_deviner` valent `null`.
10. **Carnet.**
    - `moment` n'existe qu'aux jours joués, parmi les choix de la liste du jour. En mode `interface`, « Deviner » suppose `etapes.deviner`, « Donner mon avis » et « Ma phrase du jour » supposent `etapes.repondre` ; les autres choix ne sont pas filtrés (les écrans qui les montrent, 3.3a et 3.3e, ne sont pas dans `etapes`). Il ne dépend jamais de `reponse`.
    - `saut_clair` n'existe qu'au jour 7. `hesite` et `moment_semaine` n'existent qu'aux jours 7 et 14.
    - `hesite` contient des codes distincts, dans l'ordre de la liste ; `nulle_part` est seul.
11. **Attente** : seulement aux jours joués dont la journée est finie, avec au moins une lecture.
12. **Étapes** (mode `interface`).
    - Elles sont non nulles exactement aux jours joués.
    - `deviner` est vrai si et seulement si `coups.deviner` n'est pas nul.
    - `repondre` est vrai dès que `reponse` n'est pas nulle.
    - `entree` n'est non nul qu'au jour 1.
13. **Sauts.**
    - `sauts` a un élément par point de saut confirmé, numéros 1 puis 2.
    - `textes_atteints` va de 1 au nombre de textes du saut. Il est au moins égal au nombre de réponses de rattrapage déjà données, et le dépasse au plus d'une unité.
14. **Arrêt et fin.**
    - `arret.f2` vaut `null` si `arret.jour` < 3 (§8.10).
    - Dans `fin`, chaque code appartient à sa liste ou vaut `null`.
15. **Copies** : les règles de S1, avec `jour` ≤ min(K, 14). Une manche non validée peut figurer dans une copie.

## 5. Vérifications et comparaison

### 5.1 Le fichier scellé (contrôle 1, écarts à S1, partie 4.1)

**Étapes 1 à 3** : inchangées. Le repère `/*elenchos-scelle*/` et le base64 sont les mêmes.

**Étape 4, schéma.**
- `version` vaut 5 et `statut` vaut `"final"`. Sur un candidat, `"provisoire"` est permis et l'étape est marquée « candidat ».
- Les quatre formes d'`auteur` (partie 2.5) sont respectées.
- `groupe` vaut `null` seulement pour un député.
- Les règles de type des parties 2.3 à 2.8 sont respectées.

**Étape 5, cohérence interne.** S1, plus :
- **Tables exigées** : `calendrier`, `semaines` et `cercle` sont égaux aux tables des parties 2.3 et 2.4. Le contrôle les recalcule à partir du §0, sans les recopier.
- **Clés** : `textes` a 18 clés ; `reponses` en a 108 ; `histoire.textes` en a 90.
- **Histoire** :
  - chaque `jour` vaut i − 91 ;
  - tension, sens et raisons suivent le fichier caché, point 2 bis, refait à partir de la graine ;
  - seul H86 a une `fiche`, et H86 est un texte P de sens 0.
- **Votes** : les deux tables de combinaisons de la partie 2.5 sont respectées, celle de `objet`, `issue` et `etape`, et celle de `suite`.
- **D-028** :
  - entre 6 et 12 textes rejetés sur les 18 ;
  - au moins un rejeté parmi E1 à E3 ;
  - tout objet servi au moins deux fois compte au moins un adopté et un rejeté (A.4) ;
  - au moins un texte d'objet `texte` ou `article` a `issue` = `"rejete"` (A.4).
- **E8** : titres de 60 points de code au plus, sans « : », titre de H86 compris.
- **D-034** : les règles de la partie 2.5.
- **Groupes et considérations** : les quatre `groupe` d'un texte sont deux à deux différents, et `null` compte comme une valeur, permise une fois au plus. C'est une hypothèse, à confirmer par Contenu (partie 8).
- **Ordre des tensions** : T0 à T14 suivent l'ordre retenu, ou l'ordre R2 ou R3, du fichier caché, point 14. E1, E2 et E3 sont sur S, P et T (sur S, P et L dans l'ordre R3).
- **Réglage** : valeurs permises de la partie 2.8 ; `tirage` va de 1 à 200.
- **Groupes et commissions** : les tables des parties 2.10 et 2.10 bis, avec leurs règles.

**Étape 6** : les trois vecteurs.

**Étape 7, typographie simple.** On ajoute aux chaînes concernées :
- `histoire.textes.H86.fiche.titre` ;
- `auteur.libelle` ;
- les `groupe` en toutes lettres.

On retire `cercle.inviteuse` et on ajoute `cercle.invitant`.

**Étape 8, fidélité aux fiches.** Les fiches du second lot sont dans `a-ne-pas-ouvrir-2/textes/`. La liste des fichiers et leurs SHA-256 sont passés en paramètre par l'orchestrateur, comme dans S1.
- **En-tête de fiche** : `### {T0 … T14 | E1 … E3 | H86} · scrutin {n} ({l}e législature)`. « T{n} » donne la clé « {n} ».
  - **Le tirage des cases est écrit avant le contrôle.** Le tirage t("ordre-texte|tension|i") (fichier caché, point 14) ne dépend que de la graine. L'orchestrateur le calcule avant le contrôle, et avant que les SHA-256 des fiches soient notés, puis écrit le vrai T{n} dans chaque en-tête. Un en-tête provisoire (« Case S », « T? »…) ne passe pas.
  - **Rien après la parenthèse.** Les suffixes (« · présentation B », « · fiche légère ») passent dans les Doutes de la fiche.
  - **En-têtes stricts.** Le lecteur de S1 saute sans rien dire un en-tête qu'il ne reconnaît pas. Le lecteur v2 refuse tout en-tête `### ` qui contient ` · scrutin ` sans correspondre exactement à la forme ci-dessus, sauf ceux qui commencent par `### Réserve ` ou `### (écartée)`.
- **Nouvelle ligne** : `- Objet du vote : {texte | article | amendement | motion | resolution}`. Elle figure, ligne à part, dans chaque fiche de texte joué : l'objet écrit dans la ligne « Vote » n'est pas lu.
- **Auteur commission** : `- Auteur : Commission : {libelle}`, suivi de ` ;` ou de `.`, puis du reste de la ligne.
- **Auteur Gouvernement** : `- Auteur : Gouvernement ; …` (et non « Proposé par le Gouvernement (… »).
- **Auteur non inscrit** : `{groupe}` vaut le littéral `sans groupe`, qui donne `null`. Même règle dans les lignes de raisons.
- **Groupes** : ils peuvent contenir des virgules. On lit {nom} jusqu'à la première « , », puis {mandat} parmi ses quatre valeurs, puis {groupe} jusqu'au séparateur. Un groupe est suivi de « au dépôt » sans virgule (`… indépendants au dépôt (…)`) : une virgule avant « au dépôt » ferait lire un groupe faux.
- **Point final** : là où le lecteur de S1 attend « . » suivi d'une espace, le lecteur v2 admet aussi un point en fin de ligne.
- **Lignes** (contrôlées sur le fichier et sur les fiches) :
  - chaque élément de `lignes` fait au plus 90 points de code, en NFC (A.7) ;
  - pour les textes en présentation B (fichier caché, point 14), dont la liste est passée en paramètre par l'orchestrateur, la ligne 3 est égale, à l'identique, à la phrase fixe de A.7 : « Cet amendement supprimerait tout l'article qui prévoit ces mesures. »
- **H86** : seules les lignes `Titre` et `Tension` sont lues, plus sa ligne de `votes.md`.
- **`votes.md`** : en-tête « | Rang | Scrutin | `objet` | `issue` | `date` | `etape` | `suite` | Preuve principale | ». Une ligne par texte joué et une pour H86.
  - La colonne `objet` admet `resolution`.
  - La colonne `suite` vaut `null`, `texte_tombe` ou `texte_retire`, relevée deux fois comme les autres colonnes. Quand elle n'est pas `null`, la Preuve principale cite aussi la ligne du compte rendu qui établit le fait.

Comme dans S1, ces formes de lignes ne sont pas le format. Leur forme ne change pas sans relecture par l'auteur du contrôle.

### 5.2 Contrôles 2 à 4

- **Contrôle 2** :
  - `personnages` est égal octet pour octet à celui du fichier scellé du premier essai. Le chemin de ce fichier est donné en paramètre, et son SHA-256 doit égaler l'empreinte publiée du premier essai (`docs/essai/empreinte.md`) ;
  - les contraintes de `profils.md` restent vérifiées ;
  - le corrigé de F1 n'est plus calculé.
- **Contrôle 3** :
  - la condition du premier essai (« chaque raison pour sert s ou aucun ») est remplacée par les règles D-034 de la partie 2.5 ;
  - chaque réponse, histoire comprise, est recalculée par le fichier caché, points 3 et 4 ;
  - le calibrage est **refait** : pour r = 1, 2, … jusqu'au r scellé, le contrôle calcule l'histoire et les critères c1 à c5. Il exige que r soit le premier qui les remplit tous, et il donne les raisons de l'échec de chaque r précédent ;
  - le résumé est recalculé et comparé (partie 3.4).
- **Contrôle 4** : les absences, histoire comprise, par le fichier caché, point 3, règle 2.4.

### 5.3 Comparaisons

- **Trace de l'histoire** : P, C et S, comparées deux à deux, octet pour octet. Une seule fois par fichier scellé, sur le candidat 1 puis sur le candidat final.
- **Traces de partie** : P et C, comme dans S1, partie 4.2. On compare aussi `resume_histoire`.

**Où regarder une différence** (S1, partie 4.2, étendue) :

| Partie de la trace | Contrôle du §9 |
|---|---|
| `candidats`, `possibles` (`net`, `distance`, `rarete`) | 6 (R3) |
| `revelation.devineurs.*.jumeaux`, verdicts | 8 (D-024) |
| `avis_cercle` | 9, et géométrie de la Direction artistique (§9) |
| `portrait.barre` | 9 et 10 |
| `pas_de_cote` | 9 |
| `dimanche.temperaments`, `cercle` | 9 et 10 |
| `sauts`, `message` | 11 et 12 |

### 5.4 Phrases attendues, version 2

C'est la forme de S1, partie 4.5, sur les 18 textes, avec ces changements :
- **`vote`** :
  - « 1.6 » pour E1 à E3, avec {objet} et {étape-texte} (§7.10) ;
  - « 2.7d » pour T0 à T13 ;
  - « 5.4 » pour les textes que l'Historique montre (partie 8, point UX-2), et pour la fiche de T14 affichée à la clôture (§7.5, point 2) : pour T14 seulement, les phrases du vote, {suite} comprise, sont permises à partir de l'ouverture de la clôture, jamais avant ;
  - **{objet}** a une phrase de plus, pour `resolution` : « C'était une résolution, un texte qui invite le Gouvernement à agir, sans l'y obliger. » ;
  - **{suite}** suit {objet} {étape-texte}, en 1.6, 2.7d et 5.4 : « Avec lui, l'Assemblée a rejeté le texte entier. » pour `texte_tombe` ; « Le jour même, le texte entier a été retiré. » pour `texte_retire` ; rien pour `null` ;
  - la phrase {suite}, quand elle existe, entre dans `interdites_avant_revelation`, comme la phrase d'étape (jamais avant 18h).
- **`auteur`** : les quatre formes (§7.11), dont « Proposé par la {libelle}. » et « {nom}, {député | députée} sans groupe ».
- **`arguments`** : « … de {nom}, {mandat}, {groupe}. », ou « …, {mandat} sans groupe. » ; élision selon la partie 2.11.
- **Nouveau, `surprise_arrivee`** : la chaîne « Surprise de la semaine : {titre de H86} », attendue en 4.2 du jour 1 au jour 6.

## 6. Versions, historique, repli

- **Historique** :
  - fichier scellé, version 5 (9 octobre 2026) : tout ce qui est décrit en partie 2. Complétée le 10 octobre 2026 sans changer de numéro, ce qui suppose qu'aucun candidat n'ait encore été produit (le fichier de test du lot 1 est régénéré) : objet `resolution`, champ `vote.suite`, limite de `groupe` à 70, vérification des groupes contre `amo`, forme courte des commissions spéciales, règles de lecture des fiches (partie 5.1, étape 8) ;
  - trace version 4 et journal version 4 : partie 4.3 ;
  - nouveaux formats : la trace de l'histoire (version 1) et le résumé (version 1) ;
  - fichier des durées, version 2 ; phrases attendues, version 2.
- **Ce que la page refuse à V4** : tout `format` ou toute `version` autre que `"elenchos-essai-scelle"` et 5. Elle refuse donc le fichier du premier essai.
- **Repli : l'histoire scellée** (§8.8, si un budget est dépassé).
  - Le fichier passe en version 6, avec `histoire.etat_arrivee` égal au résumé lui-même (partie 3).
  - La page lit cet objet au lieu d'appeler `histoire()`, puis garde V6 : l'empreinte de l'objet lu doit égaler `resume_sha256`.
  - Le résumé étant l'état à l'arrivée **en entier**, le repli ne demande aucun autre champ.
  - Le contrôle garde son propre calcul de l'histoire, et la trace de l'histoire n'est plus écrite par P.
  - Ce choix technique passe par Cohérence et le Vérificateur, comme le dit le §8.8. Ce n'est pas une question au porteur.
- **Après le scellement**, ni le fichier ni son format ne changent (S1, partie 5).

## 7. Ce qui change pour la page, le programme de contrôle et le scellement

### 7.1 Pour la page (Front-end)

1. **V4** : version 5. La page lit le calendrier, les semaines, les membres, l'invitant et le réglage (facteur, barre, α, seuils stricts). Plus aucun 14, 15, 16 ni 91 n'est écrit en dur.
2. **Moteur coupé en deux.**
   - `histoire(scellé, calendrier)` couvre les jours −90 à 0 et rend le résumé de la partie 3, puis des index de travail que la page peut ajouter en mémoire vive.
   - Ensuite, V6.
   - `calculer` part du jour 1, révélation de H90 comprise, et lit la manche du jour 0 dans l'état.
3. **Lecture des champs nouveaux** :
   - `vote.objet` et ses combinaisons, `resolution` comprise ;
   - `vote.suite` : une phrase sous {objet} {étape-texte} en 1.6, 2.7d et 5.4, jamais avant 18h (§7.10) ;
   - `auteur` de type commission ;
   - `groupe` à `null` : sans groupe ;
   - groupes en toutes lettres, avec la règle de coupure : jamais au trait d'union d'un mot, jamais de ligne qui commence par « - ».
4. **État gardé** :
   - `coups.deviner` à `null` tant que Deviner ne s'est pas affiché, puis les visages posés au fil des gestes (R10) ;
   - `compte` ;
   - `annuler_saut` ;
   - `textes_atteints` ;
   - les compteurs d'ouverture.
5. **Version témoin** : deux sorties, la trace de l'histoire (une fois, sur demande du harnais) et la trace de partie, en version 4.
6. **Construction** : `construire.py` refuse un fichier `"provisoire"` pour la version du porteur. Elle embarque le fichier de la même façon qu'au premier essai.

### 7.2 Pour le programme de contrôle

1. **Lecture** : le fichier en version 5, la trace et le journal en version 4, les durées en version 2.
2. **Contrôle 1** : les étapes de la partie 5.1.
   - Tables exigées.
   - D-028, D-034, E8.
   - Groupes et commissions : chaque `groupe` comparé au `libelle` de son organe dans `amo` (chemin et SHA-256 au rapport), ou, en repli, à la liste de codes de la partie 2.10.
   - Combinaisons de `suite`.
   - Lignes de 90 points de code au plus ; ligne 3 fixe des textes en présentation B (liste en paramètre).
   - Fidélité aux fiches du second lot, H86 comprise, avec les en-têtes stricts (partie 5.1, étape 8).
3. **Contrôles 2 à 4** : la partie 5.2.
   - Comparaison des personnages au premier fichier.
   - Calibrage refait, de r = 1 jusqu'au r scellé.
   - Résumé recalculé.
4. **Trace de l'histoire** : écrite par le contrôle et comparée à celles de P et de S.
5. **Validité du journal** : les règles de la partie 4.4, avec la table des squelettes construite par le contrôle lui-même.
6. **Phrases attendues** en version 2.
7. **Coût machine, estimation non mesurée** : le calibrage refait coûte jusqu'à r calculs d'histoire. En Python, avec des fractions exactes, cela fait quelques minutes à quelques dizaines de minutes, à ajouter aux 3 à 4 heures du §9.

### 7.3 Pour le scellement

1. **Graine** : préfixe « elenchos-essai-2|graine| », sur le commit de `simulation-2.md` relue.
2. **Candidat 1** (`"provisoire"`) :
   - histoire complète et textes de travail ;
   - trace de l'histoire et résumé ;
   - comparaison à trois avec la page et le contrôle.
3. **Candidat final** (`"final"`) :
   - vrais textes ;
   - calibrage refait, avec les vrais textes d'entrée ;
   - réglage : α, seuils stricts, facteur. Si un paramètre change, le candidat est refait et recalibré, sans rejouer le réglage (fichier caché, point 11).
4. **Rapport de scellement** :
   - r, et les raisons de l'échec de chaque r précédent ;
   - `resume-histoire.json` ;
   - la trace de l'histoire ;
   - les chiffres constants du §9 et du fichier caché, point 13, calculés deux fois (scellement et contrôle) ;
   - les SHA-256 des sources lues ;
   - le commit de ce schéma.
5. **Empreinte** : publiée avant le remplacement de la page sur `gh-pages` (§8.8).

## 8. Points à confirmer

**Game design**
- **GD-1, coupure au jour 0.** La manche du jour 0 sur H90 appartient à l'histoire et entre dans le résumé. Sa révélation au jour 1 compte en semaine 14 et se calcule dans `calculer` (partie 3.1). Front-end doit l'accepter aussi.
- **GD-2, pas de champ « argument inattendu ».** La règle 2.2 bis ne lit que le côté, le pôle et le sens (partie 2.5). GD confirme qu'elle reste bien définie avec les inattendues croisées. Il confirme aussi le remplacement de la condition du contrôle 3 du premier essai.
- **GD-3, `reglage.alpha`.** Le réglage est une fraction, 1/6, 1/4 ou 1/3, qui suit le fichier caché, point 3, règle 2.3. L'annexe B dit « le nombre de réponses atypiques ».
- **GD-4, champs de la trace.**
  - Les verdicts `jumeau` et `jumeau_et_raison`.
  - Les décomptes des tempéraments (`textes_partages`, `seul_cote`, `seul_milieu`, sur les textes de la fenêtre qui ont au moins trois réponses).
  - `phrase_semaine.reference`, qui vaut au jour 7 l'état après l'entrée.
  - Le Pas de Côté rangé dans la révélation.
  - L'avis du cercle calculé pour chaque texte T révélé, lu ou non.
- **GD-5, membres.** Les valeurs de `depuis` (−90 et 1) et leur usage pour Le Fidèle, les candidats et les tempéraments.

**Front-end**
- **FE-1, `jours` en objet.** Le schéma met `jours` en objet à clés « 1 » à « 15 » (et « -90 » à « 0 » dans la trace de l'histoire), plutôt qu'en tableau décalé d'un, pour que les chemins JSON Pointer se lisent tels quels.
- **FE-2, `coups.deviner`.** Il vaut `null` si Deviner ne s'est jamais affiché, sinon `{"cartes", "validee"}` avec les visages posés.
- **FE-3, la table du calendrier.** Ses neuf colonnes suffisent-elles pour retirer tout nombre en dur ?
- **FE-4, V6 et la vue de secours.** L'ordre est V1 à V5, `histoire()`, V6, puis le premier écran. Le délai de 2 secondes de la vue de secours tient-il avec ce calcul ?
- **FE-5, le statut.** C'est la construction qui refuse un fichier provisoire, pas le code de la page.
- **FE-6, la trace de l'histoire.** Elle est demandée par le harnais à la version témoin.

**Hors de ces deux rôles, à transmettre**
- **UX-1** : le repère de l'arrêt V6 (§8.11).
- **UX-2** : T0, jamais répondu par le porteur, figure-t-il dans l'Historique (5.3, 5.4) ? Les phrases attendues en dépendent.
- **UX-3** : l'affichage des amendements identiques d'autres groupes. Il n'a pas de champ pour l'instant ; s'il en faut un, il entre dans la version 5 avant le candidat 1 (aucun fichier n'est encore scellé). La version 6 reste réservée au repli (partie 6).
- **Contenu-1** : les tables des parties 2.10, 2.10 bis et 2.11, et les formes de lignes de la partie 5.1, étape 8.
- **Contenu-2** : l'auteur d'une raison peut-il être un non-inscrit, et compte-t-il comme « un groupe » ? Le schéma en permet un par texte.

---

