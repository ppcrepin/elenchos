import copy
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

import controle  # noqa: E402
from ec import canon  # noqa: E402

CANDIDAT = controle.CANDIDAT


def candidat_octets():
    return CANDIDAT.read_bytes()


def candidat():
    return canon.lire_strict(candidat_octets())


def muter(f):
    """Rend les octets canoniques du candidat modifié par f(objet)."""
    d = copy.deepcopy(candidat())
    f(d)
    return canon.octets_canoniques(d)
