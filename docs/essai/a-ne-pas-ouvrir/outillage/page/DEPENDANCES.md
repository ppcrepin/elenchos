# Page de l'essai : dépendances et commandes (lots 1 à 3)

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

Licences : SIL Open Font License 1.1 pour les deux familles. Aucun des deux `OFL.txt` ne réserve de nom (« Reserved Font Name » n'apparaît que dans le texte général de la licence ; la ligne de copyright n'en déclare aucun) : les faces réduites gardent leur nom interne (Alegreya Bold, Alegreya Medium Italic, Alegreya Bold Italic, Alegreya Sans Regular, Alegreya Sans Bold, Alegreya Sans Italic). Les deux textes de licence et les copyrights iront en commentaire dans la page (lot 7).

## Déjà présent dans l'environnement (non téléchargé)

- Node 22.22.0 : noyau, moteur, tests, `rejouer.js`. Aucun paquet npm.
- Python 3.11.15 : `polices/reduire.py` seulement, dans un environnement virtuel où fontTools et brotli sont installés depuis les roues ci-dessus (`pip install --require-hashes -r polices/exigences-polices.txt`).
- `playwright-core` 1.56.1 et Chromium 1194 (`/opt/node-tools/node_modules/`, `/opt/pw-browsers/`) : servi seulement à deux vérifications ponctuelles, hors tests versionnés (les six faces passent le contrôle des polices de Chromium ; le noyau et le moteur, concaténés sans leurs lignes Node, donnent dans Chromium les mêmes traces que dans Node). Ils serviront au harnais (lot 8).

## Commandes

Depuis ce dossier (`docs/essai/a-ne-pas-ouvrir/outillage/page/`) :

- Polices : `python3 -I polices/reduire.py --sources DOSSIER_VIDE --scelle ../scellement/candidat/fichier-scelle-candidat.json --sortie polices` (même résultat octet pour octet à chaque exécution ; à refaire sur le fichier scellé final).
- Tests : `node --test tests/test-noyau.js tests/test-moteur.js` (29 tests, environ 25 s). Variable `ELENCHOS_SCELLE` pour un autre fichier scellé.
- Journaux de mes joueurs témoins : `node tests/ecrire-journaux.js` (écrits dans `tests/journaux/`, à réécrire si le fichier scellé change).
- Rejouer un journal par le moteur : `node rejouer.js --scelle FICHIER --journal JOURNAL [--durees DUREES] --sortie DOSSIER` (écrit `trace.json`, `carnet.txt`, `copie-n.txt`).
