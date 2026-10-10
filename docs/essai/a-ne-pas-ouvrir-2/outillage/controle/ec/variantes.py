"""Contrôle 12 du second essai (simulation-2, §9, point 12 ; S1, partie 4.3) sur des
traces C de variantes d'une même partie : seules les réponses du porteur changent ; les
blocs de jour et de saut du carnet, et les mesures, restent identiques (durées masquées) ;
seuls « Semaine » et « Sur tout l'essai » peuvent différer. Rien de l'avis du cercle, de
la barre ni du Pas de Côté du porteur dans le carnet."""

from .carnet import masquer_durees, verifier_forme
from .comparer import differences
from .rejeu import masquer

PREFIXES_LIBRES = ("Semaine ", "Sur tout l’essai", "Questions de fin")
INTERDITS = ("avis du cercle", "Ton cercle", "Milieu des réponses", "Pas de Côté", "barre", "curseur")


def blocs_fixes(texte):
    blocs = texte.split("\n\n")
    return [masquer_durees(b) for b in blocs[1:-1] if not b.startswith(PREFIXES_LIBRES)]


def comparer_variantes(traces):
    d = []
    for n, t in enumerate(traces):
        pseudo = t["jours"]["1"]["coups"]["pseudo"]
        textes = ([("carnet", t["carnet"]["texte"])] if t["carnet"] else []) + \
            [(f"copie {i}", c["texte"]) for i, c in enumerate(t["copies"])]
        for nom, x in textes:
            for y in verifier_forme(x, pseudo):
                d.append(f"variante {n} : {nom} : {y}")
            for b in blocs_fixes(x):
                for mot in INTERDITS:
                    if mot in b:
                        d.append(f"variante {n} : {nom} : « {mot} » dans un bloc de jour ou de saut")
    ref = traces[0]
    for n, t in enumerate(traces[1:], start=1):
        if sorted(t["jours"]) != sorted(ref["jours"]):
            d.append(f"variante {n} : jours atteints différents")
            continue
        for k in ref["jours"]:
            for p, x, y in differences(masquer(ref["jours"][k]["mesures"]), masquer(t["jours"][k]["mesures"])):
                d.append(f"variante {n} : /jours/{k}/mesures{p} : {x!r} ≠ {y!r}")
        for i, (sa, sb) in enumerate(zip(ref["sauts"], t["sauts"])):
            for p, x, y in differences(masquer(sa["mesures"]), masquer(sb["mesures"])):
                d.append(f"variante {n} : /sauts/{i}/mesures{p} : {x!r} ≠ {y!r}")
        if ref["carnet"] is not None and t["carnet"] is not None:
            if blocs_fixes(ref["carnet"]["texte"]) != blocs_fixes(t["carnet"]["texte"]):
                d.append(f"variante {n} : carnet : blocs de jour ou de saut différents")
        for i, (ca, cb) in enumerate(zip(ref["copies"], t["copies"])):
            for p, x, y in differences(masquer(ca["mesures"]), masquer(cb["mesures"])):
                d.append(f"variante {n} : /copies/{i}/mesures{p} : {x!r} ≠ {y!r}")
            if blocs_fixes(ca["texte"]) != blocs_fixes(cb["texte"]):
                d.append(f"variante {n} : copie {i} : blocs de jour ou de saut différents")
    return d
