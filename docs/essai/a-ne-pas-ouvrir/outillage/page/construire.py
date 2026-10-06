"""Construction de la page de l'essai (simulation.md, §8.8 « Construction » ; §9, contrôle 5).

Outillage d'essai (D-001 tenu). Python 3.11, bibliothèque standard seulement.

    python3 -I construire.py --scelle FICHIER_SCELLE.json --entrees ENTREES.json --sortie DOSSIER
        [--version-page N]   (version témoin d'un correctif simulé, pour le harnais seulement)

Écrit dans DOSSIER : porteur/index.html, temoin/index.html, version.txt,
rapport-construction.txt. Mêmes entrées, mêmes octets.

Refuse de s'exécuter si un champ du fichier d'entrées manque, si le SHA-256
du fichier scellé diffère de `empreinte`, si une police diffère de son
empreinte, si un caractère affiché du fichier scellé manque aux polices, ou
si une vérification mécanique du contrôle 5 échoue.
"""

import argparse
import base64
import hashlib
import json
import os
import re
import sys
import unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
SOURCES_SCRIPT = ["noyau.js", "moteur.js", "textes.js", "interface.js"]
SOURCES_TEMOIN = ["trace.js", "temoin.js"]
REPERE = "/*elenchos-scelle*/"
FACES = [  # fichier, famille CSS, graisse, style
    ("alegreya-700.woff2", "Alegreya", 700, "normal"),
    ("alegreya-italique-500.woff2", "Alegreya", 500, "italic"),
    ("alegreya-italique-700.woff2", "Alegreya", 700, "italic"),
    ("alegreya-sans-400.woff2", "Alegreya Sans", 400, "normal"),
    ("alegreya-sans-700.woff2", "Alegreya Sans", 700, "normal"),
    ("alegreya-sans-italique-400.woff2", "Alegreya Sans", 400, "italic"),
]
LIGNE_LICENCE = "Polices réduites ; glyphe vide U+202F (espace fine insécable) ajouté à chaque face."
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

# Balises du §8.8, en tête du fichier, dans cet ordre.
TETE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="{csp}">
<meta name="referrer" content="no-referrer">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Essai">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#EEF0EE" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141516" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="apple-touch-icon.png">
<title>Essai</title>
"""

# Partie mécanique du contrôle 5 : mots interdits dans les blocs de script.
INTERDITS = ["Intl", "toLocale", "Math.random", "crypto", "eval(", "Function(", "innerHTML", "outerHTML", "insertAdjacentHTML",
             "document.write", "fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "sessionStorage",
             "indexedDB", "caches", "serviceWorker", ".clear(", "cookie", "new Image", "import(", "setAttribute('style'",
             'setAttribute("style"', "location.href =", "window.open", "postMessage", "getTimezoneOffset", "getHours",
             "getDate(", "getDay(", "toISOString", "Date.parse", "new Date"]


def echec(message):
    sys.exit("construction refusée : " + message)


def sha256(octets):
    return hashlib.sha256(octets).hexdigest()


def empreinte_csp(texte):
    return "'sha256-" + base64.b64encode(hashlib.sha256(texte.encode("utf-8")).digest()).decode("ascii") + "'"


def lire_utf8(chemin):
    with open(chemin, "rb") as f:
        return f.read().decode("utf-8")  # strict


def date_valide(s):
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", s):
        return False
    import datetime
    try:
        datetime.date(int(s[:4]), int(s[5:7]), int(s[8:]))
    except ValueError:
        return False
    return True


def date_longue(s):
    a, m, j = int(s[:4]), int(s[5:7]), int(s[8:])
    return ("1er" if j == 1 else str(j)) + " " + MOIS[m - 1] + " " + str(a)


def lire_entrees(chemin):
    e = json.loads(lire_utf8(chemin))
    attendus = {"version_page", "consultes_le", "empreinte", "empreinte_publiee_le", "empreinte_publiee_a"}
    manquants = attendus - set(e)
    if manquants:
        echec("champs manquants dans le fichier d'entrées : " + ", ".join(sorted(manquants)))
    if not (isinstance(e["version_page"], int) and not isinstance(e["version_page"], bool) and e["version_page"] >= 1):
        echec("version_page : entier ≥ 1 attendu")
    for c in ("consultes_le", "empreinte_publiee_le"):
        if not date_valide(e[c]):
            echec(c + " : date AAAA-MM-JJ attendue")
    if not re.fullmatch(r"[0-9a-f]{64}", e["empreinte"]):
        echec("empreinte : 64 chiffres hexadécimaux minuscules attendus")
    if not re.fullmatch(r"([01][0-9]|2[0-3]):[0-5][0-9]", e["empreinte_publiee_a"]):
        echec("empreinte_publiee_a : heure HH:MM attendue")
    return e


def sans_node(js):
    if js.count("/*node-debut*/") != js.count("/*node-fin*/"):
        echec("repères node mal appariés")
    return re.sub(r"/\*node-debut\*/.*?/\*node-fin\*/\n?", "", js, flags=re.S)


def chaines_affichees(scelle):
    """Chaînes du fichier scellé qui s'affichent (schema.md, partie 4.1, étape 7)."""
    l = [scelle["cercle"]["nom"], scelle["cercle"]["inviteuse"]]
    for p in scelle["personnages"].values():
        l += [p["metier"], p["ville"], p["ligne_de_vie"]]
    for t in scelle["textes"].values():
        l += [t["titre"]] + t["lignes"]
        a = t["auteur"]
        if a["type"] != "gouvernement":
            l += [a["nom"], a["groupe"]]
        for c in t["considerations"]:
            l += [c["texte"], c["depute"]["nom"], c["depute"]["groupe"]]
    return l


def plages(texte):
    """« U+0020-007E,U+00A0 » -> ensemble des points de code."""
    ens = set()
    for morceau in texte.split(","):
        m = re.fullmatch(r"U\+([0-9A-F]{4,6})(?:-([0-9A-F]{4,6}))?", morceau)
        a = int(m.group(1), 16)
        b = int(m.group(2), 16) if m.group(2) else a
        ens.update(range(a, b + 1))
    return ens


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scelle", required=True)
    ap.add_argument("--entrees", required=True)
    ap.add_argument("--sortie", required=True)
    ap.add_argument("--version-page", type=int, default=None)
    args = ap.parse_args()

    entrees = lire_entrees(args.entrees)
    version = args.version_page if args.version_page is not None else entrees["version_page"]

    with open(args.scelle, "rb") as f:
        octets = f.read()
    if sha256(octets) != entrees["empreinte"]:
        echec("le SHA-256 du fichier scellé (%s) diffère de l'empreinte du fichier d'entrées" % sha256(octets))
    texte_scelle = octets.decode("utf-8")
    scelle = json.loads(texte_scelle)
    canonique = json.dumps(scelle, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
    if canonique != texte_scelle or scelle.get("format") != "elenchos-essai-scelle" or scelle.get("version") != 4:
        echec("fichier scellé : forme canonique, format ou version inattendus")

    # Polices : empreintes versionnées, couverture des caractères affichés.
    dossier_polices = os.path.join(ICI, "polices")
    empreintes = {}
    for ligne in lire_utf8(os.path.join(dossier_polices, "empreintes.txt")).splitlines():
        h, nom = ligne.split("  ", 1)
        empreintes[nom] = h
    manifeste = json.loads(lire_utf8(os.path.join(dossier_polices, "polices.json")))
    couverts = None
    css_polices = []
    for fichier, famille, graisse, style in FACES:
        with open(os.path.join(dossier_polices, fichier), "rb") as f:
            o = f.read()
        if sha256(o) != empreintes.get(fichier):
            echec("police %s : SHA-256 différent de polices/empreintes.txt" % fichier)
        face = [x for x in manifeste["faces"] if x["fichier"] == fichier][0]
        ens = plages(face["couverts"])
        couverts = ens if couverts is None else couverts & ens
        css_polices.append('@font-face{font-family:"%s";font-style:%s;font-weight:%d;font-display:block;src:url(data:font/woff2;base64,%s) format("woff2")}'
                           % (famille, style, graisse, base64.b64encode(o).decode("ascii")))
    manquants = sorted({ord(c) for s in chaines_affichees(scelle) for c in s} - couverts)
    if manquants:
        echec("caractères affichés absents des polices : " + ", ".join("U+%04X %s" % (c, unicodedata.name(chr(c), "?")) for c in manquants))

    # Style.
    style = lire_utf8(os.path.join(ICI, "style.css"))
    if style.count("/*POLICES*/") != 1:
        echec("repère /*POLICES*/ absent ou répété dans style.css")
    style = style.replace("/*POLICES*/", "\n".join(css_polices))

    # Script principal.
    corps = []
    for nom in SOURCES_SCRIPT:
        js = sans_node(lire_utf8(os.path.join(ICI, nom)))
        if REPERE in js:
            echec("le repère du fichier scellé figure dans " + nom)
        corps.append("/* ---- " + nom + " ---- */\n" + js)
    b64 = base64.b64encode(octets).decode("ascii")
    entete = ("var ENTREES = " + json.dumps({"version_page": version, "consultes_le": entrees["consultes_le"],
                                              "empreinte_publiee_le": entrees["empreinte_publiee_le"],
                                              "empreinte_publiee_a": entrees["empreinte_publiee_a"]}, sort_keys=True) + ";\n"
              "var SCELLE_B64 = " + REPERE + '"' + b64 + '";\n')
    script = "\n(function () {\n'use strict';\n" + entete + "\n".join(corps) + "\n})();\n"
    temoin = "\n(function () {\n'use strict';\n" + "\n".join(sans_node(lire_utf8(os.path.join(ICI, n))) for n in SOURCES_TEMOIN) + "\n})();\n"

    # Commentaire de l'en-tête : pied de page et licences (§8.2, §8.8).
    ofl = []
    for nom in ("OFL-alegreya.txt", "OFL-alegreyasans.txt"):
        t = lire_utf8(os.path.join(dossier_polices, nom))
        if "-->" in t or "--!>" in t:
            echec(nom + " contient une fin de commentaire HTML")
        ofl.append(t.strip("\n"))
    commentaire = "\n".join([
        "Page d'essai non commerciale, hébergée par GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.",
        "Source des textes, votes, auteurs et arguments : Assemblée nationale, data.assemblee-nationale.fr (Licence Ouverte) et assemblee-nationale.fr ; consultés le "
        + date_longue(entrees["consultes_le"]) + ". Résumés et raisons réécrits par l'équipe de l'essai ; l'Assemblée n'y est pas associée.",
        "",
        "Polices : Alegreya et Alegreya Sans (google/fonts, commit " + manifeste["commit_google_fonts"] + ").",
        LIGNE_LICENCE,
        "",
        ofl[0], "", ofl[1]])

    source = lire_utf8(os.path.join(ICI, "source", "page.html"))
    for rep in ("__CSP__", "__COMMENTAIRE__", "__STYLE__", "__TEMOIN__", "__SCRIPT__"):
        if source.count(rep) != 1:
            echec("repère " + rep + " absent ou répété dans source/page.html")

    def page(avec_temoin):
        scripts = [empreinte_csp(temoin), empreinte_csp(script)] if avec_temoin else [empreinte_csp(script)]
        csp = ("default-src 'none'; script-src " + " ".join(scripts) + "; style-src " + empreinte_csp(style)
               + "; font-src data:; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'")
        s = source.replace("__CSP__", csp).replace("__COMMENTAIRE__", commentaire).replace("__STYLE__", style)
        s = s.replace("__TEMOIN__", ("<script>" + temoin + "</script>\n") if avec_temoin else "")
        s = s.replace("__SCRIPT__", script)
        return s, csp

    porteur, csp_porteur = page(False)
    temoin_page, csp_temoin = page(True)

    verifier(porteur, temoin_page, script, temoin, b64)

    os.makedirs(os.path.join(args.sortie, "porteur"), exist_ok=True)
    os.makedirs(os.path.join(args.sortie, "temoin"), exist_ok=True)
    sorties = {}
    for chemin, contenu in (("porteur/index.html", porteur), ("temoin/index.html", temoin_page), ("version.txt", str(version) + "\n")):
        o = contenu.encode("utf-8")
        with open(os.path.join(args.sortie, chemin), "wb") as f:
            f.write(o)
        sorties[chemin] = (len(o), sha256(o))
    rapport = ["Rapport de construction de la page de l'essai", "Version de la page : %d" % version,
               "Fichier scellé : SHA-256 %s" % entrees["empreinte"], ""]
    for chemin in sorted(sorties):
        rapport.append("%s : %d octets, SHA-256 %s" % (chemin, sorties[chemin][0], sorties[chemin][1]))
    rapport += ["", "Politique de sécurité, version du porteur :", csp_porteur, "", "Politique de sécurité, version témoin :", csp_temoin,
                "", "Polices :"] + ["%s : SHA-256 %s" % (f, empreintes[f]) for f, _, _, _ in FACES]
    with open(os.path.join(args.sortie, "rapport-construction.txt"), "wb") as f:
        f.write(("\n".join(rapport) + "\n").encode("utf-8"))
    print("\n".join(rapport))


def verifier(porteur, temoin_page, script, temoin, b64):
    """Partie mécanique du contrôle 5 (simulation.md, §9)."""
    o = porteur.encode("utf-8")
    if b'<meta charset="utf-8">' not in o[:1024]:
        echec("la déclaration d'encodage n'est pas dans les 1 024 premiers octets")
    debut_csp = porteur.index('content="', porteur.index("Content-Security-Policy")) + len('content="')
    csp = porteur[debut_csp:porteur.index('"', debut_csp)]
    if not porteur.startswith(TETE.replace("{csp}", csp)):
        echec("balises de tête : ordre ou contenu différents du §8.8")
    if porteur.count("<script>") != 1 or porteur.count("<style>") != 1:
        echec("la version du porteur doit avoir un seul bloc de script et un seul bloc de style")
    for mot in INTERDITS:
        if mot in script or mot in temoin:
            echec("mot interdit par le contrôle 5 : " + mot)
    hors_blocs = re.sub(r"<script>.*?</script>|<style>.*?</style>|<!--.*?-->", "", porteur, flags=re.S)
    if re.search(r"\sstyle\s*=", hors_blocs) or re.search(r"\son[a-z]+\s*=", hors_blocs):
        echec("attribut style ou gestionnaire d'évènement écrit dans le HTML")
    if porteur.count(REPERE) != 1 or porteur.count(REPERE + '"' + b64 + '"') != 1:
        echec("repère du fichier scellé : il doit figurer une fois, suivi du base64")
    if porteur.count(b64) != 1:
        echec("le base64 du fichier scellé doit figurer exactement une fois")
    # Les deux versions ne diffèrent que par le bloc témoin et son empreinte.
    bloc = "<script>" + temoin + "</script>\n"
    if temoin_page.count(bloc) != 1:
        echec("bloc témoin introuvable")
    sans_bloc = temoin_page.replace(bloc, "", 1).replace("script-src " + empreinte_csp(temoin) + " ", "script-src ", 1)
    if sans_bloc != porteur:
        echec("la version témoin diffère de celle du porteur ailleurs que par le bloc témoin et son empreinte")
    for nom in ("ElenchosTrace", "ElenchosTemoin", "traceMoteur", "assembler"):
        if nom in script:
            echec("fonction de trace dans la version du porteur : " + nom)


if __name__ == "__main__":
    main()
