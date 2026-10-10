"""Le portrait (simulation, §5 ; simulation-2, §5) : classes, curseurs, phrases.

Second essai : la règle « un curseur net arrête le programme » est retirée
(simulation-2, §5.4) ; le facteur du portrait accéléré multiplie les poids du
porteur (§5.9). `ordre_moi` et les phrases sont ceux du premier essai, à
adapter au jalon suivant (§5.3 et §5.7 du second essai).
"""

from fractions import Fraction as F

from .jeu import POLES_PHRASE, TENSIONS, SEUIL_NET
from .typo import afficher


def pole_raison(raison, considerations):
    """ρ : pôle de la raison ; « aucun » si hors tension ou « aucune »."""
    if raison == "aucune":
        return "aucun"
    for c in considerations:
        if c["rang"] == raison:
            return c["pole"]
    raise ValueError(f"raison {raison!r} absente des considérations")


def classer(rep, txt):
    """§5.1. Rend (classe, w, π ou None)."""
    niveau = rep["niveau"]
    if niveau == 3:
        return "neutre", F(0), None
    s = txt["sens"]
    pi = s if niveau >= 4 else 1 - s
    rho = pole_raison(rep["raison"], txt["considerations"])
    if rho == "aucun":
        return "penchant", F(1, 2), pi
    if rho == pi:
        return "arbitrage", F(1), pi
    return "tiraille", F(0), None


def curseur(classes, facteur=1):
    """§5.2 (§5.9 pour le facteur). classes : [(classe, w, π)]. Rend
    {"somme_w", "c", "l", "net"}, avec somme_w = Σ facteur·w."""
    sw = sum((facteur * w for _, w, _ in classes), F(0))
    swp = sum((facteur * w * pi for _, w, pi in classes if pi is not None), F(0))
    c = (2 + swp) / (4 + sw)
    l = max(F(95, 100) - F(7, 100) * sw, F(1, 4))
    return {"somme_w": sw, "c": c, "l": l, "net": sw >= SEUIL_NET}


def ordre_moi(tensions_curseurs):
    """§5.3 : nets, puis flous du plus étroit au plus large ; à égalité S, P, T, L."""
    nets = [t for t in TENSIONS if tensions_curseurs[t]["net"]]
    flous = [t for t in TENSIONS if not tensions_curseurs[t]["net"]]
    flous.sort(key=lambda t: (tensions_curseurs[t]["l"], TENSIONS.index(t)))
    return nets + flous


def _contracter(phrase):
    return phrase.replace(" à le ", " au ")


def phrase_jour(classe, tension, pi):
    p0, p1, _ = POLES_PHRASE[tension]
    if classe == "arbitrage":
        gagnant, perdant = (p1, p0) if pi == 1 else (p0, p1)
        s = f"Aujourd'hui, tu as fait passer {gagnant} avant {perdant}."
    elif classe == "penchant":
        s = f"Aujourd'hui, tu as penché vers {p1 if pi == 1 else p0}."
    elif classe == "tiraille":
        s = f"Aujourd'hui, tu as donné du poids à {p0} comme à {p1}."
    else:
        s = f"Aujourd'hui, tu n'as penché ni vers {p0} ni vers {p1}."
    return afficher(_contracter(s))


def phrase_semaine(cas, tension=None, pole=None):
    if cas == "floue":
        s = "Cette semaine, ton portrait est encore flou. Chaque réponse le précise."
    else:
        p0, p1, entre = POLES_PHRASE[tension]
        nom = p1 if pole == 1 else p0
        if cas == "nette":
            s = f"Entre {entre}, tu choisis le plus souvent {nom}."
        elif cas == "difference":
            s = f"Cette semaine, entre {entre}, tu as le plus souvent choisi {nom}."
        elif cas == "egalite":
            s = f"Cette semaine, entre {entre}, tu as penché autant d'un côté que de l'autre."
        else:
            raise ValueError(cas)
    return afficher(_contracter(s))
