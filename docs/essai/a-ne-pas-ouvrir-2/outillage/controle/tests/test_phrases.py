"""Phrases attendues, version 2 (schéma 2, partie 5.4) : gabarits de simulation-2, §7.10
et §7.11, puis typographie du §7.8."""

import unittest

import commun
from ec.phrases import phrases_attendues, votes, propose

I, FINE, AP = " ", " ", "’"


class TestPhrases(unittest.TestCase):
    def test_forme(self):
        _, o, d = commun.fabrique()
        p = phrases_attendues(d, o)
        self.assertEqual((p["format"], p["version"]), ("elenchos-essai-phrases", 2))
        self.assertEqual(len(p["textes"]), 18)
        self.assertEqual(p["surprise_arrivee"], "Surprise de la semaine" + I + ": Vaisselle en plastique interdite "
                         "dans les cantines d" + AP + "enfants")
        self.assertIsNone(p["textes"]["14"]["vote"]["2.7d"])
        self.assertIsNotNone(p["textes"]["14"]["vote"]["5.4"])
        self.assertIsNone(p["textes"]["0"]["vote"]["5.4"])
        self.assertEqual(p["textes"]["3"]["vote"]["2.7d"][0], "Et l" + AP + "Assemblée" + FINE + "?")

    def test_gabarits(self):
        v = {"date": "2026-06-11", "etape": "aucune", "issue": "rejete", "objet": "article", "suite": "texte_tombe"}
        self.assertEqual(votes(v, {"2.7d"})["2.7d"][2],
                         f"Le 11{I}juin{I}2026. C{AP}était un article d{AP}un texte plus long. "
                         f"Avec lui, l{AP}Assemblée a rejeté le texte entier.")
        v = {"date": "2025-02-13", "etape": "aucune", "issue": "rejete", "objet": "motion", "suite": None}
        self.assertEqual(votes(v, {"2.7d", "5.4"})["2.7d"][1:],
                         ["Texte rejeté.", f"Le 13{I}février{I}2025, avant même l{AP}examen de ses articles."])
        self.assertEqual(votes(v, {"5.4"})["5.4"], [f"Vote{I}: rejeté le 13{I}février{I}2025, avant même l{AP}examen de ses articles."])
        v = {"date": "2024-10-09", "etape": "navette", "issue": "adopte", "objet": "texte", "suite": None}
        self.assertEqual(votes(v, {"2.7d"})["2.7d"][2], f"Le 9{I}octobre{I}2024. Le Sénat devait encore voter.")
        self.assertEqual(propose({"type": "depute", "nom": "Prénom Nom", "feminin": True, "groupe": None}, True),
                         "Proposé par Prénom Nom, députée sans groupe.")
        self.assertEqual(propose({"type": "commission", "libelle": "commission des affaires sociales"}, False),
                         "Proposé par la commission des affaires sociales.")


if __name__ == "__main__":
    unittest.main()
