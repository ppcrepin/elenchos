"""Heure de Paris (schéma, partie 1.2, type « instant » ; partie 3.12, règle 4).

Règle de l'Union européenne, écrite ici sans base de fuseaux (le contrôle ne
dépend pas de la machine) : heure d'été (+02:00) du dernier dimanche de mars,
01:00 UTC, au dernier dimanche d'octobre, 01:00 UTC ; sinon +01:00. Vérifiée
contre zoneinfo dans les tests quand la base est présente.
"""

import datetime as dt
import re

RE_INSTANT = re.compile(r"([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})([+-])([0-9]{2}):([0-9]{2})")
RE_HEURE = re.compile(r"(?:[01][0-9]|2[0-3]):[0-5][0-9]")
JOURS = ("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche")


def _dernier_dimanche(annee, mois):
    d = dt.date(annee, mois + 1, 1) - dt.timedelta(days=1) if mois < 12 else dt.date(annee, 12, 31)
    return d - dt.timedelta(days=(d.weekday() - 6) % 7)


def decalage_utc(instant_utc):
    """Décalage de Paris (en minutes) à un instant UTC (datetime naïf en UTC)."""
    a = instant_utc.year
    debut = dt.datetime.combine(_dernier_dimanche(a, 3), dt.time(1, 0))
    fin = dt.datetime.combine(_dernier_dimanche(a, 10), dt.time(1, 0))
    return 120 if debut <= instant_utc < fin else 60


def lire_instant(s):
    """Rend (datetime local naïf, décalage en minutes, datetime UTC naïf) ou lève ValueError
    si l'écriture est fausse ou si cet instant n'existe pas à Paris avec ce décalage."""
    if not isinstance(s, str):
        raise ValueError("instant non textuel")
    m = RE_INSTANT.fullmatch(s)
    if not m:
        raise ValueError(f"instant mal écrit : {s!r}")
    a, mo, j, h, mi, signe, oh, om = m.groups()
    local = dt.datetime(int(a), int(mo), int(j), int(h), int(mi))  # lève si le jour n'existe pas
    dec = (int(oh) * 60 + int(om)) * (1 if signe == "+" else -1)
    utc = local - dt.timedelta(minutes=dec)
    if decalage_utc(utc) != dec:
        raise ValueError(f"{s} n'existe pas à Paris avec ce décalage")
    return local, dec, utc


def minutes(heure):
    h, m = heure.split(":")
    return int(h) * 60 + int(m)


def r_journee(m):
    """r(m) = (m − 1080 + 1440) mod 1440 (schéma, partie 3.8)."""
    return (m - 1080 + 1440) % 1440


def date_carnet(local):
    """« lundi 19 octobre 2026 » (§8.12), « 1er » pour le premier du mois."""
    from .typo import MOIS
    j = local.day
    return f"{JOURS[local.weekday()]} {'1er' if j == 1 else j} {MOIS[local.month - 1]} {local.year}"
