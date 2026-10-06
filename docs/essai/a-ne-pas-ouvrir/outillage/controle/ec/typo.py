"""Typographie à l'affichage (simulation, §7.8), règles 1 à 6, dans l'ordre.

Les règles s'appliquent à la phrase entière, toutes ses valeurs insérées, sauf
le pseudo (inséré après, par l'appelant). Le carnet n'applique que la règle 1.
"""

import re

ESP = " "
FINE = "\u202f"  # espace fine insécable
INSEC = "\u00a0"  # espace insécable
APOS = "\u2019"

MOIS = ("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre")


def regle1(s):
    return s.replace("'", APOS)


def regle2(s):
    return re.sub(r" (?=[?!;])", FINE, s)


def regle3(s):
    s = re.sub(r" (?=[:»·])", INSEC, s)
    s = re.sub(r"(?<=[«←]) ", INSEC, s)
    return s


def regle4(s):
    # compte à rebours « {h} h {mm} »
    return re.sub(r"(?<![0-9])([0-9]+) h ([0-9]{2})(?![0-9])", r"\1" + INSEC + "h" + INSEC + r"\2", s)


_RE_DATE = re.compile(r"(?<![0-9])(1er|[0-9]{1,2}) (" + "|".join(MOIS) + r") ([0-9]{4})(?![0-9])")


def regle5(s):
    return _RE_DATE.sub(lambda m: m.group(1) + INSEC + m.group(2) + INSEC + m.group(3), s)


def regle6(s):
    sortie = []
    i = 0
    n = len(s)
    while i < n:
        ch = s[i]
        if ch == ESP and i > 0 and "0" <= s[i - 1] <= "9":
            suite = s[i + 1 : i + 4]
            apres = s[i + 4] if i + 4 < n else ""
            tranche = (len(suite) == 3 and all("0" <= c <= "9" for c in suite)
                       and not ("0" <= apres <= "9" if apres else False))
            pourcent = s[i + 1 : i + 2] == "%"
            sortie.append(FINE if (tranche or pourcent) else INSEC)
        else:
            sortie.append(ch)
        i += 1
    return "".join(sortie)


def afficher(s):
    """Règles 1 à 6 du §7.8, dans l'ordre."""
    for r in (regle1, regle2, regle3, regle4, regle5, regle6):
        s = r(s)
    return s


def date_affichee(date_iso):
    """{date} du §7.9 en typographie simple : « 9 octobre 2024 », « 1er mars 2025 »."""
    a, m, j = date_iso.split("-")
    j = int(j)
    return f"{'1er' if j == 1 else j} {MOIS[int(m) - 1]} {int(a)}"
