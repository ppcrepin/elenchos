"""Schéma fermé du fichier scellé, version 4 (schéma, parties 1.2, 2 et 4.1 étape 4)."""

import re
import unicodedata

from .jeu import PERSONNAGES, TEXTES, TENSIONS, FERMETES, QUOTIDIENS
from .sources import date_valide

RE_ADRESSE = re.compile(
    r"https://www\.assemblee-nationale\.fr(?:/(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*)+"
)
RE_HEX16 = re.compile(r"[0-9a-f]{16}")
RE_HEX8 = re.compile(r"[0-9a-f]{8}")
RE_HEURE = re.compile(r"(?:[01][0-9]|2[0-3]):[0-5][0-9]")


class Verif:
    def __init__(self):
        self.erreurs = []

    def err(self, chemin, msg):
        self.erreurs.append(f"{chemin} : {msg}")

    def cles(self, obj, chemin, attendues):
        if not isinstance(obj, dict):
            self.err(chemin, "objet attendu")
            return False
        a = set(attendues)
        k = set(obj)
        if k != a:
            if a - k:
                self.err(chemin, f"clés absentes : {sorted(a - k)}")
            if k - a:
                self.err(chemin, f"clés en trop : {sorted(k - a)}")
            return False
        return True

    def entier(self, v, chemin, mini=None, maxi=None):
        if not isinstance(v, int) or isinstance(v, bool):
            self.err(chemin, f"entier attendu, trouvé {v!r}")
            return False
        if (mini is not None and v < mini) or (maxi is not None and v > maxi):
            self.err(chemin, f"entier hors de [{mini}, {maxi}] : {v}")
            return False
        return True

    def booleen(self, v, chemin):
        if not isinstance(v, bool):
            self.err(chemin, f"booléen attendu, trouvé {v!r}")
            return False
        return True

    def chaine(self, v, chemin, regex=None, valeurs=None):
        if not isinstance(v, str):
            self.err(chemin, f"chaîne attendue, trouvé {v!r}")
            return False
        if valeurs is not None and v not in valeurs:
            self.err(chemin, f"valeur non permise : {v!r}")
            return False
        if regex is not None and not regex.fullmatch(v):
            self.err(chemin, f"écriture non permise : {v!r}")
            return False
        return True

    def liste(self, v, chemin, longueur=None, non_vide=False):
        if not isinstance(v, list):
            self.err(chemin, "tableau attendu")
            return False
        if longueur is not None and len(v) != longueur:
            self.err(chemin, f"{len(v)} éléments (attendu : {longueur})")
            return False
        if non_vide and not v:
            self.err(chemin, "tableau vide")
            return False
        return True


def chaines(obj, chemin=""):
    """Toutes les chaînes d'un objet JSON, clés comprises, avec leur chemin."""
    if isinstance(obj, str):
        yield chemin, obj
    elif isinstance(obj, list):
        for i, e in enumerate(obj):
            yield from chaines(e, f"{chemin}/{i}")
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield f"{chemin}/{k} (clé)", k
            yield from chaines(v, f"{chemin}/{k}")


def verifier_schema(d, date_scellement):
    """Étape 4. Rend la liste des erreurs (vide si passée)."""
    v = Verif()
    if not v.cles(d, "", ["absences", "cercle", "format", "graine", "personnages", "reglage",
                          "reponses", "reponses_atypiques", "textes", "vecteurs_test", "version"]):
        return v.erreurs
    v.chaine(d["format"], "/format", valeurs=["elenchos-essai-scelle"])
    if v.entier(d["version"], "/version") and d["version"] != 4:
        v.err("/version", f"version {d['version']} (attendu : 4)")
    v.chaine(d["graine"], "/graine", RE_HEX16)
    if v.liste(d["vecteurs_test"], "/vecteurs_test", 3):
        for i, o in enumerate(d["vecteurs_test"]):
            c = f"/vecteurs_test/{i}"
            if v.cles(o, c, ["chaine", "cle", "hex8", "n"]):
                v.chaine(o["chaine"], c + "/chaine")
                v.chaine(o["cle"], c + "/cle")
                v.chaine(o["hex8"], c + "/hex8", RE_HEX8)
                v.entier(o["n"], c + "/n", 0, 2 ** 32 - 1)
    if v.cles(d["cercle"], "/cercle", ["inviteuse", "nom"]):
        v.chaine(d["cercle"]["inviteuse"], "/cercle/inviteuse")
        v.chaine(d["cercle"]["nom"], "/cercle/nom")
    if v.cles(d["personnages"], "/personnages", PERSONNAGES):
        for p in PERSONNAGES:
            c = f"/personnages/{p}"
            o = d["personnages"][p]
            if not v.cles(o, c, ["age", "heure_de_jeu", "ligne_de_vie", "metier", "profil", "ville"]):
                continue
            v.entier(o["age"], c + "/age")
            v.chaine(o["heure_de_jeu"], c + "/heure_de_jeu", RE_HEURE)
            for k in ("ligne_de_vie", "metier", "ville"):
                v.chaine(o[k], f"{c}/{k}")
            if v.cles(o["profil"], c + "/profil", TENSIONS):
                for t in TENSIONS:
                    ct = f"{c}/profil/{t}"
                    if v.cles(o["profil"][t], ct, ["fermete", "position"]):
                        v.chaine(o["profil"][t]["fermete"], ct + "/fermete", valeurs=FERMETES)
                        v.entier(o["profil"][t]["position"], ct + "/position", 0, 100)
    if v.cles(d["textes"], "/textes", TEXTES):
        for tid in TEXTES:
            _texte(v, d["textes"][tid], f"/textes/{tid}", date_scellement)
    if v.cles(d["reponses"], "/reponses", TEXTES):
        for tid in TEXTES:
            c = f"/reponses/{tid}"
            o = d["reponses"][tid]
            if not isinstance(o, dict):
                v.err(c, "objet attendu")
                continue
            for p, r in o.items():
                if p not in PERSONNAGES:
                    v.err(c, f"clé non permise : {p!r}")
                    continue
                if v.cles(r, f"{c}/{p}", ["niveau", "raison"]):
                    v.entier(r["niveau"], f"{c}/{p}/niveau", 1, 5)
                    _raison(v, r["raison"], f"{c}/{p}/raison")
    if v.cles(d["absences"], "/absences", PERSONNAGES):
        for p in PERSONNAGES:
            c = f"/absences/{p}"
            if v.liste(d["absences"][p], c):
                for i, t in enumerate(d["absences"][p]):
                    v.chaine(t, f"{c}/{i}", valeurs=TEXTES)
                _ordre_textes(v, d["absences"][p], c)
    if v.cles(d["reponses_atypiques"], "/reponses_atypiques", PERSONNAGES):
        for p in PERSONNAGES:
            c = f"/reponses_atypiques/{p}"
            if v.liste(d["reponses_atypiques"][p], c):
                ts = []
                for i, o in enumerate(d["reponses_atypiques"][p]):
                    if v.cles(o, f"{c}/{i}", ["cote_tire", "texte"]):
                        if o["cote_tire"] not in (1, -1, None) or isinstance(o["cote_tire"], bool):
                            v.err(f"{c}/{i}/cote_tire", f"valeur non permise : {o['cote_tire']!r}")
                        if v.chaine(o["texte"], f"{c}/{i}/texte", valeurs=TEXTES):
                            ts.append(o["texte"])
                _ordre_textes(v, ts, c)
    if v.cles(d["reglage"], "/reglage", ["seuils_stricts"]):
        v.booleen(d["reglage"]["seuils_stricts"], "/reglage/seuils_stricts")
    # Toutes les chaînes : NFC, sans caractère de contrôle (le fichier scellé n'a
    # aucun texte de carnet : aucune exception).
    for chemin, s in chaines(d):
        if unicodedata.normalize("NFC", s) != s:
            v.err(chemin, "chaîne pas en NFC")
        if any(unicodedata.category(ch) == "Cc" for ch in s):
            v.err(chemin, "caractère de contrôle dans une chaîne")
    return v.erreurs


def _ordre_textes(v, ts, chemin):
    idx = [TEXTES.index(t) for t in ts if t in TEXTES]
    if idx != sorted(set(idx)):
        v.err(chemin, "textes pas dans l'ordre des textes, ou répétés")


def _raison(v, r, chemin):
    if r == "aucune":
        return True
    return v.entier(r, chemin, 1, 4)


def _elu(v, o, chemin, avec_elision):
    cles = ["feminin", "groupe", "nom"] + (["elision"] if avec_elision else [])
    if not v.cles(o, chemin, cles):
        return
    v.booleen(o["feminin"], chemin + "/feminin")
    v.chaine(o["groupe"], chemin + "/groupe")
    v.chaine(o["nom"], chemin + "/nom")
    if avec_elision:
        v.booleen(o["elision"], chemin + "/elision")


def _texte(v, t, c, date_scellement):
    if not v.cles(t, c, ["auteur", "considerations", "lien_scrutin", "lignes", "sens", "sources",
                         "tension", "titre", "vote"]):
        return
    a = t["auteur"]
    if isinstance(a, dict) and a.get("type") == "gouvernement":
        v.cles(a, c + "/auteur", ["type"])
    elif isinstance(a, dict) and a.get("type") in ("depute", "senateur"):
        if v.cles(a, c + "/auteur", ["feminin", "groupe", "nom", "type"]):
            _elu(v, {k: a[k] for k in ("feminin", "groupe", "nom")}, c + "/auteur", False)
    else:
        v.err(c + "/auteur", "forme d'auteur non permise")
    if v.liste(t["considerations"], c + "/considerations", 4):
        for i, o in enumerate(t["considerations"]):
            ci = f"{c}/considerations/{i}"
            if not v.cles(o, ci, ["cote", "depute", "pole", "rang", "texte"]):
                continue
            v.chaine(o["cote"], ci + "/cote", valeurs=["pour", "contre"])
            if o["pole"] != "aucun" and (o["pole"] not in (0, 1) or isinstance(o["pole"], bool)):
                v.err(ci + "/pole", f"valeur non permise : {o['pole']!r}")
            v.entier(o["rang"], ci + "/rang", 1, 4)
            v.chaine(o["texte"], ci + "/texte")
            _elu(v, o["depute"], ci + "/depute", True)
    v.chaine(t["lien_scrutin"], c + "/lien_scrutin", RE_ADRESSE)
    if v.liste(t["lignes"], c + "/lignes", 3):
        for i, s in enumerate(t["lignes"]):
            v.chaine(s, f"{c}/lignes/{i}")
    if v.entier(t["sens"], c + "/sens", 0, 1):
        pass
    if v.liste(t["sources"], c + "/sources", non_vide=True):
        for i, s in enumerate(t["sources"]):
            v.chaine(s, f"{c}/sources/{i}", RE_ADRESSE)
    v.chaine(t["tension"], c + "/tension", valeurs=TENSIONS)
    v.chaine(t["titre"], c + "/titre")
    if v.cles(t["vote"], c + "/vote", ["date", "etape", "issue"]):
        vo = t["vote"]
        if v.chaine(vo["date"], c + "/vote/date"):
            if not date_valide(vo["date"]):
                v.err(c + "/vote/date", f"jour qui n'existe pas ou mal écrit : {vo['date']!r}")
            elif date_scellement is not None and vo["date"] > date_scellement:
                v.err(c + "/vote/date", f"postérieure au jour du scellement ({date_scellement})")
        v.chaine(vo["etape"], c + "/vote/etape", valeurs=["navette", "definitif", "aucune"])
        v.chaine(vo["issue"], c + "/vote/issue", valeurs=["adopte", "rejete", "sans_vote_ensemble"])
