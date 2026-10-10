"""Contrôle 1 (schéma 2, partie 5.1) sur le fichier de test, puis sur des mutations :
chaque défaut doit arrêter le contrôle à l'étape prévue."""

import re
import unittest

import commun
from ec import calendrier, sources
from ec.controle_scelle import controle1, defauts_d034

B = [7922, 8167, 6770, 5359]


def lancer(octets=None, srcs=None, **kw):
    _, o, _ = commun.fabrique()
    srcs = srcs or commun.sources_test()
    kw.setdefault("scrutins_b", B)
    kw.setdefault("commit_spec", "bd098271689e1cf2c4492ec5ebc1add1e1453d76")
    texte, verdict = controle1(octets or o, srcs, "2026-10-10", tables_source="tables",
                               amo_dossiers=kw.pop("amo", []), **kw)
    return texte, verdict


def etape_en_echec(texte):
    m = re.search(r"Étape (\d) : ÉCHEC", texte)
    return int(m.group(1)) if m else None


class TestTables(unittest.TestCase):
    def test_calendrier_egal_au_tableau_du_schema(self):
        """Le recalcul du §0 redonne la table exigée de la partie 2.4 (lue dans le schéma)."""
        texte = commun.controle.SOURCES["schema"].read_text(encoding="utf-8")
        lignes = sources.lignes_de(texte)
        ent = "| jour | nom_jour | type | saut | revele | revelation_porteur | manche | deviner_porteur | repondu |"
        rangees = sources.tableau_par_entete(lignes, 1, ent, "schema.md")
        cal = calendrier.table_calendrier()
        self.assertEqual(len(rangees), 15)

        def lu(x):
            return None if x == "null" else x

        for (_, cs), o in zip(rangees, cal):
            self.assertEqual(int(cs[0]), o["jour"])
            self.assertEqual(cs[1], o["nom_jour"])
            self.assertEqual(cs[2], o["type"])
            self.assertEqual(lu(cs[3]), None if o["saut"] is None else str(o["saut"]))
            self.assertEqual(lu(cs[4]), o["revele"])
            self.assertEqual(cs[5], o["revelation_porteur"])
            self.assertEqual(lu(cs[6]), o["manche"])
            self.assertEqual(cs[7], "true" if o["deviner_porteur"] else "false")
            self.assertEqual(lu(cs[8]), o["repondu"])

    def test_semaines_egales_au_tableau_du_schema(self):
        texte = commun.controle.SOURCES["schema"].read_text(encoding="utf-8")
        rangees = sources.tableau_par_entete(sources.lignes_de(texte), 1, "| numero | premier_jour | dernier_jour |",
                                             "schema.md")
        att = [(int(a), int(b.replace("−", "-")), int(c.replace("−", "-"))) for _, (a, b, c) in rangees]
        self.assertEqual(att, [(s["numero"], s["premier_jour"], s["dernier_jour"]) for s in calendrier.table_semaines()])

    def test_cercle_egal_au_schema(self):
        texte = commun.controle.SOURCES["schema"].read_text(encoding="utf-8")
        from ec import canon
        self.assertIn("`" + canon.canonique(calendrier.table_cercle()) + "`", texte)


class TestControle1(unittest.TestCase):
    def test_fichier_de_test_passe(self):
        texte, v = lancer()
        self.assertIsNone(etape_en_echec(texte), texte)
        self.assertEqual(v["controle1"], "partiel")      # étapes 1 et 2 non faites, candidat
        self.assertTrue(v["candidat"])
        self.assertTrue(v["graine"])

    def test_avec_amo(self):
        if not commun.AMO:
            self.skipTest("données amo absentes")
        d, _, _ = commun.fabrique()
        import fabriquer_test
        import tempfile
        from pathlib import Path
        d2 = Path(tempfile.mkdtemp(prefix="controle-tests-amo-", dir=commun.SCRATCH))
        o, _ = fabriquer_test.construire(d2, [str(p) for p in commun.AMO], 0)
        srcs = commun.controle.lire_sources(d2 / "textes", d2 / "tables-test.md")
        texte, v = lancer(o, srcs, amo=[str(p) for p in commun.AMO])
        self.assertIsNone(etape_en_echec(texte), texte)
        self.assertIn("amo lu : ", texte)

    def test_graine_differente(self):
        texte, v = lancer(commit_spec="0" * 40)
        self.assertFalse(v["graine"])

    def mute(self, f, etape, motif=None, **kw):
        texte, v = lancer(commun.muter(f), **kw)
        self.assertEqual(etape_en_echec(texte), etape, texte[-1500:])
        if motif:
            self.assertRegex(texte, motif)
        return texte

    def test_version_4(self):
        self.mute(lambda d: d.update(version=4), 4, "version 4")

    def test_statut_inconnu(self):
        self.mute(lambda d: d.update(statut="brouillon"), 4)

    def test_cle_en_trop(self):
        self.mute(lambda d: d.update(inviteuse="Agathe"), 4, "clés en trop")

    def test_facteur_non_permis(self):
        self.mute(lambda d: d["reglage"].update(facteur=5), 4)

    def test_suite_non_permise(self):
        def f(d):
            t = next(t for t in d["textes"].values() if t["vote"]["objet"] == "texte")
            t["vote"]["suite"] = "texte_tombe"
        self.mute(f, 5, "suite")

    def test_combinaison_vote(self):
        def f(d):
            t = next(t for t in d["textes"].values() if t["vote"]["objet"] == "amendement"
                     and t["vote"]["issue"] == "rejete")
            t["vote"]["etape"] = "navette"
        self.mute(f, 5, "combinaison non permise")

    def test_calendrier_modifie(self):
        self.mute(lambda d: d["calendrier"][4].update(deviner_porteur=True), 5, "/calendrier/4")

    def test_semaine_modifiee(self):
        self.mute(lambda d: d["semaines"][0].update(premier_jour=-91), 4)

    def test_cercle_modifie(self):
        self.mute(lambda d: d["cercle"].update(invitant="Agathe"), 5, "/cercle")

    def test_histoire_raisons(self):
        def f(d):
            r = d["histoire"]["textes"]["H5"]["raisons"]
            r[0], r[1] = dict(r[1], rang=1), dict(r[0], rang=2)
        self.mute(f, 5, "/histoire/textes/H5/raisons")

    def test_histoire_fiche_ailleurs(self):
        self.mute(lambda d: d["histoire"]["textes"]["H85"].update(
            fiche=d["histoire"]["textes"]["H86"]["fiche"]), 5, "seul H86")

    def test_d028_trop_peu_de_rejetes(self):
        def f(d):
            for t in d["textes"].values():
                if t["vote"]["issue"] == "rejete" and t["vote"]["objet"] == "amendement":
                    t["vote"].update(issue="adopte", etape="navette")
        self.mute(f, 5, "D-028|A.4")

    def test_d034_deux_inattendues_d_un_cote(self):
        def f(d):
            t = d["textes"]["0"]
            s = t["sens"]
            for c in t["considerations"]:
                if c["cote"] == "pour":
                    c["pole"] = 1 - s
        self.mute(f, 5, "D-034")

    def test_d034_regles(self):
        t = {"sens": 1, "considerations": [{"cote": "pour", "pole": 1}, {"cote": "pour", "pole": "aucun"},
                                           {"cote": "contre", "pole": 0}, {"cote": "contre", "pole": 0}]}
        e, _ = defauts_d034(t)
        self.assertTrue(any("inattendues" in x for x in e))
        t["considerations"][3]["pole"] = 1
        self.assertEqual(defauts_d034(t)[0], [])

    def test_titre_deux_points(self):
        self.mute(lambda d: d["textes"]["3"].update(titre="Un titre : deux points"), 5, "E8")

    def test_titre_h86_trop_long(self):
        self.mute(lambda d: d["histoire"]["textes"]["H86"]["fiche"].update(titre="x" * 61), 5, "E8")

    def test_deux_absences(self):
        def f(d):
            for p in ("Agathe", "Nassim"):
                d["absences"][p] = sorted(set(d["absences"][p]) | {"H40"},
                                          key=lambda t: int(t[1:]) if t.startswith("H") else 100 + int(t))
                d["reponses"]["H40"].pop(p, None)
        self.mute(f, 5, "absences sur H40")

    def test_absence_sur_t14(self):
        def f(d):
            d["absences"]["Odile"] = d["absences"]["Odile"] + ["14"]
            d["reponses"]["14"].pop("Odile")
        self.mute(f, 5, "T14")

    def test_ordre_des_tensions(self):
        self.mute(lambda d: d["textes"]["1"].update(tension="S"), 5, "ordre des tensions")

    def test_groupe_absent_du_tableau(self):
        def f(d):
            d["textes"]["3"]["considerations"][0]["depute"]["groupe"] = "Groupe Imaginaire"
        self.mute(f, 5, "absent du tableau")

    def test_groupes_non_distincts(self):
        def f(d):
            cs = d["textes"]["2"]["considerations"]
            cs[1]["depute"]["groupe"] = cs[0]["depute"]["groupe"]
        self.mute(f, 5, "deux à deux différents")

    def test_typographie(self):
        self.mute(lambda d: d["textes"]["5"]["lignes"].__setitem__(0, "L’Assemblée"), 7, "U\\+2019")

    def test_vecteur(self):
        self.mute(lambda d: d["vecteurs_test"][2].update(cle="ecart-hstar|2|Valentin",
                                                         chaine=d["graine"] + "|ecart-hstar|2|Valentin"), 6)

    def test_ligne_trop_longue(self):
        self.mute(lambda d: d["textes"]["6"]["lignes"].__setitem__(1, "x" * 91), 8, "91 points de code")

    def test_presentation_b(self):
        def f(d):
            for t in d["textes"].values():
                if t["lignes"][2].startswith("Cet amendement supprimerait"):
                    t["lignes"][2] = "Cet amendement supprimerait l'article."
                    break
        self.mute(f, 8, "phrase fixe")

    def test_presentation_b_liste_absente(self):
        texte, v = lancer(scrutins_b=None)
        self.assertIsNone(etape_en_echec(texte))
        self.assertIn("présentation B non vérifiée", texte)

    def test_h86_vote(self):
        self.mute(lambda d: d["histoire"]["textes"]["H86"]["fiche"]["vote"].update(date="2026-06-05"), 8, "H86")

    def test_objet_fiche(self):
        def f(d):
            t = next(t for t in d["textes"].values() if t["vote"]["objet"] == "article"
                     and t["vote"]["issue"] == "adopte")
            t["vote"]["objet"] = "amendement"
        self.mute(f, 8, "Objet du vote")


class TestLecteurFiches(unittest.TestCase):
    lancer = staticmethod(lancer)
    def fiches(self, remplacer):
        d, _, _ = commun.fabrique()
        out = []
        for p in sorted((d / "textes").glob("[SPTL]-*.md")):
            t = p.read_text(encoding="utf-8")
            for a, b in remplacer:
                t = re.sub(a, b, t, count=1, flags=re.M)
            out.append((p.name, t))
        return out

    def test_entete_provisoire_refuse(self):
        with self.assertRaisesRegex(sources.ErreurSource, "en-tête de fiche non reconnu"):
            sources.lire_fiches(self.fiches([(r"^### T3 · scrutin", "### Case S · scrutin")]))

    def test_rang_faux_refuse(self):
        d, _, _ = commun.fabrique()
        srcs = commun.sources_test()
        nom = srcs["S"][0]
        t = srcs["S"][1]
        import re as _re
        rangs = _re.findall(r"^### T([0-9]+) · scrutin", t, flags=_re.M)
        a, b = rangs[1], rangs[2]   # deux cases S échangées
        t2 = _re.sub(rf"^### T{a} · scrutin", "### TXX · scrutin", t, flags=_re.M)
        t2 = _re.sub(rf"^### T{b} · scrutin", f"### T{a} · scrutin", t2, flags=_re.M)
        t2 = t2.replace("### TXX · scrutin", f"### T{b} · scrutin")
        srcs = dict(srcs)
        srcs["S"] = (nom, t2, t2.encode())
        texte, v = lancer(srcs=srcs)
        self.assertEqual(etape_en_echec(texte), 8)

    def test_suffixe_refuse(self):
        with self.assertRaisesRegex(sources.ErreurSource, "en-tête"):
            sources.lire_fiches(self.fiches([(r"^(### T3 · scrutin [0-9]+ \(1[67]e législature\))$",
                                              r"\1 · présentation B")]))

    def test_reserve_et_ecartee_admises(self):
        f = sources.lire_fiches(self.fiches([]))
        self.assertIn("H86", f)
        self.assertEqual(len(f), 19)

    def test_objet_avec_commentaire_refuse(self):
        with self.assertRaisesRegex(sources.ErreurSource, "Objet du vote"):
            sources.lire_fiches(self.fiches([(r"^(- Objet du vote : [a-z]+)$", r"\1 (commentaire)")]))

    def test_groupe_avec_virgules_et_au_depot(self):
        m = sources.RE_AUTEUR_ELU.match("- Auteur : Georges Patient, sénateur, Rassemblement des démocrates, "
                                        "progressistes et indépendants au dépôt.")
        self.assertEqual(m.group(3), "Rassemblement des démocrates, progressistes et indépendants")
        m = sources.RE_AUTEUR_ELU.match("- Auteur : David Valence, député, Renaissance au dépôt ; proposition")
        self.assertEqual(m.group(3), "Renaissance")
        m = sources.RE_AUTEUR_ELU.match("- Auteur : Max Mathiasin, député, Libertés, Indépendants, Outre-mer "
                                        "et Territoires ; premier signataire (l. 17 ; x)")
        self.assertEqual(m.group(3), "Libertés, Indépendants, Outre-mer et Territoires")

    def test_ecriture_groupe(self):
        self.assertEqual(sources.defauts_ecriture_groupe("La France insoumise - Nouveau Front Populaire"), [])
        self.assertEqual(sources.defauts_ecriture_groupe("Démocrate (MoDem et Indépendants)"), [])
        self.assertTrue(sources.defauts_ecriture_groupe("Socialistes (membre de l’intergroupe NUPES)"))
        self.assertTrue(sources.defauts_ecriture_groupe("A -B"))
        self.assertTrue(sources.defauts_ecriture_groupe("A ,B"))
        self.assertTrue(sources.defauts_ecriture_groupe("(A"))
        self.assertTrue(sources.defauts_ecriture_groupe("x" * 71))


if __name__ == "__main__":
    unittest.main()
