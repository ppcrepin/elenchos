"""Commandes du jalon 2 : rejouer, comparer, durees, carnets, variantes, phrases, journal."""

import json
import sys
from pathlib import Path

from . import canon
from .tirage import sha256_hex


def _scelle(chemin):
    o = Path(chemin).read_bytes()
    ok, d, msg = canon.est_canonique(o)
    if not ok:
        raise SystemExit(f"fichier scellé hors forme canonique : {msg}")
    if d.get("format") != "elenchos-essai-scelle" or d.get("version") != 4:
        raise SystemExit("fichier scellé : format ou version inattendus")
    return d, o


def _json(chemin):
    o = Path(chemin).read_bytes()
    ok, d, msg = canon.est_canonique(o)
    if not ok:
        raise SystemExit(f"{chemin} : hors forme canonique (partie 1.1) : {msg}")
    return d


def _ecrire(texte, sortie):
    if sortie:
        Path(sortie).write_text(texte, encoding="utf-8") if isinstance(texte, str) else Path(sortie).write_bytes(texte)
    else:
        sys.stdout.write(texte if isinstance(texte, str) else texte.decode("utf-8"))
        if isinstance(texte, str) and not texte.endswith("\n"):
            sys.stdout.write("\n")


def cmd_journal(a):
    from .journal import valider
    d, o = _scelle(a.scelle)
    j = _json(a.journal)
    defauts = valider(j, d, sha256_hex(o))
    if not defauts:
        print("journal valide (schéma, partie 3.12, règles 1 à 14)")
        return 0
    for r, ch, m in defauts:
        print(f"règle {r} : {ch or '/'} : {m}")
    return 1


def rejouer_fichiers(scelle, journal, durees=None):
    from .journal import valider
    from .rejeu import Rejeu
    from .trace_schema import valider_trace
    d, o = _scelle(scelle)
    j = _json(journal)
    defauts = valider(j, d, sha256_hex(o))
    if defauts:
        return None, [f"journal invalide, règle {r} : {ch or '/'} : {m}" for r, ch, m in defauts]
    du = None
    if durees:
        du = _json(durees)
        if du.get("format") != "elenchos-essai-durees" or du.get("version") != 1:
            return None, ["fichier des durées : format ou version inattendus"]
        if du.get("partie") != j["partie"]["id"]:
            return None, ["fichier des durées : partie différente de celle du journal"]
    R = Rejeu(d, o, j, du)
    t = R.trace()
    out = [f"durée : {ch} : {m}" for ch, m in R.defauts]
    out += [f"trace C hors schéma : {e}" for e in valider_trace(t)]
    return t, out


def cmd_rejouer(a):
    t, defauts = rejouer_fichiers(a.scelle, a.journal, a.durees)
    for x in defauts:
        print("DÉFAUT : " + x, file=sys.stderr)
    if t is None:
        return 1
    _ecrire(canon.octets_canoniques(t), a.sortie)
    if a.carnet and t["carnet"] is not None:
        Path(a.carnet).write_text(t["carnet"]["texte"], encoding="utf-8")
    if a.textes and t["carnet"] is not None:
        from .carnet import masquer_durees
        d = Path(a.textes)
        d.mkdir(parents=True, exist_ok=True)
        textes = [("carnet", t["carnet"]["texte"])] + [(f"copie-{i}", c["texte"]) for i, c in enumerate(t["copies"])]
        for nom, x in textes:
            (d / f"{nom}.txt").write_text(x, encoding="utf-8")
            (d / f"{nom}-durees-masquees.txt").write_text(masquer_durees(x), encoding="utf-8")
    return 1 if defauts else 0


def cmd_durees(a):
    t = _json(a.trace)
    out = {"format": "elenchos-essai-durees", "version": 1, "partie": t["partie"]["id"],
           "seances": [{"k": s["k"], **{k: s["mesures"][k] for k in ("duree_seance", "duree_deviner", "duree_repondre")}}
                       for s in t["seances"]],
           "copies": [{"k": c["k"], **{k: c["mesures"][k] for k in ("duree_seance", "duree_deviner", "duree_repondre")}}
                      for c in t["copies"]]}
    _ecrire(canon.octets_canoniques(out), a.sortie)
    return 0


def cmd_comparer(a):
    from .comparer import comparer_traces
    from .trace_schema import valider_trace
    tp, tc = _json(a.trace_page), _json(a.trace_c)
    code = 0
    for nom, t in (("page", tp), ("C", tc)):
        e = valider_trace(t)
        if e:
            code = 1
            print(f"trace de {nom} hors schéma ({len(e)}) :")
            for x in e[:200]:
                print(f"  {x}")
    ok, diffs = comparer_traces(tp, tc)
    if ok:
        print("traces identiques octet pour octet (valeur des durées masquée)")
        return code
    print(f"{len(diffs)} différence(s) (chemin : page | C) :")
    for p, x, y in diffs:
        print(f"  {p} : {json.dumps(x, ensure_ascii=False)} | {json.dumps(y, ensure_ascii=False)}")
    return 1


def cmd_carnets(a):
    from .comparer import comparer_carnets
    tc = _json(a.trace_c)
    textes_c = [("carnet final", tc["carnet"]["texte"] if tc["carnet"] else None)] + \
        [(f"copie {i}", c["texte"]) for i, c in enumerate(tc["copies"])]
    textes_p = [("carnet final", Path(a.carnet).read_text(encoding="utf-8"))] + \
        [(f"copie {i}", Path(p).read_text(encoding="utf-8")) for i, p in enumerate(a.copie or [])]
    code = 0
    if len(textes_p) != len(textes_c):
        print(f"{len(textes_p) - 1} copie(s) de la page, {len(textes_c) - 1} dans la trace C")
        code = 1
    for (nom, tp), (_, tcx) in zip(textes_p, textes_c):
        ok, diffs = comparer_carnets(tp, tcx or "")
        print(f"{nom} : " + ("identique (durées masquées)" if ok else f"{len(diffs)} ligne(s) différente(s)"))
        for n, x, y in diffs:
            print(f"  ligne {n} : page {x!r}\n            C    {y!r}")
        code |= 0 if ok else 1
    return code


def cmd_variantes(a):
    from .comparer import comparer_variantes
    traces = [_json(p) for p in a.traces]
    d = comparer_variantes(traces)
    if not d:
        print(f"{len(traces)} variantes : blocs de séance, « Questions de fin » et mesures identiques ; gabarit tenu ; pseudo absent")
        return 0
    for x in d:
        print(x)
    return 1


def cmd_resumer(a):
    from .resume import resumer
    _ecrire(resumer(_json(a.trace)), a.sortie)
    return 0


def cmd_phrases(a):
    from .phrases import phrases_attendues
    d, o = _scelle(a.scelle)
    _ecrire(canon.octets_canoniques(phrases_attendues(d, o)), a.sortie)
    return 0


def ajouter(sp):
    import controle as cli
    defaut = str(cli.CANDIDAT)
    c = sp.add_parser("journal", help="validité d'un journal (partie 3.12)")
    c.add_argument("journal")
    c.add_argument("--scelle", default=defaut)
    c.set_defaults(f=cmd_journal)

    c = sp.add_parser("rejouer", help="trace C d'une partie")
    c.add_argument("journal")
    c.add_argument("--scelle", default=defaut)
    c.add_argument("--durees", help="fichier des durées (mode interface)")
    c.add_argument("--sortie", help="trace C (JSON canonique)")
    c.add_argument("--carnet", help="écrit aussi le texte du carnet final")
    c.add_argument("--textes", help="dossier : carnet final et copies, tels quels et durées masquées")
    c.set_defaults(f=cmd_rejouer)

    c = sp.add_parser("durees", help="fichier des durées tiré d'une trace de la page")
    c.add_argument("trace")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_durees)

    c = sp.add_parser("comparer", help="trace de la page contre trace C (partie 4.2)")
    c.add_argument("trace_page")
    c.add_argument("trace_c")
    c.set_defaults(f=cmd_comparer)

    c = sp.add_parser("carnets", help="contrôle 13 : carnets de la version du porteur contre trace C")
    c.add_argument("trace_c")
    c.add_argument("--carnet", required=True, help="texte du carnet final copié sur la page")
    c.add_argument("--copie", action="append", help="texte d'une copie en cours d'essai (dans l'ordre)")
    c.set_defaults(f=cmd_carnets)

    c = sp.add_parser("variantes", help="contrôle 12 : traces C des variantes d'une même partie")
    c.add_argument("traces", nargs="+")
    c.set_defaults(f=cmd_variantes)

    c = sp.add_parser("resumer", help="résumé lisible d'une trace")
    c.add_argument("trace")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_resumer)

    c = sp.add_parser("phrases", help="phrases attendues du contrôle 11 (partie 4.5)")
    c.add_argument("--scelle", default=defaut)
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_phrases)
