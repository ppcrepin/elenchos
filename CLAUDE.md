# Elenchos — « Tu crois connaître tes proches »

Nom de code : *elenchos* (ἔλεγχος, l'examen socratique). Jeu quotidien grand public : chaque jour un vrai texte examiné à l'Assemblée nationale, résumé en trois lignes, auteur masqué. Chacun donne son avis, puis devine ce qu'ont répondu ses proches. Révélation commune à 18h.

**Promesse (validée, formule figée) :** *Le jeu ne demande pas ce que tu penses. Il demande qui, dans ton cercle, a pensé ça.*

## Sources de vérité, dans cet ordre

1. `docs/decisions.md` — journal des arbitrages du porteur. Une entrée récente l'emporte sur une entrée ancienne et sur `docs/projet.md`.
2. `docs/projet.md` — document de projet du porteur (état au 3 octobre 2026). Ses sections sont citées « §n ».
3. `docs/produit.md` — le produit, première version (validé) ; `docs/vision.md` — explication validée du jeu ; `docs/onboarding.md` — parcours d'entrée validé (remplace le §7). En cas d'écart, `docs/produit.md` l'emporte sur les deux autres.

Tout agent relit 1 et 2 (et 3 si présent) **avant** de travailler. Toute proposition qui modifie une décision antérieure le dit explicitement, en citant la section ou l'entrée concernée. Aucune contradiction tolérée.

## Règles de travail imposées par le porteur

- **Vision d'abord, détails ensuite.** Ne faire trancher que les choix importants. Ne jamais poser une question de détail sans dire d'où elle vient et dans quoi elle s'insère.
- **Toutes les questions au porteur sont des QCM cliquables** (outil `AskUserQuestion`). Option recommandée en premier, marquée « (Recommandé) », avec une ligne de justification. Jamais de question ouverte en texte libre.
- **Niveau d'exigence extrême, compétence de niveau mondial à tous les niveaux.** Un livrable « sans erreur » ne suffit pas : il doit être ce qu'un expert mondial du domaine signerait. Clarté incluse : un texte exact mais indigeste est un échec.
- **Français clair et pédagogique**, exemples concrets plutôt que principes abstraits. Le produit parle en « tu » ; les échanges avec le porteur en « vous ».
- **Dire franchement** quand un niveau n'est pas atteignable sur un point.
- **Aucun code applicatif** avant l'étape 6 de la méthode (§0) et un accord explicite du porteur. Jusque-là, le dépôt ne contient que de la documentation et l'outillage de travail.

## L'équipe d'agents

Définitions dans `.claude/agents/`. Ce sont les seules définitions valables : pour invoquer un agent via l'outil `Agent`, lui faire lire son fichier en premier (ou en coller le corps verbatim dans le prompt), puis donner le brief. Les agents n'ont pas de mémoire : leur constance vient de ces fichiers et des sources de vérité.

| Agent | Fichier | Rôle | Actif |
|---|---|---|---|
| Cohérence | `coherence.md` | Gardien du document et des décisions | Toujours |
| Game design | `game-design.md` | Mécaniques, boucles, badges, portrait, équilibrage | Toujours |
| UX | `ux.md` | Parcours, écrans, onboarding, textes à l'écran, clarté | Toujours |
| Contenu | `contenu.md` | Chaîne de production des textes (open data AN, agents rédacteurs et vérificateurs) | Dès le prototype manuel |
| Juridique & éthique | `juridique.md` | RGPD (opinions = données sensibles), mineurs, période électorale | À la demande ; bloquant avant lancement |
| Back-end | `backend.md` | Données, API, notifications, rendez-vous de 18h | Construction |
| Front-end | `frontend.md` | Interface mobile / web | Construction |
| Vérificateur | `verificateur.md` | Dernier rempart avant le porteur | Toujours |

## Circuit d'un livrable

Un livrable = tout texte, décision proposée, parcours, écran, règle, ou code destiné au porteur. Les accusés de réception et les questions de clarification d'une ligne n'en sont pas (seuil validé par le porteur).

1. L'orchestrateur (la session principale) cadre le brief : objectif, destinataire, contraintes, sources à relire.
2. Les spécialistes concernés produisent, en parallèle quand c'est possible.
3. **Cohérence** relit contre les décisions.
4. **Vérificateur** fait la passe holistique et rend un verdict (OK / OK avec corrections / À reprendre). Il tourne sur un **modèle différent** de celui de la session principale (paramètre `model` de l'outil `Agent`).
5. L'orchestrateur applique les corrections. Si le verdict était « À reprendre », retour à l'étape 2.
6. Le livrable part au porteur avec le verdict en une ligne et la liste des corrections notables.

Rien n'atteint le porteur sans l'étape 4. Un livrable rejeté par le porteur repasse par le circuit complet, jamais par une simple retouche de l'orchestrateur.

## Règles pratiques apprises

- **L'ordre d'abord (D-009).** On suit `docs/feuille-de-route.md` étape par étape. Aucune question de fabrication (technique, test, contenu, juridique) tant que le produit n'est pas défini et dessiné. Pas de questions de détail en cours de route : un livrable complet, puis les rares questions de fond, regroupées à la fin.
- **Tenir le porteur au courant** : au début de chaque étape, dire en deux lignes ce qu'on fait et ce qu'il recevra ; ensuite, ne lui écrire que pour livrer.

- Les agents parallèles partagent le même scratchpad : tout fichier de travail d'un agent est préfixé par son nom (`ux-…`, `game-design-…`).
- Aucune question technique au porteur avant l'étape 6, même pour un test jetable : il l'a demandé explicitement (D-005).
- Une synthèse de plusieurs avis nomme les désaccords et attribue chaque position ; « les cinq s'accordent » ne s'écrit que si c'est vrai mot pour mot.

## Après chaque arbitrage du porteur

L'orchestrateur ajoute une entrée datée dans `docs/decisions.md` (format décrit en tête du fichier), puis commit. C'est ce qui rend les agents constants d'une session à l'autre.

## Limites assumées

- Le vérificateur partage une partie des angles morts de la session principale. Un modèle différent donne un second regard, pas un regard indépendant (même limite que §8 pour le contenu).
- La vérification allonge chaque livrable de quelques minutes. C'est le prix accepté.
