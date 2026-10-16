-- Migration 0002 : le cloisonnement des cercles, imposé par la base (P-25), et les refus que la base garde elle-même
-- (P-34 ; trois cercles ; dix membres ; pseudo unique dans le cercle ; le joueur provisoire n'est membre de rien).
--
-- LE PRINCIPE. Chaque table porte des règles de sécurité au niveau des lignes (ROW LEVEL SECURITY), imposées aussi
-- au propriétaire des tables (FORCE). Une ligne n'est visible que si une règle la montre au MODULE qui demande
-- (jeu, comptes, envoi, menage, mesures) et, pour le jeu, au JOUEUR déclaré dans la transaction
-- (SET LOCAL elenchos.joueur). Sans déclaration, les règles du jeu ne voient personne : la base ne rend rien.
--
-- LE MODULE. En mode « roles », c'est le rôle de la connexion (elenchos_jeu…), qui a en plus ses seuls droits
-- (GRANT, jeu/src/base/roles.ts). En mode « repli » (Scalingo ne permet pas de créer des rôles), toutes les
-- connexions sont celles du propriétaire, et le module est un paramètre posé à l'ouverture de la connexion
-- (elenchos.module) : les règles ci-dessous s'appliquent de même, grâce à FORCE. Ce que le repli perd :
-- jeu/src/base/LISEZMOI.md.
--
-- LES FONCTIONS « cloison_… ». Une règle sur « membre » ne peut pas lire « membre » sans tourner en rond. Ces
-- fonctions lisent donc pour le compte de la règle, sous le module interne « cloison », et ne rendent que ce qui
-- concerne le joueur déclaré (ses cercles, ses proches, ses invitants). Elles posent ce module le temps de leur
-- travail, puis remettent l'ancien (un paramètre posé par set_config(…, true) meurt de toute façon avec la
-- transaction).

-- ---------------------------------------------------------------------------------------------------------------
-- Qui demande.

CREATE FUNCTION module_courant() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT CASE current_user::text
    WHEN 'elenchos_jeu' THEN 'jeu'
    WHEN 'elenchos_comptes' THEN 'comptes'
    WHEN 'elenchos_envoi' THEN 'envoi'
    WHEN 'elenchos_menage' THEN 'menage'
    WHEN 'elenchos_mesures' THEN 'mesures'
    ELSE coalesce(nullif(current_setting('elenchos.module', true), ''), 'aucun')
  END
$$;

CREATE FUNCTION joueur_courant() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('elenchos.joueur', true), '')::uuid
$$;

-- L'empreinte du jeton d'un lien, déclarée par qui ouvre ce lien sans être encore joueur (P-29).
CREATE FUNCTION jeton_courant() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('elenchos.jeton', true), '')
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Les fonctions de cloison.

CREATE FUNCTION cloison_mes_cercles() RETURNS uuid[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r uuid[];
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT coalesce(array_agg(m.cercle_id), '{}') INTO r FROM membre m WHERE m.joueur_id = joueur_courant();
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

CREATE FUNCTION cloison_mes_membres() RETURNS uuid[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r uuid[];
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT coalesce(array_agg(m.id), '{}') INTO r FROM membre m WHERE m.joueur_id = joueur_courant();
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

-- Les joueurs qui partagent au moins un cercle avec le joueur déclaré, lui compris.
CREATE FUNCTION cloison_mes_proches() RETURNS uuid[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r uuid[];
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT coalesce(array_agg(DISTINCT autre.joueur_id), '{}') INTO r
    FROM membre moi JOIN membre autre ON autre.cercle_id = moi.cercle_id
   WHERE moi.joueur_id = joueur_courant();
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

-- Les invitations « du joueur » : liées à lui, ou, pas encore liées, dont il a déclaré le jeton.
CREATE FUNCTION cloison_mes_invitations() RETURNS TABLE (cercle_id uuid, invitant_membre_id uuid, lie boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  RETURN QUERY
    SELECT i.cercle_id, i.invitant_membre_id, (i.invite_joueur_id IS NOT NULL)
      FROM invitation i
     WHERE (joueur_courant() IS NOT NULL AND i.invite_joueur_id = joueur_courant())
        OR (i.lie_le IS NULL AND jeton_courant() IS NOT NULL AND i.empreinte_jeton = jeton_courant());
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
END $$;

CREATE FUNCTION cloison_cercles_invitation() RETURNS uuid[] LANGUAGE sql STABLE AS $$
  SELECT coalesce(array_agg(cercle_id), '{}') FROM cloison_mes_invitations() WHERE cercle_id IS NOT NULL
$$;

CREATE FUNCTION cloison_invitants_membres() RETURNS uuid[] LANGUAGE sql STABLE AS $$
  SELECT coalesce(array_agg(invitant_membre_id), '{}') FROM cloison_mes_invitations() WHERE invitant_membre_id IS NOT NULL
$$;

CREATE FUNCTION cloison_invitants_joueurs() RETURNS uuid[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r uuid[]; invitants uuid[] := cloison_invitants_membres();
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT coalesce(array_agg(m.joueur_id), '{}') INTO r FROM membre m WHERE m.id = ANY (invitants);
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

-- Les réponses d'entrée de l'invitant, offertes à l'invité par une invitation LIÉE à lui (P-29) : « joueur:texte ».
-- Un lien seulement ouvert (jeton déclaré, pas encore lié) n'offre aucune réponse.
CREATE FUNCTION cloison_reponses_offertes() RETURNS text[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r text[];
BEGIN
  IF joueur_courant() IS NULL THEN RETURN '{}'; END IF;
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT coalesce(array_agg(m.joueur_id::text || ':' || t.texte_id), '{}') INTO r
    FROM invitation i
    JOIN membre m ON m.id = i.invitant_membre_id
    JOIN cercle c ON c.id = i.cercle_id
    CROSS JOIN LATERAL (VALUES (c.entree_1), (c.entree_2), (c.entree_3)) AS t (texte_id)
   WHERE i.invite_joueur_id = joueur_courant();
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

-- Entrer dans un cercle : le premier membre (le créateur, qui vient de le créer), ou un invité dont le lien de ce
-- cercle est lié à lui.
CREATE FUNCTION cloison_peut_entrer(p_cercle uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); r boolean;
BEGIN
  IF joueur_courant() IS NULL THEN RETURN false; END IF;
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT NOT EXISTS (SELECT 1 FROM membre m WHERE m.cercle_id = p_cercle)
      OR EXISTS (SELECT 1 FROM invitation i WHERE i.cercle_id = p_cercle AND i.invite_joueur_id = joueur_courant())
    INTO r;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN r;
END $$;

-- ---------------------------------------------------------------------------------------------------------------
-- Les refus gardés par la base. Chacun lève un code « EL… » avec un message fixe : aucune valeur n'entre dans le
-- journal de la base (P-07). Les verrous consultatifs sérialisent deux entrées simultanées dans un même cercle.

CREATE FUNCTION membre_avant_entree() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  PERFORM pg_advisory_xact_lock(hashtextextended('cercle:' || NEW.cercle_id::text, 0));
  PERFORM pg_advisory_xact_lock(hashtextextended('joueur:' || NEW.joueur_id::text, 0));
  IF NOT EXISTS (SELECT 1 FROM joueur j WHERE j.id = NEW.joueur_id AND j.etat = 'compte') THEN
    RAISE EXCEPTION USING ERRCODE = 'EL006', MESSAGE = 'un joueur provisoire n''est membre d''aucun cercle';
  END IF;
  IF (SELECT count(*) FROM membre m WHERE m.cercle_id = NEW.cercle_id) >= 10 THEN
    RAISE EXCEPTION USING ERRCODE = 'EL001', MESSAGE = 'cercle complet (dix membres, regle 1)';
  END IF;
  IF (SELECT count(*) FROM membre m WHERE m.joueur_id = NEW.joueur_id) >= 3 THEN
    RAISE EXCEPTION USING ERRCODE = 'EL002', MESSAGE = 'trois cercles au plus (regle 3)';
  END IF;
  IF EXISTS (SELECT 1 FROM membre m JOIN joueur autre ON autre.id = m.joueur_id, joueur moi
              WHERE m.cercle_id = NEW.cercle_id AND moi.id = NEW.joueur_id AND autre.id <> moi.id
                AND autre.pseudo_comparaison = moi.pseudo_comparaison) THEN
    RAISE EXCEPTION USING ERRCODE = 'EL003', MESSAGE = 'pseudo deja pris dans ce cercle (E7)';
  END IF;
  IF EXISTS (SELECT 1 FROM membre m WHERE m.cercle_id = NEW.cercle_id AND m.rond = NEW.rond) THEN
    RAISE EXCEPTION USING ERRCODE = 'EL004', MESSAGE = 'rond deja pris dans ce cercle (E7)';
  END IF;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN NEW;
END $$;
CREATE TRIGGER membre_avant_entree BEFORE INSERT ON membre FOR EACH ROW EXECUTE FUNCTION membre_avant_entree();

CREATE FUNCTION joueur_avant_pseudo() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  IF NEW.pseudo_comparaison IS NOT DISTINCT FROM OLD.pseudo_comparaison THEN RETURN NEW; END IF;
  PERFORM set_config('elenchos.module', 'cloison', true);
  IF EXISTS (SELECT 1 FROM membre moi JOIN membre m ON m.cercle_id = moi.cercle_id AND m.joueur_id <> moi.joueur_id
               JOIN joueur autre ON autre.id = m.joueur_id
              WHERE moi.joueur_id = NEW.id AND autre.pseudo_comparaison = NEW.pseudo_comparaison) THEN
    RAISE EXCEPTION USING ERRCODE = 'EL003', MESSAGE = 'pseudo deja pris dans ce cercle (E7)';
  END IF;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN NEW;
END $$;
CREATE TRIGGER joueur_avant_pseudo BEFORE UPDATE OF pseudo_comparaison ON joueur FOR EACH ROW EXECUTE FUNCTION joueur_avant_pseudo();

-- P-34 : aucune réponse sans un accord du même joueur, enregistré avant elle, à une version de la carte au moins
-- égale à la dernière version marquée « nouvel accord ». Le déclencheur passe AVANT la clé étrangère : un accord
-- absent donne ce refus-ci, sans valeur, et jamais le refus de la clé, qui recopierait les identifiants.
CREATE FUNCTION reponse_avant_ecriture() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); ok boolean;
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  SELECT EXISTS (
    SELECT 1 FROM consentement c
     WHERE c.id = NEW.consentement_id AND c.joueur_id = NEW.joueur_id AND c.donne_le <= now()
       AND c.version >= coalesce((SELECT max(a.version) FROM carte_accord a WHERE a.nouvel_accord), 0)
  ) INTO ok;
  IF NOT ok THEN
    RAISE EXCEPTION USING ERRCODE = 'EL034', MESSAGE = 'reponse sans accord (P-34)';
  END IF;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN NEW;
END $$;
CREATE TRIGGER reponse_avant_ecriture BEFORE INSERT OR UPDATE OF joueur_id, consentement_id ON reponse
  FOR EACH ROW EXECUTE FUNCTION reponse_avant_ecriture();

-- Un visage posé, un titulaire : toujours un membre du même cercle.
CREATE FUNCTION meme_cercle() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); designe uuid;
BEGIN
  IF TG_TABLE_NAME = 'carte' THEN designe := NEW.visage_membre_id; ELSE designe := NEW.membre_id; END IF;
  IF designe IS NULL THEN RETURN NEW; END IF;
  PERFORM set_config('elenchos.module', 'cloison', true);
  IF NOT EXISTS (SELECT 1 FROM membre m WHERE m.id = designe AND m.cercle_id = NEW.cercle_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'EL005', MESSAGE = 'membre d''un autre cercle';
  END IF;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN NEW;
END $$;
CREATE TRIGGER carte_meme_cercle BEFORE INSERT OR UPDATE OF visage_membre_id ON carte
  FOR EACH ROW EXECUTE FUNCTION meme_cercle();
CREATE TRIGGER titre_meme_cercle BEFORE INSERT ON titre FOR EACH ROW EXECUTE FUNCTION meme_cercle();

-- L'invitant a lu l'annonce d'arrivée : le score du défi s'efface (CONTRAT.md, 2.7). Seulement sur ses propres liens
-- de ce cercle. Une fonction plutôt qu'un droit d'écrire sur les liens des autres : le jeu ne peut rien y changer
-- d'autre.
CREATE FUNCTION oublier_scores(p_cercle uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true); mes uuid[] := cloison_mes_membres(); n integer;
BEGIN
  PERFORM set_config('elenchos.module', 'cloison', true);
  UPDATE invitation SET score_entree = NULL
   WHERE cercle_id = p_cercle AND invitant_membre_id = ANY (mes) AND score_entree IS NOT NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
  RETURN n;
END $$;

-- Personne d'autre que les rôles prévus n'exécute ces fonctions (les droits sont donnés par jeu/src/base/roles.ts).
REVOKE ALL ON FUNCTION module_courant(), joueur_courant(), jeton_courant(), cloison_mes_cercles(),
  cloison_mes_membres(), cloison_mes_proches(), cloison_mes_invitations(), cloison_cercles_invitation(),
  cloison_invitants_membres(), cloison_invitants_joueurs(), cloison_reponses_offertes(), cloison_peut_entrer(uuid),
  membre_avant_entree(), joueur_avant_pseudo(), reponse_avant_ecriture(), meme_cercle(), oublier_scores(uuid) FROM PUBLIC;

-- ---------------------------------------------------------------------------------------------------------------
-- Les règles, table par table. « (SELECT f()) » est calculé une fois par requête.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['texte', 'calendrier', 'carte_accord', 'joueur', 'identite', 'session',
    'connexion_en_cours', 'code_retour', 'code_email', 'consentement', 'cercle', 'membre', 'invitation', 'reponse',
    'manche', 'carte', 'journee_cercle', 'compte_semaine', 'compte_texte_cercle', 'titre', 'temperament',
    'portrait_dimanche', 'vu', 'repondre_ouvert', 'reprise_revelation', 'abonnement', 'message_coupe', 'envoi',
    'compte_aucune', 'compteur', 'histogramme_raison', 'total_mesure', 'effacement']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE %I FROM PUBLIC', t);
  END LOOP;
END $$;

-- Le ménage (effacement à la demande, échéances) voit et efface tout ce qui porte une donnée de joueur.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['joueur', 'identite', 'session', 'connexion_en_cours', 'code_retour', 'code_email',
    'consentement', 'cercle', 'membre', 'invitation', 'reponse', 'manche', 'carte', 'journee_cercle',
    'compte_semaine', 'compte_texte_cercle', 'titre', 'temperament', 'portrait_dimanche', 'vu', 'repondre_ouvert',
    'reprise_revelation', 'abonnement', 'message_coupe', 'envoi', 'effacement']
  LOOP
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (module_courant() = ''menage'') WITH CHECK (module_courant() = ''menage'')',
      t || '_menage', t);
  END LOOP;
END $$;

-- Le contenu public.
CREATE POLICY texte_lecture ON texte FOR SELECT USING (module_courant() IN ('jeu', 'menage', 'proprietaire'));
CREATE POLICY texte_proprietaire ON texte FOR ALL USING (module_courant() = 'proprietaire') WITH CHECK (module_courant() = 'proprietaire');
CREATE POLICY calendrier_lecture ON calendrier FOR SELECT USING (module_courant() IN ('jeu', 'menage', 'mesures', 'proprietaire'));
CREATE POLICY calendrier_proprietaire ON calendrier FOR ALL USING (module_courant() = 'proprietaire') WITH CHECK (module_courant() = 'proprietaire');
CREATE POLICY carte_accord_lecture ON carte_accord FOR SELECT USING (module_courant() IN ('jeu', 'menage', 'proprietaire', 'cloison'));
CREATE POLICY carte_accord_proprietaire ON carte_accord FOR ALL USING (module_courant() = 'proprietaire') WITH CHECK (module_courant() = 'proprietaire');

-- joueur : soi, ses proches (pseudo), son invitant (le visage du bandeau « Défi de Thomas »).
CREATE POLICY joueur_jeu_lecture ON joueur FOR SELECT USING (module_courant() = 'jeu' AND (
  id = joueur_courant() OR ARRAY[id] <@ (SELECT cloison_mes_proches()) OR ARRAY[id] <@ (SELECT cloison_invitants_joueurs())));
CREATE POLICY joueur_jeu_creation ON joueur FOR INSERT WITH CHECK (module_courant() = 'jeu' AND id = joueur_courant() AND etat = 'provisoire');
CREATE POLICY joueur_jeu_maj ON joueur FOR UPDATE USING (module_courant() = 'jeu' AND id = joueur_courant())
  WITH CHECK (module_courant() = 'jeu' AND id = joueur_courant());
CREATE POLICY joueur_comptes_lecture ON joueur FOR SELECT USING (module_courant() = 'comptes');
CREATE POLICY joueur_comptes_maj ON joueur FOR UPDATE USING (module_courant() = 'comptes') WITH CHECK (module_courant() = 'comptes');
CREATE POLICY joueur_comptes_provisoire ON joueur FOR DELETE USING (module_courant() = 'comptes' AND etat = 'provisoire');
CREATE POLICY joueur_cloison ON joueur FOR SELECT USING (module_courant() = 'cloison');

-- Identités, sessions, connexions en cours, codes : le module des comptes seul (P-01).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['identite', 'session', 'connexion_en_cours', 'code_retour', 'code_email']
  LOOP
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (module_courant() = ''comptes'') WITH CHECK (module_courant() = ''comptes'')',
      t || '_comptes', t);
  END LOOP;
END $$;

-- consentement : le sien.
CREATE POLICY consentement_jeu_lecture ON consentement FOR SELECT USING (module_courant() = 'jeu' AND joueur_id = joueur_courant());
CREATE POLICY consentement_jeu_creation ON consentement FOR INSERT WITH CHECK (module_courant() = 'jeu' AND joueur_id = joueur_courant());
CREATE POLICY consentement_cloison ON consentement FOR SELECT USING (module_courant() = 'cloison');

-- cercle : les siens ; celui d'une invitation à lui (ou dont il tient le jeton) ; en créer un.
CREATE POLICY cercle_jeu_lecture ON cercle FOR SELECT USING (module_courant() = 'jeu' AND (
  ARRAY[id] <@ (SELECT cloison_mes_cercles()) OR ARRAY[id] <@ (SELECT cloison_cercles_invitation())));
CREATE POLICY cercle_jeu_creation ON cercle FOR INSERT WITH CHECK (module_courant() = 'jeu' AND joueur_courant() IS NOT NULL);
CREATE POLICY cercle_jeu_maj ON cercle FOR UPDATE USING (module_courant() = 'jeu' AND ARRAY[id] <@ (SELECT cloison_mes_cercles()))
  WITH CHECK (module_courant() = 'jeu' AND ARRAY[id] <@ (SELECT cloison_mes_cercles()));
CREATE POLICY cercle_cloison ON cercle FOR SELECT USING (module_courant() = 'cloison');

-- membre : les siens, ceux de ses cercles, et son invitant ; entrer (créateur, ou lien lié à lui) ; partir.
-- (Voir ses propres places est aussi ce qui permet « INSERT … ON CONFLICT » : PostgreSQL y vérifie que la ligne
-- nouvelle est lisible.)
CREATE POLICY membre_jeu_lecture ON membre FOR SELECT USING (module_courant() = 'jeu' AND (
  joueur_id = joueur_courant() OR ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles())
  OR ARRAY[id] <@ (SELECT cloison_invitants_membres())));
CREATE POLICY membre_jeu_entree ON membre FOR INSERT WITH CHECK (module_courant() = 'jeu' AND joueur_id = joueur_courant()
  AND cloison_peut_entrer(cercle_id));
CREATE POLICY membre_jeu_depart ON membre FOR DELETE USING (module_courant() = 'jeu' AND joueur_id = joueur_courant());
CREATE POLICY membre_cloison ON membre FOR SELECT USING (module_courant() = 'cloison');

-- invitation : celles de ses cercles ; la sienne ; celle dont il tient le jeton, pas encore liée.
CREATE POLICY invitation_jeu_lecture ON invitation FOR SELECT USING (module_courant() = 'jeu' AND (
  ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles())
  OR invite_joueur_id = joueur_courant()
  OR (lie_le IS NULL AND empreinte_jeton = jeton_courant())));
CREATE POLICY invitation_jeu_creation ON invitation FOR INSERT WITH CHECK (module_courant() = 'jeu' AND sorte = 'invite'
  AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()) AND ARRAY[invitant_membre_id] <@ (SELECT cloison_mes_membres())
  AND lie_le IS NULL AND invite_joueur_id IS NULL);
CREATE POLICY invitation_jeu_liaison ON invitation FOR UPDATE USING (module_courant() = 'jeu' AND (
  invite_joueur_id = joueur_courant() OR (lie_le IS NULL AND empreinte_jeton = jeton_courant())))
  WITH CHECK (module_courant() = 'jeu' AND invite_joueur_id = joueur_courant());
CREATE POLICY invitation_proprietaire ON invitation FOR INSERT WITH CHECK (module_courant() = 'proprietaire' AND sorte = 'createur');
CREATE POLICY invitation_cloison ON invitation FOR SELECT USING (module_courant() = 'cloison');
CREATE POLICY invitation_cloison_score ON invitation FOR UPDATE USING (module_courant() = 'cloison') WITH CHECK (module_courant() = 'cloison');

-- reponse : les siennes ; celles de ses proches (le serveur en tire cartes, avis du cercle… et n'envoie au téléphone
-- que ce que les règles montrent, P-26, P-27) ; les réponses d'entrée de son invitant, par un lien lié à lui.
CREATE POLICY reponse_jeu_lecture ON reponse FOR SELECT USING (module_courant() = 'jeu' AND (
  joueur_id = joueur_courant() OR ARRAY[joueur_id] <@ (SELECT cloison_mes_proches())
  OR ARRAY[joueur_id::text || ':' || texte_id] <@ (SELECT cloison_reponses_offertes())));
CREATE POLICY reponse_jeu_creation ON reponse FOR INSERT WITH CHECK (module_courant() = 'jeu' AND joueur_id = joueur_courant());

-- Les tables d'un cercle : celles de ses cercles seulement.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['manche', 'carte', 'journee_cercle', 'compte_semaine', 'compte_texte_cercle', 'titre']
  LOOP
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (module_courant() = ''jeu'' AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()))',
      t || '_jeu_lecture', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (module_courant() = ''jeu'' AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()))',
      t || '_jeu_creation', t);
    IF t <> 'titre' THEN -- un titre est figé
      EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (module_courant() = ''jeu'' AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles())) WITH CHECK (module_courant() = ''jeu'' AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()))',
        t || '_jeu_maj', t);
    END IF;
  END LOOP;
END $$;

-- temperament : ceux de ses cercles (L'Original, Le Pont) et ceux de ses proches (Le Mesuré, Le Tranché).
CREATE POLICY temperament_jeu ON temperament FOR ALL USING (module_courant() = 'jeu' AND (
  (cercle_id IS NOT NULL AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()))
  OR (joueur_id IS NOT NULL AND ARRAY[joueur_id] <@ (SELECT cloison_mes_proches()))))
  WITH CHECK (module_courant() = 'jeu' AND (
  (cercle_id IS NOT NULL AND ARRAY[cercle_id] <@ (SELECT cloison_mes_cercles()))
  OR (joueur_id IS NOT NULL AND ARRAY[joueur_id] <@ (SELECT cloison_mes_proches()))));

-- Ce qui n'est qu'à soi (les droits de chaque table disent ensuite quelles commandes : roles.ts).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['portrait_dimanche', 'vu', 'repondre_ouvert', 'reprise_revelation', 'abonnement', 'message_coupe']
  LOOP
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (module_courant() = ''jeu'' AND joueur_id = joueur_courant()) WITH CHECK (module_courant() = ''jeu'' AND joueur_id = joueur_courant())',
      t || '_jeu', t);
  END LOOP;
END $$;

-- Le message de 18h : l'envoi lit tous les abonnements, retire ceux qu'Apple refuse, écrit les envois (P-22).
CREATE POLICY abonnement_envoi_lecture ON abonnement FOR SELECT USING (module_courant() = 'envoi');
CREATE POLICY abonnement_envoi_retrait ON abonnement FOR DELETE USING (module_courant() = 'envoi');
CREATE POLICY envoi_envoi ON envoi FOR ALL USING (module_courant() = 'envoi') WITH CHECK (module_courant() = 'envoi');
CREATE POLICY message_coupe_envoi ON message_coupe FOR SELECT USING (module_courant() = 'envoi');

-- Le journal des effacements : relu par le porteur après une restauration (P-32).
CREATE POLICY effacement_proprietaire ON effacement FOR SELECT USING (module_courant() = 'proprietaire');
