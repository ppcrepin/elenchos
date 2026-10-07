# Rapport de contrôle de la page de l'essai

*Écrit par l'orchestrateur le 7 octobre 2026, à partir des sorties des programmes (page et harnais, programme de contrôle, tâches GitHub Actions), avant la publication. Il suit le §9 de `docs/essai/simulation.md` (contrôles 1 à 14) et le §9 bis de `regles-de-calcul.md`. Il ne cite aucun contenu de l'essai, mais renvoie à des sorties qui en contiennent : à ne pas ouvrir avant la fin de l'essai. Relecture : Cohérence, puis le Vérificateur (en cours).*

**En bref.** La page de l'essai (version 1, construite au commit `27faf46`) a passé tous les contrôles faisables avant la publication, dans Chromium et dans le moteur de Safari : le programme de contrôle, écrit indépendamment, retrouve octet pour octet les 220 parties jouées par la page (durées masquées), et le carnet que copie la version du porteur est celui qu'il calcule. Restent, après l'accord du porteur : la publication, sa preuve (contrôle 14 g) et l'inventaire des sites Pages refait juste avant (contrôle 14 c). Ce qui ne se vérifie que sur l'iPhone (zones sûres, clavier, polices d'iOS autour du jeu, mode app réel) ne l'a été que par la page-test v2, pour la mémoire et le contexte de l'icône.

*Statut de la passe WebKit et de la relecture du code (contrôles 5 et 14 h) : à compléter par l'orchestrateur avant la relecture du Vérificateur.*

## 1. Ce qui est contrôlé

| | |
|---|---|
| Page | version 1, construite au commit `27faf46` (`outillage/page/construire.py`, construction déterministe) |
| Version du porteur | `porteur/index.html`, 452 805 octets, SHA-256 `0981241209c6a02d0286ba15017b0ef02e01016fdbd01822a6bf5ee9a008e298` |
| Version témoin | `temoin/index.html`, 459 961 octets, SHA-256 `495822e395f02180dc18bd848291e1af47c9e423bbd68cce81dbd8ade955f975` ; ne diffère de la version du porteur que par le bloc témoin et son empreinte (contrôle 5) |
| Versions 2 et 3 | construites par le harnais seulement, pour rejouer un correctif (contrôles 14 b et i) ; jamais publiées |
| Fichier scellé embarqué | SHA-256 `59db7484…7b64`, octets identiques au fichier scellé (contrôles 1 et 5) |
| Navigateurs | Chromium de Playwright 1.56.1, toujours lancé sans hinting des polices (§9, contrôle 14 h) ; WebKit de Playwright 1.56.1 sur une machine macOS 15 de GitHub Actions |
| Rapport de construction | `outillage/page/sorties/construction/rapport-construction.txt` |

La page a été construite trois fois ; chaque construction a refait toute la chaîne des contrôles. Défauts trouvés par les contrôles et corrigés :
- construction `49ecbdc` (6 octobre) : « Encore flou » écrit avec « et » (UX, relecture du relevé du contrôle 11) ; message M1 à compléter (Vérificateur) ; écrans qu'aucune partie témoin n'affichait (UX), d'où la partie témoin (j) ;
- construction `741af69` (6 octobre au soir) : croix des révélations posée sur le double filet, sous-onglets de Moi décalés, trois boutons de « Tout effacer ? » en 2 + 1 (Direction artistique, captures du contrôle 14 h) ; en planche, sur iPad, bande sortant de l'écran quand elle grandit (Front-end). Chaque défaut a reçu une vérification automatique au contrôle 14 h ;
- construction `27faf46` (7 octobre) : aucun défaut.

## 2. Résultats

| Contrôle | Fait par | Résultat | Sortie |
|---|---|---|---|
| 1. Fichier scellé, empreinte, données embarquées, typographie, fidélité aux fiches | programme de contrôle | aucun défaut ; les huit étapes passent ; « Mêmes sources : oui » | `outillage/controle/sorties/controle1-complet-27faf46.txt` |
| 2 à 4. Profils, réponses, absences | programme de contrôle | passés (avec l'annexe A) | même sortie |
| 5. Code de la page | harnais (`controle5.js`) | 48 vérifications justes | `outillage/page/sorties/harnais/rapport-controle5.txt` |
| 5. Partie « relecture du code » | Vérificateur | *en cours* | — |
| 6 à 10. Parties témoins et au hasard | harnais (rejeu) et programme de contrôle | aucun défaut ; 220 traces identiques sur 220 | `outillage/page/sorties/harnais/rapport-rejeu-chromium.txt` ; `outillage/controle/sorties/final-27faf46/comparaison.txt` |
| 11. Textes affichés | harnais (`controle11.js`), phrases attendues du programme de contrôle ; UX | 41 vérifications justes ; relevé relu par UX (voir plus bas) | `outillage/page/sorties/harnais/rapport-controle11.txt`, `chaines-affichees.txt` |
| 12. Export | harnais (`controle12.js`) | 84 vérifications justes | `outillage/page/sorties/harnais/rapport-controle12.txt` |
| 13. Version du porteur | harnais (rejeu) ; comparaison directe par l'orchestrateur | 20 carnets et 10 copies identiques à ceux du programme de contrôle (durées masquées) | voir plus bas |
| 14. Navigateur (Chromium) | harnais (`controle14.js`) | toutes les vérifications justes | `outillage/page/sorties/harnais/rapport-controle14-chromium.txt` |
| 14. Navigateur (WebKit) | tâche GitHub Actions | *à compléter* | journal de la tâche |
| 14 c. Inventaire des sites Pages | tâche GitHub Actions | 7 octobre : kartme seul, accepté par Juridique ; refait juste avant la publication | journal de la tâche |
| 14 g. Preuve de publication | tâche GitHub Actions (`essai-preuve-publication.yml`) | à faire à la publication ; la tâche, essayée le 7 octobre sur la page-test en ligne (commit `b5d7d00`), passe ses trois points : arbre, construction Pages, page et image servies identiques aux objets Git | journal de la tâche |
| 15. Chiffres | — | après l'essai | — |

**Rejeu (contrôles 6 à 10).** Par l'interface, sur les deux versions, dans le contexte de l'icône réglé par l'outil : les trois parties témoins (a) à (c), les sept parties témoins de plus (d) à (j) et dix parties au hasard ; textes affichés identiques écran par écran dans les deux versions, coups gardés égaux aux coups joués, texte copié égal à la zone du carnet (contrôle 14 e). Par le moteur de la version témoin : 200 parties au hasard. Les dix parties témoins sont rejouées aussi sous le fuseau America/New_York : traces et carnets identiques (durées masquées). La partie (j) est jouée avec un navigateur qui refuse la copie (§9, « Rejeu ») ; le contrôle 14 e est sauté pour elle seule. Le programme de contrôle, qui ne lit de la page que les durées, rejoue les 220 journaux et retrouve les 220 traces octet pour octet, valeur des durées masquée.

**Contrôle 11.** UX a relu le relevé de la construction `49ecbdc` (992 chaînes : un défaut, corrigé). Le relevé actuel en diffère de 26 lignes, presque toutes dues à la partie (j) : *relecture par UX en cours*. Remarque d'UX pour le produit : deux-points en série quand un titre en contient.

**Contrôle 13.** Le spec demande les octets du commit de `gh-pages` préparé pour la publication. Ce commit n'est fait qu'après l'accord du porteur ; il ne contiendra, pour `essai/index.html`, que les octets contrôlés ici (`0981…e298`), ce que vérifie le contrôle 14 g (1) au moment de publier. Le rejeu compare le carnet et les copies de la version du porteur à ceux de la version témoin ; l'orchestrateur a comparé en plus, octet pour octet, les 20 carnets et les 10 copies faites en cours de partie par la version du porteur (`outillage/page/sorties/final/page/*-masque.txt`, non versionnés) aux textes du programme de contrôle (`outillage/controle/sorties/final-27faf46/textes/`) : tous identiques.

**Contrôle 14, Chromium.** (a) aucune requête hors de la page et de l'icône, dans chaque contexte ; (b) mémoire : reprise après fermeture et au lendemain, correctif servi à la même adresse, clé de la page-test ignorée, partie illisible (arrêt 1, M1, mémoire inchangée) ; (c) chaque contexte hors de l'icône affiche sa vue et n'écrit rien ; une autre origine ne lit rien ; (d) « Tout effacer » pendant l'essai et après le dévoilement ; (f) requêtes refusées, une image demandée à l'adresse de la page passe comme le veut `img-src 'self'` (que la page n'en crée aucune relève du contrôle 5), script modifié d'un octet : vue de secours ; arrêts du §8.11 (V2, V4, V5, stockage absent, page ouverte deux fois) ; (h) largeur rendue de l'espace fine dans les six faces ; retours (écran tourné, page du cadre, relances) ; 536 écrans de la partie (b) à chaque seuil et à chaque taille d'iPhone et d'iPad de l'outil, en hauteur et en largeur ; (i) les huit cas des durées, dont les deux arrêts brutaux de Chromium. Captures (iPhone 15, clair et sombre, couleur et gris) : aucun écart aux vérifications de mise en page ; jugement de la Direction artistique : *en cours* (iPhone et iPad).

**Page-test v2 (D-019).** Réussie sur l'appareil du porteur : trois ouvertures, mémoire conservée, version 2 à la troisième. Heures et version d'iOS restent dans la conversation (D-017).

## 3. Ce qui n'est pas vérifié

- **Sur l'iPhone.** Zones sûres, clavier, barre d'état, polices du système d'iOS autour du jeu, grain du trait : l'outil ne les reproduit pas (§9, contrôle 14 h). Le WebKit de Playwright n'est pas Safari sur iOS.
- **Arrêt brutal sous WebKit.** Non reproduit par l'outil (contrôle 14 i, « seulement si l'outil le permet ») ; le délai d'écriture du moteur de Safari reste celui que le code de WebKit laisse prévoir, non mesuré (§8.8).
- **Page servie.** L'équipe ne peut pas ouvrir `ppcrepin.github.io` depuis son environnement ; la preuve que la page servie est le fichier contrôlé vient du contrôle 14 g, fait depuis une machine de GitHub.
- **Relecture du code.** Les points du contrôle 5 et du contrôle 14 h que les programmes ne décident pas sont relus par le Vérificateur, qui partage une partie des angles morts de l'équipe (`CLAUDE.md`, « Limites assumées »).
