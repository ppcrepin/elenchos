#!/usr/bin/env python3
"""Programme de scellement du second essai Elenchos (fichier scellé, version 5).

Outillage d'essai (critère de D-031), pas du code applicatif. À ne pas ouvrir avant la fin de
l'essai : ce programme lit le dossier caché `a-ne-pas-ouvrir-2/` et écrit les réponses des
personnages. Adapté du programme du premier essai (`a-ne-pas-ouvrir/outillage/scellement/`,
non modifié) ; écrit sans lire `outillage/page/` ni `outillage/controle/` du second essai.

Ce qu'il fait, dans l'ordre :
  1. lit les sources, sans recopie à la main des données :
     - docs/essai/simulation-2.md (commit courant : graine provisoire) ;
     - a-ne-pas-ouvrir/fichier-scelle.json (personnages, contrôle 2 : SHA-256 = empreinte publiée
       dans docs/essai/empreinte.md) ;
     - a-ne-pas-ouvrir-2/regles-de-calcul-2.md, point 14 : ordre retenu, rôles, cases, présentation B ;
     - a-ne-pas-ouvrir-2/textes/{S,P,T,L}-*.md : les 18 fiches jouées et la fiche légère H86 ;
     - a-ne-pas-ouvrir-2/textes/votes.md : objet, issue, date, étape, suite ;
     - a-ne-pas-ouvrir-2/schema.md, partie 2.4 : tables du calendrier et des semaines (contrôle croisé) ;
  2. tire les cases t("ordre-texte|tension|i") et l'ordre des raisons t("ordre-raisons|X|i") ;
  3. construit les 90 textes abstraits H1 à H90 (fichier caché, point 2 bis) ;
  4. calcule les réponses de la période d'essai (E1 à E3, T0 à T14 : ne dépendent pas de r) ;
  5. calibre l'histoire (fichier caché, point 10) : pour r = 1, 2, … : absences, réponses atypiques
     et réponses de H1 à H90, puis les jours −90 à 0 (manches, révélations, Pas de Côté),
     les titres des semaines 1 à 13, les tempéraments du jour 0, les curseurs à l'arrivée,
     et les critères c1 à c5 ; retient le premier r qui les remplit tous ;
  6. écrit le fichier candidat (JSON canonique), le résumé de l'histoire (schéma partie 3),
     la trace S de l'histoire (schéma partie 4.2), le rapport ;
  7. relit les octets écrits et vérifie ce qu'il peut du contrôle 1 (schéma 5.1, étapes 3 à 7).

Usage :
  python3 sceller.py [--statut provisoire] [--commit E] [--alpha 1/4] [--facteur 3]
                     [--seuils-stricts] [--sortie DOSSIER] [--jour AAAA-MM-JJ]
Python 3.11, bibliothèque standard seulement. Toute anomalie arrête le programme (code 1).
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from fractions import Fraction as Fr
from itertools import permutations
from pathlib import Path

# ---------------------------------------------------------------------------
# Emplacements
# ---------------------------------------------------------------------------

ICI = Path(__file__).resolve().parent
RACINE = ICI.parents[4]  # .../elenchos
ESSAI = RACINE / "docs" / "essai"
CACHE1 = ESSAI / "a-ne-pas-ouvrir"
CACHE = ESSAI / "a-ne-pas-ouvrir-2"
TEXTES_DIR = CACHE / "textes"
F_SIMULATION = ESSAI / "simulation-2.md"
F_EMPREINTE1 = ESSAI / "empreinte.md"
F_SCELLE1 = CACHE1 / "fichier-scelle.json"
F_PROFILS1 = CACHE1 / "profils.md"
F_REGLES = CACHE / "regles-de-calcul-2.md"
F_SCHEMA = CACHE / "schema.md"
F_VOTES = TEXTES_DIR / "votes.md"
F_FICHES = [TEXTES_DIR / n for n in (
    "S-securite-liberte.md", "P-precaution-innovation.md",
    "T-tradition-changement.md", "L-local-national.md")]
F_CONVENTIONS = CACHE1 / "textes" / "conventions.md"
F_SCHEMA1 = CACHE1 / "schema.md"
SORTIE_DEFAUT = ICI / "candidat-1"

# ---------------------------------------------------------------------------
# Constantes de la spécification (noms, pas données du lot)
# ---------------------------------------------------------------------------

PERSONNAGES = ["Agathe", "Nassim", "Odile", "Valentin"]  # schéma 1.3
MEMBRES = PERSONNAGES + ["porteur"]
TENSIONS = ["S", "P", "T", "L"]
ENTREE = ["E1", "E2", "E3"]
HIST = [f"H{i}" for i in range(1, 91)]
ESSAI_T = [str(n) for n in range(0, 15)]
TEXTES = ENTREE + HIST + ESSAI_T  # schéma 1.3
JOUEES = ENTREE + ESSAI_T
DEPUIS = {"Agathe": -90, "Nassim": -90, "Odile": -90, "Valentin": -90, "porteur": 1}  # schéma 2.3
M_FERMETE = {"faible": Fr(6, 10), "moyenne": Fr(1), "forte": Fr(16, 10)}  # règle 2.1
VALEUR = {1: Fr(0), 2: Fr(1, 4), 3: Fr(1, 2), 4: Fr(3, 4), 5: Fr(1)}  # §0
CLES_VECTEURS = ["raison|Odile|E2|3", "hasard|Nassim|13|porteur", "ecart-hstar|1|Valentin"]  # §0
NOMS_JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
TEMPERAMENTS = ["original", "pont", "mesure", "tranche"]
ATTENDU_C1 = {"Agathe": {"S", "P", "L"}, "Nassim": {"S", "P", "L"},
              "Odile": {"S", "P", "T", "L"}, "Valentin": {"P", "T", "L"}}  # fichier caché, point 10
ATTENDU_C2 = {"Agathe": [], "Nassim": [], "Odile": ["original", "tranche"], "Valentin": ["pont"]}  # point 7
PHRASE_B = "Cet amendement supprimerait tout l'article qui prévoit ces mesures."  # A.7, point 14
LETTRE = "A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ"
INITIALES_PERMISES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") | set("ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
INITIALES_CHOIX = set("AEIOUYH") | set("ÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÆŒ")
SEUIL_NET = Fr(10)
PENCHE = Fr(1, 5)


class Defaut(Exception):
    """Toute anomalie : le programme s'arrête."""


def exiger(cond: bool, message: str) -> None:
    if not cond:
        raise Defaut(message)


# ---------------------------------------------------------------------------
# Tirage déterministe (§0 du premier essai, inchangé)
# ---------------------------------------------------------------------------

class Tirage:
    def __init__(self, graine: str):
        self.graine = graine
        self._n: dict[str, int] = {}

    def n(self, cle: str) -> int:
        v = self._n.get(cle)
        if v is None:
            exiger(cle.isascii() and " " not in cle, f"clé de tirage non ASCII ou avec espace : {cle!r}")
            v = int(hashlib.sha256((self.graine + "|" + cle).encode("utf-8")).hexdigest()[:8], 16)
            self._n[cle] = v
        return v

    def tri(self, cle: str) -> tuple[int, bytes]:
        """Clé de tri de t(clé) : N d'abord, puis la clé en octets (égalité exacte de t)."""
        return (self.n(cle), cle.encode("utf-8"))

    def inf(self, cle: str, seuil: Fr) -> bool:
        """t(clé) < seuil, exactement : N / 16⁸ < a / b."""
        return self.n(cle) * seuil.denominator < seuil.numerator * 16 ** 8


# ---------------------------------------------------------------------------
# Forme canonique (schéma 1.1 de S1)
# ---------------------------------------------------------------------------

def jsonable(x):
    if isinstance(x, Fr):
        return str(x)
    if isinstance(x, dict):
        return {k: jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [jsonable(v) for v in x]
    return x


def canonique(objet) -> bytes:
    return json.dumps(jsonable(objet), ensure_ascii=False, sort_keys=True, separators=(",", ":"),
                      allow_nan=False).encode("utf-8")


def sha(octets: bytes) -> str:
    return hashlib.sha256(octets).hexdigest()


# ---------------------------------------------------------------------------
# Lecture des sources
# ---------------------------------------------------------------------------

def lire(chemin: Path) -> str:
    texte = chemin.read_bytes().decode("utf-8")
    exiger(unicodedata.normalize("NFC", texte) == texte, f"{chemin.name} n'est pas en NFC")
    return texte


def lignes_tableau(bloc: str, entete: str) -> list[list[str]]:
    lignes = bloc.split("\n")
    idx = [i for i, l in enumerate(lignes) if l == entete]
    exiger(len(idx) == 1, f"en-tête de tableau introuvable ou en double : {entete}")
    i = idx[0]
    exiger(re.fullmatch(r"\|(-+\|)+", lignes[i + 1]) is not None, f"séparateur absent sous {entete}")
    n_col = entete.count("|") - 1
    rangs = []
    for l in lignes[i + 2:]:
        if not l.startswith("|"):
            break
        morceaux = l.split("|")
        cellules = [c.strip(" ") for c in morceaux[1:-1]]
        exiger(len(cellules) == n_col, f"ligne de tableau à {len(cellules)} cellules : {l}")
        rangs.append(cellules)
    return rangs


def commit_simulation() -> str:
    """Le commit courant de simulation-2.md (graine provisoire du candidat 1)."""
    r = subprocess.run(["git", "-C", str(RACINE), "log", "-1", "--format=%H", "--", str(F_SIMULATION)],
                       capture_output=True, text=True, check=True)
    e = r.stdout.strip()
    exiger(re.fullmatch(r"[0-9a-f]{40}", e) is not None, f"commit de simulation-2.md illisible : {e!r}")
    st = subprocess.run(["git", "-C", str(RACINE), "status", "--porcelain", "--", str(F_SIMULATION)],
                        capture_output=True, text=True, check=True).stdout.strip()
    exiger(st == "", "simulation-2.md a des modifications non commitées : la graine ne serait pas celle d'un commit")
    return e


def lire_personnages() -> dict:
    """Contrôle 2 : le sous-objet `personnages` du premier fichier scellé, dont le SHA-256 doit égaler
    l'empreinte publiée (docs/essai/empreinte.md)."""
    octets = F_SCELLE1.read_bytes()
    publiee = re.findall(r"En une ligne : `([0-9a-f]{64})`", lire(F_EMPREINTE1))
    exiger(len(publiee) == 1, "empreinte publiée du premier essai introuvable")
    exiger(sha(octets) == publiee[0], "le premier fichier scellé n'a pas l'empreinte publiée")
    p = json.loads(octets.decode("utf-8"))["personnages"]
    exiger(list(sorted(p)) == PERSONNAGES, "personnages du premier fichier")
    # Contrôle croisé avec profils.md (tableau des positions et fermetés).
    txt = lire(F_PROFILS1).split("## Profils cachés", 1)[1].split("\n## ", 1)[0]
    for prenom, *vals in lignes_tableau(txt, "| | S | P | T | L |"):
        for t, v in zip(TENSIONS, vals):
            m = re.fullmatch(r"([01]),([0-9]{2}) (faible|moyenne|forte)", v)
            exiger(m is not None, f"profils.md illisible : {v}")
            exiger(p[prenom]["profil"][t] == {"position": 100 * int(m.group(1)) + int(m.group(2)),
                                              "fermete": m.group(3)}, f"profil de {prenom} sur {t} ≠ profils.md")
    return p


def lire_point14() -> dict:
    texte = lire(F_REGLES)
    res = {}
    m = re.findall(r"^  - T0 à T14 : ((?:[SPTL] (?:\| )?)+[SPTL])\.$", texte, re.M)
    exiger(len(m) == 1, "ordre retenu introuvable (point 14)")
    res["ordre"] = [c for c in m[0] if c in "SPTL"]
    exiger(len(res["ordre"]) == 15, "ordre retenu : 15 textes attendus")
    m = re.findall(r"^  - Entrée : E1 ([SPTL]), E2 ([SPTL]), E3 ([SPTL]), dans cet ordre\.$", texte, re.M)
    exiger(len(m) == 1, "tensions de l'entrée introuvables (point 14)")
    res["entree"] = list(m[0])
    m = re.findall(r"E1 = ([0-9]+), E2 = ([0-9]+), E3 = ([0-9]+), T0 = ([0-9]+), T14 = ([0-9]+)\.", texte)
    exiger(len(m) == 1, "rôles choisis introuvables (point 14)")
    res["roles"] = dict(zip(["E1", "E2", "E3", "0", "14"], m[0]))
    cases = {}
    for t in TENSIONS:
        m = re.findall(rf"Cases {t} : ([0-9]+(?:, [0-9]+)*)\.", texte)
        exiger(len(m) == 1, f"cases {t} introuvables (point 14)")
        cases[t] = m[0].split(", ")
    res["cases"] = cases
    m = re.findall(r"Ici : ([0-9]+) en A ; ([0-9, et]+) en B\.", texte)
    exiger(len(m) == 1, "présentations A et B introuvables (point 14)")
    res["A"] = [m[0][0]]
    res["B"] = re.split(r", | et ", m[0][1])
    return res


def lire_tables_calendrier() -> tuple[list[list[str]], list[list[str]]]:
    texte = lire(F_SCHEMA)
    cal = lignes_tableau(texte, "| jour | nom_jour | type | saut | revele | revelation_porteur | manche | deviner_porteur | repondu |")
    sem = lignes_tableau(texte, "| numero | premier_jour | dernier_jour |")
    return cal, sem


def lire_votes() -> dict:
    rangs = lignes_tableau(lire(F_VOTES),
                           "| Rang | Scrutin | `objet` | `issue` | `date` | `etape` | `suite` | Preuve principale |")
    votes = {}
    for rang, scrutin, objet, issue, date, etape, suite, _p in rangs:
        m = re.fullmatch(r"(1[67])e, ([0-9]+)", scrutin)
        exiger(m is not None, f"votes.md : scrutin illisible {scrutin}")
        exiger(m.group(2) not in votes, f"votes.md : scrutin {m.group(2)} en double")
        votes[m.group(2)] = {"rang": rang, "legislature": m.group(1), "objet": objet, "issue": issue,
                             "date": date, "etape": etape, "suite": None if suite == "null" else suite}
    return votes


RE_ENTETE = re.compile(r"### (.+?) · scrutin ([0-9]+) \((1[67])e législature\)")
RE_RAISON = re.compile(
    r"  ([1-4])\. « (.+?) »( \(nouvelle, à annoter\))? — (pour|contre) · pôle (0|1|aucun) — "
    r"([^,\[\]]+), (député|députée), (.+?) \[vote : ([^\]]+)\] — extrait : .+")


def lire_fiches() -> tuple[dict, list[str]]:
    """Fiches par scrutin. Rend aussi les écarts de forme relevés (pour QUESTIONS et le rapport)."""
    fiches = {}
    ecarts: list[str] = []
    for chemin in F_FICHES:
        lignes = lire(chemin).split("\n")
        debuts = [i for i, l in enumerate(lignes) if l.startswith("### ")]
        for a, i in enumerate(debuts):
            l = lignes[i]
            if l.startswith("### Réserve") or l.startswith("### (écartée)"):
                continue
            m = RE_ENTETE.fullmatch(l)
            exiger(m is not None, f"{chemin.name} : en-tête inattendu : {l}")
            etiquette, scrutin, leg = m.groups()
            exiger(scrutin not in fiches, f"fiche {scrutin} en double")
            bloc = lignes[i + 1:(debuts[a + 1] if a + 1 < len(debuts) else len(lignes))]
            if etiquette == "H86":
                f = analyser_fiche_legere(bloc, ecarts)
            else:
                f = analyser_fiche(scrutin, bloc, ecarts)
            f.update({"etiquette": etiquette, "scrutin": scrutin, "legislature": leg, "fichier": chemin.name})
            if not re.fullmatch(r"E[1-3]|T(?:[0-9]|1[0-4])|H86", etiquette):
                ecarts.append(f"en-tête provisoire « {etiquette} » ({scrutin}, {chemin.name})")
            fiches[scrutin] = f
    return fiches, ecarts


def champs_fiche(bloc: list[str]) -> dict[str, list[str]]:
    champs: dict[str, list[str]] = {}
    courant = None
    for l in bloc:
        if l.startswith("- "):
            nom = l[2:].split(" :", 1)[0]
            courant = nom
            exiger(nom not in champs, f"champ « {nom} » en double")
            champs[nom] = [l]
        elif l.startswith("  ") and courant is not None:
            champs[courant].append(l)
        else:
            courant = None
    return champs


def analyser_fiche_legere(bloc: list[str], ecarts: list[str]) -> dict:
    ch = champs_fiche(bloc)
    cle_titre = "Titre" if "Titre" in ch else "Titre affiché"
    if cle_titre != "Titre":
        ecarts.append("H86 : la ligne s'appelle « Titre affiché », le schéma (5.1, étape 8) lit « Titre »")
    m = re.fullmatch(rf"- {cle_titre} : (.+?)(?: \([0-9]+ car\.\))?", ch[cle_titre][0])
    exiger(m is not None, "H86 : titre illisible")
    if re.search(r" \([0-9]+ car\.\)$", ch[cle_titre][0]):
        ecarts.append("H86 : le titre est suivi de « (60 car.) », retiré à la lecture")
    m2 = re.fullmatch(r"- Tension : ([SPTL]) ; sens s = ([01])(?: \(.*\))?", ch["Tension"][0])
    exiger(m2 is not None, "H86 : tension illisible")
    if ch["Tension"][0] != f"- Tension : {m2.group(1)} ; sens s = {m2.group(2)}":
        ecarts.append("H86 : la ligne Tension porte un commentaire après le sens")
    return {"titre": m.group(1), "tension": m2.group(1), "sens": int(m2.group(2)), "legere": True}


def analyser_fiche(scrutin: str, bloc: list[str], ecarts: list[str]) -> dict:
    ch = champs_fiche(bloc)
    for requis in ("Titre", "Lignes", "Vote", "Objet du vote", "Auteur", "Lien du scrutin", "Sources",
                   "Tension", "Raisons"):
        exiger(requis in ch, f"{scrutin} : champ « {requis} » absent")
    titre = re.fullmatch(r"- Titre : (.+)", ch["Titre"][0]).group(1)
    exiger(ch["Lignes"][0] == "- Lignes :", f"{scrutin} : champ Lignes")
    lignes = []
    for j, l in enumerate(ch["Lignes"][1:], 1):
        m = re.fullmatch(rf"  {j}\. (.+)", l)
        exiger(m is not None, f"{scrutin} : ligne {j} illisible")
        lignes.append(m.group(1))
    exiger(len(lignes) == 3, f"{scrutin} : {len(lignes)} lignes")
    v = ch["Vote"][0]
    issue_fiche = "adopte" if v.startswith("- Vote : adopté") else ("rejete" if v.startswith("- Vote : rejeté") else None)
    exiger(issue_fiche is not None, f"{scrutin} : issue du vote illisible")
    m = re.fullmatch(r"- Objet du vote : (texte|article|amendement|motion|resolution)( \(.*\))?", ch["Objet du vote"][0])
    exiger(m is not None, f"{scrutin} : objet du vote illisible : {ch['Objet du vote'][0]}")
    objet = m.group(1)
    if m.group(2):
        ecarts.append(f"{scrutin} : « - Objet du vote : {objet}{m.group(2)} » (le schéma 5.1, étape 8, attend le mot seul)")
    a = ch["Auteur"][0]
    if re.fullmatch(r"- Auteur : Gouvernement ;.*", a):
        auteur = {"type": "gouvernement"}
    elif a.startswith("- Auteur : Commission : "):
        m = re.fullmatch(r"- Auteur : Commission : (.+?)(?: ;|\.)(?: .*)?", a)
        exiger(m is not None, f"{scrutin} : auteur commission illisible")
        auteur = {"type": "commission", "libelle": m.group(1)}
    else:
        m = re.fullmatch(r"- Auteur : ([^,]+), (député|députée|sénateur|sénatrice), (.+?)"
                         r"(?: au dépôt(?: \(.*|\.| ;.*)?| ; .*|\.(?: .*)?)", a)
        exiger(m is not None, f"{scrutin} : auteur illisible : {a[:120]}")
        g = m.group(3)
        auteur = {"type": "senateur" if m.group(2).startswith("sénat") else "depute", "nom": m.group(1),
                  "feminin": m.group(2) in ("députée", "sénatrice"), "groupe": None if g == "sans groupe" else g}
        exiger(not (auteur["type"] == "senateur" and auteur["groupe"] is None), f"{scrutin} : sénateur sans groupe")
    lien = re.fullmatch(r"- Lien du scrutin : (https://\S+)", ch["Lien du scrutin"][0]).group(1)
    exiger(ch["Sources"][0] == "- Sources :", f"{scrutin} : champ Sources")
    sources = []
    for l in ch["Sources"][1:]:
        m = re.fullmatch(r"  - (https://\S+)", l)
        exiger(m is not None, f"{scrutin} : source illisible : {l}")
        sources.append(m.group(1))
    exiger(sources, f"{scrutin} : aucune source")
    m = re.fullmatch(r"- Tension : ([SPTL]) ; sens s = ([01])", ch["Tension"][0])
    exiger(m is not None, f"{scrutin} : tension illisible")
    tension, sens = m.group(1), int(m.group(2))
    exiger(ch["Raisons"][0] == "- Raisons :", f"{scrutin} : champ Raisons")
    raisons = []
    for j, l in enumerate(ch["Raisons"][1:], 1):
        m = RE_RAISON.fullmatch(l)
        exiger(m is not None and int(m.group(1)) == j, f"{scrutin} : raison {j} illisible : {l[:100]}")
        if m.group(3):
            ecarts.append(f"{scrutin} : raison {j} marquée « (nouvelle, à annoter) » (marque retirée à la lecture)")
        g = m.group(8)
        raisons.append({"numero_fiche": j, "texte": m.group(2), "cote": m.group(4),
                        "pole": "aucun" if m.group(5) == "aucun" else int(m.group(5)),
                        "depute": {"nom": m.group(6), "feminin": m.group(7) == "députée",
                                   "groupe": None if g == "sans groupe" else g},
                        "vote_orateur": m.group(9)})
    exiger(len(raisons) == 4, f"{scrutin} : {len(raisons)} raisons")
    return {"titre": titre, "lignes": lignes, "issue_fiche": issue_fiche, "objet": objet, "auteur": auteur,
            "lien_scrutin": lien, "sources": sources, "tension": tension, "sens": sens, "raisons": raisons,
            "legere": False}


def lire_elision_premier_essai() -> dict:
    texte = lire(F_SCHEMA1)
    return {n[1:-1]: f[1:-1] for n, _i, f in lignes_tableau(texte, "| `nom` | Initiale | Forme |")}


def elision_provisoire(nom: str, table1: dict, notes: list) -> bool:
    """Le tableau 2.11 du second lot n'est pas encore rempli par Contenu (schéma 2.11). Pour le candidat 1
    seulement : le tableau du premier essai s'il contient le nom ; sinon « d' » devant une voyelle ou un H
    (les trois H du premier lot étaient muets), « de » devant un Y (« son y »). À remplacer au candidat final."""
    if nom[0] not in INITIALES_CHOIX:
        return False
    if nom in table1:
        notes.append(f"{nom} : {table1[nom]} (tableau du premier essai)")
        return table1[nom] == "d'"
    v = nom[0] not in "YŸ"
    notes.append(f"{nom} : {'d' + chr(39) if v else 'de'} (provisoire)")
    return v


# ---------------------------------------------------------------------------
# Règles des personnages (fichier caché, point 3)
# ---------------------------------------------------------------------------

def niveau_cote(niveau: int) -> int:
    return 1 if niveau >= 4 else (-1 if niveau <= 2 else 0)


def position_type(prof: dict, sens: int) -> int:
    p = Fr(prof["position"], 100)
    a = p if sens == 1 else 1 - p
    d = (a - Fr(1, 2)) * M_FERMETE[prof["fermete"]]
    if abs(d) < Fr(1, 10):
        return 3
    if abs(d) < Fr(3, 10):
        return 4 if d > 0 else 2
    return 5 if d > 0 else 1


def sa_valeur(prof: dict) -> int:
    return 1 if Fr(prof["position"], 100) > Fr(1, 2) else 0  # π_p, point 1


def choisir_raison(tir: Tirage, prenom: str, texte: str, prof: dict, niveau: int, raisons: list[dict]):
    """Règle 2.2 bis. `raisons` : dans l'ordre d'affichage, avec `rang`, `cote`, `pole`."""
    cote = niveau_cote(niveau)
    if cote == 0:
        E = list(raisons)
    else:
        E = [r for r in raisons if r["cote"] == ("pour" if cote == 1 else "contre")]
    pi = sa_valeur(prof)
    val = [r for r in E if r["pole"] == pi]
    hors = [r for r in E if r["pole"] == "aucun"]
    autre = [r for r in E if r["pole"] == 1 - pi]
    faible = prof["fermete"] == "faible"
    if cote != 0:
        niveaux = [hors, val, autre] if faible else [val, hors, autre]
    else:
        niveaux = [hors] if faible else [val, hors]
    for cands in niveaux:
        if cands:
            return min(cands, key=lambda r: tir.tri(f"raison|{prenom}|{texte}|{r['rang']}"))["rang"]
    return "aucune"


def poids(rep: dict, tx: dict) -> tuple[Fr, int | None]:
    """§5.1 : (w, π)."""
    cote = niveau_cote(rep["niveau"])
    if cote == 0:
        return Fr(0), None
    pi = tx["sens"] if cote == 1 else 1 - tx["sens"]
    rho = "aucun" if rep["raison"] == "aucune" else tx["raisons"][rep["raison"] - 1]["pole"]
    if rho == pi:
        return Fr(1), pi
    if rho == "aucun":
        return Fr(1, 2), pi
    return Fr(0), None


def curseur(sw: Fr, swpi: Fr) -> dict:
    return {"c": (2 + swpi) / (4 + sw), "l": max(Fr(95, 100) - Fr(7, 100) * sw, Fr(1, 4)),
            "net": sw >= SEUIL_NET, "somme_w": sw}


def reponses_periode(tir: Tirage, textes: list[str], prefixe: str, TX: dict, profils: dict,
                     alpha: Fr, r: int | None) -> tuple[dict, dict, dict]:
    """Points 2.3 et 2.4 du fichier caché, sur une période (H1–H90, ou T0–T14).
    Rend (réponses, absences {perso: [textes]}, atypiques {perso: [{cote_tire, texte}]})."""
    absences = {p: [] for p in PERSONNAGES}
    for idx, t in enumerate(textes):
        if t == "14":
            continue
        for p in PERSONNAGES:
            if any(t in absences[q] for q in PERSONNAGES):
                break
            precedents = textes[max(0, idx - 6):idx]
            if any(x in absences[p] for x in precedents):
                continue
            if tir.inf(f"absence|{prefixe}{p}|{t}", Fr(1, 14)):
                absences[p].append(t)
    atyp: dict[str, dict[str, int | None]] = {p: {} for p in PERSONNAGES}
    reps: dict[str, dict] = {}
    for idx, t in enumerate(textes):
        tx = TX[t]
        presents = [p for p in PERSONNAGES if t not in absences[p]]
        marques: list[str] = []
        if t == "H86":
            marques = sorted(presents, key=lambda p: tir.tri(f"ecart-hstar|{r}|{p}"))[:2]
        elif t != "14":
            prec = textes[idx - 1] if idx > 0 else None
            for p in presents:
                if prec is not None and prec in atyp[p]:
                    continue
                if len(marques) >= 2:
                    continue
                if tir.inf(f"ecart|{prefixe}{p}|{t}", alpha):
                    marques.append(p)
        reps[t] = {}
        for p in presents:
            prof = profils[p][tx["tension"]]
            niveau = position_type(prof, tx["sens"])
            if p in marques:
                cote_tire = None
                if niveau >= 4:
                    niveau = 2
                elif niveau <= 2:
                    niveau = 4
                else:
                    niveau = 4 if tir.inf(f"cote-ecart|{prefixe}{p}|{t}", Fr(1, 2)) else 2
                    cote_tire = niveau_cote(niveau)
                atyp[p][t] = cote_tire
            reps[t][p] = {"niveau": niveau, "raison": choisir_raison(tir, p, t, prof, niveau, tx["raisons"])}
    atyp_l = {p: [{"cote_tire": c, "texte": t} for t, c in atyp[p].items()] for p in PERSONNAGES}
    return reps, absences, atyp_l


# ---------------------------------------------------------------------------
# Textes de l'histoire (point 2 bis)
# ---------------------------------------------------------------------------

def textes_histoire(tir: Tirage) -> dict:
    tensions = {}
    occ_list: dict[str, list[str]] = {t: [] for t in TENSIONS}
    for i in range(1, 91):
        j = i - 91
        t = "SPTL"[(j + 6) % 4]
        tensions[f"H{i}"] = t
        occ_list[t].append(f"H{i}")
    k86 = occ_list["P"].index("H86")
    premier = {"S": 1, "T": 1, "L": 1, "P": 0 if k86 % 2 == 0 else 1}
    res = {}
    for t in TENSIONS:
        for k, h in enumerate(occ_list[t]):
            s = premier[t] if k % 2 == 0 else 1 - premier[t]
            r = [{"cote": "pour", "pole": s}, {"cote": "pour", "pole": s},
                 {"cote": "contre", "pole": 1 - s}, {"cote": "contre", "pole": 1 - s}]
            if not tir.inf(f"histoire-raisons|{h}", Fr(1, 2)):
                for num, c, face in ((2, "pour", 1 - s), (4, "contre", s)):
                    r[num - 1]["pole"] = face if tir.inf(f"histoire-inattendu|{h}|{c}", Fr(1, 2)) else "aucun"
            ordre = sorted(range(1, 5), key=lambda num: tir.tri(f"ordre-raisons|{h}|{num}"))
            raisons = [{"cote": r[num - 1]["cote"], "pole": r[num - 1]["pole"], "rang": rang, "_num": num}
                       for rang, num in enumerate(ordre, 1)]
            res[h] = {"jour": int(h[1:]) - 91, "tension": t, "sens": s, "raisons": raisons}
    return res


# ---------------------------------------------------------------------------
# Calendrier et semaines (§0 ; schéma 2.4)
# ---------------------------------------------------------------------------

def calendrier() -> list[dict]:
    cal = []
    for j in range(1, 16):
        if j in (1, 2, 3, 7, 14):
            typ = "joue"
        elif j in (4, 8):
            typ = "joue_puis_saut"
        elif j == 15:
            typ = "cloture"
        else:
            typ = "saute"
        saut = 1 if 4 <= j <= 6 else (2 if 8 <= j <= 13 else None)
        cal.append({"deviner_porteur": typ == "joue", "jour": j, "manche": str(j - 1) if j <= 14 else None,
                    "nom_jour": NOMS_JOURS[(j - 1) % 7],
                    "repondu": str(j) if j <= 14 else None,
                    "revelation_porteur": "aucune" if j == 1 else ("jamais_lue" if typ == "saute" else "lue"),
                    "revele": "H90" if j == 1 else str(j - 2), "saut": saut, "type": typ})
    return cal


def semaines() -> list[dict]:
    return [{"dernier_jour": 7 * (w - 13), "numero": w, "premier_jour": 7 * (w - 14) + 1} for w in range(1, 16)]


def semaine_du_jour(j: int) -> int:
    return (j - 1) // 7 + 14


def texte_du_jour(j: int) -> str | None:
    if -90 <= j <= -1:
        return f"H{j + 91}"
    if 0 <= j <= 14:
        return str(j)
    return None


def jour_du_texte(t: str) -> int:
    if t.startswith("E"):
        return -91  # avant le jour −90
    if t.startswith("H"):
        return int(t[1:]) - 91
    return int(t)


def verifier_tables_schema(cal: list[dict], sem: list[dict]) -> None:
    tcal, tsem = lire_tables_calendrier()
    exiger(len(tcal) == 15 and len(tsem) == 15, "tables du schéma 2.4 : 15 lignes attendues")

    for ligne, c in zip(tcal, cal):
        jour, nom, typ, saut, rev, revp, man, dev, rep = ligne
        exiger(int(jour) == c["jour"] and nom == c["nom_jour"] and typ == c["type"]
               and (None if saut == "null" else int(saut)) == c["saut"]
               and (None if rev == "null" else rev) == c["revele"] and revp == c["revelation_porteur"]
               and (None if man == "null" else man) == c["manche"] and (dev == "true") == c["deviner_porteur"]
               and (None if rep == "null" else rep) == c["repondu"], f"calendrier ≠ schéma 2.4 au jour {jour}")
    for ligne, s in zip(tsem, sem):
        n, p, d = (int(x.replace("−", "-")) for x in ligne)
        exiger((n, p, d) == (s["numero"], s["premier_jour"], s["dernier_jour"]), f"semaines ≠ schéma 2.4 ({ligne})")


# ---------------------------------------------------------------------------
# Le contexte d'une histoire (un r)
# ---------------------------------------------------------------------------

class Histoire:
    def __init__(self, tir: Tirage, TX: dict, reps: dict, profils: dict, absences: dict):
        self.tir = tir
        self.TX = TX
        self.reps = reps
        self.profils = profils
        self.absences = {p: set(v) for p, v in absences.items()}
        # Sommes cumulées par membre, tension et texte (ordre du calendrier).
        self.cum: dict[tuple[str, str], list[tuple[int, Fr, Fr]]] = {}
        for p in PERSONNAGES:
            for t in TENSIONS:
                self.cum[(p, t)] = []
            sw = {t: Fr(0) for t in TENSIONS}
            swpi = {t: Fr(0) for t in TENSIONS}
            for x in TEXTES:
                if p not in reps.get(x, {}):
                    continue
                tx = TX[x]
                w, pi = poids(reps[x][p], tx)
                sw[tx["tension"]] += w
                if pi is not None:
                    swpi[tx["tension"]] += w * pi
                self.cum[(p, tx["tension"])].append((jour_du_texte(x), sw[tx["tension"]], swpi[tx["tension"]]))

    def curseur_jusqua(self, p: str, tension: str, jour_max: int) -> dict:
        """Entrée et textes répondus jusqu'au jour `jour_max` inclus (poids normaux)."""
        sw, swpi = Fr(0), Fr(0)
        for j, a, b in self.cum[(p, tension)]:
            if j <= jour_max:
                sw, swpi = a, b
            else:
                break
        return curseur(sw, swpi)

    def present(self, p: str, j: int) -> bool:
        t = texte_du_jour(j)
        return t is not None and t not in self.absences[p]

    # -- Une manche (4.1 à 4.5 ; règle 3) -----------------------------------
    def manche(self, g: str, j: int, membres_actifs: list[str]) -> dict:
        tir = self.tir
        texte = texte_du_jour(j - 1)
        tx = self.TX[texte]
        candidats = [m for m in membres_actifs if m != g and DEPUIS[m] <= j - 1]
        possibles = [m for m in candidats if m in self.reps[texte]]
        info = {}
        for X in possibles:
            rep = self.reps[texte][X]
            v = VALEUR[rep["niveau"]]
            x = v if tx["sens"] == 1 else 1 - v
            cu = self.curseur_jusqua(X, tx["tension"], j - 2)
            info[X] = {"c": cu["c"], "distance": abs(x - cu["c"]), "l": cu["l"], "net": cu["net"],
                       "niveau": rep["niveau"], "raison": rep["raison"], "rarete": None,
                       "somme_w": cu["somme_w"], "surprise": None, "x": x}
        med = None
        if possibles:
            xs = sorted(info[X]["x"] for X in possibles)
            n = len(xs)
            med = xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2
            for X in possibles:
                info[X]["rarete"] = abs(info[X]["x"] - med)
                info[X]["surprise"] = info[X]["distance"] if info[X]["net"] else info[X]["rarete"]
        classement = sorted(possibles, key=lambda X: (-info[X]["surprise"], tir.tri(f"surprise|{g}|{j}|{X}")))
        groupes: dict[Fr, int] = {}
        for X in possibles:
            groupes[info[X]["surprise"]] = groupes.get(info[X]["surprise"], 0) + 1
        departages = sum(1 for v in groupes.values() if v >= 2)
        places = classement[:2]
        if len(classement) >= 3:
            places.append(min(classement[2:], key=lambda X: tir.tri(f"hasard|{g}|{j}|{X}")))

        def ident(a, b):
            return (info[a]["niveau"], info[a]["raison"]) == (info[b]["niveau"], info[b]["raison"])
        remplacements = []
        while True:
            paires = [(i, k) for i in range(len(places)) for k in range(i + 1, len(places)) if ident(places[i], places[k])]
            libres = [X for X in classement if X not in places and not any(ident(X, P) for P in places)]
            if not paires or not libres:
                break
            pires = {max(places[i], places[k], key=classement.index) for i, k in paires}
            ecartee = max(pires, key=classement.index)
            idx = places.index(ecartee)
            places[idx] = libres[0]
            remplacements.append({"ecartee": ecartee, "place": idx + 1, "remplacante": libres[0]})
        cachee = None
        if places:
            cachee = places[-1]
            if info[cachee]["raison"] == "aucune":
                autres = [X for X in places if info[X]["raison"] != "aucune"]
                if autres:
                    cachee = max(autres, key=classement.index)
        ordre = sorted(places, key=lambda X: tir.tri(f"ordre|{g}|{j}|{X}"))
        res = {"candidats": candidats, "cartes": [], "classement": classement, "cotes_attendus": None,
               "curseur_porteur": None, "departages": departages, "mediane": med, "ordre": ordre,
               "places": list(places), "possibles": info, "raison_cachee": cachee, "rangs": None,
               "remplacements": remplacements, "texte": texte, "total": None}
        cartes = [{"auteur": X, "auteur_compte": X, "cachee": X == cachee, "designe": None,
                   "raison_devinee": None} for X in ordre]
        res["cartes"] = cartes
        if g == "porteur":
            return res
        # Règle 3 : le personnage devine.
        exiger("porteur" not in candidats, "le porteur candidat dans l'histoire : hors du domaine de ce programme")
        rangs = {c: i + 1 for i, c in enumerate(sorted(candidats, key=lambda c: tir.tri(f"devine|{g}|{j}|{c}")))}
        cotes = {}
        for c in candidats:
            p = Fr(self.profils[c][tx["tension"]]["position"], 100)
            a = p if tx["sens"] == 1 else 1 - p
            cotes[c] = 1 if a >= Fr(3, 5) else (-1 if a <= Fr(2, 5) else 0)

        def score(sigma: int, c: str) -> int:
            e = cotes[c]
            if e == "inconnu":
                return 1
            if sigma == e:
                return 2
            if sigma == 0 or e == 0:
                return 1
            return 0
        sigmas = [niveau_cote(info[k["auteur"]]["niveau"]) for k in cartes]
        meilleur = None
        for perm in permutations(candidats, len(cartes)):
            tot = sum(score(s, c) for s, c in zip(sigmas, perm))
            cle = (-tot, tuple(rangs[c] for c in perm))
            if meilleur is None or cle < meilleur[0]:
                meilleur = (cle, perm, tot)
        total = 0
        if cartes:
            _cle, perm, total = meilleur
            for k, c in zip(cartes, perm):
                k["designe"] = c
        for k, s in zip(cartes, sigmas):
            if not k["cachee"]:
                continue
            e = cotes[k["designe"]]
            cons = [r for r in tx["raisons"] if s == 0 or r["cote"] == ("pour" if s == 1 else "contre")]
            choix = None
            if e in (1, -1):
                cible = tx["sens"] if e == 1 else 1 - tx["sens"]
                choix = next((r["rang"] for r in cons if r["pole"] == cible), None)
            if choix is None:
                choix = next((r["rang"] for r in cons if r["pole"] == "aucun"), None)
            if choix is None and cons:
                choix = cons[0]["rang"]
            k["raison_devinee"] = choix if choix is not None else "aucune"
        redistribuer(cartes, info)
        res.update({"cotes_attendus": cotes, "rangs": rangs, "total": total})
        return res


def redistribuer(cartes: list[dict], info: dict) -> None:
    """§4.3, étape 4 : cartes identiques restées ensemble."""
    vus = set()
    for i, k in enumerate(cartes):
        if i in vus:
            continue
        rep = (info[k["auteur"]]["niveau"], info[k["auteur"]]["raison"])
        groupe = [m for m, q in enumerate(cartes) if (info[q["auteur"]]["niveau"], info[q["auteur"]]["raison"]) == rep]
        vus.update(groupe)
        if len(groupe) < 2:
            continue
        auteurs = {cartes[m]["auteur"] for m in groupe}
        pris = set()
        restantes = []
        for m in groupe:
            d = cartes[m]["designe"]
            if d in auteurs:
                cartes[m]["auteur_compte"] = d
                pris.add(d)
            else:
                restantes.append(m)
        autres = [a for a in MEMBRES if a in auteurs and a not in pris]
        for m, a in zip(restantes, autres):
            cartes[m]["auteur_compte"] = a


def calculer_histoire(H: Histoire) -> dict:
    """Jours −90 à 0 : manches, révélations ; semaines 1 à 13 ; tempéraments du jour 0 ; arrivée."""
    tir = H.tir
    jours = {}
    points_sem: dict[tuple[int, str], int] = {}
    for j in range(-90, 1):
        manches = {}
        if j >= -89:
            for g in PERSONNAGES:
                if H.present(g, j):
                    manches[g] = H.manche(g, j, PERSONNAGES)
        revelation = None
        if j >= -88:
            texte = texte_du_jour(j - 2)
            devs = {}
            for g, m in jours[j - 1]["manches"].items():
                rs = H.reps[texte]
                carte_rep = {k["auteur"]: rs[k["auteur"]] for k in m["cartes"]}
                justes = [k["designe"] in rs and rs[k["designe"]] == carte_rep[k["auteur"]] for k in m["cartes"]]
                jumeaux = [ju and k["designe"] != k["auteur_compte"] for ju, k in zip(justes, m["cartes"])]
                rt = None
                for ju, k in zip(justes, m["cartes"]):
                    if k["cachee"]:
                        rt = bool(ju and k["raison_devinee"] == carte_rep[k["auteur"]]["raison"])
                pts = sum(justes)
                w = semaine_du_jour(j)
                points_sem[(w, g)] = points_sem.get((w, g), 0) + pts
                devs[g] = {"jumeaux": jumeaux, "justes": justes, "points": pts,
                           "points_semaine": points_sem[(w, g)], "raison_trouvee": rt, "verdicts": None}
            revelation = {"devineurs": devs, "pas_de_cote": pas_de_cote(H, texte), "texte": texte}
        jours[j] = {"manches": manches, "repondu": texte_du_jour(j), "revelation": revelation}
    sems, c3 = titres_semaines(H, jours)
    temps = temperaments(H, 0)
    arrivee = {p: {t: H.curseur_jusqua(p, t, -1) for t in TENSIONS} for p in PERSONNAGES}
    return {"jours": jours, "semaines": sems, "c3": c3, "temperaments": temps, "arrivee": arrivee}


def pas_de_cote(H: Histoire, texte: str) -> list[str]:
    tx = H.TX[texte]
    res = []
    for p in PERSONNAGES:
        if p not in H.reps[texte]:
            continue
        w, pi = poids(H.reps[texte][p], tx)
        if w != 1:
            continue
        cu = H.curseur_jusqua(p, tx["tension"], jour_du_texte(texte) - 1)
        if cu["net"] and abs(cu["c"] - Fr(1, 2)) >= PENCHE and ((cu["c"] > Fr(1, 2)) != (pi == 1)):
            res.append(p)
    return res


def titres_semaines(H: Histoire, jours: dict) -> tuple[list[dict], dict]:
    tir = H.tir
    res = []
    c3 = None
    for w in range(1, 14):
        prem, dern = 7 * (w - 14) + 1, 7 * (w - 13)
        revs = [jours[d]["revelation"] for d in range(prem, dern + 1) if d in jours and jours[d]["revelation"]]
        # Titres de points (Le Devin).
        pts = {p: 0 for p in PERSONNAGES}
        rais = {p: 0 for p in PERSONNAGES}
        tent = {p: 0 for p in PERSONNAGES}
        err = {p: 0 for p in PERSONNAGES}
        attr = {}
        errt = {}
        jours_cartes = {p: 0 for p in PERSONNAGES}
        faute = {p: False for p in PERSONNAGES}
        for rv in revs:
            t = rv["texte"]
            d = jour_du_texte(t) + 1  # jour de la manche
            attr[t] = 0
            errt[t] = 0
            for g, dv in rv["devineurs"].items():
                pts[g] += dv["points"]
                rais[g] += 1 if dv["raison_trouvee"] else 0
                cartes = jours[d]["manches"][g]["cartes"]
                if cartes:
                    jours_cartes[g] += 1
                for k, ju in zip(cartes, dv["justes"]):
                    if k["designe"] == "passe" or k["designe"] is None:
                        faute[g] = True
                        continue
                    attr[t] += 1
                    X = k["auteur_compte"]
                    tent[X] += 1
                    if not ju:
                        err[X] += 1
                        errt[t] += 1
                        faute[g] = True
        maxp = max(pts.values())
        devin = {"departage": "aucun", "points": pts, "raisons": rais, "titulaire": None}
        if maxp >= 1:
            tete = [p for p in PERSONNAGES if pts[p] == maxp]
            if len(tete) > 1:
                mr = max(rais[p] for p in tete)
                tete2 = [p for p in tete if rais[p] == mr]
                if len(tete2) == 1:
                    devin["departage"] = "raisons"
                else:
                    devin["departage"] = "tirage"
                    tete2 = [min(tete2, key=lambda p: tir.tri(f"devin|{w}|{p}"))]
                tete = tete2
            devin["titulaire"] = tete[0]
        myst = {"departage": "aucun", "erreurs": err, "tentatives": tent, "titulaire": None}
        elig = [p for p in PERSONNAGES if tent[p] >= 6 and err[p] >= 1]
        if elig:
            mx = max(Fr(err[p], tent[p]) for p in elig)
            tete = [p for p in elig if Fr(err[p], tent[p]) == mx]
            if len(tete) > 1:
                me = max(err[p] for p in tete)
                tete2 = [p for p in tete if err[p] == me]
                if len(tete2) == 1:
                    myst["departage"] = "erreurs"
                else:
                    myst["departage"] = "tirage"
                    tete2 = [min(tete2, key=lambda p: tir.tri(f"mystere|{w}|{p}"))]
                tete = tete2
            myst["titulaire"] = tete[0]
        rep_textes = [texte_du_jour(d) for d in range(prem - 1, dern) if texte_du_jour(d) is not None and d >= -90]
        fideles = [p for p in PERSONNAGES if all(p in H.reps[t] for t in rep_textes)]

        def surprise(candidats: list[str]) -> dict:
            s = {"attributions": dict(attr), "departage": "aucun", "erreurs": dict(errt), "texte": None}
            elig = [t for t in candidats if attr[t] >= 4 and errt[t] >= 1]
            if elig:
                mx = max(Fr(errt[t], attr[t]) for t in elig)
                tete = [t for t in elig if Fr(errt[t], attr[t]) == mx]
                if len(tete) > 1:
                    me = max(errt[t] for t in tete)
                    tete2 = [t for t in tete if errt[t] == me]
                    if len(tete2) == 1:
                        s["departage"] = "erreurs"
                    else:
                        s["departage"] = "tirage"
                        tete2 = [min(tete2, key=lambda t: tir.tri(f"surprise-semaine|{w}|{t}"))]
                    tete = tete2
                s["texte"] = tete[0]
            return s
        titres_textes = [t for t in attr if t == "H86"]  # point 9 : seuls les textes titrés
        surp = surprise(titres_textes)
        if w == 13:
            c3 = surprise(list(attr))
        sans_faute = [p for p in PERSONNAGES if jours_cartes[p] >= 5 and not faute[p]]
        res.append({"devin": devin, "fidele": {"titulaires": fideles}, "mystere": myst, "sans_faute": sans_faute,
                    "semaine": w, "surprise": surp})
    return res, c3


def temperaments(H: Histoire, d: int) -> dict:
    textes = [texte_du_jour(x) for x in range(d - 57, d - 1) if texte_du_jour(x) is not None and x >= -90]
    res = {}
    for p in PERSONNAGES:
        cpt = {"neutres": 0, "reponses": 0, "seul_cote": 0, "seul_milieu": 0, "textes_partages": 0, "tres": 0}
        for t in textes:
            rs = H.reps[t]
            if p not in rs or len(rs) < 3:
                continue
            cpt["reponses"] += 1
            n = rs[p]["niveau"]
            cote = niveau_cote(n)
            autres = [niveau_cote(rs[q]["niveau"]) for q in rs if q != p]
            if cote == 0:
                cpt["neutres"] += 1
            if n in (1, 5):
                cpt["tres"] += 1
            if cote != 0 and cote not in autres:
                cpt["seul_cote"] += 1
            if 1 in autres and -1 in autres:
                cpt["textes_partages"] += 1
                if cote == 0 and 0 not in autres:
                    cpt["seul_milieu"] += 1
        tp = []
        if d - DEPUIS[p] >= 56 and cpt["reponses"] >= 20:
            r = cpt["reponses"]
            if Fr(cpt["seul_cote"], r) >= Fr(3, 10):
                tp.append("original")
            if cpt["textes_partages"] >= 6 and Fr(cpt["seul_milieu"], cpt["textes_partages"]) >= Fr(1, 8):
                tp.append("pont")
            if Fr(cpt["neutres"], r) >= Fr(1, 3):
                tp.append("mesure")
            if Fr(cpt["tres"], r) >= Fr(1, 2):
                tp.append("tranche")
        cpt["temperaments"] = tp
        res[p] = cpt
    return res


def criteres(H: Histoire, res: dict) -> list[str]:
    """Critères c1 à c5 (point 10). Rend la liste des échecs (vide si tout passe)."""
    echecs = []
    arr = res["arrivee"]
    nets = {p: {t for t in TENSIONS if arr[p][t]["net"]} for p in PERSONNAGES}
    for p in PERSONNAGES:
        if nets[p] != ATTENDU_C1[p]:
            echecs.append(f"c1 {p} nets {''.join(t for t in TENSIONS if t in nets[p]) or '∅'} "
                          f"(attendu {''.join(t for t in TENSIONS if t in ATTENDU_C1[p])})")
    for p in PERSONNAGES:
        if res["temperaments"][p]["temperaments"] != ATTENDU_C2[p]:
            echecs.append(f"c2 {p} {res['temperaments'][p]['temperaments']} (attendu {ATTENDU_C2[p]})")
    c3 = res["c3"]
    if c3["texte"] != "H86":
        echecs.append(f"c3 surprise de la semaine 13 = {c3['texte']} (départage {c3['departage']})")
    devins = {s["devin"]["titulaire"] for s in res["semaines"]} - {None}
    mysts = {s["mystere"]["titulaire"] for s in res["semaines"]} - {None}
    peu_fid = sum(1 for s in res["semaines"] if len(s["fidele"]["titulaires"]) <= 3)
    if len(devins) < 3:
        echecs.append(f"c4 Le Devin : {len(devins)} titulaires différents")
    if len(mysts) < 3:
        echecs.append(f"c4 Le Mystère : {len(mysts)} titulaires différents")
    if peu_fid < 6:
        echecs.append(f"c4 semaines à trois Fidèles ou moins : {peu_fid}")
    for p in PERSONNAGES:
        for t in nets[p]:
            c = arr[p][t]["c"]
            pp = Fr(H.profils[p][t]["position"], 100)
            if (c > Fr(1, 2)) != (pp > Fr(1, 2)) or abs(c - Fr(1, 2)) < PENCHE:
                echecs.append(f"c5 {p} {t} c = {c}")
    return echecs


# ---------------------------------------------------------------------------
# Résumé et trace
# ---------------------------------------------------------------------------

def carte_resume(k: dict) -> dict:
    return {"auteur": k["auteur"], "auteur_compte": k["auteur_compte"], "cachee": k["cachee"],
            "designe": k["designe"], "raison_devinee": k["raison_devinee"]}


def construire_resume(res: dict, r: int) -> dict:
    j0 = res["jours"][0]["manches"]
    return {
        "curseurs": {p: {t: {"c": res["arrivee"][p][t]["c"], "somme_w": res["arrivee"][p][t]["somme_w"]}
                         for t in TENSIONS} for p in PERSONNAGES},
        "format": "elenchos-essai-resume-histoire",
        "manche_jour_0": {"devineurs": {g: [carte_resume(k) for k in m["cartes"]] for g, m in j0.items()},
                          "texte": "H90"},
        "temperaments": {p: res["temperaments"][p]["temperaments"] for p in PERSONNAGES},
        "tirage": r,
        "titres": [{"devin": s["devin"]["titulaire"], "fidele": s["fidele"]["titulaires"],
                    "mystere": s["mystere"]["titulaire"], "sans_faute": s["sans_faute"], "semaine": s["semaine"],
                    "surprise": s["surprise"]["texte"]} for s in res["semaines"]],
        "version": 1,
    }


def construire_trace(res: dict, resume: dict, empreinte_scelle: str) -> dict:
    jours = {}
    for j, e in res["jours"].items():
        jours[str(j)] = e
    oc = canonique(resume)
    return {
        "arrivee": {"curseurs": res["arrivee"], "resume": resume, "resume_sha256": sha(oc),
                    "temperaments": res["temperaments"]},
        "empreinte_scelle": empreinte_scelle,
        "format": "elenchos-essai-trace-histoire",
        "jours": jours,
        "semaines": res["semaines"],
        "version": 1,
    }


# ---------------------------------------------------------------------------
# Assemblage du lot
# ---------------------------------------------------------------------------

def tirer_cases(tir: Tirage, p14: dict) -> tuple[dict, list[str], dict]:
    """Point 14 : t("ordre-texte|tension|i"). Lecture retenue (QUESTIONS, point 1) : i = rang du texte
    dans la liste « Cases {tension} » du point 14 (1, 2, …) ; la liste est mélangée au sens du §0, et les
    textes vont aux cases de la tension dans l'ordre du calendrier. Rend {clé de texte: scrutin}, le
    journal, et le résultat de l'autre lecture (i = numéro de scrutin) pour le rapport."""
    ordre = p14["ordre"]
    cles = dict(p14["roles"])
    journal = []
    autre = {}
    for t in TENSIONS:
        cases = [str(n) for n in range(15) if ordre[n] == t and str(n) not in ("0", "14")]
        liste = p14["cases"][t]
        exiger(len(cases) == len(liste), f"tension {t} : {len(liste)} textes pour {len(cases)} cases")
        tri = sorted(range(1, len(liste) + 1), key=lambda i: tir.tri(f"ordre-texte|{t}|{i}"))
        for case, i in zip(cases, tri):
            cles[case] = liste[i - 1]
        journal.append(f"{t} : cases T{', T'.join(cases)} ; liste {', '.join(liste)} ; "
                       + " ; ".join(f"i={i} ({liste[i - 1]}) N={tir.n(f'ordre-texte|{t}|{i}')}" for i in range(1, len(liste) + 1))
                       + " → " + ", ".join(f"T{c} = {cles[c]}" for c in cases))
        tri2 = sorted(liste, key=lambda s: tir.tri(f"ordre-texte|{t}|{s}"))
        for case, s in zip(cases, tri2):
            autre[case] = s
    return cles, journal, autre


def assembler_textes(tir: Tirage, cles: dict, fiches: dict, votes: dict, notes_elision: list) -> dict:
    table1 = lire_elision_premier_essai()
    textes = {}
    for cle in JOUEES:
        s = cles[cle]
        exiger(s in fiches and not fiches[s]["legere"], f"fiche du scrutin {s} ({cle}) introuvable")
        f = fiches[s]
        v = votes[s]
        exiger(v["legislature"] == f["legislature"], f"{cle} : législature ≠ votes.md")
        exiger(v["objet"] == f["objet"], f"{cle} : objet de la fiche ≠ votes.md")
        exiger(v["issue"] == f["issue_fiche"], f"{cle} : issue de la fiche ≠ votes.md")
        exiger(f["lien_scrutin"] == f"https://www.assemblee-nationale.fr/dyn/{f['legislature']}/scrutins/{s}",
               f"{cle} : lien du scrutin")
        ordre = sorted(f["raisons"], key=lambda r: tir.tri(f"ordre-raisons|{cle}|{r['numero_fiche']}"))
        cons = []
        for rang, r in enumerate(ordre, 1):
            dep = dict(r["depute"])
            dep["elision"] = elision_provisoire(dep["nom"], table1, notes_elision)
            cons.append({"cote": r["cote"], "depute": dep, "pole": r["pole"], "rang": rang, "texte": r["texte"],
                         "_numero_fiche": r["numero_fiche"]})
        textes[cle] = {
            "auteur": f["auteur"], "considerations": cons, "lien_scrutin": f["lien_scrutin"],
            "lignes": f["lignes"], "sens": f["sens"], "sources": f["sources"], "tension": f["tension"],
            "titre": f["titre"],
            "vote": {"date": v["date"], "etape": v["etape"], "issue": v["issue"], "objet": v["objet"], "suite": v["suite"]},
            "_scrutin": s,
        }
    return textes


def public(x):
    """Retire les champs de travail (préfixés « _ »)."""
    if isinstance(x, dict):
        return {k: public(v) for k, v in x.items() if not k.startswith("_")}
    if isinstance(x, list):
        return [public(v) for v in x]
    return x


# ---------------------------------------------------------------------------
# Vérifications du fichier écrit (contrôle 1, étapes 3 à 7, ce qui est faisable ici)
# ---------------------------------------------------------------------------

def est_entier(x) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


def verifier_fichier(octets: bytes, jour: datetime.date, p14: dict, journal: list[str]) -> dict:
    texte = octets.decode("utf-8", errors="strict")

    def sans_doublon(paires):
        cles = [k for k, _ in paires]
        exiger(len(cles) == len(set(cles)), f"étape 3 : clé en double : {cles}")
        return dict(paires)

    def refuse(x):
        raise Defaut(f"étape 3 : nombre non entier : {x}")
    obj = json.loads(texte, object_pairs_hook=sans_doublon, parse_float=refuse, parse_constant=refuse)
    exiger(canonique(obj) == octets, "étape 3 : forme canonique")
    journal.append("Étape 3 (forme) : UTF-8 strict, sans doublon, entiers seulement ; remis en forme canonique, mêmes octets.")

    def objet(x, cles, ou):
        exiger(isinstance(x, dict) and set(x) == set(cles), f"étape 4 : {ou} : clés {sorted(x) if isinstance(x, dict) else x}")
    chaines = []

    def chaine(x, ou):
        exiger(isinstance(x, str) and unicodedata.normalize("NFC", x) == x
               and not any(ord(c) < 0x20 or ord(c) == 0x7F for c in x), f"étape 4 : {ou}")
        chaines.append(x)
    objet(obj, ["absences", "calendrier", "cercle", "format", "graine", "histoire", "personnages", "reglage",
                "reponses", "reponses_atypiques", "semaines", "statut", "textes", "vecteurs_test", "version"], "racine")
    exiger(obj["format"] == "elenchos-essai-scelle" and obj["version"] == 5, "étape 4 : format, version")
    exiger(obj["statut"] in ("provisoire", "final"), "étape 4 : statut")
    exiger(re.fullmatch(r"[0-9a-f]{16}", obj["graine"]) is not None, "étape 4 : graine")
    exiger(obj["calendrier"] == calendrier() and obj["semaines"] == semaines(), "étape 5 : tables")
    exiger(obj["cercle"] == {"invitant": "Valentin", "membres": [{"depuis": DEPUIS[m], "membre": m} for m in MEMBRES],
                             "nom": "Amis"}, "étape 5 : cercle")
    exiger(canonique(obj["personnages"]) == canonique(json.loads(F_SCELLE1.read_bytes())["personnages"]),
           "contrôle 2 : personnages ≠ premier fichier")
    objet(obj["reglage"], ["alpha", "barre", "facteur", "seuils_stricts"], "reglage")
    exiger(obj["reglage"]["alpha"] in ("1/6", "1/4", "1/3") and obj["reglage"]["barre"] == 16
           and obj["reglage"]["facteur"] in (2, 3, 4) and isinstance(obj["reglage"]["seuils_stricts"], bool), "réglage")
    # Vecteurs.
    exiger(len(obj["vecteurs_test"]) == 3, "vecteurs")
    for v, cle in zip(obj["vecteurs_test"], CLES_VECTEURS):
        objet(v, ["chaine", "cle", "hex8", "n"], "vecteur")
        h = sha(v["chaine"].encode())[:8]
        exiger(v["cle"] == cle and v["chaine"] == obj["graine"] + "|" + cle and v["hex8"] == h and v["n"] == int(h, 16),
               f"étape 6 : vecteur {cle}")
    # Histoire.
    hi = obj["histoire"]
    objet(hi, ["resume_sha256", "textes", "tirage"], "histoire")
    exiger(est_entier(hi["tirage"]) and 1 <= hi["tirage"] <= 200, "tirage")
    exiger(list(hi["textes"]) == sorted(HIST) and len(hi["textes"]) == 90, "histoire.textes : 90 clés")
    for h, tx in hi["textes"].items():
        objet(tx, ["fiche", "jour", "raisons", "sens", "tension"], h)
        exiger(tx["jour"] == int(h[1:]) - 91 and tx["tension"] == "SPTL"[(tx["jour"] + 6) % 4], f"{h} : jour, tension")
        exiger([r["rang"] for r in tx["raisons"]] == [1, 2, 3, 4], f"{h} : rangs")
        for r in tx["raisons"]:
            objet(r, ["cote", "pole", "rang"], f"{h}.raisons")
        verifier_d034(h, tx)
        exiger((tx["fiche"] is not None) == (h == "H86"), f"{h} : fiche")
    f86 = hi["textes"]["H86"]
    exiger(f86["tension"] == "P" and f86["sens"] == 0, "H86 : P, sens 0")
    objet(f86["fiche"], ["titre", "vote"], "H86.fiche")
    chaine(f86["fiche"]["titre"], "H86.titre")
    exiger(len(f86["fiche"]["titre"]) <= 60 and ":" not in f86["fiche"]["titre"], "E8 : titre de H86")
    verifier_vote("H86", f86["fiche"]["vote"], jour)
    # Textes joués.
    exiger(sorted(obj["textes"]) == sorted(JOUEES), "textes : 18 clés")
    rejetes = 0
    objets_issue: dict[str, set] = {}
    for cle, tx in obj["textes"].items():
        objet(tx, ["auteur", "considerations", "lien_scrutin", "lignes", "sens", "sources", "tension", "titre", "vote"], cle)
        chaine(tx["titre"], cle)
        exiger(len(tx["titre"]) <= 60 and ":" not in tx["titre"], f"E8 : titre de {cle}")
        exiger(len(tx["lignes"]) == 3, f"{cle} : lignes")
        for l in tx["lignes"]:
            chaine(l, cle)
            exiger(len(l) <= 90, f"{cle} : ligne de {len(l)} points de code")
        verifier_vote(cle, tx["vote"], jour)
        rejetes += tx["vote"]["issue"] == "rejete"
        objets_issue.setdefault(tx["vote"]["objet"], set()).add(tx["vote"]["issue"])
        a = tx["auteur"]
        if a["type"] == "gouvernement":
            objet(a, ["type"], cle)
        elif a["type"] == "commission":
            objet(a, ["libelle", "type"], cle)
            chaine(a["libelle"], cle)
            exiger(a["libelle"].startswith("commission ") and len(a["libelle"]) <= 80, f"{cle} : libellé de commission")
        else:
            exiger(a["type"] in ("depute", "senateur"), cle)
            objet(a, ["feminin", "groupe", "nom", "type"], cle)
            exiger(a["nom"][0] in INITIALES_PERMISES, f"{cle} : initiale de l'auteur")
            exiger(a["groupe"] is not None or a["type"] == "depute", f"{cle} : groupe null")
            if a["groupe"] is not None:
                verifier_groupe(a["groupe"], cle)
        cs = tx["considerations"]
        exiger([c["rang"] for c in cs] == [1, 2, 3, 4], f"{cle} : rangs")
        for c in cs:
            objet(c, ["cote", "depute", "pole", "rang", "texte"], cle)
            objet(c["depute"], ["elision", "feminin", "groupe", "nom"], cle)
            chaine(c["texte"], cle)
            exiger(c["texte"][-1] in ".?!", f"{cle} : ponctuation finale")
            if c["depute"]["groupe"] is not None:
                verifier_groupe(c["depute"]["groupe"], cle)
            exiger(c["depute"]["nom"][0] in INITIALES_PERMISES, f"{cle} : initiale")
        grp = [c["depute"]["groupe"] for c in cs]
        exiger(len(set(grp)) == 4, f"{cle} : groupes non distincts (null compris)")
        verifier_d034(cle, tx)
    exiger(6 <= rejetes <= 12, f"D-028 : {rejetes} rejetés")
    exiger(any(obj["textes"][e]["vote"]["issue"] == "rejete" for e in ENTREE), "D-028 : aucun rejeté à l'entrée")
    n_obj = {}
    for tx in obj["textes"].values():
        n_obj[tx["vote"]["objet"]] = n_obj.get(tx["vote"]["objet"], 0) + 1
    for o, n in n_obj.items():
        if n >= 2:
            exiger(objets_issue[o] == {"adopte", "rejete"}, f"A.4 : l'objet {o} trahit le résultat")
    exiger(any(tx["vote"]["objet"] in ("texte", "article") and tx["vote"]["issue"] == "rejete"
               for tx in obj["textes"].values()), "A.4 : aucun texte ou article rejeté")
    # Ordre des tensions et présentation B.
    exiger([obj["textes"][str(n)]["tension"] for n in range(15)] == p14["ordre"], "ordre des tensions ≠ ordre retenu")
    exiger([obj["textes"][e]["tension"] for e in ENTREE] == p14["entree"], "tensions de l'entrée")
    # Réponses, absences, atypiques.
    exiger(sorted(obj["reponses"]) == sorted(TEXTES), "reponses : 108 clés")
    for p in PERSONNAGES:
        ab = obj["absences"][p]
        exiger(ab == sorted(ab, key=TEXTES.index) and not any(t in ENTREE + ["14"] for t in ab), f"absences de {p}")
        for t in TEXTES:
            exiger((p in obj["reponses"][t]) == (t not in ab), f"réponse/absence {p} {t}")
        at = obj["reponses_atypiques"][p]
        exiger([e["texte"] for e in at] == sorted({e["texte"] for e in at}, key=TEXTES.index), f"atypiques de {p} : ordre")
        for e in at:
            objet(e, ["cote_tire", "texte"], "atypique")
            exiger(e["texte"] not in ENTREE + ["14"] and p in obj["reponses"][e["texte"]], f"atypique {p} {e['texte']}")
    for t in TEXTES:
        exiger(len(obj["reponses"][t]) >= 3, f"{t} : moins de trois réponses de personnages")
        exiger(sum(t in obj["absences"][p] for p in PERSONNAGES) <= 1, f"{t} : plus d'une absence")
        for p, rp in obj["reponses"][t].items():
            objet(rp, ["niveau", "raison"], f"reponses.{t}.{p}")
            exiger(est_entier(rp["niveau"]) and 1 <= rp["niveau"] <= 5, "niveau")
            exiger(rp["raison"] == "aucune" or (est_entier(rp["raison"]) and 1 <= rp["raison"] <= 4), "raison")
    journal.append(f"Étapes 4 et 5 (schéma, cohérence) : schéma fermé ; tables, cercle et personnages exigés ; "
                   f"90 textes abstraits (jour, tension, rangs, D-034) ; 18 textes (E8, lignes ≤ 90, votes et "
                   f"combinaisons, auteurs, groupes distincts, D-034) ; D-028 ({rejetes} rejetés sur 18, entrée "
                   f"comprise ; A.4) ; ordre retenu ; réponses ⇔ absences ; au plus une absence et au moins trois "
                   f"réponses par texte ; {len(chaines)} chaînes en NFC.")
    # Typographie simple (étape 7).
    aff = [obj["cercle"]["nom"], obj["cercle"]["invitant"], f86["fiche"]["titre"]]
    for tx in obj["textes"].values():
        aff += [tx["titre"]] + tx["lignes"]
        a = tx["auteur"]
        if a["type"] == "commission":
            aff.append(a["libelle"])
        elif a["type"] != "gouvernement":
            aff.append(a["nom"])
            if a["groupe"]:
                aff.append(a["groupe"])
        for c in tx["considerations"]:
            aff += [c["depute"]["nom"], c["texte"]] + ([c["depute"]["groupe"]] if c["depute"]["groupe"] else [])
    for s in aff:
        for interdit in ("\u2019", "\u00a0", "\u202f"):
            exiger(interdit not in s, f"étape 7 : U+{ord(interdit):04X} dans « {s} »")
        for i, ch in enumerate(s):
            if ch in "?!;:»%":
                exiger(i > 0 and s[i - 1] == " ", f"étape 7 : « {ch} » sans espace avant dans « {s} »")
            if ch == "«":
                exiger(i + 1 < len(s) and s[i + 1] == " ", f"étape 7 : « « » sans espace après dans « {s} »")
        for m in re.finditer(r"(?<![0-9])[0-9]+(?: [0-9]+)+(?![0-9])", s):
            exiger(re.fullmatch(r"[0-9]{1,3}(?: [0-9]{3})+", m.group(0)) is not None, f"étape 7 : « {m.group(0)} »")
    journal.append(f"Étape 7 (typographie simple) : {len(aff)} chaînes affichées contrôlées.")
    for s in p14["B"]:
        cle = next(k for k, tx in obj["textes"].items() if tx["lien_scrutin"].endswith("/" + s))
        exiger(obj["textes"][cle]["lignes"][2] == PHRASE_B, f"présentation B : ligne 3 de {s} ≠ phrase fixe")
    journal.append(f"Présentation B ({', '.join(p14['B'])}) : ligne 3 égale à la phrase fixe de A.7, point 14.")
    return obj


def verifier_vote(cle: str, v: dict, jour: datetime.date) -> None:
    exiger(set(v) == {"date", "etape", "issue", "objet", "suite"}, f"{cle} : vote")
    exiger(re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", v["date"]) is not None
           and datetime.date.fromisoformat(v["date"]) <= jour, f"{cle} : date")
    permis = {("texte", "adopte"): {"navette", "definitif"}, ("texte", "rejete"): {"navette", "aucune"},
              ("article", "adopte"): {"navette", "aucune"}, ("amendement", "adopte"): {"navette", "aucune"},
              ("article", "rejete"): {"aucune"}, ("amendement", "rejete"): {"aucune"},
              ("motion", "rejete"): {"aucune"}, ("resolution", "adopte"): {"aucune"},
              ("resolution", "rejete"): {"aucune"}}
    exiger(v["etape"] in permis.get((v["objet"], v["issue"]), set()), f"{cle} : combinaison objet/issue/étape {v}")
    if v["suite"] == "texte_tombe":
        exiger(v["objet"] == "article" and v["issue"] == "rejete", f"{cle} : suite texte_tombe")
    elif v["suite"] == "texte_retire":
        exiger(v["objet"] in ("article", "amendement"), f"{cle} : suite texte_retire")
    else:
        exiger(v["suite"] is None, f"{cle} : suite")


def verifier_groupe(g: str, ou: str) -> None:
    exiger(re.fullmatch(rf"[{LETTRE}0-9 ,&'()-]+", g) is not None, f"{ou} : caractères du groupe « {g} »")
    exiger(g == g.strip(" ") and "  " not in g and len(g) <= 70, f"{ou} : espaces ou longueur du groupe « {g} »")
    exiger(all(re.fullmatch(rf"[{LETTRE}], ", g[i - 1:i + 2] if i > 0 else "") for i, c in enumerate(g) if c == ","),
           f"{ou} : virgule du groupe « {g} »")
    for i, c in enumerate(g):
        if c == "-":
            gauche, droite = g[i - 1:i], g[i + 1:i + 2]
            exiger((re.fullmatch(rf"[{LETTRE}0-9]", gauche or "_") and re.fullmatch(rf"[{LETTRE}0-9]", droite or "_"))
                   or (gauche == " " and droite == " "), f"{ou} : trait d'union du groupe « {g} »")
    exiger(g.count("(") == g.count(")"), f"{ou} : parenthèses du groupe « {g} »")


def verifier_d034(cle: str, tx: dict) -> None:
    s = tx["sens"]
    inatt = {}
    for cote in ("pour", "contre"):
        pc = s if cote == "pour" else 1 - s
        rs = [r for r in tx.get("raisons", tx.get("considerations")) if r["cote"] == cote]
        exiger(len(rs) == 2, f"D-034 : {cle} : {len(rs)} raisons {cote}")
        exiger(any(r["pole"] == pc for r in rs), f"D-034 : {cle} : aucune attendue {cote}")
        inatt[cote] = sum(r["pole"] != pc for r in rs)
        exiger(sum(r["pole"] == "aucun" for r in rs) <= 1, f"D-034 : {cle} : deux « aucun » du côté {cote}")
    exiger(inatt["pour"] == inatt["contre"] and inatt["pour"] in (0, 1), f"D-034 : {cle} : inattendus {inatt}")


# ---------------------------------------------------------------------------
# Manches du porteur (chiffres constants, sans les rendre à P ni à C)
# ---------------------------------------------------------------------------

def manches_porteur(H: Histoire, reps: dict, absences: dict) -> list[dict]:
    """Ses cinq manches (jours 1, 2, 3, 7, 14 : T0, T1, T2, T6, T13), règle 8 à cinq membres."""
    res = []
    for j in (1, 2, 3, 7, 14):
        res.append(H.manche("porteur", j, MEMBRES))
    return res


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------

def jour_paris() -> datetime.date:
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Paris")).date()
    except Exception:  # pragma: no cover
        return datetime.date.today()


def principal(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="Scellement du second essai Elenchos (candidat).")
    ap.add_argument("--statut", default="provisoire", choices=["provisoire", "final"])
    ap.add_argument("--commit", default=None, help="empreinte E du commit de simulation-2.md (défaut : commit courant)")
    ap.add_argument("--alpha", default="1/4", choices=["1/6", "1/4", "1/3"])
    ap.add_argument("--facteur", type=int, default=3, choices=[2, 3, 4])
    ap.add_argument("--seuils-stricts", action="store_true")
    ap.add_argument("--sortie", default=str(SORTIE_DEFAUT))
    ap.add_argument("--jour", default=None)
    ap.add_argument("--rmax", type=int, default=200)
    args = ap.parse_args(argv)

    jour = datetime.date.fromisoformat(args.jour) if args.jour else jour_paris()
    E = args.commit or commit_simulation()
    exiger(re.fullmatch(r"[0-9a-f]{40}", E) is not None, "commit : 40 chiffres hexadécimaux")
    graine = sha(("elenchos-essai-2|graine|" + E).encode("utf-8"))[:16]
    tir = Tirage(graine)
    alpha = Fr(args.alpha)
    journal: list[str] = []

    personnages = lire_personnages()
    profils = {p: personnages[p]["profil"] for p in PERSONNAGES}
    p14 = lire_point14()
    votes = lire_votes()
    fiches, ecarts = lire_fiches()
    cal, sem = calendrier(), semaines()
    verifier_tables_schema(cal, sem)
    journal.append("Tables du calendrier et des semaines recalculées du §0 et égales à celles du schéma 2.4.")

    # Cases, textes joués.
    cles, journal_cases, autre_lecture = tirer_cases(tir, p14)
    exiger(set(cles.values()) == {s for s, f in fiches.items() if not f["legere"]}, "fiches ≠ rôles et cases du point 14")
    for cle, s in cles.items():
        etq = fiches[s]["etiquette"]
        attendu = cle if cle.startswith("E") else f"T{cle}"
        exiger(etq == attendu or not re.fullmatch(r"E[1-3]|T(?:[0-9]|1[0-4])", etq),
               f"en-tête {etq} de la fiche {s} ≠ case tirée {attendu}")
        exiger(votes[s]["rang"] in (attendu, f"{fiches[s]['tension']}·"), f"votes.md : rang {votes[s]['rang']} pour {s}")
    notes_elision: list[str] = []
    textes = assembler_textes(tir, cles, fiches, votes, notes_elision)
    s86 = next(s for s, f in fiches.items() if f["legere"])
    f86 = fiches[s86]
    exiger(votes[s86]["rang"] == "H86" and f86["tension"] == "P" and f86["sens"] == 0, "H86 : rang, tension ou sens")
    TX = {}
    for cle, tx in textes.items():
        TX[cle] = {"tension": tx["tension"], "sens": tx["sens"],
                   "raisons": [{"rang": c["rang"], "cote": c["cote"], "pole": c["pole"]} for c in tx["considerations"]]}
    HT = textes_histoire(tir)
    for h, tx in HT.items():
        TX[h] = tx

    # Réponses de la période d'essai et de l'entrée (indépendantes de r).
    reps_e = {}
    for e in ENTREE:
        reps_e[e] = {}
        for p in PERSONNAGES:
            prof = profils[p][TX[e]["tension"]]
            n = position_type(prof, TX[e]["sens"])
            reps_e[e][p] = {"niveau": n, "raison": choisir_raison(tir, p, e, prof, n, TX[e]["raisons"])}
    reps_t, abs_t, aty_t = reponses_periode(tir, ESSAI_T, "", TX, profils, alpha, None)

    # Calibrage.
    echecs_par_r = []
    retenu = None
    for r in range(1, args.rmax + 1):
        reps_h, abs_h, aty_h = reponses_periode(tir, HIST, f"{r}|", TX, profils, alpha, r)
        reps = {**reps_e, **reps_h, **reps_t}
        absences = {p: abs_h[p] + abs_t[p] for p in PERSONNAGES}
        H = Histoire(tir, TX, reps, profils, absences)
        res = calculer_histoire(H)
        ech = criteres(H, res)
        if not ech:
            retenu = (r, reps, absences, {p: aty_h[p] + aty_t[p] for p in PERSONNAGES}, H, res)
            break
        echecs_par_r.append((r, ech))
    exiger(retenu is not None, f"aucun r de 1 à {args.rmax} ne remplit c1 à c5 : défaut renvoyé à Game design")
    r, reps, absences, atyp, H, res = retenu

    resume = construire_resume(res, r)
    o_resume = canonique(resume)
    exiger(o_resume.isascii(), "résumé non ASCII")
    fichier = {
        "absences": absences,
        "calendrier": cal,
        "cercle": {"invitant": "Valentin", "membres": [{"depuis": DEPUIS[m], "membre": m} for m in MEMBRES],
                   "nom": "Amis"},
        "format": "elenchos-essai-scelle",
        "graine": graine,
        "histoire": {
            "resume_sha256": sha(o_resume),
            "textes": {h: {"fiche": ({"titre": f86["titre"],
                                      "vote": {k: votes[s86][k] for k in ("date", "etape", "issue", "objet", "suite")}}
                                     if h == "H86" else None),
                           "jour": HT[h]["jour"],
                           "raisons": [{"cote": x["cote"], "pole": x["pole"], "rang": x["rang"]} for x in HT[h]["raisons"]],
                           "sens": HT[h]["sens"], "tension": HT[h]["tension"]} for h in HIST},
            "tirage": r,
        },
        "personnages": personnages,
        "reglage": {"alpha": args.alpha, "barre": 16, "facteur": args.facteur, "seuils_stricts": args.seuils_stricts},
        "reponses": {t: reps[t] for t in TEXTES},
        "reponses_atypiques": atyp,
        "semaines": sem,
        "statut": args.statut,
        "textes": {k: public(v) for k, v in textes.items()},
        "vecteurs_test": [],
        "version": 5,
    }
    for cle in CLES_VECTEURS:
        h = sha((graine + "|" + cle).encode("utf-8"))[:8]
        fichier["vecteurs_test"].append({"chaine": graine + "|" + cle, "cle": cle, "hex8": h, "n": int(h, 16)})
    octets = canonique(fichier)
    sortie = Path(args.sortie)
    sortie.mkdir(parents=True, exist_ok=True)
    nom = "fichier-scelle-candidat-1.json" if args.statut == "provisoire" else "fichier-scelle-candidat-final.json"
    (sortie / nom).write_bytes(octets)
    relu = (sortie / nom).read_bytes()
    exiger(relu == octets, "relecture du fichier")
    obj = verifier_fichier(relu, jour, p14, journal)
    empreinte = sha(relu)

    trace = construire_trace(res, resume, empreinte)
    o_trace = canonique(trace)
    (sortie / "resume-histoire.json").write_bytes(o_resume)
    (sortie / "trace-histoire-S.json").write_bytes(o_trace)
    exiger(json.loads(o_trace)["arrivee"]["resume_sha256"] == obj["histoire"]["resume_sha256"], "V6 sur la trace")

    rapport = rediger_rapport(args, E, graine, tir, r, echecs_par_r, journal, journal_cases, autre_lecture, cles,
                              textes, HT, obj, res, H, empreinte, o_resume, o_trace, ecarts, notes_elision, nom, jour)
    (sortie / ("rapport-" + nom.replace("fichier-scelle-", "").replace(".json", ".txt"))).write_text(rapport, encoding="utf-8")
    detail = detail_porteur(H, obj)
    (sortie / "detail-manches-porteur.txt").write_text(detail, encoding="utf-8")
    sys.stdout.write(rapport)
    return 0


def detail_porteur(H: Histoire, obj: dict) -> str:
    l = ["Manches du porteur sur ce candidat (à ne pas montrer aux auteurs du contrôle, de la page ni des carnets",
         "de référence avant qu'ils aient rendu leur travail). Règle 8 à cinq membres ; R3 (rareté ou distance)."]
    for j in (1, 2, 3, 7, 14):
        m = H.manche("porteur", j, MEMBRES)
        t = m["texte"]
        l.append(f"Jour {j}, texte T{t} ({H.TX[t]['tension']}, s = {H.TX[t]['sens']}) : médiane {m['mediane']}")
        for X in m["classement"]:
            d = m["possibles"][X]
            l.append(f"  {X:9s} niveau {d['niveau']} raison {str(d['raison']):6s} x {str(d['x']):4s} "
                     f"Σw {str(d['somme_w']):5s} c {str(d['c']):7s} net {d['net']!s:5s} dist {str(d['distance']):7s} "
                     f"rareté {str(d['rarete']):5s} surprise {d['surprise']}")
        l.append(f"  places {m['places']} ; remplacements {m['remplacements']} ; raison cachée {m['raison_cachee']} ; "
                 f"ordre {m['ordre']}")
    return "\n".join(l) + "\n"


def rediger_rapport(args, E, graine, tir, r, echecs_par_r, journal, journal_cases, autre_lecture, cles, textes, HT,
                    obj, res, H, empreinte, o_resume, o_trace, ecarts, notes_elision, nom, jour) -> str:
    L = []
    prov = args.statut == "provisoire"
    L.append(("CANDIDAT 1 (PROVISOIRE) — NE PAS PUBLIER CETTE EMPREINTE" if prov else "CANDIDAT FINAL") +
             " — second essai Elenchos, rapport du programme de scellement (S)")
    L.append(f"Programme : {Path(__file__).relative_to(RACINE)}  (SHA-256 {sha(Path(__file__).read_bytes())})")
    L.append(f"Fichier : {nom} ; {len(canonique(obj))} octets ; SHA-256 {empreinte}")
    L.append(f"Statut : {obj['statut']}")
    L.append(f"Graine {'PROVISOIRE ' if prov else ''}: {graine} = 16 premiers chiffres hex de "
             f"SHA-256(\"elenchos-essai-2|graine|{E}\")")
    if prov:
        L.append("  E est le commit courant de docs/essai/simulation-2.md, pas le commit E de la spécification relue "
                 "(§0) : la graine changera au candidat final, et avec elle tous les tirages de ce rapport.")
    L.append(f"Réglage : alpha {args.alpha} ; facteur {args.facteur} ; barre 16 ; seuils_stricts "
             f"{'true' if args.seuils_stricts else 'false'} (réglage final au candidat final, point 11)")
    L.append(f"Jour du scellement utilisé (dates de vote) : {jour.isoformat()}")
    L.append("")
    L.append("Sources lues (SHA-256) :")
    for f in [F_SIMULATION, F_REGLES, F_SCHEMA, F_VOTES] + F_FICHES + [F_SCELLE1, F_EMPREINTE1, F_PROFILS1, F_SCHEMA1]:
        L.append(f"  {sha(f.read_bytes())}  {f.relative_to(RACINE)}")
    for f in (F_REGLES, F_SCHEMA, F_SIMULATION):
        c = subprocess.run(["git", "-C", str(RACINE), "log", "-1", "--format=%H", "--", str(f)],
                           capture_output=True, text=True).stdout.strip()
        L.append(f"  dernier commit de {f.name} : {c}")
    L.append("")
    L.append("Tirage des cases, t(\"ordre-texte|tension|i\"), i = rang dans la liste « Cases » du point 14 :")
    L += ["  " + j for j in journal_cases]
    L.append("  En-têtes à écrire dans les fiches : " + ", ".join(
        f"{s} → {('T' + k) if not k.startswith('E') else k}" for k, s in sorted(cles.items(), key=lambda kv: JOUEES.index(kv[0]))
        if not k.startswith("E") and k not in ("0", "14")) + ".")
    diff = {k: v for k, v in autre_lecture.items() if cles[k] != v}
    L.append("  Autre lecture (i = numéro de scrutin) : " + (", ".join(f"T{k} = {v}" for k, v in sorted(autre_lecture.items(), key=lambda kv: int(kv[0])))
                                                           + (f" ; diffère sur {len(diff)} cases" if diff else " ; même résultat")))
    L.append("")
    L.append(f"Calibrage (point 10) : r retenu = {r}.")
    for rr, ech in echecs_par_r:
        L.append(f"  r = {rr} : échec — " + " ; ".join(ech))
    L.append("")
    L.append("État à l'arrivée (curseurs vus au jour 1 : entrée et H1 à H90) :")
    for p in PERSONNAGES:
        L.append(f"  {p:9s} " + "  ".join(
            f"{t} c={res['arrivee'][p][t]['c']} Σw={res['arrivee'][p][t]['somme_w']}{' net' if res['arrivee'][p][t]['net'] else ''}"
            for t in TENSIONS))
    L.append("Tempéraments du jour 0 (fenêtre H34 à H89) :")
    for p in PERSONNAGES:
        d = res["temperaments"][p]
        L.append(f"  {p:9s} {d['temperaments']} ; réponses {d['reponses']}, seul de son côté {d['seul_cote']}, "
                 f"neutres {d['neutres']}, très {d['tres']}, textes partagés {d['textes_partages']}, seul au milieu {d['seul_milieu']}")
    L.append("Titres des semaines 1 à 13 :")
    for s in res["semaines"]:
        L.append(f"  semaine {s['semaine']:2d} : Devin {s['devin']['titulaire']} ({s['devin']['departage']}) ; "
                 f"Mystère {s['mystere']['titulaire']} ({s['mystere']['departage']}) ; Fidèles {s['fidele']['titulaires']} ; "
                 f"Sans-Faute {s['sans_faute']} ; surprise {s['surprise']['texte']}")
    c3 = res["c3"]
    L.append(f"Critère c3 (tous les textes révélés en semaine 13 candidats) : {c3['texte']}, départage {c3['departage']} ; "
             f"attributions {c3['attributions']} ; erreurs {c3['erreurs']}.")
    L.append("")
    L.append(f"Résumé de l'histoire : resume-histoire.json, {len(o_resume)} octets, SHA-256 {sha(o_resume)} "
             f"(= histoire.resume_sha256).")
    L.append(f"Trace S de l'histoire : trace-histoire-S.json, {len(o_trace)} octets, SHA-256 {sha(o_trace)}.")
    L.append("")
    L.append("Vérifications du fichier écrit :")
    L += ["  - " + j for j in journal]
    L.append("")
    L.append("Vecteurs de test :")
    for v in obj["vecteurs_test"]:
        L.append(f"  t(\"{v['cle']}\") : hex8 {v['hex8']} ; N {v['n']}")
    L.append("")
    L.append("Chiffres constants (partie calculable ici ; le reste au candidat final) :")
    L += ["  " + x for x in chiffres_constants(obj, res, H)]
    L.append("")
    L.append("Écarts de forme relevés dans les sources (QUESTIONS.md) :")
    L += ["  - " + e for e in ecarts]
    L.append("Élision (tableau 2.11 pas encore rempli : valeurs provisoires) :")
    L += ["  - " + n for n in sorted(set(notes_elision))]
    L.append("")
    L.append(f"SHA-256 du candidat : {empreinte}")
    return "\n".join(L) + "\n"


def chiffres_constants(obj: dict, res: dict, H: Histoire) -> list[str]:
    out = []
    rep = obj["reponses"]
    n_par_texte = {t: len(rep[t]) for t in TEXTES}
    out.append("Réponses de personnages par texte : " + ", ".join(
        f"{k} textes à {n}" for n, k in sorted({n: sum(1 for v in n_par_texte.values() if v == n) for n in set(n_par_texte.values())}.items())) + ".")
    tot = sum(n_par_texte.values())
    auc = [(t, p) for t in TEXTES for p, r in rep[t].items() if r["raison"] == "aucune"]
    out.append(f"Raisons « aucune » chez les personnages : {len(auc)} sur {tot} réponses"
               + (" (" + ", ".join(f"{p} {t}" for t, p in auc) + ")" if auc else "") + ".")
    neutres = [t for t in TEXTES if all(r["niveau"] == 3 for r in rep[t].values())]
    out.append(f"Cercle unanimement neutre : {len(neutres)} texte(s){' ' + str(neutres) if neutres else ''}.")
    at = {p: [e["texte"] for e in obj["reponses_atypiques"][p]] for p in PERSONNAGES}
    nh = sum(1 for p in PERSONNAGES for t in at[p] if t.startswith("H"))
    nt = sum(1 for p in PERSONNAGES for t in at[p] if not t.startswith("H"))
    rh = sum(len(rep[t]) for t in HIST)
    rt = sum(len(rep[t]) for t in ESSAI_T[:-1])
    out.append(f"Réponses atypiques : histoire {nh} sur {rh} ({Fr(nh, rh)}) ; essai T0–T13 {nt} sur {rt} ; "
               + " ; ".join(f"{p} T: {[t for t in at[p] if not t.startswith('H')]}" for p in PERSONNAGES) + ".")
    out.append("Absences (essai) : " + " ; ".join(f"{p} {[t for t in obj['absences'][p] if not t.startswith('H')]}" for p in PERSONNAGES)
               + f" ; histoire : {sum(1 for p in PERSONNAGES for t in obj['absences'][p] if t.startswith('H'))}.")
    lues = [c["revele"] for c in obj["calendrier"] if c["revelation_porteur"] == "lue"]
    rej = [t for t in ENTREE + lues if obj["textes"][t]["vote"]["issue"] == "rejete"]
    out.append(f"« Texte rejeté. » parmi les révélations lues, entrée comprise : {len(rej)} sur {len(ENTREE + lues)} ({rej}).")
    pdc = {}
    for t in lues:
        pc = pas_de_cote(H, t)
        if pc:
            pdc[t] = pc
    out.append(f"Pas de Côté des personnages sur les révélations lues : {pdc or 'aucun'}.")
    pdc_h = {jj: e["revelation"]["pas_de_cote"] for jj, e in res["jours"].items() if e["revelation"] and e["revelation"]["pas_de_cote"]}
    out.append(f"Pas de Côté des personnages dans l'histoire (jour : membres) : {pdc_h or 'aucun'}.")
    types = {}
    for k, tx in obj["textes"].items():
        s = tx["sens"]
        ty = []
        for cote in ("pour", "contre"):
            pc = s if cote == "pour" else 1 - s
            r = [c for c in tx["considerations"] if c["cote"] == cote and c["pole"] != pc]
            ty.append("aucun" if not r else ("pratique" if r[0]["pole"] == "aucun" else "croisé"))
        types[k] = "/".join(ty)
    out.append("Inattendus par texte (pour/contre) : " + ", ".join(f"{k} {v}" for k, v in types.items()) + ".")
    # Manches du porteur.
    cartes = 0
    atyp_c = 0
    jum = 0
    for j in (1, 2, 3, 7, 14):
        m = H.manche("porteur", j, MEMBRES)
        t = m["texte"]
        for X in m["places"]:
            cartes += 1
            atyp_c += any(e["texte"] == t for e in obj["reponses_atypiques"][X])
            jum += sum(1 for Y in PERSONNAGES if Y not in m["places"] and Y in rep[t] and rep[t][Y] == rep[t][X])
    out.append(f"Manches du porteur (T0, T1, T2, T6, T13) : {cartes} cartes ; réponses atypiques parmi elles : {atyp_c} ; "
               f"jumeaux non servis qu'il peut désigner : {jum}.")
    return out


if __name__ == "__main__":
    try:
        sys.exit(principal(sys.argv[1:]))
    except Defaut as e:
        sys.stderr.write(f"DÉFAUT : {e}\n")
        sys.exit(1)
