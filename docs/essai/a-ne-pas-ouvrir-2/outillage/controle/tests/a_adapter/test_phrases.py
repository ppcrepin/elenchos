"""Exemples de la simulation et du schéma : phrases du portrait, journée de 18h à
18h, dates du carnet, phrases du vote et de l'auteur (partie 4.5)."""

import datetime as dt
import unittest

import commun
from ec.heure import r_journee, minutes, date_carnet
from ec.portrait import phrase_jour, phrase_semaine
from ec.phrases import votes, auteurs, arguments, phrases_attendues
from ec import canon

F, I, A = "\u202f", "\u00a0", "\u2019"


class TestPortrait(unittest.TestCase):
    def test_fragment5(self):
        self.assertEqual(phrase_jour("penchant", "T", 1), f"Aujourd{A}hui, tu as penché vers le changement.")

    def test_contraction(self):
        self.assertEqual(phrase_jour("tiraille", "T", None),
                         f"Aujourd{A}hui, tu as donné du poids à la tradition comme au changement.")

    def test_quatre_phrases(self):
        self.assertEqual(phrase_jour("arbitrage", "S", 1),
                         f"Aujourd{A}hui, tu as fait passer la liberté avant la sécurité.")
        self.assertEqual(phrase_jour("neutre", "L", None),
                         f"Aujourd{A}hui, tu n{A}as penché ni vers la décision locale ni vers la décision nationale.")
        self.assertEqual(phrase_jour("arbitrage", "P", 1),
                         f"Aujourd{A}hui, tu as fait passer l{A}innovation avant la précaution.")

    def test_semaine(self):
        self.assertEqual(phrase_semaine("difference", "P", 0),
                         "Cette semaine, entre précaution et innovation, tu as le plus souvent choisi la précaution.")
        self.assertEqual(phrase_semaine("egalite", "L"),
                         f"Cette semaine, entre local et national, tu as penché autant d{A}un côté que de l{A}autre.")
        self.assertEqual(phrase_semaine("floue"),
                         "Cette semaine, ton portrait est encore flou. Chaque réponse le précise.")


class TestJournee(unittest.TestCase):
    def test_r(self):
        self.assertEqual(r_journee(minutes("17:59")), 1439)
        self.assertEqual(r_journee(minutes("18:00")), 0)
        # Valentin joue vers 23h20 : affiché à 23:20, pas à 23:19
        self.assertLessEqual(r_journee(minutes("23:20")), r_journee(minutes("23:20")))
        self.assertGreater(r_journee(minutes("23:20")), r_journee(minutes("23:19")))
        # Agathe (7h40) est affichée à 9:00, pas à 18:30
        self.assertLessEqual(r_journee(minutes("07:40")), r_journee(minutes("09:00")))
        self.assertGreater(r_journee(minutes("07:40")), r_journee(minutes("18:30")))

    def test_date_carnet(self):
        self.assertEqual(date_carnet(dt.datetime(2026, 10, 19, 0, 30)), "lundi 19 octobre 2026")
        self.assertEqual(date_carnet(dt.datetime(2026, 11, 1, 12, 0)), "dimanche 1er novembre 2026")


class TestPhrasesAttendues(unittest.TestCase):
    def texte(self, issue="adopte", etape="navette", date="2024-10-09", auteur=None):
        return {"vote": {"issue": issue, "etape": etape, "date": date},
                "auteur": auteur or {"type": "depute", "nom": "Prénom Nom", "feminin": True, "groupe": "EcoS"},
                "considerations": [
                    {"rang": 1, "depute": {"nom": "Ian Boucard", "feminin": False, "groupe": "DR", "elision": False}},
                    {"rang": 2, "depute": {"nom": "Élisa Martin", "feminin": True, "groupe": "LFI-NFP", "elision": True}}]}

    def test_exemple_4_5(self):
        v = votes(self.texte(), "3")
        self.assertEqual(v["2.7d"], [f"Et l{A}Assemblée{F}?", "Texte adopté.",
                                     f"Le 9{I}octobre{I}2024. Le Sénat devait encore voter."])
        self.assertIsNone(v["1.6"])

    def test_exemples_7_9(self):
        v = votes(self.texte(etape="navette", date="2025-03-18"), "E2")
        self.assertEqual(v["1.6"], [f"L{A}Assemblée{I}: texte adopté le 18{I}mars{I}2025. Le Sénat devait encore voter."])
        v = votes(self.texte(issue="rejete", etape="aucune", date="2025-01-30"), "4")
        self.assertEqual(v["2.7d"][1:], ["Texte rejeté.", f"Le 30{I}janvier{I}2025."])
        v = votes(self.texte(issue="sans_vote_ensemble", etape="aucune", date="2024-12-03"), "5")
        self.assertEqual(v["2.7d"][1:], ["Texte ni adopté ni rejeté.",
                                         f"Le 3{I}décembre{I}2024, son article unique a été adopté, mais la séance a pris "
                                         f"fin à minuit sans vote sur l{A}ensemble du texte."])
        v = votes(self.texte(etape="definitif", date="2025-03-01"), "14")
        self.assertEqual(v["5.4"], [f"Vote{I}: adopté le 1er{I}mars{I}2025. C{A}était le vote définitif du Parlement."])
        self.assertIsNone(v["2.7d"])

    def test_auteurs(self):
        a = auteurs(self.texte(), "2")
        self.assertEqual(a["2.7e"], "Proposé par Prénom Nom, députée, EcoS.")
        self.assertEqual(a["5.4"], "Proposé par Prénom Nom, EcoS.")
        a = auteurs(self.texte(auteur={"type": "senateur", "nom": "X Y", "feminin": False,
                                       "groupe": "Les Républicains"}), "2")
        self.assertEqual(a["5.4"], "Proposé par X Y, sénateur, Les Républicains.")
        a = auteurs(self.texte(auteur={"type": "gouvernement"}), "E3")
        self.assertEqual(a["1.6"], "Proposé par le Gouvernement.")

    def test_elision(self):
        self.assertEqual(arguments(self.texte()),
                         ["était l\u2019argument de Ian Boucard, député, DR.",
                          "était l\u2019argument d\u2019Élisa Martin, députée, LFI-NFP."])

    def test_candidat(self):
        d = commun.candidat()
        p = phrases_attendues(d, commun.candidat_octets())
        self.assertEqual(sorted(p["textes"]), sorted(d["textes"]))
        canon.octets_canoniques(p)
        for tid, t in p["textes"].items():
            self.assertEqual(len(t["arguments"]), 4)
            for s in t["arguments"]:
                self.assertNotRegex(s, "[0-9] ")


if __name__ == "__main__":
    unittest.main()
