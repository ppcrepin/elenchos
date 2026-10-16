-- Migration 0003 : les totaux, écrits sans être lus, lus seulement au-dessus des seuils.
--
-- ÉCRIRE SANS LIRE (P-22). Le module du jeu ajoute à un total par une fonction ; il n'a aucun droit sur les tables de
-- totaux. Une réponse ajoute 1 au compte de son texte, et 1 à « aucune » si sa raison était « aucune » : c'est le seul
-- calcul qui réunit plusieurs cercles, permis par D-027 et P-28. Un compte ne recule jamais : effacer un joueur ne
-- le change pas, pour qu'on ne puisse pas retrouver une raison par différence (P-23).
--
-- LIRE AU-DESSUS DES SEUILS (P-21, P-23, P-39 a). Le module des mesures ne lit que des vues : la part de « aucune »
-- d'un texte après sa révélation et au-dessus de 30 réponses ; les totaux des mesures au-dessus de 10 apports, et de
-- 30 pour les trois comptes de mi-bêta. Les vues appartiennent au propriétaire ; les règles de cloisonnement des
-- tables lues s'y appliquent quand même (FORCE), au module qui lit.

CREATE FUNCTION compter_reponse(p_texte text, p_aucune boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'totaux', true);
  INSERT INTO compte_aucune (texte_id, reponses, aucune) VALUES (p_texte, 1, CASE WHEN p_aucune THEN 1 ELSE 0 END)
    ON CONFLICT (texte_id) DO UPDATE SET reponses = compte_aucune.reponses + 1,
      aucune = compte_aucune.aucune + EXCLUDED.aucune;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
END $$;

CREATE FUNCTION ajouter_compteur(p_sorte text, p_jour date) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'totaux', true);
  INSERT INTO compteur (sorte, jour, nombre) VALUES (p_sorte, p_jour, 1)
    ON CONFLICT (sorte, jour) DO UPDATE SET nombre = compteur.nombre + 1;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
END $$;

CREATE FUNCTION ajouter_histogramme(p_semaine date, p_tranche smallint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'totaux', true);
  INSERT INTO histogramme_raison (semaine, tranche, nombre) VALUES (p_semaine, p_tranche, 1)
    ON CONFLICT (semaine, tranche) DO UPDATE SET nombre = histogramme_raison.nombre + 1;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
END $$;

CREATE FUNCTION ajouter_mesure(p_periode date, p_sorte text, p_numerateur bigint, p_denominateur bigint) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path FROM CURRENT AS $$
DECLARE ancien text := current_setting('elenchos.module', true);
BEGIN
  PERFORM set_config('elenchos.module', 'totaux', true);
  INSERT INTO total_mesure (periode, sorte, numerateur, denominateur, effectif)
    VALUES (p_periode, p_sorte, p_numerateur, p_denominateur, 1)
    ON CONFLICT (periode, sorte) DO UPDATE SET numerateur = total_mesure.numerateur + EXCLUDED.numerateur,
      denominateur = total_mesure.denominateur + EXCLUDED.denominateur, effectif = total_mesure.effectif + 1;
  PERFORM set_config('elenchos.module', coalesce(ancien, ''), true);
END $$;

REVOKE ALL ON FUNCTION compter_reponse(text, boolean), ajouter_compteur(text, date), ajouter_histogramme(date, smallint),
  ajouter_mesure(date, text, bigint, bigint) FROM PUBLIC;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['compte_aucune', 'compteur', 'histogramme_raison', 'total_mesure']
  LOOP
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (module_courant() = ''totaux'') WITH CHECK (module_courant() = ''totaux'')', t || '_totaux', t);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (module_courant() = ''mesures'')', t || '_mesures', t);
  END LOOP;
END $$;

-- Le texte du jour de jeu d s'ouvre à 18h le jour d − 1, se ferme à 18h le jour d et se révèle à 18h le jour d + 1,
-- heure de Paris (regles.md §2 ; CONTRAT.md, partie 3 ; fin_du_jour_de_jeu, migration 0002). Les textes d'entrée n'ont
-- pas de jour : ils n'y sont pas.
CREATE VIEW mesure_aucune WITH (security_barrier) AS
  SELECT a.texte_id, a.reponses, a.aucune
    FROM compte_aucune a JOIN calendrier c ON c.texte_id = a.texte_id
   WHERE a.reponses >= 30
     AND fin_du_jour_de_jeu(c.jour + 1) <= instant_du_jeu();

CREATE VIEW mesure_totaux WITH (security_barrier) AS
  SELECT periode, sorte, numerateur, denominateur, effectif
    FROM total_mesure
   WHERE effectif >= CASE WHEN sorte IN ('justesse_cartes', 'justesse_hasard', 'mystere_nouveaux') THEN 10 ELSE 30 END;

CREATE VIEW mesure_compteurs WITH (security_barrier) AS
  SELECT sorte, jour, nombre FROM compteur;

CREATE VIEW mesure_histogramme WITH (security_barrier) AS
  SELECT semaine, tranche, nombre FROM histogramme_raison;

REVOKE ALL ON mesure_aucune, mesure_totaux, mesure_compteurs, mesure_histogramme FROM PUBLIC;
