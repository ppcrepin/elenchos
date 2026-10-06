#!/usr/bin/env python3
"""Contrôles 6 à 9 sur les journaux du harnais de la page (construction finale).

Étape « journaux » : valide chaque *.journal.json (schéma, partie 3.12, règles 1 à 14)
et rejoue les parties en mode « moteur » (sans durées). Étape « interface » : pour
chaque partie en mode « interface » dont la trace de la page existe, extrait le
fichier des durées (partie 3.12), rejoue, et compare les deux traces (partie 4.2).

Usage, depuis outillage/controle :
  python3 sorties/final/lancer.py journaux
  python3 sorties/final/lancer.py interface DOSSIER_DES_TRACES_DE_LA_PAGE
  python3 sorties/final/lancer.py comparer DOSSIER_DES_TRACES_DE_LA_PAGE
Écrit sous sorties/final/ : traces/<id>.trace-c.json, durees/<id>.durees.json,
textes/<id>/ (carnets), journaux.txt, comparaison.txt.
"""

import json
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
CONTROLE = ICI.parents[1]
sys.path.insert(0, str(CONTROLE))

from ec import canon  # noqa: E402
from ec.carnet import masquer_durees  # noqa: E402
from ec.comparer import comparer_traces  # noqa: E402
from ec.journal import valider  # noqa: E402
from ec.rejeu import Rejeu  # noqa: E402
from ec.tirage import sha256_hex  # noqa: E402
from ec.trace_schema import valider_trace  # noqa: E402

CACHE = CONTROLE.parents[1]
SCELLE = CACHE / "fichier-scelle.json"
JOURNAUX = CACHE / "outillage" / "page" / "sorties" / "final" / "journaux"


def lire(chemin):
    o = Path(chemin).read_bytes()
    ok, d, msg = canon.est_canonique(o)
    if not ok:
        raise ValueError(f"{chemin} : hors forme canonique (partie 1.1) : {msg}")
    return d


def scelle():
    o = SCELLE.read_bytes()
    ok, d, msg = canon.est_canonique(o)
    assert ok and d["format"] == "elenchos-essai-scelle" and d["version"] == 4, msg
    return d, o


def journaux():
    return sorted(JOURNAUX.glob("*.journal.json"), key=lambda p: (not len(p.name.split(".")[0]) == 1, p.name))


def ecrire_textes(t, ident):
    if t["carnet"] is None:
        return
    d = ICI / "textes" / ident
    d.mkdir(parents=True, exist_ok=True)
    for nom, x in [("carnet", t["carnet"]["texte"])] + [(f"copie-{i}", c["texte"]) for i, c in enumerate(t["copies"])]:
        (d / f"{nom}.txt").write_text(x, encoding="utf-8")
        (d / f"{nom}-durees-masquees.txt").write_text(masquer_durees(x), encoding="utf-8")


def rejouer(d, o, j, du):
    R = Rejeu(d, o, j, du)
    t = R.trace()
    defauts = [f"durée : {ch} : {m}" for ch, m in R.defauts] + [f"trace C hors schéma : {e}" for e in valider_trace(t)]
    return t, defauts


def etape_journaux():
    d, o = scelle()
    emp = sha256_hex(o)
    (ICI / "traces").mkdir(exist_ok=True)
    lignes, n_valides, n_moteur, n_rejoues = [], 0, 0, 0
    for p in journaux():
        ident = p.name[:-len(".journal.json")]
        try:
            j = lire(p)
        except ValueError as e:
            lignes.append(f"{ident} : DÉFAUT : {e}")
            continue
        defs = valider(j, d, emp)
        mode = j["partie"]["mode"] if isinstance(j.get("partie"), dict) else "?"
        if defs:
            lignes.append(f"{ident} ({mode}) : journal INVALIDE ({len(defs)} défaut(s))")
            lignes += [f"    règle {r} : {ch or '/'} : {m}" for r, ch, m in defs]
            continue
        n_valides += 1
        K = len(j["seances"]) - 1
        etat = "arrêt au jour " + str(j["arret"]["k"]) if j["arret"] else ("clôture" if j["fin"] else f"séance {K}")
        if mode != "moteur":
            lignes.append(f"{ident} (interface) : journal valide ; {K + 1} séances, {etat}, "
                          f"{len(j['copies'])} copie(s) ; rejeu quand la trace de la page existe")
            continue
        n_moteur += 1
        t, defauts = rejouer(d, o, j, None)
        (ICI / "traces" / f"{ident}.trace-c.json").write_bytes(canon.octets_canoniques(t))
        if defauts:
            lignes.append(f"{ident} (moteur) : journal valide ; rejeu avec {len(defauts)} défaut(s)")
            lignes += [f"    {x}" for x in defauts]
        else:
            n_rejoues += 1
            lignes.append(f"{ident} (moteur) : journal valide ; rejoué, trace C conforme au schéma ({etat})")
    tete = [f"Journaux du harnais (page/sorties/final/journaux/) contre le fichier scellé {emp}",
            f"Journaux lus : {len(journaux())} ; valides (règles 1 à 14) : {n_valides} ; "
            f"en mode moteur : {n_moteur}, rejoués sans défaut : {n_rejoues}", ""]
    texte = "\n".join(tete + lignes) + "\n"
    (ICI / "journaux.txt").write_text(texte, encoding="utf-8")
    sys.stdout.write("\n".join(tete))
    return 0


def trace_page(dossier, ident):
    """La trace de la page pour cette partie : <id>.trace.json ou <id>.trace-p.json, cherchée dans le dossier."""
    for nom in (f"{ident}.trace.json", f"{ident}.trace-p.json", f"{ident}.trace-page.json", f"{ident}/trace.json"):
        p = Path(dossier) / nom
        if p.exists():
            return p
    return None


def durees_de(tp):
    return {"format": "elenchos-essai-durees", "version": 1, "partie": tp["partie"]["id"],
            "seances": [{"k": s["k"], **{k: s["mesures"][k] for k in ("duree_seance", "duree_deviner", "duree_repondre")}}
                        for s in tp["seances"]],
            "copies": [{"k": c["k"], **{k: c["mesures"][k] for k in ("duree_seance", "duree_deviner", "duree_repondre")}}
                       for c in tp["copies"]]}


def etape_interface(dossier):
    """Rejoue les parties en mode interface avec les durées extraites de la trace de la page."""
    d, o = scelle()
    (ICI / "durees").mkdir(exist_ok=True)
    (ICI / "traces").mkdir(exist_ok=True)
    out = []
    for p in journaux():
        ident = p.name[:-len(".journal.json")]
        j = lire(p)
        if j["partie"]["mode"] != "interface":
            continue
        tpp = trace_page(dossier, ident)
        if tpp is None:
            out.append(f"{ident} : trace de la page absente")
            continue
        tp = lire(tpp)
        du = durees_de(tp)
        (ICI / "durees" / f"{ident}.durees.json").write_bytes(canon.octets_canoniques(du))
        if valider(j, d, sha256_hex(o)):
            out.append(f"{ident} : journal invalide, pas de rejeu")
            continue
        t, defauts = rejouer(d, o, j, du)
        (ICI / "traces" / f"{ident}.trace-c.json").write_bytes(canon.octets_canoniques(t))
        ecrire_textes(t, ident)
        out.append(f"{ident} : rejoué" + (f", {len(defauts)} défaut(s)" if defauts else ""))
        out += [f"    {x}" for x in defauts]
    sys.stdout.write("\n".join(out) + "\n")
    return 0


def etape_comparer(dossier):
    out, n, ident_ok, diffs_tot = [], 0, 0, []
    for p in journaux():
        ident = p.name[:-len(".journal.json")]
        tc_p = ICI / "traces" / f"{ident}.trace-c.json"
        tpp = trace_page(dossier, ident)
        if tpp is None or not tc_p.exists():
            out.append(f"{ident} : non comparée (trace {'de la page' if tpp is None else 'de C'} absente)")
            continue
        n += 1
        tp, tc = lire(tpp), lire(tc_p)
        hs = [f"trace de la page hors schéma : {e}" for e in valider_trace(tp)]
        ok, diffs = comparer_traces(tp, tc)
        if ok and not hs:
            ident_ok += 1
            out.append(f"{ident} : identiques octet pour octet (durées masquées)")
            continue
        out.append(f"{ident} : {len(diffs)} différence(s)" + (f" ; {len(hs)} écart(s) au schéma" if hs else ""))
        out += [f"    {x}" for x in hs[:50]]
        for ch, x, y in diffs:
            out.append(f"    {ch} : page {json.dumps(x, ensure_ascii=False)} | C {json.dumps(y, ensure_ascii=False)}")
            diffs_tot.append((ident, ch))
    tete = [f"Comparaison trace contre trace (partie 4.2) : {n} parties comparées ; identiques : {ident_ok} ; "
            f"avec différences : {n - ident_ok}", ""]
    texte = "\n".join(tete + out) + "\n"
    (ICI / "comparaison.txt").write_text(texte, encoding="utf-8")
    sys.stdout.write("\n".join(tete))
    return 0


if __name__ == "__main__":
    quoi = sys.argv[1]
    if quoi == "journaux":
        sys.exit(etape_journaux())
    if quoi == "interface":
        sys.exit(etape_interface(sys.argv[2]))
    if quoi == "comparer":
        sys.exit(etape_comparer(sys.argv[2]))
    raise SystemExit("usage : lancer.py journaux | interface DOSSIER | comparer DOSSIER")
