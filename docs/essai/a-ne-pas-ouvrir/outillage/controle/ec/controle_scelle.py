"""Contrôle 1 (étapes 1 à 8), contrôles 2 à 4 et annexe A du fichier caché, sur un
fichier scellé (ou candidat). Schéma, partie 4.1.

Le premier échec du contrôle 1 arrête tout. Une étape dont l'entrée manque est
« non faite », jamais « passée ». Les contrôles 2 à 4 et l'annexe A listent
toutes leurs différences, chacune avec le détail du calcul.
"""

import base64
import hashlib
import re
import unicodedata
from fractions import Fraction as F

from . import canon, regles, sources
from .jeu import (PERSONNAGES, TEXTES, TENSIONS, QUOTIDIENS, ENTREE, POLES_COURTS,
                  ORDRE_TENSIONS_QUOTIDIENS, TENSIONS_ENTREE, cote, LIBELLE_NIVEAU)
from .schema_scelle import verifier_schema
from .tirage import Tirage, sha256_hex

GUILLEMETS = set("\u00ab\u00bb\u0022\u201c\u201d\u2039\u203a")
COMMIT_GRAINE = "7f4d367278ecf07b01ebad883b7ec75cf7840820"
CLES_VECTEURS = ("raison|Odile|E2|3", "hasard|Nassim|12|porteur", "surprise-semaine|2|11")
REPERE = b"/*elenchos-scelle*/"


def fmt_n(n):
    return f"N={n} (t≈{n / 2**32:.6f})"


def fmt_f(x):
    return canon.frac(x)


# ------------------------------------------------------------------ étapes

def etape1(octets, empreinte_publiee):
    if empreinte_publiee is None:
        return None, ["empreinte publiée non fournie"]
    e = empreinte_publiee.replace(" ", "").replace("\n", "")
    if not re.fullmatch(r"[0-9a-f]{64}", e):
        return False, [f"l'empreinte publiée, espaces et retours retirés, n'est pas 64 chiffres hex minuscules : {e!r}"]
    h = sha256_hex(octets)
    if h != e:
        return False, [f"SHA-256 du fichier {h} ≠ empreinte publiée {e}"]
    return True, [f"SHA-256 du fichier = empreinte publiée = {h}"]


def etape2(octets, page):
    if page is None:
        return None, ["page construite non fournie"]
    b64 = base64.b64encode(octets)
    n = page.count(REPERE)
    if n != 1:
        return False, [f"le repère {REPERE.decode()} apparaît {n} fois dans la page (attendu : 1)"]
    i = page.index(REPERE) + len(REPERE)
    attendu = b'"' + b64 + b'"'
    if page[i:i + len(attendu)] != attendu:
        return False, ["la suite qui suit le repère n'est pas exactement \"base64 du fichier scellé\""]
    return True, [f"repère présent une fois, suivi du base64 exact ({len(b64)} caractères)"]


def etape5(d, fiches_sim, groupes, elisions):
    e = []
    textes = d["textes"]
    for tid in TEXTES:
        t = textes[tid]
        cons = t["considerations"]
        for i, c in enumerate(cons):
            if c["rang"] != i + 1:
                e.append(f"/textes/{tid}/considerations/{i}/rang : {c['rang']} ≠ place {i + 1}")
            s = c["texte"]
            if not s or s[-1] not in ".?!":
                e.append(f"/textes/{tid}/considerations/{i}/texte : ne finit pas par « . », « ? » ou « ! »")
            else:
                j = len(s) - 2
                if s[-1] in "?!" and j >= 0 and s[j] == " ":
                    j -= 1
                if s[0] in GUILLEMETS or (j >= 0 and s[j] in GUILLEMETS):
                    e.append(f"/textes/{tid}/considerations/{i}/texte : guillemet à un bord")
        gs = [c["depute"]["groupe"] for c in cons]
        if len(set(gs)) != 4:
            e.append(f"/textes/{tid}/considerations : groupes pas tous différents : {gs}")
        v = t["vote"]
        permis = {"adopte": ("navette", "definitif"), "rejete": ("navette", "aucune"),
                  "sans_vote_ensemble": ("aucune",)}
        if v["etape"] not in permis[v["issue"]]:
            e.append(f"/textes/{tid}/vote : combinaison non permise ({v['issue']}, {v['etape']})")
    for p in PERSONNAGES:
        abs_ = d["absences"][p]
        for a in abs_:
            if a not in QUOTIDIENS:
                e.append(f"/absences/{p} : absence sur un texte qui n'est pas quotidien : {a}")
        for tid in TEXTES:
            a_rep = p in d["reponses"][tid]
            if a_rep == (tid in abs_):
                m1 = "a" if a_rep else "n'a pas"
                m2 = "est" if tid in abs_ else "n'est pas"
                e.append(f"/reponses/{tid} : {p} {m1} de réponse, et ce texte {m2} dans ses absences")
        for o in d["reponses_atypiques"][p]:
            if o["texte"] not in QUOTIDIENS or p not in d["reponses"][o["texte"]]:
                e.append(f"/reponses_atypiques/{p} : texte {o['texte']} pas quotidien ou sans réponse")
    for p in PERSONNAGES:
        for k in ("age", "metier", "ville", "ligne_de_vie", "heure_de_jeu"):
            if d["personnages"][p][k] != fiches_sim[p][k]:
                e.append(f"/personnages/{p}/{k} : {d['personnages'][p][k]!r} ≠ §1 {fiches_sim[p][k]!r}")
    if d["cercle"] != {"nom": "Amis", "inviteuse": "Agathe"}:
        e.append(f"/cercle : {d['cercle']!r} (attendu : Amis, Agathe)")
    for i, vt in enumerate(d["vecteurs_test"]):
        if vt["chaine"] != d["graine"] + "|" + vt["cle"]:
            e.append(f"/vecteurs_test/{i}/chaine ≠ graine + « | » + cle")
        if vt["n"] != int(vt["hex8"], 16):
            e.append(f"/vecteurs_test/{i}/n ≠ valeur de hex8")
    # Groupes (partie 2.7)
    couples = {(g, ch) for g, ch, _, _ in groupes}
    servis = set()
    for tid in TEXTES:
        t = textes[tid]
        a = t["auteur"]
        elus = []
        if a["type"] == "depute":
            elus.append((f"/textes/{tid}/auteur", a["groupe"], "Assemblée"))
        elif a["type"] == "senateur":
            elus.append((f"/textes/{tid}/auteur", a["groupe"], "Sénat"))
        for i, c in enumerate(t["considerations"]):
            elus.append((f"/textes/{tid}/considerations/{i}/depute", c["depute"]["groupe"], "Assemblée"))
        for chemin, g, ch in elus:
            if (g, ch) not in couples:
                e.append(f"{chemin}/groupe : {g!r} absent du tableau de la partie 2.7 pour la chambre {ch}")
            servis.add((g, ch))
    for g, ch in sorted(couples - servis):
        e.append(f"partie 2.7 : le couple ({ch}, {g}) ne sert jamais dans le fichier")
    # Initiales et élision (partie 2.8)
    noms_choix = set()
    for tid in TEXTES:
        t = textes[tid]
        a = t["auteur"]
        if a["type"] != "gouvernement":
            if not a["nom"] or a["nom"][0] not in sources.INITIALES_PERMISES:
                e.append(f"/textes/{tid}/auteur/nom : initiale non permise : {a['nom']!r}")
        for i, c in enumerate(t["considerations"]):
            dep = c["depute"]
            nom = dep["nom"]
            ch = f"/textes/{tid}/considerations/{i}/depute"
            if not nom or nom[0] not in sources.INITIALES_PERMISES:
                e.append(f"{ch}/nom : initiale non permise : {nom!r}")
                continue
            if nom[0] in sources.INITIALES_CHOIX:
                noms_choix.add(nom)
                if nom in elisions:
                    attendu = elisions[nom][1] == "d'"
                else:
                    attendu = None
            else:
                attendu = False
            if attendu is not None and dep["elision"] != attendu:
                e.append(f"{ch}/elision : {dep['elision']} (attendu : {attendu})")
    tab = set(elisions)
    for n in sorted(noms_choix - tab):
        e.append(f"partie 2.8 : {n!r} demande un choix et n'est pas au tableau")
    for n in sorted(tab - noms_choix):
        e.append(f"partie 2.8 : {n!r} est au tableau sans être un député de considération dont l'initiale demande un choix")
    for n, (ini, forme) in elisions.items():
        if sources.ACCORD_FORME[ini] != forme:
            e.append(f"partie 2.8 : {n!r} : Forme {forme!r} et Initiale {ini!r} ne s'accordent pas")
    return e


def etape6(d):
    e = []
    tg = Tirage(d["graine"])
    for i, cle in enumerate(CLES_VECTEURS):
        att = {"cle": cle, "chaine": tg.chaine(cle), "hex8": tg.hex8(cle), "n": tg.n(cle)}
        if d["vecteurs_test"][i] != att:
            e.append(f"/vecteurs_test/{i} : {d['vecteurs_test'][i]!r} ≠ recalcul {att!r}")
    return e


def chaines_affichees(d):
    out = [("/cercle/nom", d["cercle"]["nom"]), ("/cercle/inviteuse", d["cercle"]["inviteuse"])]
    for p in PERSONNAGES:
        for k in ("metier", "ville", "ligne_de_vie"):
            out.append((f"/personnages/{p}/{k}", d["personnages"][p][k]))
    for tid in TEXTES:
        t = d["textes"][tid]
        out.append((f"/textes/{tid}/titre", t["titre"]))
        for i, l in enumerate(t["lignes"]):
            out.append((f"/textes/{tid}/lignes/{i}", l))
        if t["auteur"]["type"] != "gouvernement":
            out.append((f"/textes/{tid}/auteur/nom", t["auteur"]["nom"]))
            out.append((f"/textes/{tid}/auteur/groupe", t["auteur"]["groupe"]))
        for i, c in enumerate(t["considerations"]):
            out.append((f"/textes/{tid}/considerations/{i}/depute/nom", c["depute"]["nom"]))
            out.append((f"/textes/{tid}/considerations/{i}/depute/groupe", c["depute"]["groupe"]))
            out.append((f"/textes/{tid}/considerations/{i}/texte", c["texte"]))
    return out


RE_RUN_CHIFFRES = re.compile(r"[0-9]+(?: [0-9]+)+")
RE_TRANCHES = re.compile(r"[0-9]{1,3}(?: [0-9]{3})+")


def typo_simple(s):
    """Erreurs de typographie simple d'une chaîne (étape 7)."""
    e = []
    if "\u2019" in s:
        e.append("contient U+2019")
    for ch in sorted({c for c in s if unicodedata.category(c) == "Zs" and c != " "}):
        e.append(f"contient U+{ord(ch):04X} (espace de catégorie Zs autre que U+0020)")
    for i, ch in enumerate(s):
        if ch in "?!;:»%" and (i == 0 or s[i - 1] != " "):
            e.append(f"« {ch} » non précédé d'une espace U+0020 (position {i})")
        if ch == "«" and (i + 1 >= len(s) or s[i + 1] != " "):
            e.append(f"« « » non suivi d'une espace U+0020 (position {i})")
    for m in RE_RUN_CHIFFRES.finditer(s):
        if not RE_TRANCHES.fullmatch(m.group(0)):
            e.append(f"espace entre deux chiffres hors d'un nombre par tranches : {m.group(0)!r}")
    return e


def etape7(d):
    e = []
    for chemin, s in chaines_affichees(d):
        for x in typo_simple(s):
            e.append(f"{chemin} : {x} ({s!r})")
    return e


def ordre_raisons(tid, n_fiche, tirage):
    """Rangs d'affichage des quatre raisons de fiche (fichier caché, §2)."""
    tri = sorted(range(1, n_fiche + 1), key=lambda i: tirage.cle_tri(f"ordre-raisons|{tid}|{i}"))
    return {i: r + 1 for r, i in enumerate(tri)}


def etape8(d, fiches, votes):
    e = []
    tg = Tirage(d["graine"])
    detail_ordre = {}
    for tid in TEXTES:
        f = fiches[tid]
        t = d["textes"][tid]
        ch = f"/textes/{tid}"
        if t["titre"] != f["titre"]:
            e.append(f"{ch}/titre : {t['titre']!r} ≠ fiche {f['titre']!r}")
        if t["lignes"] != f["lignes"]:
            e.append(f"{ch}/lignes : {t['lignes']!r} ≠ fiche {f['lignes']!r}")
        if (t["tension"], t["sens"]) != f["tension"]:
            e.append(f"{ch} : tension et sens ({t['tension']}, {t['sens']}) ≠ fiche {f['tension']}")
        if t["sources"] != f["sources"]:
            e.append(f"{ch}/sources : {t['sources']!r} ≠ fiche {f['sources']!r}")
        lien = f"https://www.assemblee-nationale.fr/dyn/{f['_leg']}/scrutins/{f['_scrutin']}"
        if t["lien_scrutin"] != f["lien"]:
            e.append(f"{ch}/lien_scrutin : {t['lien_scrutin']!r} ≠ ligne « Lien du scrutin » {f['lien']!r}")
        if t["lien_scrutin"] != lien:
            e.append(f"{ch}/lien_scrutin : {t['lien_scrutin']!r} ≠ adresse tirée du titre de la fiche {lien!r}")
        vo = votes[tid]
        if (vo["leg"], vo["scrutin"]) != (f["_leg"], f["_scrutin"]):
            e.append(f"{ch} : votes.md donne le scrutin {vo['leg']}e, {vo['scrutin']} ; la fiche {f['_leg']}e, {f['_scrutin']}")
        if t["vote"] != vo["vote"]:
            e.append(f"{ch}/vote : {t['vote']!r} ≠ votes.md {vo['vote']!r}")
        if t["auteur"] != f["auteur"]:
            e.append(f"{ch}/auteur : {t['auteur']!r} ≠ fiche {f['auteur']!r}")
        rangs = ordre_raisons(tid, 4, tg)
        detail_ordre[tid] = [(i, rangs[i], tg.n(f"ordre-raisons|{tid}|{i}")) for i in range(1, 5)]
        for r in f["raisons"]:
            rang = rangs[r["i"]]
            c = t["considerations"][rang - 1]
            ci = f"{ch}/considerations/{rang - 1}"
            att = {"texte": r["texte"], "cote": r["cote"], "pole": r["pole"]}
            obt = {"texte": c["texte"], "cote": c["cote"], "pole": c["pole"]}
            if att != obt:
                e.append(f"{ci} : {obt!r} ≠ raison {r['i']} de la fiche {att!r}")
            att = {"nom": r["nom"], "feminin": r["feminin"], "groupe": r["groupe"]}
            obt = {k: c["depute"][k] for k in ("nom", "feminin", "groupe")}
            if att != obt:
                e.append(f"{ci}/depute : {obt!r} ≠ raison {r['i']} de la fiche {att!r}")
    return e, detail_ordre


# ------------------------------------------------------------------ contrôles 2 à 4

def type_en_poles(niveau, s=1):
    """Réponse type écrite en pôles, pour s = 1 : (« neutre »|« simple »|« très », pôle)."""
    if niveau == 3:
        return ("neutre", None)
    intensite = "très" if niveau in (1, 5) else "simple"
    pole = 1 if niveau >= 4 else 0
    return (intensite, pole)


def controle2(d, prof):
    e = []
    for p in PERSONNAGES:
        if d["personnages"][p]["profil"] != prof["profils"][p]:
            e.append(f"/personnages/{p}/profil : {d['personnages'][p]['profil']!r} ≠ profils.md {prof['profils'][p]!r}")
    types = {}
    for p in PERSONNAGES:
        types[p] = {}
        for T in TENSIONS:
            pr = prof["profils"][p][T]
            pos = F(pr["position"], 100)
            pt = regles.position_type(pos, 1, pr["fermete"])
            types[p][T] = type_en_poles(pt["niveau"])
            if types[p][T] != prof["types"][p][T]:
                e.append(f"réponse type {p} {T} : recalcul {types[p][T]} ≠ profils.md {prof['types'][p][T]} (d = {fmt_f(pt['d'])})")
            if pt["d"] != prof["d"][p][T]:
                e.append(f"d {p} {T} : recalcul {fmt_f(pt['d'])} ≠ profils.md {fmt_f(prof['d'][p][T])}")
            f1 = "milieu" if abs(pos - F(1, 2)) < F(1, 10) else (1 if pos > F(1, 2) else 0)
            if f1 != prof["f1"][p][T]:
                e.append(f"corrigé F1 {p} {T} : recalcul {f1} ≠ profils.md {prof['f1'][p][T]}")
    # contraintes calculables
    A, N = types["Agathe"], types["Nassim"]
    for T in ("S", "P"):
        if A[T][1] is None or A[T][1] != N[T][1]:
            e.append(f"contrainte : Agathe et Nassim pas du même côté sur {T} ({A[T]}, {N[T]})")
    if A["T"][0] != "neutre" or N["T"][0] != "neutre":
        e.append(f"contrainte : Agathe et Nassim pas neutres tous deux sur T ({A['T']}, {N['T']})")
    if A["L"][1] is None or N["L"][1] is None or A["L"][1] == N["L"][1]:
        e.append(f"contrainte : Agathe et Nassim pas opposés sur L ({A['L']}, {N['L']})")
    for T in TENSIONS:
        pr = prof["profils"]["Odile"][T]
        dd = regles.position_type(F(pr["position"], 100), 1, pr["fermete"])["d"]
        if pr["fermete"] != "forte" or abs(dd) < F(56, 100):
            e.append(f"contrainte : Odile sur {T} : fermeté {pr['fermete']}, |d| = {fmt_f(abs(dd))} (attendu : forte, |d| ≥ 0,56)")
    partage = {"S": (1, 2, 1), "P": (2, 2, 0), "T": (1, 1, 2), "L": (2, 2, 0)}  # (pôle 0, pôle 1, neutres)
    for T in TENSIONS:
        c = (sum(1 for p in PERSONNAGES if types[p][T][1] == 0),
             sum(1 for p in PERSONNAGES if types[p][T][1] == 1),
             sum(1 for p in PERSONNAGES if types[p][T][0] == "neutre"))
        if c != partage[T]:
            e.append(f"contrainte : partage du cercle sur {T} : (pôle 0, pôle 1, neutres) = {c} ≠ {partage[T]}")
    for p in PERSONNAGES:
        t = types[p]
        if t["S"] == ("très", 0) and t["T"] == ("très", 0):
            e.append(f"contrainte : {p} a « très, vers Sécurité » et « très, vers Tradition »")
        if t["S"] == ("très", 1) and t["T"] == ("très", 1):
            e.append(f"contrainte : {p} a « très, vers Liberté » et « très, vers Changement »")
    return e, types


def textes_reduits(d):
    return {tid: {"tension": t["tension"], "sens": t["sens"],
                  "considerations": regles.considerations_reduites(t)}
            for tid, t in d["textes"].items()}


def recalculer_reponses(d, prof):
    """Réponses recalculées (contrôle 3) à partir de profils.md, des textes scellés et de la graine."""
    tg = Tirage(d["graine"])
    txts = textes_reduits(d)
    atyp, det_proc = regles.placer_atypiques(prof["nb_atypiques"], PERSONNAGES,
                                             prof["absences"], tg)
    reps, cotes, details = {}, {}, {}
    for p in PERSONNAGES:
        r, c, det = regles.toutes_les_reponses(p, prof["profils"][p], txts, tg,
                                                set(atyp[p]), set(prof["absences"][p]))
        reps[p], cotes[p], details[p] = r, c, det
    return atyp, det_proc, reps, cotes, details


def fmt_detail(p, tid, det, txt_scelle):
    l = []
    l.append(f"    p = {fmt_f(det['p'])}, fermeté {det['fermete']}, sens s = {det['sens']}")
    l.append(f"    a = {fmt_f(det['a'])}, d = {fmt_f(det['d'])}")
    if det.get("atypique"):
        l.append(f"    réponse atypique : réponse type {LIBELLE_NIVEAU[det['niveau_type']]}"
                 + (f" ; côté tiré par {det['cle_cote']} : {fmt_n(det['n_cote'])} → {det['cote_tire']:+d}"
                    if det["cle_cote"] else "") + f" ; niveau retenu {LIBELLE_NIVEAU[det['niveau']]}")
    else:
        l.append(f"    niveau {det['niveau']} ({LIBELLE_NIVEAU[det['niveau']]})")
    cons = {c["rang"]: c for c in txt_scelle["considerations"]}
    l.append("    considérations (rang : côté, pôle) : " + " ; ".join(
        f"{r} : {cons[r]['cote']}, {cons[r]['pole']}" for r in sorted(cons)))
    l.append(f"    E = {det['E']} ; pôle visé = {det['pole_vise']}")
    l.append("    niveaux de choix : " + " ; ".join(f"{n} {xs}" for n, xs in det["niveaux"]))
    if det["candidates"]:
        l.append(f"    niveau retenu : {det['niveau_retenu']} ; candidates : " + " ; ".join(
            f"{r} ({cle} : {fmt_n(n)})" for r, cle, n in det["candidates"]))
    else:
        l.append("    aucune candidate : « aucune »")
    return l


def controle3(d, prof):
    e = []
    # condition d'application de la règle 2.2
    for tid in TEXTES:
        t = d["textes"][tid]
        s = t["sens"]
        for c in t["considerations"]:
            ok = c["pole"] == "aucun" or (c["cote"] == "pour" and c["pole"] == s) or \
                (c["cote"] == "contre" and c["pole"] == 1 - s)
            if not ok:
                e.append(f"condition de la règle 2.2 : texte {tid}, rang {c['rang']} : "
                         f"« {c['cote']} » au pôle {c['pole']} avec s = {s} (à soumettre à Game design)")
    if e:
        return e, None
    try:
        atyp, det_proc, reps, cotes, details = recalculer_reponses(d, prof)
    except regles.Defaut as x:
        return [f"procédure des réponses atypiques : {x}"], None
    for p in PERSONNAGES:
        for tid in TEXTES:
            att = reps[p].get(tid)
            obt = d["reponses"][tid].get(p)
            if att != obt:
                e.append(f"/reponses/{tid}/{p} : fichier {obt!r} ≠ recalcul {att!r}")
                if tid in details[p]:
                    e.extend(fmt_detail(p, tid, details[p][tid], d["textes"][tid]))
        att = [{"cote_tire": cotes[p][str(n)], "texte": str(n)} for n in atyp[p]]
        if d["reponses_atypiques"][p] != att:
            e.append(f"/reponses_atypiques/{p} : fichier {d['reponses_atypiques'][p]!r} ≠ recalcul {att!r}")
            for et in det_proc[p]["etapes"]:
                e.append(f"    étape {et['etape']} (textes {et['plage'][0]} à {et['plage'][1]}) : "
                         f"refusés {et['refuses']} ; retenu {et['retenu']}")
    return e, (atyp, det_proc, reps, cotes, details)


def controle4(d, prof):
    e = []
    for p in PERSONNAGES:
        if d["absences"][p] != prof["absences"][p]:
            e.append(f"/absences/{p} : {d['absences'][p]!r} ≠ profils.md {prof['absences'][p]!r}")
    return e


def annexe_a(d):
    e = []
    ordre = [d["textes"][str(n)]["tension"] for n in range(1, 15)]
    if ordre != ORDRE_TENSIONS_QUOTIDIENS:
        e.append(f"ordre des tensions {' '.join(ordre)} ≠ {' '.join(ORDRE_TENSIONS_QUOTIDIENS)}")
    ent = tuple(d["textes"][t]["tension"] for t in ENTREE)
    if ent != TENSIONS_ENTREE:
        e.append(f"tensions d'entrée {ent} ≠ {TENSIONS_ENTREE}")
    for T in TENSIONS:
        sens = {d["textes"][str(n)]["sens"] for n in range(1, 15) if d["textes"][str(n)]["tension"] == T}
        if sens != {0, 1}:
            e.append(f"tension {T} : sens des textes quotidiens {sorted(sens)} (il faut au moins un de chaque)")
    for tid in TEXTES:
        cs = d["textes"][tid]["considerations"]
        cotes = [c["cote"] for c in cs]
        poles = [c["pole"] for c in cs]
        if "pour" not in cotes or "contre" not in cotes:
            e.append(f"texte {tid} : il faut au moins une raison « pour » et une « contre »")
        if 0 not in poles or 1 not in poles:
            e.append(f"texte {tid} : il faut au moins une raison par pôle")
        if poles.count("aucun") > 1:
            e.append(f"texte {tid} : plus d'une raison « aucun »")
    for T, (avec, sans) in (("S", (2, 2)), ("T", (2, 1))):
        ts = [str(n) for n in range(1, 14) if d["textes"][str(n)]["tension"] == T]
        a = sum(1 for t in ts if any(c["pole"] == "aucun" for c in d["textes"][t]["considerations"]))
        if (a, len(ts) - a) != (avec, sans):
            e.append(f"textes {T} devinés : {a} avec une raison « aucun », {len(ts) - a} sans (attendu : {avec} et {sans})")
    return e


def compter_aucune(d):
    c = {"entree": [], "devines": [], "14": []}
    for tid in TEXTES:
        for p, r in d["reponses"][tid].items():
            if r["raison"] == "aucune":
                cle = "entree" if tid in ENTREE else ("14" if tid == "14" else "devines")
                c[cle].append(f"{p} au texte {tid}")
    return c


# ------------------------------------------------------------------ rapport

class Rapport:
    def __init__(self):
        self.l = []

    def __call__(self, s=""):
        self.l.append(s)

    def texte(self):
        return "\n".join(self.l) + "\n"


def controle_scelle(octets, srcs, date_scellement, nb_atypiques_rapport=None,
                    empreinte_publiee=None, page=None, empreintes_scellement=None,
                    chemin_fichier="", commit=None, detail_complet=False, appliquees=None,
                    entrees_construction=None):
    """srcs : {nom de source : (chemin affiché, texte, octets)} pour les clés
    simulation, profils, schema, votes, S, P, T, L. Rend (texte du rapport, verdict)."""
    R = Rapport()
    verdict = {"controle1": None, "controle2": None, "controle3": None, "controle4": None,
               "annexe_a": None, "sources": None, "graine": None}
    R("Programme de contrôle (C) — contrôle du fichier scellé (schéma, partie 4.1)")
    R("=" * 78)
    R(f"Fichier contrôlé : {chemin_fichier}")
    R(f"SHA-256 du fichier : {sha256_hex(octets)}  ({len(octets)} octets)")
    R(f"Jour du scellement (paramètre, recopié du rapport de scellement) : {date_scellement}")
    if commit:
        R(f"Commit du dépôt au moment du contrôle : {commit}")
    R("")
    R("Sources lues (SHA-256) :")
    for cle in ("S", "P", "T", "L", "votes", "profils", "simulation", "schema"):
        chemin, _, o = srcs[cle]
        R(f"  {sha256_hex(o)}  {chemin}")
    for chemin, o in (appliquees or []):
        R(f"  {sha256_hex(o)}  {chemin}  (spécification appliquée par le code, pas lue par le programme)")
    if empreintes_scellement is not None:
        diff = []
        for cle in ("S", "P", "T", "L", "votes", "profils", "simulation", "schema"):
            chemin, _, o = srcs[cle]
            nom = chemin.split("/")[-1]
            autre = empreintes_scellement.get(nom) or empreintes_scellement.get(chemin)
            if autre is None:
                diff.append(f"  {nom} : absent du relevé de l'agent qui scelle")
            elif autre != sha256_hex(o):
                diff.append(f"  {nom} : agent qui scelle {autre} ≠ C {sha256_hex(o)}")
        verdict["sources"] = not diff
        R("Mêmes sources que l'agent qui scelle : " + ("oui" if not diff else "NON (échec)"))
        for x in diff:
            R(x)
    else:
        R("Mêmes sources que l'agent qui scelle : non comparé (relevé non fourni)")
    R("")

    def stop(n, msgs):
        R(f"  Étape {n} : ÉCHEC")
        for m in msgs:
            R(f"    - {m}")
        R("")
        R("Le contrôle 1 s'arrête au premier échec (schéma, partie 4.1) : contrôles 2 à 4 non faits.")
        verdict["controle1"] = False
        return R.texte(), verdict

    R("Contrôle 1 (fichier scellé)")
    R("-" * 78)
    etats = []
    manque_c1 = []
    ok, msgs = etape1(octets, empreinte_publiee)
    if ok is False:
        return stop(1, msgs)
    R(f"  Étape 1 (empreinte) : {'passée' if ok else 'non faite'} — {msgs[0]}")
    etats.append(ok)
    ok, msgs = etape2(octets, page)
    if ok is False:
        return stop(2, msgs)
    R(f"  Étape 2 (données embarquées) : {'passée' if ok else 'non faite'} — {msgs[0]}")
    etats.append(ok)
    ok, d, msg = canon.est_canonique(octets)
    if not ok:
        return stop(3, [msg])
    R("  Étape 3 (forme) : passée — UTF-8 strict ; relu puis remis en forme canonique, mêmes octets")
    e = verifier_schema(d, date_scellement)
    if e:
        return stop(4, e)
    R("  Étape 4 (schéma) : passée — schéma fermé, version 4, types, adresses, dates "
      f"(toutes ≤ {date_scellement})")
    try:
        fiches_sim = sources.lire_fiches_personnages(srcs["simulation"][1])
        groupes = sources.lire_groupes(srcs["schema"][1])
        elisions = sources.lire_elisions(srcs["schema"][1])
    except sources.ErreurSource as x:
        return stop(5, [f"lecture d'une source : {x}"])
    e = etape5(d, fiches_sim, groupes, elisions)
    if e:
        return stop(5, e)
    R(f"  Étape 5 (cohérence interne) : passée — rangs, groupes distincts, ponctuation et guillemets, "
      f"votes, absences, réponses atypiques, fiches du §1, cercle, vecteurs ; partie 2.7 "
      f"({len(groupes)} lignes, règles tenues, chaque couple sert) ; partie 2.8 ({len(elisions)} noms)")
    e = etape6(d)
    if e:
        return stop(6, e)
    R("  Étape 6 (vecteurs de test) : passée — les trois vecteurs recalculés sont identiques")
    e = etape7(d)
    if e:
        return stop(7, e)
    R(f"  Étape 7 (typographie simple) : passée — {len(chaines_affichees(d))} chaînes affichées")
    try:
        fiches = sources.lire_fiches([(srcs[k][0], srcs[k][1]) for k in ("S", "P", "T", "L")])
        votes = sources.lire_votes(srcs["votes"][1])
    except sources.ErreurSource as x:
        return stop(8, [f"lecture des fiches : {x}"])
    e, detail_ordre = etape8(d, fiches, votes)
    if e:
        return stop(8, e)
    # « Mêmes sources » fait partie de l'étape 8 (schéma, partie 4.1) : deux empreintes
    # différentes d'un même fichier sont un échec ; sans le relevé, le contrôle 1 n'est pas complet.
    if verdict["sources"] is False:
        return stop(8, ["comparaison aux 17 fiches et à votes.md : passée",
                        "Mêmes sources : le programme de contrôle et l'agent qui scelle n'ont pas lu "
                        "les mêmes sources"] + [x.strip() for x in diff])
    R("  Étape 8 (fidélité aux fiches) : passée — 17 fiches et votes.md relus ; titre, lignes, vote, "
      "auteur, lien, sources, tension, sens et raisons identiques, raisons dans l'ordre tiré ; "
      + ("mêmes sources que l'agent qui scelle" if verdict["sources"] else
         "Mêmes sources : non comparé (relevé non fourni)"))
    R("    Ordre d'affichage tiré (clé « ordre-raisons|texte|i ») : numéro de fiche → rang")
    for tid in TEXTES:
        R(f"      {tid:>2} : " + ", ".join(f"{i}→{r}" for i, r, _ in detail_ordre[tid]))
    complet = all(etats) and verdict["sources"] is True
    verdict["controle1"] = True if complet else "partiel"
    manque = [f"étape {n} non faite (son entrée manque)" for n, ok in zip((1, 2), etats) if not ok]
    if verdict["sources"] is not True:
        manque.append("Mêmes sources non comparé (étape 8)")
    manque_c1[:] = manque
    R("  Contrôle 1 : " + ("complet, huit étapes passées" if complet else
                           "étapes passées : " + ", ".join(str(n) for n, ok in zip((1, 2), etats) if ok)
                           + (", " if any(etats) else "") + "3 à 8 ; " + " ; ".join(manque)
                           + " : le contrôle 1 n'est pas complet"))
    # Vérification ajoutée : la graine
    g_att = sha256_hex(("elenchos-essai|graine|" + COMMIT_GRAINE).encode())[:16]
    verdict["graine"] = d["graine"] == g_att
    R(f"  Hors étapes (ajout de C) : graine recalculée par la dérivation du §0 = {g_att} ; "
      + ("identique à celle du fichier" if verdict["graine"] else f"DIFFÉRENTE de celle du fichier ({d['graine']})"))
    if entrees_construction is not None:
        # §8.8 : fichier d'entrées de la construction, hors du dossier de la page.
        x = entrees_construction
        h = sha256_hex(octets)
        pub = None if empreinte_publiee is None else empreinte_publiee.replace(" ", "").replace("\n", "")
        champs = ("version_page", "consultes_le", "empreinte", "empreinte_publiee_le", "empreinte_publiee_a")
        manquants = [c for c in champs if c not in x]
        ok = not manquants and x["empreinte"] == h and (pub is None or x["empreinte"] == pub)
        verdict["entrees_construction"] = ok
        R("  Hors étapes (ajout de C) : entrees-construction.json (§8.8) : "
          + (f"champ(s) absent(s) : {', '.join(manquants)}" if manquants else
             f"empreinte {x['empreinte']} " + ("= SHA-256 du fichier" if x["empreinte"] == h else "≠ SHA-256 du fichier")
             + ("" if pub is None else (" = empreinte publiée" if x["empreinte"] == pub else " ≠ empreinte publiée"))
             + f" ; version_page {x['version_page']} ; consultes_le {x['consultes_le']} ; empreinte publiée le "
             f"{x['empreinte_publiee_le']} à {x['empreinte_publiee_a']} (ces quatre champs : recopiés, non vérifiables par C)"))
    R("")

    try:
        prof = sources.lire_profils(srcs["profils"][1])
    except sources.ErreurSource as x:
        R(f"Lecture de profils.md : ÉCHEC — {x}")
        verdict["controle2"] = verdict["controle3"] = verdict["controle4"] = False
        return R.texte(), verdict
    R(f"Nombre de réponses atypiques lu dans profils.md : {prof['nb_atypiques']}"
      + ("" if nb_atypiques_rapport is None else
         f" ; rapport de scellement : {nb_atypiques_rapport} — "
         + ("égaux" if nb_atypiques_rapport == prof["nb_atypiques"] else "DIFFÉRENTS (échec)")))
    if nb_atypiques_rapport is not None and nb_atypiques_rapport != prof["nb_atypiques"]:
        verdict["nb_atypiques"] = False
    longueurs = {p: len(d["reponses_atypiques"][p]) for p in PERSONNAGES}
    R(f"Longueur des tableaux reponses_atypiques : {longueurs}")
    R("")

    R("Contrôle 2 (profils)")
    R("-" * 78)
    e2, types = controle2(d, prof)
    verdict["controle2"] = not e2
    R("  " + ("passé" if not e2 else f"ÉCHEC ({len(e2)} différences)"))
    for x in e2:
        R(f"    - {x}")
    R("  Tableau recalculé des réponses types (s = 1), en pôles :")
    for p in PERSONNAGES:
        R(f"    {p:<8} " + " | ".join(
            f"{T} {('neutre' if types[p][T][0] == 'neutre' else types[p][T][0] + ', vers ' + POLES_COURTS[T][types[p][T][1]])}"
            for T in TENSIONS))
    R("  Laissé au Vérificateur : « aucune étiquette politique » (ne se vérifie pas par programme).")
    R("")

    R("Contrôle 3 (réponses)")
    R("-" * 78)
    e3, calc = controle3(d, prof)
    verdict["controle3"] = not e3
    R("  Condition d'application de la règle 2.2 (« pour » sert s ou aucun ; « contre » sert 1 \u2212 s ou aucun) : "
      + ("tenue sur les 17 textes" if calc is not None or not e3 else "voir ci-dessous"))
    R("  " + ("passé : les réponses des quatre personnages aux 17 textes, réponses atypiques et "
              "cote_tire compris, sont égales au recalcul" if not e3 else f"ÉCHEC ({len(e3)} lignes)"))
    for x in e3:
        R(f"    - {x}" if not x.startswith("    ") else x)
    if calc is not None:
        atyp, det_proc, reps, cotes, details = calc
        R("  Procédure des réponses atypiques (ordre des textes par t(\"ecart|prénom|n\"), étapes) :")
        for p in PERSONNAGES:
            R(f"    {p} : retenus {atyp[p]}")
            for et in det_proc[p]["etapes"]:
                ref = "; ".join(f"{n} {', '.join(w)}" for n, w in et["refuses"]) or "aucun refus"
                R(f"      étape {et['etape']} (textes {et['plage'][0]} à {et['plage'][1]}) : retenu {et['retenu']} ({ref})")
        if detail_complet:
            R("  Détail du calcul de chaque réponse :")
            for tid in TEXTES:
                for p in PERSONNAGES:
                    if tid in details[p]:
                        r = reps[p][tid]
                        R(f"   [{tid}] {p} : {LIBELLE_NIVEAU[r['niveau']]}, raison {r['raison']}"
                          + (" (atypique)" if details[p][tid].get("atypique") else ""))
                        for x in fmt_detail(p, tid, details[p][tid], d["textes"][tid]):
                            R(x)
    R("")

    R("Contrôle 4 (absences)")
    R("-" * 78)
    e4 = controle4(d, prof)
    verdict["controle4"] = not e4
    R("  " + ("passé : absences égales à profils.md" if not e4 else f"ÉCHEC ({len(e4)} différences)"))
    for x in e4:
        R(f"    - {x}")
    R("  Un absent ne répond pas (étape 5) ; qu'il ne devine pas, le moteur le garantit "
      "(manche seulement si le texte du jour n'est pas dans ses absences).")
    R("")

    R("Annexe A du fichier caché")
    R("-" * 78)
    ea = annexe_a(d)
    verdict["annexe_a"] = not ea
    R("  " + ("passée : ordre des tensions, tensions d'entrée, sens, raisons par texte, répartition des "
              "raisons « aucun » sur S et T" if not ea else f"ÉCHEC ({len(ea)} différences)"))
    for x in ea:
        R(f"    - {x}")
    ca = compter_aucune(d)
    R("  Mesure (sans échec) : réponses « aucune » des personnages dans le fichier :")
    R(f"    entrée : {len(ca['entree'])} {ca['entree']}")
    R(f"    textes devinés (1 à 13) : {len(ca['devines'])} {ca['devines']}")
    R(f"    texte 14 : {len(ca['14'])} {ca['14']}")
    tot = sum(len(v) for v in ca.values())
    R(f"    total : {tot} (au plus 4 attendus)")
    R("")
    R("Hors de portée d'un programme (schéma, partie 4.1) : la vérité des trois champs de `vote`, "
      "l'exactitude du mandat et du groupe et leur moment, la justesse de chaque Forme d'élision, "
      "« aucune étiquette politique ».")
    R("")
    ok_tout = (verdict["controle1"] is True or verdict["controle1"] == "partiel") and \
        verdict["controle2"] and verdict["controle3"] and verdict["controle4"] and \
        verdict["annexe_a"] and verdict["graine"] and verdict.get("nb_atypiques", True) is not False \
        and verdict["sources"] is not False and verdict.get("entrees_construction", True) is not False
    R("Verdict : " + ("aucun défaut trouvé" if ok_tout else "DÉFAUT(S) TROUVÉ(S)")
      + ("" if verdict["controle1"] is True else
         " (contrôle 1 partiel : " + " ; ".join(manque_c1) + ")"))
    return R.texte(), verdict
