"""Rejeu d'une partie du second essai : trace C, version 4 (schéma 2, partie 4.3),
carnet et copies (simulation-2, §8.12).

Fonction pure : fichier scellé (relu et octets), journal v4 (relu, valide), fichier
des durées v2 (relu) ou None. L'histoire (jours −90 à 0) est recalculée d'abord ; le
jour 1 commence par la révélation de H90 (schéma 2, partie 3.1).

Les lectures de la spécification qui ne sont pas écrites mot pour mot sont dans
QUESTIONS.md (Q-T…, Q-K…)."""

import copy
from fractions import Fraction as F

from . import canon, carnet as cn
from .heure import lire_instant, minutes, r_journee
from .histoire import calculer_histoire, ecrire_manche, ecrire_curseur
from .jeu import (ENTREE, MEMBRES, PERSONNAGES, TENSIONS, TITRES, cote, texte_du_jour, jour_du_texte)
from .portrait import classer, curseur, ordre_moi, phrase_jour, phrase_semaine
from .tirage import sha256_hex


def en_trace(o):
    if isinstance(o, F):
        return canon.frac(o)
    if isinstance(o, dict):
        return {k: en_trace(v) for k, v in o.items() if not k.startswith("_")}
    if isinstance(o, (list, tuple)):
        return [en_trace(v) for v in o]
    return o


def masquer(o):
    """Schéma 2, partie 4.4 : toute valeur entière dont la clé commence par « duree », et
    chaque élément entier d'un tableau dont la clé commence par « duree », devient 0."""
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            if k.startswith("duree") and isinstance(v, int) and not isinstance(v, bool):
                out[k] = 0
            elif k.startswith("duree") and isinstance(v, list):
                out[k] = [0 if isinstance(x, int) and not isinstance(x, bool) else masquer(x) for x in v]
            else:
                out[k] = masquer(v)
        return out
    if isinstance(o, list):
        return [masquer(v) for v in o]
    return o


def avis_cercle(reps):
    """Simulation-2, §7.14 : reps = niveaux des membres qui ont répondu au texte."""
    n = len(reps)
    if n < 3:
        return None
    comptes = [sum(1 for x in reps if x == k) for k in range(1, 6)]
    v = sorted(reps)
    if n % 2:
        milieu = [v[n // 2]]
    else:
        milieu = sorted({v[n // 2 - 1], v[n // 2]})
    cotes = {cote(x) for x in milieu}
    if len(cotes) == 1 and cotes != {0}:
        ligne = "adopte" if cotes == {1} else "rejete"
    else:
        ligne = "partage"
    return {"comptes": comptes, "ligne": ligne, "milieu": milieu}


class Rejeu:
    def __init__(self, scelle, octets_scelle, journal, durees=None):
        self.d = scelle
        self.empreinte = sha256_hex(octets_scelle)
        self.j = journal
        self.mode = journal["partie"]["mode"]
        self.durees = durees
        self.defauts = []
        self.cal = {o["jour"]: o for o in scelle["calendrier"]}
        self.K = len(journal["jours"])
        _, self.resume, self.mo, extras = calculer_histoire(scelle, octets_scelle)
        self.resume_sha = sha256_hex(extras["resume_octets"])
        self.titres_ok = set(scelle["textes"]) | {h for h, t in scelle["histoire"]["textes"].items()
                                                    if t["fiche"] is not None}
        self.dimanches = {}
        self.temps = {0: self.mo.temperaments(0)}
        self.facteur = scelle["reglage"]["facteur"]
        self.barre_pleine = False
        self.lectures_semaine = {}

    # ------------------------------------------------------------ durées

    def _duree(self, source, cle, attendue, chemin):
        v = None if source is None else source.get(cle)
        if self.mode == "moteur":
            if v is not None:
                self.defauts.append((chemin, "durée en mode moteur"))
            return None
        if attendue:
            if not (isinstance(v, int) and not isinstance(v, bool) and v >= 0):
                self.defauts.append((chemin, "durée attendue, absente du fichier des durées"))
                return 0
            return v
        if v is not None:
            self.defauts.append((chemin, "durée présente là où elle n'est pas attendue"))
        return None

    def source_jour(self, j):
        if self.durees is None:
            return None
        return self.durees["jours"].get(str(j))

    # ------------------------------------------------------------ porteur

    def reponse_porteur(self, t):
        return self.mo.reponses.get(t, {}).get("porteur")

    def portrait(self, jusqu_au):
        tens = {T: self.mo.curseur_jusqu_au("porteur", T, jusqu_au) for T in TENSIONS}
        n = sum(1 for t in list(ENTREE) + [str(k) for k in range(0, min(jusqu_au, 14) + 1)]
                if self.reponse_porteur(t) is not None)
        N = self.d["reglage"]["barre"]
        pleine = self.barre_pleine or n >= N or any(c["net"] for c in tens.values())
        self.barre_pleine = pleine
        return {"barre": {"longueur": F(1) if pleine else F(n, N), "n": n, "pleine": pleine},
                "ordre_moi": ordre_moi(tens),
                "tensions": {T: {"c": c["c"], "l": c["l"], "net": c["net"], "somme_w": c["somme_w"]}
                             for T, c in tens.items()}}

    def phrase_semaine_v2(self, j, w):
        """Simulation-2, §5.7 ; schéma 2, partie 4.3.8."""
        lecture = {T: self.mo.curseur_jusqu_au("porteur", T, j - 1) for T in TENSIONS}
        if w == 14:
            ref_cur = {T: self.mo.curseur_jusqu_au("porteur", T, -91) for T in TENSIONS}   # entrée seule
        else:
            ref_cur = self.lectures_semaine.get(14)
        reference = [T for T in TENSIONS if ref_cur is not None and ref_cur[T]["net"]]
        self.lectures_semaine[w] = lecture
        devenues = [T for T in TENSIONS if lecture[T]["net"] and T not in reference and lecture[T]["c"] != F(1, 2)]
        sem = next(s for s in self.d["semaines"] if s["numero"] == w)
        textes = [texte_du_jour(k) for k in range(sem["premier_jour"] - 1, sem["dernier_jour"])]
        poids = {}
        for T in TENSIONS:
            p0 = p1 = F(0)
            n = 0
            for t in textes:
                rep = self.reponse_porteur(t)
                if rep is None or self.mo.textes[t]["tension"] != T:
                    continue
                _, wv, pi = classer(rep, self.mo.textes[t])
                if wv > 0:
                    n += 1
                    if pi == 0:
                        p0 += wv
                    else:
                        p1 += wv
            poids[T] = {"comptent": n, "pole0": p0, "pole1": p1}
        base = {"devenues": devenues, "lecture": {T: {"c": lecture[T]["c"], "net": lecture[T]["net"],
                                                      "somme_w": lecture[T]["somme_w"]} for T in TENSIONS},
                "poids": poids, "reference": reference}
        if devenues:
            T = sorted(devenues, key=lambda t: (-abs(lecture[t]["c"] - F(1, 2)), -lecture[t]["somme_w"],
                                                TENSIONS.index(t)))[0]
            pole = 1 if lecture[T]["c"] > F(1, 2) else 0
            return dict(base, cas="nette", tension=T, phrase=phrase_semaine("nette", T, pole))
        cands = [T for T in TENSIONS if poids[T]["comptent"] >= 2]
        if not cands:
            return dict(base, cas="floue", tension=None, phrase=phrase_semaine("floue"))
        T = sorted(cands, key=lambda t: (-abs(poids[t]["pole0"] - poids[t]["pole1"]),
                                         -(poids[t]["pole0"] + poids[t]["pole1"]), TENSIONS.index(t)))[0]
        diff = poids[T]["pole1"] - poids[T]["pole0"]
        if diff == 0:
            return dict(base, cas="egalite", tension=T, phrase=phrase_semaine("egalite", T))
        return dict(base, cas="difference", tension=T, phrase=phrase_semaine("difference", T, 1 if diff > 0 else 0))

    # ------------------------------------------------------------ un jour

    def designations(self, coups):
        def f(man):
            if coups["deviner"] is None:
                return None
            return [{"designe": x["designe"], "raison": x["raison"]} for x in coups["deviner"]["cartes"]]
        return f

    def semaine_atteinte(self, j):
        """Dernière semaine dont le dimanche est atteint au jour j."""
        ws = [s["numero"] for s in self.d["semaines"] if s["dernier_jour"] <= j]
        return max(ws)

    def titres_de_semaine(self, w):
        if w <= 13:
            t = self.resume["titres"][w - 1]
            return {"sans_faute": t["sans_faute"], "devin": t["devin"], "mystere": t["mystere"],
                    "fidele": t["fidele"], "surprise": t["surprise"]}
        dim = self.dimanches[7 if w == 14 else 14]
        return {"sans_faute": dim["sans_faute"], "devin": dim["devin"]["titulaire"],
                "mystere": dim["mystere"]["titulaire"], "fidele": dim["fidele"]["titulaires"],
                "surprise": dim["surprise"]["texte"]}

    def cercle(self, j):
        w = self.semaine_atteinte(j)
        t = self.titres_de_semaine(w)
        titres = {}
        for m in MEMBRES:
            l = []
            if m in t["sans_faute"]:
                l.append("sans_faute")
            if t["devin"] == m:
                l.append("devin")
            if t["mystere"] == m:
                l.append("mystere")
            if m in t["fidele"]:
                l.append("fidele")
            titres[m] = l
        dt = 14 if j >= 14 else (7 if j >= 7 else 0)
        return {"surprise": t["surprise"], "temperaments": {p: self.temps[dt][p]["temperaments"] for p in PERSONNAGES},
                "titres": titres}

    def surprises(self, j):
        out = {p: [] for p in PERSONNAGES}
        for m in range(min(j, 15) - 1, 0, -1):
            man = self.mo.manches.get(m, {}).get("porteur")
            if man is None:
                continue
            t = man["texte"]
            for c in man["cartes"]:
                X = c["auteur_compte"]
                if X in PERSONNAGES and c["designe"] in MEMBRES and not self.mo.juste(c, t):
                    out[X].append(t)
        return out

    def curseurs_vus(self, j):
        return {p: {T: dict(self.mo.curseur_jusqu_au(p, T, j - 2)) for T in TENSIONS} for p in PERSONNAGES}

    def message(self, j, rev):
        t = self.cal[j]["type"]
        if j == 1 or t not in ("joue", "joue_puis_saut"):
            return None
        man = self.mo.manches.get(j - 1, {}).get("porteur")
        if man is not None and man["cartes"]:
            forme = "cartes"
        elif self.reponse_porteur(rev["texte"]) is not None:
            forme = "vote"
        else:
            forme = "question"
        titres = False
        if self.cal[j]["nom_jour"] == "dimanche" and j in self.dimanches:
            dim = self.dimanches[j]
            titres = bool(dim["sans_faute"] or dim["devin"]["titulaire"] or dim["mystere"]["titulaire"]
                          or dim["fidele"]["titulaires"])
        return {"forme": forme, "titres": titres}

    def mesures(self, j, coups, etapes, source, chemin):
        t = self.cal[j]["type"]
        prec = [k for k in range(1, j) if self.j["jours"][str(k)]["ouverture"] is not None]
        ouv = self.j["jours"][str(j)]["ouverture"]
        if prec and ouv is not None:
            a, _, _ = lire_instant(self.j["jours"][str(prec[-1])]["ouverture"])
            b, _, _ = lire_instant(ouv)
            ecoules = (b.date() - a.date()).days
        else:
            ecoules = None
        et = etapes or {}
        m = {
            "abandon": coups["abandon"] if t == "joue" else None,
            "compte": coups["compte"],
            "duree_deviner": self._duree(source, "duree_deviner", bool(et.get("deviner")), chemin + "/duree_deviner"),
            "duree_entree": self._duree(source, "duree_entree", j == 1 and bool(et.get("entree")),
                                        chemin + "/duree_entree"),
            "duree_repondre": self._duree(source, "duree_repondre", bool(et.get("repondre")),
                                          chemin + "/duree_repondre"),
            "duree_seance": self._duree(source, "duree_seance", True, chemin + "/duree_seance"),
            "entree_verdicts": None,
            "jours_ecoules": ecoules,
            "ouvert": dict(coups["ouvert"]),
            "passer": sum(1 for x in (coups["deviner"] or {"cartes": []})["cartes"] if x["designe"] == "passe"),
            "pendant_deviner": None if coups["pendant_deviner"] is None else dict(coups["pendant_deviner"]),
            "relire": coups["relire"],
            "revelation_raison_tentee": None,
            "revelation_rouverte": coups["rouvrir"] if j in (2, 3, 7, 14) else None,
            "revelation_verdicts": None,
        }
        if j == 1:
            vs = []
            for e in ENTREE:
                x = coups["entree"][e]
                if x["pari"] is not None:
                    inv = self.mo.reponses[e][self.d["cercle"]["invitant"]]
                    vs.append("juste" if cote(x["pari"]) == cote(inv["niveau"]) else "faux")
            m["entree_verdicts"] = vs
        rev = self.mo.revelations.get(j)
        if rev is not None and "porteur" in rev["devineurs"]:
            man = self.mo.manches[j - 1]["porteur"]
            m["revelation_verdicts"] = list(rev["devineurs"]["porteur"]["verdicts"])
            cach = [c for c in man["cartes"] if c["cachee"]]
            m["revelation_raison_tentee"] = (cach[0]["raison_devinee"] is not None) if cach else None
        return m

    def jour(self, j):
        js = self.j["jours"][str(j)]
        coups = js["coups"]
        mo = self.mo
        t = self.cal[j]["type"]
        s = {"attente": None, "cercle": None, "coups": coups, "curseurs_vus": None, "dimanche": None,
             "entree": None, "etapes": js["etapes"], "manches": None, "mesures": None, "message": None,
             "ouverture": js["ouverture"], "phrase_jour": None, "portrait": None, "revelation": None,
             "surprises_proches": None, "versions": js["versions"]}
        if j == 1:
            inv = self.d["cercle"]["invitant"]
            for e in ENTREE:
                rep = coups["entree"][e]["reponse"]
                if rep is not None:
                    mo.reponses[e]["porteur"] = {"niveau": rep["niveau"], "raison": rep["raison"]}
            vu = js["etapes"]["entree"] if js["etapes"] is not None else True
            if vu:
                textes, justes = {}, 0
                for e in ENTREE:
                    x = coups["entree"][e]
                    r = mo.reponses[e][inv]
                    juste = None if x["pari"] is None else cote(x["pari"]) == cote(r["niveau"])
                    justes += 1 if juste else 0
                    textes[e] = {"invitant": dict(r), "juste": juste}
                s["entree"] = {"justes": justes, "textes": textes}
        mo._cache_cur.clear()
        rev = mo.reveler(j)
        if rev["texte"] in self.d["textes"]:
            reps = [r["niveau"] for r in mo.reponses.get(rev["texte"], {}).values()]
            rev = dict(rev, avis_cercle=avis_cercle(reps))
        else:
            rev = dict(rev, avis_cercle=None)
        s["revelation"] = copy.deepcopy(rev)
        if j in (7, 14):
            w = mo.semaine_du_jour(j)
            dim = mo.titres(w, self.titres_ok)
            self.temps[j] = mo.temperaments(j)
            self.dimanches[j] = dim
            dim = dict(dim, phrase_semaine=self.phrase_semaine_v2(j, w), temperaments=self.temps[j])
            s["dimanche"] = copy.deepcopy(dim)
        s["message"] = self.message(j, rev)
        if j <= 14:
            mo.jouer_manches(j, self.designations(coups))
            s["manches"] = {g: ecrire_manche(m) for g, m in mo.manches[j].items()}
            rep = coups["reponse"]
            if rep is not None:
                mo.reponses[str(j)]["porteur"] = {"niveau": rep["niveau"], "raison": rep["raison"]}
                txt = mo.textes[str(j)]
                cl, w_, pi = classer(rep, txt)
                s["phrase_jour"] = {"classe": cl, "phrase": phrase_jour(cl, txt["tension"], pi), "pole": pi,
                                    "texte": str(j), "w": w_}
            mo._cache_cur.clear()
        if js["attente"] is not None:
            lectures = []
            reps = mo.reponses.get(str(j), {})
            for l in js["attente"]["lectures"]:
                rh = r_journee(minutes(l["heure"]))
                vis = [p for p in PERSONNAGES if p in reps
                       and r_journee(minutes(self.d["personnages"][p]["heure_de_jeu"])) <= rh]
                lectures.append({"heure": l["heure"], "visages": vis})
            s["attente"] = {"lectures": lectures}
        s["portrait"] = self.portrait(min(j, 14))
        s["curseurs_vus"] = self.curseurs_vus(j)
        s["cercle"] = self.cercle(j)
        s["surprises_proches"] = self.surprises(j)
        if js["ouverture"] is not None and t in ("joue", "joue_puis_saut", "cloture"):
            s["mesures"] = self.mesures(j, coups, js["etapes"], self.source_jour(j), f"/jours/{j}/mesures")
        return en_trace(s)

    # ------------------------------------------------------------ sauts

    def saut(self, i, s, sources=None, ch=None):
        """Mesures d'un saut ; `sources` : la liste `sauts` du fichier des durées (du jour,
        ou d'une copie, partie 4.4)."""
        if sources is None and self.durees is not None:
            sources = self.durees["sauts"]
        src = None
        if sources is not None:
            src = next((x for x in sources if x.get("numero") == s["numero"]), None)
        ch = ch or f"/sauts/{i}/mesures"
        dt = None
        if self.mode != "moteur":
            v = None if src is None else src.get("durees_textes")
            if not (isinstance(v, list) and len(v) == s["textes_atteints"]
                    and all(isinstance(x, int) and not isinstance(x, bool) and x >= 0 for x in v)):
                self.defauts.append((ch + "/durees_textes", f"tableau de {s['textes_atteints']} durées attendu"))
                dt = [0] * s["textes_atteints"]
            else:
                dt = list(v)
        elif src is not None and src.get("durees_textes") is not None:
            self.defauts.append((ch + "/durees_textes", "durée en mode moteur"))
        m = {"duree_page": self._duree(src, "duree_page", True, ch + "/duree_page"),
             "duree_saut": self._duree(src, "duree_saut", True, ch + "/duree_saut"),
             "durees_textes": dt, "ouvert": dict(s["coups"]["ouvert"])}
        return {"coups": s["coups"], "depart": s["depart"], "mesures": m, "numero": s["numero"],
                "textes_atteints": s["textes_atteints"]}

    # ------------------------------------------------------------ agrégats

    def agregats(self, K):
        revele = [texte_du_jour(j - 2) for j in range(2, min(K, 15) + 1)]
        repondus = sum(1 for t in revele if self.reponse_porteur(t) is not None)
        vide = {"justesse_personnages_entre_eux": None, "justesse_personnages_sur_porteur": None,
                "titres_tires_au_sort": None}
        if repondus < 5:
            return vide
        ee, sp = [0, 0], [0, 0]
        for j in range(2, min(K, 15) + 1):
            for g, man in self.mo.manches.get(j - 1, {}).items():
                if g == "porteur":
                    continue
                for c in man["cartes"]:
                    cible = sp if c["auteur_compte"] == "porteur" else ee
                    cible[1] += 1
                    cible[0] += 1 if self.mo.juste(c, man["texte"]) else 0
        tirages = 0
        for k in (7, 14):
            if k <= K:
                dim = self.dimanches[k]
                tirages += sum(1 for x in ("devin", "mystere", "surprise") if dim[x]["departage"] == "tirage")
        return {"justesse_personnages_entre_eux": {"justes": ee[0], "total": ee[1]} if ee[1] else None,
                "justesse_personnages_sur_porteur": {"justes": sp[0], "total": sp[1]} if sp[1] else None,
                "titres_tires_au_sort": tirages}

    # ------------------------------------------------------------ carnet

    def etat_saut(self, k, sauts):
        """Le saut confirmé auquel appartient le jour k (calendrier), ou None."""
        n = self.cal[k]["saut"]
        if n is not None and any(s["numero"] == n for s in sauts):
            return n
        return None

    def texte_carnet(self, jours_tr, sauts_tr, jusqua, etat, final=None, agregats=None, sauts_copie=None):
        """final : (coups, versions, mesures) du jour `jusqua` pour une copie."""
        if etat == "cloture":
            ent = cn.entete("cloture")
        else:
            coups_k = final[0] if final else jours_tr[str(jusqua)]["coups"]
            sauts = sauts_copie if sauts_copie is not None else sauts_tr
            if jusqua == 1 and coups_k["compte"] is None:
                ou = "entree"
            else:
                ou = jusqua
            n = self.etat_saut(jusqua, sauts)
            if n is None and jusqua > 1 and self.cal[jusqua]["type"] == "joue" \
                    and self.cal[jusqua - 1]["type"] == "saute" \
                    and jours_tr[str(jusqua)]["ouverture"] is None:
                n = self.cal[jusqua - 1]["saut"]
            if etat == "arret":
                ent = cn.entete("arret", ou, self.j["arret"]["raison"], n if ou != "entree" else None)
            else:
                ent = cn.entete("copie", ou, None, n if ou != "entree" else None)
        blocs = []
        sauts = {s["numero"]: s for s in (sauts_copie if sauts_copie is not None else sauts_tr)}
        sauts_final = {s["numero"]: s for s in sauts_tr}
        mesures_copie = {}
        if sauts_copie is not None:
            mesures_copie = {x["numero"]: x["mesures"] for x in sauts_copie}
        for k in range(1, jusqua + 1):
            st = jours_tr[str(k)]
            t = self.cal[k]["type"]
            if st["ouverture"] is not None and t != "saute":
                if k == jusqua and final is not None:
                    coups, versions, mesures = final
                else:
                    coups, versions, mesures = st["coups"], st["versions"], st["mesures"]
                blocs.append(cn.bloc_jour(k, t, self.cal[k]["nom_jour"], st["ouverture"], versions, mesures, coups))
            if t == "joue_puis_saut" and self.cal[k]["saut"] in sauts:
                n = self.cal[k]["saut"]
                sc = sauts[n]
                m = mesures_copie[n] if sauts_copie is not None else sauts_final[n]["mesures"]
                annuler = (final[0] if (final and k == jusqua) else st["coups"])["annuler_saut"] or 0
                blocs.append(cn.bloc_saut(n, m, annuler, sc["textes_atteints"]))
            if self.cal[k]["nom_jour"] == "dimanche" and k in self.dimanches and t == "joue":
                q = (final[0] if (final and k == jusqua) else st["coups"])["carnet"]
                blocs.append(cn.bloc_semaine(1 if k == 7 else 2, self.dimanches[k], q))
        blocs.append(cn.bloc_essai(agregats))
        if etat == "cloture":
            blocs.append(cn.bloc_fin(self.j["fin"], True))
        elif etat == "arret" and self.j["arret"]["jour"] >= 3:
            blocs.append(cn.bloc_fin({"f2": self.j["arret"]["f2"]}, False))
        return cn.assembler(ent, blocs)

    # ------------------------------------------------------------ partie

    def trace(self):
        jours = {}
        for j in range(1, self.K + 1):
            jours[str(j)] = self.jour(j)
        sauts = [self.saut(i, s) for i, s in enumerate(self.j["sauts"])]
        agregats = en_trace(self.agregats(self.K))
        trace = {"agregats": agregats, "arret": self.j["arret"], "carnet": None, "copies": [],
                 "empreinte_scelle": self.empreinte, "fin": self.j["fin"], "format": "elenchos-essai-trace",
                 "jours": jours, "partie": self.j["partie"], "resume_histoire": self.resume_sha,
                 "sauts": en_trace(sauts), "version": 4}
        if self.mode == "interface":
            etat = "cloture" if self.j["fin"] is not None else "arret"
            trace["carnet"] = {"texte": self.texte_carnet(jours, trace["sauts"], self.K, etat, agregats=agregats)}
            srcs = (self.durees or {}).get("copies") or []
            for i, cp in enumerate(self.j["copies"]):
                k = cp["jour"]
                src = srcs[i] if i < len(srcs) else None
                m = en_trace(self.mesures(k, cp["coups"], cp["etapes"], src, f"/copies/{i}/mesures"))
                ag = en_trace(self.agregats(k))
                src_sauts = (src or {}).get("sauts") if src is not None else None
                if self.mode == "interface" and src is not None and not isinstance(src_sauts, list):
                    self.defauts.append((f"/copies/{i}/sauts", "fichier des durées : `sauts` absent de la copie"))
                sauts_c = [dict(x, mesures=en_trace(self.saut(i, x, src_sauts or [], f"/copies/{i}/sauts/{n}/mesures"))["mesures"])
                           for n, x in enumerate(cp["sauts"])]
                texte = self.texte_carnet(jours, trace["sauts"], k, "copie", (cp["coups"], cp["versions"], m), ag,
                                          sauts_c)
                trace["copies"].append({"coups": cp["coups"], "etapes": cp["etapes"], "jour": k, "mesures": m,
                                        "sauts": cp["sauts"], "texte": texte, "versions": cp["versions"]})
            if self.durees is not None and len(srcs) != len(self.j["copies"]):
                self.defauts.append(("/copies", "fichier des durées : nombre de copies différent"))
        return trace
