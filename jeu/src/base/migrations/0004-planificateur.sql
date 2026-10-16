-- Migration 0004 : le planificateur (étape 1, travail D ; src/serveur/planificateur.ts).
--
-- Une tâche du jour, prise avant d'être faite. Le ménage quotidien (src/base/menage.ts) écrit sa ligne au début de sa
-- propre transaction : un second serveur qui tente le même ménage le même jour (une mise en ligne fait tourner deux
-- conteneurs un moment) attend sur cette ligne, puis voit qu'elle existe et renonce. Le ménage ne tourne donc jamais
-- deux fois en même temps, ni deux fois le même jour, même après un redémarrage ; s'il échoue, la ligne part avec sa
-- transaction et il est retenté au passage suivant. Le message de 18h, lui, a son propre verrou, par abonnement et par
-- soir (`envoi_un_par_soir`, migration 0001).
-- Aucune donnée de joueur. Gardée 7 jours (le ménage).
CREATE TABLE tache_du_jour (
  tache text NOT NULL CHECK (tache IN ('menage')),
  jour date NOT NULL,
  PRIMARY KEY (tache, jour)
);

ALTER TABLE tache_du_jour ENABLE ROW LEVEL SECURITY;
ALTER TABLE tache_du_jour FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE tache_du_jour FROM PUBLIC;
CREATE POLICY tache_du_jour_menage ON tache_du_jour FOR ALL USING (module_courant() = 'menage') WITH CHECK (module_courant() = 'menage');
