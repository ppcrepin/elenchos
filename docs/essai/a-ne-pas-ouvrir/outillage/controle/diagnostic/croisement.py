#!/usr/bin/env python3
"""Diagnostic demandé par l'orchestrateur avant le scellement (ne change rien à C).

Sur les 200 parties du réglage (même g_R, même moteur que `controle.py reglage`) :
1. côté attendu (+1 ou \u22121) contre côté réel de la réponse de l'auteur, et
   attribution juste, pour les cartes du joueur simulé et pour celles des
   personnages, dans les manches des personnages ; par sens du texte et par semaine ;
3. justesse du joueur simulé par semaine, avec et sans les réponses atypiques ;
4. dimanches où la surprise de la semaine, ou Le Mystère, va à zéro erreur.
"""

import sys
from collections import defaultdict
from fractions import Fraction as F
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

import controle  # noqa: E402
from ec import canon  # noqa: E402
from ec.controle_scelle import textes_reduits  # noqa: E402
from ec.jeu import cote, PERSONNAGES  # noqa: E402
from ec.reglage import jouer_partie, pct  # noqa: E402
from ec.tirage import graine_reglage, sha256_hex  # noqa: E402


def vus(partie, g, k):
    """Textes du joueur que g a eus dans ses cartes révélées, sur la tension du texte k \u2212 1."""
    T = partie.textes[str(k - 1)]["tension"]
    return [str(m) for m in range(1, k - 1)
            if partie.manches.get(m + 1, {}).get(g) and "porteur" in partie.manches[m + 1][g]["places"]
            and partie.textes[str(m)]["tension"] == T]


def semaine(n):
    return 1 if n <= 5 else (2 if n <= 12 else 13)


def main(chemin=controle.CANDIDAT, nb=200):
    octets = Path(chemin).read_bytes()
    d = canon.lire_strict(octets)
    g_r = graine_reglage(d["graine"])
    txts = textes_reduits(d)
    atyp = {(p, o["texte"]) for p in PERSONNAGES for o in d["reponses_atypiques"][p]}
    # (qui, s, semaine, attendu) -> [cartes, attendu = réel, attribuée juste]
    tab = defaultdict(lambda: [0, 0, 0])
    # mêmes cartes, côté attendu 0 ou inconnu, pour mémoire
    autres = defaultdict(lambda: [0, 0])
    joueur = {1: [0, 0, 0, 0], 2: [0, 0, 0, 0], 13: [0, 0, 0, 0]}  # justes, cartes, justes hors atyp, cartes hors atyp
    # causes des désaccords « attendu ≠ réel » (attendu ±1)
    causes = defaultdict(lambda: defaultdict(int))
    # réconciliation avec le réglage : manches où la carte du joueur est servie,
    # attribution juste comptée après redistribution (auteur_compte = porteur)
    apres = defaultdict(lambda: [0, 0])
    zero_surprise = {1: 0, 2: 0}
    zero_mystere = {1: 0, 2: 0}
    for i in range(1, nb + 1):
        partie, prof, at = jouer_partie(d, txts, g_r, i)
        for k in range(2, 15):
            n = k - 1
            s = partie.textes[str(n)]["sens"]
            sem = semaine(n)
            for g, man in partie.manches[k].items():
                for c in man["cartes"]:
                    juste = c["designe"] == c["auteur_compte"]
                    if g == "porteur":
                        j = joueur[sem]
                        j[0] += juste
                        j[1] += 1
                        if (c["auteur"], str(n)) not in atyp:
                            j[2] += juste
                            j[3] += 1
                        continue
                    X = c["auteur"]
                    att = man["cotes_attendus"][X]
                    qui = "joueur" if X == "porteur" else "personnage"
                    reel = cote(c["_niveau"])
                    if att in (1, -1):
                        t = tab[(qui, s, sem, att)]
                        t[0] += 1
                        t[1] += att == reel
                        t[2] += c["designe"] == X
                        if att != reel:
                            if reel == 0:
                                cause = "réponse neutre"
                            elif (X == "porteur" and n in at) or (X != "porteur" and (X, str(n)) in atyp):
                                cause = "réponse atypique à ce texte"
                            elif X == "porteur" and any(int(m) in at for m in vus(partie, g, k)):
                                cause = "réponse typique ; une réponse atypique du joueur est dans ce qu'il a vu"
                            else:
                                cause = "autre (réponse typique, rien d'atypique vu)"
                            causes[(qui, s)][cause] += 1
                    else:
                        t = autres[(qui, s, sem, str(att))]
                        t[0] += 1
                        t[1] += c["designe"] == X
        for k in range(2, 15):
            for g, man in partie.manches[k].items():
                if g == "porteur" or "porteur" not in man["places"]:
                    continue
                sem = semaine(k - 1)
                a = apres[(sem, str(man["cotes_attendus"]["porteur"]))]
                for c in man["cartes"]:
                    if c["auteur_compte"] == "porteur":
                        a[0] += 1
                        a[1] += c["designe"] == "porteur"
        for k in (7, 14):
            dim = partie.dimanches[k]
            sem = dim["semaine"]
            su = dim["surprise"]
            if su["texte"] is not None and su["erreurs"][su["texte"]] == 0:
                zero_surprise[sem] += 1
            my = dim["mystere"]
            if my["titulaire"] is not None and my["erreurs"][my["titulaire"]] == 0:
                zero_mystere[sem] += 1

    L = []
    L.append("Diagnostic du côté attendu (avant scellement) — programme de contrôle C")
    L.append("=" * 78)
    L.append(f"Fichier : SHA-256 {sha256_hex(octets)} ; g_R = {g_r} ; {nb} parties (celles du réglage)")
    L.append("Portée : manches des personnages, séances 2 à 14 ; « auteur » = auteur d'origine de la carte ;")
    L.append("« attribuée juste » = le personnage désigne cet auteur sur cette carte. Semaine : 1 = textes 1 à 5,")
    L.append("2 = textes 6 à 12, 13 = texte 13. Côtés dans les termes du texte (+1 favorable, \u22121 défavorable).")
    L.append("")
    for qui, titre in (("joueur", "1. Cartes du joueur simulé, côté attendu ±1 (fichier caché, §3, point 2)"),
                       ("personnage", "1 bis. Cartes d'un personnage, côté attendu ±1 (a = p aligné)")):
        L.append(titre)
        L.append(f"  {'s':>2} {'sem.':>4} {'attendu':>7} | {'cartes':>6} | {'attendu = réel':>18} | {'attribuée juste':>18}")
        tot = defaultdict(lambda: [0, 0, 0])
        for s in (0, 1):
            for sem in (1, 2, 13):
                for att in (1, -1):
                    t = tab.get((qui, s, sem, att))
                    if not t or not t[0]:
                        continue
                    for cle in ((s, sem), (s, "tout"), ("tout", sem), ("tout", "tout")):
                        for x in range(3):
                            tot[cle][x] += t[x]
                    L.append(f"  {s:>2} {sem:>4} {att:>+7d} | {t[0]:>6} | {t[1]:>6}/{t[0]:<5} {pct(F(t[1], t[0])):>8} | "
                             f"{t[2]:>6}/{t[0]:<5} {pct(F(t[2], t[0])):>8}")
        L.append("  Sous-totaux (attendu +1 et \u22121 ensemble) :")
        for cle in [(0, 1), (0, 2), (0, 13), (1, 1), (1, 2), (1, 13), (0, "tout"), (1, "tout"),
                    ("tout", 1), ("tout", 2), ("tout", 13), ("tout", "tout")]:
            t = tot.get(cle)
            if not t or not t[0]:
                continue
            L.append(f"  s={str(cle[0]):<4} semaine {str(cle[1]):<4} | {t[0]:>6} | {t[1]:>6}/{t[0]:<5} {pct(F(t[1], t[0])):>8} | "
                     f"{t[2]:>6}/{t[0]:<5} {pct(F(t[2], t[0])):>8}")
        L.append("")
    L.append("Pour mémoire : mêmes cartes quand le côté attendu vaut 0 ou « inconnu » (cartes, attribuées juste)")
    for (qui, s, sem, att), t in sorted(autres.items(), key=lambda kv: (kv[0][0], kv[0][1], kv[0][2], kv[0][3])):
        L.append(f"  {qui:<10} s={s} semaine {sem:<2} attendu {att:<7} : {t[0]:>5} cartes, {t[1]:>5} justes ({pct(F(t[1], t[0]))})")
    L.append("")
    L.append("2. Désaccords « attendu ≠ réel » (attendu ±1), par cause")
    for (qui, s_), cs in sorted(causes.items()):
        L.append(f"  cartes {'du joueur' if qui == 'joueur' else 'des personnages'}, s = {s_} :")
        for cause, nbc in sorted(cs.items(), key=lambda kv: -kv[1]):
            L.append(f"    {nbc:>6}  {cause}")
    L.append("")
    L.append("Réconciliation avec le réglage : cartes dont l'auteur après redistribution est le joueur,")
    L.append("attribuées juste (désigné = joueur), par semaine et par côté attendu du joueur")
    for sem in (1, 2, 13):
        tot = [0, 0]
        for att in ("1", "-1", "0", "inconnu"):
            a = apres.get((sem, att))
            if a and a[0]:
                tot[0] += a[0]
                tot[1] += a[1]
                L.append(f"  semaine {sem:<2} attendu {att:<7} : {a[1]:>5}/{a[0]:<5} {pct(F(a[1], a[0]))}")
        L.append(f"  semaine {sem:<2} total          : {tot[1]:>5}/{tot[0]:<5} {pct(F(tot[1], tot[0]))}")
    L.append("")
    L.append("3. Justesse du joueur simulé (toutes ses cartes servies ; auteur après redistribution)")
    for sem in (1, 2, 13):
        j = joueur[sem]
        L.append(f"  semaine {sem:<2} : toutes les cartes {j[0]}/{j[1]} = {canon.frac(F(j[0], j[1]))} ({pct(F(j[0], j[1]))}) ; "
                 f"sans les réponses atypiques {j[2]}/{j[3]} = {canon.frac(F(j[2], j[3]))} ({pct(F(j[2], j[3]))})")
    L.append("")
    L.append("4. Titres à zéro erreur (sur 200 dimanches par semaine)")
    L.append(f"  surprise de la semaine attribuée à un texte sans attribution fausse : semaine 1 : {zero_surprise[1]} ; "
             f"semaine 2 : {zero_surprise[2]}")
    L.append(f"  Le Mystère attribué avec 0 erreur : semaine 1 : {zero_mystere[1]} ; semaine 2 : {zero_mystere[2]}")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    texte = main()
    (ICI / "croisement-cote-attendu.txt").write_text(texte, encoding="utf-8")
    sys.stdout.write(texte)
