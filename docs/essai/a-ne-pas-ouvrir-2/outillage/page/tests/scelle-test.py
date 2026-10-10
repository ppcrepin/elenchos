"""Fichier scellé DE TEST du second essai (lot 1, Front-end). Outillage d'essai (D-001 tenu).

    python3 -I tests/scelle-test.py --personnages ../../../a-ne-pas-ouvrir/fichier-scelle.json --sortie tests/scelle-test.json

Ce fichier n'est PAS le fichier scellé : il est inventé, au format du schéma
(a-ne-pas-ouvrir-2/schema.md, partie 2, version 5), et marqué "statut": "provisoire".
- Les textes (titres, lignes, raisons, auteurs, votes, groupes) sont inventés et se
  déclarent comme tels ; aucun vrai texte du lot n'y figure.
- Les réponses, absences et réponses atypiques sont tirées au hasard (déterministe) :
  elles ne suivent PAS les règles cachées (points 3 et 4), que seul le programme de
  scellement applique.
- Les tables exigées (calendrier, semaines, cercle) sont les vraies (schéma 2.3, 2.4).
- Les textes abstraits H1 à H90 suivent le point 2 bis du fichier caché, pour que les
  tests aient des données de la bonne forme ; ce calcul ne fait pas foi.
- `personnages` est recopié du fichier scellé du premier essai (contrôle 2 : « les mêmes
  personnages ») : le fichier source est passé en paramètre.
- `histoire.resume_sha256` est un bouche-trou : le résumé (V6) se calcule au lot 2.
La graine dérive d'une empreinte de commit fictive (E_FICTIVE), jamais d'un vrai commit.
"""

import argparse
import hashlib
import json

E_FICTIVE = "0" * 40
PREFIXE_GRAINE = "elenchos-essai-2|graine|"
PERSOS = ["Agathe", "Nassim", "Odile", "Valentin"]
TENSIONS = ["S", "P", "T", "L"]
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

# Tables exigées (schéma 2.4), recopiées telles quelles : ce sont les vraies valeurs.
CALENDRIER = [
    # jour, nom_jour, type, saut, revele, revelation_porteur, manche, deviner_porteur, repondu
    (1, "lundi", "joue", None, "H90", "aucune", "0", True, "1"),
    (2, "mardi", "joue", None, "0", "lue", "1", True, "2"),
    (3, "mercredi", "joue", None, "1", "lue", "2", True, "3"),
    (4, "jeudi", "joue_puis_saut", 1, "2", "lue", "3", False, "4"),
    (5, "vendredi", "saute", 1, "3", "jamais_lue", "4", False, "5"),
    (6, "samedi", "saute", 1, "4", "jamais_lue", "5", False, "6"),
    (7, "dimanche", "joue", None, "5", "lue", "6", True, "7"),
    (8, "lundi", "joue_puis_saut", 2, "6", "lue", "7", False, "8"),
    (9, "mardi", "saute", 2, "7", "jamais_lue", "8", False, "9"),
    (10, "mercredi", "saute", 2, "8", "jamais_lue", "9", False, "10"),
    (11, "jeudi", "saute", 2, "9", "jamais_lue", "10", False, "11"),
    (12, "vendredi", "saute", 2, "10", "jamais_lue", "11", False, "12"),
    (13, "samedi", "saute", 2, "11", "jamais_lue", "12", False, "13"),
    (14, "dimanche", "joue", None, "12", "lue", "13", True, "14"),
    (15, "lundi", "cloture", None, "13", "lue", None, False, None),
]
CERCLE = {"invitant": "Valentin",
          "membres": [{"depuis": -90, "membre": p} for p in PERSOS] + [{"depuis": 1, "membre": "porteur"}],
          "nom": "Amis"}

# Groupes et commission inventés, avec les signes que permet la partie 2.10 (virgule,
# trait d'union entre lettres, trait d'union entre espaces, parenthèses, « & »).
GROUPES = ["Groupe des Essais - Premier Front", "Libertés, Outre-mer et Essais (test)",
           "Rassemblement & Essai", "Union des Textes inventés", "Écologie d'essai et Social"]
COMMISSION = "commission des essais inventés"
TEXTES_JOUES = ["E1", "E2", "E3"] + [str(n) for n in range(0, 15)]
TENSION_JOUEE = {"E1": "S", "E2": "P", "E3": "T"}
ORDRE_T = "S L P S L T S P L S P L S T P".split()  # forme de l'ordre retenu, sans valeur probante ici


def sha(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


class Tirage:
    def __init__(self, graine):
        self.graine = graine

    def n(self, cle):
        return int(sha(self.graine + "|" + cle)[:8], 16)

    def demi(self, cle):
        return self.n(cle) < 2 ** 31

    def vecteur(self, cle):
        chaine = self.graine + "|" + cle
        h = sha(chaine)
        return {"chaine": chaine, "cle": cle, "hex8": h[:8], "n": int(h[:8], 16)}

    def melanger(self, elements, prefixe):
        return sorted(elements, key=lambda e: (self.n(prefixe + str(e)), prefixe + str(e)))


class Hasard:
    """Hasard déterministe des données inventées (jamais les clés du fichier caché)."""
    def __init__(self, graine):
        self.graine = graine

    def entier(self, cle, n):
        return int(sha("test|" + self.graine + "|" + cle)[:12], 16) % n


def histoire(tir):
    textes = {}
    occ = {t: 0 for t in TENSIONS}
    # Sens de P calé pour que H86 ait le sens 0 (point 2 bis).
    rang_p_h86 = sum(1 for i in range(1, 87) if TENSIONS[((i - 91 + 6) % 4)] == "P")
    depart_p = 0 if rang_p_h86 % 2 == 1 else 1
    for i in range(1, 91):
        j = i - 91
        t = TENSIONS[(j + 6) % 4]
        occ[t] += 1
        premier = depart_p if t == "P" else 1
        s = premier if occ[t] % 2 == 1 else 1 - premier
        h = "H%d" % i
        poles = {1: s, 2: s, 3: 1 - s, 4: 1 - s}
        if not tir.demi("histoire-raisons|" + h):
            for numero, cote in ((2, "pour"), (4, "contre")):
                pi_c = s if cote == "pour" else 1 - s
                poles[numero] = (1 - pi_c) if tir.demi("histoire-inattendu|%s|%s" % (h, cote)) else "aucun"
        cotes = {1: "pour", 2: "pour", 3: "contre", 4: "contre"}
        ordre = tir.melanger([1, 2, 3, 4], "ordre-raisons|%s|" % h)
        raisons = [{"cote": cotes[k], "pole": poles[k], "rang": r + 1} for r, k in enumerate(ordre)]
        fiche = None
        if i == 86:
            fiche = {"titre": "Texte d'essai inventé H86, surprise de la semaine",
                     "vote": {"date": "2026-06-04", "etape": "navette", "issue": "adopte", "objet": "texte"}}
        textes[h] = {"fiche": fiche, "jour": j, "raisons": raisons, "sens": s, "tension": t}
    assert textes["H86"]["tension"] == "P" and textes["H86"]["sens"] == 0
    return textes


VOTES = [  # objet, issue, etape : toutes les combinaisons permises (partie 2.5)
    ("texte", "adopte", "navette"), ("texte", "adopte", "definitif"), ("texte", "rejete", "navette"),
    ("texte", "rejete", "aucune"), ("article", "adopte", "navette"), ("article", "adopte", "aucune"),
    ("article", "rejete", "aucune"), ("amendement", "adopte", "navette"), ("amendement", "rejete", "aucune"),
    ("motion", "rejete", "aucune"),
]


def auteur(k, nom):
    forme = k % 6
    if forme == 0:
        return {"feminin": True, "groupe": GROUPES[k % len(GROUPES)], "nom": nom, "type": "depute"}
    if forme == 1:
        return {"feminin": False, "groupe": None, "nom": nom, "type": "depute"}
    if forme == 2:
        return {"feminin": False, "groupe": GROUPES[(k + 1) % len(GROUPES)], "nom": nom, "type": "senateur"}
    if forme == 3:
        return {"type": "gouvernement"}
    if forme == 4:
        return {"libelle": COMMISSION, "type": "commission"}
    return {"feminin": True, "groupe": GROUPES[(k + 2) % len(GROUPES)], "nom": nom, "type": "depute"}


def texte_joue(cle, k, tension, s, tir, inattendus):
    """Une fiche inventée. inattendus : None (aucun), 'croise' ou 'pratique' (un de chaque côté)."""
    poles = {1: s, 2: s, 3: 1 - s, 4: 1 - s}
    if inattendus == "croise":
        poles[2], poles[4] = 1 - s, s
    elif inattendus == "pratique":
        poles[2], poles[4] = "aucun", "aucun"
    cotes = {1: "pour", 2: "pour", 3: "contre", 4: "contre"}
    ordre = tir.melanger([1, 2, 3, 4], "test-ordre|%s|" % cle)
    groupes = [GROUPES[(k + i) % len(GROUPES)] for i in range(4)]
    if k % 3 == 0:
        groupes[1] = None  # un non-inscrit au plus par texte (partie 5.1, étape 5)
    noms = ["Camille Essai", "Dominique Test", "Élise Exemple", "Hugo Modèle"]
    considerations = []
    for r, n in enumerate(ordre):
        considerations.append({
            "cote": cotes[n],
            "depute": {"elision": noms[r][0] in "ÉEH", "feminin": r % 2 == 0, "groupe": groupes[r], "nom": noms[r]},
            "pole": poles[n], "rang": r + 1,
            "texte": "Raison d'essai %d du texte %s, inventée pour les tests." % (n, cle)})
    objet, issue, etape = VOTES[k % len(VOTES)]
    if cle == "E2":
        objet, issue, etape = "texte", "rejete", "aucune"  # au moins un rejeté à l'entrée (D-028)
    return {
        "auteur": auteur(k, "Auteur d'essai %s" % cle),
        "considerations": considerations,
        "lien_scrutin": "https://www.assemblee-nationale.fr/dyn/17/scrutins/0",
        "lignes": ["Première ligne inventée du texte %s." % cle,
                   "Deuxième ligne inventée, sans rapport avec un vrai texte.",
                   "Troisième ligne inventée, pour les tests du lot 1."],
        "sens": s,
        "sources": ["https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/0"],
        "tension": tension,
        "titre": "Texte d'essai inventé %s" % (cle if cle.startswith("E") else "T" + cle),
        "vote": {"date": "2025-%02d-%02d" % (1 + k % 12, 1 + k % 28), "etape": etape, "issue": issue, "objet": objet},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--personnages", required=True, help="fichier scellé du premier essai (pour `personnages`)")
    ap.add_argument("--sortie", required=True)
    a = ap.parse_args()
    with open(a.personnages, "rb") as f:
        premier = json.loads(f.read().decode("utf-8"))
    graine = sha(PREFIXE_GRAINE + E_FICTIVE)[:16]
    tir = Tirage(graine)
    hz = Hasard(graine)

    textes = {}
    for k, cle in enumerate(TEXTES_JOUES):
        tension = TENSION_JOUEE.get(cle) or ORDRE_T[int(cle)]
        inatt = [None, "croise", "pratique"][k % 3]
        textes[cle] = texte_joue(cle, k, tension, (k + 1) % 2, tir, inatt)

    hist = histoire(tir)
    ordre_textes = ["E1", "E2", "E3"] + ["H%d" % i for i in range(1, 91)] + [str(n) for n in range(0, 15)]
    nb_raisons = {c: len(textes[c]["considerations"]) for c in textes}
    nb_raisons.update({h: len(hist[h]["raisons"]) for h in hist})

    absences = {p: [] for p in PERSOS}
    atypiques = {p: [] for p in PERSOS}
    reponses = {}
    for cle in ordre_textes:
        sans_ecart = cle.startswith("E") or cle == "14"
        absent = None
        if not sans_ecart and hz.entier("absence|" + cle, 9) == 0:
            absent = PERSOS[hz.entier("qui|" + cle, 4)]
            absences[absent].append(cle)
        rep = {}
        for p in PERSOS:
            if p == absent:
                continue
            niveau = 1 + hz.entier("niveau|%s|%s" % (p, cle), 5)
            r = hz.entier("raison|%s|%s" % (p, cle), nb_raisons[cle] + 1)
            rep[p] = {"niveau": niveau, "raison": "aucune" if r == nb_raisons[cle] else r + 1}
            if not sans_ecart and hz.entier("atypique|%s|%s" % (p, cle), 7) == 0:
                atypiques[p].append({"cote_tire": None, "texte": cle})
        reponses[cle] = rep

    scelle = {
        "absences": absences,
        "calendrier": [dict(zip(["jour", "nom_jour", "type", "saut", "revele", "revelation_porteur", "manche",
                                 "deviner_porteur", "repondu"], ligne)) for ligne in CALENDRIER],
        "cercle": CERCLE,
        "format": "elenchos-essai-scelle",
        "graine": graine,
        "histoire": {"resume_sha256": sha("provisoire|résumé de l'histoire non calculé (lot 2)"),
                     "textes": hist, "tirage": 1},
        "personnages": premier["personnages"],
        "reglage": {"alpha": "1/4", "barre": 16, "facteur": 3, "seuils_stricts": False},
        "reponses": reponses,
        "reponses_atypiques": atypiques,
        "semaines": [{"dernier_jour": 7 * (w - 13), "numero": w, "premier_jour": 7 * (w - 14) + 1} for w in range(1, 16)],
        "statut": "provisoire",
        "textes": textes,
        "vecteurs_test": [tir.vecteur(c) for c in ("raison|Odile|E2|3", "hasard|Nassim|13|porteur", "ecart-hstar|1|Valentin")],
        "version": 5,
    }
    texte = json.dumps(scelle, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
    with open(a.sortie, "wb") as f:
        f.write(texte.encode("utf-8"))
    print("scellé de test écrit :", a.sortie, "SHA-256", hashlib.sha256(texte.encode("utf-8")).hexdigest())


if __name__ == "__main__":
    main()
