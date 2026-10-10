"""Phrases attendues du dévoilement du second essai, pour le contrôle 11
(`a-ne-pas-ouvrir-2/devoilement.md`, gabarits et « Règles de calcul »). Elles
dépendent du fichier scellé et, pour deux points, du journal de la partie : les
manches ouvertes (« Vous l'aviez à deviner ») et les réponses du porteur (tempéraments
du jour 14, « les réponses que le porteur n'a pas données comptent comme absentes »).

Chaque bloc est une chaîne affichée : règles 1 à 6 du §7.8, sauf l'empreinte, la graine,
le fichier scellé et r, écrits tels quels. Lectures propres : QUESTIONS.md, Q-D…"""

from fractions import Fraction as F

from .histoire import calculer_histoire
from .jeu import ENTREE, PERSONNAGES, TENSIONS, LIBELLE_NIVEAU, POLES
from .tirage import sha256_hex
from .typo import afficher

MOTS = ("zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze",
        "treize", "quatorze", "quinze", "seize")
CINQ = {"1/6": "sept", "1/4": "cinq", "1/3": "quatre"}
FACTEUR = {2: ("deux", "quatre", "5"), 3: ("trois", "six", "3 et 1/3"), 4: ("quatre", "huit", "2 et 1/2")}
FIXES = {
    "Agathe": "Faite pour ressembler à Nassim, sauf entre local et national.",
    "Nassim": "Fait pour ressembler à Agathe, sauf entre local et national.",
    "Odile": "Tranchée : loin du milieu et fermeté forte, sur les quatre tensions.",
    "Valentin": "Des valeurs que sa vie ne laisse pas deviner.",
}
TEMPS = {
    "original": "L'Original : seul de son côté, favorable ou défavorable, sur au moins 3 de ses réponses sur 10.",
    "pont": "Le Pont : quand les autres se partageaient entre favorable et défavorable, seul à répondre Neutre, "
            "sur au moins 1 de ces textes sur 8 (et au moins 6 textes ainsi partagés).",
    "mesure": "Le Mesuré : Neutre sur au moins 1 de ses réponses sur 3.",
    "tranche": "Le Tranché : « Très favorable » ou « Très défavorable » sur au moins 1 de ses réponses sur 2.",
}


def liste(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " et " + xs[-1]


def nom_tension(T):
    return f"{POLES[T][0]} ou {POLES[T][1]}"


def pluriel(n, mot):
    return f"{n} {mot}" + ("" if n in (0, 1) else "s")


def phrases_devoilement(d, octets, journal=None, date_pub=None, heure_pub=None, nom_fichier=None):
    _, _, mo, _ = calculer_histoire(d, octets)
    cal = {o["jour"]: o for o in d["calendrier"]}
    titre86 = d["histoire"]["textes"]["H86"]["fiche"]["titre"]
    f = d["reglage"]["facteur"]
    trois, six, seuil = FACTEUR[f]
    P = []

    def panneau(titre, blocs, brut=()):
        P.append({"blocs": [afficher(b) for b in blocs] + list(brut), "titre": None if titre is None else afficher(titre)})

    panneau(None, ["Voici ce que la page vous cachait : comment l'histoire du cercle a été calculée, le profil de "
                   "chaque personnage, ses réponses données exprès contre ce profil et ses jours sans jouer. Tout en "
                   "bas, « Pour le contrôle » : l'empreinte à comparer avec celle publiée dans la conversation."])
    panneau("Comment lire", [
        "Chaque personnage a gardé le profil du premier essai. Pour chaque tension, une place de 0 à 100 : 0 pour "
        "la première valeur (Sécurité), 100 pour la seconde (Liberté individuelle) ; de 41 à 59, au milieu. Et une "
        "fermeté : plus elle était forte, plus ses réponses s'éloignaient de Neutre, jusqu'à « Très ».",
        f"Les réponses de chacun découlaient de son profil, sauf environ une sur {CINQ[d['reglage']['alpha']]}, tirée "
        "au sort et donnée exprès contre ce profil pour que rien ne se devine à coup sûr : le côté opposé, sans "
        "« Très » (si le profil donnait Neutre, un côté tiré au sort). Quand ce côté allait contre sa valeur, il "
        "prenait l'argument inattendu de ce côté s'il y en avait un (au nom de sa valeur, ou pratique), sinon "
        "l'argument attendu. Jamais deux textes de suite pour un même personnage, jamais plus de deux personnages "
        "pour un même texte. Deux exceptions : le compte repart de zéro à votre arrivée, et les deux réponses "
        f"imposées sur « {titre86} » (panneau suivant).",
        "Chacun s'absentait parfois, par tirage : une chance sur quatorze à chaque texte, jamais deux fois en sept "
        "textes de suite (l'histoire et l'essai se comptent chacun à part), jamais plus d'un absent pour un même "
        "texte. Ce jour-là, ni réponse ni devinette.",
        "Aux trois textes d'entrée et au texte du dernier jour, personne ne répondait contre son profil ni ne "
        "s'absentait.",
        "Toutes les réponses des personnages ont été calculées par des règles fixes, écrites et scellées avant "
        "l'essai, sans rien savoir des vôtres.",
        "« Jour 2 » : le texte répondu le jour 2, deviné le jour 3, révélé le jour 4. « Jour 0 » : la veille de "
        "votre arrivée.",
    ])
    r = d["histoire"]["tirage"]
    P.append({"blocs": [
        afficher("Les treize semaines d'avant votre arrivée ont été calculées avec les mêmes règles, sur des textes "
                 "sans titre ni mots : pour chacun, seulement une tension, la valeur qu'il faisait passer devant "
                 "l'autre, et quatre raisons réduites à leur côté et à la valeur qu'elles servaient. Une seule "
                 f"exception : « {titre86} », la surprise de la semaine que vous avez vue en arrivant. Sur ce texte, "
                 "deux personnages ont répondu exprès contre leur profil, pour qu'il devienne cette surprise."),
        afficher("Pour ressembler à un cercle de trois mois, cette histoire devait remplir des conditions écrites "
                 "avant l'essai : des curseurs nets pour chacun, des tempéraments, cette surprise de la semaine, des "
                 "titres variés. Le calcul a été refait, tirage après tirage, jusqu'au premier qui les remplissait. "
                 "Tirage retenu : ") + f"{r}."], "titre": afficher("Avant votre arrivée")})
    # Panneau 4
    textes_porteur = list(ENTREE) + [str(k) for k in range(1, 15)]
    n = {T: sum(1 for t in textes_porteur if d["textes"][t]["tension"] == T) for T in TENSIONS}
    fermees = [T for T in TENSIONS if n[T] * f < 10]
    b2 = (f"En tout, entrée et dernier jour compris, vous aviez {n['S']} textes sur Sécurité ou Liberté individuelle, "
          f"{n['P']} sur Précaution ou Innovation, {n['T']} sur Tradition ou Changement et {n['L']} sur Local ou "
          f"National, entrée comprise. Un curseur devenait net quand ses réponses pesaient au moins {seuil} : une "
          "réponse favorable ou défavorable avec un argument attendu pèse 1 ; avec un argument pratique ou aucune "
          "des quatre raisons, 1/2 ; avec un argument au nom de l'autre valeur, 0 ; Neutre, 0. Avec si peu de "
          "réponses, une seule qui pèse 0 pouvait suffire à l'empêcher.")
    if fermees:
        b2 += f" Sur {liste(nom_tension(T) for T in fermees)}, votre curseur ne pouvait pas devenir net."
    possibles = []
    for k in (5, 6, 12, 13):
        T = d["textes"][str(k)]["tension"]
        avant = [t for t in list(ENTREE) + [str(i) for i in range(1, k)] if d["textes"][t]["tension"] == T]
        if len(avant) * f >= 10:
            possibles.append(k)
    if len(possibles) == 1:
        k = possibles[0]
        pdc = (f"Le Pas de Côté ne vous était possible qu'à la révélation du jour {k + 2}, sur "
               f"{nom_tension(d['textes'][str(k)]['tension'])}, et seulement si votre curseur y était déjà net.")
    elif possibles:
        pdc = (f"Le Pas de Côté ne vous était possible qu'à la révélation des jours {liste(str(k + 2) for k in possibles)}, "
               "chacun sur la tension de son texte, et seulement si votre curseur y était déjà net.")
    else:
        pdc = "Le Pas de Côté vous était impossible : aucun de vos curseurs ne pouvait être net assez tôt."
    jours_dev = [j for j in range(1, 16) if cal[j]["deviner_porteur"]]
    cartes = {j: len(mo.cartes_servies("porteur", j)["cartes"]) for j in jours_dev}
    sem = {s["numero"]: s for s in d["semaines"]}
    pts = {w: sum(c for j, c in cartes.items() if sem[w]["premier_jour"] <= j + 1 <= sem[w]["dernier_jour"])
           for w in (14, 15)}
    blocs4 = [f"Votre portrait comptait chacune de vos réponses {trois} fois ; le portrait de chaque personnage "
              "comptait chacune des siennes une fois ; et avec quatre tensions seulement, chacune revenait deux fois "
              f"plus souvent que dans le jeu. Votre portrait avançait donc environ {six} fois plus vite.", b2, pdc,
              "Les sauts vous ont fermé un titre et en ont presque fermé un autre. Vos cartes ne pouvaient être "
              "révélées que trois jours la première semaine et un jour la seconde ; celles des personnages, presque "
              "chaque jour. Le Sans-Faute demande des cartes révélées au moins cinq jours de la semaine : il vous était "
              "impossible. Le Devin va à qui marque le plus de points dans la semaine : vous pouviez en marquer au plus "
              f"{MOTS[pts[14]]} la première semaine et {MOTS[pts[15]]} la seconde, quand un personnage pouvait en "
              "marquer jusqu'à trois par jour."]
    servis = list(ENTREE) + [str(k) for k in range(0, 15)]
    supp = [t for t in servis if d["textes"][t]["titre"].startswith("Supprimer")]
    if len(supp) >= 2 and all(d["textes"][t]["vote"]["issue"] == "rejete" for t in supp):
        blocs4.append("Tous les textes dont le titre commençait par « Supprimer » ont été rejetés : ce premier mot "
                      "laissait deviner le vote.")
    panneau("Ce que l'essai changeait pour vous", blocs4)
    # Panneau 5 : tempéraments au jour 14, réponses du porteur prises au journal
    ouvertes = set()
    if journal is not None:
        for k, x in journal["jours"].items():
            c = x["coups"]
            if c["deviner"] is not None:
                ouvertes.add(int(k))
            if int(k) <= 14 and c["reponse"] is not None:
                mo.reponses[k]["porteur"] = dict(c["reponse"])
    temps = mo.temperaments(14)
    for p in PERSONNAGES:
        pers = d["personnages"][p]
        blocs = [FIXES[p]]
        for T in TENSIONS:
            pos = pers["profil"][T]["position"]
            lect = "au milieu" if 41 <= pos <= 59 else (POLES[T][1] if pos > 50 else POLES[T][0])
            blocs.append(f"{POLES[T][0]} ou {POLES[T][1]} : {lect} ({pos} sur 100, fermeté {pers['profil'][T]['fermete']}).")
        atyp = [o for o in d["reponses_atypiques"][p] if o["texte"].isdigit() and int(o["texte"]) <= 13]
        if not atyp:
            blocs.append("Réponses contre son profil pendant l'essai : aucune.")
        else:
            blocs.append("Réponses contre son profil pendant l'essai :")
            for o in atyp:
                t = o["texte"]
                k = int(t)
                rep = d["reponses"][t][p]
                blocs.append(f"Jour {k} · {d['textes'][t]['titre']}")
                if rep["raison"] == "aucune":
                    blocs.append(f"{LIBELLE_NIVEAU[rep['niveau']]} · aucune des quatre raisons")
                else:
                    txt = d["textes"][t]["considerations"][rep["raison"] - 1]["texte"]
                    blocs.append(f"{LIBELLE_NIVEAU[rep['niveau']]} · « {txt} »")
                fin = []
                if o["cote_tire"] is not None:
                    fin.append("Son profil donnait Neutre.")
                j1 = k + 1
                if j1 in ouvertes and cal.get(j1, {}).get("deviner_porteur") and \
                        any(c["auteur"] == p for c in mo.cartes_servies("porteur", j1)["cartes"]):
                    fin.append(f"Vous l'aviez à deviner le jour {j1}.")
                if fin:
                    blocs.append(" ".join(fin))
        abs_e = [t for t in d["absences"][p] if t.isdigit() and int(t) <= 13]
        blocs.append(f"Jours sans jouer pendant l'essai : {liste(abs_e) if abs_e else 'aucun'}.")
        a = sum(1 for o in d["reponses_atypiques"][p] if o["texte"].startswith("H"))
        m = sum(1 for t in d["absences"][p] if t.startswith("H"))
        blocs.append(f"Avant votre arrivée : {a} {'réponse' if a in (0, 1) else 'réponses'} contre son profil sur "
                     f"{90 - m}, et {pluriel(m, 'jour')} sans jouer sur 90.")
        ts = temps[p]["temperaments"]
        if not ts:
            blocs.append("Ses tempéraments au second dimanche : aucun.")
        else:
            blocs.append("Ses tempéraments au second dimanche, sur les huit semaines précédentes :")
            blocs.extend(TEMPS[x] for x in ts)
        panneau(f"{p}, {pers['age']} ans · {pers['metier']}, {pers['ville']}", blocs)
    phrase_pub = ("Si vous le voulez, comparez-la, ligne par ligne, avec celle publiée dans la conversation le "
                  f"{date_pub or '{date}'} à {heure_pub or '{heure}'} : elles doivent être identiques. Si un seul "
                  "caractère diffère, dites-le dans la conversation.")
    P.append({"blocs": [afficher("Empreinte du fichier scellé :"), sha256_hex(octets), afficher(phrase_pub),
                        afficher("Graine :"), d["graine"], afficher("Tirage retenu pour l'histoire :"), str(r),
                        afficher("Fichier scellé :"), nom_fichier or "{fichier}"],
              "titre": afficher("Pour le contrôle")})
    panneau(None, ["Les règles et le lot du second essai sont dans « a-ne-pas-ouvrir-2 » : vous pouvez maintenant "
                   "l'ouvrir.", "Si votre carnet est bien dans la conversation, vous pouvez tout effacer."])
    return {"empreinte_scelle": sha256_hex(octets), "format": "elenchos-essai-devoilement",
            "panneaux": P, "partie": None if journal is None else journal["partie"]["id"], "version": 1}
