"""Phrases attendues du contrôle 11 (schéma, partie 4.5), à partir du fichier
scellé seul : gabarits des §7.9 et §7.10, puis règles 1 à 6 du §7.8, sur la phrase
entière."""

from .jeu import ENTREE, QUOTIDIENS, TEXTES
from .typo import afficher, date_affichee
from .tirage import sha256_hex

ETAPE = {"navette": "Le Sénat devait encore voter.",
         "definitif": "C'était le vote définitif du Parlement.",
         "aucune": ""}
TITRE = {"adopte": "Texte adopté.", "rejete": "Texte rejeté.", "sans_vote_ensemble": "Texte ni adopté ni rejeté."}


def _avec_etape(s, etape):
    e = ETAPE[etape]
    return f"{s} {e}" if e else s


def article(date):
    return (f"Le {date}, son article unique a été adopté, mais la séance a pris fin à minuit "
            "sans vote sur l'ensemble du texte.")


def votes(t, tid):
    v = t["vote"]
    date = date_affichee(v["date"])
    issue = v["issue"]
    out = {"1.6": None, "2.7d": None, "5.4": None}
    if tid in ENTREE:
        if issue == "sans_vote_ensemble":
            s = f"L'Assemblée : texte ni adopté ni rejeté. {article(date)}"
        else:
            s = _avec_etape(f"L'Assemblée : texte {'adopté' if issue == 'adopte' else 'rejeté'} le {date}.", v["etape"])
        out["1.6"] = [afficher(s)]
    else:
        n = int(tid)
        if n <= 13:
            if issue == "sans_vote_ensemble":
                b3 = article(date)
            else:
                b3 = _avec_etape(f"Le {date}.", v["etape"])
            out["2.7d"] = [afficher("Et l'Assemblée ?"), afficher(TITRE[issue]), afficher(b3)]
        if issue == "sans_vote_ensemble":
            s = f"Vote : ni adopté ni rejeté. {article(date)}"
        else:
            s = _avec_etape(f"Vote : {'adopté' if issue == 'adopte' else 'rejeté'} le {date}.", v["etape"])
        out["5.4"] = [afficher(s)]
    return out


def mandat(a):
    if a["type"] == "depute":
        return "députée" if a["feminin"] else "député"
    return "sénatrice" if a["feminin"] else "sénateur"


def auteurs(t, tid):
    a = t["auteur"]
    if a["type"] == "gouvernement":
        long_ = court = "Proposé par le Gouvernement."
    else:
        long_ = f"Proposé par {a['nom']}, {mandat(a)}, {a['groupe']}."
        court = long_ if a["type"] == "senateur" else f"Proposé par {a['nom']}, {a['groupe']}."
    out = {"1.6": None, "2.7e": None, "5.4": None}
    if tid in ENTREE:
        out["1.6"] = afficher(long_)
    else:
        if int(tid) <= 13:
            out["2.7e"] = afficher(long_)
        out["5.4"] = afficher(court)
    return out


def arguments(t):
    out = []
    for c in t["considerations"]:
        dp = c["depute"]
        de = "d'" if dp["elision"] else "de "
        out.append(afficher(f"était l'argument {de}{dp['nom']}, {'députée' if dp['feminin'] else 'député'}, {dp['groupe']}."))
    return out


def interdites(t, tid, vo, au):
    out = []
    out.append(afficher(date_affichee(t["vote"]["date"])))
    e = ETAPE[t["vote"]["etape"]]
    if e:
        out.append(afficher(e))
    out.append(afficher(TITRE[t["vote"]["issue"]]))
    for s in (au["1.6"], au["2.7e"], au["5.4"]):
        if s is not None and s not in out:
            out.append(s)
    if t["auteur"]["type"] != "gouvernement":
        out.append(afficher(t["auteur"]["nom"]))
    for c in t["considerations"]:
        n = afficher(c["depute"]["nom"])
        if n not in out:
            out.append(n)
    return out


def phrases_attendues(d, octets):
    textes = {}
    for tid in TEXTES:
        t = d["textes"][tid]
        vo = votes(t, tid)
        au = auteurs(t, tid)
        textes[tid] = {"vote": vo, "auteur": au, "arguments": arguments(t),
                       "interdites_avant_revelation": interdites(t, tid, vo, au)}
    return {"format": "elenchos-essai-phrases", "version": 1, "empreinte_scelle": sha256_hex(octets),
            "textes": textes}
