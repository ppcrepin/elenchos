"""Chiffres constants du second essai (fichier caché 2, point 13). Ils ne dépendent pas
des coups du porteur : ses cinq manches (jours où `deviner_porteur` est vrai), dans une
partie menée à la clôture, chaque manche ouverte et chaque révélation lue. Ses cartes ne
dépendent que du fichier scellé (point 5).

Rend un objet JSON (fractions « p/q ») et un rapport lisible ; l'objet se compare à
celui du programme de scellement, s'il en écrit un sous la même forme."""

import itertools
from fractions import Fraction as F
from math import ceil

from . import canon
from .histoire import calculer_histoire
from .jeu import ENTREE, HISTOIRE, PERSONNAGES, TENSIONS, texte_du_jour
from .tirage import sha256_hex


def meme(r1, r2):
    return r1 is not None and r2 is not None and r1["niveau"] == r2["niveau"] and r1["raison"] == r2["raison"]


def carte_ecrite(auteur, rep):
    return [auteur, rep["niveau"], rep["raison"]]


def genre_inattendu(t, cote_):
    """Point 14 du point 13 : type de la raison qui n'est pas attendue, d'un côté."""
    s = t["sens"]
    pi_c = s if cote_ == "pour" else 1 - s
    for c in t["considerations"]:
        if c["cote"] != cote_ or c["pole"] == pi_c:
            continue
        return "pratique" if c["pole"] == "aucun" else "croise"
    return "sans"


def loi_manche(cartes, candidats, reps):
    """Distribution exacte du nombre de cartes justes d'une manche : affectations sans
    répétition de k visages parmi les candidats, toutes également probables."""
    k = len(cartes)
    compte = {}
    perms = list(itertools.permutations(candidats, k))
    for perm in perms:
        n = sum(1 for c, X in zip(cartes, perm) if meme(reps.get(X), {"niveau": c["_niveau"], "raison": c["_raison"]}))
        compte[n] = compte.get(n, 0) + 1
    return {n: F(v, len(perms)) for n, v in compte.items()}


def convoluer(a, b):
    out = {}
    for x, p in a.items():
        for y, q in b.items():
            out[x + y] = out.get(x + y, F(0)) + p * q
    return out


def calculer(d, octets):
    _, resume, mo, _ = calculer_histoire(d, octets)
    cal = {o["jour"]: o for o in d["calendrier"]}
    jours = [j for j in range(1, 16) if cal[j]["deviner_porteur"]]
    mans = {j: mo.cartes_servies("porteur", j) for j in jours}
    atyp = {(p, o["texte"]) for p in PERSONNAGES for o in d["reponses_atypiques"][p]}
    toutes = [(j, c) for j in jours for c in mans[j]["cartes"]]
    n = len(toutes)
    out = {}
    # 1
    out["1_cartes"] = {"par_manche": {str(j): len(mans[j]["cartes"]) for j in jours}, "total": n}
    # 2
    na = sum(1 for j, c in toutes if (c["auteur"], mans[j]["texte"]) in atyp)
    out["2_atypiques"] = {"cartes": na, "part": canon.frac(F(na, n)), "sur": n}
    # 3
    rempl = []
    for j in jours:
        reps = mo.reponses[mans[j]["texte"]]
        for r in mans[j]["remplacements"]:
            rempl.append({"carte_ecartee": carte_ecrite(r["ecartee"], reps[r["ecartee"]]),
                          "carte_mise": carte_ecrite(r["remplacante"], reps[r["remplacante"]]),
                          "jour": j, "place": r["place"]})
    out["3_remplacements"] = {"detail": rempl, "nombre": len(rempl)}
    # 4
    nm = nc = 0
    for j in jours:
        groupes = {}
        for c in mans[j]["cartes"]:
            groupes.setdefault((c["_niveau"], c["_raison"]), []).append(c)
        g2 = [g for g in groupes.values() if len(g) >= 2]
        if g2:
            nm += 1
            nc += sum(len(g) for g in g2)
    out["4_identiques"] = {"cartes": nc, "manches": nm}
    # 5
    out["5_departages"] = sum(mans[j]["departages"] for j in jours)
    # 6
    couples = cartes_j = 0
    for j in jours:
        reps = mo.reponses[mans[j]["texte"]]
        auteurs = {c["auteur"] for c in mans[j]["cartes"]}
        for c in mans[j]["cartes"]:
            js = [p for p in PERSONNAGES if p != c["auteur"] and p not in auteurs
                  and meme(reps.get(p), reps[c["auteur"]])]
            couples += len(js)
            cartes_j += 1 if js else 0
    out["6_jumeaux_non_servis"] = {"cartes": cartes_j, "couples": couples}
    # 7
    h_tot = h_ord = F(0)
    n_ord = 0
    par_p = {p: [F(0), 0] for p in PERSONNAGES}
    loi = {0: F(1)}
    for j in jours:
        m = mans[j]
        reps = mo.reponses[m["texte"]]
        cand = m["candidats"]
        for c in m["cartes"]:
            h = F(sum(1 for X in cand if meme(reps.get(X), reps[c["auteur"]])), len(cand))
            h_tot += h
            par_p[c["auteur"]][0] += h
            par_p[c["auteur"]][1] += 1
            if (c["auteur"], m["texte"]) not in atyp:
                h_ord += h
                n_ord += 1
        loi = convoluer(loi, loi_manche(m["cartes"], cand, reps))
    cumul, acc = {}, F(0)
    for x in range(0, n + 1):
        acc += loi.get(x, F(0))
        cumul[str(x)] = canon.frac(acc)
    out["7_hasard"] = {
        "esperance": canon.frac(h_tot), "par_carte": canon.frac(h_tot / n),
        "ordinaires": {"cartes": n_ord, "esperance": canon.frac(h_ord),
                       "par_carte": canon.frac(h_ord / n_ord) if n_ord else None},
        "par_personnage": {p: {"cartes": v[1], "esperance": canon.frac(v[0])} for p, v in par_p.items()},
        "loi": {str(x): canon.frac(loi.get(x, F(0))) for x in range(0, n + 1)},
        "au_plus": cumul,
    }
    # 8
    perso = {str(k): sum(1 for p in PERSONNAGES if p in d["reponses"][str(k)]) for k in range(0, 14)}
    plus = {str(k): perso[str(k)] + 1 for k in range(1, 14)}
    out["8_reponses_par_texte"] = {"min_personnages": min(perso.values()), "min_plus_porteur": min(plus.values()),
                                   "personnages": perso, "plus_porteur": plus}
    # 9
    rej = [t for t in list(ENTREE) + [str(k) for k in range(0, 14)] if d["textes"][t]["vote"]["issue"] == "rejete"]
    out["9_texte_rejete"] = {"liste": rej, "nombre": len(rej), "T14": d["textes"]["14"]["vote"]["issue"]}
    # 10
    au = {"entree": 0, "histoire": 0, "essai": 0}
    for t, reps in d["reponses"].items():
        for r in reps.values():
            if r["raison"] == "aucune":
                au["entree" if t in ENTREE else ("histoire" if t.startswith("H") else "essai")] += 1
    out["10_aucune"] = {
        "personnages": au,
        "cartes": {"affichees": sum(1 for j, c in toutes if not c["cachee"] and c["_raison"] == "aucune"),
                   "cachees": sum(1 for j, c in toutes if c["cachee"] and c["_raison"] == "aucune"),
                   "cachees_deplacees": [j for j in jours if mans[j]["_cachee_deplacee"]]},
    }
    # 11
    out["11_unanimement_neutre"] = sum(1 for k in range(0, 15)
                                       if d["reponses"][str(k)] and all(r["niveau"] == 3 for r in d["reponses"][str(k)].values()))
    # 12
    vus = {p: [T for T in TENSIONS if mo.curseur_jusqu_au(p, T, -1)["net"]] for p in PERSONNAGES}
    out["12_arrivee"] = {"nets": vus, "temperaments": resume["temperaments"], "titres": resume["titres"]}
    # 13
    pdc = []
    for t in ["H90"] + [str(k) for k in range(0, 14)]:
        for p in mo.pas_de_cote(t):
            if p in PERSONNAGES:
                pdc.append([p, t])
    out["13_pas_de_cote"] = pdc
    # 14
    types = {}
    combis = {}
    for t in list(ENTREE) + [str(k) for k in range(0, 15)]:
        x = d["textes"][t]
        paire = (genre_inattendu(x, "pour"), genre_inattendu(x, "contre"))
        types[t] = {"contre": paire[1], "pour": paire[0]}
        cle = f"{paire[0]}/{paire[1]}"
        combis[cle] = combis.get(cle, 0) + 1
    out["14_inattendus"] = {"combinaisons": combis, "textes": types}
    # 15
    f = d["reglage"]["facteur"]
    seuil = ceil(F(10, f))
    possibles = []
    lus = [int(o["revele"]) for o in d["calendrier"] if o["revelation_porteur"] == "lue" and o["revele"] is not None
           and o["revele"].isdigit()]
    for k in sorted(lus):
        if k < 1:
            continue
        T = d["textes"][str(k)]["tension"]
        avant = [t for t in list(ENTREE) + [str(i) for i in range(1, k)] if d["textes"][t]["tension"] == T]
        if len(avant) >= seuil:
            possibles.append(str(k))
    semaines = {}
    for w in (14, 15):
        sem = next(s for s in d["semaines"] if s["numero"] == w)
        semaines[str(w)] = sum(1 for j in jours if sem["premier_jour"] <= j + 1 <= sem["dernier_jour"])
    out["15_impossibilites"] = {"a_min_reponses": min(perso[t] for t in ("0", "1", "2", "6", "13")),
                                "b_jours_cartes_revelees": semaines, "c_pas_de_cote_possible": possibles}
    return out, mans


def rapport(d, octets):
    c, mans = calculer(d, octets)
    o = canon.octets_canoniques(c)
    L = ["Programme de contrôle (C), second essai — chiffres constants (fichier caché 2, point 13)", "=" * 78,
         f"Fichier : SHA-256 {sha256_hex(octets)}",
         f"Chiffres (JSON canonique) : SHA-256 {sha256_hex(o)}",
         "Portée : les cinq manches du porteur (jours " + ", ".join(str(j) for j in mans) + "), partie menée à la clôture.", ""]
    for k in sorted(c, key=lambda x: int(x.split("_")[0])):
        L.append(f"{k} : {canon.canonique(c[k])}")
    return "\n".join(L) + "\n", c, o
