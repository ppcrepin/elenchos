"""Générateur de journaux valides (partie 3.12), pour les tests de propriétés de C.
Ce n'est pas le harnais : il tire des gestes plausibles, que C doit accepter et
rejouer sans erreur."""

import copy
import datetime as dt
import random

import commun  # noqa: F401
from ec.heure import decalage_utc
from ec.jeu import PERSONNAGES, ENTREE, TENSIONS
from ec.journal import choix_q3, verdicts_joueur, faux_entree
from ec.moteur import Partie
from ec.tirage import Tirage, sha256_hex
from ec import canon


def instant(utc):
    dec = decalage_utc(utc)
    loc = utc + dt.timedelta(minutes=dec)
    return loc.strftime("%Y-%m-%dT%H:%M") + ("+02:00" if dec == 120 else "+01:00")


def coups_vides():
    return {"carnet": {"q1": None, "q2": None, "q3": None}, "consentement": None, "deviner": None,
            "entree": None, "pseudo": None, "relire": 0, "reponse": None}


def reponse_hasard(rng):
    return {"niveau": rng.randint(1, 5), "raison": rng.choice([1, 2, 3, 4, "aucune"])}


def journal(scelle, graine_rng, mode="interface", K=15, arret_k=None, reponses=None, sans_reponse=(),
            pid="hasard-001", copies=True, toutes_questions=False):
    """reponses : {texte: réponse} imposées (variantes) ; sans_reponse : textes laissés sans réponse
    après affichage de Répondre."""
    rng = random.Random(graine_rng)
    octets = canon.octets_canoniques(scelle)
    partie = Partie(scelle, Tirage(scelle["graine"]))
    if arret_k is not None:
        K = arret_k
    utc = dt.datetime(2026, 10, 18, 16, 5)
    seances = []
    copies_l = []
    version = 1
    for k in range(K + 1):
        if k:
            utc += dt.timedelta(days=rng.choice([0, 1, 1, 1, 2]), minutes=rng.randint(0, 600))
        c = coups_vides()
        etapes = None
        dev_affiche = rep_affiche = False
        if k == 0:
            ent = {}
            for e in ENTREE:
                r = (reponses or {}).get(e) or reponse_hasard(rng)
                ent[e] = {"reponse": r, "pari": rng.randint(1, 5)}
            c["entree"] = ent
            c["consentement"] = True
            c["pseudo"] = "Témoin-b-4821-k"
        valide = True
        if 2 <= k <= 14:
            man = partie.cartes_servies("porteur", k)
            n = len(man["cartes"])
            valide = rng.random() < 0.85 or k == K and arret_k is not None
            if valide:
                libres = list(PERSONNAGES)
                rng.shuffle(libres)
                dv = []
                for carte in man["cartes"]:
                    if rng.random() < 0.15:
                        dv.append({"designe": "passe", "raison": None})
                    else:
                        x = libres.pop()
                        r = rng.choice([1, 2, 3, 4, "aucune", None]) if carte["cachee"] else None
                        dv.append({"designe": x, "raison": r})
                dev_affiche = True
            else:
                dv = [{"designe": None, "raison": None} for _ in range(n)]
                dev_affiche = rng.random() < 0.5
            c["deviner"] = dv
            c["relire"] = rng.randint(0, 2)
        if 1 <= k <= 14:
            if valide:
                rep_affiche = rng.random() < 0.95 or str(k) in sans_reponse
                if rep_affiche and str(k) not in sans_reponse:
                    c["reponse"] = (reponses or {}).get(str(k)) or (reponse_hasard(rng) if rng.random() < 0.92 else None)
            etapes = {"deviner": dev_affiche, "repondre": rep_affiche}
        # carnet du jour
        if k == 0:
            faux = faux_entree(c["entree"], scelle)
        elif k >= 3:
            faux = sum(1 for v in verdicts_joueur(partie.cartes_servies("porteur", k - 1),
                                                  seances[k - 1]["coups"]["deviner"]) if v == "faux")
        else:
            faux = 0
        q = c["carnet"]
        if faux and (toutes_questions or rng.random() < 0.7):
            q["q1"] = rng.choice(["aurais_pu", "ne_pouvais_pas"] + (["les_deux"] if faux >= 2 else []))
        if k < 15 and (k == 0 or (etapes and etapes["repondre"])) and (toutes_questions or rng.random() < 0.8):
            q["q2"] = rng.choice(["premier_coup", "en_relisant", "pas_tout"])
        if k < 15 and (toutes_questions or rng.random() < 0.8):
            q["q3"] = rng.choice(sorted(choix_q3(k, etapes)))
        finie = 1 <= k <= 14 and c["reponse"] is not None and valide
        attente = None
        if finie and rng.random() < 0.9:
            attente = {"lectures": [{"heure": f"{rng.randint(0, 23):02d}:{rng.randint(0, 59):02d}"}
                                    for _ in range(rng.randint(1, 2))]}
        versions = [version]
        if mode == "interface" and rng.random() < 0.08:
            version += 1
            versions.append(version)
        s = {"k": k, "ouverture": instant(utc), "versions": versions if mode == "interface" else None,
             "etapes": etapes if mode == "interface" else None, "coups": c, "attente": attente}
        seances.append(s)
        if mode == "interface" and copies and rng.random() < 0.1:
            cc = copy.deepcopy(c)
            if cc["deviner"]:
                cc["deviner"] = [{"designe": None, "raison": None} for _ in cc["deviner"]]
            cc["reponse"] = None
            cc["carnet"] = {"q1": None, "q2": None, "q3": None}
            cc["relire"] = min(cc["relire"], 1)
            ce = None
            if etapes is not None:
                ce = {"deviner": etapes["deviner"] and rng.random() < 0.5, "repondre": False}
            copies_l.append({"k": k, "coups": cc, "versions": versions[:1], "etapes": ce})
        # le moteur de C a besoin des réponses pour les manches suivantes : on les pose
        if k == 0:
            for e in ENTREE:
                partie.poser_reponse_porteur(e, c["entree"][e]["reponse"])
        elif k <= 14:
            if 2 <= k:
                partie.jouer_manches(k, lambda m, dv=c["deviner"]: dv)
            partie.poser_reponse_porteur(str(k), c["reponse"])
    def f1():
        return {p: {t: rng.choice(["pole0", "milieu", "pole1", None]) for t in TENSIONS} for p in PERSONNAGES}
    j = {"format": "elenchos-essai-journal", "version": 3, "empreinte_scelle": sha256_hex(octets),
         "partie": {"id": pid, "mode": mode, "graine": "0123456789abcdef" if pid.startswith("hasard") else None},
         "seances": seances, "copies": copies_l if mode == "interface" else [],
         "arret": None, "fin": None}
    if K == 15 and arret_k is None:
        j["fin"] = {"f2": rng.choice(["de_plus_en_plus", "jamais", None]), "f1": f1()}
    else:
        j["arret"] = {"k": K, "raison": rng.choice(["pas_amuse", "vu_assez", None]),
                      "f2": rng.choice(["toujours_autant", None]) if K >= 3 else None,
                      "f1": (f1() if rng.random() < 0.6 else None) if K >= 3 else None}
    return j


def durees(j, rng_graine=0):
    rng = random.Random(rng_graine)

    def un(k, et):
        return {"k": k, "duree_seance": rng.randint(5, 4000),
                "duree_deviner": rng.randint(1, 600) if et and et["deviner"] else None,
                "duree_repondre": rng.randint(1, 600) if et and et["repondre"] else None}
    return {"format": "elenchos-essai-durees", "version": 1, "partie": j["partie"]["id"],
            "seances": [un(s["k"], s["etapes"]) for s in j["seances"]],
            "copies": [un(c["k"], c["etapes"]) for c in j["copies"]]}
