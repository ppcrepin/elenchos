"""Réglage avant scellement (fichier caché, §9 bis) : 200 parties où la place du
joueur est tenue par un joueur simulé, avec le réglage par défaut (trois réponses
atypiques par personnage, seuils non stricts). Les deux décisions se lisent sur les
mêmes 200 parties et ne sont jamais rejouées."""

from collections import Counter
from fractions import Fraction as F

from . import canon, regles
from .controle_scelle import textes_reduits
from .jeu import (PERSONNAGES, MEMBRES, TENSIONS, FERMETES, SEMAINE_REVELATIONS, cote)
from .moteur import Partie, affecter, raison_devinee, cote_seuils
from .tirage import (Tirage, graine_reglage, tirage_reglage, entier_0_100, choix_parmi_trois,
                     sha256_hex)


def profil_simule(ti):
    return {T: {"position": entier_0_100(ti.n(f"position|{T}")),
                "fermete": FERMETES[choix_parmi_trois(ti.n(f"fermete|{T}"))]}
            for T in TENSIONS}


def designer_simule(partie, ti):
    """Le joueur simulé devine par la règle du §3 (rangs t_i, côtés vus §5.4)."""
    def designer(man):
        k = man["_k"]
        txt = partie.textes[man["texte"]]
        T, s = txt["tension"], txt["sens"]
        candidats = list(PERSONNAGES)
        melange = ti.melanger(candidats, f"devine|porteur|{k}|{{}}")
        rangs = {X: i + 1 for i, X in enumerate(melange)}
        cotes = {}
        for X in candidats:
            cur = partie.curseur_membre(X, T, k - 2)
            if cur["somme_w"] == 0:
                cotes[X] = "inconnu"
            else:
                c = cur["c"] if s == 1 else 1 - cur["c"]
                cotes[X] = cote_seuils(c, False)
        affect, _ = affecter(man["cartes"], candidats, rangs, cotes)
        out = []
        for carte, X in zip(man["cartes"], affect):
            r = raison_devinee(cote(carte["_niveau"]), cotes[X], txt) if carte["cachee"] else None
            out.append({"designe": X, "raison": r})
        man["_cotes_joueur"] = cotes
        return out
    return designer


def jouer_partie(d, txts, g_r, i):
    ti = tirage_reglage(g_r, i)
    prof = profil_simule(ti)
    atyp, _ = regles.placer_atypiques(3, ["porteur"], {}, ti, contrainte_c=False)
    reps, _, _ = regles.toutes_les_reponses("porteur", prof, txts, ti, set(atyp["porteur"]), set())
    partie = Partie(d, Tirage(d["graine"]), seuils_stricts=False)
    for tid, r in reps.items():
        partie.poser_reponse_porteur(tid, r)
    des = designer_simule(partie, ti)
    for k in range(2, 16):
        if k >= 3:
            partie.reveler(k)
        if k in (7, 14):
            partie.titres(k)
        if k <= 14:
            partie.jouer_manches(k, des)
    return partie, prof, atyp["porteur"]


def pct(x):
    """Pourcentage à deux décimales, arrondi exact au plus proche (moitié vers le haut)."""
    c = (x * 10000 * 2 + 1) // 2  # centièmes de pour cent
    return f"{c // 100}.{c % 100:02d} %"


class Compte:
    def __init__(self):
        self.j = 0
        self.t = 0

    def add(self, juste):
        self.t += 1
        self.j += 1 if juste else 0

    def frac(self):
        return F(self.j, self.t) if self.t else None

    def __str__(self):
        if not self.t:
            return "pas de carte"
        return f"{self.j}/{self.t} = {pct(F(self.j, self.t))}"


def mesurer(parties):
    m = {
        "joueur": {1: Compte(), 2: Compte(), 13: Compte()},
        "pers_sur_joueur": {1: Compte(), 2: Compte(), 13: Compte()},
        "pers_entre_eux": {1: Compte(), 2: Compte(), 13: Compte()},
        "joueur_par_partie_s2": [],
        "freq_pers": Counter(),
        "freq_joueur": Counter(),
        "titres": {1: Counter(), 2: Counter()},
        "tirages": Counter(),
        "cotes_porteur": Counter(),
    }
    for partie, prof, atyp in parties:
        par_partie = Compte()
        for sem, textes in ((1, SEMAINE_REVELATIONS[1]), (2, SEMAINE_REVELATIONS[2]), (13, [13])):
            for n in textes:
                for g, man in partie.manches[n + 1].items():
                    for c in man["cartes"]:
                        juste = c["designe"] == c["auteur_compte"]
                        if g == "porteur":
                            m["joueur"][sem].add(juste)
                            if sem == 2:
                                par_partie.add(juste)
                        elif c["auteur_compte"] == "porteur":
                            m["pers_sur_joueur"][sem].add(juste)
                        else:
                            m["pers_entre_eux"][sem].add(juste)
        m["joueur_par_partie_s2"].append(par_partie.frac())
        for k in range(2, 15):
            for g, man in partie.manches[k].items():
                f = m["freq_joueur"] if g == "porteur" else m["freq_pers"]
                f["manches"] += 1
                f[f"manches à {len(man['cartes'])} carte(s)"] += 1
                f["cartes"] += len(man["cartes"])
                f["remplacements"] += len(man["remplacements"])
                gi = man.get("_groupes_identiques", [])
                if gi:
                    f["manches avec cartes identiques servies ensemble"] += 1
                    f["cartes identiques servies ensemble"] += sum(gi)
                f["raisons « aucune » affichées"] += sum(1 for c in man["cartes"]
                                                        if not c["cachee"] and c["_raison"] == "aucune")
                f["raisons « aucune » cachées"] += sum(1 for c in man["cartes"]
                                                      if c["cachee"] and c["_raison"] == "aucune")
                f["cartes à raison cachée déplacées (§4.4)"] += 1 if man["_cachee_deplacee"] else 0
                f["égalités de classement (departages)"] += man["departages"]
                if g != "porteur":
                    m["cotes_porteur"][str(man["cotes_attendus"]["porteur"])] += 1
        for k in (7, 14):
            dim = partie.dimanches[k]
            s = dim["semaine"]
            T = m["titres"][s]
            T[("Le Devin", dim["devin"]["titulaire"])] += 1
            T[("Le Mystère", dim["mystere"]["titulaire"])] += 1
            for x in dim["fidele"]["titulaires"]:
                T[("Le Fidèle", x)] += 1
            if not dim["fidele"]["titulaires"]:
                T[("Le Fidèle", None)] += 1
            for x in dim["sans_faute"]:
                T[("Le Sans-Faute", x)] += 1
            T[("Surprise de la semaine", dim["surprise"]["texte"])] += 1
            for nom in ("devin", "mystere", "surprise"):
                m["tirages"][(s, nom, dim[nom]["departage"])] += 1
    return m


def rapport_reglage(octets, nb_parties=200):
    d = canon.lire_strict(octets)
    g_r = graine_reglage(d["graine"])
    txts = textes_reduits(d)
    parties = [jouer_partie(d, txts, g_r, i) for i in range(1, nb_parties + 1)]
    m = mesurer(parties)
    L = []
    L.append("Programme de contrôle (C) — réglage avant scellement (fichier caché, §9 bis)")
    L.append("=" * 78)
    L.append(f"Fichier candidat : SHA-256 {sha256_hex(octets)}")
    nb_at = {p: len(d["reponses_atypiques"][p]) for p in PERSONNAGES}
    L.append(f"Réponses atypiques par personnage dans le fichier : {nb_at} ; seuils stricts dans le fichier : "
             f"{d['reglage']['seuils_stricts']} (le réglage joue toujours seuils non stricts)")
    if set(nb_at.values()) != {3}:
        L.append("ATTENTION : le fichier n'est pas au réglage par défaut (3 réponses atypiques).")
    L.append(f"Graine du fichier : {d['graine']} ; graine de réglage g_R = SHA-256(\"elenchos-essai|reglage|\" + graine)[:16] = {g_r}")
    L.append(f"Parties jouées : {nb_parties} (i = 1 à {nb_parties}) ; t_i(clé) = N(SHA-256(g_R|i|clé)) / 16^8")
    L.append("")
    L.append("Justesse cumulée (Σ justes / Σ cartes servies des manches révélées), auteur après redistribution")
    L.append(f"  joueur simulé, semaine 1 (textes 1 à 5)   : {m['joueur'][1]}")
    L.append(f"  joueur simulé, semaine 2 (textes 6 à 12)  : {m['joueur'][2]}")
    L.append(f"  joueur simulé, texte 13 (hors semaine)    : {m['joueur'][13]}")
    L.append(f"  personnages sur ses cartes, semaine 1     : {m['pers_sur_joueur'][1]}")
    L.append(f"  personnages sur ses cartes, semaine 2     : {m['pers_sur_joueur'][2]}")
    L.append(f"  personnages sur ses cartes, texte 13      : {m['pers_sur_joueur'][13]}")
    L.append(f"  personnages entre eux, semaine 1          : {m['pers_entre_eux'][1]}")
    L.append(f"  personnages entre eux, semaine 2          : {m['pers_entre_eux'][2]}")
    L.append(f"  personnages entre eux, texte 13           : {m['pers_entre_eux'][13]}")
    tot = Compte()
    for s in (1, 2, 13):
        tot.j += m["pers_entre_eux"][s].j
        tot.t += m["pers_entre_eux"][s].t
    L.append(f"  personnages entre eux, textes 1 à 13      : {tot}")
    pp = sorted(x for x in m["joueur_par_partie_s2"] if x is not None)
    if pp:
        q = lambda r: pp[min(len(pp) - 1, int(r * len(pp)))]
        L.append(f"  joueur simulé, semaine 2, partie par partie : min {float(pp[0]):.3f}, 1er quartile {float(q(.25)):.3f}, "
                 f"médiane {float(q(.5)):.3f}, 3e quartile {float(q(.75)):.3f}, max {float(pp[-1]):.3f}")
    L.append("")
    L.append("Côté attendu du joueur par les personnages (toutes leurs manches, 200 parties) : "
             + ", ".join(f"{k} : {v}" for k, v in sorted(m["cotes_porteur"].items())))
    L.append("")
    for nom, f in (("sa manche (constante d'une partie à l'autre)", m["freq_joueur"]),
                   ("les manches des personnages (cumul sur les 200 parties)", m["freq_pers"])):
        L.append(f"Fréquences, {nom} :")
        for k in sorted(f):
            L.append(f"  {k} : {f[k]}")
    L.append("")
    for s in (1, 2):
        L.append(f"Titulaires des titres, semaine {s} (sur {nb_parties} parties) :")
        for titre in ("Le Sans-Faute", "Le Devin", "Le Mystère", "Le Fidèle", "Surprise de la semaine"):
            items = [(k[1], v) for k, v in m["titres"][s].items() if k[0] == titre]
            if items:
                L.append(f"  {titre} : " + ", ".join(
                    f"{x if x is not None else 'personne'} {v}" for x, v in
                    sorted(items, key=lambda kv: (-kv[1], str(kv[0])))))
        L.append("  départages : " + ", ".join(f"{nom} {dep} {v}" for (ss, nom, dep), v in sorted(m["tirages"].items()) if ss == s))
    L.append("")
    j2 = m["joueur"][2].frac()
    p2 = m["pers_sur_joueur"][2].frac()
    L.append("Décision proposée (règles du §9 bis, comparaisons en fractions exactes)")
    if j2 > F(7, 10):
        dec1 = "quatre réponses atypiques par personnage (joueur simulé en semaine 2 strictement au-dessus de 7/10)"
    elif j2 < F(7, 20):
        dec1 = "deux réponses atypiques par personnage (joueur simulé en semaine 2 strictement sous 7/20)"
    else:
        dec1 = "trois réponses atypiques, inchangé (7/20 ≤ justesse ≤ 7/10)"
    L.append(f"  1. Joueur simulé, semaine 2 : {canon.frac(j2)} ({pct(j2)}) → {dec1}")
    if p2 is None:
        dec2 = "aucune carte du joueur servie aux personnages en semaine 2 : pas de décision possible"
    elif p2 > F(3, 5):
        dec2 = "seuils stricts pour le côté attendu du joueur (strictement au-dessus de 3/5)"
    else:
        dec2 = "seuils non stricts, inchangé (≤ 3/5)"
    L.append(f"  2. Personnages sur ses cartes, semaine 2 : {canon.frac(p2) if p2 is not None else '—'}"
             + (f" ({pct(p2)})" if p2 is not None else "") + f" → {dec2}")
    L.append("")
    L.append("Profils tirés (cinq premières parties, pour contrôle à la main) :")
    for i, (partie, prof, atyp) in enumerate(parties[:5], start=1):
        L.append(f"  partie {i} : " + ", ".join(f"{T} {prof[T]['position']} {prof[T]['fermete']}" for T in TENSIONS)
                 + f" ; réponses atypiques aux textes {atyp}")
    return "\n".join(L) + "\n", m
