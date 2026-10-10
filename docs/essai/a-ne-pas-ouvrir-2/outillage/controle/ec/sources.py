"""Lecture des sources que C compare au fichier scellé, second essai (schéma 2,
parties 2.10, 2.10 bis, 2.11 et 5.1, étape 8 ; S1, partie 4.1, « Lecture des
autres sources », pour le §1 des personnages).

Le programme ne devine jamais une forme : toute ligne lue qui ne suit pas la
sienne lève ErreurSource, avec le fichier et le numéro de ligne.
"""

import re
import unicodedata
from fractions import Fraction

from .jeu import PERSONNAGES, JOUES, TENSIONS, POLES_COURTS


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


# ---------------------------------------------------------------- partie 2.10 : groupes

LETTRE = "A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ"
_LETTRES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
               "ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ")
_CHIFFRES = set("0123456789")
RE_IDENTIFIANT = re.compile(r"PO[0-9]+(?:, PO[0-9]+)*")
CODES_INTERNES_S1 = ("UDDPLR", "DEM", "ECOS", "ECOLO", "SOC-A", "UMPPO")
CODES_REPLI = CODES_INTERNES_S1 + ("LREMP", "RDPI", "UDR")
ENTETE_GROUPES = "| `groupe` | Chambre | Législature | Identifiant | Source |"
ENTETE_COMMISSIONS = "| `libelle` | Identifiant | Source |"
ENTETE_ELISION = "| `nom` | Initiale | Forme |"
MENTION_COURTE = "forme courte rédigée par Contenu, relue par UX"


def defauts_ecriture_groupe(g, permis_extra="&()", maxi=70):
    """Règles d'écriture du `groupe` (schéma 2, partie 2.10). Rend la liste des défauts."""
    e = []
    permis = _LETTRES | _CHIFFRES | set(" -,'") | set(permis_extra)
    hors = sorted({c for c in g if c not in permis})
    if hors:
        e.append("caractères non permis : " + ", ".join(f"U+{ord(c):04X}" for c in hors))
    if g != g.strip(" ") or "  " in g:
        e.append("espace au bord ou espace double")
    for i, c in enumerate(g):
        if c == ",":
            if i == 0 or g[i - 1] not in _LETTRES or g[i + 1:i + 2] != " ":
                e.append(f"virgule mal placée (position {i})")
        if c == "-":
            av, ap = g[i - 1:i] if i else "", g[i + 1:i + 2]
            entre_mots = av in (_LETTRES | _CHIFFRES) and ap in (_LETTRES | _CHIFFRES) and av and ap
            entre_espaces = av == " " and ap == " "
            if not (entre_mots or entre_espaces):
                e.append(f"trait d'union mal placé (position {i})")
    prof = 0
    for c in g:
        prof += (c == "(") - (c == ")")
        if prof < 0:
            break
    if prof != 0:
        e.append("parenthèses non équilibrées")
    if len(g) > maxi:
        e.append(f"{len(g)} points de code (au plus {maxi})")
    return e


def _accents_graves(v, o, nom):
    if not (len(v) >= 2 and v.startswith("`") and v.endswith("`")):
        raise ErreurSource(f"{o} : la cellule {nom} doit commencer et finir par un accent grave")
    return v[1:-1]


def lire_groupes(texte, nom_source="schema.md"):
    """Tableau de la partie 2.10. Rend [(groupe, chambre, législature, [identifiants], source)]
    et vérifie les règles d'écriture et d'ensemble qui ne dépendent pas du fichier."""
    lignes = lignes_de(texte)
    debut, sec = section(lignes, "2.10 Groupes", "### ")
    ou = f"{nom_source}, partie 2.10"
    rangees = seul_tableau(sec, debut + 1, ENTETE_GROUPES, ou)
    sortie, vus, ids_vus = [], set(), {}
    for num, (g, chambre, leg, ident, source) in rangees:
        o = f"{ou}, ligne {num}"
        g = _accents_graves(g, o, "`groupe`")
        d = defauts_ecriture_groupe(g)
        if d:
            raise ErreurSource(f"{o} : `groupe` {g!r} : " + " ; ".join(d))
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
        sortie.append((g, chambre, leg, ids, source))
    return sortie


def lire_commissions(texte, nom_source="schema.md"):
    """Tableau de la partie 2.10 bis. Rend [(libelle, [identifiants], source, courte)]."""
    lignes = lignes_de(texte)
    debut, sec = section(lignes, "2.10 bis", "### ")
    ou = f"{nom_source}, partie 2.10 bis"
    rangees = seul_tableau(sec, debut + 1, ENTETE_COMMISSIONS, ou)
    sortie, vus = [], set()
    for num, (lib, ident, source) in rangees:
        o = f"{ou}, ligne {num}"
        lib = _accents_graves(lib, o, "`libelle`")
        d = defauts_ecriture_groupe(lib, permis_extra="", maxi=80)
        if not lib.startswith("commission"):
            d.append("ne commence pas par « commission »")
        if d:
            raise ErreurSource(f"{o} : `libelle` {lib!r} : " + " ; ".join(d))
        if not RE_IDENTIFIANT.fullmatch(ident):
            raise ErreurSource(f"{o} : identifiant mal écrit : {ident!r}")
        if lib in vus:
            raise ErreurSource(f"{o} : libellé en double : {lib!r}")
        vus.add(lib)
        sortie.append((lib, ident.split(", "), source, MENTION_COURTE in source))
    return sortie


# ---------------------------------------------------------------- partie 2.11 : élision

INITIALES_PERMISES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") | set("ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
INITIALES_CHOIX = set("AEIOUYH") | set("ÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
ACCORD_FORME = {"voyelle": "d'", "h muet": "d'", "h aspiré": "de", "son y": "de"}


def lire_elisions(texte, nom_source="schema.md"):
    """Tableau de la partie 2.11 (règles de S1, partie 2.8) : {nom: (initiale, forme)}."""
    lignes = lignes_de(texte)
    debut, sec = section(lignes, "2.11 ", "### ")
    ou = f"{nom_source}, partie 2.11"
    rangees = seul_tableau(sec, debut + 1, ENTETE_ELISION, ou)
    sortie = {}
    for num, (nom, initiale, forme) in rangees:
        o = f"{ou}, ligne {num}"
        nom = _accents_graves(nom, o, "nom")
        forme = _accents_graves(forme, o, "Forme")
        if initiale not in ACCORD_FORME:
            raise ErreurSource(f"{o} : Initiale inattendue : {initiale!r}")
        if forme not in ("d'", "de"):
            raise ErreurSource(f"{o} : Forme inattendue : {forme!r}")
        if nom in sortie:
            raise ErreurSource(f"{o} : nom en double : {nom!r}")
        sortie[nom] = (initiale, forme)
    return sortie


# ---------------------------------------------------------------- partie 5.1, étape 8 : fiches

OBJETS = ("texte", "article", "amendement", "motion", "resolution")
RE_FICHE = re.compile(
    r"^### (T(?:[0-9]|1[0-4])|E[1-3]|H86) · scrutin ([1-9][0-9]*) \((15|16|17)e législature\)$")
RE_TITRE = re.compile(r"^- Titre : (.+)$")
RE_LIGNE = re.compile(r"^  ([1-3])\. (.+)$")
RE_OBJET = re.compile(r"^- Objet du vote : (texte|article|amendement|motion|resolution)$")
RE_AUTEUR_GVT = re.compile(r"^- Auteur : Gouvernement(?: \(projet de loi\)\.| ;)(.*)$")
RE_AUTEUR_COM = re.compile(r"^- Auteur : Commission : (.+?)(?: ;|\.)(.*)$")
RE_AUTEUR_ELU = re.compile(
    r"^- Auteur : ([^,]+), (député|députée|sénateur|sénatrice), (.+?)"
    r"(?: au dépôt \(| au dépôt ;| au dépôt\.| ; |\. |\.$)(.*)$")
RE_LIEN = re.compile(r"^- Lien du scrutin : (\S+)$")
RE_SOURCE = re.compile(r"^  - (\S+)$")
RE_TENSION = re.compile(r"^- Tension : ([SPTL]) ; sens s = ([01])$")
RE_RAISON = re.compile(
    r"^  ([1-4])\. « (.+?) » — (pour|contre) · pôle (0|1|aucun) — ([^,\[]+), (député|députée), "
    r"(.+?) \[vote : [^\]]*\] — extrait : (.*)$")
SANS_GROUPE = "sans groupe"


def cle_de_rang(rang):
    """« T3 » → « 3 » ; « E1 » et « H86 » inchangés."""
    return rang[1:] if rang.startswith("T") else rang


def _champ_unique(fiche, cle, valeur, ou):
    if cle in fiche:
        raise ErreurSource(f"{ou} : champ « {cle} » répété")
    fiche[cle] = valeur


def _groupe_lu(g):
    return None if g == SANS_GROUPE else g


def lire_fiches(fichiers):
    """fichiers : [(nom, texte)]. Rend {clé: fiche} pour les 18 textes joués et H86.
    En-têtes stricts : toute ligne `### ` qui contient ` · scrutin ` sans suivre la forme
    est refusée, sauf `### Réserve ` et `### (écartée)`."""
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
                    t = cle_de_rang(m.group(1))
                    if t in fiches:
                        raise ErreurSource(f"{ou} : fiche de {m.group(1)} en double")
                    courant = {"_rang": m.group(1), "_scrutin": int(m.group(2)), "_leg": int(m.group(3)),
                               "_ou": ou, "_legere": t == "H86"}
                    fiches[t] = courant
                elif " · scrutin " in l and not (l.startswith("### Réserve ") or l.startswith("### (écartée)")):
                    raise ErreurSource(f"{ou} : en-tête de fiche non reconnu (en-têtes stricts) : {l!r}")
                else:
                    courant = None
                i += 1
                continue
            if courant is None:
                i += 1
                continue
            legere = courant["_legere"]
            if l.startswith("- Titre :"):
                m = RE_TITRE.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Titre » mal formée")
                _champ_unique(courant, "titre", m.group(1), ou)
            elif l.startswith("- Tension :"):
                m = RE_TENSION.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Tension » mal formée : {l!r}")
                _champ_unique(courant, "tension", (m.group(1), int(m.group(2))), ou)
            elif legere:
                pass  # H86 : seules les lignes Titre et Tension sont lues
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
            elif l.startswith("- Objet du vote :"):
                m = RE_OBJET.match(l)
                if not m:
                    raise ErreurSource(f"{ou} : ligne « Objet du vote » mal formée : {l!r}")
                _champ_unique(courant, "objet", m.group(1), ou)
            elif l.startswith("- Auteur :"):
                m = RE_AUTEUR_GVT.match(l)
                if m:
                    aut = {"type": "gouvernement"}
                else:
                    m = RE_AUTEUR_COM.match(l)
                    if m:
                        aut = {"libelle": m.group(1), "type": "commission"}
                    else:
                        m = RE_AUTEUR_ELU.match(l)
                        if not m:
                            raise ErreurSource(f"{ou} : ligne « Auteur » mal formée : {l[:120]!r}")
                        mandat = m.group(2)
                        aut = {"feminin": mandat in ("députée", "sénatrice"),
                               "groupe": _groupe_lu(m.group(3)), "nom": m.group(1),
                               "type": "depute" if mandat.startswith("dépu") else "senateur"}
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
            elif l.startswith("- Raisons :"):
                if l != "- Raisons :":
                    raise ErreurSource(f"{ou} : ligne « Raisons » mal formée")
                rs = []
                for k in range(4):
                    j = i + 1 + k
                    m = RE_RAISON.match(lignes[j]) if j < len(lignes) else None
                    if not m or int(m.group(1)) != k + 1:
                        raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : raison {k + 1} mal formée ou absente : "
                                           f"{(lignes[j] if j < len(lignes) else '')[:110]!r}")
                    rs.append({"cote": m.group(3), "feminin": m.group(6) == "députée",
                               "groupe": _groupe_lu(m.group(7)), "i": k + 1, "nom": m.group(5),
                               "pole": "aucun" if m.group(4) == "aucun" else int(m.group(4)),
                               "texte": m.group(2)})
                j = i + 5
                if j < len(lignes) and re.match(r"^  [0-9]+\. ", lignes[j]):
                    raise ErreurSource(f"{nom_fichier}, ligne {j + 1} : plus de quatre raisons")
                _champ_unique(courant, "raisons", rs, ou)
                i += 4
            i += 1
    attendus = list(JOUES) + ["H86"]
    manquent = [t for t in attendus if t not in fiches]
    if manquent:
        raise ErreurSource("fiches absentes : " + ", ".join(("T" + t if t.isdigit() else t) for t in manquent))
    for t, f in fiches.items():
        cles = ("titre", "tension") if f["_legere"] else \
            ("titre", "lignes", "objet", "auteur", "lien", "sources", "tension", "raisons")
        for cle in cles:
            if cle not in f:
                raise ErreurSource(f"{f['_ou']} : fiche de {f['_rang']} sans champ « {cle} »")
        _nfc(f["titre"], f"{f['_ou']} (titre)")
        for x in f.get("lignes", []):
            _nfc(x, f"{f['_ou']} (ligne)")
    return fiches


ENTETE_VOTES = "| Rang | Scrutin | `objet` | `issue` | `date` | `etape` | `suite` | Preuve principale |"
RE_SCRUTIN = re.compile(r"^(15|16|17)e, ([1-9][0-9]*)$")
RE_DATE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")
RANGS_VOTES = tuple(["E1", "E2", "E3"] + [f"T{n}" for n in range(15)] + ["H86"])


def date_valide(s):
    import datetime
    if not isinstance(s, str) or not RE_DATE.fullmatch(s):
        return False
    try:
        datetime.date.fromisoformat(s)
    except ValueError:
        return False
    return True


def lire_votes(texte_votes, ou="textes/votes.md"):
    """Tableau de votes.md (schéma 2, partie 5.1, étape 8). Une ligne dont le Rang n'est
    pas l'un des 18 textes ni H86 est ignorée (règle de S1)."""
    lignes = lignes_de(texte_votes)
    rangees = seul_tableau(lignes, 1, ENTETE_VOTES, ou)
    votes, ignorees = {}, []
    for num, (rang, scrutin, objet, issue, date, etape, suite, preuve) in rangees:
        if rang not in RANGS_VOTES:
            ignorees.append((num, rang))
            continue
        t = cle_de_rang(rang)
        o = f"{ou}, ligne {num}"
        if t in votes:
            raise ErreurSource(f"{o} : deux lignes pour {rang}")
        m = RE_SCRUTIN.match(scrutin)
        if not m:
            raise ErreurSource(f"{o} : cellule Scrutin mal écrite : {scrutin!r}")
        if objet not in OBJETS:
            raise ErreurSource(f"{o} : objet inattendu : {objet!r}")
        if issue not in ("adopte", "rejete"):
            raise ErreurSource(f"{o} : issue inattendue : {issue!r}")
        if etape not in ("navette", "definitif", "aucune"):
            raise ErreurSource(f"{o} : étape inattendue : {etape!r}")
        if suite not in ("null", "texte_tombe", "texte_retire"):
            raise ErreurSource(f"{o} : suite inattendue : {suite!r}")
        if not date_valide(date):
            raise ErreurSource(f"{o} : date invalide : {date!r}")
        votes[t] = {"leg": int(m.group(1)), "scrutin": int(m.group(2)),
                    "vote": {"date": date, "etape": etape, "issue": issue, "objet": objet,
                             "suite": None if suite == "null" else suite}}
    manquent = [r for r in RANGS_VOTES if cle_de_rang(r) not in votes]
    if manquent:
        raise ErreurSource(f"{ou} : textes sans ligne : {', '.join(manquent)}"
                           + (f" (lignes ignorées : {', '.join(r for _, r in ignorees)})" if ignorees else ""))
    return votes, ignorees

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




# ---------------------------------------------------------------- profils.md (premier essai, contrôle 2)

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
    """`a-ne-pas-ouvrir/profils.md` : profils cachés, réponses types et d (fichier caché 2,
    point 2 : « recopié tel quel » ; ses parties « Réponses atypiques » et « Absences » sont
    remplacées, le corrigé de F1 ne sert plus)."""
    lignes = lignes_de(texte_profils)
    res = {}
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
            profils[p][t] = {"fermete": m.group(3), "position": pos}
    res["profils"] = profils
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
            m = re.fullmatch(r"([+−])([0-9]+),([0-9]+)", c)
            if not m:
                raise ErreurSource(f"{ou}, ligne {num} : cellule de d mal écrite : {c!r}")
            v = Fraction(int(m.group(2) + m.group(3)), 10 ** len(m.group(3)))
            ds[p][t] = v if m.group(1) == "+" else -v
    res["d"] = ds
    return res


# ---------------------------------------------------------------- fichier caché 2, point 14 (Q-F1)

def lire_cases(texte_regles):
    """Rôles choisis et cases tirées du fichier caché, point 14. Rend
    ({"E1": n, …, "0": n, "14": n}, {tension: [n, …]}) dans l'ordre des listes."""
    m = re.search(r"\*\*Rôles choisis, cases tirées\.\*\* (.+)", texte_regles)
    if not m:
        raise ErreurSource("fichier caché, point 14 : ligne « Rôles choisis, cases tirées. » absente")
    ligne = m.group(1)
    roles = {}
    for nom, n in re.findall(r"\b(E[1-3]|T0|T14) = ([0-9]+)", ligne):
        roles[nom[1:] if nom.startswith("T") else nom] = int(n)
    cases = {}
    for t, liste in re.findall(r"Cases ([SPTL]) : ([0-9, ]+)\.", ligne):
        cases[t] = [int(x) for x in liste.split(", ")]
    if sorted(roles) != sorted(["E1", "E2", "E3", "0", "14"]) or sorted(cases) != sorted(TENSIONS):
        raise ErreurSource(f"fichier caché, point 14 : rôles {roles} ou cases {cases} incomplets")
    return roles, cases
