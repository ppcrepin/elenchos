"""Différences entre deux objets JSON, en JSON Pointer (S1, partie 4.2)."""

from . import canon


def pointeur(chemin):
    return "".join("/" + str(p).replace("~", "~0").replace("/", "~1") for p in chemin)


def differences(a, b, chemin=()):
    """[(JSON Pointer, valeur A, valeur B)] ; types comparés strictement (true ≠ 1)."""
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append((pointeur(chemin + (k,)), "‹absente›", b[k]))
            elif k not in b:
                out.append((pointeur(chemin + (k,)), a[k], "‹absente›"))
            else:
                out.extend(differences(a[k], b[k], chemin + (k,)))
    elif isinstance(a, list) and isinstance(b, list):
        for i in range(max(len(a), len(b))):
            if i >= len(a):
                out.append((pointeur(chemin + (i,)), "‹absente›", b[i]))
            elif i >= len(b):
                out.append((pointeur(chemin + (i,)), a[i], "‹absente›"))
            else:
                out.extend(differences(a[i], b[i], chemin + (i,)))
    elif type(a) is not type(b) or a != b:
        out.append((pointeur(chemin), a, b))
    return out


def comparer_octets(octets_a, octets_b):
    """Comparaison octet pour octet, sans masquage (trace de l'histoire, partie 5.3).
    Rend (identiques, différences en JSON Pointer si les deux se relisent)."""
    if octets_a == octets_b:
        return True, []
    try:
        a, b = canon.lire_strict(octets_a), canon.lire_strict(octets_b)
    except canon.ErreurForme as e:
        return False, [("", "illisible", str(e))]
    d = differences(a, b)
    if not d:
        d = [("", "mêmes valeurs", "octets différents (forme non canonique d'un côté)")]
    return False, d
