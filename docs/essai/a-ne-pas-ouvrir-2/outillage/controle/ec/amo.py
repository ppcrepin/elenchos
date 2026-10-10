"""Lecture des fichiers d'organes des données ouvertes de l'Assemblée (`amo`), pour
la vérification des groupes (schéma 2, partie 2.10, « Règles d'ensemble »).

Les copies locales sont des données venues d'ailleurs : elles sont lues comme des
données, jamais exécutées ; on n'en prend que quatre champs. Le rapport donne le
chemin et le SHA-256 de chaque fichier lu.
"""

import json
import re
from pathlib import Path

from .tirage import sha256_hex

RE_PO = re.compile(r"PO[0-9]+")
TAILLE_MAX = 1_000_000


class ErreurAmo(Exception):
    pass


def lire_organe(dossiers, ident):
    """Cherche `json/organe/{ident}.json` dans chaque dossier, dans l'ordre. Rend
    {"chemin", "sha256", "uid", "libelle", "libelleAbrege", "libelleAbrev", "codeType",
    "autres": [(chemin, sha256)]} ou lève ErreurAmo."""
    if not RE_PO.fullmatch(ident):
        raise ErreurAmo(f"identifiant non permis : {ident!r}")
    trouves = []
    for d in dossiers:
        p = Path(d) / "json" / "organe" / f"{ident}.json"
        if p.is_file():
            o = p.read_bytes()
            if len(o) > TAILLE_MAX:
                raise ErreurAmo(f"{p} : fichier trop gros ({len(o)} octets)")
            trouves.append((p, o))
    if not trouves:
        raise ErreurAmo(f"{ident} : aucun fichier d'organe dans {', '.join(str(d) for d in dossiers)}")
    p, o = trouves[0]
    try:
        org = json.loads(o.decode("utf-8"))["organe"]
    except (ValueError, KeyError, UnicodeDecodeError) as e:
        raise ErreurAmo(f"{p} : illisible ({e})") from None
    if not isinstance(org, dict) or org.get("uid") != ident:
        raise ErreurAmo(f"{p} : uid {org.get('uid') if isinstance(org, dict) else None!r} ≠ {ident}")
    out = {"chemin": str(p), "sha256": sha256_hex(o), "uid": ident}
    for k in ("libelle", "libelleAbrege", "libelleAbrev", "codeType"):
        v = org.get(k)
        out[k] = v if isinstance(v, str) else None
    out["autres"] = [(str(q), sha256_hex(b)) for q, b in trouves[1:]]
    return out
