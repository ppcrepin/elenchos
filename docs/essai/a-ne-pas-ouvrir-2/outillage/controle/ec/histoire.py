"""L'histoire du cercle (jours −90 à 0), recalculée à partir du fichier scellé seul :
trace de l'histoire, version 1 (schéma 2, partie 4.2), et résumé de l'état à
l'arrivée, version 1 (partie 3.2). Critères du calibrage (fichier caché 2,
point 10) en plus, pour le rapport : ils ne sont pas dans la trace.
"""

from fractions import Fraction as F

from . import canon
from .jeu import PERSONNAGES, TENSIONS, texte_du_jour
from .moteur import Moteur
from .tirage import Tirage, sha256_hex

JOUR_ARRIVEE = 1


def _f(x):
    return canon.frac(x)


def ecrire_manche(man):
    """Manche au format de la trace (partie 4.3.4), fractions écrites « p/q »."""
    poss = {}
    for X, P in man["possibles"].items():
        poss[X] = {"c": _f(P["c"]), "distance": _f(P["distance"]), "l": _f(P["l"]), "net": P["net"],
                   "niveau": P["niveau"], "raison": P["raison"], "rarete": _f(P["rarete"]),
                   "somme_w": _f(P["somme_w"]), "surprise": _f(P["surprise"]), "x": _f(P["x"])}
    cp = man["curseur_porteur"]
    return {
        "candidats": list(man["candidats"]),
        "cartes": [ecrire_carte(c) for c in man["cartes"]],
        "classement": list(man["classement"]),
        "cotes_attendus": man["cotes_attendus"],
        "curseur_porteur": None if cp is None else {"c": _f(cp["c"]), "somme_w": _f(cp["somme_w"])},
        "departages": man["departages"],
        "mediane": None if man["mediane"] is None else _f(man["mediane"]),
        "ordre": list(man["ordre"]),
        "places": list(man["places"]),
        "possibles": poss,
        "raison_cachee": man["raison_cachee"],
        "rangs": man["rangs"],
        "remplacements": list(man["remplacements"]),
        "texte": man["texte"],
        "total": man["total"],
    }


def ecrire_carte(c):
    return {k: c[k] for k in ("auteur", "auteur_compte", "cachee", "designe", "raison_devinee")}


def ecrire_curseur(cur, avec_l=True):
    o = {"c": _f(cur["c"]), "somme_w": _f(cur["somme_w"])}
    if avec_l:
        o["l"] = _f(cur["l"])
        o["net"] = cur["net"]
    return o


def titres_texte(scelle):
    """Textes qui ont un titre (fichier caché 2, point 9) : les textes joués et H86."""
    out = set(scelle["textes"])
    out |= {h for h, t in scelle["histoire"]["textes"].items() if t["fiche"] is not None}
    return out


def calculer_histoire(scelle, octets_scelle):
    """Rend (trace, resume, moteur, extras). `extras` porte ce qui sert au rapport
    (critères du calibrage)."""
    tg = Tirage(scelle["graine"])
    mo = Moteur(scelle, tg)
    titres_ok = titres_texte(scelle)
    jours = {}
    semaines = []
    sem_hist = [s for s in scelle["semaines"] if s["dernier_jour"] <= 0]
    for j in range(-90, 1):
        manches = mo.jouer_manches(j) if j >= -89 else {}
        rev = mo.reveler(j) if j >= -88 else None
        jours[str(j)] = {
            "manches": {g: ecrire_manche(m) for g, m in manches.items()},
            "repondu": texte_du_jour(j),
            "revelation": rev,
        }
        for s in sem_hist:
            if s["dernier_jour"] == j:
                semaines.append(mo.titres(s["numero"], titres_ok))
    temps0 = mo.temperaments(0)
    # Entrée et H1 à H90 (textes répondus jusqu'au jour −1), poids normaux (partie 3.2).
    curseurs = {p: {T: mo.curseur_jusqu_au(p, T, -1) for T in TENSIONS} for p in PERSONNAGES}
    resume = {
        "curseurs": {p: {T: ecrire_curseur(curseurs[p][T], False) for T in TENSIONS} for p in PERSONNAGES},
        "format": "elenchos-essai-resume-histoire",
        "manche_jour_0": {
            "devineurs": {g: [ecrire_carte(c) for c in m["cartes"]] for g, m in mo.manches[0].items()},
            "texte": texte_du_jour(-1),
        },
        "temperaments": {p: temps0[p]["temperaments"] for p in PERSONNAGES},
        "tirage": scelle["histoire"]["tirage"],
        "titres": [{"devin": s["devin"]["titulaire"], "fidele": s["fidele"]["titulaires"],
                    "mystere": s["mystere"]["titulaire"], "sans_faute": s["sans_faute"],
                    "semaine": s["semaine"], "surprise": s["surprise"]["texte"]} for s in semaines],
        "version": 1,
    }
    octets_resume = canon.octets_canoniques(resume)
    if any(b > 0x7F for b in octets_resume):
        raise AssertionError("le résumé n'est pas en ASCII (schéma 2, partie 3.3)")
    resume_sha = sha256_hex(octets_resume)
    trace = {
        "arrivee": {
            "curseurs": {p: {T: ecrire_curseur(curseurs[p][T]) for T in TENSIONS} for p in PERSONNAGES},
            "resume": resume,
            "resume_sha256": resume_sha,
            "temperaments": temps0,
        },
        "empreinte_scelle": sha256_hex(octets_scelle),
        "format": "elenchos-essai-trace-histoire",
        "jours": jours,
        "semaines": semaines,
        "version": 1,
    }
    extras = {"criteres": criteres_calibrage(mo, semaines, curseurs, temps0, scelle),
              "resume_octets": octets_resume}
    return trace, resume, mo, extras


ATTENDU_C1 = {"Agathe": {"S", "P", "L"}, "Nassim": {"S", "P", "L"},
              "Odile": {"S", "P", "T", "L"}, "Valentin": {"P", "T", "L"}}
ATTENDU_C2 = {"Agathe": [], "Nassim": [], "Odile": ["original", "tranche"], "Valentin": ["pont"]}


def criteres_calibrage(mo, semaines, curseurs, temps0, scelle):
    """Fichier caché 2, point 10 : (c1) à (c5). Rend {critère: (vrai/faux, explication)}.
    Curseurs « au jour 1 » : entrée et H1 à H90, c'est-à-dire les textes répondus
    jusqu'au jour −1 (T0 n'est pas encore révélé au jour 1, lecture A)."""
    out = {}
    # Curseurs vus au jour 1 : entrée et textes répondus jusqu'au jour −1.
    vus = {p: {T: mo.curseur_jusqu_au(p, T, -1) for T in TENSIONS} for p in PERSONNAGES}
    nets = {p: {T for T in TENSIONS if vus[p][T]["net"]} for p in PERSONNAGES}
    ok = nets == ATTENDU_C1
    out["c1"] = (ok, "nets : " + "; ".join(f"{p} {''.join(T for T in TENSIONS if T in nets[p]) or '-'}"
                                          for p in PERSONNAGES))
    t0 = {p: temps0[p]["temperaments"] for p in PERSONNAGES}
    out["c2"] = (t0 == ATTENDU_C2, "tempéraments : " + "; ".join(f"{p} {t0[p]}" for p in PERSONNAGES))
    s13 = next(s for s in semaines if s["semaine"] == 13)
    tous, dep = mo.surprise_tous_candidats(s13)
    out["c3"] = (tous == "H86" and s13["surprise"]["texte"] == "H86",
                 f"tous candidats : {tous} ({dep}) ; textes titrés : {s13['surprise']['texte']}")
    devins = {s["devin"]["titulaire"] for s in semaines} - {None}
    myst = {s["mystere"]["titulaire"] for s in semaines} - {None}
    peu = sum(1 for s in semaines if len(s["fidele"]["titulaires"]) <= 3)
    out["c4"] = (len(devins) >= 3 and len(myst) >= 3 and peu >= 6,
                 f"Devin : {len(devins)} titulaires ; Mystère : {len(myst)} ; semaines à trois Fidèles ou moins : {peu}")
    mauvais = []
    for p in PERSONNAGES:
        for T in TENSIONS:
            cur = vus[p][T]
            if not cur["net"]:
                continue
            pos = mo.positions[p][T]
            cote_profil = 1 if pos > F(1, 2) else 0
            if abs(cur["c"] - F(1, 2)) < F(1, 5) or (1 if cur["c"] > F(1, 2) else 0) != cote_profil:
                mauvais.append(f"{p} {T} c = {canon.frac(cur['c'])}")
    out["c5"] = (not mauvais, "écarts : " + ("; ".join(mauvais) if mauvais else "aucun"))
    return out
