-- Migration 0001 : les tables du jeu entier (D-062), et rien d'autre.
-- Chaque colonne figure sur la carte des données (jeu/src/base/carte.ts), avec son usage (P-04) ; un test compare la
-- base réelle à cette carte. Jamais : nom, prénom, photo, date de naissance, adresse e-mail (même chiffrée : seule son
-- empreinte reste, DECISIONS-TECHNIQUES 1.7), adresse internet, navigateur, heure du téléphone, jetons d'Apple ou de
-- Google.
--
-- Trois règles d'écriture, reprises du test de 18h (P-07 : Scalingo garde un an le journal de la base, et une
-- contrainte qui échoue y recopie la ligne fautive) :
-- 1. le programme vérifie chaque valeur avant la base ; les contraintes ci-dessous sont un filet, pas un tri ;
-- 2. toute écriture qui pourrait heurter une contrainte d'unicité passe par « ON CONFLICT » ;
-- 3. les refus voulus (accord absent, cercle complet…) viennent de déclencheurs qui lèvent un code « EL… » avec un
--    message fixe, sans aucune valeur (migration 0002).
--
-- Mots : « jour » = jour de jeu, la date civile dont le texte s'ouvre à 18h, heure de Paris (règle 6) ;
-- « semaine » = le dimanche qui la clôt (règle 12). Les identifiants sont tirés au hasard par le programme.

-- ---------------------------------------------------------------------------------------------------------------
-- Le contenu public (données de l'Assemblée, P-14) : aucune donnée de joueur.

CREATE TABLE texte (
  id text PRIMARY KEY CHECK (id ~ '^T[0-9]{2,4}$'),
  role text NOT NULL CHECK (role IN ('entree', 'jour', 'reserve')),
  tension text NOT NULL CHECK (tension IN ('S', 'EM', 'SR', 'P', 'T', 'SO', 'EP', 'L')),
  sens smallint NOT NULL CHECK (sens IN (0, 1)),
  -- titre, lignes, raisons, auteur, vote, lien officiel : jeu/textes/FORMAT.md. Des noms de députés, publics.
  contenu jsonb NOT NULL CHECK (jsonb_typeof(contenu) = 'object'),
  empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  erratum jsonb CHECK (erratum IS NULL OR jsonb_typeof(erratum) = 'object'),
  retire_des_portraits_le date -- règle 20, P-04 a
);

CREATE TABLE calendrier (
  jour date PRIMARY KEY,
  texte_id text NOT NULL UNIQUE REFERENCES texte (id)
);

-- Les versions de la carte de consentement (P-34). Une version « nouvel accord » bloque la réponse suivante de
-- quiconque n'a pas redonné son accord.
CREATE TABLE carte_accord (
  version smallint PRIMARY KEY CHECK (version > 0),
  empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  nouvel_accord boolean NOT NULL
);

-- ---------------------------------------------------------------------------------------------------------------
-- Les joueurs, leurs identités, leurs accords.

-- Le pseudo est libre (§3), mais la base refuse qu'il porte une adresse e-mail, une adresse internet ou une adresse
-- IP : ni « @ », ni « / », ni « : », ni quatre nombres séparés par des points. Sa forme de comparaison (E7 : sans
-- majuscules ni accents ni lettres qui imitent les nôtres) est calculée par le programme.
CREATE TABLE joueur (
  id uuid PRIMARY KEY,
  etat text NOT NULL CHECK (etat IN ('provisoire', 'compte')),
  pseudo text CHECK (pseudo IS NULL OR (
    char_length(pseudo) BETWEEN 1 AND 24 AND pseudo !~ '[@/:<>[:cntrl:]]' AND pseudo !~ '[0-9]+([.][0-9]+){3}')),
  pseudo_comparaison text CHECK (pseudo_comparaison IS NULL OR (
    char_length(pseudo_comparaison) BETWEEN 1 AND 48 AND pseudo_comparaison !~ '[@/:<>[:cntrl:]]'
    AND pseudo_comparaison !~ '[0-9]+([.][0-9]+){3}')),
  cree_le timestamptz NOT NULL, -- un joueur provisoire est effacé au bout de 7 jours (DECISIONS-TECHNIQUES, partie 3)
  CHECK ((pseudo IS NULL) = (pseudo_comparaison IS NULL)),
  CHECK (etat = 'provisoire' OR pseudo IS NOT NULL)
);

-- L'identité : une empreinte avec clé (HMAC) de l'identifiant Apple ou Google, ou de l'adresse e-mail ; jamais la
-- valeur. Seul le module des comptes la lit (P-01).
CREATE TABLE identite (
  voie text NOT NULL CHECK (voie IN ('apple', 'google', 'email')),
  empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  PRIMARY KEY (voie, empreinte)
);
CREATE INDEX identite_joueur ON identite (joueur_id);

-- Les sessions, une par appareil : l'empreinte du jeton gardé dans le trousseau de l'iPhone (CONTRAT.md, partie 4 ;
-- DECISIONS-TECHNIQUES 1.8 ; P-41). L'identifiant, tiré au hasard, est « l'appareil » : un numéro sans lien avec
-- l'iPhone, auquel s'attache l'abonnement au message.
CREATE TABLE session (
  id uuid PRIMARY KEY,
  empreinte text NOT NULL UNIQUE CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  expire_le timestamptz NOT NULL,
  UNIQUE (id, joueur_id)
);
CREATE INDEX session_joueur ON session (joueur_id);

-- Une connexion commencée par Apple ou Google, 10 minutes au plus (CONTRAT.md, 2.5) : le nonce donné, l'état et le
-- vérificateur de Google (PKCE), le défi de l'application (SHA-256 de son vérificateur, en base64url), le joueur
-- provisoire de la session s'il y en a un. Rien de ce qu'Apple ou Google renvoient n'y est gardé.
CREATE TABLE connexion_en_cours (
  id uuid PRIMARY KEY,
  voie text NOT NULL CHECK (voie IN ('apple', 'google')),
  but text NOT NULL CHECK (but IN ('creation', 'connexion')),
  nonce text NOT NULL CHECK (nonce ~ '^[A-Za-z0-9_-]{16,128}$'),
  etat_google text CHECK (etat_google ~ '^[A-Za-z0-9_-]{16,128}$'),
  verificateur_google text CHECK (verificateur_google ~ '^[A-Za-z0-9_-]{43,128}$'),
  defi text NOT NULL CHECK (defi ~ '^[A-Za-z0-9_-]{43}$'),
  joueur_id uuid REFERENCES joueur (id) ON DELETE CASCADE,
  expire_le timestamptz NOT NULL,
  CHECK ((voie = 'google') = (etat_google IS NOT NULL AND verificateur_google IS NOT NULL))
);
CREATE INDEX connexion_en_cours_nonce ON connexion_en_cours (nonce);
CREATE INDEX connexion_en_cours_etat ON connexion_en_cours (etat_google);

-- Le code de retour de Google : son empreinte, une minute, une fois (CONTRAT.md, 2.5). Il porte le compte trouvé ou
-- créé, ou un refus d'une liste fermée, et le défi qui lie la fin de la connexion à l'application qui l'a commencée.
CREATE TABLE code_retour (
  empreinte text PRIMARY KEY CHECK (empreinte ~ '^[0-9a-f]{64}$'),
  defi text NOT NULL CHECK (defi ~ '^[A-Za-z0-9_-]{43}$'),
  joueur_id uuid REFERENCES joueur (id) ON DELETE CASCADE,
  refus text CHECK (refus IN ('refus_fournisseur', 'compte_organisation', 'compte_inconnu', 'cercle_complet',
    'pseudo_pris', 'connexion_echouee')),
  expire_le timestamptz NOT NULL,
  CHECK ((joueur_id IS NULL) <> (refus IS NULL))
);

-- Le code à six chiffres de la voie e-mail : empreintes seulement ; 15 minutes, 5 essais (P-41).
CREATE TABLE code_email (
  id uuid PRIMARY KEY,
  empreinte_adresse text NOT NULL CHECK (empreinte_adresse ~ '^[0-9a-f]{64}$'),
  empreinte_code text NOT NULL CHECK (empreinte_code ~ '^[0-9a-f]{64}$'),
  cree_le timestamptz NOT NULL,
  expire_le timestamptz NOT NULL,
  essais smallint NOT NULL DEFAULT 0 CHECK (essais >= 0)
);
CREATE INDEX code_email_adresse ON code_email (empreinte_adresse);

-- L'accord (P-34) : la version de la carte (donc l'empreinte de son texte exact), la date et l'heure du serveur, la
-- déclaration « 15 ans et plus ». Il suit le joueur provisoire jusqu'à son compte (c'est la même ligne de joueur).
CREATE TABLE consentement (
  id uuid PRIMARY KEY,
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  version smallint NOT NULL REFERENCES carte_accord (version),
  donne_le timestamptz NOT NULL,
  quinze_ans_et_plus boolean NOT NULL CHECK (quinze_ans_et_plus),
  UNIQUE (id, joueur_id)
);
CREATE INDEX consentement_joueur ON consentement (joueur_id);

-- ---------------------------------------------------------------------------------------------------------------
-- Les cercles (trois au plus par joueur, dix membres au plus : migration 0002) et les invitations.

CREATE TABLE cercle (
  id uuid PRIMARY KEY,
  intitule text CHECK (intitule IS NULL OR (
    char_length(intitule) BETWEEN 1 AND 40 AND intitule !~ '[@/:<>[:cntrl:]]' AND intitule !~ '[0-9]+([.][0-9]+){3}')),
  -- Les trois textes d'entrée, fixés à la création, les mêmes pour tous ceux qui y entrent (règle 15).
  entree_1 text NOT NULL REFERENCES texte (id),
  entree_2 text NOT NULL REFERENCES texte (id),
  entree_3 text NOT NULL REFERENCES texte (id),
  CHECK (entree_1 <> entree_2 AND entree_1 <> entree_3 AND entree_2 <> entree_3)
);

-- Un membre : la place d'un joueur dans un cercle. Son identifiant est celui que voient les proches (IdMembre du
-- contrat), jamais celui du joueur (P-01). Au départ, la ligne part : ses réponses quittent le cercle (P-37), ses
-- titres passés restent sous « un ancien membre » (D-045, point 2).
CREATE TABLE membre (
  id uuid PRIMARY KEY,
  cercle_id uuid NOT NULL REFERENCES cercle (id) ON DELETE CASCADE,
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  rond text NOT NULL CHECK (rond ~ '^[[:alpha:]]{1,2}$'), -- une ou deux lettres, uniques dans le cercle (E7)
  createur boolean NOT NULL,
  arrive_le timestamptz NOT NULL, -- l'ordre d'arrivée ; « arrivé après la fermeture du texte » (règle 8)
  UNIQUE (cercle_id, joueur_id),
  UNIQUE (id, cercle_id)
);
CREATE INDEX membre_joueur ON membre (joueur_id);

-- Un lien : de créateur (fabriqué par le porteur, sans cercle ni invitant) ou d'invitation. Le jeton n'est gardé que
-- sous forme d'empreinte (P-29). Il est consommé une fois pour toutes à sa liaison (lie_le), même si l'invité
-- s'efface ensuite. L'accord de l'invitant à envoyer ses trois réponses est gardé avec le lien (P-35).
CREATE TABLE invitation (
  id uuid PRIMARY KEY,
  sorte text NOT NULL CHECK (sorte IN ('createur', 'invite')),
  empreinte_jeton text NOT NULL UNIQUE CHECK (empreinte_jeton ~ '^[0-9a-f]{64}$'),
  cercle_id uuid REFERENCES cercle (id) ON DELETE CASCADE,
  invitant_membre_id uuid,
  accord_invitant_version smallint CHECK (accord_invitant_version > 0),
  accord_invitant_le timestamptz,
  expire_le timestamptz NOT NULL,
  lie_le timestamptz,
  invite_joueur_id uuid REFERENCES joueur (id) ON DELETE SET NULL,
  score_entree smallint CHECK (score_entree BETWEEN 0 AND 3), -- seul le score du défi reste, jamais les devinettes
  FOREIGN KEY (invitant_membre_id, cercle_id) REFERENCES membre (id, cercle_id) ON DELETE CASCADE,
  CHECK (CASE sorte
    WHEN 'createur' THEN cercle_id IS NULL AND invitant_membre_id IS NULL AND accord_invitant_version IS NULL
      AND accord_invitant_le IS NULL
    ELSE cercle_id IS NOT NULL AND invitant_membre_id IS NOT NULL AND accord_invitant_version IS NOT NULL
      AND accord_invitant_le IS NOT NULL END),
  CHECK (invite_joueur_id IS NULL OR lie_le IS NOT NULL)
);
CREATE INDEX invitation_cercle ON invitation (cercle_id);
CREATE INDEX invitation_invite ON invitation (invite_joueur_id);

-- ---------------------------------------------------------------------------------------------------------------
-- Les réponses : une par joueur et par texte, valable dans tous ses cercles (règle 3). Position et raison chiffrées
-- par le programme (P-02), liées à leur ligne. La base refuse une réponse sans accord (P-34, migration 0002).

CREATE TABLE reponse (
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  texte_id text NOT NULL REFERENCES texte (id),
  moment text NOT NULL CHECK (moment IN ('entree', 'jour')),
  chiffre bytea NOT NULL CHECK (octet_length(chiffre) = 31),
  en_retard boolean NOT NULL DEFAULT false, -- jusqu'à 18h10 (règle 6) : jamais servie à deviner
  consentement_id uuid NOT NULL,
  PRIMARY KEY (joueur_id, texte_id),
  FOREIGN KEY (consentement_id, joueur_id) REFERENCES consentement (id, joueur_id) ON DELETE CASCADE,
  CHECK (moment = 'jour' OR NOT en_retard)
);

-- ---------------------------------------------------------------------------------------------------------------
-- La journée : manches, cartes, éveil du cercle.

-- Une manche : ce qu'un membre devine dans un cercle, un jour (le texte de la veille). Créée à la première ouverture
-- de Deviner après 18h, avec ses cartes, une seule fois (règle 10). « cercle_regarde » : le geste « Le Cercle ouvert
-- pendant une manche pas encore validée », noté une fois par manche (CONTRAT.md, 2.15 ; produit.md §8).
CREATE TABLE manche (
  id uuid PRIMARY KEY,
  cercle_id uuid NOT NULL REFERENCES cercle (id) ON DELETE CASCADE,
  devineur_membre_id uuid NOT NULL,
  jour date NOT NULL,
  texte_id text NOT NULL REFERENCES texte (id),
  validee_le timestamptz, -- Valider fige la manche (règle 9)
  cercle_regarde boolean NOT NULL DEFAULT false,
  FOREIGN KEY (devineur_membre_id, cercle_id) REFERENCES membre (id, cercle_id) ON DELETE CASCADE,
  UNIQUE (devineur_membre_id, jour),
  UNIQUE (id, cercle_id)
);
CREATE INDEX manche_cercle_jour ON manche (cercle_id, jour);

-- Une carte : la réponse d'un auteur, servie à un devineur. Son identifiant est tiré au hasard pour chaque joueur et
-- chaque jour (P-26). La carte ne recopie pas la réponse : elle désigne son auteur. Au départ de l'auteur, une carte
-- part avec lui ; au départ d'un membre désigné, la carte redevient vide (règle 4).
CREATE TABLE carte (
  id uuid PRIMARY KEY,
  manche_id uuid NOT NULL,
  cercle_id uuid NOT NULL,
  ordre smallint NOT NULL CHECK (ordre BETWEEN 1 AND 3),
  auteur_membre_id uuid NOT NULL,
  qui_et_pourquoi boolean NOT NULL,
  visage_membre_id uuid REFERENCES membre (id) ON DELETE SET NULL, -- même cercle : migration 0002
  pourquoi smallint CHECK (pourquoi BETWEEN 1 AND 4),
  passee boolean NOT NULL DEFAULT false,
  verdict text CHECK (verdict IN ('juste', 'juste_et_raison', 'jumeau', 'jumeau_et_raison', 'faux', 'passe')),
  FOREIGN KEY (manche_id, cercle_id) REFERENCES manche (id, cercle_id) ON DELETE CASCADE,
  FOREIGN KEY (auteur_membre_id, cercle_id) REFERENCES membre (id, cercle_id) ON DELETE CASCADE,
  UNIQUE (manche_id, ordre),
  CHECK (pourquoi IS NULL OR qui_et_pourquoi)
);
CREATE INDEX carte_auteur ON carte (auteur_membre_id);
CREATE INDEX carte_visage ON carte (visage_membre_id);

-- L'éveil d'un cercle, décidé à chaque 18h (règle 5), et la garde des titres « écrits une fois » (règle 12).
CREATE TABLE journee_cercle (
  cercle_id uuid NOT NULL REFERENCES cercle (id) ON DELETE CASCADE,
  jour date NOT NULL,
  eveille boolean NOT NULL,
  titres_calcules boolean NOT NULL DEFAULT false,
  PRIMARY KEY (cercle_id, jour)
);

-- ---------------------------------------------------------------------------------------------------------------
-- La semaine : compteurs, titres, badges.

-- Les compteurs d'un membre pour une semaine, tenus au moment de chaque geste (« rien ne se calcule à 18h pile »,
-- D-043) : Le Devin, Le Mystère, Le Fidèle, Le Sans-Faute (règles 12 et 14).
CREATE TABLE compte_semaine (
  cercle_id uuid NOT NULL,
  membre_id uuid NOT NULL,
  semaine date NOT NULL CHECK (extract(isodow FROM semaine) = 7),
  points smallint NOT NULL DEFAULT 0 CHECK (points >= 0),
  raisons_trouvees smallint NOT NULL DEFAULT 0 CHECK (raisons_trouvees >= 0),
  tentatives_subies smallint NOT NULL DEFAULT 0 CHECK (tentatives_subies >= 0),
  erreurs_subies smallint NOT NULL DEFAULT 0 CHECK (erreurs_subies >= 0),
  jours_avec_cartes smallint NOT NULL DEFAULT 0 CHECK (jours_avec_cartes >= 0),
  erreurs_faites smallint NOT NULL DEFAULT 0 CHECK (erreurs_faites >= 0),
  passes_faites smallint NOT NULL DEFAULT 0 CHECK (passes_faites >= 0),
  textes_repondus smallint NOT NULL DEFAULT 0 CHECK (textes_repondus >= 0),
  PRIMARY KEY (membre_id, semaine),
  FOREIGN KEY (membre_id, cercle_id) REFERENCES membre (id, cercle_id) ON DELETE CASCADE
);

-- Les attributions d'un cercle sur un texte : la surprise de la semaine (règle 12). Elles restent au départ d'un
-- auteur (règle 4).
CREATE TABLE compte_texte_cercle (
  cercle_id uuid NOT NULL REFERENCES cercle (id) ON DELETE CASCADE,
  texte_id text NOT NULL REFERENCES texte (id),
  attributions smallint NOT NULL DEFAULT 0 CHECK (attributions >= 0),
  fausses smallint NOT NULL DEFAULT 0 CHECK (fausses >= 0),
  PRIMARY KEY (cercle_id, texte_id)
);

-- Les titres et badges rares, figés. Au départ d'un titulaire, membre_id devient vide : « un ancien membre »
-- (D-045, point 2 ; règle 4). La surprise de la semaine désigne un texte ; Le Pas de Côté, un membre et un texte.
CREATE TABLE titre (
  id uuid PRIMARY KEY,
  cercle_id uuid NOT NULL REFERENCES cercle (id) ON DELETE CASCADE,
  sorte text NOT NULL CHECK (sorte IN ('devin', 'mystere', 'fidele', 'surprise', 'sans_faute', 'pas_de_cote')),
  jour date NOT NULL,
  membre_id uuid REFERENCES membre (id) ON DELETE SET NULL, -- même cercle : migration 0002
  texte_id text REFERENCES texte (id),
  CHECK ((sorte IN ('surprise', 'pas_de_cote')) = (texte_id IS NOT NULL)),
  CHECK (sorte <> 'surprise' OR membre_id IS NULL)
);
CREATE INDEX titre_cercle_jour ON titre (cercle_id, jour);
CREATE INDEX titre_membre ON titre (membre_id);

-- ---------------------------------------------------------------------------------------------------------------
-- Le portrait. Les curseurs, la barre et les phrases se recalculent depuis les réponses (carte des données) ; seuls
-- sont gardés ce qui demande une mémoire d'une semaine à l'autre.

-- Les tempéraments en cours (règle 13) : L'Original et Le Pont par cercle (un membre), Le Mesuré et Le Tranché pour
-- toute la personne (un joueur). « depuis » sert la marge des 4/5 (garder un tempérament).
CREATE TABLE temperament (
  id uuid PRIMARY KEY,
  sorte text NOT NULL CHECK (sorte IN ('original', 'pont', 'mesure', 'tranche')),
  joueur_id uuid REFERENCES joueur (id) ON DELETE CASCADE,
  cercle_id uuid,
  membre_id uuid,
  depuis date NOT NULL,
  FOREIGN KEY (membre_id, cercle_id) REFERENCES membre (id, cercle_id) ON DELETE CASCADE,
  CHECK (CASE WHEN sorte IN ('original', 'pont')
    THEN joueur_id IS NULL AND cercle_id IS NOT NULL AND membre_id IS NOT NULL
    ELSE joueur_id IS NOT NULL AND cercle_id IS NULL AND membre_id IS NULL END)
);
CREATE UNIQUE INDEX temperament_personne ON temperament (sorte, joueur_id) WHERE joueur_id IS NOT NULL;
CREATE UNIQUE INDEX temperament_membre ON temperament (sorte, membre_id) WHERE membre_id IS NOT NULL;

-- La lecture du dimanche (règle 18, « une tension devenue nette depuis la lecture du dimanche précédent ») : quelles
-- tensions étaient nettes, en huit bits, sans leur sens. Visible du seul joueur.
CREATE TABLE portrait_dimanche (
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  jour date NOT NULL CHECK (extract(isodow FROM jour) = 7),
  nettes smallint NOT NULL CHECK (nettes BETWEEN 0 AND 255),
  PRIMARY KEY (joueur_id, jour)
);

-- Ce que le joueur a déjà vu (contrat : OBJETS_VU), pour ne le montrer qu'une fois : la révélation d'un jour,
-- l'arrivée dans un cercle, le cercle lancé, les annonces, la barre pleine. L'heure sert la mesure « révélation
-- ouverte le soir même » (CONTRAT.md, 2.9 et 2.15).
CREATE TABLE vu (
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  objet text NOT NULL CHECK (objet IN ('revelation', 'arrivee', 'cercle_lance', 'annonces', 'barre_pleine')),
  jour date,
  cercle_id uuid REFERENCES cercle (id) ON DELETE CASCADE,
  vu_le timestamptz NOT NULL
);
CREATE UNIQUE INDEX vu_une_fois ON vu (joueur_id, objet, coalesce(jour, DATE '0001-01-01'),
  coalesce(cercle_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- L'écran Répondre d'un texte s'est affiché, et quand : la condition de la réponse en retard, jusqu'à 18h10 (règle 6,
-- R10 ; CONTRAT.md, 2.8). Gardé jusqu'à la fermeture du texte.
CREATE TABLE repondre_ouvert (
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  texte_id text NOT NULL REFERENCES texte (id),
  ouvert_le timestamptz NOT NULL,
  PRIMARY KEY (joueur_id, texte_id)
);

-- La révélation reprend là où on l'avait laissée (E3 ; CONTRAT.md, 2.9) : la dernière étape vue, un identifiant
-- opaque fait par le serveur, du 18h au 18h suivant.
CREATE TABLE reprise_revelation (
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  jour date NOT NULL,
  etape text NOT NULL CHECK (etape ~ '^[A-Za-z0-9_-]{1,64}$'),
  PRIMARY KEY (joueur_id, jour)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Le message de 18h.

-- Un abonnement : le jeton d'appareil que donne Apple (l'adresse technique où l'iPhone reçoit le message), lié à la
-- session de cet appareil (CONTRAT.md, 2.13). Retiré quand Apple le refuse (application désinstallée), à la
-- déconnexion de l'appareil (avec sa session), à l'effacement.
CREATE TABLE abonnement (
  id uuid PRIMARY KEY,
  joueur_id uuid NOT NULL REFERENCES joueur (id) ON DELETE CASCADE,
  session_id uuid NOT NULL UNIQUE,
  jeton text NOT NULL CHECK (jeton ~ '^[0-9a-f]{64,200}$'),
  FOREIGN KEY (session_id, joueur_id) REFERENCES session (id, joueur_id) ON DELETE CASCADE
);
CREATE INDEX abonnement_joueur ON abonnement (joueur_id);

-- Le message de 18h coupé dans les Réglages, pour tous les appareils du joueur (D-029 ; CONTRAT.md, 2.12).
CREATE TABLE message_coupe (
  joueur_id uuid PRIMARY KEY REFERENCES joueur (id) ON DELETE CASCADE
);

-- Un envoi : le verrou « un envoi par jour et par abonnement » (index partiel), et la mesure « message reçu »
-- (produit.md, section 8) par son numéro tiré au hasard.
CREATE TABLE envoi (
  id uuid PRIMARY KEY,
  abonnement_id uuid NOT NULL REFERENCES abonnement (id) ON DELETE CASCADE,
  sorte text NOT NULL CHECK (sorte IN ('soir', 'arrivee')),
  jour date NOT NULL,
  envoye_a timestamptz NOT NULL,
  reponse_code smallint CHECK (reponse_code BETWEEN 100 AND 599),
  recu_a timestamptz
);
CREATE UNIQUE INDEX envoi_un_par_soir ON envoi (abonnement_id, jour) WHERE sorte = 'soir';

-- ---------------------------------------------------------------------------------------------------------------
-- Les totaux : sans cercle ni personne (P-22, P-23, P-28, P-39, P-39 a, P-40). Le module du jeu y écrit par des
-- fonctions, sans pouvoir les lire ; le module des mesures ne les lit que par des vues à seuil (migration 0003).

CREATE TABLE compte_aucune (
  texte_id text PRIMARY KEY REFERENCES texte (id),
  reponses integer NOT NULL CHECK (reponses >= 0),
  aucune integer NOT NULL CHECK (aucune >= 0 AND aucune <= reponses)
);

CREATE TABLE compteur (
  -- contrat.ts : SORTES_COMPTEUR et SORTES_COMPTEUR_SERVEUR.
  sorte text NOT NULL CHECK (sorte IN ('android', 'ordinateur', 'ipad', 'iphone_sans_application',
    'reponse_refusee_apres_18h', 'reponse_en_retard')),
  jour date NOT NULL,
  nombre integer NOT NULL CHECK (nombre >= 0),
  PRIMARY KEY (sorte, jour)
);

CREATE TABLE histogramme_raison (
  semaine date NOT NULL CHECK (extract(isodow FROM semaine) = 7),
  tranche smallint NOT NULL CHECK (tranche BETWEEN 0 AND 9),
  nombre integer NOT NULL CHECK (nombre >= 0),
  PRIMARY KEY (semaine, tranche)
);

CREATE TABLE total_mesure (
  periode date NOT NULL,
  sorte text NOT NULL CHECK (sorte IN (
    'justesse_cartes', 'justesse_hasard', 'mystere_nouveaux', 'pas_de_cote',
    'temperament_original', 'temperament_pont', 'temperament_mesure', 'temperament_tranche',
    'curseur_net_40', 'curseur_net_60', 'curseur_net_80')),
  numerateur bigint NOT NULL CHECK (numerateur >= 0),
  denominateur bigint NOT NULL CHECK (denominateur >= 0),
  effectif integer NOT NULL CHECK (effectif >= 0), -- le nombre d'apports : le seuil se compte dessus
  PRIMARY KEY (periode, sorte)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Le journal des effacements (P-32) : l'identifiant tiré au hasard d'un joueur effacé, sans adresse ni pseudo, pour
-- rejouer l'effacement après une restauration. Gardé la plus longue rotation des sauvegardes, plus 5 jours.
CREATE TABLE effacement (
  joueur_id uuid PRIMARY KEY,
  efface_le date NOT NULL
);
