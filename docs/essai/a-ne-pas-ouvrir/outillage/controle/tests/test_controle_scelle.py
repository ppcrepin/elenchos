"""Le contrôle du fichier scellé passe sur le candidat, et chaque étape sait échouer
(mutations du candidat, remis en forme canonique sauf pour l'étape 3)."""

import base64
import hashlib
import unittest

import commun
from commun import muter
from ec.controle_scelle import controle_scelle
import controle

DATE = "2026-10-06"


def lancer(octets, **kw):
    return controle_scelle(octets, controle.lire_sources(), kw.pop("date", DATE), **kw)


def etape_en_echec(texte):
    for l in texte.splitlines():
        if "ÉCHEC" in l and l.strip().startswith("Étape"):
            return int(l.strip().split()[1])
    return None


class TestCandidat(unittest.TestCase):
    def test_passe(self):
        texte, v = lancer(commun.candidat_octets())
        self.assertEqual(v["controle1"], "partiel")
        for k in ("controle2", "controle3", "controle4", "annexe_a", "graine"):
            self.assertTrue(v[k], k)
        self.assertIn("Étape 1 (empreinte) : non faite", texte)
        self.assertIn("Étape 2 (données embarquées) : non faite", texte)

    def test_etapes_1_et_2(self):
        o = commun.candidat_octets()
        h = hashlib.sha256(o).hexdigest()
        pres = "\n".join(" ".join(h[16 * l + 4 * g:16 * l + 4 * g + 4] for g in range(4)) for l in range(4)) + "\n"
        page = b"<script>var a=1;/*elenchos-scelle*/\"" + base64.b64encode(o) + b"\";</script>"
        texte, v = lancer(o, empreinte_publiee=pres, page=page)
        # sans le relevé des sources de l'agent qui scelle, le contrôle 1 n'est pas complet (étape 8)
        self.assertEqual(v["controle1"], "partiel")
        self.assertIn("Mêmes sources non comparé (étape 8)", texte)
        releve = {chemin: hashlib.sha256(oct_).hexdigest() for chemin, _, oct_ in controle.lire_sources().values()}
        texte, v = lancer(o, empreinte_publiee=pres, page=page, empreintes_scellement=releve)
        self.assertIs(v["controle1"], True)
        self.assertIn("Contrôle 1 : complet, huit étapes passées", texte)
        cle = next(c for c in releve if c.endswith("simulation.md"))
        autre = dict(releve, **{cle: "0" * 64})
        texte, v = lancer(o, empreinte_publiee=pres, page=page, empreintes_scellement=autre)
        self.assertEqual(etape_en_echec(texte), 8)
        self.assertIn("simulation.md : agent qui scelle", texte)
        ent = {"version_page": 1, "consultes_le": "2026-10-05", "empreinte": h,
               "empreinte_publiee_le": "2026-10-06", "empreinte_publiee_a": "15:13"}
        texte, v = lancer(o, empreinte_publiee=pres, page=page, empreintes_scellement=releve, entrees_construction=ent)
        self.assertIs(v["entrees_construction"], True)
        self.assertTrue(texte.splitlines()[-1].startswith("Verdict : aucun défaut"))
        texte, v = lancer(o, empreinte_publiee=pres, page=page, empreintes_scellement=releve,
                          entrees_construction=dict(ent, empreinte="0" * 64))
        self.assertIs(v["entrees_construction"], False)
        self.assertIn("DÉFAUT", texte.splitlines()[-1])
        texte, v = lancer(o, empreinte_publiee=pres.replace(h[0], "0" if h[0] != "0" else "1", 1))
        self.assertEqual(etape_en_echec(texte), 1)
        texte, v = lancer(o, page=page + b"/*elenchos-scelle*/")
        self.assertEqual(etape_en_echec(texte), 2)
        texte, v = lancer(o, page=page.replace(b"\";</script>", b"=\";</script>"))
        self.assertEqual(etape_en_echec(texte), 2)


class TestMutations(unittest.TestCase):
    def verifier(self, octets, etape=None, controle_=None, contient=None):
        texte, v = lancer(octets)
        if etape is not None:
            self.assertEqual(etape_en_echec(texte), etape, texte[-2000:])
        if controle_ is not None:
            self.assertFalse(v[controle_], texte[-3000:])
        if contient:
            self.assertIn(contient, texte)
        return texte

    def test_etape3_espace(self):
        o = commun.candidat_octets()
        self.verifier(o.replace(b'"format":', b'"format": ', 1), etape=3)

    def test_etape3_ordre_des_cles(self):
        o = commun.candidat_octets()
        self.verifier(b'{"version":4,' + o[1:-len(b',"version":4}')] + b"}", etape=3)

    def test_etape4(self):
        self.verifier(muter(lambda d: d.__setitem__("version", 3)), etape=4)
        self.verifier(muter(lambda d: d["textes"]["5"]["vote"].__setitem__("date", "2025-02-29")), etape=4)
        self.verifier(muter(lambda d: d["textes"]["5"]["vote"].__setitem__("date", "2026-10-07")), etape=4)
        self.verifier(muter(lambda d: d["textes"]["5"].__setitem__("lien_scrutin", "https://exemple.fr/x")), etape=4)
        self.verifier(muter(lambda d: d["textes"]["5"].__setitem__("bonus", 1)), etape=4)
        self.verifier(muter(lambda d: d["reponses"]["5"]["Agathe"].__setitem__("niveau", True)), etape=4)
        self.verifier(muter(lambda d: d["textes"]["5"].__setitem__("titre", "été")), etape=4)

    def test_etape5(self):
        def echanger(d):
            c = d["textes"]["7"]["considerations"]
            c[0], c[1] = c[1], c[0]
        self.verifier(muter(echanger), etape=5)
        self.verifier(muter(lambda d: d["textes"]["7"]["considerations"][0]["depute"].__setitem__(
            "groupe", d["textes"]["7"]["considerations"][1]["depute"]["groupe"])), etape=5)
        self.verifier(muter(lambda d: d["textes"]["7"]["considerations"][0].__setitem__(
            "texte", "« Citation.")), etape=5)
        self.verifier(muter(lambda d: d["textes"]["7"]["considerations"][0].__setitem__(
            "texte", "Citation » ?")), etape=5)
        self.verifier(muter(lambda d: d["textes"]["7"]["considerations"][0].__setitem__(
            "texte", "Sans ponctuation")), etape=5)
        self.verifier(muter(lambda d: d["textes"]["7"]["vote"].__setitem__("etape", "aucune")), etape=5)
        self.verifier(muter(lambda d: d["absences"]["Agathe"].append("7")), etape=5)
        self.verifier(muter(lambda d: d["personnages"]["Odile"].__setitem__("heure_de_jeu", "09:11")), etape=5)
        self.verifier(muter(lambda d: d["cercle"].__setitem__("nom", "Famille")), etape=5)
        self.verifier(muter(lambda d: d["vecteurs_test"][0].__setitem__("n", 1)), etape=5)
        def groupe_inconnu(d):
            d["textes"]["1"]["considerations"][0]["depute"]["groupe"] = "XYZ"
        self.verifier(muter(groupe_inconnu), etape=5)
        def elision(d):
            for t in d["textes"].values():
                for c in t["considerations"]:
                    if c["depute"]["nom"] == "Ian Boucard":
                        c["depute"]["elision"] = True
        self.verifier(muter(elision), etape=5)
        def elision2(d):
            for t in d["textes"].values():
                for c in t["considerations"]:
                    if c["depute"]["nom"] == "Roger Vicot":
                        c["depute"]["elision"] = True
        self.verifier(muter(elision2), etape=5)

    def test_etape6(self):
        def vect(d):
            v = d["vecteurs_test"][1]
            v["hex8"] = "00000001"
            v["n"] = 1
        self.verifier(muter(vect), etape=6)

    def test_etape7(self):
        self.verifier(muter(lambda d: d["textes"]["5"].__setitem__("titre", d["textes"]["5"]["titre"] + " l\u2019x")), etape=7)
        self.verifier(muter(lambda d: d["textes"]["5"]["lignes"].__setitem__(0, "Il y a 2027 300 communes.")), etape=7)
        self.verifier(muter(lambda d: d["textes"]["5"]["lignes"].__setitem__(0, "Question?")), etape=7)
        self.verifier(muter(lambda d: d["textes"]["5"]["lignes"].__setitem__(0, "20% des cas.")), etape=7)

    def test_etape8(self):
        self.verifier(muter(lambda d: d["textes"]["7"]["considerations"][0].__setitem__("pole", "aucun")), etape=8)
        self.verifier(muter(lambda d: d["textes"]["7"].__setitem__("sens", 0)), etape=8)
        self.verifier(muter(lambda d: d["textes"]["7"]["lignes"].__setitem__(2, "Autre ligne.")), etape=8)
        self.verifier(muter(lambda d: d["textes"]["7"]["vote"].__setitem__("date", "2023-05-05")), etape=8)
        self.verifier(muter(lambda d: d["textes"]["7"]["sources"].append(d["textes"]["7"]["sources"][0])), etape=8)
        def ordre(d):
            # deux raisons échangées, rangs refaits : seule l'étape 8 peut le voir
            c = d["textes"]["9"]["considerations"]
            c[0], c[1] = c[1], c[0]
            c[0]["rang"], c[1]["rang"] = 1, 2
        self.verifier(muter(ordre), etape=8)

    def test_controle3(self):
        def rep(d):
            r = d["reponses"]["4"]["Odile"]
            r["niveau"] = 5 if r["niveau"] != 5 else 4
        t = self.verifier(muter(rep), controle_="controle3", contient="/reponses/4/Odile")
        self.assertIn("E = ", t)
        self.assertIn("candidates", t)
        def cote(d):
            d["reponses_atypiques"]["Agathe"][0]["cote_tire"] = -1
        self.verifier(muter(cote), controle_="controle3")

    def test_controle2(self):
        def prof(d):
            d["personnages"]["Agathe"]["profil"]["S"]["position"] = 66
        self.verifier(muter(prof), controle_="controle2")


if __name__ == "__main__":
    unittest.main()


class TestLectureFiches(unittest.TestCase):
    def lancer_avec(self, cle, remplacer, par):
        srcs = dict(controle.lire_sources())
        chemin, texte, o = srcs[cle]
        self.assertIn(remplacer, texte)
        t2 = texte.replace(remplacer, par, 1)
        srcs[cle] = (chemin, t2, t2.encode("utf-8"))
        return controle_scelle(commun.candidat_octets(), srcs, DATE)

    def test_auteur_mal_forme(self):
        texte, v = self.lancer_avec("S", "- Auteur : Laure Miller, députée, EPR ;", "- Auteur : Laure Miller députée, EPR ;")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_tension_absente(self):
        texte, v = self.lancer_avec("L", "- Tension : L ; sens s = 0\n", "")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_raison_mal_formee(self):
        texte, v = self.lancer_avec("P", "— contre · pôle 1 — Philippe Juvin", "— contre · pole 1 — Philippe Juvin")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_titre_repete(self):
        texte, v = self.lancer_avec("T", "- Titre : Vote par liste dans les petites communes\n",
                                    "- Titre : Vote par liste dans les petites communes\n- Titre : X\n")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_fiche_en_double(self):
        texte, v = self.lancer_avec("T", "### Réserve · scrutin 3334 (16e législature)", "### 6 · scrutin 3334 (16e législature)")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_vote_different(self):
        texte, v = self.lancer_avec("votes", "| 5 | 17e, 6045 | adopte | 2026-04-08 | navette |",
                                    "| 5 | 17e, 6045 | adopte | 2026-04-08 | definitif |")
        self.assertEqual(etape_en_echec(texte), 8)

    def test_groupe_du_tableau(self):
        texte, v = self.lancer_avec("schema", "| `UDR` | Assemblée | 17 |", "| `UDDPLR` | Assemblée | 17 |")
        self.assertEqual(etape_en_echec(texte), 5)

    def test_fiche_personnage(self):
        texte, v = self.lancer_avec("simulation", "| 9h10 |", "| 09h10 |")
        self.assertEqual(etape_en_echec(texte), 5)

    def test_profils(self):
        texte, v = self.lancer_avec("profils", "| Odile | 0,10 forte |", "| Odile | 0,11 forte |")
        self.assertFalse(v["controle2"])
        texte, v = self.lancer_avec("profils", "| Odile | 10 |", "| Odile | 9 |")
        self.assertFalse(v["controle4"])


class TestZs(unittest.TestCase):
    def test_etape7_zs(self):
        for ch in (" ", "\u00a0", "\u202f", " "):
            texte, v = lancer(muter(lambda d: d["textes"]["5"].__setitem__("titre", "Avant" + ch + "après")))
            self.assertEqual(etape_en_echec(texte), 7, repr(ch))
