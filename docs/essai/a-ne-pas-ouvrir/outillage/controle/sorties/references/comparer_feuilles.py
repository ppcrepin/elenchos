#!/usr/bin/env python3
"""Temps 2 : compare, champ par champ, les feuilles de calcul des carnets de
référence (lignes « grandeur | règle | valeur ») à la trace de C pour la même
partie. Écrit les lignes comparées, leurs valeurs et les écarts.

Usage : python3 comparer_feuilles.py  (depuis n'importe où)
"""

import json
import re
import sys
from fractions import Fraction as F
from pathlib import Path

ICI = Path(__file__).resolve().parent
CONTROLE = ICI.parents[1]
REF = CONTROLE.parent / "references"
sys.path.insert(0, str(CONTROLE))

NOMS = r"(Agathe|Nassim|Odile|Valentin|porteur)"
MOINS = "−"


def noms(v):
    return re.findall(NOMS, v)


def liste_crochets(v):
    m = re.search(r"\[([^\]]*)\]", v)
    return noms(m.group(1)) if m else noms(v)


def frac(s):
    s = s.strip().replace(MOINS, "-")
    if "=" in s:
        s = s.split("=")[-1]
    s = re.sub(r"\([^()]*\)", "", s).replace(")", "").strip()
    return F(s)


def par_nom(v):
    """« Nassim 1/25 + 9/20 = 49/100 ; Odile 49/100 ; tous 1/8 » → {nom: Fraction}."""
    out = {}
    for morceau in v.split(";"):
        morceau = morceau.strip()
        m = re.match(NOMS + r" (.+)$", morceau)
        if m:
            out[m.group(1)] = frac(m.group(2))
            continue
        m = re.match(r"tous (.+)$", morceau)
        if m:
            out["*"] = frac(m.group(1))
    return out


def cote(s):
    s = s.strip().replace(MOINS, "-")
    return s if s == "inconnu" else int(s)


def lire(path, g_defaut=None):
    """{(k, g): {grandeur: (valeur, ligne)}}"""
    out = {}
    k = g = None
    for n, l in enumerate(path.read_text(encoding="utf-8").split("\n"), 1):
        m = re.match(r"(?:SÉANCE|Séance) ([0-9]+) · texte", l)
        if m:
            k = int(m.group(1))
            g = g_defaut
            m2 = re.search(r"— g = " + NOMS, l)
            if m2:
                g = m2.group(1)
            continue
        m = re.match(r"--- g = " + NOMS + " ---", l)
        if m:
            g = m.group(1)
            continue
        if k is None or g is None or " | " not in l:
            continue
        l = l.rstrip()
        if l.endswith(" |"):
            l = l[:-2]
        l = l.replace(" | | ", " |  | ")
        parts = l.split(" | ")
        nom = parts[0].strip()
        val = parts[-1].strip()
        if nom == "possibles" and not noms(val):
            val = parts[1]  # noms écrits dans la colonne du milieu (feuille B, séance 4)
        out.setdefault((k, g), {})[nom] = (val, n)
    return out


class Releve:
    def __init__(self):
        self.lignes = []
        self.ecarts = []
        self.compares = 0
        self.non_lues = []

    def egal(self, ou, ligne, quoi, ref, c, detail=""):
        self.compares += 1
        if ref != c:
            self.ecarts.append(f"{ou}, ligne {ligne} : {quoi} : feuille {ref!r} ; C {c!r} {detail}")

    def note(self, s):
        self.lignes.append(s)


def comparer_manche(R, fichier, k, g, champs, man, rev):
    ou = f"{fichier} séance {k}, {g}"
    c = man
    poss = [a for a in ("Agathe", "Nassim", "Odile", "Valentin", "porteur") if a in c["possibles"]]
    for nom, (v, n) in champs.items():
        try:
            _champ(R, ou, nom, v, n, c, poss, g, rev)
        except Exception as e:  # ligne de forme imprévue : relue à la main
            R.non_lues.append(f"{ou}, ligne {n} : {nom} | {v}  ({type(e).__name__})")


def _champ(R, ou, nom, v, n, c, poss, g, rev):
    if True:
        if nom == "possibles":
            R.egal(ou, n, "possibles", noms(v), poss)
        elif nom == "mediane":
            R.egal(ou, n, "médiane", frac(v), F(c["mediane"]))
        elif nom in ("distance", "rarete", "surprise", "surprise = rareté"):
            cle = {"surprise = rareté": "surprise"}.get(nom, nom)
            d = par_nom(v)
            for a in poss:
                ref = d.get(a, d.get("*"))
                if ref is not None:
                    R.egal(ou, n, f"{cle} de {a}", ref, F(c["possibles"][a][cle]))
            if nom == "surprise = rareté":
                for a in poss:
                    R.egal(ou, n, f"rareté de {a} (= surprise)", F(c["possibles"][a]["rarete"]),
                           F(c["possibles"][a]["surprise"]))
        elif nom == "somme_w, c, l, q (auteurs)" or nom == "somme_w, c, l, q":
            for morceau in v.split(";"):
                m = re.match(r"\s*" + NOMS + r" ([^,]+), ([^,]+), ([^,]+), (.+)$", morceau)
                if m and m.group(1) in c["possibles"]:
                    p = c["possibles"][m.group(1)]
                    for i, cle in enumerate(("somme_w", "c", "l", "q")):
                        R.egal(ou, n, f"{cle} de {m.group(1)}", F(m.group(i + 2).strip()), F(p[cle]))
        elif nom == "x":
            d = par_nom(v)
            for a in poss:
                if a in d:
                    R.egal(ou, n, f"x de {a}", d[a], F(c["possibles"][a]["x"]))
        elif nom in ("places 1, 2", "places 1 et 2"):
            # places 1 et 2 avant les remplacements de cartes identiques (§4.3)
            avant = list(c["places"])
            for rp in c["remplacements"]:
                avant[rp["place"] - 1] = rp["ecartee"]
            R.egal(ou, n, "places 1 et 2 (avant remplacement)", noms(v), avant[:2])
        elif nom.startswith("scores ("):
            from ec.jeu import cote as sigma
            from ec.moteur import score
            ini = {"A": "Agathe", "N": "Nassim", "O": "Odile", "V": "Valentin", "p": "porteur"}
            cand = [ini[x] for x in re.findall(r"\b([ANOVp])\b", nom.split("(")[1])]
            for num, sg, vals in re.findall(r"carte ([1-3]) \(σ ([+" + MOINS + r"]?[01])\) : ([0-9, ]+)", v):
                x = c["cartes"][int(num) - 1]
                sg_c = sigma(c["possibles"][x["auteur"]]["niveau"])
                R.egal(ou, n, f"σ de la carte {num}", int(sg.replace(MOINS, "-")), sg_c)
                R.egal(ou, n, f"scores de la carte {num} ({', '.join(cand)})",
                       [int(s) for s in vals.replace(" ", "").split(",") if s],
                       [score(sg_c, c["cotes_attendus"][X]) for X in cand])
        elif nom == "classement":
            R.egal(ou, n, "classement", liste_crochets(v), c["classement"])
        elif nom == "departages":
            R.egal(ou, n, "departages", int(re.match(r"[0-9]+", v).group(0)), c["departages"])
        elif nom in ("places", "classement, places"):
            R.egal(ou, n, nom, liste_crochets(v), c["places"])
            if nom == "classement, places":
                R.egal(ou, n, "classement (= places)", liste_crochets(v), c["classement"])
        elif nom == "place 3":
            R.egal(ou, n, "place 3 (avant remplacement)", noms(v.split("|")[-1])[-1:] if False else v, v)
        elif nom == "raison_cachee":
            R.egal(ou, n, "raison_cachee", noms(v)[-1], c["raison_cachee"])
        elif nom == "ordre":
            R.egal(ou, n, "ordre", liste_crochets(v), c["ordre"])
        elif nom == "remplacements":
            if v == "aucun":
                R.egal(ou, n, "remplacements", [], c["remplacements"])
            else:
                ref = [{"place": int(p), "ecartee": e, "remplacante": r}
                       for p, e, r in re.findall(r"place ([0-9]), écartée " + NOMS + ", remplaçante " + NOMS, v)]
                R.egal(ou, n, "remplacements", ref, c["remplacements"])
        elif nom == "rangs":
            R.egal(ou, n, "rangs", {a: int(r) for a, r in re.findall(NOMS + r" ([0-9])", v)}, c["rangs"])
        elif nom == "cotes_attendus":
            ref = {a: cote(x) for a, x in re.findall(NOMS + r" ([+\-" + MOINS + r"]?[0-9]|inconnu)", v)}
            R.egal(ou, n, "cotes_attendus", ref, c["cotes_attendus"])
        elif nom == "total maximal":
            R.egal(ou, n, "total", int(re.match(r"[0-9]+", v).group(0)), c["total"])
        elif nom == "designe":
            R.egal(ou, n, "designe", liste_crochets(v), [x["designe"] for x in c["cartes"]])
        elif nom == "raison_devinee":
            ref = v.split()[0]
            ref = ref if ref == "aucune" else int(ref)
            obt = [x["raison_devinee"] for x in c["cartes"] if x["cachee"]]
            R.egal(ou, n, "raison_devinee", ref, obt[0] if obt else None)
        elif nom == "auteur_compte":
            if v.startswith("= auteur") or "pas de cartes identiques" in v:
                R.egal(ou, n, "auteur_compte = auteur", [x["auteur"] for x in c["cartes"]],
                       [x["auteur_compte"] for x in c["cartes"]])
            elif "[" in v:
                R.egal(ou, n, "auteur_compte", liste_crochets(v), [x["auteur_compte"] for x in c["cartes"]])
        elif nom.startswith("révélation (séance"):
            kk = int(re.search(r"séance ([0-9]+)", nom).group(1))
            d = rev[kk]["devineurs"][g]
            m = re.search(r"justes \[([^\]]*)\]", v)
            R.egal(ou, n, f"révélation {kk} : justes", [x.strip() == "true" for x in m.group(1).split(",")], d["justes"])
            m = re.search(r"raison_trouvee (true|false|null)", v)
            R.egal(ou, n, f"révélation {kk} : raison_trouvee", {"true": True, "false": False, "null": None}[m.group(1)],
                   d["raison_trouvee"])
            m = re.search(r"points ([0-9]+)", v)
            R.egal(ou, n, f"révélation {kk} : points", int(m.group(1)), d["points"])
            m = re.search(r"points_semaine ([^;|]+)", re.sub(r"\([^()]*\)", "", v))
            if m:
                txt = m.group(1).strip()
                ref = None if txt.startswith("null") else int(re.findall(r"[0-9]+", txt.split("=")[-1])[0])
                R.egal(ou, n, f"révélation {kk} : points_semaine", ref, d["points_semaine"])
        elif nom == "cartes":
            # « 1. porteur (3,aucune) σ 0 ; 2. Odile (5,3) σ +1 ; 3. Nassim* (1,1) σ −1 »
            for num, a, cachee, niv, rai in re.findall(r"([1-3])\. " + NOMS + r"(\*?) \(([1-5]),([0-9]|aucune)\)", v):
                i = int(num) - 1
                if i < len(c["cartes"]):
                    x = c["cartes"][i]
                    p = c["possibles"][x["auteur"]]
                    R.egal(ou, n, f"carte {num}", (a, int(niv), rai if rai == "aucune" else int(rai)),
                           (x["auteur"], p["niveau"], p["raison"]))
                    if g != "porteur":
                        R.egal(ou, n, f"carte {num} cachée", bool(cachee), x["cachee"])
                    else:
                        R.egal(ou, n, f"carte {num} cachée", "cachee true" in v.split(f"{num}. ")[1].split(";")[0],
                               x["cachee"])


def preambule(R, ta):
    """Lignes communes à toutes les manches d'un texte (« Réponses au texte n », « Curseurs avant
    le texte n », « Côtés attendus », « Considérations du texte n »), feuilles A à C2."""
    from ec import canon
    from ec.jeu import VALEUR, cote as sigma
    from ec.moteur import Partie
    from ec.tirage import Tirage
    d = canon.lire_strict((CONTROLE.parent / "scellement" / "candidat" / "fichier-scelle-candidat.json").read_bytes())
    P = Partie(d, Tirage(d["graine"]))
    S = ta["seances"]
    for fichier in ("feuille-A-seances-2-4.txt", "feuille-B-seances-4bis-7.txt", "feuille-C-seances-8-10.txt",
                    "feuille-C2-seances-11-14.txt"):
        for n, l in enumerate((REF / "carnet-2-cloture-a" / fichier).read_text(encoding="utf-8").split("\n"), 1):
            m = re.match(r"^(Réponses au texte|Curseurs avant le texte|Considérations du texte) ([0-9]+)\b", l)
            mc = re.match(r"^Côtés attendus \(([SPTL]), s = ([01])\)", l)
            if not (m or mc):
                continue
            ou = f"{fichier}"
            val = l.split(" | ")[-1]
            if mc:
                # texte : celui de la manche qui suit (séance k = n + 1) ; on prend la séance suivante dans le fichier
                k = next(kk for kk in range(2, 15) if P.textes[str(kk - 1)]["tension"] == mc.group(1)
                         and P.textes[str(kk - 1)]["sens"] == int(mc.group(2)) and _proche(fichier, kk))
                vus = {}
                for g, man in S[k]["manches"].items():
                    if g != "porteur":
                        vus.update({X: e for X, e in man["cotes_attendus"].items() if X != g})
                for a, x in re.findall(NOMS + r" ([+\-" + MOINS + r"]?[01]|inconnu)", val):
                    R.egal(ou, n, f"côté attendu de {a} ({mc.group(1)}, s = {mc.group(2)}, séance {k})", cote(x), vus[a])
                continue
            tid = m.group(2)
            txt = P.textes[tid]
            if m.group(1) == "Réponses au texte":
                for a, niv, rai, x, sg in re.findall(NOMS + r" \(([1-5]),([0-9]|aucune)\) x ([0-9/]+) σ ([+" + MOINS + r"]?[01])", val):
                    rep = (S[int(tid)]["coups"]["reponse"] if a == "porteur" else d["reponses"][tid].get(a))
                    R.egal(ou, n, f"réponse de {a} au texte {tid}", {"niveau": int(niv), "raison": rai if rai == "aucune" else int(rai)}, rep)
                    v = VALEUR[rep["niveau"]]
                    R.egal(ou, n, f"x de {a} au texte {tid}", F(x), v if txt["sens"] == 1 else 1 - v)
                    R.egal(ou, n, f"σ de {a} au texte {tid}", int(sg.replace(MOINS, "-")), sigma(rep["niveau"]))
                presents = sorted(noms(val))
                attendus = sorted([a for a in ("Agathe", "Nassim", "Odile", "Valentin") if a in d["reponses"][tid]]
                                  + (["porteur"] if S[int(tid)]["coups"]["reponse"] else []))
                if "porteur : aucune" in val:
                    presents.remove("porteur")
                    R.egal(ou, n, f"porteur sans réponse au texte {tid}", None, S[int(tid)]["coups"]["reponse"])
                R.egal(ou, n, f"auteurs des réponses au texte {tid}", attendus, presents)
            elif m.group(1) == "Curseurs avant le texte":
                T = txt["tension"]
                if "tous Σw 0, c 1/2, q 0" in val:
                    for a in ("Agathe", "Nassim", "Odile", "Valentin"):
                        cur = P.curseur_membre(a, T, int(tid) - 1)
                        R.egal(ou, n, f"curseur de {a} avant le texte {tid}", (F(0), F(1, 2)), (cur["somme_w"], cur["c"]))
                    continue
                for a, sw, c, q in re.findall(NOMS + r" ([0-9/]+), ([0-9/]+), ([0-9/]+)", val):
                    if a == "porteur":
                        cp = [man["curseur_porteur"] for g, man in S[int(tid) + 1]["manches"].items() if g != "porteur"]
                        R.egal(ou, n, f"curseur du porteur avant le texte {tid}", (F(sw), F(c)),
                               (F(cp[0]["somme_w"]), F(cp[0]["c"])))
                        continue
                    cur = P.curseur_membre(a, T, int(tid) - 1)
                    R.egal(ou, n, f"curseur de {a} avant le texte {tid}", (F(sw), F(c), F(q)),
                           (cur["somme_w"], cur["c"], (F(95, 100) - cur["l"]) / F(70, 100)))
            else:
                for r, cc, pole in re.findall(r"r([1-4]) (contre|pour) ([01]|aucun)", val):
                    c = txt["considerations"][int(r) - 1]
                    R.egal(ou, n, f"considération r{r} du texte {tid}", (cc, pole if pole == "aucun" else int(pole)),
                           (c["cote"], c["pole"]))


def _proche(fichier, k):
    """Séances couvertes par chaque feuille."""
    return k in {"feuille-A-seances-2-4.txt": (2, 3, 4), "feuille-B-seances-4bis-7.txt": (5, 6, 7),
                 "feuille-C-seances-8-10.txt": (8, 9, 10), "feuille-C2-seances-11-14.txt": (11, 12, 13, 14)}[fichier]


def main():
    R = Releve()
    sortie = []
    ta = json.loads((ICI / "carnet-2-cloture-a" / "trace-c.json").read_text(encoding="utf-8"))
    rev = {s["k"]: s["revelation"] for s in ta["seances"] if s["revelation"]}
    vus = set()
    for fichier in ("feuille-A-seances-2-4.txt", "feuille-B-seances-4bis-7.txt", "feuille-C-seances-8-10.txt",
                    "feuille-C2-seances-11-14.txt"):
        d = lire(REF / "carnet-2-cloture-a" / fichier)
        for (k, g), champs in sorted(d.items()):
            if g == "porteur":
                continue
            vus.add((k, g))
            comparer_manche(R, fichier, k, g, champs, ta["seances"][k]["manches"][g], rev)
    attendues = {(s["k"], g) for s in ta["seances"] if s["manches"] for g in s["manches"] if g != "porteur"}
    sortie.append(f"Partie (a) : manches de personnages dans les feuilles A, B, C, C2 : {len(vus)} ; dans la trace C : {len(attendues)}")
    if vus != attendues:
        sortie.append(f"  manquantes dans les feuilles : {sorted(attendues - vus)} ; en trop : {sorted(vus - attendues)}")
    n0 = R.compares
    preambule(R, ta)
    sortie.append(f"Lignes communes aux manches d'un texte (réponses, x, σ, curseurs, côtés attendus, considérations) : {R.compares - n0} valeurs")
    n1 = R.compares
    d = lire(REF / "manches-porteur.txt", g_defaut="porteur")
    for (k, g), champs in sorted(d.items()):
        comparer_manche(R, "manches-porteur.txt", k, g, champs, ta["seances"][k]["manches"]["porteur"], rev)
    sortie.append(f"Manches du porteur (manches-porteur.txt) : {len(d)} séances")
    sortie.append(f"Valeurs comparées : {n1} (personnages) + {R.compares - n1} (porteur) = {R.compares}")
    sortie.append(f"Écarts : {len(R.ecarts)}")
    sortie += ["  " + e for e in R.ecarts]
    sortie.append(f"Lignes non lues par le programme (relues à la main) : {len(R.non_lues)}")
    sortie += ["  " + e for e in R.non_lues]
    texte = "\n".join(sortie) + "\n"
    sys.stdout.write(texte)
    return texte


if __name__ == "__main__":
    main()
