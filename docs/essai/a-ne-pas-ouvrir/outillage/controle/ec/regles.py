"""Comment un personnage répond (fichier caché, §2.1 à §2.5) et procédure des
réponses atypiques (profils.md, « Procédure »). Fonctions pures ; chaque calcul
rend aussi son détail (a, d, niveau, E, pôle visé, candidates et leurs t), pour
le rapport (schéma, partie 4.1, « Chaque écart est donné avec le détail »).
"""

from fractions import Fraction as F

from .jeu import FERMETE_M, cote


class Defaut(Exception):
    """Une étape de calcul sans issue (par exemple, aucun texte valable)."""


def niveau_de_d(d):
    ad = abs(d)
    if ad < F(1, 10):
        return 3
    if ad < F(3, 10):
        return 4 if d > 0 else 2
    return 5 if d > 0 else 1


def position_type(p, s, fermete):
    """p : Fraction de 0 à 1 ; s : 0 ou 1. Règle 2.1."""
    a = p if s == 1 else 1 - p
    d = (a - F(1, 2)) * FERMETE_M[fermete]
    return {"a": a, "d": d, "niveau": niveau_de_d(d)}


def raison(qui, texte, niveau, p, s, fermete, considerations, tirage):
    """Règle 2.2. considerations : [{"rang", "cote", "pole"}] dans l'ordre d'affichage.
    qui : prénom (ou "porteur") tel qu'écrit dans la clé de tirage."""
    c = cote(niveau)
    if c == 1:
        E = [x for x in considerations if x["cote"] == "pour"]
    elif c == -1:
        E = [x for x in considerations if x["cote"] == "contre"]
    else:
        E = list(considerations)
    if c != 0:
        pole_vise = s if c == 1 else 1 - s
    else:
        pole_vise = 1 if p > F(1, 2) else 0
    hors = [x for x in E if x["pole"] == "aucun"]
    du_pole = [x for x in E if x["pole"] == pole_vise]
    reste = [x for x in E if x not in hors and x not in du_pole]
    faible = fermete == "faible"
    if c == 0:
        niveaux = [("hors tension", hors)] if faible else [("du pôle visé", du_pole), ("hors tension", hors)]
    elif faible:
        niveaux = [("hors tension", hors), ("du pôle visé", du_pole), ("reste de E", reste)]
    else:
        niveaux = [("du pôle visé", du_pole), ("hors tension", hors), ("reste de E", reste)]
    detail = {
        "E": [x["rang"] for x in E],
        "pole_vise": pole_vise,
        "niveaux": [(nom, [x["rang"] for x in xs]) for nom, xs in niveaux],
        "candidates": [],
        "niveau_retenu": None,
    }
    for nom, xs in niveaux:
        if xs:
            cles = {x["rang"]: f"raison|{qui}|{texte}|{x['rang']}" for x in xs}
            detail["candidates"] = [(r, cles[r], tirage.n(cles[r])) for r in sorted(cles)]
            detail["niveau_retenu"] = nom
            choisi = min(xs, key=lambda x: tirage.cle_tri(cles[x["rang"]]))
            return choisi["rang"], detail
    detail["niveau_retenu"] = "aucune"
    return "aucune", detail


def reponse_type(qui, texte, prof, txt, tirage):
    """Réponse type (2.1, 2.2). prof : {"position", "fermete"} ; txt : texte scellé
    réduit à {"sens", "considerations"}."""
    p = F(prof["position"], 100)
    pt = position_type(p, txt["sens"], prof["fermete"])
    r, det = raison(qui, texte, pt["niveau"], p, txt["sens"], prof["fermete"],
                    txt["considerations"], tirage)
    det.update({"p": p, "a": pt["a"], "d": pt["d"], "niveau": pt["niveau"],
                "fermete": prof["fermete"], "sens": txt["sens"]})
    return {"niveau": pt["niveau"], "raison": r}, det


def reponse_atypique(qui, texte, prof, txt, tirage):
    """Règle 2.3. Rend (réponse, cote_tire, détail)."""
    p = F(prof["position"], 100)
    pt = position_type(p, txt["sens"], prof["fermete"])
    c = cote(pt["niveau"])
    cote_tire = None
    cle = None
    if c == 0:
        cle = f"cote-ecart|{qui}|{texte}"
        cote_tire = 1 if tirage.t(cle) < F(1, 2) else -1
        nouveau = 4 if cote_tire == 1 else 2
    else:
        nouveau = 2 if c == 1 else 4
    r, det = raison(qui, texte, nouveau, p, txt["sens"], prof["fermete"],
                    txt["considerations"], tirage)
    det.update({"p": p, "a": pt["a"], "d": pt["d"], "niveau_type": pt["niveau"],
                "niveau": nouveau, "fermete": prof["fermete"], "sens": txt["sens"],
                "cle_cote": cle, "n_cote": tirage.n(cle) if cle else None,
                "cote_tire": cote_tire})
    return {"niveau": nouveau, "raison": r}, cote_tire, det


def placer_atypiques(nb, qui_ordre, absences, tirage, contrainte_c=True):
    """Procédure de profils.md. qui_ordre : personnages dans l'ordre de traitement.
    absences : {qui: [textes]}. Rend ({qui: [n triés]}, détail)."""
    if nb not in (2, 3, 4):
        raise Defaut(f"nombre de réponses atypiques non prévu : {nb}")
    etapes = [range(1, 7), range(7, 14), range(1, 14), range(1, 14)][:nb]
    par_texte = {n: 0 for n in range(1, 14)}
    retenus = {}
    detail = {}
    for qui in qui_ordre:
        ordre = sorted(range(1, 14), key=lambda n: tirage.cle_tri(f"ecart|{qui}|{n}"))
        miens = []
        det = {"ordre": [(n, tirage.n(f"ecart|{qui}|{n}")) for n in ordre], "etapes": []}
        for k, plage in enumerate(etapes):
            choisi = None
            refus = []
            for n in ordre:
                if n not in plage or n in miens:
                    continue
                pourquoi = []
                if str(n) in absences.get(qui, []):
                    pourquoi.append("(a) absence")
                if any(abs(n - m) == 1 for m in miens):
                    pourquoi.append("(b) texte voisin d'un écart retenu")
                if contrainte_c and par_texte[n] >= 2:
                    pourquoi.append("(c) déjà deux personnages en écart")
                if pourquoi:
                    refus.append((n, pourquoi))
                    continue
                choisi = n
                break
            if choisi is None:
                raise Defaut(f"{qui} : aucun texte valable à l'étape {k + 1} de la procédure")
            miens.append(choisi)
            par_texte[choisi] += 1
            det["etapes"].append({"etape": k + 1, "plage": (plage.start, plage.stop - 1),
                                  "refuses": refus, "retenu": choisi})
        retenus[qui] = sorted(miens)
        detail[qui] = det
    return retenus, detail


def considerations_reduites(texte_scelle):
    return [{"rang": c["rang"], "cote": c["cote"], "pole": c["pole"]}
            for c in texte_scelle["considerations"]]


def toutes_les_reponses(qui, profil, textes, tirage, atypiques, absents):
    """Réponses d'un joueur (personnage ou joueur simulé) à tous les textes.
    profil : {tension: {"position", "fermete"}} ; textes : {id: {"tension", "sens", "considerations"}} ;
    atypiques : ensemble des n (entiers) ; absents : ensemble des id.
    Rend ({id: réponse}, {id: cote_tire}, {id: détail})."""
    reps, cotes, details = {}, {}, {}
    for tid, txt in textes.items():
        if tid in absents:
            continue
        prof = profil[txt["tension"]]
        if tid.isdigit() and int(tid) in atypiques:
            r, ct, det = reponse_atypique(qui, tid, prof, txt, tirage)
            cotes[tid] = ct
            det["atypique"] = True
        else:
            r, det = reponse_type(qui, tid, prof, txt, tirage)
            det["atypique"] = False
        reps[tid] = r
        details[tid] = det
    return reps, cotes, details
