#!/usr/bin/env python3
"""Temps 2, suite : feuille D de la partie (a) (révélations du porteur, points,
titres, agrégats, portrait, phrases, « En attendant », mesures) et feuille de
calcul de la partie « r », comparées à la trace de C. Les valeurs sont lues dans
les feuilles par expressions régulières ; quand une valeur n'est écrite qu'en
prose, elle est recopiée ici avec le numéro de sa ligne."""

import json
import re
import sys
from fractions import Fraction as F
from pathlib import Path

ICI = Path(__file__).resolve().parent
REF = ICI.parents[1].parent / "references"
NOMS = ("Agathe", "Nassim", "Odile", "Valentin", "porteur")
PERS = NOMS[:4]


class R:
    def __init__(self, nom):
        self.nom = nom
        self.n = 0
        self.ecarts = []

    def eq(self, ligne, quoi, ref, c):
        self.n += 1
        if ref != c:
            self.ecarts.append(f"{self.nom}, ligne {ligne} : {quoi} : feuille {ref!r} ; C {c!r}")


def lignes(p):
    return p.read_text(encoding="utf-8").split("\n")


def num(ls, motif):
    """Numéro (1-based) et texte de la première ligne qui correspond."""
    for i, l in enumerate(ls, 1):
        if re.search(motif, l):
            return i, l
    raise KeyError(motif)


def cartes_semaine(t, textes):
    """[(texte, devineur, carte)] des manches jouées sur ces textes."""
    out = []
    for n in textes:
        man = t["seances"][n + 1]["manches"]
        for g, m in man.items():
            for c in m["cartes"]:
                out.append((n, g, c))
    return out


def section_mystere(ls, n):
    """Vrai si la ligne n est dans la partie 6 (Le Mystère) de la feuille D."""
    titre = ""
    for l in ls[:n]:
        if re.match(r"^[0-9]+\. ", l):
            titre = l
    return titre.startswith("6. LE MYSTÈRE")


def feuille_d(t):
    f = REF / "carnet-2-cloture-a" / "feuille-D-titres-agregats-carnet.txt"
    ls = lignes(f)
    r = R("feuille-D")
    S = t["seances"]
    # 1. Entrée
    for e in ("E1", "E2", "E3"):
        i, l = num(ls, rf"^entree\.textes\.{e} \|")
        m = re.search(r"inviteuse \{([0-9]), ([0-9]|aucune)\}, juste (true|false)", l)
        x = S[0]["entree"]["textes"][e]
        rai = m.group(2) if m.group(2) == "aucune" else int(m.group(2))
        r.eq(i, f"entree {e}", ({"niveau": int(m.group(1)), "raison": rai}, m.group(3) == "true"),
             (x["inviteuse"], x["juste"]))
    i, l = num(ls, r"^entree\.justes")
    r.eq(i, "entree.justes", int(l.split("|")[-1]), S[0]["entree"]["justes"])
    # 2. Portrait et phrases
    i, _ = num(ls, r"^Toute réponse \|")
    for s in S:
        for T in "SPTL":
            r.eq(i, f"portrait séance {s['k']} {T}", {"somme_w": "0", "c": "1/2", "l": "19/20", "net": False},
                 s["portrait"]["tensions"][T])
    i, _ = num(ls, r"^ordre_moi \|")
    for s in S:
        r.eq(i, f"ordre_moi séance {s['k']}", ["S", "P", "T", "L"], s["portrait"]["ordre_moi"])
    for n, l in enumerate(ls, 1):
        m = re.match(r"^ texte ([0-9, ]+) \(([SPTL])\) \| \| « (.+) »$", l)
        if m:
            for x in m.group(1).split(","):
                k = int(x)
                pj = S[k]["phrase_jour"]
                r.eq(n, f"phrase_jour séance {k}", {"texte": str(k), "classe": "neutre", "w": "0", "pole": None,
                                                    "phrase": m.group(3)}, pj)
    i, _ = num(ls, r"^ séance 10 \| pas de réponse")
    r.eq(i, "phrase_jour séance 10", None, S[10]["phrase_jour"])
    i, _ = num(ls, r"^phrase_semaine \(séances 7 et 14\)")
    for k in (7, 14):
        ps = S[k]["dimanche"]["phrase_semaine"]
        r.eq(i, f"phrase_semaine séance {k}",
             ({T: {"pole0": "0", "pole1": "0", "comptent": 0} for T in "SPTL"}, None, "floue",
              "Cette semaine, ton portrait est encore flou. Chaque réponse le précise."),
             (ps["poids"], ps["tension"], ps["cas"], ps["phrase"]))
    i, _ = num(ls, r"^surprises_proches \|")
    for s in S:
        r.eq(i, f"surprises_proches séance {s['k']}", {p: [] for p in PERS}, s["surprises_proches"])
    i, _ = num(ls, r"^curseur_porteur \(manches des personnages\)")
    for s in S:
        for g, m in (s["manches"] or {}).items():
            if g != "porteur":
                r.eq(i, f"curseur_porteur séance {s['k']} {g}", ({"somme_w": "0", "c": "1/2"}, "inconnu"),
                     (m["curseur_porteur"], m["cotes_attendus"]["porteur"]))
    # 3. Manches et révélations du porteur
    i, l = num(ls, r"^auteur_compte, séance 4")
    r.eq(i, "auteur_compte séance 4", ["Agathe", "Odile", "Valentin"],
         [c["auteur_compte"] for c in S[4]["manches"]["porteur"]["cartes"]])
    i, l = num(ls, r"^auteur_compte, séance 9")
    r.eq(i, "auteur_compte séance 9", ["Odile", "Agathe", "Valentin"],
         [c["auteur_compte"] for c in S[9]["manches"]["porteur"]["cartes"]])
    for k in range(2, 15):
        for c in S[k]["manches"]["porteur"]["cartes"]:
            r.eq(num(ls, r"^Cartes : manches-porteur")[0], f"designe porteur séance {k}", ("passe", None),
                 (c["designe"], c["raison_devinee"]))
    i, _ = num(ls, r"^revelation\.devineurs\.porteur, séances 3 à 11")
    i12, _ = num(ls, r"^revelation\.devineurs\.porteur, séance 12")
    for k in range(3, 16):
        d = S[k]["revelation"]["devineurs"]["porteur"]
        nb = 2 if k == 12 else 3
        r.eq(i12 if k == 12 else i, f"révélation porteur séance {k}",
             ([False] * nb, False if k != 12 else d["raison_trouvee"], 0, ["passe"] * nb, None if k == 15 else 0),
             (d["justes"], d["raison_trouvee"], d["points"], d["verdicts"], d["points_semaine"]))
    # 4. Points par texte et raisons
    sem = None
    for n, l in enumerate(ls, 1):
        if l.startswith("Semaine 1 (textes 1 à 5), points"):
            sem = (1, range(1, 6))
        elif l.startswith("Semaine 2 (textes 6 à 12)"):
            sem = (2, range(6, 13))
        m = re.match(r"^(Agathe|Nassim|Odile|Valentin|porteur) \| ([^|]+) \| ([0-9]+)$", l)
        if m and sem and "t1" not in l and "t6" not in l:
            vals = [x.strip() for x in m.group(2).split(",")]
            if m.group(2).strip().startswith("0 ×"):
                vals = ["0"] * len(sem[1])
            g = m.group(1)
            obt = []
            for tx in sem[1]:
                d = S[tx + 2]["revelation"]["devineurs"].get(g)
                obt.append("—" if d is None else str(d["points"]))
            r.eq(n, f"points de {g}, semaine {sem[0]}, par texte", vals, obt)
            k_dim = 7 if sem[0] == 1 else 14
            r.eq(n, f"points de {g}, semaine {sem[0]}", int(m.group(3)), S[k_dim]["dimanche"]["devin"]["points"][g])
        m = re.match(r"^Raisons cachées trouvées, semaine ([12]) \| (.+) \|$", l)
        if m:
            s_ = int(m.group(1))
            k_dim = 7 if s_ == 1 else 14
            ref = {g: int(v) for g, v in re.findall(r"(Agathe|Nassim|Odile|Valentin|porteur)[^;]*?(?:→ )?([0-9]+)(?: ;|$)", m.group(2))}
            r.eq(n, f"raisons cachées trouvées, semaine {s_}", ref, S[k_dim]["dimanche"]["devin"]["raisons"])
        if l.startswith("Texte 13 (hors semaine)"):
            ref = {g: int(v) for g, v in re.findall(r"(Agathe|Nassim|Odile|Valentin|porteur) ([0-9]+)", l)}
            r.eq(n, "points au texte 13", ref, {g: d["points"] for g, d in S[15]["revelation"]["devineurs"].items()})
            r.eq(n, "raisons trouvées au texte 13", 0,
                 sum(1 for d in S[15]["revelation"]["devineurs"].values() if d["raison_trouvee"]))
    # 5 à 7. Titres
    for k, s_ in ((7, 1), (14, 2)):
        dim = S[k]["dimanche"]
        i, l = num(ls, rf"^Semaine {s_} \| le plus de points|^Semaine {s_} \| Nassim 10")
        m = re.search(r"titulaire (\w+), departage \"(\w+)\"", l)
        r.eq(i, f"Le Devin, semaine {s_}", (m.group(1), m.group(2)), (dim["devin"]["titulaire"], dim["devin"]["departage"]))
    # Mystère : tentatives et erreurs par texte
    sem = None
    for n, l in enumerate(ls, 1):
        if l.startswith("Semaine 1, texte par texte"):
            sem = 1
        elif l.startswith("Semaine 2 :"):
            sem = 2
        elif l.startswith("Vérification des comptes"):
            sem = None
        m = re.match(r"^(Agathe|Nassim|Odile|Valentin|porteur) \| (t[0-9]+ .+) \| ([0-9]+)(?: tentatives)?, ([0-9]+)", l)
        if m and sem:
            X = m.group(1)
            for tx, tent, err in re.findall(r"t([0-9]+) ([0-9]+)(?:/([0-9]+))?", m.group(2)):
                tx = int(tx)
                ct = ce = 0
                for _, g, c in cartes_semaine(t, [tx]):
                    if c["auteur_compte"] == X and c["designe"] not in (None, "passe"):
                        ct += 1
                        ce += c["designe"] != X
                r.eq(n, f"Mystère {X} texte {tx}", (int(tent), int(err or 0)), (ct, ce))
            k_dim = 7 if sem == 1 else 14
            dm = S[k_dim]["dimanche"]["mystere"]
            r.eq(n, f"Mystère {X} semaine {sem}", (int(m.group(3)), int(m.group(4))), (dm["tentatives"][X], dm["erreurs"][X]))
        m = re.match(r"^Semaine ([12]) \| .*\| titulaire (\w+)(?: \(« vous »\))?, departage \"(\w+)\"", l)
        if m and section_mystere(ls, n):
            k_dim = 7 if m.group(1) == "1" else 14
            dm = S[k_dim]["dimanche"]["mystere"]
            r.eq(n, f"Le Mystère, semaine {m.group(1)}", (m.group(2), m.group(3)), (dm["titulaire"], dm["departage"]))
    for s_, k in ((1, 7), (2, 14)):
        i, l = num(ls, rf"^Le Fidèle, semaine {s_}")
        r.eq(i, f"Le Fidèle, semaine {s_}", re.findall(r"\[([^\]]*)\]", l)[-1].split(", "), S[k]["dimanche"]["fidele"]["titulaires"])
        i, l = num(ls, rf"^Surprise de la semaine {s_}")
        su = S[k]["dimanche"]["surprise"]
        for tx, a, e_ in re.findall(r"t([0-9]+) : ([0-9]+)(?: attributions)?, ([0-9]+)", l):
            r.eq(i, f"surprise semaine {s_}, texte {tx}", (int(a), int(e_)), (su["attributions"][tx], su["erreurs"][tx]))
        m = re.search(r"texte ([0-9]+)(?: \([^)]*\))?, departage \"(\w+)\"", l)
        r.eq(i, f"surprise semaine {s_}", (m.group(1), m.group(2)), (su["texte"], su["departage"]))
    i, _ = num(ls, r"^Le Sans-Faute \(semaine 2\)")
    r.eq(i, "Le Sans-Faute", [], S[14]["dimanche"]["sans_faute"])
    r.eq(i, "Le Sans-Faute semaine 1", [], S[7]["dimanche"]["sans_faute"])
    i, _ = num(ls, r"^Le Pas de Côté")
    r.eq(i, "Le Pas de Côté", ([], []), (S[7]["dimanche"]["pas_de_cote"], S[14]["dimanche"]["pas_de_cote"]))
    # 8. Agrégats, par séance
    for cle, motif in (("entre_eux", r"^justesse_personnages_entre_eux \|"), ("sur_porteur", r"^justesse_personnages_sur_porteur \|")):
        i, l = num(ls, motif)
        for k, j, tot in re.findall(r"S([0-9]+) ([0-9]+)/([0-9]+)", l):
            k = int(k)
            jj = tt = 0
            for g, m in S[k]["manches"].items():
                if g == "porteur":
                    continue
                for c in m["cartes"]:
                    if (c["auteur_compte"] == "porteur") == (cle == "sur_porteur"):
                        tt += 1
                        jj += c["designe"] == c["auteur_compte"]
            r.eq(i, f"justesse {cle}, séance {k}", (int(j), int(tot)), (jj, tt))
        m = re.search(r"\{justes ([0-9]+), total ([0-9]+)\}", l)
        r.eq(i, f"agrégat {cle}", {"justes": int(m.group(1)), "total": int(m.group(2))},
             t["agregats"]["justesse_personnages_" + ("entre_eux" if cle == "entre_eux" else "sur_porteur")])
    i, _ = num(ls, r"^titres_tires_au_sort \| \|")
    r.eq(i, "titres_tires_au_sort", 1, t["agregats"]["titres_tires_au_sort"])
    # 9. En attendant
    for n, l in enumerate(ls, 1):
        m = re.match(r"^séance ([0-9]+), ([0-9]{2}:[0-9]{2}) \|.*\| \[([^\]]*)\]$", l)
        if m:
            k = int(m.group(1))
            vis = [x for x in m.group(3).split(", ") if x]
            r.eq(n, f"En attendant, séance {k}", [{"heure": m.group(2), "visages": vis}], S[k]["attente"]["lectures"])
    i, _ = num(ls, r"^séance 10 \| journée pas finie")
    r.eq(i, "attente séance 10", None, S[10]["attente"])
    # 10. Mesures
    for s in S:
        k = s["k"]
        me = s["mesures"]
        r.eq(num(ls, r"^Ouvertures \|")[0], f"jours_ecoules séance {k}", None if k == 0 else 1, me["jours_ecoules"])
        r.eq(num(ls, r"^relire \|")[0], f"relire séance {k}", 0, me["relire"])
        att = 0 if k in (0, 1, 15) else (2 if k == 11 else 3)
        r.eq(num(ls, r"^passer \|")[0], f"passer séance {k}", att, me["passer"])
        att = None if k < 3 else (["passe"] * (2 if k == 12 else 3))
        r.eq(num(ls, r"^revelation_verdicts \|")[0], f"revelation_verdicts séance {k}", att, me["revelation_verdicts"])
        r.eq(num(ls, r"^revelation_raison_tentee \|")[0], f"revelation_raison_tentee séance {k}",
             None if k < 3 else False, me["revelation_raison_tentee"])
        r.eq(num(ls, r"^versions \|")[0], f"versions séance {k}", [1], s["versions"])
        et = None if k in (0, 15) else ({"deviner": False, "repondre": True} if k == 1 else {"deviner": True, "repondre": True})
        r.eq(num(ls, r"^etapes \|")[0], f"etapes séance {k}", et, s["etapes"])
        pres = (me["duree_seance"] is not None, me["duree_deviner"] is not None, me["duree_repondre"] is not None)
        att = (True, False, False) if k in (0, 15) else ((True, False, True) if k == 1 else (True, True, True))
        r.eq(num(ls, r"^duree_\* \|")[0], f"présence des durées séance {k}", att, pres)
    r.eq(num(ls, r"^copies \| aucune")[0], "copies", [], t["copies"])
    return r


def feuille_r(t):
    f = REF / "carnet-1-jour-4" / "feuille-de-calcul.txt"
    ls = lignes(f)
    r = R("feuille-de-calcul (r)")
    S = t["seances"]
    for e in ("E1", "E2", "E3"):
        i, l = num(ls, rf"^entree\.textes\.{e}\.inviteuse")
        m = re.search(r"\{niveau ([0-9]), raison ([0-9])\}", l)
        r.eq(i, f"{e} inviteuse", {"niveau": int(m.group(1)), "raison": int(m.group(2))}, S[0]["entree"]["textes"][e]["inviteuse"])
        i, l = num(ls, rf"^entree\.textes\.{e}\.juste")
        r.eq(i, f"{e} juste", l.rstrip().endswith("true"), S[0]["entree"]["textes"][e]["juste"])
    i, l = num(ls, r"^entree\.justes")
    r.eq(i, "entree.justes", int(l.split("|")[-1]), S[0]["entree"]["justes"])
    # portrait par séance (lignes « séance k | S (Σw, Σwπ) → c …, ℓ … »)
    attendu = {}
    for n, l in enumerate(ls, 1):
        m = re.match(r"^séance ([0-4]) \| (.+)$", l)
        if m and "→ c" in l:
            for T, c, ll in re.findall(r"([SPTL]) \([^)]*\) → c (?:[^,]*= )?([0-9/]+), ℓ ([0-9/]+)", m.group(2)):
                attendu[(int(m.group(1)), T)] = (n, c, ll)
        m = re.match(r"^séance ([0-4])(?: ordre_moi)? \|.*(?:ordre_moi \[|\| \[)([SPTL, ]+)\]$", l)
        if m:
            k = int(m.group(1))
            r.eq(n, f"ordre_moi séance {k}", m.group(2).split(", "), S[k]["portrait"]["ordre_moi"])
    # les tensions non citées à une séance sont « inchangées » : on reporte la dernière valeur
    dernier = {}
    for k in range(5):
        for T in "SPTL":
            if (k, T) in attendu:
                dernier[T] = attendu[(k, T)]
            n, c, ll = dernier[T]
            x = S[k]["portrait"]["tensions"][T]
            r.eq(n, f"portrait séance {k} {T}", (c, ll), (x["c"], x["l"]))
    for k in range(1, 5):
        i, l = num(ls, rf"^phrase_jour séance {k} \|")
        m = re.search(r"\{texte \"([0-9])\", classe \"(\w+)\", w \"([0-9/]+)\", pole (null|[01]), phrase \"(.+)\"\}", l)
        r.eq(i, f"phrase_jour séance {k}", {"texte": m.group(1), "classe": m.group(2), "w": m.group(3),
                                            "pole": None if m.group(4) == "null" else int(m.group(4)),
                                            "phrase": m.group(5)}, S[k]["phrase_jour"])
    # manches du porteur : désignations et auteurs comptés
    for k in (2, 3, 4):
        i, l = num(ls, rf"^Séance {k} (?:cartes\[\]\.)?designe")
        ref = [(None if a == "passe" and False else a, None if x == "null" else int(x))
               for a, x in re.findall(r"(Agathe|Nassim|Odile|Valentin|passe), (null|[0-9])", l)]
        r.eq(i, f"designe séance {k}", ref, [(c["designe"], c["raison_devinee"]) for c in S[k]["manches"]["porteur"]["cartes"]])
        i, l = num(ls, rf"^Séance {k} auteur_compte")
        ref = re.findall(r"(Agathe|Nassim|Odile|Valentin)", l.split("|")[-1])
        r.eq(i, f"auteur_compte séance {k}", ref, [c["auteur_compte"] for c in S[k]["manches"]["porteur"]["cartes"]])
    # révélations du porteur
    for k, motif in ((3, r"^revelation séance 3"), (4, r"^revelation séance 4")):
        i, l = num(ls, motif)
        d = S[k]["revelation"]["devineurs"]["porteur"]
        bloc = ls[i - 1:i + 4]
        just = [x.strip() == "true" for x in re.search(r"\[([^\]]*)\]$", bloc[0]).group(1).split(",")]
        r.eq(i, f"révélation {k} justes", just, d["justes"])
        r.eq(i + 1, f"révélation {k} raison_trouvee", bloc[1].rstrip().endswith("true"), d["raison_trouvee"])
        r.eq(i + 2, f"révélation {k} points", int(bloc[2].split("|")[-1]), d["points"])
        r.eq(i + 3, f"révélation {k} points_semaine", int(bloc[3].split("|")[-1]), d["points_semaine"])
        r.eq(i + 4, f"révélation {k} verdicts", json.loads(bloc[4].split("|")[-1]), d["verdicts"])
    # curseurs vus
    i0, l0 = num(ls, r"^séances 0, 1, 2 \(entrée seule\)")
    ent = {}
    for p, blob in re.findall(r"(Agathe|Nassim|Odile|Valentin) ((?:[SPTL] \([^)]*\) ?)+)", l0):
        for T, sw, c, ll in re.findall(r"([SPTL]) \(([0-9/]+), ([0-9/]+), ([0-9/]+)\)", blob):
            ent[(p, T)] = (sw, c, ll)
    i3, l3 = num(ls, r"^séance 3 \(texte 1 en plus\)")
    i4, l4 = num(ls, r"^séance 4 \(texte 2 en plus\)")
    s3 = {(p, "S"): v for p, *v in [(p, sw, c, ll) for p, sw, c, ll in re.findall(r"(Agathe|Nassim|Odile|Valentin) \(([0-9/]+), ([0-9/]+), ([0-9/]+)\)", l3.split("|")[1])]}
    s4 = {(p, "T"): v for p, *v in [(p, sw, c, ll) for p, sw, c, ll in re.findall(r"(Agathe|Nassim|Odile|Valentin) \(([0-9/]+), ([0-9/]+), ([0-9/]+)\)", l4.split("|")[1])]}
    for k in range(5):
        for p in PERS:
            for T in "SPTL":
                ref, ligne = ent[(p, T)], i0
                if k >= 3 and (p, T) in s3:
                    ref, ligne = tuple(s3[(p, T)]), i3
                if k >= 4 and (p, T) in s4:
                    ref, ligne = tuple(s4[(p, T)]), i4
                x = S[k]["curseurs_vus"][p][T]
                r.eq(ligne, f"curseur vu séance {k}, {p} {T}", ref, (x["somme_w"], x["c"], x["l"]))
    # surprises des proches
    for n, l in enumerate(ls, 1):
        m = re.match(r"^séance(?:s)? ([0-9])(?: à ([0-9]))? \|.*\| (Agathe \[.*)$", l)
        if m:
            ks = range(int(m.group(1)), int(m.group(2) or m.group(1)) + 1)
            ref = {p: json.loads("[" + v + "]") for p, v in re.findall(r"(Agathe|Nassim|Odile|Valentin) \[([^\]]*)\]", m.group(3))}
            for k in ks:
                r.eq(n, f"surprises_proches séance {k}", ref, S[k]["surprises_proches"])
    # En attendant
    lect = {}
    for n, l in enumerate(ls, 1):
        m = re.match(r"^séance ([0-9]), ([0-9]{2}:[0-9]{2})(?: \(deux fois\))? \|.*\| (\[.*)$", l)
        if m:
            k = int(m.group(1))
            vis = [json.loads(x) for x in re.findall(r"\[[^\]]*\]", m.group(3))]
            for v in vis:
                lect.setdefault(k, []).append((n, {"heure": m.group(2), "visages": v}))
    for k, lst in lect.items():
        r.eq(lst[0][0], f"En attendant séance {k}", [x for _, x in lst], S[k]["attente"]["lectures"])
    # mesures
    meas = {0: (None, 0, 0, None, None), 1: (0, 0, 0, None, None), 2: (1, 2, 0, None, None),
            3: (2, 1, 1, ["juste", "juste_et_raison", "faux"], True), 4: (0, 1, 0, ["faux", "passe", "faux"], False)}
    for k, att in meas.items():
        i, _ = num(ls, rf"^séance {k} \| ")
        me = S[k]["mesures"]
        r.eq(i, f"mesures séance {k}", att, (me["jours_ecoules"], me["relire"], me["passer"],
                                           me["revelation_verdicts"], me["revelation_raison_tentee"]))
    i, _ = num(ls, r"^copies\[0\]\.mesures")
    me = t["copies"][0]["mesures"]
    r.eq(i, "copies[0].mesures", (0, 1, 0, ["faux", "passe", "faux"], False, True, True, False),
         (me["jours_ecoules"], me["relire"], me["passer"], me["revelation_verdicts"], me["revelation_raison_tentee"],
          me["duree_seance"] is not None, me["duree_deviner"] is not None, me["duree_repondre"] is not None))
    i, _ = num(ls, r"^agregats \|")
    r.eq(i, "agregats", {"justesse_personnages_entre_eux": None, "justesse_personnages_sur_porteur": None,
                         "titres_tires_au_sort": None}, t["agregats"])
    return r


def main():
    ta = json.loads((ICI / "carnet-2-cloture-a" / "trace-c.json").read_text(encoding="utf-8"))
    tr = json.loads((ICI / "carnet-1-jour-4" / "trace-c.json").read_text(encoding="utf-8"))
    out = []
    for r in (feuille_d(ta), feuille_r(tr)):
        out.append(f"{r.nom} : {r.n} valeurs comparées, {len(r.ecarts)} écart(s)")
        out += ["  " + e for e in r.ecarts]
    texte = "\n".join(out) + "\n"
    sys.stdout.write(texte)
    return texte


if __name__ == "__main__":
    main()
