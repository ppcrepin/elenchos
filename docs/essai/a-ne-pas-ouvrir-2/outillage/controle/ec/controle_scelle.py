"""Contrôle 1 du second essai (schéma 2, partie 5.1 ; S1, partie 4.1, pour tout ce
que la partie 5.1 ne change pas), sur un fichier scellé ou candidat.

Le premier échec arrête le contrôle 1. Une étape dont l'entrée manque est « non
faite », jamais « passée ». Les contrôles 2 à 4 viennent au jalon suivant.
"""

import base64
import re
import unicodedata
from fractions import Fraction as F

from . import amo, calendrier, canon, regles, sources
from .jeu import (PERSONNAGES, JOUES, ENTREE, HISTOIRE, TOUS, ORDRES_TENSIONS)
from .schema_scelle import verifier_schema
from .tirage import Tirage, sha256_hex, graine_essai2

GUILLEMETS = set("\u00ab\u00bb\u0022\u201c\u201d\u2039\u203a")
CLES_VECTEURS = ("raison|Odile|E2|3", "hasard|Nassim|13|porteur", "ecart-hstar|1|Valentin")
REPERE = b"/*elenchos-scelle*/"
PHRASE_B = "Cet amendement supprimerait tout l'article qui prévoit ces mesures."
MAX_LIGNE = 90
MAX_TITRE = 60

# Combinaisons permises (schéma 2, partie 2.5).
COMBI_VOTE = {
    ("texte", "adopte"): ("navette", "definitif"),
    ("texte", "rejete"): ("navette", "aucune"),
    ("article", "adopte"): ("navette", "aucune"),
    ("amendement", "adopte"): ("navette", "aucune"),
    ("article", "rejete"): ("aucune",),
    ("amendement", "rejete"): ("aucune",),
    ("motion", "rejete"): ("aucune",),
    ("resolution", "adopte"): ("aucune",),
    ("resolution", "rejete"): ("aucune",),
}
COMBI_SUITE = {
    "texte_tombe": ({"article"}, {"rejete"}),
    "texte_retire": ({"article", "amendement"}, {"adopte", "rejete"}),
}


def rang_cle(t):
    return {"E1": -3, "E2": -2, "E3": -1}.get(t, None) if not t.isdigit() else int(t)


def nom_texte(t):
    return t if not t.isdigit() else f"T{t}"


# ------------------------------------------------------------------ étapes 1 et 2

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


# ------------------------------------------------------------------ étape 5

def genre_raison(cote_, pole, s):
    """Schéma 2, partie 2.5 : attendue, croisée ou pratique."""
    pi_c = s if cote_ == "pour" else 1 - s
    if pole == "aucun":
        return "pratique"
    return "attendue" if pole == pi_c else "croisee"


def defauts_d034(t):
    e = []
    s = t["sens"]
    par_cote = {"pour": [], "contre": []}
    for c in t["considerations"]:
        par_cote[c["cote"]].append(genre_raison(c["cote"], c["pole"], s))
    inatt = {}
    for cote_, gs in par_cote.items():
        if len(gs) != 2:
            e.append(f"côté « {cote_} » : {len(gs)} raisons (attendu : 2)")
        if "attendue" not in gs:
            e.append(f"côté « {cote_} » : aucune raison attendue")
        inatt[cote_] = sum(1 for g in gs if g != "attendue")
        if gs.count("pratique") > 1:
            e.append(f"côté « {cote_} » : « aucun » plus d'une fois")
    if inatt["pour"] != inatt["contre"] or inatt["pour"] not in (0, 1):
        e.append(f"inattendues : {inatt['pour']} « pour », {inatt['contre']} « contre » (attendu : 0 et 0, ou 1 et 1)")
    return e, {k: v for k, v in par_cote.items()}


def ordre_retenu(d):
    ts = [d["textes"][str(n)]["tension"] for n in range(15)]
    ent = tuple(d["textes"][e]["tension"] for e in ENTREE)
    for nom, (ordre, entree) in ORDRES_TENSIONS.items():
        if ts == ordre and ent == entree:
            return nom, ts, ent
    return None, ts, ent


def etape5(d, fiches_sim, tables, amo_dossiers):
    """Rend (erreurs, notes, informations). `tables` : {"groupes", "commissions",
    "elisions"} déjà lues ; `amo_dossiers` : dossiers des données ouvertes (ou [])."""
    e, notes, info = [], [], []
    textes = d["textes"]
    # Tables exigées (parties 2.3 et 2.4)
    for cle, att in (("calendrier", calendrier.table_calendrier()), ("semaines", calendrier.table_semaines()),
                     ("cercle", calendrier.table_cercle())):
        if d[cle] != att:
            if isinstance(att, list):
                for i, (x, y) in enumerate(zip(d[cle], att)):
                    if x != y:
                        e.append(f"/{cle}/{i} : {canon.canonique(x)} ≠ recalcul du §0 {canon.canonique(y)}")
            else:
                e.append(f"/{cle} : {canon.canonique(d[cle])} ≠ recalcul {canon.canonique(att)}")
    # Histoire (fichier caché 2, point 2 bis)
    tg = Tirage(d["graine"])
    h_att, _ = regles.textes_histoire(tg)
    for i, hid in enumerate(HISTOIRE, start=1):
        o = d["histoire"]["textes"][hid]
        a = h_att[hid]
        if o["jour"] != i - 91:
            e.append(f"/histoire/textes/{hid}/jour : {o['jour']} ≠ {i - 91}")
        for k in ("tension", "sens", "raisons"):
            if o[k] != a[k]:
                e.append(f"/histoire/textes/{hid}/{k} : {canon.canonique(o[k])} ≠ point 2 bis {canon.canonique(a[k])}")
        if (o["fiche"] is not None) != (hid == "H86"):
            e.append(f"/histoire/textes/{hid}/fiche : seul H86 a une fiche")
    h86 = d["histoire"]["textes"]["H86"]
    if (h86["tension"], h86["sens"]) != ("P", 0):
        e.append(f"/histoire/textes/H86 : tension et sens ({h86['tension']}, {h86['sens']}) ≠ (P, 0)")
    # Textes joués
    rejetes = []
    par_objet = {}
    for tid in JOUES:
        t = textes[tid]
        ch = f"/textes/{tid}"
        for i, c in enumerate(t["considerations"]):
            if c["rang"] != i + 1:
                e.append(f"{ch}/considerations/{i}/rang : {c['rang']} ≠ place {i + 1}")
            s = c["texte"]
            if not s or s[-1] not in ".?!":
                e.append(f"{ch}/considerations/{i}/texte : ne finit pas par « . », « ? » ou « ! »")
            else:
                j = len(s) - 2
                if s[-1] in "?!" and j >= 0 and s[j] == " ":
                    j -= 1
                if s[0] in GUILLEMETS or (j >= 0 and s[j] in GUILLEMETS):
                    e.append(f"{ch}/considerations/{i}/texte : guillemet à un bord")
        gs = [c["depute"]["groupe"] for c in t["considerations"]]
        if len(set(gs)) != 4:
            e.append(f"{ch}/considerations : groupes pas deux à deux différents (null compte comme une valeur) : {gs}")
        d34, genres = defauts_d034(t)
        for x in d34:
            e.append(f"{ch} : D-034 : {x}")
        notes.append(f"{nom_texte(tid)} : " + " ; ".join(f"{k} {'/'.join(v)}" for k, v in genres.items()))
        v = t["vote"]
        perm = COMBI_VOTE.get((v["objet"], v["issue"]))
        if perm is None or v["etape"] not in perm:
            e.append(f"{ch}/vote : combinaison non permise (objet {v['objet']}, issue {v['issue']}, étape {v['etape']})")
        if v["suite"] is not None:
            objs, iss = COMBI_SUITE[v["suite"]]
            if v["objet"] not in objs or v["issue"] not in iss:
                e.append(f"{ch}/vote/suite : {v['suite']} non permise avec objet {v['objet']} et issue {v['issue']}")
        if v["issue"] == "rejete":
            rejetes.append(tid)
        par_objet.setdefault(v["objet"], []).append(v["issue"])
        if len(t["titre"]) > MAX_TITRE or ":" in t["titre"]:
            e.append(f"{ch}/titre : E8 : {len(t['titre'])} points de code, « : » {'présent' if ':' in t['titre'] else 'absent'}")
    fv = h86["fiche"]
    if fv is not None:
        if len(fv["titre"]) > MAX_TITRE or ":" in fv["titre"]:
            e.append(f"/histoire/textes/H86/fiche/titre : E8 : {len(fv['titre'])} points de code")
        v = fv["vote"]
        perm = COMBI_VOTE.get((v["objet"], v["issue"]))
        if perm is None or v["etape"] not in perm:
            e.append(f"/histoire/textes/H86/fiche/vote : combinaison non permise")
        if v["suite"] is not None:
            objs, iss = COMBI_SUITE[v["suite"]]
            if v["objet"] not in objs or v["issue"] not in iss:
                e.append("/histoire/textes/H86/fiche/vote/suite : combinaison non permise")
    # D-028 (schéma 2, partie 5.1)
    if not 6 <= len(rejetes) <= 12:
        e.append(f"D-028 : {len(rejetes)} textes rejetés sur 18 (attendu : 6 à 12)")
    if not any(t in rejetes for t in ENTREE):
        e.append("D-028 : aucun rejeté parmi E1 à E3")
    for obj, iss in par_objet.items():
        if len(iss) >= 2 and not ({"adopte", "rejete"} <= set(iss)):
            e.append(f"A.4 : l'objet « {obj} », servi {len(iss)} fois, n'a pas un adopté et un rejeté ({iss})")
    if not any(textes[t]["vote"]["objet"] in ("texte", "article") and textes[t]["vote"]["issue"] == "rejete"
               for t in JOUES):
        e.append("A.4 : aucun texte d'objet « texte » ou « article » n'est rejeté")
    info.append(f"rejetés : {len(rejetes)} sur 18 ({', '.join(nom_texte(t) for t in rejetes)}) ; "
                "objets : " + ", ".join(f"{o} {len(i)} ({i.count('adopte')} adoptés)" for o, i in sorted(par_objet.items())))
    # Réponses, absences, réponses atypiques (partie 2.7)
    for p in PERSONNAGES:
        abs_ = d["absences"][p]
        for a in abs_:
            if a in ENTREE or a == "14":
                e.append(f"/absences/{p} : absence sur {nom_texte(a)} (jamais sur E1 à E3 ni sur T14)")
        for tid in TOUS:
            a_rep = p in d["reponses"][tid]
            if a_rep == (tid in abs_):
                e.append(f"/reponses/{tid} : {p} {'a' if a_rep else 'n a pas'} de réponse, et ce texte "
                         f"{'est' if tid in abs_ else 'n est pas'} dans ses absences")
        for o in d["reponses_atypiques"][p]:
            if o["texte"] in ENTREE or o["texte"] == "14" or p not in d["reponses"][o["texte"]]:
                e.append(f"/reponses_atypiques/{p} : {nom_texte(o['texte'])} (jamais sur E1 à E3 ni T14, toujours sur une réponse)")
    for tid in TOUS:
        n_abs = sum(1 for p in PERSONNAGES if tid in d["absences"][p])
        if n_abs > 1:
            e.append(f"/absences : {n_abs} absences sur {nom_texte(tid)} (au plus une)")
        if len(d["reponses"][tid]) < 3:
            e.append(f"/reponses/{tid} : {len(d['reponses'][tid])} réponses de personnages (au moins trois)")
    # Fiches du §1, cercle, vecteurs
    for p in PERSONNAGES:
        for k in ("age", "metier", "ville", "ligne_de_vie", "heure_de_jeu"):
            if d["personnages"][p][k] != fiches_sim[p][k]:
                e.append(f"/personnages/{p}/{k} : {d['personnages'][p][k]!r} ≠ §1 {fiches_sim[p][k]!r}")
    for i, vt in enumerate(d["vecteurs_test"]):
        if vt["chaine"] != d["graine"] + "|" + vt["cle"]:
            e.append(f"/vecteurs_test/{i}/chaine ≠ graine + « | » + cle")
        if vt["n"] != int(vt["hex8"], 16):
            e.append(f"/vecteurs_test/{i}/n ≠ valeur de hex8")
    # Ordre des tensions (fichier caché 2, point 14)
    nom, ts, ent = ordre_retenu(d)
    if nom is None:
        e.append(f"ordre des tensions : T0 à T14 = {' '.join(ts)}, entrée = {' '.join(ent)} : ni l'ordre retenu, ni R2, ni R3")
    else:
        info.append(f"ordre des tensions : {nom} ({' '.join(ts)} ; entrée {' '.join(ent)})")
    # Groupes, commissions, élisions
    eg, ig = verifier_groupes(d, tables["groupes"], amo_dossiers)
    e.extend(eg)
    info.extend(ig)
    e.extend(verifier_commissions(d, tables["commissions"], amo_dossiers, info))
    e.extend(verifier_elisions(d, tables["elisions"]))
    return e, notes, info


def elus(d):
    """[(chemin, nom, groupe, chambre)] : auteurs élus et députés des considérations."""
    out = []
    for tid in JOUES:
        t = d["textes"][tid]
        a = t["auteur"]
        if a["type"] in ("depute", "senateur"):
            out.append((f"/textes/{tid}/auteur", a["nom"], a["groupe"],
                        "Assemblée" if a["type"] == "depute" else "Sénat"))
        for i, c in enumerate(t["considerations"]):
            out.append((f"/textes/{tid}/considerations/{i}/depute", c["depute"]["nom"], c["depute"]["groupe"],
                        "Assemblée"))
    return out


def verifier_groupes(d, groupes, amo_dossiers):
    """Partie 2.10 : emploi dans le fichier, puis vérification contre `amo` (ou repli)."""
    e, info = [], []
    couples = {(g, ch) for g, ch, _, _, _ in groupes}
    servis = set()
    for chemin, nom, g, ch in elus(d):
        if g is None:
            continue
        if (g, ch) not in couples:
            e.append(f"{chemin}/groupe : {g!r} absent du tableau de la partie 2.10 pour la chambre {ch}")
        servis.add((g, ch))
        for x in sources.defauts_ecriture_groupe(g):
            e.append(f"{chemin}/groupe : {g!r} : {x}")
    for g, ch in sorted(couples - servis):
        e.append(f"partie 2.10 : le couple ({ch}, {g}) ne sert jamais dans le fichier")
    repli = []
    abreges = set()
    lus = []
    for g, ch, leg, ids, _ in groupes:
        for ident in ids:
            try:
                org = amo.lire_organe(amo_dossiers, ident)
            except amo.ErreurAmo as x:
                repli.append((g, ident, str(x)))
                continue
            lus.append(org)
            if org["libelleAbrege"]:
                abreges.add(org["libelleAbrege"])
            # Q-G1 (tranché) : comparaison après remplacement de U+2019 par U+0027.
            lib = None if org["libelle"] is None else unicodedata.normalize("NFC", org["libelle"]).replace("\u2019", "'")
            if lib != g:
                e.append(f"partie 2.10 : {ident} : `groupe` {g!r} ≠ libelle de l'organe {org['libelle']!r} ({org['chemin']})")
            if org["libelle"] is not None and org["libelle"] in (org["libelleAbrege"], org["libelleAbrev"]):
                e.append(f"partie 2.10 : {ident} : le libelle {org['libelle']!r} n'est qu'un sigle "
                         f"(libelleAbrege {org['libelleAbrege']!r}, libelleAbrev {org['libelleAbrev']!r})")
            for q, h in org["autres"]:
                if h != org["sha256"]:
                    info.append(f"amo : {ident} : autre copie différente, non lue : {q} ({h})")
    for org in lus:
        info.append(f"amo lu : {org['sha256']}  {org['chemin']}  ({org['uid']}, {org['codeType']}, "
                    f"libelle {org['libelle']!r}, libelleAbrege {org['libelleAbrege']!r}, libelleAbrev {org['libelleAbrev']!r})")
    if repli:
        codes = set(sources.CODES_REPLI) | abreges
        for g, ident, pourquoi in repli:
            info.append(f"amo inutilisable pour {ident} ({pourquoi}) : repli sur la liste de codes")
            if g in codes:
                e.append(f"partie 2.10 : {ident} : `groupe` {g!r} est un code de la liste de repli")
    return e, info


def verifier_commissions(d, commissions, amo_dossiers, info):
    e = []
    libs = {lib: (ids, src, courte) for lib, ids, src, courte in commissions}
    servis = set()
    for tid in JOUES:
        a = d["textes"][tid]["auteur"]
        if a["type"] == "commission":
            if a["libelle"] not in libs:
                e.append(f"/textes/{tid}/auteur/libelle : {a['libelle']!r} absent du tableau de la partie 2.10 bis")
            servis.add(a["libelle"])
    for lib in sorted(set(libs) - servis):
        e.append(f"partie 2.10 bis : {lib!r} ne sert jamais dans le fichier")
    for lib, (ids, src, courte) in libs.items():
        if courte:
            info.append(f"commission {lib!r} : forme courte, forme seule vérifiée (partie 2.10 bis)")
            continue
        for ident in ids:
            try:
                org = amo.lire_organe(amo_dossiers, ident)
            except amo.ErreurAmo as x:
                info.append(f"commission {lib!r} : {ident} non lu ({x})")
                continue
            off = org["libelle"] or ""
            court = off[:1].lower() + off[1:]
            info.append(f"commission {lib!r} : {ident} libelle {off!r} ({org['sha256']}  {org['chemin']}) : "
                        + ("égal, majuscule initiale mise en minuscule" if court == lib else
                           "DIFFÉRENT (information, voir QUESTIONS.md, Q-C2)"))
    return e


def verifier_elisions(d, elisions):
    e = []
    noms_choix = set()
    for tid in JOUES:
        t = d["textes"][tid]
        a = t["auteur"]
        if a["type"] in ("depute", "senateur"):
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
                attendu = (elisions[nom][1] == "d'") if nom in elisions else None
            else:
                attendu = False
            if attendu is not None and dep["elision"] != attendu:
                e.append(f"{ch}/elision : {dep['elision']} (attendu : {attendu})")
    for n in sorted(noms_choix - set(elisions)):
        e.append(f"partie 2.11 : {n!r} demande un choix et n'est pas au tableau")
    for n in sorted(set(elisions) - noms_choix):
        e.append(f"partie 2.11 : {n!r} est au tableau sans être un député de considération dont l'initiale demande un choix")
    for n, (ini, forme) in elisions.items():
        if sources.ACCORD_FORME[ini] != forme:
            e.append(f"partie 2.11 : {n!r} : Forme {forme!r} et Initiale {ini!r} ne s'accordent pas")
    return e


# ------------------------------------------------------------------ étapes 6 et 7

def etape6(d):
    e = []
    tg = Tirage(d["graine"])
    for i, cle in enumerate(CLES_VECTEURS):
        att = {"chaine": tg.chaine(cle), "cle": cle, "hex8": tg.hex8(cle), "n": tg.n(cle)}
        if d["vecteurs_test"][i] != att:
            e.append(f"/vecteurs_test/{i} : {d['vecteurs_test'][i]!r} ≠ recalcul {att!r}")
    return e


def chaines_affichees(d):
    out = [("/cercle/nom", d["cercle"]["nom"]), ("/cercle/invitant", d["cercle"]["invitant"])]
    for p in PERSONNAGES:
        for k in ("metier", "ville", "ligne_de_vie"):
            out.append((f"/personnages/{p}/{k}", d["personnages"][p][k]))
    for tid in JOUES:
        t = d["textes"][tid]
        out.append((f"/textes/{tid}/titre", t["titre"]))
        for i, l in enumerate(t["lignes"]):
            out.append((f"/textes/{tid}/lignes/{i}", l))
        a = t["auteur"]
        if a["type"] in ("depute", "senateur"):
            out.append((f"/textes/{tid}/auteur/nom", a["nom"]))
            if a["groupe"] is not None:
                out.append((f"/textes/{tid}/auteur/groupe", a["groupe"]))
        if a["type"] == "commission":
            out.append((f"/textes/{tid}/auteur/libelle", a["libelle"]))
        for i, c in enumerate(t["considerations"]):
            out.append((f"/textes/{tid}/considerations/{i}/depute/nom", c["depute"]["nom"]))
            if c["depute"]["groupe"] is not None:
                out.append((f"/textes/{tid}/considerations/{i}/depute/groupe", c["depute"]["groupe"]))
            out.append((f"/textes/{tid}/considerations/{i}/texte", c["texte"]))
    f = d["histoire"]["textes"]["H86"]["fiche"]
    if f is not None:
        out.append(("/histoire/textes/H86/fiche/titre", f["titre"]))
    return out


RE_RUN_CHIFFRES = re.compile(r"[0-9]+(?: [0-9]+)+")
RE_TRANCHES = re.compile(r"[0-9]{1,3}(?: [0-9]{3})+")


def typo_simple(s):
    e = []
    if "’" in s:
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


# ------------------------------------------------------------------ étape 8

def rangs_attendus(d, roles, cases, tirage):
    """Fichier caché 2, point 14 (Q-F1 tranché, commit 3d8aabf) : {scrutin: clé du texte}.
    Les cases d'une tension, numérotées i = 1, 2, … dans l'ordre de la liste, sont triées
    par t("ordre-texte|{tension}|{i}") ; la première va à la première case de la tension
    (T1 à T13, ordre du calendrier, tensions lues dans le fichier), et ainsi de suite."""
    out = {n: t for t, n in roles.items()}
    detail = []
    for T, liste in cases.items():
        libres = [str(k) for k in range(1, 14) if d["textes"][str(k)]["tension"] == T]
        tri = sorted(range(1, len(liste) + 1), key=lambda i: tirage.cle_tri(f"ordre-texte|{T}|{i}"))
        if len(tri) != len(libres):
            detail.append(f"tension {T} : {len(liste)} cases pour {len(libres)} rangs libres ({', '.join('T' + x for x in libres)})")
            continue
        for i, k in zip(tri, libres):
            out[liste[i - 1]] = k
    return out, detail


def ordre_raisons(tid, tirage):
    tri = sorted(range(1, 5), key=lambda i: tirage.cle_tri(f"ordre-raisons|{tid}|{i}"))
    return {i: r + 1 for r, i in enumerate(tri)}


def etape8(d, fiches, votes, scrutins_b, cases=None):
    """Fidélité aux fiches (schéma 2, partie 5.1, étape 8). scrutins_b : numéros de
    scrutin des textes en présentation B (paramètre de l'orchestrateur) ou None."""
    e, info = [], []
    tg = Tirage(d["graine"])
    detail_ordre = {}
    for tid in JOUES:
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
            e.append(f"{ch}/lien_scrutin : {t['lien_scrutin']!r} ≠ adresse tirée de l'en-tête de la fiche {lien!r}")
        vo = votes[tid]
        if (vo["leg"], vo["scrutin"]) != (f["_leg"], f["_scrutin"]):
            e.append(f"{ch} : votes.md donne le scrutin {vo['leg']}e, {vo['scrutin']} ; la fiche {f['_leg']}e, {f['_scrutin']}")
        if t["vote"] != vo["vote"]:
            e.append(f"{ch}/vote : {canon.canonique(t['vote'])} ≠ votes.md {canon.canonique(vo['vote'])}")
        if t["vote"]["objet"] != f["objet"]:
            e.append(f"{ch}/vote/objet : {t['vote']['objet']!r} ≠ ligne « Objet du vote » de la fiche {f['objet']!r}")
        if t["auteur"] != f["auteur"]:
            e.append(f"{ch}/auteur : {canon.canonique(t['auteur'])} ≠ fiche {canon.canonique(f['auteur'])}")
        rangs = ordre_raisons(tid, tg)
        detail_ordre[tid] = [(i, rangs[i]) for i in range(1, 5)]
        for r in f["raisons"]:
            rang = rangs[r["i"]]
            c = t["considerations"][rang - 1]
            ci = f"{ch}/considerations/{rang - 1}"
            att = {"cote": r["cote"], "pole": r["pole"], "texte": r["texte"]}
            obt = {"cote": c["cote"], "pole": c["pole"], "texte": c["texte"]}
            if att != obt:
                e.append(f"{ci} : {obt!r} ≠ raison {r['i']} de la fiche {att!r}")
            att = {"feminin": r["feminin"], "groupe": r["groupe"], "nom": r["nom"]}
            obt = {k: c["depute"][k] for k in ("feminin", "groupe", "nom")}
            if att != obt:
                e.append(f"{ci}/depute : {obt!r} ≠ raison {r['i']} de la fiche {att!r}")
        # Lignes : 90 points de code au plus, en NFC, sur le fichier et sur les fiches
        for src, ls in (("fichier", t["lignes"]), ("fiche", f["lignes"])):
            for i, l in enumerate(ls):
                if unicodedata.normalize("NFC", l) != l:
                    e.append(f"{ch}/lignes/{i} ({src}) : pas en NFC")
                if len(l) > MAX_LIGNE:
                    e.append(f"{ch}/lignes/{i} ({src}) : {len(l)} points de code (au plus {MAX_LIGNE})")
    # Rangs des cases (fichier caché, point 14)
    if cases is not None:
        attendu, det = rangs_attendus(d, cases[0], cases[1], tg)
        e.extend(f"rangs des cases : {x}" for x in det)
        for t, f in fiches.items():
            if t == "H86":
                continue
            a = attendu.get(f["_scrutin"])
            if a != t:
                e.append(f"en-tête {f['_rang']} · scrutin {f['_scrutin']} : le tirage du point 14 donne "
                         + (f"{nom_texte(a)}" if a is not None else "un scrutin hors des rôles et des cases"))
        info.append("rangs des cases (point 14) : " + ", ".join(
            f"{n}→{nom_texte(t)}" for n, t in sorted(attendu.items(), key=lambda x: rang_cle(x[1]))))
    else:
        info.append("rangs des cases : fichier caché non lu, non vérifiés")
    # Présentation B
    if scrutins_b is None:
        info.append("présentation B : liste non fournie, ligne 3 fixe non vérifiée (étape incomplète)")
    else:
        par_scrutin = {f["_scrutin"]: t for t, f in fiches.items() if t in JOUES}
        for n in scrutins_b:
            tid = par_scrutin.get(n)
            if tid is None:
                e.append(f"présentation B : scrutin {n} absent des fiches des textes joués")
                continue
            for src, ls in (("fichier", d["textes"][tid]["lignes"]), ("fiche", fiches[tid]["lignes"])):
                if ls[2] != PHRASE_B:
                    e.append(f"/textes/{tid}/lignes/2 ({src}, présentation B, scrutin {n}) : {ls[2]!r} ≠ phrase fixe {PHRASE_B!r}")
        info.append("présentation B : " + ", ".join(f"scrutin {n} = {nom_texte(par_scrutin[n])}"
                                                   for n in scrutins_b if n in par_scrutin))
    # H86 : Titre, Tension, et sa ligne de votes.md
    fh = fiches["H86"]
    h = d["histoire"]["textes"]["H86"]
    if h["fiche"] is None:
        e.append("/histoire/textes/H86/fiche : null")
    else:
        if h["fiche"]["titre"] != fh["titre"]:
            e.append(f"/histoire/textes/H86/fiche/titre : {h['fiche']['titre']!r} ≠ fiche {fh['titre']!r}")
        if h["fiche"]["vote"] != votes["H86"]["vote"]:
            e.append(f"/histoire/textes/H86/fiche/vote : {canon.canonique(h['fiche']['vote'])} ≠ votes.md "
                     f"{canon.canonique(votes['H86']['vote'])}")
    if (h["tension"], h["sens"]) != fh["tension"]:
        e.append(f"/histoire/textes/H86 : tension et sens ({h['tension']}, {h['sens']}) ≠ fiche {fh['tension']}")
    if (votes["H86"]["leg"], votes["H86"]["scrutin"]) != (fh["_leg"], fh["_scrutin"]):
        e.append("H86 : votes.md et la fiche ne donnent pas le même scrutin")
    return e, info, detail_ordre


# ------------------------------------------------------------------ rapport

class Rapport:
    def __init__(self):
        self.l = []

    def __call__(self, s=""):
        self.l.append(s)

    def texte(self):
        return "\n".join(self.l) + "\n"


def controle1(octets, srcs, date_scellement, empreinte_publiee=None, page=None, empreintes_scellement=None,
              chemin_fichier="", commit=None, commit_spec=None, scrutins_b=None, amo_dossiers=(),
              tables_source="schema"):
    """srcs : {clé : (chemin affiché, texte, octets)} pour S, P, T, L, votes, schema,
    simulation (§1 des personnages), simulation2 et, si `tables_source` le dit, la
    source des tableaux 2.10, 2.10 bis, 2.11. Rend (texte du rapport, verdict)."""
    R = Rapport()
    verdict = {"controle1": None, "sources": None, "graine": None, "candidat": None}
    R("Programme de contrôle (C), second essai — contrôle 1 du fichier scellé (schéma 2, partie 5.1)")
    R("=" * 78)
    R(f"Fichier contrôlé : {chemin_fichier}")
    R(f"SHA-256 du fichier : {sha256_hex(octets)}  ({len(octets)} octets)")
    R(f"Jour du scellement (paramètre) : {date_scellement}")
    if commit:
        R(f"Commit du dépôt au moment du contrôle : {commit}")
    R("")
    R("Sources lues (SHA-256) :")
    for cle in srcs:
        chemin, _, o = srcs[cle]
        R(f"  {sha256_hex(o)}  {chemin}")
    if empreintes_scellement is not None:
        diff = []
        for cle in srcs:
            chemin, _, o = srcs[cle]
            nom = chemin.split("/")[-1]
            autre = empreintes_scellement.get(nom) or empreintes_scellement.get(chemin)
            if autre is None:
                if cle in ("S", "P", "T", "L", "votes"):
                    diff.append(f"  {nom} : absent du relevé de l'agent qui scelle")
                else:
                    R(f"  ({nom} : absent du relevé de l'agent qui scelle, non comparé)")
            elif autre != sha256_hex(o):
                diff.append(f"  {nom} : agent qui scelle {autre} ≠ C {sha256_hex(o)}")
        verdict["sources"] = not diff
        R("Mêmes sources que l'agent qui scelle : " + ("oui" if not diff else "NON (échec)"))
        for x in diff:
            R(x)
    else:
        diff = []
        R("Mêmes sources que l'agent qui scelle : non comparé (relevé non fourni)")
    R("")

    def stop(n, msgs):
        R(f"  Étape {n} : ÉCHEC")
        for m in msgs:
            R(f"    - {m}")
        R("")
        R("Le contrôle 1 s'arrête au premier échec.")
        R("Verdict : DÉFAUT(S) TROUVÉ(S)")
        verdict["controle1"] = False
        return R.texte(), verdict

    R("Contrôle 1 (fichier scellé)")
    R("-" * 78)
    etats = []
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
    e, candidat = verifier_schema(d, date_scellement)
    if e:
        return stop(4, e)
    verdict["candidat"] = candidat
    R("  Étape 4 (schéma) : passée" + (" — CANDIDAT (statut « provisoire »)" if candidat else " — statut « final »")
      + f" ; schéma fermé, version 5, types, adresses, dates (toutes ≤ {date_scellement})")
    try:
        fiches_sim = sources.lire_fiches_personnages(srcs["simulation"][1])
        tsrc = srcs[tables_source]
        tables = {"groupes": sources.lire_groupes(tsrc[1], tsrc[0]),
                  "commissions": sources.lire_commissions(tsrc[1], tsrc[0]),
                  "elisions": sources.lire_elisions(tsrc[1], tsrc[0])}
    except sources.ErreurSource as x:
        return stop(5, [f"lecture d'une source : {x}"])
    e, notes, info = etape5(d, fiches_sim, tables, list(amo_dossiers))
    if e:
        for x in info:
            R(f"    · {x}")
        return stop(5, e)
    R("  Étape 5 (cohérence interne) : passée — tables exigées (calendrier, semaines, cercle), histoire "
      "(point 2 bis), votes et suites, D-028, A.4, E8, D-034, groupes deux à deux différents, réponses, "
      "absences, réponses atypiques, §1, vecteurs, ordre des tensions, groupes (2.10, "
      f"{len(tables['groupes'])} lignes), commissions (2.10 bis, {len(tables['commissions'])}), "
      f"élisions (2.11, {len(tables['elisions'])})")
    for x in info:
        R(f"    · {x}")
    R("    · genres des raisons (D-034, recalculés) : " + " | ".join(notes))
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
        votes, ignorees = sources.lire_votes(srcs["votes"][1], srcs["votes"][0])
    except sources.ErreurSource as x:
        return stop(8, [f"lecture des fiches : {x}"])
    try:
        cases = sources.lire_cases(srcs["regles"][1]) if "regles" in srcs else None
    except sources.ErreurSource as x:
        return stop(8, [f"lecture des cases : {x}"])
    e, info8, detail_ordre = etape8(d, fiches, votes, scrutins_b, cases)
    if e:
        return stop(8, e)
    if verdict["sources"] is False:
        return stop(8, ["comparaison aux fiches : passée", "Mêmes sources : NON"] + [x.strip() for x in diff])
    R("  Étape 8 (fidélité aux fiches) : passée — 18 fiches, H86 et votes.md relus ; en-têtes stricts ; "
      "titre, lignes (90 au plus), objet (fiche et votes.md), vote, suite, auteur, lien, sources, tension, "
      "sens et raisons identiques, raisons dans l'ordre tiré")
    for x in info8:
        R(f"    · {x}")
    if ignorees:
        R("    · lignes de votes.md ignorées (rang hors des 18 textes et de H86) : "
          + ", ".join(f"ligne {n} « {r} »" for n, r in ignorees))
    R("    · ordre d'affichage tiré (clé « ordre-raisons|texte|i ») : numéro de fiche → rang")
    for tid in JOUES:
        R(f"      {nom_texte(tid):>3} : " + ", ".join(f"{i}→{r}" for i, r in detail_ordre[tid]))
    manque = [f"étape {n} non faite (son entrée manque)" for n, ok in zip((1, 2), etats) if not ok]
    if verdict["sources"] is not True:
        manque.append("Mêmes sources non comparé (étape 8)")
    if scrutins_b is None:
        manque.append("présentation B non vérifiée (liste non fournie)")
    if candidat:
        manque.append("fichier candidat (« provisoire ») : l'étape 4 exige « final » sur le fichier publié")
    complet = not manque
    verdict["controle1"] = True if complet else "partiel"
    R("  Contrôle 1 : " + ("complet, huit étapes passées" if complet else "partiel : " + " ; ".join(manque)))
    if commit_spec:
        g = graine_essai2(commit_spec)
        verdict["graine"] = g == d["graine"]
        R(f"  Hors étapes (ajout de C) : graine recalculée (§0) sur E = {commit_spec} : {g} ; "
          + ("identique à celle du fichier" if verdict["graine"] else f"DIFFÉRENTE de celle du fichier ({d['graine']})"))
    else:
        R("  Hors étapes (ajout de C) : graine non recalculée (empreinte E du commit de la spécification non fournie)")
    R("")
    R("Hors de portée d'un programme : la vérité des champs de `vote` (objet, issue, date, étape, suite), "
      "l'exactitude du mandat et du groupe et leur moment, la justesse de chaque Forme d'élision et des "
      "formes courtes de commission.")
    R("")
    ok_tout = verdict["controle1"] in (True, "partiel") and verdict["graine"] is not False \
        and verdict["sources"] is not False
    R("Verdict : " + ("aucun défaut trouvé" if ok_tout else "DÉFAUT(S) TROUVÉ(S)")
      + ("" if verdict["controle1"] is True else " (contrôle 1 partiel)"))
    return R.texte(), verdict
