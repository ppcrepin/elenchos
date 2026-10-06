"""Lecture des sources que C compare au fichier scellé (schéma, partie 2.7,
partie 2.8, partie 4.1 étape 8 et « Lecture des autres sources »).

Le programme ne devine jamais une forme : toute ligne lue qui ne suit pas la
sienne lève ErreurSource, avec le fichier et le numéro de ligne.
"""

import re
import unicodedata
from fractions import Fraction

from .jeu import PERSONNAGES, TEXTES, TENSIONS, POLES_COURTS


class ErreurSource(Exception):
    pass


def _nfc(cellule, ou):
    if unicodedata.normalize("NFC", cellule) != cellule:
        raise ErreurSource(f"{ou} : cellule pas en NFC : {cellule!r}")
    return cellule


def lignes_de(texte):
    # Les fichiers du dépôt sont en U+000A ; on refuse U+000D pour ne rien deviner.
    if "\r" in texte:
        raise ErreurSource("retour chariot U+000D dans une source")
    return texte.split("\n")


def section(lignes, prefixe_titre, niveau="## "):
    """Lignes d'une section : du titre (qui commence par niveau + prefixe_titre)
    au titre suivant de même niveau ou de niveau supérieur. Exactement une."""
    debuts = [i for i, l in enumerate(lignes) if l.startswith(niveau + prefixe_titre)]
    if len(debuts) != 1:
        raise ErreurSource(
            f"section « {niveau}{prefixe_titre} » trouvée {len(debuts)} fois (attendu : 1)"
        )
    d = debuts[0]
    hashes = niveau.strip()
    f = len(lignes)
    for j in range(d + 1, len(lignes)):
        l = lignes[j]
        m = re.match(r"^(#+) ", l)
        if m and len(m.group(1)) <= len(hashes):
            f = j
            break
    return d + 1, lignes[d + 1 : f]


def tableaux(lignes, debut=1):
    """Blocs contigus de lignes qui commencent par « | » : [(numéro de ligne, [lignes])]."""
    blocs = []
    courant = None
    for i, l in enumerate(lignes):
        if l.startswith("|"):
            if courant is None:
                courant = (debut + i, [])
                blocs.append(courant)
            courant[1].append(l)
        else:
            courant = None
    return blocs


_SEPARATEUR = re.compile(r"^\|(?: *:?-+:? *\|)+$")


def cellules(ligne, ou, n_attendu):
    morceaux = ligne.split("|")
    if len(morceaux) < 2 or morceaux[0] != "" or morceaux[-1] != "":
        raise ErreurSource(f"{ou} : la ligne ne commence ou ne finit pas par « | »")
    cs = [c.strip(" ") for c in morceaux[1:-1]]
    if len(cs) != n_attendu:
        raise ErreurSource(f"{ou} : {len(cs)} cellules (attendu : {n_attendu})")
    return [_nfc(c, ou) for c in cs]


def lire_tableau(bloc, entete, ou, toutes_remplies=True):
    """bloc = (numéro de ligne, lignes). En-tête exact, séparateur, lignes."""
    num, ls = bloc
    if ls[0] != entete:
        raise ErreurSource(f"{ou}, ligne {num} : en-tête inattendu : {ls[0]!r} (attendu : {entete!r})")
    n = len(cellules(entete, ou, entete.count("|") - 1))
    if len(ls) < 2 or not _SEPARATEUR.match(ls[1]) or ls[1].count("|") - 1 != n:
        raise ErreurSource(f"{ou}, ligne {num + 1} : ligne de séparation absente ou fautive")
    rangees = []
    for k, l in enumerate(ls[2:]):
        cs = cellules(l, f"{ou}, ligne {num + 2 + k}", n)
        if toutes_remplies and any(c == "" for c in cs):
            raise ErreurSource(f"{ou}, ligne {num + 2 + k} : cellule vide")
        rangees.append((num + 2 + k, cs))
    return rangees


def seul_tableau(lignes, debut, entete, ou):
    blocs = tableaux(lignes, debut)
    if len(blocs) != 1:
        raise ErreurSource(f"{ou} : {len(blocs)} tableaux (attendu : un seul)")
    return lire_tableau(blocs[0], entete, ou)


def tableau_par_entete(lignes, debut, entete, ou, rang=None):
    blocs = [b for b in tableaux(lignes, debut) if b[1][0] == entete]
    if rang is None:
        if len(blocs) != 1:
            raise ErreurSource(f"{ou} : tableau d'en-tête {entete!r} trouvé {len(blocs)} fois")
        return lire_tableau(blocs[0], entete, ou)
    if len(blocs) <= rang:
        raise ErreurSource(f"{ou} : tableau n° {rang + 1} d'en-tête {entete!r} absent")
    return lire_tableau(blocs[rang], entete, ou)


# ---------------------------------------------------------------- partie 2.7

LETTRE = "A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ"
RE_SIGLE = re.compile(
    rf"[{LETTRE}0-9]+(?:-[{LETTRE}0-9]+|(?<=[{LETTRE}]) [{LETTRE}][{LETTRE}0-9]*)*"
)
RE_IDENTIFIANT = re.compile(r"PO[0-9]+(?:, PO[0-9]+)*")
CODES_INTERNES = ("UDDPLR", "DEM", "ECOS", "ECOLO", "SOC-A", "UMPPO")
ENTETE_GROUPES = "| `groupe` | Chambre | Législature | Nom complet | Identifiant | Source du sigle |"


def lire_groupes(texte_schema):
    """Tableau de la partie 2.7. Rend [(groupe, chambre, legislature, [identifiants])]
    et vérifie les règles de la partie 2.7 (sauf l'emploi dans le fichier)."""
    lignes = lignes_de(texte_schema)
    debut, sec = section(lignes, "2.7 ", "### ")
    ou = "schema.md, partie 2.7"
    rangees = seul_tableau(sec, debut + 1, ENTETE_GROUPES, ou)
    sortie = []
    vus = set()
    ids_vus = {}
    for num, (g, chambre, leg, nom, ident, source) in rangees:
        o = f"{ou}, ligne {num}"
        if not (len(g) >= 2 and g.startswith("`") and g.endswith("`")):
            raise ErreurSource(f"{o} : la cellule `groupe` doit commencer et finir par un accent grave")
        g = g[1:-1]
        if not RE_SIGLE.fullmatch(g) or len(g) > 20:
            raise ErreurSource(f"{o} : sigle mal écrit : {g!r}")
        if g in CODES_INTERNES:
            raise ErreurSource(f"{o} : code interne employé comme sigle : {g!r}")
        if chambre not in ("Assemblée", "Sénat"):
            raise ErreurSource(f"{o} : chambre inattendue : {chambre!r}")
        if chambre == "Assemblée" and leg not in ("15", "16", "17"):
            raise ErreurSource(f"{o} : législature inattendue pour l'Assemblée : {leg!r}")
        if chambre == "Sénat" and leg != "—":
            raise ErreurSource(f"{o} : législature du Sénat différente de « — » : {leg!r}")
        if not RE_IDENTIFIANT.fullmatch(ident):
            raise ErreurSource(f"{o} : identifiant mal écrit : {ident!r}")
        ids = ident.split(", ")
        for i in ids:
            if i in ids_vus:
                raise ErreurSource(f"{o} : identifiant {i} déjà à la ligne {ids_vus[i]}")
            ids_vus[i] = num
        if (g, chambre, leg) in vus:
            raise ErreurSource(f"{o} : deux lignes pour ({g}, {chambre}, {leg})")
        vus.add((g, chambre, leg))
        sortie.append((g, chambre, leg, ids))
    return sortie


# ---------------------------------------------------------------- partie 2.8

INITIALES_PERMISES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") | set("ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
INITIALES_CHOIX = set("AEIOUYH") | set("ÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
ENTETE_ELISION = "| `nom` | Initiale | Forme |"
ACCORD_FORME = {"voyelle": "d'", "h muet": "d'", "h aspiré": "de", "son y": "de"}


def lire_elisions(texte_schema):
    """Tableau de la partie 2.8 : {nom: (initiale, forme)}."""
    lignes = lignes_de(texte_schema)
    debut, sec = section(lignes, "2.8 ", "### ")
    ou = "schema.md, partie 2.8"
    rangees = seul_tableau(sec, debut + 1, ENTETE_ELISION, ou)
    sortie = {}
    for num, (nom, initiale, forme) in rangees:
        o = f"{ou}, ligne {num}"
        for nom_cellule, v in (("nom", nom), ("Forme", forme)):
            if not (len(v) >= 2 and v.startswith("`") and v.endswith("`")):
                raise ErreurSource(f"{o} : la cellule {nom_cellule} doit être entre accents graves")
        nom, forme = nom[1:-1], forme[1:-1]
        if initiale not in ACCORD_FORME:
            raise ErreurSource(f"{o} : Initiale inattendue : {initiale!r}")
        if forme not in ("d'", "de"):
            raise ErreurSource(f"{o} : Forme inattendue : {forme!r}")
        if nom in sortie:
            raise ErreurSource(f"{o} : nom en double : {nom!r}")
        sortie[nom] = (initiale, forme)
    return sortie


# ---------------------------------------------------------------- étape 8 : fiches

RE_FICHE = re.compile(r"^### (E[1-3]|[1-9]|1[0-4]) · scrutin ([1-9][0-9]*) \((15|16|17)e législature\)$")
RE_TITRE = re.compile(r"^- Titre : (.+)$")
RE_LIGNE = re.compile(r"^  ([1-3])\. (.+)$")
RE_AUTEUR_GVT = re.compile(r"^- Auteur : Gouvernement(?: \(projet de loi\)\.| ;)(.*)$")
RE_AUTEUR_ELU = re.compile(
    r"^- Auteur : ([^,]+), (député|députée|sénateur|sénatrice), (.+?)(?: au dépôt \(| ; |\. )(.*)$"
)
RE_LIEN = re.compile(r"^- Lien du scrutin : (\S+)$")
RE_SOURCE = re.compile(r"^  - (\S+)$")
RE_TENSION = re.compile(r"^- Tension : ([SPTL]) ; sens s = ([01])$")
RE_RAISON = re.compile(
    r"^  ([1-4])\. « (.+?) » — (pour|contre) · pôle (0|1|aucun) — ([^,\[]+), (député|députée), "
    r"(.+?) \[vote : [^\]]*\] — extrait : (.*)$"
)


def _champ_unique(fiche, cle, valeur, ou):
    if cle in fiche:
        raise ErreurSource(f"{ou} : champ « {cle} » répété")
    fiche[cle] = valeur


def lire_fiches(fichiers):
    """fichiers : [(nom, texte)]. Rend {texte: fiche}."""
    fiches = {}
    for nom_fichier, texte in fichiers:
        lignes = lignes_de(texte)
        i = 0
        courant = None
        while i < len(lignes):
            l = lignes[i]
            ou = f"{nom_fichier}, ligne {i + 1}"
            if l.startswith("### "):
                m = RE_FICHE.match(l)
                if m:
                    t = m.group(1)
                    if t in fiches:
                        raise ErreurSource(f"{ou} : fiche du texte {t} en double")
                    courant = {"_texte": t, "_scrutin": int(m.group(2)), "_leg": int(m.group(3)),
                               "_ou": ou}
                    fiches[t] = courant
                else:
                    courant = None
                i += 1
                continue
            if courant is None:
                i += 1
                continue
            if l.startswith("- Titre :"):
                m = RE_TITRE.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Titre » mal formée")
                _champ_unique(courant, "titre", m.group(1), ou)
            elif l.startswith("- Lignes :"):
                if l != "- Lignes :":
                    raise ErreurSource(f"{ou} : ligne « Lignes » mal formée")
                ls = []
                for k in range(3):
                    j = i + 1 + k
                    m = RE_LIGNE.match(lignes[j]) if j < len(lignes) else None
                    if not m or int(m.group(1)) != k + 1:
                        raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : ligne {k + 1} des « Lignes » attendue")
                    ls.append(m.group(2))
                j = i + 4
                if j < len(lignes) and re.match(r"^  [0-9]+\. ", lignes[j]):
                    raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : plus de trois « Lignes »")
                _champ_unique(courant, "lignes", ls, ou)
                i += 3
            elif l.startswith("- Auteur :"):
                m = RE_AUTEUR_GVT.match(l)
                if m:
                    aut = {"type": "gouvernement"}
                else:
                    m = RE_AUTEUR_ELU.match(l)
                    if not m:
                        raise ErreurSource(f"{ou} : ligne « Auteur » mal formée")
                    mandat = m.group(2)
                    aut = {
                        "type": "depute" if mandat.startswith("dépu") else "senateur",
                        "nom": m.group(1),
                        "feminin": mandat in ("députée", "sénatrice"),
                        "groupe": m.group(3),
                    }
                _champ_unique(courant, "auteur", aut, ou)
            elif l.startswith("- Lien du scrutin :"):
                m = RE_LIEN.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Lien du scrutin » mal formée")
                _champ_unique(courant, "lien", m.group(1), ou)
            elif l.startswith("- Sources :"):
                if l != "- Sources :":
                    raise ErreurSource(f"{ou} : ligne « Sources » mal formée")
                srcs = []
                j = i + 1
                while j < len(lignes) and lignes[j].startswith("  - "):
                    m = RE_SOURCE.match(lignes[j])
                    if not m:
                        raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : source mal formée")
                    srcs.append(m.group(1))
                    j += 1
                _champ_unique(courant, "sources", srcs, ou)
                i = j - 1
            elif l.startswith("- Tension :"):
                m = RE_TENSION.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Tension » mal formée")
                _champ_unique(courant, "tension", (m.group(1), int(m.group(2))), ou)
            elif l.startswith("- Raisons :"):
                if l != "- Raisons :":
                    raise ErreurSource(f"{ou} : ligne « Raisons » mal formée")
                rs = []
                for k in range(4):
                    j = i + 1 + k
                    m = RE_RAISON.match(lignes[j]) if j < len(lignes) else None
                    if not m or int(m.group(1)) != k + 1:
                        raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : raison {k + 1} mal formée ou absente")
                    rs.append({
                        "i": k + 1,
                        "texte": m.group(2),
                        "cote": m.group(3),
                        "pole": "aucun" if m.group(4) == "aucun" else int(m.group(4)),
                        "nom": m.group(5),
                        "feminin": m.group(6) == "députée",
                        "groupe": m.group(7),
                    })
                j = i + 5
                if j < len(lignes) and re.match(r"^  [0-9]+\. ", lignes[j]):
                    raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : plus de quatre raisons")
                _champ_unique(courant, "raisons", rs, ou)
                i += 4
            i += 1
    manquent = [t for t in TEXTES if t not in fiches]
    if manquent:
        raise ErreurSource(f"fiches absentes : {', '.join(manquent)}")
    for t, f in fiches.items():
        for cle in ("titre", "lignes", "auteur", "lien", "sources", "tension", "raisons"):
            if cle not in f:
                raise ErreurSource(f"{f['_ou']} : fiche du texte {t} sans champ « {cle} »")
        for (k, v) in (("titre", f["titre"]),) + tuple(("ligne", x) for x in f["lignes"]):
            _nfc(v, f"{f['_ou']} ({k})")
    return fiches


ENTETE_VOTES = "| Rang | Scrutin | `issue` | `date` | `etape` | Preuve principale |"
RE_SCRUTIN = re.compile(r"^(15|16|17)e, ([1-9][0-9]*)$")
RE_DATE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")


def date_valide(s):
    import datetime
    if not isinstance(s, str) or not RE_DATE.fullmatch(s):
        return False
    try:
        datetime.date.fromisoformat(s)
    except ValueError:
        return False
    return True


def lire_votes(texte_votes):
    lignes = lignes_de(texte_votes)
    ou = "textes/votes.md"
    rangees = seul_tableau(lignes, 1, ENTETE_VOTES, ou)
    votes = {}
    for num, (rang, scrutin, issue, date, etape, preuve) in rangees:
        if rang not in TEXTES:
            continue
        o = f"{ou}, ligne {num}"
        if rang in votes:
            raise ErreurSource(f"{o} : deux lignes pour le texte {rang}")
        m = RE_SCRUTIN.match(scrutin)
        if not m:
            raise ErreurSource(f"{o} : cellule Scrutin mal écrite : {scrutin!r}")
        if issue not in ("adopte", "rejete", "sans_vote_ensemble"):
            raise ErreurSource(f"{o} : issue inattendue : {issue!r}")
        if etape not in ("navette", "definitif", "aucune"):
            raise ErreurSource(f"{o} : étape inattendue : {etape!r}")
        if not date_valide(date):
            raise ErreurSource(f"{o} : date invalide : {date!r}")
        votes[rang] = {"leg": int(m.group(1)), "scrutin": int(m.group(2)),
                       "vote": {"date": date, "etape": etape, "issue": issue}}
    manquent = [t for t in TEXTES if t not in votes]
    if manquent:
        raise ErreurSource(f"{ou} : textes sans ligne : {', '.join(manquent)}")
    return votes


# ---------------------------------------------------------------- §1 de la simulation

ENTETE_FICHES = "| Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu |"
RE_HEURE_FICHE = re.compile(r"^([0-9]|1[0-9]|2[0-3])h([0-5][0-9])$")


def lire_fiches_personnages(texte_simulation):
    lignes = lignes_de(texte_simulation)
    debut, sec = section(lignes, "1. ", "## ")
    ou = "simulation.md, §1"
    rangees = tableau_par_entete(sec, debut + 1, ENTETE_FICHES, ou)
    if [r[1][0] for r in rangees] != list(PERSONNAGES):
        raise ErreurSource(f"{ou} : lignes attendues dans l'ordre Agathe, Nassim, Odile, Valentin")
    sortie = {}
    for num, (prenom, age, metier, ville, vie, heure) in rangees:
        o = f"{ou}, ligne {num}"
        if not re.fullmatch(r"[1-9][0-9]*", age):
            raise ErreurSource(f"{o} : âge mal écrit : {age!r}")
        m = RE_HEURE_FICHE.match(heure)
        if not m:
            raise ErreurSource(f"{o} : heure de jeu mal écrite : {heure!r}")
        sortie[prenom] = {
            "age": int(age),
            "metier": metier,
            "ville": ville,
            "ligne_de_vie": vie,
            "heure_de_jeu": "%02d:%s" % (int(m.group(1)), m.group(2)),
        }
    return sortie


# ---------------------------------------------------------------- profils.md

ENTETE_TENSIONS = "| | S | P | T | L |"


def _rangees_personnages(rangees, ou):
    noms = [cs[0] for _, cs in rangees]
    if sorted(noms) != sorted(PERSONNAGES) or len(noms) != 4:
        raise ErreurSource(f"{ou} : il faut une ligne par personnage, exactement")
    return {cs[0]: (num, cs[1:]) for num, cs in rangees}


def _pole_court(t, mot, o):
    a, b = POLES_COURTS[t]
    if mot == a:
        return 0
    if mot == b:
        return 1
    raise ErreurSource(f"{o} : pôle inattendu pour {t} : {mot!r}")


def lire_profils(texte_profils):
    lignes = lignes_de(texte_profils)
    res = {}
    # Profils cachés
    debut, sec = section(lignes, "Profils cachés", "## ")
    ou = "profils.md, « Profils cachés »"
    rs = _rangees_personnages(tableau_par_entete(sec, debut + 1, ENTETE_TENSIONS, ou), ou)
    profils = {}
    for p, (num, cs) in rs.items():
        profils[p] = {}
        for t, c in zip(TENSIONS, cs):
            m = re.fullmatch(r"([01]),([0-9]{2}) (faible|moyenne|forte)", c)
            if not m:
                raise ErreurSource(f"{ou}, ligne {num} : cellule mal écrite : {c!r}")
            pos = 100 * int(m.group(1)) + int(m.group(2))
            if pos > 100:
                raise ErreurSource(f"{ou}, ligne {num} : position au-delà de 100 : {c!r}")
            profils[p][t] = {"position": pos, "fermete": m.group(3)}
    res["profils"] = profils
    # Réponse type
    debut, sec = section(lignes, "Réponse type qui en découle", "## ")
    ou = "profils.md, « Réponse type qui en découle »"
    rs = _rangees_personnages(tableau_par_entete(sec, debut + 1, ENTETE_TENSIONS, ou, rang=0), ou)
    types = {}
    for p, (num, cs) in rs.items():
        types[p] = {}
        for t, c in zip(TENSIONS, cs):
            o = f"{ou}, ligne {num}"
            if c == "neutre":
                types[p][t] = ("neutre", None)
                continue
            m = re.fullmatch(r"(simple|très), vers (\S+)", c)
            if not m:
                raise ErreurSource(f"{o} : cellule mal écrite : {c!r}")
            types[p][t] = (m.group(1), _pole_court(t, m.group(2), o))
    res["types"] = types
    rs = _rangees_personnages(tableau_par_entete(sec, debut + 1, ENTETE_TENSIONS, ou, rang=1), ou)
    ds = {}
    for p, (num, cs) in rs.items():
        ds[p] = {}
        for t, c in zip(TENSIONS, cs):
            m = re.fullmatch(r"([+\u2212])([0-9]+),([0-9]+)", c)
            if not m:
                raise ErreurSource(f"{ou}, ligne {num} : cellule de d mal écrite : {c!r}")
            v = Fraction(int(m.group(2) + m.group(3)), 10 ** len(m.group(3)))
            ds[p][t] = v if m.group(1) == "+" else -v
    res["d"] = ds
    # Absences
    debut, sec = section(lignes, "Absences", "## ")
    ou = "profils.md, « Absences »"
    rs = _rangees_personnages(
        tableau_par_entete(sec, debut + 1, "| Personnage | Textes sans réponse |", ou), ou)
    absences = {}
    for p, (num, cs) in rs.items():
        c = cs[0]
        if c == "aucun":
            absences[p] = []
            continue
        morceaux = re.split(r", | et ", c)
        if not all(re.fullmatch(r"[1-9][0-9]*", x) for x in morceaux):
            raise ErreurSource(f"{ou}, ligne {num} : cellule mal écrite : {c!r}")
        absences[p] = morceaux
    res["absences"] = absences
    # Réponses atypiques
    debut, sec = section(lignes, "Réponses atypiques", "## ")
    ns = [re.match(r"^- Exactement ([0-9]+) par personnage", l) for l in sec]
    ns = [m for m in ns if m]
    if len(ns) != 1:
        raise ErreurSource("profils.md, « Réponses atypiques » : ligne « - Exactement {n} par personnage » absente ou répétée")
    res["nb_atypiques"] = int(ns[0].group(1))
    # Corrigé F1
    debut, sec = section(lignes, "Corrigé de la question F1", "## ")
    ou = "profils.md, « Corrigé de la question F1 »"
    rs = _rangees_personnages(tableau_par_entete(sec, debut + 1, ENTETE_TENSIONS, ou), ou)
    f1 = {}
    for p, (num, cs) in rs.items():
        f1[p] = {}
        for t, c in zip(TENSIONS, cs):
            f1[p][t] = "milieu" if c == "Au milieu" else _pole_court(t, c, f"{ou}, ligne {num}")
    res["f1"] = f1
    return res
