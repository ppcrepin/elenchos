"""Chiffres constants (fichier caché 2, point 13) et phrases du dévoilement
(`devoilement.md`, contrôle 11), sur le fichier de test."""

import copy
import unittest
from fractions import Fraction as F
from math import ceil

import commun
import test_journal
from ec import canon
from ec.constantes import calculer, rapport
from ec.devoilement import phrases_devoilement
from ec.jeu import ENTREE, PERSONNAGES, TENSIONS


def fr(x):
    return F(x)


class TestConstantes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.octets, cls.d = commun.fabrique()
        cls.c, cls.mans = calculer(cls.d, cls.octets)

    def test_portee(self):
        self.assertEqual(sorted(self.mans), [1, 2, 3, 7, 14])
        self.assertEqual(self.c["1_cartes"]["total"], sum(self.c["1_cartes"]["par_manche"].values()))

    def test_loi(self):
        h = self.c["7_hasard"]
        n = self.c["1_cartes"]["total"]
        loi = {int(k): fr(v) for k, v in h["loi"].items()}
        self.assertEqual(sum(loi.values()), 1)
        self.assertEqual(sorted(loi), list(range(0, n + 1)))
        self.assertEqual(sum(k * p for k, p in loi.items()), fr(h["esperance"]))   # E[X] = Σ h
        self.assertEqual(fr(h["au_plus"][str(n)]), 1)
        self.assertEqual(sum(fr(v["esperance"]) for v in h["par_personnage"].values()), fr(h["esperance"]))
        self.assertEqual(sum(v["cartes"] for v in h["par_personnage"].values()), n)

    def test_reponses_par_texte(self):
        r = self.c["8_reponses_par_texte"]
        self.assertEqual(sorted(r["personnages"], key=int), [str(k) for k in range(14)])
        self.assertEqual(sorted(r["plus_porteur"], key=int), [str(k) for k in range(1, 14)])
        for k, v in r["plus_porteur"].items():
            self.assertEqual(v, r["personnages"][k] + 1)

    def test_impossibilites_c(self):
        # textes dont la révélation est lue : T1, T2, T5, T6, T12, T13
        f = self.d["reglage"]["facteur"]
        att = []
        for k in (1, 2, 5, 6, 12, 13):
            T = self.d["textes"][str(k)]["tension"]
            avant = [t for t in list(ENTREE) + [str(i) for i in range(1, k)] if self.d["textes"][t]["tension"] == T]
            if len(avant) >= ceil(F(10, f)):
                att.append(str(k))
        self.assertEqual(self.c["15_impossibilites"]["c_pas_de_cote_possible"], att)
        self.assertEqual(self.c["15_impossibilites"]["b_jours_cartes_revelees"], {"14": 3, "15": 1})

    def test_auteur_d_origine(self):
        # Ligne 2 : l'auteur d'origine compte, jamais l'auteur affiché après redistribution.
        d = copy.deepcopy(self.d)
        j, c = next((j, c) for j in self.mans for c in self.mans[j]["cartes"])
        t = self.mans[j]["texte"]
        d["reponses_atypiques"][c["auteur"]] = [o for o in d["reponses_atypiques"][c["auteur"]] if o["texte"] != t] + \
            [{"cote_tire": None, "texte": t}]
        c2, _ = calculer(d, self.octets)
        attendu = self.c["2_atypiques"]["cartes"] + (0 if any(o["texte"] == t for o in self.d["reponses_atypiques"][c["auteur"]]) else 1)
        self.assertEqual(c2["2_atypiques"]["cartes"], attendu)

    def test_rapport_stable(self):
        t1, _, o1 = rapport(self.d, self.octets)
        t2, _, o2 = rapport(self.d, self.octets)
        self.assertEqual(o1, o2)
        self.assertEqual(canon.lire_strict(o1), canon.lire_strict(canon.octets_canoniques(self.c)))


class TestDevoilement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.octets, cls.d = commun.fabrique()
        cls.j = canon.lire_strict(canon.octets_canoniques(test_journal.journal_complet(cls.d, cls.octets)))

    def dev(self, journal=None, **kw):
        return phrases_devoilement(self.d, self.octets, journal, **kw)

    def test_structure(self):
        o = self.dev(self.j, date_pub="2 novembre 2026", heure_pub="18 h 05", nom_fichier="f.json")
        P = o["panneaux"]
        self.assertEqual(len(P), 4 + 4 + 2)
        self.assertIsNone(P[0]["titre"])
        self.assertIsNone(P[-1]["titre"])
        self.assertEqual([p["titre"] for p in P[1:4]],
                         ["Comment lire", "Avant votre arrivée", "Ce que l\u2019essai changeait pour vous"])
        for i, p in enumerate(PERSONNAGES):
            self.assertTrue(P[4 + i]["titre"].startswith(p + ", "))
        ctl = P[8]["blocs"]
        self.assertEqual(ctl[1], o["empreinte_scelle"])
        self.assertEqual(ctl[4], self.d["graine"])
        self.assertEqual(ctl[8], "f.json")
        self.assertEqual(o["partie"], "a")

    def test_textes_par_tension(self):
        o = self.dev(self.j)
        b = o["panneaux"][3]["blocs"][1]
        self.assertNotIn("entrée comprise", b)
        self.assertTrue(b.startswith("En tout, entrée et dernier jour compris, vous aviez"))
        n = {T: sum(1 for t in list(ENTREE) + [str(k) for k in range(1, 15)] if self.d["textes"][t]["tension"] == T)
             for T in TENSIONS}
        self.assertEqual(sum(n.values()), 17)
        self.assertIn(f"aviez {n['S']}\u00a0textes sur", b)

    def test_vous_l_aviez_suit_les_manches_ouvertes(self):
        o1 = self.dev(self.j)
        j2 = copy.deepcopy(self.j)
        for k in ("1", "2", "3", "7", "14"):
            j2["jours"][k]["coups"]["deviner"] = None
        o2 = self.dev(j2)
        t1 = "\n".join(b for p in o1["panneaux"] for b in p["blocs"])
        t2 = "\n".join(b for p in o2["panneaux"] for b in p["blocs"])
        self.assertNotIn("Vous l\u2019aviez à deviner", t2)
        # Avec les manches ouvertes : présent si une réponse atypique T0 à T13 a sa carte servie.
        from ec.histoire import calculer_histoire
        _, _, mo, _ = calculer_histoire(self.d, self.octets)
        attendu = any(int(o["texte"]) + 1 in (1, 2, 3, 7, 14) and
                      any(c["auteur"] == p for c in mo.cartes_servies("porteur", int(o["texte"]) + 1)["cartes"])
                      for p in PERSONNAGES for o in self.d["reponses_atypiques"][p]
                      if o["texte"].isdigit() and int(o["texte"]) <= 13)
        self.assertEqual("Vous l\u2019aviez à deviner" in t1, attendu)

    def test_temperaments_jour_14_meme_apres_arret(self):
        # Arbitrage du 10 octobre 2026 : calcul du jour 14 ; réponses non données = absentes.
        from ec.histoire import calculer_histoire
        j = test_journal.tronquer(copy.deepcopy(self.j), 3)
        o = self.dev(j)
        _, _, mo, _ = calculer_histoire(self.d, self.octets)
        for k in ("1", "2", "3"):
            r = j["jours"][k]["coups"]["reponse"]
            if r is not None:
                mo.reponses[k]["porteur"] = dict(r)
        temps = mo.temperaments(14)
        for i, p in enumerate(PERSONNAGES):
            blocs = o["panneaux"][4 + i]["blocs"]
            if temps[p]["temperaments"]:
                self.assertTrue(any(b.startswith("Ses tempéraments au second dimanche, sur") for b in blocs))
            else:
                self.assertIn("Ses tempéraments au second dimanche\u00a0: aucun.", blocs)

    def test_sans_journal(self):
        o = self.dev(None)
        self.assertIsNone(o["partie"])
        self.assertEqual(o["panneaux"][8]["blocs"][8], "{fichier}")


if __name__ == "__main__":
    unittest.main()

