#!/usr/bin/env python3
"""Temps 2, cas chiffrés : affectation lexicographique (trace de (a) et moteur de C)
et redistribution croisée (moteur de C, désignations du cas). Les valeurs du cas
sont recopiées avec le numéro de leur ligne."""

import copy
import itertools
import json
import re
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
CONTROLE = ICI.parents[1]
REF = CONTROLE.parent / "references"
sys.path.insert(0, str(CONTROLE))

from ec import canon  # noqa: E402
from ec.jeu import cote  # noqa: E402
from ec.journal import verdicts_joueur  # noqa: E402
from ec.moteur import Partie, score  # noqa: E402
from ec.tirage import Tirage  # noqa: E402


def affectations_max(m):
    """Toutes les affectations de total maximal d'une manche de personnage (trace)."""
    cand = list(m["rangs"])
    cartes = m["cartes"]
    niv = {a: p["niveau"] for a, p in m["possibles"].items()}
    best, liste = None, []
    for perm in itertools.permutations(cand, len(cartes)):
        tot = sum(score(cote(niv[c["auteur"]]), m["cotes_attendus"][X]) for c, X in zip(cartes, perm))
        if best is None or tot > best:
            best, liste = tot, [perm]
        elif tot == best:
            liste.append(perm)
    return best, sorted(tuple(m["rangs"][X] for X in p) for p in liste)


def main():
    out = []
    ecarts = []
    n = 0

    def eq(ligne, fichier, quoi, ref, c):
        nonlocal n
        n += 1
        if ref != c:
            ecarts.append(f"{fichier}, ligne {ligne} : {quoi} : cas {ref!r} ; C {c!r}")

    ta = json.loads((ICI / "carnet-2-cloture-a" / "trace-c.json").read_text(encoding="utf-8"))
    S = ta["seances"]
    f = "cas-affectation-lexicographique.txt"
    ls = (REF / f).read_text(encoding="utf-8").split("\n")
    # cas 1 : séance 2, Valentin ; cas 2 : séance 2, Odile
    m = S[2]["manches"]["Valentin"]
    tot, aff = affectations_max(m)
    eq(16, f, "Valentin s2 : affectations de total maximal (rangs)", [(4, 2, 1), (4, 2, 3), (4, 3, 1), (4, 3, 2)], aff)
    eq(20, f, "Valentin s2 : total maximal", 5, tot)
    eq(22, f, "Valentin s2 : designe", ["Odile", "Agathe", "porteur"], [c["designe"] for c in m["cartes"]])
    eq(23, f, "Valentin s2 : total", 5, m["total"])
    d = S[3]["revelation"]["devineurs"]["Valentin"]
    eq(24, f, "Valentin s2 : révélation", ([True, False, True], 2), (d["justes"], d["points"]))
    m = S[2]["manches"]["Odile"]
    tot, aff = affectations_max(m)
    eq(34, f, "Odile s2 : affectations de total maximal", [(3, 1, 4), (3, 4, 1)], aff)
    eq(35, f, "Odile s2 : designe", ["Valentin", "Nassim", "Agathe"], [c["designe"] for c in m["cartes"]])
    d = S[3]["revelation"]["devineurs"]["Odile"]
    eq(36, f, "Odile s2 : révélation", ([True, True, True], 3), (d["justes"], d["points"]))
    # partie 3 : nombre d'affectations à égalité, manche par manche
    i = next(j for j, l in enumerate(ls, 1) if l.startswith("Séance 3, Odile (2 affectations)"))
    ref = {}
    for blob in re.split(r" ; séance ", "séance " + ls[i - 1].split(". Détail")[0][len("Séance "):]):
        mm = re.match(r"(?:séance )?([0-9]+), (.+)$", blob)
        for g, nb in re.findall(r"(Agathe|Nassim|Odile|Valentin) \(([0-9])(?: affectations)?\)", mm.group(2)):
            ref[(int(mm.group(1)), g)] = int(nb)
    obt = {}
    for s in S:
        for g, m in (s["manches"] or {}).items():
            if g != "porteur":
                nb = len(affectations_max(m)[1])
                if nb > 1:
                    obt[(s["k"], g)] = nb
    ref[(2, "Valentin")] = 4  # cas 1 (lignes 16 à 19)
    ref[(2, "Odile")] = 2     # cas 2 (ligne 34)
    eq(i, f, "manches à plusieurs affectations de total maximal (séance, devineur) → nombre", ref, obt)
    eq(i + 1, f, "nombre de manches à égalité", 36, len(obt))

    # cas de redistribution croisée (désignations du cas, moteur de C)
    f = "cas-redistribution-croisee.txt"
    d = json.loads(controle_candidat().read_text(encoding="utf-8"))
    P = Partie(d, Tirage(d["graine"]))
    man9 = P.cartes_servies("porteur", 9)
    eq(7, f, "séance 9 : places", ["Odile", "Valentin", "Agathe"], man9["places"])
    eq(8, f, "séance 9 : remplacements", [], man9["remplacements"])
    eq(9, f, "séance 9 : raison cachée", "Agathe", man9["raison_cachee"])
    eq(10, f, "séance 9 : ordre", ["Odile", "Agathe", "Valentin"], man9["ordre"])

    def jouer(man, des):
        m = copy.deepcopy(man)
        for c, (x, r) in zip(m["cartes"], des):
            c["designe"], c["raison_devinee"] = x, (r if c["cachee"] else None)
        Partie.redistribuer(m)
        v = verdicts_joueur(man, [{"designe": x, "raison": r} for x, r in des])
        justes = [c["designe"] == c["auteur_compte"] for c in m["cartes"]]
        return [c["auteur_compte"] for c in m["cartes"]], justes, v

    cas = [
        (17, "croisée", [("Odile", None), ("Valentin", 3), ("Agathe", None)],
         (["Odile", "Valentin", "Agathe"], [True, True, True], ["juste", "juste_et_raison", "juste"])),
        (34, "variante a", [("Odile", None), ("Nassim", None), ("Agathe", None)],
         (["Odile", "Valentin", "Agathe"], [True, False, True], ["juste", "faux", "juste"])),
        (39, "variante b", [("Odile", None), ("passe", None), ("Valentin", None)],
         (["Odile", "Agathe", "Valentin"], [True, False, True], ["juste", "passe", "juste"])),
        (43, "variante c", [("Odile", None), ("Agathe", None), ("Valentin", None)],
         (["Odile", "Agathe", "Valentin"], [True, True, True], ["juste", "juste", "juste"])),
        (44, "variante d", [("Odile", None), ("Nassim", None), ("passe", None)],
         (["Odile", "Agathe", "Valentin"], [True, False, False], ["juste", "faux", "passe"])),
    ]
    for ligne, nom, des, att in cas:
        eq(ligne, f, f"séance 9, {nom}", att, jouer(man9, des))
    man4 = P.cartes_servies("porteur", 4)
    eq(49, f, "séance 4 : ordre", ["Odile", "Valentin", "Agathe"], man4["ordre"])
    for ligne, nom, des, att in (
            (50, "[Agathe, Valentin, Odile r2]", [("Agathe", None), ("Valentin", None), ("Odile", 2)],
             (["Agathe", "Valentin", "Odile"], [True, True, True], ["juste", "juste", "juste_et_raison"])),
            (51, "[Nassim, Agathe, passe]", [("Nassim", None), ("Agathe", None), ("passe", None)],
             (["Odile", "Agathe", "Valentin"], [False, True, False], ["faux", "juste", "passe"])),
            (52, "[passe, passe, passe]", [("passe", None)] * 3,
             (["Agathe", "Odile", "Valentin"], [False, False, False], ["passe", "passe", "passe"]))):
        eq(ligne, f, f"séance 4, {nom}", att, jouer(man4, des))
    out.append(f"Cas chiffrés : {n} valeurs comparées, {len(ecarts)} écart(s)")
    out += ["  " + e for e in ecarts]
    texte = "\n".join(out) + "\n"
    sys.stdout.write(texte)
    return texte


def controle_candidat():
    return CONTROLE.parent / "scellement" / "candidat" / "fichier-scelle-candidat.json"


if __name__ == "__main__":
    main()
