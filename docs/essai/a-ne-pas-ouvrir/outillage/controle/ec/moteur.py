"""Le moteur de C : cartes servies (fichier caché, §4), devinettes des
personnages (§3), révélation, points, titres et badges (simulation, §6).

Sans horloge, sans hasard, sans fichier : il reçoit le fichier scellé (lu), les
réponses du joueur et ses désignations (ou une fonction qui les calcule, pour le
joueur simulé du réglage).

Une manche est un dict au format de la trace (schéma, partie 3.6) ; les clés qui
commencent par « _ » sont internes et retirées à l'écriture.
"""

import itertools
from fractions import Fraction as F

from .jeu import (ENTREE, MEMBRES, PERSONNAGES, TENSIONS, VALEUR, cote,
                  SEMAINE_REVELATIONS, SEMAINE_REPONSES)
from .portrait import classer, curseur
from .regles import considerations_reduites


def mediane(valeurs):
    v = sorted(valeurs)
    n = len(v)
    if n == 0:
        return None
    if n % 2:
        return v[n // 2]
    return (v[n // 2 - 1] + v[n // 2]) / 2


def identiques(r1, r2):
    """Cartes identiques (§4.3, étape 3) : même niveau et même raison."""
    return r1["niveau"] == r2["niveau"] and r1["raison"] == r2["raison"]


def score(sigma, attendu):
    """§3, point 3."""
    if attendu == "inconnu":
        return 1
    if sigma == attendu:
        return 2
    if sigma == 0 or attendu == 0:
        return 1
    return 0


def cote_seuils(c_aligne, stricts):
    if stricts:
        if c_aligne > F(3, 5):
            return 1
        if c_aligne < F(2, 5):
            return -1
        return 0
    if c_aligne >= F(3, 5):
        return 1
    if c_aligne <= F(2, 5):
        return -1
    return 0


class Partie:
    """État d'une partie. `reponses[texte][membre]` contient les réponses des
    personnages (fichier scellé) et celles du joueur (« porteur »)."""

    def __init__(self, scelle, tirage, seuils_stricts=None):
        self.tirage = tirage
        self.textes = {
            tid: {"tension": t["tension"], "sens": t["sens"],
                  "considerations": considerations_reduites(t)}
            for tid, t in scelle["textes"].items()
        }
        self.reponses = {tid: dict(r) for tid, r in scelle["reponses"].items()}
        self.absences = {p: set(a) for p, a in scelle["absences"].items()}
        self.positions = {p: {t: F(v["position"], 100) for t, v in d["profil"].items()}
                          for p, d in scelle["personnages"].items()}
        self.seuils_stricts = (scelle["reglage"]["seuils_stricts"]
                               if seuils_stricts is None else seuils_stricts)
        self.manches = {}      # k -> {devineur: manche}
        self.revelations = {}  # k -> révélation
        self.dimanches = {}    # k -> dimanche

    # ------------------------------------------------------------ réponses

    def poser_reponse_porteur(self, texte, rep):
        if rep is None:
            self.reponses[texte].pop("porteur", None)
        else:
            self.reponses[texte]["porteur"] = {"niveau": rep["niveau"], "raison": rep["raison"]}

    def present(self, membre, k):
        """Un personnage joue une manche à la séance k s'il n'est pas absent le jour k."""
        return membre == "porteur" or str(k) not in self.absences[membre]

    def curseur_membre(self, membre, tension, horizon, textes=None):
        """Curseur §5.2 sur les réponses d'entrée et aux textes ≤ horizon (ou sur
        les seuls `textes` donnés), sur une tension."""
        if textes is None:
            textes = list(ENTREE) + [str(n) for n in range(1, horizon + 1)]
        classes = []
        for tid in textes:
            txt = self.textes[tid]
            if txt["tension"] != tension:
                continue
            rep = self.reponses[tid].get(membre)
            if rep is None:
                continue
            classes.append(classer(rep, txt))
        return curseur(classes)

    # ------------------------------------------------------------ §4 : cartes

    def cartes_servies(self, g, k):
        """Manche de g à la séance k (2 à 14), texte k\u22121, sans les désignations."""
        tid = str(k - 1)
        txt = self.textes[tid]
        T, s = txt["tension"], txt["sens"]
        reps = self.reponses[tid]
        auteurs = [X for X in MEMBRES if X != g and X in reps]
        possibles = {}
        for X in auteurs:
            v = VALEUR[reps[X]["niveau"]]
            x = v if s == 1 else 1 - v
            cur = self.curseur_membre(X, T, k - 2)
            q = (F(95, 100) - cur["l"]) / F(70, 100)
            possibles[X] = {"niveau": reps[X]["niveau"], "raison": reps[X]["raison"],
                            "somme_w": cur["somme_w"], "x": x, "c": cur["c"], "l": cur["l"],
                            "q": q}
        med = mediane([possibles[X]["x"] for X in auteurs])
        for X in auteurs:
            P = possibles[X]
            P["distance"] = abs(P["x"] - P["c"])
            P["rarete"] = abs(P["x"] - med)
            P["surprise"] = P["q"] * P["distance"] + (1 - P["q"]) * P["rarete"]
        tg = self.tirage
        classement = sorted(auteurs, key=lambda X: (-possibles[X]["surprise"],
                                                    tg.cle_tri(f"surprise|{g}|{k}|{X}")))
        # groupes d'égalité exacte
        departages = 0
        i = 0
        while i < len(classement):
            j = i
            while j + 1 < len(classement) and \
                    possibles[classement[j + 1]]["surprise"] == possibles[classement[i]]["surprise"]:
                j += 1
            if j > i:
                departages += 1
            i = j + 1
        places = classement[:2]
        if len(classement) > 2:
            places.append(tg.plus_petit(classement[2:], f"hasard|{g}|{k}|{{}}"))
        rang_cl = {X: i for i, X in enumerate(classement)}
        remplacements = []
        while True:
            dup = any(identiques(reps[a], reps[b])
                      for a, b in itertools.combinations(places, 2))
            libres = [X for X in classement if X not in places
                      and not any(identiques(reps[X], reps[P]) for P in places)]
            if not (dup and libres):
                break
            jumelles = [P for P in places
                        if any(identiques(reps[P], reps[Q]) for Q in places if Q != P)]
            ecartee = max(jumelles, key=lambda P: rang_cl[P])
            remplacante = libres[0]
            idx = places.index(ecartee)
            places[idx] = remplacante
            remplacements.append({"place": idx + 1, "ecartee": ecartee, "remplacante": remplacante})
        cachee = None
        deplacee = False
        if places:
            cachee = places[-1]
            if reps[cachee]["raison"] == "aucune":
                autres = [P for P in places if reps[P]["raison"] != "aucune"]
                if autres:
                    cachee = max(autres, key=lambda P: rang_cl[P])
                    deplacee = True
        ordre = tg.melanger(places, f"ordre|{g}|{k}|{{}}")
        cartes = [{"auteur": X, "auteur_compte": X, "cachee": X == cachee,
                   "designe": None, "raison_devinee": None,
                   "_niveau": reps[X]["niveau"], "_raison": reps[X]["raison"]}
                  for X in ordre]
        return {
            "texte": tid,
            "possibles": possibles,
            "mediane": med,
            "classement": classement,
            "departages": departages,
            "remplacements": remplacements,
            "places": places,
            "raison_cachee": cachee,
            "ordre": ordre,
            "cartes": cartes,
            "rangs": None,
            "cotes_attendus": None,
            "curseur_porteur": None,
            "total": None,
            "_devineur": g,
            "_k": k,
            "_cachee_deplacee": deplacee,
        }

    # ------------------------------------------------------------ §3 : devinettes

    def cote_attendu_porteur(self, g, k, tension, s):
        """§3, point 2 : le porteur vu par g, sur ses seules cartes révélées."""
        vus = []
        for m in range(1, k - 1):
            man = self.manches.get(m + 1, {}).get(g)
            if man and "porteur" in man["places"] and self.textes[str(m)]["tension"] == tension:
                vus.append(str(m))
        cur = self.curseur_membre("porteur", tension, None, textes=vus)
        if cur["somme_w"] == 0:
            return "inconnu", cur
        c = cur["c"] if s == 1 else 1 - cur["c"]
        return cote_seuils(c, self.seuils_stricts), cur

    def deviner_personnage(self, g, k, man):
        tid = man["texte"]
        txt = self.textes[tid]
        T, s = txt["tension"], txt["sens"]
        candidats = [X for X in MEMBRES if X != g]
        tg = self.tirage
        melange = tg.melanger(candidats, f"devine|{g}|{k}|{{}}")
        rangs = {X: i + 1 for i, X in enumerate(melange)}
        cotes = {}
        cur_p = None
        for X in candidats:
            if X == "porteur":
                cotes[X], cur_p = self.cote_attendu_porteur(g, k, T, s)
            else:
                p = self.positions[X][T]
                a = p if s == 1 else 1 - p
                cotes[X] = 1 if a >= F(3, 5) else (-1 if a <= F(2, 5) else 0)
        man["rangs"] = rangs
        man["cotes_attendus"] = cotes
        man["curseur_porteur"] = {"somme_w": cur_p["somme_w"], "c": cur_p["c"]}
        affect, total = affecter(man["cartes"], candidats, rangs, cotes)
        man["total"] = total
        for carte, X in zip(man["cartes"], affect):
            carte["designe"] = X
            if carte["cachee"]:
                carte["raison_devinee"] = raison_devinee(cote(carte["_niveau"]), cotes[X], txt)

    # ------------------------------------------------------------ §4.3, étape 4

    @staticmethod
    def redistribuer(man):
        cartes = man["cartes"]
        groupes = []
        for c in cartes:
            for gr in groupes:
                if identiques({"niveau": c["_niveau"], "raison": c["_raison"]},
                              {"niveau": gr[0]["_niveau"], "raison": gr[0]["_raison"]}):
                    gr.append(c)
                    break
            else:
                groupes.append([c])
        man["_groupes_identiques"] = [len(gr) for gr in groupes if len(gr) >= 2]
        for gr in groupes:
            if len(gr) < 2:
                continue
            auteurs = {c["auteur"] for c in gr}
            pris = set()
            restantes = []
            for c in gr:  # gr est dans l'ordre d'affichage
                if c["designe"] in auteurs:
                    if c["designe"] in pris:
                        raise ValueError("défaut : un auteur désigné sur deux cartes identiques "
                                         "(fichier caché, §4.3, étape 4) ; journal invalide")
                    c["auteur_compte"] = c["designe"]
                    pris.add(c["designe"])
                else:
                    restantes.append(c)
            reste = sorted(auteurs - pris, key=MEMBRES.index)
            for c, a in zip(restantes, reste):
                c["auteur_compte"] = a

    # ------------------------------------------------------------ séances

    def jouer_manches(self, k, designations_porteur):
        """Manches de la séance k (2 à 14). designations_porteur(man) rend la liste
        des {"designe", "raison"} du joueur, une par carte dans l'ordre d'affichage."""
        manches = {}
        for g in MEMBRES:
            if g != "porteur" and not self.present(g, k):
                continue
            manches[g] = self.cartes_servies(g, k)
        # Le joueur d'abord : ses cartes ne dépendent que du fichier.
        mp = manches["porteur"]
        des = designations_porteur(mp)
        if len(des) != len(mp["cartes"]):
            raise ValueError(f"séance {k} : {len(des)} désignations pour {len(mp['cartes'])} cartes")
        for carte, d in zip(mp["cartes"], des):
            carte["designe"] = d["designe"]
            carte["raison_devinee"] = d["raison"] if carte["cachee"] else None
            if not carte["cachee"] and d["raison"] is not None:
                raise ValueError(f"séance {k} : raison sur une carte qui n'est pas cachée")
        self.manches[k] = manches
        for g, man in manches.items():
            if g != "porteur":
                self.deviner_personnage(g, k, man)
        for man in manches.values():
            self.redistribuer(man)
        return manches

    def reveler(self, k):
        """Révélation de la séance k (3 à 15) : texte k\u22122, manches de la séance k\u22121."""
        manches = self.manches.get(k - 1, {})
        devineurs = {}
        semaine = 1 if 3 <= k <= 7 else (2 if 8 <= k <= 14 else None)
        for g, man in manches.items():
            justes = [c["designe"] == c["auteur_compte"] for c in man["cartes"]]
            cachees = [c for c in man["cartes"] if c["cachee"]]
            rt = None
            if cachees:
                c = cachees[0]
                rt = (c["designe"] == c["auteur_compte"]) and c["raison_devinee"] is not None \
                    and c["raison_devinee"] == c["_raison"]
            points = sum(justes)
            ps = None
            if semaine is not None:
                debut = 3 if semaine == 1 else 8
                ps = points + sum(self.revelations[j]["devineurs"].get(g, {}).get("points", 0)
                                  for j in range(debut, k) if j in self.revelations)
            verdicts = None
            if g == "porteur":
                verdicts = []
                for c, j in zip(man["cartes"], justes):
                    if c["designe"] in (None, "passe"):
                        verdicts.append("passe")
                    elif not j:
                        verdicts.append("faux")
                    elif c["cachee"] and rt:
                        verdicts.append("juste_et_raison")
                    else:
                        verdicts.append("juste")
            devineurs[g] = {"justes": justes, "raison_trouvee": rt, "points": points,
                            "points_semaine": ps, "verdicts": verdicts}
        rev = {"texte": str(k - 2), "devineurs": devineurs}
        self.revelations[k] = rev
        return rev

    # ------------------------------------------------------------ §6 : titres

    def cartes_revelees_semaine(self, semaine):
        """[(texte, devineur, carte)] des manches révélées dans la semaine."""
        out = []
        for n in SEMAINE_REVELATIONS[semaine]:
            for g, man in self.manches.get(n + 1, {}).items():
                for c in man["cartes"]:
                    out.append((str(n), g, c))
        return out

    def titres(self, k, portrait_moi=None, poids_phrase=None):
        """Dimanche de la séance k (7 ou 14), hors phrase de la semaine (posée par
        l'appelant, qui connaît le portrait)."""
        semaine = 1 if k == 7 else 2
        tg = self.tirage
        cartes = self.cartes_revelees_semaine(semaine)
        # Le Sans-Faute
        sans_faute = []
        if semaine == 2:
            for m in MEMBRES:
                ok = True
                for n in SEMAINE_REVELATIONS[2]:
                    man = self.manches.get(n + 1, {}).get(m)
                    if man is None or not man["cartes"]:
                        ok = False
                        break
                    for c in man["cartes"]:
                        if c["designe"] in (None, "passe") or c["designe"] != c["auteur_compte"]:
                            ok = False
                    if not ok:
                        break
                if ok:
                    sans_faute.append(m)
        # Le Devin
        points = {m: 0 for m in MEMBRES}
        raisons = {m: 0 for m in MEMBRES}
        for n in SEMAINE_REVELATIONS[semaine]:
            rev = self.revelations.get(n + 2)
            if rev is None:
                continue
            for g, d in rev["devineurs"].items():
                points[g] += d["points"]
                raisons[g] += 1 if d["raison_trouvee"] else 0
        devin = {"titulaire": None, "points": points, "raisons": raisons, "departage": "aucun"}
        elig = [m for m in MEMBRES if points[m] >= 1]
        if elig:
            mx = max(points[m] for m in elig)
            tete = [m for m in elig if points[m] == mx]
            if len(tete) == 1:
                devin["titulaire"] = tete[0]
            else:
                mr = max(raisons[m] for m in tete)
                tete2 = [m for m in tete if raisons[m] == mr]
                if len(tete2) == 1:
                    devin["titulaire"], devin["departage"] = tete2[0], "raisons"
                else:
                    devin["titulaire"] = tg.plus_petit(tete2, f"devin|{semaine}|{{}}")
                    devin["departage"] = "tirage"
        # Le Mystère
        tent = {m: 0 for m in MEMBRES}
        err = {m: 0 for m in MEMBRES}
        for n, g, c in cartes:
            X = c["auteur_compte"]
            if c["designe"] in (None, "passe"):
                continue
            tent[X] += 1
            if c["designe"] != X:
                err[X] += 1
        mystere = {"titulaire": None, "tentatives": tent, "erreurs": err, "departage": "aucun"}
        elig = [m for m in MEMBRES if tent[m] >= 6 and err[m] >= 1]
        if elig:
            mx = max(F(err[m], tent[m]) for m in elig)
            tete = [m for m in elig if F(err[m], tent[m]) == mx]
            if len(tete) == 1:
                mystere["titulaire"] = tete[0]
            else:
                me = max(err[m] for m in tete)
                tete2 = [m for m in tete if err[m] == me]
                if len(tete2) == 1:
                    mystere["titulaire"], mystere["departage"] = tete2[0], "erreurs"
                else:
                    mystere["titulaire"] = tg.plus_petit(tete2, f"mystere|{semaine}|{{}}")
                    mystere["departage"] = "tirage"
        # Le Fidèle
        fideles = []
        for m in MEMBRES:
            if all(m in self.reponses[str(n)] for n in SEMAINE_REPONSES[semaine]):
                fideles.append(m)
        # Surprise de la semaine
        attr = {str(n): 0 for n in SEMAINE_REVELATIONS[semaine]}
        errs = {str(n): 0 for n in SEMAINE_REVELATIONS[semaine]}
        for n, g, c in cartes:
            if c["designe"] in (None, "passe"):
                continue
            attr[n] += 1
            if c["designe"] != c["auteur_compte"]:
                errs[n] += 1
        surprise = {"texte": None, "attributions": attr, "erreurs": errs, "departage": "aucun"}
        elig = [n for n in attr if attr[n] >= 4 and errs[n] >= 1]
        if elig:
            mx = max(F(errs[n], attr[n]) for n in elig)
            tete = [n for n in elig if F(errs[n], attr[n]) == mx]
            if len(tete) == 1:
                surprise["texte"] = tete[0]
            else:
                me = max(errs[n] for n in tete)
                tete2 = [n for n in tete if errs[n] == me]
                if len(tete2) == 1:
                    surprise["texte"], surprise["departage"] = tete2[0], "erreurs"
                else:
                    surprise["texte"] = tg.plus_petit(tete2, f"surprise-semaine|{semaine}|{{}}")
                    surprise["departage"] = "tirage"
        dim = {
            "semaine": semaine,
            "sans_faute": sans_faute,
            "pas_de_cote": self.pas_de_cote(),
            "devin": devin,
            "mystere": mystere,
            "fidele": {"titulaires": fideles},
            "surprise": surprise,
            "phrase_semaine": None,
        }
        self.dimanches[k] = dim
        return dim

    def pas_de_cote(self):
        """§6, point 7 : demande un curseur net (Σ w ≥ 10). Dans l'essai, aucun
        curseur n'atteint 10 (au plus 6 réponses sur une tension) : la liste est
        vide. Si un curseur l'atteignait, la règle n'est pas assez précise pour
        être calculée : on s'arrête plutôt que de deviner."""
        for m in MEMBRES:
            for T in TENSIONS:
                if self.curseur_membre(m, T, 14)["somme_w"] >= 10:
                    raise NotImplementedError("Le Pas de Côté : curseur net, règle non calculable")
        return []


def affecter(cartes, candidats, rangs, cotes):
    """§3, point 4 : affectation de total maximal, la plus petite dans l'ordre
    lexicographique des rangs (cartes dans l'ordre d'affichage)."""
    meilleur = None
    for perm in itertools.permutations(candidats, len(cartes)):
        total = sum(score(cote(c["_niveau"]), cotes[X]) for c, X in zip(cartes, perm))
        cle = (-total, tuple(rangs[X] for X in perm))
        if meilleur is None or cle < meilleur[0]:
            meilleur = (cle, perm)
    if meilleur is None:
        return (), 0
    return meilleur[1], -meilleur[0][0]


def raison_devinee(sigma, attendu, txt):
    """§3, point 5."""
    cons = sorted(txt["considerations"], key=lambda c: c["rang"])
    if sigma == 1:
        cote_ = [c for c in cons if c["cote"] == "pour"]
    elif sigma == -1:
        cote_ = [c for c in cons if c["cote"] == "contre"]
    else:
        cote_ = cons
    if not cote_:
        return "aucune"
    if attendu in (1, -1):
        cible = txt["sens"] if attendu == 1 else 1 - txt["sens"]
        for c in cote_:
            if c["pole"] == cible:
                return c["rang"]
    for c in cote_:
        if c["pole"] == "aucun":
            return c["rang"]
    return cote_[0]["rang"]
