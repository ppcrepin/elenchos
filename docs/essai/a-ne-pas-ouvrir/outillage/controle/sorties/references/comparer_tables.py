#!/usr/bin/env python3
"""Temps 2 : commun-tables.txt (tables A, C, D, E, G) contre le fichier candidat et
le moteur de C ; récapitulatif de manches-porteur.txt contre les chiffres constants."""

import re
import sys
from fractions import Fraction as F
from pathlib import Path

ICI = Path(__file__).resolve().parent
CONTROLE = ICI.parents[1]
REF = CONTROLE.parent / "references"
sys.path.insert(0, str(CONTROLE))

from ec import canon  # noqa: E402
from ec.constantes import calculer  # noqa: E402
from ec.heure import minutes, r_journee  # noqa: E402
from ec.jeu import PERSONNAGES, TEXTES, VALEUR, cote  # noqa: E402
from ec.moteur import Partie, score  # noqa: E402
from ec.portrait import classer, pole_raison  # noqa: E402
from ec.tirage import Tirage  # noqa: E402

MOINS = "−"


def main():
    octets = (CONTROLE.parent / "scellement" / "candidat" / "fichier-scelle-candidat.json").read_bytes()
    d = canon.lire_strict(octets)
    P = Partie(d, Tirage(d["graine"]))
    ls = (REF / "commun-tables.txt").read_text(encoding="utf-8").split("\n")
    ecarts, n = [], 0

    def eq(ligne, quoi, ref, c, f="commun-tables.txt"):
        nonlocal n
        n += 1
        if ref != c:
            ecarts.append(f"{f}, ligne {ligne} : {quoi} : feuille {ref!r} ; C {c!r}")

    section = None
    for i, l in enumerate(ls, 1):
        m = re.match(r"^([A-H])\. ", l)
        if m:
            section = m.group(1)
            continue
        cells = [c.strip() for c in l.split("|")]
        if section == "A" and len(cells) == 7 and cells[0] in TEXTES:
            t = d["textes"][cells[0]]
            eq(i, f"texte {cells[0]} tension, sens", (cells[1], int(cells[2])), (t["tension"], t["sens"]))
            for r, cel in enumerate(cells[3:], 1):
                cc, pole = cel.split(", ")
                ref = ({"c": "contre", "p": "pour"}[cc], "aucun" if pole == "a" else int(pole.split()[-1]))
                c = t["considerations"][r - 1]
                eq(i, f"texte {cells[0]} r{r}", ref, (c["cote"], c["pole"]))
        elif section == "C" and len(cells) == 5 and re.match(r"(E[1-3]|[0-9]+) \(", cells[0]):
            tid = cells[0].split()[0]
            for p, cel in zip(PERSONNAGES, cells[1:]):
                rep = d["reponses"][tid].get(p)
                if cel == "abs":
                    eq(i, f"{p} texte {tid}", "abs", "abs" if rep is None else rep)
                    continue
                m = re.match(r"\(([0-9]),([0-9]|aucune)\)", cel)
                rai = m.group(2) if m.group(2) == "aucune" else int(m.group(2))
                eq(i, f"{p} texte {tid} réponse", {"niveau": int(m.group(1)), "raison": rai}, rep)
                cl, w, pi = classer(rep, P.textes[tid])
                aty = any(a["texte"] == tid for a in d["reponses_atypiques"].get(p, []))
                eq(i, f"{p} texte {tid} [aty]", "[aty]" in cel, aty)
                sig = cote(rep["niveau"])
                eq(i, f"{p} texte {tid} côté", re.search(r"(défav|fav|neutre)", cel).group(1),
                   {1: "fav", -1: "défav", 0: "neutre"}[sig])
                if sig != 0:
                    s = P.textes[tid]["sens"]
                    eq(i, f"{p} texte {tid} π", int(re.search(r"π([01])", cel).group(1)), s if sig == 1 else 1 - s)
                    mr = re.search(r"ρ ?([01]|aucun)", cel)
                    rho = pole_raison(rep["raison"], P.textes[tid]["considerations"])
                    eq(i, f"{p} texte {tid} ρ", mr.group(1) if mr.group(1) == "aucun" else int(mr.group(1)), rho)
                mw = re.search(r"w([0-9/]+)", cel)
                eq(i, f"{p} texte {tid} w", F(mw.group(1)), w)
                mp = re.search(r"π([01])", cel)
                eq(i, f"{p} texte {tid} π", int(mp.group(1)) if mp and w > 0 else None, pi if w > 0 else None)
        elif section == "D" and re.match(r"^(Agathe|Nassim|Odile|Valentin) [SPTL] \|", l):
            p, T = cells[0].split()
            for morceau in cells[1:]:
                m2 = re.match(r"(?:après )?([0-9]+) : (inchangé \(w 0\)|absent)$", morceau)
                if m2:
                    # « après n : inchangé (w 0) » : w = 0 au texte n ; « n : absent » : pas de réponse au texte n.
                    # Dans les deux cas, le curseur après n est celui d'avant n.
                    nn = int(m2.group(1))
                    if m2.group(2) == "absent":
                        eq(i, f"{p} absent au texte {nn}", True, p not in d["reponses"][str(nn)])
                    else:
                        eq(i, f"w de {p} au texte {nn}", F(0), classer(d["reponses"][str(nn)][p], P.textes[str(nn)])[1])
                    eq(i, f"curseur {p} {T} inchangé au texte {nn}", P.curseur_membre(p, T, nn - 1),
                       P.curseur_membre(p, T, nn))
                    continue
                m = re.match(r"(?:E[1-3] :|rien à l'entrée :|après ([0-9]+) :)? ?\(([0-9/]+),([0-9/]+)\) → ([0-9/]+) ; ([0-9/]+) ; ([0-9/]+)( à tout moment)?", morceau)
                if not m:
                    eq(i, f"morceau lu : {morceau!r}", True, False)
                    continue
                if m.group(7):
                    for hz in range(1, 15):
                        eq(i, f"curseur {p} {T} après {hz} (à tout moment)", P.curseur_membre(p, T, 0),
                           P.curseur_membre(p, T, hz))
                horizon = int(m.group(1)) if m.group(1) else 0
                cur = P.curseur_membre(p, T, horizon)
                swp = F(0)
                for tid in TEXTES[:3 + horizon]:
                    if p in d["reponses"][tid] and P.textes[tid]["tension"] == T:
                        cl, w, pi = classer(d["reponses"][tid][p], P.textes[tid])
                        if pi is not None:
                            swp += w * pi
                q = (F(95, 100) - cur["l"]) / F(70, 100)
                eq(i, f"curseur {p} {T} après {horizon or 'l’entrée'}",
                   tuple(F(x) for x in m.group(2, 3, 4, 5, 6)), (cur["somme_w"], swp, cur["c"], cur["l"], q))
        elif section == "D" and re.match(r"^texte ([0-9]+) \([SPTL]\) \|", l):
            k = int(re.match(r"^texte ([0-9]+)", l).group(1))
            T = P.textes[str(k)]["tension"]
            for morceau in cells[1:]:
                m = re.match(r"(Agathe|Nassim|Odile|Valentin) \(([0-9/]+)\) ([0-9/]+), q ([0-9/]+)", morceau)
                if m:
                    cur = P.curseur_membre(m.group(1), T, k - 1)
                    q = (F(95, 100) - cur["l"]) / F(70, 100)
                    eq(i, f"curseur de {m.group(1)} avant le texte {k}", (F(m.group(2)), F(m.group(3)), F(m.group(4))),
                       (cur["somme_w"], cur["c"], q))
                elif morceau.startswith("tous"):
                    for p in PERSONNAGES:
                        cur = P.curseur_membre(p, T, k - 1)
                        eq(i, f"curseur de {p} avant le texte {k}", (F(0), F(1, 2)), (cur["somme_w"], cur["c"]))
        elif section == "E" and re.match(r"^[SPTL], s=[01] ", l):
            T, s = cells[0][0], int(cells[0][5])
            for p, cel in zip(PERSONNAGES, cells[1:]):
                m = re.match(r"a ([0-9]+)/100 → ([+" + MOINS + "]?[0-9])", cel)
                pos = F(d["personnages"][p]["profil"][T]["position"], 100)
                a = pos if s == 1 else 1 - pos
                c = 1 if a >= F(3, 5) else (-1 if a <= F(2, 5) else 0)
                eq(i, f"côté attendu {p} {T} s={s}", (F(int(m.group(1)), 100), int(m.group(2).replace(MOINS, "-"))), (a, c))
        elif section == "B" and len(cells) == 3 and cells[0] in ("v(niveau)", "x si s = 1", "x si s = 0"):
            # C : VALEUR (ec/jeu.py) et x = v si s = 1, sinon 1 − v (Partie.cartes_servies)
            for niv, val in re.findall(r"([1-5]) → ([0-9/]+)", cells[2]):
                v = VALEUR[int(niv)]
                c = {"v(niveau)": v, "x si s = 1": v, "x si s = 0": 1 - v}[cells[0]]
                eq(i, f"{cells[0]}, niveau {niv}", F(val), c)
        elif section == "F" and l.startswith("σ |"):
            for groupe, sig in re.findall(r"niveau ([0-9 ou]+) → ([+" + MOINS + "]?[01])", l):
                for niv in re.findall(r"[1-5]", groupe):
                    eq(i, f"σ du niveau {niv}", int(sig.replace(MOINS, "-")), cote(int(niv)))
        elif section == "F" and l.startswith("Score d'une carte"):
            for sig in (-1, 0, 1):
                for e in (-1, 0, 1, "inconnu"):
                    ref = 2 if sig == e else (1 if (sig == 0 or e == 0 or e == "inconnu") else 0)
                    eq(i, f"score σ {sig}, côté attendu {e}", ref, score(sig, e))
        elif section == "G":
            m = re.match(r"^r\((Agathe|Nassim|Odile|Valentin) ([0-9:]+) = ([0-9]+)\) \| .* \| ([0-9]+)$", l)
            if m:
                h = d["personnages"][m.group(1)]["heure_de_jeu"]
                eq(i, f"r({m.group(1)})", (m.group(2), int(m.group(3)), int(m.group(4))), (h, minutes(h), r_journee(minutes(h))))
    # récapitulatif de manches-porteur.txt contre les chiffres constants de C
    c, mans = calculer(d)
    lp = (REF / "manches-porteur.txt").read_text(encoding="utf-8").split("\n")
    i = next(j for j, l in enumerate(lp, 1) if l.startswith("Chiffres constants qui en découlent"))
    l = lp[i - 1]
    f = "manches-porteur.txt"
    eq(i, "cartes servies", 38, c["cartes"], f)
    eq(i, "remplacements", 2, len(c["remplacements"]), f)
    eq(i, "manches et cartes identiques servies ensemble", (2, 5), (c["identiques_manches"], c["identiques_cartes"]), f)
    eq(i, "raisons « aucune » affichées, cachées, cartes cachées déplacées", (2, 0, [5, 7]),
       (c["aucune_affichees"], c["aucune_cachees"], c["cachees_deplacees"]), f)
    eq(i, "égalités de classement", 2, c["departages"], f)
    eq(i, "réponses atypiques parmi les cartes", 10, c["cartes_atypiques"], f)
    eq(i, "manches à deux cartes", 1, sum(1 for v in c["tailles_manches"].values() if v == 2), f)
    eq(i, "manche à deux cartes : séance", [11], [k for k, v in c["tailles_manches"].items() if v == 2], f)
    eq(i, "cartes identiques servies ensemble, par séance", {4: 3, 9: 2},
       {k: sum(len(g) for g in v) for k, v in c["identiques_detail"].items()}, f)
    aty = {(p, a["texte"]) for p, lst in d["reponses_atypiques"].items() for a in lst}
    servies = sorted((k, x["auteur"]) for k, man in mans.items() for x in man["cartes"] if (x["auteur"], str(k - 1)) in aty)
    ref = [(4, "Odile"), (4, "Valentin"), (6, "Nassim"), (7, "Odile"), (9, "Valentin"), (10, "Odile"), (11, "Agathe"),
           (13, "Nassim"), (13, "Valentin"), (14, "Agathe")]
    eq(i, "réponses atypiques parmi les cartes (séance, auteur)", ref, servies, f)
    eq(i, "réponses atypiques non servies", [("Agathe", "2"), ("Nassim", "7")],
       sorted(a for a in aty if (int(a[1]) + 1, a[0]) not in set(servies)), f)
    aucune = sorted((k, x["auteur"]) for k, man in mans.items() for x in man["cartes"]
                    if man["possibles"][x["auteur"]]["raison"] == "aucune" and not x["cachee"])
    eq(i, "raisons « aucune » affichées (séance, auteur)", [(5, "Valentin"), (7, "Agathe")], aucune, f)
    for j, l2 in enumerate(lp, 1):
        m = re.match(r"^S([0-9]+) texte ([0-9]+) \| (.+?)(?:   —.*)?$", l2)
        if m:
            k = int(m.group(1))
            ref = [(a, star == "*", int(niv), r if r == "aucune" else int(r))
                   for a, star, niv, r in re.findall(r"(Agathe|Nassim|Odile|Valentin)(\*?) \(([0-9]),([0-9]|aucune)\)", m.group(3))]
            obt = [(x["auteur"], x["cachee"], x["_niveau"], x["_raison"]) for x in mans[k]["cartes"]]
            eq(j, f"récapitulatif séance {k}", ref, obt, f)
    out = [f"commun-tables.txt et récapitulatif de manches-porteur.txt : {n} valeurs comparées, {len(ecarts)} écart(s)"]
    out += ["  " + e for e in ecarts]
    texte = "\n".join(out) + "\n"
    sys.stdout.write(texte)
    return texte


if __name__ == "__main__":
    main()
