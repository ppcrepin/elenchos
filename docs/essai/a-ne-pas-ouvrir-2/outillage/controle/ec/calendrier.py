"""Tables exigées du fichier scellé, recalculées à partir du §0 de simulation-2
(schéma 2, parties 2.3 et 2.4 ; contrôle 1, étape 5 : « Le contrôle les recalcule
à partir du §0, sans les recopier »).

Ce qui est pris au §0 :
- le jour j est un lundi si (j − 1) mod 7 = 0 ;
- le texte répondu le jour j est deviné le jour j + 1 et révélé le jour j + 2 ;
- deux sauts à points fixes : jours 4 à 6, puis 8 à 13 ; jours joués 1, 2, 3, 7, 14 ;
  clôture au jour 15 ;
- révélations lues : T0, T1, T2, T6, T13 avec cartes, T5 et T12 au vote ; T3, T4,
  T7 à T11 jamais lues ; H90 (jour 1) : le porteur n'en voit rien ;
- Deviner aux jours joués (1, 2, 3, 7, 14), jamais aux jours 4 et 8 ;
- la semaine w va du jour 7(w − 14) + 1 au jour 7(w − 13).
"""

from .jeu import texte_du_jour

NOMS_JOURS = ("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche")
JOUES = (1, 2, 3, 7, 14)
SAUTS = {1: (4, 5, 6), 2: (8, 9, 10, 11, 12, 13)}
CLOTURE = 15


def nom_jour(j):
    return NOMS_JOURS[(j - 1) % 7]


def type_jour(j):
    if j in JOUES:
        return "joue"
    if j == CLOTURE:
        return "cloture"
    for jours in SAUTS.values():
        if j == jours[0]:
            return "joue_puis_saut"
        if j in jours:
            return "saute"
    raise ValueError(j)


def saut_du_jour(j):
    for n, jours in SAUTS.items():
        if j in jours:
            return n
    return None


def revelation_porteur(j):
    """Ce que le porteur vit de la révélation du jour j (texte du jour j − 2)."""
    if j == 1:
        return "aucune"          # H90 : pas de manche du porteur sur H90
    if type_jour(j) == "saute":
        return "jamais_lue"
    return "lue"


def table_calendrier():
    out = []
    for j in range(1, 16):
        t = type_jour(j)
        out.append({
            "deviner_porteur": t == "joue",
            "jour": j,
            "manche": texte_du_jour(j - 1) if j <= 14 else None,
            "nom_jour": nom_jour(j),
            "repondu": texte_du_jour(j) if j <= 14 else None,
            "revelation_porteur": revelation_porteur(j),
            "revele": texte_du_jour(j - 2),
            "saut": saut_du_jour(j),
            "type": t,
        })
    return out


def table_semaines():
    return [{"dernier_jour": 7 * (w - 13), "numero": w, "premier_jour": 7 * (w - 14) + 1}
            for w in range(1, 16)]


def table_cercle():
    membres = [{"depuis": -90, "membre": p} for p in ("Agathe", "Nassim", "Odile", "Valentin")]
    membres.append({"depuis": 1, "membre": "porteur"})
    return {"invitant": "Valentin", "membres": membres, "nom": "Amis"}
