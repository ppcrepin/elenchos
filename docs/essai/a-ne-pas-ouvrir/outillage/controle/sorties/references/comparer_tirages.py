#!/usr/bin/env python3
"""Temps 2 : tirages.txt (clé | hex8 | N) et vecteurs de test de sa ligne 3,
recalculés par ec.tirage avec la graine du fichier candidat."""

import re
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
CONTROLE = ICI.parents[1]
REF = CONTROLE.parent / "references"
sys.path.insert(0, str(CONTROLE))

from ec import canon  # noqa: E402
from ec.tirage import Tirage  # noqa: E402


def main():
    d = canon.lire_strict((CONTROLE.parent / "scellement" / "candidat" / "fichier-scelle-candidat.json").read_bytes())
    tg = Tirage(d["graine"])
    ls = (REF / "tirages.txt").read_text(encoding="utf-8").split("\n")
    n, ecarts, familles = 0, [], {}
    graine = re.search(r"Graine : ([0-9a-f]{16})", ls[1]).group(1)
    n += 1
    if graine != d["graine"]:
        ecarts.append(f"tirages.txt, ligne 2 : graine {graine} ; fichier candidat {d['graine']}")
    for cle, hx, nn in re.findall(r"([^ ;:]+\|[^ ;]+) -> ([0-9a-f]{8}) \(([0-9]+)\)", ls[2]):
        n += 1
        if (hx, int(nn)) != (tg.hex8(cle), tg.n(cle)):
            ecarts.append(f"tirages.txt, ligne 3 : {cle} : feuille {hx} {nn} ; C {tg.hex8(cle)} {tg.n(cle)}")
    for i, l in enumerate(ls, 1):
        m = re.match(r"^(.+) \| ([0-9a-f]{8}) \| ([0-9]+)$", l)
        if not m:
            continue
        cle, hx, nn = m.group(1), m.group(2), int(m.group(3))
        familles[cle.split("|")[0]] = familles.get(cle.split("|")[0], 0) + 1
        n += 1
        if (hx, nn) != (tg.hex8(cle), tg.n(cle)) or int(hx, 16) != nn:
            ecarts.append(f"tirages.txt, ligne {i} : {cle} : feuille {hx} {nn} ; C {tg.hex8(cle)} {tg.n(cle)}")
    detail = ", ".join(f"{k} {v}" for k, v in familles.items())
    out = [f"tirages.txt : {n} valeurs comparées (graine, 3 vecteurs de test, {sum(familles.values())} clés : {detail}), "
           f"{len(ecarts)} écart(s)"]
    out += ["  " + e for e in ecarts]
    texte = "\n".join(out) + "\n"
    sys.stdout.write(texte)
    return texte


if __name__ == "__main__":
    main()
