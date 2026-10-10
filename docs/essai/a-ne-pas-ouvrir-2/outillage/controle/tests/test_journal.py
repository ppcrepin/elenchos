"""Validité du journal, version 4 (schéma 2, partie 4.4) : un journal complet et
valide, fabriqué ici, puis des mutations, chacune refusée par la règle attendue."""

import copy
import unittest

import commun
from ec import canon
from ec.journal import valider, table_confusables, pseudo_conforme, forme_comparee
from ec.moteur import Moteur
from ec.tirage import Tirage, sha256_hex

PERSOS = ["Agathe", "Nassim", "Odile", "Valentin"]
OUV = {1: "2026-11-02T19:00+01:00", 2: "2026-11-03T19:00+01:00", 3: "2026-11-04T19:00+01:00",
       4: "2026-11-05T19:00+01:00", 7: "2026-11-05T19:30+01:00", 8: "2026-11-06T19:00+01:00",
       14: "2026-11-06T19:40+01:00", 15: "2026-11-07T19:00+01:00"}
DEPART = {1: "2026-11-05T19:10+01:00", 2: "2026-11-06T19:10+01:00"}


def zeros():
    return {"cercle": 0, "moi": 0, "proche": 0, "qui_est_qui": 0}


def journal_complet(scelle, octets):
    cal = {o["jour"]: o for o in scelle["calendrier"]}
    mo = Moteur(scelle, Tirage(scelle["graine"]))
    jours = {}
    for k in range(1, 16):
        t = cal[k]["type"]
        c = {"abandon": False if t == "joue" else None, "annuler_saut": 0 if t == "joue_puis_saut" else None,
             "carnet": {"hesite": None, "moment": None, "moment_semaine": None, "saut_clair": None},
             "compte": None, "consentement": None, "deviner": None, "entree": None, "ouvert": zeros(),
             "pendant_deviner": None, "pseudo": None, "relire": 0,
             "reponse": {"niveau": 4, "raison": 1} if k <= 14 else None, "rouvrir": 0}
        if cal[k]["deviner_porteur"]:
            n = len(mo.cartes_servies("porteur", k)["cartes"])
            c["deviner"] = {"cartes": [{"designe": PERSOS[i], "raison": None} for i in range(n)], "validee": True}
            c["pendant_deviner"] = {"cercle": 0, "proche": 0}
        if t == "joue":
            c["carnet"]["moment"] = "aucun"
        if k == 1:
            c.update(pseudo="Témoin-a-k", consentement=True, compte="apple",
                     entree={e: {"pari": 4, "reponse": {"niveau": 4, "raison": 1}} for e in ("E1", "E2", "E3")})
            c["carnet"]["moment"] = "defi"
        if k == 7:
            c["carnet"].update(saut_clair="oui", hesite=["deviner", "saut"], moment_semaine="titres")
        if k == 14:
            c["carnet"].update(hesite=["nulle_part"], moment_semaine="aucun")
        joue = t == "joue"
        jours[str(k)] = {
            "attente": {"lectures": [{"heure": "19:20"}]} if joue else None,
            "coups": c,
            "etapes": {"deviner": True, "entree": True if k == 1 else None, "repondre": True} if joue else None,
            "ouverture": OUV.get(k),
            "versions": [1] if k in OUV else None,
        }
    sauts = [{"coups": {"ouvert": zeros()}, "depart": DEPART[n], "numero": n, "textes_atteints": nb}
             for n, nb in ((1, 3), (2, 6))]
    return {"arret": None, "copies": [], "empreinte_scelle": sha256_hex(octets),
            "fin": {"avis": "apprenait", "barre": "comprise", "f2": "toujours_autant", "portrait": "un_peu",
                    "raisons": "un_peu", "regle": "claire", "servi": "defi", "suspense": "vrai"},
            "format": "elenchos-essai-journal", "jours": jours, "partie": {"graine": None, "id": "a",
                                                                           "mode": "interface"},
            "sauts": sauts, "version": 4}


def tronquer(j, K, arret=True):
    """Arrêt au jour K : garde les jours 1 à K et les sauts commencés."""
    j["jours"] = {k: v for k, v in j["jours"].items() if int(k) <= K}
    j["fin"] = None
    if arret:
        j["arret"] = {"f2": None, "jour": K, "raison": "vu_assez"}
    j["sauts"] = [s for s in j["sauts"] if {1: 4, 2: 8}[s["numero"]] <= K]
    return j


class TestJournal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.octets, cls.scelle = commun.fabrique()
        cls.emp = sha256_hex(cls.octets)
        cls.conf = commun.CONFUSABLES.read_bytes() if commun.CONFUSABLES.is_file() else None

    def regles(self, j):
        d, _ = valider(canon.lire_strict(canon.octets_canoniques(j)), self.scelle, self.emp, self.conf)
        return d

    def base(self):
        return journal_complet(self.scelle, self.octets)

    def refuse(self, f, regle, base=None):
        j = base or self.base()
        f(j)
        d = self.regles(j)
        self.assertTrue(any(r == regle for r, _, _ in d), f"règle {regle} attendue ; défauts : {d}")

    def test_complet_valide(self):
        self.assertEqual(self.regles(self.base()), [])

    def test_arret_valides(self):
        for K in (1, 3, 5, 7, 10, 14):
            j = tronquer(self.base(), K)
            if K in (5,):
                j["sauts"][0]["textes_atteints"] = 2
            if K == 10:
                j["sauts"][1]["textes_atteints"] = 3
            if K >= 3:
                j["arret"]["f2"] = "jamais"
            self.assertEqual(self.regles(j), [], f"arrêt au jour {K}")

    def test_arret_avant_aller_au_dimanche(self):
        # Règle 4 : arrêt après la dernière réponse du rattrapage, jour de reprise sans ouverture.
        j = tronquer(self.base(), 7)
        j["arret"]["f2"] = "jamais"
        j7 = j["jours"]["7"]
        j7.update(ouverture=None, versions=None, attente=None,
                  etapes={"deviner": False, "entree": None, "repondre": False})
        j7["coups"].update(deviner=None, pendant_deviner=None, reponse=None)
        j7["coups"]["carnet"] = {"hesite": None, "moment": None, "moment_semaine": None, "saut_clair": None}
        self.assertEqual(self.regles(j), [])

    def reprise_sans_ouverture(self):
        j = tronquer(self.base(), 7)
        j["arret"]["f2"] = "jamais"
        j7 = j["jours"]["7"]
        j7.update(ouverture=None, versions=None, attente=None,
                  etapes={"deviner": False, "entree": None, "repondre": False})
        j7["coups"].update(deviner=None, pendant_deviner=None, reponse=None)
        j7["coups"]["carnet"] = {"hesite": None, "moment": None, "moment_semaine": None, "saut_clair": None}
        return j

    def test_regle4_etat_du_jour_de_reprise(self):
        # Q-J3 : jour de reprise atteint sans ouverture, état exact (schéma 2, règle 4).
        mutations = [
            lambda c, x: x.update(versions=[1]),
            lambda c, x: x.update(etapes={"deviner": True, "entree": None, "repondre": False}),
            lambda c, x: x.update(etapes=None),
            lambda c, x: c.update(abandon=True),
            lambda c, x: c.update(relire=1),
            lambda c, x: c.update(rouvrir=1),
            lambda c, x: c["ouvert"].update(cercle=1),
            lambda c, x: c["ouvert"].update(qui_est_qui=1),
            lambda c, x: c["carnet"].update(moment="aucun"),
        ]
        for i, m in enumerate(mutations):
            j = self.reprise_sans_ouverture()
            m(j["jours"]["7"]["coups"], j["jours"]["7"])
            d = self.regles(j)
            self.assertTrue(any(r == 4 for r, _, _ in d), f"mutation {i} : règle 4 attendue ; {d}")

    def test_regle9_point_de_saut_onglets(self):
        # Aux jours 4 et 8, Le Cercle, Moi et l'écran d'un proche valent 0 ; Qui est qui reste permis.
        for k in ("4", "8"):
            for cle in ("cercle", "moi", "proche"):
                self.refuse(lambda j: j["jours"][k]["coups"]["ouvert"].update({cle: 1}), 9)
            j = self.base()
            j["jours"][k]["coups"]["ouvert"]["qui_est_qui"] = 1
            self.assertEqual(self.regles(j), [])

    def test_regle1_version(self):
        self.refuse(lambda j: j.update(version=3), 1)

    def test_regle1_cle_en_trop(self):
        self.refuse(lambda j: j["jours"]["2"]["coups"].update(q1=None), 1)

    def test_regle2_identifiant(self):
        self.refuse(lambda j: j["partie"].update(id="témoin"), 2)

    def test_regle2_porteur(self):
        j = self.base()
        j["partie"]["id"] = "porteur"
        self.assertEqual(self.regles(j), [])
        self.refuse(lambda j: j["partie"].update(id="porteur", mode="moteur"), 2)

    def test_regle3_trou(self):
        self.refuse(lambda j: j["jours"].pop("5"), 3)

    def test_regle3_jour_sans_reponse(self):
        self.refuse(lambda j: j["jours"]["2"]["coups"].update(reponse=None), 3)

    def test_regle3_abandon_jour1_sans_compte(self):
        def f(j):
            tronquer(j, 2)
            c = j["jours"]["1"]["coups"]
            c.update(reponse=None, abandon=True, compte=None, pseudo=None, deviner=None, pendant_deviner=None)
        self.refuse(f, 3)

    def test_abandon_valide(self):
        j = self.base()
        c = j["jours"]["3"]["coups"]
        c.update(reponse=None, abandon=True)
        c["deviner"]["validee"] = False
        c["deviner"]["cartes"][-1]["designe"] = None
        j["jours"]["3"]["attente"] = None
        self.assertEqual(self.regles(j), [])

    def test_regle4_ouverture_jour_saute(self):
        self.refuse(lambda j: j["jours"]["5"].update(ouverture="2026-11-05T19:20+01:00"), 4)

    def test_regle4_decroissante(self):
        self.refuse(lambda j: j["jours"]["3"].update(ouverture="2026-11-01T19:00+01:00"), 4)

    def test_regle4_heure_inexistante(self):
        self.refuse(lambda j: j["jours"]["2"].update(ouverture="2026-11-03T19:00+02:00"), 4)

    def test_regle4_depart(self):
        self.refuse(lambda j: j["sauts"][0].update(depart="2026-11-05T20:00+01:00"), 4)

    def test_regle5_versions(self):
        self.refuse(lambda j: j["jours"]["3"].update(versions=[2, 1]), 5)

    def test_regle6_pseudo_prenom(self):
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="VALENTIN"), 6)

    def test_regle6_pseudo_confusable(self):
        if self.conf is None:
            self.skipTest("confusables.txt absent")
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="Аgathe"), 6)   # А cyrillique
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="0dile"), 6)
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="Nàssim"), 6)
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="ν"), 6)          # ν grec, rond « N » ?

    def test_regle6_rond(self):
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo="a"), 6)
        j = self.base()
        j["jours"]["1"]["coups"]["pseudo"] = "Antoine"
        self.assertEqual(self.regles(j), [])

    def test_regle6_compte_sans_pseudo(self):
        self.refuse(lambda j: j["jours"]["1"]["coups"].update(pseudo=None), 6)

    def test_regle6_pari_sans_reponse(self):
        self.refuse(lambda j: j["jours"]["1"]["coups"]["entree"]["E2"].update(reponse=None), 6)

    def test_regle7_nombre_de_cartes(self):
        self.refuse(lambda j: j["jours"]["2"]["coups"]["deviner"]["cartes"].pop(), 7)

    def test_regle7_deviner_jour_4(self):
        self.refuse(lambda j: j["jours"]["4"]["coups"].update(
            deviner={"cartes": [], "validee": True}, pendant_deviner={"cercle": 0, "proche": 0}), 7)

    def test_regle7_double(self):
        def f(j):
            cs = j["jours"]["2"]["coups"]["deviner"]["cartes"]
            cs[1]["designe"] = cs[0]["designe"]
        self.refuse(f, 7)

    def test_regle7_non_validee(self):
        self.refuse(lambda j: j["jours"]["2"]["coups"]["deviner"].update(validee=False), 7)

    def test_regle7_raison_hors_cachee(self):
        def f(j):
            mo = Moteur(self.scelle, Tirage(self.scelle["graine"]))
            man = mo.cartes_servies("porteur", 2)
            i = next(i for i, c in enumerate(man["cartes"]) if not c["cachee"])
            j["jours"]["2"]["coups"]["deviner"]["cartes"][i]["raison"] = 1
        self.refuse(f, 7)

    def test_regle8_point_de_saut_sans_saut(self):
        def f(j):
            tronquer(j, 4)
            j["sauts"] = []
        self.refuse(f, 8)

    def test_regle9_annuler_hors_saut(self):
        self.refuse(lambda j: j["jours"]["3"]["coups"].update(annuler_saut=0), 9)

    def test_regle9_rouvrir(self):
        self.refuse(lambda j: j["jours"]["4"]["coups"].update(rouvrir=1), 9)

    def test_regle9_saute(self):
        self.refuse(lambda j: j["jours"]["6"]["coups"]["ouvert"].update(moi=1), 9)

    def test_regle10_moment(self):
        self.refuse(lambda j: j["jours"]["2"]["coups"]["carnet"].update(moment="defi"), 10)
        self.refuse(lambda j: j["jours"]["4"]["coups"]["carnet"].update(moment="aucun"), 10)
        self.refuse(lambda j: j["jours"]["2"]["coups"]["carnet"].update(moment="titres"), 10)

    def test_regle10_hesite(self):
        self.refuse(lambda j: j["jours"]["7"]["coups"]["carnet"].update(hesite=["saut", "deviner"]), 10)
        self.refuse(lambda j: j["jours"]["7"]["coups"]["carnet"].update(hesite=["nulle_part", "saut"]), 10)
        self.refuse(lambda j: j["jours"]["14"]["coups"]["carnet"].update(saut_clair="oui"), 10)

    def test_regle11_attente(self):
        self.refuse(lambda j: j["jours"]["4"].update(attente={"lectures": [{"heure": "19:30"}]}), 11)

    def test_regle12_etapes(self):
        self.refuse(lambda j: j["jours"]["2"]["etapes"].update(deviner=False), 12)
        self.refuse(lambda j: j["jours"]["4"].update(etapes={"deviner": False, "entree": None, "repondre": True}), 12)

    def test_regle13_textes_atteints(self):
        self.refuse(lambda j: j["sauts"][1].update(textes_atteints=7), 13)
        self.refuse(lambda j: j["sauts"][0].update(textes_atteints=1), 13)

    def test_regle14_f2(self):
        def f(j):
            tronquer(j, 2)
            j["arret"]["f2"] = "jamais"
        self.refuse(f, 14)

    def test_regle15_copies(self):
        j = self.base()
        cp = {"coups": copy.deepcopy(j["jours"]["2"]["coups"]), "etapes": dict(j["jours"]["2"]["etapes"]),
              "jour": 2, "sauts": [], "versions": [1]}
        cp["coups"]["reponse"] = None
        cp["coups"]["deviner"]["validee"] = False
        j["copies"] = [cp]
        self.assertEqual(self.regles(j), [])
        cp2 = copy.deepcopy(cp)
        cp2["coups"]["reponse"] = {"niveau": 1, "raison": 2}
        self.refuse(lambda x: x.update(copies=[cp2]), 15, base=j)

    def test_squelette(self):
        if self.conf is None:
            self.skipTest("confusables.txt absent")
        table, version, n = table_confusables(self.conf)
        self.assertEqual(table.get("а"), "a")
        self.assertEqual(forme_comparee("VALENTIN", table), forme_comparee("Valentin", table))
        self.assertIsNone(pseudo_conforme("Marie", table))
        self.assertIsNotNone(pseudo_conforme("N", table))


if __name__ == "__main__":
    unittest.main()
