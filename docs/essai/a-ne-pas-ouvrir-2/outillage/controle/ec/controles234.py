"""Contrôles 2, 3 et 4 du second essai (schéma 2, partie 5.2 ; simulation-2, §9).

- Contrôle 2 : `personnages` égal, octet pour octet, à celui du premier fichier scellé,
  dont le SHA-256 égale l'empreinte publiée (`docs/essai/empreinte.md`) ; contraintes
  de `profils.md` toujours tenues ; plus de corrigé de F1.
- Contrôle 3 : règles D-034 (contrôle 1, étape 5) ; chaque réponse, histoire comprise,
  recalculée (fichier caché 2, points 2 bis à 4) ; calibrage refait de r = 1 au r
  scellé (point 10), avec la raison de l'échec de chaque r ; résumé recalculé.
- Contrôle 4 : absences recalculées (point 3, 2.4).
"""

import re
from fractions import Fraction as F

from . import canon, regles, sources
from .histoire import calculer_histoire
from .jeu import PERSONNAGES, TENSIONS, POLES_COURTS, HISTOIRE, LIBELLE_NIVEAU
from .moteur import textes_reduits
from .tirage import Tirage, sha256_hex


def empreinte_publiee(texte):
    m = re.search(r"En une ligne : `([0-9a-f]{64})`", texte)
    return m.group(1) if m else None


def type_en_poles(niveau):
    if niveau == 3:
        return ("neutre", None)
    return ("très" if niveau in (1, 5) else "simple", 1 if niveau >= 4 else 0)


def controle2(d, octets_premier, texte_empreinte, prof):
    """Rend (erreurs, informations)."""
    e, info = [], []
    pub = empreinte_publiee(texte_empreinte)
    h = sha256_hex(octets_premier)
    if pub is None:
        e.append("docs/essai/empreinte.md : empreinte « En une ligne » introuvable")
    elif h != pub:
        e.append(f"premier fichier scellé : SHA-256 {h} ≠ empreinte publiée {pub}")
    else:
        info.append(f"premier fichier scellé : SHA-256 {h} = empreinte publiée")
    premier = canon.lire_strict(octets_premier)
    a = canon.octets_canoniques(d["personnages"])
    b = canon.octets_canoniques(premier["personnages"])
    if a != b:
        from .comparer import differences
        for p, x, y in differences(d["personnages"], premier["personnages"]):
            e.append(f"/personnages{p} : {x!r} ≠ premier fichier {y!r}")
    else:
        info.append(f"personnages : identiques octet pour octet au premier fichier ({len(a)} octets, SHA-256 {sha256_hex(a)})")
    # profils.md
    types = {}
    for p in PERSONNAGES:
        if d["personnages"][p]["profil"] != prof["profils"][p]:
            e.append(f"/personnages/{p}/profil ≠ profils.md {prof['profils'][p]!r}")
        types[p] = {}
        for T in TENSIONS:
            pr = prof["profils"][p][T]
            pt = regles.position_type(F(pr["position"], 100), 1, pr["fermete"])
            types[p][T] = type_en_poles(pt["niveau"])
            if types[p][T] != prof["types"][p][T]:
                e.append(f"réponse type {p} {T} : recalcul {types[p][T]} ≠ profils.md {prof['types'][p][T]}")
            if pt["d"] != prof["d"][p][T]:
                e.append(f"d {p} {T} : recalcul {canon.frac(pt['d'])} ≠ profils.md {canon.frac(prof['d'][p][T])}")
    A, N = types["Agathe"], types["Nassim"]
    for T in ("S", "P"):
        if A[T][1] is None or A[T][1] != N[T][1]:
            e.append(f"contrainte : Agathe et Nassim pas du même côté sur {T}")
    if A["T"][0] != "neutre" or N["T"][0] != "neutre":
        e.append("contrainte : Agathe et Nassim pas neutres tous deux sur T")
    if A["L"][1] is None or N["L"][1] is None or A["L"][1] == N["L"][1]:
        e.append("contrainte : Agathe et Nassim pas opposés sur L")
    for T in TENSIONS:
        pr = prof["profils"]["Odile"][T]
        dd = regles.position_type(F(pr["position"], 100), 1, pr["fermete"])["d"]
        if pr["fermete"] != "forte" or abs(dd) < F(56, 100):
            e.append(f"contrainte : Odile sur {T} (fermeté {pr['fermete']}, |d| = {canon.frac(abs(dd))})")
    partage = {"S": (1, 2, 1), "P": (2, 2, 0), "T": (1, 1, 2), "L": (2, 2, 0)}
    for T in TENSIONS:
        c = (sum(1 for p in PERSONNAGES if types[p][T][1] == 0),
             sum(1 for p in PERSONNAGES if types[p][T][1] == 1),
             sum(1 for p in PERSONNAGES if types[p][T][0] == "neutre"))
        if c != partage[T]:
            e.append(f"contrainte : partage du cercle sur {T} : {c} ≠ {partage[T]}")
    for p in PERSONNAGES:
        t = types[p]
        if t["S"] == ("très", 0) and t["T"] == ("très", 0):
            e.append(f"contrainte : {p} a « très, vers Sécurité » et « très, vers Tradition »")
        if t["S"] == ("très", 1) and t["T"] == ("très", 1):
            e.append(f"contrainte : {p} a « très, vers Liberté » et « très, vers Changement »")
    info.append("réponses types (s = 1) : " + " | ".join(
        f"{p} " + ", ".join(f"{T} {('neutre' if types[p][T][0] == 'neutre' else types[p][T][0] + ' ' + POLES_COURTS[T][types[p][T][1]])}"
                            for T in TENSIONS) for p in PERSONNAGES))
    info.append("laissé au Vérificateur : « aucune étiquette politique » (ne se vérifie pas par programme)")
    return e, info


def recalcul(d, r):
    """Réponses, absences et réponses atypiques recalculées pour le numéro de tirage r."""
    tg = Tirage(d["graine"])
    profils = {p: d["personnages"][p]["profil"] for p in PERSONNAGES}
    alpha = F(d["reglage"]["alpha"])
    return regles.toutes_les_reponses(profils, textes_reduits(d), tg, r, alpha)


def fichier_pour(d, rep, r):
    x = dict(d)
    x["reponses"] = rep["reponses"]
    x["absences"] = rep["absences"]
    x["reponses_atypiques"] = rep["atypiques"]
    x["histoire"] = dict(d["histoire"], tirage=r)
    return x


def fmt_detail(det, txt):
    l = [f"      p = {canon.frac(det['p'])}, a = {canon.frac(det['a'])}, d = {canon.frac(det['d'])}"
         + (f" ; atypique (réponse type {LIBELLE_NIVEAU[det['niveau_type']]}"
            + (f", côté tiré par {det['cle_cote']} : {det['cote_tire']:+d}" if det.get("cle_cote") else "") + ")"
            if det["atypique"] else ""),
         f"      niveau {det['niveau']} ; considérations : " + " ; ".join(
             f"{c['rang']} {c['cote']} {c['pole']}" for c in txt["considerations"]),
         f"      E = {det['E']} ; valeur π_p = {det['valeur']} ; niveaux : "
         + " ; ".join(f"{n} {xs}" for n, xs in det["niveaux"]),
         "      " + (f"retenu : {det['niveau_retenu']} ; candidates : " + " ; ".join(
             f"{r} ({cle} : N={n})" for r, cle, n in det["candidates"]) if det["candidates"] else "aucune candidate")]
    return l


def controle3(d, octets, avec_detail=False):
    """Rend (erreurs, informations, calibrage, résumé recalculé)."""
    e, info = [], []
    r_scelle = d["histoire"]["tirage"]
    rep = recalcul(d, r_scelle)
    txts = textes_reduits(d)
    for t in d["reponses"]:
        for p in PERSONNAGES:
            att = rep["reponses"][t].get(p)
            obt = d["reponses"][t].get(p)
            if att != obt:
                e.append(f"/reponses/{t}/{p} : fichier {obt!r} ≠ recalcul {att!r}")
                if p in rep["details"] and t in rep["details"][p]:
                    e.extend(fmt_detail(rep["details"][p][t], txts[t]))
    for p in PERSONNAGES:
        if d["reponses_atypiques"][p] != rep["atypiques"][p]:
            e.append(f"/reponses_atypiques/{p} : fichier {d['reponses_atypiques'][p]!r} ≠ recalcul {rep['atypiques'][p]!r}")
    nb = sum(len(v) for v in rep["atypiques"].values())
    hist = sum(1 for p in PERSONNAGES for o in rep["atypiques"][p] if o["texte"].startswith("H"))
    info.append(f"réponses recalculées : {sum(len(v) for v in rep['reponses'].values())} ; réponses atypiques : {nb} "
                f"(histoire {hist}, essai {nb - hist}) ; α = {d['reglage']['alpha']} ; r = {r_scelle}")
    # Calibrage refait (point 10)
    cal = []
    premier = None
    for r in range(1, r_scelle + 1):
        rp = rep if r == r_scelle else recalcul(d, r)
        x = fichier_pour(d, rp, r)
        _, _, _, extras = calculer_histoire(x, canon.octets_canoniques(x))
        cr = extras["criteres"]
        ok = all(v[0] for v in cr.values())
        cal.append((r, ok, cr))
        if ok and premier is None:
            premier = r
    if premier != r_scelle:
        e.append(f"calibrage : premier r qui remplit c1 à c5 = {premier} ; r scellé = {r_scelle}")
    # Résumé recalculé
    _, resume, _, extras = calculer_histoire(d, octets)
    if sha256_hex(extras["resume_octets"]) != d["histoire"]["resume_sha256"]:
        e.append(f"résumé : SHA-256 recalculé {sha256_hex(extras['resume_octets'])} ≠ histoire.resume_sha256")
    else:
        info.append(f"résumé recalculé : SHA-256 {sha256_hex(extras['resume_octets'])} = histoire.resume_sha256")
    return e, info, cal, extras["resume_octets"]


def controle4(d):
    rep = recalcul(d, d["histoire"]["tirage"])
    e = []
    for p in PERSONNAGES:
        if d["absences"][p] != rep["absences"][p]:
            e.append(f"/absences/{p} : fichier {d['absences'][p]!r} ≠ recalcul {rep['absences'][p]!r}")
    n_h = sum(1 for p in PERSONNAGES for t in rep["absences"][p] if t.startswith("H"))
    n_t = sum(1 for p in PERSONNAGES for t in rep["absences"][p] if not t.startswith("H"))
    return e, [f"absences recalculées : histoire {n_h}, essai {n_t} ; "
               + " ; ".join(f"{p} essai {[t for t in rep['absences'][p] if not t.startswith('H')]}" for p in PERSONNAGES)]


def rapport(d, octets, octets_premier, texte_empreinte, texte_profils, chemins):
    L = ["Programme de contrôle (C), second essai — contrôles 2, 3 et 4 (schéma 2, partie 5.2)", "=" * 78,
         f"Fichier : {chemins['fichier']} (SHA-256 {sha256_hex(octets)})",
         f"Premier fichier scellé : {chemins['premier']} (SHA-256 {sha256_hex(octets_premier)})",
         f"Empreinte publiée lue dans : {chemins['empreinte']} ; profils lus dans : {chemins['profils']} "
         f"(SHA-256 {sha256_hex(texte_profils.encode('utf-8'))})", ""]
    verdict = {}
    try:
        prof = sources.lire_profils(texte_profils)
    except sources.ErreurSource as x:
        L.append(f"Lecture de profils.md : ÉCHEC — {x}")
        return "\n".join(L) + "\n", {"controle2": False}
    e2, i2 = controle2(d, octets_premier, texte_empreinte, prof)
    verdict["controle2"] = not e2
    L.append("Contrôle 2 (profils) : " + ("passé" if not e2 else f"ÉCHEC ({len(e2)})"))
    L += [f"  - {x}" for x in e2] + [f"  · {x}" for x in i2] + [""]
    e3, i3, cal, _ = controle3(d, octets)
    verdict["controle3"] = not e3
    L.append("Contrôle 3 (réponses, histoire comprise ; calibrage refait ; résumé) : "
             + ("passé" if not e3 else f"ÉCHEC ({len(e3)})"))
    L += [f"  - {x}" if not x.startswith("      ") else x for x in e3] + [f"  · {x}" for x in i3]
    L.append(f"  Calibrage refait (fichier caché 2, point 10), r = 1 à {d['histoire']['tirage']} :")
    for r, ok, cr in cal:
        L.append(f"    r = {r:>3} : " + ("REMPLIT c1 à c5" if ok else "échoue sur " + ", ".join(k for k, v in cr.items() if not v[0]))
                 + " — " + " ; ".join(f"{k} : {v[1]}" for k, v in cr.items() if not v[0] or ok))
    L.append("")
    e4, i4 = controle4(d)
    verdict["controle4"] = not e4
    L.append("Contrôle 4 (absences, histoire comprise) : " + ("passé" if not e4 else f"ÉCHEC ({len(e4)})"))
    L += [f"  - {x}" for x in e4] + [f"  · {x}" for x in i4] + [""]
    L.append("Verdict : " + ("aucun défaut trouvé" if all(verdict.values()) else "DÉFAUT(S) TROUVÉ(S)"))
    return "\n".join(L) + "\n", verdict
