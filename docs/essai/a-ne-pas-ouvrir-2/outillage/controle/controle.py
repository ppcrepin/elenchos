#!/usr/bin/env python3
"""Programme de contrôle (C) du second essai Elenchos — interface en ligne de commande.

Jalon 1 :
  controle-scelle  contrôle 1 (schéma 2, partie 5.1, étapes 1 à 8)
  histoire         trace C de l'histoire (version 1) et résumé (version 1), à partir
                   du fichier scellé seul ; V6 ; comparaison aux traces P et S
  journal          validité d'un journal version 4 (schéma 2, partie 4.4)
  comparer         différences entre deux fichiers JSON (JSON Pointer)

Jalon 2 :
  controles-2-4    contrôles 2, 3 (calibrage refait de r = 1 au r scellé) et 4
  rejouer          trace C (version 4) d'une partie, carnet et copies
  durees           fichier des durées (version 2) tiré d'une trace de la page
  comparer-traces  trace de la page contre trace C (durées masquées)
  carnets          contrôle 13 ; variantes : contrôle 12 ; phrases : phrases attendues v2
  constantes       chiffres constants (fichier caché 2, point 13)
  devoilement      phrases attendues du dévoilement (devoilement.md), pour une partie

Lancer depuis n'importe où : python3 -I controle.py <commande> --help
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))

RACINE = ICI.parents[4]
CACHE2 = RACINE / "docs" / "essai" / "a-ne-pas-ouvrir-2"
TEXTES2 = CACHE2 / "textes"

SOURCES = {
    "S": TEXTES2 / "S-securite-liberte.md",
    "P": TEXTES2 / "P-precaution-innovation.md",
    "T": TEXTES2 / "T-tradition-changement.md",
    "L": TEXTES2 / "L-local-national.md",
    "votes": TEXTES2 / "votes.md",
    "schema": CACHE2 / "schema.md",
    "regles": CACHE2 / "regles-de-calcul-2.md",
    "simulation": RACINE / "docs" / "essai" / "simulation.md",
    "simulation2": RACINE / "docs" / "essai" / "simulation-2.md",
}


def affiche(p):
    p = Path(p).resolve()
    try:
        return str(p.relative_to(RACINE))
    except ValueError:
        return str(p)


def lire_sources(dossier_textes=None, tables=None):
    chemins = dict(SOURCES)
    if dossier_textes:
        d = Path(dossier_textes)
        for k, nom in (("S", "S-securite-liberte.md"), ("P", "P-precaution-innovation.md"),
                       ("T", "T-tradition-changement.md"), ("L", "L-local-national.md"), ("votes", "votes.md")):
            chemins[k] = d / nom
    if tables:
        chemins["tables"] = Path(tables)
    out = {}
    for cle, chemin in chemins.items():
        o = Path(chemin).read_bytes()
        out[cle] = (affiche(chemin), o.decode("utf-8"), o)
    return out


def commit_courant():
    try:
        h = subprocess.run(["git", "-C", str(RACINE), "rev-parse", "HEAD"], capture_output=True,
                           text=True, check=True).stdout.strip()
        sale = subprocess.run(["git", "-C", str(RACINE), "status", "--porcelain", "--",
                               *[str(p) for p in SOURCES.values()]],
                              capture_output=True, text=True, check=True).stdout.strip()
        return h + (" (sources modifiées depuis ce commit : " + sale.replace("\n", " ; ") + ")" if sale else
                    " (sources identiques à ce commit)")
    except Exception:
        return None


def ecrire(texte, sortie):
    if sortie:
        Path(sortie).write_text(texte, encoding="utf-8")
    sys.stdout.write(texte)


def cmd_controle_scelle(a):
    from ec.controle_scelle import controle1
    octets = Path(a.fichier).read_bytes()
    emp = Path(a.empreinte_publiee).read_text(encoding="utf-8") if a.empreinte_publiee else None
    page = Path(a.page).read_bytes() if a.page else None
    es = json.loads(Path(a.empreintes_scellement).read_text(encoding="utf-8")) if a.empreintes_scellement else None
    srcs = lire_sources(a.textes, a.tables)
    b = None
    if a.textes_b is not None:
        b = [int(x) for x in a.textes_b.split(",") if x.strip()]
    texte, verdict = controle1(
        octets, srcs, a.date_scellement, emp, page, es, chemin_fichier=affiche(a.fichier),
        commit=commit_courant(), commit_spec=a.commit_spec, scrutins_b=b, amo_dossiers=a.amo,
        tables_source="tables" if a.tables else "schema")
    ecrire(texte, a.sortie)
    return 0 if verdict["controle1"] in (True, "partiel") and verdict["graine"] is not False else 1


def cmd_histoire(a):
    from ec import canon
    from ec.comparer import comparer_octets
    from ec.histoire import calculer_histoire
    from ec.tirage import sha256_hex
    octets = Path(a.fichier).read_bytes()
    d = canon.lire_strict(octets)
    trace, resume, _, extras = calculer_histoire(d, octets)
    o_trace = canon.octets_canoniques(trace)
    o_resume = extras["resume_octets"]
    if a.trace:
        Path(a.trace).write_bytes(o_trace)
    if a.resume:
        Path(a.resume).write_bytes(o_resume)
    L = ["Programme de contrôle (C), second essai — l'histoire (jours −90 à 0), à partir du fichier scellé seul",
         "=" * 78,
         f"Fichier scellé : {affiche(a.fichier)}",
         f"SHA-256 du fichier scellé : {sha256_hex(octets)}",
         f"Trace C de l'histoire : {affiche(a.trace) if a.trace else '(non écrite)'} — SHA-256 {sha256_hex(o_trace)} "
         f"({len(o_trace)} octets)",
         f"Résumé C : {affiche(a.resume) if a.resume else '(non écrit)'} — SHA-256 {sha256_hex(o_resume)} "
         f"({len(o_resume)} octets)", ""]
    ok = True
    v6 = sha256_hex(o_resume) == d["histoire"]["resume_sha256"]
    ok &= v6
    L.append("V6 (empreinte du résumé recalculé = histoire.resume_sha256) : "
             + ("égale" if v6 else f"DIFFÉRENTE (fichier : {d['histoire']['resume_sha256']})"))
    for nom, chemin in (("au résumé du scellement (resume-histoire.json)", a.resume_scellement),
                        ("à la trace P", a.trace_p), ("à la trace S", a.trace_s)):
        if not chemin:
            L.append(f"Comparaison {nom} : non faite (fichier non fourni)")
            continue
        autre = Path(chemin).read_bytes()
        ref = o_resume if "résumé" in nom else o_trace
        same, diffs = comparer_octets(ref, autre)
        ok &= same
        L.append(f"Comparaison {nom} ({affiche(chemin)}, SHA-256 {sha256_hex(autre)}) : "
                 + ("identique, octet pour octet" if same else f"DIFFÉRENT ({len(diffs)} différences)"))
        for p, x, y in diffs[:a.max_diff]:
            L.append(f"    {p} : C {json.dumps(x, ensure_ascii=False)[:200]} ≠ autre {json.dumps(y, ensure_ascii=False)[:200]}")
    L.append("")
    L.append("Critères du calibrage (fichier caché 2, point 10), recalculés sur ce fichier (information ;"
             " le calibrage refait de r = 1 au r scellé est le contrôle 3, jalon suivant) :")
    for k, (v, x) in extras["criteres"].items():
        L.append(f"  {k} : {'rempli' if v else 'NON rempli'} — {x}")
    L.append("")
    L.append("État à l'arrivée (résumé) :")
    for t in resume["titres"]:
        L.append(f"  semaine {t['semaine']:>2} : Devin {t['devin']}, Mystère {t['mystere']}, Fidèles {t['fidele']}, "
                 f"Sans-Faute {t['sans_faute']}, surprise {t['surprise']}")
    for p, ts in resume["temperaments"].items():
        cur = resume["curseurs"][p]
        L.append(f"  {p} : tempéraments {ts} ; curseurs " + " ; ".join(
            f"{T} c={cur[T]['c']} Σw={cur[T]['somme_w']}" for T in cur))
    pdc = [(j, r["texte"], r["pas_de_cote"]) for j, x in trace["jours"].items()
           if (r := x["revelation"]) and r["pas_de_cote"]]
    L.append(f"  Pas de Côté dans l'histoire : {len(pdc)} révélation(s) : "
             + ", ".join(f"jour {j} {t} {m}" for j, t, m in sorted(pdc, key=lambda z: int(z[0]))))
    L.append("")
    L.append("Verdict : " + ("aucun écart" if ok else "ÉCART(S)"))
    ecrire("\n".join(L) + "\n", a.sortie)
    return 0 if ok else 1


def cmd_journal(a):
    from ec import canon
    from ec.journal import valider
    from ec.tirage import sha256_hex
    octets_s = Path(a.scelle).read_bytes()
    scelle = canon.lire_strict(octets_s)
    oj = Path(a.journal).read_bytes()
    L = [f"Journal : {affiche(a.journal)} (SHA-256 {sha256_hex(oj)})",
         f"Fichier scellé : {affiche(a.scelle)} (SHA-256 {sha256_hex(octets_s)})"]
    ok, j, msg = canon.est_canonique(oj)
    if not ok:
        L.append(f"Règle 1 (forme) : {msg}")
        ecrire("\n".join(L) + "\nVerdict : journal REFUSÉ\n", a.sortie)
        return 1
    conf = Path(a.confusables).read_bytes() if a.confusables else None
    defauts, info = valider(j, scelle, sha256_hex(octets_s), conf)
    L.extend(info)
    for regle, chemin, m in defauts:
        L.append(f"  règle {regle} : {chemin or '/'} : {m}")
    L.append("Verdict : " + ("journal valide" if not defauts else f"journal REFUSÉ ({len(defauts)} défauts)"))
    ecrire("\n".join(L) + "\n", a.sortie)
    return 0 if not defauts else 1


def cmd_controles234(a):
    from ec import canon
    from ec.controles234 import rapport
    octets = Path(a.fichier).read_bytes()
    d = canon.lire_strict(octets)
    premier = Path(a.premier)
    emp = Path(a.empreinte_publiee)
    prof = Path(a.profils)
    texte, verdict = rapport(d, octets, premier.read_bytes(), emp.read_text(encoding="utf-8"),
                             prof.read_text(encoding="utf-8"),
                             {"fichier": affiche(a.fichier), "premier": affiche(premier),
                              "empreinte": affiche(emp), "profils": affiche(prof)})
    ecrire(texte, a.sortie)
    return 0 if all(verdict.values()) else 1


def _scelle(chemin):
    from ec import canon
    o = Path(chemin).read_bytes()
    ok, d, msg = canon.est_canonique(o)
    if not ok:
        raise SystemExit(f"fichier scellé hors forme canonique : {msg}")
    if d.get("format") != "elenchos-essai-scelle" or d.get("version") != 5:
        raise SystemExit("fichier scellé : format ou version inattendus (version 5 attendue)")
    return d, o


def _json(chemin):
    from ec import canon
    o = Path(chemin).read_bytes()
    ok, d, msg = canon.est_canonique(o)
    if not ok:
        raise SystemExit(f"{chemin} : hors forme canonique : {msg}")
    return d


def rejouer_fichiers(scelle, journal, durees=None, confusables=None):
    from ec.journal import valider
    from ec.rejeu import Rejeu
    from ec.trace_schema import valider_trace
    from ec.tirage import sha256_hex
    d, o = _scelle(scelle)
    j = _json(journal)
    defauts, _ = valider(j, d, sha256_hex(o), Path(confusables).read_bytes() if confusables else None)
    if defauts:
        return None, [f"journal invalide, règle {r} : {ch or '/'} : {m}" for r, ch, m in defauts]
    du = None
    if durees:
        du = _json(durees)
        if du.get("format") != "elenchos-essai-durees" or du.get("version") != 2:
            return None, ["fichier des durées : format ou version inattendus (version 2 attendue)"]
        if du.get("partie") != j["partie"]["id"]:
            return None, ["fichier des durées : partie différente de celle du journal"]
    R = Rejeu(d, o, j, du)
    t = R.trace()
    out = [f"durée : {ch} : {m}" for ch, m in R.defauts]
    out += [f"trace C hors schéma : {e}" for e in valider_trace(t)]
    return t, out


def cmd_rejouer(a):
    from ec import canon
    t, defauts = rejouer_fichiers(a.scelle, a.journal, a.durees, a.confusables)
    for x in defauts:
        print("DÉFAUT : " + x, file=sys.stderr)
    if t is None:
        return 1
    o = canon.octets_canoniques(t)
    if a.sortie:
        Path(a.sortie).write_bytes(o)
    else:
        sys.stdout.write(o.decode("utf-8") + "\n")
    if a.textes and t["carnet"] is not None:
        from ec.carnet import masquer_durees
        dd = Path(a.textes)
        dd.mkdir(parents=True, exist_ok=True)
        for nom, x in [("carnet", t["carnet"]["texte"])] + [(f"copie-{i}", c["texte"]) for i, c in enumerate(t["copies"])]:
            (dd / f"{nom}.txt").write_text(x, encoding="utf-8")
            (dd / f"{nom}-durees-masquees.txt").write_text(masquer_durees(x), encoding="utf-8")
    return 1 if defauts else 0


def cmd_durees(a):
    """Fichier des durées, version 2, tiré d'une trace de la page (seules clés lues :
    les durées, partie 4.4)."""
    from ec import canon
    t = _json(a.trace)
    cles = ("duree_deviner", "duree_entree", "duree_repondre", "duree_seance")
    if any(c["sauts"] for c in t["copies"]):
        print("ATTENTION : une copie porte un saut ; ses durées ne sont pas dans la trace (partie 4.4) : "
              "prendre le fichier des durées au point d'accès de la page (`durees()`).", file=sys.stderr)
    out = {"copies": [dict({k: c["mesures"][k] for k in cles}, sauts=[]) for c in t["copies"]],
           "format": "elenchos-essai-durees", "jours": {}, "partie": t["partie"]["id"],
           "sauts": [{"duree_page": s["mesures"]["duree_page"], "duree_saut": s["mesures"]["duree_saut"],
                      "durees_textes": s["mesures"]["durees_textes"], "numero": s["numero"]} for s in t["sauts"]],
           "version": 2}
    for k, x in t["jours"].items():
        m = x["mesures"]
        out["jours"][k] = {c: (None if m is None else m[c]) for c in cles}
    o = canon.octets_canoniques(out)
    if a.sortie:
        Path(a.sortie).write_bytes(o)
    else:
        sys.stdout.write(o.decode("utf-8") + "\n")
    return 0


def cmd_comparer_traces(a):
    from ec import canon
    from ec.comparer import differences
    from ec.rejeu import masquer
    from ec.trace_schema import valider_trace
    tp, tc = _json(a.trace_page), _json(a.trace_c)
    code = 0
    for nom, t in (("page", tp), ("C", tc)):
        e = valider_trace(t)
        if e:
            code = 1
            print(f"trace de {nom} hors schéma ({len(e)}) :")
            for x in e[:200]:
                print(f"  {x}")
    a_, b_ = canon.octets_canoniques(masquer(tp)), canon.octets_canoniques(masquer(tc))
    if a_ == b_:
        print("traces identiques octet pour octet (valeur des durées masquée)")
        return code
    diffs = differences(masquer(tp), masquer(tc))
    print(f"{len(diffs)} différence(s) (chemin : page | C) :")
    for p, x, y in diffs[:a.max_diff]:
        print(f"  {p} : {json.dumps(x, ensure_ascii=False)[:200]} | {json.dumps(y, ensure_ascii=False)[:200]}")
    return 1


def cmd_carnets(a):
    from ec.carnet import masquer_durees
    tc = _json(a.trace_c)
    textes_c = [("carnet final", tc["carnet"]["texte"] if tc["carnet"] else "")] + \
        [(f"copie {i}", c["texte"]) for i, c in enumerate(tc["copies"])]
    textes_p = [("carnet final", Path(a.carnet).read_text(encoding="utf-8"))] + \
        [(f"copie {i}", Path(p).read_text(encoding="utf-8")) for i, p in enumerate(a.copie or [])]
    code = 0
    if len(textes_p) != len(textes_c):
        print(f"{len(textes_p) - 1} copie(s) de la page, {len(textes_c) - 1} dans la trace C")
        code = 1
    for (nom, tp), (_, tcx) in zip(textes_p, textes_c):
        x, y = masquer_durees(tp).split("\n"), masquer_durees(tcx).split("\n")
        diffs = [(i + 1, x[i] if i < len(x) else "‹absente›", y[i] if i < len(y) else "‹absente›")
                 for i in range(max(len(x), len(y))) if (x[i] if i < len(x) else None) != (y[i] if i < len(y) else None)]
        print(f"{nom} : " + ("identique (durées masquées)" if not diffs else f"{len(diffs)} ligne(s) différente(s)"))
        for n, u, v in diffs:
            print(f"  ligne {n} : page {u!r}\n            C    {v!r}")
        code |= 1 if diffs else 0
    return code


def cmd_variantes(a):
    from ec.variantes import comparer_variantes
    traces = [_json(p) for p in a.traces]
    d = comparer_variantes(traces)
    if not d:
        print(f"{len(traces)} variantes : blocs de jour et de saut, mesures identiques ; gabarit tenu ; pseudo absent")
        return 0
    for x in d:
        print(x)
    return 1


def cmd_phrases(a):
    from ec import canon
    from ec.phrases import phrases_attendues
    d, o = _scelle(a.scelle)
    b = canon.octets_canoniques(phrases_attendues(d, o))
    if a.sortie:
        Path(a.sortie).write_bytes(b)
    else:
        sys.stdout.write(b.decode("utf-8") + "\n")
    return 0


def cmd_constantes(a):
    from ec.constantes import rapport
    d, o = _scelle(a.scelle)
    texte, _, js = rapport(d, o)
    if a.json:
        Path(a.json).write_bytes(js)
    ecrire(texte, a.sortie)
    return 0


def cmd_devoilement(a):
    from ec import canon
    from ec.devoilement import phrases_devoilement
    d, o = _scelle(a.scelle)
    j = _json(a.journal) if a.journal else None
    b = canon.octets_canoniques(phrases_devoilement(d, o, j, a.date_publication, a.heure_publication, a.nom_fichier))
    if a.sortie:
        Path(a.sortie).write_bytes(b)
    else:
        sys.stdout.write(b.decode("utf-8") + "\n")
    return 0


def cmd_comparer(a):
    from ec.comparer import comparer_octets
    same, diffs = comparer_octets(Path(a.a).read_bytes(), Path(a.b).read_bytes())
    L = ["identiques, octet pour octet" if same else f"{len(diffs)} différences"]
    for p, x, y in diffs[:a.max_diff]:
        L.append(f"  {p} : {json.dumps(x, ensure_ascii=False)[:200]} ≠ {json.dumps(y, ensure_ascii=False)[:200]}")
    ecrire("\n".join(L) + "\n", None)
    return 0 if same else 1


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="commande", required=True)

    c = sp.add_parser("controle-scelle", help="contrôle 1 (schéma 2, partie 5.1)")
    c.add_argument("fichier")
    c.add_argument("--date-scellement", required=True, help="AAAA-MM-JJ, recopié du rapport de scellement")
    c.add_argument("--commit-spec", help="E : empreinte (40 chiffres) du commit de simulation-2.md relue (§0)")
    c.add_argument("--textes-b", help="scrutins des textes en présentation B, séparés par des virgules "
                                      "(paramètre de l'orchestrateur ; « » pour une liste vide)")
    c.add_argument("--amo", action="append", default=[], help="dossier des données ouvertes contenant json/organe/")
    c.add_argument("--textes", help="dossier des fiches (par défaut a-ne-pas-ouvrir-2/textes/)")
    c.add_argument("--tables", help="fichier des tableaux 2.10, 2.10 bis, 2.11 (par défaut schema.md)")
    c.add_argument("--empreinte-publiee")
    c.add_argument("--page", help="fichier construit de la version du porteur (étape 2)")
    c.add_argument("--empreintes-scellement", help="JSON {nom de fichier: SHA-256} du rapport de scellement")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_controle_scelle)

    c = sp.add_parser("histoire", help="trace C de l'histoire et résumé")
    c.add_argument("fichier")
    c.add_argument("--trace", help="où écrire la trace C de l'histoire (JSON canonique)")
    c.add_argument("--resume", help="où écrire le résumé C (JSON canonique, sans fin de ligne)")
    c.add_argument("--resume-scellement", help="resume-histoire.json du rapport de scellement")
    c.add_argument("--trace-p", help="trace de l'histoire écrite par la page témoin")
    c.add_argument("--trace-s", help="trace de l'histoire écrite par le scellement")
    c.add_argument("--max-diff", type=int, default=40)
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_histoire)

    c = sp.add_parser("journal", help="validité d'un journal version 4 (partie 4.4)")
    c.add_argument("journal")
    c.add_argument("--scelle", required=True)
    c.add_argument("--confusables", help="confusables.txt d'Unicode (règle 6 : squelette du pseudo)")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_journal)

    c = sp.add_parser("controles-2-4", help="contrôles 2, 3 (calibrage refait) et 4 (partie 5.2)")
    c.add_argument("fichier")
    c.add_argument("--premier", default=str(RACINE / "docs" / "essai" / "a-ne-pas-ouvrir" / "fichier-scelle.json"))
    c.add_argument("--empreinte-publiee", default=str(RACINE / "docs" / "essai" / "empreinte.md"))
    c.add_argument("--profils", default=str(RACINE / "docs" / "essai" / "a-ne-pas-ouvrir" / "profils.md"))
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_controles234)

    c = sp.add_parser("rejouer", help="trace C (version 4) d'une partie, à partir du journal")
    c.add_argument("journal")
    c.add_argument("--scelle", required=True)
    c.add_argument("--durees", help="fichier des durées, version 2 (mode interface)")
    c.add_argument("--confusables", help="confusables.txt (règle 6 du journal)")
    c.add_argument("--sortie", help="trace C (JSON canonique)")
    c.add_argument("--textes", help="dossier : carnet final et copies, tels quels et durées masquées")
    c.set_defaults(f=cmd_rejouer)

    c = sp.add_parser("durees", help="fichier des durées (v2) tiré d'une trace de la page")
    c.add_argument("trace")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_durees)

    c = sp.add_parser("comparer-traces", help="trace de la page contre trace C (valeurs des durées masquées)")
    c.add_argument("trace_page")
    c.add_argument("trace_c")
    c.add_argument("--max-diff", type=int, default=200)
    c.set_defaults(f=cmd_comparer_traces)

    c = sp.add_parser("carnets", help="contrôle 13 : carnets de la version du porteur contre trace C")
    c.add_argument("trace_c")
    c.add_argument("--carnet", required=True)
    c.add_argument("--copie", action="append")
    c.set_defaults(f=cmd_carnets)

    c = sp.add_parser("variantes", help="contrôle 12 : traces C des variantes d'une même partie")
    c.add_argument("traces", nargs="+")
    c.set_defaults(f=cmd_variantes)

    c = sp.add_parser("phrases", help="phrases attendues, version 2 (contrôle 11)")
    c.add_argument("--scelle", required=True)
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_phrases)

    c = sp.add_parser("constantes", help="chiffres constants (fichier caché 2, point 13)")
    c.add_argument("--scelle", required=True)
    c.add_argument("--json", help="les chiffres en JSON canonique")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_constantes)

    c = sp.add_parser("devoilement", help="phrases attendues du dévoilement (contrôle 11), pour une partie")
    c.add_argument("--scelle", required=True)
    c.add_argument("--journal", help="journal de la partie (manches ouvertes, réponses du porteur)")
    c.add_argument("--date-publication", help="{date} de l'empreinte publiée, tel qu'affiché")
    c.add_argument("--heure-publication", help="{heure} de l'empreinte publiée, tel qu'affiché")
    c.add_argument("--nom-fichier", help="{fichier} : nom du fichier scellé, tel qu'affiché")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_devoilement)

    c = sp.add_parser("comparer", help="différences entre deux fichiers JSON")
    c.add_argument("a")
    c.add_argument("b")
    c.add_argument("--max-diff", type=int, default=40)
    c.set_defaults(f=cmd_comparer)

    a = p.parse_args(argv)
    return a.f(a)


if __name__ == "__main__":
    sys.exit(main())
