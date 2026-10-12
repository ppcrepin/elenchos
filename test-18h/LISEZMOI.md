# test-18h : le code du test du message de 18h (pour les agents)

Spécification : `docs/etape-6/test-18h.md` (D-054). Pas-à-pas du porteur : `docs/etape-6/test-18h-pas-a-pas.md`.
Chaque fichier dit en tête s'il est **JETABLE** (supprimé après le test) ou **REPRIS** pour le vrai jeu (proposé, partie 6 du document).

## Ce que fait le programme

Un seul processus Node (`Procfile` : `web: node src/principal.ts`) :
- **la page** (`public/`, mots relus par UX le 12 octobre 2026) : installable sur l'écran d'accueil d'un iPhone ; dit seulement si elle est ouverte depuis l'icône, si les messages sont autorisés, et si l'on est connecté (Apple ou Google, jamais l'adresse). Boutons dans l'ordre des gestes : Google, Recevoir, Apple ; **Apple n'est montré que sur T1, et le serveur refuse la connexion Apple ailleurs** (cookie `__Host-telephone` posé à l'abonnement) ;
- **l'abonnement**, seulement avec l'un des cinq codes d'essai (T1 à T5), cinq abonnements au plus, **vers le seul service d'Apple** (P-12 après D-054), avec des clés vérifiées par un chiffrement à blanc ;
- **la connexion** Google et Apple (code d'autorisation, `state`, `nonce`, PKCE chez Google, `form_post` chez les deux), qui ne garde que l'empreinte de l'identifiant et « adresse reçue : oui ou non » ;
- **l'horloge de 18h** (`src/planificateur.ts`) : « Test, soir n sur 3 » à 18h00, heure de Paris ; au soir 3, la seconde forme d'iOS 18.4 à 18h10 sur T1 ; urgence haute, 30 minutes de vie ; verrou en base contre le double envoi ;
- **la mesure** : heure d'envoi, réponse du service d'Apple, heure de réception notée par le serveur quand le téléphone l'avertit ;
- **la page de résultats** (`/resultats`, code d'accès du porteur), le message d'essai immédiat, l'effacement d'une ligne, « Tout effacer » ;
- **la page de préparation** (`/preparer`) : fabrique dans le navigateur du porteur ses codes et la clé des messages, et met sa clé Apple sur une ligne. Rien n'en sort.

## Fichiers

| Fichier | Rôle | Après le test |
|---|---|---|
| `src/horloge.ts`, `src/garde-horaires.ts`, `outils/garde-horaires.ts` | heure de Paris ; garde des horaires de mise en ligne | repris |
| `src/push/chiffrement.ts`, `src/push/envoyeur.ts`, `src/push/services.ts`, `src/crypto.ts` | chiffrement, signature et envoi des messages ; liste fermée des services (Apple seul) | repris |
| `src/planificateur.ts` | l'envoi de 18h et son verrou | repris (les textes « Test… » sont jetables) |
| `src/mesure.ts`, `public/sw.js` | la mesure « message reçu » ; la réception dans le téléphone | repris |
| `src/connexion.ts` | Google et Apple | repris |
| `src/journal.ts`, `outils/controle.ts` | journal sobre ; contrôle du code | repris |
| `src/config.ts`, `src/base.ts`, `src/depot.ts`, `src/pages.ts`, `src/serveur.ts`, `src/principal.ts`, `outils/effacer.ts` | réglages, base et carte du test, pages, serveur | jetables (principes repris : carte comparée à la base, effacement vérifié, en-têtes) |
| `public/` (sauf `sw.js`) : page, `/preparer`, résultats, manifeste, icônes copiées de `docs/identite/logo/png/` | ce que voient les téléphones et le porteur | jetables |
| `tests/` | `sans-base/` (aussi lancés à la fabrication chez Scalingo), `avec-base/`, `navigateur/` (vrai Chromium), `journal-base/` (journal de PostgreSQL, en local) ; chaque fichier dit ce qui est repris | voir chaque fichier |
| `../.github/workflows/test-18h.yml` | vérification sur GitHub, que Scalingo attend | reprise |
| `Procfile`, `package.json`, `package-lock.json`, `tsconfig*.json` | ce que Scalingo et le contrôle attendent | repris dans leur principe |

## Réglages (variables d'environnement, saisies par le porteur chez Scalingo ; jamais dans le dépôt)

| Variable | Rôle | Qui la fournit |
|---|---|---|
| `PROJECT_DIR` | `test-18h` : Scalingo installe ce dossier du dépôt | le porteur (valeur publique) |
| `SOIRS` | calendrier des envois, ex. `2026-10-16=0@1;2026-10-17=0;2026-10-18=1;2026-10-19=2;2026-10-20=3`. `n` : 0 = répétition, 1 à 3 = soirs du test, 4 et plus = soir ajouté ; `@1+3` : seulement ces téléphones. Un changement redémarre l'application : c'est une mise en ligne au sens de D-043, **jamais de 15h à 19h ni le dimanche** | le porteur (valeur publique) |
| `SECRET_SESSION` | 32 octets au hasard : chiffre les cookies, fait l'empreinte des identifiants | `/preparer` |
| `CODES_ESSAI` | les cinq codes d'essai, séparés par `;`, dans l'ordre T1…T5 | `/preparer` |
| `CODE_ACCES_PORTEUR` | le code d'accès à la page de résultats | `/preparer` |
| `VAPID_CLE_PUBLIQUE`, `VAPID_CLE_PRIVEE` | la clé qui signe nos envois vers Apple (RFC 8292) | `/preparer` |
| `GOOGLE_ID_CLIENT`, `GOOGLE_SECRET_CLIENT` | l'identifiant « application Web » de la console Google | console Google |
| `APPLE_ID_SERVICE` | l'identifiant de service (Services ID) | compte développeur Apple |
| `APPLE_ID_EQUIPE`, `APPLE_ID_CLE` | numéro d'équipe et numéro de la clé (10 caractères chacun) | compte développeur Apple |
| `APPLE_CLE_PRIVEE` | le fichier .p8, mis sur une ligne par `/preparer` (base64), ou collé tel quel | compte développeur Apple |
| `ADRESSE_PUBLIQUE` | facultatif : sinon `https://$APP.$REGION_NAME.scalingo.io` | — |
| `SCALINGO_POSTGRESQL_URL` | la base ; ajoutée par Scalingo avec la base | Scalingo |
| `PORT`, `CONTAINER`, `APP`, `REGION_NAME`, `SOURCE_VERSION` | posées par Scalingo | Scalingo |
| `IGNORER_HORAIRES=oui` | **en local seulement** : lève la garde des horaires ; refusée chez Scalingo et sur GitHub | l'agent, sur sa machine |
| `BASE_DE_TEST_URL` | **tests seulement** : un PostgreSQL jetable | l'agent, sur sa machine ; GitHub |
| `NAVIGATEUR_CHEMIN` | **tests seulement** : le Chromium (ou Chrome) du test navigateur ; par défaut celui de l'environnement des agents | l'agent ; GitHub (`/usr/bin/google-chrome`) |
| `JOURNAL_BASE_DE_TEST` | **tests seulement** : le fichier journal du PostgreSQL local, lu par le test de la condition 6 | l'agent, sur sa machine |

Un réglage absent ne fait pas tomber la page : la fonction qui en dépend est coupée et son **nom** (jamais sa valeur) est signalé au journal et sur la page de résultats. Sans base, le programme refuse de démarrer.

## La carte des données (P-43) — rien d'autre n'existe

| Table | Colonnes |
|---|---|
| `telephone` | `numero` (1 à 5), `systeme` (« iOS 18.5 », noté par le porteur). Le service d'acheminement est toujours Apple : il n'est pas gardé |
| `abonnement` | `telephone`, `adresse` (adresse technique du service d'acheminement), `cle_p256dh`, `cle_auth` |
| `envoi` | `id` (tiré au hasard), `telephone`, `nature` (soir, essai), `soir_date`, `soir`, `forme` (classique, declarative), `envoye_a`, `repondu_a`, `reponse_code`, `reponse_motif`, `recu_a` |
| `compte` | `numero`, `fournisseur` (apple, google), `empreinte` (HMAC de l'identifiant), `email_recu` (oui ou non) |

Jamais : nom, adresse e-mail, adresse internet, heure d'ouverture de l'icône, heure du téléphone. Un test compare la base réelle à cette carte. Les cookies (session, transaction de connexion, accès du porteur, numéro du téléphone) sont chiffrés et authentifiés (AES-256-GCM), préfixés `__Host-` (aucun autre site en `scalingo.io` ne peut y toucher). Aucune contrainte d'unicité sur l'adresse d'abonnement : le doublon se contrôle sur le numéro du téléphone, et toutes les écritures sont des « ON CONFLICT » ; le programme refuse les valeurs fausses avant la base. Aucune erreur de la base ne recopie donc une valeur des prêteurs dans son journal, gardé un an chez Scalingo (condition 6 de Juridique, prouvée par `tests/journal-base/`).

## Journaux (P-07)

Une ligne JSON par événement, avec des champs d'une liste fermée (`src/journal.ts`) : événement, route en modèle, statut, durée, numéro de requête tiré au hasard, type d'erreur (jamais son message). Aucune adresse internet, aucun abonnement, aucun identifiant, aucun numéro de téléphone (Scalingo date chaque ligne : un numéro ferait un couple « téléphone + heure », gardé un an). Le programme ne lit jamais la partie « ? » d'une adresse (P-08).

## Sécurité des demandes

- `Referrer-Policy: same-origin` : avec `no-referrer`, un navigateur envoie `Origin: null` sur les formulaires, et le serveur refusait l'entrée du porteur et la déconnexion (constat de la revue, reproduit par le test navigateur avant correction).
- Toute demande qui modifie quelque chose doit porter l'origine de la page, ou à défaut `Sec-Fetch-Site: same-origin`.
- Une erreur sur une navigation répond par une page lisible ; sur un appel de la page, en JSON.
- **Limiteur assumé pour un test non référencé** : il est commun à tous (aucune adresse internet gardée, P-07). Un inconnu qui trouverait l'adresse pourrait bloquer un quart d'heure les codes d'essai (20 échecs) ou l'entrée du porteur (10 échecs), à répétition ; `/api/recu` n'est pas limité (une mise à jour par numéro tiré au hasard). Pour le vrai jeu : un limiteur par session ou par empreinte.

## Dépendances (versions exactes, `package-lock.json`)

| Paquet | Pourquoi | Autres paquets qu'il amène |
|---|---|---|
| `pg` 8.23.0 | le client PostgreSQL de référence pour Node (depuis 2010, entretenu) | 13 petits paquets, la plupart du même auteur ; trois figés plus anciens par `overrides` |
| `oauth4webapi` 3.8.8 | la connexion OpenID Connect, certifiée OpenID, sans aucune dépendance ; on n'écrit pas soi-même la vérification des jetons | aucun |
| `typescript` 6.0.3, `@types/node` 22.20.4, `@types/pg` 8.23.1 | vérification des types seulement (fabrication et contrôle) ; jamais chargés en marche | `undici-types` |
| `playwright-core` 1.56.1 | piloter un vrai navigateur dans les tests ; ne télécharge aucun navigateur, utilise celui qu'on lui donne ; même version que le Chromium de l'environnement des agents | aucun |

Pas de cadre web (le module `http` de Node suffit pour une dizaine de routes). Pas de bibliothèque d'envoi de messages : le chiffrement (RFC 8291) et la signature (RFC 8292) tiennent en 150 lignes sur `node:crypto`, et l'exemple chiffré de la RFC 8291 est rejoué octet pour octet par les tests. Toutes les versions, dépendances indirectes comprises, ont été publiées plus de deux semaines avant le 12 octobre 2026. `npm audit` : aucune faille connue ce jour-là.

Node 22.22.0 (figé dans `engines`) lit le TypeScript directement (types effacés, sans fabrication) : `erasableSyntaxOnly` l'impose.

## Vérifier sur sa machine

```sh
cd test-18h
npm ci
# un PostgreSQL jetable ; ici, celui de l'environnement des agents :
#   su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D <dossier> -o '-p 54329 -c listen_addresses=127.0.0.1' start"
export BASE_DE_TEST_URL=postgresql://postgres@127.0.0.1:54329/postgres
IGNORER_HORAIRES=oui npm test      # 15h-19h et dimanche : la garde échoue sans cette variable, c'est voulu
JOURNAL_BASE_DE_TEST=<dossier>/log npm run test:journal-base   # condition 6 : lit le journal du PostgreSQL local
npm run controle                    # types, secrets (fichiers et historique), journaux, adresses, noms de modèles
```

- `tests/avec-base/` et `tests/navigateur/` exigent un vrai PostgreSQL ; `tests/navigateur/` exige aussi un navigateur (`NAVIGATEUR_CHEMIN`, par défaut `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, présent dans l'environnement des agents ; jamais de `playwright install`). Sans eux, ils échouent : ils ne sont jamais sautés.
- Le test navigateur soumet les vrais formulaires (`/resultats/entree`, `/resultats/sortie`, `/deconnexion`) dans Chromium. Remis sous l'ancien en-tête `no-referrer`, il échoue (vérifié le 12 octobre 2026).
- `test:journal-base` ne tourne qu'en local, à lancer avant chaque mise en ligne : il provoque, sur la base locale, les erreurs que le programme pourrait causer, lit le journal de PostgreSQL, et contrôle qu'aucune valeur des prêteurs n'y est recopiée ; un témoin vérifie qu'il sait la voir. Il vaut pour les réglages de journal par défaut de PostgreSQL ; ceux de la base de Scalingo ne sont pas connus.

## Mise en ligne chez Scalingo

- Scalingo installe depuis la branche `mise-en-ligne` (D-054), avec `PROJECT_DIR=test-18h` (seul ce dossier est installé).
- Il détecte Node par `package.json`, prend la version de `engines.node`, installe par `npm ci` (car `package-lock.json`), lance le script `build`, puis démarre le `Procfile`.
- **`build` lance la garde des horaires et les tests sans base** : de 15h à 19h et le dimanche, la fabrication échoue, rien ne s'installe.
- **Vérification sur GitHub** : `.github/workflows/test-18h.yml`, sur la branche `mise-en-ligne` seulement ; Scalingo attend qu'elle passe avant d'installer. Elle lance le contrôle et les tests sans base, avec base (PostgreSQL 16 jetable) et navigateur (Google Chrome de l'image ubuntu-24.04, à vérifier au premier passage). Actions figées par empreinte de commit : `actions/checkout` v7.0.1 (17 juillet 2026), `actions/setup-node` v7.0.0 (13 juillet 2026).
- **Rien ne s'installe depuis `main`** (D-054, point 1) : Scalingo n'est lié qu'à `mise-en-ligne`.
- Région : `osc-fr1` (Paris, Outscale), choisie à la création de l'application. Adresse : `https://<nom>.osc-fr1.scalingo.io`.

## Ce qui n'a pas pu être essayé ici

- Un vrai envoi vers Apple (`web.push.apple.com`) et une vraie réception sur iPhone : seulement contre un faux service, avec le chiffrement vérifié par l'exemple de la RFC.
- Une vraie connexion Google ou Apple : seulement contre de faux serveurs. Les adresses d'Apple sont recopiées de sa documentation (son document de découverte n'est pas joignable d'ici).
- La page dans un vrai Safari d'iPhone, depuis l'icône ; la seconde forme d'iOS 18.4 (le nom de l'attribut qui porte la notification proposée est lu des deux façons possibles, `notification` et `proposedNotification`).
- L'installation chez Scalingo (la documentation est lue dans son dépôt public, au 9 octobre 2026).
