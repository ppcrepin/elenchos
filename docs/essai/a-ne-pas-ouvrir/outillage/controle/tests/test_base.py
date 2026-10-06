"""Exemples de la spécification : forme canonique, tirage, typographie, affectation."""

import json
import unittest
from fractions import Fraction as F

import commun  # noqa: F401
from ec import canon, typo
from ec.moteur import affecter, mediane, score
from ec.tirage import Tirage, entier_0_100, choix_parmi_trois


class TestCanon(unittest.TestCase):
    def test_exemple_vecteur(self):
        # schéma, partie 2.6 : le vecteur en forme canonique
        v = {"chaine": "0123456789abcdef|raison|Odile|E2|3", "cle": "raison|Odile|E2|3",
             "hex8": "1a2b3c4d", "n": 439041101}
        self.assertEqual(canon.canonique(v),
                         '{"chaine":"0123456789abcdef|raison|Odile|E2|3","cle":"raison|Odile|E2|3",'
                         '"hex8":"1a2b3c4d","n":439041101}')
        self.assertEqual(int("1a2b3c4d", 16), 439041101)

    def test_exemples_cles(self):
        self.assertEqual(canon.canonique({"vote": {"issue": "rejete", "etape": "aucune", "date": "2025-01-30"}}),
                         '{"vote":{"date":"2025-01-30","etape":"aucune","issue":"rejete"}}')
        self.assertEqual(canon.canonique({"type": "senateur", "nom": "Prénom Nom A", "groupe": "SIGLE-A",
                                          "feminin": True}),
                         '{"feminin":true,"groupe":"SIGLE-A","nom":"Prénom Nom A","type":"senateur"}')
        # « 10 » avant « 2 », « E1 » après « 9 », « porteur » après « Valentin »
        self.assertEqual(canon.canonique({"2": 0, "10": 0, "E1": 0, "9": 0}), '{"10":0,"2":0,"9":0,"E1":0}')
        self.assertEqual(canon.canonique({"porteur": 0, "Valentin": 0}), '{"Valentin":0,"porteur":0}')

    def test_echappements(self):
        self.assertEqual(canon.canonique("a\nb\u0001\"\\/é«"), '"a\\nb\\u0001\\"\\\\/é«"')

    def test_refus(self):
        for o in (b'{"a":1.0}', b'{"a":1,"a":2}', b'\xef\xbb\xbf{}', b'{"a":NaN}', b'{"a":1e3}', b"\xff"):
            with self.assertRaises(canon.ErreurForme):
                canon.lire_strict(o)
        ok, _, _ = canon.est_canonique(b'{"a": 1}')
        self.assertFalse(ok)
        ok, _, _ = canon.est_canonique(b'{"a":-0}')
        self.assertFalse(ok)
        with self.assertRaises(canon.ErreurForme):
            canon.canonique({"a": 2 ** 53})

    def test_fractions(self):
        self.assertEqual([canon.frac(x) for x in (F(3, 20), F(-1, 2), F(1), F(0))], ["3/20", "-1/2", "1", "0"])

    def test_temoin_json(self):
        o = {"b": [1, None, True, "x"], "a": {"é": "«"}}
        self.assertEqual(canon.canonique(o), json.dumps(o, ensure_ascii=False, sort_keys=True,
                                                        separators=(",", ":")))


class TestTirage(unittest.TestCase):
    def test_vecteurs_candidat(self):
        d = commun.candidat()
        tg = Tirage(d["graine"])
        for v in d["vecteurs_test"]:
            self.assertEqual(tg.chaine(v["cle"]), v["chaine"])
            self.assertEqual(tg.n(v["cle"]), v["n"])

    def test_graine(self):
        import hashlib
        h = hashlib.sha256(b"elenchos-essai|graine|7f4d367278ecf07b01ebad883b7ec75cf7840820").hexdigest()
        self.assertEqual(h[:16], "23e3ee6ccdc3fb38")

    def test_egalite_departagee_par_cle(self):
        class T(Tirage):
            def n(self, cle):
                return 7
        t = T("x")
        self.assertEqual(t.plus_petit(["b", "a"], "k|{}"), "a")

    def test_entiers(self):
        self.assertEqual(entier_0_100(0), 0)
        self.assertEqual(entier_0_100(2 ** 32 - 1), 100)
        self.assertEqual(choix_parmi_trois(2 ** 32 - 1), 2)
        self.assertEqual(choix_parmi_trois(0), 0)


class TestTypo(unittest.TestCase):
    def test_regle6(self):
        self.assertEqual(typo.afficher("12 000 euros"), "12\u202f000\u00a0euros")
        self.assertEqual(typo.afficher("15 %"), "15\u202f%")
        self.assertEqual(typo.afficher("300 personnes"), "300\u00a0personnes")
        self.assertEqual(typo.afficher("1 500 000"), "1\u202f500\u202f000")

    def test_regles_1_a_3(self):
        self.assertEqual(typo.afficher("Et l'Assemblée ?"), "Et l\u2019Assemblée\u202f?")
        self.assertEqual(typo.afficher("Ça alors !"), "Ça alors\u202f!")
        self.assertEqual(typo.afficher("« Ça » : a · b ← c"),
                         "«\u00a0Ça\u00a0»\u00a0: a\u00a0· b ←\u00a0c")

    def test_date(self):
        self.assertEqual(typo.date_affichee("2025-03-01"), "1er mars 2025")
        self.assertEqual(typo.date_affichee("2024-10-09"), "9 octobre 2024")
        self.assertEqual(typo.afficher("Le 9 octobre 2024. Le Sénat devait encore voter."),
                         "Le 9\u00a0octobre\u00a02024. Le Sénat devait encore voter.")
        self.assertEqual(typo.afficher("le 1er mars 2025."), "le 1er\u00a0mars\u00a02025.")

    def test_compte_a_rebours(self):
        self.assertEqual(typo.afficher("Révélation dans 0 h 01"), "Révélation dans 0\u00a0h\u00a001")


class TestAffectation(unittest.TestCase):
    def test_lexicographique(self):
        # §3, point 4 : (1, 4, 2) passe avant (2, 1, 3)
        self.assertLess((1, 4, 2), (2, 1, 3))
        cartes = [{"_niveau": 4}, {"_niveau": 4}, {"_niveau": 4}]
        cand = ["A", "B", "C", "D"]
        rangs = {"A": 2, "B": 1, "C": 4, "D": 3}
        cotes = {X: 1 for X in cand}
        perm, total = affecter(cartes, cand, rangs, cotes)
        self.assertEqual(total, 6)
        self.assertEqual([rangs[x] for x in perm], [1, 2, 3])

    def test_score(self):
        self.assertEqual(score(0, 0), 2)
        self.assertEqual(score(1, "inconnu"), 1)
        self.assertEqual(score(1, -1), 0)
        self.assertEqual(score(-1, 0), 1)

    def test_mediane(self):
        self.assertEqual(mediane([F(1), F(0), F(1, 2), F(1, 4)]), F(3, 8))
        self.assertEqual(mediane([F(1), F(0), F(1, 2)]), F(1, 2))
        self.assertIsNone(mediane([]))


if __name__ == "__main__":
    unittest.main()


class TestTypoForme(unittest.TestCase):
    """§7.8, règles 4 et 5 (commit 2c66a93) : reconnues par la forme, espaces jugées
    sur la chaîne de départ, chiffres ASCII seulement."""
    I = "\u00a0"

    def test_regle4(self):
        I = self.I
        self.assertEqual(typo.regle4("Révélation dans 2 h 05"), f"Révélation dans 2{I}h{I}05")
        self.assertEqual(typo.regle4("ouvert 24 h 24"), f"ouvert 24{I}h{I}24")
        self.assertEqual(typo.regle4("1 h 22 h 33"), f"1{I}h{I}22{I}h{I}33")  # suites qui se chevauchent
        self.assertEqual(typo.regle4("2 h 055"), "2 h 055")
        self.assertEqual(typo.regle4("a h 05"), "a h 05")
        self.assertEqual(typo.regle4("2 H 05"), "2 H 05")
        self.assertEqual(typo.regle4("٢ h 05"), "٢ h 05")  # chiffre non ASCII

    def test_regle5(self):
        I = self.I
        self.assertEqual(typo.regle5("Le 9 octobre 2024."), f"Le 9{I}octobre{I}2024.")
        self.assertEqual(typo.regle5("dès le 1er janvier 2027"), f"dès le 1er{I}janvier{I}2027")
        self.assertEqual(typo.regle5("31 février 2026"), f"31{I}février{I}2026")  # la date n'est pas vérifiée
        for s in ("09 octobre 2024", "32 mars 2024", "0 mars 2024", "1 Mars 2024", "9 octobre 20245",
                  "9 octobre 202", "19er mai 2024", "9  octobre 2024"):
            self.assertEqual(typo.regle5(s), s, s)
        self.assertEqual(typo.regle5("x1er mai 2024"), f"x1er{I}mai{I}2024")
