"""Rejeu des parties (jours 1 à 15) sur le fichier de test : trace v4, carnet, copies,
variantes du contrôle 12, et recalculs indépendants de quelques règles (avis du cercle,
portrait accéléré, barre, message de 18h, phrase « nette »)."""

import copy
import unittest
from fractions import Fraction as F

import commun
import test_journal
from ec import canon
from ec.carnet import verifier_forme, masquer_durees
from ec.rejeu import Rejeu, avis_cercle, masquer
from ec.trace_schema import valider_trace
from ec.variantes import comparer_variantes

PERSOS = ["Agathe", "Nassim", "Odile", "Valentin"]


def reponses_tranchees(d, cote_=1):
    """Pour chaque texte : la position Très favorable (ou Très défavorable) et la raison
    attendue de ce côté (pôle que sert la position)."""
    out = {}
    for t, x in d["textes"].items():
        s = x["sens"]
        niveau = 5 if cote_ == 1 else 1
        pole = s if cote_ == 1 else 1 - s
        c = next(c for c in x["considerations"] if c["cote"] == ("pour" if cote_ == 1 else "contre") and c["pole"] == pole)
        out[t] = {"niveau": niveau, "raison": c["rang"]}
    return out


def poser(j, reps):
    for k, x in j["jours"].items():
        if x["coups"]["reponse"] is not None:
            x["coups"]["reponse"] = dict(reps[k])
    for e in ("E1", "E2", "E3"):
        j["jours"]["1"]["coups"]["entree"][e]["reponse"] = dict(reps[e])
    return j


def durees_pour(j):
    jours = {}
    for k, x in j["jours"].items():
        et = x["etapes"] or {}
        if x["ouverture"] is None:
            jours[k] = {"duree_deviner": None, "duree_entree": None, "duree_repondre": None, "duree_seance": None}
            continue
        jours[k] = {"duree_deviner": 30 if et.get("deviner") else None,
                    "duree_entree": 95 if k == "1" and et.get("entree") else None,
                    "duree_repondre": 41 if et.get("repondre") else None, "duree_seance": 125}
    def cp(c):
        et = c["etapes"] or {}
        return {"duree_deviner": 10 if et.get("deviner") else None,
                "duree_entree": 10 if c["jour"] == 1 and et.get("entree") else None,
                "duree_repondre": 10 if et.get("repondre") else None, "duree_seance": 60}
    return {"copies": [cp(c) for c in j["copies"]],
            "format": "elenchos-essai-durees", "jours": jours, "partie": j["partie"]["id"],
            "sauts": [{"duree_page": 12, "duree_saut": 300, "durees_textes": [20] * s["textes_atteints"],
                       "numero": s["numero"]} for s in j["sauts"]], "version": 2}


class TestRejeu(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.octets, cls.d = commun.fabrique()

    def rejouer(self, j, durees=True):
        j = canon.lire_strict(canon.octets_canoniques(j))
        from ec.journal import valider
        from ec.tirage import sha256_hex
        defauts, _ = valider(j, self.d, sha256_hex(self.octets), None)
        self.assertEqual(defauts, [], "journal de test invalide")
        R = Rejeu(self.d, self.octets, j, durees_pour(j) if durees else None)
        t = R.trace()
        return t, R

    def base(self):
        return test_journal.journal_complet(self.d, self.octets)

    def test_partie_complete(self):
        t, R = self.rejouer(self.base())
        self.assertEqual(R.defauts, [])
        self.assertEqual(valider_trace(t), [])
        self.assertEqual(verifier_forme(t["carnet"]["texte"], "Témoin-a-k"), [])
        self.assertEqual(t["resume_histoire"], self.d["histoire"]["resume_sha256"])
        self.assertEqual(sorted(t["jours"], key=int), [str(k) for k in range(1, 16)])
        # deux rejeux, mêmes octets
        t2, _ = self.rejouer(self.base())
        self.assertEqual(canon.octets_canoniques(t), canon.octets_canoniques(t2))

    def test_calendrier_de_la_trace(self):
        t, _ = self.rejouer(self.base())
        J = t["jours"]
        self.assertEqual(J["1"]["revelation"]["texte"], "H90")
        self.assertIsNone(J["1"]["revelation"]["avis_cercle"])
        self.assertEqual(J["15"]["revelation"]["texte"], "13")
        for k in (5, 6, 9, 10, 11, 12, 13):
            self.assertNotIn("porteur", J[str(k)]["manches"])
            self.assertIsNone(J[str(k)]["mesures"])
            self.assertIsNone(J[str(k)]["message"])
        for k in (1, 2, 3, 7, 14):
            self.assertEqual(len(J[str(k)]["manches"]["porteur"]["cartes"]), 3)
        # Jour 1 : les personnages ne proposent pas le porteur ; dès le jour 2, si.
        for g, m in J["1"]["manches"].items():
            if g != "porteur":
                self.assertNotIn("porteur", m["candidats"])
                self.assertEqual(len(m["candidats"]), 3)
        for g, m in J["2"]["manches"].items():
            if g != "porteur":
                self.assertIn("porteur", m["candidats"])
        self.assertEqual(sum(len(J[str(k)]["manches"]["porteur"]["cartes"]) for k in (1, 2, 3, 7, 14)), 15)
        self.assertIsNotNone(J["7"]["dimanche"])
        self.assertEqual(J["7"]["dimanche"]["semaine"], 14)
        self.assertEqual(J["14"]["dimanche"]["semaine"], 15)
        from ec.histoire import calculer_histoire
        _, resume, _, _ = calculer_histoire(self.d, self.octets)
        for k in range(1, 7):
            self.assertEqual(J[str(k)]["cercle"]["surprise"], resume["titres"][12]["surprise"])

    def test_avis_cercle(self):
        self.assertIsNone(avis_cercle([4, 5]))
        self.assertEqual(avis_cercle([1, 4, 5]), {"comptes": [1, 0, 0, 1, 1], "ligne": "adopte", "milieu": [4]})
        self.assertEqual(avis_cercle([1, 2, 4, 5]), {"comptes": [1, 1, 0, 1, 1], "ligne": "partage", "milieu": [2, 4]})
        self.assertEqual(avis_cercle([1, 2, 2, 5]), {"comptes": [1, 2, 0, 0, 1], "ligne": "rejete", "milieu": [2]})
        self.assertEqual(avis_cercle([3, 3, 3]), {"comptes": [0, 0, 3, 0, 0], "ligne": "partage", "milieu": [3]})
        self.assertEqual(avis_cercle([1, 2, 4, 4]), {"comptes": [1, 1, 0, 2, 0], "ligne": "partage", "milieu": [2, 4]})
        self.assertEqual(avis_cercle([4, 5, 1, 4, 5]), {"comptes": [1, 0, 0, 2, 2], "ligne": "adopte", "milieu": [4]})
        t, _ = self.rejouer(self.base())
        for k in range(2, 16):
            r = t["jours"][str(k)]["revelation"]
            tid = r["texte"]
            niveaux = [x["niveau"] for x in self.d["reponses"][tid].values()]
            if tid != "0" and t["jours"][str(int(tid))]["coups"]["reponse"] is not None:
                niveaux.append(t["jours"][str(int(tid))]["coups"]["reponse"]["niveau"])
            self.assertEqual(r["avis_cercle"], avis_cercle(niveaux), f"jour {k}")

    def test_portrait_accelere_et_barre(self):
        t, _ = self.rejouer(poser(self.base(), reponses_tranchees(self.d)))
        f = self.d["reglage"]["facteur"]
        for k in range(1, 16):
            p = t["jours"][str(k)]["portrait"]
            textes = ["E1", "E2", "E3"] + [str(n) for n in range(1, min(k, 14) + 1)]
            for T in "SPTL":
                ws = [1 for x in textes if self.d["textes"][x]["tension"] == T]   # arbitrages nets, w = 1
                sw = f * sum(ws)
                self.assertEqual(p["tensions"][T]["somme_w"], canon.frac(F(sw)), f"jour {k} {T}")
                self.assertEqual(p["tensions"][T]["net"], sw >= 10)
            n = len(textes)
            pleine = n >= 16 or any(p["tensions"][T]["net"] for T in "SPTL")
            self.assertEqual(p["barre"], {"longueur": "1" if pleine else canon.frac(F(n, 16)), "n": n, "pleine": pleine})

    def test_phrase_nette_au_jour_14(self):
        t, _ = self.rejouer(poser(self.base(), reponses_tranchees(self.d)))
        ps7 = t["jours"]["7"]["dimanche"]["phrase_semaine"]
        ps14 = t["jours"]["14"]["dimanche"]["phrase_semaine"]
        self.assertNotEqual(ps7["cas"], "nette")               # §5.7 : impossible au jour 7
        self.assertEqual(ps14["cas"], "nette")
        self.assertEqual(ps14["reference"], [])
        self.assertIn(ps14["tension"], ps14["devenues"])
        self.assertTrue(ps14["phrase"].startswith("Entre "))

    def test_phrase_floue_toujours_neutre(self):
        reps = {k: {"niveau": 3, "raison": 1} for k in self.d["textes"]}
        t, _ = self.rejouer(poser(self.base(), reps))
        for k in ("7", "14"):
            self.assertEqual(t["jours"][k]["dimanche"]["phrase_semaine"]["cas"], "floue")
        self.assertFalse(t["jours"]["15"]["portrait"]["barre"]["pleine"] and
                         any(t["jours"]["15"]["portrait"]["tensions"][T]["net"] for T in "SPTL"))
        self.assertTrue(t["jours"]["14"]["portrait"]["barre"]["pleine"])   # 16 réponses

    def test_messages(self):
        t, _ = self.rejouer(self.base())
        J = t["jours"]
        for k in (2, 3, 4, 8):
            self.assertEqual(J[str(k)]["message"]["forme"], "cartes")
        self.assertEqual(J["7"]["message"]["forme"], "vote")      # T5, répondu au rattrapage, sans cartes
        self.assertIsNone(J["1"]["message"])
        self.assertIsNone(J["15"]["message"])

    def test_abandon_jour_3(self):
        j = self.base()
        c = j["jours"]["3"]["coups"]
        c.update(reponse=None, abandon=True, deviner=None, pendant_deviner=None)
        j["jours"]["3"]["attente"] = None
        j["jours"]["3"]["etapes"].update(deviner=False, repondre=False)
        c["carnet"]["moment"] = "aucun"
        t, R = self.rejouer(j)
        self.assertEqual(R.defauts, [])
        J = t["jours"]
        self.assertIsNone(J["4"]["mesures"]["revelation_verdicts"])
        self.assertEqual(J["4"]["message"]["forme"], "vote")   # pas de cartes ; T2, révélé, a une réponse
        self.assertNotIn("porteur", J["4"]["revelation"]["devineurs"])
        self.assertIn("Journée abandonnée : oui.", t["carnet"]["texte"])

    def test_arrets(self):
        for K, attendu in ((1, "Essai arrêté pendant l’entrée."), (5, "Essai arrêté pendant le premier saut."),
                           (3, "Essai arrêté au jour 3.")):
            j = test_journal.tronquer(self.base(), K)
            if K == 1:
                c = j["jours"]["1"]["coups"]
                c.update(pseudo=None, compte=None, deviner=None, pendant_deviner=None, reponse=None, abandon=False)
                c["carnet"]["moment"] = None
                j["jours"]["1"]["attente"] = None
                j["jours"]["1"]["etapes"].update(deviner=False, repondre=False)
            if K == 5:
                j["sauts"][0]["textes_atteints"] = 2
            if K >= 3:
                j["arret"]["f2"] = "jamais"
            t, R = self.rejouer(j)
            texte = t["carnet"]["texte"]
            self.assertIn(attendu, texte, texte[:600])
            self.assertEqual(verifier_forme(texte), [])
            self.assertEqual(("Questions de fin" in texte), K >= 3)

    def test_copie_au_jour_7(self):
        j = self.base()
        cp = {"coups": copy.deepcopy(j["jours"]["7"]["coups"]), "etapes": dict(j["jours"]["7"]["etapes"]),
              "jour": 7, "sauts": copy.deepcopy(j["sauts"][:1]), "versions": [1]}
        j["copies"] = [cp]
        t, R = self.rejouer(j)
        self.assertEqual(R.defauts, [])
        c = t["copies"][0]["texte"]
        self.assertIn("Essai en cours : carnet copié au jour 7.", c)
        self.assertIn("Semaine 1", c)
        self.assertNotIn("Jour 8", c)
        self.assertEqual(verifier_forme(c), [])

    def test_variantes_controle_12(self):
        base = self.base()
        vs = [poser(copy.deepcopy(base), reponses_tranchees(self.d, 1)),
              poser(copy.deepcopy(base), reponses_tranchees(self.d, -1)),
              poser(copy.deepcopy(base), {k: {"niveau": 3, "raison": 1} for k in self.d["textes"]}),
              poser(copy.deepcopy(base), {k: {"niveau": 4, "raison": "aucune"} for k in self.d["textes"]})]
        traces = [self.rejouer(v)[0] for v in vs]
        self.assertEqual(comparer_variantes(traces), [])

    def test_durees_masquees(self):
        t, _ = self.rejouer(self.base())
        m = masquer(t)
        self.assertEqual(m["sauts"][1]["mesures"]["durees_textes"], [0] * 6)
        self.assertEqual(m["jours"]["2"]["mesures"]["duree_seance"], 0)
        self.assertNotIn("min 05 s", masquer_durees(t["carnet"]["texte"]))

    def test_durees_absentes(self):
        j = self.base()
        jj = canon.lire_strict(canon.octets_canoniques(j))
        du = durees_pour(jj)
        du["jours"]["2"]["duree_deviner"] = None
        R = Rejeu(self.d, self.octets, jj, du)
        t = R.trace()
        self.assertIn(("/jours/2/mesures/duree_deviner", "durée attendue, absente du fichier des durées"), R.defauts)
        self.assertEqual(t["jours"]["2"]["mesures"]["duree_deviner"], 0)


if __name__ == "__main__":
    unittest.main()
