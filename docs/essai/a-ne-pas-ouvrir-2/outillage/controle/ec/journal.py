"""Le journal du harnais, version 4 : schéma fermé (schéma 2, parties 4.3.3 et 4.4)
et validité (partie 4.4, règles 1 à 15 ; règles de S1, partie 3.12, réécrites pour
la table du calendrier). Un journal invalide n'est pas rejoué : le rapport donne la
règle et le chemin (JSON Pointer).

Les types de jours se lisent dans `calendrier` du fichier scellé (contrôlé au
contrôle 1, étape 5), jamais écrits en dur.
"""

import re
import unicodedata

from .heure import lire_instant, RE_HEURE
from .jeu import PERSONNAGES, ENTREE
from .moteur import Moteur
from .tirage import Tirage

CODES = {
    "raison": ("pas_amuse", "pas_compris", "pas_le_temps", "vu_assez", "autre"),
    "f2": ("de_plus_en_plus", "toujours_autant", "de_moins_en_moins", "jamais"),
    "compte": ("apple", "google", "email_valider", "email_plus_tard"),
    "saut_clair": ("non", "en_partie", "oui"),
    "hesite": ("deviner", "repondre", "revelation", "avis_cercle", "titres", "cercle", "portrait", "saut",
               "ailleurs", "nulle_part"),
    "moment_semaine": ("revelation", "avis_cercle", "titres", "phrase_semaine", "deviner", "donner_avis",
                       "phrase_jour", "cercle", "portrait", "aucun"),
    "servi": ("souvenir", "defi", "revelations", "cercle", "rien"),
    "regle": ("pas_claire", "claire_etrange", "claire", "pas_lue"),
    "avis": ("sans_apprendre", "apprenait", "pas_lu"),
    "raisons": ("pas_plus", "un_peu", "nettement"),
    "portrait": ("ressemblait_pas", "un_peu", "ressemblait", "pas_regarde"),
    "barre": ("pas_remarquee", "sans_savoir", "comprise"),
    "suspense": ("sans", "un_peu", "vrai"),
}
MOMENTS = {
    1: ("defi", "deviner", "donner_avis", "phrase_jour", "aucun"),
    2: ("revelation", "deviner", "donner_avis", "phrase_jour", "aucun"),
    "dimanche": ("revelation", "titres", "phrase_semaine", "deviner", "donner_avis", "phrase_jour", "aucun"),
}
CLES_COUPS = ["abandon", "annuler_saut", "carnet", "compte", "consentement", "deviner", "entree", "ouvert",
              "pendant_deviner", "pseudo", "relire", "reponse", "rouvrir"]
CLES_OUVERT = ["cercle", "moi", "proche", "qui_est_qui"]
RE_HEX16 = re.compile(r"[0-9a-f]{16}")
RE_HEX64 = re.compile(r"[0-9a-f]{64}")


class Defauts:
    def __init__(self):
        self.liste = []

    def __call__(self, regle, chemin, msg):
        self.liste.append((regle, chemin, msg))

    def __bool__(self):
        return bool(self.liste)


def _ent(v):
    return isinstance(v, int) and not isinstance(v, bool)


def _niveau(v):
    return _ent(v) and 1 <= v <= 5


def _raison(v):
    return v == "aucune" or (_ent(v) and 1 <= v <= 4)


def _cles(D, obj, chemin, attendues, regle=1):
    if not isinstance(obj, dict):
        D(regle, chemin, "objet attendu")
        return False
    if set(obj) != set(attendues):
        D(regle, chemin, f"clés {sorted(obj)} (attendu : {sorted(attendues)})")
        return False
    return True


def _reponse(D, r, chemin):
    if r is None:
        return
    if _cles(D, r, chemin, ["niveau", "raison"]):
        if not _niveau(r["niveau"]):
            D(1, chemin + "/niveau", f"niveau non permis : {r['niveau']!r}")
        if not _raison(r["raison"]):
            D(1, chemin + "/raison", f"raison non permise : {r['raison']!r}")


def _ouvert(D, o, chemin):
    if _cles(D, o, chemin, CLES_OUVERT):
        for k in CLES_OUVERT:
            if not _ent(o[k]) or o[k] < 0:
                D(1, f"{chemin}/{k}", "entier positif ou nul attendu")


# ------------------------------------------------------------------ squelette du pseudo (§7.19, E7)

def table_confusables(octets):
    """Table réduite tirée de confusables.txt (UTS #39) : source (un caractère) → une
    lettre latine de base (A–Z, a–z). Rend (table, version, nombre de lignes lues)."""
    texte = octets.decode("utf-8-sig")
    version = None
    table = {}
    n = 0
    for ligne in texte.split("\n"):
        if ligne.startswith("# Version:") or ligne.startswith("# confusables-"):
            version = version or ligne.strip("# \r")
        corps = ligne.split("#", 1)[0].strip()
        if not corps:
            continue
        champs = [c.strip() for c in corps.split(";")]
        if len(champs) < 2:
            continue
        n += 1
        src = champs[0].split()
        cible = champs[1].split()
        if len(src) != 1 or len(cible) != 1:
            continue
        c = chr(int(cible[0], 16))
        if re.fullmatch(r"[A-Za-z]", c):
            table[chr(int(src[0], 16))] = c
    return table, version, n


def _sans_signes(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s) if unicodedata.category(ch) != "Mn")


def forme_comparee(s, table):
    """Lecture de C (QUESTIONS.md, Q-J1) : minuscules (str.lower), NFD sans signes,
    lettres imitées ramenées à leur lettre latine, puis de nouveau minuscules et sans signes."""
    x = _sans_signes(s.lower())
    x = "".join(table.get(ch, ch) for ch in x)
    return _sans_signes(x.lower())


def pseudo_conforme(p, table):
    """Règle 6 : forme de S1, puis refus du §7.19 (squelette ; un caractère qui donnerait
    le rond d'un personnage)."""
    if not isinstance(p, str) or not 1 <= len(p) <= 20:
        return "longueur hors de 1 à 20 points de code"
    if unicodedata.normalize("NFC", p) != p:
        return "pas en NFC"
    if any(unicodedata.category(ch) in ("Cc", "Cf", "Cs") for ch in p):
        return "caractère des catégories Cc, Cf ou Cs"
    if any(ch.isspace() and ch != " " for ch in p) or "  " in p or p != p.strip(" "):
        return "blanc autre que U+0020, espace double ou espace au bord"
    if table is None:
        if p.lower() in {x.lower() for x in PERSONNAGES}:
            return "prénom d'un personnage (sans table des confusables : comparaison en minuscules seulement)"
        return None
    f = forme_comparee(p, table)
    for x in PERSONNAGES:
        if f == forme_comparee(x, table):
            return f"ressemble au prénom {x} (squelette {f!r})"
    if len(p) == 1 and f in ("a", "n", "o", "v"):
        return f"un seul caractère, de squelette {f.upper()} : même rond qu'un personnage"
    return None


# ------------------------------------------------------------------ forme (règle 1)

def _forme_coups(D, c, chemin):
    if not _cles(D, c, chemin, CLES_COUPS):
        return False
    if c["pseudo"] is not None and not isinstance(c["pseudo"], str):
        D(1, chemin + "/pseudo", "chaîne ou null attendue")
    if c["consentement"] not in (True, None):
        D(1, chemin + "/consentement", "true ou null attendu")
    if c["compte"] is not None and c["compte"] not in CODES["compte"]:
        D(1, chemin + "/compte", f"code non permis : {c['compte']!r}")
    if c["abandon"] is not None and not isinstance(c["abandon"], bool):
        D(1, chemin + "/abandon", "booléen ou null attendu")
    if c["annuler_saut"] is not None and (not _ent(c["annuler_saut"]) or c["annuler_saut"] < 0):
        D(1, chemin + "/annuler_saut", "entier positif ou null attendu")
    for k in ("relire", "rouvrir"):
        if not _ent(c[k]) or c[k] < 0:
            D(1, f"{chemin}/{k}", "entier positif ou nul attendu")
    _ouvert(D, c["ouvert"], chemin + "/ouvert")
    if c["pendant_deviner"] is not None and _cles(D, c["pendant_deviner"], chemin + "/pendant_deviner",
                                                  ["cercle", "proche"]):
        for k in ("cercle", "proche"):
            if not _ent(c["pendant_deviner"][k]) or c["pendant_deviner"][k] < 0:
                D(1, f"{chemin}/pendant_deviner/{k}", "entier positif ou nul attendu")
    _reponse(D, c["reponse"], chemin + "/reponse")
    if _cles(D, c["carnet"], chemin + "/carnet", ["hesite", "moment", "moment_semaine", "saut_clair"]):
        q = c["carnet"]
        if q["moment"] is not None and q["moment"] not in MOMENTS["dimanche"] + ("defi",):
            D(1, chemin + "/carnet/moment", f"code non permis : {q['moment']!r}")
        for k in ("moment_semaine", "saut_clair"):
            if q[k] is not None and q[k] not in CODES[k]:
                D(1, f"{chemin}/carnet/{k}", f"code non permis : {q[k]!r}")
        if q["hesite"] is not None:
            if not isinstance(q["hesite"], list) or not all(x in CODES["hesite"] for x in q["hesite"]):
                D(1, chemin + "/carnet/hesite", f"tableau de codes attendu : {q['hesite']!r}")
    if c["entree"] is not None and _cles(D, c["entree"], chemin + "/entree", list(ENTREE)):
        for e in ENTREE:
            ce = f"{chemin}/entree/{e}"
            if _cles(D, c["entree"][e], ce, ["pari", "reponse"]):
                _reponse(D, c["entree"][e]["reponse"], ce + "/reponse")
                p = c["entree"][e]["pari"]
                if p is not None and not _niveau(p):
                    D(1, ce + "/pari", f"niveau non permis : {p!r}")
    if c["deviner"] is not None and _cles(D, c["deviner"], chemin + "/deviner", ["cartes", "validee"]):
        dv = c["deviner"]
        if not isinstance(dv["validee"], bool):
            D(1, chemin + "/deviner/validee", "booléen attendu")
        if not isinstance(dv["cartes"], list):
            D(1, chemin + "/deviner/cartes", "tableau attendu")
        else:
            for i, x in enumerate(dv["cartes"]):
                ci = f"{chemin}/deviner/cartes/{i}"
                if _cles(D, x, ci, ["designe", "raison"]):
                    if x["designe"] not in PERSONNAGES + ("passe", None):
                        D(1, ci + "/designe", f"valeur non permise : {x['designe']!r}")
                    if x["raison"] is not None and not _raison(x["raison"]):
                        D(1, ci + "/raison", f"valeur non permise : {x['raison']!r}")
    return True


def _forme_saut(D, s, chemin, avec_depart=True):
    if not _cles(D, s, chemin, ["coups", "depart", "numero", "textes_atteints"]):
        return False
    if s["numero"] not in (1, 2) or isinstance(s["numero"], bool):
        D(1, chemin + "/numero", "1 ou 2 attendu")
    if not _ent(s["textes_atteints"]):
        D(1, chemin + "/textes_atteints", "entier attendu")
    try:
        lire_instant(s["depart"])
    except ValueError as e:
        D(4, chemin + "/depart", str(e))
    if _cles(D, s["coups"], chemin + "/coups", ["ouvert"]):
        _ouvert(D, s["coups"]["ouvert"], chemin + "/coups/ouvert")
    return True


def _chaines(o, c=""):
    if isinstance(o, str):
        yield c, o
    elif isinstance(o, list):
        for i, x in enumerate(o):
            yield from _chaines(x, f"{c}/{i}")
    elif isinstance(o, dict):
        for k, v in o.items():
            yield from _chaines(v, f"{c}/{k}")


def forme(D, j, empreinte):
    if not _cles(D, j, "", ["arret", "copies", "empreinte_scelle", "fin", "format", "jours", "partie",
                            "sauts", "version"]):
        return False
    if j["format"] != "elenchos-essai-journal":
        D(1, "/format", f"format inattendu : {j['format']!r}")
    if not _ent(j["version"]) or j["version"] != 4:
        D(1, "/version", f"version {j['version']!r} (attendu : 4)")
    if not isinstance(j["empreinte_scelle"], str) or not RE_HEX64.fullmatch(j["empreinte_scelle"]):
        D(1, "/empreinte_scelle", "hex64 attendu")
    elif j["empreinte_scelle"] != empreinte:
        D(1, "/empreinte_scelle", f"{j['empreinte_scelle']} ≠ SHA-256 du fichier scellé donné ({empreinte})")
    if _cles(D, j["partie"], "/partie", ["graine", "id", "mode"]):
        if j["partie"]["mode"] not in ("interface", "moteur"):
            D(1, "/partie/mode", "« interface » ou « moteur » attendu")
        if not isinstance(j["partie"]["id"], str):
            D(1, "/partie/id", "chaîne attendue")
    if not isinstance(j["jours"], dict) or not j["jours"]:
        D(1, "/jours", "objet non vide attendu")
        return False
    for k, s in j["jours"].items():
        c = f"/jours/{k}"
        if not _cles(D, s, c, ["attente", "coups", "etapes", "ouverture", "versions"]):
            continue
        if s["versions"] is not None and (not isinstance(s["versions"], list)
                                          or not all(_ent(v) for v in s["versions"])):
            D(1, c + "/versions", "tableau d'entiers ou null attendu")
        if s["etapes"] is not None and _cles(D, s["etapes"], c + "/etapes", ["deviner", "entree", "repondre"]):
            for x in ("deviner", "repondre"):
                if not isinstance(s["etapes"][x], bool):
                    D(1, f"{c}/etapes/{x}", "booléen attendu")
            if s["etapes"]["entree"] is not None and not isinstance(s["etapes"]["entree"], bool):
                D(1, c + "/etapes/entree", "booléen ou null attendu")
        _forme_coups(D, s["coups"], c + "/coups")
        if s["attente"] is not None and _cles(D, s["attente"], c + "/attente", ["lectures"]):
            if not isinstance(s["attente"]["lectures"], list):
                D(1, c + "/attente/lectures", "tableau attendu")
            else:
                for n, l in enumerate(s["attente"]["lectures"]):
                    if _cles(D, l, f"{c}/attente/lectures/{n}", ["heure"]):
                        if not isinstance(l["heure"], str) or not RE_HEURE.fullmatch(l["heure"]):
                            D(1, f"{c}/attente/lectures/{n}/heure", f"heure mal écrite : {l['heure']!r}")
    if not isinstance(j["sauts"], list):
        D(1, "/sauts", "tableau attendu")
    else:
        for i, s in enumerate(j["sauts"]):
            _forme_saut(D, s, f"/sauts/{i}")
    if not isinstance(j["copies"], list):
        D(1, "/copies", "tableau attendu")
    else:
        for i, cp in enumerate(j["copies"]):
            c = f"/copies/{i}"
            if _cles(D, cp, c, ["coups", "etapes", "jour", "sauts", "versions"]) and _ent(cp["jour"]):
                _forme_coups(D, cp["coups"], c + "/coups")
                if cp["etapes"] is not None:
                    _cles(D, cp["etapes"], c + "/etapes", ["deviner", "entree", "repondre"])
                if not isinstance(cp["sauts"], list):
                    D(1, c + "/sauts", "tableau attendu")
                else:
                    for n, s in enumerate(cp["sauts"]):
                        _forme_saut(D, s, f"{c}/sauts/{n}")
    if j["arret"] is not None and _cles(D, j["arret"], "/arret", ["f2", "jour", "raison"]):
        a = j["arret"]
        if not _ent(a["jour"]):
            D(1, "/arret/jour", "entier attendu")
        if a["raison"] is not None and a["raison"] not in CODES["raison"]:
            D(14, "/arret/raison", f"code non permis : {a['raison']!r}")
        if a["f2"] is not None and a["f2"] not in CODES["f2"]:
            D(14, "/arret/f2", f"code non permis : {a['f2']!r}")
    cles_fin = ["avis", "barre", "f2", "portrait", "raisons", "regle", "servi", "suspense"]
    if j["fin"] is not None and _cles(D, j["fin"], "/fin", cles_fin):
        for k in cles_fin:
            v = j["fin"][k]
            if v is not None and v not in CODES[k]:
                D(14, f"/fin/{k}", f"code non permis : {v!r}")
    for chemin, s in _chaines(j):
        if unicodedata.normalize("NFC", s) != s:
            D(1, chemin, "chaîne pas en NFC")
        if any(unicodedata.category(ch) == "Cc" for ch in s):
            D(1, chemin, "caractère de contrôle")
    return not D


# ------------------------------------------------------------------ validité (règles 2 à 15)

def valider(j, scelle, empreinte, confusables=None):
    """Rend (défauts [(règle, chemin, message)], informations). `confusables` : octets
    de confusables.txt, ou None (règle 6 alors partielle, dit dans les informations)."""
    D = Defauts()
    info = []
    table = None
    if confusables is not None:
        from .tirage import sha256_hex
        table, version, n = table_confusables(confusables)
        info.append(f"confusables.txt : {version or 'version non lue'} ; SHA-256 {sha256_hex(confusables)} ; "
                    f"{n} lignes, {len(table)} caractères gardés (une seule lettre latine de base) ; "
                    f"base Unicode de Python : {unicodedata.unidata_version}")
    else:
        info.append("confusables.txt non fourni : la règle 6 (squelette) n'est vérifiée qu'en minuscules")
    if not forme(D, j, empreinte):
        return D.liste, info
    cal = {o["jour"]: o for o in scelle["calendrier"]}
    mode = j["partie"]["mode"]
    jours = j["jours"]
    # 2. Partie
    pid, gr = j["partie"]["id"], j["partie"]["graine"]
    if re.fullmatch(r"[a-z]", pid):
        if gr is not None:
            D(2, "/partie/graine", "partie témoin : graine null attendue")
    elif re.fullmatch(r"hasard-[0-9]{3}", pid):
        if not isinstance(gr, str) or not RE_HEX16.fullmatch(gr):
            D(2, "/partie/graine", "partie au hasard : hex16 attendue")
    elif pid == "porteur":
        if gr is not None or mode != "interface":
            D(2, "/partie", "journal tiré de l'état de la page : graine null et mode interface")
    else:
        D(2, "/partie/id", f"identifiant inattendu : {pid!r}")
    if mode == "moteur" and j["copies"]:
        D(2, "/copies", "mode moteur : copies vide")
    # 3. Jours atteints
    cles = sorted(jours, key=lambda k: int(k) if re.fullmatch(r"[1-9][0-9]*", k) else 99)
    K = len(jours)
    if cles != [str(i) for i in range(1, K + 1)] or K > 15:
        D(3, "/jours", f"clés {cles} (attendu : « 1 » à « K », sans trou, K ≤ 15)")
        return D.liste, info
    if (j["fin"] is None) == (j["arret"] is None):
        D(3, "", "exactement l'un de fin et arret doit être non nul")
    if j["fin"] is not None and K != 15:
        D(3, "/fin", "fin n'existe que si K = 15")
    if j["arret"] is not None and (j["arret"]["jour"] != K or K > 14):
        D(3, "/arret/jour", f"{j['arret']['jour']} (attendu : K = {K} ≤ 14)")
    sauts = {s["numero"]: s for s in j["sauts"]}
    if [s["numero"] for s in j["sauts"]] != list(range(1, len(j["sauts"]) + 1)):
        D(13, "/sauts", "numéros 1 puis 2 attendus, dans l'ordre")
    co = {k: jours[str(k)]["coups"] for k in range(1, K + 1)}
    for k in range(1, K):
        t = cal[k]["type"]
        c = co[k]
        ok = True
        if t == "joue":
            ok = c["reponse"] is not None or c["abandon"] is True
            if k == 1 and c["abandon"] is True and c["compte"] is None:
                ok = False
        elif t == "joue_puis_saut":
            ok = cal[k]["saut"] in sauts and c["reponse"] is not None
        elif t == "saute":
            ok = c["reponse"] is not None
        if not ok:
            D(3, f"/jours/{k + 1}", f"jour {k + 1} atteint alors que le jour {k} ({t}) n'est pas fini")
    # 4. Ouvertures
    prec = None
    for k in range(1, K + 1):
        t = cal[k]["type"]
        o = jours[str(k)]["ouverture"]
        doit = t in ("joue", "joue_puis_saut", "cloture")
        exception = (o is None and doit and j["arret"] is not None and j["arret"]["jour"] == k
                     and t == "joue" and k > 1 and cal[k - 1]["type"] == "saute")
        if doit and o is None and not exception:
            D(4, f"/jours/{k}/ouverture", "ouverture attendue (jour joué, point de saut ou clôture)")
        if exception:
            # Règle 4 (schéma 2, partie 4.4) : état exact du jour de reprise atteint sans ouverture.
            jk = jours[str(k)]
            c = jk["coups"]
            if jk["versions"] is not None:
                D(4, f"/jours/{k}/versions", "jour de reprise sans ouverture : null attendu")
            if mode == "interface" and jk["etapes"] != {"deviner": False, "entree": None, "repondre": False}:
                D(4, f"/jours/{k}/etapes", "jour de reprise sans ouverture : {deviner: false, entree: null, repondre: false}")
            if c["abandon"] is not False or c["relire"] or c["rouvrir"] or any(c["ouvert"][x] for x in CLES_OUVERT):
                D(4, f"/jours/{k}/coups", "jour de reprise sans ouverture : abandon false, relire, rouvrir et ouvert à 0")
            if any(v is not None for v in c["carnet"].values()):
                D(4, f"/jours/{k}/coups/carnet", "jour de reprise sans ouverture : les quatre clés valent null")
        if not doit and o is not None:
            D(4, f"/jours/{k}/ouverture", "pas d'ouverture un jour sauté")
        if o is None:
            continue
        try:
            _, _, utc = lire_instant(o)
        except ValueError as e:
            D(4, f"/jours/{k}/ouverture", str(e))
            continue
        if prec is not None and utc < prec:
            D(4, f"/jours/{k}/ouverture", "antérieure à l'ouverture précédente")
        prec = utc
    for n, s in sauts.items():
        point = next(o["jour"] for o in scelle["calendrier"] if o["saut"] == n and o["type"] == "joue_puis_saut")
        reprise = next(o["jour"] for o in scelle["calendrier"] if o["jour"] > point and o["type"] == "joue")
        if point > K:
            D(13, f"/sauts/{n - 1}", f"saut {n} confirmé sans que le jour {point} soit atteint")
            continue
        try:
            _, _, dep = lire_instant(s["depart"])
        except ValueError:
            continue
        o1 = jours[str(point)]["ouverture"]
        if o1 is not None and dep < lire_instant(o1)[2]:
            D(4, f"/sauts/{n - 1}/depart", "antérieur à l'ouverture du point de saut")
        if reprise <= K and jours[str(reprise)]["ouverture"] is not None \
                and dep > lire_instant(jours[str(reprise)]["ouverture"])[2]:
            D(4, f"/sauts/{n - 1}/depart", "postérieur à l'ouverture du jour de reprise")
    # 5. Versions
    dernier = None
    for k in range(1, K + 1):
        s = jours[str(k)]
        vs = s["versions"]
        if mode == "interface":
            if (vs is not None) != (s["ouverture"] is not None):
                D(5, f"/jours/{k}/versions", "non nulles exactement là où l'ouverture l'est")
        elif vs is not None:
            D(5, f"/jours/{k}/versions", "mode moteur : null attendu")
        if not vs:
            if vs == []:
                D(5, f"/jours/{k}/versions", "tableau vide")
            continue
        if any(v < 1 for v in vs):
            D(5, f"/jours/{k}/versions", "versions inférieures à 1")
        if any(b <= a for a, b in zip(vs, vs[1:])):
            D(5, f"/jours/{k}/versions", "pas strictement croissantes")
        if dernier is not None and vs[0] < dernier:
            D(5, f"/jours/{k}/versions/0", "inférieure à la dernière du jour précédent")
        dernier = vs[-1]
    # Présence des coups selon le jour (partie 4.3.3)
    for k in range(1, K + 1):
        c = co[k]
        t = cal[k]["type"]
        ch = f"/jours/{k}/coups"
        if k != 1:
            for x in ("pseudo", "consentement", "entree", "compte"):
                if c[x] is not None:
                    D(1, f"{ch}/{x}", "n'existe qu'au jour 1")
        elif c["entree"] is None:
            D(1, ch + "/entree", "objet attendu au jour 1")
        if (t == "joue") != (c["abandon"] is not None):
            D(1, ch + "/abandon", "booléen aux jours joués, null ailleurs")
    # 6. Entrée
    c1 = co[1]
    ent = c1["entree"]
    prec_ok = True
    for e in ENTREE:
        x = ent[e]
        if x["reponse"] is not None and not prec_ok:
            D(6, f"/jours/1/coups/entree/{e}/reponse", "réponse sans réponse et pari au texte précédent")
        if x["pari"] is not None and x["reponse"] is None:
            D(6, f"/jours/1/coups/entree/{e}/pari", "pari sans réponse")
        prec_ok = x["reponse"] is not None and x["pari"] is not None
    if any(ent[e]["reponse"] is not None for e in ENTREE) and c1["consentement"] is not True:
        D(6, "/jours/1/coups/consentement", "true attendu dès qu'une réponse existe")
    if (c1["pseudo"] is None) != (c1["compte"] is None):
        D(6, "/jours/1/coups", "pseudo et compte sont nuls ou non nuls ensemble")
    if c1["pseudo"] is not None:
        if not all(ent[e]["pari"] is not None for e in ENTREE):
            D(6, "/jours/1/coups/pseudo", "pseudo avant les trois paris")
        why = pseudo_conforme(c1["pseudo"], table)
        if why:
            D(6, "/jours/1/coups/pseudo", why)
    if (c1["deviner"] is not None or c1["reponse"] is not None) and c1["compte"] is None:
        D(6, "/jours/1/coups", "Deviner ou une réponse au jour 1 sans compte")
    # 7. Deviner (cartes servies : calcul propre de C)
    mo = Moteur(scelle, Tirage(scelle["graine"]))
    manches = {}

    def regle7(coups, chemin, k, copie=False):
        dv = coups["deviner"]
        if dv is None:
            return
        if not cal[k]["deviner_porteur"]:
            D(7, chemin + "/deviner", f"Deviner n'existe pas au jour {k}")
            return
        if k not in manches:
            manches[k] = mo.cartes_servies("porteur", k)
        man = manches[k]
        cartes = dv["cartes"]
        if len(cartes) != len(man["cartes"]):
            D(7, chemin + "/deviner/cartes", f"{len(cartes)} éléments pour {len(man['cartes'])} cartes servies")
            return
        des = [x["designe"] for x in cartes if x["designe"] in PERSONNAGES]
        if len(des) != len(set(des)):
            D(7, chemin + "/deviner/cartes", "un personnage désigné deux fois")
        for i, (x, carte) in enumerate(zip(cartes, man["cartes"])):
            if x["raison"] is not None and (not carte["cachee"] or x["designe"] not in PERSONNAGES):
                D(7, f"{chemin}/deviner/cartes/{i}/raison", "raison hors de la carte cachée, ou sans visage")
        if dv["validee"] and any(x["designe"] is None for x in cartes):
            D(7, chemin + "/deviner/validee", "validée avec une carte vide")
        if not dv["validee"] and not copie:
            arret_ici = j["arret"] is not None and j["arret"]["jour"] == k
            if not (coups["abandon"] is True or arret_ici):
                D(7, chemin + "/deviner/validee", "non validée hors d'un jour d'abandon ou d'arrêt")

    for k in range(1, K + 1):
        c = co[k]
        ch = f"/jours/{k}/coups"
        t = cal[k]["type"]
        regle7(c, ch, k)
        # 8. Répondre
        if t == "joue" and c["reponse"] is not None and not (c["deviner"] is not None and c["deviner"]["validee"]):
            D(8, ch + "/reponse", "réponse alors que Deviner n'est pas validé")
        if t == "joue_puis_saut" and c["reponse"] is not None and cal[k]["saut"] not in sauts:
            D(8, ch + "/reponse", "réponse au point de saut sans saut confirmé")
        if c["abandon"] is True and c["reponse"] is not None:
            D(8, ch + "/abandon", "abandon avec une réponse")
        if t == "cloture" and c["reponse"] is not None:
            D(8, ch + "/reponse", "réponse au jour 15")
        # 9. Compteurs
        if c["relire"] > 0 and c["deviner"] is None:
            D(9, ch + "/relire", "Relire sans Deviner")
        if (c["pendant_deviner"] is None) != (c["deviner"] is None):
            D(9, ch + "/pendant_deviner", "non nul exactement quand deviner l'est")
        if c["rouvrir"] != 0 and k not in (2, 3, 7, 14):
            D(9, ch + "/rouvrir", "non nul seulement aux jours 2, 3, 7 et 14")
        if (c["annuler_saut"] is not None) != (t == "joue_puis_saut"):
            D(9, ch + "/annuler_saut", "n'existe qu'aux jours 4 et 8 (points de saut)")
        if t == "joue_puis_saut" and any(c["ouvert"][x] for x in ("cercle", "moi", "proche")):
            D(9, ch + "/ouvert", "point de saut : Le Cercle, Moi et l'écran d'un proche valent 0 (pas accessibles)")
        if t == "saute":
            if c["relire"] or c["rouvrir"] or any(c["ouvert"][x] for x in CLES_OUVERT):
                D(9, ch, "jour sauté : relire, rouvrir et ouvert valent 0")
            if jours[str(k)]["etapes"] is not None or jours[str(k)]["versions"] is not None:
                D(9, f"/jours/{k}", "jour sauté : etapes et versions valent null")
        # 10. Carnet
        _regle10(D, c["carnet"], ch + "/carnet", k, t, cal[k]["nom_jour"], jours[str(k)]["etapes"], mode)
        # 11. Attente
        a = jours[str(k)]["attente"]
        if a is not None:
            if t != "joue" or c["reponse"] is None:
                D(11, f"/jours/{k}/attente", "« En attendant » hors d'un jour joué fini")
            elif not a["lectures"]:
                D(11, f"/jours/{k}/attente/lectures", "au moins une lecture attendue")
        # 12. Étapes
        et = jours[str(k)]["etapes"]
        if mode == "interface":
            if (et is not None) != (t == "joue"):
                D(12, f"/jours/{k}/etapes", "non nulles exactement aux jours joués")
            if et is not None:
                if et["deviner"] != (c["deviner"] is not None):
                    D(12, f"/jours/{k}/etapes/deviner", "vrai si et seulement si coups.deviner n'est pas nul")
                if c["reponse"] is not None and not et["repondre"]:
                    D(12, f"/jours/{k}/etapes/repondre", "vrai attendu : une réponse existe")
                if (et["entree"] is not None) != (k == 1):
                    D(12, f"/jours/{k}/etapes/entree", "booléen au jour 1, null ailleurs")
        elif et is not None:
            D(2, f"/jours/{k}/etapes", "mode moteur : null attendu")
    # 13. Sauts
    for n, s in sauts.items():
        jours_saut = [o["jour"] for o in scelle["calendrier"] if o["saut"] == n]
        nb = len(jours_saut)
        donnees = sum(1 for k in jours_saut if k <= K and co[k]["reponse"] is not None)
        if not 1 <= s["textes_atteints"] <= nb:
            D(13, f"/sauts/{n - 1}/textes_atteints", f"{s['textes_atteints']} hors de 1 à {nb}")
        if not donnees <= s["textes_atteints"] <= donnees + 1:
            D(13, f"/sauts/{n - 1}/textes_atteints",
              f"{s['textes_atteints']} pour {donnees} réponses de rattrapage données")
    # 14. Arrêt et fin
    a = j["arret"]
    if a is not None and a["jour"] < 3 and a["f2"] is not None:
        D(14, "/arret/f2", "null attendu avant le jour 3")
    # 15. Copies
    jprec = 0
    for n, cp in enumerate(j["copies"]):
        ch = f"/copies/{n}"
        k = cp["jour"]
        if not 1 <= k <= min(K, 14):
            D(15, ch + "/jour", f"jour {k} hors de 1 à {min(K, 14)}")
            continue
        if k < jprec:
            D(15, ch + "/jour", "copies pas dans l'ordre du jeu")
        jprec = k
        s = jours[str(k)]
        cc, cs = cp["coups"], s["coups"]
        if mode == "interface":
            if (cp["etapes"] is not None) != (cal[k]["type"] == "joue"):
                D(15, ch + "/etapes", "non nulles exactement aux jours joués")
            if cp["versions"] is not None and s["versions"] is not None:
                if cp["versions"] != s["versions"][:len(cp["versions"])]:
                    D(15, ch + "/versions", "pas un début des versions du jour")
            if cp["etapes"] is not None and s["etapes"] is not None:
                for x in ("deviner", "repondre", "entree"):
                    if cp["etapes"][x] and not s["etapes"][x]:
                        D(15, f"{ch}/etapes/{x}", "vrai dans la copie, faux dans le jour")
        regle7(cc, ch + "/coups", k, copie=True)
        if cc["deviner"] is not None:
            if cs["deviner"] is None or len(cc["deviner"]["cartes"]) != len(cs["deviner"]["cartes"]):
                D(15, ch + "/coups/deviner", "Deviner dans la copie, absent ou différent dans le jour")
            else:
                # S1, règle 14 : le harnais ne défait jamais un geste ; toute valeur posée dans la
                # copie se retrouve, identique, dans l'état final du jour.
                for i2, (x, y) in enumerate(zip(cc["deviner"]["cartes"], cs["deviner"]["cartes"])):
                    for cle in ("designe", "raison"):
                        if x[cle] is not None and x[cle] != y[cle]:
                            D(15, f"{ch}/coups/deviner/cartes/{i2}/{cle}", "différent de l'état final du jour")
                if cc["deviner"]["validee"] and not cs["deviner"]["validee"]:
                    D(15, ch + "/coups/deviner/validee", "validée dans la copie, pas dans le jour")
        if cc["reponse"] is not None and cc["reponse"] != cs["reponse"]:
            D(15, ch + "/coups/reponse", "différente de la réponse du jour")
        for x in ("relire", "rouvrir"):
            if cc[x] > cs[x]:
                D(15, f"{ch}/coups/{x}", "supérieur à celui du jour")
        if k == 1:
            for e in ENTREE:
                for cle in ("reponse", "pari"):
                    v = cc["entree"][e][cle]
                    if v is not None and v != cs["entree"][e][cle]:
                        D(15, f"{ch}/coups/entree/{e}/{cle}", "différent de l'état final du jour")
            for x in ("pseudo", "compte"):
                if cc[x] is not None and cc[x] != cs[x]:
                    D(15, f"{ch}/coups/{x}", "différent de l'état final du jour")
        for i2, sc in enumerate(cp["sauts"]):
            final = sauts.get(sc["numero"])
            if final is None or sc["depart"] != final["depart"] or sc["textes_atteints"] > final["textes_atteints"]:
                D(15, f"{ch}/sauts/{i2}", "saut de la copie absent ou incompatible avec le saut du journal")
        _regle10(D, cc["carnet"], ch + "/coups/carnet", k, cal[k]["type"], cal[k]["nom_jour"],
                 cp["etapes"], mode)
    return D.liste, info


def _regle10(D, q, ch, k, t, nom_jour, etapes, mode):
    joue = t == "joue"
    dimanche = joue and nom_jour == "dimanche"
    if q["moment"] is not None:
        if not joue:
            D(10, ch + "/moment", "n'existe qu'aux jours joués")
        else:
            liste = MOMENTS[1] if k == 1 else (MOMENTS["dimanche"] if dimanche else MOMENTS[2])
            if q["moment"] not in liste:
                D(10, ch + "/moment", f"choix non proposé ce jour-là : {q['moment']!r}")
            elif mode == "interface" and etapes is not None:
                if q["moment"] == "deviner" and not etapes["deviner"]:
                    D(10, ch + "/moment", "« Deviner » sans etapes.deviner")
                if q["moment"] in ("donner_avis", "phrase_jour") and not etapes["repondre"]:
                    D(10, ch + "/moment", f"« {q['moment']} » sans etapes.repondre")
    if q["saut_clair"] is not None and not (dimanche and k == 7):
        D(10, ch + "/saut_clair", "n'existe qu'au jour 7")
    for x in ("hesite", "moment_semaine"):
        if q[x] is not None and not dimanche:
            D(10, f"{ch}/{x}", "n'existe qu'aux jours 7 et 14")
    h = q["hesite"]
    if h is not None:
        idx = [CODES["hesite"].index(x) for x in h]
        if idx != sorted(set(idx)) or not h:
            D(10, ch + "/hesite", "codes distincts, non vides, dans l'ordre de la liste")
        if "nulle_part" in h and len(h) > 1:
            D(10, ch + "/hesite", "« nulle_part » est seul")
