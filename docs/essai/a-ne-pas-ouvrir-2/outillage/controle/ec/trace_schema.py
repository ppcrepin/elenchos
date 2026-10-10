"""Schéma fermé de la trace de partie, version 4 (schéma 2, partie 4.3) : clés exactes à
chaque niveau et types de base. Sert à la trace de la page comme à celle de C, avant
toute comparaison (une clé de trop ou en moins se voit ici, avec son chemin)."""

import re

RE_FRAC = re.compile(r"-?(?:0|[1-9][0-9]*)(?:/[1-9][0-9]*)?")
CLES_PARTIE = ["agregats", "arret", "carnet", "copies", "empreinte_scelle", "fin", "format", "jours", "partie",
               "resume_histoire", "sauts", "version"]
CLES_JOUR = ["attente", "cercle", "coups", "curseurs_vus", "dimanche", "entree", "etapes", "manches", "mesures",
             "message", "ouverture", "phrase_jour", "portrait", "revelation", "surprises_proches", "versions"]
CLES_MANCHE = ["candidats", "cartes", "classement", "cotes_attendus", "curseur_porteur", "departages", "mediane",
               "ordre", "places", "possibles", "raison_cachee", "rangs", "remplacements", "texte", "total"]
CLES_POSSIBLE = ["c", "distance", "l", "net", "niveau", "raison", "rarete", "somme_w", "surprise", "x"]
CLES_CARTE = ["auteur", "auteur_compte", "cachee", "designe", "raison_devinee"]
CLES_REV = ["avis_cercle", "devineurs", "pas_de_cote", "texte"]
CLES_DEVINEUR = ["jumeaux", "justes", "points", "points_semaine", "raison_trouvee", "verdicts"]
CLES_MESURES = ["abandon", "compte", "duree_deviner", "duree_entree", "duree_repondre", "duree_seance",
                "entree_verdicts", "jours_ecoules", "ouvert", "passer", "pendant_deviner", "relire",
                "revelation_raison_tentee", "revelation_rouverte", "revelation_verdicts"]
CLES_DIMANCHE = ["devin", "fidele", "mystere", "phrase_semaine", "sans_faute", "semaine", "surprise", "temperaments"]
CLES_PHRASE_SEM = ["cas", "devenues", "lecture", "phrase", "poids", "reference", "tension"]
CLES_TEMP = ["neutres", "reponses", "seul_cote", "seul_milieu", "temperaments", "textes_partages", "tres"]
CLES_SAUT = ["coups", "depart", "mesures", "numero", "textes_atteints"]
CLES_COPIE = ["coups", "etapes", "jour", "mesures", "sauts", "texte", "versions"]


def valider_trace(t):
    e = []

    def cles(o, ch, att):
        if not isinstance(o, dict):
            e.append(f"{ch} : objet attendu")
            return False
        if set(o) != set(att):
            e.append(f"{ch} : clés {sorted(set(o) ^ set(att))} en trop ou absentes")
            return False
        return True

    def frac(v, ch):
        if not (isinstance(v, str) and RE_FRAC.fullmatch(v)):
            e.append(f"{ch} : fraction attendue, trouvé {v!r}")

    if not cles(t, "", CLES_PARTIE):
        return e
    if t["format"] != "elenchos-essai-trace" or t["version"] != 4:
        e.append("/format, /version : « elenchos-essai-trace », 4 attendus")
    for k, j in t["jours"].items():
        ch = f"/jours/{k}"
        if not cles(j, ch, CLES_JOUR):
            continue
        for g, m in (j["manches"] or {}).items():
            cm = f"{ch}/manches/{g}"
            if cles(m, cm, CLES_MANCHE):
                for a, p in m["possibles"].items():
                    if cles(p, f"{cm}/possibles/{a}", CLES_POSSIBLE):
                        for x in ("c", "distance", "l", "rarete", "somme_w", "surprise", "x"):
                            frac(p[x], f"{cm}/possibles/{a}/{x}")
                for i, c in enumerate(m["cartes"]):
                    cles(c, f"{cm}/cartes/{i}", CLES_CARTE)
        r = j["revelation"]
        if r is not None and cles(r, ch + "/revelation", CLES_REV):
            for g, dv in r["devineurs"].items():
                cles(dv, f"{ch}/revelation/devineurs/{g}", CLES_DEVINEUR)
            if r["avis_cercle"] is not None:
                cles(r["avis_cercle"], ch + "/revelation/avis_cercle", ["comptes", "ligne", "milieu"])
        if j["mesures"] is not None:
            cles(j["mesures"], ch + "/mesures", CLES_MESURES)
        if j["dimanche"] is not None and cles(j["dimanche"], ch + "/dimanche", CLES_DIMANCHE):
            cles(j["dimanche"]["phrase_semaine"], ch + "/dimanche/phrase_semaine", CLES_PHRASE_SEM)
            for p, x in j["dimanche"]["temperaments"].items():
                cles(x, f"{ch}/dimanche/temperaments/{p}", CLES_TEMP)
        if j["portrait"] is not None and cles(j["portrait"], ch + "/portrait", ["barre", "ordre_moi", "tensions"]):
            cles(j["portrait"]["barre"], ch + "/portrait/barre", ["longueur", "n", "pleine"])
            frac(j["portrait"]["barre"]["longueur"], ch + "/portrait/barre/longueur")
        if j["cercle"] is not None:
            cles(j["cercle"], ch + "/cercle", ["surprise", "temperaments", "titres"])
        if j["message"] is not None:
            cles(j["message"], ch + "/message", ["forme", "titres"])
        if j["entree"] is not None:
            cles(j["entree"], ch + "/entree", ["justes", "textes"])
    for i, s in enumerate(t["sauts"]):
        if cles(s, f"/sauts/{i}", CLES_SAUT):
            cles(s["mesures"], f"/sauts/{i}/mesures", ["duree_page", "duree_saut", "durees_textes", "ouvert"])
    for i, c in enumerate(t["copies"]):
        if cles(c, f"/copies/{i}", CLES_COPIE):
            cles(c["mesures"], f"/copies/{i}/mesures", CLES_MESURES)
    if cles(t["agregats"], "/agregats", ["justesse_personnages_entre_eux", "justesse_personnages_sur_porteur",
                                         "titres_tires_au_sort"]):
        pass
    if t["carnet"] is not None:
        cles(t["carnet"], "/carnet", ["texte"])
    return e
