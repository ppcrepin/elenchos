#!/usr/bin/env python3
"""Programme de scellement de l'essai Elenchos (fichier scellé, version 4).

Outillage d'essai, pas du code applicatif (simulation, « Décisions touchées » ; D-001 tenu).
À ne pas ouvrir avant la fin de l'essai : ce programme lit le dossier caché et écrit
les réponses des personnages.

Ce qu'il fait, dans l'ordre :
  1. lit les sources, sans recopie à la main des données :
     - docs/essai/simulation.md : §1 (cercle, fiches visibles) ;
     - a-ne-pas-ouvrir/profils.md : positions, fermetés, réponse type (contrôle croisé),
       nombre de réponses atypiques, absences ;
     - a-ne-pas-ouvrir/regles-de-calcul.md, annexe A : ordre des tensions (contrôle croisé) ;
     - a-ne-pas-ouvrir/textes/{S,P,T,L}-*.md : les 17 fiches retenues (les réserves sont ignorées) ;
     - a-ne-pas-ouvrir/textes/votes.md : issue, date et étape de chaque vote ;
     - a-ne-pas-ouvrir/schema.md, parties 2.7 et 2.8 : groupes permis, élision ;
  2. tire l'ordre d'affichage des quatre raisons de chaque texte (les fiches disent
     « ordre des raisons tiré au scellement » ; la règle retenue est écrite plus bas) ;
  3. calcule toutes les réponses (regles-de-calcul.md §2.1, §2.2, §2.3, §2.5 ; profils.md) ;
  4. écrit le JSON canonique (RFC 8785 ; schema.md partie 1.1) ;
  5. relit les octets écrits et fait les vérifications de schema.md partie 4.1, étapes 3 à 8
     (l'étape 8 par un second lecteur des fiches, écrit à la lettre du schéma ; les étapes 1 et 2
     demandent l'empreinte publiée et la page : « non faites ») ;
  6. fait quelques contrôles de cohérence en plus (contraintes de profils.md et de l'annexe A),
     calcule les chiffres constants du fichier pour le rapport de scellement
     (regles-de-calcul.md §9 bis), et affiche l'empreinte SHA-256.

Graine (simulation §0, qui écrit la dérivation et la valeur ; le programme vérifie les deux) :
  graine = 16 premiers chiffres hexadécimaux de
           SHA-256("elenchos-essai|graine|" + empreinte complète du commit de la spécification relue)
  avec le commit 7f4d367278ecf07b01ebad883b7ec75cf7840820 (« Appliquer la passe finale du
  Vérificateur avant scellement »), poussé avant l'écriture de ce programme. Personne n'a donc
  choisi la graine, et ni les fiches ni les règles en vigueur à ce commit n'ont pu être ajustées
  à elle (ce qui a été écrit après est listé au paragraphe « Graine » du rapport de scellement,
  regles-de-calcul.md §9 bis).

Ordre d'affichage des raisons (regles-de-calcul.md §2) : pour le texte X, les quatre raisons de la
  fiche, numérotées 1 à 4 dans la fiche, sont triées par t("ordre-raisons|X|i") croissant ; la première
  du tri reçoit le rang 1.

Usage :
  python3 sceller.py [--atypiques N] [--seuils-stricts] [--jour AAAA-MM-JJ] [--sortie DOSSIER]
Python 3.11, bibliothèque standard seulement. Toute anomalie arrête le programme (code 1).
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import re
import sys
import unicodedata
from fractions import Fraction
from pathlib import Path

# ---------------------------------------------------------------------------
# Emplacements
# ---------------------------------------------------------------------------

ICI = Path(__file__).resolve().parent
RACINE = ICI.parents[4]  # .../elenchos
ESSAI = RACINE / "docs" / "essai"
CACHE = ESSAI / "a-ne-pas-ouvrir"
TEXTES_DIR = CACHE / "textes"
F_SIMULATION = ESSAI / "simulation.md"
F_PROFILS = CACHE / "profils.md"
F_REGLES = CACHE / "regles-de-calcul.md"
F_SCHEMA = CACHE / "schema.md"
F_VOTES = TEXTES_DIR / "votes.md"
F_FICHES = [TEXTES_DIR / n for n in (
    "S-securite-liberte.md", "P-precaution-innovation.md",
    "T-tradition-changement.md", "L-local-national.md")]

COMMIT_SPEC = "7f4d367278ecf07b01ebad883b7ec75cf7840820"
SORTIE_DEFAUT = ICI / "candidat"
NOM_CANDIDAT = "fichier-scelle-candidat.json"

# ---------------------------------------------------------------------------
# Constantes de la spécification (noms, pas données du lot)
# ---------------------------------------------------------------------------

PERSONNAGES = ["Agathe", "Nassim", "Odile", "Valentin"]  # schema 1.3
TEXTES = ["E1", "E2", "E3"] + [str(n) for n in range(1, 15)]  # schema 1.3
QUOTIDIENS = [str(n) for n in range(1, 15)]
TENSIONS = ["S", "P", "T", "L"]
POLES = {  # simulation §0 et profils.md (noms des pôles dans la table de réponse type)
    "S": ("Sécurité", "Liberté"),
    "P": ("Précaution", "Innovation"),
    "T": ("Tradition", "Changement"),
    "L": ("Local", "National"),
}
M_FERMETE = {"faible": Fraction(6, 10), "moyenne": Fraction(1), "forte": Fraction(16, 10)}  # §2.1
VALEUR = {1: Fraction(0), 2: Fraction(1, 4), 3: Fraction(1, 2), 4: Fraction(3, 4), 5: Fraction(1)}  # §0
MOIS = {"janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6, "juillet": 7,
        "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12}
CLES_VECTEURS = ["raison|Odile|E2|3", "hasard|Nassim|12|porteur", "surprise-semaine|2|11"]  # §0, schema 2.5
LETTRE = "A-Za-zÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒàâäçéèêëîïôöùûüÿæœ"  # schema 2.7
INITIALES_PERMISES = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ") | set("ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸÆŒ")  # schema 2.8, liste 1
INITIALES_CHOIX = set("AEIOUYH") | set("ÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÆŒ")  # schema 2.8, liste 2
CODES_INTERDITS = {"UDDPLR", "DEM", "ECOS", "ECOLO", "SOC-A", "UMPPO"}  # schema 2.7


class Defaut(Exception):
    """Toute anomalie : le programme s'arrête."""


def exiger(cond: bool, message: str) -> None:
    if not cond:
        raise Defaut(message)


# ---------------------------------------------------------------------------
# Tirage déterministe (§0)
# ---------------------------------------------------------------------------

def hex8(graine: str, cle: str) -> str:
    exiger(cle.isascii() and " " not in cle, f"clé de tirage non ASCII ou avec espace : {cle!r}")
    return hashlib.sha256((graine + "|" + cle).encode("utf-8")).hexdigest()[:8]


def tirage(graine: str, cle: str) -> tuple[int, bytes]:
    """Clé de tri de t(clé) : N d'abord, puis la clé en octets UTF-8 (égalité exacte de t)."""
    return (int(hex8(graine, cle), 16), cle.encode("utf-8"))


def t_inferieur_demi(graine: str, cle: str) -> bool:
    return int(hex8(graine, cle), 16) < 2 ** 31  # N / 16^8 < 1/2


# ---------------------------------------------------------------------------
# Forme canonique (schema 1.1)
# ---------------------------------------------------------------------------

def canonique(objet) -> bytes:
    return json.dumps(objet, ensure_ascii=False, sort_keys=True, separators=(",", ":"),
                      allow_nan=False).encode("utf-8")


# ---------------------------------------------------------------------------
# Lecture des sources
# ---------------------------------------------------------------------------

def lire(chemin: Path) -> str:
    texte = chemin.read_bytes().decode("utf-8")
    exiger(unicodedata.normalize("NFC", texte) == texte, f"{chemin.name} n'est pas en NFC")
    return texte


def section(texte: str, titre_regex: str, niveau: str) -> str:
    """Contenu d'une section Markdown, du titre au titre suivant de même niveau ou supérieur."""
    lignes = texte.split("\n")
    debut = None
    for i, l in enumerate(lignes):
        if re.fullmatch(titre_regex, l):
            exiger(debut is None, f"section en double : {titre_regex}")
            debut = i
    exiger(debut is not None, f"section introuvable : {titre_regex}")
    fin = len(lignes)
    prefixes = tuple("#" * j + " " for j in range(1, len(niveau) + 1))
    for j in range(debut + 1, len(lignes)):
        if lignes[j].startswith(prefixes):
            fin = j
            break
    return "\n".join(lignes[debut + 1:fin])


def lignes_tableau(bloc: str, entete: str) -> list[list[str]]:
    """Lignes d'un tableau Markdown dont l'en-tête est exactement `entete` (cellules nettoyées)."""
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
        exiger(morceaux[0] == "" and morceaux[-1] == "", f"ligne de tableau mal bornée : {l}")
        cellules = [c.strip(" ") for c in morceaux[1:-1]]
        exiger(len(cellules) == n_col, f"ligne de tableau à {len(cellules)} cellules : {l}")
        rangs.append(cellules)
    return rangs


def tableaux(bloc: str, entete: str) -> list[list[list[str]]]:
    """Tous les tableaux d'un bloc dont l'en-tête est exactement `entete`, dans l'ordre."""
    morceaux = bloc.split("\n" + entete + "\n")
    return [lignes_tableau(entete + "\n" + m, entete) for m in morceaux[1:]]


def lire_graine_spec() -> tuple[str, str]:
    """§0 de la simulation : commit de dérivation et graine annoncée."""
    texte = lire(F_SIMULATION)
    m = re.findall(r'SHA-256\("elenchos-essai\|graine\|" \+ E\).*?: ([0-9a-f]{40}), ce qui donne ([0-9a-f]{16})\.', texte)
    exiger(len(m) == 1, "§0 : dérivation de la graine introuvable")
    return m[0]


def lire_simulation() -> tuple[dict, dict]:
    texte = lire(F_SIMULATION)
    s1 = section(texte, r"## 1\. Les quatre personnages", "##")
    m = re.search(r"Le cercle s'appelle « ([^»]+) »", s1)
    exiger(m is not None, "nom du cercle introuvable au §1")
    nom = m.group(1)
    m = re.search(r"\*\*([A-Z][a-z]+) invite le porteur\.\*\*", s1)
    exiger(m is not None, "inviteuse introuvable au §1")
    cercle = {"nom": nom, "inviteuse": m.group(1)}
    rangs = lignes_tableau(s1, "| Prénom | Âge | Métier | Ville | Ligne de vie | Heure de jeu |")
    fiches = {}
    for prenom, age, metier, ville, vie, heure in rangs:
        exiger(re.fullmatch(r"[1-9][0-9]*", age) is not None, f"âge illisible : {age}")
        m = re.fullmatch(r"(0|[1-9][0-9]?)h([0-9]{2})", heure)
        exiger(m is not None, f"heure de jeu illisible : {heure}")
        h, mn = int(m.group(1)), int(m.group(2))
        exiger(0 <= h <= 23 and 0 <= mn <= 59, f"heure de jeu hors bornes : {heure}")
        fiches[prenom] = {"age": int(age), "metier": metier, "ville": ville, "ligne_de_vie": vie,
                          "heure_de_jeu": f"{h:02d}:{mn:02d}", "_heure_affichee": heure}
    exiger(list(fiches) == PERSONNAGES, f"personnages du §1 : {list(fiches)}")
    exiger(cercle["inviteuse"] in PERSONNAGES, "inviteuse inconnue")
    return cercle, fiches


def decimal_fr(s: str) -> Fraction:
    m = re.fullmatch(r"([+−-]?)([0-9]+)(?:,([0-9]+))?", s)
    exiger(m is not None, f"nombre illisible : {s}")
    entier = m.group(2) + (m.group(3) or "")
    v = Fraction(int(entier), 10 ** len(m.group(3) or ""))
    return -v if m.group(1) in ("−", "-") else v


def lire_profils() -> dict:
    texte = lire(F_PROFILS)
    res = {}
    s = section(texte, r"## Profils cachés : position p \(0 à 1\) et fermeté", "##")
    profils = {}
    for cell in lignes_tableau(s, "| | S | P | T | L |"):
        prenom, vals = cell[0], cell[1:]
        prof = {}
        for tension, v in zip(TENSIONS, vals):
            m = re.fullmatch(r"([0-9]),([0-9]{2}) (faible|moyenne|forte)", v)
            exiger(m is not None, f"profil illisible : {prenom} {tension} {v}")
            position = 100 * int(m.group(1)) + int(m.group(2))
            exiger(position <= 100, f"position au-delà de 100 : {v}")
            prof[tension] = {"position": position, "fermete": m.group(3)}
        profils[prenom] = prof
    exiger(list(profils) == PERSONNAGES, "personnages de profils.md")
    res["profils"] = profils

    s = section(texte, r"## Réponse type qui en découle .*", "##")
    tables = tableaux(s, "| | S | P | T | L |")
    exiger(len(tables) == 2, "profils.md : « Réponse type » doit avoir deux tableaux")
    res["reponse_type_table"] = {r[0]: dict(zip(TENSIONS, r[1:])) for r in tables[0]}
    for r in tables[1]:
        exiger(all(re.fullmatch(r"[+−][0-9]+,[0-9]+", v) for v in r[1:]), f"profils.md : d illisible : {r}")
    res["d_table"] = {r[0]: {t: decimal_fr(v) for t, v in zip(TENSIONS, r[1:])} for r in tables[1]}

    s = section(texte, r"## Corrigé de la question F1 .*", "##")
    res["f1_table"] = {r[0]: dict(zip(TENSIONS, r[1:])) for r in lignes_tableau(s, "| | S | P | T | L |")}

    s = section(texte, r"## Réponses atypiques .*", "##")
    m = re.findall(r"^- Exactement ([0-9]+) par personnage", s, re.M)
    exiger(len(m) == 1, "nombre de réponses atypiques introuvable dans profils.md")
    res["n_atypiques"] = int(m[0])

    s = section(texte, r"## Absences .*", "##")
    absences = {}
    for prenom, cell in lignes_tableau(s, "| Personnage | Textes sans réponse |"):
        if cell == "aucun":
            absences[prenom] = []
        else:
            nums = re.split(r", | et ", cell)
            exiger(all(re.fullmatch(r"[1-9][0-9]?", x) for x in nums), f"absences illisibles : {cell}")
            absences[prenom] = sorted(nums, key=int)
    exiger(list(absences) == PERSONNAGES, "personnages des absences")
    res["absences"] = absences
    return res


def lire_ordre_tensions() -> list[str]:
    texte = lire(F_REGLES)
    m = re.findall(r"Ordre retenu : ((?:[SPTL] (?:\| )?)+[SPTL])\.", texte)
    exiger(len(m) == 1, "ordre retenu introuvable dans regles-de-calcul.md")
    ordre = [c for c in m[0] if c in "SPTL"]
    exiger(len(ordre) == 14, f"ordre retenu de {len(ordre)} textes")
    return ordre


def date_fr(s: str) -> str:
    m = re.fullmatch(r"(1er|[0-9]{1,2}) ([a-zéû]+) ([0-9]{4})", s)
    exiger(m is not None and m.group(2) in MOIS, f"date illisible : {s}")
    j = 1 if m.group(1) == "1er" else int(m.group(1))
    return datetime.date(int(m.group(3)), MOIS[m.group(2)], j).isoformat()


def lire_votes() -> dict:
    texte = lire(F_VOTES)
    rangs = lignes_tableau(texte, "| Rang | Scrutin | `issue` | `date` | `etape` | Preuve principale |")
    votes = {}
    for rang, scrutin, issue, date, etape, _preuve in rangs:
        if rang not in TEXTES:
            continue  # réserves : non scellées
        m = re.fullmatch(r"(1[5-7])e, ([0-9]+)", scrutin)
        exiger(m is not None, f"scrutin illisible dans votes.md : {scrutin}")
        exiger(rang not in votes, f"texte {rang} en double dans votes.md")
        votes[rang] = {"issue": issue, "date": date, "etape": etape,
                       "_legislature": m.group(1), "_scrutin": m.group(2)}
    exiger(sorted(votes, key=TEXTES.index) == TEXTES, f"votes.md : textes {sorted(votes)}")
    return votes


RE_TITRE_FICHE = re.compile(r"### (E[1-3]|[1-9][0-9]?) · scrutin ([0-9]+) \((1[5-7])e législature\)")
RE_RAISON = re.compile(
    r"  ([1-4])\. « (.+?) » — (pour|contre) · pôle (0|1|aucun) — ([^,\[\]]+), (député|députée), "
    r"(.+?) \[vote : ([^\]]+)\] — extrait : .+")
RE_AUTEUR = re.compile(
    r"- Auteur : ([^,]+), (député|députée|sénateur|sénatrice), (.+?)(?: au dépôt \(| ; |\. ).*")


def lire_fiches() -> dict:
    fiches = {}
    for chemin in F_FICHES:
        texte = lire(chemin)
        lignes = texte.split("\n")
        debuts = [i for i, l in enumerate(lignes) if l.startswith("### ")]
        for a, i in enumerate(debuts):
            m = RE_TITRE_FICHE.fullmatch(lignes[i])
            if m is None:
                exiger(lignes[i].startswith("### Réserve"), f"titre de fiche inattendu : {lignes[i]}")
                continue
            cle = m.group(1)
            exiger(cle not in fiches, f"fiche {cle} en double")
            bloc = lignes[i + 1:(debuts[a + 1] if a + 1 < len(debuts) else len(lignes))]
            fiche = analyser_fiche(cle, bloc, chemin.name)
            fiche["_scrutin"], fiche["_legislature"], fiche["_fichier"] = m.group(2), m.group(3), chemin.name
            fiches[cle] = fiche
    exiger(sorted(fiches, key=TEXTES.index) == TEXTES, f"fiches trouvées : {sorted(fiches)}")
    return fiches


def analyser_fiche(cle: str, bloc: list[str], fichier: str) -> dict:
    champs: dict[str, list[str]] = {}
    courant = None
    for l in bloc:
        if l.startswith("- "):
            nom = l[2:].split(" :", 1)[0].split(" (", 1)[0]
            courant = nom
            exiger(nom not in champs, f"{cle} : champ « {nom} » en double")
            champs[nom] = [l]
        elif l.startswith("  ") and courant is not None:
            champs[courant].append(l)
        elif l.strip() == "":
            courant = None
        else:
            courant = None  # autre ligne : ignorée (schéma, partie 4.1, étape 8)
    for requis in ("Titre", "Lignes", "Vote", "Auteur", "Lien du scrutin", "Sources", "Tension", "Raisons"):
        exiger(requis in champs, f"{cle} ({fichier}) : champ « {requis} » absent")

    m = re.fullmatch(r"- Titre : (.+)", champs["Titre"][0])
    titre = m.group(1)
    exiger(len(champs["Titre"]) == 1, f"{cle} : titre sur plusieurs lignes")

    exiger(champs["Lignes"][0] == "- Lignes :", f"{cle} : champ Lignes")
    lignes_txt = []
    for j, l in enumerate(champs["Lignes"][1:], 1):
        m = re.fullmatch(rf"  {j}\. (.+)", l)
        exiger(m is not None, f"{cle} : ligne {j} illisible : {l}")
        lignes_txt.append(m.group(1))
    exiger(len(lignes_txt) == 3, f"{cle} : {len(lignes_txt)} lignes")

    vote_l = champs["Vote"][0]
    exiger(len(champs["Vote"]) == 1, f"{cle} : vote sur plusieurs lignes")
    if vote_l.startswith("- Vote : adopté, "):
        issue_fiche = "adopte"
    elif vote_l.startswith("- Vote : rejeté, "):
        issue_fiche = "rejete"
    elif vote_l.startswith("- Vote : article unique adopté, sans vote sur l'ensemble"):
        issue_fiche = "sans_vote_ensemble"
    else:
        raise Defaut(f"{cle} : issue du vote illisible : {vote_l}")
    m = re.search(r"\(((?:1er|[0-9]{1,2}) [a-zéû]+ [0-9]{4})\)", vote_l)
    exiger(m is not None, f"{cle} : date du vote illisible")
    date_fiche = date_fr(m.group(1))

    aut_l = champs["Auteur"][0]
    exiger(len(champs["Auteur"]) == 1, f"{cle} : auteur sur plusieurs lignes")
    if re.fullmatch(r"- Auteur : Gouvernement(?: \(projet de loi\)\.| ;).*", aut_l):
        auteur = {"type": "gouvernement"}
    else:
        m = RE_AUTEUR.fullmatch(aut_l)
        exiger(m is not None, f"{cle} : auteur illisible : {aut_l}")
        mandat = m.group(2)
        auteur = {"type": "depute" if mandat.startswith("député") else "senateur",
                  "nom": m.group(1), "feminin": mandat in ("députée", "sénatrice"),
                  "groupe": m.group(3)}

    m = re.fullmatch(r"- Lien du scrutin : (https://\S+)", champs["Lien du scrutin"][0])
    exiger(m is not None and len(champs["Lien du scrutin"]) == 1, f"{cle} : lien du scrutin")
    lien = m.group(1)

    exiger(champs["Sources"][0] == "- Sources :", f"{cle} : champ Sources : {champs['Sources'][0]}")
    sources = []
    for l in champs["Sources"][1:]:
        m = re.fullmatch(r"  - (https://\S+)", l)
        exiger(m is not None, f"{cle} : source illisible : {l}")
        sources.append(m.group(1))

    m = re.fullmatch(r"- Tension : ([SPTL]) ; sens s = ([01])", champs["Tension"][0])
    exiger(m is not None, f"{cle} : tension illisible")
    tension, sens = m.group(1), int(m.group(2))

    exiger(champs["Raisons"][0] == "- Raisons :", f"{cle} : champ Raisons")
    raisons = []
    for j, l in enumerate(champs["Raisons"][1:], 1):
        m = RE_RAISON.fullmatch(l)
        exiger(m is not None and int(m.group(1)) == j, f"{cle} : raison {j} illisible : {l[:90]}")
        raisons.append({
            "numero_fiche": j, "texte": m.group(2), "cote": m.group(3),
            "pole": "aucun" if m.group(4) == "aucun" else int(m.group(4)),
            "depute": {"nom": m.group(5), "feminin": m.group(6) == "députée", "groupe": m.group(7)},
            "_vote_orateur": m.group(8),
        })
    exiger(len(raisons) == 4, f"{cle} : {len(raisons)} raisons")
    return {"titre": titre, "lignes": lignes_txt, "_issue_fiche": issue_fiche, "_date_fiche": date_fiche,
            "auteur": auteur, "lien_scrutin": lien, "sources": sources, "tension": tension,
            "sens": sens, "raisons": raisons}


def lire_table_groupes() -> list[dict]:
    """schema.md partie 2.7, lue comme le prescrit la partie 2.7 (« Lecture par le programme »)."""
    texte = lire(F_SCHEMA)
    s = section(texte, r"### 2\.7 Groupes permis \(§7\.10\)", "###")
    entete = "| `groupe` | Chambre | Législature | Nom complet | Identifiant | Source du sigle |"
    rangs = lignes_tableau(s, entete)
    exiger(s.count("\n|---") == 1, "partie 2.7 : un seul tableau attendu")
    lignes = []
    for c in rangs:
        exiger(all(x != "" for x in c), f"cellule vide dans la partie 2.7 : {c}")
        exiger(all(unicodedata.normalize("NFC", x) == x for x in c), "cellule non NFC (2.7)")
        g = c[0]
        exiger(len(g) >= 2 and g[0] == "`" and g[-1] == "`", f"groupe sans accents graves : {g}")
        g = g[1:-1]
        lignes.append({"groupe": g, "chambre": c[1], "legislature": c[2],
                       "identifiants": c[4].split(", "), "_identifiant_brut": c[4]})
    return lignes


def lire_table_elision() -> list[dict]:
    texte = lire(F_SCHEMA)
    s = section(texte, r"### 2\.8 Initiales et élision \(§7\.6\)", "###")
    exiger(s.count("\n|---") == 1, "partie 2.8 : un seul tableau attendu")
    rangs = lignes_tableau(s, "| `nom` | Initiale | Forme |")
    lignes = []
    for nom, initiale, forme in rangs:
        exiger(nom and initiale and forme, "cellule vide dans la partie 2.8")
        exiger(all(unicodedata.normalize("NFC", x) == x for x in (nom, initiale, forme)), "2.8 non NFC")
        exiger(nom[0] == "`" and nom[-1] == "`" and forme[0] == "`" and forme[-1] == "`",
               f"2.8 : accents graves attendus : {nom} {forme}")
        lignes.append({"nom": nom[1:-1], "initiale": initiale, "forme": forme[1:-1]})
    return lignes


# ---------------------------------------------------------------------------
# Calculs (regles-de-calcul.md §2 ; profils.md)
# ---------------------------------------------------------------------------

def niveau_cote(niveau: int) -> int:
    return 1 if niveau >= 4 else (-1 if niveau <= 2 else 0)


def position_type(prof: dict, sens: int) -> tuple[int, Fraction]:
    """§2.1. Renvoie (niveau, d)."""
    p = Fraction(prof["position"], 100)
    a = p if sens == 1 else 1 - p
    d = (a - Fraction(1, 2)) * M_FERMETE[prof["fermete"]]
    if abs(d) < Fraction(1, 10):
        return 3, d
    if abs(d) < Fraction(3, 10):
        return (4 if d > 0 else 2), d
    return (5 if d > 0 else 1), d


def choisir_raison(graine: str, prenom: str, texte: str, prof: dict, sens: int, niveau: int,
                   considerations: list[dict]) -> int | str:
    """§2.2. `considerations` : dans l'ordre d'affichage, avec `rang`."""
    cote = niveau_cote(niveau)
    if cote == 1:
        E = [c for c in considerations if c["cote"] == "pour"]
        vise = sens
    elif cote == -1:
        E = [c for c in considerations if c["cote"] == "contre"]
        vise = 1 - sens
    else:
        E = list(considerations)
        vise = 1 if Fraction(prof["position"], 100) > Fraction(1, 2) else 0
    du_pole = [c for c in E if c["pole"] == vise]
    hors = [c for c in E if c["pole"] == "aucun"]
    faible = prof["fermete"] == "faible"
    if cote != 0:
        niveaux = [hors, du_pole] if faible else [du_pole, hors]
        deja = {c["rang"] for n in niveaux for c in n}
        niveaux.append([c for c in E if c["rang"] not in deja])
    else:
        niveaux = [hors] if faible else [du_pole, hors]
    for candidates in niveaux:
        if candidates:
            meilleure = min(candidates, key=lambda c: tirage(graine, f"raison|{prenom}|{texte}|{c['rang']}"))
            return meilleure["rang"]
    return "aucune"


def ordre_considerations(graine: str, cle: str, raisons: list[dict]) -> list[dict]:
    """Convention de l'agent qui scelle : mélange au sens du §0, t("ordre-raisons|texte|i")."""
    ordre = sorted(raisons, key=lambda r: tirage(graine, f"ordre-raisons|{cle}|{r['numero_fiche']}"))
    res = []
    for rang, r in enumerate(ordre, 1):
        res.append({"rang": rang, "texte": r["texte"], "cote": r["cote"], "pole": r["pole"],
                    "depute": dict(r["depute"]), "_numero_fiche": r["numero_fiche"]})
    return res


def tirer_atypiques(graine: str, n_atyp: int, absences: dict) -> dict:
    """profils.md, « Procédure ». Contraintes (a) absence, (b) consécutifs, (c) au plus deux par texte."""
    exiger(n_atyp in (2, 3, 4), f"nombre de réponses atypiques non prévu : {n_atyp}")
    par_texte: dict[int, int] = {}
    res = {}
    for prenom in PERSONNAGES:
        classes = sorted(range(1, 14), key=lambda n: tirage(graine, f"ecart|{prenom}|{n}"))
        retenus: list[int] = []

        def valable(n: int) -> bool:
            return (str(n) not in absences[prenom]
                    and all(abs(n - r) != 1 for r in retenus)
                    and n not in retenus
                    and par_texte.get(n, 0) < 2)

        etapes = [range(1, 7), range(7, 14), range(1, 14), range(1, 14)][:n_atyp]
        for plage in etapes:
            choix = next((n for n in classes if n in plage and valable(n)), None)
            exiger(choix is not None, f"tirage des réponses atypiques impossible pour {prenom}")
            retenus.append(choix)
            par_texte[choix] = par_texte.get(choix, 0) + 1
        res[prenom] = sorted(retenus)
    return res


# ---------------------------------------------------------------------------
# Assemblage
# ---------------------------------------------------------------------------

def assembler(graine: str, n_atyp: int, seuils_stricts: bool, journal: list[str]) -> tuple[dict, dict]:
    cercle, fiches_vis = lire_simulation()
    prof_src = lire_profils()
    ordre_tensions = lire_ordre_tensions()
    votes = lire_votes()
    fiches = lire_fiches()
    table_elision = {l["nom"]: l for l in lire_table_elision()}

    # Contrôles croisés des sources entre elles (rien n'est corrigé : un écart arrête tout).
    for n, tension in zip(QUOTIDIENS, ordre_tensions):
        exiger(fiches[n]["tension"] == tension, f"texte {n} : tension {fiches[n]['tension']} ≠ ordre retenu {tension}")
    exiger([fiches[e]["tension"] for e in ("E1", "E2", "E3")] == ["S", "P", "L"], "tensions de l'entrée")
    for cle in TEXTES:
        f, v = fiches[cle], votes[cle]
        exiger(f["_scrutin"] == v["_scrutin"] and f["_legislature"] == v["_legislature"],
               f"{cle} : scrutin de la fiche ≠ votes.md")
        exiger(f["_issue_fiche"] == v["issue"], f"{cle} : issue de la fiche ≠ votes.md")
        exiger(f["_date_fiche"] == v["date"], f"{cle} : date de la fiche {f['_date_fiche']} ≠ votes.md {v['date']}")
        exiger(f["lien_scrutin"] == f"https://www.assemblee-nationale.fr/dyn/{v['_legislature']}/scrutins/{v['_scrutin']}",
               f"{cle} : lien du scrutin ≠ scrutin de la fiche")
    profils = prof_src["profils"]
    for prenom in PERSONNAGES:
        for tension in TENSIONS:
            niveau, d = position_type(profils[prenom][tension], 1)
            exiger(d == prof_src["d_table"][prenom][tension],
                   f"profils.md : d de {prenom} sur {tension} = {d} ≠ table {prof_src['d_table'][prenom][tension]}")
            cell = prof_src["reponse_type_table"][prenom][tension]
            if cell == "neutre":
                attendu = 3
            else:
                m = re.fullmatch(r"(simple|très), vers (\S+)", cell)
                exiger(m is not None, f"réponse type illisible : {cell}")
                pole = POLES[tension].index(m.group(2))
                attendu = {("simple", 1): 4, ("simple", 0): 2, ("très", 1): 5, ("très", 0): 1}[(m.group(1), pole)]
            exiger(niveau == attendu, f"profils.md : réponse type de {prenom} sur {tension} : calcul {niveau}, table {cell}")
    journal.append("Sources croisées : tensions = ordre retenu ; fiches = votes.md (scrutin, issue, date, lien) ; "
                   "profils = table de réponse type et table des d de profils.md.")

    absences = prof_src["absences"]
    atypiques_textes = tirer_atypiques(graine, n_atyp, absences)

    textes = {}
    for cle in TEXTES:
        f = fiches[cle]
        considerations = ordre_considerations(graine, cle, f["raisons"])
        for c in considerations:
            nom = c["depute"]["nom"]
            if nom[0] in INITIALES_CHOIX:
                exiger(nom in table_elision, f"{cle} : {nom} absent du tableau de la partie 2.8")
                c["depute"]["elision"] = table_elision[nom]["forme"] == "d'"
            else:
                c["depute"]["elision"] = False
        textes[cle] = {
            "titre": f["titre"], "lignes": f["lignes"],
            "vote": {"date": votes[cle]["date"], "etape": votes[cle]["etape"], "issue": votes[cle]["issue"]},
            "auteur": f["auteur"], "lien_scrutin": f["lien_scrutin"], "sources": f["sources"],
            "tension": f["tension"], "sens": f["sens"],
            "considerations": considerations,
        }

    reponses: dict[str, dict] = {cle: {} for cle in TEXTES}
    reponses_atypiques = {p: [] for p in PERSONNAGES}
    detail_reponses = {}
    for cle in TEXTES:
        tx = textes[cle]
        for prenom in PERSONNAGES:
            if cle in absences[prenom]:
                continue
            prof = profils[prenom][tx["tension"]]
            niveau, d = position_type(prof, tx["sens"])
            type_niveau = niveau
            cote_tire = None
            atypique = cle in QUOTIDIENS and int(cle) in atypiques_textes[prenom]
            if atypique:
                if niveau in (4, 5):
                    niveau = 2
                elif niveau in (1, 2):
                    niveau = 4
                else:
                    niveau = 4 if t_inferieur_demi(graine, f"cote-ecart|{prenom}|{cle}") else 2
                    cote_tire = niveau_cote(niveau)
                reponses_atypiques[prenom].append({"texte": cle, "cote_tire": cote_tire})
            raison = choisir_raison(graine, prenom, cle, prof, tx["sens"], niveau, tx["considerations"])
            reponses[cle][prenom] = {"niveau": niveau, "raison": raison}
            detail_reponses[(cle, prenom)] = {"type": type_niveau, "d": d, "atypique": atypique}

    fichier = {
        "format": "elenchos-essai-scelle",
        "version": 4,
        "graine": graine,
        "vecteurs_test": [],
        "cercle": cercle,
        "personnages": {},
        "textes": {},
        "reponses": reponses,
        "absences": {p: list(absences[p]) for p in PERSONNAGES},
        "reponses_atypiques": reponses_atypiques,
        "reglage": {"seuils_stricts": seuils_stricts},
    }
    for cle in CLES_VECTEURS:
        h = hex8(graine, cle)
        fichier["vecteurs_test"].append({"cle": cle, "chaine": graine + "|" + cle, "hex8": h, "n": int(h, 16)})
    for prenom in PERSONNAGES:
        fv = fiches_vis[prenom]
        fichier["personnages"][prenom] = {
            "age": fv["age"], "metier": fv["metier"], "ville": fv["ville"], "ligne_de_vie": fv["ligne_de_vie"],
            "heure_de_jeu": fv["heure_de_jeu"],
            "profil": {t: dict(profils[prenom][t]) for t in TENSIONS},
        }
    for cle in TEXTES:
        tx = textes[cle]
        fichier["textes"][cle] = {
            "titre": tx["titre"], "lignes": list(tx["lignes"]), "vote": dict(tx["vote"]),
            "auteur": dict(tx["auteur"]), "lien_scrutin": tx["lien_scrutin"], "sources": list(tx["sources"]),
            "tension": tx["tension"], "sens": tx["sens"],
            "considerations": [{k: (dict(v) if isinstance(v, dict) else v) for k, v in c.items() if not k.startswith("_")}
                               for c in tx["considerations"]],
        }
    annexes = {"fiches": fiches, "textes_internes": textes, "atypiques_textes": atypiques_textes,
               "detail_reponses": detail_reponses, "profils": profils, "fiches_vis": fiches_vis,
               "cercle": cercle, "n_atyp_profils": prof_src["n_atypiques"], "absences": absences,
               "f1_table": prof_src["f1_table"]}
    return fichier, annexes


# ---------------------------------------------------------------------------
# Vérifications de schema.md partie 4.1, étapes 3 à 7 (sur les octets écrits)
# ---------------------------------------------------------------------------

def est_entier(x) -> bool:
    return isinstance(x, int) and not isinstance(x, bool)


def verifier_fichier(octets: bytes, jour: datetime.date, fiches_vis: dict, journal: list[str]) -> dict:
    # Étape 3 : forme.
    try:
        texte = octets.decode("utf-8", errors="strict")
    except UnicodeDecodeError as e:
        raise Defaut(f"étape 3 : UTF-8 invalide : {e}")
    exiger(not texte.startswith("﻿"), "étape 3 : marque d'ordre d'octets")

    def sans_doublon(paires):
        cles = [k for k, _ in paires]
        exiger(len(cles) == len(set(cles)), f"étape 3 : clé en double : {cles}")
        return dict(paires)

    def refuse(x):
        raise Defaut(f"étape 3 : nombre non entier ou constante interdite : {x}")

    obj = json.loads(texte, object_pairs_hook=sans_doublon, parse_float=refuse, parse_constant=refuse)
    exiger(canonique(obj) == octets, "étape 3 : la remise en forme canonique ne redonne pas les mêmes octets")
    journal.append("Étape 3 (forme) : UTF-8 strict, sans doublon de clé, sans nombre à virgule ; "
                   "remis en forme canonique, mêmes octets.")

    # Étape 4 : schéma fermé, types, valeurs.
    chaines_toutes: list[str] = []

    def chaine(x, ou):
        exiger(isinstance(x, str), f"étape 4 : {ou} n'est pas une chaîne")
        exiger(unicodedata.normalize("NFC", x) == x, f"étape 4 : {ou} n'est pas en NFC")
        exiger(not any(ord(ch) < 0x20 or ord(ch) == 0x7F for ch in x), f"étape 4 : caractère de contrôle dans {ou}")
        chaines_toutes.append(x)
        return x

    def objet(x, cles, ou):
        exiger(isinstance(x, dict), f"étape 4 : {ou} n'est pas un objet")
        exiger(set(x) == set(cles), f"étape 4 : {ou} : clés {sorted(x)} ≠ {sorted(cles)}")

    def adresse(x, ou):
        chaine(x, ou)
        exiger(re.fullmatch(r"https://www\.assemblee-nationale\.fr(?:/(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*)+", x)
               is not None, f"étape 4 : adresse invalide {ou} : {x}")

    def entier(x, lo, hi, ou):
        exiger(est_entier(x) and lo <= x <= hi, f"étape 4 : {ou} : entier attendu entre {lo} et {hi} : {x!r}")

    def date_valide(x, ou):
        chaine(x, ou)
        exiger(re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", x) is not None, f"étape 4 : {ou} : écriture de date")
        try:
            d = datetime.date.fromisoformat(x)
        except ValueError:
            raise Defaut(f"étape 4 : {ou} : jour inexistant {x}")
        exiger(d <= jour, f"étape 4 : {ou} : {x} après le jour du scellement {jour}")

    def elu(x, ou, avec_elision):
        cles = ["nom", "feminin", "groupe"] + (["elision"] if avec_elision else [])
        objet(x, cles, ou)
        chaine(x["nom"], ou + ".nom")
        chaine(x["groupe"], ou + ".groupe")
        exiger(isinstance(x["feminin"], bool), f"étape 4 : {ou}.feminin booléen")
        if avec_elision:
            exiger(isinstance(x["elision"], bool), f"étape 4 : {ou}.elision booléen")

    objet(obj, ["format", "version", "graine", "vecteurs_test", "cercle", "personnages", "textes", "reponses",
                "absences", "reponses_atypiques", "reglage"], "racine")
    exiger(obj["format"] == "elenchos-essai-scelle", "étape 4 : format")
    exiger(est_entier(obj["version"]) and obj["version"] == 4, "étape 4 : version")
    exiger(isinstance(obj["graine"], str) and re.fullmatch(r"[0-9a-f]{16}", obj["graine"]) is not None, "étape 4 : graine hex16")
    exiger(isinstance(obj["vecteurs_test"], list) and len(obj["vecteurs_test"]) == 3, "étape 4 : vecteurs_test")
    for i, v in enumerate(obj["vecteurs_test"]):
        objet(v, ["cle", "chaine", "hex8", "n"], f"vecteurs_test[{i}]")
        chaine(v["cle"], "cle")
        chaine(v["chaine"], "chaine")
        exiger(isinstance(v["hex8"], str) and re.fullmatch(r"[0-9a-f]{8}", v["hex8"]) is not None, "étape 4 : hex8")
        entier(v["n"], 0, 2 ** 32 - 1, "n")
    objet(obj["cercle"], ["nom", "inviteuse"], "cercle")
    chaine(obj["cercle"]["nom"], "cercle.nom")
    chaine(obj["cercle"]["inviteuse"], "cercle.inviteuse")
    exiger(obj["cercle"]["inviteuse"] in PERSONNAGES, "étape 4 : inviteuse")
    objet(obj["personnages"], PERSONNAGES, "personnages")
    for p, f in obj["personnages"].items():
        objet(f, ["age", "metier", "ville", "ligne_de_vie", "heure_de_jeu", "profil"], f"personnages.{p}")
        entier(f["age"], 0, 150, f"{p}.age")
        for k in ("metier", "ville", "ligne_de_vie"):
            chaine(f[k], f"{p}.{k}")
        chaine(f["heure_de_jeu"], f"{p}.heure_de_jeu")
        m = re.fullmatch(r"([0-9]{2}):([0-9]{2})", f["heure_de_jeu"])
        exiger(m is not None and int(m.group(1)) <= 23 and int(m.group(2)) <= 59, f"étape 4 : heure {p}")
        objet(f["profil"], TENSIONS, f"{p}.profil")
        for t, pr in f["profil"].items():
            objet(pr, ["position", "fermete"], f"{p}.profil.{t}")
            entier(pr["position"], 0, 100, f"{p}.{t}.position")
            exiger(pr["fermete"] in ("faible", "moyenne", "forte"), f"étape 4 : fermeté {p} {t}")
            chaine(pr["fermete"], "fermete")
    objet(obj["textes"], TEXTES, "textes")
    for cle, tx in obj["textes"].items():
        ou = f"textes.{cle}"
        objet(tx, ["titre", "lignes", "vote", "auteur", "lien_scrutin", "sources", "tension", "sens",
                   "considerations"], ou)
        chaine(tx["titre"], ou + ".titre")
        exiger(isinstance(tx["lignes"], list) and len(tx["lignes"]) == 3, f"étape 4 : {ou}.lignes")
        for i, l in enumerate(tx["lignes"]):
            chaine(l, f"{ou}.lignes[{i}]")
        objet(tx["vote"], ["date", "etape", "issue"], ou + ".vote")
        date_valide(tx["vote"]["date"], ou + ".vote.date")
        exiger(tx["vote"]["etape"] in ("navette", "definitif", "aucune"), f"étape 4 : {ou}.vote.etape")
        exiger(tx["vote"]["issue"] in ("adopte", "rejete", "sans_vote_ensemble"), f"étape 4 : {ou}.vote.issue")
        a = tx["auteur"]
        exiger(isinstance(a, dict) and "type" in a, f"étape 4 : {ou}.auteur")
        if a["type"] == "gouvernement":
            objet(a, ["type"], ou + ".auteur")
        else:
            exiger(a["type"] in ("depute", "senateur"), f"étape 4 : {ou}.auteur.type")
            objet(a, ["type", "nom", "feminin", "groupe"], ou + ".auteur")
            elu({k: v for k, v in a.items() if k != "type"}, ou + ".auteur", False)
        adresse(tx["lien_scrutin"], ou + ".lien_scrutin")
        exiger(isinstance(tx["sources"], list) and tx["sources"], f"étape 4 : {ou}.sources")
        for i, s in enumerate(tx["sources"]):
            adresse(s, f"{ou}.sources[{i}]")
        exiger(tx["tension"] in TENSIONS, f"étape 4 : {ou}.tension")
        exiger(est_entier(tx["sens"]) and tx["sens"] in (0, 1), f"étape 4 : {ou}.sens")
        exiger(isinstance(tx["considerations"], list) and len(tx["considerations"]) == 4, f"étape 4 : {ou}.considerations")
        for i, c in enumerate(tx["considerations"]):
            oc = f"{ou}.considerations[{i}]"
            objet(c, ["rang", "texte", "cote", "pole", "depute"], oc)
            entier(c["rang"], 1, 4, oc + ".rang")
            chaine(c["texte"], oc + ".texte")
            exiger(c["cote"] in ("pour", "contre"), f"étape 4 : {oc}.cote")
            exiger((est_entier(c["pole"]) and c["pole"] in (0, 1)) or c["pole"] == "aucun", f"étape 4 : {oc}.pole")
            elu(c["depute"], oc + ".depute", True)
    objet(obj["reponses"], TEXTES, "reponses")
    for cle, rs in obj["reponses"].items():
        exiger(isinstance(rs, dict) and set(rs) <= set(PERSONNAGES), f"étape 4 : reponses.{cle}")
        for p, r in rs.items():
            objet(r, ["niveau", "raison"], f"reponses.{cle}.{p}")
            entier(r["niveau"], 1, 5, f"reponses.{cle}.{p}.niveau")
            exiger((est_entier(r["raison"]) and 1 <= r["raison"] <= 4) or r["raison"] == "aucune",
                   f"étape 4 : reponses.{cle}.{p}.raison")
    objet(obj["absences"], PERSONNAGES, "absences")
    for p, l in obj["absences"].items():
        exiger(isinstance(l, list) and all(isinstance(x, str) and x in TEXTES for x in l), f"étape 4 : absences.{p}")
        exiger(l == sorted(set(l), key=TEXTES.index), f"étape 4 : absences.{p} : ordre ou doublon")
    objet(obj["reponses_atypiques"], PERSONNAGES, "reponses_atypiques")
    for p, l in obj["reponses_atypiques"].items():
        exiger(isinstance(l, list), f"étape 4 : reponses_atypiques.{p}")
        for e in l:
            objet(e, ["texte", "cote_tire"], f"reponses_atypiques.{p}[]")
            exiger(isinstance(e["texte"], str) and e["texte"] in TEXTES, "étape 4 : texte d'une réponse atypique")
            exiger(e["cote_tire"] is None or (est_entier(e["cote_tire"]) and e["cote_tire"] in (1, -1)),
                   "étape 4 : cote_tire")
        exiger([e["texte"] for e in l] == sorted({e["texte"] for e in l}, key=TEXTES.index),
               f"étape 4 : reponses_atypiques.{p} : ordre ou doublon")
    objet(obj["reglage"], ["seuils_stricts"], "reglage")
    exiger(isinstance(obj["reglage"]["seuils_stricts"], bool), "étape 4 : seuils_stricts")
    journal.append(f"Étape 4 (schéma) : fermé, types et valeurs permis ; {len(chaines_toutes)} chaînes en NFC, "
                   f"sans caractère de contrôle ; adresses conformes à l'expression de l'étape 4 (https, hôte de l'Assemblée, "
                   f"sans requête ni fragment) ; dates de vote existantes et au plus tard le {jour}.")

    # Étape 5 : cohérence interne.
    for cle, tx in obj["textes"].items():
        cs = tx["considerations"]
        exiger([c["rang"] for c in cs] == [1, 2, 3, 4], f"étape 5 : {cle} : rangs")
        exiger(len({c["depute"]["groupe"] for c in cs}) == 4, f"étape 5 : {cle} : groupes non distincts")
        for c in cs:
            exiger(c["texte"][-1] in ".?!", f"étape 5 : {cle} : ponctuation finale de « {c['texte']} »")
            guillemets = "\u00ab\u00bb\u0022\u201c\u201d\u2039\u203a"
            exiger(c["texte"][0] not in guillemets and (len(c["texte"]) < 2 or c["texte"][-2] not in guillemets),
                   f"étape 5 : {cle} : guillemets aux bords de « {c['texte']} »")
        v = tx["vote"]
        permis = {"adopte": {"navette", "definitif"}, "rejete": {"navette", "aucune"}, "sans_vote_ensemble": {"aucune"}}
        exiger(v["etape"] in permis[v["issue"]], f"étape 5 : {cle} : combinaison issue/étape {v}")
    for p in PERSONNAGES:
        exiger(all(x in QUOTIDIENS for x in obj["absences"][p]), f"étape 5 : absence hors textes quotidiens ({p})")
        for cle in TEXTES:
            exiger((p in obj["reponses"][cle]) == (cle not in obj["absences"][p]), f"étape 5 : réponse/absence {p} {cle}")
        for e in obj["reponses_atypiques"][p]:
            exiger(e["texte"] in QUOTIDIENS and p in obj["reponses"][e["texte"]],
                   f"étape 5 : réponse atypique {p} {e['texte']} sans réponse ou hors textes quotidiens")
        f = obj["personnages"][p]
        fv = fiches_vis[p]
        for k in ("age", "metier", "ville", "ligne_de_vie"):
            exiger(f[k] == fv[k], f"étape 5 : fiche de {p} : {k} ≠ §1")
        mh = re.fullmatch(r"([0-9]{1,2})h([0-9]{2})", fv["_heure_affichee"])
        exiger(mh is not None and f["heure_de_jeu"] == f"{int(mh.group(1)):02d}:{mh.group(2)}",
               f"étape 5 : heure de jeu de {p} ≠ §1 ({fv['_heure_affichee']})")
    cercle_ref, _ = lire_simulation()
    exiger(obj["cercle"] == cercle_ref == {"nom": "Amis", "inviteuse": "Agathe"}, "étape 5 : cercle")
    for v in obj["vecteurs_test"]:
        exiger(v["chaine"] == obj["graine"] + "|" + v["cle"], "étape 5 : chaîne d'un vecteur")
        exiger(v["n"] == int(v["hex8"], 16), "étape 5 : n ≠ valeur de hex8")

    # Groupes (partie 2.7).
    table = lire_table_groupes()
    vus_ligne = set()
    vus_id = set()
    for l in table:
        g = l["groupe"]
        exiger(re.fullmatch(rf"[{LETTRE}0-9]+(?:-[{LETTRE}0-9]+|(?<=[{LETTRE}]) [{LETTRE}][{LETTRE}0-9]*)*", g)
               is not None and len(g) <= 20, f"étape 5 : 2.7 : sigle mal écrit : {g}")
        exiger(l["chambre"] in ("Assemblée", "Sénat"), f"étape 5 : 2.7 : chambre {l['chambre']}")
        if l["chambre"] == "Assemblée":
            exiger(l["legislature"] in ("15", "16", "17"), f"étape 5 : 2.7 : législature {l['legislature']}")
        else:
            exiger(l["legislature"] == "—", "étape 5 : 2.7 : législature d'un groupe du Sénat")
        exiger(re.fullmatch(r"PO[0-9]+(?:, PO[0-9]+)*", l["_identifiant_brut"]) is not None, "étape 5 : 2.7 : identifiant")
        exiger(g not in CODES_INTERDITS, f"étape 5 : 2.7 : code interne {g}")
        triple = (g, l["chambre"], l["legislature"])
        exiger(triple not in vus_ligne, f"étape 5 : 2.7 : ligne en double {triple}")
        vus_ligne.add(triple)
        for i in l["identifiants"]:
            exiger(i not in vus_id, f"étape 5 : 2.7 : identifiant en double {i}")
            vus_id.add(i)
    couples = {(l["chambre"], l["groupe"]) for l in table}
    employes = set()
    for cle, tx in obj["textes"].items():
        a = tx["auteur"]
        if a["type"] == "depute":
            employes.add(("Assemblée", a["groupe"]))
        elif a["type"] == "senateur":
            employes.add(("Sénat", a["groupe"]))
        for c in tx["considerations"]:
            employes.add(("Assemblée", c["depute"]["groupe"]))
    exiger(employes <= couples, f"étape 5 : groupes absents de la partie 2.7 : {sorted(employes - couples)}")
    exiger(couples <= employes, f"étape 5 : lignes de la partie 2.7 sans emploi : {sorted(couples - employes)}")

    # Initiales et élision (partie 2.8).
    tab = lire_table_elision()
    noms_tab = [l["nom"] for l in tab]
    exiger(len(noms_tab) == len(set(noms_tab)), "étape 5 : 2.8 : nom en double")
    accord = {"voyelle": "d'", "h muet": "d'", "h aspiré": "de", "son y": "de"}
    for l in tab:
        exiger(l["initiale"] in accord and l["forme"] in ("d'", "de"), f"étape 5 : 2.8 : ligne {l}")
        exiger(accord[l["initiale"]] == l["forme"], f"étape 5 : 2.8 : Forme et Initiale ne s'accordent pas : {l}")
    formes = {l["nom"]: l["forme"] for l in tab}
    noms_choix = set()
    for cle, tx in obj["textes"].items():
        if tx["auteur"]["type"] != "gouvernement":
            exiger(tx["auteur"]["nom"][0] in INITIALES_PERMISES, f"étape 5 : initiale de {tx['auteur']['nom']}")
        for c in tx["considerations"]:
            nom = c["depute"]["nom"]
            exiger(nom[0] in INITIALES_PERMISES, f"étape 5 : initiale de {nom}")
            if nom[0] in INITIALES_CHOIX:
                noms_choix.add(nom)
                exiger(nom in formes and c["depute"]["elision"] == (formes[nom] == "d'"), f"étape 5 : élision de {nom}")
            else:
                exiger(c["depute"]["elision"] is False, f"étape 5 : élision de {nom}")
    exiger(noms_choix == set(noms_tab), f"étape 5 : 2.8 : ensembles différents : fichier seul {sorted(noms_choix - set(noms_tab))}, "
                                         f"tableau seul {sorted(set(noms_tab) - noms_choix)}")
    journal.append(f"Étape 5 (cohérence) : 17 textes, 4 personnages ; rangs, groupes distincts, ponctuation, "
                   f"issue/étape ; réponses ⇔ absences ; atypiques sur des réponses quotidiennes ; fiches = §1 ; "
                   f"cercle Amis/Agathe ; vecteurs ; partie 2.7 ({len(table)} lignes, règles tenues, "
                   f"{len(employes)} couples (chambre, sigle) employés = tableau) ; partie 2.8 ({len(tab)} noms = "
                   f"noms à initiale demandant un choix ; formes et élisions accordées).")

    # Étape 6 : vecteurs de test recalculés.
    for v, cle in zip(obj["vecteurs_test"], CLES_VECTEURS):
        h = hashlib.sha256(v["chaine"].encode("utf-8")).hexdigest()[:8]
        exiger(v["cle"] == cle and v["hex8"] == h and v["n"] == int(h, 16), f"étape 6 : vecteur {cle}")
    journal.append("Étape 6 (vecteurs) : les trois vecteurs recalculés à partir de la graine sont identiques.")

    # Étape 7 : typographie simple.
    affichees = [obj["cercle"]["nom"], obj["cercle"]["inviteuse"]]
    for f in obj["personnages"].values():
        affichees += [f["metier"], f["ville"], f["ligne_de_vie"]]
    for tx in obj["textes"].values():
        affichees.append(tx["titre"])
        affichees += tx["lignes"]
        if tx["auteur"]["type"] != "gouvernement":
            affichees += [tx["auteur"]["nom"], tx["auteur"]["groupe"]]
        for c in tx["considerations"]:
            affichees += [c["depute"]["nom"], c["depute"]["groupe"], c["texte"]]
    for s in affichees:
        for interdit in ("’", " ", " "):
            exiger(interdit not in s, f"étape 7 : U+{ord(interdit):04X} dans « {s} »")
        for i, ch in enumerate(s):
            if ch in "?!;:»%":
                exiger(i > 0 and s[i - 1] == " ", f"étape 7 : « {ch} » sans espace avant dans « {s} »")
            if ch == "«":
                exiger(i + 1 < len(s) and s[i + 1] == " ", f"étape 7 : « « » sans espace après dans « {s} »")
        for m in re.finditer(r"(?<![0-9])[0-9]+(?: [0-9]+)+(?![0-9])", s):
            exiger(re.fullmatch(r"[0-9]{1,3}(?: [0-9]{3})+", m.group(0)) is not None,
                   f"étape 7 : espace entre deux chiffres hors d'un nombre par tranches : « {m.group(0)} » dans « {s} »")
    journal.append(f"Étape 7 (typographie simple) : {len(affichees)} chaînes affichées contrôlées.")
    return obj


def verifier_fidelite_fiches(obj: dict, graine: str, journal: list[str]) -> None:
    """Schéma, partie 4.1, étape 8, lue à la lettre : un second lecteur des fiches et de votes.md,
    écrit à part de `analyser_fiche` (qui sert à construire le fichier), puis comparaison champ par champ."""
    lues: dict[str, dict] = {}
    for chemin in F_FICHES:
        lignes = lire(chemin).split("\n")
        i = 0
        cle = None
        while i < len(lignes):
            l = lignes[i]
            if l.startswith("### "):
                m = re.fullmatch(r"### (E[1-3]|[1-9]|1[0-4]) · scrutin ([0-9]+) \((15|16|17)e législature\)", l)
                cle = None
                if m:
                    cle = m.group(1)
                    exiger(cle not in lues, f"étape 8 : fiche {cle} en double")
                    lues[cle] = {"_l": m.group(3), "_n": m.group(2)}
                i += 1
                continue
            if cle is None:
                i += 1
                continue
            f = lues[cle]

            def une_fois(champ, valeur):
                exiger(champ not in f, f"étape 8 : {cle} : « {champ} » répété")
                f[champ] = valeur

            if l.startswith("- Titre : "):
                une_fois("titre", l[len("- Titre : "):])
            elif l == "- Lignes :":
                trois = lignes[i + 1:i + 4]
                vals = []
                for j, x in enumerate(trois, 1):
                    exiger(x.startswith(f"  {j}. "), f"étape 8 : {cle} : ligne {j} absente")
                    vals.append(x[len(f"  {j}. "):])
                exiger(i + 4 >= len(lignes) or re.match(r"  [0-9]+\. ", lignes[i + 4]) is None,
                       f"étape 8 : {cle} : plus de trois lignes")
                une_fois("lignes", vals)
                i += 3
            elif l.startswith("- Auteur : "):
                m = re.fullmatch(r"- Auteur : Gouvernement(?: \(projet de loi\)\.| ;).*", l)
                if m:
                    une_fois("auteur", {"type": "gouvernement"})
                else:
                    m = re.fullmatch(r"- Auteur : ([^,]+), (député|députée|sénateur|sénatrice), (.+?)(?: au dépôt \(| ; |\. ).*", l)
                    exiger(m is not None, f"étape 8 : {cle} : ligne « Auteur » hors forme")
                    une_fois("auteur", {"type": "senateur" if m.group(2).startswith("sénat") else "depute",
                                        "nom": m.group(1), "feminin": m.group(2) in ("députée", "sénatrice"),
                                        "groupe": m.group(3)})
            elif l.startswith("- Lien du scrutin : "):
                une_fois("lien_scrutin", l[len("- Lien du scrutin : "):])
            elif l == "- Sources :":
                vals = []
                while i + 1 < len(lignes) and lignes[i + 1].startswith("  - "):
                    i += 1
                    vals.append(lignes[i][len("  - "):])
                une_fois("sources", vals)
            elif l.startswith("- Tension : "):
                m = re.fullmatch(r"- Tension : ([SPTL]) ; sens s = ([01])", l)
                exiger(m is not None, f"étape 8 : {cle} : ligne « Tension » hors forme")
                une_fois("tension", m.group(1))
                une_fois("sens", int(m.group(2)))
            elif l == "- Raisons :":
                vals = []
                for j, x in enumerate(lignes[i + 1:i + 5], 1):
                    m = re.fullmatch(rf"  {j}\. « (.+?) » — (pour|contre) · pôle (0|1|aucun) — ([^,\[\]]+), "
                                     r"(député|députée), (.+?) \[vote : .*", x)
                    exiger(m is not None, f"étape 8 : {cle} : raison {j} hors forme")
                    vals.append({"texte": m.group(1), "cote": m.group(2),
                                 "pole": "aucun" if m.group(3) == "aucun" else int(m.group(3)),
                                 "nom": m.group(4), "feminin": m.group(5) == "députée", "groupe": m.group(6)})
                exiger(i + 5 >= len(lignes) or re.match(r"  [0-9]+\. ", lignes[i + 5]) is None,
                       f"étape 8 : {cle} : plus de quatre raisons")
                une_fois("raisons", vals)
                i += 4
            i += 1
    exiger(set(lues) == set(TEXTES), f"étape 8 : fiches lues {sorted(lues)}")
    for cle, f in lues.items():
        for champ in ("titre", "lignes", "auteur", "lien_scrutin", "sources", "tension", "sens", "raisons"):
            exiger(champ in f, f"étape 8 : {cle} : « {champ} » absent")
    rangs = lignes_tableau(lire(F_VOTES), "| Rang | Scrutin | `issue` | `date` | `etape` | Preuve principale |")
    votes = {}
    for r in rangs:
        if r[0] in TEXTES:
            exiger(r[0] not in votes, f"étape 8 : votes.md : {r[0]} en double")
            votes[r[0]] = r
    exiger(set(votes) == set(TEXTES), "étape 8 : votes.md : textes manquants")
    for cle in TEXTES:
        f, tx = lues[cle], obj["textes"][cle]
        for champ in ("titre", "lignes", "tension", "sens", "sources", "lien_scrutin", "auteur"):
            exiger(tx[champ] == f[champ], f"étape 8 : {cle} : {champ} ≠ fiche")
        exiger(tx["lien_scrutin"] == f"https://www.assemblee-nationale.fr/dyn/{f['_l']}/scrutins/{f['_n']}",
               f"étape 8 : {cle} : lien ≠ titre de la fiche")
        r = votes[cle]
        exiger(r[1] == f"{f['_l']}e, {f['_n']}", f"étape 8 : {cle} : scrutin de votes.md ≠ fiche")
        exiger(tx["vote"] == {"issue": r[2], "date": r[3], "etape": r[4]}, f"étape 8 : {cle} : vote ≠ votes.md")
        ordre = sorted(range(1, 5), key=lambda i: tirage(graine, f"ordre-raisons|{cle}|{i}"))
        for rang, i in enumerate(ordre, 1):
            c, rf = tx["considerations"][rang - 1], f["raisons"][i - 1]
            exiger(c["rang"] == rang and c["texte"] == rf["texte"] and c["cote"] == rf["cote"] and c["pole"] == rf["pole"]
                   and c["depute"]["nom"] == rf["nom"] and c["depute"]["feminin"] == rf["feminin"]
                   and c["depute"]["groupe"] == rf["groupe"], f"étape 8 : {cle} : raison {i} de la fiche ≠ rang {rang}")
    journal.append("Étape 8 (fidélité aux fiches) : second lecteur, à la lettre de l'étape 8 ; les 17 textes "
                   "(titre, lignes, auteur, lien, sources, tension, sens, vote, quatre raisons au rang donné par "
                   "« ordre-raisons ») sont ceux des fiches et de votes.md. « Mêmes sources » : SHA-256 plus bas.")


# ---------------------------------------------------------------------------
# Contrôles en plus (profils.md, annexe A de regles-de-calcul.md)
# ---------------------------------------------------------------------------

def controles_en_plus(obj: dict, ann: dict, n_atyp: int, journal: list[str]) -> None:
    atyp = ann["atypiques_textes"]
    for p in PERSONNAGES:
        l = atyp[p]
        exiger(len(l) == n_atyp, f"{p} : {len(l)} réponses atypiques")
        exiger(all(1 <= n <= 13 for n in l), f"{p} : réponse atypique hors des textes 1 à 13")
        exiger(not any(str(n) in ann["absences"][p] for n in l), f"{p} : (a) réponse atypique un jour d'absence")
        exiger(all(abs(a - b) != 1 for a in l for b in l), f"{p} : (b) textes consécutifs")
        exiger(any(n <= 6 for n in l) and any(n >= 7 for n in l), f"{p} : (d)")
    for n in range(1, 14):
        exiger(sum(n in atyp[p] for p in PERSONNAGES) <= 2, f"(c) texte {n} : plus de deux réponses atypiques")
    # Côté opposé, niveau simple.
    for (cle, p), d in ann["detail_reponses"].items():
        r = obj["reponses"][cle][p]
        if d["atypique"]:
            exiger(r["niveau"] in (2, 4), "réponse atypique hors du niveau simple")
            if d["type"] != 3:
                exiger(niveau_cote(r["niveau"]) == -niveau_cote(d["type"]), "réponse atypique du même côté")
        else:
            exiger(r["niveau"] == d["type"], "réponse non atypique différente de la réponse type")
    journal.append(f"Contrôles en plus (profils.md) : {n_atyp} réponses atypiques par personnage, contraintes (a) à (d) "
                   f"tenues ; côté opposé au niveau simple.")
    prof = ann["profils"]
    types = {p: {t: position_type(prof[p][t], 1) for t in TENSIONS} for p in PERSONNAGES}
    cote = {p: {t: niveau_cote(types[p][t][0]) for t in TENSIONS} for p in PERSONNAGES}
    for t in ("S", "P"):
        exiger(cote["Agathe"][t] == cote["Nassim"][t] != 0, f"profils : Agathe et Nassim pas du même côté sur {t}")
    exiger(cote["Agathe"]["T"] == cote["Nassim"]["T"] == 0, "profils : Agathe et Nassim pas neutres sur T")
    exiger(cote["Agathe"]["L"] == -cote["Nassim"]["L"] != 0, "profils : Agathe et Nassim pas opposés sur L")
    exiger(all(prof["Odile"][t]["fermete"] == "forte" and abs(types["Odile"][t][1]) >= Fraction(56, 100) for t in TENSIONS),
           "profils : Odile pas tranchée partout")
    for p in PERSONNAGES:
        exiger(not (types[p]["S"][0] == 1 and types[p]["T"][0] == 1), f"profils : bloc sécurité-tradition ({p})")
        exiger(not (types[p]["S"][0] == 5 and types[p]["T"][0] == 5), f"profils : bloc liberté-changement ({p})")
    partage = {t: sorted(cote[p][t] for p in PERSONNAGES) for t in TENSIONS}
    exiger(all(-1 in v and 1 in v for v in partage.values()), f"profils : une tension ne partage pas le cercle : {partage}")
    for p in PERSONNAGES:
        for t in TENSIONS:
            pos = prof[p][t]["position"]
            attendu = "Au milieu" if abs(pos - 50) < 10 else POLES[t][1 if pos > 50 else 0]
            exiger(ann["f1_table"][p][t] == attendu, f"profils : corrigé de F1 de {p} sur {t} : {ann['f1_table'][p][t]} ≠ {attendu}")
    journal.append("Contrôles en plus (contraintes calculables de profils.md) : Agathe et Nassim du même côté sur S et P, "
                   "neutres sur T, opposés sur L ; Odile forte partout, |d| ≥ 0,56 ; aucun bloc ; chaque tension a un "
                   "personnage de chaque côté (" + ", ".join(f"{t} {partage[t].count(-1)}/{partage[t].count(0)}/{partage[t].count(1)}"
                                                             for t in TENSIONS) + " : pôle 0 / neutre / pôle 1) ; corrigé de F1 "
                   "(« Au milieu » si |p − 0,5| < 0,1) égal au tableau.")
    # Annexe A.
    for cle, tx in obj["textes"].items():
        cs = tx["considerations"]
        s = tx["sens"]
        exiger(any(c["cote"] == "pour" for c in cs) and any(c["cote"] == "contre" for c in cs), f"annexe A : {cle} : côtés")
        exiger(any(c["pole"] == 0 for c in cs) and any(c["pole"] == 1 for c in cs), f"annexe A : {cle} : pôles")
        exiger(sum(c["pole"] == "aucun" for c in cs) <= 1, f"annexe A : {cle} : plus d'une raison hors tension")
        for c in cs:
            if c["pole"] != "aucun":
                attendu = s if c["cote"] == "pour" else 1 - s
                exiger(c["pole"] == attendu, f"{cle} : raison « {c['texte']} » : côté {c['cote']} et pôle {c['pole']} "
                                             f"désalignés (s = {s}) ; la lecture de « du pôle visé » (§2.2) compterait")
    devines = {n: obj["textes"][str(n)] for n in range(1, 14)}
    s_ht = [n for n, tx in devines.items() if tx["tension"] == "S" and any(c["pole"] == "aucun" for c in tx["considerations"])]
    s_tous = [n for n, tx in devines.items() if tx["tension"] == "S"]
    t_ht = [n for n, tx in devines.items() if tx["tension"] == "T" and any(c["pole"] == "aucun" for c in tx["considerations"])]
    t_tous = [n for n, tx in devines.items() if tx["tension"] == "T"]
    exiger(len(s_tous) == 4 and len(s_ht) == 2, f"annexe A : textes S devinés {s_tous}, avec hors tension {s_ht}")
    exiger(len(t_tous) == 3 and len(t_ht) == 2, f"annexe A : textes T {t_tous}, avec hors tension {t_ht}")
    for i in range(1, 14):
        exiger(obj["textes"][str(i)]["tension"] != obj["textes"][str(i + 1)]["tension"], f"annexe A : tension répétée {i}")
    exiger(obj["textes"]["1"]["tension"] != obj["textes"]["E3"]["tension"], "annexe A : texte 1 de la tension de E3")
    for t in TENSIONS:
        sens = {obj["textes"][n]["sens"] for n in QUOTIDIENS if obj["textes"][n]["tension"] == t}
        exiger(sens == {0, 1}, f"annexe A : tension {t} sans texte de chaque sens")
        exiger(any(obj["textes"][str(n)]["tension"] == t for n in range(1, 7))
               and any(obj["textes"][str(n)]["tension"] == t for n in range(7, 14)), f"annexe A : {t} dans 1-6 et 7-13")
    journal.append("Contrôles en plus (annexe A) : côtés et pôles présents, au plus une raison hors tension par texte, "
                   "S devinés 2 avec / 2 sans, T 2 avec / 1 sans, tensions jamais deux jours de suite, sens couverts ; "
                   "chaque raison « pour » sert le pôle s et chaque raison « contre » le pôle 1 − s (lecture de "
                   "« du pôle visé » sans effet).")


# ---------------------------------------------------------------------------
# Chiffres constants du fichier (regles-de-calcul.md §9 bis) : manche du porteur
# ---------------------------------------------------------------------------

def poids(reponse: dict, tx: dict) -> tuple[Fraction, int | None]:
    """§5.1 de la simulation : (w, π)."""
    cote = niveau_cote(reponse["niveau"])
    if cote == 0:
        return Fraction(0), None
    pi = tx["sens"] if cote == 1 else 1 - tx["sens"]
    rho = "aucun" if reponse["raison"] == "aucune" else tx["considerations"][reponse["raison"] - 1]["pole"]
    if rho == pi:
        return Fraction(1), pi
    if rho == "aucun":
        return Fraction(1, 2), pi
    return Fraction(0), None


def mediane(xs: list[Fraction]) -> Fraction:
    xs = sorted(xs)
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def manche_porteur(obj: dict, k: int) -> dict:
    """regles-de-calcul.md §4.1 à §4.4, pour le devineur « porteur » à la séance k (texte k−1)."""
    g = obj["graine"]
    n = str(k - 1)
    tx = obj["textes"][n]
    possibles = [p for p in PERSONNAGES if p in obj["reponses"][n]]
    info = {}
    for X in possibles:
        r = obj["reponses"][n][X]
        v = VALEUR[r["niveau"]]
        x = v if tx["sens"] == 1 else 1 - v
        sw = Fraction(0)
        swpi = Fraction(0)
        for t in ["E1", "E2", "E3"] + [str(m) for m in range(1, k - 1)]:
            if obj["textes"][t]["tension"] != tx["tension"] or X not in obj["reponses"][t]:
                continue
            w, pi = poids(obj["reponses"][t][X], obj["textes"][t])
            sw += w
            if pi is not None:
                swpi += w * pi
        c = (2 + swpi) / (4 + sw)
        l = max(Fraction(95, 100) - Fraction(7, 100) * sw, Fraction(1, 4))
        q = (Fraction(95, 100) - l) / Fraction(70, 100)
        info[X] = {"reponse": r, "x": x, "c": c, "l": l, "q": q, "somme_w": sw, "distance": abs(x - c)}
    med = mediane([info[X]["x"] for X in possibles]) if possibles else None
    for X in possibles:
        d = info[X]
        d["rarete"] = abs(d["x"] - med)
        d["surprise"] = d["q"] * d["distance"] + (1 - d["q"]) * d["rarete"]
    classement = sorted(possibles, key=lambda X: (-info[X]["surprise"], tirage(g, f"surprise|porteur|{k}|{X}")))
    groupes = {}
    for X in possibles:
        groupes.setdefault(info[X]["surprise"], []).append(X)
    departages = sum(1 for v in groupes.values() if len(v) >= 2)
    places = classement[:2]
    if len(classement) >= 3:
        places.append(min(classement[2:], key=lambda X: tirage(g, f"hasard|porteur|{k}|{X}")))

    def ident(a, b):
        return info[a]["reponse"] == info[b]["reponse"]

    remplacements = []
    ambiguite = False
    while True:
        paires = [(i, j) for i in range(len(places)) for j in range(i + 1, len(places)) if ident(places[i], places[j])]
        libres = [X for X in classement if X not in places and not any(ident(X, P) for P in places)]
        if not paires or not libres:
            break
        if len(paires) > 1:
            ambiguite = True
        pires = {max(places[i], places[j], key=classement.index) for i, j in paires}
        ecartee = max(pires, key=classement.index)
        idx = places.index(ecartee)
        places[idx] = libres[0]
        remplacements.append({"place": idx + 1, "ecartee": ecartee, "remplacante": libres[0]})
    identiques_ensemble = any(ident(places[i], places[j]) for i in range(len(places)) for j in range(i + 1, len(places)))
    cachee = None
    if places:
        cachee = places[-1]
        if info[cachee]["reponse"]["raison"] == "aucune":
            autres = [X for X in places if info[X]["reponse"]["raison"] != "aucune"]
            if autres:
                cachee = max(autres, key=classement.index)
    return {"texte": n, "possibles": possibles, "info": info, "mediane": med, "classement": classement,
            "departages": departages, "places": places, "remplacements": remplacements,
            "identiques_ensemble": identiques_ensemble, "cachee": cachee, "ambiguite": ambiguite}


def chiffres_constants(obj: dict) -> tuple[list[str], list[str]]:
    lignes = []
    detail = []
    atyp = {(e["texte"], p) for p in PERSONNAGES for e in obj["reponses_atypiques"][p]}
    # Réponses scellées.
    n_rep = sum(len(obj["reponses"][t]) for t in TEXTES)
    n_quot = sum(len(obj["reponses"][t]) for t in QUOTIDIENS)
    n_dev = sum(len(obj["reponses"][str(n)]) for n in range(1, 14))
    lignes.append(f"Réponses scellées : {n_rep} (entrée {n_rep - n_quot}, textes quotidiens {n_quot}, "
                  f"dont devinables, textes 1 à 13 : {n_dev}).")
    lignes.append(f"Réponses atypiques : {len(atyp)} sur {n_dev} réponses devinables ; par personnage : " + " ; ".join(
        f"{p} {len(obj['reponses_atypiques'][p])} (textes "
        + ", ".join(e['texte'] + ("" if e['cote_tire'] is None else f" [côté tiré {e['cote_tire']:+d}]")
                    for e in obj['reponses_atypiques'][p]) + ")" for p in PERSONNAGES) + ".")
    aucunes = [(t, p) for t in TEXTES for p, r in obj["reponses"][t].items() if r["raison"] == "aucune"]
    def lieu(t):
        return "entrée" if t.startswith("E") else ("texte 14" if t == "14" else "devinés")
    lignes.append(f"Raisons « aucune » parmi les réponses scellées : {len(aucunes)} — "
                  + (", ".join(f"{p} au texte {t}" + (" (atypique)" if (t, p) in atyp else "") for t, p in aucunes) or "aucune")
                  + f" ; entrée {sum(lieu(t) == 'entrée' for t, _ in aucunes)}, textes devinés "
                  f"{sum(lieu(t) == 'devinés' for t, _ in aucunes)}, texte 14 {sum(lieu(t) == 'texte 14' for t, _ in aucunes)}. "
                  "Annexe A attend au plus 3 sur les textes devinés (Valentin 1 et 4, Agathe 6), 1 au texte 14 (Valentin), 0 à l'entrée.")
    mini = min(len(obj["reponses"][str(n)]) for n in range(1, 14))
    lignes.append(f"Écran 5.12 : impossible. Chaque texte deviné (1 à 13) a au moins {mini} réponses de personnages : "
                  "la manche du porteur n'est jamais vide, ni celle d'un personnage présent.")
    neutres = sum(1 for t in TEXTES for r in obj["reponses"][t].values() if r["niveau"] == 3)
    lignes.append(f"Réponses neutres scellées : {neutres}. Issues des votes : "
                  + ", ".join(f"{i} {sum(obj['textes'][t]['vote']['issue'] == i for t in TEXTES)}"
                              for i in ("adopte", "rejete", "sans_vote_ensemble"))
                  + " (« Texte rejeté. » n'apparaît donc jamais).")
    # Manches du porteur, séances 2 à 14.
    cartes = 0
    cartes_atyp = 0
    rempl = 0
    ens = []
    cartes_ens = 0
    aucune_aff = 0
    aucune_cach = 0
    dep = []
    ambig = []
    vues = {(p, t): 0 for p in PERSONNAGES for t in TENSIONS}
    for e in ("E1", "E2", "E3"):
        vues[("Agathe", obj["textes"][e]["tension"])] += 1
    nb_cartes = []
    cachee_deplacee = []
    for k in range(2, 15):
        m = manche_porteur(obj, k)
        n = m["texte"]
        tension = obj["textes"][n]["tension"]
        nb_cartes.append(len(m["places"]))
        for X in m["places"]:
            cartes += 1
            cartes_atyp += (n, X) in atyp
            vues[(X, tension)] += 1
            if m["info"][X]["reponse"]["raison"] == "aucune":
                if X == m["cachee"]:
                    aucune_cach += 1
                else:
                    aucune_aff += 1
        rempl += len(m["remplacements"])
        if m["identiques_ensemble"]:
            ens.append(n)
            cartes_ens += sum(1 for X in m["places"] if any(
                Y != X and m["info"][Y]["reponse"] == m["info"][X]["reponse"] for Y in m["places"]))
        if m["departages"]:
            dep.append((n, m["departages"]))
        if m["ambiguite"]:
            ambig.append(n)
        if m["places"] and m["cachee"] != m["places"][-1]:
            cachee_deplacee.append(n)
        detail.append(f"Séance {k}, texte {n} ({tension}, s = {obj['textes'][n]['sens']}) : médiane {m['mediane']}")
        for X in m["classement"]:
            d = m["info"][X]
            detail.append(f"  {X:9s} niveau {d['reponse']['niveau']} raison {str(d['reponse']['raison']):6s} "
                          f"x {str(d['x']):5s} Σw {str(d['somme_w']):4s} c {str(d['c']):6s} ℓ {str(d['l']):6s} "
                          f"q {str(d['q']):6s} dist {str(d['distance']):7s} rareté {str(d['rarete']):5s} "
                          f"surprise {d['surprise']}" + ("  [atypique]" if (n, X) in atyp else ""))
        detail.append(f"  classement {m['classement']} ; départages {m['departages']} ; remplacements {m['remplacements']} ; "
                      f"places {m['places']} ; raison cachée {m['cachee']}"
                      + (" ; cartes identiques servies ensemble" if m["identiques_ensemble"] else ""))
    lignes.append(f"Manches du porteur (séances 2 à 14, textes 1 à 13) : {cartes} cartes servies "
                  f"(par manche : {nb_cartes}).")
    lignes.append(f"Part de réponses atypiques parmi les cartes servies au porteur : {cartes_atyp} sur {cartes} "
                  f"(le même compte avant et après redistribution des cartes identiques).")
    lignes.append(f"Remplacements de cartes identiques dans sa manche : {rempl}. Manches où des cartes identiques "
                  f"restent servies ensemble : {len(ens)}" + (f" (textes {', '.join(ens)})" if ens else "")
                  + f", soit {cartes_ens} cartes.")
    lignes.append(f"Raisons « aucune » parmi ses cartes : {aucune_aff} affichées, {aucune_cach} cachées. "
                  f"Carte à raison cachée déplacée (§4.4) : {len(cachee_deplacee)}"
                  + (f" (textes {', '.join(cachee_deplacee)})" if cachee_deplacee else "") + ".")
    lignes.append(f"Égalités de classement dans sa manche (groupes de surprise exactement égale) : "
                  f"{sum(d for _, d in dep)}" + (" — " + ", ".join(f"texte {n} : {d}" for n, d in dep) if dep else "") + ".")
    if ambig:
        lignes.append(f"ATTENTION : plusieurs paires de cartes identiques à la fois (lecture du §4.3, étape 3) : textes {ambig}.")
    lignes.append("Cases personnage × tension vues par le porteur (cartes des manches révélées jusqu'à la séance 15, "
                  "plus les trois réponses d'Agathe à l'entrée) :")
    lignes.append("            S   P   T   L")
    for p in PERSONNAGES:
        lignes.append(f"  {p:9s} " + " ".join(f"{vues[(p, t)]:3d}" for t in TENSIONS))
    faibles = [f"{p} × {t} ({vues[(p, t)]})" for p in PERSONNAGES for t in TENSIONS if vues[(p, t)] < 2]
    lignes.append("Cases vues moins de 2 fois (signalées au §9 bis) : " + (", ".join(faibles) if faibles else "aucune") + ".")
    return lignes, detail


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------

def graine_par_defaut() -> str:
    """§0 de la simulation : graine dérivée du commit qui y est écrit ; la valeur annoncée y est vérifiée."""
    commit, annoncee = lire_graine_spec()
    exiger(commit == COMMIT_SPEC, f"§0 : commit de dérivation {commit} ≠ {COMMIT_SPEC}")
    graine = hashlib.sha256(("elenchos-essai|graine|" + commit).encode("utf-8")).hexdigest()[:16]
    exiger(graine == annoncee, f"§0 : graine dérivée {graine} ≠ graine annoncée {annoncee}")
    return graine


def jour_paris() -> datetime.date:
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("Europe/Paris")).date()
    except Exception:  # pragma: no cover
        return datetime.date.today()


def principal(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="Scellement de l'essai Elenchos (fichier candidat).")
    ap.add_argument("--atypiques", type=int, default=None, help="2, 3 ou 4 (défaut : profils.md)")
    ap.add_argument("--seuils-stricts", action="store_true", help="réglage du §9 bis (défaut : non)")
    ap.add_argument("--jour", default=None, help="jour du scellement AAAA-MM-JJ (défaut : aujourd'hui, Paris)")
    ap.add_argument("--sortie", default=str(SORTIE_DEFAUT), help="dossier de sortie")
    ap.add_argument("--graine", default=None, help="pour essai seulement ; défaut : dérivée du commit de la spécification")
    args = ap.parse_args(argv)

    journal: list[str] = []
    graine = args.graine or graine_par_defaut()
    exiger(re.fullmatch(r"[0-9a-f]{16}", graine) is not None, "graine invalide")
    if args.jour:
        exiger(re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", args.jour) is not None, "jour : écriture AAAA-MM-JJ")
        jour = datetime.date.fromisoformat(args.jour)
    else:
        jour = jour_paris()
    n_atyp_src = lire_profils()["n_atypiques"]
    n_atyp = args.atypiques if args.atypiques is not None else n_atyp_src
    if n_atyp != n_atyp_src:
        journal.append(f"ATTENTION : {n_atyp} réponses atypiques demandées, profils.md en prévoit {n_atyp_src} : "
                       "profils.md doit être mis à jour avant le scellement.")

    fichier, ann = assembler(graine, n_atyp, args.seuils_stricts, journal)
    octets = canonique(fichier)
    sortie = Path(args.sortie)
    sortie.mkdir(parents=True, exist_ok=True)
    chemin = sortie / NOM_CANDIDAT
    chemin.write_bytes(octets)
    relu = chemin.read_bytes()
    exiger(relu == octets, "relecture du fichier écrit")

    obj = verifier_fichier(relu, jour, ann["fiches_vis"], journal)
    verifier_fidelite_fiches(obj, graine, journal)
    controles_en_plus(obj, ann, n_atyp, journal)
    constants, detail = chiffres_constants(obj)
    empreinte = hashlib.sha256(relu).hexdigest()

    rapport = []
    rapport.append("FICHIER SCELLÉ CANDIDAT — NE PAS PUBLIER CETTE EMPREINTE (candidat, pas le fichier scellé final)")
    rapport.append(f"Programme : {Path(__file__).relative_to(RACINE)}")
    rapport.append(f"Fichier : {chemin.relative_to(RACINE) if chemin.is_relative_to(RACINE) else chemin}")
    rapport.append(f"Taille : {len(relu)} octets")
    rapport.append(f"SHA-256 (candidat) : {empreinte}")
    rapport.append(f"Graine : {graine}" + ("" if args.graine else
                   f" = 16 premiers chiffres hex de SHA-256(\"elenchos-essai|graine|{COMMIT_SPEC}\"), "
                   "comme l'écrit le §0 de simulation.md (dérivation et valeur vérifiées)"))
    rapport.append(f"Réglage : {n_atyp} réponses atypiques par personnage ; seuils_stricts = "
                   f"{'true' if args.seuils_stricts else 'false'}")
    rapport.append(f"Jour du scellement utilisé pour l'étape 4 : {jour.isoformat()}")
    rapport.append("Sources lues (SHA-256 des octets ; schéma 4.1, étape 8, « Mêmes sources ») :")
    for f in [F_SIMULATION, F_PROFILS, F_REGLES, F_SCHEMA, F_VOTES] + F_FICHES:
        rapport.append(f"  {hashlib.sha256(f.read_bytes()).hexdigest()}  {f.relative_to(RACINE)}")
    rapport.append("")
    rapport.append("Vérifications (schema.md partie 4.1) : étapes 1 et 2 non faites (pas d'empreinte publiée, pas de "
                   "page construite) ; étapes 3 à 8 passées ; contrôles en plus passés.")
    rapport += ["  - " + j for j in journal]
    rapport.append("")
    rapport.append("Vecteurs de test :")
    for v in obj["vecteurs_test"]:
        rapport.append(f"  t(\"{v['cle']}\") : chaîne {v['chaine']} ; hex8 {v['hex8']} ; N {v['n']}")
    rapport.append("")
    rapport.append("Ordre d'affichage des raisons (numéro dans la fiche → rang ; tiré par t(\"ordre-raisons|texte|numéro\")) :")
    for cle in TEXTES:
        cs = ann["textes_internes"][cle]["considerations"]
        rapport.append(f"  {cle:3s} : " + ", ".join(f"R{c['_numero_fiche']}→{c['rang']} ({c['cote']})" for c in cs))
    rapport.append("")
    rapport.append("Chiffres constants du fichier (regles-de-calcul.md §9 bis ; ne dépendent pas des parties jouées) :")
    rapport += ["  " + l for l in constants]
    rapport.append("")
    rapport.append(f"SHA-256 (candidat) : {empreinte}")
    texte_rapport = "\n".join(rapport) + "\n"
    (sortie / "rapport-candidat.txt").write_text(texte_rapport, encoding="utf-8")
    (sortie / "detail-manches-porteur-candidat.txt").write_text(
        "Détail des manches du porteur sur le fichier candidat (à ne pas montrer aux auteurs du programme de "
        "contrôle ni des carnets de référence avant qu'ils aient rendu leur travail).\n" + "\n".join(detail) + "\n",
        encoding="utf-8")
    sys.stdout.write(texte_rapport)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(principal(sys.argv[1:]))
    except Defaut as e:
        sys.stderr.write(f"DÉFAUT : {e}\n")
        sys.exit(1)
