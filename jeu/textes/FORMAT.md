# Le fichier des textes : format et contrôles (le jeu entier)

*Phase 0 de la construction (D-060), Back-end et Front-end, 15 octobre 2026, pour Contenu, qui remplit le fichier. Mis à jour le 16 octobre 2026 pour le jeu entier (D-062 ; étape 1, travail A, D-064) : le lot passe à environ 70 textes, les fenêtres de contrôle glissent sur tout le lot, le plafond par commission se compte par fenêtre, la tension « Tradition ou changement » suit l'arbitrage de D-064, les mots après « Entre » suivent E2, et un texte peut recevoir un erratum d'étiquette (règle 20). Les types exacts sont dans `jeu/src/contrat.ts`, partie 14 (`FichierTextes`). Un exemple inventé est à côté : `exemple.json`, inchangé. Aucun texte réel n'apparaît ici. Ce qui n'est tranché par aucune décision est marqué « (proposé) ». À relire par Contenu, puis par Cohérence et le Vérificateur.*

## En bref

- **Un seul fichier JSON**, `jeu/textes/lot-test.json` (nom proposé), avec environ 70 textes : 3 d'entrée, communs à tous les cercles pendant le test (D-065, point 2 ; partie 3), au moins 56 du jour, au moins 3 de réserve. Le test dure au moins huit semaines (D-062) ; les nombres exacts sont fixés par Contenu avec le lot (plan de D-064 : « environ 70 textes, de quoi couvrir deux mois et demi de jeu, plus une réserve »). La version de test en prévoyait 34 (D-058, remplacé par D-062).
- **Contenu l'écrit dans le dépôt ; le serveur l'importe au démarrage.** Le chemin va dans un seul sens. Aucun agent ne touche la base (D-048).
- **Chaque texte porte ses faits, jamais ses phrases.** Le serveur tire de ces faits les phrases à l'écran : la ligne du vote, « Proposé par … », la phrase du jour. Les mots restent donc les mêmes partout.
- **32 contrôles automatiques** vérifient le fichier avant toute mise en ligne (partie 7). Ceux du lot glissent sur des fenêtres de quatre ou huit semaines, comme les règles qu'ils appliquent. Quatre points restent humains (partie 8).
- **Le dépôt est public** : les textes et les votes à venir y sont lisibles (limite déjà dite au porteur, `docs/etape-6/plan-version-test.md`, partie 1). Si le porteur joue, il n'ouvre pas ce fichier.

## 1. Règles d'écriture

- **UTF-8**, sans marque d'ordre des octets, chaînes en forme normale NFC.
- **Typographie simple dans le fichier** : apostrophe droite `'`, espaces ordinaires, guillemets « » permis à l'intérieur d'une raison, sans espace insécable. Le serveur pose l'apostrophe courbe et les espaces insécables à l'affichage (E10), comme aux essais. Une seule écriture dans le fichier évite deux formes du même mot.
- **Clés ASCII**, en français sans accents (`lienScrutin`, `feminin`). Aucune clé en plus, aucune en moins : le contrôle C1 refuse le fichier.
- **Dates** : « AAAA-MM-JJ ».

## 2. La structure

```json
{
  "format": "elenchos-textes/1",
  "lot": { "nom": "test", "exemple": false, "etat": "final", "date": "2026-11-10" },
  "groupes": [ { "libelle": "…", "chambre": "assemblee", "legislature": 17, "identifiant": "PO…" } ],
  "commissions": [ { "libelle": "commission …", "identifiant": "PO…" } ],
  "textes": [ { … }, { … } ]
}
```

- `lot.etat` : `provisoire` tant que les vérifications ne sont pas finies, puis `final`. **En ligne, le serveur refuse un lot `provisoire` ou `exemple`** (C31).
- `groupes` et `commissions` : les listes fermées des noms permis (E5), comme au second essai. Chaque nom employé dans un texte y figure ; chaque ligne y sert au moins une fois.

## 3. Un texte, champ par champ

| Champ | Contenu | Règle |
|---|---|---|
| `id` | « T01 » à « T99 » | unique, stable : c'est l'identifiant que voient le serveur et l'interface |
| `role` | `entree`, `jour` ou `reserve` | 3, au moins 56, au moins 3 (C4) |
| `rang` | entrée : 1 à 3, l'ordre du défi ; jour : 1 à n, l'ordre du calendrier ; réserve : 1 à r | le texte du jour de rang k s'ouvre à 18h le k-ième jour du test, à partir de la date du premier jour, saisie par le porteur. Comme il s'ouvre à 18h, c'est le texte du jour de jeu suivant (`regles.md`, section 2 ; CONTRAT.md, partie 3) : avec un premier jour P, le texte du jour de jeu d est celui de rang d − P. Un lot plus long que le test se complète en fin de calendrier (rangs suivants), sans toucher aux textes déjà ouverts (C30) |
| `titre` | le titre affiché | 60 points de code au plus, sans « : » (E8) |
| `lignes` | les trois lignes du résumé | exactement trois, 90 points de code au plus chacune (comme au second essai) |
| `tension` | un des huit codes (partie 6) | jamais affiché |
| `sens` | 0 si être favorable sert le pôle 0 de la tension, 1 s'il sert le pôle 1 | jamais affiché |
| `commission` | la commission saisie au fond, un `libelle` de `commissions` | sert au plafond de 6 textes par commission (C25) |
| `auteur` | voir ci-dessous | mandat et groupe au dépôt (E5) |
| `vote` | voir ci-dessous | le texte est déjà voté (E11) |
| `scrutin` | `{ legislature, numero }` | unique dans le lot |
| `lienScrutin` | la page officielle du scrutin | montrée après 18h seulement (`produit.md`, section 9) |
| `raisons` | quatre raisons (partie 4) | deux de chaque côté (D-034) |
| `erratum` | `null`, ou `{ date, sorte, texte }` | règle 20 : `revele` (erreur sur ce qu'on apprend à 18h : la fiche porte la ligne d'erratum) ; `repondu` (erreur sur ce à quoi on a répondu : le texte sort des portraits, la fiche porte la ligne, l'Historique sa mention) ; `etiquette` (erreur sur le pôle d'une raison ou le sens du texte, jamais montrés : les curseurs sont recalculés, la fiche ne montre rien). Un seul erratum par texte : le plus récent ; un `repondu` ne redevient jamais une autre sorte (C30) |
| `empreinte` | SHA-256 du texte (partie 5) | recalculée par le contrôle |

**`auteur`**, quatre formes, reprises du second essai :

| Forme | Phrase faite par le serveur |
|---|---|
| `{ "type": "depute", "nom", "feminin", "groupe", "depot" }` | « Proposé par {nom}, {député \| députée}, {groupe}. » ; `groupe` à `null` : « … sans groupe. » |
| `{ "type": "senateur", "nom", "feminin", "groupe", "depot" }` | « Proposé par {nom}, {sénateur \| sénatrice}, {groupe}. » ; `groupe` jamais `null` |
| `{ "type": "gouvernement", "depot" }` | « Proposé par le Gouvernement. » |
| `{ "type": "commission", "libelle", "depot" }` | « Proposé par la {libelle}. » |

`depot` est le jour du dépôt : le groupe est celui de ce jour-là (règle du moment, E5).

**Les trois textes d'entrée, communs à tous les cercles pendant le test.** C'est une **suspension, pour le test, de `onboarding.md` et de la règle 15**, qui fixent trois textes par cercle à sa création : retenue par Game design, arbitrée par l'équipe et consignée dans D-065 (point 2), renversable par le porteur ; `contenu-test.md` (partie 8) la rangeait déjà parmi les décisions touchées. **À rétablir pour la version publique** : quelques trios en rotation, pour les créateurs jamais invités. Pendant le test, elle a trois effets, voulus :
- les textes d'entrée d'un cercle créé par un joueur déjà inscrit sont ceux de sa propre entrée, auxquels il a déjà répondu (`CONTRAT.md`, 2.6) ;
- un joueur inscrit qui rejoint un autre cercle n'a rien à redonner : ses trois réponses sont reprises (règle 15) ;
- le lot n'a besoin que de trois textes d'archive clivants, vérifiés une fois.

Le prix : la barre d'un joueur qui rejoint un second cercle n'avance pas pendant ce défi, et l'exemple de la règle 15 (une réponse reprise sur trois) ne peut pas se produire. Le format porte déjà plusieurs trios sans changer de forme (rangs d'entrée 1 à 3k, un trio par cercle) ; seul C4 changera.

**`vote`**, repris du second essai : `objet` (`texte`, `article`, `amendement`, `motion`, `resolution`), `issue` (`adopte`, `rejete`), `etape` (`navette`, `definitif`, `aucune`), `date`, `suite` (`null`, `texte_tombe`, `texte_retire`), et un champ nouveau, `rejetDeProcedure`. Il vaut `true` seulement pour une motion de rejet adoptée par les partisans du texte pour un motif de procédure, qui ne compte pas comme un rejet (D-028, règle d'application de Contenu). Les combinaisons permises sont celles du second essai (C9). Le serveur en tire « Texte adopté. » ou « Texte rejeté. », puis la ligne datée avec l'étape (« Le 9 octobre 2024. Le Sénat devait encore voter. », E4). **Les voix sous le vote ne figurent pas** : E4 reste ouvert (`produit.md`, « Ce que ces décisions laissent à régler »). Si UX et Contenu retiennent les voix, un champ `voix` s'ajoutera.

## 4. Les raisons

Chaque raison :

| Champ | Contenu |
|---|---|
| `id` | `r1` à `r4`, chacun une fois, dans l'ordre que Contenu veut |
| `cote` | `pour` (l'argument défend une position favorable) ou `contre` |
| `pole` | la valeur que sert l'argument : `0`, `1`, ou `"aucun"` pour une raison pratique, hors de la tension |
| `texte` | l'argument, sans guillemets, terminé par « . », « ? » ou « ! » ; 110 points de code au plus (proposé, à vérifier sur un iPhone SE en phase 1) |
| `depute` | `{ nom, feminin, groupe, elision }` ; `groupe` à `null` pour un non-inscrit ; `elision` vaut `de` ou `d'` (« l'argument de Julien Barre », « l'argument d'Alice Exemple ») |
| `source` | `{ adresse, date, extrait }` : la page du compte rendu, le jour de la séance (le groupe est celui de ce jour-là), et les mots du député, recopiés tels quels, 600 points de code au plus |

**Attendue ou inattendue (D-034) : ce n'est pas un champ, cela se calcule**, comme au second essai. Le côté `pour` sert le pôle `sens`, le côté `contre` le pôle `1 − sens`. Une raison est *attendue* si son `pole` est celui que sert son côté, *inattendue croisée* s'il est l'autre, *inattendue pratique* s'il vaut `"aucun"`. Un champ de plus créerait une seconde vérité à tenir d'accord avec la première.

**L'ordre d'affichage n'est choisi par personne** (proposé). `projet.md` §8 veut un ordre « tiré une fois par texte, identique pour tous ». Le serveur range les quatre raisons selon l'empreinte SHA-256 de « `elenchos|ordre-raisons|{id du texte}|{id de la raison}` », de la plus petite à la plus grande ; le rang 1 à 4 en découle. Cet ordre ne dépend que des deux identifiants : il ne bouge pas si le texte est corrigé, et chacun peut le refaire.

**L'extrait ne va jamais au téléphone.** Il sert aux vérifications de fidélité (Contenu, Vérificateur) et, plus tard, au registre public (`projet.md` §8). La fiche (5.4) montre les raisons et leurs députés, pas les extraits ; l'envoyer ajouterait un champ que l'écran ne montre pas (P-27). Le lien « Sources : extraits des débats » de la maquette 5.4 mène au registre public, quand il existera (`projet.md` §8).

## 5. L'empreinte

`empreinte` est le SHA-256, en hexadécimal, du **JSON canonique** du texte privé de son champ `empreinte` :
- clés triées dans l'ordre de leurs octets (elles sont toutes en ASCII) ;
- aucune espace hors des chaînes ;
- nombres entiers écrits en décimal ;
- chaînes en NFC, échappées comme le fait `JSON.stringify`.

C'est la forme canonique des essais (S1, partie 1.1). L'exemple donne deux empreintes calculées ainsi.

**À l'import** (proposé ; Back-end) :
- un texte dont l'empreinte n'a pas changé n'est pas touché : relancer l'import ne change rien ;
- un texte **pas encore ouvert** peut changer librement : c'est ainsi qu'on le remplace par sa version corrigée ou par un texte de la réserve, avant qu'il soit servi (règle 20) ;
- un texte **déjà ouvert** ne change qu'avec un `erratum` nouveau ; sinon l'import entier est refusé, et le serveur garde le lot précédent. Le retrait des portraits (`repondu`) ou le recalcul des curseurs (`etiquette`) se fait hors de 15h–19h et jamais le dimanche, comme une mise en ligne (règle 20).

## 6. Les huit tensions et leurs mots

Les mots sont ceux de la règle 16, avec D-053 (point 3). Le serveur les tient dans une seule table (`TENSIONS`, `jeu/src/contrat.ts`) ; le fichier ne porte que le code.

| Code | Pôle 0 | Pôle 1 | Après « Entre » |
|---|---|---|---|
| `S` | la sécurité | la liberté | sécurité et liberté |
| `EM` | l'égalité | le mérite | égalité et mérite |
| `SR` | la solidarité collective | la responsabilité individuelle | solidarité collective et responsabilité individuelle |
| `P` | la précaution | l'innovation | précaution et innovation |
| `T` | la tradition | le changement | tradition et changement |
| `SO` | l'indépendance | l'ouverture | indépendance et ouverture |
| `EP` | l'État | le privé | État et privé |
| `L` | la décision locale | la décision nationale | décision locale et décision nationale |

La colonne « Après « Entre » » donne le libellé unique de chaque valeur (E2, règle 16), sans son article : c'est la lettre de `regles.md` (J9, « Entre décision locale et décision nationale, … »). Elle remplace la forme courte de l'essai (« local et national », « solidarité et responsabilité »), que `tensions.md` (partie 1) disait à confirmer pour le produit, et qui donnait deux libellés à une même valeur. Elle sert à la phrase du dimanche, désormais dans le jeu (D-062). La phrase du jour emploie les deux premières colonnes, avec « à le » contracté en « au ».

## 7. Les contrôles automatiques

Ils tournent à chaque changement du fichier, dans le contrôle du code (`npm run controle`), et sur GitHub avant toute mise en ligne. « Bloquant » : le fichier est refusé. « À confirmer » : le contrôle relève, et Contenu confirme dans le rapport, texte par texte ; sans confirmation, c'est bloquant. Un lot `exemple: true` ne passe que les contrôles marqués « texte », sans la fidélité à l'open data de C15.

**A. La forme**

| # | Contrôle | Source | Sorte |
|---|---|---|---|
| C1 | JSON valide ; clés exactement celles de `FichierTextes`, sans clé en plus ni en moins ; `format` = `elenchos-textes/1` | ce document | bloquant, texte |
| C2 | Chaînes en NFC ; ni espace au bord, ni espace double ; ni caractère de contrôle, ni caractère invisible, ni espace insécable, ni apostrophe courbe ; aucune marque `A_ECRIRE`, `TODO`, `[`, `]` | partie 1 | bloquant, texte |
| C3 | `id` unique, de forme `T` suivi de deux chiffres ; `rang` contigu dans chaque rôle (1 à 3, 1 à 28, 1 à 3) ; `r1` à `r4` chacun une fois | partie 3 | bloquant, texte |
| C4 | 3 textes d'entrée ; au moins 56 du jour ; au moins 3 de réserve. Relevé en plus, sans bloquer : le nombre de jours de jeu que le lot couvre après la date du premier jour | D-062 (au moins huit semaines de test) ; nombres exacts : Contenu, avec le lot ; trio commun pendant le test : partie 3, D-065 (point 2) | bloquant, lot |
| C5 | Longueurs : titre ≤ 60, chaque ligne ≤ 90, raison ≤ 110 (proposé), extrait ≤ 600, nom ≤ 60, groupe ≤ 70, commission ≤ 80 points de code | second essai ; raison : proposé | bloquant, texte |
| C6 | Titre sans « : » ; raison terminée par « . », « ? » ou « ! », sans guillemets autour | E8 ; essais | bloquant, texte |
| C7 | `lienScrutin` et chaque `source.adresse` en `https://www.assemblee-nationale.fr/…`, au motif du premier essai ; `lienScrutin` égal à `…/dyn/{legislature}/scrutins/{numero}` | essais ; P-09 (rien d'ailleurs) | bloquant, texte |
| C8 | Dates valides ; `auteur.depot` ≤ `vote.date` ; `source.date` ≤ `vote.date` | ce document | bloquant, texte |
| C9 | Combinaisons permises de `objet`, `issue`, `etape` et `suite` (tables du second essai) ; `rejetDeProcedure` vrai seulement pour `objet: motion`, `issue: rejete` | second essai ; D-028 | bloquant, texte |
| C10 | `scrutin` unique dans le lot ; titres distincts | ce document | bloquant, lot |
| C11 | Chaque `empreinte` égale à celle recalculée | partie 5 | bloquant, texte |

**B. Un texte**

| # | Contrôle | Source | Sorte |
|---|---|---|---|
| C12 | `tension` parmi les huit codes ; `sens` à 0 ou 1 | règle 16 | bloquant, texte |
| C13 | Deux raisons `pour`, deux `contre` ; de chaque côté, au moins une attendue ; autant d'inattendues des deux côtés, 0 ou 1 ; `"aucun"` seulement sur une inattendue, une fois par côté au plus | D-034 ; contrôles du second essai | bloquant, texte |
| C14 | Les groupes des quatre raisons sont différents ; un non-inscrit au plus par texte | `projet.md` §8 ; D-044, point 3 | bloquant, texte |
| C15 | Chaque `groupe` (auteur et raisons) est un `libelle` de `groupes`, chaque commission un `libelle` de `commissions` ; chaque ligne des deux tables sert ; un sénateur a un groupe. **Fidélité à l'open data** : avec la copie locale des organes (`amo`), le groupe est le `libelle` de l'organe dont l'élu était membre le jour du dépôt ou de la séance, jamais un sigle ; repli sans copie locale : la liste des codes interdits du second essai | E5 ; second essai, partie 2.10 | bloquant (fidélité : lot) |
| C16 | `elision` : `d'` devant une voyelle, `de` devant une consonne ; un nom qui commence par « H » ou « Y » est à confirmer (h muet, son y) | second essai, partie 2.11 | à confirmer, texte |
| C17 | Aucun mot de valeur employé dans une raison (« sécurité », « liberté », « égalité », « mérite », « solidarité », « responsabilité », « précaution », « innovation », « tradition », « indépendance », « souveraineté », « ouverture », « État », « privé », « marché » ; « changement », « local », « national » relevés aussi) ; les noms propres d'une liste fermée passent (« Conseil d'État », « États-Unis ») | E2 ; `tensions.md`, partie 1 | à confirmer, texte |
| C18 | Noms de pays et de nationalités dans le titre et les lignes, relevés | D-053, point 2 (jamais un texte qui vise une nationalité) | à confirmer, texte |

**C. Le lot**

| # | Contrôle | Source | Sorte |
|---|---|---|---|
| C19 | Les trois textes d'entrée : trois tensions différentes, au moins un rejet (un rejet de procédure ne compte pas) | règle 15 ; D-028 | bloquant, lot |
| C20 | Sur les textes du jour, dans l'ordre du calendrier, chaque fenêtre glissante de 28 textes : rejets entre un tiers et deux tiers (10 à 18 sur 28), rejets de procédure non comptés. Relevé en plus, sans bloquer : les échanges d'un texte du jour contre un texte de réserve qui sortiraient des bornes | D-028 ; règle 6 | bloquant, lot |
| C21 | Règle de forme : pour chaque forme reconnaissable par programme (premier mot du titre ; `vote.objet`), dès 3 occurrences dans une fenêtre glissante de 28 textes du jour, adoptés et rejetés chacun entre un tiers et deux tiers ; sinon la forme est réécrite | D-041 ; `produit.md`, règles d'écriture (« trois occurrences en quatre semaines ») | bloquant, lot |
| C22 | Égalité entre groupes, sur les textes d'entrée et du jour : chaque groupe de la législature fournit entre deux tiers et quatre tiers de la part égale des raisons, non-inscrits hors du compte. Le nombre de groupes vient de la copie locale de l'open data ; un groupe absent du lot compte zéro (proposé : la fenêtre de douze semaines de D-044 est plus longue que le lot, qui en couvre neuf à dix ; on l'applique au lot entier ; si le lot dépasse douze semaines, à chaque fenêtre glissante de 84 textes du jour) | D-044, point 3 ; règle 7 | bloquant, lot ; s'il échoue, la question revient au porteur, car elle touche D-044, point 3 (D-062, point 5) |
| C23 | Pour chaque tension, dans chaque fenêtre glissante de 56 textes du jour (huit semaines), autant de textes de sens 0 que de sens 1, à un près ; sur le lot entier s'il est plus court. **Exception pour `T`** : les textes de sens 0 (favorable sert la tradition) font au moins un quart des textes `T` de la fenêtre, soit 1 pour 3 au plus (D-064, arbitrage de l'équipe, qui relâche E9 sur cette seule tension, faute de textes récents « tradition ») | E9 ; règle 16 ; D-064 | bloquant, lot |
| C24 | Chaque tension entre ⌊n/8⌋ − 1 et ⌈n/8⌉ + 1 fois parmi les n textes du jour (proposé : le seuil de netteté, règle 17, est calé sur huit tensions qui circulent à parts égales ; sur un lot de 63 textes du jour, 6 à 9 par tension) ; jamais la même tension deux jours de suite (comme les cercles simulés de `regles.md`, section 5) | règles 16 et 17 ; `regles.md`, section 5 | à confirmer, lot |
| C25 | Six textes au plus par commission dans chaque fenêtre glissante de 28 textes du jour, les trois textes d'entrée comptés avec la première (proposé : sur environ 70 textes, six par commission en tout serait impossible ; la proportion du plafond de D-060 est gardée) | D-060 (plafond signalé au porteur, à la place des quotas du §8) | bloquant, lot ; à confirmer par Contenu |
| C26 | Chaque `vote.date` est antérieure au premier jour du test | E11 | bloquant, à l'import (la date du premier jour n'est connue que là) |
| C27 | Un vote de plus de 18 mois avant le premier jour est relevé | `projet.md` §8 (pas de textes trop anciens) ; risque dit par Contenu (remonter 12 à 18 mois) | à confirmer, à l'import |
| C28 | Chaque texte de réserve passe tous les contrôles d'un texte du jour | règle 20 | bloquant, lot |
| C29 | Les rôles : aucun texte d'entrée ne sert aussi de texte du jour | règle 15 (les textes d'entrée sont des archives, hors du calendrier) | bloquant, lot |

**D. À l'import, sur le serveur**

| # | Contrôle | Source | Sorte |
|---|---|---|---|
| C30 | Un texte déjà ouvert ne change qu'avec un `erratum` nouveau ; sinon l'import est refusé et le lot précédent reste. Un `repondu` ne redevient jamais une autre sorte. Avec `etiquette`, seuls `pole` et `sens` peuvent changer ; avec `revele`, seuls `auteur`, `vote` et les groupes ; avec `repondu`, rien n'est resservi | partie 5 ; règle 20 | bloquant |
| C31 | En ligne, un lot `provisoire` ou `exemple` est refusé | partie 2 | bloquant |
| C32 | L'ordre d'affichage des raisons, recalculé, est le même qu'au précédent import | partie 4 | bloquant |

## 8. Ce que les contrôles ne prouvent pas

Dit franchement : un programme vérifie la forme et les comptes, pas le sens. Restent humains, par la méthode des essais (`docs/etape-6/plan-version-test.md`, partie 2, « Note sur les textes », gardé pour mémoire depuis D-062 ; le plan de D-064 confirme que les textes sont écrits par les agents en session) :
- **la fidélité** du résumé et de chaque raison au texte et aux débats : vérification indépendante par un autre modèle, le plus capable (D-036) ;
- **le côté et le pôle** de chaque raison, et le sens du texte : annotation à l'aveugle ;
- **« une forme n'annonce jamais le vote »** pour les phrases fixes que le programme ne reconnaît pas (C21 ne voit que le premier mot du titre et l'objet du vote) ;
- **le critère du camp** (D-053, point 1) : il se mesure en bêta, auprès de volontaires hors du jeu, pas par un contrôle.

## 9. L'exemple

`exemple.json` contient deux textes inventés : un texte d'entrée et un texte du jour. Les groupes, la commission, les députés, les scrutins (législature 99) et les adresses sont inventés ; aucun ne décrit un vrai texte. Il passe le type `FichierTextes` (vérifié avec `tsc`) et les contrôles marqués « texte ». Il ne passe pas les contrôles du lot (C4, C19 et suivants) : c'est voulu, et c'est ce que dit `lot.exemple`.

## 10. Ce que ce format touche, et les points ouverts

- **Une décision suspendue pour le test, par un arbitrage de l'équipe** : le trio d'entrée commun à tous les cercles suspend `onboarding.md` et la règle 15 (trois textes fixés par cercle), D-065 point 2 (partie 3, C4) ; à rétablir pour la version publique.
- **Appliquées** : D-028, D-034, D-041, D-044 (point 3), D-053, D-062 (le lot du jeu entier), D-064 (« Tradition ou changement » à 3 pour 1, C23 ; le moteur la lit de même, `controleSens`, `EXCEPTIONS_SENS`), E2, E4, E5, E8, E9, E11, les règles 16 et 20, et le plafond par commission signalé avec D-060.
- **Lectures proposées, à confirmer par Contenu** :
  - les nombres exacts du lot (C4) ;
  - l'égalité entre groupes appliquée au lot entier, plus court que douze semaines (C22) ;
  - l'équilibre des sens par fenêtre de huit semaines, et l'exception de D-064 lue comme « au moins un quart de sens 0 » (C23) ;
  - la répartition des tensions (C24) ;
  - le plafond par commission compté par fenêtre de 28 textes (C25).
- **Une longueur à fixer** : 110 points de code par raison, à vérifier sur les captures d'iPhone SE de la phase 1 (UX, Front-end).
- **Les voix sous le vote** (E4) restent ouvertes ; le format ne les porte pas.
- **Ordre d'affichage des raisons** : tiré par empreinte (partie 4). C'est une précision du « tiré une fois par texte » du §8, sans changement de règle.
- **Les mots après « Entre »** (partie 6) suivent désormais E2 et `regles.md` (J9) ; `TENSIONS.sansArticle` remplace `TENSIONS.court` dans `contrat.ts`.
