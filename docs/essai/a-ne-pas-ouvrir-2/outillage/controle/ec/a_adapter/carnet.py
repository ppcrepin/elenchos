"""Texte du carnet (simulation, §8.12) et vérification de son gabarit.

Le carnet n'applique que la règle 1 du §7.8 (apostrophe \u2019). Les libellés des
boutons sont ceux du schéma, partie 3.4."""

import re

from .heure import lire_instant, date_carnet
from .jeu import PERSONNAGES, TENSIONS, POLES

A = "\u2019"

LIBELLES = {
    "q1": {"aurais_pu": f"J{A}aurais pu trouver", "ne_pouvais_pas": "Je ne pouvais pas trouver",
           "les_deux": "Les deux"},
    "q2": {"premier_coup": "Compris du premier coup", "en_relisant": "Compris en relisant",
           "pas_tout": "Pas tout compris"},
    "q3": {"revelation": "La révélation", "titres": "Les titres", "phrase_semaine": "Ma phrase de la semaine",
           "deviner": "Deviner", "donner_avis": "Donner mon avis", "phrase_jour": "Ma phrase du jour",
           "aucun": "Aucun"},
    "raison": {"pas_amuse": f"Je ne m{A}amuse pas", "pas_compris": "Je ne comprends pas tout",
               "pas_le_temps": f"Je n{A}ai pas le temps", "vu_assez": f"J{A}ai vu ce que je voulais voir",
               "autre": "Autre raison"},
    "f2": {"de_plus_en_plus": "De plus en plus amusant", "toujours_autant": "Toujours aussi amusant",
           "de_moins_en_moins": "De moins en moins amusant", "jamais": "Jamais amusant"},
}
VERDICTS = {"juste_et_raison": "juste avec la raison", "juste": "juste", "faux": "faux", "passe": "passé"}
RE_DUREE = re.compile(r"\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b")


def duree(d):
    return f"{d // 60} min {d % 60:02d} s"


def liste_noms(membres):
    noms = ["vous" if m == "porteur" else m for m in membres]
    if not noms:
        return "pas attribué"
    if len(noms) == 1:
        return noms[0]
    return ", ".join(noms[:-1]) + " et " + noms[-1]


def bloc_seance(k, ouverture, jours, versions, mesures, etapes_nul_ok, coups, revelation_vide=False):
    """Lignes du bloc d'une séance. mesures : au format de la trace."""
    L = []
    L.append("Entrée" if k == 0 else ("Clôture" if k == 15 else f"Jour {k} sur 14"))
    local, _, _ = lire_instant(ouverture)
    L.append(f"Ouverture : {date_carnet(local)}, entre {local.hour}h00 et {local.hour}h59.")
    if k >= 1:
        L.append(f"Jours écoulés depuis l{A}ouverture précédente : {jours}.")
    L.append(f"Version de la page : {', puis '.join(str(v) for v in versions)}.")
    suite = []
    if mesures["duree_deviner"] is not None:
        suite.append(f"{duree(mesures['duree_deviner'])} pour deviner")
    if mesures["duree_repondre"] is not None:
        suite.append(f"{duree(mesures['duree_repondre'])} pour répondre")
    L.append(f"Durée : {duree(mesures['duree_seance'])}" + (", dont " + " et ".join(suite) if suite else "") + ".")
    if 2 <= k <= 14:
        L.append(f"Boutons touchés : Relire {mesures['relire']} fois, Passer {mesures['passer']} fois.")
    if 3 <= k <= 15:
        vs = mesures["revelation_verdicts"]
        if not vs:
            L.append("Révélation : aucune carte.")
        else:
            l = "Révélation : " + ", ".join(VERDICTS[v] for v in vs) + "."
            if mesures["revelation_raison_tentee"] is not None:
                l += " Raison cachée : " + ("tentée" if mesures["revelation_raison_tentee"] else "pas tentée") + "."
            L.append(l)
    q = coups["carnet"]
    if q["q1"] is not None:
        L.append(f"Vos erreurs à la révélation : {LIBELLES['q1'][q['q1']]}.")
    if q["q2"] is not None:
        intitule = "Les trois textes et leurs raisons" if k == 0 else "Le texte du jour et ses quatre raisons"
        L.append(f"{intitule} : {LIBELLES['q2'][q['q2']]}.")
    if q["q3"] is not None:
        L.append(f"Votre moment préféré : {LIBELLES['q3'][q['q3']]}.")
    return L


def bloc_titres(dim):
    L = [f"Titres de la semaine {dim['semaine']}"]
    if dim["semaine"] == 2:
        L.append(f"Le Sans-Faute : {liste_noms(dim['sans_faute'])}.")
    t = dim["devin"]["titulaire"]
    L.append(f"Le Devin : {liste_noms([t] if t else [])}.")
    t = dim["mystere"]["titulaire"]
    L.append(f"Le Mystère : {liste_noms([t] if t else [])}.")
    L.append(f"Le Fidèle : {liste_noms(dim['fidele']['titulaires'])}.")
    return L


def bloc_essai(ag):
    def compte(x):
        return "pas de chiffre" if x is None else f"{x['justes']} fois sur {x['total']}"
    n = ag["titres_tires_au_sort"]
    return [
        f"Sur tout l{A}essai",
        f"Quand un personnage devinait la réponse d{A}un autre personnage, il a trouvé son auteur : "
        f"{compte(ag['justesse_personnages_entre_eux'])}.",
        f"Quand un personnage devinait l{A}une de vos réponses, il a trouvé que c{A}était vous : "
        f"{compte(ag['justesse_personnages_sur_porteur'])}.",
        f"Titres attribués par tirage au sort, faute de départage : {'pas de chiffre' if n is None else n}.",
    ]


def case_f1(t, v):
    p0, p1 = POLES[t]
    if v == "pole0":
        return p0
    if v == "pole1":
        return p1
    if v == "milieu":
        return f"au milieu entre {p0} et {p1}"
    return f"sans choix entre {p0} et {p1}"


def bloc_fin(f2, f1, cloture):
    L = ["Questions de fin"]
    L.append(f"{'Au fil des deux semaines' if cloture else f'Jusqu{A}ici'}, deviner était : "
             f"{LIBELLES['f2'][f2] if f2 else 'pas de réponse'}.")
    if f1 is None:
        L.append("Où vous placez chacun : question passée.")
    else:
        L.append("Où vous placez chacun :")
        for p in PERSONNAGES:
            L.append(f"{p} : " + " · ".join(case_f1(t, f1[p][t]) for t in TENSIONS) + ".")
    return L


def assembler(entete, blocs):
    """entete : lignes ; blocs : listes de lignes. Une ligne vide entre blocs."""
    parties = [entete] + blocs + [["Fin du carnet"]]
    return "\n\n".join("\n".join(b) for b in parties)


def entete(etat, k=None, raison=None):
    L = [f"Carnet de l{A}essai Elenchos",
         "Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, "
         "ni votre portrait, ni votre pseudo.",
         f"Les titres et les chiffres « Sur tout l{A}essai » dépendent en partie de vos avis, mais "
         "seulement en cumul, jamais texte par texte."]
    if etat == "cloture":
        L.append(f"Essai mené jusqu{A}à la clôture.")
    elif etat == "arret":
        L.append(f"Essai arrêté à l{A}entrée." if k == 0 else f"Essai arrêté au jour {k}.")
        L.append(f"Raison de l{A}arrêt : {LIBELLES['raison'][raison] if raison else 'pas de réponse'}.")
    else:
        L.append(f"Essai en cours : carnet copié à l{A}entrée." if k == 0
                 else f"Essai en cours : carnet copié au jour {k}.")
    return L


# --------------------------------------------------------------- gabarit (contrôle 12)

_D = r"(?:0|[1-9][0-9]*) min [0-5][0-9] s"
_N = r"(?:0|[1-9][0-9]*)"
_JOUR = r"(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) (?:1er|[1-9]|[12][0-9]|3[01]) " \
        r"(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) [0-9]{4}"
_NOMS = r"(?:pas attribué|(?:Agathe|Nassim|Odile|Valentin|vous)(?:(?:, (?:Agathe|Nassim|Odile|Valentin|vous))* et (?:Agathe|Nassim|Odile|Valentin|vous))?)"


def _alt(d):
    return "(?:" + "|".join(re.escape(x) for x in d.values()) + ")"


_VERD = "(?:juste avec la raison|juste|faux|passé)"


def _case(t):
    p0, p1 = (re.escape(x) for x in POLES[t])
    return f"(?:{p0}|{p1}|au milieu entre {p0} et {p1}|sans choix entre {p0} et {p1})"


GABARIT_SEANCE = [
    ("titre", re.compile(r"(?:Entrée|Jour (?:[1-9]|1[0-4]) sur 14|Clôture)")),
    ("ouverture", re.compile(rf"Ouverture : {_JOUR}, entre ([0-9]|1[0-9]|2[0-3])h00 et \1h59\.")),
    ("jours", re.compile(rf"Jours écoulés depuis l{A}ouverture précédente : {_N}\.")),
    ("version", re.compile(rf"Version de la page : [1-9][0-9]*(?:, puis [1-9][0-9]*)*\.")),
    ("duree", re.compile(rf"Durée : {_D}(?:, dont {_D} pour deviner(?: et {_D} pour répondre)?|, dont {_D} pour répondre)?\.")),
    ("boutons", re.compile(rf"Boutons touchés : Relire {_N} fois, Passer {_N} fois\.")),
    ("revelation", re.compile(rf"Révélation : (?:aucune carte\.|{_VERD}(?:, {_VERD}){{0,2}}\.(?: Raison cachée : (?:tentée|pas tentée)\.)?)")),
    ("q1", re.compile(rf"Vos erreurs à la révélation : {_alt(LIBELLES['q1'])}\.")),
    ("q2", re.compile(rf"(?:Le texte du jour et ses quatre raisons|Les trois textes et leurs raisons) : {_alt(LIBELLES['q2'])}\.")),
    ("q3", re.compile(rf"Votre moment préféré : {_alt(LIBELLES['q3'])}\.")),
]


def verifier_gabarit(texte, pseudo=None):
    """Contrôle 12 : le carnet suit exactement le gabarit du §8.12. Rend les défauts."""
    e = []
    if pseudo and pseudo in texte:
        e.append("le pseudo figure dans le carnet")
    if not texte.endswith("\n\nFin du carnet"):
        e.append("ne finit pas par une ligne vide puis « Fin du carnet » sans retour final")
    if "\r" in texte or "\t" in texte:
        e.append("retour chariot ou tabulation")
    import unicodedata
    if unicodedata.normalize("NFC", texte) != texte:
        e.append("pas en NFC")
    lignes = texte.split("\n")
    for n, l in enumerate(lignes, 1):
        if l != l.strip(" ") or "  " in l:
            e.append(f"ligne {n} : espace au bord ou double")
        if any(ch.isspace() and ch not in " " for ch in l):
            e.append(f"ligne {n} : blanc autre que U+0020")
        if re.match(r"^(?:[-*#>]|[0-9]+\.)", l):
            e.append(f"ligne {n} : commence comme une liste ou un titre")
        if "'" in l:
            e.append(f"ligne {n} : apostrophe droite")
        if "min" in RE_DUREE.sub("", l) and "min" in l:
            e.append(f"ligne {n} : « min » hors d'une durée")
    blocs = texte.split("\n\n")
    if any(b == "" or b.startswith("\n") or b.endswith("\n") for b in blocs):
        e.append("ligne vide en trop (blocs séparés par exactement une ligne vide)")
        return e
    b0 = blocs[0].split("\n")
    if b0[:3] != entete("cloture")[:3]:
        e.append("en-tête : trois premières lignes inattendues")
    etat = b0[3] if len(b0) > 3 else ""
    if not re.fullmatch(rf"Essai mené jusqu{A}à la clôture\.|Essai arrêté (?:à l{A}entrée|au jour (?:[1-9]|1[0-4]))\.|"
                        rf"Essai en cours : carnet copié (?:à l{A}entrée|au jour (?:[1-9]|1[0-4]))\.", etat):
        e.append(f"en-tête : ligne d'état inattendue : {etat!r}")
    arret = etat.startswith("Essai arrêté")
    attendu_entete = 5 if arret else 4
    if len(b0) != attendu_entete:
        e.append(f"en-tête : {len(b0)} lignes (attendu : {attendu_entete})")
    elif arret and not re.fullmatch(rf"Raison de l{A}arrêt : (?:{_alt(LIBELLES['raison'])}|pas de réponse)\.", b0[4]):
        e.append(f"en-tête : ligne de raison inattendue : {b0[4]!r}")
    for b in blocs[1:-1]:
        ls = b.split("\n")
        if ls[0].startswith("Titres de la semaine"):
            sem2 = ls[0] == "Titres de la semaine 2"
            att = (["Titres de la semaine 2", r"Le Sans-Faute : " + _NOMS + r"\."] if sem2 else ["Titres de la semaine 1"]) + \
                [r"Le Devin : " + _NOMS + r"\.", r"Le Mystère : " + _NOMS + r"\.", r"Le Fidèle : " + _NOMS + r"\."]
            if len(ls) != len(att) or not all(re.fullmatch(p, x) for p, x in zip(att, ls)):
                e.append(f"bloc des titres hors gabarit : {ls!r}")
        elif ls[0] == f"Sur tout l{A}essai":
            pats = [rf"Quand un personnage devinait la réponse d{A}un autre personnage, il a trouvé son auteur : (?:{_N} fois sur {_N}|pas de chiffre)\.",
                    rf"Quand un personnage devinait l{A}une de vos réponses, il a trouvé que c{A}était vous : (?:{_N} fois sur {_N}|pas de chiffre)\.",
                    rf"Titres attribués par tirage au sort, faute de départage : (?:{_N}|pas de chiffre)\."]
            if len(ls) != 4 or not all(re.fullmatch(p, x) for p, x in zip(pats, ls[1:])):
                e.append(f"bloc « Sur tout l{A}essai » hors gabarit : {ls!r}")
        elif ls[0] == "Questions de fin":
            ok = len(ls) >= 3 and re.fullmatch(
                rf"(?:Au fil des deux semaines|Jusqu{A}ici), deviner était : (?:{_alt(LIBELLES['f2'])}|pas de réponse)\.", ls[1])
            if ok and ls[2] == "Où vous placez chacun : question passée.":
                ok = len(ls) == 3
            elif ok and ls[2] == "Où vous placez chacun :":
                ok = len(ls) == 7 and all(
                    re.fullmatch(rf"{p} : " + " · ".join(_case(t) for t in TENSIONS) + r"\.", x)
                    for p, x in zip(PERSONNAGES, ls[3:]))
            else:
                ok = False
            if not ok:
                e.append(f"bloc « Questions de fin » hors gabarit : {ls!r}")
        else:
            # bloc de séance : lignes dans l'ordre du gabarit, chacune au plus une fois
            i = 0
            for x in ls:
                while i < len(GABARIT_SEANCE) and not GABARIT_SEANCE[i][1].fullmatch(x):
                    i += 1
                if i == len(GABARIT_SEANCE):
                    e.append(f"ligne hors gabarit ou hors d'ordre : {x!r}")
                    break
                i += 1
    return e


def masquer_durees(texte):
    return RE_DUREE.sub("\u2039durée\u203a", texte)
