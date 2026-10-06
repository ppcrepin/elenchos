"""Rejeu : déterminisme, schéma fermé, gabarit du carnet, variantes (contrôle 12),
validité du journal (partie 3.12), heure de Paris."""

import copy
import datetime as dt
import unittest

import commun
import generer
from ec import canon
from ec.carnet import verifier_gabarit, masquer_durees, duree, liste_noms
from ec.comparer import comparer_variantes, comparer_traces, differences
from ec.heure import decalage_utc, lire_instant
from ec.journal import valider
from ec.rejeu import Rejeu
from ec.tirage import sha256_hex
from ec.trace_schema import valider_trace

D = commun.candidat()
O = commun.candidat_octets()
H = sha256_hex(O)


def rejouer(j, du=None):
    e = valider(j, D, H)
    if e:
        raise AssertionError(f"journal invalide : {e[:3]}")
    R = Rejeu(D, O, j, du)
    t = R.trace()
    return t, R.defauts


class TestProprietes(unittest.TestCase):
    def test_parties_au_hasard(self):
        for g in range(60):
            kw = {}
            if g % 4 == 1:
                kw["arret_k"] = g % 15
            if g % 6 == 3:
                kw["mode"] = "moteur"
            j = generer.journal(D, g, **kw)
            du = generer.durees(j, g) if j["partie"]["mode"] == "interface" else None
            t, defauts = rejouer(j, du)
            self.assertEqual(defauts, [], g)
            self.assertEqual(valider_trace(t), [], g)
            if t["carnet"] is not None:
                self.assertEqual(verifier_gabarit(t["carnet"]["texte"], "Témoin-b-4821-k"), [], g)
                for c in t["copies"]:
                    self.assertEqual(verifier_gabarit(c["texte"], "Témoin-b-4821-k"), [], g)
            else:
                self.assertEqual(j["partie"]["mode"], "moteur")
                self.assertEqual(t["copies"], [])
            # déterminisme : mêmes entrées, mêmes octets
            t2, _ = rejouer(copy.deepcopy(j), copy.deepcopy(du))
            self.assertEqual(canon.octets_canoniques(t), canon.octets_canoniques(t2))
            # la trace contient les entrées telles que le journal les donne
            for s, js in zip(t["seances"], j["seances"]):
                for cle in ("k", "ouverture", "versions", "etapes", "coups"):
                    self.assertEqual(s[cle], js[cle])

    def test_personnages_ne_dependent_pas_du_joueur(self):
        j = generer.journal(D, 7)
        t, _ = rejouer(j)
        j2 = copy.deepcopy(j)
        for s in j2["seances"]:
            if s["coups"]["reponse"]:
                s["coups"]["reponse"]["niveau"] = 6 - s["coups"]["reponse"]["niveau"]
        t2, _ = rejouer(j2)
        for k in range(2, 15):
            m1, m2 = t["seances"][k]["manches"]["porteur"], t2["seances"][k]["manches"]["porteur"]
            self.assertEqual(m1, m2)  # ses cartes ne dépendent que du fichier

    def test_masque_et_comparaison(self):
        j = generer.journal(D, 11)
        t, _ = rejouer(j, generer.durees(j, 1))
        t2, _ = rejouer(j, generer.durees(j, 2))
        ok, diffs = comparer_traces(t, t2)
        # seules les durées et les textes de carnet qui les écrivent diffèrent
        self.assertTrue(all(p.endswith("/texte") for p, _, _ in diffs), diffs[:3])
        self.assertEqual(masquer_durees(t["carnet"]["texte"]), masquer_durees(t2["carnet"]["texte"]))
        t3 = copy.deepcopy(t)
        t3["seances"][5]["manches"]["porteur"]["ordre"][1] = "porteur"
        ok, diffs = comparer_traces(t3, t)
        self.assertFalse(ok)
        self.assertIn("/seances/5/manches/porteur/ordre/1", [p for p, _, _ in diffs])


class TestVariantes(unittest.TestCase):
    """Contrôle 12 : quatre variantes, seules les réponses du joueur changeant."""

    def variantes(self, j):
        def changer(f):
            v = copy.deepcopy(j)
            for s in v["seances"]:
                if s["k"] == 0:
                    for e in s["coups"]["entree"].values():
                        if e["reponse"]:
                            f(e["reponse"])
                elif s["coups"]["reponse"]:
                    f(s["coups"]["reponse"])
            return v
        cyc = {1: 2, 2: 3, 3: 4, 4: "aucune", "aucune": 1}
        v1 = changer(lambda r: r.__setitem__("niveau", 6 - r["niveau"]))
        v2 = changer(lambda r: r.__setitem__("niveau", 3))
        v3 = changer(lambda r: r.__setitem__("raison", cyc[r["raison"]]))
        v4 = copy.deepcopy(j)
        for s in v4["seances"]:
            if 1 <= s["k"] <= 14 and s["coups"]["reponse"] and s["etapes"]["repondre"]:
                s["coups"]["reponse"] = None
                s["attente"] = None
                break
        return [j, v1, v2, v3, v4]

    def test_variantes(self):
        for g in range(12):
            kw = {"arret_k": 9} if g % 3 == 2 else {}
            j = generer.journal(D, 100 + g, toutes_questions=True, **kw)
            du = generer.durees(j, g)
            traces = [rejouer(v, du)[0] for v in self.variantes(j)]
            self.assertEqual(comparer_variantes(traces), [], g)

    def test_variante_detecte_un_ecart(self):
        j = generer.journal(D, 5)
        du = generer.durees(j, 5)
        t, _ = rejouer(j, du)
        t2 = copy.deepcopy(t)
        t2["carnet"]["texte"] = t2["carnet"]["texte"].replace("Jour 3 sur 14\n", "Jour 3 sur 14\nRaison : x.\n", 1)
        self.assertTrue(comparer_variantes([t, t2]))


class TestJournal(unittest.TestCase):
    def base(self):
        return generer.journal(D, 3)

    def regles(self, j):
        return {r for r, _, _ in valider(j, D, H)}

    def test_valide(self):
        self.assertEqual(valider(self.base(), D, H), [])

    def test_regle1(self):
        j = self.base()
        j["version"] = 2
        self.assertIn(1, self.regles(j))
        j = self.base()
        j["empreinte_scelle"] = "0" * 64
        self.assertIn(1, self.regles(j))
        j = self.base()
        j["seances"][3]["coups"]["bonus"] = 1
        self.assertIn(1, self.regles(j))

    def test_regle2(self):
        j = self.base()
        j["partie"]["id"] = "témoin"
        self.assertIn(2, self.regles(j))

    def test_regle3(self):
        j = self.base()
        j["arret"] = {"k": 15, "raison": None, "f2": None, "f1": None}
        self.assertIn(3, self.regles(j))
        j = self.base()
        del j["seances"][4]
        self.assertTrue(self.regles(j))

    def test_regle4(self):
        j = self.base()
        j["seances"][2]["ouverture"] = "2026-03-29T02:30+01:00"
        self.assertIn(4, self.regles(j))
        for s in ("2026-10-25T02:30+02:00", "2026-10-25T02:30+01:00"):
            lire_instant(s)
        with self.assertRaises(ValueError):
            lire_instant("2026-10-25T03:30+02:00")

    def test_regle5(self):
        j = self.base()
        j["seances"][6]["versions"] = [2, 1]
        self.assertIn(5, self.regles(j))

    def test_regle6(self):
        j = self.base()
        j["seances"][0]["coups"]["entree"]["E2"]["pari"] = None
        self.assertIn(6, self.regles(j))
        j = self.base()
        j["seances"][0]["coups"]["pseudo"] = "agathe"
        self.assertIn(6, self.regles(j))
        j = self.base()
        j["seances"][0]["coups"]["pseudo"] = "a  b"
        self.assertIn(6, self.regles(j))

    def trouver(self, j, f):
        for s in j["seances"]:
            if f(s):
                return s
        self.skipTest("cas absent du journal tiré")

    def test_regle7(self):
        j = self.base()
        s = self.trouver(j, lambda s: s["coups"]["deviner"] and len(s["coups"]["deviner"]) >= 2
                         and s["coups"]["deviner"][0]["designe"] is not None)
        s["coups"]["deviner"][1] = {"designe": s["coups"]["deviner"][0]["designe"], "raison": None}
        self.assertIn(7, self.regles(j))
        j = self.base()
        s = self.trouver(j, lambda s: s["coups"]["deviner"])
        s["coups"]["deviner"].append({"designe": None, "raison": None})
        self.assertIn(7, self.regles(j))

    def test_regle8(self):
        j = self.base()
        s = self.trouver(j, lambda s: s["coups"]["deviner"] and s["coups"]["deviner"][0]["designe"] is None)
        s["coups"]["reponse"] = {"niveau": 3, "raison": 1}
        self.assertIn(8, self.regles(j))

    def test_regle9(self):
        j = self.base()
        j["seances"][1]["coups"]["relire"] = 1
        self.assertIn(9, self.regles(j))

    def test_regle10(self):
        j = self.base()
        j["seances"][15]["coups"]["carnet"]["q2"] = "pas_tout"
        self.assertIn(10, self.regles(j))
        j = self.base()
        s = self.trouver(j, lambda s: s["etapes"] and not s["etapes"]["repondre"])
        s["coups"]["carnet"]["q2"] = "pas_tout"
        self.assertIn(10, self.regles(j))
        j = self.base()
        j["seances"][1]["coups"]["carnet"]["q3"] = "titres"
        self.assertIn(10, self.regles(j))
        j = self.base()
        j["seances"][2]["coups"]["carnet"]["q1"] = "aurais_pu"  # pas de révélation à la séance 2
        self.assertIn(10, self.regles(j))

    def test_regle11(self):
        j = self.base()
        j["seances"][0]["attente"] = {"lectures": [{"heure": "10:00"}]}
        self.assertIn(11, self.regles(j))

    def test_regle12(self):
        j = self.base()
        j["seances"][1]["etapes"]["deviner"] = True
        self.assertIn(12, self.regles(j))

    def test_regle13(self):
        j = self.base()
        j["fin"]["f1"] = None
        self.assertIn(13, self.regles(j))

    def test_regle14(self):
        j = self.base()
        s = j["seances"][5]
        j["copies"].append({"k": 5, "coups": copy.deepcopy(s["coups"]), "versions": s["versions"],
                            "etapes": s["etapes"]})
        j["copies"][-1]["coups"]["relire"] = s["coups"]["relire"] + 1
        j["copies"].sort(key=lambda c: c["k"])
        self.assertIn(14, self.regles(j))


class TestHeure(unittest.TestCase):
    def test_contre_zoneinfo(self):
        try:
            from zoneinfo import ZoneInfo
            z = ZoneInfo("Europe/Paris")
        except Exception:
            self.skipTest("base de fuseaux absente")
        u = dt.datetime(2026, 1, 1)
        while u < dt.datetime(2027, 12, 31):
            off = u.replace(tzinfo=dt.timezone.utc).astimezone(z).utcoffset()
            self.assertEqual(decalage_utc(u), off.total_seconds() // 60, u)
            u += dt.timedelta(minutes=30)

    def test_formes(self):
        self.assertEqual(duree(42), "0 min 42 s")
        self.assertEqual(duree(125 * 60 + 3), "125 min 03 s")
        self.assertEqual(liste_noms(["Agathe"]), "Agathe")
        self.assertEqual(liste_noms(["Agathe", "porteur"]), "Agathe et vous")
        self.assertEqual(liste_noms(["Agathe", "Nassim", "Odile"]), "Agathe, Nassim et Odile")
        self.assertEqual(liste_noms([]), "pas attribué")


if __name__ == "__main__":
    unittest.main()
