"""L'histoire (jours −90 à 0) sur le fichier de test : forme de la trace (schéma 2,
partie 4.2), résumé (partie 3), et recalculs indépendants écrits ici autrement que
dans le moteur (curseurs, cartes servies, justesse D-024, points, Pas de Côté,
tempéraments)."""

import unittest
from fractions import Fraction as F

import commun
from ec import canon
from ec.histoire import calculer_histoire
from ec.tirage import Tirage, sha256_hex

PERSOS = ["Agathe", "Nassim", "Odile", "Valentin"]
VAL = {1: F(0), 2: F(1, 4), 3: F(1, 2), 4: F(3, 4), 5: F(1)}


def texte_jour(j):
    return f"H{j + 91}" if j < 0 else str(j)


def raisons_de(d, t):
    if t.startswith("H"):
        return d["histoire"]["textes"][t]["raisons"], d["histoire"]["textes"][t]["sens"], \
            d["histoire"]["textes"][t]["tension"]
    x = d["textes"][t]
    return x["considerations"], x["sens"], x["tension"]


def poids(d, t, rep):
    """(w, π) écrit à part : §5.1."""
    cons, s, _ = raisons_de(d, t)
    if rep["niveau"] == 3:
        return F(0), None
    pi = s if rep["niveau"] > 3 else 1 - s
    pole = "aucun" if rep["raison"] == "aucune" else next(c["pole"] for c in cons if c["rang"] == rep["raison"])
    if pole == "aucun":
        return F(1, 2), pi
    return (F(1), pi) if pole == pi else (F(0), None)


def curseur_direct(d, p, T, jusqu_au):
    sw = swp = F(0)
    textes = ["E1", "E2", "E3"] + [texte_jour(j) for j in range(-90, jusqu_au + 1)]
    for t in textes:
        if raisons_de(d, t)[2] != T or p not in d["reponses"][t]:
            continue
        w, pi = poids(d, t, d["reponses"][t][p])
        sw += w
        if pi is not None:
            swp += w * pi
    return (2 + swp) / (4 + sw), sw


class TestHistoire(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.octets, cls.d = commun.fabrique()
        cls.trace, cls.resume, cls.mo, cls.extras = calculer_histoire(cls.d, cls.octets)

    def test_forme(self):
        t = self.trace
        self.assertEqual(set(t), {"arrivee", "empreinte_scelle", "format", "jours", "semaines", "version"})
        self.assertEqual((t["format"], t["version"]), ("elenchos-essai-trace-histoire", 1))
        self.assertEqual(t["empreinte_scelle"], sha256_hex(self.octets))
        self.assertEqual(sorted(t["jours"], key=int), [str(j) for j in range(-90, 1)])
        self.assertEqual(len(t["semaines"]), 13)
        self.assertEqual(set(t["arrivee"]), {"curseurs", "resume", "resume_sha256", "temperaments"})
        for j in range(-90, 1):
            x = t["jours"][str(j)]
            self.assertEqual(set(x), {"manches", "repondu", "revelation"})
            self.assertEqual(x["repondu"], texte_jour(j))
            self.assertEqual(x["revelation"] is None, j <= -89)
            if j == -90:
                self.assertEqual(x["manches"], {})
            else:
                presents = [p for p in PERSOS if texte_jour(j) not in self.d["absences"][p]]
                self.assertEqual(sorted(x["manches"]), sorted(presents))
            if x["revelation"] is not None:
                self.assertEqual(set(x["revelation"]), {"devineurs", "pas_de_cote", "texte"})
                self.assertEqual(x["revelation"]["texte"], texte_jour(j - 2))
        # canonique et déterministe
        o1 = canon.octets_canoniques(t)
        o2 = canon.octets_canoniques(calculer_histoire(self.d, self.octets)[0])
        self.assertEqual(o1, o2)

    def test_resume(self):
        r = self.resume
        o = canon.octets_canoniques(r)
        self.assertTrue(all(b < 0x80 for b in o))
        self.assertEqual(sha256_hex(o), self.d["histoire"]["resume_sha256"])
        self.assertEqual(self.trace["arrivee"]["resume"], r)
        self.assertEqual(self.trace["arrivee"]["resume_sha256"], sha256_hex(o))
        self.assertEqual(set(r), {"curseurs", "format", "manche_jour_0", "temperaments", "tirage", "titres",
                                  "version"})
        self.assertEqual(r["manche_jour_0"]["texte"], "H90")
        self.assertEqual([x["semaine"] for x in r["titres"]], list(range(1, 14)))
        for x in r["titres"][:12]:
            self.assertIsNone(x["surprise"])
        self.assertIn(r["titres"][12]["surprise"], (None, "H86"))
        self.assertEqual(r["tirage"], self.d["histoire"]["tirage"])

    def test_curseurs_arrivee_recalcules(self):
        for p in PERSOS:
            for T in "SPTL":
                c, sw = curseur_direct(self.d, p, T, -1)
                self.assertEqual(self.resume["curseurs"][p][T], {"c": canon.frac(c), "somme_w": canon.frac(sw)})
                a = self.trace["arrivee"]["curseurs"][p][T]
                self.assertEqual(a["net"], sw >= 10)
                self.assertEqual(a["l"], canon.frac(max(F(95, 100) - F(7, 100) * sw, F(1, 4))))

    def test_cartes_servies_recalculees(self):
        """Quatre membres : toutes les réponses des trois autres sont servies ; classement
        par rareté (ou distance si net), départagé par t("surprise|g|j|X")."""
        tg = Tirage(self.d["graine"])
        for j in range(-89, 1):
            t = texte_jour(j - 1)
            _, s, T = raisons_de(self.d, t)
            for g, man in self.trace["jours"][str(j)]["manches"].items():
                autres = [p for p in PERSOS if p != g]
                self.assertEqual(man["candidats"], autres)
                auteurs = [p for p in autres if p in self.d["reponses"][t]]
                xs = {p: (VAL[self.d["reponses"][t][p]["niveau"]] if s == 1
                          else 1 - VAL[self.d["reponses"][t][p]["niveau"]]) for p in auteurs}
                v = sorted(xs.values())
                med = v[len(v) // 2] if len(v) % 2 else (v[len(v) // 2 - 1] + v[len(v) // 2]) / 2
                surpr = {}
                for p in auteurs:
                    c, sw = curseur_direct(self.d, p, T, j - 2)
                    surpr[p] = abs(xs[p] - c) if sw >= 10 else abs(xs[p] - med)
                    self.assertEqual(man["possibles"][p]["surprise"], canon.frac(surpr[p]))
                cl = sorted(auteurs, key=lambda p: (-surpr[p], tg.n(f"surprise|{g}|{j}|{p}"), p))
                self.assertEqual(man["classement"], cl)
                self.assertEqual(man["places"], cl)
                self.assertEqual(man["remplacements"], [])
                self.assertEqual(sorted(man["rangs"].values()), [1, 2, 3])
                self.assertEqual(man["curseur_porteur"], None)
                self.assertEqual(sum(c["cachee"] for c in man["cartes"]), 1 if auteurs else 0)
                des = [c["designe"] for c in man["cartes"]]
                self.assertEqual(len(set(des)), len(des))
                self.assertTrue(set(des) <= set(autres))
                self.assertEqual(sorted(c["auteur"] for c in man["cartes"]), sorted(auteurs))

    def test_justesse_d024_et_points(self):
        for j in range(-88, 1):
            t = texte_jour(j - 2)
            rev = self.trace["jours"][str(j)]["revelation"]
            manches = self.trace["jours"][str(j - 1)]["manches"]
            self.assertEqual(sorted(rev["devineurs"]), sorted(manches))
            for g, dv in rev["devineurs"].items():
                cartes = manches[g]["cartes"]
                for c, juste, jum in zip(cartes, dv["justes"], dv["jumeaux"]):
                    rep_auteur = self.d["reponses"][t][c["auteur"]]
                    rep_designe = self.d["reponses"][t].get(c["designe"])
                    self.assertEqual(juste, rep_designe == rep_auteur)
                    self.assertEqual(jum, juste and c["designe"] != c["auteur_compte"])
                self.assertEqual(dv["points"], sum(dv["justes"]))
                self.assertIsNone(dv["verdicts"])

    def test_points_de_semaine_et_devin(self):
        for s in self.trace["semaines"]:
            w = s["semaine"]
            debut, fin = 7 * (w - 14) + 1, 7 * (w - 13)
            pts = {p: 0 for p in PERSOS}
            for j in range(max(debut, -88), fin + 1):
                for g, dv in self.trace["jours"][str(j)]["revelation"]["devineurs"].items():
                    pts[g] += dv["points"]
                    self.assertEqual(dv["points_semaine"], pts[g])
            self.assertEqual(s["devin"]["points"], pts)
            if s["devin"]["titulaire"] is not None:
                self.assertEqual(pts[s["devin"]["titulaire"]], max(pts.values()))

    def test_mystere_surprise_sans_faute_recalcules(self):
        for s in self.trace["semaines"]:
            w = s["semaine"]
            debut, fin = 7 * (w - 14) + 1, 7 * (w - 13)
            tent = {p: 0 for p in PERSOS}
            err = {p: 0 for p in PERSOS}
            attr, errs = {}, {}
            jours_cartes = {p: set() for p in PERSOS}
            fautes = {p: False for p in PERSOS}
            for j in range(max(debut, -88), fin + 1):
                t = texte_jour(j - 2)
                attr[t] = errs[t] = 0
                for g, m in self.trace["jours"][str(j - 1)]["manches"].items():
                    for c in m["cartes"]:
                        juste = self.d["reponses"][t].get(c["designe"]) == self.d["reponses"][t][c["auteur"]]
                        tent[c["auteur_compte"]] += 1
                        err[c["auteur_compte"]] += not juste
                        attr[t] += 1
                        errs[t] += not juste
                        jours_cartes[g].add(j)
                        fautes[g] |= not juste
            self.assertEqual(s["mystere"]["tentatives"], tent)
            self.assertEqual(s["mystere"]["erreurs"], err)
            self.assertEqual(s["surprise"]["attributions"], attr)
            self.assertEqual(s["surprise"]["erreurs"], errs)
            self.assertEqual(s["sans_faute"], [p for p in PERSOS if len(jours_cartes[p]) >= 5 and not fautes[p]])
            if w < 13:
                self.assertIsNone(s["surprise"]["texte"])
            else:
                ok = attr.get("H86", 0) >= 4 and errs.get("H86", 0) >= 1
                self.assertEqual(s["surprise"]["texte"], "H86" if ok else None)
            if s["mystere"]["titulaire"] is not None:
                m = s["mystere"]["titulaire"]
                self.assertTrue(tent[m] >= 6 and err[m] >= 1)
                self.assertEqual(F(err[m], tent[m]),
                                 max(F(err[p], tent[p]) for p in PERSOS if tent[p] >= 6 and err[p] >= 1))

    def test_fidele(self):
        for s in self.trace["semaines"]:
            w = s["semaine"]
            textes = [texte_jour(j) for j in range(7 * (w - 14), 7 * (w - 13)) if j >= -90]
            att = [p for p in PERSOS if all(p in self.d["reponses"][t] for t in textes)]
            self.assertEqual(s["fidele"]["titulaires"], att)
        self.assertEqual(len([texte_jour(j) for j in range(-91, -84) if j >= -90]), 6)

    def test_pas_de_cote_recalcule(self):
        for j in range(-88, 1):
            t = texte_jour(j - 2)
            _, s, T = raisons_de(self.d, t)
            att = []
            for p in PERSOS:
                rep = self.d["reponses"][t].get(p)
                if rep is None:
                    continue
                w, pi = poids(self.d, t, rep)
                if w != 1:
                    continue
                c, sw = curseur_direct(self.d, p, T, j - 3)
                if sw >= 10 and abs(c - F(1, 2)) >= F(1, 5) and pi != (1 if c > F(1, 2) else 0):
                    att.append(p)
            self.assertEqual(self.trace["jours"][str(j)]["revelation"]["pas_de_cote"], att, f"jour {j}")

    def test_temperaments_recalcules(self):
        fen = [texte_jour(k) for k in range(-57, -1)]
        self.assertEqual(len(fen), 56)
        for p in PERSOS:
            n = neu = tres = seul = part = mil = 0
            for t in fen:
                reps = self.d["reponses"][t]
                if p not in reps or len(reps) < 3:
                    continue
                n += 1
                mon = reps[p]["niveau"]
                autres = [r["niveau"] for q, r in reps.items() if q != p]
                neu += mon == 3
                tres += mon in (1, 5)
                if mon > 3 and all(a <= 3 for a in autres) or mon < 3 and all(a >= 3 for a in autres):
                    seul += 1
                if any(a > 3 for a in autres) and any(a < 3 for a in autres):
                    part += 1
                    mil += mon == 3 and 3 not in autres
            x = self.trace["arrivee"]["temperaments"][p]
            self.assertEqual((x["reponses"], x["neutres"], x["tres"], x["seul_cote"], x["textes_partages"],
                              x["seul_milieu"]), (n, neu, tres, seul, part, mil))
            attendu = []
            if n >= 20:
                if F(seul, n) >= F(3, 10):
                    attendu.append("original")
                if part >= 6 and F(mil, part) >= F(1, 8):
                    attendu.append("pont")
                if F(neu, n) >= F(1, 3):
                    attendu.append("mesure")
                if F(tres, n) >= F(1, 2):
                    attendu.append("tranche")
            self.assertEqual(x["temperaments"], attendu)
            self.assertEqual(self.resume["temperaments"][p], attendu)

    def test_manche_jour_0(self):
        m0 = self.trace["jours"]["0"]["manches"]
        self.assertEqual(self.resume["manche_jour_0"]["devineurs"],
                         {g: [{k: c[k] for k in ("auteur", "auteur_compte", "cachee", "designe", "raison_devinee")}
                              for c in m["cartes"]] for g, m in m0.items()})

    def test_comparaison_octet_pour_octet(self):
        from ec.comparer import comparer_octets
        o = canon.octets_canoniques(self.trace)
        self.assertEqual(comparer_octets(o, o), (True, []))
        autre = canon.lire_strict(o)
        autre["jours"]["-5"]["revelation"]["pas_de_cote"] = ["Odile"] if not \
            autre["jours"]["-5"]["revelation"]["pas_de_cote"] else []
        same, diffs = comparer_octets(o, canon.octets_canoniques(autre))
        self.assertFalse(same)
        self.assertEqual([p for p, _, _ in diffs][0][:30], "/jours/-5/revelation/pas_de_co"[:30])
        same, diffs = comparer_octets(o, o + b" ")
        self.assertFalse(same)


if __name__ == "__main__":
    unittest.main()
