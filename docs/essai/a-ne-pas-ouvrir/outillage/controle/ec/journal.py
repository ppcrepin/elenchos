"""Le journal du harnais : schéma fermé (schéma, parties 3.3, 3.4, 3.12) et
validité (partie 3.12, règles 1 à 14). Un journal invalide n'est pas rejoué : le
rapport donne la règle et le chemin (JSON Pointer)."""

import re
import unicodedata

from . import canon
from .heure import lire_instant, RE_HEURE
from .jeu import PERSONNAGES, TENSIONS, ENTREE
from .moteur import Partie
from .tirage import Tirage, sha256_hex

CODES = {
    "q1": ("aurais_pu", "ne_pouvais_pas", "les_deux"),
    "q2": ("premier_coup", "en_relisant", "pas_tout"),
    "q3": ("revelation", "titres", "phrase_semaine", "deviner", "donner_avis", "phrase_jour", "aucun"),
    "raison": ("pas_amuse", "pas_compris", "pas_le_temps", "vu_assez", "autre"),
    "f2": ("de_plus_en_plus", "toujours_autant", "de_moins_en_moins", "jamais"),
    "f1": ("pole0", "milieu", "pole1"),
}
RE_HEX16 = re.compile(r"[0-9a-f]{16}")
RE_HEX64 = re.compile(r"[0-9a-f]{64}")


class Defauts:
    def __init__(self):
        self.liste = []

    def __call__(self, regle, chemin, msg):
        self.liste.append((regle, chemin, msg))

    def __bool__(self):
        return bool(self.liste)


def _est_entier(v):
    return isinstance(v, int) and not isinstance(v, bool)


def _niveau(v):
    return _est_entier(v) and 1 <= v <= 5


def _raison(v):
    return v == "aucune" or (_est_entier(v) and 1 <= v <= 4)


def _cles(D, obj, chemin, attendues):
    if not isinstance(obj, dict):
        D(1, chemin, "objet attendu")
        return False
    if set(obj) != set(attendues):
        D(1, chemin, f"clés {sorted(obj)} (attendu : {sorted(attendues)})")
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


def _forme_coups(D, c, chemin, k):
    if not _cles(D, c, chemin, ["carnet", "consentement", "deviner", "entree", "pseudo", "relire", "reponse"]):
        return False
    if c["pseudo"] is not None and not isinstance(c["pseudo"], str):
        D(1, chemin + "/pseudo", "chaîne ou null attendue")
    if c["consentement"] not in (True, None):
        D(1, chemin + "/consentement", "true ou null attendu")
    if not _est_entier(c["relire"]) or c["relire"] < 0:
        D(1, chemin + "/relire", "entier positif attendu")
    _reponse(D, c["reponse"], chemin + "/reponse")
    if _cles(D, c["carnet"], chemin + "/carnet", ["q1", "q2", "q3"]):
        for q in ("q1", "q2", "q3"):
            v = c["carnet"][q]
            if v is not None and v not in CODES[q]:
                D(1, f"{chemin}/carnet/{q}", f"code non permis : {v!r}")
    if c["entree"] is not None:
        if _cles(D, c["entree"], chemin + "/entree", list(ENTREE)):
            for e in ENTREE:
                ce = f"{chemin}/entree/{e}"
                if _cles(D, c["entree"][e], ce, ["pari", "reponse"]):
                    _reponse(D, c["entree"][e]["reponse"], ce + "/reponse")
                    p = c["entree"][e]["pari"]
                    if p is not None and not _niveau(p):
                        D(1, ce + "/pari", f"niveau non permis : {p!r}")
    if c["deviner"] is not None:
        if not isinstance(c["deviner"], list):
            D(1, chemin + "/deviner", "tableau attendu")
        else:
            for i, x in enumerate(c["deviner"]):
                ci = f"{chemin}/deviner/{i}"
                if _cles(D, x, ci, ["designe", "raison"]):
                    if x["designe"] not in PERSONNAGES + ("passe", None):
                        D(1, ci + "/designe", f"valeur non permise : {x['designe']!r}")
                    if x["raison"] is not None and not _raison(x["raison"]):
                        D(1, ci + "/raison", f"valeur non permise : {x['raison']!r}")
    # présence (partie 3.4)
    if k != 0:
        for cle in ("pseudo", "consentement", "entree"):
            if c[cle] is not None:
                D(1, f"{chemin}/{cle}", "n'existe qu'à la séance 0")
    elif c["entree"] is None:
        D(1, chemin + "/entree", "objet attendu à la séance 0")
    if (2 <= k <= 14) != (c["deviner"] is not None):
        D(1, chemin + "/deviner", "présent aux séances 2 à 14 seulement")
    if not 1 <= k <= 14 and c["reponse"] is not None:
        D(1, chemin + "/reponse", "réponse hors des séances 1 à 14")
    return True


def _forme_f1(D, f1, chemin):
    if f1 is None:
        return
    if _cles(D, f1, chemin, list(PERSONNAGES)):
        for p in PERSONNAGES:
            if _cles(D, f1[p], f"{chemin}/{p}", list(TENSIONS)):
                for t in TENSIONS:
                    v = f1[p][t]
                    if v is not None and v not in CODES["f1"]:
                        D(13, f"{chemin}/{p}/{t}", f"code non permis : {v!r}")


def forme(D, j, empreinte):
    """Règle 1 (forme), sur l'objet déjà relu."""
    if not _cles(D, j, "", ["arret", "copies", "empreinte_scelle", "fin", "format", "partie", "seances", "version"]):
        return False
    if j["format"] != "elenchos-essai-journal":
        D(1, "/format", f"format inattendu : {j['format']!r}")
    if j["version"] != 3 or not _est_entier(j["version"]):
        D(1, "/version", f"version {j['version']!r} (attendu : 3)")
    if not isinstance(j["empreinte_scelle"], str) or not RE_HEX64.fullmatch(j["empreinte_scelle"]):
        D(1, "/empreinte_scelle", "hex64 attendu")
    elif j["empreinte_scelle"] != empreinte:
        D(1, "/empreinte_scelle", f"{j['empreinte_scelle']} ≠ SHA-256 du fichier scellé donné ({empreinte})")
    if _cles(D, j["partie"], "/partie", ["graine", "id", "mode"]):
        if j["partie"]["mode"] not in ("interface", "moteur"):
            D(1, "/partie/mode", "« interface » ou « moteur » attendu")
        if not isinstance(j["partie"]["id"], str):
            D(1, "/partie/id", "chaîne attendue")
    if not isinstance(j["seances"], list) or not j["seances"]:
        D(1, "/seances", "tableau non vide attendu")
        return False
    for i, s in enumerate(j["seances"]):
        c = f"/seances/{i}"
        if not _cles(D, s, c, ["attente", "coups", "etapes", "k", "ouverture", "versions"]):
            continue
        if not _est_entier(s["k"]):
            D(1, c + "/k", "entier attendu")
            continue
        if s["versions"] is not None and (not isinstance(s["versions"], list)
                                          or not all(_est_entier(v) for v in s["versions"])):
            D(1, c + "/versions", "tableau d'entiers ou null attendu")
        if s["etapes"] is not None and _cles(D, s["etapes"], c + "/etapes", ["deviner", "repondre"]):
            for x in ("deviner", "repondre"):
                if not isinstance(s["etapes"][x], bool):
                    D(1, f"{c}/etapes/{x}", "booléen attendu")
        _forme_coups(D, s["coups"], c + "/coups", s["k"])
        if s["attente"] is not None and _cles(D, s["attente"], c + "/attente", ["lectures"]):
            if not isinstance(s["attente"]["lectures"], list):
                D(1, c + "/attente/lectures", "tableau attendu")
            else:
                for n, l in enumerate(s["attente"]["lectures"]):
                    if _cles(D, l, f"{c}/attente/lectures/{n}", ["heure"]):
                        if not isinstance(l["heure"], str) or not RE_HEURE.fullmatch(l["heure"]):
                            D(1, f"{c}/attente/lectures/{n}/heure", f"heure mal écrite : {l['heure']!r}")
    if not isinstance(j["copies"], list):
        D(1, "/copies", "tableau attendu")
    else:
        for i, cp in enumerate(j["copies"]):
            c = f"/copies/{i}"
            if _cles(D, cp, c, ["coups", "etapes", "k", "versions"]) and _est_entier(cp["k"]):
                _forme_coups(D, cp["coups"], c + "/coups", cp["k"])
                if cp["etapes"] is not None:
                    _cles(D, cp["etapes"], c + "/etapes", ["deviner", "repondre"])
    if j["arret"] is not None and _cles(D, j["arret"], "/arret", ["f1", "f2", "k", "raison"]):
        a = j["arret"]
        if a["raison"] is not None and a["raison"] not in CODES["raison"]:
            D(13, "/arret/raison", f"code non permis : {a['raison']!r}")
        if a["f2"] is not None and a["f2"] not in CODES["f2"]:
            D(13, "/arret/f2", f"code non permis : {a['f2']!r}")
        _forme_f1(D, a["f1"], "/arret/f1")
    if j["fin"] is not None and _cles(D, j["fin"], "/fin", ["f1", "f2"]):
        if j["fin"]["f2"] is not None and j["fin"]["f2"] not in CODES["f2"]:
            D(13, "/fin/f2", f"code non permis : {j['fin']['f2']!r}")
        _forme_f1(D, j["fin"]["f1"], "/fin/f1")
    for chemin, s in _chaines(j):
        if unicodedata.normalize("NFC", s) != s:
            D(1, chemin, "chaîne pas en NFC")
        if any(unicodedata.category(ch) == "Cc" for ch in s):
            D(1, chemin, "caractère de contrôle")
    return not D


def _chaines(o, c=""):
    if isinstance(o, str):
        yield c, o
    elif isinstance(o, list):
        for i, x in enumerate(o):
            yield from _chaines(x, f"{c}/{i}")
    elif isinstance(o, dict):
        for k, v in o.items():
            yield from _chaines(v, f"{c}/{k}")


def choix_q3(k, etapes):
    """Choix proposés à la question 3 (simulation, §8.3, après 3553b2e)."""
    if k == 0:
        return {"donner_avis", "deviner", "revelation", "aucun"}
    if k == 15:
        return set()
    dev = rep = True
    if etapes is not None:
        dev, rep = etapes["deviner"], etapes["repondre"]
    out = {"aucun"}
    if k >= 3:
        out.add("revelation")
    if k in (7, 14):
        out |= {"titres", "phrase_semaine"}
    if dev and k >= 2:
        out.add("deviner")
    if rep:
        out |= {"donner_avis", "phrase_jour"}
    return out


def pseudo_conforme(p):
    """§7.2 : forme NFC, sans Cc ni Cf, blancs ramenés à une espace, sans espace
    double ni au bord, 1 à 20 points de code, pas un prénom (capitales non comptées)."""
    if not isinstance(p, str) or not 1 <= len(p) <= 20:
        return "longueur hors de 1 à 20 caractères"
    if unicodedata.normalize("NFC", p) != p:
        return "pas en NFC"
    if any(unicodedata.category(ch) in ("Cc", "Cf") for ch in p):
        return "caractère invisible (Cc ou Cf)"
    if any(ch.isspace() and ch != " " for ch in p) or "  " in p or p != p.strip(" "):
        return "blancs non ramenés à une espace, espace double ou au bord"
    if p.casefold() in {x.casefold() for x in PERSONNAGES}:
        return "prénom d'un personnage"
    return None


def valider(j, scelle, empreinte):
    """Rend la liste des défauts [(règle, chemin, message)] ; vide si le journal est valide.
    `scelle` : fichier scellé relu."""
    D = Defauts()
    if not forme(D, j, empreinte):
        return D.liste
    mode = j["partie"]["mode"]
    seances = j["seances"]
    K = len(seances) - 1
    # 2. Partie
    pid, gr = j["partie"]["id"], j["partie"]["graine"]
    if re.fullmatch(r"[a-z]", pid):
        if gr is not None:
            D(2, "/partie/graine", "partie témoin : graine null attendue")
    elif re.fullmatch(r"hasard-[0-9]{3}", pid):
        if not isinstance(gr, str) or not RE_HEX16.fullmatch(gr):
            D(2, "/partie/graine", "partie au hasard : hex16 attendue")
    else:
        D(2, "/partie/id", f"identifiant inattendu : {pid!r}")
    for i, s in enumerate(seances):
        if mode == "moteur":
            if s["versions"] is not None or s["etapes"] is not None:
                D(2, f"/seances/{i}", "mode moteur : versions et etapes valent null")
        else:
            if not isinstance(s["versions"], list) or not s["versions"]:
                D(2, f"/seances/{i}/versions", "mode interface : tableau non vide attendu")
            attendu = 1 <= s["k"] <= 14
            if (s["etapes"] is not None) != attendu:
                D(12, f"/seances/{i}/etapes", "objet aux séances 1 à 14, null aux séances 0 et 15")
    if mode == "moteur" and j["copies"]:
        D(2, "/copies", "mode moteur : copies vide")
    # 3. Calendrier
    for i, s in enumerate(seances):
        if s["k"] != i:
            D(3, f"/seances/{i}/k", f"séance {s['k']} à l'indice {i}")
    if K > 15:
        D(3, "/seances", "plus de 16 séances")
    if (j["fin"] is None) == (j["arret"] is None):
        D(3, "", "exactement l'un de fin et arret doit être non nul")
    if j["fin"] is not None and K != 15:
        D(3, "/fin", "fin n'existe que si la dernière séance est la 15")
    if j["arret"] is not None:
        if j["arret"]["k"] != K:
            D(3, "/arret/k", f"{j['arret']['k']} ≠ dernière séance {K}")
        if K == 15:
            D(3, "/arret", "pas d'arrêt à la clôture")
    if D:
        return D.liste
    # 4. Ouvertures
    prec = None
    for i, s in enumerate(seances):
        try:
            _, _, utc = lire_instant(s["ouverture"])
        except ValueError as e:
            D(4, f"/seances/{i}/ouverture", str(e))
            continue
        if prec is not None and utc < prec:
            D(4, f"/seances/{i}/ouverture", "antérieure à l'ouverture précédente")
        prec = utc
    # 5. Versions
    dernier = None
    for i, s in enumerate(seances):
        vs = s["versions"]
        if vs is None:
            continue
        if any(v < 1 for v in vs):
            D(5, f"/seances/{i}/versions", "versions inférieures à 1")
        if any(b <= a for a, b in zip(vs, vs[1:])):
            D(5, f"/seances/{i}/versions", "pas strictement croissantes")
        if dernier is not None and vs and vs[0] < dernier:
            D(5, f"/seances/{i}/versions/0", "inférieure à la dernière de la séance précédente")
        if vs:
            dernier = vs[-1]
    # 6. Entrée
    c0 = seances[0]["coups"]
    ent = c0["entree"]
    prec_ok = True
    for e in ENTREE:
        x = ent[e]
        if x["reponse"] is not None and not prec_ok:
            D(6, f"/seances/0/coups/entree/{e}/reponse", "réponse sans réponse et pari au texte précédent")
        if x["pari"] is not None and x["reponse"] is None:
            D(6, f"/seances/0/coups/entree/{e}/pari", "pari sans réponse")
        prec_ok = x["reponse"] is not None and x["pari"] is not None
    if any(ent[e]["reponse"] is not None for e in ENTREE) and c0["consentement"] is not True:
        D(6, "/seances/0/coups/consentement", "true attendu dès qu'une réponse existe")
    if c0["pseudo"] is not None:
        if not all(ent[e]["pari"] is not None for e in ENTREE):
            D(6, "/seances/0/coups/pseudo", "pseudo avant les trois paris")
        why = pseudo_conforme(c0["pseudo"])
        if why:
            D(6, "/seances/0/coups/pseudo", why)
    if K >= 1 and c0["pseudo"] is None:
        D(6, "/seances/0/coups/pseudo", "séance 1 atteinte sans pseudo")
    # Manches du joueur (ne dépendent que du fichier), pour les règles 7, 8 et 10.
    partie = Partie(scelle, Tirage(scelle["graine"]))
    manches = {k: partie.cartes_servies("porteur", k) for k in range(2, min(K, 14) + 1)}

    def regle7(coups, chemin, k):
        dv = coups["deviner"]
        man = manches[k]
        if len(dv) != len(man["cartes"]):
            D(7, chemin + "/deviner", f"{len(dv)} éléments pour {len(man['cartes'])} cartes servies")
            return False
        des = [x["designe"] for x in dv if x["designe"] in PERSONNAGES]
        if len(des) != len(set(des)):
            D(7, chemin + "/deviner", "un personnage désigné deux fois")
        for i, (x, carte) in enumerate(zip(dv, man["cartes"])):
            if x["raison"] is not None and (not carte["cachee"] or x["designe"] not in PERSONNAGES):
                D(7, f"{chemin}/deviner/{i}/raison", "raison hors de la carte cachée, ou sans visage")
        if any(x["designe"] is None for x in dv) and any(x["designe"] is not None or x["raison"] is not None for x in dv):
            D(7, chemin + "/deviner", "manche non validée : toutes les designe et raison valent null")
        return True

    def validee(coups, k):
        if k == 1:
            return True
        dv = coups["deviner"]
        return all(x["designe"] is not None for x in dv)

    verdicts = {}
    for i, s in enumerate(seances):
        k = s["k"]
        c = s["coups"]
        ch = f"/seances/{i}/coups"
        if 2 <= k <= 14:
            if regle7(c, ch, k):
                verdicts[k] = verdicts_joueur(manches[k], c["deviner"])
        # 8. Répondre
        if 1 <= k <= 14 and c["reponse"] is not None and 2 <= k and not validee(c, k):
            D(8, ch + "/reponse", "réponse alors que Deviner n'est pas validé")
        # 9. Relire
        if not 2 <= k <= 14 and c["relire"] != 0:
            D(9, ch + "/relire", "Relire hors des séances 2 à 14")
    for i, s in enumerate(seances):
        k = s["k"]
        c = s["coups"]
        ch = f"/seances/{i}/coups/carnet"
        q = c["carnet"]
        faux = faux_entree(ent, scelle) if k == 0 else \
            sum(1 for v in verdicts.get(k - 1, []) if v == "faux")
        _regle10(D, q, ch, k, s["etapes"], c0["pseudo"], faux, mode)
        # 11. Attente
        finie = 1 <= k <= 14 and c["reponse"] is not None and (k == 1 or (k in verdicts and validee(c, k)))
        if s["attente"] is not None:
            if not finie:
                D(11, f"/seances/{i}/attente", "« En attendant » hors d'une journée finie")
            elif not s["attente"]["lectures"]:
                D(11, f"/seances/{i}/attente/lectures", "au moins une lecture attendue")
        # 12. Étapes
        if mode == "interface" and s["etapes"] is not None:
            et = s["etapes"]
            if k == 1 and et["deviner"]:
                D(12, f"/seances/{i}/etapes/deviner", "faux attendu à la séance 1")
            if c["deviner"] and any(x["designe"] is not None for x in c["deviner"]) and not et["deviner"]:
                D(12, f"/seances/{i}/etapes/deviner", "vrai attendu : une designe est non nulle")
            if c["reponse"] is not None and not et["repondre"]:
                D(12, f"/seances/{i}/etapes/repondre", "vrai attendu : une réponse existe")
    # 13. Arrêt et fin
    a = j["arret"]
    if a is not None and a["k"] < 3 and (a["f2"] is not None or a["f1"] is not None):
        D(13, "/arret", "f2 et f1 valent null avant le jour 3")
    if j["fin"] is not None and j["fin"]["f1"] is None:
        D(13, "/fin/f1", "toujours un objet à la clôture")
    # 14. Copies
    kprec = -1
    for n, cp in enumerate(j["copies"]):
        ch = f"/copies/{n}"
        k = cp["k"]
        if not 0 <= k <= min(K, 14):
            D(14, ch + "/k", f"séance {k} hors de 0 à {min(K, 14)} (pas de copie en cours d'essai à la clôture)")
            continue
        if k < kprec:
            D(14, ch + "/k", "copies pas dans l'ordre du jeu")
        kprec = k
        s = seances[k]
        cc, cs = cp["coups"], s["coups"]
        if mode == "interface":
            if (cp["etapes"] is not None) != (1 <= k <= 14):
                D(14, ch + "/etapes", "objet aux séances 1 à 14, null aux séances 0 et 15")
            if not isinstance(cp["versions"], list) or not cp["versions"]:
                D(14, ch + "/versions", "tableau non vide attendu")
            elif cp["versions"] != s["versions"][:len(cp["versions"])]:
                D(14, ch + "/versions", "pas un début des versions de la séance")
            if cp["etapes"] is not None and s["etapes"] is not None:
                for x in ("deviner", "repondre"):
                    if cp["etapes"][x] and not s["etapes"][x]:
                        D(14, f"{ch}/etapes/{x}", "vrai dans la copie, faux dans la séance")
        if 2 <= k <= 14:
            regle7(cc, ch + "/coups", k)
            for i2, (x, y) in enumerate(zip(cc["deviner"], cs["deviner"])):
                for cle in ("designe", "raison"):
                    if x[cle] is not None and x[cle] != y[cle]:
                        D(14, f"{ch}/coups/deviner/{i2}/{cle}", "différent de l'état final de la séance")
        if cc["reponse"] is not None and cc["reponse"] != cs["reponse"]:
            D(14, ch + "/coups/reponse", "différente de la réponse de la séance")
        if cc["relire"] > cs["relire"]:
            D(14, ch + "/coups/relire", "supérieur à celui de la séance")
        if k == 0:
            for e in ENTREE:
                for cle in ("reponse", "pari"):
                    v = cc["entree"][e][cle]
                    if v is not None and v != cs["entree"][e][cle]:
                        D(14, f"{ch}/coups/entree/{e}/{cle}", "différent de l'état final de la séance")
            if cc["pseudo"] is not None and cc["pseudo"] != cs["pseudo"]:
                D(14, ch + "/coups/pseudo", "différent du pseudo de la séance")
        faux = faux_entree(cc["entree"], scelle) if k == 0 else \
            sum(1 for v in verdicts.get(k - 1, []) if v == "faux")
        _regle10(D, cc["carnet"], ch + "/coups/carnet", k, cp["etapes"],
                 cc["pseudo"] if k == 0 else c0["pseudo"], faux, mode)
    return D.liste


def _regle10(D, q, ch, k, etapes, pseudo, faux, mode):
    """Règle 10. faux : nombre de « Ça alors ! » à la révélation de la séance
    (à la séance 0 : paris faux)."""
    nn = {x: q[x] is not None for x in ("q1", "q2", "q3")}
    if k == 0 and any(nn.values()) and pseudo is None:
        D(10, ch, "questions du carnet avant 1.9 (pseudo nul)")
    if k == 15 and (nn["q2"] or nn["q3"]):
        D(10, ch, "à la séance 15, seule q1 peut être non nulle")
    if 1 <= k <= 14 and nn["q2"] and mode == "interface" and not (etapes or {}).get("repondre"):
        D(10, ch + "/q2", "q2 sans affichage de l'écran Répondre")
    if nn["q1"]:
        if faux < 1:
            D(10, ch + "/q1", "q1 sans « Ça alors ! » à la révélation de la séance")
        elif q["q1"] == "les_deux" and faux < 2:
            D(10, ch + "/q1", "« Les deux » avec moins de deux erreurs")
    if nn["q3"] and q["q3"] not in choix_q3(k, etapes if mode == "interface" else None):
        D(10, ch + "/q3", f"choix non proposé à cette séance : {q['q3']!r}")


def faux_entree(entree, scelle):
    from .jeu import cote
    n = 0
    for e in ENTREE:
        p = entree[e]["pari"]
        if p is not None and cote(p) != cote(scelle["reponses"][e]["Agathe"]["niveau"]):
            n += 1
    return n


def verdicts_joueur(man, deviner):
    """Verdicts du joueur sur une manche (redistribution comprise), sans le moteur complet."""
    import copy
    m = copy.deepcopy(man)
    for carte, d in zip(m["cartes"], deviner):
        carte["designe"] = d["designe"]
        carte["raison_devinee"] = d["raison"] if carte["cachee"] else None
    Partie.redistribuer(m)
    out = []
    for c in m["cartes"]:
        if c["designe"] in (None, "passe"):
            out.append("passe")
        elif c["designe"] != c["auteur_compte"]:
            out.append("faux")
        elif c["cachee"] and c["raison_devinee"] is not None and c["raison_devinee"] == c["_raison"]:
            out.append("juste_et_raison")
        else:
            out.append("juste")
    return out
