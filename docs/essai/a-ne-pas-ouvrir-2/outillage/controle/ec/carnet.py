"""Texte du carnet du second essai (simulation-2, §8.12 ; règles de forme du §8.12 de
simulation.md, inchangées) et vérification de son gabarit (contrôle 12).

Le carnet n'applique que la règle 1 du §7.8 (apostrophe U+2019). Les lectures du
gabarit que la spécification laisse ouvertes sont dans QUESTIONS.md (Q-K…)."""

import re
import unicodedata

from .heure import lire_instant, date_carnet

A = "’"

LIBELLES = {
    "moment": {"defi": "Le défi de Valentin", "revelation": "La révélation", "titres": "Les titres",
               "phrase_semaine": "Ma phrase de la semaine", "deviner": "Deviner", "donner_avis": "Donner mon avis",
               "phrase_jour": "Ma phrase du jour", "aucun": "Aucun"},
    "saut_clair": {"non": "Non", "en_partie": "En partie", "oui": "Oui"},
    "hesite": {"deviner": "Deviner", "repondre": "Répondre", "revelation": "La révélation",
               "avis_cercle": f"L{A}avis du cercle", "titres": "Les titres", "cercle": "Le Cercle",
               "portrait": "Mon portrait", "saut": "Le saut", "ailleurs": "Ailleurs", "nulle_part": "Nulle part"},
    "moment_semaine": {"revelation": "La révélation", "avis_cercle": f"L{A}avis du cercle", "titres": "Les titres",
                       "phrase_semaine": "Ma phrase de la semaine", "deviner": "Deviner",
                       "donner_avis": "Donner mon avis", "phrase_jour": "Ma phrase du jour", "cercle": "Le Cercle",
                       "portrait": "Mon portrait", "aucun": "Aucun"},
    "raison": {"pas_amuse": f"Je ne m{A}amuse pas", "pas_compris": "Je ne comprends pas tout",
               "pas_le_temps": f"Je n{A}ai pas le temps", "vu_assez": f"J{A}ai vu ce que je voulais voir",
               "autre": "Autre raison"},
    "f2": {"de_plus_en_plus": "De plus en plus amusant", "toujours_autant": "Toujours aussi amusant",
           "de_moins_en_moins": "De moins en moins amusant", "jamais": "Jamais amusant"},
    "servi": {"souvenir": "Le souvenir du premier essai", "defi": "Le défi de Valentin",
              "revelations": "Les révélations", "cercle": f"Le Cercle ou l{A}écran d{A}un proche",
              "rien": "Rien de précis"},
    "regle": {"pas_claire": "Pas claire", "claire_etrange": "Claire, mais étrange", "claire": "Claire",
              "pas_lue": f"Je ne l{A}ai pas lue"},
    "avis": {"sans_apprendre": f"Je le lisais sans qu{A}il m{A}apprenne grand-chose",
             "apprenait": f"Il m{A}apprenait quelque chose sur le cercle", "pas_lu": "Je ne le lisais pas"},
    "raisons": {"pas_plus": f"Pas plus nuancées qu{A}au premier essai", "un_peu": "Un peu plus nuancées",
                "nettement": "Nettement plus nuancées"},
    "portrait": {"ressemblait_pas": "Il ne me ressemblait pas", "un_peu": "Il me ressemblait un peu",
                 "ressemblait": "Il me ressemblait", "pas_regarde": f"Je ne l{A}ai pas regardé"},
    "barre": {"pas_remarquee": f"Je ne l{A}ai pas remarquée", "sans_savoir": f"Remarquée, sans savoir ce qu{A}elle mesurait",
              "comprise": "Remarquée et comprise"},
    "suspense": {"sans": "Sans suspense", "un_peu": "Avec un peu de suspense", "vrai": "Avec un vrai suspense"},
    "compte": {"apple": "Continuer avec Apple", "google": "Continuer avec Google",
               "email_valider": "Recevoir un code par e-mail, puis Valider",
               "email_plus_tard": "Recevoir un code par e-mail, puis Plus tard"},
}
VERDICTS = {"juste_et_raison": "juste avec la raison", "juste": "juste",
            "jumeau_et_raison": "juste par la même réponse avec la raison",
            "jumeau": "juste par la même réponse", "faux": "faux", "passe": "passé"}
QUESTIONS_FIN = [
    ("servi", "Ce qui vous a le plus servi pour deviner"),
    ("regle", "La règle écrite dans Deviner vous a paru"),
    ("avis", f"L{A}avis du cercle, à la révélation"),
    ("raisons", "Les quatre raisons, au moment de répondre"),
    ("portrait", "Votre portrait, au second dimanche"),
    ("barre", "La barre du portrait"),
    ("suspense", "Avec des textes rejetés, « Et l’Assemblée ? » était"),
]
RE_DUREE = re.compile(r"\b(?:0|[1-9][0-9]*) min [0-5][0-9] s\b")
NOMS_SAUTS = {1: "Premier saut · jeudi à samedi", 2: "Second saut · lundi à samedi"}
ORDINAL = {1: "premier", 2: "second"}


def duree(d):
    return f"{d // 60} min {d % 60:02d} s"


def enumerer(xs):
    if len(xs) == 1:
        return xs[0]
    return ", ".join(xs[:-1]) + " et " + xs[-1]


def liste_noms(membres):
    noms = ["vous" if m == "porteur" else m for m in membres]
    return enumerer(noms) if noms else "pas attribué"


def entete(etat, jour=None, raison=None, saut=None):
    """etat : « cloture », « arret » ou « copie » ; saut : 1, 2 ou None ; jour : k, ou
    « entree » pendant l'entrée."""
    L = ["Carnet du second essai Elenchos",
         "Ce carnet ne contient ni vos avis ni leurs raisons, ni vos phrases du jour ou de la semaine, "
         f"ni votre portrait, ni votre pseudo, ni l{A}avis du cercle.",
         f"Les titres et les chiffres « Sur tout l{A}essai » dépendent en partie de vos avis, mais "
         "seulement en cumul, jamais texte par texte."]
    if etat == "cloture":
        L.append(f"Essai mené jusqu{A}à la clôture.")
        return L
    if jour == "entree":
        fin = f"pendant l{A}entrée."
    elif saut is not None:
        fin = f"pendant le {ORDINAL[saut]} saut."
    else:
        fin = f"au jour {jour}."
    if etat == "arret":
        L.append(f"Essai arrêté {fin}")
        L.append(f"Raison de l{A}arrêt : {LIBELLES['raison'][raison] if raison else 'pas de réponse'}.")
    else:
        L.append(f"Essai en cours : carnet copié {fin}")
    return L


def bloc_jour(j, type_jour, nom_jour, ouverture, versions, mesures, coups):
    """Lignes du bloc d'un jour (jour joué, point de saut, clôture). mesures : forme trace."""
    cloture = type_jour == "cloture"
    point = type_jour == "joue_puis_saut"
    joue = type_jour == "joue"
    L = ["Clôture" if cloture else f"Jour {j} · {nom_jour}"]
    local, _, _ = lire_instant(ouverture)
    L.append(f"Ouverture : {date_carnet(local)}, entre {local.hour}h00 et {local.hour}h59.")
    if j > 1 and not point and mesures["jours_ecoules"] is not None:
        L.append(f"Jours écoulés depuis l{A}ouverture précédente : {mesures['jours_ecoules']}.")
    L.append(f"Version de la page : {', puis '.join(str(v) for v in versions)}.")
    suite = []
    if mesures["duree_entree"] is not None:
        suite.append(f"{duree(mesures['duree_entree'])} pour l{A}entrée")
    if mesures["duree_deviner"] is not None:
        suite.append(f"{duree(mesures['duree_deviner'])} pour deviner")
    if mesures["duree_repondre"] is not None:
        suite.append(f"{duree(mesures['duree_repondre'])} pour répondre")
    L.append(f"Durée : {duree(mesures['duree_seance'])}" + (", dont " + enumerer(suite) if suite else "") + ".")
    entree_finie = j != 1 or coups["compte"] is not None
    if j == 1 and mesures["entree_verdicts"]:
        L.append("Entrée : paris sur Valentin " + ", ".join(mesures["entree_verdicts"]) + ".")
    if j == 1 and coups["compte"] is not None:
        L.append(f"Compte : {LIBELLES['compte'][coups['compte']]}.")
    if joue and entree_finie:
        L.append(f"Boutons touchés : Relire {mesures['relire']} fois, Passer {mesures['passer']} fois.")
    vs = mesures["revelation_verdicts"]
    if vs is not None:
        if not vs:
            L.append("Révélation : aucune carte.")
        else:
            l = "Révélation : " + ", ".join(VERDICTS[v] for v in vs) + "."
            if mesures["revelation_raison_tentee"] is not None:
                l += " Raison cachée : " + ("tentée" if mesures["revelation_raison_tentee"] else "pas tentée") + "."
            L.append(l)
    if cloture:
        return L
    if mesures["revelation_rouverte"] is not None:
        L.append(f"Révélation rouverte : {mesures['revelation_rouverte']} fois.")
    o = mesures["ouvert"]
    L.append(f"Ouvert : Le Cercle {o['cercle']} fois, écran d{A}un proche {o['proche']} fois, Moi {o['moi']} fois, "
             f"fiche « Qui est qui » {o['qui_est_qui']} fois.")
    if mesures["pendant_deviner"] is not None:
        p = mesures["pendant_deviner"]
        L.append(f"Pendant Deviner : Le Cercle {p['cercle']} fois, écran d{A}un proche {p['proche']} fois.")
    if joue and entree_finie and mesures["abandon"] is not None:
        L.append(f"Journée abandonnée : {'oui' if mesures['abandon'] else 'non'}.")
    q = coups["carnet"]
    if joue and q["moment"] is not None:
        L.append(f"Votre moment préféré : {LIBELLES['moment'][q['moment']]}.")
    return L


def bloc_saut(numero, mesures, annuler, textes_atteints):
    L = [NOMS_SAUTS[numero]]
    L.append(f"Durée : {duree(mesures['duree_saut'] or 0)}, dont {duree(mesures['duree_page'] or 0)} sur la page du saut.")
    ds = (mesures["durees_textes"] or [])[:textes_atteints]
    if ds:
        L.append("Pour répondre : " + ", ".join(duree(x) for x in ds) + ".")
    L.append(f"Boutons touchés : Annuler {annuler} fois.")
    o = mesures["ouvert"]
    L.append(f"Ouvert : Le Cercle {o['cercle']} fois, écran d{A}un proche {o['proche']} fois, Moi {o['moi']} fois, "
             f"fiche « Qui est qui » {o['qui_est_qui']} fois.")
    return L


def bloc_semaine(n, dim, carnet_dimanche):
    L = [f"Semaine {n}"]
    L.append(f"Le Sans-Faute : {liste_noms(dim['sans_faute'])}.")
    t = dim["devin"]["titulaire"]
    L.append(f"Le Devin : {liste_noms([t] if t else [])}.")
    t = dim["mystere"]["titulaire"]
    L.append(f"Le Mystère : {liste_noms([t] if t else [])}.")
    L.append(f"Le Fidèle : {liste_noms(dim['fidele']['titulaires'])}.")
    q = carnet_dimanche
    if n == 1:
        v = q["saut_clair"]
        L.append(f"Ce que le jeu a fait pendant le saut, c{A}était clair : "
                 f"{LIBELLES['saut_clair'][v] if v else 'pas de réponse'}.")
    h = q["hesite"]
    L.append("Où vous avez hésité cette semaine : "
             + (", ".join(LIBELLES["hesite"][x] for x in h) if h else "pas de réponse") + ".")
    v = q["moment_semaine"]
    L.append(f"Cette semaine, votre moment préféré : {LIBELLES['moment_semaine'][v] if v else 'pas de réponse'}.")
    return L


def bloc_essai(ag):
    def compte(x):
        return "pas de chiffre" if x is None else f"{x['justes']} fois sur {x['total']}"
    n = ag["titres_tires_au_sort"]
    return [
        f"Sur tout l{A}essai",
        f"Quand un personnage devinait la réponse d{A}un autre personnage, il a trouvé son auteur : "
        f"{compte(ag['justesse_personnages_entre_eux'])}.",
        f"Quand un personnage devinait l{A}une de vos réponses, il a trouvé que c{A}était vous : "
        f"{compte(ag['justesse_personnages_sur_porteur'])}.",
        f"Titres attribués par tirage au sort, faute de départage : {'pas de chiffre' if n is None else n}.",
    ]


def bloc_fin(fin, cloture):
    L = ["Questions de fin"]
    f2 = fin["f2"]
    L.append(f"{f'Au fil de l{A}essai' if cloture else f'Jusqu{A}ici'}, deviner était : "
             f"{LIBELLES['f2'][f2] if f2 else 'pas de réponse'}.")
    if cloture:
        for cle, intitule in QUESTIONS_FIN:
            v = fin[cle]
            L.append(f"{intitule} : {LIBELLES[cle][v] if v else 'pas de réponse'}.")
    return L


def assembler(entete_, blocs):
    parties = [entete_] + blocs + [["Fin du carnet"]]
    return "\n\n".join("\n".join(b) for b in parties)


def masquer_durees(texte):
    return RE_DUREE.sub("‹durée›", texte)


def verifier_forme(texte, pseudo=None):
    """Règles de forme du §8.12 (premier essai, inchangées) ; contrôle 12."""
    e = []
    if pseudo and pseudo in texte:
        e.append("le pseudo figure dans le carnet")
    if not texte.endswith("\n\nFin du carnet"):
        e.append("ne finit pas par une ligne vide puis « Fin du carnet » sans retour final")
    if "\r" in texte or "\t" in texte:
        e.append("retour chariot ou tabulation")
    if unicodedata.normalize("NFC", texte) != texte:
        e.append("pas en NFC")
    for n, l in enumerate(texte.split("\n"), 1):
        if l != l.strip(" ") or "  " in l:
            e.append(f"ligne {n} : espace au bord ou double")
        if any(ch.isspace() and ch != " " for ch in l):
            e.append(f"ligne {n} : blanc autre que U+0020")
        if re.match(r"^(?:[-*#>]|[0-9]+\.)", l):
            e.append(f"ligne {n} : commence comme une liste ou un titre")
        if "'" in l:
            e.append(f"ligne {n} : apostrophe droite")
        if "min" in RE_DUREE.sub("", l):
            e.append(f"ligne {n} : « min » hors d'une durée")
    if "\n\n\n" in texte or texte.startswith("\n"):
        e.append("ligne vide en trop")
    return e
