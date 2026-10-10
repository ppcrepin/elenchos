"""JSON canonique (schéma, partie 1.1) : lecture stricte et écriture.

- Lecture : UTF-8 strict, sans marque d'ordre d'octets, clés en double refusées,
  nombres à virgule et constantes (NaN, Infinity) refusés.
- Écriture : sérialiseur écrit à la main (RFC 8785 restreinte aux entiers),
  comparé à json.dumps à chaque appel (deux écritures indépendantes).
"""

import json
from fractions import Fraction

ENTIER_MAX = 2 ** 53 - 1


class ErreurForme(Exception):
    """Fichier JSON qui ne suit pas la forme canonique ou le schéma."""


def _refuser_nombre(texte):
    raise ErreurForme(f"nombre à virgule ou constante refusé : {texte!r}")


def _paires(paires):
    objet = {}
    for cle, valeur in paires:
        if cle in objet:
            raise ErreurForme(f"clé en double : {cle!r}")
        objet[cle] = valeur
    return objet


def lire_strict(octets):
    """Lit des octets JSON en refusant tout ce que la partie 1.1 interdit.

    Ne vérifie pas que les octets sont canoniques : voir `est_canonique`.
    """
    if octets.startswith(b"\xef\xbb\xbf"):
        raise ErreurForme("marque d'ordre d'octets en tête")
    try:
        texte = octets.decode("utf-8", errors="strict")
    except UnicodeDecodeError as e:
        raise ErreurForme(f"UTF-8 invalide : {e}") from None
    try:
        return json.loads(
            texte,
            object_pairs_hook=_paires,
            parse_float=_refuser_nombre,
            parse_constant=_refuser_nombre,
        )
    except json.JSONDecodeError as e:
        raise ErreurForme(f"JSON invalide : {e}") from None


def _cle_utf16(cle):
    return cle.encode("utf-16-be")


def _chaine(s):
    morceaux = ['"']
    for ch in s:
        o = ord(ch)
        if ch == '"':
            morceaux.append('\\"')
        elif ch == "\\":
            morceaux.append("\\\\")
        elif o < 0x20:
            morceaux.append(
                {8: "\\b", 9: "\\t", 10: "\\n", 12: "\\f", 13: "\\r"}.get(o, "\\u%04x" % o)
            )
        elif 0xD800 <= o <= 0xDFFF:
            raise ErreurForme("demi-codet UTF-16 isolé dans une chaîne")
        else:
            morceaux.append(ch)
    morceaux.append('"')
    return "".join(morceaux)


def _ecrire(v, sortie):
    if v is None:
        sortie.append("null")
    elif v is True:
        sortie.append("true")
    elif v is False:
        sortie.append("false")
    elif isinstance(v, int):
        if not -ENTIER_MAX <= v <= ENTIER_MAX:
            raise ErreurForme(f"entier hors de ±(2^53\u22121) : {v}")
        sortie.append(str(v))
    elif isinstance(v, str):
        sortie.append(_chaine(v))
    elif isinstance(v, (list, tuple)):
        sortie.append("[")
        for i, e in enumerate(v):
            if i:
                sortie.append(",")
            _ecrire(e, sortie)
        sortie.append("]")
    elif isinstance(v, dict):
        sortie.append("{")
        for i, cle in enumerate(sorted(v, key=_cle_utf16)):
            if not isinstance(cle, str):
                raise ErreurForme(f"clé non textuelle : {cle!r}")
            if i:
                sortie.append(",")
            sortie.append(_chaine(cle))
            sortie.append(":")
            _ecrire(v[cle], sortie)
        sortie.append("}")
    else:
        raise ErreurForme(f"type non permis dans le JSON canonique : {type(v).__name__}")


def canonique(objet):
    """Texte canonique (str). Vérifié contre json.dumps (méthode de la partie 1.1)."""
    morceaux = []
    _ecrire(objet, morceaux)
    texte = "".join(morceaux)
    temoin = json.dumps(
        objet, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False
    )
    if texte != temoin:
        raise AssertionError("les deux écritures canoniques diffèrent")
    return texte


def octets_canoniques(objet):
    return canonique(objet).encode("utf-8")


def est_canonique(octets):
    """(vrai/faux, objet ou None, message)."""
    try:
        objet = lire_strict(octets)
    except ErreurForme as e:
        return False, None, str(e)
    try:
        refait = octets_canoniques(objet)
    except ErreurForme as e:
        return False, objet, str(e)
    if refait != octets:
        # premier octet différent, pour le rapport
        i = 0
        while i < min(len(refait), len(octets)) and refait[i] == octets[i]:
            i += 1
        return False, objet, (
            f"remis en forme canonique, le fichier diffère à l'octet {i} "
            f"(fichier : {octets[i:i+40]!r} ; canonique : {refait[i:i+40]!r})"
        )
    return True, objet, ""


def frac(x):
    """Écriture d'une fraction dans la trace : forme de str(Fraction)."""
    return str(Fraction(x))
