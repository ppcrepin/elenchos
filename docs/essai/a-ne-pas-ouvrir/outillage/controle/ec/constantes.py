"""Chiffres constants du fichier (fichier caché, §9 bis ; simulation, §8.4) : ils
ne dépendent pas des coups du joueur. Calculés par le moteur de C, sur les manches
du joueur aux séances 2 à 14 (textes 1 à 13)."""

from fractions import Fraction as F

from . import canon
from .jeu import PERSONNAGES, TENSIONS, ENTREE, TEXTES, LIBELLE_NIVEAU
from .moteur import Partie
from .tirage import Tirage, sha256_hex


def manches_porteur(d):
    partie = Partie(d, Tirage(d["graine"]))
    return {k: partie.cartes_servies("porteur", k) for k in range(2, 15)}, partie


def groupes_identiques(man):
    groupes = []
    for c in man["cartes"]:
        for g in groupes:
            if (g[0]["_niveau"], g[0]["_raison"]) == (c["_niveau"], c["_raison"]):
                g.append(c)
                break
        else:
            groupes.append([c])
    return [g for g in groupes if len(g) >= 2]


def calculer(d):
    mans, partie = manches_porteur(d)
    atyp = {(p, o["texte"]) for p in PERSONNAGES for o in d["reponses_atypiques"][p]}
    c = {}
    toutes = [(k, carte) for k, m in mans.items() for carte in m["cartes"]]
    c["cartes"] = len(toutes)
    c["cartes_atypiques"] = sum(1 for k, x in toutes if (x["auteur"], str(k - 1)) in atyp)
    c["remplacements"] = [(k, r) for k, m in mans.items() for r in m["remplacements"]]
    gi = {k: groupes_identiques(m) for k, m in mans.items()}
    c["identiques_manches"] = sum(1 for k in gi if gi[k])
    c["identiques_cartes"] = sum(len(g) for k in gi for g in gi[k])
    c["identiques_detail"] = {k: [[x["auteur"] for x in g] for g in gi[k]] for k in gi if gi[k]}
    c["aucune_affichees"] = sum(1 for k, x in toutes if not x["cachee"] and x["_raison"] == "aucune")
    c["aucune_cachees"] = sum(1 for k, x in toutes if x["cachee"] and x["_raison"] == "aucune")
    c["cachees_deplacees"] = [k for k, m in mans.items() if m["_cachee_deplacee"]]
    aucune = {"entree": 0, "devines": 0, "14": 0}
    for tid in TEXTES:
        for p, r in d["reponses"][tid].items():
            if r["raison"] == "aucune":
                aucune["entree" if tid in ENTREE else ("14" if tid == "14" else "devines")] += 1
    c["aucune_scellees"] = aucune
    c["departages"] = sum(m["departages"] for m in mans.values())
    c["departages_detail"] = {k: m["departages"] for k, m in mans.items() if m["departages"]}
    cases = {p: {T: 0 for T in TENSIONS} for p in PERSONNAGES}
    for k, x in toutes:
        cases[x["auteur"]][d["textes"][str(k - 1)]["tension"]] += 1
    for tid in ENTREE:
        cases["Agathe"][d["textes"][tid]["tension"]] += 1
    c["cases_vues"] = cases
    c["cases_signalees"] = [(p, T) for p in PERSONNAGES for T in TENSIONS if cases[p][T] < 2]
    nb_rep = {n: sum(1 for p in PERSONNAGES if p in d["reponses"][str(n)]) for n in range(1, 14)}
    c["min_reponses_personnages"] = min(nb_rep.values())
    c["ecran_5_12_possible"] = c["min_reponses_personnages"] == 0
    c["tailles_manches"] = {k: len(m["cartes"]) for k, m in mans.items()}
    c["rejetes"] = {tid: d["textes"][tid]["vote"]["issue"] for tid in TEXTES
                    if d["textes"][tid]["vote"]["issue"] != "adopte"}
    c["texte_rejete_possible"] = any(d["textes"][str(n)]["vote"]["issue"] == "rejete" for n in range(1, 14))
    return c, mans


def rapport_constantes(octets):
    d = canon.lire_strict(octets)
    c, mans = calculer(d)
    L = []
    L.append("Programme de contrôle (C) — chiffres constants du fichier (fichier caché, §9 bis)")
    L.append("=" * 78)
    L.append(f"Fichier : SHA-256 {sha256_hex(octets)}")
    L.append("Portée : manches du joueur aux séances 2 à 14 (textes 1 à 13), partie menée à la clôture.")
    L.append("")
    L.append(f"Part de réponses atypiques parmi ses cartes : {c['cartes_atypiques']} sur {c['cartes']} "
             f"({canon.frac(F(c['cartes_atypiques'], c['cartes']))}) ; même compte avant et après redistribution.")
    L.append(f"Remplacements de cartes identiques (§4.3, étape 3) : {len(c['remplacements'])}")
    for k, r in c["remplacements"]:
        L.append(f"  séance {k} (texte {k - 1}) : place {r['place']}, {r['ecartee']} écartée, {r['remplacante']} à sa place")
    L.append(f"Cartes identiques servies ensemble : {c['identiques_manches']} manche(s), {c['identiques_cartes']} carte(s)")
    for k, gs in c["identiques_detail"].items():
        L.append(f"  séance {k} (texte {k - 1}) : {gs}")
    L.append("Raisons « aucune » parmi ses cartes :")
    L.append(f"  affichées (cartes non cachées) : {c['aucune_affichees']}")
    L.append(f"  cachées (vraie raison « aucune » de la carte à raison cachée) : {c['aucune_cachees']}")
    L.append(f"  cartes à raison cachée déplacées par le §4.4 : {len(c['cachees_deplacees'])}"
             + (f" (séances {c['cachees_deplacees']})" if c["cachees_deplacees"] else ""))
    a = c["aucune_scellees"]
    L.append(f"Raisons « aucune » parmi les réponses scellées : entrée {a['entree']}, textes devinés (1 à 13) "
             f"{a['devines']}, texte 14 {a['14']} ; total {sum(a.values())}")
    L.append(f"Égalités de classement (somme des `departages` de ses treize manches) : {c['departages']}"
             + (f" ; par séance : {c['departages_detail']}" if c["departages_detail"] else ""))
    L.append("Cases vues (ses cartes par personnage et par tension, plus E1 S, E2 P, E3 L pour Agathe) :")
    L.append("            " + "  ".join(f"{T:>2}" for T in TENSIONS))
    for p in PERSONNAGES:
        L.append(f"  {p:<9} " + "  ".join(f"{c['cases_vues'][p][T]:>2}" for T in TENSIONS))
    L.append("  Cases vues moins de 2 fois (signalées) : "
             + (", ".join(f"{p} {T}" for p, T in c["cases_signalees"]) or "aucune"))
    L.append("Impossibilités :")
    L.append(f"  plus petit nombre de réponses de personnages à un texte 1 à 13 : {c['min_reponses_personnages']} ; "
             f"écran 5.12 : {'possible' if c['ecran_5_12_possible'] else 'impossible'}")
    L.append(f"  « Texte rejeté. » (2.7d, textes 1 à 13) : {'possible' if c['texte_rejete_possible'] else 'impossible'} ; "
             f"issues autres qu'« adopte » sur les 17 textes : {c['rejetes'] or 'aucune'}")
    L.append(f"Tailles de ses manches (séance : cartes) : {c['tailles_manches']}")
    L.append("")
    L.append("Détail de ses manches (ordre d'affichage ; * = carte à raison cachée ; ‡ = réponse atypique)")
    atyp = {(p, o["texte"]) for p in PERSONNAGES for o in d["reponses_atypiques"][p]}
    for k, m in mans.items():
        L.append(f"  séance {k}, texte {k - 1} : classement {m['classement']} ; places {m['places']} ; "
                 f"raison cachée : {m['raison_cachee']}")
        for x in m["cartes"]:
            L.append(f"    {'*' if x['cachee'] else ' '}{'‡' if (x['auteur'], str(k - 1)) in atyp else ' '} "
                     f"{x['auteur']:<9} {LIBELLE_NIVEAU[x['_niveau']]} · raison {x['_raison']}")
    return "\n".join(L) + "\n", c
