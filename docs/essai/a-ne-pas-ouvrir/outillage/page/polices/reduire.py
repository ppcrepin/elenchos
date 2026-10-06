"""Réduction des six faces embarquées dans la page de l'essai (simulation.md, §8.8).

Outillage d'essai (D-001 tenu). Programme rejouable : mêmes sources, mêmes
versions de fontTools et de brotli, même fichier scellé -> mêmes octets.

Usage (Python 3.11, isolé, dans l'environnement qui a fontTools et brotli
aux versions de `exigences-polices.txt`) :

    python3 -I reduire.py --sources DOSSIER_SOURCES --scelle FICHIER_SCELLE.json \
        --sortie DOSSIER_SORTIE

- DOSSIER_SOURCES : dossier vide (ou déjà rempli par une exécution
  précédente). Chaque fichier source absent y est téléchargé depuis
  raw.githubusercontent.com, au commit noté ci-dessous ; présent ou non,
  son SHA-256 est vérifié contre la table ci-dessous. Une seule différence
  arrête le programme.
- FICHIER_SCELLE.json : le fichier scellé (ou candidat). Tous les
  caractères de ses chaînes entrent dans le jeu de caractères.
- DOSSIER_SORTIE : reçoit les six .woff2, les deux OFL et `polices.json`
  (provenance, versions, options, SHA-256, caractères couverts).

Ce que fait le programme, face par face :
1. lit la police source (sans recalcul de l'horodatage) ;
2. police variable : la fixe à la graisse voulue (varLib.instancer, noms
   mis à jour d'après la table STAT) ;
3. ajoute à la table cmap l'espace fine insécable U+202F, absente des
   sources, sur le glyphe de l'espace fine U+2009 (QUESTIONS.md, Q-F1) ;
4. réduit (fontTools.subset) au jeu de caractères ci-dessous, avec les
   fonctions OpenType par défaut de l'outil plus tnum, sans hinting
   (ignoré par iOS) ; noms gardés : aucun OFL.txt ne réserve de nom ;
5. écrit en woff2 (brotli).
"""

import argparse
import hashlib
import io
import json
import os
import sys
import unicodedata
import urllib.request

import brotli
import fontTools
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

COMMIT = "7085eb89a950e85db5b166b7a58d414544b4140c"  # google/fonts, branche main, relevé le 6 octobre 2026
BASE = "https://raw.githubusercontent.com/google/fonts/" + COMMIT + "/ofl/"

# Fichier local -> (chemin dans google/fonts, SHA-256 attendu)
SOURCES = {
    "Alegreya[wght].ttf": ("alegreya/Alegreya%5Bwght%5D.ttf",
                           "ba5564634b93a8f8ba57b48cd4f1ae7417d2b4656fbac779028679b00de3cf12"),
    "Alegreya-Italic[wght].ttf": ("alegreya/Alegreya-Italic%5Bwght%5D.ttf",
                                  "fa915eec76227935dc5fb678953c94b71287c360928013cfdb441dfe52f5a391"),
    "AlegreyaSans-Regular.ttf": ("alegreyasans/AlegreyaSans-Regular.ttf",
                                 "8fab634196007afca839f1e5a6fb300976daff55d8528b590ef032f01b14ea10"),
    "AlegreyaSans-Bold.ttf": ("alegreyasans/AlegreyaSans-Bold.ttf",
                              "a3055a1893759bdbd7504bb22abc583769e7974c49353176eac0b03792c9fb8e"),
    "AlegreyaSans-Italic.ttf": ("alegreyasans/AlegreyaSans-Italic.ttf",
                                "f49f6f2bdd84df850b25b0f8185d8a051e1d1eb2dd08e2f91b8c7b86d9a9e1a6"),
    "OFL-alegreya.txt": ("alegreya/OFL.txt",
                         "f6f60d5d4cf4f4b1fc4e41353c897a2f5a16e6396c0cd8fa8bdfd2f4586a9a68"),
    "OFL-alegreyasans.txt": ("alegreyasans/OFL.txt",
                             "0677891e6a143f297350d260ad766ad33bfc18ed5fa4f213acf648d6b597ec1a"),
}

VERSIONS = {"fontTools": "4.66.1", "brotli": "1.2.0"}

# Les six faces du §8.8 (Direction artistique) : sortie -> (source, graisse fixée ou None, usage)
FACES = [
    ("alegreya-700.woff2", "Alegreya[wght].ttf", 700,
     "Alegreya gras 700 : titres, verdicts, grand chiffre du bilan, en-têtes, « ? » du rond fermé"),
    ("alegreya-italique-500.woff2", "Alegreya-Italic[wght].ttf", 500,
     "Alegreya italique 500 : initiales des ronds de serviette, « E » de l'icône de notification"),
    ("alegreya-italique-700.woff2", "Alegreya-Italic[wght].ttf", 700,
     "Alegreya italique gras 700 : initiales sur les curseurs"),
    ("alegreya-sans-400.woff2", "AlegreyaSans-Regular.ttf", None,
     "Alegreya Sans 400 : texte courant"),
    ("alegreya-sans-700.woff2", "AlegreyaSans-Bold.ttf", None,
     "Alegreya Sans gras 700 : bouton principal, position sur les cartes, question, bandeau, onglet actif, heure de l'écran verrouillé"),
    ("alegreya-sans-italique-400.woff2", "AlegreyaSans-Italic.ttf", None,
     "Alegreya Sans italique 400 : la raison devinée sur la carte, seulement"),
]

# Jeu de caractères fixe (§8.8, « Caractères »), avant ceux du fichier scellé.
PLAGES = [
    (0x0020, 0x007E),  # latin de base (imprimable)
    (0x00A0, 0x00FF),  # latin-1 (dont U+00A0, « », ·)
    (0x0100, 0x017F),  # latin étendu A (dont Œ, œ, Ÿ)
]
PONCTUATION_FRANCAISE = [
    0x2009,  # espace fine
    0x202F,  # espace fine insécable (ajoutée, voir l'étape 3)
    0x2010, 0x2011,  # trait d'union, trait d'union insécable (absent des sources)
    0x2013, 0x2014,  # tirets demi-cadratin et cadratin
    0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E,  # apostrophe et guillemets
    0x2039, 0x203A,  # guillemets simples
    0x2022,  # puce
    0x2026,  # points de suspension
    0x20AC,  # euro
]
SIGNES_INTERFACE = [0x2190, 0x25BE, 0x25CF, 0x25CB, 0x25CE, 0x2713]  # ← ▾ ● ○ ◎ ✓ (⚙ reste au système)

FONCTIONS = sorted(set(subset.Options().layout_features) | {"tnum"})


def sha256(octets):
    return hashlib.sha256(octets).hexdigest()


def sources_verifiees(dossier):
    os.makedirs(dossier, exist_ok=True)
    lus = {}
    for nom, (chemin, attendu) in SOURCES.items():
        local = os.path.join(dossier, nom)
        if not os.path.exists(local):
            with urllib.request.urlopen(BASE + chemin, timeout=60) as r:
                octets = r.read()
            with open(local, "wb") as f:
                f.write(octets)
        with open(local, "rb") as f:
            octets = f.read()
        obtenu = sha256(octets)
        if obtenu != attendu:
            sys.exit("SHA-256 inattendu pour %s : %s (attendu %s)" % (nom, obtenu, attendu))
        lus[nom] = octets
    return lus


def caracteres_scelle(chemin):
    with open(chemin, "rb") as f:
        donnees = json.loads(f.read().decode("utf-8"))
    vus = set()

    def parcourir(o):
        if isinstance(o, str):
            vus.update(ord(c) for c in o)
        elif isinstance(o, dict):
            for k, v in o.items():
                parcourir(k)
                parcourir(v)
        elif isinstance(o, list):
            for v in o:
                parcourir(v)

    parcourir(donnees)
    return {c for c in vus if c >= 0x20 and not (0x7F <= c < 0xA0)}


def jeu_de_caracteres(scelle):
    jeu = set()
    for a, b in PLAGES:
        jeu.update(range(a, b + 1))
    jeu.update(PONCTUATION_FRANCAISE)
    jeu.update(SIGNES_INTERFACE)
    jeu.update(caracteres_scelle(scelle))
    return sorted(jeu)


def ajouter_espace_fine_insecable(police):
    """U+202F -> glyphe de U+2009, dans chaque sous-table Unicode de cmap."""
    for table in police["cmap"].tables:
        if table.isUnicode() and 0x2009 in table.cmap and 0x202F not in table.cmap:
            table.cmap[0x202F] = table.cmap[0x2009]


def plages_texte(points):
    morceaux, debut, prec = [], None, None
    for p in points:
        if debut is None:
            debut = prec = p
        elif p == prec + 1:
            prec = p
        else:
            morceaux.append((debut, prec))
            debut = prec = p
    if debut is not None:
        morceaux.append((debut, prec))
    return ",".join("U+%04X" % a if a == b else "U+%04X-%04X" % (a, b) for a, b in morceaux)


def reduire(octets_source, graisse, unicodes):
    police = TTFont(io.BytesIO(octets_source), recalcTimestamp=False, recalcBBoxes=True)
    if graisse is not None:
        police = instancer.instantiateVariableFont(police, {"wght": graisse}, updateFontNames=True)
    ajouter_espace_fine_insecable(police)
    options = subset.Options()
    options.layout_features = FONCTIONS
    options.hinting = False
    options.flavor = "woff2"
    options.recalc_timestamp = False
    sous = subset.Subsetter(options=options)
    sous.populate(unicodes=unicodes)
    sous.subset(police)
    sortie = io.BytesIO()
    subset.save_font(police, sortie, options)
    return sortie.getvalue()


def main():
    if fontTools.version != VERSIONS["fontTools"] or brotli.__version__ != VERSIONS["brotli"]:
        sys.exit("Versions inattendues : fontTools %s, brotli %s (attendu %s)"
                 % (fontTools.version, brotli.__version__, VERSIONS))
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", required=True)
    ap.add_argument("--scelle", required=True)
    ap.add_argument("--sortie", required=True)
    args = ap.parse_args()

    lus = sources_verifiees(args.sources)
    unicodes = jeu_de_caracteres(args.scelle)
    scelle_cars = caracteres_scelle(args.scelle)
    os.makedirs(args.sortie, exist_ok=True)

    with open(os.path.join(args.scelle), "rb") as f:
        empreinte_scelle = sha256(f.read())

    manifeste = {
        "commit_google_fonts": COMMIT,
        "versions": VERSIONS,
        "fonctions_opentype": FONCTIONS,
        "hinting": False,
        "jeu_demande": plages_texte(unicodes),
        "fichier_scelle_lu": empreinte_scelle,
        "sources": {nom: SOURCES[nom][1] for nom in SOURCES},
        "faces": [],
    }
    for nom in ("OFL-alegreya.txt", "OFL-alegreyasans.txt"):
        with open(os.path.join(args.sortie, nom), "wb") as f:
            f.write(lus[nom])

    for sortie, source, graisse, usage in FACES:
        octets = reduire(lus[source], graisse, unicodes)
        with open(os.path.join(args.sortie, sortie), "wb") as f:
            f.write(octets)
        relue = TTFont(io.BytesIO(octets))
        couverts = sorted(relue.getBestCmap().keys())
        manquants = [c for c in unicodes if c not in set(couverts)]
        manquants_scelle = sorted(c for c in scelle_cars if c not in set(couverts))
        if manquants_scelle:
            sys.exit("%s ne couvre pas ces caractères du fichier scellé : %s"
                     % (sortie, plages_texte(manquants_scelle)))
        nom_table = relue["name"]
        manifeste["faces"].append({
            "fichier": sortie,
            "source": source,
            "graisse_fixee": graisse,
            "usage": usage,
            "nom_interne": nom_table.getDebugName(4),
            "sha256": sha256(octets),
            "octets": len(octets),
            "glyphes": len(relue.getGlyphOrder()),
            "couverts": plages_texte(couverts),
            "demandes_absents": [
                "U+%04X %s" % (c, unicodedata.name(chr(c), "?")) for c in manquants
            ],
        })
        print("%-34s %6d octets  %s" % (sortie, len(octets), sha256(octets)))

    with open(os.path.join(args.sortie, "polices.json"), "w", encoding="utf-8") as f:
        json.dump(manifeste, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write("\n")


if __name__ == "__main__":
    main()
