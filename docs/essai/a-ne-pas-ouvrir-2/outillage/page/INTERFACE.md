# Interface entre socle, moteur et écrans (second essai)

*Front-end, instance A, lot 1 (10 octobre 2026). Pour l'instance B (téléphone et cadre, lots 4 et 5) et pour les lots 2 et 3 (moteur). Outillage d'essai (D-001 tenu ; `simulation-2.md`, « Décisions touchées », Front-end). Renvois : « §n » = `simulation-2.md` ; « partie n » = `a-ne-pas-ouvrir-2/schema.md`.*

## 1. Qui écrit quoi

| Fichier | Rôle | Instance | État au lot 1 |
|---|---|---|---|
| `noyau.js` | SHA-256, base64, UTF-8, JSON canonique, fractions, tirage, heure de Paris, typographie, élisions ; `modulo`, `squelette` | A | fait, testé |
| `calendrier.js` | la table du calendrier, des semaines et des membres, lue et vérifiée | A | fait, testé |
| `journal.js` | codes des entrées, journal version 4, ses 15 règles de validité | A | fait, testé |
| `etat.js` | état format 2 : transitions (un geste = une écriture), durées, journal tiré de l'état | A | fait, testé |
| `memoire.js` | clés `partie-2` et `verif-2`, ancienne partie par la liste des clés, arrêts 2 et 3 | A | fait, testé |
| `socle.js` | contexte, V1 à V6, départ, horloges, toucher compté, gestionnaire unique, point d'accès | A | fait, testé hors navigateur |
| `moteur.js` | `histoire`, `resume` (lot 2) ; `calculer`, `cartesServies`, `visagesDejaJoue` (lot 3) ; `regles` (les règles une à une) | A | lots 2 et 3 faits, testés ; le moteur du premier essai est rangé dans `tests/premier-essai/moteur-premier-essai.js` |
| `trace.js` | assemblage des traces (version témoin seulement) : `histoire(collecte, resume, sha, empreinte)`, `tracerHistoire(N, C, M, octets)` (lot 2) ; `partie(journal, R, durees, carnet, copies, empreinte, resumeSha)` (lot 3) | A | traces de l'histoire et de partie faites ; branchement dans la version témoin au lot 6 |
| `textes.js`, `interface.js`, `style.css`, `carnet.js` (à créer) | écrans, mots, formes, carnet | B | **copies du premier essai, à adapter aux lots 4 et 5** |
| `construire.py` | construction | A et B | version 5, statut, sources ; table des lettres au lot 6 |

Ordre dans la page (`construire.py`) : `noyau`, `calendrier`, `journal`, `etat`, `memoire`, `moteur`, `textes`, `socle`, `interface`. Constantes posées avant : `ENTREES`, `SCELLE_B64`, `CONFUSABLES` (`{}` jusqu'au lot 6).

Règles communes : aucun nombre du calendrier en dur (tout se lit dans `cal`) ; aucun mot interdit du contrôle 5 ; aucune lecture de l'heure hors des deux fonctions du socle ; aucun accès à `localStorage` hors de `memoire.js`.

## 2. Démarrage

À la fin de `interface.js` (instance B) :

```js
var socle = ElenchosSocle.creer({
  window: window, document: document, performance: performance,
  maintenantMs: function () { return Date.now(); },
  version: ENTREES.version_page, scelleB64: SCELLE_B64, confusables: CONFUSABLES
});
socle.demarrer(ecrans);
```

Ordre de `demarrer` (§8.8 ; partie 3.4 ; FE-4), tout dans la même tâche :
1. contexte : hors de l'icône → `ecrans.hors(type, appareil)` (`'ailleurs'`, `'autre'`, `'onglet'`) ; rien n'est vérifié ni écrit ;
2. V1 à V5 (V4 : version 5, forme canonique, **table du calendrier cohérente**) ; V5 : les trois vecteurs du §0 ;
3. `M.histoire(scelle, cal)`, `M.resume(arrivee)`, SHA-256, V6. Un moteur sans `histoire` (lot 1) ou une erreur donne aussi V6 ;
4. `verif-2` : écrite, relue, effacée ; sinon arrêt 2 ;
5. `partie-2` relue ; illisible → arrêt 1, repère M1 (rien n'est effacé ni réécrit) ;
6. liste des clés : si `elenchos-essai:partie` y est → `ecrans.ancienne({deuxParties, appareil})`, **rien n'est écrit** ; « Effacer » confirmé → `socle.effacerAncienne()`, qui retire toutes les clés « elenchos-essai: » sauf `partie-2` et `verif-2`, puis commence ou reprend ;
7. sinon : partie neuve (écrite aussitôt) ou reprise, puis `ecrans.rendre()`.

## 3. Ce que les écrans fournissent au socle (`ecrans`)

| Membre | Obligatoire | Rôle |
|---|---|---|
| `rendre()` | oui | tout dessiner depuis `socle.etat()` et `socle.resultats()` |
| `arret(n, repere)` | oui | arrêts du §8.11 : `n` = 1 (repère `'V1'`…`'V6'`, `'M1'`), 2, 3 ; vue seule, texte d'UX |
| `hors(type, appareil)` | oui | écrans hors de l'icône (§8.13) |
| `ancienne({deuxParties, appareil})` | oui | page A du §8.2 (« La partie du premier essai est encore là ») |
| `actions` | oui | `{nom: function (bouton) {…}}` ; le socle appelle `actions[data-action]` au clic, sauf `aria-disabled="true"` |
| `avantToucher(ev)` | non | appelé au `pointerdown`, avant le toucher compté (par exemple : effacer une note de la bande) |
| `revenu()` | non | retour au premier plan, état relu et identique (par exemple : relire l'heure de 2.5) |
| `carnet()`, `copies()` | non | texte du carnet et copies du chargement, pour le point d'accès de la version témoin |

## 4. Ce que le socle fournit aux écrans (`socle`)

- `geste(function (e, h) { … })` : **un geste, une écriture.** La fonction reçoit une copie de l'état et l'horloge de premier plan `h` (ms) ; elle appelle une ou plusieurs transitions d'`ElenchosEtat`, et peut changer `e.vue` ou le sac `page` d'un jour. Si elle réussit, la copie devient l'état et s'écrit d'un bloc ; si une transition lève `ErreurEtat`, rien ne change, rien ne s'écrit, et l'erreur remonte (c'est un défaut d'écran). Après un arrêt technique ou « Tout effacer », plus rien ne s'écrit.
- Le **toucher compté** est fait par le socle (`pointerdown`, `keydown`) : ouverture du jour, versions, dernier toucher. Pendant un saut confirmé et pas fini, il compte au saut.
- `etat()`, `scelle()`, `cal()`, `arrivee()`, `empreinte()`, `resultats()` (moteur, recalculé quand l'état change), `confusables()`, `horloge()`.
- `lireParis()` : **seulement** à l'affichage de 2.5 aux jours joués (« En attendant ») ; relevé pour la version témoin.
- `instantDuSaut()` : **seulement** pour `E.confirmerSaut` (« C'est la seule heure lue pendant un saut », partie 4.3.9).
- `effacerAncienne()`, `toutEffacer()`, `arreter(n, repere)`, `efface()`.
- Point d'accès `window.ElenchosEssai` (version témoin) : `version`, `empreinte()`, `etat()`, `journal()`, `durees()`, `resultats()`, `arrivee()`, `lectures()`, `carnet()`, `copies()`, `calculer(journal)`, `histoire(collecteur)`.

## 5. Le calendrier (`cal = socle.cal()`)

`premier` (1), `dernier` (clôture), `dernierJeu` (veille de la clôture), `jours` (lignes de la partie 2.4), `sauts`, `semaines`, `semainesEssai`, `textesEntree`, `invitant`, `nomCercle`, `membres`, `depuis(membre)`.

Questions : `ligne(j)`, `type(j)`, `estJoue`, `estPointDeSaut`, `estSaute`, `estCloture`, `estDimanche`, `estArrivee`, `aUneOuverture`, `suivant(j)` ; `saut(n)` → `{numero, point, sautes, jours, textes, reprise}`, `sautDuJour(j)`, `sautQuiReprend(j)` ; `texteRepondu(d)` (d négatif compris), `jourDeReponse(t)`, `texteRevele(j)`, `texteDevine(j)` ; `semaine(n)`, `semaineDuJour(d)`, `rangEssai(n)` (« Semaine 1 », « Semaine 2 » du cadre), `textesRevelesSemaine(n)`, `textesRepondusSemaine(n)`, `ordreTextes`.

Exemples pour les écrans, sans nombre en dur :
- barre « Jour {k} · {jour} » : `j`, `cal.ligne(j).nom_jour` ;
- lien « Abandonner cette journée » et « Jour suivant » : `cal.estJoue(j)` et pas pendant l'entrée ; aux points de saut, « Avancer au dimanche » ;
- croix inactive (« Pas dans l'essai. ») : `cal.estPointDeSaut(j) || cal.estCloture(j)` ;
- ligne « Reprendre / Revoir la révélation » : `cal.estJoue(j) && cal.ligne(j).revelation_porteur === 'lue'` ;
- question du saut au premier dimanche : `j === cal.sauts[0].reprise` ;
- frise : `cal.saut(n).jours`, `cal.semainesEssai`, `cal.ligne(d).type`.

## 6. L'état, format 2 (`ElenchosEtat`, alias `E`)

```
{ format: 2, ecritures, horloge,
  jours: { "<j>": { ouverture, versions, etapes, coups, pp, page } },   // jours atteints, de cal.premier à K
  sauts: [ { numero, depart, textes_atteints, coups: {ouvert}, pp, page } ],
  arret, fin,
  vue: {} }
```

- `ouverture`, `versions`, `etapes`, `coups`, `sauts[].{numero, depart, textes_atteints, coups}`, `arret`, `fin` : **le journal version 4** (partie 4.4). Les écrans ne les changent que par les transitions.
- `pp` : repères de durée (horloge de premier plan, ms). `page` (par jour et par saut) et `vue` : **à l'instance B**, libres (révélation en cours, écran affiché, pile…), jamais dans le journal. `vue` doit rester un objet (vérifié à la relecture, M1).
- `E.journal(etat, cal, empreinte)`, `E.fichierDurees(etat, cal, maintenant)` ; `E.K(etat)`, `E.jour(etat, j)`, `E.jourCourant`, `E.journeeFinie(etat, cal, j)`, `E.sautEnCours(etat)`, `E.rattrapage(etat, cal)` → `{numero, total, repondus, termine, rang, jour, texte, reprise}`, `E.texteEntreeCourant`.

**Écrans → transitions** (dans `socle.geste`, `h` = horloge ; `S` = scellé, `cal`) :

| Geste ou affichage | Transition |
|---|---|
| premier affichage de 1.2 | `E.afficherEntree(e, cal, h)` |
| 1.3 accepter | `E.consentir(e, cal)` |
| 1.4 « Valider » | `E.repondreEntree(e, cal, S, t, {niveau, raison})`, t = `E.texteEntreeCourant(e, cal)` |
| 1.5 « Voir sa réponse » | `E.parierEntree(e, cal, t, niveau)` |
| 1.8 Apple / Google ; 1.9 « Valider » / « Plus tard » | `E.terminerCompte(e, cal, pseudo, 'apple' \| 'google' \| 'email_valider' \| 'email_plus_tard', h, socle.confusables())` |
| premier affichage de 2.1 | `E.ouvrirDeviner(e, cal, j, n, h)`, n = nombre de cartes servies (moteur) |
| visage, « Passer », retrait | `E.poserCarte(e, j, i, 'Agathe' \| … \| 'passe' \| null, h)` (un visage quitte sa carte d'origine) |
| raison sur la carte cachée | `E.poserRaison(e, S, cal, j, i, raison, h)` |
| « Valider » de Deviner | `E.validerDeviner(e, j, h)` |
| premier affichage de 2.3 | `E.afficherRepondre(e, cal, j, h)` |
| 2.4 « Valider » (jour joué ou rattrapage) | `E.repondre(e, S, cal, j, {niveau, raison}, h)` ; au rattrapage, `j = E.rattrapage(e, cal).jour`, et le jour suivant est atteint dans la même écriture |
| « Relire » ; « Reprendre / Revoir la révélation » | `E.compter(e, cal, 'relire' \| 'rouvrir')` |
| Le Cercle, Moi, écran d'un proche, « Qui est qui » | `E.compter(e, cal, 'cercle' \| 'moi' \| 'proche' \| 'qui_est_qui', deviner_affiche)` |
| carnet du jour | `E.repondreCarnet(e, cal, j, 'moment' \| 'saut_clair' \| 'hesite' \| 'moment_semaine', code)` |
| ouverture de « Votre carnet du jour » | `E.marquer(e, j, 'fige', h)` (les durées du jour s'arrêtent, comme au premier essai) |
| « Aller au jour suivant » | `E.allerAuJourSuivant(e, cal, abandon)` ; `abandon` vrai après « Abandonner » confirmé |
| ouverture de la page du saut | `E.ouvrirPageSaut(e, cal, h)` |
| « Annuler » de la page du saut | `E.annulerSaut(e, cal)` |
| « Avancer au dimanche » (page) | `E.confirmerSaut(e, cal, socle.instantDuSaut(), h)` ; le premier texte du rattrapage est atteint |
| « Texte suivant » | `E.afficherTexteRattrapage(e, cal, h)` |
| « Aller au dimanche » | `E.finirSaut(e, cal, h)` ; le toucher suivant ouvre le dimanche |
| « Arrêter l'essai », confirmé | `E.arreter(e, cal, raison, f2)` (F2 dès le jour 3) |
| questions de fin | `E.finir(e, cal, {f2, servi, regle, avis, raisons, portrait, barre, suspense})` |
| « Tout effacer », confirmé | `socle.toutEffacer()` |
| autres repères (fin de Répondre, « Continuer »…) | `E.marquer(e, j, nom, h)`, noms : `E.REPERES_JOUR` |

Pseudo : `ElenchosJournal.pseudoGardable(x, socle.confusables())` donne le refus ; le motif (prénom ou rond) se lit avec `N.squelette`.

## 7. Le moteur (lots 2 et 3, instance A) : ce que les écrans recevront

- `M.histoire(scelle, cal[, collecteur])` → l'état à l'arrivée (lot 2) ; le socle le gèle en profondeur après V6 ; il n'est jamais écrit. `M.resume(arrivee)` → le résumé de la partie 3.2 (V6). L'état à l'arrivée contient :
  - `coupure` (la veille de l'arrivée) ;
  - `curseurs[p][t]` : `{c, l, net, somme_w}` vus le jour de l'arrivée (entrée et textes répondus jusqu'au jour d'arrivée − 2), et `sommes[p][t]` : `{sw, swp}` (Σw, Σw·π), point de départ du lot 3 ;
  - `manche_jour_0` : `{texte, manches}`, les manches complètes de la veille de l'arrivée (forme de la partie 4.3.4), dont la révélation tombe le jour de l'arrivée ;
  - `titres` : une semaine par élément, de la première à la dernière semaine de l'histoire, avec les décomptes (forme de la partie 4.2, `semaines`) ;
  - `temperaments[p]` : les décomptes et la liste du dernier dimanche de l'histoire (forme de la partie 4.3.8) ;
  - `tirage`.
  Pour les écrans (instance B) : titres passés = `arrivee.titres` (puis `R.titres` au lot 3) ; Le Cercle des jours 1 à 6 = la dernière semaine de `arrivee.titres` (titulaires, `surprise.texte`) et `arrivee.temperaments[p].temperaments` ; initiales sur les barres = `R.jours[j].curseurs_vus` (lot 3). Tout se lit en `N.Fraction` ; `pourDessiner()` pour un curseur.
- Le `collecteur` (un objet vide passé par la version témoin) reçoit `jours`, `semaines`, `arrivee` : le détail de chaque jour de l'histoire, que `ElenchosTrace.histoire` met au format de la trace de l'histoire (partie 4.2) sans rien recalculer.
- `R = M.calculer(scelle, cal, arrivee, journal)` (lot 3), fonction pure ; elle ne modifie ni le journal ni l'état à l'arrivée. `R.K` : le dernier jour atteint. Les noms et les formes sont ceux de la trace de partie (partie 4.3), en fractions `N.Fraction` (`pourDessiner()` pour un curseur) :
  - `R.jours[j]` : `entree`, `manches`, `revelation` (avec `avis_cercle`, `jumeaux`, verdicts, `pas_de_cote`), `message`, `phrase_jour`, `dimanche`, `portrait` (avec `barre`), `curseurs_vus`, `cercle`, `surprises_proches`, `mesures` (sans les durées) ; en plus, pour les écrans :
    - `cartes_porteur` : la manche du porteur à servir les jours où `deviner_porteur` est vrai, **même avant l'ouverture de Deviner** (`designe` et `raison_devinee` lus dans le journal) ; son nombre de cartes sert à `E.ouvrirDeviner`, son `cachee` à la raison ;
    - `compte_a_rebours` : `'revelation'` ou `'nouveau_texte'` (libellé de 2.5, §7.6), aux jours joués ; `null` ailleurs ;
    - présence (partie 4.3.2) : `manches` jours 1 à 14 (le porteur n'y a une clé que si Deviner s'est affiché ; `cartes_porteur` existe dès que `deviner_porteur` est vrai) ; `revelation` chaque jour (au jour 1, le texte abstrait de la veille, sans `avis_cercle`) ; `message` aux jours joués sauf l'arrivée et aux points de saut ; `phrase_jour` si le porteur a répondu ; `dimanche` aux dimanches de l'essai ; `mesures` aux jours qui ont une ouverture ; `entree` le jour d'arrivée dès que 1.2 s'est affiché (`etapes.entree`).
    - pour les écrans : 2.7d lit `revelation.avis_cercle` (`comptes`, `milieu`, `ligne`) ; la ligne du jumeau (§7.13) se lit dans `revelation.devineurs.porteur.jumeaux` et dans `manches.porteur.cartes[i].designe` ; Le Pas de Côté dans `revelation.pas_de_cote` ; 3.3a à 3.3e dans `dimanche` (`phrase_semaine.cas` vaut `nette` pour la phrase validée) ; Moi dans `portrait` (`ordre_moi`, `barre.longueur`, `barre.pleine`) ; Le Cercle dans `cercle` et `curseurs_vus` ; « Ses surprises » dans `surprises_proches` ; 2.6 dans `message`.
  - `R.sauts[i]` : mesures du saut, sans les durées ;
  - `R.titres` : les titres de chaque semaine tombée (1 à 13 depuis l'histoire, puis 14 et 15), pour les titres passés ;
  - `R.agregats`.
- `M.visagesDejaJoue(scelle, cal, j, hhmm)` pour 2.5, comme au premier essai (aussi dans `R.jours[j].attente`).
- `M.cartesServies(scelle, cal, arrivee)` → `j → {n, cachee}` : les cartes du porteur ne dépendent que du fichier, jamais de ses coups. C'est l'option `cartes` de `ElenchosJournal.valider` (règle 7) ; le nombre est le même que `R.jours[j].cartes_porteur.cartes.length`.
- Les durées viennent d'`E.dureesJour` et `E.dureesSaut` ; le carnet (§8.12) est une fonction pure de l'instance B (`carnet.js`), sur le journal, `R` et les durées, pour que la version témoin et le contrôle 13 la rejouent.

## 8. Écarts propres au lot 1 (rapportés à l'orchestrateur)

- **L1-3, durées au point de saut.** Le §8.12 arrête le bloc du jour « au toucher qui confirme le saut » et compte pourtant « la page du saut » confirmée dans le bloc de saut. Appliqué : la durée du jour s'arrête à l'ouverture de la page confirmée ; la page et la suite vont au saut, jusqu'à « Aller au dimanche ». Les versions du jour vont, elles, jusqu'au toucher qui confirme.
- **L1-4, arrêt entre la dernière réponse d'un rattrapage et « Aller au dimanche ».** Le dimanche est atteint (§0) mais n'a pas d'ouverture, les touchers comptant au saut. Appliqué : la règle 4 l'admet pour ce seul cas.
- Les autres écarts (spécification, schéma) sont dans le rapport du lot 1 à l'orchestrateur, avec leurs remplacements proposés.

## 8 bis. Écarts propres au lot 2

- **Surprise de la dernière semaine de l'histoire.** Le moteur applique le point 9 du fichier caché : seuls les textes qui ont un titre sont candidats (donc H86 seul). Le critère c3 du calibrage (H86 l'emporte, tous les textes candidats) garantit le même résultat sur le fichier scellé ; la trace donne les décomptes de tous les textes de la semaine, pour que le contrôle vérifie c3. Sur le fichier de test, non calibré, les deux lectures diffèrent (H88 aurait la plus forte part d'erreurs) : c'est attendu.
- **Les autres écarts** (spécification, schéma, fichier caché) sont dans le rapport du lot 2 à l'orchestrateur.

## 9. Tests

`node --test tests/test-noyau.js tests/test-polices.js tests/test-calendrier.js tests/test-etat.js tests/test-memoire-socle.js tests/test-histoire.js` (fichier scellé de test, inventé, `"provisoire"` : `tests/scelle-test.json`).

Fichier scellé de test, en deux passes (lot 2) : `python3 -I tests/scelle-test.py --personnages ../../../a-ne-pas-ouvrir/fichier-scelle.json --sortie /tmp/p1.json`, puis `node tests/resume-test.js /tmp/p1.json /tmp/resume.json`, puis `python3 -I tests/scelle-test.py … --resume /tmp/resume.json --sortie tests/scelle-test.json` ; mettre ensuite son SHA-256 dans `tests/entrees-test.json`. La page démarre alors sur ce fichier (V6 passe) ; c'est circulaire, et ne prouve rien de la concordance.

Trace de l'histoire (auteur P, pour la comparaison à trois) : `node tests/trace-histoire.js FICHIER_SCELLE SORTIE`, puis `node tests/comparer-histoire.js P=… C=… S=…`. Trace de partie v4 (P, dans Node) : `node tests/trace-partie.js FICHIER_SCELLE JOURNAL SORTIE [DUREES]`, ou `--temoin SORTIE_JOURNAL SORTIE` pour la partie complète du joueur scripté (mode moteur). Tests du lot 3 : `node --test tests/test-calculer.js` (fichier de test et candidat 1). Mesure de performance : `node tests/mesure-histoire.js [FICHIER_SCELLE] [RALENTI]` (Chromium sans tête, ralenti 4 fois par défaut). Le joueur scripté `tests/partie-test.js` montre l'enchaînement des transitions d'une partie entière ; l'instance B peut s'en servir de modèle pour ses gestes.
