"""Schéma fermé de la trace, version 3 (schéma, parties 3.2 à 3.10). Sert à valider
la trace de C et celle de la page avant toute comparaison : une erreur de forme
apparaît alors comme telle, et non comme mille différences."""

import re
from fractions import Fraction

from .jeu import MEMBRES, PERSONNAGES, TENSIONS, TEXTES, ENTREE
from .journal import CODES, _forme_coups, Defauts
from .heure import RE_HEURE, lire_instant

RE_FRAC = re.compile(r"-?(?:0|[1-9][0-9]*)(?:/[1-9][0-9]*)?")


class V:
    def __init__(self):
        self.e = []

    def err(self, c, m):
        self.e.append(f"{c} : {m}")

    def cles(self, o, c, att):
        if not isinstance(o, dict):
            self.err(c, "objet attendu")
            return False
        if set(o) != set(att):
            self.err(c, f"clés {sorted(o)} ≠ {sorted(att)}")
            return False
        return True

    def frac(self, v, c):
        if not isinstance(v, str) or not RE_FRAC.fullmatch(v) or str(Fraction(v)) != v:
            self.err(c, f"fraction mal écrite : {v!r}")

    def entier(self, v, c, nul=False):
        if v is None and nul:
            return
        if not isinstance(v, int) or isinstance(v, bool):
            self.err(c, f"entier attendu : {v!r}")

    def dans(self, v, c, valeurs):
        if not any((x is None and v is None) or (x is not None and type(x) is type(v) and x == v)
                   for x in valeurs):
            self.err(c, f"valeur non permise : {v!r}")

    def liste(self, v, c, f=None):
        if not isinstance(v, list):
            self.err(c, "tableau attendu")
            return []
        if f:
            for i, x in enumerate(v):
                f(x, f"{c}/{i}")
        return v


def _raison(v):
    return v == "aucune" or (isinstance(v, int) and not isinstance(v, bool) and 1 <= v <= 4)


def valider_trace(t):
    v = V()
    if not v.cles(t, "", ["agregats", "arret", "carnet", "copies", "empreinte_scelle", "fin", "format",
                          "partie", "seances", "version"]):
        return v.e
    if t["format"] != "elenchos-essai-trace" or t["version"] != 3:
        v.err("", "format ou version inattendus")
    if not isinstance(t["empreinte_scelle"], str) or not re.fullmatch(r"[0-9a-f]{64}", t["empreinte_scelle"]):
        v.err("/empreinte_scelle", "hex64 attendu")
    v.cles(t["partie"], "/partie", ["graine", "id", "mode"])
    moteur = isinstance(t["partie"], dict) and t["partie"].get("mode") == "moteur"
    for i, s in enumerate(v.liste(t["seances"], "/seances")):
        _seance(v, s, f"/seances/{i}", i, moteur)
    ag = t["agregats"]
    if v.cles(ag, "/agregats", ["justesse_personnages_entre_eux", "justesse_personnages_sur_porteur",
                                 "titres_tires_au_sort"]):
        for k in ("justesse_personnages_entre_eux", "justesse_personnages_sur_porteur"):
            if ag[k] is not None and v.cles(ag[k], f"/agregats/{k}", ["justes", "total"]):
                v.entier(ag[k]["justes"], f"/agregats/{k}/justes")
                v.entier(ag[k]["total"], f"/agregats/{k}/total")
        v.entier(ag["titres_tires_au_sort"], "/agregats/titres_tires_au_sort", nul=True)
    if moteur:
        if t["carnet"] is not None or t["copies"] != []:
            v.err("", "mode moteur : carnet null et copies vide")
    else:
        if v.cles(t["carnet"], "/carnet", ["texte"]) and not isinstance(t["carnet"]["texte"], str):
            v.err("/carnet/texte", "chaîne attendue")
    for i, cp in enumerate(v.liste(t["copies"], "/copies")):
        c = f"/copies/{i}"
        if v.cles(cp, c, ["coups", "etapes", "k", "mesures", "texte", "versions"]):
            D = Defauts()
            _forme_coups(D, cp["coups"], c + "/coups", cp["k"])
            for r, ch, m in D.liste:
                v.err(ch, m)
            _mesures(v, cp["mesures"], c + "/mesures")
            if not isinstance(cp["texte"], str):
                v.err(c + "/texte", "chaîne attendue")
    return v.e


def _seance(v, s, c, k, moteur):
    if not v.cles(s, c, ["attente", "coups", "curseurs_vus", "dimanche", "entree", "etapes", "k", "manches",
                         "mesures", "ouverture", "phrase_jour", "portrait", "revelation", "surprises_proches",
                         "versions"]):
        return
    if s["k"] != k:
        v.err(c + "/k", f"{s['k']} à l'indice {k}")
    try:
        lire_instant(s["ouverture"])
    except ValueError as e:
        v.err(c + "/ouverture", str(e))
    if moteur and (s["versions"] is not None or s["etapes"] is not None):
        v.err(c, "mode moteur : versions et etapes null")
    D = Defauts()
    _forme_coups(D, s["coups"], c + "/coups", k)
    for r, ch, m in D.liste:
        v.err(ch, m)
    pres = {"entree": k == 0, "revelation": 3 <= k <= 15, "manches": 2 <= k <= 14, "dimanche": k in (7, 14)}
    for cle, att in pres.items():
        if (s[cle] is not None) != att:
            v.err(f"{c}/{cle}", "présent" if s[cle] is not None else "absent")
    if s["entree"] is not None and v.cles(s["entree"], c + "/entree", ["justes", "textes"]):
        if v.cles(s["entree"]["textes"], c + "/entree/textes", list(ENTREE)):
            for e in ENTREE:
                x = s["entree"]["textes"][e]
                if v.cles(x, f"{c}/entree/textes/{e}", ["inviteuse", "juste"]):
                    v.cles(x["inviteuse"], f"{c}/entree/textes/{e}/inviteuse", ["niveau", "raison"])
                    v.dans(x["juste"], f"{c}/entree/textes/{e}/juste", [True, False, None])
        v.entier(s["entree"]["justes"], c + "/entree/justes")
    if s["revelation"] is not None and v.cles(s["revelation"], c + "/revelation", ["devineurs", "texte"]):
        for g, dv in s["revelation"]["devineurs"].items():
            cg = f"{c}/revelation/devineurs/{g}"
            v.dans(g, cg, MEMBRES)
            if v.cles(dv, cg, ["justes", "points", "points_semaine", "raison_trouvee", "verdicts"]):
                v.liste(dv["justes"], cg + "/justes", lambda x, cc: v.dans(x, cc, [True, False]))
                v.entier(dv["points"], cg + "/points")
                v.entier(dv["points_semaine"], cg + "/points_semaine", nul=True)
                v.dans(dv["raison_trouvee"], cg + "/raison_trouvee", [True, False, None])
                if (dv["verdicts"] is not None) != (g == "porteur"):
                    v.err(cg + "/verdicts", "pour le porteur seulement")
                if dv["verdicts"] is not None:
                    v.liste(dv["verdicts"], cg + "/verdicts",
                            lambda x, cc: v.dans(x, cc, ["juste_et_raison", "juste", "faux", "passe"]))
    if s["manches"] is not None:
        if "porteur" not in s["manches"]:
            v.err(c + "/manches", "pas de manche du porteur")
        for g, m in s["manches"].items():
            _manche(v, m, f"{c}/manches/{g}", g)
    if s["phrase_jour"] is not None and v.cles(s["phrase_jour"], c + "/phrase_jour",
                                               ["classe", "phrase", "pole", "texte", "w"]):
        v.dans(s["phrase_jour"]["classe"], c + "/phrase_jour/classe", ["arbitrage", "penchant", "tiraille", "neutre"])
        v.frac(s["phrase_jour"]["w"], c + "/phrase_jour/w")
        v.dans(s["phrase_jour"]["pole"], c + "/phrase_jour/pole", [0, 1, None])
    if s["attente"] is not None and v.cles(s["attente"], c + "/attente", ["lectures"]):
        for i, l in enumerate(v.liste(s["attente"]["lectures"], c + "/attente/lectures")):
            if v.cles(l, f"{c}/attente/lectures/{i}", ["heure", "visages"]):
                if not isinstance(l["heure"], str) or not RE_HEURE.fullmatch(l["heure"]):
                    v.err(f"{c}/attente/lectures/{i}/heure", "heure mal écrite")
                v.liste(l["visages"], f"{c}/attente/lectures/{i}/visages", lambda x, cc: v.dans(x, cc, PERSONNAGES))
    if s["dimanche"] is not None:
        _dimanche(v, s["dimanche"], c + "/dimanche")
    if v.cles(s["portrait"], c + "/portrait", ["ordre_moi", "tensions"]):
        if v.cles(s["portrait"]["tensions"], c + "/portrait/tensions", list(TENSIONS)):
            for T in TENSIONS:
                x = s["portrait"]["tensions"][T]
                if v.cles(x, f"{c}/portrait/tensions/{T}", ["c", "l", "net", "somme_w"]):
                    for k2 in ("c", "l", "somme_w"):
                        v.frac(x[k2], f"{c}/portrait/tensions/{T}/{k2}")
                    v.dans(x["net"], f"{c}/portrait/tensions/{T}/net", [True, False])
        if sorted(s["portrait"]["ordre_moi"] or []) != sorted(TENSIONS):
            v.err(c + "/portrait/ordre_moi", "les quatre tensions attendues")
    if v.cles(s["curseurs_vus"], c + "/curseurs_vus", list(PERSONNAGES)):
        for p in PERSONNAGES:
            if v.cles(s["curseurs_vus"][p], f"{c}/curseurs_vus/{p}", list(TENSIONS)):
                for T in TENSIONS:
                    x = s["curseurs_vus"][p][T]
                    if v.cles(x, f"{c}/curseurs_vus/{p}/{T}", ["c", "l", "somme_w"]):
                        for k2 in ("c", "l", "somme_w"):
                            v.frac(x[k2], f"{c}/curseurs_vus/{p}/{T}/{k2}")
    if v.cles(s["surprises_proches"], c + "/surprises_proches", list(PERSONNAGES)):
        for p in PERSONNAGES:
            v.liste(s["surprises_proches"][p], f"{c}/surprises_proches/{p}", lambda x, cc: v.dans(x, cc, TEXTES))
    _mesures(v, s["mesures"], c + "/mesures")


def _mesures(v, m, c):
    if v.cles(m, c, ["duree_deviner", "duree_repondre", "duree_seance", "jours_ecoules", "passer", "relire",
                     "revelation_raison_tentee", "revelation_verdicts"]):
        for k in ("duree_deviner", "duree_repondre", "duree_seance", "jours_ecoules"):
            v.entier(m[k], f"{c}/{k}", nul=True)
        v.entier(m["passer"], c + "/passer")
        v.entier(m["relire"], c + "/relire")
        v.dans(m["revelation_raison_tentee"], c + "/revelation_raison_tentee", [True, False, None])
        if m["revelation_verdicts"] is not None:
            v.liste(m["revelation_verdicts"], c + "/revelation_verdicts",
                    lambda x, cc: v.dans(x, cc, ["juste_et_raison", "juste", "faux", "passe"]))


def _manche(v, m, c, g):
    if not v.cles(m, c, ["cartes", "classement", "cotes_attendus", "curseur_porteur", "departages", "mediane",
                         "ordre", "places", "possibles", "raison_cachee", "rangs", "remplacements", "texte",
                         "total"]):
        return
    for a, p in m["possibles"].items():
        cp = f"{c}/possibles/{a}"
        v.dans(a, cp, MEMBRES)
        if v.cles(p, cp, ["c", "distance", "l", "niveau", "q", "raison", "rarete", "somme_w", "surprise", "x"]):
            for k in ("c", "distance", "l", "q", "rarete", "somme_w", "surprise", "x"):
                v.frac(p[k], f"{cp}/{k}")
            if not _raison(p["raison"]):
                v.err(cp + "/raison", "raison non permise")
    if m["mediane"] is not None:
        v.frac(m["mediane"], c + "/mediane")
    for k in ("classement", "places", "ordre"):
        v.liste(m[k], f"{c}/{k}", lambda x, cc: v.dans(x, cc, MEMBRES))
    v.entier(m["departages"], c + "/departages")
    for i, r in enumerate(v.liste(m["remplacements"], c + "/remplacements")):
        v.cles(r, f"{c}/remplacements/{i}", ["ecartee", "place", "remplacante"])
    for i, x in enumerate(v.liste(m["cartes"], c + "/cartes")):
        cc = f"{c}/cartes/{i}"
        if v.cles(x, cc, ["auteur", "auteur_compte", "cachee", "designe", "raison_devinee"]):
            v.dans(x["auteur"], cc + "/auteur", MEMBRES)
            v.dans(x["auteur_compte"], cc + "/auteur_compte", MEMBRES)
            v.dans(x["cachee"], cc + "/cachee", [True, False])
            v.dans(x["designe"], cc + "/designe", MEMBRES + ("passe", None))
            if x["raison_devinee"] is not None and not _raison(x["raison_devinee"]):
                v.err(cc + "/raison_devinee", "raison non permise")
    perso = g != "porteur"
    for k in ("rangs", "cotes_attendus", "curseur_porteur", "total"):
        if (m[k] is not None) != perso:
            v.err(f"{c}/{k}", "pour un devineur personnage seulement")
    if perso and m["curseur_porteur"] is not None and v.cles(m["curseur_porteur"], c + "/curseur_porteur", ["c", "somme_w"]):
        v.frac(m["curseur_porteur"]["c"], c + "/curseur_porteur/c")
        v.frac(m["curseur_porteur"]["somme_w"], c + "/curseur_porteur/somme_w")


def _dimanche(v, d, c):
    if not v.cles(d, c, ["devin", "fidele", "mystere", "pas_de_cote", "phrase_semaine", "sans_faute", "semaine",
                         "surprise"]):
        return
    v.dans(d["semaine"], c + "/semaine", [1, 2])
    if v.cles(d["devin"], c + "/devin", ["departage", "points", "raisons", "titulaire"]):
        v.dans(d["devin"]["departage"], c + "/devin/departage", ["aucun", "raisons", "tirage"])
        v.cles(d["devin"]["points"], c + "/devin/points", list(MEMBRES))
        v.cles(d["devin"]["raisons"], c + "/devin/raisons", list(MEMBRES))
    if v.cles(d["mystere"], c + "/mystere", ["departage", "erreurs", "tentatives", "titulaire"]):
        v.dans(d["mystere"]["departage"], c + "/mystere/departage", ["aucun", "erreurs", "tirage"])
        v.cles(d["mystere"]["tentatives"], c + "/mystere/tentatives", list(MEMBRES))
        v.cles(d["mystere"]["erreurs"], c + "/mystere/erreurs", list(MEMBRES))
    v.cles(d["fidele"], c + "/fidele", ["titulaires"])
    if v.cles(d["surprise"], c + "/surprise", ["attributions", "departage", "erreurs", "texte"]):
        v.dans(d["surprise"]["departage"], c + "/surprise/departage", ["aucun", "erreurs", "tirage"])
    ps = d["phrase_semaine"]
    if v.cles(ps, c + "/phrase_semaine", ["cas", "phrase", "poids", "tension"]):
        v.dans(ps["cas"], c + "/phrase_semaine/cas", ["nette", "difference", "egalite", "floue"])
        if v.cles(ps["poids"], c + "/phrase_semaine/poids", list(TENSIONS)):
            for T in TENSIONS:
                x = ps["poids"][T]
                if v.cles(x, f"{c}/phrase_semaine/poids/{T}", ["comptent", "pole0", "pole1"]):
                    v.frac(x["pole0"], f"{c}/phrase_semaine/poids/{T}/pole0")
                    v.frac(x["pole1"], f"{c}/phrase_semaine/poids/{T}/pole1")
                    v.entier(x["comptent"], f"{c}/phrase_semaine/poids/{T}/comptent")
