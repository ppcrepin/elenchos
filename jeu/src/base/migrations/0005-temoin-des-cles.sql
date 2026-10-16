-- Migration 0005 : le témoin des clés (16 octobre 2026 ; src/base/temoin.ts ; CONTRAT.md, 2.17 ;
-- DECISIONS-TECHNIQUES 1.7).
--
-- CLE_REPONSES ouvre les réponses chiffrées ; CLE_IDENTITES retrouve les comptes. Aucune des deux ne change pendant le
-- test. Si elles disparaissaient des réglages par erreur, puis que de nouvelles valeurs prenaient leur place (tirées
-- de nouveau sur la page /preparer, par exemple), le serveur démarrerait avec des clés qui n'ouvrent rien : les
-- réponses deviendraient illisibles et les comptes introuvables, sans que rien ne le dise.
--
-- Le témoin l'empêche. Au premier démarrage normal, le serveur range ici une empreinte de chacune des deux clés ; à
-- chaque démarrage suivant, il la recalcule et refuse de démarrer si elle ne correspond plus. L'empreinte est tirée
-- de la clé par une fonction à sens unique (HKDF-SHA-256, avec une étiquette propre au témoin : crypto.ts,
-- temoinDeCle) : elle ne permet pas de retrouver la clé.
--
-- Aucune donnée de joueur. Lue et écrite par le propriétaire seul, au démarrage : aucun module n'y a de droit, et la
-- règle ci-dessous la cache aussi aux modules du repli. Gardée jusqu'à la fin du test : elle part avec la base.
CREATE TABLE temoin_cle (
  cle text PRIMARY KEY CHECK (cle IN ('CLE_REPONSES', 'CLE_IDENTITES')),
  empreinte text NOT NULL CHECK (empreinte ~ '^[0-9a-f]{64}$')
);

ALTER TABLE temoin_cle ENABLE ROW LEVEL SECURITY;
ALTER TABLE temoin_cle FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE temoin_cle FROM PUBLIC;
CREATE POLICY temoin_cle_proprietaire ON temoin_cle FOR ALL USING (module_courant() = 'proprietaire') WITH CHECK (module_courant() = 'proprietaire');
