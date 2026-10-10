"""Comparaisons : traces (partie 4.2), carnets (contrôle 13), variantes (contrôle 12)."""

from . import canon
from .carnet import masquer_durees, verifier_gabarit
from .rejeu import masquer


def pointeur(chemin):
    return "".join("/" + str(p).replace("~", "~0").replace("/", "~1") for p in chemin)


def differences(a, b, chemin=()):
    """[(JSON Pointer, valeur A, valeur B)] ; types comparés strictement (true ≠ 1)."""
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append((pointeur(chemin + (k,)), "\u2039absente\u203a", b[k]))
            elif k not in b:
                out.append((pointeur(chemin + (k,)), a[k], "\u2039absente\u203a"))
            else:
                out.extend(differences(a[k], b[k], chemin + (k,)))
    elif isinstance(a, list) and isinstance(b, list):
        for i in range(max(len(a), len(b))):
            if i >= len(a):
                out.append((pointeur(chemin + (i,)), "\u2039absente\u203a", b[i]))
            elif i >= len(b):
                out.append((pointeur(chemin + (i,)), a[i], "\u2039absente\u203a"))
            else:
                out.extend(differences(a[i], b[i], chemin + (i,)))
    elif type(a) is not type(b) or a != b:
        out.append((pointeur(chemin), a, b))
    return out


def comparer_traces(trace_p, trace_c):
    """Étapes 3 à 5 de la partie 4.2. Rend (identiques, différences)."""
    a = canon.octets_canoniques(masquer(trace_p))
    b = canon.octets_canoniques(masquer(trace_c))
    if a == b:
        return True, []
    return False, differences(masquer(trace_p), masquer(trace_c))


def comparer_carnets(texte_page, texte_c):
    """Contrôle 13 : durées remplacées par « \u2039durée\u203a » dans les deux textes."""
    a, b = masquer_durees(texte_page), masquer_durees(texte_c)
    if a == b:
        return True, []
    la, lb = a.split("\n"), b.split("\n")
    diffs = []
    for i in range(max(len(la), len(lb))):
        x = la[i] if i < len(la) else "\u2039absente\u203a"
        y = lb[i] if i < len(lb) else "\u2039absente\u203a"
        if x != y:
            diffs.append((i + 1, x, y))
    return False, diffs


def blocs_de_seance(texte):
    """Blocs du carnet, sans l'en-tête, les titres, « Sur tout l\u2019essai » ni « Fin du carnet »."""
    blocs = texte.split("\n\n")
    out = []
    for b in blocs[1:-1]:
        t = b.split("\n")[0]
        if t.startswith("Titres de la semaine") or t == "Sur tout l\u2019essai":
            continue
        out.append(b)
    return out


def comparer_variantes(traces):
    """Contrôle 12 (partie 4.3) sur des traces C de variantes d'une même partie.
    Rend la liste des défauts."""
    d = []
    ref = traces[0]
    for n, t in enumerate(traces):
        pseudo = t["seances"][0]["coups"]["pseudo"]
        if t["carnet"] is not None:
            for x in verifier_gabarit(t["carnet"]["texte"], pseudo):
                d.append(f"variante {n} : carnet : {x}")
        for i, cp in enumerate(t["copies"]):
            for x in verifier_gabarit(cp["texte"], pseudo):
                d.append(f"variante {n} : copie {i} : {x}")
    for n, t in enumerate(traces[1:], start=1):
        if len(t["seances"]) != len(ref["seances"]):
            d.append(f"variante {n} : nombre de séances différent")
            continue
        for k, (sa, sb) in enumerate(zip(ref["seances"], t["seances"])):
            for p, x, y in differences(masquer(sa["mesures"]), masquer(sb["mesures"])):
                d.append(f"variante {n} : /seances/{k}/mesures{p} : {x!r} ≠ {y!r}")
        if ref["carnet"] is not None:
            ba = [masquer_durees(b) for b in blocs_de_seance(ref["carnet"]["texte"])]
            bb = [masquer_durees(b) for b in blocs_de_seance(t["carnet"]["texte"])]
            if ba != bb:
                for i, (x, y) in enumerate(zip(ba, bb)):
                    if x != y:
                        d.append(f"variante {n} : carnet, bloc {i} : {x!r} ≠ {y!r}")
                if len(ba) != len(bb):
                    d.append(f"variante {n} : carnet : nombre de blocs différent")
        for i, (ca, cb) in enumerate(zip(ref["copies"], t["copies"])):
            for p, x, y in differences(masquer(ca["mesures"]), masquer(cb["mesures"])):
                d.append(f"variante {n} : /copies/{i}/mesures{p} : {x!r} ≠ {y!r}")
            ba = [masquer_durees(b) for b in blocs_de_seance(ca["texte"])]
            bb = [masquer_durees(b) for b in blocs_de_seance(cb["texte"])]
            if ba != bb:
                d.append(f"variante {n} : copie {i} : blocs de séance différents")
    return d
