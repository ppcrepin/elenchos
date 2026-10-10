"""Outils communs des tests : fabrique une fois, dans un dossier temporaire, le
fichier scellé de test (outils/fabriquer_test.py) et ses sources."""

import copy
import os
import sys
import tempfile
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))
sys.path.insert(0, str(ICI.parent / "outils"))

import controle  # noqa: E402
from ec import canon  # noqa: E402

SCRATCH = Path(os.environ.get("CONTROLE_SCRATCH",
                              "/tmp/claude-0/-home-user-elenchos/aab25699-b440-58aa-ae88-65e053f9256b/scratchpad"))
AMO = [p for p in (SCRATCH / "contenu-an" / "amo", SCRATCH / "contenu-an16" / "amo") if p.is_dir()]
CONFUSABLES = SCRATCH / "controle-unicode" / "confusables-16.0.0.txt"

_ETAT = {}


def fabrique():
    """(dossier, octets du fichier de test, objet). Une seule fabrication par lancement."""
    if "d" not in _ETAT:
        import fabriquer_test
        d = Path(tempfile.mkdtemp(prefix="controle-tests-", dir=SCRATCH))
        octets, _ = fabriquer_test.construire(d, [], 0)
        _ETAT["d"] = (d, octets, canon.lire_strict(octets))
    return _ETAT["d"]


def sources_test():
    d, _, _ = fabrique()
    return controle.lire_sources(d / "textes", d / "tables-test.md")


def muter(f):
    _, _, obj = fabrique()
    o = copy.deepcopy(obj)
    f(o)
    return canon.octets_canoniques(o)
