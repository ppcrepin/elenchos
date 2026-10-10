"""Phrases attendues du contrôle 11, version 2 (schéma 2, partie 5.4 ; S1, partie 4.5),
à partir du fichier scellé seul : gabarits de simulation-2, §7.10 et §7.11, puis règles
1 à 6 du §7.8, sur la phrase entière."""

from .jeu import ENTREE, JOUES
from .typo import afficher, date_affichee
from .tirage import sha256_hex

ETAPE_TEXTE = {"navette": "Le Sénat devait encore voter.", "definitif": "C'était le vote définitif du Parlement.",
               "aucune": ""}
ETAPE_OBJET = {"navette": "Le Sénat devait encore voter ce texte.", "aucune": ""}
OBJET = {"texte": "", "article": "C'était un article d'un texte plus long.",
         "amendement": "C'était un amendement, une modification d'un texte en discussion.",
         "resolution": "C'était une résolution, un texte qui invite le Gouvernement à agir, sans l'y obliger."}
SUITE = {None: "", "texte_tombe": "Avec lui, l'Assemblée a rejeté le texte entier.",
         "texte_retire": "Le jour même, le texte entier a été retiré."}
TITRE = {"adopte": "Texte adopté.", "rejete": "Texte rejeté."}
MOTION = ", avant même l'examen de ses articles."


def joindre(*xs):
    return " ".join(x for x in xs if x)


def complement(v):
    """« {objet} {étape-texte} {suite} » (ou l'étape d'un texte entier), sans la date."""
    if v["objet"] == "texte":
        return joindre(ETAPE_TEXTE[v["etape"]], SUITE[v["suite"]])
    if v["objet"] == "resolution":
        return joindre(OBJET["resolution"], SUITE[v["suite"]])
    return joindre(OBJET[v["objet"]], ETAPE_OBJET[v["etape"]], SUITE[v["suite"]])


def votes(v, ecrans):
    date = date_affichee(v["date"])
    sens = "adopté" if v["issue"] == "adopte" else "rejeté"
    out = {"1.6": None, "2.7d": None, "5.4": None}
    motion = v["objet"] == "motion"
    if "1.6" in ecrans:
        s = (f"L'Assemblée : texte rejeté le {date}{MOTION}" if motion else
             joindre(f"L'Assemblée : texte {sens} le {date}.", complement(v)))
        out["1.6"] = [afficher(joindre(s, SUITE[v["suite"]]) if motion else s)]
    if "2.7d" in ecrans:
        b3 = (joindre(f"Le {date}{MOTION}", SUITE[v["suite"]]) if motion else joindre(f"Le {date}.", complement(v)))
        out["2.7d"] = [afficher("Et l'Assemblée ?"), afficher(TITRE[v["issue"]]), afficher(b3)]
    if "5.4" in ecrans:
        s = (joindre(f"Vote : rejeté le {date}{MOTION}", SUITE[v["suite"]]) if motion else
             joindre(f"Vote : {sens} le {date}.", complement(v)))
        out["5.4"] = [afficher(s)]
    return out


def mandat(a):
    if a["type"] == "depute":
        return "députée" if a["feminin"] else "député"
    return "sénatrice" if a["feminin"] else "sénateur"


def propose(a, court):
    if a["type"] == "gouvernement":
        return "Proposé par le Gouvernement."
    if a["type"] == "commission":
        return f"Proposé par la {a['libelle']}."
    if a["groupe"] is None:
        return f"Proposé par {a['nom']}, {mandat(a)} sans groupe."
    if court and a["type"] == "depute":
        return f"Proposé par {a['nom']}, {a['groupe']}."
    return f"Proposé par {a['nom']}, {mandat(a)}, {a['groupe']}."


def auteurs(a, ecrans):
    out = {"1.6": None, "2.7e": None, "5.4": None}
    for e in ("1.6", "2.7e"):
        if e in ecrans:
            out[e] = afficher(propose(a, False))
    if "5.4" in ecrans:
        out["5.4"] = afficher(propose(a, True))
    return out


def arguments(t):
    out = []
    for c in t["considerations"]:
        dp = c["depute"]
        de = "d'" if dp["elision"] else "de "
        md = "députée" if dp["feminin"] else "député"
        fin = f"{md} sans groupe." if dp["groupe"] is None else f"{md}, {dp['groupe']}."
        out.append(afficher(f"était l'argument {de}{dp['nom']}, {fin}"))
    return out


def ecrans_de(tid):
    """Écrans qui montrent le vote et l'auteur de ce texte (QUESTIONS.md, Q-P1)."""
    if tid in ENTREE:
        return {"1.6", "5.4"}
    n = int(tid)
    e = set()
    if n <= 13:
        e |= {"2.7d", "2.7e"}
    if n >= 1:
        e.add("5.4")
    return e


def interdites(t, au):
    v = t["vote"]
    out = [afficher(date_affichee(v["date"]))]
    for x in (ETAPE_TEXTE[v["etape"]] if v["objet"] == "texte" else ETAPE_OBJET.get(v["etape"], ""),
              SUITE[v["suite"]], TITRE[v["issue"]]):
        if x and afficher(x) not in out:
            out.append(afficher(x))
    for s in (au["1.6"], au["2.7e"], au["5.4"]):
        if s is not None and s not in out:
            out.append(s)
    a = t["auteur"]
    if a["type"] in ("depute", "senateur") and afficher(a["nom"]) not in out:
        out.append(afficher(a["nom"]))
    for c in t["considerations"]:
        n = afficher(c["depute"]["nom"])
        if n not in out:
            out.append(n)
    return out


def phrases_attendues(d, octets):
    textes = {}
    for tid in JOUES:
        t = d["textes"][tid]
        ec = ecrans_de(tid)
        au = auteurs(t["auteur"], ec)
        textes[tid] = {"arguments": arguments(t), "auteur": au,
                       "interdites_avant_revelation": interdites(t, au), "vote": votes(t["vote"], ec)}
    h86 = d["histoire"]["textes"]["H86"]["fiche"]
    return {"empreinte_scelle": sha256_hex(octets), "format": "elenchos-essai-phrases",
            "surprise_arrivee": afficher(f"Surprise de la semaine : {h86['titre']}"),
            "textes": textes, "version": 2}
