#!/usr/bin/env python3
"""Programme de contrôle (C) de l'essai Elenchos — interface en ligne de commande.

Commandes :
  controle-scelle  contrôle 1 (étapes 1 à 8), contrôles 2 à 4, annexe A
  constantes       chiffres constants du rapport de scellement (fichier caché, §9 bis)
  reglage          200 parties de réglage (fichier caché, §9 bis)
  rejouer          trace C (et carnet) d'une partie, à partir du journal
  comparer         différences entre deux traces (JSON Pointer)
  durees           fichier des durées extrait d'une trace de la page
  carnets          contrôle 13 : carnets de la page contre ceux de C
  variantes        contrôle 12 : variantes d'une même partie
  phrases          phrases attendues du contrôle 11 (schéma, partie 4.5)
  journal          validité d'un journal (schéma, partie 3.12)

Lancer depuis n'importe où : python3 controle.py <commande> --help
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))

RACINE = ICI.parents[4]
CACHE = RACINE / "docs" / "essai" / "a-ne-pas-ouvrir"
CANDIDAT = CACHE / "outillage" / "scellement" / "candidat" / "fichier-scelle-candidat.json"

SOURCES = {
    "S": CACHE / "textes" / "S-securite-liberte.md",
    "P": CACHE / "textes" / "P-precaution-innovation.md",
    "T": CACHE / "textes" / "T-tradition-changement.md",
    "L": CACHE / "textes" / "L-local-national.md",
    "votes": CACHE / "textes" / "votes.md",
    "profils": CACHE / "profils.md",
    "simulation": RACINE / "docs" / "essai" / "simulation.md",
    "schema": CACHE / "schema.md",
}


APPLIQUEES = {
    "regles-de-calcul": CACHE / "regles-de-calcul.md",
    "devoilement": CACHE / "devoilement.md",
}


def lire_sources():
    out = {}
    for cle, chemin in SOURCES.items():
        o = chemin.read_bytes()
        out[cle] = (str(chemin.relative_to(RACINE)), o.decode("utf-8"), o)
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
    from ec.controle_scelle import controle_scelle
    octets = Path(a.fichier).read_bytes()
    emp = Path(a.empreinte_publiee).read_text(encoding="utf-8") if a.empreinte_publiee else None
    if emp is not None and emp.endswith("\n"):
        pass  # les retours à la ligne sont retirés par l'étape 1
    page = Path(a.page).read_bytes() if a.page else None
    es = json.loads(Path(a.empreintes_scellement).read_text(encoding="utf-8")) if a.empreintes_scellement else None
    texte, verdict = controle_scelle(
        octets, lire_sources(), a.date_scellement, a.nb_atypiques, emp, page, es,
        chemin_fichier=str(Path(a.fichier).resolve().relative_to(RACINE))
        if str(Path(a.fichier).resolve()).startswith(str(RACINE)) else a.fichier,
        commit=commit_courant(), detail_complet=a.detail,
        appliquees=[(str(p.relative_to(RACINE)), p.read_bytes()) for p in APPLIQUEES.values()])
    ecrire(texte, a.sortie)
    return 0 if "DÉFAUT" not in texte.splitlines()[-1] else 1


def cmd_constantes(a):
    from ec.constantes import rapport_constantes
    octets = Path(a.fichier).read_bytes()
    texte, _ = rapport_constantes(octets)
    ecrire(texte, a.sortie)
    return 0


def cmd_reglage(a):
    from ec.reglage import rapport_reglage
    octets = Path(a.fichier).read_bytes()
    texte, _ = rapport_reglage(octets, a.parties)
    ecrire(texte, a.sortie)
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="commande", required=True)

    c = sp.add_parser("controle-scelle", help="contrôles 1 à 4 et annexe A")
    c.add_argument("fichier", nargs="?", default=str(CANDIDAT))
    c.add_argument("--date-scellement", required=True, help="AAAA-MM-JJ, recopié du rapport de scellement")
    c.add_argument("--nb-atypiques", type=int, help="nombre donné par le rapport de scellement")
    c.add_argument("--empreinte-publiee", help="fichier texte : l'empreinte telle que publiée")
    c.add_argument("--page", help="fichier construit de la version du porteur (étape 2)")
    c.add_argument("--empreintes-scellement", help="JSON {nom de fichier: SHA-256} relevé par l'agent qui scelle")
    c.add_argument("--detail", action="store_true", help="détail du calcul de chaque réponse")
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_controle_scelle)

    c = sp.add_parser("constantes", help="chiffres constants (§9 bis)")
    c.add_argument("fichier", nargs="?", default=str(CANDIDAT))
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_constantes)

    c = sp.add_parser("reglage", help="200 parties de réglage (§9 bis)")
    c.add_argument("fichier", nargs="?", default=str(CANDIDAT))
    c.add_argument("--parties", type=int, default=200)
    c.add_argument("--sortie")
    c.set_defaults(f=cmd_reglage)

    try:
        from ec import cli2
        cli2.ajouter(sp)
    except ImportError:
        pass

    a = p.parse_args(argv)
    return a.f(a)


if __name__ == "__main__":
    sys.exit(main())
