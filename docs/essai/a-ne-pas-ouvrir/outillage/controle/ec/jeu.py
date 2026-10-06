"""Constantes du jeu (simulation, §0, §1, §5.5 ; schéma, partie 1)."""

from fractions import Fraction as F

PERSONNAGES = ("Agathe", "Nassim", "Odile", "Valentin")
MEMBRES = PERSONNAGES + ("porteur",)
TENSIONS = ("S", "P", "T", "L")
ENTREE = ("E1", "E2", "E3")
QUOTIDIENS = tuple(str(n) for n in range(1, 15))
TEXTES = ENTREE + QUOTIDIENS

# Libellés des pôles (§0) et premier mot (profils.md, schéma 4.1).
POLES = {
    "S": ("Sécurité", "Liberté individuelle"),
    "P": ("Précaution", "Innovation"),
    "T": ("Tradition", "Changement"),
    "L": ("Local", "National"),
}
POLES_COURTS = {t: (a.split()[0], b.split()[0]) for t, (a, b) in POLES.items()}

# §5.5 : pôles dans les phrases.
POLES_PHRASE = {
    "S": ("la sécurité", "la liberté", "sécurité et liberté"),
    "P": ("la précaution", "l'innovation", "précaution et innovation"),
    "T": ("la tradition", "le changement", "tradition et changement"),
    "L": ("la décision locale", "la décision nationale", "local et national"),
}

VALEUR = {1: F(0), 2: F(1, 4), 3: F(1, 2), 4: F(3, 4), 5: F(1)}
LIBELLE_NIVEAU = {
    1: "Très défavorable",
    2: "Défavorable",
    3: "Neutre",
    4: "Favorable",
    5: "Très favorable",
}
FERMETE_M = {"faible": F(3, 5), "moyenne": F(1), "forte": F(8, 5)}
FERMETES = ("faible", "moyenne", "forte")

# Ordre retenu des tensions (fichier caché, annexe A).
ORDRE_TENSIONS_QUOTIDIENS = "S T P S L T S P L S T P L S".split()
TENSIONS_ENTREE = ("S", "P", "L")

SEMAINE_REVELATIONS = {1: range(1, 6), 2: range(6, 13)}
SEMAINE_REPONSES = {1: range(1, 7), 2: range(7, 14)}


def cote(niveau):
    """σ : +1 favorable, 0 neutre, −1 défavorable."""
    if niveau >= 4:
        return 1
    if niveau == 3:
        return 0
    return -1


def rang_membre(m):
    return MEMBRES.index(m)


def ordre_textes(t):
    return TEXTES.index(t)


def cle_texte(n):
    """Écriture d'un texte dans les clés de tirage et le fichier : "E1", "7"."""
    return str(n)
