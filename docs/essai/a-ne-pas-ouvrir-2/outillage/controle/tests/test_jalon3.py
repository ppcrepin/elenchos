"""Points de la spécification tranchée le 10 octobre 2026 (troisième jalon de C) :
commissions comparées à amo (Q-G2), liste B par numéros de scrutin (Q-B1)."""

import json
import re
import tempfile
import unittest
from pathlib import Path

import commun
from ec.controle_scelle import verifier_commissions
from ec.jeu import JOUES
from test_controle1 import lancer, etape_en_echec


def fichier_minimal(libelle):
    textes = {t: {"auteur": {"type": "gouvernement"}} for t in JOUES}
    textes[JOUES[0]] = {"auteur": {"type": "commission", "libelle": libelle}}
    return {"textes": textes}


class TestCommissionsAmo(unittest.TestCase):
    """Q-G2 : le libellé d'une commission en forme longue est comparé au `libelle` de son
    organe (première lettre en minuscule, U+2019 → U+0027) ; un écart est bloquant."""

    def amo(self, libelle_officiel):
        d = Path(tempfile.mkdtemp(prefix="controle-tests-amo-", dir=commun.SCRATCH))
        (d / "json" / "organe").mkdir(parents=True)
        (d / "json" / "organe" / "PO900001.json").write_text(
            json.dumps({"organe": {"uid": "PO900001", "libelle": libelle_officiel, "codeType": "COMPER"}}),
            encoding="utf-8")
        return [str(d)]

    def verifier(self, lib, officiel, courte=False, amo=None):
        info = []
        e = verifier_commissions(fichier_minimal(lib), [(lib, ["PO900001"], "x", courte)],
                                 self.amo(officiel) if amo is None else amo, info)
        return e, info

    def test_egal(self):
        e, info = self.verifier("commission fictive de l'essai", "Commission fictive de l’essai")
        self.assertEqual(e, [])
        self.assertTrue(any("amo lu" in x for x in info))

    def test_ecart_bloquant(self):
        e, _ = self.verifier("commission fictive de l'essai", "Commission fictive des essais")
        self.assertEqual(len(e), 1)
        self.assertIn("PO900001", e[0])

    def test_majuscule_interne_respectee(self):
        e, _ = self.verifier("commission fictive de l'Essai", "Commission fictive de l'essai")
        self.assertEqual(len(e), 1)

    def test_amo_absent_repli(self):
        e, info = self.verifier("commission fictive", "x", amo=[str(commun.SCRATCH / "controle-inexistant")])
        self.assertEqual(e, [])
        self.assertTrue(any("repli" in x for x in info))

    def test_forme_courte_non_comparee(self):
        e, info = self.verifier("commission fictive", "Tout autre libellé", courte=True)
        self.assertEqual(e, [])
        self.assertTrue(any("forme courte" in x for x in info))


class TestListeB(unittest.TestCase):
    """Q-B1 : la liste B est faite de numéros de scrutin ; un numéro qui ne désigne pas
    exactement une fiche de texte joué arrête le contrôle à l'étape 8."""

    def test_numero_inconnu(self):
        texte, _ = lancer(scrutins_b=[1])
        self.assertEqual(etape_en_echec(texte), 8)
        self.assertIn("le scrutin 1 désigne 0 fiches", texte)

    def test_numero_partage_par_deux_fiches(self):
        srcs = dict(commun.sources_test())
        nom, t, _ = srcs["S"]
        nums = re.findall(r"^### T[0-9]+ · scrutin ([0-9]+)", t, flags=re.M)
        a, b = nums[0], nums[1]
        t2 = re.sub(rf"^(### T[0-9]+ · scrutin ){b}\b", rf"\g<1>{a}", t, count=1, flags=re.M)
        self.assertNotEqual(t, t2)
        srcs["S"] = (nom, t2, t2.encode())
        texte, _ = lancer(srcs=srcs, scrutins_b=[int(a)])
        self.assertEqual(etape_en_echec(texte), 8)
        self.assertIn(f"le scrutin {a} désigne 2 fiches", texte)

    def test_cle_du_rapport(self):
        texte, _ = lancer()
        self.assertRegex(texte, r"présentation B : scrutin [0-9]+ = ")


if __name__ == "__main__":
    unittest.main()
