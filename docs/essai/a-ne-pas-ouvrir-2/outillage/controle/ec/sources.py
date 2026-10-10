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


#@@NOUVEAU@@

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


