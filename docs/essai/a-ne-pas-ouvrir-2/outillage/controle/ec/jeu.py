"""Constantes du jeu, second essai (simulation-2, §0, §1 ; schéma 2, parties 1.2 et 1.3).

Rien de ce qui se lit dans le fichier scellé (calendrier, semaines, membres,
réglage) n'est écrit ici en dur pour le calcul : les tables du §0 sont
recalculées par `calendrier.py` et comparées au fichier (contrôle 1, étape 5).
"""

from fractions import Fraction as F

PERSONNAGES = ("Agathe", "Nassim", "Odile", "Valentin")
MEMBRES = PERSONNAGES + ("porteur",)
TENSIONS = ("S", "P", "T", "L")
ENTREE = ("E1", "E2", "E3")
HISTOIRE = tuple(f"H{i}" for i in range(1, 91))
ESSAI = tuple(str(n) for n in range(0, 15))          # T0 à T14, clés « 0 » à « 14 »
JOUES = ENTREE + ESSAI                                 # les 18 textes de `textes`
TOUS = ENTREE + HISTOIRE + ESSAI                       # ordre du calendrier (schéma 2, 1.3)
_RANG = {t: i for i, t in enumerate(TOUS)}

POLES = {
    "S": ("Sécurité", "Liberté individuelle"),
    "P": ("Précaution", "Innovation"),
    "T": ("Tradition", "Changement"),
    "L": ("Local", "National"),
}
POLES_COURTS = {t: (a.split()[0], b.split()[0]) for t, (a, b) in POLES.items()}

POLES_PHRASE = {
    "S": ("la sécurité", "la liberté", "sécurité et liberté"),
    "P": ("la précaution", "l'innovation", "précaution et innovation"),
    "T": ("la tradition", "le changement", "tradition et changement"),
    "L": ("la décision locale", "la décision nationale", "local et national"),
}

VALEUR = {1: F(0), 2: F(1, 4), 3: F(1, 2), 4: F(3, 4), 5: F(1)}
LIBELLE_NIVEAU = {1: "Très défavorable", 2: "Défavorable", 3: "Neutre", 4: "Favorable",
                  5: "Très favorable"}
FERMETE_M = {"faible": F(3, 5), "moyenne": F(1), "forte": F(8, 5)}
FERMETES = ("faible", "moyenne", "forte")

TEMPERAMENTS = ("original", "pont", "mesure", "tranche")   # ordre d'affichage (§6, point 8)
TITRES = ("sans_faute", "devin", "mystere", "fidele")

# Fichier caché, point 14 : ordres des tensions de T0 à T14 et de l'entrée.
ORDRES_TENSIONS = {
    "retenu": ("S L P S L T S P L S P L S T P".split(), ("S", "P", "T")),
    "R2": ("S L P S L T S L P L S L P T P".split(), ("S", "P", "T")),
    "R3": ("S T P S L T S P L S P L S T P".split(), ("S", "P", "L")),
}

# Seuils tenus par le programme (annexe B : jamais lus dans le fichier).
SEUIL_NET = 10                    # §5 : Σ w ≥ 10
SEUIL_PENCHE = F(1, 5)            # §6, point 7 : |c − 1/2| ≥ 1/5
TEMP_FENETRE = 56                 # §6, point 8 : 56 derniers jours, ce dimanche compris
TEMP_ANCIENNETE = 56
TEMP_REPONSES_MIN = 20
TEMP_ORIGINAL = F(3, 10)
TEMP_PONT = F(1, 8)
TEMP_PONT_PARTAGES_MIN = 6
TEMP_MESURE = F(1, 3)
TEMP_TRANCHE = F(1, 2)
ABSENCE_SEUIL = F(1, 14)          # fichier caché, point 3, 2.4
ABSENCE_FENETRE = 6
ALPHAS = (F(1, 6), F(1, 4), F(1, 3))
FACTEURS = (2, 3, 4)
BARRE = 16


def cote(niveau):
    """σ : +1 favorable, 0 neutre, −1 défavorable."""
    if niveau >= 4:
        return 1
    if niveau == 3:
        return 0
    return -1


def rang_texte(t):
    return _RANG[t]


def jour_du_texte(t):
    """Jour où le texte est répondu ; None pour l'entrée (avant le jour −90)."""
    if t in ENTREE:
        return None
    if t.startswith("H"):
        return int(t[1:]) - 91
    return int(t)


def texte_du_jour(j):
    """Texte répondu le jour j (−90 à 14), ou None."""
    if -90 <= j <= -1:
        return f"H{j + 91}"
    if 0 <= j <= 14:
        return str(j)
    return None


def periode(t):
    if t in ENTREE:
        return "entree"
    return "histoire" if t.startswith("H") else "essai"


def textes_jusqu_au(j):
    """Entrée, puis textes répondus du jour −90 au jour j inclus, dans l'ordre du calendrier."""
    out = list(ENTREE)
    for k in range(-90, min(j, 14) + 1):
        out.append(texte_du_jour(k))
    return out
