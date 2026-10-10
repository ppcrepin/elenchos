#!/usr/bin/env python3
"""Fabrique un fichier scellé DE TEST (statut « provisoire »), au format du schéma 2,
et les sources de test qui vont avec, pour éprouver le programme de contrôle avant
le vrai candidat. Écrit par l'auteur du contrôle, sans rien reprendre du code de la
page ni de celui du scellement.

Ce n'est pas un candidat : les rangs des cases, les tableaux 2.10, 2.10 bis et 2.11
et la graine sont des valeurs de test (voir QUESTIONS.md). Les corrections de forme
appliquées aux copies des fiches sont exactement les remplacements proposés dans
le rapport du jalon 1.

Usage : python3 outils/fabriquer_test.py SORTIE [--amo DOSSIER ...] [--calibrer N]
SORTIE reçoit : textes/ (copies corrigées), tables-test.md, fichier-scelle-test.json,
fabrication.txt.
"""

import argparse
import json
import re
import sys
from fractions import Fraction as F
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

from ec import amo, calendrier, canon, regles, sources  # noqa: E402
from ec.controle_scelle import CLES_VECTEURS, ordre_raisons  # noqa: E402
from ec.histoire import calculer_histoire  # noqa: E402
from ec.jeu import ENTREE, HISTOIRE, JOUES, PERSONNAGES  # noqa: E402
from ec.tirage import Tirage, graine_essai2  # noqa: E402

RACINE = ICI.parents[5]
TEXTES = RACINE / "docs" / "essai" / "a-ne-pas-ouvrir-2" / "textes"
PREMIER = RACINE / "docs" / "essai" / "a-ne-pas-ouvrir" / "fichier-scelle.json"
E_TEST = "bd098271689e1cf2c4492ec5ebc1add1e1453d76"   # commit de test, pas celui de la spécification relue

# Fichier caché 2, point 14 : rôles choisis et cases tirées (ordre retenu).
ROLES = {"E1": 1161, "E2": 7386, "E3": 3708, "0": 1262, "14": 5359}
CASES = {"S": [795, 7922, 2190, 8167], "P": [840, 2139, 6770], "T": [2758, 3449], "L": [3370, 707, 2484, 989]}
ORDRE = "S L P S L T S P L S P L S T P".split()


def rangs_des_cases(tg):
    """Fichier caché 2, point 14 (commit 3d8aabf) : cases numérotées i = 1, 2, … dans
    l'ordre de leur liste, triées par t("ordre-texte|tension|i"), vers les rangs libres
    de la tension dans l'ordre du calendrier."""
    out = {}
    roles = {int(k) for k in ROLES if k.isdigit()}
    for T, cases in CASES.items():
        libres = [n for n in range(15) if ORDRE[n] == T and n not in roles]
        tri = sorted(range(1, len(cases) + 1), key=lambda i: tg.cle_tri(f"ordre-texte|{T}|{i}"))
        assert len(libres) == len(tri), (T, libres, tri)
        for n, i in zip(libres, tri):
            out[cases[i - 1]] = n
    for k, s in ROLES.items():
        if k.isdigit():
            out[s] = int(k)
    return out


RE_ENTETE_PROV = re.compile(
    r"^### (?:Case [SPTL](?: \(rang tiré au scellement\))?|T\?|T\{case\}) · scrutin ([0-9]+) \(([0-9]+)e législature\)$")
CORRECTIONS = [
    # (motif, remplacement) : les remplacements proposés au rapport du jalon 1.
    (re.compile(r"^(- Objet du vote : (?:texte|article|amendement|motion|resolution)) \(.*\)$"), r"\1"),
    (re.compile(r"^(  [1-4]\. « .+? ») \(nouvelle, à annoter\)( — .*)$"), r"\1\2"),
    (re.compile(r"^- Titre affiché : (.+?) \(60 car\.\)$"), r"- Titre : \1"),
    (re.compile(r"^(- Tension : [SPTL] ; sens s = [01]) \(.*\)$"), r"\1"),
]


def copier_fiches(sortie, rang_de):
    (sortie / "textes").mkdir(parents=True, exist_ok=True)
    journal = []
    for nom in ("S-securite-liberte.md", "P-precaution-innovation.md", "T-tradition-changement.md",
                "L-local-national.md"):
        lignes = (TEXTES / nom).read_text(encoding="utf-8").split("\n")
        for i, l in enumerate(lignes):
            m = RE_ENTETE_PROV.match(l)
            if m:
                n = rang_de[int(m.group(1))]
                lignes[i] = f"### T{n} · scrutin {m.group(1)} ({m.group(2)}e législature)"
                journal.append(f"{nom}:{i + 1} : en-tête → {lignes[i]}")
                continue
            for motif, rempl in CORRECTIONS:
                if motif.match(l):
                    lignes[i] = motif.sub(rempl, l)
                    journal.append(f"{nom}:{i + 1} : {l[:90]!r} → {lignes[i][:90]!r}")
        (sortie / "textes" / nom).write_text("\n".join(lignes), encoding="utf-8")
    lignes = (TEXTES / "votes.md").read_text(encoding="utf-8").split("\n")
    for i, l in enumerate(lignes):
        m = re.match(r"^\| [SPTL]· \| (1[67])e, ([0-9]+) \|", l)
        if m:
            n = rang_de[int(m.group(2))]
            lignes[i] = l.replace(l[:l.index(" | ", 2)], f"| T{n}", 1)
            journal.append(f"votes.md:{i + 1} : rang → T{n}")
    (sortie / "textes" / "votes.md").write_text("\n".join(lignes), encoding="utf-8")
    return journal


def index_amo(dossiers):
    """{(libelle, législature ou None): [uid]} des organes de groupe (GP, GROUPESENAT)."""
    idx = {}
    for d in dossiers:
        for p in sorted((Path(d) / "json" / "organe").glob("PO*.json")):
            try:
                o = json.loads(p.read_text(encoding="utf-8"))["organe"]
            except (ValueError, KeyError):
                continue
            if o.get("codeType") not in ("GP", "GROUPESENAT", "COMPER", "COMSPSENAT", "COMNL"):
                continue
            leg = o.get("legislature")
            idx.setdefault((o.get("libelle"), leg), set()).add((o["uid"], o.get("codeType")))
    return idx


def tables_test(fiches, dossiers):
    idx = index_amo(dossiers)
    groupes = {}
    for t, f in fiches.items():
        if f["_legere"]:
            continue
        leg = str(f["_leg"])
        a = f["auteur"]
        lst = []
        if a["type"] in ("depute", "senateur") and a["groupe"] is not None:
            lst.append((a["groupe"], "Assemblée" if a["type"] == "depute" else "Sénat"))
        lst += [(r["groupe"], "Assemblée") for r in f["raisons"] if r["groupe"] is not None]
        for g, ch in lst:
            cle = (g, ch, leg if ch == "Assemblée" else "—")
            groupes.setdefault(cle, set())
    lignes = ["### 2.10 Groupes permis (TEST)", "",
              "| `groupe` | Chambre | Législature | Identifiant | Source |", "|---|---|---|---|---|"]
    vus = set()
    manquants = []
    for (g, ch, leg) in sorted(groupes):
        ids = sorted(u for u, ct in idx.get((g, leg if ch == "Assemblée" else None), set())
                     if ct in ("GP", "GROUPESENAT") and u not in vus)
        if ch == "Sénat" and not ids:
            ids = sorted(u for (lib, lg), s in idx.items() if lib == g for u, ct in s if ct == "GROUPESENAT")
        if not ids:
            manquants.append((g, ch, leg))
            ids = [f"PO9{len(manquants):06d}"]   # identifiant fictif, unique (fichier de test)
        vus.update(ids)
        lignes.append(f"| `{g}` | {ch} | {leg} | {', '.join(ids)} | test |")
    lignes += ["", "### 2.10 bis Commissions permises (TEST)", "",
               "| `libelle` | Identifiant | Source |", "|---|---|---|"]
    for t, f in fiches.items():
        if not f["_legere"] and f["auteur"]["type"] == "commission":
            lignes.append(f"| `{f['auteur']['libelle']}` | PO8000001 | test ; forme courte rédigée par Contenu, relue par UX |")
    lignes += ["", "### 2.11 Initiales et élision (TEST)", "", "| `nom` | Initiale | Forme |", "|---|---|---|"]
    noms = sorted({r["nom"] for f in fiches.values() if not f["_legere"] for r in f["raisons"]
                   if r["nom"][0] in sources.INITIALES_CHOIX})
    for n in noms:
        ini = {"H": "h muet", "Y": "son y"}.get(n[0], "voyelle")
        lignes.append(f"| `{n}` | {ini} | `{sources.ACCORD_FORME[ini]}` |")
    lignes.append("")
    return "\n".join(lignes), manquants


def construire(sortie, dossiers, calibrer):
    tg = Tirage(graine_essai2(E_TEST))
    rang_de = rangs_des_cases(tg)
    journal = copier_fiches(sortie, rang_de)
    fichiers = [(p.name, p.read_text(encoding="utf-8")) for p in sorted((sortie / "textes").glob("[SPTL]-*.md"))]
    fiches = sources.lire_fiches(fichiers)
    votes, _ = sources.lire_votes((sortie / "textes" / "votes.md").read_text(encoding="utf-8"))
    tables, manquants = tables_test(fiches, dossiers)
    (sortie / "tables-test.md").write_text(tables, encoding="utf-8")
    elis = sources.lire_elisions(tables, "tables-test.md")
    premier = canon.lire_strict(PREMIER.read_bytes())
    textes = {}
    for t in JOUES:
        f = fiches[t]
        rangs = ordre_raisons(t, tg)
        cons = [None] * 4
        for r in f["raisons"]:
            nom = r["nom"]
            el = (elis[nom][1] == "d'") if nom in elis else False
            cons[rangs[r["i"]] - 1] = {"cote": r["cote"], "depute": {"elision": el, "feminin": r["feminin"],
                                                                       "groupe": r["groupe"], "nom": nom},
                                       "pole": r["pole"], "rang": rangs[r["i"]], "texte": r["texte"]}
        textes[t] = {"auteur": f["auteur"], "considerations": cons, "lien_scrutin": f["lien"],
                     "lignes": f["lignes"], "sens": f["tension"][1], "sources": f["sources"],
                     "tension": f["tension"][0], "titre": f["titre"], "vote": votes[t]["vote"]}
    hist, _ = regles.textes_histoire(tg)
    h_textes = {}
    for hid in HISTOIRE:
        h = hist[hid]
        fiche = None
        if hid == "H86":
            fiche = {"titre": fiches["H86"]["titre"], "vote": votes["H86"]["vote"]}
        h_textes[hid] = {"fiche": fiche, "jour": h["jour"], "raisons": h["raisons"], "sens": h["sens"],
                         "tension": h["tension"]}
    reduits = {t: {"tension": x["tension"], "sens": x["sens"],
                   "considerations": [{"rang": c["rang"], "cote": c["cote"], "pole": c["pole"]}
                                      for c in x["considerations"]]} for t, x in textes.items()}
    for hid, h in h_textes.items():
        reduits[hid] = {"tension": h["tension"], "sens": h["sens"], "considerations": h["raisons"]}
    profils = {p: premier["personnages"][p]["profil"] for p in PERSONNAGES}

    def fichier_pour(r):
        rep = regles.toutes_les_reponses(profils, reduits, tg, r, F(1, 4))
        d = {
            "absences": rep["absences"], "calendrier": calendrier.table_calendrier(),
            "cercle": calendrier.table_cercle(), "format": "elenchos-essai-scelle", "graine": tg.prefixe,
            "histoire": {"resume_sha256": "0" * 64, "textes": h_textes, "tirage": r},
            "personnages": premier["personnages"],
            "reglage": {"alpha": "1/4", "barre": 16, "facteur": 3, "seuils_stricts": False},
            "reponses": rep["reponses"], "reponses_atypiques": rep["atypiques"],
            "semaines": calendrier.table_semaines(), "statut": "provisoire", "textes": textes,
            "vecteurs_test": [{"chaine": tg.chaine(c), "cle": c, "hex8": tg.hex8(c), "n": tg.n(c)}
                              for c in CLES_VECTEURS],
            "version": 5,
        }
        _, _, _, extras = calculer_histoire(d, canon.octets_canoniques(d))
        return d, extras

    rapport = [f"Fichier de TEST, graine = SHA-256(« elenchos-essai-2|graine| » + {E_TEST})[:16] = {tg.prefixe}",
               "Rangs des cases (point 14) : " + ", ".join(f"{s}→T{n}" for s, n in sorted(rang_de.items(), key=lambda x: x[1])),
               f"Groupes sans organe trouvé dans amo (identifiant fictif PO9…) : {manquants or 'aucun'}", ""]
    retenu = None
    for r in range(1, max(1, calibrer) + 1):
        d, extras = fichier_pour(r)
        cr = extras["criteres"]
        ok = all(v[0] for v in cr.values())
        rapport.append(f"r = {r} : " + ("REMPLIT" if ok else "échoue") + " — " +
                       " ; ".join(f"{k} {'oui' if v[0] else 'non'} ({v[1]})" for k, v in cr.items()))
        if ok:
            retenu = r
            break
    if retenu is None:
        rapport.append(f"Aucun r ≤ {calibrer} ne remplit les critères : le fichier de test garde r = 1 "
                       "(c'est un fichier de test, pas un candidat).")
        d, extras = fichier_pour(1)
    d["histoire"]["resume_sha256"] = __import__("hashlib").sha256(extras["resume_octets"]).hexdigest()
    octets = canon.octets_canoniques(d)
    (sortie / "fichier-scelle-test.json").write_bytes(octets)
    (sortie / "fabrication.txt").write_text("\n".join(rapport + ["", "Copies corrigées :"] + journal) + "\n",
                                           encoding="utf-8")
    return octets, rapport


def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("sortie")
    a.add_argument("--amo", action="append", default=[])
    a.add_argument("--calibrer", type=int, default=0, help="essayer r = 1 à N (0 : r = 1 sans calibrage)")
    x = a.parse_args()
    sortie = Path(x.sortie)
    sortie.mkdir(parents=True, exist_ok=True)
    octets, rapport = construire(sortie, x.amo, x.calibrer)
    print("\n".join(rapport))
    print(f"écrit : {sortie / 'fichier-scelle-test.json'} ({len(octets)} octets)")


if __name__ == "__main__":
    main()
