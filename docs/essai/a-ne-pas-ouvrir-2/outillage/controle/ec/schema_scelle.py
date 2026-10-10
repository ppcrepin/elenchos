"""Schéma fermé du fichier scellé, version 5 (schéma 2, parties 1.2, 2 et 5.1, étape 4)."""

import re
import unicodedata

from .jeu import PERSONNAGES, JOUES, TOUS, HISTOIRE, TENSIONS, FERMETES, MEMBRES, rang_texte
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


RE_HEX64 = re.compile(r"[0-9a-f]{64}")
OBJETS = ("texte", "article", "amendement", "motion", "resolution")
ALPHAS = ("1/6", "1/4", "1/3")
CLES_RACINE = ["absences", "calendrier", "cercle", "format", "graine", "histoire", "personnages",
               "reglage", "reponses", "reponses_atypiques", "semaines", "statut", "textes",
               "vecteurs_test", "version"]


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


def _texte_ou_null(v, valeurs, chemin, ver):
    if v is not None and v not in valeurs:
        ver.err(chemin, f"texte ou null attendu, trouvé {v!r}")


def verifier_schema(d, date_scellement):
    """Étape 4. Rend (erreurs, candidat) ; candidat vrai si `statut` vaut « provisoire »."""
    v = Verif()
    if not v.cles(d, "", CLES_RACINE):
        return v.erreurs, False
    v.chaine(d["format"], "/format", valeurs=["elenchos-essai-scelle"])
    if v.entier(d["version"], "/version") and d["version"] != 5:
        v.err("/version", f"version {d['version']} (attendu : 5)")
    v.chaine(d["statut"], "/statut", valeurs=["provisoire", "final"])
    v.chaine(d["graine"], "/graine", RE_HEX16)
    if v.liste(d["vecteurs_test"], "/vecteurs_test", 3):
        for i, o in enumerate(d["vecteurs_test"]):
            c = f"/vecteurs_test/{i}"
            if v.cles(o, c, ["chaine", "cle", "hex8", "n"]):
                v.chaine(o["chaine"], c + "/chaine")
                v.chaine(o["cle"], c + "/cle")
                v.chaine(o["hex8"], c + "/hex8", RE_HEX8)
                v.entier(o["n"], c + "/n", 0, 2 ** 32 - 1)
    # 2.3 cercle
    if v.cles(d["cercle"], "/cercle", ["invitant", "membres", "nom"]):
        v.chaine(d["cercle"]["invitant"], "/cercle/invitant", valeurs=PERSONNAGES)
        v.chaine(d["cercle"]["nom"], "/cercle/nom")
        if v.liste(d["cercle"]["membres"], "/cercle/membres", 5):
            for i, m in enumerate(d["cercle"]["membres"]):
                c = f"/cercle/membres/{i}"
                if v.cles(m, c, ["depuis", "membre"]):
                    v.entier(m["depuis"], c + "/depuis", -90, 15)
                    v.chaine(m["membre"], c + "/membre", valeurs=MEMBRES)
    # 2.4 calendrier et semaines
    if v.liste(d["calendrier"], "/calendrier", 15):
        for i, o in enumerate(d["calendrier"]):
            c = f"/calendrier/{i}"
            if not v.cles(o, c, ["deviner_porteur", "jour", "manche", "nom_jour", "repondu",
                                 "revelation_porteur", "revele", "saut", "type"]):
                continue
            v.booleen(o["deviner_porteur"], c + "/deviner_porteur")
            v.entier(o["jour"], c + "/jour", 1, 15)
            for k in ("manche", "repondu", "revele"):
                _texte_ou_null(o[k], TOUS, f"{c}/{k}", v)
            v.chaine(o["nom_jour"], c + "/nom_jour",
                     valeurs=["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"])
            v.chaine(o["revelation_porteur"], c + "/revelation_porteur", valeurs=["aucune", "lue", "jamais_lue"])
            if o["saut"] is not None:
                v.entier(o["saut"], c + "/saut", 1, 2)
            v.chaine(o["type"], c + "/type", valeurs=["joue", "joue_puis_saut", "saute", "cloture"])
    if v.liste(d["semaines"], "/semaines", 15):
        for i, o in enumerate(d["semaines"]):
            c = f"/semaines/{i}"
            if v.cles(o, c, ["dernier_jour", "numero", "premier_jour"]):
                v.entier(o["dernier_jour"], c + "/dernier_jour", -90, 15)
                v.entier(o["numero"], c + "/numero", 1, 15)
                v.entier(o["premier_jour"], c + "/premier_jour", -90, 15)
    # 2.2 personnages
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
    # 2.5 textes joués
    if v.cles(d["textes"], "/textes", JOUES):
        for tid in JOUES:
            _texte(v, d["textes"][tid], f"/textes/{tid}", date_scellement)
    # 2.6 histoire
    h = d["histoire"]
    if v.cles(h, "/histoire", ["resume_sha256", "textes", "tirage"]):
        v.chaine(h["resume_sha256"], "/histoire/resume_sha256", RE_HEX64)
        v.entier(h["tirage"], "/histoire/tirage", 1, 200)
        if v.cles(h["textes"], "/histoire/textes", HISTOIRE):
            for hid in HISTOIRE:
                c = f"/histoire/textes/{hid}"
                o = h["textes"][hid]
                if not v.cles(o, c, ["fiche", "jour", "raisons", "sens", "tension"]):
                    continue
                v.entier(o["jour"], c + "/jour", -90, -1)
                v.entier(o["sens"], c + "/sens", 0, 1)
                v.chaine(o["tension"], c + "/tension", valeurs=TENSIONS)
                if v.liste(o["raisons"], c + "/raisons", 4):
                    for i, r in enumerate(o["raisons"]):
                        ci = f"{c}/raisons/{i}"
                        if v.cles(r, ci, ["cote", "pole", "rang"]):
                            v.chaine(r["cote"], ci + "/cote", valeurs=["pour", "contre"])
                            _pole(v, r["pole"], ci + "/pole")
                            v.entier(r["rang"], ci + "/rang", 1, 4)
                if o["fiche"] is not None and v.cles(o["fiche"], c + "/fiche", ["titre", "vote"]):
                    v.chaine(o["fiche"]["titre"], c + "/fiche/titre")
                    _vote(v, o["fiche"]["vote"], c + "/fiche/vote", date_scellement)
    # 2.7 réponses, absences, atypiques
    if v.cles(d["reponses"], "/reponses", TOUS):
        for tid in TOUS:
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
                    v.chaine(t, f"{c}/{i}", valeurs=TOUS)
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
                        if v.chaine(o["texte"], f"{c}/{i}/texte", valeurs=TOUS):
                            ts.append(o["texte"])
                _ordre_textes(v, ts, c)
    # 2.8 réglage
    if v.cles(d["reglage"], "/reglage", ["alpha", "barre", "facteur", "seuils_stricts"]):
        rg = d["reglage"]
        v.chaine(rg["alpha"], "/reglage/alpha", valeurs=ALPHAS)
        if v.entier(rg["barre"], "/reglage/barre") and rg["barre"] != 16:
            v.err("/reglage/barre", f"{rg['barre']} (seule valeur permise : 16)")
        if v.entier(rg["facteur"], "/reglage/facteur") and rg["facteur"] not in (2, 3, 4):
            v.err("/reglage/facteur", f"{rg['facteur']} (valeurs permises : 2, 3, 4)")
        v.booleen(rg["seuils_stricts"], "/reglage/seuils_stricts")
    for chemin, s in chaines(d):
        if unicodedata.normalize("NFC", s) != s:
            v.err(chemin, "chaîne pas en NFC")
        if any(unicodedata.category(ch) == "Cc" for ch in s):
            v.err(chemin, "caractère de contrôle dans une chaîne")
    return v.erreurs, d.get("statut") == "provisoire"


def _ordre_textes(v, ts, chemin):
    idx = [rang_texte(t) for t in ts if t in TOUS]
    if idx != sorted(set(idx)):
        v.err(chemin, "textes pas dans l'ordre du calendrier, ou répétés")


def _raison(v, r, chemin):
    if r == "aucune":
        return True
    return v.entier(r, chemin, 1, 4)


def _pole(v, pole, chemin):
    if pole != "aucun" and (pole not in (0, 1) or isinstance(pole, bool)):
        v.err(chemin, f"valeur non permise : {pole!r}")


def _groupe(v, g, chemin, null_permis):
    if g is None:
        if not null_permis:
            v.err(chemin, "null permis seulement pour un député")
        return
    v.chaine(g, chemin)


def _vote(v, vo, c, date_scellement):
    if not v.cles(vo, c, ["date", "etape", "issue", "objet", "suite"]):
        return
    if v.chaine(vo["date"], c + "/date"):
        if not date_valide(vo["date"]):
            v.err(c + "/date", f"jour qui n'existe pas ou mal écrit : {vo['date']!r}")
        elif date_scellement is not None and vo["date"] > date_scellement:
            v.err(c + "/date", f"postérieure au jour du scellement ({date_scellement})")
    v.chaine(vo["etape"], c + "/etape", valeurs=["navette", "definitif", "aucune"])
    v.chaine(vo["issue"], c + "/issue", valeurs=["adopte", "rejete"])
    v.chaine(vo["objet"], c + "/objet", valeurs=OBJETS)
    if vo["suite"] is not None:
        v.chaine(vo["suite"], c + "/suite", valeurs=["texte_tombe", "texte_retire"])


def _texte(v, t, c, date_scellement):
    if not v.cles(t, c, ["auteur", "considerations", "lien_scrutin", "lignes", "sens", "sources",
                         "tension", "titre", "vote"]):
        return
    a = t["auteur"]
    typ = a.get("type") if isinstance(a, dict) else None
    if typ == "gouvernement":
        v.cles(a, c + "/auteur", ["type"])
    elif typ == "commission":
        if v.cles(a, c + "/auteur", ["libelle", "type"]):
            v.chaine(a["libelle"], c + "/auteur/libelle")
    elif typ in ("depute", "senateur"):
        if v.cles(a, c + "/auteur", ["feminin", "groupe", "nom", "type"]):
            v.booleen(a["feminin"], c + "/auteur/feminin")
            v.chaine(a["nom"], c + "/auteur/nom")
            _groupe(v, a["groupe"], c + "/auteur/groupe", typ == "depute")
    else:
        v.err(c + "/auteur", "forme d'auteur non permise")
    if v.liste(t["considerations"], c + "/considerations", 4):
        for i, o in enumerate(t["considerations"]):
            ci = f"{c}/considerations/{i}"
            if not v.cles(o, ci, ["cote", "depute", "pole", "rang", "texte"]):
                continue
            v.chaine(o["cote"], ci + "/cote", valeurs=["pour", "contre"])
            _pole(v, o["pole"], ci + "/pole")
            v.entier(o["rang"], ci + "/rang", 1, 4)
            v.chaine(o["texte"], ci + "/texte")
            dep = o["depute"]
            if v.cles(dep, ci + "/depute", ["elision", "feminin", "groupe", "nom"]):
                v.booleen(dep["elision"], ci + "/depute/elision")
                v.booleen(dep["feminin"], ci + "/depute/feminin")
                v.chaine(dep["nom"], ci + "/depute/nom")
                _groupe(v, dep["groupe"], ci + "/depute/groupe", True)
    v.chaine(t["lien_scrutin"], c + "/lien_scrutin", RE_ADRESSE)
    if v.liste(t["lignes"], c + "/lignes", 3):
        for i, s in enumerate(t["lignes"]):
            v.chaine(s, f"{c}/lignes/{i}")
    v.entier(t["sens"], c + "/sens", 0, 1)
    if v.liste(t["sources"], c + "/sources", non_vide=True):
        for i, s in enumerate(t["sources"]):
            v.chaine(s, f"{c}/sources/{i}", RE_ADRESSE)
    v.chaine(t["tension"], c + "/tension", valeurs=TENSIONS)
    v.chaine(t["titre"], c + "/titre")
    _vote(v, t["vote"], c + "/vote", date_scellement)
