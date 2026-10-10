"""Comment un personnage répond, second essai (fichier caché 2, points 2 bis et 3 ;
règles 2.1 du premier essai). Fonctions pures ; chaque calcul rend aussi son
détail, pour le rapport.

Sert au jalon 1 à fabriquer le fichier de test, et au jalon suivant au
contrôle 3 (réponses, histoire comprise) et au contrôle 4 (absences).
"""

from fractions import Fraction as F

from .jeu import (FERMETE_M, PERSONNAGES, ENTREE, HISTOIRE, TENSIONS, cote,
                  ABSENCE_SEUIL, ABSENCE_FENETRE)


class Defaut(Exception):
    """Une étape de calcul sans issue."""


# ---------------------------------------------------------------- 2 bis : textes de l'histoire

def textes_histoire(tirage):
    """Fichier caché 2, point 2 bis. Rend {Hi: {"jour", "tension", "sens", "raisons"}}
    (raisons dans l'ordre d'affichage, {"cote", "pole", "rang"}), et le détail."""
    jours = list(range(-90, 0))
    tensions = {j: TENSIONS[(j + 6) % 4] for j in jours}
    occ = {T: [j for j in jours if tensions[j] == T] for T in TENSIONS}
    # Sens : alternance par tension ; S, T, L commencent à 1 ; P calé pour que H86 (j = −5) ait 0.
    sens = {}
    for T in TENSIONS:
        js = occ[T]
        if T == "P":
            k86 = js.index(-5)
            s0 = 0 if k86 % 2 == 0 else 1
        else:
            s0 = 1
        for k, j in enumerate(js):
            sens[j] = s0 if k % 2 == 0 else 1 - s0
    out, detail = {}, {}
    for j in jours:
        hid = f"H{j + 91}"
        s = sens[j]
        n_r = tirage.n(f"histoire-raisons|{hid}")
        fiche = {1: ("pour", s), 3: ("contre", 1 - s)}
        det = {"histoire-raisons": n_r}
        if tirage.t(f"histoire-raisons|{hid}") < F(1, 2):
            fiche[2] = ("pour", s)
            fiche[4] = ("contre", 1 - s)
            det["inattendus"] = None
        else:
            det["inattendus"] = {}
            for num, c in ((2, "pour"), (4, "contre")):
                cle = f"histoire-inattendu|{hid}|{c}"
                croise = tirage.t(cle) < F(1, 2)
                pole_cote = s if c == "pour" else 1 - s
                fiche[num] = (c, 1 - pole_cote) if croise else (c, "aucun")
                det["inattendus"][c] = ("croise" if croise else "pratique", tirage.n(cle))
        tri = sorted(range(1, 5), key=lambda i: tirage.cle_tri(f"ordre-raisons|{hid}|{i}"))
        raisons = [{"cote": fiche[i][0], "pole": fiche[i][1], "rang": r + 1} for r, i in enumerate(tri)]
        det["ordre"] = [(i, r + 1) for r, i in enumerate(tri)]
        out[hid] = {"jour": j, "tension": tensions[j], "sens": s, "raisons": raisons}
        detail[hid] = det
    return out, detail


# ---------------------------------------------------------------- 2.1 et 2.2 bis

def niveau_de_d(d):
    ad = abs(d)
    if ad < F(1, 10):
        return 3
    if ad < F(3, 10):
        return 4 if d > 0 else 2
    return 5 if d > 0 else 1


def position_type(p, s, fermete):
    a = p if s == 1 else 1 - p
    d = (a - F(1, 2)) * FERMETE_M[fermete]
    return {"a": a, "d": d, "niveau": niveau_de_d(d)}


def valeur(p):
    """π_p : 1 si p > 1/2, sinon 0 (fichier caché 2, point 1)."""
    return 1 if p > F(1, 2) else 0


def raison(qui, texte, niveau, p, fermete, considerations, tirage):
    """Règle 2.2 bis. considerations : [{"rang", "cote", "pole"}]. Le pôle « de sa
    valeur » est π_p, pour la réponse type comme pour la réponse atypique."""
    c = cote(niveau)
    if c == 1:
        E = [x for x in considerations if x["cote"] == "pour"]
    elif c == -1:
        E = [x for x in considerations if x["cote"] == "contre"]
    else:
        E = list(considerations)
    vise = valeur(p)
    hors = [x for x in E if x["pole"] == "aucun"]
    sienne = [x for x in E if x["pole"] == vise]
    autre = [x for x in E if x["pole"] == 1 - vise]
    faible = fermete == "faible"
    if c == 0:
        niveaux = [("hors tension", hors)] if faible else [("de sa valeur", sienne), ("hors tension", hors)]
    elif faible:
        niveaux = [("hors tension", hors), ("de sa valeur", sienne), ("de l'autre valeur", autre)]
    else:
        niveaux = [("de sa valeur", sienne), ("hors tension", hors), ("de l'autre valeur", autre)]
    detail = {"E": [x["rang"] for x in E], "valeur": vise,
              "niveaux": [(nom, [x["rang"] for x in xs]) for nom, xs in niveaux],
              "candidates": [], "niveau_retenu": None}
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
    p = F(prof["position"], 100)
    pt = position_type(p, txt["sens"], prof["fermete"])
    r, det = raison(qui, texte, pt["niveau"], p, prof["fermete"], txt["considerations"], tirage)
    det.update({"p": p, "a": pt["a"], "d": pt["d"], "niveau": pt["niveau"], "atypique": False})
    return {"niveau": pt["niveau"], "raison": r}, det


def cle_periode(r, qui, texte):
    """« [r|]prénom|texte » : r pour l'histoire seulement (fichier caché 2, 2.3 et 2.4)."""
    return f"{r}|{qui}|{texte}" if texte.startswith("H") else f"{qui}|{texte}"


def reponse_atypique(qui, texte, prof, txt, tirage, r):
    """2.3 : côté opposé à la réponse type, niveau simple ; neutre : côté tiré."""
    p = F(prof["position"], 100)
    pt = position_type(p, txt["sens"], prof["fermete"])
    c = cote(pt["niveau"])
    cote_tire, cle = None, None
    if c == 0:
        cle = "cote-ecart|" + cle_periode(r, qui, texte)
        cote_tire = 1 if tirage.t(cle) < F(1, 2) else -1
        nouveau = 4 if cote_tire == 1 else 2
    else:
        nouveau = 2 if c == 1 else 4
    rs, det = raison(qui, texte, nouveau, p, prof["fermete"], txt["considerations"], tirage)
    det.update({"p": p, "a": pt["a"], "d": pt["d"], "niveau_type": pt["niveau"], "niveau": nouveau,
                "atypique": True, "cle_cote": cle, "cote_tire": cote_tire})
    return {"niveau": nouveau, "raison": rs}, cote_tire, det


# ---------------------------------------------------------------- 2.4 absences, 2.3 réponses atypiques

def absences(textes_ordre, tirage, r):
    """2.4. textes_ordre : textes H puis T dans l'ordre du calendrier (sans l'entrée).
    Rend ({prénom: [textes]}, détail). Jamais sur l'entrée ni sur T14."""
    abs_ = {p: [] for p in PERSONNAGES}
    hist = {p: {"histoire": [], "essai": []} for p in PERSONNAGES}  # textes de la période, dans l'ordre
    detail = []
    for t in textes_ordre:
        per = "histoire" if t.startswith("H") else "essai"
        deja = False
        for p in PERSONNAGES:
            prec = hist[p][per][-ABSENCE_FENETRE:]
            hist[p][per].append(t)
            if t in ENTREE or t == "14":
                continue
            if deja or any(x in abs_[p] for x in prec):
                continue
            cle = "absence|" + cle_periode(r, p, t)
            if tirage.t(cle) < ABSENCE_SEUIL:
                abs_[p].append(t)
                deja = True
                detail.append((t, p, cle, tirage.n(cle)))
    return abs_, detail


def atypiques(textes_ordre, presents, tirage, r, alpha):
    """2.3. presents(p, t) : vrai si p répond à t. Rend ({prénom: [textes]}, détail).
    H86 : les deux premiers présents dans l'ordre de t("ecart-hstar|r|prénom")."""
    atyp = {p: [] for p in PERSONNAGES}
    prec = {p: {"histoire": None, "essai": None} for p in PERSONNAGES}
    detail = []
    for t in textes_ordre:
        per = "histoire" if t.startswith("H") else "essai"
        if t == "H86":
            ordre = sorted([p for p in PERSONNAGES if presents(p, t)],
                           key=lambda p: tirage.cle_tri(f"ecart-hstar|{r}|{p}"))
            elus = set(ordre[:2])
            for p in PERSONNAGES:
                if p in elus:
                    atyp[p].append(t)
                    detail.append((t, p, f"ecart-hstar|{r}|{p}", tirage.n(f"ecart-hstar|{r}|{p}")))
                prec[p][per] = (t, p in elus)
            continue
        n_sur_texte = 0
        for p in PERSONNAGES:
            precedent = prec[p][per]
            prec[p][per] = (t, False)
            if t in ENTREE or t == "14" or not presents(p, t):
                continue
            if precedent is not None and precedent[1]:
                continue
            if n_sur_texte >= 2:
                continue
            cle = "ecart|" + cle_periode(r, p, t)
            if tirage.t(cle) < alpha:
                atyp[p].append(t)
                n_sur_texte += 1
                prec[p][per] = (t, True)
                detail.append((t, p, cle, tirage.n(cle)))
    return atyp, detail


def toutes_les_reponses(profils, textes, tirage, r, alpha):
    """Réponses des quatre personnages à tous les textes (entrée, histoire, essai).
    textes : {id: {"tension", "sens", "considerations"}} pour E1–E3, H1–H90, 0–14.
    Rend {"reponses": {texte: {p: rep}}, "absences", "atypiques": {p: [{"cote_tire",
    "texte"}]}, "details", "det_abs", "det_atyp"}."""
    ordre = list(HISTOIRE) + [str(n) for n in range(15)]
    abs_, det_abs = absences(ordre, tirage, r)
    ens_abs = {p: set(v) for p, v in abs_.items()}
    atyp, det_atyp = atypiques(ordre, lambda p, t: t not in ens_abs[p], tirage, r, alpha)
    ens_atyp = {p: set(v) for p, v in atyp.items()}
    reps = {t: {} for t in list(ENTREE) + ordre}
    cotes = {p: {} for p in PERSONNAGES}
    details = {p: {} for p in PERSONNAGES}
    for t in list(ENTREE) + ordre:
        txt = textes[t]
        for p in PERSONNAGES:
            if t in ens_abs[p]:
                continue
            prof = profils[p][txt["tension"]]
            if t in ens_atyp[p]:
                rep, ct, det = reponse_atypique(p, t, prof, txt, tirage, r)
                cotes[p][t] = ct
            else:
                rep, det = reponse_type(p, t, prof, txt, tirage)
            reps[t][p] = rep
            details[p][t] = det
    atyp_obj = {p: [{"cote_tire": cotes[p][t], "texte": t} for t in atyp[p]] for p in PERSONNAGES}
    return {"reponses": reps, "absences": abs_, "atypiques": atyp_obj, "details": details,
            "det_abs": det_abs, "det_atyp": det_atyp}
