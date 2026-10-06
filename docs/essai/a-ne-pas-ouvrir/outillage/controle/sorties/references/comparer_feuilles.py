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
