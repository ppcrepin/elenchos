# Page de l'essai : dépendances et commandes (lots 1 à 8)

## Second essai : état aux lots 1 à 3 (10 octobre 2026)

Copie des sources du premier essai (`docs/essai/a-ne-pas-ouvrir/outillage/page/`, non touchées), plus le socle du second essai. Contrat entre socle, moteur et écrans : `INTERFACE.md`. Rien n'est téléchargé de plus.

- Fichier scellé de test, inventé et `"provisoire"` : `python3 -I tests/scelle-test.py --personnages ../../../a-ne-pas-ouvrir/fichier-scelle.json --sortie tests/scelle-test.json` (même résultat octet pour octet ; `tests/entrees-test.json` porte son SHA-256). Depuis le lot 2, en deux passes avec `--resume` (ci-dessous).
- Tests du lot 1 : `node --test tests/test-noyau.js tests/test-polices.js tests/test-calendrier.js tests/test-etat.js tests/test-memoire-socle.js` (variable `ELENCHOS_SCELLE` pour un autre fichier).
- Non-régression du moteur du premier essai (rangé au lot 2 dans `tests/premier-essai/moteur-premier-essai.js`), sur le fichier scellé du premier essai : `node --test tests/premier-essai/test-moteur.js`.
- Construction (contrôle 5 mécanique ; un fichier provisoire ne donne que la version témoin) : `python3 -I construire.py --scelle tests/scelle-test.json --entrees tests/entrees-test.json --sortie DOSSIER`.
- Le reste de ce document décrit le premier essai : harnais, contrôles et publication sont à reprendre aux lots 6 et 7.

Lot 2 (histoire) : rien de téléchargé.
- Moteur du second essai : `moteur.js` (`histoire`, `resume`, `regles`) ; le moteur du premier essai est rangé dans `tests/premier-essai/moteur-premier-essai.js` (non-régression).
- Fichier scellé de test en deux passes, avec l'empreinte de son propre résumé : voir `INTERFACE.md`, partie 9 (`tests/resume-test.js`).
- Tests du lot 2 : `node --test tests/test-histoire.js`.
- Trace de l'histoire de la page (P) : `node tests/trace-histoire.js FICHIER_SCELLE SORTIE` ; comparaison à trois (P, C, S), octet pour octet, avec les premiers chemins qui diffèrent : `node tests/comparer-histoire.js P=… C=… S=…`.
- Mesure de performance : `node tests/mesure-histoire.js [FICHIER_SCELLE] [RALENTI]`, avec `playwright-core` 1.56.1 et Chromium de l'environnement (`/opt/node-tools/node_modules/`, `/opt/pw-browsers/`), déjà présents ; chemin réglable par `ELENCHOS_PLAYWRIGHT`.

Lot 3 (moteur du porteur) : rien de téléchargé.
- `moteur.js` : `calculer`, `cartesServies` ; `trace.js` : `partie` (trace de partie v4).
- Tests : `node --test tests/test-calculer.js` (fichier de test, et candidat 1 du scellement s'il est présent ; `ELENCHOS_CANDIDAT` pour un autre).
- Trace de partie de la page : `node tests/trace-partie.js FICHIER_SCELLE JOURNAL SORTIE [DUREES]`.
- Mesure : `node tests/mesure-histoire.js` mesure aussi `calculer` (partie complète) à chaque geste.

## Premier essai

Outillage d'essai (D-001 tenu ; `simulation.md`, « Décisions touchées »). Écrit par Front-end le 6 octobre 2026.

## Téléchargé

| Quoi | D'où | Version ou commit | SHA-256 |
|---|---|---|---|
| `Alegreya[wght].ttf` | `raw.githubusercontent.com/google/fonts/…/ofl/alegreya/` | commit `7085eb89a950e85db5b166b7a58d414544b4140c` (branche `main`, relevé le 6 octobre 2026 par `git ls-remote`) | `ba5564634b93a8f8ba57b48cd4f1ae7417d2b4656fbac779028679b00de3cf12` |
| `Alegreya-Italic[wght].ttf` | idem | idem | `fa915eec76227935dc5fb678953c94b71287c360928013cfdb441dfe52f5a391` |
| `AlegreyaSans-Regular.ttf` | `…/ofl/alegreyasans/` | idem | `8fab634196007afca839f1e5a6fb300976daff55d8528b590ef032f01b14ea10` |
| `AlegreyaSans-Bold.ttf` | idem | idem | `a3055a1893759bdbd7504bb22abc583769e7974c49353176eac0b03792c9fb8e` |
| `AlegreyaSans-Italic.ttf` | idem | idem | `f49f6f2bdd84df850b25b0f8185d8a051e1d1eb2dd08e2f91b8c7b86d9a9e1a6` |
| `OFL.txt` d'Alegreya (copié en `polices/OFL-alegreya.txt`) | `…/ofl/alegreya/` | idem | `f6f60d5d4cf4f4b1fc4e41353c897a2f5a16e6396c0cd8fa8bdfd2f4586a9a68` |
| `OFL.txt` d'Alegreya Sans (copié en `polices/OFL-alegreyasans.txt`) | `…/ofl/alegreyasans/` | idem | `0677891e6a143f297350d260ad766ad33bfc18ed5fa4f213acf648d6b597ec1a` |
| fontTools (roue CPython 3.11, Linux x86-64) | PyPI | 4.66.1 | `72299346b96b9244dabcc051b24e4653da4edfda6105544cfb10ce856a1afaac` |
| brotli (roue CPython 3.11, Linux x86-64) | PyPI | 1.2.0 | `40d918bce2b427a0c4ba189df7a006ac0c7277c180aee4617d99e9ccaaf59e6a` |

Les cinq polices sources ne sont pas versionnées : `polices/reduire.py` les télécharge au commit noté et vérifie leur SHA-256 (table `SOURCES`). Les six faces réduites, les deux `OFL.txt` et leurs SHA-256 (`polices/empreintes.txt`, `polices/polices.json`) sont versionnés : la construction ne télécharge rien (§8.8).

Licences : SIL Open Font License 1.1 pour les deux familles. Aucun des deux `OFL.txt` ne réserve de nom (« Reserved Font Name » n'apparaît que dans le texte général de la licence ; la ligne de copyright n'en déclare aucun) : les faces réduites gardent leur nom interne (Alegreya Bold, Alegreya Medium Italic, Alegreya Bold Italic, Alegreya Sans Regular, Alegreya Sans Bold, Alegreya Sans Italic). Les deux textes de licence, les copyrights et la ligne « Polices réduites ; glyphe vide U+202F (espace fine insécable) ajouté à chaque face. » sont dans le commentaire de la page (vérifié par le contrôle 5).

## Déjà présent dans l'environnement (non téléchargé)

- Node 22.22.0 : noyau, moteur, tests, `rejouer.js`, vérification de U+202F (`polices/verifier-202f.js`, brotli de la bibliothèque standard), harnais. Aucun paquet npm téléchargé.
- Python 3.11.15 : `polices/reduire.py` seulement, dans un environnement virtuel où fontTools et brotli sont installés depuis les roues ci-dessus (`pip install --require-hashes -r polices/exigences-polices.txt`).
- `playwright-core` 1.56.1 et Chromium 1194 (`/opt/node-tools/node_modules/`, `/opt/pw-browsers/`) : le harnais (`harnais/`). Chemin du paquet réglable par la variable `ELENCHOS_PLAYWRIGHT`. Chromium est lancé sans hinting des polices (`--font-render-hinting=none`), rendu géométrique comme sur l'iPhone (QUESTIONS.md, C-F3).
- ImageMagick (`convert`, `montage`), déjà présent : niveaux de gris des captures de la Direction artistique (`harnais/captures.js`) ; facultatif.

## Téléchargé sur la machine macOS de la passe WebKit seulement

`harnais/essai-passe-webkit.yml` (à ranger dans `.github/workflows/`) installe, à chaque lancement manuel, sur une machine `macos-15` de GitHub Actions (macOS fixé : Playwright 1.56.1 ne construit WebKit que jusqu'à macOS 15 ; le journal dit d'abord la version de macOS, l'image, et le WebKit installé avec sa cible) : `playwright` 1.56.1 (npm, version exacte) et son navigateur WebKit (`npx playwright install webkit`). Actions employées : `actions/checkout@v5`, `actions/setup-node@v5` (Node 22). Rien n'est installé dans l'environnement de l'équipe ; aucun secret ; rien de téléversé. Case « diagnostic » au lancement (option `--diagnostic` de `passe-webkit.js passe`) : seulement la construction, une sonde du profil gardé sur disque, puis (b) et (i) étape par étape, sans aucune valeur du jeu dans le journal.

## Preuve de publication (contrôle 14 g), sur une machine Linux de GitHub Actions

`harnais/essai-preuve-publication.yml` (à ranger dans `.github/workflows/`) lance `harnais/preuve-publication.sh` sur une machine `ubuntu-24.04`, sans rien installer : bash, curl, git, sha256sum et python3 de la machine ; action `actions/checkout@v5`. Lancement manuel, au moins dix minutes après la fin du déploiement Pages ; entrées : le commit de `gh-pages` attendu et le SHA-256 attendu de `essai/index.html`. Droits en lecture seule (`contents`, `pages`) ; aucun secret (seul le jeton éphémère de la tâche, pour l'API Pages) ; rien de téléversé ni de poussé.

## Commandes

Depuis ce dossier (`docs/essai/a-ne-pas-ouvrir/outillage/page/`) :

- Polices : `python3 -I polices/reduire.py --sources DOSSIER_VIDE --scelle ../../fichier-scelle.json --sortie polices` (même résultat octet pour octet à chaque exécution ; refait le 6 octobre 2026 sur le fichier scellé définitif, identique au candidat : les six faces sont identiques octet pour octet).
- Tests : `node --test tests/test-noyau.js tests/test-moteur.js tests/test-polices.js` (35 tests, environ 25 s ; fichier scellé définitif par défaut, `../../fichier-scelle.json`). Variable `ELENCHOS_SCELLE` pour un autre fichier scellé.
- Construction : `python3 -I construire.py --scelle ../../fichier-scelle.json --entrees ../../entrees-construction.json --sortie DOSSIER [--version-page N]` (Node requis : vérification de U+202F par `polices/verifier-202f.js`).
- Tous les contrôles de la page, dans l'ordre (environ quatre heures en série, deux heures trois quarts avec les contrôles 12 et 14 lancés côte à côte) : `sh harnais/tout.sh ../../fichier-scelle.json ../../entrees-construction.json SORTIE [REFERENCES] [PHRASES]` (PHRASES : phrases attendues du programme de contrôle, par défaut `../controle/sorties/final/phrases.json`) ; ou, un par un : `harnais/controle5.js`, `harnais/lancer.js journaux|rejeu`, `harnais/controle11.js`, `harnais/controle12.js`, `harnais/controle14.js`, `harnais/captures.js`, `harnais/passe-webkit.js attendus` (chaque fichier dit ses arguments en tête).
- Comparaison à la trace du programme de contrôle : `node harnais/comparer.js --page SORTIE/page --controle DOSSIER_DE_C --sortie RAPPORT.txt`.
- Contrôle 13, carnets et copies de la version du porteur comparés aux textes du programme de contrôle (durées masquées) : `node harnais/comparer.js --page SORTIE/page --controle DOSSIER_DE_C/textes --sans-traces --exiger --parties a,b,c --motif-carnet '{id}/carnet-durees-masquees.txt' --motif-copie '{id}/copie-{n-1}-durees-masquees.txt' --sortie SORTIE/rapport-controle13-carnets.txt`.
- Commit de `gh-pages` préparé pour la publication (contrôle 5, dernière phrase ; contrôle 13), lu dans les objets Git : `node harnais/commit-gh-pages.js --depot DEPOT --commit-gh-pages SHA --construction SORTIE/construction-v1 --sortie SORTIE/rapport-commit-gh-pages.txt [--remplacer]` (`--remplacer` : la version du porteur rejouée ensuite est lue depuis le commit).
- U+202F dans des polices WOFF2 : `node polices/verifier-202f.js FICHIER.woff2:CHASSE …`.
- Journaux de mes joueurs témoins : `node tests/ecrire-journaux.js` (écrits dans `tests/journaux/`, à réécrire si le fichier scellé change).
- Rejouer un journal par le moteur : `node rejouer.js --scelle FICHIER --journal JOURNAL [--durees DUREES] --sortie DOSSIER` (écrit `trace.json`, `carnet.txt`, `copie-n.txt`).
