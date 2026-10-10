"""Le moteur de C, second essai : cartes servies (fichier caché 2, point 5, et
règles 4.1 à 4.4 du premier essai), devinettes des personnages (point 4, et
règle 3 du premier essai), révélation avec D-024, Le Pas de Côté, titres et
tempéraments (simulation-2, §6).

Sans horloge, sans fichier. Un jour j va de −90 à 15 ; la manche du jour j porte
sur le texte répondu le jour j − 1, la révélation du jour j sur celui du jour j − 2.

Une manche est un dict au format de la trace (schéma 2, partie 4.3.4) ; les clés
qui commencent par « _ » sont internes et retirées à l'écriture.
"""

import itertools
from fractions import Fraction as F

from .jeu import (ENTREE, MEMBRES, PERSONNAGES, TENSIONS, VALEUR, cote, rang_texte,
                  texte_du_jour, jour_du_texte, SEUIL_NET, SEUIL_PENCHE, TEMP_FENETRE,
                  TEMP_ANCIENNETE, TEMP_REPONSES_MIN, TEMP_ORIGINAL, TEMP_PONT,
                  TEMP_PONT_PARTAGES_MIN, TEMP_MESURE, TEMP_TRANCHE, TEMPERAMENTS)
from .portrait import classer, curseur


def mediane(valeurs):
    v = sorted(valeurs)
    n = len(v)
    if n == 0:
        return None
    if n % 2:
        return v[n // 2]
    return (v[n // 2 - 1] + v[n // 2]) / 2


def identiques(r1, r2):
    """Même niveau et même raison, « aucune » comprise (4.3, étape 3 ; D-024)."""
    return r1 is not None and r2 is not None and \
        r1["niveau"] == r2["niveau"] and r1["raison"] == r2["raison"]


def score(sigma, attendu):
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


def textes_reduits(scelle):
    """{id: {"tension", "sens", "considerations": [{"rang", "cote", "pole"}]}} pour
    E1–E3, H1–H90 et 0–14, lus dans le fichier scellé."""
    out = {}
    for tid, t in scelle["textes"].items():
        out[tid] = {"tension": t["tension"], "sens": t["sens"],
                    "considerations": [{"rang": c["rang"], "cote": c["cote"], "pole": c["pole"]}
                                       for c in t["considerations"]]}
    for hid, h in scelle["histoire"]["textes"].items():
        out[hid] = {"tension": h["tension"], "sens": h["sens"],
                    "considerations": [{"rang": c["rang"], "cote": c["cote"], "pole": c["pole"]}
                                       for c in h["raisons"]]}
    return out


class Moteur:
    """État d'un cercle. `reponses[texte][membre]` : réponses des personnages (fichier
    scellé) et, plus tard, du porteur."""

    def __init__(self, scelle, tirage, textes=None, reponses=None, absences=None):
        self.tirage = tirage
        self.textes = textes if textes is not None else textes_reduits(scelle)
        src = reponses if reponses is not None else scelle["reponses"]
        self.reponses = {tid: dict(r) for tid, r in src.items()}
        abs_ = absences if absences is not None else scelle["absences"]
        self.absences = {p: set(a) for p, a in abs_.items()}
        self.positions = {p: {t: F(v["position"], 100) for t, v in d["profil"].items()}
                          for p, d in scelle["personnages"].items()}
        self.depuis = {m["membre"]: m["depuis"] for m in scelle["cercle"]["membres"]}
        self.facteur = scelle["reglage"]["facteur"]
        self.seuils_stricts = scelle["reglage"]["seuils_stricts"]
        self.semaines = scelle["semaines"]
        self.manches = {}      # j -> {devineur: manche}
        self.revelations = {}  # j -> révélation
        self._cache_cur = {}

    # ------------------------------------------------------------ réponses, curseurs

    def present(self, g, j):
        """g joue la manche du jour j : il est membre et n'est pas absent au texte du jour j."""
        if self.depuis[g] > j:
            return False
        if g == "porteur":
            return True
        t = texte_du_jour(j)
        return t is None or t not in self.absences[g]

    def poids(self, m):
        return self.facteur if m == "porteur" else 1

    def curseur_jusqu_au(self, m, T, j, facteur=None):
        """Curseur de m sur T : entrée et textes répondus du jour −90 au jour j inclus."""
        f = self.poids(m) if facteur is None else facteur
        cle = (m, T, j, f)
        if cle in self._cache_cur:
            return self._cache_cur[cle]
        classes = []
        for tid in list(ENTREE) + [texte_du_jour(k) for k in range(-90, min(j, 14) + 1)]:
            txt = self.textes[tid]
            if txt["tension"] != T:
                continue
            rep = self.reponses.get(tid, {}).get(m)
            if rep is None:
                continue
            classes.append(classer(rep, txt))
        cur = curseur(classes, f)
        self._cache_cur[cle] = cur
        return cur

    def curseur_avant(self, m, tid, facteur=None):
        """Curseur de m sur la tension de tid, juste avant sa réponse à tid (toutes ses
        réponses précédentes dans l'ordre du calendrier, entrée comprise)."""
        T = self.textes[tid]["tension"]
        j = jour_du_texte(tid)
        if j is None:
            return None
        return self.curseur_jusqu_au(m, T, j - 1, facteur)

    # ------------------------------------------------------------ cartes (point 5)

    def candidats(self, g, j):
        return [X for X in MEMBRES if X != g and self.depuis[X] <= j - 1]

    def cartes_servies(self, g, j):
        """Manche de g au jour j, texte du jour j − 1, sans les désignations."""
        tid = texte_du_jour(j - 1)
        txt = self.textes[tid]
        T, s = txt["tension"], txt["sens"]
        reps = self.reponses.get(tid, {})
        cands = self.candidats(g, j)
        auteurs = [X for X in cands if X in reps]
        possibles = {}
        for X in auteurs:
            v = VALEUR[reps[X]["niveau"]]
            x = v if s == 1 else 1 - v
            cur = self.curseur_jusqu_au(X, T, j - 2)
            possibles[X] = {"niveau": reps[X]["niveau"], "raison": reps[X]["raison"],
                            "somme_w": cur["somme_w"], "x": x, "c": cur["c"], "l": cur["l"],
                            "net": cur["net"]}
        med = mediane([possibles[X]["x"] for X in auteurs])
        for X in auteurs:
            P = possibles[X]
            P["distance"] = abs(P["x"] - P["c"])
            P["rarete"] = abs(P["x"] - med)
            P["surprise"] = P["distance"] if P["net"] else P["rarete"]
        tg = self.tirage
        classement = sorted(auteurs, key=lambda X: (-possibles[X]["surprise"],
                                                    tg.cle_tri(f"surprise|{g}|{j}|{X}")))
        departages = 0
        i = 0
        while i < len(classement):
            k = i
            while k + 1 < len(classement) and \
                    possibles[classement[k + 1]]["surprise"] == possibles[classement[i]]["surprise"]:
                k += 1
            if k > i:
                departages += 1
            i = k + 1
        places = classement[:2]
        if len(classement) > 2:
            places.append(tg.plus_petit(classement[2:], f"hasard|{g}|{j}|{{}}"))
        rang_cl = {X: i for i, X in enumerate(classement)}
        remplacements = []
        while True:
            dup = any(identiques(reps[a], reps[b]) for a, b in itertools.combinations(places, 2))
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
            remplacements.append({"ecartee": ecartee, "place": idx + 1, "remplacante": remplacante})
        cachee = None
        if places:
            cachee = places[-1]
            if reps[cachee]["raison"] == "aucune":
                autres = [P for P in places if reps[P]["raison"] != "aucune"]
                if autres:
                    cachee = max(autres, key=lambda P: rang_cl[P])
        ordre = tg.melanger(places, f"ordre|{g}|{j}|{{}}")
        cartes = [{"auteur": X, "auteur_compte": X, "cachee": X == cachee,
                   "designe": None, "raison_devinee": None,
                   "_niveau": reps[X]["niveau"], "_raison": reps[X]["raison"]}
                  for X in ordre]
        return {
            "texte": tid, "candidats": cands, "possibles": possibles, "mediane": med,
            "classement": classement, "departages": departages, "remplacements": remplacements,
            "places": places, "raison_cachee": cachee, "ordre": ordre, "cartes": cartes,
            "rangs": None, "cotes_attendus": None, "curseur_porteur": None, "total": None,
            "_devineur": g, "_jour": j,
        }

    # ------------------------------------------------------------ devinettes (point 4)

    def cote_attendu_porteur(self, g, j, T, s):
        """Règle 3.2 du premier essai, poids normaux (fichier caché 2, point 4) : les
        réponses du porteur que g a eues dans ses propres cartes, déjà révélées
        (textes répondus jusqu'au jour j − 2), sur la même tension.
        [Sert après l'arrivée seulement : jalon suivant.]"""
        vus = []
        for m in range(-89, j):
            man = self.manches.get(m, {}).get(g)
            tid = texte_du_jour(m - 1)
            if man and "porteur" in man["places"] and jour_du_texte(tid) <= j - 2 \
                    and self.textes[tid]["tension"] == T:
                vus.append(tid)
        classes = [classer(self.reponses[t]["porteur"], self.textes[t]) for t in vus]
        cur = curseur(classes, 1)
        if cur["somme_w"] == 0:
            return "inconnu", cur
        c = cur["c"] if s == 1 else 1 - cur["c"]
        return cote_seuils(c, self.seuils_stricts), cur

    def deviner_personnage(self, g, j, man):
        txt = self.textes[man["texte"]]
        T, s = txt["tension"], txt["sens"]
        cands = man["candidats"]
        melange = self.tirage.melanger(cands, f"devine|{g}|{j}|{{}}")
        rangs = {X: i + 1 for i, X in enumerate(melange)}
        cotes = {}
        cur_p = None
        for X in cands:
            if X == "porteur":
                cotes[X], cur_p = self.cote_attendu_porteur(g, j, T, s)
            else:
                p = self.positions[X][T]
                a = p if s == 1 else 1 - p
                cotes[X] = 1 if a >= F(3, 5) else (-1 if a <= F(2, 5) else 0)
        man["rangs"] = rangs
        man["cotes_attendus"] = cotes
        man["curseur_porteur"] = None if cur_p is None else {"c": cur_p["c"], "somme_w": cur_p["somme_w"]}
        affect, total = affecter(man["cartes"], cands, rangs, cotes)
        man["total"] = total
        for carte, X in zip(man["cartes"], affect):
            carte["designe"] = X
            if carte["cachee"]:
                carte["raison_devinee"] = raison_devinee(cote(carte["_niveau"]), cotes[X], txt)

    @staticmethod
    def redistribuer(man):
        """4.3, étape 4 du premier essai."""
        cartes = man["cartes"]
        groupes = []
        for c in cartes:
            for gr in groupes:
                if c["_niveau"] == gr[0]["_niveau"] and c["_raison"] == gr[0]["_raison"]:
                    gr.append(c)
                    break
            else:
                groupes.append([c])
        for gr in groupes:
            if len(gr) < 2:
                continue
            auteurs = {c["auteur"] for c in gr}
            pris = set()
            restantes = []
            for c in gr:
                if c["designe"] in auteurs and c["designe"] not in pris:
                    c["auteur_compte"] = c["designe"]
                    pris.add(c["designe"])
                elif c["designe"] in auteurs:
                    raise ValueError("un auteur désigné sur deux cartes identiques")
                else:
                    restantes.append(c)
            reste = sorted(auteurs - pris, key=MEMBRES.index)
            for c, a in zip(restantes, reste):
                c["auteur_compte"] = a

    def jouer_manches(self, j, designations_porteur=None):
        """Manches du jour j. designations_porteur(man) rend [{"designe", "raison"}]
        (une par carte) ou None si la manche du porteur n'a pas été ouverte."""
        manches = {}
        for g in MEMBRES:
            if g == "porteur":
                continue
            if self.present(g, j):
                manches[g] = self.cartes_servies(g, j)
        if designations_porteur is not None and self.present("porteur", j):
            mp = self.cartes_servies("porteur", j)
            des = designations_porteur(mp)
            if des is not None:
                if len(des) != len(mp["cartes"]):
                    raise ValueError(f"jour {j} : {len(des)} désignations pour {len(mp['cartes'])} cartes")
                for carte, d in zip(mp["cartes"], des):
                    carte["designe"] = d["designe"]
                    carte["raison_devinee"] = d["raison"] if carte["cachee"] else None
                manches["porteur"] = mp
        self.manches[j] = manches
        for g, man in manches.items():
            if g != "porteur":
                self.deviner_personnage(g, j, man)
        for man in manches.values():
            self.redistribuer(man)
        return manches

    # ------------------------------------------------------------ révélation

    def juste(self, carte, tid):
        d = carte["designe"]
        if d in (None, "passe"):
            return False
        return identiques(self.reponses.get(tid, {}).get(d),
                          {"niveau": carte["_niveau"], "raison": carte["_raison"]})

    def semaine_du_jour(self, j):
        for s in self.semaines:
            if s["premier_jour"] <= j <= s["dernier_jour"]:
                return s["numero"]
        return None

    def pas_de_cote(self, tid):
        """§6, point 7 : membres dont la réponse à tid est un arbitrage net à l'opposé
        de leur curseur juste avant, net et penchant clairement. Jamais l'entrée."""
        out = []
        if tid in ENTREE:
            return out
        txt = self.textes[tid]
        for m in MEMBRES:
            rep = self.reponses.get(tid, {}).get(m)
            if rep is None:
                continue
            classe, w, pi = classer(rep, txt)
            if classe != "arbitrage":
                continue
            cur = self.curseur_avant(m, tid)
            if not cur["net"] or abs(cur["c"] - F(1, 2)) < SEUIL_PENCHE:
                continue
            pole_cur = 1 if cur["c"] > F(1, 2) else 0
            if pi != pole_cur:
                out.append(m)
        return out

    def reveler(self, j):
        """Révélation du jour j : texte du jour j − 2, manches du jour j − 1."""
        tid = texte_du_jour(j - 2)
        manches = self.manches.get(j - 1, {})
        w = self.semaine_du_jour(j)
        devineurs = {}
        for g in MEMBRES:
            man = manches.get(g)
            if man is None:
                continue
            justes = [self.juste(c, tid) for c in man["cartes"]]
            jumeaux = [ok and c["designe"] != c["auteur_compte"] for c, ok in zip(man["cartes"], justes)]
            rt = None
            cachees = [(c, ok) for c, ok in zip(man["cartes"], justes) if c["cachee"]]
            if cachees:
                c, ok = cachees[0]
                rt = bool(ok and c["raison_devinee"] is not None and c["raison_devinee"] == c["_raison"])
            points = sum(justes)
            ps = None
            if w is not None:
                ps = points + sum(self.revelations[k]["devineurs"].get(g, {}).get("points", 0)
                                  for k in self.revelations if self.semaine_du_jour(k) == w and k < j)
            verdicts = None
            if g == "porteur":
                verdicts = []
                for c, ok, jum in zip(man["cartes"], justes, jumeaux):
                    if c["designe"] in (None, "passe"):
                        verdicts.append("passe")
                    elif not ok:
                        verdicts.append("faux")
                    else:
                        base = "jumeau" if jum else "juste"
                        verdicts.append(base + "_et_raison" if c["cachee"] and rt else base)
            devineurs[g] = {"jumeaux": jumeaux, "justes": justes, "points": points,
                            "points_semaine": ps, "raison_trouvee": rt, "verdicts": verdicts}
        rev = {"devineurs": devineurs, "pas_de_cote": self.pas_de_cote(tid), "texte": tid}
        self.revelations[j] = rev
        return rev

    # ------------------------------------------------------------ titres (§6)

    def titres(self, w, titres_candidats=None):
        """Titres de la semaine w. titres_candidats : textes qui peuvent être la
        surprise (seuls les textes titrés, fichier caché 2, point 9) ; None = tous."""
        sem = next(s for s in self.semaines if s["numero"] == w)
        jours_rev = [j for j in range(sem["premier_jour"], sem["dernier_jour"] + 1) if j in self.revelations]
        membres = [m for m in MEMBRES if self.depuis[m] <= sem["dernier_jour"]]
        tg = self.tirage
        # cartes révélées dans la semaine : (jour de révélation, texte, devineur, carte, juste)
        cartes = []
        for j in jours_rev:
            tid = self.revelations[j]["texte"]
            for g, man in self.manches.get(j - 1, {}).items():
                for c in man["cartes"]:
                    cartes.append((j, tid, g, c, self.juste(c, tid)))
        # Le Sans-Faute (R7 ; simulation-2, §6, point 6)
        sans_faute = []
        for m in membres:
            jours_avec = set()
            ok = True
            for j, tid, g, c, juste in cartes:
                if g != m:
                    continue
                jours_avec.add(j)
                if c["designe"] in (None, "passe") or not juste:
                    ok = False
            if ok and len(jours_avec) >= 5:
                sans_faute.append(m)
        # Le Devin
        points = {m: 0 for m in membres}
        raisons = {m: 0 for m in membres}
        for j in jours_rev:
            for g, d in self.revelations[j]["devineurs"].items():
                points[g] += d["points"]
                raisons[g] += 1 if d["raison_trouvee"] else 0
        devin = {"departage": "aucun", "points": points, "raisons": raisons, "titulaire": None}
        elig = [m for m in membres if points[m] >= 1]
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
                    devin["titulaire"] = tg.plus_petit(tete2, f"devin|{w}|{{}}")
                    devin["departage"] = "tirage"
        # Le Mystère
        tent = {m: 0 for m in membres}
        err = {m: 0 for m in membres}
        for j, tid, g, c, juste in cartes:
            if c["designe"] in (None, "passe"):
                continue
            X = c["auteur_compte"]
            tent[X] += 1
            if not juste:
                err[X] += 1
        mystere = {"departage": "aucun", "erreurs": err, "tentatives": tent, "titulaire": None}
        elig = [m for m in membres if tent[m] >= 6 and err[m] >= 1]
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
                    mystere["titulaire"] = tg.plus_petit(tete2, f"mystere|{w}|{{}}")
                    mystere["departage"] = "tirage"
        # Le Fidèle : tous les textes de la semaine répondus depuis l'arrivée
        textes_rep = [texte_du_jour(j) for j in range(sem["premier_jour"] - 1, sem["dernier_jour"])
                      if texte_du_jour(j) is not None]
        fideles = []
        for m in membres:
            siens = [t for t in textes_rep if jour_du_texte(t) >= self.depuis[m]]
            if all(m in self.reponses.get(t, {}) for t in siens):
                fideles.append(m)
        # Surprise de la semaine
        textes_rev = [self.revelations[j]["texte"] for j in jours_rev]
        attr = {t: 0 for t in textes_rev}
        errs = {t: 0 for t in textes_rev}
        for j, tid, g, c, juste in cartes:
            if c["designe"] in (None, "passe"):
                continue
            attr[tid] += 1
            if not juste:
                errs[tid] += 1
        surprise = self._surprise(w, attr, errs, textes_rev if titres_candidats is None
                                  else [t for t in textes_rev if t in titres_candidats])
        return {"devin": devin, "fidele": {"titulaires": fideles}, "mystere": mystere,
                "sans_faute": sans_faute, "semaine": w,
                "surprise": {"attributions": attr, "departage": surprise[1], "erreurs": errs,
                             "texte": surprise[0]}}

    def _surprise(self, w, attr, errs, candidats):
        elig = [t for t in candidats if attr[t] >= 4 and errs[t] >= 1]
        if not elig:
            return None, "aucun"
        mx = max(F(errs[t], attr[t]) for t in elig)
        tete = [t for t in elig if F(errs[t], attr[t]) == mx]
        if len(tete) == 1:
            return tete[0], "aucun"
        me = max(errs[t] for t in tete)
        tete2 = [t for t in tete if errs[t] == me]
        if len(tete2) == 1:
            return tete2[0], "erreurs"
        return self.tirage.plus_petit(tete2, f"surprise-semaine|{w}|{{}}"), "tirage"

    def surprise_tous_candidats(self, dim):
        """Critère c3 : la surprise quand tous les textes révélés sont candidats."""
        s = dim["surprise"]
        return self._surprise(dim["semaine"], s["attributions"], s["erreurs"], list(s["attributions"]))

    # ------------------------------------------------------------ tempéraments (§6, point 8)

    def temperaments(self, d):
        """Au dimanche d, pour chaque personnage (le porteur n'y figure jamais)."""
        out = {}
        textes = [texte_du_jour(k) for k in range(d - TEMP_FENETRE + 1 - 2, d - 2 + 1)
                  if texte_du_jour(k) is not None]
        for p in PERSONNAGES:
            n = neutres = tres = seul_cote = partages = seul_milieu = 0
            for t in textes:
                reps = self.reponses.get(t, {})
                if p not in reps or len(reps) < 3:
                    continue
                n += 1
                mon = reps[p]["niveau"]
                autres = [r["niveau"] for m, r in reps.items() if m != p]
                if mon == 3:
                    neutres += 1
                if mon in (1, 5):
                    tres += 1
                if cote(mon) != 0 and not any(cote(a) == cote(mon) for a in autres):
                    seul_cote += 1
                if any(cote(a) == 1 for a in autres) and any(cote(a) == -1 for a in autres):
                    partages += 1
                    if mon == 3 and not any(a == 3 for a in autres):
                        seul_milieu += 1
            temps = []
            if d - self.depuis[p] >= TEMP_ANCIENNETE and n >= TEMP_REPONSES_MIN:
                if F(seul_cote, n) >= TEMP_ORIGINAL:
                    temps.append("original")
                if partages >= TEMP_PONT_PARTAGES_MIN and F(seul_milieu, partages) >= TEMP_PONT:
                    temps.append("pont")
                if F(neutres, n) >= TEMP_MESURE:
                    temps.append("mesure")
                if F(tres, n) >= TEMP_TRANCHE:
                    temps.append("tranche")
            assert [x for x in TEMPERAMENTS if x in temps] == temps
            out[p] = {"neutres": neutres, "reponses": n, "seul_cote": seul_cote,
                      "seul_milieu": seul_milieu, "temperaments": temps,
                      "textes_partages": partages, "tres": tres}
        return out


def affecter(cartes, candidats, rangs, cotes):
    """Règle 3.4 du premier essai : affectation de total maximal, la plus petite dans
    l'ordre lexicographique des rangs."""
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
    """Règle 3.5 du premier essai."""
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
