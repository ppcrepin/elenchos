# La base du jeu : le socle (étape 1, travail C)

*Back-end, 16 octobre 2026. Pour les agents et pour qui reprendra le code (D-043). Rien ici ne décide pour le porteur.*

## Ce qu'il y a ici

| Fichier | Rôle |
|---|---|
| `migrations/0001-tables.sql` | les tables du jeu entier, et rien d'autre |
| `migrations/0002-cloisonnement.sql` | les règles de cloisonnement par ligne (P-25) et les refus gardés par la base (P-34, dix membres, trois cercles, pseudo et rond uniques, joueur provisoire hors des cercles) |
| `migrations/0003-totaux.sql` | les totaux écrits sans être lus, et les vues à seuil des mesures (P-22, P-23) |
| `carte.ts` | la carte des données : chaque table, chaque colonne, son usage et sa forme (P-04) |
| `connexion.ts` | les connexions par module, le chiffrement de la connexion, la déclaration du joueur |
| `roles.ts` | les cinq rôles et la liste exacte de leurs droits (`DROITS`) |
| `migrations.ts`, `installation.ts` | jouer les migrations, puis préparer les rôles |
| `effacement.ts` | « Tout effacer », puis vérifier qu'il ne reste rien |

Les briques reprises de `test-18h/` sont dans `src/serveur/` (horloge, garde des horaires, chiffrement, journal, réglages), chacune avec son origine en tête.

## Le cloisonnement, en bref

Chaque demande ouvre une transaction et déclare d'abord qui la fait (`enTransaction(pool, { joueur }, …)`, qui pose `SET LOCAL elenchos.joueur`). Chaque table porte des règles qui ne montrent une ligne qu'au module qui en a l'usage et, pour le jeu, qu'aux membres du cercle de cette ligne. **Une requête qui oublie son filtre ne reçoit rien d'un autre cercle ; une requête sans déclaration ne reçoit rien du tout.** Les règles sont imposées au propriétaire lui-même (`FORCE ROW LEVEL SECURITY`) : sans module déclaré, il ne voit aucune donnée de joueur.

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

Des fichiers SQL numérotés, joués au démarrage par le propriétaire seul, dans une transaction, sous un verrou. Une migration jouée ne se modifie plus : le démarrage échoue si son empreinte a changé. **Tant qu'aucune base réelle n'existe, 0001 à 0003 peuvent encore être réécrites** ; dès la première mise en ligne, toute correction passe par une migration nouvelle.

## Lancer les tests

```sh
cd jeu
# un PostgreSQL jetable (ici, celui de l'environnement des agents) :
#   su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /tmp/elenchos-pg/data -l /tmp/elenchos-pg/demarrage.log -o '-p 54329 -c listen_addresses=127.0.0.1' -w start"
export BASE_DE_TEST_URL='postgresql://postgres@127.0.0.1:54329/postgres?sslmode=disable'
IGNORER_HORAIRES=oui npm run test:socle   # de 15h à 19h et le dimanche, la garde échoue sans cette variable : c'est voulu
npm run controle
```

Chaque fichier de test crée son schéma, dont le propriétaire est un rôle sans privilège (`elenchos_test_proprietaire`), comme on suppose celui de Scalingo : un superutilisateur échapperait aux règles, et le test ne prouverait rien. Les tests avec base ne sont jamais sautés : sans `BASE_DE_TEST_URL`, ils échouent.

## Ce que le socle ne fait pas encore

- le serveur HTTP, la connexion Apple et Google, l'envoi vers Apple, le planificateur de 18h, l'import des textes ;
- le ménage quotidien des échéances (joueurs provisoires à 7 jours, sessions, codes, liens, scores d'entrée) : le rôle et ses droits existent, pas encore le programme ;
- dans « Tout effacer » et « Quitter », le retrait d'une carte pas encore révélée des compteurs de la semaine (règle 4) : c'est le moteur de la journée ;
- l'avis du cercle préparé la veille, le cercle de démonstration et le lien de relecture (CONTRAT.md, 2.16), et les vues du rapport des totaux tirées des tables de joueurs (retour à 7 jours, etc.) : chacun viendra par une migration, avec l'étape qui le construit ;
- l'extension du test du journal de PostgreSQL (`test-18h/tests/journal-base/`) aux écritures du jeu, quand elles existeront.
