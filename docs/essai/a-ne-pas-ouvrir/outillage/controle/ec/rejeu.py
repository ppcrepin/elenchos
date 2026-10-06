"""Rejeu d'une partie : trace C (schéma, partie 3), carnet et copies (§8.12).

Fonction pure : fichier scellé (relu et octets), journal (relu), durées (relues ou
None). Sans horloge ni hasard."""

import copy
from fractions import Fraction as F

from . import canon, carnet as cn
from .heure import lire_instant, minutes, r_journee
from .jeu import MEMBRES, PERSONNAGES, TENSIONS, ENTREE, cote, SEMAINE_REPONSES, SEMAINE_REVELATIONS
from .moteur import Partie
from .portrait import classer, ordre_moi, phrase_jour, phrase_semaine
from .tirage import Tirage, sha256_hex


def en_trace(o):
    """Fractions en chaînes « p/q », clés internes (« _… ») retirées."""
    if isinstance(o, F):
        return canon.frac(o)
    if isinstance(o, dict):
        return {k: en_trace(v) for k, v in o.items() if not k.startswith("_")}
    if isinstance(o, (list, tuple)):
        return [en_trace(v) for v in o]
    return o


class Rejeu:
    def __init__(self, scelle, octets_scelle, journal, durees=None):
        self.d = scelle
        self.empreinte = sha256_hex(octets_scelle)
        self.j = journal
        self.mode = journal["partie"]["mode"]
        self.durees = durees
        self.defauts = []  # (chemin, message) : présence des durées
        self.partie = Partie(scelle, Tirage(scelle["graine"]))
        self.K = len(journal["seances"]) - 1

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

    def durees_de(self, k, etapes, source, chemin):
        dev = bool(etapes and etapes["deviner"])
        rep = bool(etapes and etapes["repondre"])
        return {
            "duree_seance": self._duree(source, "duree_seance", True, chemin + "/duree_seance"),
            "duree_deviner": self._duree(source, "duree_deviner", dev, chemin + "/duree_deviner"),
            "duree_repondre": self._duree(source, "duree_repondre", rep, chemin + "/duree_repondre"),
        }

    def source_durees_seance(self, k):
        if self.durees is None:
            return None
        for s in self.durees["seances"]:
            if s["k"] == k:
                return s
        return None

    # ------------------------------------------------------------ calculs

    def mesures(self, k, coups, etapes, source_durees, chemin):
        m = {}
        if k == 0:
            m["jours_ecoules"] = None
        else:
            a, _, _ = lire_instant(self.j["seances"][k - 1]["ouverture"])
            b, _, _ = lire_instant(self.j["seances"][k]["ouverture"])
            m["jours_ecoules"] = (b.date() - a.date()).days
        m.update(self.durees_de(k, etapes, source_durees, chemin))
        m["relire"] = coups["relire"]
        m["passer"] = sum(1 for x in (coups["deviner"] or []) if x["designe"] == "passe")
        rev = self.partie.revelations.get(k)
        if rev is None:
            m["revelation_verdicts"] = None
            m["revelation_raison_tentee"] = None
        else:
            man = self.partie.manches[k - 1]["porteur"]
            m["revelation_verdicts"] = list(rev["devineurs"]["porteur"]["verdicts"])
            cach = [c for c in man["cartes"] if c["cachee"]]
            m["revelation_raison_tentee"] = (cach[0]["raison_devinee"] is not None) if cach else None
        return m

    def agregats(self, K):
        revele = [n for n in range(1, 14) if n + 2 <= K]
        repondus = sum(1 for n in revele if "porteur" in self.partie.reponses[str(n)])
        vide = {"justesse_personnages_entre_eux": None, "justesse_personnages_sur_porteur": None,
                "titres_tires_au_sort": None}
        if repondus < 5:
            return vide
        ee = [0, 0]
        sp = [0, 0]
        for n in revele:
            for g, man in self.partie.manches[n + 1].items():
                if g == "porteur":
                    continue
                for c in man["cartes"]:
                    cible = sp if c["auteur_compte"] == "porteur" else ee
                    cible[1] += 1
                    cible[0] += 1 if c["designe"] == c["auteur_compte"] else 0
        tirages = 0
        for k in (7, 14):
            if k <= K:
                dim = self.partie.dimanches[k]
                tirages += sum(1 for t in ("devin", "mystere", "surprise") if dim[t]["departage"] == "tirage")
        return {
            "justesse_personnages_entre_eux": {"justes": ee[0], "total": ee[1]} if ee[1] else None,
            "justesse_personnages_sur_porteur": {"justes": sp[0], "total": sp[1]} if sp[1] else None,
            "titres_tires_au_sort": tirages,
        }

    def phrase_de_la_semaine(self, k):
        sem = 1 if k == 7 else 2
        poids = {}
        for T in TENSIONS:
            p0 = p1 = F(0)
            n = 0
            for t in SEMAINE_REPONSES[sem]:
                tid = str(t)
                txt = self.partie.textes[tid]
                if txt["tension"] != T or "porteur" not in self.partie.reponses[tid]:
                    continue
                cl, w, pi = classer(self.partie.reponses[tid]["porteur"], txt)
                if w > 0:
                    n += 1
                    if pi == 0:
                        p0 += w
                    else:
                        p1 += w
            poids[T] = {"pole0": p0, "pole1": p1, "comptent": n}
        # tension nette : impossible dans l'essai (aucun curseur n'atteint Σ w = 10)
        nets = [T for T in TENSIONS if self.partie.curseur_membre("porteur", T, k - 1)["net"]]
        if nets:
            raise NotImplementedError("phrase de la semaine, cas « nette » : non calculé (QUESTIONS, Q8)")
        cands = [T for T in TENSIONS if poids[T]["comptent"] >= 2]
        if not cands:
            return {"poids": poids, "tension": None, "cas": "floue", "phrase": phrase_semaine("floue")}
        T = sorted(cands, key=lambda t: (-abs(poids[t]["pole0"] - poids[t]["pole1"]),
                                         -(poids[t]["pole0"] + poids[t]["pole1"]), TENSIONS.index(t)))[0]
        diff = poids[T]["pole1"] - poids[T]["pole0"]
        if diff == 0:
            return {"poids": poids, "tension": T, "cas": "egalite", "phrase": phrase_semaine("egalite", T)}
        pole = 1 if diff > 0 else 0
        return {"poids": poids, "tension": T, "cas": "difference",
                "phrase": phrase_semaine("difference", T, pole)}

    # ------------------------------------------------------------ séances

    def designations(self, coups):
        def f(man):
            return [{"designe": x["designe"], "raison": x["raison"]} for x in coups["deviner"]]
        return f

    def seance(self, k):
        js = self.j["seances"][k]
        coups = js["coups"]
        P = self.partie
        s = {"k": k, "ouverture": js["ouverture"], "versions": js["versions"], "etapes": js["etapes"],
             "coups": coups, "entree": None, "revelation": None, "manches": None, "phrase_jour": None,
             "attente": None, "dimanche": None}
        if k == 0:
            textes = {}
            justes = 0
            for e in ENTREE:
                x = coups["entree"][e]
                P.poser_reponse_porteur(e, x["reponse"])
                ag = P.reponses[e]["Agathe"]
                juste = None if x["pari"] is None else cote(x["pari"]) == cote(ag["niveau"])
                justes += 1 if juste else 0
                textes[e] = {"inviteuse": dict(ag), "juste": juste}
            s["entree"] = {"textes": textes, "justes": justes}
        if k >= 3:
            s["revelation"] = copy.deepcopy(P.reveler(k))
        if k in (7, 14):
            dim = P.titres(k)
            dim["phrase_semaine"] = self.phrase_de_la_semaine(k)
            s["dimanche"] = copy.deepcopy(dim)
        if 2 <= k <= 14:
            P.jouer_manches(k, self.designations(coups))
            s["manches"] = P.manches[k]  # en_trace en fera une copie
        if 1 <= k <= 14:
            P.poser_reponse_porteur(str(k), coups["reponse"])
            if coups["reponse"] is not None:
                txt = P.textes[str(k)]
                cl, w, pi = classer(coups["reponse"], txt)
                s["phrase_jour"] = {"texte": str(k), "classe": cl, "w": w, "pole": pi,
                                    "phrase": phrase_jour(cl, txt["tension"], pi)}
        if js["attente"] is not None:
            lectures = []
            for l in js["attente"]["lectures"]:
                rh = r_journee(minutes(l["heure"]))
                vis = [p for p in PERSONNAGES if p in P.reponses[str(k)]
                       and r_journee(minutes(self.d["personnages"][p]["heure_de_jeu"])) <= rh]
                lectures.append({"heure": l["heure"], "visages": vis})
            s["attente"] = {"lectures": lectures}
        h = min(k, 14)
        tens = {T: P.curseur_membre("porteur", T, h) for T in TENSIONS}
        s["portrait"] = {"tensions": tens, "ordre_moi": ordre_moi(tens)}
        s["curseurs_vus"] = {p: {T: {x: v for x, v in P.curseur_membre(p, T, k - 2).items() if x != "net"}
                                 for T in TENSIONS} for p in PERSONNAGES}
        s["surprises_proches"] = self.surprises(k)
        s["mesures"] = self.mesures(k, coups, js["etapes"], self.source_durees_seance(k),
                                    f"/seances/{k}/mesures")
        return en_trace(s)

    def surprises(self, k):
        out = {p: [] for p in PERSONNAGES}
        for n in range(min(k - 2, 13), 0, -1):
            man = self.partie.manches.get(n + 1, {}).get("porteur")
            if man is None:
                continue
            for c in man["cartes"]:
                X = c["auteur_compte"]
                if X in PERSONNAGES and c["designe"] in PERSONNAGES and c["designe"] != X:
                    out[X].append(str(n))
        return out

    # ------------------------------------------------------------ carnet

    def bloc(self, k, coups, versions, mesures):
        return cn.bloc_seance(k, self.j["seances"][k]["ouverture"], mesures["jours_ecoules"], versions,
                              mesures, True, coups)

    def texte_carnet(self, seances_tr, jusqua, etat, bloc_final=None, agregats=None):
        """seances_tr : séances de la trace (forme trace). bloc_final : (coups, versions, mesures)
        pour la séance `jusqua` d'une copie."""
        if etat == "arret":
            a = self.j["arret"]
            ent = cn.entete("arret", a["k"], a["raison"])
        elif etat == "cloture":
            ent = cn.entete("cloture")
        else:
            ent = cn.entete("copie", jusqua)
        blocs = []
        for k in range(0, jusqua + 1):
            st = seances_tr[k]
            if k == jusqua and bloc_final is not None:
                blocs.append(self.bloc(k, *bloc_final))
            else:
                blocs.append(self.bloc(k, st["coups"], st["versions"], st["mesures"]))
            if k in (7, 14):
                blocs.append(cn.bloc_titres(st["dimanche"]))
        blocs.append(cn.bloc_essai(agregats))
        if etat == "cloture":
            blocs.append(cn.bloc_fin(self.j["fin"]["f2"], self.j["fin"]["f1"], True))
        elif etat == "arret" and self.j["arret"]["k"] >= 3:
            blocs.append(cn.bloc_fin(self.j["arret"]["f2"], self.j["arret"]["f1"], False))
        return cn.assembler(ent, blocs)

    # ------------------------------------------------------------ partie

    def trace(self):
        seances = [self.seance(k) for k in range(self.K + 1)]
        agregats = self.agregats(self.K)
        trace = {
            "format": "elenchos-essai-trace",
            "version": 3,
            "empreinte_scelle": self.empreinte,
            "partie": self.j["partie"],
            "seances": seances,
            "arret": self.j["arret"],
            "fin": self.j["fin"],
            "agregats": agregats,
            "carnet": None,
            "copies": [],
        }
        if self.mode == "interface":
            etat = "cloture" if self.j["fin"] is not None else "arret"
            trace["carnet"] = {"texte": self.texte_carnet(seances, self.K, etat, agregats=en_trace(agregats))}
            srcs = (self.durees or {}).get("copies") or []
            for i, cp in enumerate(self.j["copies"]):
                k = cp["k"]
                src = srcs[i] if i < len(srcs) else None
                if src is not None and src.get("k") != k:
                    self.defauts.append((f"/copies/{i}", "fichier des durées : séance de la copie différente"))
                m = self.mesures(k, cp["coups"], cp["etapes"], src, f"/copies/{i}/mesures")
                ag = en_trace(self.agregats(k))
                texte = self.texte_carnet(seances, k, "copie", (cp["coups"], cp["versions"], m), ag)
                trace["copies"].append({"k": k, "coups": cp["coups"], "versions": cp["versions"],
                                        "etapes": cp["etapes"], "mesures": m, "texte": texte})
            if self.durees is not None and len(srcs) != len(self.j["copies"]):
                self.defauts.append(("/copies", "fichier des durées : nombre de copies différent"))
        return trace


def masquer(o):
    """Partie 4.2, étape 3 : toute valeur entière dont la clé commence par duree_ devient 0."""
    if isinstance(o, dict):
        return {k: (0 if k.startswith("duree_") and isinstance(v, int) and not isinstance(v, bool)
                    else masquer(v)) for k, v in o.items()}
    if isinstance(o, list):
        return [masquer(v) for v in o]
    return o
