"""Contrôles 2, 3 et 4 (schéma 2, partie 5.2) sur le candidat 1 du scellement, puis sur
des mutations. Le candidat 1 est un fichier calibré (r = 16) ; sans lui, le test est
sauté."""

import copy
import unittest
from pathlib import Path

import commun
from ec import canon
from ec.controles234 import rapport

CANDIDAT = commun.controle.CACHE2 / "outillage" / "scellement" / "candidat-1" / "fichier-scelle-candidat-1.json"
RACINE = commun.controle.RACINE


def lancer(d, octets):
    return rapport(d, octets, (RACINE / "docs/essai/a-ne-pas-ouvrir/fichier-scelle.json").read_bytes(),
                   (RACINE / "docs/essai/empreinte.md").read_text(encoding="utf-8"),
                   (RACINE / "docs/essai/a-ne-pas-ouvrir/profils.md").read_text(encoding="utf-8"),
                   {"fichier": "x", "premier": "p", "empreinte": "e", "profils": "f"})


@unittest.skipUnless(CANDIDAT.is_file(), "candidat 1 absent")
class TestControles234(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.octets = CANDIDAT.read_bytes()
        cls.d = canon.lire_strict(cls.octets)

    def mute(self, f):
        d = copy.deepcopy(self.d)
        f(d)
        return lancer(d, canon.octets_canoniques(d))

    def test_candidat_passe(self):
        texte, v = lancer(self.d, self.octets)
        self.assertEqual(v, {"controle2": True, "controle3": True, "controle4": True}, texte)
        self.assertIn("REMPLIT c1 à c5", texte)

    def test_profil_modifie(self):
        texte, v = self.mute(lambda d: d["personnages"]["Odile"].update(age=70))
        self.assertFalse(v["controle2"])

    def test_reponse_modifiee(self):
        def f(d):
            r = d["reponses"]["H40"]["Agathe"] if "Agathe" in d["reponses"]["H40"] else d["reponses"]["H40"]["Nassim"]
            r["niveau"] = 3 if r["niveau"] != 3 else 4
        texte, v = self.mute(f)
        self.assertFalse(v["controle3"])

    def test_tirage_trop_grand(self):
        texte, v = self.mute(lambda d: d["histoire"].update(tirage=d["histoire"]["tirage"] + 1))
        self.assertFalse(v["controle3"])

    def test_absence_deplacee(self):
        def f(d):
            d["absences"]["Agathe"] = []
        texte, v = self.mute(f)
        self.assertFalse(v["controle4"])


if __name__ == "__main__":
    unittest.main()
