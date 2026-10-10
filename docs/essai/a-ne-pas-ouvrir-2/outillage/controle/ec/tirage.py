"""Tirage déterministe (simulation, §0 ; second essai : simulation-2, §0, et
fichier caché 2, point 11 pour le réglage).

t(clé) = N / 16^8, N = les 8 premiers chiffres hexadécimaux de
SHA-256(préfixe + "|" + clé). Préfixe : la graine du fichier scellé ; pour le
réglage, g_R + "|" + i. Deux t exactement égaux : la clé la plus petite dans
l'ordre des octets UTF-8 passe d'abord.
"""

import hashlib
from fractions import Fraction


def sha256_hex(octets):
    return hashlib.sha256(octets).hexdigest()


class Tirage:
    def __init__(self, prefixe):
        self.prefixe = prefixe
        self._cache = {}

    def chaine(self, cle):
        return self.prefixe + "|" + cle

    def hex8(self, cle):
        return sha256_hex(self.chaine(cle).encode("utf-8"))[:8]

    def n(self, cle):
        v = self._cache.get(cle)
        if v is None:
            v = int(self.hex8(cle), 16)
            self._cache[cle] = v
        return v

    def t(self, cle):
        return Fraction(self.n(cle), 16 ** 8)

    def cle_tri(self, cle):
        """Clé de tri : t croissant, puis clé dans l'ordre des octets UTF-8."""
        return (self.n(cle), cle.encode("utf-8"))

    def plus_petit(self, elements, gabarit):
        """L'élément de plus petit t(gabarit.format(e))."""
        return min(elements, key=lambda e: self.cle_tri(gabarit.format(e)))

    def melanger(self, elements, gabarit):
        return sorted(elements, key=lambda e: self.cle_tri(gabarit.format(e)))


def graine_essai2(commit_spec):
    """Graine (simulation-2, §0) : 16 premiers chiffres hex de
    SHA-256("elenchos-essai-2|graine|" + E), E = empreinte de 40 chiffres du commit."""
    return sha256_hex(("elenchos-essai-2|graine|" + commit_spec).encode("utf-8"))[:16]


def graine_reglage(graine):
    """g_R (fichier caché 2, point 11) : 16 premiers chiffres hex de
    SHA-256("elenchos-essai-2|reglage|" + graine)."""
    return sha256_hex(("elenchos-essai-2|reglage|" + graine).encode("utf-8"))[:16]


def tirage_reglage(g_r, i):
    return Tirage(g_r + "|" + str(i))


def entier_0_100(n):
    return (101 * n) // (2 ** 32)


def choix_parmi_trois(n):
    return (3 * n) // (2 ** 32)
