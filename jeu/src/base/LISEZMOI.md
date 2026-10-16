# La base du jeu : le socle (étape 1, travail C)

*Back-end, 16 octobre 2026. Pour les agents et pour qui reprendra le code (D-043). Rien ici ne décide pour le porteur.*

## Ce qu'il y a ici

| Fichier | Rôle |
|---|---|
| `migrations/0001-tables.sql` | les tables du jeu entier, et rien d'autre |
| `migrations/0002-cloisonnement.sql` | les règles de cloisonnement par ligne (P-25), l'heure du jeu (`instant_du_jeu`, `fin_du_jour_de_jeu`), « rien avant 18h » pour les réponses du jour, le lien lié lisible 7 jours, ce que fait un départ (règle 4 ; D-066, point 1 ; Juridique), et les refus gardés par la base (P-34, dix membres, trois cercles, pseudo et rond uniques, joueur provisoire hors des cercles) |
| `migrations/0003-totaux.sql` | les totaux écrits sans être lus, le refus des mesures, les joueurs distincts, et les vues à seuil des mesures (P-22, P-23 ; D-066, points 3 et 4 ; les compteurs sans personne au-dessus d'un seuil d'apports : 10, 30 ou 70) |
| `migrations/0004-planificateur.sql` | la tâche du jour : le ménage une fois par jour, jamais deux fois en même temps (étape 1, travail D) |
| `migrations/0005-temoin-des-cles.sql` | le témoin des clés : une empreinte à sens unique de `CLE_REPONSES` et une de `CLE_IDENTITES`, rangées au premier démarrage normal, lues par le seul propriétaire |
| `carte.ts` | la carte des données : chaque table, chaque colonne, son usage et sa forme (P-04) |
| `connexion.ts` | les connexions par module, le chiffrement de la connexion, la déclaration du joueur |
| `roles.ts` | les cinq rôles et la liste exacte de leurs droits (`DROITS`) |
| `migrations.ts`, `installation.ts` | jouer les migrations, puis préparer les rôles |
| `temoin.ts` | le témoin des clés : le ranger la première fois, puis le comparer à chaque démarrage ; une clé changée fait refuser le démarrage (`principal.ts`) |
| `effacement.ts` | « Tout effacer », puis vérifier qu'il ne reste rien |
| `menage.ts` | le ménage quotidien : chaque durée de la carte tenue (P-31) ; `menageDuJour`, appelé chaque jour à 4h par le planificateur (`src/serveur/planificateur.ts`) |
| `totaux.ts` | le seul chemin du serveur vers les totaux, avec le réglage du test (D-066, point 2) |

Les briques reprises de `test-18h/` sont dans `src/serveur/` (horloge, garde des horaires, chiffrement, journal, réglages), chacune avec son origine en tête. L'heure de Paris a une seule source, le moteur (`src/regles/heure.ts`) : l'horloge du serveur l'appelle, et la base suit la même convention (un test compare chaque 18h de 2026 à 2028).

## Le cloisonnement, en bref

Chaque demande ouvre une transaction et déclare d'abord qui la fait, et quand (`enTransaction(pool, { joueur, instant }, …)`, qui pose `SET LOCAL elenchos.joueur` et `elenchos.instant`). Chaque table porte des règles qui ne montrent une ligne qu'au module qui en a l'usage et, pour le jeu, qu'aux membres du cercle de cette ligne. **Une requête qui oublie son filtre ne reçoit rien d'un autre cercle ; une requête sans déclaration ne reçoit rien du tout.** Les règles sont imposées au propriétaire lui-même (`FORCE ROW LEVEL SECURITY`) : sans module déclaré, il ne voit aucune donnée de joueur.

**Ce que la base ne cloisonne pas, dit franchement.** Elle cloisonne par cercle, pas par membre. Sous le module du jeu, un joueur déclaré lit tout ce que son cercle peut voir : les réponses de ses proches (sauf celles au texte du jour, voir plus bas), et les manches, cartes et verdicts des autres devineurs de son cercle. Ce que le téléphone en reçoit (la liste fermée de P-27, « rien avant 18h » de P-26 pour tout le reste) est tenu par le serveur, et par les tests de l'étape 2.

**Rien avant 18h, pour les réponses du jour, est tenu aussi par la base.** Un proche ne lit la réponse d'un autre au texte du jour qu'après la fermeture de ce texte, à 18h, heure de la transaction (`instant_du_jeu` : l'heure déclarée par le serveur, sinon celle de la base). Ses réponses d'entrée restent lisibles. « Déjà joué » passe par `cloison_ont_repondu(texte)`, qui ne rend que des identifiants de membres. Ce que la base tient, c'est la fermeture du texte (18h le jour d), pas la révélation (18h le jour d + 1) : pendant le jour où l'on devine, le serveur lit les réponses des proches pour tirer les cartes, et c'est lui seul qui garantit que le téléphone ne reçoit rien de la révélation avant 18h (P-26). Comme le module déclaré, l'heure déclarée protège contre l'oubli d'un filtre, pas contre un code fautif qui déclarerait une heure fausse. La base n'a qu'une horloge : l'accord d'une réponse (P-34), « rien avant 18h », les départs, les liens et les totaux jugent tous avec `instant_du_jeu`.

**Le lien d'invitation, borné.** Un invité lit, par le lien lié à lui, le nom du cercle, le visage de l'invitant et ses trois réponses d'entrée : 7 jours au plus après la liaison, le temps du défi et du compte (un joueur provisoire est effacé au même terme). À son départ du cercle, ou à son effacement, le lien ne le désigne plus. Il ne lit alors plus que ce que ses cercles lui montrent (Juridique, P-25).

**Ce que fait un départ, dans la base elle-même** (déclencheur `membre_avant_depart`, dans la transaction de « Quitter » ou de « Tout effacer ») :
- avant 18h, les cartes où le partant était désigné redeviennent vides, sans « pourquoi » ni verdict, marquées « vidées par un départ » (règle 4, J10) ;
- après 18h, la manche est jouée : seul le visage se vide (« un ancien membre ») et le verdict reste figé avec son point, sauf qu'un « jumeau » devient « juste » (D-067 : un « jumeau » sous un visage vide dirait qu'un ancien membre pensait comme l'auteur ; la règle 11 les compte pareil). Que la révélation ne montre plus le pari de cette carte (D-067) est l'affaire du serveur, à l'étape 2 ;
- ses badges Le Pas de Côté de ce cercle s'effacent (D-066, point 1) ; ses autres titres restent sous « un ancien membre » ;
- ce qu'il avait « déjà vu » dans ce cercle s'efface ; le lien qui l'y avait fait entrer ne le désigne plus et perd son score.

**Les totaux** (migration 0003, `totaux.ts`). Un joueur qui a refusé qu'on compte ses gestes (`mesures_refusees`, D-066, point 3) n'entre dans aucun total : chaque fonction regarde le joueur déclaré. Le seuil d'un total des mesures compte des joueurs distincts (D-066, point 4) : un joueur qui apporte trente fois compte pour un, grâce à un verrou (`apport_mesure`) qui part avec sa période. Pendant le test, ni la part de « aucune » ni les trois comptes de mi-bêta ne sont écrits : c'est un réglage du serveur, `COMPTES_DE_REGLAGE` dans `totaux.ts`, figé à faux (D-066, point 2).

## Les deux modes (`MODE_ROLES`)

| | `roles` (par défaut) | `repli` |
|---|---|---|
| Comment | Cinq rôles sans mot de passe (`elenchos_jeu`, `_comptes`, `_envoi`, `_menage`, `_mesures`). Chaque connexion s'ouvre au nom du propriétaire et prend le rôle de son module dès l'ouverture (`-c role=…`). | Toutes les connexions restent celles du propriétaire. Le module est un paramètre posé à l'ouverture (`-c elenchos.module=…`). |
| Ce qui tient | Le cloisonnement des cercles (P-25). Les droits de chaque rôle, table par table et colonne par colonne : le jeu ne peut pas lire les identités (P-01), les mesures ne lisent que des vues (P-22, P-23), une réponse ne se change ni ne s'efface par le jeu. | Le cloisonnement des cercles (P-25) **et** la séparation des modules (P-01, P-22, P-23), par les mêmes règles par ligne, qui regardent le module déclaré. C'est mieux que ce qu'annonçait `DECISIONS-TECHNIQUES.md` (1.6). |
| Ce qui est perdu | Rien du cloisonnement. Limite : une requête SQL écrite exprès pourrait reprendre le rôle du propriétaire (`SET ROLE`) ; toutes nos requêtes ont des paramètres, jamais de texte venu d'un téléphone. Des rôles de connexion séparés, chacun son mot de passe, fermeraient cette porte : pour la deuxième version. | Les droits par colonne (le jeu pourrait, par erreur, écrire une colonne que la règle de sa ligne lui laisse). Et un code qui changerait lui-même son paramètre de module prendrait les droits d'un autre : **la protection vaut contre l'oubli, pas contre un code fautif.** |
| Garde | — | Si le propriétaire échappe aux règles (superutilisateur ou `BYPASSRLS`), le repli ne protégerait plus rien : l'installation refuse (`RepliSansCloison`). |

Les deux modes passent les mêmes tests de cloisonnement et d'effacement (`tests/socle/`).

## Ce qui reste à vérifier chez Scalingo

À faire à l'ouverture de l'hébergeur, sur une base vide, sans aucune donnée de joueur (D-048 : aucun agent ne touche la base réelle ; c'est le porteur qui lance, avec un pas-à-pas) :

1. **Le propriétaire peut-il créer des rôles (`CREATEROLE`) ?** Le premier démarrage en mode `roles` le dit : `roles prets` au journal, ou une erreur `42501`. Dans ce cas, `MODE_ROLES=repli`, et on le dit au porteur (DECISIONS-TECHNIQUES 1.6).
2. **Le propriétaire n'est ni superutilisateur, ni `BYPASSRLS`** : indispensable au repli, vérifié au démarrage.
3. **La connexion est directe**, sans PgBouncer en mode transaction : un tel intermédiaire ignore ou refuse les paramètres de démarrage (`-c role=…`). Sinon, il faudrait poser le rôle dans chaque transaction (`SET LOCAL ROLE`), une modification de `connexion.ts`.
4. **La version de PostgreSQL.** Les tests tournent sur la 16. Avant la 16, le propriétaire hérite des droits des rôles (sans effet : il a déjà tout) ; le reste est identique.
5. **Les réglages du journal de la base** (`log_parameter_max_length_on_error`, `log_statement`) : nos refus n'y écrivent qu'un message fixe et la requête avec ses `$1`, jamais ses valeurs, avec les réglages par défaut de PostgreSQL. Ceux de Scalingo ne sont pas connus.

## Les migrations

Des fichiers SQL numérotés, joués au démarrage par le propriétaire seul, dans une transaction, sous un verrou. Une migration jouée ne se modifie plus : le démarrage échoue si son empreinte a changé. **Tant qu'aucune base réelle n'existe, 0001 à 0005 peuvent encore être réécrites** (0001 à 0003 l'ont été le 16 octobre 2026, après les relectures de l'étape 1 ; 0003 encore le même jour, dans un commentaire seulement) ; dès la première mise en ligne, toute correction passe par une migration nouvelle.

## Lancer les tests

```sh
cd jeu
# un PostgreSQL jetable (ici, celui de l'environnement des agents) :
#   su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /tmp/elenchos-pg/data -l /tmp/elenchos-pg/demarrage.log -o '-p 54329 -c listen_addresses=127.0.0.1' -w start"
export BASE_DE_TEST_URL='postgresql://postgres@127.0.0.1:54329/postgres?sslmode=disable'
IGNORER_HORAIRES=oui npm run test:socle   # de 15h à 19h et le dimanche, la garde échoue sans cette variable : c'est voulu
npm run controle
```

Les tests du moteur de règles : `node --test "tests/regles/*.test.ts"` (sans base).

Chaque fichier de test crée son schéma, dont le propriétaire est un rôle sans privilège (`elenchos_test_proprietaire`), comme on suppose celui de Scalingo : un superutilisateur échapperait aux règles, et le test ne prouverait rien. Les tests avec base ne sont jamais sautés : sans `BASE_DE_TEST_URL`, ils échouent.

## Ce que le socle ne fait pas encore

- la connexion Google, l'import des textes, les routes du jeu (étape 2). Le serveur HTTP, la connexion Apple, l'envoi vers Apple et le planificateur existent depuis l'étape 1, travail D (`src/serveur/`) ;
- dans « Tout effacer » et « Quitter », le retrait d'une carte pas encore révélée des compteurs de la semaine (règle 4) : c'est le moteur de la journée. Les cartes où le partant était désigné, elles, sont déjà vidées par la base (déclencheur `membre_avant_depart`). Avec le verdict écrit au geste, un départ après 18h ne change que « jumeau » en « juste » (D-067) ; ce qui reste à l'étape 2 : une manche non validée reçoit « passe » sur ses cartes vides à la première lecture après 18h ;
- la route qui pose ou retire le refus des mesures (la table existe, `mesures_refusees`) : ses mots, avec UX, à l'étape 2 (`CONTRAT.md`, partie 9) ;
- le cercle de démonstration et le lien de relecture (CONTRAT.md, 2.16), et les vues du rapport des totaux tirées des tables de joueurs (retour à 7 jours, etc.) : chacun viendra par une migration, avec l'étape qui le construit. L'avis du cercle, lui, n'aura jamais de table : il se calcule à la lecture (CONTRAT.md, partie 3) ;
- l'extension du test du journal de PostgreSQL (`test-18h/tests/journal-base/`) aux écritures du jeu, quand elles existeront.

## Ce que « Tout effacer » n'atteint pas encore

Le test d'effacement prouve la base : après « Tout effacer », une lecture brute de toutes les tables ne contient plus rien du joueur (traceur), score du défi d'entrée compris. Il ne prouve pas encore :
- **la révocation chez Apple** (CONTRAT.md, 2.12) : écrite dans le contrat, pas encore codée (étape 2) ;
- **le rejeu du journal des effacements après une restauration** (P-32) : la table existe, le programme de restauration et son test non. La procédure, elle, est fixée (ci-dessous) ;
- **les journaux de Scalingo** (P-07) : gardés un an chez l'hébergeur, hors d'atteinte de « Tout effacer ». Ils ne doivent rien contenir de personnel : c'est ce que tiennent le journal à listes fermées (`src/serveur/journal.ts`) et les refus « EL… » à message fixe ;
- **les sauvegardes de la base** : elles gardent le joueur jusqu'à leur rotation ; le journal des effacements sert à le réeffacer après une restauration (P-32).

## Restaurer une sauvegarde : lire le journal des effacements d'abord

Une restauration remplace toute la base par une copie plus ancienne, **journal des effacements compris** : les effacements faits depuis la copie (« Tout effacer », joueurs provisoires effacés par le ménage) seraient perdus deux fois, dans les données et dans le journal (Juridique, correction 11 ; P-32). L'ordre est donc imposé :

1. **Avant de restaurer**, lire le journal de la base actuelle (`SELECT joueur_id, efface_le FROM effacement`, sous le rôle propriétaire : seule règle qui le montre) et le garder hors de la base, le temps de l'opération.
2. Restaurer la copie.
3. **Rejouer** : pour chaque identifiant lu en 1, effacer le joueur comme « Tout effacer » (`effacerJoueurs`, `effacement.ts`), et remettre sa ligne au journal.
4. Vérifier qu'il ne reste rien de chacun (`restesDuJoueur`), puis effacer la liste gardée en 1.

L'outil qui fait ces quatre gestes, et son test (« un joueur effacé après la copie reste effacé après la restauration »), viendront avec le pas-à-pas de restauration (P-32). À la fin du test, la base est supprimée, non vidée, et sans sauvegarde manuelle (P-32).
